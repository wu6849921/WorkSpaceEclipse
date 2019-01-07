/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */

define(['N/record', 'N/format', 'N/search', 'N/runtime'],
    function (record, format, search, runtime) {
        function _post(context) {
            var responseObject = new Object();
            responseObject.success = false;
            var invoiceId = '';
            try {
                var begin = new Date();
                var soId = context.createdfrom;
                if (isEmpty(soId)) {
                    responseObject.message = "Arguement is missing - createdfrom";
                    var logId = writeLog(context, responseObject);
                    return responseObject;
                }
                soId = getIdByName('returnauthorization', 'tranid', 'RMA-' + context.createdfrom);
                //soId = getIdByExternalId('RMA-' + context.createdfrom, 'returnauthorization');
                if (isEmpty(soId)) {
                    responseObject.message = 'Return authorization can not be located';
                    var logId = writeLog(context, responseObject);
                    return responseObject;
                }
                var tranId = context.tranid;
                var invoiceRec = '';
                invoiceId = getIdByExternalId('CM-' + context.tranid, 'creditmemo');
                var isCreate = isEmpty(invoiceId) ? 'created' : 'updated';
                if (isEmpty(invoiceId)) {
                    invoiceRec = record.transform({
                        fromType: 'returnauthorization',
                        fromId: soId,
                        toType: 'creditmemo'
                    });
                }
                else {
                    var validation = validateCredit(invoiceId);
                    //log.debug({ title: 'validate', details: validation });
                    if (validation.success) invoiceRec = record.load({
                        type: 'creditmemo', id: invoiceId
                    });
                    else {
                        var logId = writeLog(context, validation);
                        return validation;
                    }
                }

                if (context.isdeleted == 'T') {
                    try {
                        record.delete({ type: 'creditmemo', id: invoiceId });
                        responseObject.success = true;
                        responseObject.message = 'Transaction deleted';
                    }
                    catch (ex) {
                        responseObject.success = true;
                        responseObject.message = 'Credit memo cannot be found';
                    }
                    var logId = writeLog(context, responseObject);
                    return responseObject;
                }

                var tranDate = _getValue(invoiceRec, 'trandate');
                var firstDate = getFirstDate(context.trandate);
                if ('Set body fields') {
                    var bizOwner = convertNull(context.custbody_coi_tv_business_owner);
                    var docFormat = convertNull(context.custbody_coi_tv_doc_format);
                    var docNo = convertNull(context.custbody_coi_tv_return_invoice_number);
                    var codeCopy = convertNull(context.custbody_coi_tv_unified_code_copy);
                    var docNoText = convertNull(context.custbody_coi_tv_void_doc_number);
                    _setText(invoiceRec, 'custbody_coi_tv_business_owner', bizOwner);
                    _setText(invoiceRec, 'custbody_coi_tv_doc_format', docFormat);
                    _setValue(invoiceRec, 'custbody_coi_tv_hidden_date_sales', firstDate);
                    _setValue(invoiceRec, 'custbody_coi_tv_unified_code_copy', codeCopy);
                    _setValue(invoiceRec, 'custbody_coi_tv_return_invoice_number', docNo);
                    var docId = getDocNo(invoiceId, docNoText);
                    _setValue(invoiceRec, 'custbody_coi_tv_void_doc_number', docId);
                    _setValue(invoiceRec, 'tranid', 'CM-' + context.tranid);
                    _setValue(invoiceRec, 'externalid', 'CM-' + context.tranid);
                    _setValue(invoiceRec, 'memo', context.memo);
                    context.trandate = stringToDate(context.trandate);
                    if (isEmpty(context.trandate)) {
                        responseObject.message = "Arguement is missing - trandate";
                        var logId = writeLog(context, responseObject);
                        return responseObject;
                    }
                    _setValue(invoiceRec, 'trandate', context.trandate);

                    if (context.location) {
                        var locationId = getIdByExternalId(context.location, 'location');
                        if (isEmpty(locationId)) {
                            soObject.message = "Warehouse can not be located";
                            var logId = writeLog(context, responseObject);
                            return responseObject;
                        }
                        var locRec = record.load({ type: 'location', id: locationId });
                        var subId = locRec.getValue({ fieldId: 'subsidiary' });
                        var subName = locRec.getText({ fieldId: 'subsidiary' });
                        var scriptObj = runtime.getCurrentScript();
                        var jiarui = scriptObj.getParameter({ name: 'custscript_mmy_jiarui_sub' });
                        if (subId == jiarui) context.entity = context.entity + '-A';
                        _setValue(invoiceRec, 'location', locationId);
                    }

                    if (context.department) {
                        var deptId = getIdByName('department', 'custrecord1', context.department);
                        if (isEmpty(deptId)) {
                            var result = {
                                success: false,
                                message: 'Invalid department - ' + context.department
                            };
                            var logId = writeLog(context, result);
                            return result;
                        }
                        _setValue(invoiceRec, 'department', deptId);
                    }
                }

                if ('Set lines, submit' && context.contents) {
                    var items = context.contents;
                    var lineCount = invoiceRec.getLineCount({ sublistId: 'item' });
                    for (var j = lineCount - 1; j >= 0; j--) {
                        var itemIdInRec = _getLineValue(invoiceRec, 'item', 'item', j);
                        var itemFound = false;
                        for (var i = 0; i < items.length; i++) {
                            var itemIdInJSON = items[i].selfid;
                            if (itemIdInJSON == itemIdInRec) {
                                itemFound = true;
                                _setLineValue(invoiceRec, 'item', 'quantity', j, items[i].quantity);
                                _setLineValue(invoiceRec, 'item', 'rate', j, items[i].amount / items[i].quantity);
                                var taxId = getTaxCode(items[i].taxcode);
                                if (taxId) _setLineValue(invoiceRec, 'item', 'taxcode', j, taxId);
                                _setLineValue(invoiceRec, 'item', 'amount', j, items[i].amount);
                                _setLineValue(invoiceRec, 'item', 'tax1amt', j, items[i].tax1amt);
                                //log.debug({title:j+','+i,details:'quantity: '+items[i].quantity});
                            }
                        }
                        if (!itemFound) invoiceRec.removeLine({ sublistId: 'item', line: j });
                    }

                    invoiceId = invoiceRec.save();
                    responseObject.success = true;
                    responseObject.internalid = invoiceId;
                    responseObject.tranid = context.tranid;
                    responseObject.message = context.tranid + ' is ' + isCreate + '.';
                }
                
                responseObject.paymentId = new Array();
                if (context.payments && context.payments.length > 0) {
                    for (var i = 0; i < context.payments.length; i++) {
                        var payRec = record.create({ type: 'customerrefund', isDynamic: true });
                        if ('Refund body fields') {
                            var customerId = invoiceRec.getValue({ fieldId: 'entity' });
                            var arAcct = invoiceRec.getValue({ fieldId: 'account' });
                            var currency = invoiceRec.getValue({ fieldId: 'currency' });
                            var dept = invoiceRec.getValue({ fieldId: 'department' });
                            var locId = invoiceRec.getValue({ fieldId: 'location' });
                            var methodId = context.payments[i].custrecord_pos_method;
                            var refundAmount = context.payments[i].custrecord_pos_payment_amount;
                            var acctId = getIdByName('account', 'number', context.payments[i].account);
                            if (isEmpty(acctId)) {
                                responseObject.message = "Account can not be located";
                                var logId = writeLog(context, responseObject);
                                return responseObject;
                            }

                            payRec.setValue({ fieldId: 'customer', value: customerId });
                            payRec.setValue({ fieldId: 'aracct', value: arAcct });
                            payRec.setValue({ fieldId: 'currency', value: currency });
                            payRec.setValue({ fieldId: 'department', value: dept });
                            payRec.setValue({ fieldId: 'location', value: locId });
                            payRec.setValue({ fieldId: 'trandate', value: tranDate });
                            payRec.setValue({ fieldId: 'account', value: acctId });
                            payRec.setValue({ fieldId: 'paymentmethod', value: methodId });
                            payRec.setValue({ fieldId: 'tranid', value: 'CRFD-' + context.tranid + '-' + i });
                            payRec.setValue({ fieldId: 'externalid', value: 'CRFD-' + context.tranid + '-' + i });
                            //payRec.setText({ fieldId: 'paymentmethod', text: 'Cash' });
                        }

                        var lineCount = payRec.getLineCount({ sublistId: 'apply' });
                        for (var j = 0; j < lineCount; j++) {
                            payRec.selectLine({ sublistId: 'apply', line: j });
                            //var cmIdInLine=payRec.getSublistValue({sublistId:'apply',fieldId:'doc',line:i});
                            var cmIdInLine = payRec.getCurrentSublistValue({ sublistId: 'apply', fieldId: 'doc' });
                            if (cmIdInLine == invoiceId) {
                                //payRec.setSublistValue({sublistId: 'apply', fieldId: 'apply', line: j, value: true});
                                payRec.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'apply', value: true });
                                payRec.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'amount', value: refundAmount });
                            }
                        }

                        responseObject.paymentId.push(payRec.save());
                    }
                }

                var end = new Date();
                responseObject.time = ((end - begin) / 1000).toFixed(2) + 's';
                var logId = writeLog(context, responseObject);
                return responseObject;
            }
            catch (ex) {
                log.debug({ title: '_post', details: ex });
                //record.delete({ type: 'creditmemo', id: invoiceId });
                responseObject.success = false;
                responseObject.message = ex;
                var logId = writeLog(context, responseObject);
                return responseObject;
            }
        }

        function getDocNo(id, DocNo) {
            var names = DocNo.split(',');
            var ids = new Array();
            for (var i = 0; i < names.length; i++) {
                var docId = getIdByName('customrecord_coi_tv_docs_detail', 'name', names[i]);
                if (isEmpty(docId)) return '';
                ids.push(docId);
            }
            return ids;
        }
        function getFirstDate(tranDate) {
            tranDate = new Date(tranDate);
            var firstDate = new Date();
            firstDate.setDate(tranDate.getFullYear());
            firstDate.setDate(tranDate.getMonth() + 1);
            firstDate.setDate(1);
            return firstDate;
        }
        function writeLog(dataIn, response) {
            var scriptObj = runtime.getCurrentScript();
            var scriptId = scriptObj.getParameter({ name: 'custscript_mmy_pos15' });
            var logRec = record.create({ type: 'customrecord_pos_integrationlog' });
            logRec.setValue({ fieldId: 'custrecord_intlog_json', value: JSON.stringify(dataIn) });
            logRec.setValue({ fieldId: 'custrecord_intlog_succeed', value: response.success });
            logRec.setValue({ fieldId: 'custrecord_intlog_scriptname', value: scriptId });
            logRec.setValue({ fieldId: 'custrecord_intlog_apiid', value: 20 });
            var nsURL = 'https://rest.sandbox.netsuite.com/app/site/hosting/restlet.nl?';
            nsURL += 'script=' + scriptId + '&deploy=1';
            logRec.setValue({ fieldId: 'custrecord_intlog_targeturl', value: nsURL });
            logRec.setValue({ fieldId: 'custrecord_intlog_resultjson', value: JSON.stringify(response) });
            var logId = logRec.save();
            log.debug({ title: 'log id', details: 'log id: INTLOG' + logId });
            return logId;
        }
        function validateCredit(soId) {
            if (isEmpty(soId)) return { success: false, message: 'Invalid credit memo id' };
            var filters = new Array();
            filters.push(['applyingtransaction', 'anyof', [soId]]);
            var columns = ['trandate', 'type', 'tranid', 'statusref', 'approvalstatus', 'createdfrom.trandate'];
            var searchObj = search.create({
                type: 'customerrefund', filters: filters, columns: columns
            });
            var searchList = searchObj.run().getRange({ start: 0, end: 1000 });
            if (isEmpty(searchList)) {
                return { success: true, message: 'No related records' };
            }
            //var soRec = record.load({ type: 'salesorder', id: soId });
            for (var i = 0; i < searchList.length; i++) {
                var tranDate = stringToDate(searchList[i].getValue(columns[0]));
                var approvalStatus = searchList[i].getValue(columns[4]);
                var tranId = searchList[i].getValue(columns[2]);
                var recType = searchList[i].recordType;
                var currentDate = new Date();
                if (tranDate.getMonth() < currentDate.getMonth()) {
                    return {
                        success: false,
                        message: 'Operation denied, crossing periods is not allowed'
                    }
                }
            }
            var rec = record.load({ type: 'creditmemo', id: soId });
            var lineCount = rec.getLineCount({ sublistId: 'apply' });
            for (var i = 0; i < lineCount; i++) {
                rec.setSublistValue({ sublistId: 'apply', line: i, fieldId: 'apply', value: false });
            }
            rec.save();
            for (var i = 0; i < searchList.length; i++) {
                var recType = searchList[i].recordType;
                var recId = searchList[i].id;
                record.delete({ type: recType, id: recId });
                log.debug({ title: i, details: 'deleted: ' + recId });
            }
            return {
                success: true,
                message: 'transaction cleared'
            };
        }
        function getPaymentSchedule(invoiceRec) {
            var soId = invoiceRec.getValue({ fieldId: 'createdfrom' });
            var columns = [
                'custrecord_pos_method',
                'custrecord_pos_payment_amount',
                'custrecord_pos_date',
                'custrecord_mmy_payment',
                'custrecord_pos_ccnumber',
                'custrecord_pos_terms'
            ];
            var searchObj = search.create({
                type: 'customrecord_pos_paymentschedule',
                filters: ['custrecord_pos_salesorder', 'anyOf', [soId]],
                columns: columns
            })
            var list = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(list) ? '' : list;
        }
        function _setValue(rec, fldId, val) {
            rec.setValue({ fieldId: fldId, value: val });
        }
        function _getValue(rec, fldId) {
            return rec.getValue({ fieldId: fldId });
        }
        function _setText(rec, fldId, val) {
            rec.setText({ fieldId: fldId, text: val });
        }
        function _setLineValue(rec, listId, fldId, lNum, val) {
            rec.setSublistValue({ sublistId: listId, fieldId: fldId, line: lNum, value: convertNull(val) });
        }
        function _setLineText(rec, listId, fldId, lNum, val) {
            rec.setSublistValue({ sublistId: listId, fieldId: fldId, line: lNum, text: convertNull(val) });
        }
        function _getLineValue(rec, listId, fldId, lNum) {
            return rec.getSublistValue({ sublistId: listId, fieldId: fldId, line: lNum });
        }
        function _setCurrentLine(rec, listId, fldId, val) {
            rec.setCurrentSublistValue({ sublistId: listId, fieldId: fldId, value: convertNull(val) });
        }
        function getIdByExternalId(externalId, type) {
            if (isEmpty(externalId)) return '';
            var filters = ['externalid', 'anyof', [externalId]];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0].id;
        }
        function getIdByName(type, field, name) {
            if (isEmpty(name)) return '';
            var filters = [field, 'is', name];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0].id;
        }
        function isEmpty(str) { return (str == '' || str == null) ? true : false; }
        function convertNull(str) { return isEmpty(str) ? '' : str }
        function dateToString(obj) {
            return isEmpty(obj) ? '' : format.format({ value: obj, type: 'date' });
        }
        function stringToDate(str) {
            return isEmpty(str) ? '' : format.parse({ value: str, type: 'date' });
        }
        function getTaxCode(str) {
            var code = '';
            if (str == 'VAT_TW:Z-TW') code = 38;
            else if (str == 'VAT_TW:免稅') code = 1311;
            else if (str == 'VAT_TW:應稅') code = 1310;
            else if (str == 'VAT_TW:零稅率') code = 1312;
            else if (isEmpty(str)) code = '';
            else code = 38;
            return code;
        }
        return { post: _post };
    });