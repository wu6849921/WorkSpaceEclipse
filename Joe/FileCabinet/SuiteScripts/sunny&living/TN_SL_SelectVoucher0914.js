/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([ 'N/ui/serverWidget', 'N/search' ], function(ui, search) {
	function onRequest(context) {
		if (context.request.method === 'GET') {
			var parameters = context.request.parameters;
			var form = initForm(ui);
			// 初始化数据
			var startDate = parameters.startDate;
			var endDate = parameters.endDate;
			// if (startDate && endDate) {
			//
			// }
			context.response.writePage(form);
		} else {
			// submit时刷新页面
			var parameters = context.request.parameters;
			var recordId = parameters.custpage_record;
			var startDate = parameters.custpage_startdate;
			var endDate = parameters.custpage_enddate;
			var period = parameters.custpage_period;
			var form = initForm(ui);
			var param = {
				form : form,
				recordId : recordId,
				startDate : startDate,
				endDate : endDate,
				period : period
			};
			form = searchData(param);
			context.response.writePage(form);
		}

	}

	function initForm(ui) {
		var form = ui.createForm({
			title : 'Voucher'
		});
		form.clientScriptFileId = 2872;
		form.addSubmitButton({
			label : 'Search'
		});
		form.addButton({
			id : 'custpage_print',
			label : 'Print',
			functionName : 'printForm()'
		});
		// By Record
		var byRecord = form.addFieldGroup({
			id : 'custpage_byrecord',
			label : 'BY Record'
		});
		var recordId = form.addField({
			id : 'custpage_record',
			type : ui.FieldType.SELECT,
			label : 'Transaction',
			source : 'transaction',
			container : 'custpage_byrecord'
		});
		// By Date
		var byDate = form.addFieldGroup({
			id : 'custpage_bydate',
			label : 'BY Date'
		});
		var startDate = form.addField({
			id : 'custpage_startdate',
			type : ui.FieldType.DATE,
			label : 'Start Date',
			container : 'custpage_bydate'
		});
		var endDate = form.addField({
			id : 'custpage_enddate',
			type : ui.FieldType.DATE,
			label : 'End Date',
			container : 'custpage_bydate'
		});
		// BY Period
		var byPeriod = form.addFieldGroup({
			id : 'custpage_byperiod',
			label : 'BY Period'
		});
		var period = form.addField({
			id : 'custpage_period',
			type : ui.FieldType.SELECT,
			label : 'Period',
			source : 'accountingperiod',
			container : 'custpage_byperiod'
		});
		period.defaultValue = 0;
		// 搜索结果
		var glLines = form.addSublist({
			id : 'custpage_gllines',
			type : ui.SublistType.LIST,
			// type : ui.SublistType.STATICLIST,
			label : 'GL lines'
		});
		glLines.addMarkAllButtons();
		glLines.addField({
			id : 'custpage_gl_index',
			type : ui.FieldType.TEXT,
			label : '序号'
		});
		glLines.addField({
			id : 'custpage_gl_select',
			label : 'Select',
			type : ui.FieldType.CHECKBOX
		});
		glLines.addField({
			id : 'custpage_gl_transactionname',
			type : ui.FieldType.SELECT,
			label : 'Transaction',
			source : 'transaction'
		});
		glLines.addField({
			id : 'custpage_gl_account',
			label : 'Account',
			type : ui.FieldType.TEXT
		});
		glLines.addField({
			id : 'custpage_gl_debitamount',
			label : 'Amount (Debit)',
			type : ui.FieldType.CURRENCY
		});
		glLines.addField({
			id : 'custpage_gl_creditamount',
			label : 'Amount (Credit)',
			type : ui.FieldType.CURRENCY
		});
		glLines.addField({
			id : 'custpage_gl_currency',
			label : 'Currency',
			type : ui.FieldType.TEXT
		});
		glLines.addField({
			id : 'custpage_gl_amtfcurrency',
			label : 'Amount(FCurrency)',
			type : ui.FieldType.CURRENCY,
		});
		glLines.addField({
			id : 'custpage_gl_memo',
			label : 'Memo',
			type : ui.FieldType.TEXTAREA
		});
		glLines.addField({
			id : 'custpage_gl_name',
			label : 'Name',
			type : ui.FieldType.TEXT
		});
		glLines.addField({
			id : 'custpage_gl_department',
			label : 'Department',
			type : ui.FieldType.TEXT
		});
		glLines.addField({
			id : 'custpage_gl_location',
			label : 'Location',
			type : ui.FieldType.TEXT
		});
		return form;
	}
	function searchData(param) {
		var form = param.form;
		var recordId = param.recordId;
		var startDate = param.startDate;
		var endDate = param.endDate;
		var period = param.period;
		// 初始化筛选条件
		var recordF = form.getField({
			id : 'custpage_record'
		});
		var startDateF = form.getField({
			id : 'custpage_startdate'
		});
		var endDateF = form.getField({
			id : 'custpage_enddate'
		});
		var periodF = form.getField({
			id : 'custpage_period'
		});
		var glLines = form.getSublist({
			id : 'custpage_gllines'
		});
		recordF.defaultValue = recordId;
		startDateF.defaultValue = startDate;
		endDateF.defaultValue = endDate;
		if (period) {
			periodF.defaultValue = period;
		} else {
			periodF.defaultValue = 0;
		}
		// log.debug({
		// title : 'recordId',
		// details : recordId
		// });
		// 搜索数据
		var initFilter = [ [ 'posting', 'is', 'T' ] ];
		var initColumn = [ 'account', 'debitamount', 'creditamount', 'memo',
				'name', 'department', 'location', 'currency', 'exchangerate',
				'tranid' ];
		if (recordId) {
			initFilter.push('AND', [ 'internalid', 'is', recordId ]);
		} else if (startDate && endDate) {
			initFilter
					.push('AND', [ 'trandate', 'within', startDate, endDate ]);
		} else if (period) {
			initFilter.push('AND', [ 'postingperiod', 'is', period ]);
		} else {
			return form;
		}
		// log.debug({
		// title : 'initFilter',
		// details : initFilter
		// });
		var lineNum = 0;
		// search.create({
		// type : search.Type.TRANSACTION,
		// filters : initFilter,
		// columns : initColumn
		// }).run().each(function(result) {
		var pagedData = search.create({
			type : search.Type.TRANSACTION,
			filters : initFilter,
			columns : initColumn
		}).runPaged({
			pageSize : 1000
		});
		var pageCount = pagedData.pageRanges.length;

		for (var i = 0; i < pageCount; i++) {
			pagedData.fetch({
				index : i
			}).data.forEach(function(result, line) {
				var account = result.getText(result.columns[0]);
				var debitAmount = result.getValue(result.columns[1]);
				var creditAmount = result.getValue(result.columns[2]);
				var memo = result.getValue(result.columns[3]);
				var name = result.getText(result.columns[4]);
				var department = result.getText(result.columns[5]);
				var location = result.getText(result.columns[6]);
				var currency = result.getText(result.columns[7]);
				var exchangeRate = result.getValue(result.columns[8]);
				var tranid = result.getValue(result.columns[9]);
				// 如果amount都为0则不显示
				if (!debitAmount && !creditAmount) {
					return true
				}
				var fCurrencyAmount = 0;
				if (!debitAmount) {
					debitAmount = 0;
					fCurrencyAmount = creditAmount / exchangeRate;
				}
				if (!creditAmount) {
					creditAmount = 0;
					fCurrencyAmount = debitAmount / exchangeRate;
				}
				// 填充sublist
				glLines.setSublistValue({
					id : 'custpage_gl_index',
					value : lineNum + 1 + '',
					line : lineNum
				});
				glLines.setSublistValue({
					id : 'custpage_gl_transactionname',
					value : result.id,
					line : lineNum
				});
				glLines.setSublistValue({
					id : 'custpage_gl_account',
					value : account,
					line : lineNum
				});
				glLines.setSublistValue({
					id : 'custpage_gl_debitamount',
					value : debitAmount,
					line : lineNum
				});
				glLines.setSublistValue({
					id : 'custpage_gl_creditamount',
					value : creditAmount,
					line : lineNum
				});
				glLines.setSublistValue({
					id : 'custpage_gl_currency',
					value : currency,
					line : lineNum
				});
				glLines.setSublistValue({
					id : 'custpage_gl_amtfcurrency',
					value : returnFloat(fCurrencyAmount),
					line : lineNum
				});
				if (memo) {
					glLines.setSublistValue({
						id : 'custpage_gl_memo',
						value : memo,
						line : lineNum
					});
				}
				if (name) {
					glLines.setSublistValue({
						id : 'custpage_gl_name',
						value : name,
						line : lineNum
					});
				}
				if (department) {
					glLines.setSublistValue({
						id : 'custpage_gl_department',
						value : department,
						line : lineNum
					});
				}
				if (location) {
					glLines.setSublistValue({
						id : 'custpage_gl_location',
						value : location,
						line : lineNum
					});
				}
				lineNum++;
				return true;
			});
		}
		return form;
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
		onRequest : onRequest
	};
});