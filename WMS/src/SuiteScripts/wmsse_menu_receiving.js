/**
 * Script Description
 * This script is for Receiving menu option.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function for Receiving menu
 */
function RFReceivingMenu(request, response){
	if (request.getMethod() == 'GET') {

		var POarray=new Array(); 
		try
		{
			var ctx = nlapiGetContext();
			var getLanguage = ctx.getPreference('LANGUAGE');

			nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
			
			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_whlocationname"] = decodeURIComponent((
					request.getParameter('custparam_whlocationname')));

			var processType = getSystemRuleProcessType(
					'Use custom RF menu items?',request.getParameter('custparam_whlocation'),'1');
			nlapiLogExecution('DEBUG', 'processType', processType);
			var whLocationName = request.getParameter('custparam_whlocationname');
			var whLocation = request.getParameter('custparam_whlocation');
			var domainName = fndomainName();
			nlapiLogExecution('Error', 'domainName', domainName);
			var st0,st1,st2,st3,st4,st5,st6,st7,st8,st9,st10,str11;

			var errMsg='';
			if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
			{
				var errMsg = request.getParameter('custparam_error');
			}

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
				st0 = domainName + "-Receiving";
				st1 = "1. Purchase Order";
				st2 = "3. Transfer Order";
				st6 = "4. Putaway";
				st5 = "5. Post Item Receipt";
				st3 = "6. Returns";
				var checkInURL_8 ='';
				var linkURL_8 = '';
				if((processType == 'Receiving') || (processType == 'All'))
				{
					st8= "7. Custom";	
					st7 = "8. Main Menu";	


				}
				else
				{
					st7 = "7. Main Menu";
				}
				st4 = "Enter Selection";
				str11 = "2. Container Receiving"
			}


			var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_poscan',
			'customdeploy_wmsse_poscan');
			var linkURL_1 = checkInURL_1 + '&custparam_trantype=' + "purchaseorder"+ 
			'&custparam_ordertype=' + "Purchase Order" + '&custparam_whlocation=' + 
			POarray["custparam_whlocation"] + '&custparam_whlocationname=' + 
			POarray["custparam_whlocationname"]; 

			var checkInURL_2 = nlapiResolveURL('SUITELET', 'customscript_wmsse_poscan', 
			'customdeploy_wmsse_poscan');
			var linkURL_2 = checkInURL_2 + '&custparam_trantype=' + "transferorder"+ 
			'&custparam_ordertype=' + "Transfer Order" + '&custparam_whlocation=' + 
			POarray["custparam_whlocation"] + '&custparam_whlocationname=' +
			POarray["custparam_whlocationname"]; 

			var checkInURL_3 = nlapiResolveURL('SUITELET', 'customscript_wmsse_poscan',
			'customdeploy_wmsse_poscan');
			var linkURL_3 = checkInURL_3 + '&custparam_trantype=' + "returnauthorization"+ 
			'&custparam_ordertype=' + "RMA" + '&custparam_whlocation=' +
			POarray["custparam_whlocation"] + '&custparam_whlocationname=' +
			POarray["custparam_whlocationname"]; 


			var checkInURL_4 = nlapiResolveURL('SUITELET', 'customscript_wmsse_post_itemreceipt',
			'customdeploy_wmsse_post_itemreceipt');
			var linkURL_4 = checkInURL_4 + '&custparam_trantype=' + "purchaseorder"+
			'&custparam_ordertype=' + "PO" +  '&custparam_whlocation=' +
			POarray["custparam_whlocation"] + '&custparam_whlocationname=' +
			POarray["custparam_whlocationname"]; 

			var checkInURL_5 = nlapiResolveURL('SUITELET', 'customscript_wmsse_bp_frombin_scan',
			'customdeploy_wmsse_bp_frombin_scan');
			var linkURL_5 = checkInURL_5 +  '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];
			var checkInURL_6 = nlapiResolveURL('SUITELET', 'customscript_wmsse_menu',
			'customdeploy_wmsse_menu');
			var linkURL_6 = checkInURL_6 +  '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];

			var checkInURL_7 = nlapiResolveURL('SUITELET', 'customscript_wmsse_rcvcontscan', 
			'customdeploy_wmsse_rcvcontscan');
			var linkURL_7 = checkInURL_7 +  '&custparam_whlocation=' + POarray["custparam_whlocation"] +
			'&custparam_whlocationname=' + POarray["custparam_whlocationname"];

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
				//fetching purchase order icon url.
				var pofile='';
				var poUrl='';
				pofile=  getLoadFile('PurchaseOrder.png');
				if(pofile)
				{
					poUrl = pofile.getURL();
					nlapiLogExecution('ERROR', 'poUrl', poUrl);
				}
				poUrl=poUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'PurchaseOrder.png', 'not available');
			}

			try
			{
				//fetching transfer order icon url.
				var tofile='';
				var toUrl='';
				tofile=  getLoadFile('TransferOrder.png');
				if(tofile)
				{
					toUrl = tofile.getURL();
					nlapiLogExecution('ERROR', 'toUrl', toUrl);
				}
				toUrl=toUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'TransferOrder.png', 'not available');
			}

			try
			{
				//fetching binputway icon url.
				var putawayfile='';
				var putawayUrl='';
				putawayfile=  getLoadFile('PutAway.png');
				if(putawayfile)
				{
					putawayUrl = putawayfile.getURL();
					nlapiLogExecution('ERROR', 'putawayUrl', putawayUrl);
				}
				putawayUrl=putawayUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'PutAway.png', 'not available');
			}

			try
			{
				//fetching postitem receipt icon url.
				var pirfile='';
				var pirUrl='';
				pirfile=  getLoadFile('PostItemReceipt.png');
				if(pirfile)
				{
					pirUrl = pirfile.getURL();
					nlapiLogExecution('ERROR', 'pirUrl', pirUrl);
				}
				pirUrl=pirUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'PostItemReceipt.png', 'not available');
			}

			try
			{
				//fetching rma icon url.
				var returnsfile='';
				var returnsUrl='';
				returnsfile=  getLoadFile('Returns.png');
				if(returnsfile)
				{
					returnsUrl = returnsfile.getURL();
					nlapiLogExecution('ERROR', 'returnsUrl', returnsUrl);
				}
				returnsUrl=returnsUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'Returns.png', 'not available');
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
				//fetching receiving icon url.
				var receivingfile='';
				var receivingUrl='';
				receivingfile=  getLoadFile('Receiving_35a.png');
				if(receivingfile)
				{
					receivingUrl = receivingfile.getURL();
					nlapiLogExecution('ERROR', 'receivingUrl', receivingUrl);
				}
				receivingUrl=receivingUrl.replace(/&/g,"&amp;");
			}catch(e)
			{
				nlapiLogExecution('ERROR', 'Receiving_35a.png', 'not available');
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
				nlapiLogExecution('ERROR', 'custom.png', 'not available');
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

			html = html + "<link rel='stylesheet'" +
			" href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'>";
			html = html + " <script src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'>" +
			"</script>";
			html = html + "<script" +
			" src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'>" +
			"</script>";

			html = html +functionkeyHtml;
			html = html + "<script type='text/javascript'>function validateLink() {" +
			"document.getElementById('hdnoptedfield').value=7;" +
			"document.forms['_rf_wmsse_fulfillmentmenu'].submit();return true;}</script>";
			html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
			html = html +"	<form name='_rf_wmsse_fulfillmentmenu'  method='POST' >"+

			"		<table width='100%'  >"+
			"			<tr class='tableheading'><td align = 'left'>&nbsp&nbsp&nbsp" +
			"<img src='"+imgUrl+"' alt='NS WMS' style='width:170px;height:24px'></img></td></tr>"+
			"			<tr bgcolor='#D6EAF8'><td align = 'left'>&nbsp&nbsp&nbsp" +
			"<img src='"+receivingUrl+"' alt='Main Menu' style='height:35px;width:30px;'></img>&nbsp&nbsp" +
			"<font size='4' color='#34495E'><b>RECEIVING</b></font></td></tr>"+
			"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >" +
			""+errMsg+"</div></td></tr>"+
			"		<table>"+
			"			<tr>"+
			"		<table width='100%' class='table table-bordered ' ><tbody>" +
			"<tr>"+
			"				<td align = 'center'><a href='" + linkURL_1 + "'" +
			" style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+poUrl+"' alt='PURCHASE ORDER' style='height:35px;width:35px;'></img>" +
			"<br/><br/><font size='2' color='#34495E'>PURCHASE ORDER</font></div>" +
			"</a>"+
			"				</td>"+
			"				<td align = 'center' ><a href='"+linkURL_2+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+toUrl+"' alt='TRANSFER ORDER' style='height:35px;width:35px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>TRANSFER ORDER</font>" +
			"</div></a>"+
			"				</td>"+	 
			"				<td align = 'center'><a href='"+linkURL_5+"' " +
			"style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+putawayUrl+"' alt='PUTAWAY' style='height:35px;width:35px;'></img>" +
			"<br/><br/>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<font size='2' color='#34495E'>PUTAWAY</font>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</div></a>"+
			"				</td>"+
			"			</tr> "+
			"			<tr>"+	
			"				<td align = 'center'><a href='"+linkURL_4+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+pirUrl+"' alt='POST ITEM <br/>RECEIPT' style='height:35px;width:35px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>POST ITEM<br/> RECEIPT</font>" +
			"</div></a>"+
			"				</td>"+
			"				<td align = 'center'><a href='"+linkURL_3+"' style='text-decoration: none'>" +
			"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
			"<img src='"+returnsUrl+"' alt='RETURNS' style='height:35px;width:35px;'></img>" +
			"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>RETURNS</font></div></a>"+
			"				</td>";

			if((processType == 'Receiving') || (processType == 'All'))
			{
				html = html +	"				<td align = 'center'>" +
				"<a href='#' style='text-decoration: none;' onclick='return validateLink();'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+customUrl+"' alt='CUSTOMIZE' style='height:35px;width:35px;'></img>" +
				"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>CUSTOM</font></div></a>"+
				"				</td>"+
				"			</tr> "+
				"			<tr> ";
				html = html +"				<td align = 'center'>" +
				"<a href='"+linkURL_6+"' style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+mainmenuUrl+"' alt='MAIN MENU' style='height:35px;width:35px;'></img>" +
				"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>MAIN&nbspMENU</font>" +
				"</div></a>"+
				"				</td>"+
				"				<td align='center'><a href='/pages/nllogoutnoback.jsp' " +
				"style='text-decoration: none'><div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+exitUrl+"' alt='Exit' style='height:35px;width:35px;'></img><br/><br/>&nbsp&nbsp" +
				"<font size='2' color='#34495E'>EXIT</font></div></a>"+
				"				</td>";
			}
			else
			{
				html = html +"				<td align = 'center'>" +
				"<a href='"+linkURL_6+"' style='text-decoration: none'>" +
				"<div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+mainmenuUrl+"' alt='MAIN MENU' style='height:35px;width:35px;'></img>" +
				"<br/><br/>&nbsp&nbsp<font size='2' color='#34495E'>MAIN&nbspMENU</font>" +
				"</div></a>"+
				"				</td>"+
				"			</tr> "+
				"			<tr> "+
				"				<td align='center'><a href='/pages/nllogoutnoback.jsp' " +
				"style='text-decoration: none'><div style='cursor: pointer;color: #255599;text-decoration: none;'>" +
				"<img src='"+exitUrl+"' alt='Exit' style='height:35px;width:35px;'></img><br/><br/>&nbsp&nbsp" +
				"<font size='2' color='#34495E'>EXIT</font></div></a>"+
				"				</td>";
			}
			html = html +"			</tr></tbody>"+		
			"			</table>"+	 
			"			</tr></table>"+

			"</table>"+
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

		var POarray=new Array(); 
		try
		{
			var optedField = request.getParameter('hdnoptedfield');		
			nlapiLogExecution('ERROR', 'optedField', optedField);	
			var getLanguage = request.getParameter('hdngetLanguage');
			POarray["custparam_language"] = getLanguage;
			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');

			nlapiLogExecution('DEBUG', 'getLanguage', POarray["custparam_language"]);

			var processType = getSystemRuleProcessType(
					'Use custom RF menu items?',request.getParameter('custparam_whlocation'),'1');
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

			POarray["custparam_screenno"] = st12;
			//This function executes when custom option is clicked
			if (optedField != null && optedField != '' && optedField != 'null' &&
					optedField != 'undefined' && optedField == '7'  &&
					((processType == 'Receiving') || (processType == 'All'))) { 

				var resArr = getCustomScriptId(1);
				nlapiLogExecution('DEBUG', 'resArr', resArr.length);
				if(resArr.length > 0)
				{
					POarray["custparam_error"]='';
					POarray["custparam_backlnk"]='Receiving';
					POarray["custparam_picktype"] ='custom';

					response.sendRedirect('SUITELET', resArr[0], resArr[1],false,POarray); 
				}
				else
				{

					POarray["custparam_error"]="Custom flow not defined for this process";
					response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu',
							'customdeploy_wmsse_receivingmenu', false, POarray);
					return;
				}

			}
		}
		catch(e)
		{
			POarray["custparam_error"]=e.toString();
			response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu',
					'customdeploy_wmsse_receivingmenu', false, POarray);
			return;
		}

	}
}
