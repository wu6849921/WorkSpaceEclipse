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
			// retainedEarningsFilters[retainedEarningsFilters.length] = new
			// nlobjSearchFilter(
			// 'startdate', 'accountingperiod', 'onorafter', '1/1/2016');

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

		// Retained Earnings值
		var reDebitCN = 0;
		var reCrebitCN = 0;
		var reDebitAdj = 0;
		var reCrebitAdj = 0;
		var reDebitUS = 0;
		var reCrebitUS = 0;

		// SUM
		var sumDebitCN = 0;
		var sumCrebitCN = 0;
		var sumDebitAdj = 0;
		var sumCrebitAdj = 0;
		var sumDebitUS = 0;
		var sumCrebitUS = 0;
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

			// 如果无中方映射 则中方不显示数据
			if (renderData.cnAccountName == '') {
				renderData.cnDebit = 0;
				renderData.cnCredit = 0;
			}
			// SUM
			sumDebitCN += renderData.cnDebit;
			sumCrebitCN += renderData.cnCredit;
			sumDebitAdj += renderData.adjDebit;
			sumCrebitAdj += renderData.adjCredit;
			sumDebitUS += renderData.usDebit;
			sumCrebitUS += renderData.usCredit;

			renderData.cnDebit = com.formatCurrency(renderData.cnDebit);
			renderData.cnCredit = com.formatCurrency(renderData.cnCredit);
			renderData.adjDebit = com.formatCurrency(renderData.adjDebit);
			renderData.adjCredit = com.formatCurrency(renderData.adjCredit);
			renderData.usDebit = com.formatCurrency(renderData.usDebit);
			renderData.usCredit = com.formatCurrency(renderData.usCredit);
			xml += template.GetTrialBalanceXML1(renderData);

			// 得到Retained Earnings科目的值
			if (NSAccountId == '52') {
				reDebitCN = renderData.cnDebit;
				reCrebitCN = renderData.cnCredit;
				reDebitAdj = renderData.adjDebit;
				reCrebitAdj = renderData.adjCredit;
				reDebitUS = renderData.usDebit;
				reCrebitUS = renderData.usCredit;
			}

		}
		// nlapiLogExecution('debug', 'sumDebitCN', sumDebitCN);

		// 加入Retained Earnings科目 net profits + JE(Retained Earnings)
		// Retained Earnings credit增长 正数
		var profit = this.GetProfitRecords(retainedEarningsFilters);
		// nlapiLogExecution('debug', 'profit.netprofit', profit.netprofit);
		var renderDataRE = Object.create(trigger.local.entity.TrialBalance1);
		renderDataRE.cnCredit = 0;
		renderDataRE.cnDebit = 0;
		renderDataRE.cnAccountName = '314104 利润分配 Retained Earnings-30311104';
		// nlapiLogExecution('debug', 'profit.USnetprofit', profit.USnetprofit);
		// nlapiLogExecution('debug', 'reCrebitUS', reCrebitUS);
		// nlapiLogExecution('debug', 'reDebitUS', reDebitUS);
		if (profit.CNnetprofit > 0) {
			renderDataRE.cnCredit = profit.CNnetprofit + reCrebitCN;
			renderDataRE.cnDebit = reDebitCN;
		} else {
			renderDataRE.cnCredit = reCrebitCN;
			renderDataRE.cnDebit = profit.CNnetprofit * -1 + reDebitCN;
		}
		if (profit.Adjnetprofit > 0) {
			renderDataRE.adjCredit = profit.Adjnetprofit + reCrebitAdj;
			renderDataRE.adjDebit = reDebitAdj;
		} else {
			renderDataRE.adjCredit = reCrebitAdj;
			renderDataRE.adjDebit = profit.Adjnetprofit * -1 + reDebitAdj;
		}

		if (profit.USnetprofit > 0) {
			renderDataRE.usCredit = profit.USnetprofit + reCrebitUS;
			renderDataRE.usDebit = reDebitUS;
		} else {
			renderDataRE.usCredit = reCrebitUS;
			renderDataRE.usDebit = profit.USnetprofit * -1 + reDebitUS;
		}

		renderDataRE.nsAccountName = '30311104 Retained Earnings';
		// nlapiLogExecution('debug', 'CNnetprofit Adjnetprofit USnetprofit',
		// profit.CNnetprofit + '|' + profit.Adjnetprofit + '|'
		// + profit.USnetprofit);
		xml += template.GetTrialBalanceXML1(renderDataRE);

		// SUM
		sumDebitCN += renderDataRE.cnDebit;
		sumCrebitCN += renderDataRE.cnCredit;
		sumDebitAdj += renderDataRE.adjDebit;
		sumCrebitAdj += renderDataRE.adjCredit;
		sumDebitUS += renderDataRE.usDebit;
		sumCrebitUS += renderDataRE.usCredit;
		var renderDataSum = Object.create(trigger.local.entity.TrialBalance1);
		renderDataSum.cnAccountName = '合计';
		renderDataSum.cnDebit = com.formatCurrency(sumDebitCN);
		renderDataSum.cnCredit = com.formatCurrency(sumCrebitCN);
		renderDataSum.adjDebit = com.formatCurrency(sumDebitAdj);
		renderDataSum.adjCredit = com.formatCurrency(sumCrebitAdj);
		renderDataSum.usDebit = com.formatCurrency(sumDebitUS);
		renderDataSum.usCredit = com.formatCurrency(sumCrebitUS);
		xml += template.GetTrialBalanceXML1(renderDataSum);

		xml += template.GetTrialBalanceXMLFoot1;
		// nlapiLogExecution('debug', 'xml', xml);
		var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
		filename = "Trial Ledger2-" + filename + ".xls";
		new trigger.local.write1().WriteXMLToXlsx(response, xml, filename);
	},

	GetProfitRecords : function(retainedEarningsFilters) {
		var strid = "5405,5402,5102,5501,5503,5201,5301,5601,5701,5801,5101,5401,5502,5203";
		var sql = rule.GetSQLFromMappingRecords(strid);

		var column = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
		column.setFormula(sql);
		var map = this.GetProfitSUMOfRecordsByCNID(retainedEarningsFilters,
				column);

		var profit = Object.create(trigger.local.entity.ProfitAndLoss2);

		// 主营业务收入参数 5101
		var n5101 = map.GetValue('5101').name;
		if (!n5101) {
			n5101 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNincome = parseFloat(n5101[0]) - parseFloat(n5101[1]);
		var Adjincome = parseFloat(n5101[2]) - parseFloat(n5101[3]);
		var USincome = parseFloat(n5101[4]) - parseFloat(n5101[5]);

		// 其它业务收入参数 5102
		var n5102 = map.GetValue('5102').name;
		if (!n5102) {
			n5102 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNotherincome = parseFloat(n5102[0]) - parseFloat(n5102[1]);
		var Adjotherincome = parseFloat(n5102[2]) - parseFloat(n5102[3]);
		var USotherincome = parseFloat(n5102[4]) - parseFloat(n5102[5]);

		// nlapiLogExecution('debug', 'n5102[4]', n5102[4] + '|' + n5102[5]);

		// 主营业务成本 5401
		var n5401 = map.GetValue('5401').name;
		if (!n5401) {
			n5401 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNmaincost = parseFloat(n5401[0]) - parseFloat(n5401[1]);
		var Adjmaincost = parseFloat(n5401[2]) - parseFloat(n5401[3]);
		var USmaincost = parseFloat(n5401[4]) - parseFloat(n5401[5]);

		// 其它业务成本 5405
		var n5405 = map.GetValue('5405').name;
		if (!n5405) {
			n5405 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNothercost = parseFloat(n5405[0]) - parseFloat(n5405[1]);
		var Adjothercost = parseFloat(n5405[2]) - parseFloat(n5405[3]);
		var USothercost = parseFloat(n5405[4]) - parseFloat(n5405[5]);

		// 营业税金及附加 5402
		var n5402 = map.GetValue('5402').name;
		if (!n5402) {
			n5402 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNmaintax = parseFloat(n5402[0]) - parseFloat(n5402[1]);
		var Adjmaintax = parseFloat(n5402[2]) - parseFloat(n5402[3]);
		var USmaintax = parseFloat(n5402[4]) - parseFloat(n5402[5]);

		// 营业收入
		var CNallincome = 0 - (parseFloat(CNincome) + parseFloat(CNotherincome));
		var Adjallincome = 0 - (parseFloat(Adjincome) + parseFloat(Adjotherincome));
		var USallincome = 0 - (parseFloat(USincome) + parseFloat(USotherincome));
		// nlapiLogExecution('debug', 'USincome', USincome + '|' +
		// USotherincome);

		// 营业成本
		var CNoperatingcost = parseFloat(CNmaincost) + parseFloat(CNothercost);
		var Adjoperatingcost = parseFloat(Adjmaincost)
				+ parseFloat(Adjothercost);
		var USoperatingcost = parseFloat(USmaincost) + parseFloat(USothercost);

		// 经营利润
		var CNearnprofit = CNallincome - CNoperatingcost - CNmaintax;
		var Adjearnprofit = Adjallincome - Adjoperatingcost - Adjmaintax;
		var USearnprofit = USallincome - USoperatingcost - USmaintax;

		// 其它业务利润
		var CNotherprofit = 0 - (CNotherincome - CNothercost);
		var Adjotherprofit = 0 - (Adjotherincome - Adjothercost);
		var USotherprofit = 0 - (USotherincome - USothercost);

		// 销售费用 5501
		var n5501 = map.GetValue('5501').name;
		if (!n5501) {
			n5501 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNsellcost = parseFloat(n5501[0]) - parseFloat(n5501[1]);
		var Adjsellcost = parseFloat(n5501[2]) - parseFloat(n5501[3]);
		var USsellcost = parseFloat(n5501[4]) - parseFloat(n5501[5]);

		// 管理费用 5502
		var n5502 = map.GetValue('5502').name;
		if (!n5502) {
			n5502 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNmanagercost = parseFloat(n5502[0]) - parseFloat(n5502[1]);
		var Adjmanagercost = parseFloat(n5502[2]) - parseFloat(n5502[3]);
		var USmanagercost = parseFloat(n5502[4]) - parseFloat(n5502[5]);

		// 财务费用 5503
		var n5503 = map.GetValue('5503').name;
		if (!n5503) {
			n5503 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNfinancialcost = parseFloat(n5503[0]) - parseFloat(n5503[1]);
		var Adjfinancialcost = parseFloat(n5503[2]) - parseFloat(n5503[3]);
		var USfinancialcost = parseFloat(n5503[4]) - parseFloat(n5503[5]);

		// 加：投资收益 5201
		var n5201 = map.GetValue('5201').name;
		if (!n5201) {
			n5201 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNinvestmentincome = parseFloat(n5201[0]) - parseFloat(n5201[1]);
		var Adjinvestmentincome = parseFloat(n5201[2]) - parseFloat(n5201[3]);
		var USinvestmentincome = parseFloat(n5201[4]) - parseFloat(n5201[5]);

		// 加：补贴收入5203
		var n5203 = map.GetValue('5203').name;
		if (!n5203) {
			n5203 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNsubsidyincome = parseFloat(n5203[0]) - parseFloat(n5203[1]);
		var Adjsubsidyincome = parseFloat(n5203[2]) - parseFloat(n5203[3]);
		var USsubsidyincome = parseFloat(n5203[4]) - parseFloat(n5203[5]);

		// 营业利润
		var CNoperatingprofit = CNallincome;
		CNoperatingprofit -= CNoperatingcost;
		CNoperatingprofit -= CNmaintax;
		CNoperatingprofit -= CNsellcost;
		CNoperatingprofit -= CNmanagercost;
		CNoperatingprofit -= CNfinancialcost;
		CNoperatingprofit += CNinvestmentincome;
		CNoperatingprofit += CNsubsidyincome;
		var Adjoperatingprofit = Adjallincome;
		Adjoperatingprofit -= Adjoperatingcost;
		Adjoperatingprofit -= Adjmaintax;
		Adjoperatingprofit -= Adjsellcost;
		Adjoperatingprofit -= Adjmanagercost;
		Adjoperatingprofit -= Adjfinancialcost;
		Adjoperatingprofit += Adjinvestmentincome;
		Adjoperatingprofit += Adjsubsidyincome;
		var USoperatingprofit = USallincome;
		USoperatingprofit -= USoperatingcost;
		USoperatingprofit -= USmaintax;
		USoperatingprofit -= USsellcost;
		USoperatingprofit -= USmanagercost;
		USoperatingprofit -= USfinancialcost;
		USoperatingprofit += USinvestmentincome;
		USoperatingprofit += USsubsidyincome;
		// nlapiLogExecution('debug', 'USoperatingprofit', USallincome + '|'
		// + USoperatingcost + '|' + USmaintax + '|' + USsellcost + '|'
		// + USmanagercost + '|' + USfinancialcost + '|'
		// + USinvestmentincome + '|' + USsubsidyincome);
		// 营业外收入 5301
		var n5301 = map.GetValue('5301').name;
		if (!n5301) {
			n5301 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNoutsideincome = 0 - (parseFloat(n5301[0]) - parseFloat(n5301[1]));
		var Adjoutsideincome = 0 - (parseFloat(n5301[2]) - parseFloat(n5301[3]));
		var USoutsideincome = 0 - (parseFloat(n5301[4]) - parseFloat(n5301[5]));

		// 营业外支出 5601
		var n5601 = map.GetValue('5601').name;
		if (!n5601) {
			n5601 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNoutsidecost = parseFloat(n5601[0]) - parseFloat(n5601[1]);
		var Adjoutsidecost = parseFloat(n5601[2]) - parseFloat(n5601[3]);
		var USoutsidecost = parseFloat(n5601[4]) - parseFloat(n5601[5]);

		// 以前年度损益调整 5801
		var n5801 = map.GetValue('5801').name;
		if (!n5801) {
			n5801 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNprofitandlossadjust = parseFloat(n5801[0]) - parseFloat(n5801[1]);
		var Adjprofitandlossadjust = parseFloat(n5801[2])
				- parseFloat(n5801[3]);
		var USprofitandlossadjust = parseFloat(n5801[4]) - parseFloat(n5801[5]);

		// 利润总额
		var CNtotalprofit = CNoperatingprofit + CNoutsideincome;
		CNtotalprofit -= CNoutsidecost;
		var Adjtotalprofit = Adjoperatingprofit + Adjoutsideincome;
		Adjtotalprofit -= Adjoutsidecost;
		var UStotalprofit = USoperatingprofit + USoutsideincome;
		UStotalprofit -= USoutsidecost;
		// nlapiLogExecution('debug', 'USoperatingprofit', USoperatingprofit +
		// '|'
		// + USoutsideincome + '|' + USoutsidecost);

		// 所得税 5701
		var n5701 = map.GetValue('5701').name;
		if (!n5701) {
			n5701 = [ 0, 0, 0, 0, 0, 0 ];
		}
		var CNtax = parseFloat(n5701[0]) - parseFloat(n5701[1]);
		var Adjtax = parseFloat(n5701[2]) - parseFloat(n5701[3]);
		var UStax = parseFloat(n5701[4]) - parseFloat(n5701[5]);

		// 净利润
		profit.CNnetprofit = CNtotalprofit - CNtax;
		profit.Adjnetprofit = Adjtotalprofit - Adjtax;
		profit.USnetprofit = UStotalprofit - UStax;
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
			var cols = resultslice[rs].getAllColumns();
			var usDebit = resultslice[rs].getValue(cols[0]);
			var usCredit = resultslice[rs].getValue(cols[1]);
			var adjDebit = resultslice[rs].getValue(cols[2]);
			var adjCredit = resultslice[rs].getValue(cols[3]);
			var localDebit = resultslice[rs].getValue(cols[4]);
			var loacalCredit = resultslice[rs].getValue(cols[5]);
			var number = resultslice[rs].getValue(column);
			if (!usDebit) {
				usDebit = 0;
			}
			if (!usCredit) {
				usCredit = 0;
			}
			if (!adjDebit) {
				adjDebit = 0;
			}
			if (!adjCredit) {
				adjCredit = 0;
			}
			if (!localDebit) {
				localDebit = 0;
			}
			if (!loacalCredit) {
				loacalCredit = 0;
			}
			map.Add(number, new trigger.local.HashEntity(number, [ localDebit,
					loacalCredit, adjDebit, adjCredit, usDebit, usCredit ]));
		}
		return map;
	}

};