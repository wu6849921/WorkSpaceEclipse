/**
 * Script Description
 * This script is used for scan location for Bin transfer process
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

/**
 * Main function to scan location for Bin transfer process 
 */
function RFInventoryBTLoc(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		
		var POarray=new Array(); 
		POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		var whLocationName = request.getParameter('custparam_whlocationname');
		
		var getOptedField = request.getParameter('custparam_option');
		
		var domainName = fndomainName();
		
		var st0,st1,st2,st3;

		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-CHECKIN PO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			st0 = domainName + "-INVENTORY LOCATION SCAN";
			st1 = "Enter/Scan Location";
			st2 = "SEND";
			st3 = "PREV";

		}	

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('DEBUG', 'CSSfilefound', CSSfilefound);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('DEBUG', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		var st0=domainName + "-BT Inventory";
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		//var error="Please "+st1;
		//Ends here
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_po');
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() {if(document.getElementById('enterloc').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan location';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_po' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Bin Transfer - Location</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >&nbsp;"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+
		//"			<tr border='1'><td align='center' class='tablecell'  valign='top'><b>RECEIVING</b></td></tr>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterloc'  class='smalltextbox'  id='enterloc' type='text'/>"+
		"				</td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' value=''  class='defaultlink'   onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/>"+
		"			</tr>"+
		"		 </table>"+
		" 	</td></tr></table>"+
		"	</form>"+
		
		"<script type='text/javascript'>document.getElementById('enterloc').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('selectoption');
		var optedEvent = request.getParameter('cmdPrevious');
		var POarray=new Array();
		nlapiLogExecution('DEBUG', 'optedEvent', 'optedEvent');
		
		//var POarray=new Array(); 
		POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

		var getLanguage = request.getParameter('hdngetLanguage');
		POarray["custparam_language"] = getLanguage;
		nlapiLogExecution('DEBUG', 'getLanguage', POarray["custparam_language"]);
		

		/*var context = nlapiGetContext();

		var userAccountId = context.getCompany();*/

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



		
		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('DEBUG', 'PREVIOUS F7 Pressed');
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, POarray);
			return;
		}
		else
		{
			
			var getLoc=request.getParameter('enterloc');
			nlapiLogExecution('DEBUG','getLoc',getLoc);
			var Loctrantypefilters=new Array();
			Loctrantypefilters.push(new nlobjSearchFilter('name',null,'is',getLoc));
			Loctrantypefilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

			var Loctrantypecolumns=new Array();
			Loctrantypecolumns.push(new nlobjSearchColumn('custrecord_wmsse_make_wh_site'));
			//Loctrantypecolumns.push(new nlobjSearchColumn('custrecordcompany'));
			var LocRecinternalids=nlapiSearchRecord('Location','customsearch_wmsse_locsearchresults',Loctrantypefilters,Loctrantypecolumns);
			var locId='';
			var Tomwhsiteflag='F';
			var company='';
			if(LocRecinternalids!=null && LocRecinternalids!='')
			{
				Tomwhsiteflag = LocRecinternalids[0].getValue('custrecord_wmsse_make_wh_site');
				//company = LocRecinternalids[0].getValue('custrecordcompany');
				
				nlapiLogExecution('DEBUG','Tomwhsiteflag',Tomwhsiteflag);
				if(Tomwhsiteflag=='T')
				{
					locId=LocRecinternalids[0].getId();
					POarray["custparam_whlocation"] = locId;
					if(company!=null && company!='')
						POarray["custparam_company"]=company;
					POarray["custparam_whlocationname"] = getLoc;
					LocRecinternalids=null;
					response.sendRedirect('SUITELET', 'customscript_wmsse_bt_item_scan', 'customdeploy_wmsse_bt_item_scan', false, POarray);
					nlapiLogExecution('DEBUG', 'locId ', locId);
					return;
				}
				else
				{
					LocRecinternalids=null;
					POarray["custparam_error"] = "Please enter/scan valid location";
					response.sendRedirect('SUITELET', 'customscript_wmsse_bt_loc_scan', 'customdeploy_wmsse_bt_loc_scan', false, POarray);
					nlapiLogExecution('DEBUG', 'SearchResults ', 'Length is null');
					return;
				}
			}
			else
			{
				POarray["custparam_error"] = "Please enter/scan valid location";
				response.sendRedirect('SUITELET', 'customscript_wmsse_bt_loc_scan', 'customdeploy_wmsse_bt_loc_scan', false, POarray);
				nlapiLogExecution('DEBUG', 'SearchResults ', 'Length is null');
				return;
			}

		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}
