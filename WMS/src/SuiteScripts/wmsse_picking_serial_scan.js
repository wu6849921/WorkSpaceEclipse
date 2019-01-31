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
function PIckingSerial(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		// Variable Declaration
		var html = '';

		//Get the PO# from the previous screen, which is passed as a parameter		
		var getSONo = request.getParameter('custparam_soid');
		var enteredBin=request.getParameter('custparam_enterbin');
		var enteredItem=request.getParameter('custparam_enteritem');
		var enteredBinId=request.getParameter('custparam_enterbinid');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whlocation = request.getParameter('custparam_whlocation');
		var enterOrder=request.getParameter('custparam_enterorder');
		var enterQty = request.getParameter("custparam_enterqty");
		var trantype = request.getParameter('custparam_trantype');
		//var getItemRemQty = request.getParameter('custparam_enterqty');
		var getItemEnteredQty = request.getParameter('custparam_enterqty');
		var getItemRecQty = request.getParameter('custparam_number');
		var soId = request.getParameter('custparam_soId');
		var soLineno = request.getParameter('custparam_solineno');
		var customer = request.getParameter('custparam_customer');
		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var qtyToPick=request.getParameter('custparam_itemremainingqty');
		var binQty=request.getParameter('custparam_itembinqty');
		var item=request.getParameter('custparam_item');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var vUnitsText=request.getParameter('custparam_unitstext');
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate'); 
		var parentSkuType = request.getParameter('custparam_parentSkuType');
		var parentSku = request.getParameter('custparam_parentSku');
		var getmemitemqty = request.getParameter('custparam_memitemqty'); 
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		var qtyanduoms = request.getParameter('custparam_uomqtyselected');
		var invt_status = request.getParameter('custparam_inventorystatus');
		var fromScreen = request.getParameter('custparam_fromscreen');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		if(vUnitsText == null || vUnitsText =='' || vUnitsText =='- None -')
			vUnitsText='';
		if(vConversionRate == '- None -' || vConversionRate == '' || vConversionRate == null)
			vConversionRate =1;
		if(getItemRecQty==null || getItemRecQty=='' || getItemRecQty=='null')
			getItemRecQty=0;


		getItemEnteredQty=new Big(getItemEnteredQty);
		vConversionRate=new Big(vConversionRate);
		getItemRecQty=new Big(getItemRecQty);
		var getItemRemQty = Number((getItemEnteredQty.mul(vConversionRate)).minus(getItemRecQty));


		nlapiLogExecution('DEBUG', 'getItemRemQty in Big', getItemRemQty);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "SO/TO";
		var domainName = fndomainName();
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
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',enteredItem));
		if(whlocation != null && whlocation !='' && whlocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whlocation]));
		}
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
		if(itemresults!=null && itemresults!='')
		{
			item = itemresults[0].getValue('itemid');
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('DEBUG', 'getItemRemQty :  getItemRecQty', getItemRemQty + " : " + getItemRecQty);
		
		var getPreferBin=request.getParameter('custparam_preferbin');
		if(getNumber==null || getNumber=='' || getNumber=='null' || getNumber=='undefined')
			getNumber=0;
		nlapiLogExecution('DEBUG', 'getNumber', getNumber);
		if(getNumber == null || getNumber == '' || parseInt(getNumber)==0)
		{
			var logMsg1 = 'soId =' + soId + '<br>';
			logMsg1 = logMsg1 + 'soLineno = ' + soLineno + '<br>';
			nlapiLogExecution('DEBUG', 'parameters of line#t', logMsg1);

			var filterssertemp1 = new Array();
			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', soLineno);
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', soId);
			var columnssertemp1 = new Array();
			//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			//columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp1,columnssertemp1);
			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
			{	
				nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial1', SrchRecordTmpSerial1);
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];
					nlapiLogExecution('DEBUG', 'TempRecord.getId()',TempRecord.getId());
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of discontinue of serial number scanning we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
				}

			}
			columnssertemp1=null;
			filterssertemp1=null;
			SrchRecordTmpSerial1=null;
		}

		var vStageScanRequired="F"; 

		vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',whlocation,'2');		

		if(vStageScanRequired!=null && vStageScanRequired!='')
		{ 
			vStageScanRequired="T";			 
		}
		else
		{
			vStageScanRequired="F";
		}

		nlapiLogExecution('DEBUG','vStageScanRequired', vStageScanRequired);
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
		//Refresh Functionality starts
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

		html = html +"<script type='text/javascript'>function validateForm() { var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtserial').value; var vSerialWhiteSpace = lotVal.indexOf(' ') >= 0; if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;} else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}}}</script>";
		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+	
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+
		"		<table>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + enterOrder + "</label>"+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnEnteredBin' value=" + enteredBin + ">"+
		"				<input type='hidden' name='hdnEnteredItem' value=" + enteredItem + ">"+
		"				<input type='hidden' name='hdnEnteredBinId' value=" + enteredBinId + ">"+
		"				<input type='hidden' name='hdnenteredorder' value=" + enterOrder + ">"+
		"				<input type='hidden' name='hdnenterqty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdnsoId' value=" + soId + ">"+	
		"				<input type='hidden' name='hdnsoLineno' value=" + soLineno + ">"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+	
		"				<input type='hidden' name='hdnitem' value='" + item + "'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value='" + whlocation + "'>"+
		"				<input type='hidden' name='hdnQtyToPick' id='hdnQtyToPick' value=" + qtyToPick + ">"+
		"				<input type='hidden' name='hdnbinRemainingQty' id='hdnbinRemainingQty' value='" + binQty + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnitsText + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnvparentSkuType' id='hdnvparentSkuType' value=" + parentSkuType + ">"+
		"				<input type='hidden' name='hdnvparentSku' id='hdnvparentSku' value=" + parentSku + ">"+
		"				<input type='hidden' name='hdnvMemitemqty' id='hdnvMemitemqty' value=" + getmemitemqty + ">"+
		"               <input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnvStageScanRequired' value='" +vStageScanRequired+"'>"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' value="+qtyanduoms+" >"+
		"				<input type='hidden' name='hdnstatus' value='" +invt_status+"'>"+
		"				<input type='hidden' name='hdnscreenname' value='" +fromScreen+"'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + item + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enteredBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + (parseFloat(getItemRecQty)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + (parseFloat(getItemRemQty)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (Number(getNumber) + 1) + " OF <label>" + (Number(Big(request.getParameter('custparam_enterqty')) .mul(vConversionRate))) + "</label>"+
		"			</tr>";
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


		html = html+"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";
		html = html + "<td align = 'left'><input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>";

		html = html + "				</td>"+
		"			</tr></table>"+
		"		<table>	<tr>";
		html = html +"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width=40px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Pick (Ent)' onclick='return validateForm();'/></td>";
		"			</tr>";
		if ((Number(getNumber) + 1) == (Number(Big(request.getParameter('custparam_enterqty')).mul(vConversionRate))))
		{

			html = html +" <tr><td><input name='cmdSend' type='submit' value='New Order' onclick='return validateForm();'/></td>";
			if(vStageScanRequired == "T" && parentSkuType !='kititem')
			{
				html = html +"<td width='40px'></td><td><input name='cmdStage' style='width:100px;' type='submit' value='Pick & Stage' onclick='return validateForm();'/></td></tr>";
			}
			else
			{
				html = html +"</tr>";	
			}
		}
		html = html +"				</table>";
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
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var invtStatus= request.getParameter('hdnInvtStatus');

		var getSerialNo=(request.getParameter('txtserial')).trim();
		var soInternalId = request.getParameter('hdnsoId');
		var soLineno = request.getParameter('hdnsoLineno');
		var trantype = request.getParameter('hdntrantype');
		var FetchedItemId = request.getParameter('hdnEnteredItem');
		var enterQty = request.getParameter('hdnenterqty');
		var getNumber = request.getParameter('hdnNumber');
		var remQty = request.getParameter('hdnenterqty');
		var customer =request.getParameter('hdnCustomer');
		var parentSkutype = request.getParameter('hdnvparentSkuType');
		var parentSku = request.getParameter('hdnvparentSku');
		var binInternalId=request.getParameter('hdnEnteredBinId');
		SOarray["custparam_language"] = getLanguage;
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_ordtype"] =ordType;
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		var fromscreen = request.getParameter('hdnscreenname');
		SOarray["custparam_fromscreen"]=fromscreen;
		SOarray["custparam_inventorystatus"]=invtStatus;
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_enterbin"] = request.getParameter('hdnEnteredBin');
		SOarray["custparam_enterbinid"] = request.getParameter('hdnEnteredBinId');
		SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
		SOarray["custparam_enterorder"] =request.getParameter('hdnenteredorder');
		SOarray["custparam_enterqty"] =request.getParameter('hdnenterqty');
		SOarray["custparam_trantype"] =request.getParameter('hdntrantype');
		SOarray["custparam_soId"] =request.getParameter('hdnsoId');
		SOarray["custparam_solineno"] =request.getParameter('hdnsoLineno');
		SOarray["custparam_customer"]=request.getParameter('hdnCustomer');
		SOarray["custparam_itembinqty"] = request.getParameter('hdnbinRemainingQty');
		SOarray["custparam_itemremainingqty"] = request.getParameter('hdnQtyToPick');
		SOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var getPickreportid=request.getParameter('hdnPickReportId');

		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		SOarray["custparam_unitstext"] = request.getParameter('hdnuom');
		SOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		SOarray["custparam_parentSkuType"] =parentSkutype;
		SOarray["custparam_parentSku"]=parentSku;
		SOarray["custparam_memitemqty"]=request.getParameter('hdnvMemitemqty');
		SOarray["custparam_number"] = request.getParameter('hdnNumber');
		var vConversionRate = request.getParameter('hdnvConversionRate');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		SOarray["custparam_pickreportid"] =getPickreportid;
		var optedEvent = request.getParameter('cmdPrevious');
		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');
			
		
		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' +request.getParameter('hdnenterqty') + '<br>';
		logMsg = logMsg + 'enterBin = ' + request.getParameter('hdnEnteredBin') + '<br>';
		logMsg = logMsg + 'trantype = ' + request.getParameter('hdntrantype') + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + request.getParameter('hdnEnteredItem') + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		nlapiLogExecution('DEBUG', 'Processing RF - Serial', logMsg);
		
		
		if (sessionobj!=context.getUser()) 
		{
			try
			{

				var inventoryStatusFeature = isInvStatusFeatureEnabled();
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){

					if(getSerialNo!=null && getSerialNo!="" && getSerialNo!='null')
					{

						var logMsg1 = 'getSerialNo =' + getSerialNo + '<br>';
						logMsg1 = logMsg1 + 'trantype = ' + trantype + '<br>';
						logMsg1 = logMsg1 + 'soInternalId = ' + soInternalId + '<br>';
						logMsg1 = logMsg1 + 'soLineno = ' + soLineno + '<br>';
						nlapiLogExecution('DEBUG', 'parameters of post', logMsg1);

						
						var objBinDetails = null;
						if(inventoryStatusFeature == true)
						{
							var getSerialNoId = inventoryNumberInternalId(getSerialNo,SOarray["custparam_whlocation"],FetchedItemId);

							var filterStrat = new Array();
							if(binInternalId != null && binInternalId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber',null,'anyof', binInternalId));
							filterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
							filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', SOarray["custparam_whlocation"]));
							if(getSerialNoId != null && getSerialNoId != '' && getSerialNoId != 'null')
								filterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', getSerialNoId));
							filterStrat.push(new nlobjSearchFilter('status', null, 'anyof', invtStatus));

							//load search not required here this search is for validation purpose.
							objBinDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterStrat, null);
							nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails);
							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									var serial_matchfound='F';
									for(var i =0; i<objBinDetails.length; i++)
									{
										var availableQty=objBinDetails[i].getValue('available',null,'group');
										var vinventorynumber=objBinDetails[i].getText('inventorynumber',null,'group');
										nlapiLogExecution('DEBUG', 'enterQty,availableQt,vinventorynumber', enterQty+","+availableQty+","+vinventorynumber);
										if(vinventorynumber == getSerialNo)
										{
											serial_matchfound='T';
											break;
										}

									}
									if(serial_matchfound =='F')
									{
										SOarray["custparam_error"] = 'Serial#: '+ getSerialNo + ' is not available';
										response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan',
												'customdeploy_wmsse_multiord_serialscan', false, SOarray);
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
							filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
							filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', SOarray["custparam_whlocation"]));
							filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

							var columnStrat=new Array();
							columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
							columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
							columnStrat[0].setSort(true);

							//var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_getinv_bin_recv_lot',filterStrat, columnStrat);
							var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									var availableQty=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
									var vinventorynumber=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');
									nlapiLogExecution('DEBUG', 'enterQty,availableQt,vinventorynumber', enterQty+","+availableQty+","+vinventorynumber);
									if(vinventorynumber != getSerialNo)
									{
										SOarray["custparam_error"] = 'Serial#'+ getSerialNo + 'is not available';
										response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
										return;
									}


								}
								else
								{
									objBinDetails='';
								}
							}
							if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' ||objBinDetails.length < 1)
							{
								SOarray["custparam_error"] = 'Serial#'+ getSerialNo +'is not available';
								response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
								return;
							}
							objBinDetails=null;		
						}
						nlapiLogExecution('DEBUG', 'request.getParameter(custparam_serialno) before', request.getParameter('custparam_serialno'));


						nlapiLogExecution('DEBUG', 'INTO SERIAL ENTRY');
						//checking serial no's in already scanned one's from temp table
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 3));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', FetchedItemId));

						var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp);
						nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{

							SOarray["custparam_error"] = "Serial# already scanned";
							response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
							SrchRecordTmpSerial=null;
							return;
						}	
						else 
						{
													
							var SrchRecordTmpSerial1 = new Array()
							var SrchRecordTmpSerial1results = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh');
																		
							SrchRecordTmpSerial1results.addFilter(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', FetchedItemId));
							if(binInternalId != null && binInternalId != '')
								SrchRecordTmpSerial1results.addFilter(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', binInternalId));
							SrchRecordTmpSerial1results.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [8,28]));//PACKING COMPLETED
							SrchRecordTmpSerial1results.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', 3));//PICK
							SrchRecordTmpSerial1results.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); // NS REF no is empty
							
							var resLenDetails = SrchRecordTmpSerial1results.runSearch();
							
							
							var resultsPage = resLenDetails.getResults(0, 1000);
							var offset = 0;
							while (!!resultsPage && resultsPage.length > 0) 
							{
								SrchRecordTmpSerial1 = SrchRecordTmpSerial1.concat(resultsPage);
								offset += 1000;
								resultsPage = resLenDetails.getResults(offset, offset + 1000);
							}
							
							
							nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial1',SrchRecordTmpSerial1);
							if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
							{
								nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial1.length',SrchRecordTmpSerial1.length);
								//trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);
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
								nlapiLogExecution('DEBUG', 'totalSerialArray',totalSerialArray);
								for (var k = 0; k < totalSerialArray.length; k++) {
									if(getSerialNo == totalSerialArray[k])
									{
										SOarray["custparam_error"] = "Scanned serial# is already picked";
										response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
										SrchRecordTmpSerial1=null;
										return;
									}
								}
							}
						}


						SOarray["custparam_serialno"] = getSerialNo;

						SOarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;

						//Here we are creating serial# into new Temp Serial entry custom record

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
						nlapiLogExecution('DEBUG', '(getNumber + 1)', (parseInt(getNumber) + 1));
						nlapiLogExecution('DEBUG', 'remQty', remQty);
						//if ((parseInt(getNumber) + 1) < parseInt(remQty)) {
						if ((Number(getNumber) + 1) < (Number(Big(remQty).mul(vConversionRate)))) {
							nlapiLogExecution('DEBUG', 'Scanning Serial No.');
							SOarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
							return;

						}
						else
						{
							try{
								var logMsg1 = 'parentSkutype =' + parentSkutype + '<br>';
								logMsg1 = logMsg1 + 'parentSku = ' + parentSku + '<br>';
								nlapiLogExecution('DEBUG', 'parameters of sku', logMsg1);
								
								if(parentSkutype != null && parentSkutype != '' && parentSkutype != 'null' && parentSkutype != 'undefined' && parentSkutype == 'kititem')
								{
									var orderLevel="F";
									orderLevel=getSystemRuleValue('Consolidate item fulfillments by sales order?',whlocation);
									if(orderLevel ==null || orderLevel =='' || orderLevel =='null' || orderLevel =='undefined')
									{
										orderLevel="F";
									}
									if(orderLevel=="Y")
									{
										orderLevel='T';
									}
									else
									{
										orderLevel='F';
									}
									SOarray["custparam_orderlevel"] = orderLevel;
									var vmainItemQty='';
									var soLineItemDetails = getSOLineDetailskit(SOarray["custparam_soId"],trantype,parentSku,SOarray["custparam_whlocation"]);									
									var actualBeginTime=TimeStamp();
									nlapiLogExecution('DEBUG', 'soLineItemDetails', soLineItemDetails);
									var vMultiShipping='F';
									var vShipVia='';
									//To fetch Line level multi shipping flag and ship via validation
									if(soLineItemDetails !=null && soLineItemDetails!="")
									{					
										for(var z=0;z<soLineItemDetails.length;z++)
										{
											var vsoLine = soLineItemDetails[z].getValue('line',null,'group');
											//if(parseFloat(vsoLine) == parseFloat(soLineno))
																						
											var logMsg1 = 'soLineItemDetails.length =' + soLineItemDetails.length + '<br>';
											logMsg1 = logMsg1 + 'vsoLine = ' + vsoLine + '<br>';
											logMsg1 = logMsg1 + 'soLineno = ' + soLineno + '<br>';
											nlapiLogExecution('DEBUG', 'parameters of line#', logMsg1);
											
											if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1) && trantype == 'transferorder'))
											{
												vMultiShipping = soLineItemDetails[z].getValue('ismultishipto',null,'group');
												vmainItemQty = soLineItemDetails[z].getValue('quantitycommitted',null,'max');
												if(vMultiShipping ==  null || vMultiShipping =='')
													vMultiShipping='F';
												//if(vMultiShipping=='T')
												//{
												vShipVia=soLineItemDetails[z].getValue('shipmethod',null,'group');
												nlapiLogExecution('DEBUG', 'vShipVia  inside if', vShipVia);
												//vShipVia=soLineItemDetails[z].getValue('shipmethod',null,'group');
												//}
												break;
											}			

										}	

									}
									nlapiLogExecution('DEBUG', 'vMultiShipping : vShipVia : vmainItemQty', vMultiShipping + ":" + vShipVia + ":"+ vmainItemQty);

									var memItemExpectedQty = request.getParameter('hdnvMemitemqty');
									var itemType = nswms_GetItemType(FetchedItemId, SOarray["custparam_whlocation"]);
									var binInternalId=request.getParameter('hdnEnteredBinId');
									updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,
											SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,taskType,null,null,null,"F",
											trantype,actualBeginTime,customer,'',Number(Big(memItemExpectedQty).toFixed(5)),Number(Big(enterQty).toFixed(5)),parentSku,
											'T',null,null,null,vShipVia,null,ordType,department,vclass,getPickreportid,null,invtStatus);

									var soLineDetails = getSOLineDetailskit(SOarray["custparam_soId"],trantype,parentSku,SOarray["custparam_whlocation"]);
									nlapiLogExecution('DEBUG', 'soLineDetails', soLineDetails);
									if(soLineDetails !=null && soLineDetails!="")
									{
										var vLinecount=0;
										nlapiLogExecution('DEBUG', 'soLineDetails.length', soLineDetails.length);
										if(soLineDetails.length>0)
										{
											var count= 0;
											var item=request.getParameter('hdnSoItem');
											var vColumnslist = soLineDetails[0].getAllColumns();


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
											for(var f=0;f<soLineDetails.length;f++)
											{		
												var searchResult=soLineDetails[f];
												var vSoLine = searchResult.getValue('line',null,'group');
												var vsoitemRcvQty = searchResult.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
												var vsoitemCommitedQty=searchResult.getValue(vColumnslist[memitemcommitedQtyIndex]);
												var vsoitem = searchResult.getValue('item',null,'group');
																								
												var logMsg1 = 'vSoLine =' + vSoLine + '<br>';
												logMsg1 = logMsg1 + 'soLineno = ' + soLineno + '<br>';
												logMsg1 = logMsg1 + 'vsoitem = ' + vsoitem + '<br>';
												nlapiLogExecution('DEBUG', 'parameters of line', logMsg1);
												
												var vcoitem = searchResult.getValue('memberitem','item','group');
												//var vMemItemType = getComponentItemType(vcoitem);
												/*if(vMemItemType =='inventoryitem' || vMemItemType =='assemblyitem' || vMemItemType =='lotnumberedinventoryitem' || vMemItemType =='lotnumberedassemblyitem' || vMemItemType =='serializedinventoryitem' || vMemItemType =='serializedassemblyitem')
												{*/
												if(vsoitemCommitedQty == null || vsoitemCommitedQty =='' || vsoitemCommitedQty =='null' || vsoitemCommitedQty =='undefined')
													vsoitemCommitedQty = 0;
												if(vsoitemRcvQty == null || vsoitemRcvQty =='' || vsoitemRcvQty =='null' || vsoitemRcvQty =='undefined')
													vsoitemRcvQty = 0;
												if(parseFloat(vSoLine) == parseFloat(soLineno))
												{
											
													var logMsg1 = 'vsoitemRcvQty =' + vsoitemRcvQty + '<br>';
													logMsg1 = logMsg1 + 'vsoitemCommitedQty = ' + vsoitemCommitedQty + '<br>';
													nlapiLogExecution('DEBUG', 'parameters of qty', logMsg1);
													

													if(parseFloat(vsoitemRcvQty) >= parseFloat(vsoitemCommitedQty))
													{										
														//isItLastPick="T";


													}
													else
													{
														//isItLastPick="F";
														count=parseFloat(count)+1;
														break;
													}
												}
												//}
											}
											nlapiLogExecution('DEBUG', 'count', count);
											if(parseFloat(count) >= 1)
											{
												isItLastPick="F";
											}
											else
											{
												isItLastPick="T";
											}
										}
										soLineDetails=null;
									}

									if(isItLastPick!=null && isItLastPick!='' && isItLastPick=="T")
									{
										nlapiLogExecution('DEBUG', 'isItLastPick', isItLastPick);
										//for main item
										var mianItemOPenTaskid =	updateOpenTask(soInternalId,parentSku,soLineno,Number(Big(vmainItemQty).toFixed(5)),binInternalId,
												itemType,SOarray["custparam_whlocation"],'','','','',soInternalId,
												null,null,null,'PICK',SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
												SOarray["custparam_cartonweight"],"F",trantype,actualBeginTime,
												SOarray["custparam_customer"],'','','','','F',null,null,null,vShipVia,null,ordType,
												department,vclass,getPickreportid,null,invtStatus);
										nlapiLogExecution('DEBUG', 'mianItemOPenTaskid', mianItemOPenTaskid);

										if(mianItemOPenTaskid != null && mianItemOPenTaskid !='')
										{

											var opentaskordersearchresultkit = new Array()
											var opentaskkitsearchresults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh');
																						
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId)); 
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', soLineno)); 
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8']));//8 picking completed
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_kitflag', null,'is', 'T'));//8 picking completed
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('isinactive',null,'is','F'));
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); // NS REF no is empty

											
											var resLenDetails = opentaskkitsearchresults.runSearch();
											
											
											var resultsPage = resLenDetails.getResults(0, 1000);
											var offset = 0;
											while (!!resultsPage && resultsPage.length > 0) 
											{
												opentaskordersearchresultkit = opentaskordersearchresultkit.concat(resultsPage);
												offset += 1000;
												resultsPage = resLenDetails.getResults(offset, offset + 1000);
											}
											
											nlapiLogExecution('DEBUG', 'opentaskordersearchresultkit', opentaskordersearchresultkit);
											if(opentaskordersearchresultkit != null && opentaskordersearchresultkit !='')
											{
												for(var k=0;k<opentaskordersearchresultkit.length;k++)
												{
													nlapiLogExecution('DEBUG', 'opentaskordersearchresultkit', opentaskordersearchresultkit[k].getId());
													var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',opentaskordersearchresultkit[k].getId());
													var expQty = loadRec.getFieldValue('custrecord_wmsse_expe_qty');
													loadRec.setFieldValue('custrecord_wmsse_act_qty',Number(Big(expQty).toFixed(5)));
													nlapiSubmitRecord(loadRec);
												}
												opentaskordersearchresultkit=null;
											}
											if(SOarray["custparam_orderlevel"] =="F" && mianItemOPenTaskid != null && mianItemOPenTaskid != '' && vStageScanRequired=='F' )
											{
												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
												loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												//loadRec.setFieldValue('custrecord_wmsse_act_qty',expQty);
												nlapiSubmitRecord(loadRec);
												loadRec=null;
											}

											var vRedirectionFlag="F";
											var columnsOpen = new Array();
											var filtersOpen = new Array();
											var deviceUploadFlag='T';
											if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
												filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
											if(SOarray["custparam_whlocation"] !=null && SOarray["custparam_whlocation"]!='' && SOarray["custparam_whlocation"]!='null' && SOarray["custparam_whlocation"] !='undefined')
												filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', SOarray["custparam_whlocation"]));
											var vSOLineDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist', filtersOpen, columnsOpen);
											if(vSOLineDetails != null && vSOLineDetails != '' && vSOLineDetails != 'null' && vSOLineDetails!='undefined' && vSOLineDetails.length>0)
											{	
												var vnColumnslist=vSOLineDetails[0].getAllColumns();

												var pickReportExpectedQty = 3;
												var pickReportActualQty = 4;		

												for(var p1=0;p1<vnColumnslist.length;p1++)
												{
													var summaryLabel = vnColumnslist[p1].getLabel();

													if(summaryLabel == 'Expected Qty')
													{
														pickReportExpectedQty = p1;
													}
													else if (summaryLabel == 'Actual Qty')	
													{
														pickReportActualQty = p1;
													}																
													else
													{

													}
												}

												for(var i=0;i<vSOLineDetails.length;i++)
												{	
													var vPickedQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportActualQty]);
													var vPickGenQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportExpectedQty]);
													//var vLineNo=vSOLineDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

													if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
														vPickedQty=0;
													if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
														vPickGenQty=0;

													vPickGenQty=new Big(vPickGenQty);
													vPickedQty=new Big(vPickedQty);
													var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
													nlapiLogExecution('DEBUG', 'vRemainingQty in Big', vRemainingQty);

													if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
														vRemainingQty=0;
													if(parseFloat(vRemainingQty) > 0)
													{
														vRedirectionFlag = "T";
														deviceUploadFlag = 'F';
														if(SOarray["custparam_orderlevel"] =="T")
														{
															var filtersOpenPicked = new Array();
															var columnsOpenPicked = new Array();
															if(soInternalId!=null && soInternalId!='' && soInternalId!='null' && soInternalId!='undefined')
																filtersOpenPicked.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', soInternalId));
															if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
																filtersOpenPicked.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
															if(SOarray["custparam_whlocation"] !=null && SOarray["custparam_whlocation"]!='' && SOarray["custparam_whlocation"]!='null' && SOarray["custparam_whlocation"] !='undefined')
																filtersOpenPicked.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', SOarray["custparam_whlocation"]));
															var vSOOrderDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist', filtersOpenPicked, columnsOpenPicked);
															if(vSOOrderDetails != null && vSOOrderDetails != '' && vSOOrderDetails != 'null' && vSOOrderDetails!='undefined' && vSOOrderDetails.length>0)
															{	
																var vnColumnslist=vSOOrderDetails[0].getAllColumns();

																var pickReportExpectedQty = 3;
																var pickReportActualQty = 4;		

																for(var p1=0;p1<vnColumnslist.length;p1++)
																{
																	var summaryLabel = vnColumnslist[p1].getLabel();

																	if(summaryLabel == 'Expected Qty')
																	{
																		pickReportExpectedQty = p1;
																	}
																	else if (summaryLabel == 'Actual Qty')	
																	{
																		pickReportActualQty = p1;
																	}																
																	else
																	{

																	}
																}

																var isOrderPicked = 'T';
																for(var i=0;i<vSOOrderDetails.length;i++)
																{	
																	var vPickedQty=vSOOrderDetails[i].getValue(vnColumnslist[pickReportActualQty]);
																	var vPickGenQty=vSOOrderDetails[i].getValue(vnColumnslist[pickReportExpectedQty]);
																	//var vLineNo=vSOOrderDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

																	if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
																		vPickedQty=0;
																	if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
																		vPickGenQty=0;

																	vPickGenQty=new Big(vPickGenQty);
																	vPickedQty=new Big(vPickedQty);
																	var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
																	nlapiLogExecution('DEBUG', 'vRemainingQty2 in Big', vRemainingQty);

																	if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
																		vRemainingQty=0;
																	if(parseFloat(vRemainingQty) > 0)
																	{
																		isOrderPicked = 'F';
																		break;
																	}
																}
															}
															if(isOrderPicked == 'T')
															{
																deviceUploadFlag = 'T';
															}															
														}
														break;
													}
												}
											}
											nlapiLogExecution('DEBUG','vRedirectionFlag at',vRedirectionFlag);
											if(vRedirectionFlag == "T")
											{
												if(request.getParameter('cmdSend')=='New Order')
												{
													var SOarray = new Array();
													SOarray["custparam_error"] ='';
													SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
													SOarray["custparam_enterbinid"] =request.getParameter('hdnEnteredBinId');
													SOarray["custparam_language"] = getLanguage;
													SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
													SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
													SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
													//SOarray["custparam_item"] = request.getParameter('hdnitem');
													SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
													response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
													return;
												}
												else if(request.getParameter('cmdStage')=='Pick & Stage')
												{
													SOarray["custparam_error"] ='';
													SOarray["custparam_soid"]=SOarray["custparam_enterorder"];
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
													return;
												}
												else
												{
													if(deviceUploadFlag=='T' && SOarray["custparam_orderlevel"] =="T")
													{
														if(mianItemOPenTaskid != null && mianItemOPenTaskid != ''  &&  vStageScanRequired == 'F')
														{	
															var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
															loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
															nlapiSubmitRecord(loadRec);
															loadRec=null;
														}
													}
													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
													return;
												}
											}
											else
											{
												if(vStageScanRequired=='T')
												{
													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
													return;
												}
												else
												{
													if(deviceUploadFlag=='T' && SOarray["custparam_orderlevel"] =="T")
													{
														if(mianItemOPenTaskid != null && mianItemOPenTaskid != ''  &&  vStageScanRequired == 'F')
														{	
															var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
															loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
															nlapiSubmitRecord(loadRec);
															loadRec=null;
														}
													}
													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
													return;
												}
											}
										}
									}
									else
									{
										var vRedirectionFlag="F";
										var columnsOpen = new Array();
										var filtersOpen = new Array();

										if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
											filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
										if(SOarray["custparam_whlocation"] !=null && SOarray["custparam_whlocation"]!='' && SOarray["custparam_whlocation"]!='null' && SOarray["custparam_whlocation"] !='undefined')
											filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', SOarray["custparam_whlocation"]));
										var vSOLineDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist', filtersOpen, columnsOpen);
										if(vSOLineDetails != null && vSOLineDetails != '' && vSOLineDetails != 'null' && vSOLineDetails!='undefined' && vSOLineDetails.length>0)
										{	
											var vnColumnslist=vSOLineDetails[0].getAllColumns();

											var pickReportExpectedQty = 3;
											var pickReportActualQty = 4;		

											for(var p1=0;p1<vnColumnslist.length;p1++)
											{
												var summaryLabel = vnColumnslist[p1].getLabel();

												if(summaryLabel == 'Expected Qty')
												{
													pickReportExpectedQty = p1;
												}
												else if (summaryLabel == 'Actual Qty')	
												{
													pickReportActualQty = p1;
												}																
												else
												{

												}
											}
											for(var i=0;i<vSOLineDetails.length;i++)
											{	
												var vPickedQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportActualQty]);
												var vPickGenQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportExpectedQty]);
												//var vLineNo=vSOLineDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

												if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
													vPickedQty=0;
												if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
													vPickGenQty=0;

												vPickGenQty=new Big(vPickGenQty);
												vPickedQty=new Big(vPickedQty);
												var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
												nlapiLogExecution('DEBUG', 'vRemainingQty3 in Big', vRemainingQty);

												if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
													vRemainingQty=0;
												if(parseFloat(vRemainingQty) > 0)
												{
													vRedirectionFlag = "T";
													break;
												}
											}
										}
										nlapiLogExecution('DEBUG','vRedirectionFlag at',vRedirectionFlag);
										if(vRedirectionFlag == "T")
										{
											if(request.getParameter('cmdSend')=='New Order')
											{
												var SOarray = new Array();
												SOarray["custparam_error"] ='';
												SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
												SOarray["custparam_enterbinid"] =request.getParameter('hdnEnteredBinId');
												SOarray["custparam_language"] = getLanguage;
												SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
												SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
												SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
												//SOarray["custparam_item"] = request.getParameter('hdnitem');
												SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
												response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
												return;
											}
											else if(request.getParameter('cmdStage')=='Pick & Stage')
											{
												SOarray["custparam_error"] ='';
												SOarray["custparam_soid"]=SOarray["custparam_enterorder"];
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
												return;
											}
											else
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
												return;
											}
										}
										else
										{
											if(vStageScanRequired=='T')
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
												return;
											}
											else
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
												return;
											}
										}
									}


								}
								else
								{
									var itemType = nswms_GetItemType(FetchedItemId, request.getParameter('hdnWhLocation'));
									nlapiLogExecution('DEBUG', 'inside if', itemType);
									var binInternalId=request.getParameter('hdnEnteredBinId');
									nlapiLogExecution('DEBUG', 'binInternalId', binInternalId); 

									var taskType="PICK";
									var actualBeginTime=TimeStamp();
									var orderLevel="F";
									orderLevel=getSystemRuleValue('Consolidate item fulfillments by sales order?',request.getParameter('hdnWhLocation'));
									if(orderLevel ==null || orderLevel =='' || orderLevel =='null' || orderLevel =='undefined')
									{
										orderLevel="F";
									}
									if(orderLevel=="Y")
									{
										orderLevel='T';
									}
									else
									{
										orderLevel='F';
									}
									SOarray["custparam_orderlevel"] = orderLevel;

									var soLineItemDetails = getSOLineDetailsNew(SOarray["custparam_enterorder"],trantype,FetchedItemId,request.getParameter('hdnWhLocation'));

									nlapiLogExecution('DEBUG', 'soLineItemDetails', soLineItemDetails);
									var vMultiShipping='F';
									var vShipVia='';
									var vSoreminqty =0;
									//To fetch Line level multi shipping flag and ship via validation
									if(soLineItemDetails !=null && soLineItemDetails!="" && soLineItemDetails != 'null' && soLineItemDetails != 'undefined' && soLineItemDetails.length != null)
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

										for(var z=0;z<soLineItemDetails.length;z++)
										{
											var vsoLine = soLineItemDetails[z].getValue('line',null,'group');
											//if(parseFloat(vsoLine) == parseFloat(soLineno))
											var vsoitemQty=soLineItemDetails[z].getValue(vColumnslist[commitedQtyIndex]);
											var vsoitemfulfillQty=soLineItemDetails[z].getValue(vColumnslist[fulfilledQtyIndex]);							
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

											vsoitemopentaskQty=new Big(vsoitemopentaskQty);
											vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
											vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
											var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
											nlapiLogExecution('DEBUG','vsoitemRcvQty in big',vsoitemRcvQty);


											if(vsoitemRcvQty==null || vsoitemRcvQty=='')
												vsoitemRcvQty=0;
											if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
												vsoitemfulfillQty=0;
											nlapiLogExecution('DEBUG', 'vsoitemQty : vsoitemfulfillQty :  vsoitemRcvQty', vsoitemQty + ":" + vsoitemfulfillQty + ":" + vsoitemRcvQty);

											vsoitemQty=new Big(vsoitemQty);
											vsoitemfulfillQty=new Big(vsoitemfulfillQty);
											vsoitemRcvQty=new Big(vsoitemRcvQty);
											vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
											nlapiLogExecution('DEBUG','vSoreminqty in Big',vSoreminqty);


											if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1) && trantype == 'transferorder'))
											{
												vMultiShipping = soLineItemDetails[z].getValue('ismultishipto',null,'group');
												if(vMultiShipping ==  null || vMultiShipping =='')
													vMultiShipping='F';
												//if(vMultiShipping=='T')
												//{
												vShipVia=soLineItemDetails[z].getValue('shipmethod',null,'group');
												//}
												break;
											}			

										}	

									}
									nlapiLogExecution('DEBUG', 'vMultiShipping : vShipVia ', vMultiShipping + ":" + vShipVia);
									nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);
									var isItLastPick='F';
									var soLineDetails = null;
									if(parseFloat(vSoreminqty) > 0)
									{
										soLineDetails = getSOLineDetailsNew(SOarray["custparam_enterorder"],trantype,null,SOarray["custparam_whlocation"]);
										nlapiLogExecution('DEBUG', 'soLineDetails', soLineDetails);
									}
									if(soLineDetails !=null && soLineDetails!="" && vStageScanRequired=="F")
									{
										var vLinecount=0;
										nlapiLogExecution('DEBUG', 'soLineDetails.length', soLineDetails.length);
										if(soLineDetails.length>0)
										{

											var vColumnslist=soLineDetails[0].getAllColumns();

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


											for(var f=0;f<soLineDetails.length;f++)
											{


												var vsoitemRcvQty = soLineDetails[f].getValue('quantityshiprecv',null,'max');
												//var vsoitemCommitedQty=soLineDetails[f].getValue('quantitycommitted',null,'max');
												var vsoitemCommitedQty=soLineDetails[f].getValue(vColumnslist[commitedQtyIndex]);			 
												var vsoitemfulfillQty=soLineDetails[f].getValue(vColumnslist[fulfilledQtyIndex]);
												var vsoitemopentaskQty=soLineDetails[f].getValue(vColumnslist[totalPickedQtyIndex]);
												var vsoitemErpConfirmedQty=soLineDetails[f].getValue(vColumnslist[ERPConfirmedQty]);
												var vsoitemNSReceivedQty=soLineDetails[f].getValue(vColumnslist[totalNSPickedQtyIndex]);
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
												var vsoitemPickedQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
												nlapiLogExecution('DEBUG','vsoitemPickedQty in big',vsoitemPickedQty);


												var vsoitemQty = soLineDetails[f].getValue('quantity',null,'max');
												var vsoitemLine = soLineDetails[f].getValue('line',null,'group');
												var vsoitemMultiShipping = soLineDetails[f].getValue('ismultishipto',null,'group');
												var vsoitemShipVia = soLineDetails[f].getValue('shipmethod',null,'group');
												
												var logMsg1 = 'vsoitemMultiShipping =' + vsoitemMultiShipping + '<br>';
												logMsg1 = logMsg1 + 'vsoitemShipVia = ' + vsoitemShipVia + '<br>';
												logMsg1 = logMsg1 + 'vsoitemRcvQty = ' + vsoitemRcvQty + '<br>';
												logMsg1 = logMsg1 + 'vsoitemCommitedQty = ' + vsoitemCommitedQty + '<br>';
												logMsg1 = logMsg1 + 'vsoitemQty = ' + vsoitemQty + '<br>';
												logMsg1 = logMsg1 + 'vsoitemPickedQty = ' + vsoitemPickedQty + '<br>';
												logMsg1 = logMsg1 + 'vsoitemLine = ' + vsoitemLine + '<br>';
												nlapiLogExecution('DEBUG', 'parameters', logMsg1);
												
												//var vsoitemfulfillQty=soLineDetails[f].getValue(vColumnslist[6]);
												if(vsoitemCommitedQty == null || vsoitemCommitedQty =='' || vsoitemCommitedQty =='null' || vsoitemCommitedQty =='undefined')
													vsoitemCommitedQty = 0;
												if(vsoitemfulfillQty == null || vsoitemfulfillQty =='' || vsoitemfulfillQty =='null' || vsoitemfulfillQty =='undefined')
													vsoitemfulfillQty = 0;
												if(vsoitemPickedQty == null || vsoitemPickedQty =='' || vsoitemPickedQty =='null' || vsoitemPickedQty =='undefined')
													vsoitemPickedQty = 0;

												vsoitemCommitedQty=new Big(vsoitemCommitedQty);
												vsoitemfulfillQty=new Big(vsoitemfulfillQty);
												vsoitemPickedQty=new Big(vsoitemPickedQty);
												var vsoitemRemQty = Number((vsoitemCommitedQty.plus(vsoitemfulfillQty)).minus(vsoitemPickedQty));
												nlapiLogExecution('DEBUG','vsoitemRemQty in Big',vsoitemRemQty);


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

													if(vsoitemLine==SOarray["custparam_solineno"])
													{
														nlapiLogExecution('DEBUG', 'Inside same line', SOarray["custparam_solineno"]);

														vsoitemRemQty=new Big(vsoitemRemQty);
														enterQty=new Big(enterQty);
														var totalQty=Number(vsoitemRemQty.minus(enterQty));
														nlapiLogExecution('DEBUG', 'totalQty in Big', totalQty);


														if(parseFloat(totalQty) > 0)
														{
															//isItLastPick="T";
															vLinecount=parseFloat(vLinecount)+1;
														}

													}
												}
												else
												{
													nlapiLogExecution('DEBUG', 'else vsoitemMultiShipping', vsoitemMultiShipping);
													if(parseFloat(vsoitemRemQty)>0 && vsoitemShipVia == vShipVia)
													{
														vLinecount=parseFloat(vLinecount)+1;
													}
													if(trantype=='transferorder')
														vsoitemLine=parseFloat(vsoitemLine)-1;

													if(vsoitemLine==SOarray["custparam_solineno"] && vsoitemShipVia == vShipVia)
													{
														nlapiLogExecution('DEBUG', 'Inside same line', SOarray["custparam_solineno"]);

														vsoitemRemQty=new Big(vsoitemRemQty);
														enterQty=new Big(enterQty);
														var totalQty=Number(vsoitemRemQty.minus(enterQty));
														nlapiLogExecution('DEBUG', 'totalQty1 in Big', totalQty);


														if(parseFloat(totalQty) > 0)
														{
															//isItLastPick="T";
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
									soLineDetails=null;
									nlapiLogExecution('ERROR', 'isItLastPick', isItLastPick);

									// To post IF when order level is true and lastpick is true for already packed containers against order
									if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T" && vStageScanRequired=="F")
									{
												
										
										var opentaskSearchResultsPack=new Array();
										var opentaskSearchResults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh');
																	
										opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));
										opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
										opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));
										opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['14']));
										opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'isnotempty'));

																				
										var resLenDetails = opentaskSearchResults.runSearch();
																	
										var resultsPage = resLenDetails.getResults(0, 1000);
										var offset = 0;
										while (!!resultsPage && resultsPage.length > 0) 
										{
											opentaskSearchResultsPack = opentaskSearchResultsPack.concat(resultsPage);
											offset += 1000;
											resultsPage = resLenDetails.getResults(offset, offset + 1000);
										}
										if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
										{
											nlapiLogExecution('DEBUG','opentaskSearchResultsPack at',opentaskSearchResultsPack.length);
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
													nlapiLogExecution('DEBUG','vPackRecId at',vPackRecId);
												}
											}
										}
									}
									// end
									if(parseFloat(vSoreminqty) > 0)
									{
										if(isItLastPick!=null && isItLastPick!='' && isItLastPick=="T" && vStageScanRequired=="F")
										{
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,
													SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,taskType,
													null,null,null,"T",trantype,actualBeginTime,
													customer,'','','','','','',SOarray["custparam_unitstext"],
													SOarray["custparam_conversionrate"],vShipVia,null,ordType,department,
													vclass,getPickreportid,null,invtStatus);
										}
										else
										{
											if(SOarray["custparam_orderlevel"] =="T")
											{
												var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,
														itemType,SOarray["custparam_whlocation"],'','','','',
														soInternalId,null,null,null,taskType,null,null,null,'F',trantype,actualBeginTime,
														customer,'','','','','','',SOarray["custparam_unitstext"],
														SOarray["custparam_conversionrate"],vShipVia,null,ordType,department,vclass,
														getPickreportid,null,invtStatus);
											}
											else
											{
												if(vStageScanRequired=="F")
												{
													var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,
															itemType,SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,
															taskType,null,null,null,"T",trantype,actualBeginTime,
															customer,'','','','','','',SOarray["custparam_unitstext"],
															SOarray["custparam_conversionrate"],vShipVia,null,ordType,department,vclass,
															getPickreportid,null,invtStatus);
												}
												else
												{
													var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,
															itemType,SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,
															taskType,null,null,null,"F",trantype,actualBeginTime,
															customer,'','','','','','',SOarray["custparam_unitstext"],
															SOarray["custparam_conversionrate"],vShipVia,null,ordType,department,
															vclass,getPickreportid,null,invtStatus);
												}

											}
										}
									}
									var vRedirectionFlag="F";
									var columnsOpen = new Array();
									var filtersOpen = new Array();

									if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
										filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
									var vSOLineDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist', filtersOpen, columnsOpen);
									if(vSOLineDetails != null && vSOLineDetails != '' && vSOLineDetails != 'null' && vSOLineDetails!='undefined' && vSOLineDetails.length>0)
									{	
										var vnColumnslist=vSOLineDetails[0].getAllColumns();

										var pickReportExpectedQty = 3;
										var pickReportActualQty = 4;		

										for(var p1=0;p1<vnColumnslist.length;p1++)
										{
											var summaryLabel = vnColumnslist[p1].getLabel();

											if(summaryLabel == 'Expected Qty')
											{
												pickReportExpectedQty = p1;
											}
											else if (summaryLabel == 'Actual Qty')	
											{
												pickReportActualQty = p1;
											}																
											else
											{

											}
										}
										for(var i=0;i<vSOLineDetails.length;i++)
										{	
											var vPickedQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportActualQty]);
											var vPickGenQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportExpectedQty]);
											//var vLineNo=vSOLineDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

											if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
												vPickedQty=0;
											if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
												vPickGenQty=0;

											nlapiLogExecution('DEBUG', 'vPickGenQty : vPickedQty ', vPickGenQty + ":" + vPickedQty);


											vPickGenQty=new Big(vPickGenQty);
											vPickedQty=new Big(vPickedQty);
											var vRemainingQty=Number(vPickGenQty.minus(vPickedQty));
											nlapiLogExecution('DEBUG', 'vRemainingQty in Big', vRemainingQty);


											if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
												vRemainingQty=0;
											if(parseFloat(vRemainingQty) > 0)
											{
												vRedirectionFlag = "T";
												break;
											}
										}
									}
									nlapiLogExecution('DEBUG','vRedirectionFlag',vRedirectionFlag);
									if(vRedirectionFlag == "T")
									{
										if(request.getParameter('cmdSend')=='New Order')
										{
											var SOarray = new Array();
											SOarray["custparam_error"] ='';
											SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
											SOarray["custparam_enterbinid"] =request.getParameter('hdnEnteredBinId');
											SOarray["custparam_language"] = getLanguage;
											SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
											SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
											SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
											//SOarray["custparam_item"] = request.getParameter('hdnitem');
											SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
											response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
											return;
										}
										else if(request.getParameter('cmdStage')=='Pick & Stage')
										{
											SOarray["custparam_error"] ='';
											SOarray["custparam_soid"]=SOarray["custparam_enterorder"];
											response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
											return;
										}
										else
										{
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
											return;
										}
									}
									else
									{
										if(vStageScanRequired=='T')
										{
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
											return;
										}
										else
										{
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
											return;
										}
									}
								}

							}				
							catch(e)
							{
								nlapiLogExecution('ERROR', 'inside catch exception', e);

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
								var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

								if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
								{
									var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
									nlapiLogExecution('ERROR','DeleteRecordId', DeleteRecordId);
								}

								response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
								return;
							}
						}
					}
					else
					{
						SOarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
					}
				} 
				else {
					SOarray["custparam_error"] ='';
					var lockfilters=new Array();

					lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',FetchedItemId));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
					var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

					if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
					{
						var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
						nlapiLogExecution('ERROR','DeleteRecordId', DeleteRecordId);
					}

					if(fromscreen != null && fromscreen != '' && fromscreen != 'null' && fromscreen != undefined 
							&& fromscreen != 'undefined' && fromscreen == 'statusscreen')
					{
						SOarray["custparam_enteredqty"] = enterQty;
						response.sendRedirect('SUITELET', 'customscript_wmsse_picking_statusscan',
								'customdeploy_wmsse_picking_statusscan', false, SOarray);
						return; 
					}
					response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan',
							'customdeploy_wmsse_picking_qty_scan', false, SOarray);
					return;
				}
			}
			catch (e) 
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

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

				response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
		}
	} //end of first if condition
} //end of function.

function getSOLineDetailskit(sonumber,trantype,itemID,whLocation)
{
	nlapiLogExecution('DEBUG', 'sonumber,trantype,whLocation,itemID',sonumber+","+trantype+","+whLocation+","+itemID);

	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('internalid', null, 'is', sonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));


	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',whLocation]));
	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 

	var SOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_ordline_details_kit', filters, columns);
	filters=null;
	columns=null;
	return SOLineDetails;
}
