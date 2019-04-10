/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Mar 2018     klaus.zhao
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Access mode: create, copy, edit
 * @returns {Void}
 */
/*
 * function case_saverecord(){ var case_clientticketNO =
 * nlapiGetFieldValue('custevent_j_client_ticket_no'); var title =
 * nlapiGetFieldValue('title'); if (case_clientticketNO != ''){ title = title + ' - ' +
 * case_clientticketNO; } }
 */

function clientPageInit(type) {
	nlapiLogExecution("DEBUG", 'run', 'running');
	if (nlapiGetFieldValue('custevent_billable') != 'T') {
		nlapiDisableField('custevent_k_billable_qu', true);
	} else {
		nlapiDisableField('custevent_k_billable_qu', false);
	}
	// klaus auto field
	var jobId = nlapiGetFieldValue('company');
	var classid = nlapiLookupField('job', jobId, 'custentity_class');
	// auto CS team = beijing
	if (classid == '16' || classid == '18' || classid == '45'
			|| classid == '44') {
		nlapiSetFieldValue('assigned', 1164);
	}
	// auto CS team = shanghai
	if (classid == '19') {
		nlapiSetFieldValue('assigned', 1168);
	}
	// auto CS team = chengdu
	if (classid == '47' || classid == '46') {
		nlapiSetFieldValue('assigned', 15898);
	}
	// auto CS team = guangzhou
	if (classid == '25') {
		nlapiSetFieldValue('assigned', 15897);
	}
	// auto CS team = HK
	if (classid == '39') {
		nlapiSetFieldValue('assigned', 1165);
	}
	// auto CS team = india
	if (classid == '57' || classid == '55' || classid == '56') {
		nlapiSetFieldValue('assigned', 11303);
	}
	// auto CS team = japan
	if (classid == '42') {
		nlapiSetFieldValue('assigned', 33316);
	}
	// auto CS team = shenzhen
	if (classid == '24') {
		nlapiSetFieldValue('assigned', 1170);
	}
	// auto CS team = singapore
	if (classid == '34') {
		nlapiSetFieldValue('assigned', 14022);
	}
	// auto CS team = taiwan
	if (classid == '41') {
		nlapiSetFieldValue('assigned', 15901);
	}

	var emailId = nlapiGetFieldValue('email');
	var templeteType = nlapiGetFieldValue("custevent_type");

	if (type == 'create' || type == 'edit') {
		informationUpdate();
	}
	/*
	 * if(type == 'edit'){ if(jobId != ''&&jobId != null){ var clientId =
	 * nlapiLookupField('job',jobId,'customer');
	 * 
	 * if(clientId != ''&&clientId != null){ if(emailId == ''||emailId == null){
	 * var contactRole = 9;
	 * 
	 * if(templeteType == 2){ contactRole = 8; }
	 * 
	 * var filter = new Array(); filter[0] = new
	 * nlobjSearchFilter("contactrole", null, "anyof",contactRole,2); filter[1] =
	 * new nlobjSearchFilter("internalid", "customer", "anyof",clientId);
	 * filter[2] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
	 * 
	 * var column = new Array(); column[0] = new nlobjSearchColumn("email");
	 * 
	 * var contactId = nlapiSearchRecord('contact',null,filter,column); var em =
	 * '';
	 * 
	 * for(var i=0; contactId != null&& i<contactId.length; i++){ em +=
	 * contactId[i].getValue('email') + ',' ; } if(em != null && em != "" &&
	 * em.lastIndexOf(",") == em.length - 1){ em = em.substr(0, em.length - 1); }
	 * nlapiSetFieldValue("email",em); } } if(clientId == ''||clientId == null){
	 * if(emailId == ''||emailId == null){ var contactRole = 9;
	 * 
	 * if(templeteType == 2){ contactRole = 8; }
	 * 
	 * var filter = new Array(); filter[0] = new
	 * nlobjSearchFilter("contactrole", null, "anyof",contactRole,2); filter[1] =
	 * new nlobjSearchFilter("internalid", "customer", "anyof",jobId); filter[2] =
	 * new nlobjSearchFilter('isinactive', null, 'is', 'F');
	 * 
	 * var column = new Array(); column[0] = new nlobjSearchColumn("email");
	 * 
	 * var contactId = nlapiSearchRecord('contact',null,filter,column); var em =
	 * '';
	 * 
	 * for(var i=0; contactId != null&& i<contactId.length; i++){ em +=
	 * contactId[i].getValue('email') + ',' ; } if(em != null && em != "" &&
	 * em.lastIndexOf(",") == em.length - 1){ em = em.substr(0, em.length - 1); }
	 * nlapiSetFieldValue("email",em); } } } }
	 */
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
	var jobId = nlapiGetFieldValue('company');

	if (name == 'company') {
		informationUpdate();
	}
	if (name == 'custevent_billable') {
		if (nlapiGetFieldValue('custevent_billable') != 'T') {
			nlapiDisableField('custevent_k_billable_qu', true);
		} else {
			nlapiDisableField('custevent_k_billable_qu', false);
		}
	}
}

function informationUpdate() {
	var jobId = nlapiGetFieldValue('company');
	var emailId = nlapiGetFieldValue('email');
	var templeteType = nlapiGetFieldValue("custevent_type");

	if (jobId != '' && jobId != null) {
		var clientId = nlapiLookupField('job', jobId, 'customer');

		if (clientId != '' && clientId != null) {
			var messageLanguage = nlapiLookupField('customer', clientId,
					'custentity_case_message_language_cnen', true);
			var shortCompanyName = nlapiLookupField('customer', clientId,
					'custentity_companynameshortened');
			var maintenanceStatus = nlapiLookupField('customer', clientId,
					'custentity29', true);
			var productWarranyStatus = nlapiLookupField('customer', clientId,
					'custentity_productwarranty');
			var clientAddress = nlapiLookupField('customer', clientId,
					'address');

			var contactRole = 9;

			if (templeteType == 2) {
				contactRole = 8;
			}

			var filter = new Array();
			filter[0] = new nlobjSearchFilter("contactrole", null, "anyof",
					contactRole, 2);
			filter[1] = new nlobjSearchFilter("internalid", "customer",
					"anyof", clientId);
			filter[2] = new nlobjSearchFilter('isinactive', null, 'is', 'F');

			var column = new Array();
			column[0] = new nlobjSearchColumn("email");

			var contactId = nlapiSearchRecord('contact', null, filter, column);
			var em = '';

			for (var i = 0; contactId != null && i < contactId.length; i++) {
				em += contactId[i].getValue('email') + ',';
			}
			if (em != null && em != "" && em.lastIndexOf(",") == em.length - 1) {
				em = em.substr(0, em.length - 1);
			}
			nlapiSetFieldValue("email", em);

			nlapiSetFieldValue('custevent2', clientAddress);
		}
		if (clientId == '' || clientId == null) {
			var messageLanguage = nlapiLookupField('customer', jobId,
					'custentity_case_message_language_cnen', true);
			var shortCompanyName = nlapiLookupField('customer', jobId,
					'custentity_companynameshortened');
			var maintenanceStatus = nlapiLookupField('customer', jobId,
					'custentity29', true);
			var productWarranyStatus = nlapiLookupField('customer', jobId,
					'custentity_productwarranty');

			var contactRole = 9;

			if (templeteType == 2) {
				contactRole = 8;
			}

			var filter = new Array();
			filter[0] = new nlobjSearchFilter("contactrole", null, "anyof",
					contactRole, 2);
			filter[1] = new nlobjSearchFilter("internalid", "customer",
					"anyof", jobId);
			filter[2] = new nlobjSearchFilter('isinactive', null, 'is', 'F');

			var column = new Array();
			column[0] = new nlobjSearchColumn("email");

			var contactId = nlapiSearchRecord('contact', null, filter, column);
			var em = '';

			for (var i = 0; contactId != null && i < contactId.length; i++) {
				em += contactId[i].getValue('email') + ',';
			}
			if (em != null && em != "" && em.lastIndexOf(",") == em.length - 1) {
				em = em.substr(0, em.length - 1);
			}
			nlapiSetFieldValue("email", em);
		}
		nlapiSetFieldValue('custevent13', messageLanguage);
		nlapiSetFieldValue('custevent_companynameshortened', shortCompanyName);
		nlapiSetFieldValue('custevent1', maintenanceStatus);
		nlapiSetFieldValue('custevent3', productWarranyStatus);
		nlapiSetFieldValue('incomingmessage', shortCompanyName);
		nlapiLogExecution("DEBUG", 'clientId', clientId);
	}
}
