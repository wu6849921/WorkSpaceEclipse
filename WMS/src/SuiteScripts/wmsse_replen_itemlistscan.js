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
function CheckInItemList(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		//Variable Declaration
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var getOptedField = request.getParameter('custparam_option');
		var userAccountId = ctx.getCompany();
		var whLocation=request.getParameter('custparam_whlocation');
		var whLocationName=request.getParameter('custparam_whlocationname');
		var st0,st1,st2,st3;
		var headerVar='Replenishment Item';

		var currentUserID = getCurrentUser();

		var actualBeginTime=TimeStamp();

		var itemCount = 0;
		var getPageCount=request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize=5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);

		var str = 'getLanguage.' + getLanguage + '<br/>';
		str = str + 'getOptedField.' + getOptedField + '<br/>';
		str = str + 'userAccountId.' + userAccountId + '<br/>';
		str = str + 'whLocation.' + whLocation + '<br/>';
		str = str + 'whLocationName.' + whLocationName + '<br/>';
		str = str + 'currentUserID.' + currentUserID + '<br>';
		str = str + 'totalPageSizeValue.' + totalPageSizeValue + '<br/>';

		nlapiLogExecution('ERROR', 'str',str);

		if( getLanguage == 'es_ES')
		{

			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{

			st1 = "Enter/Scan Item:";
			st2 = "SEND";
			st3 = "PREV";

		}	
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+headerVar;
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
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
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var error="Please enter/scan Item";
		//Ends here

		//The below changes are done by Satish.N on 14JUN2017 - 201421224
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
		//Upto here - 201421224

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

		html = html +"	<script type='text/javascript'>function validateForm() {" +
		"if(document.getElementById('enteritem').value == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan item';	return false;}" +
		"else{document.getElementById('loading').style.display = ''; return true;}}</script>"+

		"	<script type='text/javascript'>function validateItem(vLineItemId,item) {" +
		"var str1='span';var str2=item; var itemId=str1.concat(str2);" +
		"var itemval = document.getElementById(itemId).innerHTML.toString();" +
		"document.getElementById('enteritem').value=itemval;document.forms['_rf_checkin_item'].submit();"+
		"document.getElementById('loading').style.display = ''; return true;}</script>";

		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'> "+headerVar+"</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+
		errMsg+"</div>" +
		"		</td></tr></table>"+
		"		<table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName +
		"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enteritem' class='smalltextbox' id='enteritem'"+
		" type='text'/>"+
		"				</td>"+

		"			</tr><tr><td></td></table>"+
		"			<table><tr>"+
		"				<td><input name='cmdSend1' class='defaultlink'    type='submit' value='' " +
		"				onclick='return validateForm();'/></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' " +
		"onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"		 </table>";

		var Recinternalids = getReplenItemsList(whLocation,'','',currentUserID);//To retrive item details
		nlapiLogExecution('Debug', 'Recinternalids', Recinternalids);
		if(Recinternalids!=null && Recinternalids!='' && Recinternalids.length != null)
		{
			nlapiLogExecution('Debug', 'Recinternalids.length', Recinternalids.length);
			if(Recinternalids.length>0)
			{
				html = html + "	<table>"+
				" <tr>"+
				" <td>"+
				"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
				" <tr class='uir-machine-headerrow' >"+
				" <td>Item"+
				" </td>"+		
				" <td class='align-right'>Rem Qty"+
				" </td>"+	
				" <td>To Bin"+
				" </td>"+	
				"</tr>";

				for (var s = getPageCount; s < Recinternalids.length; s++) {
					itemCount=parseInt(itemCount)+1;
					nlapiLogExecution('ERROR', 'itemCount', itemCount);

					if(s%2==1)
						vAltClass='uir-list-row-tr line uir-list-row-even';
					else
						vAltClass='uir-list-row-tr line uir-list-row-odd';

					var expQty = Recinternalids[s].getValue('custrecord_wmsse_expe_qty',null,'sum');
					var actQty = Recinternalids[s].getValue('custrecord_wmsse_act_qty',null,'sum');
					var toBin = Recinternalids[s].getValue('custrecord_wmsse_actendloc',null,'group');

					var itemid = Recinternalids[s].getValue('custrecord_wmsse_sku',null,'group');
					var item = Recinternalids[s].getText('custrecord_wmsse_sku',null,'group');
					var vUnits = Recinternalids[s].getValue('custrecord_wmsse_uom',null,'group');
					var conversionrate = Recinternalids[s].getValue(
							'custrecord_wmsse_conversionrate',null,'group');
					var toBinText = Recinternalids[s].getText('custrecord_wmsse_actendloc',null,'group');
					whLocation = Recinternalids[s].getValue('custrecord_wmsse_wms_location',null,'group');
					whLocationName =Recinternalids[s].getText(
							'custrecord_wmsse_wms_location',null,'group');

					if(expQty == '' || expQty == null)
						expQty = 0;
					if(actQty == '' || actQty == null)
						actQty = 0;

					var remQty = Big(expQty).minus(actQty);

					var itemType = nswms_GetItemType(itemid);

					var str = 'expQty.' + expQty + '<br/>';
					str = str + 'actQty.' + actQty + '<br/>';
					str = str + 'toBin.' + toBin + '<br/>';
					str = str + 'toBinText.' + toBinText + '<br/>';
					str = str + 'itemid.' + itemid + '<br/>';
					str = str + 'item.' + item + '<br/>';
					str = str + 'remQty.' + remQty + '<br/>';
					str = str + 'vUnits.' + vUnits + '<br/>';
					str = str + 'conversionrate.' + conversionrate + '<br/>';
					str = str + 'itemType.' + itemType + '<br/>';

					nlapiLogExecution('ERROR', 'str',str);

					var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_replen_binscan',
					'customdeploy_wmsse_replen_binscan');

					var linkURL_1="#";
					if((parseFloat(remQty) > 0) && parseFloat(expQty) > 0)
					{
						nlapiLogExecution('ERROR', 'itemName', item);
						linkURL_1 = checkInURL_1 + '&custparam_itemid=' + itemid +'&custparam_item=' +
						item + '&custparam_rem_qty=' + remQty + '&custparam_rec_qty=' + actQty +
						'&custparam_whlocation=' + whLocation  + '&custparam_whlocationname =' +
						whLocationName  +  '&custparam_itemtype=' + itemType+ '&custparam_uom='+ 
						vUnits+'&custparam_conversionrate='+ conversionrate + '&custparam_tobin='+ 
						toBin ;
					}
					html = html + "	<tr class='" + vAltClass + "'>";
					if(linkURL_1 == '#')
						html = html + " <td>"+item+"</td>";
					else
						html = html + " <td ><a id='span"+s+"' name='link1URL_1' href='#' " +
						"onclick='return validateItem(\""+itemid+"\",\""+s+"\");'>"+item+"</a></td>";

					if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' 
						&& vUnits !='- None -')
					{
						html = html + " <td class='align-right'> "+parseFloat(parseFloat(remQty).toFixed(8))+" "+vUnits+"</td>";
						html = html +" <td> "+toBinText+"</td>";
					}
					else
					{
						html = html + " <td class='align-right'> "+parseFloat(parseFloat(remQty).toFixed(8))+"</td>";
						html = html +" <td> "+toBinText+"</td>";
					}
					html = html +"</tr>";

					if(parseInt(itemCount)>=5)
						break;
				}

				html = html + "	</table>"+
				"				<input type='hidden' name='hdngetPageCount' value=" + getPageCount + ">"+
				" </td>"+
				"</tr>"+
				"</table>";

			}

			html = html +"		<table>	<tr>";

			if(getPageCount>0)
			{
				html = html +"				<td align = 'left'><input name='cmdPrevList' type='submit'" +
				" value='Prev'/></td>";
			}
			else
			{
				html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
			}
			html = html +"				<td width='20px'></td>";
			if(Recinternalids.length > (parseInt(getPageCount)+5))
				//if(parseInt(itemCount)>1)
			{
				html = html +"				<td align = 'right'><input name='cmdNextList' type='submit'" +
				" value='Next'/></td>";
			}
			html = html +"			</tr>"+ 
			"		 </table>";
		}
		else
		{
			var REArray = new Array();
			REArray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
			REArray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');			
			REArray["custparam_error"] = 'No records to show.';			
			response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan',
					'customdeploy_wmsse_replen_itemscan', false, REArray);
			return;			
		}
		html = html + "</form>"+

		"<script type='text/javascript'>document.getElementById('enteritem').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);

	}
	else
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating SKU/ITEM');
		//Variable Declaration
		var replenItem = request.getParameter('enteritem');
		nlapiLogExecution('ERROR', 'replenItem', replenItem);

		var currentUserID = getCurrentUser();
		nlapiLogExecution('ERROR', 'currentUserID', currentUserID);

		var REArray = new Array();
		REArray['custparam_whlocation'] = request.getParameter('hdnWhLocation');
		REArray['custparam_whlocationname'] = request.getParameter('hdnWhLocationName');
		REArray['custparam_item'] = request.getParameter('enteritem');

		var vreplenminqty = '';
		var vreplenmaxqty = '';
		var vreplenqty = '';
		var vreplenroundqty = '';

		var whlocation = request.getParameter('hdnWhLocation');
		var whlocationname = request.getParameter('hdnWhLocationName');
		nlapiLogExecution('ERROR', 'whlocation', whlocation);
		nlapiLogExecution('ERROR', 'whlocationname', whlocationname);

		var optedEvent = request.getParameter('cmdPrevious');
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);

		try
		{
			if(optedEvent == 'Back (F7)')
			{
				REArray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu',
						'customdeploy_wmsse_inventorymenu', false, REArray);
				return;
			}
			else
			{
				nlapiLogExecution('DEBUG','request.getParameter("cmdNextList")',
						request.getParameter('cmdNextList'));
				nlapiLogExecution('DEBUG','request.getParameter("cmdPrevList")',
						request.getParameter('cmdPrevList'));
				if(request.getParameter('cmdNextList')=="Next")
				{
					REArray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+5;
					REArray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemlistscan',
							'customdeploy_wmsse_replen_itemlistscan', false, REArray);
					return;
				}
				if(request.getParameter('cmdPrevList')=="Prev")
				{
					REArray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-5;
					REArray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemlistscan',
							'customdeploy_wmsse_replen_itemlistscan', false, REArray);
					return;
				}

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
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemlistscan', 'customdeploy_wmsse_replen_itemlistscan', false, REArray);
								return;
							}
							if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
							{
								REArray["custparam_error"] = barcodecomponents["error"];
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemlistscan', 'customdeploy_wmsse_replen_itemlistscan', false, REArray);
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
								/*var currItemType = nswms_GetItemType(results[0], REArray["custparam_whlocation"]);
								if(currItemType == "lotnumberedinventoryitem" || currItemType=="lotnumberedassemblyitem")
								{
									vbarcodeLot = barcodecomponents['Lot'];
									vbarcodeLotExpirydate = barcodecomponents['ExpiryDt'];

									if(!isempty(vbarcodeLot))
									{
										REArray["custparam_bclot"] = vbarcodeLot;
									}

									if(!isempty(vbarcodeLotExpirydate))										
										REArray["custparam_bcexpirydate"] = vbarcodeLotExpirydate;
								}
								if(currItemType == "serializedinventoryitem" || currItemType=="serializedassemblyitem")
								{
									vbarcodeSerial = barcodecomponents['Serial Number'];
									if(!isempty(vbarcodeSerial))
									{	
										if((!isempty(vbarcodeQty)) && (vbarcodeQty == 1|| vbarcodeQty =='1'))
										{
											REArray["custparam_bcserial"]=vbarcodeSerial;
										}
										else
										{
											REArray["custparam_error"] = 'Provide Quantity as 1 for Serialized Item';
											response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemlistscan', 'customdeploy_wmsse_replen_itemlistscan', false, REArray);
											nlapiLogExecution('DEBUG', 'barcode_serial', 'qty is greater than 1 for serial#');
											return;
										}

									}

								}

								if(!isempty(vbarcodeQty))
									REArray["custparam_bcqty"]=vbarcodeQty;
								if(!isempty(vbarcodeUOM))
									REArray["custparam_bcuom"]=vbarcodeUOM;*/

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

						var itemresults= openreplenitems(whlocation,itemid,'','')
						nlapiLogExecution('ERROR', 'itemresults', itemresults); 

						if(itemresults != null && itemresults != '' && itemresults != 'null')
						{
							var expQty = 0;
							var actQty = 0;
							var filter = new Array();

							filter.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof', itemid));
							if(whlocation!= null && whlocation!= '' && whlocation != 'null')
							{
								filter.push(new nlobjSearchFilter(
										'custrecord_wmsse_wms_location',null, 'anyof', whlocation));
							}

							filter.push(new nlobjSearchFilter('custrecord_wmsse_task_assignedto',null,
									'anyof',['@NONE@',currentUserID]));	

							var otResult =nlapiSearchRecord('customrecord_wmsse_trn_opentask',
									'customsearch_wmsse_rpln_opentask_srh',filter, null);
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
								nlapiLogExecution('ERROR', 'itemType', itemType);

								REArray['custparam_itemid'] = itemid;
								REArray['custparam_item'] = replenItem;

								var remQty = Big(expQty).minus(actQty);
								nlapiLogExecution('DEBUG', 'remQty', remQty);
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

								REArray['custparam_itemgroup'] =itemresults[0].getValue(
								'custitem_wmsse_itemgroup');

								REArray['custparam_itemfamily'] =itemresults[0].getValue(
								'custitem_wmsse_itemfamily');

								nlapiLogExecution('ERROR', "REArray['custparam_tobin']",
										REArray['custparam_tobin']);

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
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemlistscan',
										'customdeploy_wmsse_replen_itemlistscan', false, REArray);
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
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemlistscan',
								'customdeploy_wmsse_replen_itemlistscan', false, REArray);
						return;
					}

				}
				else
				{
					REArray["custparam_error"]='Please enter/scan the item';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemlistscan',
							'customdeploy_wmsse_replen_itemlistscan', false, REArray);
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

			response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemlistscan',
					'customdeploy_wmsse_replen_itemlistscan', false, REArray);
			return;
		}
	}
}

/**
 * This function is to generate items that are valid for Replenishment
 * 
 */
function getReplenItemsList(whLocation,itemid,toBin,currentUserID)
{
	var str = 'whLocation.' + whLocation + '<br/>';
	str = str + 'itemid.' + itemid + '<br/>';
	str = str + 'toBin.' + toBin + '<br/>';
	str = str + 'currentUserID.' + currentUserID + '<br/>';

	nlapiLogExecution('ERROR', 'str',str);

	var filter = new Array();

	if(whLocation!= null && whLocation!= '' && whLocation != 'null')
	{
		filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null, 'anyof', whLocation));
	}
	if(itemid!= null && itemid!= '' && itemid != 'null')
	{
		filter.push(new nlobjSearchFilter('custrecord_wmsse_sku',null, 'anyof', itemid));
	}
	if(toBin!= null && toBin!= '' && toBin != 'null')
	{
		filter.push(new nlobjSearchFilter('custrecord_wmsse_actendloc',null, 'anyof', toBin));
	}

	filter.push(new nlobjSearchFilter('custrecord_wmsse_task_assignedto',null,
			'anyof', ['@NONE@',currentUserID]));	

	var otResult =nlapiSearchRecord('customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_rpln_opentask_srh',filter, null);
	return otResult;
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