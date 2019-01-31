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

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';

		//Get the PO# from the previous screen, which is passed as a parameter		
		var getPONo = request.getParameter('custparam_poid');		

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
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var lotno = request.getParameter('custparam_lotno');
		var usedBins = request.getParameter('custparam_usedbinsflag');
		var vSpecOrder = request.getParameter('custparam_specord');		
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var vcompositebarcode = request.getParameter("custparam_compbarcodestring");

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		// To get the composite bar code component mapping for the current page/script
		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		var headerVar='Receiving';
		if(trantype == 'purchaseorder')
		{
			headerVar='PO';
			orderType = 'Purchase Order';
		}
		else if(trantype == 'transferorder')
		{
			headerVar='TO';
			orderType = 'Transfer Order';
		}
		else
		{
			headerVar='RMA';
			orderType = 'RMA';
		}
		var lotText='';
		if(lotno!=null && lotno!='' && lotno!='undefined')
		{
			lotText=lotno;
		}
		else
		{
			lotText='';
		}


		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getPONo. = ' + getPONo + '<br>';	
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';	
		logmsg = logmsg + 'getPOItem. = ' + getPOItem + '<br>';
		logmsg = logmsg + 'lotText. = ' + lotText + '<br>';	

		nlapiLogExecution('DEBUG', 'PO Lot scan get values :', logmsg);
		//Locking Records
		var POarray = new Array();

		POarray["custparam_poid"] = getPONo;
		POarray["custparam_whlocation"] = whLocation;
		POarray["custparam_company"] = whCompany;
		POarray["custparam_option"] = getOptedField;
		POarray["custparam_actualbegintime"] = getActualBeginTime;
		POarray["custparam_customer"] = customer;
		POarray["custparam_trantype"] = trantype;
		POarray["custparam_ordertype"] = orderType;
		POarray["custparam_pointernalid"] = getPOInternalId;
		POarray["custparam_specord"] = vSpecOrder;
		POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		var currentUser=getCurrentUser();

		var lockfilters=new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getPOInternalId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',getPOLineNo));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));

		var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

		if(lockresults!=null && lockresults!='')
		{
			var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
			var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');

			if(getLockUser!=currentUser)
			{
				POarray["custparam_error"]='The line item is being processed by other user.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
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
				var date = new Date();
				var mSecs = date.getTime();
				LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);
				var recid = nlapiSubmitRecord(LockRecord);

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
			var date = new Date();
			var mSecs = date.getTime();
			LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);
			var recid = nlapiSubmitRecord(LockRecord);

		}
		//end

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		nlapiLogExecution('Debug', 'getItemRemQty :  getItemRecQty', getItemRemQty + " : " + getItemRecQty);


		var domainName = fndomainName();

		var st0 = domainName + '-'+headerVar+' Receiving';
		var getPreferBin=request.getParameter('custparam_preferbin');

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'is',getItemInternalId));
		var itemcolumns= new Array();

		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_receivingitemdetails', itemfilters, null);
		nlapiLogExecution('Debug', 'itemresults', itemresults);
		var shelflife ='';
		if(itemresults!=null && itemresults!='')
		{
			var itemLoc = itemresults[0].getValue('location');
			shelflife = itemresults[0].getValue('custitem_wmsse_shelflife');


			POarray["custparam_shelflife"] = shelflife;

			getPOItem = itemresults[0].getValue('itemid');

			if(itemresults[0].getValue('isinactive')=="T")
			{
				POarray["custparam_error"] = 'Entered item is inactive.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
				nlapiLogExecution('Debug', 'itemRecord', 'Invalid Item Specified');
				return;
			}
			else if((itemLoc != POarray["custparam_whlocation"]) && (itemLoc  != null && itemLoc != '' && itemLoc != 'null' && itemLoc != 'undefined'))
			{
				POarray["custparam_error"] = 'This item is mapped to different site.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
				nlapiLogExecution('Debug', 'itemRecord', 'Invalid Item Specified');
				return;
			}
		}
		else
		{
			POarray["custparam_error"] = 'Please enter/scan valid item';
			response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
			nlapiLogExecution('Debug', 'itemRecord', 'Invalid Item Specified');
			return;
		}

		var dtsettingFlag = DateSetting();

		var st4 = "Format: " + dtsettingFlag;		 
		var st7 = "Format: DDMMYY";
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
		"<meta http-equiv='X-UA-Compatible' content='IE=edge' />"+
		"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";


		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() { if(document.getElementById('hdnusedBins').value == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item';return false;} var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtlot').value; var vLotWhiteSpace = lotVal.indexOf(' ') >= 0; var dateString=document.getElementById('txtexpirydate').value; var tempDate = '20'+dateString.substring(4);if(document.getElementById('txtlot').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;}else if(tempDate != null && tempDate !='' && tempDate != 'null' && dateString.length == 6 && (new Date(tempDate,parseInt(dateString.substring(0,2))-parseInt(1),dateString.substring(2,4)) < new Date())){document.getElementById('div_error').innerHTML ='Expiry date should be greater than current date';return false;} else{document.getElementById('bodydiv').style.display = 'none'; document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Receiving Lot#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+

		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<div id='bodydiv'><table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+orderType+"#:<label>" + getPONo + "</label></td></tr><tr><td align = 'left' class='labelmsg'> Item: <label>" + getPOItem + "</label>"+
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
		"				<input type='hidden' name='hdshelflife' id='hdnshelflife' value=" + shelflife + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnvspecorder' value= '" + vSpecOrder + "'>"+	
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				<input type='hidden' name='hdncompositebarcode' value='" + vcompositebarcode + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Received Qty: <label>" + parseFloat(parseFloat(getItemRecQty).toFixed(5)) + " " +vUnits+"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(5)) + " " +vUnits+"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";		
		html = html +"				<td align = 'left'><input name='txtlot'  class='smalltextbox'  id='txtlot' type='text' value='"+lotText+"'/>";

		html = html +"				</td>"+
		"			</tr>";
		if(trantype != 'transferorder')
		{

			html = html + "			<tr>";
			html = html + "				<td align = 'left'  class='labelmsg'><label>" + st4;
			html = html + "				</td>";
			html = html + "			</tr>";

			html = html + "			<tr>";
			html = html + "				<td align = 'left'  class='labelmsg'>Expiry Date:</td>";
			html = html + "				</td>";
			html = html + "			</tr>";
			html = html +"<tr>";
			html = html +"				<td align = 'left'><input name='txtexpirydate'  class='smalltextbox'  id='txtexpirydate' type='text'/>";
			html = html +"				</td>"+
			"			</tr>";
		}
		html = html +"<tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit'  class='defaultlink'  value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"				</td>"+
		"			</tr>"+
		"		 </table></div>";
		html = html + "</form>"+

		"<script type='text/javascript'>document.getElementById('txtlot').focus();</script>";
		//Setting default values to the page fields based on composite bar code component mapping.
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
		var st1 = "format: MMDDYY";
		var st2 = "format: DDMMYY";
		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var enterLot=request.getParameter('txtlot');
		var enterExpiryDate=request.getParameter('txtexpirydate');
		var shelflife=request.getParameter('hdshelflife');
		POarray["custparam_poid"] = request.getParameter('custparam_poid');
		POarray["custparam_screenno"] = '2';
		POarray["custparam_actualbegindate"] = request.getParameter('hdnActualBeginDate');	
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		var whLocation = request.getParameter('hdnWhLocation');
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
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_usedbinsflag"] = request.getParameter('hdnusedBins');
		POarray["custparam_hibcflag"] = request.getParameter('hdnHIBCBarcodeFlag');
		POarray["custparam_uom"] = request.getParameter('hdnuom');
		POarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		POarray["custparam_specord"] = request.getParameter('hdnvspecorder');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');
		POarray["custparam_compbarcodestring"] = request.getParameter('hdncompositebarcode');

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
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);
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
		logMsg = logMsg + 'shelflife = ' + shelflife + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - Lot', logMsg);
		var dtsettingFlag = DateSetting();

		var systemRule=getSystemRuleValue('Manually post item receipts?',whLocation);

		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){

			if(enterLot!=null && enterLot!="" && enterLot!='null')
			{
				// Case # 201415970  start
				var lotValidationArr = new Array();
				var lotLen  = enterLot.length;

				for(var k= 0;k<lotLen;k++)
				{
					lotValidationArr.push(enterLot[k]);
				}

				nlapiLogExecution('DEBUG', 'lotValidationArr.length', lotValidationArr.length);
				//Commented so as to allow the whitespace and special characters in WMS
				//if(lotValidationArr.indexOf('/')!=-1 || lotValidationArr.indexOf('[')!=-1 || lotValidationArr.indexOf('+')!=-1 || lotValidationArr.indexOf('|')!=-1 || lotValidationArr.indexOf('\\')!=-1 || lotValidationArr.indexOf(':')!=-1 || lotValidationArr.indexOf(';')!=-1 || lotValidationArr.indexOf('<')!=-1 || lotValidationArr.indexOf('>')!=-1 || lotValidationArr.indexOf('{')!=-1 || lotValidationArr.indexOf('}')!=-1 || lotValidationArr.indexOf('(')!=-1 || lotValidationArr.indexOf(')')!=-1 || lotValidationArr.indexOf(',')!=-1 || lotValidationArr.indexOf('.')!=-1 || lotValidationArr.indexOf('/')!=-1 || lotValidationArr.indexOf("'")!=-1)
				/*if(lotValidationArr.indexOf('[')!=-1 || lotValidationArr.indexOf('+')!=-1 || lotValidationArr.indexOf('\\')!=-1 || lotValidationArr.indexOf(';')!=-1 || lotValidationArr.indexOf('<')!=-1 || lotValidationArr.indexOf('>')!=-1 || lotValidationArr.indexOf('{')!=-1 || lotValidationArr.indexOf('}')!=-1 || lotValidationArr.indexOf('(')!=-1 || lotValidationArr.indexOf(')')!=-1 || lotValidationArr.indexOf("'")!=-1)
				{
					POarray["custparam_error"] = 'Please enter/scan valid lot#';
					response.sendRedirect('SUITELET', 'customscript_wmsse_checkinlot', 'customdeploy_wmsse_checkinlot', false, POarray);

					return;
				}*/
				// Case # 201415970  end
				if(trantype=='transferorder')
				{
					var invStatusStr = '';
					var invtStatusTxt = '';
					var IsValidSerailNumber='F';
					var trecord = nlapiLoadRecord('transferorder', poInternalId);
					var receivedFulfillmentIdArr = new Array();
					var receiptcreated = 'F';
					var links=trecord.getLineItemCount('links');
					var lotReceivedFulfillmentIdArr = new Array();
					if(links!=null  && links!='')
					{

						for(var j=0;j<links &&  IsValidSerailNumber=='F';j++)
						{
							var id=trecord.getLineItemValue('links','id',(parseInt(j)+1));
							var linktype = trecord.getLineItemValue('links','type',(parseInt(j)+1));
							nlapiLogExecution('DEBUG', 'id', id);
							nlapiLogExecution('DEBUG', 'linktype', linktype);
							if(systemRule == 'Y' && receivedFulfillmentIdArr != null && receivedFulfillmentIdArr != '' && receivedFulfillmentIdArr != undefined &&
									receivedFulfillmentIdArr != 'null' && receivedFulfillmentIdArr.length > 0)
							{
								if(receivedFulfillmentIdArr.indexOf(id) != -1)
								{
									receiptcreated = 'T';
								}
								else
								{
									receiptcreated = 'F';
								}

							}
							if(linktype=='Item Fulfillment' && receiptcreated == 'F')
							{
								var frecord = nlapiLoadRecord('itemfulfillment', id);
								var fitemcount=frecord.getLineItemCount('item');
								for(var f=1;f<=fitemcount;f++)
								{
									var fitem=frecord.getLineItemValue('item','item',f);
									var fline=frecord.getLineItemValue('item','orderline',f);

									var pofline= parseInt(fline) + 1;

									if((fitem==FetchedItemId) && (parseInt(poLineno)==parseInt(pofline)))
									{
										var  serialnumbers=frecord.getLineItemValue('item','serialnumbers',(parseInt(f)));

										var itemfulfilserialno='';


										frecord.selectLineItem('item', f);


										var compSubRecord = frecord.viewCurrentLineItemSubrecord('item','inventorydetail');

										var polinelength =0;

										if(compSubRecord!=null && compSubRecord!=''&& compSubRecord!='null')
											polinelength = compSubRecord.getLineItemCount('inventoryassignment');

										for(var j1=1;j1<=polinelength ;j1++)
										{

											itemfulfilserialno=compSubRecord.getLineItemText('inventoryassignment','issueinventorynumber',j1);

											if(itemfulfilserialno!=null && itemfulfilserialno!='')
											{
												var tserials=itemfulfilserialno.split('');

												if(tserials!=null && tserials!='' && tserials.length>0)
												{
													if(tserials.indexOf(enterLot)!=-1)
													{

														POarray["custparam_tolotqty"]=compSubRecord.getLineItemValue('inventoryassignment','quantity',j1);
														invStatusStr = invStatusStr + compSubRecord.getLineItemValue('inventoryassignment','inventorystatus',j1) + ',';
														invtStatusTxt = invtStatusTxt + compSubRecord.getLineItemText('inventoryassignment','inventorystatus',j1) + ',';
														IsValidSerailNumber='T';
														break;
													}
												}
											}
										}

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

										nlapiLogExecution('DEBUG', 'poLineno',poLineno);

										var vitemfulfilledlotqty = 0;
										var tranfilter = new Array();

										if(poInternalId!=null && poInternalId!= 'null' && poInternalId!= undefined && poInternalId != '')
											tranfilter.push(new nlobjSearchFilter('internalid', null, 'is',poInternalId));
										tranfilter.push(new nlobjSearchFilter('item',null, 'is',FetchedItemId));
										tranfilter.push(new nlobjSearchFilter('serialnumber','fulfillingTransaction','is',enterLot));										
										tranfilter.push(new nlobjSearchFilter('line',null, 'equalto',fline));

										var tranlotresults = nlapiSearchRecord('transferorder','customsearch_wmsse_transf_ful_lot_detail',tranfilter,null);

										var filters1 = new Array();
										if(poInternalId!=null && poInternalId!= 'null' && poInternalId!= undefined && poInternalId != '')
											filters1.push(new nlobjSearchFilter('internalid', null, 'is',poInternalId));
										filters1.push(new nlobjSearchFilter('type', null, 'anyof', 'TrnfrOrd'));
										filters1.push(new nlobjSearchFilter('item',null, 'anyof',FetchedItemId));
										filters1.push(new nlobjSearchFilter('serialnumber','fulfillingTransaction','is',enterLot));
										if(pofline!=null && pofline!= 'null' && pofline!= undefined && pofline != '')
											filters1.push(new nlobjSearchFilter('line', null, 'equalto', parseFloat(pofline)));	
										var TOLotReceiptDetails = new nlapiSearchRecord('transferorder','customsearch_wmsse_transf_ful_lot_detail',filters1,null);
										nlapiLogExecution('ERROR', 'TOLotReceiptDetails', TOLotReceiptDetails);

										if(tranlotresults != null && tranlotresults != '' && tranlotresults != 'null' && tranlotresults.length > 0  && 
												(systemRule == null || systemRule == '' || systemRule == 'N'))
										{
											if(TOLotReceiptDetails!=null && TOLotReceiptDetails!= 'null' && TOLotReceiptDetails!= undefined && 
													TOLotReceiptDetails != ''&& TOLotReceiptDetails.length>0)
											{

												for (var d1 = 0; d1 < TOLotReceiptDetails.length; d1++)
												{													
													try
													{
														var receivedfulfillmentid = TOLotReceiptDetails[d1].getValue('internalid','fulfillingTransaction','group');
														var receivedRecord = nlapiLoadRecord('itemreceipt', receivedfulfillmentid);
														var receivedfulfillmentid = receivedRecord.getFieldValue('itemfulfillment');
														if(receivedfulfillmentid != '' && receivedfulfillmentid != 'null' && receivedfulfillmentid != null && 
																receivedfulfillmentid != undefined)
														{
															lotReceivedFulfillmentIdArr.push(receivedfulfillmentid);
														}
													}
													catch(e)
													{
														nlapiLogExecution('ERROR', 'exception in fulfillment details');
													}
												}
											}
											for(var p = 0 ; p < tranlotresults.length ; p++)
											{

												var vitemfulfillmentid = tranlotresults[p].getValue('internalid','fulfillingTransaction','group');
												if(lotReceivedFulfillmentIdArr.indexOf(vitemfulfillmentid) == -1)
												{
													var vitemfulfilledlot = tranlotresults[p].getValue('serialnumber','fulfillingTransaction','group');
													vitemfulfilledlotqty = tranlotresults[p].getValue('serialnumberquantity','fulfillingTransaction','sum');
													var totalfulfilledlotqty = tranlotresults[p].getValue('quantityshiprecv',null,'sum');
													nlapiLogExecution('DEBUG', 'totalfulfilledlotqty',totalfulfilledlotqty);
													if(vitemfulfilledlotqty < 0)
														break;
												}
											}

											vitemfulfilledlotqty = Big(vitemfulfilledlotqty).mul(-1);
											nlapiLogExecution('DEBUG', 'vitemfulfilledlotqty',vitemfulfilledlotqty);
										}

										else if(tranlotresults != null && tranlotresults != '' && tranlotresults != 'null' && tranlotresults.length > 0 &&
												systemRule == 'Y')
										{
											for(var p = 0 ; p < tranlotresults.length ; p++)
											{
												var vitemfulfillmentid = tranlotresults[p].getValue('internalid','fulfillingTransaction','group');
												var vitemfulfilledlot = tranlotresults[p].getValue('serialnumber','fulfillingTransaction','group');
												vitemfulfilledlotqty = tranlotresults[p].getValue('serialnumberquantity','fulfillingTransaction','sum');
												var totalfulfilledlotqty = tranlotresults[p].getValue('quantityshiprecv',null,'sum');
												nlapiLogExecution('DEBUG', 'totalfulfilledlotqty',totalfulfilledlotqty);
												if(vitemfulfilledlotqty < 0)
													break;
											}

											vitemfulfilledlotqty = Big(vitemfulfilledlotqty).mul(-1);
											nlapiLogExecution('DEBUG', 'vitemfulfilledlotqty',vitemfulfilledlotqty);
										}

										var filter = new Array();
										filter.push(new nlobjSearchFilter('custrecord_wmsse_sku',null, 'is',FetchedItemId));
										filter.push(new nlobjSearchFilter('custrecord_wmsse_batch_num',null, 'is',enterLot));
										filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null, 'is',poInternalId));
										filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no',null, 'equalto',poLineno));
										filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof',[2])); 

										var column = new Array();
										//column.push(new nlobjSearchColumn('custrecord_wmsse_act_qty'));
										var results = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskreceivingdata',filter, null);
										nlapiLogExecution('DEBUG', 'results',results);
										var qSum = 0;
										if(results != null && results != '')
										{
											nlapiLogExecution('DEBUG', 'results',results.length);
											for(var i=0; i<results.length;i++)
											{
												qSum = Number(Big(qSum).plus(results[i].getValue('custrecord_wmsse_act_qty')));
												nlapiLogExecution('DEBUG', 'qSum',qSum);

											}
										}

										//if((systemRule==null || systemRule=='' || systemRule=='N') && ((qSum >= POarray["custparam_tolotqty"]) && (qSum >= vitemfulfilledlotqty)))
										if((systemRule==null || systemRule=='' || systemRule=='N') && (qSum >= vitemfulfilledlotqty))
										{
											nlapiLogExecution('DEBUG', 'qSum1',qSum);
											POarray["custparam_error"] = "This Lot already scanned.";
											response.sendRedirect('SUITELET', 'customscript_wmsse_checkinlot', 'customdeploy_wmsse_checkinlot', false, POarray);
											return; 
										}
										//else if((qSum >= POarray["custparam_tolotqty"]) || (qSum > POarray["custparam_tolotqty"] && (qSum >= totalfulfilledlotqty)))
										else if((qSum >= totalfulfilledlotqty))
										{
											nlapiLogExecution('DEBUG', 'systemRule1',systemRule);
											POarray["custparam_error"] = "This Lot already scanned.";
											response.sendRedirect('SUITELET', 'customscript_wmsse_checkinlot', 'customdeploy_wmsse_checkinlot', false, POarray);
											return; 
										}
										POarray["custparam_tolotrcvqty"] = qSum;
										POarray["custparam_toorderqty"] = totalfulfilledlotqty;
									}
								}
							}
							else if(linktype=='Item Receipt')
							{
								var receivedRecord = nlapiLoadRecord('itemreceipt', id);
								var receivedfulfillmentid = receivedRecord.getFieldValue('itemfulfillment');
								if(receivedfulfillmentid != '' && receivedfulfillmentid != 'null' && receivedfulfillmentid != null &&
										receivedfulfillmentid != undefined)
								{
									receivedFulfillmentIdArr.push(receivedfulfillmentid);
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

					POarray["custparam_tolotinvstatusid"] = invStatusStr;
					POarray["custparam_tolotinvstatustxt"] = invtStatusTxt;
					nlapiLogExecution('ERROR','invtStatusTxt', invtStatusTxt);

				}
				if(enterExpiryDate!=null && enterExpiryDate!='' && enterExpiryDate!='null')
				{
					var getExpDateresult=ValidateDate(enterExpiryDate,dtsettingFlag);
					if(getExpDateresult == null || getExpDateresult == "")
					{

						POarray["custparam_error"] = "Expiry date should be in "+ dtsettingFlag;

						response.sendRedirect('SUITELET', 'customscript_wmsse_checkinlot', 'customdeploy_wmsse_checkinlot', false, POarray);
						return;
					}
					else
					{
						var now = convertDate();
						now.setHours(0, 0, 0, 0);

						if(now > getExpDateresult)
						{
							POarray["custparam_error"] = "Expiry date cannot be less than current date";
							response.sendRedirect('SUITELET', 'customscript_wmsse_checkinlot', 'customdeploy_wmsse_checkinlot', false, POarray);
							return;
						}
						nlapiLogExecution('ERROR','Expdate',enterExpiryDate);
						POarray["custparam_lotexpirydate"]=enterExpiryDate;

					} 
				}
				if(trantype!='transferorder')
				{
					var enterLotId=isInventoryNumberExists(FetchedItemId,enterLot,POarray["custparam_whlocation"]);
					if(!enterLotId && (enterExpiryDate==null || enterExpiryDate=='' || enterExpiryDate=='null'))
					{
						//Case # 201414807  start

						if(shelflife != null && shelflife != '' && shelflife != 'null' && shelflife != 'undefined')
						{




							if(shelflife != null && shelflife != '' && shelflife != 'null' && shelflife != 'undefined' && shelflife > 0)
							{
								var currDate = convertDate();								

								var ExpiryDate = nlapiAddDays(currDate,parseInt(shelflife)) ;

								var getExpDateresult=nlapiDateToString(ExpiryDate,dtsettingFlag);
								POarray["custparam_lotexpirydate"]=getExpDateresult;
							}
							else
							{
								if(shelflife != null && shelflife != '' && shelflife != 'null' && shelflife != 'undefined' && shelflife <= 0)
								{
									POarray["custparam_lotno"] = enterLot;
									POarray["custparam_error"] = 'Shelf life period value for this item should be greater than zero.';
									response.sendRedirect('SUITELET', 'customscript_wmsse_checkinlot', 'customdeploy_wmsse_checkinlot', false, POarray);
									return;
								}
							}



						}//Case # 201414807  end
					}
					if(enterLotId)
					{
						//if lot is already exists in inventory, no need to consider expiry date
						POarray["custparam_lotexpirydate"]="";
						nlapiLogExecution('Debug','POarray["custparam_lotexpirydate"]11',POarray["custparam_lotexpirydate"]);
					}
				}
				POarray["custparam_lotno"] = enterLot;
				nlapiLogExecution('Debug','POarray["custparam_lotexpirydate"]',POarray["custparam_lotexpirydate"]);
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
				return;

			}
			else
			{
				POarray["custparam_error"] = 'Please enter/scan valid lot#';
				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinlot', 'customdeploy_wmsse_checkinlot', false, POarray);
			}
		} 
		else {
			POarray["custparam_error"] = '';
			POarray["custparam_lotno"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
		}
	} //end of first if condition
} //end of function.


