/**
 * Script Description:
 * This user event script used to validate the Inventory Adjustment process
 */
/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function inventoryAdjustmentValidation(type)
{
	var context = nlapiGetContext();

	nlapiLogExecution('ERROR','Remaining usage at the start',context.getRemainingUsage());
	var getOPenTaskPickQty = '';
	var trantype = nlapiGetRecordType();
	nlapiLogExecution('ERROR', 'trantype', trantype);
	nlapiLogExecution('ERROR', 'type', type);

	var oldRecordDetails=new Array();
	var vDiffQty=0;

	nlapiLogExecution('ERROR','Remaining usage at the start',context.getRemainingUsage());
	if ((type == 'create' || type == 'edit') && context.getExecutionContext()=='userinterface' )	
	{
		try
		{
			var itemType ='';
			var itemSearchResults="";
			var vUnitType ='';
			var stockUnitText ='';
			
			// type =edit :Need to get Old record details
			if(type == 'edit')
				oldRecordDetails = GetDetailsforOldRecord();
			nlapiLogExecution('ERROR', 'oldRecordDetails', oldRecordDetails);
			nlapiLogExecution('ERROR', 'line count', nlapiGetLineItemCount('inventory'));
			var errItem = new Array();
			var errItem1="";
			for(var invIterator =1; invIterator <= nlapiGetLineItemCount('inventory'); invIterator++)
			{

				var warehouselocId = nlapiGetLineItemValue('inventory', 'location', invIterator);
				var filters = new Array();
				filters.push(new nlobjSearchFilter('internalid', null, 'is',warehouselocId));
				filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site', null, 'is','T'));
				var columns = new Array();
				columns.push(new nlobjSearchColumn('name'));
				columns.push(new nlobjSearchColumn('custrecord_wmsse_make_wh_site'));
				var locationSearchResults = nlapiSearchRecord('location',null, filters, columns);
			
				if(locationSearchResults != null && locationSearchResults!="" && locationSearchResults!='null')		
				{

					var adjustmentqty = nlapiGetLineItemValue('inventory', 'adjustqtyby', invIterator);
					
					if(adjustmentqty<0)
					{
						var vBinQtyAvail=0;
						var lineNo = invIterator;
						var vBinArray=new Array();
						var vRecordBinArray=new Array();
						var vItemEnter = nlapiGetLineItemText('inventory', 'item', invIterator);
						
						var vItemId = nlapiGetLineItemValue('inventory', 'item', invIterator);





					

						var invDetailSubrecord = nlapiViewLineItemSubrecord('inventory', 'inventorydetail',invIterator);							
						var invDetSublength = invDetailSubrecord.getLineItemCount('inventoryassignment');	
					

						itemType = nswms_GetItemType(vItemId,warehouselocId);

						var logmsg = 'vItemEnter. = ' + vItemEnter + '<br>';
						logmsg = logmsg + 'vItemId. = ' + vItemId + '<br>';
						logmsg = logmsg + 'vPreferBinId. = ' + vPreferBinId + '<br>';
						logmsg = logmsg + 'invDetailSubrecord. = ' + invDetailSubrecord + '<br>';
						logmsg = logmsg + 'invDetSublength. = ' + invDetSublength + '<br>';
						logmsg = logmsg + 'itemType. = ' + itemType + '<br>';
						logmsg = logmsg + 'lineNo. = ' + lineNo + '<br>';
						nlapiLogExecution('Debug', 'Values :', logmsg);

						if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem' 
							&& itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
						{

							for(var invtDetailItr =1; invtDetailItr<= invDetSublength; invtDetailItr++)
							{
								var vFlag="T";

								var vFromBin = invDetailSubrecord.getLineItemText('inventoryassignment','binnumber', invtDetailItr);
								var vFromBinId = invDetailSubrecord.getLineItemValue('inventoryassignment','binnumber', invtDetailItr);								
								var vMoveQty = invDetailSubrecord.getLineItemValue('inventoryassignment','quantity', invtDetailItr);	
								var vLotSerialNumber = invDetailSubrecord.getLineItemText('inventoryassignment','issueinventorynumber', invtDetailItr);
								var vLotSerialNumberId = invDetailSubrecord.getLineItemValue('inventoryassignment','issueinventorynumber', invtDetailItr);
								var invtDetailsInternalId = invDetailSubrecord.getLineItemValue('inventoryassignment','internalid',invtDetailItr);
								var availableInvt = invDetailSubrecord.getLineItemValue('inventoryassignment','quantityavailable',invtDetailItr);


								var str1 = 'vFromBin. = ' + vFromBin + '<br>';
								str1 = str1 + 'vFromBinId. = ' + vFromBinId + '<br>';							
								str1 = str1 + 'vMoveQty. = ' + vMoveQty + '<br>';
								str1 = str1 + 'vLotSerialNumber. = ' + vLotSerialNumber + '<br>';
								str1 = str1 + 'vLotSerialNumberId. = ' + vLotSerialNumberId + '<br>';
								str1 = str1 + 'invtDetailsInternalId. = ' + invtDetailsInternalId + '<br>';
								str1 = str1 + 'itemType. = ' + itemType + '<br>';
								str1 = str1 + 'availableInvt. = ' + availableInvt + '<br>';

								nlapiLogExecution('Debug', 'New Values :', str1);

								if(vLotSerialNumber == null || vLotSerialNumber == '' || vLotSerialNumber == 'null' || vLotSerialNumber == 'undefined')
									vLotSerialNumber ="";

								// To fetch the Item Quantity on hand.
								itemSearchResults=	fnGetAvailableQuantites(vItemId,warehouselocId,vFromBinId,vLotSerialNumber,itemType);
								if(itemSearchResults != null && itemSearchResults !='')
								{
									for(var invItemItr=0;invItemItr<itemSearchResults.length;invItemItr++)
									{
										vUnitType = itemSearchResults[invItemItr].getText('unitstype');
										stockUnitText = itemSearchResults[invItemItr].getText('stockunit');	

										if(itemType == "inventoryitem" || itemType=="assemblyitem")
											vBinQtyAvail=itemSearchResults[invItemItr].getValue('quantityavailable','binonhand');																	
										else
											vBinQtyAvail=itemSearchResults[invItemItr].getValue('quantityavailable','inventoryNumberBinOnHand');

																

									}	
								}			

								nlapiLogExecution('Debug', 'vUnitType,stockUnitText,', vUnitType+','+stockUnitText);
								nlapiLogExecution('Debug', 'vBinQtyAvail', vBinQtyAvail);	


								var getOPenTaskPickQty = null;
								var pickBinDetailsLot = new Array();						

								if(type == 'edit')
								{
									nlapiLogExecution('Debug', 'Remaining Usage at the start of Edit', context.getRemainingUsage());
									var vQuantityFlag="";// Indicate that quantity is Increase/Decrease
									if(oldRecordDetails !=null && oldRecordDetails !='' && oldRecordDetails.length>0)
									{
										//Array ::[InventorydetailsIntenalId,Itemid FromBin, ToBind,Quantity,Lot/Serial,Lot/SerialId];

										for(var P=0;P<oldRecordDetails.length;P++)
										{
											var oldInvtDetailInternalId =oldRecordDetails[P][0];
											var oldItem =oldRecordDetails[P][1];									
											var oldFromBin =oldRecordDetails[P][2];
											var oldQuantity =oldRecordDetails[P][3];
											var oldLotSerial =oldRecordDetails[P][4];
											var oldLotSerialId =oldRecordDetails[P][5];

											var str = 'oldItem. = ' + oldItem + '<br>';
											str = str + 'oldInvtDetailInternalId. = ' + oldInvtDetailInternalId + '<br>';
											str = str + 'invtDetailsInternalId. = ' + invtDetailsInternalId + '<br>';
											str = str + 'oldFromBin. = ' + oldFromBin + '<br>';
											str = str + 'oldLotSerial. = ' + oldLotSerial + '<br>';
											str = str + 'oldQuantity. = ' + oldQuantity + '<br>';
											str = str + 'vMoveQty. = ' + vMoveQty + '<br>';
											str = str + 'oldLotSerialId. = ' + oldLotSerialId + '<br>';

											nlapiLogExecution('Debug', 'Type:EDIT :', str);

											if((parseInt(oldInvtDetailInternalId)== parseInt(invtDetailsInternalId)) && (invtDetailsInternalId !='-1'))
											{ 

												nlapiLogExecution('Debug', 'vMoveQty' ,vMoveQty);	
												nlapiLogExecution('Debug', 'vDiffQty' ,vDiffQty);	
												if ((itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
														||(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem"))
												{
													if(oldLotSerial != vLotSerialNumber)
													{
														//check oldLot# with Tobin for open picks
														var currentRow1=[vFromBinId,vLotSerialNumber,vMoveQty];
														vRecordBinArray.push(currentRow1);
														vBinArray.push(vFromBinId);
														vFlag="F";

													}
													else if(vFromBinId!=oldFromBin)
													{
														nlapiLogExecution('Debug', 'FromBin change', vFromBinId);
													
														var currentRow=[vFromBinId,vLotSerialNumber,vMoveQty];
														vRecordBinArray.push(currentRow);
														vBinArray.push(vFromBinId);
														vFlag="F";
													}
												}											
												else
												{

													if(vFromBinId!=oldFromBin)// FromBin change
													{
														nlapiLogExecution('Debug', 'FromBin change', vFromBinId);
														var currentRow1=[vFromBinId,"",vMoveQty];
														vRecordBinArray.push(currentRow1);
														vBinArray.push(vFromBinId);
														vFlag="F";
														nlapiLogExecution('Debug', 'vBinArray', vBinArray);
													}
												}
												break;
											}
										}

									}
								}							
								if(vFlag=="T")
								{							
									nlapiLogExecution('Debug', 'vFromBinId:', vFromBinId);
									if(vBinArray.indexOf(vFromBinId) ==-1)
										vBinArray.push(vFromBinId);
								}


								

								if (itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
								{
									getOPenTaskPickQty=getOPenTaskPickBinDetails(vItemId,vBinArray,warehouselocId,vUnitType,stockUnitText,vLotSerialNumber);
									nlapiLogExecution('Debug', 'getOPenTaskPickQty', getOPenTaskPickQty);
								}
								else if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
								{
									pickBinDetailsLot=getOPenTaskPickBinDetailsLot(vItemId,vBinArray,warehouselocId,vUnitType,stockUnitText);
									nlapiLogExecution('Debug', 'pickBinDetailsLot', pickBinDetailsLot);

								}

								if(vFlag=="F")
								{
									nlapiLogExecution('Debug', 'Remaining Usage at the start of Openpicks check',context.getRemainingUsage() );
									errItem1 =fnCheckforOpenPicks(pickBinDetailsLot,getOPenTaskPickQty,vRecordBinArray,vItemId,warehouselocId,errItem,vItemEnter,itemType,lineNo,type);
									nlapiLogExecution('Debug', 'errItem1', errItem1);
									nlapiLogExecution('Debug', 'Remaining Usage at the End of Openpicks check', context.getRemainingUsage());
									if(errItem1 !=null && errItem1 !='')
										break;
								}
								else
								{

									var validationQty = 0;
									var vOpenPickQty =0;
									if (itemType == 'inventoryitem' || itemType == 'assemblyitem' || itemType == 'serializedinventoryitem' || itemType=='serializedassemblyitem')
									{					
										if(getOPenTaskPickQty!=null && getOPenTaskPickQty!="" && getOPenTaskPickQty!="null")
										{
											var arrLengthPickQty=getOPenTaskPickQty[1].length;
											var arrLengthBin=getOPenTaskPickQty[2].length;
											nlapiLogExecution('Debug', 'arrLengthPickQty', arrLengthPickQty);
											var arrQtyValue=getOPenTaskPickQty[1];
											nlapiLogExecution('Debug', 'arrQtyValue', arrQtyValue);
											var arrBin=getOPenTaskPickQty[0];
											var indexOfQtyValue="";
											for(var iterator = 0; iterator < arrLengthBin; iterator++)
											{
												if(arrBin[iterator]==vFromBinId)
												{
													indexOfQtyValue=iterator;
													break;
												}
											}
											vOpenPickQty=arrQtyValue[indexOfQtyValue];
											nlapiLogExecution('Debug', 'vOpenPickQty', vOpenPickQty);
											if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
												vOpenPickQty =0;
											validationQty = Number(Big(vBinQtyAvail).minus(vOpenPickQty));
											nlapiLogExecution('ERROR', 'validationQty', validationQty);
										}
									}

									if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
									{
										nlapiLogExecution('Debug', 'vLotSerialNumber', vLotSerialNumber);									
										nlapiLogExecution('Debug', 'vFromBinId', vFromBinId);	

										var vBinOpenTaskBinQtyArr='';
										var vBinOpenTaskLotArr='';
										var vOpenPickQty=0;
										if(pickBinDetailsLot!=null&&pickBinDetailsLot!=""&&pickBinDetailsLot!="null")
										{
											nlapiLogExecution('Debug', 'pickBinDetailsLot', pickBinDetailsLot);									
											vBinOpenTaskBinQtyArr = pickBinDetailsLot[1];
											vBinOpenTaskLotArr = pickBinDetailsLot[3];
											if(vBinOpenTaskLotArr.indexOf(vLotSerialNumber) != -1)
												vOpenPickQty = vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(vLotSerialNumber)];

											nlapiLogExecution('Debug', 'vBinOpenTaskBinQtyArr', vBinOpenTaskBinQtyArr);
											nlapiLogExecution('Debug', 'vBinOpenTaskLotArr', vBinOpenTaskLotArr);
											nlapiLogExecution('Debug', 'vOpenPickQty', vOpenPickQty);

											if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
												vOpenPickQty =0;

											validationQty = Number(Big(vBinQtyAvail).minus(vOpenPickQty));

											nlapiLogExecution('Debug', 'validationQty', validationQty);
										}
									}	
									
									var checkmoveqty=getNumber(vMoveQty);
									nlapiLogExecution('Debug', 'checkmoveqty', checkmoveqty);
									if((parseFloat(checkmoveqty) > parseFloat(validationQty)) && (validationQty !=0 || parseFloat(vOpenPickQty)>0))								
									{

										errItem.push(" item: ");
										errItem.push( vItemEnter);
										errItem.push(", line no: ");
										errItem.push(invtDetailItr);
										errItem.push("        ");

										for(var a=0; a<errItem.length; a++)
										{
											errItem1+=errItem[a];
											nlapiLogExecution('ERROR', 'errItem1', errItem1);
										}
										nlapiLogExecution('ERROR', 'errItem test', errItem1);
										break;
									}
								}//end of checkbins;
							}
						}
					}
					if(vRecordBinArray !=null && vRecordBinArray !='' && vRecordBinArray.length>0)
						vRecordBinArray =[];
					if(vBinArray !=null && vBinArray !='' && vBinArray.length>0)
						vBinArray =[];
					if(errItem1 !=null && errItem1 !='')
						break;
					nlapiLogExecution('ERROR','Remaining usage at the End',context.getRemainingUsage());

				}

			}
			if(errItem.length > 0)			
			{
				nlapiLogExecution('ERROR', 'errItem1', errItem1);
				var cannotDelError = nlapiCreateError('Cannot Receive',	'Please enter valid quantity for  '+errItem1+'   ', true);
				throw cannotDelError;  
			}
		}
		catch(e)
		{
			nlapiLogExecution('ERROR', 'Type:Create/Edit exception', e);
			var erroremsg = nlapiCreateError('',e, true);
			throw erroremsg;
		}
	}
	else if(type == 'delete'&& context.getExecutionContext()=='userinterface' )	
	{

		try
		{

			var oldRecord = nlapiGetOldRecord();
			nlapiLogExecution('ERROR', 'oldRecord', oldRecord);	
			var errItem = new Array();
			var errorMessage="";
			var ermsg="";

			var vLintcount = oldRecord.getLineItemCount('inventory');
			nlapiLogExecution('ERROR', 'vLintcount', vLintcount);	

			for(var deleteLineItr=1;deleteLineItr<=vLintcount; deleteLineItr++)
			{

				var warehouselocId = nlapiGetLineItemValue('inventory', 'location', deleteLineItr);
				var filters = new Array();
				filters.push(new nlobjSearchFilter('internalid', null, 'is',warehouselocId));
				filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site', null, 'is','T'));
				var columns = new Array();
				columns.push(new nlobjSearchColumn('name'));
				columns.push(new nlobjSearchColumn('custrecord_wmsse_make_wh_site'));
				var locationSearchResults = nlapiSearchRecord('location',null, filters, columns);
				nlapiLogExecution('ERROR', 'locationSearchResults', locationSearchResults.length);
				if(locationSearchResults != null && locationSearchResults!="" && locationSearchResults!='null')		
				{
					var adjustmentqty = nlapiGetLineItemValue('inventory', 'adjustqtyby', deleteLineItr);
					nlapiLogExecution('ERROR', 'Adjustmentqty', adjustmentqty);
					if(adjustmentqty>0)
					{
						var lineNo=deleteLineItr;
						var getOPenTaskPickQty='';
						var pickBinDetailsLot='';
						var vRecordBinArray=new Array();
						var vItemEnter = oldRecord.getLineItemText('inventory', 'item', deleteLineItr);
						var vItemId = oldRecord.getLineItemValue('inventory', 'item', deleteLineItr);
						var invDetailSubrecord = oldRecord.viewLineItemSubrecord('inventory', 'inventorydetail',deleteLineItr);					
						var invDetSublength = invDetailSubrecord.getLineItemCount('inventoryassignment');
						var vPreferBinId = nlapiGetLineItemText('inventory','preferredbin', deleteLineItr);
					
						
						var itemType = nswms_GetItemType(vItemId,warehouselocId);
						nlapiLogExecution('Debug', 'itemType', itemType);	

						if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem' 
							&& itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
						{
							for(var invDetailItr =1; invDetailItr<= invDetSublength; invDetailItr++)
							{
								var invtDetailsInternalId = invDetailSubrecord.getLineItemValue('inventoryassignment','internalid',invDetailItr);
								var vOldFromBin = invDetailSubrecord.getLineItemText('inventoryassignment','binnumber',invDetailItr);
								var vOldFromBinId = invDetailSubrecord.getLineItemValue('inventoryassignment','binnumber', invDetailItr);
								
								var vOldQty = invDetailSubrecord.getLineItemValue('inventoryassignment','quantity', invDetailItr);	
								var vOldLotSerialNumber = invDetailSubrecord.getLineItemText('inventoryassignment','issueinventorynumber', invDetailItr);
								var vOldLotSerialNumberId = invDetailSubrecord.getLineItemValue('inventoryassignment','issueinventorynumber', invDetailItr);

								var str = 'vOldFromBin. = ' + vOldFromBin + '<br>';
								str = str + 'vOldFromBinId. = ' + vOldFromBinId + '<br>';
								
								str = str + 'vOldQty. = ' + vOldQty + '<br>';
								str = str + 'vOldLotSerialNumber. = ' + vOldLotSerialNumber + '<br>';
								str = str + 'vOldLotSerialNumberId. = ' + vOldLotSerialNumberId + '<br>';
								str = str + 'invtDetailsInternalId. = ' + invtDetailsInternalId + '<br>';
								str = str + 'vItemId. = ' + vItemId + '<br>';

								nlapiLogExecution('Debug', 'Delete_Parameters :', str);

								/*
								if (itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{
								getOPenTaskPickQty=getOPenTaskPickBinDetails(vItemId,vOldFromBinId,warehouselocId,'','',vOldLotSerialNumber);
								nlapiLogExecution('ERROR', 'getOPenTaskPickQty', getOPenTaskPickQty);
							}
							else
							{
								if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
								{
									//pickBinDetailsLot=getOPenTaskPickBinDetailsLot(vItemId,vOldToBinId,vPreferBinId,warehouselocId);
									pickBinDetailsLot=getOPenTaskPickBinDetailsLot(vItemId,vOldFromBinId,'',warehouselocId);
									nlapiLogExecution('ERROR', 'pickBinDetailsLot', pickBinDetailsLot);
								}
							}*/

								var currentRow1=[vOldFromBinId,vOldLotSerialNumber,vOldQty];
								vRecordBinArray.push(currentRow1);

								errorMessage =fnCheckforOpenPicks(pickBinDetailsLot,getOPenTaskPickQty,vRecordBinArray,vItemId,warehouselocId,errItem,vItemEnter,itemType,lineNo,type);
								
								
								/*ermsg =fnCheckforOpenPicks(pickBinDetailsLot,getOPenTaskPickQty,vRecordBinArray,vItemId,warehouselocId,errItem,vItemEnter,itemType,lineNo,type);
								if(ermsg !=null && ermsg !='')
									errorMessage+=ermsg;*/
								
								nlapiLogExecution('Debug', 'ErrorMessage1', errorMessage);
								if(errorMessage !=null && errorMessage !='')
									break;


							}
						}

						if(vRecordBinArray !=null && vRecordBinArray !='' && vRecordBinArray.length>0)
							vRecordBinArray =[];
						nlapiLogExecution('Debug','Remaining usage at the End',context.getRemainingUsage());
						if(errorMessage !=null && errorMessage !='')
							break;
					}

				}
			}
			if(errItem.length > 0)			
			{
				nlapiLogExecution('ERROR', 'errorMessage', errorMessage);
				var cannotDelError = nlapiCreateError('CannotDelete',	'Please Do not Delete the Inventory Adjustement, Some Openpicks are available for  '+errorMessage+'   ', true);
				throw cannotDelError;  
			}


		}
		catch(ex)
		{
			nlapiLogExecution('ERROR','Type:: Delete',ex);
			var erroremsg = nlapiCreateError('',ex, true);
			throw erroremsg;
		}
	}



}



/**
 * To get OldRecord details
 * @returns {vOldrecordValueArray}
 */

function GetDetailsforOldRecord()
{


	try{
		var vOldrecordValueArray=new Array();
		var oldRecord ="";
		if(type == 'edit')
		{
			oldRecord = nlapiGetOldRecord();
			nlapiLogExecution('ERROR', 'oldRecord', oldRecord);				

			var vLintcount = oldRecord.getLineItemCount('inventory');
			nlapiLogExecution('ERROR', 'vLintcount', vLintcount);	

			for(var lineItr=1;lineItr<=vLintcount; lineItr++)
			{
				var vItemId = nlapiGetLineItemValue('inventory', 'item', lineItr);
				var invDetailSubrecord = oldRecord.viewLineItemSubrecord('inventory', 'inventorydetail',lineItr);					
				var invDetSublength = invDetailSubrecord.getLineItemCount('inventoryassignment');
				nlapiLogExecution('ERROR', 'EDIT :invDetSublength', invDetSublength);

				for(var oldInvDetailItr =1; oldInvDetailItr<= invDetSublength; oldInvDetailItr++)
				{
					var invtDetailsInternalId = invDetailSubrecord.getLineItemValue('inventoryassignment','internalid',oldInvDetailItr);
					var vOldFromBin = invDetailSubrecord.getLineItemText('inventoryassignment','binnumber',oldInvDetailItr);
					var vOldFromBinId = invDetailSubrecord.getLineItemValue('inventoryassignment','binnumber', oldInvDetailItr);
					var vOldQty = invDetailSubrecord.getLineItemValue('inventoryassignment','quantity', oldInvDetailItr);	
					var vOldLotSerialNumber = invDetailSubrecord.getLineItemText('inventoryassignment','issueinventorynumber', oldInvDetailItr);
					var vOldLotSerialNumberId = invDetailSubrecord.getLineItemValue('inventoryassignment','issueinventorynumber', oldInvDetailItr);


					var str = 'vOldFromBin. = ' + vOldFromBin + '<br>';
					str = str + 'vOldFromBinId. = ' + vOldFromBinId + '<br>';
					str = str + 'vOldQty. = ' + vOldQty + '<br>';
					str = str + 'vOldLotSerialNumber. = ' + vOldLotSerialNumber + '<br>';
					str = str + 'vOldLotSerialNumberId. = ' + vOldLotSerialNumberId + '<br>';
					str = str + 'invtDetailsInternalId. = ' + invtDetailsInternalId + '<br>';

					nlapiLogExecution('Debug', 'EDIT :', str);

					var currentRow = [invtDetailsInternalId,vItemId,vOldFromBinId,vOldQty,vOldLotSerialNumber,vOldLotSerialNumberId];

					vOldrecordValueArray.push(currentRow);

				}
			}


		}

		nlapiLogExecution('ERROR', 'vOldrecordValueArray', vOldrecordValueArray);
		return vOldrecordValueArray;

	}
	catch(exp)
	{
		nlapiLogExecution('ERROR', 'exp', exp);

	}


}


function getNumber(theNumber)
{
	if(theNumber < 0){
		return theNumber*-1;
	}else{
		return theNumber;
	}
}

/**
 * To check for openpicks for the items
 * * @param vPrefBinOpenTaskDetails
 * * @param getOPenTaskPickQty
 * * @param vRecordBinArray
 * * @param vItemId
 * * @param warehouselocId
 * * @param errItem
 * * @param vItemEnter
 * * @param itemType
 * @returns {errItem1 [error message]}
 */
function fnCheckforOpenPicks(vPrefBinOpenTaskDetails,getOPenTaskPickQty,vRecordBinArray,vItemId,warehouselocId,errItem,vItemEnter,itemType,lineNo,type)
{
	try
	{
		var vPrefBinOpenTaskLotArr = "";
		var vPrefBinOpenTaskExpDateArr = "";
		var vPrefBinOpenTaskBinIdArr = "";
		var vPrefBinOpenTaskBinQtyArr = "";
		var vnPrefBinQtyAvail=0;
		var vResultFlag="T";
		var vOpenPicksQty = 0;
		var errItem1="";
		nlapiLogExecution('ERROR', 'EDIT:CheckforOpenPicks_vRecordBinArray', vRecordBinArray);
		nlapiLogExecution('ERROR', 'EDIT:vPrefBinOpenTaskDetails', vPrefBinOpenTaskDetails);
		//var vRecordBinArray=[vFromBinId,vLotSerialNumber,vDiffQty];
		if(vRecordBinArray !=null && vRecordBinArray !='' && vRecordBinArray.length>0)
		{
			if(vPrefBinOpenTaskDetails != null && vPrefBinOpenTaskDetails!='' &&
					vPrefBinOpenTaskDetails != 'null' && vPrefBinOpenTaskDetails.length > 0)
			{
				vPrefBinOpenTaskBinIdArr = vPrefBinOpenTaskDetails[0];
				vPrefBinOpenTaskBinQtyArr = vPrefBinOpenTaskDetails[1];
				vPrefBinOpenTaskLotArr = vPrefBinOpenTaskDetails[3];
				vPrefBinOpenTaskExpDateArr = vPrefBinOpenTaskDetails[4];
			}

			for(var index=0;index<vRecordBinArray.length>0;index++)
			{
				var vBinQtyAvail=0;
				var vUnitType ='';
				var stockUnitText ='';
				var vFromBinId = vRecordBinArray[index][0];
				var vLotSerialNumber = vRecordBinArray[index][1];
				var vMoveQty =vRecordBinArray[index][2];
				var itemSearchResults = fnGetAvailableQuantites(vItemId,warehouselocId,vFromBinId,vLotSerialNumber,itemType);

				if(itemSearchResults != null && itemSearchResults !='')
				{
					for(var invntItr=0;invntItr<itemSearchResults.length;invntItr++)
					{
						vUnitType = itemSearchResults[invntItr].getText('unitstype');
						stockUnitText = itemSearchResults[invntItr].getText('stockunit');	

						if(itemType == "inventoryitem" || itemType=="assemblyitem")
							vBinQtyAvail=itemSearchResults[invntItr].getValue('quantityavailable','binonhand');										
						else
							vBinQtyAvail=itemSearchResults[invntItr].getValue('quantityavailable','inventoryNumberBinOnHand');

						nlapiLogExecution('ERROR', 'vBinQtyAvail', vBinQtyAvail);										

					}	
				}	

				if(type == 'delete')
				{
					if (itemType == "inventoryitem" || itemType == "assemblyitem")
					{
						getOPenTaskPickQty=getOPenTaskPickBinDetails(vItemId,vFromBinId,warehouselocId,vUnitType,stockUnitText,vLotSerialNumber);
						nlapiLogExecution('ERROR', 'getOPenTaskPickQty', getOPenTaskPickQty);
					}
					else
					{
						if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
						{
							vPrefBinOpenTaskDetails=getOPenTaskPickBinDetailsLot(vItemId,vFromBinId,warehouselocId,vUnitType,stockUnitText);
							nlapiLogExecution('ERROR', 'vPrefBinOpenTaskDetails', vPrefBinOpenTaskDetails);
							if(vPrefBinOpenTaskDetails != null && vPrefBinOpenTaskDetails!='' &&
									vPrefBinOpenTaskDetails != 'null' && vPrefBinOpenTaskDetails.length > 0)
							{
								vPrefBinOpenTaskBinIdArr = vPrefBinOpenTaskDetails[0];
								vPrefBinOpenTaskBinQtyArr = vPrefBinOpenTaskDetails[1];
								vPrefBinOpenTaskLotArr = vPrefBinOpenTaskDetails[3];
								vPrefBinOpenTaskExpDateArr = vPrefBinOpenTaskDetails[4];
							}
						}
					}
				}

				if (itemType == 'serializedinventoryitem' || itemType=='serializedassemblyitem')
					getOPenTaskPickQty=getOPenTaskPickBinDetails(vItemId,vFromBinId,warehouselocId,vUnitType,stockUnitText,vLotSerialNumber);

				var str = 'itemType. = ' + itemType + '<br>';
				str = str + 'vPrefBinOpenTaskBinIdArr. = ' + vPrefBinOpenTaskBinIdArr + '<br>';
				str = str + 'vPrefBinOpenTaskBinQtyArr. = ' + vPrefBinOpenTaskBinQtyArr + '<br>';
				str = str + 'vPrefBinOpenTaskLotArr. = ' + vPrefBinOpenTaskLotArr + '<br>';
				str = str + 'vPrefBinOpenTaskExpDateArr. = ' + vPrefBinOpenTaskExpDateArr + '<br>';
				str = str + 'vFromBinId. = ' + vFromBinId + '<br>';
				str = str + 'vLotSerialNumber. = ' + vLotSerialNumber + '<br>';
				str = str + 'warehouselocId. = ' + warehouselocId + '<br>';
				str = str + 'vMoveQty. = ' + vMoveQty + '<br>';
				str = str + 'vBinQtyAvail. = ' + vBinQtyAvail + '<br>';
				str = str + 'vUnitType. = ' + vUnitType + '<br>';
				str = str + 'stockUnitText. = ' + stockUnitText + '<br>';
				str = str + 'vItemEnter. = ' + vItemEnter + '<br>';
				str = str + 'vItemId. = ' + vItemId + '<br>';
				str = str + 'lineNo. = ' + lineNo + '<br>';

				nlapiLogExecution('Debug', 'EDIT :fnCheckforOpenPicks', str);

				if (itemType == 'inventoryitem' || itemType == 'assemblyitem' || 
						itemType == 'serializedinventoryitem' || itemType=='serializedassemblyitem')
				{					
					if(getOPenTaskPickQty!=null && getOPenTaskPickQty!="" && getOPenTaskPickQty!="null")
					{
						var arrLengthPickQty=getOPenTaskPickQty[1].length;
						var arrLengthBin=getOPenTaskPickQty[2].length;
						nlapiLogExecution('Debug', 'arrLengthPickQty', arrLengthPickQty);

						var arrQtyValue=getOPenTaskPickQty[1];
						nlapiLogExecution('Debug', 'arrQtyValue', arrQtyValue);
						var arrBin=getOPenTaskPickQty[0];
						var indexOfQtyValue="";
						for(var iterator = 0; iterator < arrLengthBin; iterator++)
						{
							if(arrBin[iterator]==vFromBinId)
							{
								indexOfQtyValue=iterator;
								break;
							}
						}
						var qtyValue=arrQtyValue[indexOfQtyValue];
						nlapiLogExecution('ERROR', 'qtyValue', qtyValue);
						vOpenPicksQty=parseFloat(qtyValue);
						nlapiLogExecution('ERROR', 'EDIT: vOpenPicksQty', vOpenPicksQty)
						if(vOpenPicksQty==null || vOpenPicksQty=='null' || vOpenPicksQty==''
							|| vOpenPicksQty =='undefined'|| isNaN(vOpenPicksQty))
							vOpenPicksQty = 0;
						vnPrefBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPicksQty));


					}
				}

				if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
				{

					if(vPrefBinOpenTaskBinIdArr != null && vPrefBinOpenTaskBinIdArr !='')
					{
						for(var prefBinOpentaskItr=0;prefBinOpentaskItr<vPrefBinOpenTaskBinIdArr.length;prefBinOpentaskItr++)
						{
							var vOpenBinId = vPrefBinOpenTaskBinIdArr[prefBinOpentaskItr];
							if(vOpenBinId == vFromBinId) //Bin comparing
							{
								var vOpenLot=vPrefBinOpenTaskDetails[3][prefBinOpentaskItr];
								if(vOpenLot == vLotSerialNumber) //Lot comparing
								{
									vOpenPicksQty=vPrefBinOpenTaskDetails[1][prefBinOpentaskItr];
									nlapiLogExecution('ERROR', 'EDIT: vOpenPicksQty', vOpenPicksQty)

									if(vOpenPicksQty==null || vOpenPicksQty=='null' || vOpenPicksQty==''
										|| vOpenPicksQty =='undefined'|| isNaN(vOpenPicksQty))
										vOpenPicksQty = 0;
									vnPrefBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPicksQty));

									break;
								} 
							}
						}
					}
				}



				
				var checkmoveqty=getNumber(vMoveQty);
				nlapiLogExecution('ERROR', 'checkmoveqty', checkmoveqty);
				if((parseFloat(checkmoveqty) > parseFloat(vnPrefBinQtyAvail)) &&  (vnPrefBinQtyAvail !=0 || parseFloat(vOpenPicksQty)>0))
				{
					errItem.push(" item: ");
					errItem.push( vItemEnter);
					errItem.push(", line no: ");
					errItem.push(lineNo);
					errItem.push("        ");


					for(var a=0; a<errItem.length; a++)
					{
						errItem1+=errItem[a];
						nlapiLogExecution('ERROR', 'errItem1', errItem1);
					}
					nlapiLogExecution('ERROR', 'errItem test', errItem1);

				}				
			}
		}
	}
	catch(e)
	{
		nlapiLogExecution('ERROR', 'exception', e);
	}

	return errItem1;

}

/**
 * To get the available quantities
 * * @param vItemId
 * * @param warehouselocId
 * * @param vFromBinId
 * * @param vLotSerialNumber
 * * @param itemType
 * * @returns {vBinQtyAvail [available quantity]}
 **/

function fnGetAvailableQuantites(vItemId,warehouselocId,vFromBinId,vLotSerialNumber,itemType)
{
	var itemSearchResults="";


	if(itemType == "inventoryitem" || itemType=="assemblyitem" )
	{
		var filters = new Array();

		if(vItemId != null && vItemId != '')
			filters.push(new nlobjSearchFilter('internalid',null, 'anyof', vItemId));
		if(warehouselocId != null && warehouselocId != '')
			filters.push(new nlobjSearchFilter('location','binonhand', 'anyof', warehouselocId));
		if(vFromBinId != null && vFromBinId!= '')
			filters.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', vFromBinId));

		itemSearchResults = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filters, null);


	}
	else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
	{

		var filters = new Array();
		if (vItemId != null && vItemId != ""){
			filters.push(new nlobjSearchFilter('internalid', null, 'is', vItemId));		 
		}
		if(warehouselocId != null && warehouselocId != '' && warehouselocId != 'null')
			filters.push(new nlobjSearchFilter('location', 'inventoryNumberBinOnHand', 'anyof', warehouselocId));
		if(vFromBinId != null && vFromBinId != '' && vFromBinId != 'null')
			filters.push(new nlobjSearchFilter('binnumber', 'inventoryNumberBinOnHand', 'anyof', vFromBinId));
		if(vLotSerialNumber != null && vLotSerialNumber != '' && vLotSerialNumber != 'null'  && vLotSerialNumber != 'undefined')
		{
			nlapiLogExecution('ERROR', 'vLotSerialNumber', vLotSerialNumber);
			filters.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', vLotSerialNumber));

		}



		itemSearchResults= nlapiSearchRecord('item', 'customsearch_wmsse_itemwise_lots_rpt', filters, null);


	}
	else
	{

		var filterStrat = new Array();

		if(vItemId != null && vItemId != '')
			filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', vItemId));
		if(warehouselocId != null && warehouselocId != '')
			filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', warehouselocId));
		if(vFromBinId != null && vFromBinId != '')
			filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', vFromBinId));

		if(vLotSerialNumber != null && vLotSerialNumber != '' && vLotSerialNumber != 'null'  && vLotSerialNumber != 'undefined')
		{
			nlapiLogExecution('ERROR', 'inside lotorserialfilter',vLotSerialNumber); 
			filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', vLotSerialNumber));
		}

		var columnStrat=new Array();
		columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
		columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
		columnStrat.push(new nlobjSearchColumn('binnumber','inventoryNumberBinOnHand'));
		columnStrat[0].setSort(true);

		itemSearchResults = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

	}
	nlapiLogExecution('ERROR', 'itemSearchResults', itemSearchResults);
	return itemSearchResults;

}
