/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */

define(['N/record', 'N/format', 'N/search', 'N/runtime'],
    function (record, format, search, runtime) {
        function _post(context) {
            var responseObject = new Object();
            responseObject.success = false;
            try {
                var begin = new Date();
                context.closedate = getCloseDate();
                var soId = context.createdfrom;
                var soRec = '';
                var invoiceNumber = context.tranid;
                context.trandate = stringToDate(context.trandate);
                var validation = validateInvoice('INV-' + invoiceNumber, context);
                if (!validation.success) {
                    var logId = writeLog(context, validation);
                    return validation;
                }
                log.debug({ title: 'validation', details: validation });
                // var isDel = context.isdeleted == 'T' ||
				// context.custbody_in_status == '作廢';
                if (context.isdeleted == 'T' || context.custbody_in_status == '作廢') {
                    try {
                        record.delete({ type: 'invoice', id: validation.invoiceId });
                        responseObject.success = true;
                        responseObject.message = 'Invoice deleted';
                    }
                    catch (ex) {
                        responseObject.success = true;
                        responseObject.message = 'Invoice can not be found';
                    }
                    var logId = writeLog(context, responseObject);
                    return responseObject;
                }

                if (context.ordertype == 'itemfulfillment') {
                    var fulfillId = getIdByNumber('FUL-' + context.createdfrom, 'itemfulfillment');
                    var fieldLookUp = search.lookupFields({
                        type: 'itemfulfillment', id: fulfillId.id, columns: ['createdfrom']
                    });
                    soId = fieldLookUp.createdfrom[0].value;
                }
                else {
                    soRec = getIdByNumber('SO-' + context.createdfrom, 'transaction');
                    soId = soRec.id;
                }
                if (isEmpty(soId)) {
                    responseObject.message = context.createdfrom + ' can not be located';
                    var logId = writeLog(context, responseObject);
                    return responseObject;
                }
                context.soid = soId;
                // var recType = soRec.recordType;
                var recType = 'salesorder';
                var invoiceRec = '';
                if (validation.invoiceId) invoiceRec = record.load({
                    type: 'invoice', id: validation.invoiceId// ,
																// isDynamic:true
                });
                else invoiceRec = record.transform({
                    fromType: 'salesorder', fromId: soId, toType: 'invoice'// ,
																			// isDynamic:
																			// true
                });
                var tranDate = _getValue(invoiceRec, 'trandate');
                // log.debug({ title: 'test 1', details: context.trandate });
                var firstDate = getFirstDate(context.trandate);
                // log.debug({ title: 'test 2', details: firstDate });
                if (true) {
                    if (!validation.invoiceId) _setValue(invoiceRec, 'approvalstatus', 1);
                    _setValue(invoiceRec, 'tranid', 'INV-' + context.tranid);
                    _setValue(invoiceRec, 'externalid', 'INV-' + context.tranid);
                    if (isEmpty(context.trandate)) {
                        var result = {
                            success: false,
                            message: "Arguement is missing - trandate"
                        };
                        var logId = writeLog(context, result);
                        return result;
                    }
                    _setValue(invoiceRec, 'trandate', context.trandate);

                    if (context.department) {
                        var deptId = getIdByName(context.department, 'department', 'custrecord1');
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

                    var bizOwner = convertNull(context.custbody_coi_tv_business_owner);
                    var docFormat = convertNull(context.custbody_coi_tv_doc_format);
                    var docNo = convertNull(context.custbody_coi_tv_doc_no);
                    var zeroAmt = convertNull(context.custbody_coi_tv_zero_amount_no);
                    var unifiedCode = convertNull(context.custbody_coi_tv_unified_code_copy);
                    // 20171201 sw update start
                    // _setText(invoiceRec, 'custbody_coi_tv_business_owner',
					// bizOwner);
                    // _setText(invoiceRec, 'custbody_coi_tv_doc_format',
					// docFormat);
                    // _setValue(invoiceRec,
					// 'custbody_coi_tv_hidden_date_sales', firstDate);
                    // 20171201 sw update end
                    // _setText(invoiceRec, 'custbody_coi_tv_doc_no', docNo);
                    // _setValue(invoiceRec, 'custbody_coi_tv_doc_no', 1913);
                    _setValue(invoiceRec, 'custbody_coi_tv_zero_amount_no', zeroAmt);
                    _setValue(invoiceRec, 'custbody_coi_tv_unified_code_copy', unifiedCode);

                    // If order type=fulfillment, generate invoice based on
					// fulfillment
                    if (false && context.ordertype == 'itemfulfillment') {
                        var fulfillId = getFulfillment(soId);
                        if (isEmpty(fulfillId)) {
                            var result = {
                                success: false,
                                message: 'Fulfillment can not be located'
                            };
                            var logId = writeLog(context, result);
                            return result;
                        }
                        var fulfillRec = record.load({ type: 'itemfulfillment', id: fulfillId });
                        var fLnCnt = parseFloat(fulfillRec.getLineCount({ sublistId: 'item' }));
                        var lineCount = parseFloat(invoiceRec.getLineCount({ sublistId: 'item' }));

                        for (var i = lineCount - 1; i > -1; i--) {
                            var iItem = _getLineValue(invoiceRec, 'item', 'item', i);
                            var matched = false;
                            for (var j = 0; j < fLnCnt; j++) {
                                var fItem = _getLineValue(fulfillRec, 'item', 'item', j);
                                var fQty = _getLineValue(fulfillRec, 'item', 'quantity', j);
                                if (fItem == iItem) {
                                    matched = true;
                                    _setLineValue(invoiceRec, 'item', 'quantity', i, fQty);
                                    continue;
                                }
                            }
                            if (!matched) invoiceRec.removeLine({ sublistId: 'item', line: i });
                        }
                    }

                    if (context.contents) {
                        var fLnCnt = context.contents.length;
                        var lineCount = parseFloat(invoiceRec.getLineCount({ sublistId: 'item' }));

                        for (var i = lineCount - 1; i > -1; i--) {
                            var iItem = _getLineValue(invoiceRec, 'item', 'item', i);
                            var matched = false;
                            for (var j = 0; j < fLnCnt; j++) {
                                var fItem = context.contents[j].selfid;
                                var fQty = context.contents[j].quantity;
                                var amt = context.contents[j].amount
                                var taxCode = context.contents[j].taxcode
                                var taxAmt = context.contents[j].tax1amt;
                                if (fItem == iItem) {
                                    matched = true;
                                    _setLineValue(invoiceRec, 'item', 'quantity', i, fQty);
                                    _setLineValue(invoiceRec, 'item', 'rate', i, (amt / fQty).toFixed(8));
                                    _setLineValue(invoiceRec, 'item', 'amount', i, amt);
                                    _setLineText(invoiceRec, 'item', 'taxcode', i, taxCode);
                                    _setLineValue(invoiceRec, 'item', 'tax1amt', i, taxAmt);
                                    continue;
                                }
                            }
                            if (!matched) invoiceRec.removeLine({ sublistId: 'item', line: i });
                        }
                    }

                    // _setValue(invoiceRec, 'approvalstatus', 2);
                    invoiceId = invoiceRec.save({ enableSourcing: true, ignoreMandatoryFields: true });
                    
                    var docId = submitDocNo(invoiceId, docNo, bizOwner, docFormat);
                    if (!isEmpty(docNo) && isEmpty(docId)) {
                        log.debug({ title: 'validation', details: validation });
                        if (validation.isCreate) record.delete({ type: 'invoice', id: invoiceId });
                        responseObject.message = 'Invalid Taiwan Invoice #: ' + docNo;
                        var logId = writeLog(context, responseObject);
                        return responseObject; 
                    }

                    responseObject.success = true;
                    var invoiceNumber = invoiceRec.getValue({ fieldId: 'tranid' });
                    responseObject.internalid = invoiceId;
                    responseObject.tranid = invoiceNumber;
                    responseObject.message = 'Invoice ' + invoiceNumber + ' is created.';

                    if (context.invoicetype == 0) {
                        invoiceRec = record.load({ type: 'invoice', id: invoiceId });
                        if (invoiceRec.getValue({ fieldId: 'status' }) == 'Open') {
                            var payList = getPaymentSchedule(invoiceRec);
                            for (var i = 0; !isEmpty(payList) && i < payList.length; i++) {
                                var payId = payList[i].getValue({ name: 'custrecord_mmy_payment' });
                                var schId = payList[i].id;
                                if (!isEmpty(payId)) continue;
                                var payRec = record.transform({ fromType: 'invoice', fromId: invoiceId, toType: 'customerpayment' });
                                payRec.setValue({ fieldId: 'trandate', value: tranDate });
                                payRec.setValue({ fieldId: 'tranid', value: 'CP-' + context.tranid });
                                payRec.setValue({ fieldId: 'externalid', value: 'CP-' + context.tranid });
                                // payRec.setValue({ fieldId: 'undepfunds',
								// value: false });
                                var paymentMethod = payList[i].getValue({ name: 'custrecord_pos_method' });
                                payRec.setValue({ fieldId: 'paymentmethod', value: paymentMethod });
                                payRec.setValue({ fieldId: 'custbody_mmy_payschno', value: schId });
                                var ccNumber = payList[i].getValue({ name: 'custrecord_pos_ccnumber' });
                                // payRec.setValue({ fieldId: 'ccnumber', value:
								// ccNumber });
                                var lineCont = payRec.getLineCount({ sublistId: 'apply' });
                                for (var j = 0; j <= lineCont; j++) {
                                    var applied = payRec.getSublistValue({
                                        sublistId: 'apply', fieldId: 'apply', line: j
                                    });
                                    if (applied == true) {
                                        var payAmt = payList[i].getValue({ name: 'custrecord_pos_payment_amount' });
                                        _setLineValue(payRec, 'apply', 'amount', j, payAmt);
                                    }
                                }
                                payRec.setValue({ fieldId: 'account', value: 857 });
                                payId = payRec.save({ enableSourcing: true, ignoreMandatoryFields: true });
                                // log.debug({ title: i, details: 'payment id: '
								// + payId + ', schId: ' + schId });
                                record.submitFields({
                                    type: 'customerpayment',
                                    id: payId,
                                    values: { 'account': 857 }
                                });
                                record.submitFields({
                                    type: 'customrecord_pos_paymentschedule',
                                    id: schId,
                                    values: { 'custrecord_mmy_payment': payId }
                                });
                            }
                        }
                    }
                    // Update all deposit applications date the same as invoice
                    updateDepositApplication(invoiceId, context);
                }
                var end = new Date();
                responseObject.time = ((end - begin) / 1000).toFixed(2) + 's';
                var logId = writeLog(context, responseObject);
                return responseObject;
            }
            catch (ex) {
                log.debug({ title: '_post', details: ex });
                responseObject.success = false;
                responseObject.message = ex.message;
                responseObject.name = ex.name;
                var logId = writeLog(context, responseObject);
                return responseObject;
            }
        }
        function updateDepositApplication(invoiceId, context) {
            var tranType = 'depositapplication';
            var searchObj = search.create({
                type: tranType,
                filters: ['appliedtotransaction', 'anyOf', [invoiceId]],
                columns: ['tranid', 'trandate','amount']
            })
            var list = searchObj.run().getRange({ start: 0, end: 1000 });
            for (var i = 0; !isEmpty(list) && i < list.length; i++) {
                record.submitFields({
                    type: tranType,
                    id: list[i].id,
                    values: {
                        trandate: format.format({
                            value: context.trandate,
                            type: 'date'
                        })
                    },
                    options: {
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    }
                });
            }
        }
        function submitDocNo(id, DocNo, bizOwner, docFormat) {
            if (isEmpty(DocNo)) return '';
            var docId = getIdByName(DocNo, 'customrecord_coi_tv_docs_detail', 'name');
            if (isEmpty(docId)) return '';
            try {
                var rec = record.load({ type: 'invoice', id: id, isDynamic: true });
                _setValue(rec, 'approvalstatus', 2);

                var oldOwner = rec.getText({ fieldId: 'custbody_coi_tv_business_owner' });
                var oldDocFormat = rec.getText({ fieldId: 'custbody_coi_tv_doc_format' });
                var oldDocId = rec.getValue({ fieldId: 'custbody_coi_tv_doc_no' });

                var isChanged = bizOwner != oldOwner || docFormat != oldDocFormat || docId != oldDocId;
                bizOwner != oldOwner ? _setText(rec, 'custbody_coi_tv_business_owner', bizOwner) : "";
                docFormat != oldDocFormat ? _setText(rec, 'custbody_coi_tv_doc_format', docFormat) : "";
                docId != oldDocId ? _setValue(rec, 'custbody_coi_tv_doc_no', docId) : "";
                isChanged ? rec.save({ enableSourcing: true, ignoreMandatoryFields: true }) : "";
            }
            catch (ex) {
                docId = '';
            }
            return docId;
        }
        function getFirstDate(tranDate) {
            tranDate = new Date(tranDate);
            var dateStr = tranDate.getFullYear() + '/' + (tranDate.getMonth() + 1) + '/1';
            var firstDate = new Date(dateStr);
            return firstDate;
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
            var scriptId = scriptObj.getParameter({ name: 'custscript_mmy_pos0402' });
            var logRec = record.create({ type: 'customrecord_pos_integrationlog' });
            logRec.setValue({ fieldId: 'custrecord_intlog_json', value: JSON.stringify(dataIn) });
            logRec.setValue({ fieldId: 'custrecord_intlog_succeed', value: response.success });
            logRec.setValue({ fieldId: 'custrecord_intlog_scriptname', value: scriptId });
            logRec.setValue({ fieldId: 'custrecord_intlog_apiid', value: 4 });
            var nsURL = 'https://rest.sandbox.netsuite.com/app/site/hosting/restlet.nl?';
            nsURL += 'script=' + scriptId + '&deploy=1';
            logRec.setValue({ fieldId: 'custrecord_intlog_targeturl', value: nsURL });
            logRec.setValue({ fieldId: 'custrecord_intlog_resultjson', value: JSON.stringify(response) });
            var logId = logRec.save();
            log.debug({ title: 'log id', details: 'log id: ' + logId });
            return logId;
        }
        function validateInvoice(tranid, context) {
            var filters = new Array();
            filters.push(['tranid', 'is', tranid]);
            filters.push('and');
            filters.push(['mainline', 'is', 'T']);
            var columns = [];
            columns.push('applyingtransaction');
            columns.push('applyingtransaction.trandate');
            columns.push('applyingtransaction.recordtype');
            columns.push('applyingtransaction.tranid');
            columns.push('trandate');
            var searchObj = search.create({
                type: 'transaction', filters: filters, columns: columns
            });
            var searchList = searchObj.run().getRange({ start: 0, end: 1000 });
            if (isEmpty(searchList)) return {
                success: true, message:
                'No related records',
                invoiceId: '',
                isCreate: true
            };

            // Check payments
            var len = searchList.length;
            // log.debug({ title: 'len', details: len });
            for (var i = 0; 1 < len && i < len; i++) {
                var tranDate = searchList[i].getValue(columns[1]);
                tranDate = stringToDate(tranDate);
                if (context.closedate - tranDate > 0) {
                    return {
                        success: false,
                        message: 'Operation denied, crossing periods is not allowed - payment'
                    }
                }
            }

            // Check JSON date
            if (context.closedate - context.trandate > 0) {
                return {
                    success: false,
                    message: 'Operation denied, crossing periods is not allowed - JSON'
                }
            }

            // Check invoice date
            var invoiceDate = searchList[0].getValue(columns[4]);
            if (context.closedate - invoiceDate > 0) {
                return {
                    success: false,
                    message: 'Operation denied, crossing periods is not allowed - invoice'
                }
            }

            // Delete payments
            for (var i = 0; 1 < len && i < len; i++) {
                var recType = searchList[i].getValue(columns[2]);
                var recId = searchList[i].getValue(columns[0]);
                if (isEmpty(recType) || isEmpty(recId)) continue;
                // log.debug({ title: recType, details: recId });
                record.delete({ type: recType, id: recId });
            }

            // Delete application
            searchObj = search.create({
                type: 'transaction', filters: filters, columns: columns
            });
            searchList = searchObj.run().getRange({ start: 0, end: 1000 });
            // log.debug({ title: 'searchList', details: searchList.length });
            for (var i = 0; !isEmpty(searchList) && i < searchList.length; i++) {
                // log.debug({ title: 'recType', details: recType });
                var recType = searchList[i].getValue(columns[2]);
                if (recType != 'depositapplication') continue;
                var recId = searchList[i].getValue(columns[0]);
                if (isEmpty(recType) || isEmpty(recId)) continue;
                // log.debug({ title: recType, details: recId });
                record.delete({ type: recType, id: recId });
            }
            // log.debug({ title: 'test', details: 'deposit application deleted'
			// });

            return {
                success: true,
                message: 'transaction cleared',
                invoiceId: searchList[0].id,
                isCreate: false
            };
        }
        function getInvoiceRec(context) {
            var soId = context.createdfrom;
            var invoiceId = context.internalid;
            var result = new Object();
            result.success = false;
            result.message = '';
            result.record = '';
            if (isEmpty(soId) && isEmpty(invoiceId)) {
                result.message = 'Either SO ID or invoice ID is needed';
                return result;
            }
            var tranDate = '';
            var invoiceRec = '';
            var soId = getIdByExternalId(context.createdfrom, 'salesorder');
            soId = isEmpty(soId) ? context.createdfrom : soId;

            if (isEmpty(invoiceId)) {

                // Invoice ID is not specified, search invoice
                var filters = new Array();
                filters.push(['createdfrom.internalid', 'anyOf', [soId]]);
                var columns = new Array();
                columns.push('createdfrom.internalid');

                var searchObj = search.create({
                    type: 'invoice', filters: filters, columns: columns
                });
                var existList = searchObj.run().getRange({ start: 0, end: 1000 });
                invoiceId = isEmpty(existList) ? '' : existList[0].id;

                if (isEmpty(invoiceId)) {

                    // Not able to find existing invoice, tranform a new invoice
                    invoiceRec = record.transform({
                        fromType: 'salesorder',
                        fromId: soId,
                        toType: 'invoice'
                    });
                    var invoiceDate = stringToDate(context.trandate);
                    if (isEmpty(invoiceDate)) {
                        invoiceDate = new Date();
                    }
                    else {
                        var currentDate = new Date();
                        if (invoiceDate.getMonth() != currentDate.getMonth()) {
                            result.success = false;
                            result.message = 'Operation denied, crossing periods is not allowed.';
                            return result;
                        }
                    }
                    _setValue(invoiceRec, 'trandate', invoiceDate);
                }
            }

            // If existing invoice is found, use exiting invoice
            if (!isEmpty(invoiceId)) invoiceRec = record.load({ type: 'invoice', id: invoiceId });
            var invoiceDate = _getValue(invoiceRec, 'trandate');
            var jsonDate = stringToDate(context.trandate);
            jsonDate = isEmpty(jsonDate) ? invoiceDate : jsonDate;
            if (invoiceDate.getMonth() != jsonDate.getMonth()) {
                result.success = false;
                result.message = 'Operation denied, crossing periods is not allowed.';
                return result;
            }
            _setValue(invoiceRec, 'trandate', jsonDate);

            result.success = true;
            result.record = invoiceRec;
            result.message = 'Invoice is found';
            return result;
        }
        function deletePayments(invoiceId) {
            // Delete customer payment
            var columns = ['appliedtotransaction'];
            var filters = [
                ['appliedtotransaction', 'anyOf', [invoiceId]],
                'and',
                ['mainline', 'is', false]
            ];
            var searchObj = search.create({
                type: 'customerpayment', filters: filters, columns: columns
            });
            var list = searchObj.run().getRange({ start: 0, end: 1000 });
            if (!isEmpty(list)) {
                for (var i = 0; i < list.length; i++) {
                    var payId = list[i].id;
                    record.delete({ type: 'customerpayment', id: payId });
                }
            }

            // Delete payment schedule
            searchObj = search.create({
                type: 'customrecord_pos_paymentschedule',
                filters: ['custrecord_pos_trnx', 'anyOf', [invoiceId]]
            });
            list = searchObj.run().getRange({ start: 0, end: 1000 });
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
        function _setValue(rec, fldId, val) {
            rec.setValue({ fieldId: fldId, value: val });
            return true;
        }
        function _getValue(rec, fldId) {
            return rec.getValue({ fieldId: fldId });
        }
        function _getLineValue(rec, listId, fldId, lNum) {
            var value = rec.getSublistValue({ sublistId: listId, fieldId: fldId, line: lNum });
            return convertEmpty(value);
        }
        function _setText(rec, fldId, val) {
            rec.setText({ fieldId: fldId, text: val });
            return true;
        }
        function _setLineValue(rec, listId, fldId, lNum, val) {
            rec.setSublistValue({ sublistId: listId, fieldId: fldId, line: lNum, value: convertNull(val) });
        }
        function _setLineText(rec, listId, fldId, lNum, val) {
            rec.setSublistText({
                sublistId: listId, fieldId: fldId, line: lNum, text: convertNull(val)
            });
        }
        function _setCurrentLine(rec, listId, fldId, val) {
            rec.setCurrentSublistValue({ sublistId: listId, fieldId: fldId, value: convertNull(val) });
        }
        function getFulfillment(soid) {
            var filters = new Array();
            filters.push(['createdfrom', 'anyOf', [soid]]);
            filters.push('and');
            filters.push(['mainline', 'is', 'T']);
            var searchObj = search.create({ type: 'itemfulfillment', filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0].id;
        }
        function getIdByExternalId(externalId, type) {
            if (isEmpty(externalId)) return '';
            var filters = ['externalid', 'anyof', [externalId]];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0].id;
        }
        function getIdByNumber(docNumber, type) {
            if (isEmpty(docNumber)) return '';
            var filters = ['tranid', 'is', docNumber];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0];
        }
        function getIdByName(name, type, field) {
            if (isEmpty(name)) return '';
            var filters = [field, 'is', name];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0].id;
        }
        function isEmpty(str) { return (str == '' || str == null) ? true : false; }
        function convertEmpty(str) { return isEmpty(str) ? '' : str }
        function convertNull(str) { return isEmpty(str) ? '' : str }
        function dateToString(obj) {
            return isEmpty(obj) ? '' : format.format({ value: obj, type: 'date' });
        }
        function stringToDate(str) {
            return isEmpty(str) ? '' : format.parse({ value: str, type: 'date' });
        }
        return { post: _post };
    });