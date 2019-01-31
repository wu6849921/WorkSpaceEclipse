/**
 * Script Description
 * This script is used to scan carton
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function PickingCartonScan(request, response){
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';

		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getSONo = request.getParameter('custparam_soid');
		nlapiLogExecution('ERROR', 'Into Request', getSONo);
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');
		var getSONo = request.getParameter('custparam_soid');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var cartonScreenRuleValue=request.getParameter('custparam_cartonscreenrulevalue');
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-FULFILLMENT CARTON SCAN';
		var getPreferBin=request.getParameter('custparam_preferbin');
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "SO/TO";

		if(trantype == 'salesorder')
		{
			ordVar = "Sales Order";
		}
		else
		{
			ordVar = "Transfer Order";
		}

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
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

		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('txtcarton').value == '' ){document.getElementById('div_error').innerHTML ='Please Enter/Scan Carton#';return false;}else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		//	html = html + "</head><body>"+
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Fulfillment</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >&nbsp;"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr><tr><td>"+
		"		<table>"+
		//"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+": <label>" + getSONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+	
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdncartonScreenRuleValue' value=" + cartonScreenRuleValue + ">"+
		"				<input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				</td>"+
		
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter Carton#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtcarton'  class='smalltextbox'  id='txtcarton' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter Carton Size"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtcartonsize'  class='smalltextbox'  id='txtcartonsize' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter Carton Weight"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtcartonweight'  class='smalltextbox'  id='txtcartonweight' type='text'/>"+
		"				</td>"+
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";
		html = html + "</td></tr></table></form>"+
		
		"<script type='text/javascript'>document.getElementById('txtcarton').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var enterCarton=request.getParameter('txtcarton');
		var enterCartonSize=request.getParameter('txtcartonsize');
		var enterCartonWeight=request.getParameter('txtcartonweight');
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		SOarray["custparam_option"] = request.getParameter('hdnOptedField');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		SOarray["custparam_sointernalid"] = request.getParameter('hdnSoInternalId');
		SOarray["custparam_cartonscreenrulevalue"]=request.getParameter('hdncartonScreenRuleValue');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		var trantype=request.getParameter('hdntrantype');
		
		var soInternalId=request.getParameter('hdnSoInternalId');
				
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);
		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		
		logMsg = logMsg + 'soInternalId = ' + soInternalId + '<br>';
		
		nlapiLogExecution('ERROR', 'Processing RF - Carton', logMsg);

		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){

			if(enterCarton!=null && enterCarton!="" && enterCarton!='null')
			{

				try{
					var cartonResults=nswms_ValidateCarton(enterCarton,soInternalId,SOarray["custparam_whlocation"]);
					if(cartonResults!=null && cartonResults!='')
					{						
						SOarray["custparam_error"] = 'Invalid Carton#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_socarton_scan', 'customdeploy_wmsse_socarton_scan', false, SOarray);
						return;
					}
					else
					{
						SOarray["custparam_carton"] =enterCarton;
						SOarray["custparam_cartonsize"] =enterCartonSize;
						SOarray["custparam_cartonweight"] =enterCartonWeight;
						response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
					}
				}				
				catch(e)
				{
					nlapiLogExecution('ERROR', 'inside catch exception', e);

					if ( e instanceof nlobjError )
					{
						SOarray["custparam_error"]=e.getDetails();
						nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
					}
					else
					{
						SOarray["custparam_error"]=e.toString();
						nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
					}
					response.sendRedirect('SUITELET', 'customscript_wmsse_socarton_scan', 'customdeploy_wmsse_socarton_scan', false, SOarray);
					return;
				}

			}
			else
			{
				SOarray["custparam_error"] = 'Invalid Carton#';
				response.sendRedirect('SUITELET', 'customscript_wmsse_socarton_scan', 'customdeploy_wmsse_socarton_scan', false, SOarray);
				return;
			}
		} 
		else {
			SOarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
		}
	} //end of first if condition
} //end of function.

function nswms_ValidateCarton(enterCarton,soInternalId,whlocation)
{
	nlapiLogExecution('ERROR', 'soInternalId', soInternalId);
	nlapiLogExecution('ERROR', 'enterCarton', enterCarton);
	nlapiLogExecution('ERROR', 'whlocation', whlocation);
    
	var filters=new Array();
	filters.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no',null,'is',enterCarton));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'noneof', soInternalId));
	if(whlocation!=null && whlocation!='' && whlocation!='')
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null,'anyof', whlocation));
	
	var columns= new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_container_lp_no');
		
	var searchResults= nlapiSearchRecord('customrecord_wmsse_trn_opentask', null, filters, columns);
	nlapiLogExecution('ERROR', 'searchResults', searchResults);
	return searchResults;
}
