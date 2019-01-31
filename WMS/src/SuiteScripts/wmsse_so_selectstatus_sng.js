/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function 
 */
function StatusScan(request, response)
{
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');		
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');
		var html = '';
		var getSONo = request.getParameter('custparam_soid');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var whCompany= request.getParameter('custparam_company');
		var getSONo = request.getParameter('custparam_soid');
		var getSOItem = request.getParameter('custparam_soitem');
		var getSOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var itemType=request.getParameter('custparam_itemtype');
		var cartonScreenRuleValue=request.getParameter('custparam_cartonscreenrulevalue');
		var carton=request.getParameter('custparam_carton');
		var cartonSize=request.getParameter('custparam_cartonsize');
		var cartonWeight=request.getParameter('custparam_cartonweight');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var vShipVia = request.getParameter('custparam_shipmethod');
		var ordType = request.getParameter('custparam_ordtype');		
		var department = request.getParameter('custparam_department');		
		var vclass = request.getParameter('custparam_class');
		var pickType= request.getParameter('custparam_picktype');
		var itemCount = request.getParameter('custparam_itemCount'); 
		var enteredBin = request.getParameter('custparam_enteredbin'); 
		var enteredQty = request.getParameter('custparam_enteredqty'); 
		var eneteredBinId = request.getParameter('custparam_enteredBinID'); 
		var stageFlag = request.getParameter('custparam_hdnCloseflag'); 
		var enteredLot = request.getParameter('custparam_enteredlot');
		var orderLevel = request.getParameter('custparam_orderlevel');
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate'); 
		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}


		var SOarray = new Array();
		SOarray["custparam_soid"] = getSONo;
		SOarray["custparam_enteredlot"] = enteredLot;
		SOarray["custparam_whlocation"] = whLocation;
		SOarray["custparam_company"] = whCompany;
		SOarray["custparam_option"] = getOptedField;
		SOarray["custparam_trantype"] = trantype;
		SOarray["custparam_actualbegintime"] = getActualBeginTime;
		SOarray["custparam_sointernalid"] = getSOInternalId;
		SOarray["custparam_lineno"] = getSOLineNo;
		SOarray["custparam_fetcheditemid"] = getItemInternalId;
		SOarray["custparam_customer"] = customer;
		SOarray["custparam_cartonscreenrulevalue"] = cartonScreenRuleValue;
		SOarray["custparam_carton"] = carton;
		SOarray["custparam_cartonsize"] = cartonSize;
		SOarray["custparam_cartonweight"] = cartonWeight;
		SOarray["custparam_pickreportid"] =getPickreportid;
		SOarray["custparam_uom"] = vUnits;
		SOarray["custparam_conversionrate"] = vConversionRate;
		SOarray["custparam_picktype"] = request.getParameter('custparam_picktype');
		SOarray["custparam_enteredbin"] = request.getParameter('custparam_enteredbin');
		SOarray["custparam_enteredqty"] = request.getParameter('custparam_enteredqty');		
		SOarray["custparam_enteredBinID"] = eneteredBinId;	
		SOarray["custparam_hdnCloseflag"] = stageFlag;	
		SOarray["custparam_bcComponents"] =request.getParameter('custparam_bcComponents');	
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
		// No need for loadsearch here, fetching only one record
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		var getSOItem = '';
		var blnItemUnit ='';
		var VUnitType ='';
	
		var soLineConfiguredUnit = 1;
		//var vConversionRate=1;
		var vBaseUnit='';
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
			if(vUnits == null || vUnits == '' || vUnits == 'null' || vUnits == 'null' || vUnits == 'undefined' || vUnits == undefined)
			{
				vUnits = itemresults[0].getText('saleunit');
			}


		}

		if(VUnitType != null && VUnitType != '')
		{	
			var vBaseUOMSearch=getBaseUnitRate(VUnitType);

			vBaseUnit='Base unit';
//			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
//			{
//				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
//				vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
//			}	

			if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
			}
			if(vUnits !=null && vUnits!='' && vUnits !='null' && vUnits !='undefined' && vUnits !='- None -')
			{
				soLineConfiguredUnit =getStockCoversionRate(VUnitType,vUnits,vConversionRate);
			}


		}
		if(vUnits == null || vUnits == '' ||vUnits == 'null' || vUnits == 'undefined' || vUnits == undefined)
		{
			vUnits ='';
		}
		if(getItemType == null || getItemType =='' || getItemType == 'null' || getItemType == 'undefined')
		{
			getItemType = itemType;	
		}


		itemfilters=null;
		itemcolumns=null;
		itemresults=null;
		var vStatusDetails="";
		var vStageScanRequired = request.getParameter('custparam_stagescanrequired');
		if(vStageScanRequired == null || vStageScanRequired == "" || vStageScanRequired == 'null' || 
				vStageScanRequired =='undefined' || vStageScanRequired == undefined)
		{
			vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',whLocation,'2');		

			if(vStageScanRequired!=null && vStageScanRequired!='')
			{ 
				vStageScanRequired="T";			 
			}
			else
			{
				vStageScanRequired="F";
			}
		}


		var invfilterStrat =  new Array();
		if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
		{
			if(whLocation != null && whLocation != '')
				invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
			if(getItemInternalId != null && getItemInternalId != '')
				invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', getItemInternalId));
			if(eneteredBinId!= null && eneteredBinId!= '')
				invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', eneteredBinId));

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
			if(enteredLot != null && enteredLot != '')
				invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', enteredLot));
			//No need of Load Search here as well get few record only
			vStatusDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);
		}
		nlapiLogExecution('DEBUG', 'vStatusDetails', vStatusDetails);
		var vStatusDetailsArr =  new Array();
		var eneteredLotTxt = '';
		var eneteredLotExpdate ='';
		var vOpenPickDetails ="";
		if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined'
			&& vStatusDetails != undefined && vStatusDetails.length != null && vStatusDetails.length >0)
		{					 
			var convRate = getStockConversionRate;
			if(soLineConfiguredUnit != null && soLineConfiguredUnit != '' && soLineConfiguredUnit !='null' &&
					soLineConfiguredUnit !='undefined' && soLineConfiguredUnit != undefined )
			{

				convRate=Number(Big(getStockConversionRate).div(soLineConfiguredUnit));
				nlapiLogExecution('DEBUG', 'convRate', convRate);
			}

			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
				vOpenPickDetails = getOPenTaskPickBinDetailsLot(getItemInternalId,eneteredBinId,whLocation,VUnitType,blnItemUnit);
			else
				vOpenPickDetails = getOPenTaskPickBinDetails(getItemInternalId,eneteredBinId,whLocation,VUnitType,blnItemUnit,'','');
			nlapiLogExecution('DEBUG', 'vOpenPickDetails', vOpenPickDetails);

			if((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem" || itemType == "lotnumberedinventoryitem" || 
					itemType=="lotnumberedassemblyitem"))
			{
				eneteredLotTxt = vStatusDetails[0].getText('inventorynumber',null,'group');
				eneteredLotExpdate = vStatusDetails[0].getValue('expirationdate','inventorynumber','group');

				var statusArr = new Array();

				if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
				{
					for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
					{
						var status = vStatusDetails[statusItr].getText('status',null,'group');
						// No need to check Status MakeAvailable flag
						//var statusMakeAvailable = vStatusDetails[statusItr].getValue('inventoryavailable','status','group');
						//if(statusMakeAvailable =="T")
						var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');
						vBinQtyAvail = Number(Big(vBinQtyAvail).mul(convRate));
						//var vBinQtyAvail=vStatusDetails[stItr].getValue('onhand',null,'sum');					
						var statusId = vStatusDetails[statusItr].getValue('status',null,'group');					
						var openPickQty = 0;
						if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
						{						
							var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
							var	vOpenPickQtyArr = vOpenPickDetails[1];
							var	vBinLotArr = vOpenPickDetails[3];
							var	vBinStatusArr = vOpenPickDetails[5];

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

						vBinQtyAvail=new Big(vBinQtyAvail);
						openPickQty=new Big(openPickQty);
						nlapiLogExecution('DEBUG', 'vBinQtyAvail', vBinQtyAvail);
						nlapiLogExecution('DEBUG', 'openPickQty', openPickQty);
						vBinQtyAvail = Number(vBinQtyAvail.minus(openPickQty));
						nlapiLogExecution('DEBUG', 'vBinQtyAvail', vBinQtyAvail);
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
								nlapiLogExecution('DEBUG', 'totalQty in get', totalQty);
								var currRow = [status,totalQty,statusId];
								vStatusDetailsArr[indx]=currRow;
							}
						}
					}
				}
				else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
				{

					for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
					{
						var status = vStatusDetails[statusItr].getText('status',null,'group');					
						var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');
						vBinQtyAvail = parseFloat(vBinQtyAvail)*parseFloat(convRate);										
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
						nlapiLogExecution('DEBUG', 'vBinQtyAvail including open picks', vBinQtyAvail);

						vBinQtyAvail=new Big(vBinQtyAvail);
						openPickQty=new Big(openPickQty);
						vBinQtyAvail = Number(vBinQtyAvail.minus(openPickQty));
						nlapiLogExecution('DEBUG', 'openPickQty', openPickQty);
						nlapiLogExecution('DEBUG', 'vBinQtyAvail excluding open picks', vBinQtyAvail);
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
								nlapiLogExecution('DEBUG', 'totalQty', totalQty);

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
					var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');

					vBinQtyAvail = Number(Big(vBinQtyAvail).mul(convRate));
					nlapiLogExecution('DEBUG', 'vBinQtyAvail', vBinQtyAvail);
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

					vBinQtyAvail=new Big(vBinQtyAvail);
					openPickQty=new Big(openPickQty);
					nlapiLogExecution('DEBUG', 'openPickQty4', openPickQty);
					vBinQtyAvail = Number(vBinQtyAvail.minus(openPickQty));
					nlapiLogExecution('DEBUG', 'vBinQtyAvail', vBinQtyAvail);
					if(parseFloat(vBinQtyAvail) > 0)
					{
						var currRow = [status,vBinQtyAvail,statusId];
						vStatusDetailsArr.push(currRow);
					}
				}
			}
		}
		nlapiLogExecution('DEBUG', 'vStatusDetailsArr', vStatusDetailsArr);
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
		"				<input type='hidden' name='hdnstatuschangevalue' id='hdnstatuschangevalue' value=" + vConversionRate + ">"+			
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getSOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnSoItem' value='" + getSOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+			
		"				<input type='hidden' name='hdncartonScreenRuleValue' value=" + cartonScreenRuleValue + ">"+
		"				<input type='hidden' name='hdncarton' value=" + carton + ">"+
		"				<input type='hidden' name='hdncartonSize' value=" + cartonSize + ">"+
		"				<input type='hidden' name='hdncartonWeight' value=" + cartonWeight + ">"+
		"				<input type='hidden' name='hdnItemType' id='hdnitemtype' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnorderLevel' value=" + orderLevel + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnvFOoverageChecked' id='hdnvFOoverageChecked' value=" + vFOoverageChecked + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"               <input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"               <input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnPickType' value='" +pickType+"'>"+
		"				<input type='hidden' name='hdnShipVia' id='hdnShipVia' value='" +vShipVia+"'>"+
		"				<input type='hidden' name='hdnitemCount' value='" +itemCount+"'>"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnStageflag' value = '"+stageFlag+"'>"+
		"				<input type='hidden' name='hdnSkip'>"+
		"				<input type='hidden' name='hdnCloseflag'>"+
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+
		"				<input type='hidden' name='hdnenteredbin' id='hdnenteredbin' value='" +enteredBin+"' >"+
		"				<input type='hidden' name='hdnenteredqty' id='hdnenteredqty' value='" +enteredQty+"' >"+
		"				<input type='hidden' name='hdnenteredbinid' id='hdnenteredbinid' value='" +eneteredBinId+"' >"+
		"				<input type='hidden' name='hdnenetedstatus' id='hdnenetedstatus'>"+
		"				<input type='hidden' name='hdnvStageScanRequired' value='" +vStageScanRequired+"'>"+
		"				<input type='hidden' name='hdnenteredlot' id='hdnenteredlot' value='" +eneteredLotTxt+"' >"+
		"				<input type='hidden' name='hdnenteredlot' id='hdnenteredlotid' value='" +enteredLot+"' >"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
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
		"				<td align = 'left' class='labelmsg'>Qty: <label>" + parseFloat(parseFloat(enteredQty).toFixed(5)) + " "+vUnits+"</label>"+
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
			"				<td   class='status-rw-display'>Inv Status"+	
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
				html = html +"				<td class='status-cl-display' ><a  onclick='return validate_selectedStatus(\""+vStatusId+"\",\""+vQty+"\");' href='#' >"+vStatus;	
				html = html +"				</a></td>";							
				html = html +"				<td class='align-right'>"+parseFloat(parseFloat(vQty).toFixed(5));
				html = html +"				</td>";				
				if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
				{
					if(eneteredLotExpdate ==null || eneteredLotExpdate =='' || eneteredLotExpdate =='null'|| eneteredLotExpdate == 'undefined' ||
							eneteredLotExpdate == undefined)
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

		response.write(html);
	}
	else 
	{


		var SOarray = new Array();
		var tempflag='F';
		var enteredQty=request.getParameter('hdnenteredqty');	
		var enteredBin=request.getParameter('hdnenteredbin');
		var enteredStatus = request.getParameter('hdnenetedstatus');
		var ordType= request.getParameter('hdnOrdtype');
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		var enteredLot = request.getParameter('hdnenteredlot');
		var cmdStage = request.getParameter('hdnStageflag');
		SOarray["custparam_enteredlot"] = enteredLot;
		SOarray["custparam_hdnCloseflag"] = cmdStage;	
		SOarray["custparam_shipmethod"] = request.getParameter('hdnShipVia');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		SOarray["custparam_option"] = request.getParameter('hdnOptedField');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		SOarray["custparam_sointernalid"] = request.getParameter('hdnSoInternalId');
		SOarray["custparam_lineno"] = request.getParameter('hdnSoLineno');
		SOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		SOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		SOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');		
		SOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		SOarray["custparam_cartonscreenrulevalue"]=request.getParameter('hdncartonScreenRuleValue');
		SOarray["custparam_carton"] =request.getParameter('hdncarton');
		SOarray["custparam_cartonsize"] =request.getParameter('hdncartonSize');
		SOarray["custparam_cartonweight"] =request.getParameter('hdncartonWeight');
		SOarray["custparam_itemtype"]=request.getParameter('hdnItemType');
		SOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_orderqty"] = request.getParameter('hdnorderQty');
		if(SOarray["custparam_orderqty"] == null || SOarray["custparam_orderqty"] == '')
			SOarray["custparam_orderqty"]=0;

		var foOverageCheck=request.getParameter('hdnvFOoverageChecked');
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;	
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		SOarray["custparam_uom"] = request.getParameter('hdnuom');
		SOarray["custparam_itemCount"] = request.getParameter('hdnitemCount');
		SOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		SOarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		SOarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		SOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		SOarray["custparam_stagescanrequired"] = request.getParameter('hdnvStageScanRequired');
		SOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		SOarray["custparam_enteredbin"] = request.getParameter('hdnenteredbin');
		SOarray["custparam_enteredqty"] = request.getParameter('hdnenteredqty');
		SOarray["custparam_enteredlot"] =  request.getParameter('hdnenteredlotid');
		var eneteredBinId = request.getParameter('hdnenteredbinid');
		SOarray["custparam_enteredBinID"] = eneteredBinId;
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var pickType = request.getParameter('hdnPickType');
		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var orderLevel=request.getParameter('hdnorderLevel');
		var itemType=request.getParameter('hdnItemType');
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var soInternalId=request.getParameter('hdnSoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var soLineno=request.getParameter('hdnSoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var preferBinQty=request.getParameter('hdnPreferBinQty');
		var optedEvent = request.getParameter('cmdPrevious');	
		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');
		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'enteredQty = ' + enteredQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enteredBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'soInternalId = ' + soInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'soLineno = ' + soLineno + '<br>';
		logMsg = logMsg + 'preferBin = ' + preferBin + '<br>';
		logMsg = logMsg + 'foOverageCheck = ' + foOverageCheck + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		logMsg = logMsg + 'enteredStatus = ' + enteredStatus + '<br>';		
		logMsg = logMsg + 'itemCount = ' + SOarray["custparam_itemCount"] + '<br>';
		logMsg = logMsg + 'enteredLot = ' + enteredLot + '<br>';
		logMsg = logMsg + 'sessionobj = ' + sessionobj + '<br>';
		logMsg = logMsg + 'context.getUser() = ' + context.getUser() + '<br>';
		logMsg = logMsg + 'itemType= ' + itemType + '<br>';
		logMsg = logMsg + 'SOarray["custparam_orderlevel"]= ' + SOarray["custparam_orderlevel"] + '<br>';
		logMsg = logMsg + 'cmdStage= ' + cmdStage + '<br>';		

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
					if(enteredStatus!=null && enteredStatus!="" && enteredStatus!='null' )
					{
						try
						{

							if(enteredLot == null || enteredLot == '' || enteredLot == 'null' || enteredLot == undefined)
								enteredLot='';


							SOarray["custparam_itemtype"] = itemType;
							SOarray["custparam_enterQty"] = enteredQty;
							if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{
								SOarray["custparam_error"] ='';
								SOarray["custparam_status"] =enteredStatus;
								SOarray["custparam_enterQty"] =enteredQty;
								SOarray["custparam_enterBin"] =enteredBin;
								SOarray["custparam_screen"] ='fromstatusscreen';
								response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
								return;
							}
							var soLineItemDetails = getSOLineDetailsNew(SOarray["custparam_soid"],trantype,FetchedItemId,SOarray["custparam_whlocation"]);

							var vMultiShipping='F';
							var vShipVia='';
							//To fetch Line level multi shipping flag and ship via validation
							if(soLineItemDetails !=null && soLineItemDetails!="" && soLineItemDetails.length > 0 )
							{
								logMsg = logMsg + 'soLineItemDetails= ' + soLineItemDetails.length + '<br>';
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
								}
								var vSoreminqty =0;
								for(var lineDetailsItr=0;lineDetailsItr<soLineItemDetails.length;lineDetailsItr++)
								{
									var vsoLine = soLineItemDetails[lineDetailsItr].getValue('line',null,'group');
									var vsoitemQty=soLineItemDetails[lineDetailsItr].getValue(vColumnslist[commitedQtyIndex]);
									var vsoitemfulfillQty=soLineItemDetails[lineDetailsItr].getValue(vColumnslist[fulfilledQtyIndex]);							
									var vsoitemopentaskQty=soLineItemDetails[lineDetailsItr].getValue(vColumnslist[totalPickedQtyIndex]);
									var vsoitemErpConfirmedQty=soLineItemDetails[lineDetailsItr].getValue(vColumnslist[ERPConfirmedQty]);
									var vsoitemNSReceivedQty=soLineItemDetails[lineDetailsItr].getValue(vColumnslist[totalNSPickedQtyIndex]);
									if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
									{
										vsoitemopentaskQty = 0;
									}
									if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' || 
											vsoitemErpConfirmedQty=='undefined' )
									{
										vsoitemErpConfirmedQty = 0;
									}
									if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || 
											vsoitemNSReceivedQty=='undefined' )
									{
										vsoitemNSReceivedQty = 0;
									}


									vsoitemopentaskQty=new Big(vsoitemopentaskQty);
									vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
									vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
									var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty.minus(vsoitemErpConfirmedQty))));
									nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);


									if(vsoitemRcvQty==null || vsoitemRcvQty=='')
										vsoitemRcvQty=0;
									if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
										vsoitemfulfillQty=0;

									vsoitemQty=new Big(vsoitemQty);
									vsoitemfulfillQty=new Big(vsoitemfulfillQty);
									vsoitemRcvQty=new Big(vsoitemRcvQty);
									vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
									nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);
									if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1) && 
											trantype == 'transferorder'))
									{
										vMultiShipping = soLineItemDetails[lineDetailsItr].getValue('ismultishipto',null,'group');
										if(vMultiShipping ==  null || vMultiShipping =='')
											vMultiShipping='F';

										vShipVia=soLineItemDetails[lineDetailsItr].getValue('shipmethod',null,'group');

										break;
									}			

								}	

							}

							var taskType="PICK";
							if(cmdStage == 'Pick And Close')
							{
								if(parseFloat(vSoreminqty) > 0)
								{
									// passing invetorystatus as a parameter to the opentask creation function
									if(vStageScanRequired == "F")
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,SOarray["custparam_whlocation"],
												enteredLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
												SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
												'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
												ordType,department,vclass,null,null,enteredStatus);
									else
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,SOarray["custparam_whlocation"],
												enteredLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
												SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
												'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
												ordType,department,vclass,null,null,enteredStatus);
									context.setSessionObject('record', 'created'); 

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
											response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
											return;
										}
									}
									SOarray["custparam_error"] ='';
									SOarray["custparam_closebtn"] = 'Pick&Close';
									if(vStageScanRequired == "F")
										response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
									else
										response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
									return;
								}
							}
							var isItLastPick='F';
							if(parseFloat(vSoreminqty) > 0)
							{
								//var soLineDetails = getSOLineDetailsNew(SOarray["custparam_soid"],trantype,null,SOarray["custparam_whlocation"]);
								if(vStageScanRequired == "F")
								{
									var soLineDetails=getSOqtyscandetails(SOarray["custparam_sointernalid"],trantype,SOarray["custparam_whlocation"]);

									if(soLineDetails !=null && soLineDetails!="")
									{
										var vLinecount=0;									
										if(soLineDetails.length>0)
										{
											var vColumnslist=soLineDetails[0].getAllColumns();
											var vOpentaskdetails = getPickedqtydetails(SOarray["custparam_sointernalid"],trantype,SOarray["custparam_whlocation"]);
											
											for(var soDetailsItr=0;soDetailsItr<soLineDetails.length;soDetailsItr++)
											{
												var vsoitem = soLineDetails[soDetailsItr].getText('item');
												var vsoitemId = soLineDetails[soDetailsItr].getValue('item');
												var vsoitemType=soLineDetails[soDetailsItr].getValue('type','item');

												if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
													|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
												{
													var vsoitemQty=soLineDetails[soDetailsItr].getValue('quantity');
												}
												else
												{
													var vsoitemQty=soLineDetails[soDetailsItr].getValue('quantitycommitted');
												}

												var vsoitemfulfillQty=soLineDetails[soDetailsItr].getValue('quantitypicked');				

												var vsoitemNSReceivedQty=soLineDetails[soDetailsItr].getValue('quantitypicked');
												var vsoitemNSshippedQty=soLineDetails[soDetailsItr].getValue('quantityshiprecv');
												var vsoitemMultiShipping = soLineDetails[soDetailsItr].getValue('ismultishipto');
												var vsoitemShipVia = soLineDetails[soDetailsItr].getValue('shipmethod');

												var vsoitemLine = soLineDetails[soDetailsItr].getValue('line');					
												var vUnitsText = soLineDetails[soDetailsItr].getValue('unit');
												var vConversionRate = soLineDetails[soDetailsItr].getValue('formulanumeric');


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
													vsoitemQty=parseFloat(vsoitemQty)/parseFloat(vConversionRate);
													vsoitemNSReceivedQty=parseFloat(vsoitemNSReceivedQty)/parseFloat(vConversionRate);
													vsoitemNSshippedQty=parseFloat(vsoitemNSshippedQty)/parseFloat(vConversionRate);

												}


												var vsoitemRcvQty = parseFloat(vsoitemopentaskQty)+parseFloat(vsoitemNSReceivedQty);
												if(vsoitemRcvQty==null || vsoitemRcvQty=='')
													vsoitemRcvQty=0;

												if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
													|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
												{
													var vsoitemRemQty = parseFloat(vsoitemQty) - parseFloat(vsoitemRcvQty);
												}
												else
												{
													var vsoitemRemQty = parseFloat(vsoitemQty)+parseFloat(vsoitemNSshippedQty) - parseFloat(vsoitemRcvQty);
												}

												if(vsoitemMultiShipping ==  null || vsoitemMultiShipping =='')
													vsoitemMultiShipping='F';
												if(vsoitemMultiShipping == "F")
												{
													if(parseFloat(vsoitemRemQty)>0)
													{
														vLinecount=parseFloat(vLinecount)+1;

												}
												if(trantype=='transferorder')
													vsoitemLine=vsoitemLine-1;
												if(vsoitemLine==SOarray["custparam_lineno"])
												{
													//enteredQty = parseFloat(parseFloat(enteredQty).toFixed(5));
													//vsoitemRemQty = parseFloat(parseFloat(vsoitemRemQty).toFixed(5));


													var totalQty=Number(Big(vsoitemRemQty).minus(enteredQty));
													nlapiLogExecution('DEBUG', 'totalQty1', totalQty);
													if(parseFloat(totalQty)> 0)
													{
														vLinecount=parseFloat(vLinecount)+1;
													}													

												}
											}
											else
											{
												if(parseFloat(vsoitemRemQty)>0 && vsoitemShipVia == vShipVia)
												{
													vLinecount=parseFloat(vLinecount)+1;
												}
												if(trantype=='transferorder')
													vsoitemLine=vsoitemLine-1;
												if(vsoitemLine==SOarray["custparam_lineno"] && vsoitemShipVia == vShipVia)
												{
													nlapiLogExecution('ERROR', 'Inside same line', SOarray["custparam_lineno"]);

													var totalQty=Number(Big(vsoitemRemQty).minus(enteredQty));
													nlapiLogExecution('DEBUG', 'totalQty2', totalQty);
													if(parseFloat(totalQty)> 0)
													{
														vLinecount=parseFloat(vLinecount)+1;
													}

												}
											}
										}
										if(parseFloat(vLinecount)>1)
										{
											isItLastPick="F";
										}
										else
										{
											isItLastPick="T";
										}
									}

									}
									soLineDetails=null;
								}
								logMsg = logMsg + 'isItLastPick= ' + isItLastPick + '<br>';				

								// To post IF when order level is true and lastpick is true for already packed containers against order
								if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T")
								{
									var filtersPack = new Array();
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));

									// No need for loadsearch here, getting only Pack tasks only
									var opentaskSearchResultsPack=nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_open_packtask_details',filtersPack,null);
									if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
									{										
										var fieldsPack = new Array();
										var valuesPack = new Array();
										for(var openTskItr=0; openTskItr < opentaskSearchResultsPack.length; openTskItr++)
										{

											var RecordIdPack=opentaskSearchResultsPack[openTskItr].getValue('internalid',null,'group');
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
								if(isItLastPick!=null && isItLastPick!='' && isItLastPick=="T")
								{
									if(vStageScanRequired == "F")
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,
												SOarray["custparam_whlocation"],enteredLot,'','','',soInternalId,null,null,null,taskType,
												SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],"T",
												trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',
												SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
												ordType,department,vclass,'','',enteredStatus);
									else
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,
												SOarray["custparam_whlocation"],enteredLot,'','','',soInternalId,null,null,null,taskType,
												SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],"F",
												trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',
												SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
												ordType,department,vclass,'','',enteredStatus);
									context.setSessionObject('record', 'created'); 
								}
								else
								{
									if(SOarray["custparam_orderlevel"] =="T")
									{
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,SOarray["custparam_whlocation"],
												enteredLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
												SOarray["custparam_cartonweight"],'F',trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',
												SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),ordType,
												department,vclass,'','',enteredStatus);
										context.setSessionObject('record', 'created'); 
									}
									else
									{
										if(vStageScanRequired == "F")
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,SOarray["custparam_whlocation"],
													enteredLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',
													SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
													ordType,department,vclass,'','',enteredStatus);
										else
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,SOarray["custparam_whlocation"],
													enteredLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',
													SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
													ordType,department,vclass,'','',enteredStatus);
										context.setSessionObject('record', 'created'); 

									}
								}
							}

							//soLineDetails = getSOLineDetailsNew(SOarray["custparam_soid"],trantype,null,SOarray["custparam_whlocation"]);
							soLineDetails = getSOqtyscandetails(SOarray["custparam_sointernalid"],trantype,SOarray["custparam_whlocation"]);
							logMsg = logMsg + 'soLineDetails= ' + soLineDetails + '<br>';
							logMsg = logMsg + 'pickType= ' + pickType + '<br>';
							nlapiLogExecution('DEBUG', 'Processing RF ', logMsg);
							if(soLineDetails !=null && soLineDetails!="" && cmdStage != 'Pick And Stage')
							{

								if(soLineDetails.length>0)
								{
									var vColumnslist=soLineDetails[0].getAllColumns();
									
									var vOpentaskdetails = getPickedqtydetails(SOarray["custparam_sointernalid"],trantype,SOarray["custparam_whlocation"]);
									for(var soLinesItr=0;soLinesItr<soLineDetails.length;soLinesItr++)
									{ 
										var vsoitem = soLineDetails[soLinesItr].getText('item');
										var vsoitemId = soLineDetails[soLinesItr].getValue('item');
										var vsoitemType=soLineDetails[soLinesItr].getValue('type','item');

										if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
											|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
										{
											var vsoitemQty=soLineDetails[soLinesItr].getValue('quantity');
										}
										else
										{
											var vsoitemQty=soLineDetails[soLinesItr].getValue('quantitycommitted');
										}

										var vsoitemfulfillQty=soLineDetails[soLinesItr].getValue('quantitypicked');				

										var vsoitemNSReceivedQty=soLineDetails[soLinesItr].getValue('quantitypicked');
										var vsoitemNSshippedQty=soLineDetails[soLinesItr].getValue('quantityshiprecv');


										var vsoitemLine = soLineDetails[soLinesItr].getValue('line');					
										var vUnitsText = soLineDetails[soLinesItr].getValue('unit');
										var vConversionRate = soLineDetails[soLinesItr].getValue('formulanumeric');


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



										if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
										{	
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
											return;
										}

										else if((parseFloat(itemRemQty)>0))
										{
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
											return;
										}	

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
											response.sendRedirect('SUITELET', 'customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
											return; 
										}
									}
									SOarray["custparam_error"] ='';
									if(vStageScanRequired == "F")
										response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
									else
										response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
									return;
								}
								else
								{
									nlapiLogExecution('DEBUG', 'vStageScanRequired ', vStageScanRequired);
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
											response.sendRedirect('SUITELET', 'customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
											return; 
										}
									}
									SOarray["custparam_error"] ='';
									if(vStageScanRequired == "F")
									{
										response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);		
									}

									else
									{
										response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
									}									

									return; 

								}
								soLineDetails=null;
							}
							else
							{
								nlapiLogExecution('DEBUG', 'vStageScanRequired', vStageScanRequired);
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
										response.sendRedirect('SUITELET', 'customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
										return; 
									}
								}
								SOarray["custparam_error"] ='';
								if(vStageScanRequired == "F")
								{
									response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
								}										
								else
								{
									response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
								}

								return;
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

							response.sendRedirect('SUITELET', 'customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
							return; 
						}

					}
					else
					{
						SOarray["custparam_error"] = 'Please select status';				
						response.sendRedirect('SUITELET', ' customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
						return;
					}
				} 
				else 
				{
					try 
					{
						var lockfilters=new Array();
						lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',FetchedItemId));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',eneteredBinId));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
						var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlocks_del_sch', lockfilters, null);
						// No need for loadsearch here, fetching only one record
						if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
						{
							nlapiLogExecution('Debug','lockresults', lockresults);
							var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
							nlapiLogExecution('Debug','DeleteRecordId', DeleteRecordId);

						}
					}
					catch(exp)
					{
						nlapiLogExecution('ERROR','Exception in lock records', exp);
					}

					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						SOarray["custparam_error"] ='';
						SOarray["custparam_enterQty"] =enteredQty;
						SOarray["custparam_enterBin"] =enteredBin
						response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
						return;
					}
					else
					{

						SOarray["custparam_error"] ='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
						return
					}
				}


			}
			catch (e) 
			{

				nlapiLogExecution('ERROR', 'Exception: ', e);
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
				response.sendRedirect('SUITELET', 'customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			SOarray["custparam_error"] = 'Transaction Is In Progress...';
			response.sendRedirect('SUITELET', 'customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
		}
	} //end of first if condition
} //end of function.


