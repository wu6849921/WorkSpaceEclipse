/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */

define(['N/record', 'N/format', 'N/search', 'N/runtime'],
    function (record, format, search, runtime) {
        function _do_post(dataIn) {
            var soObject = new Object();
            soObject.success = false;
            var begin = new Date();
            try {
                if ('Check sales order whether exists') {
                    if (!dataIn.location) dataIn.location = dataIn.contents[0].location;
                    var soRec = '';
                    if (isEmpty(dataIn.tranid)) {
                        soObject.message = 'Arguement is missing - tranid';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                    if (isEmpty(dataIn.createdfrom)) {
                        soObject.message = "Arguement is missing - createdfrom";
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                    dataIn.trandate = stringToDate(dataIn.trandate);
                    dataIn.closedate = getCloseDate();
                    var validation = validateFulfillment(dataIn.tranid, dataIn);
                    if (!validation.success) {
                        var logId = writeLog(dataIn, validation);
                        return validation;
                    }
                    if (dataIn.isdeleted == 'T') {
                        var result = {success: true, message: 'transaction deleted'};
                        var logId = writeLog(dataIn, result);
                        return result;
                    }
                    var isCreate = validation.iscreate;
                    //var soId = getIdByExternalId(dataIn.createdfrom, recType);
                    var prefix = dataIn.ordertype == 'salesorder' ? 'SO-' : '';
                    prefix = dataIn.ordertype == 'transferorder' ? 'TR-' : prefix;
                    dataIn.prefix = prefix;
                    log.debug({title: 'test', details: prefix});
                    soRec = getIdByNumber(prefix + dataIn.createdfrom, 'transaction');
                    if (isEmpty(soRec)) {
                        soObject.message = dataIn.createdfrom + ' can not be located';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                    var soId = soRec.id;
                    dataIn.internalid = soId;
                    var recType = soRec.recordType;
                    var locationId = getIdByExternalId(dataIn.location, 'location');
                    log.debug(dataIn.location, locationId + ', ' + dataIn.createdfrom + ', ' + recType + ', ' + soId);
                    if (isEmpty(locationId) && recType != 'transferorder') {
                        soObject.message = 'Warehouse can not be located';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                }
                
                if ('Transform sales order to fulfillment') {
                    try {
                        var fulfillRec = record.transform({
                            fromType: recType,
                            fromId: soId,
                            toType: 'itemfulfillment'
                            //,defaultValues: { 'custbody_cfmemo': dataIn.memo}
                        });

                        if (!isEmpty(dataIn.trandate)) _setValue(fulfillRec, 'trandate', dataIn.trandate);
                        _setValue(fulfillRec, 'custbody_cfmemo', dataIn.memo);
                        _setValue(fulfillRec, 'externalid', 'FUL-' + dataIn.tranid);
                        _setValue(fulfillRec, 'tranid', 'FUL-' + dataIn.tranid);
                        _setValue(fulfillRec, 'memo', dataIn.memo);
                        _setValue(fulfillRec, 'custbody_logcom', dataIn.custbody_logcom);

                        var items = dataIn.contents;
                        var lineCount = fulfillRec.getLineCount({ sublistId: 'item' });
                        for (var i = 0; i < lineCount; i++) {
                            _setLineValue(fulfillRec, 'item', 'itemreceive', i, false);
                        }

                        for (var j = 0; j < items.length; j++) {
                            var itemIdInJSON = items[j].selfid;
                            var itemIsFound = false;
                            for (var i = 0; i < lineCount; i++) {
                                var itemIdInLine = _getLineValue(fulfillRec, 'item', 'item', i);
                                if (itemIdInJSON == itemIdInLine) {
                                    itemIsFound = true;
                                    _setLineValue(fulfillRec, 'item', 'itemreceive', i, true);
                                    if (recType != 'transferorder') _setLineValue(fulfillRec, 'item', 'location', i, locationId);
                                    var remainQty = _getLineValue(fulfillRec, 'item', 'quantityremaining', i);
                                    //_setLineValue(fulfillRec, 'item', 'quantity', i, remainQty);
                                    /*if (items[j].quantity - remainQty > 0) {
                                        return {
                                            success: false,
                                            message: 'Line ' + i + ': item ' + itemIdInJSON + ', only ' + remainQty + ' available',
                                        };
                                    }*/
                                    _setLineValue(fulfillRec, 'item', 'quantity', i, items[j].quantity);
                                }
                            }
                            log.debug('test', 'itemIsFound: ' + itemIsFound);
                            if (!itemIsFound) {
                                soObject.message = 'SKU is NOT found';
                                var logId = writeLog(dataIn, soObject);
                                return soObject;
                            }
                        }

                        var fulfillId = fulfillRec.save({ enableSourcing: true, ignoreMandatoryFields: true });
                        log.debug({ title: 'fulfillId', details: fulfillId });
                        soObject.fulfillid = fulfillId;
                        soObject.message = dataIn.createdfrom + ' is fulfilled';
                    }
                    catch (fulfillEx) {
                        log.debug({ title: 'fulfill error', details: fulfillEx });
                        soObject.fulfillid = 'error_in_fulfillment_transformation';
                        soObject.message = fulfillEx.message;
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                }

                if (dataIn.needinvoice == 'T' && isCreate) {
                    try {
                        var invoiceRec = record.transform({
                            fromType: 'salesorder',
                            fromId: soId,
                            toType: 'invoice'
                        });

                        dataIn.trandate = stringToDate(dataIn.trandate, format);
                        _setValue(invoiceRec, 'trandate', dataIn.trandate);
                        _setValue(invoiceRec, 'memo', dataIn.memo);
                        //_setValue(invoiceRec, 'salesrep', salesRepId);
                        //_setValue(invoiceRec, 'department', deptId);
                        //_setText(invoiceRec, 'terms', dataIn.terms);
                        _setValue(invoiceRec, 'location', locationId);
                        _setValue(invoiceRec, 'approvalstatus', 2);
                        //_setValue(invoiceRec, 'exchangerate', dataIn.exchangerate);
                        //_setValue(invoiceRec, 'duedate', stringToDate(dataIn.paydate));
                        _setValue(invoiceRec, 'tranid', 'INV-' + dataIn.tranid);
                        _setValue(invoiceRec, 'externalid', 'INV-' + dataIn.tranid);

                        var items = dataIn.contents;
                        var lineCount = invoiceRec.getLineCount({ sublistId: 'item' });
                        for (var i = 0; i < lineCount; i++) {
                            var itemIdInLine = _getLineValue(invoiceRec, 'item', 'item', i);
                            for (var j = 0; j < items.length; j++) {
                                var itemIdInJSON = items[j].selfid;
                                if (itemIdInJSON == itemIdInLine) {
                                    _setLineValue(invoiceRec, 'item', 'quantity', i, items[j].quantity);
                                }
                            }
                        }

                        invoiceId = invoiceRec.save({ enableSourcing: true, ignoreMandatoryFields: true });
                        log.debug({ title: 'invoiceId', details: invoiceId });
                        soObject.invoiceid = invoiceId;
                    }
                    catch (invoiceEx) {
                        log.debug({ title: 'invoice error', details: invoiceEx });
                        soObject.invoiceid = 'error_in_invoice_transformation';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                }

                soObject.success = true;
                var end = new Date();
                soObject.time = ((end - begin) / 1000).toFixed(2) + 'S';
                var logId = writeLog(dataIn, soObject);
                return soObject;
            }
            catch (ex) {
                log.debug({ title: '_post', details: ex });
                soObject.success = false;
                soObject.message = ex.message;
                var logId = writeLog(dataIn, soObject);
                return soObject;
            }
        }

        function getCloseDate() {
            var filters = new Array();
            filters.push({ name: 'isyear', operator: 'isnot', values: ['T'] });
            filters.push({ name: 'isquarter', operator: 'isnot', values: ['T'] });
            filters.push({ name: 'closed', operator: 'is', values: ['T'] });
            var columns = new Array();
            columns.push({ name: 'enddate', sort: search.Sort.DESC });
            columns.push({ name: 'formulanumeric', formula: 'extract(month from {enddate})' });
            columns.push({ name: 'formulanumeric', formula: 'extract(year from {enddate})' });
            var searchObj = search.create({
                type: 'accountingperiod', filters: filters, columns: columns
            });
            var existList = searchObj.run().getRange({ start: 0, end: 1 });
            return stringToDate(existList[0].getValue(columns[0]));
        }
        function writeLog(dataIn, response) {
            var scriptObj = runtime.getCurrentScript();
            var scriptId = scriptObj.getParameter({ name: 'custscript_mmy_pos040901' });
            var logRec = record.create({ type: 'customrecord_pos_integrationlog' });
            logRec.setValue({ fieldId: 'custrecord_intlog_json', value: JSON.stringify(dataIn) });
            logRec.setValue({ fieldId: 'custrecord_intlog_succeed', value: response.success });
            logRec.setValue({ fieldId: 'custrecord_intlog_scriptname', value: scriptId });
            logRec.setValue({ fieldId: 'custrecord_intlog_apiid', value: 17 });
            var nsURL = 'https://rest.sandbox.netsuite.com/app/site/hosting/restlet.nl?';
            nsURL += 'script=' + scriptId + '&deploy=1';
            logRec.setValue({ fieldId: 'custrecord_intlog_targeturl', value: nsURL });
            logRec.setValue({ fieldId: 'custrecord_intlog_resultjson', value: JSON.stringify(response) });
            var logId = logRec.save();
            log.debug({ title: 'log id', details: 'log id: ' + logId });
            return logId;
        }
        function validateFulfillment(tranid, context) {
            var filters = new Array();
            filters.push(['externalid', 'anyof', ['FUL-' + tranid]]);
            //filters.push(['externalid', 'anyof', ['FUL-' + tranid]]);
            filters.push('and');
            filters.push(['mainline', 'is', 'T']);
            var columns = ['trandate', 'type', 'tranid', 'statusref', 'approvalstatus', 'createdfrom.trandate'];
            var searchObj = search.create({
                type: 'transaction', filters: filters, columns: columns
            });
            var searchList = searchObj.run().getRange({start: 0, end: 1000});
            if (isEmpty(searchList)) {
                return {success: true, message: 'no related transaction'};
            }
            //var soRec = record.load({ type: 'salesorder', id: soId });
            for (var i = 0; i < searchList.length; i++) {
                var tranDate = stringToDate(searchList[i].getValue(columns[0]));
                var approvalStatus = searchList[i].getValue(columns[4]);
                var tranId = searchList[i].getValue(columns[2]);
                var recType = searchList[i].recordType;
                var isClosed1 = context.closedate - tranDate > 0;
                var isClosed2 = context.closedate - context.trandate > 0;
                //log.debug({ title: tranId, details: context.closedate + ', ' + tranDate + ', ' + context.trandate });
                if (isClosed1 || isClosed2) {
                    return {
                        success: false,
                        message: 'Operation denied, crossing periods is not allowed'
                    }
                }
                if (recType == 'invoice' && approvalStatus == 2) {
                    return {
                        success: false,
                        message: 'Operation denied, ' + tranId + ' has been approved'
                    }
                }
            }
            for (var i = 0; i < searchList.length; i++) {
                var recType = searchList[i].recordType;
                var recId = searchList[i].id;
                record.delete({type: recType, id: recId});
            }

            return {success: true, message: 'transaction cleared', iscreate: false};
        }
        function _setText(rec, fldId, val) {
            var value = rec.setText({ fieldId: fldId, value: val });
        }
        function _setValue(rec, fldId, val) {
            rec.setValue({ fieldId: fldId, value: val });
        }
        function _getLineValue(rec, listId, fldId, lNum) {
            var value = rec.getSublistValue({ sublistId: listId, fieldId: fldId, line: lNum });
            return convertEmpty(value);
        }
        function _getLineText(rec, listId, fldId, lNum) {
            var value = rec.getSublistText({ sublistId: listId, fieldId: fldId, line: lNum });
            return convertEmpty(value);
        }
        function _setLineValue(rec, listId, fldId, lNum, val) {
            var value = rec.setSublistValue({ sublistId: listId, fieldId: fldId, line: lNum, value: val });
        }
        function isEmpty(str) { return (str == '' || str == null) ? true : false; }
        function convertEmpty(str) { return isEmpty(str) ? '' : str }
        function convertBool(str) {
            if (isEmpty(str)) return false;
            var noList = [false, 'false', 'False', 'FALSE', 'F', 'N', 'No', 'NO', 'no'];
            for (var i = 0; i < noList.length; i++) {
                if (noList[i] == str) return false;
            }
            return true;
        }
        function dateToString(obj) {
            return isEmpty(obj) ? '' : format.format({ value: obj, type: 'date' });
        }
        function stringToDate(str) {
            str = str.replace(/-/g, "/");
            return isEmpty(str) ? '' : format.parse({ value: str, type: 'date' });
        }
        function getIdByExternalId(externalId, type) {
            if (isEmpty(externalId)) return '';
            var filters = [['externalid', 'anyof', [externalId]]]
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            //log.debug('existList',JSON.stringify(existList));
            return isEmpty(existList) ? '' : existList[0].id;
        }
        function getIdByNumber(docNumber, type) {
            if (isEmpty(docNumber)) return '';
            var filters = ['tranid', 'is', docNumber];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0];
        }
        function getListId(listName, listJSON) {
            for (var key in listJSON) {
                if (listJSON.hasOwnProperty(key)) {
                    if (listJSON[key] == listName) {
                        return key.substring(1);
                    }
                }
            }
        }
        function getSubRecId(soId, type) {
            if (isEmpty(soId)) return '';
            var filters = [['createdfrom', 'anyof', [soId]]];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0].id;
        }
        //return { get: _get, 'delete': _delete, post: _post, put: _put };
        return { post: _do_post };
    });