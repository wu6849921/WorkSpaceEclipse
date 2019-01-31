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
function PickingBin(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('DEBUG', 'getOptedField', getOptedField);
		var userAccountId = ctx.getCompany();
		nlapiLogExecution('DEBUG', 'userAccountId', userAccountId);
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-CHECKIN SO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{

			headerVar='Picking Bin Location';
			st0 = domainName + "-Picking";
			st1 = "Enter/Scan Bin Location";
			st2 = "SEND";
			st3 = "PREV";

		}	

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
		CSSfilefound=null;
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
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterbin').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan bin location';return false;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+


		/*"		<tr><td>"+
		"		<table>"+*/
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterbin'  class='smalltextbox'  id='enterbin' type='text'/>"+
		"				</td>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"	<td width='10px'></td><td ></td>"+
		"			</tr><tr ><td ></td></table>"+
		"		<table>	<tr>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='40px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"		 </table>"+
		//" 	</td></tr></table>"+
		"	</form>"+
		"<script type='text/javascript'>document.getElementById('enterbin').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('enterbin');
		var optedEvent = request.getParameter('cmdPrevious');
		var SOarray=new Array();
		nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);
		var getPickreportid=request.getParameter('hdnPickReportId');
		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		nlapiLogExecution('DEBUG', 'getLanguage', SOarray["custparam_language"]); 
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_pickreportid"] =getPickreportid;
		var whlocation = request.getParameter('custparam_whlocation');

		var context = nlapiGetContext();

		var userAccountId = context.getCompany();

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
		SOarray["custparam_enterbin"] = request.getParameter('enterbin');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			SOarray["custparam_error"]='';
			//response.sendRedirect('SUITELET', 'customscript_wmsse_picking_menu', 'customdeploy_wmsse_picking_menu', false, SOarray);
			response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
		}
		else
		{
			var enterBin=request.getParameter('enterbin');
			nlapiLogExecution('DEBUG','getEnterBin',enterBin);
			nlapiLogExecution('DEBUG','whlocation',whlocation);
			if(enterBin!=null && enterBin!='')
				binInternalId=nswms_GetValidBinInternalId(enterBin,SOarray["custparam_whlocation"],'');
				//binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);
			nlapiLogExecution('DEBUG','binInternalId',binInternalId);
			if(binInternalId=='' || binInternalId==null)
			{
				var vValidNonInvtBin=fnValidNonInvtBin(enterBin,getPickreportid);
				
				if(vValidNonInvtBin != null && vValidNonInvtBin != '' && vValidNonInvtBin.length>0)
				{
					SOarray["custparam_enterbinid"] ='';
					SOarray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
					return;
				}	
				else
				{	
				SOarray["custparam_error"] = 'Please enter/scan valid bin location';
				response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
				return;
				}
			}
			if(binInternalId!=null && binInternalId!=''){
				SOarray["custparam_enterbinid"] = binInternalId;
				SOarray["custparam_error"] ='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
				return;
			}
		}
	}
}

function fnValidNonInvtBin(enterBin,getPickreportid)
{
	nlapiLogExecution('DEBUG','enterBin',enterBin);
	nlapiLogExecution('DEBUG','getPickreportid',getPickreportid);
		
	var vValidBin=new Array();
	var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskdetails_srh');
			
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
	 
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_multi_bins', null, 'is', enterBin)); 

	var resLenDetails = OTsearchresult.runSearch();
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		vValidBin = vValidBin.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}
	return vValidBin;
}
	
