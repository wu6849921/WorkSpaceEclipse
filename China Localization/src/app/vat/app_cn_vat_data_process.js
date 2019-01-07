/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../dao/helper/search_helper',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_record',
    '../../lib/wrapper/ns_wrapper_runtime',
    './app_cn_vat_data_sort',
    './app_cn_vat_rl_data',
    '../../lib/commons',
    './app_cn_vat_label_parser',
    '../../dao/cn_item_dao'
],

function(helper, formatter, record, runtime, dataSort, rlData, commons, labelParser, itemDao) {
    var _MEMO_INFO = '\u9500\u552e\u6210\u672c';
    var _labels = labelParser.loadResourceFile();
    var excludeItemTypes = {
        Discount: record.Type.DISCOUNT_ITEM,
        Description: record.Type.DESCRIPTION_ITEM,
        Markup: record.Type.MARKUP_ITEM,
        Subtotal: record.Type.SUBTOTAL_ITEM,
        Expense: "expenseitem",
        Group: record.Type.ITEM_GROUP,
        EndGroup: record.Type.ITEM_GROUP,
        Payment: record.Type.PAYMENT_ITEM,
        GiftCert: record.Type.GIFT_CERTIFICATE_ITEM,
        TaxItem: record.Type.SALES_TAX_ITEM

    };
    var CUSTOMER_REFERENCE = runtime.isFeatureInEffect('JOBS') ? 'customerMain' : 'customer';
    var columns = {
        isperson: helper.column('isperson').reference(CUSTOMER_REFERENCE).create(), // Is Individual
        lastname: helper.column('lastname').reference(CUSTOMER_REFERENCE).create(),
        middlename: helper.column('middlename').reference(CUSTOMER_REFERENCE).create(),
        firstname: helper.column('firstname').reference(CUSTOMER_REFERENCE).create(),
        companyname: helper.column('companyname').reference(CUSTOMER_REFERENCE).create(), // We pick this as Customer Name for non-personal customer
        address: helper.column('billaddress').reference(CUSTOMER_REFERENCE).create(), // Billing Address
        phone: helper.column('phone').reference(CUSTOMER_REFERENCE).create(),
        taxpayerType: helper.column('custentity_cn_vat_taxpayer_types').reference(CUSTOMER_REFERENCE).create(),
        bankno: helper.column('custentity_bank_account_name').reference(CUSTOMER_REFERENCE).create(),
        vatregnumber: helper.column('vatregnumber').reference(CUSTOMER_REFERENCE).create(), // Customer: Tax Number
        taxrate: helper.column('rate').reference('taxitem').create(),
        invoiceType: helper.column('custbody_cn_vat_invoice_type').create(),
        type: 'type',
        tranid: 'tranid',
        trandate: 'trandate',
        lineid: 'line',
        unit: 'unit',
        iteminternalid: helper.column('internalid').reference('item').create(),
        itemname: helper.column('itemid').reference('item').create(),
        itemdisplayname: helper.column('displayname').reference('item').create(),
        itemmodel: helper.column('custitem_cn_vat_item_model').reference('item').create(),
        itemtype: helper.column('type').reference('item').create(),
        itemid: 'item',
        quantity: 'quantity',
        amount: 'amount',
        discountamount: 'discountamount',
        markupamount: 'markupamount',
        pricelevel: 'pricelevel',
        unitprice: 'rate',
        baseprice: helper.column('baseprice').reference('item').create(),
        splitrule: helper.column('custbody_cn_vat_split_rule').create(),
        currency: helper.column('currency').create(),
        fxamount: helper.column('fxamount').create(),
        memo: helper.column('memo').create()
    }

    var allItems;
    var shipItemFlags = {};

    function processRawVATData(searchResultSet, requestInvoiceType) {
        log.debug('app_cn_vat_data_process', 'searchResultSet: ' + JSON.stringify(searchResultSet));
        if (!commons.makesure(searchResultSet)) {
            return [];
        }

        fetchAllItems(searchResultSet);

        var invoicesObj = {};
        groupSearchResultToInvoiceObj(searchResultSet, invoicesObj);

        processRedLetterData(invoicesObj);

        var ret = dataSort.keySort(toValuesArray(invoicesObj), [
            'internalid'
        ]);

        ret = validateAllInvoices(ret, commons.toNumber(requestInvoiceType));

        log.debug('app_cn_vat_data_process', "ret: " + JSON.stringify(ret));
        return ret;
    }

    function fetchAllItems(searchResultSet) {

        var itemIds = [];
        for (var i = 0; i < searchResultSet.length; i++) {
            var itemInternalId = getSearchResultValue(searchResultSet[i], columns.iteminternalid);
            if (itemIds.indexOf(itemInternalId) < 0) {
                itemIds.push(itemInternalId);
            }
        }

        allItems = itemDao.getItemsByIds(itemIds);
        allItems = JSON.parse(JSON.stringify(allItems));
    }

    function groupSearchResultToInvoiceObj(searchResultSet, invoicesObj) {
        for (var i = 0; i < searchResultSet.length; i++) {
            var result = searchResultSet[i];
            var internalId = result.id;

            if (!isHeaderAlreadyExisted(invoicesObj, internalId)) {
                addNewHeader(invoicesObj, result, internalId);
            } else {
                appendItem(invoicesObj[internalId], result);
            }

        }
    }

    function toValuesArray(obj) {

        var val = [];
        for ( var key in obj) {
            val.push(obj[key]);

        }
        return val;

    }

    function isHeaderAlreadyExisted(invoicesObj, internalId) {
        return commons.makecertain(invoicesObj[internalId]);
    }

    function addNewHeader(invoicesObj, result, internalId) {
        var invoice = parseInvoiceHeader(result, internalId);
        resetShipItemFlag(internalId);
        appendItem(invoice, result);
        invoicesObj[internalId] = invoice;
    }

    function appendItem(invoice, result) {
        var item = parseInvoiceItem(result, invoice.type, invoice.internalid);
        invoice.pushItem(item);
    }


    function validateAllInvoices(invoices, requestInvoiceType) {
        var result = [];
        for (var i = 0; i < invoices.length; i++) {
            var invoice = invoices[i];
            validateInvoice(invoice);
            if (filterInvoiceType(invoice, commons.toNumber(requestInvoiceType))) {
                result.push(invoice);
            }
        }
        return result;
    }

    function filterInvoiceType(singleInvoice, requestInvoiceType) {
        //requestInvoiceType - 0: special, 1: common
        var invoiceType;
        if (!commons.makesure(singleInvoice.invoiceType)) {
            return false;
        }
        invoiceType = singleInvoice.invoiceType === 'Special VAT Invoice' ? 0 : 1;

        return commons.toNumber(requestInvoiceType) === invoiceType;

    }

    function processRedLetterData(invoicesObj) {
        var redLetterIds = [];
        for ( var i in invoicesObj) {
            if (isNegativeInvoiceType(invoicesObj[i].type)) {
                redLetterIds.push(invoicesObj[i].internalid);
            }
        }
        if (redLetterIds.length <= 0) {
            return;
        }
        var rlInfos = rlData.getRLVATData(redLetterIds);
        for (var i = 0; i < redLetterIds.length; i++) {
            var invoice = invoicesObj[redLetterIds[i]];
            var rlInfo = rlInfos[redLetterIds[i]];
            invoice.invoiceType = rlInfo.VATType;
            if (commons.makesure(rlInfo.errorMsg)) {
                invoice.errMsg = invoice.errMsg + rlInfo.errorMsg;
                continue;
            }
            if (invoice.invoiceType !== null && rlInfo.VATCode.length > 0) {
                if (invoice.invoiceType === 'Special VAT Invoice') {
                    invoice.inforSheetNumber = rlInfo.VATCode[0];
                    invoice.remark = _labels.exportfile.specialVATRemark.replace('{SheetNumber}', invoice.inforSheetNumber)
                } else {
                    invoice.VATCode = rlInfo.VATCode[0];
                    invoice.VATNumber = rlInfo.VATNumber[0];
                    invoice.remark = _labels.exportfile.commonVATRemark.replace('{VATCode}', invoice.VATCode).replace('{VATNumber}', invoice.VATNumber)
                }
            }

        }

    }

    function roundToFixed(num, fix) {
        var number = Number(num);
        var sign = number >= 0 ? 1 : -1;
        var factor = Math.pow(10, fix);
        return (sign * (Math.round(Math.abs(number) * factor) / factor)).toFixed(fix);
    }

    function isSpecialVAT(invoice) {

        return invoice.invoiceType === 'Special VAT Invoice' ? true : false;

    }
    /**
     * validate and set error message to invoice.errMsg
     * 
     * @param invoice
     * @returns N/A
     */
    function validateInvoice(invoice) {
        var otherErrors = commons.makesure(invoice.errMsg) ? [
            invoice.errMsg
        ] : [];

        var readOnlyErrors = [];
        readOnlyErrors = readOnlyErrors.concat(validateItems(invoice));
        readOnlyErrors = readOnlyErrors.concat(validateHeader(invoice));
        if (commons.makesure(readOnlyErrors)) {// have could not edit error
            invoice.editable = false;
        }
        invoice.errMsg = otherErrors.concat(readOnlyErrors).join('<br/>');
    }

    /**
     * validate header fields
     * @param invoice
     * @returns  [errorMsgs], [] if no error
     */
    function validateHeader(invoice) {

        var errMsgs = [];
        if (invoice.isperson) {
            return errMsgs;
        }
        var errFields = [];
        if (!commons.makesure(invoice.custaxregno)) {
            errFields.push(_labels.errorMessage.customerTaxRegistrationNumber);
        }
        if (isSpecialVAT(invoice)) {
            if (!commons.makesure(invoice.cusbankno)) {
                errFields.push(_labels.errorMessage.customerBankAccount);
            }
            if (!commons.makesure(invoice.cusaddrphoneno)) {
                errFields.push(_labels.errorMessage.customerAddressandPhoneNumber);
            }
        }

        if (errFields.length > 0) {
            errMsgs.push(_labels.errorMessage.fieldMissing.replace("Field", errFields.join(', ')));
        }
        return errMsgs;

    }

    /**
     * validate invoice items.
     * 
     * @param invoice
     * @returns [errorMsgs], [] if no error
     */
    function validateItems(invoice) {
        var errMsgs = [];
        if (!commons.makesure(invoice.type)) {
            return errMsgs;
        }
        var items = invoice.items;

        var sign = (isNegativeInvoiceType(invoice.type)) ? -1.0 : 1.0;

        errMsgs = errMsgs.concat(validateItem(items, "invalidQuantity", function(item) {
            return item.quantity * sign >= 0 && item.taxexclusiveamt * sign >= 0;
        }));

        errMsgs = errMsgs.concat(validateItem(items, "invalidAmount", function(item) {
            return !commons.makesure(item.discountamt) || sign * (item.taxexclusiveamt - item.discountamt) >= 0;
        }));

        return errMsgs;

    }
    /**
     * call invalidFn on each item to validate. if validationFunction return false, will return error message array.
     * each type of error will be only occur once on return list.
     * 
     * @param items
     * @param errorCode res key of error message.
     * @param validationFunction function to validate. return boolean. return false if invalid.
     * @returns [errorMsg], [] if no error
     */
    function validateItem(items, errorCode, validationFunction) {
        for (var i = 0; i < items.length; i++) {
            if (!validationFunction(items[i])) {
                return [
                    _labels.errorMessage[errorCode]
                ];
            }
        }
        return [];

    }


    function parseInvoiceHeader(searchResult, id) {
        var getValue = getSearchResultValue(searchResult);
        var address = getValue(columns.address);
        var phone = getValue(columns.phone);
        var isperson = getValue(columns.isperson);
        return {
            internalid: id,
            cusname: isperson ? getValue(columns.lastname) + getValue(columns.middlename) + getValue(columns.firstname) : getValue(columns.companyname),
            cusaddrphoneno: isperson ? '' : (address === '' ? phone : formatAddress(address) + ' ' + phone),
            cusbankno: isperson ? '' : getValue(columns.bankno),
            custaxregno: isperson ? '' : getValue(columns.vatregnumber),
            currency: getValue(columns.currency),
            docno: getValue(columns.tranid),
            docdate: formatter.convertDateString(getValue(columns.trandate), 'yyyyMMdd'),
            isperson: getValue(columns.isperson),
            type: getValue(columns.type),
            transType: _labels.tableHeader[getValue(columns.type)],
            itemnameforsales: '',
            approver: '',
            receiver: '',
            sellerbankno: '',
            selleraddrphoneno: '',
            remark: '',
            linequantity: 0,
            invoiceType: {
                '1': 'Special VAT Invoice',
                '2': 'Common VAT Invoice',
                '': ''
            }[getValue(columns.invoiceType).toString() || getValue(columns.taxpayerType).toString()],
            splitrule: {
                '1': 'Split rate',
                '2': 'Split quantity',
                '': ''
            }[getValue(columns.splitrule).toString()],
            inforSheetNumber: '',
            VATCode: '',
            VATNumber: '',
            errMsg: '',
            editable: true,
            status: '',
            items: [],
            lineIds: [],
            pushItem: function(item) {
                if (!commons.makesure(item) || commons.contains(this.lineIds, item.line)) {
                    return;
                }
                this.items.push(item);
                this.lineIds.push(item.line);
                this.linequantity++;
            }
        };

    }


    function parseInvoiceItem(searchResult, invoiceType, internalid) {

        var item = createItemObject(searchResult, invoiceType, internalid);
        if (!commons.makesure(item)) {
            return null;
        }
        reCalculateAmount(item, searchResult, invoiceType);
        log.debug('app_cn_vat_data_process::parseInvoiceItem', 'item ' + JSON.stringify(item));
        return item;
    }


    function createItemObject(searchResult, invoiceType, internalid) {
        var getValue = getSearchResultValue(searchResult);
        var itemType = getValue(columns.itemtype);
        var itemMemo = getValue(columns.memo);

        //filter item by item type ,and item.taxexclusiveamt==0(can filter which memo='Cost of Sales')
        if (commons.makesure(excludeItemTypes[itemType]) || itemMemo === 'Cost of Sales' || itemMemo === _MEMO_INFO) {
            return null;
        }
        processShipItemFlag(itemType, internalid);
        var taxexclusiveamt = Number(roundToFixed(getValue(columns.amount), 2));
        if (!commons.makesure(taxexclusiveamt) || taxexclusiveamt === 0) {
            log.debug('app_cn_vat_data_process', 'skip item, taxexclusiveamt === 0');
            return null;
        }

        var sign = (isNegativeInvoiceType(invoiceType)) ? -1 : 1;

        return {
            internalid: getValue(columns.iteminternalid),
            rawiteminternalid: getValue(columns.iteminternalid),
            line: getValue(columns.lineid),
            name: itemType === 'ShipItem' ? getShipItemNameByInternalId(internalid) : getItemLongName(getValue),
            model: getValue(columns.itemmodel),
            uom: runtime.isFeatureInEffect('UNITSOFMEASURE') ? getValue(columns.unit) : '',
            quantity: (itemType === 'ShipItem' || itemType === 'Payment') ? sign : Number(formatter.toFixed(Number(getValue(columns.quantity)), 6)),
            taxexclusiveamt: itemType === 'ShipItem' ? sign * Math.abs(taxexclusiveamt) : taxexclusiveamt,
            taxrate: formatTaxRate(getValue(columns.taxrate)),
            discountamt: '',
            unitprice: '',
            baseprice: '',
            itemtype: itemType,
            pricelevel: getValue(columns.pricelevel),
            taxdenom: 0,
            taxamt: '',
            discounttaxamt: '',
            discountrate: '',
            pricemethod: ''
        };
    }

    function getItemLongName(getValue) {
        var itemDisplayName = getValue(columns.itemdisplayname);
        return getValue(columns.itemname) + (commons.makesure(itemDisplayName) ? ' ' + itemDisplayName : '');
    }

    /**
     * deal with discount,mark up, price level 
     * re calculate  taxexclusiveamt, discountamt and unitprice  
     * @param item
     * @param searchResult
     * @returns
     */
    function reCalculateAmount(item, searchResult, invoiceType) {
        var getValue = getSearchResultValue(searchResult);
        var unitPrice = getValue(columns.unitprice);
        //        When the price level of the item is Custom, then regard the Unit Price(set by users) as its Base Price 
        var totalBasePrice;
        if (noBasePrice(item)) {
            totalBasePrice = item.taxexclusiveamt;
            item.baseprice = unitPrice;
            item.discountamt = '';
        } else { // Otherwise, try to grab the item's base price
            item.baseprice = calculateBasePrice(searchResult);
            totalBasePrice = Number(item.baseprice) * Number(item.quantity);
        }

        var discountAmt = roundToFixed(Number(getValue(columns.discountamount)), 2);
        discountAmt = Number(roundToFixed(getDiscountAmount(totalBasePrice, item.taxexclusiveamt, discountAmt), 2));
        if (commons.makesure(discountAmt) && Number(discountAmt) !== 0) {
            item.discountamt = discountAmt;
        }

        if (isMarkUp(invoiceType, discountAmt)) {
            totalBasePrice = totalBasePrice - discountAmt;
            item.discountamt = '';
        }
        //        Set Unit Price of the item
        item.unitprice = Number(item.quantity) === 0 ? '' : Number(roundToFixed(Number(totalBasePrice) / Number(item.quantity), 6));
        item.taxexclusiveamt = Number(roundToFixed(totalBasePrice, 2));
        return item;
    }

    function processShipItemFlag(itemType, internalid) {
        if (itemType === 'ShipItem') {
            shipItemFlags[internalid] = shipItemFlags[internalid] + 1;
        }
    }

    function resetShipItemFlag(internalid) {
        shipItemFlags[internalid] = 0;
    }

    function getShipItemNameByInternalId(internalid) {
        //first one is shipping, 2nd is handling
        if (shipItemFlags[internalid] === 1) {
            return _labels.fieldLabel.freight;
        } else if (shipItemFlags[internalid] === 2) {
            return _labels.fieldLabel.handling;
        }
    }

    function calculateBasePrice(searchResult) {
        var getValue = getSearchResultValue(searchResult);
        var itemType = getValue(columns.itemtype);
        var itemInternalId = getValue(columns.iteminternalid);
        var basePrice = 0;
        if (!commons.makesure(allItems)) {
            return basePrice;
        }
        for ( var i in allItems) {
            if (!commons.makesure(allItems[i]) || (allItems[i].id !== itemInternalId)) {
                continue;
            }
            var values = allItems[i]['values'];
            /*
             * base price rule:
             * 1.if multiple-currency is enabled, then price.currency of item must be the currency  of transaction; subsidiary.currency e.g Yuan
             * 2.if multiple-price is enabled,then base price level of item is 1; 
             * 3.if multiple-quantity is enable, then pricing.minimumquantity of item is 0
             * 4.servers item don't can't use  multiple-quantity feature
             * 
             * */
            if (isSameCurrency(searchResult, values) && isDefaultPriceLevel(values) && (noMinQuantity(values) || itemType === 'Service')) {
                if (!runtime.isFeatureInEffect('QUANTITYPRICING') && !runtime.isFeatureInEffect('MULTPRICE')) {
                    if (unitPrice === values['pricing.unitprice']) {
                        basePrice = values['pricing.unitprice'];
                        break;
                    }
                } else {
                    basePrice = values['pricing.unitprice'];
                    break;
                }
            }

        }
        return basePrice;
    }


    function noMinQuantity(values) {
        return (!runtime.isFeatureInEffect('QUANTITYPRICING') || values['pricing.minimumquantity'] === 0 || values['pricing.minimumquantity'] === '0');
    }

    function isSameCurrency(searchResult, values) {
        var currency = getSearchResultText(searchResult, columns.currency);
        return (!runtime.isFeatureInEffect('MULTICURRENCY') || values['pricing.currency'][0].text === currency);
    }

    function isDefaultPriceLevel(values) {
        return (!runtime.isFeatureInEffect('MULTPRICE') || values['pricing.pricelevel'][0].value === 1 || values['pricing.pricelevel'][0].value === '1');
    }

    function noBasePrice(item) {
        return !commons.makesure(item.pricelevel) || item.pricelevel === -1 || item.pricelevel === '-1';
    }

    function isMarkUp(invoiceType, discountAmt) {
        return (isNegativeInvoiceType(invoiceType) && discountAmt > 0) || (isPositiveType(invoiceType) && discountAmt < 0);
    }

    function isPositiveType(invoiceType) {
        return commons.makesure(invoiceType) && (invoiceType === 'CashSale' || invoiceType === 'CustInvc');
    }

    function isNegativeInvoiceType(invoiceType) {
        return commons.makesure(invoiceType) && (invoiceType === 'CustCred' || invoiceType === 'CashRfnd');
    }


    function getSearchResultValue(result, column) {
        var getValueFunction = function(column) {
            var ret = result.getValue(column);
            return (ret === null || ret === undefined) ? '' : ret;
        };
        if (commons.makesure(column)) {
            return getValueFunction(column);
        } else {
            return getValueFunction;
        }
    }

    function getSearchResultText(result, column) {
        var getTextFunction = function(column) {
            var ret = result.getText(column);
            return (ret === null || ret === undefined) ? '' : ret;
        };
        if (commons.makesure(column)) {
            return getTextFunction(column);
        } else {
            return getTextFunction;
        }
    }

    function formatAddress(address) {
        var result = address.replace(/\r/g, '').replace(/\n/g, '');
        return result;
    }

    function formatTaxRate(rateString) {
        var rate = parseFloat(rateString);
        if (isNaN(rate)) {
            return '0';
        } else {
            return rate / 100;
        }
    }


    function getDiscountAmount(basePriceOfItem, beforeTaxAmount, discountAmount) {
        return basePriceOfItem - Number(beforeTaxAmount) + Number(discountAmount);
    }


    return {
        processRawVATData: processRawVATData,
        filterInvoiceType: filterInvoiceType
    };

});
