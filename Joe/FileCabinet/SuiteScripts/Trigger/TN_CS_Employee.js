/*******************************************************************************
 * File Name : TN_CS_Employee.js Description : Client script on Employee Company :
 * Trigger Networks for Internal Project Created By : Zed Wang Created On :
 * 09/19/2014
 ******************************************************************************/

function pageInit(type) {
	try {
		var _total = conversNullToZero(nlapiGetFieldValue('custentity_tn_annualleaveintotal'));
		var _used = getUsedDays();
		var _available = parseFloat(_total) - parseFloat(_used);
		nlapiSetFieldValue('custentity_tn_annualleaveused', _used, false);
		nlapiSetFieldValue('custentity_tn_annualleaveavailable', _available,
				false);
	} catch (ex) {
		// alert('pageInit() Error:' + ex.getDetails());
		nlapiLogExecution('debug', 'pageInit', ex);
	}
}
function conversNullToZero(value) {
	if (value == '' || value == null || value == ' ') {
		return 0;
	}
	return value;
}
function getUsedDays() {
	try {
		var _empId = nlapiGetRecordId();
		if (!_empId) {
			return 0;
		}
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_tn_staff_name', null,
				'is', _empId);
		filters[1] = new nlobjSearchFilter('custrecord_tn_type_leave', null,
				'is', 1);
		filters[2] = new nlobjSearchFilter('custrecord_tn_manager_approval',
				null, 'is', 'T');
		filters[3] = new nlobjSearchFilter('custrecord_tn_approval_hr', null,
				'is', 'T');
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
				if (_year == year) {
					_used += parseFloat(used);
				}
			}
		}
		return _used;
	} catch (ex) {
		// alert('getUsedDays() Error:' + ex.getDetails());
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
		// alert('getYearInFormate() Error:' + ex.getDetails());
		nlapiLogExecution('debug', 'getYearInFormate', ex);
	}
}
function fieldChanged(type, name, linenum) {
	try {
		if (name == 'custentity_tn_annualleaveintotal') {
			var _total = conversNullToZero(nlapiGetFieldValue('custentity_tn_annualleaveintotal'));
			var _used = getUsedDays();
			var _available = parseFloat(_total) - parseFloat(_used);
			nlapiSetFieldValue('custentity_tn_annualleaveused', _used, false);
			nlapiSetFieldValue('custentity_tn_annualleaveavailable',
					_available, false);
		}
	} catch (ex) {
		// alert('fieldChanged() Error:' + ex.getDetails());
		nlapiLogExecution('debug', 'fieldChange', ex);
	}
}