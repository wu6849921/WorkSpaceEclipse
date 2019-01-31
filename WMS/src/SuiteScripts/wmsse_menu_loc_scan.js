/**
 * Script Description
 * This script is used for Main Warehouse location scanning screen.
 */
/***************************************************************************
 Copyright 锟� 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan main warehouse location scanning
 */
function RFMenuLoc(request, response) {
	if (request.getMethod() == 'GET') {

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE')

		var getOptedField = request.getParameter('custparam_option');
		var userAccountId = ctx.getCompany();

		var vRolebasedLocation = getRoledBasedLocation();
		nlapiLogExecution('DEBUG', 'vRolebasedLocation', vRolebasedLocation);
		if (vRolebasedLocation == null || vRolebasedLocation == ''
				|| vRolebasedLocation == 0) {
			vRolebasedLocation = new Array();
			var filters = new Array();
			filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site',
					null, 'is', 'T'));
			filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
			var searchresults = nlapiSearchRecord('location', null, filters,
					null);
			if (searchresults != null && searchresults != '') {
				for (var k = 0; k < searchresults.length; k++) {
					vRolebasedLocation.push(searchresults[k].getId());
				}

			}
		}
		nlapiLogExecution('ERROR', 'vRolebasedLocation', vRolebasedLocation);
		var roleBasedLocationArray = getLocationName(vRolebasedLocation);
		var strComments = "getLanguage =" + getLanguage
				+ "<br>userAccountId =  " + userAccountId
				+ "<br>vRolebasedLocation =  " + vRolebasedLocation;
		nlapiLogExecution('DEBUG', 'strComments', strComments);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0, st1, st2, st3;

		if (getLanguage == 'es_ES') {
			st0 = domainName + "-Warehouse Location";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";

		} else {
			st0 = domainName + "-Warehouse Location";
			st1 = "Enter Warehouse Location";
			st2 = "SEND";
			st3 = "PREV";

		}

		var CSSurl = '';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var errMsg = '';
		if (request.getParameter('custparam_error') != null
				&& request.getParameter('custparam_error') != '') {
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) {

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl);

		}
		CSSurl = CSSurl.replace(/&/g, "&amp;");
		CSSfilefound = null;
		// starts (Now form name is passed correctly in function to work
		// keyboard enter button)
		// var error="Please "+st1;
		// Ends here
		var functionkeyHtml = getFunctionkeyScriptSE('_rf_checkin_po');
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>"
				+ "<html><head><title>"
				+ st0
				+ "</title>"
				+ "<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"
				+ "<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if (CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl
					+ "' type='text/css' rel='stylesheet'>";
		else
			html = html
					+ "<link href='"
					+ nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css")
					+ "' type='text/css' rel='stylesheet'>";
		html = html
				+ "</head><body>"
				+ "	<script type='text/javascript'>function validateForm() {if(document.getElementById('enterloc').value == ''){document.getElementById('div_error').innerHTML ='Please enter warehouse location';	document.getElementById('enterloc').focus(); return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script></head><body onkeydown='return OnKeyDown_CL();'>"
				+ "	<form name='_rf_checkin_po' method='POST'>"
				+ // onkeydown='return OnKeyDown_CL()' >";
				// " <table class='outertable'>"+
				"		<table width='100%'>"
				+ "			<tr><td class='tableheading'>Warehouse Location</td></tr>"
				+ "			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"
				+ errMsg,[]
				+ "</div></td></tr>"
				+ "			<tr><td></td></tr>"
				+ "		</table>"
				+

				"		<table>"
				+
				// " <tr border='1'><td align='center' class='tablecell'
				// valign='top'><b>RECEIVING</b></td></tr>"+

				"			<tr>"
				+ "				<td align = 'left' class='labelmsg'>"
				+ st1
				+ "				<input type='hidden' name='hdnOptedField' value="
				+ getOptedField
				+ ">"
				+ "				</td>"
				+ "			</tr>"
				+ "			<tr>"
				+ "				<td align = 'left'>"
				+ "				<input type='hidden' name='hdngetLanguage' value="
				+ getLanguage
				+ ">"
				+ "				</td>"
				+ "			</tr>"
				+ "			<tr>"
				+ "				<td align = 'left'><input name='enterloc'  class='smalltextbox'  id='enterloc' type='text'/>"
				+ "				</td>"
				+ "			</tr>"
				+ "			<tr><td></td></tr>"
				+ "			<tr>"
				+ "				<td align = 'left'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/>"
				+
				// " <input name='cmdPrevious' type='submit' value='F7'/>"+
				"				</td>" + "			</tr>" + "		 </table>";
		if (roleBasedLocationArray != null && roleBasedLocationArray != '') {
			nlapiLogExecution('Debug', 'roleBasedLocationArray.length',
					roleBasedLocationArray.length);
			if (roleBasedLocationArray.length > 0) {
				html = html
						+ "	<table>"
						+ " <tr>"
						+ " <td>"
						+ "	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"
						+ " <tr class='uir-machine-headerrow' >"
						+ " <td class='listheadertdleft listheadertextb uir-column-large'>Warehouse Location"
						+ " </td>" + "</tr>";

				for (var s = 0; s < roleBasedLocationArray.length; s++) {

					var vwhLocId = roleBasedLocationArray[s][0];
					var vWhLocName = roleBasedLocationArray[s][1];

					var vClass = 'uir-list-row-tr line uir-list-row-even';
					if (s != 0 && s % 2 != 0)
						vClass = 'uir-list-row-tr line uir-list-row-odd';
					var locURL_1 = nlapiResolveURL('SUITELET',
							'customscript_wmsse_menu',
							'customdeploy_wmsse_menu');

					var linkURL_1 = locURL_1 + '&custparam_whlocation='
							+ vwhLocId + '&custparam_whlocationname='
							+ vWhLocName;

					html = html
							+ "	<tr  class='"
							+ vClass
							+ "'>"
							+ " <td><a name='link1URL_1' href='"
							+ linkURL_1
							+ "'><div style='cursor: pointer;color: #255599;text-decoration: none;'>"
							+ vWhLocName + "</div></a></td>" +

							"</tr>";

				}
				html = html + " </table>";
			}
		}
		roleBasedLocationArray = null;

		html = html
				+ "	</form>"
				+

				"<script type='text/javascript'>document.getElementById('enterloc').focus();</script>"
				+ "</body>" + "</html>";
		nlapiLogExecution('DEBUG', 'html', html);

		response.write(html);
	}else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('selectoption');
		var optedEvent = request.getParameter('cmdSend');
		var POarray = new Array();
		nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);
		var getLanguage = request.getParameter('hdngetLanguage');
		POarray["custparam_language"] = getLanguage;
		nlapiLogExecution('DEBUG', 'getLanguage', POarray["custparam_language"]);

		// case 201415299 starts
		var vRolebasedLocation = getRoledBasedLocation();
		nlapiLogExecution('DEBUG', 'vRolebasedLocation', vRolebasedLocation);
		if (vRolebasedLocation == null || vRolebasedLocation == ''
				|| vRolebasedLocation == 0) {
			vRolebasedLocation = new Array();
			var filters = new Array();
			filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site',
					null, 'is', 'T'));
			filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
			var searchresults = nlapiSearchRecord('location', null, filters,
					null);
			if (searchresults != null && searchresults != '') {
				for (var k = 0; k < searchresults.length; k++) {
					vRolebasedLocation.push(searchresults[k].getId());
				}

			}
		}
		nlapiLogExecution('DEBUG', 'vRolebasedLocation', vRolebasedLocation);
		// case 201415299 ends
		/*
		 * var context = nlapiGetContext();
		 * 
		 * var userAccountId = context.getCompany();
		 */

		var st11, st12;
		if (getLanguage == 'es_ES') {
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "MainMenu";
		} else {
			st11 = "INVALID OPTION";
			st12 = "MainMenu";
		}
		var getLoc = request.getParameter('enterloc');
		nlapiLogExecution('ERROR', 'getLoc', getLoc);
		if (getLoc != null && getLoc != '') {

			var Loctrantypefilters = new Array();
			// case 201415299 starts
			Loctrantypefilters.push(new nlobjSearchFilter(
					'custrecord_wmsse_make_wh_site', null, 'is', 'T'));
			// case 201415299 ends
			Loctrantypefilters.push(new nlobjSearchFilter('name', null, 'is',
					getLoc));
			Loctrantypefilters.push(new nlobjSearchFilter('isinactive', null,
					'is', 'F'));

			var Loctrantypecolumns = new Array();
			Loctrantypecolumns.push(new nlobjSearchColumn(
					'custrecord_wmsse_make_wh_site'));
			// Loctrantypecolumns.push(new
			// nlobjSearchColumn('custrecordcompany'));
			var LocRecinternalids = nlapiSearchRecord('Location', null,
					Loctrantypefilters, Loctrantypecolumns);
			var locId = '';
			var Tomwhsiteflag = 'F';
			var company = '';
			if (LocRecinternalids != null && LocRecinternalids != '') {

				locId = LocRecinternalids[0].getId();
				// case 201415299 starts
				if (vRolebasedLocation != null && vRolebasedLocation != ''
						&& vRolebasedLocation != 0
						&& vRolebasedLocation.indexOf(locId) == -1) {
					POarray["custparam_error"] = "Please enter/scan valid warehouse location";
					response.sendRedirect('SUITELET',
							'customscript_wmsse_menu_loc_scan',
							'customdeploy_wmsse_menu_loc_scan', false, POarray);
					nlapiLogExecution('DEBUG',
							'Location not in Rolebased location list ', locId);
					return;
				}
				// case 201415299 ends
				POarray["custparam_whlocation"] = locId;

				POarray["custparam_whlocationname"] = getLoc;
				response.sendRedirect('SUITELET', 'customscript_wmsse_menu',
						'customdeploy_wmsse_menu', false, POarray);
				nlapiLogExecution('DEBUG', 'locId ', locId);
				LocRecinternalids = null;
				return;
			} else {
				POarray["custparam_error"] = "Please enter/scan valid warehouse location";
				response.sendRedirect('SUITELET',
						'customscript_wmsse_menu_loc_scan',
						'customdeploy_wmsse_menu_loc_scan', false, POarray);
				nlapiLogExecution('DEBUG', 'SearchResults ', 'Length is null');
				return;
			}

		} else {
			POarray["custparam_error"] = "Please enter/scan  warehouse location";
			response.sendRedirect('SUITELET',
					'customscript_wmsse_menu_loc_scan',
					'customdeploy_wmsse_menu_loc_scan', false, POarray);
			nlapiLogExecution('DEBUG', 'SearchResults ', 'Length is null');
			return;
		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}

function getLocationName(vRoleLocation) {
	var locationArray = new Array();

	nlapiLogExecution('ERROR', 'vRoleLocation', vRoleLocation);
	var filters = new Array();
	if (vRoleLocation != null && vRoleLocation != '')
		filters.push(new nlobjSearchFilter('internalid', null, 'anyof',
				vRoleLocation));
	var columns = new Array();
	columns.push(new nlobjSearchColumn('name'));
	var searchresults = nlapiSearchRecord('location', null, filters, columns);
	if (searchresults != null && searchresults != '') {
		for (var i = 0; i < searchresults.length; i++) {
			locationArray[i] = new Array();
			locationArray[i][0] = searchresults[i].getId();
			locationArray[i][1] = searchresults[i].getValue('name');
		}
	}
	searchresults = null;
	columns = null;
	filters = null;
	return locationArray;
}
