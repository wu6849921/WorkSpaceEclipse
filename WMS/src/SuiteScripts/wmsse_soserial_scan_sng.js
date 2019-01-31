/**
 * Script Description
 * This script is used to scan the Serial for selected item.
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan serial number for picking
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

		//Get the PO# from the previous screen, which is passed as a parameter		
		var getSONo = request.getParameter('custparam_soid');

		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');

		var whCompany= request.getParameter('custparam_company');
		var getSONo = request.getParameter('custparam_soid');
		var getSOItem = request.getParameter('custparam_soitem');

		var getSOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');

		var getItemEnteredQty = request.getParameter('custparam_enterQty');
		var getItemRecQty = request.getParameter('custparam_number');
		if(getItemRecQty==null || getItemRecQty=='' || getItemRecQty=='null')
			getItemRecQty=0;
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var invt_status = request.getParameter('custparam_status');
		var cartonScreenRuleValue=request.getParameter('custparam_cartonscreenrulevalue');
		var carton=request.getParameter('custparam_carton');
		var cartonSize=request.getParameter('custparam_cartonsize');
		var cartonWeight=request.getParameter('custparam_cartonweight');
		var orderLevel=request.getParameter('custparam_orderlevel');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate'); 
		var orderQty=request.getParameter('custparam_orderqty'); 
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		var pickType= request.getParameter('custparam_picktype');
		var vShipVia = request.getParameter('custparam_shipmethod');
		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getSONo. = ' + getSONo + '<br>';
		logmsg = logmsg + 'vShipVia. = ' + vShipVia + '<br>';	
		logmsg = logmsg + 'getSOItem. = ' + getSOItem + '<br>';		
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';						
		nlapiLogExecution('DEBUG', 'Values :', logmsg);
		var vStageScanRequired = request.getParameter('custparam_stagescanrequired');
		var qtyanduoms = request.getParameter('custparam_uomqtyselected');
		var screenName = request.getParameter('custparam_screen');

		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		if(vConversionRate == '- None -' || vConversionRate == '' || vConversionRate == null)
			vConversionRate =1;

		getItemEnteredQty=new Big(getItemEnteredQty);
		vConversionRate=new Big(vConversionRate);
		getItemRecQty=new Big(getItemRecQty);
		var getItemRemQty = Number((getItemEnteredQty.mul(vConversionRate)).minus(getItemRecQty));
		nlapiLogExecution('DEBUG', 'getItemRemQty', getItemRemQty);

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		// This search returns required results, 4k records fetching not required.
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		if(itemresults!=null && itemresults!='')
		{
			getSOItem = itemresults[0].getValue('itemid');
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


		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		nlapiLogExecution('DEBUG', 'getItemRemQty :  getItemRecQty', getItemRemQty + " : " + getItemRecQty);

		var getPreferBin=request.getParameter('custparam_preferbin');
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;

		if(getNumber == null || getNumber == '' || parseInt(getNumber)==0)
		{
			var filterssertemp1 = new Array();
			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', getSOLineNo);
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', getSOInternalId);
			// This search returns required results, 4k records fetching not required.
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
			filterssertemp1=null;
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
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
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
		"				<input type='hidden' name='hdnSoItem' value='" + getSOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdncartonScreenRuleValue' value=" + cartonScreenRuleValue + ">"+
		"				<input type='hidden' name='hdncarton' value=" + carton + ">"+
		"				<input type='hidden' name='hdncartonSize' value=" + cartonSize + ">"+
		"				<input type='hidden' name='hdncartonWeight' value=" + cartonWeight + ">"+
		"				<input type='hidden' name='hdnorderLevel' value=" + orderLevel + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnorderQty' id='hdnorderQty' value=" + orderQty + ">"+
		"               <input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnPickType' value='" +pickType+"'>"+
		"				<input type='hidden' name='hdnShipVia' id='hdnShipVia' value='" +vShipVia+"'>"+
		"				<input type='hidden' name='hdnvStageScanRequired' value='" +vStageScanRequired+"'>"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnstatus' value='" +invt_status+"'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' value="+qtyanduoms+" >"+
		"				<input type='hidden' name='hdnstatusscreen' value='" +screenName+"'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getSOItem  + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + (parseFloat(getItemRecQty)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + (parseFloat(getItemRemQty)) + "</label>"+
		"			</tr>";
		// Inventory status feature is enabled
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

				if(inventoryStatusLst !=null && inventoryStatusLst !='' && inventoryStatusLst.length > 0)
				{
					vInventoryStatus = inventoryStatusLst[0][0];
				}
			}
			html =html+ "			<tr>"+
			"			<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
			"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + vInventoryStatus + "'>"+	
			"			</tr>";

		}

		html =html+ "				<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (Number(getNumber) + 1) + " OF <label>" + (Number(Big(request.getParameter('custparam_enterQty')).mul(vConversionRate))) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";

		html = html + "				<td align = 'left'><input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>";

		html = html + "				</td>"+
		"			</tr><tr><td></td></tr></table>"+
		"		<table>	<tr>";
		html = html +"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Pick (Ent)' onclick='return validateForm();'/></td></tr>";
		//"					<input name='cmdReceiveFulls' type='submit' value='RECEIVE FULL'/>"+
		//if((orderLevel=="T") && ((parseFloat(getNumber) + 1)==(parseFloat(getItemRemQty) * parseFloat(vConversionRate))))
		if((orderLevel=="T") && ((Number(getNumber) + 1)==(Number(Big(request.getParameter('custparam_enterQty')).mul(vConversionRate)))))
		{
			html = html +"	<tr><td>	<input name='cmdClose' type='submit' value='Pick & Close' onclick='return validateForm();'/></td>";
			if(vStageScanRequired == "T")
			{
				html = html +"	<td width='20px'></td><td><input name='cmdStage' style='width:100px;' type='submit' value='Pick & Stage' onclick='return validateForm();'/></td></tr>";
			}
			else
			{
				html = html +"				<td colspan='2'></td></tr>";
			}
		}
		else
		{
			if(vStageScanRequired == "T" && ((parseFloat(getNumber) + 1)==(Number(Big(request.getParameter('custparam_enterQty')).mul(vConversionRate)))))
			{
				html = html +"	<tr><td>	<input name='cmdStage' type='submit' value='Pick & Stage' onclick='return validateForm();'/></td><td colspan='2'></td></tr>";
			}
		}



		html = html +	" </table>";
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
		html=html+"</body>"+
		"</html>";

		response.write(html);
	}
	else {


		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var getSerialNo=(request.getParameter('txtserial')).trim();
		var getPickreportid=request.getParameter('hdnPickReportId');
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_shipmethod"] = request.getParameter('hdnShipVia');
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
		//SOarray["custparam_soitem"] = request.getParameter('hdnSoItem');
		SOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		SOarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		SOarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		SOarray["custparam_enterBin"] = request.getParameter('hdnenterBin');
		SOarray["custparam_cartonscreenrulevalue"]=request.getParameter('hdncartonScreenRuleValue');
		SOarray["custparam_carton"] =request.getParameter('hdncarton');
		SOarray["custparam_cartonsize"] =request.getParameter('hdncartonSize');
		SOarray["custparam_cartonweight"] =request.getParameter('hdncartonWeight');
		SOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_pickreportid"] =getPickreportid;
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		SOarray["custparam_uom"] = request.getParameter('hdnuom');
		SOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		SOarray["custparam_orderqty"] = request.getParameter('hdnorderQty');
		if(SOarray["custparam_orderqty"] == null || SOarray["custparam_orderqty"] == '')
			SOarray["custparam_orderqty"]=0;
		SOarray["custparam_stagescanrequired"] = request.getParameter('hdnvStageScanRequired');
		SOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		var pickType = request.getParameter('hdnPickType');
		var vConversionRate = request.getParameter('hdnvConversionRate');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var trantype=request.getParameter('hdntrantype');
		//var remQty=request.getParameter('hdnItemRemQty');
		var remQty=request.getParameter('hdnenterQty');
		var soInternalId=request.getParameter('hdnSoInternalId');
		var recQty=request.getParameter('hdnItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var soLineno=request.getParameter('hdnSoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		var status=request.getParameter('hdnstatus');
		SOarray["custparam_status"] =status;
		nlapiLogExecution('DEBUG', 'status', status);
		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var getNumber=parseFloat(request.getParameter('hdnNumber'));
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);		
		var statusScreen = request.getParameter('hdnstatusscreen');
		SOarray["custparam_screen"]=statusScreen;	
		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);



		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'soInternalId = ' + soInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'soLineno = ' + soLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'vConversionRate = ' + vConversionRate + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		nlapiLogExecution('DEBUG', 'Processing RF - Serial', logMsg);
		if (sessionobj!=context.getUser()) 
		{
			try
			{


				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				var binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){

					if(getSerialNo!=null && getSerialNo!="" && getSerialNo!='null')
					{


						/*var vAdvBinManagement=false;

						var ctx = nlapiGetContext();
						if(ctx != null && ctx != '')
						{
							if(ctx.getFeature('advbinseriallotmgmt').toString() != null && ctx.getFeature('advbinseriallotmgmt').toString() != '')
								vAdvBinManagement=ctx.getFeature('advbinseriallotmgmt');
							nlapiLogExecution('ERROR', 'vAdvBinManagement_if', vAdvBinManagement);
						}*/
						var objBinDetails=null;
						//Inventorystatus Feature is enabled
						if(inventoryStatusFeature ==true)
						{
							var getSerialNoId = inventoryNumberInternalId(getSerialNo,SOarray["custparam_whlocation"],FetchedItemId);

							var filterStrat = new Array();
							var binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);
							if(binInternalId != null && binInternalId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber',null,'anyof', binInternalId));
							filterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));							
							filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', SOarray["custparam_whlocation"]));
							if(getSerialNoId != null && getSerialNoId != '' && getSerialNoId != 'null')
								filterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', getSerialNoId));
							if(status != null && status != '' && status != 'null' && status != 'undefined' && status != undefined)
								filterStrat.push(new nlobjSearchFilter('status', null, 'anyof', status));							
							//Load search is not required as we will get only one record for serial#
							objBinDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterStrat, null);
							nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails);
							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									var serial_matchfound='F';                 
									for(var vbinItr =0; vbinItr<objBinDetails.length; vbinItr++)
									{
										var availableQty=objBinDetails[vbinItr].getValue('available',null,'sum');
										var vinventorynumber=objBinDetails[vbinItr].getText('inventorynumber',null,'group');

										if((vinventorynumber == getSerialNo) && (availableQty>0))
										{
											serial_matchfound='T';
											break;
										}

									}
									if(serial_matchfound =='F')
									{
										SOarray["custparam_error"] = 'Serial#: '+ getSerialNo + ' is not available';
										response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
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
							var binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);
							if(binInternalId != null && binInternalId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
							filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
							filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', SOarray["custparam_whlocation"]));
							filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

							var columnStrat=new Array();
							columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
							columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
							columnStrat[0].setSort(true);
							// This search returns required results, 4k records fetching not required.
							var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

							if(objBinDetails!=null && objBinDetails!='')
							{

								if(objBinDetails.length>0)
								{
									var availableQty=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
									var vinventorynumber=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');

									if((vinventorynumber != getSerialNo)|| (availableQty ==0))
									{
										SOarray["custparam_error"] = 'Serial#: '+ getSerialNo + ' is not available';
										response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
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
							SOarray["custparam_error"] = 'Serial#: '+ getSerialNo + ' is not available';
							response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
							return;
						}
						objBinDetails=null;

						nlapiLogExecution('ERROR', 'request.getParameter(custparam_serialno) before', request.getParameter('custparam_serialno'));
						nlapiLogExecution('ERROR', 'INTO SERIAL ENTRY');
						//checking serial no's in already scanned one's from temp table
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 3));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', FetchedItemId));
						// This search returns required results, 4k records fetching not required.
						var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp,null);

						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{
							var vSerialOrder = SrchRecordTmpSerial[0].getText('custrecord_wmsse_ser_ordno');
							SOarray["custparam_error"] = "Serial# already scanned for "+vSerialOrder;
							response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
							SrchRecordTmpSerial=null;
							return;
						}								
						else 
						{
							var filterssertemp1 = new Array();
							filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', FetchedItemId);
							filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', binInternalId);
							filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [8,28]);//PACKING COMPLETED
							filterssertemp1[3] = new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', 3);//PICK
							filterssertemp1[4] = new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@']); // NS REF no is empty

							// This search returns required results, 4k records fetching not required.
							var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskdetails_srh', filterssertemp1,null);

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
										response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
										SrchRecordTmpSerial1=null;
										return;
									}
								}
							}
						}


						SOarray["custparam_serialno"] = getSerialNo;

						SOarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
						//Here we are creating serial# into new Temp Serial entry custom record

						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
						itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] !='' && SOarray["custparam_whlocation"] != 'null')
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',SOarray["custparam_whlocation"]]));
						}
						// This search returns required results, 4k records fetching not required.
						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);							

						if(itemresults == null || itemresults == '' || itemresults == 'null')
						{
							SOarray["custparam_error"] = 'Entered item is inactive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
							return;
						}



						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', getSerialNo);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordno', soInternalId);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordline', soLineno);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', FetchedItemId);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
						customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 3);
						var rec = nlapiSubmitRecord(customrecord, false, true);
						customrecord=null;

						if ((Number(getNumber) + 1) < (Number(Big(remQty).mul(vConversionRate)))) {

							SOarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
							return;

						}
						else
						{
							try{

								var binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);


								var soLineItemDetails = getSOLineDetailsItemandqty(SOarray["custparam_sointernalid"],trantype,
										FetchedItemId,SOarray["custparam_whlocation"],soLineno);


								var vMultiShipping='F';
								var vShipVia='';
								//To fetch Line level multi shipping flag and ship via validation
								if(soLineItemDetails !=null && soLineItemDetails!="")
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
									for(var z=0;z<soLineItemDetails.length;z++)
									{
										var vsoLine = soLineItemDetails[z].getValue('line',null,'group');
										var vsoitem = soLineItemDetails[z].getText('item',null,'group');										
										var vsoitemId = soLineItemDetails[z].getValue('item',null,'group');		
										var vsoitemQty=soLineItemDetails[z].getValue(vColumnslist[commitedQtyIndex]);
										var vsoitemfulfillQty=soLineItemDetails[z].getValue(vColumnslist[fulfilledQtyIndex]);
										if(trantype == 'transferorder' && vsoLine != null)//adding because of TO line number getting 2 value
											vsoLine = parseInt(vsoLine)-1;
										var vsoitemopentaskQty=getopentaskDetailsforItem(SOarray["custparam_sointernalid"],vsoLine,vsoitemId,
												SOarray["custparam_whlocation"]);	
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


										vsoitemopentaskQty=new Big(vsoitemopentaskQty);
										vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
										vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
										var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty.minus(vsoitemErpConfirmedQty))));
										nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);


										if(vsoitemRcvQty==null || vsoitemRcvQty=='')
											vsoitemRcvQty=0;
										if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
											vsoitemfulfillQty=0;


										vsoitemQty=new Big(vsoitemQty);
										vsoitemfulfillQty=new Big(vsoitemfulfillQty);
										vsoitemRcvQty=new Big(vsoitemRcvQty);
										vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
										nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);

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

								var taskType="PICK";
								if(request.getParameter('cmdClose') == 'Pick & Close')
								{
									if(parseFloat(vSoreminqty) > 0)
									{
										// added inventory status as a parameter to opentask creation funtion
										if(vStageScanRequired == "F")
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
													'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
													'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
													ordType,department,vclass,'','',status);
										else
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
													'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
													'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
													ordType,department,vclass,'','',status);
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
												response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
												return;
											}
										}
										SOarray["custparam_error"] ='';	
										SOarray["custparam_closebtn"] = 'Pick&Close';
										if(vStageScanRequired == "F")
											response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
										else
											response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
										return;
									}
								}

								var isItLastPick='F';
								if(parseFloat(vSoreminqty) > 0)
								{  
									
									if(vStageScanRequired == "F")
									{
									//var soLineDetails = getSOLineDetailsItem(soInternalId,trantype,null,SOarray["custparam_whlocation"]);
									var soLineDetails=getSOqtyscandetails(soInternalId,trantype,SOarray["custparam_whlocation"]);

									if(soLineDetails !=null && soLineDetails!="" && vStageScanRequired == "F")
									{
										var vLinecount=0;

										if(soLineDetails.length>0)
										{

											var vColumnslist=soLineDetails[0].getAllColumns();
											var custIndex = 12;
											var commitedQtyIndex = 25;
											var fulfilledQtyIndex = 26;
											var conversionRateIndex=27;
											var totalPickedQtyIndex =7;
											var unitsIndex = 24;
											var totalNSPickedQtyIndex =37;
											var ERPConfirmedQty =38;
											
											var vOpentaskdetails = getPickedqtydetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
											for(var f=0;f<soLineDetails.length;f++)
											{

												var vsoitem = soLineDetails[f].getText('item');
												var vsoitemId = soLineDetails[f].getValue('item');
												var vsoitemType=soLineDetails[f].getValue('type','item');

												if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
													|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
												{
													var vsoitemQty=soLineDetails[f].getValue('quantity');
												}
												else
												{
													var vsoitemQty=soLineDetails[f].getValue('quantitycommitted');
												}

												var vsoitemfulfillQty=soLineDetails[f].getValue('quantitypicked');				

												var vsoitemNSReceivedQty=soLineDetails[f].getValue('quantitypicked');
												var vsoitemNSshippedQty=soLineDetails[f].getValue('quantityshiprecv');
												var vsoitemMultiShipping = soLineDetails[f].getValue('ismultishipto');
												var vsoitemShipVia = soLineDetails[f].getValue('shipmethod');

												var vsoitemLine = soLineDetails[f].getValue('line');					
												var vUnitsText = soLineDetails[f].getValue('unit');
												var vConversionRate = soLineDetails[f].getValue('formulanumeric');

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
													var vsoitemRemQty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));
												}
												else
												{
													vsoitemQty=Big(vsoitemQty);
													vsoitemNSshippedQty=Big(vsoitemNSshippedQty);
													vsoitemRcvQty=Big(vsoitemRcvQty);
													
													var vsoitemRemQty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
												}
												if(vsoitemMultiShipping ==  null || vsoitemMultiShipping =='')
													vsoitemMultiShipping='F';
												if(vsoitemMultiShipping == "F")
												{
													if(parseFloat(vsoitemRemQty)>0)
													{
														vLinecount=parseFloat(vLinecount)+1;
													}
													if(trantype=='transferorder')
														vsoitemLine=parseFloat(vsoitemLine)-1;
													if(vsoitemLine==SOarray["custparam_lineno"])
													{

														//enterQty = parseFloat(parseFloat(enterQty).toFixed(5));
														//vsoitemRemQty = parseFloat(parseFloat(vsoitemRemQty).toFixed(5));


														var totalQty=Number(Big(vsoitemRemQty).minus(enterQty));
														nlapiLogExecution('DEBUG', 'totalQty', totalQty);

														if(parseFloat(totalQty)> 0)
														{
															vLinecount=parseFloat(vLinecount)+1;
														}

													}
												}
												else
												{

													if(parseFloat(vsoitemRemQty)>0 && vsoitemShipVia == vShipVia)
													{
														vLinecount=parseFloat(vLinecount)+1;
													}
													if(trantype=='transferorder')
														vsoitemLine=parseFloat(vsoitemLine)-1;
													if(vsoitemLine==SOarray["custparam_lineno"] && vsoitemShipVia == vShipVia)
													{

														//enterQty = parseFloat(parseFloat(enterQty).toFixed(5));
														//vsoitemRemQty = parseFloat(parseFloat(vsoitemRemQty).toFixed(5));


														var totalQty=Number(Big(vsoitemRemQty).minus(enterQty));
														nlapiLogExecution('DEBUG', 'totalQty', totalQty);
														if(parseFloat(totalQty)> 0)
														{
															vLinecount=parseFloat(vLinecount)+1;
														}

													}
												}



											}
											if(parseFloat(vLinecount)>1)
											{
												isItLastPick="F";
											}
											else
											{
												isItLastPick="T";
											}
										}

									}
								}
									soLineDetails=null;
									nlapiLogExecution('DEBUG', 'isItLastPick', isItLastPick);

									// To post IF when order level is true and lastpick is true for already packed containers against order
									if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T")
									{
										var filtersPack = new Array();
										filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));
										filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
										filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));
										filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['14']));
										filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'isnotempty'));
										// This search returns required results, 4k records fetching not required.
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
										if(vStageScanRequired == "F")
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),ordType,department,vclass,'','',status);
										else
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),ordType,department,vclass,'','',status);
									}
									else
									{
										if(SOarray["custparam_orderlevel"] =="T")
										{
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],'F',trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),ordType,department,vclass,'','',status);
										}
										else
										{
											if(vStageScanRequired == "F")
												var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,
														itemType,SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,taskType,
														SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],"T",
														trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',
														SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
														ordType,department,vclass,'','',status);
											else
												var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,
														SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,taskType,
														SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],"F",
														trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',
														SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
														ordType,department,vclass,'','',status);
										}
									}
								}
								//soLineDetails = getSOLineDetailsItem(soInternalId,trantype,null,SOarray["custparam_whlocation"]);
								soLineDetails = getSOqtyscandetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
								
								var cmdStage = request.getParameter('cmdStage');

								if(soLineDetails !=null && soLineDetails!="" && cmdStage != 'Pick & Stage')
								{

									if(soLineDetails.length>0)
									{

										var vColumnslist=soLineDetails[0].getAllColumns();
										var custIndex = 12;
										var commitedQtyIndex = 25;
										var fulfilledQtyIndex = 26;
										var conversionRateIndex=27;
										var totalPickedQtyIndex =7;
										var unitsIndex = 24;
										var totalNSPickedQtyIndex =37;
										var ERPConfirmedQty =38;
										
										var vOpentaskdetails = getPickedqtydetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
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


											if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
											{	
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
												return;
											} 
											else if((parseFloat(itemRemQty)>0))
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
												return;
											}


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
												response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
												return;
											}
										}
										SOarray["custparam_error"] ='';
										if(vStageScanRequired == "F")
											response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
										else
											response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
										return;
									}
									else
									{
										SOarray["custparam_error"] ='';
										if(vStageScanRequired == "F")
											response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
										else
											response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);										
										return; 

									}
								}
								else
								{
									SOarray["custparam_error"] ='';
									if(vStageScanRequired == "F")
										response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
									else
										response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
									return;
								}
							}				
							catch(e)
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

								lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',FetchedItemId));
								lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
								lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
								lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
								// This search returns required results, 4k records fetching not required.
								var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

								if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
								{
									var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
									nlapiLogExecution('DEBUG','DeleteRecordId', DeleteRecordId);
								}

								response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
								return;
							}
						}
					}
					else
					{
						SOarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
					}
				} 
				else {
					SOarray["custparam_error"] = "";
					SOarray["custparam_enterQty"] =enterQty;
					SOarray["custparam_enterBin"] =enterBin;
					SOarray["custparam_enteredbin"] =enterBin;
					SOarray["custparam_enteredqty"] =enterQty;	
					SOarray["custparam_enteredBinID"] = binInternalId;

					var lockfilters=new Array();

					lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',FetchedItemId));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
					// This search returns required results, 4k records fetching not required.
					var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

					if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
					{
						var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
						nlapiLogExecution('ERROR','DeleteRecordId', DeleteRecordId);
					}

					if(statusScreen != null && statusScreen != '' && statusScreen != 'null' && statusScreen != 'undefined' 
						&& statusScreen != 'undefined' && statusScreen == 'fromstatusscreen')
					{

						response.sendRedirect('SUITELET', 'customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
						return;
					}

					response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
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
				response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			SOarray["custparam_error"] ='';
			if(vStageScanRequired == "F")
				response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
			else
				response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
			return;
		}
	} //end of first if condition
} //end of function.


