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
		var cycArray=new Array();
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('DEBUG', 'CSSfilefound', CSSfilefound);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('DEBUG', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		
		var currentUser=getCurrentUser();
		
		
		var cycleCountList =getCycPlans(whLocation);
		
		nlapiLogExecution('DEBUG', 'cycleCountList', cycleCountList);
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_Fulfillment'); 
		var getPageCount=request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize=5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);
		nlapiLogExecution('DEBUG', 'totalPageSizeValue', totalPageSizeValue);
		var actualBeginTime=TimeStamp();
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(planID){if(document.getElementById('enterplan').value == '' && (planID == '' || planID == 'null' || planID ==null || planID == 'undefined')){document.getElementById('div_error').innerHTML ='Please enter/scan plan#';return false;}else{document.getElementById('hdnPlanID').value=planID;document.forms['_rf_Fulfillment'].submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Cycle Count - Plan# List</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+


		//"			<tr><td></td></tr> "+
		///	"			<tr><td></td></tr> "+
		//"			<tr><td></td></tr> "+
		"			<table><tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdnPlanID'  id='hdnPlanID'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterplan'  class='smalltextbox'  id='enterplan' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		//"		 </table></td></tr>"+
		" 	</table>";

		if(cycleCountList != null  && cycleCountList !='')
		{
			var planDetaislist = getCycPlanList(whLocation);
			nlapiLogExecution('DEBUG', 'cycleCountList.length', cycleCountList.length); 
			html = html + "	<table>"+
			" <tr>"+
			" <td>"+
			"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
			" <tr class='uir-machine-headerrow' >"+
			" <td class='align-right' >Plan #"+
			" </td>"+		
			" <td class='align-right'># Items"+
			" </td>"+
			" <td class='align-right'># Bins"+
			" </td>"+
			"</tr>";
			var orderCount=0;
			var orderArray = new Array();
			var  checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_cyc_itemscan',
					'customdeploy_wmsse_cyc_itemscan', false, cycArray);
			for (var s = getPageCount; s < cycleCountList.length; s++) {
				
				var Openuserid = '';			
				var flag = 'T';
				
				var cycPlaninternalId = cycleCountList[s].getValue('internalid',null,'group');	
				
				flag = checkplan(cycPlaninternalId,currentUser);
				nlapiLogExecution('DEBUG', 'flag', flag);
				
				var cycPlanId=cycleCountList[s].getValue('tranid',null,'group');
				nlapiLogExecution('DEBUG', 'cycPlaninternalId', cycPlaninternalId);
				if(orderArray.indexOf(cycPlanId)==-1 && flag == 'T')
				{
					orderCount=parseInt(orderCount)+1;
					var itemsCount=0;
					var binsCount=0;
					var itemArray = new Array();
					var binArray = new Array();
					for(var j=0;j<planDetaislist.length;j++)
					{
						var plan=planDetaislist[j].getValue('tranid',null,'group');
						if(plan==cycPlanId)
						{
							var item=planDetaislist[j].getValue('item',null,'group');
							var bin=planDetaislist[j].getValue('binnumber',null,'group');
							if(itemArray.indexOf(item)==-1)
							{
								itemArray.push(item);
								itemsCount = itemsCount+1;
							}
							if(binArray.indexOf(bin)==-1)
							{
								binArray.push(bin);
								binsCount = binsCount+1;
							}
						}

					}
					orderArray.push(cycPlanId);
					var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + whLocation +
					'&custparam_whlocationname=' + whLocationName + '&custparam_language=' +
					getLanguage + '&custparam_planid=' + cycPlanId  + '&custparam_actualbegintime=' + 
					actualBeginTime ;
					html = html + "	<tr  class='uir-list-row-tr line uir-list-row-even'>"+
					" <td  class='align-right'><a name='link1URL_1' href='#'" +
					" onclick='return validateForm(\""+cycPlanId+"\");'> "+cycPlanId+"</a></td>"+
					" <td class='align-right'>"+itemsCount+"</td>"+
					" <td class='align-right'>"+binsCount+"</td>"+
					"</tr>";
					if(parseInt(orderCount)>=5)
					{
						if(s+1<cycleCountList.length)
							orderCount=parseInt(orderCount)+1;
						break;
					}
				}
			}
			html = html + "	</table>"+	
			"<input type='hidden' name='hdngetPageCount' id='hdngetPageCount'" +
			" value=" + getPageCount + ">"+
			" </td>"+

			"</tr>"+
			"</table>";
		}
		
		else
		{
			var cycArray = new Array();
			cycArray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
			cycArray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
			//cycArray["custparam_ordertype"]=request.getParameter('custparam_ordertype');
			cycArray["custparam_error"] = 'No plans to display.';
			response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
			return;
		}
		//html = html +" 	</td></tr></table>";
		html = html +"		<table>	<tr>";
		if(getPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"				<td width='20px'></td>";
		if(parseInt(orderCount)>5)
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>"+




		"	</form>"+
		"<script type='text/javascript'>document.getElementById('enterplan').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var currentUser=getCurrentUser();
		
		
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
			cycArray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, cycArray);
			return;
		}
		if(request.getParameter('cmdNextList')=="Next")
		{
			cycArray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+5;
			cycArray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_lstscan', 'customdeploy_wmsse_cyc_lstscan', false, cycArray);
			return;
		}
		if(request.getParameter('cmdPrevList')=="Prev")
		{
			cycArray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-5;
			cycArray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_lstscan', 'customdeploy_wmsse_cyc_lstscan', false, cycArray);
			return;
		}
		else
		{
			var getPlanid=request.getParameter('enterplan');
			
			if(getPlanid == "" || getPlanid == "null" || getPlanid == null || getPlanid == 'undefined')
			{
				getPlanid = request.getParameter('hdnPlanID');
			}
			nlapiLogExecution('DEBUG','getPlanid',getPlanid);
			var planFilters=new Array();
			planFilters.push(new nlobjSearchFilter('tranid',null,'is',getPlanid));
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
				cycArray["custparam_planid"] = Recinternalids[0].getValue('tranid');
				
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
					return;
				}
				else if(flag == 'F')
				{
					cycArray["custparam_error"] ='This plan# is assigned to other user';
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_lstscan', 'customdeploy_wmsse_cyc_lstscan', false, cycArray);
					return;
				}
				else
				{
					cycArray["custparam_error"] ='Plan# should be with started status';
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_lstscan', 'customdeploy_wmsse_cyc_lstscan', false, cycArray);
					return;
				}
				Recinternalids=null;				
			}
			else
			{
				cycArray["custparam_error"] ='Please enter/scan valid plan#';
				response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_lstscan', 'customdeploy_wmsse_cyc_lstscan', false, cycArray);
				return;
			}
			planCols=null;
			planFilters=null;
		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}
function getCycPlanList(whLocation)
{
	var planFilters=new Array();
	planFilters.push(new nlobjSearchFilter('status',null, 'anyof', ['InvCount:B']));
	planFilters.push(new nlobjSearchFilter('mainline',null, 'is', 'F'));
	if(whLocation !=null && whLocation !='')
	{
		planFilters.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));	
	}

	var planCols=new Array();
	planCols.push(new nlobjSearchColumn('internalid',null,'group').setSort(true));
	planCols.push(new nlobjSearchColumn('tranid',null,'group'));
	planCols.push(new nlobjSearchColumn('item',null,'group'));	
	planCols.push(new nlobjSearchColumn('binnumber',null,'group'));
	var Recinternalids=nlapiSearchRecord('inventorycount',null,planFilters,planCols);
	return Recinternalids;
}
function getCycPlans(whLocation)
{
	var planFilters=new Array();
	planFilters.push(new nlobjSearchFilter('status',null, 'anyof', ['InvCount:B']));
	planFilters.push(new nlobjSearchFilter('mainline',null, 'is', 'T'));
	if(whLocation !=null && whLocation !='')
	{
		planFilters.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));	
	}

	var planCols=new Array();
	planCols.push(new nlobjSearchColumn('tranid',null,'group'));
	planCols.push(new nlobjSearchColumn('internalid',null,'group').setSort(true));
	var Recinternalids=nlapiSearchRecord('inventorycount',null,planFilters,planCols);
	return Recinternalids;
}


function checkplan(cycPlaninternalId,currentUser)
{
	var flag = 'T';
	var openinternalid = '';
	var opntaskFils = new Array();
	var opntaskCols = new Array();
	nlapiLogExecution('DEBUG', 'cycPlaninternalId', cycPlaninternalId);
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
		
	nlapiLogExecution('DEBUG', 'checkplan list values :', logmsg);
	
	if(parseInt(currentUser) == parseInt(openinternalid) || openinternalid == '' || openinternalid == 'null' || openinternalid == null)
		return flag;
	
	else
	{
		flag = 'F';
		return flag;
	}
		
}
