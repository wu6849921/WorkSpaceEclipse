/**
 * Script Description
 * This script is used to scan order.
 */

/*******************************************************************************
 * Copyright 锟� 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ******************************************************************************/

function CheckInPO(request, response) {
	if (request.getMethod() == 'GET') {

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var getOptedField = request.getParameter('custparam_option');
		var userAccountId = ctx.getCompany();
		var vTranType = request.getParameter('custparam_trantype');
		var orderType = request.getParameter('custparam_ordertype');
		var domainName = fndomainName();

		var st0, st1, st2, st3;
		var headerVar = 'Receiving';
		if (vTranType == 'purchaseorder') {
			headerVar = 'PO';
		} else if (vTranType == 'transferorder') {
			headerVar = 'TO';
		} else {
			headerVar = 'RMA';
		}
		if (getLanguage == 'es_ES') {

			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";

		} else {

			st1 = "Enter/Scan " + orderType + "#";
			st2 = "SEND";
			st3 = "PREV";

		}
		var whLocationName = request.getParameter('custparam_whlocationname');
		var st0 = domainName + '-' + headerVar + ' Receiving';
		var CSSurl = '';
		var CSSfilefound = getLoadFile('NS_common.css');

		var errMsg = '';
		if (request.getParameter('custparam_error') != null
				&& request.getParameter('custparam_error') != '') {
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) {

			CSSurl = CSSfilefound.getURL();

		}

		var logmsg = 'getLanguage. = ' + getLanguage + '<br>';
		logmsg = logmsg + 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'userAccountId. = ' + userAccountId + '<br>';
		logmsg = logmsg + 'domainName. = ' + domainName + '<br>';
		logmsg = logmsg + 'CSSfilefound. = ' + CSSfilefound + '<br>';

		nlapiLogExecution('DEBUG', 'PO Scan get values :', logmsg);
		CSSurl = CSSurl.replace(/&/g, "&amp;");
		// starts (Now form name is passed correctly in function to work
		// keyboard enter button)
		var error = "Please enter/scan " + orderType + "#";
		// Ends here
		var functionkeyHtml = getFunctionkeyScriptSE('_rf_checkin_po');
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>"
				+ "<html><head><title>"
				+ st0
				+ "</title>"
				+ "<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"
				+ "<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if (CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl
					+ "' type='text/css' rel='stylesheet'>";
		else
			html = html
					+ "<link href='"
					+ nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css")
					+ "' type='text/css' rel='stylesheet'>";
		html = html
				+ "</head><body>"
				+ "	<script type='text/javascript'>function validateForm() {if(document.getElementById('enterpo').value == ''){document.getElementById('div_error').innerHTML ='"
				+ error
				+ "';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html + functionkeyHtml;
		html = html + " </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html
				+ "	<form name='_rf_checkin_po' method='POST'>"
				+ // onkeydown='return OnKeyDown_CL()' >";
				// " <table class='outertable'>"+
				"		<table width='100%'>"
				+ "			<tr><td class='tableheading'>Receiving "
				+ headerVar
				+ "#</td></tr>"
				+ "			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"
				+ errMsg
				+ "</div></td></tr>"
				+ "		<tr><td></td></tr>"
				+ "		 </table>"
				+ "		<table>"
				+

				"			<tr>"
				+ "				<td align = 'left' class='labelmsg' >"
				+ st1
				+ "				<input type='hidden' name='hdnOptedField' value="
				+ getOptedField
				+ ">"
				+ "				<input type='hidden' name='hdntrantype' value="
				+ vTranType
				+ ">"
				+ "				<input type='hidden' name='hdnordertype' value='"
				+ orderType
				+ "'>"
				+ "				</td>"
				+ "			</tr>"
				+ "			<tr>"
				+ "				<td align = 'left' >"
				+ "				<input type='hidden' name='hdngetLanguage' value="
				+ getLanguage
				+ ">"
				+ "				<input type='hidden' name='hdnWhLocationName' value='"
				+ whLocationName
				+ "'>"
				+ "				</td>"
				+ "			</tr></table>"
				+ "			<table><tr>"
				+ "				<td align = 'left'><input name='enterpo'  class='smalltextbox'  id='enterpo' type='text'/>"
				+

				"				<input name='cmdSend1' class='defaultlink'    type='submit' value='' onclick='return validateForm();'/></td><td  width='20px'>&nbsp;</td>"
				+ "	<td ><input name='cmdSearch' type='submit' value='List' width='100px'/></td>"
				+ "			</tr></table>"
				+ "			<table><tr>"
				+

				"				<td>"
				+ "					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"
				+ "				</td><td width='20px'></td>"
				+ "				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"
				+ "			</tr>"
				+

				" 	</table>"
				+ "	</form>"
				+

				"<script type='text/javascript'>document.getElementById('enterpo').focus();</script>"
				+ "</body>" + "</html>";

		response.write(html);
	}

	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('selectoption');
		var optedEvent = request.getParameter('cmdPrevious');
		var POarray = new Array();

		// POarray["custparam_error"] = 'Invalid Option';
		// POarray["custparam_screenno"] = 'MainMenu';

		POarray["custparam_whlocation"] = request
				.getParameter('custparam_whlocation');
		POarray["custparam_whlocationname"] = request
				.getParameter('hdnWhLocationName');

		var whlocation = request.getParameter('custparam_whlocation');

		var trantype = request.getParameter('hdntrantype');

		var orderType = request.getParameter('hdnordertype');
		POarray["custparam_ordertype"] = orderType;
		if (trantype == null || trantype == '' || trantype == 'null')
			trantype = 'purchaseorder';
		POarray["custparam_trantype"] = trantype;
		var getLanguage = request.getParameter('hdngetLanguage');
		POarray["custparam_language"] = getLanguage;

		nlapiLogExecution('DEBUG', 'trantype', trantype);

		var context = nlapiGetContext();

		var userAccountId = context.getCompany();
		/*
		 * var getHIBCBarcodeFlag = "N"; var
		 * systemRule=getSystemRuleValue('Define inbound barcode
		 * type',whlocation); if(systemRule == null || systemRule == '' ||
		 * systemRule.toUpperCase() == 'NORMAL') { getHIBCBarcodeFlag = "N"; }
		 * else if(systemRule.toUpperCase() == 'GS1' || systemRule.toUpperCase() ==
		 * 'HIBC') { getHIBCBarcodeFlag = "Y"; }
		 * 
		 * POarray["custparam_hibcflag"] = getHIBCBarcodeFlag;
		 */
		var st11, st12;
		if (getLanguage == 'es_ES') {
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "MainMenu";
		} else {
			st11 = "INVALID OPTION";
			st12 = "MainMenu";
		}

		// POarray["custparam_error"] = st11;
		POarray["custparam_screenno"] = st12;
		POarray["custparam_poid"] = request.getParameter('enterpo');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET',
					'customscript_wmsse_receivingmenu',
					'customdeploy_wmsse_receivingmenu', false, POarray);
		} else {
			// var trantype='';
			nlapiLogExecution('DEBUG', 'request.getParameter("cmdSearch")',
					request.getParameter('cmdSearch'));
			if (request.getParameter('cmdSearch') == "List") {
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET',
						'customscript_wmsse_polist_scan',
						'customdeploy_wmsse_polist_scan', false, POarray);
				return;
			}
			var getPOid = request.getParameter('enterpo');
			nlapiLogExecution('DEBUG', 'getPOid', getPOid);

			var vType = 'PurchOrd';
			var ordMsg = 'Transaction';
			if (trantype == 'purchaseorder') {
				vType = 'PurchOrd';
				ordMsg = 'purchase order';
			} else if (trantype == 'transferorder') {
				vType = 'TrnfrOrd';
				ordMsg = 'transfer order';
			} else if (trantype == 'returnauthorization') {
				vType = 'RtnAuth';
				ordMsg = 'return authorization';
			}

			// Check Intercompany Cross-Subsidiary fulfillment feature is
			// enabled or not
			var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

			var filters = new Array();
			var columns = new Array();

			filters.push(new nlobjSearchFilter('tranid', null, 'is', getPOid));
			filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

			/*
			 * if(whlocation!=null && whlocation!='') filters.push(new
			 * nlobjSearchFilter('location', null, 'anyof',['@NONE@',
			 * whlocation]));
			 */

			/*
			 * if(trantype!=null && trantype!='' && whlocation!=null &&
			 * whlocation!="") {
			 */

			nlapiLogExecution('DEBUG', 'whlocation', whlocation);
			if (trantype == 'transferorder') {
				if (whlocation != null && whlocation != "")
					filters.push(new nlobjSearchFilter('transferlocation',
							null, 'anyof', [ '@NONE@', whlocation ]));
			} else {
				if (whlocation != null && whlocation != "") {
					if (crossSubsidiaryFeature == true
							&& trantype == 'returnauthorization') {
						filters.push(new nlobjSearchFilter('inventorylocation',
								null, 'anyof', [ '@NONE@', whlocation ]));
					} else {
						filters.push(new nlobjSearchFilter('location', null,
								'anyof', [ '@NONE@', whlocation ]));
					}

				}
			}
			// }

			var PORecinternalids = new nlapiSearchRecord('transaction',
					'customsearch_wmsse_rcv_ordline_details', filters, columns);
			if (PORecinternalids != null && PORecinternalids != ''
					&& PORecinternalids.length > 0) {

				var vCount = 0;
				var vColumnslist = PORecinternalids[0].getAllColumns();
				var openputawayQtyIndex = 7;
				var conversionOrderQtyIndex = 15;

				for (var x1 = 0; x1 < vColumnslist.length; x1++) {
					var summaryLabel = vColumnslist[x1].getLabel();
					var name = vColumnslist[x1].getName();
					if (summaryLabel == 'Open Putaway Quantity') {
						openputawayQtyIndex = x1;
					} else if (summaryLabel == 'Conversion Order Quantity') {
						conversionOrderQtyIndex = x1;
					} else {

					}
				}

				for (var cnt = 0; cnt < PORecinternalids.length; cnt++) {
					var Location = '';
					if (crossSubsidiaryFeature == true
							&& trantype == 'returnauthorization') {
						Location = PORecinternalids[cnt].getValue(
								'inventorylocation', null, 'group');
					} else {
						Location = PORecinternalids[cnt].getValue('location',
								null, 'group');
					}

					if (Location == '' || Location == null
							|| Location == 'null' || Location == 'undefined') {
						POarray["custparam_error"] = "This " + ordMsg
								+ " is not mapped with any warehouse location";
						response.sendRedirect('SUITELET',
								'customscript_wmsse_poscan',
								'customdeploy_wmsse_poscan', false, POarray);
						return;
					}

					var vpoitemRcvQty = PORecinternalids[cnt]
							.getValue(vColumnslist[openputawayQtyIndex]);
					// var vpoitemQty =
					// PORecinternalids[cnt].getValue('quantity',null,'max');
					var vpoitemQty = PORecinternalids[cnt]
							.getValue(vColumnslist[conversionOrderQtyIndex]);
					var vpoitemNSRcvQty = PORecinternalids[cnt].getValue(
							'quantityshiprecv', null, 'max');

					if (vpoitemRcvQty == null || vpoitemRcvQty == '') {
						vpoitemRcvQty = 0;
					}
					if (vpoitemNSRcvQty == null || vpoitemNSRcvQty == '')
						vpoitemNSRcvQty = 0;
					if (trantype == "returnauthorization") {
						if (parseInt(vpoitemQty) < 0)
							vpoitemQty = Big(vpoitemQty).mul(-1);

					}

					var totalReceivedQty = Big(vpoitemRcvQty).plus(
							vpoitemNSRcvQty);

					var vPoreminqty = Big(vpoitemQty).minus(totalReceivedQty);

					if (parseFloat(vPoreminqty) > 0) {
						vCount = parseFloat(vCount) + 1;
					}
					POarray["custparam_poid"] = PORecinternalids[cnt].getValue(
							'tranid', null, 'group');
					var whCompany = PORecinternalids[cnt].getValue(
							'custbody_nswms_company', null, 'group');
					// POarray["custparam_whlocation"] = whLocation;
					POarray["custparam_company"] = whCompany;
					POarray["custparam_customer"] = PORecinternalids[cnt]
							.getValue('entity', null, 'group');
					// fetch the special order value.
					POarray["custparam_specord"] = PORecinternalids[cnt]
							.getValue('appliedtolinktype', null, 'group');
				}
				var actualBeginTime = TimeStamp();
				POarray["custparam_actualbegintime"] = actualBeginTime;
				if (parseFloat(vCount) > 0) {
					POarray["custparam_error"] = '';
					/*
					 * if(getHIBCBarcodeFlag == "Y") {
					 * response.sendRedirect('SUITELET',
					 * 'customscript_wmsse_hibc_scan',
					 * 'customdeploy_wmsse_hibc_scan', false, POarray); return; }
					 * else {
					 */
					response.sendRedirect('SUITELET',
							'customscript_wmsse_checkinsku',
							'customdeploy_wmsse_checkinsku', false, POarray);
					return;
					/* } */
				} else {

					POarray["custparam_error"] = "Please enter/scan valid "
							+ orderType.toLowerCase() + "#";
					response.sendRedirect('SUITELET',
							'customscript_wmsse_poscan',
							'customdeploy_wmsse_poscan', false, POarray);
					nlapiLogExecution('DEBUG', 'SearchResults ',
							'Length is null');
				}
			} else {

				var POtrantypefilters = new Array();
				POtrantypefilters.push(new nlobjSearchFilter('tranid', null,
						'is', getPOid));
				POtrantypefilters.push(new nlobjSearchFilter('mainline', null,
						'is', 'T'));

				var POtrantypecols = new Array();

				var PORecinternalids = nlapiSearchRecord(trantype,
						'customsearch_wmsse_transactionid_details',
						POtrantypefilters, null);
				var poid = '';
				var createdfrom = '';
				if (PORecinternalids != null && PORecinternalids != '') {
					poid = PORecinternalids[0].getValue('internalid');
					createdfrom = PORecinternalids[0].getValue('createdfrom');
					POarray["custparam_poid"] = PORecinternalids[0]
							.getValue('tranid');
					// }
					if (poid != null && poid != "")
						trantype = nlapiLookupField('transaction', poid,
								'recordType');

					POarray["custparam_trantype"] = trantype;
					var POfilters = new Array();
					POfilters.push(new nlobjSearchFilter('tranid', null, 'is',
							getPOid));
					POfilters.push(new nlobjSearchFilter('mainline', null,
							'is', 'T'));
					POfilters.push(new nlobjSearchFilter('recordtype', null,
							'is', trantype));
					/*
					 * var vRoleLocation=getRoledBasedLocation();
					 * if(vRoleLocation != null && vRoleLocation != '' &&
					 * vRoleLocation != 0) { POfilters.push(new
					 * nlobjSearchFilter('location', null, 'anyof',
					 * vRoleLocation)); }
					 */
					if (trantype == 'transferorder') {
						if (whlocation != null && whlocation != "")
							POfilters.push(new nlobjSearchFilter(
									'transferlocation', null, 'anyof', [
											'@NONE@', whlocation ]));
					} else {
						if (whlocation != null && whlocation != "")
							POfilters.push(new nlobjSearchFilter('location',
									null, 'anyof', [ '@NONE@', whlocation ]));
					}

					var POcols = new Array();

					var PORec = nlapiSearchRecord(trantype,
							'customsearch_wmsse_transactionid_details',
							POfilters, null);
					if (PORec != null && PORec != '') {
						var vSpecialOrder = "";
						var spefilters = new Array();
						spefilters.push(new nlobjSearchFilter('tranid', null,
								'is', getPOid));
						spefilters.push(new nlobjSearchFilter('mainline', null,
								'is', 'F'));
						var specolumns = new Array();

						var posearch = nlapiSearchRecord(trantype,
								'customsearch_wmsse_transactionid_details',
								spefilters, null);

						var vlinelocation = '';
						if (posearch != null && posearch != '') {
							poid = posearch[0].getId();
							vlinelocation = posearch[0].getValue('location');
							vSpecialOrder = posearch[0]
									.getValue('appliedtolinktype');

						}
						var poStatus = PORec[0].getValue('status');
						nlapiLogExecution('DEBUG', 'poStatus', poStatus);
						if (poStatus == 'pendingApproval') {
							POarray["custparam_error"] = "Please approve this "
									+ orderType.toLowerCase() + "# to process";
							response
									.sendRedirect('SUITELET',
											'customscript_wmsse_poscan',
											'customdeploy_wmsse_poscan', false,
											POarray);
							return;
						}

						if (vSpecialOrder != null && vSpecialOrder != ''
								&& vSpecialOrder == 'DropShip') {

							POarray["custparam_error"] = "Drop ship Purchase orders not process in WMS";
							response
									.sendRedirect('SUITELET',
											'customscript_wmsse_poscan',
											'customdeploy_wmsse_poscan', false,
											POarray);
							return;

						}
						// if(poStatus=='pendingReceipt'||poStatus=='partiallyReceived'
						// ||poStatus=='pendingBillPartReceived')
						if (poStatus == 'pendingReceipt'
								|| poStatus == 'partiallyReceived'
								|| poStatus == 'pendingRefundPartReceived'
								|| poStatus == 'pendingBillPartReceived'
								|| poStatus == 'pendingReceiptPartFulfilled'
								|| poStatus == 'Pending Refund/Partially Received') {

						} else if (poStatus == 'closed') {
							POarray["custparam_error"] = "This "
									+ orderType.toLowerCase()
									+ "# has been closed";
							response
									.sendRedirect('SUITELET',
											'customscript_wmsse_poscan',
											'customdeploy_wmsse_poscan', false,
											POarray);
						} else if (poStatus == 'pendingFulfillment') {
							POarray["custparam_error"] = "Please enter/scan valid "
									+ orderType.toLowerCase() + "#";
							response
									.sendRedirect('SUITELET',
											'customscript_wmsse_poscan',
											'customdeploy_wmsse_poscan', false,
											POarray);
						} else {
							// POarray["custparam_error"]="Invalid po status";
							POarray["custparam_error"] = "This "
									+ orderType.toLowerCase()
									+ "# has been received";
							response
									.sendRedirect('SUITELET',
											'customscript_wmsse_poscan',
											'customdeploy_wmsse_poscan', false,
											POarray);
						}

					} else {
						// POarray["custparam_error"]="Invalid po ";
						POarray["custparam_error"] = "Please enter/scan valid "
								+ orderType.toLowerCase() + "#";
						response.sendRedirect('SUITELET',
								'customscript_wmsse_poscan',
								'customdeploy_wmsse_poscan', false, POarray);
					}
				} else {
					// POarray["custparam_error"]="Invalid po ";
					POarray["custparam_error"] = "Please enter/scan valid "
							+ orderType.toLowerCase() + "#";
					response.sendRedirect('SUITELET',
							'customscript_wmsse_poscan',
							'customdeploy_wmsse_poscan', false, POarray);
				}

				/*
				 * POarray["custparam_error"] = "Please enter/scan valid
				 * "+orderType.toLowerCase() +"#";
				 * response.sendRedirect('SUITELET',
				 * 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan',
				 * false, POarray); nlapiLogExecution('DEBUG', 'SearchResults ',
				 * 'Length is null');
				 */
			}

		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}
