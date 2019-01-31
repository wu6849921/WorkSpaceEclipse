/**
 * Script Description
 * This script is used for scan serial numbers for Bin transfer process
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan serial numbers in Bin transfer process
 */
function RFInventoryBTSerial(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');
		var availableqtyBin =request.getParameter('custparam_lotavailableqty');
		var whLocationName = request.getParameter('custparam_whlocationname');
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');
		var  getStockConversionRate  =request.getParameter('custparam_stockconversionrate');		
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');
		var availableQty=request.getParameter('custparam_availableqty');
		var enterBin=request.getParameter('custparam_enterBin');
		var invttostatus=request.getParameter('custparam_toStatus');
		var invtfromstatus=request.getParameter('custparam_enteredstatus');
		var invtstatusName=request.getParameter('custparam_invtstatusName');
		var blnMixItem=request.getParameter('custparam_blnmixitem');
		var blnMixLot=request.getParameter('custparam_blnmixlot'); 
		var getPreferBin=request.getParameter('custparam_preferbin');
		var enterQty = request.getParameter('custparam_enterQty');
		var statusflag = request.getParameter('custparam_statusflag');
		var statusScanQuantity = request.getParameter('custparam_statusScanQuantity');
		var toStatusText = request.getParameter('custparam_toStatusText');
		var toInventoryStatusText = request.getParameter('custparam_toenteredstatustxt');
		var invToStatusName = request.getParameter('custparam_enteredTostatusName');
		var enteredlot = request.getParameter('custparam_enteredlot');
		var eneteredBinId = request.getParameter('custparam_enteredBinID');

		var vBarcodeqty = request.getParameter('custparam_bcqty');
		var vBarcodeUOM = request.getParameter('custparam_bcuom');
		var vBarcodeSerial = request.getParameter('custparam_bcserial');
		var vBarcodeLot = request.getParameter('custparam_bclot');
		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		/*if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined')
		{
			enterQty = parseInt(enterQty);
		}*/
		var uomqtyArr = request.getParameter('custparam_uomqtyselected');
		var enterToBin=request.getParameter('custparam_enterToBin');
		var enterToBinText=request.getParameter('custparam_enterBinText');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var blnItemUnit = request.getParameter('custparam_itemunits');

		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);

		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);

		var st0=domainName + "-BT Inventory";
		var getPreferBin=request.getParameter('custparam_preferbin');
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;
		nlapiLogExecution('ERROR', 'getNumber', getNumber);
		if(parseFloat(getNumber)==0)
		{
			var filterssertemp1 = new Array();
			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 9);//9--Move
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', enterToBin);
			var columnssertemp1 = new Array();
			//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			//columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp1,columnssertemp1);
			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
			{	
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];
					nlapiLogExecution('ERROR', 'TempRecord.getId()',TempRecord.getId());
					nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',TempRecord.getValue('name'));
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of discontinue of serial number scanning we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
					tempSerial=null;
				}

			}
			SrchRecordTmpSerial1=null;
			columnssertemp1=null;
			filterssertemp1=null;
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
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
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />"+
		"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";


		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() { if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;}else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Bin Transfer - Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>To Bin: <label>" + enterToBinText + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Scanned Qty: <label>" + getNumber + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnEnterBin' value='" + enterBin + "'>"+
		"				<input type='hidden' name='hdnAvailableQty' id='hdnAvailableQty' value=" + availableqtyBin + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnlotno' value=" + lotno + ">"+
		"				<input type='hidden' name='hdnEnterToBin' value='" + enterToBin + "'>"+
		"				<input type='hidden' name='hdnEnterToBinText' value='" + enterToBinText + "'>"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+	
		"				<input type='hidden' name='hdnstatusflag' value=" + statusflag + ">"+
		"				<input type='hidden' name='hdnstatusScanQuantity' value=" + statusScanQuantity + ">"+
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnAvailableQty1' id='hdnAvailableQty1' value=" + availableQty + ">"+
		"				<input type='hidden' name='hdnlotavailableqty' value=" + availableqtyBin + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnselecteduomswithqty'  value=" + uomqtyArr + ">"+
		"				<input type='hidden' name='hdnfromstatus' value='" + invtfromstatus + "'>"+	
		"				<input type='hidden' name='hdninvtstatusName' value='" + invtstatusName + "'>"+	
		"				<input type='hidden' name='hdntostatus'  value=" + invttostatus + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdngetStockConversionRate'  value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdntoStatusText' id='hdntoStatusText' value='" + toStatusText + "'>"+
		"				<input type='hidden' name='hdnenteredlot' id='hdnenteredlot' value='" + enteredlot + "'>"+
		"				<input type='hidden' name='hdnEntbinId' id='hdnEntbinId' value='" + eneteredBinId + "'>"+
		"				<input type='hidden' name='hdnBarcodeqty' value=" + vBarcodeqty + ">"+
		"				<input type='hidden' name='hdnBarcodeuom' value=" + vBarcodeUOM + ">"+		
		"				<input type='hidden' name='hdnBarcodeLot' value='" + vBarcodeLot + "'>"+
		"				<input type='hidden' name='hdnBarcodeserial' value='" + vBarcodeSerial + "'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>";		

		if(toInventoryStatusText == null || toInventoryStatusText == ''|| toInventoryStatusText == 'null'|| toInventoryStatusText == undefined)
		{
			var toInventoryStatusArray = getDefaultInventoryStatusList(invttostatus,-1,null);
			toInventoryStatusArray = toInventoryStatusArray.toString();

			var toInventoryStatus = toInventoryStatusArray.split(',');
			nlapiLogExecution('ERROR', 'toInventoryStatus', toInventoryStatus[0]+'+'+toInventoryStatus[1]+'+'+toInventoryStatus[2]);
			toInventoryStatusText = toInventoryStatus[0];
		}
		if(invtfromstatus != null && invtfromstatus != '' && invtfromstatus != 'null' && invtfromstatus != 'undefined')
		{
			var vInventoryStatus ='';
			var vToInventoryStatus ='';
			var hdnInvtStatusText = request.getParameter('hdnInvtStatusText');
			var hdnToInvtStatusText = request.getParameter('hdnToInvtStatusText');
			if(hdnInvtStatusText != '' && hdnInvtStatusText != null && hdnInvtStatusText != 'null' && hdnInvtStatusText != 'undefined')
			{
				vInventoryStatus = hdnInvtStatusText;
				vToInventoryStatus = hdnToInvtStatusText;
			}
			else
			{
				var inventoryStatustx = invtstatusName;
				var inventoryToStatustx = invToStatusName;
			}
			html = html + "			<tr>"+
			"			<td align = 'left' class='labelmsg'>From Inv Status: <label>" + inventoryStatustx + "</label>"+
			"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + inventoryStatustx + "'>"+	
			"			</tr>"+
			"			<tr>"+
			"				<td align = 'left' class='labelmsg'>To Inv Status: <label>" + toInventoryStatusText + "</label>"+
			"				<input type='hidden' name='hdnToInvtStatusText' id = 'hdnToInvtStatusText' value='" + toInventoryStatusText + "'>"+	
			"			</tr>";
		}


		html =html+	"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF <label>" + enterQty + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>";
		if(!isempty(vBarcodeSerial))
		{
			html = html + "	 <input name='txtserial'  class='smalltextbox'  id='txtserial' value='"+vBarcodeSerial+"' type='text'/>";
		}
		else
		{
			html = html + "	 <input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>";
		}
		html = html + "				</td>"+

		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'  type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";
		html = html + "</td></tr></table></form>"+

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
	else 
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating Serial');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtserial');



		POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		POarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		POarray["custparam_lotavailableqty"] = request.getParameter('hdnlotavailableqty');
		POarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		POarray["custparam_statusflag"] = request.getParameter('hdnstatusflag');
		POarray["custparam_enterBin"] = request.getParameter('hdnEnterBin');
		POarray["custparam_enterToBin"] = request.getParameter('hdnEnterToBin');
		POarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');		
		POarray["custparam_lotno"] =request.getParameter('hdnlotno');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_fetcheditemname"]=request.getParameter('hdnItemName');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_enterBin"] = request.getParameter('hdnEnterBin');
		POarray["custparam_availableqty"] = request.getParameter('hdnAvailableQty');
		POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		POarray["custparam_enterBinText"] = request.getParameter('hdnEnterToBinText');
		POarray["custparam_enteredstatus"] = request.getParameter('hdnfromstatus');
		POarray["custparam_invtstatusName"] = request.getParameter('hdninvtstatusName');
		POarray["custparam_toStatusText"] = request.getParameter('toStatusText');
		POarray["custparam_toStatus"] = request.getParameter('hdntostatus');
		POarray["custparam_statusScanQuantity"] = request.getParameter('hdnstatusScanQuantity');
		POarray["custparam_enteredlot"] = request.getParameter('hdnenteredlot');
		POarray["custparam_enteredBinID"] = request.getParameter('hdnEntbinId');
		POarray["custparam_bcqty"] = request.getParameter('hdnBarcodeqty');
		POarray["custparam_bcuom"] = request.getParameter('hdnBarcodeuom');			
		POarray["custparam_bclot"] = request.getParameter('hdnBarcodeLot');
		POarray["custparam_bcserial"] = request.getParameter('hdnBarcodeserial');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var availableQty=request.getParameter('hdnAvailableQty');
		var itemType=request.getParameter('hdnItemType');
		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var lotno= request.getParameter('hdnlotno');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var optedEvent = request.getParameter('cmdPrevious');
		var preferBin=request.getParameter('hdnPreferBin');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var stockconversionrate = request.getParameter('hdngetStockConversionRate');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnEnterBin');
		var optedEvent = request.getParameter('cmdPrevious');	
		var getNumber=parseFloat(request.getParameter('hdnNumber'));
		var toBinInternalId=request.getParameter('hdnEnterToBin');

		var fromstatus = request.getParameter('hdnfromstatus');
		var tostatus = request.getParameter('hdntostatus');

		var inventoryStatusFeature = isInvStatusFeatureEnabled();		

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

						nlapiLogExecution('DEBUG', 'After Serial No Parsing', getSerialNo);
						var binInternalId=nswms_GetBinInternalId(enterBin,POarray["custparam_whlocation"]);
						var objBinDetails = null;
						if(inventoryStatusFeature ==true)
						{
							var filterStrat = new Array();
							if(binInternalId != null && binInternalId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
							filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
							filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
							filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

							var columnStrat=new Array();
							columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
							columnStrat[0].setSort(true);						

							var objBinDetailsGetInternalId = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

							if(objBinDetailsGetInternalId!=null && objBinDetailsGetInternalId!='')
							{

								if(objBinDetailsGetInternalId.length>0)
								{
									var vinventoryNumberBinOnHand=objBinDetailsGetInternalId[0].getValue('inventorynumber','inventoryNumberBinOnHand');
								}
							}
							var filterStrat = new Array();
							var binInternalId=nswms_GetBinInternalId(enterBin,POarray["custparam_whlocation"]);
							if(binInternalId != null && binInternalId != '' && binInternalId != 'null')
								filterStrat.push(new nlobjSearchFilter('binnumber',null,'anyof', binInternalId));
							if(FetchedItemId != null && FetchedItemId != '' && FetchedItemId != 'null')
								filterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
							if(POarray["custparam_whlocation"] != null && POarray["custparam_whlocation"] != '' && POarray["custparam_whlocation"] != 'null')
								filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', POarray["custparam_whlocation"]));						
							if(vinventoryNumberBinOnHand!= null && vinventoryNumberBinOnHand != 'null' && vinventoryNumberBinOnHand != undefined && vinventoryNumberBinOnHand != '')
								filterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'is', vinventoryNumberBinOnHand));
							if(fromstatus != null && fromstatus != '' && fromstatus != 'null')
								filterStrat.push(new nlobjSearchFilter('status', null, 'anyof', fromstatus));


							objBinDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterStrat, null);
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
										nlapiLogExecution('ERROR', 'enterQty,availableQt,vinventorynumber', enterQty+","+availableQty+","+vinventorynumber);
										if(vinventorynumber == getSerialNo)
										{
											serial_matchfound='T';
											break;
										}

									}
									if(serial_matchfound =='F')
									{
										POarray["custparam_error"] = 'Insufficient inventory for this serial#: '+getSerialNo;
										response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
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
							filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
							filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

							var columnStrat=new Array();
							columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
							columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
							columnStrat[0].setSort(true);

							objBinDetails = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									var vmakeInvAvailFlag = "T";
									var fields = ['makeinventoryavailable'];
									var vLocDetails= nlapiLookupField('location',POarray["custparam_whlocation"],fields);
									vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
									nlapiLogExecution('DEBUG', 'vmakeInvAvailFlag',vmakeInvAvailFlag);
									if(vmakeInvAvailFlag == "T")
										var availableQty=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
									else
										var availableQty=objBinDetails[0].getValue('quantityonhand','inventoryNumberBinOnHand');
									var vinventoryNumberBinOnHand=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');
									nlapiLogExecution('DEBUG', 'availableQty', availableQty);
									if(parseInt(availableQty) <= 0 || (getSerialNo != vinventoryNumberBinOnHand))
									{
										POarray["custparam_error"] = 'Insufficient inventory for this serial#: '+getSerialNo;
										response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
										return;
									}
									else
									{
										var filters = new Array();
										var columns = new Array();
										columns.push(new nlobjSearchColumn('custrecord_wmsse_sku'));
										//columns.push(new nlobjSearchColumn('custrecord_wmsse_serial_no'));	

										if(FetchedItemId != null && FetchedItemId != '')
											filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', FetchedItemId));

										if(binInternalId != null && binInternalId != '')
											filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', binInternalId));
										if(POarray["custparam_whlocation"] != null && POarray["custparam_whlocation"] != '')
											filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', POarray["custparam_whlocation"]));
										filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', 3));// 3 - PICK
										filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [8,28]));// 8 - Picking Completed,28 - Packing Completed
										filters.push(new nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is', 'T'));
										filters.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
										filters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));

										var objOpenTaskDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentask_search',filters, columns);
										var vnSerialArr="";
										var vSerialArray=new Array();
										if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
										{
											for(var z=0; z < objOpenTaskDetails.length ; z++)
											{
												var vSerialNo = objOpenTaskDetails[z].getValue('custrecord_wmsse_serial_no');
												if(vnSerialArr == null || vnSerialArr=='')
													vnSerialArr=vSerialNo;
												else
													vnSerialArr = vnSerialArr +","+vSerialNo;
											}
										}
										vSerialArray=vnSerialArr.split(',');
										nlapiLogExecution('DEBUG', 'vSerialArray',vSerialArray);

										if(vSerialArray.indexOf(getSerialNo) != -1)
										{
											POarray["custparam_error"] = 'Insufficient inventory for this serial#: '+getSerialNo;
											response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
											return;
										}

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
							nlapiLogExecution('DEBUG', 'objBinDetails inside null', '');
							POarray["custparam_error"] = 'Insufficient inventory for this serial#: '+getSerialNo;
							response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
							return;
						}
						objBinDetails=null;
						columnStrat=null;
						filterStrat=null;
						nlapiLogExecution('DEBUG', 'INTO SERIAL ENTRY');
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 9));//9--Move
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', toBinInternalId));

						var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp);
						nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{

							POarray["custparam_error"] = "Serial# already scanned";
							SrchRecordTmpSerial=null;
							response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
							return;
						}								
						else 
						{
							POarray["custparam_serialno"] = getSerialNo;
							POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
						}
						SrchRecordTmpSerial=null;
						filterssertemp=null;

						//Here we are creating serial# into new Temp Serial entry custom record

						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', getSerialNo);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', FetchedItemId);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
						customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						customrecord.setFieldValue('custrecord_wmsse_ser_bin', toBinInternalId);
						customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 9);
						var rec = nlapiSubmitRecord(customrecord, false, true);
						customrecord=null;
						nlapiLogExecution('DEBUG', '(getNumber + 1)', (parseInt(getNumber) + 1));
						nlapiLogExecution('DEBUG', 'enterQty', enterQty);
						if ((parseInt(getNumber) + 1) < parseInt(enterQty)) 
						{
							nlapiLogExecution('DEBUG', 'Scanning Serial No.');
							POarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
							return;

						}
						else
						{
							try
							{
								nlapiLogExecution('DEBUG', 'toBinInternalId', toBinInternalId);
								nlapiLogExecution('DEBUG', 'binInternalId', binInternalId);

								//var openTaskQty = parseFloat(enterQty)/parseFloat(stockconversionrate);
								var openTaskQty = Number(Big(enterQty).div(stockconversionrate).toFixed(8));

								var binTransferId='';

								if(inventoryStatusFeature == true)
								{
									binTransferId = inventoryBinTransfer(itemType,POarray["custparam_whlocation"],FetchedItemId,enterQty,
											binInternalId,toBinInternalId,lotno,POarray["custparam_actualbegintime"],
											POarray["custparam_itemunits"],stockconversionrate,openTaskQty,fromstatus,tostatus);
								}
								else
								{
									binTransferId = inventoryBinTransfer(itemType,POarray["custparam_whlocation"],FetchedItemId,
											enterQty,binInternalId,toBinInternalId,lotno,POarray["custparam_actualbegintime"],POarray["custparam_itemunits"],stockconversionrate,openTaskQty);
								}




								nlapiLogExecution('ERROR', 'Bin Transfered successfully', binTransferId);
								response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, POarray);
								return;


							}				
							catch(e)
							{
								var msgstring= e.toString();
								var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
								nlapiLogExecution('ERROR', 'inside catch exception', msg);
								POarray["custparam_error"] = msg;
								response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
								return;
							}
						}
					}
					else
					{
						POarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
						return;
					}
				} 
				else
				{
					POarray["custparam_enteredstatus"] = fromstatus;
					POarray["custparam_error"] = "";
					response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
					return;
				}
			}
			catch(e)
			{
				var msgstring= e.toString();
				var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
				nlapiLogExecution('ERROR', 'inside catch exception', msg);
				POarray["custparam_error"] = msg;
				response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
			return;
		}
	} 
} 

function multiDimensionalUnique(arr) {
	var uniques = [];
	var itemsFound = {};
	for(var i = 0, l = arr.length; i < l; i++) {
		var stringified = JSON.stringify(arr[i]);
		if(itemsFound[stringified]) { continue; }
		uniques.push(arr[i]);
		itemsFound[stringified] = true;
	}
	return uniques;
}
