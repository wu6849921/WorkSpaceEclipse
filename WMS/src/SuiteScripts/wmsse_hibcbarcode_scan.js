/**
 * Script Description
 * This script is used to scan order.
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
function CheckInHIBC(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var getOptedField = request.getParameter('custparam_option');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var whLoacationName=request.getParameter('custparam_whlocationname');
		var trantype= request.getParameter('custparam_trantype');
		/*nlapiLogExecution('ERROR', 'whLocation', whLocation);*/
		var whCompany= request.getParameter('custparam_company');
		var orderType=request.getParameter('custparam_ordertype');
		var getHIBCBarcodeFlag=request.getParameter('custparam_hibcflag');
		var getPONo = request.getParameter('custparam_poid');
		var st0,st1,st2,st3;
		var headerVar='Receiving';
		if(trantype == 'purchaseorder')
		{
			headerVar='PO';
		}
		else if(trantype == 'transferorder')
		{
			headerVar='TO';
		}
		else
		{
			headerVar='RMA';
		}
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
		var whLocationName = request.getParameter('custparam_whlocationname');
		
		var systemRule=getSystemRuleValue('Define inbound barcode type',whLocation);
		var error="Please enter/scan HIBC/GS1 barcode";
		var tableHeading = 'Receiving HIBC/GS1 Barcode';
		var labelText = 'Enter/Scan HIBC/GS1 Barcode';
		if(systemRule.toUpperCase() == 'GS1')
		{
			error="Please enter/scan GS1 barcode";
			tableHeading = 'Receiving GS1 Barcode';
			labelText = 'Enter/Scan GS1 Barcode';
		}
		else if(systemRule.toUpperCase() == 'HIBC')
		{
			error="Please enter/scan HIBC barcode";
			tableHeading = 'Receiving HIBC Barcode';
			labelText = 'Enter/Scan HIBC Barcode';
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
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var error="Please enter/scan HIBC barcode";
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
		"	<script type='text/javascript'>function validateForm() {if(document.getElementById('enterhibc').value == ''){document.getElementById('div_error').innerHTML ='" + error + "';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_po' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+ tableHeading +"</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr>"+
		"		 </table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+orderType+"# <label>" + getPONo + "</label>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnordertype' value='" + orderType + "'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value= '" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnHIBCBarcodeFlag' value=" + getHIBCBarcodeFlag + ">"+
		"				<input type='hidden' name='hdnBarcode' value=" + systemRule.toUpperCase() + ">"+
		"				</td>"+
		"			</tr>"+	
		/*"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Please Select Option"+
		"			</td>"+
		"			</tr>"+
		"			<tr>"+
		"	<td align = 'left'><input name='barcode'  id='barcode' type='radio' value='hibc' checked='checked'/> HIBC Barcode <br>"+
		"				<input name='barcode'  id='barcode' type='radio' value='gs1'/> GS1 Barcode"+
		"				</td>"+
		"			</tr>"+*/
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ labelText +""+
		"			</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterhibc'  class='smalltextbox'  id='enterhibc' type='text'/>"+
		"				</td>"+
		"				<td><input name='cmdSend1' class='defaultlink'    type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"	<td width='10px'></td><td ></td>"+
		"			</tr><tr><td></td></table>"+
		"			<table><tr>"+
		//"				<td><input name='cmdSend' class='defaultlink'    type='submit' value='Next' onclick='return validateForm();'/></td><td>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 

		" 	</table>"+
		"	</form>"+

		"<script type='text/javascript'>document.getElementById('enterhibc').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');
		var vHIBCbarcode = request.getParameter('enterhibc');
		vHIBCbarcode = vHIBCbarcode.toString();
		nlapiLogExecution('DEBUG', 'vHIBCbarcode', vHIBCbarcode);
		var POarray = new Array();
		var tempflag='F';
		POarray["custparam_poid"] = request.getParameter('custparam_poid');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_customer"] = request.getParameter('hdnCustomer');
		POarray["custparam_trantype"] = request.getParameter('hdntrantype');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_hibcflag"] = request.getParameter('hdnHIBCBarcodeFlag');
		var getHIBCBarcodeFlag = request.getParameter('hdnHIBCBarcodeFlag');
		
		var trantype=request.getParameter('hdntrantype');
		nlapiLogExecution('ERROR', 'trantype', trantype);
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var orderType=request.getParameter('hdnordertype');
		POarray["custparam_ordertype"]=orderType;
		var logMsg = 'PO = ' + POarray["custparam_poid"] + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - HIBC Barcode', logMsg);		
		
		var radioButtonValue = request.getParameter('hdnBarcode');
		nlapiLogExecution('ERROR', 'radioButtonValue', radioButtonValue);	
		
		if (optedEvent != 'Back (F7)') {
			try
			{
				nlapiLogExecution('ERROR', 'vHIBCbarcode',vHIBCbarcode);
				//var dtsettingFlag = DateSetting();
				if(radioButtonValue == 'HIBC')
				{
					//var getHIBCResult = fnParseHIBC(vHIBCbarcode);
					/*var getHIBCResult = fnParseHIBCBarcode(vHIBCbarcode);
					nlapiLogExecution('ERROR', 'getHIBCResult',getHIBCResult);*/
					var ItemArray = new Array();
					var ExpiryArray = new Array();
					var LotnoArray = new Array();
					var filters = new Array();

					filters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
					filters[1] = new nlobjSearchFilter('custrecord_wmsse_barcode_format_type', null, 'is', 'HIBC');
					//filters[2] = new nlobjSearchFilter('internalid', null, 'is', 'F');
					var columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_wmsse_barcode_input_type');
					columns[1] = new nlobjSearchColumn('custrecord_wmsse_starting_index');
					columns[2] = new nlobjSearchColumn('custrecord_wmsse_ending_index');
					columns[3] = new nlobjSearchColumn('custrecord_wmsse_date_format');

					var searchresults = nlapiSearchRecord('customrecord_wmsse_barcode_parsing', null, filters, columns);	
					nlapiLogExecution('ERROR', 'searchresults',searchresults);
					if(searchresults != null && searchresults != '' && searchresults != 'null')
					{
						nlapiLogExecution('ERROR', 'searchresults.length',searchresults.length);
						for(var i=0 ; i < searchresults.length ; i++)
						{
							var InputType = searchresults[i].getText('custrecord_wmsse_barcode_input_type');
							nlapiLogExecution('ERROR', 'InputType',InputType);
							if(InputType != null && InputType != '' && InputType != 'null' && InputType == 'Item UPC Code')
							{
								ItemArray.push(searchresults[i].getValue('custrecord_wmsse_starting_index'));
								ItemArray.push(searchresults[i].getValue('custrecord_wmsse_ending_index'));								
								POarray["custparam_hibcitem"] =	vHIBCbarcode.substring(ItemArray[0],ItemArray[1]);	

							}
							else if(InputType != null && InputType != '' && InputType != 'null' && InputType == 'Expiry Date')
							{
								ExpiryArray.push(searchresults[i].getValue('custrecord_wmsse_starting_index'));
								ExpiryArray.push(searchresults[i].getValue('custrecord_wmsse_ending_index'));		
								ExpiryArray.push(searchresults[i].getText('custrecord_wmsse_date_format'));

							}
							else
								if(InputType != null && InputType != '' && InputType != 'null' && InputType == 'LotNo')
								{
									nlapiLogExecution('ERROR', 'Loted:i',InputType +i);
									LotnoArray.push(searchresults[i].getValue('custrecord_wmsse_starting_index'));
									LotnoArray.push(searchresults[i].getValue('custrecord_wmsse_ending_index'));								
									POarray["custparam_hibclot"] = vHIBCbarcode.substring(LotnoArray[0],LotnoArray[1]);								
								}

							if(InputType == 'Expiry Date')
							{
								var vyear = '';
								var vmonth = '';
								var vday = '';
								var DateDetails = '';
								var ExpiryDate = new Array();

								var expDate = vHIBCbarcode.substring(ExpiryArray[0],ExpiryArray[1]);
								/*vmonth = expDate.substring(2,4);
								vday = expDate.substring(4);
								vyear = expDate.substring(0, 2);*/
								var now = new Date();
								var yearPrefix = now.getFullYear().toString();
								nlapiLogExecution('ERROR', 'yearPrefix',yearPrefix);
								nlapiLogExecution('ERROR', 'expDate',expDate);
								yearPrefix = yearPrefix.substring(0, 2);

								/*vyear = yearPrefix + vyear;
								nlapiLogExecution('ERROR', 'vyear',vyear);*/
								
								var Dateformat = ExpiryArray[2];
								if(Dateformat != null && Dateformat != '' && Dateformat.length == expDate.length)
								{
									if(Dateformat == 'MMDDYY')
									{
										vmonth = expDate.substring(0,2);
										vday = expDate.substring(2,4);
										vyear = expDate.substring(4,6);
									}
									else if(Dateformat == 'DDMMYY')
									{
										vday = expDate.substring(0,2);
										vmonth = expDate.substring(2,4);
										vyear = expDate.substring(4,6);
									}
									else if(Dateformat == 'YYDDMM')
									{
										vyear = expDate.substring(0,2);
										vday = expDate.substring(2,4);
										vmonth = expDate.substring(4,6);
									}
									else if(Dateformat == 'YYMMDD')
									{
										vyear = expDate.substring(0,2);
										vmonth = expDate.substring(2,4);
										vday = expDate.substring(4,6);
									}
									if(Dateformat == '' || Dateformat == 'null' || Dateformat == null)								
										Dateformat = DateSetting();

									vyear = yearPrefix + vyear;
									nlapiLogExecution('ERROR', 'vyear',vyear);
									nlapiLogExecution('ERROR', 'Dateformat:expDate',Dateformat + expDate);

									var expiryDateFormat = DateSetting();
									nlapiLogExecution('ERROR', 'expiryDateFormat',expiryDateFormat);
									nlapiLogExecution('ERROR', 'vmonth',vmonth);
									nlapiLogExecution('ERROR', 'vday',vday);
									nlapiLogExecution('ERROR', 'vyear',vyear);	

									ExpiryDate = setExpiryDate(expiryDateFormat,vmonth,vday,vyear);						

									POarray["custparam_hibcexpirydate"] = ExpiryDate;

								}
								else
								{
									POarray["custparam_error"] = 'Configured indexes of date format length is not matching with barcode date length';
									response.sendRedirect('SUITELET', 'customscript_wmsse_hibc_scan', 'customdeploy_wmsse_hibc_scan', false, POarray);
									return;
								}
							}


						}

					}
					else
					{

					}					

				}
				else if(radioButtonValue == 'GS1')
				{
					//var getHIBCResult = fnParseHIBC(vHIBCbarcode);
					/*var getHIBCResult = fnParseHIBCBarcode(vHIBCbarcode);
					nlapiLogExecution('ERROR', 'getHIBCResult',getHIBCResult);*/
					var ItemArray = new Array();
					var ExpiryArray = new Array();
					var LotnoArray = new Array();
					var filters = new Array();

					filters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
					filters[1] = new nlobjSearchFilter('custrecord_wmsse_barcode_format_type', null, 'is', 'GS1');
					//filters[2] = new nlobjSearchFilter('internalid', null, 'is', 'F');
					var columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_wmsse_barcode_input_type');
					columns[1] = new nlobjSearchColumn('custrecord_wmsse_starting_index');
					columns[2] = new nlobjSearchColumn('custrecord_wmsse_ending_index');
					columns[3] = new nlobjSearchColumn('custrecord_wmsse_date_format');

					var searchresults = nlapiSearchRecord('customrecord_wmsse_barcode_parsing', null, filters, columns);	
					nlapiLogExecution('ERROR', 'searchresults',searchresults);
					if(searchresults != null && searchresults != '' && searchresults != 'null')
					{
						nlapiLogExecution('ERROR', 'searchresults.length',searchresults.length);
						for(var i=0 ; i < searchresults.length ; i++)
						{
							var InputType = searchresults[i].getText('custrecord_wmsse_barcode_input_type');
							nlapiLogExecution('ERROR', 'InputType',InputType);
							if(InputType != null && InputType != '' && InputType != 'null' && InputType == 'Item UPC Code')
							{
								ItemArray.push(searchresults[i].getValue('custrecord_wmsse_starting_index'));
								ItemArray.push(searchresults[i].getValue('custrecord_wmsse_ending_index'));								
								POarray["custparam_hibcitem"] =	vHIBCbarcode.substring(ItemArray[0],ItemArray[1]);	

							}
							else if(InputType != null && InputType != '' && InputType != 'null' && InputType == 'Expiry Date')
							{
								ExpiryArray.push(searchresults[i].getValue('custrecord_wmsse_starting_index'));
								ExpiryArray.push(searchresults[i].getValue('custrecord_wmsse_ending_index'));		
								ExpiryArray.push(searchresults[i].getText('custrecord_wmsse_date_format'));

							}
							else
								if(InputType != null && InputType != '' && InputType != 'null' && InputType == 'LotNo')
								{
									nlapiLogExecution('ERROR', 'Loted:i',InputType +i);
									LotnoArray.push(searchresults[i].getValue('custrecord_wmsse_starting_index'));
									LotnoArray.push(searchresults[i].getValue('custrecord_wmsse_ending_index'));

									nlapiLogExecution('ERROR', 'Start INdex:i',searchresults[i].getValue('custrecord_wmsse_starting_index'));
									nlapiLogExecution('ERROR', 'End Index:i',searchresults[i].getValue('custrecord_wmsse_ending_index'));

									nlapiLogExecution('ERROR', 'sTART Index:i',LotnoArray[0]);
									nlapiLogExecution('ERROR', 'End Index:i',LotnoArray[1]);

									POarray["custparam_hibclot"] = vHIBCbarcode.substring(LotnoArray[0],LotnoArray[1]);

								}

							if(InputType == 'Expiry Date')
							{
								var vyear = '';
								var vmonth = '';
								var vday = '';
								var DateDetails = '';
								var ExpiryDate = new Array();

								var expDate = vHIBCbarcode.substring(ExpiryArray[0],ExpiryArray[1]);
								/*vmonth = expDate.substring(2,4);
								vday = expDate.substring(4);
								vyear = expDate.substring(0, 2);*/
								var now = new Date();
								var yearPrefix = now.getFullYear().toString();
								nlapiLogExecution('ERROR', 'yearPrefix',yearPrefix);
								nlapiLogExecution('ERROR', 'expDate',expDate);
								yearPrefix = yearPrefix.substring(0, 2);

								/*vyear = yearPrefix + vyear;
								nlapiLogExecution('ERROR', 'vyear',vyear);*/
								nlapiLogExecution('ERROR', 'ExpiryArray',ExpiryArray);
								var Dateformat = ExpiryArray[2];
								nlapiLogExecution('ERROR', 'Dateformat',Dateformat);
								if(Dateformat != null && Dateformat != '' && Dateformat.length == expDate.length)
								{
									if(Dateformat == 'MMDDYY')
									{
										vmonth = expDate.substring(0,2);
										vday = expDate.substring(2,4);
										vyear = expDate.substring(4,6);
									}
									else if(Dateformat == 'DDMMYY')
									{
										vday = expDate.substring(0,2);
										vmonth = expDate.substring(2,4);
										vyear = expDate.substring(4,6);
									}
									else if(Dateformat == 'YYDDMM')
									{
										vyear = expDate.substring(0,2);
										vday = expDate.substring(2,4);
										vmonth = expDate.substring(4,6);
									}
									else if(Dateformat == 'YYMMDD')
									{
										vyear = expDate.substring(0,2);
										vmonth = expDate.substring(2,4);
										vday = expDate.substring(4,6);
									}
									if(Dateformat == '' || Dateformat == 'null' || Dateformat == null)								
										Dateformat = DateSetting();

									vyear = yearPrefix + vyear;
									nlapiLogExecution('ERROR', 'vyear',vyear);
									nlapiLogExecution('ERROR', 'Dateformat:expDate',Dateformat + expDate);

									var expiryDateFormat = DateSetting();
									nlapiLogExecution('ERROR', 'expiryDateFormat',expiryDateFormat);

									ExpiryDate = setExpiryDate(expiryDateFormat,vmonth,vday,vyear);						

									POarray["custparam_hibcexpirydate"] = ExpiryDate;
								}
								else
								{
									POarray["custparam_error"] = 'Configured indexes of date format length is not matching with barcode date length';
									response.sendRedirect('SUITELET', 'customscript_wmsse_hibc_scan', 'customdeploy_wmsse_hibc_scan', false, POarray);
									return;
								}
							}

						}

					}
					else
					{

					}					

				}
				else
				{
					POarray["custparam_error"] = 'Please enter/scan valid hibc/gs1 barcode';
					response.sendRedirect('SUITELET', 'customscript_wmsse_hibc_scan', 'customdeploy_wmsse_hibc_scan', false, POarray);
					return;
				}
				POarray["custparam_error"] = '';
				nlapiLogExecution('ERROR', 'POarray["custparam_hibcitem"]',POarray["custparam_hibcitem"]);
				nlapiLogExecution('ERROR', 'POarray["custparam_hibcexpirydate"]',POarray["custparam_hibcexpirydate"]);
				nlapiLogExecution('ERROR', 'POarray["custparam_hibclot"]',POarray["custparam_hibclot"]);
				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
				return;
			}
			catch(e)
			{
				nlapiLogExecution('ERROR', 'catch expection',e);
				POarray["custparam_error"] = 'Please enter/scan valid hibc/gs1 barcode';
				response.sendRedirect('SUITELET', 'customscript_wmsse_hibc_scan', 'customdeploy_wmsse_hibc_scan', false, POarray);
				return;
			}


		}
		else
		{
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_poscan', 'customdeploy_wmsse_poscan', false, POarray);
			return;
		}


	}
}

/*function getExpiryDate(dateformat,expDate)
{
	nlapiLogExecution('ERROR', 'expDate12',expDate);
	nlapiLogExecution('ERROR', 'Dateformat12',dateformat);
	var DateDetails = new Array();	
	var vyear = '';
	var vmonth = '';
	var vday = '';
	if(dateformat == 'MM/DD/YYYY')
	{	
		vmonth = expDate.substring(0,2);
		vday = expDate.substring(2,4);
		vyear = expDate.substring(4,6);
		nlapiLogExecution('ERROR', 'vmonth',vmonth);
		nlapiLogExecution('ERROR', 'vday',vday);
		nlapiLogExecution('ERROR', 'vyear',vyear);
	}
	
	if(dateformat == 'DD/MM/YYYY')
	{		
		vmonth = expDate.substring(2,4);
		vday = expDate.substring(0,2);
		vyear = expDate.substring(4,6);	
		nlapiLogExecution('ERROR', 'vmonth',vmonth);
		nlapiLogExecution('ERROR', 'vday',vday);
		nlapiLogExecution('ERROR', 'vyear',vyear);
	}
	
	if(dateformat == 'DD-Mon-YYYY')
	{
		vmonth = expDate.substring(3,6);
		vday = expDate.substring(0,2);
		vyear = expDate.substring(7);	
		nlapiLogExecution('ERROR', 'vmonth',vmonth);
		nlapiLogExecution('ERROR', 'vday',vday);
		nlapiLogExecution('ERROR', 'vyear',vyear);		
	}
	
	if(dateformat == 'DD.MM.YYYY')
	{	
		vmonth = expDate.substring(2,4);
		vday = expDate.substring(0,2);
		vyear = expDate.substring(4,6);		
		nlapiLogExecution('ERROR', 'vmonth',vmonth);
		nlapiLogExecution('ERROR', 'vday',vday);
		nlapiLogExecution('ERROR', 'vyear',vyear);		
	}
	
	if(dateformat == 'DD-MONTH-YYYY')
	{	
		vmonth = expDate.substring(2,4);
		vday = expDate.substring(0,2);
		vyear = expDate.substring(4,6);	
		nlapiLogExecution('ERROR', 'vmonth',vmonth);
		nlapiLogExecution('ERROR', 'vday',vday);
		nlapiLogExecution('ERROR', 'vyear',vyear);
		DateDetails = expDate.split('-');
		vday = newexpdate[0];
		vmonth = newexpdate[1];	
		vyear = newexpdate[2];
	}
	
	if(dateformat == 'DD MONTH, YYYY')
	{	var str = expDate.split(',')
		var str1 = str[0];	
		var str2 = str[1];
	
		vmonth = str1.substring(3);
		vday = str1.substring(0,2);
		vyear = str2.substring(1);	
		nlapiLogExecution('ERROR', 'vmonth',vmonth);
		nlapiLogExecution('ERROR', 'vday',vday);
		nlapiLogExecution('ERROR', 'vyear',vyear);		
	}
	
	if(dateformat == 'YYYY/MM/DD' || dateformat == 'YYYY-MM-DD')
	{		
		vmonth = expDate.substring(5,8);
		vday = expDate.substring(8,11);
		vyear = expDate.substring(0,4);	
		nlapiLogExecution('ERROR', 'vmonth',vmonth);
		nlapiLogExecution('ERROR', 'vday',vday);
		nlapiLogExecution('ERROR', 'vyear',vyear);		
	}
	
	if(Dateformat == 'YYYY-MM-DD')
	{								
		DateDetails.push(expDate.substring(0,2));
		DateDetails.push(expDate.substring(3,6));	
		DateDetails.push(expDate.substring(7,11));
	}
	DateDetails.push(vday);
	DateDetails.push(vmonth);		
	DateDetails.push(vyear);
	
	return DateDetails;
	
}*/

function setExpiryDate(expiryDateFormat,vmonth,vday,vyear)
{
	var expDate = '';
	
	if(expiryDateFormat == 'MM/DD/YYYY')
	{	
		if(vmonth.length == 3)
		{						
			var months = {'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05',
					'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11',
					'DEC': '12'};
			vmonth = months[vmonth];
		}
		else if(vmonth.length > 4)
		{
			var months = {'JANUARY': 'Jan', 'FEBRUARY': 'Feb', 'MARCH': 'Mar', 'APRIL': 'Apr', 'MAY': 'May',
					'JUNE': 'Jun', 'JULY': 'Jul', 'AUGUST': 'Aug', 'SEPTEMBER': 'Sep', 'OCTOBER': 'Oct', 'NOVEMBER': 'Nov',
					'DECEMBER': 'Dec'};
			vmonth = months[vmonth];
		}
		
		expDate = vmonth +"/"+ vday +"/"+ vyear;
	}
	
	if(expiryDateFormat == 'DD/MM/YYYY')
	{				
		if(vmonth.length == 3)
		{						
			var months = {'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05',
					'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11',
					'DEC': '12'};
			vmonth = months[vmonth];
		}
		else if(vmonth.length > 4)
		{
			var months = {'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04', 'MAY': '05',
					'JUNE': '06', 'JULY': '07', 'AUGUST': '08', 'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11',
					'DECEMBER': '12'};
			vmonth = months[vmonth];
		}
		
		expDate = vday +"/"+ vmonth +"/"+ vyear;
	}
	
	if(expiryDateFormat == 'DD-Mon-YYYY')
	{
		nlapiLogExecution('ERROR', 'vmonth',vmonth.length);
		if(vmonth.length == 2 )
		{
			var months = {'01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May',
					'06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov',
					'12': 'Dec'};
			vmonth = months[vmonth];
		}
		else if(vmonth.length > 4)
		{
			var months = {'JANUARY': 'Jan', 'FEBRUARY': 'Feb', 'MARCH': 'Mar', 'APRIL': 'Apr', 'MAY': 'May',
					'JUNE': 'Jun', 'JULY': 'Jul', 'AUGUST': 'Aug', 'SEPTEMBER': 'Sep', 'OCTOBER': 'Oct', 'NOVEMBER': 'Nov',
					'DECEMBER': 'Dec'};	
			vmonth = months[vmonth];
		}
		
		expDate = vday +"-"+ vmonth +"-"+ vyear;
	}
	
	if(expiryDateFormat == 'DD.MM.YYYY')
	{	
		if(vmonth.length == 3)
		{						
			var months = {'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05',
					'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11',
					'DEC': '12'};
			vmonth = months[vmonth];
		}
		else if(vmonth.length > 4)
		{
			var months = {'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04', 'MAY': '05',
					'JUNE': '06', 'JULY': '07', 'AUGUST': '08', 'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11',
					'DECEMBER': '12'};
			vmonth = months[vmonth];
		}
		
		expDate = vday +"."+ vmonth +"."+ vyear;
	}
	
	if(expiryDateFormat == 'DD-MONTH-YYYY')
	{	
		nlapiLogExecution('ERROR', 'vmonth.length',vmonth.length);
		if(vmonth.length == 3)
		{			
			months = {'Jan': 'JANUARY', 'Feb': 'FEBRUARY', 'Mar': 'MARCH', 'Apr': 'APRIL', 'May': 'MAY',
					'Jun': 'JUNE', 'Jul': 'JULY', 'Aug': 'AUGUST', 'Sep': 'SEPTEMBER', 'Oct': 'OCTOBER', 'Nov': 'NOVEMBER',
					'Dec': 'DECEMBER'};
			vmonth = months[vmonth];
		}
		else
		{
			months = {'01': 'JANUARY', '02': 'FEBRUARY', '03': 'MARCH', '04': 'APRIL', '05': 'MAY',
					'06': 'JUNE', '07': 'JULY', '08': 'AUGUST', '09': 'SEPTEMBER', '10': 'OCTOBER', '11': 'NOVEMBER',
					'12': 'DECEMBER'};
			vmonth = months[vmonth];
		}
		expDate = vday +"-"+ vmonth +"-"+ vyear;
	}

	if(expiryDateFormat == 'DD MONTH, YYYY')
	{		
		if(vmonth.length == 3)
		{			
			months = {'Jan': 'JANUARY', 'Feb': 'FEBRUARY', 'Mar': 'MARCH', 'Apr': 'APRIL', 'May': 'MAY',
					'Jun': 'JUNE', 'Jul': 'JULY', 'Aug': 'AUGUST', 'Sep': 'SEPTEMBER', 'Oct': 'OCTOBER', 'Nov': 'NOVEMBER',
					'Dec': 'DECEMBER'};
			vmonth = months[vmonth];
		}
		else
		{
			months = {'01': 'JANUARY', '02': 'FEBRUARY', '03': 'MARCH', '04': 'APRIL', '05': 'MAY',
					'06': 'JUNE', '07': 'JULY', '08': 'AUGUST', '09': 'SEPTEMBER', '10': 'OCTOBER', '11': 'NOVEMBER',
					'12': 'DECEMBER'};
			vmonth = months[vmonth];
		}
		expDate = vday +" "+ vmonth +", "+ vyear;
	}

	if(expiryDateFormat == 'YYYY/MM/DD')
	{		
		if(vmonth.length == 3)
		{						
			var months = {'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05',
					'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11',
					'DEC': '12'};
			vmonth = months[vmonth];
		}
		else if(vmonth.length > 4)
		{
			var months = {'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04', 'MAY': '05',
					'JUNE': '06', 'JULY': '07', 'AUGUST': '08', 'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11',
					'DECEMBER': '12'};
			vmonth = months[vmonth];
		}
		
		expDate = vyear +"/" + vmonth +"/"+ vday;
	}
	
	if(expiryDateFormat == 'YYYY-MM-DD')
	{		
		if(vmonth.length == 3)
		{						
			var months = {'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05',
					'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11',
					'DEC': '12'};
			vmonth = months[vmonth];
		}
		else if(vmonth.length > 4)
		{
			var months = {'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04', 'MAY': '05',
					'JUNE': '06', 'JULY': '07', 'AUGUST': '08', 'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11',
					'DECEMBER': '12'};
			vmonth = months[vmonth];
		}
		
		expDate = vyear +"-" + vmonth +"-"+ vday;
	}
	
return expDate;
}
