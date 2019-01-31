/**
 * Script Description
 * This script is used for Cycle count plan scanning
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * This is the main function which calls on load
 */
function EnterPlan(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		var getOptedField = request.getParameter('custparam_option');
		
		var userAccountId = ctx.getCompany();
		nlapiLogExecution('DEBUG', 'userAccountId', userAccountId);
		var whLocation = request.getParameter('custparam_whlocation');
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		
		var whLocationName = request.getParameter('custparam_whlocationname');
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-CHECKIN SO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			
			st0 = domainName + "-CC Inventory";
			st1 = "Enter/Scan Plan#";

			st2 = "SEND";
			st3 = "PREV";

		}	

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_Fulfillment'); 
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterplan').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan plan#';return false;}else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Cycle Count - Plan#</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td>"+
		"		<table>"+

		//"			<tr><td></td></tr> "+
		//"			<tr><td></td></tr> "+
		//"			<tr><td></td></tr> "+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				</td>"+
		"			</tr>"+
	/*	"			<tr>"+
		"				<td align = 'left'><input name='enterplan'  class='smalltextbox'  id='enterplan' type='text'/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input name='cmdSearch' type='submit' value='List' width='100px'/>"+
		"				</td>"+
		"			</tr>"+
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' class='defaultlink' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		//"		 </table></td></tr>"+
		" 	</table>"+
		"	</form>"+*/
		"			<tr>"+
		"				<td align = 'left'><input name='enterplan'  class='smalltextbox'  id='enterplan' type='text'/>"+
		"				</td>"+
		"				<td><input name='cmdSend1' class='defaultlink'    type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"	<td width='10px'></td><td ><input name='cmdSearch' type='submit' value='List' width='100px'/></td>"+
		"			</tr><tr><td></td></table>"+
		"			<table><tr>"+
		//"				<td><input name='cmdSend' class='defaultlink'    type='submit' value='Next' onclick='return validateForm();'/></td><td>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"		 </table>"+
		" 	</td></tr></table>"+
		"	</form>"+
		"<script type='text/javascript'>document.getElementById('enterplan').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('enterplan');
		var optedEvent = request.getParameter('cmdPrevious');
		var cycArray=new Array();
		

		var getLanguage = request.getParameter('hdngetLanguage');
		cycArray["custparam_language"] = getLanguage;
		nlapiLogExecution('DEBUG', 'getLanguage', cycArray["custparam_language"]);
		cycArray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		cycArray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		var context = nlapiGetContext();

		var userAccountId = context.getCompany();

		var st11,st12;
		if( getLanguage == 'es_ES')
		{
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "MainMenu";
		}
		else
		{
			st11 = "Please enter/scan valid plan#";
			st12 = "MainMenu";
		}



		cycArray["custparam_planid"] = request.getParameter('enterplan');
		
		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS Back Pressed');

			response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, cycArray);
			return;
		}
		else if(request.getParameter('cmdSearch')=="List")
		{
			cycArray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_lstscan', 'customdeploy_wmsse_cyc_lstscan', false, cycArray);
			return;
		}
		else
		{
			var getPlanid=request.getParameter('enterplan');
			nlapiLogExecution('DEBUG','getPlanid',getPlanid);
			var currentUser=getCurrentUser();
			
			var planFilters=new Array();
			planFilters.push(new nlobjSearchFilter('tranid',null,'is',getPlanid));
			if(cycArray["custparam_whlocation"]!=null && cycArray["custparam_whlocation"]!='')
				planFilters.push(new nlobjSearchFilter('location',null,'anyof',cycArray["custparam_whlocation"]));
			//planFilters.push(new nlobjSearchFilter('status', null, 'anyof', ['B']));

			var planCols=new Array();
			planCols.push(new nlobjSearchColumn('internalid'));
			planCols.push(new nlobjSearchColumn('status'));
			planCols.push(new nlobjSearchColumn('location'));
			planCols.push(new nlobjSearchColumn('tranid'));
			var Recinternalids=nlapiSearchRecord('inventorycount',null,planFilters,planCols);
			var planid='';
			if(Recinternalids!=null && Recinternalids!='')
			{
				var planStatus=Recinternalids[0].getValue('status');
				nlapiLogExecution('DEBUG','planStatus',planStatus);
				
				planid=Recinternalids[0].getValue('internalid');
				
				var flag = checkplan(planid,currentUser);
				nlapiLogExecution('DEBUG', 'flag', flag);
				if(planStatus == 'started' && flag == 'T')
				{				
					cycArray["custparam_planid"] = Recinternalids[0].getValue('tranid');
					nlapiLogExecution('DEBUG','cycArray["custparam_planid"]',cycArray["custparam_planid"]);
					var internalid=Recinternalids[0].getValue('internalid');
					nlapiLogExecution('DEBUG','internalid',internalid);
					var whLocation= Recinternalids[0].getValue('location');
					cycArray["custparam_actualbegintime"] = TimeStamp();
					cycArray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
				}
				else if(flag == 'F')
				{
					cycArray["custparam_error"] ='This plan# is assigned to other user';
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
					return;
				}
				else
				{
					cycArray["custparam_error"] ='This plan# is not yet started/is completed';
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
					return;
				}
				Recinternalids=null;				
			}
			else
			{
				cycArray["custparam_error"] ='Please enter/scan valid plan#';
				response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
				return;
			}
			planCols=null;
			planFilters=null;
		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}


function checkplan(cycPlaninternalId,currentUser)
{
	var flag = 'T';
	var openinternalid = '';
	var opntaskFils = new Array();
	var opntaskCols = new Array();
	
	if(cycPlaninternalId !=null && cycPlaninternalId !='')
	opntaskFils.push(new nlobjSearchFilter('name',null, 'is', cycPlaninternalId));
	
	opntaskCols.push(new nlobjSearchColumn('custrecord_wmsse_task_assignedto'));
	
	var opnRecuserid = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentask_search',opntaskFils,opntaskCols);
	
	if(opnRecuserid !=null && opnRecuserid !='')
	{
		openinternalid=opnRecuserid[0].getValue('custrecord_wmsse_task_assignedto');
	}
	
	
	var logmsg = 'cycPlaninternalId. = ' + cycPlaninternalId + '<br>';
	logmsg = logmsg + 'currentUser. = ' + currentUser + '<br>';	
	logmsg = logmsg + 'openinternalid. = ' + openinternalid + '<br>';	
		
	nlapiLogExecution('DEBUG', 'checkplan values :', logmsg);
	
	if(parseInt(currentUser) == parseInt(openinternalid) || openinternalid == '' || openinternalid == 'null' || openinternalid == null)
		return flag;
	
	else
	{
		flag = 'F';
		return flag;
	}
		
}
