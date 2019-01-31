/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function PickingWO(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');		
		var getOptedField = request.getParameter('custparam_option');		
		var userAccountId = ctx.getCompany();		
		var vTranType = request.getParameter('custparam_trantype');
		nlapiLogExecution('DEBUG', 'vTranType', vTranType);
		var st0,st1,st2,st3;
		var domainName = fndomainName();		
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whLocation = request.getParameter('custparam_whlocation');
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-Picking Work Order";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			st0 = domainName + "-Picking Work Order";			
			st1 = "Enter/Scan Work Order#";			
			st2 = "SEND";
			st3 = "PREV";

		}	

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
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterwo').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan work order#';return false;}else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Work Order Picking</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+

		//"		<tr><td></td></tr><tr><td></td></tr><tr><td>"+
		"		<table>"+
		/*"		<tr><td>"+
		"		<table>"+*/

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnTrantype' id='hdnTrantype' value=" + vTranType + ">"+	
		"				</td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='enterwo'  class='smalltextbox'  id='enterwo' type='text'/>"+
		//"				</td>"+
		"				<input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/></td>"+
		"	<td width='20px'></td><td ><input name='cmdSearch' type='submit' value='List' width='100px'/></td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"			</tr></table>"+
		//"		 </table></td></tr>"+
		" 	</table>"+
		"	</form>"+
		"<script type='text/javascript'>document.getElementById('enterwo').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedEvent = request.getParameter('cmdPrevious');
		var tranType = request.getParameter('hdnTrantype');
		var WOarray=new Array();
		

		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		var whlocation = request.getParameter('custparam_whlocation');

		var getLanguage = request.getParameter('hdngetLanguage');
		WOarray["custparam_language"] = getLanguage;
	

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
			st11 = "Invalid Option";
			st12 = "MainMenu";
		}



		WOarray["custparam_woid"] = request.getParameter('enterwo');
		WOarray["custparam_trantype"] = request.getParameter('hdnTrantype');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			WOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_menu', 'customdeploy_wmsse_wo_menu', false, WOarray);
			return;
		}
		else if(request.getParameter('cmdSearch')=="List")
		{
			WOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lstscan', 'customdeploy_wmsse_wo_lstscan', false, WOarray);
			return;
		}
		else
		{
			var getWOid=request.getParameter('enterwo');
			nlapiLogExecution('DEBUG','getWOid',getWOid);
			nlapiLogExecution('DEBUG','whlocation',whlocation);
			var validatewo =fntocheckwo(getWOid,whlocation);
			if(validatewo=="T")
			{
				var filters = new Array();
				var columns = new Array();

				if(getWOid!=null && getWOid!='' && getWOid!='undefined' && getWOid!='')
					filters.push(new nlobjSearchFilter('tranid', null, 'is', getWOid));

				var WORecinternalids = new nlapiSearchRecord('transaction', 'customsearch_wmsse_woscan_srh', filters, columns);	
				var woid='';
				
				if(WORecinternalids!=null && WORecinternalids!='' && WORecinternalids.length > 0)
				{

					
					var vColumnslist=WORecinternalids[0].getAllColumns();
					var totalpickQtyIndex =7;
					var comittedQtyIndex =15;
					var builtQtyIndex =16;
					var unitsIndex =14;
					var coversionRateIndex =17;
					for(var x1=0;x1<vColumnslist.length;x1++)
					{
						var summaryLabel = vColumnslist[x1].getLabel();
						var name = vColumnslist[x1].getName();
						if(name == 'unit')
						{
							unitsIndex =x1;
						}
						else if(summaryLabel == 'Committed Quantity')
						{
							comittedQtyIndex = x1;
						}
						else if(summaryLabel == 'Built Quantity')
						{
							builtQtyIndex = x1;
						}
						else if(summaryLabel == 'Conversion Rate')
						{
							coversionRateIndex = x1;
						}
						else
						{

						}
					}



					woid=WORecinternalids[0].getValue('internalid',null,'group');
					
					WOarray["custparam_woid"] = WORecinternalids[0].getValue('tranid',null,'group');
					var backOrderFlag=false;
					var backorderItmsCount = 0;
					var totalWOQty = 0;
					for (var t = 0; t < WORecinternalids.length; t++) 
					{
						nlapiLogExecution('Debug', 'WORecinternalids.length', WORecinternalids.length);
						var vnitemType = WORecinternalids[t].getValue('type','item','group');
						var vcommittedordqty = WORecinternalids[t].getValue(vColumnslist[comittedQtyIndex]);
						if(vcommittedordqty == null || vcommittedordqty =='' || vcommittedordqty=='null')
						{
							vcommittedordqty=0;
						}
						var vbuiltQty = WORecinternalids[t].getValue(vColumnslist[builtQtyIndex]);
						if(vbuiltQty == null || vbuiltQty =='' || vbuiltQty=='null')
						{
							vbuiltQty=0;
						}

						if(vnitemType == "NonInvtPart" || vnitemType=="OthCharge" || vnitemType=="Service" || vnitemType=="DwnLdItem" || vnitemType=="GiftCert")
						{
							vcommittedordqty=WORecinternalids[t].getValue('quantity',null,'sum');
						}
						
						
						
						totalWOQty= Big(totalWOQty);
						vcommittedordqty= Big(vcommittedordqty);
						
						
						totalWOQty = totalWOQty.plus(vcommittedordqty).plus(vbuiltQty);
						
						
						
						
						if(parseFloat(vcommittedordqty)<=0)
						{
							backOrderFlag=true;
							backorderItmsCount = parseInt(backorderItmsCount)+1;
						}
						
					}
					if(backOrderFlag==true )
					{
						var filters=new Array();
						var columns=new Array();
						//filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
						//filters.push(new nlobjSearchFilter('quantity', null, 'greaterthan', 0));

						filters.push(new nlobjSearchFilter('shipping', null, 'is', 'F'));
						//filters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));
						filters.push(new nlobjSearchFilter('tranid', null, 'is', getWOid));

						/*columns[0] = new nlobjSearchColumn('line');
						columns[1] = new nlobjSearchColumn('item');	
						columns[2] = new nlobjSearchColumn('quantity');
						columns[3] = new nlobjSearchColumn('quantitypicked');
						columns[4] = new nlobjSearchColumn('quantityshiprecv');
						columns[5] = new nlobjSearchColumn('tranid');	
						columns[6] = new nlobjSearchColumn('location');
						columns[7] = new nlobjSearchColumn('internalid');
						columns[8] = new nlobjSearchColumn('quantitycommitted');
						columns[3].setSort();*/

						var WORec = nlapiSearchRecord('workorder','customsearch_wmsse_woscan_wosrh',filters,columns);


						if(WORec != null && WORec != '' && WORec != 'null' && WORec != 'undefined' && WORec.length >0 && (parseInt(backorderItmsCount) == (parseInt(WORec.length))) )

						{
							WOarray["custparam_error"] = "All components are on back ordered for this work order";
							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
							return;
						}
					}

					var pickedQty  = getopentaskDetails(woid); 
					if(pickedQty == '' || pickedQty == null || isNaN(pickedQty))
					{
						pickedQty = 0;
					}
					nlapiLogExecution('Debug', 'pickedQty', pickedQty);

					if(Number(Big(totalWOQty).minus(pickedQty)) == 0)
					{
						WOarray["custparam_error"] = "All the items in this work order are picked.";						
						response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
						return;
					}

					var woToLocationID=WORecinternalids[0].getValue('location',null,'group');
							
					var whLocation= WORecinternalids[0].getValue('location',null,'group');

					var whCompany= WORecinternalids[0].getValue('custbody_nswms_company',null,'group');
					WOarray["custparam_whlocation"] = whLocation;
					WOarray["custparam_company"] =whCompany;

					message = 'whLocation = ' + whLocation + '<br>';
					message = message + 'whCompany = ' + whCompany;
					nlapiLogExecution('DEBUG', 'WO Details', message);
					WOarray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);




				}
				else
				{			
					WOarray["custparam_error"] = "Please enter/scan valid work order#";

					response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);

				}
			}
			else if(validatewo=="IVL")
			{
				WOarray["custparam_error"] = "This work order is not mapped with any warehouse location";

				response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
				return;
			}
			else if(validatewo=="IWL")
			{
				WOarray["custparam_error"] = "This work order is mapped with other warehouse location";

				response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
				return;
			}
			else{
				WOarray["custparam_error"] = "Please enter/scan valid work order#";

				response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
			}

		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}
function getopentaskDetails(woInternalId)
{
	var pickQty = 0;
	
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); 
	opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

	var opentaskColumns =  new Array();

	//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum'));

	var opentaskResultsArray = new Array();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);
	
	if(opentaskResults !=null && opentaskResults !='')
	{
	
		for(var k=0;k<opentaskResults.length;k++)
		{
			nlapiLogExecution('Debug', 'pickedQty', pickQty);
			var vActqty=opentaskResults[k].getValue('custrecord_wmsse_act_qty',null,'sum');
			if(vActqty == null || vActqty =='' || vActqty=='null')
			{
				vActqty=0;
			}
			
			pickQty = Number(Big(pickQty).plus(vActqty));
			
		}
	}
	return pickQty;
}

function fntocheckwo(woid,loc){
	var resflag = "F";

	var filters=new Array();
	var columns=new Array();
	//filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
	filters.push(new nlobjSearchFilter('tranid', null, 'is', woid));
	/*if(loc!=null && loc!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', loc));*/
	//filters.push(new nlobjSearchFilter('status', null, 'anyof',['WorkOrd:B','WorkOrd:D']));

	//columns[0] = new nlobjSearchColumn('location');

	var WORecinternalids=nlapiSearchRecord('workorder','customsearch_wmsse_woscan_validation_srh',filters,columns);

	if(WORecinternalids!=null && WORecinternalids!="")
	{
		resflag ="T";
		var woLocation=WORecinternalids[0].getValue('location');
		if(woLocation == null || woLocation == '' || woLocation =='null' || woLocation == 'undefined')
		{
			resflag ="IVL";
		}
		if(woLocation != null && woLocation !='' && (woLocation != loc))
		{
			resflag ="IWL";
		}

	}


	return resflag;

}
