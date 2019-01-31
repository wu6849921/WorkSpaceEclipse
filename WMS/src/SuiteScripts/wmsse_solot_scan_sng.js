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
function PickingLotScan(request, response)
{

	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		// Variable Declaration
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
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var cartonScreenRuleValue=request.getParameter('custparam_cartonscreenrulevalue');
		var carton=request.getParameter('custparam_carton');
		var cartonSize=request.getParameter('custparam_cartonsize');
		var cartonWeight=request.getParameter('custparam_cartonweight');
		var orderLevel=request.getParameter('custparam_orderlevel');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate');
		var VUnitType = request.getParameter('custparam_itemunitstype');
		var blnItemUnit = request.getParameter('custparam_itemunits');
		var orderQty=request.getParameter('custparam_orderqty'); 
		var ordType = request.getParameter('custparam_ordtype');
		var pickType= request.getParameter('custparam_picktype');
		var vShipVia = request.getParameter('custparam_shipmethod');
		
		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getSONo. = ' + getSONo + '<br>';
		logmsg = logmsg + 'vShipVia. = ' + vShipVia + '<br>';	
		logmsg = logmsg + 'getSOItem. = ' + getSOItem + '<br>';		
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';						
		nlapiLogExecution('DEBUG', 'Values :', logmsg);
		var vStageScanRequired = request.getParameter('custparam_stagescanrequired');
		var qtyanduoms = request.getParameter('custparam_uomqtyselected');
		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';

		if(getStockConversionRate == '- None -' || getStockConversionRate == '' || 
				getStockConversionRate == null || getStockConversionRate == 'null' || getStockConversionRate == undefined)
			getStockConversionRate = 1;


		// UOM dropdown binding
		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		if(VUnitType == '- None -' || VUnitType == '' || VUnitType == null)
			VUnitType ='';
		if(blnItemUnit == '- None -' || blnItemUnit == '' || blnItemUnit == null)
			blnItemUnit ='';		
		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);
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
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-FULFILLMENT LOT SCAN';
		var getPreferBin=request.getParameter('custparam_preferbin');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}

		var SOarray = new Array();
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_actualbegintime"] = request.getParameter('custparam_actualbegintime');
		SOarray["custparam_customer"] = request.getParameter('custparam_customer');
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_trantype"] = request.getParameter('custparam_trantype');
		SOarray["custparam_company"] = request.getParameter('custparam_company');
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_soitem"] = request.getParameter('custparam_soitem');
		SOarray["custparam_lineno"] = request.getParameter('custparam_lineno');
		SOarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
		SOarray["custparam_sointernalid"] = request.getParameter('custparam_sointernalid');
		SOarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
		SOarray["custparam_rem_qty"] = request.getParameter('custparam_rem_qty');
		SOarray["custparam_rec_qty"] = request.getParameter('custparam_rec_qty');
		SOarray["custparam_itemtype"] = request.getParameter('custparam_itemtype');
		SOarray["custparam_enterQty"] = request.getParameter('custparam_enterQty');
		SOarray["custparam_enterBin"] = request.getParameter('custparam_enterBin');
		SOarray["custparam_cartonscreenrulevalue"]=request.getParameter('custparam_cartonscreenrulevalue');
		SOarray["custparam_carton"]=request.getParameter('custparam_carton');
		SOarray["custparam_cartonsize"]=request.getParameter('custparam_cartonsize');
		SOarray["custparam_cartonweight"]=request.getParameter('custparam_cartonweight');
		SOarray["custparam_orderlevel"]=request.getParameter('custparam_orderlevel');
		SOarray["custparam_pickreportid"]=request.getParameter('custparam_pickreportid');
		SOarray["custparam_uom"] = request.getParameter("custparam_uom"); 
		SOarray["custparam_conversionrate"] = request.getParameter("custparam_conversionrate");
		SOarray["custparam_stockconversionrate"] = request.getParameter('custparam_stockconversionrate');
		SOarray["custparam_itemunitstype"] = request.getParameter('custparam_itemunitstype');
		SOarray["custparam_itemunits"] = request.getParameter('custparam_itemunits');
		SOarray["custparam_orderqty"]=request.getParameter('custparam_orderqty'); 
		SOarray["custparam_ordtype"] = request.getParameter('custparam_ordtype');
		SOarray["custparam_picktype"]= request.getParameter('custparam_picktype');
		SOarray["custparam_stagescanrequired"] = request.getParameter('custparam_stagescanrequired');
		SOarray["custparam_bcComponents"] = request.getParameter('custparam_bcComponents');	


		var binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);
		var AllowAllLots = 'T';
		if(trantype == 'salesorder')
		{
			var objBinDetails = fnGetPickBinDetailsLotWithExpiryDates(getItemInternalId,binInternalId,'',whLocation,vPageCount,
					makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate);
		}
		else
			if(trantype == 'transferorder')
			{
				var objBinDetails = fnGetPickBinDetailsLotWithExpiryDates(getItemInternalId,binInternalId,'',whLocation,vPageCount,
						makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate,AllowAllLots);
			}


		if((objBinDetails == null && makeInvAvailFlagFromSelect == '') || (objBinDetails == '' && makeInvAvailFlagFromSelect =='')||
				(objBinDetails == 'null' && makeInvAvailFlagFromSelect == '') || (objBinDetails == undefined && makeInvAvailFlagFromSelect == ''))
		{
			SOarray["custparam_error"]="Insufficient inventory for this item and bin combination";
			response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
			return;
		}
		var checkTotalLotQty=0;
		if(trantype == 'salesorder')
		{
			checkTotalLotQty = fnGetLotQty(getItemInternalId,binInternalId,'',whLocation);
		}
		else
			if(trantype == 'transferorder')
			{
				checkTotalLotQty = fnGetLotQty(getItemInternalId,binInternalId,'',whLocation,AllowAllLots);
			}


		checkTotalLotQty = Number(Big(checkTotalLotQty).mul(getStockConversionRate));
		nlapiLogExecution('DEBUG', 'checkTotalLotQty', checkTotalLotQty);

		if(getItemRemQty > checkTotalLotQty)
		{
			SOarray["custparam_error"]="Insufficient inventory for this item and bin combination";
			response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
			return;
		}


		var qtyCheckFlag="F";
		var vFOoverageChecked='F';
		var vConfig=nlapiLoadConfiguration('accountingpreferences');
		if(vConfig != null && vConfig != '')
		{
			vFOoverageChecked=vConfig.getFieldValue('OVERFULFILLMENTS');
		}

		var soLineDetails = getSOLineDetailsItemandqty(getSOInternalId,trantype,getItemInternalId,SOarray["custparam_whlocation"],getSOLineNo);

		var orderQty=0;
		var custIndex = 12;
		var commitedQtyIndex = 25;
		var fulfilledQtyIndex = 26;
		var conversionRateIndex=27;
		var totalPickedQtyIndex =7;
		var unitsIndex = 24;
		var totalNSPickedQtyIndex =37;
		var ERPConfirmedQty =38;
		if(soLineDetails != null && soLineDetails != '' && soLineDetails.length > 0)
		{	
			var vColumnslist=soLineDetails[0].getAllColumns();
			for(var x1=0;x1<vColumnslist.length;x1++)
			{
				var summaryLabel = vColumnslist[x1].getLabel();
				var name = vColumnslist[x1].getName();
				if(summaryLabel == 'Customer Id')
				{
					custIndex = x1;
				}
				else if (summaryLabel == 'Committed Quantity')
				{
					commitedQtyIndex = x1;
				}
				else if (summaryLabel == 'Fulfilled Quantity' && name == 'formulanumeric')
				{
					fulfilledQtyIndex = x1;
				}
				else if (summaryLabel == 'Conversion Rate')
				{
					conversionRateIndex = x1;
				}
				else if (summaryLabel == 'Total Picked Quantity')
				{
					totalPickedQtyIndex = x1;
				}
				else if(name == 'unit')
				{
					unitsIndex =x1;
				}
				else if (summaryLabel == 'ERPpickedQuantity')
				{
					totalNSPickedQtyIndex = x1;
				}
				else if (summaryLabel == 'ERP CONFIRMED QTY')
				{
					ERPConfirmedQty = x1;
				}
				else
				{

				}
			}
			var vOrderType = null;
			var vUnits =null;
			var vUnitsValue =null;
			for(var j=0; j<soLineDetails.length; j++)
			{
				var usedBins='';

				var solineno=soLineDetails[j].getValue('line',null,'group');
				var socheckinqty=soLineDetails[j].getValue('quantity');
				vUnits = soLineDetails[j].getText(vColumnslist[unitsIndex]);
				if(vUnits == '- None -' || vUnits == '' || vUnits == null)
					vUnits ='';
				vUnitsValue = soLineDetails[j].getValue(vColumnslist[unitsIndex]);
				vConversionRate = soLineDetails[j].getValue(vColumnslist[conversionRateIndex]);

				var vsoitemQty=soLineDetails[j].getValue(vColumnslist[commitedQtyIndex]);			 
				var vsoitemfulfillQty=soLineDetails[j].getValue(vColumnslist[fulfilledQtyIndex]);
				var vsoitem = soLineDetails[j].getText('item',null,'group');	
				vShipVia = soLineDetails[j].getValue('shipmethod',null,'group');
				var vsoitemId = soLineDetails[j].getValue('item',null,'group');		
				if(trantype == 'transferorder' && solineno != null)//adding because of TO line number getting 2 value
					solineno = parseInt(solineno)-1;

				var vsoitemopentaskQty=getopentaskDetailsforItem(SOarray["custparam_sointernalid"],solineno,vsoitemId,whLocation);	
				var vsoitemErpConfirmedQty=soLineDetails[j].getValue(vColumnslist[ERPConfirmedQty]);
				var vsoitemNSReceivedQty=soLineDetails[j].getValue(vColumnslist[totalNSPickedQtyIndex]);

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
				nlapiLogExecution('DEBUG', 'vConversionRate', vConversionRate);
				nlapiLogExecution('DEBUG', 'vUnitsValue', vUnitsValue);
				nlapiLogExecution('DEBUG', 'vsoitemQty', vsoitemQty);
				
				nlapiLogExecution('DEBUG', 'vsoitemQty', vsoitemQty);
				vsoitemopentaskQty=new Big(vsoitemopentaskQty);
				vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
				vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
				var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty.minus(vsoitemErpConfirmedQty))));
				nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);

				if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
					vsoitemfulfillQty=0;
				if(vsoitemQty == null || vsoitemQty == '')
					vsoitemQty=0;
				if(vsoitemRcvQty==null || vsoitemRcvQty=='')
					vsoitemRcvQty=0;
				orderQty=vsoitemQty;

//				if(vConversionRate!=null && vConversionRate!='')
//				{
//					
//					vsoitemQty=Number(Big(vsoitemQty).div(vConversionRate));
//				}

				vsoitemQty=new Big(vsoitemQty);
				vsoitemfulfillQty=new Big(vsoitemfulfillQty);
				vsoitemRcvQty=new Big(vsoitemRcvQty);
				var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
				nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);


				if(parseFloat(getSOLineNo) == parseFloat(solineno))
				{
					if(parseFloat(vSoreminqty) > 0)
					{
						qtyCheckFlag = "T";
						//getItemRemQty = parseFloat(parseFloat(vSoreminqty).toFixed(5));
						//getItemRecQty = parseFloat(parseFloat(vsoitemRcvQty).toFixed(5));

						vOrderType = soLineDetails[j].getValue('custbody_wmsse_ordertype',null,'group');						
						vUnits = soLineDetails[j].getText('unit',null,'group');
						if(vUnits == '- None -' || vUnits == '' || vUnits == null)
							vUnits ='';
						vUnitsValue=soLineDetails[j].getValue('unit',null,'group');
						break;
					}
				}
			}
		}
		var isfromPageRefresh = context.getSessionObject('record');
		nlapiLogExecution('DEBUG', 'isfromPageRefresh', isfromPageRefresh);
		if((qtyCheckFlag == 'F' && vFOoverageChecked == "F") || isfromPageRefresh == 'created')
		{

			//soLineDetails = getSOLineDetailsItem(getSOInternalId,trantype,null,whLocation);

			var soLineDetails = getSOItemscandetails(getSOInternalId,trantype,whLocation);
			if(soLineDetails !=null && soLineDetails!="" )
			{


				if(soLineDetails.length>0)
				{
					var vColumnslist=soLineDetails[0].getAllColumns();

					var vOpentaskdetails = getPickedqtydetails(getSOInternalId,trantype,whLocation);
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
							if(vsoitemNSshippedQty==null || vsoitemNSshippedQty=='' ||vsoitemNSshippedQty=='null' || vsoitemNSshippedQty=='undefined' )
							{
								vsoitemNSshippedQty = 0;
							}

							if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
							{
								vsoitemNSReceivedQty = 0;
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
								var itemRemQty = Number(Big(vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
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
								response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
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
							response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
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
						response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
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

		}

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}

		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		if(itemresults!=null && itemresults!='')
		{
			getSOItem = itemresults[0].getValue('itemid');
		}
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
		//"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";
		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		html = html + "<script type='text/javascript'>function validateLot(enterlot){var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=enterlot; var vLotWhiteSpace = lotVal.indexOf(' ') >= 0; if(enterlot == '' ){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;}else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.getElementById('txtlot').value = enterlot ;document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdStage.disabled=true;document.forms['_rf_checkin_item'].cmdClose.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}}}</script>";
		html = html + "<script type='text/javascript'>function validateForm(){var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtlot').value; var vLotWhiteSpace = lotVal.indexOf(' ') >= 0; if(document.getElementById('txtlot').value == '' ){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;}else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdStage.disabled=true;document.forms['_rf_checkin_item'].cmdClose.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}}}</script>";
		//This function is to validate the form when Bin link is clicked.
		html = html + "	<script type='text/javascript'>function fnShowLoader() {" +
		"document.getElementById('loading').style.display = 'block';}</script>";
		//Refresh Functionality starts
		html = html + "<SCRIPT LANGUAGE='javascript' for='window' EVENT='onload()'>"; 
		html = html + "var version = navigator.appVersion;";
		html = html + "document.onkeydown = function (e) {";
		html = html + "var keycode = (window.event) ? event.keyCode : e.keyCode;"; 
		html = html + "if ((version.indexOf('MSIE') != -1)) { ";
		html = html + "	if (keycode == 116) {event.keyCode = 0;event.returnValue = false;return false;}}"; 
		html = html + "else {if (keycode == 116)return false;}";
		html = html + "};";
		html = html + "</script>";
		//Refresh Functionality ends
		//	html = html + "</head><body>"+
		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking Lot#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+
		//"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getSONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getSOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnSoItem' value='" + getSOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnShipVia' id='hdnShipVia' value='" +vShipVia+"'>"+
		"				<input type='hidden' name='hdncartonScreenRuleValue' value=" + cartonScreenRuleValue + ">"+
		"				<input type='hidden' name='hdncarton' value=" + carton + ">"+
		"				<input type='hidden' name='hdncartonSize' value=" + cartonSize + ">"+
		"				<input type='hidden' name='hdncartonWeight' value=" + cartonWeight + ">"+
		"				<input type='hidden' name='hdnorderLevel' value=" + orderLevel + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnorderQty' id='hdnorderQty' value=" + orderQty + ">"+
		"               <input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdnPickType' value='" +pickType+"'>"+
		"				<input type='hidden' name='hdnvStageScanRequired' value='" +vStageScanRequired+"'>"+
		"               <input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnStageflag'>"+
		"				<input type='hidden' name='hdnCloseflag'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' value="+qtyanduoms+" >"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnPageCount' id='hdnPageCount' value=" + vPageCount + ">"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				<input type='hidden' name='hdnbininyternalid' id='hdnbininyternalid' value="+binInternalId+" >"+
		"				<input type='hidden' name='hdninvstatusfeature' id='hdninvstatusfeature' value="+inventoryStatusFeature+" >"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getSOItem  + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + parseFloat(parseFloat(vsoitemRcvQty).toFixed(5)) +" " +vUnits+"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(vSoreminqty).toFixed(5)) +" " +vUnits+"</label>"+
		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";

		html = html +"  <td align = 'left'><input name='txtlot'  class='smalltextbox'  id='txtlot' type='text'/>";

		html = html +"				</td>"+
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>";
		html = html +"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'  type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td></tr>";
		if(orderLevel=="T")
		{
			html = html +"	<tr><td>	<input name='cmdClose' type='submit' value='Pick & Close' onclick='this.form.hdnCloseflag.value=this.value;return validateForm();'/></td>";
			if(vStageScanRequired == "T")
			{
				html = html +"	<td width='20px'></td><td><input name='cmdStage' style='width:100px;' type='submit' value='Pick & Stage' onclick='this.form.hdnStageflag.value=this.value; return validateForm();'/></td></tr>";
			}
			else
			{
				html = html +"				<td colspan='2'></td></tr>";
			}
		}
		else
		{
			if(vStageScanRequired == "T")
			{
				html = html +"	<tr><td>	<input name='cmdStage' type='submit' value='Pick & Stage' onclick='this.form.hdnStageflag.value=this.value; return validateForm();'/></td><td colspan='2'></td></tr>";
			}
		}


		html = html +"		 </table>";
		// Implemented UOM and Itemstatus dropdowns
		if((objBinDetails !=null && objBinDetails != '' && objBinDetails.length !=null ) || 
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{
			html = html + "	<table class='uomstatus-gridgap'> <tr>";
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
					nlapiLogExecution('DEBUG', 'makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect); 

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

			html = html +"</table>" ;


			html=html+"	<table style='border-spacing: 0;' id='tblqtyUOM'>"+
			" <tr class='uir-machine-headerrow' colspan='3'>"+


			" <td>Lot#"+
			" </td>"+	
			" <td class='align-right'>Qty"+
			" </td>";
			html = html +"				<td></td>";
			//Inventorystatus Feature is enabled
			if(inventoryStatusFeature == true)
			{				
				html = html +"				<td  class='status-rw-display'>Inv Status ";
				html = html +"				</td>";

			}

			html = html +" <td>Expiry Date"+
			" </td>"+
			"</tr>";
			//var vColumnslist=objBinDetails[0].getAllColumns();

			var count = 0;
			var convRate = getStockConversionRate;
			var selectedUOM = request.getParameter('custparam_uomprevselected');
			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
			{

				//convRate = Number(Big(getStockConversionRate).div(selectedUOM));
				nlapiLogExecution('DEBUG', 'convRate old', convRate);

			}

			for (var s = 0; s < objBinDetails.length && s < 5; s++) 
			{
				count  = parseInt(count)+1;
				if(s%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var lotDetails = objBinDetails[s];
				//var vitemLotQty=objBinDetails[s].getValue(vColumnslist[7]);
				//var vitemLot=objBinDetails[s].getText(vColumnslist[11]);
				var vitemLotQty = lotDetails[1];
				var vitemLot = lotDetails[3];
				var vitemLotExp = lotDetails[4];
				var vitemLotstatus= lotDetails[5];

				var binAvailQty =Number(Big(vitemLotQty).mul(convRate));
				nlapiLogExecution('DEBUG', 'binAvailQty', binAvailQty);

				html = html + "	<tr class='" + vAltClass + "'>"+
				" <td> <a onclick='return validateLot(\""+vitemLot+"\");' href='#' >"+vitemLot+" </a></td>"+
				" <td   class='align-right'> "+parseFloat(parseFloat(binAvailQty).toFixed(5))+"</td>";
				html = html +"				<td></td>";
				//Inventorystatus Feature is enabled
				if(inventoryStatusFeature == true)
				{					
					html = html +"				<td  class='status-cl-display'>"+vitemLotstatus+"";	
					html = html +"				</td>";

				}

				html = html +" <td> "+vitemLotExp+"</td>"+
				"</tr>";
				if(count >=5)
					break;
			}

			html = html + 	"</table>";

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
	else {


		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var enterLot=request.getParameter('txtlot');
		var getPickreportid=request.getParameter('hdnPickReportId');
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_shipmethod"] = request.getParameter('hdnShipVia');
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
		SOarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		//SOarray["custparam_soitem"] = request.getParameter('hdnSoItem');
		SOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		SOarray["custparam_enterQty"]=request.getParameter('hdnenterQty');;
		SOarray["custparam_enterBin"]=request.getParameter('hdnenterBin');;
		SOarray["custparam_pickreportid"] =getPickreportid;
		SOarray["custparam_cartonscreenrulevalue"]=request.getParameter('hdncartonScreenRuleValue');
		SOarray["custparam_carton"] =request.getParameter('hdncarton');
		SOarray["custparam_cartonsize"] =request.getParameter('hdncartonSize');
		SOarray["custparam_cartonweight"] =request.getParameter('hdncartonWeight');
		SOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		SOarray["custparam_uom"] = request.getParameter('hdnuom');
		SOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		SOarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		SOarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		SOarray["custparam_orderqty"] = request.getParameter('hdnorderQty');
		if(SOarray["custparam_orderqty"] == null || SOarray["custparam_orderqty"] == '')
			SOarray["custparam_orderqty"]=0;
		SOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		SOarray["custparam_stagescanrequired"] = request.getParameter('hdnvStageScanRequired');
		SOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		SOarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var pickType = request.getParameter('hdnPickType');
		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var soInternalId=request.getParameter('hdnSoInternalId');
		var recQty=request.getParameter('hdnItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var soLineno=request.getParameter('hdnSoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var vShipVia=request.getParameter('hdnShipVia');
		var vMultiShipping='F';

		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'soInternalId = ' + soInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'soLineno = ' + soLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'enterLot = ' + enterLot + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		logMsg = logMsg + 'SOarray["custparam_whlocation"] ' + SOarray["custparam_whlocation"] + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - Lot', logMsg);
		logMsg="";
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
				nlapiLogExecution('DEBUG', 'invtstatuslst', makeInventoryAvailFlag);

				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				//var binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);
				var binInternalId=request.getParameter('hdnbininyternalid');
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){
					// Inventory status change 
					SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;

					SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'));
					var isFromStatusChange = request.getParameter('hdnfromstatuschange');
					nlapiLogExecution('DEBUG', 'isFromStatusChange', isFromStatusChange);
					if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && isFromStatusChange != undefined && isFromStatusChange=='T' )
					{
						SOarray["custparam_pagecount"]=0;
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
						return;

					}
					// Next button
					if(request.getParameter('cmdEnbNextList')=="Next")
					{
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))+1;						
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
						return;
					}
					// Prev button
					if(request.getParameter('cmdEnbPrevList')=="Prev")
					{
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))-1;						
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
						return;
					}
					//Check Inventorystatus Feature is turn on/off
					var inventoryStatusFeature = isInvStatusFeatureEnabled();
					
					var selectedStatus =''; 
					var objBinStatusDetails =null;
					if(enterLot!=null && enterLot!="" && enterLot!='null')
					{

						try
						{
							//Inventorystatus Feature is enabled
							if(inventoryStatusFeature ==true)
							{
								var lotInternalId = '';
								var filterStrat = new Array();
								if(FetchedItemId != null && FetchedItemId != '')
									filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
								if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] != '')
									filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', SOarray["custparam_whlocation"]));
								if(binInternalId != null && binInternalId != '')
									filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));

								if(enterLot != null && enterLot != '' && enterLot != 'null'  && enterLot != 'undefined')
								{
									nlapiLogExecution('DEBUG', 'inside lotorserialfilter',enterLot); 
									filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', enterLot));
								}

								var columnStrat=new Array();
								columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
								columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
								columnStrat[0].setSort(true);
								//No need of Load Search here as we will get only one record
								var objlotDetails = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

								if(objlotDetails != null && objlotDetails != '' && objlotDetails != 'null' && objlotDetails != 'undefined' && objlotDetails.length>0)
								{
									nlapiLogExecution('DEBUG', 'objlotDetails', objlotDetails.length);
									lotInternalId =objlotDetails[0].getValue('inventorynumber','inventoryNumberBinOnHand');
								}
								nlapiLogExecution('DEBUG', 'lotInternalId', lotInternalId);

								if(lotInternalId != null && lotInternalId != '' && lotInternalId != 'null'  && lotInternalId != 'undefined' && lotInternalId != undefined)
								{
									var invfilterStrat =  new Array();
									if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] != '')
										invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', SOarray["custparam_whlocation"]));
									if(FetchedItemId != null && FetchedItemId != '')
										invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
									if(binInternalId!= null && binInternalId!= '')
										invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
									if(lotInternalId != null && lotInternalId != '')
										invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', lotInternalId));
									objBinStatusDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);
									nlapiLogExecution('DEBUG', 'objBinStatusDetails', objBinStatusDetails);
									if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null'
										&& objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined && objBinStatusDetails.length ==1)
									{
										nlapiLogExecution('DEBUG', 'objBinStatusDetails.length', objBinStatusDetails.length);
										selectedStatus = objBinStatusDetails[0].getValue('status',null,'group');
									}
									else 
									{
										if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null'
											&& objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined)
										{
											SOarray['custparam_enteredlot'] = objBinStatusDetails[0].getValue('inventorynumber',null,'group');
											SOarray["custparam_enteredBinID"]=binInternalId;
											SOarray["custparam_enteredbin"]=enterBin;
											SOarray["custparam_enteredqty"]=enterQty;
											if(request.getParameter('hdnCloseflag') == 'Pick & Close')
											{
												SOarray["custparam_hdnCloseflag"]='Pick And Close';
											}
											if(request.getParameter('hdnStageflag') == 'Pick & Stage')
											{
												SOarray["custparam_hdnCloseflag"]='Pick And Stage';
											}
											if(objBinStatusDetails.length > 1)
											{
												response.sendRedirect('SUITELET', 'customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
												return;  
											}
										}
									}
									nlapiLogExecution('DEBUG', 'SOarray[custparam_enteredlot]', SOarray['custparam_enteredlot']);
								}
								else
								{
									SOarray["custparam_error"] = 'Please enter/scan valid lot#';
									response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
									return;
								}
							}				
							nlapiLogExecution('DEBUG', 'selectedStatus', selectedStatus);


							try{
								var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockbin');
								LockRecord.setFieldValue('name',binInternalId);
								LockRecord.setFieldValue('custrecord_wmse_lock_sku',FetchedItemId);
								LockRecord.setFieldValue('custrecord_wmsse_lock_binlocation',binInternalId);										
								LockRecord.setFieldValue('custrecord_wmsse_lock_flag','T');
								LockRecord.setFieldValue('custrecord_wmsse_lock_unittype',vUnitType);
								LockRecord.setFieldValue('custrecord_wmsse_lockqty',enterQty);
								LockRecord.setFieldValue('custrecord_wmsse_lockuser',context.getUser());
								LockRecord.setFieldValue('custrecord_wmsse_lock_stockunit',StockUnitText);
								LockRecord.setFieldValue('custrecord_wmsse_lock_conversionrate',getStockConversionRate);
								LockRecord.setFieldValue('custrecord_wmsse_lock_itemtype',itemType);
								LockRecord.setFieldValue('custrecord_wmsse_lock_seriallot',enterLot);
								if(selectedStatus != '')
								{
									LockRecord.setFieldValue('custrecord_wmsse_lock_invtstatus',selectedStatus);	
								}
								LockRecord.setFieldValue('custrecord_wmsse_lock_trantype',trantype);
								var recid = nlapiSubmitRecord(LockRecord);

								LockRecord=null;
							}
							catch(e)
							{
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


								response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
								return;
							}

							lockresults=null;									
							lockfilters=null;	


							//Inventorystatus Feature is enabled
							if(inventoryStatusFeature ==true)
							{

								if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null'
									&& objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined && objBinStatusDetails.length > 0)
								{
									SOarray["custparam_enteredBinID"]=binInternalId;
									SOarray["custparam_enteredbin"]=enterBin;
									SOarray["custparam_enteredqty"]=enterQty;
									if(request.getParameter('hdnCloseflag') == 'Pick & Close')
									{
										SOarray["custparam_hdnCloseflag"]='Pick And Close';
									}
									if(request.getParameter('hdnStageflag') == 'Pick & Stage')
									{
										SOarray["custparam_hdnCloseflag"]='Pick And Stage';
									}
									if(objBinStatusDetails.length > 1)
									{
										response.sendRedirect('SUITELET', 'customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
										return;  
									}
									else
									{
										selectedStatus = objBinStatusDetails[0].getValue('status',null,'group');
									}
								}
							}
							nlapiLogExecution('Debug', 'vMultiShipping : vShipVia ', vMultiShipping + ":" + vShipVia);
							var taskType="PICK";
							if(request.getParameter('hdnCloseflag') == 'Pick & Close')
							{
								// passing invetorystatus as a parameter to the opentask creation function
								if(vStageScanRequired == "F")
									var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
											enterLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
											SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
											'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
											ordType,null,null,null,null,selectedStatus);
								else
									var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
											enterLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
											SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
											'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
											ordType,null,null,null,null,selectedStatus);
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
										response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
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

							var isItLastPick='F';
							if(vStageScanRequired == "F")
							{
								//var soLineDetails = getSOLineDetailsItem(soInternalId,trantype,null,SOarray["custparam_whlocation"]);
								var soLineDetails=getSOqtyscandetails(soInternalId,trantype,SOarray["custparam_whlocation"]);

								if(soLineDetails !=null && soLineDetails!="" && vStageScanRequired == "F")
								{
									var vLinecount=0;
									nlapiLogExecution('DEBUG', 'soLineDetails.length', soLineDetails.length);
									if(soLineDetails.length>0)
									{
										var vColumnslist=soLineDetails[0].getAllColumns();

										var custIndex = 12;
										var commitedQtyIndex = 25;
										var fulfilledQtyIndex = 26;
										var conversionRateIndex=27;
										var totalPickedQtyIndex =7;
										var totalNSPickedQtyIndex =37;
										var ERPConfirmedQty =38;


										var vOpentaskdetails = getPickedqtydetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
										for(var f=0;f<soLineDetails.length;f++)
										{

											var vsoitem = soLineDetails[f].getText('item');
											var vsoitemId = soLineDetails[f].getValue('item');
											var vsoitemType=soLineDetails[f].getValue('type','item');

											if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
												|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
											{
												var vsoitemQty=soLineDetails[f].getValue('quantity');
											}
											else
											{
												var vsoitemQty=soLineDetails[f].getValue('quantitycommitted');
											}

											var vsoitemfulfillQty=soLineDetails[f].getValue('quantitypicked');				

											var vsoitemNSReceivedQty=soLineDetails[f].getValue('quantitypicked');
											var vsoitemNSshippedQty=soLineDetails[f].getValue('quantityshiprecv');
											var vsoitemMultiShipping = soLineDetails[f].getValue('ismultishipto');
											var vsoitemShipVia = soLineDetails[f].getValue('shipmethod');

											var vsoitemLine = soLineDetails[f].getValue('line');					
											var vUnitsText = soLineDetails[f].getValue('unit');
											var vConversionRate = soLineDetails[f].getValue('formulanumeric');




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
												var vsoitemRemQty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
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

												//enterQty = parseFloat(parseFloat(enterQty).toFixed(5));
												//vsoitemRemQty = parseFloat(parseFloat(vsoitemRemQty).toFixed(5));


												var totalQty=Number(Big(vsoitemRemQty).minus(enterQty));
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
												vsoitemLine=parseFloat(vsoitemLine)-1;

											if(vsoitemLine==SOarray["custparam_lineno"] && vsoitemShipVia == vShipVia)
											{

												//enterQty = parseFloat(parseFloat(enterQty).toFixed(5));
												//vsoitemRemQty = parseFloat(parseFloat(vsoitemRemQty).toFixed(5));


												var totalQty=Number(Big(vsoitemRemQty).minus(enterQty));
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
							}
							soLineDetails=null;
							nlapiLogExecution('DEBUG', 'isItLastPick', isItLastPick);

							// To post IF when order level is true and lastpick is true for already packed containers against order
							if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T")
							{
								var filtersPack = new Array();
								filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));

								var opentaskSearchResultsPack=nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_open_packtask_details',filtersPack,null);
								if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
								{

									var fieldsPack = new Array();
									var valuesPack = new Array();
									for(var x=0; x < opentaskSearchResultsPack.length; x++)
									{

										var RecordIdPack=opentaskSearchResultsPack[x].getId();
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
								// passing invetorystatus as a parameter to the opentask creation function
								if(vStageScanRequired == "F")
									var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
											enterLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
											SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
											'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
											ordType,null,null,null,null,selectedStatus);
								else
									var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
											enterLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
											SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
											'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
											ordType,null,null,null,null,selectedStatus);
								context.setSessionObject('record', 'created'); 
							}
							else
							{
								if(SOarray["custparam_orderlevel"] =="T")
								{
									// passing invetorystatus as a parameter to the opentask creation function
									var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
											enterLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
											SOarray["custparam_cartonweight"],'F',trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
											'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
											ordType,null,null,null,null,selectedStatus);
									context.setSessionObject('record', 'created'); 
								}
								else
								{
									if(vStageScanRequired == "F")
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
												enterLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
												SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
												'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
												ordType,null,null,null,null,selectedStatus);
									else
										var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
												enterLot,'','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
												SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
												'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
												ordType,null,null,null,null,selectedStatus);
									context.setSessionObject('record', 'created'); 
								}
							}

							
							soLineDetails = getSOqtyscandetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
							
							var cmdStage = request.getParameter('hdnStageflag');

							if(soLineDetails !=null && soLineDetails!="" && cmdStage != 'Pick & Stage')
							{
								nlapiLogExecution('Debug', 'soLineDetails.length', soLineDetails.length);
								if(soLineDetails.length>0)
								{
									var vColumnslist=soLineDetails[0].getAllColumns();

									var custIndex = 12;
									var commitedQtyIndex = 25;
									var fulfilledQtyIndex = 26;
									var conversionRateIndex=27;
									var totalPickedQtyIndex =7;
									var totalNSPickedQtyIndex =37;
									var ERPConfirmedQty =38;
									var vOpentaskdetails = getPickedqtydetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
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
											response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
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
											response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
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
										response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
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
							soLineDetails=null;

						}				
						catch(e)
						{
							nlapiLogExecution('DEBUG', 'inside catch exception', e);
							SOarray["custparam_error"] =e;
							nlapiLogExecution('Debug', 'Exception: ', e);

							var lockfilters=new Array();

							lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',FetchedItemId));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
							var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

							if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
							{
								var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
								nlapiLogExecution('DEBUG','DeleteRecordId', DeleteRecordId);
							}

							response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
							return;
						}

					}
					else
					{
						SOarray["custparam_error"] = 'Please enter/scan valid lot#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
						return;
					}
				} 
				else {
					SOarray["custparam_error"] = '';
					var lockfilters=new Array();

					lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',FetchedItemId));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
					var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

					if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
					{
						var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());

					}
					response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
					return;
				}
			}
			catch (e) 
			{
				SOarray["custparam_error"] =e;
				nlapiLogExecution('Debug', 'Exception: ', e);
				response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			if(vStageScanRequired == "F")
				response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
			else
				response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
			return;

		}
	} //end of first if condition
} //end of function.
/**
 * TO Validate lot
 * @param binInternalId
 * @param enterLot
 * @param FetchedItemId
 * @param whlocation
 * @returns
 */
function nswms_ValidateLot(binInternalId,enterLot,FetchedItemId,whlocation)
{

	var logmsg = 'binInternalId. = ' + binInternalId + '<br>';
	logmsg = logmsg + 'enterLot. = ' + enterLot + '<br>';
	logmsg = logmsg + 'FetchedItemId. = ' + FetchedItemId + '<br>';	
	logmsg = logmsg + 'whlocation. = ' + whlocation + '<br>';						
	nlapiLogExecution('DEBUG', 'Values :', logmsg);
	var enterLot1 =1;
	var itemfilters=new Array();
	itemfilters.push(new nlobjSearchFilter('item',null,'anyof',FetchedItemId));
	itemfilters.push(new nlobjSearchFilter('binnumber', null, 'anyof', binInternalId));
	itemfilters.push(new nlobjSearchFilter('inventorynumber',null,'is', enterLot1));


	var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);

	itemfilters=null;	
	return itemresults;
}


function fnGetLotQty(getItemInternalId,vBinIdArr,getPreferBin,strLocation,AllowAllLots)
{

	var logmsg = 'getItemInternalId. = ' + getItemInternalId + '<br>';
	logmsg = logmsg + 'vBinIdArr. = ' + vBinIdArr + '<br>';
	logmsg = logmsg + 'getPreferBin. = ' + getPreferBin + '<br>';	
	logmsg = logmsg + 'strLocation. = ' + strLocation + '<br>';						
	nlapiLogExecution('DEBUG', 'Values :', logmsg);
	var vmakeInvAvailFlag = "T";
	var fields = ['makeinventoryavailable'];
	var vLocDetails= nlapiLookupField('location',strLocation,fields);
	vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;

	var vBinLocArr=new Array();
	var filterStrat = new Array();
	var totalLotQty = 0;
	var objBinDetails = null;
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	if(inventoryStatusFeature ==true)
	{
		var filterStrat = new Array();

		if(getItemInternalId != null && getItemInternalId != '')
			filterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', getItemInternalId));
		if(strLocation!= null && strLocation!= '')
			filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', strLocation));
		if(vBinIdArr != null && vBinIdArr != '')
			filterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', vBinIdArr));

		// No need for loadsearch here this search is for navigating to other screen if the serach returns more
		//than one status.

		objBinDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterStrat, null);
	}
	else
	{

		if(getItemInternalId != null && getItemInternalId != '')
			filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', getItemInternalId));
		if(strLocation!= null && strLocation!= '')
			filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', strLocation));
		if(vBinIdArr!= null && vBinIdArr!= '')
			filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', vBinIdArr));

		var systemRule_AllowExpiredItems=' ';
		systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',strLocation);
		nlapiLogExecution("Error","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);

		objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);
	}
	if(objBinDetails != null && objBinDetails != ''  && objBinDetails.length >0)
	{
		nlapiLogExecution('ERROR','objBinDetails',objBinDetails.length);
		if(inventoryStatusFeature ==false)
		{
			vIsLotItem=objBinDetails[0].getValue('islotitem');
		}
		else
		{
			vIsLotItem = 'T';
		}
		nlapiLogExecution('ERROR','vIsLotItem',vIsLotItem);
		var vLotExpArr=new Array();
		var vLotArr=new Array();
		if(vIsLotItem == 'T')
		{
			var vValidBinIdArr=new Array();
			var vValidBinTextArr=new Array();
			var vValidBinAvailQtyArr=new Array();
			var vValidBinInvNumArr=new Array();
			var vValidBinInvStatusArr = new Array();
			var vstrLotNameCSV="";
			var strBinCSV="";
			for(var j=0;j<objBinDetails.length;j++)
			{
				var vValidBinId='';
				var vValidBin='';
				var vBinQtyAvail='';
				var vBinInvNum='';
				var vBinInvStatus='';
				if(inventoryStatusFeature == true)
				{
					vValidBinId=objBinDetails[j].getValue('binnumber',null,'group');
					vValidBin=objBinDetails[j].getText('binnumber',null,'group');
					vBinQtyAvail=objBinDetails[j].getValue('available',null,'sum');
					vBinInvNum=objBinDetails[j].getText('inventorynumber',null,'group');
					vBinInvStatus = objBinDetails[j].getValue('status',null,'group');
					vValidBinInvStatusArr.push(vBinInvStatus)
				}
				else
				{
					vValidBinId=objBinDetails[j].getValue('binnumber','inventoryNumberBinOnHand');
					vValidBin=objBinDetails[j].getText('binnumber','inventoryNumberBinOnHand');
					if(vmakeInvAvailFlag == "T")
						vBinQtyAvail=objBinDetails[j].getValue('quantityavailable','inventoryNumberBinOnHand');
					else
						vBinQtyAvail=objBinDetails[j].getValue('quantityonhand','inventoryNumberBinOnHand');
					vBinInvNum=objBinDetails[j].getText('inventorynumber','inventoryNumberBinOnHand');
				}
				vValidBinIdArr.push(vValidBinId);
				vValidBinTextArr.push(vValidBin);
				vValidBinAvailQtyArr.push(vBinQtyAvail);
				vValidBinInvNumArr.push(vBinInvNum);
				if(strBinCSV == "")
					strBinCSV=vValidBinId;
				else
					strBinCSV=strBinCSV + ',' + vValidBinId;
				if(vstrLotNameCSV == "")
					vstrLotNameCSV=vBinInvNum;
				else
					vstrLotNameCSV= vstrLotNameCSV + ',' + vBinInvNum;
			}

			var filtersExp = new Array();
			if (getItemInternalId != null && getItemInternalId != ""){
				filtersExp[0] = new nlobjSearchFilter('internalid', null, 'anyof', getItemInternalId);		

			}
			if(strLocation != null && strLocation != '' && strLocation != 'null')
				filtersExp[1] = new nlobjSearchFilter('location', 'inventorynumber', 'anyof', strLocation);
			if((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '') && (AllowAllLots != 'T'))
			{

				nlapiLogExecution("DEBUG","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);

				filtersExp.push(new nlobjSearchFilter('formuladate',null, 'onorafter',DateStamp()).setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));

			}

			var columnsExp = new Array(); 
			var searchresultsExp = nlapiSearchRecord('item', 'customsearch_wmsse_expdate_lots', filtersExp, columnsExp);
			var vTempInvBinArr=new Array();
			if(searchresultsExp != null && searchresultsExp != '')
			{ 
				for(var s=0;s<searchresultsExp.length;s++)
				{

					if(searchresultsExp[s].getValue('inventorynumber','inventorynumber') != null && searchresultsExp[s].getValue('inventorynumber','inventorynumber') != '')
					{
						if(vValidBinInvNumArr.indexOf(searchresultsExp[s].getValue('inventorynumber','inventorynumber')) != -1)
						{	
							vLotArr.push(searchresultsExp[s].getValue('inventorynumber','inventorynumber'));
							vLotExpArr.push(searchresultsExp[s].getValue('expirationdate','inventorynumber'));
						}
					}	
				}	
			}

			var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(getItemInternalId,vValidBinIdArr,strLocation,objBinDetails[0].getValue('unitstype'),objBinDetails[0].getText('stockunit'));
			var vBinOpenTaskLotArr = "";
			var vBinOpenTaskExpDateArr = "";
			var vBinOpenTaskBinIdArr = "";
			var vBinOpenTaskBinQtyArr = "";
			var vBinOpenTaskBinStatusArr='';

			if(vBinOpenTaskDetails != null && vBinOpenTaskDetails!='' && vBinOpenTaskDetails.length > 0)
			{
				vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
				vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
				vBinOpenTaskLotArr = vBinOpenTaskDetails[3];
				vBinOpenTaskExpDateArr = vBinOpenTaskDetails[4];
				if(inventoryStatusFeature == true)
				{
					vBinOpenTaskBinStatusArr = vBinOpenTaskDetails[5];
				}
			}	
			nlapiLogExecution('DEBUG', 'vLotArr :', vLotArr);
			for(var u=0;u<vLotArr.length;u++)
			{
				if(vLotArr[u]!= null && vLotArr[u]!= '')
				{	
					var vLotExp = vLotExpArr[u];
					var vTempLotArrNew=vstrLotNameCSV.split(',');
					var vTempLotArr = new Array();
					for(var l=0;l<vTempLotArrNew.length;l++)
					{
						var tLot= vTempLotArrNew[l];
						if(tLot == vLotArr[u])
						{
							vTempLotArr.push(l);
						}
					}

					if(vTempLotArr.length>1)//Means lot occures in more than once
					{
						for(l1=0;l1<vValidBinIdArr.length;l1++)
						{

							if(vValidBinInvNumArr[l1] == vLotArr[u])
							{
								var vValidBin = vValidBinTextArr[l1];
								var vValidBinId = vValidBinIdArr[l1];
								var vBinQtyAvail = vValidBinAvailQtyArr[l1];
								var vBinQtyInvNum = vValidBinInvNumArr[l1];
								var vBinInvStatus = vValidBinInvStatusArr[l1];
								var vOpenLotQty = 0;

								if(vBinOpenTaskBinIdArr != null && vBinOpenTaskBinIdArr !='')
								{
									for(var m1=0;m1<vBinOpenTaskBinIdArr.length;m1++)
									{
										var vOpenBinId = vBinOpenTaskBinIdArr[m1];
										if(vValidBinId == vOpenBinId)
										{
											var vOpenLot=vBinOpenTaskDetails[3][m1];
											var vOpenLotStatus = vBinOpenTaskDetails[5][m1];

											if(inventoryStatusFeature == true)
											{
												//To filter quantitiy based on lot and inventory status.
												if(vBinQtyInvNum == vOpenLot && (vOpenLotStatus==null ||
														vOpenLotStatus=='' || vOpenLotStatus==vBinInvStatus))
												{
													vOpenLotQty=vBinOpenTaskDetails[1][m1];
													break;
												} 
											}
											else
											{
												if(vBinQtyInvNum == vOpenLot)
												{
													vOpenLotQty=vBinOpenTaskDetails[1][m1];
													break;
												} 
											}
										}
									}
								}


								if(vOpenLotQty ==null || vOpenLotQty =='null' || vOpenLotQty =='' || vOpenLotQty =='undefined')
									vOpenLotQty = 0;



								vBinQtyAvail = Number(Big(vBinQtyAvail).minus(Big(vOpenLotQty)));
								totalLotQty = Number(Big(totalLotQty).plus(vBinQtyAvail))
								nlapiLogExecution('DEBUG', 'vBinQtyAvail in if', vBinQtyAvail);
								nlapiLogExecution('DEBUG', 'totalLotQty in if', totalLotQty);

							}
						}
					}
					else
					{

						var vValidBin = vValidBinTextArr[vValidBinInvNumArr.indexOf(vLotArr[u])];
						var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinInvNumArr.indexOf(vLotArr[u])];
						var vBinQtyInvNum = vValidBinInvNumArr[vValidBinInvNumArr.indexOf(vLotArr[u])];
						var vValidBinId = vValidBinIdArr[vValidBinInvNumArr.indexOf(vLotArr[u])];

						var vOpenLotQty = 0;

						if(vBinOpenTaskBinIdArr != null && vBinOpenTaskBinIdArr !='')
						{
							for(var m1=0;m1<vBinOpenTaskBinIdArr.length;m1++)
							{
								var vOpenBinId = vBinOpenTaskBinIdArr[m1];
								if(vValidBinId == vOpenBinId)
								{
									var vOpenLot=vBinOpenTaskDetails[3][m1];
									if(vBinQtyInvNum == vOpenLot)
									{
										vOpenLotQty=vBinOpenTaskDetails[1][m1];
										break;
									} 
								}
							}
						}

						if(vOpenLotQty ==null || vOpenLotQty =='null' || vOpenLotQty =='' || vOpenLotQty =='undefined')
							vOpenLotQty = 0;


						vBinQtyAvail = Number(Big(vBinQtyAvail).minus(Big(vOpenLotQty)));
						totalLotQty = Number(Big(totalLotQty).plus(vBinQtyAvail))
						nlapiLogExecution('DEBUG', 'vBinQtyAvail', vBinQtyAvail);
						nlapiLogExecution('DEBUG', 'totalLotQty', totalLotQty);
					}	
				}

			}

		}
	}

	objBinDetails = null;
	searchresultsExp = null;
	return totalLotQty;
}