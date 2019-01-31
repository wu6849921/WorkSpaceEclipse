/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function fnContSumm(request, response)
{
	if (request.getMethod() == 'GET') {
		var getLanguage = request.getParameter('custparam_language');
		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		var conatiner = request.getParameter('custparam_container'); 
		nlapiLogExecution('DEBUG', 'conatiner', conatiner);
		var conatinerNo = request.getParameter('custparam_containerNo'); 
		nlapiLogExecution('DEBUG', 'conatinerNo', conatinerNo);
		var shipmntNo = request.getParameter('custparam_shipmentno'); 
		nlapiLogExecution('DEBUG', 'shipmentNo', shipmntNo);
		var vTranType = request.getParameter('custparam_trantype');
		nlapiLogExecution('DEBUG', 'vTranType', vTranType);
		var orderType=request.getParameter('custparam_ordertype');
		var whLocation=request.getParameter('custparam_whlocation');
		nlapiLogExecution('DEBUG', 'whLocation', whLocation);
		var whLocationName=request.getParameter('custparam_whlocationname');
		
		var poInternalId = '';
		
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
		
		var st0,st1,st2,st3,st4,st5,st6,st7,st8;
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		if( getLanguage == 'es_ES')
		{
			st0 = "";
			st1 = "INGRESAR SELECCI&#211;N";			
			st2 = "ENVIAR";
			st3 = "ANTERIOR";

		}
		else
		{
			st0 = domainName + '-'+headerVar+' Receiving';
			st1 = "Container#";
			st2 = "No of orders ";
			st3 = "No of order lines"; 
			st4 = "Total ordered qty ";
			st7 = "Total recieved qty ";
			st8 = "Total remaining qty ";
		}
		
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
		
	var container = '';
	var orderValue = '';
	var orderLine = '';
	var totalQty = '';
	var rcvd = '';
	var rem = '';
	
	/*var filter=new Array();
	filter.push(new nlobjSearchFilter('custrecord_wmsse_appointmenttrailer',null,'is',conatiner));
	var columns=new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_appointmenttrailer'));
	var searchrec=nlapiSearchRecord('customrecord_wmsse_trailer',null,filter,columns);
	nlapiLogExecution('DEBUG', 'searchrec',searchrec);
	if(searchrec!=null && searchrec!='')
		{
		var internalId = searchrec[0].getId();
		}
	nlapiLogExecution('DEBUG', 'internalId', internalId);*/
	
	
	var filter1=new Array();
	if(conatiner!=null&&conatiner!='')
		filter1.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber',null,'anyof',conatiner));	
	
	//var columns1 = new Array();
	//columns1.push(new nlobjSearchColumn('custrecord_wmsse_trlnumber',null,'group'));	
	//columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepono',null,'count'));
	//columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepolineno',null,'count'));
	//columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllineordqty',null,'sum'));
	//columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllineexpqty',null,'sum'));
	
	var searchrec1=nlapiSearchRecord('customrecord_wmsse_trailerline','customsearch_wmsse_trlline_summary',filter1,null);
	if(searchrec1!=null && searchrec1!='')
	{
		var orderCount = searchrec1.length;
		for (var i = 0; searchrec1 != null && i < searchrec1.length; i++) {
			
				var invtarray= searchrec1[i];
				if (invtarray != null)
				{
					container = searchrec1[i].getText('custrecord_wmsse_trlnumber',null,'group');
					//poInternalId = searchrec1[i].getValue('internalid','custrecord_wmsse_trllinepono','count');
					poInternalId = searchrec1[i].getValue('custrecord_wmsse_trllinepono',null,'count');
					orderLine = searchrec1[i].getValue('custrecord_wmsse_trllinepolineno',null,'count');
					if(poInternalId > 1)
						{
						var filter2=new Array();
						if(conatiner!=null&&conatiner!='')
							filter2.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber',null,'anyof',conatiner));	
						
						var searchrec2=nlapiSearchRecord('customrecord_wmsse_trailerline','customsearch_wmsse_trllinedetails',filter2,null);
						
						orderLine = searchrec2[i].getValue('internalid',null,'count');
						}
					totalQty = searchrec1[i].getValue('custrecord_wmsse_trllineordqty',null,'sum');
					var expQty = searchrec1[i].getValue('custrecord_wmsse_trllineexpqty',null,'sum');
					rcvd = searchrec1[i].getValue('custrecord_wmsse_trllineqtyrcvd',null,'sum');
					//rcvd = parseFloat(totalQty)-parseFloat(expQty);
					if(totalQty == '' || totalQty == 'null' || totalQty == null)
						totalQty = '0';
					if(rcvd == '' || rcvd == 'null' || rcvd == null)
						rcvd = '0';
					if(expQty == '' || expQty == 'null' || expQty == null)
						expQty = '0';
					rem = parseFloat(expQty)-parseFloat(rcvd);
					//getItem = searchrec1[i].getText('custrecord_wmsse_trllineitem');
					//poInternalId = searchrec1[i].getValue('custrecord_wmsse_trllinepono');
				}
		}
		var str = 'vContainerNum:'+ container +'orderLine:' +orderLine+ 'vPocount:' + poInternalId +'vOrderedQty:' + totalQty + 'vRcvdQty:' + rcvd;
		nlapiLogExecution('Debug', 'str', str);
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
	"	<script type='text/javascript'>function validateForm() {this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
	html = html +functionkeyHtml;
	html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
	html = html +"	<form name='_rf_checkin_po' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
	//"		<table class='outertable'>"+
	"		<table width='100%'>"+
	"			<tr><td class='tableheading'>Receiving "+headerVar+"# Summary</td></tr>"+
	"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+
	"		<table>"+	
	"			<tr><td align='center'></td></tr>"+
	"			<tr>"+
	//"				<td align = 'left' class='labelmsg'>" + st1+
	//"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
	"				<input type='hidden' name='hdntrantype' value=" + vTranType + ">"+	
	"				<input type='hidden' name='hdnordertype' value='" + orderType + "'>"+
	"				<input type='hidden' name='hdncontainer' value=" + conatiner + ">"+
	"				<input type='hidden' name='hdncontainerNo' value=" + conatinerNo + ">"+
	"				<input type='hidden' name='hdncount' value=" + orderCount + ">"+
	//"				<input type='hidden' name='hdnitem' value=" + getItem + ">"+	
	"				<input type='hidden' name='hdninternalId' value=" + internalId + ">"+
	"				<input type='hidden' name='hdnpoInternalId' value=" + poInternalId + ">"+
	"				<input type='hidden' name='hdnorderLine' value=" + orderLine + ">"+
	"				<input type='hidden' name='hdntotalQty' value=" + totalQty + ">"+
	"				<input type='hidden' name='hdnrcvd' value=" + rcvd + ">"+
	"				<input type='hidden' name='hdnrem' value=" + rem + ">"+		
	"				<input type='hidden' name='hdnshipmntNo' id='hdnshipmntNo' value=" + shipmntNo + ">"+	
	"				</td>"+
	"			</tr>"+
	"			<tr>"+
	"				<td align = 'left'>"+
	"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
	"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
	"				<input type='hidden' name='hdnWhLocation' value='" + whLocation + "'>"+
	"				</td>"+
	"			</tr>"+
	"				<td align = 'left' class='labelmsg'>"+st1+":<label>"+container+"</label>"+
	"				</td>"+
	"			</tr>";
	if(shipmntNo!=null && shipmntNo!='' && shipmntNo != 'null')
		{
	html = html +"</tr>"+
	"				<td align = 'left' class='labelmsg'>Shipment#:<label>"+shipmntNo+"</label>"+
	"				</td>"+
	"			</tr>";
		}
	html = html +"</tr>"+
	"				<td align = 'left' class='labelmsg'>"+st2+":<label>"+poInternalId+"</label>"+
	"				</td>"+
	"			</tr>"+
	"			<tr>"+
	"				<td align = 'left' class='labelmsg'>"+st3 +":<label>"+orderLine+"</label>"+
	"				</td>"+
	"			</tr>"+
	"			<tr>"+
	"				<td align = 'left' class='labelmsg'>"+st4+":<label>"+totalQty+"</label>"+
	"				</td>"+
	"			</tr>"+
	"			<tr>"+
	"				<td align = 'left' class='labelmsg'>"+st7+":<label>"+rcvd+"</label>"+
	"				</td>"+
	"			</tr>"+
	"			<tr>"+
	"				<td align = 'left' class='labelmsg'>"+st8+":<label>"+rem+"</label>"+
	"				</td>"+
	"			</tr>"+
	/*"			<table><tr>"+
	"				<td><input name='cmdSend' class='defaultlink' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td><td>"+
	"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
	"				</td><td width='20px'></td>"+	
	"			</tr></table>"+*/
	"			<table><tr>"+	
	"				<td>"+
	"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
	"				</td><td width='20px'></td>"+
	"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
	"			</tr>"+ 

	" 	</table>"+
	" 		</table>"+		
	"	</form>"+	
	"</body>"+
	"</html>";

		response.write(html);
	}
	else 
	{		
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');
		
		
		var optedEvent = request.getParameter('cmdPrevious');
		nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);
		
		var conatiner = request.getParameter('hdncontainer'); 
		nlapiLogExecution('DEBUG', 'conatinerNo35235', conatiner);
		
		var conatinerNo = request.getParameter('hdncontainerNo'); 
		nlapiLogExecution('DEBUG', 'conatinerNo', conatinerNo);
	/*	var getItem = request.getParameter('hdnitem');
		nlapiLogExecution('DEBUG', 'getItem', getItem);		*/
		
		var internalId = request.getParameter('custparam_container');
		nlapiLogExecution('DEBUG', 'internalId', internalId);
		
		var poInternalId = request.getParameter('hdnpoInternalId');
		nlapiLogExecution('DEBUG', 'poInternalId1', poInternalId);
		
		var orderCount = request.getParameter('hdncount');
		nlapiLogExecution('DEBUG', 'orderValue11', orderCount);		

		var orderLine = request.getParameter('hdnorderLine');
		nlapiLogExecution('DEBUG', 'orderLine', orderLine);
		
		var totalQty = request.getParameter('hdntotalQty');
		nlapiLogExecution('DEBUG', 'totalQty', totalQty);
		
		
		var rcvd = request.getParameter('hdnrcvd');
		nlapiLogExecution('DEBUG', 'rcvd', rcvd);
		var rem = request.getParameter('hdnrem');
		nlapiLogExecution('DEBUG', 'rem', rem);		
		
		var POarray = new Array();
		//containerArray["custparam_containerNo"]=conatinerNo;
		
		POarray["custparam_containerNo"]=conatinerNo;
		//POarray["custparam_getItem"]=getItem;
		POarray["custparam_container"]=internalId;
		POarray["custparam_count"]=orderCount;
		POarray["custparam_totoredrquantity"]=totalQty;
		POarray["custparam_rcvQuantity"]=rcvd;
		POarray["custparam_remainingQty"]=rem;
		POarray["custparam_polineno"]=orderLine;
		POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		//POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		nlapiLogExecution('DEBUG', 'whlocation', POarray["custparam_whlocation"]);
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_shipmentno"] = request.getParameter('hdnshipmntNo');

		if (optedEvent == 'Back (F7)') 
		{
			response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
		}

		else
		{
			nlapiLogExecution('DEBUG', 'POarray["custparam_container"]', POarray["custparam_container"]);			
			response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
		} 
		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
		
	}
	
}