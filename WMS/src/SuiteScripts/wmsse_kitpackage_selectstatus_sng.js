
/***************************************************************************
  Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ****************************************************************************/
/**
 * Main function 
 */
function KitStatusScan(request, response)
{
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	if (request.getMethod() == 'GET') 
	{
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');
		var html = '';		
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var whCompany= request.getParameter('custparam_company');
		var getSONo = request.getParameter('custparam_soid');	
		var getSOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var getItemInternalId = request.getParameter('custparam_itemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getenteredQty = request.getParameter('custparam_enteredqty');
		var getItemId = request.getParameter('custparam_itemid');
		var getmemItemqty = request.getParameter('custparam_memitemqty');
		var getmemItempickedqty = request.getParameter('custparam_memitempickedqty');
		var componentItem  = request.getParameter('custparam_coitem');
		var getCarton = request.getParameter('custparam_carton');
		var getCartonSize = request.getParameter('custparam_cartonsize');
		var getCartonWeight = request.getParameter('custparam_cartonweight');
		var getCartonscreenValue = request.getParameter('custparam_cartonscreenrulevalue');
		var reminQty = getmemItemqty;
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var ordType = request.getParameter('custparam_ordtype');
		var getItemRemainingQty = request.getParameter('custparam_itemremainingquantity');
		var enteredBin = request.getParameter('custparam_enteredbin'); 
		var enteredQty = request.getParameter('custparam_enterQty'); 
		var eneteredBinId = request.getParameter('custparam_enteredBinID'); 
		var stageFlag = request.getParameter('custparam_hdnCloseflag'); 
		var vBaseUnit = request.getParameter('custparam_baseunit');
		var customer = request.getParameter('custparam_customer');
		var vUnitType = request.getParameter('custparam_memunittype');
		var StockUnitText = request.getParameter('custparam_memstockunit');
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate');
		var enteredLot = request.getParameter('custparam_enteredlot');
		var itemType=request.getParameter('custparam_itemtype');
		var orderLevel = request.getParameter('custparam_orderlevel');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var SOarray = new Array();
		SOarray["custparam_memunittype"] = vUnitType;
		SOarray["custparam_stockconversionrate"]=getStockConversionRate;
		SOarray["custparam_memstockunit"] = StockUnitText;
		SOarray["custparam_baseunit"] = vBaseUnit;
		SOarray["custparam_customer"] = customer;
		SOarray["custparam_option"] = request.getParameter('custparam_option');
		SOarray["custparam_customer"]=request.getParameter('custparam_customer');
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_trantype"]= request.getParameter('custparam_trantype');
		SOarray["custparam_company"]= request.getParameter('custparam_company');
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_lineno"] = request.getParameter('custparam_lineno');
		SOarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
		SOarray["custparam_sointernalid"] = request.getParameter('custparam_sointernalid');
		SOarray["custparam_itemid"] = request.getParameter('custparam_itemid');
		SOarray["custparam_rem_qty"]= request.getParameter('custparam_rem_qty');
		SOarray["custparam_rec_qty"] = request.getParameter('custparam_rec_qty');
		SOarray["custparam_enteredqty"] = request.getParameter('custparam_enteredqty');
		SOarray["custparam_itemid"] = request.getParameter('custparam_itemid');
		SOarray["custparam_memitemqty"] = request.getParameter('custparam_memitemqty');
		var memItemQtytoShow = request.getParameter('custparam_memitemqty');
		SOarray["custparam_memitempickedqty"] = request.getParameter('custparam_memitempickedqty');
		SOarray["custparam_coitem"]  = request.getParameter('custparam_coitem');
		SOarray["custparam_carton"] = request.getParameter('custparam_carton');
		SOarray["custparam_cartonsize"] = request.getParameter('custparam_cartonsize');
		SOarray["custparam_cartonweight"] = request.getParameter('custparam_cartonweight');
		SOarray["custparam_cartonscreenrulevalue"] = request.getParameter('custparam_cartonscreenrulevalue');
		SOarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		SOarray["custparam_pickreportid"]=request.getParameter('custparam_pickreportid');
		SOarray["custparam_actualbegintime"] = request.getParameter('custparam_actualbegintime');
		SOarray["custparam_ordtype"] = request.getParameter('custparam_ordtype');				
		SOarray["custparam_department"] = request.getParameter('custparam_department');
		SOarray["custparam_class"] = request.getParameter('custparam_class');
		SOarray["custparam_picktype"]= request.getParameter('custparam_picktype');
		SOarray["custparam_itemremainingquantity"] = getItemRemainingQty;
		SOarray["custparam_enteredbin"] = request.getParameter('custparam_enteredbin');
		SOarray["custparam_enteredqty"] = request.getParameter('custparam_enteredqty');		
		SOarray["custparam_enteredBinID"] = eneteredBinId;	
		SOarray["custparam_hdnCloseflag"] = stageFlag;	
		SOarray["custparam_enteredlot"] = enteredLot;
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-FULFILLMENT QTY SCAN';
		var getPreferBin='';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "SO/TO";

		var vFOoverageChecked='F';

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


		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));

		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		//No need of Load Search here as well get one record only
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		var getSOItem = '';
		var blnItemUnit ='';
		var VUnitType ='';
		if(itemresults!=null && itemresults!='')
		{
			if(itemresults[0].getValue('isinactive')=="T")
			{
				SOarray["custparam_error"] = 'Entered item is inactive';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
				return;
			}

			getItemType = itemresults[0].recordType;
			getSOItem = itemresults[0].getValue('itemid');
			blnItemUnit = itemresults[0].getText('stockunit');
			VUnitType = itemresults[0].getValue('unitstype');

		}
		var getStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
		if(VUnitType != null && VUnitType != '')
		{	
			var vBaseUOMSearch=getBaseUnitRate(VUnitType);

			vBaseUnit='Base unit';
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
				vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
			}	

			if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
			}
		}
		if(getItemType == null || getItemType =='' || getItemType == 'null' || getItemType == 'undefined')
		{
			getItemType = itemType;
		}


		itemfilters=null;
		itemcolumns=null;
		itemresults=null;

		var vStageScanRequired = request.getParameter('custparam_stagescanrequired');

		var logMsg = 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
		logMsg = logMsg + 'getItemInternalId = ' + getItemInternalId + '<br>';
		logMsg = logMsg + 'eneteredBinId = ' + eneteredBinId + '<br>';
		logMsg = logMsg + 'enteredLot = ' + enteredLot + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		logMsg = logMsg + 'getItemType = ' + getItemType + '<br>';
		logMsg = logMsg + 'getStockConversionRate = ' + getStockConversionRate + '<br>';
		logMsg = logMsg + 'vConversionRate = ' + vConversionRate + '<br>';

		var vStatusDetails="";
		var invfilterStrat =  new Array();
		if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
		{
			if(whLocation != null && whLocation != '')
				invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
			if(getItemInternalId != null && getItemInternalId != '')
				invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', getItemInternalId));
			if(eneteredBinId!= null && eneteredBinId!= '')
				invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', eneteredBinId));
			//No need of Load Search here as well get one record only
			vStatusDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh',invfilterStrat, null);

		}
		else
		{

			if(whLocation != null && whLocation != '')
				invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
			if(getItemInternalId != null && getItemInternalId != '')
				invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', getItemInternalId));
			if(eneteredBinId!= null && eneteredBinId!= '')
				invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', eneteredBinId));
			if(enteredLot != null && enteredLot != '' && enteredLot !='null')
				invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', enteredLot));
			//No need of Load Search here as well get one record only
			vStatusDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);
		}

		var vStatusDetailsArr =  new Array();
		var eneteredLotTxt = '';
		var eneteredLotExpdate ='';
		var vOpenPickDetails ="";
		if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined' && vStatusDetails != undefined &&
				vStatusDetails.length != null && vStatusDetails.length >0)
		{
			var convRate = Number(Big(getStockConversionRate).div(vConversionRate));

			if(getItemType == "lotnumberedinventoryitem" || getItemType =="lotnumberedassemblyitem")
				vOpenPickDetails = getOPenTaskPickBinDetailsLot(getItemInternalId,eneteredBinId,whLocation,VUnitType,blnItemUnit);
			else
				vOpenPickDetails = getOPenTaskPickBinDetails(getItemInternalId,eneteredBinId,whLocation,VUnitType,blnItemUnit,'','');


			if((getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem" || getItemType == "lotnumberedinventoryitem" || 
					getItemType=="lotnumberedassemblyitem"))
			{
				eneteredLotTxt = vStatusDetails[0].getText('inventorynumber',null,'group');
				eneteredLotExpdate = vStatusDetails[0].getValue('expirationdate','inventorynumber','group');

				logMsg = logMsg + 'eneteredLotTxt = ' + eneteredLotTxt + '<br>';
				logMsg = logMsg + 'eneteredLotExpdate = ' + eneteredLotExpdate + '<br>';				

				var statusArr = new Array();

				if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
				{

					for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
					{
						var status = vStatusDetails[statusItr].getText('status',null,'group');
						// No need to check Status MakeAvailable flag
						var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');
						vBinQtyAvail =Number(Big(vBinQtyAvail).mul(convRate));	
						var statusId = vStatusDetails[statusItr].getValue('status',null,'group');

						var openPickQty = 0;
						if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
						{

							var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
							var	vOpenPickQtyArr = vOpenPickDetails[1];
							var	vBinLotArr = vOpenPickDetails[3];
							var	vBinStatusArr = vOpenPickDetails[5]						
							if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined' && 
									vBinStatusArr != undefined)
							{
								for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
								{
									var stsArr = vBinStatusArr[binItr];
									var vLotText =vBinLotArr[binItr];						
									if(stsArr == statusId && eneteredLotTxt==vLotText)
									{
										openPickQty = vOpenPickQtyArr[binItr];
										break;
									}
								}
							}

						}
						vBinQtyAvail = Number(Big(vBinQtyAvail).minus(openPickQty));
						logMsg = logMsg + 'vBinQtyAvail = ' + vBinQtyAvail + '<br>'; 
						logMsg = logMsg + 'openPickQty = ' + openPickQty + '<br>';
						if(parseFloat(vBinQtyAvail) > 0)
						{
							if(statusArr.indexOf(statusId)==-1)
							{

								var currRow = [status,vBinQtyAvail,statusId];
								statusArr.push(statusId);
								vStatusDetailsArr.push(currRow);
							}
							else
							{
								var indx = statusArr.indexOf(statusId);
								var Row = vStatusDetailsArr[indx];
								var qty = Row[1];
								var totalQty = Number(Big(qty).plus(vBinQtyAvail));
								var currRow = [status,totalQty,statusId];
								vStatusDetailsArr[indx]=currRow;

							}
						}

					}
				}
				if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
				{

					for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
					{
						var status = vStatusDetails[statusItr].getText('status',null,'group');						
						var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');
						vBinQtyAvail =Number(Big(vBinQtyAvail).mul(convRate));	
						var statusId = vStatusDetails[statusItr].getValue('status',null,'group');

						var openPickQty = 0;
						if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
						{

							var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
							var	vOpenPickQtyArr = vOpenPickDetails[1];							
							var	vBinStatusArr = vOpenPickDetails[3]						
							if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined' && 
									vBinStatusArr != undefined)
							{
								for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
								{
									var stsArr = vBinStatusArr[binItr];															
									if(stsArr == statusId)
									{
										openPickQty = vOpenPickQtyArr[binItr];
										break;
									}
								}
							}

						}
						vBinQtyAvail = parseFloat(vBinQtyAvail)-parseFloat(openPickQty);
						logMsg = logMsg + 'vBinQtyAvail = ' + vBinQtyAvail + '<br>'; 
						logMsg = logMsg + 'openPickQty = ' + openPickQty + '<br>';
						if(parseFloat(vBinQtyAvail) > 0)
						{
							if(statusArr.indexOf(statusId)==-1)
							{

								var currRow = [status,vBinQtyAvail,statusId];
								statusArr.push(statusId);
								vStatusDetailsArr.push(currRow);
							}
							else
							{
								var indx = statusArr.indexOf(statusId);
								var Row = vStatusDetailsArr[indx];
								var qty = Row[1];
								var totalQty = Number(Big(qty).plus(vBinQtyAvail));
								var currRow = [status,totalQty,statusId];
								vStatusDetailsArr[indx]=currRow;

							}
						}

					}
				}

			}
			else
			{
				for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
				{
					var status = vStatusDetails[statusItr].getText('status',null,'group');
					// No need to check Status Make Available flag
					var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');

					vBinQtyAvail =Number(Big(vBinQtyAvail).mul(convRate));	
					var statusId = vStatusDetails[statusItr].getValue('status',null,'group');
					var openPickQty = 0;
					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{						
						var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinStatusArr = vOpenPickDetails[3];						
						if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined' && 
								vBinStatusArr != undefined)
						{
							for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
							{
								var stsArr = vBinStatusArr[binItr];								
								if(stsArr == statusId)
								{
									openPickQty = vOpenPickQtyArr[binItr];
									break;
								}
							}
						}

					}

					logMsg = logMsg + 'vBinQtyAvail = ' + vBinQtyAvail + '<br>'; 
					logMsg = logMsg + 'openPickQty = ' + openPickQty + '<br>'; 
					var  vBinQtyAvail   = Number(Big(vBinQtyAvail).minus(openPickQty));
					if(parseFloat(vBinQtyAvail) > 0)
					{
						var currRow = [status,vBinQtyAvail,statusId];
						vStatusDetailsArr.push(currRow);
					}
				}
			}
		}
		nlapiLogExecution('Debug', 'vStatusDetailsArr', vStatusDetailsArr); 

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

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

		var functionkeyHtml=getFunctionkeyScriptSE('_rf_select_status');

		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "'" +
			" type='text/css' rel='stylesheet'>";	
		html = html +functionkeyHtml;

		//This function is to validate the form when Enter button or save button is clicked.
		html = html + "<script type='text/javascript'>function validate_selectedStatus(statusId,selectedQty){" +
		"var enteredQty = document.getElementById('hdnenteredqty').value;if(parseFloat(selectedQty) < parseFloat(enteredQty)){" +
		" document.getElementById('div_error').innerHTML = 'Selected Qty is less than required Qty.' ;return false;}" +
		"	document.getElementById('hdnenetedstatus').value = statusId;document.forms['_rf_select_status'].submit();" +
		"document.getElementById('loading').style.display = 'block'; return true;}</script>";
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";

		html = html +"	<form name='_rf_select_status' method='POST'><input name='cmdSend1' type='submit'  class='defaultlink'   value='' onclick=' return validateForm_soQtySingle();'/>"+ 	

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking Bin/Location Status</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+ 	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+": <label>" + getSONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getSOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getFetchedItemId + ">"+	
		"				<input type='hidden' name='hdnItemId' value=" + getItemId + ">"+
		"				<input type='hidden' name='hdnenteredQuantity' value=" + getenteredQty + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnCarton' value='" + getCarton + "'>"+
		"				<input type='hidden' name='hdnCartonsize' value='" + getCartonSize + "'>"+
		"				<input type='hidden' name='hdnCartonweight' value='" + getCartonWeight + "'>"+
		"				<input type='hidden' name='hdnCartonscreenvalue' value='" + getCartonscreenValue + "'>"+
		"				<input type='hidden' name='hdnCoitem' value='" + componentItem + "'>"+
		"				<input type='hidden' name='hdnCoitempikedqty' value='" + getmemItempickedqty + "'>"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+	
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnPickType' value='" +pickType+"'>"+
		"				<input type='hidden' id='hdnitemtype' name='hdnitemtype' value=" + itemType + ">"+
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + StockUnitText + "'>"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + vUnitType + ">"+
		"				<input type='hidden' name='hdnItemRemainingQty' id='hdnItemRemainingQty' value=" + getItemRemainingQty + ">"+	
		"				<input type='hidden' name='hdnenteredbin' id='hdnenteredbin' value='" +enteredBin+"' >"+
		"				<input type='hidden' name='hdnenteredqty' id='hdnenteredqty' value='" +enteredQty+"' >"+
		"				<input type='hidden' name='hdnenteredbinid' id='hdnenteredbinid' value='" +eneteredBinId+"' >"+
		"				<input type='hidden' name='hdnenetedstatus' id='hdnenetedstatus'>"+
		"				<input type='hidden' name='hdnmemItemQty' id='hdnmemItemQty' value=" + memItemQtytoShow + ">"+
		"				<input type='hidden' name='hdnenteredlot' id='hdnenteredlot' value='" +eneteredLotTxt+"' >"+
		"				<input type='hidden' name='hdnenteredlot' id='hdnenteredlotid' value='" +enteredLot+"' >"+	
		"				<input type='hidden' name='hdnorderLevel' value=" + orderLevel + ">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getSOItem  + "</label>"+
		"			</tr>"+		 
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enteredBin + " </label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Qty: <label>" + parseFloat(parseFloat(enteredQty).toFixed(5)) + " "+vBaseUnit+"</label>"+
		"			</tr>";
		if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
		{
			html=html+	"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Lot #: <label>"+eneteredLotTxt+"</label>"+
			"			</tr>";

		}

		var errorMsgValue='';
		if(vStatusDetailsArr !=null && vStatusDetailsArr!='' && vStatusDetailsArr.length > 0)
		{
			html = html + 	" <tr><td></td></tr><tr><td></td></tr><tr ><td  ><table  style='border-spacing: 0;' id='tblqtyUOM'>";			


			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td class='status-rw-display'>Inv Status"+	
			"				</td>"+
			"				<td  class='align-right'>Qty"+	
			"				</td>";	
			if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
			{
				html = html +"				<td>Expiry Date"+	
				"				</td>";	
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			for(var invItr=0;invItr<vStatusDetailsArr.length;invItr++)
			{
				if(invItr%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';

				var currValues = vStatusDetailsArr[invItr];
				var vStatus = currValues[0];
				var vQty = currValues[1];
				var vStatusId = currValues[2];

				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td  class='status-cl-display'>" +
				"<a  onclick='return validate_selectedStatus(\""+vStatusId+"\",\""+vQty+"\");' href='#' >"+vStatus;	
				html = html +"				</a></td>";
				html = html +"				<td  class='align-right'>"+parseFloat(parseFloat(vQty).toFixed(5));
				html = html +"				</td>";
				if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
				{
					if(eneteredLotExpdate ==null || eneteredLotExpdate =='' || eneteredLotExpdate =='null'|| eneteredLotExpdate == 'undefined' ||  eneteredLotExpdate == undefined)
						eneteredLotExpdate="";
					html = html +"				<td>"+eneteredLotExpdate;
					html = html +"				</td>";		
				}

				html = html +"			</tr>";

			}
			html = html + 	"</table></td></tr>";
		}
		html = html +"	<tr><td></td></tr>	<tr><td></td></tr>	<tr>	<td align = 'left'>";
		html = html +"				<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td>" +		
		"			</td></tr>";
		html = html + 	"</table>";
		html = html +"				<input type='hidden' name='hdnerrorMsgValue' id='hdnerrorMsgValue' value=" + errorMsgValue + ">";
		html = html + "</form>";		
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			var JSfile = getLoadFile('wmsse_uomfunctions.js');
			var JSSurl ='';
			if (JSfile) 
			{ 
				JSSurl = JSfile.getURL();
			}

			if(JSSurl != null && JSSurl != '')
			{
				html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
			}
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>";
		nlapiLogExecution('DEBUG', 'logMsg', logMsg); 
		logMsg='';
		response.write(html);
	}
	else
	{

		var SOarray = new Array();
		var tempflag='F';
		var enterQty=request.getParameter('hdnenteredqty');
		var enterBin=request.getParameter('hdnenteredbin');
		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var memItemExpectedQty=request.getParameter('hdnmemItemQty');
		var memItemPickedQty=request.getParameter('custparam_memitempickedqty');
		var memitem=request.getParameter('hdnItemId');
		var eneteredBinId = request.getParameter('hdnenteredbinid');
		var enteredLot = request.getParameter('hdnenteredlot');
		var binInternalId =eneteredBinId;
		if((enterBin == "" || enterBin == null || enterBin =="null") && (request.getParameter('hdnPreferBin') !=null && 
				request.getParameter('hdnPreferBin') !='' && request.getParameter('hdnPreferBin')!='null' && 
				request.getParameter('hdnPreferBin')!='undefined'))
		{
			enterBin=request.getParameter('hdnPreferBin');
		}
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_memunittype"] =vUnitType;
		SOarray["custparam_memstockunit"] =StockUnitText;
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		SOarray["custparam_option"] = request.getParameter('hdnOptedField');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		SOarray["custparam_sointernalid"] = request.getParameter('hdnSoInternalId');
		SOarray["custparam_lineno"] = request.getParameter('hdnSoLineno');
		SOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');		
		SOarray["custparam_rem_qty"] = request.getParameter('hdnmemItemQty');
		SOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');	
		SOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		SOarray["custparam_enterBin"] = enterBin;
		SOarray["custparam_itemid"] = request.getParameter('hdnItemId');		
		SOarray["custparam_cartonsize"] = request.getParameter('hdnCartonsize');
		SOarray["custparam_carton"] = request.getParameter('hdnCarton');
		SOarray["custparam_cartonweight"] = request.getParameter('hdnCartonweight');
		SOarray["custparam_cartonscreenrulevalue"] = request.getParameter('hdnCartonscreenvalue');		
		SOarray["custparam_memitempickedqty"]=request.getParameter('hdnCoitempikedqty');
		SOarray["custparam_memitementeredqty"]=enterQty;
		SOarray["custparam_memitemqty"] = request.getParameter('hdnmemItemQty');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		SOarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_itemremainingquantity"] = request.getParameter('hdnItemRemainingQty');
		SOarray["custparam_enteredbin"]=request.getParameter('hdnenteredbin');
		SOarray["custparam_enteredqty"] = request.getParameter('hdnenteredQuantity'); 
		SOarray["custparam_enteredBinID"] = request.getParameter('hdnenteredbinid'); 
		SOarray["custparam_hdnCloseflag"] = request.getParameter('custparam_hdnCloseflag'); 
		SOarray["custparam_enteredlot"] =  request.getParameter('hdnenteredlotid');
		SOarray["custparam_itemtype"] = request.getParameter('custparam_itemtype');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var enteredQty=request.getParameter('hdnenteredqty');	
		var enteredBin=request.getParameter('hdnenteredbin');
		var selectedStatus = request.getParameter('hdnenetedstatus');
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		var pickType = request.getParameter('hdnPickType');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		SOarray["custparam_stockconversionrate"]=getStockConversionRate;
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;
		var trantype=request.getParameter('hdntrantype');

		var remQty=request.getParameter('hdnmemItemQty');
		var soInternalId=request.getParameter('hdnSoInternalId');

		var recQty=request.getParameter('hdnCoitempikedqty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var soLineno=request.getParameter('hdnSoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var optedEvent = request.getParameter('cmdPrevious');	
		var itemType=request.getParameter('hdnitemtype');
		SOarray["custparam_enterQty"] = enterQty;
		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'soInternalId = ' + soInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'soLineno = ' + soLineno + '<br>';
		logMsg = logMsg + 'preferBin = ' + preferBin + '<br>';
		logMsg = logMsg + 'memItemExpectedQty = ' + memItemExpectedQty + '<br>';
		logMsg = logMsg + 'SOarray["custparam_carton"] = ' + SOarray["custparam_carton"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonsize"] = ' + SOarray["custparam_cartonsize"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonweight"] = ' + SOarray["custparam_cartonweight"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonscreenrulevalue"] = ' + SOarray["custparam_cartonscreenrulevalue"] + '<br>';
		logMsg = logMsg + 'enteredLot = ' + enteredLot + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + '	SOarray["custparam_orderlevel"] = ' + 	SOarray["custparam_orderlevel"] + '<br>';
		logMsg = logMsg + '	SOarray["custparam_enteredqty"] = ' + 	SOarray["custparam_enteredqty"] + '<br>';
		logMsg = logMsg + '	SOarray["custparam_enterQty"] = ' + 	SOarray["custparam_enterQty"] + '<br>';

		nlapiLogExecution('DEBUG', 'logMsg', logMsg);
		logMsg="";
		var vStageScanRequired="F";

		var vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',request.getParameter('hdnWhLocation'),'2');		

		if(vStageScanRequired!=null && vStageScanRequired!='')
		{ 
			vStageScanRequired="T";			 
		}
		else
		{
			vStageScanRequired="F";
		}
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
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
				if(optedEvent != 'Back (F7)')
				{				

					if(selectedStatus!=null && selectedStatus!="" && selectedStatus !='null' && !isNaN(selectedStatus))
					{
						try
						{

							logMsg = logMsg + 'selectedStatus = ' + selectedStatus + '<br>';
							if(enteredLot == null || enteredLot == '' || enteredLot == 'null' || enteredLot == undefined)
								enteredLot='';
							if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem'
								&& itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
							{


								var itemType = nswms_GetItemType(memitem, SOarray["custparam_whlocation"]);

								if(itemType == "inventoryitem" || itemType=="assemblyitem" || ((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")))
								{
									try
									{
										//Creating lock record in binlocking
										var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockbin');
										LockRecord.setFieldValue('name',binInternalId);
										LockRecord.setFieldValue('custrecord_wmse_lock_sku',memitem);
										LockRecord.setFieldValue('custrecord_wmsse_lock_binlocation',binInternalId);										
										LockRecord.setFieldValue('custrecord_wmsse_lock_flag','T');
										LockRecord.setFieldValue('custrecord_wmsse_lock_unittype',vUnitType);
										LockRecord.setFieldValue('custrecord_wmsse_lockqty',enterQty);
										LockRecord.setFieldValue('custrecord_wmsse_lockuser',context.getUser());
										LockRecord.setFieldValue('custrecord_wmsse_lock_stockunit',StockUnitText);
										LockRecord.setFieldValue('custrecord_wmsse_lock_conversionrate',getStockConversionRate);
										LockRecord.setFieldValue('custrecord_wmsse_lock_invtstatus',selectedStatus);
										LockRecord.setFieldValue('custrecord_wmsse_lock_itemtype',itemType);
										var recid = nlapiSubmitRecord(LockRecord);

										LockRecord=null;
									}
									catch(e)
									{
										if ( e instanceof nlobjError )
										{
											SOarray["custparam_error"]=e.getDetails();
											nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() );
										}
										else
										{
											SOarray["custparam_error"]=e.toString();
											nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() );
										}


										response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts_sng', 'customdeploy_wmsse_kitpkg_selectsts_sng', false, SOarray);
										return; 
									}

									lockresults=null;									
									lockfilters=null;
								}
								logMsg = logMsg + 'itemType = ' + itemType + '<br>';								
								SOarray["custparam_itemtype"] = itemType;


							}
							if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{
								logMsg = logMsg + 'into serializedinventoryitem = ' + itemType + '<br>';

								SOarray["custparam_status"]=selectedStatus;
								SOarray["custparam_enterQty"] =enteredQty;
								SOarray["custparam_enterBin"] =enteredBin;
								SOarray["custparam_screen"] ='fromstatusscreen';
								SOarray["custparam_error"] = '';
								response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serial_sng', 'customdeploy_wmsse_kitorpkg_serial_sng', false, SOarray);
								return;
							}							
							else 
							{								

								var binInternalId='';
								if(enterBin !='' && enterBin != null && enterBin != 'null' && enterBin != 'undefined')
								{
									binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);
								}
								logMsg = logMsg + 'binInternalId ' + binInternalId + '<br>';

								var soLineItemDetails = getSOLineDetailsNew(SOarray["custparam_soid"],trantype,FetchedItemId,SOarray["custparam_whlocation"],'');

								var vMultiShipping='F';
								var vShipVia='';
								//To fetch Line level multi shipping flag and ship via validation
								if(soLineItemDetails !=null && soLineItemDetails!="")
								{
									logMsg = logMsg + 'soLineItemDetails ' + soLineItemDetails + '<br>';
									var vColumnslist=soLineItemDetails[0].getAllColumns();

									var custIndex = 12;
									var commitedQtyIndex = 25;
									var fulfilledQtyIndex = 26;
									var conversionRateIndex=27;
									var totalPickedQtyIndex =7;
									var totalNSPickedQtyIndex =37;
									var ERPConfirmedQty =38;
									for(var lblItr=0;lblItr<vColumnslist.length;lblItr++)
									{
										var summaryLabel = vColumnslist[lblItr].getLabel();
										var name =  vColumnslist[lblItr].getName();
										if(summaryLabel == 'Customer Id')
										{
											custIndex = lblItr;
										}
										else if (summaryLabel == 'Committed Quantity')
										{
											commitedQtyIndex = lblItr;
										}
										else if (summaryLabel == 'Fulfilled Quantity' && name == 'formulanumeric')
										{
											fulfilledQtyIndex = lblItr;
										}
										else if (summaryLabel == 'Conversion Rate')
										{
											conversionRateIndex = lblItr;
										}
										else if (summaryLabel == 'Total Picked Quantity')
										{
											totalPickedQtyIndex = lblItr;
										}
										else if (summaryLabel == 'ERPpickedQuantity')
										{
											totalNSPickedQtyIndex = lblItr;
										}
										else if (summaryLabel == 'ERP CONFIRMED QTY')
										{
											ERPConfirmedQty = lblItr;
										}
										else
										{

										}
									}
									var vSoreminqty =0;
									var OpenKitPickTaskDetails=getOpenTaskDetails(soInternalId,soLineno);

									var kitPickConfirmedQty=0;
									if(OpenKitPickTaskDetails != null && OpenKitPickTaskDetails != '' )
									{
										for(var openTskItr=0;openTskItr < OpenKitPickTaskDetails.length;openTskItr++)
										{
											var sku = OpenKitPickTaskDetails[openTskItr].getValue('custrecord_wmsse_sku',null,'group');											
											if(parseInt(sku) == parseInt(FetchedItemId))
											{
												kitPickConfirmedQty =   OpenKitPickTaskDetails[openTskItr].getValue('custrecord_wmsse_expe_qty',null,'sum');																							
												break;
											}

										}

									}
									for(var soDetailsItr=0;soDetailsItr<soLineItemDetails.length;soDetailsItr++)
									{
										var vsoLine = soLineItemDetails[soDetailsItr].getValue('line',null,'group');
										var vsoitemQty=soLineItemDetails[soDetailsItr].getValue(vColumnslist[commitedQtyIndex]);
										var vsoitemfulfillQty=soLineItemDetails[soDetailsItr].getValue(vColumnslist[fulfilledQtyIndex]);							

										if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
											vsoitemfulfillQty=0;

										var vsoitemopentaskQty=soLineItemDetails[soDetailsItr].getValue(vColumnslist[totalPickedQtyIndex]);
										var vsoitemErpConfirmedQty=soLineItemDetails[soDetailsItr].getValue(vColumnslist[ERPConfirmedQty]);
										var vsoitemNSReceivedQty=soLineItemDetails[soDetailsItr].getValue(vColumnslist[totalNSPickedQtyIndex]);
										if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
										{
											vsoitemopentaskQty = 0;
										}
										if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' || vsoitemErpConfirmedQty=='undefined' )
										{
											vsoitemErpConfirmedQty = 0;
										}
										if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
										{
											vsoitemNSReceivedQty = 0;
										}
										vsoitemopentaskQty=new Big(vsoitemopentaskQty);
										vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
										vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);

										var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));

										//var vsoitemRcvQty = parseFloat(vsoitemopentaskQty)+parseFloat(vsoitemErpConfirmedQty)+(parseFloat(vsoitemNSReceivedQty)-parseFloat(vsoitemErpConfirmedQty));

										//vSoreminqty = (parseFloat(vsoitemQty) + parseFloat(vsoitemfulfillQty)) - parseFloat(kitPickConfirmedQty);

										vsoitemQty=new Big(vsoitemQty);
										vSoreminqty=Number((vsoitemQty).plus(vsoitemfulfillQty).minus(kitPickConfirmedQty));
										if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1) && trantype == 'transferorder'))
										{
											vMultiShipping = soLineItemDetails[soDetailsItr].getValue('ismultishipto',null,'group');
											if(vMultiShipping ==  null || vMultiShipping =='')
												vMultiShipping='F';
											vShipVia=soLineItemDetails[soDetailsItr].getValue('shipmethod',null,'group');
											break;
										}			

									}	

								}
								var isItLastPick='F';
								if(parseFloat(vSoreminqty) > 0)
								{
									// open task creation
									updateOpenTask(soInternalId,memitem,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
											enteredLot,'','','',soInternalId,null,null,null,'PICK',SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
											SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'',
											Number(Big(memItemExpectedQty).toFixed(5)),Number(Big(enterQty).toFixed(5)),FetchedItemId,'T','','','',vShipVia,null,ordType,department,vclass,null,null,selectedStatus);
									context.setSessionObject('record', 'created'); 
								}
								var soLineDetails = null;
								if(parseFloat(vSoreminqty) > 0)
								{
									soLineDetails = getSOLineDetailskit(SOarray["custparam_soid"],trantype,FetchedItemId,SOarray["custparam_whlocation"],'');

								}
								var mainItemCommitedQty =0;
								var compItemRequiredQtyArr = new Array();
								if(soLineDetails !=null && soLineDetails!="")
								{


									if(soLineDetails.length>0)
									{
										var count= 0;										
										var vColumnslist = soLineDetails[0].getAllColumns();

										var memitemcommitedQtyIndex = 8;
										var memitemfulfilledQtyIndex = 9;		
										var memitemtotalPickedQtyIndex =10;
										for(var soLblItr=0;soLblItr<vColumnslist.length;soLblItr++)
										{
											var summaryLabel = vColumnslist[soLblItr].getLabel();

											if(summaryLabel == 'Member Item Total Picked Quantity')
											{
												memitemtotalPickedQtyIndex = soLblItr;
											}
											else if (summaryLabel == 'Member Item Committed Quantity')	
											{
												memitemcommitedQtyIndex = soLblItr;
											}
											else if (summaryLabel == 'Member Item Fulfilled Quantity')
											{
												memitemfulfilledQtyIndex = soLblItr;
											}				
											else
											{

											}
										}
										var openTaskDetails  = getOpenTaskDetails(soInternalId,soLineno);

										for(var soLineItr=0;soLineItr<soLineDetails.length;soLineItr++)
										{		
											var searchResult=soLineDetails[soLineItr];
											var vSoLine = searchResult.getValue('line',null,'group');
											var vsoitemRcvQty = searchResult.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
											var vsoitemCommitedQty=searchResult.getValue(vColumnslist[memitemcommitedQtyIndex]);
											var vsoitem = searchResult.getValue('item',null,'group');
											mainItemCommitedQty = searchResult.getValue('quantitycommited',null,'max');
											var vcoitem = searchResult.getValue('memberitem','item','group');
											var vMemItemType = getComponentItemType(vcoitem);											
											var qtyToCompare =	fnGetComponentItemDetails(FetchedItemId,vcoitem,SOarray["custparam_enteredqty"]);
											var currRow = [vcoitem,qtyToCompare];
											compItemRequiredQtyArr.push(currRow);											
											var pickConfirmedQty=0;
											if(openTaskDetails != null && openTaskDetails != '' )
											{
												for(var openTaskItr=0;openTaskItr < openTaskDetails.length;openTaskItr++)
												{
													var sku = openTaskDetails[openTaskItr].getText('custrecord_wmsse_sku',null,'group');													
													if(sku == vcoitem)
													{
														pickConfirmedQty =   openTaskDetails[openTaskItr].getValue('custrecord_wmsse_expe_qty',null,'sum');
														break;
													}

												}
											}

											if(parseFloat(vSoLine) == parseFloat(soLineno))
											{
												if(parseFloat(pickConfirmedQty) >= parseFloat(qtyToCompare))
												{										
													//isItLastPick="T";
												}
												else
												{
													//isItLastPick="F";
													count=parseFloat(count)+1;
													break;
												}
											}
										}
										logMsg = logMsg + 'count ' + count + '<br>';
										if(parseFloat(count) >= 1)
										{
											isItLastPick="F";
										}
										else
										{
											isItLastPick="T";
										}
									}
									soLineDetails=null;
								}

								logMsg = logMsg + 'isItLastPick ' + isItLastPick + '<br>';
								// To post IF when order level is true and lastpick is true for already packed containers against order
								if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T" && vStageScanRequired == 'F')
								{
									var filtersPack = new Array();
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['14']));
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'isnotempty'));
									// No need for loadsearch here, getting only Pack tasks only
									var opentaskSearchResultsPack=nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh',filtersPack,null);
									if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
									{
										logMsg = logMsg + 'opentaskSearchResultsPack ' + opentaskSearchResultsPack.length + '<br>';

										var fieldsPack = new Array();
										var valuesPack = new Array();
										for(var openTskItr=0; openTskItr < opentaskSearchResultsPack.length; openTskItr++)
										{
											var RecordIdPack=opentaskSearchResultsPack[openTskItr].getValue('internalid');
											if(RecordIdPack!=null && RecordIdPack!='')
											{
												var recId=nlapiLoadRecord('customrecord_wmsse_trn_opentask',RecordIdPack);
												recId.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												var vPackRecId = nlapiSubmitRecord(recId);

											}
										}
									}
								}
								// end
								nlapiLogExecution('DEBUG', 'isItLastPick', isItLastPick);
								if(isItLastPick!=null && isItLastPick!='' && isItLastPick=="T")
								{

									//Creating open task
									var mianItemOPenTaskid =updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(SOarray["custparam_enteredqty"]).toFixed(5)),binInternalId,itemType,
											SOarray["custparam_whlocation"],enteredLot,'','','',soInternalId,null,null,null,'PICK',SOarray["custparam_carton"],
											SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],
											SOarray["custparam_customer"],'','','','','F','','','',vShipVia,null,ordType,department,vclass,null,null,selectedStatus);
									context.setSessionObject('record', 'created'); 									

									if(mianItemOPenTaskid != null && mianItemOPenTaskid !='')
									{
										var filter= new Array();
										filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId)); 
										filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', soLineno)); 
										filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
										filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8']));//8 picking completed
										filter.push(new nlobjSearchFilter('custrecord_wmsse_kitflag', null,'is', 'T'));
										filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
										filter.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); // NS REFno is empty
										filter.push(new nlobjSearchFilter('custrecord_wmsse_act_qty', null, 'isempty')); 
										// No need for loadsearch here, fetching only one record
										var opentaskordersearchresultkit = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh',filter,null);
										logMsg = logMsg + 'opentaskordersearchresultkit ' + opentaskordersearchresultkit + '<br>';
										if(opentaskordersearchresultkit != null && opentaskordersearchresultkit !='')
										{
											for(var openSearchItr=0;openSearchItr<opentaskordersearchresultkit.length;openSearchItr++)
											{
												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',opentaskordersearchresultkit[openSearchItr].getValue('internalid'));
												var expQty = loadRec.getFieldValue('custrecord_wmsse_expe_qty');

												var vName = loadRec.getFieldValue('name');
												var vCoItem = loadRec.getFieldText('custrecord_wmsse_sku');
												if(compItemRequiredQtyArr.length > 0)
												{
													for(var compItemItr=0;compItemItr<compItemRequiredQtyArr.length;compItemItr++)
													{
														var coItemVal = compItemRequiredQtyArr[compItemItr][0];
														var coItemQty = compItemRequiredQtyArr[compItemItr][1];														
														if((coItemVal ==  vCoItem)&& (parseFloat(expQty) > parseFloat(coItemQty)))
														{
															//var coRemainingQty = parseFloat(expQty)-parseFloat(coItemQty);
															var coRemainingQty = Number(Big(expQty).minus(coItemQty));
															var copyRec = nlapiCopyRecord('customrecord_wmsse_trn_opentask',opentaskordersearchresultkit[openSearchItr].getValue('internalid'));
															copyRec.setFieldValue('name', vName);
															copyRec.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(coRemainingQty).toFixed(5)));
															copyRec.setFieldValue('custrecord_wmsse_act_qty', Number(Big(coRemainingQty).toFixed(5)));
															nlapiSubmitRecord(copyRec);
															expQty = coItemQty;
															loadRec.setFieldValue('custrecord_wmsse_expe_qty',Number(Big(expQty).toFixed(5)));

														}
													}

												}


												loadRec.setFieldValue('custrecord_wmsse_act_qty',Number(Big(expQty).toFixed(5)));
												var id=nlapiSubmitRecord(loadRec);
												nlapiLogExecution('Debug', 'Rec id', id);
											}
											opentaskordersearchresultkit=null;
										}
										if(SOarray["custparam_orderlevel"] =="F" && mianItemOPenTaskid != null && mianItemOPenTaskid != '' && vStageScanRequired == "F")
										{	
											var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
											loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
											nlapiSubmitRecord(loadRec);
											loadRec=null;
										}
									}

									//soLineDetails = getSOLineDetailsNew(SOarray["custparam_soid"],trantype,null,SOarray["custparam_whlocation"],'');
									soLineDetails = getSOqtyscandetails(SOarray["custparam_soid"],trantype,SOarray["custparam_whlocation"]);
									if(soLineDetails !=null && soLineDetails!="" && soLineDetails.length>0)
									{
										logMsg = logMsg + 'soLineDetails.length ' + soLineDetails.length + '<br>';
										var vLinecount=0;
										var vShipCount=0;
										var vColumnslist=soLineDetails[0].getAllColumns();
										
										var vOpentaskdetails = getPickedqtydetails(SOarray["custparam_soid"],trantype,SOarray["custparam_whlocation"]);
										var deviceUploadFlag='T';
										for(var cnt=0;cnt<soLineDetails.length;cnt++)
										{

											var vsoitem = soLineDetails[cnt].getText('item');
											var vsoitemId = soLineDetails[cnt].getValue('item');
											var vsoitemType=soLineDetails[cnt].getValue('type','item');

											if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
												|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
											{
												var vsoitemQty=soLineDetails[cnt].getValue('quantity');
											}
											else
											{
												var vsoitemQty=soLineDetails[cnt].getValue('quantitycommitted');
											}

											var vsoitemfulfillQty=soLineDetails[cnt].getValue('quantitypicked');				

											var vsoitemNSReceivedQty=soLineDetails[cnt].getValue('quantitypicked');
											var vsoitemNSshippedQty=soLineDetails[cnt].getValue('quantityshiprecv');
											var vsoitemMultiShipping = soLineDetails[cnt].getValue('ismultishipto');
											var vsoitemShipVia = soLineDetails[cnt].getValue('shipmethod');
											var vsoitemLine = soLineDetails[cnt].getValue('line');					
											var vUnitsText = soLineDetails[cnt].getValue('unit');
											var vConversionRate = soLineDetails[cnt].getValue('formulanumeric');


											if(trantype == 'transferorder' && vsoitemLine != null)
												vsoitemLine = parseInt(vsoitemLine)-1;

											var vsoitemopentaskQty=0;
											for(var vOpentaskcount = 0; vOpentaskcount < vOpentaskdetails.length; vOpentaskcount++)
											{

												var vOpentaskitem = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_sku',null,'group');
												var vOpentaskLine = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_line_no',null,'group');

												if(vOpentaskitem==vsoitemId && vOpentaskLine==vsoitemLine)
												{
													vsoitemopentaskQty = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_act_qty',null,'sum');
													break;
												}


											}

											if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
											{
												vsoitemopentaskQty = 0;
											}

											if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
											{
												vsoitemNSReceivedQty = 0;
											}
											if(vsoitemfulfillQty ==null || vsoitemfulfillQty=='' ||vsoitemfulfillQty=='null' || vsoitemfulfillQty=='undefined' )
											{
												vsoitemfulfillQty = 0;
											}
											if(vsoitemNSshippedQty ==null || vsoitemNSshippedQty=='' ||vsoitemNSshippedQty=='null' || vsoitemNSshippedQty=='undefined' )
											{
												vsoitemNSshippedQty = 0;
											}

											if(vConversionRate!=null && vConversionRate!='')
											{
												vsoitemQty=Number(Big(vsoitemQty).div(vConversionRate));
												vsoitemNSReceivedQty=Number(Big(vsoitemNSReceivedQty).div(vConversionRate));
												vsoitemNSshippedQty=Number(Big(vsoitemNSshippedQty).div(vConversionRate));

											}

											var vsoitemRcvQty = Number(Big(vsoitemopentaskQty).plus(vsoitemNSReceivedQty));
											if(vsoitemRcvQty==null || vsoitemRcvQty=='')
												vsoitemRcvQty=0;

											if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
												|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
											{
												var itemRemQty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));
											}
											else
											{
												vsoitemQty=Big(vsoitemQty);
												vsoitemNSshippedQty=Big(vsoitemNSshippedQty);
												vsoitemRcvQty=Big(vsoitemRcvQty);
												var itemRemQty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
											}
											
											if(vsoitemMultiShipping ==  null || vsoitemMultiShipping =='')
												vsoitemMultiShipping='F';

											if(vsoitemMultiShipping == "F")
											{

												if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
												{	
													deviceUploadFlag='F';
													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
													return;
												}

												else if(parseFloat(itemRemQty)>0)
												{
													deviceUploadFlag='F';
													SOarray["custparam_error"] ='';
													SOarray["custparam_memitemqty"] = request.getParameter('custparam_memitemqty');
													SOarray["custparam_memitempickedqty"] = vsoitemRcvQty;


													response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
													return;
												}
											}
											else
											{

												logMsg = logMsg + 'vsoitemMultiShipping' + vsoitemMultiShipping + '<br>';
												if(parseFloat(itemRemQty)>0 && vsoitemShipVia == vShipVia)
												{
													vShipCount= parseFloat(vShipCount)+1;
												}
												else if(parseFloat(itemRemQty)>0)
												{
													vLinecount=parseFloat(vLinecount)+1;
												}
											}
										}										
										if(deviceUploadFlag=='T' && SOarray["custparam_orderlevel"] =="T" )
										{
											if(mianItemOPenTaskid != null && mianItemOPenTaskid != '' && vStageScanRequired =="F")
											{	
												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
												loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												nlapiSubmitRecord(loadRec);
												loadRec=null;
											}
											if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
											{
												var resArr = getCustomScriptId(2);
												if(resArr.length > 0)
												{
													SOarray["custparam_error"]='';
													response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
													return;
												}
												else
												{
													SOarray["custparam_error"]="Custom flow not defined for this process";
													response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts_sng', 'customdeploy_wmsse_kitpkg_selectsts_sng', false, SOarray);
													return; 
												}
											}
											SOarray["custparam_error"] ='';
											if(vStageScanRequired == "T")
												response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
											else
												response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
											return;
										}
										else if(parseFloat(vShipCount)>0)
										{
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
											return;
										}
										else if(parseFloat(vShipCount)==0)
										{											
											logMsg = logMsg + 'vShipCount' + vShipCount + '<br>';
											if(mianItemOPenTaskid != null && mianItemOPenTaskid != '' && vStageScanRequired == "F")
											{	
												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
												loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												nlapiSubmitRecord(loadRec);
												loadRec=null;
											}
											if(parseFloat(vLinecount) > 0)
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
												return;
											}
											else
											{
												if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
												{
													var resArr = getCustomScriptId(2);
													if(resArr.length > 0)
													{
														SOarray["custparam_error"]='';
														response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
														return;
													}
													else
													{
														SOarray["custparam_error"]="Custom flow not defined for this process";
														response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts_sng', 'customdeploy_wmsse_kitpkg_selectsts_sng', false, SOarray);
														return; 
													}
												}
												SOarray["custparam_error"] ='';
												if(vStageScanRequired == "T")
													response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
												else
													response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
												return;
											}
										}
										else
										{
											if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
											{
												var resArr = getCustomScriptId(2);
												if(resArr.length > 0)
												{
													SOarray["custparam_error"]='';
													response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
													return;
												}
												else
												{
													SOarray["custparam_error"]="Custom flow not defined for this process";
													response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts_sng', 'customdeploy_wmsse_kitpkg_selectsts_sng', false, SOarray);
													return; 
												}
											}
											SOarray["custparam_error"] ='';
											if(vStageScanRequired == "T")
												response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
											else
												response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
											return;

										}


										soLineDetails=null;

									}
									else
									{
										if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
										{
											var resArr = getCustomScriptId(2);
											if(resArr.length > 0)
											{
												SOarray["custparam_error"]='';
												response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
												return;
											}
											else
											{
												SOarray["custparam_error"]="Custom flow not defined for this process";
												response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts_sng', 'customdeploy_wmsse_kitpkg_selectsts_sng', false, SOarray);
												return; 
											}
										}
										SOarray["custparam_error"] ='';
										if(vStageScanRequired == "T")
											response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
										else
											response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
										return;
									}
								}
								else
								{
									nlapiLogExecution('DEBUG', 'memItemPickedQty', memItemPickedQty);
									memItemPickedQty = Number(Big(memItemPickedQty).plus(enterQty));
									SOarray["custparam_error"] ='';
									response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);
									return;									
								}
							}
						}
						catch(e)
						{
							nlapiLogExecution('ERROR', 'inside catch exception', e);

							if ( e instanceof nlobjError )
							{
								SOarray["custparam_error"]=e.getDetails();
								nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() );
							}
							else
							{
								SOarray["custparam_error"]=e.toString();
								nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() );
							}

							var lockfilters=new Array();

							lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',memitem));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
							// No need for loadsearch here, fetching only one record
							var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlocks_del_sch', lockfilters, null);

							if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
							{
								var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
								nlapiLogExecution('ERROR','DeleteRecordId', DeleteRecordId);
							}			

							response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts_sng', 'customdeploy_wmsse_kitpkg_selectsts_sng', false, SOarray);
							return; 
						}
					}
					else
					{
						SOarray["custparam_error"] = 'Please enter valid qty';				
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts_sng', 'customdeploy_wmsse_kitpkg_selectsts_sng', false, SOarray);
						return; 
					}
				} 
				else {

					try 
					{
						var lockfilters=new Array();

						lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',memitem));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
						// No need for loadsearch here, fetching only one record
						var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlocks_del_sch', lockfilters, null);

						if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
						{
							var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());

						}

					}
					catch(exp)
					{
						nlapiLogExecution('ERROR','Exception in lock records', exp);
					}

					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{

						SOarray["custparam_error"] = '';
						SOarray["custparam_enterQty"] =enteredQty;
						SOarray["custparam_enterBin"] =enteredBin
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan_sng', 'customdeploy_wmsse_kitorpkg_lotscan_sng', false, SOarray);
						return;
					}
					else
					{

						SOarray["custparam_error"] ='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan_sng', 'customdeploy_wmsse_kitorpkg_binscan_sng', false, SOarray);
						return;
					}
				}
				nlapiLogExecution('DEBUG', 'POST parameter', logMsg);
				logMsg="";
			}
			catch (e) 
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

				if ( e instanceof nlobjError )
				{
					SOarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					SOarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() );
				}
				response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts_sng', 'customdeploy_wmsse_kitpkg_selectsts_sng', false, SOarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts_sng', 'customdeploy_wmsse_kitpkg_selectsts_sng', false, SOarray);
			return; 
		}
	} //end of first if condition
} //end of function.

/**
 * To get to Sales OrderLine Details
 * @param SalesOrder
 * @param Line
 * @param trantype
 * @param itemid
 * @returns {searchresults}
 */
//Below function is added in generalfunction 
/*function getSOLineDetailskit(sonumber,trantype,itemID,whLocation,lineid)
{
	nlapiLogExecution('DEBUG', 'sonumber,trantype,whLocation,itemID',sonumber+","+trantype+","+whLocation+","+itemID);

	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';

	var filters = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', sonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
	{
		if(crossSubsidiaryFeature == true && trantype =="salesorder")
		{
			filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof', ['@NONE@',whLocation]));

		}
		else
		{
			filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',whLocation]));
		}
	}

	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 
	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{
		if(trantype=='transferorder')
			lineid = parseInt(lineid) + 1;		
		filters.push(new nlobjSearchFilter('line', null, 'equalto', lineid));
	}
	// No need for loadsearch here, fetching only one record
	var SOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_ordline_details_kit', filters, null);
	filters=null;	
	return SOLineDetails;
}
 */

/**
 * To get to kit component quantity
 * @param getMainItemInternalId
 * @param componentItem
 * @param vrequired qty
 * @returns {searchresults}
 */
function fnGetComponentItemDetails(getMainItemInternalId,componentItem,vReqQty)
{
	nlapiLogExecution('DEBUG', 'getMainItemInternalId,componentItem,vReqQty', getMainItemInternalId+","+componentItem+","+vReqQty);
	var filters = new Array(); 
	filters[0] = new nlobjSearchFilter('internalid', null, 'is', getMainItemInternalId);
	filters[1]=new nlobjSearchFilter('isfulfillable', null, 'is', 'T');

	var vActQty=vReqQty;
	// No need for loadsearch here, fetching only one record
	var searchresults = nlapiSearchRecord( 'item', 'customsearch_wmsse_itemdetails', filters, null ); 
	if(searchresults != null && searchresults!='' && searchresults !='null' && searchresults.length>0 )
	{
		for(var searchItr=0; searchresults!=null && searchItr<searchresults.length;searchItr++) 
		{

			var vMemItem=searchresults[searchItr].getText('memberitem');

			if(componentItem == vMemItem)
			{
				var vMemQty=searchresults[searchItr].getValue('memberquantity');
				if(vMemQty == null || vMemQty == '')
					vMemQty=0;
				vActQty= Number(Big(vMemQty).mul(vReqQty));
				break;
			}

		}
	}
	searchresults=null;
	columns1=null;
	filters=null;
	nlapiLogExecution('DEBUG', 'vActQty', vActQty);
	return vActQty;
}

/**
 * To get to Open task details
 * @param SalesOrder
 * @param Line
 * @returns {nlapiSearchRecord}
 */
function getOpenTaskDetails(sonumber,lineid)
{

	var filter = new Array();
	filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', sonumber)); 
	filter.push(new nlobjSearchFilter('custrecord_wmsse_kitflag', null, 'is', 'T')); //PICK
	filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
	filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8','28']));
	filter.push(new nlobjSearchFilter('custrecord_wmsse_act_qty', null, 'isempty'));

	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{		
		filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineid));
	}
	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	// No need for loadsearch here, fetching only one record
	var opentaskordersearchresultkit = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_picktask_details',filter,null);

	return opentaskordersearchresultkit;
}
