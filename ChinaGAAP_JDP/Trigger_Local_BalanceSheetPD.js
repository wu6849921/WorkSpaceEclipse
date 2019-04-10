/**
 * Module Description: Profit & Loss Version Date Author Remarks 1.00 23 Oct
 * 2014 Winson.Chen
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.balancesheet = function() {
}
trigger.local.balancesheet.prototype = {
	writeBalanceSheetToPDF : function(subsidiaryid, subsidiaryname, periodid,
			period, response) {
		var xml = template.GetBalanceSheetXMLHead;

		var titletime = '';
		var filter = [];
		var filters = [];
		if (subsidiaryid && subsidiaryid != '-1') {
			filter[filter.length] = new nlobjSearchFilter('subsidiary', null,
					'anyof', subsidiaryid);
			filters[filters.length] = new nlobjSearchFilter('subsidiary', null,
					'anyof', subsidiaryid);
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

			var month = com.GetMonthByPeriod(period);
			var periodtime = String.format("{0}/{1}/{2}", startMonth, startDay,
					startYear);
			var begintime = '1/1/' + startYear;
			titletime = String.format("{0}年{1}月", startYear, month);

			// nlapiLogExecution('debug', 'begintime',
			// String.format("{0}/{1}",begintime,periodtime));

			filter[filter.length] = new nlobjSearchFilter('startdate',
					'accountingperiod', 'before', begintime);

			if (month == '13') {// //for period 13 Balance Report will include
				// all the transactions
				filters[filters.length] = new nlobjSearchFilter('startdate',
						'accountingperiod', 'onorbefore', periodtime);
			} else {// need to filter out the transactions belong to period 13
				// as a part of period 12 report
				filters[filters.length] = new nlobjSearchFilter('startdate',
						'accountingperiod', 'onorbefore', periodtime);
				filters[filters.length] = new nlobjSearchFilter(
						'internalidnumber', 'accountingperiod',
						'lessthanorequalto', periodid);
			}
		}
		xml += template
				.GetBalanceSheetContentHeadXML(subsidiaryname, titletime);

		var tempmap = [];
		var tempmonthmap = [];
		var arraylist = rule.GetIdArrayListOfLevelOneOfCNCOA();
		for (var m = 0; m < 2; m++) {
			var strid = arraylist[m].join(",");
			// nlapiLogExecution('debug','strid',strid);
			var sql = rule.GetSQLFromMappingRecords(strid);
			// nlapiLogExecution('debug','sql',sql);
			var column = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
			column.setFormula(sql);

			// nlapiLogExecution('debug', 'SQL',sql);
			// nlapiLogExecution('debug','filters',filters.toString());
			tempmap[m] = rule.GetSummaryLedgerRecordsByAllOfNumber(filter,
					column); // 期初数据, The beginning of the period data
			tempmonthmap[m] = rule.GetSummaryLedgerRecordsByAllOfNumber(
					filters, column, m); // 本月数据, This month data
		}
		var map = rule.GetMergeObject(tempmap[0], tempmap[1]);
		var endmap = rule.GetMergeObject(tempmonthmap[0], tempmonthmap[1]);

		// 未分配金额, 其它应收或者其它应付款
		var notconfirmmap = this.GetUnConfirmAccounts(filter);
		var notconfirmendmap = this.GetUnConfirmAccounts(filters);

		var cnnumber;
		var cnname;
		var credit = 0; // 期初
		var debit = 0; // 期末
		var totalcredit = 0;
		var totaldebit = 0;

		var bs = Object.create(trigger.local.entity.BalanceSheet);

		/**
		 * 流动资产
		 */
		// 货币资金 1001,1002,1009
		var n1001 = map.GetValue('1001').name;
		var n1002 = map.GetValue('1002').name;
		var n1009 = map.GetValue('1009').name;
		if (!n1001) {
			n1001 = [ 0, 0 ];
		}
		if (!n1002) {
			n1002 = [ 0, 0 ];
		}
		if (!n1009) {
			n1009 = [ 0, 0 ];
		}
		// nlapiLogExecution('debug', 'Start cash:', 'Start cash--> n1001:' +
		// n1001 + ' n1002:' + n1002 + ' n1012:' + n1012);

		bs.Cash = parseFloat(n1001[1]) - parseFloat(n1001[0])
				+ parseFloat(n1002[1]) - parseFloat(n1002[0])
				+ parseFloat(n1009[1]) - parseFloat(n1009[0]);
		bs.Cash = bs.Cash.toFixed(2);

		n1001 = endmap.GetValue('1001').name;
		n1002 = endmap.GetValue('1002').name;
		n1009 = endmap.GetValue('1009').name;
		if (!n1001) {
			n1001 = [ 0, 0 ];
		}
		if (!n1002) {
			n1002 = [ 0, 0 ];
		}
		if (!n1009) {
			n1009 = [ 0, 0 ];
		}

		bs.CashEnd = parseFloat(n1001[1]) - parseFloat(n1001[0])
				+ parseFloat(n1002[1]) - parseFloat(n1002[0])
				+ parseFloat(n1009[1]) - parseFloat(n1009[0]);
		// 交易性金融资产 1101 delete!
		// var n1101 = map.GetValue('1101').name;
		// if(!n1101){n1101 = [0,0];}
		// bs.TradingFinancialAssets = parseFloat(n1101[1]) -
		// parseFloat(n1101[0]);
		// n1101 = endmap.GetValue('1101').name;
		// if(!n1101){n1101 = [0,0];}
		// bs.TradingFinancialAssetsEnd = parseFloat(n1101[1]) -
		// parseFloat(n1101[0]);

		// 短期投资 1101 1102 new!
		var n1101 = map.GetValue('1101').name;
		var n1102 = map.GetValue('1102').name;
		if (!n1101) {
			n1101 = [ 0, 0 ];
		}
		if (!n1102) {
			n1102 = [ 0, 0 ];
		}
		bs.CurrentInvestment = parseFloat(n1101[1]) - parseFloat(n1101[0])
				+ parseFloat(n1102[1]) - parseFloat(n1102[0]);

		n1101 = endmap.GetValue('1101').name;
		n1102 = endmap.GetValue('1102').name;
		if (!n1101) {
			n1101 = [ 0, 0 ];
		}
		if (!n1102) {
			n1102 = [ 0, 0 ];
		}
		bs.CurrentInvestmentEnd = parseFloat(n1101[1]) - parseFloat(n1101[0])
				+ parseFloat(n1102[1]) - parseFloat(n1102[0]);
		// 应收票据 1111
		var n1111 = map.GetValue('1111').name;
		if (!n1111) {
			n1111 = [ 0, 0 ];
		}
		bs.NotesReceivable = parseFloat(n1111[1]) - parseFloat(n1111[0]);
		n1111 = endmap.GetValue('1111').name;
		if (!n1111) {
			n1111 = [ 0, 0 ];
		}
		bs.NotesReceivableEnd = parseFloat(n1111[1]) - parseFloat(n1111[0]);

		// 应收股利 1121
		var n1121 = map.GetValue('1121').name;
		if (!n1121) {
			n1121 = [ 0, 0 ];
		}
		bs.DividendReceivable = parseFloat(n1121[1]) - parseFloat(n1121[0]);
		n1121 = endmap.GetValue('1121').name;
		if (!n1121) {
			n1121 = [ 0, 0 ];
		}
		bs.DividendReceivableEnd = parseFloat(n1121[1]) - parseFloat(n1121[0]);

		// 应收利息 1122
		var n1122 = map.GetValue('1122').name;
		if (!n1122) {
			n1122 = [ 0, 0 ];
		}
		bs.InterestReceivable = parseFloat(n1122[1]) - parseFloat(n1122[0]);
		n1122 = endmap.GetValue('1122').name;
		if (!n1122) {
			n1122 = [ 0, 0 ];
		}
		bs.InterestReceivableEnd = parseFloat(n1122[1]) - parseFloat(n1122[0]);

		// 应收账款 1131 1141
		var n1131 = map.GetValue('1131').name;
		var n1141 = map.GetValue('1141').name;
		if (!n1131) {
			n1131 = [ 0, 0 ];
		}
		if (!n1141) {
			n1141 = [ 0, 0 ];
		}
		bs.NetReceivable = parseFloat(n1131[1]) - parseFloat(n1131[0])
				+ parseFloat(n1141[1]) - parseFloat(n1141[0]);

		n1131 = endmap.GetValue('1131').name;
		n1141 = endmap.GetValue('1141').name;
		if (!n1131) {
			n1131 = [ 0, 0 ];
		}
		if (!n1141) {
			n1141 = [ 0, 0 ];
		}
		bs.NetReceivableEnd = parseFloat(n1131[1]) - parseFloat(n1131[0])
				+ parseFloat(n1141[1]) - parseFloat(n1141[0]);

		// 其他应收款 1133
		var n1133 = map.GetValue('1133').name;
		if (!n1133) {
			n1133 = [ 0, 0 ];
		}
		bs.OtherReceivables = parseFloat(n1133[1]) - parseFloat(n1133[0]);
		n1133 = endmap.GetValue('1133').name;
		if (!n1133) {
			n1133 = [ 0, 0 ];
		}
		bs.OtherReceivablesEnd = parseFloat(n1133[1]) - parseFloat(n1133[0]);

		// 预付账款 1151
		var n1151 = map.GetValue('1151').name;
		if (!n1151) {
			n1151 = [ 0, 0 ];
		}
		bs.AccountsPrepaid = parseFloat(n1151[1]) - parseFloat(n1151[0]);
		n1151 = endmap.GetValue('1151').name;
		if (!n1151) {
			n1151 = [ 0, 0 ];
		}
		bs.AccountsPrepaidEnd = parseFloat(n1151[1]) - parseFloat(n1151[0]);

		// 应收补贴款 1161 new!
		var n1161 = map.GetValue('1161').name;
		if (!n1161) {
			n1161 = [ 0, 0 ];
		}
		bs.SubsidyReceivable = parseFloat(n1161[1]) - parseFloat(n1161[0]);
		n1161 = endmap.GetValue('1161').name;
		if (!n1161) {
			n1161 = [ 0, 0 ];
		}
		bs.SubsidyReceivableEnd = parseFloat(n1161[1]) - parseFloat(n1161[0]);

		for (var i = 0; i < notconfirmmap.Count; i++) {
			var specialid = notconfirmmap.ArrayList[i];
			var specialvalue = notconfirmmap.GetValue(specialid).name;
			if (specialvalue && parseFloat(specialvalue) > 0) {
				bs.OtherReceivables += parseFloat(specialvalue);
			}
		}
		for (var i = 0; i < notconfirmendmap.Count; i++) {
			var specialid = notconfirmendmap.ArrayList[i];
			var specialvalue = notconfirmendmap.GetValue(specialid).name;
			if (specialvalue && parseFloat(specialvalue) > 0) {
				bs.OtherReceivablesEnd += parseFloat(specialvalue);
			}
		}

		// 存货
		var tempinventories = this.GetTotalByIntentories(map, endmap);
		bs.Inventories = parseFloat(tempinventories[0]);
		bs.InventoriesEnd = parseFloat(tempinventories[1]);

		// 待摊费用 1301 new
		var n1301 = map.GetValue('1301').name;
		if (!n1301) {
			n1301 = [ 0, 0 ];
		}
		bs.UnamortizedExpense = parseFloat(n1301[1]) - parseFloat(n1301[0]);
		n1301 = endmap.GetValue('1301').name;
		if (!n1301) {
			n1301 = [ 0, 0 ];
		}
		bs.UnamortizedExpenseEnd = parseFloat(n1301[1]) - parseFloat(n1301[0]);

		// 待处理流动资产净损失 new
		bs.UnsettledGLOnCurrentAssets = parseFloat('0');
		bs.UnsettledGLOnCurrentAssetsEnd = parseFloat('0');
		// 一年内到期的长期债权投资 new
		bs.LongTermDebtInvestmentDueWithinOneYear = parseFloat('0');
		bs.LongTermDebtInvestmentDueWithinOneYearEnd = parseFloat('0');

		// 待处理财产损溢 1911-- 其他流动资产
		var n1911 = map.GetValue('1911').name;
		if (!n1911) {
			n1911 = [ 0, 0 ];
		}
		bs.OtherCurrentAssets = parseFloat(n1911[1]) - parseFloat(n1911[0]);
		n1911 = endmap.GetValue('1911').name;
		if (!n1911) {
			n1911 = [ 0, 0 ];
		}
		bs.OtherCurrentAssetsEnd = parseFloat(n1911[1]) - parseFloat(n1911[0]);

		// 流动资产合计
		bs.TotalCurrentAssets += parseFloat(bs.Cash);
		bs.TotalCurrentAssets += parseFloat(bs.NotesReceivable);
		bs.TotalCurrentAssets += parseFloat(bs.NetReceivable);
		bs.TotalCurrentAssets += parseFloat(bs.AccountsPrepaid);
		bs.TotalCurrentAssets += parseFloat(bs.InterestReceivable);
		bs.TotalCurrentAssets += parseFloat(bs.DividendReceivable);
		bs.TotalCurrentAssets += parseFloat(bs.OtherReceivables);
		bs.TotalCurrentAssets += parseFloat(bs.CurrentInvestment);// add
		bs.TotalCurrentAssets += parseFloat(bs.Inventories);
		bs.TotalCurrentAssets += parseFloat(bs.UnsettledGLOnCurrentAssets);
		bs.TotalCurrentAssets += parseFloat(bs.LongTermDebtInvestmentDueWithinOneYear);
		bs.TotalCurrentAssets += parseFloat(bs.OtherCurrentAssets);

		bs.TotalCurrentAssetsEnd += parseFloat(bs.CashEnd);
		bs.TotalCurrentAssetsEnd += parseFloat(bs.NotesReceivableEnd);
		bs.TotalCurrentAssetsEnd += parseFloat(bs.NetReceivableEnd);
		bs.TotalCurrentAssetsEnd += parseFloat(bs.AccountsPrepaidEnd);
		bs.TotalCurrentAssetsEnd += parseFloat(bs.InterestReceivableEnd);
		bs.TotalCurrentAssetsEnd += parseFloat(bs.DividendReceivableEnd);
		bs.TotalCurrentAssetsEnd += parseFloat(bs.OtherReceivablesEnd);
		bs.TotalCurrentAssetsEnd += parseFloat(bs.CurrentInvestmentEnd);// add
		bs.TotalCurrentAssetsEnd += parseFloat(bs.InventoriesEnd);
		bs.TotalCurrentAssetsEnd += parseFloat(bs.UnsettledGLOnCurrentAssetsEnd);
		bs.TotalCurrentAssetsEnd += parseFloat(bs.LongTermDebtInvestmentDueWithinOneYearEnd);
		bs.TotalCurrentAssetsEnd += parseFloat(bs.OtherCurrentAssetsEnd);

		/**
		 * 长期投资
		 */
		// 长期股权投资 1401- 1421+ 1431
		var n1401 = map.GetValue('1401').name;
		var n1402 = map.GetValue('1402').name;
		var n1421 = map.GetValue('1421').name;
		if (!n1401) {
			n1401 = [ 0, 0 ];
		}
		if (!n1402) {
			n1402 = [ 0, 0 ];
		}
		if (!n1421) {
			n1421 = [ 0, 0 ];
		}
		bs.longTermEquityInvestment = parseFloat(n1401[1])
				- parseFloat(n1401[0])
				- (parseFloat(n1402[1]) - parseFloat(n1402[0]))
				+ parseFloat(n1421[1]) - parseFloat(n1421[0]);
		n1401 = endmap.GetValue('1401').name;
		n1402 = endmap.GetValue('1402').name;
		n1421 = endmap.GetValue('1421').name;
		if (!n1401) {
			n1401 = [ 0, 0 ];
		}
		if (!n1402) {
			n1402 = [ 0, 0 ];
		}
		if (!n1421) {
			n1421 = [ 0, 0 ];
		}
		bs.longTermEquityInvestmentEnd = parseFloat(n1401[1])
				- parseFloat(n1401[0])
				- (parseFloat(n1402[1]) - parseFloat(n1402[0]))
				+ parseFloat(n1421[1]) - parseFloat(n1421[0]);

		// 长期债权投资 1402 new
		var n1402 = map.GetValue('1402').name;
		if (!n1402) {
			n1402 = [ 0, 0 ];
		}
		bs.longTermBondInvestment = parseFloat(n1402[1]) - parseFloat(n1402[0]);
		n1402 = endmap.GetValue('1402').name;
		if (!n1402) {
			n1402 = [ 0, 0 ];
		}
		bs.longTermBondInvestmentEnd = parseFloat(n1402[1])
				- parseFloat(n1402[0]);

		// 合并价差 置0
		bs.incorporatingPriceDifference = parseFloat(0);
		bs.incorporatingPriceDifferenceEnd = parseFloat(0);

		// 长期投资合计
		bs.totalLongTermInvestment += parseFloat(bs.longTermEquityInvestment);
		bs.totalLongTermInvestment += parseFloat(bs.longTermBondInvestment);
		bs.totalLongTermInvestment += parseFloat(bs.incorporatingPriceDifference);

		bs.totalLongTermInvestmentEnd += parseFloat(bs.longTermEquityInvestmentEnd);
		bs.totalLongTermInvestmentEnd += parseFloat(bs.longTermEquityInvestmentEnd);
		bs.totalLongTermInvestmentEnd += parseFloat(bs.longTermEquityInvestmentEnd);

		/**
		 * 固定资产
		 */
		// 固定资产原价 1501
		var n1501 = map.GetValue('1501').name;
		if (!n1501) {
			n1501 = [ 0, 0 ];
		}
		bs.FixedAssetsOriginal = parseFloat(n1501[1]) - parseFloat(n1501[0]);
		n1501 = endmap.GetValue('1501').name;
		if (!n1501) {
			n1501 = [ 0, 0 ];
		}
		bs.FixedAssetsOriginalEnd = parseFloat(n1501[1]) - parseFloat(n1501[0]);

		// 减:累计折旧 1502
		var n1502 = map.GetValue('1502').name;
		if (!n1502) {
			n1502 = [ 0, 0 ];
		}
		bs.accumulatedDepreciation = parseFloat(n1502[1])
				- parseFloat(n1502[0]);
		n1502 = endmap.GetValue('1502').name;
		if (!n1502) {
			n1502 = [ 0, 0 ];
		}
		bs.accumulatedDepreciationEnd = parseFloat(n1502[1])
				- parseFloat(n1502[0]);

		// 固定资产净值 1501+1502
		bs.fixedAssetsNetValue = bs.FixedAssetsOriginal
				+ bs.accumulatedDepreciation;
		bs.fixedAssetsNetValueEnd = bs.FixedAssetsOriginalEnd
				+ bs.accumulatedDepreciationEnd;

		// 减：固定资产减值准备 1505
		var n1505 = map.GetValue('1505').name;
		if (!n1505) {
			n1505 = [ 0, 0 ];
		}
		bs.fixedAssetsDepreciationReserve = parseFloat(n1505[1])
				- parseFloat(n1505[0]);
		n1505 = endmap.GetValue('1505').name;
		if (!n1505) {
			n1505 = [ 0, 0 ];
		}
		bs.fixedAssetsDepreciationReserveEnd = parseFloat(n1505[1])
				- parseFloat(n1505[0]);

		// 固定资产净额 1501+1502+1505
		bs.fixedAssetsAmount = bs.fixedAssetsNetValue
				+ bs.fixedAssetsDepreciationReserve;
		bs.fixedAssetsAmountEnd = bs.fixedAssetsNetValueEnd
				+ bs.fixedAssetsDepreciationReserveEnd;

		// 固定资产清理1701
		var n1701 = map.GetValue('1701').name;
		if (!n1701) {
			n1701 = [ 0, 0 ];
		}
		bs.FixedAssetsDiaposal = parseFloat(n1701[1]) - parseFloat(n1701[0]);
		n1701 = endmap.GetValue('1701').name;
		if (!n1701) {
			n1701 = [ 0, 0 ];
		}
		bs.FixedAssetsDiaposalEnd = parseFloat(n1701[1]) - parseFloat(n1701[0]);

		// 工程物资 1601
		var n1601 = map.GetValue('1601').name;
		if (!n1601) {
			n1601 = [ 0, 0 ];
		}
		bs.ProjectMaterial = parseFloat(n1601[1]) - parseFloat(n1601[0]);
		n1601 = endmap.GetValue('1601').name;
		if (!n1601) {
			n1601 = [ 0, 0 ];
		}
		bs.ProjectMaterialEnd = parseFloat(n1601[1]) - parseFloat(n1601[0]);

		// 在建工程 1603-1605
		var n1603 = map.GetValue('1603').name;
		var n1605 = map.GetValue('1605').name;
		if (!n1603) {
			n1603 = [ 0, 0 ];
		}
		if (!n1605) {
			n1605 = [ 0, 0 ];
		}
		bs.ConstructionInProgress = parseFloat(n1601[1]) - parseFloat(n1601[0])
				- (parseFloat(n1605[1]) + parseFloat(n1605[0]));
		n1603 = endmap.GetValue('1603').name;
		n1605 = endmap.GetValue('1605').name;
		if (!n1603) {
			n1603 = [ 0, 0 ];
		}
		if (!n1605) {
			n1605 = [ 0, 0 ];
		}
		bs.ConstructionInProgressEnd = parseFloat(n1601[1])
				- parseFloat(n1601[0])
				- (parseFloat(n1605[1]) + parseFloat(n1605[0]));

		// 待处理固定资产净损失 置0
		bs.unsettled = parseFloat(0);
		bs.unsettledEnd = parseFloat(0);

		// 固定资产总计
		bs.totalFixedAssets += parseFloat(bs.fixedAssetsAmount);
		bs.totalFixedAssets += parseFloat(bs.FixedAssetsDiaposal);
		bs.totalFixedAssets += parseFloat(bs.ProjectMaterial);
		bs.totalFixedAssets += parseFloat(bs.ConstructionInProgress);
		bs.totalFixedAssets += parseFloat(bs.unsettled);

		bs.totalFixedAssetsEnd += parseFloat(bs.fixedAssetsAmountEnd);
		bs.totalFixedAssetsEnd += parseFloat(bs.FixedAssetsDiaposalEnd);
		bs.totalFixedAssetsEnd += parseFloat(bs.ProjectMaterialEnd);
		bs.totalFixedAssetsEnd += parseFloat(bs.ConstructionInProgressEnd);
		bs.totalFixedAssetsEnd += parseFloat(bs.unsettledEnd);

		/**
		 * 无形资产
		 */
		// 无形资产 1801-1805
		var n1801 = map.GetValue('1801').name;
		var n1805 = map.GetValue('1805').name;
		if (!n1801) {
			n1801 = [ 0, 0 ];
		}
		if (!n1805) {
			n1805 = [ 0, 0 ];
		}
		bs.IntangibleAssets = parseFloat(n1801[1]) - parseFloat(n1801[0])
				- (parseFloat(n1805[1]) + parseFloat(n1805[0]));
		n1801 = endmap.GetValue('1801').name;
		n1805 = endmap.GetValue('1805').name;
		if (!n1801) {
			n1801 = [ 0, 0 ];
		}
		if (!n1805) {
			n1805 = [ 0, 0 ];
		}
		bs.IntangibleAssetsEnd = parseFloat(n1801[1]) - parseFloat(n1801[0])
				- (parseFloat(n1805[1]) + parseFloat(n1805[0]));

		// 长期待摊费用 1901
		var n1901 = map.GetValue('1901').name;
		if (!n1901) {
			n1901 = [ 0, 0 ];
		}
		bs.LongTermUnamortizedExpenses = parseFloat(n1901[1])
				- parseFloat(n1901[0]);
		n1901 = endmap.GetValue('1901').name;
		if (!n1901) {
			n1901 = [ 0, 0 ];
		}
		bs.LongTermUnamortizedExpensesEnd = parseFloat(n1901[1])
				- parseFloat(n1901[0]);

		// 其他长期资产
		bs.otherLongTermAssets = parseFloat(0);
		bs.otherLongTermAssetsEnd = parseFloat(0);

		// 无形资产及其他资产合计
		bs.totalIntangibleAssets += parseFloat(bs.IntangibleAssets);
		bs.totalIntangibleAssets += parseFloat(bs.LongTermUnamortizedExpenses);
		bs.totalIntangibleAssets += parseFloat(bs.otherLongTermAssets);

		bs.totalIntangibleAssetsEnd += parseFloat(bs.IntangibleAssetsEnd);
		bs.totalIntangibleAssetsEnd += parseFloat(bs.LongTermUnamortizedExpensesEnd);
		bs.totalIntangibleAssetsEnd += parseFloat(bs.otherLongTermAssetsEnd);

		/**
		 * 资产总计
		 */
		bs.TotalAssets = parseFloat(bs.TotalCurrentAssets)
				+ parseFloat(bs.totalLongTermInvestment)
				+ parseFloat(bs.totalFixedAssets)
				+ parseFloat(bs.totalIntangibleAssets);
		bs.TotalAssets = parseFloat(bs.TotalAssets).toFixed(2);
		bs.TotalAssetsEnd = parseFloat(bs.TotalCurrentAssetsEnd)
				+ parseFloat(bs.totalLongTermInvestmentEnd)
				+ parseFloat(bs.totalFixedAssetsEnd)
				+ parseFloat(bs.totalIntangibleAssetsEnd);

		/**
		 * 流动负债
		 */
		// 短期借款 2101
		var n2101 = map.GetValue('2101').name;
		if (!n2101) {
			n2101 = [ 0, 0 ];
		}
		bs.ShortTermLoans = 0 - (parseFloat(n2101[1]) - parseFloat(n2101[0]));
		n2101 = endmap.GetValue('2101').name;
		if (!n2101) {
			n2101 = [ 0, 0 ];
		}
		bs.ShortTermLoansEnd = 0 - (parseFloat(n2101[1]) - parseFloat(n2101[0]));

		// 应付票据 2111
		var n2111 = map.GetValue('2111').name;
		if (!n2111) {
			n2111 = [ 0, 0 ];
		}
		bs.NotesPayable = 0 - (parseFloat(n2111[1]) - parseFloat(n2111[0]));
		n2111 = endmap.GetValue('2111').name;
		if (!n2111) {
			n2111 = [ 0, 0 ];
		}
		bs.NotesPayableEnd = 0 - (parseFloat(n2111[1]) - parseFloat(n2111[0]));

		// 应付账款 2121
		var n2121 = map.GetValue('2121').name;
		if (!n2121) {
			n2121 = [ 0, 0 ];
		}
		bs.AccountsPayable = 0 - (parseFloat(n2121[1]) - parseFloat(n2121[0]));
		n2121 = endmap.GetValue('2121').name;
		if (!n2121) {
			n2121 = [ 0, 0 ];
		}
		bs.AccountsPayableEnd = 0 - (parseFloat(n2121[1]) - parseFloat(n2121[0]));

		// 预收款项 2131
		var n2131 = map.GetValue('2131').name;
		if (!n2131) {
			n2131 = [ 0, 0 ];
		}
		bs.AdvancesFromCustomers = 0 - (parseFloat(n2131[1]) - parseFloat(n2131[0]));
		n2131 = endmap.GetValue('2131').name;
		if (!n2131) {
			n2131 = [ 0, 0 ];
		}
		bs.AdvancesFromCustomersEnd = 0 - (parseFloat(n2131[1]) - parseFloat(n2131[0]));

		// 应付工资 2151
		var n2151 = map.GetValue('2151').name;
		if (!n2151) {
			n2151 = [ 0, 0 ];
		}
		bs.AccruedPayroll = 0 - (parseFloat(n2151[1]) - parseFloat(n2151[0]));
		n2151 = endmap.GetValue('2151').name;
		if (!n2151) {
			n2151 = [ 0, 0 ];
		}
		bs.AccruedPayrollEnd = 0 - (parseFloat(n2151[1]) - parseFloat(n2151[0]));

		// 应付福利费 2153
		var n2153 = map.GetValue('2153').name;
		if (!n2153) {
			n2153 = [ 0, 0 ];
		}
		bs.welfarePayable = 0 - (parseFloat(n2153[1]) - parseFloat(n2153[0]));
		n2153 = endmap.GetValue('2153').name;
		if (!n2153) {
			n2153 = [ 0, 0 ];
		}
		bs.welfarePayableEnd = 0 - (parseFloat(n2153[1]) - parseFloat(n2153[0]));

		// 应付股利 2161
		var n2161 = map.GetValue('2161').name;
		if (!n2161) {
			n2161 = [ 0, 0 ];
		}
		bs.DividendsPayable = 0 - (parseFloat(n2161[1]) - parseFloat(n2161[0]));
		n2161 = endmap.GetValue('2161').name;
		if (!n2161) {
			n2161 = [ 0, 0 ];
		}
		bs.DividendsPayableEnd = 0 - (parseFloat(n2161[1]) - parseFloat(n2161[0]));

		// 应交税费 2171
		var n2171 = map.GetValue('2171').name;
		if (!n2171) {
			n2171 = [ 0, 0 ];
		}
		bs.TaxesPayable = 0 - (parseFloat(n2171[1]) - parseFloat(n2171[0]));
		n2171 = endmap.GetValue('2171').name;
		if (!n2171) {
			n2171 = [ 0, 0 ];
		}
		bs.TaxesPayableEnd = 0 - (parseFloat(n2171[1]) - parseFloat(n2171[0]));

		// 其他应交款 2176
		var n2176 = map.GetValue('2176').name;
		nlapiLogExecution('debug', 'n2176', n2176);
		if (!n2176) {
			n2176 = [ 0, 0 ];
		}
		bs.otherAccountsPayable = 0 - (parseFloat(n2176[1]) - parseFloat(n2176[0]));
		n2176 = endmap.GetValue('2176').name;
		nlapiLogExecution('debug', 'n2176', n2176);
		if (!n2176) {
			n2176 = [ 0, 0 ];
		}
		bs.otherAccountsPayableEnd = 0 - (parseFloat(n2176[1]) - parseFloat(n2176[0]));

		// 其他应付款 2181
		var n2181 = map.GetValue('2181').name;
		if (!n2181) {
			n2181 = [ 0, 0 ];
		}
		bs.OtherCreditors = 0 - (parseFloat(n2181[1]) - parseFloat(n2181[0]));
		n2181 = endmap.GetValue('2181').name;
		if (!n2181) {
			n2181 = [ 0, 0 ];
		}
		bs.OtherCreditorsEnd = 0 - (parseFloat(n2181[1]) - parseFloat(n2181[0]));

		// 预提费用 2191
		var n2191 = map.GetValue('2191').name;
		if (!n2191) {
			n2191 = [ 0, 0 ];
		}
		bs.accruedExpenses = 0 - (parseFloat(n2191[1]) - parseFloat(n2191[0]));
		n2191 = endmap.GetValue('2191').name;
		if (!n2191) {
			n2191 = [ 0, 0 ];
		}
		bs.accruedExpensesEnd = 0 - (parseFloat(n2191[1]) - parseFloat(n2191[0]));

		// 预计负债 2211
		var n2211 = map.GetValue('2211').name;
		if (!n2211) {
			n2211 = [ 0, 0 ];
		}
		bs.AccruedLiabilities = 0 - (parseFloat(n2211[1]) - parseFloat(n2211[0]));
		n2211 = endmap.GetValue('2211').name;
		if (!n2211) {
			n2211 = [ 0, 0 ];
		}
		bs.AccruedLiabilitiesEnd = 0 - (parseFloat(n2211[1]) - parseFloat(n2211[0]));

		// 一年内到期的长期负债 置0
		bs.currentMaturitiesOfLongTermDebt = parseFloat(0);
		bs.currentMaturitiesOfLongTermDebtEnd = parseFloat(0);

		// 其他流动负债 置0
		bs.OtherCurrentLiabilities = parseFloat(0);
		bs.OtherCurrentLiabilitiesEnd = parseFloat(0);

		// 如果其它应收款小于0，则放到其它应付款
		for (var i = 0; i < notconfirmmap.Count; i++) {
			var specialid = notconfirmmap.ArrayList[i];
			var specialvalue = notconfirmmap.GetValue(specialid).name;
			if (specialvalue && parseFloat(specialvalue) < 0) {
				bs.OtherCreditors -= parseFloat(specialvalue);
			}
		}
		for (var i = 0; i < notconfirmendmap.Count; i++) {
			var specialid = notconfirmendmap.ArrayList[i];
			var specialvalue = notconfirmendmap.GetValue(specialid).name;
			if (specialvalue && parseFloat(specialvalue) < 0) {
				bs.OtherCreditorsEnd -= parseFloat(specialvalue);
			}
		}

		// 流动负债合计
		bs.TotalCurrentLiabilities = parseFloat(bs.ShortTermLoans);
		bs.TotalCurrentLiabilities += parseFloat(bs.NotesPayable);
		bs.TotalCurrentLiabilities += parseFloat(bs.AccountsPayable);
		bs.TotalCurrentLiabilities += parseFloat(bs.AdvancesFromCustomers);
		bs.TotalCurrentLiabilities += parseFloat(bs.AccruedPayroll);
		bs.TotalCurrentLiabilities += parseFloat(bs.welfarePayable);
		bs.TotalCurrentLiabilities += parseFloat(bs.DividendsPayable);
		bs.TotalCurrentLiabilities += parseFloat(bs.TaxesPayable);
		bs.TotalCurrentLiabilities += parseFloat(bs.otherAccountsPayable);
		bs.TotalCurrentLiabilities += parseFloat(bs.OtherCreditors);
		bs.TotalCurrentLiabilities += parseFloat(bs.accruedExpenses);
		bs.TotalCurrentLiabilities += parseFloat(bs.AccruedLiabilities);
		bs.TotalCurrentLiabilities += parseFloat(bs.currentMaturitiesOfLongTermDebt);
		bs.TotalCurrentLiabilities += parseFloat(bs.OtherCurrentLiabilities);

		bs.TotalCurrentLiabilitiesEnd = parseFloat(bs.ShortTermLoansEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.NotesPayableEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.AccountsPayableEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.AdvancesFromCustomersEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.AccruedPayrollEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.welfarePayableEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.DividendsPayableEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.TaxesPayableEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.otherAccountsPayableEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.OtherCreditorsEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.accruedExpensesEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.AccruedLiabilitiesEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.currentMaturitiesOfLongTermDebtEnd);
		bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.OtherCurrentLiabilitiesEnd);

		/**
		 * 长期负债
		 */
		// 长期借款 2301
		var n2301 = map.GetValue('2301').name;
		if (!n2301) {
			n2301 = [ 0, 0 ];
		}
		bs.LongTermLoansPayable = 0 - (parseFloat(n2301[1]) - parseFloat(n2301[0]));
		n2301 = endmap.GetValue('2301').name;
		if (!n2301) {
			n2301 = [ 0, 0 ];
		}
		bs.LongTermLoansPayableEnd = 0 - (parseFloat(n2301[1]) - parseFloat(n2301[0]));

		// 应付债券 2311
		var n2311 = map.GetValue('2311').name;
		if (!n2311) {
			n2311 = [ 0, 0 ];
		}
		bs.BondsPayable = 0 - (parseFloat(n2311[1]) - parseFloat(n2311[0]));
		n2311 = endmap.GetValue('2311').name;
		if (!n2311) {
			n2311 = [ 0, 0 ];
		}
		bs.BondsPayableEnd = 0 - (parseFloat(n2311[1]) - parseFloat(n2311[0]));

		// 长期应付款 2321
		var n2321 = map.GetValue('2321').name;
		if (!n2321) {
			n2321 = [ 0, 0 ];
		}
		bs.longTermAccountsPayable = 0 - (parseFloat(n2321[1]) - parseFloat(n2321[0]));
		n2321 = endmap.GetValue('2321').name;
		if (!n2321) {
			n2321 = [ 0, 0 ];
		}
		bs.longTermAccountsPayableEnd = 0 - (parseFloat(n2321[1]) - parseFloat(n2321[0]));

		// 专项应付款 2331
		var n2331 = map.GetValue('2331').name;
		if (!n2331) {
			n2331 = [ 0, 0 ];
		}
		bs.SpecialAccountsPayable = 0 - (parseFloat(n2331[1]) - parseFloat(n2331[0]));
		n2331 = endmap.GetValue('2331').name;
		if (!n2331) {
			n2331 = [ 0, 0 ];
		}
		bs.SpecialAccountsPayableEnd = 0 - (parseFloat(n2331[1]) - parseFloat(n2331[0]));

		// 其他长期负债 置0
		bs.otherLongTermDebt = parseFloat(0);
		bs.otherLongTermDebtEnd = parseFloat(0);

		// 长期负债合计
		bs.totalLongTermLiabilities += parseFloat(bs.LongTermLoansPayable);
		bs.totalLongTermLiabilities += parseFloat(bs.BondsPayable);
		bs.totalLongTermLiabilities += parseFloat(bs.longTermAccountsPayable);
		bs.totalLongTermLiabilities += parseFloat(bs.SpecialAccountsPayable);
		bs.totalLongTermLiabilities += parseFloat(bs.otherLongTermDebt);

		bs.totalLongTermLiabilitiesEnd += parseFloat(bs.LongTermLoansPayableEnd);
		bs.totalLongTermLiabilitiesEnd += parseFloat(bs.BondsPayableEnd);
		bs.totalLongTermLiabilitiesEnd += parseFloat(bs.longTermAccountsPayableEnd);
		bs.totalLongTermLiabilitiesEnd += parseFloat(bs.SpecialAccountsPayableEnd);
		bs.totalLongTermLiabilitiesEnd += parseFloat(bs.otherLongTermDebtEnd);

		/**
		 * 递延税项
		 */
		// 递延所得税负债 2341
		var n2341 = map.GetValue('2341').name;
		if (!n2341) {
			n2341 = [ 0, 0 ];
		}
		bs.DeferredIncomeTaxLiabilities = 0 - (parseFloat(n2341[1]) - parseFloat(n2341[0]));
		n2341 = endmap.GetValue('2341').name;
		if (!n2341) {
			n2341 = [ 0, 0 ];
		}
		bs.DeferredIncomeTaxLiabilitiesEnd = 0 - (parseFloat(n2341[1]) - parseFloat(n2341[0]));

		// 负债合计
		bs.totalLiabilities = parseFloat(bs.TotalCurrentLiabilities)
				+ parseFloat(bs.totalLongTermLiabilities)
				+ parseFloat(bs.DeferredIncomeTaxLiabilities);
		bs.totalLiabilities = parseFloat(bs.totalLiabilities).toFixed(2);
		bs.totalLiabilitiesEnd = parseFloat(bs.TotalCurrentLiabilitiesEnd)
				+ parseFloat(bs.totalLongTermLiabilitiesEnd)
				+ parseFloat(bs.DeferredIncomeTaxLiabilitiesEnd);
		/**
		 * 少数股东权益 置0
		 */
		bs.minorityEquity = parseFloat(0);
		bs.minorityEquityEnd = parseFloat(0);

		/**
		 * 所有者权益
		 */
		// 实收资本（或股本）3101
		var n3101 = map.GetValue('3101').name;
		if (!n3101) {
			n3101 = [ 0, 0 ];
		}
		bs.SubscribedCapital = 0 - (parseFloat(n3101[1]) - parseFloat(n3101[0]));
		n3101 = endmap.GetValue('3101').name;
		if (!n3101) {
			n3101 = [ 0, 0 ];
		}
		bs.SubscribedCapitalEnd = 0 - (parseFloat(n3101[1]) - parseFloat(n3101[0]));

		// 资本公积 3111
		var n3111 = map.GetValue('3111').name;
		if (!n3111) {
			n3111 = [ 0, 0 ];
		}
		bs.CapitalSurplus = 0 - (parseFloat(n3111[1]) - parseFloat(n3111[0]));
		n3111 = endmap.GetValue('3111').name;
		if (!n3111) {
			n3111 = [ 0, 0 ];
		}
		bs.CapitalSurplusEnd = 0 - (parseFloat(n3111[1]) - parseFloat(n3111[0]));

		// 盈余公积 3121
		var n3121 = map.GetValue('3121').name;
		if (!n3121) {
			n3121 = [ 0, 0 ];
		}
		bs.SurplusReserve = 0 - (parseFloat(n3121[1]) - parseFloat(n3121[0]));
		n3121 = endmap.GetValue('3121').name;
		if (!n3121) {
			n3121 = [ 0, 0 ];
		}
		bs.SurplusReserveEnd = 0 - (parseFloat(n3121[1]) - parseFloat(n3121[0]));

		// 未确认的投资损失（以“-”号填列）
		bs.unaffirmedInvestmentLoss = parseFloat(0);
		bs.unaffirmedInvestmentLossEnd = parseFloat(0);

		// 未分配利润
		// 3141 + 3131 +
		// [6001,6401,6403,6051,5501,5502,5503,6701,6101,5201,5301,5601,5701];
		var ntotal6000 = 0;
		var ntotal6001 = 0;
		var n3141 = map.GetValue('3141').name;
		if (!n3141) {
			n3141 = [ 0, 0 ];
		}
		ntotal6000 = parseFloat(n3141[1]) - parseFloat(n3141[0]);
		n3141 = endmap.GetValue('3141').name;
		if (!n3141) {
			n3141 = [ 0, 0 ];
		}
		ntotal6001 = parseFloat(n3141[1]) - parseFloat(n3141[0]);

		var n3131 = map.GetValue('3131').name;
		if (!n3131) {
			n3131 = [ 0, 0 ];
		}
		ntotal6000 += parseFloat(n3131[1]) - parseFloat(n3131[0]);
		n3131 = endmap.GetValue('3131').name;
		if (!n3131) {
			n3131 = [ 0, 0 ];
		}
		ntotal6001 += parseFloat(n3131[1]) - parseFloat(n3131[0]);

		var arrtemp = this.GetundividedProfit(map, endmap);
		bs.RetainedEarnings = 0 - (parseFloat(ntotal6000) + parseFloat(arrtemp[0]));
		bs.RetainedEarningsEnd = 0 - (parseFloat(ntotal6001) + parseFloat(arrtemp[1]));

		// 外币报表折算差额
		bs.translationReserve = parseFloat(0);
		bs.translationReserveEnd = parseFloat(0);

		// 所有者权益（或股东权益）合计
		bs.TotalShareholdersEquity = parseFloat(bs.SubscribedCapital);
		bs.TotalShareholdersEquity += parseFloat(bs.CapitalSurplus);
		bs.TotalShareholdersEquity += parseFloat(bs.SurplusReserve);
		bs.TotalShareholdersEquity += parseFloat(bs.RetainedEarnings);

		bs.TotalShareholdersEquityEnd = parseFloat(bs.SubscribedCapitalEnd);
		bs.TotalShareholdersEquityEnd += parseFloat(bs.CapitalSurplusEnd);
		bs.TotalShareholdersEquityEnd += parseFloat(bs.SurplusReserveEnd);
		bs.TotalShareholdersEquityEnd += parseFloat(bs.RetainedEarningsEnd);

		// 负债和所有者权益（或股东权益）总计
		bs.TotalLiabilitiesEquity = parseFloat(bs.totalLiabilities)
				+ parseFloat(bs.TotalShareholdersEquity);
		bs.TotalLiabilitiesEquityEnd = parseFloat(bs.totalLiabilitiesEnd)
				+ parseFloat(bs.TotalShareholdersEquityEnd);

		// create by
		var arrname = rule.GetUserNameById();
		var name = arrname.custentity_chinese_name;
		if (!name) {
			name = arrname.entityid;
		}

		xml += template.GetBalanceSheetXML(bs, name);
		xml += template.GetFooterXML;
		xml += template.GetPDFClosingTagXML;

		var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
		filename = "BalanceSheet-" + filename + ".PDF";
		new trigger.local.write().WriteXMLToPDF(response, xml, filename);
	},

	GetUnConfirmAccounts : function(filters) {
		var map = new trigger.local.HashTable();
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_bs_not_confirm');
		savedsearch.addFilters(filters);
		var resultset = savedsearch.runSearch();
		var resultslice = resultset.getResults(0, 50);
		for ( var rs in resultslice) {
			var credit = resultslice[rs].getValue('creditamount', null, 'SUM');
			var debit = resultslice[rs].getValue('debitamount', null, 'SUM');
			var number = resultslice[rs].getValue('number', 'account', 'GROUP');
			if (!number || number == "0") {
				continue;
			}
			if (!credit) {
				credit = 0;
			}
			if (!debit) {
				debit = 0;
			}
			var val = parseFloat(debit) - parseFloat(credit);
			map.Add(number, new trigger.local.HashEntity(number, val));
			// nlapiLogExecution('debug', 'result',String.format(//
			// "{0}/{1}/{2}",number,credit,debit));
		}
		return map;
	},

	/**
	 * 存货
	 */
	GetTotalByIntentories : function(map, endmap) {
		var n = 0;
		var m = 0;
		// 物资采购 1201
		var n1201 = map.GetValue('1201').name;
		if (!n1201) {
			n1201 = [ 0, 0 ];
		}
		n = parseFloat(n1201[1]) - parseFloat(n1201[0]);
		n1201 = endmap.GetValue('1201').name;
		if (!n1201) {
			n1201 = [ 0, 0 ];
		}
		m = parseFloat(n1201[1]) - parseFloat(n1201[0]);

		// var n1402 = map.GetValue('1402').name;delete!
		// if (!n1402) {
		// n1402 = [ 0, 0 ];
		// }
		// n += parseFloat(n1402[1]) - parseFloat(n1402[0]);
		// n1402 = endmap.GetValue('1402').name;
		// if (!n1402) {
		// n1402 = [ 0, 0 ];
		// }
		// m += parseFloat(n1402[1]) - parseFloat(n1402[0]);

		// 原材料 1211
		var n1211 = map.GetValue('1211').name;
		if (!n1211) {
			n1211 = [ 0, 0 ];
		}
		n += parseFloat(n1211[1]) - parseFloat(n1211[0]);
		n1211 = endmap.GetValue('1211').name;
		if (!n1211) {
			n1211 = [ 0, 0 ];
		}
		m += parseFloat(n1211[1]) - parseFloat(n1211[0]);

		// 材料成本差异 1232
		var n1232 = map.GetValue('1232').name;
		if (!n1232) {
			n1232 = [ 0, 0 ];
		}
		n += parseFloat(n1232[1]) - parseFloat(n1232[0]);
		n1232 = endmap.GetValue('1232').name;
		if (!n1232) {
			n1232 = [ 0, 0 ];
		}
		m += parseFloat(n1232[1]) - parseFloat(n1232[0]);

		// 库存商品 1243
		var n1243 = map.GetValue('1243').name;
		if (!n1243) {
			n1243 = [ 0, 0 ];
		}
		n += parseFloat(n1243[1]) - parseFloat(n1243[0]);
		n1243 = endmap.GetValue('1243').name;
		if (!n1243) {
			n1243 = [ 0, 0 ];
		}
		m += parseFloat(n1243[1]) - parseFloat(n1243[0]);
		// delete
		// var n1406 = map.GetValue('1406').name;
		// if (!n1406) {
		// n1406 = [ 0, 0 ];
		// }
		// n += parseFloat(n1406[1]) - parseFloat(n1406[0]);
		// n1406 = endmap.GetValue('1406').name;
		// if (!n1406) {
		// n1406 = [ 0, 0 ];
		// }
		// m += parseFloat(n1406[1]) - parseFloat(n1406[0]);

		// 商品进销差价 1244
		var n1244 = map.GetValue('1244').name;
		if (!n1244) {
			n1244 = [ 0, 0 ];
		}
		n += parseFloat(n1244[1]) - parseFloat(n1244[0]);
		n1244 = endmap.GetValue('1244').name;
		if (!n1244) {
			n1244 = [ 0, 0 ];
		}
		m += parseFloat(n1244[1]) - parseFloat(n1244[0]);

		// 委托加工物资 1251
		var n1251 = map.GetValue('1251').name;
		if (!n1251) {
			n1251 = [ 0, 0 ];
		}
		n += parseFloat(n1251[1]) - parseFloat(n1251[0]);
		n1251 = endmap.GetValue('1251').name;
		if (!n1251) {
			n1251 = [ 0, 0 ];
		}
		m += parseFloat(n1251[1]) - parseFloat(n1251[0]);

		// delete
		// var n1411 = map.GetValue('1411').name;
		// if (!n1411) {
		// n1411 = [ 0, 0 ];
		// }
		// n += parseFloat(n1411[1]) - parseFloat(n1411[0]);
		// n1411 = endmap.GetValue('1411').name;
		// if (!n1411) {
		// n1411 = [ 0, 0 ];
		// }
		// m += parseFloat(n1411[1]) - parseFloat(n1411[0]);

		// 包装物 1221 new
		var n1221 = map.GetValue('1221').name;
		if (!n1221) {
			n1221 = [ 0, 0 ];
		}
		n += parseFloat(n1221[1]) - parseFloat(n1221[0]);
		n1221 = endmap.GetValue('1221').name;
		if (!n1221) {
			n1221 = [ 0, 0 ];
		}
		m += parseFloat(n1221[1]) - parseFloat(n1221[0]);

		// 低值易耗品 1231 new
		var n1231 = map.GetValue('1231').name;
		if (!n1231) {
			n1231 = [ 0, 0 ];
		}
		n += parseFloat(n1221[1]) - parseFloat(n1221[0]);
		n1231 = endmap.GetValue('1231').name;
		if (!n1231) {
			n1231 = [ 0, 0 ];
		}
		m += parseFloat(n1221[1]) - parseFloat(n1221[0]);

		// 自制半成品1241 new
		var n1241 = map.GetValue('1241').name;
		if (!n1241) {
			n1241 = [ 0, 0 ];
		}
		n += parseFloat(n1241[1]) - parseFloat(n1241[0]);
		n1241 = endmap.GetValue('1241').name;
		if (!n1241) {
			n1241 = [ 0, 0 ];
		}
		m += parseFloat(n1241[1]) - parseFloat(n1241[0]);

		// 委托代销商品 1261 new
		var n1261 = map.GetValue('1261').name;
		if (!n1261) {
			n1261 = [ 0, 0 ];
		}
		n += parseFloat(n1261[1]) - parseFloat(n1261[0]);
		n1261 = endmap.GetValue('1261').name;
		if (!n1261) {
			n1261 = [ 0, 0 ];
		}
		m += parseFloat(n1261[1]) - parseFloat(n1261[0]);

		// 受托代销商品 1271 new
		var n1271 = map.GetValue('1271').name;
		if (!n1271) {
			n1271 = [ 0, 0 ];
		}
		n += parseFloat(n1271[1]) - parseFloat(n1271[0]);
		n1271 = endmap.GetValue('1271').name;
		if (!n1271) {
			n1271 = [ 0, 0 ];
		}
		m += parseFloat(n1271[1]) - parseFloat(n1271[0]);

		// delete
		// var n1421 = map.GetValue('1421').name;
		// if (!n1421) {
		// n1421 = [ 0, 0 ];
		// }
		// n += parseFloat(n1421[1]) - parseFloat(n1421[0]);
		// n1421 = endmap.GetValue('1421').name;
		// if (!n1421) {
		// n1421 = [ 0, 0 ];
		// }
		// m += parseFloat(n1421[1]) - parseFloat(n1421[0]);

		// delete
		// var n1461 = map.GetValue('1461').name;
		// if (!n1461) {
		// n1461 = [ 0, 0 ];
		// }
		// n += parseFloat(n1461[1]) - parseFloat(n1461[0]);
		// n1461 = endmap.GetValue('1461').name;
		// if (!n1461) {
		// n1461 = [ 0, 0 ];
		// }
		// m += parseFloat(n1461[1]) - parseFloat(n1461[0]);

		// 1281 存货跌价准备
		var n1281 = map.GetValue('1281').name;
		if (!n1281) {
			n1281 = [ 0, 0 ];
		}
		n += parseFloat(n1281[1]) - parseFloat(n1281[0]);
		n1281 = endmap.GetValue('1281').name;
		if (!n1281) {
			n1281 = [ 0, 0 ];
		}
		m += parseFloat(n1281[1]) - parseFloat(n1281[0]);

		// 分期收款发出商品 1291 new
		var n1291 = map.GetValue('1291').name;
		if (!n1291) {
			n1291 = [ 0, 0 ];
		}
		n += parseFloat(n1291[1]) - parseFloat(n1291[0]);
		n1291 = endmap.GetValue('1291').name;
		if (!n1291) {
			n1291 = [ 0, 0 ];
		}
		m += parseFloat(n1291[1]) - parseFloat(n1291[0]);

		// delete
		// var n1611 = map.GetValue('1611').name;
		// if (!n1611) {
		// n1611 = [ 0, 0 ];
		// }
		// n += parseFloat(n1611[1]) - parseFloat(n1611[0]);
		// n1611 = endmap.GetValue('1611').name;
		// if (!n1611) {
		// n1611 = [ 0, 0 ];
		// }
		// m += parseFloat(n1611[1]) - parseFloat(n1611[0]);

		// delete
		// var n1321 = map.GetValue('1321').name;
		// if (!n1321) {
		// n1321 = [ 0, 0 ];
		// }
		// n += parseFloat(n1321[1]) - parseFloat(n1321[0]);
		// n1321 = endmap.GetValue('1321').name;
		// if (!n1321) {
		// n1321 = [ 0, 0 ];
		// }
		// m += parseFloat(n1321[1]) - parseFloat(n1321[0]);

		// delete
		// var n2134 = map.GetValue('2134').name;
		// if (!n2134) {
		// n2134 = [ 0, 0 ];
		// }
		// n += parseFloat(n2134[1]) - parseFloat(n2134[0]);
		// n2134 = endmap.GetValue('2134').name;
		// if (!n2134) {
		// n2134 = [ 0, 0 ];
		// }
		// m += parseFloat(n2134[1]) - parseFloat(n2134[0]);

		// 生产成本4101
		var n4101 = map.GetValue('4101').name;
		if (!n4101) {
			n4101 = [ 0, 0 ];
		}
		n += parseFloat(n4101[1]) - parseFloat(n4101[0]);
		n4101 = endmap.GetValue('4101').name;
		if (!n4101) {
			n4101 = [ 0, 0 ];
		}
		m += parseFloat(n4101[1]) - parseFloat(n4101[0]);

		// 劳务成本4107
		var n4107 = map.GetValue('4107').name;
		if (!n4107) {
			n4107 = [ 0, 0 ];
		}
		n += parseFloat(n4107[1]) - parseFloat(n4107[0]);
		n4107 = endmap.GetValue('4107').name;
		if (!n4107) {
			n4107 = [ 0, 0 ];
		}
		m += parseFloat(n4107[1]) - parseFloat(n4107[0]);

		return [ n, m ];
	},
	/**
	 * 未分配利润
	 */
	GetundividedProfit : function(map, endmap) {
		// 主营业务收入参数 5101
		// 主营业务收入数据
		var n = 0;
		var m = 0;
		var n5101 = map.GetValue('5101').name;
		if (!n5101) {
			n5101 = [ 0, 0 ];
		}
		n = parseFloat(n5101[1]) - parseFloat(n5101[0]);
		n5101 = endmap.GetValue('5101').name;
		if (!n5101) {
			n5101 = [ 0, 0 ];
		}
		m = parseFloat(n5101[1]) - parseFloat(n5101[0]);

		// 其它业务收入参数 5102
		var n5102 = map.GetValue('5102').name;
		if (!n5102) {
			n5102 = [ 0, 0 ];
		}
		n += parseFloat(n5102[1]) - parseFloat(n5102[0]);
		n5102 = endmap.GetValue('5102').name;
		if (!n5102) {
			n5102 = [ 0, 0 ];
		}
		m += parseFloat(n5102[1]) - parseFloat(n5102[0]);

		// 主营业务成本 6401
		var n5401 = map.GetValue('5401').name;
		if (!n5401) {
			n5401 = [ 0, 0 ];
		}
		n += parseFloat(n5401[1]) - parseFloat(n5401[0]);
		n5401 = endmap.GetValue('5401').name;
		if (!n5401) {
			n5401 = [ 0, 0 ];
		}
		m += parseFloat(n5401[1]) - parseFloat(n5401[0]);

		// 其它业务成本 5405
		var n5405 = map.GetValue('5405').name;
		if (!n5405) {
			n5405 = [ 0, 0 ];
		}
		n += parseFloat(n5405[1]) - parseFloat(n5405[0]);
		n5405 = endmap.GetValue('5405').name;
		if (!n5405) {
			n5405 = [ 0, 0 ];
		}
		m += parseFloat(n5405[1]) - parseFloat(n5405[0]);

		// 营业税金及附加 5402
		var n5402 = map.GetValue('5402').name;
		if (!n5402) {
			n5402 = [ 0, 0 ];
		}
		n += parseFloat(n5402[1]) - parseFloat(n5402[0]);
		n5402 = endmap.GetValue('5402').name;
		if (!n5402) {
			n5402 = [ 0, 0 ];
		}
		m += parseFloat(n5402[1]) - parseFloat(n5402[0]);

		// 销售费用 5501
		var n5501 = map.GetValue('5501').name;
		if (!n5501) {
			n5501 = [ 0, 0 ];
		}
		n += parseFloat(n5501[1]) - parseFloat(n5501[0]);
		n5501 = endmap.GetValue('5501').name;
		if (!n5501) {
			n5501 = [ 0, 0 ];
		}
		m += parseFloat(n5501[1]) - parseFloat(n5501[0]);

		// 管理费用 5502
		var n5502 = map.GetValue('5502').name;
		if (!n5502) {
			n5502 = [ 0, 0 ];
		}
		n += parseFloat(n5502[1]) - parseFloat(n5502[0]);
		n5502 = endmap.GetValue('5502').name;
		if (!n5502) {
			n5502 = [ 0, 0 ];
		}
		m += parseFloat(n5502[1]) - parseFloat(n5502[0]);

		// 账务费用 5503
		var n5503 = map.GetValue('5503').name;
		if (!n5503) {
			n5503 = [ 0, 0 ];
		}
		n += parseFloat(n5503[1]) - parseFloat(n5503[0]);
		n5503 = endmap.GetValue('5503').name;
		if (!n5503) {
			n5503 = [ 0, 0 ];
		}
		m += parseFloat(n5503[1]) - parseFloat(n5503[0]);

		// 资产减值损失 6701 delete
		// var n6701 = map.GetValue('6701').name;
		// if (!n6701) {
		// n6701 = [ 0, 0 ];
		// }
		// n += parseFloat(n6701[1]) - parseFloat(n6701[0]);
		// n6701 = endmap.GetValue('6701').name;
		// if (!n6701) {
		// n6701 = [ 0, 0 ];
		// }
		// m += parseFloat(n6701[1]) - parseFloat(n6701[0]);

		// 加：公允价值变动收益 6101 delete
		// var n6101 = map.GetValue('6101').name;
		// if (!n6101) {
		// n6101 = [ 0, 0 ];
		// }
		// n += parseFloat(n6101[1]) - parseFloat(n6101[0]);
		// n6101 = endmap.GetValue('6101').name;
		// if (!n6101) {
		// n6101 = [ 0, 0 ];
		// }
		// m += parseFloat(n6101[1]) - parseFloat(n6101[0]);

		// 加：投资收益 5201
		var n5201 = map.GetValue('5201').name;
		if (!n5201) {
			n5201 = [ 0, 0 ];
		}
		n += parseFloat(n5201[1]) - parseFloat(n5201[0]);
		n5201 = endmap.GetValue('5201').name;
		if (!n5201) {
			n5201 = [ 0, 0 ];
		}
		m += parseFloat(n5201[1]) - parseFloat(n5201[0]);

		// 营业外收入 5301
		var n5301 = map.GetValue('5301').name;
		if (!n5301) {
			n5301 = [ 0, 0 ];
		}
		n += parseFloat(n5301[1]) - parseFloat(n5301[0]);
		n5301 = endmap.GetValue('5301').name;
		if (!n5301) {
			n5301 = [ 0, 0 ];
		}
		m += parseFloat(n5301[1]) - parseFloat(n5301[0]);

		// 营业外支出 5601
		var n5601 = map.GetValue('5601').name;
		if (!n5601) {
			n5601 = [ 0, 0 ];
		}
		n += parseFloat(n5601[1]) - parseFloat(n5601[0]);
		n5601 = endmap.GetValue('5601').name;
		if (!n5601) {
			n5601 = [ 0, 0 ];
		}
		m += parseFloat(n5601[1]) - parseFloat(n5601[0]);

		// 以前年度损益调整 5801
		var n5801 = map.GetValue('5801').name;
		if (!n5801) {
			n5801 = [ 0, 0 ];
		}
		n += parseFloat(n5801[1]) - parseFloat(n5801[0]);
		n5801 = endmap.GetValue('5801').name;
		if (!n5801) {
			n5801 = [ 0, 0 ];
		}
		m += parseFloat(n5801[1]) - parseFloat(n5801[0]);

		// 所得税费用 5701
		var n5701 = map.GetValue('5701').name;
		if (!n5701) {
			n5701 = [ 0, 0 ];
		}
		n += parseFloat(n5701[1]) - parseFloat(n5701[0]);
		n5701 = endmap.GetValue('5701').name;
		if (!n5701) {
			n5701 = [ 0, 0 ];
		}
		m += parseFloat(n5701[1]) - parseFloat(n5701[0]);
		return [ n, m ];
	},

	/**
	 * get the results from the saved search that is sum by some of account and
	 * period date
	 * 
	 * @param date
	 *            传入参数
	 */
	GetSumRecordsBySomeOfItem : function(internalids, date) {
		if (!date || !internalids) {
			return 0;
		}
		var filters = [];
		filters[0] = new nlobjSearchFilter('internalid', 'account', 'anyof',
				internalids);
		filters[1] = new nlobjSearchFilter('trandate', null, 'onorbefore', date);
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_balance_sheet');
		savedsearch.addFilters(filters);
		var resultset = savedsearch.runSearch();
		var resultslice = resultset.getResults(0, 1);

		var credit = resultslice[0].getValue('creditamount', null, 'sum');
		var debit = resultslice[0].getValue('debitamount', null, 'sum');
		return debit - credit;
	}
};