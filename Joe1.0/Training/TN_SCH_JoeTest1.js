function executeSavedSearch(type) {
	var savedSearchArr = nlapiSearchRecord('transaction',
			'customsearch_tn_joetestsearch');
	for (var i = 0; i < savedSearchArr.length; i++) {
		var searchResult = savedSearchArr[i];
		var subjectStr = searchResult.getValue('internalid');
		var tranidStr = searchResult.getValue('tranid');
		var entityStr = searchResult.getValue('entityid');
		var amountStr = searchResult.getValue('totalamount');
		var creditStr = searchResult.getValue('creditlimit', 'vendor');
		var categoryStr = searchResult.getValue('category', 'vendor');
		var phoneStr = searchResult.getValue('altphone', 'vendor');
		nlapiLogExecution(
				'DEBUG',
				'subjectStr&tranidStr&entityStr&amountStr&creditStr&categoryStr&phoneStr',
				subjectStr + '&' + tranidStr + '&' + entityStr + '&'
						+ amountStr + '&' + creditStr + '&' + categoryStr + '&'
						+ phoneStr);

	}
}