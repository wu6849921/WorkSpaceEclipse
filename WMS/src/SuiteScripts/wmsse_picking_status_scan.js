/**
 * Script Description
 * This script is used to scan the Order from Open orders list.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan order from open orders list
 */
function PickingStatusScan(request, response){

	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var getOptedField = request.getParameter('custparam_option');
		var enteredBin=request.getParameter('custparam_enterbin');
		var enteredItem=request.getParameter('custparam_enteritem');
		var enteredBinId=request.getParameter('custparam_enterbinid');
		var whlocation = request.getParameter('custparam_whlocation');
		var enterOrder=request.getParameter('custparam_enterorder');
		var item=request.getParameter('custparam_item');
		var enterLot =request.getParameter('custparam_enterlot');
		var getItemType=request.getParameter('custparam_itemtype');
		var trantype=request.getParameter('custparam_trantype');
		var qtyToPick=request.getParameter('custparam_itemremainingqty');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var enteredQty = request.getParameter('custparam_enteredqty');
		enteredQty = parseFloat(parseFloat(enteredQty).toFixed(5));
		var binQty=request.getParameter('custparam_itembinqty');
		var enteredLot=request.getParameter('custparam_enterlot');
		var soId=request.getParameter('custparam_soId');
		var solineno=request.getParameter('custparam_solineno');
		var customer=request.getParameter('custparam_customer');
		var vUnitsText=request.getParameter('custparam_unitstext');
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate'); 
		var getmemitemqty = request.getParameter('custparam_memitemqty'); 
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		if(vUnitsText == null || vUnitsText =='' || vUnitsText =='- None -')
			vUnitsText='';
		if(vConversionRate == '- None -' || vConversionRate == '' || vConversionRate == null)
			vConversionRate =1;
		var userAccountId = ctx.getCompany();
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		
		var whLocationName = request.getParameter('custparam_whlocationname');
		var stageFlag  = request.getParameter('custparam_hdnStageflag');
		var sendFlag  = request.getParameter('custparam_hdnSendflag');
		var SOarray=new Array();
		SOarray["custparam_ordtype"] =request.getParameter('custparam_ordtype');
		SOarray["custparam_hdnStageflag"] =stageFlag;
		SOarray["custparam_hdnSendflag"] =sendFlag;
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		SOarray["custparam_enterbin"] = request.getParameter('custparam_enterbin');
		SOarray["custparam_enterbinid"] = request.getParameter('custparam_enterbinid');
		SOarray["custparam_enteritem"] = request.getParameter('custparam_enteritem');
		SOarray["custparam_item"] = request.getParameter('custparam_item');
		SOarray["custparam_trantype"] =request.getParameter('custparam_trantype');
		SOarray["custparam_enterorder"] = request.getParameter('custparam_enterorder');
		SOarray["custparam_itembinqty"] = request.getParameter('custparam_itembinqty');
		SOarray["custparam_itemremainingqty"] = request.getParameter('custparam_itemremainingqty');
		SOarray["custparam_enterlot"] = request.getParameter('custparam_enterlot');
		SOarray["custparam_stockconversionrate"] = request.getParameter('custparam_stockconversionrate'); 
		SOarray["custparam_unitstext"] = request.getParameter('custparam_unitstext');
		SOarray["custparam_conversionrate"] = request.getParameter('custparam_conversionrate');
		SOarray["custparam_memitemqty"]=request.getParameter('custparam_memitemqty');
		SOarray["custparam_soId"] =request.getParameter('custparam_soId');
		SOarray["custparam_solineno"] =request.getParameter('custparam_solineno');
		SOarray["custparam_customer"] =request.getParameter('custparam_customer');
		SOarray["custparam_pickreportid"] =request.getParameter('custparam_pickreportid');
		SOarray["custparam_conversionrate"] =request.getParameter("custparam_conversionrate");
		SOarray["custparam_itemtype"] =request.getParameter('custparam_itemtype');
		SOarray["custparam_bcComponents"] =request.getParameter('custparam_bcComponents');

		var currentUser=getCurrentUser();

		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-CHECKIN SO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	
		}
		else
		{
			headerVar='Picking Status';
			st0 = domainName + "-Picking";
			st1 = "Enter/Scan Order#";
			st2 = "SEND";
			st3 = "PREV";
			st4 = "Enter Qty";
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


		var ordVar = "SO/TO";
		var vFOoverageChecked='F';

		if(trantype == 'salesorder')
		{
			st0 = domainName + '-SO Picking';
			ordVar = "Sales Order#";
			var vConfig=nlapiLoadConfiguration('accountingpreferences');
			if(vConfig != null && vConfig != '')
			{
				vFOoverageChecked=vConfig.getFieldValue('OVERFULFILLMENTS');
			}
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

		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		var getSOItem = '';
		var blnItemUnit ='';
		var VUnitType ='';
		var vstockunit ='';
		if(itemresults!=null && itemresults!='')
		{
			if(itemresults[0].getValue('isinactive')=="T")
			{
				SOarray["custparam_error"] = 'Entered item is inactive';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
				return;
			}

			blnItemUnit = itemresults[0].getText('stockunit');
			item = itemresults[0].getValue('itemid');
			vstockunit = itemresults[0].getText('stockunit');
			vunitstype = itemresults[0].getValue('unitstype');
			itemType = itemresults[0].recordType;
			getItemType = itemType;
		}

		var parentItemType = request.getParameter('custparam_parentItemType');
		var filters = new Array();
		var columns = new Array();
		var vType='SalesOrd';
		if(trantype == 'salesorder')
			vType='SalesOrd';
		else if(trantype == 'transferorder')
			vType='TrnfrOrd';

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 
			CSSurl = CSSfilefound.getURL();
		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");

		var uomresults= new Array();
		var results='';
		var addbtnimgUrl='';
		var delbtnimgUrl='';
		var JSSurl ='';
		var StockConversionRate =1;
		if(vunitstype != null && vunitstype != '' && vunitstype != 'null' && vunitstype != 'undefined')
		{
			results= getUnitsType(vunitstype);

			if(results != null && results != '' && results != 'null' && results != 'undefined')
			{
				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					var row = [UOMText+"_"+vQty];
					uomresults.push(row);

					if(vstockunit == UOMText)
					{
						StockConversionRate = vQty;
					}
				}
			}
		}

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
		}

		var systemRule_AllowExpiredItems='';
		systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',whlocation);
		var eneteredLotId = request.getParameter('custparam_enterlotid');

		var vStatusDetails = new Array();
		var vStatusResults = null;
		if(getItemType == "lotnumberedinventoryitem" || getItemType =="lotnumberedassemblyitem")
		{
			vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_inventorybalance');
		}
		else if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
		{
			vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh');	
		}
		else
		{
			vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_invt_item');	  
		}

		if(whlocation != null && whlocation != '')
			vStatusResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', whlocation));
		if(enteredItem != null && enteredItem != '')
			vStatusResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', enteredItem));
		if(enteredBinId != null && enteredBinId != '')
			vStatusResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', enteredBinId));
		if(eneteredLotId != null && eneteredLotId!= '' && eneteredLotId != 'null'
			&& eneteredLotId != 'undefined' && eneteredLotId != undefined)
		{
			vStatusResults.addFilter(new nlobjSearchFilter('inventorynumber',null, 'anyof', eneteredLotId));

			if(systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
			{
				vStatusResults.addFilter(new nlobjSearchFilter('formuladate',null, 'onorafter',DateStamp()).setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
			}
		}

		var resLen = vStatusResults.runSearch();
		var invItr=0;
		var resultSet = resLen.forEachResult(function(searchResult)	
				{
			invItr++;
			vStatusDetails.push(searchResult);
			if(invItr==4000)
			{
				return false;
			}
			return true;                // return true to keep iterating
				});

		var vStatusDetailsArr =  new Array();
		var eneteredLotTxt = '';
		var eneteredLotExpdate ='';
		var vOpenPickDetails ="";
		if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined' && 
				vStatusDetails != undefined && vStatusDetails.length != null && vStatusDetails.length >0)
		{
			
			var logMsg1 = 'vStatusDetails =' + vStatusDetails + '<br>';
			logMsg1 = logMsg1 + 'vStatusDetails.length = ' + vStatusDetails.length + '<br>';
			nlapiLogExecution('DEBUG', 'parameters of get', logMsg1);
			var convRate =1;
			if(vstockunit != vUnitsText)
			{			

				convRate = Number(Big(StockConversionRate).div(vConversionRate));
			}

			if(getItemType == "lotnumberedinventoryitem" || getItemType =="lotnumberedassemblyitem")
				vOpenPickDetails = getOPenTaskPickBinDetailsLot(enteredItem,enteredBinId,whlocation,vunitstype,blnItemUnit);
			else
				vOpenPickDetails = getOPenTaskPickBinDetails(enteredItem,enteredBinId,whlocation,vunitstype,blnItemUnit,'','');

			nlapiLogExecution('DEBUG', 'vOpenPickDetails', vOpenPickDetails);

			if((getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem" || 
					getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem"))
			{
				eneteredLotTxt = vStatusDetails[0].getText('inventorynumber',null,'group');
				eneteredLotExpdate = vStatusDetails[0].getValue('expirationdate','inventorynumber','group');
			}
			var statusArr = new Array();

			for(var statusIterator=0;statusIterator<vStatusDetails.length;statusIterator++)
			{
				var status = '';
				var vBinQtyAvail ='';
				var statusId = '';
				if((getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem" || 
						getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem"))
				{
					status = vStatusDetails[statusIterator].getText('status',null,'group');					
					vBinQtyAvail=vStatusDetails[statusIterator].getValue('available',null,'sum');				
					statusId = vStatusDetails[statusIterator].getValue('status',null,'group');
				}
				else
				{
					status = vStatusDetails[statusIterator].getText('status');					
					vBinQtyAvail=vStatusDetails[statusIterator].getValue('available');				
					statusId = vStatusDetails[statusIterator].getValue('status');
				}
				nlapiLogExecution('DEBUG', 'vBinQtyAvail  bef', vBinQtyAvail);
				var openPickQty = 0;
				if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
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
							for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
							{
								var opentaskStatus = vBinStatusArr[binIterator];
								var opentaskLotText =vBinLotArr[binIterator];
																
								var logMsg1 = 'opentaskStatus =' + opentaskStatus + '<br>';
								logMsg1 = logMsg1 + 'statusId = ' + statusId + '<br>';
								logMsg1 = logMsg1 + 'eneteredLotTxt = ' + eneteredLotTxt + '<br>';
								logMsg1 = logMsg1 + 'opentaskLotText = ' + opentaskLotText + '<br>';
								nlapiLogExecution('DEBUG', 'parameters of lot', logMsg1);
								
								
								if(opentaskStatus == statusId && eneteredLotTxt==opentaskLotText)
								{
									openPickQty = vOpenPickQtyArr[binIterator];
									break;
								}
							}
						}

						nlapiLogExecution('Debug','openPickQty',openPickQty);

					}
				}
				else
				{
					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{
						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinStatusArr = vOpenPickDetails[3];
						if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined'
							&& vBinStatusArr != undefined)
						{
							for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
							{
								var opentaskStatus = vBinStatusArr[binIterator];

								if(opentaskStatus == statusId)
								{
									openPickQty = vOpenPickQtyArr[binIterator];
									break;
								}
							}
						}
					}
				}
				var logMsg1 = 'openPickQty =' + openPickQty + '<br>';
				logMsg1 = logMsg1 + 'openPickQty = ' + openPickQty + '<br>';
				nlapiLogExecution('DEBUG', 'parameters qty in get', logMsg1);
				
				vBinQtyAvail=new Big(vBinQtyAvail);
				openPickQty=new Big(openPickQty);
				vBinQtyAvail=Number(vBinQtyAvail.minus(openPickQty));
				nlapiLogExecution('DEBUG', 'vBinQtyAvail in Big after', vBinQtyAvail);
				if(parseFloat(vBinQtyAvail) > 0)
				{
					if(statusArr.indexOf(statusId)==-1)
					{
						vBinQtyAvail=new Big(vBinQtyAvail);
						convRate=new Big(convRate);
						vBinQtyAvail=Number(vBinQtyAvail.mul(convRate));
						nlapiLogExecution('DEBUG', 'vBinQtyAvail Big in status if', vBinQtyAvail);
						var currRow = [status,vBinQtyAvail,statusId];
						statusArr.push(statusId);
						vStatusDetailsArr.push(currRow);
					}
					else
					{
						vBinQtyAvail=new Big(vBinQtyAvail);
						convRate=new Big(convRate);
						vBinQtyAvail=Number(vBinQtyAvail.mul(convRate));
						nlapiLogExecution('DEBUG', 'vBinQtyAvail Big in status else', vBinQtyAvail);


						var indx = statusArr.indexOf(statusId);
						var Row = vStatusDetailsArr[indx];
						var qty = Row[1];

						qty=new Big(qty);
						vBinQtyAvail=new Big(vBinQtyAvail);
						var totalQty = Number(qty.plus(vBinQtyAvail));
						nlapiLogExecution('DEBUG', 'totalQty in Big', totalQty);
						var currRow = [status,totalQty,statusId];
						vStatusDetailsArr[indx]=currRow;
					}
				}
			}
		}

		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_Fulfillment');
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

		//This function is to validate the form when Enter button or save button is clicked.
		html = html + "<script type='text/javascript'>function validate_selectedStatus(statusId,selectedQty){" +
		"var enteredQty = document.getElementById('hdnEnteredQty').value;if(parseFloat(selectedQty) < parseFloat(enteredQty)){" +
		" document.getElementById('div_error').innerHTML = 'Selected qty is less than required quantity.' ;return false;}" +
		"document.getElementById('hdnenetedstatus').value = statusId;document.forms['_rf_Fulfillment'].submit();" +
		"document.getElementById('loading').style.display = 'block'; return true;}</script>";

		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};" +
		"</script></head><body  onkeydown='return OnKeyDown_CL();'>";		
		html = html +"	<form name='_rf_Fulfillment' method='POST'>";
		html=html+"<input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick=' return validateForm_multiordQty();'/>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+
		"		<table>"+		
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin Location: <label> " + enteredBin+"</label>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item:  <label>" + item+"</label>"+
		"				</td>"+
		"			</tr>";
		if(enterLot !=null && enterLot!='' && enterLot!='null' && enterLot !='undefined')
		{
			html = html +"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Lot#:  <label>" + enterLot+"</label>"+
			"				</td>"+
			"			</tr>";
		}
		html = html +"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + enterOrder+"</label>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Qty To Pick: <label>" + parseFloat(parseFloat(enteredQty).toFixed(5)) +"  " + vUnitsText + "</label>"+
		"				</td>"+
		"			</tr>";

		html=html+"			<tr>";

		html = html +"				<td align = 'left' class='labelmsg'>";

		html = html +"	<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnEnteredQty' id='hdnEnteredQty' value=" + enteredQty + ">"+
		"				<input type='hidden' name='hdnEnteredBin' id='hdnEnteredBin' value=" + enteredBin + ">"+
		"				<input type='hidden' name='hdnEnteredItem' value='" + enteredItem + "'>"+
		"				<input type='hidden' name='hdnEnteredBinId' id='hdnEnteredBinId' value=" + enteredBinId + ">"+
		"				<input type='hidden' name='hdnitem' value='" + item + "'>"+
		"				<input type='hidden' name='hdnOrder' value='" + enterOrder + "'>"+
		"				<input type='hidden' name='hdnTrantype' value='" + trantype + "'>"+
		"				<input type='hidden' name='hdnQtyToPick' id='hdnQtyToPick' value=" + qtyToPick + ">"+
		"				<input type='hidden' name='hdnbinRemainingQty' id='hdnbinRemainingQty' value='" + binQty + "'>"+
		"				<input type='hidden' name='hdnEnteredLot' value='" + enteredLot + "'>"+
		"				<input type='hidden' name='hdnsoId' value='" + soId + "'>"+
		"				<input type='hidden' name='hdnsolineno' value='" + solineno + "'>"+
		"				<input type='hidden' name='hdncustomer' value='" + customer + "'>"+
		"				<input type='hidden' name='hdnvFOoverageChecked' id='hdnvFOoverageChecked' value=" + vFOoverageChecked + ">"+	
		"				<input type='hidden' name='hdntrantype' value='" + trantype + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnitsText + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+		
		"				<input type='hidden' name='hdnvstockunit' id='hdnvstockunit' value=" + vstockunit + ">"+
		"				<input type='hidden' name='hdnvunitstype' id='hdnvunitstype' value=" + vunitstype + ">"+
		"				<input type='hidden' name='hdnvMemitemqty' id='hdnvMemitemqty' value=" + getmemitemqty + ">"+
		"				<input type='hidden' name='hdnitemtype' id='hdnitemtype' value=" + itemType + ">"+
		"               <input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnvStageScanRequired' value='" +vStageScanRequired+"'>"+
		"				<input type='hidden' name='hdnparentitemtype' value='" +parentItemType+"'>"+		
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnStageflag' value='"+stageFlag+"'>"+
		"				<input type='hidden' name='hdnSendflag' value='"+sendFlag+"'>"+
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+
		"				<input type='hidden' name='hdnenteredlotid' id='hdnenteredlotid' value = "+eneteredLotId+" >"+
		"				<input type='hidden' name='hdnenetedstatus' id='hdnenetedstatus'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value='" + whlocation + "'>"+
		"				</td>"+
		"			</tr></table>";
		if(vStatusDetailsArr !=null && vStatusDetailsArr!='' && vStatusDetailsArr.length > 0)
		{
			html = html + 	" <tr><td></td></tr><tr><td></td></tr><tr ><td  ><table  style='border-spacing: 0;' id='tblqtyUOM'>";	
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td  class='status-rw-display'>Inv Status"+	
			"				</td>"+
			"				<td ></td><td class='align-right'>Qty"+	
			"				</td>";	
			if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
			{
				html = html +"				<td ></td>" +
				"<td>Expiry Date"+	
				"				</td>";	
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			for(var b=0;b<vStatusDetailsArr.length;b++)
			{
				if(b%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';

				var currValues = vStatusDetailsArr[b];
				var vStatus = currValues[0];
				var vQty = currValues[1];
				var vStatusId = currValues[2];

				//case # 201412820 start
				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td class='status-cl-display'>" +
				"<a onclick='return validate_selectedStatus(\""+vStatusId+"\",\""+parseFloat(parseFloat(vQty).toFixed(5))+"\");' href='#' >"+vStatus;	
				html = html +"				</a></td>";
				html = html +"				<td></td>";
				html = html +"				<td  class='align-right'>"+parseFloat(parseFloat(vQty).toFixed(5));
				html = html +"				</td>";
				if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
				{
					if(eneteredLotExpdate ==null || eneteredLotExpdate =='' || eneteredLotExpdate =='null'||
							eneteredLotExpdate == 'undefined' ||  eneteredLotExpdate == undefined)
						eneteredLotExpdate="";
					html = html +"				<td></td>";
					html = html +"				<td>"+eneteredLotExpdate;
					html = html +"				</td>";	
				}

				html = html +"			</tr>";
			}

			html = html + 	"</table></td></tr>";	
		}
		html=html+"		<table>	<tr>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/></td>"+
		"			</tr>";
		html = html +"				</table>"+		
		"	</form>";	
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html=html+"</body>"+
		"</html>";			

		response.write(html);

	}
	else 
	{
		var optedField = request.getParameter('enterbin');
		var optedEvent = request.getParameter('cmdPrevious');
		var SOarray=new Array();

		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_ordtype"] =ordType;
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		var enteredQty = request.getParameter('hdnEnteredQty');
		SOarray["custparam_enteredqty"] = enteredQty;

		SOarray["custparam_hdnStageflag"] = request.getParameter('hdnStageflag');
		SOarray["custparam_hdnSendflag"] =request.getParameter('hdnSendflag');;
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_enterbin"] = request.getParameter('hdnEnteredBin');
		SOarray["custparam_enterbinid"] = request.getParameter('hdnEnteredBinId');
		SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
		SOarray["custparam_item"] = request.getParameter('custparam_item');
		SOarray["custparam_trantype"] =request.getParameter('hdnTrantype');
		SOarray["custparam_enterorder"] = request.getParameter('hdnOrder');
		SOarray["custparam_itembinqty"] = request.getParameter('hdnbinRemainingQty');
		SOarray["custparam_itemremainingqty"] = request.getParameter('hdnQtyToPick');
		SOarray["custparam_enterlot"] = request.getParameter('hdnEnteredLot');
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		SOarray["custparam_unitstext"] = request.getParameter('hdnuom');
		SOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		SOarray["custparam_memitemqty"]=request.getParameter('hdnvMemitemqty');
		SOarray["custparam_sointernalid"] = request.getParameter('hdnsoId');
		SOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		SOarray["custparam_parentItemType"] = request.getParameter('hdnparentitemtype');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var eneteredLotId = request.getParameter('hdnenteredlotid');
		SOarray["custparam_enterlotid"] = eneteredLotId;
		var vConversionRate = request.getParameter('hdnvConversionRate');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var whlocation = request.getParameter('custparam_whlocation');
		var soInternalId = request.getParameter('hdnsoId');
		SOarray["custparam_soId"] =soInternalId;
		var soLineno = request.getParameter('hdnsolineno');
		SOarray["custparam_solineno"] =soLineno;
		var customer =request.getParameter('hdncustomer');
		SOarray["custparam_customer"] =customer;
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;
		var foOverageCheck=request.getParameter('hdnvFOoverageChecked');
		var context = nlapiGetContext();
		var userAccountId = context.getCompany();

		var itemType = request.getParameter('hdnitemtype');

		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');
		var enteredBin = request.getParameter('hdnEnteredBinId');
		var enteredItem=request.getParameter('hdnEnteredItem');
		var inventoryStatus = request.getParameter('hdnenetedstatus');
		SOarray["custparam_inventorystatus"] = inventoryStatus;
		if (sessionobj!=context.getUser()) 
		{
			try
			{

				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}

				if (optedEvent == 'Back (F7)') {
					response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan',
							'customdeploy_wmsse_picking_qty_scan', false, SOarray);									
					return;
				}
				else
				{

					if(inventoryStatus == "" || inventoryStatus == "null" || inventoryStatus == null || inventoryStatus == undefined
							|| inventoryStatus == 'undefined')
					{
						SOarray["custparam_error"]='Please select valid status.';
						response.sendRedirect('SUITELET', 'customscript_wmsse_picking_statusscan',
								'customdeploy_wmsse_picking_statusscan', false, SOarray);
						return; 
					}

					var enterOrder=request.getParameter('hdnOrder');
					var enterQty = enteredQty;
					if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
					{
						enterQty = request.getParameter('hdntotaluomqtyentered');						
					}

					SOarray["custparam_enterqty"] =enterQty;
					var enteredLot=request.getParameter('hdnEnteredLot');
					var trantype = request.getParameter('hdnTrantype');

					var itemType = request.getParameter('hdnitemtype');

					if(itemType == null || itemType == '' || itemType == 'null' || itemType == undefined)
					{
						itemType = nswms_GetItemType(enteredItem, whlocation);
					}

					SOarray["custparam_enteredqty"] =enterQty;
					SOarray["custparam_trantype"] =trantype;

					if(enterQty==null || enterQty=='' || enterQty == "null" || enterQty == 'undefined')
					{
						SOarray["custparam_error"]='Please enter/scan qty';
						response.sendRedirect('SUITELET', 'customscript_wmsse_picking_statusscan',
								'customdeploy_wmsse_picking_statusscan', false, SOarray);
						return; 
					}
					else
					{
						var itemRemainingQty = request.getParameter('hdnQtyToPick');
						var binAvailQty = request.getParameter('hdnbinRemainingQty');
						var overageAllowed = request.getParameter('hdnvFOoverageChecked');
						var vstockunit = request.getParameter('hdnvstockunit');
						var vunitstype = request.getParameter('hdnvunitstype');

						var vconversionrate = getCoversionRate(vunitstype,vstockunit);

						if(vconversionrate == null || vconversionrate =='' || vconversionrate == 'null' || vconversionrate == 'undefined')
						{
							vconversionrate = 1;
						}

						try{						

							var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockbin');
							if (itemType == "noninventoryitem" ||itemType == "otherchargeitem" ||
									itemType == "serviceitem" ||itemType == "downloaditem"  || itemType == "giftcertificateitem")
							{
								enteredBin = request.getParameter('hdnEnteredBin');
								LockRecord.setFieldValue('name',enteredBin);
								enteredBin = '';
							}																					
							else
							{
								LockRecord.setFieldValue('name',enteredBin);
							}
							LockRecord.setFieldValue('custrecord_wmse_lock_sku',enteredItem);
							LockRecord.setFieldValue('custrecord_wmsse_lock_binlocation',enteredBin);										
							LockRecord.setFieldValue('custrecord_wmsse_lock_flag','T');
							LockRecord.setFieldValue('custrecord_wmsse_lock_unittype',vunitstype);
							LockRecord.setFieldValue('custrecord_wmsse_lockqty',enterQty);
							LockRecord.setFieldValue('custrecord_wmsse_lockuser',context.getUser());
							LockRecord.setFieldValue('custrecord_wmsse_lock_stockunit',vstockunit);
							LockRecord.setFieldValue('custrecord_wmsse_lock_conversionrate',vconversionrate);
							LockRecord.setFieldValue('custrecord_wmsse_lock_itemtype',itemType);
							if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
							{
								LockRecord.setFieldValue('custrecord_wmsse_lock_seriallot',enteredLot);
							}
							LockRecord.setFieldValue('custrecord_wmsse_lock_invtstatus',inventoryStatus);	
							var recid = nlapiSubmitRecord(LockRecord);

							LockRecord=null;
						}
						catch(e)
						{
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


							response.sendRedirect('SUITELET', 'customscript_wmsse_picking_statusscan',
									'customdeploy_wmsse_picking_statusscan', false, SOarray);
							return; 
						}

						lockresults=null;									
						lockfilters=null;

						var validPickReport = funtoCheckPickReportNo(getPickreportid,whlocation,enterOrder,enteredItem,soLineno,trantype);
						if(validPickReport != null  && validPickReport !='')
						{
							var parentSku = validPickReport[0].getValue('custrecord_wmsse_parent_sku_no');
							var parentItemType = nswms_GetItemType(parentSku, whlocation);

							if(parentItemType == 'kititem')
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
								var memItemExpectedQty = request.getParameter('custparam_memitemqty');
								var isItLastPick='F';

								if(vunitstype != null && vunitstype != '')
								{	
									var vBaseUOMSearch=getBaseUnitRate(vunitstype);

									vBaseUnit='Base unit';
									if(vBaseUOMSearch != null && vBaseUOMSearch != '')
									{
										vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
										vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
									}	

									if(vstockunit !=null && vstockunit!='' && vstockunit !='null' && vstockunit !='undefined' &&
											vstockunit !='- None -')
									{
										vconversionrate =getStockCoversionRate(vunitstype,vstockunit,vConversionRate);
									}
									if(vconversionrate == null || vconversionrate =='' || vconversionrate == 'null' ||
											vconversionrate == 'undefined')
									{
										vconversionrate = 1;
									}
								}

								var itemType = nswms_GetItemType(enteredItem, whlocation);

								if (itemType == "inventoryitem"  ||itemType == "noninventoryitem" ||itemType == "otherchargeitem" 
									||itemType == "serviceitem" ||itemType == "downloaditem"  || itemType == "giftcertificateitem" || 
									itemType == "assemblyitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
								{

									var soLineItemDetails = getSOLineDetailskit(SOarray["custparam_soId"],trantype,parentSku,
											SOarray["custparam_whlocation"]);																
									var vmainItemQty='';
									var actualBeginTime=TimeStamp();
									var vMultiShipping='F';
									var vShipVia='';
									//To fetch Line level multi shipping flag and ship via validation
									if(soLineItemDetails !=null && soLineItemDetails!="")
									{					
										for(var z=0;z<soLineItemDetails.length;z++)
										{
											var vsoLine = soLineItemDetails[z].getValue('line',null,'group');
											if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1)
													&& trantype == 'transferorder'))
											{
												vMultiShipping = soLineItemDetails[z].getValue('ismultishipto',null,'group');
												vmainItemQty = soLineItemDetails[z].getValue('quantitycommitted',null,'max');
												if(vMultiShipping ==  null || vMultiShipping =='')
													vMultiShipping='F';
												vShipVia=soLineItemDetails[z].getValue('shipmethod',null,'group');
												break;
											}			

										}	

									}

									updateOpenTask(soInternalId,enteredItem,soLineno,Number(Big(enterQty).toFixed(5)),enteredBin,itemType,whlocation,
											enteredLot,'','','',soInternalId,null,null,null,taskType,null,null,null,"F",trantype,
											actualBeginTime,customer,'',Number(Big(memItemExpectedQty).toFixed(5)),Number(Big(enterQty).toFixed(5)),parentSku,'T',null,null,null,
											vShipVia,null,ordType,department,vclass,getPickreportid,null,inventoryStatus);
									context.setSessionObject('record', 'created'); 
									var soLineDetails = getSOLineDetailskit(SOarray["custparam_soId"],trantype,parentSku
											,SOarray["custparam_whlocation"]);
									if(soLineDetails !=null && soLineDetails!="")
									{
										var vLinecount=0;
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
												var vcoitem = searchResult.getValue('memberitem','item','group');

												if(vsoitemCommitedQty == null || vsoitemCommitedQty =='' || vsoitemCommitedQty =='null' || vsoitemCommitedQty =='undefined')
													vsoitemCommitedQty = 0;
												if(vsoitemRcvQty == null || vsoitemRcvQty =='' || vsoitemRcvQty =='null' || vsoitemRcvQty =='undefined')
													vsoitemRcvQty = 0;
												if(parseFloat(vSoLine) == parseFloat(soLineno))
												{
													if(parseFloat(vsoitemRcvQty) >= parseFloat(vsoitemCommitedQty))
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
										soLineDetails=null;
									}

									if(isItLastPick!=null && isItLastPick!='' && isItLastPick=="T")
									{
										// for main item
										var mianItemOPenTaskid = updateOpenTask(soInternalId,parentSku,soLineno,Number(Big(vmainItemQty).toFixed(5)),enteredBin,
												itemType,SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,'PICK',
												SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
												SOarray["custparam_cartonweight"],"F",trantype,actualBeginTime,
												SOarray["custparam_customer"],'','','','','F',null,null,null,vShipVia,null,ordType,
												department,vclass,getPickreportid,null,inventoryStatus);
										context.setSessionObject('record', 'created'); 

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
											if(opentaskordersearchresultkit != null && opentaskordersearchresultkit !='')
											{
												for(var k=0;k<opentaskordersearchresultkit.length;k++)
												{
													var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',opentaskordersearchresultkit[k].getId());
													var expQty = loadRec.getFieldValue('custrecord_wmsse_expe_qty');
													loadRec.setFieldValue('custrecord_wmsse_act_qty',expQty);
													nlapiSubmitRecord(loadRec);
												}
												opentaskordersearchresultkit=null;
											}
											if(SOarray["custparam_orderlevel"] =="F" && mianItemOPenTaskid != null && mianItemOPenTaskid != '' 
												&& vStageScanRequired == "F")
											{
												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
												loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												nlapiSubmitRecord(loadRec);
												loadRec=null;
											}

											var vRedirectionFlag="F";
											var deviceUploadFlag = 'T';
											var columnsOpen = new Array();
											var filtersOpen = new Array();

											if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
												filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
											if(SOarray["custparam_whlocation"] !=null && SOarray["custparam_whlocation"]!='' && SOarray["custparam_whlocation"]!='null'
												&& SOarray["custparam_whlocation"] !='undefined')
											{
												filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', SOarray["custparam_whlocation"]));
											}
											var vSOLineDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask',
													'customsearch_wmsse_pick_with_picklist', filtersOpen, columnsOpen);
											if(vSOLineDetails != null && vSOLineDetails != '' && vSOLineDetails != 'null' &&
													vSOLineDetails!='undefined' && vSOLineDetails.length>0)
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
													var vLineNo=vSOLineDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

													if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
														vPickedQty=0;
													if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
														vPickGenQty=0;

													vPickGenQty=new Big(vPickGenQty);
													vPickedQty=new Big(vPickedQty);
													var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
													nlapiLogExecution('DEBUG','vRemainingQty22 in Big',vRemainingQty);

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
															var vSOOrderDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist',
																	filtersOpenPicked, columnsOpenPicked);
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
																	var vLineNo=vSOOrderDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

																	if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
																		vPickedQty=0;
																	if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
																		vPickGenQty=0;

																	vPickGenQty=new Big(vPickGenQty);
																	vPickedQty=new Big(vPickedQty);
																	var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
																	nlapiLogExecution('DEBUG','vRemainingQty23 in BIg',vRemainingQty);

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
											if(vRedirectionFlag == "T")
											{
												if(request.getParameter('hdnSendflag')=='New Order')
												{
													var SOarray = new Array();
													SOarray["custparam_error"] ='';
													SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
													SOarray["custparam_enterbinid"] =enteredBin;
													SOarray["custparam_language"] = getLanguage;
													SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
													SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
													SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
													SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
													response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan',
															'customdeploy_wmsse_picking_item_scan', false, SOarray);
													return;
												}
												else if(request.getParameter('hdnStageflag')=='PickAndStage')
												{
													SOarray["custparam_error"] ='';
													SOarray["custparam_soid"]=SOarray["custparam_enterorder"];
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan',
															'customdeploy_wmsse_multiord_stagescan', false, SOarray);
													return;
												}
												else
												{
													if(deviceUploadFlag=='T' && SOarray["custparam_orderlevel"] =="T")
													{
														if(mianItemOPenTaskid != null && mianItemOPenTaskid != ''  && 
																vStageScanRequired == 'F')
														{	
															var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
															loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
															nlapiSubmitRecord(loadRec);
															loadRec=null;
														}
													}
													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan',
															'customdeploy_wmsse_multiord_binscan', false, SOarray);
													return;
												}
											}
											else
											{
												if(vStageScanRequired=='T')
												{
													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan',
															'customdeploy_wmsse_multiord_stagescan', false, SOarray);
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
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan',
															'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
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

										if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null'
											&& getPickreportid!='undefined')
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
												var vLineNo=vSOLineDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

												if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
													vPickedQty=0;
												if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
													vPickGenQty=0;

												vPickGenQty=new Big(vPickGenQty);
												vPickedQty=new Big(vPickedQty);
												var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
												nlapiLogExecution('DEBUG','vRemainingQty33 in Big',vRemainingQty);

												if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
													vRemainingQty=0;
												if(parseFloat(vRemainingQty) > 0)
												{
													vRedirectionFlag = "T";
													break;
												}
											}
										}
										if(vRedirectionFlag == "T")
										{
											if(request.getParameter('hdnSendflag')=='New Order')
											{
												var SOarray = new Array();
												SOarray["custparam_error"] ='';
												SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
												SOarray["custparam_enterbinid"] =enteredBin;
												SOarray["custparam_language"] = getLanguage;
												SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
												SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
												SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
												SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
												response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan',
														'customdeploy_wmsse_picking_item_scan', false, SOarray);
												return;
											}
											else if(request.getParameter('hdnStageflag')=='PickAndStage')
											{
												SOarray["custparam_error"] ='';
												SOarray["custparam_soid"]=SOarray["custparam_enterorder"];
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 
														'customdeploy_wmsse_multiord_stagescan', false, SOarray);
												return;
											}
											else
											{

												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan',
														'customdeploy_wmsse_multiord_binscan', false, SOarray);
												return;
											}
										}
										else
										{
											if(vStageScanRequired=='T')
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan',
														'customdeploy_wmsse_multiord_stagescan', false, SOarray);
												return;
											}
											else
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan',
														'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
												return;
											}
										}
									}
								}
								else
								{
									SOarray["custparam_error"] ='';
									SOarray["custparam_parentSkuType"] =parentItemType;
									SOarray["custparam_parentSku"] =parentSku;
									SOarray["custparam_fromscreen"] ='statusscreen';
									response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan',
											'customdeploy_wmsse_multiord_serialscan', false, SOarray);
									return;
								}
							}
							else
							{
								var itemType = nswms_GetItemType(enteredItem, whlocation);
								if (itemType == "inventoryitem"  ||itemType == "noninventoryitem" ||itemType == "otherchargeitem" 
									||itemType == "serviceitem" ||itemType == "downloaditem"  || itemType == "giftcertificateitem" ||
									itemType == "assemblyitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
								{
									var soLineItemDetails = getSOLineDetailsNew(enterOrder,trantype,enteredItem,whlocation);

									var vMultiShipping='F';
									var vShipVia='';
									var vSoreminqty =0;
									//To fetch Line level multi shipping flag and ship via validation
									if(soLineItemDetails !=null && soLineItemDetails!="" && soLineItemDetails !='null' && 
											soLineItemDetails != 'undefined' && soLineItemDetails.length != null)
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

												vShipVia=soLineItemDetails[z].getValue('shipmethod',null,'group');
												break;
											}			

										}	

									}
									var isItLastPick='F';
									var soLineDetails = null;
									if(parseFloat(vSoreminqty) > 0)
									{
										soLineDetails = getSOLineDetailsNew(enterOrder,trantype,null,whlocation);
									}
									if(soLineDetails !=null && soLineDetails!="" && vStageScanRequired=='F')
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
											var totalNSPickedQtyIndex =37;
											var ERPConfirmedQty =38;
											for(var x1=0;x1<vColumnslist.length;x1++)
											{
												var summaryLabel = vColumnslist[x1].getLabel();
												var name = vColumnslist[x1].getName();
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
												if(vsoitemCommitedQty == null || vsoitemCommitedQty =='' || vsoitemCommitedQty =='null' || vsoitemCommitedQty =='undefined')
													vsoitemCommitedQty = 0;
												if(vsoitemfulfillQty == null || vsoitemfulfillQty =='' || vsoitemfulfillQty =='null' || vsoitemfulfillQty =='undefined')
													vsoitemfulfillQty = 0;
												if(vsoitemPickedQty == null || vsoitemPickedQty =='' || vsoitemPickedQty =='null' || vsoitemPickedQty =='undefined')
													vsoitemPickedQty = 0;
												var vsoitemRemQty = (parseFloat(vsoitemCommitedQty) + parseFloat(vsoitemfulfillQty)) - parseFloat(vsoitemPickedQty);
												if(vsoitemMultiShipping ==  null || vsoitemMultiShipping =='')
													vsoitemMultiShipping='F';
												if(vsoitemMultiShipping == "F")
												{
													if(parseFloat(vsoitemRemQty)>0)
													{
														vLinecount=parseFloat(vLinecount)+1;
													}
													if(trantype=='transferorder')
														vsoitemLine=vsoitemLine-1;
													if(vsoitemLine==SOarray["custparam_solineno"])
													{

														vsoitemRemQty=new Big(vsoitemRemQty);
														enterQty=new Big(enterQty);
														var totalQty=Number(vsoitemRemQty.minus(enterQty));
														nlapiLogExecution('DEBUG','totalQty11 in Big',totalQty);

														if(parseFloat(totalQty) > 0)
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
														vsoitemLine=vsoitemLine-1;
													if(vsoitemLine==SOarray["custparam_solineno"] && vsoitemShipVia == vShipVia)
													{

														vsoitemRemQty=new Big(vsoitemRemQty);
														enterQty=new Big(enterQty);
														var totalQty=Number(vsoitemRemQty.minus(enterQty));
														nlapiLogExecution('DEBUG','totalQty12 in Big',totalQty);


														if(parseFloat(totalQty) > 0)
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
									var taskType="PICK";
									var actualBeginTime=TimeStamp();
									var orderLevel="F";
									if(parseFloat(vSoreminqty) > 0)
									{
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

										// To post IF when order level is true and lastpick is true for already packed containers against order
										if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T" && vStageScanRequired=='F')
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

										if(isItLastPick!=null && isItLastPick!='' && isItLastPick=="T" && vStageScanRequired=='F')
										{
											var id=  updateOpenTask(soInternalId,enteredItem,soLineno,Number(Big(enterQty).toFixed(5)),enteredBin,itemType,whlocation,
													enteredLot,'','','',soInternalId,null,null,null,taskType,null,null,null,"T",trantype,
													actualBeginTime,customer,'','','','','','',SOarray["custparam_unitstext"],SOarray["custparam_conversionrate"],
													vShipVia,null,ordType,department,vclass,getPickreportid,null,inventoryStatus);
											context.setSessionObject('record', 'created'); 
										}
										else
										{
											if(SOarray["custparam_orderlevel"]=="T")
											{

												var id=  updateOpenTask(soInternalId,enteredItem,soLineno,Number(Big(enterQty).toFixed(5)),enteredBin,itemType,whlocation,
														enteredLot,'','','',soInternalId,null,null,null,taskType,null,null,null,'F',trantype,actualBeginTime,
														customer,'','','','','','',SOarray["custparam_unitstext"],SOarray["custparam_conversionrate"],vShipVia,null,ordType,
														department,vclass,getPickreportid,null,inventoryStatus);
												context.setSessionObject('record', 'created'); 
											}
											else
											{

												if(vStageScanRequired=='F')
												{
													var id=  updateOpenTask(soInternalId,enteredItem,soLineno,Number(Big(enterQty).toFixed(5)),enteredBin,itemType,whlocation,
															enteredLot,'','','',soInternalId,null,null,null,taskType,null,null,null,"T",trantype,actualBeginTime,
															customer,'','','','','','',SOarray["custparam_unitstext"],SOarray["custparam_conversionrate"],vShipVia,null,ordType,
															department,vclass,getPickreportid,null,inventoryStatus);
													context.setSessionObject('record', 'created'); 
												}
												else
												{
													var id=  updateOpenTask(soInternalId,enteredItem,soLineno,Number(Big(enterQty).toFixed(5)),enteredBin,itemType,
															whlocation,enteredLot,'','','',soInternalId,null,null,null,
															taskType,null,null,null,"F",trantype,actualBeginTime,
															customer,'','','','','','',SOarray["custparam_unitstext"],
															SOarray["custparam_conversionrate"],vShipVia,null,ordType,department,
															vclass,getPickreportid,null,inventoryStatus);
													context.setSessionObject('record', 'created'); 
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

											if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
												vPickedQty=0;
											if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
												vPickGenQty=0;

											vPickGenQty=new Big(vPickGenQty);
											vPickedQty=new Big(vPickedQty);
											var vRemainingQty=Number(vPickGenQty.minus(vPickedQty));
											nlapiLogExecution('DEBUG','vRemainingQty66 in Big',vRemainingQty);



											if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
												vRemainingQty=0;
											if(parseFloat(vRemainingQty) > 0)
											{
												vRedirectionFlag = "T";
												break;
											}
										}
									}
									if(vRedirectionFlag == "T")
									{
										if(request.getParameter('hdnSendflag')=='New Order')
										{
											var SOarray = new Array();
											SOarray["custparam_error"] ='';
											SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
											SOarray["custparam_enterbinid"] =enteredBin;
											SOarray["custparam_language"] = getLanguage;
											SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
											SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
											SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
											SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
											response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
											return;
										}
										else if(request.getParameter('hdnStageflag')=='PickAndStage')
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
								else
								{
									SOarray["custparam_error"] ='';
									SOarray["custparam_fromscreen"] ='statusscreen';
									response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
									return;
								}
							}
						}
					}
				}
			}
			catch (e) 
			{
				nlapiLogExecution('Debug', 'inside catch exception', e);

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

				lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',enteredItem));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',enteredBin));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
				var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

				if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
				{
					var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
				}


				response.sendRedirect('SUITELET', 'customscript_wmsse_picking_statusscan',
						'customdeploy_wmsse_picking_statusscan', false, SOarray);
				return; 
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			SOarray["custparam_error"] = 'Transaction Is In Progress...';
			response.sendRedirect('SUITELET', 'customscript_wmsse_picking_statusscan',
					'customdeploy_wmsse_picking_statusscan', false, SOarray);
			return; 
		}
	}
}
function fnCheckOrd(soid,loc,trantype,itemid,quantity){


	var SOtrantypefilters=new Array();
	SOtrantypefilters.push(new nlobjSearchFilter('tranid',null,'is',soid));
	if(loc!=null && loc!="" && loc!='null')
		SOtrantypefilters.push(new nlobjSearchFilter('location', null, 'anyof', loc));
	SOtrantypefilters.push(new nlobjSearchFilter('custbody_wmsse_printpickticket',null,'is','T'));
	SOtrantypefilters.push(new nlobjSearchFilter('formulanumeric',null,'greaterthanorequalto',quantity).setFormula('TO_NUMBER({quantity} - {quantitypicked})'));
	SOtrantypefilters.push(new nlobjSearchFilter('item', null, 'anyof', itemid));
	var SOtrantypecols=new Array();
	SOtrantypecols.push(new nlobjSearchColumn('internalid'));
	SOtrantypecols.push(new nlobjSearchColumn('tranid'));
	SOtrantypecols.push(new nlobjSearchColumn('status'));
	SOtrantypecols.push(new nlobjSearchColumn('location'));
	SOtrantypecols.push(new nlobjSearchColumn('line'));
	var SORecinternalids=nlapiSearchRecord(trantype,null,SOtrantypefilters,SOtrantypecols);//not in use

	SOtrantypefilters=null;
	SOtrantypecols=null;
	return SORecinternalids;
}
function funtoCheckPickReportNo(pickreportid,loc,soid,sku,soLineno,trantype){

	var SORecinternalids=new Array();
	var SORecidsearchresults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh');
	
	SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',pickreportid));

	if(loc!=null && loc!="" && loc!='null')
		SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', loc));
	if(sku!=null && sku!="" && sku!='null')
		SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', sku));
	SORecidsearchresults.addFilter(new nlobjSearchFilter('tranid','custrecord_wmsse_order_no','is',soid));
	if(trantype!='transferorder')
		SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'equalto',soLineno));
	else
		SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'equalto',parseFloat(soLineno)+parseFloat(1)));

	SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',9));// 9 - Pick Locations Assigned

	
	
	var resLenDetails = SORecidsearchresults.runSearch();
	
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SORecinternalids = SORecinternalids.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	return SORecinternalids;
}
function getSOLineDetailskit(sonumber,trantype,itemID,whLocation)
{

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

function getCoversionRate(vunitstype,vstockunit)
{
	var uomfilters=new Array();		
	if(vunitstype!=null && vunitstype!='' && vunitstype!=undefined && vunitstype!='')
		uomfilters[0]=new nlobjSearchFilter('internalid',null,'anyof',vunitstype);
	if(vstockunit!=null && vstockunit!='' && vstockunit!=undefined && vstockunit!='')
		uomfilters[1]=new nlobjSearchFilter('unitname',null,'is',vstockunit); 
	var uomcolumns=new Array();
	uomcolumns[0]=new nlobjSearchColumn('conversionrate'); 
	var uomresults= nlapiSearchRecord('unitstype', 'customsearch_wmsse_unitstype', uomfilters, uomcolumns);
	var vFromRate=1;
	if(uomresults != null && uomresults != '')
	{
		vFromRate=uomresults[0].getValue('conversionrate');
		if(vFromRate == null || vFromRate == '')
			vFromRate=1;

	}	
	return vFromRate;
}



