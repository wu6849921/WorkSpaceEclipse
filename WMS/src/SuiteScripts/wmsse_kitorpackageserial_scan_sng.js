/**
 * Script Description
 * This script is used to scan the Serial for selected item.
 */

/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ****************************************************************************/
/**
 * Main function to scan serial numbers for kit/package picking process
 */
function PIckingSerial(request, response)
{
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';
		var customer=request.getParameter('custparam_customer');
		//Get the PO# from the previous screen, which is passed as a parameter		
		var getSONo = request.getParameter('custparam_soid');

		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');

		var whCompany= request.getParameter('custparam_company');
		var getSONo = request.getParameter('custparam_soid');

		var getSOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_enterQty');
		var getItemRecQty = request.getParameter('custparam_number');

		var getenteredQty = request.getParameter('custparam_enteredqty');
		var getItemId = request.getParameter('custparam_itemid');
		var getmemItemqty = request.getParameter('custparam_memitemqty');
		var getmemItementeredqty = request.getParameter('custparam_memitementeredqty');
		var getmemItembin = request.getParameter('custparam_memitementeredbin');
		if(getItemRecQty==null || getItemRecQty=='' || getItemRecQty=='null')
			getItemRecQty=0;

		if(getmemItementeredqty==null || getmemItementeredqty=='' || getmemItementeredqty=='null')
			getmemItementeredqty=0;

		var getmemItempickedqty = request.getParameter('custparam_memitempickedqty');
		var getCarton = request.getParameter('custparam_carton');
		var getCartonSize = request.getParameter('custparam_cartonsize');
		var getCartonWeight = request.getParameter('custparam_cartonweight');
		var getCartonscreenValue = request.getParameter('custparam_cartonscreenrulevalue');
		var componentItem  = request.getParameter('custparam_coitem');
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var getmemItempickedqty = request.getParameter('custparam_memitempickedqty');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		var pickType= request.getParameter('custparam_picktype');
		var getItemRemainingQty = request.getParameter('custparam_itemremainingquantity');
		if(getmemItempickedqty==null || getmemItempickedqty =='' ||getmemItempickedqty=='null' ||getmemItempickedqty=='undefined')
		{
			getmemItempickedqty=0;
		}
		//Parameters
		var enteredBin=request.getParameter('custparam_enteredbin');
		var enteredQty =  request.getParameter('custparam_enteredqty'); 
		var eneteredBinId = request.getParameter('custparam_enteredBinID'); 
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var invt_status = request.getParameter('custparam_status');
		var screenName = request.getParameter('custparam_screen');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "SO/TO";
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-FULFILLMENT SERIAL SCAN';
		if(trantype == 'salesorder')
		{
			st0 = domainName + '-SO Picking';
			ordVar = "Sales Order#";
		}
		else
		{
			st0 = domainName + '-TO Picking';
			ordVar = "Transfer Order#";
		}
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		// Here 4k records fetching not required.
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		if(itemresults!=null && itemresults!='')
		{
			componentItem = itemresults[0].getValue('itemid');
		}

		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;

		//var memitmremainQty = parseFloat(getItemRemQty) - parseFloat(parseFloat(getNumber));
		var memitmremainQty = Number(Big(getItemRemQty).minus(getNumber));
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');


		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getSONo. = ' + getSONo + '<br>';
		logmsg = logmsg + 'getNumber. = ' + getNumber + '<br>';
		logmsg = logmsg + 'getItemRemQty. = ' + getItemRemQty + '<br>';	
		logmsg = logmsg + 'getItemRecQty. = ' + getItemRecQty + '<br>';	
		logmsg = logmsg + 'CSSfilefound. = ' + CSSfilefound + '<br>';		
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';						
		nlapiLogExecution('DEBUG', 'Values :', logmsg);

		var orderLevel=request.getParameter('custparam_orderlevel');
		var getPreferBin=request.getParameter('custparam_preferbin');

		if(parseFloat(getNumber)==0)
		{
			var filterssertemp1 = new Array();
			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', getSOLineNo);
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', getSOInternalId);
			// Here 4k records fetching not required.
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,null);
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
			SrchRecordTmpSerial1=null;
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
		CSSfilefound=null;
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


		html = html + "<SCRIPT LANGUAGE='javascript' for='window' EVENT='onload()'>"; 
		html = html + "var version = navigator.appVersion;";
		html = html + "document.onkeydown = function (e) {";
		html = html + "var keycode = (window.event) ? event.keyCode : e.keyCode;"; 
		html = html + "if ((version.indexOf('MSIE') != -1)) { ";
		html = html + "	if (keycode == 116) {event.keyCode = 0;event.returnValue = false;return false;}}"; 
		html = html + "else {if (keycode == 116)return false;}";
		html = html + "};";
		html = html + "</script>";
		//Refresh Functionality ends

		html = html +"<script type='text/javascript'>function validateForm() {var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtserial').value; var vSerialWhiteSpace = lotVal.indexOf(' ') >= 0; if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;} else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}}}</script>";
		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getSONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getSOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnItemId' value=" + getItemId + ">"+
		"				<input type='hidden' name='hdnmemItemQty' value=" + getmemItemqty + ">"+
		"				<input type='hidden' name='hdnenteredQty' value=" + getenteredQty + ">"+
		"				<input type='hidden' name='hdnCoitem' value='" + componentItem + "'>"+
		"				<input type='hidden' name='hdnCoitempikedqty' value='" + getmemItempickedqty + "'>"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnCarton' value='" + getCarton + "'>"+
		"				<input type='hidden' name='hdnCartonsize' value='" + getCartonSize + "'>"+
		"				<input type='hidden' name='hdnCartonweight' value='" + getCartonWeight + "'>"+
		"				<input type='hidden' name='hdnCartonscreenvalue' value='" + getCartonscreenValue + "'>"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnorderLevel' value=" + orderLevel + ">"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnPickType' value='" +pickType+"'>"+
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnstatusscreen' value='" +screenName+"'>"+
		"				<input type='hidden' name='hdnstatus' value='" +invt_status+"'>"+
		"				<input type='hidden' name='hdnenteredbin' id='hdnenteredbin' value='" +enteredBin+"' >"+
		"				<input type='hidden' name='hdnenteredquantity' id='hdnenteredquantity' value='" +enteredQty+"' >"+
		"				<input type='hidden' name='hdnenteredbinid' id='hdnenteredbinid' value='" +eneteredBinId+"' >"+
		"				<input type='hidden' name='hdnItemRemainingQty' id='hdnItemRemainingQty' value=" + getItemRemainingQty + ">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + componentItem + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + (parseFloat(getItemRecQty)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + memitmremainQty + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF <label>" + getItemRemQty + "</label>"+
		"			</tr>";
		// Inventory feature is enabled
		if(invt_status != null && invt_status != '' && invt_status != 'null' && invt_status != 'undefined')
		{
			var vInventoryStatus ='';
			var hdnInvtStatusText = request.getParameter('hdnInvtStatusText');
			if(hdnInvtStatusText != '' && hdnInvtStatusText != null && hdnInvtStatusText != 'null' && hdnInvtStatusText != 'undefined')
			{
				vInventoryStatus = hdnInvtStatusText;
			}
			else
			{

				var inventoryStatusLst = getInventoryStatusListForOutBound(-1,invt_status);

				if(inventoryStatusLst.length > 0)
				{
					vInventoryStatus = inventoryStatusLst[0][0];
				}
			}
			html =html+ "			<tr>"+
			"			<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
			"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + vInventoryStatus + "'>"+	
			"				<input type='hidden' name='hdnInvtStatus' id = 'hdnInvtStatus' value='" + invt_status + "'>"+	
			"			</tr>";

		}
		html=html+"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";
		html = html + "	<td align = 'left'><input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>";

		html = html + "	</td>"+
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Pick (Ent)' onclick='return validateForm();'/></td>"+		
		"			</tr>"+
		"		 </table>";
		html = html + "</form>"+

		"<script type='text/javascript'>document.getElementById('txtserial').focus();</script>";
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


		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var getSerialNo=(request.getParameter('txtserial')).trim();
		var ordType= request.getParameter('hdnOrdtype');
		var invtStatus= request.getParameter('hdnInvtStatus');
		var statusScreen = request.getParameter('hdnstatusscreen');
		SOarray["custparam_enteredbin"] = request.getParameter('custparam_enteredbin');
		SOarray["custparam_enteredBinID"] = eneteredBinId;	
		SOarray["custparam_status"]=invtStatus;
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		SOarray["custparam_option"] = request.getParameter('hdnOptedField');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		SOarray["custparam_sointernalid"] = request.getParameter('hdnSoInternalId');
		SOarray["custparam_lineno"] = request.getParameter('hdnSoLineno');
		SOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		SOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		SOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		SOarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		SOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		SOarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		SOarray["custparam_itemid"] = request.getParameter('hdnItemId');
		SOarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		SOarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		SOarray["custparam_enterBin"] = request.getParameter('hdnenterBin');
		SOarray["custparam_enteredqty"] = request.getParameter('hdnenteredQty');
		SOarray["custparam_cartonsize"] = request.getParameter('hdnCartonsize');
		SOarray["custparam_carton"] = request.getParameter('hdnCarton');
		SOarray["custparam_cartonweight"] = request.getParameter('hdnCartonweight');
		SOarray["custparam_cartonscreenrulevalue"] = request.getParameter('hdnCartonscreenvalue');
		SOarray["custparam_memitempickedqty"]=request.getParameter('hdnCoitempikedqty');
		SOarray["custparam_memitementeredqty"]=enterQty;
		SOarray["custparam_memitemqty"] = request.getParameter('hdnmemItemQty');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_itemremainingquantity"] = request.getParameter('hdnItemRemainingQty');
		SOarray["custparam_screen"] = request.getParameter('hdnstatusscreen');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		var pickType = request.getParameter('hdnPickType');
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnenterQty');
		var soInternalId=request.getParameter('hdnSoInternalId');
		var recQty=request.getParameter('hdnItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var soLineno=request.getParameter('hdnSoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var getNumber=parseFloat(request.getParameter('hdnNumber'));
		var coItemId=request.getParameter('hdnItemId');
		var memItemExpectedQty = request.getParameter('hdnmemItemQty');
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);

		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'optedEvent = ' + optedEvent + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'soInternalId = ' + soInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'coItemId = ' + coItemId + '<br>';
		logMsg = logMsg + 'soLineno = ' + soLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'SOarray["custparam_carton"] = ' + SOarray["custparam_carton"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonsize"] = ' + SOarray["custparam_cartonsize"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonweight"] = ' + SOarray["custparam_cartonweight"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonscreenrulevalue"] = ' + SOarray["custparam_cartonscreenrulevalue"] + '<br>';
		nlapiLogExecution('DEBUG', 'Processing RF - Serial', logMsg);

		var vStageScanRequired="F";		 

		vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',request.getParameter('hdnWhLocation'),'2');		

		if(vStageScanRequired!=null && vStageScanRequired!='')
		{ 
			vStageScanRequired="T";			 
		}
		else
		{
			vStageScanRequired="F";
		}

		var binInternalId=nswms_GetBinInternalId(enterBin,request.getParameter('hdnWhLocation'));


		if (sessionobj!=context.getUser()) 
		{
			try
			{
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				var binInternalId=nswms_GetBinInternalId(enterBin,request.getParameter('hdnWhLocation'));
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){

					if(getSerialNo!=null && getSerialNo!="" && getSerialNo!='null')
					{

						nlapiLogExecution('DEBUG', 'After Serial No Parsing', getSerialNo);
						nlapiLogExecution('DEBUG', 'trantype', trantype);
						nlapiLogExecution('DEBUG', 'soInternalId', soInternalId);
						nlapiLogExecution('DEBUG', 'soLineno', soLineno);
						var objBinDetails=null;
						//Inventorystatus Feature is enabled
						if(inventoryStatusFeature ==true)
						{
							var getSerialNoId = inventoryNumberInternalId(getSerialNo,SOarray["custparam_whlocation"],coItemId);

							var filterStrat = new Array();

							if(binInternalId != null && binInternalId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber',null,'anyof', binInternalId));
							filterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', coItemId));	
							if(getSerialNoId != null && getSerialNoId != '' && getSerialNoId != 'null')
								filterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', getSerialNoId));
							if(invtStatus != null && invtStatus != '' && invtStatus != 'null' && invtStatus != 'undefined' && 
									invtStatus != undefined)
								filterStrat.push(new nlobjSearchFilter('status', null, 'anyof', invtStatus));

							//No need to use load search here as we will get only one record.
							objBinDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterStrat, null);
							nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails);
							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									var serial_matchfound='F';
									for(var invtItr =0; invtItr<objBinDetails.length; invtItr++)
									{
										var availableQty=objBinDetails[invtItr].getValue('available',null,'group');
										var vinventorynumber=objBinDetails[invtItr].getText('inventorynumber',null,'group');

										if(vinventorynumber == getSerialNo)
										{
											serial_matchfound='T';
											break;
										}

									}
									if(serial_matchfound =='F')
									{
										SOarray["custparam_error"] = 'Serial# :'+ getSerialNo + ' is not available';
										response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
										return;
									}
								}
								else
								{
									objBinDetails='';
								}
							}
						}
						else
						{
							var filterStrat = new Array();

							if(binInternalId != null && binInternalId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
							filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', coItemId));
							filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							//filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', SOarray["custparam_whlocation"]));
							filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

							var columnStrat=new Array();
							columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
							columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
							columnStrat[0].setSort(true);

							//var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_getinv_bin_recv_lot',filterStrat, columnStrat);
							objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
							if(objBinDetails!=null && objBinDetails!='')
							{
								
								if(objBinDetails.length>0)
								{
									var availableQty=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
									var vinventorynumber=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');
									nlapiLogExecution('Debug', 'enterQty,availableQt,vinventorynumber', enterQty+","+availableQty+","+vinventorynumber);
									if(vinventorynumber != getSerialNo)
									{
										//SOarray["custparam_error"] = 'Serial# not in storage: '+getSerialNo;
										SOarray["custparam_error"] = 'Serial# :'+ getSerialNo + ' is not available';
										response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
										return;
									}

								}
								else
								{
									objBinDetails='';
								}
							}
						}
						if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' ||objBinDetails.length < 1)
						{
							//SOarray["custparam_error"] = 'Serial# not in storage: '+getSerialNo;
							SOarray["custparam_error"] = 'Serial# :'+ getSerialNo + ' is not available';
							response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
							return;
						} 


						nlapiLogExecution('Debug', 'request.getParameter(custparam_serialno) before', request.getParameter('custparam_serialno'));


						
						//checking serial no's in already scanned one's from temp table
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));

						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 3));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', coItemId));

						// Here 4k records fetching not required.
						var SrchRecordTmpSerial = 
							nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp,null);

						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{

							var vSerialOrder = SrchRecordTmpSerial[0].getText('custrecord_wmsse_ser_ordno');
							SOarray["custparam_error"] = "Serial# already scanned for "+vSerialOrder;
							response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
							SrchRecordTmpSerial=null;
							return;
						}
						else 
						{
							var filterssertemp1 = new Array();
							filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', coItemId);
							filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', binInternalId);
							filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [8,28]);//PICK,PACKING COMPLETED
							filterssertemp1[3] = new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', 3);//PICK
							filterssertemp1[4] = new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@']); // NS REF no is empty

							// Here 4k records fetching not required.
							var SrchRecordTmpSerial1 = 
								nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskdetails_srh', filterssertemp1,null);

							if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
							{

								var serialArray='';
								for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
									if(serialArray==null || serialArray=='')
									{
										serialArray=SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_serial_no');
									}
									else
									{
										serialArray=serialArray+","+SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_serial_no');
									}
								}
								var totalSerialArray=serialArray.split(',');

								for (var k = 0; k < totalSerialArray.length; k++) {
									if(getSerialNo == totalSerialArray[k])
									{
										SOarray["custparam_error"] = "Scanned serial# is already picked";
										response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
										SrchRecordTmpSerial1=null;
										return;
									}
								}
							}
						}


						SOarray["custparam_serialno"] = getSerialNo;

						SOarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;



						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', getSerialNo);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordno', soInternalId);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordline', soLineno);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', coItemId);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
						customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 3);
						var rec = nlapiSubmitRecord(customrecord, false, true);
						customrecord=null;

						if ((parseInt(getNumber) + 1) < parseInt(remQty)) {

							SOarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
							return;

						}
						else
						{
							try{

								var binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);

								var soLineItemDetails = 
									getSOLineDetailsItemandqty(soInternalId,trantype,FetchedItemId,SOarray["custparam_whlocation"],soLineno);
								var vMultiShipping='F';
								var vShipVia='';
								//To fetch Line level multi shipping flag and ship via validation
								if(soLineItemDetails !=null && soLineItemDetails!="" && soLineItemDetails != 'null' && soLineItemDetails.length != null)
								{	
									var vColumnslist=soLineItemDetails[0].getAllColumns();

									var custIndex = 12;
									var commitedQtyIndex = 25;
									var fulfilledQtyIndex = 26;
									var conversionRateIndex=27;
									var totalPickedQtyIndex =7;
									var totalNSPickedQtyIndex =37;
									var ERPConfirmedQty =38;
									for(var x1=0;x1<vColumnslist.length;x1++)
									{
										var summaryLabel = vColumnslist[x1].getLabel();
										var name =  vColumnslist[x1].getName();
										if(summaryLabel == 'Customer Id')
										{
											custIndex = x1;
										}
										else if (summaryLabel == 'Committed Quantity')
										{
											commitedQtyIndex = x1;
										}
										else if (summaryLabel == 'Fulfilled Quantity' && name == 'formulanumeric')
										{
											fulfilledQtyIndex = x1;
										}
										else if (summaryLabel == 'Conversion Rate')
										{
											conversionRateIndex = x1;
										}
										else if (summaryLabel == 'Total Picked Quantity')
										{
											totalPickedQtyIndex = x1;
										}
										else if (summaryLabel == 'ERPpickedQuantity')
										{
											totalNSPickedQtyIndex = x1;
										}
										else if (summaryLabel == 'ERP CONFIRMED QTY')
										{
											ERPConfirmedQty = x1;
										}
										else
										{

										}
									}
									var vSoreminqty =0;
									var OpenKitPickTaskDetails=getOpenTaskDetails(soInternalId,soLineno);

									var kitPickConfirmedQty=0;
									if(OpenKitPickTaskDetails != null && OpenKitPickTaskDetails != '' )
									{
										for(var j=0;j < OpenKitPickTaskDetails.length;j++)
										{
											var sku = OpenKitPickTaskDetails[j].getValue('custrecord_wmsse_sku',null,'group');

											if(parseInt(sku) == parseInt(FetchedItemId))
											{
												kitPickConfirmedQty =   OpenKitPickTaskDetails[j].getValue('custrecord_wmsse_expe_qty',null,'sum');
												nlapiLogExecution('DEBUG', 'kitPickConfirmedQty', kitPickConfirmedQty);												
												break;
											}

										}
									}

									for(var z=0;z<soLineItemDetails.length;z++)
									{
										var vsoLine = soLineItemDetails[z].getValue('line',null,'group');
										var vsoitemQty=soLineItemDetails[z].getValue(vColumnslist[commitedQtyIndex]);
										var vsoitemfulfillQty=soLineItemDetails[z].getValue(vColumnslist[fulfilledQtyIndex]);							

										if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
											vsoitemfulfillQty=0;

										var vsoitemopentaskQty=soLineItemDetails[z].getValue(vColumnslist[totalPickedQtyIndex]);
										var vsoitemErpConfirmedQty=soLineItemDetails[z].getValue(vColumnslist[ERPConfirmedQty]);
										var vsoitemNSReceivedQty=soLineItemDetails[z].getValue(vColumnslist[totalNSPickedQtyIndex]);
										if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
										{
											vsoitemopentaskQty = 0;
										}
										if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' || vsoitemErpConfirmedQty=='undefined' )
										{
											vsoitemErpConfirmedQty = 0;
										}
										if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
										{
											vsoitemNSReceivedQty = 0;
										}

										//var vsoitemRcvQty =
										//parseFloat(vsoitemopentaskQty)+parseFloat(vsoitemErpConfirmedQty)+
										//(parseFloat(vsoitemNSReceivedQty)-parseFloat(vsoitemErpConfirmedQty));

										vsoitemopentaskQty=new Big(vsoitemopentaskQty);
										vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
										vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);

										var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));


										//vSoreminqty = (parseFloat(vsoitemQty) + parseFloat(vsoitemfulfillQty)) - parseFloat(kitPickConfirmedQty);

										vsoitemQty=new Big(vsoitemQty);
										vSoreminqty=Number((vsoitemQty).plus(vsoitemfulfillQty).minus(kitPickConfirmedQty));

										if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1) && trantype == 'transferorder'))
										{

											vMultiShipping = soLineItemDetails[z].getValue('ismultishipto',null,'group');
											if(vMultiShipping ==  null || vMultiShipping =='')
												vMultiShipping='F';
											vShipVia=soLineItemDetails[z].getValue('shipmethod',null,'group');											
											break;
										}			

									}	

								}

								var isItLastPick='F';
								var soLineDetails = null;
								if(parseFloat(vSoreminqty) > 0)
								{
									// added inventory status as a parameter to opentask creation funtion
									updateOpenTask(soInternalId,coItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],'','',
											'','',soInternalId,null,null,null,'PICK',SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
											SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
											'',Number(Big(memItemExpectedQty).toFixed(5)),Number(Big(enterQty).toFixed(5)),FetchedItemId,'T','','','',vShipVia,null,ordType,department,vclass,null,'',invtStatus);
									soLineDetails = getSOLineDetailskit(SOarray["custparam_soid"],trantype,FetchedItemId,SOarray["custparam_whlocation"],'');
									nlapiLogExecution('ERROR', 'soLineDetails', soLineDetails);
								}
								var compItemRequiredQtyArr = new Array();
								if(soLineDetails !=null && soLineDetails!="")
								{

									var vColumnslist=soLineDetails[0].getAllColumns();
									var memitemcommitedQtyIndex = 8;
									var memitemfulfilledQtyIndex = 9;		
									var memitemtotalPickedQtyIndex =10;
									for(var x1=0;x1<vColumnslist.length;x1++)
									{
										var summaryLabel = vColumnslist[x1].getLabel();

										if(summaryLabel == 'Member Item Total Picked Quantity')
										{
											memitemtotalPickedQtyIndex = x1;
										}
										else if (summaryLabel == 'Member Item Committed Quantity')	
										{
											memitemcommitedQtyIndex = x1;
										}
										else if (summaryLabel == 'Member Item Fulfilled Quantity')
										{
											memitemfulfilledQtyIndex = x1;
										}				
										else
										{

										}
									}
									if(soLineDetails.length>0)
									{
										var openTaskDetails  = getOpenTaskDetails(soInternalId,soLineno);
										var count= 0;
										for(var f=0;f<soLineDetails.length;f++)
										{		
											var searchResult=soLineDetails[f];
											var vSoLine = searchResult.getValue('line',null,'group');
											var vsoitemRcvQty = searchResult.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
											var vsoitemCommitedQty=searchResult.getValue(vColumnslist[memitemcommitedQtyIndex]);
											var vsoitem = searchResult.getValue('item',null,'group');
											var vcoitem = searchResult.getValue('memberitem','item','group');
											var vMemItemType = getComponentItemType(vcoitem);
											var pickConfirmedQty=0;
											if(openTaskDetails != null && openTaskDetails != '' )
											{
												for(var j=0;j < openTaskDetails.length;j++)
												{
													var sku = openTaskDetails[j].getText('custrecord_wmsse_sku',null,'group');
													if(sku == vcoitem)
													{
														pickConfirmedQty =   openTaskDetails[j].getValue('custrecord_wmsse_expe_qty',null,'sum');
														break;
													}

												}
											}

											var qtyToCompare =	fnGetComponentItemDetails(FetchedItemId,vcoitem,SOarray["custparam_enteredqty"]);
											var currRow = [vcoitem,qtyToCompare];
											compItemRequiredQtyArr.push(currRow);

											if(parseFloat(vSoLine) == parseFloat(soLineno))
											{
												if(parseFloat(pickConfirmedQty) >= parseFloat(qtyToCompare))
												{	
												}
												else
												{
													count=parseFloat(count)+1;
													break;
												}
											}
										}

										if(parseFloat(count) >= 1)
										{
											isItLastPick="F";
										}
										else
										{
											isItLastPick="T";
										}
									}

								}
								soLineDetails=null;


								// To post IF when order level is true and lastpick is true for already packed containers against order
								if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T" && vStageScanRequired == 'F')
								{
									var filtersPack = new Array();
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['14']));
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'isnotempty'));
									// Here 4k records fetching not required.
									var opentaskSearchResultsPack=nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh',filtersPack,null);
									if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
									{

										var fieldsPack = new Array();
										var valuesPack = new Array();
										for(var x=0; x < opentaskSearchResultsPack.length; x++)
										{

											var RecordIdPack=opentaskSearchResultsPack[x].getId();
											if(RecordIdPack!=null && RecordIdPack!='')
											{
												var recId=nlapiLoadRecord('customrecord_wmsse_trn_opentask',RecordIdPack);
												recId.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												var vPackRecId = nlapiSubmitRecord(recId);

											}
										}
									}
								}
								// end

								if(isItLastPick!=null && isItLastPick!='' && isItLastPick=="T")
								{
									nlapiLogExecution('ERROR', 'isItLastPick', isItLastPick);
									// added inventory status as a parameter to opentask creation funtion                  
									var mianItemOPenTaskid = updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(SOarray["custparam_enteredqty"]).toFixed(5)),binInternalId,
											itemType,SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,'PICK',SOarray["custparam_carton"],
											SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],
											SOarray["custparam_customer"],'','','','','F','','','',vShipVia,null,ordType,department,vclass,null,'',invtStatus);
									nlapiLogExecution('ERROR', 'mianItemOPenTaskid', mianItemOPenTaskid);

									if(mianItemOPenTaskid != null && mianItemOPenTaskid !='')
									{

										var filter= new Array();
										filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId)); 
										filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', soLineno)); 
										filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
										filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8']));//8 picking completed
										filter.push(new nlobjSearchFilter('custrecord_wmsse_kitflag', null,'is', 'T'));//8 picking completed
										filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
										filter.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); // NS REF no is empty
										filter.push(new nlobjSearchFilter('custrecord_wmsse_act_qty', null, 'isempty')); 
										// Here 4k records fetching not required.
										var opentaskordersearchresultkit = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh',filter,null);

										if(opentaskordersearchresultkit != null && opentaskordersearchresultkit !='')
										{
											for(var k=0;k<opentaskordersearchresultkit.length;k++)
											{

												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',opentaskordersearchresultkit[k].getId());
												var expQty = loadRec.getFieldValue('custrecord_wmsse_expe_qty');
												var vName = loadRec.getFieldValue('name');
												var vCoItem = loadRec.getFieldText('custrecord_wmsse_sku');
												if(compItemRequiredQtyArr.length > 0)
												{
													for(var c=0;c<compItemRequiredQtyArr.length;c++)
													{
														var coItemVal = compItemRequiredQtyArr[c][0];
														var coItemQty = compItemRequiredQtyArr[c][1];

														if((coItemVal ==  vCoItem)&& (parseFloat(expQty) > parseFloat(coItemQty)))
														{
															//var coRemainingQty = parseFloat(expQty)-parseFloat(coItemQty);
															var coRemainingQty = Number(Big(expQty).minus(coItemQty));
															var copyRec = 
																nlapiCopyRecord('customrecord_wmsse_trn_opentask',opentaskordersearchresultkit[k].getId());
															copyRec.setFieldValue('name', vName);
															copyRec.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(coRemainingQty).toFixed(5)));
															nlapiSubmitRecord(copyRec);
															expQty = coItemQty;
															loadRec.setFieldValue('custrecord_wmsse_expe_qty',Number(Big(expQty).toFixed(5)));

														}
													}

												}

												loadRec.setFieldValue('custrecord_wmsse_act_qty',Number(Big(expQty).toFixed(5)));
												nlapiSubmitRecord(loadRec);
											}
										}
										opentaskordersearchresultkit=null;
										if(SOarray["custparam_orderlevel"] =="F" && mianItemOPenTaskid != null && mianItemOPenTaskid != '' && vStageScanRequired == 'F')
										{	
											var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
											loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
											nlapiSubmitRecord(loadRec);
											loadRec=null;
										}
									}
									//soLineDetails = getSOLineDetailsItem(soInternalId,trantype,null,SOarray["custparam_whlocation"]);
									soLineDetails = getSOqtyscandetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
									if(soLineDetails !=null && soLineDetails!="" && soLineDetails.length>0)
									{

										var vLinecount=0;
										var vShipCount=0;
										var vColumnslist=soLineDetails[0].getAllColumns();
										var vOpentaskdetails = getPickedqtydetails(soInternalId,trantype,SOarray["custparam_whlocation"]);

										var deviceUploadFlag='T';
										for(var cnt=0;cnt<soLineDetails.length;cnt++)
										{


											var vsoitem = soLineDetails[cnt].getText('item');
											var vsoitemId = soLineDetails[cnt].getValue('item');
											var vsoitemType=soLineDetails[cnt].getValue('type','item');

											if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
												|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
											{
												var vsoitemQty=soLineDetails[cnt].getValue('quantity');
											}
											else
											{
												var vsoitemQty=soLineDetails[cnt].getValue('quantitycommitted');
											}

											var vsoitemfulfillQty=soLineDetails[cnt].getValue('quantitypicked');				

											var vsoitemNSReceivedQty=soLineDetails[cnt].getValue('quantitypicked');
											var vsoitemNSshippedQty=soLineDetails[cnt].getValue('quantityshiprecv');
											var vsoitemMultiShipping = soLineDetails[cnt].getValue('ismultishipto');
											var vsoitemShipVia = soLineDetails[cnt].getValue('shipmethod');
											var vsoitemLine = soLineDetails[cnt].getValue('line');					
											var vUnitsText = soLineDetails[cnt].getValue('unit');
											var vConversionRate = soLineDetails[cnt].getValue('formulanumeric');


											if(trantype == 'transferorder' && vsoitemLine != null)
												vsoitemLine = parseInt(vsoitemLine)-1;

											var vsoitemopentaskQty=0;
											for(var vOpentaskcount = 0; vOpentaskcount < vOpentaskdetails.length; vOpentaskcount++)
											{

												var vOpentaskitem = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_sku',null,'group');
												var vOpentaskLine = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_line_no',null,'group');

												if(vOpentaskitem==vsoitemId && vOpentaskLine==vsoitemLine)
												{
													vsoitemopentaskQty = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_act_qty',null,'sum');
													break;
												}


											}

											if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
											{
												vsoitemopentaskQty = 0;
											}

											if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
											{
												vsoitemNSReceivedQty = 0;
											}
											if(vsoitemfulfillQty ==null || vsoitemfulfillQty=='' ||vsoitemfulfillQty=='null' || vsoitemfulfillQty=='undefined' )
											{
												vsoitemfulfillQty = 0;
											}
											if(vsoitemNSshippedQty ==null || vsoitemNSshippedQty=='' ||vsoitemNSshippedQty=='null' || vsoitemNSshippedQty=='undefined' )
											{
												vsoitemNSshippedQty = 0;
											}

											if(vConversionRate!=null && vConversionRate!='')
											{
												vsoitemQty=Number(Big(vsoitemQty).div(vConversionRate));
												vsoitemNSReceivedQty=Number(Big(vsoitemNSReceivedQty).div(vConversionRate));
												vsoitemNSshippedQty=Number(Big(vsoitemNSshippedQty).div(vConversionRate));

											}

											var vsoitemRcvQty = Number(Big(vsoitemopentaskQty).plus(vsoitemNSReceivedQty));
											if(vsoitemRcvQty==null || vsoitemRcvQty=='')
												vsoitemRcvQty=0;

											if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
												|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
											{
												var itemRemQty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));
											}
											else
											{
												vsoitemQty=Big(vsoitemQty);
												vsoitemNSshippedQty=Big(vsoitemNSshippedQty);
												vsoitemRcvQty=Big(vsoitemRcvQty);
												var itemRemQty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
											}

											if(vsoitemMultiShipping ==  null || vsoitemMultiShipping =='')
												vsoitemMultiShipping='F';
											if(vsoitemMultiShipping == "F")
											{

												if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
												{	deviceUploadFlag='F';
												SOarray["custparam_error"] ='';

												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
												return;
												}

												else if((parseFloat(itemRemQty)>0))
												{
													deviceUploadFlag='F';
													SOarray["custparam_error"] ='';

													SOarray["custparam_memitemqty"] = request.getParameter('custparam_memitemqty');
													SOarray["custparam_memitempickedqty"] = vsoitemRcvQty;

													response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
													return;
												}
											}
											else
											{

												if(parseFloat(itemRemQty)>0 && vsoitemShipVia == vShipVia)
												{
													vShipCount= parseFloat(vShipCount)+1;
												}
												else if(parseFloat(itemRemQty)>0)
												{
													vLinecount=parseFloat(vLinecount)+1;
												}

											}



										}

										if(deviceUploadFlag=='T' && SOarray["custparam_orderlevel"] =="T" )
										{
											if(mianItemOPenTaskid != null && mianItemOPenTaskid != '' && vStageScanRequired == 'F')
											{	
												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
												loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												nlapiSubmitRecord(loadRec);
												loadRec=null;
											}
											if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
											{
												var resArr = getCustomScriptId(2);
												if(resArr.length > 0)
												{
													SOarray["custparam_error"]='';
													response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
													return;
												}
												else
												{
													SOarray["custparam_error"]="Custom flow not defined for this process";
													response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
													return;
												}
											}
											SOarray["custparam_error"] ='';
											if(vStageScanRequired == "T")
												response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
											else
												response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
											return;
										}
										else if(parseFloat(vShipCount)>0)
										{
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
											return;
										}
										else if(parseFloat(vShipCount)==0)
										{

											if(mianItemOPenTaskid != null && mianItemOPenTaskid != '' && vStageScanRequired == 'F')
											{	
												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
												loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												nlapiSubmitRecord(loadRec);
												loadRec=null;
											}
											if(parseFloat(vLinecount) > 0)
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
												return;
											}
											else
											{
												if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
												{
													var resArr = getCustomScriptId(2);
													if(resArr.length > 0)
													{
														SOarray["custparam_error"]='';
														response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
														return;
													}
													else
													{
														SOarray["custparam_error"]="Custom flow not defined for this process";
														response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
														return;
													}
												}
												SOarray["custparam_error"] ='';
												if(vStageScanRequired == "T")
													response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
												else
													response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
												return;
											}
										}
										else
										{
											if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
											{
												var resArr = getCustomScriptId(2);
												if(resArr.length > 0)
												{
													SOarray["custparam_error"]='';
													response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
													return;
												}
												else
												{
													SOarray["custparam_error"]="Custom flow not defined for this process";
													response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
													return;
												}
											}
											SOarray["custparam_error"] ='';
											if(vStageScanRequired == "T")
												response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
											else
												response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
											return;

										}


										soLineDetails=null;

									}
									else
									{
										if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
										{
											var resArr = getCustomScriptId(2);
											if(resArr.length > 0)
											{
												SOarray["custparam_error"]='';
												response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
												return;
											}
											else
											{
												SOarray["custparam_error"]="Custom flow not defined for this process";
												response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
												return;
											}
										}
										SOarray["custparam_error"] ='';
										if(vStageScanRequired == "T")
											response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
										else
											response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
										return;

									}

								}
								else
								{



									SOarray["custparam_error"] ='';
									response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);
									return;


								}

							}				
							catch(e)
							{
								SOarray["custparam_number"] =0;
								nlapiLogExecution('DEBUG', 'inside catch exception', e);

								if ( e instanceof nlobjError )
								{
									SOarray["custparam_error"]=e.getDetails();
									nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
								}
								else
								{
									SOarray["custparam_error"]=e.toString();
									nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
								}
								var lockfilters=new Array();
								lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',coItemId));
								lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
								lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
								lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
								// Here 4k records fetching not required.
								var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);
								if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
								{
									var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
									nlapiLogExecution('DEBUG','DeleteRecordId', DeleteRecordId);
								}
								response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
								return;
							}
						}
					}
					else
					{
						SOarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
					}
				} 
				else {

					SOarray["custparam_enterQty"] =enterQty;
					SOarray["custparam_enterBin"] =enterBin;
					SOarray["custparam_enteredbin"] =enterBin;					
					SOarray["custparam_enteredBinID"] = binInternalId;

					var lockfilters=new Array();
					lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',coItemId));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
					// Here 4k records fetching not required.
					var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);
					if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
					{
						var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
						nlapiLogExecution('DEBUG','DeleteRecordId', DeleteRecordId);
					}
					SOarray["custparam_error"] = "";
					if(statusScreen != null && statusScreen != '' && statusScreen != 'null' && statusScreen != 'undefined' 
						&& statusScreen != 'undefined' && statusScreen == 'fromstatusscreen')
					{
						//navigate to status scan screen
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts_sng', 'customdeploy_wmsse_kitpkg_selectsts_sng', false, SOarray);
						return; 
					}
					response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan_sng', 'customdeploy_wmsse_kitorpkg_binscan_sng', false, SOarray);
				}
			}
			catch (e) 
			{
				nlapiLogExecution('DEBUG', 'inside catch exception', e);

				if ( e instanceof nlobjError )
				{
					SOarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					SOarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}
				var lockfilters=new Array();
				lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',coItemId));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
				// Here 4k records fetching not required.
				var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);
				if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
				{
					var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
					nlapiLogExecution('DEBUG','DeleteRecordId', DeleteRecordId);
				}
				response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			SOarray["custparam_error"] = 'Transaction is in progress...';
			response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
		}
	} //end of first if condition
} //end of function.
/**
 * To get Order line details of kit item
 * @param sonumber
 * @param trantype
 * @param itemID
 * @param whLocation
 * @returns {nlapiSearchRecord}
 */
//Below function is added in generalfunction 
/*function getSOLineDetailskit(sonumber,trantype,itemID,whLocation,lineid)
{
	nlapiLogExecution('DEBUG', 'sonumber,trantype,whLocation,itemID',sonumber+","+trantype+","+whLocation+","+itemID);

	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', sonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
	{
		if(crossSubsidiaryFeature == true && trantype =="salesorder")
		{
			filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof', ['@NONE@',whLocation]));

		}
		else
		{
			filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',whLocation]));
		}
	}
	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 
	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{
		if(trantype=='transferorder')
			lineid = parseInt(lineid) + 1;
		filters.push(new nlobjSearchFilter('line', null, 'equalto', lineid));
	}
	// Here 4k records fetching not required.
	var SOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_ordline_details_kit', filters, columns);
	columns=null;
	filters=null;
	return SOLineDetails;
}*/
function  fnGetComponentItemDetails(getMainItemInternalId,componentItem,vReqQty)
{
	nlapiLogExecution('DEBUG', 'getMainItemInternalId,componentItem,vReqQty', getMainItemInternalId+","+componentItem+","+vReqQty);
	var filters = new Array(); 

	filters[0] = new nlobjSearchFilter('internalid', null, 'is', getMainItemInternalId);//kit_id is the parameter name 
	filters[1]=new nlobjSearchFilter('isfulfillable', null, 'is', 'T');

	var vActQty=vReqQty;
	// Here 4k records fetching not required.
	var searchresults = nlapiSearchRecord( 'item', 'customsearch_wmsse_itemdetails', filters, null );  

	for(var q=0; searchresults!=null && q<searchresults.length;q++) 
	{

		var vMemItem=searchresults[q].getText('memberitem');
		nlapiLogExecution('DEBUG', 'vMemItem', vMemItem);
		if(componentItem == vMemItem)
		{
			var vMemQty=searchresults[q].getValue('memberquantity');
			if(vMemQty == null || vMemQty == '')
				vMemQty=0;
			//vActQty= parseFloat(vMemQty) * parseFloat(vReqQty);
			vActQty= Number(Big(vMemQty).mul(vReqQty));
			break;
		}


	}
	searchresults=null;	
	filters=null;
	nlapiLogExecution('DEBUG', 'vActQty', vActQty);
	return vActQty;
}
function getOpenTaskDetails(sonumber,lineid)
{


	var filter = new Array();

	filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', sonumber)); 
	filter.push(new nlobjSearchFilter('custrecord_wmsse_kitflag', null, 'is', 'T')); //PICK
	filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
	filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8','28']));
	filter.push(new nlobjSearchFilter('custrecord_wmsse_act_qty', null, 'isempty'));

	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{		
		filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineid));
	}

	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	// Here 4k records fetching not required.
	var opentaskordersearchresultkit = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_picktask_details',filter,null);

	return opentaskordersearchresultkit;
}
