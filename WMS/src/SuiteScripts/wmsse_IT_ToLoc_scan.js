/**
 * Script Description
 * This script is used for inventory transfer to warehouse location scanning screen.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan To Warehouse location for inventory transfer process
 */
function RFToLoc(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE')
		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		var POarray=new Array(); 
		POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		var getOptedField = request.getParameter('custparam_option');		 
		var userAccountId = ctx.getCompany();
		var strFromLoc = request.getParameter('custparam_whlocation');
		var strFromLocName = request.getParameter('custparam_whlocationname');
		nlapiLogExecution('DEBUG', 'strFromLoc', strFromLoc);
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whLocation = request.getParameter('custparam_whlocation');
		var actualBeginTime=TimeStamp();
		POarray["custparam_actualbegintime"]=actualBeginTime;
		nlapiLogExecution('Error', 'whLocation', whLocation);
		
		
		nlapiLogExecution('ERROR', 'into whLocation',whLocation);
		var filterStrat=new Array();
		
		if(whLocation !=null && whLocation !='' && whLocation != 'null' && whLocation != undefined)
			filterStrat.push(new nlobjSearchFilter('internalid', null, 'anyof', whLocation));

		objLocDetails = new nlapiSearchRecord('location','customsearch_wmsse_locsearchresults',filterStrat, null); 

		if(objLocDetails != null && objLocDetails != '')
			whLocationName = objLocDetails[0].getValue('name');
		
		var vInvTranId=getNewTranId();
		POarray["custparam_ITId"] =vInvTranId;
		
		var RoleLocation=getRoledBasedLocation();
		
		
		var filters=new Array();

		filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site', null, 'is', 'T'));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
		if(strFromLoc !=null && strFromLoc !='' && strFromLoc !=0)
			filters.push(new nlobjSearchFilter('internalid', null, 'noneof', strFromLoc));
		if(RoleLocation != null && RoleLocation != '' && RoleLocation != 0)
		{

			RoleLocation.push('@NONE@');

			filters.push(new nlobjSearchFilter('internalid', null, 'anyof', RoleLocation));
		}
		var columns = new Array(); 

		columns[0] = new nlobjSearchColumn('name');		 
		var searchresults = nlapiSearchRecord('location','customsearch_wmsse_locsearchresults', filters, columns);
		nlapiLogExecution('DEBUG', '2', getLanguage);
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		nlapiLogExecution('DEBUG', '3', getLanguage);
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-AL LUGAR DE ALMAC�N SCAN";
			st1 = "Introduzca Para Almac�n Ubicaci�n";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{

			st0 = domainName + "-IT Inventory";
		//	st1 = "Enter To Warehouse Location";
			st1 = "Enter/Scan To Warehouse Location";
			st2 = "SEND";
			st3 = "PREV";

		}	
		nlapiLogExecution('DEBUG', '2', getLanguage);
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
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
		"	<script type='text/javascript'>function validateForm() {if(document.getElementById('enterloc').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan to warehouse location';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_po' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Inventory Transfer - To Warehouse</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		/*"			<tr><td></td></tr>"+
		"			<tr><td></td></tr>"+
		"		<tr><td>"+*/

		"		<table>"+
		//"			<tr border='1'><td align='center' class='tablecell'  valign='top'><b>RECEIVING</b></td></tr>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnITId' value=" + vInvTranId + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+		
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterloc'  class='smalltextbox'  id='enterloc' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		//"			<tr><td></td></tr>" +
		"</table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td>"+
		//"					<input name='cmdReceiveFulls' type='submit' value='RECEIVE FULL'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+		 
		"			</tr>"+
		"		 </table>";
		if(searchresults!=null && searchresults!='')
		{
			nlapiLogExecution('Debug', 'searchresults.length', searchresults.length);
			if(searchresults.length>0)
			{
				html = html + "	<table>"+
				" <tr>"+
				" <td>"+
				"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
				" <tr class='uir-machine-headerrow' >"+
				" <td class='listheadertdleft listheadertextb uir-column-large'>Warehouse Location"+
				" </td>"+	
				"</tr>";


				for (var s = 0; s < searchresults.length; s++) {

					var vtowhLocId = searchresults[s].getId();
					var vtoWhLocName =  searchresults[s].getValue('name');
					var vtoWhLocNameText="";
					if(vtoWhLocName != null && vtoWhLocName !="")
						vtoWhLocNameText=vtoWhLocName.replace(/'/g,"%27");
					if(strFromLocName != null && strFromLocName !="")
						strFromLocName=strFromLocName.replace(/'/g,"%27");
					var vClass='uir-list-row-tr line uir-list-row-even';
					if(s!=0 && s%2!=0)
						vClass='uir-list-row-tr line uir-list-row-odd';
					var locURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_it_item_scan', 'customdeploy_wmsse_it_item_scan');

					var linkURL_1 = locURL_1 + '&custparam_whlocation=' + strFromLoc + '&custparam_whlocationname=' + strFromLocName + '&custparam_towhlocation=' + vtowhLocId + '&custparam_towhlocationname=' + vtoWhLocNameText + '&custparam_ITId=' + vInvTranId + '&custparam_actualbegintime=' + actualBeginTime;

					html = html + "	<tr  class='"+ vClass +"'>"+
					" <td><a name='link1URL_1' href='" + linkURL_1 + "'><div style='cursor: pointer;color: #255599;text-decoration: none;'>" + vtoWhLocName+"</div></a></td>"+

					"</tr>";
				}
			}
		}
		searchresults=null;
		html = html +" 	</td></tr></table>"+

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
		nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);
		var getLanguage = request.getParameter('hdngetLanguage');
		POarray["custparam_language"] = getLanguage;
		nlapiLogExecution('DEBUG', 'getLanguage', POarray["custparam_language"]);
		POarray["custparam_ITId"] =request.getParameter('hdnITId');
		var whLocation = request.getParameter('custparam_whlocation');
		POarray["custparam_whlocation"] = whLocation;
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		 
		var actualBeginTime=TimeStamp();
		POarray["custparam_actualbegintime"]=actualBeginTime;
		var st11,st12;
		if( getLanguage == 'es_ES')
		{
			st11 = "Opci�n v�lida";
			st12 = "MainMenu";
		}
		else
		{
			st11 = "Invalid Option";
			st12 = "MainMenu";
		}

		if (optedEvent != 'Back (F7)') {

			var getLoc=request.getParameter('enterloc');
			nlapiLogExecution('ERROR','getLoc',getLoc);
			var RoleLocation=getRoledBasedLocation();
			
			var Loctrantypefilters=new Array();
			Loctrantypefilters.push(new nlobjSearchFilter('name',null,'is',getLoc));
			Loctrantypefilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
			Loctrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site', null, 'is', 'T')); 
			
			if(RoleLocation != null && RoleLocation != '' && RoleLocation != 0)
			{ 
				RoleLocation.push('@NONE@'); 
				Loctrantypefilters.push(new nlobjSearchFilter('internalid', null, 'anyof', RoleLocation));
			}
			
			var Loctrantypecolumns=new Array();
			Loctrantypecolumns.push(new nlobjSearchColumn('custrecord_wmsse_make_wh_site'));
			//Loctrantypecolumns.push(new nlobjSearchColumn('custrecordcompany'));
			var LocRecinternalids=nlapiSearchRecord('location','customsearch_wmsse_locsearch',Loctrantypefilters,Loctrantypecolumns);
			var locId='';
			var Tomwhsiteflag='F';
			var company='';
			if(LocRecinternalids!=null && LocRecinternalids!='')
			{
				locId=LocRecinternalids[0].getValue('internalid');
				POarray["custparam_towhlocation"] = locId;
				if(whLocation == locId)	
				{
					POarray["custparam_error"] = "From and to warehouse locations should be different";
					response.sendRedirect('SUITELET', 'customscript_wmsse_it_to_wh_loc', 'customdeploy_wmsse_it_to_wh_loc_di', false, POarray);
					return;
				}
				POarray["custparam_towhlocationname"] = getLoc;
				response.sendRedirect('SUITELET', 'customscript_wmsse_it_item_scan', 'customdeploy_wmsse_it_item_scan', false, POarray);
				nlapiLogExecution('DEBUG', 'locId ', locId);
				LocRecinternalids=null;
				Loctrantypefilters=null;
				Loctrantypecolumns=null;
				return;		 
			}
			else
			{
				POarray["custparam_error"] = "Please enter/scan valid to warehouse location";
				response.sendRedirect('SUITELET', 'customscript_wmsse_it_to_wh_loc', 'customdeploy_wmsse_it_to_wh_loc_di', false, POarray);
				nlapiLogExecution('DEBUG', 'SearchResults ', 'Length is null');
				return;
			}

		}
		else
		{
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, POarray);
			return;
		}	

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}

/**
 * To Get transaction id
 * @returns {Number}
 */
function getNewTranId()
{
	var filter=new Array();
	filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof',19));
	filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype',null,'anyof',18));	 

	var column=new Array();
	column[0]=new nlobjSearchColumn('name').setSort(true);
	column[0] = new nlobjSearchColumn('formulanumeric');
	column[0].setFormula("TO_NUMBER({name})");
	column[0].setSort(true);

	var vTranId=1;
	var searchRecord=nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_getinvtransid', filter, column);
	if(searchRecord != null && searchRecord != '')
	{
		var vGetNewTranId=searchRecord[0].getValue('formulanumeric');
		if(vGetNewTranId != null && vGetNewTranId != '')
		{
			vTranId = parseInt(vGetNewTranId) + 1;
		}	
	}
	searchRecord=null;
	filter=null;
	column=null;
	return vTranId;
}


