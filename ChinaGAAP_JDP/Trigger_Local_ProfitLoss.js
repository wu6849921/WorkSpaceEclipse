/**
 * Module Description: Profit & Loss Version Date Author Remarks 1.00 23 Oct
 * 2014 Winson.Chen 2014
 * 
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.profitloss = function() {
}
trigger.local.profitloss.prototype = {
	writeProfitToPDF : function(subsidiaryid, subsidiaryname, periodid, period,
			response) {
		var filter = []; // 本月, this month
		var filters = []; // 本年, this year
		var titletime;
		var profit = Object.create(trigger.local.entity.ProfitAndLoss);

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

			var accPeriodEndDate = accPeriod.getFieldValue('enddate');
			firstSlash = accPeriodEndDate.indexOf('/');
			lastSlash = accPeriodEndDate.lastIndexOf('/');
			var endMonth = accPeriodEndDate.substring(0, firstSlash);
			var endDay = accPeriodEndDate.substring(firstSlash + 1, lastSlash);
			var endYear = accPeriodEndDate.substring(lastSlash + 1);

			var month = com.GetMonthByPeriod(period);
			var begintime = '1/1/' + startYear;
			titletime = startYear + '年' + month + '月';

			var currentmonthstart = String.format("{0}/{1}/{2}", startMonth,
					startDay, startYear);
			var currentmonthend = String.format("{0}/{1}/{2}", endMonth,
					endDay, endYear);

			// nlapiLogExecution('debug', '本年', 'currentmonthstart'
			// + currentmonthstart);
			// nlapiLogExecution('debug', '本年', 'begintime - periodtime:' +
			// begintime +'-'+ periodtime);

			// 本月
			filter[filter.length] = new nlobjSearchFilter('postingperiod',
					null, 'abs', [ periodid ]);// supports a solution for
			// adjust period
			// filter[filter.length] = new nlobjSearchFilter('startdate',
			// 'accountingperiod','within', currentmonthstart, currentmonthend);
			// 本年
			filters[filters.length] = new nlobjSearchFilter('startdate',
					'accountingperiod', 'within', begintime, currentmonthstart);
		}

		var xml = template.GetProfitXMLHeader(subsidiaryname, titletime);
		var profit = this.GetProfitRecords(filter, filters);
		var arrname = rule.GetUserNameById();
		var name = arrname.custentity_chinese_name;
		if (!name) {
			name = arrname.entityid;
		}

		xml += template.GetProfitXML(profit, name);
		var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
		filename = "ProfitAndLoss-" + filename + ".PDF";
		new trigger.local.write().WriteXMLToPDF(response, xml, filename);
	},

	GetProfitRecords : function(filter, filters) {
		// profit parameters, it could be change on diferent company.
		// var strid =
		// "6402,6403,6051,6601,6603,6701,6101,6111,6301,6711,6801,6901,6001,6401,6602";
		// 其他业务支出,主营业务税金及附加,其他业务收入,营业费用,财务费用,资产减值损失(取消),公允价值变动损益(取消)
		// ,投资收益,营业外收入,营业外支出,所得税,以前年度损益调整,主营业务收入,主营业务成本,管理费用,补贴收入(新增5203)
		var strid = "5405,5402,5102,5501,5503,5201,5301,5601,5701,5801,5101,5401,5502,5203";
		var sql = rule.GetSQLFromMappingRecords(strid);

		// nlapiLogExecution('debug', 'PROFIT-SQL',sql);

		var column = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
		column.setFormula(sql);

		var map = this.GetProfitSUMOfRecordsByCNID(filters, column);
		var endmap = this.GetProfitSUMOfRecordsByCNID(filter, column);

		var profit = Object.create(trigger.local.entity.ProfitAndLoss);
		// 主营业务收入参数 5101
		// 主营业务收入数据
		var n5101 = map.GetValue('5101').name;
		if (!n5101) {
			n5101 = [ 0, 0 ];
		}
		profit.income = parseFloat(n5101[1]) - parseFloat(n5101[0]);
		n5101 = endmap.GetValue('5101').name;
		if (!n5101) {
			n5101 = [ 0, 0 ];
		}
		profit.monthincome = parseFloat(n5101[1]) - parseFloat(n5101[0]);

		// 其它业务收入参数 5102
		var n5102 = map.GetValue('5102').name;
		if (!n5102) {
			n5102 = [ 0, 0 ];
		}
		profit.otherincome = parseFloat(n5102[1]) - parseFloat(n5102[0]);
		n5102 = endmap.GetValue('5102').name;
		if (!n5102) {
			n5102 = [ 0, 0 ];
		}
		profit.monthotherincome = parseFloat(n5102[1]) - parseFloat(n5102[0]);

		// 主营业务成本 5401
		var n5401 = map.GetValue('5401').name;
		if (!n5401) {
			n5401 = [ 0, 0 ];
		}
		profit.maincost = parseFloat(n5401[1]) - parseFloat(n5401[0]);
		n5401 = endmap.GetValue('5401').name;
		if (!n5401) {
			n5401 = [ 0, 0 ];
		}
		profit.monthmaincost = parseFloat(n5401[1]) - parseFloat(n5401[0]);

		// 其它业务成本 5405
		var n5405 = map.GetValue('5405').name;
		if (!n5405) {
			n5405 = [ 0, 0 ];
		}
		profit.othercost = parseFloat(n5405[1]) - parseFloat(n5405[0]);
		n5405 = endmap.GetValue('5405').name;
		if (!n5405) {
			n5405 = [ 0, 0 ];
		}
		profit.monthothercost = parseFloat(n5405[1]) - parseFloat(n5405[0]);

		// 营业税金及附加 5402
		var n5402 = map.GetValue('5402').name;
		if (!n5402) {
			n5402 = [ 0, 0 ];
		}
		profit.maintax = parseFloat(n5402[1]) - parseFloat(n5402[0]);
		n5402 = endmap.GetValue('5402').name;
		if (!n5402) {
			n5402 = [ 0, 0 ];
		}
		profit.monthmaintax = parseFloat(n5402[1]) - parseFloat(n5402[0]);

		// 营业收入
		profit.allincome = 0 - (parseFloat(profit.income) + parseFloat(profit.otherincome));
		profit.monthallincome = 0 - (parseFloat(profit.monthincome) + parseFloat(profit.monthotherincome));

		// 营业成本
		profit.operatingcost = parseFloat(profit.maincost)
				+ parseFloat(profit.othercost);
		profit.monthoperatingcost = parseFloat(profit.monthmaincost)
				+ parseFloat(profit.monthothercost);

		// 经营利润
		profit.earnprofit = profit.allincome - profit.operatingcost
				- profit.maintax;
		profit.monthearnprofit = profit.monthallincome
				- profit.monthoperatingcost - profit.monthmaintax;

		// 其它业务利润
		profit.otherprofit = 0 - (profit.otherincome - profit.othercost);
		profit.monthotherprofit = 0 - (profit.monthotherincome - profit.monthothercost);
		// nlapiLogExecution('debug', '其它业务利润',profit.otherincome + '/' +
		// profit.othercost);

		// 销售费用 5501
		var n5501 = map.GetValue('5501').name;
		if (!n5501) {
			n5501 = [ 0, 0 ];
		}
		profit.sellcost = parseFloat(n5501[1]) - parseFloat(n5501[0]);
		n5501 = endmap.GetValue('5501').name;
		if (!n5501) {
			n5501 = [ 0, 0 ];
		}
		profit.monthsellcost = parseFloat(n5501[1]) - parseFloat(n5501[0]);

		// 管理费用 5502
		var n5502 = map.GetValue('5502').name;
		if (!n5502) {
			n5502 = [ 0, 0 ];
		}
		profit.managercost = parseFloat(n5502[1]) - parseFloat(n5502[0]);
		n5502 = endmap.GetValue('5502').name;
		if (!n5502) {
			n5502 = [ 0, 0 ];
		}
		profit.monthmanagercost = parseFloat(n5502[1]) - parseFloat(n5502[0]);

		// 财务费用 5503
		var n5503 = map.GetValue('5503').name;
		if (!n5503) {
			n5503 = [ 0, 0 ];
		}
		profit.financialcost = parseFloat(n5503[1]) - parseFloat(n5503[0]);
		n5503 = endmap.GetValue('5503').name;
		if (!n5503) {
			n5503 = [ 0, 0 ];
		}
		profit.monthfinancialcost = parseFloat(n5503[1]) - parseFloat(n5503[0]);

		// nlapiLogExecution('debug', '财务费用',profit.financialcost + '/' +
		// profit.monthfinancialcost);

		// 资产减值损失 6701 jdp 没有
		// var n6701 = map.GetValue('6701').name;
		// if (!n6701) {
		// n6701 = [ 0, 0 ];
		// }
		// profit.assetsimpairmentloss = parseFloat(n6701[1])
		// - parseFloat(n6701[0]);
		// n6701 = endmap.GetValue('6701').name;
		// if (!n6701) {
		// n6701 = [ 0, 0 ];
		// }
		// profit.monthassetsimpairmentloss = parseFloat(n6701[1])
		// - parseFloat(n6701[0]);

		// 加：公允价值变动收益 6101 jdp没有
		// var n6101 = map.GetValue('6101').name;
		// if (!n6101) {
		// n6101 = [ 0, 0 ];
		// }
		// profit.gainsonthechanges = parseFloat(n6101[1]) -
		// parseFloat(n6101[0]);
		// n6101 = endmap.GetValue('6101').name;
		// if (!n6101) {
		// n6101 = [ 0, 0 ];
		// }
		// profit.monthgainsonthechanges = parseFloat(n6101[1])
		// - parseFloat(n6101[0]);

		// 加：投资收益 5201
		var n5201 = map.GetValue('5201').name;
		if (!n5201) {
			n5201 = [ 0, 0 ];
		}
		profit.investmentincome = parseFloat(n5201[1]) - parseFloat(n5201[0]);
		n5201 = endmap.GetValue('5201').name;
		if (!n5201) {
			n5201 = [ 0, 0 ];
		}
		profit.monthinvestmentincome = parseFloat(n5201[1])
				- parseFloat(n5201[0]);

		// 加：补贴收入5203
		var n5203 = map.GetValue('5203').name;
		if (!n5203) {
			n5203 = [ 0, 0 ];
		}
		profit.subsidyincome = parseFloat(n5203[1]) - parseFloat(n5203[0]);
		n5203 = endmap.GetValue('5203').name;
		if (!n5203) {
			n5203 = [ 0, 0 ];
		}
		profit.monthsubsidyincome = parseFloat(n5203[1]) - parseFloat(n5203[0]);

		// 营业利润
		profit.operatingprofit = profit.allincome;
		profit.operatingprofit -= profit.operatingcost;
		profit.operatingprofit -= profit.maintax;
		profit.operatingprofit -= profit.sellcost;
		profit.operatingprofit -= profit.managercost;
		profit.operatingprofit -= profit.financialcost;
		// profit.operatingprofit -= profit.assetsimpairmentloss;
		// profit.operatingprofit += profit.gainsonthechanges;
		profit.operatingprofit += profit.investmentincome;
		profit.operatingprofit += profit.subsidyincome;

		profit.monthoperatingprofit = profit.monthallincome;
		profit.monthoperatingprofit -= profit.monthoperatingcost;
		profit.monthoperatingprofit -= profit.monthmaintax;
		profit.monthoperatingprofit -= profit.monthsellcost;
		profit.monthoperatingprofit -= profit.monthmanagercost;
		profit.monthoperatingprofit -= profit.monthfinancialcost;
		// profit.monthoperatingprofit -= profit.monthassetsimpairmentloss;
		// profit.monthoperatingprofit += profit.monthgainsonthechanges;
		profit.monthoperatingprofit += profit.investmentincome;
		profit.monthoperatingprofit += profit.monthsubsidyincome;

		// 营业外收入 5301
		var n5301 = map.GetValue('5301').name;
		if (!n5301) {
			n5301 = [ 0, 0 ];
		}
		profit.outsideincome = 0 - (parseFloat(n5301[1]) - parseFloat(n5301[0]));
		n5301 = endmap.GetValue('5301').name;
		if (!n5301) {
			n5301 = [ 0, 0 ];
		}
		profit.monthoutsideincome = 0 - (parseFloat(n5301[1]) - parseFloat(n5301[0]));

		// 营业外支出 5601
		var n5601 = map.GetValue('5601').name;
		if (!n5601) {
			n5601 = [ 0, 0 ];
		}
		profit.outsidecost = parseFloat(n5601[1]) - parseFloat(n5601[0]);
		n5601 = endmap.GetValue('5601').name;
		if (!n5601) {
			n5601 = [ 0, 0 ];
		}
		profit.monthoutsidecost = parseFloat(n5601[1]) - parseFloat(n5601[0]);

		// 以前年度损益调整 5801
		var n5801 = map.GetValue('5801').name;
		if (!n5801) {
			n5801 = [ 0, 0 ];
		}
		profit.profitandlossadjust = parseFloat(n5801[1])
				- parseFloat(n5801[0]);
		n5801 = endmap.GetValue('5801').name;
		if (!n5801) {
			n5801 = [ 0, 0 ];
		}
		profit.monthprofitandlossadjust = parseFloat(n5801[1])
				- parseFloat(n5801[0]);

		// 利润总额
		profit.totalprofit = profit.operatingprofit + profit.outsideincome;
		profit.totalprofit -= profit.outsidecost;
		profit.monthtotalprofit = profit.monthoperatingprofit
				+ profit.monthoutsideincome;
		profit.monthtotalprofit -= profit.monthoutsidecost;

		// 所得税 5701
		var n5701 = map.GetValue('5701').name;
		if (!n5701) {
			n5701 = [ 0, 0 ];
		}
		profit.tax = parseFloat(n5701[1]) - parseFloat(n5701[0]);
		n5701 = endmap.GetValue('5701').name;
		if (!n5701) {
			n5701 = [ 0, 0 ];
		}
		profit.monthtax = parseFloat(n5701[1]) - parseFloat(n5701[0]);

		// 净利润
		profit.netprofit = profit.totalprofit - profit.tax;
		profit.monthnetprofit = profit.monthtotalprofit - profit.monthtax;
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
	}
};