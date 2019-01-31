/**
 * Script Description
 * This script is used to scan the qty and bin location for selected item.
 */

/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function CheckInQty(request, response){

	nlapiLogExecution('Error', 'CheckInQty starts', TimeStampinSec());
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	var vConfig=nlapiLoadConfiguration('accountingpreferences');
	var itemcostruleValue=vConfig.getFieldValue('ITEMCOSTASTRNFRORDCOST');

	if (request.getMethod() == 'GET') 
	{
		nlapiLogExecution('Error', 'GET starts', TimeStampinSec());

		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';

		//Get the PO# from the previous screen, which is passed as a parameter		
		var getPONo = request.getParameter('custparam_poid');


		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');

		var getActualBeginDate = request.getParameter('custparam_actualbegindate');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var getActualBeginTimeAMPM = request.getParameter('custparam_actualbegintimeampm');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var orderType=request.getParameter('custparam_ordertype');
		var getitemType=request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');
		var lotExpiryDate=request.getParameter('custparam_lotexpirydate');
		var whCompany= request.getParameter('custparam_company');
		var getPONo = request.getParameter('custparam_poid');
		var getPOItem = request.getParameter('custparam_poitem');		
		var getPOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getPOInternalId = request.getParameter('custparam_pointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var usedBins = request.getParameter('custparam_usedbinsflag');
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var vSpecOrder = request.getParameter('custparam_specord');
		var makeInvAvailFlag = request.getParameter('custparam_makeinventoryavailflag');
		var trnLotInvStatusIdStr = request.getParameter('custparam_tolotinvstatusid');
		var trnLotInvStatusTxtStr = request.getParameter('custparam_tolotinvstatustxt');
		var vcompositebarcode = request.getParameter("custparam_compbarcodestring");

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');

		var componentvalarr = new Array();

		nlapiLogExecution('Error', 'getcomponentmapping starts', TimeStampinSec());

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = context.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		nlapiLogExecution('Error', 'getcomponentmapping ends', TimeStampinSec());

		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getPONo. = ' + getPONo + '<br>';	
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';	
		logmsg = logmsg + 'getPOItem. = ' + getPOItem + '<br>';
		logmsg = logmsg + 'lotText. = ' + vSpecOrder + '<br>';	

		nlapiLogExecution('DEBUG', 'PO Qty scan get values :', logmsg);
		var strvUnits = "";
		var headerVar='Receiving';
		if(trantype == 'purchaseorder')
		{
			headerVar='PO';
		}
		else if(trantype == 'transferorder')
		{
			headerVar='TO';
		}
		else
		{
			headerVar='RMA';
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		nlapiLogExecution('Debug', 'getItemRemQty :  getItemRecQty', getItemRemQty + " : " + getItemRecQty);


		//Locking Records
		var POarray = new Array();

		POarray["custparam_poid"] = getPONo;
		POarray["custparam_whlocation"] = whLocation;
		POarray["custparam_company"] = whCompany;
		POarray["custparam_option"] = getOptedField;
		POarray["custparam_actualbegintime"] = getActualBeginTime;
		POarray["custparam_customer"] = customer;
		POarray["custparam_trantype"] = trantype;
		POarray["custparam_ordertype"] = orderType;
		POarray["custparam_pointernalid"] = getPOInternalId;
		POarray["custparam_specord"] = vSpecOrder;
		POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		var currentUser=getCurrentUser();

		var lockfilters=new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getPOInternalId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',getPOLineNo));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));

		var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

		if(lockresults!=null && lockresults!='')
		{
			var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
			var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');

			if(getLockUser!=currentUser)
			{
				POarray["custparam_error"]='The line item is being processed by other user.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
				return;
			}
			else if(parseInt(getLockLine)!=parseInt(getPOLineNo))
			{
				var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
				LockRecord.setFieldValue('name',getPOInternalId);
				LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
				LockRecord.setFieldValue('custrecord_wmsse_order',getPOInternalId);
				LockRecord.setFieldValue('custrecord_wmsse_line',getPOLineNo);
				LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
				LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

				var date = new Date();
				var mSecs = date.getTime();
				LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

				var recid = nlapiSubmitRecord(LockRecord);

			}
		}
		else
		{
			var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
			LockRecord.setFieldValue('name',getPOInternalId);
			LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
			LockRecord.setFieldValue('custrecord_wmsse_order',getPOInternalId);
			LockRecord.setFieldValue('custrecord_wmsse_line',getPOLineNo);
			LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
			LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

			var date = new Date();
			var mSecs = date.getTime();
			LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

			var recid = nlapiSubmitRecord(LockRecord);

		}
		//end

		var invtStatus = '';
		var invtStatusTxt = '';
		var vPOoverageChecked='F';
		var vConfig=nlapiLoadConfiguration('accountingpreferences');
		if(vConfig != null && vConfig != '' && trantype != 'transferorder')
		{
			vPOoverageChecked=vConfig.getFieldValue('OVERRECEIPTS');
		}
		nlapiLogExecution('Debug','vPOoverageChecked', vPOoverageChecked);
		var qtyCheckFlag="F";

		var poLineDetails=getPOLineDetailsNew(getPONo, trantype,getItemInternalId,whLocation,getPOLineNo);
		var openputawayQtyIndex = 7;
		var unitsIndex =14;
		var conversionQtyIndex =15;
		var coversionRcvdQtyIndex=16;
		var coversionRateIndex =17;
		var vColumnslist ='';
		var toshippedQTYIndex =18;
		if(poLineDetails !=null && poLineDetails !='' && poLineDetails.length > 0)
		{	
			vColumnslist=poLineDetails[0].getAllColumns();
			for(var x1=0;x1<vColumnslist.length;x1++)
			{
				var summaryLabel = vColumnslist[x1].getLabel();
				var name = vColumnslist[x1].getName();
				if(summaryLabel == 'Open Putaway Quantity')
				{
					openputawayQtyIndex = x1;
				}
				else if(name == 'unit')
				{
					unitsIndex =x1;
				}
				else if(summaryLabel == 'Conversion Order Quantity')
				{
					conversionQtyIndex = x1;
				}
				else if(summaryLabel == 'Conversion Received Quantity')
				{
					coversionRcvdQtyIndex = x1;
				}
				else if(summaryLabel == 'Conversion Rate')
				{
					coversionRateIndex = x1;
				}
				else if(summaryLabel == 'TO Fulfilled Quantity')
				{
					toshippedQTYIndex = x1;
					//nlapiLogExecution('Debug', 'toshippedQTYIndex', toshippedQTYIndex);
				}
				else
				{

				}
			}

			for(var j=0; j<poLineDetails.length; j++)
			{
				var vporcvQty = 0;
				var usedBins='';
				var polineno=poLineDetails[j].getValue('line',null,'group');
				var pocheckinqty=poLineDetails[j].getValue('quantity',null,'max');
				var poInternalId = poLineDetails[j].getValue('internalid',null,'group');

				if(vUnits == null || vUnits == 'null' || vUnits == '' || vUnits == undefined)
				{
					vUnits = poLineDetails[j].getText(vColumnslist[unitsIndex]);
				}

				if(trantype!='transferorder')
					vUnits = poLineDetails[j].getText(vColumnslist[unitsIndex]);


				strvUnits = poLineDetails[j].getValue(vColumnslist[unitsIndex]);
				vConversionRate = poLineDetails[j].getValue(vColumnslist[coversionRateIndex]);

				var vpoitemQty = poLineDetails[j].getValue(vColumnslist[conversionQtyIndex]);
				var vpoitemNSRcvQty = poLineDetails[j].getValue(vColumnslist[coversionRcvdQtyIndex]);
				var vpoitemRcvQty=poLineDetails[j].getValue(vColumnslist[openputawayQtyIndex]);
				if(vpoitemQty == null || vpoitemQty == '')
					vpoitemQty=0;
				if(trantype=="returnauthorization")
				{
					if(parseFloat(vpoitemQty)<0)
						vpoitemQty=Big(vpoitemQty).mul(-1);
					//nlapiLogExecution('DEBUG', 'vpoitemQty', vpoitemQty);

				}
				if(trantype=="transferorder")
				{
					var invtStatus = '';
					var invtStatusTxt = '';
					var statusRemQty = 0;
					var actQty = 0;
					vpoitemQty=poLineDetails[j].getValue(vColumnslist[toshippedQTYIndex]);

					var itemType = nswms_GetItemType(getItemInternalId);


					var inventoryStatusFeature = isInvStatusFeatureEnabled();

					if(inventoryStatusFeature == true && (itemType == "inventoryitem" || itemType == "assemblyitem" || 
							itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem"))
					{
						var transOrdStatusArray = [];

						var trecord = nlapiLoadRecord('transferorder', poInternalId);
						var receivedFulfillmentIdArr = new Array();
						var links=trecord.getLineItemCount('links');
						if(links!=null  && links!='')
						{
							//nlapiLogExecution('DEBUG', 'links', links);
							for(var itr = 0; itr < links;itr++)
							{
								var id=trecord.getLineItemValue('links','id',(parseInt(itr)+1));
								var linktype = trecord.getLineItemValue('links','type',(parseInt(itr)+1));


								if(linktype=='Item Fulfillment')
								{
									var frecord = nlapiLoadRecord('itemfulfillment', id);
									var fitemcount=frecord.getLineItemCount('item');
									for(var f=1;f<=fitemcount;f++)
									{
										var fitem=frecord.getLineItemValue('item','item',f);
										var fline=frecord.getLineItemValue('item','orderline',f);

										var pofline= parseInt(fline) + 1;

										if((fitem == getItemInternalId) && (parseInt(getPOLineNo) == parseInt(pofline)))
										{
											frecord.selectLineItem('item', f);
											//nlapiLogExecution('ERROR', 'polinelength', polinelength);
											var compSubRecord = frecord.viewCurrentLineItemSubrecord('item','inventorydetail');

											var polinelength =0;

											if(compSubRecord!=null && compSubRecord!=''&& compSubRecord!='null')
												polinelength = compSubRecord.getLineItemCount('inventoryassignment');

											if(itemType == "inventoryitem" || itemType == "assemblyitem")
											{
												for(var j1=1;j1<=polinelength ;j1++)
												{
													var vtoStatusitemQty = compSubRecord.getLineItemValue('inventoryassignment','quantity',j1);
													invtStatus = compSubRecord.getLineItemValue('inventoryassignment','inventorystatus',j1);
													invtStatusTxt = compSubRecord.getLineItemText('inventoryassignment','inventorystatus',j1);


													var openTaskFilter = new Array();
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_sku',null, 'is',getItemInternalId));
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null, 'is',poInternalId));
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_line_no',null, 'equalto',getPOLineNo));
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus',null, 'anyof',invtStatus));
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null, 'anyof',whLocation));
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof',[2])); 

													var column = new Array();
													//column.push(new nlobjSearchColumn('custrecord_wmsse_act_qty'));
													var results = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskreceivingdata',openTaskFilter, null);

													var rcvQty = 0;
													if(results != null && results != '')
													{
														//nlapiLogExecution('DEBUG', 'results',results.length);
														for(var openTaskItr = 0; openTaskItr < results.length; openTaskItr++)
														{
															var tempActQty = results[openTaskItr].getValue('custrecord_wmsse_act_qty');
															if(tempActQty == '' || tempActQty == null || tempActQty == undefined || isNaN(tempActQty))
																tempActQty = 0;

															rcvQty = Number(Big(rcvQty).plus(tempActQty));
															//nlapiLogExecution('DEBUG', 'rcvQty',rcvQty);
														}
													}

													statusRemQty = Big(vtoStatusitemQty).minus(rcvQty);


													nlapiLogExecution('DEBUG', 'statusRemQty,rcvQty,vtoStatusitemQty',statusRemQty+','+rcvQty+','+vtoStatusitemQty);
													actQty = Big(actQty).plus(rcvQty);


													if(parseFloat(statusRemQty) > 0)
													{
														var tranCurRow = [invtStatus,invtStatusTxt];
														transOrdStatusArray.push(tranCurRow);
													}
												}
											}
											else
											{
												var vSeriarr = new Array();
												for(var j1=1;j1<=polinelength ;j1++)
												{
													var vtoStatusitemQty = compSubRecord.getLineItemValue('inventoryassignment','quantity',j1);
													invtStatus = compSubRecord.getLineItemValue('inventoryassignment','inventorystatus',j1);
													invtStatusTxt = compSubRecord.getLineItemText('inventoryassignment','inventorystatus',j1);
													var serialNum = compSubRecord.getLineItemValue('inventoryassignment','issueinventorynumber',j1);
													//nlapiLogExecution('Debug', 'invtStatus,invtStatusTxt,serialNum', invtStatus+','+invtStatusTxt+','+serialNum);

													var openTaskFilter = new Array();
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_sku',null, 'is',getItemInternalId));
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null, 'is',poInternalId));
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_line_no',null, 'equalto',getPOLineNo));
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus',null, 'anyof',invtStatus));
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null, 'anyof',whLocation));
													openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof',[2]));
													if(serialNum != null && serialNum != '')
														openTaskFilter.push(new nlobjSearchFilter('custrecord_wmsse_serial_no', null, 'anyof',serialNum));

													var column = new Array();
													//column.push(new nlobjSearchColumn('custrecord_wmsse_act_qty'));
													var results = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskreceivingdata',openTaskFilter, null);

													var rcvQty = 0;
													if(results != null && results != '')
													{
														//nlapiLogExecution('DEBUG', 'results',results.length);
														for(var openTaskItr = 0; openTaskItr < results.length; openTaskItr++)
														{
															var tempActQty = results[openTaskItr].getValue('custrecord_wmsse_act_qty');
															if(tempActQty == '' || tempActQty == null || tempActQty == undefined || isNaN(tempActQty))
																tempActQty = 0;

															rcvQty = Number(Big(rcvQty).plus(tempActQty));

														}
													}

													statusRemQty = Big(vtoStatusitemQty).minus(rcvQty);


													//nlapiLogExecution('DEBUG', 'statusRemQty,rcvQty,vtoStatusitemQty',statusRemQty+','+rcvQty+','+vtoStatusitemQty);
													actQty = Big(actQty).plus(rcvQty);


													if(parseFloat(statusRemQty) > 0  && vSeriarr.indexOf(invtStatus) == -1)
													{
														var tranCurRow = [invtStatus,invtStatusTxt];
														vSeriarr.push(invtStatus);
														transOrdStatusArray.push(tranCurRow);
													}
												}
											}
										}
									}
								}
							}
						}
					}

					if(parseInt(vpoitemQty) == 0 || (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
					{						
						var transferOrderQty = 0;
						var transferOrderlotQty = request.getParameter('custparam_tolotqty');	
						transferOrderQty = request.getParameter('custparam_toorderqty');	

						if(vConversionRate != null && vConversionRate != '' && vConversionRate != 'null' && vConversionRate != 'undefined')
						{
							POarray["custparam_tolotqty"]=request.getParameter('custparam_tolotqty');
							POarray["custparam_toorderqty"]=request.getParameter('custparam_toorderqty');
							if(transferOrderlotQty != null && transferOrderlotQty != '' && transferOrderlotQty != 'null' && 
									transferOrderlotQty != 'undefined')
							{
								vpoitemQty =parseFloat(transferOrderlotQty);
								vporcvQty = request.getParameter('custparam_tolotrcvqty');
								if(vporcvQty == '' || vporcvQty == 'null' || vporcvQty == null || vporcvQty == undefined || isNaN(vporcvQty))
								{
									vporcvQty = 0;
								}
								POarray["custparam_tolotqty"]=request.getParameter('custparam_tolotqty');
								POarray["custparam_toorderqty"]=request.getParameter('custparam_toorderqty');
								POarray["custparam_tolotrcvqty"]=request.getParameter('custparam_tolotrcvqty');

							}else{
								var filters = new Array();
								var columns = new Array();
								//columns.push(new nlobjSearchColumn('quantityshiprecv'));
								//columns.push(new nlobjSearchColumn('line'));
								filters.push(new nlobjSearchFilter('tranid', null, 'is',getPONo ));
								filters.push(new nlobjSearchFilter('formulatext', null, 'is', 'Shipping').setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
								filters.push(new nlobjSearchFilter('type', null, 'anyof', 'TrnfrOrd'));
								var TOLineDetails = new nlapiSearchRecord('transferorder','customsearch_wmsse_transactionid_details',filters,null);

								if(TOLineDetails != null && TOLineDetails != '' && TOLineDetails != 'null' && TOLineDetails.length >0)
								{
									//nlapiLogExecution('Debug', 'TOLineDetails', TOLineDetails.length); 
									for(var t=0;t<TOLineDetails.length;t++)
									{
										var tline=TOLineDetails[t].getValue('line');

										if(parseInt(tline)+1 == getPOLineNo)
										{
											vpoitemQty = TOLineDetails[t].getValue('quantityshiprecv'); 

											if(vConversionRate != null && vConversionRate != '' && vConversionRate != 'null' && vConversionRate != 'undefined')
											{
												if(vpoitemQty != null && vpoitemQty != '' && vpoitemQty != 'null' && vpoitemQty != 'undefined')
												{
													vpoitemQty =Number(Big(vpoitemQty).div(vConversionRate));
												}
											}
										}
									}
								}
							}
						}

						//nlapiLogExecution('Debug', 'NSfulfilledQty', vpoitemQty); 

					}
				}
				if(vpoitemRcvQty==null || vpoitemRcvQty=='')
					vpoitemRcvQty=0;
				if(vpoitemNSRcvQty==null || vpoitemNSRcvQty=='')
					vpoitemNSRcvQty=0;

				var totalReceivedQty = Number(Big(vpoitemRcvQty).plus(vpoitemNSRcvQty));
				//nlapiLogExecution('DEBUG', 'totalReceivedQty1', totalReceivedQty); 

				var vPoreminqty = Big(vpoitemQty).minus(totalReceivedQty);
				//nlapiLogExecution('DEBUG', 'vPoreminqty', vPoreminqty); 

				var itemType = nswms_GetItemType(getItemInternalId);

				if(trantype == "transferorder" && (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
				{
					vPoreminqty =Big(vpoitemQty).minus(vporcvQty);


					if(parseFloat(vPoreminqty)<0)
					{
						vPoreminqty = Big(transferOrderQty).minus(vporcvQty);

					}
				}
				//nlapiLogExecution('ERROR', 'vPoreminqty', vPoreminqty); 
				if(parseFloat(polineno) == parseFloat(getPOLineNo))
				{
					if(parseFloat(vPoreminqty)>0)
					{
						qtyCheckFlag = "T";
						getItemRemQty = vPoreminqty;
						getItemRecQty = totalReceivedQty;
						break;
					}
				}
			}
		}

		var domainName = fndomainName();

		var st0 = domainName + '-'+headerVar+' Receiving';
		var getPreferBin='';
		var getPreferBinId = '';
		var getPreferBinType = '';

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		if(whLocation!=null && whLocation!='' && getitemType != "noninventoryitem" && 
				getitemType!="otherchargeitem" && getitemType!="serviceitem" && getitemType!="downloaditem" && getitemType!="giftcertificateitem")
		itemfilters.push(new nlobjSearchFilter('inventorylocation',null, 'anyof', whLocation));
		var itemcolumns= new Array();

		var itemType='';
		var btnText='Save (Ent)';
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_receivingitemdetails', itemfilters, null);
		var strItemGrp="";
		var strItemFam="";
		var isactiveflag = 'F';
		var blnMixItem="F";
		var blnMixLot="F";
		var blnItemUnit="";
		var VUnitType ="";
		var Vdepartment ="";
		var Vclass ="";
		var vClissification;
		//nlapiLogExecution('Debug', 'itemresults1', itemresults); 
		if(itemresults!=null && itemresults!='')
		{
			var POarray = new Array();
			POarray["custparam_poid"] = request.getParameter('custparam_poid');
			POarray["custparam_actualbegindate"] = request.getParameter('custparam_actualbegindate');
			POarray["custparam_actualbegintime"] = request.getParameter('custparam_actualbegintime');	
			POarray["custparam_customer"] = request.getParameter('custparam_customer');
			POarray["custparam_actualbegintimeampm"] = request.getParameter('custparam_actualbegintimeampm');
			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_trantype"] = request.getParameter('custparam_trantype');
			POarray["custparam_ordertype"] = request.getParameter('custparam_ordertype');
			POarray["custparam_lotno"] = request.getParameter('custparam_lotno');
			POarray["custparam_itemtype"] = request.getParameter('custparam_itemtype');
			POarray["custparam_lotexpirydate"] = request.getParameter('custparam_lotexpirydate');
			POarray["custparam_company"] = request.getParameter('custparam_company');
			POarray["custparam_poitem"] = request.getParameter('custparam_poitem');
			POarray["custparam_lineno"] = request.getParameter('custparam_lineno');
			POarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
			POarray["custparam_rec_qty"] = request.getParameter('custparam_rec_qty');
			POarray["custparam_rem_qty"] = request.getParameter('custparam_rem_qty');
			POarray["custparam_pointernalid"] = request.getParameter('custparam_pointernalid');
			POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
			POarray["custparam_usedbinsflag"] = request.getParameter('custparam_usedbinsflag');
			POarray["custparam_uom"] = request.getParameter('custparam_uom');
			POarray["custparam_conversionrate"] = request.getParameter('custparam_conversionrate');
			POarray["custparam_tolotqty"]=request.getParameter('custparam_tolotqty');	
			POarray["custparam_specord"] = vSpecOrder;
			POarray["custparam_bcComponents"] = request.getParameter('custparam_bcComponents');
			if(itemresults[0].getValue('isinactive')=="T")
			{
				POarray["custparam_error"] = 'Entered item  is inactive.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
				nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
				return;

			}
			var itemLoc = itemresults[0].getValue('location');

			if((itemLoc != POarray["custparam_whlocation"]) && (itemLoc  != null && itemLoc != '' && itemLoc != 'null' && itemLoc != 'undefined'))
			{
				POarray["custparam_error"] = 'This item is mapped to different site.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
				nlapiLogExecution('Debug', 'itemRecord', 'Invalid Item Specified');
				return;
			}
			isactiveflag = 'T';
			itemType = itemresults[0].recordType;

			for(var d=0;d<itemresults.length;d++)
			{
				if(itemresults[d].getValue('preferredbin')=="T" && itemresults[d].getValue('location','binnumber')==whLocation)
				{
					getPreferBin = itemresults[d].getValue('binnumber');
					getPreferBinId = itemresults[d].getValue('internalid','binnumber');
					//nlapiLogExecution('Debug', 'getPreferBinId', getPreferBinId);
					getPreferBinType = nswms_GetPreferredBinType(getPreferBin,whLocation,null);

				}
			}
			blnMixItem = itemresults[0].getValue('custitem_wmsse_mix_item');
			blnMixLot = itemresults[0].getValue('custitem_wmsse_mix_lot');
			strItemGrp = itemresults[0].getValue('custitem_wmsse_itemgroup');
			strItemFam = itemresults[0].getValue('custitem_wmsse_itemfamily');
			blnItemUnit = itemresults[0].getText('stockunit');
			VUnitType = itemresults[0].getValue('unitstype');
			getPOItem = itemresults[0].getValue('itemid');
			vClissification=itemresults[0].getValue('locationinvtclassification');
			nlapiLogExecution('ERROR', 'vClissification', vClissification);
			if(departments == true)
				Vdepartment = itemresults[0].getValue('department');
			if(classes == true)
				Vclass = itemresults[0].getValue('class');

			if(Vdepartment == null || Vdepartment == '' || Vdepartment == 'null' || Vdepartment == 'undefined' || 
					Vclass == null || Vclass == '' || Vclass == 'null' || Vclass =='undefined')
			{
				if(departments == true && classes == true)
				{
					var fields = ['department','class'];
					var poRes = nlapiLookupField(trantype, getPOInternalId, fields);
					if(Vdepartment == null || Vdepartment == '' || Vdepartment == 'null' || Vdepartment == 'undefined')
					{

						Vdepartment = poRes.department;
					}
					if(Vclass == null || Vclass == '' || Vclass == 'null' || Vclass =='undefined')
					{

						Vclass = poRes.class;
					}
				}

			}
		}



		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';

		var getStockConversionRate =1;
		if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
		{
			getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
		}


		if(itemType == null || itemType =='' || itemType == 'null' || itemType == 'undefined')
		{
			itemType = getitemType;
		}
		if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
		{
			btnText='Next (Ent)';
		}

		var uomresults= new Array();
		var results='';
		if(VUnitType != null && VUnitType != '' && VUnitType != 'null' && VUnitType != 'undefined')
		{

			results= getUnitsType(VUnitType);

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
		}

		var	inventoryStatusLst = getDefaultInventoryStatusList('',-1,vSpecOrder);
		//nlapiLogExecution('Debug', 'inventoryStatusLst', inventoryStatusLst);


		var addbtnimgUrl='';
		var imgfilefound1=  getLoadFile('Plus.png');
		if(imgfilefound1)
		{
			addbtnimgUrl = imgfilefound1.getURL();

		}

		var delbtnimgUrl='';
		var imgfilefound2 =  getLoadFile('minus.png');
		if(imgfilefound2)
		{
			delbtnimgUrl = imgfilefound2.getURL();

		}

		var vBinDetails = new Array();
		//	var
		var systemRule=getSystemRuleValue('Stage received items before putting away?',whLocation);
		nlapiLogExecution('Debug', 'systemRule', systemRule);
		if(systemRule==null || systemRule=='' || systemRule=='null' || systemRule=='undefined')
		{
			systemRule= 'N';
		}

		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');


		if(trantype == 'transferorder')
		{
			if(makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == "")
			{

				if((itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
				{
					var vInvstats = trnLotInvStatusIdStr.split(',');

					makeInvAvailFlagFromSelect = vInvstats[0];
				}
				else
				{

					if(transOrdStatusArray!=null && transOrdStatusArray!='')
					{

						makeInvAvailFlagFromSelect = transOrdStatusArray[0][0];
					}
				}
			}

		}
		else
		{
			if(inventoryStatusLst != null && inventoryStatusLst != "")
			{
				if(makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == "")
					makeInvAvailFlagFromSelect = inventoryStatusLst[0][1];
			}

		}

		var tableHeaderText = 'Staging Bin Locations';
		if((systemRule==null || systemRule=='' || systemRule=='N')&&(itemType != "noninventoryitem" && 
				itemType!="otherchargeitem" && itemType!="serviceitem" && itemType!="downloaditem" && itemType!="giftcertificateitem"))
		{
			vBinDetails=fnGetPutBinAndIntDetails(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,whLocation,itemType,lotno,
					Vdepartment,Vclass,strvUnits,makeInvAvailFlagFromSelect,null,null,vClissification);
			tableHeaderText = 'Bin Locations';
		}
		else if(itemType != "noninventoryitem" && itemType!="otherchargeitem" && itemType!="serviceitem" && itemType!="downloaditem" && 
				itemType!="giftcertificateitem")
		{
			vBinDetails = fnGetPutBinDetailsNew(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,whLocation,
					itemType,lotno,getPreferBinId);
		}

		var Backordered = 0;
		var YetToBePicked = 0;
		var PickedQty = 0;

		PickedQty = fnGetYetToBePicked(getItemInternalId,'',whLocation,VUnitType,blnItemUnit);


		var YetToBePicked = PickedQty[0];
		var Backordered = PickedQty[1];

		if(Backordered == null || Backordered =='' || Backordered =='null' || Backordered == 'undefined')
			Backordered = 0;

		if(YetToBePicked == null || YetToBePicked =='' || YetToBePicked =='null' || YetToBePicked =='undefined')
			YetToBePicked = 0;

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
			if((errMsg == "Please configure stage locations" || errMsg =="Please configure bin locations" || 
					errMsg =="Please configure put strategies/bin locations") && ((vBinDetails.length != null &&  vBinDetails.length > 0) ||
							(getPreferBin != null && getPreferBin != 'null' && getPreferBin !='' && getPreferBin != 'undefined' && systemRule == 'N')))
			{
				errMsg = '';
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

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		var JSSurl ='';
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();

		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
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

		html= html+"<script type='text/javascript'>function DisplayBin_poInbound(val) {var reWhiteSpace ='';var selecteduomqtyArr = new Array();var enteredQty =0;" +
		"var ConvertQty=document.getElementById('hdnvConversionRate').value;var pooveragecheck = document.getElementById('hdnvPOoverageChecked').value; var remainingqty=parseFloat(document.getElementById('hdnItemRemQty').value);var uomTbl = document.getElementById('tblUOM');" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){var rowcount = uomTbl.rows.length;" +
		"for(var r=0;r<rowcount;r++){var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;if(qty==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter qty';" +
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}" +
		"else {if(isNaN(qty) || qty <= 0 ){document.getElementById('div_error').innerHTML ='Please enter valid qty ';document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}" +
		"var qtyValidate = document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value.split('.');"+
		"if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}" +
		"var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;" +
		"if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';" +
		"document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].focus();return false;}var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr);" +
		"enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom));}document.getElementById('hdnselecteduomswithqty').value=selecteduomqtyArr;" +
		"enteredQty =parseFloat(enteredQty)/parseFloat(ConvertQty);document.getElementById('hdntotaluomqtyentered').value = enteredQty;qty=enteredQty;}else{" +
		"var qty = document.getElementById('txtqty').value; " +
		"reWhiteSpace = qty.indexOf(' ') >= 0;" +
		"var qtyValidate = document.getElementById('txtqty').value.split('.');"+
		"if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('txtqty').focus();return false;}}}" +
		" var isactiveflag=document.getElementById('hdnisactiveflag').value;if(isactiveflag == 'F'){" +
		"document.getElementById('div_error').innerHTML ='Entered item is inactive';return false;} " +
		" var itemtype=document.getElementById('hdnitemtype').value; if(qty ==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter qty';document.getElementById('txtqty').focus();return false;}else if(isNaN(qty) || parseFloat(qty)<=0 || (reWhiteSpace == true)){" +
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';document.getElementById('txtqty').focus();return false;" +
		"}else if((parseFloat(qty)>parseFloat(remainingqty)) && pooveragecheck=='F'){ document.getElementById('div_error').innerHTML ='Overage receiving is not allowed';" +
		"if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){document.getElementById('txtqty').focus();}" +
		"else{var uomTbl = document.getElementById('tblUOM');var trowcount = uomTbl.rows.length;var indx = parseInt(trowcount)-1;document.getElementById('tblUOM').rows[indx].cells[0].childNodes[0].focus();return false;}" +
		"return false;}" +
		"else if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){ " +
		" var ConvertQty=document.getElementById('hdnvConversionRate').value; var conversionQty=(qty)*(ConvertQty); " +
		"if(conversionQty.toString().indexOf('.') != -1){ document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){document.getElementById('txtqty').focus();}" +
		"else{var uomTbl = document.getElementById('tblUOM');var trowcount = uomTbl.rows.length;var indx = parseInt(trowcount)-1;document.getElementById('tblUOM').rows[indx].cells[0].childNodes[0].focus();}"+
		"return false; }document.getElementById('txtbin').value=val;document.forms['_rf_checkin_item'].submit();" +
		" document.getElementById('loading').style.display = ''; return true;}" +
		"document.getElementById('txtbin').value=val;document.forms['_rf_checkin_item'].submit();" +
		" document.getElementById('loading').style.display = ''; " +
		"return true; }</script>"+

		"	<script type='text/javascript'>function validateForm_poInbound() {var selecteduomqtyArr = new Array();" +
		"var pooveragecheck = document.getElementById('hdnvPOoverageChecked').value; var ConvertQty=document.getElementById('hdnvConversionRate').value;" +
		"var isactiveflag=document.getElementById('hdnisactiveflag').value;if(isactiveflag == 'F'){" +
		"document.getElementById('div_error').innerHTML ='Entered item is inactive';return false;} if(document.getElementById('hdnqtyCheckFlag').value == 'F'){" +
		"document.getElementById('div_error').innerHTML ='RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';return false;" +
		"} if(document.getElementById('hdnusedBins').value == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item';return false;" +
		"}" +
		"var uomTbl = document.getElementById('tblUOM');var enteredQty =0; if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount = uomTbl.rows.length;for(var r=0;r<rowcount;r++){var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;if(qty==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter qty';document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;" +
		"}else {if(isNaN(qty) || parseFloat(qty)<=0){"+
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';"+
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}"+	
		"var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';" +
		"document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].focus();return false;}var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr); " +
		"enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom)); " +
		"var qtyValidate = qty.split('.');"+
		"if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}" +
		"}document.getElementById('hdnselecteduomswithqty').value=selecteduomqtyArr;" +
		"enteredQty =parseFloat(enteredQty)/parseFloat(ConvertQty);var scannedqty=enteredQty;}" +
		"else{enteredQty = document.getElementById('txtqty').value;" +
		"var qtyValidate = document.getElementById('txtqty').value.split('.');"+
		"if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('txtqty').focus();return false;}}" +
		"}if(enteredQty == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter qty';" +
		"if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){document.getElementById('txtqty').focus();}return false;}else{var scannedqty=enteredQty;" +
		"var remainingqty=parseFloat(document.getElementById('hdnItemRemQty').value);  if((isNaN(scannedqty) || parseFloat(scannedqty)<=0)  ){" +
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';" +
		"if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){document.getElementById('txtqty').focus();"+
		"}return false;" +
		"} if((parseFloat(scannedqty)>parseFloat(remainingqty)) && pooveragecheck=='F'){ document.getElementById('div_error').innerHTML ='Overage receiving is not allowed';" +
		"if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){document.getElementById('txtqty').focus();}" +
		"else{var uomTbl = document.getElementById('tblUOM');var trowcount = uomTbl.rows.length;var indx = parseInt(trowcount)-1;document.getElementById('tblUOM').rows[indx].cells[0].childNodes[0].focus();return false;}" +
		"return false;} var itemtype=document.getElementById('hdnitemtype').value; if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){" +
		"  var conversionQty=(enteredQty)*(ConvertQty); if(conversionQty.toString().indexOf('.') > 0){" +
		" document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){document.getElementById('txtqty').focus();}" +
		"else{var uomTbl = document.getElementById('tblUOM');var trowcount = uomTbl.rows.length;var indx = parseInt(trowcount)-1;document.getElementById('tblUOM').rows[indx].cells[0].childNodes[0].focus();}return false;" +
		" }} if(document.getElementById('txtbin').value == '' && (document.getElementById('hdnPreferBin').value == '')){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan bin location'; document.getElementById('txtbin').focus();return false;}  else{" +
		"var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){" +
		"document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{" +
		"document.getElementById('hdntotaluomqtyentered').value = enteredQty;document.getElementById('hdnsession').value = 'session';" +
		"document.getElementById('loading').style.display = ''; return true;}}}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);" +
		"window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' id='_rf_checkin_item' method='POST'><input name='cmdSend1' class='defaultlink'   type='submit' value='' onclick='return validateForm_poInbound();' />"+ //onkeydown='return OnKeyDown_CL()' >";

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Receiving Qty</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+		
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+orderType+"#: <label>" + getPONo + "</label></td>"+ 
		"			</tr>" +
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getPOItem + "</label>"+		 
		"				<input type='hidden' name='hdnActualBeginDate' value=" + getActualBeginDate + ">"+		
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnActualBeginTimeAMPM' value=" + getActualBeginTimeAMPM + ">"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+
		"				<input type='hidden' name='hdnordertype' value='" + orderType + "'>"+
		"				<input type='hidden' name='hdnitemtype' id='hdnitemtype' value=" + itemType + ">"+
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+
		"				<input type='hidden' name='hdnBackordered' id='hdnBackordered' value=" + Backordered + ">"+
		"				<input type='hidden' name='hdnYetToBePicked' id='hdnYetToBePicked' value=" + YetToBePicked + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnPoInternalId' value=" + getPOInternalId + ">"+
		"				<input type='hidden' name='hdnPoLineno' value=" + getPOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnPoItem' value='" + getPOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnlotno' value='" + lotno + "'>"+
		"				<input type='hidden' name='hdnlotexpirydate' value='" + lotExpiryDate + "'>"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdnstrItemGrp' value=" + strItemGrp + ">"+
		"				<input type='hidden' name='hdnstrItemFam' value=" + strItemFam + ">"+
		"				<input type='hidden' name='hdnvPOoverageChecked' id='hdnvPOoverageChecked' value=" + vPOoverageChecked + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnusedBins' id='hdnusedBins' value=" + usedBins + ">"+
		"				<input type='hidden' name='hdnqtyCheckFlag' id='hdnqtyCheckFlag' value=" + qtyCheckFlag + ">"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnisactiveflag' id='hdnisactiveflag' value=" + isactiveflag + ">"+
		"				<input type='hidden' name='hdnvporcvQty' id='hdnvporcvQty' value=" + vporcvQty + ">"+
		"				<input type='hidden' name='hdnvPoreminqty' id='hdnvPoreminqty' value=" + vPoreminqty + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+
		"				<input type='hidden' name='hdntrnLotInvStatusIdStr' id='hdntrnLotInvStatusIdStr' value=" + trnLotInvStatusIdStr + ">"+
		"				<input type='hidden' name='hdntrnLotInvStatusTxtStr' id='hdntrnLotInvStatusTxtStr' value=" + trnLotInvStatusTxtStr + ">"+
		"				<input type='hidden' name='hdnvspecorder' value= '" + vSpecOrder + "'>"+
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+	
		"				<input type='hidden' name='hdncompositebarcode' value='" + vcompositebarcode + "'>"+
		"				</td>"+
		"			</tr>";	 

		if(lotno!=null && lotno!='' && lotno!='null')
		{
			html = html +"<tr>";
			html = html +"<td align = 'left' class='labelmsg'>Lot#: <label>" + lotno + "</label>";
			html = html +"</tr>";
		}
		html = html +"<tr>"+
		"				<td align = 'left' class='labelmsg'>Received Qty: <label>" + parseFloat(parseFloat(getItemRecQty).toFixed(5)) + " " +vUnits+"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(5)) + " " +vUnits+"</label>"+
		"			</tr>";
		html = html +"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Yet To Be Picked Qty: <label>" + parseFloat(parseFloat(YetToBePicked).toFixed(5)) + " " +vUnits+"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Back Ordered Qty: <label>" + Backordered + " " +vUnits+"</label>"+
		"			</tr>";

		if(results !=null &&  results !='' && results.length>0)
		{
			var selectedUomStr = request.getParameter('custparam_uomqtyselected');
			//nlapiLogExecution('ERROR', 'selectedUomStr', selectedUomStr);
			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				//nlapiLogExecution('ERROR', 'inside', selectedUomStr);

				html = html +"			<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox'  id='txtqty0' type='text'/></td><td></td>";

				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');


					if(Cnt==0)
					{
						html = html +"<td><select id='uomlist"+Cnt+"' class='labelmsg'  name = 'uomlist"+Cnt+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";


					}
					if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -' && vUnits == UOMText)
					{
						html = html +" <option value="+vQty+" selected >"+UOMText +" </option>";
					}
					else
					{
						html = html +" <option value="+vQty+"  >"+UOMText +" </option>";
					}

				}

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+getItemRemQty+"\",\""+vConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\",\""+vPOoverageChecked+"\");' alt='Add Uom'></td></tr></table>";	
			}
			else
			{
				//nlapiLogExecution('Debug', 'else', selectedUomStr);
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
					html = html +"<td><select id='uomlist"+u+"' class='labelmsg'  name = 'uomlist"+u+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";
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
						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+getItemRemQty+"\",\""+vConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\",\""+vPOoverageChecked+"\");' alt='Add Uom'></td></tr>";
					}
					else
					{
						html= html+"<td><input type='image' id='imgplus0' src='"+delbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return deleteUom(this,\""+uomresults+"\");' alt='Add Uom'></td></tr>";
					}

				}
				html = html +"			</td></tr></table>";
			}

		}
		else
		{
			html = html +"			<tr>";
			if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty"+" In "+ vUnits;
			}
			else
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty";
			}
			html = html +"				</td>"+
			"			</tr>";

			html = html +"			<tr>"+
			"				<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>" ;
			html = html +"			</tr>";

		}
		if(inventoryStatusLst != null && inventoryStatusLst != '' && inventoryStatusLst != 'null' && inventoryStatusLst != 'undefined' && inventoryStatusLst.length > 0) 
		{			
			html = html +"			<tr>";
			if(trantype == 'transferorder')
			{
				html = html +"	<td align = 'left' class='labelmsg'>Inv Status ";


				html=html+"</td></tr>";
				html = html +"			<tr><td>";
				////using the above commented line, we can disable the select field. but in this case,the option id is not passing to the server(post part through request).
				html = html +"<select class='labelmsg' id='inventorystatuslist' name='inventorystatuslist' onchange='invtStatus_OnChange()'>" ;
				var itemType = nswms_GetItemType(getItemInternalId);
				if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
				{
					if(transOrdStatusArray != null && transOrdStatusArray != '' && transOrdStatusArray.length > 0)
					{
						for(var tranItr = 0; tranItr < transOrdStatusArray.length; tranItr++)
						{
							var tranInvtStatus = transOrdStatusArray[tranItr][0];
							var tranInvtStatusTxt = transOrdStatusArray[tranItr][1];

							if(makeInvAvailFlag == tranInvtStatus)
							{
								html = html +" <option   selected  value="+tranInvtStatus+"> "+tranInvtStatusTxt+"</option>";

							}
							else
							{
								html = html +" <option     value="+tranInvtStatus+"> "+tranInvtStatusTxt+"</option>";
							}
						}
					}
					else
					{
						for(var Cnt1=0; Cnt1 < inventoryStatusLst.length; Cnt1++)
						{                    	 
							var vInventoryStatus = inventoryStatusLst[Cnt1][0];
							var VId =inventoryStatusLst[Cnt1][1];

							if(makeInvAvailFlag == VId)
							{
								html = html +" <option   selected  value="+VId+"> "+vInventoryStatus+"</option>";

							}
							else
							{
								html = html +" <option     value="+VId+"> "+vInventoryStatus+"</option>";
							}

						}				
					}
				}
				else if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
				{
					if(trnLotInvStatusIdStr != null && trnLotInvStatusIdStr != '')
					{

						var trnLotInvStatusIdArr = trnLotInvStatusIdStr.split(',');
						var trnLotInvStatusTxtArr = [];
						if(trnLotInvStatusTxtStr != null && trnLotInvStatusTxtStr != '')
							trnLotInvStatusTxtArr = trnLotInvStatusTxtStr.split(',');
						for(var tranLotItr = 0; tranLotItr < trnLotInvStatusIdArr.length-1; tranLotItr++)
						{
							var tranInvtStatus = trnLotInvStatusIdArr[tranLotItr];
							var tranInvtStatusTxt = trnLotInvStatusTxtArr[tranLotItr];

							if(makeInvAvailFlag == tranInvtStatus)
							{
								html = html +" <option   selected  value="+tranInvtStatus+"> "+tranInvtStatusTxt+"</option>";

							}
							else
							{
								html = html +" <option     value="+tranInvtStatus+"> "+tranInvtStatusTxt+"</option>";
							}
						}
					}
					else
					{
						for(var Cnt1=0; Cnt1 < inventoryStatusLst.length; Cnt1++)
						{                    	 
							var vInventoryStatus = inventoryStatusLst[Cnt1][0];
							var VId =inventoryStatusLst[Cnt1][1];

							if(makeInvAvailFlag == VId)
							{
								html = html +" <option   selected  value="+VId+"> "+vInventoryStatus+"</option>";

							}
							else
							{
								html = html +" <option     value="+VId+"> "+vInventoryStatus+"</option>";
							}

						}
					}
				}
				else
				{
					for(var Cnt1=0; Cnt1 < inventoryStatusLst.length; Cnt1++)
					{                    	 
						var vInventoryStatus = inventoryStatusLst[Cnt1][0];
						var VId =inventoryStatusLst[Cnt1][1];

						html = html +" <option     value="+VId+"> "+vInventoryStatus+"</option>";

					}
				}

				html=html+"</select></td>";
			}
			else
			{
				html = html +"	<td align = 'left' class='labelmsg'>Inv Status ";


				html=html+"</td></tr>";
				html = html +"			<tr><td>";
				html = html +"<select id='inventorystatuslist' class='labelmsg'  name = 'inventorystatuslist' onchange='invtStatus_OnChange()'>" ;
				for(var Cnt1=0; Cnt1 < inventoryStatusLst.length; Cnt1++)
				{                    	 
					var vInventoryStatus = inventoryStatusLst[Cnt1][0];
					var VId =inventoryStatusLst[Cnt1][1];

					if(makeInvAvailFlag == VId)
					{
						html = html +" <option   selected  value="+VId+"> "+vInventoryStatus+"</option>";

					}
					else
					{
						html = html +" <option     value="+VId+"> "+vInventoryStatus+"</option>";
					}

				}

				html=html+"</select></td>";
			}
			html = html +"</tr>";


		}

		if(itemType == 'noninventoryitem' || itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || 
				itemType=='giftcertificateitem')
		{

			html=html+"			<tr>";
			html = html +"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='hidden' value="+itemType+" readonly='readonly'/>";
			html = html +"				</td>";
		}
		else
		{
			html = html +"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Enter/Scan Bin Location"+	
			"				</td>"+
			"			</tr>"+
			"			<tr>";
			html = html +"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>";
			html = html +"				</td></tr>";
		}


		html = html +"<tr><td></td></tr></table>"+

		"			<table><tr>"+
		"				<td align = 'left'></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='"+btnText+"' onclick='return validateForm_poInbound();'/></td><td width='20px'></td><td>"+
		"			</tr></table>"; 
		//nlapiLogExecution('ERROR', 'vBinDetails', vBinDetails);
		//nlapiLogExecution('ERROR', 'errMsg', errMsg);
		if((vBinDetails!=null &&  vBinDetails!='' && vBinDetails.length != null) || (errMsg == "Please configure stage locations" 
			|| errMsg == "Please select use bins flag for this item" || errMsg =="RCRD_HAS_BEEN_CHANGED : This order/order line has been changed" || 
			errMsg == "This item has mixflag false, please configure new bin locations" || errMsg =="Please configure bin locations" || 
			errMsg =="Please configure put strategies/bin locations") || (getPreferBin != null && getPreferBin != 'null' && getPreferBin !='' && getPreferBin) != 'undefined'
				|| (makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{

			if(tableHeaderText == "Staging Bin Locations")
			{
				html = html + "	<table>"+
				" <tr>"+
				" <td>"+
				"	<table class='table'>"+
				" <tr class='uir-machine-headerrow'>"+
				" <td class='listheadertdleft listheadertextb uir-column-large' >"+tableHeaderText+""+
				" </td>"+				 
				"</tr>";
				var vAltClass='';
				for (var s = 0; s < vBinDetails.length; s++) {
					if(s%2==1)
						vAltClass='uir-list-row-tr line uir-list-row-even';
					else
						vAltClass='uir-list-row-tr line uir-list-row-odd';
					var txtBin = vBinDetails[s];	
					if(txtBin == getPreferBin && getPreferBinType == 'Stage')
					{						
						html = html + "	<tr class='" + vAltClass + "'>"+
						" <td><a  onclick='return DisplayBin_poInbound(\""+txtBin+"\");' href='#' >"+txtBin+"</a><span style='color:red;'>* </span></td>"+					
						"</tr>";
						//case # 201412820 end
					}
					if(txtBin != getPreferBin)
					{
						html = html + "	<tr class='" + vAltClass + "'>"+
						" <td><a onclick='return DisplayBin_poInbound(\""+txtBin+"\");' href='#' >"+txtBin+"</a></td>"+						
						"</tr>";
					}
					if(s >=4)
					{
						if(errMsg != '')
						{

						}
						break;
					}
				}
				html = html + "	</table>"+		
				" </td>"+
				"</tr>"+
				"</table>";
			}
			else
			{
				html = html + 	" <table  style='border-spacing: 0;'>";
				html = html +	"			<tr class='uir-machine-headerrow' >"+
				"				<td>Bin Location"+	
				"				</td>"+
				"				<td class='align-right'>Qty"+	
				"				</td>";
				if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
				{
					html = html +"				<td></td>";
					html = html +"				<td class='align-right'>Qty In "+vUnits+"";
					html = html +"				</td>";
				}
				html = html +"			</tr>";
				var vAltClass='uir-list-row-tr line uir-list-row-even';
				if(getPreferBin != null && getPreferBin != '')
				{
					var preferBinId = nswms_GetValidBinInternalId(getPreferBin,whLocation,null);
					var preferqtyDetails = getBinwiseQtyDetails(preferBinId,whLocation);
					var vqty=preferqtyDetails[0];
					if(vqty == '' || vqty == null || vqty == 'undefined')
						vqty=0;
					//case # 201412820 start
					html = html + "	<tr class='" + vAltClass + "'>"+
					" <td><a  onclick='return DisplayBin_poInbound(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+ 
					"				<td class='align-right' >"+parseFloat(parseFloat(vqty).toFixed(5))+""+	
					"				</td>";
					if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
					{
						vqty=Big(vqty).mul(getStockConversionRate);
						html = html +"				<td></td>";
						html = html +"				<td class='align-right'>"+parseFloat(parseFloat(vqty).toFixed(5))+"</td>";

					}
					html = html +"</tr>";
					//case # 201412820 end
				}	

				for (var st = 0; st < vBinDetails.length; st++) {
					if(st%2==1)
						vAltClass='uir-list-row-tr line uir-list-row-even';
					else
						vAltClass='uir-list-row-tr line uir-list-row-odd';
					var currValues = vBinDetails[st];
					var txtBin = currValues[0];
					var txtBinInternalId = currValues[1];
					var qtyDetails = getBinwiseQtyDetails(txtBinInternalId,whLocation);
					var qty = qtyDetails[0];
					if(qty == '' || qty == null || qty == 'undefined')
						qty=0;
					if(getPreferBin != txtBin)
					{	
						//case # 201412820 start
						html = html +	"			<tr class='" + vAltClass + "'>"+
						"<td><a  onclick='return DisplayBin_poInbound(\""+txtBin+"\");' href='#' >"+txtBin+"</a>"+
						"				</td>"+
						"				<td class='align-right'>"+parseFloat(parseFloat(qty).toFixed(5))+""+	
						"				</td>";
						if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
						{
							qty=Big(qty).mul(getStockConversionRate);
							html = html +"				<td></td>";
							html = html +"				<td class='align-right'>"+parseFloat(parseFloat(qty).toFixed(5)) +"";
							html = html +	"				</td>";
						}
						html = html +"			</tr>";
						//case # 201412820 end
					}

					if(getPreferBin==null || getPreferBin=='null' || getPreferBin=='' || getPreferBin==undefined)
					{
						if(parseInt(st) >= 4)						
							break;
					}
					else
					{
						if(parseInt(st) >= 3)
							break;
					}


				}
				html = html +" </td>"+
				"</tr>"+
				"</table>";
			}

		}
		else if(itemType != "noninventoryitem" && itemType!="otherchargeitem" && itemType!="serviceitem" && itemType!="downloaditem" &&
				itemType!="giftcertificateitem")
		{
			var POarray = new Array();
			POarray["custparam_poid"] = request.getParameter('custparam_poid');
			POarray["custparam_actualbegindate"] = request.getParameter('custparam_actualbegindate');
			POarray["custparam_actualbegintime"] = request.getParameter('custparam_actualbegintime');	
			POarray["custparam_customer"] = request.getParameter('custparam_customer');
			POarray["custparam_actualbegintimeampm"] = request.getParameter('custparam_actualbegintimeampm');
			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_trantype"] = request.getParameter('custparam_trantype');
			POarray["custparam_ordertype"] = request.getParameter('custparam_ordertype');
			POarray["custparam_lotno"] = request.getParameter('custparam_lotno');
			POarray["custparam_itemtype"] = request.getParameter('custparam_itemtype');
			POarray["custparam_lotexpirydate"] = request.getParameter('custparam_lotexpirydate');
			POarray["custparam_company"] = request.getParameter('custparam_company');
			POarray["custparam_poitem"] = request.getParameter('custparam_poitem');
			POarray["custparam_lineno"] = request.getParameter('custparam_lineno');
			POarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
			POarray["custparam_rec_qty"] = request.getParameter('custparam_rec_qty');
			POarray["custparam_rem_qty"] = request.getParameter('custparam_rem_qty');
			POarray["custparam_pointernalid"] = request.getParameter('custparam_pointernalid');
			POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
			POarray["custparam_usedbinsflag"] = request.getParameter('custparam_usedbinsflag');
			POarray["custparam_uom"] = request.getParameter('custparam_uom');
			POarray["custparam_conversionrate"] = request.getParameter('custparam_conversionrate');
			POarray["custparam_tolotqty"]=request.getParameter('custparam_tolotqty');	
			POarray["custparam_stockconversionrate"] = getStockConversionRate; 
			POarray["custparam_specord"] = vSpecOrder;
			//nlapiLogExecution('ERROR', 'systemRule', systemRule);
			if(POarray["custparam_usedbinsflag"] == "F")
			{
				POarray["custparam_error"] = 'Please select use bins flag for this item';
			}
			else if  (systemRule=='Y')
			{

				POarray["custparam_error"] = 'Please configure stage locations';
			}
			else
			{

				if((vBinDetails == null || vBinDetails == '' || vBinDetails.length == null) && blnMixItem == 'F')
				{
					POarray["custparam_error"] = 'This item has mixflag false, please configure new bin locations';
				}
				else
				{
					POarray["custparam_error"] = 'Please configure put strategies/bin locations';					
				}

			}
			if(qtyCheckFlag == "F")
			{
				POarray["custparam_error"] = 'RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';
			}
			response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
			return;
		}

		html = html + " </form>";


		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		if(results ==null ||  results =='' || results == 'null')
		{
			html = html +"<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
		}
		else
		{
			html = html +"<script type='text/javascript'>setFocus();</script>";
		}

		html=html+"</body>"+
		"</html>";

		nlapiLogExecution('Error', 'Writing html to form starts', TimeStampinSec());

		response.write(html);

		nlapiLogExecution('Error', 'GET ends', TimeStampinSec());
	}
	else
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var convertedQty = request.getParameter('txtqty');
		var enterQty=request.getParameter('txtqty');
		var vInvStatus_select = request.getParameter('inventorystatuslist');

		if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
		{
			enterQty = request.getParameter('hdntotaluomqtyentered');
		}

		if(isNaN(enterQty))
		{
			enterQty='';
		}
		if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined')
		{
			enterQty=Big(enterQty);

		}
		nlapiLogExecution('DEBUG', 'enterQty',enterQty);

		var enterBin=request.getParameter('txtbin');
		POarray["custparam_poid"] = request.getParameter('custparam_poid');
		POarray["custparam_screenno"] = '2';
		POarray["custparam_actualbegindate"] = request.getParameter('hdnActualBeginDate');	
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_customer"] = request.getParameter('hdnCustomer');
		POarray["custparam_actualbegintimeampm"] = request.getParameter('hdnActualBeginTimeAMPM');
		POarray["custparam_trantype"] = request.getParameter('hdntrantype');
		POarray["custparam_specord"] = request.getParameter('hdnvspecorder');
		var orderType=request.getParameter('hdnordertype');
		POarray["custparam_ordertype"]=orderType;
		var itemType=request.getParameter('hdnitemtype');
		POarray["custparam_itemtype"] = itemType;
		POarray["custparam_pointernalid"] = request.getParameter('hdnPoInternalId');
		POarray["custparam_lineno"] = request.getParameter('hdnPoLineno');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_rem_qty"] = request.getParameter('custparam_rem_qty');
		POarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		POarray["custparam_poitem"] = request.getParameter('custparam_poitem');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		POarray["custparam_lotno"] =request.getParameter('hdnlotno');
		POarray["custparam_lotexpirydate"] = request.getParameter('hdnlotexpirydate');
		POarray["custparam_usedbinsflag"] = request.getParameter('hdnusedBins');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		POarray["custparam_tolotqty"]=request.getParameter('custparam_tolotqty');
		POarray["custparam_tolotrcvqty"]=request.getParameter('hdnvporcvQty');
		POarray["custparam_uom"] = request.getParameter('hdnuom');
		POarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		POarray["custparam_inventorystatus"] = vInvStatus_select;
		POarray["custparam_tolotinvstatusid"]=request.getParameter('hdntrnLotInvStatusIdStr');
		POarray["custparam_tolotinvstatustxt"]=request.getParameter('hdntrnLotInvStatusTxtStr');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');
		POarray["custparam_compbarcodestring"] = request.getParameter('hdncompositebarcode');

		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var vConversionRate = request.getParameter('hdnvConversionRate'); 
		var vPOremqty=request.getParameter('hdnItemRemQty');
		nlapiLogExecution('Debug', 'vPOremqty',vPOremqty);

		if(vConversionRate != null && vConversionRate != '' && vConversionRate != 'null' && vConversionRate != 'undefined' && 
				enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined')
		{
			convertedQty = Big(enterQty).mul(vConversionRate);
			nlapiLogExecution('DEBUG', 'convertedQty', convertedQty);
		}
		POarray["custparam_tolotqty"]=request.getParameter('custparam_tolotqty');	
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		var poOverageCheck=request.getParameter('hdnvPOoverageChecked');

		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var poInternalId=request.getParameter('hdnPoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var poLineno=request.getParameter('hdnPoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var lotno= request.getParameter('hdnlotno');
		var lotExpiryDate= request.getParameter('hdnlotexpirydate');

		var strItemGrp=request.getParameter('hdnstrItemGrp');
		var strItemFam=request.getParameter('hdnstrItemFam');

		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var whLocation = request.getParameter('custparam_whlocation');


		var useitemcostflag = '';

		var systemRuleValue = getSystemRuleValue('Manually post item receipts?',whLocation);


		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		var logMsg = 'PO = ' + POarray["custparam_poid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'poInternalId = ' + poInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'poLineno = ' + poLineno + '<br>';
		logMsg = logMsg + 'preferBin = ' + preferBin + '<br>';
		logMsg = logMsg + 'lotno = ' + lotno + '<br>';
		logMsg = logMsg + 'lotExpiryDate = ' + lotExpiryDate + '<br>';
		logMsg = logMsg + 'blnMixItem = ' + blnMixItem + '<br>';
		logMsg = logMsg + 'blnMixLot = ' + blnMixLot + '<br>';
		logMsg = logMsg + 'poOverageCheck = ' + poOverageCheck + '<br>';
		logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
		logMsg = logMsg + 'convertedQty = ' + convertedQty + '<br>';
		logMsg = logMsg + 'vConversionRate = ' + vConversionRate + '<br>';
		logMsg = logMsg + 'vInvStatus_select = ' + vInvStatus_select + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - QTY', logMsg);
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				nlapiLogExecution('Debug', 'sessionobj', sessionobj);
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){

					//Code to navigate to the same screnn when status is changed.

					var makeInventoryAvailFlag  = request.getParameter('inventorystatuslist');
					var isFromStatusChange = request.getParameter('hdnfromstatuschange');
					if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && 
							isFromStatusChange != undefined && isFromStatusChange=='T' )
					{

						POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						nlapiLogExecution('DEBUG', 'POarray["custparam_makeinventoryavailflag"]', POarray["custparam_makeinventoryavailflag"]);
						POarray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
						return;

					}


					if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && ((parseFloat(remQty) >= parseFloat(enterQty)) || poOverageCheck=="T"))
					{
						try{

							var fulfillmentIdArray = new Array();
							var lineFullQty=0;
							if((trantype == 'transferorder'))
							{
								var useitemcostfilts = new Array();
								useitemcostfilts.push(new nlobjSearchFilter('internalid', null, 'is',poInternalId));																								

								var transferordervalues = new nlapiSearchRecord('transaction','customsearch_wmsse_useitemcostpreference',useitemcostfilts,null);

								if(transferordervalues!=null && transferordervalues!='' && transferordervalues!='null' && transferordervalues.length>0)
								{
									useitemcostflag=transferordervalues[0].getValue('istransferpricecosting');
								}



								if(useitemcostflag == null || useitemcostflag == '' || useitemcostflag == 'null')
								{
									useitemcostflag = itemcostruleValue;
								}


								var fulfillqtycheck = 'F';																
								var filts = new Array();
								filts.push(new nlobjSearchFilter('internalid', null, 'is',poInternalId));
								filts.push(new nlobjSearchFilter('type', null, 'anyof', 'TrnfrOrd'));
								if(poLineno!=null && poLineno!= 'null' && poLineno!= undefined && poLineno != '')
									filts.push(new nlobjSearchFilter('line', null, 'equalto', (parseFloat(poLineno)-1)));								
								filts.push(new nlobjSearchFilter('quantityshiprecv', null, 'notequalto', 0));

								var cols = new Array();
								//cols.push(new nlobjSearchColumn('quantityshiprecv'));								

								var TOLineDtls = new nlapiSearchRecord('transferorder','customsearch_wmsse_transactionid_details',filts,null);


								if(TOLineDtls != null && TOLineDtls != '' && TOLineDtls != 'null' && TOLineDtls != 'undefined')
								{
									nlapiLogExecution('Debug', 'TOLineDtls.length', TOLineDtls.length);
									lineFullQty = TOLineDtls[0].getValue('quantityshiprecv');

								}

								var filters = new Array();
								var trecord = '';
								if(poInternalId!=null && poInternalId!= 'null' && poInternalId!= undefined && poInternalId != '')
									filters.push(new nlobjSearchFilter('internalid', null, 'is',poInternalId));
								filters.push(new nlobjSearchFilter('formulatext', null, 'is', 'Shipping').setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
								filters.push(new nlobjSearchFilter('type', null, 'anyof', 'TrnfrOrd'));
								if(poLineno!=null && poLineno!= 'null' && poLineno!= undefined && poLineno != '')
									filters.push(new nlobjSearchFilter('line', null, 'equalto', (parseFloat(poLineno)-1)));	
								var TOLineDetails = new nlapiSearchRecord('transferorder','customsearch_wmsse_transf_fulfill_detail',filters,null);


								var vitemfulfillmentid = '';
								var itemType = nswms_GetItemType(FetchedItemId, POarray["custparam_whlocation"]);
								if(TOLineDetails!=null && TOLineDetails!= 'null' && TOLineDetails!= undefined && TOLineDetails != ''&& TOLineDetails.length>0)
								{

									var remainingqty=0;
									for (var d = 0; d < TOLineDetails.length; d++)
									{
										try
										{

											vitemfulfillmentid = TOLineDetails[d].getValue('internalid','fulfillingTransaction','group');											
											vitemfulfillmentitemid = TOLineDetails[d].getValue('item','fulfillingTransaction','group');											
											vitemfulfillmentqty = TOLineDetails[d].getValue('quantity','fulfillingTransaction','sum');



											if(vitemfulfillmentid!=null && vitemfulfillmentid!= 'null' && vitemfulfillmentid!= undefined && vitemfulfillmentid != '' && (parseInt(FetchedItemId) ==  (vitemfulfillmentitemid)))
											{
												var polinelength = '';
												var itemfulfilserialno = '';
												var lotSpecQty = 0;
												var lotQtyFlag = 'F';
												var invQtyFlag = 'F';
												var invCheckDisableFlag = 'F';
												var frecord = nlapiLoadRecord('itemfulfillment', vitemfulfillmentid);
												var fitemcount=frecord.getLineItemCount('item');
												for(var f=1;f<=fitemcount;f++)
												{
													var fitem=frecord.getLineItemValue('item','item',f);
													var fline=frecord.getLineItemValue('item','orderline',f);
													var pofline= parseInt(fline) + 1;


													if((fitem==FetchedItemId) && (parseInt(poLineno)==parseInt(pofline)))
													{
														frecord.selectLineItem('item', f);
														var compSubRecord = frecord.viewCurrentLineItemSubrecord('item','inventorydetail');
														if(compSubRecord!=null && compSubRecord!=''&& compSubRecord!='null')
															polinelength = compSubRecord.getLineItemCount('inventoryassignment');

														for(var j1=1;j1<=polinelength ;j1++)
														{
															itemfulfilserialno=compSubRecord.getLineItemText('inventoryassignment','issueinventorynumber',j1);

															if(inventoryStatusFeature)
															{
																if((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem"))
																{
																	var vSercount = 0;
																	var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

																	if(parseInt(complinelength)>0)
																	{
																		for(var r1=1;r1<=complinelength;r1++)
																		{ 
																			var curInvStatus = compSubRecord.getLineItemValue('inventoryassignment','inventorystatus',r1);

																			if(curInvStatus == vInvStatus_select)
																			{
																				vSercount ++ ;
																			}
																		}


																		vitemfulfillmentqty = vSercount;
																		if(curInvStatus == vInvStatus_select && ((parseFloat(vSercount) == parseFloat(convertedQty)) || (parseFloat(vSercount) == parseFloat(enterQty))))
																		{
																			invQtyFlag = 'T';
																			break;
																		}
																		if(curInvStatus == vInvStatus_select && parseFloat(vSercount) >= parseFloat(convertedQty) && parseFloat(vSercount) >= parseFloat(enterQty) 
																				&& useitemcostflag == 'F')
																		{

																			invCheckDisableFlag = 'T';
																		}
																		if(curInvStatus == vInvStatus_select && parseFloat(vSercount) < parseFloat(enterQty) && useitemcostflag == 'F')
																		{
																			POarray["custparam_error"] = 'Please enter quantity as per fulfillment records';
																			response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
																			return;
																		}
																		if(curInvStatus!=null && curInvStatus!='' && vInvStatus_select!=null && vInvStatus_select!='' && curInvStatus != vInvStatus_select)
																		{
																			invCheckDisableFlag = 'T';
																		}


																	}
																}
																else
																{
																	var invSpecQty = compSubRecord.getLineItemValue('inventoryassignment','quantity',j1);
																	var curInvStatus = compSubRecord.getLineItemValue('inventoryassignment','inventorystatus',j1);
																	nlapiLogExecution('DEBUG', 'invSpecQty,curInvStatus,vInvStatus_select',invSpecQty+','+curInvStatus+','+vInvStatus_select);
																	nlapiLogExecution('DEBUG', 'convertedQty,enterQty',convertedQty+','+enterQty);
																	nlapiLogExecution('DEBUG', 'curInvStatus == vInvStatus_select',curInvStatus == vInvStatus_select);
																	nlapiLogExecution('DEBUG', '((parseFloat(invSpecQty) == parseFloat(convertedQty)) || (parseFloat(invSpecQty) == parseFloat(enterQty)))',
																			((parseFloat(invSpecQty) == parseFloat(convertedQty)) || (parseFloat(invSpecQty) == parseFloat(enterQty))));
																	nlapiLogExecution('DEBUG', 'Final result',
																			curInvStatus == vInvStatus_select && ((parseFloat(invSpecQty) == parseFloat(convertedQty)) || (parseFloat(invSpecQty) == parseFloat(enterQty))));
																	if(curInvStatus == vInvStatus_select && ((parseFloat(invSpecQty) == parseFloat(convertedQty)) || (parseFloat(invSpecQty) == parseFloat(enterQty))))
																	{
																		invQtyFlag = 'T';
																		break;
																	}
																	if(curInvStatus == vInvStatus_select && parseFloat(invSpecQty) >= parseFloat(convertedQty) && parseFloat(invSpecQty) >= parseFloat(enterQty) 
																			&& useitemcostflag == 'F')
																	{

																		invCheckDisableFlag = 'T';
																	}
																	if(itemfulfilserialno!=null && itemfulfilserialno!='')
																	{
																		if(curInvStatus == vInvStatus_select && parseFloat(invSpecQty) < parseFloat(convertedQty) && parseFloat(invSpecQty) < parseFloat(enterQty) && itemfulfilserialno == lotno)
																		{
																			POarray["custparam_error"] = 'Please enter quantity as per fulfillment records';
																			response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
																			return;
																		}
																	}
																	else
																	{
																		if(curInvStatus == vInvStatus_select && parseFloat(invSpecQty) < parseFloat(convertedQty) && parseFloat(invSpecQty) < parseFloat(enterQty))
																		{
																			POarray["custparam_error"] = 'Please enter quantity as per fulfillment records';
																			response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
																			return;
																		}
																	}
																	if(curInvStatus!=null && curInvStatus!='' && vInvStatus_select!=null && vInvStatus_select!='' && curInvStatus != vInvStatus_select)
																	{
																		invCheckDisableFlag = 'T';
																	}
																}
															}
															else
															{
																if(itemfulfilserialno!=null && itemfulfilserialno!='')
																{
																	invCheckDisableFlag = 'T';
																	var tserials=itemfulfilserialno.split('');

																	if(tserials!=null && tserials!='' && tserials.length>0)
																	{
																		if(tserials.indexOf(lotno)!=-1)
																		{

																			lotSpecQty = compSubRecord.getLineItemValue('inventoryassignment','quantity',j1);

																			if((parseFloat(lotSpecQty) == parseFloat(convertedQty)) || (parseFloat(lotSpecQty) == parseFloat(enterQty)))
																			{
																				lotQtyFlag = 'T';
																				break;
																			}
																		}
																	}
																}
															}
														}
													}
													if(lotQtyFlag == 'T' || invQtyFlag == 'T')
														break;
												}


												if ((parseInt(FetchedItemId) ==  (vitemfulfillmentitemid)) && ((parseFloat(vitemfulfillmentqty) == parseFloat(enterQty)) ||(parseFloat(vitemfulfillmentqty) == parseFloat(convertedQty)) || lotQtyFlag == 'T' || invQtyFlag == 'T'))
												{													
													fulfillqtycheck = 'T';

													fulfillmentIdArray.push(parseInt(vitemfulfillmentid));
												}
												else if((FetchedItemId) ==  (vitemfulfillmentitemid) && useitemcostflag == 'F')
												{

													if(vPOremqty<=0 || (invCheckDisableFlag == 'F' && inventoryStatusFeature))
													{
														POarray["custparam_error"] = 'Please enter quantity as per fulfillment records';
														response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
														return;
													}
													fulfillqtycheck = 'T';

													fulfillmentIdArray.push(parseInt(vitemfulfillmentid));
												}

											}
										}
										catch(e)
										{
											nlapiLogExecution('ERROR', 'exception in fulfillment details',e);
										}

									}
								}
								if(fulfillqtycheck == 'F' && useitemcostflag =='T')
								{
									POarray["custparam_error"] = 'Please enter quantity as per fulfillment records';
									response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
									return;
								}
							}

							var itemfilters=new Array();
							itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
							itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
							var itemcolumns= new Array();

							var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_receivingitemdetails', itemfilters, null);							
							nlapiLogExecution('Debug', 'itemresults', itemresults); 
							if(itemresults == null || itemresults == '' || itemresults == 'null')
							{
								POarray["custparam_error"] = 'Entered item is inactive';
								response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
								return;
							}
							var vnpoLineDetails = getPOLineDetailsNew(POarray["custparam_poid"],trantype,FetchedItemId,POarray["custparam_whlocation"],poLineno);

							if(vnpoLineDetails == null || vnpoLineDetails == '' || vnpoLineDetails.length == null)
							{
								POarray["custparam_error"] = 'Entered item is deleted from the order or the transaction is completed';
								response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
								return;
							}
							var itemType = nswms_GetItemType(FetchedItemId, POarray["custparam_whlocation"]);

							POarray["custparam_itemtype"] = itemType;
							POarray["custparam_enterQty"] = Number(Big(enterQty));//since this is used in math calculation in serial screen there we are fetching invalid value if we donot parse to NUmber

							if((enterBin=="" || enterBin==null || enterBin=='null') && (preferBin!="" && preferBin !=null && preferBin !='null' && preferBin !='undefined'))
							{
								enterBin = preferBin;
							}

							if(enterBin!=null && enterBin!="")
							{
								var binInternalId='';

								var systemRule=getSystemRuleValue('Stage received items before putting away?',whLocation);

								if(systemRule==null || systemRule=='' || systemRule=='null' || systemRule=='undefined')
								{
									systemRule= 'N';
								}

								if(systemRule==null || systemRule=='' || systemRule=='N')
								{
									var stageLocArr =  new  Array();
									var stgLocId=0;
									var cols =new Array();
									cols[0] = new nlobjSearchColumn('name');
									var BinlocationTypes =  new nlapiSearchRecord('customlist_wmsse_bin_loc_type', null, null, cols);

									if(BinlocationTypes != null && BinlocationTypes !='' && BinlocationTypes.length > 0)
									{

										var strName ='Stage';
										var strWipc='WIP';
										for(var b=0;b<BinlocationTypes.length;b++)
										{
											var tName= BinlocationTypes[b].getValue('name');

											if(tName == strName || tName == strWipc)
											{
												stageLocArr.push(BinlocationTypes[b].getId());

											}
										}
									}

									if(preferBin != enterBin)
									{
										var filter=new Array(); 
										filter.push(new nlobjSearchFilter('binnumber','null','is',enterBin));
										if(stageLocArr != null && stageLocArr.length > 0)
										{
											filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type','null','noneof',stageLocArr));	
										}
										filter.push(new nlobjSearchFilter('inactive',null,'is','F'));
										if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
											filter.push(new nlobjSearchFilter('location',null,'anyof',whLocation));
										var searchrecord=nlapiSearchRecord('Bin',null,filter,null);
										if(searchrecord!=null && searchrecord!="")
											binInternalId=searchrecord[0].getId();
										if((binInternalId=='' || binInternalId==null) && (itemType != 'noninventoryitem' && itemType != 'otherchargeitem' && itemType!='serviceitem' && itemType!='downloaditem' && itemType!='giftcertificateitem'))
										{
											POarray["custparam_error"] = 'Please enter/scan valid bin location';
											response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
											return;
										}
									}
									else
									{
										binInternalId = nswms_GetBinInternalId(enterBin,whLocation);

									}


									if((enterBin != preferBin) && (itemType != 'noninventoryitem' && itemType != 'otherchargeitem' && itemType!='serviceitem' && itemType!='downloaditem' && itemType!='giftcertificateitem'))
									{
										if(blnMixItem!="T")
										{

											var filterStrat = new Array();

											if(FetchedItemId != null && FetchedItemId != '')
												filterStrat.push(new nlobjSearchFilter('internalid',null, 'noneof', FetchedItemId));
											if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '')
												filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', POarray["custparam_whlocation"]));
											if(binInternalId!= null && binInternalId!= '')
												filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', binInternalId));
											var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_invt_inbound',filterStrat, null);

											if(objInvDetails!=null && objInvDetails!='')
											{
												if(objInvDetails.length>0)
												{
													nlapiLogExecution('ERROR', 'Inside if objInvDetails', objInvDetails.length);
													POarray["custparam_error"] = 'This item has mix items in bins flag false, choose different bin.';
													objBinDetails1=null;
													response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
													return;
												}
											}
										}

										if(blnMixLot != 'T' && (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
										{
											nlapiLogExecution('ERROR', 'Inside mixed lot', blnMixLot);

											var filterStrat = new Array();

											if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '')
												filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
											if(binInternalId!= null && binInternalId!= '')
												filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));
											if(blnMixLot != 'T' && lotno!=null && lotno!='' && lotno!='null' && lotno!='undefined')
												filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand','isnot', lotno));
											filterStrat.push(new nlobjSearchFilter('islotitem',null,'is', 'T'));
											var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);

											if(objInvDetails!=null && objInvDetails!='')
											{
												if(objInvDetails.length>0)
												{
													nlapiLogExecution('ERROR', 'Inside if objInvDetails', objInvDetails.length);
													POarray["custparam_error"] = 'This item has mix lots in bins flag false choose different bin.';
													objBinDetails1=null;
													response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
													return;
												}
											}
										}
									}



								}
								else
								{
									var stgLocId=new Array();
									var cols =new Array();
									cols[0] = new nlobjSearchColumn('name');
									var BinlocationTypes =  new nlapiSearchRecord('customlist_wmsse_bin_loc_type', null, null, cols);

									if(BinlocationTypes != null && BinlocationTypes !='' && BinlocationTypes.length > 0)
									{
										var strName ='Stage';
										for(var b=0;b<BinlocationTypes.length;b++)
										{
											var tName= BinlocationTypes[b].getValue('name');

											if(tName == strName)
											{
												stgLocId.push(BinlocationTypes[b].getId());
												break;
											}
										}
									}
									var binInternalId='';
									var filter=new Array(); 
									filter.push(new nlobjSearchFilter('binnumber','null','is',enterBin));
									if(POarray["custparam_whlocation"]!=null && POarray["custparam_whlocation"]!='')
										filter.push(new nlobjSearchFilter('location',null,'anyof',POarray["custparam_whlocation"]));
									filter.push(new nlobjSearchFilter('inactive',null,'is','F'));
									var cols = new Array();
									cols.push(new nlobjSearchColumn('custrecord_wmsse_bin_stg_direction'));
									cols.push(new nlobjSearchColumn('custrecord_wmsse_bin_loc_type'));
									var searchrecord=nlapiSearchRecord('Bin',null,filter,cols);
									if(searchrecord!=null && searchrecord!="")
									{
										if(stgLocId.indexOf(searchrecord[0].getValue('custrecord_wmsse_bin_loc_type'))==-1)
										{
											POarray["custparam_error"] = "Entered bin location type is not stage.";
											response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
											nlapiLogExecution('ERROR', 'Invalid bin scanned ', '');
											return;
										}
										else if(searchrecord[0].getValue('custrecord_wmsse_bin_stg_direction')!=1)
										{
											POarray["custparam_error"] = "Please enter inbound stage direction bin.";
											response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
											nlapiLogExecution('ERROR', 'Invalid bin scanned ', '');
											return;
										}

										else
										{
											binInternalId=searchrecord[0].getId();
											searchrecord=null; 
										}

									}


									if((binInternalId=='' || binInternalId==null) && (itemType != 'noninventoryitem' && itemType != 'otherchargeitem' && itemType!='serviceitem' && itemType!='downloaditem' && itemType!='giftcertificateitem'))
									{
										POarray["custparam_error"] = 'Please enter/scan valid stage bin';
										response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
										return;
									}
								}

							}
							else
							{
								POarray["custparam_error"] = 'Please enter/scan bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
								return;
							}

							if(enterBin!=null && enterBin!='')
								POarray["custparam_enterBin"] = enterBin;

							if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{


								var convertionQty = Big(enterQty).mul(POarray["custparam_conversionrate"]);
								nlapiLogExecution('DEBUG', 'convertionQty', convertionQty);
								if(convertionQty.toString().indexOf('.') != -1)//Added if because if we click on enter button javascript code is not executing.
								{
									POarray["custparam_error"] = 'Decimal qty is not allowed for serial item';
									response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
									return;
								}

								response.sendRedirect('SUITELET', 'customscript_wmsse_checkinserial', 'customdeploy_wmsse_checkinserial', false, POarray);
								return;
							}
							else if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType == 'noninventoryitem' || itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || itemType=='giftcertificateitem')
							{


								//this is stop the duplicate entry of open task record when deffered item receipt rule is set to 'Y'
								var tempflag ='F';
								var poitemLineDetails =  getPOLineDetailsNew(POarray["custparam_poid"], trantype,FetchedItemId,POarray["custparam_whlocation"]); 

								var vColumnslist ='';
								var openputawayQtyIndex = 7;
								var unitsIndex =14;
								var conversionQtyIndex =15;
								var coversionRcvdQtyIndex=16;
								var coversionRateIndex =17;
								var toshippedQTYIndex =18;
								if(poitemLineDetails!=null && poitemLineDetails!='' && poitemLineDetails.length > 0)
								{
									vColumnslist=poitemLineDetails[0].getAllColumns();

									for(var x1=0;x1<vColumnslist.length;x1++)
									{
										var summaryLabel = vColumnslist[x1].getLabel();
										var name = vColumnslist[x1].getName();
										if(summaryLabel == 'Open Putaway Quantity')
										{
											openputawayQtyIndex = x1;
										}
										else if(name == 'unit')
										{
											unitsIndex =x1;
										}
										else if(summaryLabel == 'Conversion Order Quantity')
										{
											conversionQtyIndex = x1;
										}
										else if(summaryLabel == 'Conversion Received Quantity')
										{
											coversionRcvdQtyIndex = x1;
										}
										else if(summaryLabel == 'Conversion Rate')
										{
											coversionRateIndex = x1;
										}
										else if(summaryLabel == 'TO Fulfilled Quantity')
										{
											toshippedQTYIndex = x1;
											nlapiLogExecution('Debug', 'toshippedQTYIndex', toshippedQTYIndex);
										}
										else
										{

										}
									}
									for(var j=0; j<poitemLineDetails.length; j++)
									{

										var usedBins='';
										var polineno=poitemLineDetails[j].getValue('line',null,'group');
										var pocheckinqty=poitemLineDetails[j].getValue('quantity',null,'max');

										var vpoitemQty = poitemLineDetails[j].getValue(vColumnslist[conversionQtyIndex]);
										var vpoitemNSRcvQty = poitemLineDetails[j].getValue(vColumnslist[coversionRcvdQtyIndex]);
										var vpoitemRcvQty=poitemLineDetails[j].getValue(vColumnslist[openputawayQtyIndex]);
										if(vpoitemQty == null || vpoitemQty == '')
											vpoitemQty=0;
										if(vpoitemRcvQty==null || vpoitemRcvQty=='')
											vpoitemRcvQty=0;
										if(vpoitemNSRcvQty==null || vpoitemNSRcvQty=='')
											vpoitemNSRcvQty=0;

										if(trantype=="returnauthorization")
										{
											if(parseInt(vpoitemQty)<0)
												vpoitemQty=Big(vpoitemQty).mul(-1);
											nlapiLogExecution('DEBUG', 'vpoitemQty', vpoitemQty);

										}
										if(trantype=="transferorder")
										{

											vpoitemQty=poitemLineDetails[j].getValue(vColumnslist[toshippedQTYIndex]);
											nlapiLogExecution('Debug', 'vpoitemQty', vpoitemQty); 

											if(parseInt(vpoitemQty) == 0)
											{
												//check for whether directly fulfilled in the netsuite.
												var filters = new Array();
												var columns = new Array();
												//columns.push(new nlobjSearchColumn('quantityshiprecv'));
												//columns.push(new nlobjSearchColumn('line'));
												filters.push(new nlobjSearchFilter('tranid', null, 'is',POarray["custparam_poid"] ));
												filters.push(new nlobjSearchFilter('line', null, 'equalto', (parseFloat(poLineno)-1)));	
												filters.push(new nlobjSearchFilter('formulatext', null, 'is', 'Shipping').setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
												filters.push(new nlobjSearchFilter('type', null, 'anyof', 'TrnfrOrd'));
												var TOLineDetails = new nlapiSearchRecord('transferorder','customsearch_wmsse_transactionid_details',filters,null);

												if(TOLineDetails != null && TOLineDetails != '' && TOLineDetails != 'null' && TOLineDetails.length >0)
												{
													nlapiLogExecution('Debug', 'TOLineDetails', TOLineDetails.length); 
													for(var t=0;t<TOLineDetails.length;t++)
													{
														var tline=TOLineDetails[t].getValue('line');

														if(parseInt(tline)+1 == polineno)
														{
															vpoitemQty = TOLineDetails[t].getValue('quantityshiprecv'); 

															break;

														}
													}
												}

											}
										}

										var totalReceivedQty = Big(vpoitemRcvQty).plus(vpoitemNSRcvQty);
										var vPoreminqty = Big(vpoitemQty).minus(totalReceivedQty);

										if(parseFloat(vPoreminqty)<0)
											vPoreminqty=0;

										if(parseFloat(vPoreminqty)>0)
										{
											tempflag='T';
										}

									} 
								}
								if(tempflag=='F')
								{
									POarray["custparam_error"] = 'Transaction completed for this item';
									response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
									nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
									return;
								}								 
								if(itemType == 'noninventoryitem' || itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || itemType=='giftcertificateitem')
								{
									binInternalId ='';
								}
								enterQty=Number(Big(enterQty).toFixed(5));
								nlapiLogExecution('DEBUG', 'enterQty after toFixed while submitting bin transfer', enterQty);
								var itemReceipt= nswms_PostItemReceipt(trantype,poInternalId,FetchedItemId,poLineno,enterQty,binInternalId,itemType,
										POarray["custparam_whlocation"],lotno,lotExpiryDate,'',POarray["custparam_poid"],'','',
										POarray["custparam_actualbegintime"],POarray["custparam_customer"],POarray["custparam_uom"],
										POarray["custparam_conversionrate"],fulfillmentIdArray,lineFullQty,useitemcostflag,vInvStatus_select,
										POarray["custparam_compbarcodestring"]);

								nlapiLogExecution('ERROR', 'itemReceipt posted successfully', itemReceipt);
								var poLineDetails = getPOLineDetailsNew(POarray["custparam_poid"],trantype,null,POarray["custparam_whlocation"]);

								if(poLineDetails !=null && poLineDetails!="")
								{
									nlapiLogExecution('Debug', 'poLineDetails.length', poLineDetails.length);
									if(poLineDetails.length>0)
									{
										var vCount=0;
										var vColumnslist=poLineDetails[0].getAllColumns();

										var openputawayQtyIndex = 7;
										var unitsIndex =14;
										var conversionQtyIndex =15;
										var coversionRcvdQtyIndex=16;
										var coversionRateIndex =17;

										for(var x1=0;x1<vColumnslist.length;x1++)
										{
											var summaryLabel = vColumnslist[x1].getLabel();
											var name = vColumnslist[x1].getName();
											if(summaryLabel == 'Open Putaway Quantity')
											{
												openputawayQtyIndex = x1;
											}
											else if(name == 'unit')
											{
												unitsIndex =x1;
											}
											else if(summaryLabel == 'Conversion Order Quantity')
											{
												conversionQtyIndex = x1;
											}
											else if(summaryLabel == 'Conversion Received Quantity')
											{
												coversionRcvdQtyIndex = x1;
											}
											else if(summaryLabel == 'Conversion Rate')
											{
												coversionRateIndex = x1;
											}
											else if(summaryLabel == 'TO Fulfilled Quantity')
											{
												toshippedQTYIndex = x1;
												nlapiLogExecution('Debug', 'toshippedQTYIndex', toshippedQTYIndex);
											}
											else
											{

											}
										}

										for(var cnt=0;cnt<poLineDetails.length;cnt++)
										{

											var vpoitemRcvQty=poLineDetails[cnt].getValue(vColumnslist[openputawayQtyIndex]);
											var vpoitemQty = poLineDetails[cnt].getValue(vColumnslist[conversionQtyIndex]);
											var vpoitemNSRcvQty = poLineDetails[cnt].getValue(vColumnslist[coversionRcvdQtyIndex]);
											var toLine = poLineDetails[cnt].getValue('line',null,'group');

											if(vpoitemQty == null || vpoitemQty == '')
												vpoitemQty=0;
											if(vpoitemRcvQty==null || vpoitemRcvQty=='')
												vpoitemRcvQty=0;
											if(vpoitemNSRcvQty==null || vpoitemNSRcvQty=='')
												vpoitemNSRcvQty=0;

											if(trantype=="returnauthorization")
											{
												if(parseInt(vpoitemQty)<0)
													vpoitemQty=Big(vpoitemQty).mul(-1);
												nlapiLogExecution('DEBUG', 'vpoitemQty', vpoitemQty);
											}

											if(trantype=="transferorder")
											{

												vpoitemQty=poLineDetails[cnt].getValue(vColumnslist[toshippedQTYIndex]);
												nlapiLogExecution('Debug', 'vpoitemQty', vpoitemQty); 

												if(parseInt(vpoitemQty) == 0)
												{
													//check for whether directly fulfilled in the netsuite.
													var filters = new Array();
													var columns = new Array();
													//columns.push(new nlobjSearchColumn('quantityshiprecv'));
													//columns.push(new nlobjSearchColumn('line'));
													filters.push(new nlobjSearchFilter('tranid', null, 'is',POarray["custparam_poid"] ));
													filters.push(new nlobjSearchFilter('line', null, 'equalto', (parseFloat(toLine)-1)));	
													filters.push(new nlobjSearchFilter('formulatext', null, 'is', 'Shipping').setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
													filters.push(new nlobjSearchFilter('type', null, 'anyof', 'TrnfrOrd'));
													var TOLineDetails = new nlapiSearchRecord('transferorder','customsearch_wmsse_transactionid_details',filters,null);

													if(TOLineDetails != null && TOLineDetails != '' && TOLineDetails != 'null' && TOLineDetails.length >0)
													{

														vpoitemQty = TOLineDetails[0].getValue('quantityshiprecv'); 

													}

												}
											}


											var totalReceivedQty = Big(vpoitemRcvQty).plus(vpoitemNSRcvQty);

											var vPoreminqty = Big(vpoitemQty).minus(totalReceivedQty);
											nlapiLogExecution('DEBUG', 'vPoreminqty', vPoreminqty);

											if(parseFloat(vPoreminqty) > 0)
											{
												vCount=parseFloat(vCount)+1;
											}
											else
											{
											}

										}
										if(parseFloat(vCount) > 0)
										{	
											POarray["custparam_error"]='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
											return;
										}
										else
										{
											POarray["custparam_error"]='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
											return;
										}
									}
									else
									{
										POarray["custparam_error"]='';
										response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
										return;
									}
								}
								else
								{
									POarray["custparam_error"]='';
									response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
									return;
								}
							}
						}
						catch(e)
						{
							nlapiLogExecution('ERROR', 'inside catch exception', e);

							if ( e instanceof nlobjError )
							{
								POarray["custparam_error"]=e.getDetails();
								nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
							}
							else
							{
								POarray["custparam_error"]=e.toString();
								nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
							}

							response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
							return;
						}
					}
					else
					{
						if(poOverageCheck=="F" && (!isNaN(enterQty) )  && (!isNaN(remQty) )  && (parseFloat(enterQty) > parseFloat(remQty)))
						{
							POarray["custparam_error"] = 'Overage receiving is not allowed';
						}
						else
						{
							POarray["custparam_error"] = 'Please enter valid qty';
						}

						response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
						return;
					}
				} 
				else {
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						POarray["custparam_error"]='';
						nlapiLogExecution('ERROR', 'into lotnumberedinventoryitem', itemType);
						response.sendRedirect('SUITELET', 'customscript_wmsse_checkinlot', 'customdeploy_wmsse_checkinlot', false, POarray);
						return;
					}
					else
					{
						POarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku','customdeploy_wmsse_checkinsku', false, POarray);
						return;
					}
				}
			}
			catch(e)
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

				if ( e instanceof nlobjError )
				{
					POarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					POarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}

				response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
				return;
			}
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			POarray["custparam_error"]="Transaction is in progress...";
			response.sendRedirect('SUITELET', 'customscript_wmsse_checkinqty', 'customdeploy_wmsse_checkinqty', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.



function fnGetPutBinDetailsNew(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,strLocation,itemType,lotno,getPreferBinId)
{
	var strMsg="getItemInternalId : "+getItemInternalId +"<br>" +
	"strItemGrp : " + strItemGrp + "<br>" +
	"strItemFam : " + strItemFam + "<br>" +
	"blnMixItem : " + blnMixItem + "<br>" +
	"blnMixLot : " + blnMixLot + "<br>" +
	"getPreferBin : " + getPreferBin + "<br>" +
	"getPreferBinId : " + getPreferBinId + "<br>" +
	"strLocation : " + strLocation + "<br>" ;
	nlapiLogExecution('ERROR','fnGetPutBinDetails',strMsg);
	var vBinLocArr=new Array();
	var vPutZoneArr=new Array();

	var filterStrat = new Array(); 

	if(strLocation!= null && strLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', strLocation));
	filterStrat.push(new nlobjSearchFilter('custrecord_wmsse_bin_stg_direction','null','anyof',['1']));
	var objBinDetails = new nlapiSearchRecord('bin','customsearch_stage_bindetails',filterStrat, null);
	if(objBinDetails != null && objBinDetails != '')
	{

		for(var j=0;j<objBinDetails.length;j++)
		{
			var vValidBinId=objBinDetails[j].getValue('internalid');
			var vValidBin=objBinDetails[j].getValue('binnumber');
			if(vValidBinId == getPreferBinId)
			{				
				vBinLocArr.push(vValidBin);
			}			

			if(vValidBin != null && vValidBin != '' && vValidBin != getPreferBin && vBinLocArr.indexOf(vValidBin) == -1 && vBinLocArr.length<5)
				vBinLocArr.push(vValidBin);

			if(vBinLocArr.length>=5)
				break;
		}	
	} 

	return vBinLocArr;
}

function fnGetYetToBePicked(getItemInternalId,vBinDetails,strLocation,VUnitType,blnItemUnit)
{
	var ShipCheckFlag = false;

	var ctx = nlapiGetContext();
	if(ctx != null && ctx != '')
	{
		if(ctx.getFeature('pickpackship').toString() != null && ctx.getFeature('pickpackship').toString() != '')
			ShipCheckFlag =ctx.getFeature('pickpackship');
		nlapiLogExecution('ERROR', 'ShipCheckFlag', ShipCheckFlag);
	}

	if(ShipCheckFlag == true)
	{
		//nlapiLogExecution('ERROR', 'true', ShipCheckFlag);
		var filters = new Array();
		var columns = new Array();

		filters.push(new nlobjSearchFilter('item', null, 'anyof', getItemInternalId));

		if(strLocation!=null && strLocation!='' && strLocation!='undefined' && strLocation!='null')
			filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',strLocation]));

		var OrderDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_open_pickable_qty_pic', filters, columns);//

		if(OrderDetails != null && OrderDetails != '' && OrderDetails != 'null' && OrderDetails != 'undefined' && OrderDetails.length > 0)
		{
			//nlapiLogExecution('Debug', 'OrderDetails.length', OrderDetails.length);
			var vColumnslist=OrderDetails[0].getAllColumns();

			var commitedQtyIndex = 25;
			for(var x1=0;x1<vColumnslist.length;x1++)
			{
				var summaryLabel = vColumnslist[x1].getLabel();

				if (summaryLabel == 'Committed Quantity')
				{
					commitedQtyIndex = x1;
				}
			}

			for(var j=0;j<OrderDetails.length;j++)				
			{
				var CommittedQty = OrderDetails[j].getValue(vColumnslist[commitedQtyIndex]);

			}				
		}
	}
	else
	{
		var filters = new Array();
		var columns = new Array();

		filters.push(new nlobjSearchFilter('item', null, 'anyof', getItemInternalId));

		if(strLocation!=null && strLocation!='' && strLocation!='undefined' && strLocation!='null')
			filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',strLocation]));

		var OrderDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_open_pickable_qty_shp', filters, columns);//

		if(OrderDetails != null && OrderDetails != '' && OrderDetails != 'null' && OrderDetails != 'undefined' && OrderDetails.length > 0)
		{
			//nlapiLogExecution('ERROR', 'OrderDetails.length', OrderDetails.length);
			for(var j=0;j<OrderDetails.length;j++)				
			{
				var CommittedQty = OrderDetails[j].getValue('quantitycommitted',null,'sum');
			}			
		}

	}	

	var vOPenTaskPickBinDetails = getOPenTaskPickBinDetails(getItemInternalId,vBinDetails,strLocation,VUnitType,blnItemUnit);
	var openTaskBinIdArr = "";
	var openTaskBinQtyArr = "";
	if(vOPenTaskPickBinDetails != null && vOPenTaskPickBinDetails != '' && vOPenTaskPickBinDetails.length > 0)
	{
		openTaskBinIdArr = vOPenTaskPickBinDetails[0];
		openTaskBinQtyArr = vOPenTaskPickBinDetails[1];
	}
	var vOpenBinQty = 0;
	if(openTaskBinIdArr != null && openTaskBinIdArr != "")
	{

		for(var f=0;f<openTaskBinQtyArr.length;f++)
		{
			vOpenBinQty = Big(vOpenBinQty).plus(openTaskBinQtyArr[f]);

		}
	}

	if(vOpenBinQty == null || vOpenBinQty =='' || vOpenBinQty =='null' || vOpenBinQty =='undefined')
		vOpenBinQty = 0;

	if(CommittedQty == null || CommittedQty =='' || CommittedQty =='null' || CommittedQty =='undefined')
		CommittedQty = 0;

	var finalYetToBePicked = 0;
	finalYetToBePicked = Big(CommittedQty).minus(vOpenBinQty);
	nlapiLogExecution('DEBUG','finalYetToBePicked',finalYetToBePicked);//


	var filtersback = new Array();
	var columnsback = new Array();

	filtersback.push(new nlobjSearchFilter('item', null, 'anyof', getItemInternalId));

	if(strLocation!=null && strLocation!='' && strLocation!='undefined' && strLocation!='null')
		filtersback.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',strLocation]));

	var BackorderdQtyDets = new nlapiSearchRecord('transaction', 'customsearch_wmsse_backorder_qty_det', filtersback, columnsback);//

	if(BackorderdQtyDets != null && BackorderdQtyDets != '' && BackorderdQtyDets != 'null' && BackorderdQtyDets != 'undefined' && 
			BackorderdQtyDets.length > 0)
	{
		var vColumnslist1=BackorderdQtyDets[0].getAllColumns();

		var backOrderedQtyIndex = 25;
		for(var x2=0;x2<vColumnslist1.length;x2++)
		{
			var summaryLabel = vColumnslist1[x2].getLabel();
			if (summaryLabel == 'Back order quantity')
			{
				backOrderedQtyIndex = x2;
			}
		}

		for(var B=0;B<BackorderdQtyDets.length;B++)
		{
			var BackorderdQty = BackorderdQtyDets[B].getValue(vColumnslist1[backOrderedQtyIndex]);
		}
		//nlapiLogExecution('Debug','BackorderdQty',BackorderdQty);

	}

	var PickedBackOrd = new Array();

	if(finalYetToBePicked > 0)
		PickedBackOrd.push(finalYetToBePicked);
	else
		PickedBackOrd.push(0);
	if(BackorderdQty > 0)			
		PickedBackOrd.push(BackorderdQty);
	else
		PickedBackOrd.push(0);
	nlapiLogExecution('Debug','PickedBackOrd.length',PickedBackOrd.length);	

	return PickedBackOrd;
} // function ends


function nswms_GetPreferredBinType(Binnumber,whLocation,Item)
{
	var preferredbintype='';
	var filter=new Array(); 
	if(Binnumber!=null && Binnumber!='' && Binnumber!='null' && Binnumber!='undefined')
		filter.push(new nlobjSearchFilter('binnumber',null,'is',Binnumber));
	filter.push(new nlobjSearchFilter('inactive',null, 'is','F'));
	if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
		filter.push(new nlobjSearchFilter('location',null,'anyof',whLocation));
	var columns= new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_bin_loc_type'); 
	var searchrecord=nlapiSearchRecord('Bin',null,filter,columns);
	if(searchrecord!=null && searchrecord!="")
	{	
		var vLocationType=searchrecord[0].getText('custrecord_wmsse_bin_loc_type');

		if(vLocationType != 'WIP')
			preferredbintype = searchrecord[0].getText('custrecord_wmsse_bin_loc_type');
	}	

	return preferredbintype;
}
