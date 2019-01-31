/**
 * Script Description
 * This script is used to scan order.
 */

/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function CheckInContainer(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('DEBUG', 'getOptedField', getOptedField);
		var userAccountId = ctx.getCompany();
		nlapiLogExecution('DEBUG', 'userAccountId', userAccountId);
		var vTranType = request.getParameter('custparam_trantype');
		var orderType=request.getParameter('custparam_ordertype');
		var st0,st1,st2,st3;
		var headerVar='Receiving';
		orderType ="Container";
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
		if( getLanguage == 'es_ES')
		{
			//st0 = "WMS SE-CHECKIN PO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			//st0 = "WMS SE-Receiving PO# Scan";
			st1 = "Enter/Scan "+orderType+"#";
			st2 = "SEND";
			st3 = "PREV";

		}	
		headerVar = "Container";
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whLocation = request.getParameter('custparam_whlocation');
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
		"	<script type='text/javascript'>function validateForm() {if(document.getElementById('entercontainer').value == '' && document.getElementById('entershipment').value == ''){document.getElementById('div_error').innerHTML ='" + error + "';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_po' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Receiving "+headerVar+"#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr>"+
		"		 </table>"+
		"		<table>"+
		//"			<tr border='1'><td align='center' class='tablecell'  valign='top'><b>RECEIVING</b></td></tr>"+
		//"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdntrantype' value=" + vTranType + ">"+	
		"				<input type='hidden' name='hdnordertype' value='" + orderType + "'>"+		
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' id = 'hdnWhLocation' value='" + whLocation + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='entercontainer'  class='smalltextbox'  id='entercontainer' type='text'/>"+
		"				</td>"+
		//"				<td><input name='cmdSend' class='defaultlink'    type='submit' value='Next (ENT)' onclick='return validateForm();'/></td><td>"+
		"	<td></td><td ><input name='cmdSearch' type='submit' value='List' width='100px'/></td>"+
		"			</tr>" ;
/*		"			<tr>" +		
		"				<td align = 'left' class='labelmsg'>Enter/Scan shipment#" 
		"				</td>"+
		"			</tr>"+		
		"			<tr>"+*/
		html = html + "			<tr>";
		html = html + "				<td align = 'left'  class='labelmsg'>Enter/Scan shipment#</td>";
		html = html + "				</td>";
		html = html + "			</tr>";
		html = html +"<tr>"+
		"				<td align = 'left'><input name='entershipment'  class='smalltextbox'  id='entershipment' type='text'/>"+
		"				</td>"+
		"			</tr><tr><td></td></tr></table>"+
		
		"			<table><tr>"+
		//"				<td><input name='cmdSend' class='defaultlink'    type='submit' value='Next' onclick='return validateForm();'/></td><td>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 

		" 	</table>"+
		"	</form>"+

		"<script type='text/javascript'>document.getElementById('entercontainer').focus();</script>"+
		"<input type='hidden' name='hdncontainer' value='" + orderType + "'>"+
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
		nlapiLogExecution('DEBUG', 'whlocation', whlocation);
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



		//POarray["custparam_error"] = st11;
		POarray["custparam_screenno"] = st12;
		POarray["custparam_containerNo"] = request.getParameter('entercontainer');
		POarray["custparam_shipment"] = request.getParameter('entershipment');
		nlapiLogExecution('Debug', 'POarray["custparam_containerNo"]', POarray["custparam_containerNo"]);
		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
		}
		else
		{
			//var trantype='';
			nlapiLogExecution('DEBUG','request.getParameter("cmdSearch")',request.getParameter('cmdSearch'));
			if(request.getParameter('cmdSearch')=="List")
			{
				POarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlist_scan', 'customdeploy_wmsse_rcvcontlist_scan', false, POarray);
				return;
			}
			
			
			var getPOid=request.getParameter('entercontainer');
			var shipmntNo=request.getParameter('entershipment');
			nlapiLogExecution('Debug', 'getPOid', getPOid);
			nlapiLogExecution('Debug', 'shipmntNo', shipmntNo);
			if(getPOid!=null && getPOid!='' && getPOid != 'null')
			{
				nlapiLogExecution('Debug', 'into poid');
			var vContainer = getConatinerDetails(getPOid,POarray["custparam_whlocation"]);
			if(vContainer!=null && vContainer!='' && vContainer!='null' && vContainer.length > 0)
			{
				var getInternalId = vContainer[0].getId();
				POarray["custparam_container"]=getInternalId;
				if(shipmntNo!=null && shipmntNo!='' && shipmntNo!='null')
				{
				var vContainerDetails = getConatinerLineDetails(getInternalId,shipmntNo,POarray["custparam_whlocation"]);
				if(vContainerDetails!=null && vContainerDetails!='' && vContainerDetails!='null' && vContainerDetails.length > 0)
				{
					POarray["custparam_shipmentno"]=shipmntNo;
					for (var s = 0; s < vContainerDetails.length; s++) 
					{
						var vContainerNum=vContainerDetails[s].getText('custrecord_wmsse_trlnumber',null,'group');
						if(getPOid == vContainerNum)
						{
							var vOrderedQty = vContainerDetails[s].getValue('custrecord_wmsse_trllineordqty',null,'sum');
							var vRcvdQty = vContainerDetails[s].getValue('custrecord_wmsse_trllineexpqty',null,'sum');
							var qtyToRcv = vContainerDetails[s].getValue('custrecord_wmsse_trllineqtyrcvd',null,'sum');
							if(qtyToRcv == '' || qtyToRcv == 'null' || qtyToRcv == null || qtyToRcv == undefined)
								qtyToRcv = '0';
							var vRemQty = parseFloat(vOrderedQty) - parseFloat(qtyToRcv);
						}
					}
				}
				
				else
				{
					POarray["custparam_error"] = "Please enter/scan valid shipment#";
					response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
					return;
				}			
				}
				else
					{
					var vContainerDetails = getConatinerLineDetails(getInternalId,shipmntNo,POarray["custparam_whlocation"]);
					if(vContainerDetails!=null && vContainerDetails!='' && vContainerDetails!='null' && vContainerDetails.length > 0)
					{						
						for (var s = 0; s < vContainerDetails.length; s++) 
						{
							var vContainerNum=vContainerDetails[s].getText('custrecord_wmsse_trlnumber',null,'group');
							if(getPOid == vContainerNum)
							{
								var vOrderedQty = vContainerDetails[s].getValue('custrecord_wmsse_trllineordqty',null,'sum');
								var vRcvdQty = vContainerDetails[s].getValue('custrecord_wmsse_trllineexpqty',null,'sum');
								var qtyToRcv = vContainerDetails[s].getValue('custrecord_wmsse_trllineqtyrcvd',null,'sum');
								var TrailerStatus=vContainerDetails[s].getText('custrecord_wmsse_trllinetransstatus',null,'group');
								nlapiLogExecution('Debug', 'TrailerStatus', TrailerStatus);
								if(qtyToRcv == '' || qtyToRcv == 'null' || qtyToRcv == null || qtyToRcv == undefined)
									qtyToRcv = '0';
								var vRemQty = parseFloat(vOrderedQty) - parseFloat(qtyToRcv);
							}
						}
					}
					}
				if(vRemQty > 0)
				{
					nlapiLogExecution('ERROR', 'POarray["custparam_container"]',POarray["custparam_container"]);
					response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsumm', 'customdeploy_wmsse_rcvcontsumm', false, POarray);
					return;
				}
				else if(TrailerStatus == 'Closed')
				{
					nlapiLogExecution('Debug', 'valid container status', 'valid container status');
					POarray["custparam_error"] = "Entered container# is already closed";
					response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
					return;
				}
				else
				{
					nlapiLogExecution('Debug', 'valid container', 'valid container');
					POarray["custparam_error"] = "Please enter/scan valid container#";
					response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
					return;
				}
				
			}
			else
				{
				POarray["custparam_error"] = "Please enter/scan valid container#";
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
				return;
				}
			}
			else if(shipmntNo!=null && shipmntNo!='' && shipmntNo != 'null')
				{
				nlapiLogExecution('Debug', 'shipmntNo1', shipmntNo);
				var vfilters1 = new Array();  				
				vfilters1.push(new nlobjSearchFilter('custrecord_wmsse_trllineshipment', null, 'is', shipmntNo));					
			
				var vcolumns1 = new Array();
				vcolumns1.push(new nlobjSearchColumn('custrecord_wmsse_trlnumber'));	
				
				var ContainerDetails = nlapiSearchRecord('customrecord_wmsse_trailerline', null, vfilters1, vcolumns1);	
				nlapiLogExecution('Debug', 'ContainerDetails', ContainerDetails);
				if(ContainerDetails!=null && ContainerDetails!='')
				{
					var getInternalId = ContainerDetails[0].getValue('custrecord_wmsse_trlnumber');	
					var containerNo = ContainerDetails[0].getText('custrecord_wmsse_trlnumber');
					var OrderQty = ContainerDetails[0].getValue('custrecord_wmsse_trllineordqty');
					var ExpQty = ContainerDetails[0].getValue('custrecord_wmsse_trllineexpqty');
					var RecQty = ContainerDetails[0].getValue('custrecord_wmsse_trllineqtyrcvd');
					var RemQty = parseFloat(OrderQty) - parseFloat(RecQty);
					
					nlapiLogExecution('Debug', 'getInternalId,containerNo', getInternalId + ',' + containerNo);
					POarray["custparam_container"]=getInternalId;
					POarray["custparam_containerNo"] = containerNo;
					POarray["custparam_shipmentno"] = shipmntNo;				
					POarray["custparam_error"]='';
					
					if(vRemQty > 0)
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsumm', 'customdeploy_wmsse_rcvcontsumm', false, POarray);
					else
					{
						POarray["custparam_error"] = "Please enter/scan valid shipment#";
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
						return;
					}
				}			
				else
				{
					POarray["custparam_error"] = "Please enter/scan valid shipment#";
					response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
					return;
				}
				}
			else
			{
				POarray["custparam_error"] = "Please enter/scan valid container/shipment#";
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
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
	var filters = new Array();	
	//filters.push(new nlobjSearchFilter('custrecord_ad_sf_ld_closed', null, 'is', 'F'));
	if(containernumber!=null && containernumber!='' && containernumber!='null' && containernumber!='undefined')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_appointmenttrailer', null, 'is', containernumber));
	if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sitetrailer', null, 'anyof', ['@NONE@',whLocation]));
	
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	
	/*var vcolumns = new Array();
		vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trlnumber',null,'group'));*/	
	
	var ContainerDetails = new nlapiSearchRecord('customrecord_wmsse_trailer',null, filters, null);
	return ContainerDetails;
}

function getConatinerLineDetails(containernumber,shipmntNo,whLocation)
{	
	var vfilters = new Array();   	
	if(containernumber!=null && containernumber!='' && containernumber!='null' && containernumber!='undefined')
		vfilters.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber', null, 'is', containernumber));
	if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
		vfilters.push(new nlobjSearchFilter('custrecord_wmsse_trllinelocation', null, 'anyof', ['@NONE@',whLocation]));
	if(shipmntNo!=null && shipmntNo!='' && shipmntNo!='null' && shipmntNo!='undefined')
		vfilters.push(new nlobjSearchFilter('custrecord_wmsse_trllineshipment', null, 'is', shipmntNo));	
	vfilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	vfilters.push(new nlobjSearchFilter('mainline','custrecord_wmsse_trllinepono','is','T'));	
	
	var vcolumns = new Array();
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trlnumber',null,'group'));	
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepono',null,'count'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepolineno',null,'count'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllineordqty',null,'sum'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllineexpqty',null,'sum'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllineqtyrcvd',null,'sum'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllinetransstatus',null,'group'));
	
	var ContainerDetails = nlapiSearchRecord('customrecord_wmsse_trailerline', null, vfilters, vcolumns);	
	
	return ContainerDetails;
}
