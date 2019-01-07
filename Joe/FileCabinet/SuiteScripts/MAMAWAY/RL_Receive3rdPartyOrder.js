/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */

define(['N/record', 'N/format', 'N/search', 'N/runtime', 'N/https', 'N/url'],
    function (record, format, search, runtime, https, url) {
        function _do_post(dataIn) {
            var soObject = new Object();
            soObject.success = false;
            var begin = new Date();
            var POSType = dataIn.postype1;
            POSType = isEmpty(POSType) ? dataIn.type : POSType;
            var succeed = true;
            try {
                if (POSType == 0) {
                    if ('Sales order body fields') {
                        log.debug({ title: 'dataIn', details: JSON.stringify(dataIn) });
                        var soRec = '';
                        if (isEmpty(dataIn.tranid)) {
                            soObject.message = "Arguement is missing - tranid";
                            var logId = writeLog(dataIn, soObject);
                            return soObject;
                        }
                        var soId = getIdByExternalId('SO-' + dataIn.tranid, 'salesorder');
                        dataIn.internalid = soId;
                        dataIn.trandate = stringToDate(dataIn.trandate);
                        dataIn.closedate = getCloseDate();
                        if (isEmpty(soId)) {
                            if (dataIn.isdeleted == 'T') {
                                soObject.success = true;
                                soObject.message = 'Transaction can not be located';
                                var logId = writeLog(dataIn, soObject);
                                return soObject;
                            }
                            soRec = record.create({ type: 'salesorder' });
                        }
                        else {
                            var validation = validateSalesOrder(soId, dataIn);
                            if (validation.success) soRec = record.load({
                                type: 'salesorder', id: soId, isDynamic: true
                            });
                            else {
                                var logId = writeLog(dataIn, validation);
                                return validation;
                            }
                        }
                        if (isEmpty(soRec)) {
                            soObject.message = "Sales order can not be located";
                            var logId = writeLog(dataIn, soObject);
                            return soObject;
                        }
                        
                        if (dataIn.location) {
                            var locationId = getIdByExternalId(dataIn.location, 'location');
                            if (isEmpty(locationId)) {
                                soObject.message = "Warehouse can not be located";
                                var logId = writeLog(dataIn, soObject);
                                return soObject;
                            }
                            var locRec = record.load({ type: 'location', id: locationId });
                            var subId = locRec.getValue({ fieldId: 'subsidiary' });
                            var scriptObj = runtime.getCurrentScript();
                            var jiarui = scriptObj.getParameter({ name: 'custscript_mmy_jiarui_sub' });
                            if (subId == jiarui) dataIn.entity = dataIn.entity + '-A';
                        }

                        if (dataIn.isdeleted == 'T') {
                            soObject.success = true;
                            soObject.message = 'Transaction deleted';
                            record.delete({ type: 'salesorder', id: soId });
                            var logId = writeLog(dataIn, soObject);
                            return soObject;
                        }

                        var isCreate = isEmpty(dataIn.internalid);
                        _setValue(soRec, 'externalid', 'SO-' + dataIn.tranid);
                        _setValue(soRec, 'tranid', 'SO-' + dataIn.tranid);
                        //var customerId = getIdByExternalId(dataIn.entity, 'customer');
                        var customerId = getIdByName(dataIn.entity, 'customer', 'entityid');
                        if (isEmpty(customerId)) {
                            soObject.message = "Customer can not be located";
                            var logId = writeLog(dataIn, soObject);
                            return soObject;
                        }
                        _setValue(soRec, 'entity', customerId);
                        _setValue(soRec, 'location', locationId);
                        if (isEmpty(dataIn.trandate)) {
                            soObject.message = "Arguement is missing - trandate";
                            var logId = writeLog(dataIn, soObject);
                            return soObject;
                        }
                        _setValue(soRec, 'trandate', dataIn.trandate);
                        _setValue(soRec, 'memo', dataIn.memo);
                        if (dataIn.salesrep) {
                            var salesRepId = getIdByName(dataIn.salesrep, 'employee', 'entityid');
                            if (isEmpty(salesRepId)) {
                                soObject.message = 'Invalid sales rep - ' + dataIn.salesrep;
                                var logId = writeLog(dataIn, soObject);
                                return soObject;
                            }
                            _setValue(soRec, 'salesrep', salesRepId);
                        }
                        if (dataIn.department) {
                            var deptId = getIdByName(dataIn.department, 'department', 'custrecord1');
                            if (isEmpty(deptId)) {
                                soObject.message = 'Invalid department - ' + dataIn.department;
                                var logId = writeLog(dataIn, soObject);
                                return soObject;
                            }
                            _setValue(soRec, 'department', deptId);
                        }
                        _setText(soRec, 'terms', dataIn.terms);
                        _setValue(soRec, 'ccnumber', dataIn.ccnumber);
                        _setValue(soRec, 'custbody_order_source', 3);
                        _setValue(soRec, 'custbody_logcom', dataIn.custbody_iflogcom);
                        _setValue(soRec, 'custbody_pos_serialnumber', dataIn.custbody_pos_serialnumber);
                        _setValue(soRec, 'custbody_onlinesalesnumber', dataIn.custcol_onlineordernumber);
                        _setValue(soRec, 'custbodypos_so_number', dataIn.custbody_pos_so_number);
                        _setText(soRec, 'currency', dataIn.currency);
                        _setValue(soRec, 'exchangerate', dataIn.exchangerate);
                    }

                    // Shipping address
                    if (true) {
                        soRec.setValue({ fieldId: 'shipaddresslist', value: null });
                        var subrec = soRec.getSubrecord({ fieldId: 'shippingaddress' });
                        subrec.setValue({ fieldId: 'attention', value: dataIn.attention });
                        subrec.setValue({ fieldId: 'zip', value: dataIn.zip });
                        subrec.setValue({ fieldId: 'addr1', value: dataIn.country + dataIn.addr1 });
                    }

                    var items = dataIn.contents;
                    for (var i = 0; i < items.length; i++) {
                        if (isCreate) {
                            _setLineValue(soRec, 'item', 'item', i, items[i].selfid);
                            _setLineValue(soRec, 'item', 'quantity', i, items[i].quantity);
                            _setLineValue(soRec, 'item', 'price', i, -1);
                            _setLineValue(soRec, 'item', 'rate', i, items[i].amount / items[i].quantity);
                            var taxCode = isEmpty(dataIn.taxcode) ? items[i].taxcode : dataIn.taxcode;
                            //_setLineValue(soRec, 'item', 'taxcode', i, taxCode);
                            _setLineText(soRec, 'item', 'taxcode', i, items[i].taxcode);
                            _setLineValue(soRec, 'item', 'amount', i, items[i].amount);
                            _setLineValue(soRec, 'item', 'tax1amt', i, items[i].tax1amt);
                            //_setLineValue(soRec, 'item', 'grossamt', i, items[i].grossamt);
                            items[i].isclosed = convertBool(items[i].isclosed);
                            _setLineValue(soRec, 'item', 'isclosed', i, items[i].isclosed);
                            _setLineValue(soRec, 'item', 'custcol_pos_price1', i, items[i].custcol_pos_price1);
                            _setLineValue(soRec, 'item', 'custcol_pos_price2', i, items[i].custcol_pos_price2);
                            _setLineValue(soRec, 'item', 'custcol_pos_price3', i, items[i].custcol_pos_price3);
                            _setLineValue(soRec, 'item', 'custcol_pos_price4', i, items[i].custcol_pos_price4);
                            _setLineValue(soRec, 'item', 'custcol_pos_discount', i, items[i].custcol_pos_discount);
                        }
                        else {
                            soRec.selectLine({ sublistId: 'item', line: i });
                            _setCurrentValue(soRec, 'item', 'item', items[i].selfid);
                            _setCurrentValue(soRec, 'item', 'quantity', items[i].quantity);
                            _setCurrentValue(soRec, 'item', 'price', -1);
                            _setCurrentValue(soRec, 'item', 'rate', items[i].amount / items[i].quantity);
                            var taxCode = isEmpty(dataIn.taxcode) ? items[i].taxcode : dataIn.taxcode;
                            _setCurrentText(soRec, 'item', 'taxcode', items[i].taxcode);
                            _setCurrentValue(soRec, 'item', 'amount', items[i].amount);
                            _setCurrentValue(soRec, 'item', 'tax1amt', items[i].tax1amt);
                            //_setCurrentValue(soRec, 'item', 'grossamt', items[i].grossamt);
                            items[i].isclosed = convertBool(items[i].isclosed);
                            _setCurrentValue(soRec, 'item', 'isclosed', items[i].isclosed);
                            _setCurrentValue(soRec, 'item', 'custcol_pos_price1', items[i].custcol_pos_price1);
                            _setCurrentValue(soRec, 'item', 'custcol_pos_price2', items[i].custcol_pos_price2);
                            _setCurrentValue(soRec, 'item', 'custcol_pos_price3', items[i].custcol_pos_price3);
                            _setCurrentValue(soRec, 'item', 'custcol_pos_price4', items[i].custcol_pos_price4);
                            _setCurrentValue(soRec, 'item', 'custcol_pos_discount', items[i].custcol_pos_discount);
                            soRec.commitLine({ sublistId: 'item' });
                        }
                    }

                    // Remove old lines when updating happens
                    var lineCount = soRec.getLineCount({ sublistId: 'item' });
                    for (var i = items.length; i < lineCount; i++) {
                        soRec.removeLine({ sublistId: 'item', line: items.length });
                    }

                    //var soId = soRec.save({ enableSourcing: true, ignoreMandatoryFields: true });
                    var soId = soRec.save({ enableSourcing: false, ignoreMandatoryFields: true });
                    log.debug({ title: 'soId', details: soId });
                    soObject.success = true;
                    soObject.soid = soId;
                    var isCreate = isEmpty(dataIn.internalid);
                    soObject.message = dataIn.tranid + ' is ';
                    soObject.message += (isCreate ? 'created' : 'updated') + ' successfully';

                    // Generate customer deposit
                    if (dataIn.payments) {
                        var scriptObj = runtime.getCurrentScript();
                        var paramJSON = scriptObj.getParameter({ name: 'custscript_mmy_globalposparam' });
                        paramJSON = JSON.parse(paramJSON);
                        var deposits = dataIn.payments;
                        for (var i = 0; i < deposits.length; i++) {

                            // Transform sales order to deposit
                            try {
                                var depositRec = record.create({ type: 'customerdeposit', });
                                _setValue(depositRec, 'customer', customerId);
                                _setText(depositRec, 'currency', dataIn.currency);
                                _setValue(depositRec, 'salesorder', soId);
                                _setValue(depositRec, 'payment', deposits[i].custrecord_pos_payment_amount);
                                //_setValue(depositRec, 'memo', deposits[i].memo);
                                _setValue(depositRec, 'paymentmethod', deposits[i].custrecord_pos_method);
                                _setValue(depositRec, 'location', locationId);
                                _setValue(depositRec, 'department', deptId);
                                _setValue(depositRec, 'exchangerate', dataIn.exchangerate);
                                _setValue(depositRec, 'trandate', dataIn.trandate);
                                _setValue(depositRec, 'custbody_mmy_ccnumber', dataIn.payments[i].ccnumber);
                                _setValue(depositRec, 'undepfunds', 'T');
                                _setValue(depositRec, 'tranid', 'CD-' + dataIn.tranid + '-' + i);
                                _setValue(depositRec, 'externalid', 'CD-' + dataIn.tranid + '-' + i);

                                var depositId = depositRec.save({
                                    enableSourcing: true, ignoreMandatoryFields: true
                                });
                                log.debug({ title: i, details: 'deposit: ' + depositId });
                                soObject.depositid = depositId;
                            }
                            catch (depositEx) {
                                log.debug({ title: i, details: 'deposit error: ' + depositEx });
                                if (isCreate) record.delete({ type: 'salesorder', id: soId });
                                soObject.success = false;
                                soObject.depositid = 'error_in_deposit';
                                soObject.message = depositEx.message;
                                var logId = writeLog(dataIn, soObject);
                                return soObject;
                            }
                        }
                    }

                    // Transform sales order to invioce
                    if (succeed && false) {
                        try {
                            var invoiceRec = record.transform({
                                fromType: 'salesorder', fromId: soId, toType: 'invoice'
                            });

                            dataIn.trandate = stringToDate(dataIn.trandate, format);
                            _setValue(invoiceRec, 'trandate', dataIn.trandate);
                            _setValue(invoiceRec, 'memo', dataIn.memo);
                            _setValue(invoiceRec, 'salesrep', salesRepId);
                            _setValue(invoiceRec, 'department', deptId);
                            _setText(invoiceRec, 'terms', dataIn.terms);
                            _setValue(invoiceRec, 'location', locationId);
                            _setValue(invoiceRec, 'approvalstatus', 1);
                            _setValue(invoiceRec, 'exchangerate', dataIn.exchangerate);
                            _setValue(invoiceRec, 'duedate', stringToDate(dataIn.paydate));
                            _setValue(invoiceRec, 'tranid', 'INV-' + dataIn.tranid);
                            _setValue(invoiceRec, 'externalid', 'INV-' + dataIn.tranid);

                            invoiceId = invoiceRec.save({ enableSourcing: true, ignoreMandatoryFields: true });
                            log.debug({ title: 'invoiceId', details: invoiceId });
                            soObject.invoiceid = invoiceId;
                        }
                        catch (invoiceEx) {
                            log.debug({ title: 'invoice error', details: invoiceEx });
                            if (isCreate) record.delete({ type: 'salesorder', id: soId });
                            soObject.invoiceid = 'error_in_invoice_transformation';
                            soObject.message = invoiceEx.message;
                            var logId = writeLog(dataIn, soObject);
                            return soObject;
                        }
                    }

                    // Generate payemnt schedule
                    if (dataIn.payments) {
                        var scriptObj = runtime.getCurrentScript();
                        var paramJSON = scriptObj.getParameter({ name: 'custscript_mmy_globalposparam' });
                        paramJSON = JSON.parse(paramJSON);
                        var paySchedules = dataIn.payments;
                        for (var i = 0; i < paySchedules.length; i++) {
                            var methodName = paySchedules[i].custrecord_pos_method;
                            var ccNumber = paySchedules[i].ccnumber;
                            if (isEmpty(methodName)) break;
                            var amount = paySchedules[i].custrecord_pos_payment_amount;
                            if (isEmpty(amount)) break;

                            try {
                                var schedule = record.create({ type: 'customrecord_pos_paymentschedule' });
                                _setValue(schedule, 'custrecord_pos_method', methodName);
                                _setValue(schedule, 'custrecord_pos_payment_amount', amount);
                                //_setValue(schedule, 'custrecord_pos_trnx', invoiceId);
                                _setValue(schedule, 'custrecord_pos_salesorder', soId);
                                _setValue(schedule, 'custrecord_pos_date', stringToDate(dataIn.paydate));
                                _setValue(schedule, 'custrecord_pos_terms', paySchedules[i].terms);
                                _setValue(schedule, 'custrecord_pos_ccnumber', ccNumber);
                                scheduleId = schedule.save({ enableSourcing: true, ignoreMandatoryFields: true });
                                //log.debug({ title: i + ', schedule id', details: scheduleId });
                            }
                            catch (paymentEx) {
                                log.debug({ title: 'paymentEx', details: paymentEx });
                                soObject.success = false;
                                soObject.message = paymentEx.message;
                                var logId = writeLog(dataIn, soObject);
                                return soObject;
                            }
                        }
                    }

                    var end = new Date();
                    soObject.time = ((end - begin) / 1000).toFixed(2) + 's';
                    var logId = writeLog(dataIn, soObject);
                    return soObject;
                }

                if (POSType == 1) {

                    var restUrl = url.resolveScript({
                        scriptId: 'customscript_mmy_pos_04_03_type_1',
                        deploymentId: 'customdeploy_mmy_pos_04_03_type_1',
                        returnExternalUrl: true
                    });
                    log.debug('restUrl', restUrl);

                    // Generate request headers
                    var scriptObj = runtime.getCurrentScript();
                    var accountId = scriptObj.getParameter({ name: 'custscript_mmy_accountid' });
                    var email = scriptObj.getParameter({ name: 'custscript_mmy_adminemail' });
                    var psd = scriptObj.getParameter({ name: 'custscript_mmy_nspassword' });
                    var roleId = scriptObj.getParameter({ name: 'custscript_mmy_adminrole' });
                    var authStr = 'NLAuth nlauth_account=' + accountId;
                    authStr += ',nlauth_email=' + email;
                    authStr += ',nlauth_signature=' + psd;
                    authStr += ',nlauth_role=' + roleId;

                    headers = {
                        'Content-type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': authStr
                    };

                    // Perform HTTP POST call
                    dataIn = JSON.stringify(dataIn);
                    var response = https.post({ url: restUrl, headers: headers, body: dataIn });
                    var obj = JSON.parse(response.body);
                    log.debug('dataIn', dataIn);
                    log.debug('response', obj);
                    return obj;
                }
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
            var scriptId = scriptObj.getParameter({ name: 'custscript_mmy_pos04030' });
            var logRec = record.create({ type: 'customrecord_pos_integrationlog' });
            logRec.setValue({ fieldId: 'custrecord_intlog_json', value: JSON.stringify(dataIn) });
            logRec.setValue({ fieldId: 'custrecord_intlog_succeed', value: response.success });
            logRec.setValue({ fieldId: 'custrecord_intlog_scriptname', value: scriptId });
            logRec.setValue({ fieldId: 'custrecord_intlog_apiid', value: 5 });
            var nsURL = 'https://rest.sandbox.netsuite.com/app/site/hosting/restlet.nl?';
            nsURL += 'script=' + scriptId + '&deploy=1';
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
                return { success: true, message: 'no related records' };
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
                if (recType == 'itemfulfillment') {
                    return {
                        success: false,
                        message: 'Operation denied, ' + tranId + ' has been fulfilled'
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
        function _setCurrentValue(rec, listId, fldId, val) {
            var value = rec.setCurrentSublistValue({ sublistId: listId, fieldId: fldId, value: val });
        }
        function _setCurrentText(rec, listId, fldId, text) {
            var value = rec.setCurrentSublistText({ sublistId: listId, fieldId: fldId, text: text });
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
        function dateToString(obj, format) {
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
        return { post: _do_post };
    });