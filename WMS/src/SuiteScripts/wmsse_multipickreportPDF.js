/**
 * Script Description
 * This script print the pick report with suggested bin locations for selected pick report number.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

/**
 * This is the main function to print the PICK LIST against the given Pick Report Number  
 */
function fnPickReportPDF(request, response){
	if (request.getMethod() == 'GET') {

		var form = nlapiCreateForm('Pick Report');
		var vPickGen=request.getParameter('custparam_pickreportno');
		nlapiLogExecution('ERROR', 'vPickGen',vPickGen);

		if(vPickGen!=null&&vPickGen!=''&&vPickGen!='null'&&vPickGen!='undefined')
		{

			var replaceChar =/\$|,|@|&|#|~|`|\%|\*|\^|\&|\+|\=|\-|\_|\[|\}|\{|\;|\'|\"|\<|\>|\?|\||\\|\!|\$|\./g;
				var sysdate=DateStamp();
			var systime=TimeStamp();
			//var Timez=calcTime('-5.00');
			var Timez=sysdate +" "+ systime;

			var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdf>\n<head><macrolist><macro id='myfooter'><p align='center'>Page <pagenumber/> of <totalpages/></p></macro></macrolist></head><body  font-size=\"7\"  size=\"A4-landscape\"    padding-top=\" 0mm\"   footer='myfooter' footer-height='20mm'>\n";
			var strxml="";
			var filefound='';
			filefound = getLoadFile('LOGOCOMP.jpg');
			if (filefound) 
			{ 
				nlapiLogExecution('ERROR', 'Event', 'file;'+filefound.getId()); 
				var imageurl = filefound.getURL();
				nlapiLogExecution('ERROR','imageurl',imageurl);
				//var finalimageurl = url + imageurl;//+';';
				var finalimageurl = imageurl;//+';';
				//finalimageurl=finalimageurl+ '&expurl=T;';
				nlapiLogExecution('ERROR','imageurl',finalimageurl);
				finalimageurl=finalimageurl.replace(/&/g,"&amp;");

			} 
			else 
			{
				nlapiLogExecution('ERROR', 'Event', 'No file;');
			}

			strxml += "<table width='100%' >";
			strxml += "<tr ><td valign='middle' align='left'><img src='" + finalimageurl + "'></img></td><td valign='middle' align='left'  style='font-size:xx-large;'>";
			strxml += "Multi-Order Pick Report ";
			strxml += "</td><td align='right'>&nbsp;</td></tr></table>";
			strxml += "<p align='right'>Date/Time:"+Timez+"</p>";
			strxml +="<table style='width:100%;'>";
			strxml +="<tr><td valign='top'>";
			strxml +="<table align='left'>";
			strxml +="<tr><td align='left' valign='middle' >Pick Report # </td>";
			//strxml +="<tr>";
			strxml +="<td align='left'>";
			if(vPickGen != null && vPickGen != "")
			{
				strxml += " <barcode codetype=\"code128\" showtext=\"true\" value=\"";
				strxml += vPickGen;
				strxml += "\"/>";
			}
			strxml += "</td></tr>";
			strxml += "</table></td></tr></table>";
			strxml +="<table  width='100%' >";
			strxml +="<tr style=\"font-weight:bold;background-color:gray;color:white;\">";

			//strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
			//strxml += " Order#";
			//strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
			strxml += "<td width='20%' style='border-width: 1px; border-color: #000000'>";
			strxml += "Bin Location";
			strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

			strxml += "<td width='15%' style='border-width: 1px; border-color: #000000;'>";
			strxml += "Item ";
			strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

			strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";			
			strxml += "Item Description";
			strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

			/*strxml += "<td width='7%' style='border-width: 1px; border-color: #000000'>";
			strxml += "Line #";
			strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";*/

			strxml += "<td width='12%' style='border-width: 1px; border-color: #000000'>";			
			strxml += "Order#";
			strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

			strxml += "<td width='5%' style='border-width: 1px; border-color: #000000'>";			
			strxml += "Order# Index</td>";

			strxml += "<td width='7%' style='border-width: 1px; border-color: #000000'>";			
			strxml += "Committed Qty</td>";
			//strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

			strxml += "<td width='4%' style='border-width: 1px; border-color: #000000'>";			
			strxml += "Units  </td>";
			//strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

			strxml += "<td width='6%' style='border-width: 1px; border-color: #000000'>";			
			strxml += "Weight </td> ";
			//strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

			strxml += "<td width='10%' style='border-width: 1px; border-color: #000000'>";			
			strxml += "Customer </td>";
			//strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

			strxml += "<td width='10%' style='border-width: 1px; border-color: #000000'>";			
			strxml += "Ship Via </td>";
			//strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

			strxml =strxml+  "</tr>";
			var distinctSoIds=new Array();			
			var vOpenfilters = new Array();
			var objOpenTaskDetails=new Array();
			var SOLineDetails= nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_getpickreport_details');
			SOLineDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', vPickGen));
			
			var resLenDetails = SOLineDetails.runSearch();					
			
			var resultsPage = resLenDetails.getResults(0, 1000);
			var offset = 0;
			while (!!resultsPage && resultsPage.length > 0) 
			{
				objOpenTaskDetails = objOpenTaskDetails.concat(resultsPage);
				offset += 1000;
				resultsPage = resLenDetails.getResults(offset, offset + 1000);
			}
			
			if(objOpenTaskDetails != null && objOpenTaskDetails != '')
			{	

				if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
				{

					for(var j=0;j<objOpenTaskDetails.length;j++)
					{


						nlapiLogExecution('ERROR', 'objOpenTaskDetails[j]', objOpenTaskDetails[j]);

						var vBinDetails = objOpenTaskDetails[j].getValue('custrecord_wmsse_multi_bins');
						var vnSku = objOpenTaskDetails[j].getText('custrecord_wmsse_sku');
						var vnSkuDesc = objOpenTaskDetails[j].getValue('custrecord_wmsse_skudesc');
						var vnOrder = objOpenTaskDetails[j].getValue('name');
						var vnCommQty = objOpenTaskDetails[j].getValue('custrecord_wmsse_expe_qty');
						var vnCustomer = objOpenTaskDetails[j].getText('custrecord_wmsse_customer');
						var vnShipVia = objOpenTaskDetails[j].getText('custrecord_wmsse_shipmethod');
						var vnUnits = objOpenTaskDetails[j].getValue('custrecord_wmsse_uom');
						var vConversionRate = objOpenTaskDetails[j].getValue('custrecord_wmsse_conversionrate');
						var vItemWeight = objOpenTaskDetails[j].getValue('weight','custrecord_wmsse_sku');
						var vItemWeightUnit = objOpenTaskDetails[j].getText('weightunit','custrecord_wmsse_sku');
						var vTotalItemWeight = objOpenTaskDetails[j].getValue('formulanumeric');
						var vOrderIndex = objOpenTaskDetails[j].getValue('custrecord_wmsse_orderindex');
						var vOrderInternalId= objOpenTaskDetails[j].getValue('custrecord_wmsse_order_no');
						if(distinctSoIds.indexOf(vOrderInternalId) == -1)
							distinctSoIds.push(vOrderInternalId);
						if(vnUnits == null || vnUnits == '' || vnUnits == '- None -')
							vnUnits = "";

						if(vTotalItemWeight == null || vTotalItemWeight == '' || vTotalItemWeight == '- None -' || vTotalItemWeight == 0)
							vTotalItemWeight = "";
						nlapiLogExecution('ERROR', 'vTotalItemWeight', vTotalItemWeight);
						strxml =strxml+  "<tr>";
						strxml += "<td width='22%'   style='border-width: 1px; border-color: #000000; text-align:left'>";

						if(vBinDetails != null && vBinDetails != '')
						{
							vBinDetails=vBinDetails.toString().replace(/\$/g,"<br/>");

							//vBinDetails=vBinDetails.toString().replace(/\^/g,"<b>");
							//vBinDetails=vBinDetails.toString().replace(/\#/g,"</b>");
							vBinDetails=vBinDetails.toString().replace(/\&/g,"&amp;");
							strxml += vBinDetails.toString();
						}
						strxml += "</td>";
						strxml += "<td width='16%' style='border-width: 1px; border-color: #000000;'>";
						if(vnSku != null && vnSku != '')
						{
							//vnSku=vnSku.replace(replaceChar,'');	
							vnSku=vnSku.replace(/\&/g,"&amp;");
							vnSku=vnSku.replace(/\"/g,"&quot;");
							vnSku=vnSku.replace(/\'/g,"&apos;");
							var index = vnSku.lastIndexOf(':');						
							vnSku = vnSku.substring(index+1);
							vnSku = vnSku.trim();
							strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
							strxml += vnSku;	

							nlapiLogExecution('ERROR', 'vnSku', vnSku);
							strxml += "\"/>";
						}
						strxml += "</td>";
						strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
						if(vnSkuDesc != null && vnSkuDesc != "")
							strxml += vnSkuDesc.replace(replaceChar,'');
						strxml += "</td>"; 

						strxml += "<td width='10%' style='border-width: 1px; border-color: #000000'>";	
						strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
						strxml += vnOrder;
						strxml += "\"/>";
						strxml += "</td>"; 

						strxml += "<td width='5%' align='right' style='border-width: 1px; border-color: #000000'>";			
						if(vOrderIndex !=null && vOrderIndex !='')
							strxml += parseInt(vOrderIndex);
						strxml += "</td>";

						strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
						strxml += vnCommQty;
						strxml += "</td>";

						strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
						strxml += vnUnits;
						strxml += "</td>"; 

						if(vItemWeightUnit != null && vItemWeightUnit != '')
						{
							strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
							strxml += vTotalItemWeight + "&nbsp;&nbsp;" + vItemWeightUnit;
							strxml += "</td>";
						}
						else
						{
							strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
							strxml += vTotalItemWeight;
							strxml += "</td>";
						}
					 
						strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
						if(vnCustomer != null && vnCustomer != "")
						{
							//strxml += vnCustomer.replace(replaceChar,'');
							vnCustomer=vnCustomer.replace(/\&/g,"&amp;");
							vnCustomer=vnCustomer.replace(/\"/g,"&quot;");
							vnCustomer=vnCustomer.replace(/\'/g,"&apos;");
							strxml += vnCustomer;
						}
						strxml += "</td>"; 

						strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
						if(vnShipVia != null && vnShipVia != "")
							strxml += vnShipVia.replace(replaceChar,'');
						strxml += "</td>"; 

						strxml =strxml+  "</tr>";
						

						//Need to display vPickLocDetsArr[j];

					}	


					//strxml =strxml+"</table>";
				}
				var filter=new Array();
				if(distinctSoIds !=null && distinctSoIds !='')
					filter.push(new nlobjSearchFilter('internalid',null,'anyof',distinctSoIds));
				filter.push(new nlobjSearchFilter('mainline',null,'is','F'));
				filter.push(new nlobjSearchFilter('taxline',null,'is','F'));
				filter.push(new nlobjSearchFilter('type','item','is','NonInvtPart'));

				var columns=new Array();
				columns.push(new nlobjSearchColumn('shipmethod'));
				columns.push(new nlobjSearchColumn('type','item'));
				columns.push(new nlobjSearchColumn('weight','item'));
				columns.push(new nlobjSearchColumn('description','item'));
				columns.push(new nlobjSearchColumn('salesdescription','item'));
				columns.push(new nlobjSearchColumn('stockdescription','item'));
				columns.push(new nlobjSearchColumn('item'));
				columns.push(new nlobjSearchColumn('line'));
				columns.push(new nlobjSearchColumn('quantity'));
				columns.push(new nlobjSearchColumn('tranid'));
				columns.push(new nlobjSearchColumn('entityid','customer'));

				var nonInvSearchResults=nlapiSearchRecord('salesorder',null,filter,columns);
				if(nonInvSearchResults ==null || nonInvSearchResults =='')
				{
					nonInvSearchResults=nlapiSearchRecord('transferorder',null,filter,columns);
				}
				if(nonInvSearchResults !=null && nonInvSearchResults !='' && nonInvSearchResults.length > 0)
				{
					nlapiLogExecution('ERROR', 'nonInvSearchResults.length', nonInvSearchResults.length);
					for(var zx=0;zx<nonInvSearchResults.length;zx++)
					{

						var vNonSkuText = nonInvSearchResults[zx].getText('item');
						var vNonSkuDesc = nonInvSearchResults[zx].getValue('description','item');
						var vNonSkuLine = nonInvSearchResults[zx].getValue('line');
						var vNonSkuQty = nonInvSearchResults[zx].getValue('quantity');
						var vNonSkuWeight = nonInvSearchResults[zx].getValue('weight','item');
						var vNonSkuShipMethod = nonInvSearchResults[zx].getText('shipmethod');
						var vNonSkuOrd = nonInvSearchResults[zx].getValue('tranid');
						var vNonSkuCustomer = nonInvSearchResults[zx].getValue('entityid','customer');
						if(vNonSkuDesc == null || vNonSkuDesc == '')
							vNonSkuDesc = nonInvSearchResults[zx].getValue('salesdescription','item');
						if(vNonSkuDesc == null || vNonSkuDesc == '')
							vNonSkuDesc = nonInvSearchResults[zx].getValue('stockdescription','item');
						strxml =strxml+  "<tr>";
						strxml += "<td width='22%'   style='border-width: 1px; border-color: #000000; text-align:left'>";

						strxml += "</td>";
						strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
						if(vNonSkuText != null && vNonSkuText != '')
						{
							strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
							strxml += vNonSkuText.replace(replaceChar,'');								
							strxml += "\"/>";
						}
						strxml += "</td>";
						strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
						if(vNonSkuDesc != null && vNonSkuDesc != "")
							strxml += vNonSkuDesc.replace(replaceChar,'');
						strxml += "</td>"; 

						strxml += "<td width='10%' style='border-width: 1px; border-color: #000000'>";	
						strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
						strxml += vNonSkuOrd;
						strxml += "\"/>";
						strxml += "</td>"; 

						strxml += "<td width='5%' align='right' style='border-width: 1px; border-color: #000000'>";			
						strxml += "</td>";

						strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
						strxml += vNonSkuQty;
						strxml += "</td>";

						strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
						//strxml += vnUnits;
						strxml += "</td>"; 

						strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
						strxml += vNonSkuWeight;
						strxml += "</td>";

						strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
						if(vNonSkuCustomer != null && vNonSkuCustomer != "")
							strxml += vNonSkuCustomer.replace(replaceChar,'');
						strxml += "</td>"; 

						strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
						if(vNonSkuShipMethod != null && vNonSkuShipMethod != "")
							strxml += vNonSkuShipMethod.replace(replaceChar,'');
						strxml += "</td>"; 

						strxml =strxml+  "</tr>";

					}
				}
				searchresults=null;
				distinctSoIds=null;
				vBinDetails=null;
				componentItemDetails=null;
				if(objOpenTaskDetails.length == null || objOpenTaskDetails.length =='')
				{
					strxml =strxml+  "<tr>";
					strxml += "<td width='3%' style='border-width: 1px; border-color: #000000'>";			
					strxml += "No records available";
					strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
					strxml =strxml+  "</tr>";
				}
				strxml =strxml+"</table>";
				strxml =strxml+ "</body></pdf>";
				xml=xml +strxml;
				nlapiLogExecution('ERROR', 'xml', xml.toString());
				var file = nlapiXMLToPDF(xml);	
				var pdffilename = vPickGen+'_PickReport.pdf';
				response.setContentType('PDF',pdffilename);
				response.write( file.getValue() );
			}
			else
			{
				response.writePage(form);
			}


			}
			else
			{
				//showInlineMessage(form, 'Error', 'No Data Found');
				response.writePage(form);
			}
	}
	else //this is the POST block
	{

	}
}

/**
 * Remove duplicates from an array
 * @param arrayName
 * @returns {Array}
 */
function removeDuplicateElement(arr){
	var dups = {}; 
	return arr.filter(
			function(el) { 
				var hash = el.valueOf(); 
				var isDup = dups[hash]; 
				dups[hash] = true; 
				return !isDup; 
			}
	); 
}
/**
 * This function is used to get the Local Time
 */
function calcTime(offset) {

	//var vtime=new Date();

	//nlapiLogExecution('ERROR', 'TimeOffset', vtime.getTimezoneOffset());

	// create Date object for current location
	var nd = convertDate();

	// convert to msec
	// add local time zone offset 
	// get UTC time in msec
	//utc = d.getTime() + (d.getTimezoneOffset() * 60000);

	// create new Date object for different city
	// using supplied offset
	//nd = new Date(utc + (3600000*offset));

	// return time as a string
	//return "The local time in " + city + " is " + nd.toLocaleString();

	var stringDt=((parseFloat(nd.getMonth()) + 1) + '/' + (parseFloat(nd.getDate())) + '/' + nd.getFullYear());

	var timestamp;
	var a_p = "";

	//Getting time in hh:mm tt format.
	var curr_hour = nd.getHours();
	var curr_min = nd.getMinutes();

	// determining the am/pm indicator
	if (curr_hour < 12)
		a_p = "am";
	else
		a_p = "pm";

	// finalizing hours depending on 24hr clock
	if (curr_hour == 0)
		curr_hour = 12;
	else if(curr_hour > 12)
		curr_hour -= 12;

	if (curr_min.length == 1)
		curr_min = "0" + curr_min;

	//Adding fields to update time zones.
	timestamp = curr_hour + ":" + curr_min + " " + a_p;

	return stringDt + " " + timestamp;


}

function getTimeStamp(){
	var timestamp='';
	var now = convertDate();

	//Getting time in hh:mm tt format.
	var curr_hour = now.getHours();
	var curr_min = now.getMinutes();
	var curr_sec = now.getSeconds();
	var curr_day = now.getDate();
	var curr_month = (now.getMonth()) + 1;
	var curr_year = now.getFullYear();
	if (curr_min.length == 1)
		curr_min = "0" + curr_min;

	timestamp = curr_day + "" + curr_month + "" + curr_year + "" + curr_hour + "" + curr_min + "" + curr_sec;

	return timestamp;
}

