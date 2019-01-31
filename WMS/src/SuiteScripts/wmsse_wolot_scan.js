/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function WorkOrderLotScan(request, response)
{
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';

		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getWONo = request.getParameter('custparam_woid');	

		var uomqtyselected = request.getParameter('custparam_uomqtyselected');

		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');		
		var whCompany= request.getParameter('custparam_company');
		var getWONo = request.getParameter('custparam_woid');
		var getWOItem = request.getParameter('custparam_woitem');		
		var getWOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getWOInternalId = request.getParameter('custparam_wointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var vUnits = request.getParameter("custparam_uom"); 
		var vUnitsText = request.getParameter("custparam_uomtext"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate'); 
		var VUnitType = request.getParameter('custparam_itemunitstype');
		var blnItemUnit = request.getParameter('custparam_itemunits');
		var binInternalId = request.getParameter('custparam_binInternalId');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}				

		if(vUnits == '- None -' || vUnits == '' || vUnits == null || vUnits == 'null')
			vUnits ='';
		if(vUnitsText == '- None -' || vUnitsText == '' || vUnitsText == null || vUnitsText == 'null')
			vUnitsText ='';

		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		var uomresults= new Array();
		var results='';
		var JSSurl ='';
		var getStockConversionRate =1;
		if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
		{
			getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
		}

		if(VUnitType != null && VUnitType != '' && VUnitType != 'null' && VUnitType != 'undefined')
		{
			results= getUnitsType(VUnitType);
			if(results != null && results != '' && results != 'null' && results != 'undefined')
			{
				for(var uomItr=0; uomItr < results.length; uomItr++)
				{
					var UOMText =results[uomItr].getValue('unitname');
					var vQty = results[uomItr].getValue('conversionrate');
					var row = [UOMText+"_"+vQty];
					uomresults.push(row);
				}
			}

			var imgfilefound1=  getLoadFile('Plus.png');
			if(imgfilefound1)
			{
				addbtnimgUrl = imgfilefound1.getURL();
			}


			var imgfilefound2 =  getLoadFile('minus.png');
			if(imgfilefound2)
			{
				delbtnimgUrl = imgfilefound2.getURL();
			}


		}
		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();			
		}
		// paging
		var vPageCount = request.getParameter('custparam_pagecount');

		if(vPageCount == null || vPageCount == '' || vPageCount == 'null' || vPageCount == 'undefined')
		{
			vPageCount = 0;
		}

		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');

		if(makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == '' || makeInvAvailFlagFromSelect == 'null' || 
				makeInvAvailFlagFromSelect == 'undefined')
			makeInvAvailFlagFromSelect ='T';

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		var domainName = fndomainName();

		var st0 = domainName + '-Picking Work Order';
		var getPreferBin=request.getParameter('custparam_preferbin');
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}

		var binInternalId=nswms_GetBinInternalId(enterBin,whLocation);
		var objBinDetails = fnGetPickBinDetailsLotWithExpiryDates(getItemInternalId,binInternalId,'',whLocation,vPageCount,
				makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate);
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
		if(itemresults!=null && itemresults!='')
		{
			getWOItem = itemresults[0].getValue('itemid');
		}
		var vStageScanRequired="F";		 

		vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',whLocation,'4');		

		if(vStageScanRequired!=null && vStageScanRequired!='')
		{ 
			vStageScanRequired="T";			 
		}
		else
		{
			vStageScanRequired="F";
		}

		var str='getOptedField :'+getOptedField+ '<br>';
		str=str + 'getWONo :'+getWONo+ '<br>';
		str=str + 'uomqtyselected:'+uomqtyselected+ '<br>';
		str=str + 'whLocation:'+whLocation+ '<br>';
		str=str + 'getWOItem:'+getWOItem+ '<br>';
		str=str + 'inventoryStatusFeature:'+inventoryStatusFeature+ '<br>';	
		str=str + 'vStageScanRequired:'+vStageScanRequired+ '<br>';	
		nlapiLogExecution('Debug', 'WOlot Get ', str);

		var ordVar = "Work Order#";
		if(getItemRecQty == "" || getItemRecQty =="null" || getItemRecQty == null)
		{
			getItemRecQty =0;
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

		// UOM dropdown change
		var qtyUomCntrlSelectedConversionRate =vConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}

		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item');
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";
		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		html = html + "<script type='text/javascript'>function validateForm(){var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtlot').value; var vLotWhiteSpace = lotVal.indexOf(' ') >= 0; if(document.getElementById('txtlot').value == '' ){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;} else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html + "<script type='text/javascript'>function validateLot(enterlot){document.getElementById('txtlot').value = enterlot ;document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = ''; return true;}</script>";
		//This function is to validate the form when Bin link is clicked.
		html = html + "	<script type='text/javascript'>function fnShowLoader() {" +
		"document.getElementById('loading').style.display = 'block';}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		//	html = html + "</head><body>"+

		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+	
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking - Lot#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getWONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWoInternalId' value=" + getWOInternalId + ">"+
		"				<input type='hidden' name='hdnWoLineno' value=" + getWOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnbinInternalId' value=" + binInternalId + ">"+																		  
		"				<input type='hidden' name='hdnWoItem' value='" + getWOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuomtext' value=" + vUnitsText + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' value='" + uomqtyselected + "'>"+
		"				<input type='hidden' name='hdnvStageScanRequired' value='" +vStageScanRequired+"'>"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnPageCount' id='hdnPageCount' value=" + vPageCount + ">"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdnStageflag'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr><td align='left' class='labelmsg'>Item: <label>" + getWOItem + "</label></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Entered Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + getItemRecQty +" " +vUnitsText+ "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + getItemRemQty +" " +vUnitsText+ "</label>"+
		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";
		html = html +"	<td align = 'left'><input name='txtlot'  class='smalltextbox'  id='txtlot' type='text'/>";

		html = html +"				</td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/>"+
		"			</tr>";
		if(vStageScanRequired == "T")
		{
			html = html +"	<tr><td>	<input name='cmdStage' type='submit' value='Pick & Stage' onclick='this.form.hdnStageflag.value=this.value;return validateForm();'/></td><td colspan='2'></td></tr>";

		}
		html = html +"		 </table>";

		// Implemented UOM and Itemstatus dropdowns
		if(objBinDetails !=null && objBinDetails != '' && objBinDetails.length !=null || 
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{		
			html = html + 	" <tr ><td ><table  class='uomstatus-gridgap' >";			
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
			//Inventorystatus Feature is enabled
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

				for(var uomItr=0; uomItr < results.length; uomItr++)
				{                    	 
					var vUOM = results[uomItr].getValue('conversionrate');
					var UOMText =results[uomItr].getValue('unitname');				
					if(( selectedUOM == null || selectedUOM == '' || selectedUOM =='null' || selectedUOM =='undefined' || selectedUOM == undefined && vConversionRate == vUOM )|| (selectedUOM == vUOM))
					{
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

			//Inventorystatus Feature is enabled
			if(inventoryStatusFeature == true)
			{
				var statusOptsArr = getStatusOptions();
				html = html +"<td ><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
				if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
				{
					for(var statusItr=0; statusItr < statusOptsArr.length; statusItr++)
					{                    	 
						var Statusval = statusOptsArr[statusItr][0];
						var StatusText =statusOptsArr[statusItr][1];
						if(makeInvAvailFlagFromSelect == Statusval)
						{
							html = html +" <option   selected  value="+Statusval+"> "+StatusText+"</option>";

						}
						else
						{
							html = html +" <option     value="+Statusval+"> "+StatusText+"</option>";
						}

					}
				}
				html=html+"</select></td></tr>";
			}

			html = html +"</table></td></tr>" ;

			html=html+" <tr>"+
			" <td>"+
			"	<table style='border-spacing: 0;' id='tblqtyUOM'>"+
			" <tr class='uir-machine-headerrow' colspan='3'>"+


			" <td>Lot#"+
			" </td>"+	
			" <td class='align-right'>Qty"+
			" </td>"+
			" <td></td>";
			//Inventorystatus Feature is enabled
			if(inventoryStatusFeature == true)
			{				
				html = html +"				<td  class='status-rw-display'>Inv Status ";
				html = html +"				</td>";
				html = html +"				<td></td>";
			}
			html = html +" <td>Expiry Date"+
			" </td>"+
			"</tr>";

			var count = 0;
			var convRate = getStockConversionRate;
			var selectedUOM = request.getParameter('custparam_uomprevselected');
			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
			{
				convRate = parseFloat(getStockConversionRate)/parseFloat(selectedUOM);
			}

			for (var s = 0; s < objBinDetails.length && s < 5; s++) 
			{
				count  = parseInt(count)+1;
				if(s%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var lotDetails = objBinDetails[s];
				var vitemLotQty = lotDetails[1];
				var vitemLot = lotDetails[3];
				var vitemLotExp = lotDetails[4];
				var vitemLotstatus= lotDetails[5];
				var binAvailQty =Big(vitemLotQty).mul(convRate);
				html = html + "	<tr class='" + vAltClass + "'>"+
				" <td><a href='#' onclick='return validateLot(\""+vitemLot+"\");' >"+vitemLot+" </a></td>"+
				" <td class='align-right'> "+parseFloat(parseFloat(binAvailQty).toFixed(8))+"</td>"+
				" <td></td>";
				//Inventorystatus Feature is enabled
				if(inventoryStatusFeature == true)
				{					
					html = html +"				<td  class='status-cl-display'>"+vitemLotstatus+"";	
					html = html +"				</td>";
					html = html +"				<td></td>";
				}
				html = html +" <td> "+vitemLotExp+"</td>"+
				"</tr>";
				if(count >=5)
					break;
			}
			html = html + 	"</td></tr></table>";

			html = html +"		<table>	<tr>";			
			if(vPageCount>0)
			{
				html = html +"				<td align = 'left'><input name='cmdEnbPrevList' type='submit' value='Prev' onClick = 'return fnShowLoader();'/></td>";
			}
			else
			{
				html = html +"				<td >&nbsp;</td><td >&nbsp;</td>";
			}

			if(objBinDetails.length>5 )
			{
				html = html +"				<td align = 'right'><input name='cmdEnbNextList' type='submit' value='Next' onClick = 'return fnShowLoader();'/></td>";
			}
			html = html +"			</tr>"+ 
			"		 </table>";

		}

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
	else 
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array WOarray
		var WOarray = new Array();
		var tempflag='F';
		var enterLot=request.getParameter('txtlot');
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		var cmdStage = request.getParameter('hdnStageflag');
		WOarray["custparam_woid"] = request.getParameter('custparam_woid');
		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		WOarray["custparam_option"] = request.getParameter('hdnOptedField');
		WOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		WOarray["custparam_wointernalid"] = request.getParameter('hdnWoInternalId');
		WOarray["custparam_lineno"] = request.getParameter('hdnWoLineno');
		WOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		WOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		WOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		WOarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		//WOarray["custparam_woitem"] = request.getParameter('hdnWoItem');
		//WOarray["custparam_woitem"] = request.getParameter('custparam_woitem');
		WOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		WOarray["custparam_enterQty"] = request.getParameter('custparam_enterQty');
		WOarray["custparam_enterBin"] = request.getParameter('custparam_enterBin');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		WOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		WOarray["custparam_uom"] = request.getParameter('hdnuom');
		WOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		WOarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		WOarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		WOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		WOarray["custparam_uomtext"] = request.getParameter('hdnuomtext');
		WOarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		WOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var trantype=request.getParameter('hdntrantype');
		var whLocation =request.getParameter('hdnWhLocation');
		var remQty=request.getParameter('hdnItemRemQty');
		var woInternalId=request.getParameter('hdnWoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var woLineno=request.getParameter('hdnWoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		var binInternalId = request.getParameter('hdnbinInternalId');										   
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button

		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');
		var logMsg = 'WO = ' + WOarray["custparam_woid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'woInternalId = ' + woInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'woLineno = ' + woLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'cmdStage = ' + cmdStage + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - Lot', logMsg);
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');


				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)')
				{
					// Inventory status change 
					WOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;

					WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'));
					var isFromStatusChange = request.getParameter('hdnfromstatuschange');

					if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && isFromStatusChange != undefined && isFromStatusChange=='T' )
					{
						WOarray["custparam_pagecount"]=0;
						WOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						WOarray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
						return;

					}
					// Next button
					if(request.getParameter('cmdEnbNextList')=="Next")
					{
						WOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))+1;						
						WOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
						return;
					}
					// Prev button
					if(request.getParameter('cmdEnbPrevList')=="Prev")
					{
						WOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))-1;						
						WOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
						return;
					}
					//Check Inventorystatus Feature is turn on/off
					var inventoryStatusFeature = isInvStatusFeatureEnabled();
					var selectedStatus =''; 
					var objBinStatusDetails =null;

					if(enterLot!=null && enterLot!="" && enterLot!='null')
					{
						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
						//itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						/*itemfilters.push(new nlobjSearchFilter('location','binnumber','anyof',['@NONE@',whLocation]));*/
						if(whLocation != null && whLocation !='' && whLocation != null)
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
						}
						//itemfilters.push(new nlobjSearchFilter('preferredbin', null, 'is', 'T'));
						var itemcolumns= new Array();

						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_woqty_item_srh', itemfilters, itemcolumns);							

						if(itemresults == null || itemresults == '' || itemresults == 'null')
						{
							WOarray["custparam_error"] = 'Entered item is inactive';
							response.sendRedirect('SUITELET',  'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
							return;
						}

						try{
							var lotInternalId = '';

							var filterStrat = new Array();
							if(binInternalId == null || binInternalId == '' || binInternalId == 'null' || binInternalId == undefined)
							{
								binInternalId=nswms_GetBinInternalId(enterBin,whLocation);
							}
							var selectedStatus = '';
							var vStatusDetails = new Array();
							if(inventoryStatusFeature == false)
							{
								if(binInternalId != null && binInternalId != '')
									filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
								filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
								filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
								filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', WOarray["custparam_whlocation"]));
								filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', enterLot));

								var columnStrat=new Array();
								columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
								columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
								columnStrat[0].setSort(true);

								//var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_getinv_bin_recv_lot',filterStrat, null);
								var objBinDetails = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
								//nlapiLogExecution('ERROR', 'objBinDetails', objBinDetails.length);
								if(objBinDetails != null && objBinDetails != '' && objBinDetails != 'null' && objBinDetails != 'undefined')
								{

									lotInternalId = objBinDetails[0].getValue('inventorynumber','inventoryNumberBinOnHand');
								}
							}



							//Inventorystatus Feature is enabled
							if(inventoryStatusFeature == true)
							{

								var lotInternalId = inventoryNumberInternalId(enterLot,WOarray["custparam_whlocation"],FetchedItemId);

								if(lotInternalId == null || lotInternalId == '' || lotInternalId == 'null'
									|| lotInternalId == undefined || lotInternalId == 'undefined')
								{
									WOarray["custparam_error"]='Enter/Scan valid lot.';
									response.sendRedirect('SUITELET',  'customscript_wmsse_wo_lotscan', 
											'customdeploy_wmsse_wo_lotscan', false, WOarray);
									return;
								}

								var invfilterStrat =  new Array();
								if(WOarray["custparam_whlocation"] != null && WOarray["custparam_whlocation"] != '')
									invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', WOarray["custparam_whlocation"]));
								if(FetchedItemId != null && FetchedItemId != '')
									invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
								if(binInternalId!= null && binInternalId!= '')
									invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
								if(lotInternalId != null && lotInternalId != '')
									invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', lotInternalId));
								//   No need to fetch 4k records so used searchrecord
								objBinDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);

								if(objBinDetails != null && objBinDetails != '' && objBinDetails != 'null'
									&& objBinDetails != 'undefined' && objBinDetails != undefined && objBinDetails.length > 0)
								{
									WOarray["custparam_enteredBinID"]=binInternalId;
									WOarray["custparam_enteredbin"]=enterBin;
									WOarray["custparam_enteredqty"]=enterQty;
									WOarray["custparam_enteredlot"]=lotInternalId;

									if(objBinDetails.length > 1)
									{
										/*if(request.getParameter('hdnStageflag') == 'Pick & Stage')
										{
											WOarray["custparam_hdnCloseflag"]='Pick And Stage';
										}
										response.sendRedirect('SUITELET', 'customscript_wmsse_wopicking_status', 'customdeploy_wmsse_wopicking_status', false, WOarray);
										return;  */
									}
									else
									{
										selectedStatus = objBinDetails[0].getValue('status',null,'group');
										WOarray["custparam_inventorystatus"]=selectedStatus;
									}
								}

							}				


							if(objBinDetails!=null && objBinDetails!='')
							{

								if(objBinDetails.length>0)
								{


									//Case # 201413255 start
									var systemRule_AllowExpiredItems=' ';
									systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',WOarray["custparam_whlocation"]);

									if(systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
									{
										var filtersExp = new Array();
										if (FetchedItemId != null && FetchedItemId != ""){
											filtersExp.push(new nlobjSearchFilter('internalid', null, 'anyof', FetchedItemId));		 
										}
										if(WOarray["custparam_whlocation"] != null && WOarray["custparam_whlocation"] != '' && WOarray["custparam_whlocation"] != 'null')
											filtersExp.push(new nlobjSearchFilter('location', 'inventorynumber', 'anyof', WOarray["custparam_whlocation"]));


										//filtersExp.push(new nlobjSearchFilter('expirationdate','inventorynumber', 'onorafter', DateStamp()));
										filtersExp.push(new nlobjSearchFilter('formuladate',null, 'onorafter',DateStamp()).setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
										filtersExp.push(new nlobjSearchFilter('inventorynumber','inventorynumber', 'is', enterLot));


										var columnsExp = new Array(); 
										var searchresultsExp = nlapiSearchRecord('item', 'customsearch_wmsse_expdate_lots', filtersExp, columnsExp);

										if(searchresultsExp == null || searchresultsExp == '' )
										{
											WOarray["custparam_error"] = 'Expiry date for the given lot is less than current date';
											response.sendRedirect('SUITELET',  'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
											return;
										}
									}
									//Case # 201413255 end
									var vOpenPickDetails=getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,WOarray["custparam_whlocation"],vUnitType,
											StockUnitText,'',selectedStatus);
									var vOpenPickQty=0;
									var vBinOpenTaskBinQtyArr = "";
									var vBinOpenTaskLotArr = "";
									var availableQty=0;
									if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
									{
										vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
										vBinOpenTaskLotArr = vOpenPickDetails[3];
										if(vBinOpenTaskLotArr.indexOf(enterLot) != -1)
											vOpenPickQty = vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(enterLot)];
									}
									if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
										vOpenPickQty =0;


									if(inventoryStatusFeature == true)
									{
										for(var binItr = 0;binItr < objBinDetails.length;binItr++)
										{
											var availQty=objBinDetails[binItr].getValue('available',null,'sum');
											availableQty = Number(Big(availableQty).plus(availQty));

										}	
										var vinventorynumber=objBinDetails[0].getText('inventorynumber',null,'group');
									}


									if(inventoryStatusFeature == false)
									{
										var availableQty=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
										var vinventorynumber=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');
									}


									availableQty = Number(Big(availableQty).minus(vOpenPickQty));

									nlapiLogExecution('Debug', 'enterQty,availableQt,vinventorynumber', enterQty+","+availableQty+","+vinventorynumber);
									if(vinventorynumber != enterLot)
									{
										WOarray["custparam_error"] = 'Invalid lot';
										response.sendRedirect('SUITELET',  'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
										return;
									}

									if(Number(enterQty) > (Number(Big(availableQty).mul(getStockConversionRate))))
									{
										WOarray["custparam_error"] = 'Insufficient inventory for this lot#: '+enterLot;
										response.sendRedirect('SUITELET',  'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
										return;
									}


								}
								else
								{
									objBinDetails='';
								}

								if(inventoryStatusFeature == true)
								{
									vStatusDetails = getInvStatusDetails(objBinDetails,vOpenPickDetails,enterLot,vStatusDetails);


									if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' &&
											vStatusDetails != 'undefined' && vStatusDetails != undefined && vStatusDetails.length >0)
									{

										if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' &&
												vStatusDetails != 'undefined' && vStatusDetails != undefined &&
												vStatusDetails.length != null && vStatusDetails.length == 1)
										{

											selectedStatus = vStatusDetails[0];
											WOarray["custparam_inventorystatus"]=selectedStatus;


										}
										else
										{

											if(request.getParameter('hdnStageflag') == 'Pick & Stage')
											{
												WOarray["custparam_hdnCloseflag"]='Pick And Stage';
											}
											response.sendRedirect('SUITELET', 'customscript_wmsse_wopicking_status', 'customdeploy_wmsse_wopicking_status', false, WOarray);
											return; 
										}

									}
								}
							}

							if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' ||objBinDetails.length == null)
							{
								WOarray["custparam_error"] = 'Please enter/scan valid lot#' ;
								response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
								return;
							}

							var toBinInternalId =fnGetWIPBinDetails(WOarray["custparam_whlocation"]);

							if(toBinInternalId=='' || toBinInternalId==null)
							{
								WOarray["custparam_error"] = 'Please configure wip location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
								return;
							}



							var woLineDetails = getWOLineDetailsNew(WOarray["custparam_woid"],WOarray["custparam_whlocation"],FetchedItemId,woLineno);
							if(woLineDetails !=null && woLineDetails!="")
							{
								nlapiLogExecution('Debug', 'woLineDetails.length', woLineDetails.length);
								if(woLineDetails.length>0)
								{
									var totalpickQtyIndex =7;
									var comittedQtyIndex =15;
									var builtQtyIndex =16;
									var unitsIndex =14;
									var coversionRateIndex =17;
									var vColumnslist=woLineDetails[0].getAllColumns();
									for(var x1=0;x1<vColumnslist.length;x1++)
									{
										var summaryLabel = vColumnslist[x1].getLabel();
										var name = vColumnslist[x1].getName();

										if(name == 'unit')
										{
											unitsIndex =x1;
										}
										else if(summaryLabel == 'Committed Quantity')
										{
											comittedQtyIndex = x1;
										}
										else if(summaryLabel == 'Built Quantity')
										{
											builtQtyIndex = x1;
										}
										else if(summaryLabel == 'Conversion Rate')
										{
											coversionRateIndex = x1;
										}
										else
										{

										}
									}
									var isItemFound = false;
									for(var cnt=0;cnt<woLineDetails.length;cnt++)
									{
										var vwoitemQty = woLineDetails[cnt].getValue('quantity');
										var itemCommitedQty=woLineDetails[cnt].getValue(vColumnslist[comittedQtyIndex]);
										var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);

										var opentaskDetails=getopentaskDetailsforSku(WOarray["custparam_wointernalid"],woLineno,FetchedItemId,selectedStatus);

										var itemPickedQty = opentaskDetails[0].getValue('custrecord_wmsse_act_qty',null,'sum');

										if(itemPickedQty==null || itemPickedQty=='' || itemPickedQty =='null' || itemPickedQty =='undefined')
										{
											itemPickedQty = 0;
										}

										//if(itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
										if(itemType == 'noninventoryitem' || itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || itemType=='giftcertificateitem' 
											||itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
										{
											itemCommitedQty=woLineDetails[cnt].getValue('quantity');
										}

										if(vwoitemRcvQty == null || vwoitemRcvQty =='')
											vwoitemRcvQty = 0;
										//if(itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
										if(itemType == 'noninventoryitem' || itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || itemType=='giftcertificateitem' 
											|| itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
										{
											var itemRemQty=Big(itemCommitedQty).minus(itemPickedQty);
										}
										else
										{
											itemCommitedQty=new Big(itemCommitedQty);
											vwoitemRcvQty=new Big(vwoitemRcvQty);

											var itemRemQty=((itemCommitedQty).plus(vwoitemRcvQty)).minus(itemPickedQty);
										}
										nlapiLogExecution('Debug', 'itemRemQty', itemRemQty);

										var vwoitem = woLineDetails[cnt].getValue('item');
										var vwoitemline = woLineDetails[cnt].getValue('line');
										if((parseFloat(itemRemQty)>0) && (vwoitem == FetchedItemId) && (woLineno == vwoitemline))
										{
											isItemFound = true;
											if(vStageScanRequired == "T")
											{
												toBinInternalId=binInternalId;
											}



											var id = updateOpenTaskWO(woInternalId,FetchedItemId,woLineno,Number(Big(enterQty).toFixed(8)),toBinInternalId,itemType,
													WOarray["custparam_whlocation"],enterLot,'','','',woInternalId,null,null,null,'PICK','','','','','workorder',
													WOarray["custparam_actualbegintime"],'','','','','','',binInternalId,WOarray["custparam_uom"],
													WOarray["custparam_conversionrate"],'','','',selectedStatus); 
											nlapiLogExecution('ERROR', 'opentaskid', id);	

											try
											{
												if(vStageScanRequired == "F")
												{



													var binTransferId = inventoryBinTransfer(itemType,WOarray["custparam_whlocation"],FetchedItemId,
															Number((Big(enterQty).mul(WOarray["custparam_conversionrate"])).toFixed(8)),binInternalId,toBinInternalId,
															enterLot,'','','','',selectedStatus,selectedStatus);

													if(binTransferId != null && binTransferId != '' && id != null && id != '')
													{
														var fields = new Array();
														var values = new Array();
														fields[0] = 'custrecord_wmsse_nstrn_ref_no';
														values[0] = binTransferId;

														var updOpenTaskRecordId=nlapiSubmitField('customrecord_wmsse_trn_opentask', id, fields, values);
													}
													break;
												}
												//response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
												//return;


											}				
											catch(e)
											{
												nlapiLogExecution('ERROR', 'inside catch exception', e);

												if ( e instanceof nlobjError )
												{
													WOarray["custparam_error"]=e.getDetails();
													nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
												}
												else
												{
													WOarray["custparam_error"]=e.toString();
													nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
												}

												response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
												return;
											}

										}

									}
									if(isItemFound == false)
									{
										WOarray["custparam_error"] ='Scanned qty is greater than remaining qty';
										response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
										return;
									}
								}
							}
							else
							{
								WOarray["custparam_error"] = 'Entered item is deleted from the order';
								response.sendRedirect('SUITELET',  'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
								return;
							}

							//var woLineDetails = getWOLineDetails(WOarray["custparam_woid"],WOarray["custparam_whlocation"]);
							var woLineDetails = getWOLineDetailsNew(WOarray["custparam_woid"],WOarray["custparam_whlocation"],null,null);
							var cmdStage = request.getParameter('cmdStage');

							if(woLineDetails !=null && woLineDetails!=""  && cmdStage != 'Pick & Stage')
							{
								nlapiLogExecution('Debug', 'woLineDetails.length', woLineDetails.length);
								if(woLineDetails.length>0)
								{
									var vColumnslist=woLineDetails[0].getAllColumns();

									var totalpickQtyIndex =7;
									var comittedQtyIndex =15;
									var builtQtyIndex =16;
									var unitsIndex =14;
									var coversionRateIndex =17;
									var totalWOQty = 0;
									for(var x1=0;x1<vColumnslist.length;x1++)
									{
										var summaryLabel = vColumnslist[x1].getLabel();
										var name = vColumnslist[x1].getName();

										if(name == 'unit')
										{
											unitsIndex =x1;
										}
										else if(summaryLabel == 'Committed Quantity')
										{
											comittedQtyIndex = x1;
										}
										else if(summaryLabel == 'Built Quantity')
										{
											builtQtyIndex = x1;
										}
										else if(summaryLabel == 'Conversion Rate')
										{
											coversionRateIndex = x1;
										}
										else
										{

										}
									}
									for(var cnt=0;cnt<woLineDetails.length;cnt++)
									{
										var vwoitemQty = woLineDetails[cnt].getValue('quantity');										
										var itemCommitedQty=woLineDetails[cnt].getValue(vColumnslist[comittedQtyIndex]);
										var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);
										var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);
										var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);
										var vLineItem = woLineDetails[cnt].getValue('item');

										var itemType= woLineDetails[cnt].getValue('type','item');

										if(vwoitemRcvQty == null || vwoitemRcvQty =='')
											vwoitemRcvQty = 0;
										//if(itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
										if(itemType == 'noninventoryitem' || itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || itemType=='giftcertificateitem' 
											||itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
										{
											//itemCommitedQty=woLineDetails[cnt].getValue('quantity',null,'sum');
											itemCommitedQty=woLineDetails[cnt].getValue('quantity');
										}
										if(itemCommitedQty == null || itemCommitedQty =='' || itemCommitedQty=='null')
										{
											itemCommitedQty=0;
										}

										totalWOQty=new Big(totalWOQty);
										itemCommitedQty=new Big(itemCommitedQty);
										vwoitemRcvQty=new Big(vwoitemRcvQty);

										totalWOQty = (totalWOQty).plus(itemCommitedQty).plus(vwoitemRcvQty);
										nlapiLogExecution('Debug', 'totalWOQty', totalWOQty); 


									}
									var pickedQty  = getopentaskDetails(WOarray["custparam_wointernalid"]); 
									if(pickedQty == '' || pickedQty == null || isNaN(pickedQty))
									{
										pickedQty = 0;
									}


									var itemRemQty =Big(totalWOQty).minus(pickedQty);

									if((parseFloat(itemRemQty)>0))
									{	
										WOarray["custparam_error"] ='';
										response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
										return;
									}
									if(vStageScanRequired == "F")
									{	
										WOarray["custparam_error"] ='';
										response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
										return;
									}
									else
									{
										WOarray["custparam_error"] ='';
										response.sendRedirect('SUITELET', 'customscript_wmsse_wostage_scan', 'customdeploy_wmsse_wostage_scan', false, WOarray);
										return;
									}	



								}
								else
								{
									WOarray["custparam_error"] ='';
									response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
									return;

								}
							}
							else
							{
								WOarray["custparam_error"] =''; 
								if(vStageScanRequired == "T")
									response.sendRedirect('SUITELET', 'customscript_wmsse_wostage_scan', 'customdeploy_wmsse_wostage_scan', false, WOarray);
								else
									response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
								return;  

							}
						}				
						catch(e)
						{
							nlapiLogExecution('ERROR', 'inside catch exception', e);

							if ( e instanceof nlobjError )
							{
								WOarray["custparam_error"]=e.getDetails();
								nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
							}
							else
							{
								WOarray["custparam_error"]=e.toString();
								nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
							}

							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
							return;
						}

					}
					else
					{
						WOarray["custparam_error"] = 'Please enter/scan valid lot#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
						return;
					}
				} 
				else {
					WOarray["custparam_error"] = '';
					WOarray["custparam_uomqtyselected"] = '';
					response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
					return;
				}
			}
			catch (e) 
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

				if ( e instanceof nlobjError )
				{
					WOarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					WOarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}

				response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			WOarray["custparam_error"] = 'Transaction is in progress...';
			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
		}
	} //end of first if condition
} //end of function.

function nswms_ValidateLot(binInternalId,enterLot,FetchedItemId,whlocation)
{	
	var str='binInternalId :'+binInternalId+ '<br>';
	str=str + 'enterLot :'+enterLot+ '<br>';
	str=str + 'FetchedItemId:'+FetchedItemId+ '<br>';
	str=str + 'whlocation:'+whlocation+ '<br>';
	nlapiLogExecution('Debug', 'nswms_ValidateLot ', str);

	var enterLot1 =1;
	var itemfilters=new Array();
	itemfilters.push(new nlobjSearchFilter('item',null,'anyof',FetchedItemId));
	itemfilters.push(new nlobjSearchFilter('binnumber', null, 'anyof', binInternalId));
	itemfilters.push(new nlobjSearchFilter('inventorynumber',null,'is', enterLot1));

	var itemcolumns= new Array();
	//itemcolumns.push(new nlobjSearchColumn('preferredbin'));
	itemcolumns.push(new nlobjSearchColumn('itemid'));
	itemcolumns.push(new nlobjSearchColumn('binnumber'));
	//itemcolumns.push(new nlobjSearchColumn('name'));		
	var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);

	return itemresults;
}

function getWOLineDetails(wonumber,whLocation,itemID)
{
	nlapiLogExecution('Debug', 'sonumber,whLocation',wonumber+","+whLocation);

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
	//Case # 201416001  start
	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID));
	//Case # 201416001  end

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_fulfil_detail', filters, columns);


	return WOLineDetails;
}

function fnGetWIPBinDetails(strLocation)
{
	var wipBinId='';		
	var filterStrat = new Array(); 

	if(strLocation!= null && strLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', strLocation));
	var objBinDetails = new nlapiSearchRecord('bin','customsearch_wip_bindetails',filterStrat, null);
	if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0)
	{

		//for(var j=0;j<objBinDetails.length;j++)
		//{
		var vValidBin=objBinDetails[0].getValue('binnumber');
		var vValidBinId=objBinDetails[0].getId();

		wipBinId = vValidBinId;
		//}	
	} 

	return wipBinId;
}

function getWOLineDetailsNew(wonumber,whLocation,itemID,woLineno)
{
	nlapiLogExecution('Debug', 'sonumber,whLocation',wonumber+","+whLocation);

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 

	if(woLineno != null && woLineno != '')
		filters.push(new nlobjSearchFilter('line', null, 'equalto', woLineno)); 

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_item_srh', filters, columns);

	return WOLineDetails;
}

function getopentaskDetailsforSku(woInternalId,lineno,item,selectedStatus)
{
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	//opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));	
	if(lineno!=null && lineno!='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'equalto',lineno));	
	if(item!=null && item!='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof',item));
	if(selectedStatus!=null && selectedStatus!='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus',null,'anyof',selectedStatus));

	var opentaskColumns =  new Array();

	//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum'));

	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);


	return opentaskResults;
}

function getopentaskDetails(woInternalId)
{
	var pickQty = 0;
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); 
	opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

	var opentaskColumns =  new Array();

	//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum'));

	var opentaskResultsArray = new Array();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);

	if(opentaskResults !=null && opentaskResults !='')
	{

		for(var k=0;k<opentaskResults.length;k++)
		{

			pickQty = Number(Big(pickQty) .plus(opentaskResults[k].getValue('custrecord_wmsse_act_qty',null,'sum')));
		}
	}
	return pickQty;
}


function getInvStatusDetails(objBinStatusDetails,vOpenPickDetails,opentaskLotText,vStatusDetails)
{

	try
	{

		var str='objBinStatusDetails :'+objBinStatusDetails+ '<br>';
		str=str + 'vOpenPickDetails :'+vOpenPickDetails+ '<br>';
		str=str + 'opentaskLotText:'+opentaskLotText+ '<br>';
		str=str + 'vStatusDetails:'+vStatusDetails+ '<br>';
		nlapiLogExecution('Debug', 'getInvStatusDetails_Logs ', str);

		if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && objBinStatusDetails != 'undefined' && 
				objBinStatusDetails != undefined && objBinStatusDetails.length != null && objBinStatusDetails.length >0)
		{


			for(var stsItr=0;stsItr<objBinStatusDetails.length;stsItr++)
			{
				var	status = objBinStatusDetails[stsItr].getText('status',null,'group');					
				var	vBinQtyAvail=objBinStatusDetails[stsItr].getValue('available',null,'sum');				
				var	statusId = objBinStatusDetails[stsItr].getValue('status',null,'group');
				var	eneteredLotTxt = objBinStatusDetails[stsItr].getText('inventorynumber',null,'group');


				var openPickQty = 0;

				if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
				{

					var	vOpenPickQtyArr = vOpenPickDetails[1];
					var	vBinLotArr = vOpenPickDetails[3];
					var	vBinStatusArr = vOpenPickDetails[5];

					if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null'
						&& vBinStatusArr != 'undefined' && vBinStatusArr != undefined)
					{
						for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
						{
							var opentaskStatus = vBinStatusArr[binIterator];
							var opentaskLotText =vBinLotArr[binIterator];						
							if(opentaskStatus == statusId && eneteredLotTxt==opentaskLotText)
							{
								openPickQty = vOpenPickQtyArr[binIterator];
								break;
							}
						}
					}



				}

				vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);

				if(parseFloat(vBinQtyAvail) > 0)
				{
					vStatusDetails.push(statusId);
				}
				if(vStatusDetails.length >= 3)
				{
					break;
				}
			}

		}



		return vStatusDetails;

	}
	catch(e)
	{
		nlapiLogExecution('Debug','exception in getInvStatusDetails',e);
	}
}
