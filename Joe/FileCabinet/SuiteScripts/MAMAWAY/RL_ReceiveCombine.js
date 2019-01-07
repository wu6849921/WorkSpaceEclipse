/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */

define(['N/record', 'N/format', 'N/search', 'N/runtime'],
    function (record, format, search, runtime) {
        function _post(context) {
            var validation = validateJSON(context);
            if (!validation.success) return validation;
            var responseObject = new Object();
            responseObject.success = false;
            try {
                var begin = new Date();
                var rec = '';
                var recId = getIdByExternalId('AB-' + context.tranid, 'transaction');
                if (context.isdeleted == 'T' && !isEmpty(recId)) {
                    record.delete({ type: 'assemblybuild', id: recId });
                    responseObject.success = true;
                    responseObject.message = 'Assembly build deleted';
                    var logId = writeLog(context, responseObject);
                    return responseObject;
                }
                if (context.isdeleted == 'T' && isEmpty(recId)) {
                    responseObject.success = true;
                    responseObject.message = 'Assembly build cannot be found';
                    var logId = writeLog(context, responseObject);
                    return responseObject;
                }
                context.trandate = stringToDate(context.trandate);
                context.closedate = getCloseDate();
                var isCreate = false;
                if (isEmpty(recId)) {
                    rec = record.create({ type: 'assemblybuild' });
                    isCreate = true;
                }
                else {
                    rec = record.load({ type: 'assemblybuild', id: recId });
                    var validation = validateAdjustment(rec, context);
                    if (!validation.success) {
                        responseObject.message = validation.message;
                        var logId = writeLog(context, responseObject);
                        return responseObject;
                    }
                }
                
                var subsidiary = context.subsidiary;
                context.subId = getIdByExternalId(subsidiary, 'subsidiary');

                var locationId = searchLocation(context.location, context);
                if (isEmpty(locationId)) {
                    responseObject.message = "Location can not be located";
                    var logId = writeLog(context, responseObject);
                    return responseObject;
                }
                
                _setValue(rec, 'subsidiary', context.subId);
                _setValue(rec, 'location', locationId);

                if (!isEmpty(context.department)) {
                    var dept = getIdByExternalId(context.department, 'department');
                    if (isEmpty(dept)) {
                        responseObject.message = "Department can not be located";
                        var logId = writeLog(context, responseObject);
                        return responseObject;
                    }
                    log.debug({ title: 'dept', details: dept });
                    rec.setValue({ fieldId: 'department', value: dept })
                }

                rec.setValue({ fieldId: 'item', value: context.selfid });
                rec.setValue({ fieldId: 'quantity', value: context.quantity });
                rec.setValue({ fieldId: 'trandate', value: stringToDate(context.trandate) });
                rec.setValue({ fieldId: 'memo', value: context.memo });
                rec.setValue({ fieldId: 'tranid', value: 'AB-' + context.tranid });
                rec.setValue({ fieldId: 'externalid', value: 'AB-' + context.tranid });

                var items = context.contents;
                var lineCount = rec.getLineCount({ sublistId: 'component' });
                for (var i = 0; i < items.length; i++) {
                    var itemIdInJSON = items[i].itemdetailselfid;
                    for (var j = 0; j < lineCount; j++) {
                        var itemId = rec.getSublistValue({ sublistId: 'component', fieldId: 'item', line: j });
                        if (itemId == itemIdInJSON) {
                            rec.setSublistValue({
                                sublistId: 'component', fieldId: 'quantity', line: i, value: items[i].quantitydetail
                            });
                        }
                    }
                }
                var recId = rec.save();
                responseObject.success = true;
                responseObject.internalid = recId;
                responseObject.messag = context.tranid + ' is ' + (isCreate ? 'created' : 'updated');
                var end = new Date();
                responseObject.time = ((end - begin) / 1000).toFixed(2) + 's';
                var logId = writeLog(context, responseObject);
                return responseObject;
            }
            catch (ex) {
                log.debug({ title: '_post', details: ex });
                responseObject.success = false;
                responseObject.message = ex;
                var logId = writeLog(context, responseObject);
                return responseObject;
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
        function validateAdjustment(soRec, context) {
            var tranDate = soRec.getValue({ fieldId: 'trandate' });
            var isClosed1 = context.closedate - tranDate > 0;
            var isClosed2 = context.closedate - context.trandate > 0;
            //log.debug({ title: soRec.id, details: context.closedate + ', ' + tranDate + ', ' + context.trandate });
            if (isClosed1 || isClosed2) {
                return {
                    success: false,
                    message: 'Operation denied, crossing periods is not allowed'
                }
            }
            return {
                success: true,
                message: 'transaction cleared'
            };
        }
        function searchLocation(locName, context) {
            if (isEmpty(locName)) return '';
            var type = 'location';
            var filters = new Array();
            filters[0] = ['externalid', 'anyof', [locName]];
            filters[1] = 'and';
            filters[2] = ['subsidiary', 'is', context.subId];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            if (isEmpty(existList)) {
                if (context.subsidiary == 4) {
                    filters[0] = ['externalid', 'anyof', [locName + '-A']];
                    searchObj = search.create({ type: type, filters: filters });
                    existList = searchObj.run().getRange({ start: 0, end: 1000 });
                    if (isEmpty(existList)) return '';
                }
                else return '';
            }
            return existList[0].id;
        }
        function writeLog(dataIn, response) {
            var scriptObj = runtime.getCurrentScript();
            var scriptId = scriptObj.getParameter({ name: 'custscript_mmy_pos14' });
            var logRec = record.create({ type: 'customrecord_pos_integrationlog' });
            logRec.setValue({ fieldId: 'custrecord_intlog_json', value: JSON.stringify(dataIn) });
            logRec.setValue({ fieldId: 'custrecord_intlog_succeed', value: response.success });
            logRec.setValue({ fieldId: 'custrecord_intlog_scriptname', value: scriptId });
            logRec.setValue({ fieldId: 'custrecord_intlog_apiid', value: 19 });
            var nsURL = 'https://rest.sandbox.netsuite.com/app/site/hosting/restlet.nl?';
            nsURL += 'script=' + scriptId + '&deploy=1';
            logRec.setValue({ fieldId: 'custrecord_intlog_targeturl', value: nsURL });
            logRec.setValue({ fieldId: 'custrecord_intlog_resultjson', value: JSON.stringify(response) });
            var logId = logRec.save();
            log.debug({ title: 'log id', details: 'log id: ' + logId });
            return logId;
        }
        function validateJSON(context) {
            var result = new Object();
            result.success = false;
            if (isEmpty(context.tranid)) result.message = 'Transaction # is missing';
            else if (isEmpty(context.selfid)) result.message = 'selfid is missing';
            else if (isEmpty(context.quantity)) result.message = 'Main product quantity is missing';
            else if (isEmpty(context.trandate)) result.message = 'Transaction date is missing';
            else if (isEmpty(context.subsidiary)) result.message = 'subsidiary is missing';
            else if (isEmpty(context.location)) result.message = 'location is missing';
            else if (!context.contents) result.message = 'Component is missing';
            else {
                result.success = true;
                return result;
            }
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
        function isEmpty(str) { return (str == '' || str == null) ? true : false; }
        function convertNull(str) { return isEmpty(str) ? '' : str }
        function dateToString(obj) {
            return isEmpty(obj) ? '' : format.format({ value: obj, type: 'date' });
        }
        function stringToDate(str) {
            return isEmpty(str) ? '' : format.parse({ value: str, type: 'date' });
        }
        return { post: _post };
    });