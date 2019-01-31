/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
****************************************************************************/
/*********************************************************************
$Source: /Scr/RF/Userevent/wmsse_bin_locking.js,v $
$Revision: 1.1 $
$Date: 2017/1/16 15:53:45 $
$Author:rmukkera $ 
$Description : This Script will Lock the inventory for that item and bin until the process complete for first user $.
$Function Name:checkBin $

 *********************************************************************/

function checkBin(type)
{

	if(type == 'create' )
	{
		var newRecord = nlapiGetNewRecord();
		var binInternalId=newRecord.getFieldValue('custrecord_wmsse_lock_binlocation');//
		var itemId=newRecord.getFieldValue('custrecord_wmse_lock_sku');
		var WhLocation=newRecord.getFieldValue('custrecord_wmsse_locklocation');
		var vUnitType = newRecord.getFieldValue('custrecord_wmsse_lock_unittype');
		var StockUnitText = newRecord.getFieldValue('custrecord_wmsse_lock_stockunit');
		var enteredQty = newRecord.getFieldValue('custrecord_wmsse_lockqty');
		var itemType=newRecord.getFieldValue('custrecord_wmsse_lock_itemtype');
		var lotorserialNum = newRecord.getFieldValue('custrecord_wmsse_lock_seriallot');
		var getStockConversionRate=newRecord.getFieldValue('custrecord_wmsse_lock_conversionrate');
		var inventoryStatus = newRecord.getFieldValue('custrecord_wmsse_lock_invtstatus');	
        var trantype=newRecord.getFieldValue('custrecord_wmsse_lock_trantype');
		nlapiLogExecution('ERROR', 'itemType', itemType);
		nlapiLogExecution('ERROR', 'trantype', trantype);
		nlapiLogExecution('ERROR', 'itemId', itemId);
		var AllowAllLots;
		if(trantype=='transferorder')
			 AllowAllLots = 'T';
	  var objBinDetails =null;
		var vBinQtyAvail = 0;
		var lotInternalId = '';
		if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&
				itemType !='serviceitem' && itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
		{
			//Check Inventorystatus Feature is turn on/off
			var inventoryStatusFeature = isInvStatusFeatureEnabled();
			nlapiLogExecution('Debug','inventoryStatusFeature', inventoryStatusFeature);

			if(itemType == "inventoryitem" || itemType=="assemblyitem" ||
					(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") )
			{
				//Inventorystatus Feature is enabled
				if(inventoryStatusFeature == true)
				{
					if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
					{
						var filterPrefInv = new Array();

						if(itemId != null && itemId != '')
							filterPrefInv.push(new nlobjSearchFilter('internalid','item', 'anyof', itemId));
						if(WhLocation!= null && WhLocation!= '')
							filterPrefInv.push(new nlobjSearchFilter('location',null, 'anyof', WhLocation));
						if(binInternalId != null && binInternalId!= '')
							filterPrefInv.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
						if(inventoryStatus != null && inventoryStatus!= '')
							filterPrefInv.push(new nlobjSearchFilter('status',null, 'anyof', inventoryStatus));
						objBinDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh',filterPrefInv, null);


					}
					else
					{


						var filterPrefInv = new Array();

						if(itemId != null && itemId != '')
							filterPrefInv.push(new nlobjSearchFilter('internalid','item', 'anyof', itemId));
						if(WhLocation!= null && WhLocation!= '')
							filterPrefInv.push(new nlobjSearchFilter('location',null, 'anyof', WhLocation));
						if(binInternalId != null && binInternalId!= '')
							filterPrefInv.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
						if(inventoryStatus != null && inventoryStatus!= '')
							filterPrefInv.push(new nlobjSearchFilter('status',null, 'anyof', inventoryStatus));
						objBinDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterPrefInv, null);
					}
				}
				else
				{
					var filterStrat = new Array();

					if(itemId != null && itemId != '')
						filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', itemId));
					if(WhLocation != null && WhLocation != '')
						filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', WhLocation));
					if(binInternalId != null && binInternalId!= '')
						filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', binInternalId));

					objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterStrat, null);
				}
			}
			else
			{
				//Inventorystatus Feature is enabled
				if(inventoryStatusFeature == true)
				{
					if(lotorserialNum != null && lotorserialNum != '' && lotorserialNum != 'null'  && lotorserialNum != 'undefined')
					{
						var filterStrat = new Array();

						if(itemId != null && itemId != '')
							filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', itemId));
						if(WhLocation != null && WhLocation != '')
							filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', WhLocation));
						if(binInternalId != null && binInternalId != '')
							filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));


						nlapiLogExecution('Debug', 'inside lotorserialfilter',lotorserialNum); 
						filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', lotorserialNum));

						var columnStrat=new Array();

						columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
						columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
						columnStrat[0].setSort(true);

						var objLotDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
						if(objLotDetails!=null && objLotDetails!='')
						{
							if(objLotDetails.length>0)
							{
								lotInternalId = objLotDetails[0].getValue('inventorynumber','inventoryNumberBinOnHand');

							}
						}
					}

					nlapiLogExecution('Debug', 'lotInternalId',lotInternalId); 
					var filterPrefInv = new Array();

					if(itemId != null && itemId != '')
						filterPrefInv.push(new nlobjSearchFilter('internalid','item', 'anyof', itemId));
					if(WhLocation!= null && WhLocation!= '')
						filterPrefInv.push(new nlobjSearchFilter('location',null, 'anyof', WhLocation));
					if(binInternalId != null && binInternalId!= '')
						filterPrefInv.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
					if(inventoryStatus != null && inventoryStatus!= '')
						filterPrefInv.push(new nlobjSearchFilter('status',null, 'anyof', inventoryStatus));
					if(lotInternalId != null && lotInternalId != '' && lotInternalId != 'null'  && lotInternalId != 'undefined')
					{
						filterPrefInv.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', lotInternalId));
					}

					objBinDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterPrefInv, null);
				}
				else
				{

					var filterStrat = new Array();

					if(itemId != null && itemId != '')
						filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', itemId));
					if(WhLocation != null && WhLocation != '')
						filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', WhLocation));
					if(binInternalId != null && binInternalId != '')
						filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));

					if(lotorserialNum != null && lotorserialNum != '' && lotorserialNum != 'null'  && lotorserialNum != 'undefined')
					{
						nlapiLogExecution('ERROR', 'inside lotorserialfilter',lotorserialNum); 
						filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', lotorserialNum));
					}


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
						var availableQty=0;
						var vinventorynumber='';
						if(inventoryStatusFeature == true)
						{
							availableQty=objBinDetails[0].getValue('available',null,'sum');
							vinventorynumber=objBinDetails[0].getText('inventorynumber',null,'group');
							lotInternalId = objBinDetails[0].getValue('inventorynumber',null,'group');
						}
						else
						{
							availableQty=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
							vinventorynumber=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');
						}

						nlapiLogExecution('Debug', 'availableQty',availableQty);
						nlapiLogExecution('Debug', 'vinventorynumber',vinventorynumber);
						nlapiLogExecution('Debug', 'lotorserialNum',lotorserialNum);
						if(lotorserialNum != null && lotorserialNum != '' && lotorserialNum != 'null'  && lotorserialNum != 'undefined')
						{
							if(vinventorynumber != lotorserialNum)
							{
								throw  'Lot/Serial '+ lotorserialNum + ' is not available';

							}
						}

					}
					else
					{
						objBinDetails='';
					}
				}

			}

			if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' ||
					objBinDetails.length == null)
			{
				throw  'Insufficient inventory for this item and bin combination';

			}
			else
			{
				if(objBinDetails.length > 0)
				{
					nlapiLogExecution('ERROR', 'objBinDetails.length',objBinDetails.length); 
					var qtyFlag="F";

					if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem"
						|| itemType=="serializedassemblyitem")
					{
						//Inventorystatus Feature is enabled
						if(inventoryStatusFeature == true)
						{

							var vOpenPickDetails=getOPenTaskPickBinDetails(itemId,binInternalId,WhLocation,vUnitType,StockUnitText,lotorserialNum,inventoryStatus);
							var vOpenPickQty=0;
							var vBinOpenTaskBinQtyArr = "";
							var vBinQtyAvail = 0;
							var vBinStatusArr = '';
							if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
							{
								vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
								vOpenPickQty = vOpenPickDetails[1];
								vBinStatusArr = vOpenPickDetails[3];
								nlapiLogExecution('Debug', 'vOpenPickQty',vOpenPickQty); 
								nlapiLogExecution('Debug', 'vBinStatusArr',vBinStatusArr); 

							}
							if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
								vOpenPickQty =0;
						 

							if((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem"))
							{
								for(var binItr=0;binItr<objBinDetails.length;binItr++)
								{
									var	availQty = objBinDetails[binItr].getValue('available',null,'sum');							
									vBinQtyAvail= parseFloat(vBinQtyAvail)+parseFloat(availQty);
									var vBinText=objBinDetails[binItr].getText('binnumber',null,'group');									
									vBinQtyAvail = parseFloat((parseFloat(vBinQtyAvail)*parseFloat(getStockConversionRate)).toFixed(5));
								}
								nlapiLogExecution('Debug', 'vBinQtyAvail',vBinQtyAvail);
								nlapiLogExecution('Debug', 'enteredQty',enteredQty);
								vBinQtyAvail = parseFloat(vBinQtyAvail)-parseFloat(vOpenPickQty);
								if(parseFloat(enteredQty) <= vBinQtyAvail)
								{
									qtyFlag="T";

								}
							}
							else
							{
								for(var binItr=0;binItr<objBinDetails.length;binItr++)
								{
									var	availQty = objBinDetails[binItr].getValue('available',null,'sum');							
									vBinQtyAvail= parseFloat(vBinQtyAvail)+parseFloat(availQty);
									var vBinText=objBinDetails[binItr].getText('binnumber',null,'group');
									vBinQtyAvail = parseFloat(vBinQtyAvail)-parseFloat(vOpenPickQty);
									vBinQtyAvail = parseFloat((parseFloat(vBinQtyAvail)*parseFloat(getStockConversionRate)).toFixed(5));
									if(parseFloat(enteredQty) <= vBinQtyAvail)
									{
										qtyFlag="T";
										break;
									}
								}
							}

						}
						else
						{
							var vOpenPickDetails=getOPenTaskPickBinDetails(itemId,binInternalId,WhLocation,vUnitType,
									StockUnitText,lotorserialNum);
							var vOpenPickQty=0;
							var vBinOpenTaskBinQtyArr = "";
							var vBinQtyAvail = 0;
							if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
							{
								vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
								vOpenPickQty = vBinOpenTaskBinQtyArr[0];
							}
							if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
								vOpenPickQty =0;
							nlapiLogExecution('ERROR', 'vOpenPickQty',vOpenPickQty); 
							for(var p=0;p<objBinDetails.length;p++)
							{
								var	availQty = objBinDetails[p].getValue('quantityavailable','binonhand');							
								vBinQtyAvail= parseFloat(vBinQtyAvail)+parseFloat(availQty);
								var vBinText=objBinDetails[p].getText('binnumber','binonhand');
								nlapiLogExecution('ERROR', 'vBinQtyAvail',vBinQtyAvail);
								nlapiLogExecution('ERROR', 'vBinText',vBinText); 
								vBinQtyAvail = parseFloat(vBinQtyAvail)-parseFloat(vOpenPickQty);
								vBinQtyAvail = parseFloat((parseFloat(vBinQtyAvail)*parseFloat(getStockConversionRate)).toFixed(5));
								if(parseFloat(enteredQty) <= vBinQtyAvail)
								{
									qtyFlag="T";
									break;
								}
							}
						}

					}
					else
					{	

						var systemRule_AllowExpiredItems=' ';
						systemRule_AllowExpiredItems = getSystemRuleValue('Allow picking of expired items?',WhLocation);
						nlapiLogExecution("Error","systemRule_AllowExpiredItems" , systemRule_AllowExpiredItems);
						if(systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
						{
							//Inventorystatus Feature is enabled
							var searchresultsExp = null;
							if(inventoryStatusFeature == true)
							{
								var filterPrefInv = new Array();

								if(itemId != null && itemId != '')
									filterPrefInv.push(new nlobjSearchFilter('internalid','item', 'anyof', itemId));
								if(WhLocation!= null && WhLocation!= '')
									filterPrefInv.push(new nlobjSearchFilter('location',null, 'anyof', WhLocation));
								if(binInternalId != null && binInternalId!= '')
									filterPrefInv.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
								if(inventoryStatus != null && inventoryStatus!= '')
									filterPrefInv.push(new nlobjSearchFilter('status',null, 'anyof', inventoryStatus));

								filterPrefInv.push(new nlobjSearchFilter('expirationdate','inventorynumber', 'onorafter',DateStamp()));
								if(lotInternalId != null && lotInternalId != '' && lotInternalId != 'null'  && lotInternalId != 'undefined')
								{
									filterPrefInv.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', lotInternalId));
								}

								searchresultsExp = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterPrefInv, null);
							}
							else
							{

								var filtersExp = new Array();
								if (itemId != null && itemId != ""){
									filtersExp.push(new nlobjSearchFilter('internalid', null, 'anyof', itemId));		 
								}
								if(WhLocation != null && WhLocation != '' && WhLocation != 'null' && WhLocation != 'undefined')
									filtersExp.push(new nlobjSearchFilter('location', 'inventorynumber', 'anyof', WhLocation));


							if((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '') && (AllowAllLots != 'T'))
							{
							filtersExp.push(new nlobjSearchFilter('formuladate',null, 'onorafter',DateStamp()).setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
							}
								if(lotorserialNum != null && lotorserialNum != '' && lotorserialNum != 'null'  && lotorserialNum != 'undefined')
								{
									filtersExp.push(new nlobjSearchFilter('inventorynumber','inventorynumber', 'is', lotorserialNum));
								}


								var columnsExp = new Array(); 
								searchresultsExp = nlapiSearchRecord('item', 'customsearch_wmsse_expdate_lots', filtersExp, columnsExp);
							}
							if(searchresultsExp == null || searchresultsExp == '' )
							{
								throw 'Expiry date for the given lot is less than current date';

							}
						}

						var vOpenPickDetails=getOPenTaskPickBinDetailsLot(itemId,binInternalId,WhLocation,vUnitType,StockUnitText,null,inventoryStatus);
						var vBinOpenLotArr="";
						var vBinOpenTaskBinQtyArr = "";
						var vBinOpenTaskLotArr = "";
						var vOpenPickQty=0;
						var vBinQtyAvail = 0;
						if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
						{
							vBinOpenLotArr = vOpenPickDetails[3];

							vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
							vBinOpenTaskLotArr = vOpenPickDetails[3];
							if(vBinOpenTaskLotArr.indexOf(lotorserialNum) != -1)
								vOpenPickQty = vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(lotorserialNum)];
							if(inventoryStatusFeature == true)
							{
								vBinQtyAvail=objBinDetails[0].getValue('available',null,'sum');
							}
							else
							{
								vBinQtyAvail=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
							}

							vBinQtyAvail = parseFloat(vBinQtyAvail)-parseFloat(vOpenPickQty);
							vBinQtyAvail = parseFloat((parseFloat(vBinQtyAvail)*parseFloat(getStockConversionRate)).toFixed(5));
							if(parseFloat(enteredQty) <= vBinQtyAvail)
							{
								qtyFlag="T";

							}

						}

						for(var p=0;p<objBinDetails.length;p++)
						{
							var vBinQtyAvail ='';
							var vBinText='';
							var vInvLot='';
							if(inventoryStatusFeature == true)
							{
								vBinQtyAvail = objBinDetails[p].getValue('available',null,'sum');
								vBinText=objBinDetails[p].getText('binnumber',null,'group');
								vInvLot=objBinDetails[p].getText('inventorynumber',null,'group');
							}
							else
							{
								vBinQtyAvail = objBinDetails[p].getValue('quantityavailable','inventoryNumberBinOnHand');
								vBinText=objBinDetails[p].getText('binnumber','inventoryNumberBinOnHand');
								vInvLot=objBinDetails[p].getText('inventorynumber','inventoryNumberBinOnHand');
							}
							var vOpenPickQty=0;
							for(var m=0;m<vBinOpenLotArr.length;m++)
							{ 
								var vOpenLot=vOpenPickDetails[3][m];
								if(vInvLot==vOpenLot)
								{
									vOpenPickQty=vOpenPickDetails[1][m];
									break;
								} 
							}
							if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
								vOpenPickQty =0;
							nlapiLogExecution('ERROR', 'vOpenPickQty',vOpenPickQty);
							nlapiLogExecution('ERROR', 'vBinQtyAvail,getStockConversionRate else',vBinQtyAvail+","+getStockConversionRate); 
							nlapiLogExecution('ERROR', 'vBinText else',vBinText);
							vBinQtyAvail = parseFloat(vBinQtyAvail)-parseFloat(vOpenPickQty);
							vBinQtyAvail = parseFloat((parseFloat(vBinQtyAvail)*parseFloat(getStockConversionRate)).toFixed(5));
							if(parseFloat(enteredQty) <= vBinQtyAvail)
							{
								qtyFlag="T";
								break;
							}
						}


					}
					nlapiLogExecution('ERROR', 'qtyFlag',qtyFlag);
					if(qtyFlag=="F")
					{

						throw 'Insufficient inventory for this item and bin combination';

					}

				}
			}


			var lockfilters=new Array();
			if(itemId != null && itemId != '' && itemId != 'null' && itemId != 'undefined')
			{
				lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',itemId));
			}
			if(binInternalId != null && binInternalId != '' && binInternalId != 'null' && binInternalId != 'undefined')
			{
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
			}
			lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
			if(WhLocation != null && WhLocation != '' && WhLocation != 'null' && WhLocation != 'undefined')
			{
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_locklocation',null,'anyof',WhLocation));
			}

			if(lotorserialNum != null && lotorserialNum != '' && lotorserialNum != 'null'  && lotorserialNum != 'undefined')
			{
				//nlapiLogExecution('ERROR', 'inside lotorserialfilter',lotorserialNum); 
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_seriallot',null, 'is', lotorserialNum));
			}
			if(inventoryStatus != null && inventoryStatus != '' && inventoryStatus != 'null' && inventoryStatus != 'undefined')
			{
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_invtstatus',null,'anyof',inventoryStatus));
			}


			var lockcolumns=new Array();
			lockcolumns.push(new nlobjSearchColumn('custrecord_wmse_lock_sku',null,'group'));
			lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_lock_binlocation',null,'group'));
			lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_locklocation',null,'group'));
			lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_lock_seriallot',null,'group'));
			lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_lockqty',null,'sum'));

			var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', null, lockfilters, lockcolumns);
			nlapiLogExecution('Debug', 'lockresults', lockresults);
			if(lockresults!=null && lockresults!='' && lockresults != 'null' && lockresults != 'undefined')
			{

				var lot = lockresults[0].getValue('custrecord_wmsse_lock_seriallot',null,'group');			
				var totalLockQty = lockresults[0].getValue('custrecord_wmsse_lockqty',null,'sum');
				nlapiLogExecution('Debug', 'totalLockQty', totalLockQty);
				if(totalLockQty == null || totalLockQty == '' || totalLockQty == 'null' || totalLockQty == 'undefined')
				{
					totalLockQty = 0;
				}
				if(enteredQty == null || enteredQty == '' || enteredQty == 'null' || enteredQty == 'undefined')
				{
					enteredQty = 0;
				}

				nlapiLogExecution('Debug', 'enteredQty', enteredQty);
				nlapiLogExecution('Debug', 'vBinQtyAvail', vBinQtyAvail);

				if((parseFloat(totalLockQty) + parseFloat(enteredQty)) > (parseFloat(vBinQtyAvail)))
				{
					throw   'Insufficient Quantity.';
				}

			}

			lockresults=null;									
			lockfilters=null;
		}
	}

}




