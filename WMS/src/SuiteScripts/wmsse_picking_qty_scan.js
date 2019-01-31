/**
 * Script Description
 * This script is used to scan the Order from Open orders list.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan order from open orders list
 */
function PickingQty(request, response){

	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') {

		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var getOptedField = request.getParameter('custparam_option');
		var enteredBin=request.getParameter('custparam_enterbin');
		var enteredItem=request.getParameter('custparam_enteritem');
		var enteredBinId=request.getParameter('custparam_enterbinid');
		var whlocation = request.getParameter('custparam_whlocation');
		var enterOrder=request.getParameter('custparam_enterorder');
		var item=request.getParameter('custparam_item');
		var enterLot =request.getParameter('custparam_enterlot');
		nlapiLogExecution('DEBUG', 'enterLot', enterLot);
		var getItemType=request.getParameter('custparam_itemtype');
		var trantype=request.getParameter('custparam_trantype');
		var qtyToPick=request.getParameter('custparam_itemremainingqty');
		var binQty=request.getParameter('custparam_itembinqty');
		var enteredLot=request.getParameter('custparam_enterlot');
		var soId=request.getParameter('custparam_soId');
		var solineno=request.getParameter('custparam_solineno');
		var customer=request.getParameter('custparam_customer');
		var vUnitsText=request.getParameter('custparam_unitstext');
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate'); 
		var getmemitemqty = request.getParameter('custparam_memitemqty'); 
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');

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
		var userAccountId = ctx.getCompany();
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		var whLocationName = request.getParameter('custparam_whlocationname');

		var itemType = '';
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
		var vunitstype ='';
		var vstockunit ='';
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
		if(itemresults!=null && itemresults!='')
		{
			item = itemresults[0].getValue('itemid');
			vstockunit = itemresults[0].getText('stockunit');
			vunitstype = itemresults[0].getValue('unitstype');
	
			nlapiLogExecution('DEBUG', 'vstockunit,vunitstype', vstockunit+","+vunitstype);

			itemType = itemresults[0].recordType;
		}

		if(itemType == null || itemType =='' || itemType == 'null' || itemType == 'undefined')
		{
			itemType = getItemType;
		}

		var enteredLotID=request.getParameter('custparam_enterlotid');

		// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
		var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

		var invt_status = '';
		if(inventoryStatusFeature == true)
		{
			var objBinStatusDetails =  new Array();
			var vStatusDetails = new Array();
			nlapiLogExecution('DEBUG', 'itemType', itemType);
			var invfilterStrat =  new Array();
			var vStatusResults = null;
			//loadsearch is not required here as we were checking status length to display inventory status
			if(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem")
			{
				vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat,null);
			}
			else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
			{
				vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh',invfilterStrat,null);	
			}
			else
			{
				vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_invt_item',invfilterStrat,null);	  
			}

			if(whlocation != null && whlocation != '')
				vStatusResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', whlocation));
			if(enteredItem != null && enteredItem != '')
				vStatusResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', enteredItem));
			if(enteredBinId != null && enteredBinId!= '')
				vStatusResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', enteredBinId));
			if(enteredLotID != null && enteredLotID!= '' && enteredLotID != 'null'
				&& enteredLotID != 'undefined' && enteredLotID != undefined && 
				(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem"))
			{
				vStatusResults.addFilter(new nlobjSearchFilter('inventorynumber',null, 'anyof', enteredLotID));	

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
				objBinStatusDetails.push(searchResult);
				if(invItr==4000)
				{
					return false;
				}
				return true;                // return true to keep iterating
					});

			if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && objBinStatusDetails != 'undefined' && 
					objBinStatusDetails != undefined && objBinStatusDetails.length != null && objBinStatusDetails.length >0)
			{
				if(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem")
					vOpenPickDetails = getOPenTaskPickBinDetailsLot(enteredItem,enteredBinId,whlocation,vunitstype,vstockunit);
				else
					vOpenPickDetails = getOPenTaskPickBinDetails(enteredItem,enteredBinId,whlocation,vunitstype,vstockunit,'','');

				for(var stsItr=0;stsItr<objBinStatusDetails.length;stsItr++)
				{

					var status = '';
					var vBinQtyAvail ='';
					var statusId ='';
					var eneteredLotTxt ='';
					if((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem" || 
							itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
					{
						status = objBinStatusDetails[stsItr].getText('status',null,'group');					
						vBinQtyAvail=objBinStatusDetails[stsItr].getValue('available',null,'sum');				
						statusId = objBinStatusDetails[stsItr].getValue('status',null,'group');
						eneteredLotTxt = objBinStatusDetails[stsItr].getText('inventorynumber',null,'group');
					}
					else
					{
						status = objBinStatusDetails[stsItr].getText('status');					
						vBinQtyAvail=objBinStatusDetails[stsItr].getValue('available');				
						statusId = objBinStatusDetails[stsItr].getValue('status');
					}
					nlapiLogExecution('DEBUG', 'vBinQtyAvail  bef', vBinQtyAvail);
					var openPickQty = 0;
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
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
								for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
								{
									var opentaskStatus = vBinStatusArr[binIterator];
									var opentaskLotText =vBinLotArr[binIterator];
																		
									var logMsg1 = 'opentaskStatus =' + opentaskStatus + '<br>';
									logMsg1 = logMsg1 + 'statusId = ' + statusId + '<br>';
									logMsg1 = logMsg1 + 'eneteredLotTxt = ' + eneteredLotTxt + '<br>';
									logMsg1 = logMsg1 + 'opentaskLotText = ' +opentaskLotText+ '<br>';
									nlapiLogExecution('DEBUG', 'parameters in post', logMsg1);
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
							nlapiLogExecution('Debug','statusId',vBinStatusArr);
							if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined'
								&& vBinStatusArr != undefined)
							{
								for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
								{
									var opentaskStatus = vBinStatusArr[binIterator];
									nlapiLogExecution('Debug','opentaskStatus',opentaskStatus);
									nlapiLogExecution('Debug','statusId',statusId);
									
									nlapiLogExecution('DEBUG', 'opentaskStatus,statusId', opentaskStatus+","+statusId);


									
									if(opentaskStatus == statusId)
									{
										openPickQty = vOpenPickQtyArr[binIterator];
										break;
									}
								}
							}

						}
					}


					vBinQtyAvail =new Big(vBinQtyAvail);
					openPickQty =new Big(openPickQty);
					vBinQtyAvail = Number(vBinQtyAvail.minus(openPickQty));
					nlapiLogExecution('DEBUG', 'vBinQtyAvail1 in Big ', vBinQtyAvail);


					if(parseFloat(vBinQtyAvail) > 0)
					{
						vStatusDetails.push(status);
					}
				}

			}
			nlapiLogExecution('DEBUG', 'vStatusDetails', vStatusDetails.length);
			if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' &&
					vStatusDetails != 'undefined' && vStatusDetails != undefined &&
					vStatusDetails.length != null && vStatusDetails.length == 1)
			{

				invt_status = vStatusDetails[0];	

				nlapiLogExecution('DEBUG', 'invt_status', invt_status);
			}


		}




		var SOarray=new Array();
		SOarray["custparam_ordtype"] =request.getParameter('custparam_ordtype');
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		SOarray["custparam_enterbin"] = request.getParameter('custparam_enterbin');
		SOarray["custparam_enterbinid"] = request.getParameter('custparam_enterbinid');
		SOarray["custparam_enteritem"] = request.getParameter('custparam_enteritem');
		SOarray["custparam_item"] = request.getParameter('custparam_item');
		SOarray["custparam_trantype"] =request.getParameter('custparam_trantype');
		SOarray["custparam_enterorder"] = request.getParameter('custparam_enterorder');
		SOarray["custparam_itembinqty"] = request.getParameter('custparam_itembinqty');
		SOarray["custparam_itemremainingqty"] = request.getParameter('custparam_itemremainingqty');
		SOarray["custparam_enterlot"] = request.getParameter('custparam_enterlot');
		SOarray["custparam_stockconversionrate"] = request.getParameter('custparam_stockconversionrate'); 
		SOarray["custparam_unitstext"] = request.getParameter('custparam_unitstext');
		SOarray["custparam_conversionrate"] = request.getParameter('custparam_conversionrate');
		SOarray["custparam_memitemqty"]=request.getParameter('custparam_memitemqty');
		SOarray["custparam_soId"] =request.getParameter('custparam_soId');
		SOarray["custparam_solineno"] =request.getParameter('custparam_solineno');
		SOarray["custparam_customer"] =request.getParameter('custparam_customer');
		SOarray["custparam_pickreportid"] =request.getParameter('custparam_pickreportid');
		SOarray["custparam_conversionrate"] =request.getParameter("custparam_conversionrate");
		SOarray["custparam_itemtype"] =request.getParameter('custparam_itemtype');

		var currentUser=getCurrentUser();
		var lockfilters=new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',soId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',solineno));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));

		var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

		if(lockresults!=null && lockresults!='')
		{
			var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
			var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
			
			if(getLockUser!=currentUser)
			{
				SOarray["custparam_error"]='The line item is being processed by other user.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
				return;
			}
			else if(parseInt(getLockLine)!=parseInt(solineno))
			{
				var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
				LockRecord.setFieldValue('name',soId);
				LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
				LockRecord.setFieldValue('custrecord_wmsse_order',soId);
				LockRecord.setFieldValue('custrecord_wmsse_line',solineno);
				LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
				LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
				var date = new Date();
				var mSecs = date.getTime();
				LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);
				var recid = nlapiSubmitRecord(LockRecord);
				LockRecord=null;
				nlapiLogExecution('ERROR', 'Inside else if Record Locked Successfully', recid);
			}
		}
		else
		{
			var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
			LockRecord.setFieldValue('name',soId);
			LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
			LockRecord.setFieldValue('custrecord_wmsse_order',soId);
			LockRecord.setFieldValue('custrecord_wmsse_line',solineno);
			LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
			LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
			var date = new Date();
			var mSecs = date.getTime();
			LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);
			var recid = nlapiSubmitRecord(LockRecord);
			nlapiLogExecution('ERROR', 'Record Locked Successfully', recid);
			LockRecord=null;
		}
		lockresults=null;
		lockfilters=null;


		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-CHECKIN SO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{

			headerVar='Picking Qty';
			st0 = domainName + "-Picking";
			st1 = "Enter/Scan Order#";
			st2 = "SEND";
			st3 = "PREV";
			st4 = "Enter Qty";
		}	

		var vStageScanRequired="F"; 

		vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',whlocation,'2');		

		if(vStageScanRequired!=null && vStageScanRequired!='')
		{ 
			vStageScanRequired="T";			 
		}
		else
		{
			vStageScanRequired="F";
		}
		var systemRule_AllowExpiredItems='';
		systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',whlocation);
		var eneteredLotId = request.getParameter('custparam_enterlotid');

		var ordVar = "SO/TO";
		var vFOoverageChecked='F';

		if(trantype == 'salesorder')
		{
			st0 = domainName + "-SO Picking";
			ordVar = "Sales Order#";
			var vConfig=nlapiLoadConfiguration('accountingpreferences');
			if(vConfig != null && vConfig != '')
			{
				vFOoverageChecked=vConfig.getFieldValue('OVERFULFILLMENTS');
			}
			nlapiLogExecution('Debug','vFOoverageChecked', vFOoverageChecked);
		}
		else
		{
			st0 = domainName + "-TO Picking";
			ordVar = "Transfer Order#";
		}


		nlapiLogExecution('DEBUG','vStageScanRequired', vStageScanRequired);

		var parentItemType = request.getParameter('custparam_parentItemType');
		var filters = new Array();
		var columns = new Array();
		var vType='SalesOrd';
		if(trantype == 'salesorder')
			vType='SalesOrd';
		else if(trantype == 'transferorder')
			vType='TrnfrOrd';

		filters.push(new nlobjSearchFilter('tranid', null, 'is', enterOrder));
		filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));


		if(whlocation!=null && whlocation!='' && whlocation!='undefined' && whlocation!='')
		{
			if(crossSubsidiaryFeature == true && trantype =="salesorder")
			{
				filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof', ['@NONE@',whlocation]));

			}
			else
			{
				filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',whlocation]));
			}
		}

		var soLineDetails = null;

		if(parentItemType == 'kititem')
		{
			soLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_ordline_details_kit', filters, columns);
			if(soLineDetails !=null && soLineDetails !='' && soLineDetails.length > 0)
				vColumnslist=soLineDetails[0].getAllColumns();

			var memitemcommitedQtyIndex = 8;
			var memitemfulfilledQtyIndex = 9;		
			var memitemtotalPickedQtyIndex =10;
			for(var x1=0;x1<vColumnslist.length;x1++)
			{
				var summaryLabel = vColumnslist[x1].getLabel();

				if(summaryLabel == 'Member Item Total Picked Quantity')
				{
					memitemtotalPickedQtyIndex = x1;
				}
				else if (summaryLabel == 'Member Item Committed Quantity')	
				{
					memitemcommitedQtyIndex = x1;
				}
				else if (summaryLabel == 'Member Item Fulfilled Quantity')
				{
					memitemfulfilledQtyIndex = x1;
				}				
				else
				{

				}
			}
			if(soLineDetails !=null && soLineDetails !='' && soLineDetails.length !=null)
			{
				var getenteredQty =1;
				var isValidItem='F';
				var isQtyforPicking='F';
				for(var j=0; j<soLineDetails.length; j++)
				{
					var result = soLineDetails[j]; 
					var vsoitem = result.getValue('memberitem','item','group');
					var ordType = result.getValue('custbody_wmsse_ordertype',null,'group');
					var pickedqty = result.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
					var bomQty=result.getValue('memberquantity','item','group');

					getenteredQty =new Big(getenteredQty);
					bomQty =new Big(bomQty);

					var expQty = Number(getenteredQty.mul(bomQty)); 
					var vsoitemid='';
					
					nlapiLogExecution('DEBUG', 'expQty,vsoitem,item', expQty+","+vsoitem+","+item);
					if(vsoitem==item)
					{
						isValidItem='T';
						SOarray["custparam_memitempickedqty"]=pickedqty;
						SOarray["custparam_memitemqty"]=expQty;
						SOarray["custparam_itemid"]=enteredItem;

						var solineno=result.getValue('line',null,'group');

						var vsoitemQty = result.getValue(vColumnslist[memitemcommitedQtyIndex]);
						var fulfiledQty=result.getValue(vColumnslist[memitemfulfilledQtyIndex]);
						var rcvdQty = result.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
						if(rcvdQty == null || rcvdQty == '')
							rcvdQty=0;

						rcvdQty =new Big(rcvdQty);
						fulfiledQty =new Big(fulfiledQty);
						var vsoitemRcvQty = Number(rcvdQty.plus(fulfiledQty));
						nlapiLogExecution('DEBUG','vsoitemRcvQty1 in Big',vsoitemRcvQty);
						if(vsoitemQty == null || vsoitemQty == '')
							vsoitemQty=0;
						if(vsoitemRcvQty==null || vsoitemRcvQty=='')
							vsoitemRcvQty=0;


						vsoitemQty =new Big(vsoitemQty);
						vsoitemRcvQty =new Big(vsoitemRcvQty);
						var vSoreminqty = Number(vsoitemQty.minus(vsoitemRcvQty));
					
						nlapiLogExecution('DEBUG', 'vSoreminqty,isQtyforPicking', vSoreminqty+","+isQtyforPicking);
						
						if(parseFloat(vSoreminqty)>0 )
						{
							isQtyforPicking = 'T';
							break;
						}
					}
				}
				var isfromPageRefresh = context.getSessionObject('record');
				nlapiLogExecution('ERROR', 'isfromPageRefresh', isfromPageRefresh);
				if((isQtyforPicking == 'F' && vFOoverageChecked =='F') || isfromPageRefresh == 'created')
				{
					var orderLevel="F";
					orderLevel=getSystemRuleValue('Consolidate item fulfillments by sales order?',whlocation);
					if(orderLevel ==null || orderLevel =='' || orderLevel =='null' || orderLevel =='undefined')
					{
						orderLevel="F";
					}
					if(orderLevel=="Y")
					{
						orderLevel='T';
					}
					else
					{
						orderLevel='F';
					}


					var vRedirectionFlag="F";
					var deviceUploadFlag = 'T';
					var columnsOpen = new Array();
					var filtersOpen = new Array();

					if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
						filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
					if(whlocation !=null && whlocation !='' && whlocation !='null' && whlocation !='undefined')
						filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));
					var vSOLineDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist', filtersOpen, columnsOpen);
					if(vSOLineDetails != null && vSOLineDetails != '' && vSOLineDetails != 'null' && vSOLineDetails!='undefined' && vSOLineDetails.length>0)
					{	
						var vnColumnslist=vSOLineDetails[0].getAllColumns();

						var pickReportExpectedQty = 3;
						var pickReportActualQty = 4;		

						for(var p1=0;p1<vnColumnslist.length;p1++)
						{
							var summaryLabel = vnColumnslist[p1].getLabel();

							if(summaryLabel == 'Expected Qty')
							{
								pickReportExpectedQty = p1;
							}
							else if (summaryLabel == 'Actual Qty')	
							{
								pickReportActualQty = p1;
							}																
							else
							{

							}
						}
						for(var i=0;i<vSOLineDetails.length;i++)
						{	
							var vPickedQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportActualQty]);
							var vPickGenQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportExpectedQty]);
							var vLineNo=vSOLineDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

							if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
								vPickedQty=0;
							if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
								vPickGenQty=0;

							vPickGenQty =new Big(vPickGenQty);
							vPickedQty =new Big(vPickedQty);
							var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
							nlapiLogExecution('DEBUG','vRemainingQty2 in Big',vRemainingQty);

							if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
								vRemainingQty=0;
							if(parseFloat(vRemainingQty) > 0)
							{
								vRedirectionFlag = "T";
								deviceUploadFlag = 'F';
								break;
							}
						}
					}
					nlapiLogExecution('DEBUG','vRedirectionFlag at',vRedirectionFlag);
					if(vRedirectionFlag == "T")
					{
						if(request.getParameter('hdnSendflag')=='New Order')
						{
							var SOarray = new Array();
							SOarray["custparam_error"] ='';
							SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
							SOarray["custparam_enterbinid"] =enteredBin;
							SOarray["custparam_language"] = getLanguage;
							SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
							SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
							SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
							//SOarray["custparam_item"] = request.getParameter('hdnitem');
							SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
							response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
							return;
						}
						else if(request.getParameter('hdnStageflag')=='Pick & Stage')
						{
							SOarray["custparam_error"] ='';
							SOarray["custparam_soid"]=SOarray["custparam_enterorder"];
							response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
							return;
						}
						else
						{
							SOarray["custparam_error"] ='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
							return;
						}
					}
					else
					{
						if(vStageScanRequired=='T')
						{
							SOarray["custparam_error"] ='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
							return;
						}
						else
						{
							if(deviceUploadFlag=='T' && orderLevel =="T")
							{
								if(mianItemOPenTaskid != null && mianItemOPenTaskid != ''  &&  vStageScanRequired == 'F')
								{	
									var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
									loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
									nlapiSubmitRecord(loadRec);
									loadRec=null;
								}
							}
							SOarray["custparam_error"] ='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
							return;
						}
					}
				}
			}
		}
		else
		{
			var soLineItemDetails = getSOLineDetailsNew(enterOrder,trantype,enteredItem,whlocation);

			nlapiLogExecution('DEBUG', 'soLineItemDetails', soLineItemDetails);
			var vMultiShipping='F';
			var vShipVia='';
			var vSoreminqty =0;
			var isQtyforPicking='F';
			//To fetch Line level multi shipping flag and ship via validation
			if(soLineItemDetails !=null && soLineItemDetails!="" && soLineItemDetails !='null' && soLineItemDetails != 'undefined' && 
					soLineItemDetails.length != null)
			{	

				var vColumnslist=soLineItemDetails[0].getAllColumns();

				var custIndex = 12;
				var commitedQtyIndex = 25;
				var fulfilledQtyIndex = 26;
				var conversionRateIndex=27;
				var totalPickedQtyIndex =7;
				var totalNSPickedQtyIndex =37;
				var ERPConfirmedQty =38;
				for(var x1=0;x1<vColumnslist.length;x1++)
				{
					var summaryLabel = vColumnslist[x1].getLabel();
					var name =  vColumnslist[x1].getName();
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



				for(var z=0;z<soLineItemDetails.length;z++)
				{
					var vsoLine = soLineItemDetails[z].getValue('line',null,'group');
					//if(parseFloat(vsoLine) == parseFloat(soLineno))
					var vsoitemQty=soLineItemDetails[z].getValue(vColumnslist[commitedQtyIndex]);
					var vsoitemfulfillQty=soLineItemDetails[z].getValue(vColumnslist[fulfilledQtyIndex]);							
					var vsoitemopentaskQty=soLineItemDetails[z].getValue(vColumnslist[totalPickedQtyIndex]);
					var vsoitemErpConfirmedQty=soLineItemDetails[z].getValue(vColumnslist[ERPConfirmedQty]);
					var vsoitemNSReceivedQty=soLineItemDetails[z].getValue(vColumnslist[totalNSPickedQtyIndex]);

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
					nlapiLogExecution('DEBUG','vsoitemRcvQty in big',vsoitemRcvQty);


					if(vsoitemRcvQty==null || vsoitemRcvQty=='')
						vsoitemRcvQty=0;
					if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
						vsoitemfulfillQty=0;

					vsoitemQty=new Big(vsoitemQty);
					vsoitemfulfillQty=new Big(vsoitemfulfillQty);
					vsoitemRcvQty=new Big(vsoitemRcvQty);
					vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
					nlapiLogExecution('DEBUG','vSoreminqty in Big',vSoreminqty);




					if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1) && trantype == 'transferorder'))
					{
						vMultiShipping = soLineItemDetails[z].getValue('ismultishipto',null,'group');
						if(vMultiShipping ==  null || vMultiShipping =='')
							vMultiShipping='F';

						vShipVia=soLineItemDetails[z].getValue('shipmethod',null,'group');
						break;
					}			

				}	

			}

			if(vSoreminqty > 0)
			{
				isQtyforPicking ='T';
			}
			var isfromPageRefresh = context.getSessionObject('record');
			nlapiLogExecution('ERROR', 'isfromPageRefresh', isfromPageRefresh);
			if((isQtyforPicking == 'F' && vFOoverageChecked == 'F')  || isfromPageRefresh == 'created')
			{
				var vRedirectionFlag="F";
				var columnsOpen = new Array();
				var filtersOpen = new Array();

				if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
					filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
				var vSOLineDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist', filtersOpen, columnsOpen);
				if(vSOLineDetails != null && vSOLineDetails != '' && vSOLineDetails != 'null' && vSOLineDetails!='undefined' && vSOLineDetails.length>0)
				{	
					var vnColumnslist=vSOLineDetails[0].getAllColumns();

					var pickReportExpectedQty = 3;
					var pickReportActualQty = 4;		

					for(var p1=0;p1<vnColumnslist.length;p1++)
					{
						var summaryLabel = vnColumnslist[p1].getLabel();

						if(summaryLabel == 'Expected Qty')
						{
							pickReportExpectedQty = p1;
						}
						else if (summaryLabel == 'Actual Qty')	
						{
							pickReportActualQty = p1;
						}																
						else
						{

						}
					}
					for(var i=0;i<vSOLineDetails.length;i++)
					{	
						var vPickedQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportActualQty]);
						var vPickGenQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportExpectedQty]);
						var vLineNo=vSOLineDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

						if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
							vPickedQty=0;
						if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
							vPickGenQty=0;

						vPickGenQty =new Big(vPickGenQty);
						vPickedQty =new Big(vPickedQty);
						var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
						nlapiLogExecution('DEBUG','vRemainingQty23 in Big',vRemainingQty);

						if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
							vRemainingQty=0;
						if(parseFloat(vRemainingQty) > 0)
						{
							vRedirectionFlag = "T";
							break;
						}
					}
				}
				nlapiLogExecution('DEBUG','vRedirectionFlag',vRedirectionFlag);
				if(vRedirectionFlag == "T")
				{
					if(request.getParameter('hdnSendflag')=='New Order')
					{
						var SOarray = new Array();
						SOarray["custparam_error"] ='';
						SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
						SOarray["custparam_enterbinid"] =enteredBin;
						SOarray["custparam_language"] = getLanguage;
						SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
						SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
						SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
						//SOarray["custparam_item"] = request.getParameter('hdnitem');
						SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
						response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
						return;
					}
					else if(request.getParameter('hdnStageflag')=='Pick & Stage')
					{
						SOarray["custparam_error"] ='';
						SOarray["custparam_soid"]=SOarray["custparam_enterorder"];
						response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
						return;
					}
					else
					{

						SOarray["custparam_error"] ='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
						return;
					}
				}
				else
				{
					if(vStageScanRequired=='T')
					{
						SOarray["custparam_error"] ='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
						return;
					}
					else
					{
						SOarray["custparam_error"] ='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
						return;
					}

				}
			}
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
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");




		var uomresults= new Array();
		var results='';
		var addbtnimgUrl='';
		var delbtnimgUrl='';
		var JSSurl ='';
		if(vunitstype != null && vunitstype != '' && vunitstype != 'null' && vunitstype != 'undefined')
		{

			results= getUnitsType(vunitstype);

			if(results != null && results != '' && results != 'null' && results != 'undefined')
			{
				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
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

		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		html = html + "<script type='text/javascript'>function validateForm_multiordQty(){var reWhiteSpace ='';" +
		"var fooveragecheck = document.getElementById('hdnvFOoverageChecked').value;" +
		"var itemtype=document.getElementById('hdnitemtype').value;var qtytopick=document.getElementById('hdnQtyToPick').value;" +
		" var binavailqty=document.getElementById('hdnbinRemainingQty').value; var selecteduomqtyArr = new Array();" +
		" var ConvertQty=document.getElementById('hdnvConversionRate').value;var uomTbl = document.getElementById('tblUOM');" +
		"var enteredQty =0;var enteredSerialQty =0;" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount = uomTbl.rows.length;for(var r=0;r<rowcount;r++){" +
		"var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;" +
		"if(qty=='' || isNaN(qty) || parseFloat(qty) <= 0){if(qty == ''){document.getElementById('div_error').innerHTML ='Please enter qty';}" +
		"else{document.getElementById('div_error').innerHTML ='Please enter valid qty';}" +
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();" +
		"return false;}" +
		"var qtyValidate = document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value.split('.');"+
		"if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}" +
		"var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;" +
		"if(uom==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter uom';" +
		"document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].focus();return false;" +
		"}var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr);" +
		" enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom));" +
		" }document.getElementById('hdnselecteduomswithqty').value=selecteduomqtyArr;" +
		"enteredSerialQty = parseFloat(enteredQty);enteredQty =parseFloat(enteredQty)/parseFloat(ConvertQty);" +
		"qty =enteredQty;document.getElementById('hdntotaluomqtyentered').value = enteredQty; }" +
		"else{ var qty=document.getElementById('enterqty').value;enteredSerialQty = document.getElementById('enterqty').value;" +
		"reWhiteSpace = qty.indexOf(' ') >= 0;if(qty == ''){document.getElementById('div_error').innerHTML ='Please enter qty';" +
		"document.getElementById('enterqty').focus();return false;}var qtyValidate = document.getElementById('enterqty').value.split('.');"+
		"if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('enterqty').focus();return false;}}}" +
		"if(isNaN(qty) || (parseFloat(qty) <= 0) || (reWhiteSpace == true) ||" +
		"(((parseFloat(qty) > parseFloat(qtytopick)) && fooveragecheck=='F') || " +
		"(parseFloat(qty) > parseFloat(binavailqty)))){if((parseFloat(qty) > parseFloat(qtytopick)) && fooveragecheck=='F'){" +
		"document.getElementById('div_error').innerHTML ='Overage picking is not allowed';" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		"document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}" +		
		"else{" +
		"document.getElementById('enterqty').value = '';" +
		"document.getElementById('enterqty').focus();}return false;}" +
		"else if((parseFloat(qty) > parseFloat(binavailqty))){" +
		"document.getElementById('div_error').innerHTML ='Entered/scanned qty is greater than bin avail qty';" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		"document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}" +		
		"else{" +
		"document.getElementById('enterqty').value = '';" +
		"document.getElementById('enterqty').focus();}return false;}" +
		"else{" +
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		"document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}" +		
		"else{" +
		"document.getElementById('enterqty').value = '';" +
		"document.getElementById('enterqty').focus();}return false;}" +
		"}" +
		"else if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){ if(enteredSerialQty % 1 != 0){ " +
		"document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';  " +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		"document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}" +		
		"else{" +
		"document.getElementById('enterqty').value = '';" +
		"document.getElementById('enterqty').focus();}return false;}" +
		" }" +
		"var sessionObj = document.getElementById('hdnsession').value;" +
		"if(sessionObj != '' && sessionObj != null){" +
		"document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}" +
		"else{" +
		"document.getElementById('hdnsession').value = 'session';document.forms['_rf_Fulfillment'].submit();" +
		"document.getElementById('loading').style.display = '';document.forms['_rf_Fulfillment'].cmdSend.disabled=true;" +
		"document.forms['_rf_Fulfillment'].cmdStage.disabled=true;document.forms['_rf_Fulfillment'].cmdPrevious.disabled=true;" +
		" return true;}}</script>";

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

		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};" +
		"</script></head><body  onkeydown='return OnKeyDown_CL();'>";		
		html = html +"	<form name='_rf_Fulfillment' method='POST'>";
		html=html+"<input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick=' return validateForm_multiordQty();'/>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+
		"		<table>"+		
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin Location: <label> " + enteredBin+"</label>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item:  <label>" + item+"</label>"+
		"				</td>"+
		"			</tr>";
		if(enterLot !=null && enterLot!='' && enterLot!='null' && enterLot !='undefined')
		{
			html = html +"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Lot#:  <label>" + enterLot+"</label>"+
			"				</td>"+
			"			</tr>";
		}
		html = html +"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + enterOrder+"</label>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Qty To Pick: <label>" + parseFloat(parseFloat(qtyToPick).toFixed(5)) +"  " + vUnitsText + "</label>"+
		"				</td>"+
		"			</tr>";
		if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem' && itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
		{
			html=html+	"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Bin Avail Qty: <label>" + parseFloat(parseFloat(binQty).toFixed(5)) +"  " + vUnitsText + "</label>"+
			"				</td>"+
			"			</tr>";
		}
		if(inventoryStatusFeature == true && invt_status != '')
		{
			html=html+	"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Inv Status: <label> "+invt_status+"</label>"+
			"				</td>"+
			"			</tr>";
		}
		html=html+"			<tr>";

		html = html +"				<td align = 'left' class='labelmsg'>";

		html = html +"	<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnEnteredBin' id='hdnEnteredBin' value=" + enteredBin + ">"+
		"				<input type='hidden' name='hdnEnteredItem' value='" + enteredItem + "'>"+
		"				<input type='hidden' name='hdnEnteredBinId' id='hdnEnteredBinId' value=" + enteredBinId + ">"+
		"				<input type='hidden' name='hdnitem' value='" + item + "'>"+
		"				<input type='hidden' name='hdnOrder' value='" + enterOrder + "'>"+
		"				<input type='hidden' name='hdnTrantype' value='" + trantype + "'>"+
		"				<input type='hidden' name='hdnQtyToPick' id='hdnQtyToPick' value=" + qtyToPick + ">"+
		"				<input type='hidden' name='hdnbinRemainingQty' id='hdnbinRemainingQty' value='" + binQty + "'>"+
		"				<input type='hidden' name='hdnEnteredLot' value='" + enteredLot + "'>"+
		"				<input type='hidden' name='hdnsoId' value='" + soId + "'>"+
		"				<input type='hidden' name='hdnsolineno' value='" + solineno + "'>"+
		"				<input type='hidden' name='hdncustomer' value='" + customer + "'>"+
		"				<input type='hidden' name='hdnvFOoverageChecked' id='hdnvFOoverageChecked' value=" + vFOoverageChecked + ">"+	
		"				<input type='hidden' name='hdntrantype' value='" + trantype + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnitsText + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+		
		"				<input type='hidden' name='hdnvstockunit' id='hdnvstockunit' value=" + vstockunit + ">"+
		"				<input type='hidden' name='hdnvunitstype' id='hdnvunitstype' value=" + vunitstype + ">"+
		"				<input type='hidden' name='hdnvMemitemqty' id='hdnvMemitemqty' value=" + getmemitemqty + ">"+
		"				<input type='hidden' name='hdnitemtype' id='hdnitemtype' value=" + itemType + ">"+
		"               <input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnvStageScanRequired' value='" +vStageScanRequired+"'>"+
		"				<input type='hidden' name='hdnparentitemtype' value='" +parentItemType+"'>"+		
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnStageflag'>"+
		"				<input type='hidden' name='hdnSendflag'>"+
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+
		"				<input type='hidden' name='hdnenteredlotid' id='hdnenteredlotid' value = "+enteredLotID+" >"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value='" + whlocation + "'>"+
		"				</td>"+
		"			</tr>";
		//This is to bind the uoms.
		if(results !=null &&  results !='' && results.length>0 && (vUnitsText !=null && vUnitsText !='' && vUnitsText!='null' && vUnitsText !='undefined' && vUnitsText !='- None -'))
		{
			var selectedUomStr = request.getParameter('custparam_uomqtyselected');//This parameter contains uom qty pair values after save.
			nlapiLogExecution('DEBUG', 'selectedUomStr', selectedUomStr);
			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				nlapiLogExecution('DEBUG', 'inside', selectedUomStr);

				html = html +"			<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox'  id='txtqty0' type='text'/>" ;
				html = html +"</td><td></td>";
				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					if(Cnt==0)
					{
						html = html +"<td><select id='uomlist"+Cnt+"' class='labelmsg'  name = 'uomlist"+Cnt+"'  onchange='return onUomChange(this,\""+uomresults+"\");'>  ";

					}

					if(vUnitsText !=null && vUnitsText !='' && vUnitsText!='null' && vUnitsText !='undefined' && vUnitsText !='- None -' && vUnitsText == UOMText)
					{
						html = html +" <option value="+vQty+" selected >"+UOMText +" </option>";
					}
					else
					{
						html = html +" <option value="+vQty+"  >"+UOMText +" </option>";
					}					
				}

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' " +
				"src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+qtyToPick+"\",\""+vConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\",\""+vFOoverageChecked+"\");' " +
				"alt='Add Uom'></td></tr></table>";	
			}
			else
			{
				nlapiLogExecution('DEBUG', 'else', selectedUomStr);
				var uomQtyArr = selectedUomStr.split(',');
				var uomsArr = new Array();
				for(var u=0;u<uomQtyArr.length;u++)
				{
					var arr = uomQtyArr[u].split('_');

					var uom  = arr[1];
					uomsArr.push(uom);
				}
				html = html +"			<tr><td><table id='tblUOM'  >";
				for(var u=0;u<uomQtyArr.length;u++)
				{
					var arr = uomQtyArr[u].split('_');

					var qty = arr[0];
					var uom  = arr[1];

					html = html +"<tr><td align = 'left'><input name='txtqty"+u+"'  class='smalltextbox'  id='txtqty"+u+"' type='text' value="+qty+"></input></td><td></td>";
					html = html +"<td><select id='uomlist"+u+"' class='labelmsg'  name = 'uomlist"+u+"'>  ";
					for(var Cnt=0; Cnt < results.length; Cnt++)
					{                    	 
						var vUOM = results[Cnt].getValue('conversionrate');
						var UOMText =results[Cnt].getValue('unitname');
						if(uom == vUOM)
						{
							html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";

						}
						else
						{
							if(uomsArr.indexOf(vUOM)==-1)
							{
								html = html +" <option     value="+vUOM+"> "+UOMText+"</option>";
							}
						}
					}
					html = html+"</select></td><td></td>";
					if(u==parseInt(uomQtyArr.length)-1)
					{
						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color: " +
						" #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+qtyToPick+"\",\""+vConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\",\""+vFOoverageChecked+"\");' alt='Add Uom'></td></tr>";
					}
					else
					{
						html= html+"<td><input type='image' id='imgplus0' src='"+delbtnimgUrl+"' style='background-color: " +
						" #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return deleteUom(this,\""+uomresults+"\");' alt='Add Uom'></td></tr>";
					}

				}
				html = html +"			</td></tr></table>";
			}

		}
		else
		{

			if(vUnitsText !=null && vUnitsText !='' && vUnitsText !='null' && vUnitsText !='undefined' && vUnitsText !='- None -')
			{
				html = html +"				<td align = 'left' class='labelmsg'>" + st4+" In"+ vUnitsText;
			}
			else
			{
				html = html +"				<td align = 'left' class='labelmsg'>" + st4+" ";
			}

			html = html +"				</td>"+
			"			</tr>"+
			"			<tr>";
			html= html+"<td align = 'left'><input name='enterqty'  class='smalltextbox'  id='enterqty' type='text'/>";			
			html= html+"				</td>"+
			"			</tr>";
		}
		html=html+"</table>"+
		"			<table><tr>	";
		var btnText='Next (Ent)';
		if(itemType != "serializedinventoryitem" && itemType !="serializedassemblyitem" )
		{
			btnText='Pick (Ent)';
		}
		html = html + "<td align = 'left'></td>"+
		"	<td width='5px'></td><td ></td>"+
		"			</tr></table>"+
		"		<table>	<tr>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/></td>"+
		"	<td width='40px'></td><td ><input name='cmdSend' type='submit' value='"+btnText+"' onclick='this.form.hdnSendflag.value=this.value; return validateForm_multiordQty();'/></td>"+
		"			</tr>";
		if (itemType != "serializedinventoryitem" && itemType !="serializedassemblyitem") {
			html = html +"<tr><td><input name='cmdSend' type='submit' value='New Order' onclick='this.form.hdnSendflag.value=this.value; return validateForm_multiordQty();'/></td>";

			if(vStageScanRequired == "T"  && parentItemType != 'kititem')
			{
				html = html +"<td width='40px'></td><td><input name='cmdStage' style='width:100px;' type='submit' value='Pick & Stage' onclick='this.form.hdnStageflag.value=this.value; return validateForm_multiordQty();'/></td></tr>";
			}
			else
			{
				html = html +"</tr>";	
			}
		}


		html = html +"				</table>"+		
		"	</form>";
		if(results ==null ||  results =='' || results == 'null')
		{
			html=html+"<script type='text/javascript'>document.getElementById('enterqty').focus();</script>";
		}
		else
		{
			html = html +"<script type='text/javascript'>setFocus();</script>";
		}
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html=html+"</body>"+
		"</html>";			

		response.write(html);
	}
	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('enterbin');
		var optedEvent = request.getParameter('cmdPrevious');
		var SOarray=new Array();
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_ordtype"] =ordType;
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_enterbin"] = request.getParameter('hdnEnteredBin');
		SOarray["custparam_enterbinid"] = request.getParameter('hdnEnteredBinId');
		SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
		SOarray["custparam_item"] = request.getParameter('custparam_item');
		SOarray["custparam_trantype"] =request.getParameter('hdnTrantype');
		SOarray["custparam_enterorder"] = request.getParameter('hdnOrder');
		SOarray["custparam_itembinqty"] = request.getParameter('hdnbinRemainingQty');
		SOarray["custparam_itemremainingqty"] = request.getParameter('hdnQtyToPick');
		SOarray["custparam_enterlot"] = request.getParameter('hdnEnteredLot');
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		SOarray["custparam_unitstext"] = request.getParameter('hdnuom');
		SOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		SOarray["custparam_memitemqty"]=request.getParameter('hdnvMemitemqty');
		SOarray["custparam_sointernalid"] = request.getParameter('hdnsoId');
		SOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		SOarray["custparam_parentItemType"] = request.getParameter('hdnparentitemtype');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var eneteredLotId = request.getParameter('hdnenteredlotid');
		SOarray["custparam_enterlotid"] = eneteredLotId;
		var vConversionRate = request.getParameter('hdnvConversionRate');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var whlocation = request.getParameter('custparam_whlocation');
		var soInternalId = request.getParameter('hdnsoId');
		SOarray["custparam_soId"] =soInternalId;
		var soLineno = request.getParameter('hdnsolineno');
		SOarray["custparam_solineno"] =soLineno;
		var customer =request.getParameter('hdncustomer');
		SOarray["custparam_customer"] =customer;
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;
		var foOverageCheck=request.getParameter('hdnvFOoverageChecked');
		var context = nlapiGetContext();
		var userAccountId = context.getCompany();
		var itemType = request.getParameter('hdnitemtype');
		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');
		var enteredBin = request.getParameter('hdnEnteredBinId');
		var enteredItem=request.getParameter('hdnEnteredItem');
		
		var logMsg1 = 'getPickreportid =' + getPickreportid + '<br>';
		logMsg1 = logMsg1 + 'itemType = ' + itemType + '<br>';
		logMsg1 = logMsg1 + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		nlapiLogExecution('DEBUG', 'parameters in post', logMsg1);
		
		if (sessionobj!=context.getUser()) 
		{
			try
			{

				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}

				if (optedEvent == 'Back (F7)') {
					nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
					SOarray["custparam_error"]='';
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{						
						response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_lotscan', 'customdeploy_wmsse_multiord_lotscan', false, SOarray);
					}
					else
					{
						response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
					}
				}
				else
				{

					var enterOrder=request.getParameter('hdnOrder');
					var enterQty = request.getParameter('enterqty');
					nlapiLogExecution('DEBUG', 'enterQty',enterQty);
					if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
					{
						enterQty = request.getParameter('hdntotaluomqtyentered');
					}


					var enteredLot=request.getParameter('hdnEnteredLot');
					var trantype = request.getParameter('hdnTrantype');

					var itemType = request.getParameter('hdnitemtype');
					nlapiLogExecution('DEBUG','itemType',itemType);			



					if(itemType == null || itemType == '' || itemType == 'null' || itemType == undefined)
					{
						itemType = nswms_GetItemType(enteredItem, whlocation);
						nlapiLogExecution('DEBUG','itemType',itemType);
					}


					SOarray["custparam_enterqty"] =enterQty;
					SOarray["custparam_trantype"] =trantype;
										
					var logMsg1 = 'whlocation =' + whlocation + '<br>';
					logMsg1 = logMsg1 + 'trantype = ' + trantype + '<br>';
					logMsg1 = logMsg1 + 'enteredItem = ' + enteredItem + '<br>';
					logMsg1 = logMsg1 + 'enteredLot = ' +enteredLot+ '<br>';
					logMsg1 = logMsg1 + 'enterQty = ' +enterQty+ '<br>';
					nlapiLogExecution('DEBUG', 'parameters in posts', logMsg1);

					if(enterQty==null || enterQty=='' || enterQty == "null" || enterQty == 'undefined')
					{
						SOarray["custparam_error"]='Please enter/scan qty';
						response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
						return;
					}
					else if(isNaN(enterQty) || (enterQty.indexOf(' ')==true))
					{
						SOarray["custparam_error"]='Please enter/scan valid qty';
						response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
						return;
					}
					else
					{
						var itemRemainingQty = request.getParameter('hdnQtyToPick');
						var binAvailQty = request.getParameter('hdnbinRemainingQty');
						var overageAllowed = request.getParameter('hdnvFOoverageChecked');
						if((parseFloat(enterQty) > parseFloat(itemRemainingQty)) && (overageAllowed == 'F'))
						{
							SOarray["custparam_error"]='Entered/Scanned qty is greater than remaining qty';
							response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
							return;
						}
						if(parseFloat(enterQty) > parseFloat(binAvailQty))
						{
							nlapiLogExecution('DEBUG', 'binAvailQty1234',binAvailQty); 
							SOarray["custparam_error"]='Entered/Scanned qty is greater than available bin qty';
							response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
							return;
						}
						var vstockunit = request.getParameter('hdnvstockunit');
						var vunitstype = request.getParameter('hdnvunitstype');

						var vconversionrate = getCoversionRate(vunitstype,vstockunit);

						if(vconversionrate == null || vconversionrate =='' || vconversionrate == 'null' || vconversionrate == 'undefined')
						{
							vconversionrate = 1;
						}
			
						
						var logMsg1 = 'vstockunit =' + vstockunit + '<br>';
						logMsg1 = logMsg1 + 'vunitstype = ' + vunitstype + '<br>';
						logMsg1 = logMsg1 + 'vconversionrate = ' + vconversionrate + '<br>';
						nlapiLogExecution('DEBUG', 'parameters of item', logMsg1);
						
						
						try{

							//if inventory status feature is enabled
							var inventoryStatusFeature = isInvStatusFeatureEnabled();
							var  enteredLotID= request.getParameter('hdnenteredlotid');
							var itemType = nswms_GetItemType(enteredItem, whlocation);
							var inventoryStatus ='';
							if(inventoryStatusFeature == true)
							{
								if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&
										itemType !='serviceitem' && itemType !='downloaditem' && itemType != 'Download Item' 
											&& itemType != 'giftcertificateitem')
								{
									var objBinStatusDetails =  new Array();
									var vStatusDetails = new Array();
									nlapiLogExecution('DEBUG', 'itemType', itemType);
									var invfilterStrat =  new Array();
									var vStatusResults = null;

									//loadsearch is not required here as we were checking status length to display inventory status
									if(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem")
									{
										vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat,null);
									}
									else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
									{
										vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh',invfilterStrat,null);	
									}
									else
									{
										vStatusResults = new nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_invt_item',invfilterStrat,null);	  
									}


									if(whlocation != null && whlocation != '')
										vStatusResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', whlocation));
									if(enteredItem != null && enteredItem != '')
										vStatusResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', enteredItem));
									if(enteredBin != null && enteredBin!= '')
										vStatusResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', enteredBin));
									if(enteredLotID != null && enteredLotID!= '' && enteredLotID != 'null'
										&& enteredLotID != 'undefined' && enteredLotID != undefined && 
										(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem"))
									{
										var systemRule_AllowExpiredItems=' ';
										systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',whlocation);
										nlapiLogExecution("DEBUG","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);


										vStatusResults.addFilter(new nlobjSearchFilter('inventorynumber',null, 'anyof', eneteredLotId));	


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
										objBinStatusDetails.push(searchResult);
										if(invItr==4000)
										{
											return false;
										}
										return true;                // return true to keep iterating
											});


									if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && objBinStatusDetails != 'undefined' && 
											objBinStatusDetails != undefined && objBinStatusDetails.length != null && objBinStatusDetails.length >0)
									{
										if(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem")
											vOpenPickDetails = getOPenTaskPickBinDetailsLot(enteredItem,enteredBin,whlocation,vunitstype,vstockunit);
										else
											vOpenPickDetails = getOPenTaskPickBinDetails(enteredItem,enteredBin,whlocation,vunitstype,vstockunit,'','');

										for(var stsItr=0;stsItr<objBinStatusDetails.length;stsItr++)
										{

											var status = '';
											var vBinQtyAvail ='';
											var statusId ='';
											var eneteredLotTxt ='';
											if((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem" || 
													itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
											{
												status = objBinStatusDetails[stsItr].getText('status',null,'group');					
												vBinQtyAvail=objBinStatusDetails[stsItr].getValue('available',null,'sum');				
												statusId = objBinStatusDetails[stsItr].getValue('status',null,'group');
												eneteredLotTxt = objBinStatusDetails[stsItr].getText('inventorynumber',null,'group');
											}
											else
											{
												status = objBinStatusDetails[stsItr].getText('status');					
												vBinQtyAvail=objBinStatusDetails[stsItr].getValue('available');				
												statusId = objBinStatusDetails[stsItr].getValue('status');
											}
											nlapiLogExecution('DEBUG', 'vBinQtyAvail  bef', vBinQtyAvail);
											var openPickQty = 0;
											if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
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
														for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
														{
															var opentaskStatus = vBinStatusArr[binIterator];
															var opentaskLotText =vBinLotArr[binIterator];
															
															var logMsg1 = 'opentaskStatus =' + opentaskStatus + '<br>';
															logMsg1 = logMsg1 + 'statusId = ' + statusId + '<br>';
															logMsg1 = logMsg1 + 'eneteredLotTxt = ' + eneteredLotTxt + '<br>';
															logMsg1 = logMsg1 + 'opentaskLotText = ' +opentaskLotText+ '<br>';
															nlapiLogExecution('DEBUG', 'parameters of status', logMsg1);
															
															
															
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
													nlapiLogExecution('Debug','statusId',vBinStatusArr);
													if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined'
														&& vBinStatusArr != undefined)
													{
														for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
														{
															var opentaskStatus = vBinStatusArr[binIterator];
															nlapiLogExecution('Debug','opentaskStatus',opentaskStatus);
															nlapiLogExecution('Debug','statusId',statusId);
															
															var logMsg1 = 'opentaskStatus =' + opentaskStatus + '<br>';
															logMsg1 = logMsg1 + 'statusId = ' + statusId + '<br>';
															nlapiLogExecution('DEBUG', 'parameters of statusid and text', logMsg1);
															
															
															if(opentaskStatus == statusId)
															{
																openPickQty = vOpenPickQtyArr[binIterator];
																break;
															}
														}
													}

												}
											}


											vBinQtyAvail =new Big(vBinQtyAvail);
											openPickQty =new Big(openPickQty);
											vBinQtyAvail = Number(vBinQtyAvail.minus(openPickQty));
											
											var logMsg1 = 'openPickQty =' + openPickQty + '<br>';
											logMsg1 = logMsg1 + 'vBinQtyAvail = ' + vBinQtyAvail + '<br>';
											nlapiLogExecution('DEBUG', 'parameters of qty', logMsg1);
											
											if(parseFloat(vBinQtyAvail) > 0)
											{
												vStatusDetails.push(statusId);
											}
										}

									}
									nlapiLogExecution('DEBUG', 'vStatusDetails', vStatusDetails.length);
									if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' &&
											vStatusDetails != 'undefined' && vStatusDetails != undefined &&
											vStatusDetails.length != null && vStatusDetails.length == 1)
									{

										inventoryStatus = vStatusDetails[0];
										SOarray["custparam_inventorystatus"]=inventoryStatus;

									}
									else
									{

										SOarray["custparam_enteredBinID"]=enteredBin;
										SOarray["custparam_enteredbin"]=request.getParameter('hdnEnteredBin');;
										SOarray["custparam_enteredqty"]=enterQty;
										if(request.getParameter('hdnStageflag')=='Pick & Stage')
										{
											SOarray["custparam_hdnStageflag"]='PickAndStage';
										}
										if(request.getParameter('hdnSendflag')=='New Order')
										{
											SOarray["custparam_hdnSendflag"]='New Order';
										}

										response.sendRedirect('SUITELET', 'customscript_wmsse_picking_statusscan', 'customdeploy_wmsse_picking_statusscan', false, SOarray);
										return;   



									}

								}

							}



							var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockbin');
							if (itemType == "noninventoryitem" ||itemType == "otherchargeitem" ||itemType == "serviceitem" ||itemType == "downloaditem"  || itemType == "giftcertificateitem")
							{
								enteredBin = request.getParameter('hdnEnteredBin');
								LockRecord.setFieldValue('name',enteredBin);
								enteredBin = '';
							}																					
							else
							{
								LockRecord.setFieldValue('name',enteredBin);
							}
							LockRecord.setFieldValue('custrecord_wmse_lock_sku',enteredItem);
							LockRecord.setFieldValue('custrecord_wmsse_lock_binlocation',enteredBin);										
							LockRecord.setFieldValue('custrecord_wmsse_lock_flag','T');
							LockRecord.setFieldValue('custrecord_wmsse_lock_unittype',vunitstype);
							LockRecord.setFieldValue('custrecord_wmsse_lockqty',enterQty);
							LockRecord.setFieldValue('custrecord_wmsse_lockuser',context.getUser());
							LockRecord.setFieldValue('custrecord_wmsse_lock_stockunit',vstockunit);
							LockRecord.setFieldValue('custrecord_wmsse_lock_conversionrate',vconversionrate);
							LockRecord.setFieldValue('custrecord_wmsse_lock_itemtype',itemType);
							LockRecord.setFieldValue('custrecord_wmsse_lock_trantype',trantype);
							if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
							{
								LockRecord.setFieldValue('custrecord_wmsse_lock_seriallot',enteredLot);
							}
							if(inventoryStatus != '')
							{
								LockRecord.setFieldValue('custrecord_wmsse_lock_invtstatus',inventoryStatus);
							}
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


							response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);									
							return;
						}

						lockresults=null;									
						lockfilters=null;



						var validPickReport = funtoCheckPickReportNo(getPickreportid,whlocation,enterOrder,enteredItem,soLineno,trantype);
						nlapiLogExecution('DEBUG', 'validPickReport', validPickReport);
						if(validPickReport != null  && validPickReport !='')
						{


							var parentSku = validPickReport[0].getValue('custrecord_wmsse_parent_sku_no');
							var parentItemType = nswms_GetItemType(parentSku, whlocation);

							var logMsg1 = 'parentSku =' + parentSku + '<br>';
							logMsg1 = logMsg1 + 'parentItemType = ' + parentItemType + '<br>';
							nlapiLogExecution('DEBUG', 'parameters of item type', logMsg1);
							if(parentItemType == 'kititem')
							{
								var orderLevel="F";
								orderLevel=getSystemRuleValue('Consolidate item fulfillments by sales order?',whlocation);
								if(orderLevel ==null || orderLevel =='' || orderLevel =='null' || orderLevel =='undefined')
								{
									orderLevel="F";
								}
								if(orderLevel=="Y")
								{
									orderLevel='T';
								}
								else
								{
									orderLevel='F';
								}
								SOarray["custparam_orderlevel"] = orderLevel;
								var memItemExpectedQty = request.getParameter('custparam_memitemqty');
								var isItLastPick='F';

								if(vunitstype != null && vunitstype != '')
								{	
									var vBaseUOMSearch=getBaseUnitRate(vunitstype);

									vBaseUnit='Base unit';
									if(vBaseUOMSearch != null && vBaseUOMSearch != '')
									{
										vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
										vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
									}	

									if(vstockunit !=null && vstockunit!='' && vstockunit !='null' && vstockunit !='undefined' && vstockunit !='- None -')
									{
										vconversionrate =getStockCoversionRate(vunitstype,vstockunit,vConversionRate);
									}
									if(vconversionrate == null || vconversionrate =='' || vconversionrate == 'null' || vconversionrate == 'undefined')
									{
										vconversionrate = 1;
									}
								}



								if (itemType == "inventoryitem"  ||itemType == "noninventoryitem" ||itemType == "otherchargeitem" 
									||itemType == "serviceitem" ||itemType == "downloaditem"  || itemType == "giftcertificateitem" || 
									itemType == "assemblyitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
								{

									var soLineItemDetails = getSOLineDetailskit(SOarray["custparam_soId"],trantype,parentSku,SOarray["custparam_whlocation"]);																
									var vmainItemQty='';
									nlapiLogExecution('DEBUG', 'soLineItemDetails', soLineItemDetails);
									var actualBeginTime=TimeStamp();
									var vMultiShipping='F';
									var vShipVia='';
									//To fetch Line level multi shipping flag and ship via validation
									if(soLineItemDetails !=null && soLineItemDetails!="")
									{					
										for(var z=0;z<soLineItemDetails.length;z++)
										{
											var vsoLine = soLineItemDetails[z].getValue('line',null,'group');

											if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1) && trantype == 'transferorder'))
											{
												vMultiShipping = soLineItemDetails[z].getValue('ismultishipto',null,'group');
												vmainItemQty = soLineItemDetails[z].getValue('quantitycommitted',null,'max');
												if(vMultiShipping ==  null || vMultiShipping =='')
													vMultiShipping='F';
												//if(vMultiShipping=='T')
												//{
												vShipVia=soLineItemDetails[z].getValue('shipmethod',null,'group');
												//}
												break;
											}			

										}	

									}
									nlapiLogExecution('DEBUG', 'vMultiShipping : vShipVia : vmainItemQty', vMultiShipping + ":" + vShipVia + ":"+ vmainItemQty);
									updateOpenTask(soInternalId,enteredItem,soLineno,Number(Big(enterQty).toFixed(5)),enteredBin,itemType,whlocation,enteredLot,'','','',
											soInternalId,null,null,null,taskType,null,null,null,"F",trantype,actualBeginTime,customer,'',
											Number(Big(memItemExpectedQty).toFixed(5)),Number(Big(enterQty).toFixed(5)),parentSku,'T',null,null,null,vShipVia,null,ordType,
											department,vclass,getPickreportid,null,inventoryStatus);
									context.setSessionObject('record', 'created'); 
									var soLineDetails = getSOLineDetailskit(SOarray["custparam_soId"],trantype,parentSku,SOarray["custparam_whlocation"]);
									nlapiLogExecution('DEBUG', 'soLineDetails', soLineDetails);
									if(soLineDetails !=null && soLineDetails!="")
									{
										var vLinecount=0;
										nlapiLogExecution('DEBUG', 'soLineDetails.length', soLineDetails.length);
										if(soLineDetails.length>0)
										{
											var count= 0;
											var item=request.getParameter('hdnSoItem');
											var vColumnslist = soLineDetails[0].getAllColumns();


											var memitemcommitedQtyIndex = 8;
											var memitemfulfilledQtyIndex = 9;		
											var memitemtotalPickedQtyIndex =10;
											for(var x1=0;x1<vColumnslist.length;x1++)
											{
												var summaryLabel = vColumnslist[x1].getLabel();

												if(summaryLabel == 'Member Item Total Picked Quantity')
												{
													memitemtotalPickedQtyIndex = x1;
												}
												else if (summaryLabel == 'Member Item Committed Quantity')	
												{
													memitemcommitedQtyIndex = x1;
												}
												else if (summaryLabel == 'Member Item Fulfilled Quantity')
												{
													memitemfulfilledQtyIndex = x1;
												}				
												else
												{

												}
											}
											for(var f=0;f<soLineDetails.length;f++)
											{		
												var searchResult=soLineDetails[f];
												var vSoLine = searchResult.getValue('line',null,'group');
												var vsoitemRcvQty = searchResult.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
												var vsoitemCommitedQty=searchResult.getValue(vColumnslist[memitemcommitedQtyIndex]);
												var vsoitem = searchResult.getValue('item',null,'group');
																							
												var logMsg1 = 'vSoLine =' + vSoLine + '<br>';
												logMsg1 = logMsg1 + 'soLineno = ' + soLineno + '<br>';
												nlapiLogExecution('DEBUG', 'parameters of Lineno', logMsg1);

												var vcoitem = searchResult.getValue('memberitem','item','group');
												//var vMemItemType = getComponentItemType(vcoitem);
												/*if(vMemItemType =='inventoryitem' || vMemItemType =='assemblyitem' || vMemItemType =='lotnumberedinventoryitem' || vMemItemType =='lotnumberedassemblyitem' || vMemItemType =='serializedinventoryitem' || vMemItemType =='serializedassemblyitem')
									{*/
												if(vsoitemCommitedQty == null || vsoitemCommitedQty =='' || vsoitemCommitedQty =='null' || vsoitemCommitedQty =='undefined')
													vsoitemCommitedQty = 0;
												if(vsoitemRcvQty == null || vsoitemRcvQty =='' || vsoitemRcvQty =='null' || vsoitemRcvQty =='undefined')
													vsoitemRcvQty = 0;
												if(parseFloat(vSoLine) == parseFloat(soLineno))
												{
																								
													var logMsg1 = 'vsoitemRcvQty =' + vsoitemRcvQty + '<br>';
													logMsg1 = logMsg1 + 'vsoitemCommitedQty = ' + vsoitemCommitedQty + '<br>';
													nlapiLogExecution('DEBUG', 'parameters of qtys', logMsg1);
													
													if(parseFloat(vsoitemRcvQty) >= parseFloat(vsoitemCommitedQty))
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
												//}
											}
											nlapiLogExecution('DEBUG', 'count', count);
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

									if(isItLastPick!=null && isItLastPick!='' && isItLastPick=="T")
									{
										nlapiLogExecution('DEBUG', 'isItLastPick', isItLastPick);
										// for main item
										var mianItemOPenTaskid = updateOpenTask(soInternalId,parentSku,soLineno,Number(Big(vmainItemQty).toFixed(5)),enteredBin,itemType,
												SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,'PICK',SOarray["custparam_carton"],
												SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],"F",trantype,actualBeginTime,
												SOarray["custparam_customer"],'','','','','F',null,null,null,vShipVia,null,ordType,
												department,vclass,getPickreportid,null,inventoryStatus);
										context.setSessionObject('record', 'created'); 
										nlapiLogExecution('DEBUG', 'mianItemOPenTaskid', mianItemOPenTaskid);

										if(mianItemOPenTaskid != null && mianItemOPenTaskid !='')
										{

											var opentaskordersearchresultkit = new Array()
											var opentaskkitsearchresults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh');
																						
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId)); 
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', soLineno)); 
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8']));//8 picking completed
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_kitflag', null,'is', 'T'));//8 picking completed
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('isinactive',null,'is','F'));
											opentaskkitsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); // NS REF no is empty

											
											var resLenDetails = opentaskkitsearchresults.runSearch();
											
											
											var resultsPage = resLenDetails.getResults(0, 1000);
											var offset = 0;
											while (!!resultsPage && resultsPage.length > 0) 
											{
												opentaskordersearchresultkit = opentaskordersearchresultkit.concat(resultsPage);
												offset += 1000;
												resultsPage = resLenDetails.getResults(offset, offset + 1000);
											}
											
											nlapiLogExecution('DEBUG', 'opentaskordersearchresultkit', opentaskordersearchresultkit);
											if(opentaskordersearchresultkit != null && opentaskordersearchresultkit !='')
											{
												for(var k=0;k<opentaskordersearchresultkit.length;k++)
												{
													nlapiLogExecution('DEBUG', 'opentaskordersearchresultkit', opentaskordersearchresultkit[k].getId());
													var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',opentaskordersearchresultkit[k].getId());
													var expQty = loadRec.getFieldValue('custrecord_wmsse_expe_qty');
													loadRec.setFieldValue('custrecord_wmsse_act_qty',Number(Big(expQty).toFixed(5)));
													nlapiSubmitRecord(loadRec);
												}
												opentaskordersearchresultkit=null;
											}
											if(SOarray["custparam_orderlevel"] =="F" && mianItemOPenTaskid != null && mianItemOPenTaskid != '' && vStageScanRequired == "F")
											{
												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
												loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												//loadRec.setFieldValue('custrecord_wmsse_act_qty',expQty);
												nlapiSubmitRecord(loadRec);
												loadRec=null;
											}

											var vRedirectionFlag="F";
											var deviceUploadFlag = 'T';
											var columnsOpen = new Array();
											var filtersOpen = new Array();

											if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
												filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
											if(SOarray["custparam_whlocation"] !=null && SOarray["custparam_whlocation"]!='' && SOarray["custparam_whlocation"]!='null' && SOarray["custparam_whlocation"] !='undefined')
												filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', SOarray["custparam_whlocation"]));
											var vSOLineDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist', filtersOpen, columnsOpen);
											if(vSOLineDetails != null && vSOLineDetails != '' && vSOLineDetails != 'null' && vSOLineDetails!='undefined' && vSOLineDetails.length>0)
											{	
												var vnColumnslist=vSOLineDetails[0].getAllColumns();

												var pickReportExpectedQty = 3;
												var pickReportActualQty = 4;		

												for(var p1=0;p1<vnColumnslist.length;p1++)
												{
													var summaryLabel = vnColumnslist[p1].getLabel();

													if(summaryLabel == 'Expected Qty')
													{
														pickReportExpectedQty = p1;
													}
													else if (summaryLabel == 'Actual Qty')	
													{
														pickReportActualQty = p1;
													}																
													else
													{

													}
												}
												for(var i=0;i<vSOLineDetails.length;i++)
												{	
													var vPickedQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportActualQty]);
													var vPickGenQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportExpectedQty]);
													var vLineNo=vSOLineDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

													if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
														vPickedQty=0;
													if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
														vPickGenQty=0;

													vPickGenQty =new Big(vPickGenQty);
													vPickedQty =new Big(vPickedQty);
													var vRemainingQty = Number(vPickGenQty.minus(vPickedQty));
													nlapiLogExecution('DEBUG','vRemainingQty34 in Big',vRemainingQty);

													if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
														vRemainingQty=0;
													if(parseFloat(vRemainingQty) > 0)
													{
														vRedirectionFlag = "T";
														deviceUploadFlag = 'F';
														if(SOarray["custparam_orderlevel"] =="T")
														{
															var filtersOpenPicked = new Array();
															var columnsOpenPicked = new Array();
															if(soInternalId!=null && soInternalId!='' && soInternalId!='null' && soInternalId!='undefined')
																filtersOpenPicked.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', soInternalId));
															if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
																filtersOpenPicked.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
															if(SOarray["custparam_whlocation"] !=null && SOarray["custparam_whlocation"]!='' && SOarray["custparam_whlocation"]!='null' && SOarray["custparam_whlocation"] !='undefined')
																filtersOpenPicked.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', SOarray["custparam_whlocation"]));
															var vSOOrderDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist', filtersOpenPicked, columnsOpenPicked);
															if(vSOOrderDetails != null && vSOOrderDetails != '' && vSOOrderDetails != 'null' && vSOOrderDetails!='undefined' && vSOOrderDetails.length>0)
															{	
																var vnColumnslist=vSOOrderDetails[0].getAllColumns();

																var pickReportExpectedQty = 3;
																var pickReportActualQty = 4;		

																for(var p1=0;p1<vnColumnslist.length;p1++)
																{
																	var summaryLabel = vnColumnslist[p1].getLabel();

																	if(summaryLabel == 'Expected Qty')
																	{
																		pickReportExpectedQty = p1;
																	}
																	else if (summaryLabel == 'Actual Qty')	
																	{
																		pickReportActualQty = p1;
																	}																
																	else
																	{

																	}
																}
																var isOrderPicked = 'T';
																for(var i=0;i<vSOOrderDetails.length;i++)
																{	
																	var vPickedQty=vSOOrderDetails[i].getValue(vnColumnslist[pickReportActualQty]);
																	var vPickGenQty=vSOOrderDetails[i].getValue(vnColumnslist[pickReportExpectedQty]);
																	var vLineNo=vSOOrderDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

																	if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
																		vPickedQty=0;
																	if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
																		vPickGenQty=0;

																	vPickGenQty =new Big(vPickGenQty);
																	vPickedQty =new Big(vPickedQty);
																	var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
																	nlapiLogExecution('DEBUG','vRemainingQty35 in Big',vRemainingQty);

																	if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
																		vRemainingQty=0;
																	if(parseFloat(vRemainingQty) > 0)
																	{
																		isOrderPicked = 'F';
																		break;
																	}
																}
															}
															if(isOrderPicked == 'T')
															{
																deviceUploadFlag = 'T';
															}															
														}
														break;
													}
												}
											}
											nlapiLogExecution('DEBUG','vRedirectionFlag at',vRedirectionFlag);
											if(vRedirectionFlag == "T")
											{
												if(request.getParameter('hdnSendflag')=='New Order')
												{
													var SOarray = new Array();
													SOarray["custparam_error"] ='';
													SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
													SOarray["custparam_enterbinid"] =enteredBin;
													SOarray["custparam_language"] = getLanguage;
													SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
													SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
													SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
													//SOarray["custparam_item"] = request.getParameter('hdnitem');
													SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
													response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
													return;
												}
												else if(request.getParameter('hdnStageflag')=='Pick & Stage')
												{
													SOarray["custparam_error"] ='';
													SOarray["custparam_soid"]=SOarray["custparam_enterorder"];
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
													return;
												}
												else
												{
													if(deviceUploadFlag=='T' && SOarray["custparam_orderlevel"] =="T")
													{
														if(mianItemOPenTaskid != null && mianItemOPenTaskid != ''  &&  vStageScanRequired == 'F')
														{	
															var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
															loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
															nlapiSubmitRecord(loadRec);
															loadRec=null;
														}
													}
													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
													return;
												}
											}
											else
											{
												if(vStageScanRequired=='T')
												{
													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
													return;
												}
												else
												{
													if(deviceUploadFlag=='T' && SOarray["custparam_orderlevel"] =="T")
													{
														if(mianItemOPenTaskid != null && mianItemOPenTaskid != ''  &&  vStageScanRequired == 'F')
														{	
															var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
															loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
															nlapiSubmitRecord(loadRec);
															loadRec=null;
														}
													}
													SOarray["custparam_error"] ='';
													response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
													return;
												}
											}
										}
									}
									else
									{
										var vRedirectionFlag="F";
										var columnsOpen = new Array();
										var filtersOpen = new Array();

										if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
											filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
										if(SOarray["custparam_whlocation"] !=null && SOarray["custparam_whlocation"]!='' && SOarray["custparam_whlocation"]!='null' && SOarray["custparam_whlocation"] !='undefined')
											filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', SOarray["custparam_whlocation"]));
										var vSOLineDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist', filtersOpen, columnsOpen);
										if(vSOLineDetails != null && vSOLineDetails != '' && vSOLineDetails != 'null' && vSOLineDetails!='undefined' && vSOLineDetails.length>0)
										{	
											var vnColumnslist=vSOLineDetails[0].getAllColumns();

											var pickReportExpectedQty = 3;
											var pickReportActualQty = 4;		

											for(var p1=0;p1<vnColumnslist.length;p1++)
											{
												var summaryLabel = vnColumnslist[p1].getLabel();

												if(summaryLabel == 'Expected Qty')
												{
													pickReportExpectedQty = p1;
												}
												else if (summaryLabel == 'Actual Qty')	
												{
													pickReportActualQty = p1;
												}																
												else
												{

												}
											}
											for(var i=0;i<vSOLineDetails.length;i++)
											{	
												var vPickedQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportActualQty]);
												var vPickGenQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportExpectedQty]);
												var vLineNo=vSOLineDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

												if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
													vPickedQty=0;
												if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
													vPickGenQty=0;

												vPickGenQty =new Big(vPickGenQty);
												vPickedQty =new Big(vPickedQty);
												var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
												nlapiLogExecution('DEBUG','vRemainingQty36 in Big',vRemainingQty);

												if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
													vRemainingQty=0;
												if(parseFloat(vRemainingQty) > 0)
												{
													vRedirectionFlag = "T";
													break;
												}
											}
										}
										nlapiLogExecution('DEBUG','vRedirectionFlag at',vRedirectionFlag);
										if(vRedirectionFlag == "T")
										{
											if(request.getParameter('hdnSendflag')=='New Order')
											{
												var SOarray = new Array();
												SOarray["custparam_error"] ='';
												SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
												SOarray["custparam_enterbinid"] =enteredBin;
												SOarray["custparam_language"] = getLanguage;
												SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
												SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
												SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
												//SOarray["custparam_item"] = request.getParameter('hdnitem');
												SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
												response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
												return;
											}
											else if(request.getParameter('hdnStageflag')=='Pick & Stage')
											{
												SOarray["custparam_error"] ='';
												SOarray["custparam_soid"]=SOarray["custparam_enterorder"];
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
												return;
											}
											else
											{

												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
												return;
											}
										}
										else
										{
											if(vStageScanRequired=='T')
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
												return;
											}
											else
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
												return;
											}
										}
									}
								}
								else
								{
									/*	if(inventoryStatusFeature == true)
									{
										var invfilterStrat =  new Array();
										if(whlocation != null && whlocation != '')
											invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whlocation));
										if(enteredItem != null && enteredItem != '')
											invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', enteredItem));
										if(enteredBin != null && enteredBin!= '')
											invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', enteredBin));

										// No need for loadsearch here this search is for navigating to other screen if the serach returns more
										//than one status.
										var	objBinStatusDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh',invfilterStrat, null);

										if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && 
												objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined &&
												objBinStatusDetails.length > 0)
										{
											SOarray["custparam_enteredBinID"]=enteredBin;
											SOarray["custparam_enteredbin"]=request.getParameter('hdnEnteredBin');;
											SOarray["custparam_enteredqty"]=enterQty;
											if(request.getParameter('hdnStageflag')=='Pick & Stage')
											{
												SOarray["custparam_hdnStageflag"]='PickAndStage';
											}
											if(request.getParameter('hdnSendflag')=='New Order')
											{
												SOarray["custparam_hdnSendflag"]='New Order';
											}
											if(objBinStatusDetails.length > 1)
											{
												response.sendRedirect('SUITELET', 'customscript_wmsse_picking_statusscan', 'customdeploy_wmsse_picking_statusscan', false, SOarray);
												return;  
											}
											else
											{
												var inventoryStatus = objBinStatusDetails[0].getValue('status',null,'group');
												SOarray["custparam_inventorystatus"]=inventoryStatus;
											}
										}

									}*/

									SOarray["custparam_error"] ='';
									SOarray["custparam_parentSkuType"] =parentItemType;
									SOarray["custparam_parentSku"] =parentSku;
									response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
									return;
								}
							}
							else
							{
								var itemType = nswms_GetItemType(enteredItem, whlocation);
								if (itemType == "inventoryitem"  ||itemType == "noninventoryitem" ||
										itemType == "otherchargeitem" ||itemType == "serviceitem" ||itemType == "downloaditem" 
											|| itemType == "giftcertificateitem" || itemType == "assemblyitem" ||
											itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
								{
									var soLineItemDetails = getSOLineDetailsNew(enterOrder,trantype,enteredItem,whlocation);

									nlapiLogExecution('DEBUG', 'soLineItemDetails', soLineItemDetails);
									var vMultiShipping='F';
									var vShipVia='';
									var vSoreminqty =0;
									//To fetch Line level multi shipping flag and ship via validation
									if(soLineItemDetails !=null && soLineItemDetails!="" && soLineItemDetails !='null' && soLineItemDetails != 'undefined' && soLineItemDetails.length != null)
									{	

										var vColumnslist=soLineItemDetails[0].getAllColumns();

										var custIndex = 12;
										var commitedQtyIndex = 25;
										var fulfilledQtyIndex = 26;
										var conversionRateIndex=27;
										var totalPickedQtyIndex =7;
										var totalNSPickedQtyIndex =37;
										var ERPConfirmedQty =38;
										for(var x1=0;x1<vColumnslist.length;x1++)
										{
											var summaryLabel = vColumnslist[x1].getLabel();
											var name =  vColumnslist[x1].getName();
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



										for(var z=0;z<soLineItemDetails.length;z++)
										{
											var vsoLine = soLineItemDetails[z].getValue('line',null,'group');
											//if(parseFloat(vsoLine) == parseFloat(soLineno))
											var vsoitemQty=soLineItemDetails[z].getValue(vColumnslist[commitedQtyIndex]);
											var vsoitemfulfillQty=soLineItemDetails[z].getValue(vColumnslist[fulfilledQtyIndex]);							
											var vsoitemopentaskQty=soLineItemDetails[z].getValue(vColumnslist[totalPickedQtyIndex]);
											var vsoitemErpConfirmedQty=soLineItemDetails[z].getValue(vColumnslist[ERPConfirmedQty]);
											var vsoitemNSReceivedQty=soLineItemDetails[z].getValue(vColumnslist[totalNSPickedQtyIndex]);
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
											nlapiLogExecution('DEBUG','vsoitemRcvQty in big',vsoitemRcvQty);


											if(vsoitemRcvQty==null || vsoitemRcvQty=='')
												vsoitemRcvQty=0;
											if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
												vsoitemfulfillQty=0;

											vsoitemQty=new Big(vsoitemQty);
											vsoitemfulfillQty=new Big(vsoitemfulfillQty);
											vsoitemRcvQty=new Big(vsoitemRcvQty);
											vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
											nlapiLogExecution('DEBUG','vSoreminqty in Big',vSoreminqty);

											if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1) && trantype == 'transferorder'))
											{
												vMultiShipping = soLineItemDetails[z].getValue('ismultishipto',null,'group');
												if(vMultiShipping ==  null || vMultiShipping =='')
													vMultiShipping='F';

												vShipVia=soLineItemDetails[z].getValue('shipmethod',null,'group');

												break;
											}			

										}	

									}
									nlapiLogExecution('DEBUG', 'vMultiShipping : vShipVia ', vMultiShipping + ":" + vShipVia);
									var isItLastPick='F';
									var soLineDetails = null;
									if(parseFloat(vSoreminqty) > 0)
									{
										soLineDetails = getSOLineDetailsNew(enterOrder,trantype,null,whlocation);
										nlapiLogExecution('DEBUG', 'soLineDetails', soLineDetails);
									}
									if(soLineDetails !=null && soLineDetails!="" && vStageScanRequired=='F')
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



											for(var f=0;f<soLineDetails.length;f++)
											{

												var vsoitemRcvQty = soLineDetails[f].getValue('quantityshiprecv',null,'max');
												//var vsoitemCommitedQty=soLineDetails[f].getValue('quantitycommitted',null,'max');
												var vsoitemCommitedQty=soLineDetails[f].getValue(vColumnslist[commitedQtyIndex]);			 
												var vsoitemfulfillQty=soLineDetails[f].getValue(vColumnslist[fulfilledQtyIndex]);
												var vsoitemopentaskQty=soLineDetails[f].getValue(vColumnslist[totalPickedQtyIndex]);
												var vsoitemErpConfirmedQty=soLineDetails[f].getValue(vColumnslist[ERPConfirmedQty]);
												var vsoitemNSReceivedQty=soLineDetails[f].getValue(vColumnslist[totalNSPickedQtyIndex]);
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
												var vsoitemPickedQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
												nlapiLogExecution('DEBUG','vsoitemPickedQty in big',vsoitemPickedQty);

												var vsoitemQty = soLineDetails[f].getValue('quantity',null,'max');
												var vsoitemLine = soLineDetails[f].getValue('line',null,'group');
												var vsoitemMultiShipping = soLineDetails[f].getValue('ismultishipto',null,'group');
												var vsoitemShipVia = soLineDetails[f].getValue('shipmethod',null,'group');
																							
												var logMsg1 = 'vsoitemMultiShipping =' + vsoitemMultiShipping + '<br>';
												logMsg1 = logMsg1 + 'vsoitemShipVia = ' + vsoitemShipVia + '<br>';
												logMsg1 = logMsg1 + 'vsoitemRcvQty = ' + vsoitemRcvQty + '<br>';
												logMsg1 = logMsg1 + 'vsoitemCommitedQty = ' + vsoitemCommitedQty + '<br>';
												logMsg1 = logMsg1 + 'vsoitemQty = ' + vsoitemQty + '<br>';
												logMsg1 = logMsg1 + 'vsoitemPickedQty = ' + vsoitemPickedQty + '<br>';
												logMsg1 = logMsg1 + 'vsoitemLine = ' + vsoitemLine + '<br>';
												nlapiLogExecution('DEBUG', 'parameters', logMsg1);
												
												
												//var vsoitemfulfillQty=soLineDetails[f].getValue(vColumnslist[6]);
												if(vsoitemCommitedQty == null || vsoitemCommitedQty =='' || vsoitemCommitedQty =='null' || vsoitemCommitedQty =='undefined')
													vsoitemCommitedQty = 0;
												if(vsoitemfulfillQty == null || vsoitemfulfillQty =='' || vsoitemfulfillQty =='null' || vsoitemfulfillQty =='undefined')
													vsoitemfulfillQty = 0;
												if(vsoitemPickedQty == null || vsoitemPickedQty =='' || vsoitemPickedQty =='null' || vsoitemPickedQty =='undefined')
													vsoitemPickedQty = 0;

												vsoitemCommitedQty=new Big(vsoitemCommitedQty);
												vsoitemfulfillQty=new Big(vsoitemfulfillQty);
												vsoitemPickedQty=new Big(vsoitemPickedQty);
												var vsoitemRemQty = Number((vsoitemCommitedQty.plus(vsoitemfulfillQty)).minus(vsoitemPickedQty));
												nlapiLogExecution('DEBUG','vsoitemRemQty kit in Big',vsoitemRemQty);



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
													if(vsoitemLine==SOarray["custparam_solineno"])
													{
														nlapiLogExecution('DEBUG', 'Inside same line', SOarray["custparam_solineno"]);

														vsoitemRemQty=new Big(vsoitemRemQty);
														enterQty=new Big(enterQty);
														var totalQty=Number(vsoitemRemQty.minus(enterQty));
														nlapiLogExecution('DEBUG', 'totalQty23 in Big', totalQty);

														if(parseFloat(totalQty) > 0)
														{
															//isItLastPick="T";
															vLinecount=parseFloat(vLinecount)+1;
														}

													}
												}
												else
												{
													nlapiLogExecution('ERROR', 'else vsoitemMultiShipping', vsoitemMultiShipping);
													if(parseFloat(vsoitemRemQty)>0 && vsoitemShipVia == vShipVia)
													{
														vLinecount=parseFloat(vLinecount)+1;
													}
													if(trantype=='transferorder')
														vsoitemLine=vsoitemLine-1;
													if(vsoitemLine==SOarray["custparam_solineno"] && vsoitemShipVia == vShipVia)
													{
														nlapiLogExecution('DEBUG', 'Inside same line', SOarray["custparam_solineno"]);

														vsoitemRemQty=new Big(vsoitemRemQty);
														enterQty=new Big(enterQty);
														var totalQty=Number(vsoitemRemQty.minus(enterQty));
														nlapiLogExecution('DEBUG', 'totalQty33 in Big', totalQty);


														if(parseFloat(totalQty) > 0)
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
									var taskType="PICK";
									var actualBeginTime=TimeStamp();
									var orderLevel="F";
									if(parseFloat(vSoreminqty) > 0)
									{
										orderLevel=getSystemRuleValue('Consolidate item fulfillments by sales order?',whlocation);
										if(orderLevel ==null || orderLevel =='' || orderLevel =='null' || orderLevel =='undefined')
										{
											orderLevel="F";
										}
										if(orderLevel=="Y")
										{
											orderLevel='T';
										}
										else
										{
											orderLevel='F';
										}
										SOarray["custparam_orderlevel"] = orderLevel;

										// To post IF when order level is true and lastpick is true for already packed containers against order
										if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T" && vStageScanRequired=='F')
										{
																				
											var opentaskSearchResultsPack=new Array();
											var opentaskSearchResults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh');
																		
											opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));
											opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
											opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));
											opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['14']));
											opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'isnotempty'));

																					
											var resLenDetails = opentaskSearchResults.runSearch();
																		
											var resultsPage = resLenDetails.getResults(0, 1000);
											var offset = 0;
											while (!!resultsPage && resultsPage.length > 0) 
											{
												opentaskSearchResultsPack = opentaskSearchResultsPack.concat(resultsPage);
												offset += 1000;
												resultsPage = resLenDetails.getResults(offset, offset + 1000);
											}
											
											
											if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
											{
												nlapiLogExecution('DEBUG','opentaskSearchResultsPack at',opentaskSearchResultsPack.length);
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
														nlapiLogExecution('DEBUG','vPackRecId at',vPackRecId);
													}
												}
											}
										}
										// end

										if(isItLastPick!=null && isItLastPick!='' && isItLastPick=="T" && vStageScanRequired=='F')
										{
											var id=  updateOpenTask(soInternalId,enteredItem,soLineno,Number(Big(enterQty).toFixed(5)),enteredBin,itemType,whlocation,
													enteredLot,'','','',soInternalId,null,null,null,taskType,null,null,null,"T",trantype,actualBeginTime,
													customer,'','','','','','',SOarray["custparam_unitstext"],SOarray["custparam_conversionrate"],vShipVia,null,
													ordType,department,vclass,getPickreportid,null,inventoryStatus);
											context.setSessionObject('record', 'created'); 
										}
										else
										{
											if(SOarray["custparam_orderlevel"]=="T")
											{

												var id=  updateOpenTask(soInternalId,enteredItem,soLineno,Number(Big(enterQty).toFixed(5)),enteredBin,itemType,whlocation,
														enteredLot,'','','',soInternalId,null,null,null,taskType,null,null,null,'F',trantype,actualBeginTime,
														customer,'','','','','','',SOarray["custparam_unitstext"],SOarray["custparam_conversionrate"],
														vShipVia,null,ordType,department,vclass,getPickreportid,null,inventoryStatus);
												context.setSessionObject('record', 'created'); 
											}
											else
											{

												if(vStageScanRequired=='F')
												{
													var id=  updateOpenTask(soInternalId,enteredItem,soLineno,Number(Big(enterQty).toFixed(5)),enteredBin,itemType,whlocation,
															enteredLot,'','','',soInternalId,null,null,null,taskType,null,null,null,"T",trantype,actualBeginTime,
															customer,'','','','','','',SOarray["custparam_unitstext"],SOarray["custparam_conversionrate"],vShipVia,null,
															ordType,department,vclass,getPickreportid,null,inventoryStatus);
													context.setSessionObject('record', 'created'); 
												}
												else
												{
													var id=  updateOpenTask(soInternalId,enteredItem,soLineno,Number(Big(enterQty).toFixed(5)),enteredBin,itemType,whlocation,
															enteredLot,'','','',soInternalId,null,null,null,taskType,null,null,null,"F",trantype,actualBeginTime,
															customer,'','','','','','',SOarray["custparam_unitstext"],SOarray["custparam_conversionrate"],
															vShipVia,null,ordType,department,vclass,getPickreportid,null,inventoryStatus);
													context.setSessionObject('record', 'created'); 
												}

											}

										}

									}

									var vRedirectionFlag="F";
									var columnsOpen = new Array();
									var filtersOpen = new Array();

									if(getPickreportid!=null && getPickreportid!='' && getPickreportid!='null' && getPickreportid!='undefined')
										filtersOpen.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
									var vSOLineDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pick_with_picklist', filtersOpen, columnsOpen);
									if(vSOLineDetails != null && vSOLineDetails != '' && vSOLineDetails != 'null' && vSOLineDetails!='undefined' && vSOLineDetails.length>0)
									{	
										nlapiLogExecution('DEBUG','vSOLineDetails',vSOLineDetails.length);
										var vnColumnslist=vSOLineDetails[0].getAllColumns();

										var pickReportExpectedQty = 3;
										var pickReportActualQty = 4;		

										for(var p1=0;p1<vnColumnslist.length;p1++)
										{
											var summaryLabel = vnColumnslist[p1].getLabel();

											if(summaryLabel == 'Expected Qty')
											{
												pickReportExpectedQty = p1;

											}
											else if (summaryLabel == 'Actual Qty')	
											{
												pickReportActualQty = p1;

											}																
											else
											{

											}
										}
										for(var i=0;i<vSOLineDetails.length;i++)
										{	
											var vPickedQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportActualQty]);
											var vPickGenQty=vSOLineDetails[i].getValue(vnColumnslist[pickReportExpectedQty]);
											//var vLineNo=vSOLineDetails[i].getValue('custrecord_wmsse_line_no',null,'group');

											if(vPickedQty == null || vPickedQty =='' || vPickedQty =='null')
												vPickedQty=0;
											if(vPickGenQty == null || vPickGenQty =='' || vPickGenQty =='null')
												vPickGenQty=0;
											nlapiLogExecution('DEBUG','vPickGenQty,vPickedQty',vPickGenQty+','+vPickedQty);

											vPickGenQty =new Big(vPickGenQty);
											vPickedQty =new Big(vPickedQty);
											var vRemainingQty= Number(vPickGenQty.minus(vPickedQty));
											nlapiLogExecution('DEBUG','vRemainingQty44 in Big',vRemainingQty);
											if(vRemainingQty == null || vRemainingQty =='' || vRemainingQty =='null')
												vRemainingQty=0;
											if(parseFloat(vRemainingQty) > 0)
											{
												vRedirectionFlag = "T";
												break;
											}
										}
									}
									nlapiLogExecution('DEBUG','vRedirectionFlag',vRedirectionFlag);
									if(vRedirectionFlag == "T")
									{
										if(request.getParameter('hdnSendflag')=='New Order')
										{
											var SOarray = new Array();
											SOarray["custparam_error"] ='';
											SOarray["custparam_enterbin"] =request.getParameter('hdnEnteredBin');
											SOarray["custparam_enterbinid"] =enteredBin;
											SOarray["custparam_language"] = getLanguage;
											SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
											SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
											SOarray["custparam_enteritem"] = request.getParameter('hdnEnteredItem');
											//SOarray["custparam_item"] = request.getParameter('hdnitem');
											SOarray["custparam_pickreportid"] =request.getParameter('hdnPickReportId');
											response.sendRedirect('SUITELET', 'customscript_wmsse_picking_item_scan', 'customdeploy_wmsse_picking_item_scan', false, SOarray);
											return;
										}
										else if(request.getParameter('hdnStageflag')=='Pick & Stage')
										{
											SOarray["custparam_error"] ='';
											SOarray["custparam_soid"]=SOarray["custparam_enterorder"];
											response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
											return;
										}
										else
										{

											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_binscan', 'customdeploy_wmsse_multiord_binscan', false, SOarray);
											return;
										}
									}
									else
									{
										if(vStageScanRequired=='T')
										{
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
											return;
										}
										else
										{
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
											return;
										}

									}
								}
								else
								{

									/*if(inventoryStatusFeature == true)
									{
										var invfilterStrat =  new Array();
										if(whlocation != null && whlocation != '')
											invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whlocation));
										if(enteredItem != null && enteredItem != '')
											invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', enteredItem));
										if(enteredBin != null && enteredBin!= '')
											invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', enteredBin));

										// No need for loadsearch here this search is for navigating to other screen if the serach returns more
										//than one status.
										var	objBinStatusDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh',invfilterStrat, null);

										if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && 
												objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined &&
												objBinStatusDetails.length > 0)
										{
											SOarray["custparam_enteredBinID"]=enteredBin;
											SOarray["custparam_enteredbin"]=request.getParameter('hdnEnteredBin');;
											SOarray["custparam_enteredqty"]=enterQty;
											if(request.getParameter('hdnStageflag')=='Pick & Stage')
											{
												SOarray["custparam_hdnStageflag"]='PickAndStage';
											}
											if(request.getParameter('hdnSendflag')=='New Order')
											{
												SOarray["custparam_hdnSendflag"]='New Order';
											}
											if(objBinStatusDetails.length > 1)
											{
												response.sendRedirect('SUITELET', 'customscript_wmsse_picking_statusscan', 'customdeploy_wmsse_picking_statusscan', false, SOarray);
												return;  
											}
											else
											{
												var inventoryStatus = objBinStatusDetails[0].getValue('status',null,'group');
												SOarray["custparam_inventorystatus"]=inventoryStatus;
											}
										}

									}
									 */



									SOarray["custparam_error"] ='';
									response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_serialscan', 'customdeploy_wmsse_multiord_serialscan', false, SOarray);
									return;
								}
							}
						}
					}
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

				var lockfilters=new Array();

				lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',enteredItem));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',enteredBin));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
				var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

				if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
				{
					var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
					nlapiLogExecution('ERROR','DeleteRecordId', DeleteRecordId);
				}


				response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_picking_qty_scan', 'customdeploy_wmsse_picking_qty_scan', false, SOarray);
		}
	}
}
function fnCheckOrd(soid,loc,trantype,itemid,quantity){


	var SOtrantypefilters=new Array();
	SOtrantypefilters.push(new nlobjSearchFilter('tranid',null,'is',soid));
	//SOtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
	if(loc!=null && loc!="" && loc!='null')
		SOtrantypefilters.push(new nlobjSearchFilter('location', null, 'anyof', loc));
	//SOtrantypefilters.push(new nlobjSearchFilter('printedpickingticket',null,'is','T'));
	SOtrantypefilters.push(new nlobjSearchFilter('custbody_wmsse_printpickticket',null,'is','T'));
	SOtrantypefilters.push(new nlobjSearchFilter('formulanumeric',null,'greaterthanorequalto',quantity).setFormula('TO_NUMBER({quantity} - {quantitypicked})'));
	SOtrantypefilters.push(new nlobjSearchFilter('item', null, 'anyof', itemid));
	var SOtrantypecols=new Array();
	SOtrantypecols.push(new nlobjSearchColumn('internalid'));
	SOtrantypecols.push(new nlobjSearchColumn('tranid'));
	SOtrantypecols.push(new nlobjSearchColumn('status'));
	SOtrantypecols.push(new nlobjSearchColumn('location'));
	SOtrantypecols.push(new nlobjSearchColumn('line'));
	var SORecinternalids=nlapiSearchRecord(trantype,null,SOtrantypefilters,SOtrantypecols);//this function not used

	SOtrantypefilters=null;
	SOtrantypecols=null;
	return SORecinternalids;
}
function funtoCheckPickReportNo(pickreportid,loc,soid,sku,soLineno,trantype){

	var logMsg1 = 'pickreportid =' + pickreportid + '<br>';
	logMsg1 = logMsg1 + 'soid = ' + soid + '<br>';
	logMsg1 = logMsg1 + 'soLineno = ' + soLineno + '<br>';
	logMsg1 = logMsg1 + 'loc = ' + loc + '<br>';
	logMsg1 = logMsg1 + 'sku = ' + sku + '<br>';
	logMsg1 = logMsg1 + 'trantype = ' + trantype + '<br>';
	nlapiLogExecution('DEBUG', 'parameters of funtoCheckPickReportNo', logMsg1);
		
	var SORecinternalids=new Array();
	var SORecidsearchresults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh');
	
	SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',pickreportid));

	if(loc!=null && loc!="" && loc!='null')
		SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', loc));
	if(sku!=null && sku!="" && sku!='null')
		SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', sku));
	SORecidsearchresults.addFilter(new nlobjSearchFilter('tranid','custrecord_wmsse_order_no','is',soid));
	if(trantype!='transferorder')
		SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'equalto',soLineno));
	else
		SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'equalto',parseFloat(soLineno)+parseFloat(1)));

	SORecidsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',9));// 9 - Pick Locations Assigned
	
	var resLenDetails = SORecidsearchresults.runSearch();
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SORecinternalids = SORecinternalids.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}
	

	return SORecinternalids;
}
function getSOLineDetailskit(sonumber,trantype,itemID,whLocation)
{
	nlapiLogExecution('DEBUG', 'sonumber,trantype,whLocation,itemID',sonumber+","+trantype+","+whLocation+","+itemID);

	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';

	var filters = new Array();
	var columns = new Array();

	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

	filters.push(new nlobjSearchFilter('internalid', null, 'is', sonumber));
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

	var SOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_ordline_details_kit', filters, columns);
	filters=null;
	columns=null;
	return SOLineDetails;
}

function getCoversionRate(vunitstype,vstockunit)
{
	var uomfilters=new Array();		
	if(vunitstype!=null && vunitstype!='' && vunitstype!=undefined && vunitstype!='')
		uomfilters[0]=new nlobjSearchFilter('internalid',null,'anyof',vunitstype);
	if(vstockunit!=null && vstockunit!='' && vstockunit!=undefined && vstockunit!='')
		uomfilters[1]=new nlobjSearchFilter('unitname',null,'is',vstockunit); 
	var uomcolumns=new Array();
	uomcolumns[0]=new nlobjSearchColumn('conversionrate'); 
	var uomresults= nlapiSearchRecord('unitstype', 'customsearch_wmsse_unitstype', uomfilters, uomcolumns);
	var vFromRate=1;
	if(uomresults != null && uomresults != '')
	{
		vFromRate=uomresults[0].getValue('conversionrate');
		if(vFromRate == null || vFromRate == '')
			vFromRate=1;

	}	
	return vFromRate;
}


function getOPenTaskPickBinDetails1(vItemId,vBinArray,whLocation,vUnitType,StockUnitText)
{
	nlapiLogExecution('DEBUG', 'vUnitType,StockUnitText,vItemId,{vBinArray},whLocation', vUnitType+","+StockUnitText+","+vItemId+",{"+vBinArray+"},"+whLocation);
	var vPickBinDetailsArr = new Array();
	var vPickBinIdArr = new Array();
	var vPickBinTextArr = new Array();
	var vPickBinQtyArr = new Array();
		
	var filters = new Array();
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_sku',null,'group'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum'));	

	columns.push(new nlobjSearchColumn('custrecord_wmsse_actendloc',null,'group'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_pickseq_no','custrecord_wmsse_actbeginloc','group'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_conversionrate',null,'group'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_expe_qty',null,'sum'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_kitflag',null,'group'));
	columns[3].setSort();
	if(vItemId != null && vItemId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', vItemId));

	if(vBinArray != null && vBinArray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', vBinArray));
	if(whLocation != null && whLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whLocation));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', 3));// 3 - PICK
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [8,28]));// 8 - Picking Completed,28 - Packing Completed
	filters.push(new nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is', 'T'));
	filters.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E','WorkOrd:B','WorkOrd:D']));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_nstrn_ref_no', null, 'anyof', ['@NONE@']));

	var objOpenTaskDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,filters, columns);
	nlapiLogExecution('DEBUG', 'objOpenTaskDetails', objOpenTaskDetails);


	var conversionRate =1;
	if(StockUnitText !=null && StockUnitText!='' && StockUnitText!='- None -')
		conversionRate = getOpenTaskStockCoversionRate(vUnitType,StockUnitText);
	nlapiLogExecution('DEBUG', 'conversionRate', conversionRate);
	if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
	{
		for(var z=0; z < objOpenTaskDetails.length ; z++)
		{
			var KitFlag = objOpenTaskDetails[z].getValue('custrecord_wmsse_kitflag',null,'group');
			var vPickQty = 0;
			if(KitFlag == 'T')
				vPickQty = objOpenTaskDetails[z].getValue('custrecord_wmsse_expe_qty',null,'sum');
			else
				vPickQty = objOpenTaskDetails[z].getValue('custrecord_wmsse_act_qty',null,'sum');
			var vPickBeginLocId = objOpenTaskDetails[z].getValue('custrecord_wmsse_actendloc',null,'group');
			var vPickBeginLocText = objOpenTaskDetails[z].getText('custrecord_wmsse_actendloc',null,'group');
			var vPickConversionRate = objOpenTaskDetails[z].getValue('custrecord_wmsse_conversionrate',null,'group');
			if(vPickConversionRate == null || vPickConversionRate == '' || vPickConversionRate == '- None -')
				vPickConversionRate=1;
			if(vPickQty == null || vPickQty == '' || vPickQty == '- None -' || vPickQty == 'null')
				vPickQty=0;
			if((vPickBinIdArr.indexOf(vPickBeginLocId) ==-1) )
			{
				vPickBinIdArr.push(vPickBeginLocId);
				vPickBinTextArr.push(vPickBeginLocText);
				//vPickBinQtyArr.push(vPickQty * (parseFloat(vPickConversionRate)/parseFloat(conversionRate)));

				vPickQty=new Big(vPickQty);
				vPickConversionRate=new Big(vPickConversionRate);
				conversionRate=new Big(conversionRate);
				vPickBinQtyArr.push(Number(vPickQty.mul(vPickConversionRate.div(conversionRate))));
			}
			else
			{
				if(vPickBinIdArr != null && vPickBinIdArr != '' && vPickBinIdArr.length > 0)
				{

					var ind = vPickBinIdArr.indexOf(vPickBeginLocId);
					var pickBinQty = vPickBinQtyArr[ind];
					//	var tempQty = parseFloat(vPickQty) * (parseFloat(vPickConversionRate)/parseFloat(conversionRate));
					//vPickBinQtyArr[ind]=parseFloat(tempQty)+parseFloat(pickBinQty);

					vPickQty=new Big(vPickQty);
					vPickConversionRate=new Big(vPickConversionRate);
					conversionRate=new Big(conversionRate);



					var tempQty = Number(vPickQty.mul(vPickConversionRate.div(conversionRate)));
					tempQty=new Big(tempQty);
					pickBinQty=new Big(pickBinQty);

					vPickBinQtyArr[ind]=Number(tempQty.plus(pickBinQty));

				}
			}

			//vPickBinArr.push(vPickBeginLocId,vPickQty,vPickBeginLocText);
		}
		vPickBinDetailsArr.push(vPickBinIdArr,vPickBinQtyArr,vPickBinTextArr);
	}

	nlapiLogExecution('DEBUG', 'vPickBinDetailsArr', vPickBinDetailsArr);
	filters=null;
	columns=null;
	objOpenTaskDetails = null;
	return vPickBinDetailsArr;
}


/**
 * To get opoen task details of selected bin locations
 * @param vItemId
 * @param vBinArray
 * @param whLocation
 * @returns {vPickBinArr}
 */
function getOPenTaskPickBinDetailsLot(vItemId,vBinArray,whLocation,vUnitType,StockUnitText,enteredLot)
{
	nlapiLogExecution('DEBUG', 'vItemId,{vBinArray},whLocation,{enteredLot}', vItemId+",{"+vBinArray+"},"+whLocation+",{"+enteredLot+"}");
	nlapiLogExecution('DEBUG', 'vUnitType,StockUnitText', vUnitType+","+StockUnitText);
	var vPickBinDetailsArr = new Array();
	var vPickBinIdArr = new Array();
	var vPickBinTextArr = new Array();
	var vPickBinQtyArr = new Array();
	var vPickBinLotArr = new Array();
	var vPickBinExpArr = new Array();
	var filters = new Array();


	if(vItemId != null && vItemId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', vItemId));

	if(vBinArray != null && vBinArray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', vBinArray));

	if(enteredLot != null && enteredLot != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_batch_num', null, 'is', enteredLot));

	if(whLocation != null && whLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whLocation));

	var objOpenTaskDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_openpicklotqtydetails',filters, null);
	nlapiLogExecution('DEBUG', 'objOpenTaskDetails', objOpenTaskDetails);

	var conversionRate =1;
	if(StockUnitText !=null && StockUnitText!='' && StockUnitText!='- None -')
		conversionRate = getOpenTaskStockCoversionRate(vUnitType,StockUnitText);
	nlapiLogExecution('DEBUG', 'conversionRate', conversionRate);
	if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
	{
		for(var z=0; z < objOpenTaskDetails.length ; z++)
		{
			var	vPickQty = objOpenTaskDetails[z].getValue('formulanumeric',null,'sum');
			var vPickBeginLocId = objOpenTaskDetails[z].getValue('custrecord_wmsse_actendloc',null,'group');
			var vPickBeginLocText = objOpenTaskDetails[z].getText('custrecord_wmsse_actendloc',null,'group');
			var vPickBeginLocLot = objOpenTaskDetails[z].getValue('custrecord_wmsse_batch_num',null,'group');
			var vPickBeginLocExpDate = objOpenTaskDetails[z].getValue('custrecord_wmsse_expirydate',null,'max');

			if(vPickQty == null || vPickQty == '' || vPickQty == '- None -' || vPickQty == 'null')
				vPickQty=0;
			if(vPickBinIdArr.indexOf(vPickBeginLocId) == -1)
			{
				vPickBinIdArr.push(vPickBeginLocId);
				vPickBinTextArr.push(vPickBeginLocText);
				vPickQty=new Big(vPickQty);
				vPickBinQtyArr.push(vPickQty.div(conversionRate));
				vPickBinLotArr.push(vPickBeginLocLot);
				vPickBinExpArr.push(vPickBeginLocExpDate);
			}
			else
			{
				//same bin and lot
				if(vPickBinIdArr.length > 0 && vPickBinLotArr.indexOf(vPickBeginLocLot) != -1)
				{

					var ind = vPickBinLotArr.indexOf(vPickBeginLocLot);
					var tempQty = vPickBinQtyArr[ind];



					nlapiLogExecution('DEBUG', 'vPickBinDetailsArr', vPickBinDetailsArr);
					//var totalLotQty = parseFloat(tempQty)+(vPickQty /parseFloat(conversionRate));

					vPickQty =new Big(vPickQty);
					conversionRate =new Big(conversionRate);
					tempQty =new Big(tempQty);
					var totalLotQty = Number(tempQty.plus(vPickQty.div(conversionRate)));
					nlapiLogExecution('DEBUG', 'totalLotQty with precendence of 2 big variables', totalLotQty);


					vPickBinQtyArr[ind] = totalLotQty;
				}
				else
				{
					vPickBinIdArr.push(vPickBeginLocId);
					vPickBinTextArr.push(vPickBeginLocText);
					vPickQty =new Big(vPickQty);

					vPickBinQtyArr.push(Number(vPickQty.div(conversionRate)));
					//vPickBinQtyArr.push(vPickQty/parseFloat(conversionRate));
					vPickBinLotArr.push(vPickBeginLocLot);
					vPickBinExpArr.push(vPickBeginLocExpDate);

				}
			}
		}
		vPickBinDetailsArr.push(vPickBinIdArr,vPickBinQtyArr,vPickBinTextArr,vPickBinLotArr,vPickBinExpArr);
	}

	nlapiLogExecution('DEBUG', 'vPickBinDetailsArr', vPickBinDetailsArr);
	filters=null;
	columns=null;
	objOpenTaskDetails = null;
	return vPickBinDetailsArr;
}

