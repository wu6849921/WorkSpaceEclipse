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
		var vPickGenList=request.getParameter('custparam_pickreportno');
		var vOrderlist=request.getParameter('custparam_orderno');

		nlapiLogExecution('ERROR', 'vPickGenList',vPickGenList);
		var vPickGenArray = new Array();
		vPickGenArray = vPickGenList.split(',');
		var soNumArray=vOrderlist.split(',');
		nlapiLogExecution('ERROR', 'vPickGenArray',vPickGenArray);
		nlapiLogExecution('ERROR', 'soNumArray',soNumArray);
		var vPickGen = '';
		var pageno = 0;
		var tranArray = new Array();
		var vType = 'SalesOrd';

		if(vPickGenArray != null && vPickGenArray != '' && soNumArray!=null && soNumArray!='' )
		{
			var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdf>\n<head><macrolist><macro id='myfooter'><p align='center'>Page <pagenumber/> of <totalpages/></p></macro></macrolist></head><body  font-size=\"7\"  size=\"A4-landscape\"    padding-top=\" 0mm\"   footer='myfooter' footer-height='20mm'>\n";
			for(var w=0;w<soNumArray.length;w++)
			{
				var replaceChar =/\$|,|@|&|#|~|`|\%|\*|\^|\&|\+|\=|\-|\_|\[|\}|\{|\;|\'|\"|\<|\>|\?|\||\\|\!|\$|\./g;
					var sysdate=DateStamp();
				var systime=TimeStamp();
				//var Timez=calcTime('-5.00');
				var Timez=sysdate +" "+ systime;
				tranArray = getSODetails(soNumArray[w]);
				nlapiLogExecution('ERROR', 'tranArray',tranArray);
				vType = tranArray[1];
				var trantype = '';

				if(vType=='SalesOrd')
					trantype = 'salesorder';
				else if(vType=='TrnfrOrd')
					trantype = 'transferorder';

				var tranId = tranArray[0];
				var salesorder = nlapiLoadRecord(trantype, tranId);
				var	address = salesorder.getFieldValue('shipaddressee');
				nlapiLogExecution('ERROR', 'salesorder',salesorder);
				nlapiLogExecution('ERROR', 'address',address);
				var ismultilineship=salesorder.getFieldValue('ismultishipto');
				var vlineno=salesorder.getLineItemValue('item','line',1);


				var shiptovalue=salesorder.getLineItemValue('item','shipaddress',vlineno);
				var shiptotext=salesorder.getLineItemText('item','shipaddress',vlineno);
				nlapiLogExecution('ERROR', 'ismultilineship',ismultilineship);
				nlapiLogExecution('ERROR', 'shiptovalue',shiptovalue);
				nlapiLogExecution('ERROR', 'shiptotext',shiptotext);
				var customerrecord=salesorder.getFieldValue('entity');


				var locationinternalid=salesorder.getFieldValue('location');

				var LogoValue;
				var LogoText;
				if(locationinternalid != null && locationinternalid != ""){
					var companylist = nlapiLoadRecord('location', locationinternalid);
					LogoValue=companylist.getFieldValue('logo');
					LogoText=companylist.getFieldText('logo');
				}
				nlapiLogExecution('ERROR','logo value',LogoValue);
				nlapiLogExecution('ERROR','logo text ',LogoText);
				var filefound='';
				//var filefound = getLoadFile('LOGOCOMP.jpg'); 
				if(LogoText !=null && LogoText !='')
					filefound = getLoadFile(''+LogoText+''); 
				else
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


				nlapiLogExecution('ERROR', 'customerrecord',customerrecord);
				var entityrecord ;
				if(customerrecord != "" && customerrecord != null)
				{
					entityrecord = nlapiLoadRecord('customer', customerrecord);
				}


				if(address != null && address !="")
					address=address.replace(replaceChar,'');
				else
					address="";

				var	HNo = salesorder.getFieldValue('shipaddr1');
				if(HNo != null && HNo !="")
					HNo=HNo.replace(replaceChar,'');
				else
					HNo="";
				var	addr2 = salesorder.getFieldValue('shipaddr2');
				if(addr2 != null && addr2 !="")
					addr2=addr2.replace(replaceChar,'');
				else
					addr2="";
				nlapiLogExecution('ERROR','addr2',addr2);
				var	city = salesorder.getFieldValue('shipcity');
				if(city != null && city !="")
					city=city.replace(replaceChar,'');
				else
					city="";
				var	state = salesorder.getFieldValue('shipstate');
				if(state != null && state !="")
					state=state.replace(replaceChar,'');
				else
					state="";
				var	country = salesorder.getFieldValue('shipcountry');
				if(country != null && country !="")
					country=country.replace(replaceChar,'');
				else
					country="";
				var	zipcode = salesorder.getFieldValue('shipzip');
				if(zipcode == null || zipcode =="" || zipcode =='null')
					zipcode = '';
				var	carrier = salesorder.getFieldText('shipmethod');
				if(carrier != null && carrier !="")
					carrier=carrier.replace(replaceChar,'');
				var SalesorderNo= salesorder.getFieldValue('tranid');


				if(ismultilineship=='T')
				{
					if(entityrecord!=null && entityrecord!='')
					{
						var custlineitemcount=entityrecord.getLineItemCount('addressbook');
						for(var customerline=1;customerline<=custlineitemcount;customerline++)
						{	
							var custline=parseInt(customerline).toString();
							var customerlabelid = entityrecord.getLineItemValue('addressbook','internalid',custline);
							if(customerlabelid==shiptovalue)
							{
								nlapiLogExecution('ERROR', 'test','test1');
								address = entityrecord.getLineItemValue('addressbook','addressee',custline);
								if(address != null && address !="")
									address=address.replace(replaceChar,'');
								else
									address="";
								HNo= entityrecord.getLineItemValue('addressbook','addr1',custline);
								if(HNo != null && HNo !="")
									HNo=HNo.replace(replaceChar,'');
								else
									HNo="";
								addr2 = entityrecord.getLineItemValue('addressbook','addr2',custline);
								if(addr2 != null && addr2 !="")
									addr2=addr2.replace(replaceChar,'');
								else
									addr2="";

								city = entityrecord.getLineItemValue('addressbook','city',custline);
								if(city != null && city !="")
									city=city.replace(replaceChar,'');
								else
									city="";
								state = entityrecord.getLineItemValue('addressbook','dropdownstate',custline);
								if(state != null && state !="")
									state=state.replace(replaceChar,'');
								else
									state="";
								zipcode = entityrecord.getLineItemValue('addressbook','zip',custline);
								if(zipcode != null && zipcode !="" && zipcode!='null')
									zipcode=zipcode.replace(replaceChar,'');

								if(zipcode == null || zipcode =="" || zipcode =='null')
									zipcode = '';

								country=entityrecord.getLineItemValue('addressbook','country',custline);
								if(country != null && country !="")
									country=country.replace(replaceChar,'');
								else
									country="";
							}
						}
					}
				}

				nlapiLogExecution('ERROR','address,HNo,city,state,country',address+","+HNo+","+city+","+state+","+country);




				if(pageno==0)
				{	
					var strxml = "<table width='100%' >";
					pageno=parseFloat(pageno+1);
				}
				else
				{
					var strxml=strxml+"";
					strxml += "<table width='100%' >";
				}

				//var strxml = "<table width='100%' >";
				var vOpenTaskfilters = new Array();
				if(soNumArray[w] != null && soNumArray[w] != '')
					vOpenTaskfilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null, 'anyof', tranId));

				var vnobjOpenTaskDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_headlevel_pickrptdets',vOpenTaskfilters, null);
				var vTotalOrderWeight = 0;
				var vEDIFlag = "F";
				if(vnobjOpenTaskDetails !=null && vnobjOpenTaskDetails !='' && vnobjOpenTaskDetails.length > 0)
				{
					vEDIFlag = vnobjOpenTaskDetails[0].getValue('custentity_wmsse_asn_required','custrecord_wmsse_customer','group');
					for(var obj=0;obj<vnobjOpenTaskDetails.length;obj++)
					{
						var vOrderLineWt=vnobjOpenTaskDetails[obj].getValue('formulanumeric',null,'sum');
						if(vOrderLineWt == null || vOrderLineWt == '' || vOrderLineWt =='null' || vOrderLineWt =='undefined' || vOrderLineWt =='- None -')
							vOrderLineWt =0;
						vTotalOrderWeight = parseFloat(vTotalOrderWeight) + parseFloat(vOrderLineWt);
					}
				}
				if(vTotalOrderWeight ==null || vTotalOrderWeight =='' || vTotalOrderWeight =='- None -')
					vTotalOrderWeight ="";
				nlapiLogExecution('ERROR','vTotalOrderWeight,vEDIFlag',vTotalOrderWeight+","+vEDIFlag);
				strxml += "<tr ><td valign='middle' align='left'><img src='" + finalimageurl + "'></img></td><td valign='middle' align='left'  style='font-size:xx-large;'>";
				strxml += "Pick Report ";
				strxml += "</td><td align='right'>&nbsp;</td></tr></table>";
				strxml += "<p align='right'>Date/Time:"+Timez+"</p>";
				strxml +="<table style='width:100%;'>";

				var vOpenfilters = new Array();
				var objOpenTaskDetails=new Array();
				var SOLineDetails= nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_getpickreport_details');
				if(soNumArray[w] != null && soNumArray[w] != '')
					SOLineDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no',null, 'anyof', tranId));
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
						var vnOrderName = objOpenTaskDetails[0].getValue('name');
						var vPickGen = objOpenTaskDetails[0].getValue('custrecord_wmsse_pickreport_no');

						strxml +="<tr><td valign='top'>";
						strxml +="<table align='left' style='width:70%;'>";

						strxml +="<tr><td align='left' style='width:51px'>Order # ";

						strxml +="&nbsp;&nbsp;";
						if(vnOrderName != null && vnOrderName != "")
						{
							strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
							strxml += vnOrderName;
							strxml += "\"/>";
						}
						strxml += "</td>";
						strxml +="<td align='left'>Pick Report # ";

						strxml +="&nbsp;&nbsp;";
						if(vPickGen != null && vPickGen != "")
						{
							strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
							strxml += vPickGen;
							strxml += "\"/>";
						}
						strxml += "</td></tr>";

						strxml +="<tr><td align='left' style='width:51px'>Total Order Weight: ";

						strxml +="&nbsp;&nbsp;";
						if(vTotalOrderWeight != null && vTotalOrderWeight != "")
						{					
							strxml += vTotalOrderWeight;
						}
						strxml += "</td>";
						strxml +="<td align='left'>EDI: ";

						strxml +="&nbsp;&nbsp;";
						if(vEDIFlag == "T")
						{
							strxml += 'Yes';
						}
						else
						{
							strxml += 'No';
						}
						strxml += "</td></tr>";

						strxml +="</table><table><tr><td>&nbsp;</td></tr></table>	<table align='right' style='width:70%;'>";
						strxml +="<tr align='right'>";
						strxml +="<td colspan='5' align='right'>";
						strxml +="<table align='right' style='width:40%;' border='1'>";
						strxml +="<tr><td align='right'><b>Ship To</b></td></tr>";
						strxml +="<tr><td align='right' style='width:51px'>Address:</td>";
						if(address != null && address !="" && address!='null')
						{
							address=address.replace(/\&/g,"&amp;");
							address=address.replace(/\"/g,"&quot;");
							address=address.replace(/\'/g,"&apos;");							
							strxml +="<td>"+address+"</td>";
						}
						strxml +="</tr>";
						strxml +="<tr><td style='width:51px'>&nbsp;</td>";
						if(HNo != null && HNo !="" && HNo!='null')
						{
							HNo=HNo.replace(/\&/g,"&amp;");
							HNo=HNo.replace(/\"/g,"&quot;");
							HNo=HNo.replace(/\'/g,"&apos;");
							strxml +="<td>"+HNo+"</td>";
						}
						strxml +="</tr>";
						if(addr2 != null && addr2 != '')
						{	
							strxml +="<tr><td style='width:51px'>&nbsp;</td>";
							addr2=addr2.replace(/\&/g,"&amp;");
							addr2=addr2.replace(/\"/g,"&quot;");
							addr2=addr2.replace(/\'/g,"&apos;");
							strxml +="<td>"+addr2+"</td></tr>";
						}
						strxml +="<tr><td align='right' style='width:51px'>City:</td>";
						strxml +="<td>"+city.replace(replaceChar,'')+"</td></tr>";
						strxml +="<tr><td align='right' style='width:51px'>State:</td>";
						strxml +="<td>"+state.replace(replaceChar,'')+"</td></tr>";
						strxml +="<tr><td align='right' style='width:51px'>Zip:</td>";
						if(zipcode != null && zipcode !="" && zipcode!='null' )// Case# 20147997
							strxml +="<td>"+zipcode.replace(replaceChar,'')+"</td></tr>";
						else
						{
							strxml +="<td>"+zipcode+"</td></tr>";
						}
						strxml +="<tr><td align='right' style='width:51px'>Country:</td>";
						if(country != null && country !="" && country!='null' )// Case# 20147997
							strxml +="<td>"+country.replace(replaceChar,'')+"</td></tr>";			
						else
						{
							strxml +="<td>"+country+"</td></tr>";
						}
						strxml +="</table>";
						strxml +=" <p>&nbsp;</p>";
						strxml +="</td></tr></table>";
						strxml +="</td></tr></table>";

						strxml +="<table  width='100%'>";
						strxml +="<tr style=\"font-weight:bold;background-color:gray;color:white;\">";



						strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
						strxml += "Item ";
						strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

						strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";			
						strxml += "Item Description";
						strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

						strxml += "<td width='7%' style='border-width: 1px; border-color: #000000'>";
						strxml += "Line #";
						strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";



						strxml += "<td width='5%' style='border-width: 1px; border-color: #000000'>";			
						strxml += "Committed Qty";
						strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

						strxml += "<td width='3%' style='border-width: 1px; border-color: #000000'>";			
						strxml += "Units";
						strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

						strxml += "<td width='3%' style='border-width: 1px; border-color: #000000'>";			
						strxml += "Weight";
						strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

						strxml += "<td width='22%' style='border-width: 1px; border-color: #000000'>";
						strxml += "Bin Location (Qty)";
						strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
						
						strxml += "<td width='10%' style='border-width: 1px; border-color: #000000'>";			
						strxml += "Ship Via </td>";

						strxml =strxml+  "</tr>";
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
							var vnLine = objOpenTaskDetails[j].getValue('custrecord_wmsse_line_no');
							var vnUnits = objOpenTaskDetails[j].getValue('custrecord_wmsse_uom');
							var vConversionRate = objOpenTaskDetails[j].getValue('custrecord_wmsse_conversionrate');
							var vItemWeight = objOpenTaskDetails[j].getValue('weight','custrecord_wmsse_sku');
							var vItemWeightUnit = objOpenTaskDetails[j].getText('weightunit','custrecord_wmsse_sku');
							var vTotalItemWeight = objOpenTaskDetails[j].getValue('formulanumeric');
							if(vnUnits == null || vnUnits == '' || vnUnits == '- None -')
								vnUnits = "";


							nlapiLogExecution('ERROR', 'vnCommQty', vnCommQty);

							if(vTotalItemWeight == null || vTotalItemWeight == '' || vTotalItemWeight == '- None -' || vTotalItemWeight == 0)
								vTotalItemWeight = "";
							nlapiLogExecution('ERROR', 'vTotalItemWeight', vTotalItemWeight);
							strxml =strxml+  "<tr>";
							strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
							if(vnSku != null && vnSku != '')
							{

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
							{
								vnSkuDesc = vnSkuDesc.replace(/\&/g,"&amp;");
								vnSkuDesc = vnSkuDesc.replace(/\"/g,"&quot;");
								vnSkuDesc = vnSkuDesc.replace(/\'/g,"&apos;");

								strxml += vnSkuDesc;
							}
							strxml += "</td>"; 

							strxml += "<td width='7%' align='right' style='border-width: 1px; border-color: #000000'>";			
							strxml += vnLine;
							strxml += "</td>"; 




							strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
							strxml += vnCommQty;
							strxml += "</td>"; 

							strxml += "<td width='3%' align='left' style='border-width: 1px; border-color: #000000'>";			
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

							strxml += "<td width='22%'   style='border-width: 1px; border-color: #000000; text-align:left'>";

							if(vBinDetails != null && vBinDetails != '')
							{
								vBinDetails=vBinDetails.toString().replace(/\$/g,"<br/>");

								vBinDetails=vBinDetails.toString().replace(/\&/g,"&amp;");
								strxml += vBinDetails.toString();
							}
							strxml += "</td>";
							
							
							strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
							if(vnShipVia != null && vnShipVia != "")
								strxml += vnShipVia.replace(replaceChar,'');
							strxml += "</td>";

							strxml =strxml+  "</tr>";




						}	


					}


					strxml =strxml+"</table>";

					if((soNumArray.length-w)>1)
					{
						if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails != 'null' && objOpenTaskDetails.length != null && objOpenTaskDetails.length != 6)
						{
							pageno=parseFloat(pageno)+1;
							strxml=strxml+ "<p style='page-break-after:always'></p>";
						}
					}


				}
				}
				strxml =strxml+ "</body></pdf>";
				xml=xml +strxml;
				nlapiLogExecution('ERROR', 'xml', xml.toString());
				var file = nlapiXMLToPDF(xml);	
				var pdffilename = Timez+'_PickReport.pdf';
				response.setContentType('PDF',pdffilename);
				response.write( file.getValue() );
		}
		else
		{
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

function getSODetails(sonumber)
{
	var soArray = new Array();
	var soId = '';
	var tranType = '';
	
	var SODetails=new Array();
	var transsearchresult = new nlapiLoadSearch('transaction', 'customsearch_wmsse_trandet_printpicktick');
		
	if(sonumber != null && sonumber != '' && sonumber != 'null')
		transsearchresult.addFilter(new nlobjSearchFilter('tranid', null, 'is', sonumber));

	var resLenDetails = transsearchresult.runSearch();
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SODetails = SODetails.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}
	if(SODetails != null && SODetails != '')
	{
		soArray.push(SODetails[0].getValue('internalid'));
		soArray.push(SODetails[0].getValue('type'));
	}
	nlapiLogExecution('ERROR', 'soArray',soArray);

	return soArray;
}

