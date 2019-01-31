/**
 * Script Description
 * This script is used to scan the Item for selected Order.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan item for picking
 */
function PickingSKU(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';
		var getSONo = request.getParameter('custparam_soid');	

		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var whCompany= request.getParameter('custparam_company');
		var cartonScreenRuleValue=request.getParameter('custparam_cartonscreenrulevalue');
		var carton=request.getParameter('custparam_carton');
		var cartonSize=request.getParameter('custparam_cartonsize');
		var cartonWeight=request.getParameter('custparam_cartonweight');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vShipVia = request.getParameter('custparam_shipmethod');

		var vclass = request.getParameter('custparam_class');
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-FULFILLMENT ITEM SCAN';
		var getPageCount = request.getParameter('custparam_pagecount1');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize = 5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);

		var itemCount=0;
		var enableitemCount=0;

		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getSONo. = ' + getSONo + '<br>';
		logmsg = logmsg + 'vShipVia. = ' + vShipVia + '<br>';	
		logmsg = logmsg + 'totalPageSizeValue. = ' + totalPageSizeValue + '<br>';		
		logmsg = logmsg + 'CSSfilefound. = ' + CSSfilefound + '<br>';						
		nlapiLogExecution('DEBUG', 'Values :', logmsg);

		var lineArray1 = request.getParameter('custparam_linearray');
		var lineArray =new Array();
		if(lineArray1 != null && lineArray1 != '')
		{
			lineArray = lineArray1.split(',');
		}


		var lineArrayCount1 = request.getParameter('custparam_linearraycount');
		var lineArrayCount =new Array();
		if(lineArrayCount1 != null && lineArrayCount1 != '')
		{
			lineArrayCount = lineArrayCount1.split(',');
		}



		var getPC = request.getParameter('custparam_pc');
		if(getPC == null || getPC=='' || getPC=='null')
			getPC=0;

		var q=0;
		var x=0;
		var count = new Array();
		var count1 = request.getParameter('custparam_countArray');

		if(count1 != null && count1 != '')
		{
			count = count1.split(',');

		}

		var displayEnable = request.getParameter('custparam_enabledisply');
		var displayDisable = request.getParameter('custparam_disabledisply');

		if(displayEnable == null || displayEnable=='' || displayEnable=='null')
			displayEnable='block';

		if(displayDisable == null || displayDisable=='' || displayDisable=='null')
			displayDisable='none';



		var getEnbPageCount = request.getParameter('custparam_pagecount');
		if(getEnbPageCount == null || getEnbPageCount=='' || getEnbPageCount=='null')
			getEnbPageCount=0;
		var pageSize = 5;
		var totalPageSizeValue=parseInt(getEnbPageCount)*parseInt(pageSize);

		count = getFinalCount(count,parseInt(getEnbPageCount));

		var initLineCount=lineArray.length;

		getActualBeginTime = TimeStamp(); // We are taking timestamp here because we need to populate each line time differently in open task

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

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan', 'customdeploy_wmsse_onbarcodescan');

		var vPickReportFlag='F';
		if(getPickreportid == null || getPickreportid =='' || getPickreportid =='- None -' || getPickreportid =='undefined' || getPickreportid =='null')
		{
			var PickReportDetails = funGetPickReportNo(getSONo);
			if(PickReportDetails != null && PickReportDetails != '' && PickReportDetails.length > 0)
			{
				getPickreportid = PickReportDetails[0].getValue('custrecord_wmsse_pickreport_no',null,'group');
				vPickReportFlag = "T";
			}

		}//Case # 201414026 start		
		else
		{
			nlapiLogExecution('DEBUG', 'getPickreportid', getPickreportid);
			if(getPickreportid != null && getPickreportid !='null' && getPickreportid !='undefined' &&  getPickreportid !='' )
			{
				vPickReportFlag = "T";
			}
		}
		//Case # 201414026 end

		var ordVar = "SO/TO";

		var st1,st2,st3,st4,st5,st6,st7,st8,st9,st10;

		if( (getLanguage == 'es_ES' || getLanguage == 'es_AR'))
		{
			if(trantype == 'salesorder')
			{
				st0 = domainName + '-SO Recolecci&#243;n';
				ordVar = "&#211;rdenes De Venta#";
			}
			else
			{
				st0 = domainName + '-TO Recolecci&#243;n';
				ordVar = "Orden De Transferencia #";
			}
			st1 = "Entrar / Scan Art&#237;culo";			
			st2 = "Art&#237;culo";
			st3 = "Escogido";
			st4 = "Restante";
		}
		else if( getLanguage == 'fr_FR')
		{
			if(trantype == 'salesorder')
			{
				st0 = domainName + ' - SO Cueillette';
				ordVar = "Sales Order#";
			}
			else
			{
				st0 = domainName + ' - TO Cueillette';
				ordVar = "Ordre de transfert #";
			}
			st1 = "Entrez / Num&#233;risation Article";			
			st2 = "Article";
			st3 = "Choisi";
			st4 = "Restant";
		}
		else
		{
			if(trantype == 'salesorder')
			{
				st0 = domainName + ' - SO Picking';
				ordVar = "Sales Order#";
			}
			else
			{
				st0 = domainName + ' - TO Picking';
				ordVar = "Transfer Order#";
			}
			st1 = "Enter/Scan Item ";
			st2 = "Item";
			st3 = "Picked";
			st4 = "Remaining"; 
		}
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();

		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");

		var enableImgfile='';
		var enableImgUrl='';
		enableImgfile=  getLoadFile('toggleOff.png');
		if(enableImgfile)
		{
			enableImgUrl = enableImgfile.getURL();

		}
		enableImgUrl=enableImgUrl.replace(/&/g,"&amp;");

		var disableImgfile='';
		var disableImgUrl='';
		disableImgfile=  getLoadFile('toggleOn.png');
		if(disableImgfile)
		{
			disableImgUrl = disableImgfile.getURL();

		}
		disableImgUrl=disableImgUrl.replace(/&/g,"&amp;");

		CSSfilefound=null;
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_item');
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";

		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "'" +
			" type='text/css' rel='stylesheet'>";	 

		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('hdnvPickReportFlag').value == 'F')" +
		"{document.getElementById('div_error').innerHTML ='Please print pick ticket for this order#';return false;}" +
		" if(document.getElementById('txtItem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item';" +
		"return false;}else{document.getElementById('loading').style.display = ''; return true;}}</script>"+
		"	<script type='text/javascript'>function validateItem(usedBins,vsoitem,vsoline) {if(usedBins == 'F')" +
		"{document.getElementById('div_error').innerHTML ='Please select use bins flag for this item ' +vsoitem+ ' to fulfill.';	return false;}" +
		"else{document.getElementById('hdnClickedItm').value = vsoitem;document.getElementById('hdnClickedLine').value = vsoline;" +
		"document.forms['_rf_picking_item'].submit();document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +"	<script type='text/javascript'>function toggleForm(displayDisable) {var val = document.getElementById('hdnnumber').value;" +
		"if(val == '' || val == null){val = 0;}if(parseInt(val)%2 == 0){if(displayDisable=='block'){" +
		"document.getElementById('enable').style.display='block';document.getElementById('disable').style.display='none';}" +
		"else{document.getElementById('enable').style.display='none';document.getElementById('disable').style.display='block';}" +
		"val = parseInt(val)+1;document.getElementById('hdnnumber').value = val;return false;}else{if(displayDisable=='block')" +
		"{document.getElementById('enable').style.display='none';document.getElementById('disable').style.display='block';}else" +
		"{document.getElementById('enable').style.display='block';document.getElementById('disable').style.display='none';}" +
		"val = parseInt(val)+1;document.getElementById('hdnnumber').value = val;return false;}}</script>";
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

		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);" +
		"window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";

		html = html +"	<form name='_rf_picking_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Picking Item</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+

		//"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getSONo + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' id='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdncartonScreenRuleValue' value=" + cartonScreenRuleValue + ">"+
		"				<input type='hidden' name='hdncarton' value=" + carton + ">"+
		"				<input type='hidden' name='hdncartonSize' value=" + cartonSize + ">"+
		"				<input type='hidden' name='hdncartonWeight' value=" + cartonWeight + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdnvPickReportFlag' id='hdnvPickReportFlag' value=" + vPickReportFlag + ">"+
		"				<input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnClickedItm'  id='hdnClickedItm'>"+
		"				<input type='hidden' name='hdnClickedLine'  id='hdnClickedLine'>"+
		"				<input type='hidden' name='hdnShipVia' id='hdnShipVia' value='" +vShipVia+"'>"+
		"				<input type='hidden' name='hdnnumber' id='hdnnumber' >"+
		"				<input type='hidden' name='hdncompositebarcode' id='hdncompositebarcode'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ st1 +	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtItem'  class='smalltextbox'  id='txtItem' type='text' onchange='parsebarcode(\""+ServicePageURL+"\");'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr><td></td></tr></table>"+

		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit'  class='defaultlink'    value='' onclick='return validateForm();'/>"+

		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td><td width='10px'></td><td>"+
		"			</tr>"+
		"		 </table>";

		//var arrSodetails = getSOLineDetailsItem(getSOInternalId,trantype,null,whLocation);
		var arrSodetails = getSOItemscandetails(getSOInternalId,trantype,whLocation);
		var arrSoSequencedetails = getSOLineDetailsBasedOnSequence(getSOInternalId,trantype,getPickreportid);

		html = html + "	<div id='enable' style='display:"+displayEnable+";'>";

		if(arrSoSequencedetails!=null && arrSoSequencedetails!='')
		{
			nlapiLogExecution('DEBUG', 'arrSoSequencedetails', arrSoSequencedetails.length);
			if(arrSoSequencedetails.length>0)
			{
				html = html + "<br/>	<table >"+
				"<tr>"+
				"<td style='text-align:right;font-family:Tahoma;font-size:14px;font-weight:normal;color:black;'> Show Completed Items "+
				"				<input type='image' src='"+enableImgUrl+"' height='20px' width='38px' onclick='return toggleForm(\""+displayDisable+"\");' /></td>"+
				"</tr>"+
				" <tr>"+
				" <td>"+
				"	<table style='border-spacing: 0;'>"+
				" <tr class='uir-machine-headerrow' colspan='3'>"+

				"<td  class='listheadertdleft listheadertextb uir-column-medium'><span class='listheader'>"+ st2 +"</span>"+
				" </td>"+		
				" <td class='align-right'>"+ st3 +
				" </td>"+	
				" <td class='align-right'>"+ st4 +
				" </td>"+	
				"</tr>";

				var checkInURL_Def = nlapiResolveURL('SUITELET', 'customscript_wmsse_soqty_scan', 'customdeploy_wmsse_soqty_scan');

				var soInternalId=arrSodetails[0].getValue('internalid');
				var vWhHeadLoc='';


				var vAltClass='uir-list-row-tr line uir-list-row-even';

				var vOpentaskdetails = getPickedqtydetails(getSOInternalId,trantype,whLocation);
				for (var s1 = getEnbPageCount; s1 < arrSoSequencedetails.length; s1++) {

					var item = arrSoSequencedetails[s1].getValue('custrecord_wmsse_parent_sku_no',null,'group');
					var line = arrSoSequencedetails[s1].getValue('custrecord_wmsse_line_no',null,'group');


					if(arrSodetails != null && arrSodetails != '')
					{
						var vColumnslist=arrSodetails[0].getAllColumns();


						for (var s = 0; s < arrSodetails.length; s++) {


							var vColumnslist=arrSodetails[s].getAllColumns();

							var vsoitemId = arrSodetails[s].getValue('item');							
							var vsoitemline = arrSodetails[s].getValue('line');	
							if(item ==vsoitemId && line == vsoitemline && lineArray.indexOf(vsoitemline)==-1)
							{
								lineArray.push(vsoitemline);
								if(s%2==1)
									vAltClass='uir-list-row-tr line uir-list-row-even';
								else
									vAltClass='uir-list-row-tr line uir-list-row-odd';
								enableitemCount=parseInt(enableitemCount)+1;
								var usedBins='';
								var vLineLocation='';
								var vItemType='';
								var vUnitType='';
								var vUnits='';

								var vsoitem = arrSodetails[s].getText('item');
								var vsoitemId = arrSodetails[s].getValue('item');
								var vsoitemType=arrSodetails[s].getValue('type','item');

								if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
									|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
								{
									var vsoitemQty=arrSodetails[s].getValue('quantity');
								}
								else
								{
									var vsoitemQty=arrSodetails[s].getValue('quantitycommitted');
								}

								var vsoitemfulfillQty=arrSodetails[s].getValue('quantitypicked');				

								var vsoitemNSReceivedQty=arrSodetails[s].getValue('quantitypicked');
								var vsoitemNSshippedQty=arrSodetails[s].getValue('quantityshiprecv');
								var vsoitemLine = arrSodetails[s].getValue('line');					
								var vUnitsText = arrSodetails[s].getValue('unit');
								var vConversionRate = arrSodetails[s].getValue('formulanumeric');


								if(trantype == 'transferorder' && vsoitemLine != null)
									vsoitemLine = parseInt(vsoitemLine)-1;

								var vsoitemopentaskQty=0;
								for(var vOpentaskcount = 0; vOpentaskcount < vOpentaskdetails.length; vOpentaskcount++)
								{

									var vOpentaskitem = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_sku',null,'group');
									var vOpentaskLine = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_line_no',null,'group');

									if(vOpentaskitem==vsoitemId && vOpentaskLine==vsoitemLine)
									{
										vsoitemopentaskQty = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_act_qty',null,'sum');
										break;
									}


								}

								if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
								{
									vsoitemopentaskQty = 0;
								}

								if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
								{
									vsoitemNSReceivedQty = 0;
								}
								if(vsoitemfulfillQty ==null || vsoitemfulfillQty=='' ||vsoitemfulfillQty=='null' || vsoitemfulfillQty=='undefined' )
								{
									vsoitemfulfillQty = 0;
								}
								if(vsoitemNSshippedQty ==null || vsoitemNSshippedQty=='' ||vsoitemNSshippedQty=='null' || vsoitemNSshippedQty=='undefined' )
								{
									vsoitemNSshippedQty = 0;
								}

								if(vConversionRate!=null && vConversionRate!='')
								{
									vsoitemQty=Number(Big(vsoitemQty).div(vConversionRate));
									vsoitemNSReceivedQty=Number(Big(vsoitemNSReceivedQty).div(vConversionRate));
									vsoitemNSshippedQty=Number(Big(vsoitemNSshippedQty).div(vConversionRate));

								}


								var vsoitemRcvQty = Number(Big(vsoitemopentaskQty).plus(vsoitemNSReceivedQty));
								if(vsoitemRcvQty==null || vsoitemRcvQty=='')
									vsoitemRcvQty=0;

								if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
									|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
								{
									var vSoreminqty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));
								}
								else
								{
									vsoitemQty= Big(vsoitemQty)
									vsoitemNSshippedQty= Big(vsoitemNSshippedQty)
									vsoitemRcvQty= Big(vsoitemRcvQty)

									var vSoreminqty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
								}

								

								nlapiLogExecution('DEBUG', 'vsoitemQty,vsoitemRcvQty,vsoitemfulfillQty', vsoitemQty+","+vsoitemRcvQty+","+vsoitemfulfillQty);



								if(parseFloat(vSoreminqty)<0)
									vSoreminqty=0;

								vLineLocation=arrSodetails[s].getValue('location');
								if(trantype!="transferorder")
								{
									if(vLineLocation == null || vLineLocation == '')
										vLineLocation=vWhHeadLoc;
								}
								else
								{
									vLineLocation=vWhHeadLoc;
								}

								if((parseFloat(vSoreminqty) <= 0) || parseFloat(vsoitemQty) <= 0)
								{
									enableitemCount=parseInt(enableitemCount)-1;
									continue;
								}

								//nlapiLogExecution('ERROR', 'request.getParameter(hdnActualBeginTime)', request.getParameter('hdnActualBeginTime'));
								var linkURL_1 = '#';
								if(parseFloat(vSoreminqty) > 0)
								{
									var vItemType=arrSodetails[s].getValue('type','item');
									if(vItemType=='kititem' || vItemType=='Kit')
									{
										usedBins='T';
										checkInURL_1 =	nlapiResolveURL('SUITELET', 'customscript_wmsse_kitorpkg_qtyscan', 'customdeploy_wmsse_kitorpkg_qtyscan');

									}
									else
									{
										checkInURL_1 =	checkInURL_Def;
									}

									if(vItemType=='noninventoryitem' || vItemType=='otherchargeitem' || vItemType=='Service' || vItemType=='serviceitem'
										|| vItemType=='downloaditem' || vItemType=='Download Item' || vItemType=='giftcertificateitem')
									{
										usedBins='T';
									}


									linkURL_1 = checkInURL_1 + '&custparam_lineno=' + vsoitemLine + '&custparam_fetcheditemid=' + vsoitemId + '&custparam_sointernalid=' + soInternalId + '&custparam_rem_qty=' + vSoreminqty + '&custparam_rec_qty=' + vsoitemRcvQty + '&custparam_whlocation=' + vLineLocation  + '&custparam_soid=' + getSONo  + '&custparam_trantype=' + trantype + '&custparam_company=' + whCompany + '&custparam_carton=' + carton + '&custparam_cartonsize=' + cartonSize + '&custparam_cartonweight=' + cartonWeight +'&custparam_cartonscreenrulevalue='+cartonScreenRuleValue +'&custparam_actualbegintime='+ getActualBeginTime +'&custparam_customer='+ customer+'&custparam_pickreportid='+ getPickreportid+'&custparam_uom='+ vUnitsText+'&custparam_conversionrate='+ vConversionRate+'&custparam_ordtype='+ ordType+'&custparam_department='+department+'&custparam_class='+vclass;
								}

								vSoreminqty = parseFloat(parseFloat(vSoreminqty).toFixed(5));
								vsoitemRcvQty = parseFloat(parseFloat(vsoitemRcvQty).toFixed(5));

								html = html + "	<tr class='" + vAltClass + "'>";
								if(linkURL_1 == '#')
									html = html + " <td>"+vsoitem+"</td>";
								else
									html = html +" <td  ><a name='link1URL_1' class='dottedlink' href='#' onclick='return validateItem(\""+usedBins+"\",\""+vsoitemId+"\",\""+vsoitemLine+"\");'> "+vsoitem+"</a></td>";
								if(vUnitsText !=null && vUnitsText !='' && vUnitsText!='null' && vUnitsText !='undefined' && vUnitsText !='- None -')
								{
									html = html +" <td class='align-right'> "+vsoitemRcvQty+" "+vUnitsText+"</td>";
									html = html +" <td class='align-right'> "+vSoreminqty+" "+vUnitsText+"</td>";
								}
								else
								{
									html = html +" <td align='right'> "+vsoitemRcvQty+"</td>";
									html = html +" <td align='right'> "+vSoreminqty+"</td>";
								}
								html = html +"</tr>";

							}

						}	

					}
					if(parseInt(enableitemCount)>=5)
					{
						x=s1;
						break;
					}


				}


				var finalLineCount = lineArray.length;
				nlapiLogExecution('DEBUG', 'finalLineCount', finalLineCount);
				var result = finalLineCount-initLineCount;
				if(result<0)
					result = -(result);

				lineArrayCount.push((result));
				checkInURL_Def="";
				html = html + "	</table>"+	
				"				<input type='hidden' name='hdngetPageCount' value=" + getEnbPageCount + ">"+
				" </td>"+
				" <td>"+
				"				<input type='hidden' name='hdnLineArray' value=" + lineArray + ">"+
				" </td>"+
				" <td>"+
				"				<input type='hidden' name='hdnLineArrayCount' value=" + lineArrayCount + ">"+
				" </td>"+
				"<td>"+
				"				<input type='hidden' name='hdngetCountArray' value=" + count + ">"+
				" </td>"+
				"<td>"+
				"				<input type='hidden' name='hdngetnext' value=" + x + ">"+
				" </td>"+
				"<td>"+
				"				<input type='hidden' name='hdngetPC' value=" + getPC + ">"+
				" </td>"+
				"</tr>";

				var enabledLength=0;

				lineArrayCopy =new Array();
				var prOrderArray = new Array();

				for (var s1 = 0; s1 < arrSoSequencedetails.length; s1++) {

					var item = arrSoSequencedetails[s1].getValue('custrecord_wmsse_parent_sku_no',null,'group');
					var line = arrSoSequencedetails[s1].getValue('custrecord_wmsse_line_no',null,'group');
					//nlapiLogExecution('ERROR', 'item', item);

					if(arrSodetails != null && arrSodetails != '')
					{
						var vColumnslist=arrSodetails[0].getAllColumns();


						for (var s = 0; s < arrSodetails.length; s++) {

							var vsoitemId = arrSodetails[s].getValue('item');							
							var vsoitemline = arrSodetails[s].getValue('line');	

							if(item ==vsoitemId && line == vsoitemline && lineArrayCopy.indexOf(vsoitemline)==-1)
							{
								lineArray.push(vsoitemline);
								lineArrayCopy.push(vsoitemline);
								if(s%2==1)
									vAltClass='uir-list-row-tr line uir-list-row-even';
								else
									vAltClass='uir-list-row-tr line uir-list-row-odd';

								var usedBins='';
								var vLineLocation='';
								var vItemType='';
								var vUnitType='';
								var vUnits='';

								var vsoitem = arrSodetails[s].getText('item');
								var vsoitemId = arrSodetails[s].getValue('item');
								var vsoitemType=arrSodetails[s].getValue('type','item');

								if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
									|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
								{
									var vsoitemQty=arrSodetails[s].getValue('quantity');
								}
								else
								{
									var vsoitemQty=arrSodetails[s].getValue('quantitycommitted');
								}

								var vsoitemfulfillQty=arrSodetails[s].getValue('quantitypicked');				

								var vsoitemNSReceivedQty=arrSodetails[s].getValue('quantitypicked');
								var vsoitemNSshippedQty=arrSodetails[s].getValue('quantityshiprecv');
								var vsoitemLine = arrSodetails[s].getValue('line');					
								var vUnitsText = arrSodetails[s].getValue('unit');
								var vConversionRate = arrSodetails[s].getValue('formulanumeric');


								if(trantype == 'transferorder' && vsoitemLine != null)
									vsoitemLine = parseInt(vsoitemLine)-1;

								var vsoitemopentaskQty=0;
								for(var vOpentaskcount = 0; vOpentaskcount < vOpentaskdetails.length; vOpentaskcount++)
								{

									var vOpentaskitem = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_sku',null,'group');
									var vOpentaskLine = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_line_no',null,'group');

									if(vOpentaskitem==vsoitemId && vOpentaskLine==vsoitemLine)
									{
										vsoitemopentaskQty = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_act_qty',null,'sum');
										break;
									}


								}

								if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
								{
									vsoitemopentaskQty = 0;
								}

								if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
								{
									vsoitemNSReceivedQty = 0;
								}
								if(vsoitemfulfillQty ==null || vsoitemfulfillQty=='' ||vsoitemfulfillQty=='null' || vsoitemfulfillQty=='undefined' )
								{
									vsoitemfulfillQty = 0;
								}
								if(vsoitemNSshippedQty ==null || vsoitemNSshippedQty=='' ||vsoitemNSshippedQty=='null' || vsoitemNSshippedQty=='undefined' )
								{
									vsoitemNSshippedQty = 0;
								}

								if(vConversionRate!=null && vConversionRate!='')
								{
									vsoitemQty=Number(Big(vsoitemQty).div(vConversionRate));
									vsoitemNSReceivedQty=Number(Big(vsoitemNSReceivedQty).div(vConversionRate));
									vsoitemNSshippedQty=Number(Big(vsoitemNSshippedQty).div(vConversionRate));

								}

								var vsoitemRcvQty = Number(Big(vsoitemopentaskQty).plus(vsoitemNSReceivedQty));
								if(vsoitemRcvQty==null || vsoitemRcvQty=='')
									vsoitemRcvQty=0;

								if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
									|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
								{
									var vSoreminqty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));
								}
								else
								{
									vsoitemQty=Big(vsoitemQty);
									vsoitemNSshippedQty=Big(vsoitemNSshippedQty);
									vsoitemRcvQty=Big(vsoitemRcvQty);

									var vSoreminqty = Number(Big(vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
								}
								nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);

								if(parseFloat(vSoreminqty)<0)
									vSoreminqty=0;

								if(parseFloat(vSoreminqty) > 0 && parseFloat(vsoitemQty) > 0)
								{
									enabledLength++;
									prOrderArray.push(line);
								}
							}
						}
					}
				}


				nlapiLogExecution('DEBUG', 'enabledLength', enabledLength);

				html = html +"</table>";

			}
		}

		html = html +"		<table>	<tr>";

		if(getEnbPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdEnbPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"				<td width='20px'></td>";
		if((enabledLength) > (parseInt(getPC)+5))

		{
			html = html +"				<td align = 'right'><input name='cmdEnbNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>";
		html = html + "</div>";

		html = html + "	<div id='disable' style='display:"+displayDisable+";'>";

		var lineArrayDsb1 = request.getParameter('custparam_linearraydsb');
		lineArrayDsb =new Array();
		if(lineArrayDsb1 != null && lineArrayDsb1 != '')
		{
			lineArrayDsb = lineArrayDsb1.split(',');
		}


		var lineArrayCountDsb1 = request.getParameter('custparam_linearraycountdsb');
		lineArrayCountDsb =new Array();
		if(lineArrayCountDsb1 != null && lineArrayCountDsb1 != '')
		{
			lineArrayCountDsb = lineArrayCountDsb1.split(',');
		}


		if(arrSoSequencedetails!=null && arrSoSequencedetails!='')
		{
			nlapiLogExecution('DEBUG', 'arrSoSequencedetails', arrSoSequencedetails.length);
			if(arrSoSequencedetails.length>0)
			{
				html = html + "	<br/><table >"+
				"<tr>"+
				"<td style='text-align:right;font-family:Tahoma;font-size:14px;font-weight:normal;color:black;'> Show Completed Items "+
				"			<input type='image' src='"+disableImgUrl+"' height='20px' width='38px' onclick='return toggleForm(\""+displayDisable+"\");' /></td>"+
				"</tr>"+
				" <tr>"+
				" <td>"+
				"	<table style='border-spacing: 0;'>"+
				" <tr class='uir-machine-headerrow' colspan='3'>"+

				"<td><span class='listheader'>"+ st2 +"</span>"+
				" </td>"+		
				" <td class='align-right'>"+ st3 +
				" </td>"+	
				" <td class='align-right'>"+ st4 +
				" </td>"+	
				"</tr>";

				var checkInURL_Def = nlapiResolveURL('SUITELET', 'customscript_wmsse_soqty_scan', 'customdeploy_wmsse_soqty_scan');

				var soInternalId=arrSodetails[0].getValue('internalid',null,'group');
				var vWhHeadLoc='';
				if(soInternalId != null && soInternalId != '')
				{				
					vWhHeadLoc= nlapiLookupField(trantype, soInternalId, 'location');
				}

				var vAltClass='uir-list-row-tr line uir-list-row-even';

				var vOpentaskdetails = getPickedqtydetails(getSOInternalId,trantype,whLocation);
				for (var s1 = getPageCount; s1 < arrSoSequencedetails.length; s1++) {

					var item = arrSoSequencedetails[s1].getValue('custrecord_wmsse_parent_sku_no',null,'group');
					var line = arrSoSequencedetails[s1].getValue('custrecord_wmsse_line_no',null,'group');


					if(arrSodetails != null && arrSodetails != '')
					{
						var vColumnslist=arrSodetails[0].getAllColumns();

						for (var s = 0; s < arrSodetails.length; s++) {


							var vsoitemId = arrSodetails[s].getValue('item');							
							var vsoitemline = arrSodetails[s].getValue('line');	

							if(item ==vsoitemId && line == vsoitemline && lineArrayDsb.indexOf(vsoitemline)==-1)
							{
								lineArrayDsb.push(vsoitemline);
								if(s%2==1)
									vAltClass='uir-list-row-tr line uir-list-row-even';
								else
									vAltClass='uir-list-row-tr line uir-list-row-odd';
								itemCount=parseInt(itemCount)+1;
								var usedBins='';
								var vLineLocation='';
								var vItemType='';
								var vUnitType='';
								var vUnits='';
								var vsoitem = arrSodetails[s].getText('item');
								var vsoitemId = arrSodetails[s].getValue('item');
								var vsoitemType=arrSodetails[s].getValue('type','item');

								if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
									|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
								{
									var vsoitemQty=arrSodetails[s].getValue('quantity');
								}
								else
								{
									var vsoitemQty=arrSodetails[s].getValue('quantitycommitted');
								}

								var vsoitemfulfillQty=arrSodetails[s].getValue('quantitypicked');				

								var vsoitemNSReceivedQty=arrSodetails[s].getValue('quantitypicked');
								var vsoitemNSshippedQty=arrSodetails[s].getValue('quantityshiprecv');
								var vsoitemLine = arrSodetails[s].getValue('line');					
								var vUnitsText = arrSodetails[s].getValue('unit');
								var vConversionRate = arrSodetails[s].getValue('formulanumeric');


								if(trantype == 'transferorder' && vsoitemLine != null)
									vsoitemLine = parseInt(vsoitemLine)-1;

								var vsoitemopentaskQty=0;
								for(var vOpentaskcount = 0; vOpentaskcount < vOpentaskdetails.length; vOpentaskcount++)
								{

									var vOpentaskitem = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_sku',null,'group');
									var vOpentaskLine = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_line_no',null,'group');

									if(vOpentaskitem==vsoitemId && vOpentaskLine==vsoitemLine)
									{
										vsoitemopentaskQty = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_act_qty',null,'sum');
										break;
									}


								}

								if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
								{
									vsoitemopentaskQty = 0;
								}

								if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
								{
									vsoitemNSReceivedQty = 0;
								}
								if(vsoitemfulfillQty ==null || vsoitemfulfillQty=='' ||vsoitemfulfillQty=='null' || vsoitemfulfillQty=='undefined' )
								{
									vsoitemfulfillQty = 0;
								}
								if(vsoitemNSshippedQty ==null || vsoitemNSshippedQty=='' ||vsoitemNSshippedQty=='null' || vsoitemNSshippedQty=='undefined' )
								{
									vsoitemNSshippedQty = 0;
								}

								if(vConversionRate!=null && vConversionRate!='')
								{
									vsoitemQty=Number(Big(vsoitemQty).div(vConversionRate));
									vsoitemNSReceivedQty=Number(Big(vsoitemNSReceivedQty).div(vConversionRate));
									vsoitemNSshippedQty=Number(Big(vsoitemNSshippedQty).div(vConversionRate));

								}


								var vsoitemRcvQty = Number(Big(vsoitemopentaskQty).plus(vsoitemNSReceivedQty));
								if(vsoitemRcvQty==null || vsoitemRcvQty=='')
									vsoitemRcvQty=0;

								if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
									|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
								{
									var vSoreminqty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));
								}
								else
								{
									vsoitemQty=Big(vsoitemQty);
									vsoitemNSshippedQty=Big(vsoitemNSshippedQty);
									vsoitemRcvQty=Big(vsoitemRcvQty);
									var vSoreminqty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
								}

								if(parseFloat(vSoreminqty)<0)
									vSoreminqty=0;

								vLineLocation=arrSodetails[s].getValue('location');
								if(trantype!="transferorder")
								{
									if(vLineLocation == null || vLineLocation == '')
										vLineLocation=vWhHeadLoc;
								}
								else
								{
									vLineLocation=vWhHeadLoc;
								}
								nlapiLogExecution('DEBUG', 'request.getParameter(hdnActualBeginTime)', request.getParameter('hdnActualBeginTime'));
								var linkURL_1 = '#';
								if(parseFloat(vSoreminqty) > 0)
								{
									var vItemType=arrSodetails[s].getValue('type','item');
									if(vItemType=='kititem')
									{
										usedBins='T';
										checkInURL_1 =	nlapiResolveURL('SUITELET', 'customscript_wmsse_kitorpkg_qtyscan', 'customdeploy_wmsse_kitorpkg_qtyscan');

									}
									else
									{
										checkInURL_1 =	checkInURL_Def;
									}

									if(vItemType=='noninventoryitem' || vItemType=='otherchargeitem' || vItemType=='Service' || vItemType=='serviceitem'
										|| vItemType=='downloaditem' || vItemType=='Download Item' || vItemType=='giftcertificateitem')
									{
										usedBins='T';
									}

									linkURL_1 = checkInURL_1 + '&custparam_lineno=' + vsoitemLine + '&custparam_fetcheditemid=' + vsoitemId + '&custparam_sointernalid=' + soInternalId + '&custparam_rem_qty=' + vSoreminqty + '&custparam_rec_qty=' + vsoitemRcvQty + '&custparam_whlocation=' + vLineLocation  + '&custparam_soid=' + getSONo  + '&custparam_trantype=' + trantype + '&custparam_company=' + whCompany + '&custparam_carton=' + carton + '&custparam_cartonsize=' + cartonSize + '&custparam_cartonweight=' + cartonWeight +'&custparam_cartonscreenrulevalue='+cartonScreenRuleValue +'&custparam_actualbegintime='+ getActualBeginTime +'&custparam_customer='+ customer+'&custparam_pickreportid='+ getPickreportid+'&custparam_uom='+ vUnitsText+'&custparam_conversionrate='+ vConversionRate+'&custparam_ordtype='+ ordType+'&custparam_department='+department+'&custparam_class='+vclass;
								}

								vSoreminqty = parseFloat(parseFloat(vSoreminqty).toFixed(5));
								vsoitemRcvQty = parseFloat(parseFloat(vsoitemRcvQty).toFixed(5));

								html = html + "	<tr class='" + vAltClass + "'>";
								if(linkURL_1 == '#')
									html = html + " <td>"+vsoitem+"</td>";
								else
									html = html +" <td><a name='link1URL_1' class='dottedlink' href='#' onclick='" +
									"return validateItem(\""+usedBins+"\",\""+vsoitemId+"\",\""+vsoitemLine+"\");'> "+vsoitem+"</a></td>";
								if(vUnitsText !=null && vUnitsText !='' && vUnitsText!='null' && vUnitsText !='undefined' && vUnitsText !='- None -')
								{
									html = html +" <td class='align-right'> "+vsoitemRcvQty+" "+vUnitsText+"</td>";
									html = html +" <td class='align-right'> "+vSoreminqty+" "+vUnitsText+"</td>";
								}
								else
								{
									html = html +" <td class='align-right'> "+vsoitemRcvQty+"</td>";
									html = html +" <td  class='align-right'> "+vSoreminqty+"</td>";
								}
								html = html +"</tr>";

							}
							nlapiLogExecution('ERROR', 'itemCount', itemCount);

						}	

					}
					if(parseInt(itemCount)>=5)
						break;	
				}
				var finalLineCount = lineArrayDsb.length;
				nlapiLogExecution('ERROR', 'finalLineCount', finalLineCount);
				var result = finalLineCount-initLineCount;
				if(result<0)
					result = -(result);
				nlapiLogExecution('ERROR', 'result', result);
				lineArrayCountDsb.push((result));
				checkInURL_Def="";
				html = html + "	</table>"+	
				"				<input type='hidden' name='hdngetDisPageCount' value=" + getPageCount + ">"+
				" </td>"+
				" <td>"+
				"				<input type='hidden' name='hdnLineArrayDsb' value=" + lineArrayDsb + ">"+
				" </td>"+
				" <td>"+
				"				<input type='hidden' name='hdnLineArrayCountDsb' value=" + lineArrayCountDsb + ">"+
				" </td>"+
				"</tr>"+
				"</table>";

			}
		}
		//arrSodetails=null;
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

		if(arrSodetails.length > (parseInt(getPageCount)+5))
			//if(parseInt(itemCount)>1)
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>";
		html = html + "</div>";

		html = html + "</form>"+

		"<script type='text/javascript'>document.getElementById('txtItem').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);

	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating SKU/ITEM');

		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var ordType= request.getParameter('hdnOrdtype');
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_shipmethod"] = request.getParameter('hdnShipVia');
		SOarray["custparam_bcComponents"] = request.getParameter('hdncompositebarcode');

		//SOarray["custparam_soitem"] = request.getParameter('txtItem');
		var SOItem = request.getParameter('txtItem');
		if(SOItem == null || SOItem == '' || SOItem == 'null' || SOItem == 'undefined')
		{
			var	SOItemID = request.getParameter('hdnClickedItm');
			var	SOLine = request.getParameter('hdnClickedLine');
			if(SOItemID != null && SOItemID != '' &&  SOItemID  != 'null' && SOItemID != 'undefined')
			{
				var itemfilters=new Array();
				itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',SOItemID));

				if(request.getParameter('hdnWhLocation') != null && request.getParameter('hdnWhLocation') !='' && request.getParameter('hdnWhLocation') != null)
				{
					itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',request.getParameter('hdnWhLocation')]));
				}
				var itemcolumns= new Array();

				var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
				var strItemGrp="";
				var strItemFam="";		
				var blnItemUnit="";
				var VUnitType ="";
				if(itemresults!=null && itemresults!='')
				{

					SOItem = itemresults[0].getValue('itemid');
				}
			}
		}
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		SOarray["custparam_option"] = request.getParameter('hdnOptedField');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');

		SOarray["custparam_sointernalid"] = request.getParameter('hdnSoInternalId');
		var getSOLineNo = request.getParameter('hdnClickedLine');
		var getSOInternalId = request.getParameter('hdnSoInternalId');
		var trantype=request.getParameter('hdntrantype');
		nlapiLogExecution('ERROR', 'trantype', trantype);
		SOarray["custparam_cartonscreenrulevalue"]=request.getParameter('hdncartonScreenRuleValue');
		SOarray["custparam_carton"] =request.getParameter('hdncarton');
		SOarray["custparam_cartonsize"] =request.getParameter('hdncartonSize');
		SOarray["custparam_cartonweight"] =request.getParameter('hdncartonWeight');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

		// For Active Items(Still not received)
		var count = new Array();
		var count1 = request.getParameter('hdngetCountArray');
		nlapiLogExecution('ERROR', 'count1', count1);
		if(count1 != null && count1 != '')
		{
			count = count1.split(',');
		}
		SOarray["custparam_countArray"]=request.getParameter('hdngetCountArray');
		nlapiLogExecution('ERROR', 'SOarray["custparam_countArray"]', SOarray["custparam_countArray"]);

		// For already received items
		var disablecount = new Array();
		var disablecount1 = request.getParameter('hdngetreqarray');

		if(disablecount1 != null && disablecount1 != '')
		{
			disablecount = disablecount1.split(',');
		}
		SOarray["custparam_reqarray"]=request.getParameter('hdngetreqarray');
		//nlapiLogExecution('ERROR', 'SOarray["custparam_reqarray"]', SOarray["custparam_reqarray"]);
		var cnt = disablecount.length;

		var pcIncrement = request.getParameter('hdngetpcincrement');
		if(pcIncrement == null || pcIncrement == '')
		{
			pcIncrement=0;
		}

		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button

		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'Item = ' + SOItem + '<br>';
		logMsg = logMsg + 'custparam_actualbegintime = ' + SOarray["custparam_actualbegintime"] + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - SKU', logMsg);
		var st11,st12,st13,st14,st15,st16;
		if( getLanguage == 'es_ES')
		{
			st11 = "Por favor seleccione Usar contenedores de bandera para este art&#237;culo";
			st12 = "cumplir.";
			st13 = "Por favor, introduzca / elemento de exploraci&#243;n";
			st14 = "Por favor, introduzca / art&#237;culo v&#225;lido escanear";
			st15 = "No hay l&#237;neas de pedidos recuperados para esta SKU";						
		}
		else if( getLanguage == 'fr_FR')
		{
			st11 = "S'il vous pla&#238;t s&#233;lectionnez bacs d'utilisation drapeau pour cet article";
			st12 = "&#224; remplir.";
			st13 = "S'il vous pla&#238;t entrer / Analyse";
			st14 = "S'il vous pla&#238;t entrer / &#233;l&#233;ment valide scanner";
			st15 = "Pas de lignes de commande r&#233;cup&#233;r&#233;es pour cette SKU";						
		}
		else
		{
			st11 = "Please select use bins flag for this item";
			st12 = "to fulfill.";
			st13 = "Please enter/scan item";
			st14 = "Please enter/scan valid item";
			st15 = "No order lines retrieved for this SKU";				
		}
		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){
			var context = nlapiGetContext();
			context.setSessionObject('record', null);


			if(request.getParameter('cmdEnbNextList')=="Next")
			{
				SOarray["custparam_linearray"]=request.getParameter('hdnLineArray');
				SOarray["custparam_linearraycount"]=request.getParameter('hdnLineArrayCount');
				SOarray["custparam_pc"]=parseInt(request.getParameter('hdngetPC'))+5;
				SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetnext'))+1;
				SOarray["custparam_enabledisply"]='block';
				SOarray["custparam_disabledisply"]='none';
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
				return;
			}
			if(request.getParameter('cmdEnbPrevList')=="Prev")
			{
				var lineArray = request.getParameter('hdnLineArray');
				var lineArrayCount = request.getParameter('hdnLineArrayCount');
				lineArray = getFinalArray(lineArray,lineArrayCount);
				lineArrayCount = getFinalArrayCount(lineArrayCount);
				SOarray["custparam_linearray"]=lineArray;
				SOarray["custparam_linearraycount"]=lineArrayCount;
				SOarray["custparam_pc"]=parseInt(request.getParameter('hdngetPC'))-5;
				count.pop();
				count1 = count.join(',');
				SOarray["custparam_countArray"]=count1;
				SOarray["custparam_pagecount"]=count[count.length-1];
				SOarray["custparam_enabledisply"]='block';
				SOarray["custparam_disabledisply"]='none';
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
				return;
			}
			if(request.getParameter('cmdNextList')=="Next")
			{
				SOarray["custparam_linearraydsb"]=request.getParameter('hdnLineArrayDsb');
				SOarray["custparam_linearraycountdsb"]=request.getParameter('hdnLineArrayCountDsb');
				SOarray["custparam_pagecount1"]=parseInt(request.getParameter('hdngetDisPageCount'))+5;
				SOarray["custparam_enabledisply"]='none';
				SOarray["custparam_disabledisply"]='block';
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
				return;
			}
			if(request.getParameter('cmdPrevList')=="Prev")
			{
				var lineArray = request.getParameter('hdnLineArrayDsb');
				var lineArrayCount = request.getParameter('hdnLineArrayCountDsb');
				lineArray = getFinalArray(lineArray,lineArrayCount);
				lineArrayCount = getFinalArrayCount(lineArrayCount);
				SOarray["custparam_linearraydsb"]=lineArray;
				SOarray["custparam_linearraycountdsb"]=lineArrayCount;
				SOarray["custparam_pagecount1"]=parseInt(request.getParameter('hdngetDisPageCount'))-5;
				SOarray["custparam_enabledisply"]='none';
				SOarray["custparam_disabledisply"]='block';
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
				return;
			}


			if (SOItem != "") {

				var filters = new Array();	
				var soid;
				filters.push(new nlobjSearchFilter('tranid', null, 'is', SOarray["custparam_soid"]));	

				var sosearch = nlapiSearchRecord(trantype, 'customsearch_wmsse_transactiondetails', filters, null);
				if(sosearch!=null && sosearch!='')
				{
					soid = sosearch[0].getId();
					nlapiLogExecution('ERROR', 'soid', soid);


					// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
					var crossSubsidiaryFeature=isIntercompanyCrossSubsidiaryFeatureEnabled();

					var currItem = getSKUIdWithName(SOItem, SOarray["custparam_whlocation"], SOarray["custparam_company"],soid);
					if(currItem==null ||  currItem=='')
					{
						nlapiLogExecution('DEBUG', 'Into Bar Code parsing', SOItem);

						var currItem = new Array();

						var barcodecomponents = parsebarcodeoutsidereceiving(SOItem,SOarray["custparam_whlocation"]);
						nlapiLogExecution('DEBUG', 'barcodecomponents', barcodecomponents);		
						if(barcodecomponents != null && barcodecomponents !='' && barcodecomponents !='null')
						{
							nlapiLogExecution('DEBUG', 'barcode error', barcodecomponents["error"]);	

							if(barcodecomponents["error"] == "NoBarcodeFormats")
							{
								SOarray["custparam_error"] = 'Invalid Item/Invalid Bar Code';
								response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
								return;
							}
							if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
							{
								SOarray["custparam_error"] = barcodecomponents["error"];
								response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
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

						nlapiLogExecution('DEBUG', 'Out of Bar Code parsing', SOItem);
					}
					if(currItem!=null && currItem!='')
					{

						var vIntId=currItem[0];
						var VUnitType;
						var vUnits;
						var vItemType;
						var usedBins='';
						var itemTyperesults=nswms_GetItemTypedetails(vIntId,request.getParameter('hdnWhLocation'));
						if(itemTyperesults!=null && itemTyperesults!='')
						{

							vItemType=itemTyperesults[0].recordType;
							VUnitType = itemTyperesults[0].getValue('unitstype');
							vUnits = itemTyperesults[0].getText('stockunit');
							usedBins= itemTyperesults[0].getValue('usebins');
						}
						if(vIntId != null && vIntId != '')
						{



							//var soLineDetails =	getSOLineDetailsItemandqty(SOarray["custparam_sointernalid"], trantype,vIntId,SOarray["custparam_whlocation"],SOLine);

							var soLineDetails =	getSOLineDetailsItemrefactorItem(SOarray["custparam_sointernalid"], trantype,vIntId,SOarray["custparam_whlocation"],SOLine);
							var vBoolFount=false;
							if (soLineDetails != null && soLineDetails != '' && soLineDetails.length != null)
							{
								nlapiLogExecution('ERROR','soLineDetails',soLineDetails.length);
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

								for(var j=0; j<soLineDetails.length; j++)
								{
									var usedBins='';

									var solineno=soLineDetails[j].getValue('line',null,'group');
									var socheckinqty=soLineDetails[j].getValue('quantity');

									var vsoitemQty=soLineDetails[j].getValue(vColumnslist[commitedQtyIndex]);			 
									var vsoitemfulfillQty=soLineDetails[j].getValue(vColumnslist[fulfilledQtyIndex]);
									var vsoitem = soLineDetails[j].getText('item',null,'group');
									var vsoitemId = soLineDetails[j].getValue('item',null,'group');

									if(trantype == 'transferorder' && solineno != null)//adding because of TO line number getting 2 value
										solineno = parseInt(solineno)-1;
									var vsoitemopentaskQty=getopentaskDetailsforItem(SOarray["custparam_sointernalid"],solineno,vsoitemId,SOarray["custparam_whlocation"]);
									var vsoitemErpConfirmedQty=soLineDetails[j].getValue(vColumnslist[ERPConfirmedQty]);
									var vsoitemNSReceivedQty=soLineDetails[j].getValue(vColumnslist[totalNSPickedQtyIndex]);
									if(vsoitemQty == null || vsoitemQty == '')
										vsoitemQty=0;
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
									var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty.minus(vsoitemErpConfirmedQty))));
									nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);


									if(vsoitemRcvQty==null || vsoitemRcvQty=='')
										vsoitemRcvQty=0;




									vsoitemQty=new Big(vsoitemQty);
									vsoitemfulfillQty=new Big(vsoitemfulfillQty);

									var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
									nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);

									if(usedBins=="F" && vItemType!='kititem' && vItemType!='downloaditem' && vItemType!='serviceitem' && 
											vItemType!='noninventoryitem' && vItemType!='giftcertificateitem' && vItemType!='otherchargeitem'  )
									{
										SOarray["custparam_error"] = st11 + " " + currItem[1] + " " + st12;
										response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
										nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
										return;
									}


									if(parseFloat(vSoreminqty)>0)
									{

										if(soLineDetails != null && soLineDetails.length > 0){
											tempflag='T';
											var soInternalId = soLineDetails[j].getValue('internalid',null,'group');
											nlapiLogExecution('ERROR', 'SOInternalId', soInternalId);


											SOarray["custparam_lineno"] = solineno;
											SOarray["custparam_fetcheditemid"] = vIntId;
											SOarray["custparam_sointernalid"] = soInternalId;											
											SOarray["custparam_fetcheditemname"] = currItem[1];											
											SOarray["custparam_rem_qty"] = vSoreminqty;
											SOarray["custparam_rec_qty"] = vsoitemRcvQty;											
											SOarray["custparam_whlocation"] = soLineDetails[j].getValue('location',null,'group');
											//code modified on 06 Apr
											//If Po LineLevel Location(site) is null then choose the location(site) from header value.

											var soLineLevelLoc='';
											if(crossSubsidiaryFeature ==true && trantype=='salesorder')
											{
												soLineLevelLoc=soLineDetails[j].getValue('inventorylocation',null,'group');
											}
											else
											{
												soLineLevelLoc=soLineDetails[j].getValue('location',null,'group');

											}
											var Location =  soLineDetails[j].getValue('location',null,'group');
											if(soLineLevelLoc == null || soLineLevelLoc == '' || soLineLevelLoc == 'null' || soLineLevelLoc == 'undefined')
											{
												SOarray["custparam_error"]= 'Transaction line level location was not configured for scanned item.';
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray); 
												return;
											}
											if(trantype!="transferorder")
											{
												if(soLineLevelLoc!=null && soLineLevelLoc!="")
													SOarray["custparam_whlocation"] = soLineDetails[j].getValue('location',null,'group');
											}
											else
											{										
												SOarray["custparam_whlocation"]= nlapiLookupField(trantype, soInternalId, 'location');
											}
											if(crossSubsidiaryFeature ==true && trantype=='salesorder')
											{
												SOarray["custparam_whlocation"]=soLineDetails[j].getValue('inventorylocation',null,'group');
											}
											var vUnitsText = soLineDetails[j].getText('unit',null,'group');
											var vConversionRate = soLineDetails[j].getValue(vColumnslist[conversionRateIndex]);
											SOarray["custparam_uom"] = vUnitsText;
											SOarray["custparam_conversionrate"] = vConversionRate;

											logMsg = 'PO = ' + soInternalId + '<br>';
											logMsg = logMsg + 'Line = ' + SOarray["custparam_lineno"] + '<br>';
											logMsg = logMsg + 'Fetched Item = ' + SOarray["custparam_fetcheditemid"] + '<br>';
											logMsg = logMsg + 'Location = ' + SOarray["custparam_whlocation"] + '<br>';
											logMsg = logMsg + 'Item Cube = ' + SOarray["custparam_itemcube"];
											nlapiLogExecution('DEBUG', 'Line Details', logMsg);

											if(SOItem != ""){


												var currentUser=getCurrentUser();
												var lockfilters=new Array();
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getSOInternalId));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',solineno));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
												var lockcolumns= new Array();
												//lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_user'));
												//lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_line'));		
												var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

												if(lockresults!=null && lockresults!='')
												{
													var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
													var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
													nlapiLogExecution('ERROR', 'getLockUser', getLockUser);
													nlapiLogExecution('ERROR', 'getLockLine', getLockLine);
													if(getLockUser!=currentUser)
													{
														SOarray["custparam_error"]='The line item is being processed by other user.';
														response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
														return;
													}
													else if(parseInt(getLockLine)!=parseInt(solineno))
													{
														var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
														LockRecord.setFieldValue('name',getSOInternalId);
														LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
														LockRecord.setFieldValue('custrecord_wmsse_order',getSOInternalId);
														LockRecord.setFieldValue('custrecord_wmsse_line',solineno);
														LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
														LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

														var date = new Date();
														var mSecs = date.getTime();
														LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

														var recid = nlapiSubmitRecord(LockRecord);
														LockRecord=null;
														nlapiLogExecution('ERROR', 'Inside else if Record Locked Successfully', recid);
													}
												}
												else
												{
													var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
													LockRecord.setFieldValue('name',getSOInternalId);
													LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
													LockRecord.setFieldValue('custrecord_wmsse_order',getSOInternalId);
													LockRecord.setFieldValue('custrecord_wmsse_line',solineno);
													LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
													LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

													var date = new Date();
													var mSecs = date.getTime();
													LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

													var recid = nlapiSubmitRecord(LockRecord);
													nlapiLogExecution('ERROR', 'Record Locked Successfully', recid);
													LockRecord=null;
												}
												lockresults=null;
												lockcolumns=null;
												lockfilters=null;


												SOarray["custparam_error"]='';
												if(vItemType=='kititem')
												{
													response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_qtyscan', 'customdeploy_wmsse_kitorpkg_qtyscan', false, SOarray);
													return;
												}
												else
												{
													response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan', 'customdeploy_wmsse_soqty_scan', false, SOarray);
													return;
												}



											} else {
												SOarray["custparam_error"]= st13;
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
											}
										}

									}

								}
								soLineDetails=null;
								if(tempflag=='F')
								{
									//SOarray["custparam_error"]= st14;
									SOarray["custparam_error"]='Entered/scanned item is already picked';
									response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
									nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
								}
							}
							else
							{
								SOarray["custparam_error"]= st14;								
								response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
								nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
							}

						}
					}
					else
					{
						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('nameinternal',null,'is',SOItem));
						if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] !='' && SOarray["custparam_whlocation"] != null)
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',SOarray["custparam_whlocation"]]));
						}
						var itemcolumns= new Array();

						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
						nlapiLogExecution('ERROR', 'itemresults', itemresults);
						if(itemresults!=null && itemresults!='')
						{
							if(itemresults[0].getValue('isinactive')=="T")
							{
								SOarray["custparam_error"] = 'Entered item is inactive.';
							}
							else
							{
								SOarray["custparam_error"] = st14;
							}
						}
						else
						{
							SOarray["custparam_error"] = st14;
						}
						response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
						nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
					}
				} else {
					SOarray["custparam_error"]= st15;
					response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
					nlapiLogExecution('ERROR', 'poLineDetails ', 'No order lines retrieved for this SKU');
				}
				sosearch=null;
			}
			else
			{
				SOarray["custparam_error"]= st14;								
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
				nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
			}
		} else {
			if(SOarray["custparam_cartonscreenrulevalue"]!="Y")
			{
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
				return;
			}
			else
			{

				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
				return;
			}
		}

	} //end of first if condition
} //end of function.


function  getSOLineDetailsBasedOnSequence(SONo,trantype,Pickreportid)
{
	var filters = new Array();
	var columns = new Array();
	filters.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', Pickreportid));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof',SONo));
	var columns = new Array();

	var SOLineDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_getpickreport_sequenc', filters, columns);
	nlapiLogExecution('DEBUG', 'SOLineDetails', SOLineDetails);

	return SOLineDetails;
}

function funGetPickReportNo(getSoid){

	nlapiLogExecution('DEBUG', 'getSoid', getSoid);
	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', 'custrecord_wmsse_order_no', 'is', getSoid));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', [9]));


	var PickrepDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_getpickreportdetails', filters, null);

	return PickrepDetails;
}

function getFinalArray(lineArray,lineArrayCount){
	nlapiLogExecution('DEBUG', 'into getFinalArray', lineArray+','+lineArrayCount);
	var a = new Array();
	var b = new Array();
	if(lineArray != null & lineArray != '')
	{
		a=lineArray.split(',');
	}
	if(lineArrayCount != null & lineArrayCount != '')
	{
		b=lineArrayCount.split(',');
	}
	var len = b.length;
	//nlapiLogExecution('ERROR', 'len', len+','+b[len-1]+','+b[len-2]);
	var sum = parseInt(b[len-1])+parseInt(b[len-2]);

	for(var i=0;i<sum;i++)
	{
		a.pop();
	}
	var str = a.join(',');

	return str;
}

function getFinalArrayCount(lineArrayCount){
	nlapiLogExecution('DEBUG', 'into getFinalArrayCount',lineArrayCount);
	var b = new Array();
	if(lineArrayCount != null & lineArrayCount != '')
	{
		b=lineArrayCount.split(',');
	}
	b.pop();
	b.pop();
	var str = b.join(',');
	return str;
}

function getFinalCount(count,getPageCount){
	nlapiLogExecution('DEBUG', 'into getFinalCount ', count+','+getPageCount);
	var k=0;
	for(var i=0;i<count.length;i++)
	{
		if(count[i]==getPageCount)
		{
			k++;
		}
	}
	if(k<1)
	{
		count.push(getPageCount);
	}

	return count;
}
