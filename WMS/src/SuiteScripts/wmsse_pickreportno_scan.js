/**
 * Script Description
 * This script is used to scan the Order from Open orders list.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan pick report number
 */
function Picking(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var getOptedField = request.getParameter('custparam_option');
		var userAccountId = ctx.getCompany();
		var vTranType = request.getParameter('custparam_trantype');
		var getSONo = request.getParameter('custparam_soid');
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var whLocation=request.getParameter('custparam_whlocation');
		var whLocationName=request.getParameter('custparam_whlocationname');
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-CHECKIN SO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			var headerVar='Picking Pick Report#';


			//headerVar='Picking SO#';
			st0 = domainName + "-Picking";
			st1 = "Enter/Scan Pick Report#";

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
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterpickreportno').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan Pick report no#';return false;}else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr><tr><td></td></tr><tr><td></td></tr></table>"+


		/*"		<tr><td>"+
		"		<table>"+*/
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
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoId' value=" + getSONo + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterpickreportno'  class='smalltextbox'  id='enterpickreportno' type='text'/>"+
		"				</td>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"	<td width='10px'></td><td ></td>"+
		"			</tr><tr><td></td></table>"+
		"		<table>	<tr>"+
		//"				<td align = 'left'><input name='cmdSend'  class='defaultlink'   type='submit' value='Next' onclick='return validateForm();'/></td><td>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"		 </table>";
		//" 	</td></tr></table>"+		
		var PickRepArray = getPickRepNumDetails(getSOInternalId,whLocation);
		if(PickRepArray!=null && PickRepArray!='')
		{
			nlapiLogExecution('DEBUG', 'PickRepArray', PickRepArray.length);
			if(PickRepArray.length>0)
			{
				html = html + "	<table>"+
				" <tr>"+
				" <td>"+
				"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
				" <tr class='uir-machine-headerrow' >"+
				" <td class='listheadertdleft listheadertextb uir-column-large'> Pick Report#"+
				" </td>"+	
				"</tr>";

				var vPickRepArray=new Array();
				for (var s = 0; s < PickRepArray.length; s++)
				{

					var pickrep = PickRepArray[s].getValue('custrecord_wmsse_pickreport_no'); 
					if(pickrep != null && vPickRepArray.indexOf(pickrep)==-1)
					{
						vPickRepArray.push(pickrep) ;
						var vClass='uir-list-row-tr line uir-list-row-even';
						if(s!=0 && s%2!=0)
							vClass='uir-list-row-tr line uir-list-row-odd';
						var locURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan');
						var linkURL_1 = locURL_1 + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_trantype=' + vTranType + '&custparam_language=' + getLanguage + '&custparam_soid=' + getSONo  +'&custparam_customer=' + customer  + '&custparam_actualbegintime=' + actualBeginTime + '&custparam_company=' + whCompany + '&custparam_sointernalid=' + getSOInternalId + '&custparam_cartonscreenrulevalue='+ cartonScreenRuleValue + '&custparam_pickreportid='+ pickrep;
						//var linkURL_1 = locURL_1 + '&custparam_pickreportid=' + pickrep;

						html = html + " <tr  class='"+ vClass +"'>"+
						" <td><a name='link1URL_1' href='" + linkURL_1 + "'><div style='cursor: pointer;color: #255599;text-decoration: none;'>" + pickrep +"</div></a></td>"+

						"</tr>";
					}

				}
				html = html +" </table>";
			}

			PickRepArray =null;

			"	</form>"+
			"<script type='text/javascript'>document.getElementById('enterpickreportno').focus();</script>"+
			"</body>"+
			"</html>";			

			response.write(html);
		}

	}
	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('enterpickreportno');
		var optedEvent = request.getParameter('cmdPrevious');
		var tranType = request.getParameter('hdnTrantype');
		var SOarray=new Array();
		

		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_trantype"] = request.getParameter('hdnTrantype');
		var whlocation = request.getParameter('custparam_whlocation');
		var soInternalId = request.getParameter('hdnSoInternalId');
		var context = nlapiGetContext();
		var SONum= request.getParameter('hdnSoId');
		var userAccountId = context.getCompany();
		SOarray["custparam_soid"] =SONum;
		SOarray["custparam_sointernalid"] = soInternalId;
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
		SOarray["custparam_pickreportid"] = request.getParameter('enterpickreportno');
		SOarray["custparam_trantype"] = request.getParameter('hdnTrantype');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			SOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
		}
		else
		{

			var getPickreportid=request.getParameter('enterpickreportno');
			var validPickReportNo = funtoCheckPickReportNo(getPickreportid,whlocation);
					
			var logMsg1 = 'getPickreportid =' + getPickreportid + '<br>';
			logMsg1 = logMsg1 + 'whlocation = ' + whlocation + '<br>';
			logMsg1 = logMsg1 + 'validPickReportNo = ' + validPickReportNo + '<br>';
			nlapiLogExecution('DEBUG', 'parametersof post', logMsg1);
			
			
			var soInternalIds=new Array();
			var customer = '';
			if(validPickReportNo!=null && validPickReportNo!=''){

				for(var j=0;j<validPickReportNo.length;j++)
				{
					if(soInternalIds.indexOf(validPickReportNo[j].getValue('custrecord_wmsse_order_no'))==-1)
					{
						customer = validPickReportNo[j].getValue('custrecord_wmsse_customer');
						soInternalIds.push(validPickReportNo[j].getValue('custrecord_wmsse_order_no'));
					}
				}
				if(soInternalId !=null && soInternalId !='' && soInternalId !='null' && soInternalId != 'undefined')
				{
					if(soInternalIds.indexOf(soInternalId)==-1)
					{
						SOarray["custparam_error"]='This pick report# does not belongs to transaction "'+SONum+'"';
						response.sendRedirect('SUITELET', 'customscript_wmsse_pickreportno_scan', 'customdeploy_wmsse_pickreportno_scan', false, SOarray);
						return;
					}
				}
				nlapiLogExecution('DEBUG','soInternalIds',soInternalIds);
				var vType='SalesOrd';
				if(tranType=='salesorder')
					vType='SalesOrd';
				else if(tranType=='transferorder')
					vType='TrnfrOrd';


				if(soInternalIds.length == 1)
				{
					var getSOid = soInternalIds[0];
					var filters = new Array();
					var columns = new Array();

					filters.push(new nlobjSearchFilter('internalid', null, 'is', getSOid));
					filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

					if(whlocation !=null && whlocation !='' && whlocation !='undefined' && whlocation !='')
						filters.push(new nlobjSearchFilter('location', null, 'anyof', whlocation));
					//To get all the open orders list from saved search
					var SORecinternalids = new nlapiSearchRecord('transaction', 'customsearch_wmsse_fulfil_ordline_detail', filters, columns);
					nlapiLogExecution('DEBUG','SORecinternalids',SORecinternalids);
					//var soid='';
					//var soInternalId='';
					if(SORecinternalids!=null && SORecinternalids!='' && SORecinternalids.length != null)
					{
						nlapiLogExecution('DEBUG','SORecinternalids.length',SORecinternalids.length);
						var vLinecount=0;
						var vColumnslist=SORecinternalids[0].getAllColumns();

						var custIndex = 12;
						var commitedQtyIndex = 25;
						var fulfilledQtyIndex = 26;
						var conversionRateIndex=27;
						var totalPickedQtyIndex =7;
						var totalNSPickedQtyIndex =37;
						var ERPConfirmedQty =38;
						for(var x1=0;x1<vColumnslist.length;x1++)
						{
							var summaryLabel = vColumnslist[x1].getLabel();
							var name =  vColumnslist[x1].getName();
							if(summaryLabel == 'Customer Id')
							{
								custIndex = x1;
							}
							else if (summaryLabel == 'Committed Quantity')
							{
								commitedQtyIndex = x1;
							}
							else if (summaryLabel == 'Fulfilled Quantity' && name == 'formulanumeric')
							{
								fulfilledQtyIndex = x1;
							}
							else if (summaryLabel == 'Conversion Rate')
							{
								conversionRateIndex = x1;
							}
							else if (summaryLabel == 'Total Picked Quantity')
							{
								totalPickedQtyIndex = x1;
							}
							else if (summaryLabel == 'ERPpickedQuantity')
							{
								totalNSPickedQtyIndex = x1;
							}
							else if (summaryLabel == 'ERP CONFIRMED QTY')
							{
								ERPConfirmedQty = x1;
							}
							else
							{

							}
						}

						for(var k=0;k<SORecinternalids.length;k++)
						{
							var vsoitemCommitedQty=SORecinternalids[k].getValue('quantitycommitted',null,'max');
							var vsoitemQty=SORecinternalids[k].getValue('quantity',null,'max');
							var vsoitemopentaskQty=SORecinternalids[k].getValue(vColumnslist[totalPickedQtyIndex]);
							var vsoitemErpConfirmedQty=SORecinternalids[k].getValue(vColumnslist[ERPConfirmedQty]);
							var vsoitemNSReceivedQty=SORecinternalids[k].getValue(vColumnslist[totalNSPickedQtyIndex]);
							if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
							{
								vsoitemopentaskQty = 0;
							}
							if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' || vsoitemErpConfirmedQty=='undefined' )
							{
								vsoitemErpConfirmedQty = 0;
							}
							if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
							{
								vsoitemNSReceivedQty = 0;
							}

							var vsoitemPickedQty = parseFloat(vsoitemopentaskQty)+parseFloat(vsoitemErpConfirmedQty)+(parseFloat(vsoitemNSReceivedQty)-parseFloat(vsoitemErpConfirmedQty));
						

							nlapiLogExecution('DEBUG', 'vsoitemPickedQty', vsoitemPickedQty);
							if(vsoitemPickedQty == ''  || vsoitemPickedQty == null || vsoitemPickedQty == 'null' || vsoitemPickedQty== 'undefined')
							{
								vsoitemPickedQty = 0;
							}

							if(tranType=='transferorder')
							{
								if(parseInt(vsoitemQty)<0)
									vsoitemQty=vsoitemQty*(-1);
							}
							//var vsoitemRemQty=parseFloat(vsoitemCommitedQty)-parseFloat(vsoitemPickedQty);
							var vsoitemRemQty=parseFloat(vsoitemQty)-parseFloat(vsoitemPickedQty);
							nlapiLogExecution('DEBUG', 'vsoitemRemQty', vsoitemRemQty);
							if(parseFloat(vsoitemRemQty)>0)
							{
								vLinecount=parseFloat(vLinecount)+1;
							}
							var soInternalId=SORecinternalids[k].getValue('internalid',null,'group');
							SOarray["custparam_soid"] = SORecinternalids[k].getValue('tranid',null,'group');

							nlapiLogExecution('DEBUG', 'soInternalId', soInternalId);
							SOarray["custparam_sointernalid"] = soInternalId;



							var whLocation= SORecinternalids[k].getValue('location',null,'group');

							var whCompany= SORecinternalids[k].getValue('custbody_nswms_company',null,'group');
							//var customer = SORecinternalids[k].getValue('entity',null,'group');

							//var customer = SORecinternalids[k].getValue('internalid','customer','group');
							var ordType = SORecinternalids[k].getValue('custbody_wmsse_ordertype',null,'group');
							SOarray["custparam_company"] =whCompany;
							SOarray["custparam_customer"] =customer;
							SOarray["custparam_ordtype"] =ordType;
						} 

						var cartonScreenRuleValue='F';
						var sysruleFilters1 = new Array();
						sysruleFilters1.push(new nlobjSearchFilter('name', null, 'is', 'Manually pack orders?'));
						if(whlocation !=null && whlocation !='' && whlocation !='null') 
							sysruleFilters1.push(new nlobjSearchFilter('custrecord_wmssesite', null, 'anyof', ['@NONE@',whlocation]));
						sysruleFilters1.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						var sysruleColumns1 = new Array();
						sysruleColumns1[0] = new nlobjSearchColumn('custrecord_wmsserulevalue');
						sysruleColumns1[1] = new nlobjSearchColumn('custrecord_wmssesite').setSort();
						var systemRulesSearchresults1 = nlapiSearchRecord('customrecord_wmsse_sysrules', null, sysruleFilters1, sysruleColumns1);

						if(systemRulesSearchresults1 !=null && systemRulesSearchresults1 !='')
						{
							cartonScreenRuleValue=systemRulesSearchresults1[0].getValue('custrecord_wmsserulevalue');
						}
						systemRulesSearchresults1=null;
						sysruleColumns1=null;
						sysruleFilters1=null;
						if(cartonScreenRuleValue!=null && cartonScreenRuleValue!='')
						{
							if(cartonScreenRuleValue=="Y")
							{
								cartonScreenRuleValue="T";
							}
							else
							{
								cartonScreenRuleValue="F";
							}
						}
						nlapiLogExecution('DEBUG', 'cartonScreenRuleValue', cartonScreenRuleValue);

						var actualBeginTime=TimeStamp();
						SOarray["custparam_actualbegintime"]=actualBeginTime;
						if(parseFloat(vLinecount)>0)
						{
							if(cartonScreenRuleValue=="F")
							{
								SOarray["custparam_error"] ='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
								return;
							}
							else
							{ 
								SOarray["custparam_error"] ='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
								return;
							}
						}
						else
						{
							if(tranType == 'salesorder')
							{
								SOarray["custparam_error"] = "Please enter/scan valid sales order#";
							}
							else
							{
								SOarray["custparam_error"] = "Please enter/scan valid transfer order#";	
							}

							response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
							return;
						} 

					}
				}
				else
				{				

					SOarray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
					return;
				}
			}
			else
			{
				SOarray["custparam_error"]='Please enter/scan valid pickreport#';
				response.sendRedirect('SUITELET', 'customscript_wmsse_pickreportno_scan', 'customdeploy_wmsse_pickreportno_scan', false, SOarray);
				return;

			}



		}


	}
}
/**
 * To validate order 
 * @param soid
 * @param loc
 * @param tranType
 * @returns
 */
/*function funtoCheckPickReportNo(pickreportid,loc){


	var SOtrantypefilters=new Array();
	SOtrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',pickreportid));

	if(loc!=null && loc!="" && loc!='null')
		SOtrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', loc));


	var SORecinternalids=nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,SOtrantypefilters,null);

	return SORecinternalids;
}*/
function funtoCheckPickReportNo(pickreportid,loc){

	nlapiLogExecution('DEBUG', 'pickreportid', pickreportid);
	var SORecinternalids=new Array();
	var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh');
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',pickreportid));

	if(loc!=null && loc!="" && loc!='null')
		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', loc));
	
	var resLenDetails = OTsearchresult.runSearch();
	
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SORecinternalids = SORecinternalids.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	return SORecinternalids;
}

function  getPickRepNumDetails(SONo,whLocation)
{
	var filters = new Array();
	var columns = new Array();

	if(SONo != '' && SONo != null)
	filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof',SONo));
	
	if(whLocation != '' && whLocation != null)
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof',whLocation));
	
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', [9]));
	var columns = new Array();

	var PickRepDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_getpickreport_details', filters, columns);
	nlapiLogExecution('DEBUG', 'PickRepDetails', PickRepDetails);

	return PickRepDetails;
}
