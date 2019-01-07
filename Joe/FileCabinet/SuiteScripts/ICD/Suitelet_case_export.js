/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Oct 2016     charles.li
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
	// nlapiLogExecution('debug', '00', strdata);
	var Str;
	if (strdata != null && strdata != '') {
		Str = strdata.replace(/&gt;/g, '>');
		Str = Str.replace(/&lt;/g, '<');
		Str = Str.replace(/&/g, "&amp;");
		Str = Str.replace(/>/g, "&gt;");
		Str = Str.replace(/</g, "&lt;");
		Str = Str.replace(/"/g, "&quot;");
		Str = Str.replace(/“/g, "&quot;");
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
	var starttime = rec.getFieldValue('starttime');
	var companyId = rec.getFieldValue('company');
	var companyName = rec.getFieldValue('custevent_companynameshortened');
	companyName = replacement(companyName);// check companyName
	var address = rec.getFieldValue('custevent2');
	if (address != null || address != '') {
		var regexp = new RegExp(',', 'g');
		address = address.replace(regexp, ' ');
	}
	// var strLog = address;
	address = replacement(address);// check address
	var contact = rec.getFieldValue('custevent21');
	contact = replacement(contact);// check contact
	var phone = rec.getFieldValue('custevent22');
	var messagefromclient = rec.getFieldValue('incomingmessage');
	// strLog+=messagefromclient;
	messagefromclient = replacement(messagefromclient);// check message
	/*
	 * if(messagefromclient!=''||messagefromclient!=null){ var regexp1 = new
	 * RegExp('，', 'g'); messagefromclient = messagefromclient.replace(regexp1, '
	 * '); }
	 */
	var memo = rec.getFieldValue('custevent4');
	// strLog+=memo;

	memo = replacement(memo);// check memo
	var assignedtoID = rec.getFieldValue('custevent_rpmengineers1');
	var assignedto = rec.getFieldText('custevent_rpmengineers1');
	var engineerId = rec.getFieldValue('custevent_rpmengineers1');
	// nlapiLogExecution('DEBUG', 'assignedto', assignedto);
	var email = rec.getFieldValue('email');
	var caseNo = rec.getFieldValue('casenumber');
	var clientName = rec.getFieldValue('custevent_companynameshortened');
	var ccEm = rec.getFieldValue('assigned');
	// nlapiLogExecution('DEBUG', 'ccEm', ccEm);
	var copyEmail = nlapiLookupField('employee', ccEm, 'email');
	// nlapiLogExecution('DEBUG', 'copyEmail', copyEmail);
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
	xml += '<ICDLOG><Case_Num>' + caseNo + '</Case_Num>';
	xml += '<case_ID>' + recId + '</case_ID>';
	xml += '<Incident_Date>' + startdate + '</Incident_Date>';
	xml += '<Incident_Time>' + starttime + '</Incident_Time>';
	xml += '<Clinet_ID>' + companyId + '</Clinet_ID>';
	xml += '<Client_Name>' + companyName + '</Client_Name>';
	xml += '<Address>' + address + '</Address>';
	xml += '<Contact>' + contact + '</Contact>';
	xml += '<Phone>' + phone + '</Phone>';
	xml += '<Message_from_client>' + messagefromclient
			+ '</Message_from_client>';
	// xml += '<Message_from_client></Message_from_client>';
	xml += '<Memo>' + memo + '</Memo>';
	xml += '<Assigned_to>' + assignedto + '</Assigned_to>';
	xml += '<Engineer_ID>' + engineerId + '</Engineer_ID>';
	xml += '<Email>' + email + '</Email>';
	xml += '</ICDLOG>';
	var engineerEmail = null;
	if (assignedtoID != '' && assignedtoID != null) {
		engineerEmail = nlapiLookupField('employee', assignedtoID, 'email');
	}
	var subject = caseNo + '-' + clientName + ' sample email and attachment';
	// nlapiLogExecution('debug', 'engineer email', engineerEmail);
	var receipt = [];
	// var receipt = [ engineerEmail, elogemail, 'support@icdsecurity.com' ];
	if (engineerEmail) {
		receipt.push(engineerEmail);
	}
	if (elogemail) {
		receipt.push(elogemail);
	}
	receipt.push('support@icdsecurity.com');
	if (engineerEmail == null) {
		receipt = 'support@icdsecurity.com';
	}
	// var receipt = 'is@icdsecurity.com';

	// var strTrans = replacement(strLog);
	// strLog+=strTrans;
	// var newAttachment = nlapiCreateFile('case.xml', 'XMLDOC', strLog);
	var newAttachment = nlapiCreateFile('case.xml', 'XMLDOC', xml);
	// nlapiLogExecution('debug', 'receipt', receipt);
	// nlapiLogExecution('debug', 'subject', subject);
	nlapiSendEmail('1166', receipt, subject, 'Please see the attached file',
			copyEmail, null, null, newAttachment, true);
	// nlapiLogExecution('DEBUG', 'FINAL', 1);
}
