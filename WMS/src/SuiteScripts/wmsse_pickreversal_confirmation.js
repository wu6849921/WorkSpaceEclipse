/**
 * Script Description
 * This script is used to scan the Order from Open orders list.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan order from open orders list
 */
function PickReversal(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var userAccountId = ctx.getCompany();
		
		var st0,st1,st2,st3,st4;
		var domainName = fndomainName();
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whlocation = request.getParameter('custparam_whlocation');
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-Pick Reversal";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			var headerVar='Pick Reversal';


			st0 = domainName + "-Pick Reversal";
			st1 = "Are you sure want to remove IF for this Kit item";

		}	

		var ordIntrId = request.getParameter('custparam_ordIntId');
		var pickreportno =request.getParameter('custparam_pickreportno');
		var ordLineNo =request.getParameter('custparam_ordlineno');	
		var parentskuno=request.getParameter('custparam_parentSku');		
		var pickedQty=request.getParameter('custparam_taskqty');		
		var id=request.getParameter('custparam_taskid');





		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
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
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterorder').value == '' && document.getElementById('enterpickreport').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan  order/pick report#';return false;}else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr><tr><td></td></tr><tr><td></td></tr></table>"+



		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+st1+

		"				</td></tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnorderno' value='" + ordIntrId + "'>"+
		"				<input type='hidden' name='hdnpickreportNo' value=" + pickreportno + ">"+	
		"				<input type='hidden' name='hdnordLineNo' value=" + ordLineNo + ">"+	
		"				<input type='hidden' name='hdnparentskuno' value=" + parentskuno + ">"+	
		"				<input type='hidden' name='hdnpickedQty' value=" + pickedQty + ">"+	
		"				<input type='hidden' name='hdnid' value='" + id + "'>"+
		"				</td>"+
		"			</tr>"+

		"			</table>"+
		"		<table>	<tr>"+
		"				<td>"+
		"					<input name='cmdYes' type='submit' value='Yes (Ent)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdNo' type='submit' value='No (F9)' /></td>"+
		"			</tr>"+ 
		"		 </table>"+
		"	</form>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		//Fetching InventoryStatus feature is enabled or disabled
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

		var SOarray=new Array();
		var pickreportNo = request.getParameter('hdnpickreportNo');
		var orderNo = request.getParameter('hdnorderno');
		SOarray["custparam_so"] = orderNo;
		SOarray["custparam_pickreportno"] = pickreportNo;

		var logMsg1 = 'pickreportNo =' + pickreportNo + '<br>';
		logMsg1 = logMsg1 + 'orderNo = ' + orderNo + '<br>';
		nlapiLogExecution('DEBUG', 'parameters of statusid and text', logMsg1);
				

		var optedEvent = request.getParameter('cmdYes');
		var optedNo = request.getParameter('cmdNo');
    	var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

		var whlocation = request.getParameter('custparam_whlocation');

		if (optedNo == 'No (F9)')
		{
			var opentaskResults = funtoCheckSo(orderNo,whlocation);
			if(opentaskResults != null && opentaskResults != 'null' && opentaskResults != '' && opentaskResults.length > 0)
			{
				SOarray["custparam_error"]='';
				SOarray["custparam_id"] =opentaskResults[0].getId();
				response.sendRedirect('SUITELET', 'customscript_wmsse_rf_pickreversal', 'customdeploy_wmsse_rf_pickreversal', false, SOarray);	
				return;
			}
		}
		else {
			var ordlineno =request.getParameter('hdnordLineNo');
			var parentSku=request.getParameter('hdnparentskuno');
			var taskqty=request.getParameter('hdnpickedQty');
			var componentItemsArray= new Array();
		
			var opentaskordersearchresultkit=new Array();
			var objopentaskordersearchresultkit = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_otsearch_pickrev_conf');
			objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', orderNo)); 
			objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', ordlineno));
			objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
			objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['28']));//8 picking completed
			objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));
			objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0')); 
			objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0.0'));//intTotPickQty
			objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('isinactive',null,'is','F'));
			if(parentSku != null && parentSku != '')
				objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_parent_sku_no', null, 'anyof', parentSku)); 
			
			var resLenDetails = objopentaskordersearchresultkit.runSearch();
			
			
			var resultsPage = resLenDetails.getResults(0, 1000);
			var offset = 0;
			while (!!resultsPage && resultsPage.length > 0) 
			{
				opentaskordersearchresultkit = opentaskordersearchresultkit.concat(resultsPage);
				offset += 1000;
				resultsPage = resLenDetails.getResults(offset, offset + 1000);
			}
			var ordIntrId ='';var vContlp = '';
			var kitItemsArr = new Array();
			if(opentaskordersearchresultkit != null && opentaskordersearchresultkit != '' && opentaskordersearchresultkit.length > 0)
			{
				nlapiLogExecution('DEBUG', 'opentaskordersearchresultkit',opentaskordersearchresultkit.length);
				var componentsItemArr = new Array();

				for(var k1=0;k1<opentaskordersearchresultkit.length;k1++)
				{

					if(componentsItemArr.indexOf(opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_sku')==-1) )
					{
						componentsItemArr.push(opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_sku'));
					}

				}
				nlapiLogExecution('DEBUG', 'componentsItemArr',componentsItemArr);
				for(var k1=0;k1<opentaskordersearchresultkit.length;k1++)
				{
					var getSOItem = opentaskordersearchresultkit[k1].getText('custrecord_wmsse_sku');
					var pickedQty= opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_act_qty');
					var getSOBin = opentaskordersearchresultkit[k1].getText('custrecord_wmsse_actendloc');
					//	var orderno = opentaskordersearchresultkit[k1].getValue('tranid','custrecord_wmsse_order_no');
					ordIntrId = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_order_no');
					var ordlineno = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_line_no');
					var actLoc = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_actendloc');
					var tasktype = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_tasktype');
					var nsconfirmationno = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_nsconfirm_ref_no');
					var parentskuno = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_parent_sku_no');
					var batchno = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_batch_no');
					var serials = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_serial_no');
					var itemId = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_sku');
					var vBinTrIntId = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_nstrn_ref_no');
					var whlocation = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_wms_location');
					vContlp = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_container_lp_no');
					var currRow = parentskuno+","+ordlineno+","+ordIntrId;
					if(kitItemsArr.indexOf(currRow)==-1)
					{
						kitItemsArr.push(currRow);
					}
					else
					{
						nsconfirmationno =null;
						vBinTrIntId = null;
					}
					var getSOStatus = '';
					var StatusId ='';
					if(inventoryStatusFeature == true)
					{
						getSOStatus = opentaskordersearchresultkit[k1].getText('custrecord_wmsse_inventorystatus');
						nlapiLogExecution('DEBUG', 'getSOStatus', getSOStatus);
						StatusId = opentaskordersearchresultkit[k1].getValue('custrecord_wmsse_inventorystatus');
					}

					performTaskReversal(ordIntrId,ordlineno,opentaskordersearchresultkit[k1].getId(),pickedQty,itemId,'Open',actLoc,null,null,nsconfirmationno,batchno,
							serials,parentskuno,vBinTrIntId,componentsItemArr.length,StatusId,inventoryStatusFeature,whlocation);
				}

			}


			var opentaskResults = funtoCheckSo(ordIntrId,whlocation);
			if(opentaskResults != null && opentaskResults != 'null' && opentaskResults != '' && opentaskResults.length > 0)
			{
				SOarray["custparam_error"]='';
				SOarray["custparam_id"] =opentaskResults[0].getId();
				response.sendRedirect('SUITELET', 'customscript_wmsse_rf_pickreversal', 'customdeploy_wmsse_rf_pickreversal', false, SOarray);	
				return;
			}
			else
			{
				
				var isValid = 'F';
				var opentaskorderSearchresultPackTasks = new Array();
				/*var pfilter= new Array();
				if(	ordIntrId != null && 	ordIntrId != '' && 	ordIntrId != 'null' && 	ordIntrId != 'undefined' && 	ordIntrId.length > 0)
				{
					pfilter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordIntrId));
					isValid = 'T';
				}
				if(	vContlp != null && 	vContlp != '' && 	vContlp != 'null' && 	vContlp != 'undefined' )
				{
					pfilter.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'is', vContlp));
					isValid = 'T';
				}
				pfilter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['28']));
				pfilter.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null,'anyof', whlocation));
				var pColumns = new Array();
				pColumns.push(new nlobjSearchColumn('custrecord_wmsse_tasktype',null,'group'));
				pColumns.push(new nlobjSearchColumn('type','custrecord_wmsse_sku','group'));
				pColumns.push(new nlobjSearchColumn('custrecord_wmsse_container_lp_no',null,'group'));
				pColumns.push(new nlobjSearchColumn('internalid',null,'max'));
				var opentaskorderSearchresultPackTasks = null;
				if(isValid == 'T')
				{
					opentaskorderSearchresultPackTasks = nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,pfilter,pColumns);
				}*/
				
				
				
				
				if(	ordIntrId != null && 	ordIntrId != '' && 	ordIntrId != 'null' && 	ordIntrId != 'undefined' && 	ordIntrId.length > 0)
				{
					isValid = 'T';
				}
				if(	vContlp != null && 	vContlp != '' && 	vContlp != 'null' && 	vContlp != 'undefined' )
				{
					isValid = 'T';
				}
				if(isValid == 'T')
				{
					var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_pickreversalofpack');
					
					if(	ordIntrId != null && 	ordIntrId != '' && 	ordIntrId != 'null' && 	ordIntrId != 'undefined' && 	ordIntrId.length > 0)
					{
						OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordIntrId));
					}
					if(	vContlp != null && 	vContlp != '' && 	vContlp != 'null' && 	vContlp != 'undefined' )
					{
						OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'is', vContlp));
					}
					OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['28']));
					OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null,'anyof', whlocation));
					
					var resLenDetails = OTsearchresult.runSearch();
					var resultsPage = resLenDetails.getResults(0, 1000);
					var offset = 0;
					while (!!resultsPage && resultsPage.length > 0) 
					{
						opentaskorderSearchresultPackTasks = opentaskorderSearchresultPackTasks.concat(resultsPage);
						offset += 1000;
						resultsPage = resLenDetails.getResults(offset, offset + 1000);
					}
				}
				

				nlapiLogExecution('DEBUG', "opentaskorderSearchresultPackTasks", opentaskorderSearchresultPackTasks);
				var pickTasksExist = false;
				for(var p=0;p<opentaskorderSearchresultPackTasks.length;p++)
				{
					var taskType= opentaskorderSearchresultPackTasks[p].getValue('custrecord_wmsse_tasktype',null,'group');
					var skuType= opentaskorderSearchresultPackTasks[p].getValue('type','custrecord_wmsse_sku','group');
					
					var logMsg1 = 'taskType =' + taskType + '<br>';
					logMsg1 = logMsg1 + 'skuType = ' + skuType + '<br>';
					nlapiLogExecution('DEBUG', 'parameters item type', logMsg1);

					
					if((taskType == '3' || taskType == 3) && (skuType != 'Kit'))
					{
						pickTasksExist =true;
						break;
					}

				}
				var logMsg1 = 'pickTasksExist =' + pickTasksExist + '<br>';
				logMsg1 = logMsg1 + 'skuType = ' + skuType + '<br>';
				nlapiLogExecution('DEBUG', 'parameters of task', logMsg1);

				for(var p=0;p<opentaskorderSearchresultPackTasks.length && pickTasksExist == false;p++)
				{

					var fields = new Array();
					var values = new Array();

					fields.push('custrecord_wmsse_notes');
					fields.push('custrecord_wmsse_nsconfirm_ref_no');
					fields.push('custrecord_wmsse_nstrn_ref_no');


					values.push('Updated by outbound reversal process');
					values.push(null);
					values.push(null);
					fields.push('custrecord_wmsse_wms_status_flag');
					values.push('33');


					nlapiLogExecution('DEBUG', 'open task id ',opentaskorderSearchresultPackTasks[p].getValue('internalid',null,'max')); 

					nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskorderSearchresultPackTasks[p].getValue('internalid',null,'max'), fields, values); 
				}

				SOarray["custparam_error"]="";
				response.sendRedirect('SUITELET', 'customscript_wmsse_pickreversal_ord_scan', 'customdeploy_wmsse_pickreversal_ord_scan', false, SOarray);
				return false;
			}
		}
	}
}
function funtoCheckSo(orderNo,whlocation){

	nlapiLogExecution('DEBUG', 'orderNo', orderNo);
	var SORecinternalids=new Array();
	var objopentaskordersearchresultkit = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_otsearch_pickrev_conf');
	
	if(orderNo != null && orderNo != 'null' && orderNo != '' && orderNo !='undefined')
	{
		objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',orderNo));
	}
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8','28']));

	var resLenDetails = objopentaskordersearchresultkit.runSearch();

	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SORecinternalids = SORecinternalids.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}
	
	//SOtrantypecols=null;
	return SORecinternalids;
}
function updateOBOpentask(reversalqty,taskid,taskactqty,itemid,ordintrid,taskactloc,lineno,tasktype,wmsstatus,StatusId,whlocation)
{
	var str = 'reversalqty. = ' + reversalqty + '<br>';	
	str = str + 'taskactqty. = ' + taskactqty + '<br>';	
	str = str + 'opentaskid. = ' + taskid + '<br>';
	str = str + 'tasktype. = ' + tasktype + '<br>';	 
	str = str + 'itemid. = ' + itemid + '<br>';
	//str = str + 'lprecid. = ' + lprecid + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'ordintrid. = ' + ordintrid + '<br>';
	str = str + 'lineno. = ' + lineno + '<br>';
	str = str + 'wmsstatus. = ' + wmsstatus + '<br>';
	str = str + 'StatusId. = ' + StatusId + '<br>';
	nlapiLogExecution('DEBUG', 'Function Parameters updateOBOpentask', str);

	updateOpenTask(taskid,reversalqty,taskactqty,tasktype,lineno,itemid,ordintrid,StatusId,whlocation);

	nlapiLogExecution('DEBUG', 'Out of updateOpentaskandInventory');
}

function updateOpenTask(taskid,reversalqty,taskactqty,tasktype,lineno,itemid,ordintrid,StatusId,whlocation)
{
	
	var str = 'taskid. = ' + taskid + '<br>';
	str = str + 'reversalqty. = ' + reversalqty + '<br>';
	str = str + 'taskactqty. = ' + taskactqty + '<br>';
	str = str + 'tasktype. = ' + tasktype + '<br>';
	str = str + 'lineno. = ' + lineno + '<br>';
	str = str + 'itemid. = ' + itemid + '<br>';
	str = str + 'ordintrid. = ' + ordintrid + '<br>';
	str = str + 'StatusId. = ' + StatusId + '<br>';
	var taskremqty=parseFloat(taskactqty)-parseFloat(reversalqty);

	str = str + 'taskremqty. = ' + taskremqty + '<br>';

	nlapiLogExecution('DEBUG', 'Function Parameters updateOpenTask', str);
	var cartlpArray=new Array();
	if(tasktype=='Open')
	{
		var opentaskList=new Array();
		var objopentaskList = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_pickreversal');
		if(taskid != null && taskid !='' && taskid !='null' && taskid !='undefined')
		{
			objopentaskList.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', taskid));
		}
		else
		{
			if(ordintrid != null && ordintrid != '')
				objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordintrid));
			if(lineno != null && lineno != '')
				objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineno));
			//3-Putaway completed
			objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [3]));
			objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));

			//2- putaway
			objopentaskList.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_tasktype', null, 'anyof', [2]));

			if(StatusId != null && StatusId != '' && StatusId != 'null' && StatusId != 'undefined' && StatusId != undefined)
				objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_inventorystatus', null, 'anyof', StatusId));
		}	

		var resLenDetails = objopentaskList.runSearch();
		
		
		var resultsPage = resLenDetails.getResults(0, 1000);
		var offset = 0;
		while (!!resultsPage && resultsPage.length > 0) 
		{
			opentaskList = opentaskList.concat(resultsPage);
			offset += 1000;
			resultsPage = resLenDetails.getResults(offset, offset + 1000);
		}
		nlapiLogExecution('DEBUG', 'opentaskList at updateOpenTask', opentaskList);
		if(opentaskList != null && opentaskList != '')
		{
			for(var i=0;i<opentaskList.length;i++)
			{
				var fields = new Array();
				var values = new Array();

				fields.push('custrecord_wmsse_notes');
				fields.push('custrecord_wmsse_reversalqty');
				fields.push('custrecord_wmsse_act_qty');


				values.push('Updated by outbound reversal process');
				values.push(Number(Big(reversalqty).toFixed(5)));
				values.push(Number(Big(taskremqty).toFixed(5)));


				if(parseFloat(taskremqty)<1)
				{
					fields.push('custrecord_wmsse_wms_status_flag');
					values.push('33');
					fields.push('custrecord_wmsse_act_end_date');
					values.push(DateStamp());

				}
				nlapiLogExecution('DEBUG', 'open task id ',opentaskList[i].getId());
				nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskList[i].getId(), fields, values);

			}
		}
	}
	else
	{
	
		var closedtaskList=new Array();
		var objclosedtaskList = new nlapiLoadSearch('customrecord_wmsse_trn_closedtask', 'customsearch_wmsse_ct_pickreversal');
		if(taskid != null && taskid !='' && taskid !='null' && taskid !='undefined')
		{
			objclosedtaskList.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', taskid));
		}
		else
		{
			if(ordintrid != null && ordintrid != '')
				objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no_clt', null, 'is', ordintrid));
			if(lineno != null && lineno != '')
				objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no_clt', null, 'equalto', lineno));
			//3-Putaway completed
			objclosedtaskList.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_wms_status_flag_clt', null, 'anyof', [3]));

			//2- putaway
			objclosedtaskList.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_tasktype_clt', null, 'anyof', [2]));

			if(StatusId != null && StatusId != '' && StatusId != 'null' && StatusId != 'undefined' && StatusId != undefined)
				objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_inventorystatus', null, 'anyof', StatusId));

		}

		var resLenDetails = objclosedtaskList.runSearch();
		
		
		var resultsPage = resLenDetails.getResults(0, 1000);
		var offset = 0;
		while (!!resultsPage && resultsPage.length > 0) 
		{
			closedtaskList = closedtaskList.concat(resultsPage);
			offset += 1000;
			resultsPage = resLenDetails.getResults(offset, offset + 1000);
		}
		if(closedtaskList != null && closedtaskList != '')
		{
			for(var i=0;i<closedtaskList.length;i++)
			{
				var fields = new Array();
				var values = new Array();

				fields.push('custrecord_wmsse_notes_clt');
				fields.push('custrecord_wmsse_reversalqty_clt');
				fields.push('custrecord_wmsse_act_qty_clt');
				values.push('Updated by outbound reversal process');
				values.push(Number(Big(reversalqty).toFixed(5)));
				values.push(Number(Big(taskremqty).toFixed(5)));

				if(parseFloat(taskremqty)<1)
				{
					fields.push('custrecord_wmsse_wms_status_flag_clt');
					values.push('33');
					fields.push('custrecord_wmsse_act_end_date_clt');
					values.push(DateStamp());
				}
				nlapiLogExecution('DEBUG', 'Closed task id ',closedtaskList[i].getId());
				nlapiSubmitField('customrecord_wmsse_trn_closedtask', closedtaskList[i].getId(), fields, values);

			}
		} 
	}

	nlapiLogExecution('DEBUG', 'Out of updateOpenTask');
}

function performTaskReversal(ordid,ordlineno,taskid,taskqty,itemid,tasktype,taskactloc,wmsstatus,trantype,nsrefno,
		lotno,serials,parentSku,vBinTrIntId,kitItemLenth,StatusId,inventoryStatusFeature,whlocation)
{

	var str = 'ordid. = ' + ordid + '<br>';	
	str = str + 'ordlineno. = ' + ordlineno + '<br>';
	str = str + 'taskid. = ' + taskid + '<br>';
	str = str + 'taskqty. = ' + taskqty + '<br>';	 
	str = str + 'itemid. = ' + itemid + '<br>';
	str = str + 'trantype. = ' + trantype + '<br>';
	str = str + 'nsrefno. = ' + nsrefno + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'vBinTrIntId. = ' + vBinTrIntId + '<br>';
	str = str + 'StatusId. = ' + StatusId + '<br>';
	nlapiLogExecution('DEBUG', 'performTaskReversal Parameters', str);
	vblnUpdOpentask='T';
	if(nsrefno != null && nsrefno != '' &&  nsrefno != 'null' &&  nsrefno != 'undefined')
	{
		var vIFId = updateTransaction(ordid,ordlineno,taskqty,itemid,nsrefno,taskactloc,lotno,serials,parentSku,'itemfulfillment',kitItemLenth,StatusId,inventoryStatusFeature,whlocation);
		if(vIFId != null && vIFId != '' && vIFId != 'null' && vIFId != 'undefined')
			vblnUpdOpentask='T';
		else
			vblnUpdOpentask='F';
	}
	if(vBinTrIntId != null && vBinTrIntId != '' &&  vBinTrIntId != 'null' &&  vBinTrIntId != 'undefined' && vblnUpdOpentask == 'T')
	{
		var vBTId = updateTransaction(ordid,ordlineno,taskqty,itemid,vBinTrIntId,taskactloc,lotno,serials,parentSku,'bintransfer',kitItemLenth,StatusId,inventoryStatusFeature,whlocation);
		if(vBTId != null && vBTId != '' && vBTId != 'null' && vBTId != 'undefined')
			vblnUpdOpentask='T';
		else
			vblnUpdOpentask='F';
	}
	nlapiLogExecution('DEBUG', 'vIFId : vBTId', vIFId + ' : ' + vBTId);
	if(vblnUpdOpentask == 'T')
	{
		updateOBOpentask(taskqty,taskid,taskqty,itemid,ordid,taskactloc,ordlineno,tasktype,wmsstatus,StatusId,inventoryStatusFeature,whlocation);
	}

}
function updateTransaction(ordid,ordlineno,taskqty,itemid,nsrefno,taskactloc,lotno,serials,parentSku,processType,kitItemLenth,StatusId,inventoryStatusFeature,whlocation)
{
	var str = 'ordid. = ' + ordid + '<br>';	
	str = str + 'ordlineno. = ' + ordlineno + '<br>';
	str = str + 'taskqty. = ' + taskqty + '<br>';
	str = str + 'itemid. = ' + itemid + '<br>';	 
	str = str + 'nsrefno. = ' + nsrefno + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'lotno. = ' + lotno + '<br>';
	str = str + 'serials. = ' + serials + '<br>';
	str = str + 'processType. = ' + processType + '<br>';
	str = str + 'kitItemLenth. = ' + kitItemLenth + '<br>';
	str = str + 'StatusId. = ' + StatusId + '<br>';
	nlapiLogExecution('DEBUG', 'updateTransaction Parameters', str);
	var opentaskSerialArr = new Array();
	var itemType ='';
	var Id='';
	if(ordid!=null && ordid!='')
	{
		try
		{
			//var trantype = nlapiLookupField('transaction', ordid, 'recordType');
			//nlapiLogExecution('ERROR','trantype',trantype);

			var itemIndex=0;
			var totalqty=taskqty;
			var vLotQty=0;
			var boolfound=true;

			if(nsrefno != null && nsrefno !='' && nsrefno !='null' && nsrefno !='undefined' && processType != null && processType != '')
			{
				var vSubRecordId='item';
				//var TransformRec = nlapiLoadRecord('itemfulfillment', nsrefno);
				var TransformRec = nlapiLoadRecord(processType, nsrefno);

				//Case# 201418288 start
				var trantype = nlapiLookupField('transaction', ordid, 'recordType');
				//Case# 201418288 end
				// To get the no of lines from item fulfillment record

				if(processType == 'itemfulfillment')
				{	
					var IFLength = TransformRec.getLineItemCount(vSubRecordId);  
					for (var j = 1; IFLength!=null && j <= IFLength; j++) {

						var itemLineNo = TransformRec.getLineItemValue(vSubRecordId, 'orderline', j);
						var item = TransformRec.getLineItemValue(vSubRecordId, 'item', j);
						//Case# 201418288 start
						if(trantype=="transferorder")
						{
							itemLineNo=parseInt(itemLineNo)-1;
						}

						//Case# 201418288 end

						if (itemLineNo == ordlineno  ) {
							itemIndex=j;  
							break;
						}

					}
				}
				else if(processType == 'bintransfer')
				{	
					vSubRecordId = 'inventory';
					var IFLength = TransformRec.getLineItemCount(vSubRecordId);  
					for (var j = 1; IFLength!=null && j <= IFLength; j++) {

						var vbtItem = TransformRec.getLineItemValue(vSubRecordId, 'item', j);

						/*if(trantype=="transferorder")
							itemLineNo=parseInt(itemLineNo)-2;*/
						nlapiLogExecution('DEBUG', 'vbtItem : itemid', vbtItem + ":" + itemid);


						if (vbtItem == itemid) {
							itemIndex=j;    				
						}

					}
				}



				if(itemIndex!=0 )
				{

					
					var item_id = TransformRec.getLineItemValue(vSubRecordId, 'item', itemIndex);
					var itemname = TransformRec.getLineItemText(vSubRecordId, 'item', itemIndex);
					if(itemname!=null && itemname!='')
						itemname=itemname.replace(/ /g,"-");
					var itemrec = TransformRec.getLineItemValue(vSubRecordId, 'itemreceive', itemIndex);
					var itemloc2 = TransformRec.getLineItemValue(vSubRecordId, 'location', itemIndex);
					var NSOrdUOM = TransformRec.getLineItemValue(vSubRecordId, 'units', itemIndex);
										
					var logMsg1 = 'itemIndex =' + itemIndex + '<br>';
					logMsg1 = logMsg1 + 'item_id = ' + item_id + '<br>';
					logMsg1 = logMsg1 + 'itemname = ' + itemname + '<br>';
					logMsg1 = logMsg1 + 'NSOrdUOM = ' + NSOrdUOM + '<br>';
					logMsg1 = logMsg1 + 'itemType = ' + itemType + '<br>';
					nlapiLogExecution('DEBUG', 'parameters ', logMsg1);
					itemType = nswms_GetItemType(item_id,itemloc2);




					if(boolfound)
					{
						TransformRec.selectLineItem(vSubRecordId, itemIndex);
						if(totalqty>0)
						{
							if(serials != null && serials != '' && serials != 'null' && serials != 'undefined')
							{
								opentaskSerialArr = serials.split(',');
							}

							var oldputqty = TransformRec.getCurrentLineItemValue(vSubRecordId, 'quantity');
							//var newputqty = parseFloat(oldputqty)-parseFloat(totalqty);
							var newputqty = Number(Big(oldputqty).minus(totalqty));
							
							var logMsg1 = 'oldputqty =' + oldputqty + '<br>';
							logMsg1 = logMsg1 + 'totalqty = ' + totalqty + '<br>';
							logMsg1 = logMsg1 + 'newputqty = ' + newputqty + '<br>';
							nlapiLogExecution('DEBUG', 'parameters ', logMsg1);
							
							
							if(parseFloat(newputqty)>0)
							{
								TransformRec.setCurrentLineItemValue(vSubRecordId, 'itemreceive', 'T');
								if(processType == 'itemfulfillment')
								{
								TransformRec.setCurrentLineItemValue(vSubRecordId, 'quantity', Number(Big(newputqty).toFixed(5)));	
								}
								else
								{
									TransformRec.setCurrentLineItemValue(vSubRecordId, 'quantity', Number(Big(newputqty).toFixed(8)));	
								}
								TransformRec.setCurrentLineItemValue(vSubRecordId, 'location', itemloc2);

								if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {

									var compSubRecord = TransformRec.editCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');
									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
									nlapiLogExecution('DEBUG', 'complinelength', complinelength);
									for(var r1=1;r1<=complinelength;r1++)
									{
										if(totalqty > 0 )
										{
											var vInvenDetailsStausId="";
											compSubRecord.selectLineItem('inventoryassignment',r1);
											var vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'binnumber');
											var vOldSubBinLocQty = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
											var vOldReceiptInventoryNumber = compSubRecord.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');
											nlapiLogExecution('DEBUG', 'vOldReceiptInventoryNumber', vOldReceiptInventoryNumber);
											if(inventoryStatusFeature == true)
												vInvenDetailsStausId =compSubRecord.getCurrentLineItemValue('inventoryassignment', 'inventorystatus');
											if(vOldSubBinLocText == taskactloc && totalqty > 0 && (lotno == vOldReceiptInventoryNumber))
											{
												var vNewSubBinLocQty = '';
												if(inventoryStatusFeature == true)
												{
													if((vInvenDetailsStausId !=null && vInvenDetailsStausId !='' && vInvenDetailsStausId!='null') 
															&& (StatusId == vInvenDetailsStausId))
													{
														if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
														{
															//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
															vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
														}
														else
														{
															//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
															vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
														}
														nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
														if(parseFloat(vNewSubBinLocQty) > 0)
														{
															if(processType == 'itemfulfillment')
															{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
															}
															else
															{
																compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
															}
															compSubRecord.commitLineItem('inventoryassignment');
															//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty);
															totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty)); 
														}
														else
														{
															nlapiLogExecution('DEBUG', 'inside else',r1);
															compSubRecord.removeLineItem('inventoryassignment', r1);
															totalqty = 0; 
															break;
														}
													}
												}
												else
												{
													if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
													{
														//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
														vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
													}
													else
													{
														//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
														vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
													}
													nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
													if(parseFloat(vNewSubBinLocQty) > 0)
													{
														if(processType == 'itemfulfillment')
														{
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
														}
														else
														{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
														}
														compSubRecord.commitLineItem('inventoryassignment');
														//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty);
														totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty));
													}
													else
													{
														nlapiLogExecution('DEBUG', 'inside else',r1);
														compSubRecord.removeLineItem('inventoryassignment', r1);
														totalqty = 0; 
														break;
													}
												}
											}
										}
									}
									compSubRecord.commit();
								}
								else if (itemType == "inventoryitem" || itemType == "assemblyitem") {

									var compSubRecord = TransformRec.editCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');
									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
									nlapiLogExecution('DEBUG', 'complinelength', complinelength);
									for(var r1=1;r1<=complinelength;r1++)
									{
										if(totalqty > 0 )
										{
											compSubRecord.selectLineItem('inventoryassignment',r1);
											var vOldSubBinLocText = '';
											var vInvenDetailsStausId='';
											if(processType == 'itemfulfillment')
											{
												vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'binnumber');
												if(inventoryStatusFeature == true)
													vInvenDetailsStausId =compSubRecord.getCurrentLineItemValue('inventoryassignment', 'inventorystatus');
											}
											else if(processType == 'bintransfer')
											{
												vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'tobinnumber');
												if(inventoryStatusFeature == true)
													vInvenDetailsStausId =compSubRecord.getCurrentLineItemValue('inventoryassignment', 'toinventorystatus');
											}
											var vOldSubBinLocQty = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
											if(vOldSubBinLocText == taskactloc && totalqty > 0)
											{
												var vNewSubBinLocQty = '';
												if(inventoryStatusFeature == true)
												{

													nlapiLogExecution('DEBUG', 'StatusId ', StatusId);
													if((vInvenDetailsStausId !=null && vInvenDetailsStausId !='' && vInvenDetailsStausId!='null') && (StatusId == vInvenDetailsStausId))
													{
														if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
														{
															//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
															vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
														}
														else
														{
															//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
															vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
														}
														nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
														if(parseFloat(vNewSubBinLocQty) > 0)
														{
															if(processType == 'itemfulfillment')
															{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
															}
															else
															{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
															}
															compSubRecord.commitLineItem('inventoryassignment');
															//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty); 
															totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty)); 
														}
														else
														{
															compSubRecord.removeLineItem('inventoryassignment', r1);
															totalqty = 0; 
															break;
														}
													}
												}
												else
												{
													if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
													{
														//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
														vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
													}
													else
													{
														//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
														vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
													}
													nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
													if(parseFloat(vNewSubBinLocQty) > 0)
													{
														if(processType == 'itemfulfillment')
														{
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
														}
														else
															{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
															}
														compSubRecord.commitLineItem('inventoryassignment');
														//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty); 
														totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty)); 
													}
													else
													{
														compSubRecord.removeLineItem('inventoryassignment', r1);
														totalqty = 0; 
														break;
													}
												}

											}
										}
									}
									compSubRecord.commit();
								}
								else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {





									var compSubRecord = TransformRec.editCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');

									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

									if( totalqty > 0)
									{
										var tQty =	totalqty;
										if(parseInt(complinelength)>0)
										{
											for(var r1=1;r1<=complinelength;r1++)
											{
												compSubRecord.selectLineItem('inventoryassignment',r1);
												var vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'binnumber');
												var serialNum = compSubRecord.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');
												if(vOldSubBinLocText == taskactloc && opentaskSerialArr.indexOf(serialNum) != -1)
												{
													tQty = parseInt(tQty)-1;
													compSubRecord.removeLineItem('inventoryassignment', r1);
												}

												if(tQty == 0)
												{
													break;
												}
											}
											compSubRecord.commit();
										}
									}
								}
								TransformRec.commitLineItem(vSubRecordId);
							}
							else
							{
																
								var logMsg1 = 'newputqty =' + newputqty + '<br>';
								logMsg1 = logMsg1 + 'IFLength = ' + IFLength + '<br>';
								logMsg1 = logMsg1 + 'kitItemLenth = ' + kitItemLenth + '<br>';
								nlapiLogExecution('DEBUG', 'parameters', logMsg1);
								
								if((IFLength==1) || (IFLength == kitItemLenth))
								{
									Id = nlapiDeleteRecord(processType, nsrefno);
									nlapiLogExecution('DEBUG', 'Id', Id);
									TransformRec = 0;
									//return Id;
								}
								else
								{
									if(processType == 'itemfulfillment')
									{
										TransformRec.setLineItemValue(vSubRecordId,'itemreceive',itemIndex,'F');
									}
									else
									{
										nlapiLogExecution('DEBUG', 'Into bitransfer delete line');
										TransformRec.removeLineItem(vSubRecordId,itemIndex);
									}
								}


							}
						}
						else
						{
							
							var logMsg1 = 'totalqty =' + totalqty + '<br>';
							logMsg1 = logMsg1 + 'IFLength = ' + IFLength + '<br>';
							logMsg1 = logMsg1 + 'kitItemLenth = ' + kitItemLenth + '<br>';
							nlapiLogExecution('DEBUG', 'parameters', logMsg1);

							if((IFLength==1) || (IFLength == kitItemLenth))
							{
								Id = nlapiDeleteRecord(processType, nsrefno);
								nlapiLogExecution('DEBUG', 'Id', Id);
								TransformRec = 0;
								//return Id;
							}
							else
							{
								if(processType == 'itemfulfillment')
								{
									TransformRec.setLineItemValue(vSubRecordId,'itemreceive',itemIndex,'F');
								}
								else
								{
									nlapiLogExecution('DEBUG', 'Into bitransfer delete line');
									TransformRec.removeLineItem(vSubRecordId,itemIndex);
								}
							}
						}
					}
				}
						nlapiLogExecution('DEBUG', 'Before Submit TransformRec', TransformRec);
				var TransformRecId =null;
				if(TransformRec != null && TransformRec != '' && TransformRec != 'null' && TransformRec != 'undefined' && TransformRec != 0) 
				{
					TransformRecId = nlapiSubmitRecord(TransformRec, true);
					nlapiLogExecution('DEBUG', 'After Submit', TransformRecId);
					Id= TransformRecId;
				}

				if(((TransformRecId != null && TransformRecId != '' && TransformRecId != 'null' && TransformRecId != 'undefined') || (TransformRec != 0))&&(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem"))
				{
					
					var logMsg1 = 'ordlineno =' + ordlineno + '<br>';
					logMsg1 = logMsg1 + 'ordid = ' + ordid + '<br>';
					nlapiLogExecution('DEBUG', 'parameters ord', logMsg1);
					//fetch serials from serial entry
					var filters = new Array();
					var serialArray='';
					//filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
					filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseInt(ordlineno));									
					filters[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', ordid);
					var columns = new Array();
					//columns[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
					//columns[1] = new nlobjSearchColumn('name');
					var SrchRecordSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filters,columns);
					nlapiLogExecution('DEBUG','SrchRecordSerial', SrchRecordSerial);
					if(SrchRecordSerial != null && SrchRecordSerial != '')
					{
						for(var m=0;m<SrchRecordSerial.length;m++)
						{
							if(opentaskSerialArr.indexOf(SrchRecordSerial[m].getValue('custrecord_wmsse_ser_no')) != -1)
							{
								var vRecId=SrchRecordSerial[m].getId();
								nlapiLogExecution('DEBUG', 'Deleted serial entry', vRecId);
								nlapiDeleteRecord('customrecord_wmsse_serialentry', vRecId);
							}
						}
					}
				}

				//}
				//}
			}

		}
		catch(exp)
		{
			nlapiLogExecution('DEBUG', 'Exception in updateItemReceipt',exp);
		}
	}

	nlapiLogExecution('DEBUG', 'Out of updateItemReceipt',Id);

	return Id;
}
