/**
 * Script Description
 * This script is used for Inventory menu option.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function for inventory menu
 */
function RFInventoryMenu(request, response){
	if (request.getMethod() == 'GET') {

		var POarray=new Array(); 
		try
		{
			var ctx = nlapiGetContext();
			var getLanguage = ctx.getPreference('LANGUAGE');

			nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);

			//Fetching InventoryStatus feature is enabled or disabled
			var inventoryStatusFeature = isInvStatusFeatureEnabled();

			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
			var whLocationName = request.getParameter('custparam_whlocationname');
			var whLocation = request.getParameter('custparam_whlocation');

			nlapiLogExecution('Error', 'whLocation', whLocation);

			whLocationName = nlapiLookupField('location', whLocation, 'name');
			var domainName = fndomainName();
			nlapiLogExecution('Error', 'domainName', domainName);
			var st0,st1,st2,st3,st4,st5,st6,st7,st8,st9,st10;
			var processType = getSystemRuleProcessType(
					'Use custom RF menu items?',request.getParameter('custparam_whlocation'),'3');
			nlapiLogExecution('DEBUG', 'processType', processType);
			var errMsg='';
			if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
			{
				var errMsg = request.getParameter('custparam_error');
			}

			if( getLanguage == 'es_ES' || getLanguage == 'es_AR')
			{
				st0 = domainName + "-RECEPTOR";
				st1 = "1.bin Transferencia";
				st2 = "2.Conde Ciclo";
				st3 = "3.Busca en el inventario";	
				st3 = "4.Transferencia de inventario";	
				st5 = "Introduzca la selecciÃƒÂ³n";
				st8 = "INGRESAR SELECCI&#211;N";
				st9 = "ENVIAR";
				st10 = "ANTERIOR";
				st6 ="5.crear Inventario";
				st13 = "10. Inventory Status Change";

			}
			else
			{
				st0 = domainName + "-Inventory";
				st1 = "1. Bin Transfer";
				st2 = "3. Cycle Count";	
				st3 = "4. Search Inventory";
				st4 = "5. Inventory Transfer";
				st10 = "6. Stage Bin Transfer";
				st6 = "Enter Selection";
				st7 = "7. Create Inventory";
				st11 = "2. Replenishment";
				st13 = "10. Inventory Status Change";
				if((processType == 'Inventory') || (processType == 'All'))
				{
					st9= "8. Custom";
					st8 = "9. Main Menu";
				}
				else
				{
					st8 = "8. Main Menu";
				}

			}

			var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_bt_item_scan',
			'customdeploy_wmsse_bt_item_scan');
			var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"]; 

			var checkInURL_2 = nlapiResolveURL('SUITELET', 'customscript_wmsse_cyc_plan',
			'customdeploy_wmsse_cyc_plan');
			var linkURL_2 = checkInURL_2 + '&custparam_whlocation=' +
			POarray["custparam_whlocation"] + '&custparam_whlocationname=' +
			POarray["custparam_whlocationname"];  

			var checkInURL_3 = nlapiResolveURL('SUITELET', 'customscript_wmsse_inventory_search',
			'customdeploy_wmsse_inventory_search');
			var linkURL_3 = checkInURL_3 +  '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];  
			var checkInURL_4 = nlapiResolveURL('SUITELET', 'customscript_wmsse_it_to_wh_loc', 
			'customdeploy_wmsse_it_to_wh_loc_di');
			var linkURL_4 = checkInURL_4 +  '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];

			var checkInURL_5 = nlapiResolveURL('SUITELET', 'customscript_wmsse_ci_bin_scan',
			'customdeploy_wmsse_ci_bin_scan');
			var linkURL_5 = checkInURL_5 +  '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"]; 

			var checkInURL_6 = nlapiResolveURL('SUITELET', 'customscript_wmsse_menu',
			'customdeploy_wmsse_menu');
			var linkURL_6 = checkInURL_6 +  '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];

			var checkInURL_10 = nlapiResolveURL('SUITELET', 'customscript_wmsse_stginvt_fromstage',
			'customdeploy_wmsse_stginvt_fromstage');
			var linkURL_10 = checkInURL_10 + '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];

			var linkURL_11 = '';
			try
			{
				var checkInURL_11 = nlapiResolveURL('SUITELET', 'customscript_wmsse_replen_itemscan',
				'customdeploy_wmsse_replen_itemscan');
				linkURL_11 = checkInURL_11 + '&custparam_whlocation=' + POarray["custparam_whlocation"] +
				'&custparam_whlocationname=' + POarray["custparam_whlocationname"]; 
			}
			catch(e)
			{
				nlapiLogExecution('ERROR', 'Replen link is not available', 'not available');
				/*if(request.getParameter('custparam_error') != 'Replenishment is not defined' )
				{
					nlapiLogExecution('ERROR', 'Replen link is not available', 'not available');
					POarray["custparam_error"]='Replenishment is not defined';
					response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu',
							'customdeploy_wmsse_inventorymenu', false, POarray);
					return;
				}*/
			}

			if(inventoryStatusFeature == true)
			{
				var checkInURL_12 = nlapiResolveURL('SUITELET', 'customscript_wmsse_invstchange_item_scan',
				'customdeploy_wmsse_invstchange_item_scan');
				var linkURL_12 = checkInURL_12 + '&custparam_whlocation=' + POarray["custparam_whlocation"] +
				'&custparam_whlocationname=' + POarray["custparam_whlocationname"]; 
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
			CSSfilefound=null;

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
				//fetching main menu url.
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
				//fetching bintransfer icon url.
				var bintransferfile='';
				var bintransferUrl='';
				bintransferfile=  getLoadFile('BinTransfer.png');
				if(bintransferfile)
				{
					bintransferUrl = bintransferfile.getURL();
					nlapiLogExecution('ERROR', 'bintransferUrl', bintransferUrl);
				}
				bintransferUrl=bintransferUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'BinTransfer.png', 'not available');
			}

			try
			{
				//fetching replenishment icon url.
				var replenimgfile='';
				var replenUrl='';
				replenimgfile=  getLoadFile('replenish.png');
				if(replenimgfile)
				{
					replenUrl = replenimgfile.getURL();
					nlapiLogExecution('ERROR', 'replenUrl', replenUrl);
				}
				replenUrl=replenUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'replenish.png', 'not available');
			}

			try
			{
				//fetching cyclecount icon url.
				var cyclecountfile='';
				var cyclecountUrl='';
				cyclecountfile=  getLoadFile('CycleCount.png');
				if(cyclecountfile)
				{
					cyclecountUrl = cyclecountfile.getURL();
					nlapiLogExecution('ERROR', 'cyclecountUrl', cyclecountUrl);
				}
				cyclecountUrl=cyclecountUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'CycleCount.png', 'not available');
			}

			try
			{
				//fetching search inventory icon url.
				var searchinventoryfile='';
				var searchinventoryUrl='';
				searchinventoryfile=  getLoadFile('SearchInventory.png');
				if(searchinventoryfile)
				{
					searchinventoryUrl = searchinventoryfile.getURL();
					nlapiLogExecution('ERROR', 'searchinventoryUrl', searchinventoryUrl);
				}
				searchinventoryUrl=searchinventoryUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'SearchInventory.png', 'not available');
			}

			try
			{
				//fetching inventorytransfer icon url.
				var inventorytransferfile='';
				var inventorytransferUrl='';
				inventorytransferfile=  getLoadFile('InventoryTransfer.png');
				if(inventorytransferfile)
				{
					inventorytransferUrl = inventorytransferfile.getURL();
					nlapiLogExecution('ERROR', 'inventorytransferUrl', inventorytransferUrl);
				}
				inventorytransferUrl=inventorytransferUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'InventoryTransfer.png', 'not available');
			}

			try
			{
				//fetching stage bintransfer icon url.
				var stagebintransferfile='';
				var stagebintransferUrl='';
				stagebintransferfile=  getLoadFile('StageBinTransfer.png');
				if(stagebintransferfile)
				{
					stagebintransferUrl = stagebintransferfile.getURL();
					nlapiLogExecution('ERROR', 'stagebintransferUrl', stagebintransferUrl);
				}
				stagebintransferUrl=stagebintransferUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'StageBinTransfer.png', 'not available');
			}

			try
			{
				//fetching create inventory icon url.
				var createinventoryfile='';
				var createinventoryUrl='';
				createinventoryfile=  getLoadFile('CreateInventory.png');
				if(createinventoryfile)
				{
					createinventoryUrl = createinventoryfile.getURL();
					nlapiLogExecution('ERROR', 'createinventoryUrl', createinventoryUrl);
				}
				createinventoryUrl=createinventoryUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'CreateInventory.png', 'not available');
			}

			//the below block for inventory status change

			if(inventoryStatusFeature == true)
			{
				try
				{
					//fetching invstatuschange icon url.
					var invstatuschangefile='';
					var invstatuschangeUrl='';
					invstatuschangefile=  getLoadFile('InventoryStatusChange.svg');
					if(invstatuschangefile)
					{
						invstatuschangeUrl = invstatuschangefile.getURL();
						nlapiLogExecution('ERROR', 'invstatuschangeUrl', invstatuschangeUrl);
					}
					invstatuschangeUrl=invstatuschangeUrl.replace(/&/g,"&amp;");
				}catch(e)
				{
					var msgstring= e.toString();
					var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
					nlapiLogExecution('ERROR', 'inside catch exception', msg);
					POarray["custparam_error"] = msg;
					response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, POarray);
					return;
				}
			}

			var functionkeyHtml=getFunctionkeyScriptSE('_rf_wmsse_fulfillmentmenu'); 
			var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' '" +
			"http://www.w3.org/TR/html4/strict.dtd'>" +
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
				html = html + "<link href='" + nlapiEscapeXML("" +
				"https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") +
				"' type='text/css' rel='stylesheet'>";
			}

			html = html + "<link rel='stylesheet'" +
			" href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'>";
			html = html + " <script src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'>" +
			"</script>";
			html = html + "<script " +
			"src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'>" +
			"</script>";


			html = html + "<script type='text/javascript'>function validateLink() {" +
			"document.getElementById('hdnoptedfield').value=7;" +
			"document.forms['_rf_wmsse_fulfillmentmenu'].submit();return true;}" +
			"</script>";
			html = html +functionkeyHtml;
			html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
			html = html +"	<form name='_rf_wmsse_fulfillmentmenu'  method='POST' >"+

			"		<table width='100%'  >"+
			"			<tr class='tableheading'><td align = 'left'>" +
			"&nbsp&nbsp&nbsp<img src='"+imgUrl+"' alt='NS WMS' style='width:170px;height:24px'></img></td>" +
			"</tr>"+
			"			<tr bgcolor='#D6EAF8'><td align = 'left'>&nbsp&nbsp&nbsp" +
			"<img src='"+inventoryUrl+"' alt='Picking Menu' style='height:35px;width:30px;'></img>&nbsp&nbsp" +
			"<font size='4' color='#34495E'><b>INVENTORY</b></font></td></tr>"+
			"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >" +
			""+errMsg+"</div></td></tr></table>"+	
			"		<table width='100%' class='table table-bordered ' ><tbody><tr>"+
			"				<td align = 'center'>" +
			"<a href='" + linkURL_1 + "'  style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+bintransferUrl+"' alt='BIN TRANSFER' style='height:50px;width:50px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>BIN TRANSFER</font></div>" +
			"</a>"+
			"				</td>"+		 
			"				<td align = 'center'>" +
			"<a href='"+linkURL_11+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+replenUrl+"' alt='Replenishment' style='height:50px;width:50px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>REPLENISHMENT</font></div>" +
			"</a>"+
			"				</td>"+

			"				<td align = 'center'>" +
			"<a href='"+linkURL_2+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+cyclecountUrl+"' alt='CYCLE COUNT' style='height:50px;width:50px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>CYCLE COUNT</font>" +
			"</div></a>"+
			"				</td>"+

			"			</tr> "+
			"			<tr>"+	
			"				<td align = 'center'>" +
			"<a href='"+linkURL_3+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+searchinventoryUrl+"' alt='SEARCH INVENTORY' style='height:50px;width:50px;'>" +
			"</img><br/><br/>&nbsp&nbsp" +
			"<font size='2' color='#34495E'>SEARCH INVENTORY</font>" +
			"</div></a>"+
			"				</td>"+

			"				<td align = 'center'>" +
			"<a href='"+linkURL_4+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img " +
			"src='"+inventorytransferUrl+"' alt='INVENTORY TRANSFER' style='height:50px;width:50px;'>" +
			"</img><br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>INVENTORY TRANSFER" +
			"</font></div></a>"+
			"				</td>"+			 
			"				<td align = 'center'>" +
			"<a href='"+linkURL_10+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+stagebintransferUrl+"'" +
			" alt='STAGE BIN TRANSFER' style='height:50px;width:50px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>STAGE BIN TRANSFER</font>" +
			"</div></a>"+
			"				</td>"+
			"			</tr><tr> "+			 
			"				<td align = 'center'>" +
			"<a href='"+linkURL_5+"' " +
			"style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+createinventoryUrl+"' alt='CREATE INVENTORY' style='height:50px;width:50px;'>" +
			"</img><br/><br/>&nbsp&nbsp" +
			"<font size='2' color='#34495E'>CREATE INVENTORY</font></div></a>"+
			"				</td>";		
			if(inventoryStatusFeature == true)
			{
				nlapiLogExecution('ERROR', 'inventoryStatusFeature if', inventoryStatusFeature);
				html = html +	"<td align = 'center'>" +
				"<a href='"+linkURL_12+"' " +
				"style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+invstatuschangeUrl+"' alt='INVENTORY STATUS CHANGE' style='height:50px;width:50px;'>" +
				"</img><br/><br/>&nbsp&nbsp" +
				"<font size='2' color='#34495E'>INVENTORY STATUS CHANGE</font></div></a>"+
				"				</td>";	
				if((processType == 'Inventory') || (processType == 'All'))
				{					 
					html = html +	"<td align = 'center'>" +
					"<a href='#' style='text-decoration: none;' onclick='return validateLink();'>" +
					"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
					"<img src='"+customUrl+"' alt='CUSTOM' style='height:50px;width:50px;'></img><br/><br/>" +
					"&nbsp&nbsp<font size='2' color='#34495E'>CUSTOM</font></div></a>"+
					"				</td>"+
					"			</tr><tr> "+
					"				<td align = 'center'>" +
					"<a href='"+linkURL_6+"' style='text-decoration: none'>" +
					"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
					"<img src='"+mainmenuUrl+"' alt='MAIN MENU' style='height:50px;width:50px;'>" +
					"</img><br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>MAIN&nbspMENU" +
					"</font></div></a>"+
					"				</td>"+

					"				<td align='center'>" +
					"<a href='/pages/nllogoutnoback.jsp' style='text-decoration: none'>" +
					"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
					"<img src='"+exitUrl+"' alt='Exit' style='height:50px;width:50px;'></img><br/><br/>" +
					"&nbsp&nbsp<font size='2' color='#34495E'>EXIT</font></div></a>"+
					"				</td>";		
				}
				else{	

					html = html +"				<td align = 'center'>" +
					"<a href='"+linkURL_6+"' style='text-decoration: none'>" +
					"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
					"<img src='"+mainmenuUrl+"' alt='MAIN MENU' style='height:50px;width:50px;'>" +
					"</img><br/><br/>&nbsp&nbsp" +
					"<font size='2' color='#34495E'>MAIN&nbspMENU</font></div></a>"+
					"				</td>"+
					"			</tr><tr> "+
					"				<td align='center'>" +
					"<a href='/pages/nllogoutnoback.jsp' style='text-decoration: none'>" +
					"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
					"<img src='"+exitUrl+"' alt='Exit' style='height:50px;width:50px;'></img>" +
					"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>EXIT</font></div></a>"+
					"				</td>";
				}
			}
			else
			{
				nlapiLogExecution('ERROR', 'inventoryStatusFeature else', inventoryStatusFeature);
				if((processType == 'Inventory') || (processType == 'All'))
				{					 
					html = html +	"<td align = 'center'>" +
					"<a href='#' style='text-decoration: none;' onclick='return validateLink();'>" +
					"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
					"<img src='"+customUrl+"' alt='CUSTOM' style='height:50px;width:50px;'></img><br/><br/>" +
					"&nbsp&nbsp<font size='2' color='#34495E'>CUSTOM</font></div></a>"+
					"				</td>";
					html = html +"				<td align = 'center'>" +
					"<a href='"+linkURL_6+"' style='text-decoration: none'>" +
					"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
					"<img src='"+mainmenuUrl+"' alt='MAIN MENU' style='height:50px;width:50px;'>" +
					"</img><br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>MAIN&nbspMENU" +
					"</font></div></a>"+
					"				</td>"+
					"			</tr><tr> "+
					"				<td align='center'>" +
					"<a href='/pages/nllogoutnoback.jsp' style='text-decoration: none'>" +
					"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
					"<img src='"+exitUrl+"' alt='Exit' style='height:50px;width:50px;'></img><br/><br/>" +
					"&nbsp&nbsp<font size='2' color='#34495E'>EXIT</font></div></a>"+
					"				</td>";		
				}
				else{				 
					html = html +"				<td align = 'center'>" +
					"<a href='"+linkURL_6+"' style='text-decoration: none'>" +
					"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
					"<img src='"+mainmenuUrl+"' alt='MAIN MENU' style='height:50px;width:50px;'>" +
					"</img><br/><br/>&nbsp&nbsp" +
					"<font size='2' color='#34495E'>MAIN&nbspMENU</font></div></a>"+
					"				</td>"+
					"				<td align='center'>" +
					"<a href='/pages/nllogoutnoback.jsp' style='text-decoration: none'>" +
					"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
					"<img src='"+exitUrl+"' alt='Exit' style='height:50px;width:50px;'></img>" +
					"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>EXIT</font></div></a>"+
					"				</td>";
				}
			}
			html=html+"			</tr></tbody> "+		
			"			</table>"+		
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

		var optedField = request.getParameter('hdnoptedfield');
		var POarray=new Array(); 
		try
		{
			nlapiLogExecution('ERROR', 'optedField', optedField);

			var getLanguage = request.getParameter('hdngetLanguage');
			POarray["custparam_language"] = getLanguage;

			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

			nlapiLogExecution('DEBUG', 'getLanguage', POarray["custparam_language"]);
			var processType = getSystemRuleProcessType(
					'Use custom RF menu items?',request.getParameter('custparam_whlocation'),'3');

			var st11,st12;
			if( getLanguage == 'es_ES')
			{
				st11 = "OPCI&#211;N V&#193;LIDA";
				st12 = "FulfillMenu";
			}
			else
			{
				st11 = "INVALID OPTION";
				st12 = "Receiving Menu";
			}

			//This function executes when custom option is clicked
			if (optedField != null && optedField != '' && optedField != 'null' &&
					optedField != 'undefined' && optedField == '7' &&
					((processType == 'Inventory') || (processType == 'All'))) { 

				var resArr = getCustomScriptId(3);
				nlapiLogExecution('DEBUG', 'resArr', resArr.length);
				if(resArr.length > 0)
				{
					POarray["custparam_error"]='';
					POarray["custparam_backlnk"]='Inventory';
					POarray["custparam_picktype"] ='custom';
					response.sendRedirect('SUITELET', resArr[0], resArr[1],false,POarray); 
				}
				else
				{

					POarray["custparam_error"]="Custom flow not defined for this process";
					response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu',
							'customdeploy_wmsse_inventorymenu', false, POarray);
					return;
				}

			}
		}
		catch(e)
		{
			POarray["custparam_error"]=e.toString();
			response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu',
					'customdeploy_wmsse_inventorymenu', false, POarray);
			return;
		}

	}
}
