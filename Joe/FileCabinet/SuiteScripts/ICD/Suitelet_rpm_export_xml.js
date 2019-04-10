/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Sep 2017     doris.liu
 *
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function replacement(strdata) {
	nlapiLogExecution('debug', '00', strdata);
	var Str;
	if (strdata != null && strdata != '') {
		Str = strdata.replace(/&gt;/g, '>');
		Str = Str.replace(/&lt;/g, '<');
		Str = Str.replace(/&/g, "&amp;");
		Str = Str.replace(/>/g, "&gt;");
		Str = Str.replace(/</g, "&lt;");
		Str = Str.replace(/"/g, "&quot;");
		Str = Str.replace(/鈥�/g, "&quot;");
		Str = Str.replace(/'/g, "&apos;");
		return Str;
	} else {
		return strdata;
	}
}

function suitelet(request, response) {

	var recId = request.getParameter('recid');
	var rec = nlapiLoadRecord('supportcase', recId);// take all the information
	// of the record.
	var caseNo = rec.getFieldValue('casenumber');
	var startdate = rec.getFieldValue('startdate');
	nlapiLogExecution('debug', 'startdate', startdate);

	var mainstatus = rec.getFieldValue('custevent1');
	var warstatus = rec.getFieldValue('custevent3');
	var nscr = rec.getFieldValue('custevent_cl_nsc_regular');
	var escr = rec.getFieldValue('custevent_cl_esc_regular');
	var escn = rec.getFieldValue('custevent_esc_nonregu');
	var memoclient = rec.getFieldValue(' custevent_cl_memo');
	memoclient = replacement(memoclient);// check memoclient
	var companyId = rec.getFieldValue('company');

	var companyName = rec.getFieldValue('custevent_companynameshortened');
	nlapiLogExecution('debug', 'companyName', companyName);
	companyName = replacement(companyName);// check companyName
	nlapiLogExecution('debug', 'companyName_After', companyName);

	var address = rec.getFieldValue('custevent2');
	if (address != null || address != '') {
		var regexp = new RegExp(',', 'g');
		address = address.replace(regexp, ' ');
	}
	address = replacement(address);// check address

	var memo = rec.getFieldValue('custevent4');
	memo = replacement(memo);// check memo

	var assignedtoID = rec.getFieldValue('custevent_assignedengineers');
	var assignedto = rec.getFieldText('custevent_assignedengineers');
	var engineerId = rec.getFieldValue('custevent_assignedengineers');
	nlapiLogExecution('DEBUG', 'rpmassignedto', assignedto);
	var email = rec.getFieldValue('email');
	var caseNo = rec.getFieldValue('casenumber');
	var clientName = rec.getFieldValue('custevent_companynameshortened');
	var ccEm = rec.getFieldValue('assigned');//发送人地区
	nlapiLogExecution('DEBUG', 'ccEm', ccEm);
	var copyEmail = nlapiLookupField('employee', ccEm, 'email');
	nlapiLogExecution('DEBUG', 'copyEmail', copyEmail);
	var elogemail = null;
	if (ccEm == '1164') {// beijing
		elogemail = 'elog.nc@icdsecurity.com';
	}
	if (ccEm == '1168') {// shanghai
		elogemail = 'elog.ec@icdsecurity.com';
	}
	if (ccEm == '15898') {// chengdu
		elogemail = 'elog.wc@icdsecurity.com';
	}
	if (ccEm == '1170') {// shenzhen
		elogemail = 'elog.sc@icdsecurity.com';
	}
	var xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?><!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">";
	xml += '<ICDLOG><RPM_Num>' + caseNo + '</RPM_Num>';
	xml += '<RPM_ID>' + recId + '</RPM_ID>';
	xml += '<Incident_Date>' + startdate + '</Incident_Date>';
	xml += '<Clinet_ID>' + companyId + '</Clinet_ID>';
	xml += '<Client_Name>' + companyName + '</Client_Name>';
	xml += '<Address>' + address + '</Address>';
	xml += '<Maintenance_Status>' + mainstatus + '</Maintenance_Status>';
	xml += '<Product_Warranty_Status>' + warstatus
			+ '</Product_Warranty_Status>';
	xml += '<NSCR>' + nscr + '</NSCR>';
	xml += '<ESCR>' + escr + '</ESCR>';
	xml += '<ESCN>' + escn + '</ESCN>';
	xml += '<Memo_Client>' + memoclient + '</Memo_Client>';
	xml += '<Memo>' + memo + '</Memo>';
	xml += '<Assigned_to>' + assignedto + '</Assigned_to>';
	xml += '<Engineer_ID>' + engineerId + '</Engineer_ID>';
	xml += '<Email>' + email + '</Email>';
	xml += '</ICDLOG>';
	var engineerEmail = null;
	if (assignedtoID != '' && assignedtoID != null) {
		engineerEmail = nlapiLookupField('employee', assignedtoID, 'email');//Assigned Engineers
	}
	if (assignedtoID == '' || assignedtoID == null) {
		engineerEmail = 'support@icdsecurity.com'
	}
	var subject = caseNo + '-' + clientName + ' sample email and attachment';
	nlapiLogExecution('debug', 'engineer email', engineerEmail);
	var receipt = [];
	if (engineerEmail) {
		receipt.push(engineerEmail);
	}
	if (elogemail) {
		receipt.push(elogemail);
	}
	if (engineerEmail = null) {
		receipt = 'support@icdsecurity.com';
	}

	var newAttachment = nlapiCreateFile('case.xml', 'XMLDOC', xml);

	nlapiSendEmail('1166', receipt, subject, 'Please see the attached file',
			copyEmail, null, null, newAttachment, true);
	nlapiLogExecution('DEBUG', 'FINAL', subject);
}
