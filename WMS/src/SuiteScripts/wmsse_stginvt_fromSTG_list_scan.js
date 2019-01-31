/**
 * Script Description
 * This script is used to scan from bin location for bin putaway process
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan from bin location
 */
function RFStgFromStgList(request, response){
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
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
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-Stage Bin Transfer';
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
		var actualBeginTime=TimeStamp();
		var getPageCount=request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize=5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);
		nlapiLogExecution('ERROR', 'totalPageSizeValue', totalPageSizeValue);

		var getStageBins = fnGetStageBinDetails(whLocation);
		nlapiLogExecution('ERROR', 'getStageBins', getStageBins);
		var binPutawayRecords = '';
		if(getStageBins != null && getStageBins != '' && getStageBins != 'null' && getStageBins != undefined)
		{
			binPutawayRecords = getFromBins(getStageBins,whLocation);
		}
		else
		{
			var POarray = new Array();
			POarray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
			POarray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
			//POarray["custparam_error"] = 'There is no inventory at stage locations.';
			//response.sendRedirect('SUITELET', 'customscript_wmsse_bp_frombin_scan', 'customdeploy_wmsse_bp_frombin_scan', false, POarray);
			POarray["custparam_error"] = "There are no inbound stage locations with inventory.";//No inbound stage location's found with inventory
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_fromstage', 'customdeploy_wmsse_stginvt_fromstage', false, POarray);
			return;

		}
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		//"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() { if(document.getElementById('txtbin').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan from stage location'; return false;}  else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";

		//"	<script type='text/javascript'>function validateItem(usedBins,vpoitem) {alert('hi'); return false; }</script></head><body>"+
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Stage Bin Transfer- List</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
		//"			<tr border='1'><td align='center'  valign='top'><b>RECEIVING</b></td></tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan From Stage Location"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+		
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		"				</td>"+
		"			</tr>"+	 
		"			</table>"+
		"			<tr><td></td></tr><table><tr>"+
		"				<td><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td>"+
		//"					<input name='cmdReceiveFulls' type='submit' value='RECEIVE FULL'/>"+
		"				<td>	<input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/>"+
		"				</td>"+
		"			</tr>";

		html = html + "</table>";
		if(binPutawayRecords!=null && binPutawayRecords!='' && binPutawayRecords.length != null)
		{
			nlapiLogExecution('Debug', 'binPutawayRecords.length', binPutawayRecords.length);
			if(binPutawayRecords.length>0)
			{
				html = html + "	<table>"+
				" <tr>"+
				" <td>"+
				"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
				" <tr class='uir-machine-headerrow' >"+
				" <td>Stage Location"+
				" </td>"+		
				" <td class='align-right'>Quantity"+
				" </td>"+	
				"</tr>";
				var orderCount=0;
				var orderArray=new Array();
				for (var s = getPageCount; s < binPutawayRecords.length; s++) {

					orderCount=parseInt(orderCount)+1;
					var BeginLoc=binPutawayRecords[s].getText('binnumber','binOnHand','group');
					var BeginLocQty=binPutawayRecords[s].getValue('quantityavailable','binOnHand','sum');
					var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan');

					var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_language=' + getLanguage + '&custparam_enterBin=' + BeginLoc;

					html = html + "	<tr  class='uir-list-row-tr line uir-list-row-even'>"+
					" <td><a name='link1URL_1' href='" + linkURL_1 + "'> "+BeginLoc+"</a></td>"+
					" <td class='align-right'><a name='link1URL_1'> "+parseFloat(parseFloat(BeginLocQty).toFixed(8))+"</a></td>"+
					"</tr>";
					if(parseInt(orderCount)>=5)
						break;

				}
			}
		}
		else
		{
			var POarray = new Array();
			POarray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
			POarray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
			//POarray["custparam_error"] = 'There is no inventory at stage locations.';
			//response.sendRedirect('SUITELET', 'customscript_wmsse_bp_frombin_scan', 'customdeploy_wmsse_bp_frombin_scan', false, POarray);
			POarray["custparam_error"] = "There is no inventory at inbound stage locations.";//No inbound stage location's found with inventory
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_fromstage', 'customdeploy_wmsse_stginvt_fromstage', false, POarray);
			return;
		}

		html = html +"		<table>	<tr>";
		html = html +"	<input type='hidden' name='hdngetPageCount' id='hdngetPageCount' value=" + getPageCount + ">";
		if(getPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"				<td width='20px'></td>";
		if(binPutawayRecords.length > (parseInt(getPageCount)+5))
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>";

		html = html + "	</form>"+
		"<script type='text/javascript'>document.getElementById('txtbin').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating From BIN');

		// Forming the temporary array POarray
		var POarray = new Array();
		var enterBin=request.getParameter('txtbin');
		var getLoc=request.getParameter('hdnWhLocationName');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');

		var whLocation=POarray["custparam_whlocation"];

		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		if(request.getParameter('cmdNextList')=="Next")
		{
			POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+5;
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_fromstagelst', 'customdeploy_wmsse_stginvt_fromstagelst', false, POarray);
			return;
		}
		if(request.getParameter('cmdPrevList')=="Prev")
		{
			POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-5;
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_fromstagelst', 'customdeploy_wmsse_stginvt_fromstagelst', false, POarray);
			return;
		}

		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){
			if (enterBin != null && enterBin!="") {
				//var binInternalId=nswms_GetBinInternalId(enterBin);

				var stgLocId=0;
				var cols =new Array();
				cols[0] = new nlobjSearchColumn('name');
				var BinlocationTypes =  new nlapiSearchRecord('customlist_wmsse_bin_loc_type', null, null, cols);
				nlapiLogExecution('ERROR','BinlocationTypes',BinlocationTypes);
				if(BinlocationTypes != null && BinlocationTypes !='' && BinlocationTypes.length > 0)
				{
					var strName ='Stage';
					for(var b=0;b<BinlocationTypes.length;b++)
					{
						var tName= BinlocationTypes[b].getValue('name');
						nlapiLogExecution('ERROR','tName',tName);
						if(tName == strName)
						{
							stgLocId = BinlocationTypes[b].getId();
						}
					}
				}
				BinlocationTypes=null;
				var binInternalId='';
				var filter=new Array(); 
				filter.push(new nlobjSearchFilter('binnumber','null','is',enterBin));
				filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type','null','anyof',stgLocId));
				filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_stg_direction','null','anyof',['1']));
				if(whLocation !=null && whLocation != '')
				{
					filter.push(new nlobjSearchFilter('location',null,'anyof',whLocation));
				}
				var searchrecord=nlapiSearchRecord('Bin',null,filter,null);
				if(searchrecord!=null && searchrecord!="" && searchrecord!="null")
					binInternalId=searchrecord[0].getId();
				searchrecord=null; 

				if(binInternalId==null || binInternalId=='')
				{
					POarray["custparam_error"] = 'Please enter/scan valid from stage location';
					response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_fromstagelst', 'customdeploy_wmsse_stginvt_fromstagelst', false, POarray);
					nlapiLogExecution('ERROR', 'Invalid bin scanned ', '');
					return;
				}

				if(enterBin!=null && enterBin!='')
					POarray["custparam_enterBin"] = enterBin;
				response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
				nlapiLogExecution('ERROR', 'redirecting to item screen', '');
				return;

			} else {
				POarray["custparam_error"] = 'Please enter/scan from stage location';
				response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_fromstagelst', 'customdeploy_wmsse_stginvt_fromstagelst', false, POarray);
				return;
			}
		}
		else {
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_fromstage', 'customdeploy_wmsse_stginvt_fromstage', false, POarray);
			return;
		}
	}  //end of first if condition
} //end of function.

function getFromBins(stageBins,whLocation)
{

	var filterStrat = new Array();

	var filterStrat = new Array();
	if(stageBins!=null && stageBins!='')
		filterStrat.push(new nlobjSearchFilter('binnumber','binOnHand', 'anyof', stageBins));
	if(whLocation!= null && whLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location','binOnHand','anyof', whLocation));
	var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_binwise_inventory',filterStrat, null);

	return objBinDetails;
}

function fnGetStageBinDetails(strLocation)
{

	var vBinLocArr=new Array();

	var filterStrat = new Array(); 

	if(strLocation!= null && strLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', strLocation));
	var objBinDetails = nlapiSearchRecord('bin','customsearch_stage_bindetails',filterStrat, null);
	if(objBinDetails != null && objBinDetails != '')
	{
		nlapiLogExecution('ERROR','objBinDetails',objBinDetails.length);
		for(var j=0;j<objBinDetails.length;j++)
		{
			var vValidBin=objBinDetails[j].getValue('binnumber');
			var vValidBinId=objBinDetails[j].getId();
			nlapiLogExecution('ERROR','vValidBin',vValidBin);
			if(vValidBinId != null && vValidBinId != '' && vBinLocArr.indexOf(vValidBinId) == -1)
				vBinLocArr.push(vValidBinId);
		}	
	} 

	return vBinLocArr;
}
