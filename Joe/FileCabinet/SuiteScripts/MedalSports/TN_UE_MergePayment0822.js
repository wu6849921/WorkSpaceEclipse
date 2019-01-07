/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/ui/serverWidget', 'N/record', 'N/redirect', 'N/search', 'N/error',
				'N/url' ],

		function(serverWidget, record, redirect, search, error, url) {

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
			function beforeLoad(context) {
				try {
					var newRecord = context.newRecord;
					// 第一步:创建时生成sublist
					// || context.type == context.UserEventType.VIEW
					if (context.type == context.UserEventType.CREATE ||context.type == context.UserEventType.EDIT) {
						// 创建sublist
						var form = context.form;

						var tab = form.addTab({// 1、ar tab
							id : 'custpage_tn_mergepaymentar',
							label : 'AR'
						});
						// 1.1、invoice sublist
						var invoiceLines = form.addSublist({
							id : 'custpage_tn_mergepay_invoice',
							label : 'Invoice',
							tab : 'custpage_tn_mergepaymentar',
							type : serverWidget.SublistType.INLINEEDITOR,
						});
						invoiceLines.addField({
							id : 'custpage_inv_apply',
							type : serverWidget.FieldType.CHECKBOX,
							label : 'Apply'
						});
						invoiceLines.addField({
							id : 'custpage_inv_date',
							label : 'Date',
							type : serverWidget.FieldType.TEXT
						});
						invoiceLines.addField({
							id : 'custpage_inv_type',
							type : serverWidget.FieldType.SELECT,
							label : 'Type',
							source : 'transaction'
						});
						invoiceLines.addField({
							id : 'custpage_inv_refnum',
							label : 'Ref No.',
							type : serverWidget.FieldType.TEXT
						});
						invoiceLines.addField({
							id : 'custpage_inv_currency',
							label : 'Currency',
							type : serverWidget.FieldType.SELECT,
							source : 'currency'
						});
						invoiceLines.addField({
							id : 'custpage_inv_total',
							label : 'Orig. Amt.',
							type : serverWidget.FieldType.CURRENCY
						});
						invoiceLines.addField({
							id : 'custpage_inv_due',
							label : 'Amt. Due',
							type : serverWidget.FieldType.CURRENCY
						});
						invoiceLines.addField({
							id : 'custpage_inv_totalbase',
							label : 'Orig. Amt.(Base)',
							type : serverWidget.FieldType.CURRENCY
						});
						invoiceLines.addField({
							id : 'custpage_inv_duebase',
							label : 'Amt. Due(Base)',
							type : serverWidget.FieldType.CURRENCY
						});
						invoiceLines.addField({
							id : 'custpage_inv_amount',
							label : 'Payment',
							type : serverWidget.FieldType.CURRENCY
						});
						// 1.2、credit sublist
						var invoiceLines = form.addSublist({
							id : 'custpage_tn_mergepay_credit',
							label : 'Credit',
							tab : 'custpage_tn_mergepaymentar',
							type : serverWidget.SublistType.INLINEEDITOR,
						});
						invoiceLines.addField({
							id : 'custpage_cre_apply',
							type : serverWidget.FieldType.CHECKBOX,
							label : 'Apply'
						});
						invoiceLines.addField({
							id : 'custpage_cre_date',
							label : 'Date',
							type : serverWidget.FieldType.TEXT
						});
						invoiceLines.addField({
							id : 'custpage_cre_type',
							type : serverWidget.FieldType.SELECT,
							label : 'Type',
							source : 'transaction'
						});
						invoiceLines.addField({
							id : 'custpage_cre_refnum',
							label : 'Ref No.',
							type : serverWidget.FieldType.TEXT
						});
						invoiceLines.addField({
							id : 'custpage_cre_currency',
							label : 'Currency',
							type : serverWidget.FieldType.SELECT,
							source : 'currency'
						});
						invoiceLines.addField({
							id : 'custpage_cre_total',
							label : 'Orig. Amt.',
							type : serverWidget.FieldType.CURRENCY
						});
						invoiceLines.addField({
							id : 'custpage_cre_due',
							label : ' Amount Remaining',
							type : serverWidget.FieldType.CURRENCY
						});
						invoiceLines.addField({
							id : 'custpage_cre_totalbase',
							label : 'Orig. Amt.(Base)',
							type : serverWidget.FieldType.CURRENCY
						});
						invoiceLines.addField({
							id : 'custpage_cre_duebase',
							label : 'Amt. Due(Base)',
							type : serverWidget.FieldType.CURRENCY
						});
						invoiceLines.addField({
							id : 'custpage_cre_amount',
							label : 'Credit',
							type : serverWidget.FieldType.CURRENCY
						});

						// 2、ap tab 包含bill和billcredit
						var apTab = form.addTab({
							id : 'custpage_tn_mergepaymentap',
							label : 'AP'
						});
						// 2.1、ap sublist
						var apLines = form.addSublist({
							id : 'custpage_tn_mergepay_ap',
							label : 'AP',
							tab : 'custpage_tn_mergepaymentap',
							type : serverWidget.SublistType.INLINEEDITOR,
						});
						apLines.addField({
							id : 'custpage_ap_apply',
							type : serverWidget.FieldType.CHECKBOX,
							label : 'Apply'
						});
						apLines.addField({
							id : 'custpage_ap_date',
							label : 'Date Due',
							type : serverWidget.FieldType.TEXT
						});
						apLines.addField({
							id : 'custpage_ap_type',
							type : serverWidget.FieldType.SELECT,
							label : 'Type',
							source : 'transaction'
						});
						apLines.addField({
							id : 'custpage_ap_refnum',
							label : 'Ref No.',
							type : serverWidget.FieldType.TEXT
						});
						apLines.addField({
							id : 'custpage_ap_currency',
							label : 'Currency',
							type : serverWidget.FieldType.SELECT,
							source : 'currency'
						});
						apLines.addField({
							id : 'custpage_ap_apaccount',
							label : 'APAccount',
							type : serverWidget.FieldType.SELECT,
							source : 'account'
						});
						apLines.addField({
							id : 'custpage_ap_total',
							label : 'Orig. Amt.',
							type : serverWidget.FieldType.CURRENCY
						});
						apLines.addField({
							id : 'custpage_ap_due',
							label : ' Amount Remaining',
							type : serverWidget.FieldType.CURRENCY
						});
						apLines.addField({
							id : 'custpage_ap_totalbase',
							label : 'Orig. Amt.(Base)',
							type : serverWidget.FieldType.CURRENCY
						});
						apLines.addField({
							id : 'custpage_ap_duebase',
							label : ' Amount Remaining(Base)',
							type : serverWidget.FieldType.CURRENCY
						});
						apLines.addField({
							id : 'custpage_ap_amount',
							label : 'Payment',
							type : serverWidget.FieldType.CURRENCY
						});
						// 3、others tab 人工输入
						var otTab = form.addTab({
							id : 'custpage_tn_mergepaymentot',
							label : 'Others'
						});
						// others sublist
						var otLines = form.addSublist({
							id : 'custpage_tn_mergepay_ot',
							label : 'Others',
							tab : 'custpage_tn_mergepaymentot',
							type : serverWidget.SublistType.INLINEEDITOR,
						});
						otLines.addField({
							id : 'custpage_ot_year',
							type : serverWidget.FieldType.TEXT,
							label : 'Year'
						});
						otLines.addField({
							id : 'custpage_ot_apply',
							type : serverWidget.FieldType.CHECKBOX,
							label : 'Apply'
						});
						otLines.addField({
							id : 'custpage_ot_account',
							type : serverWidget.FieldType.SELECT,
							label : 'Account',
							source : 'account'
						});
						otLines.addField({
							id : 'custpage_ot_currency',
							type : serverWidget.FieldType.SELECT,
							label : 'Currency',
							source : 'currency'
						});
						otLines.addField({
							id : 'custpage_ot_balance',
							type : serverWidget.FieldType.CURRENCY,
							label : 'Balance'
						});
						otLines.addField({
							id : 'custpage_ot_balancebase',
							type : serverWidget.FieldType.CURRENCY,
							label : 'Balance(Base)'
						});
						otLines.addField({
							id : 'custpage_ot_balancecurr',
							type : serverWidget.FieldType.CURRENCY,
							label : 'Balance(Current)'
						});
						otLines.addField({
							id : 'custpage_ot_payment',
							type : serverWidget.FieldType.CURRENCY,
							label : 'Payment'
						});
						// 4、未立项 tab 人工输入
						var npTab = form.addTab({
							id : 'custpage_tn_mergepaymentnp',
							label : '未立項'
						});
						// np sublist
						var npLines = form.addSublist({
							id : 'custpage_tn_mergepay_np',
							label : '未立項',
							tab : 'custpage_tn_mergepaymentnp',
							type : serverWidget.SublistType.INLINEEDITOR,
						});
						npLines.addField({
							id : 'custpage_np_account',
							type : serverWidget.FieldType.SELECT,
							label : 'Account',
							source : 'account'
						});
						npLines.addField({
							id : 'custpage_np_debit',
							type : serverWidget.FieldType.CURRENCY,
							label : 'Debit'
						});
						npLines.addField({
							id : 'custpage_np_credit',
							type : serverWidget.FieldType.CURRENCY,
							label : 'Credit'
						});
						npLines.addField({
							id : 'custpage_np_memo',
							type : serverWidget.FieldType.TEXT,
							label : 'Memo'
						});
						npLines.addField({
							id : 'custpage_np_department',
							type : serverWidget.FieldType.SELECT,
							label : 'Department',
							source : 'department'
						});
						npLines.addField({
							id : 'custpage_np_class',
							type : serverWidget.FieldType.SELECT,
							label : 'Class',
							source : 'classification'
						});
						npLines.addField({
							id : 'custpage_np_location',
							type : serverWidget.FieldType.SELECT,
							label : 'Location',
							source : 'location'
						});
						npLines.addField({
							id : 'custpage_np_area',
							type : serverWidget.FieldType.SELECT,
							label : 'Area',
							source : 'customrecord_cseg_tn_area'
						});

					} else if (context.type == context.UserEventType.VIEW) {
						// view状态下增加打印按钮
						var form = context.form;
						var newRecord = context.newRecord;
						var mpNumber = newRecord.getValue({
							fieldId : 'custrecord_tn_mp_number'
						});
						// 第六步：添加打印按钮
						// alert(mpPrintURL);
						var mpPrintURL = url.resolveScript({
							scriptId : 'customscript_tn_sl_printmp',
							deploymentId : 'customdeploy_tn_sl_printmp',
							params : {
								mpNum : mpNumber
							}
						});
						form.addButton({
							id : 'custpage_tn_print',
							label : 'Print',
							functionName : '(function(){ window.open("'
									+ mpPrintURL + '") })'
						});
					} 
// else if (context.type == context.UserEventType.EDIT) {
// redirect.toSuitelet({
// scriptId : 'customscript_tn_sl_mergegl',
// deploymentId : 'customdeploy_tn_sl_mergegl'
// });
//
// }
				} catch (e) {
					log.debug({
						title : 'beforeLoad',
						details : e
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
			function afterSubmit(context) {
				// 第二步：保存后创建相应单据
				try {
					// log.debug({
					// title : 'afterSubmit'
					// });
					if (context.type == context.UserEventType.CREATE ||context.type == context.UserEventType.EDIT) {
						var newRecord = context.newRecord;
						var entity = newRecord.getValue({
							fieldId : 'custrecord_tn_payment_entity'
						});
						var date = newRecord.getValue({
							fieldId : 'custrecord_tn_payment_date'
						});
						var bankAccount = newRecord.getValue({
							fieldId : 'custrecord_tn_payment_bankaccount'
						});
						var currencyBody = newRecord.getValue({
							fieldId : 'custrecord_tn_payment_currency'
						});
						var exchangeRate = newRecord.getValue({
							fieldId : 'custrecord_tn_payment_exrate'
						});
						var memoBody = newRecord.getValue({
							fieldId : 'custrecord_tn_payment_memo'
						});
						var mpNumber = newRecord.getValue({
							fieldId : 'custrecord_tn_mp_number'
						});
						var subsidiary = newRecord.getValue({
							fieldId : 'custrecord_tn_subsidiary'
						});
						// 如果修改，则先删除关联单据
						if (context.type == context.UserEventType.EDIT) {
							search.create(	
									{
										type : search.Type.TRANSACTION,
										filters : [
												[ 'custbody_tn_mpnumber', 'is',
													mpNumber ], 'AND',
												[ 'mainline', 'is', 'T' ]]
									}).run().each(function(result) {
										try {
											var id = record.delete({
												type: result.recordType,
												id: result.id,
											});
										} catch (e) {
											return true;									
										}
								return true;
							});
						}
						

						var vendorId;
						var customerId;
						// 查找关联entity
						var entSearch = search.create({
							type : search.Type.ENTITY,
							filters : [ [ 'internalid', 'anyof', entity ] ]
						});
						entSearch.run().each(function(result) {
							// alert(result.recordType);

							if (result.recordType == 'customer') {
								var cusRecord = record.load({
									type : record.Type.CUSTOMER,
									id : result.id,
									isDynamic : true
								});
								customerId = entity;
								vendorId = cusRecord.getValue({
									fieldId : 'custentity_tn_customer_vendor'
								});
							} else if (result.recordType == 'vendor') {
								var venRecord = record.load({
									type : record.Type.VENDOR,
									id : result.id,
									isDynamic : true
								});
								vendorId = entity;
								customerId = venRecord.getValue({
									fieldId : 'custentity_tn_vendor_customer'
								});
							} else {
								vendorId = entity;
							}
							return true;
						});
						// 1 创建invoice map
						var invCount = newRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_invoice'
						});
						var currencys = [];
						var invoiceList=[];
						// 先查询有几种currency
						for (var i = 0; i < invCount; i++) {
							var currency = newRecord.getSublistValue({
								sublistId : 'custpage_tn_mergepay_invoice',
								fieldId : 'custpage_inv_currency',
								line : i
							});
							if (currencys.indexOf(currency) =='-1') {
								currencys.push(currency);
							}
						}
						for (var i = 0; i < currencys.length; i++) {
							var invoiceMap = {
									currency:currency,
									invoices:{}
							};
							for (var j = 0; j < invCount; j++) {
								var isSelect = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_invoice',
									fieldId : 'custpage_inv_apply',
									line : j
								});
								var recordId = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_invoice',
									fieldId : 'custpage_inv_type',
									line : j
								});
								var payment = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_invoice',
									fieldId : 'custpage_inv_amount',
									line : j
								});
								var currency = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_invoice',
									fieldId : 'custpage_inv_currency',
									line : j
								});
								if (isSelect == 'T' && payment && currency==currencys[i] ) {
									invoiceMap.invoices[recordId]=payment;
								}
							}
							invoiceList.push(invoiceMap);
						}
						// 2 创建credit map
						var creCount = newRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_credit'
						});
						var creditMap = {};

						for (var i = 0; i < creCount; i++) {
							var isSelect = newRecord.getSublistValue({
								sublistId : 'custpage_tn_mergepay_credit',
								fieldId : 'custpage_cre_apply',
								line : i
							});
							var recordId = newRecord.getSublistValue({
								sublistId : 'custpage_tn_mergepay_credit',
								fieldId : 'custpage_cre_type',
								line : i
							});
							var payment = newRecord.getSublistValue({
								sublistId : 'custpage_tn_mergepay_credit',
								fieldId : 'custpage_cre_amount',
								line : i
							});
							if (isSelect == 'T' && payment) {
								creditMap[recordId] = payment;
							}
						}
						// 3 创建ap map
						var apCount = newRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_ap'
						});
						var apMap = {};
						for (var i = 0; i < apCount; i++) {
							var isSelect = newRecord.getSublistValue({
								sublistId : 'custpage_tn_mergepay_ap',
								fieldId : 'custpage_ap_apply',
								line : i
							});
							var recordId = newRecord.getSublistValue({
								sublistId : 'custpage_tn_mergepay_ap',
								fieldId : 'custpage_ap_type',
								line : i
							});
							var payment = newRecord.getSublistValue({
								sublistId : 'custpage_tn_mergepay_ap',
								fieldId : 'custpage_ap_amount',
								line : i
							});
							if (isSelect == 'T' && payment) {
								// if (isSelect == 'T') {
								apMap[recordId] = payment;
							}
						}

						// log.debug({
						// title : 'invoiceMap creditMap',
						// details : JSON.stringify(invoiceMap) + '|'
						// + JSON.stringify(creditMap)
						// });
						// 4、创建CUSTOMER_PAYMENT AR
						for (var i = 0; i < invoiceList.length; i++) {
							var cpayRecord = record.create({
								type : record.Type.CUSTOMER_PAYMENT,
								isDynamic : true,
								defaultValues : {// 注意：要用defaultValues才能达到和界面创建一样的效果，直接赋值customer没用
									entity : customerId
								}
							});
							// 设置mpnumber 作为标记
							cpayRecord.setValue({
								fieldId : 'custbody_tn_mpnumber',
								value : mpNumber
							});
							// 设置date
							cpayRecord.setValue({
								fieldId : 'trandate',
								value : date
							});
							// 设置date
							cpayRecord.setValue({
								fieldId : 'memo',
								value : memoBody
							});
							// 设置currency
							cpayRecord.setValue({
								fieldId : 'currency',
								value : invoiceList.currency
							});
							// 设置exchangerate
							cpayRecord.setValue({
								fieldId : 'exchangerate',
								value : exchangeRate
							});
							// 设置undepfunds
							cpayRecord.setValue({
								fieldId : 'undepfunds',
								value : 'F'
							});
							// 设置account
							cpayRecord.setValue({
								fieldId : 'account',
								value : bankAccount
							});

							// 设置invoice
							var invNum = cpayRecord.getLineCount({
								sublistId : 'apply'
							});
							for (var j = 0; j < invNum; j++) {
								var internalid = cpayRecord.getSublistValue({
									sublistId : 'apply',
									fieldId : 'internalid',
									line : j
								});
								if (invoiceList[i].invoices[internalid]) {
									var payment = invoiceList[i].invoices[internalid];
									// 动态模式下（DynamicRecord）用下面三个步骤设置line上的值
									var lineNum = cpayRecord.selectLine({
										sublistId : 'apply',
										line : j
									});
									cpayRecord.setCurrentSublistValue({
										sublistId : 'apply',
										fieldId : 'apply',
										value : true
									});
									cpayRecord.setCurrentSublistValue({
										sublistId : 'apply',
										fieldId : 'amount',
										value : payment
									});
									cpayRecord.commitLine({
										sublistId : 'apply'
									});
								}
							}
							var id = cpayRecord.save();
						}
						
							
							// 设置credit
// if (JSON.stringify(creditMap) != '{}') {
// var creNum = cpayRecord.getLineCount({
// sublistId : 'credit'
// });
// for (var i = 0; i < creNum; i++) {
// var internalid = cpayRecord
// .getSublistValue({
// sublistId : 'credit',
// fieldId : 'internalid',
// line : i
// });
// if (creditMap[internalid]) {
// var payment = creditMap[internalid];
// // 动态模式下（DynamicRecord）用下面三个步骤设置line上的值
// var lineNum = cpayRecord.selectLine({
// sublistId : 'credit',
// line : i
// });
// cpayRecord.setCurrentSublistValue({
// sublistId : 'credit',
// fieldId : 'apply',
// value : true
// });
// cpayRecord.setCurrentSublistValue({
// sublistId : 'credit',
// fieldId : 'amount',
// value : payment
// });
// cpayRecord.commitLine({
// sublistId : 'credit'
// });
// }
// }
// }
							
// else if (JSON.stringify(creditMap) != '{}') {
// // 如果只有credit则生成Customer Refund（客户退款）
// var creRecord = record.create({
// type : record.Type.CUSTOMER_REFUND,
// isDynamic : true,
// defaultValues : {// 注意：要用defaultValues才能达到和界面创建一样的效果，直接赋值customer没用
// entity : customerId
// }
// });
// // 设置mpnumber 作为标记
// creRecord.setValue({
// fieldId : 'custbody_tn_mpnumber',
// value : mpNumber
// });
// // 设置date
// creRecord.setValue({
// fieldId : 'trandate',
// value : date
// });
// // 设置date
// creRecord.setValue({
// fieldId : 'memo',
// value : memoBody
// });
// // 设置currency
// creRecord.setValue({
// fieldId : 'currency',
// value : currencyBody
// });
// // 设置exchangerate
// creRecord.setValue({
// fieldId : 'exchangerate',
// value : exchangeRate
// });
// // 设置account
// creRecord.setValue({
// fieldId : 'account',
// value : bankAccount
// });
// // 设置paymentmethod 默认cash
// creRecord.setValue({
// fieldId : 'paymentmethod',
// value : '2'
// });
//
// var creNum = creRecord.getLineCount({
// sublistId : 'apply'
// });
// for (var i = 0; i < creNum; i++) {
// var internalid = creRecord.getSublistValue({
// sublistId : 'apply',
// fieldId : 'internalid',
// line : i
// });
// if (creditMap[internalid]) {
// var payment = creditMap[internalid];
// // 动态模式下（DynamicRecord）用下面三个步骤设置line上的值
// var lineNum = creRecord.selectLine({
// sublistId : 'apply',
// line : i
// });
// creRecord.setCurrentSublistValue({
// sublistId : 'apply',
// fieldId : 'apply',
// value : true
// });
// creRecord.setCurrentSublistValue({
// sublistId : 'apply',
// fieldId : 'amount',
// value : payment
// });
// creRecord.commitLine({
// sublistId : 'apply'
// });
// }
// }
// creRecord.save();
// }

						// 5、创建bill payment
						if (JSON.stringify(apMap) != '{}') {
							var vpayRecord = record.create({
								type : record.Type.VENDOR_PAYMENT,
								isDynamic : true,
								defaultValues : {// 注意：要用defaultValues才能达到和界面创建一样的效果，直接赋值customer没用
									entity : vendorId
								}
							});
							// 设置mpnumber 作为标记
							vpayRecord.setValue({
								fieldId : 'custbody_tn_mpnumber',
								value : mpNumber
							});
							// 设置date
							vpayRecord.setValue({
								fieldId : 'trandate',
								value : date
							});
							vpayRecord.setValue({
								fieldId : 'memo',
								value : memoBody
							});
							// 设置currency
							vpayRecord.setValue({
								fieldId : 'currency',
								value : currencyBody
							});
							// 设置exchangerate
							vpayRecord.setValue({
								fieldId : 'exchangerate',
								value : exchangeRate
							});
							// 设置account
							vpayRecord.setValue({
								fieldId : 'account',
								value : bankAccount
							});
							var apNum = vpayRecord.getLineCount({
								sublistId : 'apply'
							});
							for (var i = 0; i < apNum; i++) {
								var internalid = vpayRecord.getSublistValue({
									sublistId : 'apply',
									fieldId : 'internalid',
									line : i
								});
								var due = vpayRecord.getSublistValue({
									sublistId : 'apply',
									fieldId : 'due',
									line : i
								});
								if (apMap[internalid]) {
									var payment = apMap[internalid];
									// 动态模式下（DynamicRecord）用下面三个步骤设置line上的值
									var lineNum = vpayRecord.selectLine({
										sublistId : 'apply',
										line : i
									});
									vpayRecord.setCurrentSublistValue({
										sublistId : 'apply',
										fieldId : 'apply',
										value : true
									});
									vpayRecord.setCurrentSublistValue({
										sublistId : 'apply',
										fieldId : 'amount',
										value : payment
									});
									vpayRecord.commitLine({
										sublistId : 'apply'
									});

									// 保存之后设置bill上的 Amount Remaining字段
									var dueAmt = due - payment;
									var billRecord = record.load({
										type : record.Type.VENDOR_BILL,
										id : internalid
									});
									billRecord.setValue({
										fieldId : 'custbody_tn_amtrem',
										value : dueAmt
									});
									billRecord.save();
								}
							}
							vpayRecord.save();

						}

						// 6、未立项创建JE
						var npCount = newRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_np'
						});
						if (npCount > 0) {
							var jeRecord = record.create({
								type : record.Type.JOURNAL_ENTRY,
								isDynamic : true
							});
							// 设置subsidiary 先设置成1
							jeRecord.setValue({
								fieldId : 'subsidiary',
								value : subsidiary
							});
							// 设置mpnumber 作为标记
							jeRecord.setValue({
								fieldId : 'custbody_tn_mpnumber',
								value : mpNumber
							});
							// 设置date
							jeRecord.setValue({
								fieldId : 'trandate',
								value : date
							});
							jeRecord.setValue({
								fieldId : 'memo',
								value : memoBody
							});
							// 设置currency
							jeRecord.setValue({
								fieldId : 'currency',
								value : currencyBody
							});
							// 设置exchangerate
							jeRecord.setValue({
								fieldId : 'exchangerate',
								value : exchangeRate
							});
							// 设置approvalstatus
							jeRecord.setValue({
								fieldId : 'approvalstatus',
								value : '2'
							});
							var sumDebit = 0;
							var sumCredit = 0;
							for (var i = 0; i < npCount; i++) {
								var account = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_np',
									fieldId : 'custpage_np_account',
									line : i
								});
								var debit = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_np',
									fieldId : 'custpage_np_debit',
									line : i
								});
								var credit = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_np',
									fieldId : 'custpage_np_credit',
									line : i
								});
								var memo = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_np',
									fieldId : 'custpage_np_memo',
									line : i
								});

								var department = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_np',
									fieldId : 'custpage_np_department',
									line : i
								});
								var classification = newRecord
										.getSublistValue({
											sublistId : 'custpage_tn_mergepay_np',
											fieldId : 'custpage_np_class',
											line : i
										});
								var location = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_np',
									fieldId : 'custpage_np_location',
									line : i
								});
								var area = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_np',
									fieldId : 'custpage_np_area',
									line : i
								});

								var line = jeRecord.selectNewLine({
									sublistId : 'line'
								});
								// account
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'account',
									value : account
								});
								if (debit) {
// log.debug({
// title : 'debit',
// details : debit
// });
									// debit
									line.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'debit',
										value : debit
									});
									line.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'credit',
										value : 0
									});
									credit = 0;
								}
								if (credit) {
// log.debug({
// title : 'credit',
// details : credit
// });
									// credit
									line.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'credit',
										value : credit
									});
									line.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'debit',
										value : 0
									});
									debit = 0;
								}
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'memo',
									value : memo
								});
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'department',
									value : department
								});
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'class',
									value : classification
								});
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'location',
									value : location
								});
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'custcol_cseg_tn_area',
									value : area
								});
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'entity',
									value : entity
								});
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'currency',
									value : currencyBody
								});
								line.commitLine({
									sublistId : 'line'
								});
								sumDebit += parseFloat(debit);
								sumCredit += parseFloat(credit);
								
							}
							var bankAmount = sumDebit - sumCredit;
// log.debug({
// title : 'line',
// details : line
// });
							if (bankAmount != 0) {
								var line1 = jeRecord.selectNewLine({
									sublistId : 'line'
								});
								// account
								line1.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'account',
									value : bankAccount
								});
								// currency
								line1.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'currency',
									value : currencyBody
								});
								line1.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'memo',
									value : memoBody
								});
								line1.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'entity',
									value : entity
								});
								// 配平数据
								if (bankAmount > 0) {
									line1.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'credit',
										value : bankAmount
									});
									line1.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'debit',
										value : 0
									});
								} else {
// log.debug({
// title : 'bankAmount',
// details : bankAmount*-1
// });
									line1.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'credit',
										value : 0
									});
									line1.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'debit',
										value : bankAmount*-1
									});
								}
								line1.commitLine({
									sublistId : 'line'
								});
							}
// log.debug({
// title : 'line1',
// details : line1
// });
							var id = jeRecord.save();
							// log.debug({
							// title : 'id',
							// details : id
							// });
						}

						// 7、Others
						var otCount = newRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_ot'
						});
						var hasSelect = false;
						for (var i = 0; i < otCount; i++) {
							var isSelect = newRecord.getSublistValue({
								sublistId : 'custpage_tn_mergepay_ot',
								fieldId : 'custpage_ot_apply',
								line : i
							});
							var payment = newRecord.getSublistValue({
								sublistId : 'custpage_tn_mergepay_ot',
								fieldId : 'custpage_ot_payment',
								line : i
							});
							if (isSelect = 'T' && payment) {
								hasSelect = true;
							}
						}
						if (otCount > 0 && hasSelect) {
							var jeRecord = record.create({
								type : record.Type.JOURNAL_ENTRY,
								isDynamic : true
							});
							// 设置subsidiary
							jeRecord.setValue({
								fieldId : 'subsidiary',
								value : subsidiary
							});
							// 设置mpnumber 作为标记
							jeRecord.setValue({
								fieldId : 'custbody_tn_mpnumber',
								value : mpNumber
							});
							// 设置date
							jeRecord.setValue({
								fieldId : 'trandate',
								value : date
							});
							jeRecord.setValue({
								fieldId : 'memo',
								value : memoBody
							});
							// 设置currency
							jeRecord.setValue({
								fieldId : 'currency',
								value : currencyBody
							});
							// 设置exchangerate
							jeRecord.setValue({
								fieldId : 'exchangerate',
								value : exchangeRate
							});
							// 设置approvalstatus
							jeRecord.setValue({
								fieldId : 'approvalstatus',
								value : '2'
							});
							for (var i = 0; i < otCount; i++) {
								var isSelect = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_ot',
									fieldId : 'custpage_ot_apply',
									line : i
								});
								var account = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_ot',
									fieldId : 'custpage_ot_account',
									line : i
								});
								var balancecurr = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_ot',
									fieldId : 'custpage_ot_balancecurr',
									line : i
								});

								var payment = newRecord.getSublistValue({
									sublistId : 'custpage_tn_mergepay_ot',
									fieldId : 'custpage_ot_payment',
									line : i
								});
								if (isSelect == 'T' && payment) {
									var line = jeRecord.selectNewLine({
										sublistId : 'line'
									});
									// account
									line.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'account',
										value : account
									});
									// currency
									line.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'currency',
										value : currencyBody
									});
									line.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'memo',
										value : memoBody
									});
									line.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'entity',
										value : entity
									});
									if (balancecurr > 0) {
										line.setCurrentSublistValue({
											sublistId : 'line',
											fieldId : 'credit',
											value : payment
										});
										line.setCurrentSublistValue({
											sublistId : 'line',
											fieldId : 'debit',
											value : 0
										});
									}
									if (balancecurr < 0) {
										line.setCurrentSublistValue({
											sublistId : 'line',
											fieldId : 'credit',
											value : 0
										});
										line.setCurrentSublistValue({
											sublistId : 'line',
											fieldId : 'debit',
											value : payment
										});
									}
									line.commitLine({
										sublistId : 'line'
									});

									// 生成银行line
									var lineBak = jeRecord.selectNewLine({
										sublistId : 'line'
									});
									// account
									lineBak.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'account',
										value : bankAccount
									});
									// currency
									lineBak.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'currency',
										value : currencyBody
									});
									lineBak.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'memo',
										value : memoBody
									});
									lineBak.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'entity',
										value : entity
									});
									if (balancecurr > 0) {
										lineBak.setCurrentSublistValue({
											sublistId : 'line',
											fieldId : 'debit',
											value : payment
										});
										lineBak.setCurrentSublistValue({
											sublistId : 'line',
											fieldId : 'credit',
											value : 0
										});
									}
									if (balancecurr < 0) {
										lineBak.setCurrentSublistValue({
											sublistId : 'line',
											fieldId : 'credit',
											value : payment
										});
										lineBak.setCurrentSublistValue({
											sublistId : 'line',
											fieldId : 'debit',
											value : 0
										});
									}
									lineBak.commitLine({
										sublistId : 'line'
									});
								}

							}
							var id = jeRecord.save();
							// log.debug({
							// title : 'id',
							// details : id
							// });

						}
						// 8、生成最後的jE
						var paymentAmount = newRecord.getValue({
							fieldId : 'custrecord_tn_payment_amount'
						});
						var paymentBalance = newRecord.getValue({
							fieldId : 'custrecord_tn_payment_balance'
						});
						var balanceAccount = newRecord.getValue({
							fieldId : 'custrecord_tn_payment_balanceaccount'
						});
						if (paymentBalance == '0' || !balanceAccount
								|| !paymentAmount) {
							return;
						}
						var recType;
						// 查找关联entity
						var entSearch = search.create({
							type : search.Type.ENTITY,
							filters : [ [ 'internalid', 'anyof', entity ] ]
						});
						entSearch.run().each(function(result) {
							recType = result.recordType;
							return true;
						});
						if (paymentBalance != paymentAmount) {
							var jeRecord = record.create({
								type : record.Type.JOURNAL_ENTRY,
								isDynamic : true
							});
							// 设置subsidiary
							jeRecord.setValue({
								fieldId : 'subsidiary',
								value : subsidiary
							});
							// 设置mpnumber 作为标记
							jeRecord.setValue({
								fieldId : 'custbody_tn_mpnumber',
								value : mpNumber
							});
							// 设置date
							jeRecord.setValue({
								fieldId : 'trandate',
								value : date
							});
							jeRecord.setValue({
								fieldId : 'memo',
								value : memoBody
							});
							// 设置currency
							jeRecord.setValue({
								fieldId : 'currency',
								value : currencyBody
							});
							// 设置exchangerate
							jeRecord.setValue({
								fieldId : 'exchangerate',
								value : exchangeRate
							});
							// 设置approvalstatus
							jeRecord.setValue({
								fieldId : 'approvalstatus',
								value : '2'
							});
							var line = jeRecord.selectNewLine({
								sublistId : 'line'
							});
							// account
							line.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'account',
								value : balanceAccount
							});
							// currency
							line.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'currency',
								value : currencyBody
							});
							line.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'memo',
								value : memoBody
							});
							line.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'entity',
								value : entity
							});
							if ((recType != 'customer' && paymentAmount > 0)
									|| (recType == 'customer' && paymentAmount < 0)) {
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'credit',
									value : 0
								});
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'debit',
									value : paymentBalance
								});
							} else if ((recType != 'customer' && paymentAmount < 0)
									|| (recType == 'customer' && paymentAmount > 0)) {
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'credit',
									value : paymentBalance
								});
								line.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'debit',
									value : 0
								});
							}
							line.commitLine({
								sublistId : 'line'
							});

							// 銀行科目
							var lineBank = jeRecord.selectNewLine({
								sublistId : 'line'
							});
							// account
							lineBank.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'account',
								value : bankAccount
							});
							// currency
							lineBank.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'currency',
								value : currencyBody
							});
							lineBank.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'memo',
								value : memoBody
							});
							lineBank.setCurrentSublistValue({
								sublistId : 'line',
								fieldId : 'entity',
								value : entity
							});
							if ((recType != 'customer' && paymentAmount > 0)
									|| (recType == 'customer' && paymentAmount < 0)) {
								lineBank.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'credit',
									value : paymentBalance
								});
								lineBank.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'debit',
									value : 0
								});
							} else if ((recType != 'customer' && paymentAmount < 0)
									|| (recType == 'customer' && paymentAmount > 0)) {
								lineBank.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'credit',
									value : 0
								});
								lineBank.setCurrentSublistValue({
									sublistId : 'line',
									fieldId : 'debit',
									value : paymentBalance
								});
							}
							lineBank.commitLine({
								sublistId : 'line'
							});
							var balanceid = lineBank.save();
							// log.debug({
							// title : 'balanceid',
							// details : balanceid
							// });
						}
					}
// if (context.type == context.UserEventType.EDIT) {
// var errorObj = error.create({
// name :'系统提示',
// message : '请不要修改合并付款！'
// });
// throw errorObj;
// }
					// 删除的时候删除所有相关单据
					if (context.type == context.UserEventType.DELETE) {
// log.debug({
// title : 'delete',
// details : 'delete'
// });
						var newRecord = context.newRecord;
						var mpNumber = newRecord.getValue({
							fieldId : 'custrecord_tn_mp_number'
						});
						search.create(
								{
									type : search.Type.TRANSACTION,
									filters : [
											[ 'custbody_tn_mpnumber', 'is',
												mpNumber ], 'AND',
											[ 'mainline', 'is', 'T' ]]
								}).run().each(function(result) {
									try {
										var id = record.delete({
											type: result.recordType,
											id: result.id,
										});
									} catch (e) {
										return true;									
									}
							return true;
						});
					}
				} catch (e) {
					log.debug({
						title : 'afterSubmit',
						details : e
					});
					var errorObj = error.create({
						name : e.name,
						message : e.message
					});
					throw errorObj;
				}

			}

			function returnFloat(value) {
				var value = Math.round(parseFloat(value) * 100) / 100;
				var xsd = value.toString().split(".");
				if (xsd.length == 1) {
					value = value.toString() + ".00";
					return value;
				}
				if (xsd.length > 1) {
					if (xsd[1].length < 2) {
						value = value.toString() + "0";
					}
					return value;
				}
			}
			
			
			// edit状态下设置sublist
			function setSublist(search,newRecord) {
				var vendorId;
				var customerId;
				var entity = newRecord.getValue({
					fieldId : 'custrecord_tn_payment_entity'
				});
				var currency = newRecord.getValue({
					fieldId : 'custrecord_tn_payment_currency'
				});
				var exchangeRate = newRecord.getValue({
					fieldId : 'custrecord_tn_payment_exrate'
				});
				var fromyear = newRecord.getText({
					fieldId : 'custrecord_tn_fromyear'
				});
				var toyear = newRecord.getText({
					fieldId : 'custrecord_tn_toyear'
				});
				// 查找关联entity
				var entSearch = search.create({
					type : search.Type.ENTITY,
					filters : [ [ 'internalid', 'anyof', entity ] ]
				});
				entSearch.run().each(function(result) {
					// alert(result.recordType);
					if (result.recordType == 'customer') {
						var cusRecord = record.load({
							type : record.Type.CUSTOMER,
							id : result.id,
							isDynamic : true
						});
						customerId = entity;
						vendorId = cusRecord.getValue({
							fieldId : 'custentity_tn_customer_vendor'
						});
					} else if (result.recordType == 'vendor') {
						var venRecord = record.load({
							type : record.Type.VENDOR,
							id : result.id,
							isDynamic : true
						});
						vendorId = entity;
						customerId = venRecord.getValue({
							fieldId : 'custentity_tn_vendor_customer'
						});
					} else {
						vendorId = entity;
					}
					return true;
				});
				var invoiceList = form.getSublist({
					id : 'custpage_tn_mergepay_invoice'
				});
				var creditList = form.getSublist({
					id : 'custpage_tn_mergepay_credit'
				});
				var apList = form.getSublist({
					id : 'custpage_tn_mergepay_ap'
				});
				var otList = form.getSublist({
					id : 'custpage_tn_mergepay_ot'
				});
				// 2.1设置invoice sublist
				// alert(currency);
				var lineInv=0;
				if (customerId) {
					var invSearch = search
							.create({
								type : search.Type.INVOICE,
								filters : [
										[ 'entity', 'anyof', customerId ],
										'AND',
										[ 'currency', 'anyof', currency ],
										'AND',
										[ 'mainline', 'is', 'T' ] ],
								columns : [ 'trandate', 'tranid',
										'total', 'amountremaining',
										'currency', 'status' ]
							});
					invSearch.run().each(function(result) {
						var status = result.getValue({
							name : 'status'
						});
						if (status != 'open') {
							return true;
						}
						var objRecord = record.load({
							type : record.Type.INVOICE,
							id : result.id
						});
						var total = objRecord.getValue({
							fieldId : 'total'
						});
						var amountRemainingTotal = objRecord.getValue({
							fieldId : 'amountremaining'
						});
						var tranDate = result.getValue({
							name : invSearch.columns[0].name
						});
						var tranId = result.getValue({
							name : invSearch.columns[1].name
						});
						var currency = result.getText({
							name : invSearch.columns[4].name
						});
						// alert(currency);
						// 填充sublist
// var line = newRecord.selectNewLine({
// sublistId : 'custpage_tn_mergepay_invoice'
// });
						
						// date
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_invoice',
// fieldId : 'custpage_inv_date',
// value : tranDate,
// });
						invoiceList.setSublistValue({
						    id : 'custpage_inv_date',
						    line : lineInv,
						    value : tranDate
						});
						// type
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_invoice',
// fieldId : 'custpage_inv_type',
// value : result.id
// });
						invoiceList.setSublistValue({
						    id : 'custpage_inv_type',
						    line : lineInv,
						    value : result.id
						});
						// tranId
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_invoice',
// fieldId : 'custpage_inv_refnum',
// value : tranId
// });
						invoiceList.setSublistValue({
						    id : 'custpage_inv_refnum',
						    line : lineInv,
						    value : tranId
						});
						// total
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_invoice',
// fieldId : 'custpage_inv_total',
// value : total
// });
						invoiceList.setSublistValue({
						    id : 'custpage_inv_total',
						    line : lineInv,
						    value : total
						});
						// amountRemainingTotal
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_invoice',
// fieldId : 'custpage_inv_due',
// value : amountRemainingTotal
// });
						invoiceList.setSublistValue({
						    id : 'custpage_inv_due',
						    line : lineInv,
						    value : amountRemainingTotal
						});
						// currency
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_invoice',
// fieldId : 'custpage_inv_currency',
// value : currency
// });
						invoiceList.setSublistValue({
						    id : 'custpage_inv_currency',
						    line : lineInv,
						    value : currency
						});
// line.commitLine({
// sublistId : 'custpage_tn_mergepay_invoice'
// });
						lineInv++;
						return true;
					});
					// 2.2设置credit sublist
					var lineCre=0;
					var creSearch = search
							.create({
								type : search.Type.CREDIT_MEMO,
								filters : [
										[ 'entity', 'anyof', customerId ],
										'AND',
										[ 'currency', 'anyof', currency ],
										'AND',
										[ 'mainline', 'is', 'T' ] ],
								columns : [ 'trandate', 'tranid',
										'total', 'amountremaining',
										'currency', 'status' ]
							});
					creSearch.run().each(function(result) {
						var status = result.getValue({
							name : 'status'
						});
						if (status != 'open') {
							return true;
						}
						var objRecord = record.load({
							type : record.Type.CREDIT_MEMO,
							id : result.id
						});
						var total = objRecord.getValue({
							fieldId : 'total'
						});
						var amountRemainingTotal = objRecord.getValue({
							fieldId : 'amountremaining'
						});
						var tranDate = result.getValue({
							name : creSearch.columns[0].name
						});
						var tranId = result.getValue({
							name : creSearch.columns[1].name
						});
						var currency = result.getText({
							name : creSearch.columns[4].name
						});
						// alert(currency);
						// 填充sublist
// var line = currentRecord.selectNewLine({
// sublistId : 'custpage_tn_mergepay_credit'
// });
						// date
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_credit',
// fieldId : 'custpage_cre_date',
// value : tranDate,
// });
						creditList.setSublistValue({
						    id : 'custpage_cre_date',
						    line : lineCre,
						    value : tranDate
						});
						// type
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_credit',
// fieldId : 'custpage_cre_type',
// value : result.id
// });
						creditList.setSublistValue({
						    id : 'custpage_cre_type',
						    line : lineCre,
						    value : result.id
						});
						// tranId
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_credit',
// fieldId : 'custpage_cre_refnum',
// value : tranId
// });

						creditList.setSublistValue({
						    id : 'custpage_cre_refnum',
						    line : lineCre,
						    value :tranId
						});
						// total
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_credit',
// fieldId : 'custpage_cre_total',
// value : total
// });
						creditList.setSublistValue({
						    id : 'custpage_cre_total',
						    line : lineCre,
						    value :total
						});
						// amountRemainingTotal
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_credit',
// fieldId : 'custpage_cre_due',
// value : amountRemainingTotal
// });
						creditList.setSublistValue({
						    id : 'custpage_cre_due',
						    line : lineCre,
						    value :amountRemainingTotal
						});
						// currency
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_credit',
// fieldId : 'custpage_cre_currency',
// value : currency
// });
						creditList.setSublistValue({
						    id : 'custpage_cre_currency',
						    line : lineCre,
						    value :currency
						});
// line.commitLine({
// sublistId : 'custpage_tn_mergepay_credit'
// });
						lineCre++;
						return true;
					});
				}

				// 3.设置AP sublist
				// 得到bill
				// alert(vendorId);
				if (vendorId) {
					var initFilter = [ [ 'entity', 'anyof', vendorId ],
							'AND', [ 'currency', 'anyof', currency ],
							'AND', [ 'mainline', 'is', 'T' ] ];
					var initColums = [ 'trandate', 'tranid', 'total',
							'amountremaining', 'currency', 'status' ];
					// alert(initFilter);
					// 带出VENDOR_BILL
					var billSearch = search.create({
						type : search.Type.VENDOR_BILL,
						filters : initFilter,
						columns : initColums
					});
					setAPSublist(billSearch, apList, record);
					// 得到bill credit
					var billCreSearch = search.create({
						type : search.Type.VENDOR_CREDIT,
						filters : initFilter,
						columns : initColums
					});
					setAPSublist(billCreSearch, currentRecord, record);
				}
				if (!vendorId && !customerId) {
					// 得到EXPENSE_REPORT
					var billCreSearch = search.create({
						type : search.Type.EXPENSE_REPORT,
						filters : initFilter,
						columns : initColums
					});
					setAPSublist(billCreSearch, currentRecord, record);
				}

				// 4.设置otherstab
				if (fromyear && toyear) {
					var yearNum = parseInt(toyear) - parseInt(fromyear);
					var yearBegin = new Date();
					var yearEnd = new Date();
					for (var i = 0; i < yearNum + 1; i++) {
						var year = parseInt(toyear) - i;
						var initFilterO = [ [ 'entity', 'anyof', entity ] ];
						yearBegin.setFullYear(year, 0, 1);
						yearEnd.setFullYear(year, 11, 31);
						var yearBeginV = format.format({
							value : yearBegin,
							type : format.Type.DATE
						});
						var yearEndV = format.format({
							value : yearEnd,
							type : format.Type.DATE
						});
						initFilterO.push('AND', [ 'trandate', 'within',
								yearBeginV, yearEndV ]);
						setOthersTab(entity, search, initFilterO, year,
								currentRecord, exchangeRate);
					}
				}

			
			}
			function setAPSublist(search, apList, record) {
				var lineAp=0;
				search
						.run()
						.each(
								function(result) {
									var status = result.getValue({
										name : 'status'
									});
									if (result.recordType == 'vendorbill'
											&& status != 'open'
											&& status != 'Approved') {
										return true;
									}
									var objRecord = record.load({
										type : result.recordType,
										id : result.id
									});
									var total = objRecord.getValue({
										fieldId : 'total'
									});
									var amtrem = objRecord.getValue({
										fieldId : 'custbody_tn_amtrem'
									});
									var amountRemFeildId;
									if (result.recordType == 'vendorbill') {
										if (amtrem) {
											amountRemFeildId = 'custbody_tn_amtrem';
										} else {
											amountRemFeildId = 'total';
										}
									} else {
										amountRemFeildId = 'unapplied';

									}
									var amountRemainingTotal = objRecord
											.getValue({
												fieldId : amountRemFeildId
											});
									var tranDate = result.getValue({
										name : search.columns[0].name
									});
									var tranId = result.getValue({
										name : search.columns[1].name
									});
									var currency = result.getText({
										name : search.columns[4].name
									});
									// var amountRemainingTotal =
									// result.getValue({
									// name : 'amountremaining'
									// });
									// alert(currency);
									// 填充sublist
// var line = currentRecord.selectNewLine({
// sublistId : 'custpage_tn_mergepay_ap'
// });
									// date
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_ap',
// fieldId : 'custpage_ap_date',
// value : tranDate,
// });
									apList.setSublistValue({
									    id : 'custpage_ap_date',
									    line : lineAp,
									    value :tranDate
									});
									// type
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_ap',
// fieldId : 'custpage_ap_type',
// value : result.id
// });
									apList.setSublistValue({
									    id : 'custpage_ap_type',
									    line : lineAp,
									    value :result.id
									});
									// tranId
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_ap',
// fieldId : 'custpage_ap_refnum',
// value : tranId
// });
									apList.setSublistValue({
									    id : 'custpage_ap_refnum',
									    line : lineAp,
									    value :tranId
									});
									// total
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_ap',
// fieldId : 'custpage_ap_total',
// value : total
// });
									apList.setSublistValue({
									    id : 'custpage_ap_total',
									    line : lineAp,
									    value :total
									});
									// amountRemainingTotal
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_ap',
// fieldId : 'custpage_ap_due',
// value : amountRemainingTotal
// });
									apList.setSublistValue({
									    id : 'custpage_ap_due',
									    line : lineAp,
									    value :amountRemainingTotal
									});
									// currency
// line.setCurrentSublistValue({
// sublistId : 'custpage_tn_mergepay_ap',
// fieldId : 'custpage_ap_currency',
// value : currency
// });
									apList.setSublistValue({
									    id : 'custpage_ap_currency',
									    line : lineAp,
									    value :currency
									});
// line.commitLine({
// sublistId : 'custpage_tn_mergepay_ap'
// });
									lineAp++;
									return true;
								});
			}
			return {
				beforeLoad : beforeLoad,
				afterSubmit : afterSubmit
			};

		});