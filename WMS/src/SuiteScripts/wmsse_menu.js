/**
 * Script Description
 * This script is for Main menu option.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ****************************************************************************/
/**
 * Main function for RF Main menu
 */
function RFMainMenu(request, response){
	if (request.getMethod() == 'GET') {
		
		var POarray=new Array(); 
		try
		{
			var ctx = nlapiGetContext();
			var getLanguage = ctx.getPreference('LANGUAGE');

			nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);

			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
			var whLocationName = request.getParameter('custparam_whlocationname');
			var whLocation = request.getParameter('custparam_whlocation');

			nlapiLogExecution('Error', 'whLocation', whLocation);

			whLocationName = nlapiLookupField('location', whLocation, 'name');


			var processType = getSystemRuleProcessType('Use custom RF menu items?',
					request.getParameter('custparam_whlocation'),'5');
			nlapiLogExecution('Error', 'processType', processType);
			var domainName = fndomainName();
			nlapiLogExecution('Error', 'domainName', domainName);
			var st0,st1,st2,st3,st4,st5,st6,st7,st8,st9,st10;

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
				st0 = domainName + "-Main Menu";
				st1 = "1. Receiving";
				st2 = "2. Picking";
				st3 = "3. Inventory";
				st4 = "4. Work Orders";			
				st5 = "5. Warehouse Location";
				if((processType == 'Main Menu') ||(processType == 'All') )	 
				{
					st11= "6. Custom";
					st7 = "7. Exit";
				}
				else
				{
					st7 = "6. Exit";
				}

				st8 = "ENTER SELECTION";
				st9 = "SEND";
				st10 = "PREV";
			}

			nlapiLogExecution('Error', 'st0', st0);
			
			var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_receivingmenu',
			'customdeploy_wmsse_receivingmenu');
			var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];
			var checkInURL_2 = nlapiResolveURL('SUITELET', 'customscript_wmsse_picking_menu',
			'customdeploy_wmsse_picking_menu');
			var linkURL_2 = checkInURL_2 + '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"]; 
			var checkInURL_3 = nlapiResolveURL('SUITELET', 'customscript_wmsse_inventorymenu',
			'customdeploy_wmsse_inventorymenu');
			var linkURL_3 = checkInURL_3 + '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"]; 
			var checkInURL_4 = nlapiResolveURL('SUITELET', 'customscript_wmsse_wo_menu', 
			'customdeploy_wmsse_wo_menu');
			var linkURL_4 = checkInURL_4 + '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"]; 
			var checkInURL_5 = nlapiResolveURL('SUITELET', 'customscript_wmsse_menu_loc_scan',
			'customdeploy_wmsse_menu_loc_scan'); 

			var errMsg='';
			if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
			{
				var errMsg = request.getParameter('custparam_error');
			}
			nlapiLogExecution('ERROR', 'Before');
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

			try
			{
				//fetching wms  logo url.
				var imgfilefound='';
				var imgUrl='';
				
				var logoimage = getLogoimage()
				nlapiLogExecution('ERROR', 'logoimage', logoimage); 
				//imgfilefound=  getLoadFile('WMSLogo.svg');
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
				//fetching receiving icon url.
				var receivingfile='';
				var receivingUrl='';
				receivingfile=  getLoadFile('Receiving_35a.png');
				if(receivingfile)
				{
					receivingUrl = receivingfile.getURL();
					nlapiLogExecution('ERROR', 'mainmenuUrl', receivingUrl);
				}
				receivingUrl=receivingUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'Receiving_35a.png', 'not available');
			}

			try
			{
				//fetching picking icon url.
				var pickingfile='';
				var pickingUrl='';
				pickingfile=  getLoadFile('Picking_35a.png');
				if(pickingfile)
				{
					pickingUrl = pickingfile.getURL();
					nlapiLogExecution('ERROR', 'pickingUrl', pickingUrl);
				}
				pickingUrl=pickingUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'Picking_35a.png', 'not available');
			}

			try
			{
				//fetching inventory icon url.		
				var inventoryfile='';
				var inventoryUrl='';
				inventoryfile=  getLoadFile('Inventory_35a.png');
				if(inventoryfile)
				{
					inventoryUrl = inventoryfile.getURL();
					nlapiLogExecution('ERROR', 'inventoryUrl', inventoryUrl);
				}
				inventoryUrl=inventoryUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'Inventory_35a.png', 'not available');
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
				//fetching warehouselocation  icon url.
				var whlocationfile='';
				var whlocationUrl='';
				whlocationfile=  getLoadFile('WarehouseLocations_35.png');
				if(whlocationfile)
				{
					whlocationUrl = whlocationfile.getURL();
					nlapiLogExecution('ERROR', 'whlocationUrl', whlocationUrl);
				}
				whlocationUrl=whlocationUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'WarehouseLocations_35.png', 'not available');
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


			var functionkeyHtml=getFunctionkeyScriptSE('_rf_wmsse_mainmenu'); 
			var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' " +
			"'http://www.w3.org/TR/html4/strict.dtd'>" +
			"<html><head><title>"+st0+"</title>"+
			"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
			"<meta name='HandheldFriendly' content='true' />"+
			"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
			if(CSSurl != null && CSSurl != '')
			{
				html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
			}			
			else
			{
				html = html + "<link href='" + nlapiEscapeXML("" +
				"https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "'" +
				" type='text/css' rel='stylesheet'>";
			}

			html = html + "<link rel='stylesheet' href='" +
			"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'>";
			html = html + " <script src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'>" +
			"</script>";
			html = html + "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'>" +
			"</script>";

			html = html + "<script type='text/javascript'>function validateLink() {" +
			"document.getElementById('hdnoptedfield').value=6;" +
			"document.forms['_rf_wmsse_mainmenu'].submit();return true;}</script>";
			html = html +functionkeyHtml;
			html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";

			html = html +"	<form name='_rf_wmsse_mainmenu' method='POST'>"+

			"		<table width='100%'>"+
			"			<tr class='tableheading'><td align = 'left'>&nbsp&nbsp&nbsp" +
			"<img src='"+imgUrl+"' alt='NS WMS' style='width:170px;height:24px'></img></td></tr>"+

			"			<tr bgcolor='#D6EAF8'><td align = 'left'>" +
			"&nbsp&nbsp&nbsp<img src='"+mainmenuUrl+"' alt='Main Menu' style='height:50px;width:50px;'></img>" +
			"&nbsp&nbsp<font size='4' color='#34495E'><b>MAIN&nbspMENU</b></font></td></tr>"+

			"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >" +
			""+errMsg+"</div></td></tr></table>"+	 
			"		<table width='100%' class='table table-bordered ' ><tbody><tr>"+
			"				<td align='center' class='tdlink line'><a href='" + linkURL_1 + "'" +
			"  style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+receivingUrl+"' alt='Receiving' ></img><br/><br/>&nbsp&nbsp" +
			"<font size='2' color='#34495E'>RECEIVING</font></div></a></a>"+
			"				</td>"+		 
			"				<td align='center'><a href='"+linkURL_2+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+pickingUrl+"' alt='Picking' ></img><br/><br/>" +
			"<font size='2' color='#34495E'>PICKING</font></div></a></a>"+
			"				</td>"+			 
			"				<td align='center'>" +
			"<a href='" + linkURL_3 + "' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+inventoryUrl+"' alt='Inventory' ></img><br/><br/>&nbsp&nbsp" +
			"<font size='2' color='#34495E'>INVENTORY</font></div></a></a>"+
			"				</td>"+
			"			</tr>"+ 
			"			<tr>"+		 
			"				<td align='center'><a href='" + linkURL_4 + "' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+workordersUrl+"' alt='Work Orders' ></img><br/><br/>" +
			"<font size='2' color='#34495E'>WORK ORDERS</font></div></a></a>"+
			"				</td>"+			 
			"				<td align='center'><a href='" + checkInURL_5 + "' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+whlocationUrl+"' alt='Ware House Location' ></img><br/><br/>&nbsp&nbsp" +
			"<font size='2' color='#34495E'>WAREHOUSE<br/> LOCATION</font></div></a></a>"+
			"				</td>";

			if((processType == 'Main Menu') || (processType == 'All'))		
			{					 
				html = html +	"				<td align='center'>" +
				"<a href='#' style='text-decoration: none;' onclick='return validateLink();'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+customUrl+"' alt='Custom' style='height:35px;width:35px;'></img>" +
				"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>CUSTOM</font></div></a>"+
				"				</td>"+
				"			</tr><tr> ";
				html = html +	"				<td align='center'>" +
				"<a href='/pages/nllogoutnoback.jsp' style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+exitUrl+"' alt='Exit' style='height:35px;width:35px;'></img><br/><br/>" +
				"&nbsp&nbsp<font size='2' color='#34495E'>EXIT</font></div></a>"+
				"				</td></tr></tbody>";
			}else{		

				html = html +	"				<td align='center'><a href='/pages/nllogoutnoback.jsp' " +
				"style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+exitUrl+"' alt='Exit' style='height:35px;width:35px;'></img><br/><br/>" +
				"&nbsp&nbsp<font size='2' color='#34495E'>EXIT</font></div></a>"+
				"				</td></tr></tbody>";
			}		
			html=html+"			</table>"+
			"			<table><tr>"+
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_menu_loc_scan',
					'customdeploy_wmsse_menu_loc_scan', false, POarray);
			return;
		}
	}
	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField =request.getParameter('hdnoptedfield');
		var POarray=new Array();
		try
		{ 		
			var processType = getSystemRuleProcessType(
					'Use custom RF menu items?',request.getParameter('custparam_whlocation'),'5');
			var getLanguage = request.getParameter('hdngetLanguage');
			POarray["custparam_language"] = getLanguage;
			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

			nlapiLogExecution('ERROR', 'optedField', optedField);
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

			//This function executes when custom option is clicked
			if (optedField != null && optedField != '' && optedField != 'null' &&
					optedField != 'undefined' && optedField == '6'  && ((processType == 'Main Menu')
							|| (processType == 'All'))) {							 

				var resArr = getCustomScriptId(5);
				nlapiLogExecution('DEBUG', 'resArr', resArr.length);
				if(resArr.length > 0)
				{
					POarray["custparam_error"]='';
					POarray["custparam_backlnk"]='Main Menu';
					POarray["custparam_picktype"] ='custom';
					response.sendRedirect('SUITELET', resArr[0], resArr[1],false,POarray); 
				}
				else
				{

					POarray["custparam_error"]="Custom flow not defined for this process";
					response.sendRedirect('SUITELET', 'customscript_wmsse_menu',
							'customdeploy_wmsse_menu', false, POarray);
					return;
				}

			}
		}
		catch(e)
		{
			POarray["custparam_error"]=e.toString();
			response.sendRedirect('SUITELET', 'customscript_wmsse_menu',
					'customdeploy_wmsse_menu', false, POarray);
			return;
		}
	}
}

