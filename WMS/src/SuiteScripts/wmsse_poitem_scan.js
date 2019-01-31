/**
 * Script Description
 * This script displays the items for selected order and used to scan the item.
 */
/*******************************************************************************
 * Copyright 锟� 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ******************************************************************************/

function CheckInSKU(request, response) {
	if (request.getMethod() == 'GET') {
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		// Variable Declaration
		var html = '';

		// Get the PO# from the previous screen, which is passed as a parameter
		var getPONo = request.getParameter('custparam_poid');
		var getActualBeginTime = request
				.getParameter('custparam_actualbegintime');
		var customer = request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var whLoacationName = request.getParameter('custparam_whlocationname');
		var trantype = request.getParameter('custparam_trantype');
		var whCompany = request.getParameter('custparam_company');
		var orderType = request.getParameter('custparam_ordertype');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var BCItem = request.getParameter('custparam_bcitem');
		var BCLotExpiryDate = request.getParameter('custparam_bcexpirydate');
		var BCLot = request.getParameter('custparam_bclot');
		var vSpecOrder = request.getParameter('custparam_specord');

		var headerVar = 'Receiving';
		if (trantype == 'purchaseorder') {
			headerVar = 'PO';
		} else if (trantype == 'transferorder') {
			headerVar = 'TO';
		} else {
			headerVar = 'RMA';
		}

		var getPageCount = request.getParameter('custparam_pagecount');
		if (getPageCount == null || getPageCount == ''
				|| getPageCount == 'null')
			getPageCount = 0;
		var pageSize = 5;
		var totalPageSizeValue = parseInt(getPageCount) * parseInt(pageSize);

		var itemCount = 0;

		getActualBeginTime = TimeStamp(); // We are taking timestamp here
											// because we need to populate each
											// line time differently in open
											// task

		var errMsg = '';
		if (request.getParameter('custparam_error') != null
				&& request.getParameter('custparam_error') != '') {
			var errMsg = request.getParameter('custparam_error');
		}

		// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or
		// not
		var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

		var CSSurl = '';
		var CSSfilefound = getLoadFile('NS_common.css');

		var domainName = fndomainName();

		var st0 = domainName + '-' + headerVar + ' Receiving';
		if (CSSfilefound) {
			CSSurl = CSSfilefound.getURL();
		}
		CSSurl = CSSurl.replace(/&/g, "&amp;");
		var imgfilefound = '';
		var imgUrl = '';
		imgfilefound = loadProgressiveImage();
		if (imgfilefound) {
			imgUrl = imgfilefound.getURL();
		}
		imgUrl = imgUrl.replace(/&/g, "&amp;");

		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getPONo. = ' + getPONo + '<br>';
		logmsg = logmsg + 'totalPageSizeValue. = ' + totalPageSizeValue
				+ '<br>';
		logmsg = logmsg + 'domainName. = ' + domainName + '<br>';
		logmsg = logmsg + 'CSSfilefound. = ' + CSSfilefound + '<br>';

		nlapiLogExecution('DEBUG', 'PO Item scan get values :', logmsg);

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan',
				'customdeploy_wmsse_onbarcodescan');

		// starts (Now form name is passed correctly in function to work
		// keyboard enter button)
		var functionkeyHtml = getFunctionkeyScriptSE('_rf_checkin_item');
		// Ends here
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
				+ "	<script type='text/javascript'>function validateForm() {if(document.getElementById('txtItem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item';	return false;}else{var Line = document.getElementById('hdngetpoitemLine').value; document.getElementById('txtLine').value=Line;document.getElementById('loading').style.display = ''; return true;}}</script>"
				+ "	<script type='text/javascript'>function validateItem(usedBins,Line,vLineItemId,item) {if(usedBins == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item  to receive.';	return false;}else{var str1='span';var str2=item; var itemId=str1.concat(str2);var itemval = document.getElementById(itemId).innerHTML.toString();document.getElementById('txtItem').value=itemval;document.getElementById('txtLine').value=Line;document.getElementById('txtLineItemId').value=vLineItemId;document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html + functionkeyHtml;

		html = html + "<script type = 'text/javascript'>";
		html = html + "function parsebarcode(url)";
		html = html + "{";
		html = html + "var txtitem = document.getElementById('txtItem').value;";
		html = html
				+ "var hdnwhloc = document.getElementById('hdnWhLocation').value;";
		html = html
				+ "var hdnponame = document.getElementById('hdnponame').value;";
		html = html
				+ "var url=url+'&custpage_barcode='+txtitem+'&custpage_whloc='+hdnwhloc+'&custpage_poname='+hdnponame;";
		html = html + "var xhttp = new XMLHttpRequest();";
		html = html + "xhttp.onreadystatechange = function() {";
		html = html + "if (this.readyState == 4 && this.status == 200)";
		html = html + "{";
		html = html + "document.getElementById('div_error').innerHTML = '';";
		html = html
				+ "document.getElementById('hdnbarcodecompstring').value = '';";
		html = html
				+ "document.getElementById('hdncompositebarcode').value = '';";
		html = html + "if(this.response!=null && this.response!='')";
		html = html + "{";
		html = html + "var bccomponents = JSON.parse(this.response);";
		html = html
				+ "if(bccomponents['error'] !=null && bccomponents['error']!='')";
		html = html + "{";
		html = html
				+ "document.getElementById('div_error').innerHTML = bccomponents['error'];";
		html = html + "}";
		html = html + "else ";
		html = html + "{";
		html = html + "var vitem = bccomponents['Item'];";
		html = html
				+ "document.getElementById('hdnbarcodecompstring').value = txtitem;";
		html = html
				+ "document.getElementById('hdncompositebarcode').value = this.response;";
		html = html + "document.getElementById('txtItem').value = vitem;";
		html = html + "}";
		html = html + "}";
		html = html + "}";
		html = html + "};";
		html = html + "  xhttp.open('GET',url, true);";
		html = html + "  xhttp.send();";
		html = html + "}";
		html = html + "</script>";

		html = html
				+ "<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html
				+ "	<form name='_rf_checkin_item' method='POST'>"
				+ "<div id='loading' style='display:none;'>"
				+ "<img id='loading-image' src='"
				+ imgUrl
				+ "' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"
				+ "		<table width='100%'>"
				+ "			<tr><td class='tableheading'>Receiving Item</td></tr>"
				+ "			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"
				+ errMsg
				+ "</div></td></tr>"
				+ "		</table><table>"
				+ "			<tr><td align='center'></td></tr>"
				+ "			<tr>"
				+ "				<td align = 'left' class='labelmsg'>"
				+ orderType
				+ "# <label>"
				+ getPONo
				+ "</label>"
				+ "				<input type='hidden' name='hdnActualBeginTime' value='"
				+ getActualBeginTime
				+ "'>"
				+ "				<input type='hidden' name='hdnCustomer' value="
				+ customer
				+ ">"
				+ "				<input type='hidden' name='hdnWhLocation' id='hdnWhLocation' value="
				+ whLocation
				+ ">"
				+ "				<input type='hidden' name='hdnWhCompany' value="
				+ whCompany
				+ ">"
				+ "				<input type='hidden' name='hdntrantype' value="
				+ trantype
				+ ">"
				+ "				<input type='hidden' name='hdnordertype' value='"
				+ orderType
				+ "'>"
				+ "				<input type='hidden' name='hdngetLanguage' value="
				+ getLanguage
				+ ">"
				+ "				<input type='hidden' name='hdnWhLocationName' value= '"
				+ whLocationName
				+ "'>"
				+ "				<input type='hidden' name='hdnvspecorder' value= '"
				+ vSpecOrder
				+ "'>"
				+ "				<input type='hidden' name='hdncrosssubsidiary' value='"
				+ crossSubsidiaryFeature
				+ "'>"
				+ "				<input type='hidden' name='hdnponame' id='hdnponame' value='"
				+ getPONo
				+ "'>"
				+ "				<input type='hidden' name='hdnbarcodecompstring' id='hdnbarcodecompstring'>"
				+ "				<input type='hidden' name='hdncompositebarcode' id='hdncompositebarcode'>"
				+ "				</td>" + "			</tr>" + "			<tr>"
				+ "				<td align = 'left' class='labelmsg'>Enter/Scan Item"
				+ "				</td>" + "			</tr>" + "			<tr>";
		if (BCItem != null && BCItem != '' && BCItem != 'null'
				&& BCItem != 'undefined') {
			html = html
					+ "				<td align = 'left'><input name='txtItem'  class='smalltextbox'  id='txtItem' value='"
					+ BCItem + "' type='text'/>";
		} else {
			html = html
					+ "				<td align = 'left'><input name='txtItem'  class='smalltextbox' onchange='parsebarcode(\""
					+ ServicePageURL + "\");'  id='txtItem' type='text'/>";
		}
		html = html
				+ "				</td>"
				+ "			</tr>"
				+ "			<tr>"
				+ "				<td align = 'left'><input name='txtLine'  class='smalltextbox'  id='txtLine' type='hidden'/>"
				+ "				</td>"
				+ "			</tr>"
				+ "			<tr>"
				+ "				<td align = 'left'><input name='txtLineItemId'  class='smalltextbox'  id='txtLineItemId' type='hidden'/>"
				+ "				</td>"
				+ "			</tr>"
				+
				// " <tr>"+
				"			</table><table><tr>"
				+ "				<td align = 'left'><input name='cmdSend1' class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td>"
				+ "					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"
				+ "				</td><td width='20px'></td>"
				+ "				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"
				+ "			</tr><tr><td></td></tr>" + "		 </table>";
		var arrPodetails = getPOLineDetailsNew(getPONo, trantype, null,
				whLocation);

		if (arrPodetails != null && arrPodetails != '') {
			nlapiLogExecution('Debug', 'arrPodetails.length',
					arrPodetails.length);
			if (arrPodetails.length > 0) {
				html = html
						+ "	<table>"
						+ " <tr>"
						+ " <td>"
						+ "	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"
						+ " <tr class='uir-machine-headerrow' >" + " <td>Item"
						+ " </td>" + " <td class='align-right'>Received"
						+ " </td>" + " <td class='align-right'>Remaining"
						+ " </td>" + "</tr>";

				var poInternalId = arrPodetails[0].getValue('internalid', null,
						'group');
				var vWhHeadLoc = 0;
				if (poInternalId != null && poInternalId != '') {
					if (trantype != "transferorder")
						vWhHeadLoc = nlapiLookupField(trantype, poInternalId,
								'location');
					else
						vWhHeadLoc = nlapiLookupField(trantype, poInternalId,
								'transferlocation');
				}
				var vAltClass = 'uir-list-row-tr line uir-list-row-even';
				var openputawayQtyIndex = 7;
				var unitsIndex = 14;
				var conversionQtyIndex = 15;
				var coversionRcvdQtyIndex = 16;
				var coversionRateIndex = 17;
				var toshippedQTYIndex = 18;
				if (arrPodetails != null && arrPodetails != '') {
					var vColumnslist = arrPodetails[0].getAllColumns();

					for (var x1 = 0; x1 < vColumnslist.length; x1++) {
						var summaryLabel = vColumnslist[x1].getLabel();
						var name = vColumnslist[x1].getName();
						if (summaryLabel == 'Open Putaway Quantity') {
							openputawayQtyIndex = x1;
						} else if (name == 'unit') {
							unitsIndex = x1;
						} else if (summaryLabel == 'Conversion Order Quantity') {
							conversionQtyIndex = x1;
						} else if (summaryLabel == 'Conversion Received Quantity') {
							coversionRcvdQtyIndex = x1;
						} else if (summaryLabel == 'Conversion Rate') {
							coversionRateIndex = x1;
						} else if (summaryLabel == 'TO Fulfilled Quantity') {
							toshippedQTYIndex = x1;

						} else {

						}
					}

					for (var s = getPageCount; s < arrPodetails.length; s++) {

						itemCount = parseInt(itemCount) + 1;

						if (s % 2 == 1)
							vAltClass = 'uir-list-row-tr line uir-list-row-even';
						else
							vAltClass = 'uir-list-row-tr line uir-list-row-odd';

						var usedBins = '';
						var itemName = '';
						var vUnits = "";

						var vConversionRate = "";
						var vpoitem = arrPodetails[s].getText('item', null,
								'group');
						var vpoitemId = arrPodetails[s].getValue('item', null,
								'group');
						vUnits = arrPodetails[s]
								.getText(vColumnslist[unitsIndex]);
						vConversionRate = arrPodetails[s]
								.getValue(vColumnslist[coversionRateIndex]);
						var vpoitemQty = arrPodetails[s]
								.getValue(vColumnslist[conversionQtyIndex]);
						var vpoitemNSRcvQty = arrPodetails[s]
								.getValue(vColumnslist[coversionRcvdQtyIndex]);
						var vpoitemRcvQty = arrPodetails[s]
								.getValue(vColumnslist[openputawayQtyIndex]);
						var vpoitemLine = arrPodetails[s].getValue('line',
								null, 'group');
						usedBins = arrPodetails[s].getValue('usebins', 'item',
								'group');

						if (vpoitem != null && vpoitem != "") {
							itemName = "";
						}

						if (vpoitemNSRcvQty == null || vpoitemNSRcvQty == '')
							vpoitemNSRcvQty = 0;
						if (vpoitemRcvQty == null || vpoitemRcvQty == '')
							vpoitemRcvQty = 0;

						if (trantype == "returnauthorization") {
							if (parseInt(vpoitemQty) < 0)
								vpoitemQty = Big(vpoitemQty).mul(-1);
						}

						if (trantype == "transferorder") {
							vpoitemQty = arrPodetails[s]
									.getValue(vColumnslist[toshippedQTYIndex]);

							if (parseInt(vpoitemQty) == 0) {
								// check for whether directly fulfilled in the
								// netsuite.

								var filters = new Array();
								var columns = new Array();

								filters.push(new nlobjSearchFilter('tranid',
										null, 'is', getPONo));
								filters
										.push(new nlobjSearchFilter(
												'formulatext', null, 'is',
												'Shipping')
												.setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
								filters.push(new nlobjSearchFilter('type',
										null, 'anyof', 'TrnfrOrd'));
								var TOLineDetails = new nlapiSearchRecord(
										'transferorder',
										'customsearch_wmsse_transactionid_details',
										filters, null);

								if (TOLineDetails != null
										&& TOLineDetails != ''
										&& TOLineDetails != 'null'
										&& TOLineDetails.length > 0) {
									nlapiLogExecution('Debug', 'TOLineDetails',
											TOLineDetails.length);
									for (var t = 0; t < TOLineDetails.length; t++) {
										var tline = TOLineDetails[t]
												.getValue('line');

										if (parseInt(tline) + 1 == vpoitemLine) {

											vpoitemQty = TOLineDetails[t]
													.getValue('quantityshiprecv');

											if (vConversionRate != null
													&& vConversionRate != ''
													&& vConversionRate != 'null'
													&& vConversionRate != 'undefined') {
												if (vpoitemQty != null
														&& vpoitemQty != ''
														&& vpoitemQty != 'null'
														&& vpoitemQty != 'undefined') {
													vpoitemQty = Number(Big(
															vpoitemQty).div(
															vConversionRate));

												}

											}

											break;

										}
									}
								}
							}
						}

						var totalReceivedQty = Number(Big(vpoitemRcvQty).plus(
								vpoitemNSRcvQty));
						var vPoreminqty = Big(vpoitemQty).minus(
								totalReceivedQty);

						if (parseFloat(vPoreminqty) < 0)
							vPoreminqty = 0;
						var vLineLocation = '';
						if (crossSubsidiaryFeature == true
								&& trantype == "returnauthorization")
							vLineLocation = arrPodetails[s].getValue(
									'inventorylocation', null, 'group');
						else
							vLineLocation = arrPodetails[s].getValue(
									'location', null, 'group');

						if (vLineLocation == null || vLineLocation == '')
							vLineLocation = vWhHeadLoc;

						var itemType = nswms_GetItemType(vpoitemId,
								vLineLocation);

						if (itemType == "noninventoryitem"
								|| itemType == "otherchargeitem"
								|| itemType == "serviceitem"
								|| itemType == "downloaditem"
								|| itemType == "giftcertificateitem") {
							usedBins = "T";
						}

						var checkInURL_1 = nlapiResolveURL('SUITELET',
								'customscript_wmsse_checkinqty',
								'customdeploy_wmsse_checkinqty');
						if (itemType == "lotnumberedinventoryitem"
								|| itemType == "lotnumberedassemblyitem") {
							checkInURL_1 = nlapiResolveURL('SUITELET',
									'customscript_wmsse_checkinlot',
									'customdeploy_wmsse_checkinlot');
						}
						var linkURL_1 = "#";
						if ((parseFloat(vPoreminqty) > 0)
								&& parseFloat(vpoitemQty) > 0) {
							linkURL_1 = checkInURL_1
									+ '&custparam_lineno='
									+ vpoitemLine
									+ '&custparam_fetcheditemid='
									+ vpoitemId
									+ '&custparam_pointernalid='
									+ arrPodetails[s].getValue('internalid',
											null, 'group')
									+ '&custparam_rem_qty=' + vPoreminqty
									+ '&custparam_rec_qty=' + totalReceivedQty
									+ '&custparam_whlocation=' + vLineLocation
									+ '&custparam_whlocationname ='
									+ whLocationName + '&custparam_poid='
									+ getPONo + '&custparam_trantype='
									+ trantype + '&custparam_company='
									+ whCompany + '&custparam_itemtype='
									+ itemType + '&custparam_ordertype='
									+ orderType + '&custparam_usedbinsflag='
									+ usedBins + '&custparam_actualbegintime='
									+ getActualBeginTime
									+ '&custparam_customer=' + customer
									+ '&custparam_uom=' + vUnits
									+ '&custparam_conversionrate='
									+ vConversionRate;
						}
						html = html + "	<tr class='" + vAltClass + "'>";
						if (linkURL_1 == '#')
							html = html + " <td>" + vpoitem + "</td>";
						else
							html = html
									+ " <td ><a id='span"
									+ s
									+ "' name='link1URL_1' href='#' onclick='return validateItem(\""
									+ usedBins + "\",\"" + vpoitemLine
									+ "\",\"" + vpoitemId + "\",\"" + s
									+ "\");'>" + vpoitem + "</a></td>";

						if (vUnits != null && vUnits != '' && vUnits != 'null'
								&& vUnits != 'undefined'
								&& vUnits != '- None -') {
							html = html
									+ " <td class='align-right'> "
									+ parseFloat(parseFloat(totalReceivedQty)
											.toFixed(5)) + " " + vUnits
									+ "</td>";
							html = html
									+ " <td class='align-right'> "
									+ parseFloat(parseFloat(vPoreminqty)
											.toFixed(5)) + " " + vUnits
									+ "</td>";
						} else {
							html = html
									+ " <td class='align-right'> "
									+ parseFloat(parseFloat(totalReceivedQty)
											.toFixed(5)) + "</td>";
							html = html
									+ " <td class='align-right'> "
									+ parseFloat(parseFloat(vPoreminqty)
											.toFixed(5)) + "</td>";
						}
						html = html + "</tr>";

						if (parseInt(itemCount) >= 5)
							break;

					}
				}
				html = html
						+ "	</table>"
						+ "				<input type='hidden' name='hdngetPageCount' value="
						+ getPageCount + ">" + " </td>" + "</tr>" + "</table>";
			}
		}

		html = html + "		<table>	<tr>";
		if (getPageCount > 0) {
			html = html
					+ "				<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		} else {
			html = html + "				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html + "				<td width='20px'></td>";
		if (arrPodetails.length > (parseInt(getPageCount) + 5))
		// if(parseInt(itemCount)>1)
		{
			html = html
					+ "				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html + "			</tr>" + "		 </table>";
		html = html
				+ "</form>"
				+

				"<script type='text/javascript'>document.getElementById('txtItem').focus();</script>"
				+ "</body>" + "</html>";

		response.write(html);
	} else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating SKU/ITEM');

		nlapiLogExecution('ERROR', 'hdnbarcodecompstring', request
				.getParameter('hdnbarcodecompstring'));
		nlapiLogExecution('ERROR', 'hdncompositebarcode', request
				.getParameter('hdncompositebarcode'));

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag = 'F';
		POarray["custparam_poid"] = request.getParameter('custparam_poid');
		var poItem = request.getParameter('txtItem');
		var getPoLineNo = request.getParameter('txtLine');
		var getPoLineItemId = request.getParameter('txtLineItemId');
		var crossSubsidiaryFeature = request.getParameter('hdncrosssubsidiary');

		POarray["custparam_bcComponents"] = request
				.getParameter('hdncompositebarcode');
		POarray["custparam_compbarcodestring"] = request
				.getParameter('hdnbarcodecompstring');

		POarray["custparam_screenno"] = '2';
		POarray["custparam_actualbegindate"] = request
				.getParameter('hdnActualBeginDate');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_actualbegintime"] = request
				.getParameter('hdnActualBeginTime');
		POarray["custparam_customer"] = request.getParameter('hdnCustomer');
		POarray["custparam_actualbegintimeampm"] = request
				.getParameter('hdnActualBeginTimeAMPM');
		POarray["custparam_trantype"] = request.getParameter('hdntrantype');
		POarray["custparam_whlocationname"] = request
				.getParameter('hdnWhLocationName');
		POarray["custparam_specord"] = request.getParameter('hdnvspecorder');

		var trantype = request.getParameter('hdntrantype');

		var optedEvent = request.getParameter('cmdPrevious'); // To trap the
																// previous
																// button
		var orderType = request.getParameter('hdnordertype');
		POarray["custparam_ordertype"] = orderType;

		var logMsg = 'PO = ' + POarray["custparam_poid"] + '<br>';
		logMsg = logMsg + 'Item = ' + poItem + '<br>';
		logMsg = logMsg + 'getPoLineNo = ' + getPoLineNo + '<br>';
		logMsg = logMsg + 'getPoLineItemId = ' + getPoLineItemId + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - SKU', logMsg);

		// Processing only if the 'Previous' button is not pressed
		if (optedEvent != 'Back (F7)') {

			nlapiLogExecution('DEBUG', 'request.getParameter("cmdNextList")',
					request.getParameter('cmdNextList'));
			nlapiLogExecution('DEBUG', 'request.getParameter("cmdPrevList")',
					request.getParameter('cmdPrevList'));
			if (request.getParameter('cmdNextList') == "Next") {
				POarray["custparam_pagecount"] = parseInt(request
						.getParameter('hdngetPageCount')) + 5;
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET',
						'customscript_wmsse_checkinsku',
						'customdeploy_wmsse_checkinsku', false, POarray);
				return;
			}
			if (request.getParameter('cmdPrevList') == "Prev") {
				POarray["custparam_pagecount"] = parseInt(request
						.getParameter('hdngetPageCount')) - 5;
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET',
						'customscript_wmsse_checkinsku',
						'customdeploy_wmsse_checkinsku', false, POarray);
				return;
			}

			if (poItem != "") {

				var filters = new Array();
				var cols = new Array();
				cols.push(new nlobjSearchColumn('entity'));
				var poid;
				filters.push(new nlobjSearchFilter('tranid', null, 'is',
						POarray["custparam_poid"]));

				var posearch = nlapiSearchRecord(trantype,
						'customsearch_wmsse_transactionid_details', filters,
						cols);
				if (posearch != null && posearch != '') {
					poid = posearch[0].getId();
					var vendorID = posearch[0].getValue('entity');
					nlapiLogExecution('ERROR', 'poid', poid);
					var currItem = new Array();
					if (getPoLineItemId != null && getPoLineItemId != ''
							&& getPoLineItemId != 'null'
							&& getPoLineItemId != 'undefined') {
						var fields = [ 'itemid', 'internalid' ];
						var vLookUpResults = nlapiLookupField('item',
								getPoLineItemId, fields);
						if (vLookUpResults != null && vLookUpResults != '') {
							currItem[0] = vLookUpResults.internalid;
							currItem[1] = vLookUpResults.itemid;
						}
						nlapiLogExecution('ERROR', 'inside getPoLineItemId',
								currItem);
					} else {
						currItem = getSKUIdWithName(poItem,
								POarray["custparam_whlocation"],
								POarray["custparam_company"], poid);

						if (currItem == null || currItem == '') {
							try {
								// commented the above code of barcoding parsing
								// and implemented the new approach for barcode
								// parsing
								// scannned Bar code

								nlapiLogExecution('Error',
										'Composite Bar Code parsing starts',
										TimeStampinSec());

								var currItem = new Array();
								var barcodecomponents = parsebarcodestring(
										vendorID, poItem,
										POarray["custparam_whlocation"], poid);

								if (barcodecomponents != null
										&& barcodecomponents != ''
										&& barcodecomponents != 'null') {

									if (barcodecomponents["error"] == "NoBarcodeFormats") {
										POarray["custparam_error"] = 'Please enter/scan valid item.';
										response
												.sendRedirect(
														'SUITELET',
														'customscript_wmsse_checkinsku',
														'customdeploy_wmsse_checkinsku',
														false, POarray);
										return;
									}
									if (barcodecomponents["error"] != null
											&& barcodecomponents["error"] != ''
											&& barcodecomponents["error"] != 'undefined') {
										POarray["custparam_error"] = barcodecomponents["error"];
										response
												.sendRedirect(
														'SUITELET',
														'customscript_wmsse_checkinsku',
														'customdeploy_wmsse_checkinsku',
														false, POarray);
										return;
									}

									var vItem = barcodecomponents['Item'];
									var vItemIntrid = barcodecomponents['ItemIntrid'];
									if (!isempty(vItemIntrid))
										currItem[0] = barcodecomponents['ItemIntrid'];
									if (!isempty(vItem))
										currItem[1] = barcodecomponents['Item'];
									var vbarcodeQty = barcodecomponents['Quantity'];
									var vbarcodeUOM = barcodecomponents['UOM'];

									if (currItem != null && currItem != ''
											&& currItem != 'null'
											&& currItem != 'undefined'
											&& currItem != undefined) {

										var currItemType = nswms_GetItemType(
												currItem[0],
												POarray["custparam_whlocation"]);
										if (currItemType == "lotnumberedinventoryitem"
												|| currItemType == "lotnumberedassemblyitem") {
											var vbarcodeLot = barcodecomponents['Lot'];
											var vbarcodeLotExpirydate = barcodecomponents['ExpiryDt'];

											if (!isempty(vbarcodeLot)) {
												POarray["custparam_bclot"] = vbarcodeLot;
											}

											if (!isempty(vbarcodeLotExpirydate))
												POarray["custparam_bcexpirydate"] = vbarcodeLotExpirydate;
										} else if (currItemType == "serializedinventoryitem"
												|| currItemType == "serializedassemblyitem") {
											var UOMType = '';
											var fields = [ 'unitstype' ];
											var vLookUpResults = nlapiLookupField(
													'item', currItem[0], fields);
											if (vLookUpResults != null
													&& vLookUpResults != '') {
												UOMType = vLookUpResults.unitstype;

											}
											nlapiLogExecution('DEBUG',
													'UOMType', UOMType);

											var vuomconversionrate = getConversionRate(vbarcodeUOM);
											var vbarcodeSerial = barcodecomponents['Serial Number'];
											if (!isempty(vbarcodeSerial)) {
												if ((!isempty(vbarcodeQty))
														&& (vbarcodeQty == 1 || vbarcodeQty == '1')
														&& (UOMType == null
																|| UOMType == '' || vuomconversionrate == 1)) {
													POarray["custparam_bcserial"] = vbarcodeSerial;
												} else {
													deletebarcodestring(poItem);
													POarray["custparam_error"] = 'Quantity for the serialized item should be 1 in base units';
													response
															.sendRedirect(
																	'SUITELET',
																	'customscript_wmsse_checkinsku',
																	'customdeploy_wmsse_checkinsku',
																	false,
																	POarray);
													nlapiLogExecution('DEBUG',
															'barcode_serial',
															'qty is greater than 1 for serial#');
													return;
												}
											}
										}

										if (!isempty(vbarcodeQty))
											POarray["custparam_bcqty"] = vbarcodeQty;
										if (!isempty(vbarcodeUOM))
											POarray["custparam_bcuom"] = vbarcodeUOM;

										// Mapping - 05022018

										POarray["custparam_bcComponents"] = JSON
												.stringify(barcodecomponents);
										POarray["custparam_compbarcodestring"] = poItem;
										POarray["custparam_bcqty"] = '';
										POarray["custparam_bcuom"] = '';
										POarray["custparam_bclot"] = '';
										POarray["custparam_bcexpirydate"] = '';
										POarray["custparam_bcserial"] = '';

										// Up to here Mapping - 05022018

										var logMsg1 = 'vItem =' + vItem
												+ '<br>';
										logMsg1 = logMsg1 + 'currItem = '
												+ currItem + '<br>';
										logMsg1 = logMsg1 + 'vbarcodeLot = '
												+ vbarcodeLot + '<br>';
										logMsg1 = logMsg1
												+ 'POarray["custparam_bclot"] = '
												+ POarray["custparam_bclot"]
												+ '<br>';
										logMsg1 = logMsg1
												+ 'vbarcodeLotExpirydate = '
												+ vbarcodeLotExpirydate
												+ '<br>';
										logMsg1 = logMsg1
												+ 'POarray["custparam_bcexpirydate"] = '
												+ POarray["custparam_bcexpirydate"]
												+ '<br>';
										logMsg1 = logMsg1 + 'vbarcodeQty = '
												+ vbarcodeQty + '<br>';
										logMsg1 = logMsg1 + 'vbarcodeUOM = '
												+ vbarcodeUOM + '<br>';
										logMsg1 = logMsg1 + 'vbarcodeSerial = '
												+ vbarcodeSerial + '<br>';
										logMsg1 = logMsg1
												+ 'POarray["custparam_bcqty"] = '
												+ POarray["custparam_bcqty"]
												+ '<br>';
										logMsg1 = logMsg1
												+ 'POarray["custparam_bcuom"] = '
												+ POarray["custparam_bcuom"]
												+ '<br>';
										logMsg1 = logMsg1
												+ '["custparam_bcserial"] = '
												+ POarray["custparam_bcserial"]
												+ '<br>';

										nlapiLogExecution('DEBUG',
												'Barcode Parsing parameters',
												logMsg1);

										nlapiLogExecution(
												'Error',
												'Composite Bar Code parsing ends',
												TimeStampinSec());

									}

								}
							} catch (e) {
								POarray["custparam_error"] = 'Please enter/scan valid item';
								response.sendRedirect('SUITELET',
										'customscript_wmsse_checkinsku',
										'customdeploy_wmsse_checkinsku', false,
										POarray);
								nlapiLogExecution('ERROR', 'exception ', e);
								return;

							}
						}
					}

					if (currItem != null && currItem != '') {
						// Retrieving item record for validated SKU

						var vIntId = currItem[0];
						if (vIntId != null && vIntId != '') {
							var poLineDetails = getPOLineDetailsNew(
									POarray["custparam_poid"], trantype,
									vIntId, POarray["custparam_whlocation"]);

							var vBoolFount = false;
							var vColumnslist = '';
							var openputawayQtyIndex = 7;
							var unitsIndex = 14;
							var conversionQtyIndex = 15;
							var coversionRcvdQtyIndex = 16;
							var coversionRateIndex = 17;
							var toshippedQTYIndex = 18;

							if (poLineDetails != null && poLineDetails != ''
									&& poLineDetails.length > 0) {
								vColumnslist = poLineDetails[0].getAllColumns();

								for (var x1 = 0; x1 < vColumnslist.length; x1++) {
									var summaryLabel = vColumnslist[x1]
											.getLabel();
									var name = vColumnslist[x1].getName();
									if (summaryLabel == 'Open Putaway Quantity') {
										openputawayQtyIndex = x1;
									} else if (name == 'unit') {
										unitsIndex = x1;
									} else if (summaryLabel == 'Conversion Order Quantity') {
										conversionQtyIndex = x1;
									} else if (summaryLabel == 'Conversion Received Quantity') {
										coversionRcvdQtyIndex = x1;
									} else if (summaryLabel == 'Conversion Rate') {
										coversionRateIndex = x1;
									} else if (summaryLabel == 'TO Fulfilled Quantity') {
										toshippedQTYIndex = x1;
										// nlapiLogExecution('ERROR',
										// 'toshippedQTYIndex',
										// toshippedQTYIndex);
									} else {

									}
								}
								for (var j = 0; j < poLineDetails.length; j++) {

									var usedBins = '';

									var polineno = poLineDetails[j].getValue(
											'line', null, 'group');
									var pocheckinqty = poLineDetails[j]
											.getValue('quantity', null, 'max');
									var vpoitemQty = poLineDetails[j]
											.getValue(vColumnslist[conversionQtyIndex]);
									var vpoitemNSRcvQty = poLineDetails[j]
											.getValue(vColumnslist[coversionRcvdQtyIndex]);
									var vpoitemRcvQty = poLineDetails[j]
											.getValue(vColumnslist[openputawayQtyIndex]);
									var vConversionRate = poLineDetails[j]
											.getValue(vColumnslist[coversionRateIndex]);
									if (vpoitemQty == null || vpoitemQty == '')
										vpoitemQty = 0;
									if (vpoitemRcvQty == null
											|| vpoitemRcvQty == '')
										vpoitemRcvQty = 0;
									if (vpoitemNSRcvQty == null
											|| vpoitemNSRcvQty == '')
										vpoitemNSRcvQty = 0;

									usedBins = poLineDetails[j].getValue(
											'usebins', 'item', 'group');
									POarray["custparam_usedbinsflag"] = usedBins;

									if (trantype == "returnauthorization") {
										if (parseInt(vpoitemQty) < 0)
											vpoitemQty = Big(vpoitemQty)
													.mul(-1);
									}
									if (trantype == "transferorder") {
										vpoitemQty = poLineDetails[j]
												.getValue(vColumnslist[toshippedQTYIndex]);

										if (parseInt(vpoitemQty) == 0) {
											// check for whether directly
											// fulfilled in the netsuite.
											var filters = new Array();
											var columns = new Array();

											filters.push(new nlobjSearchFilter(
													'tranid', null, 'is',
													POarray["custparam_poid"]));
											filters
													.push(new nlobjSearchFilter(
															'formulatext',
															null, 'is',
															'Shipping')
															.setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
											filters.push(new nlobjSearchFilter(
													'type', null, 'anyof',
													'TrnfrOrd'));
											var TOLineDetails = new nlapiSearchRecord(
													'transferorder',
													'customsearch_wmsse_transactionid_details',
													filters, null);

											if (TOLineDetails != null
													&& TOLineDetails != ''
													&& TOLineDetails != 'null'
													&& TOLineDetails.length > 0) {

												for (var t = 0; t < TOLineDetails.length; t++) {
													var tline = TOLineDetails[t]
															.getValue('line');

													if (parseInt(tline) + 1 == polineno) {
														vpoitemQty = TOLineDetails[t]
																.getValue('quantityshiprecv');
														if (vConversionRate != null
																&& vConversionRate != ''
																&& vConversionRate != 'null'
																&& vConversionRate != 'undefined') {
															if (vpoitemQty != null
																	&& vpoitemQty != ''
																	&& vpoitemQty != 'null'
																	&& vpoitemQty != 'undefined') {
																vpoitemQty = Number(Big(
																		vpoitemQty)
																		.div(
																				vConversionRate));
															}

														}

														break;

													}
												}
											}
										}
									}

									var totalReceivedQty = Number(Big(
											vpoitemRcvQty)
											.plus(vpoitemNSRcvQty));

									var vPoreminqty = Number(Big(vpoitemQty)
											.minus(totalReceivedQty));

									if ((parseFloat(getPoLineNo) == parseFloat(polineno))
											|| (parseFloat(getPoLineNo) == null
													|| parseFloat(getPoLineNo) == ''
													|| parseFloat(getPoLineNo) == 'null' || parseFloat(getPoLineNo) == 'undefined')
											|| getPoLineNo.toString() == '') {
										if (parseFloat(vPoreminqty) < 0)
											vPoreminqty = 0;

										if (parseFloat(vPoreminqty) > 0) {
											if (poLineDetails != null
													&& poLineDetails.length > 0) {
												tempflag = 'T';
												var poInternalId = poLineDetails[j]
														.getValue('internalid',
																null, 'group');

												POarray["custparam_lineno"] = poLineDetails[j]
														.getValue('line', null,
																'group');
												POarray["custparam_fetcheditemid"] = vIntId;
												POarray["custparam_pointernalid"] = poInternalId;
												POarray["custparam_fetcheditemname"] = currItem[1];
												POarray["custparam_rem_qty"] = vPoreminqty;
												POarray["custparam_rec_qty"] = totalReceivedQty;
												var poLineLevelLoc = '';
												if (crossSubsidiaryFeature == 'true'
														&& trantype == 'returnauthorization') {
													POarray["custparam_whlocation"] = poLineDetails[j]
															.getValue(
																	'inventorylocation',
																	null,
																	'group');
													poLineLevelLoc = poLineDetails[j]
															.getValue(
																	'inventorylocation',
																	null,
																	'group');
												} else {
													POarray["custparam_whlocation"] = poLineDetails[j]
															.getValue(
																	'location',
																	null,
																	'group');
													poLineLevelLoc = poLineDetails[j]
															.getValue(
																	'location',
																	null,
																	'group');
												}
												// code modified on 06 Apr
												// If Po LineLevel
												// Location(site) is null then
												// choose the location(site)
												// from header value.

												if (poLineLevelLoc != null
														&& poLineLevelLoc != "") {
													if (crossSubsidiaryFeature == 'true'
															&& trantype == 'returnauthorization') {
														POarray["custparam_whlocation"] = poLineDetails[j]
																.getValue(
																		'inventorylocation',
																		null,
																		'group');
													} else {
														POarray["custparam_whlocation"] = poLineDetails[j]
																.getValue(
																		'location',
																		null,
																		'group');
													}
												} else {
													if (trantype != "transferorder")
														POarray["custparam_whlocation"] = nlapiLookupField(
																trantype,
																poInternalId,
																'location');
													else
														POarray["custparam_whlocation"] = nlapiLookupField(
																trantype,
																poInternalId,
																'transferlocation');
												}
												// end of code as of 06 Apr.
												var vUnits = poLineDetails[j]
														.getText(vColumnslist[unitsIndex]);
												var vConversionRate = poLineDetails[j]
														.getValue(vColumnslist[coversionRateIndex]);
												POarray["custparam_uom"] = vUnits;
												POarray["custparam_conversionrate"] = vConversionRate;
												var itemType = nswms_GetItemType(
														POarray["custparam_fetcheditemid"],
														POarray["custparam_whlocation"]);
												POarray["custparam_itemtype"] = itemType;

												logMsg = 'PO = ' + poInternalId
														+ '<br>';
												logMsg = logMsg
														+ 'Line = '
														+ POarray["custparam_lineno"]
														+ '<br>';
												logMsg = logMsg
														+ 'Fetched Item = '
														+ POarray["custparam_fetcheditemid"]
														+ '<br>';
												logMsg = logMsg
														+ 'Location = '
														+ POarray["custparam_whlocation"]
														+ '<br>';
												logMsg = logMsg
														+ 'Item Cube = '
														+ POarray["custparam_itemcube"];
												logMsg = logMsg + 'itemType = '
														+ itemType;
												nlapiLogExecution('ERROR',
														'Line Details', logMsg);
												if (itemType == "noninventoryitem"
														|| itemType == "otherchargeitem"
														|| itemType == "serviceitem"
														|| itemType == "downloaditem"
														|| itemType == "giftcertificateitem") {
													usedBins = "T";
												}
												if (usedBins == "F") {
													POarray["custparam_error"] = 'Please select use bins flag for this item '
															+ currItem[1]
															+ ' to receive.';
													response
															.sendRedirect(
																	'SUITELET',
																	'customscript_wmsse_checkinsku',
																	'customdeploy_wmsse_checkinsku',
																	false,
																	POarray);
													nlapiLogExecution('ERROR',
															'itemRecord',
															'Invalid Item Specified');
													return;
												}
												if (poItem != "") {
													var currentUser = getCurrentUser();
													var lockfilters = new Array();
													lockfilters
															.push(new nlobjSearchFilter(
																	'custrecord_wmsse_trantype',
																	null, 'is',
																	trantype));
													lockfilters
															.push(new nlobjSearchFilter(
																	'custrecord_wmsse_order',
																	null,
																	'anyof',
																	poInternalId));
													lockfilters
															.push(new nlobjSearchFilter(
																	'custrecord_wmsse_line',
																	null,
																	'equalto',
																	polineno));
													lockfilters
															.push(new nlobjSearchFilter(
																	'custrecord_wmsse_lockflag',
																	null, 'is',
																	'T'));
													var lockcolumns = new Array();
													var lockresults = nlapiSearchRecord(
															'customrecord_wmsse_lockrecs',
															'customsearch_wmsse_lockrecs_srh',
															lockfilters, null);

													if (lockresults != null
															&& lockresults != '') {
														var getLockUser = lockresults[0]
																.getValue('custrecord_wmsse_user');
														var getLockLine = lockresults[0]
																.getValue('custrecord_wmsse_line');

														if (getLockUser != currentUser) {
															POarray["custparam_error"] = 'The line item is being processed by other user.';
															response
																	.sendRedirect(
																			'SUITELET',
																			'customscript_wmsse_checkinsku',
																			'customdeploy_wmsse_checkinsku',
																			false,
																			POarray);
															return;
														} else if (parseInt(getLockLine) != parseInt(polineno)) {
															var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
															LockRecord
																	.setFieldValue(
																			'name',
																			poInternalId);
															LockRecord
																	.setFieldValue(
																			'custrecord_wmsse_trantype',
																			trantype);
															LockRecord
																	.setFieldValue(
																			'custrecord_wmsse_order',
																			poInternalId);
															LockRecord
																	.setFieldValue(
																			'custrecord_wmsse_line',
																			polineno);
															LockRecord
																	.setFieldValue(
																			'custrecord_wmsse_lockflag',
																			'T');
															LockRecord
																	.setFieldValue(
																			'custrecord_wmsse_user',
																			currentUser);

															var date = new Date();
															var mSecs = date
																	.getTime();
															LockRecord
																	.setFieldValue(
																			'custrecord_wmsse_time_msec',
																			mSecs);

															var recid = nlapiSubmitRecord(LockRecord);
															LockRecord = null;
															nlapiLogExecution(
																	'ERROR',
																	'Inside else if Record Locked Successfully',
																	recid);
														}
													} else {
														var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
														LockRecord
																.setFieldValue(
																		'name',
																		poInternalId);
														LockRecord
																.setFieldValue(
																		'custrecord_wmsse_trantype',
																		trantype);
														LockRecord
																.setFieldValue(
																		'custrecord_wmsse_order',
																		poInternalId);
														LockRecord
																.setFieldValue(
																		'custrecord_wmsse_line',
																		polineno);
														LockRecord
																.setFieldValue(
																		'custrecord_wmsse_lockflag',
																		'T');
														LockRecord
																.setFieldValue(
																		'custrecord_wmsse_user',
																		currentUser);

														var date = new Date();
														var mSecs = date
																.getTime();
														LockRecord
																.setFieldValue(
																		'custrecord_wmsse_time_msec',
																		mSecs);

														var recid = nlapiSubmitRecord(LockRecord);
														nlapiLogExecution(
																'ERROR',
																'Record Locked Successfully',
																recid);
														LockRecord = null;
													}
													lockresults = null;
													lockcolumns = null;
													lockfilters = null;

													if (itemType == "lotnumberedinventoryitem"
															|| itemType == "lotnumberedassemblyitem") {
														nlapiLogExecution(
																'ERROR',
																'into lotnumberedinventoryitem',
																itemType);
														POarray["custparam_error"] = '';
														nlapiLogExecution(
																'Error',
																'Redirecting to PO Lot Screen',
																TimeStampinSec());
														response
																.sendRedirect(
																		'SUITELET',
																		'customscript_wmsse_checkinlot',
																		'customdeploy_wmsse_checkinlot',
																		false,
																		POarray);
														return;
													} else {
														POarray["custparam_error"] = '';
														nlapiLogExecution(
																'Error',
																'Redirecting to PO Qty Screen',
																TimeStampinSec());
														response
																.sendRedirect(
																		'SUITELET',
																		'customscript_wmsse_checkinqty',
																		'customdeploy_wmsse_checkinqty',
																		false,
																		POarray);
														return;
													}
												} else {
													nlapiLogExecution(
															'ERROR',
															'No SKU scanned or entered',
															poItem);
													POarray["custparam_error"] = 'Please enter/scan valid item';
													response
															.sendRedirect(
																	'SUITELET',
																	'customscript_wmsse_checkinsku',
																	'customdeploy_wmsse_checkinsku',
																	false,
																	POarray);
												}
											}

										}
									}
								}
							}
							if (tempflag == 'F') {
								POarray["custparam_error"] = 'Please enter/scan valid item';
								response.sendRedirect('SUITELET',
										'customscript_wmsse_checkinsku',
										'customdeploy_wmsse_checkinsku', false,
										POarray);
								nlapiLogExecution('ERROR', 'itemRecord',
										'Invalid Item Specified');
								return;
							}

						}
					} else {
						var itemfilters = new Array();
						itemfilters.push(new nlobjSearchFilter('nameinternal',
								null, 'is', poItem));
						var itemcolumns = new Array();
						itemcolumns.push(new nlobjSearchColumn('isinactive'));
						itemcolumns.push(new nlobjSearchColumn('location'));
						var itemresults = nlapiSearchRecord('item',
								'customsearch_wmsse_itemdetails', itemfilters,
								itemcolumns);
						// nlapiLogExecution('ERROR', 'itemresults',
						// itemresults);
						if (itemresults != null && itemresults != '') {
							var itemLoc = itemresults[0].getValue('location');

							if (itemresults[0].getValue('isinactive') == "T") {
								POarray["custparam_error"] = 'Entered item is inactive.';
							} else if ((itemLoc != POarray["custparam_whlocation"])
									&& (itemLoc != null && itemLoc != ''
											&& itemLoc != 'null' && itemLoc != 'undefined')) {
								POarray["custparam_error"] = 'This item is mapped to different site.';
							} else {
								POarray["custparam_error"] = 'Please enter/scan valid item';
							}
						} else {
							POarray["custparam_error"] = 'Please enter/scan valid item';
						}
						response
								.sendRedirect('SUITELET',
										'customscript_wmsse_checkinsku',
										'customdeploy_wmsse_checkinsku', false,
										POarray);
						nlapiLogExecution('ERROR', 'itemRecord',
								'Invalid Item Specified');
						return;
					}
				} else {
					POarray["custparam_error"] = 'Please enter/scan valid item';
					response.sendRedirect('SUITELET',
							'customscript_wmsse_checkinsku',
							'customdeploy_wmsse_checkinsku', false, POarray);
					nlapiLogExecution('ERROR', 'poLineDetails ',
							'No order lines retrieved for this SKU');
					return;
				}
			}
		} else {
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_poscan',
					'customdeploy_wmsse_poscan', false, POarray);
			return;
		}
	} // end of first if condition
} // end of function.
