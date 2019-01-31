/**
 * Script Description
 * This script is used for scan item for Inventory Status Change process
 */

/***************************************************************************
 Copyright � 2018,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan SKU for Inventory Status Change
 */
function RFInvStatusChangeSKU(request, response){
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');
		var whLocationName = request.getParameter('custparam_whlocationname');
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		var st0=domainName + "-Inventory Status";
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		//starts (form name is passed in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_invstatuschange_item');
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />"+
		"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() {if(document.getElementById('txtItem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>"+
		"	<script type='text/javascript'>function validateItem(usedBins,vpoitem) {if(usedBins == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item ' +vpoitem+ ' to receive.';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Inventory Status - Item</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Item"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtItem'  class='smalltextbox'  id='txtItem' type='text'/>"+
		"				</td>"+
		"			</tr></table>"+

		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";

		html = html + "</td></tr></table>	</form>"+

		"<script type='text/javascript'>document.getElementById('txtItem').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating SKU/ITEM');

		try
		{
			var actualBeginTime=TimeStamp();

			// Forming the temporary array POarray
			var POarray = new Array();

			POarray["custparam_scanitem"] = request.getParameter('txtItem');
			POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
			POarray["custparam_company"] = request.getParameter('hdnWhCompany');
			POarray["custparam_option"] = request.getParameter('hdnOptedField');
			POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
			POarray["custparam_actualbegintime"]=actualBeginTime;

			var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
			var whLocation = request.getParameter('hdnWhLocation');

			var logMsg = 'LocationId = ' + POarray["custparam_whlocation"] + '<br>';
			logMsg = logMsg + 'LocationName = ' + POarray["custparam_whlocationname"] + '<br>';
			logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
			nlapiLogExecution('ERROR', 'Processing RF - SKU', logMsg);

			// Processing only if the 'Previous' button is not pressed
			if(optedEvent != 'Back (F7)'){
				if (POarray["custparam_scanitem"] != "") {

					var currItem = getSKUIdWithName(POarray["custparam_scanitem"], POarray["custparam_whlocation"],
							POarray["custparam_company"],null);
					if(currItem!=null && currItem!='')
					{

						var strItemGrp="";
						var strItemFam="";
						var itemType='';
						var isInActive='';
						var resultfngetItemdetails=null;

						var vIntId=currItem[0];
						if(vIntId != null && vIntId != '')
						{

							POarray["custparam_fetcheditemid"] = vIntId;
							POarray["custparam_fetcheditemname"] = currItem[1];	

							/* Fetching item details based in itemid. */

							resultfngetItemdetails = fngetItemdetails(vIntId,whLocation);


							if(resultfngetItemdetails!=null && resultfngetItemdetails!='')
							{
								nlapiLogExecution('ERROR', 'resultfngetItemdetails.length', resultfngetItemdetails.length);


								itemType = resultfngetItemdetails[0];
								strItemGrp = resultfngetItemdetails[1];
								strItemFam = resultfngetItemdetails[2];
								isInActive = resultfngetItemdetails[3];
							}

							if(isInActive == "T")
							{
								nlapiLogExecution('ERROR', 'resultfngetItemdetails isInActive', resultfngetItemdetails);
								SOarray["custparam_error"] = 'Entered item is inactive';
								response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_item_scan', 'customdeploy_wmsse_invstchange_item_scan', false, POarray);
								return;
							}
							POarray["custparam_itemtype"] = itemType;

							if(POarray["custparam_scanitem"] != "" && itemType != 'kititem'){
								nlapiLogExecution('ERROR', 'redirecting to bin', itemType);
								POarray["custparam_error"] = '';
								response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
								return;

							} else {
								nlapiLogExecution('ERROR', 'No SKU scanned or entered', POarray["custparam_scanitem"]);
								POarray["custparam_error"] = 'Please enter/scan valid item';
								response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_item_scan', 'customdeploy_wmsse_invstchange_item_scan', false, POarray);
								return;
							}

						}
					}
					else
					{
						var resultfngetItemdetailsElse='';

						/* Fetching item details based in item nameinternalid.*/

						resultfngetItemdetailsElse = fngetItemdetailsinElse(request.getParameter('txtItem'),whLocation);
						if(resultfngetItemdetails!=null && resultfngetItemdetails!='')
						{
							if(resultfngetItemdetails =="T")
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

						response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_item_scan', 'customdeploy_wmsse_invstchange_item_scan', false, POarray);
						nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
						return;
					}
				} else {
					POarray["custparam_error"] = 'Please enter/scan valid item';
					response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_item_scan', 'customdeploy_wmsse_invstchange_item_scan', false, POarray);
					nlapiLogExecution('ERROR', 'No Item scanned ', '');
					return;
				}

			} else {
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, POarray);
				return;
			}

		}
		catch(e)
		{
			var msgstring= e.toString();
			var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
			nlapiLogExecution('ERROR', 'inside catch exception', msg);
			POarray["custparam_error"] = msg;
			response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_item_scan', 'customdeploy_wmsse_invstchange_item_scan', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.

/**
 * Fetching item details based in itemid.
 * @param vIntId
 * @param whLocation
 * @returns {String}
 */

function fngetItemdetails(vIntId,whLocation)
{
	var vitemDetailsArr=new Array();
	var itemfilters=new Array();
	itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',vIntId));

	if(whLocation != null && whLocation !='' && whLocation != null)
	{
		itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
	}

	var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);

	if(itemresults!=null && itemresults!='')
	{
		vitemDetailsArr.push(itemresults[0].recordType);
		vitemDetailsArr.push(itemresults[0].getValue('custitem_wmsse_itemgroup'));
		vitemDetailsArr.push(itemresults[0].getValue('custitem_wmsse_itemfamily'));
		vitemDetailsArr.push(itemresults[0].getValue('isinactive'));

	}

	itemfilters=null;
	itemresults=null;
	return vitemDetailsArr;
}

/**
 * Fetching item details based in item nameinternalid.
 * @param itemnameinternalid
 * @param whLocation
 * @returns {String}
 */
function fngetItemdetailsinElse(itemnameinternalid,whLocation)
{
	var isInactive='';
	var itemfilters=new Array();
	itemfilters.push(new nlobjSearchFilter('nameinternal',null,'is',itemnameinternalid));
	if(whLocation != null && whLocation !='' && whLocation != null)
	{
		itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
	}

	var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, null);

	if(itemresults!=null && itemresults!='')
	{
		isInactive = itemresults[0].getValue('isinactive');

	}

	itemfilters=null;
	itemresults=null;

	return isInactive;
}



