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

			retainedEarningsFilters[retainedEarningsFilters.length] = new nlobjSearchFilter(
					'startdate', 'accountingperiod', 'before',
					beginningOfYearPeriod);
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

		// nlapiLogExecution('debug', 'xml', xml);

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

		// 查询RE科目本月及之前JE数据
		var beginREList = this.GetREByDate(filters);// 期初
		var currentREList = this.GetREByDate(filter);// 本期
		if (beginREList.length == 0) {
			beginREList = [ 0, 0 ];
		}
		if (currentREList.length == 0) {
			currentREList = [ 0, 0 ];
		}
		var REBalance = beginREList[0] - beginREList[1] + currentREList[0]
				- currentREList[1];
		var REDebit = 0;
		var RECebit = 0;
		if (REBalance > 0) {
			REDebit = REBalance;
			RECebit = 0;
		} else {
			REDebit = 0;
			RECebit = REBalance;
		}

		// 期初数值
		var beginREBalance = beginREList[0] - beginREList[1];
		var beginREDebit = 0;
		var beginRECebit = 0;
		if (beginREBalance > 0) {
			beginREDebit = beginREBalance;
			beginRECebit = 0;
		} else {
			beginREDebit = 0;
			beginRECebit = beginREBalance;
		}
		// 新增Retained Earnings科目 add by joe 20180531
		var profit = this.GetProfitRecords(retainedEarningsFilters);
		var sumRE = Object.create(trigger.local.entity.TrialBalance);
		sumRE.name = '314104 利润分配 Retained Earnings-30311104';
		if (profit.netprofit > 0) {
			sumRE.beginCredit = profit.netprofit + beginRECebit;
			sumRE.beginDebit = 0 + beginREDebit;
			sumRE.currentCredit = currentREList[1];
			sumRE.currentDebit = currentREList[0];
			sumRE.endCredit = profit.netprofit + RECebit;
			sumRE.endDebit = 0 + REDebit;
		} else {
			sumRE.beginCredit = 0 + beginECebit;
			sumRE.beginDebit = profit.netprofit + beginREDebit;
			sumRE.currentCredit = currentREList[1];
			sumRE.currentDebit = currentREList[0];
			sumRE.endDebit = profit.netprofit + REDebit;
			sumRE.endCredit = 0 + RECebit;
		}
		sumRE.beginCredit = com.formatCurrency(sumRE.beginCredit);
		sumRE.beginDebit = com.formatCurrency(sumRE.beginDebit);
		sumRE.currentCredit = com.formatCurrency(sumRE.currentCredit);
		sumRE.currentDebit = com.formatCurrency(sumRE.currentDebit);
		sumRE.endCredit = com.formatCurrency(sumRE.endCredit);
		sumRE.endDebit = com.formatCurrency(sumRE.endDebit);
		xml += template.GetTrialBalanceXML(sumRE);

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
	GetProfitRecords : function(filters) {
		var strid = "5405,5402,5102,5501,5503,5201,5301,5601,5701,5801,5101,5401,5502,5203";
		var sql = rule.GetSQLFromMappingRecords(strid);

		// nlapiLogExecution('debug', 'PROFIT-SQL',sql);

		var column = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
		column.setFormula(sql);

		var map = this.GetProfitSUMOfRecordsByCNID(filters, column);

		var profit = Object.create(trigger.local.entity.ProfitAndLoss);
		// 主营业务收入参数 5101
		// 主营业务收入数据
		var n5101 = map.GetValue('5101').name;
		if (!n5101) {
			n5101 = [ 0, 0 ];
		}
		profit.income = parseFloat(n5101[1]) - parseFloat(n5101[0]);

		// 其它业务收入参数 5102
		var n5102 = map.GetValue('5102').name;
		if (!n5102) {
			n5102 = [ 0, 0 ];
		}
		profit.otherincome = parseFloat(n5102[1]) - parseFloat(n5102[0]);

		// 主营业务成本 5401
		var n5401 = map.GetValue('5401').name;
		if (!n5401) {
			n5401 = [ 0, 0 ];
		}
		profit.maincost = parseFloat(n5401[1]) - parseFloat(n5401[0]);

		// 其它业务成本 5405
		var n5405 = map.GetValue('5405').name;
		if (!n5405) {
			n5405 = [ 0, 0 ];
		}
		profit.othercost = parseFloat(n5405[1]) - parseFloat(n5405[0]);

		// 营业税金及附加 5402
		var n5402 = map.GetValue('5402').name;
		if (!n5402) {
			n5402 = [ 0, 0 ];
		}
		profit.maintax = parseFloat(n5402[1]) - parseFloat(n5402[0]);

		// 营业收入
		profit.allincome = 0 - (parseFloat(profit.income) + parseFloat(profit.otherincome));

		// 营业成本
		profit.operatingcost = parseFloat(profit.maincost)
				+ parseFloat(profit.othercost);

		// 经营利润
		profit.earnprofit = profit.allincome - profit.operatingcost
				- profit.maintax;

		// 其它业务利润
		profit.otherprofit = 0 - (profit.otherincome - profit.othercost);
		// nlapiLogExecution('debug', '其它业务利润',profit.otherincome + '/' +
		// profit.othercost);

		// 销售费用 5501
		var n5501 = map.GetValue('5501').name;
		if (!n5501) {
			n5501 = [ 0, 0 ];
		}
		profit.sellcost = parseFloat(n5501[1]) - parseFloat(n5501[0]);

		// 管理费用 5502
		var n5502 = map.GetValue('5502').name;
		if (!n5502) {
			n5502 = [ 0, 0 ];
		}
		profit.managercost = parseFloat(n5502[1]) - parseFloat(n5502[0]);

		// 财务费用 5503
		var n5503 = map.GetValue('5503').name;
		if (!n5503) {
			n5503 = [ 0, 0 ];
		}
		profit.financialcost = parseFloat(n5503[1]) - parseFloat(n5503[0]);

		// 加：投资收益 5201
		var n5201 = map.GetValue('5201').name;
		if (!n5201) {
			n5201 = [ 0, 0 ];
		}
		profit.investmentincome = parseFloat(n5201[1]) - parseFloat(n5201[0]);

		// 加：补贴收入5203
		var n5203 = map.GetValue('5203').name;
		if (!n5203) {
			n5203 = [ 0, 0 ];
		}
		profit.subsidyincome = parseFloat(n5203[1]) - parseFloat(n5203[0]);

		// 营业利润
		profit.operatingprofit = profit.allincome;
		profit.operatingprofit -= profit.operatingcost;
		profit.operatingprofit -= profit.maintax;
		profit.operatingprofit -= profit.sellcost;
		profit.operatingprofit -= profit.managercost;
		profit.operatingprofit -= profit.financialcost;
		profit.operatingprofit += profit.investmentincome;
		profit.operatingprofit += profit.subsidyincome;

		// 营业外收入 5301
		var n5301 = map.GetValue('5301').name;
		if (!n5301) {
			n5301 = [ 0, 0 ];
		}
		profit.outsideincome = 0 - (parseFloat(n5301[1]) - parseFloat(n5301[0]));

		// 营业外支出 5601
		var n5601 = map.GetValue('5601').name;
		if (!n5601) {
			n5601 = [ 0, 0 ];
		}
		profit.outsidecost = parseFloat(n5601[1]) - parseFloat(n5601[0]);

		// 以前年度损益调整 5801
		var n5801 = map.GetValue('5801').name;
		if (!n5801) {
			n5801 = [ 0, 0 ];
		}
		profit.profitandlossadjust = parseFloat(n5801[1])
				- parseFloat(n5801[0]);

		// 利润总额
		profit.totalprofit = profit.operatingprofit + profit.outsideincome;
		profit.totalprofit -= profit.outsidecost;

		// 所得税 5701
		var n5701 = map.GetValue('5701').name;
		if (!n5701) {
			n5701 = [ 0, 0 ];
		}
		profit.tax = parseFloat(n5701[1]) - parseFloat(n5701[0]);

		// 净利润
		profit.netprofit = profit.totalprofit - profit.tax;
		return profit;
	},

	GetProfitSUMOfRecordsByCNID : function(filters, column) {
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_balance_sheet');

		if (filters.length > 0) {
			savedsearch.addFilters(filters);
			filters = savedsearch.getFilters();
		}
		if (column) {
			savedsearch.addColumns([ column ]);
		}
		var resultset = savedsearch.runSearch();
		var map = new trigger.local.HashTable();

		var resultslice = resultset.getResults(0, 50);
		for ( var rs in resultslice) {
			var credit = resultslice[rs].getValue('creditamount', null, 'SUM');
			var debit = resultslice[rs].getValue('debitamount', null, 'SUM');
			var number = resultslice[rs].getValue(column);
			if (!credit) {
				credit = 0;
			}
			if (!debit) {
				debit = 0;
			}
			map.Add(number, new trigger.local.HashEntity(number, [ credit,
					debit ]));
			// nlapiLogExecution('debug', 'result',number+'/'+credit+'/'+debit);
		}
		return map;
	},
	GetREByDate : function(filter) {
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_pl_trial_blnc_2');
		if (filter.length > 0) {
			savedsearch.addFilters(filter);
		}
		var resultset = savedsearch.runSearch();
		var list = [];
		var resultslice = resultset.getResults(0, 1000);

		for ( var rs in resultslice) {

			var cols = resultslice[rs].getAllColumns();
			var NSAccount = resultslice[rs].getValue(cols[0]);
			var localDebit = resultslice[rs].getValue(cols[5]);
			var loacalCredit = resultslice[rs].getValue(cols[6]);

			if (!localDebit) {
				localDebit = 0;
			}
			if (!loacalCredit) {
				loacalCredit = 0;
			}
			if (NSAccount == '52') {
				list.push(localDebit);
				list.push(loacalCredit);
			}

		}

		return list;
	}
};