/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../dao/cn_transaction_dao',
    '../../dao/cn_vat_customer_dao',
    '../../dao/cn_vat_dao',
    '../../lib/commons'
],

function(transDao, customerDao, vatDao, commons) {

    function validatePageFields(curRecord, cacheMessage) {
        var msgs = ''
        var msgTaxpayer = checkTaxpayer(curRecord, cacheMessage); // Need Lists -> Customers (View) permission

        msgs = appendMsg(msgs, msgTaxpayer);
        var msgDocNumber = checkDocNumber(curRecord, cacheMessage); // Need no more

        msgs = appendMsg(msgs, msgDocNumber);

        var msgSheetNumber = checkSheetNumber(curRecord, cacheMessage);
        msgs = appendMsg(msgs, msgSheetNumber);
        return msgs;
    }

    function appendMsg(msgs, newMsg) {
        if (!commons.makecertain(newMsg)) {
            return msgs;
        }
        return msgs === ''
            ? newMsg : msgs + '<br/>' + newMsg;
    }
    
    function checkCNVATStatus(curRecord, cacheMessage) {
        var order = curRecord;
        var ids = [];
        var transID = order.id;
        ids.push(transID);
        var results = vatDao.getVATByRecId(ids);
        var warningMsg = null;
        if(results.length > 0){
        var transactionType = order.getValue('type');
        if (transactionType === 'custinvc' || transactionType === 'cashsale' || transactionType === 'custcred' || transactionType === 'cashrfnd') {
                warningMsg = cacheMessage.warningMessage.invoiceEditWarning;
        }
        }
        
        return warningMsg;
    }

    function checkSheetNumber(curRecord, cacheMessage) {

        var newSheetNumber = curRecord.getValue("custbody_cn_info_sheet_number");
        //not mandatory 
        if (!commons.makesure(newSheetNumber))
            return null;

        if (newSheetNumber.length !== 16) {
            return cacheMessage.errorMessage.invalidSheetNo;
        }

        return null;
    }
    function checkDocNumber(curRecord, cacheMessage) {
        var transactionType = curRecord.getValue('type');
        var createdfrom = curRecord.getValue('createdfrom');
        if (transactionType === 'cashrfnd' && !commons.makecertain(createdfrom)) {
            var customerId = curRecord.getValue('entity');

            createdfrom = curRecord.getValue('custbody_cn_vat_createdfrom');

            //pass this check if nothing entered
            if (createdfrom === '' || customerId ==='') {
                return null;
            }
            try {
                var cashSaleRs = fetchIdByDocNum(customerId, createdfrom);
                if (!commons.makecertain(cashSaleRs)) {
                    return cacheMessage.errorMessage.invalidCashSale;//put message here, The cash sale number is not correct 
                }

                if (commons.makecertain(createdfrom)) {
                    var cashRefundRs = validateCreatedFrom(customerId, cashSaleRs, createdfrom, curRecord.id);
                    if (cashRefundRs === false) {
                        return cacheMessage.errorMessage.invalidCashRefund;//put message here, The cash sale number has already refund
                    } else {
                        curRecord.setValue({
                            fieldId: 'custbody_cn_vat_createdfrom_id',
                            value: cashSaleRs
                        });
                        return null;
                    }
                }
            } catch (ex) {
                return cacheMessage.errorMessage.invalidCashSale;
            }
        }
    }

    function checkTaxpayer(curRecord, cacheMessage) {
        var transactionType = curRecord.getValue('type');
        if (transactionType === 'cashrfnd' || transactionType === 'custcred' || transactionType === 'custinvc' || transactionType === 'cashsale') {
            var customerId = curRecord.getValue('entity');
            if (customerId === '') {
                return null;
            }
            var invoiceType = curRecord.getText('custbody_cn_vat_invoice_type');
            var customerTaxpayer = fetchCustomerTaxpayer(customerId);
            if (commons.makecertain(customerTaxpayer) && customerTaxpayer === cacheMessage.fieldLabel.smalltaxpayer) {
                if (invoiceType === cacheMessage.fieldLabel.specialinvoice) {
                    return cacheMessage.errorMessage.invalidInvoiceType;
                } else {
                    return null
                }
            } else {
                return null;
            }
        }

    }

    /**
     * @desc validate createdFrom on cash refund UI.
     * @param {Object} [customerId] - customer ID
     * @param {Object} [docnum] - document number
     * @param {Object} [createdFrom] - entered createdFrom
     * @return true/false
     */
    function validateCreatedFrom(customerId, docnum, createdFrom, recordId) {

        //check cash refund is existed or not .created from
        var cashRefundRs = transDao.fetchMLCashTransByDocNo(customerId, 'CashRfnd', docnum, 'T');//searchType, docNo, searchfor
        log.debug('cashRefundRs', 'docnum,T');
        if (commons.makecertain(cashRefundRs)) {
            var cashRefundId = cashRefundRs[0].id;
            if (cashRefundId !== recordId) {
                return false;// already used id
            }
        }

        //check cash refund is existed or not. custom field created from
        var cashRefundCustFieldRs = transDao.fetchMLCashTransByDocNo(customerId, 'CashRfnd', createdFrom, 'F');//searchType, docNo, searchfor
        if (commons.makecertain(cashRefundCustFieldRs)) {
            var cashRefundCustFieldId = cashRefundCustFieldRs[0].id;
            if (cashRefundCustFieldId !== recordId) {
                return false;// already used id
            }
        }
        return true;
    }

    //check cash sales is existed or not
    function fetchIdByDocNum(customerId, createdFrom) {
        var rs = transDao.fetchMLCashTransByDocNo(customerId, 'CashSale', createdFrom, '');
        var cashSalesId;
        if (commons.makecertain(rs)) {
            cashSalesId = rs[0].id;
        }
        return cashSalesId;
    }

    function fetchCustomerTaxpayer(customerId) {
        var customerRs = customerDao.fetchCustomersById(customerId);
        var customerTaxpayer;
        if (commons.makecertain(customerRs)) {
            customerTaxpayer = customerRs[0].getText('custentity_cn_vat_taxpayer_types');
        }

        return customerTaxpayer;
    }

    return {
        validatePageFields: validatePageFields,
        checkSheetNumber: checkSheetNumber,
        checkDocNumber: checkDocNumber,
        checkTaxpayer: checkTaxpayer,
        checkCNVATStatus: checkCNVATStatus
    };

});
