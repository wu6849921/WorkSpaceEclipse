/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function RFWorkordermenu(request, response){
	var processType = getSystemRuleProcessType(
			'Use custom RF menu items?',request.getParameter('custparam_whlocation'),'4');
	if (request.getMethod() == 'GET') {
		var POarray=new Array();
		try
		{
			var ctx = nlapiGetContext();
			var getLanguage = ctx.getPreference('LANGUAGE');

			nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
			var domainName = fndomainName();
			nlapiLogExecution('Error', 'domainName', domainName);

			var st0,st1,st2,st3,st4,st5,st6,st7,st8,st9,st10;
 
			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
			var whLocationName = request.getParameter('custparam_whlocationname');
			var whLocation = request.getParameter('custparam_whlocation');
			var resArr = new Array();
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

				st0 = domainName + "-Work Order";
				st1 = "1. Picking";
				st2 = "2. Build Assembly";	


				var customURL_6 ='';
				var CustomlinkURL_6 = '';

				if((processType == 'Work orders') || (processType == 'All'))
				{
					st5= "3. Custom";
					st4 = "4. Main Menu";	

				}
				else
				{
					st4 = "3. Main Menu";	
				}

				st3 = "Enter Selection";

			}

			var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_wo_scan',
			'customdeploy_wmsse_wo_scan');
			var linkURL_1 = checkInURL_1+"&custparam_trantype=workorder"  +
			'&custparam_whlocation=' + POarray["custparam_whlocation"] + 
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"]; 
			var checkInURL_2 = nlapiResolveURL('SUITELET', 'customscript_wmsse_assembly_woscan',
			'customdeploy_wmsse_assembly_woscan');
			var linkURL_2 = checkInURL_2+"&custparam_trantype=assemblybuild" + 
			'&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];  
			var checkInURL_6 = nlapiResolveURL('SUITELET', 'customscript_wmsse_menu', 
			'customdeploy_wmsse_menu');
			var linkURL_6 = checkInURL_6 +  '&custparam_whlocation=' +
			POarray["custparam_whlocation"] + '&custparam_whlocationname=' +
			POarray["custparam_whlocationname"];

			var errMsg='';
			if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
			{
				errMsg = request.getParameter('custparam_error');
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

			try
			{
				//fetching wms logo url.
				var imgfilefound='';
				var imgUrl='';
				var logoimage = getLogoimage()
				nlapiLogExecution('ERROR', 'logoimage', logoimage); 
				imgfilefound=  getLoadFile(logoimage);
				if(imgfilefound)
				{
					imgUrl = imgfilefound.getURL();
					nlapiLogExecution('ERROR', 'imgUrl', imgUrl);
				}
				imgUrl=imgUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'WMSLogo.svg', 'not available');
			}

			try
			{
				//fetching main menu icon url.
				var mainmenufile='';
				var mainmenuUrl='';
				mainmenufile=  getLoadFile('MainMenu_35.png');
				if(mainmenufile)
				{
					mainmenuUrl = mainmenufile.getURL();
					nlapiLogExecution('ERROR', 'mainmenuUrl', mainmenuUrl);
				}
				mainmenuUrl=mainmenuUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'MainMenu_35.png', 'not available');
			}

			try
			{
				//fetching custom icon url.
				var customfile='';
				var customUrl='';
				customfile=  getLoadFile('Custom.png');
				if(customfile)
				{
					customUrl = customfile.getURL();
					nlapiLogExecution('ERROR', 'customUrl', customUrl);
				}
				customUrl=customUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'Custom.png', 'not available');
			}

			try
			{
				//fetching exit icon url.
				var exitfile='';
				var exitUrl='';
				exitfile=  getLoadFile('Exit.png');
				if(exitfile)
				{
					exitUrl = exitfile.getURL();
					nlapiLogExecution('ERROR', 'exitUrl', exitUrl);
				}
				exitUrl=exitUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'Exit.png', 'not available');
			}

			try
			{
				//fetching workorder icon url.
				var workordersfile='';
				var workordersUrl='';
				workordersfile=  getLoadFile('WorkOrders_35a.png');
				if(workordersfile)
				{
					workordersUrl = workordersfile.getURL();
					nlapiLogExecution('ERROR', 'workordersUrl', workordersUrl);
				}
				workordersUrl=workordersUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'WorkOrders_35a.png', 'not available');
			}

			try
			{
				//fetching picking icon url.
				var pickingwofile='';
				var pickingwoUrl='';
				pickingwofile=  getLoadFile('WorkOrderPicking.png');
				if(pickingwofile)
				{
					pickingwoUrl = pickingwofile.getURL();
					nlapiLogExecution('ERROR', 'pickingwoUrl', pickingwoUrl);
				}
				pickingwoUrl=pickingwoUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'WorkOrderPicking.png', 'not available');
			}

			try
			{
				//fetching assemblybuild icon url.
				var buildassemblyfile='';
				var buildassemblyUrl='';
				buildassemblyfile=  getLoadFile('BuildAssembly.png');
				if(buildassemblyfile)
				{
					buildassemblyUrl = buildassemblyfile.getURL();
					nlapiLogExecution('ERROR', 'buildassemblyUrl', buildassemblyUrl);
				}
				buildassemblyUrl=buildassemblyUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'BuildAssembly.png', 'not available');
			}


			var functionkeyHtml=getFunctionkeyScriptSE('_rf_wmsse_fulfillmentmenu');
			var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN'" +
			" 'http://www.w3.org/TR/html4/strict.dtd'>" +
			"<html><head><title>" + st0 + "</title>"+
			"<meta name='viewport' " +
			"content='width=device-width, height=device-height, initial-scale=1.0'>"+
			"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
			if(CSSurl != null && CSSurl != '')
			{
				html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
			}
			else
			{
				html = html + "<link href='" +
				nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";
			}

			html = html + "<link rel='stylesheet'" +
			" href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'>";
			html = html + " <script" +
			" src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'></script>";
			html = html + "<script " +
			"src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'></script>";
			html = html + "<script type='text/javascript'>function validateLink() {" +
			"document.getElementById('hdnoptedfield').value=3;" +
			"document.forms['_rf_wmsse_fulfillmentmenu'].submit();return true;}" +
			"</script>";
			html = html +functionkeyHtml;
			html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
			html = html +"	<form name='_rf_wmsse_fulfillmentmenu'  method='POST' >"+

			"		<table width='100%'  >"+
			"			<tr class='tableheading'><td align = 'left'>&nbsp&nbsp&nbsp" +
			"<img src='"+imgUrl+"' alt='NS WMS' style='width:170px;height:24px'></img></td></tr>"+
			"			<tr bgcolor='#D6EAF8'><td align = 'left'>&nbsp&nbsp&nbsp" +
			"<img src='"+workordersUrl+"' alt='Picking Menu' style='height:35px;width:30px;'></img>" +
			"&nbsp&nbsp<font size='4' color='#34495E'><b>WORK ORDERS</b></font></td></tr>"+
			"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >" +
			" "+errMsg+"</div></td></tr></table>"+		
			"		<table width='100%' class='table table-bordered ' ><tbody><tr>"+
			"				<td align = 'center'>" +
			"<a href='" + linkURL_1 + "'  style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+pickingwoUrl+"' alt='PICKING' style='height:50px;width:50px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>" +
			"&nbsp&nbsp&nbspPICKING&nbsp&nbsp&nbsp</font></div></a>"+
			"				</td>"+			 
			"				<td align = 'center'>" +
			"<a href='"+linkURL_2+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+buildassemblyUrl+"' alt='PICKING' style='height:50px;width:50px;'></img>" +
			"<br/><br/>&nbsp&nbsp" +
			"<font size='2' color='#34495E'>BUILD <br/>" +
			"&nbsp&nbsp&nbsp&nbspASSEMBLY&nbsp&nbsp</font></div></a>"+
			"				</td>";	
			if((processType == 'Work orders') || (processType == 'All'))
			{			 
				html = html +	"				<td align = 'center'>" +
				"<a href='#' style='text-decoration: none;' " +
				" onclick='return validateLink();'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+customUrl+"' alt='CUSTOM' style='height:50px;width:50px;'></img>" +
				"<br/><br/>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<font size='2' color='#34495E'>CUSTOM</font></div>" +
				"</a>"+
				"				</td>"+
				"			</tr> ";
				html = html + "			<tr>"+		 	 
				"				<td align = 'center'>" +
				"<a href='"+linkURL_6+"' style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+mainmenuUrl+"' alt='MAIN MENU' style='height:50px;width:50px;'>" +
				"</img><br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>MAIN&nbspMENU</font>" +
				"</div></a>"+
				"				</td>"+
				"				<td align='center'>" +
				"<a href='/pages/nllogoutnoback.jsp' style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+exitUrl+"' alt='Exit' style='height:50px;width:50px;'></img><br/><br/>" +
				"&nbsp&nbsp<font size='2' color='#34495E'>EXIT</font></div></a>"+
				"				</td>"+
				"			</tr></tbody></table> ";
			}else{

				html = html +	"				<td align = 'center'>" +
				"<a href='"+linkURL_6+"' style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+mainmenuUrl+"' alt='MAIN MENU' style='height:50px;width:50px;'>" +
				"</img><br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>MAIN&nbspMENU" +
				"</font></div></a>"+
				"				</td>"+
				"			</tr> ";
				html = html + "			<tr>"+
				"				<td align='center'><a href='/pages/nllogoutnoback.jsp'" +
				" style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+exitUrl+"' alt='Exit' style='height:50px;width:50px;'></img><br/><br/>" +
				"&nbsp&nbsp<font size='2' color='#34495E'>EXIT</font></div></a>"+
				"				</td>"+
				"			</tr></tbody></table> ";
			}		
			html = html + "			<table><tr>"+
			"				<td align = 'left'>"+
			"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
			"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
			"				<input type='hidden' name='hdnWhLocation' value='" + whLocation + "'>"+
			"				<input type='hidden' name='hdnoptedfield' id='hdnoptedfield' >"+
			"				</td>"+
			"			</tr>"+	
			"		 </table>"+		
			"	</form>"+	
			"</body>"+
			"</html>";
			response.write(html);
		}
		catch(e)
		{
			POarray["custparam_error"]=e.toString();
			nlapiLogExecution('DEBUG', 'Into Catch', e.toString());
			response.sendRedirect('SUITELET', 'customscript_wmsse_menu',
					'customdeploy_wmsse_menu', false, POarray);
			return;
		}
	}
	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('hdnoptedfield');		
		var WOarray=new Array(); 

		try
		{
			var getLanguage = request.getParameter('hdngetLanguage');
			WOarray["custparam_language"] = getLanguage;
			WOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

			nlapiLogExecution('DEBUG', 'getLanguage', WOarray["custparam_language"]);


			var st11,st12;
			if( getLanguage == 'es_ES')
			{
				st11 = "OPCI&#211;N V&#193;LIDA";
				st12 = "FulfillMenu";
			}
			else
			{
				st11 = "Invalid Option";
				st12 = "FulfillMenu";
			}

			var processType = getSystemRuleProcessType(
					'Use custom RF menu items?',request.getParameter('custparam_whlocation'),'4');
			WOarray["custparam_error"] = '';


			//This function executes when custom option is clicked
			if (optedField != null && optedField != '' && optedField != 'null' &&
					optedField != 'undefined' && 
					optedField == '3'  && (( processType == 'Work orders') || (processType == 'All'))) {
				var resArr = getCustomScriptId(4);
				nlapiLogExecution('DEBUG', 'resArr', resArr);
				if(resArr.length > 0)
				{
					WOarray["custparam_error"]='';
					WOarray["custparam_backlnk"]='Work orders';
					WOarray["custparam_picktype"] ='custom';
					response.sendRedirect('SUITELET', resArr[0], resArr[1],false,WOarray); 
				}
				else
				{
					nlapiLogExecution('DEBUG', 'resArr', resArr);
					WOarray["custparam_error"]="Custom flow not defined for this process";
					response.sendRedirect('SUITELET', 'customscript_wmsse_wo_menu', 
							'customdeploy_wmsse_wo_menu', false, WOarray);
					return;
				}
			}
		}
		catch(e)
		{
			WOarray["custparam_error"]=e.toString();
			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_menu', 
					'customdeploy_wmsse_wo_menu', false, WOarray);
			return;
		}

	}
}
