/**
 * Module Description: Profit & Loss Version Date Author Remarks 1.00 23 Oct
 * 2014 Winson.Chen
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.trialbalance = function() {
};
trigger.local.trialbalance.prototype = {

	writeTrialBalanceToPDF : function(subsidiaryid, periodid, period, response) {
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
					null, 'abs', [ periodid ]);
			// nlapiLogExecution('debug', 'periodid', periodid);//日期期间id
			filters[filters.length] = new nlobjSearchFilter('startdate',
					'accountingperiod', 'before', periodtime);// 当月的第一天之前
			// nlapiLogExecution('debug', 'periodtime', periodtime);

			// 收支科目的查询条件
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'onorafter',
					beginningOfYearPeriod);// 当年的第一天之后
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'before', periodtime);// 当月的第一天之前
			// nlapiLogExecution('debug', 'incomeAccountsFilters',
			// incomeAccountsFilters.toString());
		}

		var incomeAccountsTempmap = [];
		var tempmap = [];
		var tempmonthmap = [];
		var arraylist = rule.GetIdArrayListOfLevelOneOfCNCOA();// 查询CN COA
		// 得到所有一级科目（收支和其他科目）
		for (var m = 0; m < 2; m++) {
			var strid = arraylist[m].join(",");
			var sql = rule.GetSQLFromMappingRecords(strid);
			// 传入一级科目查询CN COA Mapping NetSuiteCOA的id对应的CNCOA的一级name
			// CASE
			// WHEN{account.internalid}IN(1758,1158,1802,1803,1174,1175,1176,1804,1163,1155,1169,1759,1,1757)THEN
			// 1002
			// nlapiLogExecution('debug', 'TRIAL-SQL', sql);

			var column = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
			column.setFormula(sql);

			if (m == 0) {// 如果是收入支出科目
				incomeAccountsTempmap[m] = rule
						.GetSummaryLedgerRecordsForIncomeAccounts(// 查询transaction符合条件的sum(debit)和sum(credit)
						incomeAccountsFilters, column); // starting from
				// new year
				// opening
				// Balance
			}

			tempmap[m] = rule.GetSummaryLedgerRecordsByAllOfNumber(filters,
					column); // Opening Balance, 期初数据：当月的第一天之前的数据
			// 查询符合条件的sum(debit)和sum(credit)
			tempmonthmap[m] = rule.GetSummaryLedgerRecordsByAllOfNumber(filter,
					column); // Occuring amount this period, 本月数据 当前过账期间的数据
			// 查询符合条件的sum(debit)和sum(credit)
		}
		var incomeMap = incomeAccountsTempmap[0];
		var map = rule.GetMergeObject(tempmap[0], tempmap[1]);
		var endmap = rule.GetMergeObject(tempmonthmap[0], tempmonthmap[1]);

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

		nlapiLogExecution('debug', 'xml', xml);

		var savedsearch = nlapiLoadSearch('customrecord_trigger_cn_coa',
				'customsearch_trigger_level_1_cn_coa');
		var resultset = savedsearch.runSearch();
		var resultslice = resultset.getResults(0, 1000);
		for (var i = 0; i < resultslice.length; i++) {
			cnnumber = resultslice[i].getValue('name', null, null);
			cnname = resultslice[i].getValue('custrecord_trigger_name_coa_cn',
					null, null);
			var coaname = cnnumber + ' ' + cnname;
			var sum = Object.create(trigger.local.entity.TrialBalance);
			sum.name = coaname;

			// handle special case for P&L accounts of period 1/xxxx, then
			// starting credit and debit should be 0 , then accumulating for the
			// chosen period from the beginning of the year
			var incomeAccountsMap = this.prepareMapOfIncomeAccountNumbers();

			incomeAccountsBeginBalance = incomeMap.GetValue(cnnumber).name;
			beginbalance = map.GetValue(cnnumber).name;
			currentbalance = endmap.GetValue(cnnumber).name;

			if (incomeAccountsMap.Contains(cnnumber)) {
				// 如果是收支科目，则期初为从年初到上个月月末的值
				// if it's P&L account
				// collect data from
				// befinning of this
				// year untill now (not
				// including current
				// period)
				// nlapiLogExecution('DEBUG', 'checking if P&L account',
				// cnnumber +
				// ' account is P&L account <-- IT IS P&L account,
				// incomeAccountsBeginBalance=' + incomeAccountsBeginBalance);
				if (incomeAccountsBeginBalance) {
					sum.beginCredit = parseFloat(incomeAccountsBeginBalance[0]);
					sum.beginDebit = parseFloat(incomeAccountsBeginBalance[1]);
				} else {
					sum.beginCredit = 0;
					sum.beginDebit = 0;
				}
			} else if (beginbalance) {
				sum.beginCredit = parseFloat(beginbalance[0]);
				sum.beginDebit = parseFloat(beginbalance[1]);
			}

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
				// nlapiLogExecution('DEBUG', 'prepare Map Of P&L account
				// numbers', 'account number = ' + cnnAcntNumber);
				map.Add(cnnAcntNumber, null);
			}
		}
		return map;
	}
};