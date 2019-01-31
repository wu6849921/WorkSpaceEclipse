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
function PickingItem(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var getOptedField = request.getParameter('custparam_option');
		var enteredBin=request.getParameter('custparam_enterbin');
		var enteredBinId=request.getParameter('custparam_enterbinid');
		var userAccountId = ctx.getCompany();
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whlocation = request.getParameter('custparam_whlocation');
		var enteredItem = request.getParameter('custparam_item');
		var enteredItemId = request.getParameter('custparam_enteritem');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		if(enteredItem==null || enteredItem=='' || enteredItem=='null' || enteredItem=='undefined')
		{
			enteredItem='';
		}
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-CHECKIN SO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{

			headerVar='Picking Item';
			st0 = domainName + "-Picking";
			st1 = "Enter/Scan Item";
			st2 = "SEND";
			st3 = "PREV";

		}	

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
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan', 'customdeploy_wmsse_onbarcodescan');

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
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enteritem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item';return false;}if(document.getElementById('enterord').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan order#';document.getElementById('enterord').focus();return false;}}</script>";
		html = html +functionkeyHtml;

		html = html +"<script type = 'text/javascript'>";
		html = html +"function parsebarcode(url)";
		html = html +"{";
		html = html +"var txtitem = document.getElementById('enteritem').value;";
		html = html +"var hdnwhloc = document.getElementById('hdnWhLocation').value;";
		html = html +"var url=url+'&custpage_barcode='+txtitem+'&custpage_whloc='+hdnwhloc;";
		html = html +"var xhttp = new XMLHttpRequest();";
		html = html +"xhttp.onreadystatechange = function() {";
		html = html +"if (this.readyState == 4 && this.status == 200)";
		html = html +"{";
		html = html +"document.getElementById('div_error').innerHTML = '';";
		html = html +"document.getElementById('hdncompositebarcode').value = '';";
		html = html +"if(this.response!=null && this.response!='')";
		html = html +"{";
		html = html +"var bccomponents = JSON.parse(this.response);";
		html = html +"if(bccomponents['error'] !=null && bccomponents['error']!='')";
		html = html +"{";
		html = html +"document.getElementById('div_error').innerHTML = bccomponents['error'];";		
		html = html +"}";
		html = html +"else ";
		html = html +"{";		
		html = html +"var vitem = bccomponents['Item'];";
		html = html +"document.getElementById('hdncompositebarcode').value = this.response;";
		html = html +"document.getElementById('enteritem').value = vitem;";
		html = html +"}";
		html = html +"}";
		html = html +"}";
		html = html +"};";
		html = html +"  xhttp.open('GET',url, true);";
		html = html +"  xhttp.send();";
		html = html +"}";
		html = html +"</script>";

		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+


		/*"		<tr><td>"+
		"		<table>"+*/
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin Location: <label> "+enteredBin+" </label>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnEnteredBin' value=" + enteredBin + ">"+
		"				<input type='hidden' name='hdnEnteredBinId' value=" + enteredBinId + ">"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' id='hdnWhLocation' value='" + whlocation + "'>"+
		"				<input type='hidden' name='hdnEnteredItem' value=" + enteredItemId + ">"+
		"				<input type='hidden' name='hdnitem' value='" + enteredItem + "'>"+
		"				<input type='hidden' name='hdncompositebarcode' id='hdncompositebarcode'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enteritem'  class='smalltextbox' onchange='parsebarcode(\""+ServicePageURL+"\");'  id='enteritem' type='text' value='"+enteredItem+"'/>"+
		"				</td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Order#"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' ><input name='enterord'  class='smalltextbox'  id='enterord' type='text'/>"+
		"				</td>"+
		"			</tr></table>"+
		"				<table><tr><td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td>"+
		"	<td width='5px'></td><td ></td>"+
		"			</tr></table>"+
		"		<table>	<tr>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='40px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Sales Order' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"			<tr>"+
		"				<td colspan='3' align = 'left'><input name='cmdSend' type='submit' value='Transfer Order' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"		 </table>"+
		"	</form>";
		if(enteredItem=='')
		{
			html=html+"<script type='text/javascript'>document.getElementById('enteritem').focus();</script></body></html>" ;
		}
		else
		{
			html=html+"<script type='text/javascript'>document.getElementById('enterord').focus();</script></body></html>" ;
		}		

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('enterbin');
		var optedEvent = request.getParameter('cmdPrevious');
		var SOarray=new Array();
		
		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_enterbin"] = request.getParameter('hdnEnteredBin');
		SOarray["custparam_enterbinid"] = request.getParameter('hdnEnteredBinId');
		SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
		SOarray["custparam_bcComponents"] = request.getParameter('hdncompositebarcode');

		//SOarray["custparam_item"] = request.getParameter('custparam_item');
		var whlocation = request.getParameter('hdnWhLocation');
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;
		var context = nlapiGetContext();

		var userAccountId = context.getCompany();

		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');

		var st11,st12;
		if( getLanguage == 'es_ES')
		{
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "MainMenu";
		}
		else
		{
			st11 = "INVALID OPTION";
			st12 = "MainMenu";
		} 
		SOarray["custparam_error"] = st11;
		SOarray["custparam_screenno"] = st12;

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('DEBUG', 'PREVIOUS F7 Pressed');
			SOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
		}
		else
		{
			context.setSessionObject('record', null);
			var trantype='salesorder';
			if(request.getParameter('cmdSend')=='Transfer Order')
			{
				trantype='transferorder';
			}
			SOarray["custparam_trantype"] =trantype;
			var enterItem=request.getParameter('enteritem');
			var enteredBin = request.getParameter('hdnEnteredBin');
			var enteredBinId = request.getParameter('hdnEnteredBinId');
					
			
			var logMsg1 = 'request.getParameter(cmdSend) =' + request.getParameter('cmdSend') + '<br>';
			logMsg1 = logMsg1 + 'trantype = ' + trantype + '<br>';
			logMsg1 = logMsg1 + 'enterItem = ' + enterItem + '<br>';
			logMsg1 = logMsg1 + 'whlocation = ' +whlocation+ '<br>';
			nlapiLogExecution('DEBUG', 'parameters in post', logMsg1);
			
			
			var currItem = new Array();
			if(enterItem!=null && enterItem!='')
				currItem = getSKUIdWithName(enterItem, SOarray["custparam_whlocation"], SOarray["custparam_company"]);

			if(currItem==null ||  currItem=='')
			{
				nlapiLogExecution('DEBUG', 'Into Bar Code parsing', enterItem);

				var currItem = new Array();

				var barcodecomponents = parsebarcodeoutsidereceiving(enterItem,SOarray["custparam_whlocation"]);
				nlapiLogExecution('DEBUG', 'barcodecomponents', barcodecomponents);		
				if(barcodecomponents != null && barcodecomponents !='' && barcodecomponents !='null')
				{
					nlapiLogExecution('DEBUG', 'barcode error', barcodecomponents["error"]);	

					if(barcodecomponents["error"] == "NoBarcodeFormats")
					{
						SOarray["custparam_error"] = 'Invalid Item/Invalid Bar Code';
						response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
						return;
					}
					if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
					{
						SOarray["custparam_error"] = barcodecomponents["error"];
						response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
						return;
					}

					var vItem =barcodecomponents['Item'];
					var vItemIntrid =barcodecomponents['ItemIntrid'];
					if(!isempty(vItemIntrid))
						currItem[0] =vItemIntrid;
					if(!isempty(vItem))
						currItem[1] =vItem;
					var vbarcodeQty = barcodecomponents['Quantity'];
					var vbarcodeUOM = barcodecomponents['UOM']; 
					var vbarcodeLot = '';
					var vbarcodeLotExpirydate ='';
					var vbarcodeSerial ='';

					if(currItem !=null && currItem !='' && currItem !='null' && 
							currItem !='undefined' && currItem !=undefined )
					{
						//WMSLITE-3232 - Composite Barcode Custom list mapping

						SOarray["custparam_bcComponents"] = JSON.stringify(barcodecomponents);						
						SOarray["custparam_bcuom"]='';
						SOarray["custparam_bcqty"]='';
						SOarray["custparam_bcserial"]='';
						SOarray["custparam_bcexpirydate"]='';
						SOarray["custparam_bclot"]='';

						// Upto here WMSLITE-3232 - Composite Barcode Custom list mapping


						var logMsg1 = 'vItem =' + vItem + '<br>';
						logMsg1 = logMsg1 + 'vItemIntrid = ' + vItemIntrid + '<br>';
						logMsg1 = logMsg1 + 'vbarcodeQty = ' + vbarcodeQty + '<br>';
						logMsg1 = logMsg1 + 'vbarcodeUOM = ' +vbarcodeUOM+ '<br>';
						logMsg1 = logMsg1 + 'vbarcodeLot = ' + vbarcodeLot + '<br>';
						logMsg1 = logMsg1 + 'vbarcodeLotExpirydate = ' + vbarcodeLotExpirydate + '<br>';
						logMsg1 = logMsg1 + 'vbarcodeSerial = ' + vbarcodeSerial + '<br>';


						nlapiLogExecution('DEBUG', 'Barcode Parsing parameters', logMsg1);

					}
				}

				nlapiLogExecution('DEBUG', 'Out of Bar Code parsing', enterItem);
			}

			nlapiLogExecution('DEBUG','currItem',currItem);
			if(currItem!=null && currItem!='')
			{
				var itemType = nswms_GetItemType(currItem[0], whlocation);
				SOarray["custparam_enteritem"] = currItem[0];

				var objBinDetails=null;


				var vStatusDetails = new Array();
				var inventoryStatusFeature = isInvStatusFeatureEnabled();		

				if(inventoryStatusFeature == true)
				{
					var systemRule_AllowExpiredItems=' ';
					systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',SOarray["custparam_whlocation"]);
					nlapiLogExecution("DEBUG","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);


					var vStatusResults = null;
					if(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem")
					{
						vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_inventorybalance');
					}
					else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
					{
						vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh');	
					}
					else
					{
						vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_invt_item');	  
					}

					if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] != '')
						vStatusResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', SOarray["custparam_whlocation"]));
					if(currItem[0] != null && currItem[0] != '')
						vStatusResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', currItem[0]));
					if(enteredBinId != null && enteredBinId != '')
						vStatusResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', enteredBinId));
					if(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem")
					{
						if(systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
						{
							nlapiLogExecution("DEBUG","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);
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

				}
				else
				{


					if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' && 
							itemType !='serviceitem' && itemType !='downloaditem' && itemType != 'Download Item' && 
							itemType != 'giftcertificateitem')
					{
						nlapiLogExecution('DEBUG', 'itemType', itemType);
						if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" ||
								itemType=="serializedassemblyitem")
						{
							
							var filterStrat = new Array();

							if(currItem[0] != null && currItem[0] != '')
								filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', currItem[0]));
							if(SOarray["custparam_whlocation"]!= null && SOarray["custparam_whlocation"]!= '')
								filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', SOarray["custparam_whlocation"]));
							if(enteredBinId!= null && enteredBinId!= '')
								filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', enteredBinId));

							objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterStrat, null);
						}
						else
						{
							
							var filterStrat = new Array();

							if(currItem[0] != null && currItem[0] != '')
								filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', currItem[0]));
							if(SOarray["custparam_whlocation"]!= null && SOarray["custparam_whlocation"]!= '')
								filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', SOarray["custparam_whlocation"]));
							if(enteredBinId!= null && enteredBinId!= '')
								filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', enteredBinId));

							objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);
						}

						if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' || 
								objBinDetails.length == null)
						{
							//SOarray["custparam_error"] = 'Please enter/scan valid bin location';
							SOarray["custparam_error"] = 'Inventory is not available for this item and bin combination';//201412815
							response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
							return;
						}
					}
				}

				// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
				var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

				var enterOrder=request.getParameter('enterord');
				SOarray["custparam_enterorder"] =enterOrder;
				var validPickReportResults = funtoCheckPickReportNo(getPickreportid,whlocation,enterOrder,currItem[0]);
				if(validPickReportResults != null  && validPickReportResults !='')
				{

					var isQtyforPicking='F';
					for(var s=0;s<validPickReportResults.length;s++)
					{

						var parentSku = validPickReportResults[s].getValue('custrecord_wmsse_parent_sku_no');
						nlapiLogExecution('DEBUG','parentSku',parentSku);
						var parentItemType = nswms_GetItemType(parentSku, whlocation);
						SOarray["custparam_parentItemType"]=parentItemType;
						var filters = new Array();
						var columns = new Array();
						var vType='SalesOrd';
						if(trantype == 'salesorder')
							vType='SalesOrd';
						else if(trantype == 'transferorder')
							vType='TrnfrOrd';

						filters.push(new nlobjSearchFilter('tranid', null, 'is', enterOrder));
						filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

						if(whlocation!=null && whlocation!='' && whlocation!='undefined' && whlocation!='')
						{
							if(crossSubsidiaryFeature == true && trantype =="salesorder")
							{
								filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof', ['@NONE@',whlocation]));

							}
							else
							{
								filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',whlocation]));
							}
						}

						var soLineDetails = null;
						nlapiLogExecution('DEBUG','parentItemType',parentItemType);
						if(parentItemType=='kititem')
						{
							var vconversionrate = 1;
							var itemfilters=new Array();
							if(currItem[0] != null && currItem[0] != '')
								itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',currItem[0]));
							if(whlocation!=null && whlocation!='' && whlocation!='undefined' && whlocation!='')
							{
								if(crossSubsidiaryFeature == true && trantype =="salesorder")
								{
									filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof', ['@NONE@',whlocation]));

								}
								else
								{
									filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',whlocation]));
								}
							}
							var itemcolumns= new Array();
							itemcolumns.push(new nlobjSearchColumn('itemid'));
							itemcolumns.push(new nlobjSearchColumn('stockunit'));
							itemcolumns.push(new nlobjSearchColumn('unitstype'));
							var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
							if(itemresults!=null && itemresults!='')
							{
								item = itemresults[0].getValue('itemid');
								var vstockunit = itemresults[0].getText('stockunit');
								var vunitstype = itemresults[0].getValue('unitstype');

								if(vunitstype != null && vunitstype != '')
								{	
									var vBaseUOMSearch=getBaseUnitRate(vunitstype);

									vBaseUnit='Base unit';
									if(vBaseUOMSearch != null && vBaseUOMSearch != '')
									{
										vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
										vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
									}	

									if(vstockunit !=null && vstockunit!='' && vstockunit !='null' && vstockunit !='undefined' && vstockunit !='- None -')
									{
										vconversionrate =getStockCoversionRate(vunitstype,vstockunit,vConversionRate);
									}
								}

							}

							soLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_ordline_details_kit', filters, columns);
							var vColumnslist='';
							if(soLineDetails !=null && soLineDetails !='' && soLineDetails.length > 0)
								vColumnslist=soLineDetails[0].getAllColumns();

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
							if(soLineDetails !=null && soLineDetails !='' && soLineDetails.length !=null)
							{
								var getenteredQty =1;//request.getParameter('hdnenteredQty');
								var isValidItem='F';
								//var isQtyforPicking='F';
								for(var j=0; j<soLineDetails.length; j++)
								{
									var result = soLineDetails[j]; 
									var vsoitem = result.getValue('memberitem','item','group');
									var ordType = result.getValue('custbody_wmsse_ordertype',null,'group');
									var pickedqty = result.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
									var bomQty=result.getValue('memberquantity','item','group');

									getenteredQty=new Big(getenteredQty);
									bomQty=new Big(bomQty);
									var expQty=Number(getenteredQty.mul(bomQty));

									var vsoitemid='';

									if(vsoitem==currItem[1])
									{
										isValidItem='T';
										SOarray["custparam_memitempickedqty"]=pickedqty;
										SOarray["custparam_memitemqty"]=expQty;
										SOarray["custparam_itemid"]=currItem[0];

										var solineno=result.getValue('line',null,'group');

										var vsoitemQty = result.getValue(vColumnslist[memitemcommitedQtyIndex]);
										var fulfiledQty=result.getValue(vColumnslist[memitemfulfilledQtyIndex]);
										var rcvdQty = result.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
										if(rcvdQty == null || rcvdQty == '')
											rcvdQty=0;

										rcvdQty=new Big(rcvdQty);
										fulfiledQty=new Big(fulfiledQty);
										var vsoitemRcvQty=Number(rcvdQty.plus(fulfiledQty));

										if(vsoitemQty == null || vsoitemQty == '')
											vsoitemQty=0;
										if(vsoitemRcvQty==null || vsoitemRcvQty=='')
											vsoitemRcvQty=0;


										vsoitemQty=new Big(vsoitemQty);
										vsoitemRcvQty=new Big(vsoitemRcvQty);
										var vSoreminqty=Number(vsoitemQty.minus(vsoitemRcvQty));

										if(parseFloat(vSoreminqty)>0 )
										{
											isQtyforPicking = 'T';
											nlapiLogExecution('DEBUG','isQtyforPicking',isQtyforPicking);
											SOarray["custparam_ordtype"] =ordType;
											SOarray["custparam_memitempickedqty"]=vsoitemRcvQty;
											SOarray["custparam_memitemqty"]=vSoreminqty;
											SOarray["custparam_itemremainingqty"]=vSoreminqty;
											tempflag='T';
											SOarray["custparam_error"]='';


											SOarray["custparam_solineno"] = solineno;										
											var soInternalId =result.getValue('internalid',null,'group');
											SOarray["custparam_soId"] =soInternalId;
											SOarray["custparam_stockconversionrate"] = 1;
											SOarray["custparam_unitstext"]='';

											if(itemType=='noninventoryitem' ||  itemType =='otherchargeitem' || itemType == 'Service' ||  itemType =='serviceitem' || itemType =='downloaditem' || itemType == 'Download Item' || itemType == 'giftcertificateitem')
											{
												var currentUser=getCurrentUser();
												var lockfilters=new Array();
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',soInternalId));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',solineno));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
												var lockcolumns= new Array();
												var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, lockcolumns);

												if(lockresults!=null && lockresults!='')
												{
													var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
													var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
													if(getLockUser!=currentUser)
													{
														SOarray["custparam_error"]='The line item is being processed by other user.';
														response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
														return;
													}
													else if(parseInt(getLockLine)!=parseInt(solineno))
													{
														var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
														LockRecord.setFieldValue('name',soInternalId);
														LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
														LockRecord.setFieldValue('custrecord_wmsse_order',soInternalId);
														LockRecord.setFieldValue('custrecord_wmsse_line',solineno);
														LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
														LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

														var date = new Date();
														var mSecs = date.getTime();
														LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

														var recid = nlapiSubmitRecord(LockRecord);
														LockRecord=null;
													}
												}
												else
												{
													var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
													LockRecord.setFieldValue('name',soInternalId);
													LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
													LockRecord.setFieldValue('custrecord_wmsse_order',soInternalId);
													LockRecord.setFieldValue('custrecord_wmsse_line',solineno);
													LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
													LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

													var date = new Date();
													var mSecs = date.getTime();
													LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

													var recid = nlapiSubmitRecord(LockRecord);
													nlapiLogExecution('DEBUG', 'Record Locked Successfully', recid);
													LockRecord=null;
												}
												lockresults=null;
												lockcolumns=null;
												lockfilters=null;
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);

												return;
											}

											if(objBinDetails !=null  && objBinDetails !='null'
												&& objBinDetails!='' && objBinDetails.length != null && objBinDetails.length > 0)
											{

												var totqty = 0;

												if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
												{											
													for(var p=0;p<objBinDetails.length;p++)
													{
														var vBinQtyAvail=objBinDetails[p].getValue('quantityavailable','binonhand');
														var vBinText=objBinDetails[p].getText('binnumber','binonhand');

														var vBinOpenTaskDetails=new Array();

														vBinOpenTaskDetails = getOPenTaskPickBinDetails(currItem[0],enteredBinId,whlocation,objBinDetails[p].getValue('unitstype'),objBinDetails[p].getText('stockunit'));
														var vOpenPickQty=0;
														var vBinOpenTaskBinQtyArr = "";
														if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
														{
															vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
															vOpenPickQty = vBinOpenTaskBinQtyArr[0];
														}
														if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
															vOpenPickQty =0;

														if(vBinQtyAvail > 0)
														{
															totqty=new Big(totqty);
															vBinQtyAvail=new Big(vBinQtyAvail);
															vOpenPickQty=new Big(vOpenPickQty);
															totqty=Number((totqty.plus(vBinQtyAvail)).minus(vOpenPickQty));

														}
													}

												}
												else
												{
													for(var p=0;p<objBinDetails.length;p++)
													{
														var vBinQtyAvail=objBinDetails[p].getValue('quantityavailable','inventoryNumberBinOnHand');
														var vBinText=objBinDetails[p].getText('binnumber','inventoryNumberBinOnHand');

														var vBinOpenTaskDetails=new Array();
														vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(currItem[0],enteredBinId,whlocation,objBinDetails[p].getValue('unitstype'),objBinDetails[p].getText('stockunit'));
//														vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(vItem,strBinId,strLocationId,searchresult.getValue('unitstype'),searchresult.getText('stockunit'));
														var vBinOpenTaskBinQtyArr = "";
														if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
														{
															vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
															vOpenPickQty = vBinOpenTaskBinQtyArr[0];
														}
														if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
															vOpenPickQty =0;

														if(vBinQtyAvail > 0)
														{
															totqty=new Big(totqty);
															vBinQtyAvail=new Big(vBinQtyAvail);
															vOpenPickQty=new Big(vOpenPickQty);
															totqty=Number((totqty.plus(vBinQtyAvail)).minus(vOpenPickQty));

														}
													}

												}
												if(totqty > 0)
												{

													var currentUser=getCurrentUser();
													var lockfilters=new Array();
													lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
													lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',soInternalId));
													lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',solineno));
													lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
													var lockcolumns= new Array();
													var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, lockcolumns);

													if(lockresults!=null && lockresults!='')
													{
														var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
														var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
														if(getLockUser!=currentUser)
														{
															SOarray["custparam_error"]='The line item is being processed by other user.';
															response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
															return;
														}
														else if(parseInt(getLockLine)!=parseInt(solineno))
														{
															var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
															LockRecord.setFieldValue('name',soInternalId);
															LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
															LockRecord.setFieldValue('custrecord_wmsse_order',soInternalId);
															LockRecord.setFieldValue('custrecord_wmsse_line',solineno);
															LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
															LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

															var date = new Date();
															var mSecs = date.getTime();
															LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

															var recid = nlapiSubmitRecord(LockRecord);
															LockRecord=null;
														}
													}
													else
													{
														var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
														LockRecord.setFieldValue('name',soInternalId);
														LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
														LockRecord.setFieldValue('custrecord_wmsse_order',soInternalId);
														LockRecord.setFieldValue('custrecord_wmsse_line',solineno);
														LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
														LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

														var date = new Date();
														var mSecs = date.getTime();
														LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

														var recid = nlapiSubmitRecord(LockRecord);
														LockRecord=null;
													}
													lockresults=null;
													lockcolumns=null;
													lockfilters=null;

													totqty = Number(Big(totqty).mul(vconversionrate));

													SOarray["custparam_itembinqty"] =totqty;
													var memItemType = nswms_GetItemType(currItem[0], whlocation);

													if (memItemType == "lotnumberedinventoryitem" || memItemType=="lotnumberedassemblyitem") {
														SOarray["custparam_error"] ='';
														response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
														return;
													}
													else
													{

														SOarray["custparam_error"] ='';
														response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
														return;
													}
												}
												else
												{
													SOarray["custparam_error"] = 'Insufficient inventory for this item and bin combination';
													response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
													return;
												}
											}
											else
											{
												var totqty = 0;
												if(inventoryStatusFeature == true)
												{
													if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined' && 
															vStatusDetails != undefined && vStatusDetails.length != null && vStatusDetails.length >0)
													{


														if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
														{

															var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(currItem[0],enteredBinId,whlocation,VUnitType,vUnits);

															for(var p=0;p<vStatusDetails.length;p++)
															{
																var vBinQtyAvail=vStatusDetails[p].getValue('available',null,'sum');
																var vInvLot=vStatusDetails[p].getText('inventorynumber',null,'group');
																var vOpenPickQty=0;
																var vBinOpenTaskBinQtyArr = "";
																if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
																{
																	vBinOpenLotArr = vBinOpenTaskDetails[3];

																	var vOpenPickQty=0;
																	for(var m=0;m<vBinOpenLotArr.length;m++)
																	{ 
																		var vOpenLot=vBinOpenLotArr[m];
																		if(vInvLot==vOpenLot)
																		{
																			vOpenPickQty=vBinOpenTaskDetails[1][m];
																			break;
																		} 
																	}


																}
																if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
																	vOpenPickQty =0;

																vBinQtyAvail=new Big(vBinQtyAvail);
																vOpenPickQty=new Big(vOpenPickQty);
																vBinQtyAvail=Number(vBinQtyAvail.minus(vOpenPickQty));

																if(vBinQtyAvail > 0)
																{

																	vBinQtyAvail=new Big(vBinQtyAvail);
																	totqty=new Big(totqty);
																	totqty=Number(vBinQtyAvail.plus(totqty));
																}
															}



														}
														else
														{
															var vBinQtyAvail = 0;
															for(var p=0;p<vStatusDetails.length;p++)
															{
																if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
																{
																	var tQty=vStatusDetails[p].getValue('available',null,'sum');

																	vBinQtyAvail=new Big(vBinQtyAvail);
																	tQty=new Big(tQty);

																	vBinQtyAvail=Number(vBinQtyAvail.plus(tQty));

																}
																else
																{
																	var tQty=vStatusDetails[p].getValue('available');

																	vBinQtyAvail=new Big(vBinQtyAvail);
																	tQty=new Big(tQty);
																	vBinQtyAvail=Number(vBinQtyAvail.plus(tQty));

																}
															}
															var vBinOpenTaskDetails = getOPenTaskPickBinDetails(currItem[0],enteredBinId,whlocation,VUnitType,vUnits);

															var vOpenPickQty=0;
															var vBinOpenTaskBinQtyArr = "";
															if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
															{
																vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
																for(var binItr = 0 ;binItr<vBinOpenTaskBinQtyArr.length;binItr++)
																{

																	vOpenPickQty=Big(vOpenPickQty);
																	vOpenPickQty=parseFloat(vOpenPickQty.plus(vBinOpenTaskBinQtyArr[0]));
																}

															}
															if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
																vOpenPickQty =0;

															vBinQtyAvail=new Big(vBinQtyAvail);
															vOpenPickQty=new Big(vOpenPickQty);
															vBinQtyAvail=Number(vBinQtyAvail.minus(vOpenPickQty));

															if(vBinQtyAvail > 0)
															{
																totqty=vBinQtyAvail;
															}


														}
														if(totqty > 0)
														{

															totqty = Number(Big(totqty).mul(vconversionrate));

															SOarray["custparam_itembinqty"] =totqty;


															if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {
																SOarray["custparam_error"] ='';
																response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
																return;
															}
															else
															{

																SOarray["custparam_error"] ='';
																response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
																return;
															}
														}
														else
														{
															SOarray["custparam_error"] = 'Insufficient inventory for this item and bin combination';
															response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
															return;
														}
													}
												}

												SOarray["custparam_error"] = 'Insufficient inventory for this item and bin combination';
												response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
												return;
											}				

										}

										//break;
									}
								}

								if(isValidItem == 'F')
								{
									SOarray["custparam_error"] = 'Please enter/scan valid item';
									response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
									return;
								}

							}
							else
							{

								SOarray["custparam_error"] = 'Please enter/scan valid item';
								response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
								return;
							}

						}
						else
						{
							if(currItem[0] != null && currItem[0] != '')
								filters.push(new nlobjSearchFilter('item', null, 'anyof', currItem[0]));
							soLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_fulfil_ordline_detail', filters, columns);
							var vColumnslist='';
							if(soLineDetails !=null && soLineDetails !='' && soLineDetails.length > 0)
								vColumnslist=soLineDetails[0].getAllColumns();
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

							nlapiLogExecution('DEBUG','SOLineDetails',soLineDetails);

							if(soLineDetails !=null && soLineDetails !='' && soLineDetails.length !=null)
							{
								//var isQtyforPicking='F';
								var department = '';
								var vclass = '';
								for(var m=0;m<soLineDetails.length;m++)
								{
									nlapiLogExecution('DEBUG','SOLineDetails.length',soLineDetails.length);
									var customer = validPickReportResults[m].getValue('custrecord_wmsse_customer'); //soLineDetails[m].getValue('internalid','customer','group');
									var vsoitemQty=soLineDetails[m].getValue(vColumnslist[commitedQtyIndex]);			 
									var vsoitemfulfillQty=soLineDetails[m].getValue(vColumnslist[fulfilledQtyIndex]);
									var vsoitemopentaskQty=soLineDetails[m].getValue(vColumnslist[totalPickedQtyIndex]);
									var vsoitemErpConfirmedQty=soLineDetails[m].getValue(vColumnslist[ERPConfirmedQty]);
									var vsoitemNSReceivedQty=soLineDetails[m].getValue(vColumnslist[totalNSPickedQtyIndex]);
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

									var soLineno = soLineDetails[m].getValue('line',null,'group');

									var VUnitType = soLineDetails[m].getValue('unitstype','item','group');
									var vUnits = soLineDetails[m].getText('stockunit','item','group');
									var vUnitsText = soLineDetails[m].getText('unit',null,'group');
									var vConversionRate = soLineDetails[m].getValue(vColumnslist[conversionRateIndex]);
									nlapiLogExecution('DEBUG', 'VUnitType,vUnits,vConversionRate,vUnitsText', VUnitType+","+vUnits+","+vConversionRate + "," +vUnitsText);
									var getStockConversionRate =1;
									if(vUnits !=null && vUnits!='' && vUnits !='null' && vUnits !='undefined' && vUnits !='- None -')
									{
										getStockConversionRate = getStockCoversionRate(VUnitType,vUnits,vConversionRate);
									}


									if(trantype == 'transferorder' && soLineno != null)//adding because of TO line number getting 2 value
										soLineno = parseFloat(soLineno)-parseFloat(1);
									var ordType = soLineDetails[m].getValue('custbody_wmsse_ordertype',null,'group');
									if(departments == true)
										department = soLineDetails[m].getValue('department',null,'group');
									if(classes == true)
										vclass = soLineDetails[m].getValue('class',null,'group');
									SOarray["custparam_ordtype"] =ordType;
									SOarray["custparam_solineno"] = soLineno;
									SOarray["custparam_unitstext"] = vUnitsText;
									SOarray["custparam_conversionrate"] = vConversionRate;
									SOarray["custparam_stockconversionrate"] = getStockConversionRate;
									SOarray["custparam_department"] = department;
									SOarray["custparam_class"] = vclass;
									var soInternalId =soLineDetails[m].getValue('internalid',null,'group');
									SOarray["custparam_soId"] =soInternalId;
									if(vsoitemRcvQty==null || vsoitemRcvQty=='')
										vsoitemRcvQty=0;
									if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
										vsoitemfulfillQty=0;

									vsoitemQty=new Big(vsoitemQty);
									vsoitemfulfillQty=new Big(vsoitemfulfillQty);
									vsoitemRcvQty=new Big(vsoitemRcvQty);
									var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
									if(vSoreminqty >0 )
									{
										isQtyforPicking='T';


										SOarray["custparam_customer"] =customer;
										SOarray["custparam_itemremainingqty"] =vSoreminqty;

										if(itemType=='noninventoryitem' ||  itemType =='otherchargeitem' || itemType == 'Service' ||  itemType =='serviceitem' || itemType =='downloaditem' || itemType == 'Download Item' || itemType == 'giftcertificateitem')
										{
											var currentUser=getCurrentUser();
											var lockfilters=new Array();
											lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
											lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',soInternalId));
											lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',soLineno));
											lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
											var lockcolumns= new Array();
											var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, lockcolumns);

											if(lockresults!=null && lockresults!='')
											{
												var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
												var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
												if(getLockUser!=currentUser)
												{
													SOarray["custparam_error"]='The line item is being processed by other user.';
													response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
													return;
												}
												else if(parseInt(getLockLine)!=parseInt(soLineno))
												{
													var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
													LockRecord.setFieldValue('name',soInternalId);
													LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
													LockRecord.setFieldValue('custrecord_wmsse_order',soInternalId);
													LockRecord.setFieldValue('custrecord_wmsse_line',soLineno);
													LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
													LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

													var date = new Date();
													var mSecs = date.getTime();
													LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

													var recid = nlapiSubmitRecord(LockRecord);
													LockRecord=null;
												}
											}
											else
											{
												var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
												LockRecord.setFieldValue('name',soInternalId);
												LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
												LockRecord.setFieldValue('custrecord_wmsse_order',soInternalId);
												LockRecord.setFieldValue('custrecord_wmsse_line',soLineno);
												LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
												LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

												var date = new Date();
												var mSecs = date.getTime();
												LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

												var recid = nlapiSubmitRecord(LockRecord);
												LockRecord=null;
											}
											lockresults=null;
											lockcolumns=null;
											lockfilters=null;
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);

											return;
										}

										if(objBinDetails !=null && objBinDetails!='' && objBinDetails!='null'
											&& objBinDetails != undefined && objBinDetails != 'undefined' 
												&& objBinDetails.length != null && objBinDetails.length > 0)
										{
											var totqty = 0;

											if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
											{		
												var vBinOpenTaskDetails = getOPenTaskPickBinDetails(currItem[0],enteredBinId,whlocation,VUnitType,vUnits);
												for(var p=0;p<objBinDetails.length;p++)
												{
													var vBinQtyAvail=objBinDetails[p].getValue('quantityavailable','binonhand');
													var vBinText=objBinDetails[p].getText('binnumber','binonhand');

													var vOpenPickQty=0;
													var vBinOpenTaskBinQtyArr = "";
													if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
													{
														vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
														vOpenPickQty = vBinOpenTaskBinQtyArr[0];
													}
													if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
														vOpenPickQty =0;

													if(vBinQtyAvail > 0)
													{
														totqty=new Big(totqty);
														vBinQtyAvail=new Big(vBinQtyAvail);
														vOpenPickQty=new Big(vOpenPickQty);
														totqty=Number((totqty.plus(vBinQtyAvail)).minus(vOpenPickQty));
													}
												}

											}
											else
											{
												var vOpenPickDetails = getOPenTaskPickBinDetailsLot(currItem[0],enteredBinId,whlocation,VUnitType,vUnits);
												var vBinOpenLotArr="";
												if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
												{
													vBinOpenLotArr = vOpenPickDetails[3];
												}
												for(var p=0;p<objBinDetails.length;p++)
												{
													var vBinQtyAvail=objBinDetails[p].getValue('quantityavailable','inventoryNumberBinOnHand');
													var vBinText=objBinDetails[p].getText('binnumber','inventoryNumberBinOnHand');

													var vInvLot=objBinDetails[p].getText('inventorynumber','inventoryNumberBinOnHand');
													var vOpenPickQty=0;
													for(var m=0;m<vBinOpenLotArr.length;m++)
													{ 
														var vOpenLot=vOpenPickDetails[3][m];
														if(vInvLot==vOpenLot)
														{
															vOpenPickQty=vOpenPickDetails[1][m];
															break;
														} 
													}
													if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
														vOpenPickQty =0;

													if(vBinQtyAvail > 0)
													{
														totqty=new Big(totqty);
														vBinQtyAvail=new Big(vBinQtyAvail);
														vOpenPickQty=new Big(vOpenPickQty);
														totqty=Number((totqty.plus(vBinQtyAvail)).minus(vOpenPickQty));

													}
												}

											}


											if(totqty > 0)
											{

												totqty =new Big(totqty);
												getStockConversionRate =new Big(getStockConversionRate);
												totqty = Number(totqty.mul(getStockConversionRate));

												SOarray["custparam_itembinqty"] =totqty;
												//var itemType = nswms_GetItemType(currItem, whlocation);
												var currentUser=getCurrentUser();
												var lockfilters=new Array();
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',soInternalId));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',soLineno));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
												var lockcolumns= new Array();
												var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, lockcolumns);

												if(lockresults!=null && lockresults!='')
												{
													var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
													var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
													if(getLockUser!=currentUser)
													{
														SOarray["custparam_error"]='The line item is being processed by other user.';
														response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
														return;
													}
													else if(parseInt(getLockLine)!=parseInt(soLineno))
													{
														var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
														LockRecord.setFieldValue('name',soInternalId);
														LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
														LockRecord.setFieldValue('custrecord_wmsse_order',soInternalId);
														LockRecord.setFieldValue('custrecord_wmsse_line',soLineno);
														LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
														LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

														var date = new Date();
														var mSecs = date.getTime();
														LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

														var recid = nlapiSubmitRecord(LockRecord);
														LockRecord=null;
													}
												}
												else
												{
													var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
													LockRecord.setFieldValue('name',soInternalId);
													LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
													LockRecord.setFieldValue('custrecord_wmsse_order',soInternalId);
													LockRecord.setFieldValue('custrecord_wmsse_line',soLineno);
													LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
													LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

													var date = new Date();
													var mSecs = date.getTime();
													LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

													var recid = nlapiSubmitRecord(LockRecord);
													LockRecord=null;
												}
												lockresults=null;
												lockcolumns=null;
												lockfilters=null;

												if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {
													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
													return;
												}
												else
												{

													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
													return;
												}
											}
											else
											{
												SOarray["custparam_error"] = 'Insufficient inventory for this item and bin combination';
												response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
												return;
											}
										}
										else
										{
											var totqty = 0;
											if(inventoryStatusFeature == true)
											{
												if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined' && 
														vStatusDetails != undefined && vStatusDetails.length != null && vStatusDetails.length >0)
												{


													if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
													{

														var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(currItem[0],enteredBinId,whlocation,VUnitType,vUnits);

														for(var p=0;p<vStatusDetails.length;p++)
														{
															var vBinQtyAvail=vStatusDetails[p].getValue('available',null,'sum');
															var vInvLot=vStatusDetails[p].getText('inventorynumber',null,'group');
															var vOpenPickQty=0;
															var vBinOpenTaskBinQtyArr = "";
															if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
															{
																vBinOpenLotArr = vBinOpenTaskDetails[3];

																var vOpenPickQty=0;
																for(var m=0;m<vBinOpenLotArr.length;m++)
																{ 
																	var vOpenLot=vBinOpenLotArr[m];
																	if(vInvLot==vOpenLot)
																	{
																		vOpenPickQty=vBinOpenTaskDetails[1][m];
																		break;
																	} 
																}


															}
															if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
																vOpenPickQty =0;


															vBinQtyAvail =new Big(vBinQtyAvail);
															vOpenPickQty =new Big(vOpenPickQty);
															vBinQtyAvail=Number(vBinQtyAvail.minus(vOpenPickQty));

															if(vBinQtyAvail > 0)
															{

																vBinQtyAvail =new Big(vBinQtyAvail);
																totqty =new Big(totqty);
																totqty=Number(vBinQtyAvail.plus(totqty));
															}
														}



													}
													else
													{
														var vBinQtyAvail = 0;

														for(var p=0;p<vStatusDetails.length;p++)
														{
															if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
															{
																var tQty=vStatusDetails[p].getValue('available',null,'sum');

																vBinQtyAvail=new Big(vBinQtyAvail);
																tQty=new Big(tQty);
																vBinQtyAvail = Number(vBinQtyAvail.plus(tQty));

															}
															else
															{
																var tQty=vStatusDetails[p].getValue('available');

																vBinQtyAvail=new Big(vBinQtyAvail);
																tQty=new Big(tQty);
																vBinQtyAvail = Number(vBinQtyAvail.plus(tQty));
															}
														}
														var vBinOpenTaskDetails = getOPenTaskPickBinDetails(currItem[0],enteredBinId,whlocation,VUnitType,vUnits);

														var vOpenPickQty=0;
														var vBinOpenTaskBinQtyArr = "";
														if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
														{
															vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
															for(var binItr = 0 ;binItr<vBinOpenTaskBinQtyArr.length;binItr++)
															{

																vOpenPickQty=new Big(vOpenPickQty);
																vOpenPickQty = Number(vOpenPickQty.plus(vBinOpenTaskBinQtyArr[0]));
															}

														}
														if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
															vOpenPickQty =0;

														vBinQtyAvail=new Big(vBinQtyAvail);
														vOpenPickQty=new Big(vOpenPickQty);
														vBinQtyAvail = Number(vBinQtyAvail.minus(vOpenPickQty));

														if(vBinQtyAvail > 0)
														{
															totqty=vBinQtyAvail;
														}


													}


													if(totqty > 0)
													{

														totqty=new Big(totqty);
														getStockConversionRate=new Big(getStockConversionRate);
														totqty = Number(totqty.mul(getStockConversionRate));
														SOarray["custparam_itembinqty"] =totqty;
														//var itemType = nswms_GetItemType(currItem, whlocation);

														if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {
															SOarray["custparam_error"] ='';
															response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
															return;
														}
														else
														{

															SOarray["custparam_error"] ='';
															response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
															return;
														}
													}
													else
													{
														SOarray["custparam_error"] = 'Insufficient inventory for this item and bin combination';
														response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
														return;
													}
												}
											}
											SOarray["custparam_error"] = 'Insufficient inventory for this item and bin combination';
											response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
											return;
										}
									}

								}

							}					
							else
							{
								//SOarray["custparam_error"] = 'Please enter/scan valid order#';
								SOarray["custparam_error"] = 'Please enter/scan valid item';
								response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
								return;
							}
						}

					}
					if(isQtyforPicking == 'F')
					{
						SOarray["custparam_error"] = 'This item already picked';
						response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
						return;
					}
				}
				else
				{
					SOarray["custparam_error"]="There are no records with this combination";
					response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
					return;

				}


			}
			else
			{
				var itemfilters=new Array();
				itemfilters.push(new nlobjSearchFilter('nameinternal',null,'is',enterItem));
				if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] !='' && SOarray["custparam_whlocation"] != null)
				{
					itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',SOarray["custparam_whlocation"]]));
				}
				var itemcolumns= new Array();
				itemcolumns.push(new nlobjSearchColumn('isinactive'));
				var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
				//nlapiLogExecution('ERROR', 'itemresults', itemresults);
				if(itemresults!=null && itemresults!='')
				{
					if(itemresults[0].getValue('isinactive')=="T")
					{
						SOarray["custparam_error"] = 'Entered item is inactive.';
					}
					else
					{
						SOarray["custparam_error"] = 'Please enter/scan valid item';
					}
				}
				else
				{
					SOarray["custparam_error"] = 'Please enter/scan valid item';
				}
				response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
				return;
			}

		}
	}
}
function fnCheckOrd(soid,loc,trantype,itemid){

	var SORecinternalids=null;
	var resultArray=new Array();
	
	var SORecinternalids=new Array();
	var SORecinternalidsresult = new nlapiLoadSearch(trantype, 'customsearch_wmsse_trandet_printpicktick');
	SORecinternalidsresult.addFilter(new nlobjSearchFilter('tranid',null,'is',soid));	
	if(loc!=null && loc!="" && loc!='null')
		SORecinternalidsresult.addFilter(new nlobjSearchFilter('location', null, 'anyof', loc));

	if(trantype == 'salesorder')
	{
		SORecinternalidsresult.addFilter(new nlobjSearchFilter('formulanumeric',null,'greaterthan',0).setFormula('TO_NUMBER({quantity} - {quantitypicked})'));
		SORecinternalidsresult.addFilter(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E']));
	}
	else
	{
		SORecinternalidsresult.addFilter(new nlobjSearchFilter('formulanumeric',null,'greaterthan',0).setFormula('TO_NUMBER((-{quantity}) - {quantitypicked})'));
		SORecinternalidsresult.addFilter(new nlobjSearchFilter('status', null, 'anyof', ['TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
		SORecinternalidsresult.addFilter(new nlobjSearchFilter('transactionlinetype', null, 'anyof', 'RECEIVING'));
	}

	SORecinternalidsresult.addFilter(new nlobjSearchFilter('item', null, 'anyof', itemid));
	
	var resLenDetails = SORecinternalidsresult.runSearch();
	
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SORecinternalids = SORecinternalids.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}
	
	if(SORecinternalids !=null && SORecinternalids !=''  && SORecinternalids.length >0)
	{
		var printpickticket = SORecinternalids[0].getValue('custbody_wmsse_printpickticket');
		if(printpickticket == null || printpickticket == '' || printpickticket == 'null' || printpickticket == 'undefined' || printpickticket == 'F')
		{
			
			var SORecinternalids=new Array();
			var SORecinternalidsresult = new nlapiLoadSearch(trantype, 'customsearch_wmsse_trandet_printpicktick');
				
			
			SORecinternalidsresult.addFilter(new nlobjSearchFilter('tranid',null,'is',soid));
			//SOtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
			if(loc!=null && loc!="" && loc!='null')
				SORecinternalidsresult.addFilter(new nlobjSearchFilter('location', null, 'anyof', loc));
			SORecinternalidsresult.addFilter(new nlobjSearchFilter('printedpickingticket',null,'is','T'));
			//SOtrantypefilters.push(new nlobjSearchFilter('custbody_wmsse_printpickticket',null,'is','T'));
			if(trantype == 'salesorder')
				SORecinternalidsresult.addFilter(new nlobjSearchFilter('formulanumeric',null,'greaterthan',0).setFormula('TO_NUMBER({quantity} - {quantitypicked})'));
			else
				SORecinternalidsresult.addFilter(new nlobjSearchFilter('formulanumeric',null,'greaterthan',0).setFormula('TO_NUMBER((-{quantity}) - {quantitypicked})'));
			SORecinternalidsresult.addFilter(new nlobjSearchFilter('item', null, 'anyof', itemid));
					
			var resLenDetails = SORecinternalidsresult.runSearch();
			
			
			var resultsPage = resLenDetails.getResults(0, 1000);
			var offset = 0;
			while (!!resultsPage && resultsPage.length > 0) 
			{
				SORecinternalids = SORecinternalids.concat(resultsPage);
				offset += 1000;
				resultsPage = resLenDetails.getResults(offset, offset + 1000);
			}
			if(SORecinternalids !=null && SORecinternalids !=''  && SORecinternalids.length >0)
			{
				resultArray[0]='Success';
				resultArray[1]=SORecinternalids;
			}
			else
			{
				resultArray[0]='Please print pick ticket for this order#';
				resultArray[1]=SORecinternalids;
			}

		}
		else
		{
			resultArray[0]='Success';
			resultArray[1]=SORecinternalids;
		}
	}
	else
	{
		resultArray[0]='Please enter/scan valid order#';
		resultArray[1]=SORecinternalids;
	}

	//SOtrantypefilters=null;
	//SOtrantypecols=null;
	//return SORecinternalids;
	return resultArray;
}
function funtoCheckPickReportNo(pickreportid,loc,soid,sku){

	nlapiLogExecution('DEBUG', 'pickreportid,soid', pickreportid+","+soid);
	var SOtrantypefilters=new Array();
	var SOtrantypecols = new Array();
	SOtrantypecols.push(new nlobjSearchColumn('custrecord_wmsse_parent_sku_no'));
	SOtrantypecols.push(new nlobjSearchColumn('custrecord_wmsse_customer'));
	SOtrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',pickreportid));
	SOtrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',9));// 9 - Pick Locations Assigned

	if(loc!=null && loc!="" && loc!='null')
		SOtrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', loc));
	if(sku!=null && sku!="" && sku!='null')
		SOtrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', sku));
	SOtrantypefilters.push(new nlobjSearchFilter('tranid','custrecord_wmsse_order_no','is',soid));

	var SORecinternalids=nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,SOtrantypefilters,SOtrantypecols);

	return SORecinternalids;
}
