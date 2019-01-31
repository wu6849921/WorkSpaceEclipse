/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function CheckInPOList(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		
		var getOptedField = request.getParameter('custparam_option');
		
		var userAccountId = ctx.getCompany();	
		var vTranType = request.getParameter('custparam_trantype');	
		var orderType=request.getParameter('custparam_ordertype');
		var whLocation=request.getParameter('custparam_whlocation');		
		var whLocationName=request.getParameter('custparam_whlocationname');
		//var getHIBCBarcodeFlag=request.getParameter('custparam_hibcflag');
		//nlapiLogExecution('DEBUG', 'getHIBCBarcodeFlag', getHIBCBarcodeFlag);
		var st0,st1,st2,st3;
		var headerVar='Receiving';
		if(vTranType == 'purchaseorder')
		{
			headerVar='PO';
		}
		else if(vTranType == 'transferorder')
		{
			headerVar='TO';
		}
		else
		{
			headerVar='RMA';
		}
		
		
		// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
		var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();		
		
		var PORecinternalids=getPOList(vTranType,whLocation,crossSubsidiaryFeature);
		var actualBeginTime=TimeStamp();
		// var tempOrderNumArray=request.getParameter('custparam_tempordernumarray');
		var getPageCount=request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize=5;
		var nextOrd = 0;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);
		
		if( getLanguage == 'es_ES')
		{
			
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			
			st1 = "Enter/Scan "+orderType+"#";
			st2 = "SEND";
			st3 = "PREV";

		}	
		var domainName = fndomainName();
		
		var st0 = domainName + '-'+headerVar+' Receiving';
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
		
		var logmsg = 'getLanguage. = ' + getLanguage + '<br>';
		logmsg = logmsg + 'getOptedField. = ' + getOptedField + '<br>';	
		logmsg = logmsg + 'userAccountId. = ' + userAccountId + '<br>';	
		logmsg = logmsg + 'vTranType. = ' + vTranType + '<br>';
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';	
		
		nlapiLogExecution('DEBUG', 'PO Scan list values :', logmsg);
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		// starts (Now form name is passed correctly in function to work keyboard enter button)
		var error="Please enter/scan "+orderType.toLowerCase() +"#";
		//Ends here
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_po'); 
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm(poId) {if(document.getElementById('enterpo').value == '' && (poId == '' || poId == 'null' || poId ==null || poId == 'undefined')){document.getElementById('div_error').innerHTML ='" + error + "';	return false;}else{document.getElementById('hdnPOID').value=poId;document.forms['_rf_checkin_po'].submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_po' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Receiving "+headerVar+"# List</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+
		//"		<tr><td></td></tr><tr><td></td></tr><tr><td>"+
		"		<table>"+
		//"			<tr border='1'><td align='center' class='tablecell'  valign='top'><b>RECEIVING</b></td></tr>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdntrantype' value=" + vTranType + ">"+	
		"				<input type='hidden' name='hdnordertype' value='" + orderType + "'>"+
		//"				<input type='hidden' name='hdnHIBCBarcodeFlag' value=" + getHIBCBarcodeFlag + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdnPOID'  id='hdnPOID'>"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdncrosssubsidiary' value='" + crossSubsidiaryFeature + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterpo'  class='smalltextbox'  id='enterpo' type='text'/>"+
		"				</td>"+
		//"	<td width='10px'></td><td ><input name='cmdSearch' type='submit' value='List' width='100px' onclick='return validateForm();'/></td>"+
		"			</tr><tr><td></td></table>"+
		"			<table><tr>"+
		"				<td><input name='cmdSend1' class='defaultlink'    type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		//"				<td width='20px'></td>"+
		//"				<td align = 'left'><input name='cmdNextList' type='submit' value='Next List'/></td>"+
		"			</tr>"+ 
		"		 </table>";
		if(PORecinternalids!=null && PORecinternalids!='' && PORecinternalids.length != null)
		{
			nlapiLogExecution('Debug', 'PORecinternalids.length', PORecinternalids.length);
			if(PORecinternalids.length>0)
			{
				html = html + "	<table>"+
				" <tr>"+
				" <td>"+
				"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
				" <tr class='uir-machine-headerrow' >"+
				" <td>"+orderType+"#"+
				" </td>";

				if(vTranType!='returnauthorization')	
				{
					html = html + " <td>Vendor</td>";
				}
				else
					html = html + " <td>Customer</td>";

				html = html + " <td class='align-right'>#Lines"+
				" </td>"+
				"</tr>";


				
				var OrderNumArray=new Array();
				var orderCount=0;
				var vColumnslist=PORecinternalids[0].getAllColumns();
				var openputawayQtyIndex = 7;
				var conversionOrderQtyIndex=15;
				for(var x1=0;x1<vColumnslist.length;x1++)
				{
					var summaryLabel = vColumnslist[x1].getLabel();
					var name = vColumnslist[x1].getName();
					if(summaryLabel == 'Open Putaway Quantity')
					{
						openputawayQtyIndex = x1;
					}
					else if(summaryLabel == 'Conversion Order Quantity')
					{
						conversionOrderQtyIndex = x1;
					}
					else
					{

					}
				}
				
				for (var s = 0; s < PORecinternalids.length; s++) {
					var poInternalId=PORecinternalids[s].getValue('internalid',null,'group');
					var poId=PORecinternalids[s].getValue('tranid',null,'group');
					var vpoitemRcvQty=PORecinternalids[s].getValue(vColumnslist[openputawayQtyIndex]);
					//var vpoitemQty = PORecinternalids[s].getValue('quantity',null,'max');
					var vpoitemQty = PORecinternalids[s].getValue(vColumnslist[conversionOrderQtyIndex]);
					var vpoitemNSRcvQty = PORecinternalids[s].getValue('quantityshiprecv',null,'max');
					if(vpoitemNSRcvQty==null || vpoitemNSRcvQty=='')
						vpoitemNSRcvQty=0;
					if(vpoitemRcvQty == null || vpoitemRcvQty=='')
					{
						vpoitemRcvQty=0;
					}
					if(vTranType=="returnauthorization")
					{
						if(parseInt(vpoitemQty)<0)
							vpoitemQty=Big(vpoitemQty).mul(-1);
					       
													
					}
					
					var totalReceivedQty = Number(Big(vpoitemRcvQty).plus(vpoitemNSRcvQty));
					
					
					var vPoreminqty =Big(vpoitemQty).minus(totalReceivedQty);
					

					
					if(parseFloat(vPoreminqty) <= 0)
					{
						continue;
					}
					if(OrderNumArray.indexOf(poId)!=-1)
					{
						continue;
					}
					else
					{
						//tempOrderNumArray.push(poId);
						if(parseInt(orderCount)<5)
						{
							OrderNumArray.push(poId);
						}
						if(parseInt(orderCount) >= 5 && parseInt(nextOrd) == 0)
						{
							
							nextOrd = parseInt(nextOrd) + 1;
						}
					}
					
					var customer=PORecinternalids[s].getValue('entity',null,'group');
					var vendor=PORecinternalids[s].getValue('entityid','vendor','group');
					if(vendor != null && vendor != '' && vendor.length>20)
						vendor=vendor.substring(0,20);

					var customerName=PORecinternalids[s].getValue('entityid','customer','group');
					if(customerName == null || customerName=='')
						customerName=PORecinternalids[s].getValue('altname','customer','group');
					if(customerName != null && customerName != '' && customerName.length>20)						
						customerName=customerName.substring(0,20);

					var whCompany= PORecinternalids[s].getValue('custbody_nswms_company',null,'group');
					if(OrderNumArray.length>totalPageSizeValue && (parseInt(orderCount)<5))
					{
						var POLineCountDets=getPOLineCountList(vTranType,whLocation,poInternalId,crossSubsidiaryFeature);

						if(OrderNumArray.indexOf(poInternalId)==-1)
						{
							orderCount=parseInt(orderCount)+1;
						}
						var vLineCount=0;
						if(POLineCountDets != null && POLineCountDets != '' && POLineCountDets.length > 0)
							vLineCount=POLineCountDets[0].getValue('line',null,'count');
						
						var checkInURL_1 = '';
						
						checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku');
						

						//var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_ordertype=' + orderType + '&custparam_trantype=' + vTranType + '&custparam_language=' + getLanguage + '&custparam_poid=' + poId  + '&custparam_customer=' + customer  + '&custparam_actualbegintime=' + actualBeginTime + '&custparam_company=' + whCompany +'&custparam_hibcflag='+getHIBCBarcodeFlag;
						var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_ordertype=' + orderType + '&custparam_trantype=' + vTranType + '&custparam_language=' + getLanguage + '&custparam_poid=' + poId  + '&custparam_customer=' + customer  + '&custparam_actualbegintime=' + actualBeginTime + '&custparam_company=' + whCompany ;

						html = html + "	<tr  class='uir-list-row-tr line uir-list-row-even'>"+
						" <td><a name='link1URL_1' href='#' onclick='return validateForm(\""+poInternalId+"\");'> "+poId+"</a></td>";
						if(vTranType!='returnauthorization')	
						{
							if(vendor != null && vendor != '' && vendor != '- None -')
								html = html + " <td>"+  vendor  +"</td>";
							else
								html = html + " <td> </td>";
						}
						else
						{
							if(customerName!= null && customerName != '' && customerName != '- None -')
								html = html + " <td>"+  customerName  +"</td>";
							else
								html = html + " <td> </td>";
						}

						html = html + " <td class='align-right'>"+  vLineCount  +"</td>"+
						"</tr>";
					}
					//if(OrderNumArray.length >=5)
					//	break;

					
					if(parseInt(orderCount)>=5)
					{
						var tpoInternalId=0;
						if(PORecinternalids[s] != null  && PORecinternalids[s] !='null' && PORecinternalids[s] != '' && parseInt(nextOrd) >= 1)
						{
							tpoInternalId=PORecinternalids[s].getValue('tranid',null,'group');


							nlapiLogExecution('Debug', 'tpoInternalId', tpoInternalId);
							nlapiLogExecution('Debug', 'OrderNumArray.indexOf(tpoInternalId)', OrderNumArray.indexOf(tpoInternalId));
							if(((PORecinternalids.length)-(parseInt(s)) > 0) && (OrderNumArray.indexOf(tpoInternalId)==-1))
							{
								orderCount=parseInt(orderCount)+1;
								break;
							}
						}
						/*else
							{
								if( (OrderNumArray.indexOf(tpoInternalId)==-1))
								{
									orderCount=parseInt(orderCount)+1;
									break;
								}
							}*/
					}
				}
				
				//"				<input type='hidden' name='hdntempOrderNumArray' id='hdntempOrderNumArray' value=" + tempOrderNumArray + ">"+
				html = html +"				<input type='hidden' name='hdngetPageCount' id='hdngetPageCount' value=" + getPageCount + ">"+
				" </td>"+
				"</tr>"+
				"</table>";
				html = html + "	</table>";	
			}
		}
		else
		{
			var POarray = new Array();
			POarray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
			POarray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
			POarray["custparam_ordertype"]=request.getParameter('custparam_ordertype');
			POarray["custparam_trantype"]=request.getParameter('custparam_trantype');
			POarray["custparam_error"] = 'No records to show.';
			response.sendRedirect('SUITELET', 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan', false, POarray);
			return;
		}



		// html = html +" 	</td></tr></table>";
		html = html +"		<table>	<tr>";
		if(getPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"				<td width='20px'></td>";
		if(parseInt(orderCount) > 5)
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>"+
		"	</form>"+

		"<script type='text/javascript'>document.getElementById('enterpo').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('selectoption');
		var optedEvent = request.getParameter('cmdPrevious');
		var POarray=new Array();
		nlapiLogExecution('DEBUG', 'optedEvent', 'optedEvent');
//		POarray["custparam_error"] = 'Invalid Option';
//		POarray["custparam_screenno"] = 'MainMenu';

		POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

		var whlocation = request.getParameter('custparam_whlocation');
		//POarray["custparam_hibcflag"] = request.getParameter('hdnHIBCBarcodeFlag');
		//var getHIBCBarcodeFlag = request.getParameter('hdnHIBCBarcodeFlag');
		var trantype=request.getParameter('hdntrantype');
		nlapiLogExecution('DEBUG', 'trantype', trantype);
		var orderType=request.getParameter('hdnordertype');
		POarray["custparam_ordertype"]=orderType;
		if(trantype == null || trantype == '' || trantype == 'null')
			trantype='purchaseorder';
		POarray["custparam_trantype"] = trantype;
		var getLanguage = request.getParameter('hdngetLanguage');
		POarray["custparam_language"] = getLanguage;
		
		POarray["custparam_tempordernumarray"] = request.getParameter('hdntempOrderNumArray');
		nlapiLogExecution('DEBUG', 'POarray["custparam_tempordernumarray"]', POarray["custparam_tempordernumarray"]);
		var context = nlapiGetContext();
		
		var crossSubsidiaryFeature = request.getParameter('hdncrosssubsidiary');

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



		//POarray["custparam_error"] = st11;
		POarray["custparam_screenno"] = st12;
		POarray["custparam_poid"] = request.getParameter('enterpo');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
		}
		else
		{
			//var trantype='';

			
			var pageCount=0;
			if(request.getParameter('hdngetPageCount')!=null && request.getParameter('hdngetPageCount') != 'null' && request.getParameter('hdngetPageCount') != '')
			{
				pageCount=request.getParameter('hdngetPageCount');
			}
			if(request.getParameter('cmdNextList')=="Next")
			{
				POarray["custparam_pagecount"]=parseInt(pageCount)+1;
				nlapiLogExecution('DEBUG','POarray["custparam_pagecount"]',request.getParameter('hdngetPageCount'));
				POarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_polist_scan', 'customdeploy_wmsse_polist_scan', false, POarray);
				return;
			}
			if(request.getParameter('cmdPrevList')=="Prev")
			{
				POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-1;
				POarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_polist_scan', 'customdeploy_wmsse_polist_scan', false, POarray);
				return;
			}
			var getPOid=request.getParameter('enterpo');
			nlapiLogExecution('DEBUG','getPOid',getPOid);
			
			//var poid='';
			var vType='PurchOrd';
			var ordMsg='Transaction';
			if(trantype=='purchaseorder')
			{
				vType='PurchOrd';
				ordMsg='purchase order';
			}
			else if(trantype=='transferorder')
			{
				vType='TrnfrOrd';
				ordMsg='transfer order';
			}
			else if(trantype=='returnauthorization')
			{
				vType='RtnAuth';
				ordMsg='return authorization';
			}
			var POID = request.getParameter('hdnPOID');
			var filters = new Array();
			var columns = new Array();
			if(POID != null && POID != '' && POID != 'null' && POID != 'undefined')
			{
				filters.push(new nlobjSearchFilter('internalid', null, 'anyof', POID));
			}
			else
			{
				filters.push(new nlobjSearchFilter('tranid', null, 'is', getPOid));
			}




			filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

			
			if(whlocation!=null && whlocation!='' && whlocation != undefined && whlocation!='null')
			{
				if(crossSubsidiaryFeature == 'true' && trantype=='returnauthorization')
				{
					filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof',['@NONE@', whlocation]));
				}
				else
				{
					filters.push(new nlobjSearchFilter('location', null, 'anyof',['@NONE@', whlocation]));
				}

			}

			var PORecinternalids = new nlapiSearchRecord('transaction', 'customsearch_wmsse_rcv_ordline_details', filters, columns);
			if(PORecinternalids!=null && PORecinternalids!='' && PORecinternalids.length>0)
			{


				var vCount=0;
				var vColumnslist=PORecinternalids[0].getAllColumns();
				var openputawayQtyIndex = 7;
				var conversionOrderQtyIndex=15;
				for(var x1=0;x1<vColumnslist.length;x1++)
				{
					var summaryLabel = vColumnslist[x1].getLabel();
					var name = vColumnslist[x1].getName();
					if(summaryLabel == 'Open Putaway Quantity')
					{
						openputawayQtyIndex = x1;
					}
					else if(summaryLabel == 'Conversion Order Quantity')
					{
						conversionOrderQtyIndex = x1;
					}
					else
					{

					}
				}
				for(var cnt=0;cnt<PORecinternalids.length;cnt++)
				{
					
					var Location = '';
					if(crossSubsidiaryFeature == 'true' && trantype=='returnauthorization')
					{
						Location = PORecinternalids[cnt].getValue('inventorylocation',null,'group');
					}
					else
					{
						Location =PORecinternalids[cnt].getValue('location',null,'group');
					}
					
					nlapiLogExecution('ERROR', 'Location', Location);
					if(Location == '' || Location == null || Location == 'null' || Location =='undefined')
					{
						POarray["custparam_error"] = "Please enter warehouse location at "+ordMsg+" screen";
						response.sendRedirect('SUITELET', 'customscript_wmsse_polist_scan', 'customdeploy_wmsse_polist_scan', false, POarray);
						return;
					}

					var vpoitemRcvQty=PORecinternalids[cnt].getValue(vColumnslist[openputawayQtyIndex]);
					//var vpoitemQty = PORecinternalids[cnt].getValue('quantity',null,'max');
					var vpoitemQty = PORecinternalids[cnt].getValue(vColumnslist[conversionOrderQtyIndex]);
					var vpoitemNSRcvQty = PORecinternalids[cnt].getValue('quantityshiprecv',null,'max');
					
					if(trantype=="returnauthorization")
					{
						if(parseInt(vpoitemQty)<0)
							vpoitemQty=Big(vpoitemQty).mul(-1);
							nlapiLogExecution('DEBUG', 'vpoitemQty', vpoitemQty);
														
					}
					if(vpoitemRcvQty == null || vpoitemRcvQty=='')
					{
						vpoitemRcvQty=0;
					}
					if(vpoitemNSRcvQty==null || vpoitemNSRcvQty=='')
						vpoitemNSRcvQty=0;
					
					var totalReceivedQty = Number(Big(vpoitemRcvQty).plus(vpoitemNSRcvQty));
					
					
					var vPoreminqty = Big(vpoitemQty).minus(totalReceivedQty);
					

					if(parseFloat(vPoreminqty) > 0)
					{
						vCount=parseFloat(vCount)+1;
					}
					POarray["custparam_poid"] = PORecinternalids[cnt].getValue('tranid',null,'group');
					var whCompany= PORecinternalids[cnt].getValue('custbody_nswms_company',null,'group');
					//POarray["custparam_whlocation"] = whLocation;
					POarray["custparam_company"] =whCompany;
					POarray["custparam_customer"] = PORecinternalids[cnt].getValue('entity',null,'group');
					POarray["custparam_specord"] = PORecinternalids[cnt].getValue('appliedtolinktype',null,'group');
				}
				var actualBeginTime=TimeStamp();
				POarray["custparam_actualbegintime"]=actualBeginTime;
				if(parseFloat(vCount)>0)
				{
					POarray["custparam_error"]='';
					/*if(getHIBCBarcodeFlag == "Y")
					{
						response.sendRedirect('SUITELET', 'customscript_wmsse_hibc_scan', 'customdeploy_wmsse_hibc_scan', false, POarray);
						return;
					}
					else
					{*/
						response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
						return;
					/*}*/
				}
				else
				{
					POarray["custparam_error"] =  "Please enter/scan valid "+orderType.toLowerCase() +"#";
					response.sendRedirect('SUITELET', 'customscript_wmsse_polist_scan', 'customdeploy_wmsse_polist_scan', false, POarray);
					nlapiLogExecution('DEBUG', 'SearchResults ', 'Length is null');
				}
			}
			else
			{

				var POtrantypefilters=new Array();
				POtrantypefilters.push(new nlobjSearchFilter('tranid',null,'is',getPOid));
				POtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

				var POtrantypecols=new Array();
				

				var PORecinternalids=nlapiSearchRecord(trantype,'customsearch_wmsse_transactionid_details',POtrantypefilters,null);
				var poid='';
				var createdfrom='';

				if(PORecinternalids!=null && PORecinternalids!='')
				{
					poid=PORecinternalids[0].getValue('internalid');
					createdfrom=PORecinternalids[0].getValue('createdfrom');
					
					POarray["custparam_poid"] = PORecinternalids[0].getValue('tranid');
					//}
					if(poid!=null&&poid!="")
						trantype = nlapiLookupField('transaction', poid, 'recordType');
					nlapiLogExecution('DEBUG','trantype',trantype);
					POarray["custparam_trantype"] = trantype;
					var POfilters=new Array();
					POfilters.push(new nlobjSearchFilter('tranid',null,'is',getPOid));
					POfilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
					POfilters.push(new nlobjSearchFilter('recordtype',null,'is',trantype));
					/*var vRoleLocation=getRoledBasedLocation();
					if(vRoleLocation != null && vRoleLocation != '' && vRoleLocation != 0)
					{
						POfilters.push(new nlobjSearchFilter('location', null, 'anyof', vRoleLocation));
					}*/
					if(trantype=='transferorder'){
						if(whlocation!=null && whlocation!="")
							POfilters.push(new nlobjSearchFilter('transferlocation', null, 'anyof', ['@NONE@', whlocation]));
					}
					else{
						if(whlocation!=null && whlocation!="")
							POfilters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@', whlocation]));
					}

					var POcols=new Array();
					
					var PORec=nlapiSearchRecord(trantype,'customsearch_wmsse_transactionid_details',POfilters,null);
					if(PORec!=null&&PORec!='')
					{
						var poStatus=PORec[0].getValue('status');
						nlapiLogExecution('DEBUG','poStatus',poStatus);
						var vSpecialOrder="";
						var spefilters =new Array();
						spefilters.push(new nlobjSearchFilter('tranid', null, 'is', getPOid));
						spefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
						var specolumns=new Array();
						
						var posearch = nlapiSearchRecord(trantype, 'customsearch_wmsse_transactionid_details', spefilters, null);

						var vlinelocation='';
						if(posearch!=null && posearch!='')
						{
							poid = posearch[0].getId();						
							vlinelocation=posearch[0].getValue('location');						
							vSpecialOrder=posearch[0].getValue('appliedtolinktype');

						}

						if(poStatus=='pendingApproval')
						{
							POarray["custparam_error"] = "Please approve this "+orderType.toLowerCase() +"# to process" ;
							response.sendRedirect('SUITELET', 'customscript_wmsse_polist_scan', 'customdeploy_wmsse_polist_scan', false, POarray);
							return;
						}
						if(vSpecialOrder!=null && vSpecialOrder!='' && vSpecialOrder=='DropShip')
						{

							POarray["custparam_error"] = "Drop ship Purchase orders not process in WMS";
							response.sendRedirect('SUITELET', 'customscript_wmsse_polist_scan', 'customdeploy_wmsse_polist_scan', false, POarray);
							return;

						}
						//if(poStatus=='pendingReceipt'||poStatus=='partiallyReceived' ||poStatus=='pendingBillPartReceived')
						if(poStatus=='pendingReceipt'|| poStatus=='partiallyReceived' || poStatus=='pendingRefundPartReceived' || poStatus=='pendingBillPartReceived'|| poStatus=='pendingReceiptPartFulfilled' || poStatus=='Pending Refund/Partially Received')
						{

						}
						else if(poStatus=='closed')
						{
							POarray["custparam_error"] = "This "+orderType.toLowerCase() +"# has been closed";
							response.sendRedirect('SUITELET', 'customscript_wmsse_polist_scan', 'customdeploy_wmsse_polist_scan', false, POarray);
						}
						else if(poStatus=='pendingFulfillment')
						{
							POarray["custparam_error"] = "Please enter/scan valid "+orderType.toLowerCase() +"#";
							response.sendRedirect('SUITELET', 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan', false, POarray);
						}
						else
						{
							//POarray["custparam_error"]="Invalid po status";
							POarray["custparam_error"] = "This "+orderType.toLowerCase() +"# has been received";
							response.sendRedirect('SUITELET', 'customscript_wmsse_polist_scan', 'customdeploy_wmsse_polist_scan', false, POarray);
						}

					}
					else
					{
						//POarray["custparam_error"]="Invalid po ";
						POarray["custparam_error"] = "Please enter/scan valid "+orderType.toLowerCase() +"#";
						response.sendRedirect('SUITELET', 'customscript_wmsse_polist_scan', 'customdeploy_wmsse_polist_scan', false, POarray);
					}
				}
				else
				{
					//POarray["custparam_error"]="Invalid po ";
					POarray["custparam_error"] = "Please enter/scan valid "+orderType.toLowerCase() +"#";
					response.sendRedirect('SUITELET', 'customscript_wmsse_polist_scan', 'customdeploy_wmsse_polist_scan', false, POarray);
				}


				/*POarray["custparam_error"] = "Please enter/scan valid "+orderType.toLowerCase() +"#";
				response.sendRedirect('SUITELET', 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan', false, POarray);
				nlapiLogExecution('DEBUG', 'SearchResults ', 'Length is null');*/
			}

		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}

function getPOList(trantype,whLocation,crossSubsidiaryFeature)
{
	nlapiLogExecution('ERROR', 'trantype,whLocation',trantype+","+whLocation);

	var vType='PurchOrd';
	if(trantype=='purchaseorder')
		vType='PurchOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';
	else if(trantype=='returnauthorization')
		vType='RtnAuth';
	var filters = new Array();
	var columns = new Array();


	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));
	if(vType != 'RtnAuth')
		filters.push(new nlobjSearchFilter('formulanumeric', null, 'greaterthan', 0).setFormula('{quantity}-{quantityshiprecv}'));
	
	
	if(whLocation!=null && whLocation!='' && whLocation != undefined && whLocation!='null')
	{
		if(crossSubsidiaryFeature == true && trantype=='returnauthorization')
		{
			filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof',whLocation));
		}
		else
		{
			filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
		}

	}


	var POLineDetails = nlapiSearchRecord('transaction', 'customsearch_wmsse_rcv_ordline_details', filters, columns);
	
	return POLineDetails;
}

function getPOLineCountList(trantype,whLocation,OrdIntId,crossSubsidiaryFeature)
{
	nlapiLogExecution('ERROR', 'trantype,whLocation,Ord Id',trantype+","+whLocation+","+OrdIntId);

	var vType='PurchOrd';
	if(trantype=='purchaseorder')
		vType='PurchOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';
	else if(trantype=='returnauthorization')
		vType='RtnAuth';
	var filters = new Array();
	var columns = new Array();


	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	
	if(whLocation!=null && whLocation!='' && whLocation != undefined && whLocation!='null')
	{
		if(crossSubsidiaryFeature == true && trantype=='returnauthorization')
		{
			filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof',['@NONE@', whLocation]));
		}
		else
		{
			filters.push(new nlobjSearchFilter('location', null, 'anyof',['@NONE@', whLocation]));
		}

	}
	
	
	if(OrdIntId!=null && OrdIntId!='')
		filters.push(new nlobjSearchFilter('internalid', null, 'anyof',OrdIntId));

	var POLineDetails = nlapiSearchRecord('transaction', 'customsearch_wmsse_tranline_dets_ib', filters, columns);

	return POLineDetails;
}