/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function CheckInContainerList(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('DEBUG', 'getOptedField', getOptedField);
		var userAccountId = ctx.getCompany();
		nlapiLogExecution('DEBUG', 'userAccountId', userAccountId);
		var vTranType = request.getParameter('custparam_trantype');
		nlapiLogExecution('DEBUG', 'vTranType', vTranType);
		var orderType=request.getParameter('custparam_ordertype');
		var whLocation=request.getParameter('custparam_whlocation');
		nlapiLogExecution('DEBUG', 'whLocation', whLocation);
		var whLocationName=request.getParameter('custparam_whlocationname');

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
		headerVar = "Container";

		var getPageCount=request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize=5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);
		nlapiLogExecution('ERROR', 'totalPageSizeValue', totalPageSizeValue);
		if( getLanguage == 'es_ES')
		{
			//st0 = "WMS SE-CHECKIN PO SCAN";
			//var st0 = 'WMS SE-'+orderType+' Receiving';
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			//st0 = "WMS SE-Receiving PO# Scan";
			//var st0 = 'WMS SE-'+orderType+' Receiving';
			st1 = "Enter/Scan "+orderType+"#";
			st2 = "SEND";
			st3 = "PREV";

		}	
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+headerVar+' Receiving';
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}

		var vContainerDetails = getConatinerDetails('',whLocation);

		CSSurl=CSSurl.replace(/&/g,"&amp;");
		//starts (Now form name is passed correctly in function to work keyboard enter button)
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
		"	<script type='text/javascript'>function validateForm() {if(document.getElementById('entercontainer').value == ''){document.getElementById('div_error').innerHTML ='" + error + "';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
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
		"				<input type='hidden' name='hdncontainer' value=" + vContainerNum + ">"+
		"				<input type='hidden' name='hdncount' value=" + vPocount + ">"+		
		"				<input type='hidden' name='hdnorderLine' value=" + vLines + ">"+
		"				<input type='hidden' name='hdntotalQty' value=" + vOrderedQty + ">"+
		"				<input type='hidden' name='hdnrcvd' value=" + vRcvdQty + ">"+		
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='entercontainer'  class='smalltextbox'  id='entercontainer' type='text'/>"+
		"				</td>"+
		//"	<td width='10px'></td><td ><input name='cmdSearch' type='submit' value='List' width='100px' onclick='return validateForm();'/></td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		/*		"				<td><input name='cmdPrevious' type='submit' value='Back (F7)'/>" +
		"				</td><td width='20px'><input name='cmdSend' class='defaultlink'    type='submit' value='Next (Ent)' onclick='return validateForm();'/></td><td>"+


		//"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		//"				<td width='20px'></td>"+
		//"				<td align = 'left'><input name='cmdNextList' type='submit' value='Next List'/></td>"+
		"			</tr>"+ */
		"		 </table>";


		if(vContainerDetails!=null && vContainerDetails!='' && vContainerDetails.length > 0)
		{
			nlapiLogExecution('Debug', 'vContainerDetails.length', vContainerDetails.length);
			if(vContainerDetails.length>0)
			{
				html = html + "	<table>"+
				" <tr>"+
				" <td>"+
				"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
				" <tr class='uir-machine-headerrow' >"+
				" <td class='listheadertdleft listheadertextb uir-column-large' >"+orderType+""+
				" </td>"+
				" <td class='listheadertdleft listheadertextb uir-column-large' ># Lines"+
				" </td>"+				
				"</tr>";


				var OrderNumArray=new Array();
				var orderCount=0;

				nlapiLogExecution('ERROR', 'totalPageSizeValue', totalPageSizeValue);
				for (var s = 0; s < vContainerDetails.length; s++) {
					var vContainerId = vContainerDetails[s].getValue('custrecord_wmsse_trlnumber',null,'group');					
					var vContainerNum=vContainerDetails[s].getText('custrecord_wmsse_trlnumber',null,'group');
					var vLines = vContainerDetails[s].getValue('internalid',null,'count');				
					var vPocount = vContainerDetails[s].getValue('custrecord_wmsse_trllinepono',null,'count');
					var vOrderedQty = vContainerDetails[s].getValue('custrecord_wmsse_trllineordqty',null,'sum');
					var vRcvdQty = vContainerDetails[s].getValue('custrecord_wmsse_trllineexpqty',null,'sum');
					var qtyToRcv = vContainerDetails[s].getValue('custrecord_wmsse_trllineqtyrcvd',null,'sum');
					var isinactive = vContainerDetails[s].getValue('isinactive','custrecord_wmsse_trlnumber','group');
					if(qtyToRcv == '' || qtyToRcv == 'null' || qtyToRcv == null || qtyToRcv == undefined)
						qtyToRcv = '0';
					var vRemQty = parseFloat(vOrderedQty) - parseFloat(qtyToRcv);
					var str = 'vContainerNum:'+ vContainerId +'vLines:' +vLines+ 'vPocount:' + vPocount +'vOrderedQty:' + vOrderedQty + 'vRcvdQty:' + vRcvdQty;
					nlapiLogExecution('Debug', 'str', str);
					nlapiLogExecution('Debug', 'vRemQty', vRemQty);
					if(vRemQty > 0 && isinactive == 'F')
					{
						if(OrderNumArray.indexOf(vContainerNum)!=-1)
						{
							continue;
						}
						else
						{

							if(parseInt(orderCount)<5)
							{
								OrderNumArray.push(vContainerNum);
							}
						}
						nlapiLogExecution('Debug', 'OrderNumArray', OrderNumArray);

						if(OrderNumArray.length>totalPageSizeValue && (parseInt(orderCount)<5))
						{

							if(OrderNumArray.indexOf(vContainerNum)!=-1)
							{
								orderCount=parseInt(orderCount)+1;
							}


							var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_rcvcontsumm', 'customdeploy_wmsse_rcvcontsumm');		

							var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_ordertype=' + orderType + '&custparam_trantype=' + vTranType + '&custparam_language=' + getLanguage + '&custparam_container=' + vContainerId + '&custparam_containerNo=' + vContainerNum +'&custparam_polineno' + vLines + '&custparam_count' + vPocount +'&custparam_oredrquantity' + vOrderedQty + '&custparam_rcvQuantity' + vRcvdQty;
							if(s%1 == 0)
								html = html + "	<tr  class='uir-list-row-tr line uir-list-row-even'>";
							else
								html = html + "	<tr  class='uir-list-row-tr line uir-list-row-odd'>";

							if(vRemQty > 0)
								html = html +" <td><a name='link1URL_1' href='" + linkURL_1 + "'> "+vContainerNum+"</a></td>";
							else
								html = html +" <td>"+ vContainerNum +"</td>";

							html = html + " <td align='right'>"+  vLines  +"</td>"+
							"</tr>";
						}

						if(parseInt(orderCount)>=5)
						{
							if((parseInt(getPageCount)+s+1)<vContainerDetails.length)
								orderCount=parseInt(orderCount)+1;
							break;

						}
					}
				}
				nlapiLogExecution('DEBUG', 'orderCount', orderCount);
				nlapiLogExecution('DEBUG', 'getPageCount', getPageCount);

				"				<input type='hidden' name='hdngetPageCount' id='hdngetPageCount' value=" + getPageCount + ">"+
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
			POarray["custparam_error"] = 'No containers to show.';
			response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
			return;
		}

		html = html +"		<table>	<tr>";
		if(getPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"				<td width='20px'></td>";
		if(parseInt(orderCount) > 5)
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>"+
		"	</form>"+

		"<script type='text/javascript'>document.getElementById('entercontainer').focus();</script>"+
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

		POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

		var whlocation = request.getParameter('custparam_whlocation');
		nlapiLogExecution('DEBUG', 'whlocation', POarray["custparam_whlocation"]);
		var trantype=request.getParameter('hdntrantype');
		nlapiLogExecution('DEBUG', 'trantype', trantype);
		var orderType=request.getParameter('hdnordertype');
		POarray["custparam_ordertype"]=orderType;
		if(trantype == null || trantype == '' || trantype == 'null')
			trantype='purchaseorder';
		POarray["custparam_trantype"] = trantype;
		var getLanguage = request.getParameter('hdngetLanguage');
		POarray["custparam_language"] = getLanguage;
		nlapiLogExecution('DEBUG', 'getLanguage', POarray["custparam_language"]);
		nlapiLogExecution('DEBUG', 'trantype', trantype);


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


		POarray["custparam_container"] = request.getParameter('entercontainer');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			POarray["custparam_error"]='';
			//response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
			response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
		}
		else
		{
			//var trantype='';

			nlapiLogExecution('DEBUG','request.getParameter("cmdNextList")',request.getParameter('cmdNextList'));
			nlapiLogExecution('DEBUG','request.getParameter("cmdPrevList")',request.getParameter('cmdPrevList'));
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
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlist_scan', 'customdeploy_wmsse_rcvcontlist_scan', false, POarray);
				return;
			}
			if(request.getParameter('cmdPrevList')=="Prev")
			{
				POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-1;
				POarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlist_scan', 'customdeploy_wmsse_rcvcontlist_scan', false, POarray);
				return;
			}
			var getPOid=request.getParameter('entercontainer');
			nlapiLogExecution('DEBUG','getPOid',getPOid);

			var vContainerDetails = getConatinerDetails(getPOid,POarray["custparam_whlocation"]);
			nlapiLogExecution('Debug', 'vContainerDetails', vContainerDetails);
			var isValidContainer =false;
			if(vContainerDetails!=null && vContainerDetails!='' && vContainerDetails.length > 0)
			{
				//var getInternalId = vContainerDetails[0].getId();	
				for (var s = 0; s < vContainerDetails.length; s++) 
				{
					var vContainerNum=vContainerDetails[s].getText('custrecord_wmsse_trlnumber',null,'group');

					nlapiLogExecution('DEBUG','vContainerNum',vContainerNum);
					if(getPOid == vContainerNum)
					{
						isValidContainer =false;
						var vContainerId=vContainerDetails[s].getValue('custrecord_wmsse_trlnumber',null,'group');
						var vLines = vContainerDetails[s].getValue('custrecord_wmsse_trllinepolineno',null,'count');				
						var vPocount = vContainerDetails[s].getValue('custrecord_wmsse_trllinepono',null,'count');
						var vOrderedQty = vContainerDetails[s].getValue('custrecord_wmsse_trllineordqty',null,'sum');
						var vRcvdQty = vContainerDetails[s].getValue('custrecord_wmsse_trllineexpqty',null,'sum');
						var qtyToRcv = vContainerDetails[s].getValue('custrecord_wmsse_trllineqtyrcvd',null,'sum');
						var TrailerStatus=vContainerDetails[s].getText('custrecord_wmsse_trllinetransstatus',null,'group');
						if(qtyToRcv == '' || qtyToRcv == 'null' || qtyToRcv == null || qtyToRcv == undefined)
							qtyToRcv = '0';
						var vRemQty = parseFloat(vOrderedQty) - parseFloat(qtyToRcv);
						var str = 'vContainerNum:'+ vContainerNum +'vLines:' +vLines+ 'vPocount:' + vPocount +'vOrderedQty:' + vOrderedQty + 'vRcvdQty:' + vRcvdQty;
						nlapiLogExecution('Debug', 'str', str);
						/*var vContainerNum = vContainer.getText('custrecord_wmsse_trlnumber',null,'group');
				var vLines = vContainer.getValue('custrecord_wmsse_trllinepolineno',null,'count');				
				var vPocount = vContainer.getValue('custrecord_wmsse_trllinepono',null,'count');
				var vOrderedQty = vContainer.getValue('custrecord_wmsse_trllineordqty',null,'sum');
				var vRcvdQty = vContainer.getValue('custrecord_wmsse_trllineexpqty',null,'sum');				

				var str = 'vContainerNum:'+ vContainerNum +'vLines:' +vLines+ 'vPocount:' + vPocount +'vOrderedQty:' + vOrderedQty + 'vRcvdQty:' + vRcvdQty;
				nlapiLogExecution('Debug', 'str', str);
						 */
						//POarray["custparam_containerId"]=getInternalId;				
						POarray["custparam_container"] = vContainerId;				
						POarray["custparam_count"]=vPocount;
						POarray["custparam_oredrquantity"]=vOrderedQty;
						POarray["custparam_rcvQuantity"]=vRcvdQty;
						POarray["custparam_polineno"]=vLines;

						if(vRemQty > 0)
						{
							POarray["custparam_error"]='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsumm', 'customdeploy_wmsse_rcvcontsumm', false, POarray);
							return;
						}
						else if(TrailerStatus == 'Closed')
						{
							nlapiLogExecution('Debug', 'valid container status', 'valid container status');
							POarray["custparam_error"] = "Entered container# is already closed";
							response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlist_scan', 'customdeploy_wmsse_rcvcontlist_scan', false, POarray);
							return;
						}
						else
						{
							POarray["custparam_error"] = "Please enter/scan valid "+orderType.toLowerCase() +"#";
							response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlist_scan', 'customdeploy_wmsse_rcvcontlist_scan', false, POarray);
							return;
						}

					}
					/*else
					{
						POarray["custparam_error"] = "Please enter/scan valid "+orderType.toLowerCase() +"#";
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlist_scan', 'customdeploy_wmsse_rcvcontlist_scan', false, POarray);
						return;
					}*/
				}

				if(isValidContainer == false)
				{
					POarray["custparam_error"] = "Please enter/scan valid container#";
					response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlist_scan', 'customdeploy_wmsse_rcvcontlist_scan', false, POarray);
					return;
				}
			}
			else
			{
				POarray["custparam_error"] = "Please enter/scan valid "+orderType.toLowerCase() +"#";
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlist_scan', 'customdeploy_wmsse_rcvcontlist_scan', false, POarray);
				return;
			}

		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}


/**
 * To get container details
 */ 

function getConatinerDetails(containernumber,whLocation)
{	
	var vfilters = new Array();   	
	if(containernumber!=null && containernumber!='' && containernumber!='null' && containernumber!='undefined')
		vfilters.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber', null, 'is', containernumber));
	if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
		vfilters.push(new nlobjSearchFilter('custrecord_wmsse_trllinelocation', null, 'anyof', ['@NONE@',whLocation]));	
	vfilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	vfilters.push(new nlobjSearchFilter('mainline','custrecord_wmsse_trllinepono','is','T'));	
		

	var vcolumns = new Array();
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trlnumber',null,'group'));	
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepono',null,'count'));
	vcolumns.push(new nlobjSearchColumn('internalid',null,'count'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllineordqty',null,'sum'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllineexpqty',null,'sum'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllineqtyrcvd',null,'sum'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllinetransstatus',null,'group'));
	vcolumns.push(new nlobjSearchColumn('isinactive','custrecord_wmsse_trlnumber','group'));

	var ContainerDetails = nlapiSearchRecord('customrecord_wmsse_trailerline', null, vfilters, vcolumns);	

	return ContainerDetails;
}