/**
 * Script Description
 * This script is used to scan the Order and also for dispaying open orders list.
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to display all open orders list
 */
function PickingSOList(request, response)
{
	if (request.getMethod() == 'GET') 
	{


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		
		var getOptedField = request.getParameter('custparam_option');		
		var userAccountId = ctx.getCompany();		
		var vTranType = request.getParameter('custparam_trantype');		
		var whLocation=request.getParameter('custparam_whlocation');		
		var whLocationName=request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		
		
		var soInternalIds=new Array();
		var vUser=getCurrentUser();
		var pickReportResults = funtoGetSoidofPickReportNo(whLocation,vUser);

		if(pickReportResults !=null && pickReportResults != '' && pickReportResults != 'null' && pickReportResults !='undefined')
		{
			for(var j=0;j<pickReportResults.length;j++)
			{

				soInternalIds.push(pickReportResults[j].getValue('internalid','custrecord_wmsse_order_no','max'));
			}
		}
		
		// check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
		var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
		
		var SORecinternalids=getSOList(vTranType,whLocation,soInternalIds,crossSubsidiaryFeature);	
		var actualBeginTime=TimeStamp();
		
		var getPageCount=request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize=5;
		var nextOrd = 0;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);
		

		var orderIdStr = request.getParameter('custparam_ordidarr');
		var orderIdArr = new Array();
		if(orderIdStr != null && orderIdStr != '')
		{
			orderIdArr = orderIdStr.split(',');
		}
		
		
		var logmsg = 'getLanguage. = ' + getLanguage + '<br>';
		logmsg = logmsg + 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'vTranType. = ' + vTranType + '<br>';	
		logmsg = logmsg + 'userAccountId. = ' + userAccountId + '<br>';		
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';		
		logmsg = logmsg + 'cartonScreenRuleValue. = ' + cartonScreenRuleValue + '<br>';		
		logmsg = logmsg + 'totalPageSizeValue. = ' + totalPageSizeValue + '<br>';		
		logmsg = logmsg + 'orderIdStr,orderIdArr. = ' + orderIdStr+','+orderIdArr + '<br>';		
		nlapiLogExecution('DEBUG', 'Values :', logmsg);


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
				st1 = "Enter/Scan Sales Order#/Pick Report#";
			}
			else
			{
				headerVar='Picking TO#';
				st0 = domainName + "-TO Picking";
				st1 = "Enter/Scan Transfer Order#/Pick Report#";	
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
	
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_Fulfillment');
		
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(soID,shipVia){if(document.getElementById('enterso').value == ''" +
				" && (soID == '' || soID == 'null' || soID ==null || soID == 'undefined')){if(document.getElementById('hdnTrantype').value=='salesorder')" +
				"{document.getElementById('div_error').innerHTML ='Please enter/scan sales order#/pick report#';}else{" +
				"document.getElementById('div_error').innerHTML ='Please enter/scan transfer order#/pick report#';}return false;}else" +
				"{document.getElementById('hdnSOID').value=soID;document.getElementById('hdnShipVia').value=shipVia;" +
				"document.forms['_rf_Fulfillment'].submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+" List</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr><tr><td></td></tr><tr><td></td></tr></table>"+


		
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdnSOID'  id='hdnSOID'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnShipVia'  id='hdnShipVia'>"+
		"				<input type='hidden' name='hdnTrantype' id='hdnTrantype' value=" + vTranType + ">"+	
		"				<input type='hidden' name='hdncartonScreenRuleValue' id='hdncartonScreenRuleValue' value=" + cartonScreenRuleValue + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterso'  class='smalltextbox'  id='enterso' type='text'/>"+
		"				</td>"+
		
		"			</tr><tr><td></td></table>"+
		"		<table>	<tr>"+
		"				<td><input name='cmdSend1' class='defaultlink'    type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		
		"			</tr>"+ 
		"		 </table>";
		if(SORecinternalids!=null && SORecinternalids!='' && SORecinternalids.length != null)
		{
			nlapiLogExecution('Debug', 'SORecinternalids.length', SORecinternalids.length);
			if(SORecinternalids.length>0)
			{
				if(vTranType == 'salesorder')
				{
					var strOrderText = "Sales Order#";
				}
				else
				{
					var strOrderText = "Transfer Order#";	
				}
				html = html + "	<table>"+
				" <tr>"+
				" <td>"+
				"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
				" <tr class='uir-machine-headerrow' >"+
				" <td>"+strOrderText+""+
				" </td>"+
				" <td>Customer"+
				" </td>"+
				" <td class='align-right' >#Lines"+
				" </td><td></td>"+
				" <td>Ship Date"+
				" </td><td></td>"+
				" <td>Ship Via"+
				" </td>"+
				"</tr>";


				var OrderNumArray=new Array();
				var orderCount=0;
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
				var vOpentaskdetails = getPickedqtylistdetails(soInternalIds,vTranType,whLocation);
				for (var s = 0; s < SORecinternalids.length; s++) {
					
					var vsoitemCommitedQty=SORecinternalids[s].getValue('quantitycommitted',null,'max');					
					var soInternalId=SORecinternalids[s].getValue('internalid',null,'group');
					var soId=SORecinternalids[s].getValue('tranid',null,'group');
					var vsoitemQty=SORecinternalids[s].getValue('quantity',null,'max');
					//var vsoitemopentaskQty=SORecinternalids[s].getValue(vColumnslist[totalPickedQtyIndex]);
					var vsoitemErpConfirmedQty=SORecinternalids[s].getValue(vColumnslist[ERPConfirmedQty]);
					var vsoitemNSReceivedQty=SORecinternalids[s].getValue(vColumnslist[totalNSPickedQtyIndex]);
					var vsoitemId = SORecinternalids[s].getValue('item',null,'group');
					var vsoitemLine = SORecinternalids[s].getValue('line',null,'group');	
					var vsoitemopentaskQty=0;
					for(var vOpentaskcount = 0; vOpentaskcount < vOpentaskdetails.length; vOpentaskcount++)
					{
						var vOpentaskitem = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_sku',null,'group');
						var vOpentaskLine = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_line_no',null,'group');
						var vOpentaskid = vOpentaskdetails[vOpentaskcount].getValue('tranid','custrecord_wmsse_order_no','group');

						if(vOpentaskitem==vsoitemId && vOpentaskLine==vsoitemLine && vOpentaskid==soId)
						{
							vsoitemopentaskQty = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_act_qty',null,'max');
							break;
						}


					}
					
					
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
					var vsoitemPickedQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty.minus(vsoitemErpConfirmedQty))));
					nlapiLogExecution('Debug', 'vsoitemPickedQty', vsoitemPickedQty);
					
					if(vTranType=='transferorder')
					{
						if(parseInt(vsoitemQty)<0)
							vsoitemQty=vsoitemQty*(-1);
					}
					
					var itemCommitedQty=SORecinternalids[s].getValue(vColumnslist[commitedQtyIndex]);			 
					var itemfulfillQty=SORecinternalids[s].getValue(vColumnslist[fulfilledQtyIndex]);
				
					if(itemCommitedQty == null || itemCommitedQty == '')
						itemCommitedQty=0;
					if(itemfulfillQty==null || itemfulfillQty=='')
						itemfulfillQty=0;
														
									
					itemCommitedQty=new Big(itemCommitedQty);
					itemfulfillQty=new Big(itemfulfillQty);
					
					var vsoitemRemQty = Number((itemCommitedQty.plus(itemfulfillQty)).minus(vsoitemPickedQty));
					nlapiLogExecution('DEBUG', 'vsoitemRemQty', vsoitemRemQty);
					
					if(parseFloat(vsoitemRemQty)<=0)
					{
						
						continue;
					}
					if(OrderNumArray.indexOf(soId)!=-1)
					{
						
						continue;
					}
					else
					{
						
						if(parseInt(orderCount)<5)
						{
							OrderNumArray.push(soId);
						}
						if(parseInt(orderCount) >= 5 && parseInt(nextOrd) == 0)
						{
							
							nextOrd = parseInt(nextOrd) + 1;
						}

					}
					

					var customer=SORecinternalids[s].getValue('internalid','customer','group');
					var whCompany= SORecinternalids[s].getValue('custbody_nswms_company',null,'group');
					var ordType = SORecinternalids[s].getValue('custbody_wmsse_ordertype',null,'group');
					var department = SORecinternalids[s].getValue('department',null,'group');
					var vclass = SORecinternalids[s].getValue('class',null,'group');
					
					if(parseInt(orderCount)<5)
					{
						var SOLineCountDets=getSOLineCountList(vTranType,whLocation,soInternalId,crossSubsidiaryFeature);
						
						var countVal = 0;
						if(orderIdArr != null && orderIdArr != '')
						{
							for(var f=0; f<orderIdArr.length;f++)
							{
								if(orderIdArr[f] == soInternalId)
								{
									countVal++;
								}
							}
						}
						var vLineCount=0;
						var customerName="";
						var vShipDate="";
						var vShipVia="";
						if(SOLineCountDets != null && SOLineCountDets != '')
						{
							for(var x=0;x<SOLineCountDets.length;x++)
							{
								if(countVal > x)
								{
									continue;
								}
								if(OrderNumArray.indexOf(soInternalId)==-1)
								{
									orderCount=parseInt(orderCount)+1;
									orderIdArr.push(soInternalId);
								}
								nlapiLogExecution('Debug', 'orderCount', orderCount);
								vLineCount=SOLineCountDets[x].getValue('line',null,'count');  
								customerName=SOLineCountDets[x].getValue('entityid','customer','group');
								if(customerName == null || customerName == '')
									customerName=SOLineCountDets[x].getValue('altname','customer','group');
								if(customerName != null && customerName != '' && customerName.length>20)						
									customerName=customerName.substring(0,20);
								vShipDate=SOLineCountDets[x].getValue('shipdate',null,'group'); 
								vShipVia=SOLineCountDets[x].getText('shipmethod',null,'group');
								vShipViaID=SOLineCountDets[x].getValue('shipmethod',null,'group');


								nlapiLogExecution('Debug', 'vLineCount', vLineCount);
								var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng');						 
								var linkURL_1 = checkInURL_1 + '&custparam_ordtype='+ordType+'&custparam_department='+department+'&custparam_class='+vclass+'&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_trantype=' + vTranType + '&custparam_language=' + getLanguage + '&custparam_soid=' + soId  + '&custparam_customer=' + customer  + '&custparam_actualbegintime=' + actualBeginTime + '&custparam_company=' + whCompany + '&custparam_sointernalid=' + soInternalId +'&custparam_shipmethod='+ vShipViaID +'&custparam_cartonscreenrulevalue='+ cartonScreenRuleValue+'&custparam_pickreportid='+ getPickreportid;

								html = html + "	<tr  class='uir-list-row-tr line uir-list-row-even'>"+
								" <td><a name='link1URL_1' href='#' onclick='return validateForm(\""+soInternalId+"\",\""+vShipViaID+"\");'> "+soId+"</a></td>";

						if(customerName != null && customerName != '' && customerName != '- None -')
							html = html + " <td>"+  customerName  +"</td>";
						else
							html = html + " <td> </td>";
						html = html + " <td class = 'align-right'>"+  vLineCount  +"</td>"+
						"<td> </td> <td>"+  vShipDate  +"</td><td></td>";

						if(vShipVia != null && vShipVia != '' && vShipVia != '- None -')
							html = html + " <td>"+  vShipVia  +"</td>";
						else
							html = html + " <td> </td>";	


								html = html + "</tr>";
								if(orderCount >= 5)
									break;
							}
						}
					}
					
					if(parseInt(orderCount)>=5)
					{
						var tsoInternalId=0;
						if(SORecinternalids[s] != null  && SORecinternalids[s] !='null' && SORecinternalids[s] != '' && parseInt(nextOrd) >= 1)
						{
							tsoInternalId=SORecinternalids[s].getValue('tranid',null,'group');


							nlapiLogExecution('Debug', 'tsoInternalId', tsoInternalId);
							nlapiLogExecution('Debug', 'OrderNumArray.indexOf(tsoInternalId)', OrderNumArray.indexOf(tsoInternalId));
							if(((SORecinternalids.length)-(parseInt(s)) > 0) && (OrderNumArray.indexOf(tsoInternalId)==-1))
							{
								orderCount=parseInt(orderCount)+1;
								break;
							}
						}
						

					}
				}
				if(orderIdArr != '' && orderIdArr != null && orderIdArr.length>0)
				{
					orderIdArr = orderIdArr.toString();
				}
				
				html = html + "	</table>"+	
				"				<input type='hidden' name='hdnorderIdArr' id='hdnorderIdArr' value=" + orderIdArr + ">"+
				"				<input type='hidden' name='hdngetPageCount' id='hdngetPageCount' value=" + getPageCount + ">"+
				" </td>"+
				"</tr>"+
				"</table>";
			}
		}
		else
		{
			var SOarray = new Array();
			SOarray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
			SOarray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
			SOarray["custparam_trantype"]=request.getParameter('custparam_trantype');
			SOarray["custparam_error"] = 'No records to show.';
			response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
			return;
		}
		SORecinternalids=null;
		//html = html +" 	</td></tr></table>";
		html = html +"		<table>	<tr>";
		nlapiLogExecution('ERROR', 'orderCount',orderCount);
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
		"<script type='text/javascript'>document.getElementById('enterso').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('enterso');
		var optedEvent = request.getParameter('cmdPrevious');
		var tranType = request.getParameter('hdnTrantype');
		var SOarray=new Array();
		nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);
		var getPickreportid=request.getParameter('hdnPickReportId');
		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		
		var cartonScreenRuleValue=request.getParameter('hdncartonScreenRuleValue');
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		
		var whlocation = request.getParameter('custparam_whlocation');
		SOarray["custparam_pickreportid"] =getPickreportid;
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



		
		SOarray["custparam_screenno"] = st12;
		SOarray["custparam_soid"] = request.getParameter('enterso');
		SOarray["custparam_trantype"] = request.getParameter('hdnTrantype');

		if (optedEvent == 'Back (F7)') {			

			response.sendRedirect('SUITELET', 'customscript_wmsse_fulfillmenu', 'customdeploy_wmsse_fulfillmenu', false, SOarray);
			
			return;
		}
		else
		{
			
			if(request.getParameter('cmdNextList')=="Next")
			{
				SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+1;				
				SOarray["custparam_ordidarr"]=request.getParameter('hdnorderIdArr');
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
				return;
			}
			if(request.getParameter('cmdPrevList')=="Prev")
			{
				SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-1;
				var ordIdStr = request.getParameter('hdnorderIdArr');
				nlapiLogExecution('DEBUG','ordIdStr',ordIdStr);
				var ordIdArr = new Array();
				if(ordIdStr != null && ordIdStr != '')
				{
					ordIdArr = ordIdStr.split(',');
					for(var t=0;t<10;t++)
					{
						ordIdArr.pop();
					}
					ordIdStr = ordIdArr.toString();
				}
				
				SOarray["custparam_ordidarr"]=ordIdStr;
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
				return;
			}
			var getSOid=request.getParameter('enterso');
			
			var  isPickReportNoScanned = 'F';
			var SOID = request.getParameter('hdnSOID');
		
						
			var validSo = funtoCheckSo(getSOid,SOID,whlocation,tranType);
			
			if(validSo== null || validSo == '')
			{	
				var vSearchResults = funtoCheckPickReportNo(getSOid,whlocation,tranType);
				
				if(vSearchResults!=null && vSearchResults!='' && vSearchResults.length > 0)
				{
					var vTaskAssignTo=vSearchResults[0].getValue('custrecord_wmsse_task_assignedto');
					var vTaskAssignToText=vSearchResults[0].getText('custrecord_wmsse_task_assignedto');
					var vUser=getCurrentUser();
					
					if((vTaskAssignTo == vUser)||(vTaskAssignTo == null || vTaskAssignTo =='' || vTaskAssignTo =='null' || vTaskAssignTo =='- None -'))
					{
						getSOid = vSearchResults[0].getValue('custrecord_wmsse_order_no');						
						validSo = funtoCheckSo('',getSOid,whlocation,tranType);
						isPickReportNoScanned ='T';
					}
					else
					{
						SOarray["custparam_error"] = 'This task is assigned to '+vTaskAssignToText;
						response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
						return;
					}
				}
			}
			nlapiLogExecution('DEBUG','validSo',validSo);
			if((validSo!=null && validSo!='') || isPickReportNoScanned == 'T'){ 
				
				if(validSo!=null && validSo!='')
				{
				var customer = validSo[0].getValue('entity');
				getSOid = validSo[0].getValue('internalid');
				}
				
				var SORecinternalids = getSOscandetails(getSOid,tranType,SOarray["custparam_whlocation"]);
				//var soid='';
				//var soInternalId='';
				if(SORecinternalids!=null && SORecinternalids!='' && SORecinternalids.length>0)
				{
					var vLinecount=0;
					var vColumnslist=SORecinternalids[0].getAllColumns();
					var vOpentaskdetails = getPickedqtydetails(getSOid,tranType,SOarray["custparam_whlocation"]);
					
					for(var k=0;k<SORecinternalids.length;k++)
					{
						var vsoitemQty=SORecinternalids[k].getValue('quantity');
						var vsoitemType=SORecinternalids[k].getValue('type','item');


						if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
							|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
						{
							var vsoitemCommitedQty=SORecinternalids[k].getValue('quantity');
						}
						else
						{
							var vsoitemCommitedQty=SORecinternalids[k].getValue('quantitycommitted');
						}

						var vsoitemNSReceivedQty=SORecinternalids[k].getValue('quantitypicked');
						var vsoitemNSshippedQty=SORecinternalids[k].getValue('quantityshiprecv');
						var vsoitem = SORecinternalids[k].getText('item');
						var vsoitemId = SORecinternalids[k].getValue('item');
						var vsoitemLine = SORecinternalids[k].getValue('line');
						var vConversionRate = SORecinternalids[k].getValue('formulanumeric');

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
							vsoitemCommitedQty=Big(vsoitemCommitedQty);
							vsoitemNSshippedQty=Big(vsoitemNSshippedQty);
							vsoitemPickedQty=Big(vsoitemPickedQty);
							var vsoitemRemQty = Number((vsoitemCommitedQty).plus(vsoitemNSshippedQty).minus(vsoitemPickedQty));
						}
			
						if(parseFloat(vsoitemRemQty)>0)
						{
							vLinecount=parseFloat(vLinecount)+1;
						}
						var soInternalId=SORecinternalids[k].getValue('internalid');
						SOarray["custparam_soid"] = SORecinternalids[k].getValue('tranid');

						
						SOarray["custparam_sointernalid"] = soInternalId;



						var whLocation= SORecinternalids[k].getValue('location');

						
					} 

					
				
					SOarray["custparam_cartonscreenrulevalue"] =cartonScreenRuleValue;

					var actualBeginTime=TimeStamp();
					SOarray["custparam_actualbegintime"]=actualBeginTime;
					if(parseFloat(vLinecount)>0)
					{
						var PickReportDetails = funGetPickReportNo(getSOid,whlocation);
						if(PickReportDetails != null && PickReportDetails != '' && PickReportDetails.length > 0)
						{
							var vTaskAssignTo=PickReportDetails[0].getValue('custrecord_wmsse_task_assignedto',null,'group');
							var vTaskAssignToText=PickReportDetails[0].getText('custrecord_wmsse_task_assignedto',null,'group');
							var vUser=getCurrentUser();
							
							if((vTaskAssignTo == vUser)||(vTaskAssignTo == null || vTaskAssignTo =='' || vTaskAssignTo =='null' || vTaskAssignTo =='- None -'))
							{
								nlapiLogExecution('DEBUG', 'Inside if vTaskAssignTo:vUser', vTaskAssignTo+":"+vUser);
							}
							else
							{
								SOarray["custparam_error"] = 'This task is assigned to '+vTaskAssignToText;
								response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
								return;
							}
							if(PickReportDetails != null && PickReportDetails != '' && (PickReportDetails.length == 1 || isPickReportNoScanned =='T'))
							{
								nlapiLogExecution('DEBUG', 'PickReport#', PickReportDetails[0].getValue('custrecord_wmsse_pickreport_no',null,'group'));
								SOarray["custparam_pickreportid"] = PickReportDetails[0].getValue('custrecord_wmsse_pickreport_no',null,'group');
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
							else if(PickReportDetails != null && PickReportDetails != '' && PickReportDetails.length != 1)
							{
								SOarray["custparam_error"] ='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_pickreportno_scan', 'customdeploy_wmsse_pickreportno_scan', false, SOarray);
								return;
							}
							else
							{
								SOarray["custparam_error"] = "There are no Pick reports generated for this sales order#";									
								response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
								return;
							}
							
						}
						else
						{
							SOarray["custparam_error"] = "There are no pick reports generated for this sales order#";								
							response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
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

						response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
						return;
					} 

				}
				else
				{


					var SOtrantypefilters=new Array();
					SOtrantypefilters.push(new nlobjSearchFilter('internalid',null,'is',getSOid));
					SOtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

					var SOtrantypecols=new Array();
					
					var SORecinternalids=nlapiSearchRecord(tranType,'customsearch_wmsse_transactiondetails',SOtrantypefilters,null);
					var soid='';
					if(SORecinternalids!=null && SORecinternalids!='')
					{
						//Case# 201414555  start
						sowhLocation=SORecinternalids[0].getValue('location');
						if( sowhLocation == null || sowhLocation == '' || sowhLocation =='null' || sowhLocation == 'undefined')
						{
							SOarray["custparam_error"] = "Please enter warehouse location at "+tranType+" screen";
							response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
							
							return;
						}
						//Case# 201414555  end
						soid=SORecinternalids[0].getValue('internalid');
						SOarray["custparam_poid"] = SORecinternalids[0].getValue('tranid');
						//}
						if(soid!=null&&soid!="")
							tranType = nlapiLookupField('transaction', soid, 'recordType');
						nlapiLogExecution('DEBUG','trantype',tranType);
						SOarray["custparam_trantype"] = tranType;
						var SOfilters=new Array();
						SOfilters.push(new nlobjSearchFilter('internalid',null,'is',getSOid));
						SOfilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
						SOfilters.push(new nlobjSearchFilter('recordtype',null,'is',tranType));
						var vRoleLocation=getRoledBasedLocation();
						if(vRoleLocation != null && vRoleLocation != '' && vRoleLocation != 0)
						{
							SOfilters.push(new nlobjSearchFilter('location', null, 'anyof', vRoleLocation));
						}


						var SOcols=new Array();
						

						var SORec=nlapiSearchRecord('transaction','customsearch_wmsse_transactiondetails',SOfilters,null);
						if(SORec!=null&&SORec!='')
						{
							var soStatus=SORec[0].getValue('status');
							nlapiLogExecution('DEBUG','soStatus',soStatus);


							if(soStatus=='pendingFulfillment'||soStatus=='pendingBillingPartFulfilled')
							{

							}
							else
							{
								if(soStatus == 'pendingApproval')
								{
									SOarray["custparam_error"]="Sales order "+getSOid+" is not approved";
								}
								else
								{
									SOarray["custparam_error"]="Please enter/scan valid sales order status";
								}
								response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
								return;
							}

						}
						else
						{
							if(tranType == 'salesorder')
								SOarray["custparam_error"]="Please enter/scan valid sales order status";
								else
									SOarray["custparam_error"]="Please enter/scan valid transfer order status";	
							response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
							return;
						}
					}
					else
					{
						if(tranType == 'salesorder')
							SOarray["custparam_error"]="Please enter/scan valid sales order status";
							else
								SOarray["custparam_error"]="Please enter/scan valid transfer order status";	
						response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
						return;
					}

					if(tranType == 'salesorder')
						SOarray["custparam_error"]="Please enter/scan valid sales order status";
						else
							SOarray["custparam_error"]="Please enter/scan valid transfer order status";	
					response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
					return;


					

				}
				SORecinternalids=null; 

			}
			else{
				

				var SOtrantypefilters=new Array();
				SOtrantypefilters.push(new nlobjSearchFilter('internalid',null,'is',getSOid));
				SOtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

				var SOtrantypecols=new Array();
				

				var SORecinternalids=nlapiSearchRecord(tranType,'customsearch_wmsse_transactiondetails',SOtrantypefilters,null);
				var soid='';
				if(SORecinternalids!=null && SORecinternalids!='')
				{
					soid=SORecinternalids[0].getValue('internalid');
					SOarray["custparam_poid"] = SORecinternalids[0].getValue('tranid');
					//}
					if(soid!=null&&soid!="")
						tranType = nlapiLookupField('transaction', soid, 'recordType');
					nlapiLogExecution('DEBUG','trantype',tranType);
					SOarray["custparam_trantype"] = tranType;
					var SOfilters=new Array();
					SOfilters.push(new nlobjSearchFilter('internalid',null,'is',getSOid));
					SOfilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
					SOfilters.push(new nlobjSearchFilter('recordtype',null,'is',tranType));
					var vRoleLocation=getRoledBasedLocation();
					if(vRoleLocation != null && vRoleLocation != '' && vRoleLocation != 0)
					{
						SOfilters.push(new nlobjSearchFilter('location', null, 'anyof', vRoleLocation));
					}


					var SOcols=new Array();					

					var SORec=nlapiSearchRecord('transaction','customsearch_wmsse_transactiondetails',SOfilters,null);
					if(SORec!=null&&SORec!='')
					{
						var soStatus=SORec[0].getValue('status');
						nlapiLogExecution('DEBUG','soStatus',soStatus);


						if(soStatus=='pendingFulfillment'||soStatus=='pendingBillingPartFulfilled')
						{

						}
						else
						{
							if(soStatus == 'pendingApproval')
							{
								SOarray["custparam_error"]="Sales order "+getSOid+" is not approved";
							}
							else
							{
								if(tranType == 'salesorder')
								SOarray["custparam_error"]="Please enter/scan valid sales order status";
								else
								SOarray["custparam_error"]="Please enter/scan valid transfer order status";	
							}
							response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
							return;
						}

					}
					else
					{
						if(tranType == 'salesorder')
						SOarray["custparam_error"]="Please enter/scan valid sales order# ";
						else
						SOarray["custparam_error"]="Please enter/scan valid transfer order# ";
						response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
						return;
					}
				}
				else
				{
					//SOarray["custparam_error"]="Invalid sales order ";
					if(tranType == 'salesorder')
						SOarray["custparam_error"]="Please enter/scan valid sales order#/pick report#";
					else
						SOarray["custparam_error"]="Please enter/scan valid transfer order#/pick report#";
					response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
					return;
				}
				//SOarray["custparam_error"]="Invalid sales order ";
				if(tranType == 'salesorder')
					SOarray["custparam_error"]="Please enter/scan valid sales order#/pick report#";
				else
					SOarray["custparam_error"]="Please enter/scan valid transfer order#/pick report#";
				response.sendRedirect('SUITELET', 'customscript_wmsse_solist_scan', 'customdeploy_wmsse_solist_scan', false, SOarray);
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
function funtoCheckSo(getsoid,SOID,loc,tranType){

	var resflag = "F";
	nlapiLogExecution('DEBUG', 'tranType', tranType);
	var SOtrantypefilters=new Array();
	
	if(getsoid!= null && getsoid!= "" && getsoid!= "null" && getsoid!= undefined)
		SOtrantypefilters.push(new nlobjSearchFilter('tranid',null,'is',getsoid));
	if(SOID!= null && SOID!= "" && SOID!= "null" && SOID!= undefined)
		SOtrantypefilters.push(new nlobjSearchFilter('internalid',null,'is',SOID));
	SOtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
	SOtrantypefilters.push(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
	/*if(loc!=null && loc!="" && loc!='null')
		SOtrantypefilters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',loc]));*/

	var SOtrantypecols=new Array();
	
	var SORecinternalids=nlapiSearchRecord(tranType,'customsearch_wmsse_transactiondetails',SOtrantypefilters,null);
	if(SORecinternalids!=null && SORecinternalids!="")
		resflag ="T";
	SOtrantypefilters=null;
	SOtrantypecols=null;
	return SORecinternalids;
}

/**
 * To get all open orders list from saved search
 * @param trantype
 * @param whLocation
 * @returns {nlapiSearchRecord}
 */
function getSOList(trantype,whLocation,id,vCrosssubsidiary)
{
	nlapiLogExecution('DEBUG', 'trantype,whLocation',trantype+","+whLocation);

	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';
	
	
	
	var SOLineDetails= nlapiLoadSearch('transaction', 'customsearch_wmsse_list_search_details');


	if(id != null && id !='null' && id != '' && id != 'undefined' && id.length > 0)
	{
		SOLineDetails.addFilter(new nlobjSearchFilter('internalid', null, 'is', id));
	}
	SOLineDetails.addFilter(new nlobjSearchFilter('type', null, 'anyof', vType));
	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='null')	
	{
		if(vCrosssubsidiary == true && trantype =='salesorder')
		{
			SOLineDetails.addFilter(new nlobjSearchFilter('inventorylocation', null, 'anyof', ['@NONE@',whLocation]));
		}
		else
		{
			SOLineDetails.addFilter(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',whLocation]));
			SOLineDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_make_wh_site','location', 'is', 'T'));
		}

	}


	var alltaskresults=[]; 
	var resultSet = SOLineDetails.runSearch();
	var resultsPage = resultSet.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		alltaskresults = alltaskresults.concat(resultsPage);
		offset += 1000;
		resultsPage = resultSet.getResults(offset, offset + 1000);
	}


	return alltaskresults;
	
	
	
}

function getSOLineCountList(trantype,whLocation,OrdIntId,crossSubsidiaryFeature)
{
	nlapiLogExecution('DEBUG', 'trantype,whLocation,Ord Id',trantype+","+whLocation+","+OrdIntId);

	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';

	var filters = new Array();
	var columns = new Array();


	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	
	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='null')	
	{
		if(crossSubsidiaryFeature == true && trantype =='salesorder')
		{
       //Will allow only locations for which WHsite falg is enabled,So no need to check again
			filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof', ['@NONE@', whLocation]));
		}
		else
		{
			filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@', whLocation]));
		}

	}
	
	if(OrdIntId!=null && OrdIntId!='')
		filters.push(new nlobjSearchFilter('internalid', null, 'anyof',OrdIntId));

	var SOLineDetails = nlapiSearchRecord('transaction', 'customsearch_wmsse_tranline_dets_ob', filters, columns);

	return SOLineDetails;
}
function funtoCheckPickReportNo(vPickReportId,loc,trantype){

	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd'; 

	nlapiLogExecution('DEBUG', 'vPickReportId', vPickReportId);
	var SOtrantypefilters=new Array();
	SOtrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',vPickReportId));
	SOtrantypefilters.push(new nlobjSearchFilter('type', 'custrecord_wmsse_order_no', 'anyof', vType));
	if(loc!=null && loc!="" && loc!='null')
		SOtrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', loc));
	var SOtrantypecols=new Array();
	
	var SORecinternalids=nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_validatepickreport',SOtrantypefilters,null);
	
	return SORecinternalids;
}
function funtoGetSoidofPickReportNo(loc,vnUser){

	var SOtrantypefilters=new Array();
	
	nlapiLogExecution('DEBUG', 'loc : vnUser', loc +" : "+vnUser);
	if(loc!=null && loc!="" && loc!='null')
		SOtrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', loc));

	if(vnUser!=null && vnUser!="" && vnUser!='null')
		SOtrantypefilters.push(new nlobjSearchFilter('custrecord_wmsse_task_assignedto', null, 'anyof', ['@NONE@',vnUser]));

	
	var SORecinternalids=nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_openpickreportorders',SOtrantypefilters,null);

	return SORecinternalids;
}


function funGetPickReportNo(getSoid,whLocation){

	nlapiLogExecution('DEBUG', 'getSoid', getSoid);
	var filters = new Array();
	var columns = new Array();

	if(getSoid != '' && getSoid != null)
	filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null,'is', getSoid));
	
	if(whLocation != '' && whLocation != null)
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof',whLocation));
	
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', [9]));

	
	var PickrepDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_getpickreportdetails', filters, null);

	return PickrepDetails;
}
