/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Apr 2015     GA300732
 *
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function fnInventoryReportWithSerials(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		try
		{
			var form = nlapiCreateForm("Lot/Serial Numbers");

			var inventoryStatusFeature = isInvStatusFeatureEnabled();

			var strItemName;
			var strLocation;
			var strBinLocation;
			var strItemType;
			var invStatus = '';
			if (request.getParameter('custpage_item') != null) 
			{
				strItemName = request.getParameter('custpage_item');
			}
			if (request.getParameter('custpage_location') != null) 
			{
				strLocation = request.getParameter('custpage_location');
			}
			if (request.getParameter('custpage_binloc') != null) 
			{
				strBinLocation = request.getParameter('custpage_binloc');
			}
			if (request.getParameter('custpage_itemtype') != null) 
			{
				strItemType = request.getParameter('custpage_itemtype');
			}
			if (request.getParameter('custpage_invstatus') != null) 
			{
				invStatus = request.getParameter('custpage_invstatus');
			}

			var sublist = form.addSubList("custpage_items", "list", "Inventory Report");
			sublist.addField("custpage_item", "text", "Item");
			sublist.addField("custpage_bin", "text", "Bin Location");
			if(strItemType == 'LOT')
			{	
				sublist.addField("custpage_serials", "text", "Lot Number");
				sublist.addField("custpage_expdate", "text", "Expiration Date");
			}	
			else if(strItemType == 'SERIAL')			
				sublist.addField("custpage_serials", "text", "Serial Number");

			sublist.addField("custpage_qtyonhand", "text", "Quantity On Hand");
			sublist.addField("custpage_qtyavail", "text", "Avail Qty");
			if(invStatus!=null && invStatus!='' && invStatus!=undefined && invStatus != 'undefined' && invStatus!='null')
				sublist.addField("custpage_invstatus", "text", "Inventory Status");

			nlapiLogExecution('DEBUG', 'invStatus',invStatus);

			// If Inventory Status feature is enabled
			if(inventoryStatusFeature == true)
			{

				var searchresults = [];
				var result=nlapiLoadSearch('InventoryBalance', 'customsearch_wmsse_inv_report_invbalance');
				if(strLocation != null && strLocation != '')
					result.addFilter(new nlobjSearchFilter('location', null, 'anyof', strLocation));
				if(strItemName != null && strItemName != '')
					result.addFilter(new nlobjSearchFilter('item', null, 'anyof', strItemName));
				if(strBinLocation != null && strBinLocation != '')
					result.addFilter(new nlobjSearchFilter('binnumber', null, 'anyof', strBinLocation));
				if(invStatus != null && invStatus != '')
					result.addFilter(new nlobjSearchFilter('status', null, 'anyof', invStatus));

				var resLen = result.runSearch();
				var srhIterator = 0;
				var resultSet = resLen.forEachResult(function(searchResult)
						{
					srhIterator++;
					searchresults.push(searchResult);
					if(parseFloat(srhIterator) == 4000)
					{
						return false;
					}
					return true;                // return true to keep iterating
						});


				if(searchresults!=null && searchresults!='')
				{

					nlapiLogExecution('DEBUG', 'searchresults',searchresults);
					var unittype =searchresults[0].getValue('unitstype','item');
					var stockunits =searchresults[0].getText('stockunit','item');
					var nameofitem =searchresults[0].getText('item');

					nlapiLogExecution('DEBUG', 'nameofitem',nameofitem);

					nlapiLogExecution('DEBUG', 'unittype',unittype);
					nlapiLogExecution('DEBUG', 'stockunits',stockunits);
					var vLotExpArr=new Array();
					var vLotArr=new Array();
					var vBinOpenTaskDetails=new Array();
					vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(strItemName,strBinLocation,strLocation,unittype,stockunits,'',invStatus);
					var vOpenPickQty=0;
					var vBinOpenTaskLotArr = "";
					var vBinOpenTaskExpDateArr = "";
					var vBinOpenTaskBinIdArr = "";
					var vBinOpenTaskBinQtyArr = "";
					if(vBinOpenTaskDetails != null && vBinOpenTaskDetails!='' && vBinOpenTaskDetails.length > 0)
					{
						vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
						vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
						vBinOpenTaskLotArr = vBinOpenTaskDetails[3];
						vBinOpenTaskExpDateArr = vBinOpenTaskDetails[4];
					}
					nlapiLogExecution('DEBUG', 'vBinOpenTaskBinIdArr',vBinOpenTaskBinIdArr);
					nlapiLogExecution('DEBUG', 'vBinOpenTaskBinQtyArr',vBinOpenTaskBinQtyArr);
					nlapiLogExecution('DEBUG', 'vBinOpenTaskLotArr',vBinOpenTaskLotArr);
					nlapiLogExecution('DEBUG', 'vBinOpenTaskExpDateArr',vBinOpenTaskExpDateArr);


					if(strItemType == 'LOT')
					{
						var filtersExp = new Array();
						if (strItemName != null && strItemName != "")
						{
							filtersExp.push(new nlobjSearchFilter('name', null, 'is',  searchresults[0].getText('item')));		 
						}
						if(strLocation != null && strLocation != '' && strLocation != 'null')
							filtersExp.push(new nlobjSearchFilter('location', 'inventorynumber', 'anyof', strLocation));

						var columnsExp = new Array();


						var searchresultsExp = nlapiSearchRecord('item', 'customsearch_wmsse_expdate_lots', filtersExp, columnsExp);
						if(searchresultsExp != null && searchresultsExp != '')
						{ 
							for(var lotNumItr=0;lotNumItr<searchresultsExp.length;lotNumItr++)
							{

								if(searchresultsExp[lotNumItr].getValue('inventorynumber','inventorynumber') != null 
										&& searchresultsExp[lotNumItr].getValue('inventorynumber','inventorynumber') != '')
								{
									vLotArr.push(searchresultsExp[lotNumItr].getValue('inventorynumber','inventorynumber'));
									vLotExpArr.push(searchresultsExp[lotNumItr].getValue('expirationdate','inventorynumber'));
								}	
							}	
						}
						nlapiLogExecution('DEBUG', 'searchresultsExp',searchresultsExp);
						nlapiLogExecution('DEBUG', 'vLotArr',vLotArr);
					}
					var vSerialArray=new Array();
					if(strItemType == 'SERIAL')
					{

						var objOpenTaskDetails = [];

						var result=nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentask_searchforser');
						if(strItemName != null && strItemName != '')
							result.addFilter(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', strItemName));

						if(strBinLocation != null && strBinLocation != '')
							result.addFilter(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', strBinLocation));
						if(strLocation != null && strLocation != '')
							result.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', strLocation));

						//result.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));

						var resLen = result.runSearch();
						var srhIterator = 0;
						var resultSet = resLen.forEachResult(function(searchResult)
								{
							srhIterator++;
							objOpenTaskDetails.push(searchResult);
							if(parseFloat(srhIterator) == 4000)
							{
								return false;
							}
							return true;                // return true to keep iterating
								});


						var vnSerialArr="";
						if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
						{

							for(var serNumItr=0; serNumItr < objOpenTaskDetails.length ; serNumItr++)
							{
								var vSerialNo = objOpenTaskDetails[serNumItr].getValue('custrecord_wmsse_serial_no');
								if(vnSerialArr ==null || vnSerialArr=='')
									vnSerialArr=vSerialNo;
								else
									vnSerialArr = vnSerialArr +","+vSerialNo;
							}
						}
						vSerialArray=vnSerialArr.split(',');
						nlapiLogExecution('DEBUG', 'vSerialArray',vSerialArray);

					}
					var sublistItr=0;
					for (var invStatusItr = 0; invStatusItr < searchresults.length; invStatusItr++)
					{

						var serial =searchresults[0].getText('inventorynumber');
						nlapiLogExecution('DEBUG', 'serial',serial);
						var qty = searchresults[0].getValue('available')
						nlapiLogExecution('DEBUG', 'qty',qty);
						var qtyquantityonhand = searchresults[0].getValue('onhand')
						nlapiLogExecution('DEBUG', 'qtyquantityonhand',qtyquantityonhand);


						var objSearchResult=searchresults[invStatusItr];
						if(vSerialArray.indexOf(objSearchResult.getText('inventorynumber')) == -1)
						{
							form.getSubList('custpage_items').setLineItemValue('custpage_item', sublistItr + 1, objSearchResult.getText('item'));
							form.getSubList('custpage_items').setLineItemValue('custpage_bin', sublistItr + 1, objSearchResult.getText('binnumber'));
							form.getSubList('custpage_items').setLineItemValue('custpage_serials', sublistItr + 1, objSearchResult.getText('inventorynumber'));
							if(strItemType == 'LOT')
							{	
								var vLotNo=objSearchResult.getText('inventorynumber');
								nlapiLogExecution('DEBUG', 'vLotNo',vLotNo);
								var vOpenLotQty = 0;

								if(vBinOpenTaskBinIdArr != null && vBinOpenTaskBinIdArr !='')
								{
									for(var lotItr=0;lotItr<vBinOpenTaskBinIdArr.length;lotItr++)
									{
										var vOpenBinId = vBinOpenTaskBinIdArr[lotItr];
										if(strBinLocation == vOpenBinId)
										{
											var vOpenLot=vBinOpenTaskDetails[3][lotItr];
											if(vLotNo == vOpenLot)
											{
												vOpenLotQty=vBinOpenTaskDetails[1][lotItr];
												break;
											} 
										}
									}
								}
								nlapiLogExecution('DEBUG', 'vOpenLotQty',vOpenLotQty);
								var vnLotAvailqty= parseFloat(objSearchResult.getValue('available'))-parseFloat(vOpenLotQty);
								if(parseFloat(vnLotAvailqty) < 0)
									vnLotAvailqty =0;
								if(vLotArr != null && vLotArr.indexOf(vLotNo) != -1)
								{	
									var vExpDate=vLotExpArr[vLotArr.indexOf(vLotNo)];
									form.getSubList('custpage_items').setLineItemValue('custpage_expdate', sublistItr + 1, vExpDate);
								}
							}
							form.getSubList('custpage_items').setLineItemValue('custpage_qtyonhand', sublistItr + 1, objSearchResult.getValue('onhand'));
							if(strItemType == 'LOT')
								form.getSubList('custpage_items').setLineItemValue('custpage_qtyavail', sublistItr + 1, vnLotAvailqty.toString());
							else
								form.getSubList('custpage_items').setLineItemValue('custpage_qtyavail', sublistItr + 1, objSearchResult.getValue('available'));

							form.getSubList('custpage_items').setLineItemValue('custpage_invstatus', sublistItr + 1, objSearchResult.getText('status'));
							sublistItr=parseInt(sublistItr)+1;
						}
						else
							if(vSerialArray.indexOf(objSearchResult.getText('inventorynumber')) != -1)
							{
								form.getSubList('custpage_items').setLineItemValue('custpage_item', sublistItr + 1, objSearchResult.getText('item'));
								form.getSubList('custpage_items').setLineItemValue('custpage_bin', sublistItr + 1, objSearchResult.getText('binnumber'));
								form.getSubList('custpage_items').setLineItemValue('custpage_serials', sublistItr + 1, objSearchResult.getText('inventorynumber'));
								if(strItemType == 'LOT')
								{	
									var vLotNo=objSearchResult.getText('inventorynumber');
									nlapiLogExecution('DEBUG', 'vLotNo',vLotNo);
									var vOpenLotQty = 0;

									if(vBinOpenTaskBinIdArr != null && vBinOpenTaskBinIdArr !='')
									{
										for(var lotItr=0;lotItr<vBinOpenTaskBinIdArr.length;lotItr++)
										{
											var vOpenBinId = vBinOpenTaskBinIdArr[lotItr];
											if(strBinLocation == vOpenBinId)
											{
												var vOpenLot=vBinOpenTaskDetails[3][lotItr];
												if(vLotNo == vOpenLot)
												{
													vOpenLotQty=vBinOpenTaskDetails[1][lotItr];
													break;
												} 
											}
										}
									}
									nlapiLogExecution('DEBUG', 'vOpenLotQty',vOpenLotQty);
									var vnLotAvailqty= parseFloat(objSearchResult.getValue('available'))-parseFloat(vOpenLotQty);
									if(parseFloat(vnLotAvailqty) < 0)
										vnLotAvailqty =0;
									if(vLotArr != null && vLotArr.indexOf(vLotNo) != -1)
									{	
										var vExpDate=vLotExpArr[vLotArr.indexOf(vLotNo)];
										form.getSubList('custpage_items').setLineItemValue('custpage_expdate', sublistItr + 1, vExpDate);
									}
								}
								form.getSubList('custpage_items').setLineItemValue('custpage_qtyonhand', sublistItr + 1, objSearchResult.getValue('onhand'));
								if(strItemType == 'LOT')
									form.getSubList('custpage_items').setLineItemValue('custpage_qtyavail', sublistItr + 1, vnLotAvailqty.toString());
								else
									form.getSubList('custpage_items').setLineItemValue('custpage_qtyavail', sublistItr + 1, '0');
								form.getSubList('custpage_items').setLineItemValue('custpage_invstatus', sublistItr + 1, objSearchResult.getText('status'));
								sublistItr=parseInt(sublistItr)+1;
							}	
					}
				}	


			}
			else
			{

				var filters = new Array();
				if (strItemName != null && strItemName != "")
				{
					filters.push(new nlobjSearchFilter('internalid', null, 'is', strItemName));		 
				}
				if(strLocation != null && strLocation != '' && strLocation != 'null')
					filters.push(new nlobjSearchFilter('location', 'inventoryNumberBinOnHand', 'anyof', strLocation));
				if(strBinLocation != null && strBinLocation != '' && strBinLocation != 'null')
					filters.push(new nlobjSearchFilter('binnumber', 'inventoryNumberBinOnHand', 'anyof', strBinLocation));

				var columns = new Array();

				var searchresults = nlapiSearchRecord('item', 'customsearch_wmsse_itemwise_lots_rpt', filters, columns);
				if(searchresults != null && searchresults != '')
				{	
					nlapiLogExecution('DEBUG', 'searchresults',searchresults);
					var vLotExpArr=new Array();
					var vLotArr=new Array();
					var vBinOpenTaskDetails=new Array();
					vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(strItemName,strBinLocation,strLocation,
							searchresults[0].getValue('unitstype'),searchresults[0].getText('stockunit'),'',invStatus);
					var vOpenPickQty=0;
					var vBinOpenTaskLotArr = "";
					var vBinOpenTaskExpDateArr = "";
					var vBinOpenTaskBinIdArr = "";
					var vBinOpenTaskBinQtyArr = "";
					if(vBinOpenTaskDetails != null && vBinOpenTaskDetails!='' && vBinOpenTaskDetails.length > 0)
					{
						vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
						vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
						vBinOpenTaskLotArr = vBinOpenTaskDetails[3];
						vBinOpenTaskExpDateArr = vBinOpenTaskDetails[4];
					}

					if(strItemType == 'LOT')
					{
						var filtersExp = new Array();
						if (strItemName != null && strItemName != "")
						{
							filtersExp.push(new nlobjSearchFilter('name', null, 'is',  searchresults[0].getValue('name')));		 
						}
						if(strLocation != null && strLocation != '' && strLocation != 'null')
							filtersExp.push(new nlobjSearchFilter('location', 'inventorynumber', 'anyof', strLocation));

						var columnsExp = new Array();


						var searchresultsExp = nlapiSearchRecord('item', 'customsearch_wmsse_expdate_lots', filtersExp, columnsExp);
						if(searchresultsExp != null && searchresultsExp != '')
						{ 
							for(var s=0;s<searchresultsExp.length;s++)
							{

								if(searchresultsExp[s].getValue('inventorynumber','inventorynumber') != null 
										&& searchresultsExp[s].getValue('inventorynumber','inventorynumber') != '')
								{
									vLotArr.push(searchresultsExp[s].getValue('inventorynumber','inventorynumber'));
									vLotExpArr.push(searchresultsExp[s].getValue('expirationdate','inventorynumber'));
								}	
							}	
						}
						nlapiLogExecution('DEBUG', 'searchresultsExp',searchresultsExp);
						nlapiLogExecution('DEBUG', 'vLotArr',vLotArr);
					}
					var vSerialArray=new Array();
					if(strItemType == 'SERIAL')
					{
						var filters = new Array();
						var columns = new Array();
						columns.push(new nlobjSearchColumn('custrecord_wmsse_sku'));
						columns.push(new nlobjSearchColumn('custrecord_wmsse_serial_no'));	

						if(strItemName != null && strItemName != '')
							filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', strItemName));

						if(strBinLocation != null && strBinLocation != '')
							filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', strBinLocation));
						if(strLocation != null && strLocation != '')
							filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', strLocation));
						filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', 3));
						filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [8,28]));
						filters.push(new nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is', 'T'));
						filters.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 'anyof', 
								['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
						filters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));

						var objOpenTaskDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,filters, columns);
						var vnSerialArr="";
						if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
						{

							for(var z=0; z < objOpenTaskDetails.length ; z++)
							{
								var vSerialNo = objOpenTaskDetails[z].getValue('custrecord_wmsse_serial_no');
								if(vnSerialArr ==null || vnSerialArr=='')
									vnSerialArr=vSerialNo;
								else
									vnSerialArr = vnSerialArr +","+vSerialNo;
							}
						}
						vSerialArray=vnSerialArr.split(',');
						nlapiLogExecution('DEBUG', 'vSerialArray',vSerialArray);

					}
					var h=0;
					for (var i = 0; i < searchresults.length; i++) 
					{

						var objSearchResult=searchresults[i];
						if(vSerialArray.indexOf(objSearchResult.getText('inventorynumber','inventoryNumberBinOnHand')) == -1)
						{
							form.getSubList('custpage_items').setLineItemValue('custpage_item', h + 1, objSearchResult.getValue('name'));
							form.getSubList('custpage_items').setLineItemValue('custpage_bin', h + 1, 
									objSearchResult.getText('binnumber','inventoryNumberBinOnHand'));
							form.getSubList('custpage_items').setLineItemValue('custpage_serials', h + 1, 
									objSearchResult.getText('inventorynumber','inventoryNumberBinOnHand'));
							if(strItemType == 'LOT')
							{	
								var vLotNo=objSearchResult.getText('inventorynumber','inventoryNumberBinOnHand');
								nlapiLogExecution('DEBUG', 'vLotNo',vLotNo);
								var vOpenLotQty = 0;

								if(vBinOpenTaskBinIdArr != null && vBinOpenTaskBinIdArr !='')
								{
									for(var m1=0;m1<vBinOpenTaskBinIdArr.length;m1++)
									{
										var vOpenBinId = vBinOpenTaskBinIdArr[m1];
										if(strBinLocation == vOpenBinId)
										{
											var vOpenLot=vBinOpenTaskDetails[3][m1];
											if(vLotNo == vOpenLot)
											{
												vOpenLotQty=vBinOpenTaskDetails[1][m1];
												break;
											} 
										}
									}
								}
								nlapiLogExecution('DEBUG', 'vOpenLotQty',vOpenLotQty);
								var vnLotAvailqty= (parseFloat(objSearchResult.getValue('quantityavailable','inventoryNumberBinOnHand'))-parseFloat(vOpenLotQty));
								if(parseFloat(vnLotAvailqty) < 0)
									vnLotAvailqty =0;
								if(vLotArr != null && vLotArr.indexOf(vLotNo) != -1)
								{	
									var vExpDate=vLotExpArr[vLotArr.indexOf(vLotNo)];
									form.getSubList('custpage_items').setLineItemValue('custpage_expdate', h + 1, vExpDate);
								}
							}
							form.getSubList('custpage_items').setLineItemValue('custpage_qtyonhand', h + 1, 
									objSearchResult.getValue('quantityonhand','inventoryNumberBinOnHand'));
							if(strItemType == 'LOT')
								form.getSubList('custpage_items').setLineItemValue('custpage_qtyavail', h + 1, vnLotAvailqty.toString());
							else
								form.getSubList('custpage_items').setLineItemValue('custpage_qtyavail', h + 1, 
										objSearchResult.getValue('quantityavailable','inventoryNumberBinOnHand'));
							h=parseInt(h)+1;
						}
						else
							if(vSerialArray.indexOf(objSearchResult.getText('inventorynumber','inventoryNumberBinOnHand')) != -1)
							{
								form.getSubList('custpage_items').setLineItemValue('custpage_item', h + 1, objSearchResult.getValue('name'));
								form.getSubList('custpage_items').setLineItemValue('custpage_bin', h + 1, 
										objSearchResult.getText('binnumber','inventoryNumberBinOnHand'));
								form.getSubList('custpage_items').setLineItemValue('custpage_serials', h + 1, 
										objSearchResult.getText('inventorynumber','inventoryNumberBinOnHand'));
								if(strItemType == 'LOT')
								{	
									var vLotNo=objSearchResult.getText('inventorynumber','inventoryNumberBinOnHand');
									nlapiLogExecution('DEBUG', 'vLotNo',vLotNo);
									var vOpenLotQty = 0;

									if(vBinOpenTaskBinIdArr != null && vBinOpenTaskBinIdArr !='')
									{
										for(var m1=0;m1<vBinOpenTaskBinIdArr.length;m1++)
										{
											var vOpenBinId = vBinOpenTaskBinIdArr[m1];
											if(strBinLocation == vOpenBinId)
											{
												var vOpenLot=vBinOpenTaskDetails[3][m1];
												if(vLotNo == vOpenLot)
												{
													vOpenLotQty=vBinOpenTaskDetails[1][m1];
													break;
												} 
											}
										}
									}
									nlapiLogExecution('DEBUG', 'vOpenLotQty',vOpenLotQty);
									var vnLotAvailqty= (parseFloat(objSearchResult.getValue('quantityavailable',
									'inventoryNumberBinOnHand'))-parseFloat(vOpenLotQty));
									if(parseFloat(vnLotAvailqty) < 0)
										vnLotAvailqty =0;
									if(vLotArr != null && vLotArr.indexOf(vLotNo) != -1)
									{	
										var vExpDate=vLotExpArr[vLotArr.indexOf(vLotNo)];
										form.getSubList('custpage_items').setLineItemValue('custpage_expdate', h + 1, vExpDate);
									}
								}
								form.getSubList('custpage_items').setLineItemValue('custpage_qtyonhand', h + 1, 
										objSearchResult.getValue('quantityonhand','inventoryNumberBinOnHand'));
								if(strItemType == 'LOT')
									form.getSubList('custpage_items').setLineItemValue('custpage_qtyavail', h + 1, vnLotAvailqty.toString());
								else
									form.getSubList('custpage_items').setLineItemValue('custpage_qtyavail', h + 1, '0');
								h=parseInt(h)+1;
							}	
					}
				}

			}

		}
		catch(e)
		{
			nlapiLogExecution('ERROR', 'Exception in Inventory Report - Lot/Serial Screen', e.toString());
		}

		response.writePage(form);
	}
	else 
	{
	}
}






