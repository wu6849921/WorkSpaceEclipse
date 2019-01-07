/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */

define(['N/record', 'N/format', 'N/search', 'N/runtime'],
    function (record, format, search, runtime) {
        function _post(context) {
            var toObject = new Object();
            toObject.success = false;
            try {
                var begin = new Date();
                var toRec = '';
                context.trandate = stringToDate(context.trandate);
                context.closedate = getCloseDate();
                var toId = getIdByExternalId('TR-' + context.tranid, 'transaction');
                var subsidiary = context.subsidiary;
                if (isEmpty(toId)) {
                    toRec = record.create({ type: 'transferorder' });
                }
                else {
                    var validation = validateTransferOrder(toId, context);
                    if (validation.success) {
                        if (context.isdeleted == 'T') {
                            toObject.success = true;
                            toObject.message = 'transaction delete';
                            record.delete({ type: 'transferorder', id: toId });
                            var logId = writeLog(context, toObject);
                            return toObject;
                        }
                        toRec = record.load({ type: 'transferorder', id: toId });
                    }
                    else {
                        var logId = writeLog(context, validation);
                        return validation;
                    }
                }

                var isCreate = isEmpty(toId);
                context.subId = getIdByExternalId(subsidiary, 'subsidiary');
                if (isEmpty(context.subId)) {
                    toObject.message = 'Invalid subsidiary - ' + subsidiary;
                    var logId = writeLog(context, toObject);
                    return toObject;
                }

                _setValue(toRec, 'subsidiary', context.subId);
                var fromLocation = searchLocation(context.location, context);
                if (isEmpty(fromLocation)) {
                    toObject.message = "From location can not be located";
                    var logId = writeLog(context, toObject);
                    return toObject;
                }
                _setValue(toRec, 'location', fromLocation);

                var toLocationId = searchLocation(context.transferlocation, context);
                if (isEmpty(toLocationId)) {
                    toObject.message = 'To location can not be located';
                    var logId = writeLog(context, toObject);
                    return toObject;
                }
                _setValue(toRec, 'transferlocation', toLocationId);

                if (context.employee) {
                    var salesRepId = getIdByName(context.employee, 'employee', 'entityid');
                    if (isEmpty(salesRepId)) {
                        toObject.message = 'Employee can not be located';
                        var logId = writeLog(context, toObject);
                        return toObject;
                    }
                    _setValue(toRec, 'employee', salesRepId);
                }
                //toRec.setValue('orderstatus', 'B');
                toRec.setValue('trandate', context.trandate);
                toRec.setValue('memo', context.memo);
                toRec.setValue('useitemcostastransfercost', true);
                //toRec.setValue('incoterm', 1);
                toRec.setValue('custbody_iflogcom', 1);
                toRec.setValue('tranid', context.tranid);
                toRec.setValue('externalid', context.tranid);
                toRec.setValue('custbody_transfer_reason', context.transfer_reason);
                toRec.setValue('custbody_logcom', context.custbody_iflogcom);
                toRec.setValue('tranid', 'TR-' + context.tranid);
                toRec.setValue('externalid', 'TR-' + context.tranid);

                var items = context.contents;
                for (var i = 0; i < items.length; i++) {
                    //log.debug({ title: i, details: items[i].expectedshipdate + ', ' + items[i].expectedreceiptdate });
                    var receiveDate = format.parse({ value: items[i].expectedshipdate, type: 'date' });
                    var shipDate = format.parse({ value: items[i].expectedreceiptdate, type: 'date' });
                    _setLineValue(toRec, 'item', 'item', i, items[i].selfid);
                    _setLineValue(toRec, 'item', 'quantity', i, items[i].quantity);
                    _setLineValue(toRec, 'item', 'expectedreceiptdate', i, receiveDate);
                    _setLineValue(toRec, 'item', 'expectedshipdate', i, shipDate);
                    //_setLineValue(toRec, 'item', 'isclosed', i, items[i].isclosed);
                    //var itemName = toRec.getSublistText({ sublistId: 'item', fieldId: 'item', line: i });
                    //log.debug({ title: i, details: 'item: ' + itemName });
                }
                var toId = toRec.save();
                var end = new Date();
                toObject.time = ((end - begin) / 1000).toFixed(2) + 'S';
                toObject.internalid = toId;
                toObject.success = true;
                toObject.message = context.tranid + ' is ' + (isCreate ? 'created' : 'updated');
                var logId = writeLog(context, toObject);
                return toObject;
            }
            catch (ex) {
                log.debug({ title: '_post', details: ex });
                var toObject = new Object();
                var end = new Date();
                toObject.time = ((end - begin) / 1000).toFixed(2) + 'S';
                toObject.success = false;
                toObject.message = ex.message;
                var logId = writeLog(context, toObject);
                return toObject;
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
            var scriptId = scriptObj.getParameter({ name: 'custscript_mmy_pos0409' });
            var logRec = record.create({ type: 'customrecord_pos_integrationlog' });
            logRec.setValue({ fieldId: 'custrecord_intlog_json', value: JSON.stringify(dataIn) });
            logRec.setValue({ fieldId: 'custrecord_intlog_succeed', value: response.success });
            logRec.setValue({ fieldId: 'custrecord_intlog_scriptname', value: scriptId });
            logRec.setValue({ fieldId: 'custrecord_intlog_apiid', value: 11 });
            var nsURL = 'https://rest.sandbox.netsuite.com/app/site/hosting/restlet.nl?';
            nsURL += 'script=' + scriptId + '&deploy=1';
            logRec.setValue({ fieldId: 'custrecord_intlog_targeturl', value: nsURL });
            logRec.setValue({ fieldId: 'custrecord_intlog_resultjson', value: JSON.stringify(response) });
            var logId = logRec.save();
            log.debug({ title: 'log id', details: 'log id: ' + logId });
            return logId;
        }
        function validateTransferOrder(soId, context) {
            if (isEmpty(soId)) return { success: false, message: 'Invalid transfer order id' };
            var filters = new Array();
            filters.push(['createdfrom', 'anyof', [soId]]);
            filters.push('and');
            filters.push(['mainline', 'is', 'T']);
            var columns = ['trandate', 'type', 'tranid', 'statusref', 'approvalstatus', 'createdfrom.trandate'];
            var searchObj = search.create({
                type: 'transaction', filters: filters, columns: columns
            });
            var searchList = searchObj.run().getRange({ start: 0, end: 1000 });
            if (isEmpty(searchList)) {
                return { success: true, message: 'No related records' };
            }
            else {
                return { success: false, message: 'Order has been fulfilled/received' };
            }
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
        function getIdByExternalId(externalId, type) {
            if (isEmpty(externalId)) return '';
            var filters = [['externalid', 'anyof', [externalId]]]
            var columns = ['subsidiary', 'name', 'custrecord_5826_loc_branch_id'];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0].id;
        }
        function getIdByName(name, type, field) {
            if (isEmpty(name)) return '';
            var filters = [field, 'is', name];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0].id;
        }
        function _setValue(rec, fldId, val) {
            rec.setValue({ fieldId: fldId, value: val });
        }
        function _setText(rec, fldId, val) {
            rec.setValue({ fieldId: fldId, text: val });
        }
        function _setLineValue(rec, listId, fldId, lNum, val) {
            rec.setSublistValue({ sublistId: listId, fieldId: fldId, line: lNum, value: convertNull(val) });
        }
        function _setCurrentLine(rec, listId, fldId, val) {
            rec.setCurrentSublistValue({ sublistId: listId, fieldId: fldId, value: convertNull(val) });
        }
        function stringToDate(str) {
            return isEmpty(str) ? '' : format.parse({ value: str, type: 'date' });
        }
        function isEmpty(str) { return (str == '' || str == null) ? true : false; }
        function convertNull(str) { return (isEmpty(str)) ? '' : str; }
        return { post: _post };
    });