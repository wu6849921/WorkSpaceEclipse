/**
 * 锟� 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code. 
 */

/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 05 Jul 2013 tcaguioa
 * 
 */
function beforeLoad(type, form, request) {
	try {
		var logger = new stickobjLogger('beforeLoad');

		var context = nlapiGetContext();
		if (context.getExecutionContext() !== 'userinterface') {
			logger.log("Disabling StickyNotes: Non-user interface context: "
					+ context.getExecutionContext());
			return;
		}

		if ([ 'edit', 'view' ].indexOf(type.toString()) == -1) {
			logger.log("Disabling StickyNotes: Unsupported loading type: "
					+ type);
			return;
		}

		var recordTypeScrId = nlapiGetRecordType().toLowerCase();
		if (recordTypeScrId == 'customrecord_stick_note_category') {
			logger.log("Disabling StickyNotes: Unsupported record type: "
					+ recordTypeScrId);
			return;
		}

		if (context.getPreference("custscript_stick_enable_record_page") != "T") {
			logger
					.log('Disabling StickyNotes: User preference, "ENABLE STICKYNOTES ON RECORD PAGE", is set to false.');
			return;
		}

		var headersHash = request.getAllHeaders();
		var userAgent = headersHash['User-Agent'];
		if (/SuitePhone/i.test(userAgent)) // Do not display if running on
		// SuitePhone
		{
			logger.log("Disabling StickyNotes: SuitePhone not supported.");
			return;
		}

		// Check role
		if (!_IsValidRole()) {
			logger.log("Disabling StickyNotes: Role is not enabled: "
					+ context.getRoleId());
			return;
		}

		// Check record type
		if (!_IsValidRecordType(recordTypeScrId)) {
			logger.log("Disabling StickyNotes: Record type is not enabled: "
					+ recordTypeScrId);
			return;
		}

		if (stickHasNoValue(nlapiGetContext().getSessionObject(
				'stickFileHtmlCodes'))) {
			var columns = [ new nlobjSearchColumn('custrecord_snfhf_file_codes') ];

			var results = nlapiSearchRecord('customrecord_stick_file_html',
					null, null, columns);
			if (results !== null) {
				nlapiGetContext().setSessionObject('stickFileHtmlCodes',
						results[0].getValue('custrecord_snfhf_file_codes'));
			} else {
				if (context.getPreference('custscript_stick_is_automation') === 'T') {
					// To include test automation code:
					// 1. Make sure custscript_stick_is_automation is set to Yes
					// 2. Delete the lone record on customrecord_stick_file_html
					// 3. Re-login on NetSuite to refresh the session variables
					// 4. Load the record page
					var fileHtmlCodes = stickGetRecordPageCodeHtml();
					var rec = nlapiCreateRecord('customrecord_stick_file_html');
					rec.setFieldValue('custrecord_snfhf_file_codes',
							fileHtmlCodes);
					nlapiSubmitRecord(rec);
					nlapiGetContext().setSessionObject('stickFileHtmlCodes',
							fileHtmlCodes);
				} else {
					logger.error('Cannot find record page html codes');
				}
			}
		}

		// for some record types, nlapiGetRecordType() does not return a value,
		// so save it in a variable
		var codeForGettingRecordType = '<script type="text/javascript">stickGlobal.recordTypeScriptId = "'
				+ recordTypeScrId + '";</script>';

		var fld = form.addField('custpage_stick', 'inlinehtml');
		fld.setDefaultValue(nlapiGetContext().getSessionObject(
				'stickFileHtmlCodes')
				+ codeForGettingRecordType);

		stickSetRecentlyAccessedRecords();

		logger.end();
	} catch (e) {
		nlapiLogExecution('error', 'StickyNotes', 'Unexpected error: ' + e);
	}
}

function _IsValidRole() {
	var context = nlapiGetContext();

	var isAllRoles = context
			.getPreference("custscript_stick_copref_isallroles") != "F"; // Compare
	// to F
	// so
	// it
	// evaluates
	// to
	// true
	// by
	// default
	if (isAllRoles) {
		return true;
	}

	var pref = context.getPreference("custscript_stick_copref_stickroles");
	if (pref == null || pref == "") {
		return false;
	}

	var roleId = '"' + context.getRole().toString() + '"';

	return pref.indexOf(roleId) > -1;
}

function _IsValidRecordType(recType) {
	var context = nlapiGetContext();

	if (context
			.getSetting('SCRIPT', 'custscript_stick_include_all_record_type') == "T") {
		return true;
	}

	var filters = [ [ 'custrecord_sert_record_type_script_id', 'is', recType ],
			'and', [ 'isinactive', 'is', 'F' ] ];

	var rs = nlapiSearchRecord('customrecord_stick_enabled_record_type', null,
			filters);

	return rs != null;
}

function stickSetRecentlyAccessedRecords() {
	// For security reasons, store the recently accessed records and when the
	// posts for a record is requested, check if the record is in this list
	var recentlyAccessedRecords = nlapiGetContext().getSessionObject(
			'stickRecentlyAccessedRecords');
	recentlyAccessedRecords = stickHasNoValue(recentlyAccessedRecords) ? []
			: JSON.parse(recentlyAccessedRecords);

	var key = nlapiGetRecordType().toLowerCase() + nlapiGetRecordId();
	if (recentlyAccessedRecords.indexOf(key) == -1) {
		recentlyAccessedRecords.push(key);
	}

	// we can only store strings in session
	nlapiGetContext().setSessionObject('stickRecentlyAccessedRecords',
			JSON.stringify(recentlyAccessedRecords));
}