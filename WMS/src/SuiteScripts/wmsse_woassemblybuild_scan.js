/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function assemblybuildWOScan(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');		
		var getOptedField = request.getParameter('custparam_option');		
		var userAccountId = ctx.getCompany();		
		var vTranType = request.getParameter('custparam_trantype');
		var whLocationName = request.getParameter('custparam_whlocationname');	
		var actualBeginTime = TimeStamp();		
		var domainName = fndomainName();
		
		var st0,st1,st2,st3;
		
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-CHECKIN SO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
				
			st0 = domainName + "-Assembly Build Work Order";
			st1 = "Enter/Scan Work Order#";			
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
		
		var logmsg = 'userAccountId. = ' + userAccountId + '<br>';
		logmsg = logmsg + 'vTranType. = ' + vTranType + '<br>';
		logmsg = logmsg + 'actualBeginTime. = ' + actualBeginTime + '<br>';	
		logmsg = logmsg + 'domainName. = ' + domainName + '<br>';		
		nlapiLogExecution('DEBUG', 'Assemblybuild get values :', logmsg);
		CSSurl=CSSurl.replace(/&/g,"&amp;");
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
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterwo').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan work order#';return false;}else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Assembly Build Work Order</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		//"		<tr><td></td></tr><tr><td></td></tr>" +
		//"<tr><td>"+
		"		<table>"+

		/*"		<tr><td>"+
		"		<table>"+*/

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnTrantype' id='hdnTrantype' value=" + vTranType + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnactualBeginTime' id='hdnactualBeginTime' value='" + actualBeginTime + "'>"+
		"				</td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='enterwo'  class='smalltextbox'  id='enterwo' type='text'/>"+
		//"				</td>"+
		"   <input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/></td>"+
		"	<td width='20px'></td><td ><input name='cmdSearch' type='submit' value='List' width='100px'/></td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/>"+

		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"			</tr><tr><td></td></tr></table>"+
		//"		 </table></td></tr>"+
		" 	</table>"+
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

		var whlocation = request.getParameter('custparam_whlocation');
		WOarray["custparam_whlocation"] = whlocation;
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnactualBeginTime');
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

			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_menu', 'customdeploy_wmsse_wo_menu', false, WOarray);
			return;
		}	
		else if(request.getParameter('cmdSearch')=="List")
		{
			WOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_assemblybuildlst_scan', 'customdeploy_wmsse_assemblybuildlst_scan', false, WOarray);
			return;
		}
		else
		{
			var getWOid=request.getParameter('enterwo');
			nlapiLogExecution('DEBUG','getWOid',getWOid);
			nlapiLogExecution('DEBUG','whlocation',whlocation);
			var WOFilters=new Array();
			WOFilters.push(new nlobjSearchFilter('tranid', null, 'is', getWOid));
			//WOFilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
			//WOFilters.push(new nlobjSearchFilter('status', null, 'noneof', ['WorkOrd:G','WorkOrd:C','WorkOrd:A','WorkOrd:H']));
			//WOFilters.push(new nlobjSearchFilter('status', null, 'noneof', ['WorkOrd:C','WorkOrd:A','WorkOrd:H']));
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
				var woStatus=WORecinternalids[0].getValue('status');
				nlapiLogExecution('DEBUG','woStatus',woStatus);
				if(woStatus == 'fullyBuilt')
				{
					WOarray["custparam_error"] = "Assembly build is completed for this work order#";
					response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan', 'customdeploy_wmsse_assembly_woscan', false, WOarray);
					return;
				}
				//WOarray["custparam_woassemblyitem"] =WORecinternalids[0].getText('assemblyitem');
				var isValid=fnCompareLinesNSvsOT(woid);
				if(isValid == false)
				{
					//WOarray["custparam_error"] = "All the items in this work order are not picked.";
					WOarray["custparam_error"] = "All the components items are not yet picked";
					response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan', 'customdeploy_wmsse_assembly_woscan', false, WOarray);
					return;
				}

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
				
				if(remainingQty == null || remainingQty == '' || remainingQty =='null')
					remainingQty = 0;
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
				response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan', 'customdeploy_wmsse_assembly_woscan', false, WOarray);

			}

		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
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
	var searchresultsNS = nlapiSearchRecord('workorder','customsearch_wmsse_assembly_wovalidation', filtersNS, columnsNS);



	if(searchresultsNS != null  && searchresultsNS != '')
		vTotNSBomLines= searchresultsNS.length;


	var filterOT = new Array();
	filterOT[0] = new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', woid);
	//filterOT[1] = new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8']);
//	filterOT[2] = new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',null, 'anyof',['@NONE@']);

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
			nlapiLogExecution('ERROR','vRemqty',vRemqty);
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

	return isValid;

}