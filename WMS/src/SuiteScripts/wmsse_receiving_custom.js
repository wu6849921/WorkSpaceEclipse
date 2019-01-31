/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 
 ****************************************************************************/

function StageScan(request, response)
{
	if (request.getMethod() == 'GET') {
	/*var context = nlapiGetContext();

	var sessionobj = context.getSessionObject('session');

	var user=context.getUser();

	if (request.getMethod() == 'GET') 

	{
		 
		 

		var html = "<html><body>'Hello world!!!'</body></html>";

		response.write(html);
	}*/
	var ctx = nlapiGetContext();
	var getLanguage = ctx.getPreference('LANGUAGE');

	nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);

	var POarray=new Array(); 
	POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
	POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
	 
	var CSSurl='';
	var CSSfilefound = getLoadFile('NS_common.css');
	nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);

	if (CSSfilefound) 
	{ 

		CSSurl = CSSfilefound.getURL();
		nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

	}
	url=CSSurl.replace(/&/g,"&amp;");
	CSSfilefound=null; 
	  
	var domainName = fndomainName();
	nlapiLogExecution('Error', 'domainName', domainName);
	var st0=domainName + "-Custom Receiving";
	var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
	"<html><head><title>" + st0 + "</title>"+
	"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
	"<meta name='HandheldFriendly' content='true' />"+
	"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
	if(CSSurl != null && CSSurl != '')
		html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
	else
		html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";
 
	html = html +" </head><body>";
	 
	html = html +"	<form name='_rf_wmsse_mainmenu' method='POST'>"+

	"		<table width='100%'>"+
	"			<tr><td class='tableheading'>Custom Receiving screen</td></tr>"+
	"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' ></div></td></tr>"+
	//"		<tr><td></td></tr><tr><td></td></tr><tr><td>"+
	"		<table><tr></tr>"+ 
	"		 </table>"+
	"			<table><tr><td></td><td></td><td></td></tr>"+
	"			<tr>"+ 
	" 			<input type='submit' class='defaultlink' name='cmdSend1' value='' '/> "+
	"					<td><input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
	"				</td><td width='20px'></td>"+
	"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)'/> </td>"+
	"			</tr>"+
	" 	</td></tr></table>"+
	"	</form>"+	 
	 
	"</body>"+
	"</html>";

	response.write(html);
		 
}
else {
	var optedEvent = request.getParameter('cmdPrevious');
	var POarray=new Array(); 
	POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
	POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
	if(optedEvent == 'Back (F7)'){
		POarray["custparam_error"]='';
		response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
		 
		return;

	}
}
}