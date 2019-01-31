/**
 * Script Description
 * This script is used to scan lot for bin putaway process
 */ 
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan lot number for lotnumbered items for bin putaway process
 */
function RFStageinvtLOTScan(request, response){
	if (request.getMethod() == 'GET') 
	{
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		var getOptedField = request.getParameter('custparam_option');
		
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');

		var whLocationName = request.getParameter('custparam_whlocationname');

		if(whLocation != null && whLocation !='' && (whLocationName == '' || whLocationName == 'null' || whLocationName == null || 
				whLocationName =='undefined'))
		{
			var locationRec= nlapiLoadRecord('location',whLocation);
			whLocationName = locationRec.getFieldValue('name');
		}
		
		var whCompany= request.getParameter('custparam_company');

		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');

		var availableQty=request.getParameter('custparam_availableqty');
		var enterBin=request.getParameter('custparam_enterBin');
		var enterQty=request.getParameter('custparam_enterQty');


		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		if(availableQty == null || availableQty == '')
			availableQty=0;

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		
		var domainName = fndomainName();
		
		var st0 = domainName + '-Stage Bin Transfer';
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		var binInternalId=nswms_GetBinInternalId(enterBin,whLocation);

		var stockUnit = '';
		var vUnitsType = '';
		var getStockConversionRate =1;
		var vConversionRate=1;
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		itemcolumns.push(new nlobjSearchColumn('stockunit'));
		itemcolumns.push(new nlobjSearchColumn('unitstype'));
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
		if(itemresults!=null && itemresults!='')
		{
			getFetchedItemName = itemresults[0].getValue('itemid');
			stockUnit = itemresults[0].getText('stockunit');
			vUnitsType = itemresults[0].getValue('unitstype');
		}
		var results = '';
		var uomresults = new Array();

		if(vUnitsType !=null && vUnitsType != '' && vUnitsType != 'null' && vUnitsType !='undefined')
		{
			results= getUnitsType(vUnitsType);
			var vBaseUOMSearch=getBaseUnitRate(vUnitsType);
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');				
			}	
			if(stockUnit !=null && stockUnit!='' && stockUnit !='null' && stockUnit !='undefined' && stockUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(vUnitsType,stockUnit,vConversionRate);

			}
		}
		// for UOM dropdown change
		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' &&
				qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}
		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		var vPageCount = request.getParameter('custparam_pagecount');

		if(vPageCount == null || vPageCount == '' || vPageCount == 'null' || vPageCount == 'undefined')
		{
			vPageCount = 0;
		}

		var AllowAllLots = 'T';
		var objBinDetails = fnGetPickBinDetailsLotWithExpiryDates(getItemInternalId,binInternalId,'',
				whLocation,vPageCount,makeInvAvailFlagFromSelect,vUnitsType,stockUnit,getStockConversionRate,AllowAllLots);
		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		var JSSurl ='';
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			nlapiLogExecution('ERROR', 'JSSurl', JSSurl); 
		}
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
		"<script type='text/javascript'>function validateLot(enterlot){document.getElementById('txtlot').value = enterlot ;document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = ''; return true;}</script>"+
		"	<script type='text/javascript'>function validateForm() { if(document.getElementById('txtlot').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Stage Bin Transfer - Lot#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+
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
		"				<td align = 'left' class='labelmsg'>Available Qty: <label>" + availableQty + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnEnterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnAvailableQty' id='hdnAvailableQty' value=" + availableQty + ">"+
		"				<input type='hidden' name='hdnlotno' value=" + lotno + ">"+
		"				<input type='hidden' name='hdnEnterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnuom' value=" + vUnitsType + ">"+
		"				<input type='hidden' name='hdnstockunit' value=" + stockUnit + ">"+	
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdnPageCount' id='hdnPageCount' value=" + vPageCount + ">"+	
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+		
		"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>";		
		html = html +" <input name='txtlot'  class='smalltextbox'  id='txtlot' type='text'/>";		
		html = html +"</td>"+
		"			</tr></table><tr><td><table>"+

		"			<tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink'  value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/>"+		 
		"				</td>"+
		"			</tr>";

		html = html + " </table></td></tr></table>";
		if((objBinDetails !=null && objBinDetails != '' && objBinDetails.length !=null) ||
				(makeInvAvailFlagFromSelect != null && makeInvAvailFlagFromSelect !='' && makeInvAvailFlagFromSelect !='null' 
					&& makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined && makeInvAvailFlagFromSelect != 'All') )
		{
			html = html + 	"<table  class='uomstatus-gridgap' >";			
			html = html +"<tr>";
			if(results !=null &&  results !='' && results.length>0)
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
				html=html+"<td align = 'left' class='labelmsg'>Inv Status</td></tr>";
			}

			html = html +"<tr>";
			if(results !=null &&  results !='' && results.length>0)
			{
				html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUom_OnChange();'>";
				var selectedUOM = request.getParameter('custparam_uomprevselected');
				for(var Cnt1=0; Cnt1 < results.length; Cnt1++)
				{                    	 
					var vUOM = results[Cnt1].getValue('conversionrate');
					var UOMText =results[Cnt1].getValue('unitname');
					if( ( (selectedUOM == null && getStockConversionRate == vUOM) || (selectedUOM == '' && getStockConversionRate == vUOM)  
							|| (selectedUOM =='null' && getStockConversionRate == vUOM) || (selectedUOM =='undefined'  && getStockConversionRate == vUOM )
							|| (selectedUOM == undefined && getStockConversionRate == vUOM) )|| (selectedUOM == vUOM))
					{
						html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";

					}
					else
					{

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
				html=html+"<td ><select id='invtstatuslst' name='invtstatuslst' class='labelmsg' " +
				" name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
				if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
				{

					for(var Cnt2=0; Cnt2 < statusOptsArr.length; Cnt2++)
					{                    	 
						var val = statusOptsArr[Cnt2][0];
						var StatusText =statusOptsArr[Cnt2][1];


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

			html = html + "	<table>"+
			" <tr>"+
			" <td>"+
			"	<table style='border-spacing: 0;' id='tblqtyUOM'>"+
			" <tr class='uir-machine-headerrow' colspan='3'>"+


			" <td>Lot#"+
			" </td>"+	
			" <td class='align-right'>Qty"+
			" </td>" +
			"<td></td>";
			if(inventoryStatusFeature == true)
			{
				html = html +	"			<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}
			html=html+" <td>Expiry Date"+
			" </td>"+			
			"</tr>";

			var convRate = 1;
			var selectedUOM = request.getParameter('custparam_uomprevselected');
			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
			{
				convRate =getStockCoversionRate(vUnitsType,stockUnit,selectedUOM);
			}


			for (var s = 0; s < objBinDetails.length && s < 5; s++) {
				if(s%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var lotDetails = objBinDetails[s];
				var vitemLotQty = lotDetails[1];
				var vitemLot = lotDetails[3];
				var vitemLotExp = lotDetails[4];
				var vinventoryStatus = lotDetails[5];

				vitemLotQty = Big(vitemLotQty).mul(convRate);
				html = html + "	<tr class='" + vAltClass + "'>"+
				" <td> <a href='#' onclick='return validateLot(\""+vitemLot+"\");' >"+vitemLot+" </a></td>"+
				" <td class='align-right'> "+parseFloat(parseFloat(vitemLotQty).toFixed(8))+"</td>"+
				" <td> </td>";
				if(inventoryStatusFeature == true)
				{
					html = html +	"<td align = 'left' class='status-cl-display'>"+vinventoryStatus;	
					html = html +"				</td>";	
				}
				html=html+" <td> "+vitemLotExp+"</td>"+
				"</tr>";
			}
			html = html +"		<table>	<tr>";			
			if(vPageCount>0)
			{
				html = html +"				<td align = 'left'><input name='cmdEnbPrevList' type='submit' value='Prev' onClick = 'return fnShowLoader();'/></td>";
			}
			else
			{
				html = html +"				<td >&nbsp;</td><td >&nbsp;</td>";
			}

			if((objBinDetails.length>5))
			{
				html = html +"				<td align = 'right'><input name='cmdEnbNextList' type='submit' value='Next' onClick = 'return fnShowLoader();'/></td>";
			}
			html = html +"			</tr>"+ 
			"		 </table>";


		}
		html = html + "</form>"+
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
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating Lot');

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
		POarray["custparam_fetcheditemname"]=request.getParameter('custparam_fetcheditemname');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_enterBin"] = request.getParameter('hdnEnterBin');
		POarray["custparam_availableqty"] = request.getParameter('hdnAvailableQty');
		POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		POarray["custparam_enterQty"] = request.getParameter('hdnEnterQty');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var availableQty=request.getParameter('hdnAvailableQty');
		var itemType=request.getParameter('hdnItemType');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var enterBin=request.getParameter('hdnEnterBin');
		var enterQty=request.getParameter('hdnEnterQty');
		var unitsType =  request.getParameter('hdnuom');
		var stockUnit = request.getParameter('hdnstockunit');
		var optedEvent = request.getParameter('cmdPrevious');
		var logMsg = 'POarray["custparam_lotno"] = ' + POarray["custparam_lotno"] + '<br>';

		logMsg = logMsg + 'POarray["custparam_whlocation"] = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_company"] = ' + POarray["custparam_company"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_whlocationname"] = ' + POarray["custparam_whlocationname"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_itemtype"] = ' + POarray["custparam_itemtype"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_fetcheditemid"] = ' + POarray["custparam_fetcheditemid"] + '<br>';

		logMsg = logMsg + 'POarray["custparam_enterBin"] = ' + POarray["custparam_enterBin"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_availableqty"] = ' + POarray["custparam_availableqty"] + '<br>';
		logMsg = logMsg + 'unitsType = ' + unitsType + '<br>';
		logMsg = logMsg + 'stockUnit = ' + stockUnit + '<br>';
		nlapiLogExecution('DEBUG', 'Processing BT RF - QTY', logMsg);
		logMsg="";
		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){
			nlapiLogExecution('DEBUG', 'Inside if enterLot', enterLot);
			var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
			nlapiLogExecution('DEBUG', 'invtstatuslst', makeInventoryAvailFlag);
			if(request.getParameter('cmdEnbNextList')=="Next")
			{
				POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
				POarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))+1;						
				POarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan',
						'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
				return;
			}
			if(request.getParameter('cmdEnbPrevList')=="Prev")
			{
				POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
				POarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))-1;						
				POarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan',
						'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
				return;
			}

			nlapiLogExecution('DEBUG', 'Inside if enterQty', enterQty);
			POarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'));

			var isFromStatusChange = request.getParameter('hdnfromstatuschange');
			nlapiLogExecution('DEBUG', 'isFromStatusChange', isFromStatusChange);
			if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && 
					isFromStatusChange != 'undefined' && isFromStatusChange != undefined && isFromStatusChange=='T' )
			{

				POarray["custparam_pagecount"]=0;
				POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan',
						'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
				return;

			}

			var inventoryStatusFeature = isInvStatusFeatureEnabled();
			var inventoryStatus = '';
			if(enterLot!=null && enterLot!="" && enterLot!='null')
			{
				try{
					var binInternalId=nswms_GetBinInternalId(enterBin,POarray["custparam_whlocation"]);
					POarray["custparam_lotno"] = enterLot;
					if(inventoryStatusFeature ==true)
					{
						var objBinStatusDetails = new Array();
						var lotInternalId = inventoryNumberInternalId(enterLot,POarray["custparam_whlocation"],FetchedItemId);
						if(lotInternalId == null || lotInternalId == "" || lotInternalId == 'null' ||
								lotInternalId ==undefined || lotInternalId == 'undefined')
						{									
							POarray["custparam_error"] = 'Enter/Scan valid lot.';
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan',
									'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
							return;
						}
						var systemRule_AllowExpiredItems=' ';
						systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',POarray["custparam_whlocation"]);
						var vStatusResults =  nlapiLoadSearch('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);
						var invfilterStrat =  new Array();
						if(POarray["custparam_whlocation"] != null && POarray["custparam_whlocation"] != '')
							vStatusResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', POarray["custparam_whlocation"]));
						if(FetchedItemId != null && FetchedItemId != '')
							vStatusResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
						if(binInternalId!= null && binInternalId!= '')
							vStatusResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
						if(lotInternalId != null && lotInternalId != '')
							vStatusResults.addFilter(new nlobjSearchFilter('inventorynumber',null, 'anyof', lotInternalId));
						if(systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
						{
							vStatusResults.addFilter(new nlobjSearchFilter('formuladate',null, 'onorafter',
									DateStamp()).setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
						}

						var resLen = vStatusResults.runSearch();
						var invItr=0;
						var resultSet = resLen.forEachResult(function(searchResult)	
								{
							invItr++;
							objBinStatusDetails.push(searchResult);
							if(invItr==4000)
							{
								return false;
							}
							return true;                
								});

						var vStatusDetails = new Array();
						var vOpenPickDetails = null;
						if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' &&
								objBinStatusDetails != 'undefined' && 
								objBinStatusDetails != undefined && objBinStatusDetails.length != null && objBinStatusDetails.length >0)
						{
							vOpenPickDetails = getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,
									POarray["custparam_whlocation"],unitsType,stockUnit);

							for(var stsItr=0;stsItr<objBinStatusDetails.length;stsItr++)
							{
								var	status = objBinStatusDetails[stsItr].getText('status',null,'group');					
								var	vBinQtyAvail=objBinStatusDetails[stsItr].getValue('available',null,'sum');				
								var	statusId = objBinStatusDetails[stsItr].getValue('status',null,'group');
								var	eneteredLotTxt = objBinStatusDetails[stsItr].getText('inventorynumber',null,'group');

								var openPickQty = 0;

								if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
								{

									var	vOpenPickQtyArr = vOpenPickDetails[1];
									var	vBinLotArr = vOpenPickDetails[3];
									var	vBinStatusArr = vOpenPickDetails[5];
									if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null'
										&& vBinStatusArr != 'undefined' && vBinStatusArr != undefined)
									{
										for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
										{
											var opentaskStatus = vBinStatusArr[binIterator];
											var opentaskLotText =vBinLotArr[binIterator];
											if(opentaskStatus == statusId && eneteredLotTxt==opentaskLotText)
											{
												openPickQty = vOpenPickQtyArr[binIterator];
												break;
											}
										}
									}
								}

								vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);
								if(parseFloat(vBinQtyAvail) > 0)
								{
									var currRow = [statusId,vBinQtyAvail];
									vStatusDetails.push(currRow);
								}
								if(vStatusDetails.length >= 3)
								{
									break;
								}
							}

						}
						else
						{

							POarray["custparam_error"] = 'Enterred lot# "'+enterLot+'" is not in stage Location';
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan', 'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
							return;

						}
						if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' &&
								vStatusDetails != 'undefined' && vStatusDetails != undefined &&
								vStatusDetails.length != null && vStatusDetails.length == 1)
						{
							var Row = vStatusDetails[0];
							inventoryStatus = Row[0];
							POarray["custparam_lotavailableqty"] =Number(Row[1]);  
							POarray["custparam_inventorystatus"]=inventoryStatus;
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan',
									'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
							return;

						}
						else 
						{

							POarray['custparam_enteredlot'] = lotInternalId;
							if(objBinStatusDetails.length > 1)
							{

								POarray["custparam_enteredBinID"]=binInternalId;
								POarray["custparam_enteredbin"]=enterBin;
								POarray["custparam_enteredqty"]=enterQty;
								response.sendRedirect('SUITELET', 'customscript_wmsse_stg_statusscan', 
										'customdeploy_wmsse_stg_statusscan', false, POarray);
								return;  
							}
						}
					}
					else
					{
						nlapiLogExecution('DEBUG', 'inside if', itemType);
						var resultLot = '';
						var filterStrat = new Array();


						if(FetchedItemId != null && FetchedItemId != '')
							filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
						if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '')
							filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
						if(binInternalId!= null && binInternalId!= '')
							filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));
						filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', enterLot));
						var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);

						if(objBinDetails!=null && objBinDetails!='')
						{
							nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
							if(objBinDetails.length != null)
							{
								nlapiLogExecution('DEBUG', 'objBinDetails1', objBinDetails.length);
								var tavailableQty=0;
								for(var m=0;m<objBinDetails.length;m++)
								{
									resultLot = objBinDetails[m].getText('inventorynumber','inventoryNumberBinOnHand');
									nlapiLogExecution('DEBUG', 'resultLot', resultLot);
									if(resultLot == enterLot)
									{
										tavailableQty=Big(tavailableQty).plus(objBinDetails[m].getValue('quantityavailable','inventoryNumberBinOnHand'));
									}
								}

								nlapiLogExecution('DEBUG', 'tavailableQty', tavailableQty);

								//To calculate Open Pick Quantity
								var filters = new Array();
								if(FetchedItemId != null && FetchedItemId != '')
									filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', FetchedItemId));												

								if(binInternalId != null && binInternalId != '')
									filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', binInternalId));

								if(whLocation != null && whLocation != '')
									filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', POarray["custparam_whlocation"]));

								if(enterLot != null && enterLot != '')
									filters.push(new nlobjSearchFilter('custrecord_wmsse_batch_num', null, 'is', enterLot));

								var objOpenTaskDetails = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_openpicklotqtydetails',filters, null);
								nlapiLogExecution('DEBUG', 'objOpenTaskDetails', objOpenTaskDetails);

								var conversionRate =1;
								if(stockUnit !=null && stockUnit!='' && stockUnit!='- None -')
									conversionRate = getOpenTaskStockCoversionRate(unitsType,stockUnit);
								nlapiLogExecution('DEBUG', 'conversionRate', conversionRate);
								var openPickQty = 0;

								if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
								{
									nlapiLogExecution('ERROR', 'objOpenTaskDetails.length', objOpenTaskDetails.length);
									for(var z=0; z < objOpenTaskDetails.length ; z++)
									{
										openPickQty = Big(openPickQty).plus(objOpenTaskDetails[z].getValue('formulanumeric',null,'sum'));
									}
								}

								if(openPickQty == null || openPickQty == '' || openPickQty == '- None -' || openPickQty == 'null')
									openPickQty=0;
								nlapiLogExecution('DEBUG', 'openPickQty', openPickQty);
								openPickQty = Big(openPickQty).div(conversionRate);

								tavailableQty = Big(tavailableQty).minus(openPickQty);
								nlapiLogExecution('DEBUG', 'tavailableQty', tavailableQty);

								POarray["custparam_lotavailableqty"] = Number(tavailableQty);

							}
							else
							{
								objBinDetails='';
							}
						}
						if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' ||objBinDetails.length < 1)
						{
							nlapiLogExecution('DEBUG', 'objBinDetails2');
							POarray["custparam_error"] = 'Enterred lot# "'+enterLot+'" is not in stage Location';
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan', 'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
							return;
						}

						response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
						return;
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

					response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan', 'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
					return;
				}
			}
			else
			{
				POarray["custparam_error"] = 'Please enter/scan lot#';
				response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan', 'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
				return;
			}
		} 
		else {

			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
			return;

		}
	} //end of first if condition
} //end of function.


