/**
 * Script Description
 * This script is used to scan the Order from Open orders list.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan pick report no
 */
function PickingPickGenScan(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		
		var getOptedField = request.getParameter('custparam_option');
		
		var userAccountId = ctx.getCompany();
		
		var domainName = fndomainName();
		
		var st0,st1,st2,st3;
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

			headerVar='Picking Pick Report#';
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
			errMsg = request.getParameter('custparam_error');
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
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enternum').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan pick report#';return false;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+


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
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enternum'  class='textbox'  id='enternum' type='text'/>"+
		"				<input name='cmdSend1'  class='defaultlink'   type='submit' value='Next (Ent)' onclick='return validateForm();'/>"+
		"				</td>"+

		//"	<td width='10px'></td><td ></td>"+
		"			</tr></table>"+
		"		<table>	<tr><td></td></tr><tr><td></td></tr><tr><td></td></tr><tr>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='40px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"		 </table>"+
		//" 	</td></tr></table>"+
		"	</form>"+
		"<script type='text/javascript'>document.getElementById('enternum').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var pickreportid = request.getParameter('enternum');
		var optedEvent = request.getParameter('cmdPrevious');
		var SOarray=new Array();
		
		nlapiLogExecution('DEBUG', 'pickGenNo', pickreportid);
		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

		var whlocation = request.getParameter('custparam_whlocation');

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
			st11 = "INVALID OPTION";
			st12 = "MainMenu";
		} 
		SOarray["custparam_error"] = st11;
		SOarray["custparam_screenno"] = st12;
		SOarray["custparam_pickreportid"] = request.getParameter('enternum');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			SOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_picking_menu', 'customdeploy_wmsse_picking_menu', false, SOarray);
		}
		else
		{
			var vSearchResults = funtoCheckPickReportNo(pickreportid,whlocation)
			nlapiLogExecution('DEBUG', 'vSearchResults', vSearchResults);
			if(vSearchResults!=null && vSearchResults!='' && vSearchResults.length > 0)
			{
				var ordNumArr = new Array();
				for(var j=0;j<vSearchResults.length;j++)
				{
					ordNumArr.push(vSearchResults[j].getValue('custrecord_wmsse_order_no'));
				}
				nlapiLogExecution('DEBUG', 'ordNumArr', ordNumArr);
				var filters = new Array();
				if(ordNumArr.length >0)
				{
					filters.push(new nlobjSearchFilter('internalid', null, 'anyof', ordNumArr));
				}
				if(whlocation!=null && whlocation!='' && whlocation!='undefined' && whlocation!='')
					filters.push(new nlobjSearchFilter('location', null, 'anyof', whlocation));
				var soLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_fulfil_ordline_detail', filters, null);
				nlapiLogExecution('DEBUG', 'soLineDetails', soLineDetails);
				//Case # 201414258  start
				if(soLineDetails !=null && soLineDetails !='' && soLineDetails.length > 0)
				{
					vColumnslist=soLineDetails[0].getAllColumns();

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
					var isQtyforPicking='F';
					for(var m=0;m<soLineDetails.length;m++)
					{
						var vsoitemQty=soLineDetails[m].getValue(vColumnslist[commitedQtyIndex]);			 
						var vsoitemfulfillQty=soLineDetails[m].getValue(vColumnslist[fulfilledQtyIndex]);
						var vsoitemopentaskQty=soLineDetails[m].getValue(vColumnslist[totalPickedQtyIndex]);
						var vsoitemErpConfirmedQty=soLineDetails[m].getValue(vColumnslist[ERPConfirmedQty]);
						var vsoitemNSReceivedQty=soLineDetails[m].getValue(vColumnslist[totalNSPickedQtyIndex]);
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

						vsoitemopentaskQty=new Big(vsoitemopentaskQty);
						vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
						vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
						var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
						nlapiLogExecution('DEBUG','vsoitemRcvQty in big',vsoitemRcvQty);



						if(vsoitemQty==null || vsoitemQty=='')
							vsoitemQty=0;
						if(vsoitemRcvQty==null || vsoitemRcvQty=='')
							vsoitemRcvQty=0;
						if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
							vsoitemfulfillQty=0;
						nlapiLogExecution('DEBUG','vsoitemfulfillQty',vsoitemfulfillQty);
						nlapiLogExecution('DEBUG','vsoitemRcvQty',vsoitemRcvQty);


						vsoitemQty=new Big(vsoitemQty);
						vsoitemfulfillQty=new Big(vsoitemfulfillQty);
						vsoitemRcvQty=new Big(vsoitemRcvQty);
						var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
						nlapiLogExecution('DEBUG','vSoreminqty in Big',vSoreminqty);

						if(vSoreminqty >0 )
						{
							isQtyforPicking='T';
							break;
						}

					}

					if(isQtyforPicking=='F')
					{
						SOarray["custparam_error"] = 'All the items in the pick report are picked';
						response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
						return;
					}
				}
				//Case # 201414258  end
				var vTaskAssignTo=vSearchResults[0].getValue('custrecord_wmsse_task_assignedto');
				var vTaskAssignToText=vSearchResults[0].getText('custrecord_wmsse_task_assignedto');

				var vUser=getCurrentUser();
				nlapiLogExecution('DEBUG', 'vTaskAssignTo:vUser', vTaskAssignTo+":"+vUser);
				if((vTaskAssignTo == vUser)||(vTaskAssignTo == null || vTaskAssignTo =='' || vTaskAssignTo =='null' || vTaskAssignTo =='- None -'))
				{
					SOarray["custparam_pickreportid"] = request.getParameter('enternum');;
					SOarray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
					return;
				}
				else
				{
					SOarray["custparam_error"] = 'This task is assigned to '+vTaskAssignToText;
					response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
					return;
				}


			}
			else
			{
				SOarray["custparam_error"] = 'Please enter/scan valid pick report#';
				response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
				return;
			}

		}
	}
}

function getOrderDetails(pickGenNo,trantype)
{
	nlapiLogExecution('ERROR', 'pickGenNo,trantype',pickGenNo+","+trantype);

	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';

	var filters = new Array();
	var columns = new Array();
	if(pickGenNo!=null && pickGenNo!='' && pickGenNo!='null' && pickGenNo!='undefined')
		filters.push(new nlobjSearchFilter('custcol_multi_order_pickgen_no', null, 'is', pickGenNo));
	if(trantype!=null && trantype!='' && trantype!='undefined' && trantype!='null')
		filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	var SOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_pickgen_order_details', filters, columns);

	return SOLineDetails;
}
function funtoCheckPickReportNo(pickreportid,loc){


	var SORecinternalids=new Array();

	var SORecinternalidsresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh');
	SORecinternalidsresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',pickreportid));

	if(loc!=null && loc!="" && loc!='null')
		SORecinternalidsresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', loc));


	var resLenDetails = SORecinternalidsresult.runSearch();

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

