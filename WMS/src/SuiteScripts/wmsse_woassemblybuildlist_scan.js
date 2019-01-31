/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function assemblybuildWOListScan(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');		
		var getOptedField = request.getParameter('custparam_option');		
		var userAccountId = ctx.getCompany();		
		var vTranType = request.getParameter('custparam_trantype');
	
		var st0,st1,st2,st3;
		var domainName = fndomainName();		
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whLocation = request.getParameter('custparam_whlocation');
		var actualBeginTime = request.getParameter('custparam_actualbegintime');
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-Picking Work Order";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			st0 = domainName + "-Picking Work Order";			
			st1 = "Enter/Scan Work Order#";			
			st2 = "SEND";
			st3 = "PREV";

		}	
		var logmsg = 'userAccountId. = ' + userAccountId + '<br>';
		logmsg = logmsg + 'vTranType. = ' + vTranType + '<br>';	
		logmsg = logmsg + 'domainName. = ' + domainName + '<br>';		
		nlapiLogExecution('DEBUG', 'AssemblybuildList get values :', logmsg);
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

		var WORecinternalids=getWOList(vTranType,whLocation);
		var getPageCount=request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize=5;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);
		
		var actualBeginTime=TimeStamp();
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
		html = html + "<script type='text/javascript'>function validateForm(val){if(document.getElementById('enterwo').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan work order#';return false;}else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Assembly Build Work Order - List</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		//"		<tr><td></td></tr><tr><td></td></tr>" +
		"<tr><td>"+
		"		<table>"+

		/*"		<tr><td>"+
		"		<table>"+*/

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+
		"				<input type='hidden' name='hdnactualBeginTime' value='" + actualBeginTime + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnTrantype' id='hdnTrantype' value=" + vTranType + ">"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterwo'  class='smalltextbox'  id='enterwo' type='text'/></td>"+
		"				</td>"+
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		//"		 </table></td></tr>"+
		" 	</table>";

		if(WORecinternalids!=null && WORecinternalids!='' && WORecinternalids.length != null)
		{
			nlapiLogExecution('Debug', 'WORecinternalids.length', WORecinternalids.length);
			if(WORecinternalids.length>0 )
			{


				var tblDeclared = false;
				var OrderNumArray=new Array();
				var orderCount=0;
				var nextOrd = 0;
				var vColumnslist=WORecinternalids[0].getAllColumns();
				for (var s = 0; s < WORecinternalids.length; s++) {
					var woInternalId=WORecinternalids[s].getValue('internalid',null,'group');
					var woId=WORecinternalids[s].getValue('tranid',null,'group');
					var vwoitemQty=WORecinternalids[s].getValue('quantity',null,'max');					
					var nooflines =WORecinternalids[s].getValue('line',null,'count'); 
					var customer=WORecinternalids[s].getValue('entityid','customer','group');
					if(customer == null || customer =='' || customer =='- None -')
						customer=WORecinternalids[s].getValue('altname','customer','group');
					var whCompany= '';
					
					var isValid=fnCompareLinesNSvsOT(woInternalId);
				
					if(isValid == true)
					{

						if(tblDeclared == false)
						{
							var strOrderText = "Work Order#";

							html = html + "	<table>"+
							" <tr>"+
							" <td>"+
							"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
							" <tr class='uir-machine-headerrow' >"+
							" <td>"+strOrderText+""+
							" </td>"+	
							"<td>Assembly Item </td>"+	
							"<td class='align-right'>#Lines </td>"+	

							"</tr>";
							tblDeclared = true;

						}
						if(OrderNumArray.indexOf(woId)!=-1)
						{

							continue;
						}
						else
						{
							if(parseInt(orderCount)<5)
							{

								OrderNumArray.push(woId);
							}
							if(parseInt(orderCount) >= 5 && parseInt(nextOrd) == 0)
							{
								
								nextOrd = parseInt(nextOrd) + 1;
							}
						}

					

						if((OrderNumArray.length>totalPageSizeValue) && (parseInt(orderCount)<5))
						{

							orderCount=parseInt(orderCount)+1;

							var WOFilters=new Array();
							WOFilters.push(new nlobjSearchFilter('tranid', null, 'is', woId));
							WOFilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
							WOFilters.push(new nlobjSearchFilter('status', null, 'noneof', ['WorkOrd:G','WorkOrd:C','WorkOrd:A','WorkOrd:H']));
							if(whLocation!='null' && whLocation!="" && whLocation!=null)
								WOFilters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));

							var WOtrantypecols=new Array();
							WOtrantypecols.push(new nlobjSearchColumn('internalid'));
							WOtrantypecols.push(new nlobjSearchColumn('tranid'));
							WOtrantypecols.push(new nlobjSearchColumn('status'));
							/*WOtrantypecols.push(new nlobjSearchColumn('location'));
							WOtrantypecols.push(new nlobjSearchColumn('item'));
							WOtrantypecols.push(new nlobjSearchColumn('quantity'));
							WOtrantypecols.push(new nlobjSearchColumn('quantityshiprecv'));*/
							WOtrantypecols.push(new nlobjSearchColumn('unit'));

							var WORecinternalidsheader=nlapiSearchRecord('workorder','customsearch_wmsse_woassembly_srh',WOFilters,WOtrantypecols);
							if(WORecinternalidsheader!=null && WORecinternalidsheader!='')
							{
								var Itemid=WORecinternalidsheader[0].getValue('item');
								var Itemname=WORecinternalidsheader[0].getText('item');
								var Itemqty=WORecinternalidsheader[0].getValue('quantity');
								var Itemqtyreceive=WORecinternalidsheader[0].getValue('quantityshiprecv');
								if(Itemqty == null || Itemqty =='' || Itemqty=='null')
								{
									vWoquantity=0;
								}
								if(Itemqtyreceive == null || Itemqtyreceive =='' || Itemqtyreceive=='null')
								{
									Itemqtyreceive=0;
								}
								
								var remainingQty = Number(Big(Itemqty).minus(Itemqtyreceive));
								var vUnits=WORecinternalidsheader[0].getValue('unit');
								var itemType = nswms_GetItemType(Itemid, whLocation);
								var checkInURL_1 ='';
								if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
									checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_assembly_lotscan', 'customdeploy_wmsse_assembly_lotscan');
								else
									checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan');

								var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_trantype=' + vTranType + '&custparam_language=' + getLanguage + '&custparam_woid=' + woId  + '&custparam_actualbegintime=' + actualBeginTime + '&custparam_company=' + whCompany + '&custparam_wointernalid=' + woInternalId + '&custparam_fetcheditemid='+Itemid+ '&custparam_woitemqty='+Itemqty+ '&custparam_rec_qty='+Itemqtyreceive+ '&custparam_rem_qty='+remainingQty+ '&custparam_fetched_units='+vUnits;
								//Case # 201415163 ,201415164  Start.
								//var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_trantype=' + vTranType + '&custparam_language=' + getLanguage + '&custparam_woid=' + woId  + '&custparam_customer=' + customer  + '&custparam_actualbegintime=' + actualBeginTime + '&custparam_company=' + whCompany + '&custparam_wointernalid=' + woInternalId + '&custparam_fetcheditemid='+Itemid+ '&custparam_woitem='+Itemname+ '&custparam_woitemqty='+Itemqty+ '&custparam_rec_qty='+Itemqtyreceive+ '&custparam_rem_qty='+remainingQty;
								//var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_trantype=' + vTranType + '&custparam_language=' + getLanguage + '&custparam_woid=' + woId  + '&custparam_actualbegintime=' + actualBeginTime + '&custparam_company=' + whCompany + '&custparam_wointernalid=' + woInternalId + '&custparam_fetcheditemid='+Itemid+ '&custparam_woitem='+Itemname+ '&custparam_woitemqty='+Itemqty+ '&custparam_rec_qty='+Itemqtyreceive+ '&custparam_rem_qty='+remainingQty;
								//Case # 201415163 ,201415164  End.
								if(customer != null && customer !='' && customer !='- None -' && customer.length > 20)
								{
									customer = customer.substring(0,20)+"..";
								}
								html = html + "	<tr  class='uir-list-row-tr line uir-list-row-even'>"+
								" <td><a name='link1URL_1' href='" + linkURL_1 + "'>"+woId+"</a></td>"+
								"<td>"+Itemname+"</td>"+
								"<td class='align-right'>"+nooflines+"</td>"+
								"</tr>";


								/*if(parseInt(orderCount)>=5)
								{
									if(s+1<WORecinternalids.length)
										orderCount=parseInt(orderCount)+1;
									break;
								}*/
							}
						}
						if(parseInt(orderCount)>=5)
						{
							
							nlapiLogExecution('Debug', 'nextOrd', nextOrd);
							var twoInternalId=0;
							if(WORecinternalids[s] != null  && WORecinternalids[s] !='null' && WORecinternalids[s] != '' && parseInt(nextOrd) >= 1)
							{
								twoInternalId=WORecinternalids[s].getValue('tranid',null,'group');


								
								if(((WORecinternalids.length)-(parseInt(s)) > 0) && (OrderNumArray.indexOf(twoInternalId)==-1))
								{
									orderCount=parseInt(orderCount)+1;
									break;
								}
							}						
						}
					}
				}
				if(tblDeclared == false)
				{
					var WOarray = new Array();
					WOarray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
					WOarray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
					WOarray["custparam_trantype"]=request.getParameter('custparam_trantype');
					WOarray["custparam_error"] = 'No records to show.';

					response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan', 'customdeploy_wmsse_assembly_woscan', false, WOarray);
					return;
				}


				html = html + "	</table>"+	
				"				<input type='hidden' name='hdngetPageCount' id='hdngetPageCount' value=" + getPageCount + ">"+
				" </td>"+
				"</tr>"+
				"</table>";
			}
		}
		else
		{
			var WOarray = new Array();
			WOarray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
			WOarray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
			WOarray["custparam_trantype"]=request.getParameter('custparam_trantype');
			WOarray["custparam_error"] = 'No records to show.';

			response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan', 'customdeploy_wmsse_assembly_woscan', false, WOarray);
			return;
		}
		WORecinternalids=null;
		html = html +" 	</td></tr></table>";
		html = html +"		<table>	<tr>";
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
		"		 </table>";


		html = html +" 	</table>"+

		"	</form>"+
		"<script type='text/javascript'>document.getElementById('enterwo').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedEvent = request.getParameter('cmdPrevious');
		var tranType = request.getParameter('hdnTrantype');
		var WOarray=new Array();
		

		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnactualBeginTime');
		var whlocation = request.getParameter('custparam_whlocation');

		var getLanguage = request.getParameter('hdngetLanguage');
		WOarray["custparam_language"] = getLanguage;
		

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
			st11 = "Invalid Option";
			st12 = "MainMenu";
		}



		WOarray["custparam_woid"] = request.getParameter('enterwo');
		WOarray["custparam_trantype"] = request.getParameter('hdnTrantype');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			WOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan', 'customdeploy_wmsse_assembly_woscan', false, WOarray);
			return;
		}
		
		if(request.getParameter('cmdNextList')=="Next")
		{
			WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+1;
			WOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_assemblybuildlst_scan', 'customdeploy_wmsse_assemblybuildlst_scan', false, WOarray);
			return;
		}
		if(request.getParameter('cmdPrevList')=="Prev")
		{
			WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-1;
			WOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_assemblybuildlst_scan', 'customdeploy_wmsse_assemblybuildlst_scan', false, WOarray);
			return;
		}
		else
		{
			var getWOid=request.getParameter('enterwo');
			nlapiLogExecution('DEBUG','getWOid',getWOid);
			
			var WOFilters=new Array();
			WOFilters.push(new nlobjSearchFilter('tranid', null, 'is', getWOid));
			/*WOFilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
			//WOFilters.push(new nlobjSearchFilter('status', null, 'noneof', ['WorkOrd:G','WorkOrd:C','WorkOrd:A','WorkOrd:H']));
			WOFilters.push(new nlobjSearchFilter('status', null, 'noneof', ['WorkOrd:C','WorkOrd:A','WorkOrd:H']));*/
			if(whlocation!='null' && whlocation!="" && whlocation!=null)
				WOFilters.push(new nlobjSearchFilter('location', null, 'anyof', whlocation));

			var WOtrantypecols=new Array();
			/*WOtrantypecols.push(new nlobjSearchColumn('internalid'));
			WOtrantypecols.push(new nlobjSearchColumn('tranid'));
			WOtrantypecols.push(new nlobjSearchColumn('status'));
			WOtrantypecols.push(new nlobjSearchColumn('location'));
			WOtrantypecols.push(new nlobjSearchColumn('item'));
			WOtrantypecols.push(new nlobjSearchColumn('quantity'));
			WOtrantypecols.push(new nlobjSearchColumn('quantityshiprecv'));
			WOtrantypecols.push(new nlobjSearchColumn('unit'));*/

			var WORecinternalids=nlapiSearchRecord('workorder','customsearch_wmsse_woassembly_woscan_srh',WOFilters,WOtrantypecols);
			var woid='';
			if(WORecinternalids!=null && WORecinternalids!='')
			{
				woid=WORecinternalids[0].getValue('internalid');
				WOarray["custparam_woid"] = WORecinternalids[0].getValue('tranid');
				//WOarray["custparam_woassemblyitem"] =WORecinternalids[0].getText('assemblyitem');
				var woStatus=WORecinternalids[0].getValue('status');
				nlapiLogExecution('DEBUG','woStatus',woStatus);
				if(woStatus == 'fullyBuilt')
				{
					WOarray["custparam_error"] = "Assembly build is completed for this work order#";
					response.sendRedirect('SUITELET', 'customscript_wmsse_assemblybuildlst_scan', 'customdeploy_wmsse_assemblybuildlst_scan', false, WOarray);
					return;
				}
				var isValid=fnCompareLinesNSvsOT(woid);
				if(isValid == false)
				{
					//WOarray["custparam_error"] = "All the items in this work order are not picked.";
					WOarray["custparam_error"] = "All the components items are not yet picked";
					response.sendRedirect('SUITELET', 'customscript_wmsse_assemblybuildlst_scan', 'customdeploy_wmsse_assemblybuildlst_scan', false, WOarray);
					return;
				}

				var woStatus=WORecinternalids[0].getValue('status');
				
				var woToLocationID=WORecinternalids[0].getValue('location');
				

				var whLocation= WORecinternalids[0].getValue('location');

				var whCompany= WORecinternalids[0].getValue('custbody_nswms_company');
				WOarray["custparam_whlocation"] = whLocation;
				WOarray["custparam_company"] =whCompany;
				WOarray["custparam_fetcheditemid"]=WORecinternalids[0].getValue('item');
				WOarray["custparam_woitem"]=WORecinternalids[0].getText('item');
				WOarray["custparam_woitemqty"]=WORecinternalids[0].getValue('quantity');
				WOarray["custparam_rec_qty"]=WORecinternalids[0].getValue('quantityshiprecv');
				WOarray["custparam_wointernalid"]=woid;
				WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
				WOarray["custparam_fetched_units"]=WORecinternalids[0].getValue('unit');
				
				var vWOquantity=WORecinternalids[0].getValue('quantity');
				var vWOrecquantity=WORecinternalids[0].getValue('quantityshiprecv');
				
				if(vWOquantity == null || vWOquantity =='' || vWOquantity=='null')
				{
					vWOquantity=0;
				}
				if(vWOrecquantity == null || vWOrecquantity =='' || vWOrecquantity=='null')
				{
					vWOrecquantity=0;
				}

				var remainingQty = Number(Big(vWOquantity).minus(vWOrecquantity));
							
				
				WOarray["custparam_rem_qty"]=remainingQty;//WORecinternalids[0].getValue('quantity');
				message = 'whLocation = ' + whLocation + '<br>';
				message = 'item = ' + WORecinternalids[0].getValue('item') + '<br>';
				message = 'item = ' + WORecinternalids[0].getText('item') + '<br>';
				message = message + 'whCompany = ' + whCompany;
				nlapiLogExecution('DEBUG', 'WO Details', message);
				var itemType = nswms_GetItemType(WORecinternalids[0].getValue('item'), whLocation);
				if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
				{
					WOarray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_lotscan', 'customdeploy_wmsse_assembly_lotscan', false, WOarray);
				}
				else
				{
					WOarray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
				}




			}
			else
			{				
				WOarray["custparam_error"] = "Please enter/scan valid work order#";				
				response.sendRedirect('SUITELET', 'customscript_wmsse_assemblybuildlst_scan', 'customdeploy_wmsse_assemblybuildlst_scan', false, WOarray);

			}

		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}
function getopentaskDetails(woInternalId)
{
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); 
//	opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

	var opentaskColumns =  new Array();
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_batch_no'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_sku'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_line_no'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty'));
	//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_actendloc'));
	var opentaskResultsArray = new Array();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentask_search',opentaskFilters,opentaskColumns);
	
	if(opentaskResults !=null && opentaskResults !='')
	{
		
		for(var k=0;k<opentaskResults.length;k++)
		{
			
			var sku = opentaskResults[k].getValue('custrecord_wmsse_sku');
			var lineno = opentaskResults[k].getValue('custrecord_wmsse_line_no');
			var qty =  opentaskResults[k].getValue('custrecord_wmsse_act_qty');
			var key = sku+"-"+lineno;
			var currRow = [key,qty];
			opentaskResultsArray.push(currRow);
		}
	}
	
	return opentaskResultsArray;
}

function fntocheckwo(woid,loc){
	var resflag = "F";

	var filters=new Array();
	var columns=new Array();
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
	filters.push(new nlobjSearchFilter('tranid', null, 'is', woid));
	if(loc!=null && loc!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', loc));
	filters.push(new nlobjSearchFilter('status', null, 'anyof',['WorkOrd:B','WorkOrd:D']));

	columns[0] = new nlobjSearchColumn('location');

	var WORecinternalids=nlapiSearchRecord('workorder','customsearch_wmsse_woassembly_srh',filters,columns);

	if(WORecinternalids!=null && WORecinternalids!="")
		resflag ="T";

	return resflag;

}
//function getWOList(whLocation)
//{
//var trantype ='WorkOrd';
//nlapiLogExecution('ERROR', 'trantype', trantype);
//nlapiLogExecution('ERROR', 'whLocation', whLocation);
//var opentaskFilters =  new Array();
//opentaskFilters.push(new nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is', 'T'));
//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
//opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@']));
//if(whLocation !=null && whLocation !='')
//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null,'anyof',whLocation));	
//opentaskFilters.push(new nlobjSearchFilter('type','custrecord_wmsse_order_no','is',trantype));
//var opentaskColumns =  new Array();	
//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_order_no'));
//opentaskColumns.push(new nlobjSearchColumn('entity','custrecord_wmsse_order_no'));
//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_sku'));
//var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,opentaskFilters,opentaskColumns);

//nlapiLogExecution('ERROR', 'opentaskResults', opentaskResults);
//return opentaskResults;

//}

function getWOList(trantype,whLocation)
{

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
	filters.push(new nlobjSearchFilter('status', null, 'anyof',['WorkOrd:B','WorkOrd:D']));

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_fulfil_listdetail', filters, columns);


	return WOLineDetails;
}
function getWODetails(wonumber)
{
	var filters = new Array();
	var columns = new Array();
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
	filters.push(new nlobjSearchFilter('quantity', null, 'greaterthan', 0));

	filters.push(new nlobjSearchFilter('shipping', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));

	columns.push(new nlobjSearchColumn('line'));
	/*columns.push(new nlobjSearchColumn('item'));	
	columns.push(new nlobjSearchColumn('quantity'));
	//columns[3] = new nlobjSearchColumn('quantitypicked');
	columns.push(new nlobjSearchColumn('quantityshiprecv'));*/
	columns.push(new nlobjSearchColumn('tranid'));	
	//columns.push(new nlobjSearchColumn('location'));

	//columns[3].setSort();

	var woLineDetails = new nlapiSearchRecord('workorder', 'customsearch_wmsse_woassembly_srh', filters, columns);//new search


	return woLineDetails;
}

function fnCompareLinesNSvsOT(woid)
{
	nlapiLogExecution('Debug', 'woid', woid);


	var filtersNS = new Array();

	filtersNS[0] = new nlobjSearchFilter('internalid', null, 'anyof', woid);	
	filtersNS[1] = new nlobjSearchFilter('isfulfillable', 'item', 'is', 'T');
	var columnsNS = new Array();
	columnsNS[0] = new nlobjSearchColumn('item');
	columnsNS[1] = new nlobjSearchColumn('quantity');
	columnsNS[2] = new nlobjSearchColumn('line').setSort(false);
	var searchresultsNS = nlapiSearchRecord('workorder', 'customsearch_wmsse_assembly_wovalidation', filtersNS, columnsNS);



	if(searchresultsNS != null  && searchresultsNS != '')
		vTotNSBomLines= searchresultsNS.length;


	var filterOT = new Array();
	filterOT[0] = new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', woid);
	/*filterOT[1] = new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8']);
	filterOT[2] = new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',null, 'anyof',['@NONE@']);*/

	var columnsOT = new Array();

	/*columnsOT[0] = new nlobjSearchColumn('custrecord_wmsse_line_no',null,'group');

	columnsOT[1] = new nlobjSearchColumn('custrecord_wmsse_sku',null,'group');
	columnsOT[2] = new nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum');
	columnsOT[3] = new nlobjSearchColumn('custrecord_wmsse_conversionrate',null,'group');*/
	var searchresultsOT = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_assembly_woscan_ot', filterOT,columnsOT);	

	var isValid=false;
	if(searchresultsOT != null && searchresultsOT != '' && searchresultsOT.length > 0)
	{


		for(var s=1;s<searchresultsNS.length;s++)
		{
			var vSchqunatity=searchresultsNS[s].getValue('quantity');
			var vTotquantity=searchresultsNS[0].getValue('quantity');
			if(vSchqunatity == null || vSchqunatity == '' || vSchqunatity =='null')
				vSchqunatity = 0;
			if(vTotquantity == null || vTotquantity == '' || vTotquantity =='null')
				vTotquantity = 0;
			
			var vMemQty=Big(vSchqunatity).div(vTotquantity);	
						
			var memitem = searchresultsNS[s].getValue('item');
			var memline = searchresultsNS[s].getValue('line');
			var fulfilledqty = searchresultsNS[s].getValue('quantityshiprecv');
			var vqty=searchresultsNS[s].getValue('quantity');
			var vRemqty=Number(Big(vqty).minus(fulfilledqty)).toFixed(8);
			for(var p=0;p<searchresultsOT.length;p++)
			{

				
				var memsku= searchresultsOT[p].getValue('custrecord_wmsse_sku',null,'group');
				var memlineno= searchresultsOT[p].getValue('custrecord_wmsse_line_no',null,'group');
				var memactqty= searchresultsOT[p].getValue('custrecord_wmsse_act_qty',null,'sum');
				var memactconverserate= searchresultsOT[p].getValue('custrecord_wmsse_conversionrate',null,'group');
				if(memactconverserate == null || memactconverserate == '' || memactconverserate == '- None -')
					memactconverserate = 1;
				
				if(memitem==memsku && memline==memlineno)
				{
					nlapiLogExecution('Debug', 'memsku,memitem,memlineno,memline', memsku+","+memitem+","+memlineno+","+memline);
					nlapiLogExecution('Debug', 'memactconverserate,memactqty,memqty', memactconverserate+","+memactqty+","+vMemQty);
				
					if((Number(Big(memactqty).mul(memactconverserate)))>=Number(vRemqty) || (Number(Big(memactqty).mul(memactconverserate)))>0)
					{
						isValid=true;
						continue;
					}
					else
					{
						isValid=false;
						break;
					}

				}

			}
			
			if(isValid==false)
			{
				break;
			}
		}

	}






	/*var vTotLines=0;

	if(searchresultsOT != null  && searchresultsOT != '')
		vTotLines= searchresultsOT.length;
	nlapiLogExecution('ERROR', 'vTotLines:vTotNSBomLines', vTotLines+":"+vTotNSBomLines);
	if(vTotNSBomLines != 0 && vTotLines != 0 && vTotNSBomLines == vTotLines)
		return true;
	else
		return false;*/

	return isValid;

}

