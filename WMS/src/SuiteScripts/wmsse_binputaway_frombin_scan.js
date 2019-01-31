/**
 * Script Description
 * This script is used to scan from bin location for bin putaway process
 */
/***************************************************************************
 Copyright � 2018,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan from bin location
 */
function RFBinPutawayFromBIN(request, response){
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
		var st0 = domainName + '-Bin Putaway';
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
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
		"	<script type='text/javascript'>function validateForm() { if(document.getElementById('txtbin').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan  stage location'; return false;}  else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Bin Putaway From Bin</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
	 
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Stage Location"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+		
		"				</td><td></td>"+
		"			</tr></table>"+
		"			<table><tr>"+		
		"				<td align = 'left' ><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		//"				</td>"+
		"				<input name='cmdSend1' class='defaultlink'    type='submit' value='' onclick='return validateForm();'/></td><td  width='20px'>&nbsp;</td>"+
		"	<td><input name='cmdSearch' type='submit' value='List' width='100px' /></td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"		 </table>"+
		"	</form>"+
		
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
		var actualBeginTime=TimeStamp();
		POarray["custparam_actualbegintime"]=actualBeginTime;
		var whLocation=POarray["custparam_whlocation"];

		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		if(request.getParameter('cmdSearch')=="List")
		{
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_frombin_lstscan', 'customdeploy_wmsse_frombin_lstscan', false, POarray);
			return;
		}
		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){
			if (enterBin != null && enterBin!="") {
				//var binInternalId=nswms_GetBinInternalId(enterBin);
				
				var stgLocId=new Array();
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
				//filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type','null','anyof',stgLocId));
				//filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_stg_direction','null','anyof',['1']));
				if(whLocation !=null && whLocation != '')
				{
					filter.push(new nlobjSearchFilter('location',null,'anyof',whLocation));
				}
				var cols = new Array();
				cols.push(new nlobjSearchColumn('custrecord_wmsse_bin_stg_direction'));
				cols.push(new nlobjSearchColumn('custrecord_wmsse_bin_loc_type'));
				var searchrecord=nlapiSearchRecord('Bin',null,filter,cols);
				if(searchrecord!=null && searchrecord!="")
				{
					if(stgLocId.indexOf(searchrecord[0].getValue('custrecord_wmsse_bin_loc_type'))==-1)
					{
						POarray["custparam_error"] = "Entered bin location type is not stage.";
						response.sendRedirect('SUITELET', 'customscript_wmsse_bp_frombin_scan', 'customdeploy_wmsse_bp_frombin_scan', false, POarray);
						nlapiLogExecution('ERROR', 'Invalid bin scanned ', '');
						return;
					}
					else if(searchrecord[0].getValue('custrecord_wmsse_bin_stg_direction')!=1)
					{
						POarray["custparam_error"] = "Please enter inbound stage direction bin.";
						response.sendRedirect('SUITELET', 'customscript_wmsse_bp_frombin_scan', 'customdeploy_wmsse_bp_frombin_scan', false, POarray);
						nlapiLogExecution('ERROR', 'Invalid bin scanned ', '');
						return;
					}

					else
					{
						binInternalId=searchrecord[0].getId();
						searchrecord=null; 
					}

				} 
				
				if(binInternalId==null || binInternalId=='')
				{
					POarray["custparam_error"] = 'Please enter/scan valid stage location';
					response.sendRedirect('SUITELET', 'customscript_wmsse_bp_frombin_scan', 'customdeploy_wmsse_bp_frombin_scan', false, POarray);
					nlapiLogExecution('ERROR', 'Invalid bin scanned ', '');
					return;
				}
				 
				if(enterBin!=null && enterBin!='')
					POarray["custparam_enterBin"] = enterBin;
				response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
				nlapiLogExecution('ERROR', 'redirecting to item screen', '');
				return;
				
			} else {
				POarray["custparam_error"] = 'Please enter/scan valid stage location';
				response.sendRedirect('SUITELET', 'customscript_wmsse_bp_frombin_scan', 'customdeploy_wmsse_bp_frombin_scan', false, POarray);
				return;
			}
		}
		else {
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
			return;
		}
	}  //end of first if condition
} //end of function.

