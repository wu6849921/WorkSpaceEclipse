/**
 * Script Description
 * This script is used for inventory search option main screen
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function of inventory search main screen
 */
function RFInventorySearch(request, response){
	if (request.getMethod() == 'GET') {

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);


		var st0,st1,st2,st3,st4,st5,st6,st7,st8,st9,st10;
		var domainName = fndomainName();
	
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var whLocationName = request.getParameter('custparam_whlocationname');
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
			st0 = domainName + "-Search Inventory";
		//	st1 = "Item";
			st1 = "Enter/Scan Item";
		//	st2 = "Bin Location";	
			st2 = "Enter/Scan Bin Location";
			st3 = "3. Search Inventory";
			st4 = "ENTER SELECTION";

		}

		var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_bt_loc_scan', 'customdeploy_wmsse_bt_loc_scan');
		var linkURL_1 = checkInURL_1;// + '&custparam_trantype=' + "purchaseorder"+ '&custparam_ordertype=' + "PO"; 
		
		var checkInURL_2 = nlapiResolveURL('SUITELET', 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan');
		var linkURL_2 = checkInURL_2 + '&custparam_trantype=' + "transferorder"+ '&custparam_ordertype=' + "TO"; 
		
		var checkInURL_3 = nlapiResolveURL('SUITELET', 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan');
		var linkURL_3 = checkInURL_3; // + '&custparam_trantype=' + "returnauthorization"+ '&custparam_ordertype=' + "RMA"; 
 

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
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_wmsse_fulfillmentmenu'); 
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";




		html = html + "<script type='text/javascript'>function validateForm() {if((document.getElementById('enteritem').value == '') && (document.getElementById('enterbinloc').value == '')){document.getElementById('div_error').innerHTML ='Please enter/scan item or bin location to search inventory';	return false;}else{var val = document.getElementById('enteroption').value; if( (val<=0) || (val >3) || isNaN(val)){document.getElementById('div_error').innerHTML ='Please enter valid inventory option.';return false;}else{return true;}}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_wmsse_fulfillmentmenu'  method='POST' >"+

		"		<table width='100%'  >"+
		"			<tr><td class='tableheading'>Search Inventory - Item & Bin</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left'  class='labelmsg'>" + st1 + ""+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enteritem'  class='smalltextbox'  id='enteritem' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+		 
		"				<td align = 'left'  class='labelmsg'>" + st2+""+
		"				</td>"+
		"			</tr> "+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterbinloc'  class='smalltextbox'  id='enterbinloc' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				</td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' class='defaultlink' type='submit' value='' onclick='return validateForm(); '/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm(); '/></td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+		
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				</td>"+
		"			</tr>"+
		"		 </table>"+	
		"	</form>"+	

		"<script type='text/javascript'>document.getElementById('enteritem').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('enteroption');
		var optedEvent= request.getParameter('cmdPrevious');
		var POarray=new Array(); 
		
		var getLanguage = request.getParameter('hdngetLanguage');
		
		var getenteritem = request.getParameter('enteritem');
		var getenterbinloc = request.getParameter('enterbinloc');
		
		POarray["custparam_language"] = getLanguage;
		
		POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

		nlapiLogExecution('DEBUG', 'getLanguage', POarray["custparam_language"]);


		var st11,st12;
		if( getLanguage == 'es_ES')
		{
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "InvSearch";
		}
		else
		{
			st11 = "Invalid Option";
			st12 = "InvSearch";
		}
 
		
		if(optedEvent=='Back (F7)')
		{
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, POarray);
			return;
		}
		else
		{
			if ((getenteritem!="" && getenteritem!="")||(getenterbinloc!="" && getenterbinloc!="")) {
				var currItem = "";

				if(getenteritem!=null && getenteritem!="")
					currItem = validateSKU(getenteritem, POarray["custparam_whlocation"], POarray["custparam_company"],null);
				if(currItem!=null && currItem!=''){
					var itemid = currItem;
					POarray["custparam_enteritemname"] = getenteritem;
					POarray["custparam_enteritemid"] = itemid;

					
				}
				else
				{
					if(getenteritem!=null && getenteritem!="")
					{
						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('nameinternal',null,'is',getenteritem));
						if(POarray["custparam_whlocation"] != null && POarray["custparam_whlocation"] !='' && POarray["custparam_whlocation"] != null)
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',POarray["custparam_whlocation"]]));
						}
						var itemcolumns= new Array();
						itemcolumns.push(new nlobjSearchColumn('isinactive'));
						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
						nlapiLogExecution('DEBUG', 'itemresults', itemresults);
						if(itemresults!=null && itemresults!='')
						{
							if(itemresults[0].getValue('isinactive')=="T")
							{
								POarray["custparam_error"] = 'Entered item is inactive.';
							}
							else
							{
								POarray["custparam_error"] = 'Please enter/scan valid item';
							}
						}
						else
						{
							POarray["custparam_error"] = 'Please enter/scan valid item';
						}

						response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search', 'customdeploy_wmsse_inventory_search', false, POarray);
						return;
					}
				}
				if(getenteritem != null && getenteritem !='' && (currItem =='' || currItem == null || currItem =='null'))					
				{
					POarray["custparam_error"] = 'Please enter/scan valid item';
					response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search', 'customdeploy_wmsse_inventory_search', false, POarray);
					return;
				}
				if(getenterbinloc!=null && getenterbinloc!=""){
					var binInternalId=nswms_GetBinInternalId(getenterbinloc,request.getParameter('custparam_whlocation'));
					if(binInternalId != null && binInternalId != '')
					{	
					POarray["custparam_enterbinloc"]=getenterbinloc;
					POarray["custparam_enterbinlocid"]=binInternalId;
					binInternalId=null;
					}
					else					
					{
						POarray["custparam_error"] = 'Please enter/scan valid bin location';
						response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search', 'customdeploy_wmsse_inventory_search', false, POarray);
						return;
					}
				}
				response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search_cnt', 'customdeploy_wmsse_inventory_search_cnt', false, POarray);
				return;
			}
			else{
				
			//	POarray["custparam_error"] = 'Invalid Option';
				POarray["custparam_error"] = 'Please enter/scan item or bin location to search inventory';
				response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search', 'customdeploy_wmsse_inventory_search', false, POarray);
				return;
			} 
		}
		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}
