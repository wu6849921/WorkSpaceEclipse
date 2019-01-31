/**
 * Script Description
 * This script is used to scan the Lot# for selected item.
 */

/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function CheckInLot(request, response){
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';
		var getCONo = request.getParameter('custparam_containerNo');
		nlapiLogExecution('ERROR', 'Into Request', getCONo);
		var getCOId = request.getParameter('custparam_container');
		nlapiLogExecution('ERROR', 'getCOId', getCOId);
		//	Get the PO# from the previous screen, which is passed as a parameter		
		/*var getPONo = request.getParameter('custparam_po');
		nlapiLogExecution('ERROR', 'Into Request', getPONo);*/

		var getActualBeginDate = request.getParameter('custparam_actualbegindate');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var getActualBeginTimeAMPM = request.getParameter('custparam_actualbegintimeampm');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var orderType=request.getParameter('custparam_ordertype');
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');
		var getPOItem = request.getParameter('custparam_poitem');
		nlapiLogExecution('ERROR','getPOItem', getPOItem);
		var getPOLineNo = request.getParameter('custparam_lineno');
		nlapiLogExecution('ERROR', 'getPOLineNo', getPOLineNo);
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getPOInternalId = request.getParameter('custparam_pointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_remainingQty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var lotno = request.getParameter('custparam_lotno');
		var usedBins = request.getParameter('custparam_usedbinsflag');
		var orderedQty = request.getParameter('custparam_ordered_qty');
		
		getPONo = request.getParameter('custparam_potext');
		nlapiLogExecution('ERROR', 'getPONo', getPONo);
		if(request.getParameter('custparam_ordered_qty') == null || request.getParameter('custparam_ordered_qty') == 'null' || request.getParameter('custparam_ordered_qty') =='')
		orderedQty = request.getParameter('custparam_oredrquantity');
		var expectedQty = request.getParameter('custparam_expectquantity');
		nlapiLogExecution('ERROR','expectedQty', expectedQty);
		//getItemRecQty = request.getParameter('custparam_rec_qty');
		lotno = request.getParameter('custparam_lot');
		
		var headerVar='Container';
		var lotText='';
		if(lotno!=null && lotno!='' && lotno!='undefined')
		{
			lotText=lotno;
		}
		else
		{
			lotText='';
		}
		nlapiLogExecution('ERROR','lotText', lotText);
	/*	//Locking Records
		var POarray = new Array();
		
		POarray["custparam_po"] = getPONo;
		POarray["custparam_whlocation"] = whLocation;
		POarray["custparam_company"] = whCompany;
		POarray["custparam_option"] = getOptedField;
		POarray["custparam_actualbegintime"] = getActualBeginTime;
		POarray["custparam_customer"] = customer;
		POarray["custparam_trantype"] = trantype;
		POarray["custparam_ordertype"] = orderType;
		POarray["custparam_pointernalid"] = getPOInternalId;
		POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		var currentUser=getCurrentUser();
		nlapiLogExecution('ERROR','currentUser', currentUser);
		var lockfilters=new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getPOInternalId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'is',getPOLineNo));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
		var lockcolumns= new Array();
		lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_user'));
		lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_line'));			
		var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', null, lockfilters, lockcolumns);
		
		if(lockresults!=null && lockresults!='')
		{
			var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
			var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
			nlapiLogExecution('ERROR', 'getLockUser', getLockUser);
			nlapiLogExecution('ERROR', 'getLockLine', getLockLine);
			if(getLockUser!=currentUser)
			{
				POarray["custparam_error"]='The line item is being processed by other user.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
				nlapiLogExecution('ERROR', 'Record Locked by another user', '');
				return;
			}
			else if(parseInt(getLockLine)!=parseInt(getPOLineNo))
			{
				var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
				LockRecord.setFieldValue('name',getPOInternalId);
				LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
				LockRecord.setFieldValue('custrecord_wmsse_order',getPOInternalId);
				LockRecord.setFieldValue('custrecord_wmsse_line',getPOLineNo);
				LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
				LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
				var recid = nlapiSubmitRecord(LockRecord);
				nlapiLogExecution('ERROR', 'Inside else if Record Locked Successfully', recid);
			}
		}
		else
		{
			var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
			LockRecord.setFieldValue('name',getPOInternalId);
			LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
			LockRecord.setFieldValue('custrecord_wmsse_order',getPOInternalId);
			LockRecord.setFieldValue('custrecord_wmsse_line',getPOLineNo);
			LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
			LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
			var recid = nlapiSubmitRecord(LockRecord);
			nlapiLogExecution('ERROR', 'Record Locked Successfully', recid);
		}
		//end
*/		
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		nlapiLogExecution('ERROR', 'getItemRemQty :  getItemRecQty', getItemRemQty + " : " + getItemRecQty);
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+headerVar+' Receiving';
		var getPreferBin=request.getParameter('custparam_preferbin');

		/*var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		itemfilters.push(new nlobjSearchFilter('preferredbin', null, 'is', 'T'));
		var itemcolumns= new Array();
		itemcolumns[0] = new nlobjSearchColumn('preferredbin');
		itemcolumns[1] = new nlobjSearchColumn('itemid');
		itemcolumns[2] = new nlobjSearchColumn('binnumber');
		itemcolumns[3] = new nlobjSearchColumn('name');		
		var itemresults= nlapiSearchRecord('item', null, itemfilters, itemcolumns);
		if(itemresults!=null && itemresults!='')
		{
			getPreferBin = itemresults[0].getValue('binnumber');
		}*/

		var dtsettingFlag = DateSetting();
		nlapiLogExecution('Debug', 'dtsettingFlag', dtsettingFlag);
		var st4 = "Format: MMDDYY";
		var st7 = "Format: DDMMYY";
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		
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
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=edge' />"+
		"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";
        

		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() {var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtlot').value;if(document.getElementById('txtlot').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;}else if(lotVal.match(patt)!=null || lotVal.indexOf('[') !=-1 || lotVal.indexOf(']') != -1){document.getElementById('div_error').innerHTML ='Please enter/scan valid lot#';return false;}else{ document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Receiving Lot#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+
		//"			<tr border='1'><td align='center'  valign='top'><b>RECEIVING</b></td></tr>"+
		//"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+headerVar+"#: <label>" + getCONo + "</label></td>"+ 
		"			</tr>" +
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>PO#: <label>"+getPONo+"</label></td>"+ 
		"			</tr>" +
		"			<tr>"+
		//"				<td align = 'left' class='labelmsg'>"+orderType+"# <label>" + getPONo + "</label></td></tr><tr><td> Item: <label>" + getPOItem + "</label>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>"+getPOItem+"</label>"+
		"				<input type='hidden' name='hdnActualBeginDate' value=" + getActualBeginDate + ">"+		
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+		
		"				<input type='hidden' name='hdnActualBeginTimeAMPM' value=" + getActualBeginTimeAMPM + ">"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+
		"				<input type='hidden' name='hdnordertype' value='" + orderType + "'>"+
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnPoInternalId' value=" + getPOInternalId + ">"+
		"				<input type='hidden' name='hdnPoLineno' value=" + getPOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnPoItem' value='" + getPOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnusedBins' id='hdnusedBins' value=" + usedBins + ">"+
		"				<input type='hidden' name='hdnPoNo' id='hdnPoNo' value=" + getPONo + ">"+
		"				<input type='hidden' name='hdnexpectedQty' id='hdnexpectedQty' value=" + expectedQty + ">"+
		"				<input type='hidden' name='hdnorderedQty' id='hdnorderedQty' value=" + orderedQty + ">"+
		"				<input type='hidden' name='hdnlotno' id='hdnlotno' value=" + lotText + ">"+
		"				</td>"+
		"			</tr>"+		 
		/*"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Preferred BIN: <label>" + getPreferBin + "</label>"+
		"			</tr>"+*/
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Ordered Qty: <label> "+orderedQty+"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Expected Qty: <label>" + expectedQty + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Received Qty: <label>" + getItemRecQty + "</label>"+
		"			</tr>"+
		/*"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan BIN"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		"				</td>"+
		"			</tr>"+*/
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtlot'  class='smalltextbox'  id='txtlot' type='text' value='"+lotText+"'/>"+
		"				</td>"+
		"			</tr>";
		/*if(dtsettingFlag == 'DD/MM/YYYY')
		{

			html = html + "			<tr>";
			html = html + "				<td align = 'left'  class='labelmsg'><label>" + st7;
			html = html + "				</td>";
			html = html + "			</tr>";
		}
		else
		{
			html = html + "			<tr>";
			html = html + "				<td align = 'left'  class='labelmsg'><label>" + st4;
			html = html + "				</td>";
			html = html + "			</tr>";
		}
		html = html + "			<tr>";
		html = html + "				<td align = 'left'  class='labelmsg'>Expiry Date:</td>";
		html = html + "				</td>";
		html = html + "			</tr>";
		html = html +"<tr>"+
		"				<td align = 'left'><input name='txtexpirydate'  class='smalltextbox'  id='txtexpirydate' type='text'/>"+
		"				</td>"+
		"			</tr>" ;*/
		html = html +"<tr><td></td></tr></table>"+
		"			<table><tr>"+
		//"				<td align = 'left'><input name='cmdSend' type='submit'  class='defaultlink'  value='Next (Ent)' onclick='return validateForm();'/>"+
		//"					<input name='cmdReceiveFulls' type='submit' value='RECEIVE FULL'/>"+
		"				<td align = 'left'><input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		//"				</td>"+
		"			</tr>"+
		"		 </table>";
		html = html + "</form>"+
		
		"<script type='text/javascript'>document.getElementById('txtlot').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');
		var st1 = "format: MMDDYY";
		var st2 = "format: DDMMYY";
		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var enterLot=request.getParameter('txtlot');
		var enterExpiryDate=request.getParameter('txtexpirydate');
		POarray["custparam_po"] = request.getParameter('custparam_po');
		POarray["custparam_container"] = request.getParameter('custparam_container');
		POarray["custparam_containerNo"] = request.getParameter('custparam_containerNo');
		//var orderedQty = request.getParameter('custparam_oredrquantity');
		var orderedQty = request.getParameter('hdnorderedQty');
		var poNo = request.getParameter('custparam_potext');
		nlapiLogExecution('ERROR', 'poNo', poNo);
		POarray["custparam_oredrquantity"] = orderedQty;		
		POarray["custparam_screenno"] = '2';
		POarray["custparam_actualbegindate"] = request.getParameter('hdnActualBeginDate');	
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_customer"] = request.getParameter('hdnCustomer');
		POarray["custparam_actualbegintimeampm"] = request.getParameter('hdnActualBeginTimeAMPM');
		POarray["custparam_trantype"] = request.getParameter('hdntrantype');
		POarray["custparam_pointernalid"] = request.getParameter('hdnPoInternalId');
		POarray["custparam_poid"] = request.getParameter('hdnPoInternalId');
		POarray["custparam_lineno"] = request.getParameter('hdnPoLineno');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		//POarray["custparam_internalid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_remainingQty"] = request.getParameter('hdnItemRemQty');
		POarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_poitem"] = request.getParameter('custparam_poitem');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_usedbinsflag"] = request.getParameter('hdnusedBins');
		POarray["custparam_potext"] = request.getParameter('hdnPoNo');
		POarray["custparam_lot"] = request.getParameter('hdnlotno');
		POarray["custparam_expectquantity"] = request.getParameter('custparam_expectquantity');
		nlapiLogExecution('ERROR', 'POarray["custparam_expectquantity"]', POarray["custparam_expectquantity"]);
		var orderType=request.getParameter('hdnordertype');
		POarray["custparam_ordertype"]=orderType;
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var poInternalId=request.getParameter('hdnPoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var poLineno=request.getParameter('hdnPoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		var optedEvent = request.getParameter('cmdPrevious');
		var poNo1 = request.getParameter('hdnPoNo');// To trap the previous button
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);
		var logMsg = 'PO = ' + POarray["custparam_po"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'poInternalId = ' + poInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'poLineno = ' + poLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'poNo1 = ' + poNo1 + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - Lot', logMsg);
		var dtsettingFlag = DateSetting();
		nlapiLogExecution('Debug', 'dtsettingFlag', dtsettingFlag);
		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){
			
			if(enterLot!=null && enterLot!="" && enterLot!='null')
			{
				
				/*if(trantype=='transferorder')
				{
					var IsValidSerailNumber='F';
					var trecord = nlapiLoadRecord('transferorder', poInternalId);

					var links=trecord.getLineItemCount('links');
					if(links!=null  && links!='')
					{
						nlapiLogExecution('DEBUG', 'links', links);
						for(var j=0;j<links &&  IsValidSerailNumber=='F';j++)
						{
							var id=trecord.getLineItemValue('links','id',(parseInt(j)+1));
							var linktype = trecord.getLineItemValue('links','type',(parseInt(j)+1));
							nlapiLogExecution('DEBUG', 'id', id);
							nlapiLogExecution('DEBUG', 'linktype', linktype);
							if(linktype=='Item Fulfillment')
							{
								var frecord = nlapiLoadRecord('itemfulfillment', id);
								var fitemcount=frecord.getLineItemCount('item');
								for(var f=1;f<=fitemcount;f++)
								{
									var fitem=frecord.getLineItemValue('item','item',f);
									var fline=frecord.getLineItemValue('item','orderline',f);
									var pofline= fline-1;

									if(fitem==FetchedItemId) //&& parseInt(poLineno)==parseInt(pofline))
									{
										var  serialnumbers=frecord.getLineItemValue('item','serialnumbers',(parseInt(f)));
										
										var itemfulfilserialno='';
										
										
											frecord.selectLineItem('item', f);
											

											//nlapiLogExecution('ERROR', 'polinelength', polinelength);
											var compSubRecord = frecord.viewCurrentLineItemSubrecord('item','inventorydetail');
											
											var polinelength =0;
											
											if(compSubRecord!=null && compSubRecord!=''&& compSubRecord!='null')
												polinelength = compSubRecord.getLineItemCount('inventoryassignment');
											nlapiLogExecution('ERROR', 'polinelength', polinelength);
											for(var j1=1;j1<=polinelength ;j1++)
											{
												
												itemfulfilserialno=compSubRecord.getLineItemText('inventoryassignment','issueinventorynumber',j1);
												nlapiLogExecution('ERROR', 'itemfulfilserialno', itemfulfilserialno);
												if(itemfulfilserialno!=null && itemfulfilserialno!='')
												{
													var tserials=itemfulfilserialno.split('');
													
													if(tserials!=null && tserials!='' && tserials.length>0)
													{
														if(tserials.indexOf(enterLot)!=-1)
														{
															nlapiLogExecution('DEBUG', 'enterLot',enterLot);
															IsValidSerailNumber='T';
															break;
														}
													}
												}
											}
											nlapiLogExecution('DEBUG', 'serialnumbers insdide advancebinmgmt',serialnumbers);
											nlapiLogExecution('DEBUG', 'enterLot insdide advancebinmgmt',enterLot);
										if(serialnumbers!=null && serialnumbers!='')
										{
											var tserials=serialnumbers.split('');
											
											if(tserials!=null && tserials!='' && tserials.length>0)
											{
												if(tserials.indexOf(enterLot)!=-1)
												{
													nlapiLogExecution('DEBUG', 'enterLot111111',enterLot);
													IsValidSerailNumber='T';
													break;
												}
											}
										}
										

									}
								}
							}
						}

						if(IsValidSerailNumber=='F')
						{
							POarray["custparam_error"] = "The lot# on a transfer order receipt must have been fulfilled.";
							response.sendRedirect('SUITELET', 'customscript_wmsse_checkinlot', 'customdeploy_wmsse_checkinlot', false, POarray);
							return; 
						}
					}


				}*/
				/*if(enterExpiryDate!=null && enterExpiryDate!='' && enterExpiryDate!='null')
				{
					var getExpDateresult=ValidateNumeric(enterExpiryDate);
					if((enterExpiryDate != '' && enterExpiryDate.length > 6 ) || ( getExpDateresult == false))
					{
						var st4 = "Format: MMDDYY";
						var st7 = "Format: DDMMYY";
						if(dtsettingFlag == 'DD/MM/YYYY')
							POarray["custparam_error"] = "Expiry date should be in "+st2;
						else
							POarray["custparam_error"] = "Expiry date should be in "+st1;

						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlot', 'customdeploy_wmsse_rcvcontlot', false, POarray);
						return;
					}
					var Expdate= RFDateFormat(enterExpiryDate,dtsettingFlag);
					if(Expdate[0]=='true')
					{
						nlapiLogExecution('ERROR','Expdate',Expdate[1]);
						POarray["custparam_lotexpirydate"]=Expdate[1];

					}
					else
					{
						POarray["custparam_error"] = 'Please enter a valid date';//Expdate[1];
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlot', 'customdeploy_wmsse_rcvcontlot', false, POarray);
						return;
					}
				}*/
				/*else if(trantype!='transferorder')
				{
					var enterLotId=isInventoryNumberExists(FetchedItemId,enterLot,POarray["custparam_whlocation"]);
					if(!enterLotId)
					{
						POarray["custparam_lotno"] = enterLot;
						POarray["custparam_error"] = 'Please enter expiry date for new lot#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlot', 'customdeploy_wmsse_rcvcontlot', false, POarray);
						return;
					}
				}*/
				POarray["custparam_lotno"] = enterLot;
				nlapiLogExecution('ERROR','POarray["custparam_lotexpirydate"]',POarray["custparam_lotexpirydate"]);
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
				return;
				/*try{
					nlapiLogExecution('ERROR', 'inside if', itemType);
					var binInternalId=nswms_GetBinInternalId(enterBin);
					nlapiLogExecution('ERROR', 'binInternalId', binInternalId);
					var itemReceipt= nswms_PostItemReceipt(trantype,poInternalId,FetchedItemId,poLineno,enterQty,binInternalId,itemType,POarray["custparam_whlocation"],enterLot);
					nlapiLogExecution('ERROR', 'itemReceipt posted successfully', itemReceipt);
					var poLineDetails = getPOLineDetails(POarray["custparam_poid"],trantype,null);
					nlapiLogExecution('ERROR', 'poLineDetails', poLineDetails);
					if(poLineDetails !=null && poLineDetails!="")
					{
						nlapiLogExecution('ERROR', 'poLineDetails.length', poLineDetails.length);
						if(poLineDetails.length>0)
						{
							for(var cnt=0;cnt<=poLineDetails.length;cnt++)
							{
								var vpoitemRcvQty = poLineDetails[cnt].getValue('quantityshiprecv');
								var vpoitemQty = poLineDetails[cnt].getValue('quantity');
								if(vpoitemQty < vpoitemRcvQty)
								{
									POarray["custparam_error"] = '';
									response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
									return;
								}
								else
								{
									POarray["custparam_error"] = '';
									response.sendRedirect('SUITELET', 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan', false, POarray);
								}

							}
						}
						else
						{
							POarray["custparam_error"] = '';
							response.sendRedirect('SUITELET', 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan', false, POarray);
						}
					}
					else
					{
						POarray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan', false, POarray);
					}
				}				
				catch(e)
				{
					nlapiLogExecution('ERROR', 'inside catch exception', e);
				}*/
			}
			else
			{
				POarray["custparam_error"] = 'Please enter/scan valid lot#';
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlot', 'customdeploy_wmsse_rcvcontlot', false, POarray);
				return;
			}
		} 
		else {
			POarray["custparam_error"] = '';
			POarray["custparam_lotno"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.


