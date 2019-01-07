/**
 * Module Description: Trial Balance Detailed Version Date Author Remarks 1.00
 * 19 May 2017 Veronica
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.trialbalancedetail = function() {
};
trigger.local.trialbalancedetail.prototype = {
	writeTrialBalanceDetailToPDF : function(subsidiaryid, periodid, period,
			monthFromID, monthFromText, monthToID, monthToText, response) {
		var filter = [];
		var filters = [];
		var incomeAccountsFilters = [];
		var fromToPeriodLbl = '';

		if (subsidiaryid && subsidiaryid != '-1') {
			filter[filter.length] = new nlobjSearchFilter('subsidiary', null,
					'anyof', subsidiaryid);
			filters[filters.length] = new nlobjSearchFilter('subsidiary', null,
					'anyof', subsidiaryid);
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'subsidiary', null, 'anyof', subsidiaryid);

		}

		if (monthFromID && monthFromText && monthToID && monthToText) {
			// get the first day of monthFomID period
			var accPeriodFrom = nlapiLoadRecord('accountingperiod', monthFromID);
			var accPeriodStartDate = accPeriodFrom.getFieldValue('startdate'); // format
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

			var periodtimeStart = String.format("{0}/{1}/{2}", startMonth,
					startDay, startYear);
			var beginningOfYearPeriod = String.format("{0}/{1}/{2}", 1, 1,
					startYear);

			// create filters for posting period ids [monthFromID,
			// monthFromID+1,.. monthToID]
			var periodFromToFilters = this
					.prepareFilterPostingPeriodFromToPeriodIDs(monthFromID,
							monthToID);

			// add the created filters to the common list
			for (var t = 0; t < periodFromToFilters.length; t++) {
				filter[filter.length] = periodFromToFilters[t]; // this month
				// amount
			}

			filters[filters.length] = new nlobjSearchFilter('startdate',
					'accountingperiod', 'before', periodtimeStart); // opening
			// balance
			// filter

			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'onorafter',
					beginningOfYearPeriod);
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'before', periodtimeStart);

			fromToPeriodLbl = monthFromText + ' 鑷� ' + monthToText;

		} else if (periodid && period) {
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
			filters[filters.length] = new nlobjSearchFilter('startdate',
					'accountingperiod', 'before', periodtime);

			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'onorafter',
					beginningOfYearPeriod);
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'before', periodtime);
		}

		var incomeAccountsTempmap = [];
		var tempmap = [];
		var tempmonthmap = [];
		var arraylist = rule.GetIdArrayListOfLevelTwo_Three_OfCNCOA();

		for (var m = 0; m < 2; m++) {
			var strid = arraylist[m].join(",");
			var sql = rule.GetSQLFromMappingRecordsOneToOne(strid);

			// nlapiLogExecution('debug', 'TRIAL-SQL', sql);

			var column = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
			column.setFormula(sql);

			if (m == 0) {
				incomeAccountsTempmap[m] = rule
						.GetSummaryLedgerRecordsForIncomeAccounts(
								incomeAccountsFilters, column); // starting from
				// new year
				// opening
				// Balance
			}

			tempmap[m] = rule.GetSummaryLedgerRecordsByAllOfNumber(filters,
					column); // Opening Balance, 鏈熷垵鏁版嵁
			tempmonthmap[m] = rule.GetSummaryLedgerRecordsByAllOfNumber(filter,
					column); // Occuring amount this period, 鏈湀鏁版嵁
		}
		var incomeMap = incomeAccountsTempmap[0];
		var map = rule.GetMergeObject(tempmap[0], tempmap[1]);
		var endmap = rule.GetMergeObject(tempmonthmap[0], tempmonthmap[1]);

		var m = 0;
		var cnnumber;
		var cnname;
		var currPageNumber = 1;

		var incomeAccountsBeginBalance = []; // at the beginning of the
		// period for income (P&L)
		// accounts
		var beginbalance = []; // At the beginning of the period, 鏈熷垵
		var currentbalance = []; // In the current period, 鏈湡
		var begbalance = 0;
		var endbalance = 0;
		var xml = template.GetTrialBalanceXMLHead; // form header

		if (fromToPeriodLbl) {
			xml += template.GetTrialBalanceContentHeadXML(fromToPeriodLbl,
					currPageNumber++);
		} else {
			xml += template.GetTrialBalanceContentHeadXML(period,
					currPageNumber++);
		}

		var savedsearch = nlapiLoadSearch('customrecord_trigger_cn_coa',
				'customsearch_tn_lvl_23_cn_coa_no_lvl1');
		var resultset = savedsearch.runSearch();
		var resultslice = resultset.getResults(0, 1000);
		for (var i = 0; i < resultslice.length; i++) {
			cnnumber = resultslice[i].getValue('name', null, null);
			cnname = com.formatStringValuesInXml(resultslice[i].getValue(
					'custrecord_trigger_name_coa_cn', null, null));
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

			if (incomeAccountsMap.Contains(cnnumber)) {// if it's P&L account
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
			if (begbalance > 0) {
				sum.beginDebit = begbalance;
				sum.beginCredit = 0;
			} else {
				sum.beginDebit = 0;
				sum.beginCredit = begbalance * -1;
			}

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

			if ((m % 45 == 0) && (m > 0)) {
				xml += template.GetTrialBalanceXMLFoot;
				xml += template.GetFooterXML;
				if (fromToPeriodLbl) {
					xml += template.GetTrialBalanceContentHeadXML(
							fromToPeriodLbl, currPageNumber++);
				} else {
					xml += template.GetTrialBalanceContentHeadXML(period,
							currPageNumber++);
				}
				m = 0;
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
	},

	/**
	 * Prepare filter for quering transaction based on posting periods filter
	 * in-between the provided period ids
	 * 
	 * @returns filter on posting periods including the range between provided
	 *          values
	 */
	prepareFilterPostingPeriodFromToPeriodIDs : function(periodFromId,
			periodToId) {
		var periodIds = [];
		var mapExistingPeriodsInSystem = this.prepareMapOfAccountingPeriods();
		for (var i = periodFromId; i <= periodToId; i++) {
			if (mapExistingPeriodsInSystem.Contains(i)) {
				periodIds.push(i);
			}
		}

		return rsltFilter = periodIds.map(function(periodId, index, periodIds) {
			var filter = new nlobjSearchFilter('postingperiod', null, 'within',
					periodId);

			// if this is the first periodid, add a left parenthesis
			if (index === 0) {
				filter = filter.setLeftParens(1);
			}

			// if this is the last period id, add a right parenthesis, otherwise
			// add an 'or' condition
			if (index !== periodIds.length - 1) {
				filter = filter.setOr(true);
			} else {
				filter = filter.setRightParens(1);
			}

			return filter;
		});

		return rsltFilter;
	},

	/**
	 * Return the list of accounting periods without Quater definition as map
	 * with accounting period ids
	 * 
	 * @returns
	 */
	prepareMapOfAccountingPeriods : function() {
		var map = new trigger.local.HashTable();
		var savedsearch = nlapiLoadSearch('accountingperiod',
				'customsearch_trigger_accounting_period');

		var resultset = savedsearch.runSearch();
		var resultslice = resultset.getResults(0, 1000);
		for (var i = 0; i < resultslice.length; i++) {
			currperiodid = resultslice[i].getValue('internalid', null, 'GROUP');
			map.Add(currperiodid, null);
		}
		return map;
	}
};