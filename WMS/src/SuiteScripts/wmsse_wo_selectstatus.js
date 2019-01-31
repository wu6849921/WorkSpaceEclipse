
/**
 * Main function 
 */
/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
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

		//Get the PO# from the previous screen, which is passed as a parameter		
		var getWONo = request.getParameter('custparam_woid');


		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');

		var whCompany= request.getParameter('custparam_company');
		var getWONo = request.getParameter('custparam_woid');
		/*var getSOItem = request.getParameter('custparam_soitem');
		nlapiLogExecution('Debug','getSOItem', getSOItem);*/

		var getWOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getWOInternalId = request.getParameter('custparam_wointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getItemType=request.getParameter('custparam_itemtype');
		var cartonScreenRuleValue=request.getParameter('custparam_cartonscreenrulevalue');
		var carton=request.getParameter('custparam_carton');
		var cartonSize=request.getParameter('custparam_cartonsize');
		var cartonWeight=request.getParameter('custparam_cartonweight');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var getStockConversionRate = request.getParameter("custparam_stockconversionrate");
		var vShipVia = request.getParameter('custparam_shipmethod');

		var ordType = request.getParameter('custparam_ordtype');		
		var department = request.getParameter('custparam_department');		
		var vclass = request.getParameter('custparam_class');
		var pickType= request.getParameter('custparam_picktype');
		var itemCount = request.getParameter('custparam_itemCount'); 
		var enteredBin = request.getParameter('custparam_enteredbin'); 
		var enteredQty = request.getParameter('custparam_enteredqty'); 

		var eneteredBin = request.getParameter('custparam_enterBin');
		var eneteredBinId = request.getParameter('custparam_enteredBinID');

		var stageFlag = request.getParameter('custparam_hdnCloseflag'); 
		var enteredLot = request.getParameter('custparam_enteredlot');
		var orderLevel = request.getParameter('custparam_orderlevel');
		var tobin = request.getParameter('custparam_tobinid');
		var invt_status = request.getParameter('custparam_inventorystatus');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		//Locking records
		var WOarray = new Array();
		WOarray["custparam_woid"] = getWONo;
		WOarray["custparam_enteredlot"] = enteredLot;
		WOarray["custparam_whlocation"] = whLocation;
		WOarray["custparam_company"] = whCompany;
		WOarray["custparam_option"] = getOptedField;
		WOarray["custparam_trantype"] = trantype;
		WOarray["custparam_actualbegintime"] = getActualBeginTime;
		WOarray["custparam_wointernalid"] = getWOInternalId;
		WOarray["custparam_lineno"] = getWOLineNo;
		WOarray["custparam_fetcheditemid"] = getItemInternalId;
		WOarray["custparam_customer"] = customer;
		WOarray["custparam_cartonscreenrulevalue"] = cartonScreenRuleValue;
		WOarray["custparam_carton"] = carton;
		WOarray["custparam_cartonsize"] = cartonSize;
		WOarray["custparam_cartonweight"] = cartonWeight;
		WOarray["custparam_pickreportid"] =getPickreportid;
		WOarray["custparam_uom"] = vUnits;
		WOarray["custparam_conversionrate"] = vConversionRate;
		WOarray["custparam_picktype"] = request.getParameter('custparam_picktype');
		WOarray["custparam_enteredbin"] = request.getParameter('custparam_enteredbin');
		WOarray["custparam_enteredqty"] = request.getParameter('custparam_enteredqty');		
		WOarray["custparam_enteredBinID"] = eneteredBinId;	
		WOarray["custparam_hdnCloseflag"] = stageFlag;	
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		var domainName = fndomainName();

		var st0 = domainName + '-Status Scan';
		var getPreferBin='';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "WO";

		var vFOoverageChecked='F';

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
		//var getStockConversionRate =1;
		var soLineConfiguredUnit = 1;
		var vConversionRate=1;
		var vBaseUnit='';
		if(itemresults!=null && itemresults!='')
		{
			if(itemresults[0].getValue('isinactive')=="T")
			{
				WOarray["custparam_error"] = 'Entered item is inactive';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, WOarray);
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
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
				vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
			}	

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
			getItemType = getItemType;
		}

		itemfilters=null;
		itemcolumns=null;
		itemresults=null;

		var vStageScanRequired = request.getParameter('custparam_stagescanrequired');

		if(vStageScanRequired == null || vStageScanRequired == "" || vStageScanRequired == 'null' || 
				vStageScanRequired =='undefined' || vStageScanRequired == undefined)
		{
			vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',whLocation,'4');		

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

		var str='enteredLot :'+enteredLot+ '<br>';
		str=str + 'getItemInternalId :'+getItemInternalId+ '<br>';		
		str=str + 'whLocation:'+whLocation+ '<br>';
		str=str + 'eneteredBinId:'+eneteredBinId+ '<br>';	
		str=str + 'getItemType:'+getItemType+ '<br>';	
		nlapiLogExecution('Debug', 'WOSelectstatus Get ', str);

		var vStatusDetails = '';
		if(getItemType == "serializedinventoryitem" || getItemType=="serializedinventoryitem")
		{
			if(whLocation != null && whLocation != '')
				invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
			if(getItemInternalId != null && getItemInternalId != '')
				invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', getItemInternalId));
			if(eneteredBinId!= null && eneteredBinId!= '')
				invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', eneteredBinId));
//			No need to fetch 4k records so used searchrecord
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
			//   No need to fetch 4k records so used searchrecord
			vStatusDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);
		}


		var vStatusDetailsArr =  new Array();
		var eneteredLotTxt = '';
		var eneteredLotExpdate ='';
		var vOpenPickDetails ="";
		if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined' &&
				vStatusDetails != undefined && vStatusDetails.length != null && vStatusDetails.length >0)
		{
			var convRate = getStockConversionRate;

			if(soLineConfiguredUnit != null && soLineConfiguredUnit != '' && soLineConfiguredUnit !='null' &&
					soLineConfiguredUnit !='undefined' && soLineConfiguredUnit != undefined )
			{
				convRate = parseFloat(getStockConversionRate)/parseFloat(soLineConfiguredUnit);
			}


			if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
				/*not passing status in this function*/
				vOpenPickDetails = getOPenTaskPickBinDetailsLot(getItemInternalId,eneteredBinId,whLocation,
						VUnitType,blnItemUnit);
			else
				/*not passing status in this function*/
				vOpenPickDetails = getOPenTaskPickBinDetails(getItemInternalId,eneteredBinId,whLocation,
						VUnitType,blnItemUnit,'','');



			if((getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem" || 
					getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem"))
			{
				eneteredLotTxt = vStatusDetails[0].getText('inventorynumber',null,'group');
				eneteredLotExpdate = vStatusDetails[0].getValue('expirationdate','inventorynumber','group');


				var statusArr = new Array();
				if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
				{
					for(var p=0;p<vStatusDetails.length;p++)
					{

						var vBinQtyAvail=vStatusDetails[p].getValue('available',null,'sum');
						var status = vStatusDetails[p].getText('status',null,'group');	
						var statusId = vStatusDetails[p].getValue('status',null,'group');
						vBinQtyAvail = Big(vBinQtyAvail).mul(convRate);




						var openPickQty = 0;
						if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
						{

							var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
							var	vOpenPickQtyArr = vOpenPickDetails[1];
							var	vBinLotArr = vOpenPickDetails[3];
							var	vBinStatusArr = vOpenPickDetails[5];


							nlapiLogExecution('Debug', 'vBinOpenTaskBinQtyArr', vBinOpenTaskBinQtyArr);
							if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined'
								&& vBinStatusArr != undefined)
							{
								for(var b=0;b<vBinStatusArr.length;b++)
								{
									var stsArr = vBinStatusArr[b];
									var vLotText =vBinLotArr[b];
									//var stsID = stsArr[1];

									if(stsArr == statusId && eneteredLotTxt==vLotText)
									{
										openPickQty = vOpenPickQtyArr[b];
										break;
									}
								}
							}
						}

						vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);
						if(parseFloat(vBinQtyAvail)>0)
						{
							if(statusArr.indexOf(statusId)==-1)
							{
								nlapiLogExecution('Debug', 'vBinQtyAvail1', vBinQtyAvail);


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
				else if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
				{
					for(var p=0;p<vStatusDetails.length;p++)
					{

						var vBinQtyAvail=vStatusDetails[p].getValue('available',null,'sum');
						var status = vStatusDetails[p].getText('status',null,'group');	
						var statusId = vStatusDetails[p].getValue('status',null,'group');
						vBinQtyAvail = Big(vBinQtyAvail).mul(convRate);



						nlapiLogExecution('Debug', 'status', status);
						var openPickQty = 0;
						if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
						{
							var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
							var	vOpenPickQtyArr = vOpenPickDetails[1];
							var	vBinStatusArr = vOpenPickDetails[3];


							nlapiLogExecution('Debug', 'vBinOpenTaskBinQtyArr', vBinOpenTaskBinQtyArr);
							if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined'
								&& vBinStatusArr != undefined)
							{
								for(var b=0;b<vBinStatusArr.length;b++)
								{
									var stsArr = vBinStatusArr[b];

									if(stsArr == statusId)
									{
										openPickQty = vOpenPickQtyArr[b];
										break;
									}
								}
							}

						}

						vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);
						if(parseFloat(vBinQtyAvail)>0)
						{
							if(statusArr.indexOf(statusId)==-1)
							{
								nlapiLogExecution('Debug', 'vBinQtyAvail1', vBinQtyAvail);


								var currRow = [status,Number(vBinQtyAvail),statusId];
								statusArr.push(statusId);
								vStatusDetailsArr.push(currRow);

							}
							else
							{
								nlapiLogExecution('Debug', 'vBinQtyAvail2', vBinQtyAvail);
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
				for(var s1=0;s1<vStatusDetails.length;s1++)
				{


					var status = vStatusDetails[s1].getText('status',null,'group');
					var vBinQtyAvail=vStatusDetails[s1].getValue('available',null,'sum');
					vBinQtyAvail = Big(vBinQtyAvail).mul(convRate);
					var statusId = vStatusDetails[s1].getValue('status',null,'group');

					var openPickQty = 0;
					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{

						var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinStatusArr = vOpenPickDetails[3];

						if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && 
								vBinStatusArr != 'undefined' && vBinStatusArr != undefined)
						{
							for(var statusItr=0;statusItr<vBinStatusArr.length;statusItr++)
							{
								var openTaskStatus = vBinStatusArr[statusItr];

								if(openTaskStatus == statusId)
								{
									openPickQty = vOpenPickQtyArr[statusItr];
									break;
								}
							}
						}
					}

					vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);
					if(parseFloat(vBinQtyAvail)>0)
					{
						var currRow = [status,Number(vBinQtyAvail),statusId];
						vStatusDetailsArr.push(currRow);
					}
				}
			}
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


		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_qty');

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
		"document.getElementById('hdnenetedstatus').value = statusId;document.forms['_rf_picking_qty'].submit();" +
		"document.getElementById('loading').style.display = 'block'; return true;}</script>";

		html = html +"<script type = 'text/javascript' >function validate(){ return validateForm(\""+enteredQty+"\") }</script>";

		html = html + "</head><body onkeydown='return OnKeyDown_CL();'> ";
		html = html +"	<form name='_rf_picking_qty' method='POST'><input name='cmdSend1' type='submit' " +
		" class='defaultlink'   value='' onclick=' return validateForm_soQtySingle();'/>"+ 	

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>WO Picking Bin/Location Status</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+ 	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+": <label>" + getWONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnstatuschangevalue' id='hdnstatuschangevalue' value=" + vConversionRate + ">"+			
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getWOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getWOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnSoItem' value='" + getSOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+			
		"				<input type='hidden' name='hdncartonScreenRuleValue' value=" + cartonScreenRuleValue + ">"+
		"				<input type='hidden' name='hdncarton' value=" + carton + ">"+
		"				<input type='hidden' name='hdnbinInternalId' value=" + eneteredBinId + ">"+
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
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value='" + getStockConversionRate + "'>"+
		"				<input type='hidden' name='hdnstatus' value='" +invt_status+"'>"+
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
		"				<td align = 'left' class='labelmsg'>Qty: <label>" + parseFloat(parseFloat(enteredQty).toFixed(8)) + " "+vUnits+"</label>"+
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
			"				<td  class='status-rw-display'>Inv Status"+	
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
				var vQty = currValues[1];
				var vStatusId = currValues[2];


				//case # 201412820 start
				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td class='status-cl-display'><a  onclick='return validate_selectedStatus(\""+vStatusId+"\",\""+vQty+"\");'" +
				" href='#' >"+vStatus;	
				html = html +"				</a></td>";
				html = html +"				<td class='align-right'>"+vQty;
				html = html +"				</td>";

				if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
				{
					if(eneteredLotExpdate ==null || eneteredLotExpdate =='' || eneteredLotExpdate =='null'|| 
							eneteredLotExpdate == 'undefined' ||  eneteredLotExpdate == undefined)
						eneteredLotExpdate="";

					html = html +"				<td>"+eneteredLotExpdate;
					html = html +"				</td>";	
				}

				html = html +"			</tr>";

			}
			html = html + 	"</table></td></tr>";
		}
		html = html +"	<tr><td></td></tr>	<tr><td></td></tr>	<tr>	<td align = 'left'>";
		html = html +"				<input name='cmdPrevious' type='submit' value='Back (F7)'onclick='return validateForm();/>"+
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
		nlapiLogExecution('Debug', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array WOarray
		var WOarray = new Array();
		var tempflag='F';
		var enteredQty=request.getParameter('hdnenteredqty');	
		var enteredBin=request.getParameter('hdnenteredbin');
		var enteredStatus = request.getParameter('hdnenetedstatus');
		var ordType= request.getParameter('hdnOrdtype');
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		var enteredLot = request.getParameter('hdnenteredlot');
		var cmdStage = request.getParameter('hdnStageflag');
		WOarray["custparam_enteredlot"] = enteredLot;
		WOarray["custparam_hdnCloseflag"] = cmdStage;	
		WOarray["custparam_shipmethod"] = request.getParameter('hdnShipVia');
		WOarray["custparam_department"] =department;
		WOarray["custparam_class"] =vclass;
		WOarray["custparam_ordtype"] =ordType;
		WOarray["custparam_woid"] = request.getParameter('custparam_woid');
		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		WOarray["custparam_option"] = request.getParameter('hdnOptedField');
		WOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		WOarray["custparam_wointernalid"] = request.getParameter('hdnSoInternalId');
		WOarray["custparam_lineno"] = request.getParameter('hdnSoLineno');
		WOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		WOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		WOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');		
		WOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		WOarray["custparam_cartonscreenrulevalue"]=request.getParameter('hdncartonScreenRuleValue');
		WOarray["custparam_carton"] =request.getParameter('hdncarton');
		WOarray["custparam_cartonsize"] =request.getParameter('hdncartonSize');
		WOarray["custparam_cartonweight"] =request.getParameter('hdncartonWeight');
		WOarray["custparam_itemtype"]=request.getParameter('hdnItemType');
		WOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		WOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		WOarray["custparam_orderqty"] = request.getParameter('hdnorderQty');
		var foOverageCheck=request.getParameter('hdnvFOoverageChecked');
		var getPickreportid=request.getParameter('hdnPickReportId');
		WOarray["custparam_pickreportid"] =getPickreportid;	
		WOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		WOarray["custparam_uom"] = request.getParameter('hdnuom');
		WOarray["custparam_itemCount"] = request.getParameter('hdnitemCount');
		WOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		WOarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		WOarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		WOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		WOarray["custparam_stagescanrequired"] = request.getParameter('hdnvStageScanRequired');
		WOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		WOarray["custparam_enteredbin"] = request.getParameter('hdnenteredbin');
		WOarray["custparam_enteredqty"] = request.getParameter('hdnenteredqty');
		WOarray["custparam_enteredlot"] =  request.getParameter('hdnenteredlotid');
		WOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var eneteredBinId = request.getParameter('hdnenteredbinid');
		WOarray["custparam_enteredBinID"] = eneteredBinId;
		var pickType = request.getParameter('hdnPickType');
		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var orderLevel=request.getParameter('hdnorderLevel');
		var getItemType=request.getParameter('hdnItemType');
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var getWOInternalId=request.getParameter('hdnSoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var getWOLineNo=request.getParameter('hdnSoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var preferBinQty=request.getParameter('hdnPreferBinQty');
		var binInternalId=request.getParameter('hdnbinInternalId');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');

		var logMsg = 'SO = ' + WOarray["custparam_woid"] + '<br>';
		logMsg = logMsg + 'enteredQty = ' + enteredQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enteredBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'getWOInternalId = ' + getWOInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'getWOLineNo = ' + getWOLineNo + '<br>';
		logMsg = logMsg + 'preferBin = ' + preferBin + '<br>';
		logMsg = logMsg + 'foOverageCheck = ' + foOverageCheck + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		logMsg = logMsg + 'enteredStatus = ' + enteredStatus + '<br>';		
		logMsg = logMsg + 'itemCount = ' + WOarray["custparam_itemCount"] + '<br>';
		logMsg = logMsg + 'enteredLot = ' + enteredLot + '<br>';
		logMsg = logMsg + 'cmdStage = ' + cmdStage + '<br>';
		logMsg = logMsg + 'binInternalId = ' + binInternalId + '<br>';
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
				if(optedEvent != 'Back (F7)')
				{
					if(enteredStatus!=null && enteredStatus!="" && enteredStatus!='null' )
					{
						try
						{	
							nlapiLogExecution('Debug', 'enteredStatus', enteredStatus);
							if(enteredLot == null || enteredLot == '' || enteredLot == 'null' || enteredLot == undefined)
								enteredLot='';

							if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
							{
								WOarray["custparam_error"] ='';
								WOarray["custparam_inventorystatus"] =enteredStatus;
								WOarray["custparam_enterQty"] =enteredQty;
								WOarray["custparam_enterBin"] =enteredBin;
								WOarray["custparam_screen"] ='fromstatusscreen';
								if(request.getParameter('hdnStageflag') == 'Pick & Stage')
								{
									WOarray["custparam_hdnCloseflag"]='Pick And Stage';
								}

								nlapiLogExecution('Debug', 'into serializedinventoryitem', getItemType);
								response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', 
										false, WOarray);
								return;
							}

							if(vStageScanRequired == "F")
							{
								var toBinInternalId =fnGetWIPBinDetails(WOarray["custparam_whlocation"]);

								if(toBinInternalId=='' || toBinInternalId==null)
								{
									WOarray["custparam_error"] = 'Please configure wip bin location';
									response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
									return;
								}

							}
							else
							{
								var toBinInternalId = binInternalId;
							}
							var woLineDetails = getWOLineDetailsNew(WOarray["custparam_woid"],WOarray["custparam_whlocation"],FetchedItemId,getWOLineNo);



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

										var opentaskDetails=getopentaskDetailsforSku(WOarray["custparam_wointernalid"],getWOLineNo,FetchedItemId,enteredStatus);

										var itemPickedQty = opentaskDetails[0].getValue('custrecord_wmsse_act_qty',null,'sum');

										if(itemPickedQty==null || itemPickedQty=='' || itemPickedQty =='null' || itemPickedQty =='undefined')
										{
											itemPickedQty = 0;
										}
										if(getItemType == 'noninventoryitem' || getItemType == 'otherchargeitem' || getItemType=='serviceitem' || getItemType=='downloaditem' || getItemType=='giftcertificateitem' 
											||getItemType == "NonInvtPart" || getItemType=="OthCharge" || getItemType=="Service" || getItemType=="DwnLdItem" || getItemType=="GiftCert")
										{
											itemCommitedQty=woLineDetails[cnt].getValue('quantity');
										}

										if(vwoitemRcvQty == null || vwoitemRcvQty =='')
											vwoitemRcvQty = 0;
										if(getItemType == 'noninventoryitem' || getItemType == 'otherchargeitem' || getItemType=='serviceitem' || getItemType=='downloaditem' || getItemType=='giftcertificateitem' 
											||getItemType == "NonInvtPart" || getItemType=="OthCharge" || getItemType=="Service" || getItemType=="DwnLdItem" || getItemType=="GiftCert")
										{
											var itemRemQty=Big(itemCommitedQty).minus(itemPickedQty);
										}
										else
										{
											itemCommitedQty=new Big(itemCommitedQty);
											vwoitemRcvQty=new Big(vwoitemRcvQty);
											itemPickedQty=new Big(itemPickedQty);

											var itemRemQty=((itemCommitedQty).plus(vwoitemRcvQty)).minus(itemPickedQty);
										}

										var vwoitem = woLineDetails[cnt].getValue('item');
										var vwoitemline = woLineDetails[cnt].getValue('line');

										if((parseFloat(itemRemQty)>0) && (vwoitem == FetchedItemId) && (getWOLineNo == vwoitemline))
										{
											isItemFound = true;
											if(getItemType == 'noninventoryitem' || getItemType == 'otherchargeitem' || getItemType=='serviceitem' || getItemType=='downloaditem' || getItemType=='giftcertificateitem')
											{
												binInternalId ='';
												toBinInternalId ='';
											}
											var id=  updateOpenTaskWO(getWOInternalId,FetchedItemId,getWOLineNo,Number(Big(enteredQty).toFixed(8)),toBinInternalId,getItemType,
													WOarray["custparam_whlocation"],enteredLot,'','','',getWOInternalId,null,null,null,'PICK','','','','','workorder',
													WOarray["custparam_actualbegintime"],'','','','','','',binInternalId,WOarray["custparam_uom"],
													WOarray["custparam_conversionrate"],'','','',enteredStatus); 
											nlapiLogExecution('ERROR', 'opentaskid', id);						

											try
											{
												if(vStageScanRequired == "F" && (getItemType != 'noninventoryitem' && getItemType != 'otherchargeitem' && getItemType!='serviceitem' && getItemType!='downloaditem' && getItemType!='giftcertificateitem'))
												{	

													var binTransferId = inventoryBinTransfer(getItemType,WOarray["custparam_whlocation"],FetchedItemId,
															Number((Big(enteredQty).mul(WOarray["custparam_conversionrate"])).toFixed(8)),binInternalId,toBinInternalId,
															enteredLot,'','','','',enteredStatus,enteredStatus);
													nlapiLogExecution('ERROR', 'Bin Transfered successfully', binTransferId);
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

												response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
												return;
											}

										}

									}
									if(isItemFound == false)
									{
										nlapiLogExecution('ERROR','First');
										WOarray["custparam_error"] ='Scanned qty is greater than remaining qty';
										response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
										return;
									}
								}

							}
							else
							{
								WOarray["custparam_error"] = 'Entered item is deleted from the order';
								response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
								return;
							}

							var woLineDetails = getWOLineDetailsNew(WOarray["custparam_woid"],WOarray["custparam_whlocation"],null,null);

							nlapiLogExecution('Debug','cmdStage',cmdStage);


							if(woLineDetails !=null && woLineDetails!=""  && cmdStage != 'Pick And Stage')
							{


								if(woLineDetails.length>0)
								{
									var totalpickQtyIndex =7;
									var comittedQtyIndex =15;
									var builtQtyIndex =16;
									var unitsIndex =14;
									var coversionRateIndex =17;
									var vColumnslist=woLineDetails[0].getAllColumns();
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

										var getItemType= woLineDetails[cnt].getValue('type','item');

										if(vwoitemRcvQty == null || vwoitemRcvQty =='')
											vwoitemRcvQty = 0;
										if(getItemType == 'noninventoryitem' || getItemType == 'otherchargeitem' || getItemType=='serviceitem' || getItemType=='downloaditem' || getItemType=='giftcertificateitem' 
											||getItemType == "NonInvtPart" || getItemType=="OthCharge" || getItemType=="Service" || getItemType=="DwnLdItem" || getItemType=="GiftCert")
										{
											itemCommitedQty=woLineDetails[cnt].getValue('quantity');
										}
										if(itemCommitedQty == null || itemCommitedQty =='' || itemCommitedQty=='null')
										{
											itemCommitedQty=0;
										}
										totalWOQty =new Big(totalWOQty);
										itemCommitedQty =new Big(itemCommitedQty);
										vwoitemRcvQty =new Big(vwoitemRcvQty);
										totalWOQty = (totalWOQty).plus(itemCommitedQty) .plus(vwoitemRcvQty);
									}

									var pickedQty  = getopentaskDetails(WOarray["custparam_wointernalid"]); 
									if(pickedQty == '' || pickedQty == null || isNaN(pickedQty))
									{
										pickedQty = 0;
									}


									var itemRemQty = Big(totalWOQty).minus(pickedQty);

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
							nlapiLogExecution('Error', 'inside catch exception', e);							

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

							// Change as per script ID
							response.sendRedirect('SUITELET', 'customscript_wmsse_wopicking_status', 'customdeploy_wmsse_wopicking_status',
									false, WOarray);
							return; 
						}

					}
					else
					{
						// Change as per script ID
						WOarray["custparam_error"] = 'Please select valid status';				
						response.sendRedirect('SUITELET','customscript_wmsse_wopicking_status', 'customdeploy_wmsse_wopicking_status',
								false, WOarray);
						return;
					}
				} 
				else {

					if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
					{
						WOarray["custparam_error"] ='';
						WOarray["custparam_enterQty"] =enteredQty;
						WOarray["custparam_enterBin"] =enteredBin
						response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
						return;
					}
					else
					{

						WOarray["custparam_error"] ='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
						return
					}
				}
			}
			catch (e) 
			{

				nlapiLogExecution('Debug', 'Exception: ', e);
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

				response.sendRedirect('SUITELET', 'customscript_wmsse_wopicking_status', 'customdeploy_wmsse_wopicking_status', false, WOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{

			WOarray["custparam_error"] = 'Transaction Is In Progress...';
			response.sendRedirect('SUITELET','customscript_wmsse_wopicking_status', 'customdeploy_wmsse_wopicking_status', false, WOarray);
		}
	} //end of first if condition
} //end of function.

function getWOLineDetailsNew(wonumber,whLocation,itemID,getWOLineNo)
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

	if(getWOLineNo != null && getWOLineNo != '')
		filters.push(new nlobjSearchFilter('line', null, 'equalto', getWOLineNo)); 

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_item_srh', filters, columns);

	return WOLineDetails;
}


function getopentaskDetailsforSku(getWOInternalId,lineno,item,selectedStatus)
{
	nlapiLogExecution('Debug', 'getWOInternalId', getWOInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',getWOInternalId));
	if(lineno!=null && lineno!='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'equalto',lineno));	
	if(item!=null && item!='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof',item));
	if(selectedStatus!=null && selectedStatus!='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus',null,'anyof',selectedStatus));

	var opentaskColumns =  new Array();

	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);


	return opentaskResults;
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
		nlapiLogExecution('Debug','objBinDetails',objBinDetails.length);

		var vValidBin=objBinDetails[0].getValue('binnumber');
		var vValidBinId=objBinDetails[0].getId();

		wipBinId = vValidBinId;
	} 

	return wipBinId;
}

function getopentaskDetails(woInternalId)
{
	var pickQty = 0;
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

	var opentaskColumns =  new Array();

	var opentaskResultsArray = new Array();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);

	if(opentaskResults !=null && opentaskResults !='')
	{
		nlapiLogExecution('Debug', 'opentaskResults', opentaskResults.length);
		for(var k=0;k<opentaskResults.length;k++)
		{

			pickQty = Number(Big(pickQty).plus(opentaskResults[k].getValue('custrecord_wmsse_act_qty',null,'sum')));
		}
	}
	return pickQty;
}
