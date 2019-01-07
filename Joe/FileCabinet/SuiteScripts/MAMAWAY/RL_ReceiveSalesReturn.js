/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */

define(['N/record', 'N/format', 'N/search', 'N/runtime'],
    function (record, format, search, runtime) {
        function _do_post(dataIn) {
            var raObject = new Object();
            raObject.success = false;
            var begin = new Date();
            try {
                if ('Return authorization body fields') {
                    var raRec = '';
                    if (isEmpty(dataIn.tranid)) {
                        var result = {
                            success: false,
                            message: "Arguement is missing - tranid"
                        };
                        var logId = writeLog(dataIn, result);
                        return result;
                    }
                    var raId = getIdByExternalId('RMA-' + dataIn.tranid, 'returnauthorization');
                    var isCreate = isEmpty(raId);
                    dataIn.internalid = raId;
                    var createdFrom = 'SO-' + dataIn.createdfrom;
                    dataIn.trandate = stringToDate(dataIn.trandate);
                    dataIn.closedate = getCloseDate();
                    var soId = getIdByExternalId(createdFrom, 'salesorder');
                    if (!isEmpty(dataIn.createdfrom) && isEmpty(soId)) {
                        var result = {
                            success: false,
                            message: dataIn.createdfrom + ' cannot be found.'
                        };
                        var logId = writeLog(dataIn, result);
                        return result;
                    }
                    if (isEmpty(raId)) {
                        if (isEmpty(soId)) raRec = record.create({
                            type: 'returnauthorization', isDynamic: true
                        });
                        else raRec = record.transform({
                            fromType: 'salesorder',
                            fromId: soId,
                            toType: 'returnauthorization',
                            isDynamic: true
                        });
                    }
                    else {
                        var validation = validateSalesOrder(raId, dataIn);
                        if (validation.success) {
                            raRec = record.load({
                                type: 'returnauthorization', id: raId, isDynamic: true
                            });
                        }
                        else {
                            var logId = writeLog(dataIn, validation);
                            return validation;
                        }
                    }
                    if (isEmpty(raRec)) {
                        var result = {
                            success: false,
                            message: "Return authorization can not be located"
                        };
                        var logId = writeLog(dataIn, result);
                        return result;
                    }

                    if (dataIn.isdeleted == 'T') {
                        if (!isEmpty(raId)) record.delete({ type: 'returnauthorization', id: raId });
                        raObject.success = true;
                        raObject.message = 'transaction deleted';
                        var logId = writeLog(dataIn, raObject);
                        return raObject;
                    }

                    if (dataIn.location) {
                        var locationId = getIdByExternalId(dataIn.location, 'location');
                        if (isEmpty(locationId)) {
                            raObject.message = "Warehouse can not be located";
                            var logId = writeLog(dataIn, raObject);
                            return raObject;
                        }
                        var locRec = record.load({ type: 'location', id: locationId });
                        var subId = locRec.getValue({ fieldId: 'subsidiary' });
                        var scriptObj = runtime.getCurrentScript();
                        var jiarui = scriptObj.getParameter({ name: 'custscript_mmy_jiarui_sub' });
                        if (subId == jiarui) dataIn.entity = dataIn.entity + '-A';
                    }

                    //var customerId = getIdByExternalId(dataIn.entity, 'customer');
                    var customerId = getIdByName(dataIn.entity, 'customer', 'entityid');
                    if (isEmpty(customerId)) {
                        var result = {
                            success: false,
                            message: "Customer can not be located"
                        };
                        var logId = writeLog(dataIn, result);
                        return result;
                    }
                    _setValue(raRec, 'entity', customerId);
                    _setValue(raRec, 'location', locationId);

                    _setValue(raRec, 'externalid', 'RMA-' + dataIn.tranid);
                    _setValue(raRec, 'tranid', 'RMA-' + dataIn.tranid);
                    if (isEmpty(dataIn.trandate)) {
                        var result = {
                            success: false,
                            message: "Arguement is missing - trandate"
                        };
                        var logId = writeLog(dataIn, result);
                        return result;
                    }
                    _setValue(raRec, 'trandate', dataIn.trandate);
                    //log.debug({ title: 'date', details: dataIn.trandate });
                    _setValue(raRec, 'memo', dataIn.memo);
                    if (dataIn.salesrep) {
                        var salesRepId = getIdByName(dataIn.salesrep, 'employee', 'entityid');
                        if (isEmpty(salesRepId)) {
                            var result = {
                                success: false,
                                message: 'Invalid sales rep - ' + dataIn.salesrep
                            };
                            var logId = writeLog(dataIn, result);
                            return result;
                        }
                        _setValue(raRec, 'salesrep', salesRepId);
                    }
                    if (dataIn.department) {
                        var deptId = getIdByName(dataIn.department, 'department', 'custrecord1');
                        if (isEmpty(deptId)) {
                            var result = {
                                success: false,
                                message: 'Invalid department - ' + dataIn.department
                            };
                            var logId = writeLog(dataIn, result);
                            return result;
                        }
                        _setValue(raRec, 'department', deptId);
                    }
                    _setValue(raRec, 'custbody_order_source', 5);
                    _setValue(raRec, 'custbodypos_so_number', dataIn.custbody_pos_so_number);
                    _setValue(raRec, 'custbody_onlinesalesnumber', dataIn.custcol_onlineordernumber);
                    _setValue(raRec, 'custbody_logcom', dataIn.custbody_iflogcom);
                    _setValue(raRec, 'custbody_pos_serialnumber', dataIn.custbody_pos_serialnumber);
                    _setValue(raRec, 'exchangerate', dataIn.exchangerate);
                    _setText(raRec, 'terms', dataIn.terms);
                }

                // Shipping address
                if (true) {
                    raRec.setValue({ fieldId: 'shipaddresslist', value: null });
                    var subrec = raRec.getSubrecord({ fieldId: 'shippingaddress' });
                    subrec.setValue({ fieldId: 'attention', value: dataIn.attention });
                    subrec.setValue({ fieldId: 'addr1', value: dataIn.country + dataIn.addr1 });
                    subrec.setValue({ fieldId: 'zip', value: dataIn.zip });
                }

                var env = runtime.envType;
                log.debug({ title: 'environment', details: 'environment: ' + env });
                var items = dataIn.contents;
                for (var i = 0; i < items.length; i++) {
                    raRec.selectLine({ sublistId: 'item', line: i });
                    _setCurrentValue(raRec, 'item', 'item', items[i].selfid);
                    _setCurrentValue(raRec, 'item', 'quantity', items[i].quantity);
                    //_setCurrentValue(raRec, 'item', 'price', -1);
                    _setCurrentValue(raRec, 'item', 'rate', items[i].amount / items[i].quantity);
                    _setCurrentValue(raRec, 'item', 'amount', items[i].amount);
                    _setCurrentValue(raRec, 'item', 'location', locationId);
                    _setCurrentValue(raRec, 'item', 'taxcode', getTaxCode(dataIn.taxcode, env));
                    _setCurrentValue(raRec, 'item', 'amount', items[i].amount);
                    _setCurrentValue(raRec, 'item', 'tax1amt', items[i].tax1amt);
                    //_setCurrentValue(raRec, 'item', 'taxcode', i, items[i].taxcode);
                    //log.debug({ title: i, details: 'tax: ' + items[i].taxcode });
                    items[i].isclosed = convertBool(items[i].isclosed);
                    _setCurrentValue(raRec, 'item', 'isclosed', items[i].isclosed);
                    _setCurrentValue(raRec, 'item', 'custcol_pos_price2', items[i].custcol_pos_price2);
                    _setCurrentValue(raRec, 'item', 'custcol_pos_price3', items[i].custcol_pos_price3);
                    _setCurrentValue(raRec, 'item', 'custcol_pos_price4', items[i].custcol_pos_price4);
                    _setCurrentValue(raRec, 'item', 'custcol_pos_discount', items[i].custcol_pos_discount);
                    raRec.commitLine({ sublistId: 'item' });
                }

                // Remove old lines when updating happens
                var lineCount = raRec.getLineCount({ sublistId: 'item' });
                for (var i = items.length; i < lineCount; i++) {
                    raRec.removeLine({ sublistId: 'item', line: items.length });
                }

                var raId = raRec.save();
                log.debug({ title: 'raId', details: raId });
                raObject.success = true;
                raObject.returnid = raId;
                raObject.message = dataIn.tranid + ' is ';
                raObject.message += (isCreate ? 'created' : 'updated') + ' successfully';
                
                if (dataIn.needReceipt == 'T' || !dataIn.needReceipt) {
                    try {
                        var receiptRec = record.transform({
                            fromType: 'returnauthorization',
                            fromId: raId,
                            toType: 'itemreceipt'
                        });

                        dataIn.trandate = stringToDate(dataIn.trandate);
                        _setValue(receiptRec, 'trandate', dataIn.trandate);
                        _setValue(receiptRec, 'memo', dataIn.memo);
                        _setValue(receiptRec, 'location', locationId);
                        _setValue(receiptRec, 'tranid', 'RCT-' + dataIn.tranid);
                        _setValue(receiptRec, 'externalid', 'RCT-' + dataIn.tranid);

                        var lineCount = receiptRec.getLineCount({ sublistId: 'item' });
                        for (var i = 0; i < lineCount; i++) {
                            _setLineValue(receiptRec, 'item', 'itemreceive', i, true);
                            _setLineValue(receiptRec, 'item', 'location', i, locationId);
                            var remainQty = _getLineValue(receiptRec, 'item', 'quantityremaining', i);
                            _setLineValue(receiptRec, 'item', 'quantity', i, remainQty);
                        }
                        var receiptId = receiptRec.save({ enableSourcing: true, ignoreMandatoryFields: true });
                        log.debug({ title: 'receiptId', details: receiptId });
                        raObject.receiptid = receiptId;
                    }
                    catch (receiptEx) {
                        log.debug({ title: 'receipt error', details: receiptEx });
                        if (isCreate) record.delete({ type: 'returnauthorization', id: raId });
                        raObject.success = false;
                        raObject.receiptid = 'error_in_receipt_transformation';
                        raObject.message = receiptEx.message;
                        var logId = writeLog(dataIn, raObject);
                        return raObject;
                    }
                }

                var end = new Date();
                raObject.time = ((end - begin) / 1000).toFixed(2) + 'S';
                var logId = writeLog(dataIn, raObject);
                return raObject;
            }
            catch (ex) {
                log.debug({ title: '_post', details: ex });
                raObject.success = false;
                raObject.message = ex.message;
                var logId = writeLog(dataIn, raObject);
                return raObject;
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
            var scriptId = scriptObj.getParameter({ name: 'custscript_mmy_pos0406' });
            var logRec = record.create({ type: 'customrecord_pos_integrationlog' });
            logRec.setValue({ fieldId: 'custrecord_intlog_json', value: JSON.stringify(dataIn) });
            logRec.setValue({ fieldId: 'custrecord_intlog_succeed', value: response.success });
            logRec.setValue({ fieldId: 'custrecord_intlog_scriptname', value: scriptId });
            logRec.setValue({ fieldId: 'custrecord_intlog_apiid', value: 8 });
            var nsURL = 'https://rest.sandbox.netsuite.com/app/site/hosting/restlet.nl?script=286&deploy=1';
            logRec.setValue({ fieldId: 'custrecord_intlog_targeturl', value: nsURL });
            logRec.setValue({ fieldId: 'custrecord_intlog_resultjson', value: JSON.stringify(response) });
            var logId = logRec.save();
            log.debug({ title: 'log id', details: 'log id: ' + logId });
            return logId;
        }
        function validateSalesOrder(soId, context) {
            if (isEmpty(soId)) return { success: false, message: 'Invalid sales order id' };
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
                if (recType == 'creditmemo') {
                    return {
                        success: false,
                        message: 'Operation denied, ' + tranId + ' has been approved'
                    }
                }
            }
            deletePayments(soId);
            for (var i = 0; i < searchList.length; i++) {
                var recType = searchList[i].recordType;
                var recId = searchList[i].id;
                record.delete({ type: recType, id: recId });
            }
            return {
                success: true,
                message: 'transaction cleared'
            };
        }
        function deletePayments(soId) {
            // Delete payment schedule
            searchObj = search.create({
                type: 'customrecord_pos_paymentschedule',
                filters: ['custrecord_pos_salesorder', 'anyOf', [soId]]
            });
            var list = searchObj.run().getRange({ start: 0, end: 1000 });
            if (!isEmpty(list)) {
                for (var i = 0; i < list.length; i++) {
                    var scheduleId = list[i].id;
                    record.delete({ type: 'customrecord_pos_paymentschedule', id: scheduleId });
                }
            }
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
        function _setText(rec, fldId, val) {
            var value = rec.setText({ fieldId: fldId, value: val });
        }
        function _setValue(rec, fldId, val) {
            rec.setValue({ fieldId: fldId, value: val });
        }
        function _setCurrentValue(rec, listId, fldId, val) {
            var value = rec.setCurrentSublistValue({ sublistId: listId, fieldId: fldId, value: val });
        }
        function _setCurrentText(rec, listId, fldId, val) {
            var value = rec.setSublistText({ sublistId: listId, fieldId: fldId, value: val });
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
            var value = rec.setSublistValue({ sublistId: listId, fieldId: fldId, line: lNum, text: val });
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
        function getIdByName(name, type, field) {
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
        function getTaxCode(str, env) {
            var isSandbox = env == 'SANDBOX' ? true : false;
            var code = '';
            if (str == 'VAT_TW:Z-TW') code = isSandbox ? 38 : 77;
            else if (str == 'VAT_TW:免稅') code = isSandbox ? 1311 : 86;
            else if (str == 'VAT_TW:應稅') code = isSandbox ? 1310 : 85;
            else if (str == 'VAT_TW:零稅率') code = isSandbox ? 1312 : 87;
            else code = isSandbox ? 38 : 77;
            return code;
        }
        return { post: _do_post };
    });