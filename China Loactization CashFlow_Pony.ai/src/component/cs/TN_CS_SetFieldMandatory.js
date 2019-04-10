function postSourcing(type, name) {
	if (type == 'line' && name == 'account') {
		var account = nlapiGetCurrentLineItemValue(type, name);
		if (!account) {
			return;
		}
		var accttype = nlapiLookupField('account', account, 'type');
		// alert(accttype);
		var isBank = accttype === 'Bank';
		var cfiField = nlapiGetLineItemField(type, 'custcol_cseg_cn_cfi',
				nlapiGetCurrentLineItemIndex(type));
		// alert(cfiField.getLable());
		// alert(isBank);
		cfiField.setMandatory(isBank);
	}

}
