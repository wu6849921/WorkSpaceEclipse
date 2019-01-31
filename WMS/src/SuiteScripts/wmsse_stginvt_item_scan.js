/**
 * Script Description
 * This script is used to scan item for bin putaway process
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan item for bin putaway process
 */
function RFstgInvtSKUScan(request, response){
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');

		var whLocationName = request.getParameter('custparam_whlocationname');

		var whCompany= request.getParameter('custparam_company');
		var enterBin=request.getParameter('custparam_enterBin');
		nlapiLogExecution('DEBUG', 'enterBin', enterBin);
		var binInternalId=nswms_GetBinInternalId(enterBin,whLocation);
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		var objBinDetails=new Array();

		if(inventoryStatusFeature == true)
		{
			var objPrefresult = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh');
			objPrefresult.addFilter(new nlobjSearchFilter('location',null, 'anyof', whLocation));
			objPrefresult.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
			var resLen = objPrefresult.runSearch();
			var invprefItr=0;
			var resultSet = resLen.forEachResult(function(searchResult)	
					{
				invprefItr++;
				objBinDetails.push(searchResult);
				if(invprefItr==4000)
				{
					return false;
				}
				return true;                
					});

		}
		else
		{
			var filterInv = new Array();

			if(whLocation!= null && whLocation!= '')
			{
				filterInv.push(new nlobjSearchFilter('location','binonhand', 'anyof', whLocation));
				filterInv.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
			}
			if(binInternalId!= null && binInternalId!= '')
				filterInv.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', binInternalId));

			objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_invt_inbound',filterInv, null);
		}

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		var domainName = fndomainName();

		var st0 = domainName + '-Stage Bin Transfer';
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();


		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan', 'customdeploy_wmsse_onbarcodescan');

		var getPageCount=request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize=5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);
		nlapiLogExecution('ERROR', 'totalPageSizeValue', totalPageSizeValue);
		var itemCount=0;
		var OrderNumArray=new Array();

		var openPickDetails = new Array();

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
		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm(itemId) {if(document.getElementById('txtItem').value == '' " +
		"&& (itemId == '' || itemId == 'undefined' || itemId == undefined)){document.getElementById('div_error').innerHTML ='Please enter/scan item';	return false;}" +
		"else{document.getElementById('hdnEnterItem').value=itemId;document.forms['_rf_checkin_item'].submit();return true;}}</script>";
		html = html +functionkeyHtml;

		html = html +"<script type = 'text/javascript'>";
		html = html +"function parsebarcode(url)";
		html = html +"{";
		html = html +"var txtitem = document.getElementById('txtItem').value;";
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
		html = html +"document.getElementById('txtItem').value = vitem;";
		html = html +"}";
		html = html +"}";
		html = html +"}";
		html = html +"};";
		html = html +"  xhttp.open('GET',url, true);";
		html = html +"  xhttp.send();";
		html = html +"}";
		html = html +"</script>";

		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";

		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Stage Bin Transfer -Item</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>From Stage Location: <label>" + enterBin + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' id='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnEnterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnEnterItem' id='hdnEnterItem'>"+
		"				<input type='hidden' name='hdncompositebarcode' id='hdncompositebarcode'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Item"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtItem'  class='smalltextbox'  id='txtItem' onchange='parsebarcode(\""+ServicePageURL+"\");' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			</table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit'  class='defaultlink'   value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr></table>";
		if((objBinDetails!=null && objBinDetails!='' && objBinDetails.length > 0))
		{
			nlapiLogExecution('ERROR', 'objBinDetails.length', objBinDetails.length);  
			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Item"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';	
			var vItemArray =  new Array();
			for (var s = 0; s < objBinDetails.length; s++) {
				if(s%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var txtBin='';
				var binAvailQty=0;
				var txtItemText='';
				var txtItemId='';
				var itemName='';
				var unitsType = '';
				var stockUnit = '';
				var openPickQtyArr = new Array();
				var openPickQty = 0;
				if(inventoryStatusFeature == true)
				{
					txtItemId = objBinDetails[s].getValue('item',null,'group');
					if(vItemArray.indexOf(txtItemId)==-1)
					{
						vItemArray.push(txtItemId);
					}
					else
					{
						continue;
					}
					txtBin = objBinDetails[s].getValue('binnumber',null,'group');					
					txtItemText = objBinDetails[s].getText('item',null,'group');
					itemName = txtItemText;

					for (var s1 = 0; s1 < objBinDetails.length; s1++)
					{
						var tTxtItemId = objBinDetails[s1].getValue('item',null,'group');
						if(tTxtItemId == txtItemId)
						{
							var tBinAvailQty = objBinDetails[s1].getValue('available',null,'sum');
							binAvailQty = Big(binAvailQty).plus(tBinAvailQty);
						}
					}

					var itemfilters=new Array();
					itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',txtItemId));
					if(whLocation != null && whLocation !='' && whLocation != null)
					{
						itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
					}
					var itemcolumns= new Array();

					var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
					if(itemresults!=null && itemresults!='')
					{
						unitsType = itemresults[0].getValue('unitstype');
						stockUnit = itemresults[0].getText('stockunit');
					}

				}
				else
				{
					txtBin = objBinDetails[s].getValue('binnumber','binonhand');
					binAvailQty = objBinDetails[s].getValue('quantityavailable','binonhand');
					txtItemId = objBinDetails[s].getId();
					txtItemText = objBinDetails[s].getValue('itemid');
					itemName = txtItemText;
					unitsType = objBinDetails[s].getValue('unitstype');
					stockUnit = objBinDetails[s].getText('stockunit');
					nlapiLogExecution('DEBUG', 'stockUnit', stockUnit);
				}
				openPickDetails = getOPenTaskPickBinDetails(txtItemId,binInternalId,whLocation,unitsType,stockUnit);
				nlapiLogExecution('DEBUG', 'openPickDetails', openPickDetails);
				if(openPickDetails != null && openPickDetails != '' && openPickDetails.length > 0)
				{
					openPickQtyArr = openPickDetails[1];
					nlapiLogExecution('DEBUG', 'openPickQtyArr', openPickQtyArr);
					openPickQty = openPickQtyArr[0];
				}
				nlapiLogExecution('DEBUG', 'openPickQty', openPickQty);
				binAvailQty = Big(binAvailQty).minus(openPickQty);

				if(parseFloat(binAvailQty) <=0)
				{					
					continue;
				}
				if(OrderNumArray.indexOf(txtItemId)!=-1)
				{					
					continue;
				}
				else
				{					
					if(parseInt(itemCount)<5)
					{
						OrderNumArray.push(txtItemId);
					}
				}

				if((OrderNumArray.length>totalPageSizeValue) && (parseInt(itemCount)<5))
				{
					itemCount=parseInt(itemCount)+1;
					html = html +"				<tr >";
					html = html + "	<tr  class='" + vAltClass + "'>"+
					" <td><a name='link1URL_1' href='#' onclick='return validateForm(\""+txtItemText+"\");'> "+txtItemText+"</a></td>";
					html = html +"				<td class='align-right'>"+binAvailQty;	
					html = html +"				</td>";

					html = html +"			</tr>";				
				}
				if(parseInt(itemCount)>=5)
				{
					var tItemInternalId=0;
					if(objBinDetails[s+1] != null  && objBinDetails[s+1] !='null' && objBinDetails[s+1] != '')
					{
						tItemInternalId=objBinDetails[s+1].getId();

						if(((objBinDetails.length)-(parseInt(s)+1) > 0) && (OrderNumArray.indexOf(tItemInternalId)==-1))
						{
							itemCount=parseInt(itemCount)+1;
							break;
						}
					}
				}
			}
			html = html + "	</table>"+	
			"	<input type='hidden' name='hdngetPageCount' id='hdngetPageCount' value=" + getPageCount + ">"+
			" </td>"+
			"</tr>"+
			"</table></td></tr>";

		}

		html = html +"		<table>	<tr>";
		if(getPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"				<td width='20px'></td>";
		if(parseInt(itemCount)>5)
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>";
		html = html +"	</form>"+

		"<script type='text/javascript'>document.getElementById('txtItem').focus();</script>"+
		"</body>"+
		"</html>";
		objBinDetails=null;
		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating SKU/ITEM');

		// Forming the temporary array POarray
		var POarray = new Array();

		POarray["custparam_scanitem"] = request.getParameter('txtItem');

		if(request.getParameter('txtItem') == '' || request.getParameter('txtItem') == 'null' ||
				request.getParameter('txtItem') == null || request.getParameter('txtItem') == undefined)
		{
			POarray["custparam_scanitem"] = request.getParameter('hdnEnterItem');
		}
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_whlocationname"] = nlapiEscapeXML(request.getParameter('hdnWhLocationName'));
		POarray["custparam_enterBin"] = request.getParameter('hdnEnterBin');
		POarray["custparam_bcComponents"] = request.getParameter('hdncompositebarcode');
		var enterBin = request.getParameter('hdnEnterBin');

		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var whLocation = request.getParameter('hdnWhLocation');
		var logMsg = 'LocationId = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'LocationName = ' + POarray["custparam_whlocationname"] + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - SKU', logMsg);
		nlapiLogExecution('DEBUG','request.getParameter("cmdNextList")',request.getParameter('cmdNextList'));
		nlapiLogExecution('DEBUG','request.getParameter("cmdPrevList")',request.getParameter('cmdPrevList'));
		// Processing only if the 'Previous' button is not pressed

		if(request.getParameter('cmdNextList')=="Next")
		{
			POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+1;
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
			return;
		}
		if(request.getParameter('cmdPrevList')=="Prev")
		{
			POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-1;
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
			return;
		}
		if(optedEvent != 'Back (F7)')
		{
			if (POarray["custparam_scanitem"] != "" ) 
			{
				var currItem = getSKUIdWithName(POarray["custparam_scanitem"], POarray["custparam_whlocation"], POarray["custparam_company"],null);
				if(currItem==null || currItem=='' || currItem=='null')
				{
					nlapiLogExecution('DEBUG', 'Into Bar Code parsing', POarray["custparam_scanitem"]);

					var currItem = new Array();

					var barcodecomponents = parsebarcodeoutsidereceiving(POarray["custparam_scanitem"],POarray["custparam_whlocation"]);
					nlapiLogExecution('DEBUG', 'barcodecomponents', barcodecomponents);		
					if(barcodecomponents != null && barcodecomponents !='' && barcodecomponents !='null')
					{
						nlapiLogExecution('DEBUG', 'barcode error', barcodecomponents["error"]);	

						if(barcodecomponents["error"] == "NoBarcodeFormats")
						{
							POarray["custparam_error"] = 'Please enter/scan valid item.';
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
							return;
						}
						if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
						{
							POarray["custparam_error"] = barcodecomponents["error"];
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
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
							var logMsg1 = 'vItem =' + vItem + '<br>';
							logMsg1 = logMsg1 + 'vItemIntrid = ' + vItemIntrid + '<br>';
							logMsg1 = logMsg1 + 'vbarcodeQty = ' + vbarcodeQty + '<br>';
							logMsg1 = logMsg1 + 'vbarcodeUOM = ' +vbarcodeUOM+ '<br>';
							logMsg1 = logMsg1 + 'vbarcodeLot = ' + vbarcodeLot + '<br>';
							logMsg1 = logMsg1 + 'vbarcodeLotExpirydate = ' + vbarcodeLotExpirydate + '<br>';
							logMsg1 = logMsg1 + 'vbarcodeSerial = ' + vbarcodeSerial + '<br>';


							nlapiLogExecution('DEBUG', 'Barcode Parsing parameters', logMsg1);

							//Mapping - 05022018

							POarray["custparam_bcComponents"] = JSON.stringify(barcodecomponents);
							POarray["custparam_bcqty"]='';
							POarray["custparam_bcuom"]='';
							POarray["custparam_bclot"]='';
							POarray["custparam_bcexpirydate"]='';
							POarray["custparam_bcserial"]='';

							//Up to here Mapping - 05022018

						}
					}

					nlapiLogExecution('DEBUG', 'Out of Bar Code parsing', POarray["custparam_scanitem"]);				
				}
				if(currItem!=null && currItem!='')
				{						
					var vIntId=currItem[0];
					if(vIntId != null && vIntId != '')
					{
						var inventoryStatusFeature = isInvStatusFeatureEnabled();

						POarray["custparam_fetcheditemid"] = vIntId;

						POarray["custparam_enterBin"]=enterBin;
						POarray["custparam_fetcheditemname"] = currItem[1];
						var itemType = nswms_GetItemType(POarray["custparam_fetcheditemid"], POarray["custparam_whlocation"]);
						POarray["custparam_itemtype"] = itemType;

						if(inventoryStatusFeature != true)
						{
							var objBinDetails=null;

							var unitsType = '';
							var stockUnit = '';
							var openPickDetails = new Array();
							var openPickQtyArr = new Array();
							var openPickQty = 0;
							var binInternalId=nswms_GetBinInternalId(enterBin,whLocation);
							var filterInv = new Array();
							if(vIntId != null && vIntId != '')
								filterInv.push(new nlobjSearchFilter('internalid',null, 'anyof', vIntId));
							if(whLocation!= null && whLocation!= '')
								filterInv.push(new nlobjSearchFilter('location','binonhand', 'anyof', whLocation));
							if(binInternalId!= null && binInternalId!= '')
								filterInv.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', binInternalId));
							var columnStrat = new Array();
							columnStrat.push(new nlobjSearchColumn('usebins'));
							columnStrat.push(new nlobjSearchColumn('quantityavailable','binonhand'));
							objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_invt_inbound',filterInv, columnStrat);

							nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails);
							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									nlapiLogExecution('DEBUG', 'Inside if objBinDetails', objBinDetails.length);
									var dblTotbinAvailQty=0;
									var useBins =  objBinDetails[0].getValue('usebins');
									nlapiLogExecution('DEBUG', 'useBins', useBins);
									if(useBins == 'F')
									{
										POarray["custparam_error"] = 'Please select usebins flag for this item.';
										response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
										return;
									}															

									for(var p=0;p<objBinDetails.length;p++)
									{
										var binAvailQty = objBinDetails[p].getValue('quantityavailable','binonhand');
										if(binAvailQty == null || binAvailQty == '')
											binAvailQty=0;
										dblTotbinAvailQty=Big(dblTotbinAvailQty).plus(binAvailQty);

									}

									unitsType = objBinDetails[0].getValue('unitstype');
									stockUnit = objBinDetails[0].getText('stockunit');

									openPickDetails = getOPenTaskPickBinDetails(vIntId,binInternalId,whLocation,unitsType,stockUnit);
									nlapiLogExecution('DEBUG', 'openPickDetails', openPickDetails);
									if(openPickDetails != null && openPickDetails != '' && openPickDetails.length > 0)
									{
										openPickQtyArr = DEBUG[1];
										nlapiLogExecution('ERROR', 'openPickQtyArr', openPickQtyArr);
										openPickQty = openPickQtyArr[0];
									}
									nlapiLogExecution('DEBUG', 'openPickQty', openPickQty);
									dblTotbinAvailQty = Big(dblTotbinAvailQty).minus(openPickQty);
									nlapiLogExecution('DEBUG', 'dblTotbinAvailQty', dblTotbinAvailQty);

									if(parseFloat(dblTotbinAvailQty)<=0)
									{
										POarray["custparam_error"] = 'There is no inventory in '+enterBin+' for item  '+currItem[1];
										response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
										return;
									}

									POarray["custparam_availableqty"] =Number(dblTotbinAvailQty);
								}
								else
								{
									POarray["custparam_error"] = 'There is no inventory in '+enterBin+' for item  '+currItem[1];
									response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
									return;
								}
							}
						}
						objBinDetails=null;
						var logMsg = logMsg + 'Fetched Item = ' + POarray["custparam_fetcheditemid"] + '<br>';
						logMsg = logMsg + 'Location = ' + POarray["custparam_whlocation"] + '<br>';
						logMsg = logMsg + 'Locationname = ' + POarray["custparam_whlocationname"] + '<br>';
						logMsg = logMsg + 'Fetched Item Name = ' + POarray["custparam_fetcheditemname"] + '<br>';
						logMsg = logMsg + 'itemType = ' + itemType;
						nlapiLogExecution('DEBUG', 'Inside Item scan Details', logMsg);
						logMsg="";
						if(POarray["custparam_scanitem"] != ""){

							if((itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
									&& (inventoryStatusFeature !=true) )
							{
								POarray["custparam_error"] = '';
								response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan', 
										'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
								return;
							}
							else
							{

								if(inventoryStatusFeature ==true)
								{

									var searchName = 'customsearch_wmsse_invtbalance_invt_item';
									if(itemType == "inventoryitem" || itemType == "assemblyitem")
									{
										searchName = 'customsearch_wmsse_invtbalance_invt_item';
									}
									else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") 
									{
										searchName = 'customsearch_wmsse_invtbalance_serialsrh';

									}
									else if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") 
									{
										searchName = 'customsearch_wmsse_inventorybalance';

									}
									else
									{

									}
									var objBinStatusDetails = new Array();
									var binInternalId=nswms_GetBinInternalId(enterBin,POarray["custparam_whlocation"]);
									var statusResults = nlapiLoadSearch('InventoryBalance',searchName);
									if(POarray["custparam_whlocation"] != null && POarray["custparam_whlocation"] != '')
										statusResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', POarray["custparam_whlocation"]));
									statusResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', vIntId));
									if(binInternalId != null && binInternalId != '')
										statusResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));

									var resLen = statusResults.runSearch();
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
										var VUnitType ='';
										var blnItemUnit ='';
										var itemfilters=new Array();
										itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',vIntId));
										if(whLocation != null && whLocation !='' && whLocation != null)
										{
											itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
										}
										var itemcolumns= new Array();

										var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
										if(itemresults!=null && itemresults!='')
										{
											VUnitType = itemresults[0].getValue('unitstype');
											blnItemUnit = itemresults[0].getText('stockunit');
										}
										var vOpenPickDetails = null;
										if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
										{
											vOpenPickDetails = getOPenTaskPickBinDetailsLot(vIntId,binInternalId,
													POarray["custparam_whlocation"],VUnitType,blnItemUnit);
											var totalAvailQty = 0;
											for(var statusItr=0;statusItr<objBinStatusDetails.length;statusItr++)
											{
												var status = objBinStatusDetails[statusItr].getText('status',null,'group');

												var vBinQtyAvail=objBinStatusDetails[statusItr].getValue('available',null,'sum');
												var eneteredLotTxt=objBinStatusDetails[statusItr].getText('inventorynumber',null,'group');
												var statusId = objBinStatusDetails[statusItr].getValue('status',null,'group');
												var openPickQty = 0;
												if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
												{						
													var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
													var	vOpenPickQtyArr = vOpenPickDetails[1];
													var	vBinLotArr = vOpenPickDetails[3];
													var	vBinStatusArr = vOpenPickDetails[5];

													if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && 
															vBinStatusArr != 'undefined' && 
															vBinStatusArr != undefined)
													{
														for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
														{
															var stsArr = vBinStatusArr[binItr];
															var vLotText =vBinLotArr[binItr];									
															if(stsArr == statusId && eneteredLotTxt==vLotText)
															{
																openPickQty = vOpenPickQtyArr[binItr];
																break;
															}
														}
													}
												}
												vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);
												totalAvailQty = Big(totalAvailQty).plus(vBinQtyAvail);

											}

											POarray["custparam_error"] = '';
											POarray["custparam_availableqty"] =Number(totalAvailQty);
											response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan',
													'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
											return;
										}
										else
										{
											vOpenPickDetails = getOPenTaskPickBinDetails(vIntId,binInternalId,POarray["custparam_whlocation"],
													VUnitType,blnItemUnit,'','');

											for(var statusItr=0;statusItr<objBinStatusDetails.length;statusItr++)
											{
												var status = ''; 
												var vBinQtyAvail ='';
												var statusId = '';
												if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
												{
													status = objBinStatusDetails[statusItr].getText('status',null,'group');
													vBinQtyAvail=objBinStatusDetails[statusItr].getValue('available',null,'sum');
													statusId = objBinStatusDetails[statusItr].getValue('status',null,'group');
												}
												else
												{
													status = objBinStatusDetails[statusItr].getText('status');
													vBinQtyAvail=objBinStatusDetails[statusItr].getValue('available');
													statusId = objBinStatusDetails[statusItr].getValue('status');
												}

												var openPickQty = 0;
												if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
												{
													var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
													var	vOpenPickQtyArr = vOpenPickDetails[1];
													var	vBinStatusArr = vOpenPickDetails[3];
													if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && 
															vBinStatusArr != 'undefined' && 
															vBinStatusArr != undefined)
													{
														for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
														{
															var stsArr = vBinStatusArr[binItr];									
															if(stsArr == statusId)
															{
																openPickQty = vOpenPickQtyArr[binItr];
																break;
															}
														}
													}
												}
												vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);
												if(parseFloat(vBinQtyAvail) > 0)
												{
													var currRow = [status,vBinQtyAvail,statusId];
													vStatusDetails.push(currRow);
												}
												if(vStatusDetails.length >=3)
												{
													break;
												}

											}
											if(vStatusDetails.length > 1)
											{

												POarray["custparam_error"] = '';
												POarray["custparam_enteredBinID"]=binInternalId;
												POarray["custparam_enteredbin"]=enterBin;


												response.sendRedirect('SUITELET', 'customscript_wmsse_stg_statusscan', 
														'customdeploy_wmsse_stg_statusscan', false, POarray);
												return;
											}
											POarray["custparam_error"] = '';
											if(vStatusDetails.length > 0)
											{
												var Row = vStatusDetails[0];
												POarray["custparam_inventorystatus"]=Row[2];
												POarray["custparam_availableqty"]=Number(Row[1]);
											}

											response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
											return;
										}

									}
									else
									{
										POarray["custparam_error"] = 'There is no inventory in '+enterBin+' for item  '+currItem[1];
										response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
										return;
									}
								}

								POarray["custparam_error"] = '';
								response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
								return;
							}

						} 
						else 
						{
							nlapiLogExecution('ERROR', 'No SKU scanned or entered', POarray["custparam_scanitem"]);
							POarray["custparam_error"] = 'Please enter/scan valid item';
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
						}
					}
				}
				else
				{
					var itemfilters=new Array();
					itemfilters.push(new nlobjSearchFilter('nameinternal',null,'is',POarray["custparam_scanitem"]));
					if(POarray["custparam_whlocation"] != null && POarray["custparam_whlocation"] !='' && POarray["custparam_whlocation"] != null)
					{
						itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',POarray["custparam_whlocation"]]));
					}
					var itemcolumns= new Array();
					itemcolumns.push(new nlobjSearchColumn('isinactive'));
					var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
					nlapiLogExecution('DEBUG', 'itemresults', itemresults);
					if(itemresults!=null && itemresults!='')
					{
						if(itemresults[0].getValue('isinactive')=="T")
						{
							POarray["custparam_error"] = 'Entered item is inactive.';
						}
						else
						{
							POarray["custparam_error"] = 'Please enter/scan valid item';
						}
					}
					else
					{
						POarray["custparam_error"] = 'Please enter/scan valid item';
					}
					response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
					nlapiLogExecution('DEBUG', 'itemRecord', 'Invalid Item Specified');
					return;
				}
			}
			else 
			{
				POarray["custparam_error"] = 'Please enter/scan item';
				response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
				nlapiLogExecution('ERROR', 'No Item scanned ', '');
				return;
			}
		} 
		else 
		{
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_fromstage', 'customdeploy_wmsse_stginvt_fromstage', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.


