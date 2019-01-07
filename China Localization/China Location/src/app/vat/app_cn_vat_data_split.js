/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_record',
    '../../lib/wrapper/ns_wrapper_config',
    './app_cn_vat_label_parser',
    '../../constant/constant_cn_vat'
],

function(commons, format, record, config, labelParser,constant) {

    var _labels;

    var _maxAmount;
    var DEFAULT_RULE = '';
    var SPLIT_RATE = 'Split rate';
    var SPLIT_QUANTITY = 'Split quantity';


    /**
     * split all invoices based on original invoices passing from data process result
     * @param oriInvoices
     * @param subsidiaryId
     * @returns
     * new split result invoices array.
     */
    function splitInvoices(oriInvoices, subsidiaryId, salesList) {
        log.debug("vat_data_split:splitInvoices entered. params ", "subsidiaryId: " + subsidiaryId + "salesList: " + salesList);
        if (!commons.makesure(oriInvoices))
            return oriInvoices;

        labelParser.refreshResourceFile();
        _labels = labelParser.loadResourceFile();

        initMaxInvoiceAmount(subsidiaryId);


        parseSignAccordingType(oriInvoices);
        log.debug("vat_data_split:splitInvoices _maxAmount", _maxAmount);

        var rs = [];
        for (var i = 0; i < oriInvoices.length; i++) {
            rs = rs.concat(splitSingleInvoice(oriInvoices[i], salesList));

        }
        parseSignAccordingType(rs);
        return rs;

    }

    function setMaxAmount(amt) {
        _maxAmount = amt;
    }

    function getMaxAmount() {
        return _maxAmount;
    }
    /**
     * if invoice type is red letter(cash refund or credit memo)
     * change  quantity and taxexclusiveamt to nagetive.
     * recover the sigh after split.
     * 
     */
    function parseSignAccordingType(oriInvoices) {

        for (var i = 0; i < oriInvoices.length; i++) {
            var invoice = oriInvoices[i];
            if (invoice.type === 'CustInvc' || invoice.type === 'CashSale') {
                continue;
            }
            var items = oriInvoices[i].items;
            for (var j = 0; j < items.length; j++) {
                items[j].quantity = "" + toNagFloatWithNull(items[j].quantity);
                items[j].taxexclusiveamt = "" + toNagFloatWithNull(items[j].taxexclusiveamt);

                //discountamt is not equal null and 0
                items[j].discountamt = "" + toNagFloatWithNull(items[j].discountamt);
                if (!haveDisount(items[j])) {
                    items[j].discountamt = "";
                }

            }
        }

        log.debug("vat_data_split:parseSignAccordingType oriInvoices", oriInvoices);
    }
    /**
     * main logic to split one vat invoice.
     * 
     * @param oriInvoice
     * @returns
     */
    function splitSingleInvoice(oriInvoice, salesList) {

        log.debug("vat_data_split::splitSingleInvoice oriInvoice", oriInvoice);

        var oriItems = oriInvoice.items;
        var groupItems = [];
        var curr = {
            items: [],
            totalAmount: 0.00
        };

        var invSplitRule = decideSplitRule(oriInvoice);

        if(!commons.makesure(oriItems)){
            return oriInvoice;
        }
        
        for (var i = 0; i < oriItems.length; i++) {

            var oriRealAmount = calOriNumbers(oriItems[i]).realAmount;
            if (oriRealAmount > _maxAmount) {
                moveCurrItemsToResult(groupItems, curr);
                groupItems = groupItems.concat(splitSingleItem(oriItems[i], invSplitRule));
            } else {
                if (curr.totalAmount + oriRealAmount > _maxAmount) {
                    moveCurrItemsToResult(groupItems, curr);
                }
                curr.totalAmount += oriRealAmount;
                curr.items.push(oriItems[i]);
            }
        }

        //last items not exceeds limit
        moveCurrItemsToResult(groupItems, curr);

        log.debug("vat_data_split::splitSingleInvoice groupItems", groupItems);

        groupItems = splitAfterEightLines(groupItems, salesList);

        return attachItemsToInvoice(oriInvoice, groupItems);
    }


    /**
     * split after 8 lines or items
     * @param groupItems
     * @returns result grouped items
     */
    function splitAfterEightLines(groupItems, salesList) {
        var rsArray = [];
        for (var i = 0; i < groupItems.length; i++) {
            splitEightForOneGroup(rsArray, groupItems[i], salesList);
        }

        log.debug("vat_data_split::splitAfterEightLines groupItems after split by 8 lines", rsArray);
        return rsArray;
    }

    function splitEightForOneGroup(rsArray, currItems, salesList) {
        if (!isMoreThanEightLines(currItems)) {
            rsArray.push(currItems);
            return;
        }
        if (!commons.makesure(salesList) || salesList === 0 || salesList === "0") {//is yes
            currItems.itemnameforsales = true;//use items[0] to record itemnameforsales states
            rsArray.push(currItems);
            return;
        }
        var j = 0;
        while (j < currItems.length) {
            var endIndex = findSplitEndIndex(currItems, j);
            rsArray.push(currItems.slice(j, endIndex));
            j = endIndex;
        }
    }


    function isMoreThanEightLines(currItems) {
        if (currItems.length < constant.SPLIT_LINE_LIMIT/2)//line quantity <4, real line quantity <8, continue
        {
            return false;
        }
        var totalRealLineCount = 0;
        for (var i = 0; i < currItems.length; i++) {
            var realCurrLineQuantity = haveDisount(currItems[i]) ? 2 : 1;
            totalRealLineCount += realCurrLineQuantity;
            if (totalRealLineCount > constant.SPLIT_LINE_LIMIT) {
                return true;
            }
        }
        return false;
    }

    /**
     * find actual split line count(for not exceed 8) consider the discount
     * 1 line with discount should be consider as 2 lines.
     * 
     * @param currItems
     * @param j
     * @returns
     */
    function findSplitEndIndex(currItems, startIndex) {
        var endIndex = startIndex, totalRealLineCount = 0;
        while (endIndex < currItems.length) {

            var realCurrLineQuantity = haveDisount(currItems[endIndex]) ? 2 : 1;

            if (totalRealLineCount + realCurrLineQuantity > constant.SPLIT_LINE_LIMIT)
                return endIndex;
            else {
                totalRealLineCount += realCurrLineQuantity;
                endIndex++;
            }
        }
        return endIndex;

    }

    function haveDisount(currItem) {
        if (currItem.discountamt === 0.00 || toNumberWithNull(currItem.discountamt) === 0.00)
            return false;
        return true;

    }
    /**
     * decide split rule for the whole invoice.
     * if rule is default
     *      if any item rate > max amount then split rate
     *      else split quantity
     * else if have override, use override rule
     * 
     * @param oriInvoice
     * @returns
     */
    function decideSplitRule(invoice) {
        if (invoice.splitrule !== DEFAULT_RULE)
            return invoice.splitrule;
        var items = invoice.items;
        for (var i = 0; i < items.length; i++) {
            var rate = toNumberWithNull(items[i].taxexclusiveamt) / toNumberWithNull(items[i].quantity);
            if (rate > _maxAmount)
                return SPLIT_RATE;
        }
        return SPLIT_QUANTITY;
    }

    /**
     * split single item which real tax exclusive amount exceeds max value.
     * 
     * @param oriItem
     * @returns
     * array of grouped items. each item of the array is an array of items belong to one single new invoice.
     * 
     */
    function splitSingleItem(oriItem, splitRule) {
        log.debug("vat_data_split::splitSingleItem oriItem", oriItem);

        var rs = [];
        var nums = calAllSplitNumbers(oriItem, splitRule);


        for (var i = 0; i < nums.lastIndex; i++) {
            rs[i] = createNewItem(oriItem, nums.maxLineAmount, nums.maxLineQuantity, nums.maxLineUnitPrice, nums.maxLineDiscount);
        }
        rs[nums.lastIndex] = createNewItem(oriItem, nums.lastAmount, nums.lastQuantity, nums.lastLineUnitPrice, nums.lastDiscount);

        log.debug("vat_data_split::splitSingleItem after split", rs);
        return rs;
    }



    /**
     * calculate all numbers :
     * max line amount, quantity, discount
     * last line index(of array), amount, quantity, discount
     * 
     * @param oriItem
     * @returns
     */
    function calAllSplitNumbers(oriItem, splitRule) {

        var ori = calOriNumbers(oriItem);

        //count of rows with max amount 
        var maxLineCount = parseInt(ori.realAmount / _maxAmount);

        var isDivisible = (ori.realAmount / _maxAmount) === maxLineCount
        //length of spit result invoices
        var rsLength = isDivisible ? maxLineCount : maxLineCount + 1;

        var maxLineAmount = toNumberWithNull(toFixed(ori.amount / ori.realAmount * _maxAmount, 2));
        var lastAmount = ori.amount - maxLineAmount * (rsLength - 1);

        var maxLineQuantity = ori.quantity;
        var lastQuantity = ori.quantity;
        var maxLineUnitPrice = ori.unitPrice;
        var lastLineUnitPrice = ori.unitPrice;
        if (splitRule === SPLIT_QUANTITY) {
            maxLineQuantity = toNumberWithNull(toFixed(maxLineAmount / ori.amount * ori.quantity, 6));
            lastQuantity = ori.quantity - maxLineQuantity * (rsLength - 1);
        } else {
            maxLineUnitPrice = toFixed(maxLineAmount / maxLineQuantity, 6);
            lastLineUnitPrice = toFixed(lastAmount / lastQuantity, 6);
        }

        var maxLineDiscount = maxLineAmount - _maxAmount;
        var lastDiscount = ori.discount - maxLineDiscount * (rsLength - 1);

        return {
            maxLineAmount: maxLineAmount,
            maxLineQuantity: maxLineQuantity,
            maxLineUnitPrice: maxLineUnitPrice,
            maxLineDiscount: maxLineDiscount,
            lastIndex: rsLength - 1,
            lastAmount: lastAmount,
            lastQuantity: lastQuantity,
            lastLineUnitPrice: lastLineUnitPrice,
            lastDiscount: lastDiscount
        };
    }


    /**
     * calculate original item related numbers.
     * 1. tofloat
     * 2, deal with null value
     * 3. calculate real amount = amount - discount
     * @param oriItem
     * @returns
     * {quantity,amount,discount,realAmount}
     */
    function calOriNumbers(oriItem) {

        var amount = toNumberWithNull(oriItem.taxexclusiveamt);
        var discount = toNumberWithNull(oriItem.discountamt);
        var quantity = toNumberWithNull(oriItem.quantity);
        var unitPrice = toNumberWithNull(oriItem.unitprice);
        return {
            quantity: quantity,
            amount: amount,
            unitPrice: unitPrice,
            discount: discount,
            realAmount: amount - discount
        };
    }

    /**
     * generate the result invoices. 
     * process all grouped items, each item in groupItems will be a new invoice.
     * clone invoices, generate new internal id by index+1, count new linequantity.
     * 
     * @param oriInvoice
     * @param groupItems
     * @returns
     */
    function attachItemsToInvoice(oriInvoice, groupItems) {

        var rs = [];

        for (var i = 0; i < groupItems.length; i++) {
            rs[i] = deepClone(oriInvoice);
            rs[i].items = groupItems[i];
            //add label for auto-splitted invoices                   
            if (groupItems.length > 1){
                var lineSeq = parseInt(i) + 1;
                rs[i].internalid = rs[i].internalid + "-" + lineSeq;
                rs[i].status = constant.STATUS.SPLIT
            }
            rs[i].linequantity = rs[i].items.length;

            if (groupItems[i].itemnameforsales === true){
                rs[i].itemnameforsales = _labels.fieldLabel.itemnameforsales;
            }
            else{
                rs[i].itemnameforsales = "";
            }

        }

        return rs;
    }



    /**
     * add curr items to result, and clear curr.
     * 
     * @param groupItems
     * @param curr
     * @returns
     */
    function moveCurrItemsToResult(groupItems, curr) {
        if (commons.makesure(curr.items))
            groupItems.push(curr.items);
        curr.items = [];
        curr.totalAmount = 0.00;
    }

    /**
     * fixed digit of num.
     * use tricks +-0.000000001 to deal with decimal 4/5 round issue of js.
     * if use original number 1.005 is 1.004999999 and toFixed(2) result is 1.00
     * 
     * @param num num to fix
     * @param digit reserve digits
     * @returns
     */
    function toFixed(num, digit) {

        return format.toFixed(num, digit);
    }



    /**
     * clone and return new item. parse all number to string.
     * 
     * @param oriItem
     * @param newAmount
     * @param newQuantity
     * @param newDiscount
     * @returns
     */
    function createNewItem(oriItem, newAmount, newQuantity, newUnitPrice, newDiscount) {
        var rs = [];

        rs[0] = deepClone(oriItem);

        rs[0].taxexclusiveamt = "" + toNumberWithNull(toFixed(newAmount, 2));
        rs[0].quantity = "" + toNumberWithNull(toFixed(newQuantity, 6));
        rs[0].unitprice = "" + toNumberWithNull(toFixed(newUnitPrice, 6));
        rs[0].discountamt = "" + toNumberWithNull(toFixed(newDiscount, 2));


        if (!haveDisount(rs[0]))
            rs[0].discountamt = "";

        return rs;
    }



    /**
     * change to float. if str is null or empty,return 0.00.
     * @param str
     * @returns
     */
    function toNumberWithNull(str) {
        if (commons.makesure(str)) {
            return commons.toNumber(str);
        }
        return 0.00;
    }

    function toNagFloatWithNull(str) {
        if (commons.makesure(str)){
            return -commons.toNumber(str);
        }
        return 0.00;
    }


    function deepClone(fromObj) {
        return JSON.parse(JSON.stringify(fromObj));
    }


    function initMaxInvoiceAmount(subsidiaryId) {
        var rs = queryMaxInvoiceAmount(subsidiaryId);

        if (commons.makesure(rs))
            _maxAmount = rs;

    }

    function queryMaxInvoiceAmount(subsidiaryId) {

        var filedId = 'custrecord_cn_vat_max_invoice_amount';


        //single instance
        if (subsidiaryId === -1 || subsidiaryId === '-1') {

            var configRecObj = config.load({
                type: config.Type.COMPANY_INFORMATION
            });
            return configRecObj.getValue(filedId);

        }
        var subsidiary = record.load({
            type: record.Type.SUBSIDIARY,
            id: subsidiaryId
        });


        return subsidiary.getValue({
            fieldId: filedId
        });
    }

    return {
        splitInvoices: splitInvoices,
        setMaxAmount: setMaxAmount,
        getMaxAmount: getMaxAmount,
        initMaxInvoiceAmount: initMaxInvoiceAmount,
        decideSplitRule: decideSplitRule
    };

});
