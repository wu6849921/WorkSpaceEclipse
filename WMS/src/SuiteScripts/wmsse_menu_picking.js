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
function RFPickingMenu(request, response){
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
			var domainName = fndomainName();
			nlapiLogExecution('Error', 'domainName', domainName);
			var st0,st1,st2,st3,st4,st5,st6,st7,st8,st9,st10;

			var processType = getSystemRuleProcessType(
					'Use custom RF menu items?',request.getParameter('custparam_whlocation'),'2');
			nlapiLogExecution('DEBUG', 'processType', processType);

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
				st1 = "1. Single-Order Picking";
				st2 = "2. Single-Order with Pick list";
				st3 = "3. Multi-Order Picking";		
				st8 = "4. Pick Reversal";	
				st4 = "5. Quick Ship";
				var checkInURL_6 ='';
				var linkURL_6 = '';
				var resArr = new Array();
				if((processType == 'Picking') || (processType == 'All'))
				{
					st7= "6. Custom";
					st5 = "7. Main Menu";	

				}
				else
				{
					st5 = "6. Main Menu";	
				}
				st6 = "Enter Selection";

			}

			var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_fulfillmenu_sng',
			'customdeploy_wmsse_fulfillmenu_sng');
			var linkURL_1 = checkInURL_1+"&custparam_trantype=salesorder" + 
			'&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];

			var checkInURL_2 = nlapiResolveURL('SUITELET', 'customscript_wmsse_fulfillmenu',
			'customdeploy_wmsse_fulfillmenu');
			var linkURL_2 = checkInURL_2+"&custparam_trantype=salesorder" +
			'&custparam_whlocation=' + POarray["custparam_whlocation"] + 
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];

			var checkInURL_3 = nlapiResolveURL('SUITELET', 'customscript_wmsse_multiord_pickgen_scan',
			'customdeploy_wmsse_multiord_pickgen_scan');
			var linkURL_3 = checkInURL_3+"&custparam_trantype=transferorder" + 
			'&custparam_whlocation=' + POarray["custparam_whlocation"] + 
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];  

			var checkInURL_7 = nlapiResolveURL('SUITELET', 'customscript_wmsse_pickreversal_ord_scan',
			'customdeploy_wmsse_pickreversal_ord_scan');	

			var linkURL_7 = checkInURL_7 +  '&custparam_whlocation=' +
			POarray["custparam_whlocation"] + '&custparam_whlocationname=' +
			POarray["custparam_whlocationname"];

			var checkInURL_4 = nlapiResolveURL('SUITELET', 'customscript_wmsse_rf_quickship',
			'customdeploy_wmsse_rf_quickship');		
			var linkURL_4 = checkInURL_4 +  '&custparam_whlocation=' + 
			POarray["custparam_whlocation"] + '&custparam_whlocationname=' +
			POarray["custparam_whlocationname"];
			var checkInURL_5 = nlapiResolveURL('SUITELET', 'customscript_wmsse_menu',
			'customdeploy_wmsse_menu');
			var linkURL_5 = checkInURL_5 +  '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];

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
				//fetching mainmenu icon url.
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
				//fetching single order picking icon url.
				var singleorderfile='';
				var singleorderUrl='';
				singleorderfile=  getLoadFile('SingleOrderPicking.png');
				if(singleorderfile)
				{
					singleorderUrl = singleorderfile.getURL();
					nlapiLogExecution('ERROR', 'singleorderUrl', singleorderUrl);
				}
				singleorderUrl=singleorderUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'SingleOrderPicking.png', 'not available');
			}

			try
			{
				//fetching single order picking with picklist icon url.
				var sopicklistfile='';
				var sopicklistUrl='';
				sopicklistfile=  getLoadFile('SingleOrderwithPicklist.png');
				if(sopicklistfile)
				{
					sopicklistUrl = sopicklistfile.getURL();
					nlapiLogExecution('ERROR', 'sopicklistUrl', sopicklistUrl);
				}
				sopicklistUrl=sopicklistUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'SingleOrderwithPicklist.png', 'not available');
			}

			try
			{
				//fetching multi order picking icon url.
				var multiorderfile='';
				var multiorderUrl='';
				multiorderfile=  getLoadFile('MultiOrderPicking.png');
				if(multiorderfile)
				{
					multiorderUrl = multiorderfile.getURL();
					nlapiLogExecution('ERROR', 'multiorderUrl', multiorderUrl);
				}
				multiorderUrl=multiorderUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'MultiOrderPicking.png', 'not available');
			}

			try
			{
				//fetching pick reversal icon url.
				var pickreversalfile='';
				var pickreversalUrl='';
				pickreversalfile=  getLoadFile('PickReversal.png');
				if(pickreversalfile)
				{
					pickreversalUrl = pickreversalfile.getURL();
					nlapiLogExecution('ERROR', 'pickreversalUrl', pickreversalUrl);
				}
				pickreversalUrl=pickreversalUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'PickReversal.png', 'not available');
			}

			try
			{
				//fetching quickship icon url.
				var quickshipfile='';
				var quickshipUrl='';
				quickshipfile=  getLoadFile('QuickShip.png');
				if(quickshipfile)
				{
					quickshipUrl = quickshipfile.getURL();
					nlapiLogExecution('ERROR', 'quickshipUrl', quickshipUrl);
				}
				quickshipUrl=quickshipUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'QuickShip.png', 'not available');
			}

			try
			{
				//fetching  picking icon url.
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
				//fetching  custom icon url.
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
				//fetching  exit icon url.
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

			var functionkeyHtml=getFunctionkeyScriptSE('_rf_wmsse_fulfillmentmenu'); 
			var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' " +
			"'http://www.w3.org/TR/html4/strict.dtd'>" +
			"<html><head><title>" + st0 + "</title>"+
			"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
			"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
			if(CSSurl != null && CSSurl != '')
			{
				html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
			}
			else
			{
				html = html + "<link href='" + nlapiEscapeXML("" +
				"https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") +
				"' type='text/css' rel='stylesheet'>";
			}

			html = html + "<link rel='stylesheet' href='" +
			"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'>";
			html = html + " <script src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'>" +
			"</script>";
			html = html + "<script " +
			"src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'>" +
			"</script>";


			html = html + "<script type='text/javascript'>function validateLink() {" +
			"document.getElementById('hdnoptedfield').value=6;" +
			"document.forms['_rf_wmsse_fulfillmentmenu'].submit();return true;}" +
			"</script>";
			html = html +functionkeyHtml;
			html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
			html = html +"	<form name='_rf_wmsse_fulfillmentmenu'  method='POST' >"+

			"		<table width='100%'  >"+
			"			<tr class='tableheading'><td align = 'left'>&nbsp&nbsp&nbsp" +
			"<img src='"+imgUrl+"' alt='NS WMS' style='width:170px;height:24px'></img></td></tr>"+
			"			<tr bgcolor='#D6EAF8'><td align = 'left'>&nbsp&nbsp&nbsp" +
			"<img src='"+pickingUrl+"' alt='Picking Menu' style='height:35px;width:30px;'></img>" +
			"&nbsp&nbsp<font size='4' color='#34495E'><b>PICKING</b></font></td></tr>"+
			"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >" +
			""+errMsg+"</div></td></tr></table>"+		
			"		<table width='100%' class='table table-bordered ' ><tbody><tr>"+
			"				<td align = 'center'><a href='" + linkURL_1 + "' " +
			" style='text-decoration: none'><div " +
			"style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+singleorderUrl+"' alt='SINGLE ORDER' style='height:50px;width:50px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>SINGLE-ORDER PICKING</font>" +
			"</div></a>"+
			"				</td>"+
			"				<td align = 'center'><a href='"+linkURL_2+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+sopicklistUrl+"' alt='SINGLE ORDER WITH PICK LIST' " +
			"style='height:50px;width:50px;'></img><br/><br/>&nbsp&nbsp" +
			"<font size='2' color='#34495E'>SINGLE-ORDER WITH PICKLIST</font></div></a>" +
			"				</td>"+
			"				<td align = 'center'><a href='"+linkURL_3+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+multiorderUrl+"' alt='MULTI ORDER' style='height:50px;width:50px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>MULTI-ORDER PICKING</font>" +
			"</div></a>"+
			"				</td>"+
			"			</tr> "+
			"			<tr>"+		 
			"				<td align = 'center'><a href='"+linkURL_7+"' " +
			"style='text-decoration: none'><div " +
			"style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+pickreversalUrl+"' alt='PICK REVERSAL' style='height:50px;width:50px;'>" +
			"</img><br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>PICK REVERSAL</font>" +
			"</div></a>"+
			"				</td>"+
			"				<td align = 'center'><a href='"+linkURL_4+"'" +
			" style='text-decoration: none'><div " +
			"style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+quickshipUrl+"' alt='QUICK SHIP' style='height:50px;width:50px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>QUICK SHIP</font></div></a>"+
			"				</td>";
			if((processType == 'Picking') || (processType == 'All'))
			{
				html = html +	"				<td align = 'center'><a href='#'" +
				"   onclick='return validateLink();' style='text-decoration: none;'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+customUrl+"' alt='CUSTOMIZE' style='height:50px;width:50px;'>" +
				"</img><br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>CUSTOM</font>" +
				"</div></a>"+
				"				</td>"+
				"			</tr> ";
				html = html + "			<tr>"+		 
				"				<td align = 'center'><a href='"+linkURL_5+"' " +
				"style='text-decoration: none'><div " +
				"style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+mainmenuUrl+"' alt='MAIN MENU' style='height:50px;width:50px;'></img>" +
				"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>MAIN&nbspMENU</font></div>" +
				"</a>"+
				"				</td>"+
				"				<td align='center'><a href='/pages/nllogoutnoback.jsp'" +
				" style='text-decoration: none'><div " +
				"style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+exitUrl+"' alt='Exit' style='height:50px;width:50px;'></img><br/><br/>" +
				"&nbsp&nbsp<font size='2' color='#34495E'>EXIT</font></div></a>"+
				"				</td>"+
				"			</tr></tbody>";
			}else{		 
				html = html +"				<td align = 'center'>" +
				"<a href='"+linkURL_5+"' style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+mainmenuUrl+"' alt='MAIN MENU' style='height:50px;width:50px;'>" +
				"</img><br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>MAIN&nbspMENU</font>" +
				"</div></a>"+
				"				</td></tr>"+
				"			<tr>"+
				"				<td align='center'><a href='/pages/nllogoutnoback.jsp'" +
				" style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+exitUrl+"' alt='Exit' style='height:50px;width:50px;'></img>" +
				"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>EXIT</font></div></a>"+
				"				</td>"+
				"			</tr></tbody> ";
			}
			html = html +"			</table>"+
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_menu',
					'customdeploy_wmsse_menu', false, POarray);
			return;
		}
	}
	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var SOarray=new Array();
		try
		{
			var optedField = request.getParameter('hdnoptedfield');			
			nlapiLogExecution('ERROR', 'optedField', optedField); 		 

			var getLanguage = request.getParameter('hdngetLanguage');
			SOarray["custparam_language"] = getLanguage;

			nlapiLogExecution('DEBUG', 'getLanguage', SOarray["custparam_language"]);

			SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

			var processType = getSystemRuleProcessType(
					'Use custom RF menu items?',request.getParameter('custparam_whlocation'),'2');
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

			//This function executes when custom option is clicked
			if (optedField != null && optedField != '' && optedField != 'null' &&
					optedField != 'undefined' && optedField == '6'  && 
					((processType == 'Picking')||(processType == 'All'))) {
				var resArr = getCustomScriptId(2);
				if(resArr.length > 0)
				{
					SOarray["custparam_error"]='';
					SOarray["custparam_backlnk"]='Picking';
					SOarray["custparam_picktype"] ='custom';
					response.sendRedirect('SUITELET', resArr[0], resArr[1],false,SOarray); 
				}
				else
				{

					SOarray["custparam_error"]="Custom flow not defined for this process";
					response.sendRedirect('SUITELET', 'customscript_wmsse_picking_menu',
							'customdeploy_wmsse_picking_menu', false, SOarray);
					return;
				}
			}
		}
		catch(e)
		{
			SOarray["custparam_error"]=e.toString();
			response.sendRedirect('SUITELET', 'customscript_wmsse_picking_menu',
					'customdeploy_wmsse_picking_menu', false, SOarray);
			return;
		}

	}
}
