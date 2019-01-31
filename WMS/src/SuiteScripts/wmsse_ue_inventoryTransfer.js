/**
 * Script Description:
 * This user event script used to validate the Inventory Transfer process
 */
/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function inventoryTransferValidation(type)
{
	var context = nlapiGetContext();

	nlapiLogExecution('ERROR','Remaining usage at the start',context.getRemainingUsage());
	var getOPenTaskPickQty = '';			
	var vwarehouseloc = nlapiGetFieldText('location');	
	var warehouselocId = nlapiGetFieldValue('location');
	var vToWarehouseloc = nlapiGetFieldText('transferlocation');	
	var vToWarehouselocId = nlapiGetFieldValue('transferlocation');	
	nlapiLogExecution('ERROR', 'warehouselocId', warehouselocId);	
	var trantype = nlapiGetRecordType();

	if(context.getExecutionContext()=='userinterface')
	{
		var oldRecordDetails=new Array();
		var vLocationArray=new Array();
		vLocationArray.push(warehouselocId);
		vLocationArray.push(vToWarehouselocId);
		var vDiffQty=0;
		var locationSearchResults ;
		if(warehouselocId!=null && warehouselocId!='' && warehouselocId!='null' && warehouselocId!='undefiend' )
		{
			var filters = new Array();
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof',warehouselocId));
			filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site', null, 'is','T'));
			var columns = new Array();
			columns.push(new nlobjSearchColumn('name'));
			columns.push(new nlobjSearchColumn('custrecord_wmsse_make_wh_site'));
			locationSearchResults = nlapiSearchRecord('location',null, filters, columns);	
		}
		if(locationSearchResults != null && locationSearchResults!="" && locationSearchResults!='null')		
		{
			if ((type == 'create' || type == 'edit') )	
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
						var vBinQtyAvail=0;
						var lineNo = invIterator;
						var vBinArray=new Array();
						var vRecordBinArray=new Array();
						var vItemEnter = nlapiGetLineItemText('inventory', 'item', invIterator);					
						var vItemId = nlapiGetLineItemValue('inventory', 'item', invIterator);					
						//var vPreferBin = nlapiGetLineItemValue('inventory','preferredbin', invIterator);
						//var vPreferBinId = nlapiGetLineItemText('inventory','preferredbin', invIterator);
						var invDetailSubrecord = nlapiViewLineItemSubrecord('inventory', 'inventorydetail',invIterator);					
						var invDetSublength = invDetailSubrecord.getLineItemCount('inventoryassignment');						

						itemType = nswms_GetItemType(vItemId,warehouselocId);

						var logmsg = 'vItemEnter. = ' + vItemEnter + '<br>';
						logmsg = logmsg + 'vItemId. = ' + vItemId + '<br>';
						//logmsg = logmsg + 'vPreferBinId. = ' + vPreferBinId + '<br>';
						logmsg = logmsg + 'invDetailSubrecord. = ' + invDetailSubrecord + '<br>';
						logmsg = logmsg + 'invDetSublength. = ' + invDetSublength + '<br>';
						logmsg = logmsg + 'itemType. = ' + itemType + '<br>';
						logmsg = logmsg + 'lineNo. = ' + lineNo + '<br>';
						nlapiLogExecution('ERROR', 'Values :', logmsg);

						if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem'
							&& itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
						{

							for(var invtDetailItr =1; invtDetailItr<= invDetSublength; invtDetailItr++)
							{
								var vFlag="T";
								var vFromBin = invDetailSubrecord.getLineItemText('inventoryassignment','binnumber', invtDetailItr);
								var vFromBinId = invDetailSubrecord.getLineItemValue('inventoryassignment','binnumber', invtDetailItr);
								var vToBin = invDetailSubrecord.getLineItemValue('inventoryassignment','tobinnumber', invtDetailItr);
								var vMoveQty = invDetailSubrecord.getLineItemValue('inventoryassignment','quantity', invtDetailItr);	
								var vLotSerialNumber = invDetailSubrecord.getLineItemText('inventoryassignment','issueinventorynumber', invtDetailItr);
								var vLotSerialNumberId = invDetailSubrecord.getLineItemValue('inventoryassignment','issueinventorynumber', invtDetailItr);
								var invtDetailsInternalId = invDetailSubrecord.getLineItemValue('inventoryassignment','internalid',invtDetailItr);
								var availableInvt = invDetailSubrecord.getLineItemValue('inventoryassignment','quantityavailable',invtDetailItr);


								var str1 = 'vFromBin. = ' + vFromBin + '<br>';
								str1 = str1 + 'vFromBinId. = ' + vFromBinId + '<br>';
								str1 = str1 + 'vToBin. = ' + vToBin + '<br>';
								str1 = str1 + 'vMoveQty. = ' + vMoveQty + '<br>';
								str1 = str1 + 'vLotSerialNumber. = ' + vLotSerialNumber + '<br>';
								str1 = str1 + 'vLotSerialNumberId. = ' + vLotSerialNumberId + '<br>';
								//str1 = str1 + 'vPreferBin. = ' + vPreferBin + '<br>';
								//str1 = str1 + 'vPreferBinId. = ' + vPreferBinId + '<br>';
								str1 = str1 + 'invtDetailsInternalId. = ' + invtDetailsInternalId + '<br>';
								str1 = str1 + 'itemType. = ' + itemType + '<br>';
								str1 = str1 + 'availableInvt. = ' + availableInvt + '<br>';

								nlapiLogExecution('ERROR', 'New Values :', str1);

								if(vLotSerialNumber == null || vLotSerialNumber == '' || vLotSerialNumber == 'null' || vLotSerialNumber == 'undefined')
									vLotSerialNumber ="";

								// To fetch the Item Quantity on hand.
								itemSearchResults=	fnGetAvailableQuantites(vItemId,vLocationArray,vFromBinId,vLotSerialNumber,itemType);
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

										nlapiLogExecution('ERROR', 'vBinQtyAvail', vBinQtyAvail);										

									}	
								}			

								nlapiLogExecution('ERROR', 'vUnitType,stockUnitText,', vUnitType+','+stockUnitText);
								nlapiLogExecution('ERROR', 'vBinQtyAvail', vBinQtyAvail);	

								var getOPenTaskPickQty = null;
								var pickBinDetailsLot = new Array();					
								if(type == 'edit')
								{
									nlapiLogExecution('ERROR', 'Remaining Usage at the start of Edit', context.getRemainingUsage());
									var vQuantityFlag="";// Indicate that quantity is Increase/Decrease
									if(oldRecordDetails !=null && oldRecordDetails !='' && oldRecordDetails.length>0)
									{
										//Array ::[InventorydetailsIntenalId,Itemid FromBin, ToBind,Quantity,Lot/Serial,Lot/SerialId];

										for(var P=0;P<oldRecordDetails.length;P++)
										{
											var oldInvtDetailInternalId =oldRecordDetails[P][0];
											var oldItem =oldRecordDetails[P][1];									
											var oldFromBin =oldRecordDetails[P][2];
											var oldToBin =oldRecordDetails[P][3];
											var oldQuantity =oldRecordDetails[P][4];
											var oldLotSerial =oldRecordDetails[P][5];
											var oldLotSerialId =oldRecordDetails[P][5];

											var str = 'oldItem. = ' + oldItem + '<br>';
											str = str + 'oldInvtDetailInternalId. = ' + oldInvtDetailInternalId + '<br>';
											str = str + 'invtDetailsInternalId. = ' + invtDetailsInternalId + '<br>';
											str = str + 'oldFromBin. = ' + oldFromBin + '<br>';
											str = str + 'oldLotSerial. = ' + oldLotSerial + '<br>';
											str = str + 'oldToBin. = ' + oldToBin + '<br>';
											str = str + 'oldQuantity. = ' + oldQuantity + '<br>';
											str = str + 'vMoveQty. = ' + vMoveQty + '<br>';
											str = str + 'oldLotSerialId. = ' + oldLotSerialId + '<br>';

											nlapiLogExecution('ERROR', 'Type:EDIT :', str);

											if((parseInt(oldInvtDetailInternalId) == parseInt(invtDetailsInternalId)) && (invtDetailsInternalId !='-1'))
											{ //invtDetailsInternalId =='-1 means new line is added in inventory details.

												if(parseFloat (oldQuantity)< parseFloat(vMoveQty))
												{
													nlapiLogExecution('ERROR', 'Type:EDIT Quantity is increased :');												
													vDiffQty = Number(Big(vMoveQty).minus(oldQuantity));												
													vQuantityFlag ="I";
												}
												else if(parseFloat (oldQuantity)> parseFloat(vMoveQty))
												{
													nlapiLogExecution('ERROR', 'Type:EDIT Quantity is decreased :');												
													vDiffQty = Number(Big(oldQuantity).minus(vMoveQty));
													vQuantityFlag ="D";
												}
												else if(parseFloat (oldQuantity)== parseFloat(vMoveQty))
												{
													nlapiLogExecution('ERROR', 'Type:EDIT Quantity is same :');
													vDiffQty =Number(Big(oldQuantity).minus(vMoveQty));
													vQuantityFlag ="E";
												}

												if ((itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
														||(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem"))
												{
													if(oldLotSerial != vLotSerialNumber)//if Lot/Serial is changed.
													{
														var currentRow=[oldToBin,oldLotSerial,oldQuantity];
														vRecordBinArray.push(currentRow);
														vBinArray.push(oldToBin);

														var currentRow1=[vFromBinId,vLotSerialNumber,vMoveQty];
														vRecordBinArray.push(currentRow1);
														vBinArray.push(vFromBinId);
														vFlag="F";

													}
													else if(vFromBinId==oldFromBin && vToBin!=oldToBin) // Tobin change
													{

														var currentRow=[oldToBin,vLotSerialNumber,oldQuantity];
														vRecordBinArray.push(currentRow);
														vBinArray.push(oldToBin);

														if(vQuantityFlag ="I")
														{
															var currentRow=[vFromBinId,vLotSerialNumber,vDiffQty];
															vRecordBinArray.push(currentRow);
															vBinArray.push(vFromBinId);
														}
														vFlag="F";

													}
													else if(vFromBinId!=oldFromBin && vToBin==oldToBin)//From Bin change
													{
														var currentRow=[oldToBin,vLotSerialNumber,oldQuantity];
														vRecordBinArray.push(currentRow);
														vBinArray.push(oldToBin);

														var currentRow=[vFromBinId,vLotSerialNumber,vMoveQty];
														vRecordBinArray.push(currentRow);
														vBinArray.push(vFromBinId);
														vFlag="F";
													}
													else if(vFromBinId!=oldFromBin && vToBin!=oldToBin) // Both the bins[From and To] change
													{
														var currentRow1=[oldToBin,vLotSerialNumber,oldQuantity];
														vRecordBinArray.push(currentRow1);
														vBinArray.push(oldToBin);

														var currentRow1=[vFromBinId,vLotSerialNumber,vMoveQty];
														vRecordBinArray.push(currentRow);
														vBinArray.push(vFromBinId);
														vFlag="F";
													}

												}											
												else
												{
													if(vFromBinId==oldFromBin && vToBin!=oldToBin) // ToBin change												
													{
														nlapiLogExecution('ERROR', 'Tobin change', oldToBin);
														var currentRow=[oldToBin,"",oldQuantity];
														vRecordBinArray.push(currentRow);
														vBinArray.push(oldToBin);

														if(vQuantityFlag ="I")
														{
															var currentRow1=[vFromBinId,"",vDiffQty];
															vRecordBinArray.push(currentRow1);
															vBinArray.push(vFromBinId);
														}
														vFlag="F";
														nlapiLogExecution('ERROR', 'vBinArray', vBinArray);

													}
													else if(vFromBinId!=oldFromBin && vToBin==oldToBin) // FromBin change
													{
														nlapiLogExecution('ERROR', 'FromBin change', vFromBinId);
														var currentRow=[oldToBin,"",oldQuantity];
														vRecordBinArray.push(currentRow);
														vBinArray.push(oldToBin);


														var currentRow1=[vFromBinId,"",vMoveQty];
														vRecordBinArray.push(currentRow1);
														vBinArray.push(vFromBinId);
														vFlag="F";
														nlapiLogExecution('ERROR', 'vBinArray', vBinArray);
													}
													else if(vFromBinId!=oldFromBin && vToBin!=oldToBin) // Both the Bins change												
													{
														nlapiLogExecution('ERROR', 'Both Bins change', vFromBinId);
														var currentRow=[oldToBin,"",oldQuantity];
														vRecordBinArray.push(currentRow);
														vBinArray.push(oldToBin);

														var currentRow1=[vFromBinId,"",vMoveQty];
														vRecordBinArray.push(currentRow1);
														vBinArray.push(vFromBinId);
														vFlag="F";
														nlapiLogExecution('ERROR', 'vBinArray', vBinArray);

													}
												}

												if(vFlag=="T") // vFlag=="T" means Only quantity is changed no other feilds are changed.
												{
													if(parseFloat(oldQuantity)< parseFloat(vMoveQty))													
														vFromBinId = oldFromBin;									

													else if(parseFloat(oldQuantity)> parseFloat(vMoveQty))
														vFromBinId=oldToBin;
													// In this scenario, Need to check with ToBin Open picks
													nlapiLogExecution('ERROR', 'vFromBinId:', vFromBinId);

												}

												break;
											}
										}

									}
								}							
								if(vFlag=="T")
								{							
									nlapiLogExecution('ERROR', 'vFromBinId:', vFromBinId);
									if(vBinArray.indexOf(vFromBinId) ==-1)
										vBinArray.push(vFromBinId);
								}

								var logmsg1 = 'vFlag. = ' + vFlag + '<br>';
								logmsg1 = logmsg1 + 'vBinArray. = ' + vBinArray + '<br>';
								logmsg1 = logmsg1 + 'vRecordBinArray. = ' + vRecordBinArray + '<br>';
								logmsg1 = logmsg1 + 'vDiffQty. = ' + vDiffQty + '<br>';	
								logmsg1 = logmsg1 + 'Remaining Usage. = ' + context.getRemainingUsage() + '<br>';	

								nlapiLogExecution('ERROR', 'Flag Values:', logmsg1);


								if (itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
								{
									getOPenTaskPickQty=getOPenTaskPickBinDetails(vItemId,vBinArray,vLocationArray,vUnitType,stockUnitText,vLotSerialNumber);
									nlapiLogExecution('ERROR', 'getOPenTaskPickQty', getOPenTaskPickQty);
								}
								else if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
								{
									pickBinDetailsLot=getOPenTaskPickBinDetailsLot(vItemId,vBinArray,vLocationArray,vUnitType,stockUnitText);
									nlapiLogExecution('ERROR', 'pickBinDetailsLot', pickBinDetailsLot);

								}

								if(vFlag=="F")
								{
									nlapiLogExecution('ERROR', 'Remaining Usage at the start of Openpicks check',context.getRemainingUsage() );
									errItem1 =fnCheckforOpenPicks(pickBinDetailsLot,getOPenTaskPickQty,vRecordBinArray,vItemId,vLocationArray,errItem,vItemEnter,itemType,lineNo,type);
									nlapiLogExecution('ERROR', 'errItem1', errItem1);
									nlapiLogExecution('ERROR', 'Remaining Usage at the End of Openpicks check', context.getRemainingUsage());
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
											nlapiLogExecution('ERROR', 'arrLengthPickQty', arrLengthPickQty);
											var arrQtyValue=getOPenTaskPickQty[1];
											nlapiLogExecution('ERROR', 'arrQtyValue', arrQtyValue);
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
											nlapiLogExecution('ERROR', 'vOpenPickQty', vOpenPickQty);
											if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
												vOpenPickQty =0;
											validationQty = Number(Big(vBinQtyAvail).minus(vOpenPickQty));
											nlapiLogExecution('ERROR', 'validationQty', validationQty);
										}
									}
									if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
									{
										nlapiLogExecution('ERROR', 'vLotSerialNumber', vLotSerialNumber);									
										nlapiLogExecution('ERROR', 'vFromBinId', vFromBinId);	

										var vBinOpenTaskBinQtyArr='';
										var vBinOpenTaskLotArr='';
										var vOpenPickQty=0;
										if(pickBinDetailsLot!=null&&pickBinDetailsLot!=""&&pickBinDetailsLot!="null")
										{
											nlapiLogExecution('ERROR', 'pickBinDetailsLot', pickBinDetailsLot);									
											vBinOpenTaskBinQtyArr = pickBinDetailsLot[1];
											vBinOpenTaskLotArr = pickBinDetailsLot[3];
											if(vBinOpenTaskLotArr.indexOf(vLotSerialNumber) != -1)
												vOpenPickQty = vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(vLotSerialNumber)];

											nlapiLogExecution('ERROR', 'vBinOpenTaskBinQtyArr', vBinOpenTaskBinQtyArr);
											nlapiLogExecution('ERROR', 'vBinOpenTaskLotArr', vBinOpenTaskLotArr);
											nlapiLogExecution('ERROR', 'vOpenPickQty', vOpenPickQty);

											if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
												vOpenPickQty =0;

											validationQty = Number(Big(vBinQtyAvail).minus(vOpenPickQty));

											nlapiLogExecution('ERROR', 'validationQty', validationQty);
										}
									}	

									nlapiLogExecution('ERROR', 'vDiffQty', vDiffQty);
									nlapiLogExecution('ERROR', 'type', type);
									if(type == 'edit')
									{
										if(invtDetailsInternalId !='-1')
										{
											nlapiLogExecution('ERROR', 'vDiffQty', vDiffQty);
											vMoveQty = vDiffQty;
										}

									}

									nlapiLogExecution('ERROR', 'vMoveQty', vMoveQty);

									if((parseFloat(vMoveQty) > parseFloat(validationQty)) && (validationQty !=0 || parseFloat(vOpenPickQty)>0))								
									{

										errItem.push(" item: ");
										errItem.push( vItemEnter);
										errItem.push(", line no: ");
										errItem.push(invIterator);
										errItem.push("        ");

										for(var a=0; a<errItem.length; a++)
										{
											errItem1+=errItem[a];
											nlapiLogExecution('ERROR', 'errItem1', errItem1);
										}
										nlapiLogExecution('ERROR', 'errItem test', errItem1);
										break;
									}
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
			else if(type == 'delete')	
			{
				try
				{

					var oldRecord = nlapiGetOldRecord();
					nlapiLogExecution('ERROR', 'oldRecord', oldRecord);	
					var errItem = new Array();
					var errorMessage="";

					var vLintcount = oldRecord.getLineItemCount('inventory');
					nlapiLogExecution('ERROR', 'vLintcount', vLintcount);	

					for(var deleteLineItr=1;deleteLineItr<=vLintcount; deleteLineItr++)
					{
						var lineNo=deleteLineItr;
						var getOPenTaskPickQty='';
						var pickBinDetailsLot='';
						var vRecordBinArray=new Array();
						var vItemEnter = oldRecord.getLineItemText('inventory', 'item', deleteLineItr);
						var vItemId = oldRecord.getLineItemValue('inventory', 'item', deleteLineItr);
						var invDetailSubrecord = oldRecord.viewLineItemSubrecord('inventory', 'inventorydetail',deleteLineItr);					
						var invDetSublength = invDetailSubrecord.getLineItemCount('inventoryassignment');
						//var vPreferBinId = nlapiGetLineItemText('inventory','preferredbin', deleteLineItr);
						nlapiLogExecution('ERROR', 'EDIT :invDetSublength', invDetSublength);
						var itemType = nswms_GetItemType(vItemId,warehouselocId);
						nlapiLogExecution('ERROR', 'itemType', itemType);	

						if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem' && 
								itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
						{
							for(var invDetailItr =1; invDetailItr<= invDetSublength; invDetailItr++)
							{
								var invtDetailsInternalId = invDetailSubrecord.getLineItemValue('inventoryassignment','internalid',invDetailItr);
								var vOldFromBin = invDetailSubrecord.getLineItemText('inventoryassignment','binnumber',invDetailItr);
								var vOldFromBinId = invDetailSubrecord.getLineItemValue('inventoryassignment','binnumber', invDetailItr);
								var vOldToBin = invDetailSubrecord.getLineItemText('inventoryassignment','tobinnumber', invDetailItr);
								var vOldToBinId = invDetailSubrecord.getLineItemValue('inventoryassignment','tobinnumber', invDetailItr);
								var vOldQty = invDetailSubrecord.getLineItemValue('inventoryassignment','quantity', invDetailItr);	
								var vOldLotSerialNumber = invDetailSubrecord.getLineItemText('inventoryassignment','issueinventorynumber', invDetailItr);
								var vOldLotSerialNumberId = invDetailSubrecord.getLineItemValue('inventoryassignment','issueinventorynumber', invDetailItr);

								var str = 'vOldFromBin. = ' + vOldFromBin + '<br>';
								str = str + 'vOldFromBinId. = ' + vOldFromBinId + '<br>';
								str = str + 'vOldToBin. = ' + vOldToBin + '<br>';
								str = str + 'vOldToBinId. = ' + vOldToBinId + '<br>';
								str = str + 'vOldQty. = ' + vOldQty + '<br>';
								str = str + 'vOldLotSerialNumber. = ' + vOldLotSerialNumber + '<br>';
								str = str + 'vOldLotSerialNumberId. = ' + vOldLotSerialNumberId + '<br>';
								str = str + 'invtDetailsInternalId. = ' + invtDetailsInternalId + '<br>';
								str = str + 'vItemId. = ' + vItemId + '<br>';

								nlapiLogExecution('ERROR', 'Delete_Parameters :', str);


								/*	if (itemType == "inventoryitem" || itemType == "assemblyitem")
							{
								getOPenTaskPickQty=getOPenTaskPickBinDetails(vItemId,vOldToBinId,vLocationArray,'','',vOldLotSerialNumber);
								nlapiLogExecution('ERROR', 'getOPenTaskPickQty', getOPenTaskPickQty);
							}
							else
							{
								if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
								{
									pickBinDetailsLot=getOPenTaskPickBinDetailsLot(vItemId,vOldToBinId,vLocationArray,vUnitType,stockUnitText);

									nlapiLogExecution('ERROR', 'pickBinDetailsLot', pickBinDetailsLot);
								}
							}*/

								var currentRow1=[vOldToBinId,vOldLotSerialNumber,vOldQty];
								vRecordBinArray.push(currentRow1);


								errorMessage =fnCheckforOpenPicks(pickBinDetailsLot,getOPenTaskPickQty,vRecordBinArray,vItemId,vLocationArray,errItem,vItemEnter,itemType,lineNo,type);
								nlapiLogExecution('ERROR', 'errItem', errItem);
								nlapiLogExecution('ERROR', 'ErrorMessage1', errItem);
								if(errorMessage !=null && errorMessage !='')
									break;


							}
						}

						if(vRecordBinArray !=null && vRecordBinArray !='' && vRecordBinArray.length>0)
							vRecordBinArray =[];
						if(errorMessage !=null && errorMessage !='')
							break;

						nlapiLogExecution('ERROR','Remaining usage at the End',context.getRemainingUsage());
					}
					if(errItem.length > 0)			
					{
						nlapiLogExecution('ERROR', 'errorMessage', errorMessage);
						var cannotDelError = nlapiCreateError('CannotDelete',	'Please Do not Delete the Inventory transfer, Some Openpicks are available for  '+errorMessage+'   ', true);
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
					var vOldToBin = invDetailSubrecord.getLineItemText('inventoryassignment','tobinnumber', oldInvDetailItr);
					var vOldToBinId = invDetailSubrecord.getLineItemValue('inventoryassignment','tobinnumber', oldInvDetailItr);
					var vOldQty = invDetailSubrecord.getLineItemValue('inventoryassignment','quantity', oldInvDetailItr);	
					var vOldLotSerialNumber = invDetailSubrecord.getLineItemText('inventoryassignment','issueinventorynumber', oldInvDetailItr);
					var vOldLotSerialNumberId = invDetailSubrecord.getLineItemValue('inventoryassignment','issueinventorynumber', oldInvDetailItr);


					var str = 'vOldFromBin. = ' + vOldFromBin + '<br>';
					str = str + 'vOldFromBinId. = ' + vOldFromBinId + '<br>';
					str = str + 'vOldToBin. = ' + vOldToBin + '<br>';
					str = str + 'vOldToBinId. = ' + vOldToBinId + '<br>';
					str = str + 'vOldQty. = ' + vOldQty + '<br>';
					str = str + 'vOldLotSerialNumber. = ' + vOldLotSerialNumber + '<br>';
					str = str + 'vOldLotSerialNumberId. = ' + vOldLotSerialNumberId + '<br>';
					str = str + 'invtDetailsInternalId. = ' + invtDetailsInternalId + '<br>';

					nlapiLogExecution('ERROR', 'EDIT :', str);

					var currentRow = [invtDetailsInternalId,vItemId,vOldFromBinId,vOldToBinId,vOldQty,vOldLotSerialNumber,vOldLotSerialNumberId];
					//'vOldrecordValueArray' Array is used to capture oldrecord values
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


/**
 * To check for openpicks for the items
 * * @param vPrefBinOpenTaskDetails
 * * @param getOPenTaskPickQty
 * * @param vRecordBinArray
 * * @param vItemId
 * * @param vLocationArray
 * * @param errItem
 * * @param vItemEnter
 * * @param itemType
 * @returns {errItem1 [error message]}
 */
function fnCheckforOpenPicks(vPrefBinOpenTaskDetails,getOPenTaskPickQty,vRecordBinArray,vItemId,vLocationArray,errItem,vItemEnter,itemType,lineNo,type)
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
		//vRecordBinArray=[vFromBinId,vLotSerialNumber,vDiffQty];
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
				var itemSearchResults = fnGetAvailableQuantites(vItemId,vLocationArray,vFromBinId,vLotSerialNumber,itemType);

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
						getOPenTaskPickQty=getOPenTaskPickBinDetails(vItemId,vFromBinId,vLocationArray,vUnitType,stockUnitText,vLotSerialNumber);
						nlapiLogExecution('ERROR', 'getOPenTaskPickQty', getOPenTaskPickQty);
					}
					else
					{
						if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
						{
							vPrefBinOpenTaskDetails=getOPenTaskPickBinDetailsLot(vItemId,vFromBinId,vLocationArray,vUnitType,stockUnitText);
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
					getOPenTaskPickQty=getOPenTaskPickBinDetails(vItemId,vFromBinId,vLocationArray,vUnitType,stockUnitText,vLotSerialNumber);

				var str = 'itemType. = ' + itemType + '<br>';
				str = str + 'vPrefBinOpenTaskBinIdArr. = ' + vPrefBinOpenTaskBinIdArr + '<br>';
				str = str + 'vPrefBinOpenTaskBinQtyArr. = ' + vPrefBinOpenTaskBinQtyArr + '<br>';
				str = str + 'vPrefBinOpenTaskLotArr. = ' + vPrefBinOpenTaskLotArr + '<br>';
				str = str + 'vPrefBinOpenTaskExpDateArr. = ' + vPrefBinOpenTaskExpDateArr + '<br>';
				str = str + 'vFromBinId. = ' + vFromBinId + '<br>';
				str = str + 'vLotSerialNumber. = ' + vLotSerialNumber + '<br>';
				str = str + 'vLocationArray. = ' + vLocationArray + '<br>';
				str = str + 'vMoveQty. = ' + vMoveQty + '<br>';
				str = str + 'vBinQtyAvail. = ' + vBinQtyAvail + '<br>';
				str = str + 'vUnitType. = ' + vUnitType + '<br>';
				str = str + 'stockUnitText. = ' + stockUnitText + '<br>';
				str = str + 'vItemEnter. = ' + vItemEnter + '<br>';
				str = str + 'vItemId. = ' + vItemId + '<br>';
				str = str + 'lineNo. = ' + lineNo + '<br>';

				nlapiLogExecution('ERROR', 'EDIT :fnCheckforOpenPicks', str);

				if (itemType == 'inventoryitem' || itemType == 'assemblyitem' || 
						itemType == 'serializedinventoryitem' || itemType=='serializedassemblyitem')
				{					
					if(getOPenTaskPickQty!=null && getOPenTaskPickQty!="" && getOPenTaskPickQty!="null")
					{
						var arrLengthPickQty=getOPenTaskPickQty[1].length;
						var arrLengthBin=getOPenTaskPickQty[2].length;
						nlapiLogExecution('ERROR', 'arrLengthPickQty', arrLengthPickQty);
						var arrQtyValue=getOPenTaskPickQty[1];
						nlapiLogExecution('ERROR', 'arrQtyValue', arrQtyValue);
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
						nlapiLogExecution('ERROR', 'EDIT: vOpenPicksQty', vOpenPicksQty);
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



				nlapiLogExecution('ERROR', 'EDIT: vOpenPicksQty', vOpenPicksQty);
				nlapiLogExecution('ERROR', 'EDIT: vBinQtyAvail', vBinQtyAvail);

				nlapiLogExecution('ERROR', 'EDIT: vnPrefBinQtyAvail', vnPrefBinQtyAvail);
				if((parseFloat(vMoveQty) > parseFloat(vnPrefBinQtyAvail)) &&  (vnPrefBinQtyAvail !=0 || parseFloat(vOpenPicksQty)>0))
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
					break;
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
 * * @param vLocationArray
 * * @param vFromBinId
 * * @param vLotSerialNumber
 * * @param itemType
 * * @returns {vBinQtyAvail [available quantity]}
 **/

function fnGetAvailableQuantites(vItemId,vLocationArray,vFromBinId,vLotSerialNumber,itemType)
{
	var itemSearchResults="";


	if(itemType == "inventoryitem" || itemType=="assemblyitem" )
	{
		var filters = new Array();
		if(vItemId != null && vItemId != '')
			filters.push(new nlobjSearchFilter('internalid',null, 'anyof', vItemId));
		if(vLocationArray != null && vLocationArray != '')
			filters.push(new nlobjSearchFilter('location','binonhand', 'anyof', vLocationArray));
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
		if(vLocationArray != null && vLocationArray != '' && vLocationArray != 'null')
			filters.push(new nlobjSearchFilter('location', 'inventoryNumberBinOnHand', 'anyof', vLocationArray));
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
		if(vLocationArray != null && vLocationArray != '')
			filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', vLocationArray));
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
