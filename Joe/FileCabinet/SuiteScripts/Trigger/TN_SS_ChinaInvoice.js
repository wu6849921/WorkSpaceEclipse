/*******************************************************************************
 * File Name : TN_SS_ChinaInvoice.js Description : Use to present the
 * InvoicePendingPrint status and the function of merge&split Company : Trigger
 * Networks Created By : Zed Wang Created On : 08/13/2014
 ******************************************************************************/
var invoiceClass = {
	createNew : function() {
		var invoice = {};
		invoice.startDate = new Object();
		invoice.endDate = new Object();
		invoice.invoiceStatus = new Object();
		invoice.customer = new Object();
		invoice.invoiceType = new Object();
		invoice.custGetResult = function() {
			try {
				var result = new Array();
				var filters = new Array();
				if (invoice.invoiceStatus != 'tn_null')
					filters.push(new nlobjSearchFilter(
							'custrecord_tn_invp_invoicestatus', null, 'is',
							invoice.invoiceStatus));
				if (invoice.customer != 'tn_null')
					filters.push(new nlobjSearchFilter(
							'custrecord_tn_invp_customername', null, 'is',
							invoice.customer));
				if (invoice.invoiceType != 'tn_null')
					filters.push(new nlobjSearchFilter(
							'custrecord_tn_invp_invoicetype', null, 'is',
							invoice.invoiceType));
				if (invoice.startDate != 'tn_null'
						&& invoice.endDate != 'tn_null')
					filters.push(new nlobjSearchFilter(
							'custrecord_tn_invp_date', null, 'within',
							invoice.startDate, invoice.endDate));
				var columns = new Array();
				columns[0] = new nlobjSearchColumn('internalid');
				columns[1] = new nlobjSearchColumn('custrecord_tn_invp_date');
				columns[2] = new nlobjSearchColumn(
						'custrecord_tn_invp_invoicetype');
				columns[3] = new nlobjSearchColumn(
						'custrecord_tn_invp_invoicestatus');
				columns[4] = new nlobjSearchColumn(
						'custrecord_tn_invp_sourcecustomer');
				columns[5] = new nlobjSearchColumn('custrecord_tn_amount');
				columns[6] = new nlobjSearchColumn('custrecord_tn_amounttax');
				columns[7] = new nlobjSearchColumn(
						'custrecord_tn_mergespliteinvpid');
				var sc = nlapiCreateSearch(
						'customrecord_tn_invoicependingprint', filters, columns);
				var rts = sc.runSearch();
				for (var i = 0; i < 200; i++) {
					var SearchResults = rts
							.getResults(i * 1000, (i + 1) * 1000);
					if (SearchResults != null) {
						for ( var k in SearchResults) {
							var json = {};
							json.invpid = SearchResults[k].getValue(columns[0]);
							json.date = SearchResults[k].getValue(columns[1]);
							json.invoicetype = SearchResults[k]
									.getValue(columns[2]);
							json.invoicestatus = SearchResults[k]
									.getValue(columns[3]);
							json.customer = SearchResults[k]
									.getValue(columns[4]);
							json.amount = SearchResults[k].getValue(columns[5]);
							json.amounttax = SearchResults[k]
									.getValue(columns[6]);
							json.mergesplitinvpid = SearchResults[k]
									.getValue(columns[7]);
							result.push(json);
						}
					}
					if (SearchResults.length < 1000) {
						break;
					}
				}
				return result;
			} catch (ex) {
				nlapiLogExecution('debug', 'custGetResult', ex);
			}
		}
		return invoice;
	}
}
function getInvoice(startDate, endDate, invoicestatus, invoiceType, customer) {
	try {
		var invoice = invoiceClass.createNew();
		invoice.startDate = startDate;
		invoice.endDate = endDate;
		invoice.invoiceStatus = invoicestatus;
		invoice.invoiceType = invoiceType;
		invoice.customer = customer;
		var result = invoice.custGetResult();
		return result;
	} catch (ex) {
		nlapiLogExecution('debug', 'getInvoice', ex);
	}
}

// 主程序入口函数
function chinaInvoice(request, response) {
	try {
		if (request.getMethod() == 'GET') {
			var newform = nlapiCreateForm('发票管理');
			newform.addFieldGroup('custpage_filters', '筛选条件');
			var _startDateField = newform.addField('custpage_startdate',
					'date', '开始日期', null, 'custpage_filters');
			var _endDateField = newform.addField('custpage_enddate', 'date',
					'结束日期', null, 'custpage_filters');
			var _invoiceStatusField = newform.addField(
					'custpage_invoicestatus', 'select', '发票状态',
					'customlist_tn_invp_invoicestatus', 'custpage_filters');
			_invoiceStatusField.setDefaultValue(1);
			var _customerField = newform.addField('custpage_customer',
					'select', '客户名称', 'customer', 'custpage_filters');
			var _invoiceTypeField = newform.addField('custpage_invoicetype',
					'select', '发票类型', 'customlist_tn_invp_invoicetype',
					'custpage_filters');
			newform.addSubmitButton('提交');
			var sublist = newform
					.addSubList('custpage_sublist', 'list', '发票管理');
			newform.setScript('customscript_tn_sschinainvoice');
			sublist.addButton('sbl_btn_merge', '合并', 'invoiceMerge');
			sublist.addField('sbl_checkbox', 'checkbox', '');
			sublist.addField('sbl_sourceinvp', 'select', '来源发票号',
					'customrecord_tn_invoicependingprint').setDisplayType(
					'inline');
			sublist.addField('sbl_invpdate', 'date', '发票日期').setDisplayType(
					'inline');
			sublist.addField('sbl_invoicetype', 'select', '发票类型',
					'customlist_tn_invp_invoicetype').setDisplayType('inline');
			sublist.addField('sbl_invoicestatus', 'select', '发票状态',
					'customlist_tn_invp_invoicestatus')
					.setDisplayType('inline');
			sublist.addField('sbl_customer', 'select', '客户名称', 'customer')
					.setDisplayType('inline');
			sublist.addField('sbl_amount', 'currency', '金额（不含税）')
					.setDisplayType('inline');
			// sublist.addField('subsidiaryamount', 'currency',
			// '金额（含税）').setDisplayType('inline');
			sublist.addField('sbl_amounttax', 'currency', '税额').setDisplayType(
					'inline');
			sublist.addField('sbl_mergesplitinvpid', 'select', '拆分/合并对应发票号',
					'customrecord_tn_invoicependingprint').setDisplayType(
					'inline');
			var result = getInvoice('tn_null', 'tn_null', 1, 'tn_null',
					'tn_null');
			var j = 1;
			for (i = 0; i < result.length; i++) {
				sublist.setLineItemValue('sbl_sourceinvp', j, result[i].invpid);
				sublist.setLineItemValue('sbl_invpdate', j, result[i].date);
				sublist.setLineItemValue('sbl_invoicetype', j,
						result[i].invoicetype);
				sublist.setLineItemValue('sbl_invoicestatus', j,
						result[i].invoicestatus);
				sublist.setLineItemValue('sbl_customer', j, result[i].customer);
				sublist.setLineItemValue('sbl_amount', j, result[i].amount);
				sublist.setLineItemValue('sbl_amounttax', j,
						result[i].amounttax);
				sublist.setLineItemValue('sbl_mergesplitinvpid', j,
						result[i].mergesplitinvpid);
				j++;
			}
			response.writePage(newform);
		} else if (request.getMethod() == 'POST') {
			var newform = nlapiCreateForm('发票管理');
			newform.addFieldGroup('custpage_filters', '筛选条件');
			var _startDateField = newform.addField('custpage_startdate',
					'date', '开始日期', null, 'custpage_filters');
			var _endDateField = newform.addField('custpage_enddate', 'date',
					'结束日期', null, 'custpage_filters');
			var _invoiceStatusField = newform.addField(
					'custpage_invoicestatus', 'select', '发票状态',
					'customlist_tn_invp_invoicestatus', 'custpage_filters');
			var _customerField = newform.addField('custpage_customer',
					'select', '客户名称', 'customer', 'custpage_filters');
			var _invoiceTypeField = newform.addField('custpage_invoicetype',
					'select', '发票类型', 'customlist_tn_invp_invoicetype',
					'custpage_filters');
			var _startDateValue = request.getParameter('custpage_startdate');
			var _endDateValue = request.getParameter('custpage_enddate');
			var _invoiceStatusValue = request
					.getParameter('custpage_invoicestatus');
			var _customerValue = request.getParameter('custpage_customer');
			var _invoiceTypeValue = request
					.getParameter('custpage_invoicetype');
			_startDateField.setDefaultValue(_startDateValue);
			_endDateField.setDefaultValue(_endDateValue);
			_invoiceStatusField.setDefaultValue(_invoiceStatusValue);
			_customerField.setDefaultValue(_customerValue);
			_invoiceTypeField.setDefaultValue(_invoiceTypeValue);
			_startDateValue = converseNull(_startDateValue);
			_endDateValue = converseNull(_endDateValue);
			_invoiceStatusValue = converseNull(_invoiceStatusValue);
			_customerValue = converseNull(_customerValue);
			_invoiceTypeValue = converseNull(_invoiceTypeValue);
			newform.addSubmitButton('提交');
			var sublist = newform
					.addSubList('custpage_sublist', 'list', '发票管理');
			newform.setScript('customscript_tn_sschinainvoice');
			sublist.addButton('sbl_btn_merge', '合并', 'invoiceMerge');
			sublist.addField('sbl_checkbox', 'checkbox', '');
			sublist.addField('sbl_sourceinvp', 'select', '来源发票号',
					'customrecord_tn_invoicependingprint').setDisplayType(
					'inline');
			sublist.addField('sbl_invpdate', 'date', '发票日期').setDisplayType(
					'inline');
			sublist.addField('sbl_invoicetype', 'select', '发票类型',
					'customlist_tn_invp_invoicetype').setDisplayType('inline');
			sublist.addField('sbl_invoicestatus', 'select', '发票状态',
					'customlist_tn_invp_invoicestatus')
					.setDisplayType('inline');
			sublist.addField('sbl_customer', 'select', '客户名称', 'customer')
					.setDisplayType('inline');
			sublist.addField('sbl_amount', 'currency', '金额（不含税）')
					.setDisplayType('inline');
			// sublist.addField('subsidiaryamount', 'currency',
			// '金额（含税）').setDisplayType('inline');
			sublist.addField('sbl_amounttax', 'currency', '税额').setDisplayType(
					'inline');
			sublist.addField('sbl_mergesplitinvpid', 'select', '拆分/合并对应发票号',
					'customrecord_tn_invoicependingprint').setDisplayType(
					'inline');
			var result = getInvoice(_startDateValue, _endDateValue,
					_invoiceStatusValue, _invoiceTypeValue, _customerValue);
			var j = 1;
			for (i = 0; i < result.length; i++) {
				sublist.setLineItemValue('sbl_sourceinvp', j, result[i].invpid);
				sublist.setLineItemValue('sbl_invpdate', j, result[i].date);
				sublist.setLineItemValue('sbl_invoicetype', j,
						result[i].invoicetype);
				sublist.setLineItemValue('sbl_invoicestatus', j,
						result[i].invoicestatus);
				sublist.setLineItemValue('sbl_customer', j, result[i].customer);
				sublist.setLineItemValue('sbl_amount', j, result[i].amount);
				sublist.setLineItemValue('sbl_amounttax', j,
						result[i].amounttax);
				sublist.setLineItemValue('sbl_mergesplitinvpid', j,
						result[i].mergesplitinvpid);
				j++;
			}
			response.writePage(newform);
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'chinaInvoie', ex);
	}
}
function converseNull(value) {
	if (value == '' || value == null) {
		return 'tn_null';
	} else
		return value;
}
function invoiceMerge() {
	try {
		var invps = new Array();
		var count = nlapiGetLineItemCount('custpage_sublist') + 1;
		var x = '__exist';
		var _amountSum = 0;
		var _taxamountSum = 0;
		for (var i = 1; i < count; i++) {
			var _checked = nlapiGetLineItemValue('custpage_sublist',
					'sbl_checkbox', i);
			if (_checked == 'T') {
				var _status = nlapiGetLineItemValue('custpage_sublist',
						'sbl_invoicestatus', i);
				if (_status.toString() != 1) {
					alert('只有发票状态为“未打印”的发票，才可以进行合并');
					return;
				}
				if (x == '__exist') {
					x = nlapiGetLineItemValue('custpage_sublist',
							'sbl_customer', i);
				} else {
					if (x != nlapiGetLineItemValue('custpage_sublist',
							'sbl_customer', i)) {
						alert('只有客户相同才可以进行合并');
						return;
					}
				}
				var invp = nlapiGetLineItemValue('custpage_sublist',
						'sbl_sourceinvp', i);
				_amountSum += parseFloat(nlapiGetLineItemValue(
						'custpage_sublist', 'sbl_amount', i));
				_taxamountSum += parseFloat(nlapiGetLineItemValue(
						'custpage_sublist', 'sbl_amounttax', i));
				invps.push(invp);
			}
		}
		if (invps.length < 1) {
			alert('请选择要合并的发票');
			return;
		}
		var para = '&invps=' + invps + '&amountsum=' + _amountSum
				+ '&taxamountsum=' + _taxamountSum;
		var scriptID = 'customscript_tn_ssinvoicemergehandler';
		var deployID = 'customdeploy_tn_ssinvoicemergehandler';
		var myurl = nlapiResolveURL('SUITELET', scriptID, deployID, false)
				+ para;
		window.location.reload();
		window.open(myurl, '_blank');
	} catch (ex) {
		alert(ex);
	}
}
function invoiceMergeHandler(request, response) {
	try {
		var invpsArr = request.getParameterValues('invps');
		var _amountSum = parseFloat(request.getParameter('amountsum'));
		var _taxamountSum = parseFloat(request.getParameter('taxamountsum'));
		var invps = invpsArr[0].split(',');
		if (invps.length > 1) {
			var _newrec = nlapiCopyRecord(
					'customrecord_tn_invoicependingprint',
					invps[(invps.length - 1)]);
			_newrec.setFieldValue('custrecord_tn_invp_sourceinvoice', null);
			_newrec.setFieldValue('custrecord_tn_invp_sourcecreditmemo', null);
			_newrec.setFieldValue('custrecord_tn_invp_invoicestatus', 1);
			_newrec.setFieldValue('custrecord_tn_amount', _amountSum);
			_newrec.setFieldValue('custrecord_tn_amounttax', _taxamountSum);
			_newrec.setFieldValue('custrecord_tn_invpp_grossamountsum',
					(_amountSum + _taxamountSum));
			_newrec.setFieldValues('custrecord_tn_invp_mergesource', invps);
			var _newid = nlapiSubmitRecord(_newrec);
			createMergedInvoiceDetailLine(invps, _newid);
			for (var i = 0; i < invps.length; i++) {
				var _rec = nlapiLoadRecord(
						'customrecord_tn_invoicependingprint', invps[i]);
				_rec.setFieldValue('custrecord_tn_invp_invoicestatus', 2);
				_rec.setFieldValue('custrecord_tn_mergespliteinvpid', _newid);
				nlapiSubmitRecord(_rec);
			}
			nlapiSetRedirectURL('RECORD',
					'customrecord_tn_invoicependingprint', _newid);
		} else if (invps.length == 1) {
			nlapiSetRedirectURL('RECORD',
					'customrecord_tn_invoicependingprint', invps[0]);
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'invoiceMergeHandler', ex);
	}
}
function createMergedInvoiceDetailLine(invps, _newid) {
	try {
		var filters = [ new nlobjSearchFilter(
				'custrecord_tn_invpps_detailline', null, 'anyof', invps) ];
		var rts = nlapiSearchRecord('customrecord_tn_invoicependingprintsub',
				null, filters, null);
		if (rts != null) {
			for (var i = 0; i < rts.length; i++) {
				var id = rts[i].getId();
				var _rec = nlapiCopyRecord(
						'customrecord_tn_invoicependingprintsub', id);
				_rec.setFieldValue('custrecord_tn_invpps_detailline', _newid);
				nlapiSubmitRecord(_rec);
			}
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'createMergedInvoiceDetailLine', ex);
	}
}