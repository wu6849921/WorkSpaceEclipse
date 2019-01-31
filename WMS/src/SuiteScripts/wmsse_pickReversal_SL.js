/**
 * Script Description
 * This script used to reverse item receipts for selected order put away tasks/item receipts.
 */

/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function pickReversal(request, response){
	if(request.getMethod() == 'GET'){
		nlapiLogExecution('ERROR', 'pickReversal - GET', 'Start');
		var form = nlapiCreateForm('Pick Reversal');
		var hiddenQueryParams=form.addField('custpage_qeryparams', 'text', 'queryparams').setDisplayType('hidden');
		var hiddenField_selectpage = form.addField('custpage_hiddenfieldselectpage', 'text', '').setDisplayType('hidden');
		hiddenField_selectpage.setDefaultValue('F');
		form.setScript('customscript_wmsse_pickreversal_cl');
		form.addButton('custpage_back','Back','backtogeneratesearch()');
		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		
		createOrderSublist(form, request, response,inventoryStatusFeature);

		var taskList = getTasksForReversal(request,form,inventoryStatusFeature);

		if(taskList != null && taskList.length > 0){
			setPagingForSublist(taskList,form,inventoryStatusFeature);
		}

		form.addSubmitButton('Submit');

		response.writePage(form);

		nlapiLogExecution('DEBUG', 'outboundReversal - GET', 'End');
	} else if (request.getMethod() == 'POST'){

		nlapiLogExecution('ERROR', 'outboundReversal - POST', 'Start');
		try
		{
			var context = nlapiGetContext();
			nlapiLogExecution('ERROR','Remaining usage at the start of GET',context.getRemainingUsage());
			var form = nlapiCreateForm('Pick Reversal');
			form.setScript('customscript_wmsse_pickreversal_cl');

			var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');
			var hiddenQueryParams=form.addField('custpage_qeryparams', 'text', 'queryparams').setDisplayType('hidden');
			var hiddenField_selectpage = form.addField('custpage_hiddenfieldselectpage', 'text', '').setDisplayType('hidden');
			hiddenField_selectpage.setDefaultValue('F');
			nlapiLogExecution('DEBUG','custpage_hiddenfieldselectpage',request.getParameter('custpage_hiddenfieldselectpage'));

			if(request.getParameter('custpage_qeryparams')!=null)
			{
				hiddenQueryParams.setDefaultValue(request.getParameter('custpage_qeryparams'));
			}
			form.addButton('custpage_back','Back','backtogeneratesearch()');
			//Check Inventorystatus Feature is turn on/off
			var inventoryStatusFeature = isInvStatusFeatureEnabled();
			if(request.getParameter('custpage_hiddenfieldselectpage')=='F')
			{

				//Retrieve the number of items for which wave needs to be created
				var lineCount = request.getLineItemCount('custpage_reversalitems');
				var vSuccessMsg='N';

				var ordNoArr = new Array();
				var contlpArr = new Array();
				var selectedCount = 0;

				for(var k = 1; k <= lineCount; k++){
					var selectValue = request.getLineItemValue('custpage_reversalitems', 'custpage_po', k);
					if(selectValue == 'T')
					{
						selectedCount++;
					}
				}
				nlapiLogExecution('DEBUG', 'selectedCount', selectedCount);
				var linecheckarray = new Array();
				var kitItemLenth = 0;
				var alreadyDeletedIFnumbers =  new Array();
				for(var k = 1; k <= lineCount; k++){
					var selectValue = request.getLineItemValue('custpage_reversalitems', 'custpage_po', k);
					var kitItemsArr = new Array();
					if(selectValue == 'T')
					{
						var ordid=request.getLineItemValue('custpage_reversalitems', 'custpage_poinernno', k);

						var whlocation=request.getLineItemValue('custpage_reversalitems', 'custpage_location', k);
						nlapiLogExecution('DEBUG', 'ordid', ordid);
						nlapiLogExecution('DEBUG', 'ordNoArr.indexOf(ordid)', ordNoArr.indexOf(ordid));
						if(ordNoArr.indexOf(ordid) == -1)
						{
							ordNoArr.push(ordid);
							var NSConfirmationNotNulltasks = getOpenTaskDetails(ordid,null,whlocation);
							var NSConfirmationNotNulltaskslength = 0;
							if(NSConfirmationNotNulltasks != null && NSConfirmationNotNulltasks != '')
							{
								NSConfirmationNotNulltaskslength = NSConfirmationNotNulltasks.length;								
							}
							else
							{
								NSConfirmationNotNulltaskslength = 0;
							}
							var NSConfBeforeLength = request.getLineItemValue('custpage_reversalitems', 'custpage_packrecordcount', k);
							nlapiLogExecution('DEBUG', 'NSConfirmationNotNulltaskslength,NSConfBeforeLength', NSConfirmationNotNulltaskslength+','+NSConfBeforeLength);
							if(parseFloat(NSConfirmationNotNulltaskslength) != parseFloat(NSConfBeforeLength))
							{
								nlapiLogExecution('DEBUG','record changed');
								msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'Record has been changed.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
								response.writePage(form);
								return;
							}
						}

						var taskid=request.getLineItemValue('custpage_reversalitems', 'custpage_taskid', k);
						var taskqty=request.getLineItemValue('custpage_reversalitems', 'custpage_qty', k);
						var ordlineno=request.getLineItemValue('custpage_reversalitems', 'custpage_lineno', k);
						var taskactloc=request.getLineItemValue('custpage_reversalitems', 'custpage_actloc', k);
						var taskbeginloc=request.getLineItemValue('custpage_reversalitems', 'custpage_beginloc', k);
						var taskactlocId=request.getLineItemValue('custpage_reversalitems', 'custpage_actlocid', k);						
						var itemid=request.getLineItemValue('custpage_reversalitems', 'custpage_itemintrid', k);
						var tasktype=request.getLineItemValue('custpage_reversalitems', 'custpage_tasktype', k);
						var trantype=request.getLineItemValue('custpage_reversalitems', 'custpage_trantype', k);
						var status=request.getLineItemValue('custpage_reversalitems', 'custpage_statusvalue', k);
						var nsrefno=request.getLineItemValue('custpage_reversalitems', 'custpage_nsrefno', k);
						var uom=request.getLineItemValue('custpage_reversalitems', 'custpage_uom', k);
						var lotno=request.getLineItemValue('custpage_reversalitems', 'custpage_lotbatch', k);
						var serials=request.getLineItemValue('custpage_reversalitems', 'custpage_serailno', k);
						var parentSku=request.getLineItemValue('custpage_reversalitems', 'custpage_parentsku', k);
						var iscomponentitem = request.getLineItemValue('custpage_reversalitems', 'custpage_iscomponentitem', k);
						var vBinTrIntId=request.getLineItemValue('custpage_reversalitems', 'custpage_btrefno', k);
						var vContLP=request.getLineItemValue('custpage_reversalitems', 'custpage_contlp', k);
						var whlocation=request.getLineItemValue('custpage_reversalitems', 'custpage_location', k);
						var sonumber=request.getLineItemValue('custpage_reversalitems', 'custpage_pono', k);
						var vStatus="";
						var vStatusId="";
						if(inventoryStatusFeature == true)
						{
							vStatus=request.getLineItemValue('custpage_reversalitems', 'custpage_inventorystatus', k);
							vStatusId=request.getLineItemValue('custpage_reversalitems', 'custpage_inventorystatusid', k);
						}
						var soArray = new Array();
						soArray = sonumber.split('#');
						nlapiLogExecution('DEBUG', "soArray[1]", sonumber);
						sonumber = soArray[1];


						if(contlpArr.indexOf(vContLP) == -1)
						{
							contlpArr.push(vContLP);
						}

						nlapiLogExecution('Debug', "iscomponentitem", iscomponentitem);
						if((parentSku != itemid) && (iscomponentitem =='T'))
						{
							var currRow = parentSku+","+ordlineno+","+ordid;


							if(kitItemsArr.indexOf(currRow)==-1)
							{
								nlapiLogExecution('DEBUG', "INSIDE @");
															
								var opentaskordersearchresultkit=new Array();
								var objopentaskordersearchresultkit = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_rf_pickrevofpack');
															
								if(ordid != null && ordid != '')
									objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordid)); 
								objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', ordlineno));
								objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
								objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8','28']));//8 picking completed

								objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0')); 
								objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0.0'));//intTotPickQty
								objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('isinactive',null,'is','F'));
								//nfilter.push(new nlobjSearchFilter('type', 'custrecord_wmsse_sku', 'noneof',['NonInvtPart','OthCharge','Service','DwnLdItem','GiftCert']));
								if(parentSku != null && parentSku != '')
									objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_parent_sku_no', null, 'anyof', parentSku)); 

								var resLenDetails = objopentaskordersearchresultkit.runSearch();

								var resultsPage = resLenDetails.getResults(0, 1000);
								var offset = 0;
								while (!!resultsPage && resultsPage.length > 0) 
								{
									opentaskordersearchresultkit = opentaskordersearchresultkit.concat(resultsPage);
									offset += 1000;
									resultsPage = resLenDetails.getResults(offset, offset + 1000);
								}


								if(opentaskordersearchresultkit != null  && opentaskordersearchresultkit != '' && opentaskordersearchresultkit  != 'null' )
								{
									kitItemLenth = opentaskordersearchresultkit.length;
								}

								kitItemsArr.push(currRow);
							}
							else
							{
								nsrefno =null;
							}
						}

						nlapiLogExecution('DEBUG', "nsrefno", nsrefno);
						var itemType = nswms_GetItemType(itemid);

						if((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") && (nsrefno == null || nsrefno == '' || nsrefno == 'null') && (vBinTrIntId == null || vBinTrIntId == 'null' ||vBinTrIntId == ''))
						{
							var opentaskSerialArr1 = new Array();
							nlapiLogExecution('DEBUG','ordlineno', ordlineno);
							nlapiLogExecution('DEBUG','ordid', ordid);
							if(serials != null && serials != '' && serials != 'null' && serials != 'undefined')
							{
								opentaskSerialArr1 = serials.split(',');
							}
							//fetch serials from serial entry
							var filters = new Array();
							var serialArray='';
							//filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
							filters.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseInt(ordlineno)));									
							filters.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', ordid));
							var columns = new Array();
							columns.push(new nlobjSearchColumn('custrecord_wmsse_ser_no'));
							columns.push(new nlobjSearchColumn('name'));
							var SrchRecordSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_pickrev_serials', filters,columns);
							nlapiLogExecution('DEBUG','SrchRecordSerial', SrchRecordSerial);
							if(SrchRecordSerial != null && SrchRecordSerial != '')
							{
								for(var m=0;m<SrchRecordSerial.length;m++)
								{
									if(opentaskSerialArr1.indexOf(SrchRecordSerial[m].getValue('custrecord_wmsse_ser_no')) != -1)
									{
										var vRecId=SrchRecordSerial[m].getId();
										nlapiLogExecution('DEBUG', 'Deleted serial entry', vRecId);
										nlapiDeleteRecord('customrecord_wmsse_serialentry', vRecId);
									}
								}
							}
						}
						performTaskReversal(ordid,ordlineno,taskid,taskqty,itemid,tasktype,taskactloc,status,trantype,nsrefno,lotno,serials,parentSku,vBinTrIntId,
								kitItemLenth,taskbeginloc,taskactlocId,k,lineCount,selectedCount,whlocation,sonumber,linecheckarray,alreadyDeletedIFnumbers,vStatusId,inventoryStatusFeature,serials);
						vSuccessMsg='T';

					}
				}

				if(vSuccessMsg=='T')
				{


					if((ordNoArr != null && ordNoArr != '' && ordNoArr.length > 0) || (contlpArr != null && contlpArr != '' && contlpArr.length >0))
					{
						var opentaskorderSearchresultKitTasks=new Array();
						var SORecinternalidsresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh');
							
						SORecinternalidsresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordNoArr));
						SORecinternalidsresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8','28']));
						SORecinternalidsresult.addFilter(new nlobjSearchFilter('type', 'custrecord_wmsse_sku','anyof', ['Kit']));
						SORecinternalidsresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null,'anyof', ['3']));
						var resLenDetails = SORecinternalidsresult.runSearch();
										
										
						var resultsPage = resLenDetails.getResults(0, 1000);
						var offset = 0;
						while (!!resultsPage && resultsPage.length > 0) 
						{
							opentaskorderSearchresultKitTasks = opentaskorderSearchresultKitTasks.concat(resultsPage);
							offset += 1000;
							resultsPage = resLenDetails.getResults(offset, offset + 1000);
						}
						nlapiLogExecution('DEBUG', "opentaskorderSearchresultKitTasks", opentaskorderSearchresultKitTasks);

						if(opentaskorderSearchresultKitTasks!=null && opentaskorderSearchresultKitTasks != '' && opentaskorderSearchresultKitTasks != 'null' && opentaskorderSearchresultKitTasks != 'undefined')
						{
							for(k2=0;k2<opentaskorderSearchresultKitTasks.length;k2++)
							{
								var taskqty = opentaskorderSearchresultKitTasks[k2].getValue('custrecord_wmsse_act_qty');
								var ordlineno = opentaskorderSearchresultKitTasks[k2].getValue('custrecord_wmsse_line_no');
								var itemid = opentaskorderSearchresultKitTasks[k2].getValue('custrecord_wmsse_sku');
								var ordid = opentaskorderSearchresultKitTasks[k2].getValue('custrecord_wmsse_order_no');
								var wmsstatus = opentaskorderSearchresultKitTasks[k2].getValue('custrecord_wmsse_wms_status_flag');
								updateOBOpentask(taskqty,opentaskorderSearchresultKitTasks[k2].getId(),taskqty,itemid,ordid,'',ordlineno,'Open',wmsstatus);
							}
						}

						var packArr = new Array();

						if(contlpArr.length >0)
						{
							packArr = contlpArr;
						}
						else
						{
							packArr = ordNoArr;
						}


						for(var p=0;p<packArr.length;p++)
						{												
							var opentaskorderSearchresultPackTasks=new Array();
							var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_pickreversalofpack');
											
							if(	ordNoArr != null && 	ordNoArr != '' && 	ordNoArr != 'null' && 	ordNoArr != 'undefined' && 	ordNoArr.length > 0)
							{
								OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordNoArr));
							}
							if(	contlpArr != null && 	contlpArr != '' && 	contlpArr != 'null' && 	contlpArr != 'undefined' && 	contlpArr.length > 0)
							{
								if(	contlpArr[p] != null && 	contlpArr[p] != '' && 	contlpArr[p] != 'null' && 	contlpArr[p] != 'undefined')
								{
									nlapiLogExecution('DEBUG', "contlpArr[p]", contlpArr[p]);
									OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'is', contlpArr[p]));
								}
							}
							OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['28']));

							
							var resLenDetails = OTsearchresult.runSearch();
							var resultsPage = resLenDetails.getResults(0, 1000);
							var offset = 0;
							while (!!resultsPage && resultsPage.length > 0) 
							{
								opentaskorderSearchresultPackTasks = opentaskorderSearchresultPackTasks.concat(resultsPage);
								offset += 1000;
								resultsPage = resLenDetails.getResults(offset, offset + 1000);
							}
							nlapiLogExecution('DEBUG', "opentaskorderSearchresultPackTasks", opentaskorderSearchresultPackTasks);

							if(opentaskorderSearchresultPackTasks != null && opentaskorderSearchresultPackTasks != '' && opentaskorderSearchresultPackTasks != 'null' && opentaskorderSearchresultPackTasks != 'undefined'){
								var pickTasksExist =false;

								for(var p=0;p<opentaskorderSearchresultPackTasks.length;p++)
								{
									var taskType= opentaskorderSearchresultPackTasks[p].getValue('custrecord_wmsse_tasktype',null,'group');
									var skuType= opentaskorderSearchresultPackTasks[p].getValue('type','custrecord_wmsse_sku','group');
									
									if((taskType == '3' || taskType == 3) && (skuType != 'Kit'))
									{
										pickTasksExist =true;
										break;
									}

								}

								
								var logMsg1 = 'pickTasksExist =' + pickTasksExist + '<br>';
								logMsg1 = logMsg1 + 'opentaskorderSearchresultPackTasks.length = ' + opentaskorderSearchresultPackTasks.length + '<br>';
								nlapiLogExecution('DEBUG', 'parameters', logMsg1);
								
								for(var p=0;p<opentaskorderSearchresultPackTasks.length && pickTasksExist == false;p++)
								{

									var fields = new Array();
									var values = new Array();

									fields.push('custrecord_wmsse_notes');
									fields.push('custrecord_wmsse_nsconfirm_ref_no');
									fields.push('custrecord_wmsse_nstrn_ref_no');


									values.push('Updated by outbound reversal process');
									values.push(null);
									values.push(null);
									fields.push('custrecord_wmsse_wms_status_flag');
									values.push('33');


									nlapiLogExecution('DEBUG', 'open task id ',opentaskorderSearchresultPackTasks[p].getValue('internalid',null,'max')); 

									nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskorderSearchresultPackTasks[p].getValue('internalid',null,'max'), fields, values); 
								}
							}
						}
					}

					//showInlineMessage(form, 'Confirmation', 'Outbound reversal completed successfully');
					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation', 'Outbound reversal completed successfully', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
					response.writePage(form);
					return;
				}

				else
				{
					//showInlineMessage(form, 'ERROR', 'Please select atleast one line ');
					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'Please select atleast one line ', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
					response.writePage(form);
					return;
				}
				//form.addSubmitButton('Submit');

			}
			else
			{
				createOrderSublist(form, request, response,inventoryStatusFeature);

				var taskList = getTasksForReversal(request,form,inventoryStatusFeature);

				if(taskList != null && taskList.length > 0){
					setPagingForSublist(taskList,form,inventoryStatusFeature);
				}

				form.addSubmitButton('Submit');
			}
			nlapiLogExecution('ERROR','Remaining usage at the start of GET',context.getRemainingUsage());
		}
		catch(exp) {
			nlapiLogExecution('ERROR', 'Exception in Outbound Reversal ', exp);	
			//showInlineMessage(form, 'Error', 'Outbound Reversal Failed', "");
			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'Outbound Reversal Failed', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
			response.writePage(form);
			return;
		}
		response.writePage(form);
	}

}

function performTaskReversal(ordid,ordlineno,taskid,taskqty,itemid,tasktype,taskactloc,wmsstatus,trantype,nsrefno,lotno,serials,parentSku,
		vBinTrIntId,kitItemLenth,taskbeginloc,taskactlocId,k,lineCount,selectedCount,whlocation,sonumber,linecheckarray,alreadyDeletedIFnumbers,vStatusId,inventoryStatusFeature,serials)
{

	var str = 'ordid. = ' + ordid + '<br>';	
	str = str + 'ordlineno. = ' + ordlineno + '<br>';
	str = str + 'taskid. = ' + taskid + '<br>';
	str = str + 'taskqty. = ' + taskqty + '<br>';	 
	str = str + 'itemid. = ' + itemid + '<br>';
	str = str + 'trantype. = ' + trantype + '<br>';
	str = str + 'nsrefno. = ' + nsrefno + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'vBinTrIntId. = ' + vBinTrIntId + '<br>';
	str = str + 'taskbeginloc. = ' + taskbeginloc + '<br>';
	str = str + 'taskactlocId. = ' + taskactlocId + '<br>';
	str = str + 'vStatusId. = ' + vStatusId + '<br>';
	str = str + 'serials. = ' + serials + '<br>';
	nlapiLogExecution('DEBUG', 'performTaskReversal Parameters', str);
	vblnUpdOpentask='T';
	if(nsrefno != null && nsrefno != '' &&  nsrefno != 'null' &&  nsrefno != 'undefined')
	{
		var vIFId = updateTransaction(ordid,ordlineno,taskqty,itemid,nsrefno,taskactloc,lotno,serials,parentSku,'itemfulfillment',kitItemLenth,
				taskbeginloc,taskactlocId,k,lineCount,selectedCount,whlocation,sonumber,vBinTrIntId,null,alreadyDeletedIFnumbers,vStatusId,inventoryStatusFeature,serials);
		if(vIFId != null && vIFId != '' && vIFId != 'null' && vIFId != 'undefined')
			vblnUpdOpentask='T';
		else
			vblnUpdOpentask='F';
	}
	if(vBinTrIntId != null && vBinTrIntId != '' &&  vBinTrIntId != 'null' &&  vBinTrIntId != 'undefined' && vblnUpdOpentask == 'T')
	{
		var vBTId = updateTransaction(ordid,ordlineno,taskqty,itemid,vBinTrIntId,taskactloc,lotno,serials,parentSku,'bintransfer',kitItemLenth,
				taskbeginloc,taskactlocId,k,lineCount,selectedCount,whlocation,sonumber,'',linecheckarray,alreadyDeletedIFnumbers,vStatusId,inventoryStatusFeature,serials);
		if(vBTId != null && vBTId != '' && vBTId != 'null' && vBTId != 'undefined')
			vblnUpdOpentask='T';
		else
			vblnUpdOpentask='F';
	}
	nlapiLogExecution('DEBUG', 'vIFId : vBTId', vIFId + ' : ' + vBTId);
	if(vblnUpdOpentask == 'T' || alreadyDeletedIFnumbers.indexOf(nsrefno) !=-1 || alreadyDeletedIFnumbers.indexOf(vBinTrIntId) !=-1 )
	{
		updateOBOpentask(taskqty,taskid,taskqty,itemid,ordid,taskactloc,ordlineno,tasktype,wmsstatus,vStatusId);
	}

}

function createOrderSublist(form, request, response,inventoryStatusFeature){
	var sublist = form.addSubList("custpage_reversalitems", "list", "ItemList");
	sublist.addMarkAllButtons();
	sublist.addField("custpage_po", "checkbox", "Confirm").setDefaultValue('F');
	sublist.addField("custpage_pono", "text", "Transaction #");
	sublist.addField("custpage_locationname", "text", "location");
	sublist.addField("custpage_lineno", "text", "Line #");
	sublist.addField("custpage_item", "text", "Item");
	sublist.addField("custpage_qty", "text", "Qty");
	//Inventorystatus Feature is enabled
	if(inventoryStatusFeature == true)
	{
		sublist.addField("custpage_inventorystatus", "text", "Inventory Status");
		sublist.addField("custpage_inventorystatusid", "text", "StatusId").setDisplayType('hidden');
	}
	sublist.addField("custpage_uom", "text", "Units");
	sublist.addField("custpage_conertionrate", "text", "Convertion Rate").setDisplayType('hidden');
	sublist.addField("custpage_lotbatch", "text", "Lot #");
	sublist.addField("custpage_binloc", "text", "Bin Location");	  
	sublist.addField("custpage_serailno", "textarea", "Serial #");
	sublist.addField("custpage_status", "text", "Status");
	sublist.addField("custpage_poinernno", "text", "SONo").setDisplayType('hidden');	
	sublist.addField("custpage_location", "text", "location").setDisplayType('hidden');
	sublist.addField("custpage_company", "text", "Company").setDisplayType('hidden');
	sublist.addField("custpage_itemintrid", "text", "ITEM ID").setDisplayType('hidden');	 
	sublist.addField("custpage_taskid", "text", "Task Id").setDisplayType('hidden');
	sublist.addField("custpage_tasktype", "text", "Task Type").setDisplayType('hidden');
	sublist.addField("custpage_actloc", "text", "ActualLoc").setDisplayType('hidden');
	sublist.addField("custpage_statusvalue", "text", "Status").setDisplayType('hidden');
	sublist.addField("custpage_trantype", "text", "Transaction Type");
	sublist.addField("custpage_nsrefno", "text", "Ns Ref").setDisplayType('hidden');
	sublist.addField("custpage_btrefno", "text", "Bt Ref").setDisplayType('hidden');
	sublist.addField("custpage_iscomponentitem", "text", "componentitem").setDisplayType('hidden');
	sublist.addField("custpage_parentsku", "text", "parent sku").setDisplayType('hidden');
	sublist.addField("custpage_contlp", "text", "Container LP#").setDisplayType('hidden');
	sublist.addField("custpage_beginloc", "text", "Begin Loc#").setDisplayType('hidden');
	sublist.addField("custpage_actlocid", "text", "End LocId#").setDisplayType('hidden');
	sublist.addField("custpage_packrecordcount", "text", "Packed Records Count").setDisplayType('hidden');


}



var searchResultArray=new Array();

function getTasksForReversal(request,form,inventoryStatusFeature){

	// Validating all the request parameters and pushing to a local array
	var localVarArray;
	//this is to maintain the querystring parameters while refreshing the paging drop down
	if (request.getMethod() == 'POST') {
		var queryparams=request.getParameter('custpage_qeryparams');
		nlapiLogExecution('DEBUG', 'queryparams', queryparams);
		var tempArray=new Array();
		tempArray.push(queryparams.split(','));
		localVarArray=tempArray;
		nlapiLogExecution('DEBUG', 'tempArray', tempArray.length);
	}
	else
	{
		localVarArray = validateRequestParams(request,form);
		nlapiLogExecution('DEBUG', 'localVarArray', localVarArray);
	}

	var opentaskList=new Array();
	var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_otsearch_pickrev_conf');
	// Sales Order No
	if(localVarArray[0][0] != "")
		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', localVarArray[0][0]));

	if(localVarArray[0][1] != "")
	{
		nlapiLogExecution('DEBUG', 'localVarArray[0][1]', localVarArray[0][1]);
		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', localVarArray[0][1]));	

	}
	if(localVarArray[0][3] != "")
	{

		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', localVarArray[0][3]));	

	}
	OTsearchresult.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_wms_status_flag', null, 'anyof', ['28','8']));
	OTsearchresult.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_tasktype', null, 'anyof', ['3']));
	OTsearchresult.addFilter(new nlobjSearchFilter('type','custrecord_wmsse_sku','noneof',['Kit']));
	
	var resLenDetails = OTsearchresult.runSearch();
	
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		opentaskList = opentaskList.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}
	
	var orderid = localVarArray[0][0];
	var pickReport = localVarArray[0][1];
	var vLocation=localVarArray[0][3];

	var NSConfirmationNotNulltasks = getOpenTaskDetails(orderid,pickReport,vLocation);

	nlapiLogExecution('DEBUG', 'opentaskList', opentaskList);
	searchResultArray.push(opentaskList);
	searchResultArray.push(request.getParameter('custpage_trantype'));

	nlapiLogExecution('DEBUG', 'NSConfirmationNotNulltasks', NSConfirmationNotNulltasks);
	if(NSConfirmationNotNulltasks != '' && NSConfirmationNotNulltasks != 'null' && NSConfirmationNotNulltasks != null && NSConfirmationNotNulltasks != undefined && NSConfirmationNotNulltasks.length > 0)
	{
		var NSConfirmationNotNulltaskslength = NSConfirmationNotNulltasks.length;
		nlapiLogExecution('DEBUG', 'NSConfirmationNotNulltaskslength', NSConfirmationNotNulltaskslength);
		searchResultArray.push(NSConfirmationNotNulltaskslength);
	}	
	else
	{
		var NSConfirmationNotNulltaskslength = 0;
		searchResultArray.push(NSConfirmationNotNulltaskslength);
	}
	return searchResultArray;
}

function validateRequestParams(request,form){
	var ordNo = "";
	var trantype = "";
	var pickreport = "";
	var vLocation="";

	var localVarArray = new Array();

	if (request.getParameter('custpage_order') != null && request.getParameter('custpage_order') != "") {
		ordNo = request.getParameter('custpage_order');
	}

	if (request.getParameter('custpage_pickreport') != null && request.getParameter('custpage_pickreport') != "") {
		pickreport = request.getParameter('custpage_pickreport');
	}
	if (request.getParameter('custpage_trantype') != null && request.getParameter('custpage_trantype') != "") {
		trantype = request.getParameter('custpage_trantype');
	}
	if (request.getParameter('custpage_qbwhlocation') != null && request.getParameter('custpage_qbwhlocation') != "") {
		vLocation = request.getParameter('custpage_qbwhlocation');
	}

	var currentRow = [ordNo,pickreport,trantype,vLocation];
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

	// Sales Order No
	if(localVarArray[0][0] != "")
		filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', localVarArray[0][0]));

	if(localVarArray[0][1] != "")
	{
		nlapiLogExecution('DEBUG', 'localVarArray[0][1]', localVarArray[0][1]);
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', localVarArray[0][1]));	

	}
	if(localVarArray[0][3] != "")
	{

		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', localVarArray[0][3]));	

	}
	filters.push(new nlobjSearchFilter( 'custrecord_wmsse_wms_status_flag', null, 'anyof', ['28','8']));
	filters.push(new nlobjSearchFilter( 'custrecord_wmsse_tasktype', null, 'anyof', ['3']));
	filters.push(new nlobjSearchFilter('type','custrecord_wmsse_sku','noneof',['Kit']));
	return filters;
}

/**
 * 
 * @returns {Array}
 */
function getTaskColumnsOpen(inventoryStatusFeature){
	var columns = new Array();

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
	columns.push(new nlobjSearchColumn('custrecord_wmsse_parent_sku_no'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_kitflag'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_nstrn_ref_no'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_container_lp_no'));
	//Inventorystatus Feature is enabled
	if(inventoryStatusFeature == true)
		columns.push(new nlobjSearchColumn('custrecord_wmsse_inventorystatus'));
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
	//Order No
	if(localVarArray[0][0] != "")
		filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no_clt', null, 'is', localVarArray[0][0]));
	if(vType != "")
		filters.push(new nlobjSearchFilter('type','custrecord_wmsse_order_no_clt', 'anyof', vType));
	filters.push(new nlobjSearchFilter('mainline','custrecord_wmsse_order_no_clt', 'is', 'T'));
	//3-Putaway completed
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag_clt', null, 'anyof', [3]));

	//2- putaway
	filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype_clt', null, 'anyof', [2]));
	nlapiLogExecution('DEBUG','specifyTaskFiltersClose');
	return filters;
}



function setPagingForSublist(taskList,form,inventoryStatusFeature)
{
	if(taskList != null && taskList.length > 0){

		nlapiLogExecution('DEBUG', 'taskList length ', taskList.length);
		var taskListArray=new Array();		
		var vTranType=taskList[1];
		var NSConfirmationNotNulltasks = taskList[2];
		
		for(k=0;k<2;k++)
		{
			var tasksearchresult = taskList[k];
			nlapiLogExecution('DEBUG', 'tasksearchresult ', tasksearchresult);
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
							taskListArray[taskListArray.length]=[temparr.getValue('custrecord_wmsse_order_no'),temparr.getValue('custrecord_wmsse_line_no'),temparr.getValue('custrecord_wmsse_sku'),
								temparr.getValue('custrecord_wmsse_expe_qty'),temparr.getValue('custrecord_wmsse_batch_num'),temparr.getValue('custrecord_wmsse_actendloc'),temparr.getValue('custrecord_wmsse_wms_status_flag'),
								temparr.getValue('name'),temparr.getValue('custrecord_wmsse_wms_location'),temparr.getValue('custrecord_wmsse_serial_no'),temparr.getValue('custrecord_wmsse_tasktype'),
								temparr.getText('custrecord_wmsse_order_no'),temparr.getText('custrecord_wmsse_sku'),temparr.getText('custrecord_wmsse_actendloc'),temparr.getText('custrecord_wmsse_wms_status_flag'),
								temparr.getId(),'Open',temparr.getValue('custrecord_wmsse_nsconfirm_ref_no'),temparr.getValue('custrecord_wmsse_act_qty'),temparr.getText('custrecord_wmsse_actbeginloc'),
								temparr.getValue('custrecord_wmsse_actbeginloc'),temparr.getValue('custrecord_wmsse_uom'),temparr.getValue('custrecord_wmsse_conversionrate'),temparr.getValue('custrecord_wmsse_parent_sku_no'),
								temparr.getValue('custrecord_wmsse_kitflag'),temparr.getValue('custrecord_wmsse_nstrn_ref_no'),temparr.getValue('custrecord_wmsse_container_lp_no'),
								temparr.getText('custrecord_wmsse_inventorystatus'),temparr.getValue('custrecord_wmsse_inventorystatus'),temparr.getText('custrecord_wmsse_wms_location')];

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
				nlapiLogExecution('DEBUG', 'diff',diff);

				var pagevalue=request.getParameter('custpage_pagesize');
				nlapiLogExecution('DEBUG', 'pagevalue',pagevalue);
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
				addTaskListToSublist(form, currentTask, c,vTranType,NSConfirmationNotNulltasks,inventoryStatusFeature);
				c=c+1;
			}
		}
	}
}

function addTaskListToSublist(form, currentTask, i,vTranType,tasklength,inventoryStatusFeature){

	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_pono', i + 1,
			currentTask[11]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_lineno', i + 1,
			currentTask[1]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_item', i + 1,
			currentTask[12]);

	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_qty', i + 1,
			currentTask[18]);

	//Inventorystatus Feature is enabled
	if(inventoryStatusFeature == true)
	{
		form.getSubList('custpage_reversalitems').setLineItemValue('custpage_inventorystatus', i + 1, 
				currentTask[27]);
		form.getSubList('custpage_reversalitems').setLineItemValue('custpage_inventorystatusid', i + 1,
				currentTask[28]);
	}

	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_lotbatch', i + 1, 
			currentTask[4]);

	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_binloc', i + 1, 
			currentTask[13]);

	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_status', i + 1, 
			currentTask[14]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_statusvalue', i + 1, 
			currentTask[6]);

	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_poinernno', i + 1, 
			currentTask[0]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_location', i + 1, 
			currentTask[8]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_itemintrid', i + 1, 
			currentTask[2]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_serailno', i + 1, 
			currentTask[9]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_taskid', i + 1, 
			currentTask[15]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_tasktype', i + 1, 
			currentTask[16]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_actloc', i + 1, 
			currentTask[13]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_trantype', i + 1, 
			vTranType);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_packrecordcount', i + 1, 
			tasklength);
	

	
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_nsrefno', i + 1, 
			currentTask[17]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_uom', i + 1, 
			currentTask[21]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_convertionrate', i + 1, 
			currentTask[22]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_parentsku', i + 1, 
			currentTask[23]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_iscomponentitem', i + 1, 
			currentTask[24]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_btrefno', i + 1, 
			currentTask[25]);	
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_contlp', i + 1, 
			currentTask[26]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_beginloc', i + 1, 
			currentTask[20]);
	form.getSubList('custpage_reversalitems').setLineItemValue('custpage_actlocid', i + 1, 
			currentTask[5]);
	if(currentTask[29] != '' && currentTask[29] != null && currentTask[29] != 'null' &&
			currentTask[29] != undefined && currentTask[29] != 'undefined')
	{
		form.getSubList('custpage_reversalitems').setLineItemValue('custpage_locationname', i + 1, 
				currentTask[29]);
	}

}

function updateTransaction(ordid,ordlineno,taskqty,itemid,nsrefno,taskactloc,lotno,serials,parentSku,processType,kitItemLenth,taskbeginloc,taskactlocId,k,lineCount,
		selectedCount,whlocation,sonumber,vBinTrIntId,linecheckarray,alreadyDeletedIFnumbers,vStatusId,inventoryStatusFeature,serials)
{

	var str = 'ordid. = ' + ordid + '<br>';	
	str = str + 'ordlineno. = ' + ordlineno + '<br>';	
	str = str + 'taskqty. = ' + taskqty + '<br>'
	str = str + 'itemid. = ' + itemid + '<br>'
	str = str + 'nsrefno. = ' + nsrefno + '<br>'
	str = str + 'taskactloc. = ' + taskactloc + '<br>'
	str = str + 'lotno. = ' + lotno + '<br>'
	str = str + 'serials. = ' + serials + '<br>'
	str = str + 'processType. = ' + processType + '<br>'
	str = str + 'kitItemLenth. = ' + kitItemLenth + '<br>'
	str = str + 'taskbeginloc. = ' + taskbeginloc + '<br>'
	str = str + 'lineCount. = ' + lineCount + '<br>'
	str = str + 'selectedCount. = ' + selectedCount + '<br>'
	str = str + 'k. = ' + k + '<br>'
	str = str + 'whlocation. = ' + whlocation + '<br>'
	str = str + 'sonumber. = ' + sonumber + '<br>'
	str = str + 'vStatusId. = ' + vStatusId + '<br>'
	nlapiLogExecution('DEBUG', 'Into updateTransaction',str);
	var linecheckarray=new Array();
	var opentaskSerialArr = new Array();
	var itemType ='';
	var Id='';
	if(ordid!=null && ordid!='')
	{
		try
		{
			//var trantype = nlapiLookupField('transaction', ordid, 'recordType');
			//nlapiLogExecution('ERROR','trantype',trantype);

			var itemIndex=0;
			var totalqty=taskqty;
			var vLotQty=0;
			var boolfound=true;

			if(nsrefno != null && nsrefno !='' && nsrefno !='null' && nsrefno !='undefined' && processType != null && processType != '' && ((alreadyDeletedIFnumbers.length > 0 && alreadyDeletedIFnumbers.indexOf(nsrefno) == -1  ) || (alreadyDeletedIFnumbers.length == 0)))
			{
				var vSubRecordId='item';
				//var TransformRec = nlapiLoadRecord('itemfulfillment', nsrefno);
				var TransformRec = nlapiLoadRecord(processType, nsrefno);
				//Case# 201418288 start
				var trantype = nlapiLookupField('transaction', ordid, 'recordType');
				//Case# 201418288 end
				// To get the no of lines from item fulfillment record

				var blnItemUnit="";
				var VUnitType ="";
				var vConversionRate =1;
				var vColumnslist ='';
				var soLineItemDetails=getSOLineDetailsNew(sonumber,trantype,itemid,whlocation,ordlineno);
				nlapiLogExecution('DEBUG', 'soLineItemDetails', soLineItemDetails.length); 
				if(soLineItemDetails !=null && soLineItemDetails !='' && soLineItemDetails.length > 0)
				{
					vColumnslist=soLineItemDetails[0].getAllColumns();
					for(var x1=0;x1<vColumnslist.length;x1++)
					{
						var summaryLabel = vColumnslist[x1].getLabel();
						if (summaryLabel == 'Conversion Rate')
						{
							coversionRateIndex = x1;
						}
					}
					for(var j=0; j<soLineItemDetails.length; j++)
					{
						vConversionRate = soLineItemDetails[j].getValue(vColumnslist[coversionRateIndex]);
					}
				}
				nlapiLogExecution('DEBUG', 'vConversionRate', vConversionRate); 
				var itemfilters=new Array();
				itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',itemid));
				var itemcolumns= new Array();
				itemcolumns.push(new nlobjSearchColumn('stockunit'));
				itemcolumns.push(new nlobjSearchColumn('unitstype'));
				var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
				if(itemresults!=null && itemresults!='')
				{
					blnItemUnit = itemresults[0].getText('stockunit');
					VUnitType = itemresults[0].getValue('unitstype');
				}
				
				var getStockConversionRate =1;
				if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -' )
				{
					if(vConversionRate == null || vConversionRate == '' || vConversionRate == 'null' || vConversionRate == 'undefined')
					{
						vConversionRate = 1;
					}
					getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
				}

				nlapiLogExecution('DEBUG', 'getStockConversionRate', getStockConversionRate);

				if(processType == 'itemfulfillment')
				{	
					var IFLength = TransformRec.getLineItemCount(vSubRecordId);  
					for (var j = 1; IFLength!=null && j <= IFLength; j++) {

						var itemLineNo = TransformRec.getLineItemValue(vSubRecordId, 'orderline', j);
						var item = TransformRec.getLineItemValue(vSubRecordId, 'item', j);
						//Case# 201418288 start
						if(trantype=="transferorder")
						{
							itemLineNo=parseInt(itemLineNo)-1;
						}

						//Case# 201418288 end
						if (itemLineNo == ordlineno  ) {
							itemIndex=j;  
							break;
						}

					}
				}
				else if(processType == 'bintransfer')
				{	
					vSubRecordId = 'inventory';
					var IFLength = TransformRec.getLineItemCount(vSubRecordId);
					var location = TransformRec.getFieldValue('location');
					

					for (var j = 1; IFLength!=null && j <= IFLength; j++) {

						var vbtItem = TransformRec.getLineItemValue(vSubRecordId, 'item', j);
						var vbtQuantity = TransformRec.getLineItemValue(vSubRecordId, 'quantity', j);
						var vbtItemLine = TransformRec.getLineItemValue(vSubRecordId, 'line', j);

						//vbtQuantity = parseFloat(vbtQuantity) * parseFloat(getStockConversionRate);
						vbtQuantity = Number(Big(vbtQuantity).mul(getStockConversionRate));


						if (vbtItem == itemid && vbtQuantity == totalqty) {													

							if(linecheckarray.length == 0)
							{
								linecheckarray.push(vbtItemLine);
								itemIndex=j; 

								break;
							}
							if(linecheckarray.indexOf(vbtItemLine) == -1)
							{
								linecheckarray.push(vbtItemLine);
								itemIndex=j; 

								break;
							}



						}

					}
				}



				if(itemIndex!=0 )
				{

					nlapiLogExecution('DEBUG', "itemIndex", itemIndex);
					var item_id = TransformRec.getLineItemValue(vSubRecordId, 'item', itemIndex);
					var itemname = TransformRec.getLineItemText(vSubRecordId, 'item', itemIndex);
					if(itemname!=null && itemname!='')
						itemname=itemname.replace(/ /g,"-");
					var itemrec = TransformRec.getLineItemValue(vSubRecordId, 'itemreceive', itemIndex);
					var itemloc2 = TransformRec.getLineItemValue(vSubRecordId, 'location', itemIndex);
					var NSOrdUOM = TransformRec.getLineItemValue(vSubRecordId, 'units', itemIndex);

					itemType = nswms_GetItemType(item_id,itemloc2);




					if(boolfound)
					{
						TransformRec.selectLineItem(vSubRecordId, itemIndex);
						if(totalqty>0)
						{
							if(serials != null && serials != '' && serials != 'null' && serials != 'undefined')
							{
								opentaskSerialArr = serials.split(',');
							}

							var oldputqty = TransformRec.getCurrentLineItemValue(vSubRecordId, 'quantity');


							if(processType == 'bintransfer')
							{	
								//oldputqty = parseFloat(oldputqty) * parseFloat(getStockConversionRate);
								oldputqty = Number(Big(oldputqty).mul(getStockConversionRate));
								nlapiLogExecution('DEBUG', 'oldputqty after conversion', oldputqty);
							}
							//var newputqty = parseFloat((parseFloat(oldputqty)-parseFloat(totalqty)).toFixed(5));
							var newputqty = Number(Big(oldputqty).minus(totalqty));
							nlapiLogExecution('DEBUG', 'newputqty', newputqty);
							if(parseFloat(newputqty)>0)
							{
								TransformRec.setCurrentLineItemValue(vSubRecordId, 'itemreceive', 'T');
								if(processType == 'itemfulfillment')
								{
									TransformRec.setCurrentLineItemValue(vSubRecordId, 'quantity', Number(Big(newputqty).toFixed(5)));
								}
								else
								{
									TransformRec.setCurrentLineItemValue(vSubRecordId, 'quantity', Number(Big(newputqty).toFixed(8)));
								}
								TransformRec.setCurrentLineItemValue(vSubRecordId, 'location', itemloc2);

								if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {

									var compSubRecord = TransformRec.editCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');
									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
									nlapiLogExecution('DEBUG', 'complinelength', complinelength);
									for(var r1=1;r1<=complinelength;r1++)
									{
										if(totalqty > 0 )
										{
											var vInvenDetailsStausId="";
											compSubRecord.selectLineItem('inventoryassignment',r1);
											var vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'binnumber');
											var vOldSubBinLocQty = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
											var vOldReceiptInventoryNumber = compSubRecord.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');
											nlapiLogExecution('DEBUG', 'vOldReceiptInventoryNumber', vOldReceiptInventoryNumber);
											if(inventoryStatusFeature == true)
												vInvenDetailsStausId =compSubRecord.getCurrentLineItemValue('inventoryassignment', 'inventorystatus');
											nlapiLogExecution('DEBUG', 'vInvenDetailsStausId', vInvenDetailsStausId);
											if(vOldSubBinLocText == taskactloc && totalqty > 0 && (lotno == vOldReceiptInventoryNumber))
											{
												var vNewSubBinLocQty = '';
												if(inventoryStatusFeature == true)
												{
													if((vInvenDetailsStausId !=null && vInvenDetailsStausId !='' && vInvenDetailsStausId!='null') && (vStatusId == vInvenDetailsStausId))
													{
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
														nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
														if(parseFloat(vNewSubBinLocQty) > 0)
														{
															if(processType == 'itemfulfillment')
															{
																compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
															}
															else
															{
																compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
															}
															compSubRecord.commitLineItem('inventoryassignment');
															//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty); 
															totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty)); 
														}
														else
														{
															nlapiLogExecution('DEBUG', 'inside else',r1);
															compSubRecord.removeLineItem('inventoryassignment', r1);
															totalqty = 0; 
															break;
														}
													}

												}
												else
												{
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
													nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
													if(parseFloat(vNewSubBinLocQty) > 0)
													{
														if(processType == 'itemfulfillment')
														{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
														}
														else
														{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
														}
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
									}
									compSubRecord.commit();
								}
								else if (itemType == "inventoryitem" || itemType == "assemblyitem") {

									var compSubRecord = TransformRec.editCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');
									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
									nlapiLogExecution('DEBUG', 'complinelength', complinelength);
									for(var r1=1;r1<=complinelength;r1++)
									{
										if(totalqty > 0 )
										{
											compSubRecord.selectLineItem('inventoryassignment',r1);	

											var vOldSubBinLocText ="";
											var vInvenDetailsStausId="";
											if(processType == 'itemfulfillment')
											{
												vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'binnumber');
												if(inventoryStatusFeature == true)
													vInvenDetailsStausId =compSubRecord.getCurrentLineItemValue('inventoryassignment', 'inventorystatus');
											}
											else if(processType == 'bintransfer')
											{
												vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'tobinnumber');
												if(inventoryStatusFeature == true)
													vInvenDetailsStausId =compSubRecord.getCurrentLineItemValue('inventoryassignment', 'toinventorystatus');
											}
											var vOldSubBinLocQty = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
											if(vOldSubBinLocText !=null && vOldSubBinLocText !='' && vOldSubBinLocText !='null' 
												&& vOldSubBinLocText !='' && vOldSubBinLocText !=null)
											{
												if(vOldSubBinLocText == taskactloc && totalqty > 0)
												{
													var vNewSubBinLocQty = '';
													if(inventoryStatusFeature == true)
													{
														if((vInvenDetailsStausId !=null && vInvenDetailsStausId !='' && vInvenDetailsStausId!='null') && (vStatusId == vInvenDetailsStausId))																	
														{

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
															nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
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
													else
													{
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
														nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
														if(parseFloat(vNewSubBinLocQty) > 0)
														{
															if(processType == 'itemfulfillment')
															{
																compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
															}
															else
															{
																compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
															}
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
										}
									}
									compSubRecord.commit();
								}
								else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {


									if(vConversionRate == null || vConversionRate == '' || vConversionRate == 'null' || vConversionRate == 'undefined')
									{
										vConversionRate = 1;
									}

									//totalqty = parseFloat(totalqty) * parseFloat(vConversionRate);
									totalqty = Number(Big(totalqty).mul(vConversionRate));
									nlapiLogExecution('DEBUG', 'totalqty after conversion', totalqty);
									var compSubRecord = TransformRec.editCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');

									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

									if( totalqty > 0)
									{
										var tQty =	totalqty;
										if(parseInt(complinelength)>0)
										{
											var vr1 = 1;
											for(var r1=1;r1<=complinelength;r1++)
											{
												compSubRecord.selectLineItem('inventoryassignment',vr1);
												var vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'binnumber');
												var serialNum = compSubRecord.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');
												if(vOldSubBinLocText == taskactloc && opentaskSerialArr.indexOf(serialNum) != -1)
												{
													tQty = parseInt(tQty)-1;
													compSubRecord.removeLineItem('inventoryassignment', vr1);
												}
												else
												{
													vr1++;
												}

												if(tQty == 0)
												{
													break;
												}
											}
											compSubRecord.commit();
										}
									}
								}
								TransformRec.commitLineItem(vSubRecordId);
							}
							else
							{
								var TransformRecId =nsrefno;
								
								var logMsg1 = 'picked Qty is Zero =' + newputqty + '<br>';
								logMsg1 = logMsg1 + 'IFLength = ' + IFLength + '<br>';
								logMsg1 = logMsg1 + 'kitItemLenth = ' + kitItemLenth + '<br>';
								nlapiLogExecution('DEBUG', 'parametersss', logMsg1);
								
								if((IFLength==1) || ((IFLength == kitItemLenth) && (processType == 'itemfulfillment')))
								{
									TransformRecId = nlapiDeleteRecord(processType, nsrefno);
									alreadyDeletedIFnumbers.push(nsrefno);
									nlapiLogExecution('DEBUG', 'TransformRecId', TransformRecId);
									TransformRec = 0;
									//return Id;
								}
								else if((IFLength==1) || ((parseInt(IFLength) == parseInt(kitItemLenth)-1) && (processType == 'bintransfer')))
								{
									TransformRecId = nlapiDeleteRecord(processType, nsrefno);
									alreadyDeletedIFnumbers.push(nsrefno);
									nlapiLogExecution('DEBUG', 'TransformRecId', TransformRecId);
									TransformRec = 0;
									//return Id;
								}
								else
								{
									if(processType == 'itemfulfillment')
									{
										TransformRec.setLineItemValue(vSubRecordId,'itemreceive',itemIndex,'F');
									}
									else
									{


										if(parseInt(lineCount)==k && parseInt(lineCount)==parseInt(selectedCount))
										{							

											TransformRecId = nlapiDeleteRecord(processType, nsrefno);
											alreadyDeletedIFnumbers.push(nsrefno);
											nlapiLogExecution('DEBUG', 'Id', TransformRecId);

										}
										else
										{
											if(parseInt (lineCount )> parseInt (selectedCount))
											{
												if(vConversionRate == null || vConversionRate == '' || vConversionRate == 'null' || vConversionRate == 'undefined')
												{
													vConversionRate = 1;
												}

												//totalqty = parseFloat(totalqty) * parseFloat(vConversionRate);
												totalqty = Number(Big(totalqty).mul(vConversionRate));
												nlapiLogExecution('DEBUG', 'totalqty inventoryBinTransferpickrev', totalqty);
												TransformRecId= inventoryBinTransferpickrev(itemType,location,vbtItem,Number(Big(totalqty).toFixed(8)),taskactlocId,taskbeginloc,lotno,'','','','',ordid,vStatusId,inventoryStatusFeature,serials);
												nlapiLogExecution('DEBUG', 'TransformRecId', TransformRecId);

											}
										}

									}
								}

							}
						}
						else
						{							
							var logMsg1 = 'Picked Qty is Zero =' + totalqty + '<br>';
							logMsg1 = logMsg1 + 'IFLength = ' + IFLength + '<br>';
							logMsg1 = logMsg1 + 'kitItemLenth = ' + kitItemLenth + '<br>';
							nlapiLogExecution('DEBUG', 'parameter', logMsg1);

							if((IFLength==1) || ((IFLength == kitItemLenth) && (processType == 'itemfulfillment')))
							{
								Id = nlapiDeleteRecord(processType, nsrefno);
								alreadyDeletedIFnumbers.push(nsrefno);
								nlapiLogExecution('DEBUG', 'Id', Id);

								//return Id;
							}
							else
							{
								if(processType == 'itemfulfillment')
								{
									TransformRec.setLineItemValue(vSubRecordId,'itemreceive',itemIndex,'F');
								}
								else
								{
									TransformRec.removeLineItem(vSubRecordId,itemIndex);
								}
							}
						}
					}
				}
				
				/*if(processType == 'itemfulfillment')
				{*/
				if(TransformRec != null && TransformRec != '' && TransformRec != 'null' && TransformRec != 'undefined' && TransformRec != 0) 
				{
					TransformRecId = nlapiSubmitRecord(TransformRec, true);
					nlapiLogExecution('DEBUG', 'After Submit', TransformRecId);
					//Id= TransformRecId;
				}
				/*}*/

				//if((TransformRecId != null && TransformRecId != '' && TransformRecId != 'null' && TransformRecId != 'undefined') || (TransformRec != 0) && (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") && (processType != 'itemfulfillment'))
				if(((TransformRecId != null && TransformRecId != '' && TransformRecId != 'null' && TransformRecId != 'undefined') || (TransformRec != 0))&&(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")&&(processType != 'itemfulfillment' || vBinTrIntId == null || vBinTrIntId == '' ||  vBinTrIntId == 'null' ||  vBinTrIntId == 'undefined'))
				{
					nlapiLogExecution('DEBUG','ordlineno', ordlineno);
					nlapiLogExecution('DEBUG','ordid', ordid);
					//fetch serials from serial entry
					var filters = new Array();
					var serialArray='';
					//filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
					filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseInt(ordlineno));									
					filters[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', ordid);
					var columns = new Array();
					columns[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
					columns[1] = new nlobjSearchColumn('name');
					var SrchRecordSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_pickrev_serials', filters,columns);
					nlapiLogExecution('DEBUG','SrchRecordSerial', SrchRecordSerial);
					if(SrchRecordSerial != null && SrchRecordSerial != '')
					{
						for(var m=0;m<SrchRecordSerial.length;m++)
						{
							if(opentaskSerialArr.indexOf(SrchRecordSerial[m].getValue('custrecord_wmsse_ser_no')) != -1)
							{
								var vRecId=SrchRecordSerial[m].getId();
								nlapiLogExecution('DEBUG', 'Deleted serial entry', vRecId);
								nlapiDeleteRecord('customrecord_wmsse_serialentry', vRecId);
							}
						}
					}
				}

				//}
				//}
			}

		}
		catch(exp)
		{
			nlapiLogExecution('ERROR', 'Exception in updateItemReceipt',exp);
		}
	}

	nlapiLogExecution('ERROR', 'Out of updateItemReceipt',TransformRecId);

	return TransformRecId;
}

function updateOBOpentask(reversalqty,taskid,taskactqty,itemid,ordintrid,taskactloc,lineno,tasktype,wmsstatus,vStatusId)
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
	str = str + 'vStatusId. = ' + vStatusId + '<br>';
	nlapiLogExecution('DEBUG', 'Function Parameters', str);

	updateOpenTask(taskid,reversalqty,taskactqty,tasktype,lineno,itemid,ordintrid,vStatusId);

	nlapiLogExecution('ERROR', 'Out of updateOpentaskandInventory');
}

function updateOpenTask(taskid,reversalqty,taskactqty,tasktype,lineno,itemid,ordintrid,vStatusId)
{
	

	var str = 'taskid. = ' + taskid + '<br>';
	str = str + 'reversalqty. = ' + reversalqty + '<br>';
	str = str + 'taskactqty. = ' + taskactqty + '<br>';
	str = str + 'tasktype. = ' + tasktype + '<br>';
	str = str + 'lineno. = ' + lineno + '<br>';
	str = str + 'itemid. = ' + itemid + '<br>';
	str = str + 'ordintrid. = ' + ordintrid + '<br>';
	str = str + 'vStatusId. = ' + vStatusId + '<br>';

	//var taskremqty=parseFloat(taskactqty)-parseFloat(reversalqty);
	var taskremqty=Number(Big(taskactqty).minus(reversalqty));

	str = str + 'taskremqty. = ' + taskremqty + '<br>';

	nlapiLogExecution('DEBUG', 'Function Parameters updateOpenTask', str);
	var cartlpArray=new Array();
	if(tasktype=='Open')
	{
		var opentaskList=new Array();
		var objopentaskList = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_pickreversal');
				
		if(taskid != null && taskid !='' && taskid !='null' && taskid !='undefined')
		{
			objopentaskList.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', taskid));
		}
		else
		{
			if(ordintrid != null && ordintrid != '')
				objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordintrid));
			if(lineno != null && lineno != '')
				objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineno));

			objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [8]));


			objopentaskList.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_tasktype', null, 'anyof', [3]));

			if(vStatusId != null && vStatusId != '' && vStatusId !='null' && vStatusId !=undefined && vStatusId !='undefined')
				objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_inventorystatus', null, 'anyof', vStatusId));
		}	


		var resLenDetails = objopentaskList.runSearch();
		var resultsPage = resLenDetails.getResults(0, 1000);
		var offset = 0;
		while (!!resultsPage && resultsPage.length > 0) 
		{
			opentaskList = opentaskList.concat(resultsPage);
			offset += 1000;
			resultsPage = resLenDetails.getResults(offset, offset + 1000);
		}
		
		nlapiLogExecution('DEBUG', 'opentaskList at updateOpenTask', opentaskList);
		if(opentaskList != null && opentaskList != '')
		{

			for(var i=0;i<opentaskList.length;i++)
			{
				try
				{
					var fields = new Array();
					var values = new Array();

					fields.push('custrecord_wmsse_notes');
					fields.push('custrecord_wmsse_reversalqty');
					fields.push('custrecord_wmsse_act_qty');
					fields.push('custrecord_wmsse_nsconfirm_ref_no');
					fields.push('custrecord_wmsse_nstrn_ref_no');


					values.push('Updated by outbound reversal process');
					values.push(Number(Big(reversalqty).toFixed(5)));
					values.push(Number(Big(taskremqty).toFixed(5)));
					values.push(null);
					values.push(null);
					var isComponentItem = opentaskList[i].getValue('custrecord_wmsse_kitflag');
					var parentSku = opentaskList[i].getValue('custrecord_wmsse_parent_sku_no');
					var Sku = opentaskList[i].getValue('custrecord_wmsse_sku');
					if((Sku != parentSku) && (isComponentItem!= null && isComponentItem != 'undefined' && isComponentItem != '' && isComponentItem != 'null' && isComponentItem == 'T'))
					{
						fields.push('custrecord_wmsse_compitm_actqty');
						values.push(Number(Big(taskremqty).toFixed(5)));
					}


					if(parseFloat(taskremqty)<1)
					{
						fields.push('custrecord_wmsse_wms_status_flag');
						values.push('33');
						//fields.push('custrecord_wmsse_act_end_date');
						//values.push(DateStamp());

					}
					nlapiLogExecution('DEBUG', 'open task id ',opentaskList[i].getId()); 

					nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskList[i].getId(), fields, values); 
				}
				catch(e)
				{
					nlapiLogExecution('ERROR', 'Exception in open task update', e);
				}

			}
			var vSku=opentaskList[0].getValue('custrecord_wmsse_sku');
			var vParentSku=opentaskList[0].getValue('custrecord_wmsse_parent_sku_no');
			if(vParentSku != vSku)
			{
			
				var vKitOpenTaskList=new Array();
				var objvKitOpenTaskList = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_pickreversal');
							
				//To Update Kit item task 
				var vFilters=new Array();
				if(ordintrid != null && ordintrid != '')
					objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordintrid));
				if(lineno != null && lineno != '')
					objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineno));

				objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [8]));
				objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [3]));
				objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_reversalqty', null, 'isempty'));
				if(vParentSku !=null && vParentSku!='' && vParentSku !='null')
					objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof',vParentSku));


				var resLenDetails = objvKitOpenTaskList.runSearch();
				var resultsPage = resLenDetails.getResults(0, 1000);
				var offset = 0;
				while (!!resultsPage && resultsPage.length > 0) 
				{
					vKitOpenTaskList = vKitOpenTaskList.concat(resultsPage);
					offset += 1000;
					resultsPage = resLenDetails.getResults(offset, offset + 1000);
				}
				
				if(vKitOpenTaskList !=null && vKitOpenTaskList !='' && vKitOpenTaskList !='null')
				{
					nlapiLogExecution('DEBUG', 'open kit task id ',vKitOpenTaskList[0].getId()); 
					var fields = new Array();
					var values = new Array();

					fields.push('custrecord_wmsse_notes');
					fields.push('custrecord_wmsse_reversalqty');
					fields.push('custrecord_wmsse_act_qty');
					fields.push('custrecord_wmsse_nsconfirm_ref_no');
					fields.push('custrecord_wmsse_nstrn_ref_no');


					values.push('Updated by outbound reversal process');
					values.push(Number(Big(reversalqty).toFixed(5)));
					values.push(Number(Big(taskremqty).toFixed(5)));
					values.push(null);
					values.push(null);


					if(parseFloat(taskremqty)<1)
					{
						fields.push('custrecord_wmsse_wms_status_flag');
						values.push('33');
						//fields.push('custrecord_wmsse_act_end_date');
						//values.push(DateStamp());

					}
					nlapiSubmitField('customrecord_wmsse_trn_opentask', vKitOpenTaskList[0].getId(), fields, values);
				}
			}
		}
	}
	else
	{
		var closedtaskList=new Array();
		var objclosedtaskList = new nlapiLoadSearch('customrecord_wmsse_trn_closedtask', 'customsearch_wmsse_ct_pickreversal');
		
		if(taskid != null && taskid !='' && taskid !='null' && taskid !='undefined')
		{
			objclosedtaskList.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', taskid));
		}
		else
		{
			if(ordintrid != null && ordintrid != '')
				objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no_clt', null, 'is', ordintrid));
			if(lineno != null && lineno != '')
				objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no_clt', null, 'equalto', lineno));

			objclosedtaskList.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_wms_status_flag_clt', null, 'anyof', [8]));


			objclosedtaskList.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_tasktype_clt', null, 'anyof', [3]));

			if(vStatusId != null && vStatusId != '' && vStatusId !='null' && vStatusId !=undefined && vStatusId !='undefined')
				objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_inventorystatus_clt', null, 'anyof', vStatusId));
		}
		var resLenDetails = objclosedtaskList.runSearch();
		
		
		var resultsPage = resLenDetails.getResults(0, 1000);
		var offset = 0;
		while (!!resultsPage && resultsPage.length > 0) 
		{
			closedtaskList = closedtaskList.concat(resultsPage);
			offset += 1000;
			resultsPage = resLenDetails.getResults(offset, offset + 1000);
		}

		if(closedtaskList != null && closedtaskList != '')
		{
			for(var i=0;i<closedtaskList.length;i++)
			{
				var fields = new Array();
				var values = new Array();

				fields.push('custrecord_wmsse_notes_clt');
				fields.push('custrecord_wmsse_reversalqty_clt');
				fields.push('custrecord_wmsse_act_qty_clt');
				values.push('Updated by outbound reversal process');
				values.push(Number(Big(reversalqty).toFixed(5)));
				values.push(Number(Big(taskremqty).toFixed(5)));

				if(parseFloat(taskremqty)<1)
				{
					fields.push('custrecord_wmsse_wms_status_flag_clt');
					values.push('33');
					fields.push('custrecord_wmsse_act_end_date_clt');
					values.push(DateStamp());
				}
				nlapiLogExecution('DEBUG', 'Closed task id ',closedtaskList[i].getId());
				nlapiSubmitField('customrecord_wmsse_trn_closedtask', closedtaskList[i].getId(), fields, values);

			}
		} 
	}

	nlapiLogExecution('DEBUG', 'Out of updateOpenTask');
}


function inventoryBinTransferpickrev(itemType,whLocation,itemId,quantity,fromBinId,toBinId,batchno,actualBeginTime,vUnits,vStockConversionRate,
		opentaskQty,ordid,vInventoryStatus,inventoryStatusFeature,serials)
{

	//var skt=nlapiLoadRecord('bintransfer',1076);
	var REC_TYPE = 'bintransfer';
	var binTransfer= nlapiCreateRecord(REC_TYPE);

	nlapiLogExecution('DEBUG', 'ordid BT', ordid);
	nlapiLogExecution('DEBUG', 'itemId BT', itemId);
	binTransfer.setFieldValue('location', whLocation);
	binTransfer.setFieldValue('trandate', DateStamp());


	binTransfer.selectNewLineItem('inventory');
	binTransfer.setCurrentLineItemValue('inventory', 'item', itemId);

	binTransfer.setCurrentLineItemValue('inventory', 'quantity', quantity);
	//binTransfer.setCurrentLineItemValue('inventory', 'preferredbin', '7');
	if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
	{
		var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
		compSubRecord.selectNewLineItem('inventoryassignment');
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', quantity);
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);      
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno); 
		// updating inventorystatus in bintransfer
		if(vInventoryStatus !=null && vInventoryStatus !='' && vInventoryStatus !='null' && vInventoryStatus !='undefined'&& vInventoryStatus !=undefined)
		{
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInventoryStatus);
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'toinventorystatus', vInventoryStatus);
		}
		compSubRecord.commitLineItem('inventoryassignment');
		compSubRecord.commit();
		var compSubRecord=null;
	}
	else
	{
		if(inventoryStatusFeature == true)
		{
			var filterssertemp = new Array();
			filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', ordid));
			filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', itemId));
			var columnssertemp1 = new Array();
			//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			//columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp,columnssertemp1);
			nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial1', SrchRecordTmpSerial1);
			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 !='')
			{
				var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');

				for (var n = 0; n < Math.min(SrchRecordTmpSerial1.length,quantity); n++) {


					if(serials.indexOf(SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'))==-1)
					{
						quantity = quantity+1;
						continue;
					}

					compSubRecord.selectNewLineItem('inventoryassignment');
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'));
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);      
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
					if(vInventoryStatus !=null && vInventoryStatus !='' && vInventoryStatus !='null' &&
							vInventoryStatus !='undefined'&& vInventoryStatus !=undefined)
					{
						compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInventoryStatus);
						compSubRecord.setCurrentLineItemValue('inventoryassignment', 'toinventorystatus', vInventoryStatus);
					}
					compSubRecord.commitLineItem('inventoryassignment');

				}
				compSubRecord.commit();
				compSubRecord=null;
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];					
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of inventory move completed for serial number  we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
					TempRecord=null;
				}
			}
			SrchRecordTmpSerial1= null;
			filterssertemp=null;
			columnssertemp1= null;
		}
		else
		{
			var filterssertemp = new Array();
			filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', ordid));
			filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', itemId));
			var columnssertemp1 = new Array();
			//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			//columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp,columnssertemp1);
			
			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 !='')
			{
				var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
				nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial1.length', SrchRecordTmpSerial1.length);
				for (var n = 0; n < Math.min(SrchRecordTmpSerial1.length,quantity); n++) {
					
					compSubRecord.selectNewLineItem('inventoryassignment');
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'));
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);      
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
					compSubRecord.commitLineItem('inventoryassignment');

				}
				compSubRecord.commit();
				compSubRecord=null;
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];
					
					nlapiLogExecution('DEBUG', 'TempRecord.getValue(name)',TempRecord.getValue('name'));
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of inventory move completed for serial number  we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
					TempRecord=null;
				}
			}
			SrchRecordTmpSerial1= null;
			filterssertemp=null;
			columnssertemp1= null;
		}
	}
	binTransfer.commitLineItem('inventory');

	var inventoryCountId = nlapiSubmitRecord(binTransfer);
	var taskType="MOVE";
	var Qty = quantity;
	if(opentaskQty != null && opentaskQty != '' && opentaskQty != 'null' && opentaskQty != 'undefined')
	{
		Qty = opentaskQty;
	}
	//To update/create open task with Move task type
	updateMoveOpenTask(itemType,whLocation,itemId,Qty,fromBinId,toBinId,batchno,inventoryCountId,taskType,'','',actualBeginTime,vUnits,vStockConversionRate);
	binTransfer=null;
	return inventoryCountId;
}


function getOpenTaskDetails(orderid,pickreportno,vLocation)
{	
	var opentaskordersearchresultkit=new Array();
	var objopentaskordersearchresultkit = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskdetails_srh');
				
	if(orderid != "" && orderid != null)
	{
		objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', orderid)); 
	}
	if(pickreportno != "" && pickreportno != null)
	{
		objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', pickreportno)); 
	}
	if(vLocation != "" && vLocation != null)
	{
		objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', vLocation));
	}

	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8','28']));	
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('isinactive',null,'is','F'));
	objopentaskordersearchresultkit.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); // NS REF no is not empty
	var resLenDetails = objopentaskordersearchresultkit.runSearch();
	
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		opentaskordersearchresultkit = opentaskordersearchresultkit.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	return opentaskordersearchresultkit;
}