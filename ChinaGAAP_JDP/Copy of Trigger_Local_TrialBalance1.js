/**
 * Module Description: Profit & Loss Version Date Author Remarks 1.00 23 Oct
 * 2014 Winson.Chen
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.trialbalance1 = function() {
};
trigger.local.trialbalance1.prototype = {

	writeTrialBalanceToPDF1 : function(subsidiaryid, periodid, period, response) {
		var filter = [];
		var filters = [];
		var incomeAccountsFilters = [];

		if (subsidiaryid && subsidiaryid != '-1') {
			filter[filter.length] = new nlobjSearchFilter('subsidiary', null,
					'anyof', subsidiaryid);
			filters[filters.length] = new nlobjSearchFilter('subsidiary', null,
					'anyof', subsidiaryid);
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'subsidiary', null, 'anyof', subsidiaryid);

		}
		if (periodid && period) {
			var accPeriod = nlapiLoadRecord('accountingperiod', periodid);
			var accPeriodStartDate = accPeriod.getFieldValue('startdate'); // format
			// of
			// date
			// M/D/YYYY,
			// no
			// leading
			// zeros

			var firstSlash = accPeriodStartDate.indexOf('/');
			var lastSlash = accPeriodStartDate.lastIndexOf('/');

			var startMonth = accPeriodStartDate.substring(0, firstSlash);
			var startDay = accPeriodStartDate.substring(firstSlash + 1,
					lastSlash);
			var startYear = accPeriodStartDate.substring(lastSlash + 1);

			var periodtime = String.format("{0}/{1}/{2}", startMonth, startDay,
					startYear);
			var beginningOfYearPeriod = String.format("{0}/{1}/{2}", 1, 1,
					startYear);

			filter[filter.length] = new nlobjSearchFilter('postingperiod',
					null, 'abs', [ periodid ]);// 期中条件

			filters[filters.length] = new nlobjSearchFilter('startdate',
					'accountingperiod', 'before', periodtime);// 期初条件（非income）
			filters[filters.length] = new nlobjSearchFilter('type', 'account',
					'noneof', [ 'Income', 'Cost of Goods Sold', 'Expense',
							'Other Income', 'Other Expense',
							'Deferred Revenue', 'Deferred Expense' ]);

			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'onorafter',
					beginningOfYearPeriod);// 期初条件（income）
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'before', periodtime);
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'type', 'account', 'anyof', [ 'Income',
							'Cost of Goods Sold', 'Expense', 'Other Income',
							'Other Expense', 'Deferred Revenue',
							'Deferred Expense' ]);

		}

		var incomeBeginMap = rule.GetLedgerRecordsForIncomeAccounts(// 查询NSAccount的数据
		incomeAccountsFilters); // starting from
		// new year
		// opening
		// Balance

		var biginMap = rule.GetLedgerRecordsByAllOfNumber(filters); // Opening
		// Balance,
		// 期初数据
		// 查询NSAccount的数据
		var currentMap = rule.GetLedgerRecordsByAllOfNumber(filter); // Occuring
		// amount
		// this
		// period,
		// 本月数据
		// 查询NSAccount的数据

		var m = 0;
		var cnnumber;
		var cnname;

		var incomeAccountsBeginBalance = []; // at the beginning of the
		// period for income (P&L)
		// accounts
		var beginbalance = []; // At the beginning of the period, 期初
		var currentbalance = []; // In the current period, 本期
		var begbalance = 0;
		var endbalance = 0;
		var xml = template.GetTrialBalanceXMLHead; // form header

		xml += template.GetTrialBalanceContentHeadXML(period, 1);

		// joe 查询customrecord_trigger_mapping_cn_coa 得到相对应的参数NSAccountId,
		// NSAccountNumName,CNAccountNum + ' ' + CNAccountName
		var mapMapping = rule.GetMappingCNCOAParam();

		// 查询所有的nsaccountId
		var accountIdList = rule.getAccountIdLists();

		for (var i = 0; i < accountIdList.length; i++) {
			var sum = Object.create(trigger.local.entity.TrialBalance);
			sum.name = mapMapping.GetValue(accountIdList[i])[1];// CNnum+name
			incomeAccountsBeginBalance = incomeBeginMap
					.GetValue(accountIdList[i]).name;
			beginbalance = biginMap.GetValue(accountIdList[i]).name;
			currentbalance = currentMap.GetValue(accountIdList[i]).name;

			// if (incomeAccountsMap.Contains(cnnumber)) {
			// 如果是收支科目，则期初为从年初到上个月月末的值
			if (incomeAccountsBeginBalance) {
				sum.beginCredit = parseFloat(incomeAccountsBeginBalance[1]);
				sum.beginDebit = parseFloat(incomeAccountsBeginBalance[0]);
			} else if (beginbalance) {
				sum.beginCredit = parseFloat(beginbalance[1]);
				sum.beginDebit = parseFloat(beginbalance[0]);
			} else {
				sum.beginCredit = 0;
				sum.beginDebit = 0;
			}
			// } else if (beginbalance) {
			// sum.beginCredit = parseFloat(beginbalance[0]);
			// sum.beginDebit = parseFloat(beginbalance[1]);
			// }

			if (currentbalance) {
				sum.currentCredit = parseFloat(currentbalance[0]);
				sum.currentDebit = parseFloat(currentbalance[1]);
			}

			if (!sum.beginCredit) {
				sum.beginCredit = 0;
			}
			if (!sum.beginDebit) {
				sum.beginDebit = 0;
			}
			if (!sum.currentCredit) {
				sum.currentCredit = 0;
			}
			if (!sum.currentDebit) {
				sum.currentDebit = 0;
			}
			begbalance = parseFloat(sum.beginDebit)
					- parseFloat(sum.beginCredit);
			// 期初只记录期初借贷的差值
			if (begbalance > 0) {
				sum.beginDebit = begbalance;
				sum.beginCredit = 0;
			} else {
				sum.beginDebit = 0;
				sum.beginCredit = begbalance * -1;
			}

			// 期末记录期初和本期发生的差值
			endbalance = begbalance + parseFloat(sum.currentDebit)
					- parseFloat(sum.currentCredit);

			if (endbalance > 0) {
				sum.endDebit = endbalance;
				sum.endCredit = 0;
			} else {
				sum.endDebit = 0;
				sum.endCredit = endbalance * -1;
			}

			sum.beginCredit = com.formatCurrency(sum.beginCredit);
			sum.beginDebit = com.formatCurrency(sum.beginDebit);
			sum.currentCredit = com.formatCurrency(sum.currentCredit);
			sum.currentDebit = com.formatCurrency(sum.currentDebit);
			sum.endCredit = com.formatCurrency(sum.endCredit);
			sum.endDebit = com.formatCurrency(sum.endDebit);

			xml += template.GetTrialBalanceXML(sum);

			if (m == 45) {
				xml += template.GetTrialBalanceXMLFoot;
				xml += template.GetFooterXML;
				xml += template.GetTrialBalanceContentHeadXML(period, 2);
			}
			m++;
		}
		xml += template.GetTrialBalanceXMLFoot;
		xml += template.GetFooterXML;
		xml += template.GetPDFClosingTagXML;

		var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
		filename = "Trial Ledger-" + filename + ".PDF";
		new trigger.local.write().WriteXMLToPDF(response, xml, filename);
	},

	/**
	 * Prepare map with P&L (income accounts) numbers as key of the map.
	 * 
	 * @returns {trigger.local.HashTable}
	 */
	prepareMapOfIncomeAccountNumbers : function() {
		var incomeAccountsSearchResults = nlapiSearchRecord(
				'customrecord_trigger_cn_coa',
				'customsearch_trigger_coa_incomeaccounts', null, null);// bring
		// P&L
		// account
		// numbers
		// (income
		// accounts)
		var cnnAcntNumber;
		var map = new trigger.local.HashTable(); // map to hold numbers of
		// P&L accounts
		if (incomeAccountsSearchResults
				&& incomeAccountsSearchResults.length > 0) {
			for (var j = 0; j < incomeAccountsSearchResults.length; j++) {
				cnnAcntNumber = incomeAccountsSearchResults[j].getValue('name',
						null, null);
				nlapiLogExecution('DEBUG', 'prepare Map Of P&L accountnumbers',
						'account number = ' + cnnAcntNumber);
				map.Add(cnnAcntNumber, null);
			}
		}
		return map;
	}
};