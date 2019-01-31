/**
 * Script Description
 * This script used to reverse item receipts for selected order put away tasks/item receipts.
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

function inboundReversal(request, response){
	if(request.getMethod() == 'GET'){
		nlapiLogExecution('Debug', 'inboundReversal - GET', 'Start');
		var form = nlapiCreateForm('Inbound Reversal');
		var hiddenQueryParams=form.addField('custpage_qeryparams', 'text', 'queryparams').setDisplayType('hidden');
		var hiddenField_selectpage = form.addField('custpage_hiddenfieldselectpage', 'text', '').setDisplayType('hidden');
		hiddenField_selectpage.setDefaultValue('F');

		form.addButton('custpage_back','Back','backtogeneratesearch()');
		form.setScript('customscript_wmsse_inboundreversal_cl');

		var taskList = getTasksForReversal(request,form);
		var vSublistCount=0;
		if(taskList != null && taskList.length > 0){
			createOrderSublist(form, request, response);
			setPagingForSublist(taskList,form);
		}
		for(var n=0;n<taskList.length;n++)
		{
			var vTaskList=taskList[n];
			if(n==0 &&vTaskList!=null && vTaskList !=null && vTaskList!='null')
				vSublistCount++;
			if(n==1 &&vTaskList!=null && vTaskList !=null && vTaskList!='null') 
				vSublistCount++;

		}
		
		if(parseInt(vSublistCount) == 0)
		{
			showInlineMessage(form, 'ERROR', 'No results found for selected criteria.');
		}
		else
		{
			form.addSubmitButton('Submit');
		}

		response.writePage(form);

		
	} else if (request.getMethod() == 'POST'){

		nlapiLogExecution('DEBUG', 'inboundReversal - POST', 'Start');
		try
		{
			var inventoryStatusFeature = isInvStatusFeatureEnabled();
			var context = nlapiGetContext();			
			var form = nlapiCreateForm('Inbound Reversal');
			var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');		  
			var hiddenQueryParams=form.addField('custpage_qeryparams', 'text', 'queryparams').setDisplayType('hidden');
			var hiddenField_selectpage = form.addField('custpage_hiddenfieldselectpage', 'text', '').setDisplayType('hidden');
			hiddenField_selectpage.setDefaultValue('F');

			if(request.getParameter('custpage_qeryparams')!=null)
			{
				hiddenQueryParams.setDefaultValue(request.getParameter('custpage_qeryparams'));
			}

			form.addButton('custpage_back','Back','backtogeneratesearch()');
			form.setScript('customscript_wmsse_inboundreversal_cl');
			if(request.getParameter('custpage_hiddenfieldselectpage')=='F')
			{

				// Retrieve the number of items for which wave needs to be created
				var lineCount = request.getLineItemCount('custpage_items');
				var vSuccessMsg='T';
				var failMsgStr = "Inbound reversal failed for below lines<br>";
				var validLinesCount = 0;

				var objBinDetails = new Array();
				for(var k = 1; k <= lineCount; k++){
					var selectValue = request.getLineItemValue('custpage_items', 'custpage_po', k);
					if(selectValue=='T')
					{
						validLinesCount = 0;
						var ordid=request.getLineItemValue('custpage_items', 'custpage_poinernno', k);
						var taskid=request.getLineItemValue('custpage_items', 'custpage_taskid', k);
						var taskqty=request.getLineItemValue('custpage_items', 'custpage_qty', k);
						var ordlineno=request.getLineItemValue('custpage_items', 'custpage_lineno', k);
						var taskactloc=request.getLineItemValue('custpage_items', 'custpage_actloc', k);
						var itemid=request.getLineItemValue('custpage_items', 'custpage_itemintrid', k);
						var tasktype=request.getLineItemValue('custpage_items', 'custpage_tasktype', k);
						var trantype=request.getLineItemValue('custpage_items', 'custpage_trantype', k);
						var status=request.getLineItemValue('custpage_items', 'custpage_statusvalue', k);
						var nsrefno=request.getLineItemValue('custpage_items', 'custpage_nsrefno', k);
						var uom=request.getLineItemValue('custpage_items', 'custpage_uom', k);
						var lotno=request.getLineItemValue('custpage_items', 'custpage_lotbatch', k);
						var serials=request.getLineItemValue('custpage_items', 'custpage_serailno', k);
						var vWhLoc=request.getLineItemValue('custpage_items', 'custpage_location', k);
						var vWhLocname=request.getLineItemValue('custpage_items', 'custpage_locationname', k);
						var getStockConversionRate=request.getLineItemValue('custpage_items', 'custpage_convertionrate', k);
						var PO=request.getLineItemValue('custpage_items', 'custpage_pono', k);
						var vItemText=request.getLineItemValue('custpage_items', 'custpage_item', k);
						var vinvtStatus=request.getLineItemValue('custpage_items', 'custpage_invtstatus', k);
						var vInventoryStatusID = '';
						if(inventoryStatusFeature == true)
						{
							vInventoryStatusID = request.getLineItemValue('custpage_items', 'custpage_invtstatusid', k);
						}
						var itemType=nswms_GetItemType(itemid,vWhLoc);
						var vConversionRate =1;
						if (itemType != 'noninventoryitem' && itemType != 'NonInvtPart' &&   itemType != 'otherchargeitem' && itemType != 'OthCharge' && itemType != 'Service' && itemType != 'serviceitem' && itemType != 'downloaditem'  && itemType != 'DwnLdItem' && itemType != 'giftcertificateitem' && itemType != 'GiftCert' && nsrefno != null && nsrefno != '' && nsrefno != 'null' && nsrefno != 'undefined')
						{
							try{

								if(itemType == "inventoryitem" || itemType=="assemblyitem" )
								{

									if(inventoryStatusFeature == true)
									{
										//more than 4k is not required as we were passing the filters.

										objBinResults = nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_invt_item');

										if(itemid != null && itemid != '')
										{
											objBinResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', itemid));
										}
										if(vWhLoc!= null && vWhLoc!= '')
										{
											objBinResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', vWhLoc));
										}
										if(taskactloc!= null && taskactloc!= '')
										{
											objBinResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', taskactloc));
										}
										if(vInventoryStatusID != null && vInventoryStatusID != '' && inventoryStatusFeature == true)
										{
											objBinResults.addFilter(new nlobjSearchFilter('status',null, 'anyof', vInventoryStatusID));
										}

										var	resLen = objBinResults.runSearch();

										var invItr=0;
										var resultSet = resLen.forEachResult(function(searchResult)	
												{
											invItr++;
											objBinDetails.push(searchResult);
											if(invItr==4000)
											{
												return false;
											}
											return true;                // return true to keep iterating
												});

									}
									else
									{
										var filterStrat = new Array();

										if(itemid != null && itemid != '')
											filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', itemid));
										if(vWhLoc!= null && vWhLoc!= '')
											filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', vWhLoc));
										if(taskactloc!= null && taskactloc!= '')
											filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', taskactloc));

										objBinDetails = nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterStrat, null);
									}
								}
								else
								{
									if(inventoryStatusFeature == true)
									{
										//more than 4k is not required as we were passing the filters.

										if(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem")
										{
											objBinResults = nlapiLoadSearch('InventoryBalance','customsearch_wmsse_inventorybalance');
										}
										else 
										{
											objBinResults = nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh');	
										}

										if(itemid != null && itemid != '')
										{
											objBinResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', itemid));
										}
										if(vWhLoc!= null && vWhLoc!= '')
										{
											objBinResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', vWhLoc));
										}
										if(taskactloc!= null && taskactloc!= '')
										{
											objBinResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', taskactloc));
										}
										if(vInventoryStatusID != null && vInventoryStatusID != '' && inventoryStatusFeature == true)
										{
											objBinResults.addFilter(new nlobjSearchFilter('status',null, 'anyof', vInventoryStatusID));
										}

										var	resLen = objBinResults.runSearch();

										var invItr=0;
										var resultSet = resLen.forEachResult(function(searchResult)	
												{
											invItr++;
											objBinDetails.push(searchResult);
											if(invItr==4000)
											{
												return false;
											}
											return true;                // return true to keep iterating
												});
									}
									else
									{


										
										var filterStrat = new Array();

										if(itemid != null && itemid != '')
											filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', itemid));
										if(vWhLoc!= null && vWhLoc!= '')
											filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', vWhLoc));
										if(taskactloc!= null && taskactloc!= '')
											filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', taskactloc));

										objBinDetails = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);
									}
								}
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails);
								if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' ||
										objBinDetails =='undefined' || objBinDetails.length == null || objBinDetails.length == 0 )
								{
									vSuccessMsg='F';
									failMsgStr = failMsgStr+"No inventory for this Transaction :  "+ PO +", Line : "+ordlineno+" ,item:  "+ vItemText +" <br>";
								}								
								else
								{
									if(objBinDetails.length > 0)
									{
										var departments = nlapiGetContext().getFeature('departments');
										var classes = nlapiGetContext().getFeature('classes');


										var blnItemUnit="";
										var vUnitType ="";
										if(inventoryStatusFeature == true)
										{

											var itemfilters=new Array();
											itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',itemid));

											if(vWhLoc != null && vWhLoc !='' && vWhLoc != null)
											{
												itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',vWhLoc]));
											}

											var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
											if(itemresults!=null && itemresults!='')
											{
												blnItemUnit = itemresults[0].getText('stockunit');
												vUnitType = itemresults[0].getValue('unitstype');
											}

										}
										else
										{
											blnItemUnit = objBinDetails[0].getText('stockunit');
											vUnitType = objBinDetails[0].getValue('unitstype');
										}


										
										var qtyFlag="F";
										if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
										{
											var vOpenPickDetails=getOPenTaskPickBinDetails(itemid,taskactloc,vWhLoc,vUnitType,blnItemUnit);
											var vOpenPickQty=0;
											var vBinOpenTaskBinQtyArr = "";
											if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
											{
												vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
												vOpenPickQty = vBinOpenTaskBinQtyArr[0];

											}
											if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
												vOpenPickQty =0;
											if((itemType == "serializedinventoryitem" && inventoryStatusFeature == false) || (itemType=="serializedassemblyitem" && inventoryStatusFeature == false) )
											{
												if(vUnitType != null && vUnitType !='' && vUnitType != 'null' && vUnitType != undefined)
													getStockConversionRate = getStockCoversionRate(vUnitType,blnItemUnit,getStockConversionRate);

												if(getStockConversionRate == null || getStockConversionRate =='' || getStockConversionRate =='null')
													getStockConversionRate =1;
												if(Number(taskqty) <= Number(Big(objBinDetails.length).mul(getStockConversionRate)))
												{
													qtyFlag="T";
													validLinesCount  = parseInt(validLinesCount)+1;

												}
											}
											else{
												for(var p=0;p<objBinDetails.length;p++)
												{
													var vBinQtyAvail= '';
													var vBinText='';
													if(inventoryStatusFeature == true)
													{
														if(itemType == "inventoryitem" || itemType=="assemblyitem")
														{
															vBinQtyAvail=objBinDetails[p].getValue('available');
														}
														else
														{
															vBinQtyAvail=objBinDetails[p].getValue('available',null,'sum');
														}

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
																	if(opentaskStatus == vInventoryStatusID)
																	{
																		openPickQty = vOpenPickQtyArr[binIterator];
																		break;
																	}
																}
															}

														}
														if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
															vOpenPickQty =0;
														if(vUnitType != null && vUnitType != '')
														{
															var vBaseUOMSearch=getBaseUnitRate(vUnitType);

															vBaseUnit='Base unit';
															if(vBaseUOMSearch != null && vBaseUOMSearch != '')
															{
																vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
																vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
															}

															getStockConversionRate = getStockCoversionRate(vUnitType,blnItemUnit,vConversionRate);
														}
													}
													else
													{
														vBinQtyAvail=objBinDetails[p].getValue('quantityavailable','binonhand');
														vBinText=objBinDetails[p].getText('binnumber','binonhand');


														if(vUnitType != null && vUnitType !='' && vUnitType != 'null' && vUnitType != undefined)
															getStockConversionRate = getStockCoversionRate(vUnitType,blnItemUnit,getStockConversionRate);


													}
												


													if(vBinQtyAvail == null || vBinQtyAvail == '' || vBinQtyAvail =='null' || vBinQtyAvail == '- None -')
														vBinQtyAvail =0;
													nlapiLogExecution('Debug', 'vBinQtyAvail1,getStockConversionRate',vBinQtyAvail+","+getStockConversionRate);

													vBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPickQty));

													if(getStockConversionRate == null || getStockConversionRate =='' || getStockConversionRate =='null')
														getStockConversionRate =1;

													if(Number(taskqty) <= Number(Big(vBinQtyAvail).mul(getStockConversionRate)))
													{
														qtyFlag="T";
														validLinesCount  = parseInt(validLinesCount)+1;
														break;
													}

												}
											}

										}
										else
										{
											var vOpenPickDetails=getOPenTaskPickBinDetailsLot(itemid,taskactloc,vWhLoc,vUnitType,blnItemUnit);
											var vBinOpenLotArr="";
											if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
											{
												vBinOpenLotArr = vOpenPickDetails[3];
											}
											if(inventoryStatusFeature == true)
											{
												var vBinQtyAvail= 0;
												for(var p=0;p<objBinDetails.length;p++)
												{

													var eneteredLotTxt=objBinDetails[p].getText('inventorynumber',null,'group');
													var statusVar=objBinDetails[p].getText('status',null,'group');
													if(lotno != eneteredLotTxt)
													{
														continue;
													}
													if(statusVar != vinvtStatus)
													{
														continue;
													}
													var vOpenPickQty=0;
													vBinQtyAvail=objBinDetails[p].getValue('available',null,'sum');
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
																if(opentaskStatus == vInventoryStatusID && eneteredLotTxt==opentaskLotText)
																{
																	openPickQty = vOpenPickQtyArr[binIterator];
																	break;
																}
															}
														}


													}
													if(lotno == eneteredLotTxt)
													{
														break;
													}
												}
												if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
													vOpenPickQty =0;
												if(vUnitType != null && vUnitType != '')
												{
													var vBaseUOMSearch=getBaseUnitRate(vUnitType);

													vBaseUnit='Base unit';
													if(vBaseUOMSearch != null && vBaseUOMSearch != '')
													{
														vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
														vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
													}

													getStockConversionRate = getStockCoversionRate(vUnitType,blnItemUnit,vConversionRate);
												}

												if(getStockConversionRate == null || getStockConversionRate =='' || getStockConversionRate =='null')
													getStockConversionRate =1;

												if(vBinQtyAvail == null || vBinQtyAvail == '' || vBinQtyAvail =='null' || vBinQtyAvail == '- None -')
													vBinQtyAvail =0;

												
												vBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPickQty));

												if(Number(taskqty) <= Number(Big(vBinQtyAvail).mul(getStockConversionRate)))
												{
													qtyFlag="T";
													validLinesCount  = parseInt(validLinesCount)+1;

												}

											}
											else
											{

												for(var p=0;p<objBinDetails.length;p++)
												{
													var vBinQtyAvail=objBinDetails[p].getValue('quantityavailable','inventoryNumberBinOnHand');
													var vBinText=objBinDetails[p].getText('binnumber','inventoryNumberBinOnHand');
													var vInvLot=objBinDetails[p].getText('inventorynumber','inventoryNumberBinOnHand');
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


													if(vUnitType != null && vUnitType !='' && vUnitType != 'null' && vUnitType != undefined)
														getStockConversionRate = getStockCoversionRate(vUnitType,blnItemUnit,getStockConversionRate);

													if(getStockConversionRate == null || getStockConversionRate =='' || getStockConversionRate =='null')
														getStockConversionRate =1;

													if(vBinQtyAvail == null || vBinQtyAvail == '' || vBinQtyAvail =='null' || vBinQtyAvail == '- None -')
														vBinQtyAvail =0;

													
													vBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPickQty));

													if(Number(taskqty) <= Number(Big(vBinQtyAvail).mul(getStockConversionRate)))
													{
														qtyFlag="T";
														validLinesCount  = parseInt(validLinesCount)+1;
														break;
													}
												}

											}
										}
										nlapiLogExecution('Debug', 'qtyFlag',qtyFlag);
										if(qtyFlag=="F")
										{
											vSuccessMsg='F';

											failMsgStr = failMsgStr+"Reversal  not possible for Transaction :  "+ PO +" ,Line : "+ordlineno+", item : "+ vItemText +" ,its inventory was allocated for outbound process.<br>";
											//failMsgStr = failMsgStr+"Details :- Transaction :  "+ PO +" ,Line : "+ordlineno+" ";


										}
									}
								}
							}
							catch(exp){

								nlapiLogExecution('ERROR', 'Exception in Inbound Reversal before', exp);	
								if ( exp instanceof nlobjError )
								{
									if(failMsgStr == "Inbound reversal failed for below lines<br>")
									{
										str=exp.getDetails();
									}
									else
									{
										str=exp.getDetails()+'<br>'+failMsgStr;
									}
									nlapiLogExecution( 'DEBUG', 'system error', exp.getCode() + '\n' + exp.getDetails() );
								}
								else
								{
									if(failMsgStr == "Inbound reversal failed for below lines<br>")
									{
										str=exp.toString();
									}
									else
									{
										str=exp.toString()+'<br> '+failMsgStr;
									}
									nlapiLogExecution( 'DEBUG', 'unexpected error', exp.toString() );
								}
								msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+str+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
								response.writePage(form);
								return;

							}


						}
						if((validLinesCount > 0) || (nsrefno == null || nsrefno == '' || nsrefno == 'null' || nsrefno == 'undefined'))
						{
							var res = 	performTaskReversal(ordid,ordlineno,taskid,taskqty,itemid,tasktype,taskactloc,status,
									trantype,nsrefno,lotno,serials,vInventoryStatusID,vWhLoc);
							if(res==false)
							{
								vSuccessMsg ='F';
							}
						}
						else
						{
							vSuccessMsg ='F';
						}


					}
				}
				nlapiLogExecution('ERROR','vSuccessMsg',vSuccessMsg);
				if(vSuccessMsg=='F')
				{
					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'ERROR', '"+failMsgStr+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
					response.writePage(form);
					return;
				}

				else
				{
					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation', 'Inbound reversal completed sucessfully', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
					response.writePage(form);
					return;
				}

			}
			else
			{


				var taskList = getTasksForReversal(request,form);

				if(taskList != null && taskList.length > 0){
					createOrderSublist(form, request, response);
					setPagingForSublist(taskList,form);
				}

				form.addSubmitButton('Submit');
			}
			
		}
		catch(exp) {
			nlapiLogExecution('ERROR', 'Exception in Inbound Reversal ', exp);	

			if ( exp instanceof nlobjError )
			{
				if(failMsgStr == "Inbound reversal failed for below lines<br>")
				{
					str=exp.getDetails();
				}
				else
				{
					str=failMsgStr+'<br>'+exp.getDetails();
				}
				nlapiLogExecution( 'DEBUG', 'system error', exp.getCode() + '\n' + exp.getDetails() );
			}
			else
			{
				if(failMsgStr == "Inbound reversal failed for below lines<br>")
				{
					str=exp.toString();
				}
				else
				{
					str=failMsgStr+'<br> '+exp.toString();
				}

				nlapiLogExecution( 'DEBUG', 'unexpected error', exp.toString() );
			}
			nlapiLogExecution('ERROR', 'str', str);	
			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'ERROR', '"+str+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
			response.writePage(form);
			return;
		}
		response.writePage(form);
	}

}

function performTaskReversal(ordid,ordlineno,taskid,taskqty,itemid,tasktype,taskactloc,wmsstatus,trantype,nsrefno,lotno,serials,inventoryStatus,vWhLoc)
{

	var str = 'ordid. = ' + ordid + '<br>';	
	str = str + 'ordlineno. = ' + ordlineno + '<br>';
	str = str + 'taskid. = ' + taskid + '<br>';
	str = str + 'taskqty. = ' + taskqty + '<br>';	 
	str = str + 'itemid. = ' + itemid + '<br>';
	str = str + 'trantype. = ' + trantype + '<br>';
	str = str + 'nsrefno. = ' + nsrefno + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'inventoryStatus. = ' + inventoryStatus + '<br>';
	nlapiLogExecution('Debug', 'performTaskReversal Parameters', str);
	var isUpdateItemReceiptSucess = true;
	if(wmsstatus == '3'  && nsrefno != null && nsrefno != '' &&  nsrefno != 'null' &&  nsrefno != 'undefined')
	{
		var id =	updateItemReceipt(ordid,ordlineno,taskqty,itemid,nsrefno,taskactloc,lotno,serials,inventoryStatus,vWhLoc);
		if (id== -1)
		{
			isUpdateItemReceiptSucess = false;
		}
	}
	if(isUpdateItemReceiptSucess == true)
	{
		updateIBOpentask(taskqty,taskid,taskqty,itemid,ordid,taskactloc,ordlineno,tasktype,wmsstatus,trantype,inventoryStatus,vWhLoc);
	}

	return isUpdateItemReceiptSucess;
}

function createOrderSublist(form, request, response){
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	var sublist = form.addSubList("custpage_items", "list", "ItemList");
	sublist.addMarkAllButtons();
	sublist.addField("custpage_po", "checkbox", "Confirm").setDefaultValue('F');
	sublist.addField("custpage_pono", "text", "Transaction #");
	sublist.addField("custpage_lineno", "text", "Line #");
	sublist.addField("custpage_item", "text", "Item");
	sublist.addField("custpage_qty", "text", "Qty");
	if(inventoryStatusFeature == true)
	{
		sublist.addField("custpage_invtstatus", "text", "Inventory Status");
	}
	sublist.addField("custpage_uom", "text", "Units");
	sublist.addField("custpage_convertionrate", "text", "Convertion Rate").setDisplayType('hidden');
	sublist.addField("custpage_lotbatch", "text", "Lot #");
	sublist.addField("custpage_binloc", "text", "Bin Location");	  
	sublist.addField("custpage_serailno", "textarea", "Serial #");
	sublist.addField("custpage_locationname", "text", "location");	
	sublist.addField("custpage_location", "text", "location").setDisplayType('hidden');	
	sublist.addField("custpage_status", "text", "Status");
	sublist.addField("custpage_poinernno", "text", "SONo").setDisplayType('hidden');		
	sublist.addField("custpage_company", "text", "Company").setDisplayType('hidden');
	sublist.addField("custpage_itemintrid", "text", "ITEM ID").setDisplayType('hidden');	 
	sublist.addField("custpage_taskid", "text", "Task Id").setDisplayType('hidden');
	sublist.addField("custpage_tasktype", "text", "Task Type").setDisplayType('hidden');
	sublist.addField("custpage_actloc", "text", "ActualLoc").setDisplayType('hidden');
	sublist.addField("custpage_statusvalue", "text", "Status").setDisplayType('hidden');
	sublist.addField("custpage_trantype", "text", "Transaction Type");
	sublist.addField("custpage_nsrefno", "text", "Ns Ref").setDisplayType('hidden');
	sublist.addField("custpage_invtstatusid", "text", "StatusId").setDisplayType('hidden');

}



var searchResultArray=new Array();

function getTasksForReversal(request,form){

	// Validating all the request parameters and pushing to a local array
	var localVarArray;
	//this is to maintain the querystring parameters while refreshing the paging drop down
	if (request.getMethod() == 'POST') {
		var queryparams=request.getParameter('custpage_qeryparams');
		
		var tempArray=new Array();
		tempArray.push(queryparams.split(','));
		localVarArray=tempArray;
		
	}
	else
	{
		localVarArray = validateRequestParams(request,form);
		
	}

	// Get all the search filters from open task
	var opentaskfilters = new Array();   
	opentaskfilters = specifyTaskFiltersOpen(localVarArray);

	// Get all the columns that the search should return
	var opentaskcolumns = new Array();
	//columns1 = getTaskColumnsOpen();

	var opentaskList = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskreversal', opentaskfilters, null);
	
	searchResultArray.push(opentaskList);

	// Get all the search filters from open task
	var closedtaskfilters = new Array();   
	closedtaskfilters = specifyTaskFiltersClose(localVarArray);

	// Get all the columns that the search should return
	var closedtaskcolumns = new Array();
	//columns2 = getTaskColumnsClose();

	var ClosedtaskList = nlapiSearchRecord('customrecord_wmsse_trn_closedtask', 'customsearch_wmsse_closedtaskreversal', closedtaskfilters, null);

	searchResultArray.push(ClosedtaskList);
	searchResultArray.push(localVarArray[0][1]);
	return searchResultArray;
}

function validateRequestParams(request,form){
	var ordNo = "";
	var trantype = "";
	var vLocation = "";

	var localVarArray = new Array();

	if (request.getParameter('custpage_orderlist') != null && request.getParameter('custpage_orderlist') != "") {
		ordNo = request.getParameter('custpage_orderlist');
	}


	if (request.getParameter('custpage_trantype') != null && request.getParameter('custpage_trantype') != "") {
		trantype = request.getParameter('custpage_trantype');
	}

	if (request.getParameter('custpage_whlocation') != null && request.getParameter('custpage_whlocation') != "") {
		vLocation = request.getParameter('custpage_whlocation');
	}

	var currentRow = [ordNo,trantype,vLocation];
	localVarArray.push(currentRow);
	if (request.getParameter('custpage_qeryparams')==null )
	{
		var hiddenQueryParams=form.getField('custpage_qeryparams');
		hiddenQueryParams.setDefaultValue(localVarArray.toString());
	}
	return localVarArray;
}

function specifyTaskFiltersOpen(localVarArray){
	var filters = new Array();
	var vType='PurchOrd';
	if(localVarArray[0][1]=='purchaseorder')
		vType='PurchOrd';
	else if(localVarArray[0][1]=='transferorder')
		vType='TrnfrOrd';
	else if(localVarArray[0][1]=='returnauthorization')
		vType='RtnAuth';

	if(localVarArray[0][0] != "" && localVarArray[0][0] != null)
		filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', localVarArray[0][0]));
	if(localVarArray[0][2] != "" && localVarArray[0][2] != null)
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', localVarArray[0][2]));
	if(vType != "")
		filters.push(new nlobjSearchFilter('type','custrecord_wmsse_order_no', 'anyof', vType));
	filters.push(new nlobjSearchFilter('mainline','custrecord_wmsse_order_no', 'is', 'T'));	
	filters.push(new nlobjSearchFilter( 'custrecord_wmsse_wms_status_flag', null, 'anyof', ['3']));
	filters.push(new nlobjSearchFilter( 'custrecord_wmsse_tasktype', null, 'anyof', ['2']));
	return filters;
}

/**
 * 
 * @returns {Array}
 */
function getTaskColumnsOpen(){
	var columns = new Array();
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_order_no'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_line_no'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_sku'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_expe_qty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_batch_num'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_actendloc'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_wms_status_flag'));	 	
	columns.push(new nlobjSearchColumn('name'));		 
	columns.push(new nlobjSearchColumn('custrecord_wmsse_wms_location'));	 
	columns.push(new nlobjSearchColumn('custrecord_wmsse_serial_no'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_tasktype'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_nsconfirm_ref_no'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_actbeginloc'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_uom'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_conversionrate'));
	if(inventoryStatusFeature == true)
	{
		columns.push(new nlobjSearchColumn('custrecord_wmsse_inventorystatus'));
	}

	return columns;
}

function specifyTaskFiltersClose(localVarArray){
	var filters = new Array();
	var vType='PurchOrd';
	if(localVarArray[0][1]=='purchaseorder')
		vType='PurchOrd';
	else if(localVarArray[0][1]=='transferorder')
		vType='TrnfrOrd';
	else if(localVarArray[0][1]=='returnauthorization')
		vType='RtnAuth';
	//Ordno
	if(localVarArray[0][0] != "" && localVarArray[0][0] != null)
		filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no_clt', null, 'is', localVarArray[0][0]));
	//Location
	if(localVarArray[0][2] != "" && localVarArray[0][2] != null)
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location_clt', null, 'is', localVarArray[0][2]));
	if(vType != "")
		filters.push(new nlobjSearchFilter('type','custrecord_wmsse_order_no_clt', 'anyof', vType));
	filters.push(new nlobjSearchFilter('mainline','custrecord_wmsse_order_no_clt', 'is', 'T'));
	//3-Putaway completed
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag_clt', null, 'anyof', [3]));

	//2- putaway
	filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype_clt', null, 'anyof', [2]));
	nlapiLogExecution('ERROR','specifyTaskFiltersClose');
	return filters;
}

/**
 * 
 * @returns {Array}
 */
function getTaskColumnsClose(){
	var columns = new Array();
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_order_no_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_line_no_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_sku_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_expe_qty_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_batch_num_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_actendloc_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_wms_status_flag_clt'));	 	
	columns.push(new nlobjSearchColumn('name'));	 
	columns.push(new nlobjSearchColumn('custrecord_wmsse_wms_location_clt'));	  
	columns.push(new nlobjSearchColumn('custrecord_wmsse_serial_no_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_tasktype_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_nsconfirm_ref_no_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_actbeginloc_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_uom_clt'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_conversionrate_clt'));
	if(inventoryStatusFeature == true)
	{
		columns.push(new nlobjSearchColumn('custrecord_wmsse_inventorystatus_clt'));
	}
	return columns;
}

function setPagingForSublist(taskList,form)
{
	if(taskList != null && taskList.length > 0){
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		
		var taskListArray=new Array();		
		var vTranType=taskList[2];

		for(k=0;k<2;k++)
		{
			var tasksearchresult = taskList[k];
			
			if(tasksearchresult!=null)
			{		
				if(k==0)
				{	
					for(var j=0;j<tasksearchresult.length;j++)
					{	
						var actqty=tasksearchresult[j].getValue('custrecord_wmsse_act_qty');

						if(actqty==null || actqty=='' || isNaN(actqty))
							actqty=0;

						if(parseFloat(actqty)>0)
						{	
							var temparr=tasksearchresult[j];
							var invtStatus = '';
							var invtStatusId = '';
							if(inventoryStatusFeature == true)
							{
								invtStatus =temparr.getText('custrecord_wmsse_inventorystatus');
								invtStatusId =temparr.getValue('custrecord_wmsse_inventorystatus');
								nlapiLogExecution('Error', 'invtStatusId ', invtStatusId);
							}
							taskListArray[taskListArray.length]=[temparr.getValue('custrecord_wmsse_order_no'),temparr.getValue('custrecord_wmsse_line_no'),
								temparr.getValue('custrecord_wmsse_sku'),
								temparr.getValue('custrecord_wmsse_expe_qty'),temparr.getValue('custrecord_wmsse_batch_num'),
								temparr.getValue('custrecord_wmsse_actendloc'),temparr.getValue('custrecord_wmsse_wms_status_flag'),
								temparr.getValue('name'),temparr.getValue('custrecord_wmsse_wms_location'),
								temparr.getValue('custrecord_wmsse_serial_no'),
								temparr.getValue('custrecord_wmsse_tasktype'),temparr.getText('custrecord_wmsse_order_no'),
								temparr.getText('custrecord_wmsse_sku'),
								temparr.getText('custrecord_wmsse_actendloc'),temparr.getText('custrecord_wmsse_wms_status_flag'),
								temparr.getId(),
								'Open',temparr.getValue('custrecord_wmsse_nsconfirm_ref_no'),
								temparr.getValue('custrecord_wmsse_act_qty'),
								temparr.getText('custrecord_wmsse_actbeginloc'),temparr.getValue('custrecord_wmsse_actbeginloc'),
								temparr.getValue('custrecord_wmsse_uom'),temparr.getValue('custrecord_wmsse_conversionrate'),
								invtStatus,invtStatusId,temparr.getText('custrecord_wmsse_wms_location')];

						}
					}
				}
				if(k==1)
				{	
					for(var j=0;j<tasksearchresult.length;j++)
					{	
						var actqty=tasksearchresult[j].getValue('custrecord_wmsse_act_qty_clt');
						var invtStatus = '';
						var invtStatusId = '';
						if(inventoryStatusFeature == true)
						{
							invtStatus =tasksearchresult[j].getText('custrecord_wmsse_inventorystatus_clt');
							invtStatusId =tasksearchresult[j].getValue('custrecord_wmsse_inventorystatus_clt');
						}
						if(actqty==null || actqty=='' || isNaN(actqty))
							actqty=0;

						if(parseFloat(actqty)>0)
						{	
							var temparr=tasksearchresult[j];
							taskListArray[taskListArray.length]=[temparr.getValue('custrecord_wmsse_order_no_clt'),
								temparr.getValue('custrecord_wmsse_line_no_clt'),
								temparr.getValue('custrecord_wmsse_sku_clt'),
								temparr.getValue('custrecord_wmsse_expe_qty_clt'),
								temparr.getValue('custrecord_wmsse_batch_num_clt'),
								temparr.getValue('custrecord_wmsse_actendloc_clt'),
								temparr.getValue('custrecord_wmsse_wms_status_flag_clt'),
								temparr.getValue('name'),temparr.getValue('custrecord_wmsse_wms_location_clt'),
								temparr.getValue('custrecord_wmsse_serial_no_clt'),
								temparr.getValue('custrecord_wmsse_tasktype_clt'),
								temparr.getText('custrecord_wmsse_order_no_clt'),
								temparr.getText('custrecord_wmsse_sku_clt'),
								temparr.getText('custrecord_wmsse_actendloc_clt'),
								temparr.getText('custrecord_wmsse_wms_status_flag_clt'),
								temparr.getId(),'Closed',temparr.getValue('custrecord_wmsse_nsconfirm_ref_no_clt'),
								temparr.getValue('custrecord_wmsse_act_qty_clt'),
								temparr.getText('custrecord_wmsse_actbeginloc_clt'),
								temparr.getValue('custrecord_wmsse_actbeginloc_clt'),
								temparr.getValue('custrecord_wmsse_uom_clt'),
								temparr.getValue('custrecord_wmsse_conversionrate_clt'),invtStatus,invtStatusId,temparr.getText('custrecord_wmsse_wms_location_clt')];							 
						}
					}
				}
			}
		}

		var test='';

		if(taskListArray.length>0)
		{
			if(taskListArray.length>50)
			{
				var pagesize = form.addField('custpage_pagesize', 'text', 'Page Size').setDisplayType('hidden');
				pagesize.setDisplaySize(10,10);
				pagesize.setLayoutType('outsidebelow', 'startrow');
				var select= form.addField('custpage_selectpage','select', 'Select Records');	
				select.setLayoutType('outsidebelow', 'startrow');			
				select.setDisplaySize(200,30);
				if (request.getMethod() == 'GET'){
					pagesize.setDefaultValue("50");
					pagesizevalue=50;
				}
				else
				{
					if(request.getParameter('custpage_pagesize')!=null)
					{
						pagesizevalue= request.getParameter('custpage_pagesize');
					}
					else
					{
						pagesizevalue= 50;
						pagesize.setDefaultValue("50");
					}
				}

				//this is to add the pageno's to the dropdown.
				var len=taskListArray.length/parseFloat(pagesizevalue);
				for(var k=1;k<=Math.ceil(len);k++)
				{
					var from;var to;

					to=parseFloat(k)*parseFloat(pagesizevalue);
					from=(parseFloat(to)-parseFloat(pagesizevalue))+1;

					if(parseFloat(to)>taskListArray.length)
					{
						to=taskListArray.length;
						test=from.toString()+","+to.toString(); 
					}

					var temp=from.toString()+" to "+to.toString();
					var tempto=from.toString()+","+to.toString();
					select.addSelectOption(tempto,temp);

				} 

				if (request.getMethod() == 'POST'){

					if(request.getParameter('custpage_selectpage')!=null ){

						select.setDefaultValue(request.getParameter('custpage_selectpage'));	

					}
					if(request.getParameter('custpage_pagesize')!=null ){

						pagesize.setDefaultValue(request.getParameter('custpage_pagesize'));	

					}
				}
			}
			else
			{
				pagesizevalue=parseFloat(taskListArray.length);
			}

			var minval=0;var maxval=parseFloat(pagesizevalue);
			if(parseFloat(pagesizevalue)>taskListArray.length)
			{
				maxval=orderListArray.length;
			}

			var selectno=request.getParameter('custpage_selectpage');
			if(selectno!=null )
			{
				var selectedPage= request.getParameter('custpage_selectpage');
				var selectedPageArray=selectedPage.split(',');			
				var diff=parseFloat(selectedPageArray[1])-(parseFloat(selectedPageArray[0])-1);
				

				var pagevalue=request.getParameter('custpage_pagesize');
				
				if(pagevalue!=null)
				{
					if(parseFloat(diff)==parseFloat(pagevalue)|| test==selectno)
					{

						var selectedPageArray=selectno.split(',');	
						//nlapiLogExecution('ERROR', 'selectedPageArray.length ', selectedPageArray.length);  
						minval=parseFloat(selectedPageArray[0])-1;
						//nlapiLogExecution('ERROR', 'selectedPageArray[0] ', selectedPageArray[0]);  
						maxval=parseFloat(selectedPageArray[1]);
						//nlapiLogExecution('ERROR', 'selectedPageArray[1] ', selectedPageArray[1]);  
					}
				}
			}


			var c=0;
			var minvalue;
			minvalue=minval;

			for(var j = minvalue; j < maxval; j++){		

				var currentTask = taskListArray[j];
				addTaskListToSublist(form, currentTask, c,vTranType);
				c=c+1;
			}
		}
	}
}

function addTaskListToSublist(form, currentTask, i,vTranType){

	form.getSubList('custpage_items').setLineItemValue('custpage_pono', i + 1,
			currentTask[11]);
	form.getSubList('custpage_items').setLineItemValue('custpage_lineno', i + 1,
			currentTask[1]);
	form.getSubList('custpage_items').setLineItemValue('custpage_item', i + 1,
			currentTask[12]);

	form.getSubList('custpage_items').setLineItemValue('custpage_qty', i + 1, 
			currentTask[18]);

	form.getSubList('custpage_items').setLineItemValue('custpage_lotbatch', i + 1, 
			currentTask[4]);

	form.getSubList('custpage_items').setLineItemValue('custpage_binloc', i + 1, 
			currentTask[13]);

	form.getSubList('custpage_items').setLineItemValue('custpage_status', i + 1, 
			currentTask[14]);
	form.getSubList('custpage_items').setLineItemValue('custpage_statusvalue', i + 1, 
			currentTask[6]);

	form.getSubList('custpage_items').setLineItemValue('custpage_poinernno', i + 1, 
			currentTask[0]);
	form.getSubList('custpage_items').setLineItemValue('custpage_location', i + 1, 
			currentTask[8]);
	form.getSubList('custpage_items').setLineItemValue('custpage_itemintrid', i + 1, 
			currentTask[2]);
	form.getSubList('custpage_items').setLineItemValue('custpage_serailno', i + 1, 
			currentTask[9]);
	form.getSubList('custpage_items').setLineItemValue('custpage_taskid', i + 1, 
			currentTask[15]);
	form.getSubList('custpage_items').setLineItemValue('custpage_tasktype', i + 1, 
			currentTask[16]);
	form.getSubList('custpage_items').setLineItemValue('custpage_actloc', i + 1, 
			currentTask[5]);
	form.getSubList('custpage_items').setLineItemValue('custpage_trantype', i + 1, 
			vTranType);
	nlapiLogExecution('Error', 'currentTask[15]', currentTask[15]);

	nlapiLogExecution('Error', 'currentTask[17]', currentTask[17]);
	form.getSubList('custpage_items').setLineItemValue('custpage_nsrefno', i + 1, 
			currentTask[17]);
	form.getSubList('custpage_items').setLineItemValue('custpage_uom', i + 1, 
			currentTask[21]);
	form.getSubList('custpage_items').setLineItemValue('custpage_convertionrate', i + 1, 
			currentTask[22]);
	if(currentTask[23] != '' && currentTask[23] != null && currentTask[23] != 'null' &&
			currentTask[23] != undefined && currentTask[23] != 'undefined')
	{
		form.getSubList('custpage_items').setLineItemValue('custpage_invtstatus', i + 1, 
				currentTask[23]);	
	}
	if(currentTask[24] != '' && currentTask[24] != null && currentTask[24] != 'null' &&
			currentTask[24] != undefined && currentTask[24] != 'undefined')
	{
		form.getSubList('custpage_items').setLineItemValue('custpage_invtstatusid', i + 1, 
				currentTask[24]);	
	}
	//Getting location Name from search.
	if(currentTask[25] != '' && currentTask[25] != null && currentTask[25] != 'null' &&
			currentTask[25] != undefined && currentTask[25] != 'undefined')
	{
		form.getSubList('custpage_items').setLineItemValue('custpage_locationname', i + 1, 
				currentTask[25]);	
	}

}

function updateItemReceipt(ordid,ordlineno,taskqty,itemid,nsrefno,taskactloc,lotno,serials,invtStatus,vWhLoc)
{


	var str = 'ordid. = ' + ordid + '<br>';	
	str = str + 'ordlineno. = ' + ordlineno + '<br>';	
	str = str + 'taskqty. = ' + taskqty + '<br>';	 
	str = str + 'itemid. = ' + itemid + '<br>';
	str = str + 'nsrefno. = ' + nsrefno + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'invtStatus. = ' + invtStatus + '<br>';
	str = str + 'lotno. = ' + lotno + '<br>';
	str = str + 'serials. = ' + serials + '<br>';
	nlapiLogExecution('Debug', 'Into updateItemReceipt', str);


	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	var opentaskSerialArr = new Array();
	var itemType ='';
	var returnID = -1;
	if(ordid!=null && ordid!='')
	{
		/*try
		{*/
		var trantype = nlapiLookupField('transaction', ordid, 'recordType');
		

		var itemIndex=0;
		var totalqty=taskqty;
		var vLotQty=0;
		var boolfound=true;

		var filters = new Array();
		filters.push(new nlobjSearchFilter('createdfrom', null, 'is', ordid));
		filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemid));

		var columns = new Array();    
		

		var itemReceiptResults = nlapiSearchRecord('itemreceipt', 'customsearch_wmsse_itemreceiptdetails', filters, null);
		if(itemReceiptResults != null && itemReceiptResults !='')
		{	
			if(nsrefno != null && nsrefno !='' && nsrefno !='null' && nsrefno !='undefined')
			{
				var TransformRec = nlapiLoadRecord('itemreceipt', nsrefno);

				// To get the no of lines from item fulfillment record
				var IFLength = TransformRec.getLineItemCount('item');  

				for (var j = 1; IFLength!=null && j <= IFLength; j++) {

					var itemLineNo = TransformRec.getLineItemValue('item', 'orderline', j);

					/*if(trantype=="transferorder")
						itemLineNo=parseInt(itemLineNo)-2;*/

					if (itemLineNo == ordlineno) {
						itemIndex=j;    				
					}

				}

				

				if(itemIndex!=0)
				{
					var item_id = TransformRec.getLineItemValue('item', 'item', itemIndex);
					var itemname = TransformRec.getLineItemText('item', 'item', itemIndex);
					if(itemname!=null && itemname!='')
						itemname=itemname.replace(/ /g,"-");
					var itemrec = TransformRec.getLineItemValue('item', 'itemreceive', itemIndex);
					var itemloc2 = TransformRec.getLineItemValue('item', 'location', itemIndex);
					var NSOrdUOM = TransformRec.getLineItemValue('item', 'units', itemIndex);
					itemType = nswms_GetItemType(item_id,itemloc2);




					if(boolfound)
					{
						if(totalqty>0)
						{
							if(serials != null && serials != '' && serials != 'null' && serials != 'undefined')
							{
								opentaskSerialArr = serials.split(',');
							}
							TransformRec.selectLineItem('item', itemIndex);
							var oldputqty = TransformRec.getCurrentLineItemValue('item', 'quantity');
							
							//var newputqty = parseFloat(oldputqty)-parseFloat(totalqty);
							var newputqty = Number(Big(oldputqty).minus(totalqty));
							
							if(parseFloat(newputqty)>0)
							{
								TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'T');
								TransformRec.setCurrentLineItemValue('item', 'quantity', newputqty);					
								TransformRec.setCurrentLineItemValue('item', 'location', itemloc2);

								if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {

									var compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
									
									for(var r1=1;r1<=complinelength;r1++)
									{
										if(totalqty > 0 )
										{
											compSubRecord.selectLineItem('inventoryassignment',r1);
											var vOldSubBinLocText = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'binnumber');
											var vOldSubBinLocQty = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
											var vOldReceiptInventoryNumber = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
											var vOldReceiptInventoryStatus = '';
											if(inventoryStatusFeature == true)
											{
												vOldReceiptInventoryStatus = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'inventorystatus');
											}

											if(vOldSubBinLocText == taskactloc && totalqty > 0 && (lotno == vOldReceiptInventoryNumber) 
													&& ((vOldReceiptInventoryStatus == invtStatus) || (vOldReceiptInventoryStatus == '')))
											{
												var vNewSubBinLocQty = '';

												if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
												{
													//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
													vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
												}
												else
												{
													//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
													vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
												}

												if(parseFloat(vNewSubBinLocQty) > 0)
												{
													compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', vNewSubBinLocQty);
													compSubRecord.commitLineItem('inventoryassignment');
													//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty); 
													totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty));
												}
												else
												{
													
													compSubRecord.removeLineItem('inventoryassignment', r1);
													totalqty = 0; 
													break;
												}
											}
										}
									}
									compSubRecord.commit();
								}
								else if (itemType == "inventoryitem" || itemType == "assemblyitem") {

									var compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
									
									for(var r1=1;r1<=complinelength;r1++)
									{
										if(totalqty > 0 )
										{
											compSubRecord.selectLineItem('inventoryassignment',r1);
											var vOldSubBinLocText = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'binnumber');
											var vOldSubBinLocQty = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
											var vOldSubBinInventoryStatus = '';
											if(inventoryStatusFeature == true)
											{
												vOldSubBinInventoryStatus = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'inventorystatus');
											}
											if(vOldSubBinLocText == taskactloc && totalqty > 0 && 
													((vOldSubBinInventoryStatus == invtStatus) || (vOldSubBinInventoryStatus == '')))
											{
												var vNewSubBinLocQty = '';

												if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
												{
													//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
													vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
												}
												else
												{
													//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
													vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
												}

												if(parseFloat(vNewSubBinLocQty) > 0)
												{
													compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', vNewSubBinLocQty);
													compSubRecord.commitLineItem('inventoryassignment');
													//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty); 
													totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty));
												}
												else
												{
													compSubRecord.removeLineItem('inventoryassignment', r1);
													totalqty = 0; 
													break;
												}
											}
										}
									}
									compSubRecord.commit();
								}
								else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {





									var compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');

									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

									if( newputqty > 0)
									{
										var tQty =	taskqty;
										
										if(NSOrdUOM !=null && NSOrdUOM != '' && NSOrdUOM != 'null' && NSOrdUOM != 'undefined')
										{
											tQty = 	opentaskSerialArr.length;  
											
										}
										if(parseInt(complinelength)>0)
										{
											do{
												complinelength = compSubRecord.getLineItemCount('inventoryassignment');
												for(var r1=1;r1<=complinelength;r1++)
												{
													compSubRecord.selectLineItem('inventoryassignment',r1);
													var vOldSubBinLocText = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'binnumber');
													var serialNum = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
													var vOldSubBinInventoryStatus = '';
													if(inventoryStatusFeature == true)
													{
														vOldSubBinInventoryStatus = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'inventorystatus');
													}
													if(vOldSubBinLocText == taskactloc && opentaskSerialArr.indexOf(serialNum) != -1 &&
															((vOldSubBinInventoryStatus == invtStatus) || (vOldSubBinInventoryStatus == '')) )
													{
														//tQty = parseInt(tQty)-1;
														tQty = Number(Big(tQty).minus(1));
														compSubRecord.removeLineItem('inventoryassignment', r1);
														break;
													}


												}
											}while(tQty > 0)
												compSubRecord.commit();
										}
									}
								}
								TransformRec.commitLineItem('item');
							}
							else
							{
								

								if(IFLength==1)
								{
									nlapiDeleteRecord('itemreceipt', nsrefno);
									returnID = nsrefno;
									return returnID;
								}
								else
									TransformRec.setLineItemValue('item','itemreceive',itemIndex,'F');

							}
						}
						else
						{
							

							if(IFLength==1)
							{
								nlapiDeleteRecord('itemreceipt', nsrefno);
								returnID = nsrefno;
								return returnID;
							}
							else
								TransformRec.setLineItemValue('item','itemreceive',itemIndex,'F');
						}
					}
				}

				nlapiLogExecution('ERROR', 'Before Submit', '');

				if(TransformRec!=null)
				{
					var TransformRecId = nlapiSubmitRecord(TransformRec, true);
					nlapiLogExecution('ERROR', 'After Submit returnID', TransformRecId);
					returnID = TransformRecId;
					if(TransformRecId != null && TransformRecId != '' && TransformRecId != 'null' && TransformRecId != 'undefined' && (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem"))
					{
						
						//fetch serials from serial entry
						var filters = new Array();
						var serialArray='';
						//filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
						filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseInt(ordlineno));									
						filters[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', ordid);
						var columns = new Array();
						columns[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
						columns[1] = new nlobjSearchColumn('name');
						var SrchRecordSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filters,columns);
					
						if(SrchRecordSerial != null && SrchRecordSerial != '')
						{
							for(var m=0;m<SrchRecordSerial.length;m++)
							{
								if(opentaskSerialArr.indexOf(SrchRecordSerial[m].getValue('custrecord_wmsse_ser_no')) != -1)
								{
									var vRecId=SrchRecordSerial[m].getId();
									
									nlapiDeleteRecord('customrecord_wmsse_serialentry', vRecId);
								}
							}
						}

					}
				}
			}
		}
		/*	}
		catch(e)
		{
			nlapiLogExecution('ERROR', 'Exception in updateItemReceipt',e);
		}
		finally
		{
			return returnID;
		}*/
	}

	nlapiLogExecution('ERROR', 'Out of updateItemReceipt');
	return returnID;
}

function updateIBOpentask(reversalqty,taskid,taskactqty,itemid,ordintrid,taskactloc,lineno,tasktype,wmsstatus,trantype,inventoryStatus,vWhLoc)
{


	var str = 'reversalqty. = ' + reversalqty + '<br>';	
	str = str + 'taskactqty. = ' + taskactqty + '<br>';	
	str = str + 'opentaskid. = ' + taskid + '<br>';
	str = str + 'tasktype. = ' + tasktype + '<br>';	 
	str = str + 'itemid. = ' + itemid + '<br>';
	//str = str + 'lprecid. = ' + lprecid + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'ordintrid. = ' + ordintrid + '<br>';
	str = str + 'lineno. = ' + lineno + '<br>';
	str = str + 'wmsstatus. = ' + wmsstatus + '<br>';
	str = str + 'inventoryStatus. = ' + inventoryStatus + '<br>';
	nlapiLogExecution('Debug', 'Function Parameters', str);

	updateOpenTask(taskid,reversalqty,taskactqty,tasktype,lineno,itemid,ordintrid,inventoryStatus,vWhLoc);

	
}

function updateOpenTask(taskid,reversalqty,taskactqty,tasktype,lineno,itemid,ordintrid,inventoryStatus,vWhLoc)
{

	var str = 'taskid. = ' + taskid + '<br>';
	str = str + 'reversalqty. = ' + reversalqty + '<br>';
	str = str + 'taskactqty. = ' + taskactqty + '<br>';
	str = str + 'tasktype. = ' + tasktype + '<br>';
	str = str + 'lineno. = ' + lineno + '<br>';
	str = str + 'itemid. = ' + itemid + '<br>';
	str = str + 'ordintrid. = ' + ordintrid + '<br>';
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	//var taskremqty=parseFloat(taskactqty)-parseFloat(reversalqty);
	var taskremqty=Number(Big(taskactqty).minus(reversalqty));

	str = str + 'taskremqty. = ' + taskremqty + '<br>';

	nlapiLogExecution('Debug', 'Function Parameters', str);
	var cartlpArray=new Array();
	if(tasktype=='Open')
	{
		var filters=new Array();
		if(taskid != null && taskid !='' && taskid !='null' && taskid !='undefined')
		{
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof', taskid));
		}
		else
		{
			if(ordintrid != null && ordintrid != '')
				filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordintrid));
			if(lineno != null && lineno != '')
				filters.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineno));
			if(vWhLoc != null && vWhLoc != '')
				filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', vWhLoc));

			//3-Putaway completed
			filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [3]));

			//2- putaway
			filters.push(new nlobjSearchFilter( 'custrecord_wmsse_tasktype', null, 'anyof', [2]));

			if(inventoryStatusFeature == true)
			{			
				filters.push(new nlobjSearchFilter( 'custrecord_wmsse_inventorystatus', null, 'anyof', inventoryStatus));
			}


		}		
		var column=new Array();
		//column[0]=new nlobjSearchColumn('custrecord_wmsse_tasktype');
		//column[0].setSort();
		var opentaskList = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskreversal', filters, null);
		
		if(opentaskList != null && opentaskList != '')
		{
			for(var i=0;i<opentaskList.length;i++)
			{
				var fields = new Array();
				var values = new Array();

				fields.push('custrecord_wmsse_notes');
				fields.push('custrecord_wmsse_reversalqty');
				fields.push('custrecord_wmsse_act_qty');


				values.push('Updated by putaway reversal process');
				values.push(parseFloat(reversalqty));
				values.push(parseFloat(taskremqty));


				if(parseFloat(taskremqty)<1)
				{
					fields.push('custrecord_wmsse_wms_status_flag');
					values.push('32');
					fields.push('custrecord_wmsse_act_end_date');
					values.push(DateStamp());

				}
				
				nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskList[i].getId(), fields, values);

			}
		}
	}
	else
	{

		var filters=new Array();
		if(taskid != null && taskid !='' && taskid !='null' && taskid !='undefined')
		{
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof', taskid));
		}
		else
		{
			if(ordintrid != null && ordintrid != '')
				filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no_clt', null, 'is', ordintrid));
			if(lineno != null && lineno != '')
				filters.push(new nlobjSearchFilter('custrecord_wmsse_line_no_clt', null, 'equalto', lineno));

			if(vWhLoc != null && vWhLoc != '')
				filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location_clt', null, 'anyof', vWhLoc));
			//3-Putaway completed
			filters.push(new nlobjSearchFilter( 'custrecord_wmsse_wms_status_flag_clt', null, 'anyof', [3]));

			//2- putaway
			filters.push(new nlobjSearchFilter( 'custrecord_wmsse_tasktype_clt', null, 'anyof', [2]));

			if(inventoryStatusFeature == true)
			{			
				filters.push(new nlobjSearchFilter( 'custrecord_wmsse_inventorystatus_clt', null, 'anyof', inventoryStatus));
			}
		}
		var column=new Array();
		//column[0]=new nlobjSearchColumn('custrecord_wmsse_tasktype_clt');
		//column[0].setSort();

		var closedtaskList = nlapiSearchRecord('customrecord_wmsse_trn_closedtask', 'customsearch_wmsse_closedtaskreversal', filters, null);
		if(closedtaskList != null && closedtaskList != '')
		{
			for(var i=0;i<closedtaskList.length;i++)
			{
				var fields = new Array();
				var values = new Array();

				fields.push('custrecord_wmsse_notes_clt');
				fields.push('custrecord_wmsse_reversalqty_clt');
				fields.push('custrecord_wmsse_act_qty_clt');
				values.push('Updated by putaway reversal process');
				values.push(parseFloat(reversalqty));
				values.push(parseFloat(taskremqty));

				if(parseFloat(taskremqty)<1)
				{
					fields.push('custrecord_wmsse_wms_status_flag_clt');
					values.push('32');
					fields.push('custrecord_wmsse_act_end_date_clt');
					values.push(DateStamp());
				}
				nlapiLogExecution('ERROR', 'Closed task id ',closedtaskList[i].getId());
				nlapiSubmitField('customrecord_wmsse_trn_closedtask', closedtaskList[i].getId(), fields, values);

			}
		} 
	}

	nlapiLogExecution('ERROR', 'Out of updateOpenTask');
}
