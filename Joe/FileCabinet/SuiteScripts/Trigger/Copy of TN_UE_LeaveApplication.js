/*******************************************************************************
 * File Name : TN_UE_LeaveApplication.js Description : User event script on
 * Leave Application Company : Trigger Networks for Internal Project Created By :
 * Zed Wang Created On : 09/19/2014
 ******************************************************************************/
var common = new trigger.common();

function afterSubmit(type) {
	try {
		if (type == 'edit') {
			var leaveRecord = nlapiGetNewRecord();
			var leaveType = leaveRecord
					.getFieldValue('custrecord_tn_type_leave');// 请假类型
			var empId = nlapiGetFieldValue('custrecord_tn_staff_name');// 请假员工
			var rec = nlapiLoadRecord('employee', empId);
			var approvedGm = leaveRecord
					.getFieldValue('custrecord_tn_manager_approval');
			var approvedHr = leaveRecord
					.getFieldValue('custrecord_tn_approval_hr');
			// nlapiLogExecution('debug', 'approvedGm', approvedGm);
			// nlapiLogExecution('debug', 'approvedHr', approvedHr);
			// nlapiLogExecution('debug', 'leaveType', leaveType);
			if (approvedGm == 'F' || approvedHr == 'F') {
				return;
			}
			if (leaveType == '1') {// 年假
				var _total = conversNullToZero(rec
						.getFieldValue('custentity_tn_annualleaveintotal'));
				// nlapiLogExecution('debug', '_total', _total);
				var _used = getUsedDays(empId);
				// nlapiLogExecution('debug', '_used', _used);
				var _available = parseFloat(_total) - parseFloat(_used);
				rec.setFieldValue('custentity_tn_annualleaveused', _used);
				rec.setFieldValue('custentity_tn_annualleaveavailable',
						_available);
			} else if (leaveType == '7') {// 补假
				var days = common.convertValToNum(leaveRecord
						.getFieldValue('custrecord_tn_total_leave'));
				var available = common.convertValToNum(rec
						.getFieldValue('custentity_tn_comintotal'));
				available = available - days;
				available = common.convertValToNum(available, 2);
				rec.setFieldValue('custentity_tn_comintotal', available);
			}
			nlapiSubmitRecord(rec);
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'afterSubmit', ex);
		common.sendErrorEmail('zwang@triggerasia.com', 'Trigger Internal',
				'TN_UE_LeaveApplication', 'afterSubmit', ex);
	}
}
function conversNullToZero(value) {
	if (value == '' || value == null || value == ' ') {
		return 0;
	}
	return value;
}
function getUsedDays(_empId) {
	try {
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_tn_staff_name', null,
				'is', _empId);
		filters[1] = new nlobjSearchFilter('custrecord_tn_type_leave', null,
				'is', 1);
		filters[2] = new nlobjSearchFilter('custrecord_tn_manager_approval',
				null, 'is', 'T');
		filters[2] = new nlobjSearchFilter('custrecord_tn_approval_hr', null,
				'is', 'T');
		// filters[3] = new nlobjSearchFilter('custrecord_tn_approval_hr', null,
		// 'is', 'T');
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_tn_end_date');
		columns[1] = new nlobjSearchColumn('custrecord_tn_total_leave');
		var results = nlapiSearchRecord('customrecord_tn_leave_application',
				null, filters, columns);
		var _date = new Date();
		var _year = _date.getFullYear();
		var _used = 0;

		if (results == null) {
			return 0;
		} else {
			for (var i = 0; i < results.length; i++) {
				var date = results[i].getValue(columns[0]);
				var year = getYearInFormate(date);
				var used = results[i].getValue(columns[1]);
				// nlapiLogExecution('debug', 'year', year);
				// nlapiLogExecution('debug', 'year', year);
				// nlapiLogExecution('debug', 'used', used);
				if (_year == year) {
					_used += parseFloat(used);
				}
			}
		}
		return _used;
	} catch (ex) {
		nlapiLogExecution('debug', 'getUsedDays', ex);
	}
}
function getYearInFormate(date) {
	try {
		if (date != null) {
			// var date = nlapiDateToString(date);
			var myDate = nlapiStringToDate(date);
			// var dateArr = date.split('/');
			// var dateArr = myDate.getFullYear();
			var str = myDate.getFullYear();
			return str;
		} else {
			return 0;
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'getYearInFormate', ex);
	}
}