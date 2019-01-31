/**
 * Script Description
 * This script is used for Cycle count plan item scanning
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * To scan cycle count item
 */
function ScanItem(request, response){	
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		var getOptedField = request.getParameter('custparam_option');
		var getPlanid =request.getParameter('custparam_planid');
		var whLocation = request.getParameter('custparam_whlocation');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		var whLocationName = request.getParameter('custparam_whlocationname');
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-CHECKIN SO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	
		}
		else
		{
			st0 = domainName + "-CC Inventory";
			st1 = "Enter/Scan Item";
			st2 = "SEND";
			st3 = "PREV";
		}	

		var getPageCount = request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize = 5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);
		nlapiLogExecution('ERROR', 'totalPageSizeValue', totalPageSizeValue);
		var itemCount=0;

		var arrPlandetails = new Array();
		arrPlandetails=getPlanDetails(getPlanid,null,null,null);
		var arrPlanLength = 0;
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan', 'customdeploy_wmsse_onbarcodescan');

		var functionkeyHtml=getFunctionkeyScriptSE('_rf_recorditem');
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enteritem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item'; document.getElementById('enteritem').focus();return false;} else if(document.getElementById('enterbin').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan bin location'; document.getElementById('enterbin').focus(); return false;}else{ return true;}}</script>"+
		"	<script type='text/javascript'>function validateItem(vPlanCountQty,vPlanItemText,vPlanBinText,vPlanStatus) {if(vPlanStatus != 'started'){document.getElementById('div_error').innerHTML ='Count is already completed'; return false;}else{ return true;}}</script>";
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

		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_recorditem' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Cycle Count - Item</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"			<tr><td></tr></td> "+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Plan#: <label>" + getPlanid + "</label>"+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnPlanid' value=" + getPlanid + ">"+
		"				<input type='hidden' name='hdnWhLocation' id='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdncompositebarcode' id='hdncompositebarcode'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enteritem'  class='smalltextbox'  id='enteritem' type='text' onchange='parsebarcode(\""+ServicePageURL+"\");'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+ 
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Bin Location" +
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterbin'  class='smalltextbox'  id='enterbin' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			</table><table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm(vPlanStatus);'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td><td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		" 	</table>";
		if(arrPlandetails != null && arrPlandetails != '')
		{
			if(arrPlandetails.length >= 0)
			{
				html = html + "	<table>"+
				" <tr>"+
				" <td>"+
				"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
				" <tr class='uir-machine-headerrow' >"+
				" <td>Item"+
				" </td>"+		
				" <td>Bin Location"+
				" </td>"+
				" <td class='align-right'> Count Qty"+
				" </td>"+
				"</tr>";
				var vAltClass='uir-list-row-tr line uir-list-row-even';
				for (var s = getPageCount; s < arrPlandetails.length; s++) {						

					itemCount=parseInt(itemCount)+1;

					if(s%2==1)
						vAltClass='uir-list-row-tr line uir-list-row-even';
					else
						vAltClass='uir-list-row-tr line uir-list-row-odd';
					var vPlanLine=arrPlandetails[s].getValue('line');
					var vPlanLineLocation=arrPlandetails[s].getValue('location');
					var vPlanItemId=arrPlandetails[s].getValue('item');
					var vPlanItemText=arrPlandetails[s].getText('item');
					var vPlanBin=arrPlandetails[s].getValue('internalid','binnumber');
					var vPlanBinText=arrPlandetails[s].getValue('binnumber');
					var vPlanInternalId=arrPlandetails[s].getValue('internalid');
					var vPlanCountQty=arrPlandetails[s].getValue('quantity');
					var vPlanStatus=arrPlandetails[s].getValue('status');
					var vPlanQty=0;

					var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
					logmsg = logmsg + 'vPlanCountQty. = ' + vPlanCountQty + '<br>';	
					logmsg = logmsg + 'vPlanBin. = ' + vPlanBin + '<br>';	
					logmsg = logmsg + 'vPlanInternalId. = ' + vPlanInternalId + '<br>';
					logmsg = logmsg + 'vPlanStatus. = ' + vPlanStatus + '<br>';	
					logmsg = logmsg + 'itemCount. = ' + itemCount + '<br>';	

					nlapiLogExecution('DEBUG', 'CyclePlan scanitem get values :', logmsg);


					if(vPlanLineLocation==null || vPlanLineLocation=='')
					{
						vPlanLineLocation=whLocation;
					}
					if(vPlanCountQty != null && vPlanCountQty !='')
					{
						var filtArr = new Array();
						if(vPlanItemId != null && vPlanItemId !='' && vPlanItemId != null)
						{	
							filtArr.push(new nlobjSearchFilter('internalid',null,'anyof',vPlanItemId));
						}

						if(vPlanLineLocation != null && vPlanLineLocation !='' && vPlanLineLocation != null)
						{
							filtArr.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',vPlanLineLocation]));
						}

						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_replen_item_srh', filtArr);

						var blnItemUnit="";
						var VUnitType ="";					
						var vBaseUnit = '';
						var getStockConversionRate =1;
						var vConversionRate=1;
						if(itemresults!=null && itemresults!='')
						{					
							blnItemUnit = itemresults[0].getText('stockunit');
							VUnitType = itemresults[0].getValue('unitstype');							
							nlapiLogExecution('DEBUG', 'blnItemUnit,VUnitType', blnItemUnit+','+VUnitType);

							if(VUnitType != null && VUnitType != '')
							{	
								var vBaseUOMSearch=getBaseUnitRate(VUnitType);

								vBaseUnit='Base unit';
								if(vBaseUOMSearch != null && vBaseUOMSearch != '')
								{
									vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
									vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
								}	

								if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' &&
										blnItemUnit !='undefined' && blnItemUnit !='- None -')
								{
									getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
								}
							}
						}
						nlapiLogExecution('DEBUG', 'getStockConversionRate', getStockConversionRate);
					}
					var itemType = nswms_GetItemType(vPlanItemId, vPlanLineLocation);
					var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan');
					var linkURL_1 = '#';
					//if(vPlanCountQty == null || vPlanCountQty == '')
					//{
					linkURL_1 = checkInURL_1 + '&custparam_lineno=' + vPlanLine + '&custparam_fetcheditemid=' + vPlanItemId + '&custparam_planid=' + getPlanid + '&custparam_whlocation=' + vPlanLineLocation  + '&custparam_binlocationid=' + vPlanBin + '&custparam_itemtype=' + itemType + '&custparam_planinternalid=' + vPlanInternalId + '&custparam_actualbegintime='+ getActualBeginTime + '&custparam_whlocationname='+ whLocationName;
					//}
					html = html + "	<tr  class='" + vAltClass + "' >";
					if(linkURL_1 == '#')
						html = html + " <td>"+vPlanItemText+"</td>";
					else
						html = html +" <td><a name='link1URL_1' class='dottedlink' href='"+linkURL_1+"'  onclick='return validateItem(\""+vPlanCountQty+"\",\""+vPlanItemText+"\",\""+vPlanBinText+"\",\""+vPlanStatus+"\");'>"+vPlanItemText+"</a></td>";
					html = html +" <td> "+vPlanBinText+"</td>";
					if(vPlanCountQty != null && vPlanCountQty !='')
					{

						//vPlanQty=parseFloat((parseFloat(vPlanCountQty)/parseFloat(getStockConversionRate)).toFixed(5));
						vPlanQty=Number((Big(vPlanCountQty).div(getStockConversionRate)).toFixed(8));
						nlapiLogExecution('DEBUG', 'vPlanQty big',vPlanQty);
					}
					html = html + " <td class='align-right'> "+vPlanQty+"</td>"+

					"</tr>";

					if(parseInt(itemCount)>=5)
						break;
				}

				html = html + "	</table>"+
				"				<input type='hidden' name='hdngetPageCount' value=" + getPageCount + ">"+
				" </td>"+
				"</tr>"+
				"</table>";
			}
			//arrPlandetails=null;
			arrPlanLength = arrPlandetails.length;
		}
		else
		{
			var cycArray=new Array();	
			cycArray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
			cycArray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
			cycArray["custparam_error"]='Record has been changed/deleted';
			response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
			return;

		}
		//html = html +"			<tr>"+
		html = html +"			</tr><tr><td></td></tr></table>";

		html = html +"		<table>	<tr>";
		/*nlapiLogExecution('ERROR', 'orderCount',orderCount);*/
		nlapiLogExecution('DEBUG', 'getPageCount',getPageCount);
		if(getPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"				<td width='20px'></td>";
		if(arrPlanLength > (parseInt(getPageCount)+5))
			//if(parseInt(itemCount)>1)
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>";

		html = html +"	</form>"+
		"<script type='text/javascript'>document.getElementById('enteritem').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedEvent = request.getParameter('cmdPrevious');
		var cycArray=new Array();


		var getLanguage = request.getParameter('hdngetLanguage');
		cycArray["custparam_language"] = getLanguage;
		nlapiLogExecution('DEBUG', 'getLanguage', cycArray["custparam_language"]);
		cycArray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		cycArray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime'); 
		cycArray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName'); 
		cycArray["custparam_bcComponents"] = request.getParameter('hdncompositebarcode');
		var st11,st12;
		if( getLanguage == 'es_ES')
		{
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "MainMenu";
		}
		else
		{
			st11 = "Invalid Plan";
			st12 = "MainMenu";
		}


		var enterItem = request.getParameter('enteritem');
		var enterBin = request.getParameter('enterbin');
		cycArray["custparam_planid"] = request.getParameter('hdnPlanid');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS Back Pressed');

			response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
			return;
		}
		else
		{
			nlapiLogExecution('DEBUG','request.getParameter("cmdNextList")',request.getParameter('cmdNextList'));

			if(request.getParameter('cmdNextList')=="Next")
			{
				cycArray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+5;
				cycArray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
				return;
			}
			if(request.getParameter('cmdPrevList')=="Prev")
			{
				cycArray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-5;
				cycArray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
				return;
			}

			if(enterItem!=null && enterItem!='' && enterBin!=null && enterBin!='')
			{
				var currItem = getSKUIdWithName(enterItem, cycArray["custparam_whlocation"], null,null);

				if(currItem==null ||  currItem=='')
				{
					nlapiLogExecution('DEBUG', 'Into Bar Code parsing', enterItem);

					var currItem = new Array();

					var barcodecomponents = parsebarcodeoutsidereceiving(enterItem,cycArray["custparam_whlocation"]);
					nlapiLogExecution('DEBUG', 'barcodecomponents', barcodecomponents);		
					if(barcodecomponents != null && barcodecomponents !='' && barcodecomponents !='null')
					{
						nlapiLogExecution('DEBUG', 'barcode error', barcodecomponents["error"]);	

						if(barcodecomponents["error"] == "NoBarcodeFormats")
						{
							cycArray["custparam_error"] = 'Invalid Item/Invalid Bar Code';
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
							return;
						}
						if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
						{
							cycArray["custparam_error"] = barcodecomponents["error"];
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
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
							cycArray["custparam_bcComponents"] = JSON.stringify(barcodecomponents);
							cycArray["custparam_bcqty"]='';
							cycArray["custparam_bcuom"]='';
							cycArray["custparam_bclot"]='';
							cycArray["custparam_bcexpirydate"]='';
							cycArray["custparam_bcserial"]='';


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


				}
				nlapiLogExecution('DEBUG','currItem',currItem);
				if(currItem!=null && currItem!='')
				{
					var currBin = nswms_GetBinInternalId(enterBin,cycArray["custparam_whlocation"]);
					nlapiLogExecution('DEBUG','currBin',currBin);
					if(currBin!=null && currBin!='')
					{	
						var getPlanid=cycArray["custparam_planid"];
						nlapiLogExecution('DEBUG','getPlanid',getPlanid);
						var arrPlandetails=getPlanDetails(getPlanid,currItem[0],currBin,null);
						if(arrPlandetails!=null && arrPlandetails!='' && arrPlandetails.length>0)
						{
							nlapiLogExecution('DEBUG','arrPlandetails.length',arrPlandetails.length);
							var vPlanLine=arrPlandetails[0].getValue('line');
							var vPlanLineLocation=arrPlandetails[0].getValue('location');
							var vPlanItemId=arrPlandetails[0].getValue('item');
							var vPlanItemText=arrPlandetails[0].getText('item');
							var vPlanBin=arrPlandetails[0].getValue('internalid','binnumber');
							var vPlanBinText=arrPlandetails[0].getValue('binnumber');
							var vPlanInternalId=arrPlandetails[0].getValue('internalid');
							var vPlanCountQty=arrPlandetails[0].getValue('quantity');
							var vplanStatus=arrPlandetails[0].getValue('status');
							if(vplanStatus == 'started')
							{

								var logmsg = 'vPlanBin. = ' + vPlanBin + '<br>';
								logmsg = logmsg + 'vPlanCountQty. = ' + vPlanCountQty + '<br>';	
								logmsg = logmsg + 'vPlanInternalId. = ' + vPlanInternalId + '<br>';
								nlapiLogExecution('DEBUG', 'CyclePlan scanitem post values :', logmsg);

								if(vPlanLineLocation==null || vPlanLineLocation=='')
								{
									vPlanLineLocation=cycArray["custparam_whlocation"];
								}
								var itemType = nswms_GetItemType(vPlanItemId, vPlanLineLocation);

								cycArray["custparam_lineno"] = vPlanLine;
								cycArray["custparam_fetcheditemid"] = vPlanItemId;
								//cycArray["custparam_fetcheditemname"] = vPlanItemText;
								cycArray["custparam_planid"] = getPlanid;
								cycArray["custparam_whlocation"] = vPlanLineLocation;
								cycArray["custparam_binlocationid"] = vPlanBin;
								//cycArray["custparam_binlocationname"] = vPlanBinText;
								cycArray["custparam_itemtype"] = itemType;
								cycArray["custparam_planinternalid"] = vPlanInternalId;
								response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan', false, cycArray);
								arrPlandetails=null;
								currBin=null;
								return;
							}
							else
							{
								cycArray["custparam_error"] ='Count is already completed';
								response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
								return;
							}

						}
						else
						{
							cycArray["custparam_error"] ='Invalid combination with item and bin location';
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
							return;

						}

					}
					else
					{
						cycArray["custparam_error"] ='Please enter/scan valid bin location';
						response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
						return;

					}
				}
				else
				{
					var itemfilters=new Array();
					itemfilters.push(new nlobjSearchFilter('nameinternal',null,'is',enterItem));
					/*if(cycArray["custparam_whlocation"] != null && cycArray["custparam_whlocation"] !='' && cycArray["custparam_whlocation"] != null)
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',cycArray["custparam_whlocation"]]));
						}*/
					var itemcolumns= new Array();
					itemcolumns.push(new nlobjSearchColumn('itemid'));			
					itemcolumns.push(new nlobjSearchColumn('isinactive'));
					itemcolumns.push(new nlobjSearchColumn('location'));
					var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inventory_itemdetails', itemfilters, itemcolumns);
					nlapiLogExecution('ERROR', 'itemresults', itemresults);
					if(itemresults!=null && itemresults!='')
					{
						if(itemresults[0].getValue('isinactive')=="T")
						{
							cycArray["custparam_error"] = 'Entered item is inactive.';
						}
						else if(itemresults[0].getValue('location') !='' && itemresults[0].getValue('location') != cycArray["custparam_whlocation"])
						{
							cycArray["custparam_error"] = "Entered/scanned item belongs to different warehouse.";			

						}							
						else
						{
							cycArray["custparam_error"] = 'Please enter/scan valid item';
						}
					}
					else
					{
						cycArray["custparam_error"] = 'Please enter/scan valid item';
					}
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
					return;

				}
			}
			else
			{
				cycArray["custparam_error"] ='Please enter/scan valid item/bin location';
				response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
				return;

			}
		}		
	}
}
