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
function PickingSO(request, response)
{
	if (request.getMethod() == 'GET')
	{


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');


		var getOptedField = request.getParameter('custparam_option');		
		var userAccountId = ctx.getCompany();		
		var vTranType = request.getParameter('custparam_trantype');
		var getPickreportid=request.getParameter('custparam_pickreportid');

		var logmsg = 'getLanguage. = ' + getLanguage + '<br>';
		logmsg = logmsg + 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'vTranType. = ' + vTranType + '<br>';	
		logmsg = logmsg + 'userAccountId. = ' + userAccountId + '<br>';		
		nlapiLogExecution('DEBUG', 'Values :', logmsg);

		var st0,st1,st2,st3;
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
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
			var headerVar='Picking';

			if(vTranType == 'salesorder')
			{
				headerVar='Picking SO#';
				st0 = domainName + "-SO Picking";
				st1 = "Enter/Scan Sales Order#";
			}
			else
			{
				headerVar='Picking TO#';
				st0 = domainName + "-TO Picking";
				st1 = "Enter/Scan Transfer Order#";	
			}
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
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "'" +
			" type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterso').value == '')" +
		"{if(document.getElementById('hdnTrantype').value=='salesorder'){document.getElementById('div_error').innerHTML ='Please enter/scan sales order#';}" +
		"else{document.getElementById('div_error').innerHTML ='Please enter/scan transfer order#';}return false;}else{this.form.submit();" +
		"this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+



		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnTrantype' id='hdnTrantype' value=" + vTranType + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				</td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='enterso'  class='smalltextbox'  id='enterso' type='text'/>"+

		"				<input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td width='20px'>" +
		"&nbsp;</td>"+
		"	<td ><input name='cmdSearch' type='submit' value='List' width='100px'/></td>"+
		"			</tr></table>"+
		"		<table>	<tr>"+

		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"		 </table>"+

		"	</form>"+
		"<script type='text/javascript'>document.getElementById('enterso').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {


		var optedField = request.getParameter('enterso');
		var optedEvent = request.getParameter('cmdPrevious');
		var tranType = request.getParameter('hdnTrantype');
		var SOarray=new Array();

		var getPickreportid=request.getParameter('hdnPickReportId');
		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_pickreportid"] =getPickreportid;

		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

		var whlocation = request.getParameter('custparam_whlocation');

		var context = nlapiGetContext();

		var userAccountId = context.getCompany();

		// check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
		var crossSubsidiaryFeature=isIntercompanyCrossSubsidiaryFeatureEnabled();
		var st11,st12;
		if( getLanguage == 'es_ES')
		{
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "MainMenu";
		}
		else
		{
			st11 = "INVALID OPTION";
			st12 = "MainMenu";
		} 
		SOarray["custparam_error"] = st11;
		SOarray["custparam_screenno"] = st12;
		SOarray["custparam_soid"] = request.getParameter('enterso');
		SOarray["custparam_trantype"] = request.getParameter('hdnTrantype');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('DEBUG', 'PREVIOUS F7 Pressed');
			SOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_fulfillmenu_sng', 'customdeploy_wmsse_fulfillmenu_sng', false, SOarray);

		}
		else
		{
			nlapiLogExecution('DEBUG','request.getParameter("cmdSearch")',request.getParameter('cmdSearch'));
			if(request.getParameter('cmdSearch')=="List")
			{
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan_sng', 'customdeploy_wmsse_solist_scan_sng', false, SOarray);
				return;
			}
			var getSOid=request.getParameter('enterso');			


			var validSo = funtoCheckSo(getSOid,whlocation,tranType);

			var logmsg = 'optedEvent. = ' + optedEvent + '<br>';
			logmsg = logmsg + 'getSOid. = ' + getSOid+ '<br>';		
			logmsg = logmsg + 'whlocation. = ' + whlocation + '<br>';		
			logmsg = logmsg + 'validSo. = ' + validSo + '<br>';			
			nlapiLogExecution('DEBUG', 'Values :', logmsg);
			if(validSo!=null && validSo!=''){

				var customer = validSo[0].getValue('entity');
				var vOrdid = validSo[0].getValue('internalid');

				var vType='SalesOrd';
				if(tranType=='salesorder')
					vType='SalesOrd';
				else if(tranType=='transferorder')
					vType='TrnfrOrd';


				//var SORecinternalids=getSOLineDetailsItem(vOrdid,tranType,null,whlocation);
				var SORecinternalids = getSOscandetails(vOrdid,tranType,whlocation);

				if(SORecinternalids!=null && SORecinternalids!='' && SORecinternalids.length>0)
				{

					var vLinecount=0;
					var vColumnslist=SORecinternalids[0].getAllColumns();


					var vOpentaskdetails = getPickedqtydetails(vOrdid,tranType,whlocation);
					for(var vSOresults=0;vSOresults<SORecinternalids.length;vSOresults++)
					{

						var vsoitemQty=SORecinternalids[vSOresults].getValue('quantity');
						var vsoitemType=SORecinternalids[vSOresults].getValue('type','item');


						if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
							|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
						{
							var vsoitemCommitedQty=SORecinternalids[vSOresults].getValue('quantity');
						}
						else
						{
							var vsoitemCommitedQty=SORecinternalids[vSOresults].getValue('quantitycommitted');
						}

						var vsoitemNSReceivedQty=SORecinternalids[vSOresults].getValue('quantitypicked');
						var vsoitemNSshippedQty=SORecinternalids[vSOresults].getValue('quantityshiprecv');
						var vsoitem = SORecinternalids[vSOresults].getText('item');
						var vsoitemId = SORecinternalids[vSOresults].getValue('item');
						var vsoitemLine = SORecinternalids[vSOresults].getValue('line');
						var vConversionRate = SORecinternalids[vSOresults].getValue('formulanumeric');

						if(vConversionRate!=null && vConversionRate!='')
						{
							vsoitemCommitedQty=Number(Big(vsoitemCommitedQty).div(vConversionRate));
							vsoitemNSReceivedQty=Number(Big(vsoitemNSReceivedQty).div(vConversionRate));
							vsoitemNSshippedQty=Number(Big(vsoitemNSshippedQty).div(vConversionRate));
						}



						if(tranType == 'transferorder' && vsoitemLine != null)
							vsoitemLine = parseInt(vsoitemLine)-1;

						var vsoitemopentaskQty=0;
						for(var vOpentaskcount = 0; vOpentaskcount < vOpentaskdetails.length; vOpentaskcount++)
						{

							var vOpentaskitem = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_sku',null,'group');
							var vOpentaskLine = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_line_no',null,'group');

							if(vOpentaskitem==vsoitemId && vOpentaskLine==vsoitemLine)
							{
								vsoitemopentaskQty = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_act_qty',null,'sum');
								break;
							}

						}


						if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
						{
							vsoitemopentaskQty = 0;
						}

						if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
						{
							vsoitemNSReceivedQty = 0;
						}


						var vsoitemPickedQty = Number(Big(vsoitemopentaskQty).plus(vsoitemNSReceivedQty));


						if(vsoitemPickedQty == ''  || vsoitemPickedQty == null || vsoitemPickedQty == 'null' || vsoitemPickedQty== 'undefined')
						{
							vsoitemPickedQty = 0;
						}
						if(vsoitemNSshippedQty == ''  || vsoitemNSshippedQty == null || vsoitemNSshippedQty == 'null' || vsoitemNSshippedQty== 'undefined')
						{
							vsoitemNSshippedQty = 0;
						}
						if(tranType=='transferorder')
						{
							if(parseInt(vsoitemQty)<0)
								vsoitemQty=vsoitemQty*(-1);
						}



						if(vsoitemCommitedQty == null || vsoitemCommitedQty == '')
							vsoitemCommitedQty=0;
						if(vsoitemNSReceivedQty==null || vsoitemNSReceivedQty=='')
							vsoitemNSReceivedQty=0;

						if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
							|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
						{

							var vsoitemRemQty = Number(Big(vsoitemCommitedQty).minus(vsoitemPickedQty));
						}
						else
						{
							 vsoitemCommitedQty=new Big(vsoitemCommitedQty);
							 vsoitemNSshippedQty=new Big(vsoitemNSshippedQty);
							 vsoitemPickedQty=new Big(vsoitemPickedQty);
							var vsoitemRemQty = Number((vsoitemCommitedQty).plus(vsoitemNSshippedQty).minus(vsoitemPickedQty));
						}

						if(parseFloat(vsoitemRemQty)>0)
						{
							vLinecount=parseFloat(vLinecount)+1;
						}
						var soInternalId=SORecinternalids[vSOresults].getValue('internalid');
						SOarray["custparam_soid"] = SORecinternalids[vSOresults].getValue('tranid');						
						SOarray["custparam_sointernalid"] = soInternalId;

					} 
					var cartonScreenRuleValue='F';

					SOarray["custparam_cartonscreenrulevalue"] =cartonScreenRuleValue;

					var actualBeginTime=TimeStamp();
					SOarray["custparam_actualbegintime"]=actualBeginTime;
					if(parseFloat(vLinecount)>0)
					{

						SOarray["custparam_error"] ='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
						return;

					}
					else
					{
						if(tranType == 'salesorder')
						{
							SOarray["custparam_error"] = "Picking completed for this sales order# "+getSOid;
						}
						else
						{
							SOarray["custparam_error"] = "Picking completed for this transfer order# "+getSOid;	
						}

						response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
						return;
					} 
				}
				else
				{



					var SOtrantypefilters=new Array();
					SOtrantypefilters.push(new nlobjSearchFilter('tranid',null,'is',getSOid));
					SOtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

					// This search returns required results, 4k records fetching not required.
					var SORecinternalids=nlapiSearchRecord(tranType,'customsearch_wmsse_transactiondetails',SOtrantypefilters,null);
					var soid='';
					if(SORecinternalids!=null && SORecinternalids!='')
					{
						//Case# 201414555  start
						sowhLocation=SORecinternalids[0].getValue('location');
						if( sowhLocation == null || sowhLocation == '' || sowhLocation =='null' || sowhLocation == 'undefined')
						{
							if(tranType=='salesorder')
								trType='sales order';
							else if(tranType=='transferorder')
								trType='transfer order';

							SOarray["custparam_error"] = "This "+trType+" is not mapped with any warehouse location";
							response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);

							return;
						}

						soid=SORecinternalids[0].getValue('internalid');
						SOarray["custparam_poid"] = SORecinternalids[0].getValue('tranid');					

						SOarray["custparam_trantype"] = tranType;
						var SOfilters=new Array();
						SOfilters.push(new nlobjSearchFilter('tranid',null,'is',getSOid));
						SOfilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
						SOfilters.push(new nlobjSearchFilter('recordtype',null,'is',tranType));
						var vRoleLocation=getRoledBasedLocation();
						if(vRoleLocation != null && vRoleLocation != '' && vRoleLocation != 0)
						{
							SOfilters.push(new nlobjSearchFilter('location', null, 'anyof', vRoleLocation));
						}



						// This search returns required results, 4k records fetching not required.
						var SORec=nlapiSearchRecord('transaction','customsearch_wmsse_transactiondetails',SOfilters,null);
						if(SORec!=null&&SORec!='')
						{
							var soStatus=SORec[0].getValue('status');							

							if(soStatus=='pendingFulfillment'||soStatus=='pendingBillingPartFulfilled')
							{

							}
							else
							{
								if(soStatus == 'pendingApproval')
								{
									if(tranType == 'salesorder')
										SOarray["custparam_error"]="Sales order# "+getSOid+" is not approved";
									else
										SOarray["custparam_error"]="Transfer order# "+getSOid+" is not approved";
								}
								else
								{
									if(tranType == 'salesorder')
										SOarray["custparam_error"]="Please enter/scan valid sales order status";
									else
									{
										if(soStatus == 'pendingReceipt')
										{
											SOarray["custparam_error"]="Picking completed  for  transfer order# "+getSOid+". ";
										}
										else
										{
											SOarray["custparam_error"]="Please enter/scan valid transfer order status";
										}

									}

								}


								response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
								return;
							}

						}
						else
						{
							if(tranType == 'salesorder')
								SOarray["custparam_error"]="Please enter/scan valid sales order ";
							else
								SOarray["custparam_error"]="Please enter/scan valid transfer order ";
							response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
							return;
						}
					}
					else
					{
						if(tranType == 'salesorder')
							SOarray["custparam_error"]="Please enter/scan valid sales order ";
						else
							SOarray["custparam_error"]="Please enter/scan valid transfer order ";
						response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
						return;
					}

					if(tranType == 'salesorder')
						SOarray["custparam_error"]="Please enter/scan valid sales order ";
					else
						SOarray["custparam_error"]="Please enter/scan valid transfer order ";
					response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
					return;




				}
				SORecinternalids=null; 

			}
			else{


				var SOtrantypefilters=new Array();
				SOtrantypefilters.push(new nlobjSearchFilter('tranid',null,'is',getSOid));
				SOtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));				
				// This search returns required results, 4k records fetching not required.
				var SORecinternalids=nlapiSearchRecord(tranType,'customsearch_wmsse_transactiondetails',SOtrantypefilters,null);
				var soid='';
				if(SORecinternalids!=null && SORecinternalids!='')
				{
					soid=SORecinternalids[0].getValue('internalid');
					SOarray["custparam_poid"] = SORecinternalids[0].getValue('tranid');				


					SOarray["custparam_trantype"] = tranType;
					var SOfilters=new Array();
					SOfilters.push(new nlobjSearchFilter('tranid',null,'is',getSOid));
					SOfilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
					SOfilters.push(new nlobjSearchFilter('recordtype',null,'is',tranType));
					var vRoleLocation=getRoledBasedLocation();
					if(vRoleLocation != null && vRoleLocation != '' && vRoleLocation != 0)
					{
						SOfilters.push(new nlobjSearchFilter('location', null, 'anyof', vRoleLocation));
					}

					// This search returns required results, 4k records fetching not required.
					var SORec=nlapiSearchRecord('transaction','customsearch_wmsse_transactiondetails',SOfilters,null);
					if(SORec!=null&&SORec!='')
					{
						var soStatus=SORec[0].getValue('status');

						if(soStatus=='pendingFulfillment'||soStatus=='pendingBillingPartFulfilled')
						{

						}
						else
						{
							if(soStatus == 'pendingApproval')
							{
								if(tranType == 'salesorder')
									SOarray["custparam_error"]="Sales order# "+getSOid+" is not approved";
								else
									SOarray["custparam_error"]="Transfer order# "+getSOid+" is not approved";
							}
							else
							{
								if(tranType == 'salesorder')
									SOarray["custparam_error"]="Please enter/scan valid sales order status";
								else
									SOarray["custparam_error"]="Please enter/scan valid transfer order status";
							}
							response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
							return;
						}

					}
					else
					{
						if(tranType == 'salesorder')
							SOarray["custparam_error"]="Please enter/scan valid sales order#  ";
						else
							SOarray["custparam_error"]="Please enter/scan valid transfer order# ";
						response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
						return;
					}
				}
				else
				{
					if(tranType == 'salesorder')
						SOarray["custparam_error"]="Please enter/scan valid sales order# ";
					else
						SOarray["custparam_error"]="Please enter/scan valid transfer order# ";
					response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
					return;
				}
				if(tranType == 'salesorder')
					SOarray["custparam_error"]="Please enter/scan valid sales order# ";
				else
					SOarray["custparam_error"]="Please enter/scan valid transfer order# ";
				response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
				return;

			}

		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}
/**
 * To validate order 
 * @param soid
 * @param loc
 * @param tranType
 * @returns
 */
function funtoCheckSo(soid,loc,tranType){

	var resflag = "F";
	nlapiLogExecution('DEBUG', 'tranType', tranType);
	var SOtrantypefilters=new Array();
	SOtrantypefilters.push(new nlobjSearchFilter('tranid',null,'is',soid));
	SOtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

	// This search returns required results, 4k records fetching not required.
	var SORecinternalids=nlapiSearchRecord(tranType,'customsearch_wmsse_transactiondetails',SOtrantypefilters,null);
	if(SORecinternalids!=null && SORecinternalids!="")
		resflag ="T";
	SOtrantypefilters=null;
	SOtrantypecols=null;
	return SORecinternalids;
}

