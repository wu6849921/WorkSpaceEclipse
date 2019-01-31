/**
 * Script Description
 * This script is used for scan lot for Bin transfer process
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan Lot for Bin transfer process.
 */
function RFInventoryBTLOT(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');
		var whLocationName = request.getParameter('custparam_whlocationname');
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');

		var availableQty = '';
		var statusScreenFlag=request.getParameter('custparam_statusScreenFlag');

		if(statusScreenFlag == 'T')
			availableQty=request.getParameter('custparam_availableqtyDetail');
		else
			availableQty=request.getParameter('custparam_availableqty');

		var enterBin=request.getParameter('custparam_enterBin');
		var blnMixItem=request.getParameter('custparam_blnmixitem');
		var blnMixLot=request.getParameter('custparam_blnmixlot'); 
		var getPreferBin=request.getParameter('custparam_preferbin');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var vBaseUnit = request.getParameter('custparam_baseunit');
		var vUnitsText = request.getParameter('custparam_unitstext');
		var VUnitType = request.getParameter('custparam_itemunitstype');
		var blnItemUnit = request.getParameter('custparam_itemunits');
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate');
		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;
		nlapiLogExecution('ERROR', 'vUnitsText:getStockConversionRate', vUnitsText+":"+getStockConversionRate);
		var errMsg='';
		var uomResult= '';

		var getPageCount = request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;

		//Fetching InventoryStatus feature is enabled or disabled
		var inventoryStatusFeature = isInvStatusFeatureEnabled();


		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');

		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}

		var binInternalId=nswms_GetBinInternalId(enterBin,whLocation);

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			nlapiLogExecution('ERROR', 'JSSurl', JSSurl); 
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);

		var st0=domainName + "-BT Inventory";
		var vConversionRate = 1;
		if(VUnitType != null && VUnitType != '')
		{	
			var vBaseUOMSearch=getBaseUnitRate(VUnitType);
			uomResult= getUnitsType(VUnitType);
			vBaseUnit='Base unit';
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
				vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
			}	

			if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
			}
		}
		nlapiLogExecution('ERROR', 'getStockConversionRate', getStockConversionRate); 
		var vUnitsText="";
		if(blnItemUnit != "" && blnItemUnit != null && blnItemUnit != "null")
		{
			vUnitsText = 'In '+ blnItemUnit;
		}
		var AllowAllLots = 'T';
		var objBinDetails = fnGetPickBinDetailsLotWithExpiryDates(getItemInternalId,binInternalId,'',whLocation,getPageCount,
				makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,vConversionRate,AllowAllLots);

		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && qtyUOMCtrlSelectedVal !='undefined' &&
				qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";

		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() { if(document.getElementById('txtlot').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html + "<script type='text/javascript'>function validateLot(enterlot){document.getElementById('txtlot').value = enterlot ;document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = ''; return true;}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Bin Transfer - Lot#</td></tr>"+
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
		"				<td align = 'left' class='labelmsg'>Available Qty: <label>" + parseFloat(parseFloat(availableQty).toFixed(8)) + " " + vUnitsText + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnEnterBin' id='hdnEnterBin' value='" + enterBin + "'>"+
		"				<input type='hidden' name='hdnAvailableQty' id='hdnAvailableQty' value=" + availableQty + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnlotno' id='hdnlotno' value=" + lotno + ">"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnvUnitsText' id='hdnvUnitsText' value='" + vUnitsText + "'>"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+	
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+	
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>";		 
		html = html +"<tr>"+		
		"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>";		
		html = html +" <input name='txtlot'  class='smalltextbox'  id='txtlot' type='text'/>";		
		html = html +"</td>"+
		"			</tr></table>"+

		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>";

		html = html + " </table></td></tr></table>";

		html = html + 	" <tr ><td  ><table  class='uomstatus-gridgap' >";			
		html = html +"<tr>";
		if(uomResult !=null &&  uomResult !='' && uomResult.length>0)
		{
			html=html+"<td align = 'left' class='labelmsg'>UOM</td>";
			//Inventorystatus Feature is enabled
			if(inventoryStatusFeature == true)
			{
				html=html+"<td class='uom-status-display'></td>";
			}

		}
		if(inventoryStatusFeature == true)
		{
			html = html +"<td align = 'left' class='labelmsg'>Inv Status</td></tr>";
		}
		else
		{
			html=html+"</tr>";
		}
		html = html +"<tr>";

		if(uomResult !=null &&  uomResult !='' && uomResult.length>0)
		{
			html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUom_OnChange();'>";
			var selectedUOM = request.getParameter('custparam_uomprevselected');
			nlapiLogExecution('ERROR', 'selectedUOM', selectedUOM);
			for(var uomCnt=0; uomCnt < uomResult.length; uomCnt++)
			{                    	 
				var vUOM = uomResult[uomCnt].getValue('conversionrate');
				var UOMText =uomResult[uomCnt].getValue('unitname');

				if( ( (selectedUOM == null && getStockConversionRate == vUOM) || (selectedUOM == '' && getStockConversionRate == vUOM)  
						|| (selectedUOM =='null' && getStockConversionRate == vUOM) || (selectedUOM =='undefined'  && getStockConversionRate == vUOM )
						|| (selectedUOM == undefined && getStockConversionRate == vUOM) )|| (selectedUOM == vUOM))
				{
					nlapiLogExecution('ERROR', 'selectedUOM if', vUOM + ' '+ UOMText);
					html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";

				}
				else
				{
					nlapiLogExecution('ERROR', 'selectedUOM else', vUOM + ' '+ UOMText);
					html = html +" <option     value="+vUOM+"> "+UOMText+"</option>";
				}
			}
			html = html+"</select></td>";
			//Inventorystatus Feature is enabled
			if(inventoryStatusFeature == true)
			{
				html=html+"<td class='uom-status-display'></td>";
			}
		}
		if(inventoryStatusFeature == true)
		{
			var statusOptsArr = getStatusOptions();
			html = html +"<td > <select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
			if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
			{


				for(var statusItr=0; statusItr < statusOptsArr.length; statusItr++)
				{                    	 
					var val = statusOptsArr[statusItr][0];
					var StatusText =statusOptsArr[statusItr][1];

					if(makeInvAvailFlagFromSelect == val)
					{
						html = html +" <option   selected  value="+val+"> "+StatusText+"</option>";

					}
					else
					{
						html = html +" <option     value="+val+"> "+StatusText+"</option>";
					}

				}
			}
			html=html+"</select></td></tr>";
		}
		html = html +"</table></td></tr>" ;


		if(objBinDetails !=null && objBinDetails != '' && objBinDetails.length !=null ||
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{
			html = html + "	<table >"+
			" <tr>"+
			" <td>"+
			"	<table style='border-spacing: 0;' id='tblqtyUOM'>"+
			" <tr class='uir-machine-headerrow' colspan='3'>"+


			" <td>Lot#"+
			" </td>"+	
			" <td class='align-right'>Qty"+
			" </td>";

			if(inventoryStatusFeature == true)
			{
				html = html +	"			<td></td>	<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}

			html = html +" <td></td>";
			html = html +" <td>Expiry Date"+
			" </td>"+
			"</tr>";

			var convRate = 1;
			var selectedInvUOM = request.getParameter('custparam_uomprevselected');
			if(selectedInvUOM != null && selectedInvUOM != '' && selectedInvUOM !='null' && selectedInvUOM !='undefined' && selectedInvUOM != undefined )
			{
				convRate =getStockCoversionRate(VUnitType,blnItemUnit,selectedInvUOM);
			}

			for (var s = 0; s < objBinDetails.length && s < 5; s++)
			{
				if(s%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var lotDetails = objBinDetails[s];
				var vitemLotQty = lotDetails[1];
				var vitemLot = lotDetails[3];
				vitemLotQty =Big(lotDetails[1]).mul(convRate);					
				//vitemLotQty = parseFloat(parseFloat(vitemLotQty).toFixed(5));
				var vitemLotExp = lotDetails[4];
				var inventoryStatus = lotDetails[5];

				html = html + "	<tr class='" + vAltClass + "'>"+
				" <td> <a href='#' onclick='return validateLot(\""+vitemLot+"\");' >"+vitemLot+" </a></td>"+
				" <td class='align-right'> "+parseFloat(parseFloat(vitemLotQty).toFixed(8))+"</td>";
				if(inventoryStatusFeature == true)
				{
					html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
					html = html +"				</td>";
				}

				html = html +" <td></td>";
				html = html +" <td> "+vitemLotExp+"</td>"+
				"</tr>";
			}


		}
		html = html +"</form>"+

		"<script type='text/javascript'>document.getElementById('txtlot').focus();</script>";

		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
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
		var enterLot=request.getParameter('txtlot');
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
		POarray["custparam_availableqtyDetail"] = request.getParameter('hdnAvailableQty');
		POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_unitstext"] = request.getParameter('hdnvUnitsText');	
		POarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
		POarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;
		var availableQty=request.getParameter('hdnAvailableQty');
		var itemType=request.getParameter('hdnItemType');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var enterBin=request.getParameter('hdnEnterBin');
		var optedEvent = request.getParameter('cmdPrevious');

		var logMsg = 'POarray["custparam_lotno"] = ' + POarray["custparam_lotno"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_whlocation"] = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_company"] = ' + POarray["custparam_company"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_whlocationname"] = ' + POarray["custparam_whlocationname"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_itemtype"] = ' + POarray["custparam_itemtype"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_fetcheditemid"] = ' + POarray["custparam_fetcheditemid"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_enterBin"] = ' + POarray["custparam_enterBin"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_availableqty"] = ' + POarray["custparam_availableqty"] + '<br>';
		logMsg = logMsg + 'getStockConversionRate = ' + getStockConversionRate + '<br>';
		nlapiLogExecution('ERROR', 'Processing BT RF - QTY', logMsg);

		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
	
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)')
		{
			nlapiLogExecution('ERROR', 'Inside if enterLot', enterLot);

			POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
			POarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'));
			var isFromStatusChange = request.getParameter('hdnfromstatuschange');
			if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' 
				&& isFromStatusChange != undefined && isFromStatusChange=='T' )
			{
				POarray["custparam_pagecount"]=0;
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET', 'customscript_wmsse_bt_lot_scan', 'customdeploy_wmsse_bt_lot_scan', false, POarray);
				return;
			}

			if(enterLot!=null && enterLot!="" && enterLot!='null')
			{
				try{

					nlapiLogExecution('ERROR', 'inside if', itemType);
					var binInternalId=nswms_GetBinInternalId(enterBin,POarray["custparam_whlocation"]);
					var objBinDetails =null;
					if(inventoryStatusFeature == true)
					{
						var  EntLotId = inventoryNumberInternalId(enterLot,POarray["custparam_whlocation"],FetchedItemId);

						if(EntLotId == null || EntLotId == '' || EntLotId == 'null' || EntLotId == undefined)
						{
							POarray["custparam_error"] = 'Enter/Scan valid lot#.';
							response.sendRedirect('SUITELET', 'customscript_wmsse_bt_lot_scan', 'customdeploy_wmsse_bt_lot_scan', false, POarray);
							return;
						}

						objBinDetails = new Array();
						var result=nlapiLoadSearch('InventoryBalance', 'customsearch_wmsse_inventorybalance');

						if(FetchedItemId != null && FetchedItemId != '' && FetchedItemId != 'null')
							result.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
						if(binInternalId !=null && binInternalId!='' && binInternalId!='null')
							result.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
						if(whLocation!= null && whLocation!= '' && whLocation!= 'null')
							result.addFilter(new nlobjSearchFilter('location',null, 'anyof', whLocation));
						if(EntLotId!= null && EntLotId!= '' && EntLotId!= 'null')
							result.addFilter(new nlobjSearchFilter('inventorynumber',null, 'anyof', EntLotId));

						nlapiLogExecution('ERROR', 'makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect);
						if(makeInvAvailFlagFromSelect != null && makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'null' &&
								makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined )
						{
							if(makeInvAvailFlagFromSelect == 'T' || makeInvAvailFlagFromSelect == 'F')
							{
								result.addFilter(new nlobjSearchFilter('inventoryavailable','inventorystatus', 'is', makeInvAvailFlagFromSelect));
							}
							else
							{
								if(makeInvAvailFlagFromSelect != 'All')
								{
									result.addFilter(new nlobjSearchFilter('status',null, 'anyof', makeInvAvailFlagFromSelect));	
								}
							}
						}

						var resLen = result.runSearch();
						var srhIterator = 0;
						var resultSet = resLen.forEachResult(function(searchResult)
								{
							srhIterator++;
							objBinDetails.push(searchResult);
							if(parseFloat(srhIterator) == 4000)
							{
								return false;
							}
							return true;                // return true to keep iterating
								});
					}
					else
					{
						var filterStrat = new Array();

						if(binInternalId != null && binInternalId != '')
							filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
						filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
						filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
						filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', enterLot));

						var columnStrat=new Array();
						columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
						columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
						columnStrat[0].setSort(true);

						objBinDetails = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
					}
					var lotStatusDetailsArr =  new Array();

					if(objBinDetails!=null && objBinDetails!='')
					{
						nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
						if(objBinDetails.length>0)
						{
							var systemRule_AllowExpiredItems=' ';
							systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',POarray["custparam_whlocation"]);
							nlapiLogExecution("Error","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);
							if(systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
							{
								var filtersExp = new Array();
								if (FetchedItemId != null && FetchedItemId != ""){
									filtersExp.push(new nlobjSearchFilter('internalid', null, 'anyof', FetchedItemId));		 
								}
								if(POarray["custparam_whlocation"] != null && POarray["custparam_whlocation"] != '' && POarray["custparam_whlocation"] != 'null')
									filtersExp.push(new nlobjSearchFilter('location', 'inventorynumber', 'anyof', POarray["custparam_whlocation"]));


								nlapiLogExecution("Error","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);

								filtersExp.push(new nlobjSearchFilter('inventorynumber','inventorynumber', 'is', enterLot));
								filtersExp.push(new nlobjSearchFilter('formuladate',null, 'onorafter',DateStamp()).setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));

								var columnsExp = new Array(); 
								var searchresultsExp = nlapiSearchRecord('item', 'customsearch_wmsse_expdate_lots', filtersExp, columnsExp);

								if(searchresultsExp == null || searchresultsExp == '' )
								{
									POarray["custparam_error"] = 'Expiry date for the given lot is less than current date';
									response.sendRedirect('SUITELET', 'customscript_wmsse_bt_lot_scan', 'customdeploy_wmsse_bt_lot_scan', false, POarray);
									return;
								}

							}

							var vOpenPickDetails=getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,POarray["custparam_whlocation"],POarray["custparam_itemunitstype"],POarray["custparam_itemunits"]);
							var vBinOpenLotArr="";
							if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
							{
								vBinOpenLotArr = vOpenPickDetails[3];
							}

							var availableQty=0;var vinventoryNumberBinOnHand='';
							var vmakeInvAvailFlag = "T";
							var fields = ['makeinventoryavailable'];
							var vLocDetails= nlapiLookupField('location',POarray["custparam_whlocation"],fields);
							vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
							for(var k=0;k<objBinDetails.length;k++)
							{
								var vInvLot='';
								var vInvLotId='';
								var statusId ='';
								if(inventoryStatusFeature == true)
								{
									vInvLot=objBinDetails[k].getText('inventorynumber',null,'group');
									vInvLotId=objBinDetails[k].getValue('inventorynumber',null,'group');
									statusId = objBinDetails[k].getValue('status',null,'group');
								}
								else
								{
									vInvLot=objBinDetails[k].getText('inventorynumber','inventoryNumberBinOnHand');
									vInvLotId=objBinDetails[k].getValue('inventorynumber','inventoryNumberBinOnHand');
								}
								if(vInvLot == enterLot)
								{
									var vOpenPickQty=0;
									if(inventoryStatusFeature == true)
									{
										if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
										{
											var	vOpenPickQtyArr = vOpenPickDetails[1];
											var	vBinLotArr = vOpenPickDetails[3];
											var	vBinStatusArr = vOpenPickDetails[5];
											nlapiLogExecution('Debug','vBinStatusArr',vBinStatusArr);
											if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null'
												&& vBinStatusArr != 'undefined' && vBinStatusArr != undefined)
											{
												for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
												{
													var opentaskStatus = vBinStatusArr[binItr];
													var opentaskLotText =vBinLotArr[binItr];													
													if(opentaskStatus == statusId && vInvLot==opentaskLotText)
													{
														vOpenPickQty = vOpenPickQtyArr[binItr];
														break;
													}
												}
											}

											nlapiLogExecution('Debug','vOpenPickQty',vOpenPickQty);

										}

									}
									else
									{

										for(var m=0;m<vBinOpenLotArr.length;m++)
										{ 
											var vOpenLot=vOpenPickDetails[3][m];
											if(vInvLot==vOpenLot)
											{
												vOpenPickQty=vOpenPickDetails[1][m];
												break;
											} 
										}
									}
									if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
										vOpenPickQty =0;
									nlapiLogExecution('ERROR', 'vOpenPickQty',vOpenPickQty);
									var vBinQtyAvail='';
									if(inventoryStatusFeature == true)
									{
										if(vmakeInvAvailFlag == "T")
											vBinQtyAvail=objBinDetails[k].getValue('available', null, 'sum');
										else
											vBinQtyAvail=objBinDetails[k].getValue('onhand', null, 'sum');
									}
									else
									{
										if(vmakeInvAvailFlag == "T")
											vBinQtyAvail=objBinDetails[k].getValue('quantityavailable','inventoryNumberBinOnHand');
										else
											vBinQtyAvail=objBinDetails[k].getValue('quantityonhand','inventoryNumberBinOnHand');
									}

									nlapiLogExecution('DEBUG', 'vBinQtyAvail',vBinQtyAvail);
									vBinQtyAvail = Big(vBinQtyAvail).minus(vOpenPickQty);
									if(vBinQtyAvail > 0 && inventoryStatusFeature == true && lotStatusDetailsArr.indexOf(statusId)==-1)
									{
										lotStatusDetailsArr.push(statusId);
									}
									availableQty=Big(availableQty).plus(vBinQtyAvail);
									if(inventoryStatusFeature == true)
									{
										vinventoryNumberBinOnHand=objBinDetails[k].getText('inventorynumber',null,'group');
									}
									else
									{
										vinventoryNumberBinOnHand=objBinDetails[k].getText('inventorynumber','inventoryNumberBinOnHand');
									}
								}
							}
							POarray["custparam_enteredlot"] = vInvLotId;

							if((parseFloat(availableQty))<=0  || (enterLot != vinventoryNumberBinOnHand))
							{
								POarray["custparam_error"] = 'Insufficient inventory for this lot#: '+enterLot;
								response.sendRedirect('SUITELET', 'customscript_wmsse_bt_lot_scan', 'customdeploy_wmsse_bt_lot_scan', false, POarray);
								return;
							}
							else
							{
								//POarray["custparam_lotavailableqty"] =parseFloat(availableQty).toFixed(5);
								POarray["custparam_lotavailableqty"] =Number(availableQty);
								nlapiLogExecution('DEBUG', 'POarray["custparam_lotavailableqty"]',POarray["custparam_lotavailableqty"]);
							}
						}
						else
						{
							objBinDetails='';
						}
					}
					if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' ||objBinDetails.length < 1)
					{
						POarray["custparam_error"] = 'Please enter/scan valid lot#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_bt_lot_scan', 'customdeploy_wmsse_bt_lot_scan', false, POarray);
						return;
					}
					columnStrat=null;
					filterStrat=null;
					POarray["custparam_lotno"] = enterLot;

					if(inventoryStatusFeature == true)
					{
						nlapiLogExecution('DEBUG', 'lotStatusDetailsArr.length', lotStatusDetailsArr.length);
						if(lotStatusDetailsArr.length > 1)
						{
							POarray["custparam_enteredBinID"]=binInternalId;
							POarray["custparam_enteredbin"]=enterBin;
							POarray["custparam_vInvLotId"] = vInvLotId;
							response.sendRedirect('SUITELET', 'customscript_wmsse_bintransfer_status', 'customdeploy_wmsse_bintransfer_status', false, POarray);
							return;  
						}
						else
						{
							var selectedStatus = objBinDetails[0].getValue('status',null,'group');
							var selectedStatusName = objBinDetails[0].getText('status',null,'group');
							POarray["custparam_enteredstatus"]=selectedStatus;
							POarray["custparam_invtstatusName"] = selectedStatusName;
						}

					}

					response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
					return;
				}
				catch(e)
				{
					nlapiLogExecution('ERROR', 'inside catch exception', e);
					POarray["custparam_error"] = e;
					response.sendRedirect('SUITELET', 'customscript_wmsse_bt_lot_scan', 'customdeploy_wmsse_bt_lot_scan', false, POarray);
					return;
				}
			}
			else
			{
				POarray["custparam_error"] = 'Please enter/scan valid lot#';
				response.sendRedirect('SUITELET', 'customscript_wmsse_bt_lot_scan', 'customdeploy_wmsse_bt_lot_scan', false, POarray);
				return;
			}
		} 
		else 
		{
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_bt_bin_scan','customdeploy_wmsse_bt_bin_scan', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.


