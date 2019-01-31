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
		var whCompany= request.getParameter('custparam_company');
		var cartonScreenRuleValue=request.getParameter('custparam_cartonscreenrulevalue');
		var carton=request.getParameter('custparam_carton');
		var cartonSize=request.getParameter('custparam_cartonsize');
		var cartonWeight=request.getParameter('custparam_cartonweight');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		var vShipVia = request.getParameter('custparam_shipmethod');
		var whlocation = request.getParameter('custparam_whlocation');


		var getPageCount = request.getParameter('custparam_pagecount1');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize = 5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);		
		var itemCount=0;
		var enableitemCount=0;

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
		//to get final page count 

		var pickType= request.getParameter('custparam_picktype');

		getActualBeginTime = TimeStamp(); // We are taking timestamp here because we need to populate each line time differently in open task

		// check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
		var crossSubsidiaryFeature=isIntercompanyCrossSubsidiaryFeatureEnabled();

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-FULFILLMENT ITEM SCAN';
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

		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getSONo. = ' + getSONo + '<br>';
		logmsg = logmsg + 'vShipVia. = ' + vShipVia + '<br>';	
		logmsg = logmsg + 'totalPageSizeValue. = ' + totalPageSizeValue + '<br>';		
		logmsg = logmsg + 'CSSfilefound. = ' + CSSfilefound + '<br>';	
		logmsg = logmsg + 'crossSubsidiaryFeature. = ' + crossSubsidiaryFeature + '<br>';	
		nlapiLogExecution('DEBUG', 'Values :', logmsg);

		var ordVar = "SO/TO";

		if(trantype == 'salesorder')
		{
			st0 = domainName + '-SO Picking';
			ordVar = "Sales Order#";
		}
		else
		{
			st0 = domainName + '-TO Picking';
			ordVar = "Transfer Order#";
		}
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();

		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		//This is to fetch url of toggleOff icon
		var enableImgfile='';
		var enableImgUrl='';
		enableImgfile=  getLoadFile('toggleOff.png');
		if(enableImgfile)
		{
			enableImgUrl = enableImgfile.getURL();

		}
		enableImgUrl=enableImgUrl.replace(/&/g,"&amp;");

		//This is to fetch url of toggleOn icon
		var disableImgfile='';
		var disableImgUrl='';
		disableImgfile=  getLoadFile('toggleOn.png');
		if(disableImgfile)
		{
			disableImgUrl = disableImgfile.getURL();

		}
		disableImgUrl=disableImgUrl.replace(/&/g,"&amp;");

		CSSfilefound=null;

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan', 'customdeploy_wmsse_onbarcodescan');

		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_item');
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";

		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' " +
			"type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('txtItem').value == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan item';return false;}else{document.getElementById('loading').style.display = '';" +
		" return true;}}</script>"+
		"	<script type='text/javascript'>function validateItem(usedBins,vsoitem,vsoline) {if(usedBins == 'F'){" +
		"document.getElementById('div_error').innerHTML ='Please select use bins flag for this item ' +vsoitem+ ' to fulfill.';	" +
		"return false;}else{document.getElementById('hdnClickedItm').value = vsoitem;document.getElementById('hdnClickedLine').value = vsoline;" +
		"document.forms['_rf_picking_item'].submit();document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +"	<script type='text/javascript'>function toggleForm(displayDisable) {var val = document.getElementById('hdnnumber').value;" +
		"if(val == '' || val == null){val = 0;}if(parseInt(val)%2 == 0){if(displayDisable=='block'){document.getElementById('enable').style.display='block';" +
		"document.getElementById('disable').style.display='none';}else{document.getElementById('enable').style.display='none';" +
		"document.getElementById('disable').style.display='block';}val = parseInt(val)+1;document.getElementById('hdnnumber').value = val;return false;}" +
		"else{if(displayDisable=='block'){document.getElementById('enable').style.display='none';document.getElementById('disable').style.display='block';}" +
		"else{document.getElementById('enable').style.display='block';document.getElementById('disable').style.display='none';}val = parseInt(val)+1;" +
		"document.getElementById('hdnnumber').value = val;return false;}}</script>";
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
		"				<input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnPickType' value='" +pickType+"'>"+
		"				<input type='hidden' name='hdnClickedItm'  id='hdnClickedItm'>"+
		"				<input type='hidden' name='hdnClickedLine'  id='hdnClickedLine'>"+
		"				<input type='hidden' name='hdnShipVia' id='hdnShipVia' value='" +vShipVia+"'>"+
		"				<input type='hidden' name='hdnnumber' id='hdnnumber' >"+
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
		"			<tr><td></td></tr></table>"+

		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit'  class='defaultlink'    value='' onclick='return validateForm();'/>"+

		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/>" +
		"</td><td width='10px'></td><td>"+
		"			</tr>"+
		"		 </table>";

		var arrSodetails = getSOItemscandetails(getSOInternalId,trantype,whLocation);

		nlapiLogExecution('Debug', 'Time2', TimeStampinSec());
		html = html + "	<div id='enable' style='display:"+displayEnable+";'>";
		if(arrSodetails!=null && arrSodetails!='')
		{
			if(arrSodetails.length>0)
			{
				html = html + "	<br/><table >"+
				"<tr>"+
				"<td style='text-align:right;font-family:Tahoma;font-size:14px;font-weight:normal;color:black;'> Show Completed Items "+
				"			<input type='image' src='"+enableImgUrl+"' height='20px' width='38px' onclick='return toggleForm(\""+displayDisable+"\");' /></td>"+
				"</tr>"+
				" <tr>"+
				" <td>"+
				"	<table style='border-spacing: 0;'>"+
				" <tr class='uir-machine-headerrow' colspan='3'>"+

				"<td><span class='listheader'>Item</span>"+
				" </td>"+		
				" <td class='align-right'>Picked"+
				" </td>"+	
				" <td class='align-right'>Remaining"+
				" </td>"+	
				"</tr>";

				var checkInURL_Def = nlapiResolveURL('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng');

				var soInternalId=arrSodetails[0].getValue('internalid');
				var vWhHeadLoc='';


				var vAltClass='uir-list-row-tr line uir-list-row-even';
				var vColumnslist=arrSodetails[0].getAllColumns();

				var custIndex = 12;
				var commitedQtyIndex = 25;
				var fulfilledQtyIndex = 26;
				var conversionRateIndex=27;
				var totalPickedQtyIndex =7;
				var totalNSPickedQtyIndex =37;
				var ERPConfirmedQty =38;

				var vOpentaskdetails = getPickedqtydetails(getSOInternalId,trantype,whLocation);

				for (var vPagecount = getEnbPageCount; vPagecount < arrSodetails.length; vPagecount++) {
					enableitemCount=parseInt(enableitemCount)+1;


					if(vPagecount%2==1)
						vAltClass='uir-list-row-tr line uir-list-row-even';
					else
						vAltClass='uir-list-row-tr line uir-list-row-odd';
					var usedBins='';
					var vLineLocation='';
					var vItemType='';
					var vUnitType='';
					var vUnits='';
					var vColumnslist=arrSodetails[vPagecount].getAllColumns();
					var vsoitem = arrSodetails[vPagecount].getText('item');
					var vsoitemId = arrSodetails[vPagecount].getValue('item');
					var vsoitemType=arrSodetails[vPagecount].getValue('type','item');

					if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
						|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
					{
						var vsoitemQty=arrSodetails[vPagecount].getValue('quantity');
					}
					else
					{
						var vsoitemQty=arrSodetails[vPagecount].getValue('quantitycommitted');
					}

					var vsoitemfulfillQty=arrSodetails[vPagecount].getValue('quantitypicked');				

					var vsoitemNSReceivedQty=arrSodetails[vPagecount].getValue('quantitypicked');
					var vsoitemNSshippedQty=arrSodetails[vPagecount].getValue('quantityshiprecv');

					var vsoitemLine = arrSodetails[vPagecount].getValue('line');					
					var vUnitsText = arrSodetails[vPagecount].getValue('unit');
					var vConversionRate = arrSodetails[vPagecount].getValue('formulanumeric');




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
						vsoitemQty=new Big(vsoitemQty);
						vsoitemNSshippedQty=new Big(vsoitemNSshippedQty);
						vsoitemRcvQty=new Big(vsoitemRcvQty);
						var vSoreminqty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
					}




					if(parseFloat(vSoreminqty)<0)
						vSoreminqty=0;

					vLineLocation=arrSodetails[vPagecount].getValue('location');
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


					var linkURL_1 = '#';
					if(parseFloat(vSoreminqty) > 0)
					{
						var vItemType=arrSodetails[vPagecount].getValue('type','item');


						if(vItemType=='kititem' || vItemType=='Kit' )
						{
							usedBins='T';
							checkInURL_1 =	nlapiResolveURL('SUITELET', 'customscript_wmsse_kitorpkg_qtyscan_sng', 'customdeploy_wmsse_kitorpkg_qtyscan_sng');

						}
						else
						{
							checkInURL_1 =	checkInURL_Def;
						}

						if(vItemType=='noninventoryitem' || vItemType=='otherchargeitem' || vItemType=='Service' || vItemType=='serviceitem' 
							|| vItemType=='downloaditem' || vItemType=='Download Item' || vItemType=='giftcertificateitem' || vItemType=='NonInvtPart' || vItemType=='OthCharge')
						{
							usedBins='T';
						}



						linkURL_1 = checkInURL_1 + '&custparam_lineno=' + vsoitemLine + '&custparam_fetcheditemid=' + vsoitemId +
						'&custparam_sointernalid=' + soInternalId + '&custparam_rem_qty=' + vSoreminqty + '&custparam_rec_qty=' + 
						vsoitemRcvQty + '&custparam_whlocation=' + vLineLocation  + '&custparam_whlocationname=' + whLocationName  +
						'&custparam_soid=' + getSONo  + '&custparam_trantype=' + trantype + '&custparam_company=' + whCompany + '&custparam_carton=' 
						+ carton + '&custparam_cartonsize=' + cartonSize + '&custparam_cartonweight=' + cartonWeight +'&custparam_cartonscreenrulevalue='+
						cartonScreenRuleValue +'&custparam_actualbegintime='+ getActualBeginTime +'&custparam_customer='+ customer+'&custparam_uom='+
						vUnitsText+'&custparam_conversionrate='+ vConversionRate+'&custparam_ordtype='+ ordType+'&custparam_picktype='+pickType+
						'&custparam_itemCount='+arrSodetails.length;

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
						html = html +" <td  align='right'> "+vSoreminqty+"</td>";
					}
					html = html +"</tr>";

					if(parseInt(enableitemCount)>=5)
					{
						x=vPagecount;
						break;
					}
				}
				checkInURL_Def="";

				var enabledLength=0;

				for (var vSOresults = 0; vSOresults < arrSodetails.length; vSOresults++) {
					var usedBins='';
					var vLineLocation='';
					var vItemType='';
					var vColumnslist=arrSodetails[vSOresults].getAllColumns();
					var vsoitem = arrSodetails[vSOresults].getText('item');
					var vsoitemId = arrSodetails[vSOresults].getValue('item');
					var vsoitemLine = arrSodetails[vSOresults].getValue('line');
					var vsoitemType=arrSodetails[vSOresults].getValue('type','item');

					if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
						|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
					{
						var vsoitemQty=arrSodetails[vSOresults].getValue('quantity');
					}
					else
					{
						var vsoitemQty=arrSodetails[vSOresults].getValue('quantitycommitted');
					}
					
					if(trantype == 'transferorder' && vsoitemLine != null)
						vsoitemLine = parseInt(vsoitemLine)-1;
					//var vsoitemQty=arrSodetails[vSOresults].getValue('qunatity');			 
					var vsoitemfulfillQty=arrSodetails[vSOresults].getValue('quantitypicked');							
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

					var vsoitemNSReceivedQty=arrSodetails[vSOresults].getValue('quantitypicked');					
					var vsoitemLine = arrSodetails[vSOresults].getValue('line');					
					var vUnitsText = arrSodetails[vSOresults].getValue('unit');		
					var vsoitemNSshippedQty=arrSodetails[vSOresults].getValue('quantityshiprecv');

					var vConversionRate = arrSodetails[vSOresults].getValue('formulanumeric');


					if(trantype == 'transferorder' && vsoitemLine != null)
						vsoitemLine = parseInt(vsoitemLine)-1;



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
						vsoitemQty= new Big(vsoitemQty);
						vsoitemNSshippedQty= new Big(vsoitemNSshippedQty);
						vsoitemRcvQty= new Big(vsoitemRcvQty);
						var vSoreminqty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
					}

					if(parseFloat(vSoreminqty)<0)
						vSoreminqty=0;

					if(parseFloat(vSoreminqty) > 0 && parseFloat(vsoitemQty) > 0)
					{
						enabledLength++;
					}
				}
				html = html + "	</table>"+
				"				<input type='hidden' name='hdngetPageCount' value=" + getEnbPageCount + ">"+
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
				"</tr>"+
				"</table>";
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
		if(arrSodetails!=null && arrSodetails!='')
		{
			if(arrSodetails.length>0)
			{
				html = html + "	<br/><table >"+
				"<tr>"+
				"<td style='text-align:right;font-family:Tahoma;font-size:14px;font-weight:normal;color:black;'> Show Completed Items "+
				"			<input type='image' src='"+disableImgUrl+"' height='20px' width='38px' " +
				"onclick='return toggleForm(\""+displayDisable+"\");' /></td>"+
				"</tr>"+
				" <tr>"+
				" <td>"+
				"	<table style='border-spacing: 0;'>"+
				" <tr class='uir-machine-headerrow' colspan='3'>"+

				"<td><span class='listheader'>Item</span>"+
				" </td>"+		
				" <td class='align-right'>Picked"+
				" </td>"+	
				" <td class='align-right'>Remaining"+
				" </td>"+	
				"</tr>";

				var checkInURL_Def = nlapiResolveURL('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng');

				var soInternalId=arrSodetails[0].getValue('internalid',null,'group');
				var vWhHeadLoc=whlocation;


				var vAltClass='uir-list-row-tr line uir-list-row-even';
				var vColumnslist=arrSodetails[0].getAllColumns();

				var custIndex = 12;
				var commitedQtyIndex = 25;
				var fulfilledQtyIndex = 26;
				var conversionRateIndex=27;
				var totalPickedQtyIndex =7;
				var totalNSPickedQtyIndex =37;
				var ERPConfirmedQty =38;



				var vOpentaskdetails = getPickedqtydetails(getSOInternalId,trantype,whLocation);
				for (var vSOrecords = getPageCount; vSOrecords < arrSodetails.length; vSOrecords++) {
					itemCount=parseInt(itemCount)+1;

					if(vSOrecords%2==1)
						vAltClass='uir-list-row-tr line uir-list-row-even';
					else
						vAltClass='uir-list-row-tr line uir-list-row-odd';
					var usedBins='';
					var vLineLocation='';
					var vItemType='';
					var vColumnslist=arrSodetails[vSOrecords].getAllColumns();
					var vsoitem = arrSodetails[vSOrecords].getText('item');
					var vsoitemId = arrSodetails[vSOrecords].getValue('item');
					var vsoitemLine = arrSodetails[vSOrecords].getValue('line');		
					var vsoitemType=arrSodetails[vSOrecords].getValue('type','item');

					if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
						|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
					{
						var vsoitemQty=arrSodetails[vSOrecords].getValue('quantity');
					}
					else
					{
						var vsoitemQty=arrSodetails[vSOrecords].getValue('quantitycommitted');
					}			 
					var vsoitemfulfillQty=arrSodetails[vSOrecords].getValue('quantitypicked');	
					var vsoitemNSshippedQty=arrSodetails[vSOrecords].getValue('quantityshiprecv');
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

					var vsoitemNSReceivedQty=arrSodetails[vSOrecords].getValue('quantitypicked');						

					var vUnitsText = arrSodetails[vSOrecords].getValue('unit');
					var vConversionRate = arrSodetails[vSOrecords].getValue('formulanumeric');
					if(vConversionRate!=null && vConversionRate!='')
					{
						vsoitemQty=Number(Big(vsoitemQty).div(vConversionRate));
						vsoitemNSReceivedQty=Number(Big(vsoitemNSReceivedQty).div(vConversionRate));
						vsoitemNSshippedQty=Number(Big(vsoitemNSshippedQty).div(vConversionRate));
					}

					if(trantype == 'transferorder' && vsoitemLine != null)
						vsoitemLine = parseInt(vsoitemLine)-1;	
					var vItemType=arrSodetails[vSOrecords].getValue('type','item');
					if(vItemType=='kititem' || vItemType=='Kit')
					{
						usedBins='T';
						checkInURL_1 =	nlapiResolveURL('SUITELET', 'customscript_wmsse_kitorpkg_qtyscan_sng', 'customdeploy_wmsse_kitorpkg_qtyscan_sng');

					}
					else
					{
						checkInURL_1 =	checkInURL_Def;
					}
					if(vItemType=='noninventoryitem' || vItemType=='otherchargeitem' || vItemType=='Service' || vItemType=='serviceitem' 
						|| vItemType=='downloaditem' || vItemType=='Download Item' || vItemType=='giftcertificateitem' || vItemType=='NonInvtPart' || vItemType=='OthCharge')

					{
						usedBins='T';
					}
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
					if(vsoitemfulfillQty ==null || vsoitemfulfillQty=='' ||vsoitemfulfillQty=='null' || vsoitemfulfillQty=='undefined' )
					{
						vsoitemfulfillQty = 0;
					}

					if(vsoitemNSshippedQty ==null || vsoitemNSshippedQty=='' ||vsoitemNSshippedQty=='null' || vsoitemNSshippedQty=='undefined' )
					{
						vsoitemNSshippedQty = 0;
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
						vsoitemQty=new Big(vsoitemQty);
						vsoitemNSshippedQty=new Big(vsoitemNSshippedQty);
						vsoitemRcvQty=new Big(vsoitemRcvQty);
						var vSoreminqty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
					}



					if(parseFloat(vSoreminqty)<0)
						vSoreminqty=0;

					vLineLocation=arrSodetails[vSOrecords].getValue('location');
					if(trantype!="transferorder")
					{
						if(vLineLocation == null || vLineLocation == '')
							vLineLocation=vWhHeadLoc;
					}
					else
					{
						vLineLocation=vWhHeadLoc;
					}
					var linkURL_1 = '#';
					if(parseFloat(vSoreminqty) > 0)
					{
						linkURL_1 = checkInURL_1 + '&custparam_lineno=' + vsoitemLine + '&custparam_fetcheditemid=' + vsoitemId + '&custparam_sointernalid=' + soInternalId + '&custparam_rem_qty=' + vSoreminqty + '&custparam_rec_qty=' + vsoitemRcvQty + '&custparam_whlocation=' + vLineLocation  + '&custparam_whlocationname=' + whLocationName  + '&custparam_soid=' + getSONo  + '&custparam_trantype=' + trantype + '&custparam_company=' + whCompany + '&custparam_carton=' + carton + '&custparam_cartonsize=' + cartonSize + '&custparam_cartonweight=' + cartonWeight +'&custparam_cartonscreenrulevalue='+cartonScreenRuleValue +'&custparam_actualbegintime='+ getActualBeginTime +'&custparam_customer='+ customer+'&custparam_uom='+ vUnitsText+'&custparam_conversionrate='+ vConversionRate+'&custparam_ordtype='+ ordType+'&custparam_picktype='+pickType+'&custparam_itemCount='+arrSodetails.length;
					}

					vSoreminqty = parseFloat(parseFloat(vSoreminqty).toFixed(5));
					vsoitemRcvQty = parseFloat(parseFloat(vsoitemRcvQty).toFixed(5));

					html = html + "	<tr class='" + vAltClass + "'>";
					if(linkURL_1 == '#')
						html = html + " <td>"+vsoitem+"</td>";
					else
						html = html +" <td><a name='link1URL_1' class='dottedlink' href='#' " +
						"onclick='return validateItem(\""+usedBins+"\",\""+vsoitemId+"\",\""+vsoitemLine+"\");'> "+vsoitem+"</a></td>";
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

					if(parseInt(itemCount)>=5)
						break;
				}
				checkInURL_Def="";
				html = html + "	</table>"+	
				"				<input type='hidden' name='hdngetDisPageCount' value=" + getPageCount + ">"+
				"				<input type='hidden' name='hdnitemCount' value=" + itemCount + ">"+
				" </td>"+
				"</tr>"+
				"</table>";
			}
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
		if(arrSodetails.length > (parseInt(getPageCount)+5))

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


		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_shipmethod"] = request.getParameter('hdnShipVia');	
		SOarray["custparam_bcComponents"] = request.getParameter('hdncompositebarcode');
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
				// This search returns required results, 4k records fetching not required.
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
		var ordType= request.getParameter('hdnOrdtype');
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		SOarray["custparam_option"] = request.getParameter('hdnOptedField');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		SOarray["custparam_itemCount"] = request.getParameter('hdnitemCount');	
		SOarray["custparam_sointernalid"] = request.getParameter('hdnSoInternalId');
		var getSOLineNo = request.getParameter('hdnClickedLine');		
		var getSOInternalId = request.getParameter('hdnSoInternalId');
		var trantype=request.getParameter('hdntrantype');		
		SOarray["custparam_cartonscreenrulevalue"]=request.getParameter('hdncartonScreenRuleValue');
		SOarray["custparam_carton"] =request.getParameter('hdncarton');
		SOarray["custparam_cartonsize"] =request.getParameter('hdncartonSize');
		SOarray["custparam_cartonweight"] =request.getParameter('hdncartonWeight');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button

		// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
		var crossSubsidiaryFeature=isIntercompanyCrossSubsidiaryFeatureEnabled();

		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'Item = ' + SOItem + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'custparam_actualbegintime = ' + SOarray["custparam_actualbegintime"] + '<br>';
		logMsg = logMsg + 'crossSubsidiaryFeature =' + crossSubsidiaryFeature + '<br>';
		nlapiLogExecution('DEBUG', 'Processing RF - SKU', logMsg);

		// For Active Items(Still not received)
		var count = new Array();
		var count1 = request.getParameter('hdngetCountArray');

		if(count1 != null && count1 != '')
		{
			count = count1.split(',');
		}
		SOarray["custparam_countArray"]=request.getParameter('hdngetCountArray');


		// For already received items
		var disablecount = new Array();
		var disablecount1 = request.getParameter('hdngetreqarray');

		if(disablecount1 != null && disablecount1 != '')
		{
			disablecount = disablecount1.split(',');
		}
		SOarray["custparam_reqarray"]=request.getParameter('hdngetreqarray');

		var cnt = disablecount.length;

		var pcIncrement = request.getParameter('hdngetpcincrement');
		if(pcIncrement == null || pcIncrement == '')
		{
			pcIncrement=0;
		}

		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){
			var context = nlapiGetContext();
			context.setSessionObject('record', null);


			if(request.getParameter('cmdEnbNextList')=="Next")
			{
				SOarray["custparam_pc"]=parseInt(request.getParameter('hdngetPC'))+5;
				SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetnext'))+1;
				SOarray["custparam_enabledisply"]='block';
				SOarray["custparam_disabledisply"]='none';
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
				return;
			}
			if(request.getParameter('cmdEnbPrevList')=="Prev")
			{
				SOarray["custparam_pc"]=parseInt(request.getParameter('hdngetPC'))-5;
				count.pop();
				count1 = count.join(',');
				SOarray["custparam_countArray"]=count1;
				SOarray["custparam_pagecount"]=count[count.length-1];
				SOarray["custparam_enabledisply"]='block';
				SOarray["custparam_disabledisply"]='none';
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
				return;
			}
			if(request.getParameter('cmdNextList')=="Next")
			{
				SOarray["custparam_pagecount1"]=parseInt(request.getParameter('hdngetDisPageCount'))+5;
				SOarray["custparam_enabledisply"]='none';
				SOarray["custparam_disabledisply"]='block';
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
				return;
			}
			if(request.getParameter('cmdPrevList')=="Prev")
			{
				SOarray["custparam_pagecount1"]=parseInt(request.getParameter('hdngetDisPageCount'))-5;
				SOarray["custparam_enabledisply"]='none';
				SOarray["custparam_disabledisply"]='block';
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
				return;
			}

			if (SOItem != "") {

				var filters = new Array();	
				var soid;
				filters.push(new nlobjSearchFilter('tranid', null, 'is', SOarray["custparam_soid"]));	
				// This search returns required results, 4k records fetching not required.
				var sosearch = nlapiSearchRecord(trantype, 'customsearch_wmsse_transactiondetails', filters, null);
				if(sosearch!=null && sosearch!='')
				{
					soid = sosearch[0].getId();

					var currItem = getSKUIdWithName(SOItem, SOarray["custparam_whlocation"], SOarray["custparam_company"],soid);
					if(currItem==null ||  currItem=='')
					{
						nlapiLogExecution('Error', 'Composite Bar Code parsing starts', TimeStampinSec());

						nlapiLogExecution('DEBUG', 'Into Bar Code parsing', SOItem);

						var currItem = new Array();

						var barcodecomponents = parsebarcodeoutsidereceiving(SOItem,SOarray["custparam_whlocation"]);
						nlapiLogExecution('DEBUG', 'barcodecomponents', barcodecomponents);		
						if(barcodecomponents != null && barcodecomponents !='' && barcodecomponents !='null')
						{
							nlapiLogExecution('DEBUG', 'barcode error', barcodecomponents["error"]);	

							if(barcodecomponents["error"] == "NoBarcodeFormats")
							{
								SOarray["custparam_error"] = 'Please enter/scan valid item.';
								response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
								return;
							}
							if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
							{
								SOarray["custparam_error"] = barcodecomponents["error"];
								response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
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
								SOarray["custparam_bcComponents"] = JSON.stringify(barcodecomponents);
								SOarray["custparam_bcqty"]='';
								SOarray["custparam_bcuom"]='';
								SOarray["custparam_bclot"]='';
								SOarray["custparam_bcexpirydate"]='';
								SOarray["custparam_bcserial"]='';

								var logMsg1 = 'vItem =' + vItem + '<br>';
								logMsg1 = logMsg1 + 'vItemIntrid = ' + vItemIntrid + '<br>';
								logMsg1 = logMsg1 + 'vbarcodeQty = ' + vbarcodeQty + '<br>';
								logMsg1 = logMsg1 + 'vbarcodeUOM = ' +vbarcodeUOM+ '<br>';
								logMsg1 = logMsg1 + 'vbarcodeLot = ' + vbarcodeLot + '<br>';
								logMsg1 = logMsg1 + 'vbarcodeLotExpirydate = ' + vbarcodeLotExpirydate + '<br>';
								logMsg1 = logMsg1 + 'vbarcodeSerial = ' + vbarcodeSerial + '<br>';


								nlapiLogExecution('DEBUG', 'Barcode Parsing parameters', logMsg1);

								nlapiLogExecution('Error', 'Composite Bar Code parsing ends', TimeStampinSec());

							}
						}

						nlapiLogExecution('DEBUG', 'Out of Bar Code parsing', SOItem);
					}
					if(currItem!=null && currItem!='')
					{
						// Retrieving item record for validated SKU

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
							var soLineDetails =	getSOLineDetailsItemandqty(SOarray["custparam_sointernalid"], 
									trantype,vIntId,SOarray["custparam_whlocation"],SOLine);

							SOarray["custparam_soresults"]=soLineDetails;
							var vBoolFount=false;
							if (soLineDetails != null && soLineDetails != '' && soLineDetails.length != null)
							{
								var vColumnslist=soLineDetails[0].getAllColumns();

								var custIndex = 12;
								var commitedQtyIndex = 25;
								var fulfilledQtyIndex = 26;
								var conversionRateIndex=27;
								var totalPickedQtyIndex =7;
								var totalNSPickedQtyIndex =37;
								var ERPConfirmedQty =38;
								for(var vSOcolumns=0;vSOcolumns<vColumnslist.length;vSOcolumns++)
								{
									var summaryLabel = vColumnslist[vSOcolumns].getLabel();
									var name =  vColumnslist[vSOcolumns].getName();
									if(summaryLabel == 'Customer Id')
									{
										custIndex = vSOcolumns;
									}
									else if (summaryLabel == 'Committed Quantity')
									{
										commitedQtyIndex = vSOcolumns;
									}
									else if (summaryLabel == 'Fulfilled Quantity' && name == 'formulanumeric')
									{
										fulfilledQtyIndex = vSOcolumns;
									}
									else if (summaryLabel == 'Conversion Rate')
									{
										conversionRateIndex = vSOcolumns;
									}
									else if (summaryLabel == 'Total Picked Quantity')
									{
										totalPickedQtyIndex = vSOcolumns;
									}
									else if (summaryLabel == 'ERPpickedQuantity')
									{
										totalNSPickedQtyIndex = vSOcolumns;
									}
									else if (summaryLabel == 'ERP CONFIRMED QTY')
									{
										ERPConfirmedQty = vSOcolumns;
									}
									else
									{

									}
								}
								for(var vSOdetails=0; vSOdetails<soLineDetails.length; vSOdetails++)
								{

									var solineno=soLineDetails[vSOdetails].getValue('line',null,'group');
									var socheckinqty=soLineDetails[vSOdetails].getValue('quantity');
									var vsoitem = soLineDetails[vSOdetails].getText('item',null,'group');
									var vsoitemId = soLineDetails[vSOdetails].getValue('item',null,'group');

									var vsoitemQty=soLineDetails[vSOdetails].getValue(vColumnslist[commitedQtyIndex]);			 
									var vsoitemfulfillQty=soLineDetails[vSOdetails].getValue(vColumnslist[fulfilledQtyIndex]);

									var vsoitemErpConfirmedQty=soLineDetails[vSOdetails].getValue(vColumnslist[ERPConfirmedQty]);
									var vsoitemNSReceivedQty=soLineDetails[vSOdetails].getValue(vColumnslist[totalNSPickedQtyIndex]);
									if(trantype == 'transferorder' && solineno != null)//adding because of TO line number getting 2 value
										solineno = parseInt(solineno)-1;
									var vsoitemopentaskQty=getopentaskDetailsforItem(SOarray["custparam_sointernalid"],solineno,vsoitemId,
											SOarray["custparam_whlocation"]);

									if(vsoitemQty == null || vsoitemQty == '')
										vsoitemQty=0;
									if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
									{
										vsoitemopentaskQty = 0;
									}
									if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' 
										|| vsoitemErpConfirmedQty=='undefined' )
									{
										vsoitemErpConfirmedQty = 0;
									}
									if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' 
										|| vsoitemNSReceivedQty=='undefined' )
									{
										vsoitemNSReceivedQty = 0;
									}


									vsoitemopentaskQty=new Big(vsoitemopentaskQty);
									vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
									vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
									var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty.minus(vsoitemErpConfirmedQty))));
									//nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);
									if(vsoitemRcvQty==null || vsoitemRcvQty=='')
										vsoitemRcvQty=0;

									vsoitemQty=new Big(vsoitemQty);
									vsoitemfulfillQty=new Big(vsoitemfulfillQty);
									var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
									//nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);

									if(usedBins=="F" && vItemType!='kititem' && vItemType!='Kit' &&  vItemType!='downloaditem' 
										&& vItemType!='serviceitem' && vItemType!='noninventoryitem' && vItemType!='giftcertificateitem' 
											&& vItemType!='otherchargeitem')
									{
										nlapiLogExecution('DEBUG', 'usedBins', usedBins);
										SOarray["custparam_error"] = 'Please select use bins flag for this item '+ currItem[1] +' to fulfill.';
										response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);

										return;
									}


									if(parseFloat(vSoreminqty)>0)
									{

										if(soLineDetails != null && soLineDetails.length > 0){
											tempflag='T';
											var soInternalId = soLineDetails[vSOdetails].getValue('internalid',null,'group');

											SOarray["custparam_lineno"] = solineno;
											SOarray["custparam_fetcheditemid"] = vIntId;
											SOarray["custparam_sointernalid"] = soInternalId;

											SOarray["custparam_fetcheditemname"] = currItem[1];											
											SOarray["custparam_rem_qty"] = vSoreminqty;
											SOarray["custparam_rec_qty"] = vsoitemRcvQty;

											var soLineLevelLoc="";
											if(crossSubsidiaryFeature == true && trantype =="salesorder")
											{
												soLineLevelLoc =  soLineDetails[vSOdetails].getValue('inventorylocation',null,'group');
												SOarray["custparam_whlocation"] = soLineDetails[vSOdetails].getValue('inventorylocation',null,'group');
											}
											else
											{
												soLineLevelLoc =  soLineDetails[vSOdetails].getValue('location',null,'group');
												SOarray["custparam_whlocation"] = soLineDetails[vSOdetails].getValue('location',null,'group');
											}

											if(soLineLevelLoc == null || soLineLevelLoc == '' || soLineLevelLoc == 'null' || soLineLevelLoc == 'undefined')
											{
												SOarray["custparam_error"]= 'Transaction line level location was not configured for scanned item.';
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray); 
												return;
											}

											if(trantype!="transferorder")
											{
												if(soLineLevelLoc!=null && soLineLevelLoc!="")
													SOarray["custparam_whlocation"] = soLineLevelLoc;
											}
											else
											{										
												SOarray["custparam_whlocation"]= nlapiLookupField(trantype, soInternalId, 'location');
											}

											var vUnitsText = soLineDetails[vSOdetails].getText('unit',null,'group');
											var vConversionRate = soLineDetails[vSOdetails].getValue(vColumnslist[conversionRateIndex]);
											SOarray["custparam_uom"] = vUnitsText;
											SOarray["custparam_conversionrate"] = vConversionRate;

											logMsg = 'SO = ' + soInternalId + '<br>';
											logMsg = logMsg + 'Line = ' + SOarray["custparam_lineno"] + '<br>';
											logMsg = logMsg + 'Fetched Item = ' + SOarray["custparam_fetcheditemid"] + '<br>';
											logMsg = logMsg + 'Location = ' + SOarray["custparam_whlocation"] + '<br>';
											logMsg = logMsg + 'Item Cube = ' + SOarray["custparam_itemcube"];
											nlapiLogExecution('DEBUG', 'Line Details', logMsg);

											if(SOItem != ""){

												var getSOLineNo = request.getParameter('hdnClickedLine');
												var getSOInternalId = request.getParameter('hdnSoInternalId');

												var currentUser=getCurrentUser();
												var lockfilters=new Array();
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getSOInternalId));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',solineno));
												lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));

												var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

												if(lockresults!=null && lockresults!='')
												{
													var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
													var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
													//nlapiLogExecution('Debug', 'getLockUser', getLockUser);
													//nlapiLogExecution('Debug', 'getLockLine', getLockLine);
													if(getLockUser!=currentUser)
													{
														SOarray["custparam_error"]='The line item is being processed by other user.';
														response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
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
												if(vItemType=='kititem' || vItemType=='Kit')
												{
													response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_qtyscan_sng', 'customdeploy_wmsse_kitorpkg_qtyscan_sng', false, SOarray);
													return;
												}
												else
												{
													nlapiLogExecution('Error', 'Redirecting to SO Qty Screen', TimeStampinSec());
													response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
													return;
												}



											} else {
												SOarray["custparam_error"]='Please enter/scan item';
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
											}
										}

									}

								} 
								soLineDetails=null;
								if(tempflag=='F')
								{
									SOarray["custparam_error"]='Entered/scanned item is already picked';
									response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
									nlapiLogExecution('DEBUG', 'itemRecord', 'Invalid Item Specified');
								}
							}
							else
							{
								SOarray["custparam_error"]='Please enter/scan valid item';
								response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
								nlapiLogExecution('DEBUG', 'itemRecord', 'Invalid Item Specified');
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
						// This search returns required results, 4k records fetching not required.
						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);

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
						response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
						nlapiLogExecution('DEBUG', 'itemRecord', 'Invalid Item Specified');
					}
				} else {
					SOarray["custparam_error"]='No order lines retrieved for this sku';
					response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
					nlapiLogExecution('DEBUG', 'poLineDetails ', 'No order lines retrieved for this SKU');
				}
				sosearch=null;
			}
			else
			{
				SOarray["custparam_error"]='Please enter/scan valid item';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
				nlapiLogExecution('DEBUG', 'itemRecord', 'Invalid Item Specified');
			}

		} 
		else {
			if(SOarray["custparam_picktype"]=='custom')
			{
				var resArr = getCustomScriptId(2);
				if(resArr.length > 0)
				{
					SOarray["custparam_error"]='';
					response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
					return;
				}
				else
				{
					SOarray["custparam_error"]="Custom flow not defined for this process";
					response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
					return;
				}
			}
			else  if(SOarray["custparam_cartonscreenrulevalue"]!="Y")
			{
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
				return;
			}
			else
			{

				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
				return;
			}
		}
	} //end of first if condition
} //end of function.


/**
 * This function is to calculate final page count
 * @param count
 * @param getPageCount
 * @returns count
 */
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
