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
                if ('Check purchase order whether exists') {
                    var soRec = '';
                    if (isEmpty(dataIn.createdfrom)) {
                        soObject.message = 'Arguement is missing - createdfrom';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }

                    var recType = dataIn.ordertype == 'purchaseorder' ? 'purchaseorder' : 'returnauthorization';
                    recType = dataIn.ordertype == 'transferorder' ? 'transferorder' : recType;

                    var prefix = recType == 'purchaseorder' ? '' : 'RMA-';
                    prefix = recType == 'transferorder' ? 'TR-' : prefix;

                    var soId = getIdByName(recType, 'tranid', prefix + dataIn.createdfrom);
                    log.debug({ title: 'soid', details: soId });
                    dataIn.internalid = soId;
                    dataIn.trandate = stringToDate(dataIn.trandate);
                    dataIn.closedate = getCloseDate();
                    var validation = validateFulfillment('RCT-' + dataIn.tranid, dataIn);
                    if (!validation.success) {
                        if (dataIn.isdeleted == 'T') {
                            soObject.success = true;
                            soObject.message = 'transaction deleted';
                            var logId = writeLog(dataIn, soObject);
                            return soObject;
                        }
                        var logId = writeLog(dataIn, validation);
                        return validation;
                    }
                    if (dataIn.isdeleted == 'T') {
                        soObject.success = true;
                        soObject.message = 'transaction deleted';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                    if (isEmpty(soId)) {
                        soObject.message = recType + ' can not be located';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                    var items = dataIn.contents;
                    var locationId = getIdByExternalId(items[0].location, 'location');
                    if (isEmpty(locationId) && recType != 'transferorder') {
                        soObject.message = 'Warehouse can not be located';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                }

                if ('Transform order to receipt') {
                    try {
                        var fulfillRec = record.transform({ fromType: recType, fromId: soId, toType: 'itemreceipt' });
                        dataIn.trandate = stringToDate(dataIn.trandate, format);
                        if (!isEmpty(dataIn.trandate)) _setValue(fulfillRec, 'trandate', dataIn.trandate);
                        _setValue(fulfillRec, 'memo', dataIn.memo);
                        _setValue(fulfillRec, 'custbody_cfmemo', dataIn.memo);
                        _setValue(fulfillRec, 'tranid', 'RCT-' + dataIn.tranid);
                        _setValue(fulfillRec, 'externalid', 'RCT-' + dataIn.tranid);

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
                                    if (recType != 'transferorder') {
                                        _setLineValue(fulfillRec, 'item', 'tolocation', i, locationId);
                                        _setLineValue(fulfillRec, 'item', 'location', i, locationId);
                                    }
                                    var remainQty = _getLineValue(fulfillRec, 'item', 'quantityremaining', i);
                                    //_setLineValue(fulfillRec, 'item', 'quantity', i, remainQty);
                                    /*if (items[j].quantity - remainQty > 0) {
                                        soObject.success = false;
                                        soObject.message = 'Line ' + i + ': item ' + itemIdInJSON + ', only ' + remainQty + ' available'
                                        var logId = writeLog(dataIn, soObject);
                                        return soObject;
                                    }*/
                                    _setLineValue(fulfillRec, 'item', 'quantity', i, items[j].quantity);
                                    //log.debug(i + ', ' + j, items[j].quantity)
                                }
                            }
                            if (!itemIsFound) {
                                soObject.message = 'SKU is NOT found';
                                var logId = writeLog(dataIn, soObject);
                                return soObject;
                            }
                        }
                        var fulfillId = fulfillRec.save();
                        log.debug({ title: 'receiveid', details: fulfillId });
                        soObject.receiveid = fulfillId;
                        soObject.message = dataIn.createdfrom + ' is received';
                    }
                    catch (fulfillEx) {
                        log.debug({ title: 'fulfill error', details: fulfillEx });
                        soObject.receiveid = 'error_in_receipt_transformation';
                        soObject.message = fulfillEx.message;
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                }

                var end = new Date();
                soObject.time = ((end - begin) / 1000).toFixed(2) + 'S';
                soObject.success = true;
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
            var scriptId = scriptObj.getParameter({ name: 'custscript_mmy_pos0407' });
            var logRec = record.create({ type: 'customrecord_pos_integrationlog' });
            logRec.setValue({ fieldId: 'custrecord_intlog_json', value: JSON.stringify(dataIn) });
            logRec.setValue({ fieldId: 'custrecord_intlog_succeed', value: response.success });
            logRec.setValue({ fieldId: 'custrecord_intlog_scriptname', value: scriptId });
            logRec.setValue({ fieldId: 'custrecord_intlog_apiid', value: 9});
            var nsURL = 'https://rest.sandbox.netsuite.com/app/site/hosting/restlet.nl?';
            nsURL += 'script=' + scriptId + '&deploy=1';
            logRec.setValue({ fieldId: 'custrecord_intlog_targeturl', value: nsURL });
            logRec.setValue({ fieldId: 'custrecord_intlog_resultjson', value: JSON.stringify(response) });
            var logId = logRec.save();
            log.debug({ title: 'log id', details: 'log id: ' + logId });
            return logId;
        }
        function validateFulfillment(tranid, context) {
            var receiptId = getIdByExternalId('RCT-' + context.tranid, 'itemreceipt');
            if (isEmpty(receiptId)) rec = record.create({ type: 'itemreceipt' });
            else rec = record.load({ type: 'itemreceipt', id: receiptId });

            var tranDate = rec.getValue({ fieldId: 'trandate' });
            var isClosed1 = context.closedate - tranDate > 0;
            var isClosed2 = context.closedate - context.trandate > 0;
            //log.debug({ title: soRec.id, details: context.closedate + ', ' + tranDate + ', ' + context.trandate });
            if (isClosed1 || isClosed2) {
                return {
                    success: false,
                    message: 'Operation denied, crossing periods is not allowed'
                }
            }
            if (!isEmpty(receiptId)) record.delete({ type: 'itemreceipt', id: receiptId });
            return {
                success: true,
                message: 'transaction cleared'
            };
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
            return isEmpty(str) ? '' : format.parse({ value: str, type: 'date' });
        }
        function getIdByExternalId(externalId, type) {
            if (isEmpty(externalId)) return '';
            var filters = [['externalid', 'anyof', [externalId]]]
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
        return { post: _do_post };
    });