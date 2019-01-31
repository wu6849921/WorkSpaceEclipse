/**
 * Script Description
 * This script is used to scan the Serial# for selected item.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function CheckInSerial(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	var vConfig=nlapiLoadConfiguration('accountingpreferences');
	var itemcostruleValue=vConfig.getFieldValue('ITEMCOSTASTRNFRORDCOST');
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';

		//Get the PO# from the previous screen, which is passed as a parameter		
		var getPONo = request.getParameter('custparam_poid');

		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var getActualBeginDate = request.getParameter('custparam_actualbegindate');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var getActualBeginTimeAMPM = request.getParameter('custparam_actualbegintimeampm');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var orderType=request.getParameter('custparam_ordertype');

		var whCompany= request.getParameter('custparam_company');
		var getPONo = request.getParameter('custparam_poid');
		var getPOItem = request.getParameter('custparam_poitem');

		var getPOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getPOInternalId = request.getParameter('custparam_pointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getItemEnteredQty = request.getParameter('custparam_enterQty');
		var getItemReceivedQty = request.getParameter('custparam_number');
		var getNumber1 = request.getParameter('custparam_getNumber1');
		var qtyanduoms = request.getParameter('custparam_uomqtyselected');
		var vInvStatus_select = request.getParameter('custparam_inventorystatus');
		var vSpecOrder = request.getParameter('custparam_specord');


		if(request.getParameter('custparam_getNumber1')!=null && request.getParameter('custparam_getNumber1')!='' && 
				request.getParameter('custparam_getNumber1')!='null' && parseFloat(getNumber1) == parseFloat(getItemReceivedQty))
		{
			nlapiLogExecution('ERROR','Check', 'Check');
			getNumber = parseFloat(getNumber1) - 1;
			getItemRemQty = 0;
		}

		if(getItemReceivedQty==null || getItemReceivedQty=='' || getItemReceivedQty=='null')
			getItemReceivedQty=0;
		var whLocationName = request.getParameter('custparam_whlocationname');
		//var getItemRemainingQty = parseInt(getItemEnteredQty)-parseInt(getItemReceivedQty);

		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		if(vConversionRate == '- None -' || vConversionRate == '' || vConversionRate == null)
			vConversionRate =1;

		vConversionRate =new Big(vConversionRate);
		var getItemRemainingQty = (Big(getItemEnteredQty).mul(vConversionRate)).minus(getItemReceivedQty);

		var vcompositebarcode = request.getParameter("custparam_compbarcodestring");

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = context.getScriptId();
			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getPONo. = ' + getPONo + '<br>';	
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';	
		logmsg = logmsg + 'getPOItem. = ' + getPOItem + '<br>';
		logmsg = logmsg + 'getItemReceivedQty. = ' + getItemReceivedQty + '<br>';	

		nlapiLogExecution('DEBUG', 'PO Serial scan get values :', logmsg);

		var headerVar='Receiving';
		if(trantype == 'purchaseorder')
		{
			headerVar='PO';
		}
		else if(trantype == 'transferorder')
		{
			headerVar='TO';
		}
		else
		{
			headerVar='RMA';
		}
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		nlapiLogExecution('Debug', 'getItemRemQty :  getItemReceivedQty', getItemRemQty + " : " + getItemReceivedQty);

		//var st0 = 'WMS Lite-Receiving Serial Scan';
		var domainName = fndomainName();

		var st0 = domainName + '-'+headerVar+' Receiving';
		var getPreferBin=request.getParameter('custparam_preferbin');
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;

		if(parseInt(getNumber)==0)
		{
			var filterssertemp1 = new Array();
			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', getPOLineNo);
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', getPOInternalId);
			var columnssertemp1 = new Array();
			columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filterssertemp1,columnssertemp1);

			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
			{	
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];

					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of discontinue of serial number scanning we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
				}

			}	
		}
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();
		//itemcolumns.push(new nlobjSearchColumn('itemid'));
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_receivingitemdetails', itemfilters, null);
		if(itemresults!=null && itemresults!='')
		{
			getPOItem = itemresults[0].getValue('itemid');
		}

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();


		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();

		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />"+
		"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";


		html = html + "</head><body>"+

		"	<script type='text/javascript'>function validateForm() {var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtserial').value; var vSerialWhiteSpace = lotVal.indexOf(' ') >= 0; if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;}else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+		
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Receiving Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+orderType+"# <label>" + getPONo + "</label></td></tr><tr><td align = 'left' class='labelmsg'> Item: <label>" + getPOItem + "</label>"+
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
		"				<input type='hidden' name='hdnenterBin' value='" + enterBin + "'>"+
		"				<input type='hidden' name='hdnPoItem' value=" + getPOItem + ">"+
		"				<input type='hidden' name='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnSerialItemRemainingQty' value=" + getItemRemainingQty + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' value="+qtyanduoms+">"+
		"				<input type='hidden' name='hdnselectinvstatus' id='hdnselectinvstatus' value="+vInvStatus_select+">"+
		"				<input type='hidden' name='hdnvspecorder' value= '" + vSpecOrder + "'>"+
		" 				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				<input type='hidden' name='hdncompositebarcode' value='" + vcompositebarcode + "'>"+
		"				</td>"+
		"			</tr>"+			 
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Received Qty: <label>" + (parseFloat(getItemReceivedQty)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + (parseFloat(getItemRemainingQty)) + "</label>"+
		"			</tr>";
		if(vInvStatus_select != null && vInvStatus_select != '' && vInvStatus_select != 'null' && vInvStatus_select != 'undefined')
		{
			var vInventoryStatus ='';
			var hdnInvtStatusText = request.getParameter('hdnInvtStatusText');
			if(hdnInvtStatusText != '' && hdnInvtStatusText != null && hdnInvtStatusText != 'null' && hdnInvtStatusText != 'undefined')
			{
				vInventoryStatus = hdnInvtStatusText;
			}
			else
			{

				var inventoryStatusLst = getDefaultInventoryStatusList(vInvStatus_select);

				if(inventoryStatusLst.length > 0)
				{
					vInventoryStatus = inventoryStatusLst[0][0];
				}
			}

			html =html+ "			<tr>"+
			"				<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
			"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + vInventoryStatus + "'>"+	
			"			</tr>";
		}
		html =html+ "			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF <label>" + (Big(request.getParameter('custparam_enterQty')).mul(vConversionRate)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";

		html = html +"		<td align = 'left'><input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>";

		html = html +"		</td>"+					
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'  type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";
		html = html + "</table></form>"+

		"<script type='text/javascript'>document.getElementById('txtserial').focus();</script>";
		nlapiLogExecution('ERROR', 'componentvalarr', componentvalarr);
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			var JSfile = getLoadFile('wmsse_uomfunctions.js');
			var JSSurl ='';
			if (JSfile) 
			{ 
				JSSurl = JSfile.getURL();
			}

			if(JSSurl != null && JSSurl != '')
			{
				html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
			}

			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtserial');

		POarray["custparam_poid"] = request.getParameter('custparam_poid');
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
		POarray["custparam_lineno"] = request.getParameter('hdnPoLineno');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		POarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_poitem"] = request.getParameter('custparam_poitem');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		POarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		POarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		POarray["custparam_enterBin"] = request.getParameter('hdnenterBin');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_uom"] = request.getParameter('hdnuom');
		POarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		POarray["custparam_inventorystatus"] = request.getParameter('hdnselectinvstatus');
		POarray["custparam_specord"] = request.getParameter('hdnvspecorder');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');
		POarray["custparam_compbarcodestring"] = request.getParameter('hdncompositebarcode');

		var vConversionRate = request.getParameter('hdnvConversionRate');
		var orderType=request.getParameter('hdnordertype');
		POarray["custparam_ordertype"]=orderType;
		var trantype=request.getParameter('hdntrantype');
		//	var remQty=request.getParameter('hdnSerialItemRemainingQty');
		var poInternalId=request.getParameter('hdnPoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var poLineno=request.getParameter('hdnPoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		//var remQty=request.getParameter('enterQty');
		var remQty=request.getParameter('hdnenterQty');
		var whLocation = request.getParameter('hdnWhLocation');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var getNumber=parseFloat(request.getParameter('hdnNumber'));
		var vInvStatus_select=request.getParameter('hdnselectinvstatus');
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);
		var useitemcostflag = '';


		var logMsg = 'PO = ' + POarray["custparam_poid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'poInternalId = ' + poInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'poLineno = ' + poLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
		logMsg = logMsg + 'vConversionRate = ' + vConversionRate + '<br>';
		logMsg = logMsg + 'vInvStatus_select = ' + vInvStatus_select + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - Serial', logMsg);
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){

					if(getSerialNo!=null && getSerialNo!="" && getSerialNo!='null')
					{

						// Case # 201415970  start
						var serValidationArr = new Array();
						var serLen  = getSerialNo.length;

						for(var k= 0;k<serLen;k++)
						{
							serValidationArr.push(getSerialNo[k]);
						}

						//if(serValidationArr.indexOf('/')!=-1 || serValidationArr.indexOf('[')!=-1 || serValidationArr.indexOf('+')!=-1 || serValidationArr.indexOf('|')!=-1 || serValidationArr.indexOf('\\')!=-1 || serValidationArr.indexOf(':')!=-1 || serValidationArr.indexOf(';')!=-1 || serValidationArr.indexOf('<')!=-1 || serValidationArr.indexOf('>')!=-1 || serValidationArr.indexOf('{')!=-1 || serValidationArr.indexOf('}')!=-1 || serValidationArr.indexOf('(')!=-1 || serValidationArr.indexOf(')')!=-1 || serValidationArr.indexOf(',')!=-1 || serValidationArr.indexOf('.')!=-1 || serValidationArr.indexOf('/')!=-1 || serValidationArr.indexOf("'")!=-1)
						/*if(serValidationArr.indexOf('[')!=-1 || serValidationArr.indexOf('+')!=-1 || serValidationArr.indexOf('\\')!=-1 || serValidationArr.indexOf(';')!=-1 || serValidationArr.indexOf('<')!=-1 || serValidationArr.indexOf('>')!=-1 || serValidationArr.indexOf('{')!=-1 || serValidationArr.indexOf('}')!=-1 || serValidationArr.indexOf('(')!=-1 || serValidationArr.indexOf(')')!=-1 || serValidationArr.indexOf("'")!=-1)						
						{
							POarray["custparam_error"] = 'Please enter/scan valid serial#';
							response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
							
							return;
						}*/
						// Case # 201415970  end


						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
						itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						/*itemfilters.push(new nlobjSearchFilter('location','binnumber','anyof',['@NONE@',whLocation]));*/
						if(whLocation != null && whLocation !='' && whLocation != null)
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
						}
						//itemfilters.push(new nlobjSearchFilter('preferredbin', null, 'is', 'T'));
						var itemcolumns= new Array();

						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_receivingitemdetails', itemfilters, null);							
						nlapiLogExecution('Debug', 'itemresults', itemresults); 
						if(itemresults == null || itemresults == '' || itemresults == 'null')
						{
							POarray["custparam_error"] = 'Entered item is inactive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
							return;
						}
						var vnpoLineDetails = getPOLineDetailsNew(POarray["custparam_poid"],trantype,FetchedItemId,POarray["custparam_whlocation"]);
						nlapiLogExecution('Debug', 'vnpoLineDetails', vnpoLineDetails);
						if(vnpoLineDetails == null || vnpoLineDetails == '' || vnpoLineDetails.length == null)
						{
							POarray["custparam_error"] = 'Entered item is deleted from the order or the transaction is completed';
							response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
							return;
						}

						//this is stop the duplicate entry of open task record when deffered item receipt rule is set to 'Y'
						var tempflag ='F';
						var poitemLineDetails =  getPOLineDetailsNew(POarray["custparam_poid"], trantype,FetchedItemId,POarray["custparam_whlocation"]); 

						var vColumnslist ='';
						var openputawayQtyIndex = 7;
						var unitsIndex =14;
						var conversionQtyIndex =15;
						var coversionRcvdQtyIndex=16;
						var coversionRateIndex =17;
						var toshippedQTYIndex =18;
						if(poitemLineDetails!=null && poitemLineDetails!='' && poitemLineDetails.length > 0)
						{
							vColumnslist=poitemLineDetails[0].getAllColumns();

							for(var x1=0;x1<vColumnslist.length;x1++)
							{
								var summaryLabel = vColumnslist[x1].getLabel();
								var name = vColumnslist[x1].getName();
								if(summaryLabel == 'Open Putaway Quantity')
								{
									openputawayQtyIndex = x1;
								}
								else if(name == 'unit')
								{
									unitsIndex =x1;
								}
								else if(summaryLabel == 'Conversion Order Quantity')
								{
									conversionQtyIndex = x1;
								}
								else if(summaryLabel == 'Conversion Received Quantity')
								{
									coversionRcvdQtyIndex = x1;
								}
								else if(summaryLabel == 'Conversion Rate')
								{
									coversionRateIndex = x1;
								}
								else if(summaryLabel == 'TO Fulfilled Quantity')
								{
									toshippedQTYIndex = x1;

								}
								else
								{

								}
							}
							for(var j=0; j<poitemLineDetails.length; j++)
							{

								var usedBins='';
								var polineno=poitemLineDetails[j].getValue('line',null,'group');
								var pocheckinqty=poitemLineDetails[j].getValue('quantity',null,'max');

								var vpoitemQty = poitemLineDetails[j].getValue(vColumnslist[conversionQtyIndex]);
								var vpoitemNSRcvQty = poitemLineDetails[j].getValue(vColumnslist[coversionRcvdQtyIndex]);
								var vpoitemRcvQty=poitemLineDetails[j].getValue(vColumnslist[openputawayQtyIndex]);
								if(vpoitemQty == null || vpoitemQty == '')
									vpoitemQty=0;
								if(vpoitemRcvQty==null || vpoitemRcvQty=='')
									vpoitemRcvQty=0;
								if(vpoitemNSRcvQty==null || vpoitemNSRcvQty=='')
									vpoitemNSRcvQty=0;

								if(trantype=="returnauthorization")
								{
									if(parseInt(vpoitemQty)<0)
										vpoitemQty=Number(Big(vpoitemQty).mul(-1));
									nlapiLogExecution('DEBUG', 'vpoitemQty', vpoitemQty);

								}
								if(trantype=="transferorder")
								{

									vpoitemQty=poitemLineDetails[j].getValue(vColumnslist[toshippedQTYIndex]);
									nlapiLogExecution('Debug', 'vpoitemQty', vpoitemQty); 


									if(parseInt(vpoitemQty) == 0)
									{
										//check for whether directly fulfilled in the netsuite.
										var filters = new Array();
										var columns = new Array();
										//columns.push(new nlobjSearchColumn('quantityshiprecv'));
										//columns.push(new nlobjSearchColumn('line'));
										filters.push(new nlobjSearchFilter('tranid', null, 'is',POarray["custparam_poid"] ));
										filters.push(new nlobjSearchFilter('formulatext', null, 'is', 'Shipping').setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
										filters.push(new nlobjSearchFilter('type', null, 'anyof', 'TrnfrOrd'));
										var TOLineDetails = new nlapiSearchRecord('transferorder','customsearch_wmsse_transactionid_details',filters,null);

										if(TOLineDetails != null && TOLineDetails != '' && TOLineDetails != 'null' && TOLineDetails.length >0)
										{
											nlapiLogExecution('Debug', 'TOLineDetails', TOLineDetails.length); 
											for(var t=0;t<TOLineDetails.length;t++)
											{
												var tline=TOLineDetails[t].getValue('line');

												if(parseInt(tline)+1 == polineno)
												{
													vpoitemQty = TOLineDetails[t].getValue('quantityshiprecv'); 

													break;

												}
											}
										}

									}
								}

								var totalReceivedQty = Number(Big(vpoitemRcvQty).plus(vpoitemNSRcvQty));


								var vPoreminqty = Number(Big(vpoitemQty).minus(totalReceivedQty));


								if(parseFloat(vPoreminqty)<0)
									vPoreminqty=0;

								if(parseFloat(vPoreminqty)>0)
								{
									tempflag='T';
								}

							} 
						}
						if(tempflag=='F')
						{
							POarray["custparam_error"] = 'Transaction completed for this item';
							response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
							nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
							return;
						}

						if(trantype=='transferorder')
						{
							var IsValidSerailNumber='F';

							var trecord = nlapiLoadRecord('transferorder', poInternalId);
							var useitemcostfilts = new Array();
							useitemcostfilts.push(new nlobjSearchFilter('internalid', null, 'is',poInternalId));																								

							var transferordervalues = new nlapiSearchRecord('transaction','customsearch_wmsse_useitemcostpreference',useitemcostfilts,null);

							if(transferordervalues!=null && transferordervalues!='' && transferordervalues!='null' && transferordervalues.length>0)
							{
								useitemcostflag=transferordervalues[0].getValue('istransferpricecosting');
							}

							nlapiLogExecution('Debug', 'useitemcostflag', useitemcostflag);

							if(useitemcostflag == null || useitemcostflag == '' || useitemcostflag == 'null')
							{
								useitemcostflag = itemcostruleValue;
							}

							var links=trecord.getLineItemCount('links');
							if(links!=null  && links!='')
							{
								nlapiLogExecution('DEBUG', 'links', links);
								for(var j=0;j<links &&  IsValidSerailNumber=='F';j++)
								{
									var id=trecord.getLineItemValue('links','id',(parseInt(j)+1));
									var linktype = trecord.getLineItemValue('links','type',(parseInt(j)+1));

									if(linktype=='Item Fulfillment' || linktype=='EjecuciÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½n de pedido de artÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½culo')
									{
										var frecord = nlapiLoadRecord('itemfulfillment', id);
										var fitemcount=frecord.getLineItemCount('item');
										for(var f=1;f<=fitemcount;f++)
										{
											var fitem=frecord.getLineItemValue('item','item',f);
											var fline=frecord.getLineItemValue('item','orderline',f);
											var pofline= fline-1;

											if(fitem==FetchedItemId && parseInt(poLineno)==(parseInt(pofline)+2)) //&& parseInt(poLineno)==parseInt(pofline))
											{
												var  serialnumbers=frecord.getLineItemValue('item','serialnumbers',(parseInt(f)));

												var itemfulfilserialno;
												frecord.selectLineItem('item', f);



												var compSubRecord = frecord.viewCurrentLineItemSubrecord('item','inventorydetail');

												var polinelength =0;

												if(compSubRecord!=null && compSubRecord!=''&& compSubRecord!='null')
													polinelength = compSubRecord.getLineItemCount('inventoryassignment');

												for(var j1=1;j1<=polinelength ;j1++)
												{

													itemfulfilserialno=compSubRecord.getLineItemText('inventoryassignment','issueinventorynumber',j1);
													var itemfulfilStatus = compSubRecord.getLineItemValue('inventoryassignment','inventorystatus',j1);

													if(vInvStatus_select == itemfulfilStatus)
													{
														if(itemfulfilserialno!=null && itemfulfilserialno!='')
														{
															var tserials=itemfulfilserialno.split('');
															//nlapiLogExecution('DEBUG', 'serialnumbers',tserials[0]);
															if(tserials!=null && tserials!='' && tserials.length>0)
															{
																if(tserials.indexOf(getSerialNo)!=-1)
																{
																	nlapiLogExecution('DEBUG', 'getSerialNo',getSerialNo);
																	IsValidSerailNumber='T';
																	break;
																}
															}
														}
													}
												}
												nlapiLogExecution('DEBUG', 'serialnumbers insdide advancebinmgmt',serialnumbers);

												if(serialnumbers!=null && serialnumbers!='')
												{
													var tserials=serialnumbers.split('');
													//nlapiLogExecution('DEBUG', 'serialnumbers',tserials[0]);
													if(tserials!=null && tserials!='' && tserials.length>0)
													{
														if(tserials.indexOf(getSerialNo)!=-1)
														{
															nlapiLogExecution('DEBUG', 'getSerialNo111111',getSerialNo);
															IsValidSerailNumber='T';
															break;
														}
													}
												}
												//Case # 20124514ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¿Ãƒâ€šÃ‚Â½ END

											}
										}
									}
								}

								if(IsValidSerailNumber=='F')
								{
									POarray["custparam_error"] = "The serial# on a transfer order receipt must have been fulfilled.";
									response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
									return; 
								}
							}


						}
						else 
						{

							var isSerialExistsInInventory = isInventoryNumberExists(FetchedItemId,getSerialNo,POarray["custparam_whlocation"]);
							nlapiLogExecution('Debug', 'isSerialExistsInInventory',isSerialExistsInInventory);
							if(isSerialExistsInInventory)
							{
								//POarray["custparam_number"] =0;
								POarray["custparam_error"] = 'This serial# already exists in inventory';
								response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
								return; 
							}//Case # 201412867 start
						}
						/*else
							{*/


						var systemRule=getSystemRuleValue('Manually post item receipts?',POarray["custparam_whlocation"]);


						if(systemRule!=null && systemRule!='' && systemRule=='Y')
						{
							var openTaskSerialArray = new Array();
							var filtersseropenTask = new Array();
							/*filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', poLineno));
									filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', poInternalId));*/ 
							filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', FetchedItemId));
							filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['2']));
							filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['3']));
							filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));

							var columnsOpenTask = new Array();
							//columnsOpenTask.push(new nlobjSearchColumn('custrecord_wmsse_serial_no'));
							var SrchRecordOpenTaskSerial = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskreceivingdata', filtersseropenTask,null);
							nlapiLogExecution('Debug', 'SrchRecordOpenTaskSerial', SrchRecordOpenTaskSerial);
							if(SrchRecordOpenTaskSerial != null && SrchRecordOpenTaskSerial != '' && SrchRecordOpenTaskSerial.length > 0)
							{
								for(var p1=0;p1<SrchRecordOpenTaskSerial.length;p1++)
								{
									var opentaskSerial = SrchRecordOpenTaskSerial[p1].getValue('custrecord_wmsse_serial_no');
									if(opentaskSerial != null && opentaskSerial != '' && opentaskSerial != 'null' && opentaskSerial != 'undefined')
									{
										var opentaskSerArray = opentaskSerial.split(',');

										if(opentaskSerArray != null && opentaskSerArray !='' && opentaskSerArray !='null' && opentaskSerArray != 'undefined')
										{
											for(var p3=0;p3<opentaskSerArray.length;p3++)
											{
												var serialNo = opentaskSerArray[p3];

												if(serialNo != null && serialNo !='' && serialNo !='null' && serialNo != 'undefined')
												{
													openTaskSerialArray.push(serialNo);
												}
											}
										}


									}
								}
							}

							if(openTaskSerialArray.indexOf(getSerialNo) != -1)
							{
								POarray["custparam_error"] = 'This serial# already exists in inventory ';
								response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
								return; 
							}
						}
						//}///Case # 201412867 end

						//}



						//checking serial no's in already scanned one's from temp table
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', poLineno));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', poInternalId));
						//filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', ['2']));
						var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filterssertemp);

						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{

							POarray["custparam_error"] = "Serial# already scanned";
							response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
							return;
						}								
						else {

							POarray["custparam_serialno"] = getSerialNo;

							POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
						}
						//Here we are creating serial# into new Temp Serial entry custom record
						var binInternalId=nswms_GetBinInternalId(enterBin,POarray["custparam_whlocation"]);
						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', getSerialNo);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordno', poInternalId);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordline', poLineno);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', FetchedItemId);
						customrecord.setFieldValue('custrecord_wmsse_ser_bin', binInternalId);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
						customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 2);
						var rec = nlapiSubmitRecord(customrecord, false, true);


						if ((Number(getNumber) + 1) < Number(Big(remQty).mul(vConversionRate))) {

							POarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
							return;

						}
						else
						{
							try{
								POarray["custparam_getNumber1"] = (parseInt(getNumber) + 1);

								var binInternalId=nswms_GetBinInternalId(enterBin,POarray["custparam_whlocation"]);

								var itemReceipt= nswms_PostItemReceipt(trantype,poInternalId,FetchedItemId,poLineno,enterQty,binInternalId,itemType,
										POarray["custparam_whlocation"],'','','',POarray["custparam_poid"],'','',POarray["custparam_actualbegintime"],
										POarray["custparam_customer"],POarray["custparam_uom"],POarray["custparam_conversionrate"],'','',useitemcostflag,
										vInvStatus_select,POarray["custparam_compbarcodestring"]);
								nlapiLogExecution('Debug', 'itemReceipt posted successfully', itemReceipt);
								//var poLineDetails = getPOLineDetails(POarray["custparam_poid"],trantype,null);
								var poLineDetails = getPOLineDetailsNew(POarray["custparam_poid"],trantype,null,POarray["custparam_whlocation"]);


								if(poLineDetails !=null && poLineDetails!="")
								{
									nlapiLogExecution('Debug', 'poLineDetails.length', poLineDetails.length);
									if(poLineDetails.length>0)
									{
										var vCount=0;
										var openputawayQtyIndex = 7;
										var unitsIndex =14;
										var conversionQtyIndex =15;
										var coversionRcvdQtyIndex=16;
										var coversionRateIndex =17;
										var vColumnslist=poLineDetails[0].getAllColumns();
										var toshippedQTYIndex =18;
										for(var x1=0;x1<vColumnslist.length;x1++)
										{
											var summaryLabel = vColumnslist[x1].getLabel();
											var name = vColumnslist[x1].getName();
											if(summaryLabel == 'Open Putaway Quantity')
											{
												openputawayQtyIndex = x1;
											}
											else if(name == 'unit')
											{
												unitsIndex =x1;
											}
											else if(summaryLabel == 'Conversion Order Quantity')
											{
												conversionQtyIndex = x1;
											}
											else if(summaryLabel == 'Conversion Received Quantity')
											{
												coversionRcvdQtyIndex = x1;
											}
											else if(summaryLabel == 'Conversion Rate')
											{
												coversionRateIndex = x1;
											}
											else if(summaryLabel == 'TO Fulfilled Quantity')
											{
												toshippedQTYIndex = x1;
												nlapiLogExecution('Debug', 'toshippedQTYIndex', toshippedQTYIndex);
											}
											else
											{

											}
										}
										for(var cnt=0;cnt<poLineDetails.length;cnt++)
										{
											//var vColumnslist=poLineDetails[cnt].getAllColumns();
											var vpoitemRcvQty=poLineDetails[cnt].getValue(vColumnslist[openputawayQtyIndex]);
											//var vpoitemNSRcvQty = poLineDetails[cnt].getValue('quantityshiprecv',null,'max');
											//var vpoitemQty = poLineDetails[cnt].getValue('quantity',null,'max');
											var vpoitemQty = poLineDetails[cnt].getValue(vColumnslist[conversionQtyIndex]);
											var vpoitemNSRcvQty = poLineDetails[cnt].getValue(vColumnslist[coversionRcvdQtyIndex]);
											if(vpoitemQty == null || vpoitemQty == '')
												vpoitemQty=0;
											if(vpoitemRcvQty==null || vpoitemRcvQty=='')
												vpoitemRcvQty=0;
											if(vpoitemNSRcvQty==null || vpoitemNSRcvQty=='')
												vpoitemNSRcvQty=0;

											if(trantype=="returnauthorization")
											{
												if(parseInt(vpoitemQty)<0)
													vpoitemQty=Number(Big(vpoitemQty).mul(-1));
												nlapiLogExecution('DEBUG', 'vpoitemQty', vpoitemQty);

											}
											if(trantype=="transferorder")
											{

												vpoitemQty=poLineDetails[cnt].getValue(vColumnslist[toshippedQTYIndex]);
												nlapiLogExecution('Debug', 'vpoitemQty', vpoitemQty); 

												if(parseInt(vpoitemQty) == 0)
												{
													//check for whether directly fulfilled in the netsuite.
													var filters = new Array();
													var columns = new Array();
													//columns.push(new nlobjSearchColumn('quantityshiprecv'));
													//columns.push(new nlobjSearchColumn('line'));
													filters.push(new nlobjSearchFilter('tranid', null, 'is',POarray["custparam_poid"] ));
													filters.push(new nlobjSearchFilter('formulatext', null, 'is', 'Shipping').setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
													filters.push(new nlobjSearchFilter('type', null, 'anyof', 'TrnfrOrd'));
													var TOLineDetails = new nlapiSearchRecord('transferorder','customsearch_wmsse_transactionid_details',filters,null);

													if(TOLineDetails != null && TOLineDetails != '' && TOLineDetails != 'null' && TOLineDetails.length >0)
													{
														nlapiLogExecution('ERROR', 'TOLineDetails', TOLineDetails.length); 
														for(var t=0;t<TOLineDetails.length;t++)
														{
															var tline=TOLineDetails[t].getValue('line');

															if(parseInt(tline)+1 == polineno)
															{
																vpoitemQty = TOLineDetails[t].getValue('quantityshiprecv'); 
																nlapiLogExecution('Debug', 'NSfulfilledQty', vpoitemQty); 
																break;

															}
														}
													}

												}
											}

											var totalReceivedQty = Number(Big(vpoitemRcvQty).plus(vpoitemNSRcvQty));


											var vPoreminqty = Big(vpoitemQty).minus(totalReceivedQty);
											nlapiLogExecution('DEBUG', 'vPoreminqty', vPoreminqty);

											if(parseFloat(vPoreminqty) > 0)
											{
												vCount=parseFloat(vCount)+1;
												/*POarray["custparam_error"] = "";
										response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
										return;*/
											}
											else
											{
												/*POarray["custparam_error"] = "";
										response.sendRedirect('SUITELET', 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan', false, POarray);*/
											}

										}
										if(parseFloat(vCount) > 0)
										{	
											POarray["custparam_error"]='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
											return;
										}
										else
										{
											POarray["custparam_error"]='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
											return;
										}
									}
									else
									{
										POarray["custparam_error"] = "";
										response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
									}
								}
								else
								{
									POarray["custparam_error"] = "";
									response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
								}
							}				
							catch(e)
							{
								nlapiLogExecution('ERROR', 'inside catch exception', e);

								if ( e instanceof nlobjError )
								{
									POarray["custparam_error"]=e.getDetails();
									nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
								}
								else
								{
									POarray["custparam_error"]=e.toString();
									nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
								}
								response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
								return;
							}
						}
					}
					else
					{
						POarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
					}
				} 
				else {
					POarray["custparam_error"] = "";
					response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
				}
			}
			catch(e)
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

				if ( e instanceof nlobjError )
				{
					POarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					POarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}

				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
				return;
			}
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			POarray["custparam_error"]="Transaction is in progress...";
			response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
			return;
		}

	} //end of first if condition
} //end of function.


