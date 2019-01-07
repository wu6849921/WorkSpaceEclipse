/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/ui/serverWidget', 'N/record', 'N/redirect', 'N/search', 'N/url',
		'N/format' ],

function(serverWidget, record, redirect, search, url, format) {

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
			var tranDate = newRecord.getValue({
				fieldId : 'custrecord_tn_sumje_trandate'
			});
			var transactionTypeId = newRecord.getValue({
				fieldId : 'custrecord_tn_sumje_jetype'
			});

			var glNum = newRecord.getValue({
				fieldId : 'custrecord_tn_sumje_glnum'
			});
			var transactionIds = newRecord.getValue({
				fieldId : 'custrecord_transactionids'
			});
			// 第一步:创建时生成sublist
			if (context.type == context.UserEventType.CREATE
					|| context.type == context.UserEventType.VIEW) {
				// 创建sublist
				var form = context.form;
				var tab = form.addTab({
					id : 'custpage_tn_mergegl',
					label : 'GL lines(Custom)'
				});
				form.addField({
					id : 'custpage_tn_markall',
					type : serverWidget.FieldType.CHECKBOX,
					label : 'Markall',
					container : 'custpage_tn_mergegl'
				});
				var mergeGLlines = form.addSublist({
					id : 'custpage_tn_mergegl_lines',
					label : 'GL lines',
					tab : 'custpage_tn_mergegl',
					type : serverWidget.SublistType.INLINEEDITOR,
				});
				// mergeGLlines.addMarkAllButtons();
				mergeGLlines.addField({
					id : 'custpage_list_index',
					type : serverWidget.FieldType.TEXT,
					label : '序号'
				});
				mergeGLlines.addField({
					id : 'custpage_list_selected',
					label : 'Select',
					type : serverWidget.FieldType.CHECKBOX
				});
				mergeGLlines.addField({
					id : 'custpage_list_type',
					type : serverWidget.FieldType.TEXT,
					label : 'Origin Type'
				});
				mergeGLlines.addField({
					id : 'custpage_list_num',
					type : serverWidget.FieldType.TEXT,
					label : 'Origin Num'
				});
				mergeGLlines.addField({
					id : 'custpage_list_transactionname',
					type : serverWidget.FieldType.SELECT,
					label : 'Transaction',
					source : 'transaction'
				});
				mergeGLlines.addField({
					id : 'custpage_list_account',
					label : 'Account',
					type : serverWidget.FieldType.SELECT,
					source : 'account'
				});
				mergeGLlines.addField({
					id : 'custpage_list_debitamount',
					label : 'Amount (Debit)',
					type : serverWidget.FieldType.CURRENCY
				});
				mergeGLlines.addField({
					id : 'custpage_list_creditamount',
					label : 'Amount (Credit)',
					type : serverWidget.FieldType.CURRENCY
				});
				mergeGLlines.addField({
					id : 'custpage_list_currency',
					label : 'Currency',
					type : serverWidget.FieldType.SELECT,
					source : 'currency'
				});
				mergeGLlines.addField({
					id : 'custpage_list_amtfcurrency',
					label : 'Amount(FCurrency)',
					type : serverWidget.FieldType.CURRENCY,
				});
				mergeGLlines.addField({
					id : 'custpage_list_memo',
					label : 'Memo',
					type : serverWidget.FieldType.TEXTAREA
				});
				mergeGLlines.addField({
					id : 'custpage_list_name',
					label : 'Name',
					type : serverWidget.FieldType.TEXT
				});
				mergeGLlines.addField({
					id : 'custpage_list_subsidiary',
					label : 'Subsidiary',
					type : serverWidget.FieldType.SELECT,
					source : 'subsidiary'
				});
				mergeGLlines.addField({
					id : 'custpage_list_department',
					label : 'Department',
					type : serverWidget.FieldType.SELECT,
					source : 'department'
				});
				mergeGLlines.addField({
					id : 'custpage_list_class',
					label : 'Class',
					type : serverWidget.FieldType.SELECT,
					source : 'classification'
				});
				mergeGLlines.addField({
					id : 'custpage_list_location',
					label : 'Location',
					type : serverWidget.FieldType.SELECT,
					source : 'location'
				});
				mergeGLlines.addField({
					id : 'custpage_list_area',
					label : 'Area',
					type : serverWidget.FieldType.TEXT
				});

				if (context.type == context.UserEventType.CREATE) {// 创建时不带出任何单据
					return;
				}

				// 第五步：VIEW的下查看已保存的sublist
				// 准备筛选条件
				var addFilters = [];
				var mySearch;

				var initFilter = [ 'custbody_tn_glnum', 'is', glNum ];
				if (transactionTypeId == '12') {
					if (transactionIds.indexOf(',') != -1) {
						transactionIds = transactionIds.split(',');
					}
					initFilter = [ 'internalid', 'is', transactionIds ];

				}
				var initColumn = [ 'transactionnumber', 'account',
						'debitamount', 'creditamount', 'memo', 'name',
						'subsidiary', 'department', 'class', 'location',
						'custcol_cseg_tn_area', 'currency', 'exchangerate',
						'type', 'tranid', 'custbody_tn_mpnumber', 'fxamount' ];

				var savedTranIds = '';// id集合
				// 填充sublist
				mySearch = search.create({
					type : search.Type.TRANSACTION,
					filters : [ initFilter ],
					columns : initColumn
				});
				var line = 0;
				mySearch.run().each(function(result) {
					if (savedTranIds.indexOf(result.id + ',') == -1) {
						savedTranIds += result.id + ',';
					}
					// var tranName = result.getValue(result.columns[0]);
					var account = result.getValue(result.columns[1]);
					var debitAmount = result.getValue(result.columns[2]);
					var creditAmount = result.getValue(result.columns[3]);
					var memo = result.getValue(result.columns[4]);
					var name = result.getText(result.columns[5]);
					var subsidiary = result.getValue(result.columns[6]);
					var department = result.getValue(result.columns[7]);
					var classV = result.getValue(result.columns[8]);
					var location = result.getValue(result.columns[9]);
					var area = result.getText(result.columns[10]);
					var currency = result.getValue(result.columns[11]);
					var exchangeRate = result.getValue(result.columns[12]);
					var type = result.getValue(result.columns[13]);
					var tranId = result.getValue(result.columns[0]);
					var mpNum = result.getValue(result.columns[15]);
					var fCurrencyAmount = result.getValue(result.columns[16]);
					var recordType;
					var recordNum;
					// 如果muNum有值，来源就为mergepayment
					if (mpNum) {
						recordType = 'Merge Payment';
						recordNum = mpNum;
					} else {
						recordType = type;
						recordNum = tranId;
					}
					// 如果amount都为0则不显示
					if (!debitAmount && !creditAmount) {
						return true
					}
					// 计算原币金额
					// var objRecord = record.load({
					// type : result.recordType,
					// id : result.id
					// });
					// // var fCurrencyAmount = objRecord
					// // .getValue({
					// // fieldId : 'total'
					// // });
					// var fCurrencyAmount = objRecord.getValue({
					// fieldId : 'toamount'
					// });
					if (!fCurrencyAmount) {
						if (!debitAmount) {
							debitAmount = 0;
							fCurrencyAmount = creditAmount / exchangeRate;
						}
						if (!creditAmount) {
							creditAmount = 0;
							fCurrencyAmount = debitAmount / exchangeRate;
						}
					}
					// 填充sublist
					mergeGLlines.setSublistValue({
						id : 'custpage_list_index',
						value : line + 1 + '',
						line : line
					});
					mergeGLlines.setSublistValue({
						id : 'custpage_list_type',
						value : recordType,
						line : line
					});
					if (recordNum) {
						mergeGLlines.setSublistValue({
							id : 'custpage_list_num',
							value : recordNum,
							line : line
						});
					}
					mergeGLlines.setSublistValue({
						id : 'custpage_list_transactionname',
						value : result.id,
						line : line
					});
					// mergeGLlines.setSublistValue({
					// id : 'custpage_list_tranname',
					// value : tranName,
					// line : line
					// });
					mergeGLlines.setSublistValue({
						id : 'custpage_list_account',
						value : account,
						line : line
					});
					if (debitAmount) {
						mergeGLlines.setSublistValue({
							id : 'custpage_list_debitamount',
							value : debitAmount,
							line : line
						});
					}
					if (creditAmount) {
						mergeGLlines.setSublistValue({
							id : 'custpage_list_creditamount',
							value : creditAmount,
							line : line
						});
					}
					mergeGLlines.setSublistValue({
						id : 'custpage_list_currency',
						value : currency,
						line : line
					});
					mergeGLlines.setSublistValue({
						id : 'custpage_list_amtfcurrency',
						value : returnFloat(fCurrencyAmount),
						line : line
					});
					if (memo) {
						mergeGLlines.setSublistValue({
							id : 'custpage_list_memo',
							value : memo,
							line : line
						});
					}
					if (name) {
						mergeGLlines.setSublistValue({
							id : 'custpage_list_name',
							value : name,
							line : line
						});
					}
					mergeGLlines.setSublistValue({
						id : 'custpage_list_subsidiary',
						value : subsidiary,
						line : line
					});
					if (department) {
						mergeGLlines.setSublistValue({
							id : 'custpage_list_department',
							value : department,
							line : line
						});
					}
					if (classV) {
						mergeGLlines.setSublistValue({
							id : 'custpage_list_class',
							value : classV,
							line : line
						});
					}
					if (location) {
						mergeGLlines.setSublistValue({
							id : 'custpage_list_location',
							value : location,
							line : line
						});
					}
					if (area) {
						mergeGLlines.setSublistValue({
							id : 'custpage_list_area',
							value : area,
							line : line
						});
					}
					line++;
					return true;
				});

				// 第六步：添加打印按钮
				if (savedTranIds.indexOf(',') != -1) {
					savedTranIds = savedTranIds.substring(0,
							savedTranIds.length - 1);
				}
				var tranDate = format.format({
					value : tranDate,
					type : format.Type.DATE
				});

				var mergeGLURL = url.resolveScript({
					scriptId : 'customscript_tn_sl_mergegl',
					deploymentId : 'customdeploy_tn_sl_mergegl',
					params : {
						savedTranIds : savedTranIds,
						date : tranDate,
						glNum : glNum
					}
				});
				form.addButton({
					id : 'custpage_tn_print',
					label : 'Print',
					functionName : '(function(){ window.open("' + mergeGLURL
							+ '") })'
				});
			}
			// else {
			// var mergeGLURL = url.resolveScript({
			// scriptId : 'customscript_tn_sl_mergegl',
			// deploymentId : 'customdeploy_tn_sl_mergegl',
			// });
			// redirect.toSuitelet({
			// scriptId : 'customscript_tn_sl_mergegl',
			// deploymentId : 'customdeploy_tn_sl_mergegl'
			// });
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
		// 第四步：保存后更新相应单据的状态及生成该单据的GLNum
		try {
			// log.debug({
			// title : 'afterSubmit'
			// });
			if (context.type == context.UserEventType.CREATE) {
				var newRecord = context.newRecord;
				var lineCount = newRecord.getLineCount({
					sublistId : 'custpage_tn_mergegl_lines'
				});
				var transactionTypeId = newRecord.getValue({
					fieldId : 'custrecord_tn_sumje_jetype'
				});
				var glNum = newRecord.getValue({
					fieldId : 'custrecord_tn_sumje_glnum'
				});
				var tranIds = [];
				// log.debug({
				// title : 'lineCount',
				// details : lineCount
				// });
				for (var i = 0; i < lineCount; i++) {
					var isSelect = newRecord.getSublistValue({
						sublistId : 'custpage_tn_mergegl_lines',
						fieldId : 'custpage_list_selected',
						line : i
					});
					var recordId = newRecord.getSublistValue({
						sublistId : 'custpage_tn_mergegl_lines',
						fieldId : 'custpage_list_transactionname',
						line : i
					});
					if (isSelect == 'T' && tranIds.indexOf(recordId) == -1) {
						tranIds.push(recordId);
					}
				}
				// log.debug({
				// title : 'tranIds',
				// details : tranIds.length
				// });
				// 更新record的posting字段为true
				if (transactionTypeId && transactionTypeId != '12') {
					// for (var i = 0; i < tranIds.length; i++) {
					var tranId = tranIds[i];
					var tranSearch = search.create({
						type : search.Type.TRANSACTION,
						filters : [ [ 'internalid', 'is', tranIds ], 'AND',
								[ 'mainline', 'is', 'T' ] ]
					// , 'AND',
					// [ 'mainline', 'is', 'T' ], 'AND',
					// [ 'taxline', 'is', 'F' ]
					});
					tranSearch.run().each(function(result) {
						// log.debug({
						// title : result.recordType
						// });
						var id = record.submitFields({
							type : result.recordType,
							id : result.id,
							values : {
								'custbody_tn_glnum' : glNum
							}
						});
						// var tranRec = record.load({
						// type : result.recordType,
						// id : result.id
						// });
						// var toamount = tranRec.getValue({
						// fieldId : 'toamount',
						// });
						// log.debug({
						// title : 'toamount',
						// details : toamount
						// });
						// tranRec.setValue({
						// fieldId : 'custbody_tn_glnum',
						// value : glNum
						// });
						switch (result.recordType) {
						case 'vendorbill':
						case 'invoice':
						case 'journalentry':
						case 'expensereport':
							var id = record.submitFields({
								type : result.recordType,
								id : result.id,
								values : {
									'approvalstatus' : '2'
								}
							});
							// tranRec.setValue({
							// fieldId : 'approvalstatus',
							// value : '2'
							// });
							break;
						default:
							break;
						}
						// tranRec.save();
						return true;
					});
					// }
				}
			}
			if (context.type == context.UserEventType.DELETE) {
				var newRecord = context.newRecord;
				var glNum = newRecord.getValue({
					fieldId : 'custrecord_tn_sumje_glnum'
				});
				search.create(
						{
							type : search.Type.TRANSACTION,
							filters : [ [ 'custbody_tn_glnum', 'is', glNum ],
									'AND', [ 'mainline', 'is', 'T' ] ]
						}).run().each(function(result) {
					// try {
					// var id = record.delete({
					// type: result.recordType,
					// id: result.id,
					// });
					// } catch(e) {
					// return true;
					// }
					try {
						var id = record.submitFields({
							type : result.recordType,
							id : result.id,
							values : {
								custbody_tn_glnum : ''
							}
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
	return {
		beforeLoad : beforeLoad,
		afterSubmit : afterSubmit
	};

});