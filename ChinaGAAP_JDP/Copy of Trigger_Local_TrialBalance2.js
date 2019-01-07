/**
 * Module Description: Profit & Loss Version Date Author Remarks 1.00 23 Oct
 * 2014 Winson.Chen
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.trialbalance2 = function() {
};
trigger.local.trialbalance2.prototype = {

	writeTrialBalanceToPDF2 : function(subsidiaryid, periodid, period, response) {
		var filter = [];
		var filters = [];
		var incomeAccountsFilters = [];

		// 新增retainedEarnings科目筛选条件 joe
		var retainedEarningsFilters = [];
		if (subsidiaryid && subsidiaryid != '-1') {
			filter[filter.length] = new nlobjSearchFilter('subsidiary', null,
					'anyof', subsidiaryid);
			filters[filters.length] = new nlobjSearchFilter('subsidiary', null,
					'anyof', subsidiaryid);
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'subsidiary', null, 'anyof', subsidiaryid);

			retainedEarningsFilters[retainedEarningsFilters.length] = new nlobjSearchFilter(
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

			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'onorafter',
					beginningOfYearPeriod);// 期初条件（income）
			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'before', periodtime);

			retainedEarningsFilters[retainedEarningsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'before',
					beginningOfYearPeriod);

		}

		var incomeBeginMap = rule.GetLedgerRecordsForIncomeAccounts(// 查询NSAccount的数据
		incomeAccountsFilters); // starting from
		// new year
		// opening
		// Balance

		var biginMap = rule.GetLedgerRecordsByAllOfNumber(1, filters); //
		// Opening
		// Balance,
		// 期初数据
		// 查询NSAccount的数据
		var currentMap = rule.GetLedgerRecordsByAllOfNumber(2, filter); //
		// Occuring
		// amount
		// this
		// period,
		// 本月数据
		// 查询NSAccount的数据
		// nlapiLogExecution('debug', 'incomeBeginMap|biginMap|currentMap',
		// biginMap.Count + '|' + currentMap.Count + '|'
		// + incomeBeginMap.Count);
		var m = 0;
		var cnnumber;
		var cnname;

		var incomeAccountsBeginBalance = []; // at the beginning of the
		// period for income (P&L)
		// accounts
		var beginbalance = []; // At the beginning of the period, 期初
		var currentbalance = []; // In the current period, 本期
		var begbalanceCN = 0;
		var endbalanceCN = 0;
		var begbalanceAdj = 0;
		var endbalanceAdj = 0;
		var begbalanceUS = 0;
		var endbalanceUS = 0;

		var xml = template.GetTrialBalanceXMLHead1(2, period); // form
		// header

		// joe 查询customrecord_trigger_mapping_cn_coa 得到相对应的参数NSAccountId,
		// NSAccountNumName,CNAccountNum + ' ' + CNAccountName 有mapping关系的
		var mapMapping = rule.GetMappingCNCOAParam();

		// 查询所有的nsaccountId
		var accountIdList = rule.getAccountIdLists();
		// nlapiLogExecution('debug', 'accountIdList', accountIdList.length);

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

			// 临时字段
			var currentCNDebit = 0;
			var currentCNCredit = 0;
			var currentAdjDebit = 0;
			var currentAdjCredit = 0;
			var currentUSDebit = 0;
			var currentUSCredit = 0;
			var beginCNDebit = 0;
			var beginCNCredit = 0;
			var beginAdjDebit = 0;
			var beginAdjCredit = 0;
			var beginUSDebit = 0;
			var beginUSCredit = 0;
			currentbalance = currentMap.GetValue(NSAccountId).name;
			incomeAccountsBeginBalance = incomeBeginMap.GetValue(NSAccountId).name;
			beginbalance = biginMap.GetValue(NSAccountId).name;

			if (!currentbalance && !incomeAccountsBeginBalance && !beginbalance) {
				continue;
			}
			if (incomeAccountsBeginBalance) {
				beginCNDebit = parseFloat(incomeAccountsBeginBalance[0]);
				beginCNCredit = parseFloat(incomeAccountsBeginBalance[1]);
				beginAdjDebit = parseFloat(incomeAccountsBeginBalance[2]);
				beginAdjCredit = parseFloat(incomeAccountsBeginBalance[3]);
				beginUSDebit = parseFloat(incomeAccountsBeginBalance[4]);
				beginUSCredit = parseFloat(incomeAccountsBeginBalance[5]);
			} else if (beginbalance) {
				beginCNDebit = parseFloat(beginbalance[0]);
				beginCNCredit = parseFloat(beginbalance[1]);
				beginAdjDebit = parseFloat(beginbalance[2]);
				beginAdjCredit = parseFloat(beginbalance[3]);
				beginUSDebit = parseFloat(beginbalance[4]);
				beginUSCredit = parseFloat(beginbalance[5]);
			}
			if (currentbalance) {
				currentCNDebit = parseFloat(currentbalance[0]);
				currentCNCredit = parseFloat(currentbalance[1]);
				currentAdjDebit = parseFloat(currentbalance[2]);
				currentAdjCredit = parseFloat(currentbalance[3]);
				currentUSDebit = parseFloat(currentbalance[4]);
				currentUSCredit = parseFloat(currentbalance[5]);
			}

			// 期初只记录期初借贷的差值
			begbalanceCN = parseFloat(beginCNDebit) - parseFloat(beginCNCredit);
			begbalanceAdj = parseFloat(beginAdjDebit)
					- parseFloat(beginAdjCredit);
			begbalanceUS = parseFloat(beginUSDebit) - parseFloat(beginUSCredit);

			// 期末记录期初和本期发生的差值
			endbalanceCN = begbalanceCN + parseFloat(currentCNDebit)
					- parseFloat(currentCNCredit);
			endbalanceAdj = begbalanceAdj + parseFloat(currentAdjDebit)
					- parseFloat(currentAdjCredit);
			endbalanceUS = begbalanceUS + parseFloat(currentUSDebit)
					- parseFloat(currentUSCredit);
			//
			// if (NSAccountId == '1757') {
			// nlapiLogExecution(
			// 'debug',
			// 'beginCNDebit|beginCNCredit|currentCNDebit|currentCNCredit',
			// beginCNDebit + '|' + beginCNCredit + '|'
			// + currentCNDebit + '|' + currentCNCredit);
			//
			// }
			if (endbalanceCN > 0) {
				renderData.cnDebit = endbalanceCN;
				renderData.cnCredit = 0;
			} else {
				renderData.cnDebit = 0;
				renderData.cnCredit = endbalanceCN * -1;
			}

			if (endbalanceAdj > 0) {
				renderData.adjDebit = endbalanceAdj;
				renderData.adjCredit = 0;
			} else {
				renderData.adjDebit = 0;
				renderData.adjCredit = endbalanceAdj * -1;
			}

			if (endbalanceUS > 0) {
				renderData.usDebit = endbalanceUS;
				renderData.usCredit = 0;
			} else {
				renderData.usDebit = 0;
				renderData.usCredit = endbalanceUS * -1;
			}
			if (renderData.cnDebit == 0 && renderData.cnCredit == 0
					&& renderData.adjDebit == 0 && renderData.adjCredit == 0
					&& renderData.usDebit == 0 && renderData.usCredit == 0) {
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
		filename = "Trial Ledger2-" + filename + ".xls";
		new trigger.local.write1().WriteXMLToXlsx(response, xml, filename);
	}

};