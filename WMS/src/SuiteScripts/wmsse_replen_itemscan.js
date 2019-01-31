/**
 * Script Description
 * This script is used to scan the item for Replenishment
 */
/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function CheckInSKU(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		//Variable Declaration
		var getOptedField = request.getParameter('custparam_option');
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var html = '';
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var whLocationName=request.getParameter('custparam_whlocationname');

		var headerVar='Replenishment Item';

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && 
				request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		var st0 = domainName + '-'+headerVar;
		if (CSSfilefound) 
		{ 
			CSSurl = CSSfilefound.getURL();
		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound=  getLoadFile('bx_loader.gif');
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan', 'customdeploy_wmsse_onbarcodescan');

		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' " +
		"'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";

		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML(
			"https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") +
			"' type='text/css' rel='stylesheet'>";	 
		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() {" +
		"if(document.getElementById('txtItem').value == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan item';	return false;" +
		"}else{document.getElementById('loading').style.display = ''; return true;}}</script>";
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

		html = html +"<script type = 'text/javascript' >function preventBack(){" +
		"window.history.forward();}" +
		"setTimeout('preventBack()', 0);window.onunload=function(){null};</script>" +
		" </head><body  onkeydown='return OnKeyDown_CL();'>";

		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Replenishment Item</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+
		errMsg+"</div>" +
		"		</td></tr>"+
		"		</table><table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<input type='hidden' name='hdnWhLocation' id='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value= '" + whLocationName + "'>"+
		"				<input type='hidden' name='hdncompositebarcode' id='hdncompositebarcode'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName +
		"	</label></td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Item:"+	
		"			</tr>"+
		"			<tr>";

		html = html +"				<td align = 'left'><input name='txtItem'  class='smalltextbox' " +
		" id='txtItem' type='text' onchange='parsebarcode(\""+ServicePageURL+"\");'>"+
		"			&nbsp&nbsp&nbsp	<input name='cmdSearch' type='submit' value='List' width='100px'/>" +
		"</td>";

		html = html +"				</td>"+
		"			</tr>"+
		"			</table><table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' class='defaultlink'   type='submit' " +
		"		value='' onclick='return validateForm();'/></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' " +
		"		onclick='return validateForm();'/></td>"+
		"			</tr><tr><td></td></tr>"+
		"		 </table>";

		html = html + "</form>"+

		"<script type='text/javascript'>document.getElementById('txtItem').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else
	{

		nlapiLogExecution('ERROR', 'Processing RF', 'Validating SKU/ITEM');
		//Variable Declaration
		var replenItem = request.getParameter('txtItem');

		var currentUserID = getCurrentUser();

		var REArray = new Array();
		REArray['custparam_whlocation'] = request.getParameter('hdnWhLocation');
		REArray['custparam_whlocationname'] = request.getParameter('hdnWhLocationName');
		REArray['custparam_item'] = request.getParameter('txtItem');
		REArray["custparam_bcComponents"] = request.getParameter('hdncompositebarcode');

		var whlocation = request.getParameter('hdnWhLocation');
		var whlocationname = request.getParameter('hdnWhLocationName');

		var optedEvent = request.getParameter('cmdPrevious');

		var optedList = request.getParameter('cmdSearch');

		var str = 'replenItem.' + replenItem + '<br/>';
		str = str + 'currentUserID.' + currentUserID + '<br/>';
		str = str + 'whlocation.' + whlocation + '<br/>';
		str = str + 'whlocationname.' + whlocationname + '<br/>';
		str = str + 'optedEvent.' + optedEvent + '<br/>';
		str = str + 'optedList.' + optedList + '<br/>';

		nlapiLogExecution('ERROR', 'str',str);

		var vreplenminqty = '';
		var vreplenmaxqty = '';
		var vreplenqty = '';
		var vreplenroundqty = '';

		try
		{
			if(optedEvent == 'Back (F7)')
			{	
				REArray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu',
						'customdeploy_wmsse_inventorymenu', false, REArray);
				return;
			}
			else if(optedList == 'List')
			{	//Displays List of items open for replenishment
				REArray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemlistscan',
						'customdeploy_wmsse_replen_itemlistscan', false, REArray);
				return;
			}
			else
			{
				if(replenItem != null && replenItem != '')
				{
					var results = new Array();
					results = getSKUIdWithName(replenItem, whlocation);//Validating entered item

					if(results==null ||  results=='')
					{
						nlapiLogExecution('DEBUG', 'Into Bar Code parsing', REArray["custparam_item"]);

						var results = new Array();

						var barcodecomponents = parsebarcodeoutsidereceiving(REArray["custparam_item"],REArray["custparam_whlocation"]);
						nlapiLogExecution('DEBUG', 'barcodecomponents', barcodecomponents);		
						if(barcodecomponents != null && barcodecomponents !='' && barcodecomponents !='null')
						{
							nlapiLogExecution('DEBUG', 'barcode error', barcodecomponents["error"]);	

							if(barcodecomponents["error"] == "NoBarcodeFormats")
							{
								REArray["custparam_error"] = 'Invalid Item/Invalid Bar Code';
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan', 'customdeploy_wmsse_replen_itemscan', false, REArray);
								return;
							}
							if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
							{
								REArray["custparam_error"] = barcodecomponents["error"];
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan', 'customdeploy_wmsse_replen_itemscan', false, REArray);
								return;
							}

							var vItem =barcodecomponents['Item'];
							var vItemIntrid =barcodecomponents['ItemIntrid'];
							if(!isempty(vItemIntrid))
								results[0] =vItemIntrid;
							if(!isempty(vItem))
								results[1] =vItem;
							var vbarcodeQty = barcodecomponents['Quantity'];
							var vbarcodeUOM = barcodecomponents['UOM']; 
							var vbarcodeLot = '';
							var vbarcodeLotExpirydate ='';
							var vbarcodeSerial ='';

							if(results !=null && results !='' && results !='null' && 
									results !='undefined' && results !=undefined )
							{
								REArray["custparam_bcComponents"] = JSON.stringify(barcodecomponents);
								REArray["custparam_bcqty"]='';
								REArray["custparam_bcuom"]='';
								REArray["custparam_bclot"]='';
								REArray["custparam_bcexpirydate"]='';
								REArray["custparam_bcserial"]='';


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

						nlapiLogExecution('DEBUG', 'Out of Bar Code parsing', REArray["custparam_item"]);
					}


					if(results != null && results != '')
					{
						var itemid = results[0];
						replenItem = results[1];

						var itemresults= openreplenitems(whlocation,itemid,'','');
						//Item results open for replenishment
						nlapiLogExecution('ERROR', 'itemresults', itemresults); 

						if(itemresults != null && itemresults != '' && itemresults != 'null')
						{
							var expQty = 0;
							var actQty = 0;
							var filter = new Array();

							filter.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof', itemid));
							if(whlocation!= null && whlocation!= '' && whlocation != 'null')
							{
								filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null,
										'anyof', whlocation));
							}

							filter.push(new nlobjSearchFilter('custrecord_wmsse_task_assignedto',null,
									'anyof', ['@NONE@',currentUserID]));

							var otResult =nlapiSearchRecord('customrecord_wmsse_trn_opentask',
									'customsearch_wmsse_rpln_opentask_srh',filter, null);
							nlapiLogExecution('ERROR', 'otResult', otResult); 
							if(otResult != null && otResult != '')
							{
								for(var i=0;i<otResult.length;i++)
								{
									var tempExpQty = otResult[i].getValue(
											'custrecord_wmsse_expe_qty',null,'sum');
									var tempActQty = otResult[i].getValue(
											'custrecord_wmsse_act_qty',null,'sum');

									if(tempExpQty == '' || tempExpQty == null || isNaN(tempExpQty))
										tempExpQty = 0;
									if(tempActQty == '' || tempActQty == null || isNaN(tempActQty))
										tempActQty = 0;								

									expQty = Big(expQty).plus(tempExpQty);
									actQty = Big(actQty).plus(tempActQty);

								}
								var itemType = nswms_GetItemType(itemid);

								REArray['custparam_itemid'] = itemid;
								REArray['custparam_item'] = replenItem;

								var remQty = Big(expQty).minus(actQty);
								nlapiLogExecution('ERROR', 'remQty', remQty);

								REArray['custparam_rem_qty'] = Number(remQty);

								REArray['custparam_rec_qty'] = Number(actQty);

								REArray['custparam_itemtype'] = itemType;

								REArray['custparam_uom'] = otResult[0].getValue(
										'custrecord_wmsse_uom',null,'group');

								REArray['custparam_conversionrate'] = otResult[0].getValue(
										'custrecord_wmsse_conversionrate',null,'group');

								REArray['custparam_tobin'] = otResult[0].getText(
										'custrecord_wmsse_actendloc',null,'group');

								REArray['custparam_whlocation'] = otResult[0].getValue(
										'custrecord_wmsse_wms_location',null,'group');

								REArray['custparam_whlocationname'] =otResult[0].getText(
										'custrecord_wmsse_wms_location',null,'group');

								REArray['custparam_itemgroup'] =itemresults[0].getValue(
								'custitem_wmsse_itemgroup');

								REArray['custparam_itemfamily'] =itemresults[0].getValue(
								'custitem_wmsse_itemfamily');

								vreplenminqty =itemresults[0].getValue(
										'custrecord_wmsse_replen_minqty','binnumber');
								vreplenmaxqty =itemresults[0].getValue(
										'custrecord_wmsse_replen_maxqty','binnumber');
								vreplenqty =itemresults[0].getValue(
										'custrecord_wmsse_replen_qty','binnumber');
								vreplenroundqty =itemresults[0].getValue(
										'custrecord_wmsse_replen_roundqty','binnumber');

								if(vreplenminqty==''||vreplenminqty=='null'||vreplenminqty==undefined
										||vreplenminqty==null)
									vreplenminqty=0;
								if(vreplenmaxqty==''||vreplenmaxqty=='null'||vreplenmaxqty==undefined
										||vreplenmaxqty==null)
									vreplenmaxqty=0;
								if(vreplenqty==''||vreplenqty=='null'||vreplenqty==undefined
										||vreplenqty==null)
									vreplenqty=0;
								if(vreplenroundqty==''||vreplenroundqty=='null'||vreplenroundqty==undefined
										||vreplenroundqty==null)
									vreplenroundqty=0;

								REArray['custparam_replenminqty'] = vreplenminqty;
								REArray['custparam_replenmaxqty'] = vreplenmaxqty;
								REArray['custparam_replenqty'] = vreplenqty;
								REArray['custparam_replenroundqty'] = vreplenroundqty;								

								if(parseFloat(remQty)>0)
								{
									REArray["custparam_error"]='';
									REArray['custparam_actualbegintime'] = TimeStamp();
									response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
											'customdeploy_wmsse_replen_binscan', false, REArray);
									return;	
								}
								else if(parseFloat(remQty) == 0)
								{
									REArray["custparam_error"]='Replenishment is completed for this item';
									response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan',
											'customdeploy_wmsse_replen_itemscan', false, REArray);
									return;	
								}
								else
								{
									REArray["custparam_error"]='This record is processing by other user';
									response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan',
											'customdeploy_wmsse_replen_itemscan', false, REArray);
									return;	
								}
							}
							else
							{
								REArray["custparam_error"]='Replenishment is not started for this item';
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan',
										'customdeploy_wmsse_replen_itemscan', false, REArray);
								return;
							}	

						}
						else
						{
							REArray["custparam_error"] = 'Please enter/scan valid item';
							response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan',
									'customdeploy_wmsse_replen_itemscan', false, REArray);
							return;
						}
					}
					else
					{
						REArray["custparam_error"]='Please enter/scan valid item';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan',
								'customdeploy_wmsse_replen_itemscan', false, REArray);
						return;
					}

				}
				else
				{
					REArray["custparam_error"]='Please enter/scan the item';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan',
							'customdeploy_wmsse_replen_itemscan', false, REArray);
					return;
				}
			}
		}
		catch(exp)
		{
			var errMsg = '';
			if (exp instanceof nlobjError) 
			{
				errMsg = 'System error: ' + exp.getCode() + '\n' + exp.getDetails();
				REArray["custparam_error"]=exp.getDetails();
			} 
			else 
			{
				errMsg = 'Unexpected error: ' + exp.toString();
				REArray["custparam_error"]=exp.toString();
			}
			nlapiLogExecution('ERROR', 'Exception inside post method', errMsg); 

			response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan',
					'customdeploy_wmsse_replen_itemscan', false, REArray);
			return;
		}
	}
}


/**
 * This function is to generate items based on given critiria
 * 
 */
function openreplenitems(WHLoc,VItem,itemfamily,itemgroup)
{
	var str = 'VItem.' + VItem + '<br/>';
	str = str + 'itemfamily.' + itemfamily + '<br/>';
	str = str + 'WHLoc.' + WHLoc + '<br/>';
	str = str + 'itemgroup.' + itemgroup + '<br/>';

	nlapiLogExecution('ERROR', 'str',str);

	var itemfilters=new Array();

	if(VItem != null && VItem !='' && VItem != null)
	{
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',VItem));
	}

	if(itemfamily != null && itemfamily !='' && itemfamily != null)
	{
		itemfilters.push(new nlobjSearchFilter('custitem_wmsse_itemfamily',null,'anyof',itemfamily));
	}

	if(itemgroup != null && itemgroup !='' && itemgroup != null)
	{
		itemfilters.push(new nlobjSearchFilter('custitem_wmsse_itemgroup',null,'anyof',itemgroup));
	}

	if(WHLoc != null && WHLoc !='' && WHLoc != 'null')
	{
		itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',WHLoc]));
		itemfilters.push(new nlobjSearchFilter('location','binnumber','anyof',WHLoc));
	}


	var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_rpln_item_srh', itemfilters, null);
	nlapiLogExecution('ERROR', 'itemresults',itemresults);

	return itemresults;
}