/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */

define(['N/record', 'N/format', 'N/search', 'N/runtime'],
    function (record, format, search, runtime) {
        function _post(context) {
            try {
                // Get paramters
                if (true) {
                    var begin = new Date();
                    var myObj = new Object();
                    myObj.success = false;
                    var customerId = context.entityid;
                    var subId = context.subsidiary;
                    context.subId = getIdByExternalId(subId, 'subsidiary');
                    if (isEmpty(subId) || isEmpty(context.subId)) {
                        var result = {
                            success: false,
                            message: 'Invalid subsidiary code - ' + context.subsidiary
                        };
                        var logId = writeLog(context, result);
                        return result;
                    }
                    var catName = context.category;
                    var virtualName = context.custentity_pos_isvirtual;
                    context.salesRepId = getEmployeeId(context.salesrep);
                    context.unifiedCode = context.custentity_coi_tv_unified_code;
                    context.gender = context.custentity_pos_gender;
                    if (context.gender == '男') context.gender = 1;
                    else if (context.gender == '女') context.gender = 2;
                    else context.gender = 3;

                    var scriptObj = runtime.getCurrentScript();
                    var paramJSON = scriptObj.getParameter({ name: 'custscript_mmy_globalposparam' });
                    var jiarui = scriptObj.getParameter({ name: 'custscript_mmy_jiarui_sub' });
                    paramJSON = JSON.parse(paramJSON);
                    //var subId = getListId(subId, paramJSON.subsidiary);
                    context.catId = getListId(catName, paramJSON.category);
                    context.virtualId = getListId(virtualName, paramJSON.virtual);
                    //var externalId = customerId + '_4'; //英屬Mamaway 4, 家瑞 10
                    var externalId = customerId;
                    context.externalId = externalId;
                }

                var customerRec = getCustomer(externalId);
                log.debug({ title: 'original id', details: customerRec.id + ', ' + externalId });
                var isCreate = isEmpty(customerRec.id) ? true : false;
                customerRec = setMainFields(context, customerRec);
                customerRec = setAddress(context, customerRec);

                // Submit record and return message
                if (true) {
                    customerRec.setValue({ fieldId: 'entityid', value: externalId });
                    customerId = customerRec.save({ enableSourcing: true, ignoreMandatoryFields: true });
                    record.submitFields({
                        type: 'customer', id: customerId, values: { entityid: externalId },
                        options: { enableSourcing: false, ignoreMandatoryFields: true }
                    });
                    /*customerRec = record.load({ type: 'customer', id: customerId });
                    customerRec.setValue({ fieldId: 'entity', value: externalId });
                    customerId = customerRec.save();*/

                    //log.debug({ title: 'test', details: 'original updated' });
                    if (!isEmpty(context.entity)) {
                        var contactRec = getContact(customerId, record, search);
                        contactRec.setValue({ fieldId: 'company', value: customerId });
                        contactRec.setValue({ fieldId: 'entityid', value: convertNull(context.entity) });
                        contactRec.setValue({ fieldId: 'email', value: convertNull(context.email) });
                        contactRec.setValue({ fieldId: 'phone', value: convertNull(context.phone) });
                        contactRec.setValue({ fieldId: 'mobilephone', value: convertNull(context.mobilephone) });
                        contactRec.setValue({ fieldId: 'officephone', value: convertNull(context.contactphone) });
                        contactId = contactRec.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        myObj.contactId = contactId;
                    }

                    // Copy or update another customer in Jiarui subsidiary
                    if (context.subsidiary == 4) {
                        externalId = context.entityid + '-A';
                        var copyCustomerRec = getCustomer(externalId);
                        var isCreate = isEmpty(copyCustomerRec.id) ? true : false;

                        // Customer body fields
                        if (true) {
                            log.debug({ title: 'copy id', details: copyCustomerRec.id + ', ' + externalId });
                            copyCustomerRec.setValue({ fieldId: 'externalid', value: externalId });
                            copyCustomerRec.setValue({ fieldId: 'subsidiary', value: jiarui });
                            copyCustomerRec.setValue({ fieldId: 'companyname', value: context.companyname });
                            copyCustomerRec.setValue({ fieldId: 'altname', value: context.companyname });
                            copyCustomerRec.setValue({ fieldId: 'category', value: context.catId });
                            copyCustomerRec.setValue({ fieldId: 'custentity_pos_isvirtual', value: context.virtualId });
                            copyCustomerRec.setValue({ fieldId: 'vatregnumber', value: context.custentity_taxidnumber });
                            copyCustomerRec.setValue({ fieldId: 'salesrep', value: context.salesRepId });
                            copyCustomerRec.setValue({ fieldId: 'custentity_coi_tv_unified_code', value: context.unifiedCode });
                            //copyCustomerRec.setValue({ fieldId: 'entity', value: salesRepId });
                            copyCustomerRec.setValue({ fieldId: 'email', value: context.email });
                            copyCustomerRec.setValue({ fieldId: 'phone', value: context.phone });
                            copyCustomerRec.setValue({ fieldId: 'mobilephone', value: context.mobilephone });
                            copyCustomerRec.setValue({ fieldId: 'fax', value: context.fax });
                            copyCustomerRec.setValue({ fieldId: 'custentity_pos_salesconditions', value: context.custentity_pos_salesconditions });
                            copyCustomerRec.setValue({ fieldId: 'creditlimit', value: context.creditlimit });
                            copyCustomerRec.setValue({ fieldId: 'comments', value: context.comments });
                            copyCustomerRec.setValue({ fieldId: 'custentity_pos_opencardstore', value: context.custentity_pos_opencardstore });
                            copyCustomerRec.setValue({ fieldId: 'custentity_pos_ecplatform', value: context.custentity_pos_ecplatform });
                            copyCustomerRec.setValue({ fieldId: 'custentity_pos_gender', value: context.gender });
                            var birthDate = stringToDate(context.custentity_pos_memberbirthday);
                            copyCustomerRec.setValue({ fieldId: 'custentity_pos_memberbirthday', value: birthDate });
                            copyCustomerRec.setValue({ fieldId: 'custentity_pos_idcardtype', value: context.custentity_pos_idcardtype });
                            copyCustomerRec.setValue({ fieldId: 'custentity_pos_idnumber', value: context.custentity_pos_idnumber });
                            var dateOfBirth = stringToDate(context.custentity_duedateofchild, format);
                            copyCustomerRec.setValue({ fieldId: 'custentity_duedateofchild', value: dateOfBirth })
                            var cutom2Date = stringToDate(context.custentity_pos_datecutom2, format);
                            copyCustomerRec.setValue({ fieldId: 'custentity_pos_datecutom2', value: cutom2Date });
                            copyCustomerRec.setValue({ fieldId: 'custentity_pos_memberbouns', value: context.custentity_pos_memberbouns });
                            copyCustomerRec.setValue({ fieldId: 'isinactive', value: convertBool(context.isinactive) });
                        }

                        // Customer address
                        if (true) {
                            _setLineValue(copyCustomerRec, 'addressbook', 'label', 0, context.entity);
                            _setLineValue(copyCustomerRec, 'addressbook', 'defaultbilling', 0, true);
                            _setLineValue(copyCustomerRec, 'addressbook', 'defaultshipping', 0, true);

                            var subrec = copyCustomerRec.getSublistSubrecord({
                                sublistId: 'addressbook',
                                fieldId: 'addressbookaddress',
                                line: 0
                            });
                            subrec.setValue({ fieldId: 'attention', value: convertNull(context.entity) });
                            subrec.setValue({ fieldId: 'mobilephone', value: convertNull(context.mobilephone) });
                            subrec.setValue({ fieldId: 'city', value: convertNull(context.city) });
                            subrec.setValue({ fieldId: 'state', value: convertNull(context.state) });
                            subrec.setValue({ fieldId: 'zip', value: convertNull(context.zip) });
                            subrec.setValue({ fieldId: 'addr1', value: convertNull(context.addr1) });
                        }
                        copyCustomerRec.setValue({ fieldId: 'entityid', value: externalId });
                        customerId = copyCustomerRec.save({ enableSourcing: false, ignoreMandatoryFields: true });
                        record.submitFields({
                            type: 'customer', id: customerId, values: { entityid: externalId },
                            options: { enableSourcing: false, ignoreMandatoryFields: true }
                        });
                        /*copyCustomerRec = record.load({ type: 'customer', id: customerId });
                        copyCustomerRec.setValue({ fieldId: 'externalid', value: externalId });
                        customerId = copyCustomerRec.save();*/
                    }

                    var end = new Date();
                    var gap = (end - begin) / 1000 + 's';
                    myObj.success = true;
                    myObj.customerId = customerId;
                    var upsert = isCreate ? 'created' : 'updated';
                    myObj.message = 'Customer is ' + upsert + ' successfully';
                    myObj.time = gap;
                    var logId = writeLog(context, myObj);
                    return myObj;
                }
            }
            catch (ex) {
                log.debug({ title: '_post', details: ex });
                var soObject = new Object();
                soObject.success = false;
                soObject.message = ex.message;
                var logId = writeLog(context, soObject);
                return soObject;
            }
        }

        function setMainFields(context, customerRec) {
            customerRec.setValue({ fieldId: 'externalid', value: context.externalId });
            customerRec.setValue({ fieldId: 'subsidiary', value: context.subid });
            customerRec.setValue({ fieldId: 'companyname', value: context.companyname });
            customerRec.setValue({ fieldId: 'altname', value: context.companyname });
            customerRec.setValue({ fieldId: 'category', value: context.catId });
            customerRec.setValue({ fieldId: 'custentity_pos_isvirtual', value: context.virtualId });
            customerRec.setValue({ fieldId: 'vatregnumber', value: context.custentity_taxidnumber });
            customerRec.setValue({ fieldId: 'salesrep', value: context.salesRepId });
            customerRec.setValue({ fieldId: 'custentity_coi_tv_unified_code', value: context.unifiedCode });
            //customerRec.setValue({ fieldId: 'entity', value: salesRepId });
            customerRec.setValue({ fieldId: 'email', value: context.email });
            customerRec.setValue({ fieldId: 'phone', value: context.phone });
            customerRec.setValue({ fieldId: 'mobilephone', value: context.mobilephone });
            customerRec.setValue({ fieldId: 'fax', value: context.fax });
            customerRec.setValue({ fieldId: 'custentity_pos_salesconditions', value: context.custentity_pos_salesconditions });
            customerRec.setValue({ fieldId: 'creditlimit', value: context.creditlimit });
            customerRec.setValue({ fieldId: 'comments', value: context.comments });
            customerRec.setValue({ fieldId: 'custentity_pos_opencardstore', value: context.custentity_pos_opencardstore });
            customerRec.setValue({ fieldId: 'custentity_pos_ecplatform', value: context.custentity_pos_ecplatform });
            customerRec.setValue({ fieldId: 'custentity_pos_gender', text: context.gender });
            var birthDate = stringToDate(context.custentity_pos_memberbirthday);
            customerRec.setValue({ fieldId: 'custentity_pos_memberbirthday', value: birthDate });
            customerRec.setValue({ fieldId: 'custentity_pos_idcardtype', value: context.custentity_pos_idcardtype });
            customerRec.setValue({ fieldId: 'custentity_pos_idnumber', value: context.custentity_pos_idnumber });
            var dateOfBirth = stringToDate(context.custentity_duedateofchild);
            customerRec.setValue({ fieldId: 'custentity_duedateofchild', value: dateOfBirth })
            var cutom2Date = stringToDate(context.custentity_pos_datecutom2);
            customerRec.setValue({ fieldId: 'custentity_pos_datecutom2', value: cutom2Date });
            customerRec.setValue({ fieldId: 'custentity_pos_memberbouns', value: context.custentity_pos_memberbouns });
            customerRec.setValue({ fieldId: 'isinactive', value: convertBool(context.isinactive) });
            return customerRec;
        }
        function setAddress(context, customerRec) {
            _setLineValue(customerRec, 'addressbook', 'label', 0, context.entity);
            _setLineValue(customerRec, 'addressbook', 'defaultbilling', 0, true);
            _setLineValue(customerRec, 'addressbook', 'defaultshipping', 0, true);

            var subrec = customerRec.getSublistSubrecord({
                sublistId: 'addressbook', fieldId: 'addressbookaddress', line: 0
            });
            subrec.setValue({ fieldId: 'attention', value: convertNull(context.entity) });
            subrec.setValue({ fieldId: 'mobilephone', value: convertNull(context.mobilephone) });
            subrec.setValue({ fieldId: 'city', value: convertNull(context.city) });
            subrec.setValue({ fieldId: 'state', value: convertNull(context.state) });
            subrec.setValue({ fieldId: 'zip', value: convertNull(context.zip) });
            subrec.setValue({ fieldId: 'addr1', value: convertNull(context.addr1) });
            return customerRec;
        }
        function writeLog(dataIn, response) {
            var scriptObj = runtime.getCurrentScript();
            var scriptId = scriptObj.getParameter({ name: 'custscript_mmy_pos02' });
            var logRec = record.create({ type: 'customrecord_pos_integrationlog' });
            logRec.setValue({ fieldId: 'custrecord_intlog_json', value: JSON.stringify(dataIn) });
            logRec.setValue({ fieldId: 'custrecord_intlog_succeed', value: response.success });
            logRec.setValue({ fieldId: 'custrecord_intlog_scriptname', value: scriptId });
            logRec.setValue({ fieldId: 'custrecord_intlog_apiid', value: 2 });
            var nsURL = 'https://rest.sandbox.netsuite.com/app/site/hosting/restlet.nl?';
            nsURL += 'script=' + scriptId + '&deploy=1';
            logRec.setValue({ fieldId: 'custrecord_intlog_targeturl', value: nsURL });
            logRec.setValue({ fieldId: 'custrecord_intlog_resultjson', value: JSON.stringify(response) });
            var logId = logRec.save();
            log.debug({ title: 'log id', details: 'log id: ' + logId });
            return logId;
        }
        function _setLineValue(rec, listId, fldId, lNum, val) {
            rec.setSublistValue({ sublistId: listId, fieldId: fldId, line: lNum, value: convertNull(val) });
        }
        function _setCurrentLine(rec, listId, fldId, val) {
            rec.setCurrentSublistValue({ sublistId: listId, fieldId: fldId, value: convertNull(val) });
        }
        function isEmpty(str) {
            if (str == '' || str == null) return true;
            else return false;
        }
        function convertNull(str) {
            return isEmpty(str) ? '' : str;
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
        function getEmployeeId(externalId) {
            var filters = [['externalid', 'anyof', [externalId]]]
            var searchObj = search.create({ type: 'employee', filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            var employeeId = isEmpty(existList) ? '' : existList[0].id;
            return employeeId;
        }
        function getCustomer(externalId) {
            var filters = ['entityid', 'is', externalId];
            var searchObj = search.create({ type: 'customer', filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });

            // If customer exists, create new customer. Else update.
            var customerRec = isEmpty(existList) ?
                //record.create({ type: 'customer', isDynamic: true }) :
                //record.create({ type: 'customer', defaultValues: { entityid: externalId } }) :
                record.create({ type: 'customer' }) :
                record.load({ type: 'customer', id: existList[0].id });
            return customerRec;
        }
        function getContact(customerId) {
            var filters = [['company', 'is', customerId]];
            var searchObj = search.create({ type: 'contact', filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });

            // If contact exists, create new customer. Else update.
            var contactRec = isEmpty(existList) ?
                record.create({ type: 'contact' }) :
                record.load({ type: 'contact', id: existList[0].id });
            return contactRec;
        }
        function getIdByExternalId(externalId, type) {
            if (isEmpty(externalId)) return '';
            var filters = ['externalid', 'anyof', [externalId]];
            var searchObj = search.create({ type: type, filters: filters });
            var existList = searchObj.run().getRange({ start: 0, end: 1000 });
            return isEmpty(existList) ? '' : existList[0].id;
        }
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

        return { post: _post };
    });