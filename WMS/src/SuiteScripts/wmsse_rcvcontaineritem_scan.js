/**
 * Script Description
 * This script displays the items for selected order and used to scan the item.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function CheckInSKU(request, response){
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getPONo = request.getParameter('custparam_containerNo');
		nlapiLogExecution('ERROR', 'Into Request', getPONo);
		var getCOId = request.getParameter('custparam_container');
		nlapiLogExecution('ERROR', 'Into Request', getCOId);

		/*var getActualBeginDate = request.getParameter('custparam_actualbegindate');
		  var getActualBeginTime = request.getParameter('custparam_actualbegintime'); 
		  var getActualBeginTimeAMPM = request.getParameter('custparam_actualbegintimeampm');*/
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer = request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var trantype = request.getParameter('custparam_trantype');
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		nlapiLogExecution('ERROR', 'trantype', trantype);
		var whCompany = request.getParameter('custparam_company');
		var orderType = request.getParameter('custparam_ordertype');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var headerVar = "Container";
		var vcontainer = request.getParameter('custparam_containerNo');
		var vcontainerid = request.getParameter('custparam_container');	
		var orderedQty = request.getParameter('custparam_oredrquantity');	
		var shipmntNo = request.getParameter('custparam_shipmentno');
		nlapiLogExecution('ERROR', 'orderedQty', orderedQty);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
		 errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+ headerVar +' Receiving';
		if(CSSfilefound) 
		{
			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl);
		}
		CSSurl = CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			nlapiLogExecution('ERROR', 'imgUrl', imgUrl);
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html  style='height:device-height;width:device-width;'><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		//"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "</head><body style='height:device-height;width:device-width;'>"+
		"	<script type='text/javascript'>function validateForm() {if(document.getElementById('txtItem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item';	return false;}else{document.getElementById('loading').style.display = ''; return true;}}</script>"+
		"	<script type='text/javascript'>function validateItem(val,itemid,line) {document.getElementById('txtItem').value =val;document.getElementById('txtLineItemId').value =itemid; document.getElementById('txtLine').value =line; document.forms['_rf_checkin_item'].submit();	return  true;}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		//"	<script type='text/javascript'>function validateItem(usedBins,vpoitem) {alert('hi'); return false; }</script></head><body>"+
		html = html +"	<form name='_rf_checkin_item' method='POST'>"    + //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Receiving Item</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		//"		<tr><td></td></tr><tr><td></td></tr>"+
		"		</table><table>"+
		//"			<tr border='1'><td align='center'  valign='top'><b>RECEIVING</b></td></tr>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+headerVar+"#: <label>" + getPONo + "</label>"+
		//"				<input type='hidden' name='hdnActualBeginDate' value=" + getActualBeginDate + ">"+		
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+	
		//"				<input type='hidden' name='hdnActualBeginTimeAMPM' value=" + getActualBeginTimeAMPM + ">"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		//"				<input type='hidden' name='hdninternalId' value=" + internalId + ">"+
		"				<input type='hidden' name='hdnordertype' value='" + orderType + "'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value= '" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnorderedQty' id = 'hdnorderedQty' value= '" + orderedQty + "'>"+
		"				<input type='hidden' name='hdnshipmntNo' value=" + shipmntNo + ">"+	
		"				<input type='hidden' name='hdncontainer' value=" + vcontainerid + ">"+
		"				<input type='hidden' name='hdncontainerNo' value=" + vcontainer + ">"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Item"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtItem'  class='smalltextbox'  id='txtItem' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtLine'  class='smalltextbox'  id='txtLine' type='hidden'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtLineItemId'  class='smalltextbox'  id='txtLineItemId' type='hidden'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+		
		"			</table><table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr><tr><td></td></tr>"+
		"		 </table>";
		var arrCodetails = getConatinerDetails(vcontainerid,whLocation);
		nlapiLogExecution('ERROR', 'getConatinerDetails', arrCodetails);
		html = html + "	<table>"+
		" <tr>"+
		" <td>"+
		"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
		" <tr class='uir-machine-headerrow' >"+
		" <td class='listheadertdleft listheadertextb uir-column-large' >PO#"+
		" </td>"+
		" <td class='listheadertdleft listheadertextb uir-column-large' >Item"+
		" </td>"+			
		" <td align='right'>Received Qty"+
		" </td>"+	
		" <td align='right'>Expected Qty"+
		" </td>"+
		"</tr>";
		if(arrCodetails !=null && arrCodetails!='' && arrCodetails.length != null && arrCodetails.length >0)
		{
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			for(var m1=0;m1<arrCodetails.length;m1++)
			{
				if(m1%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';

				var po = arrCodetails[m1].getValue('custrecord_wmsse_trllinepono');
				var pono = arrCodetails[m1].getText('custrecord_wmsse_trllinepono');
				pono = pono.split('#');
				var ponum = pono[1];
				var item = arrCodetails[m1].getText('custrecord_wmsse_trllineitem');
				var itemid = arrCodetails[m1].getValue('custrecord_wmsse_trllineitem');
				var orderedQty = arrCodetails[m1].getValue('custrecord_wmsse_trllineordqty');
				var expectedQty = arrCodetails[m1].getValue('custrecord_wmsse_trllineexpqty');
				var receivedQty = arrCodetails[m1].getValue('custrecord_wmsse_trllineqtyrcvd');
				//var receivedQty = parseFloat(orderedQty)- parseFloat(expectedQty);
				nlapiLogExecution('ERROR', 'expectedQty', expectedQty);
				nlapiLogExecution('ERROR', 'receivedQty', receivedQty);
				if(receivedQty == null || receivedQty == '' || receivedQty == 'null')
				{
					receivedQty =0;
				}
				
				var str = "PO :" +po+ ",PO :" +ponum+ ", itemid :" +itemid+ ", item :" +item+ ", orderedQty :"+orderedQty +", expectedQty :"+expectedQty +", receivedQty :"+receivedQty;
				nlapiLogExecution('ERROR', 'str', str);
				html = html + "	<tr class='" + vAltClass + "'  >"+
				"<td> "+ponum+" </td>";
				if(parseFloat(expectedQty) > parseFloat(receivedQty))
				{
					//html = html + 	"<td><a href='#' onClick='validateItem(\""+item+"\",\""+itemid+"\");' > "+item+" </a></td>";
					html = html +   "<td ><a id='span"+m1+"' href='#' onclick='return validateItem(\""+item+"\",\""+itemid+"\",\""+m1+"\");'>"+item+"</a></td>";

				}
				else
				{
					html = html + "<td>"+item+"</td>";
				}

				html = html + "<td align='right'> "+receivedQty+" </td>"+
				"<td align='right'> "+expectedQty+" </td></tr>";

			}
		}


		html = html + "</table></td></tr></table>	</form>"+

		"<script type='text/javascript'>document.getElementById('txtItem').focus();</script>"+
		"<input type='hidden' name='hdnitemid' id='hdnitemid' value=" + itemid + ">"+				
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating SKU/ITEM');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		POarray["custparam_containerNo"] = request.getParameter('hdncontainerNo');	
		POarray["custparam_container"] = request.getParameter('hdncontainer');
		POarray["custparam_poitem"] = request.getParameter('txtItem');
		
		var itemid = request.getParameter('txtLineItemId');
		nlapiLogExecution('ERROR', 'itemid', itemid);
		nlapiLogExecution('ERROR', 'item', POarray["custparam_poitem"]);
		POarray["custparam_actualbegindate"] = request.getParameter('hdnActualBeginDate');	
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_customer"] = request.getParameter('hdnCustomer');
		POarray["custparam_actualbegintimeampm"] = request.getParameter('hdnActualBeginTimeAMPM');
		POarray["custparam_trantype"] = request.getParameter('custparam_trantype');
		POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		POarray["custparam_oredrquantity"] = request.getParameter('hdnorderedQty');
		POarray["custparam_shipmentno"] = request.getParameter('hdnshipmntNo');
		nlapiLogExecution('ERROR', 'POarray["custparam_oredrquantity"]', POarray["custparam_oredrquantity"]);
		var trantype=request.getParameter('custparam_trantype');
		nlapiLogExecution('ERROR', 'trantype', trantype);
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var orderType=request.getParameter('hdnordertype');
		POarray["custparam_ordertype"]=orderType;
		var logMsg = 'PO = ' + POarray["custparam_container"] + '<br>';
		logMsg = logMsg + 'Item = ' + POarray["custparam_poitem"] + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - SKU', logMsg);
		POarray["custparam_actualbegintime"] = TimeStamp();
		var qtyCheckFlag = 'F';
		nlapiLogExecution('ERROR', 'qtyCheckFlag', qtyCheckFlag);
		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){
			if (POarray["custparam_poitem"] != "") {

				var filters = new Array();	
				var containerId = '';
				var poid = '';
				filters.push(new nlobjSearchFilter('custrecord_wmsse_appointmenttrailer', null, 'is', POarray["custparam_containerNo"]));	

				var posearch = nlapiSearchRecord('customrecord_wmsse_trailer', null, filters, null);
				if(posearch!=null && posearch!='')
				{
					containerId = posearch[0].getId();
					nlapiLogExecution('ERROR', 'containerId', containerId);

					//var currItem = validateSKU(POarray["custparam_poitem"], POarray["custparam_whlocation"], POarray["custparam_company"],poid);
					var currItem = getSKUIdWithName(POarray["custparam_poitem"], POarray["custparam_whlocation"], POarray["custparam_company"],poid);
					if(currItem!=null && currItem!='')
					{
						// Retrieving item record for validated SKU		
						//if(itemRecord != null){
						//var itemDesc = itemRecord.getFieldValue('purchasedescription');
						var vIntId=currItem[0];
						
						POarray["custparam_fetcheditemid"] = vIntId;
						POarray["custparam_fetcheditemname"] = currItem[1];
						POarray["custparam_poitem"] = currItem[1];
						
						var chec = "vIntId :" +vIntId+ ",currItem[1] :" +currItem[1];
						nlapiLogExecution('ERROR','chec',chec);
						
						var filters1 = new Array();	
						
						if(vIntId != null && vIntId != '' && vIntId != 'null')
							filters1.push(new nlobjSearchFilter('custrecord_wmsse_trllineitem', null, 'is', vIntId));	
						if(containerId != null && containerId != '' && containerId != 'null' && containerId != undefined)
							filters1.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber', null, 'is', containerId));
						var columns1 = new Array();
						/*columns1.push(new nlobjSearchColumn('custrecord_wmsse_trlnumber',null,'group'));	
						columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllineitem',null,'group'));*/
						columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepono',null,'count'));
						
						var porecs = nlapiSearchRecord('customrecord_wmsse_trailerline', null, filters1, columns1);
						nlapiLogExecution('ERROR','porecs',porecs.length);
						
						for(var p=0; p < porecs.length; p++)
							{
							var pocount = porecs[p].getValue('custrecord_wmsse_trllinepono',null,'count');
							}
						nlapiLogExecution('ERROR','pocount',pocount);
						var itemType = nswms_GetItemType(POarray["custparam_fetcheditemid"], POarray["custparam_whlocation"]);
						POarray["custparam_itemtype"] = itemType;

						if(pocount > 1)
						{
							nlapiLogExecution('ERROR','pocount',pocount);

							POarray["custparam_error"] = '';
							response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontpolist', 'customdeploy_wmsse_rcvcontpolist', false, POarray);
							return;
						}
						else
						{
							if(vIntId != null && vIntId != '' && vIntId != 'null' && pocount != null && pocount != 'null' && pocount != '')
							{
								//var itemType = nswms_GetItemType(vIntId, POarray["custparam_whlocation"]);
								if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
								{
									var poLineDetails =	getPkgConatinerDetails(POarray["custparam_container"],POarray["custparam_whlocation"]);
									if(poLineDetails != null && poLineDetails != '' && poLineDetails != 'null' && poLineDetails.length >0)
									{	
									nlapiLogExecution('ERROR','poLineDetails',poLineDetails.length);

									var vBoolFount=false;
									for(var j=0; j<poLineDetails.length; j++)
									{
										// var vColumnslist=poLineDetails[j].getAllColumns();
										//var usedBins='';

										var vLineitem = poLineDetails[j].getText('custrecord_wmsse_trllinepkgitem');
										nlapiLogExecution('ERROR','vLineitem',vLineitem);
										nlapiLogExecution('ERROR','currItem[1]',currItem[1]);
										if(vLineitem == currItem[1])
										{
											var containerNo = poLineDetails[j].getText('custrecord_wmsse_trllinepkgcontainer');
											var pointernalid = poLineDetails[j].getValue('custrecord_wmsse_trllinepkgpono');
											var po = poLineDetails[j].getText('custrecord_wmsse_trllinepkgpono');
											var pono = po.split('#');
											var ponum = pono[1];
											var polineno=poLineDetails[j].getValue('custrecord_wmsse_trllinepkgpolineno');
											var vpoitemQty = poLineDetails[j].getValue('custrecord_wmsse_trllinepkgordqty');
											var vexpqty = poLineDetails[j].getValue('custrecord_wmsse_trllinepkgexpqty');
											//var vpoitemRcvQty= parseFloat(vpoitemQty)- parseFloat(vexpqty);
											var vpoitemRcvQty= poLineDetails[j].getValue('custrecord_wmsse_trllinepkgrcvdqty');
											nlapiLogExecution('ERROR', 'vpoitemRcvQty', vpoitemRcvQty);
											var lot = poLineDetails[j].getText('custrecord_wmsse_trllinepkglot');

											if(vpoitemQty == null || vpoitemQty == '')
												vpoitemQty=0;
											if(vpoitemRcvQty==null || vpoitemRcvQty=='')
												vpoitemRcvQty=0;

											nlapiLogExecution('ERROR', 'vexpqty', vexpqty);
											nlapiLogExecution('ERROR', 'vpoitemRcvQty', vpoitemRcvQty);
											nlapiLogExecution('ERROR', 'ponum', ponum);
											//usedBins= poLineDetails[j].getValue('usebins','item','group');



											var vPoreminqty = parseFloat(vexpqty)- parseFloat(vpoitemRcvQty);
											nlapiLogExecution('ERROR', 'vPoreminqty', vPoreminqty);

											if(parseFloat(vPoreminqty)<0)
												vPoreminqty=0;
											if(parseFloat(vPoreminqty)>0)
											{
												qtyCheckFlag = 'T';
												nlapiLogExecution('ERROR', 'polineno', polineno);
												nlapiLogExecution('DEBUG', 'conatinerNo', containerNo);
												if(poLineDetails != null && poLineDetails.length > 0)
												{
													tempflag='T';
													//var poInternalId = poid;
													nlapiLogExecution('ERROR', 'POInternalId', pointernalid);

													POarray["custparam_lineno"] = polineno;
													POarray["custparam_fetcheditemid"] = vIntId;
													POarray["custparam_internalid"] = vIntId;
													POarray["custparam_pointernalid"] = pointernalid;
													POarray["custparam_potext"] =  ponum;
													POarray["custparam_remainingQty"] = vPoreminqty;
													POarray["custparam_rec_qty"] = vpoitemRcvQty;
													POarray["custparam_ordered_qty"] = vpoitemQty;
													POarray["custparam_oredrquantity"] = vpoitemQty;
													POarray["custparam_expectquantity"] = vexpqty;
													
													POarray["custparam_lot"] = lot;
													POarray["custparam_container"] = containerId;
													POarray["custparam_containerNo"] = containerNo;
													//POarray["custparam_fetcheditemname"] = POarray["custparam_poitem"];
													POarray["custparam_fetcheditemname"] = currItem[1];
													POarray["custparam_poitem"] = currItem[1];
													
													//POarray["custparam_itemdescription"] = itemDesc;
													//code modified on 06 Apr
													//If Po LineLevel Location(site) is null then choose the location(site) from header value.

													//end of code as of 06 Apr.

													POarray["custparam_itemtype"] = itemType;

													

													if((POarray["custparam_poitem"] != "" && POarray["custparam_poitem"] != "null" && POarray["custparam_poitem"] != null) && (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
													{
														nlapiLogExecution('ERROR', 'into lotnumberedinventoryitem', itemType);
														POarray["custparam_error"] = '';
														response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlot', 'customdeploy_wmsse_rcvcontlot', false, POarray);
														return;

													}
													
													else if((POarray["custparam_poitem"] != "" && POarray["custparam_poitem"] != "null" && POarray["custparam_poitem"] != null) && (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem"))
													{
														nlapiLogExecution('ERROR', 'into serializedinventoryitem', itemType);
														nlapiLogExecution('ERROR', 'POarray["custparam_potext"]2', POarray["custparam_potext"]);
														nlapiLogExecution('ERROR', 'POarray', POarray);
														POarray["custparam_error"] = '';
														response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
														return;

													} 
													else 
													{
														nlapiLogExecution('ERROR', 'No SKU scanned or entered', POarray["custparam_poitem"]);
														POarray["custparam_error"] = 'Please enter/scan valid item';
														response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
														return;	
													}
												}
											}
										}
									}
									
									if(qtyCheckFlag == "F")
									{
										POarray["custparam_error"] = 'RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';
										response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
										return;	
									}
									
									}
									
									else if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
									{
										nlapiLogExecution('ERROR', 'No lot number details are mapped against to this container', POarray["custparam_poitem"]);
										POarray["custparam_error"] = 'No lot number details are mapped against this container';
										response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
										return;	
									}
									
									else
									{
										nlapiLogExecution('ERROR', 'No serial number details are mapped against to this container', POarray["custparam_poitem"]);
										POarray["custparam_error"] = 'No serial number details are mapped against this container';
										response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
										return;	
									}	
									
								}
								else if(itemType == "inventoryitem" || itemType == "assemblyitem")
								{
									var poLineDetails =	getConatinerDetails(POarray["custparam_container"],POarray["custparam_whlocation"]);
									nlapiLogExecution('ERROR','poLineDetails',poLineDetails.length);

									for(var j=0; j<poLineDetails.length; j++)
									{
										//var vColumnslist=poLineDetails[j].getAllColumns();
										//var usedBins='';

										var vLineitem = poLineDetails[j].getText('custrecord_wmsse_trllineitem');
										if(vLineitem == currItem[1])
										{
											var containerNo = poLineDetails[j].getText('custrecord_wmsse_trlnumber');
											var pointernalid = poLineDetails[j].getValue('custrecord_wmsse_trllinepono');
											var pono = poLineDetails[j].getText('custrecord_wmsse_trllinepono');
											pono = pono.split('#');
											var ponum = pono[1];
											var polineno=poLineDetails[j].getValue('custrecord_wmsse_trllinepolineno');
											var vpoitemQty = poLineDetails[j].getValue('custrecord_wmsse_trllineordqty');
											var vexpqty = poLineDetails[j].getValue('custrecord_wmsse_trllineexpqty');
											//var vpoitemRcvQty= parseFloat(vpoitemQty)- parseFloat(vexpqty);
											var vpoitemRcvQty= poLineDetails[j].getValue('custrecord_wmsse_trllineqtyrcvd');
											if(vpoitemQty == null || vpoitemQty == '')
												vpoitemQty=0;
											if(vpoitemRcvQty==null || vpoitemRcvQty=='')
												vpoitemRcvQty=0;
											nlapiLogExecution('ERROR', 'vexpqty', vexpqty);
											nlapiLogExecution('ERROR', 'vpoitemRcvQty', vpoitemRcvQty);
											//usedBins= poLineDetails[j].getValue('usebins','item','group');
											var vPoreminqty = parseFloat(vexpqty)- parseFloat(vpoitemRcvQty);
											nlapiLogExecution('ERROR', 'vPoreminqty', vPoreminqty);
											nlapiLogExecution('ERROR', 'ponum', ponum);

											if(parseFloat(vPoreminqty)<0)
												vPoreminqty=0;
											if(parseFloat(vPoreminqty)>0)
											{

												nlapiLogExecution('ERROR', 'polineno', polineno);
												nlapiLogExecution('DEBUG', 'conatinerNo', containerNo);
												if(poLineDetails != null && poLineDetails.length > 0)
												{
													qtyCheckFlag = 'T';
													tempflag='T';
													//var containerId = poid;
													nlapiLogExecution('ERROR', 'POInternalId', pointernalid);
													POarray['custparam_poid'] = ponum;													
													POarray["custparam_lineno"] = polineno;
													POarray["custparam_fetcheditemid"] = vIntId;
													POarray["custparam_pointernalid"] = pointernalid;
													POarray["custparam_remainingQty"] = vPoreminqty;
													POarray["custparam_rec_qty"] = vpoitemRcvQty;
													POarray["custparam_oredrquantity"] = vpoitemQty;
													POarray["custparam_expectquantity"] = vexpqty;
													POarray["custparam_potext"] =  ponum;										
													POarray["custparam_itemtype"] = itemType;
													POarray["custparam_container"] = containerId;
													POarray["custparam_containerNo"] = containerNo;
													//POarray["custparam_fetcheditemname"] = POarray["custparam_poitem"];
													POarray["custparam_fetcheditemname"] = currItem[1];
													POarray["custparam_poitem"] = currItem[1];
													
													
													nlapiLogExecution('ERROR', 'POarray["custparam_potext"]', POarray["custparam_potext"]);
													//POarray["custparam_itemdescription"] = itemDesc;
													//code modified on 06 Apr
													//If Po LineLevel Location(site) is null then choose the location(site) from header value.

													//end of code as of 06 Apr.

													if(POarray["custparam_poitem"] != "")
													{
														nlapiLogExecution('ERROR', 'POarray["custparam_potext"]2', POarray["custparam_potext"]);
														nlapiLogExecution('ERROR', 'POarray', POarray);
															POarray["custparam_error"] = '';
															response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
															return;														
													} 
													else
													{
														nlapiLogExecution('ERROR', 'No SKU scanned or entered', POarray["custparam_poitem"]);
														POarray["custparam_error"] = 'Please enter/scan valid item';
														response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
														return;	
													}
												}
											}
										}
									} 
									if(qtyCheckFlag == "F")
									{
										POarray["custparam_error"] = 'RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';
										response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
										return;	
									}
									if(tempflag=='F')
									{
										POarray["custparam_error"] = 'Please enter/scan valid item';
										response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
										nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
										return;
									}
								}
							}
						}
					}
					else
					{
						POarray["custparam_error"] = 'Please enter/scan valid item';
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
						nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
						return;
					}
				} 
				else 
				{
					POarray["custparam_error"] = 'Please enter/scan valid item';
					response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
					nlapiLogExecution('ERROR', 'poLineDetails ', 'No order lines retrieved for this SKU');
					return;
				}
			}
		} 
		else 
		{
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsumm', 'customdeploy_wmsse_rcvcontsumm', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.

function getConatinerDetails(containernumber,whLocation)
{
	var filter = new Array();
	if(containernumber!=null && containernumber!='' && containernumber!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber',null,'anyof',containernumber));	
	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trlnumber'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepono'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepolineno'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineqtyrcvd'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineordqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineexpqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineitem'));	
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinelocation'));	
	var ContainerDetails = new nlapiSearchRecord('customrecord_wmsse_trailerline', null, filter, columns);
	
	return ContainerDetails;
}

function getPkgConatinerDetails(containernumber,whLocation)
{
	var filter = new Array();
	if(containernumber!=null && containernumber!='' && containernumber!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgcontainer',null,'anyof',containernumber));
	
	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));

	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgcontainer'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpono'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpolineno'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgrcvdqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgordqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgexpqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgitem'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkglot'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgloc'));	
	var ContainerDetails = new nlapiSearchRecord('customrecord_wmsse_trailerlinepkgs', null, filter, columns);

	return ContainerDetails;
}
