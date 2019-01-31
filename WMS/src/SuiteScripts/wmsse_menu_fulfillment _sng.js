/**
 * Script Description
 * This script is used for Fulfillment menu option.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main menu for Fulfillment menu option
 */
function RFFulfillmentMenu(request, response){
	if (request.getMethod() == 'GET') {

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		
		var POarray=new Array(); 
		POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		var whLocationName = request.getParameter('custparam_whlocationname');

		var st0,st1,st2,st3,st4,st5,st6,st7,st8,st9,st10;
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);


		if( getLanguage == 'es_ES' || getLanguage == 'es_AR')
		{
			st0 = domainName + "MEN&#218; PRINCIPAL";
			st1 = "RECEPCI&#211;N";
			st2 = "RECOLECCION";
			st3 = "INVENTARIO";			
			st7 = "SALIR";
			st8 = "INGRESAR SELECCI&#211;N";
			st9 = "ENVIAR";
			st10 = "ANTERIOR";


		}
		else
		{
			st0 = domainName + "-Picking Menu";
			st1 = "1. Sales Order";
			st2 = "2. Transfer Order";			
			/*st4 = "4. Main Menu";	
			st5 = "3. Quick Ship";*/
			st4 = "3. Main Menu";
			st3 = "Enter Selection";

		}

	///	var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan');
		var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng');
		var linkURL_1 = checkInURL_1+"&custparam_trantype=salesorder" + '&custparam_whlocation=' + POarray["custparam_whlocation"] + '&custparam_whlocationname=' + POarray["custparam_whlocationname"]; 
		//var checkInURL_2 = nlapiResolveURL('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan');
		var checkInURL_2 = nlapiResolveURL('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng');
		var linkURL_2 = checkInURL_2+"&custparam_trantype=transferorder" + '&custparam_whlocation=' + POarray["custparam_whlocation"] + '&custparam_whlocationname=' + POarray["custparam_whlocationname"];  

		//var checkInURL_6 = nlapiResolveURL('SUITELET', 'customscript_wmsse_menu_loc_scan', 'customdeploy_wmsse_menu_loc_scan');
		var checkInURL_6 = nlapiResolveURL('SUITELET', 'customscript_wmsse_menu', 'customdeploy_wmsse_menu');
		var linkURL_6 = checkInURL_6 +  '&custparam_whlocation=' + POarray["custparam_whlocation"] + '&custparam_whlocationname=' + POarray["custparam_whlocationname"];
		var checkInURL_7 = nlapiResolveURL('SUITELET', 'customscript_wmsse_rf_quickship', 'customdeploy_wmsse_rf_quickship'); 

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_wmsse_fulfillmentmenu'); 
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";




		html = html + "<script type='text/javascript'>function validateForm() {if(document.getElementById('enteroption').value == ''){document.getElementById('div_error').innerHTML ='Please enter picking option';	return false;}else{var val = document.getElementById('enteroption').value; if( (val<=0) || (val >3) || isNaN(val)){document.getElementById('div_error').innerHTML ='Please enter valid picking option';document.getElementById('enteroption').value = '';return false;}else{return true;}}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_wmsse_fulfillmentmenu'  method='POST' >"+

		"		<table width='100%'  >"+
		"			<tr><td class='tableheading'>Picking Menu</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		//"		<tr><td></td></tr><tr><td></td></tr><tr><td>"+
		"		<table>"+
		//"			<tr><td align='center'></td></tr>"+
		"		<table width='100%'  cellspacing='0' cellpadding='0'><tr class='trlink line' >"+
		"				<td align = 'left'><a href='" + linkURL_1 + "'  style='text-decoration: none'><div style='cursor: pointer;color: #255599;text-decoration: none;'>" + st1+"</div></a>"+
		"				</td>"+
		"			</tr>"+ 
		"			<tr class='trlink line menulinks'>"+		 
		"				<td align = 'left'><a href='"+linkURL_2+"' style='text-decoration: none'><div style='cursor: pointer;color: #255599;text-decoration: none;'>" + st2+"</div></a>"+
		"				</td>"+
		"			</tr> "+
		/*"			<tr class='uir-list-row-tr line uir-list-row-even'>"+		 
		"				<td align = 'left'><a href='"+checkInURL_7+"' style='text-decoration: none'><div style='cursor: pointer;color: #255599;text-decoration: none;'>" + st5+"</div></a>"+
		"				</td>"+
		"			</tr> "+*/
		"			<tr class='trlink line menulinks'>"+		 
		"				<td align = 'left'><a href='"+linkURL_6+"' style='text-decoration: none'><div style='cursor: pointer;color: #255599;text-decoration: none;'>" + st4+"</div></a>"+
		"				</td>"+
		"			</tr> "+
		
/*		"			<tr>"+
		"				<td align = 'left' > "+st3+" "+
		"				</td>"+
		"			</tr>"+	*/		
		"			<tr class='line uir-list-row-odd'>"+
		"				<td align = 'left'><input name='enteroption'  class='smalltextbox'  id='enteroption' type='text' />"+
		"				</td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td ><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm(); '/></td>"+
		"				<td>	<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px' ></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm(); '/></td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				</td>"+
		"			</tr>"+
		"		 </table>"+
		"		 </table>"+
		" 	</td></tr></table>"+
		"	</form>"+	

		"<script type='text/javascript'>document.getElementById('enteroption').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('enteroption');
		var optedEvent= request.getParameter('cmdPrevious');
		var SOarray=new Array(); 

		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;

		nlapiLogExecution('DEBUG', 'getLanguage', SOarray["custparam_language"]);
		
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');


		var st11,st12;
		if( getLanguage == 'es_ES')
		{
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "FulfillMenu";
		}
		else
		{
			st11 = "INVALID OPTION";
			st12 = "FulfillMenu";
		}



		//SOarray["custparam_error"] = st11;
		SOarray["custparam_screenno"] = st12;
		
		if(optedEvent=='Back (F7)')
		{
			SOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_picking_menu', 'customdeploy_wmsse_picking_menu', false, SOarray);
		}
		else
		{
			if (optedField == '1') {
				SOarray["custparam_trantype"] = 'salesorder';
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
				//response.sendRedirect('SUITELET', 'customscript_wmsse_pickreportno_scan', 'customdeploy_wmsse_pickreportno_scan', false, SOarray);
				return;
			}
			else 
				if (optedField == '2') {
					SOarray["custparam_trantype"] = 'transferorder';
					SOarray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
					//response.sendRedirect('SUITELET', 'customscript_wmsse_pickreportno_scan', 'customdeploy_wmsse_pickreportno_scan', false, SOarray);
					return;
				}
				else 
					if (optedField == '3') {
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_menu', 'customdeploy_wmsse_menu', false, SOarray);
//						response.sendRedirect('SUITELET', 'customscript_wmsse_rf_quickship', 'customdeploy_wmsse_rf_quickship', false, SOarray);
						return;
					}
				/*else 
					if (optedField == '4') {
						SOarray["custparam_error"] = '';
						//response.sendRedirect('SUITELET', 'customscript_wmsse_menu_loc_scan', 'customdeploy_wmsse_menu_loc_scan', false, POarray);
						response.sendRedirect('SUITELET', 'customscript_wmsse_menu', 'customdeploy_wmsse_menu', false, SOarray);
						return;
					}*/
				else 
				{
					SOarray["custparam_error"]="Please enter valid picking option";
					response.sendRedirect('SUITELET', 'customscript_wmsse_fulfillmenu_sng', 'customdeploy_wmsse_fulfillmenu_sng', false, SOarray);
				}
		}
		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}
