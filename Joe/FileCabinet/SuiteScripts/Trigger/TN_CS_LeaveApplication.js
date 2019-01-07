function fieldChanged(type, name) {

	var fromDate = nlapiGetFieldValue('custrecord_tn_from_date');
	var endDate = nlapiGetFieldValue('custrecord_tn_end_date');
	var date1 = nlapiStringToDate(fromDate);
	var date2 = nlapiStringToDate(endDate);
	var totalDay = (date2 - date1) / (1000 * 60 * 60 * 24) + 1;

	if (fromDate != '' && endDate != '') {
		if (name == 'custrecord_tn_from_date'
				|| name == 'custrecord_tn_end_date') {
			nlapiSetFieldValue('custrecord_tn_total_leave', totalDay);
		}
	}

}
