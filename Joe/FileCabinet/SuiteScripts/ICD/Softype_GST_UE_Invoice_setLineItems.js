/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @Author Sachin Savale
 */
define(['N/search','N/error','N/record','N/runtime'],


		function(search,error,record,runtime) {
	var intra = 1;
	var inter = 2;
	var cgst = "cgst";
	var sgst = "sgst";

	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @param {Form}
	 *            scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function beforeLoad(scriptContext) {

		


	}

	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {Record}
	 *            scriptContext.oldRecord - Old record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function afterSubmit(scriptContext) {

		log.debug('----------------After Submit---------------------');

		
		   

		try{


			var taxCodeInternalId,rev_PurchaseItem,rev_PayableItem,rev_cgstPurchaseItem,rev_cgstPayableItem;
			var rev_tax_code = '';

			var billObject = scriptContext.newRecord;
			log.debug('scriptContext.type',JSON.stringify(scriptContext));
			log.debug('scriptContext.UserEventType.CREATE.type',scriptContext.UserEventType.CREATE);
			var subsi = billObject.getValue({fieldId:'subsidiary'});
			var currentRecordObj = scriptContext.newRecord;

			var ScriptParameter = runtime.getCurrentScript().getParameter("custscript_transaction_type_invo");
			var getTranid = [];
			// alert('getToDisableRecords'+getToDisableRecords);

			var getTranType = search.lookupFields({
				type : 'customrecord_gst_transaction_type',
				id   :  ScriptParameter,
				columns : 'custrecord_form'
			});
			var customForm = currentRecordObj.getValue({fieldId:'customform'});
			getTranid = getTranType.custrecord_form[0].value;
			// alert('getTranid'+getTranid);



			if(getTranid && getTranid.length > 0) {
				// alert('inside');

				if(getTranid.indexOf(customForm) != -1) {
					
					if(scriptContext.mode != 'delete')
						{
						log.debug('sssssssss');
						var gstType = billObject.getValue({fieldId:'custbody_gst_type'});
						log.debug('gstType',gstType);
						var shipToState = billObject.getValue({fieldId:'custbody_destination_state_gst'});

						var SelfBill = billObject.getValue({fieldId:'custbody_self_billing'});
						log.debug('SelfBill',SelfBill);
						var purchaseType = billObject.getValue({fieldId:'custbody_purchase_type'});

						var scheduleId = 1;
						log.debug('GST Type-->'+gstType);
						log.audit('Runtime Context type',runtime.ContextType);
						log.audit('Script Context',scriptContext.type);
						if(scriptContext.type == scriptContext.UserEventType.EDIT || scriptContext.type == scriptContext.UserEventType.CREATE)
						{
							// expense line


							var expenseCount = billObject.getLineCount({sublistId: 'expense'});
							expenseCount = expenseCount - 1;
							// //////////AMAR UPDATE//////////////////////
							if(scriptContext.type == scriptContext.UserEventType.EDIT)
							{
								for(var j = expenseCount-1 ; j >=0; j--)
								{
									var st_revline = billObject.getSublistValue({sublistId:'expense',fieldId:'custcol_gst_reversal_line',line:j});
									if(st_revline)
									{
										billObject.removeLine({
											sublistId: 'expense',
											line:j ,
											ignoreRecalc: true
										});
									}
								}
								log.debug('UPDATING AND CHECKING COUNT  '+count);
								// items line
								var count = billObject.getLineCount({sublistId:'item'});
								var count = count - 1;
								for(var i = count-1 ; i>=0; i--)
								{
									var st_revline = billObject.getSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_line',line:i})
									if(st_revline)
									{
										billObject.removeLine({
											sublistId: 'item',
											line:i ,
											ignoreRecalc: true
										});
									}
								}
							}
							// //////////AMAR UPDATE END//////////////////////
							// /////monisha Update/////////
							var poval  = currentRecordObj.getValue({fieldId:'transformid'});
							log.debug('Ummmmmmmmmmmmmmmmmmm'+poval);
							if(scriptContext.type == scriptContext.UserEventType.CREATE && poval !=null || poval !='')
							{
								for(var j = expenseCount-1 ; j >=0; j--)
								{
									var st_revline = billObject.getSublistValue({sublistId:'expense',fieldId:'custcol_gst_reversal_line',line:j});
									if(st_revline)
									{
										billObject.removeLine({
											sublistId: 'expense',
											line:j ,
											ignoreRecalc: true
										});
									}
								}
								log.debug('UPDATING AND CHECKING COUNT  '+count);
								// items line
								var count = billObject.getLineCount({sublistId:'item'});
								var count = count - 1;
								for(var i = count-1 ; i>=0; i--)
								{
									var st_revline = billObject.getSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_line',line:i})
									if(st_revline)
									{
										billObject.removeLine({
											sublistId: 'item',
											line:i ,
											ignoreRecalc: true
										});
									}
								}
							}
							// //////monisha update end /////////////////

							// -----Search for Reversal code by
							// search--------------------//
							var taxCodeFilters = [];
							var taxCodeColumns = [];

							taxCodeFilters.push(search.createFilter({
								name : 'custrecord_gst_type',
								operator : search.Operator.IS,
								values :  gstType
							}));
							if(shipToState !=null && shipToState !='')
							{
								if(gstType == intra)
								{
									taxCodeFilters.push(search.createFilter({
										name : 'custrecord_location_state',
										operator : search.Operator.IS,
										values :  shipToState
									}));
								}
							}

							taxCodeFilters.push(search.createFilter({
								name : 'custrecord_gst_item_schedule',
								operator : search.Operator.IS,
								values :  scheduleId
							}));

							taxCodeColumns.push(search.createColumn({
								name: 'custrecord_gst_tax_code'
							}));
							taxCodeColumns.push(search.createColumn({
								name: 'custrecord_sgst_revpur_item'
							}));
							taxCodeColumns.push(search.createColumn({
								name: 'custrecord_sgst_revpay_item'
							}));

							taxCodeColumns.push(search.createColumn({
								name: 'custrecord_cgst_revpur_item'
							}));

							taxCodeColumns.push(search.createColumn({
								name: 'custrecord_cgst_revpay_item'
							}));

							taxCodeColumns.push(search.createColumn({
								name: 'custrecord_gst_reversal_tax_code'
							}));


							taxCodeColumns.push(search.createColumn({name: 'custrecord_gst_tax_code'}));

							var taxCodeSearch = search.create({
								"type": "customrecord_gst_tax_code_matrix",
								"filters":taxCodeFilters,
								"columns":taxCodeColumns
							});

							var arrSearchResults = taxCodeSearch .run().getRange({start : 0, end : 1});
							if(arrSearchResults[0]){	
								taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
								rev_PurchaseItem = arrSearchResults[0].getValue('custrecord_sgst_revpur_item');
								rev_PayableItem = arrSearchResults[0].getValue('custrecord_sgst_revpay_item');
								rev_cgstPurchaseItem = arrSearchResults[0].getValue('custrecord_cgst_revpur_item');
								rev_cgstPayableItem = arrSearchResults[0].getValue('custrecord_cgst_revpay_item');
								rev_tax_code = arrSearchResults[0].getValue('custrecord_gst_reversal_tax_code');


								log.debug('taxCodeInternalId',taxCodeInternalId)
								log.debug('rev_PurchaseItem',rev_PurchaseItem);
								log.debug('rev_PayableItem',rev_PayableItem);
								log.debug('rev_cgst_PurchaseItem',rev_cgstPurchaseItem);
								log.debug('rev_cgst_PayableItem',rev_cgstPayableItem);
								log.debug('Custom Record Id',arrSearchResults[0].id);


							}else{

								throw error.create({
									name: 'Notice',
									message: 'Custom tax code record for gst not found',
									notifyOff: true
								});
								return;
							}
							// -----------------end of reversal code
							// search---------------------------------------------//



							var expense_count = billObject.getLineCount({sublistId: 'expense'});
							log.debug('expense count',expense_count);
							var temp_count_expense = expense_count-1;
							for(var k=0; k<=expense_count; k++)
							{
								var rev_apply = billObject.getSublistValue({sublistId:'expense',fieldId:'custcol_gst_reversal_apply',line:k});
								log.audit('Reverse Apply',rev_apply);
								if(rev_apply)
								{
									log.audit('Reverse Applying');
									var strevpercent = billObject.getSublistValue({sublistId:'expense',fieldId:'custcol_st_rev_percent',line:k});

									var amount = billObject.getSublistValue({sublistId:'expense', fieldId:'amount', line:k});	
									var exp_Location = billObject.getSublistValue({sublistId:'expense',fieldId:'location',line:k});
									var taxcode = billObject.getSublistValue({sublistId:'expense',fieldId:'taxcode',line:k});
									var revPercent =  billObject.getSublistValue({sublistId:'expense',fieldId:'taxrate1',line:k});
									log.debug('Tax Rate',revPercent);
									// revPercent =
									// revPercent.substring(0,revPercent.length
									// - 1);
									var purchaseAmount = amount * (revPercent/100);
									var account =  search.lookupFields({
										type : 'item',
										id   :  rev_PurchaseItem,
										columns : 'expenseaccount'
									});
									var itemAmount = -purchaseAmount;
									log.debug('Item Amount',itemAmount);
									var accountId = account.expenseaccount[0].value;
									log.debug('Account id-->',accountId);



									billObject.setSublistValue({sublistId:'expense',fieldId:'account',line:temp_count_expense+1,value:accountId});
									billObject.setSublistValue({sublistId:'expense',fieldId:'amount',line:temp_count_expense+1,value:purchaseAmount});
									billObject.setSublistValue({sublistId:'expense',fieldId:'taxcode',line:temp_count_expense+1,value:taxCodeInternalId});
									billObject.setSublistValue({sublistId:'expense',fieldId:'custcol_gst_reversal_line',line:temp_count_expense+1,value:true});

									var payaccount =  search.lookupFields({
										type : 'item',
										id   :  rev_PayableItem,
										columns : 'expenseaccount'
									});

									var payaccountId = payaccount.expenseaccount[0].value;
									log.debug('Account id-->',payaccountId);




									billObject.setSublistValue({sublistId:'expense',fieldId:'account',line:temp_count_expense+2,value:payaccountId});
									billObject.setSublistValue({sublistId:'expense',fieldId:'amount',line:temp_count_expense+2,value:itemAmount});
									billObject.setSublistValue({sublistId:'expense',fieldId:'taxcode',line:temp_count_expense+2,value:taxCodeInternalId});
									billObject.setSublistValue({sublistId:'expense',fieldId:'custcol_gst_reversal_line',line:temp_count_expense+2,value:true});
									temp_count_expense = temp_count_expense+2;


									// strevpercent =
									// strevpercent.substring(0,strevpercent.length
									// - 1);
								}
							}




							// -----------------------for
							// items--------------------------------------------//


							var item_count = billObject.getLineCount({sublistId: 'item'});
							// var gsttype =billObject.getValue({sublistId:
							// 'item'});
							log.debug('item countmmmmmmmomoomooo',item_count);
							var totalSgstAmount = 0;
							var totalCgstAmount = 0;
							var totalIgstAmount = 0;
							var temp_count_item = item_count-1;
							var selfBilling = billObject.getValue({fieldId:'custbody_self_billing'});
							var unbil = billObject.getValue({fieldId:'custbody_gst_unregsteredvendbill'});
							var purType = billObject.getValue({fieldId:'custbody_purchase_type'});
							var chngd = billObject.getValue({fieldId:'custbody_gst_type_changed'});
							for(var k=0; k <item_count; k++)
							{


								var revcheck = billObject.getSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_apply',line:k});
								var revline = billObject.getSublistValue({sublistId: 'item',fieldId:'custcol_gst_reversal_line',line:k});
								if(selfBilling == true || purType == 2 || unbil == true || unbil == 'T')
								{

									if(revcheck == true || revcheck == 'T')
									{
										var schedule = billObject.getSublistValue({sublistId: 'item',fieldId:'custcol_item_schedule_gst',line:0});

										if(!schedule){
											return;
										}

										log.debug('item countmmmmm',item_count);
										log.debug('reversal true');
										var taxCodeFilters = [];
										var taxCodeColumns = [];

										taxCodeFilters.push(search.createFilter({
											name : 'custrecord_gst_type',
											operator : search.Operator.IS,
											values :  gstType
										}));
										if(shipToState !=null && shipToState !='')
										{

											if(gstType == intra)
											{

												taxCodeFilters.push(search.createFilter({
													name : 'custrecord_location_state',
													operator : search.Operator.IS,
													values :  shipToState
												}));
											}

										}

										taxCodeFilters.push(search.createFilter({
											name : 'custrecord_gst_item_schedule',
											operator : search.Operator.IS,
											values :  1
										}));

										taxCodeColumns.push(search.createColumn({
											name: 'custrecord_gst_tax_code'
										}));

										taxCodeColumns.push(search.createColumn({
											name: 'custrecord_gst_tax_code'
										}));

										var taxCodeSearch = search.create({
											"type": "customrecord_gst_tax_code_matrix",
											"filters":taxCodeFilters,
											"columns":taxCodeColumns
										});

										var arrSearchResults = taxCodeSearch .run().getRange({start : 0, end : 1});
										var scriptObj = runtime.getCurrentScript();
										log.debug('arrSearchResults',arrSearchResults.length);
										if(arrSearchResults[0]){
											var taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
											// var reversalTaxCode =
											// arrSearchResults[0].getValue('custrecord_gst_reversal_tax_code')

										}

										
										
										var sezInvoice = billObject.getValue({fieldId: 'custbody126'});
										if(sezInvoice == 2)
							             {
											billObject.setSublistValue({
						                        sublistId:'item',
						                        fieldId:'taxcode',
						                        line:k,
						                        value:25584,
						                        ignoreFieldChange:false
						                       });
							             }
										else
											{
											log.debug('ddddddd',taxCodeInternalId);
											billObject.setSublistValue({
												sublistId:'item',
												fieldId:'taxcode',
												line:k,
												value:taxCodeInternalId,
												ignoreFieldChange:false
											});	
											}
									
									}
									if(revline == 'T' || revline == true)
									{

										log.debug('inside revline');
										billObject.removeLine({
											sublistId: 'item',
											line:k,
											ignoreRecalc: true
										});
									}

								}
								else
								{




									var schedule = billObject.getSublistValue({sublistId: 'item',fieldId:'custcol_item_schedule_gst',line:k});
									log.debug('mmmmmmmmmmmmmmmmmm',schedule);
									if(schedule){
										
										log.debug('item countmmmmm',item_count);
										log.debug('aaaaaaaaaaaaaaa');
										var taxCodeFilters = [];
										var taxCodeColumns = [];

										taxCodeFilters.push(search.createFilter({
											name : 'custrecord_gst_type',
											operator : search.Operator.IS,
											values :  gstType
										}));
										if(shipToState !=null && shipToState !='')
										{

											if(gstType == intra)
											{

												taxCodeFilters.push(search.createFilter({
													name : 'custrecord_location_state',
													operator : search.Operator.IS,
													values :  shipToState
												}));

											}

										}

										taxCodeFilters.push(search.createFilter({
											name : 'custrecord_gst_item_schedule',
											operator : search.Operator.IS,
											values :  schedule
										}));

										taxCodeColumns.push(search.createColumn({
											name: 'custrecord_gst_tax_code'
										}));

										taxCodeColumns.push(search.createColumn({
											name: 'custrecord_gst_tax_code'
										}));

										var taxCodeSearch = search.create({
											"type": "customrecord_gst_tax_code_matrix",
											"filters":taxCodeFilters,
											"columns":taxCodeColumns
										});

										var arrSearchResults = taxCodeSearch .run().getRange({start : 0, end : 1});
										var scriptObj = runtime.getCurrentScript();
										log.debug('arrSearchResults',arrSearchResults.length);
										if(arrSearchResults[0]){
											var taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
											// var reversalTaxCode =
											// arrSearchResults[0].getValue('custrecord_gst_reversal_tax_code')

										}

										var sezInvoice = billObject.getValue({fieldId: 'custbody126'});
										if(sezInvoice == 2)
							             {
											billObject.setSublistValue({
							                        sublistId:'item',
							                        fieldId:'taxcode',
							                        line:k,
							                        value:25584,
							                        ignoreFieldChange:false
							                       });
							             }
										else
											{
											log.debug('ddddddd',taxCodeInternalId);
											billObject.setSublistValue({
												sublistId:'item',
												fieldId:'taxcode',
												line:k,
												value:taxCodeInternalId,
												ignoreFieldChange:false
											});	
											}
										
									}

									

								}







								var rev_apply = billObject.getSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_apply',line:k});
								var rev_line = billObject.getSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_line',line:k});
								log.audit('before apply',rev_apply);
								if(rev_apply)
								{
									log.audit('after Applying');
									// var strevpercent =
									// billObject.getSublistValue({sublistId:'item',fieldId:'custcol_st_rev_percent',line:k});

									var amountItem = billObject.getSublistValue({sublistId:'item', fieldId:'amount', line:k});	
									var exp_Location = billObject.getSublistValue({sublistId:'item',fieldId:'location',line:k});
									var taxcode = billObject.getSublistValue({sublistId:'item',fieldId:'taxcode',line:k});
									var revPercent =  billObject.getSublistValue({sublistId:'item',fieldId:'taxrate1',line:k});
									var scheduleIdline = billObject.getSublistValue({sublistId:'item',fieldId:'custcol_item_schedule_gst',line:k});

									// Rajendran
									if(scheduleIdline == "" || scheduleIdline == null){
										return;
									}


									billObject.setSublistValue({
										sublistId: 'item',
										fieldId:'custcol_cgst_amount',
										line: k,
										value:''
									});

									billObject.setSublistValue({
										sublistId: 'item',
										fieldId:'custcol_cgst_rate',
										line: k,
										value:''
									});

									billObject.setSublistValue({
										sublistId: 'item',
										fieldId:'custcol_sgst_rate',
										line: k,
										value:''
									});


									billObject.setSublistValue({
										sublistId: 'item',
										fieldId:'custcol_sgst_amount',
										line: k,
										value:''
									});

									billObject.setSublistValue({
										sublistId: 'item',
										fieldId:'custcol_igst_rate',
										line: k,
										value:''
									});

									billObject.setSublistValue({
										sublistId: 'item',
										fieldId:'custcol_igst_amount',
										line: k,
										value:''
									});



									log.debug('Tax Rate',revPercent);
									// revPercent =
									// revPercent.substring(0,revPercent.length
									// - 1);
									var purchaseAmountItem = amountItem * (revPercent/100);
									var negativeAmount = -purchaseAmountItem;
									var taxCodeFilters = [];
									var taxCodeColumns = [];

									taxCodeFilters.push(search.createFilter({
										name : 'custrecord_gst_type',
										operator : search.Operator.IS,
										values :  gstType
									}));

									if(shipToState !=null && shipToState !='')
									{
										if(gstType == intra)
										{

											taxCodeFilters.push(search.createFilter({
												name : 'custrecord_location_state',
												operator : search.Operator.IS,
												values :  shipToState
											}));
										}
									}
									taxCodeFilters.push(search.createFilter({
										name : 'custrecord_gst_item_schedule',
										operator : search.Operator.IS,
										values :  scheduleIdline
									}));

									taxCodeColumns.push(search.createColumn({
										name: 'custrecord_gst_tax_code'
									}));
									taxCodeColumns.push(search.createColumn({
										name: 'custrecord_sgst_revpur_item'
									}));
									taxCodeColumns.push(search.createColumn({
										name: 'custrecord_sgst_revpay_item'
									}));

									taxCodeColumns.push(search.createColumn({
										name: 'custrecord_cgst_revpur_item'
									}));

									taxCodeColumns.push(search.createColumn({
										name: 'custrecord_cgst_revpay_item'
									}));

									taxCodeColumns.push(search.createColumn({
										name: 'custrecord_gst_reversal_tax_code'
									}));


									taxCodeColumns.push(search.createColumn({name: 'custrecord_gst_tax_code'}));

									var taxCodeSearch = search.create({
										"type": "customrecord_gst_tax_code_matrix",
										"filters":taxCodeFilters,
										"columns":taxCodeColumns
									});

									var arrSearchResults = taxCodeSearch .run().getRange({start : 0, end : 1});
									if(arrSearchResults[0]){	
										var taxCodeitem = arrSearchResults[0].getValue('custrecord_gst_tax_code');




										log.debug('Custom Record Id',arrSearchResults[0].id);


									}else{

										throw error.create({
											name: 'Notice',
											message: 'Custom tax code record for gst not found',
											notifyOff: true
										});

									}

									if(gstType == intra)
									{
										try
										{
											var taxGroupObject = record.load({
												type: record.Type.TAX_GROUP,
												id: taxCodeitem     
											});
										}catch(error){

											throw error.create({
												name: 'Notice',
												message: 'Tax Group Record Not Found',
												notifyOff: true
											});

										}
										log.audit('Gst Type is intra');
										var totalLineItemTax = taxGroupObject.getLineCount({sublistId: 'taxitem'});
										log.audit('totalLineItemTax ',totalLineItemTax);
										for(var j =0 ; j < totalLineItemTax;j++)
										{
											var taxname = taxGroupObject.getSublistValue({
												sublistId: 'taxitem',
												fieldId:'taxtype',
												line:j	
											});

											taxname = taxname.split("_");
											taxname = taxname.toLocaleString().toLowerCase().split(',');
											if(taxname.indexOf(cgst)>=0)
											{
												var cgstRate = taxGroupObject.getSublistValue({
													sublistId: 'taxitem',
													fieldId:'rate',
													line:j	
												}); 
												log.debug('cgstRate',cgstRate);
											}

											if(taxname.indexOf(sgst)>=0)
											{
												var sgstRate = taxGroupObject.getSublistValue({
													sublistId: 'taxitem',
													fieldId:'rate',
													line:j	
												}); 
												log.debug('sgst rate',sgstRate);
											}



										}

										var purchaseAmountItem = amountItem * (cgstRate/100); // cgst
																								// amount
										var negativeAmount = -purchaseAmountItem;

										var purchaseAmountsgst = amountItem * (sgstRate/100); // sgst
																								// amount
										var negativeAmountsgst = -purchaseAmountsgst;

										totalCgstAmount = totalCgstAmount + purchaseAmountItem;
										totalSgstAmount = totalSgstAmount+ 	purchaseAmountsgst;		


										// billObject.setSublistValue({sublistId:'item',fieldId:'taxcode',line:k,value:rev_tax_code});
										log.debug('taxcode.............',taxcode);
										billObject.setSublistValue({sublistId:'item',fieldId:'item',line:temp_count_item+1,value:rev_PurchaseItem});
										billObject.setSublistValue({sublistId:'item',fieldId:'rate',line:temp_count_item+1,value:purchaseAmountsgst});
										billObject.setSublistValue({sublistId:'item',fieldId:'amount',line:temp_count_item+1,value:purchaseAmountsgst});
										billObject.setSublistValue({sublistId:'item',fieldId:'taxcode',line:temp_count_item+1,value:taxcode});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_rate',line:temp_count_item+1,value:sgstRate});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_amount',line:temp_count_item+1,value:purchaseAmountsgst});

										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_rate',line:temp_count_item+1,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_amount',line:temp_count_item+1,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_rate',line:temp_count_item+1,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_amount',line:temp_count_item+1,value:0});

										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_line',line:temp_count_item+1,value:true});



										billObject.setSublistValue({sublistId:'item',fieldId:'item',line:temp_count_item+2,value:rev_PayableItem});
										billObject.setSublistValue({sublistId:'item',fieldId:'rate',line:temp_count_item+2,value:negativeAmountsgst});
										billObject.setSublistValue({sublistId:'item',fieldId:'amount',line:temp_count_item+2,value:negativeAmountsgst});
										billObject.setSublistValue({sublistId:'item',fieldId:'taxcode',line:temp_count_item+2,value:taxcode});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_rate',line:temp_count_item+2,value:sgstRate});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_amount',line:temp_count_item+2,value:purchaseAmountsgst});

										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_rate',line:temp_count_item+2,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_amount',line:temp_count_item+2,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_rate',line:temp_count_item+2,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_amount',line:temp_count_item+2,value:0});

										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_line',line:temp_count_item+2,value:true});


										billObject.setSublistValue({sublistId:'item',fieldId:'item',line:temp_count_item+3,value:rev_cgstPurchaseItem});
										billObject.setSublistValue({sublistId:'item',fieldId:'rate',line:temp_count_item+3,value:purchaseAmountItem});
										billObject.setSublistValue({sublistId:'item',fieldId:'amount',line:temp_count_item+3,value:purchaseAmountItem});
										billObject.setSublistValue({sublistId:'item',fieldId:'taxcode',line:temp_count_item+3,value:taxcode});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_rate',line:temp_count_item+3,value:cgstRate});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_amount',line:temp_count_item+3,value:purchaseAmountItem});

										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_rate',line:temp_count_item+3,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_amount',line:temp_count_item+3,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_rate',line:temp_count_item+3,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_amount',line:temp_count_item+3,value:0});

										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_line',line:temp_count_item+3,value:true});


										billObject.setSublistValue({sublistId:'item',fieldId:'item',line:temp_count_item+4,value:rev_cgstPayableItem});
										billObject.setSublistValue({sublistId:'item',fieldId:'rate',line:temp_count_item+4,value:negativeAmount});
										billObject.setSublistValue({sublistId:'item',fieldId:'amount',line:temp_count_item+4,value:negativeAmount});
										billObject.setSublistValue({sublistId:'item',fieldId:'taxcode',line:temp_count_item+4,value:taxcode});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_rate',line:temp_count_item+4,value:cgstRate});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_amount',line:temp_count_item+4,value:purchaseAmountItem});

										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_rate',line:temp_count_item+4,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_amount',line:temp_count_item+4,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_rate',line:temp_count_item+4,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_amount',line:temp_count_item+4,value:0});

										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_line',line:temp_count_item+4,value:true});

										temp_count_item = temp_count_item+4;


									}
									else{
										log.audit('Gst Type is inter');
										var scheduleIdline = billObject.getSublistValue({sublistId:'item',fieldId:'custcol_item_schedule_gst',line:k});
										var taxCodeId = getTaxCodeBySearch(gstType,shipToState,scheduleIdline);
										var totalLineItem = billObject.getLineCount({sublistId: 'item'});
										log.debug('Total Line Count',totalLineItem);



										var taxCode = billObject.getSublistValue({
											sublistId: 'item',
											fieldId: 'taxcode',
											line: k
										});

										log.audit('tax code',taxCode);
										try
										{
											var taxGroupObject = record.load({
												type: record.Type.TAX_GROUP,
												id:  taxCodeId     
											});
										}catch(error){
											throw error.create({
												name: 'Notice',
												message: 'Tax Group Record Not Found',
												notifyOff: true
											});
										}

										var totalLineItemTax = taxGroupObject.getLineCount({sublistId: 'taxitem'});

										var taxname = taxGroupObject.getSublistValue({
											sublistId: 'taxitem',
											fieldId:'taxtype',
											line:0	
										});
										var taxtype = taxGroupObject.getSublistValue({
											sublistId: 'taxitem',
											fieldId:'taxtype',
											line:0	
										});

										taxtype = taxtype.split("_");
										var code = taxtype[1];


										var igst = 'IGST_'+code
										igst = igst.toString();
										log.debug('igst code',igst);




										var	igstRate = taxGroupObject.getSublistValue({
											sublistId: 'taxitem',
											fieldId:'rate',
											line:0	
										}); 
										log.debug('igstRate',igstRate);



										var amount = billObject.getSublistValue({
											sublistId: 'item',
											fieldId: 'amount',
											line: k
										}); 
										log.debug('AMOUNTTTTTTT',amount);


										var igstAmount = amount * (igstRate/100);
										totalIgstAmount += igstAmount;

										var negativeIgstAmt = -igstAmount;
										log.debug('',igstAmount);

										log.debug('totalIgstAmount',totalIgstAmount);

										log.debug('igstRate',igstRate);

										billObject.setSublistValue({sublistId:'item',fieldId:'item',line:temp_count_item+1,value:rev_cgstPurchaseItem});
										billObject.setSublistValue({sublistId:'item',fieldId:'rate',line:temp_count_item+1,value:igstAmount});
										billObject.setSublistValue({sublistId:'item',fieldId:'amount',line:temp_count_item+1,value:igstAmount});
										// billObject.setSublistValue({sublistId:'item',fieldId:'taxcode',line:temp_count_item+1,value:taxcode});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_line',line:temp_count_item+1,value:true});
										billObject.setSublistValue({sublistId:'item',fieldId:'taxcode',line:temp_count_item+1,value:rev_tax_code});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_rate',line:temp_count_item+1,value:igstRate});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_amount',line:temp_count_item+1,value:igstAmount});

										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_rate',line:temp_count_item+1,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_amount',line:temp_count_item+1,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_rate',line:temp_count_item+1,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_amount',line:temp_count_item+1,value:0});

										billObject.setSublistValue({sublistId:'item',fieldId:'item',line:temp_count_item+2,value:rev_cgstPayableItem});
										billObject.setSublistValue({sublistId:'item',fieldId:'rate',line:temp_count_item+2,value:negativeIgstAmt});
										billObject.setSublistValue({sublistId:'item',fieldId:'amount',line:temp_count_item+2,value:negativeIgstAmt});
										billObject.setSublistValue({sublistId:'item',fieldId:'taxcode',line:temp_count_item+2,value:rev_tax_code});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_gst_reversal_line',line:temp_count_item+2,value:true});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_rate',line:temp_count_item+2,value:igstRate});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_igst_amount',line:temp_count_item+2,value:igstAmount});

										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_rate',line:temp_count_item+2,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_cgst_amount',line:temp_count_item+2,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_rate',line:temp_count_item+2,value:0});
										billObject.setSublistValue({sublistId:'item',fieldId:'custcol_sgst_amount',line:temp_count_item+2,value:0});

										temp_count_item = temp_count_item+2;

									}

									// strevpercent =
									// strevpercent.substring(0,strevpercent.length
									// - 1);
								}
								else
								{

									// -------------Reversal Apply is not
									// true---------------//
									log.audit('Reversal apply is not true');
									if(revline !=true)
									{
										// calculateGstAmount(billObject)
									}


									// return;
									log.audit('aaaaaaaaaaaaaaaaaaaaaaaaa');



									// -------------Reversal Apply is not true
									// END---------------//

								}
							}

// if(totalCgstAmount && totalSgstAmount)
// {
// billObject.setValue({fieldId:'custbody_gst_total_cgst',value:totalCgstAmount});
// billObject.setValue({fieldId:'custbody_gst_total_sgst',value:totalSgstAmount});
// billObject.setValue({fieldId:'custbody_gst_total_igst',value:0});
// }
//	
// log.audit('last totalIgstAmount',totalIgstAmount);
// if(totalIgstAmount)
// {
// billObject.setValue({fieldId:'custbody_gst_total_igst',value:totalIgstAmount});
// billObject.setValue({fieldId:'custbody_gst_total_cgst',value:0});
// billObject.setValue({fieldId:'custbody_gst_total_sgst',value:0});
// }
//	







							// billObject.save();



							// ---------------------item
							// end---------------------------------------------//




						}// main if

						// billObject.save();
						log.debug('Record Saved');
						}
					
			

				}
			}


		}catch(error){

			throw error.create({
				name: 'Notice',
				message: error,
				notifyOff: true
			});

		}



	

	}

	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {Record}
	 *            scriptContext.oldRecord - Old record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function beforeSubmit(scriptContext) {
		
		log.debug('inside before submit');
		var ScriptParameter = runtime.getCurrentScript().getParameter("custscript_transaction_type_invo");
		var getTranid = [];
// //alert('getToDisableRecords'+getToDisableRecords);
		var currentRecordObj = scriptContext.newRecord;
		var getTranType = search.lookupFields({
			type : 'customrecord_gst_transaction_type',
			id   :  ScriptParameter,
			columns : 'custrecord_form'
		});
		
		var customForm = currentRecordObj.getValue({fieldId:'customform'});
		getTranid = getTranType.custrecord_form[0].value;
		// alert('getTranid'+getTranid);
		if(getTranid && getTranid.length > 0) {
			// alert('inside');

			if(getTranid.indexOf(customForm) != -1) {
				if(scriptContext.mode != 'delete')
					{
					log.debug('go to setLineItems');
					setLineItems(currentRecordObj);
				calculateGstAmount(currentRecordObj);
					}
			
				}
			}
	
		
		
	
		}

	function calculateGstAmount(billObject)
	{
		var intra = 1;
		var inter = 2;
		var totalIgstAmount = 0, totalCgstAmount= 0, totalSgstAmount= 0;
		var igstRate;

		var sezType= billObject.getValue({fieldId:'custbody126'});

		var soid = billObject.getValue({
			fieldId: 'createdfrom'
		});
		
		var gstType = billObject.getValue({
			fieldId: 'custbody_gst_type'
		});
		
		
		var state = billObject.getValue({
			fieldId: 'custbody_destination_state_gst'
		});
		
		
		var stateFilter = [];
		var stateColumn = [];
		log.debug({
		    title: 'state', 
		    details: 'state='+state
		 }); 
		if(state){//目前这个字段不知道用途是什么，但是如果为空就会报错，故加上非控判断 joe 20180227
			stateFilter.push(search.createFilter({
				name : 'custrecord_gst_state_setup_state',
				operator : search.Operator.IS,
				values : state
			}));
		}

		
		stateColumn.push(search.createColumn({
			name: 'custrecord_gst_state_setup_state_abb'
		}));
		stateColumn.push(search.createColumn({
			name: 'custrecord_gst_state_setup_statecode'
		}));


		

		var stateSearch = search.create({
			"type": "customrecord_gst_state_setup",
			"filters":stateFilter,
			"columns":stateColumn

		}).run().getRange({start : 0, end : 1});;


		if(stateSearch[0]){
			var stateId = stateSearch[0].getValue('custrecord_gst_state_setup_state_abb');
			var statecode = stateSearch[0].getValue('custrecord_gst_state_setup_statecode');
			// alert(stateId);
			// console.log(taxCodeInternalId);
		}

		billObject.setValue({
			fieldId: 'custbody_shiptostate',
			value:stateId

		});
		billObject.setValue({
			fieldId: 'custbody_statecode',
			value:statecode

		});
		
		billObject.setValue({
			fieldId: 'custbody_so_num',
			value:soid

		});
		
		
		
		
		
		
		var totalLineItem = billObject.getLineCount({sublistId: 'item'});
		log.debug('gst type',gstType);
		if(gstType == intra)
		{

			log.debug('Total Line Count..............',totalLineItem);

			for(var i = 0; i < totalLineItem; i++)
			{
				// get Tax code from the line item.

				// rajendran

				var scheduleIdline = billObject.getSublistValue({sublistId:'item',fieldId:'custcol_item_schedule_gst',line:i});

				if(scheduleIdline){
					var taxCode = billObject.getSublistValue({
						sublistId: 'item',
						fieldId: 'taxcode',
						line: i
					});



					log.audit('tax code '+i,taxCode);
					
						var taxGroupObject = record.load({
							type: record.Type.TAX_GROUP,
							id: taxCode     
						});
					

					var totalLineItemTax = taxGroupObject.getLineCount({sublistId: 'taxitem'});
					log.audit('totalLineItemTax ',totalLineItemTax);
					for(var j =0 ; j < totalLineItemTax;j++)
					{
											var taxname = taxGroupObject.getSublistValue({
												sublistId: 'taxitem',
												fieldId:'taxtype',
												line:j	
											});

						taxname = taxname.split("_");
						taxname = taxname.toLocaleString().toLowerCase().split(',');
						if(taxname.indexOf(cgst)>=0)
						{
							var cgstRate = taxGroupObject.getSublistValue({
								sublistId: 'taxitem',
								fieldId:'rate',
								line:j	
							}); 
							log.debug('cgstRate',cgstRate);
						}

						if(taxname.indexOf(sgst)>=0)
						{
							var sgstRate = taxGroupObject.getSublistValue({
								sublistId: 'taxitem',
								fieldId:'rate',
								line:j	
							}); 
							log.debug('sgst rate',sgstRate);
						}



					}

					var amount = billObject.getSublistValue({
						sublistId: 'item',
						fieldId: 'amount',
						line: i
					}); 
					log.debug('AMOUNT',amount);
					var cgstAmount = amount * (cgstRate/100);
					cgstAmount = cgstAmount.toFixed(2);

					var sgstAmount = amount * (sgstRate/100);
					log.debug('CGST Amount',cgstAmount)
					log.debug('SGST AMOUNT',sgstAmount)



					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_cgst_rate',
						line: i,
						value:cgstRate
					});
					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_cgst_amount',
						line: i,
						value:cgstAmount
					});
					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_sgst_rate',
						line: i,
						value:sgstRate
					});

					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_sgst_amount',
						line: i,
						value:sgstAmount
					});

					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_igst_rate',
						line: i,
						value:0
					});

					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_igst_amount',
						line: i,
						value:0
					});

					totalCgstAmount+= Number(cgstAmount);
					totalSgstAmount+= Number(sgstAmount);
					log.debug('Cgst Saved');
				}

				




			}

			log.audit('last totalCgstAmount totalSgstAmount',totalCgstAmount+':'+totalSgstAmount);
			if(totalCgstAmount && totalSgstAmount)
			{
				billObject.setValue({fieldId:'custbody_gst_total_cgst',value:totalCgstAmount});
				billObject.setValue({fieldId:'custbody_gst_total_sgst',value:totalSgstAmount});
				billObject.setValue({fieldId:'custbody_gst_total_igst',value:0});
				log.audit('Done',totalCgstAmount+':'+totalSgstAmount);
			}



		}else
		{

			log.debug('In else');
			var totalLineItem = billObject.getLineCount({sublistId: 'item'});
			log.debug('Total Line Count',totalLineItem);
// Rajendran
			for(var i = 0; i < totalLineItem; i++)
			{
				log.debug('qqqqqqqqqqqqqqqqqqqqqqqqqqqq',i);
				var scheduleIdline = billObject.getSublistValue({sublistId:'item',fieldId:'custcol_item_schedule_gst',line:i});

				if(scheduleIdline){

					var sezInvoice = billObject.getValue({fieldId: 'custbody126'});
					if(sezInvoice == 2)
		             {
						igstRate = Number(0);
		             }
					else
						{
						var taxCode = billObject.getSublistValue({
							sublistId: 'item',
							fieldId: 'taxcode',
							line: i
						});



						log.audit('tax code.............',taxCode);
						var taxGroupObject = record.load({
								type: record.Type.TAX_GROUP,
								id:  taxCode     
							});
						
						log.audit('ffffff.............');

						var totalLineItemTax = taxGroupObject.getLineCount({sublistId: 'taxitem'});

						var taxname = taxGroupObject.getSublistValue({
							sublistId: 'taxitem',
							fieldId:'taxtype',
							line:0	
						});
						var taxtype = taxGroupObject.getSublistValue({
							sublistId: 'taxitem',
							fieldId:'taxtype',
							line:0	
						});

						taxtype = taxtype.split("_");
						var code = taxtype[1];


						var igst = 'IGST_'+code
						igst = igst.toString();
						log.debug('igst code',igst);




							igstRate = taxGroupObject.getSublistValue({
							sublistId: 'taxitem',
							fieldId:'rate',
							line:0	
						}); 
						log.debug('igstRate',igstRate);

						}
					
					

					var amount = billObject.getSublistValue({
						sublistId: 'item',
						fieldId: 'amount',
						line: i
					}); 
					log.debug('AMOUNT',amount);



					var igstAmount = amount * (igstRate/100);

					log.debug('igstAmtttt',igstAmount);

					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_igst_rate',
						line: i,
						value:igstRate
					});

					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_igst_amount',
						line: i,
						value:igstAmount
					});

					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_cgst_rate',
						line: i,
						value:0
					});
					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_cgst_amount',
						line: i,
						value:0
					});
					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_sgst_rate',
						line: i,
						value:0
					});

					billObject.setSublistValue({
						sublistId: 'item',
						fieldId:'custcol_sgst_amount',
						line: i,
						value:0
					});
					totalIgstAmount+=igstAmount;
					log.debug('Igst Saved',totalIgstAmount);
				}

			}	

			log.audit('last totalIgstAmount',totalIgstAmount);
			if(totalIgstAmount)
			{
				billObject.setValue({fieldId:'custbody_gst_total_igst',value:totalIgstAmount});
				billObject.setValue({fieldId:'custbody_gst_total_cgst',value:0});
				billObject.setValue({fieldId:'custbody_gst_total_sgst',value:0});
			}


		}

		if(totalCgstAmount && totalSgstAmount)
		{


			log.debug('Total Cgst amount',totalCgstAmount);
			log.debug('Total Sgst amount',totalSgstAmount);


			var taxTotal = billObject.getValue({
				fieldId: 'taxtotal'
			});

			log.debug('taxTotal',taxTotal);

			var cgstTotal = Number(0);
			var sgstTotal = Number(0);

			var toBeSplittedTaxTotal = taxTotal.toString();
			var splitTaxTotal = toBeSplittedTaxTotal.split(".");
			var getDecimal = splitTaxTotal[1];
			var modulus = Number(getDecimal) % 2;

			if(Number(modulus) != Number(0)) {

				log.debug('Inside Odd number', 'Inside Odd number');

				cgstTotal = taxTotal / 2;
				log.debug('cgstTotal after division',cgstTotal);

				cgstTotal = cgstTotal.toFixed(2);
				log.debug('cgstTotal after toFixed',cgstTotal);

				sgstTotal = taxTotal - cgstTotal;
				log.debug('sgstTotal',sgstTotal);

			}

			else if (Number(modulus) == Number(0)) {

				log.debug('Inside Even number', 'Inside Even number');

				cgstTotal = taxTotal / 2;
				log.debug('cgstTotal',cgstTotal);

				sgstTotal = cgstTotal;
				log.debug('sgstTotal',sgstTotal);
			}

			
			if(sezType == 2)
					{
				billObject.setValue({fieldId:'custbody_gst_total_cgst',value:0});
				billObject.setValue({fieldId:'custbody_gst_total_sgst',value:0});

					}
			else
				{
				log.debug('inside sgst');
				billObject.setValue({fieldId:'custbody_gst_total_cgst',value:cgstTotal});
				billObject.setValue({fieldId:'custbody_gst_total_sgst',value:sgstTotal});
				}
			





		}
		else {

			log.debug('mmmmmmmmmmmmmmmmmmmmmmmmm',totalIgstAmount);

			var igstTotal = billObject.getValue({
				fieldId: 'taxtotal'
			});
			log.debug('igstTotal',igstTotal);
			
			
			
			if(sezType == 2)
			{
				log.debug('sezType',sezType);
				billObject.setValue({fieldId:'custbody_gst_total_igst',value:0});

			}
			else
				{
				log.debug('totalIgstAmountssssssssss',totalIgstAmount);
				log.debug('inside totaligstamount elseeee');
// billObject.setValue({fieldId:'custbody_gst_total_igst',value:totalIgstAmount});

				
				billObject.setValue({
					fieldId: 'custbody_gst_total_igst',
					value: Number(totalIgstAmount),
					ignoreFieldChange: true,
					fireSlavingSync: true
				});
				billObject.setValue({
					fieldId: 'custbody_gst_total_cgst',
					value:Number(0),
					ignoreFieldChange: true,
					fireSlavingSync: true
				});
				billObject.setValue({
					fieldId: 'custbody_gst_total_sgst',
					value: Number(0),
					ignoreFieldChange: true,
					fireSlavingSync: true
				});
				}


		}

		// billObject.save();
	}

	function getTaxCodeBySearch(gstType,shipToState,scheduleIdline)
	{
		var taxCodeFilters = [];
		var taxCodeColumns = [];

		taxCodeFilters.push(search.createFilter({
			name : 'custrecord_gst_type',
			operator : search.Operator.IS,
			values :  gstType
		}));

		if(shipToState !=null && shipToState !='')
		{
			if(gstType == intra)
			{
				taxCodeFilters.push(search.createFilter({
					name : 'custrecord_location_state',
					operator : search.Operator.IS,
					values :  shipToState
				}));
			}
		}

		taxCodeFilters.push(search.createFilter({
			name : 'custrecord_gst_item_schedule',
			operator : search.Operator.IS,
			values :  scheduleIdline
		}));

		taxCodeColumns.push(search.createColumn({
			name: 'custrecord_gst_tax_code'
		}));
		taxCodeColumns.push(search.createColumn({
			name: 'custrecord_sgst_revpur_item'
		}));
		taxCodeColumns.push(search.createColumn({
			name: 'custrecord_sgst_revpay_item'
		}));

		taxCodeColumns.push(search.createColumn({
			name: 'custrecord_cgst_revpur_item'
		}));

		taxCodeColumns.push(search.createColumn({
			name: 'custrecord_cgst_revpay_item'
		}));

		taxCodeColumns.push(search.createColumn({
			name: 'custrecord_gst_reversal_tax_code'
		}));


		taxCodeColumns.push(search.createColumn({name: 'custrecord_gst_tax_code'}));

		var taxCodeSearch = search.create({
			"type": "customrecord_gst_tax_code_matrix",
			"filters":taxCodeFilters,
			"columns":taxCodeColumns
		});

		var arrSearchResults = taxCodeSearch .run().getRange({start : 0, end : 1});
		if(arrSearchResults[0]){	
			var taxCodeitem = arrSearchResults[0].getValue('custrecord_gst_tax_code');
			log.debug('taxCodeitemtaxCodeitem',taxCodeitem);
			log.debug('Custom Record Id',arrSearchResults[0].id);
			return taxCodeitem;


		}else{

			throw error.create({
				name: 'Notice',
				message: 'Custom tax code record for gst not found',
				notifyOff: true
			});

		}

	}
	
	 function setLineItems(currentRecordObj){
	    	
	    log.debug('Setting Tax Code');
	    var getSchedule;
	    var item;
		var sezInvoice = currentRecordObj.getValue({fieldId: 'custbody126'});
		log.debug('sezInvvvvvvv',sezInvoice);
	    	var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_type'});
	    	var destinationState = currentRecordObj.getValue({fieldId: 'custbody_destination_state_gst'});
	    	var itemCount = currentRecordObj.getLineCount({sublistId: 'item'});
	    	for(var i = 0; i < itemCount; i++){
	    		
	    		var itemid = currentRecordObj.getSublistValue({sublistId: 'item',fieldId:'item',line:i});
	    		
	    		log.debug('itemid',itemid);
	    		if(itemid >1)
	    		{
	    			// currentRecordObj.setSublistValue({sublistId:
					// 'item',fieldId:'custcol_item_schedule_gst',line:i,value:getSchedule});
		    		var getSchedule = currentRecordObj.getSublistValue({sublistId: 'item',fieldId:'custcol_item_schedule_gst',line:i});
		    	
		    		if(!getSchedule)
		    		{
		    		
		    			
		    			log.debug('wwwwwwwwwwwwwwwwwwaaaaaa',itemid);
// record.load({type:record.Type.LOCATION,id:location})
		    			
		    			// Load saved search into objSearch
		    			var getTaxCodee;
		    			var getTaxCodee = search.lookupFields({
		    			      type : 'item',
		    			      id   :  itemid,
		    			      columns : 'custitem_item_schedule_gst'
		    			     });
		    			 log.debug('getTaxCodeeeeeeeeeee ',getTaxCodee);
		    			     if(getTaxCodee.custitem_item_schedule_gst[0])
		    			     {
		    			      var scheduleId = getTaxCodee.custitem_item_schedule_gst[0].value;
		    			 log.debug('scheduleIdddddd ',scheduleId);
		    			      
		    			      currentRecordObj.setSublistValue({
					    			sublistId: 'item',
					    			fieldId:'custcol_item_schedule_gst',
					    			line:i,
					    			value:scheduleId
					    		});
		    			     }
								
								log.debug('insideeeeeee getScheduleeeee');
								
								var getTaxCode = getTaxCodeBySearch(gstType,destinationState,scheduleId);
								log.debug('qdryhdhghfghfghfg',getTaxCode);
								
									
				    	/*
						 * currentRecordObj.setSublistValue({ sublistId: 'item',
						 * fieldId:'taxcode', line:i, value:getTaxCode });
						 */

				    		
							if(sezInvoice == 2)
				             {
								log.debug('sezInvoiceeeeeeeeeeee',sezInvoice);
								currentRecordObj.setSublistValue({
			                        sublistId:'item',
			                        fieldId:'taxcode',
			                        line:i,
			                        value:25584,
			                        ignoreFieldChange:false
			                       });
				             }
							else
								{
							// log.debug('gggggggggggggg',taxCodeInternalId);
								currentRecordObj.setSublistValue({
									sublistId:'item',
									fieldId:'taxcode',
									line:i,
									value:getTaxCode,
									ignoreFieldChange:false
								});	
								}
		    	              
		    	            }

	    		
	    	}
	    	calculateGstAmount(currentRecordObj);
	    	 log.debug('Setting Tax Code DONE');
	    	
	    	
	    }


	 }


	return {
		beforeLoad: beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit: afterSubmit
	};

});