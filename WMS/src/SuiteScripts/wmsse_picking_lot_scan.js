/**
 * Script Description
 * This script is used to scan the Lot for selected item.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan lot number for picking
 */
function PickingLotScan(request, response){

	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';

		var enteredBin=request.getParameter('custparam_enterbin');
		var enteredItem=request.getParameter('custparam_enteritem');
		var enteredBinId=request.getParameter('custparam_enterbinid');
		var whlocation = request.getParameter('custparam_whlocation');
		var item=request.getParameter('custparam_item');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var enterOrder=request.getParameter('custparam_enterorder');
		var trantype=request.getParameter('custparam_trantype');
		var qtyToPick=request.getParameter('custparam_itemremainingqty');
		var binQty=request.getParameter('custparam_itembinqty');
		var soId=request.getParameter('custparam_soId');
		var solineno=request.getParameter('custparam_solineno');
		var customer=request.getParameter('custparam_customer');
		var trantype=request.getParameter('custparam_trantype');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var vUnitsText=request.getParameter('custparam_unitstext');
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate'); 
		var ordType = request.getParameter('custparam_ordtype');
		var getmemitemqty = request.getParameter('custparam_memitemqty');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		var vparentitem = request.getParameter('custparam_parentItemType');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		if(vUnitsText == null || vUnitsText =='' || vUnitsText =='- None -')
			vUnitsText='';
		if(vConversionRate == '- None -' || vConversionRate == '' || vConversionRate == null)
			vConversionRate =1;
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		var st0 = domainName + '-FULFILLMENT LOT SCAN';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}
		var vPageCount = request.getParameter('custparam_pagecount');

		if(vPageCount == null || vPageCount == '' || vPageCount == 'null' || vPageCount == 'undefined')
		{
			vPageCount = 0;
		}
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',enteredItem));
		if(whlocation != null && whlocation !='' && whlocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whlocation]));
		}
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		itemcolumns.push(new nlobjSearchColumn('stockunit'));
		itemcolumns.push(new nlobjSearchColumn('unitstype'));
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
		var VUnitType ='';
		var blnItemUnit = '';
		if(itemresults!=null && itemresults!='')
		{
			item = itemresults[0].getValue('itemid');
			blnItemUnit = itemresults[0].getText('stockunit');
			VUnitType = itemresults[0].getValue('unitstype');
		}
		var results='';
		if(VUnitType != null && VUnitType != '' && VUnitType != 'null' && VUnitType != 'undefined')
		{

			results= getUnitsType(VUnitType);
		}
		if(getStockConversionRate == '- None -' || getStockConversionRate == '' || getStockConversionRate == null)
			getStockConversionRate =1;
		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		if(makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == '' || makeInvAvailFlagFromSelect == 'null' || 
				makeInvAvailFlagFromSelect == 'undefined')
			makeInvAvailFlagFromSelect ='T';

		var objBinDetails = fnGetPickBinDetailsLotWithExpiryDates(enteredItem,enteredBinId,'',whlocation,vPageCount,
				makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate);

		var qtyUomCntrlSelectedConversionRate =vConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' &&
				qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}
		st0 = domainName + '-Picking';

		var ordVar = "SO/TO";

		if(trantype == 'salesorder')
		{
			st0 = domainName + '-SO Picking';
			ordVar = "Sales Order#";
		}
		else
		{
			st0 = domainName + '-TO Picking';
			ordVar = "Transfer Order#";
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			
		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
		}
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item');
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}
		html = html + "	<script type='text/javascript'>function fnShowLoader() {" +
		"document.getElementById('loading').style.display = 'block';}</script>";

		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";
		html = html + "<script type='text/javascript'>function validateLot(enterlot){document.getElementById('txtlot').value = enterlot ;document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = ''; return true;}</script>";
		html = html + "<script type='text/javascript'>function validateForm(){var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtlot').value; var vLotWhiteSpace = lotVal.indexOf(' ') >= 0; if(document.getElementById('txtlot').value == '' ){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;} else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking Lot#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin:  <label>" + enteredBin + "</label>"+
		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item:  <label>" + item + "</label></td></tr>"+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnEnteredBin' value=" + enteredBin + ">"+
		"				<input type='hidden' name='hdnEnteredItem' value=" + enteredItem + ">"+
		"				<input type='hidden' name='hdnEnteredBinId' value=" + enteredBinId + ">"+
		"				<input type='hidden' name='hdnitem' value='" + item + "'>"+
		"				<input type='hidden' name='hdnOrder' value='" + enterOrder + "'>"+
		"				<input type='hidden' name='hdnTrantype' value='" + trantype + "'>"+
		"				<input type='hidden' name='hdnQtyToPick' value='" + qtyToPick + "'>"+
		"				<input type='hidden' name='hdnbinRemainingQty' value='" + binQty + "'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value='" + whlocation + "'>"+
		"				<input type='hidden' name='hdnsoId' value='" + soId + "'>"+
		"				<input type='hidden' name='hdnsolineno' value='" + solineno + "'>"+
		"				<input type='hidden' name='hdncustomer' value='" + customer + "'>"+
		"				<input type='hidden' name='hdntrantype' value='" + trantype + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnitsText + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnvMemitemqty' id='hdnvMemitemqty' value=" + getmemitemqty + ">"+
		"               <input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnparentitem' value='" +vparentitem+"'>"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnPageCount' id='hdnPageCount' value=" + vPageCount + ">"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdnunittype'  value=" + VUnitType + ">"+	
		"				<input type='hidden' name='hdnstockunit' value=" + blnItemUnit + ">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+':'+"  <label>" + enterOrder + "</label>"+
		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";		
		html = html +"	<td align = 'left'><input name='txtlot'  class='smalltextbox'  id='txtlot' type='text'/>";		
		html = html +"				</td>"+
		"			</tr></table>"+
		"			<table><tr>";
		html = html +"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'  type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width='40px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>";


		html = html +"				</td>"+
		"			</tr>"+
		"		 </table>";

		if((objBinDetails !=null && objBinDetails != '' && objBinDetails.length !=null) ||
				(makeInvAvailFlagFromSelect != null && makeInvAvailFlagFromSelect !='' && makeInvAvailFlagFromSelect !='null' 
					&& makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined && makeInvAvailFlagFromSelect != 'All') )
		{
			html = html + 	"<table  class='uomstatus-gridgap' >";			
			html = html +"<tr>";
			if(results !=null &&  results !='' && results.length>0)
			{
				html=html+"<td align = 'left' class='labelmsg'>UOM</td>";
				//Inventorystatus Feature is enabled
				if(inventoryStatusFeature == true)
				{
					html=html+"<td class='uom-status-display'></td>";
				}
			}			
			if(inventoryStatusFeature == true)
			{
				html = html +"<td align = 'left' class='labelmsg'>Inv Status</td></tr>";

			}
			else
			{
				html=html+"</tr>";
			}
			html = html +"<tr>";
			if(results !=null &&  results !='' && results.length>0)
			{
				html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUom_OnChange();'>";
				var selectedUOM = request.getParameter('custparam_uomprevselected');
				nlapiLogExecution('DEBUG', 'selectedUOM', selectedUOM);
				for(var Cnt1=0; Cnt1 < results.length; Cnt1++)
				{                    	 
					var vUOM = results[Cnt1].getValue('conversionrate');
					var UOMText =results[Cnt1].getValue('unitname');
					nlapiLogExecution('DEBUG', 'vConversionRate,UOMText', vConversionRate+","+UOMText);
					
					if( ( (selectedUOM == null && vConversionRate == vUOM) || (selectedUOM == '' && vConversionRate == vUOM)  
							|| (selectedUOM =='null' && vConversionRate == vUOM) || (selectedUOM =='undefined'  && vConversionRate == vUOM )
							|| (selectedUOM == undefined && vConversionRate == vUOM) )|| (selectedUOM == vUOM))
					{
						nlapiLogExecution('DEBUG', 'selectedUOM', selectedUOM);
						html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";

					}
					else
					{

						html = html +" <option     value="+vUOM+"> "+UOMText+"</option>";

					}
				}
				html = html+"</select></td>";
				//Inventorystatus Feature is enabled
				if(inventoryStatusFeature == true)
				{
					html=html+"<td class='uom-status-display'></td>";
				}
			}

			if(inventoryStatusFeature == true)
			{
				var statusOptsArr = getStatusOptions();
				html = html +"<td ><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
				if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
				{
					for(var Cnt2=0; Cnt2 < statusOptsArr.length; Cnt2++)
					{                    	 
						var val = statusOptsArr[Cnt2][0];
						var StatusText =statusOptsArr[Cnt2][1];


						if(makeInvAvailFlagFromSelect == val)
						{
							html = html +" <option   selected  value="+val+"> "+StatusText+"</option>";

						}
						else
						{
							html = html +" <option     value="+val+"> "+StatusText+"</option>";
						}

					}
				}
				html=html+"</select></td></tr>";
			}

			html = html +"</table>" ;

			html = html + "	<table >"+
			" <tr>"+
			" <td>"+
			"	<table style='border-spacing: 0;' id='tblqtyUOM'>"+
			" <tr class='uir-machine-headerrow' colspan='3'>"+


			" <td>Lot#"+
			" </td>"+	
			" <td  class='align-right'>Qty"+
			" </td>";
			if(inventoryStatusFeature == true)
			{
				html = html +	"			<td></td>	<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}
			html= html +" <td></td>";

			html = html +" <td>Expiry Date"+
			" </td>"+
			"</tr>";
			var convRate = getStockConversionRate;
			var selectedUOM = request.getParameter('custparam_uomprevselected');
			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined'
				&& selectedUOM != undefined )
			{
				convRate =getStockCoversionRate(VUnitType,blnItemUnit,selectedUOM);
			}
			var count = 0;
			for (var s = 0; s < objBinDetails.length && s < 5; s++) {
				count  = parseInt(count)+1;
				if(s%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var lotDetails = objBinDetails[s];
				var vitemLotQty = lotDetails[1];
				var vitemLot = lotDetails[3];
				var vitemLotExp = lotDetails[4];
				var inventoryStatus = lotDetails[5];

				vitemLotQty=new Big(vitemLotQty);
				convRate=new Big(convRate);
				vitemLotQty = Number(vitemLotQty.mul(convRate));


				html = html + "	<tr class='" + vAltClass + "'>"+
				" <td> <a href='#' onclick='return validateLot(\""+vitemLot+"\");' >"+vitemLot+" </a></td>"+
				" <td  class='align-right'> "+parseFloat(parseFloat(vitemLotQty).toFixed(5))+"</td>";
				if(inventoryStatusFeature == true)
				{
					html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
					html = html +"				</td>";	
				}
				html=html+" <td></td>";

				html = html +" <td> "+vitemLotExp+"</td>"+
				"</tr>";
			}
			html= html +"</table></td></tr></table>";

		}
		html = html +"		<table>	<tr>";			
		if(vPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdEnbPrevList' type='submit' value='Prev' onClick = 'return fnShowLoader();'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;</td><td >&nbsp;</td>";
		}

		if((objBinDetails.length>5))
		{
			html = html +"				<td align = 'right'><input name='cmdEnbNextList' type='submit' value='Next' onClick = 'return fnShowLoader();'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>";

		html = html + "</form>"+

		"<script type='text/javascript'>document.getElementById('txtlot').focus();</script>";
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('DEBUG', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array SOarray
		var optedField = request.getParameter('enterbin');
		var optedEvent = request.getParameter('cmdPrevious');
		var SOarray=new Array();
		var stockUnit=request.getParameter('hdnstockunit');
		var unitsType=request.getParameter('hdnunittype');

		var getLanguage = request.getParameter('hdngetLanguage');
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_ordtype"] =ordType;
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_enterbin"] = request.getParameter('hdnEnteredBin');
		SOarray["custparam_enterbinid"] = request.getParameter('hdnEnteredBinId');
		SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
		SOarray["custparam_trantype"] =request.getParameter('hdnTrantype');
		SOarray["custparam_enterorder"] = request.getParameter('hdnOrder');
		SOarray["custparam_itembinqty"] = request.getParameter('hdnbinRemainingQty');
		SOarray["custparam_itemremainingqty"] = request.getParameter('hdnQtyToPick');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		SOarray["custparam_unitstext"] = request.getParameter('hdnuom');
		SOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		SOarray["custparam_memitemqty"]=request.getParameter('hdnvMemitemqty');
		SOarray["custparam_parentItemType"]=request.getParameter('hdnparentitem');
		SOarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var vConversionRate = request.getParameter('hdnvConversionRate');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var customer =request.getParameter('hdncustomer');
		SOarray["custparam_customer"] =customer;
		var soInternalId = request.getParameter('hdnsoId');
		SOarray["custparam_soId"] =soInternalId;
		var soLineno = request.getParameter('hdnsolineno');
		SOarray["custparam_solineno"] =soLineno;
		var whlocation = request.getParameter('custparam_whlocation');
		var enterLot=request.getParameter('txtlot');
		SOarray["custparam_enterLot"] = enterLot;
		nlapiLogExecution('DEBUG', 'enterLot', enterLot);
		var FetchedItemId = request.getParameter('hdnEnteredItem');
		var context = nlapiGetContext();
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;
		var userAccountId = context.getCompany();


		if (sessionobj!=context.getUser()) 
		{
			try
			{
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){

					var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
					SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;

					if(request.getParameter('cmdEnbNextList')=="Next")
					{
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))+1;						
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET',  'customscript_wmsse_multiord_lotscan', 
								'customdeploy_wmsse_multiord_lotscan', false, SOarray);
						return;
					}
					if(request.getParameter('cmdEnbPrevList')=="Prev")
					{
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))-1;						
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET',  'customscript_wmsse_multiord_lotscan', 
								'customdeploy_wmsse_multiord_lotscan', false, SOarray);
						return;
					}
					SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'));
					var isFromStatusChange = request.getParameter('hdnfromstatuschange');
					nlapiLogExecution('DEBUG', 'isFromStatusChange', isFromStatusChange);
					if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && 
							isFromStatusChange != undefined && isFromStatusChange=='T' )
					{
						SOarray["custparam_pagecount"]=0;
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_error"] = '';
						response.sendRedirect('SUITELET',  'customscript_wmsse_multiord_lotscan', 
								'customdeploy_wmsse_multiord_lotscan', false, SOarray);
						return;
					}

					if(enterLot!=null && enterLot!="" && enterLot!='null')
					{
						//if inventory status feature is enabled
						var inventoryStatusFeature = isInvStatusFeatureEnabled();
						var systemRule_AllowExpiredItems='';
						systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',whlocation);
						nlapiLogExecution("DEBUG","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);
						var objBinDetails = null;
						try{
							var binInternalId=request.getParameter('hdnEnteredBinId');

							if(inventoryStatusFeature == true)
							{
								var eneteredLotId = inventoryNumberInternalId(enterLot,whlocation,FetchedItemId);
								nlapiLogExecution('Debug','eneteredLotId',eneteredLotId);
								if(eneteredLotId == null || eneteredLotId == '' || eneteredLotId == 'null'
									|| eneteredLotId == undefined || eneteredLotId == 'undefined')
								{
									SOarray["custparam_error"]='Please enter/scan valid lot#';
									response.sendRedirect('SUITELET',  'customscript_wmsse_multiord_lotscan', 
											'customdeploy_wmsse_multiord_lotscan', false, SOarray);
									return;
								}


								var invfilterStrat =  new Array();
								if(whlocation != null && whlocation != '')
									invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whlocation));
								if(FetchedItemId != null && FetchedItemId != '')
									invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
								if(binInternalId != null && binInternalId!= '')
									invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
								if(eneteredLotId != null && eneteredLotId!= '')
								{
									invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', eneteredLotId));		

									if(systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
									{
										invfilterStrat.push(new nlobjSearchFilter
												('formuladate',null, 'onorafter',DateStamp()).setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
									}
								}

								//loadsearch is not required here 
								objBinDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',
										invfilterStrat, null);

							}
							else
							{
								var filterStrat = new Array();

								if(binInternalId != null && binInternalId != '')
									filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
								filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
								filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
								filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', SOarray["custparam_whlocation"]));
								filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', enterLot));

								var columnStrat=new Array();
								columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
								columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
								columnStrat[0].setSort(true);

								objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
							}
							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('ERROR', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									if(inventoryStatusFeature == false)
									{
										//Case # 201413255 start
										var systemRule_AllowExpiredItems='';
										systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',SOarray["custparam_whlocation"]);
										nlapiLogExecution("Error","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);
										if(SOarray["custparam_trantype"]=='transferorder')
											var AllowAllLots = 'T';
										if((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '') && (AllowAllLots != 'T'))
										{
											var filtersExp = new Array();
											if (FetchedItemId != null && FetchedItemId != ""){
												filtersExp.push(new nlobjSearchFilter('internalid', null, 'anyof', FetchedItemId));		 
											}
											if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] != '' && SOarray["custparam_whlocation"] != 'null')
												filtersExp.push(new nlobjSearchFilter('location', 'inventorynumber', 'anyof', SOarray["custparam_whlocation"]));


											nlapiLogExecution("DEBUG","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);
											filtersExp.push(new nlobjSearchFilter('formuladate',null, 'onorafter',DateStamp()).setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
											filtersExp.push(new nlobjSearchFilter('inventorynumber','inventorynumber', 'is', enterLot));


											var columnsExp = new Array(); 
											var searchresultsExp = nlapiSearchRecord('item', 'customsearch_wmsse_expdate_lots', filtersExp, columnsExp);

											if(searchresultsExp == null || searchresultsExp == '' )
											{
												SOarray["custparam_error"] = 'Expiry date for the given lot is less than current date';
												response.sendRedirect('SUITELET',  'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
												return;
											}
										}
										//Case # 201413255 end

										var availableQty=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
										var vinventorynumber=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');
										nlapiLogExecution('DEBUG', 'availableQt,vinventorynumber', availableQty+","+vinventorynumber);
										var lotInternalID = '';
										if(vinventorynumber != enterLot)
										{
											SOarray["custparam_error"] = 'Invalid lot';
											response.sendRedirect('SUITELET',  'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
											return;
										}
										else
										{
											lotInternalID = objBinDetails[0].getValue('inventorynumber','inventoryNumberBinOnHand');
											SOarray["custparam_enterlotid"] =lotInternalID;
										}

										var vOpenPickDetails=getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,
												SOarray["custparam_whlocation"],objBinDetails[0].getValue('unitstype'),objBinDetails[0].getText('stockunit'));
										var vOpenPickQty=0;
										var vBinOpenTaskBinQtyArr = "";
										var vBinOpenTaskLotArr = "";
										if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
										{
											vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
											vBinOpenTaskLotArr = vOpenPickDetails[3];
											if(vBinOpenTaskLotArr.indexOf(enterLot) != -1)
												vOpenPickQty = vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(enterLot)];
										}
										if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
											vOpenPickQty =0;


										vOpenPickQty=new Big(vOpenPickQty);
										availableQty=new Big(availableQty);
										availableQty = Number(availableQty.minus(vOpenPickQty));

										nlapiLogExecution('DEBUG', 'availableQty', availableQty);
										if(parseFloat(availableQty) <= 0)
										{
											SOarray["custparam_error"] = 'Insufficient inventory for this lot#';
											response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
											return;
										}


										availableQty=new Big(availableQty);
										getStockConversionRate=new Big(getStockConversionRate);
										var BigavailableQty = Number(availableQty.mul(getStockConversionRate));
										nlapiLogExecution('DEBUG', 'BigavailableQty', BigavailableQty);
										SOarray["custparam_itembinqty"] =BigavailableQty;
										SOarray["custparam_enterlot"] =enterLot;									
										SOarray["custparam_error"] ='';
										var BigavailableQty=null;
										response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
										return;
									}
									else
									{

										var availableQty=0;
										for(var binItr = 0;binItr < objBinDetails.length;binItr++)
										{
											var availQty=objBinDetails[binItr].getValue('available',null,'sum');											
											availableQty=new Big(availableQty);
											availQty=new Big(availQty);
											availableQty = Number(availableQty.plus(availQty));

											nlapiLogExecution('DEBUG', 'availableQty1 in Big',availableQty);
										}
										var vinventorynumber=objBinDetails[0].getText('inventorynumber',null,'group');
										nlapiLogExecution('DEBUG', 'availableQt,vinventorynumber', availableQty+","+vinventorynumber);
										var lotInternalID = '';
										if(vinventorynumber != enterLot)
										{
											SOarray["custparam_error"] = 'Invalid lot';
											response.sendRedirect('SUITELET',  'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
											return;
										}
										else
										{
											lotInternalID = objBinDetails[0].getValue('inventorynumber',null,'group');
											SOarray["custparam_enterlotid"] =lotInternalID;
										}

										var vOpenPickDetails=getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,
												SOarray["custparam_whlocation"],unitsType,stockUnit);
										var vOpenPickQty=0;
										var vBinOpenTaskBinQtyArr = "";
										var vBinOpenTaskLotArr = "";
										if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
										{
											vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
											vBinOpenTaskLotArr = vOpenPickDetails[3];
											if(vBinOpenTaskLotArr.indexOf(enterLot) != -1)
												vOpenPickQty = vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(enterLot)];
										}
										if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
											vOpenPickQty =0;
										nlapiLogExecution('DEBUG', 'availableQty,vOpenPickQty', availableQty+","+vOpenPickQty);

										availableQty=new Big(availableQty);
										vOpenPickQty=new Big(vOpenPickQty);
										availableQty = Number(availableQty.minus(vOpenPickQty));
										nlapiLogExecution('DEBUG', 'availableQty', availableQty);
										if(parseFloat(availableQty) <= 0)
										{
											SOarray["custparam_error"] = 'Insufficient inventory for this lot#';
											response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
											return;
										}


										availableQty=new Big(availableQty);
										getStockConversionRate=new Big(getStockConversionRate);
										var BigavailableQty = Number(availableQty.mul(getStockConversionRate));
										nlapiLogExecution('ERROR', 'DEBUG in Big', BigavailableQty);

										SOarray["custparam_itembinqty"] =BigavailableQty;
										SOarray["custparam_enterlot"] =enterLot;									
										SOarray["custparam_error"] ='';
										var BigavailableQty=null;
										response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
										return;
									}

								}
								else
								{
									objBinDetails='';
								}
							}
							if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' ||
									objBinDetails.length < 1)
							{
								SOarray["custparam_error"] = 'Please enter/scan valid lot#';
								response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
								return;
							} 

						}				
						catch(e)
						{
							nlapiLogExecution('ERROR', 'inside catch exception', e);

							if ( e instanceof nlobjError )
							{
								SOarray["custparam_error"]=e.getDetails();
								nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
							}
							else
							{
								SOarray["custparam_error"]=e.toString();
								nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
							}

							response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
							return;
						}

					}
					else
					{
						SOarray["custparam_error"] = 'Please enter/scan valid lot#';
						response.sendRedirect('SUITELET','customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
						return;
					}
				} 
				else {
					SOarray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
				}
			}
			catch (e) 
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

				if ( e instanceof nlobjError )
				{
					SOarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					SOarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}

				response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			SOarray["custparam_error"] = 'Transaction is in progress...';
			response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
		}
	} //end of first if condition
} //end of function.
