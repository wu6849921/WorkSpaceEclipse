function executeSavedSearch() {
	// 1、加载保存的saved search

	var savedSearchArr = nlapiSearchRecord('transaction',
			'customsearch_tn_joetestsearch');
	for (var i = 0; i < savedSearchArr.length; i++) {
		var searchResult = savedSearchArr[i];
		var subjectStr = searchResult.getValue('date');
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
	// 2、自定义savedsearch
	// var statusArr = [ '1', '2', '3', '4' ];
	// var searchFiltersArr = [
	// new nlobjSearchFilter('totalamount', null, 'greaterthan', 5000),
	// new nlobjSearchFilter('category', 'vendor', 'anyof', statusArr) ];
	// var colArr = [ new nlobjSearchColumn('tranid'),
	// new nlobjSearchColumn('category', 'vendor') ];
	// colArr[0].setSort();
	// var searchResults = nlapiSearchRecord('purchaseorder', null,
	// searchFiltersArr, colArr);
	//
	// for (var i = 0; i < searchResults.length; i++) {
	// var searchResult = searchResults[i];
	// var subjectStr = searchResult.getValue('tranid');
	// var subjectStr2 = searchResult.getValue(colArr[1]);
	// }

}
