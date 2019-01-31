/**
 * Script Description
 * This script is used to scan item for bin putaway process
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan item for bin putaway process
 */
function RFBinPutawaySKU(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var whLocationName = request.getParameter('custparam_whlocationname');

		var vmakeInvAvailFlag = "T";
		var fields = ['makeinventoryavailable'];
		var vLocDetails= nlapiLookupField('location',whLocation,fields);
		vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
		var whCompany= request.getParameter('custparam_company');
		var enterBin=request.getParameter('custparam_enterBin');
		nlapiLogExecution('ERROR', 'enterBin', enterBin);
		var binInternalId=nswms_GetBinInternalId(enterBin);
		var objBinDetails=null;

		var filterInv = new Array();

		if(whLocation!= null && whLocation!= '')
		{
			filterInv.push(new nlobjSearchFilter('location','binonhand', 'anyof', whLocation));
			filterInv.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		if(binInternalId!= null && binInternalId!= '')
			filterInv.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', binInternalId));
		if(vmakeInvAvailFlag == "T")
			filterInv.push(new nlobjSearchFilter('quantityavailable','binonhand', 'greaterthan', 0));
		else
			filterInv.push(new nlobjSearchFilter('quantityonhand','binonhand', 'greaterthan', 0));

		objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterInv, null);
		getActualBeginTime = TimeStamp();
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		var st0 = domainName + '-Bin Putaway';
		if (CSSfilefound) 
		{ 
			CSSurl = CSSfilefound.getURL();
		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var getPageCount=request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize=5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);
		nlapiLogExecution('ERROR', 'totalPageSizeValue', totalPageSizeValue);
		var itemCount=0;

		var OrderNumArray=new Array();
		var openPickDetails = new Array();

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan', 'customdeploy_wmsse_onbarcodescan');

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
		"	<script type='text/javascript'>function validateForm() {if(document.getElementById('txtItem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
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
		"			<tr><td class='tableheading'>Bin Putaway Item</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>From Bin Location: <label>" + enterBin + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' id='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnEnterBin' value='" + enterBin + "'>"+
		"				<input type='hidden' name='hdnvmakeInvAvailFlag' value=" + vmakeInvAvailFlag + ">"+
		"				<input type='hidden' name='hdninventoryStatusFeature' value=" + inventoryStatusFeature + ">"+
		"				<input type='hidden' name='hdncompositebarcode' id='hdncompositebarcode'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Item"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtItem'  class='smalltextbox'  id='txtItem' type='text' onchange='parsebarcode(\""+ServicePageURL+"\");'/>"+
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
			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Item"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';	
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

				txtBin = objBinDetails[s].getValue('binnumber','binonhand');
				if(vmakeInvAvailFlag == "T")
					binAvailQty = objBinDetails[s].getValue('quantityavailable','binonhand');
				else
					binAvailQty = objBinDetails[s].getValue('quantityonhand','binonhand');

				txtItemId = objBinDetails[s].getId();
				txtItemText = objBinDetails[s].getValue('itemid');
				itemName = txtItemText;

				unitsType = objBinDetails[s].getValue('unitstype');
				stockUnit = objBinDetails[s].getText('stockunit');
				var openPickDetails = getOPenTaskPickBinDetails(txtItemId,binInternalId,whLocation,unitsType,stockUnit);
				if(openPickDetails != null && openPickDetails != '' && openPickDetails.length > 0)
				{
					openPickQtyArr = openPickDetails[1];
					openPickQty = openPickQtyArr[0];
				}
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
					var itemType = nswms_GetItemType(txtItemId, whLocation);
					var checkInURL_1 = '';
					var invstatusid='';
					var invtStatusText ='';

					//To check status more than one and navigate to inventory status therefore not include code to handle 4K results
					if(inventoryStatusFeature == true)
					{		
						var objBinStatusDetails = fnGetInventoryBalanceDetails(whLocation,txtItemId,binInternalId)
						if(objBinStatusDetails != 'null' && objBinStatusDetails != null && objBinStatusDetails != '' )
						{
							if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" ||
									itemType=="serializedassemblyitem")
							{
								var serStatusArr = new Array;
								for(var serStatusItr=0; serStatusItr<objBinStatusDetails.length; serStatusItr++)
								{
									invstatusid = objBinStatusDetails[serStatusItr].getValue('status');
									if(serStatusArr.indexOf(invstatusid)==-1)
									{
										serStatusArr.push(invstatusid);
									}

								}
								if(((itemType == "inventoryitem" || itemType == "assemblyitem") && objBinStatusDetails.length > 1) || 
										((itemType == "serializedinventoryitem" || itemType == "serializedassemblyitem") && serStatusArr.length > 1))
								{
									checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_bp_status_scan', 'customdeploy_wmsse_bp_status_scan');
								}
								else
								{
									if(objBinStatusDetails.length>0)
									{
										invstatusid = objBinStatusDetails[0].getValue('status');
										invtStatusText = objBinStatusDetails[0].getText('status');
										checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan');
									}
								}
							}
							else
							{
								if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
								{
									checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_bp_lot_scan', 'customdeploy_wmsse_bp_lot_scan');
								}
							}
						}
					}
					else
					{
						if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
						{
							checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_bp_lot_scan', 'customdeploy_wmsse_bp_lot_scan');
						}
						else
						{
							checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan');
						}
					}

					var linkURL_1 = nlapiEscapeXML(checkInURL_1 + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + 
							'&custparam_company=' + whCompany + '&custparam_fetcheditemid=' + txtItemId + '&custparam_fetcheditemname=' + itemName + 
							'&custparam_itemtype=' + itemType  + '&custparam_availableqty=' + binAvailQty  + '&custparam_enterBin=' + enterBin + 
							'&custparam_enterQty=' + binAvailQty + '&custparam_actualbegintime=' + getActualBeginTime +'&custparam_enteredBinId=' + binInternalId +
							'&custparam_availableqty=' + binAvailQty +'&custparam_uom=' + stockUnit + '&custparam_unittype=' + unitsType +
							'&custparam_invstatusid=' + invstatusid +'&custparam_invstatusname=' + invtStatusText);

					html = html +"				<tr >";
					html = html + "	<tr  class='" + vAltClass + "'>"+
					" <td><a name='link1URL_1' href='" + linkURL_1 + "'> "+txtItemText+"</a></td>";
					html = html +"				<td class='align-right'>"+parseFloat(parseFloat(binAvailQty).toFixed(8));

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
	else 
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating SKU/ITEM');

		// Forming the temporary array POarray
		var POarray = new Array();

		POarray["custparam_scanitem"] = request.getParameter('txtItem');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_whlocationname"] = nlapiEscapeXML(request.getParameter('hdnWhLocationName'));
		POarray["custparam_enterBin"] = request.getParameter('hdnEnterBin');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_hdnvmakeInvAvailFlag"] = request.getParameter('hdnvmakeInvAvailFlag');
		POarray["custparam_hdninvStatusFeature"] = request.getParameter('hdninventoryStatusFeature');
		POarray["custparam_bcComponents"] = request.getParameter('hdncompositebarcode');

		var vmakeInvAvailFlag = request.getParameter('hdnvmakeInvAvailFlag');
		var enterBin = request.getParameter('hdnEnterBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var whLocation = request.getParameter('hdnWhLocation');
		var inventoryStatusFeature = request.getParameter('hdninventoryStatusFeature');

		var logMsg = 'LocationId = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'LocationName = ' + POarray["custparam_whlocationname"] + '<br>';
		logMsg = logMsg + 'request.getParameter("cmdNextList")' + request.getParameter("cmdNextList") + '<br>';
		logMsg = logMsg + 'request.getParameter("cmdPrevList")' + request.getParameter("cmdPrevList") + '<br>';
		logMsg = logMsg + 'inventoryStatusFeature' + inventoryStatusFeature + '<br>';

		nlapiLogExecution('DEBUG', 'Processing RF - SKU', logMsg);

		// Processing only if the 'Previous' button is not pressed

		if(request.getParameter('cmdNextList')=="Next")
		{
			POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+1;
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
			return;
		}
		if(request.getParameter('cmdPrevList')=="Prev")
		{
			POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-1;
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
			return;
		}
		if(optedEvent != 'Back (F7)')
		{
			if (POarray["custparam_scanitem"] != "" ) 
			{
				//To validate scanned item
				var currItem = getSKUIdWithName(POarray["custparam_scanitem"], POarray["custparam_whlocation"], POarray["custparam_company"],null);
				if(currItem==null ||  currItem=='' || currItem=='null')
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
							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
							return;
						}
						if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
						{
							POarray["custparam_error"] = barcodecomponents["error"];
							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
							return;
						}

						POarray["custparam_bcComponents"] = JSON.stringify(barcodecomponents);

						nlapiLogExecution('DEBUG', 'POarray["custparam_bcComponents"]', POarray["custparam_bcComponents"]);

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

						POarray["custparam_fetcheditemid"] = vIntId;

						POarray["custparam_enterBin"]=enterBin;
						POarray["custparam_fetcheditemname"] = currItem[1];
						var itemType = nswms_GetItemType(POarray["custparam_fetcheditemid"], POarray["custparam_whlocation"]);
						POarray["custparam_itemtype"] = itemType;

						var selectedStatus ='';
						var selectedStatusName = '';
						var stockUnit = '';
						var unitsType = '';
						var invstatusid='';
						var binInternalId=nswms_GetBinInternalId(enterBin);
						POarray["custparam_enteredBinId"] = binInternalId;

						//To get inventory status and details when feature is enabled  and navigate if status is more than one therefore not included code for 4K results
						if(inventoryStatusFeature == 'true')
						{	
							var objBinStatusDetails = fnGetInventoryBalanceDetails(POarray["custparam_whlocation"],vIntId,binInternalId)
							if(objBinStatusDetails != 'null' && objBinStatusDetails != '' && objBinStatusDetails != null)
							{
								unitsType = objBinStatusDetails[0].getValue('unitstype','item');
								stockUnit = objBinStatusDetails[0].getText('stockunit','item');
								POarray["custparam_uom"] =stockUnit;
								POarray["custparam_unittype"] =unitsType;

								var dblTotbinAvailQty=0;
								for(var binQtyIterator=0; binQtyIterator<objBinStatusDetails.length; binQtyIterator++)
								{
									if(vmakeInvAvailFlag == "T")
										var binAvailQty = objBinStatusDetails[binQtyIterator].getValue('available');
									else
										var binAvailQty = objBinStatusDetails[binQtyIterator].getValue('onhand');

									if(binAvailQty == null || binAvailQty == '')
										binAvailQty=0;
									dblTotbinAvailQty=Big(dblTotbinAvailQty).plus(binAvailQty);
								}

								//To find open pick and available Qty
								var openPickDetails = getOPenTaskPickBinDetails(vIntId,binInternalId,POarray["custparam_whlocation"],unitsType,stockUnit);
								if(openPickDetails != null && openPickDetails != '' && openPickDetails.length > 0)
								{
									openPickQtyArr = openPickDetails[1];
									openPickQty = openPickQtyArr[0];
								}
								if(openPickQty!=null || openPickQty!='')
									openPickQty = 0;

								dblTotbinAvailQty = Big(dblTotbinAvailQty).minus(openPickQty);


								if(parseFloat(dblTotbinAvailQty)<=0)
								{
									POarray["custparam_error"] = 'There is no inventory in '+enterBin+' for item  '+currItem[1];
									response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
									return;
								}
								POarray["custparam_availableqty"] =Number(dblTotbinAvailQty);
								if(itemType == "inventoryitem" || itemType == "assemblyitem" ||itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
								{

									var serStatusArr = new Array;
									for(var serStatusItr=0; serStatusItr<objBinStatusDetails.length; serStatusItr++)
									{
										invstatusid = objBinStatusDetails[serStatusItr].getValue('status');
										if(serStatusArr.indexOf(invstatusid)==-1)
										{
											serStatusArr.push(invstatusid);
										}

									}
									if(objBinStatusDetails.length > 1)
									{
										if(((itemType == "inventoryitem" || itemType == "assemblyitem") && objBinStatusDetails.length > 1) || 
												((itemType == "serializedinventoryitem" || itemType == "serializedassemblyitem") && serStatusArr.length > 1))
										{
											response.sendRedirect('SUITELET', 'customscript_wmsse_bp_status_scan', 'customdeploy_wmsse_bp_status_scan', false, POarray);
											return;  
										}
										else
										{
											if(objBinStatusDetails.length>0)
											{
												selectedStatus = objBinStatusDetails[0].getValue('status');
												selectedStatusName = objBinStatusDetails[0].getText('status');

												POarray["custparam_invstatusid"] =selectedStatus;
												POarray["custparam_invstatusname"] =selectedStatusName;

												var useBins = objBinStatusDetails[0].getValue('usebins','item');
												if(useBins == 'F')
												{
													POarray["custparam_error"] = 'Please select usebins flag for this item.';
													response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
													return;
												}
												nlapiLogExecution('ERROR', 'dblTotbinAvailQty', dblTotbinAvailQty);

											}
											else
											{
												POarray["custparam_error"] = 'There is no inventory in '+enterBin+' for item  '+currItem[1];
												response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
												return;
											}
										}
									}
									else
									{
										if(objBinStatusDetails.length>0)
										{
											selectedStatus = objBinStatusDetails[0].getValue('status');
											selectedStatusName = objBinStatusDetails[0].getText('status');

											POarray["custparam_invstatusid"] =selectedStatus;
											POarray["custparam_invstatusname"] =selectedStatusName;

											var useBins = objBinStatusDetails[0].getValue('usebins','item');
											if(useBins == 'F')
											{
												POarray["custparam_error"] = 'Please select usebins flag for this item.';
												response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
												return;
											}
											nlapiLogExecution('ERROR', 'dblTotbinAvailQty', dblTotbinAvailQty);

										}
										else
										{
											POarray["custparam_error"] = 'There is no inventory in '+enterBin+' for item  '+currItem[1];
											response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
											return;
										}
									}
								}
								else
								{
									if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
									{
										POarray["custparam_error"] = '';
										response.sendRedirect('SUITELET', 'customscript_wmsse_bp_lot_scan', 'customdeploy_wmsse_bp_lot_scan', false, POarray);
										return;
									}
								}
							}
							else
							{
								POarray["custparam_error"] = 'There is no inventory in '+enterBin+' for item  '+currItem[1];
								response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
								return;
							}
						}
						else
						{
							var objBinDetails=null;
							var unitsType = '';
							var stockUnit = '';
							var openPickDetails = new Array();
							var openPickQtyArr = new Array();
							var openPickQty = 0;

							var binInternalId=nswms_GetBinInternalId(enterBin);
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
							objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterInv, columnStrat);

							if(objBinDetails!=null && objBinDetails!='')
							{
								if(objBinDetails.length>0)
								{
									var dblTotbinAvailQty=0;
									var useBins =  objBinDetails[0].getValue('usebins');
									if(useBins == 'F')
									{
										POarray["custparam_error"] = 'Please select usebins flag for this item.';
										response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
										return;
									}
									for(var p=0;p<objBinDetails.length;p++)
									{
										if(vmakeInvAvailFlag == "T")
											var binAvailQty = objBinDetails[p].getValue('quantityavailable','binonhand');
										else
											var binAvailQty = objBinDetails[p].getValue('quantityonhand','binonhand');


										if(binAvailQty == null || binAvailQty == '')
											binAvailQty=0;
										dblTotbinAvailQty=Big(dblTotbinAvailQty).plus(binAvailQty);

									}

									unitsType = objBinDetails[0].getValue('unitstype');
									stockUnit = objBinDetails[0].getText('stockunit');
									var openPickDetails = getOPenTaskPickBinDetails(vIntId,binInternalId,whLocation,unitsType,stockUnit);
									if(openPickDetails != null && openPickDetails != '' && openPickDetails.length > 0)
									{
										openPickQtyArr = openPickDetails[1];
										openPickQty = openPickQtyArr[0];
									}
									dblTotbinAvailQty = Big(dblTotbinAvailQty).minus(openPickQty);

									if(parseFloat(dblTotbinAvailQty)<=0)
									{
										POarray["custparam_error"] = 'There is no inventory in '+enterBin+' for item  '+currItem[1];
										response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
										return;
									}
									POarray["custparam_availableqty"] =Number(dblTotbinAvailQty);
								}
								else
								{
									POarray["custparam_error"] = 'There is no inventory in '+enterBin+' for item  '+currItem[1];
									response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
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
						nlapiLogExecution('ERROR', 'Inside Item scan Details', logMsg);
						logMsg="";
						if(POarray["custparam_scanitem"] != ""){

							if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
							{
								POarray["custparam_error"] = '';
								response.sendRedirect('SUITELET', 'customscript_wmsse_bp_lot_scan', 'customdeploy_wmsse_bp_lot_scan', false, POarray);
								return;
							}
							else
							{
								POarray["custparam_error"] = '';
								response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
								return;
							}
						} 
						else
						{
							nlapiLogExecution('ERROR', 'No SKU scanned or entered', POarray["custparam_scanitem"]);
							POarray["custparam_error"] = 'Please enter/scan valid item';
							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
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
					//itemcolumns.push(new nlobjSearchColumn('isinactive'));
					var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_receivingitemdetails', itemfilters, null);

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
					response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
					nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
					return;
				}				
			}
			else 
			{
				POarray["custparam_error"] = 'Please enter/scan item';
				response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
				nlapiLogExecution('ERROR', 'No Item scanned ', '');
				return;
			}

		} else {
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_bp_frombin_scan', 'customdeploy_wmsse_bp_frombin_scan', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.


