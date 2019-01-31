/**
 * Script Description
 * This script is to post fulfillment for partially picked Orders
 */
/***************************************************************************
  Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function partialFulfillmentPosting(request, response)
{
	var context = nlapiGetContext();

	if (request.getMethod() == 'GET') 
	{
		try
		{
			nlapiLogExecution('DEBUG','Remaining usage at the start',context.getRemainingUsage());
			var form = nlapiCreateForm('Post Item Fulfillment');
			form.setScript('customscript_wmsse_post_partialif_cl');
			var msg = form.addField('custpage_message', 'inlinehtml', null, null,
					null).setLayoutType('outside','startrow');	
			createForm(form,request);//To create new form
			addSublistToForm(form);//To add sublist to the form

			var whLoc = request.getParameter('custpage_qbwhlocation');
			var transaction = request.getParameter('custpage_qbtransaction');
			var tranType = request.getParameter('custpage_qbtrantype');
			var ordType = request.getParameter('custpage_qbordertype');
			var item = request.getParameter('custpage_qbitem');
			var customer = request.getParameter('custpage_qbcustomer');
			var shipDate = request.getParameter('custpage_qbshipdate');
			var shipMethod = request.getParameter('custpage_qbshipmethod');
			var assignedTo = request.getParameter('custpage_qbemployee');

			var dtsettingFlag = DateSetting();//To convert into date format
			nlapiLogExecution('Debug', 'dtsettingFlag', dtsettingFlag);
			var crossSubsidiaryFeature=isIntercompanyCrossSubsidiaryFeatureEnabled();

			shipDate = ValidateDate(shipDate,dtsettingFlag);//To validate the entered date

			var str = 'whLoc.' + whLoc + '<br/>';
			str = str + 'transaction.' + transaction + '<br/>';
			str = str + 'tranType.' + tranType + '<br/>';
			str = str + 'ordType.' + ordType + '<br/>';
			str = str + 'item.' + item + '<br/>';
			str = str + 'customer.' + customer + '<br/>';
			str = str + 'shipDate.' + shipDate + '<br/>';
			str = str + 'shipMethod.' + shipMethod + '<br/>';
			str = str + 'assignedTo.' + assignedTo + '<br/>';
			str = str + 'crossSubsidiaryFeature.' + crossSubsidiaryFeature + '<br/>';

			var vType='SalesOrd';
			if(tranType=='salesorder')
				vType='SalesOrd';
			else if(tranType=='transferorder')
				vType='TrnfrOrd';

			nlapiLogExecution('ERROR', 'str',str);
			if(transaction != null && transaction != '' && transaction != 'null')
			{
				//To fetch Order id based on order name and type
				var tranId = getSOId(transaction,tranType);
				nlapiLogExecution('ERROR', 'tranId',tranId);
			}

			var FOatOrderLevel = getSystemRuleValue('Consolidate item fulfillments by sales order?',
					whLoc);//To fetch System rule value
			var packValue = getSystemRuleValue('Manually pack orders?',whLoc);
			//To fetch System rule value

			if(FOatOrderLevel == 'Y' && (packValue == 'N' || packValue == '' || packValue == null))
			{
				var filters = new Array();

				if(whLoc != null && whLoc != '')
					filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null,
							'anyof',whLoc));

				if(tranId != null && tranId != '')
					filters.push(new nlobjSearchFilter('internalid','custrecord_wmsse_order_no',
							'anyof', tranId));

				if(ordType != null && ordType != '')
					filters.push(new nlobjSearchFilter('custrecord_wmsse_ord_type',null, 'anyof',
							ordType));

				if(item != null && item != '')
					filters.push(new nlobjSearchFilter('custrecord_wmsse_sku',null, 'anyof', item));

				if(customer != null && customer != '')
					filters.push(new nlobjSearchFilter('custrecord_wmsse_customer',null, 'anyof',
							customer));

				if(shipMethod != null && shipMethod != '')
					filters.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod',null,
							'anyof',shipMethod));

				if(shipDate != null && shipDate != '')
					filters.push(new nlobjSearchFilter('shipdate','custrecord_wmsse_order_no',
							'on',shipDate));

				if(assignedTo != null && assignedTo != '')
					filters.push(new nlobjSearchFilter('custrecord_wmsse_upd_user_no',null, 'anyof',
							assignedTo));

				if(vType != null && vType != '')
					filters.push(new nlobjSearchFilter('type','custrecord_wmsse_order_no', 'anyof',
							vType));

				var openTaskResults = nlapiSearchRecord('customrecord_wmsse_trn_opentask',
						'customsearch_wmsse_ot_partialfulfill', filters, null);
				nlapiLogExecution('ERROR', 'openTaskResults',openTaskResults);

				if(openTaskResults != null && openTaskResults != '')
				{
					nlapiLogExecution('ERROR', 'openTaskResults',openTaskResults.length);
					var custIndex = 12;
					var vColumnslist=openTaskResults[0].getAllColumns();
					for(var x1=0;x1<vColumnslist.length;x1++)
					{
						var summaryLabel = vColumnslist[x1].getLabel();
						nlapiLogExecution('ERROR', 'summaryLabel',summaryLabel);
						if(summaryLabel == 'documentno')
						{
							custIndex = x1;
							break;
						}
					}

					//For Paging
					var size = 30;
					if(request.getParameter('custpage_pagesize') != null &&
							request.getParameter('custpage_pagesize') != 'null' &&
							request.getParameter('custpage_pagesize') != '' &&
							request.getParameter('custpage_pagesize') != 'undefined')
					{
						size = parseInt(request.getParameter('custpage_pagesize'));
					}
					if(openTaskResults.length > parseInt(size))
					{
						var pageSize = form.addField('custpage_pagesize','text', 'Page Size');
						if(request.getParameter('custpage_pagesize') != null &&
								request.getParameter('custpage_pagesize') != 'null' &&
								request.getParameter('custpage_pagesize') != '' &&
								request.getParameter('custpage_pagesize') != 'undefined')
						{
							pageSize.setDefaultValue(request.getParameter('custpage_pagesize'));	
						}else{
							pageSize.setDefaultValue('30');
						}
						pageSize.setDisplaySize(10,10);
						pageSize.setLayoutType('outsidebelow', 'startrow');

						var select= form.addField('custpage_selectpage','select', 'Select Orders');	
						select.setLayoutType('outsidebelow');			
						select.setDisplaySize(200,30);
						if(request.getParameter('custpage_selectpage') != null &&
								request.getParameter('custpage_selectpage') != 'null' &&
								request.getParameter('custpage_selectpage') != '' &&
								request.getParameter('custpage_selectpage') != 'undefined' &&
								request.getParameter('custpage_hiddenpagesizechange')=='F')
						{
							select.setDefaultValue(request.getParameter('custpage_selectpage'));	
						}

						var len = openTaskResults.length/parseInt(size);
						for(var k=1;k<=Math.ceil(len);k++)
						{
							var from;var to;

							to=parseFloat(k)*parseInt(size);
							from=(parseFloat(to)-parseInt(size))+1;
							if(parseFloat(to)>openTaskResults.length)
							{
								to=openTaskResults.length;
							}

							var selectvalues=from.toString()+" to "+to.toString();
							var selectvalues_display=from.toString()+","+to.toString();
							select.addSelectOption(selectvalues_display,selectvalues);

						}//Setting values to Paging Dropdown box

					}
					var minval=0;
					var maxval=parseFloat(openTaskResults.length)-1;
					var selectno=request.getParameter('custpage_selectpage');
					nlapiLogExecution('Error','selectno', selectno);
					if(selectno!=null && selectno!='null'  && selectno!=undefined &&
							selectno!= '' && openTaskResults.length > parseInt(size))
					{
						var selectedPage= request.getParameter('custpage_selectpage');
						var selectedPageArray=selectedPage.split(',');
						var hdnFlag = request.getParameter('custpage_hiddenpagesizechange');
						nlapiLogExecution('Error','selectno', selectno);
						if(hdnFlag == 'T')
						{
							maxval = parseInt(size)-1;
						}
						else
						{
							minval = parseFloat(selectedPageArray[0])-1;

							if(parseFloat(openTaskResults.length) >= parseFloat(selectedPageArray[1]))
							{
								maxval=parseFloat(selectedPageArray[1])-1;
							}
						}
					}
					else
					{
						if(openTaskResults.length > parseInt(size))
						{
							maxval = parseInt(size)-1;
						}
					}

					for(var i=minval; i<=maxval;i++)
					{
						var otInternlaid = openTaskResults[i].getId();
						nlapiLogExecution('ERROR', 'otInternlaid',otInternlaid);
						var vTranNumber = openTaskResults[i].getValue(vColumnslist[custIndex]);
						nlapiLogExecution('ERROR', 'vTranNumber',vTranNumber);
						var vTranId = openTaskResults[i].getValue('internalid',
								'custrecord_wmsse_order_no','group');
						nlapiLogExecution('ERROR', 'vTranId',vTranId);
						var vCustomer = openTaskResults[i].getText('custrecord_wmsse_customer',null,
						'group');
						var vExpQty = openTaskResults[i].getValue('custrecord_wmsse_expe_qty',null,'sum');
						var vActQty = openTaskResults[i].getValue('custrecord_wmsse_act_qty',null,'sum');
						var vOrdType = openTaskResults[i].getText('custrecord_wmsse_ord_type',null,
						'group');
						var vShipDate=openTaskResults[i].getValue('shipdate','custrecord_wmsse_order_no',
						'group');
						var vShipMethod = openTaskResults[i].getText('custrecord_wmsse_shipmethod',null,
						'group');
						var vWhLoc = openTaskResults[i].getValue('custrecord_wmsse_wms_location',null,
						'group');
						var vCustomerId = openTaskResults[i].getValue('custrecord_wmsse_customer',null,
						'group');
						var vOrdTypeId = openTaskResults[i].getValue('custrecord_wmsse_ord_type',null,
						'group');
						var vShipMethodId = openTaskResults[i].getValue('custrecord_wmsse_shipmethod',
								null,'group');
						var vAssignedToId =openTaskResults[i].getValue('custrecord_wmsse_upd_user_no',
								null,'group');
						var vAssignedTo =openTaskResults[i].getText('custrecord_wmsse_upd_user_no',
								null,'group');
						
						var vWhLocName = openTaskResults[i].getText('custrecord_wmsse_wms_location',null,
						'group');

						var vfilter = new Array();
						var vCol = new Array();
						var ordQty = 0;
						var conversionRate = 1;
						if(vTranId != null && vTranId != '')
							vfilter.push(new nlobjSearchFilter('internalid',null,
									'anyof', vTranId));
						if(whLoc != null && whLoc != ''&& whLoc != undefined && whLoc != 'undefined')
						{
							if(crossSubsidiaryFeature == true && tranType =="salesorder")
							{
								vfilter.push(new nlobjSearchFilter('inventorylocation',null,
										'anyof', whLoc));
							}
							else
							{
								vfilter.push(new nlobjSearchFilter('location',null,
										'anyof', whLoc));
							}
						}

						var otResults = nlapiSearchRecord('transaction',
								'customsearch_wmsse_if_posting_tran_srh', vfilter, vCol);
						nlapiLogExecution('ERROR', 'otResults',otResults);
						if(otResults != null && otResults != '')
						{
							nlapiLogExecution('ERROR', 'otResults.length',otResults.length);

							ordQty = otResults[0].getValue('quantityuom',null,'sum');
							ordQty = parseInt(ordQty);
							nlapiLogExecution('ERROR', 'ordQty',ordQty);
							if(tranType == 'transferorder')
							{
								ordQty = -(parseInt(ordQty));
							}
							nlapiLogExecution('ERROR', 'ordQty',ordQty);
							ordQty = ordQty.toString();
						}

						//Setting values to Sublist fields
						form.getSubList('custpage_items').setLineItemValue('custpage_select', i+1, 'F');
						form.getSubList('custpage_items').setLineItemValue('custpage_transaction',i+1,
								vTranNumber);
						form.getSubList('custpage_items').setLineItemValue('custpage_customer',i+1,
								vCustomer);
						form.getSubList('custpage_items').setLineItemValue('custpage_ordtype',i+1,
								vOrdType);
						form.getSubList('custpage_items').setLineItemValue('custpage_shipdate',i+1,
								vShipDate);
						form.getSubList('custpage_items').setLineItemValue('custpage_shipmethod',i+1,
								vShipMethod);
						form.getSubList('custpage_items').setLineItemValue('custpage_expqty',i+1,
								ordQty);
						form.getSubList('custpage_items').setLineItemValue('custpage_actqty',i+1,
								vActQty);
						form.getSubList('custpage_items').setLineItemValue('custpage_assignedto',i+1,
								vAssignedTo);
						form.getSubList('custpage_items').setLineItemValue('custpage_whlocation',i+1,
								vWhLoc);	
						form.getSubList('custpage_items').setLineItemValue('custpage_tranid',i+1,
								vTranId);	
						form.getSubList('custpage_items').setLineItemValue('custpage_customerid',i+1,
								vCustomerId);	
						form.getSubList('custpage_items').setLineItemValue('custpage_ordtypeid',i+1,
								vOrdTypeId);	
						form.getSubList('custpage_items').setLineItemValue('custpage_shipmethodid',i+1,
								vShipMethodId);	
						form.getSubList('custpage_items').setLineItemValue('custpage_assignedtoid',i+1,
								vAssignedToId);
						form.getSubList('custpage_items').setLineItemValue('custpage_internalid',i+1,
								otInternlaid);
						form.getSubList('custpage_items').setLineItemValue('custpage_locationname',i+1,
								vWhLocName);
					}
				}
				else{
					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
							"showAlertBox('div__alert', 'ERROR', 'No transactions match your" +
							" search criteria.', NLAlertDialog.TYPE_HIGH_PRIORITY," +
					"  '100%', null, null, null);</script></div>");
				}
			}
			else
			{
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
						"showAlertBox('div__alert', 'ERROR', 'Your system rules must be configured to" +
						" automatically pack orders and" +
						" consolidate item fulfillments by sales order.'," +
						" NLAlertDialog.TYPE_HIGH_PRIORITY," +
				"  '100%', null, null, null);</script></div>");
			}
		}
		catch(e)
		{
			var errStr = e.toString();
			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
					"showAlertBox('div__alert', 'ERROR', '"+errStr+"'," +
			" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
		}
		nlapiLogExecution('DEBUG','Remaining usage at the end of get',context.getRemainingUsage());
		form.addSubmitButton('POST ITEM FULFILLMENT');
		response.writePage(form);
		return;
	}
	else 
	{
		try
		{
			var form = nlapiCreateForm('Post Item Fulfillment');
			form.setScript('customscript_wmsse_post_partialif_cl');
			var msg = form.addField('custpage_message', 'inlinehtml', null, null,
					null).setLayoutType('outside','startrow');

			nlapiLogExecution('DEBUG','Remaining usage at the start2',context.getRemainingUsage());
			var pageSizeChngd = parseInt(request.getParameter('custpage_pagesize'));
			nlapiLogExecution('DEBUG','pageSizeChngd',pageSizeChngd);

			var whLoc = request.getParameter('custpage_qbwhlocation');
			nlapiLogExecution('DEBUG','whLoc',whLoc);
			
			var crossSubsidiaryFeature=isIntercompanyCrossSubsidiaryFeatureEnabled();

			var FOatOrderLevel=getSystemRuleValue('Consolidate item fulfillments by sales order?',
					whLoc);
			var packValue = getSystemRuleValue('Manually pack orders?',whLoc);
			//To fetch System rule values
			if(FOatOrderLevel == 'Y' && (packValue == 'N' || packValue == '' || packValue == null))
			{
				var lineCount = request.getLineItemCount('custpage_items');
				nlapiLogExecution('ERROR', 'lineCount',lineCount);
				var selectedCount = 0;
				if(lineCount != -1)
				{
					for(var i=0;i<lineCount;i++)
					{
						var isSelected = request.getLineItemValue('custpage_items',
								'custpage_select',i+1);
						nlapiLogExecution('ERROR', 'isSelected',isSelected);
						if(isSelected == 'T')
						{
							selectedCount++;
							break;
						}
					}
				}

				if(selectedCount == 0)
				{
					createForm(form,request);//To create new form
					addSublistToForm(form);//To add sublist to the form

					var whLoc = request.getParameter('custpage_qbwhlocation');
					var transaction = request.getParameter('custpage_qbtransaction');
					var tranType = request.getParameter('custpage_qbtrantype');
					var ordType = request.getParameter('custpage_qbordertype');
					var item = request.getParameter('custpage_qbitem');
					var customer = request.getParameter('custpage_qbcustomer');
					var shipDate = request.getParameter('custpage_qbshipdate');
					var shipMethod = request.getParameter('custpage_qbshipmethod');
					var assignedTo = request.getParameter('custpage_qbemployee');

					var dtsettingFlag = DateSetting();//To convert into date format
					nlapiLogExecution('Debug', 'dtsettingFlag', dtsettingFlag);

					shipDate = ValidateDate(shipDate,dtsettingFlag);//To validate the entered date

					var str = 'whLoc.' + whLoc + '<br/>';
					str = str + 'transaction.' + transaction + '<br/>';
					str = str + 'tranType.' + tranType + '<br/>';
					str = str + 'ordType.' + ordType + '<br/>';
					str = str + 'item.' + item + '<br/>';
					str = str + 'customer.' + customer + '<br/>';
					str = str + 'shipDate.' + shipDate + '<br/>';
					str = str + 'shipMethod.' + shipMethod + '<br/>';
					str = str + 'assignedTo.' + assignedTo + '<br/>';
					str = str + 'crossSubsidiaryFeature.' + crossSubsidiaryFeature + '<br/>';

					var vType='SalesOrd';
					if(tranType=='salesorder')
						vType='SalesOrd';
					else if(tranType=='transferorder')
						vType='TrnfrOrd';

					nlapiLogExecution('ERROR', 'str',str);
					if(transaction != null && transaction != '' && transaction != 'null')
					{
						//To fetch Order id based on order name and type
						var tranId = getSOId(transaction,tranType);
						nlapiLogExecution('ERROR', 'tranId',tranId);
					}


					var filters = new Array();

					if(whLoc != null && whLoc != '')
						filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null,
								'anyof',whLoc));

					if(tranId != null && tranId != '')
						filters.push(new nlobjSearchFilter('internalid','custrecord_wmsse_order_no',
								'anyof', tranId));

					if(ordType != null && ordType != '')
						filters.push(new nlobjSearchFilter('custrecord_wmsse_ord_type',null, 'anyof',
								ordType));

					if(item != null && item != '')
						filters.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,
								'anyof', item));

					if(customer != null && customer != '')
						filters.push(new nlobjSearchFilter('custrecord_wmsse_customer',null, 'anyof',
								customer));

					if(shipMethod != null && shipMethod != '')
						filters.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod',null,
								'anyof',shipMethod));

					if(shipDate != null && shipDate != '')
						filters.push(new nlobjSearchFilter('shipdate','custrecord_wmsse_order_no',
								'on',shipDate));

					if(assignedTo != null && assignedTo != '')
						filters.push(new nlobjSearchFilter('custrecord_wmsse_upd_user_no',
								null,'anyof',assignedTo));

					if(vType != null && vType != '')
						filters.push(new nlobjSearchFilter('type','custrecord_wmsse_order_no',
								'anyof',vType));

					var openTaskResults = nlapiSearchRecord('customrecord_wmsse_trn_opentask',
							'customsearch_wmsse_ot_partialfulfill', filters, null);
					nlapiLogExecution('ERROR', 'openTaskResults',openTaskResults);

					if(openTaskResults != null && openTaskResults != '')
					{
						nlapiLogExecution('ERROR', 'openTaskResults',openTaskResults.length);
						var vColumnslist=openTaskResults[0].getAllColumns();
						var custIndex = 12;
						var vColumnslist=openTaskResults[0].getAllColumns();
						for(var x1=0;x1<vColumnslist.length;x1++)
						{
							var summaryLabel = vColumnslist[x1].getLabel();
							nlapiLogExecution('ERROR', 'summaryLabel',summaryLabel);
							if(summaryLabel == 'documentno')
							{
								custIndex = x1;
								break;
							}
						}

						var size = 30;
						if(request.getParameter('custpage_pagesize') != null &&
								request.getParameter('custpage_pagesize') != 'null' &&
								request.getParameter('custpage_pagesize') != '' &&
								request.getParameter('custpage_pagesize') != 'undefined')
						{
							size = parseInt(request.getParameter('custpage_pagesize'));
						}
						nlapiLogExecution('ERROR', 'size',size);
						if(openTaskResults.length > parseInt(size))
						{
							var pageSize = form.addField('custpage_pagesize','text', 'Page Size');
							if(request.getParameter('custpage_pagesize') != null &&
									request.getParameter('custpage_pagesize') != 'null' &&
									request.getParameter('custpage_pagesize') != '' &&
									request.getParameter('custpage_pagesize') != 'undefined')
							{
								pageSize.setDefaultValue(request.getParameter('custpage_pagesize'));	
							}
							else
							{
								pageSize.setDefaultValue('30');
							}
							pageSize.setDisplaySize(10,10);
							pageSize.setLayoutType('outsidebelow', 'startrow');

							var hdnFlag = request.getParameter('custpage_hiddenpagesizechange');
							nlapiLogExecution('Error','hdnFlag', hdnFlag);

							var select= form.addField('custpage_selectpage','select','Select Orders');	
							select.setLayoutType('outsidebelow');			
							select.setDisplaySize(200,30);

							if(request.getParameter('custpage_selectpage') != null &&
									request.getParameter('custpage_selectpage') != 'null' &&
									request.getParameter('custpage_selectpage') != '' &&
									request.getParameter('custpage_selectpage') != 'undefined' &&
									request.getParameter('custpage_hiddenpagesizechange')=='F')
							{
								select.setDefaultValue(request.getParameter('custpage_selectpage'));	
							}

							nlapiLogExecution('ERROR', 'size',size);
							var len = openTaskResults.length/parseInt(size);
							for(var k=1;k<=Math.ceil(len);k++)
							{
								var from;var to;

								to=parseFloat(k)*parseInt(size);
								from=(parseFloat(to)-parseInt(size))+1;

								if(parseFloat(to)>openTaskResults.length)
								{
									to=openTaskResults.length;
								}

								var selectvalues=from.toString()+" to "+to.toString();
								var selectvalues_display=from.toString()+","+to.toString();
								select.addSelectOption(selectvalues_display,selectvalues);

							}
							nlapiLogExecution('ERROR', 'selectvalues',selectvalues);
							nlapiLogExecution('ERROR', 'selectvalues_display',selectvalues_display);

						}
						var minval=0;
						var maxval=parseFloat(openTaskResults.length)-1;
						var selectno=request.getParameter('custpage_selectpage');
						nlapiLogExecution('Error','selectno', selectno);
						if(selectno!=null && selectno!='null'  && selectno!=undefined &&
								selectno!= '' && openTaskResults.length > parseInt(size))
						{
							var selectedPage= request.getParameter('custpage_selectpage');
							var selectedPageArray=selectedPage.split(',');
							var hdnFlag = request.getParameter('custpage_hiddenpagesizechange');
							nlapiLogExecution('Error','selectno', selectno);
							if(hdnFlag == 'T')
							{
								maxval = parseInt(size)-1;
							}
							else
							{
								minval = parseFloat(selectedPageArray[0])-1;

								if(parseFloat(openTaskResults.length)>=parseFloat(selectedPageArray[1]))
								{
									maxval=parseFloat(selectedPageArray[1])-1;
								}
							}
						}
						else
						{
							if(openTaskResults.length > parseInt(size))
							{
								maxval = parseInt(size)-1;
							}
						}

						nlapiLogExecution('ERROR', 'minval,maxval',minval+','+maxval);
						var k=0;
						for(var i=minval; i<=maxval;i++)
						{
							var vTranNumber = openTaskResults[i].getValue(vColumnslist[custIndex]);
							var vTranId = openTaskResults[i].getValue('internalid',
									'custrecord_wmsse_order_no','group');
							var vCustomer = openTaskResults[i].getText('custrecord_wmsse_customer',
									null,'group');
							var vExpQty = openTaskResults[i].getValue(
									'custrecord_wmsse_expe_qty',null,'sum');
							var vActQty = openTaskResults[i].getValue(
									'custrecord_wmsse_act_qty',null,'sum');
							var vOrdType = openTaskResults[i].getText('custrecord_wmsse_ord_type',
									null,'group');
							var vShipDate = openTaskResults[i].getValue('shipdate',
									'custrecord_wmsse_order_no',
							'group');
							var vShipMethod = openTaskResults[i].getText(
									'custrecord_wmsse_shipmethod',null,'group');
							var vWhLoc = openTaskResults[i].getValue('custrecord_wmsse_wms_location',
									null,
							'group');
							var vCustomerId = openTaskResults[i].getValue('custrecord_wmsse_customer',
									null,'group');
							var vOrdTypeId = openTaskResults[i].getValue('custrecord_wmsse_ord_type',
									null,
							'group');
							var vShipMethodId = openTaskResults[i].getValue(
									'custrecord_wmsse_shipmethod',null,'group');
							var vAssignedToId =openTaskResults[i].getValue(
									'custrecord_wmsse_upd_user_no',null,'group');
							var vAssignedTo =openTaskResults[i].getText(
									'custrecord_wmsse_upd_user_no',null,'group');
							var vWhLocName = openTaskResults[i].getText(
									'custrecord_wmsse_wms_location',null,'group');
							
							var vfilter = new Array();
							var vCol = new Array();
							var ordQty = 0;
							var conversionRate = 1;
							if(vTranId != null && vTranId != '')
								vfilter.push(new nlobjSearchFilter('internalid',null,
										'anyof', vTranId));
							
							if(whLoc != null && whLoc != ''&& whLoc != undefined && whLoc != 'undefined')
							{
								if(crossSubsidiaryFeature == true && tranType =="salesorder")
								{
									vfilter.push(new nlobjSearchFilter('inventorylocation',null,
											'anyof', whLoc));
								}
								else
								{
									filter.push(new nlobjSearchFilter('location',null,
											'anyof', whLoc));
								}
							}
							var otResults = nlapiSearchRecord('transaction',
									'customsearch_wmsse_if_posting_tran_srh', vfilter, vCol);
							nlapiLogExecution('ERROR', 'otResults',otResults);
							if(otResults != null && otResults != '')
							{
								nlapiLogExecution('ERROR', 'otResults.length',otResults.length);

								ordQty = otResults[0].getValue('quantityuom',null,'sum');
								ordQty = parseInt(ordQty);
								nlapiLogExecution('ERROR', 'ordQty',ordQty);
								if(tranType == 'transferorder')
								{
									ordQty = -(parseInt(ordQty));
								}
								nlapiLogExecution('ERROR', 'ordQty',ordQty);
								ordQty = ordQty.toString();
							}

							form.getSubList('custpage_items').setLineItemValue(
									'custpage_select',k+1,'F');
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_transaction',k+1,vTranNumber);
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_customer',k+1,vCustomer);
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_ordtype',k+1,vOrdType);
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_shipdate',k+1,vShipDate);
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_shipmethod',k+1,vShipMethod);
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_expqty',k+1,ordQty);
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_actqty',k+1,vActQty);
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_assignedto',k+1,vAssignedTo);
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_whlocation',k+1,vWhLoc);	
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_tranid',k+1,vTranId);	
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_customerid',k+1,vCustomerId);	
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_ordtypeid',k+1,vOrdTypeId);	
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_shipmethodid',k+1,vShipMethodId);	
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_assignedtoid',k+1,vAssignedToId);
							form.getSubList('custpage_items').setLineItemValue(
									'custpage_locationname',k+1,vWhLocName);
							k++;
						}
					}
					else{
						msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
								"showAlertBox('div__alert','ERROR','No transactions match your" +
								" search criteria.', NLAlertDialog.TYPE_HIGH_PRIORITY," +
						"  '100%', null, null, null);</script></div>");
					}
				}

				nlapiLogExecution('DEBUG','Remaining usage before posting IF',
						context.getRemainingUsage());
				var lineCount = request.getLineItemCount('custpage_items');
				nlapiLogExecution('ERROR', 'lineCount',lineCount);
				var whLoc = request.getParameter('custpage_qbwhlocation');
				var tranType = request.getParameter('custpage_qbtrantype');
				nlapiLogExecution('ERROR', 'whLoc,tranType',whLoc+','+tranType);
				var lineFlag = 'F';
				var count = 0;
				var ordArray = new Array();

				var vType='SalesOrd';
				if(tranType=='salesorder')
					vType='SalesOrd';
				else if(tranType=='transferorder')
					vType='TrnfrOrd';

				if(lineCount != -1)
				{
					for(var i=0;i<lineCount;i++)
					{
						var isSelected = request.getLineItemValue('custpage_items',
								'custpage_select',i+1);
						nlapiLogExecution('ERROR', 'isSelected',isSelected);
						if(isSelected == 'T')
						{
							count++;
							lineFlag = 'T';
							var tranId = request.getLineItemValue('custpage_items',
									'custpage_tranid', i+1);
							var whLoc = request.getLineItemValue('custpage_items',
									'custpage_whlocation', i+1);
							var ordType = request.getLineItemValue('custpage_items',
									'custpage_ordtypeid', i+1);
							var customer = request.getLineItemValue('custpage_items',
									'custpage_customerid', i+1);
							var shipMethod = request.getLineItemValue('custpage_items',
									'custpage_shipmethodid', i+1);
							var shipDate = request.getLineItemValue('custpage_items',
									'custpage_shipdate', i+1);
							var assignedTo = request.getLineItemValue('custpage_items',
									'custpage_assignedtoid', i+1);
							var soNumber = request.getLineItemValue('custpage_items',
									'custpage_transaction', i+1);

							var str = 'whLoc.' + whLoc + '<br/>';
							str = str + 'tranId.' + tranId + '<br/>';
							str = str + 'ordType.' + ordType + '<br/>';
							str = str + 'customer.' + customer + '<br/>';
							str = str + 'shipMethod.' + shipMethod + '<br/>';
							str = str + 'shipDate.' + shipDate + '<br/>';
							str = str + 'assignedTo.' + assignedTo + '<br/>';
							str = str + 'soNumber.' + soNumber + '<br/>';

							nlapiLogExecution('ERROR', 'str',str);

							var filters = new Array();

							if(whLoc != null && whLoc != '')
								filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null,
										'anyof', whLoc));

							if(tranId != null && tranId != '')
								filters.push(new nlobjSearchFilter('internalid',
										'custrecord_wmsse_order_no','anyof', tranId));

							if(ordType != null && ordType != '')
								filters.push(new nlobjSearchFilter('custrecord_wmsse_ord_type',null,
										'anyof', ordType));

							if(customer != null && customer != '')
								filters.push(new nlobjSearchFilter('custrecord_wmsse_customer',null,
										'anyof', customer));

							if(shipMethod != null && shipMethod != '')
								filters.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod',null,
										'anyof', shipMethod));

							if(shipDate != null && shipDate != '')
								filters.push(new nlobjSearchFilter('shipdate',
										'custrecord_wmsse_order_no','on',shipDate));

							if(assignedTo != null && assignedTo != '')
								filters.push(new nlobjSearchFilter('custrecord_wmsse_upd_user_no',null,
										'anyof',assignedTo));

							if(vType != null && vType != '')
								filters.push(new nlobjSearchFilter('type','custrecord_wmsse_order_no',
										'anyof',vType));

							var openTaskResults = nlapiSearchRecord('customrecord_wmsse_trn_opentask',
									'customsearch_wmsse_ot_post_if', filters, null);
							nlapiLogExecution('ERROR', 'openTaskResults',openTaskResults);
							var otInternalId = '';

							if(openTaskResults != null && openTaskResults != '')
							{
								otInternalId = openTaskResults[0].getValue('internalid');
								nlapiLogExecution('ERROR', 'otInternalId',otInternalId);
								if(otInternalId != null && otInternalId != '')
								{
									var recId=nlapiLoadRecord('customrecord_wmsse_trn_opentask',
											otInternalId);
									recId.setFieldValue('custrecord_wmsse_device_upload_flag','T');
									var vPackRecId = nlapiSubmitRecord(recId);
									nlapiLogExecution('ERROR','vPackRecId at',vPackRecId);
									nlapiLogExecution('DEBUG','Remaining usage',
											context.getRemainingUsage());
									if(vPackRecId != null && vPackRecId != '')
									{
										ordArray.push(soNumber);
										nlapiLogExecution('ERROR','into if',vPackRecId);
									}
								}
							}
							else
							{
								msg.setDefaultValue("<div id='div__alert' align='center'></div><script>"+
										"showAlertBox('div__alert', 'ERROR', 'The system failed" +
										" to post the item fulfillment due to an unexpected error.'," +
										" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);"+
								"</script></div>");
							}
						}
					}
					if(ordArray != null && ordArray != '' && ordArray.length>0)
					{
						var IFform = nlapiCreateForm('Post Item Fulfillment');
						var IFmsg=IFform.addField('custpage_message','inlinehtml',
								null,null,null).setLayoutType('outside','startrow');
						var strType = 'sales order';
						if(tranType=='salesorder')
							strType = 'sales order';
						else if(tranType=='transferorder')
							strType = 'transfer order';

						if(ordArray.length == 1)
						{
							IFmsg.setDefaultValue("<div id='div__alert' align='center'>" +
									"<script>showAlertBox('div__alert','Confirmation',"+
									" 'Item fulfillment posted successfully" +
									" for "+strType+" "+ordArray[0]+"'," +
									"NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null," +
									" null, null);"+
							"</script></div>");
						}else
						{
							var strType = 'Sales Order';
							if(tranType=='salesorder')
								strType = 'Sales Orders';
							else if(tranType=='transferorder')
								strType = 'Transfer Orders';
							var str = ordArray.toString();
							nlapiLogExecution('ERROR','str',str);
							IFmsg.setDefaultValue("<div id='div__alert' align='center'>" +
									"<script>showAlertBox('div__alert','Confirmation',"+
									" 'Item fulfillments posted successfully for the" +
									" following transactions:<br/>"+str+"', " +
									"NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null," +
									" null, null);"+
							"</script></div>");
						}
						response.writePage(IFform);
						return;
					}
				}
			}
			else
			{
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
						"showAlertBox('div__alert', 'ERROR', 'Your system rules must be configured to" +
						" automatically pack orders and" +
						" consolidate item fulfillments by sales order.', NLAlertDialog.TYPE_HIGH_PRIORITY," +
				"  '100%', null, null, null);</script></div>");
				response.writePage(form);
				return;
			}
		}
		catch(e)
		{
			var errStr = e.toString();
			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
					"showAlertBox('div__alert', 'ERROR', '"+errStr+"'," +
			" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
		}
		form.addSubmitButton('POST ITEM FULFILLMENT');
		response.writePage(form);
		return;
	}//end of else
}//end of function

/**
 * This function is to create form
 * 
 */
function createForm(form,request)
{
	var whLocation = form.addField('custpage_qbwhlocation', 'select', 'Location').setMandatory(true);

	whLocation.addSelectOption("","");

	var vRolebasedLocation = getRoledBasedLocation();

	if(vRolebasedLocation==null || vRolebasedLocation=='' || vRolebasedLocation==0)
	{
		vRolebasedLocation = new Array();
		var filters=new Array();
		filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site', null, 'is', 'T'));
		//filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
		var searchresults = nlapiSearchRecord('location', 'customsearch_wmsse_locsearchresults', filters, null);
		if(searchresults != null && searchresults !='')
		{				
			for(var k=0;k<searchresults.length;k++)
			{
				vRolebasedLocation.push(searchresults[k].getId());
			}

		}
	}

	var roleBasedLocationArray=getLocationName(vRolebasedLocation);

	if(roleBasedLocationArray != null && roleBasedLocationArray != '' && roleBasedLocationArray != 'null')
	{
		for (var j = 0; roleBasedLocationArray != null && j < roleBasedLocationArray.length; j++) {
			if(roleBasedLocationArray[j][0] != null && roleBasedLocationArray[j][0] != "" && roleBasedLocationArray[j][0] != " ")
			{
				var tslocation = form.getField('custpage_qbwhlocation').getSelectOptions(roleBasedLocationArray[j][0], 'is');
				if (tslocation != null) {
					if (tslocation.length > 0) {
						continue;
					}
				}
				whLocation.addSelectOption(roleBasedLocationArray[j][0], roleBasedLocationArray[j][1]);
			}
		}
	}
	if(request.getParameter('custpage_qbwhlocation')!='' && request.getParameter('custpage_qbwhlocation')!=null)
	{
		whLocation.setDefaultValue(request.getParameter('custpage_qbwhlocation'));	
	}

	var tranType = form.addField('custpage_qbtrantype', 'select',
	'Transaction Type').setMandatory(true).setDisplaySize(150);

	tranType.addSelectOption("salesorder","Sales Order");
	tranType.addSelectOption("transferorder","Transfer Order");
	if(request.getParameter('custpage_qbtrantype')!='' && 
			request.getParameter('custpage_qbtrantype')!=null)
	{
		tranType.setDefaultValue(request.getParameter('custpage_qbtrantype'));	
	}

	var vTransaction = form.addField('custpage_qbtransaction', 'text', 'Transaction #',
	'location');
	//vTransaction.setDisplaySize(41.5);
	if(request.getParameter('custpage_qbtransaction')!='' && 
			request.getParameter('custpage_qbtransaction')!=null)
	{
		vTransaction.setDefaultValue(request.getParameter('custpage_qbtransaction'));	
	}

	var OrderType = form.addField('custpage_qbordertype', 'select', 'Order Type',
	'customrecord_wmsse_ordertype').setDisplaySize(150);
	if(request.getParameter('custpage_qbordertype')!='' && 
			request.getParameter('custpage_qbordertype')!=null)
	{
		OrderType.setDefaultValue(request.getParameter('custpage_qbordertype'));	
	}

	var VItem = form.addField('custpage_qbitem', 'select', 'Item');
	VItem.addSelectOption("","");
	var subArr = new Array();
	subArr = getRoleBasedSubsidiaries();
	nlapiLogExecution('ERROR','subArr',subArr);

	var filterArr = new Array();
	
	if(subArr != '' && subArr != null && subArr != 'null')
	filterArr.push(new nlobjSearchFilter('subsidiary', null, 'anyof', subArr));

	var results = nlapiSearchRecord('item',
			'customsearch_wmsse_validitem_name_srh', filterArr, null);
	nlapiLogExecution('ERROR', 'results',results);
	if(results != null && results != '')
	{
		nlapiLogExecution('ERROR', 'results.length',results.length);
		for(var i=0;i<results.length;i++)
		{
			var iName = results[i].getValue('name');
			var itemId = results[i].getValue('internalid');
			VItem.addSelectOption(itemId,iName);
		}
	}
	
	if(request.getParameter('custpage_qbitem')!='' && request.getParameter('custpage_qbitem')!=null)
	{
		VItem.setDefaultValue(request.getParameter('custpage_qbitem'));	
	}

	var customer = form.addField('custpage_qbcustomer', 'select', 'Customer','customer');
	if(request.getParameter('custpage_qbcustomer')!='' && 
			request.getParameter('custpage_qbcustomer')!=null)
	{
		customer.setDefaultValue(request.getParameter('custpage_qbcustomer'));
	}

	var shipDate = form.addField('custpage_qbshipdate', 'date', 'Ship Date');
	if(request.getParameter('custpage_qbshipdate')!='' && 
			request.getParameter('custpage_qbshipdate')!=null)
	{
		shipDate.setDefaultValue(request.getParameter('custpage_qbshipdate'));
	}

	var ShipMethod = form.addField('custpage_qbshipmethod', 'select', 'Ship Method');
	ShipMethod.addSelectOption("","");
	if(request.getParameter('custpage_qbshipmethod')!='' && 
			request.getParameter('custpage_qbshipmethod')!=null)
	{
		ShipMethod.setDefaultValue(request.getParameter('custpage_qbshipmethod'));	
	}
	var shipmethodResults = getShipmethods(null);
	nlapiLogExecution('ERROR', 'shipmethodResults', shipmethodResults);
	if(shipmethodResults != null && shipmethodResults != '' && shipmethodResults != 'null')
	{
		for (var j = 0; shipmethodResults != null && j < shipmethodResults.length; j++) {
			if(shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null, 
			'group') != null && shipmethodResults[j].getValue(
					'custrecord_wmsse_carrier_nsmethod',null, 'group') != "" &&
					shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null,
					'group') != " ")
			{
				var tshipmethod = form.getField('custpage_qbshipmethod').getSelectOptions(
						shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null, 
						'group'), 'is');
				if (tshipmethod != null) {
					if (tshipmethod.length > 0) {
						continue;
					}
				}
				ShipMethod.addSelectOption(shipmethodResults[j].getValue(
						'custrecord_wmsse_carrier_nsmethod',null, 'group'), 
						shipmethodResults[j].getText('custrecord_wmsse_carrier_nsmethod',null,
						'group'));
			}
		}
	}

	var vTaskAssignTo = form.addField('custpage_qbemployee', 'select', 'Task Assigned To','employee');
	if(request.getParameter('custpage_qbemployee')!='' &&
			request.getParameter('custpage_qbemployee')!=null)
	{
		vTaskAssignTo.setDefaultValue(request.getParameter('custpage_qbemployee'));
	}

	var hdnselect= form.addField('custpage_hiddenfieldselectpage','checkbox',
	'Validate Select').setDisplayType("hidden");
	if(request.getParameter('custpage_hiddenfieldselectpage')!='' &&
			request.getParameter('custpage_hiddenfieldselectpage')!=null)
	{
		hdnselect.setDefaultValue(request.getParameter('custpage_hiddenfieldselectpage'));
	}

	var hdnPageSizeChange= form.addField('custpage_hiddenpagesizechange','checkbox',
	'Validate Select').setDisplayType("hidden");
	if(request.getParameter('custpage_hiddenpagesizechange')!='' &&
			request.getParameter('custpage_hiddenpagesizechange')!=null)
	{
		hdnPageSizeChange.setDefaultValue(request.getParameter('custpage_hiddenpagesizechange'));
	}

}

/**
 * This function is to retrieve Transaction Internal id with Order name
 * 
 */
function getSOId(sonumber,tranType)
{
	var vType='SalesOrd';
	if(tranType=='salesorder')
		vType='SalesOrd';
	else if(tranType=='transferorder')
		vType='TrnfrOrd';

	var soId = '';
	var SODetails=new Array();
	var transactionsearchresult = new nlapiLoadSearch('transaction', 'customsearch_wmsse_transactiondetail_srh');
	if(sonumber != null && sonumber != '' && sonumber != 'null')
		transactionsearchresult.addFilter(new nlobjSearchFilter('tranid', null, 'is', sonumber));
	transactionsearchresult.addFilter(new nlobjSearchFilter('type', null, 'anyof', vType));
	var resLenDetails = transactionsearchresult.runSearch();
	
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SODetails = SODetails.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}
	
	if(SODetails != null && SODetails != '')
	{
		soId = SODetails[0].getValue('internalid');
	}

	return soId;
}

/**
 * To bin data to sublist
 * @param form
 */
function addSublistToForm(form){

	var sublist = form.addSubList("custpage_items", "list", "ITEMS");

	sublist.addField("custpage_select", "checkbox", "Confirm");
	sublist.addField("custpage_transaction", "text", "TRANSACTION #");	
	sublist.addField("custpage_locationname", "text", "Location");
	sublist.addField("custpage_customer", "text", "CUSTOMER");
	sublist.addField("custpage_ordtype", "text", "ORDER TYPE"); 
	sublist.addField("custpage_shipdate", "text", "SHIP DATE");
	sublist.addField("custpage_shipmethod", "text", "SHIP METHOD");
	sublist.addField("custpage_expqty", "text", "TOTAL QUANTITY");
	sublist.addField("custpage_actqty", "text", "PICKED QUANTITY");
	sublist.addField("custpage_assignedto", "text", "ASSIGNED TO");
	sublist.addField("custpage_sku", "text", "ITEM").setDisplayType("hidden");
	sublist.addField("custpage_whlocation", "text", "LOCATION").setDisplayType("hidden");
	sublist.addField("custpage_tranid", "text", "TRANSACTION").setDisplayType("hidden");
	sublist.addField("custpage_customerid", "text", "CUSTOMER ID").setDisplayType("hidden");
	sublist.addField("custpage_ordtypeid", "text", "ORDER TYPE ID").setDisplayType("hidden");
	sublist.addField("custpage_shipmethodid", "text", "SHIP METHOD ID").setDisplayType("hidden");
	sublist.addField("custpage_assignedtoid", "text", "ASSIGNED TO ID").setDisplayType("hidden");
	sublist.addField("custpage_internalid", "text", "OT Internalid").setDisplayType("hidden");

	sublist.addMarkAllButtons();

}

/**
 * This function is to generate ship methods based on Location
 * 
 */
function getShipmethods(location)
{

	var colsWorkstation = new Array();
	colsWorkstation[0] = new nlobjSearchColumn('custrecord_wmsse_carrier_nsmethod',null, 'group');
	var filters = new Array();
	if(location != null && location != '' && location !='null' && location != 'undefined')
	{
		filters.push(new nlobjSearchFilter('custrecord_wmsse_carrier_location',null, 'anyof',location));
	}
	var searchresults = nlapiSearchRecord('customrecord_wmsse_carrier', null, filters, colsWorkstation);

	return searchresults;
}

/**
 * This function is to validate paging.
 * 
 */
function  SelectPage_fieldchanged(type,name)
{
	if(trim(name)==trim('custpage_selectpage'))
	{
		nlapiSetFieldValue('custpage_hiddenfieldselectpage','T');
		NLDoMainFormButtonAction("submitter",true);	
	}
	else
	{
		return true;
	}
}

/**
 * This function is to return Location names for given internalids 
 * 
 */
function getLocationName(vRoleLocation)
{
	var locationArray=new Array();

	nlapiLogExecution('ERROR', 'vRoleLocation', vRoleLocation);
	var filters=new Array();
	if(vRoleLocation!=null && vRoleLocation!='')
		filters.push(new nlobjSearchFilter('internalid', null, 'anyof', vRoleLocation));
	var columns=new Array();
	//columns.push(new nlobjSearchColumn('name'));
	var searchresults = nlapiSearchRecord('location', 'customsearch_wmsse_locsearchresults', filters, columns);
	if(searchresults!=null && searchresults!='')
	{
		for(var i=0;i<searchresults.length;i++)
		{
			locationArray[i]=new Array();
			locationArray[i][0]=searchresults[i].getId();
			locationArray[i][1]=searchresults[i].getValue('name');
		}
	}
	searchresults=null;
	columns=null;
	filters=null;
	return locationArray;
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
				for(var i=0;i<vRolesearchresults.length;i++)
				{
					var vnRoleSubsid=vRolesearchresults[i].getValue('subsidiaries');
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