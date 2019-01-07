/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */

define(['N/record', 'N/format', 'N/search', 'N/runtime'],
    function (record, format, search, runtime) {
        function _do_post(dataIn) {
            var soObject = new Object();
            var begin = new Date();
            var succeed = true;
            soObject.success = false;
            try {
                if ('Inventory adjustment body fields') {
                    var soRec = '';
                    if (isEmpty(dataIn.tranid)) {
                        soObject.message = "Arguement is missing - tranid";
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                    if (isEmpty(dataIn.trandate)) {
                        soObject.message = "Arguement is missing - trandate";
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                    var soId = getIdByExternalId('IA-' + dataIn.tranid, 'inventoryadjustment');
                    if (dataIn.isdeleted == 'T' && !isEmpty(soId)) {
                        record.delete({ type: 'inventoryadjustment', id: soId });
                        soObject.success = true;
                        soObject.message = 'transaction deleted';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    };
                    if (dataIn.isdeleted == 'T' && isEmpty(soId)) {
                        soObject.success = true;
                        soObject.message = 'Adjustment can not be located';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                    dataIn.internalid = soId;
                    dataIn.trandate = stringToDate(dataIn.trandate);
                    dataIn.closedate = getCloseDate();
                    if (isEmpty(soId)) soRec = record.create({ type: 'inventoryadjustment' });
                    else soRec = record.load({ type: 'inventoryadjustment', id: dataIn.internalid });
                    if (isEmpty(soRec)) {
                        soObject.message = 'Inventory adjustment can not be located';
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }

                    var validation = validateAdjustment(soRec, dataIn);
                    if (!validation.success) {
                        soObject.message = validation.message;
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }

                    var subsidiary = dataIn.subsidiary;
                    dataIn.subId = getIdByExternalId(subsidiary, 'subsidiary');

                    var acctId = getIdByName(dataIn.account, 'account', 'number');
                    if (isEmpty(acctId)) {
                        soObject.message = "Account can not be located";
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }

                    var locName = dataIn.contents[0].adjlocation;
                    if (isEmpty(locName)) locName = dataIn.adjlocation;
                    if (isEmpty(locName)) {
                        soObject.message = "Location can not be empty";
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }
                    var locationId = searchLocation(locName, dataIn);
                    if (isEmpty(locationId)) {
                        soObject.message = "Location can not be located";
                        var logId = writeLog(dataIn, soObject);
                        return soObject;
                    }

                    _setValue(soRec, 'subsidiary', dataIn.subId);
                    _setValue(soRec, 'adjlocation', locationId);
                    _setValue(soRec, 'account', acctId);
                    _setValue(soRec, 'externalid', 'IA-' + dataIn.tranid);
                    _setValue(soRec, 'tranid', 'IA-' + dataIn.tranid);
                    _setValue(soRec, 'trandate', dataIn.trandate);
                    _setValue(soRec, 'memo', dataIn.memo);
                    var deptId = getIdByName(dataIn.department, 'department', 'custrecord1');
                    _setValue(soRec, 'department', deptId);
                    _setValue(soRec, 'custbody_adj_reason', dataIn.adj_reason);
                }

                var items = dataIn.contents;
                for (var i = 0; i < items.length; i++) {
                    _setLineValue(soRec, 'inventory', 'item', i, items[i].selfid);
                    _setLineValue(soRec, 'inventory', 'location', i, locationId);
                    _setLineValue(soRec, 'inventory', 'department', i, deptId);
                    _setLineValue(soRec, 'inventory', 'adjustqtyby', i, items[i].adjustqtyby);
                    _setLineValue(soRec, 'inventory', 'unitcost', i, items[i].unitcost);
                }

                var soId = soRec.save({ enableSourcing: true, ignoreMandatoryFields: true });
                log.debug({ title: 'adjust id', details: soId });
                soObject.success = true;
                soObject.soid = soId;
                var isCreate = isEmpty(dataIn.internalid);
                soObject.message = dataIn.tranid + ' is ';
                soObject.message += (isCreate ? 'created' : 'updated') + ' successfully';
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
            var scriptId = scriptObj.getParameter({ name: 'custscript_mmy_pos0410' });
            var logRec = record.create({ type: 'customrecord_pos_integrationlog' });
            logRec.setValue({ fieldId: 'custrecord_intlog_json', value: JSON.stringify(dataIn) });
            logRec.setValue({ fieldId: 'custrecord_intlog_succeed', value: response.success });
            logRec.setValue({ fieldId: 'custrecord_intlog_scriptname', value: scriptId });
            logRec.setValue({ fieldId: 'custrecord_intlog_apiid', value: 14 });
            var nsURL = 'https://rest.sandbox.netsuite.com/app/site/hosting/restlet.nl?';
            nsURL += 'script=' + scriptId + '&deploy=1';
            logRec.setValue({ fieldId: 'custrecord_intlog_targeturl', value: nsURL });
            logRec.setValue({ fieldId: 'custrecord_intlog_resultjson', value: JSON.stringify(response) });
            var logId = logRec.save();
            log.debug({ title: 'log id', details: 'log id: ' + logId });
            return logId;
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
        function _setText(rec, fldId, val) {
            var value = rec.setText({ fieldId: fldId, text: val });
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
        function _setLineText(rec, listId, fldId, lNum, val) {
            var value = rec.setSublistText({ sublistId: listId, fieldId: fldId, line: lNum, text: val });
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
        function getIdByName(fieldValue, type, fieldName) {
            if (isEmpty(fieldValue)) return '';
            var filters = [fieldName, 'is', fieldValue];
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