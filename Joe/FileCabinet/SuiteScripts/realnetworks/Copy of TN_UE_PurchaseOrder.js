/*******************************************************************************************************************************************************************************************************
 * File Name : TN_UE_PurchaseOrder.js Description : User Event on purchase order Company : Trigger Networks Created By : Daniel Cai Created On : 04/11/2014
 ******************************************************************************************************************************************************************************************************/

function poBeforeLoad(type, form, request) {
	try {
		form.setScript('customscript_tn_ueonpo');
		var descriptionFld = nlapiGetLineItemField('item', 'description', 1);
		descriptionFld.setMandatory(true);
		var rateFld = nlapiGetLineItemField('item', 'rate');
		rateFld.setDisplayType('disabled');
		var amtFld = nlapiGetLineItemField('item', 'amount');
		amtFld.setDisplayType('disabled');
		var grossAmtFld = nlapiGetLineItemField('item', 'grossamount');
		// grossAmtFld.setDisplayType('disabled');
		var vendorNameFld = nlapiGetLineItemField('item', 'vendorname');
		vendorNameFld.setDisplayType('hidden');
		var exchangeRateFld = nlapiGetField('exchangerate');
		exchangeRateFld.setDisplayType('disabled');
		var resubmitFld = nlapiGetField('custbody_tn_resubmit');
		var statusText = nlapiGetFieldText('custbody_tn_prstatus');
		if (statusText.indexOf('Reject') == -1)
			resubmitFld.setDisplayType('Hidden');
		nlapiSetFieldValue('custbody_tn_popup5kform', 'F');
		if (nlapiGetRole() == '1000') {
			var trandateFld = nlapiGetField('trandate');
			trandateFld.setDisplayType('inline');
		}
		var poApprovalStatus = nlapiGetFieldText('custbody_tn_prstatus');
		// PO is rejected
		if (poApprovalStatus.indexOf('Rejected') != -1) {
			form.setScript('customscript_tn_ueonpo');
			if (type == 'view')
				form.addButton('custpage_rejectreason', 'Reject Reason', 'rejectReason()');
		}
		if (type == 'create') {
			var currentUserId = nlapiGetUser();
			if (currentUserId != -4)
				nlapiSetFieldValue('employee', currentUserId);
			var statusFld = nlapiGetField('custbody_tn_prstatus').setDisplayType('hidden');

			var poId = request.getParameter('poId');
			if (isNull(poId))
				return;
			// nlapiLogExecution('debug', 'test', 'source: ' + poId);
			var oldPO = nlapiLoadRecord('purchaseorder', poId);
			nlapiSetFieldValue('entity', oldPO.getFieldValue('entity'));
			nlapiSetFieldValue('currency', oldPO.getFieldValue('currency'));
			nlapiSetFieldValue('terms', oldPO.getFieldValue('entity'));
			nlapiSetFieldValue('memo', oldPO.getFieldValue('memo'));
			var oldPOCount = oldPO.getLineItemCount('item');
			// nlapiLogExecution('debug', 'test', 'oldPOCount: ' + oldPOCount);
			for (var i = 1; i <= oldPOCount; i++) {
				nlapiSetLineItemValue('item', 'item', i, oldPO.getLineItemValue('item', 'item', i));
				nlapiSetLineItemValue('item', 'quantity', i, oldPO.getLineItemValue('item', 'quantity', i));
				nlapiSetLineItemValue('item', 'description', i, oldPO.getLineItemValue('item', 'description', i));
				nlapiSetLineItemValue('item', 'custcol_tn_prpurpose', i, oldPO.getLineItemValue('item', 'custcol_tn_prpurpose', i));
				nlapiSetLineItemValue('item', 'rate', i, oldPO.getLineItemValue('item', 'rate', i));
				nlapiSetLineItemValue('item', 'custcol_tn_unitpriceincltax', i, oldPO.getLineItemValue('item', 'custcol_tn_unitpriceincltax', i));
				nlapiSetLineItemValue('item', 'amount', i, oldPO.getLineItemValue('item', 'amount', i));
				nlapiSetLineItemValue('item', 'taxcode', i, oldPO.getLineItemValue('item', 'taxcode', i));
			}
		}
		// nlapiLogExecution('debug', 'test', type + ', ' + nlapiGetRole());
		var roleId = nlapiGetRole();
		if (type == 'view' && (roleId == 3 || roleId == 1005 || roleId == 1007)) {
			var poStatus = nlapiGetFieldValue('status');
			// nlapiLogExecution('debug', 'test', 'poStatus: ' + poStatus + ', poApprovalStatus: ' + poApprovalStatus);
			/*
			 * if (poStatus == 'Approved by Supervisor/Pending Receipt' || poStatus == 'Approved by Supervisor/Pending Bill' || poStatus == 'Pending Billing/Partially Received') {
			 * form.addButton('custpage_closepo', 'Close', 'closePO()'); }
			 */
			form.addButton('custpage_closepo', 'Close', 'closePO()');
			if (poApprovalStatus == 'Open') {
				var noticeFld = form.addField('custpage_notice', 'inlinehtml', 'Notice', null, null).setLayoutType('outsideabove', 'startcol');
				var htmlStr = '<div class="scrollarea" style="margin: 0px; visibility: visible; overflow: hidden; width:100%; left: 0px;">';
				htmlStr += '<table style="table-layout: fixed" border="0" cellspacing="0" class="listtable listborder openList" cellpadding="0" width="100%">';
				htmlStr += '<thead><tr><td class="listheadertdleft listheadertextb"><b style="color:red;font-size:12pt;">';
				htmlStr += 'Your purchase request is NOT submitted. Current information is saved as a draft.';
				htmlStr += '</b></td></tr></thead></table></div><br/>';
				noticeFld.setDefaultValue(htmlStr);
			}
		}
		if (type == 'view' && (roleId == 3 || roleId == 1000 || roleId == 1013 || roleId == 1014 || roleId == 1005)) {
			form.addButton('custpage_copypo', 'Make Copy', 'makeCopy()');
			if (poApprovalStatus == 'Open') {
				var noticeFld = form.addField('custpage_notice', 'inlinehtml', 'Notice', null, null).setLayoutType('outsideabove', 'startcol');
				var htmlStr = '<div class="scrollarea" style="margin: 0px; visibility: visible; overflow: hidden; width:100%; left: 0px;">';
				htmlStr += '<table style="table-layout: fixed" border="0" cellspacing="0" class="listtable listborder openList" cellpadding="0" width="100%">';
				htmlStr += '<thead><tr><td class="listheadertdleft listheadertextb"><b style="color:red;font-size:12pt;">';
				htmlStr += 'Your purchase request is NOT submitted. Current information is saved as a draft.';
				htmlStr += '</b></td></tr></thead></table></div><br/>';
				noticeFld.setDefaultValue(htmlStr);
			}
		}
		if (type != 'create') {
			var poId = nlapiGetRecordId();
			var filters = new Array();
			filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
			filters.push(new nlobjSearchFilter('internalid', null, 'is', poId));
			var columns = new Array();
			columns.push(new nlobjSearchColumn('amount'));
			columns.push(new nlobjSearchColumn('custbody_tn_contractexperid'));
			columns.push(new nlobjSearchColumn('custbody_tn_newvendor'));
			columns.push(new nlobjSearchColumn('custbody_tn_vendorcontractexpire'));
			var poResult = nlapiSearchRecord('purchaseorder', null, filters, columns);
			var amount = poResult[0].getValue('amount');
			if (amount <= 30000) {
				nlapiGetField('custbody_tn_cfoapproved').setDisplayType('hidden');
				nlapiGetField('custbody_tn_cfoadate').setDisplayType('hidden');
			}

			if (amount < 2000000 || poResult[0].getValue('custbody_tn_contractexperid') != 'T') {
				// nlapiLogExecution('debug', 'Hide Fields', amount + ', ' + poResult[0].getValue('custbody_tn_contractexperid'));
				nlapiGetField('custbody_tn_financeapprove').setDisplayType('hidden');
				nlapiGetField('custbody_tn_fadate').setDisplayType('hidden');
				nlapiGetField('custbody_tn_legalapproved').setDisplayType('hidden');
				nlapiGetField('custbody_tn_ladate').setDisplayType('hidden');
			} else {
				// nlapiLogExecution('debug', 'Show Fields', amount + ', ' + poResult[0].getValue('custbody_tn_contractexperid'));
				nlapiGetField('custbody_tn_financeapprove').setDisplayType('inline');
				nlapiGetField('custbody_tn_fadate').setDisplayType('inline');
				nlapiGetField('custbody_tn_legalapproved').setDisplayType('inline');
				nlapiGetField('custbody_tn_ladate').setDisplayType('inline');
			}
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'test', ex);
	}
}

function closePO() {
	try {
		var poId = nlapiGetRecordId();
		var poRec = nlapiLoadRecord('purchaseorder', poId);
		for (var i = 1; i <= poRec.getLineItemCount('item'); i++) {
			poRec.setLineItemValue('item', 'isclosed', i, 'T');
		}
		poRec.setFieldValue('custbody_tn_prstatus', 21);
		nlapiSubmitRecord(poRec, false, true);
		history.go(0);
	} catch (ex) {
		alert('error');
		alert(ex);
		alert(ex.getDetails());
	}
}

function makeCopy() {
	try {
		// #region Suitelet
		/*
		 * var poId = nlapiGetRecordId(); var scriptId = 'customscript_tn_copypoinsuitelet'; var deployId = 'customdeploy_tn_copypoinsuitelet'; var paramStr = '&poId=' + poId; var myurl =
		 * nlapiResolveURL('SUITELET', scriptId, deployId) + paramStr; window.open(myurl, "_blank");
		 */
		// #endregion
		// #region User Event
		var poId = nlapiGetRecordId();
		var paramStr = '&poId=' + poId;
		var preHref = window.location.href.substring(0, window.location.href.indexOf('.com/') + 5);
		var myurl = preHref + 'app/accounting/transactions/purchord.nl?cf=102&poId=' + poId + '&whence=';
		// var myurl = nlapiResolveURL('RECORD', 'purchaseorder') + paramStr;
		window.open(myurl, "_blank");
		// #endregion
	} catch (ex) {
		alert('error');
		alert(ex);
		alert(ex.getDetails());
	}
}

function poAfterSubmit(type) {
	try {
		var contextType = nlapiGetContext().getExecutionContext();
		nlapiLogExecution('debug', 'poAfterSubmit', contextType + ' ' + type);
		var poId = nlapiGetRecordId();
		var roleId = nlapiGetRole();
		var needPopup = nlapiLookupField('purchaseorder', poId, 'custbody_tn_popup5kform');
		nlapiLogExecution('debug', 'poAfterSubmit', 'poId: ' + poId);
		// var create5KformUrl = '/app/common/custom/custrecordentry.nl?rectype=24&pf=CUSTRECORD_TN_PRID&pi=' + poId + '&pr=-30';
		params = {
			'pf' : 'CUSTRECORD_TN_PRID',
			'pi' : poId,
			'pr' : '-30'
		};

		var filters = new Array();
		filters.push(new nlobjSearchFilter('custrecord_tn_prid', null, 'is', poId));
		// filters.push(new nlobjSearchFilter('custrecord_tn_formcompleted', null, 'is', 'T'));
		var columns = new Array();
		columns.push(new nlobjSearchColumn('custrecord_tn_formcompleted'));
		var cfoForm = nlapiSearchRecord('customrecord_tn_cfoform', null, filters, columns);
		if (isNull(cfoForm)) {
			// alert('Please complete the International Requisition Form');
			nlapiSetFieldValue('custbody_tn_prchecked', 'F');
			if (needPopup == 'T')
				nlapiSetRedirectURL('RECORD', 'customrecord_tn_cfoform', null, null, params);
		} else {
			var isCompleted = cfoForm[0].getValue('custrecord_tn_formcompleted');
			if (needPopup == 'T' && isCompleted != 'T')
				nlapiSetRedirectURL('RECORD', 'customrecord_tn_cfoform', cfoForm[0].getId());
		}
		// if (needPopup == 'T' && (roleId == '1000' || roleId == '1013' || roleId == '1014' || roleId == '3'))
		// nlapiSetRedirectURL('RECORD', 'customrecord_tn_cfoform', null, null, params);
		if (contextType == 'userinterface' || contextType == 'userevent') {
			nlapiLogExecution('debug', 'test', 'userid: ' + nlapiGetUser());
			if (nlapiGetUser() != '3')
				sendEmail(type);
			// sendEmail(type);
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'test', ex);
	}
}

function sendEmail(type) {
	try {
		nlapiLogExecution('debug', 'sendEmail', 'begin');
		var poId = nlapiGetRecordId();
		var poRec = nlapiLoadRecord('purchaseorder', poId);
		var poNumber = poRec.getFieldValue('tranid');
		var isSubmit = poRec.getFieldValue('custbody_tn_complete');
		if (isSubmit != 'T')
			return;
		var currentUserId = nlapiGetUser();
		if (currentUserId == -4)
			return;
		var statusId = poRec.getFieldValue('custbody_tn_prstatus');
		// nlapiLogExecution('debug', 'test', 'statusId: ' + statusId);
		var isResubmit = poRec.getFieldValue('custbody_tn_resubmit');
		var employeeId = poRec.getFieldValue('employee');
		var nextApproverId = poRec.getFieldValue('nextapprover');
		var createdBy = poRec.getFieldValue('custbody_tn_createdby');
		var emailTitle1 = '';
		var emailTitle2 = '';
		var sender = employeeId;
		var receiver = '';
		var otherId = '';
		var AngelaBi = 859;
		var BelindaYang = 10;
		var Betty = 6;
		var cfoApproved = poRec.getFieldValue('custbody_tn_cfoapproved');
		var businessType = poRec.getFieldText('custbody_tn_prbusinesstype');
		var roleId = nlapiGetRole();
		// nlapiLogExecution('debug', 'sendEmail', 'businessType: ' + businessType + ', ' + 'statusId: ' + statusId);
		var ccer = null;
		var ccer2 = null;
		switch (statusId) {
		case '6':
			emailTitle1 = isResubmit == 'T' ? 'PO#' + poNumber + ' Has Been Re-Submited' : 'PO#' + poNumber + ' Has Been Submited';
			// ccer = businessType.indexOf('Assets') == -1 ? null : 405;
			receiver = roleId == '1005' ? '' : AngelaBi;
			nlapiLogExecution('debug', 'test', 'executed: 6');
			break;
		case '2':
			emailTitle1 = 'PO#' + poNumber + ' Has Been Checked By Purchaser';
			sender = currentUserId;
			receiver = employeeId;
			ccer = nlapiLookupField('employee', createdBy, 'email');
			emailTitle2 = 'PO#' + poNumber + '  Needs to be Approved';
			otherId = nextApproverId;
			nlapiLogExecution('debug', 'test', 'executed: 2');
			break;
		case '1':
			emailTitle1 = 'PO#' + poNumber + ' Has Been Approved by FP&A';
			sender = currentUserId;
			receiver = employeeId;
			var createdByEmail = nlapiLookupField('employee', createdBy, 'email');
			ccer = [ createdByEmail, 'achen@realnetworks.com' ];
			emailTitle2 = 'PO#' + poNumber + ' Needs to be Approved';
			otherId = nextApproverId;
			nlapiLogExecution('debug', 'test', 'executed: 1');
			break;
		case '14':
			emailTitle1 = 'PO#' + poNumber + ' Has Been Approved by FP&A';
			sender = currentUserId;
			receiver = employeeId;
			var createdByEmail = nlapiLookupField('employee', createdBy, 'email');
			ccer = [ createdByEmail, 'achen@realnetworks.com' ];
			emailTitle2 = 'PO#' + poNumber + ' Needs to be Approved';
			otherId = nextApproverId;
			nlapiLogExecution('debug', 'test', 'executed: 14');
			break;
		case '8':
			emailTitle1 = 'PO#' + poNumber + ' Has Been Rejected by FP&A';
			sender = currentUserId;
			// sender = '';
			receiver = employeeId;
			var createdByEmail = nlapiLookupField('employee', createdBy, 'email');
			ccer = [ createdByEmail, 'achen@realnetworks.com' ];
			nlapiLogExecution('debug', 'test', 'executed: 8');
			break;
		case '12':
			emailTitle1 = 'PO#' + poNumber + '. Reply "confirmed" if you\'ve confirmed the goods/service receipt. Purchaser could continue the payment process';
			sender = currentUserId;
			receiver = employeeId;
			emailTitle2 = 'PO#' + poNumber + ' Needs to be Received';
			otherId = AngelaBi;
			nlapiLogExecution('debug', 'test', 'executed: 12');
			break;
		case '15':
			emailTitle1 = 'PO#' + poNumber + ' Has Been Approved by Manager';
			sender = currentUserId;
			// sender = 152;
			receiver = employeeId;
			var createdByEmail = nlapiLookupField('employee', createdBy, 'email');
			ccer = [ createdByEmail, 'achen@realnetworks.com' ];
			emailTitle2 = 'PO#' + poNumber + ' Needs to be Approved';
			otherId = nextApproverId;
			ccer2 = 'achen@realnetworks.com';
			nlapiLogExecution('debug', 'test', 'executed: 15');
			break;
		case '18':
			var approverRole = ' by Manager';
			if (roleId == 1009)
				approverRole = ' by Legal';
			if (roleId == 1001)
				approverRole = ' by Accountant';
			if (roleId == 1008)
				approverRole = ' by CFO';
			emailTitle1 = cfoApproved == 'T' ? 'PO#' + poNumber + ' Has Been Approved by CFO' : 'PO#' + poNumber + ' Has Been Approved' + approverRole;
			sender = currentUserId;
			receiver = employeeId;
			ccer = nlapiLookupField('employee', createdBy, 'email');
			emailTitle2 = 'PO#' + poNumber + '. A Contract Needs to be Approved';
			otherId = nextApproverId;
			ccer2 = 'achen@realnetworks.com';
			nlapiLogExecution('debug', 'test', 'executed: 18' + ', otherId: ' + nextApproverId);
			break;
		case '7':
			emailTitle1 = 'PO#' + poNumber + ' Has Been Rejected by Manager';
			sender = currentUserId;
			receiver = employeeId;
			ccer = [ nlapiLookupField('employee', createdBy, 'email'), 'achen@realnetworks.com' ];
			nlapiLogExecution('debug', 'test', 'executed: 7');
			break;
		case '16':
			emailTitle1 = 'PO#' + poNumber + ' Has Been Rejected by CFO';
			sender = currentUserId;
			receiver = employeeId;
			ccer = nlapiLookupField('employee', createdBy, 'email');
			emailTitle2 = 'PO#' + poNumber + ' Needs to be Received';
			otherId = AngelaBi;
			nlapiLogExecution('debug', 'test', 'executed: 16');
			break;
		case '3':
			emailTitle1 = 'PO#' + poNumber + '. A Contract Needs to be Approved';
			sender = currentUserId;
			receiver = Betty;
			var createdByEmail = nlapiLookupField('employee', createdBy, 'email');
			ccer = [ createdByEmail, 'achen@realnetworks.com' ];
			nlapiLogExecution('debug', 'test', 'executed: 3');
			break;
		case '4':
			emailTitle1 = 'PO#' + poNumber + ' Has Been Approved by Manager';
			sender = currentUserId;
			receiver = BelindaYang;
			var createdByEmail = nlapiLookupField('employee', createdBy, 'email');
			ccer = [ createdByEmail, 'achen@realnetworks.com' ];
			nlapiLogExecution('debug', 'test', 'executed: 4');
			break;
		case '19':
			emailTitle1 = 'PO#' + poNumber + ' Has Finished The Approval Flow';
			sender = currentUserId;
			receiver = AngelaBi;
			ccer = [ nlapiLookupField('employee', createdBy, 'email'), 'achen@realnetworks.com' ];
			nlapiLogExecution('debug', 'test', 'executed: 11');
			break;
		case '20':
			emailTitle1 = 'PO#' + poNumber + ' is Rejected by Purchaser';
			sender = currentUserId;
			receiver = employeeId;
			ccer = nlapiLookupField('employee', createdBy, 'email');
			nlapiLogExecution('debug', 'test', 'executed: 20');
			break;
		}
		nlapiLogExecution('debug', 'sendEmail', 'Email Sending, ' + sender + ', ' + receiver + ', ' + otherId + ', ' + ccer + ', ' + emailTitle1 + ', ' + emailTitle2 + ' .');

		// #region Email HTML
		var htmlStr = '<html xmlns="http://www.w3.org/1999/xhtml"><head>';
		htmlStr += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>Payment Request</title></head>';
		htmlStr += '<body  border="1"; style="font-size:x-small; font-family: Arial,Verdana,Georgia,Serif; width:50%; border-collapse:collapse; bordercolor:Blue;">';

		htmlStr += '<p>Requester:&nbsp;&nbsp;' + poRec.getFieldText('employee') + '</p>';
		htmlStr += '<p>Division Code:&nbsp;&nbsp;' + poRec.getFieldValue('custbody_tn_divisioncodepr') + '</p>';
		htmlStr += '<p>Location:&nbsp;&nbsp;' + poRec.getFieldText('location') + '</p>';
		htmlStr += '<p>Vendor Name:&nbsp;&nbsp;' + poRec.getFieldText('entity') + '</p>';
		htmlStr += '<p>Currency:&nbsp;&nbsp;' + poRec.getFieldText('currency') + '</p>';
		var preHref = nlapiResolveURL('SUITELET', 'customscript_tn_sl_datacenterdetector', 'customdeploy_tn_sl_datacenterdetector', true);
		preHref = preHref.replace('forms', 'system');
		preHref = preHref.substring(0, preHref.indexOf('.com/') + 4);
		var poUrl = preHref + nlapiResolveURL('RECORD', 'purchaseorder', poId, 'VIEW');
		htmlStr += '<p>PO No.:&nbsp;&nbsp;' + poRec.getFieldValue('tranid') + ',&nbsp;&nbsp;<a href="' + poUrl + '">View Record</a></p>';
		htmlStr += '<p>PO Amount:&nbsp;&nbsp;' + poRec.getFieldValue('total') + '</p>';
		htmlStr += '<table border="1"; style="font-size:x-small;  font-family: Arial,Verdana,Georgia,Serif; width:50%; border-collapse:collapse; bordercolor:Blue;"><tr>';
		htmlStr += '<th>No.</th><th>Item</th><th>Quantity</th><th>Product & Description</th><th>Total Amount(Incl.Tax)</th><th>Goods/Service Receipt Amount</th></tr>';

		for (var i = 1; i <= poRec.getLineItemCount('item'); i++) {
			htmlStr += '<tr><td>' + i + '</td>';
			htmlStr += '<td>' + poRec.getLineItemText('item', 'item', i) + '</td>';
			htmlStr += '<td style="text-align: right">' + parseFloat(poRec.getLineItemValue('item', 'quantity', i)).toFixed(2) + '</td>';
			htmlStr += '<td>' + convertNull(poRec.getLineItemValue('item', 'description', i)) + '</td>';
			var taxCode = poRec.getLineItemText('item', 'taxcode', i);
			var taxRate = taxCode.substring(taxCode.indexOf(':') + 1, taxCode.indexOf('%'));
			taxRate = ((0 < taxRate && taxRate < 100) ? taxRate : 0) / 100;
			var grossAmt = (poRec.getLineItemValue('item', 'amount', i) * (1 + taxRate)).toFixed(2);
			htmlStr += '<td style="text-align: right">' + grossAmt + '</td>';
			htmlStr += '<td style="text-align: right">0.00</td></tr>';
		}
		htmlStr += '</table></body></html>';
		// #endregion

		var records = new Object();
		records['transaction'] = poId;
		if (isNull(sender))
			return;
		else {
			if (!isNull(receiver) && !isNull(emailTitle1)) {
				receiver = receiver == 152 ? 176 : receiver;
				nlapiLogExecution('debug', 'test', 'receiver: ' + receiver + ', sender: ' + sender + ', otherId: ' + otherId);
				// ccer = null; // this line will be deleted in UAT
				if (isNull(ccer))
					nlapiSendEmail(sender, receiver, emailTitle1, htmlStr, null, null, records, null, null, false);
				else
					nlapiSendEmail(sender, receiver, emailTitle1, htmlStr, ccer, null, records, null, null, false);
				nlapiLogExecution('debug', 'test', '1 email sent');
			}
			if (!isNull(otherId) && !isNull(emailTitle2)) {
				otherId = otherId == 152 ? 176 : otherId;
				if (isNull(ccer2))
					nlapiSendEmail(sender, otherId, emailTitle2, htmlStr, null, null, records, null, null, false);
				else
					nlapiSendEmail(sender, otherId, emailTitle2, htmlStr, ccer2, null, records, null, null, false);
				nlapiLogExecution('debug', 'test', '2 email sent');
			}
			if (nextApproverId == 131 || nextApproverId == 114) {
				nlapiSendEmail(sender, 'ckarusala@realnetworks.com', 'PO# ' + poNumber + ' is in approval', htmlStr, null, null, records, null, null, false);
				nlapiLogExecution('debug', 'test', '3 email sent');
			}
			nlapiLogExecution('debug', 'test', '4 email sent');
		}
	} catch (emailEx) {
		nlapiLogExecution('debug', 'sendEmail', emailEx);
	}
}

function rejectReason() {
	try {
		var scriptID = 'customscript_tn_failreason';
		var deployID = 'customdeploy_tn_failreason';
		var recID = nlapiGetRecordId();
		var recType = nlapiGetRecordType();
		var paramStr = '&recID=' + recID + '&change=F&l=T&recType=' + recType;
		var myurl = nlapiResolveURL('SUITELET', scriptID, deployID) + paramStr;
		window.open(myurl, "newwindow", "height=300px, width=600px, top=0, left=0,toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	} catch (ex) {
		alert('Error');
		alert(ex);
		alert(ex.getDetails());
	}
}

function beforeSubmitPO(type, form, request) {
	try {
		checkExpiration();
	} catch (ex) {
		nlapiLogExecution('debug', 'test', ex);
	}
}

function checkExpiration() {
	var contractDate = nlapiGetFieldValue('custbody_tn_vendorcontractexpire');
	var tranDate = nlapiGetFieldValue('trandate');
	contractDate = nlapiStringToDate(contractDate);
	tranDate = nlapiStringToDate(tranDate);
	// nlapiLogExecution('debug', 'test', contractDate + ', ' + tranDate);
	// nlapiLogExecution('debug', 'test', (contractDate < tranDate));
	if (contractDate < tranDate)
		nlapiSetFieldValue('custbody_tn_contractexperid', 'T');
	else
		nlapiSetFieldValue('custbody_tn_contractexperid', 'F');
}

function isNull(str) {
	if (str == null || str == '')
		return true;
	else
		false;
}

function convertNull(str) {
	if (isNull(str))
		return '';
	else
		return str;
}