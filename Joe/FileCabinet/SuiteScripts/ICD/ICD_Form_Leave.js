function ValidateField(type, name, form) {
	if (name == 'custrecord324') {
		try {
			CalculateUnsedAL();
		} catch (e) {
			nlapiSetFieldValue('custrecord_used_al', 0);
		}

	}
	return true;
}

function CalculateUnsedAL() {
	// this year used al
	var MaxAl = parseFloat(nlapiGetFieldValue('custrecord_max_al'));
	var ALBlance = parseFloat(nlapiGetFieldValue('custrecord365'));
	var LastYearRemain = parseFloat(nlapiGetFieldValue('custrecord368'));
	var UsedAL = MaxAl + LastYearRemain - ALBlance;

	nlapiSetFieldValue('custrecord_used_al', UsedAL.toFixed(1));

}

function fieldchanged(type, name) {
	if (name == 'custrecord325') {
		ot_hours_hideorshow(type, name);
	}
	if (name == 'custrecord_ot_hours') {
		ot_hourToDay(type, name);
	}
	return true;
}

function ot_hours_hideorshow(type, name) {

	var type = nlapiGetFieldValue('custrecord325');
	if (type == '8' || type == '17' || type == '18') {
		nlapiDisableField('custrecord327', true);
		nlapiDisableField('custrecord_ot_hours', false);
		nlapiSetFieldValue('custrecord327', 0);
	} else {
		nlapiDisableField('custrecord327', false);
		nlapiDisableField('custrecord_ot_hours', true);
		nlapiSetFieldValue('custrecord_ot_hours', 0);
	}
}

function ot_hourToDay(type, name) {

	var OT_Hour = nlapiGetFieldValue('custrecord_ot_hours');
	if (OT_Hour == 0 || OT_Hour == null) {
		return true;
	} else {
		nlapiSetFieldValue('custrecord327', parseFloat(OT_Hour) * 0.125);
		return true;
	}
}

function saverecord() {
	// nlapiLogExecution("DEBUG", "00",00);
	if (nlapiGetFieldValue('custrecord327') == 0) {
		alert('Can not save the record, Please enter the leave days.');
		// nlapiLogExecution("DEBUG", "11",11);
		return false;
	}
	// nlapiLogExecution("DEBUG", "22",22);

	if (nlapiGetFieldValue('custrecord325') == 9) {
		var CL = nlapiGetFieldValue('custrecord_leave_cl');
		var days = nlapiGetFieldValue('custrecord327');
		var remain = nlapiGetFieldValue('custrecord_cl_balance');

		if (remain == 0 || remain == null || remain == '') {
			alert('You can not apply  CL, because you do not have OT.');
			return false;
		} else {
			if (remain - days < 0) {
				alert('You apply CL Days shall be smaller than your OT days!');
				return false;
			}

		}
	}

	var employee = nlapiGetFieldValue('custrecord324');
	// joe 改为从后台取数据
	// var emtype = nlapiLookupField('employee', employee,
	// 'custentity_noemployee');
	var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript438',
			'customdeploy1');
	suiteletUrl += '&custparam_param=' + encodeURIComponent(employee);
	suiteletUrl += '&custparam_field='
			+ encodeURIComponent('custentity_noemployee');
	var emtype = nlapiRequestURL(suiteletUrl).getBody();
	if (emtype == 'T') {
		alert('Please select your name in EMPLOYEE field.');
		return false;
	}

	var leavetype = nlapiGetFieldValue('custrecord325');
	try {
		if (leavetype == 20) {
			var startMonth = nlapiStringToDate(
					nlapiGetFieldValue('custrecord326')).getMonth() + 1;
			nlapiLogExecution("DEBUG", "Month", startMonth);
			var months = [ 1, 2, 3, 4 ];
			var v = months.indexOf(startMonth);

			nlapiLogExecution("DEBUG", "v", v);
			if (v == -1) {
				alert('You can not apply AL with start date is after 3/31.');
				return false;
			}
			// joe
			// var AL_lastyear_remaining =
			// parseFloat(nlapiLookupField('employee',
			// nlapiGetFieldValue('custrecord324'),
			// 'custentity_remaining_l_a_l'));

			var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript438',
					'customdeploy1');
			suiteletUrl += '&custparam_param='
					+ encodeURIComponent(nlapiGetFieldValue('custrecord324'));
			suiteletUrl += '&custparam_field='
					+ encodeURIComponent('custentity_remaining_l_a_l');
			var AL_lastyear_remaining = parseFloat(nlapiRequestURL(suiteletUrl)
					.getBody());

			var currentAL = parseFloat(nlapiGetFieldValue('custrecord327'));
			if (currentAL > AL_lastyear_remaining) {
				alert('Your remaining last year AL number is '
						+ AL_lastyear_remaining
						+ ' . You apply AL Days shall be smaller than your remaining AL Balance!');
				return false;
			}

		}
		if (leavetype == 21) {
			var startMonth = nlapiStringToDate(
					nlapiGetFieldValue('custrecord326')).getMonth() + 1;
			nlapiLogExecution("DEBUG", "Month", startMonth);
			var months = [ 1, 2, 3, 4, 5, 6, 7 ];
			var v = months.indexOf(startMonth);

			nlapiLogExecution("DEBUG", "v", v);
			if (v == -1) {
				alert('You can not apply CL with start date is after 6/30.');
				return false;
			}
			// joe
			// var CL_lastyear_remaining =
			// parseFloat(nlapiLookupField('employee',
			// nlapiGetFieldValue('custrecord324'),
			// 'custentity_remaining_last_cl'));

			var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript438',
					'customdeploy1');
			suiteletUrl += '&custparam_param='
					+ encodeURIComponent(nlapiGetFieldValue('custrecord324'));
			suiteletUrl += '&custparam_field='
					+ encodeURIComponent('custentity_remaining_last_cl');
			var CL_lastyear_remaining = parseFloat(nlapiRequestURL(suiteletUrl)
					.getBody());

			var currentCL = parseFloat(nlapiGetFieldValue('custrecord327'));
			if (currentCL > CL_lastyear_remaining) {
				alert('Your remaining last year CL/OT number is '
						+ CL_lastyear_remaining
						+ ' . You apply CL/OT Days shall be smaller than your remaining CL Balance!');
				return false;
			}

		}
	} catch (ex) {
		nlapiLogExecution("DEBUG", 'Debug', ex);
	}

	ot_hourToDay();
	return judgeTrialDate() && checkAlRemain() && checkLeaveStatus();

}

// 20131231 kyle to let next year leave go
function checkAlRemain() {
	var TimeNow = new Date();
	var YearNow = TimeNow.getYear();
	var LeaveYear = nlapiStringToDate(nlapiGetFieldValue('custrecord326'))
			.getYear();

	if (YearNow == LeaveYear) {
		if (nlapiGetFieldValue('custrecord344') == 1) {
			return true;
		} else {
			var Employee = nlapiGetFieldValue('custrecord324');
			var Days = nlapiGetFieldValue('custrecord327');
			// nlapiLogExecution("DEBUG",'Day',Days);
			var leaveType = nlapiGetFieldValue('custrecord325');
			// joe
			// var remainingAL = parseFloat(nlapiLookupField('employee',
			// Employee,
			// 'custentity176'));
			var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript438',
					'customdeploy1');
			suiteletUrl += '&custparam_param=' + encodeURIComponent(Employee);
			suiteletUrl += '&custparam_field='
					+ encodeURIComponent('custentity176');
			var remainingAL = parseFloat(nlapiRequestURL(suiteletUrl).getBody());

			nlapiLogExecution("DEBUG", 'remainAL', remainingAL);

			if ((leaveType == '1') && (Days > remainingAL)) {
				alert('You apply AL Days shall be smaller than your remaining AL Balance!');
				return false;
			} else {
				return true;
			}

		}
	} else
		return true;

}

function JudgeSickDays() {

	var UsedSickDays = nlapiGetFieldValue('custrecord367');
	var Status = nlapiGetFieldValue('custrecord344');
	if (UsedSickDays > '12' && Status == '') {

		var EmployeeName = nlapiGetFieldValue('custrecord324');
		var Body = '<br>'
				+ 'dear Paula,'
				+ '<br>'
				+ '<br>'
				+ EmployeeName
				+ ' want to apply for sick leave, but the used sick leave days of '
				+ EmployeeName + ' has been more than 12 days' + '<br>'
				+ '<br>' + 'Thanks'
		nlapiSendEmail('68092', 'paula.ding@icdsecurity.com',
				'Sick Leave Days', Body);
	}
}

// 20130926 Can not apply for Leave during the probation period
function judgeTrialDate() {
	var startDate = nlapiStringToDate(nlapiGetFieldValue('custrecord326'));
	// alert(startDate);
	var Employee = nlapiGetFieldValue('custrecord324');
	// joe
	// ProbationEndDate = nlapiStringToDate(nlapiLookupField('employee',
	// Employee,
	// 'custentity89'));
	var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript438',
			'customdeploy1');
	suiteletUrl += '&custparam_param=' + encodeURIComponent(Employee);
	suiteletUrl += '&custparam_field=' + encodeURIComponent('custentity89');
	var ProbationEndDate = nlapiStringToDate(nlapiRequestURL(suiteletUrl)
			.getBody());

	// alert(ProbationEndDate);
	// joe
	// var EmSubsidiary = nlapiLookupField('employee', Employee, 'subsidiary');
	var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript438',
			'customdeploy1');
	suiteletUrl += '&custparam_param=' + encodeURIComponent(Employee);
	suiteletUrl += '&custparam_field=' + encodeURIComponent('subsidiary');
	var EmSubsidiary = nlapiStringToDate(nlapiRequestURL(suiteletUrl).getBody());

	// alert(EmSubsidiary);
	var Days = nlapiGetFieldValue('custrecord327');
	var leaveType = nlapiGetFieldValue('custrecord325');
	// joe
	// var remainingAL = nlapiLookupField('employee', Employee,
	// 'custentity176');
	var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript438',
			'customdeploy1');
	suiteletUrl += '&custparam_param=' + encodeURIComponent(Employee);
	suiteletUrl += '&custparam_field=' + encodeURIComponent('custentity176');
	var remainingAL = nlapiRequestURL(suiteletUrl).getBody();

	nlapiLogExecution("DEBUG", "debug", 2);
	if (ProbationEndDate != '' && startDate < ProbationEndDate
			&& leaveType == '1') {

		alert('Can not apply for Leave during the probation period');

		return false;
	} else {
		return true;
	}

}

function checkLeaveStatus() {
	nlapiLogExecution("DEBUG", "type", nlapiGetFieldValue('custrecord325'));
	if (nlapiGetFieldValue('custrecord325') == 1
			|| nlapiGetFieldValue('custrecord325') == 20) {
		var Employee = nlapiGetFieldValue('custrecord324');
		var currentID = nlapiGetRecordId();
		var filter = new Array();
		filter[0] = new nlobjSearchFilter("isinactive", null, "is", "F");
		filter[1] = new nlobjSearchFilter('custrecord344', null, 'is', '2');
		filter[2] = new nlobjSearchFilter('custrecord324', null, 'is', Employee);
		filter[3] = new nlobjSearchFilter('custrecord326', null, 'within',
				'thisyear');
		filter[4] = new nlobjSearchFilter('custrecord325', null, 'anyof', [
				'1', '20' ]);
		var g = new Array();
		g[0] = new nlobjSearchColumn("internalid");
		nlapiLogExecution("DEBUG", "em", Employee);
		var rts = nlapiSearchRecord('customrecord310', null, filter, g);

		// nlapiLogExecution("DEBUG", "pendingLeave",rts[0].getValue(g[0]));
		// nlapiLogExecution("DEBUG", "rec",nlapiGetRecordId());
		if (!rts) {
			return true;
		} else if (rts[0].getValue(g[0]) == nlapiGetRecordId()) {
			return true;
		} else {
			alert('You have pending Annual leave application. Please talk to your line-manager to get the previous application approved.');
			return false;
		}
	}

	return true;

}

function pageInit(type, name) {
	if (type == 'edit' || type == 'copy') {

		var leaveType = nlapiGetFieldValue('custrecord325');
		if (leaveType == '8') {
			nlapiDisableField('custrecord327', true);
			nlapiDisableField('custrecord_ot_hours', false);
			nlapiSetFieldValue('custrecord327', 0);
		} else {
			nlapiDisableField('custrecord327', false);
			nlapiDisableField('custrecord_ot_hours', true);
			nlapiSetFieldValue('custrecord_ot_hours', 0);
		}
	}
}