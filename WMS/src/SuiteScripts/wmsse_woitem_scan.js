/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function PickingSKU(request, response){
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';


		var getWONo = request.getParameter('custparam_woid');


		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');

		var whCompany= request.getParameter('custparam_company');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		var domainName = fndomainName();

		var st0 = domainName + '-Picking Work Order';

		var getPageCount = request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize = 5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);

		var itemCount=0;
		var qtyCount=0;

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
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();

		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		var ordVar = "Work Order#";


		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getWONo. = ' + getWONo + '<br>';
		logmsg = logmsg + 'CSSfilefound. = ' + CSSfilefound + '<br>';	
		logmsg = logmsg + 'domainName. = ' + domainName + '<br>';		
		logmsg = logmsg + 'totalPageSizeValue. = ' + totalPageSizeValue + '<br>';
		logmsg = logmsg + 'CSSurl. = ' + CSSurl + '<br>';	
		logmsg = logmsg + 'imgUrl. = ' + imgUrl + '<br>';	
		nlapiLogExecution('DEBUG', 'Values :', logmsg);

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan', 'customdeploy_wmsse_onbarcodescan');

		getActualBeginTime = TimeStamp(); // We are taking timestamp here because we need to populate each line time differently in open task

		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_item');
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('txtItem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item';return false;}else{document.getElementById('loading').style.display = ''; return true;}}</script>";
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

		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_picking_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+				
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Work Order Picking</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getWONo + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' id='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
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
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";

		var arrWodetails = getWOLineDetailsInGet(getWONo);
		var woDetails =getWODetails(getWONo);
		var vColumnslist='';
		var shipQtyIndex =16;

		var skuArray = new Array();
		var pickqtyArray = new Array();

		if(arrWodetails!=null && arrWodetails!='')
		{
			if(arrWodetails.length>0)
			{
				var assemblItem = woDetails[0].getText('item');
				var assemblyitemQty = woDetails[0].getValue('quantity');
				var built=woDetails[0].getValue('quantityshiprecv');
				if(built == '' || built == 'null' || built == null || built == undefined)
				{
					built = 0;
				}
				if(assemblyitemQty == '' || assemblyitemQty == 'null' || assemblyitemQty == null || assemblyitemQty == undefined)
				{
					assemblyitemQty = 0;
				}
				var remainQty = Number(Big(assemblyitemQty).minus(built));
				html = html + "	<table  style='background-color:#DFE4EA !important;border: 0 !important;border-bottom: 0 !important;border-spacing: 0;'>"+
				" <tr class='listheader'>"+				
				"<td colspan='3' ><b>Assembly Item:</b> <span style='width:2px;' > "+assemblItem+"</span>"+
				" </td>"+									
				"</tr>"+
				" <tr class='uir-list-row-tr line uir-list-row-odd'>"+			
				"<td colspan='3'><span ><b>Qty:</b> "+assemblyitemQty+"</span> &nbsp;&nbsp;<b>Built:</b> "+built+"<b>&nbsp;&nbsp; Buildable:</b> "+remainQty+""+
				" </td>"+	
				"</tr><tr><td colspan='3' style='height:5px;background-color:white;'></td></tr><tr class='uir-machine-headerrow'  >"+

				"<td><span class='listheader'>Item</span>"+
				" </td>"+		
				" <td class='align-right'>Picked"+
				" </td>"+	
				" <td class='align-right'>Remaining"+
				" </td>"+	
				"</tr>";

				var	checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan');


				var woInternalId=arrWodetails[0].getValue('internalid');
				var vWhHeadLoc='';
				if(woInternalId != null && woInternalId != '')
				{
					if(trantype!="transferorder")
						vWhHeadLoc= nlapiLookupField(trantype, woInternalId, 'location');
					else
						vWhHeadLoc= nlapiLookupField(trantype, woInternalId, 'transferlocation');
				}
				var vColumnslist='';
				var totalpickQtyIndex =7;
				var comittedQtyIndex =15;
				var builtQtyIndex =16;
				var unitsIndex =14;
				var coversionRateIndex =17;
				var itemIdArr = new Array();
				var lineNumArr = new Array();
				if(arrWodetails !=null && arrWodetails !='' && arrWodetails.length > 0)
				{
					vColumnslist=arrWodetails[0].getAllColumns();

					for(var x1=0;x1<vColumnslist.length;x1++)
					{
						var summaryLabel = vColumnslist[x1].getLabel();
						var name = vColumnslist[x1].getName();

						if(name == 'unit')
						{
							unitsIndex =x1;
						}
						else if(summaryLabel == 'Committed Quantity')
						{
							comittedQtyIndex = x1;
						}
						else if(summaryLabel == 'Built Quantity')
						{
							builtQtyIndex = x1;
						}
						else if(summaryLabel == 'Conversion Rate')
						{
							coversionRateIndex = x1;
						}
						else
						{

						}
					}
					for (var t = getPageCount; t < arrWodetails.length; t++) 
					{
						qtyCount=parseInt(qtyCount)+1;
						itemIdArr.push(arrWodetails[t].getValue('item'));
						lineNumArr.push(arrWodetails[t].getValue('line'));

						if(parseInt(qtyCount)>=5)
							break;

					}
					var woPickQtyResults = getOpentaskPickQtyDetails(woInternalId,itemIdArr,lineNumArr);

					for (var s = getPageCount; s < arrWodetails.length; s++) {
						itemCount=parseInt(itemCount)+1;

						if(s%2==1)
							vAltClass='uir-list-row-tr line uir-list-row-even';
						else
							vAltClass='uir-list-row-tr line uir-list-row-odd';
						var usedBins='';
						var vLineLocation='';						
						var vUnits="";
						var vConversionRate="";
						var vnitemType = arrWodetails[s].getValue('type','item');
						var vwoitem = arrWodetails[s].getText('item');
						var vwoitemId = arrWodetails[s].getValue('item');
						var vwoitemLine = arrWodetails[s].getValue('line');
						var pickqty = 0;

						if(woPickQtyResults != null && woPickQtyResults != '')
						{

							for(var d=0;d<woPickQtyResults.length;d++)
							{
								var openItemId = woPickQtyResults[d].getValue('custrecord_wmsse_sku',null,'group');
								var openLineNum = woPickQtyResults[d].getValue('custrecord_wmsse_line_no',null,'group');
								if((openItemId == vwoitemId) && (openLineNum == vwoitemLine))
								{

									pickqty = woPickQtyResults[d].getValue('custrecord_wmsse_act_qty',null,'sum');
									break;
								}
							}
						}

						var vwoitemQty=arrWodetails[s].getValue(vColumnslist[comittedQtyIndex]);
						var vwoitemRcvQty = arrWodetails[s].getValue(vColumnslist[builtQtyIndex]);
						vUnits = arrWodetails[s].getValue(vColumnslist[unitsIndex]);
						vConversionRate = arrWodetails[s].getValue(vColumnslist[coversionRateIndex]);
						if(vnitemType == "NonInvtPart" || vnitemType=="OthCharge" || vnitemType=="Service" || vnitemType=="DwnLdItem" || vnitemType=="GiftCert")
						{
							vwoitemQty=arrWodetails[s].getValue('quantity');
						}

						//Case # 201414607  start
						if(pickqty==null || pickqty=='' || pickqty == 'undefined' || pickqty == 'null')
							pickqty=0;

						if(vwoitemRcvQty==null || vwoitemRcvQty=='' || vwoitemRcvQty == 'undefined' || vwoitemRcvQty == 'null')
							vwoitemRcvQty=0;

						if(vwoitemQty==null || vwoitemQty=='' || vwoitemQty == 'undefined' || vwoitemQty == 'null')
							vwoitemQty=0;
						//Case # 201414607  end

						if(vnitemType == "NonInvtPart" || vnitemType=="OthCharge" || vnitemType=="Service" || vnitemType=="DwnLdItem" || vnitemType=="GiftCert")
						{
							pickqty = Number(Big(pickqty).plus(vwoitemRcvQty));
							var vWoreminqty = Number(Big(vwoitemQty).minus(pickqty));
						}
						else
						{

							//vwoitemQty=new Big(vwoitemQty);
							vwoitemRcvQty=new Big(vwoitemRcvQty);
							pickqty=new Big(pickqty);

							var vWoreminqty = Number((Big(vwoitemQty).plus(vwoitemRcvQty)) .minus(pickqty));
						}

						if(trantype=="returnauthorization")
						{
							if(vWoreminqty<0)
								vWoreminqty=vWoreminqty*(-1);
						}
						vLineLocation=arrWodetails[s].getValue('location');

						if(vLineLocation == null || vLineLocation == '')
							vLineLocation=vWhHeadLoc;

						nlapiLogExecution('ERROR', 'request.getParameter(hdnActualBeginTime)', request.getParameter('hdnActualBeginTime'));
						var linkURL_1 = '#';
						if(vWoreminqty>0){
							linkURL_1 = checkInURL_1 + '&custparam_lineno=' + vwoitemLine + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_fetcheditemid=' + vwoitemId + '&custparam_wointernalid=' + woInternalId + '&custparam_rem_qty=' + vWoreminqty + '&custparam_rec_qty=' + pickqty + '&custparam_whlocation=' + vLineLocation  + '&custparam_woid=' + getWONo  + '&custparam_trantype=' + trantype + '&custparam_company=' + whCompany+'&custparam_uom='+ vUnits+'&custparam_conversionrate='+ vConversionRate +'&custparam_actualbegintime='+ getActualBeginTime;
						}
						html = html + "	<tr class='" + vAltClass + "'>";
						if(linkURL_1 == '#')
							html = html + " <td>"+vwoitem+"</td>";
						else
							html = html +" <td><a class='dottedlink' href='" + linkURL_1 + "'> "+vwoitem+"</a></td>";
						if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
						{
							html = html +" <td class='align-right'> "+parseFloat(parseFloat(pickqty).toFixed(8))+" "+vUnits+"</td>";
							html = html +" <td class='align-right'> "+parseFloat(parseFloat(vWoreminqty).toFixed(8))+" "+vUnits+"</td>";
						}
						else
						{
							html = html +" <td class='align-right'> "+parseFloat(parseFloat(pickqty).toFixed(8))+"</td>";
							html = html +" <td class='align-right'> "+parseFloat(parseFloat(vWoreminqty).toFixed(8))+"</td>";
						}
						html = html +"</tr>";

						if(parseInt(itemCount)>=5)
							break;
					}
				}
				html = html + "	</table>" +		
				"				<input type='hidden' name='hdngetPageCount' value=" + getPageCount + ">"+
				" </td>"+
				"</tr>"+
				"</table>";
			}
		}

		html = html +"		<table>	<tr>";
		/*nlapiLogExecution('ERROR', 'orderCount',orderCount);*/
		if(getPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"				<td width='20px'></td>";
		if(arrWodetails.length > (parseInt(getPageCount)+5))
			//if(parseInt(itemCount)>1)
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>";
		html = html + "</form>"+

		"<script type='text/javascript'>document.getElementById('txtItem').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('Debug', 'Processing RF', 'Validating SKU/ITEM');

		// Forming the temporary array WOarray
		var WOarray = new Array();
		var tempflag='F';
		WOarray["custparam_woid"] = request.getParameter('custparam_woid');
		//WOarray["custparam_woitem"] = request.getParameter('txtItem');
		var woItem = request.getParameter('txtItem');
		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		WOarray["custparam_option"] = request.getParameter('hdnOptedField');
		WOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		WOarray["custparam_bcComponents"] = request.getParameter('hdncompositebarcode');
		var trantype=request.getParameter('hdntrantype');

		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button

		var logMsg = 'WO = ' + WOarray["custparam_woid"] + '<br>';
		logMsg = logMsg + 'Item = ' + woItem + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - SKU', logMsg);

		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){

			if(request.getParameter('cmdNextList')=="Next")
			{
				WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+5;
				WOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
				return;
			}
			if(request.getParameter('cmdPrevList')=="Prev")
			{
				WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-5;
				WOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
				return;
			}

			if (woItem != "") {

				var filters = new Array();	
				var woid;
				filters.push(new nlobjSearchFilter('tranid', null, 'is', WOarray["custparam_woid"]));	

				var wosearch = nlapiSearchRecord('workorder', 'customsearch_wmsse_woscan_validation_srh', filters, null);
				if(wosearch!=null && wosearch!='')
				{
					woid = wosearch[0].getId();


					//var currItem = validateSKU(WOarray["custparam_woitem"], WOarray["custparam_whlocation"], WOarray["custparam_company"],woid);
					var currItem = getSKUIdWithName(woItem, WOarray["custparam_whlocation"], WOarray["custparam_company"],woid);
					if(currItem==null ||  currItem=='')
					{
						nlapiLogExecution('DEBUG', 'Into Bar Code parsing', woItem);

						var currItem = new Array();

						var barcodecomponents = parsebarcodeoutsidereceiving(woItem,WOarray["custparam_whlocation"]);
						nlapiLogExecution('DEBUG', 'barcodecomponents', barcodecomponents);		
						if(barcodecomponents != null && barcodecomponents !='' && barcodecomponents !='null')
						{
							nlapiLogExecution('DEBUG', 'barcode error', barcodecomponents["error"]);	

							if(barcodecomponents["error"] == "NoBarcodeFormats")
							{
								WOarray["custparam_error"] = 'Invalid Item/Invalid Bar Code';
								response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
								return;
							}
							if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
							{
								WOarray["custparam_error"] = barcodecomponents["error"];
								response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
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
								//WMSLITE-3232 - Composite Bar code Custom list mapping

								WOarray["custparam_bcComponents"] = JSON.stringify(barcodecomponents);						
								WOarray["custparam_bcuom"]='';
								WOarray["custparam_bcqty"]='';
								WOarray["custparam_bcserial"]='';
								WOarray["custparam_bcexpirydate"]='';
								WOarray["custparam_bclot"]='';

								// Upto here WMSLITE-3232 - Composite Bar code Custom list mapping


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

						nlapiLogExecution('DEBUG', 'Out of Bar Code parsing', woItem);
					}
					if(currItem!=null && currItem!='')
					{

						var vIntId=currItem[0];

						if(vIntId != null && vIntId != '')
						{

							var vnitemType = nswms_GetItemType(vIntId,WOarray["custparam_whlocation"]);

							var woLineDetails =
								getWOLineDetailsNew(WOarray["custparam_woid"], trantype,vIntId,request.getParameter('hdnWhLocation'));


							var vBoolFount=false;
							var itemPickedFlag = 'F';
							var vColumnslist='';
							var totalpickQtyIndex =7;
							var comittedQtyIndex =15;
							var builtQtyIndex =16;
							var unitsIndex =14;
							var coversionRateIndex =17;
							if(woLineDetails !=null && woLineDetails!='' && woLineDetails.length > 0)
							{	
								vColumnslist=woLineDetails[0].getAllColumns();

								for(var x1=0;x1<vColumnslist.length;x1++)
								{
									var summaryLabel = vColumnslist[x1].getLabel();
									var name = vColumnslist[x1].getName();
									/*	if(summaryLabel == 'Total Picked Quantity')
									{
										totalpickQtyIndex = x1;
									}*/
									if(name == 'unit')
									{
										unitsIndex =x1;
									}
									else if(summaryLabel == 'Committed Quantity')
									{
										comittedQtyIndex = x1;
									}
									else if(summaryLabel == 'Built Quantity')
									{
										builtQtyIndex = x1;
									}
									else if(summaryLabel == 'Conversion Rate')
									{
										coversionRateIndex = x1;
									}
									else
									{

									}
								}
								for(var j=0; j<woLineDetails.length; j++)
								{
									var wolineno=woLineDetails[j].getValue('line');
									//var vnitemType = woLineDetails[j].getValue('type','item','group');
									var vwoitemQty=woLineDetails[j].getValue(vColumnslist[comittedQtyIndex]);
									var vwoitemRcvQty = woLineDetails[j].getValue(vColumnslist[builtQtyIndex]);
									if(vnitemType == "NonInvtPart" || vnitemType=="OthCharge" || vnitemType=="Service" || vnitemType=="DwnLdItem" || vnitemType=="GiftCert" || vnitemType=="noninventoryitem")
									{
										vwoitemQty=woLineDetails[j].getValue('quantity');
									}
									if(vwoitemQty == null || vwoitemQty == '')
										vwoitemQty=0;
									if(vwoitemRcvQty==null || vwoitemRcvQty=='')
										vwoitemRcvQty=0;

									if(vnitemType == "NonInvtPart" || vnitemType=="OthCharge" || vnitemType=="Service" || vnitemType=="DwnLdItem" || vnitemType=="GiftCert" || vnitemType=="noninventoryitem")
									{
										var vWoreminqty = parseFloat(vwoitemQty);
									}
									else
									{
										var vWoreminqty = Number(Big(vwoitemQty).plus(vwoitemRcvQty));
									}

									if(vWoreminqty>0)
									{
										var opentaskDetails=getopentaskDetailsforSku(woid,wolineno,vIntId);

										var opentaskQty = opentaskDetails[0].getValue('custrecord_wmsse_act_qty',null,'sum');

										if(opentaskQty==null || opentaskQty=='' || opentaskQty =='null' || opentaskQty =='undefined')
										{
											opentaskQty = 0;
										}

										vWoreminqty = Number(Big(vWoreminqty).minus(opentaskQty));
										if(vWoreminqty > 0)
										{
											itemPickedFlag = 'T';
											if(woLineDetails != null && woLineDetails.length > 0){
												tempflag='T';
												var woInternalId = woLineDetails[j].getValue('internalid');


												WOarray["custparam_lineno"] = woLineDetails[j].getValue('line');
												WOarray["custparam_fetcheditemid"] = vIntId;
												WOarray["custparam_wointernalid"] = woInternalId;
												WOarray["custparam_fetcheditemname"] = currItem[1];
												//WOarray["custparam_woitem"] = currItem[1];
												WOarray["custparam_rem_qty"] = vWoreminqty;
												WOarray["custparam_rec_qty"] = opentaskQty;
												WOarray["custparam_whlocation"] = woLineDetails[j].getValue('location');
												WOarray["custparam_ordertype"] = woLineDetails[j].getValue('custbody_wmsse_ordertype');
												//code modified on 06 Apr
												//If Po LineLevel Location(site) is null then choose the location(site) from header value.
												var soLineLevelLoc=woLineDetails[j].getValue('location');
												if(soLineLevelLoc!=null && soLineLevelLoc!="")
													WOarray["custparam_whlocation"] = woLineDetails[j].getValue('location');
												else
												{
													WOarray["custparam_whlocation"]= nlapiLookupField(trantype, woInternalId, 'location');
												}
												//end of code as of 06 Apr.

												var vUnits = woLineDetails[j].getValue(vColumnslist[unitsIndex]);
												var vConversionRate = woLineDetails[j].getValue(vColumnslist[coversionRateIndex]);
												WOarray["custparam_uom"] = vUnits;
												WOarray["custparam_conversionrate"] = vConversionRate;

												logMsg = 'WO = ' + woInternalId + '<br>';
												logMsg = logMsg + 'Line = ' + WOarray["custparam_lineno"] + '<br>';
												logMsg = logMsg + 'Fetched Item = ' + WOarray["custparam_fetcheditemid"] + '<br>';
												logMsg = logMsg + 'Location = ' + WOarray["custparam_whlocation"] + '<br>';
												logMsg = logMsg + 'Item Cube = ' + WOarray["custparam_itemcube"];
												logMsg = logMsg + 'vUnits = ' + WOarray["custparam_uom"] + '<br>';
												logMsg = logMsg + 'vConversionRate' + WOarray["custparam_conversionrate"] + '<br>';
												nlapiLogExecution('Debug', 'Line Details', logMsg);

												if(woItem != ""){
													var currentUser=getCurrentUser();
													var lockfilters=new Array();
													lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
													lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',woid));
													lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',wolineno));
													lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));

													var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

													if(lockresults!=null && lockresults!='')
													{
														var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
														var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');

														if(getLockUser!=currentUser)
														{
															WOarray["custparam_error"]='The line item is being processed by other user.';
															response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
															return;
														}
														else if(parseInt(getLockLine)!=parseInt(wolineno))
														{
															var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
															LockRecord.setFieldValue('name',woid);
															LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
															LockRecord.setFieldValue('custrecord_wmsse_order',woid);
															LockRecord.setFieldValue('custrecord_wmsse_line',wolineno);
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
														LockRecord.setFieldValue('name',woid);
														LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
														LockRecord.setFieldValue('custrecord_wmsse_order',woid);
														LockRecord.setFieldValue('custrecord_wmsse_line',wolineno);
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
													WOarray["custparam_error"]='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
													return;
												} else {
													WOarray["custparam_error"]='Item not specified';
													response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
													return;
												}
											}
										}
									}

								}
								if(itemPickedFlag == 'F')
								{
									WOarray["custparam_error"]='Item picked';
									response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
									nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
									return;
								} 
							}
							if(tempflag=='F')
							{
								WOarray["custparam_error"]='Please enter/scan valid item';
								response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
								nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
								return;
							}

						}
					}
					else
					{
						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('nameinternal',null,'is',woItem));
						if(WOarray["custparam_whlocation"] != null && WOarray["custparam_whlocation"] !='' && WOarray["custparam_whlocation"] != null)
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',WOarray["custparam_whlocation"]]));
						}
						var itemcolumns= new Array();
						itemcolumns.push(new nlobjSearchColumn('isinactive'));
						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_validitem_name_srh', itemfilters, itemcolumns);

						if(itemresults!=null && itemresults!='')
						{
							if(itemresults[0].getValue('isinactive')=="T")
							{
								WOarray["custparam_error"] = 'Entered item is inactive.';
							}
							else
							{
								WOarray["custparam_error"] = 'Please enter/scan valid item';
							}
						}
						else
						{
							WOarray["custparam_error"] = 'Please enter/scan valid item';
						}
						response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
						nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
						return;
					}
				} else {
					WOarray["custparam_error"]='No order lines retrieved for this SKU';
					response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
					nlapiLogExecution('ERROR', 'woLineDetails ', 'No order lines retrieved for this SKU');
					return;
				}
			}
		} else {
			WOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
			return;
		}
	} //end of first if condition
} //end of function.


function getWOLineDetails(wonumber,trantype,itemID,whLocation)
{
	nlapiLogExecution('Debug', 'sonumber,whLocation',wonumber+","+whLocation);

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_fulfil_detail', filters, columns);

	return WOLineDetails;
}

function getWOLineDetailsNew(wonumber,trantype,itemID,whLocation)
{
	nlapiLogExecution('Debug', 'sonumber,whLocation',wonumber+","+whLocation);

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_item_srh', filters, columns);

	return WOLineDetails;
}

function getWOLineDetailsInGet(wonumber,trantype,itemID,whLocation)
{
	nlapiLogExecution('Debug', 'sonumber,whLocation',wonumber+","+whLocation);

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_itemget_srh', filters, columns);

	return WOLineDetails;
}

function getWODetails(wonumber)
{
	var filters = new Array();
	var columns = new Array();
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
	filters.push(new nlobjSearchFilter('quantity', null, 'greaterthan', 0));
	filters.push(new nlobjSearchFilter('shipping', null, 'is', 'F'));
	//filters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));

	/*columns.push(new nlobjSearchColumn('line'));
	columns.push(new nlobjSearchColumn('item'));	
	columns.push(new nlobjSearchColumn('quantity'));	
	columns.push(new nlobjSearchColumn('quantityshiprecv'));
	columns.push(new nlobjSearchColumn('tranid'));	
	columns.push(new nlobjSearchColumn('location'));*/	

	var woDetails = new nlapiSearchRecord('workorder','customsearch_wmsse_woscan_validation_srh', filters, columns);
	return woDetails;
}
function getopentaskDetails(woInternalId)
{
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	//opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));


	var opentaskColumns =  new Array();
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_batch_no'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_sku'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_line_no'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty'));
	//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_actendloc'));
	var opentaskResultsArray = new Array();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentask_search',opentaskFilters,opentaskColumns);

	if(opentaskResults !=null && opentaskResults !='')
	{
		nlapiLogExecution('Debug', 'opentaskResults', opentaskResults.length);
		for(var k=0;k<opentaskResults.length;k++)
		{

			var sku = opentaskResults[k].getValue('custrecord_wmsse_sku');
			var lineno = opentaskResults[k].getValue('custrecord_wmsse_line_no');
			var qty =  opentaskResults[k].getValue('custrecord_wmsse_act_qty');
			var key = sku+"-"+lineno;
			var currRow = [key,qty];
			opentaskResultsArray.push(currRow);
		}
	}

	return opentaskResultsArray;
}
function getopentaskDetailsforSku(woInternalId,lineno,item)
{
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	//opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));	
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'equalto',lineno));	
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof',item));


	var opentaskColumns =  new Array();

	//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum'));

	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);


	return opentaskResults;
}

function getOpentaskPickQtyDetails(woInternalId,itemIdArr,lineNumArr)
{
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	//opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));	
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'anyof',lineNumArr));	
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof',itemIdArr));


	var opentaskColumns =  new Array();

	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_wo_itemopentask_srh',opentaskFilters,opentaskColumns);


	return opentaskResults;
}
