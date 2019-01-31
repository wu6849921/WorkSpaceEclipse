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
		var vTranType = request.getParameter('custparam_trantype');
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		var whLocationName = request.getParameter('custparam_whlocationname');
		
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-Pick Reversal";
			st1 = "Entrar / Scan Transacci�n #";
			st2 = "Entrar / Scan Selecci�n Informe #";
			//st3 = "ANTERIOR";	

		}
		else
		{
			var headerVar='Pick Reversal';


			st0 = domainName + "-Pick Reversal";
			st1 = "Enter/Scan  Transaction#";
			st2 = "Enter/Scan  Pick Report#";

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
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterorder').value == '' && document.getElementById('enterpickreport').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan  transaction/pick report#';return false;}else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
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

		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterorder'  class='smalltextbox'  id='enterorder' type='text'/>"+
		"				</td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st2+

		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterpickreport'  class='smalltextbox'  id='enterpickreport' type='text'/>"+
		"				</td></tr>"+
		"			<tr>	<td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td>"+
		"			</tr></table>"+
		"		<table>	<tr>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='10px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Sales Order' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"			<tr></tr><tr></tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='cmdSendTO' type='submit' value='Transfer Order' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>"+
		"	</form>"+
		"<script type='text/javascript'>document.getElementById('enterorder').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var pickreportNo = request.getParameter('enterpickreport');
		var orderNo = request.getParameter('enterorder');
		var whlocation = request.getParameter('custparam_whlocation');
		var SOarray=new Array();
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		nlapiLogExecution('DEBUG', 'pickreport', pickreportNo);
		nlapiLogExecution('DEBUG', 'order', orderNo);
		var optedSoBtn = request.getParameter('cmdSend');
		var optedToBtn = request.getParameter('cmdSendTO');
		
		var tranType= 'salesorder';
		if(optedSoBtn !=null && optedSoBtn !='' && optedSoBtn !='null' && optedSoBtn == 'Sales Order')
			tranType= 'salesorder';
		else if(optedToBtn !=null && optedToBtn !='' && optedToBtn !='null' && optedToBtn == 'Transfer Order')
			tranType= 'transferorder';
		else
			tranType= 'salesorder';
		nlapiLogExecution('DEBUG', 'tranType', tranType);
		var ordArr = new Array();

		if(pickreportNo != '' && pickreportNo != null && pickreportNo != 'null' && pickreportNo != 'undefined')
		{
			var result = funtoGetOrdersOfPickreportNo(pickreportNo,whlocation);

			if(result != null && result != '' && result != 'null' && result != 'undefined')
			{
				for(var k=0;k<result.length;k++)
				{
					ordArr.push(result[k].getValue('custrecord_wmsse_order_no'));
				}
			}
			else
			{

				SOarray["custparam_error"]="Please enter/scan valid pickreportno ";
				response.sendRedirect('SUITELET', 'customscript_wmsse_pickreversal_ord_scan', 'customdeploy_wmsse_pickreversal_ord_scan', false, SOarray);
				return false;
			}
		}

		if(orderNo != null && orderNo != '' && orderNo != 'null' && orderNo != 'undefined')
		{
			var filter=new Array();
			filter.push(new nlobjSearchFilter('tranid',null,'is',orderNo.toString()));
			filter.push(new nlobjSearchFilter('mainline',null,'is','F'));

			var columns=new Array();


			var searchrec=nlapiSearchRecord(tranType,null,filter,columns);
			/*if(searchrec == null || searchrec == '' || searchrec == 'null' || searchrec == 'undefined')
			{
				searchrec=nlapiSearchRecord('transferorder',null,filter,columns);
			}*/
			if(searchrec != null && searchrec != '' && searchrec != 'null' && searchrec != 'undefined' && searchrec.length > 0)
			{

				if(ordArr.length > 0 && (ordArr.indexOf(searchrec[0].getId())==-1))
				{
					SOarray["custparam_error"]="Scanned order# doesnot belongs to pickreport#";
					response.sendRedirect('SUITELET', 'customscript_wmsse_pickreversal_ord_scan', 'customdeploy_wmsse_pickreversal_ord_scan', false, SOarray);
					return false;
				}
				else
				{
					ordArr.push(searchrec[0].getId());
				}
			}
			else
			{
				SOarray["custparam_error"]="Please enter/scan valid transaction#";
				response.sendRedirect('SUITELET', 'customscript_wmsse_pickreversal_ord_scan', 'customdeploy_wmsse_pickreversal_ord_scan', false, SOarray);
				return false;
			}



			

		}

		var optedEvent = request.getParameter('cmdPrevious');

		
		
		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

	



		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			SOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_picking_menu', 'customdeploy_wmsse_picking_menu', false, SOarray);
		}
		else
		{			

			nlapiLogExecution('DEBUG','whlocation',whlocation);
			var validSoResults = funtoCheckSo(ordArr,whlocation);
			nlapiLogExecution('DEBUG','validSoResults',validSoResults);

			if(validSoResults!=null && validSoResults!='' && validSoResults !='null' && validSoResults != 'undefined'){
				for(var k=0;k<validSoResults.length;k++)
				{
					nlapiLogExecution('DEBUG','validSoResults',validSoResults[k].getId());
					
					if(validSoResults[k].getValue('custrecord_wmsse_wms_status_flag')!=9)
					{
						SOarray["custparam_so"] = validSoResults[k].getValue('tranid','custrecord_wmsse_order_no');
						SOarray["custparam_pickreportno"] = pickreportNo;
						SOarray["custparam_soid"] = validSoResults[k].getValue('custrecord_wmsse_order_no');
						SOarray["custparam_id"] = validSoResults[k].getId();
						SOarray["custparam_error"]="";
						response.sendRedirect('SUITELET', 'customscript_wmsse_rf_pickreversal', 'customdeploy_wmsse_rf_pickreversal', false, SOarray);
						return false;
					}
				}
			}
			else{
				var msg ='';
				if(orderNo != '')
				{
					msg = "order#"
				}
				if(pickreportNo != '')
				{
					if(msg != '')
					{
						msg = msg +"/pickreport#";
					}
					else
					{
						msg = "pickreport#";
					}

				}

				SOarray["custparam_error"]="This "+msg+" is yet to be picked/is already shipped";
				response.sendRedirect('SUITELET', 'customscript_wmsse_pickreversal_ord_scan', 'customdeploy_wmsse_pickreversal_ord_scan', false, SOarray);	
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
function funtoCheckSo(orderNo,whlocation){

	nlapiLogExecution('DEBUG', 'orderNo', orderNo);
	var SORecinternalids=new Array();
	var objopentaskordersearchresultkit = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_checkso');
	
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',orderNo));	
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8','28']));	
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('type','custrecord_wmsse_sku','noneof',['Kit']));
	var resLenDetails = objopentaskordersearchresultkit.runSearch();

	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SORecinternalids = SORecinternalids.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}


	//SOtrantypefilters=null;
	//SOtrantypecols=null;
	return SORecinternalids;
}
function funtoGetOrdersOfPickreportNo(pickreportNo,whlocation){

	nlapiLogExecution('DEBUG', 'pickreportNo', pickreportNo);
	nlapiLogExecution('DEBUG', 'whlocation', whlocation);
	var SORecinternalids=new Array();
	var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_rf_pickrev_orderno');
	
	if(pickreportNo != null && pickreportNo != 'null' && pickreportNo != '' && pickreportNo !='undefined')
	{
		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',pickreportNo));
		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['9']));
	}

	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));

	OTsearchresult.addFilter(new nlobjSearchFilter('type','custrecord_wmsse_sku','noneof',['Kit']));

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
