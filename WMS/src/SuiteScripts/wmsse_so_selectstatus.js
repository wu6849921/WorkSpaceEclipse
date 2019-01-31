/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

/**
 * Main function 
 */
function StatusScan(request, response){
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

		//Get the PO# from the previous screen, which is passed as a parameter		
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
		nlapiLogExecution('Debug', 'vShipVia', vShipVia);
		var ordType = request.getParameter('custparam_ordtype');		
		var department = request.getParameter('custparam_department');		
		var vclass = request.getParameter('custparam_class');
		var pickType= request.getParameter('custparam_picktype');
		var itemCount = request.getParameter('custparam_itemCount'); 
		var enteredBin = request.getParameter('custparam_enteredbin'); 
		var enteredQty = request.getParameter('custparam_enteredqty'); 
		var eneteredBinId = request.getParameter('custparam_enteredBinID'); 
		var closeFlag = request.getParameter('custparam_hdnCloseflag'); 
		var enteredLot = request.getParameter('custparam_enteredlot');
		var orderLevel = request.getParameter('custparam_orderlevel');
		var stageFlag = request.getParameter('custparam_hdnStageflag'); 

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		nlapiLogExecution('Debug', 'stageFlag', stageFlag);
		//Locking records
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
		SOarray["custparam_hdnCloseflag"] = closeFlag;	
		SOarray["custparam_hdnStageflag"] = stageFlag;	
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		var domainName = fndomainName();

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

		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		var getSOItem = '';
		var blnItemUnit ='';
		var VUnitType ='';
		var getStockConversionRate =1;
		var soLineConfiguredUnit = 1;
		var conversionRate=1;
		var vBaseUnit='';
		if(itemresults!=null && itemresults!='')
		{
			if(itemresults[0].getValue('isinactive')=="T")
			{
				SOarray["custparam_error"] = 'Entered item is inactive';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
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
//			conversionRate=vBaseUOMSearch[0].getValue('conversionrate');
//			vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
//			}	

			if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,conversionRate);
			}
			if(vUnits !=null && vUnits!='' && vUnits !='null' && vUnits !='undefined' && vUnits !='- None -')
			{
				soLineConfiguredUnit =getStockCoversionRate(VUnitType,vUnits,conversionRate);
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
		var systemRule_AllowExpiredItems='';
		systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',whLocation);
		var eneteredLotId = request.getParameter('custparam_enterlotid');

		var vStatusDetails = new Array();
		var vStatusResults = null;
		if(getItemType == "lotnumberedinventoryitem" || getItemType =="lotnumberedassemblyitem")
		{
			vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_inventorybalance');
		}
		else if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
		{
			vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh');	
		}
		else
		{
			vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_invt_item');	  
		}

		if(whLocation != null && whLocation != '')
			vStatusResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', whLocation));
		if(getItemInternalId != null && getItemInternalId != '')
			vStatusResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', getItemInternalId));
		if(eneteredBinId!= null && eneteredBinId!= '')
			vStatusResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', eneteredBinId));
		if(enteredLot != null && enteredLot != '')
		{

			vStatusResults.addFilter(new nlobjSearchFilter('inventorynumber',null, 'anyof', enteredLot));

			if(systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
			{
				vStatusResults.addFilter(new nlobjSearchFilter('formuladate',null, 'onorafter',DateStamp()).setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
			}

		}

		var resLen = vStatusResults.runSearch();
		var invItr=0;
		var resultSet = resLen.forEachResult(function(searchResult)	
				{
			invItr++;
			vStatusDetails.push(searchResult);
			if(invItr==4000)
			{
				return false;
			}
			return true;                // return true to keep iterating
				});

		var vStatusDetailsArr =  new Array();
		var eneteredLotTxt = '';
		var eneteredLotExpdate ='';
		var vOpenPickDetails ="";
		if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined' &&
				vStatusDetails != undefined && vStatusDetails.length != null && vStatusDetails.length >0)
		{
			//var convRate = parseFloat(getStockConversionRate)/parseFloat(vConversionRate);

			var convRate = 1;
			if(soLineConfiguredUnit != null && soLineConfiguredUnit != '' && soLineConfiguredUnit !='null' &&
					soLineConfiguredUnit !='undefined' && soLineConfiguredUnit != undefined )
			{

				convRate=Number(Big(getStockConversionRate).div(soLineConfiguredUnit));
				nlapiLogExecution('DEBUG', 'convRate', convRate);
			}


			if(getItemType == "lotnumberedinventoryitem" || getItemType =="lotnumberedassemblyitem")
				vOpenPickDetails = getOPenTaskPickBinDetailsLot(getItemInternalId,eneteredBinId,whLocation,VUnitType,blnItemUnit);
			else
				vOpenPickDetails = getOPenTaskPickBinDetails(getItemInternalId,eneteredBinId,whLocation,VUnitType,blnItemUnit,'','');

			nlapiLogExecution('DEBUG', 'vOpenPickDetails', vOpenPickDetails);

			if((getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem" || 
					getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem"))
			{
				eneteredLotTxt = vStatusDetails[0].getText('inventorynumber',null,'group');
				eneteredLotExpdate = vStatusDetails[0].getValue('expirationdate','inventorynumber','group');
			}
			var statusArr = new Array();

			for(var statusIterator=0;statusIterator<vStatusDetails.length;statusIterator++)
			{
				var status = '';
				var vBinQtyAvail ='';
				var statusId = '';
				if((getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem" || 
						getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem"))
				{
					status = vStatusDetails[statusIterator].getText('status',null,'group');					
					vBinQtyAvail=vStatusDetails[statusIterator].getValue('available',null,'sum');				
					statusId = vStatusDetails[statusIterator].getValue('status',null,'group');
				}
				else
				{
					status = vStatusDetails[statusIterator].getText('status');					
					vBinQtyAvail=vStatusDetails[statusIterator].getValue('available');				
					statusId = vStatusDetails[statusIterator].getValue('status');
				}
				nlapiLogExecution('DEBUG', 'status  bef', status);
				var openPickQty = 0;
				if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
				{

					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{

						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinLotArr = vOpenPickDetails[3];
						var	vBinStatusArr = vOpenPickDetails[5];
						nlapiLogExecution('Debug','vBinStatusArr',vBinStatusArr);
						if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null'
							&& vBinStatusArr != 'undefined' && vBinStatusArr != undefined)
						{
							for(var binIterator=0;binIterator<vBinLotArr.length;binIterator++)
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

						nlapiLogExecution('Debug','openPickQty',openPickQty);

					}
				}
				else
				{
					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{
						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinStatusArr = vOpenPickDetails[3];
						if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined'
							&& vBinStatusArr != undefined)
						{
							for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
							{
								var opentaskStatus = vBinStatusArr[binIterator];

								if(opentaskStatus == statusId)
								{
									nlapiLogExecution('DEBUG', 'vBinQtyAvail bef', vBinQtyAvail);
									openPickQty = vOpenPickQtyArr[binIterator];
									break;
								}
							}
						}

					}
				}


				vBinQtyAvail=new Big(vBinQtyAvail);
				openPickQty=new Big(openPickQty);
				vBinQtyAvail = Number(vBinQtyAvail.minus(openPickQty));
				nlapiLogExecution('DEBUG', 'vBinQtyAvail1', vBinQtyAvail);
				if(parseFloat(vBinQtyAvail) > 0)
				{
					if(statusArr.indexOf(statusId)==-1)
					{

						vBinQtyAvail = Number(Big(vBinQtyAvail).mul(convRate));
						nlapiLogExecution('DEBUG', 'vBinQtyAvail2', vBinQtyAvail);

						//	vBinQtyAvail = parseFloat(parseFloat(vBinQtyAvail).toFixed(5));
						var currRow = [status,vBinQtyAvail,statusId];
						statusArr.push(statusId);
						vStatusDetailsArr.push(currRow);
					}
					else
					{


						vBinQtyAvail = Number(Big(vBinQtyAvail).mul(convRate));
						nlapiLogExecution('DEBUG', 'vBinQtyAvail3', vBinQtyAvail);

						//vBinQtyAvail = parseFloat(parseFloat(vBinQtyAvail).toFixed(5));
						var indx = statusArr.indexOf(statusId);
						var Row = vStatusDetailsArr[indx];
						var qty = Row[1];

						var totalQty = Number(Big(qty).plus(vBinQtyAvail));
						nlapiLogExecution('DEBUG', 'totalQty1', totalQty);
						var currRow = [status,totalQty,statusId];
						vStatusDetailsArr[indx]=currRow;

					}
				}

			}
		}

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('Debug', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			nlapiLogExecution('Debug', 'imgUrl', imgUrl);
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
		" document.getElementById('div_error').innerHTML = 'Selected qty is less than required quantity.' ;return false;}" +
		"document.getElementById('hdnenetedstatus').value = statusId;document.forms['_rf_select_status'].submit();" +
		"document.getElementById('loading').style.display = 'block'; return true;}</script>";
		html = html + "</head><body onkeydown='return OnKeyDown_CL();'> ";

		html = html +"	<form name='_rf_select_status' method='POST'><input name='cmdSend1' type='submit' " +
		" class='defaultlink'   value='' onclick=' return validateForm_soQtySingle();'/>"+ 	

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
		"				<input type='hidden' name='hdnCloseflag' value = '"+closeFlag+"'>"+
		"				<input type='hidden' name='hdnSkip'>"+
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
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value='" + getStockConversionRate + "'>"+
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
			"				<td   class='status-rw-display'> Inv Status"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";	
			if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
			{
				html = html +"<td>Expiry Date"+	
				"				</td>";	
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			for(var b=0;b<vStatusDetailsArr.length;b++)
			{


				if(b%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';


				var currValues = vStatusDetailsArr[b];
				var vStatus = currValues[0];
				if(vStatus != null && vStatus != '' && vStatus != 'null' && vStatus != undefined && vStatus != 'undefined')
				{
					var invtStatusStringArray = vStatus.split(' ');
					if(invtStatusStringArray != null && invtStatusStringArray != '' &&
							invtStatusStringArray != 'null' && invtStatusStringArray != undefined &&
							invtStatusStringArray !='undefined'&& invtStatusStringArray.length >1)
					{
						vStatus   = getInvtStatusStr(invtStatusStringArray);
					}
				}
				var vQty = currValues[1];
				var vStatusId = currValues[2];

				//case # 201412820 start
				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td class='status-cl-display'><a onclick='return validate_selectedStatus(\""+vStatusId+"\",\""+vQty+"\");'" +
				" href='#' >"+vStatus;	
				html = html +"				</a></td>";
				html = html +"				<td class='align-right'>"+ parseFloat(parseFloat(vQty).toFixed(5));
				html = html +"				</td>";
				//html = html +"				<td></td>";
				if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
				{
					if(eneteredLotExpdate ==null || eneteredLotExpdate =='' || eneteredLotExpdate =='null'|| 
							eneteredLotExpdate == 'undefined' ||  eneteredLotExpdate == undefined)
						eneteredLotExpdate="";
					//html = html +"				<td></td>";
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
	else {
		nlapiLogExecution('Debug', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array SOarray
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
		var cmdClose = request.getParameter('hdnCloseflag');
		SOarray["custparam_hdnStageflag"] = cmdStage;
		SOarray["custparam_enteredlot"] = enteredLot;
		SOarray["custparam_hdnCloseflag"] = cmdClose;	
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
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var eneteredBinId = request.getParameter('hdnenteredbinid');
		SOarray["custparam_enteredBinID"] = eneteredBinId;
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
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
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
		nlapiLogExecution('Debug', 'Processing RF - QTY', logMsg);
		nlapiLogExecution('Debug', 'sessionobj', sessionobj);
		nlapiLogExecution('Debug', 'context.getUser()', context.getUser());
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
					if(enteredStatus!=null && enteredStatus!="" && enteredStatus!='null' )
					{
						try{	

							nlapiLogExecution('Debug', 'enteredStatus', enteredStatus);
							if(enteredLot == null || enteredLot == '' || enteredLot == 'null' || enteredLot == undefined)
								enteredLot='';

							if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{
								SOarray["custparam_error"] ='';
								SOarray["custparam_inventorystatus"] =enteredStatus;
								SOarray["custparam_enterQty"] =enteredQty;
								SOarray["custparam_enterBin"] =enteredBin;
								SOarray["custparam_screen"] ='fromstatusscreen';
								nlapiLogExecution('Debug', 'into serializedinventoryitem', itemType);
								response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan', 'customdeploy_wmsse_soserial_scan', 
										false, SOarray);
								return;
							}
							var soLineItemDetails = getSOLineDetailsNew(SOarray["custparam_soid"],trantype,FetchedItemId,
									SOarray["custparam_whlocation"]);

							nlapiLogExecution('Debug', 'soLineItemDetails', soLineItemDetails);
							var vMultiShipping='F';
							var vShipVia='';
							//To fetch Line level multi shipping flag and ship via validation
							if(soLineItemDetails !=null && soLineItemDetails!="" && soLineItemDetails.length > 0 )
							{	

								var vColumnslist=soLineItemDetails[0].getAllColumns();

								var custIndex = 12;
								var commitedQtyIndex = 25;
								var fulfilledQtyIndex = 26;
								var conversionRateIndex=27;
								var totalPickedQtyIndex =7;
								var totalNSPickedQtyIndex =37;
								var ERPConfirmedQty =38;
								for(var soLineItr=0;soLineItr<vColumnslist.length;soLineItr++)
								{
									var summaryLabel = vColumnslist[soLineItr].getLabel();
									var name =  vColumnslist[soLineItr].getName();
									if(summaryLabel == 'Customer Id')
									{
										custIndex = soLineItr;
									}
									else if (summaryLabel == 'Committed Quantity')
									{
										commitedQtyIndex = soLineItr;
									}
									else if (summaryLabel == 'Fulfilled Quantity' && name == 'formulanumeric')
									{
										fulfilledQtyIndex = soLineItr;
									}
									else if (summaryLabel == 'Conversion Rate')
									{
										conversionRateIndex = soLineItr;
									}
									else if (summaryLabel == 'Total Picked Quantity')
									{
										totalPickedQtyIndex = soLineItr;
									}
									else if (summaryLabel == 'ERPpickedQuantity')
									{
										totalNSPickedQtyIndex = soLineItr;
									}
									else if (summaryLabel == 'ERP CONFIRMED QTY')
									{
										ERPConfirmedQty = soLineItr;
									}
									else
									{

									}
								}
								var vSoreminqty =0;
								for(var soLineItrator=0;soLineItrator<soLineItemDetails.length;soLineItrator++)
								{
									var vsoLine = soLineItemDetails[soLineItrator].getValue('line',null,'group');
									var vsoitemQty=soLineItemDetails[soLineItrator].getValue(vColumnslist[commitedQtyIndex]);
									var vsoitemfulfillQty=soLineItemDetails[soLineItrator].getValue(vColumnslist[fulfilledQtyIndex]);							
									var vsoitemopentaskQty=soLineItemDetails[soLineItrator].getValue(vColumnslist[totalPickedQtyIndex]);
									var vsoitemErpConfirmedQty=soLineItemDetails[soLineItrator].getValue(vColumnslist[ERPConfirmedQty]);
									var vsoitemNSReceivedQty=soLineItemDetails[soLineItrator].getValue(vColumnslist[totalNSPickedQtyIndex]);
									if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || 
											vsoitemopentaskQty=='undefined' )
									{
										vsoitemopentaskQty = 0;
									}
									if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' 
										|| vsoitemErpConfirmedQty=='undefined' )
									{
										vsoitemErpConfirmedQty = 0;
									}
									if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' 
										|| vsoitemNSReceivedQty=='undefined' )
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
									vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
									nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);
									if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1)
											&& trantype == 'transferorder'))
									{
										vMultiShipping = soLineItemDetails[soLineItrator].getValue('ismultishipto',null,'group');
										if(vMultiShipping ==  null || vMultiShipping =='')
											vMultiShipping='F';

										vShipVia=soLineItemDetails[soLineItrator].getValue('shipmethod',null,'group');

										break;
									}			

								}	

							}
							nlapiLogExecution('Debug', 'vMultiShipping : vShipVia ', vMultiShipping + ":" + vShipVia);
							var taskType="PICK";
							if(request.getParameter('hdnCloseflag') == 'PickAndClose')
							{



								if(parseFloat(vSoreminqty) > 0)
								{
									if(vStageScanRequired == "F")
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,
												SOarray["custparam_whlocation"],enteredLot,'','','',soInternalId,null,null,null,taskType,
												SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"]
										,"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',
										SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
										ordType,department,vclass,getPickreportid,null,enteredStatus);
									else
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,
												SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,taskType,
												SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
												SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],
												SOarray["custparam_customer"],'','','','','','',SOarray["custparam_uom"],
												SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),ordType,
												department,vclass,getPickreportid,null,enteredStatus);
									context.setSessionObject('record', 'created'); 
									SOarray["custparam_error"] ='';
									SOarray["custparam_closebtn"] = 'Pick&Close';
									if(vStageScanRequired == "T")
										response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
									else
										response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
									return;
								}
							}


							var isItLastPick='F';
							if(parseFloat(vSoreminqty) > 0)
							{
								if(vStageScanRequired == "F")
								{
									//var soLineDetails = getSOLineDetailsNew(SOarray["custparam_soid"],trantype,null,SOarray["custparam_whlocation"]);
									var soLineDetails=getSOqtyscandetails(SOarray["custparam_sointernalid"],trantype,SOarray["custparam_whlocation"]);

									if(soLineDetails !=null && soLineDetails!="")
									{
										var vLinecount=0;
										nlapiLogExecution('Debug', 'soLineDetails.length', soLineDetails.length);
										if(soLineDetails.length>0)
										{
											var vColumnslist=soLineDetails[0].getAllColumns();
											var vOpentaskdetails = getPickedqtydetails(SOarray["custparam_sointernalid"],trantype,SOarray["custparam_whlocation"]);
											for(var cntr=0;cntr<soLineDetails.length;cntr++)
											{

												var vsoitem = soLineDetails[cntr].getText('item');
												var vsoitemId = soLineDetails[cntr].getValue('item');
												var vsoitemType=soLineDetails[cntr].getValue('type','item');

												if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
													|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
												{
													var vsoitemQty=soLineDetails[cntr].getValue('quantity');
												}
												else
												{
													var vsoitemQty=soLineDetails[cntr].getValue('quantitycommitted');
												}

												var vsoitemfulfillQty=soLineDetails[cntr].getValue('quantitypicked');				

												var vsoitemNSReceivedQty=soLineDetails[cntr].getValue('quantitypicked');
												var vsoitemNSshippedQty=soLineDetails[cntr].getValue('quantityshiprecv');
												var vsoitemMultiShipping = soLineDetails[cntr].getValue('ismultishipto');
												var vsoitemShipVia = soLineDetails[cntr].getValue('shipmethod');

												var vsoitemLine = soLineDetails[cntr].getValue('line');					
												var vUnitsText = soLineDetails[cntr].getValue('unit');
												var vConversionRate = soLineDetails[cntr].getValue('formulanumeric');


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
													var vsoitemRemQty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));
												}
												else
												{
													vsoitemQty=Big(vsoitemQty);
													vsoitemNSshippedQty=Big(vsoitemNSshippedQty);
													vsoitemRcvQty=Big(vsoitemRcvQty);
													var vsoitemRemQty = Number(Big(vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
												}
												nlapiLogExecution('Debug', 'vsoitemRemQty', vsoitemRemQty);
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
														if(parseFloat(totalQty)> 0)
														{
															//isItLastPick="T";
															vLinecount=parseFloat(vLinecount)+1;
														}
														nlapiLogExecution('Debug', 'vLinecount', vLinecount);

													}
												}
												else
												{
													nlapiLogExecution('Debug', 'else vsoitemMultiShipping', vsoitemMultiShipping);
													if(parseFloat(vsoitemRemQty)>0 && vsoitemShipVia == vShipVia)
													{
														vLinecount=parseFloat(vLinecount)+1;
													}
													if(trantype=='transferorder')
														vsoitemLine=vsoitemLine-1;
													if(vsoitemLine==SOarray["custparam_lineno"] && vsoitemShipVia == vShipVia)
													{
														nlapiLogExecution('Debug', 'Inside same line', SOarray["custparam_lineno"]);
														var totalQty=Number(Big(vsoitemRemQty).minus(enteredQty));
														nlapiLogExecution('DEBUG', 'totalQty2', totalQty);
														if(parseFloat(totalQty)> 0)
														{
															//isItLastPick="T";
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
									nlapiLogExecution('Debug', 'isItLastPick', isItLastPick);
									nlapiLogExecution('Debug', 'SOarray["custparam_orderlevel"]', SOarray["custparam_orderlevel"]);

									// To post IF when order level is true and lastpick is true for already packed containers against order
									if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T")
									{
										var filtersPack = new Array();
										filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));


										var opentaskSearchResultsPack=nlapiSearchRecord('customrecord_wmsse_trn_opentask',
												'customsearch_wmsse_open_packtask_details',filtersPack,null);
										if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
										{
											nlapiLogExecution('Debug','opentaskSearchResultsPack at',opentaskSearchResultsPack.length);
											var fieldsPack = new Array();
											var valuesPack = new Array();
											for(var x=0; x < opentaskSearchResultsPack.length; x++)
											{

												var RecordIdPack=opentaskSearchResultsPack[x].getValue('internalid',null,'group');
												if(RecordIdPack!=null && RecordIdPack!='')
												{
													var recId=nlapiLoadRecord('customrecord_wmsse_trn_opentask',RecordIdPack);
													recId.setFieldValue('custrecord_wmsse_device_upload_flag','T');
													var vPackRecId = nlapiSubmitRecord(recId);
													nlapiLogExecution('Debug','vPackRecId at',vPackRecId);
												}
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
												SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],
												"T",trantype,SOarray["custparam_actualbegintime"],
												SOarray["custparam_customer"],'','','','','','',SOarray["custparam_uom"],
												SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),ordType,
												department,vclass,getPickreportid,'',enteredStatus);
									else
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,
												SOarray["custparam_whlocation"],enteredLot,'','','',soInternalId,null,null,null,taskType,
												SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],
												"F",trantype,SOarray["custparam_actualbegintime"],
												SOarray["custparam_customer"],'','','','','','',SOarray["custparam_uom"],
												SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),ordType,
												department,vclass,getPickreportid,'',enteredStatus);
									context.setSessionObject('record', 'created'); 
								}
								else
								{
									if(SOarray["custparam_orderlevel"] =="T")
									{
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,
												Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,SOarray["custparam_whlocation"],
												enteredLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],
												SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],'F',trantype,
												SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','','',
												SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,
												Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),ordType,department,vclass,getPickreportid,'',enteredStatus);
										context.setSessionObject('record', 'created'); 
									}
									else
									{
										if(vStageScanRequired == "F")
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,
													itemType,SOarray["custparam_whlocation"],enteredLot,'','','',soInternalId,
													null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],
													SOarray["custparam_customer"],'','','','','','',SOarray["custparam_uom"],
													SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
													ordType,department,vclass,getPickreportid,'',enteredStatus);
										else
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enteredQty).toFixed(5)),eneteredBinId,itemType,
													SOarray["custparam_whlocation"],enteredLot,'','','',soInternalId,null,null,null,taskType,
													SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],
													SOarray["custparam_customer"],'','','','','','',SOarray["custparam_uom"],
													SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),ordType,
													department,vclass,getPickreportid,'',enteredStatus);
										context.setSessionObject('record', 'created'); 

									}
								}

							}


							//soLineDetails = getSOLineDetailsNew(SOarray["custparam_soid"],trantype,null,SOarray["custparam_whlocation"]);
							soLineDetails = getSOqtyscandetails(SOarray["custparam_sointernalid"],trantype,SOarray["custparam_whlocation"]);
							nlapiLogExecution('Debug','cmdStage',cmdStage);
							if(soLineDetails !=null && soLineDetails!="" && cmdStage != 'PickAndStage')
							{
								nlapiLogExecution('Debug', 'soLineDetails.length', soLineDetails.length);
								if(soLineDetails.length>0)
								{
									var vColumnslist=soLineDetails[0].getAllColumns();
									var vOpentaskdetails = getPickedqtydetails(SOarray["custparam_sointernalid"],trantype,SOarray["custparam_whlocation"]);
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

										nlapiLogExecution('Debug', 'itemRemQty', itemRemQty);
										if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
										{	
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan',
													false, SOarray);
											return;
										}

										else if((parseFloat(itemRemQty)>0))
										{
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan',
													false, SOarray);
											return;
										}	


									}
									if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' &&
											pickType =='custom')
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
											response.sendRedirect('SUITELET', 'customscript_wmsse_so_selectstatus',
													'customdeploy_wmsse_so_selectstatus', false, SOarray);
											return; 
										}
									}
									SOarray["custparam_error"] ='';
									if(vStageScanRequired == "F")
										response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', 
												false, SOarray);
									else
										response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan',
												false, SOarray);
									return;
								}
								else
								{
									if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' 
										&& pickType =='custom')
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
											response.sendRedirect('SUITELET', 'customscript_wmsse_so_selectstatus',
													'customdeploy_wmsse_so_selectstatus', false, SOarray);
											return; 
										}
									}
									SOarray["custparam_error"] ='';
									if(vStageScanRequired == "F")
									{
										response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false,
												SOarray);		
									}

									else
									{
										response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan',
												false, SOarray);
									}									

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
										response.sendRedirect('SUITELET', 'customscript_wmsse_so_selectstatus', 
												'customdeploy_wmsse_so_selectstatus', false, SOarray);
										return; 
									}
								}
								SOarray["custparam_error"] ='';
								if(vStageScanRequired == "F")
								{
									response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan',
											false, SOarray);
								}										
								else
								{
									response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan',
											false, SOarray);
								}

								return;

							}

						}
						catch(e)
						{
							nlapiLogExecution('Error', 'inside catch exception', e);							

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


							response.sendRedirect('SUITELET', 'customscript_wmsse_so_selectstatus', 'customdeploy_wmsse_so_selectstatus',
									false, SOarray);
							return; 
						}

					}
					else
					{
						SOarray["custparam_error"] = 'Please select valid status';				
						response.sendRedirect('SUITELET','customscript_wmsse_so_selectstatus', 'customdeploy_wmsse_so_selectstatus',
								false, SOarray);
						return;
					}
				} 
				else {

					try 
					{
						var lockfilters=new Array();

						lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',FetchedItemId));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',eneteredBinId));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_invtstatus',null,'anyof',enteredStatus));
						var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlocks_del_sch', lockfilters, null);


						if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
						{
							var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
							nlapiLogExecution('Debug','DeleteRecordId', DeleteRecordId);
						}

					}
					catch(exp)
					{
						nlapiLogExecution('Error','Exception in lock records', exp);
					}

					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						SOarray["custparam_error"] ='';
						SOarray["custparam_enterQty"] =enteredQty;
						SOarray["custparam_enterBin"] =enteredBin
						response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan', 'customdeploy_wmsse_solot_scan', false, SOarray);
						return;
					}
					else
					{

						SOarray["custparam_error"] ='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan', 'customdeploy_wmsse_soqty_scan', false, SOarray);
						return
					}
				}
			}
			catch (e) 
			{

				nlapiLogExecution('Debug', 'Exception: ', e);
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
				response.sendRedirect('SUITELET', 'customscript_wmsse_so_selectstatus', 'customdeploy_wmsse_so_selectstatus', false, SOarray);
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
			response.sendRedirect('SUITELET','customscript_wmsse_so_selectstatus', 'customdeploy_wmsse_so_selectstatus', false, SOarray);
		}
	} //end of first if condition
} //end of function.


