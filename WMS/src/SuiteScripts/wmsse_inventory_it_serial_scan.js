/**
 * Script Description
 * In this script we can scan serial numbers for inventory transfer process
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan serial numbers in Inventory transfer process
 */
function RFInventoryITSerial(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('DEBUG', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');
		var qtyanduoms = request.getParameter('custparam_uomqtyselected');
		var whLocationName = request.getParameter('custparam_whlocationname');

		nlapiLogExecution('DEBUG', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');
		var whTOLocation = request.getParameter('custparam_towhlocation');
		var invtstatusforback = request.getParameter('custparam_enteredstatus');
		var invtstatus = request.getParameter('custparam_fromenteredstatus');
		var	invttostatus = request.getParameter('custparam_toenteredstatus');
		var	toInventoryStatusText = request.getParameter('custparam_toenteredstatustxt');

		var whTOLocationName = request.getParameter('custparam_towhlocationname');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');
		var invNumberList = request.getParameter('custparam_vinventorynumberlst');
		var availableQtyForBack=request.getParameter('custparam_FromAvailableqty');

		var getTotQty = request.getParameter('custparam_scantotqty');
		var invStatusName = request.getParameter('custparam_enteredstatusName');
		var invToStatusName = request.getParameter('custparam_enteredTostatusName');
		var lotno=request.getParameter('custparam_lotno');
		var fromBin=request.getParameter('custparam_fromBin');
		var toBin = request.getParameter('custparam_toBin');
		var fromAvailQty=request.getParameter('custparam_FromAvailableqty');
		var vFromBinId=request.getParameter('custparam_fromBinId');
		var vInvTrnsId=request.getParameter('custparam_ITId');
		var qtyFromStatusScreen = request.getParameter('custparam_lotavailableqty');
		var blnMixItem=request.getParameter('custparam_blnmixitem');
		var fromStatusScreen = request.getParameter('custparam_fromstatusscreen');
		var blnMixLot=request.getParameter('custparam_blnmixlot'); 
		var getPreferBin=request.getParameter('custparam_preferbin');
		var enterToBin=request.getParameter('custparam_toBin');
		var enterToBinId=request.getParameter('custparam_toBinInternalId');
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate');
		if(getStockConversionRate == '- None -' || getStockConversionRate == '' || getStockConversionRate == null)
			getStockConversionRate =1;
		nlapiLogExecution('DEBUG', 'getStockConversionRate', getStockConversionRate);

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('DEBUG', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-IT Inventory';
		var getPreferBin=request.getParameter('custparam_preferbin');
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;
		nlapiLogExecution('DEBUG', 'getNumber', getNumber);
		if(parseFloat(getNumber)==0)
		{
			var filterssertemp1 = new Array();

			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 18);
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', getItemInternalId);
			var columnssertemp1 = new Array();
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp1,columnssertemp1);
			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
			{	
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];
					nlapiLogExecution('DEBUG', 'TempRecord.getId()',TempRecord.getId());
					nlapiLogExecution('DEBUG', 'TempRecord.getValue(name)',TempRecord.getValue('name'));
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of discontinue of serial number scanning we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
				}  
			}
			SrchRecordTmpSerial1=null;
			filterssertemp1=null;
			columnssertemp1=null;
		}	 
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('DEBUG', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			nlapiLogExecution('DEBUG', 'imgUrl', imgUrl);
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
		"		<tr><td class='tableheading'>Inventory Transfer - Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >&nbsp;"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+

		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>From Warehouse Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>To Warehouse Location: <label>" + whTOLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Entered Qty: <label>" + parseFloat(parseFloat(getTotQty).toFixed(8)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>From Bin: <label>" + fromBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>To Bin: <label>" + enterToBin + "</label>"+
		"			</tr>";

		if(inventoryStatusFeature == true)
		{
			if(toInventoryStatusText == null || toInventoryStatusText == ''|| toInventoryStatusText == 'null'|| toInventoryStatusText == undefined)
			{
				var toInventoryStatusArray = getDefaultInventoryStatusList(invttostatus,-1,null);
				toInventoryStatusArray = toInventoryStatusArray.toString();

				var toInventoryStatus = toInventoryStatusArray.split(',');
				nlapiLogExecution('DEBUG', 'toInventoryStatus', toInventoryStatus[0]+'+'+toInventoryStatus[1]+'+'+toInventoryStatus[2]);
				toInventoryStatusText = toInventoryStatus[0];
			}
			if(invtstatus != null && invtstatus != '' && invtstatus != 'null' && invtstatus != 'undefined')
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

					var inventoryStatustx = invStatusName;
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
		}

		html = html +"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Scanned Qty: <label>" + getNumber + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdntoWhLocation' value=" + whTOLocation + ">"+	
		"				<input type='hidden' name='hdntoWhLocationName' value='" + whTOLocationName + "'>"+
		"				<input type='hidden' name='hdnTotQty' value=" + getTotQty + ">"+
		"				<input type='hidden' name='hdninvStatusName' id='hdninvStatusName' value='" + invStatusName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdninvtstatusforback' id='hdninvtstatusforback' value=" + invtstatusforback + ">"+
		"				<input type='hidden' name='hdninvNumberList' id='hdninvNumberList' value=" + invNumberList + ">"+
		"				<input type='hidden' name='hdnqtyFromStatusScreen' id='hdnqtyFromStatusScreen' value=" + qtyFromStatusScreen + ">"+
		"				<input type='hidden' name='hdnavailableQtyForBack' id='hdnavailableQtyForBack' value=" + availableQtyForBack + ">"+
		"				<input type='hidden' name='hdnfromStatusScreen' id='hdnfromStatusScreen' value=" + fromStatusScreen + ">"+	
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdnlotno' value=" + lotno + ">"+	
		"				<input type='hidden' name='hdnAvailQty' value=" + fromAvailQty + ">"+	
		"				<input type='hidden' name='hdnFromBin' value=" + fromBin + ">"+
		"				<input type='hidden' name='hdnFromBinId' value=" + vFromBinId + ">"+
		"				<input type='hidden' name='hdninvtstatus' id='hdninvtstatus' value=" + invtstatus + ">"+
		"				<input type='hidden' name='hdninvttostatus' id='hdninvttostatus' value=" + invttostatus + ">"+
		"				<input type='hidden' name='hdnITId' value=" + vInvTrnsId + ">"+		
		"				<input type='hidden' name='hdnITId' value=" + vInvTrnsId + ">"+		
		"				<input type='hidden' name='hdnITId' value=" + vInvTrnsId + ">"+		
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnEnterToBinId' value=" + enterToBinId + ">"+	
		"				<input type='hidden' name='hdnEnterToBin' value=" + enterToBin + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' value="+qtyanduoms+">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF <label>" + Number(Big(getTotQty).mul(getStockConversionRate)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"			<td align = 'left'>";
		html = html + "	 <input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>";		
		html = html + "				</td>"+
		"			</tr>"+
		"		 <table>"+
		"			<tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/>"+

		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
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
	else {

		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG', 'Processing RF', 'Validating Serial');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtserial');
		var fromStatus=request.getParameter('hdninvtstatus');
		var toStatus=request.getParameter('hdninvttostatus');

		var invtstatus = request.getParameter('custparam_fromenteredstatus');
		var	invttostatus = request.getParameter('custparam_toenteredstatus');
		var	invttostatusTxt = request.getParameter('hdnToInvtStatusText');

		POarray["custparam_fromenteredstatus"] = request.getParameter('hdninvtstatus');
		POarray["custparam_toenteredstatus"] = invttostatus;
		POarray["custparam_toenteredstatustxt"] = invttostatusTxt;

		var invStatusForBack=request.getParameter('hdninvtstatusforback');
		var invStatusName = request.getParameter('hdninvStatusName');
		POarray["custparam_enteredstatusName"] = invStatusName;
		POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		POarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		POarray["custparam_enteredstatus"] = fromStatus;
		var fromStatusScreen= request.getParameter('hdnfromStatusScreen'); 
		POarray["custparam_fromstatusscreen"] = fromStatusScreen;
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_fetcheditemname"]=request.getParameter('hdnItemName');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		POarray["custparam_towhlocation"] = request.getParameter('hdntoWhLocation');
		POarray["custparam_towhlocationname"] = request.getParameter('custparam_towhlocationname');
		POarray["custparam_scantotqty"] = request.getParameter('hdnTotQty');
		POarray["custparam_fromBinId"] = request.getParameter('hdnFromBinId');
		POarray["custparam_lotno"] =request.getParameter('hdnlotno');		 
		POarray["custparam_FromAvailableqty"] =request.getParameter('hdnAvailQty');
		POarray["custparam_fromBin"] =request.getParameter('hdnFromBin');
		POarray["custparam_ITId"] =request.getParameter('hdnITId');
		POarray["custparam_toBin"]=request.getParameter('hdnEnterToBin');
		POarray["custparam_toBinInternalId"]=request.getParameter('hdnEnterToBinId');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		POarray["custparam_uom"] = request.getParameter('hdnuom');
		POarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_lotavailableqty"] = request.getParameter('hdnqtyFromStatusScreen');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var inventoryTransferId =request.getParameter('hdnITId');
		var vFromBinId = request.getParameter('hdnFromBinId');
		var itemType=request.getParameter('hdnItemType');
		var getNumber=parseFloat(request.getParameter('hdnNumber'));
		var toBinInternalId=request.getParameter('hdnEnterToBinId');
		var toBin=request.getParameter('hdnEnterToBin');
		var lotno= request.getParameter('hdnlotno'); 
		var enterQty=request.getParameter('hdnTotQty');
		var vItemIntId= request.getParameter('hdnItemInternalId');
		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var intAvailQty=request.getParameter('hdnAvailQty');
		var optedEvent = request.getParameter('cmdPrevious');
		var vFromWHLocation= request.getParameter('hdnWhLocation'); 
		var vToWHLocation= request.getParameter('hdntoWhLocation'); 
		var preferBin= request.getParameter('hdnPreferBin'); 
		nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);
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

				var invNumberList = request.getParameter('hdninvNumberList'); 
				if(optedEvent != 'Back (F7)'){

					if(getSerialNo!=null && getSerialNo!="" && getSerialNo!='null')
					{

						nlapiLogExecution('DEBUG', 'After Serial No Parsing', getSerialNo);
						nlapiLogExecution('DEBUG', 'request.getParameter(custparam_serialno) before', request.getParameter('custparam_serialno'));


						var objBinDetails = null;
						if(inventoryStatusFeature == true)
						{

							var filterStrat = new Array();
							if(vFromBinId != null && vFromBinId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', vFromBinId));
							filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', vItemIntId));
							filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
							filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

							var columnStrat=new Array();
							columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
							columnStrat[0].setSort(true);						

							var objBinDetails_id = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
							//Only One id will be fetched hence not changing it to Load search

							if(objBinDetails_id!=null && objBinDetails_id!='')
							{
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails_id.length);
								if(objBinDetails_id.length>0)
								{
									var vinventoryNumberBinOnHand=objBinDetails_id[0].getValue('inventorynumber','inventoryNumberBinOnHand');
								}
							}


							var filterStrat = new Array();
							if(vFromBinId != null && vFromBinId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber',null,'anyof', vFromBinId));
							filterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', vItemIntId));
							filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', POarray["custparam_whlocation"]));

							if(vinventoryNumberBinOnHand!= null && vinventoryNumberBinOnHand != 'null' && vinventoryNumberBinOnHand != undefined && vinventoryNumberBinOnHand != '')
								filterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'is', vinventoryNumberBinOnHand));

							filterStrat.push(new nlobjSearchFilter('status', null, 'anyof', fromStatus));
							//It will not return more than 4000 records
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
										var availableQty=objBinDetails[i].getValue('available',null,'sum');										
										var vinventorynumber=objBinDetails[i].getText('inventorynumber',null,'group');

										nlapiLogExecution('DEBUG', 'enterQty,availableQt,vinventorynumber', enterQty+","+availableQty+","+vinventorynumber);
										if(vinventorynumber == getSerialNo)
										{

											invNumberList+=vinventorynumber;
											POarray["custparam_vinventorynumberlst"] = invNumberList;
											serial_matchfound='T';
											break;

										}

									}
									nlapiLogExecution('DEBUG', 'serial_matchfound after', serial_matchfound);
									if(serial_matchfound =='F')
									{
										POarray["custparam_error"] = 'Insufficient inventory for this serial#: '+getSerialNo;
										response.sendRedirect('SUITELET', 'customscript_wmsse_it_serial_scan', 'customdeploy_wmsse_it_serial_scan', false, POarray);
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
							if(vFromBinId != null && vFromBinId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', vFromBinId));
							filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', vItemIntId));
							filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
							filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

							var columnStrat=new Array();
							columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
							columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
							columnStrat[0].setSort(true);

							var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots_rpt',filterStrat, columnStrat);

							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									var vmakeInvAvailFlag = "T";
									var fields = ['makeinventoryavailable'];
									var vLocDetails= nlapiLookupField('location',vFromWHLocation,fields);
									vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
									nlapiLogExecution('DEBUG', 'vmakeInvAvailFlag',vmakeInvAvailFlag); 

									if(vmakeInvAvailFlag == "T")
										var availableQty=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
									else
										var availableQty=objBinDetails[0].getValue('quantityonhand','inventoryNumberBinOnHand');
									var vinventoryNumberBinOnHand=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');
									nlapiLogExecution('DEBUG', 'availableQty', availableQty);
									if(parseInt(availableQty) <= 0  || (getSerialNo != vinventoryNumberBinOnHand))
									{
										POarray["custparam_error"] = 'Insufficient inventory for this serial1#: '+getSerialNo;
										response.sendRedirect('SUITELET', 'customscript_wmsse_it_serial_scan', 'customdeploy_wmsse_it_serial_scan', false, POarray);
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
							nlapiLogExecution('DEBUG', 'objBinDetails inside null', '');
							POarray["custparam_error"] = 'Insufficient inventory for this serial2#: '+getSerialNo;
							response.sendRedirect('SUITELET', 'customscript_wmsse_it_serial_scan', 'customdeploy_wmsse_it_serial_scan', false, POarray);
							return;
						}

						objBinDetails=null;
						filterStrat=null;
						columnStrat=null; 
						nlapiLogExecution('DEBUG', 'invNumberList',invNumberList);

						nlapiLogExecution('DEBUG', 'INTO SERIAL ENTRY');
						//checking serial no's in already scanned one's from temp table
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 18));//18--Inventory Transfer
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', vItemIntId));

						var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp);
						nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{

							POarray["custparam_error"] = "Serial# already scanned";

							SrchRecordTmpSerial=null;
							response.sendRedirect('SUITELET', 'customscript_wmsse_it_serial_scan', 'customdeploy_wmsse_it_serial_scan', false, POarray);
							return;
						}								
						else {

							POarray["custparam_serialno"] = getSerialNo;

							POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
						}
						filterssertemp=null;
						//Here we are creating serial# into new Temp Serial entry custom record

						nlapiLogExecution('DEBUG', 'toBinInternalId',toBinInternalId);
						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', inventoryTransferId);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', vItemIntId);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
						customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						customrecord.setFieldValue('custrecord_wmsse_ser_bin', toBinInternalId);
						customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 18);
						var rec = nlapiSubmitRecord(customrecord, false, true);
						customrecord=null;
						nlapiLogExecution('DEBUG', '(getNumber + 1)', (parseInt(getNumber) + 1));
						nlapiLogExecution('DEBUG', 'getStockConversionRate',getStockConversionRate);

						nlapiLogExecution('DEBUG', 'enterQty', enterQty);
						nlapiLogExecution('DEBUG', 'getNumber', getNumber);
						nlapiLogExecution('DEBUG', 'parseFloat(enterQty) * parseFloat(getStockConversionRate)', Number(Big(enterQty) .mul(getStockConversionRate)));
						if ((Number(getNumber) + 1) < Number(Big(enterQty).mul(getStockConversionRate))) {
							nlapiLogExecution('DEBUG', 'Scanning Serial No.');
							POarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_it_serial_scan', 'customdeploy_wmsse_it_serial_scan', false, POarray);
							return;

						}
						else
						{
							try{


								nlapiLogExecution('DEBUG', 'toBinInternalId', toBinInternalId);
								nlapiLogExecution('DEBUG', 'vFromBinId', vFromBinId);

								var taskType="XFER";
								var openTaskId = '';
								if(inventoryStatusFeature == true)
								{
									var openTaskId = updateMoveOpenTaskforInventory(itemType,vFromWHLocation,vItemIntId,Number(Big(enterQty).toFixed(8)),vFromBinId,toBinInternalId,lotno,inventoryTransferId,taskType,vToWHLocation,'',POarray["custparam_actualbegintime"],POarray["custparam_uom"],getStockConversionRate,fromStatus,invttostatus);
									var vInvTrnId= nswms_PostInventoryTransfer(inventoryTransferId,taskType,itemType,openTaskId,fromStatus,invttostatus);
									nlapiLogExecution('DEBUG', 'Inventory transfer posted successfully', vInvTrnId);

								}
								else
								{
									updateMoveOpenTaskforInventory(itemType,vFromWHLocation,vItemIntId,Number(Big(enterQty).toFixed(8)),vFromBinId,toBinInternalId,lotno,inventoryTransferId,taskType,vToWHLocation,'',POarray["custparam_actualbegintime"],POarray["custparam_uom"],getStockConversionRate);
									var vInvTrnId= nswms_PostInventoryTransfer(inventoryTransferId,taskType,itemType);
									nlapiLogExecution('DEBUG', 'Inventory transfer posted successfully', vInvTrnId);

								}
								nlapiLogExecution('DEBUG', 'inventoryTransferId,taskType,itemType', inventoryTransferId+','+taskType+','+itemType);

								POarray["custparam_error"]='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_menu', 'customdeploy_wmsse_menu', false, POarray);
								return;


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
								response.sendRedirect('SUITELET', 'customscript_wmsse_it_serial_scan', 'customdeploy_wmsse_it_serial_scan', false, POarray);
								return;
							}
						}
					}
					else
					{
						POarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_it_serial_scan', 'customdeploy_wmsse_it_serial_scan', false, POarray);
						return;
					}
				} 
				else {
					POarray["custparam_FromAvailableqty"] = request.getParameter('hdnavailableQtyForBack');
					POarray["custparam_error"] = "";
					response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
					return;
				}
			}
			catch(e)
			{
				POarray["custparam_error"]=e;
				response.sendRedirect('SUITELET', 'customscript_wmsse_it_serial_scan', 'customdeploy_wmsse_it_serial_scan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_it_serial_scan', 'customdeploy_wmsse_it_serial_scan', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.

