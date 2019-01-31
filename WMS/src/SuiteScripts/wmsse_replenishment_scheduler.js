/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

/**
 * This is an on-demand scheduler and will be initiated from Generate Replenishment screen.
 * @param type
 * @returns {Void} creates Replen tasks
 */
function ProcessReplenishment_SCH(type)
{
	nlapiLogExecution('ERROR', 'Replenishment process scheduler', type);
	if ( type == 'ondemand') 
	{
		try
		{
			var context = nlapiGetContext(); 
			var vcuruserId = context.getUser();
			var vItem = context.getSetting('SCRIPT', 'custscript_wmsse_sng_item');
			var vLocation = context.getSetting('SCRIPT', 'custscript_wmsse_sng_location');
			var vToBin = context.getSetting('SCRIPT', 'custscript_wmsse_sng_tobin');
			var vQoh = context.getSetting('SCRIPT', 'custscript_wmsse_sng_qoh');
			var vOpenPickQty = context.getSetting('SCRIPT', 'custscript_wmsse_sng_openpickqty');
			var vMaxQty = context.getSetting('SCRIPT', 'custscript_wmsse_sng_maxqty');
			var vRplnQty = context.getSetting('SCRIPT', 'custscript_wmsse_sng_replenqty');
			var vRoundQty = context.getSetting('SCRIPT', 'custscript_wmsse_sng_roundqty');
			var vBulkQty = context.getSetting('SCRIPT', 'custscript_wmsse_sng_bulkqty');
			var vToBinId = context.getSetting('SCRIPT', 'custscript_wmsse_sng_tobinid');
			var vOpenRplnQty = context.getSetting('SCRIPT', 'custscript_wmsse_sng_openreplenqty');
			var assignedTo = context.getSetting('SCRIPT', 'custscript_wmsse_sng_assignedto');
			var vStockRate = context.getSetting('SCRIPT', 'custscript_wmsse_sng_stockrate');
			var vstockUnit = context.getSetting('SCRIPT', 'custscript_wmsse_sng_stockunit');

			var vMainItemStr = context.getSetting('SCRIPT', 'custscript_wmsse_mainitem');
			var vItemFamily = context.getSetting('SCRIPT', 'custscript_wmsse_sng_rpln_itemfamily');
			var vItemGroup = context.getSetting('SCRIPT', 'custscript_wmsse_sng_rpln_itemgroup');
			var vItemClass = context.getSetting('SCRIPT', 'custscript_wmsse_sng_rpln_itemclass');
			var markValue = context.getSetting('SCRIPT', 'custscript_wmsse_sng_rpln_markall');
			var curItrValue = context.getSetting('SCRIPT', 'custscript_wmsse_sng_rpln_itr');
			var unSelectedItems = context.getSetting('SCRIPT', 'custscript_wmsse_sng_rpln_unselectedline');
			var unSelectedItemArr = [];

			var oldResponseItem1 = context.getSetting('SCRIPT', 'custscript_wmsse_sng_olditem1');
			var oldResponseItem2 = context.getSetting('SCRIPT', 'custscript_wmsse_sng_olditem2');
			var oldResponseItem3 = context.getSetting('SCRIPT', 'custscript_wmsse_sng_olditem3');
			var oldResponseItem4 = context.getSetting('SCRIPT', 'custscript_wmsse_sng_olditem4');
			var oldResponseItem5 = context.getSetting('SCRIPT', 'custscript_wmsse_sng_olditem5');
			var schRecRefValue = context.getSetting('SCRIPT', 'custscript_wmsse_sng_rpln_refno');

			var str = 'vcuruserId.' + vcuruserId + '<br/>';
			str = str + 'vItem.' + vItem + '<br/>';
			str = str + 'vLocation.' + vLocation + '<br/>';
			str = str + 'vToBin.' + vToBin + '<br/>';
			str = str + 'vQoh.' + vQoh + '<br/>';
			str = str + 'vOpenPickQty.' + vOpenPickQty + '<br/>';
			str = str + 'vMaxQty.' + vMaxQty + '<br/>';
			str = str + 'vRplnQty.' + vRplnQty + '<br/>';
			str = str + 'vRoundQty.' + vRoundQty + '<br/>';
			str = str + 'vBulkQty.' + vBulkQty + '<br/>';
			str = str + 'vToBinId.' + vToBinId + '<br/>';
			str = str + 'vOpenRplnQty' + vOpenRplnQty + '<br/>';
			str = str + 'assignedTo.' + assignedTo + '<br/>';
			str = str + 'vStockRate.' + vStockRate + '<br/>';
			str = str + 'vMainItemStr.' + vMainItemStr + '<br/>';
			str = str + 'vItemFamily.' + vItemFamily + '<br/>';
			str = str + 'vItemGroup.' + vItemGroup + '<br/>';
			str = str + 'vItemClass.' + vItemClass + '<br/>';
			str = str + 'markValue.' + markValue + '<br/>';
			str = str + 'unSelectedItems.' + unSelectedItems + '<br/>';
			str = str + 'curItrValue.' + curItrValue + '<br/>';
			str = str + 'schRecRefValue.' + schRecRefValue + '<br/>';
			str = str + 'oldResponseItem1.' + oldResponseItem1 + '<br/>';

			nlapiLogExecution('ERROR', 'Scheduler parameters',str);

			//to update the status to In Progress in Scheduler status record 
			updateScheduleScriptStatus('Generate Replenishment',vcuruserId,'In Progress',schRecRefValue,'Replenishment');

			if(markValue == 'mark')
			{
				var vMainItem = [];
				if(vMainItemStr != null && vMainItemStr != '')
					vMainItem = vMainItemStr.split(',');

				var subsidiariesArr = new Array();
				subsidiariesArr = getRoleBasedSubsidiaries(); //To fetch Role based Subsidiaries.
				nlapiLogExecution('DEBUG', 'subsidiariesArr',subsidiariesArr);

				var itemClassText = getItemClassText(vItemClass);//To fetch Item classification text value of respective internalid.

				var itemresults = new Array();
				var maxno = -1;
				itemresults = openreplenitems(vLocation,vMainItem,vItemFamily,vItemGroup,vItemClass,subsidiariesArr,itemresults,maxno);
				//Returns the list of items for which preferred bin is configured.
				nlapiLogExecution('DEBUG', 'itemresults',itemresults);

				if(itemresults != null && itemresults != '' && itemresults.length > 0)
				{ 
					nlapiLogExecution('DEBUG', 'itemresults length',itemresults.length);
					var totalUOMArr = [];
					totalUOMArr = fnGetAllUOMStockRate();//To fetch all UOM records in the respective account.

					if(unSelectedItems != null && unSelectedItems != '')
						unSelectedItemArr = unSelectedItems.split(',');

					if(curItrValue == null || curItrValue == '' || curItrValue == undefined)
						curItrValue = 0;

					for(var itemIterator = parseFloat(curItrValue); itemIterator < itemresults.length; itemIterator++)
					{
						if(parseFloat(context.getRemainingUsage()) < 200)
						{
							setRecoveryPoint();

							var curuserId = context.getUser();
							nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());
							var state = nlapiYieldScript(); // Yields scheduler once the units are completed

							if( state.status == 'FAILURE')
							{
								nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
								nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());

								var param = new Array();
								param['custscript_wmsse_mainitem'] = vMainItem;				
								param['custscript_wmsse_sng_rpln_itemfamily'] = vItemFamily;
								param['custscript_wmsse_sng_rpln_itemgroup'] = vItemGroup;
								param['custscript_wmsse_sng_rpln_itemclass'] = vItemClass;
								param['custscript_wmsse_sng_rpln_markall'] = markValue;
								param['custscript_wmsse_sng_location'] = vLocation;
								param['custscript_wmsse_sng_rpln_itr'] = itemIterator;

								nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
								return;
							} 
							else if ( state.status == 'RESUME' )
							{
								nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
							}
						}

						invtClassification = itemresults[itemIterator].getValue('locationinvtclassification');
						if(invtClassification != null && invtClassification != '' && itemClassText != null
								&& itemClassText != '' && invtClassification != itemClassText)
						{
							continue;
						}

						var itemInternalid = itemresults[itemIterator].getId();
						if(unSelectedItemArr.indexOf(itemInternalid) != -1)
						{
							continue;
						}

						var getPreferBin = itemresults[itemIterator].getValue('preferredbin');
						if(itemresults[itemIterator].getValue('preferredbin') == "T" && itemresults[itemIterator].getValue('location','binnumber') == vLocation)
						{
							var itemInternalid = itemresults[itemIterator].getId();
							var itemName = itemresults[itemIterator].getValue('name');
							var vUnitType = itemresults[itemIterator].getValue('unitstype');
							var stockUnitText = itemresults[itemIterator].getText('stockunit');
							var stockUnit = itemresults[itemIterator].getValue('stockunit');
							var getPreferBin = itemresults[itemIterator].getValue('binnumber');
							var itemqty = itemresults[itemIterator].getValue('quantityonhand');
							var replenminqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_minqty','binnumber');
							var replenmaxqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_maxqty','binnumber');
							var replenqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_qty','binnumber');
							var replenroundqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_roundqty','binnumber');
							var preferedBinId = itemresults[itemIterator].getValue('internalid','binnumber');
							var vPrefBinQOH = itemresults[itemIterator].getValue('binonhandcount');
							var vPrefBinQtyAvail = itemresults[itemIterator].getValue('binonhandavail');
							var whLocQtyAvail = itemresults[itemIterator].getValue('locationquantityavailable');
							var whLocQOH = itemresults[itemIterator].getValue('locationquantityonhand');
							var qtyAvailinWH = 'No';

							var stockConversionRate = 1;
							if(vUnitType != null && vUnitType != '' && stockUnitText != null && stockUnitText != null)
								stockConversionRate = totalUOMArr[vUnitType.toString()+stockUnitText.toString()];
				
							
							vPrefBinQOH = Number(Big(vPrefBinQOH).div(stockConversionRate));
							vPrefBinQtyAvail = Number(Big(vPrefBinQtyAvail).div(stockConversionRate));
							nlapiLogExecution('DEBUG','vPrefBinQOH Big',vPrefBinQOH);
							nlapiLogExecution('DEBUG','vPrefBinQtyAvail BIg',vPrefBinQtyAvail);
							

							if(replenminqty == null || replenminqty == '' || replenminqty == '- None -' || replenminqty == 'null')
								replenminqty=0;
							if(replenmaxqty == null || replenmaxqty == '' || replenmaxqty == '- None -' || replenmaxqty == 'null')
								replenmaxqty=0;
							if(replenqty == null || replenqty == '' || replenqty == '- None -' || replenqty == 'null')
								replenqty=0;
							if(replenroundqty == null || replenroundqty == '' || replenroundqty == '- None -' || replenroundqty == 'null')
								replenroundqty=0;
							if(vPrefBinQOH == null || vPrefBinQOH == '' || vPrefBinQOH == '- None -' || vPrefBinQOH == 'null' || isNaN(vPrefBinQOH))
								vPrefBinQOH=0;
							if(vPrefBinQtyAvail == null || vPrefBinQtyAvail == '' || vPrefBinQtyAvail == '- None -' || vPrefBinQtyAvail == 'null'
								|| isNaN(vPrefBinQtyAvail))
								vPrefBinQtyAvail=0;
							if(whLocQtyAvail == null || whLocQtyAvail == '' || whLocQtyAvail == '- None -' || whLocQtyAvail == 'null')
								whLocQtyAvail=0;

						
							var vAllocatedQty = Big(vPrefBinQOH).minus(vPrefBinQtyAvail);
							nlapiLogExecution('DEBUG','vAllocatedQty Big',vAllocatedQty);
							if((parseFloat(replenminqty) >= parseFloat(vPrefBinQOH)) && parseFloat(replenmaxqty) > 0 && parseFloat(replenminqty) >= 0 && 
									parseFloat(replenqty) > 0 && parseFloat(replenroundqty) > 0 && parseFloat(whLocQtyAvail) > 0)
							{
								var vOPenTaskPrefPickBinDetails =getOPenTaskPickBinDetailsRpln(itemInternalid,preferedBinId,vLocation,stockConversionRate);
								//To fetch Preferred bin open pick qty
								var openpickQty = 0;
								var vopenTaskBinIdArr = "";
								var vopenTaskBinQtyArr = "";
								if(vOPenTaskPrefPickBinDetails != null && 
										vOPenTaskPrefPickBinDetails != '' && 
										vOPenTaskPrefPickBinDetails.length > 0)
								{
									vopenTaskBinQtyArr = vOPenTaskPrefPickBinDetails[1];
									openpickQty = vopenTaskBinQtyArr[0];
								}

								var openRplnQty = fnOpenReplenQty(itemInternalid,vLocation,preferedBinId);
								//To get open replen quantity

								var bulkQty = 0;
								bulkQty = fnGetQtyOfBulkBins(itemInternalid, vLocation, bulkQty, preferedBinId);
								//To fetch bulk available quantity
							
								bulkQty = Number(Big(bulkQty).div(stockConversionRate));
								nlapiLogExecution('DEBUG','bulkQty Big',bulkQty);
								if(openpickQty == '' || openpickQty == null || openpickQty == undefined || openpickQty == 'null')
									openpickQty = 0;

								if(bulkQty == '' || bulkQty == null || bulkQty == undefined || bulkQty == 'null')
									bulkQty = 0;

								if(openRplnQty == '' || openRplnQty == null || openRplnQty == undefined || openRplnQty == 'null')
									openRplnQty = 0;

								//Calculating remaining quantity to replen
								openRplnQty=Big(openRplnQty);
								vPrefBinQOH=Big(vPrefBinQOH);
								
								var diffQty = Number(Big(replenmaxqty).minus((openRplnQty).plus(vPrefBinQOH).minus(openpickQty)));
								nlapiLogExecution('DEBUG','diffQty Big',diffQty);
								
								//Taking the minimum of Bulk Available Quantity and remaining quantity to replen 
								diffQty = Math.min(diffQty,bulkQty);

								if(parseFloat(diffQty) >= parseFloat(replenroundqty) || parseFloat(diffQty) != parseFloat(bulkQty))
								{
									//Rounding the final calculated quantity to replen 
									replenroundqty=Big(replenroundqty);
									diffQty = Number((Big(diffQty).div(replenroundqty)).mul(replenroundqty));
									nlapiLogExecution('DEBUG','diffQty Big',diffQty);
								}

								if(replenqty == '' || replenqty == null || replenqty  == 'null' ||
										replenqty == 0 || replenqty == undefined)
									replenqty = diffQty;

								var opentaskcount = 0;
								//no. of Opentasks
							
								opentaskcount = Big(diffQty).div(replenqty);
								nlapiLogExecution('DEBUG','opentaskcount Big',opentaskcount);
								
								//rounding to next integer
								opentaskcount = Math.ceil(opentaskcount);

								var str = 'itemInternalid.' + itemInternalid + '<br/>';
								str = str + 'preferedBinId.' + preferedBinId + '<br/>';
								str = str + 'vLocation.' + vLocation + '<br/>';
								str = str + 'vPrefBinQOH.' + vPrefBinQOH + '<br/>';
								str = str + 'openpickQty.' + openpickQty + '<br/>';
								str = str + 'replenmaxqty.' + replenmaxqty + '<br/>';
								str = str + 'replenqty.' + replenqty + '<br/>';
								str = str + 'replenroundqty.' + replenroundqty + '<br/>';
								str = str + 'bulkQty.' + bulkQty + '<br/>';
								str = str + 'openRplnQty.' + openRplnQty + '<br/>';
								str = str + 'stockConversionRate.' + stockConversionRate + '<br/>';
								str = str + 'Remaining usage at the start of creating rpln tasks for each line.' + context.getRemainingUsage() + '<br/>';
								str = str + 'diffQty.' + diffQty + '<br/>';
								str = str + 'opentaskcount.' + opentaskcount + '<br/>';

								nlapiLogExecution('ERROR', 'str',str);

								//If open replens are equal to bulk qty then system should not generate further for that item.
								//if((parseFloat(bulkQty) - parseFloat(openRplnQty)) < parseFloat(replenroundqty)  && parseFloat(openRplnQty) > 0)
								if(Number(Big(bulkQty).minus(openRplnQty)) < Number(replenroundqty)  && Number(openRplnQty) > 0)
								{
									opentaskcount = 0;
								}

								if((parseFloat(context.getRemainingUsage()) < parseFloat(opentaskcount * 7)))
								{
									setRecoveryPoint();

									var curuserId = context.getUser();
									nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());
									var state = nlapiYieldScript(); // Yields scheduler once the units are completed

									if( state.status == 'FAILURE')
									{
										nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
										nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());

										var param = new Array();
										param['custscript_wmsse_mainitem'] = vMainItem;				
										param['custscript_wmsse_sng_rpln_itemfamily'] = vItemFamily;
										param['custscript_wmsse_sng_rpln_itemgroup'] = vItemGroup;
										param['custscript_wmsse_sng_rpln_itemclass'] = vItemClass;
										param['custscript_wmsse_sng_rpln_markall'] = markValue;
										param['custscript_wmsse_sng_location'] = vLocation;
										param['custscript_wmsse_sng_rpln_itr'] = itemIterator;

										nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
										return;
									} 
									else if ( state.status == 'RESUME' )
									{
										nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
									}

								}
								if(parseFloat(opentaskcount) > 0)
								{
									//Below for loop creates replen open tasks 
									for(var createTaskItr = 0; createTaskItr < parseFloat(opentaskcount); createTaskItr++)
									{
										if(parseFloat(context.getRemainingUsage()) < 200)
										{
											setRecoveryPoint();

											var curuserId = context.getUser();
											nlapiLogExecution('Audit','Calling Second Scheduler RPLN task creation- Remaining Usage',context.getRemainingUsage());
											var state = nlapiYieldScript(); // Yielding scheduler once the units are completed

											if( state.status == 'FAILURE')
											{
												nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
												nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());

												var param = new Array();
												param['custscript_wmsse_mainitem'] = vMainItem;				
												param['custscript_wmsse_sng_rpln_itemfamily'] = vItemFamily;
												param['custscript_wmsse_sng_rpln_itemgroup'] = vItemGroup;
												param['custscript_wmsse_sng_rpln_itemclass'] = vItemClass;
												param['custscript_wmsse_sng_rpln_itr'] = itemIterator;
												param['custscript_wmsse_sng_location'] = vLocation;
												param['custscript_wmsse_sng_olditem1'] = oldResponseItem1;
												param['custscript_wmsse_sng_olditem2'] = oldResponseItem2;
												param['custscript_wmsse_sng_olditem3'] = oldResponseItem3;
												param['custscript_wmsse_sng_olditem4'] = oldResponseItem4;
												param['custscript_wmsse_sng_olditem5'] = oldResponseItem5;

												nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
												return;
											} 
											else if ( state.status == 'RESUME' )
											{
												nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
											}
										}

										var recid = nlapiCreateRecord('customrecord_wmsse_trn_opentask'); 
										//Creating replen open task					
										if(itemInternalid != null && itemInternalid != '')
											recid.setFieldValue('name', itemInternalid);
										if(itemInternalid != null && itemInternalid != '')
											recid.setFieldValue('custrecord_wmsse_sku', itemInternalid);
										if(vLocation != null && vLocation != '')
											recid.setFieldValue('custrecord_wmsse_wms_location', vLocation);
										if(preferedBinId != null && preferedBinId != '')
											recid.setFieldValue('custrecord_wmsse_actendloc', preferedBinId);

										if(replenqty != null && replenqty != '' && replenqty != 'null' &&
												replenqty != undefined)
											recid.setFieldValue('custrecord_wmsse_expe_qty', replenqty);

										if(((parseFloat(opentaskcount)-1) == parseFloat(createTaskItr)) && replenqty != null &&
												replenqty != '' && replenqty != 'null' && replenqty != undefined &&
												((parseFloat(diffQty)%parseFloat(replenqty) == 0) != true))
										{
											replenqty = (((parseFloat(diffQty)/parseFloat(replenqty))%1)*
													parseFloat(replenqty));
											replenqty = Math.round(replenqty); 
											nlapiLogExecution('DEBUG','replenqty',replenqty);
											recid.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(replenqty).toFixed(8)));
										}
										if(stockUnitText != null && stockUnitText != '' && stockUnitText != 'null' && 
												stockUnitText != undefined)
											recid.setFieldValue('custrecord_wmsse_uom', stockUnitText);
										if(assignedTo!='' && assignedTo!=null && assignedTo != 'null' &&
												assignedTo != undefined)						
											recid.setFieldValue('custrecord_wmsse_task_assignedto', assignedTo);

										recid.setFieldValue('custrecord_wmsse_wms_status_flag', '30'); //Replenishment

										recid.setFieldValue('custrecord_wmsse_tasktype', '17'); //RPLN

										if(parseFloat(replenqty) > 0)
										{
											var resultId = nlapiSubmitRecord(recid);
											nlapiLogExecution("DEBUG",'resultId',resultId);
										}
									}
								}
								else
								{
									var recid = nlapiCreateRecord('customrecord_wmsse_errorlog'); 
									//Creates error log record					
									recid.setFieldValue('name', 'Replenishment');

									recid.setFieldValue('custrecord_wmsse_error_tranref', schRecRefValue);

									recid.setFieldValue('custrecord_wmsse_error_processname', 'Generate Replenishment');

									if(itemInternalid != null && itemInternalid != '')
										recid.setFieldValue('custrecord_wmsse_error_ref1', itemInternalid);

									if(vLocation != null && vLocation != '')
										recid.setFieldValue('custrecord_wmsse_error_location', vLocation);

									if(preferedBinId != null && preferedBinId != '')
										recid.setFieldValue('custrecord_wmsse_error_ref2', preferedBinId);

									if(vcuruserId!='' && vcuruserId!=null && vcuruserId != 'null' && vcuruserId != undefined)						
										recid.setFieldValue('custrecord_wmsse_error_user', vcuruserId);

									if(bulkQty == 0 || (parseFloat(openRplnQty) >= parseFloat(bulkQty)))
										recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to insufficeint quantity in bulk sotrage locations.');
									else if(openRplnQty > 0)
										recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to open replens exists for this item.');
									else
										recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed.');

									var errResultId = nlapiSubmitRecord(recid);
									nlapiLogExecution("DEBUG",'errResultId',errResultId);
								}
							}
						}
					}
				}
			}
			else
			{
				if(vItem != null && vItem != '')
				{
					nlapiLogExecution('ERROR','vItem.length',vItem.length);

					var sItemArr = vItem.split('');

					var sToBinArr = [];
					if(vToBin != null && vToBin != '')
						sToBinArr = vToBin.split('');

					var sQohArr = [];
					if(vQoh != null && vQoh != '')
						sQohArr = vQoh.split('');

					var sOpenpickQtyArr = [];
					if(vOpenPickQty != null && vOpenPickQty != '')
						sOpenpickQtyArr = vOpenPickQty.split('');

					var sMaxQtyArr = [];
					if(vMaxQty != null && vMaxQty != '')
						sMaxQtyArr = vMaxQty.split('');

					var sReplenQtyArr = [];
					if(vRplnQty != null && vRplnQty != '')
						sReplenQtyArr = vRplnQty.split('');

					var sRoundQtyArr = [];
					if(vRoundQty != null && vRoundQty != '')
						sRoundQtyArr = vRoundQty.split('');

					var sBulkQtyArr = [];
					if(vBulkQty != null && vBulkQty != '')
						sBulkQtyArr = vBulkQty.split('');

					var sToBinIdArr = [];
					if(vToBinId != null && vToBinId != '')
						sToBinIdArr = vToBinId.split('');

					var sOpenRplnQtyArr = [];
					if(vOpenRplnQty != null && vOpenRplnQty != '')
						sOpenRplnQtyArr = vOpenRplnQty.split('');

					var sStockRateArr = [];
					if(vStockRate != null && vStockRate != '')
						sStockRateArr = vStockRate.split('');
					var sStockUnitArr = [];
					if(vstockUnit != null && vstockUnit != '')
						sStockUnitArr = vstockUnit.split('');

					var remUsage = context.getRemainingUsage();

					//Below for loop creates replen open tasks 
					for(var iterator = 0; iterator < sItemArr.length; iterator++)
					{
						if(parseInt(context.getRemainingUsage()) < (200))
						{
							setRecoveryPoint();

							var curuserId = context.getUser();
							nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());
							var state = nlapiYieldScript(); // Yields scheduler once the units are completed

							if( state.status == 'FAILURE')
							{
								nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
								nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());

								var param = new Array();
								param['custscript_wmsse_sng_item'] = sItemArr;				
								param['custscript_wmsse_sng_location'] = vLocation;
								param['custscript_wmsse_sng_tobin'] = sToBinArr;
								param['custscript_wmsse_sng_qoh'] = sQohArr;
								param['custscript_wmsse_sng_openpickqty'] = sOpenpickQtyArr;
								param['custscript_wmsse_sng_maxqty'] = sMaxQtyArr;
								param['custscript_wmsse_sng_replenqty'] = sReplenQtyArr;
								param['custscript_wmsse_sng_roundqty'] = sRoundQtyArr;
								param['custscript_wmsse_sng_bulkqty'] = sBulkQtyArr;
								param['custscript_wmsse_sng_tobinid']=sToBinIdArr;
								param['custscript_wmsse_sng_openreplenqty']=sOpenRplnQtyArr;
								param['custscript_wmsse_sng_assignedto']=assainedTo;
								param['custscript_wmsse_sng_stockrate']=sStockRateArr;
								param['custscript_wmsse_sng_stockunit']=sStockUnitArr;

								nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
								return;
							} 
							else if ( state.status == 'RESUME' )
							{
								nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
							}
						}

						var availQty = 0;
						var fromBin = '';
						var itemid = sItemArr[iterator];
						var location = vLocation;
						var toBin = '';
						var qoh = sQohArr[iterator];
						var openpickQty = sOpenpickQtyArr[iterator];
						var maxQty = sMaxQtyArr[iterator];
						var replenQty = sReplenQtyArr[iterator];
						var roundQty = sRoundQtyArr[iterator];
						var bulkQty = sBulkQtyArr[iterator];
						var toBinId = sToBinIdArr[iterator];
						var stockConversionRate = sStockRateArr[iterator];
						var stockUnitText = sStockUnitArr[iterator];

						var vOPenTaskPrefPickBinDetails =getOPenTaskPickBinDetailsRpln(itemid,toBinId,location,stockConversionRate);
						//To fetch Preferred bin open pick qty
						var openpickQty = 0;
						var vopenTaskBinIdArr = "";
						var vopenTaskBinQtyArr = "";
						if(vOPenTaskPrefPickBinDetails != null && 
								vOPenTaskPrefPickBinDetails != '' && 
								vOPenTaskPrefPickBinDetails.length > 0)
						{
							vopenTaskBinQtyArr = vOPenTaskPrefPickBinDetails[1];
							openpickQty = vopenTaskBinQtyArr[0];
						}

						var bulkQty = 0;
						bulkQty = fnGetQtyOfBulkBins(itemid, location, bulkQty, toBinId);
						//To fetch bulk available quantity
					
						bulkQty = Big(bulkQty).div(stockConversionRate);
						nlapiLogExecution('DEBUG','bulkQty Big',bulkQty);

						//To fetch open replen quantity
						var openRplnQty = fnOpenReplenQty(itemid,location,toBinId);

						if(maxQty == '' || maxQty == null || isNaN(maxQty))
							maxQty = 0;
						if(qoh == '' || qoh == null || isNaN(qoh))
							qoh = 0;
						if(openpickQty == '' || openpickQty == null || isNaN(openpickQty))
							openpickQty = 0;

						if(bulkQty == '' || bulkQty == null || isNaN(bulkQty))
							bulkQty = 0;

						if(openRplnQty == '' || openRplnQty == null || isNaN(openRplnQty))
							openRplnQty = 0;

						var str = 'toBin.' + toBin + '<br/>';
						str = str + 'itemid.' + itemid + '<br/>';
						str = str + 'location.' + location + '<br/>';
						str = str + 'qoh.' + qoh + '<br/>';
						str = str + 'openpickQty.' + openpickQty + '<br/>';
						str = str + 'maxQty.' + maxQty + '<br/>';
						str = str + 'replenQty.' + replenQty + '<br/>';
						str = str + 'roundQty.' + roundQty + '<br/>';
						str = str + 'bulkQty.' + bulkQty + '<br/>';
						str = str + 'toBinId.' + toBinId + '<br/>';
						str = str + 'openRplnQty.' + openRplnQty + '<br/>';
						str = str + 'stockConversionRate.' + stockConversionRate + '<br/>';
						str = str + 'Remaining usage at the start of creating rpln tasks for each line.' + context.getRemainingUsage() + '<br/>';

						nlapiLogExecution('ERROR', 'str',str);

						//Calculating remaining quantity to replen
					
						openRplnQty=Big(openRplnQty);
						qoh=Big(qoh);
						var diffQty = (Big(maxQty).minus((openRplnQty).plus(qoh).minus(openpickQty)));
						nlapiLogExecution('DEBUG','diffQty Big',diffQty);

						//Taking the minimum of Bulk Available Quantity and remaining quantity to replen 
						diffQty = Math.min(diffQty,bulkQty);

						if(parseFloat(diffQty) >= parseFloat(roundQty) || parseFloat(diffQty) != parseFloat(bulkQty))
						{
							//Rounding the final calculated quantity to replen 
							roundQty=Big(roundQty);
							diffQty = (Big(diffQty).div(roundQty)).mul(roundQty);
							nlapiLogExecution('ERROR','diffQty Big',diffQty);
						}

						if(replenQty == '' || replenQty == null || replenQty  == 'null' ||
								replenQty == 0 || replenQty == undefined)
							replenQty = diffQty;

						var opentaskcount = '';
						//no. of Opentasks
					
						opentaskcount = Big(diffQty).div(replenQty);
						nlapiLogExecution('ERROR','opentaskcount Big',opentaskcount);
						
						//rounding to next integer
						opentaskcount = Math.ceil(opentaskcount);
						var remUsage = context.getRemainingUsage();

						nlapiLogExecution('ERROR','diffQty,opentaskcount',diffQty+','+opentaskcount);
						if(parseFloat(context.getRemainingUsage()) < parseFloat(opentaskcount * 7))
						{
							setRecoveryPoint();

							var curuserId = context.getUser();
							nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());
							var state = nlapiYieldScript();
							if( state.status == 'FAILURE')
							{
								nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
								nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());

								var param = new Array();
								param['custscript_wmsse_sng_item'] = sItemArr;				
								param['custscript_wmsse_sng_location'] = vLocation;
								param['custscript_wmsse_sng_tobin'] = sToBinArr;
								param['custscript_wmsse_sng_qoh'] = sQohArr;
								param['custscript_wmsse_sng_openpickqty'] = sOpenpickQtyArr;
								param['custscript_wmsse_sng_maxqty'] = sMaxQtyArr;
								param['custscript_wmsse_sng_replenqty'] = sReplenQtyArr;
								param['custscript_wmsse_sng_roundqty'] = sRoundQtyArr;
								param['custscript_wmsse_sng_bulkqty'] = sBulkQtyArr;
								param['custscript_wmsse_sng_tobinid']=sToBinIdArr;
								param['custscript_wmsse_sng_openreplenqty']=sOpenRplnQtyArr;
								param['custscript_wmsse_sng_assignedto']=assainedTo;
								param['custscript_wmsse_sng_stockrate']=sStockRateArr;
								param['custscript_wmsse_sng_stockunit']=sStockUnitArr;

								nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
								return;
							} 
							else if ( state.status == 'RESUME' )
							{
								nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
							}
						}

						//If open replens are equal to bulk qty then system should not generate further for that item.
						//if((parseFloat(bulkQty) - parseFloat(openRplnQty)) < parseFloat(roundQty)  && parseFloat(openRplnQty) > 0)
						if(Number(Big(bulkQty).minus(openRplnQty)) < Number(roundQty)  && Number(openRplnQty) > 0)
						{
							opentaskcount = 0;
						}

						if(parseFloat(opentaskcount) > 0)
						{
							for(var createTaskItr = 0; createTaskItr < opentaskcount; createTaskItr++)
							{
								if(parseFloat(context.getRemainingUsage()) < 200)
								{
									setRecoveryPoint();

									var curuserId = context.getUser();
									nlapiLogExecution('Audit','Calling Second Scheduler RPLN task creation- Remaining Usage',context.getRemainingUsage());
									var state = nlapiYieldScript(); // Yielding scheduler once the units are completed

									if( state.status == 'FAILURE')
									{
										nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
										nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());

										var param = new Array();
										param['custscript_wmsse_mainitem'] = vMainItem;				
										param['custscript_wmsse_sng_rpln_itemfamily'] = vItemFamily;
										param['custscript_wmsse_sng_rpln_itemgroup'] = vItemGroup;
										param['custscript_wmsse_sng_rpln_itemclass'] = vItemClass;
										param['custscript_wmsse_sng_rpln_itr'] = itemIterator;
										param['custscript_wmsse_sng_location'] = vLocation;
										param['custscript_wmsse_sng_olditem1'] = oldResponseItem1;
										param['custscript_wmsse_sng_olditem2'] = oldResponseItem2;
										param['custscript_wmsse_sng_olditem3'] = oldResponseItem3;
										param['custscript_wmsse_sng_olditem4'] = oldResponseItem4;
										param['custscript_wmsse_sng_olditem5'] = oldResponseItem5;

										nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
										return;
									} 
									else if ( state.status == 'RESUME' )
									{
										nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
									}
								}

								var recid = nlapiCreateRecord('customrecord_wmsse_trn_opentask'); 
								//Creating replen open task					

								if(itemid != null && itemid != '')
									recid.setFieldValue('name', itemid);
								if(itemid != null && itemid != '')
									recid.setFieldValue('custrecord_wmsse_sku', itemid);
								if(location != null && location != '')
									recid.setFieldValue('custrecord_wmsse_wms_location', location);
								if(toBinId != null && toBinId != '')
									recid.setFieldValue('custrecord_wmsse_actendloc', toBinId);

								if(replenQty != null && replenQty != '' && replenQty != 'null' &&
										replenQty != undefined)
									recid.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(replenQty).toFixed(8)));

								if(((parseFloat(opentaskcount)-1) == createTaskItr) && replenQty != null &&
										replenQty != '' && replenQty != 'null' && replenQty != undefined &&
										((parseFloat(diffQty)%parseFloat(replenQty) == 0) != true))
								{
									replenQty = (((parseFloat(diffQty)/parseFloat(replenQty))%1)*
											parseFloat(replenQty));
									replenQty = Math.round(replenQty); 
									nlapiLogExecution('DEBUG','replenQty',replenQty);
									recid.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(replenQty).toFixed(8)));
								}
								if(stockUnitText != null && stockUnitText != '' && stockUnitText != 'null' && 
										stockUnitText != undefined)
									recid.setFieldValue('custrecord_wmsse_uom', stockUnitText);

								if(assignedTo!='' && assignedTo!=null && assignedTo != 'null' &&
										assignedTo != undefined)						
									recid.setFieldValue('custrecord_wmsse_task_assignedto', assignedTo);

								recid.setFieldValue('custrecord_wmsse_wms_status_flag', '30'); //Replenishment

								recid.setFieldValue('custrecord_wmsse_tasktype', '17'); //RPLN

								if(parseFloat(replenQty) > 0)
								{
									var resultId = nlapiSubmitRecord(recid);
									nlapiLogExecution("DEBUG",'resultId',resultId);
								}
							}
						}
						else
						{
							var recid = nlapiCreateRecord('customrecord_wmsse_errorlog'); 
							//Creates Error log record					
							recid.setFieldValue('name', 'Replenishment');

							recid.setFieldValue('custrecord_wmsse_error_tranref', schRecRefValue);

							recid.setFieldValue('custrecord_wmsse_error_processname', 'Generate Replenishment');

							if(itemid != null && itemid != '')
								recid.setFieldValue('custrecord_wmsse_error_ref1', itemid);

							if(location != null && location != '')
								recid.setFieldValue('custrecord_wmsse_error_location', location);

							if(toBinId != null && toBinId != '')
								recid.setFieldValue('custrecord_wmsse_error_ref2', toBinId);

							if(vcuruserId!='' && vcuruserId!=null && vcuruserId != 'null' && vcuruserId != undefined)						
								recid.setFieldValue('custrecord_wmsse_error_user', vcuruserId);

							if(bulkQty == 0 || (parseFloat(openRplnQty) >= parseFloat(bulkQty)))
								recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to insufficeint quantity in bulk sotrage locations.');
							else if(openRplnQty > 0)
								recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to open replens exists for this item.');
							else
								recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed.');

							var errResultId = nlapiSubmitRecord(recid);
							nlapiLogExecution("DEBUG",'errResultId',errResultId);
						}
					}
				}

				if(oldResponseItem1 != null && oldResponseItem1 != '' && oldResponseItem1 != undefined)
				{
					var oldItemArr1 = [];
					oldItemArr1 = oldResponseItem1.split(',');
					nlapiLogExecution("ERROR",'oldItemArr1',oldItemArr1.length+':'+oldItemArr1);
					if(oldResponseItem2 != null && oldResponseItem2 != '' && oldResponseItem2 != undefined)
					{
						var oldItemArr2 = [];
						oldItemArr2 = oldResponseItem2.split(',');
						nlapiLogExecution("ERROR",'oldItemArr2',oldItemArr2.length+':'+oldItemArr2);
						for(var oldItr = 0; oldItr < oldItemArr2.length; oldItr++)
						{
							oldItemArr1.push(oldItemArr2[oldItr]);
						}
					}
					if(oldResponseItem3 != null && oldResponseItem3 != '' && oldResponseItem3 != undefined)
					{
						var oldItemArr3 = [];
						oldItemArr3 = oldResponseItem3.split(',');
						nlapiLogExecution("ERROR",'oldItemArr3',oldItemArr3.length+':'+oldItemArr3);
						for(var oldItr = 0; oldItr < oldItemArr3.length; oldItr++)
						{
							oldItemArr1.push(oldItemArr3[oldItr]);
						}
					}
					if(oldResponseItem4 != null && oldResponseItem4 != '' && oldResponseItem4 != undefined)
					{
						var oldItemArr4 = [];
						oldItemArr4 = oldResponseItem4.split(',');
						nlapiLogExecution("ERROR",'oldItemArr4',oldItemArr4.length+':'+oldItemArr4);
						for(var oldItr = 0; oldItr < oldItemArr4.length; oldItr++)
						{
							oldItemArr1.push(oldItemArr4[oldItr]);
						}
					}
					if(oldResponseItem5 != null && oldResponseItem5 != '' && oldResponseItem5 != undefined)
					{
						var oldItemArr5 = [];
						oldItemArr5 = oldResponseItem5.split(',');
						nlapiLogExecution("ERROR",'oldItemArr5',oldItemArr5.length+':'+oldItemArr5);
						for(var oldItr = 0; oldItr < oldItemArr5.length; oldItr++)
						{
							oldItemArr1.push(oldItemArr5[oldItr]);
						}
					}
					nlapiLogExecution("ERROR",'oldItemArr1',oldItemArr1.length+':'+oldItemArr1);

					var vMainItem = [];
					if(vMainItemStr != null && vMainItemStr != '')
						vMainItem = vMainItemStr.split(',');

					var subsidiariesArr = new Array();
					subsidiariesArr = getRoleBasedSubsidiaries(); //To fetch Role based Subsidiaries
					nlapiLogExecution('DEBUG', 'subsidiariesArr',subsidiariesArr);

					var itemClassText = getItemClassText(vItemClass);

					var itemresults = new Array();
					var maxno = -1;
					itemresults = openreplenitems(vLocation,vMainItem,vItemFamily,vItemGroup,vItemClass,subsidiariesArr,itemresults,maxno);
					//Returns the list of items for which preferred bin is configured. 
					nlapiLogExecution('DEBUG', 'itemresults',itemresults);

					if(itemresults != null && itemresults != '' && itemresults.length > 0)
					{ 
						nlapiLogExecution('DEBUG', 'itemresults length',itemresults.length);
						var totalUOMArr = [];
						totalUOMArr = fnGetAllUOMStockRate();//To fetch all UOM records of respective account

						for(var itemIterator = 0; itemIterator < itemresults.length; itemIterator++)
						{
							if(parseFloat(context.getRemainingUsage()) < 200)
							{
								setRecoveryPoint();

								var curuserId = context.getUser();
								nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());
								var state = nlapiYieldScript(); // Yielding scheduler once the units are completed

								if( state.status == 'FAILURE')
								{
									nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
									nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());

									var param = new Array();
									param['custscript_wmsse_mainitem'] = vMainItem;				
									param['custscript_wmsse_sng_rpln_itemfamily'] = vItemFamily;
									param['custscript_wmsse_sng_rpln_itemgroup'] = vItemGroup;
									param['custscript_wmsse_sng_rpln_itemclass'] = vItemClass;
									param['custscript_wmsse_sng_rpln_itr'] = itemIterator;
									param['custscript_wmsse_sng_location'] = vLocation;
									param['custscript_wmsse_sng_olditem1'] = oldResponseItem1;
									param['custscript_wmsse_sng_olditem2'] = oldResponseItem2;
									param['custscript_wmsse_sng_olditem3'] = oldResponseItem3;
									param['custscript_wmsse_sng_olditem4'] = oldResponseItem4;
									param['custscript_wmsse_sng_olditem5'] = oldResponseItem5;

									nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
									return;
								} 
								else if ( state.status == 'RESUME' )
								{
									nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
								}
							}

							invtClassification = itemresults[itemIterator].getValue('locationinvtclassification');
							if(invtClassification != null && invtClassification != '' && itemClassText != null
									&& itemClassText != '' && invtClassification != itemClassText)
							{
								continue;
							}

							var itemInternalid = itemresults[itemIterator].getId();
							if(oldItemArr1.indexOf(itemInternalid) == -1)
							{
								continue;
							}

							var getPreferBin = itemresults[itemIterator].getValue('preferredbin');
							if(itemresults[itemIterator].getValue('preferredbin') == "T" && itemresults[itemIterator].getValue('location','binnumber') == vLocation)
							{
								var itemInternalid = itemresults[itemIterator].getId();
								var itemName = itemresults[itemIterator].getValue('name');
								var vUnitType = itemresults[itemIterator].getValue('unitstype');
								var stockUnitText = itemresults[itemIterator].getText('stockunit');
								var stockUnit = itemresults[itemIterator].getValue('stockunit');
								var getPreferBin = itemresults[itemIterator].getValue('binnumber');
								var itemqty = itemresults[itemIterator].getValue('quantityonhand');
								var replenminqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_minqty','binnumber');
								var replenmaxqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_maxqty','binnumber');
								var replenqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_qty','binnumber');
								var replenroundqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_roundqty','binnumber');
								var preferedBinId = itemresults[itemIterator].getValue('internalid','binnumber');
								var vPrefBinQOH = itemresults[itemIterator].getValue('binonhandcount');
								var vPrefBinQtyAvail = itemresults[itemIterator].getValue('binonhandavail');
								var whLocQtyAvail = itemresults[itemIterator].getValue('locationquantityavailable');
								var whLocQOH = itemresults[itemIterator].getValue('locationquantityonhand');
								var qtyAvailinWH = 'No';

								var stockConversionRate = 1;
								if(vUnitType != null && vUnitType != '' && stockUnitText != null && stockUnitText != null)
									stockConversionRate = totalUOMArr[vUnitType.toString()+stockUnitText.toString()];

							
								vPrefBinQOH = Number(Big(vPrefBinQOH).div(stockConversionRate));
								vPrefBinQtyAvail = Number(Big(vPrefBinQtyAvail).div(stockConversionRate));
								nlapiLogExecution('DEBUG','vPrefBinQOH Big',vPrefBinQOH);
								nlapiLogExecution('DEBUG','vPrefBinQtyAvail Big',vPrefBinQtyAvail);
								

								if(replenminqty == null || replenminqty == '' || replenminqty == '- None -' || replenminqty == 'null')
									replenminqty=0;
								if(replenmaxqty == null || replenmaxqty == '' || replenmaxqty == '- None -' || replenmaxqty == 'null')
									replenmaxqty=0;
								if(replenqty == null || replenqty == '' || replenqty == '- None -' || replenqty == 'null')
									replenqty=0;
								if(replenroundqty == null || replenroundqty == '' || replenroundqty == '- None -' || replenroundqty == 'null')
									replenroundqty=0;
								if(vPrefBinQOH == null || vPrefBinQOH == '' || vPrefBinQOH == '- None -' || vPrefBinQOH == 'null' || isNaN(vPrefBinQOH))
									vPrefBinQOH=0;
								if(vPrefBinQtyAvail == null || vPrefBinQtyAvail == '' || vPrefBinQtyAvail == '- None -' || vPrefBinQtyAvail == 'null'
									|| isNaN(vPrefBinQtyAvail))
									vPrefBinQtyAvail=0;
								if(whLocQtyAvail == null || whLocQtyAvail == '' || whLocQtyAvail == '- None -' || whLocQtyAvail == 'null')
									whLocQtyAvail=0;

							
								var vAllocatedQty = Number(Big(vPrefBinQOH).minus(vPrefBinQtyAvail));
								nlapiLogExecution('DEBUG','vAllocatedQty Big',vAllocatedQty);

								if((parseFloat(replenminqty) >= parseFloat(vPrefBinQOH)) && parseFloat(replenmaxqty) > 0 && parseFloat(replenminqty) >= 0 && 
										parseFloat(replenqty) > 0 && parseFloat(replenroundqty) > 0 && parseFloat(whLocQtyAvail) > 0)
								{
									var vOPenTaskPrefPickBinDetails =getOPenTaskPickBinDetailsRpln(itemInternalid,preferedBinId,vLocation,stockConversionRate);
									//To fetch Preferred bin open pick qty
									var openpickQty = 0;
									var vopenTaskBinIdArr = "";
									var vopenTaskBinQtyArr = "";
									if(vOPenTaskPrefPickBinDetails != null && 
											vOPenTaskPrefPickBinDetails != '' && 
											vOPenTaskPrefPickBinDetails.length > 0)
									{
										vopenTaskBinQtyArr = vOPenTaskPrefPickBinDetails[1];
										openpickQty = vopenTaskBinQtyArr[0];
									}

									var openRplnQty = fnOpenReplenQty(itemInternalid,vLocation,preferedBinId);
									//To get open replen quantity

									var bulkQty = 0;
									bulkQty = fnGetQtyOfBulkBins(itemInternalid, vLocation, bulkQty, preferedBinId);
									//To fetch bulk available quantity
									
									bulkQty = Number(Big(bulkQty).div(stockConversionRate));
									nlapiLogExecution('DEBUG','bulkQty Big',bulkQty);

									if(openpickQty == '' || openpickQty == null || openpickQty == undefined || openpickQty == 'null')
										openpickQty = 0;

									if(bulkQty == '' || bulkQty == null || bulkQty == undefined || bulkQty == 'null')
										bulkQty = 0;

									if(openRplnQty == '' || openRplnQty == null || openRplnQty == undefined || openRplnQty == 'null')
										openRplnQty = 0;

									//Calculating remaining quantity to replen
								
									openRplnQty=Big(openRplnQty);
									vPrefBinQOH=Big(vPrefBinQOH);
									var diffQty = Number(Big(replenmaxqty).minus((openRplnQty).plus(vPrefBinQOH).minus(openpickQty)));
									nlapiLogExecution('DEBUG','diffQty123 Big',diffQty);

									//Taking the minimum of Bulk Available Quantity and remaining quantity to replen 
									diffQty = Math.min(diffQty,bulkQty);

									if(parseFloat(diffQty) >= parseFloat(replenroundqty) || parseFloat(diffQty) != parseFloat(bulkQty))
									{
										//Rounding the final calculated quantity to replen 
										replenroundqty=Big(replenroundqty);
										diffQty = Number((Big(diffQty).div(replenroundqty)).mul(replenroundqty));
										nlapiLogExecution('DEBUG','diffQty456 Big',diffQty);
										
									}

									if(replenqty == '' || replenqty == null || replenqty  == 'null' ||
											replenqty == 0 || replenqty == undefined)
										replenqty = diffQty;

									var opentaskcount = 0;
									//no. of Opentasks
								
									opentaskcount = Big(diffQty).div(replenqty);
									nlapiLogExecution('DEBUG','opentaskcount Big',opentaskcount);
									
									//rounding to next integer
									opentaskcount = Math.ceil(opentaskcount);

									var str = 'itemInternalid.' + itemInternalid + '<br/>';
									str = str + 'preferedBinId.' + preferedBinId + '<br/>';
									str = str + 'vLocation.' + vLocation + '<br/>';
									str = str + 'vPrefBinQOH.' + vPrefBinQOH + '<br/>';
									str = str + 'openpickQty.' + openpickQty + '<br/>';
									str = str + 'replenmaxqty.' + replenmaxqty + '<br/>';
									str = str + 'replenqty.' + replenqty + '<br/>';
									str = str + 'replenroundqty.' + replenroundqty + '<br/>';
									str = str + 'bulkQty.' + bulkQty + '<br/>';
									str = str + 'openRplnQty.' + openRplnQty + '<br/>';
									str = str + 'stockConversionRate.' + stockConversionRate + '<br/>';
									str = str + 'Remaining usage at the start of creating rpln tasks for each line.' + context.getRemainingUsage() + '<br/>';
									str = str + 'diffQty.' + diffQty + '<br/>';
									str = str + 'opentaskcount.' + opentaskcount + '<br/>';

									nlapiLogExecution('ERROR', 'str',str);

									if((parseFloat(context.getRemainingUsage()) < parseFloat(opentaskcount * 7)))
									{
										setRecoveryPoint();

										var curuserId = context.getUser();
										nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());
										var state = nlapiYieldScript(); // Yielding scheduler once the units are completed

										if( state.status == 'FAILURE')
										{
											nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
											nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());

											var param = new Array();
											param['custscript_wmsse_mainitem'] = vMainItem;				
											param['custscript_wmsse_sng_rpln_itemfamily'] = vItemFamily;
											param['custscript_wmsse_sng_rpln_itemgroup'] = vItemGroup;
											param['custscript_wmsse_sng_rpln_itemclass'] = vItemClass;
											param['custscript_wmsse_sng_rpln_itr'] = itemIterator;
											param['custscript_wmsse_sng_location'] = vLocation;
											param['custscript_wmsse_sng_olditem1']=oldResponseItem1;
											param['custscript_wmsse_sng_olditem2']=oldResponseItem2;
											param['custscript_wmsse_sng_olditem3']=oldResponseItem3;
											param['custscript_wmsse_sng_olditem4']=oldResponseItem4;
											param['custscript_wmsse_sng_olditem5']=oldResponseItem5;

											nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
											return;
										} 
										else if ( state.status == 'RESUME' )
										{
											nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
										}

									}

									//If open replens are equal to bulk qty then system should not generate further for that item.
									if(Number(Big(bulkQty).minus(openRplnQty)) < parseFloat(replenroundqty)  && parseFloat(openRplnQty) > 0)
									{
										opentaskcount = 0;
									}

									if(parseFloat(opentaskcount) > 0)
									{
										//Below for loop creates replen open tasks 
										for(var createTaskItr = 0; createTaskItr < parseFloat(opentaskcount); createTaskItr++)
										{
											if(parseFloat(context.getRemainingUsage()) < 200)
											{
												setRecoveryPoint();

												var curuserId = context.getUser();
												nlapiLogExecution('Audit','Calling Second Scheduler RPLN task creation- Remaining Usage',context.getRemainingUsage());
												var state = nlapiYieldScript(); // Yielding scheduler once the units are completed

												if( state.status == 'FAILURE')
												{
													nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
													nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());

													var param = new Array();
													param['custscript_wmsse_mainitem'] = vMainItem;				
													param['custscript_wmsse_sng_rpln_itemfamily'] = vItemFamily;
													param['custscript_wmsse_sng_rpln_itemgroup'] = vItemGroup;
													param['custscript_wmsse_sng_rpln_itemclass'] = vItemClass;
													param['custscript_wmsse_sng_rpln_itr'] = itemIterator;
													param['custscript_wmsse_sng_location'] = vLocation;
													param['custscript_wmsse_sng_olditem1'] = oldResponseItem1;
													param['custscript_wmsse_sng_olditem2'] = oldResponseItem2;
													param['custscript_wmsse_sng_olditem3'] = oldResponseItem3;
													param['custscript_wmsse_sng_olditem4'] = oldResponseItem4;
													param['custscript_wmsse_sng_olditem5'] = oldResponseItem5;

													nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
													return;
												} 
												else if ( state.status == 'RESUME' )
												{
													nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
												}
											}

											var recid = nlapiCreateRecord('customrecord_wmsse_trn_opentask'); 
											//Creating replen open task					
											if(itemInternalid != null && itemInternalid != '')
												recid.setFieldValue('name', itemInternalid);
											if(itemInternalid != null && itemInternalid != '')
												recid.setFieldValue('custrecord_wmsse_sku', itemInternalid);
											if(vLocation != null && vLocation != '')
												recid.setFieldValue('custrecord_wmsse_wms_location', vLocation);
											if(preferedBinId != null && preferedBinId != '')
												recid.setFieldValue('custrecord_wmsse_actendloc', preferedBinId);

											if(replenqty != null && replenqty != '' && replenqty != 'null' &&
													replenqty != undefined)
												recid.setFieldValue('custrecord_wmsse_expe_qty', replenqty);

											if(((parseFloat(opentaskcount)-1) == parseFloat(createTaskItr)) && replenqty != null &&
													replenqty != '' && replenqty != 'null' && replenqty != undefined &&
													((parseFloat(diffQty)%parseFloat(replenqty) == 0) != true))
											{
												replenqty = (((parseFloat(diffQty)/parseFloat(replenqty))%1)*
														parseFloat(replenqty));
												replenqty = Math.round(replenqty); 
												nlapiLogExecution('ERROR','replenqty',replenqty);
												recid.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(replenqty).toFixed(8)));
											}
											if(stockUnitText != null && stockUnitText != '' && stockUnitText != 'null' && 
													stockUnitText != undefined)
												recid.setFieldValue('custrecord_wmsse_uom', stockUnitText);
											if(assignedTo!='' && assignedTo!=null && assignedTo != 'null' &&
													assignedTo != undefined)						
												recid.setFieldValue('custrecord_wmsse_task_assignedto', assignedTo);

											recid.setFieldValue('custrecord_wmsse_wms_status_flag', '30'); //Replenishment

											recid.setFieldValue('custrecord_wmsse_tasktype', '17'); //RPLN

											if(parseFloat(replenqty) > 0)
											{
												var resultId = nlapiSubmitRecord(recid);
												nlapiLogExecution("ERROR",'resultId',resultId);
											}
										}
									}
									else
									{
										//Creates Error Log record		
										var recid = nlapiCreateRecord('customrecord_wmsse_errorlog'); 

										recid.setFieldValue('name', 'Replenishment');

										recid.setFieldValue('custrecord_wmsse_error_tranref', schRecRefValue);

										recid.setFieldValue('custrecord_wmsse_error_processname', 'Generate Replenishment');

										if(itemInternalid != null && itemInternalid != '')
											recid.setFieldValue('custrecord_wmsse_error_ref1', itemInternalid);

										if(vLocation != null && vLocation != '')
											recid.setFieldValue('custrecord_wmsse_error_location', vLocation);

										if(preferedBinId != null && preferedBinId != '')
											recid.setFieldValue('custrecord_wmsse_error_ref2', preferedBinId);

										if(vcuruserId!='' && vcuruserId!=null && vcuruserId != 'null' && vcuruserId != undefined)						
											recid.setFieldValue('custrecord_wmsse_error_user', vcuruserId);

										if(bulkQty == 0 || (parseFloat(openRplnQty) >= parseFloat(bulkQty)))
											recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to insufficeint quantity in bulk sotrage locations.');
										else if(openRplnQty > 0)
											recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to open replens exists for this item.');
										else
											recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed.');

										var errResultId = nlapiSubmitRecord(recid);
										nlapiLogExecution("ERROR",'errResultId',errResultId);
									}
								}
							}
						}
					}
				}
			}
			nlapiLogExecution('ERROR','Scheduler executed successfully' );

			nlapiLogExecution('ERROR','Remaining Usage after scheduler execution',context.getRemainingUsage());

			if((parseFloat(context.getRemainingUsage()) < 300))
			{
				setRecoveryPoint();

				var curuserId = context.getUser();
				nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());
				var state = nlapiYieldScript(); // Yields scheduler once the units are completed

				if( state.status == 'FAILURE')
				{
					nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
					nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());
					return;
				} 
				else if ( state.status == 'RESUME' )
				{
					nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
				}
			}

			updateScheduleScriptStatus('Generate Replenishment',vcuruserId,'Completed',schRecRefValue,'Replenishment');
			//To update Schedule script status to completed

			var userId = context.getUser();
			nlapiLogExecution('ERROR','userId',userId);
			var userAccountId = context.getCompany();
			var username='';
			var vEmail='';
			try
			{
				var transaction = nlapiLoadRecord('Employee', userId);
				vEmail=transaction.getFieldValue('email');
				//username=vEmail.split('@')[0];
				username = transaction.getFieldValue('entityid');
			}
			catch(exp)
			{
				nlapiLogExecution('ERROR','exp',exp);
			}

			var locationName = '';

			var locFilters=new Array();
			if(vLocation!=null && vLocation!='')
				locFilters.push(new nlobjSearchFilter('internalid', null, 'anyof', vLocation));

			var locResults = nlapiSearchRecord('location', 'customsearch_wmsse_whloc_srh', locFilters);
			if(locResults!=null && locResults!='')
			{
				locationName = locResults[0].getValue('name');
			}

			var loadConfig = nlapiLoadConfiguration('userpreferences');
			var getTimeZone = loadConfig.getFieldValue('TIMEZONE');
			var dateRec = nlapiCreateRecord('customrecord_wmsse_datetimestamp');
			var Timez =  dateRec.getDateTimeValue('custrecord_wmsse_datestamp',getTimeZone);
			var timeArr = [];
			if(Timez != null && Timez != '')
				timeArr = Timez.split(' ');

			if(timeArr[0] == null || timeArr[0] == undefined || timeArr[0] == 'undefined' || timeArr[0] == 'null' || timeArr[0] == '')
				timeArr[0] = '';
			if(timeArr[1] == null || timeArr[1] == undefined || timeArr[1] == 'undefined' || timeArr[1] == 'null' || timeArr[1] == '')
				timeArr[1] = '';
			if(timeArr[2] == null || timeArr[2] == undefined || timeArr[2] == 'undefined' || timeArr[2] == 'null' || timeArr[2] == '')
				timeArr[2] = '';
			//nlapiLogExecution('ERROR','timeArr[0]:timeArr[1]',timeArr[0]+':'+timeArr[1]);

			var strContent="";

			var strSubject="Replenishment plan generation complete";

			strContent +="<br/>";
			strContent +="Account#:"+userAccountId;
			strContent +="<br/>";
			strContent +="Location: "+locationName;
			strContent +="<br/>";
			strContent +="Transaction Reference #: "+schRecRefValue;
			strContent +="<br/>";
			strContent +="User: "+username;
			strContent +="<br/>";
			strContent +="Date: "+timeArr[0];
			strContent +="<br/>";
			strContent +="Time: "+timeArr[1]+' '+timeArr[2];
			strContent +="<br/>";
			strContent +="Status: Replenishment tasks generated successfully.";
			strContent +="<br/>";

			var searchresults = nlapiSearchRecord('customrecord_wmsse_email_configuration', 'customsearch_wmsse_email_replenrestlet');

			var email= "";
			var emailbcc="";
			var emailcc="";
			var emailappend="";
			var emailbccappend= new Array();
			var emailccappend=new Array();
			var count=0;
			var bcccount=0;
			if(searchresults != null && searchresults != '')
			{	
				for(var srchItr=0;srchItr<searchresults.length;srchItr++)
				{
					var emailOption=searchresults[srchItr].getText('custrecord_wmsse_email_option');
					nlapiLogExecution('Debug','emailOption',emailOption);
					if(emailOption == "BCC")
					{
						var emailBCC = searchresults[srchItr].getValue('custrecord_wmsse_email_id');
						if(emailBCC != null && emailBCC != '' && emailBCC != 'null' && emailBCC != 'undefined')
						{
							emailbccappend[bcccount]=searchresults[srchItr].getValue('custrecord_wmsse_email_id');
							bcccount++;		
						}
					}
					else if(emailOption == "CC")
					{
						var emailCC = searchresults[srchItr].getValue('custrecord_wmsse_email_id');
						if(emailCC != null && emailCC != '' && emailCC != 'null' && emailCC != 'undefined')
						{
							emailccappend[count]=searchresults[srchItr].getValue('custrecord_wmsse_email_id');
							count++;
						}
					}
					else
					{
						email =searchresults[srchItr].getValue('custrecord_wmsse_email_id');
						if(email != null && email != '' && email != 'null' && email != 'undefined')
						{
							emailappend +=email+";";
						}
					}
				} 
			}
			nlapiSendEmail(userId,vEmail,strSubject,strContent,emailccappend,emailbccappend,null,null);//to trigger mail to respective mailids.
			nlapiLogExecution('ERROR', 'replenishment sch status successfully mailed to ', vEmail+","+emailccappend+","+emailbccappend);
		}
		catch(e)
		{
			var errStr = '';
			if (e instanceof nlobjError) 
			{	
				errStr = e.getDetails();
			}
			else
			{
				errStr = e.toString();
			}

			nlapiLogExecution('ERROR', 'Exception in replen scheduler',errStr);
		}
		finally
		{
			nlapiLogExecution('ERROR','Remaining Usage in finally',context.getRemainingUsage());
		}
	}
}

function setRecoveryPoint()
{
	var state = nlapiSetRecoveryPoint(); //100 point governance
	nlapiLogExecution("Audit",'state status',state.status);
	if( state.status == 'SUCCESS' ) return;  //we successfully create a new recovery point
	if( state.status == 'RESUME' ) //a recovery point was previously set, we are resuming due to some unforeseen error
	{
		nlapiLogExecution("Audit", "Resuming script because of " + state.reason+".  Size = "+ state.size);
	}
	else if ( state.status == 'FAILURE' )  //we failed to create a new recovery point
	{
		nlapiLogExecution("Audit","Failed to create recovery point. Reason = "+state.reason + " / Size = "+ state.size);
	}
}

/**
 * @returns open replen quantity
 * 
 */
function fnOpenReplenQty(internalid,VLoc,preferedbinid) 
{
	var expQty = 0;
	var actQty = 0;
	var filter = new Array();

	filter.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', internalid));

	if(VLoc!= null && VLoc!= '')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', VLoc));

	if(preferedbinid!= null && preferedbinid!= '')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', preferedbinid));

	var otResult =nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_rpln_opentask_srh', filter, null);

	if(otResult != null && otResult != '' && otResult.length>0)
	{
		for(var itr = 0; itr < otResult.length; itr++)
		{
			var tempExpQty = otResult[itr].getValue('custrecord_wmsse_expe_qty',null,'sum');
			var tempActQty = otResult[itr].getValue('custrecord_wmsse_act_qty',null,'sum');
			if(tempExpQty == '' || tempExpQty == null)
				tempExpQty = 0;
			if(tempActQty == '' || tempActQty == null)
				tempActQty = 0;
		
			expQty = Number(Big(expQty).plus(tempExpQty));
			actQty = Number(Big(actQty).plus(tempActQty));
			nlapiLogExecution('DEBUG','expQty Big',expQty);
			nlapiLogExecution('DEBUG','actQty Big',actQty);
			
			
			
		}
	}
	var remQty = Number(Big(expQty).minus(actQty));
	nlapiLogExecution('DEBUG','remQty Big',remQty);
	return remQty;
}

/**
 * @param ItemId
 * @param vBinArray
 * @param WarehouseLocation
 * @param vUnitType
 * @param StockUnitText
 * @returns Open Picks Details
 */
function getOPenTaskPickBinDetailsRpln(vItemId,vBinArray,whLocation,conversionRate)
{
	var vPickBinDetailsArr = new Array();
	var vPickBinIdArr = new Array();
	var vPickBinTextArr = new Array();
	var vPickBinQtyArr = new Array();
	var filters = new Array();

	if(vItemId != null && vItemId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', vItemId));

	if(vBinArray != null && vBinArray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', vBinArray));
	if(whLocation != null && whLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whLocation));

	var objOpenTaskDetails = new nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask','customsearch_wmsse_replen_openpicks_srh',filters, null);

	if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
	{
		for(var openPickItr = 0; openPickItr < objOpenTaskDetails.length ; openPickItr++)
		{
			var KitFlag = objOpenTaskDetails[openPickItr].getValue('custrecord_wmsse_kitflag',null,'group');
			var vPickQty = 0;
			if(KitFlag == 'T')
				vPickQty = objOpenTaskDetails[openPickItr].getValue('custrecord_wmsse_expe_qty',null,'sum');
			else
				vPickQty = objOpenTaskDetails[openPickItr].getValue('custrecord_wmsse_act_qty',null,'sum');
			var vPickBeginLocId = objOpenTaskDetails[openPickItr].getValue('custrecord_wmsse_actendloc',null,
			'group');
			var vPickBeginLocText = objOpenTaskDetails[openPickItr].getText('custrecord_wmsse_actendloc',null,
			'group');
			var vPickConversionRate = objOpenTaskDetails[openPickItr].getValue('custrecord_wmsse_conversionrate',
					null,'group');
			if(vPickConversionRate == null || vPickConversionRate == '' ||
					vPickConversionRate == '- None -')
				vPickConversionRate=1;
			if(vPickQty == null || vPickQty == '' || vPickQty == '- None -' || vPickQty == 'null')
				vPickQty=0;
			if((vPickBinIdArr.indexOf(vPickBeginLocId) ==-1) )
			{
				vPickBinIdArr.push(vPickBeginLocId);
				vPickBinTextArr.push(vPickBeginLocText);
				vPickConversionRate=Big(vPickConversionRate);
				vPickBinQtyArr.push(Number(Big(vPickQty).mul((vPickConversionRate).div(conversionRate))));
			}
			else
			{
				if(vPickBinIdArr != null && vPickBinIdArr != '' && vPickBinIdArr.length > 0)
				{

					var ind = vPickBinIdArr.indexOf(vPickBeginLocId);
					var pickBinQty = vPickBinQtyArr[ind];
					vPickConversionRate=Big(vPickConversionRate)
					var tempQty = Number(Big(vPickQty).mul((vPickConversionRate).div(conversionRate)));
					vPickBinQtyArr[ind]=Number(Big(tempQty).plus(pickBinQty));
				}
			}
		}
		vPickBinDetailsArr.push(vPickBinIdArr,vPickBinQtyArr,vPickBinTextArr);
	}

	filters=null;
	columns=null;
	objOpenTaskDetails = null;
	return vPickBinDetailsArr;
}

/**
 * 
 * @returns Bulk quantity of respective item
 */
function fnGetQtyOfBulkBins(ItemInternalId, strLocation, bulkQty, preferedbinid)
{
	var result = nlapiLoadSearch('inventorydetail', 'customsearch_wmsse_rpln_bulkbin_details');

	if(ItemInternalId!=null && ItemInternalId!='' && ItemInternalId!='undefined' && ItemInternalId!='')
		result.addFilter(new nlobjSearchFilter('item',null,'anyof', ItemInternalId));

	if(strLocation!=null && strLocation!='' && strLocation!='undefined' && strLocation!='')
		result.addFilter(new nlobjSearchFilter('location','binnumber', 'anyof', strLocation));

	var resLen = result.runSearch();

	if(bulkQty == null || bulkQty == '')
		bulkQty = 0;

	var loadsrhItr = 0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		loadsrhItr++;
		if(preferedbinid != searchResult.getValue('internalid','binnumber','group'))
			{
				var itemcountsrch= searchResult.getValue('itemcount',null,'sum');
				
				if(itemcountsrch == null || itemcountsrch == '')
					itemcountsrch = 0;
				
				bulkQty = Number(Big(bulkQty).plus(itemcountsrch));
			}
			

		if(parseFloat(loadsrhItr) == 4000)
		{
			return false;
		}
		return true;                // return true to keep iterating
			});
	return bulkQty;
}

/**
 * This function is to return Role based subsidiaries 
 * 
 */
function getRoleBasedSubsidiaries()
{
	var totSubArr = new Array();
	var subs = nlapiGetContext().getFeature('subsidiaries');
	nlapiLogExecution('ERROR', 'subs', subs);
	nlapiLogExecution('ERROR', 'test', 'test');
	if(subs != null && subs != '' && subs==true)
	{
		var vRoleLocation=new Array();
		var context=nlapiGetContext();
		var vSubsid=context.getSubsidiary();
		nlapiLogExecution('ERROR', 'vSubsid', vSubsid);
		var vRoleid=context.getRole();
		nlapiLogExecution('Debug', 'vRoleid', vRoleid);
		var vRoleSubsidArray=new Array();
		if(vRoleid !=null && vRoleid !='')
		{
			var vRolefilters=new Array();

			if(vRoleid != null && vRoleid != '')
				vRolefilters.push(new nlobjSearchFilter('internalid', null, 'anyof', vRoleid));
			vRolefilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
			var vRoleColumns=new Array();
			vRoleColumns.push(new nlobjSearchColumn('name'));
			vRoleColumns.push(new nlobjSearchColumn('subsidiaries'));
			var vRolesearchresults = nlapiSearchRecord('Role', null, vRolefilters, vRoleColumns);
			if(vRolesearchresults !=null && vRolesearchresults !='' && vRolesearchresults.length > 0)
			{
				for(var subItr = 0; subItr < vRolesearchresults.length; subItr++)
				{
					var vnRoleSubsid=vRolesearchresults[subItr].getValue('subsidiaries');
					vRoleSubsidArray.push(vnRoleSubsid);
				}
			}
		}
		nlapiLogExecution('Debug', 'vRoleSubsidArray', vRoleSubsidArray);
		if(vRoleSubsidArray != null && vRoleSubsidArray != '' && vRoleSubsidArray.length>0)
		{
			totSubArr = vRoleSubsidArray;
		}
		else
		{
			totSubArr.push(vSubsid);
		}
		nlapiLogExecution('ERROR', 'totSubArr', totSubArr);
	}
	return totSubArr;
}

/**
 * @returns Item Claissification in Text 
 * 
 */
function getItemClassText(VitemClassification)
{
	var clsText = '';
	var filter = new Array();
	var col = new Array();
	col.push(new nlobjSearchColumn('name'));

	if(VitemClassification != null && VitemClassification != '')
	{
		filter.push(new nlobjSearchFilter('internalid',null, 'is', VitemClassification));

		var result = nlapiSearchRecord('customlist_wmsse_abcvelocity',null,filter,col);
		if(result != null && result != '')
		{
			clsText = result[0].getValue('name');
		}
	}
	return clsText;
}

/**
 * 
 * @param WarehouseLocation
 * @param Item
 * @param ItemFamily
 * @param ItemGroup
 * @returns Items that are applicable for replenishment
 */
function openreplenitems(WHLoc,VItem,itemfamily,itemgroup,VitemClassification,subs,itemresults,maxno)
{
	var currow = new Array();
	var str = 'VItem.' + VItem + '<br/>';
	str = str + 'itemfamily.' + itemfamily + '<br/>';
	str = str + 'WHLoc.' + WHLoc + '<br/>';
	str = str + 'itemgroup.' + itemgroup + '<br/>';
	str = str + 'VitemClassification.' + VitemClassification + '<br/>';
	str = str + 'maxno.' + maxno + '<br/>';
	nlapiLogExecution('ERROR', 'openreplenitems parameters',str);

	var result = nlapiLoadSearch('item', 'customsearch_wmsse_rpln_item_srh');

	if(VItem != null && VItem !='' && VItem != null)
	{
		result.addFilter(new nlobjSearchFilter('internalid',null,'anyof',VItem));
	}

	/*if(subs != null && subs !='' && subs != null)
	{
		result.addFilter(new nlobjSearchFilter('subsidiary', null, 'anyof', subs));
	}*/

	if(itemfamily != null && itemfamily !='' && itemfamily != null)
	{
		result.addFilter(new nlobjSearchFilter('custitem_wmsse_itemfamily',null,'anyof',itemfamily));
	}

	if(itemgroup != null && itemgroup !='' && itemgroup != null && itemgroup != undefined)
	{
		result.addFilter(new nlobjSearchFilter('custitem_wmsse_itemgroup',null,'anyof',itemgroup));
	}

	if(WHLoc != null && WHLoc !='' && WHLoc != 'null' && WHLoc != undefined)
	{
		result.addFilter(new nlobjSearchFilter('location',null,'anyof',['@NONE@',WHLoc]));
		result.addFilter(new nlobjSearchFilter('location','binnumber','anyof',WHLoc));
	}

	if(WHLoc != null && WHLoc != '' && WHLoc != undefined)
	{
		result.addFilter(new nlobjSearchFilter('inventorylocation',null, 'anyof',WHLoc));
	}

	if(maxno != -1 && maxno != null && maxno != '' && maxno != undefined)
	{
		result.addFilter(new nlobjSearchFilter('internalidnumber', null,'greaterthan', parseInt(maxno)));
	}

	var resLen = result.runSearch();
	var srhIterator = 0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		srhIterator++;
		itemresults.push(searchResult);		
		if(parseFloat(srhIterator) == 4000)
		{
			maxno = searchResult.getValue('internalid');
			openreplenitems(WHLoc,VItem,itemfamily,itemgroup,VitemClassification,subs,itemresults,maxno);//recursive calling
			return false;
		}
		return true;                // return true to keep iterating
			});

	nlapiLogExecution('ERROR', 'srhIterator',srhIterator);
	return itemresults;
}

/**
 * 
 * @returns Stock conversion rate of all UOM records in respective account.
 */
function fnGetAllUOMStockRate()
{
	var totalUOMArr = [];
	var result = nlapiLoadSearch('unitstype', 'customsearch_wmsse_rpln_unitstype_srh');

	var resLen = result.runSearch();

	var loadsrhItr = 0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		loadsrhItr++;
		var uom = searchResult.getValue('internalid');
		var unitName = searchResult.getValue('unitname');
		var conversionRate = searchResult.getValue('conversionrate');

		totalUOMArr[uom.toString()+unitName.toString()] = conversionRate;

		if(parseFloat(loadsrhItr) == 4000)
		{
			return false;
		}
		return true;                // return true to keep iterating
			});
	return totalUOMArr;
}

function updateScheduleScriptStatus(processname,curuserId,status,transactionrefno,trantype,notes)
{
	nlapiLogExecution('DEBUG','Into updateScheduleScriptStatus',status);

	var str = 'processname. = ' + processname + '<br>';
	str = str + 'curuserId. = ' + curuserId + '<br>';	
	str = str + 'transactionrefno. = ' + transactionrefno + '<br>';	
	str = str + 'trantype. = ' + trantype + '<br>';	
	str = str + 'notes. = ' + notes + '<br>';	

	nlapiLogExecution('Debug', 'Function Parameters', str);

	if(status=='Submitted')
	{
		var datetime = DateStamp() +" "+ getClockTime();   
		var schedulestatus = nlapiCreateRecord('customrecord_wmsse_schscripts_status');
		schedulestatus.setFieldValue('name',processname);
		if(processname != null && processname != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprsname',processname);
		if(status != null && status != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprsstatus',status);
		if(datetime != null && datetime != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprsinitiateddatetime',datetime);
		if(transactionrefno != null && transactionrefno != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprstranrefno',transactionrefno);
		if(curuserId!=null && curuserId!='')
			schedulestatus.setFieldValue('custrecord_wmsse_schprsinitiatedby',curuserId);
		if(trantype != null && trantype != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprstrantype',trantype);
		var tranid = nlapiSubmitRecord(schedulestatus);
	}
	else if(status=='In Progress') 
	{
		var filter=new Array();
		if(curuserId!=null && curuserId!='')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsinitiatedby',null,'anyof',curuserId));
		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsstatus',null,'is','Submitted'));
		if(processname != null && processname != '')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname',null,'is',processname));
		if(transactionrefno != null && transactionrefno != '')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',null,'is',transactionrefno));

		var column=new Array();
		column[0]=new nlobjSearchColumn('custrecord_wmsse_schprsname');
		column[1]=new nlobjSearchColumn('id').setSort();

		var searchresult=nlapiSearchRecord('customrecord_wmsse_schscripts_status',null,filter,column);
		if(searchresult!=null && searchresult!='')
		{
			var vid=searchresult[0].getId();
			nlapiLogExecution('DEBUG','vid in In Progress',vid);
			var fields = new Array();
			var values = new Array();

			fields[0] = 'custrecord_wmsse_schprsstatus';
			fields[1] = 'custrecord_wmsse_schprsbegindate';
			fields[2] = 'custrecord_wmsse_schprsbegintime';

			values[0] = status;
			values[1] = DateStamp();
			values[2] = TimeStamp();

			nlapiSubmitField('customrecord_wmsse_schscripts_status', vid, fields, values);
		}

	}
	else if(status=='Completed') 
	{
		var filter=new Array();
		if(curuserId!=null && curuserId!='')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsinitiatedby',null,'anyof',curuserId));

		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsstatus',null,'is','In Progress'));

		if(processname != null && processname != '')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname',null,'is',processname));

		if(transactionrefno != null && transactionrefno != '')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',null,'is',transactionrefno));

		var column=new Array();
		column[0]=new nlobjSearchColumn('custrecord_wmsse_schprsname');
		column[1]=new nlobjSearchColumn('id').setSort();

		var searchresult=nlapiSearchRecord('customrecord_wmsse_schscripts_status',null,filter,column);
		if(searchresult!=null && searchresult!='')
		{
			var vid=searchresult[0].getId();
			nlapiLogExecution('DEBUG','vid in In Completed',vid);
			var fields = new Array();
			var values = new Array();

			fields[0] = 'custrecord_wmsse_schprsstatus';
			fields[1] = 'custrecord_wmsse_schprsenddate';
			fields[2] = 'custrecord_wmsse_schprsendtime';
			fields[3] = 'custrecord_wmsse_schprsnotes';
			if(notes == null || notes =='' || notes =='null' || notes =='undefined')
				notes ='';
			values[0] = status;
			values[1] = DateStamp();
			values[2] = TimeStamp();
			values[3] = notes;

			nlapiSubmitField('customrecord_wmsse_schscripts_status', vid, fields, values);
		}
	}
	nlapiLogExecution('DEBUG','updateScheduleScriptStatus end',transactionrefno);
}