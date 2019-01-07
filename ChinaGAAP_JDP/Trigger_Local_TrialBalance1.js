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
			// filters[filters.length] = new nlobjSearchFilter('type',
			// 'account',
			// 'noneof', [ 'Income', 'Cost of Goods Sold', 'Expense',
			// 'Other Income', 'Other Expense',
			// 'Deferred Revenue', 'Deferred Expense' ]);

			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'onorafter',
					beginningOfYearPeriod);// 期初条件（income）
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'before', periodtime);
			// incomeAccountsFilters[incomeAccountsFilters.length] = new
			// nlobjSearchFilter(
			// 'type', 'account', 'anyof', [ 'Income',
			// 'Cost of Goods Sold', 'Expense', 'Other Income',
			// 'Other Expense', 'Deferred Revenue',
			// 'Deferred Expense' ]);

		}

		var incomeBeginMap = rule.GetLedgerRecordsForIncomeAccounts(// 查询NSAccount的数据
		incomeAccountsFilters); // starting from
		// new year
		// opening
		// Balance

		var biginMap = rule.GetLedgerRecordsByAllOfNumber(1, filters); // Opening
		// Balance,
		// 期初数据
		// 查询NSAccount的数据
		var currentMap = rule.GetLedgerRecordsByAllOfNumber(2, filter); // Occuring
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

		var xml = template.GetTrialBalanceXMLHead1(1, period); // form
		// header

		// xml += template.GetTrialBalanceContentHeadXML(period, 1);

		// joe 查询customrecord_trigger_mapping_cn_coa 得到相对应的参数NSAccountId,
		// NSAccountNumName,CNAccountNum + ' ' + CNAccountName
		var mapMapping = rule.GetMappingCNCOAParam();

		// 查询所有的nsaccountId
		var accountIdList = rule.getAccountIdLists();
		// nlapiLogExecution('debug', 'currentMap', currentMap.Count);

		for (var i = 0; i < accountIdList.length; i++) {
			var renderData = Object.create(trigger.local.entity.TrialBalance1);
			var NSAccountId = accountIdList[i].split('|')[0];
			renderData.nsAccountName = accountIdList[i].split('|')[1];

			renderData.cnAccountName = mapMapping.GetValue(NSAccountId)[1];// CNnum+name
			// renderData.nsAccountName =
			// mapMapping.GetValue(accountIdList[i])[0];// NSNum+name
			if (!renderData.cnAccountName) {
				renderData.cnAccountName = '';
			}
			currentbalance = currentMap.GetValue(NSAccountId).name;

			if (currentbalance) {
				renderData.cnDebit = parseFloat(currentbalance[0]);
				renderData.cnCredit = parseFloat(currentbalance[1]);
				renderData.adjDebit = parseFloat(currentbalance[2]);
				renderData.adjCredit = parseFloat(currentbalance[3]);
				renderData.usDebit = parseFloat(currentbalance[4]);
				renderData.usCredit = parseFloat(currentbalance[5]);
			} else {
				continue;
			}

			renderData.cnDebit = com.formatCurrency(renderData.cnDebit);
			renderData.cnCredit = com.formatCurrency(renderData.cnCredit);
			renderData.adjDebit = com.formatCurrency(renderData.adjDebit);
			renderData.adjCredit = com.formatCurrency(renderData.adjCredit);
			renderData.usDebit = com.formatCurrency(renderData.usDebit);
			renderData.usCredit = com.formatCurrency(renderData.usCredit);

			xml += template.GetTrialBalanceXML1(renderData);
		}
		xml += template.GetTrialBalanceXMLFoot1;
		// nlapiLogExecution('debug', 'xml', xml);
		var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
		filename = "Trial Ledger1-" + filename + ".xls";
		new trigger.local.write1().WriteXMLToXlsx(response, xml, filename);
	}

};