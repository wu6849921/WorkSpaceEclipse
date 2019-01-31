/**
 * Script Description
 * This script is used for inventory transfer Item scanning screen.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan Item for inventory transfer process.
 */
function RFInventoryITSKU(request, response){
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');

		var whLocationName = request.getParameter('custparam_whlocationname');
		var whTOLocation = request.getParameter('custparam_towhlocation');

		var whTOLocationName = request.getParameter('custparam_towhlocationname');

		whLocationName = nlapiLookupField('location', whLocation, 'name');
		whTOLocationName = nlapiLookupField('location', whTOLocation, 'name');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var whCompany= request.getParameter('custparam_company');
		var vInvTrnsId=request.getParameter('custparam_ITId');
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		var domainName = fndomainName();

		var st0 = domainName + '-IT Inventory';

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan', 'customdeploy_wmsse_onbarcodescan');

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
		"	<script type='text/javascript'>function validateForm() {if(document.getElementById('txtItem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item';document.getElementById('txtItem').focus();	return false;}else if(document.getElementById('txtQty').value == ''){document.getElementById('div_error').innerHTML ='Please enter qty to transfer';	return false;}  else{var scannedqty=document.getElementById('txtQty').value; if((isNaN(scannedqty) || parseFloat(scannedqty)<0)){document.getElementById('div_error').innerHTML ='Please enter valid qty to transfer'; return false;} else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}}</script>"+
		"	<script type='text/javascript'>function validateItem(usedBins,vpoitem) {if(usedBins == 'F'){document.getElementById('div_error').innerHTML ='Please Select Use Bins Flag for this item ' +vpoitem+ ' to receive.';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
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

		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Inventory Transfer - Item</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>From Warehouse Location: <label>" + whLocationName + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' id='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdntoWhLocation' value=" + whTOLocation + ">"+	
		"				<input type='hidden' name='hdntoWhLocationName' value='" + whTOLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnITId' value=" + vInvTrnsId + ">"+	
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdncompositebarcode' id='hdncompositebarcode'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>To Warehouse Location: <label>" + whTOLocationName + "</label>"+
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
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";

		html = html + "</td></tr></table>	</form>"+

		"<script type='text/javascript'>document.getElementById('txtItem').focus();</script>"+
		"</body>"+
		"</html>";

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
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_towhlocation"] = request.getParameter('hdntoWhLocation');
		POarray["custparam_towhlocationname"] = request.getParameter('custparam_towhlocationname');
		POarray["custparam_bcComponents"] = request.getParameter('hdncompositebarcode');
		POarray["custparam_ITId"] =request.getParameter('hdnITId');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		var logMsg = 'LocationId = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'LocationName = ' + POarray["custparam_whlocationname"] + '<br>';
		nlapiLogExecution('DEBUG', 'Processing RF - SKU', logMsg);

		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)')
		{
			if (POarray["custparam_scanitem"] != "") 
			{
				var currItem = getSKUIdWithName(POarray["custparam_scanitem"], POarray["custparam_whlocation"], POarray["custparam_company"],null);
				if(currItem==null || currItem=='' || currItem=='undefined')
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
							response.sendRedirect('SUITELET', 'customscript_wmsse_it_item_scan', 'customdeploy_wmsse_it_item_scan', false, POarray);
							return;
						}
						if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
						{
							POarray["custparam_error"] = barcodecomponents["error"];
							response.sendRedirect('SUITELET', 'customscript_wmsse_it_item_scan', 'customdeploy_wmsse_it_item_scan', false, POarray);
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
						POarray["custparam_fetcheditemid"] = vIntId;
						POarray["custparam_fetcheditemname"] = currItem[1];
						var itemType = nswms_GetItemType(POarray["custparam_fetcheditemid"], POarray["custparam_whlocation"]);
						POarray["custparam_itemtype"] = itemType;

						var logMsg = logMsg + 'Fetched Item = ' + POarray["custparam_fetcheditemid"] + '<br>';
						logMsg = logMsg + 'Location = ' + POarray["custparam_whlocation"] + '<br>';
						logMsg = logMsg + 'Locationname = ' + POarray["custparam_whlocationname"] + '<br>';
						logMsg = logMsg + 'Fetched Item Name = ' + POarray["custparam_fetcheditemname"] + '<br>';
						logMsg = logMsg + 'itemType = ' + itemType;
						nlapiLogExecution('DEBUG', 'Inside Item scan Details', logMsg);						


						if(POarray["custparam_scanitem"] != ""  && (itemType != 'kititem'))
						{ 
							POarray["custparam_error"] = '';
							response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
							return;
						} 
						else 
						{
							nlapiLogExecution('ERROR', 'No SKU scanned or entered', POarray["custparam_scanitem"]);
							POarray["custparam_error"] = 'Please enter/scan valid item';
							response.sendRedirect('SUITELET', 'customscript_wmsse_it_item_scan', 'customdeploy_wmsse_it_item_scan', false, POarray);
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
					response.sendRedirect('SUITELET', 'customscript_wmsse_it_item_scan', 'customdeploy_wmsse_it_item_scan', false, POarray);
					nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
					return;
				}
			} 
			else 
			{
				POarray["custparam_error"] = 'Please enter/scan valid item';
				response.sendRedirect('SUITELET', 'customscript_wmsse_it_item_scan', 'customdeploy_wmsse_it_item_scan', false, POarray);
				nlapiLogExecution('ERROR', 'No Item scanned ', '');
				return;
			}

		} 
		else 
		{
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_it_to_wh_loc', 'customdeploy_wmsse_it_to_wh_loc_di', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.


