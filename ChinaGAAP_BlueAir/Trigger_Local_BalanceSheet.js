/**
 * Module Description: Profit & Loss
 * Version    Date            Author           Remarks
 * 1.00       23 Oct 2014   Winson.Chen
 */


triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.balancesheet = function() {}
trigger.local.balancesheet.prototype = {		
		writeBalanceSheetToPDF:function(subsidiaryid, subsidiaryname, periodid, period, response) {
			var xml = template.GetBalanceSheetXMLHead;
			
			var titletime='';
			var filter = []; 
			var filters = [];
			if (subsidiaryid&&subsidiaryid!='-1') {
				filter[filter.length] = new nlobjSearchFilter('subsidiary', null,'anyof', subsidiaryid);
				filters[filters.length] = new nlobjSearchFilter('subsidiary', null,'anyof', subsidiaryid);
			}
			if (periodid && period) {
				var accPeriod = nlapiLoadRecord('accountingperiod', periodid);
	        	var accPeriodStartDate = accPeriod.getFieldValue('startdate'); //format of date M/D/YYYY, no leading zeros
				var firstSlash = accPeriodStartDate.indexOf('/');
				var lastSlash = accPeriodStartDate.lastIndexOf('/');
				
				var startMonth = accPeriodStartDate.substring(0,firstSlash);
				var startDay = accPeriodStartDate.substring(firstSlash +1, lastSlash);
				var startYear = accPeriodStartDate.substring(lastSlash+1);
				
				var month = com.GetMonthByPeriod(period);
				var periodtime = String.format("{0}/{1}/{2}", startMonth, startDay, startYear);
				var begintime =   '1/1/' + startYear;
		        titletime = String.format("{0}年{1}月",startYear, month);
				
		        //nlapiLogExecution('debug', 'begintime', String.format("{0}/{1}",begintime,periodtime));
				
				filter[filter.length] = new nlobjSearchFilter('startdate', 'accountingperiod','before', begintime);		

				if(month == '13'){////for period 13 Balance Report will include all the transactions
					filters[filters.length] = new nlobjSearchFilter('startdate', 'accountingperiod','onorbefore', periodtime);
				}else{//need to filter out the transactions belong to period 13 as a part of period 12 report
					filters[filters.length] = new nlobjSearchFilter('startdate', 'accountingperiod','onorbefore', periodtime);					
					filters[filters.length] = new nlobjSearchFilter('internalidnumber', 'accountingperiod','lessthanorequalto', periodid);					
				}
			}
			xml += template.GetBalanceSheetContentHeadXML(subsidiaryname, titletime);
				
			var tempmap = [];
			var tempmonthmap = [];
			var arraylist = rule.GetIdArrayListOfLevelOneOfCNCOA();
			for (var m = 0; m < 2; m++) {
				var strid = arraylist[m].join(",");
				//nlapiLogExecution('debug','strid',strid);
				var sql = rule.GetSQLFromMappingRecords(strid);
				//nlapiLogExecution('debug','sql',sql);
				var column = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
				column.setFormula(sql);
							
				//nlapiLogExecution('debug', 'SQL',sql);
//		    	nlapiLogExecution('debug','filters',filters.toString());
				tempmap[m] = rule.GetSummaryLedgerRecordsByAllOfNumber(filter, column); // 期初数据, The beginning of the period data
				tempmonthmap[m] = rule.GetSummaryLedgerRecordsByAllOfNumber(filters, column,m); // 本月数据, This month data
			}
			var map = rule.GetMergeObject(tempmap[0], tempmap[1]);
			var endmap = rule.GetMergeObject(tempmonthmap[0],tempmonthmap[1]);
			
			//未分配金额, 其它应收或者其它应付款
			var notconfirmmap = this.GetUnConfirmAccounts(filter);
			var notconfirmendmap = this.GetUnConfirmAccounts(filters);
			
			var cnnumber;
			var cnname;
			var credit = 0;       //期初
			var debit = 0;        //期末
			var totalcredit = 0;
			var totaldebit = 0;
			
			var bs = Object.create(trigger.local.entity.BalanceSheet);
			//货币资金 1001,1002,1012
			var n1001 =  map.GetValue('1001').name;
		    var n1002 = map.GetValue('1002').name;
		    var n1012 = map.GetValue('1012').name;
		    if(!n1001){n1001 = [0,0];}
		    if(!n1002){n1002 = [0,0];}
		    if(!n1012){n1012 = [0,0];}
//		    nlapiLogExecution('debug', 'Start cash:', 'Start cash--> n1001:'  + n1001 + ' n1002:'  + n1002 + ' n1012:' + n1012);
		    
			bs.Cash =parseFloat(n1001[1]) - parseFloat(n1001[0]) + parseFloat(n1002[1]) -
		    parseFloat(n1002[0]) + parseFloat(n1012[1]) - parseFloat(n1012[0]);
			bs.Cash = bs.Cash.toFixed(2);
			
			n1001 =  endmap.GetValue('1001').name;
		    n1002 = endmap.GetValue('1002').name;
		    n1012 = endmap.GetValue('1012').name;
		    if(!n1001){n1001 = [0,0];}
		    if(!n1002){n1002 = [0,0];}
		    if(!n1012){n1012 = [0,0];}		    
		    
		    bs.CashEnd =  parseFloat(n1001[1]) - parseFloat(n1001[0]) + parseFloat(n1002[1]) -
		    parseFloat(n1002[0]) + parseFloat(n1012[1]) - parseFloat(n1012[0]);		    
		    //交易性金融资产1101
		    var n1101 =  map.GetValue('1101').name;
		    if(!n1101){n1101 = [0,0];}
		    bs.TradingFinancialAssets = parseFloat(n1101[1]) - parseFloat(n1101[0]);
		    n1101 = endmap.GetValue('1101').name;
		    if(!n1101){n1101 = [0,0];}
		    bs.TradingFinancialAssetsEnd = parseFloat(n1101[1]) - parseFloat(n1101[0]);
		    //应收票据
		    var n1121 =  map.GetValue('1121').name;
		    if(!n1121){n1121 = [0,0];}
		    bs.NotesReceivable = parseFloat(n1121[1]) - parseFloat(n1121[0]);
		    n1121 = endmap.GetValue('1121').name;
		    if(!n1121){n1121 = [0,0];}
		    bs.NotesReceivableEnd = parseFloat(n1121[1]) - parseFloat(n1121[0]);
		    
		    //应收账款
		    var n1122 =  map.GetValue('1122').name;
		    var n1231 =  map.GetValue('1231').name;
		    if(!n1122){n1122 = [0,0];}
		    if(!n1231){n1231 = [0,0];}
		    bs.NetReceivable = parseFloat(n1122[1]) - parseFloat(n1122[0]) + parseFloat(n1231[1]) - parseFloat(n1231[0]);
		    n1122 = endmap.GetValue('1122').name;
		    n1231 = endmap.GetValue('1231').name;
		    if(!n1122){n1122 = [0,0];}
		    if(!n1231){n1231 = [0,0];}
		    bs.NetReceivableEnd = parseFloat(n1122[1]) - parseFloat(n1122[0]) + parseFloat(n1231[1]) - parseFloat(n1231[0]);
		    
		    // 预付款项
		    var n1123 =  map.GetValue('1123').name;
		    if(!n1123){n1123 = [0,0];}
		    bs.AccountsPrepaid = parseFloat(n1123[1]) -  parseFloat(n1123[0]);
		    n1123 = endmap.GetValue('1123').name;
		    if(!n1123){n1123 = [0,0];}
		    bs.AccountsPrepaidEnd = parseFloat(n1123[1]) -  parseFloat(n1123[0]);
		    
		    // 应收利息
			var n1132 =  map.GetValue('1132').name;
		    if(!n1132){n1132 = [0,0];}
		    bs.InterestReceivable = parseFloat(n1132[1]) - parseFloat(n1132[0]);
		    n1132 = endmap.GetValue('1132').name;
		    if(!n1132){n1132 = [0,0];}
		    bs.InterestReceivableEnd = parseFloat(n1132[1]) - parseFloat(n1132[0]);
		    
		    // 应收股利
			var n1131 =  map.GetValue('1131').name;
		    if(!n1131){n1131 = [0,0];}
		    bs.DividendReceivable = parseFloat(n1131[1]) - parseFloat(n1131[0]);
		    n1131 = endmap.GetValue('1131').name;
		    if(!n1131){n1131 = [0,0];}
		    bs.DividendReceivableEnd = parseFloat(n1131[1]) - parseFloat(n1131[0]);
		    
		    // 其他应收款
			var n1221 =  map.GetValue('1221').name;
		    if(!n1221){n1221 = [0,0];}
		    bs.OtherReceivables = parseFloat(n1221[1]) - parseFloat(n1221[0]);
		    n1221 = endmap.GetValue('1221').name;
		    if(!n1221){n1221 = [0,0];}
		    bs.OtherReceivablesEnd = parseFloat(n1221[1]) - parseFloat(n1221[0]);
		    for (var i = 0; i < notconfirmmap.Count; i++) {
				var specialid = notconfirmmap.ArrayList[i];
				var specialvalue =  notconfirmmap.GetValue(specialid).name;
				 if(specialvalue && parseFloat(specialvalue)>0){
				    	bs.OtherReceivables+= parseFloat(specialvalue);
				  }
		    }
		    for (var i = 0; i < notconfirmendmap.Count; i++) {
				var specialid = notconfirmendmap.ArrayList[i];
				var specialvalue =  notconfirmendmap.GetValue(specialid).name;
				 if(specialvalue && parseFloat(specialvalue)>0){
				    	bs.OtherReceivablesEnd+= parseFloat(specialvalue);
				  }
		    }

		    // 存货
		    var tempinventories = this.GetTotalByIntentories(map, endmap);
		    
			bs.Inventories = parseFloat(tempinventories[0]);
			bs.InventoriesEnd = parseFloat(tempinventories[1]);
			
		    // 一年内到期的非流动资产
		    bs.NonCurrentAssetsMaturedWithinAYear = parseFloat('0');
		    bs.NonCurrentAssetsMaturedWithinAYearEnd = parseFloat('0');
		    
		    // 其他流动资产
		    var n1901 =  map.GetValue('1901').name;
		    if(!n1901){n1901 = [0,0];}
		    bs.OtherCurrentAssets = parseFloat(n1901[1]) - parseFloat(n1901[0]);
		    n1901 = endmap.GetValue('1901').name;
		    if(!n1901){n1901 = [0,0];}
		    bs.OtherCurrentAssetsEnd = parseFloat(n1901[1]) - parseFloat(n1901[0]);
		    
		    // 流动资产合计
			bs.TotalCurrentAssets += parseFloat(bs.Cash);
			bs.TotalCurrentAssets += parseFloat(bs.TradingFinancialAssets);
			bs.TotalCurrentAssets += parseFloat(bs.NotesReceivable);
			bs.TotalCurrentAssets += parseFloat(bs.NetReceivable);
			bs.TotalCurrentAssets += parseFloat(bs.AccountsPrepaid);
			bs.TotalCurrentAssets += parseFloat(bs.InterestReceivable);
			bs.TotalCurrentAssets += parseFloat(bs.DividendReceivable);
			bs.TotalCurrentAssets += parseFloat(bs.OtherReceivables);
			bs.TotalCurrentAssets += parseFloat(bs.Inventories);
			bs.TotalCurrentAssets += parseFloat(bs.NonCurrentAssetsMaturedWithinAYear);
			bs.TotalCurrentAssets += parseFloat(bs.OtherCurrentAssets);
			
			bs.TotalCurrentAssetsEnd += parseFloat(bs.CashEnd);
			bs.TotalCurrentAssetsEnd += parseFloat(bs.TradingFinancialAssetsEnd);
			bs.TotalCurrentAssetsEnd += parseFloat(bs.NotesReceivableEnd);
			bs.TotalCurrentAssetsEnd += parseFloat(bs.NetReceivableEnd);
			bs.TotalCurrentAssetsEnd += parseFloat(bs.AccountsPrepaidEnd);
			bs.TotalCurrentAssetsEnd += parseFloat(bs.InterestReceivableEnd);
			bs.TotalCurrentAssetsEnd += parseFloat(bs.DividendReceivableEnd);
			bs.TotalCurrentAssetsEnd += parseFloat(bs.OtherReceivablesEnd);			
			bs.TotalCurrentAssetsEnd += parseFloat(bs.InventoriesEnd);
			bs.TotalCurrentAssetsEnd += parseFloat(bs.NonCurrentAssetsMaturedWithinAYearEnd);
			bs.TotalCurrentAssetsEnd += parseFloat(bs.OtherCurrentAssetsEnd);
		    
		    // 可供出售金融资产
			var n1503 =  map.GetValue('1503').name;
		    if(!n1503){n1503 = [0,0];}
		    bs.AvailableForSaleFinancialAssets = parseFloat(n1503[1]) - parseFloat(n1503[0]);
		    n1503 = endmap.GetValue('1503').name;
		    if(!n1503){n1503 = [0,0];}
		    bs.AvailableForSaleFinancialAssetsEnd = parseFloat(n1503[1]) - parseFloat(n1503[0]);
		    
		    // 持有到期投资
		    var n1501 =  map.GetValue('1501').name;
		    var n1502 =  map.GetValue('1502').name;
		    if(!n1501){n1501 = [0,0];}
		    if(!n1502){n1502 = [0,0];}
		    bs.HeldToMaturityInvestment = parseFloat(n1501[1]) -parseFloat( n1501[0]) - parseFloat(n1502[1]) - parseFloat(n1502[0]);
		    
		    n1121 = endmap.GetValue('1501').name;
		    n1231 = endmap.GetValue('1502').name;
		    if(!n1501){n1501 = [0,0];}
		    if(!n1502){n1502 = [0,0];}
		    bs.HeldToMaturityInvestmentEnd = parseFloat(n1501[1]) -parseFloat( n1501[0]) - parseFloat(n1502[1]) - parseFloat(n1502[0]);
		    
		    // 长期应收款
			var n1531 =  map.GetValue('1531').name;
		    var n1532 =  map.GetValue('1532').name;
		    if(!n1531){n1531 = [0,0];}
		    if(!n1532){n1532 = [0,0];}
		    bs.LongTermReceivables = parseFloat(n1531[1]) - parseFloat(n1531[0]) + parseFloat(n1532[1]) - parseFloat(n1532[0]);
		    n1531 = endmap.GetValue('1531').name;
		    n1541 = endmap.GetValue('1532').name;
		    if(!n1531){n1531 = [0,0];}
		    if(!n1532){n1532 = [0,0];}
		    bs.LongTermReceivablesEnd = parseFloat(n1531[1]) - parseFloat(n1531[0]) + parseFloat(n1532[1]) - parseFloat(n1532[0]);
		    
		    // 长期股权投资
			var n1511 =  map.GetValue('1511').name;
		    var n1512 =  map.GetValue('1512').name;
		    if(!n1511){n1511 = [0,0];}
		    if(!n1512){n1512 = [0,0];}
		    bs.longTermEquityInvestment = parseFloat(n1511[1]) - parseFloat(n1511[0]) - parseFloat(n1512[1]) - parseFloat(n1512[0]);
		    n1511 = endmap.GetValue('1511').name;
		    n1512 = endmap.GetValue('1512').name;
		    if(!n1511){n1511 = [0,0];}
		    if(!n1512){n1512 = [0,0];}
		    bs.longTermEquityInvestmentEnd = parseFloat(n1511[1]) - parseFloat(n1511[0]) - parseFloat(n1512[1]) - parseFloat(n1512[0]);
		    
		    // 投资性房地产
			var n1521 =  map.GetValue('1521').name;
		    if(!n1521){n1521 = [0,0];}
		    bs.InvestmentRealEstate = parseFloat(n1521[1]) - parseFloat(n1521[0]);
		    
		    n1521 = endmap.GetValue('1521').name;
		    if(!n1521){n1521 = [0,0];}
		    bs.InvestmentRealEstateEnd = parseFloat(n1521[1]) - parseFloat(n1521[0]);
		    
		    // 固定资产
			var n1601 =  map.GetValue('1601').name;
		    var n1602 = map.GetValue('1602').name;
		    var n1603 = map.GetValue('1603').name;
		    if(!n1601){n1601 = [0,0];}
		    if(!n1602){n1602 = [0,0];}
		    if(!n1603){n1603 = [0,0];}
			bs.FixedAssets =parseFloat(n1601[1]) - parseFloat(n1601[0]) + parseFloat(n1602[1]) -
		    parseFloat(n1602[0]) + parseFloat(n1603[1]) - parseFloat(n1603[0]);
			n1601 =  endmap.GetValue('1601').name;
			n1602 = endmap.GetValue('1602').name;
			n1603 = endmap.GetValue('1603').name;
		    if(!n1601){n1601 = [0,0];}
		    if(!n1602){n1602 = [0,0];}
		    if(!n1603){n1603 = [0,0];}
		    bs.FixedAssetsEnd =  parseFloat(n1601[1]) - parseFloat(n1601[0]) + parseFloat(n1602[1]) -
		    parseFloat(n1602[0]) + parseFloat(n1603[1]) - parseFloat(n1603[0]);
		    
		    // 在建工程
			var n1604 =  map.GetValue('1604').name;
		    if(!n1604){n1604 = [0,0];}
		    bs.ConstructionInProgress = parseFloat(n1604[1]) - parseFloat(n1604[0]);
		    n1604 = endmap.GetValue('1604').name;
		    if(!n1604){n1604 = [0,0];}
		    bs.ConstructionInProgressEnd = parseFloat(n1604[1]) - parseFloat(n1604[0]);
		    
		    // 工程物资
			var n1605 =  map.GetValue('1605').name;
		    if(!n1605){n1605 = [0,0];}
		    bs.ProjectMaterial = parseFloat(n1605[1]) - parseFloat(n1605[0]);
		    n1605 = endmap.GetValue('1605').name;
		    if(!n1605){n1605 = [0,0];}
		    bs.ProjectMaterialEnd = parseFloat(n1605[1]) - parseFloat(n1605[0]);
		    
		    // 固定资产清理    
		    var n1606 =  map.GetValue('1606').name;
		    if(!n1606){n1606 = [0,0];}
		    bs.FixedAssetsDiaposal = parseFloat(n1606[1]) - parseFloat(n1606[0]);
		    n1606 = endmap.GetValue('1606').name;
		    if(!n1606){n1606 = [0,0];}
		    bs.FixedAssetsDiaposalEnd = parseFloat(n1606[1]) - parseFloat(n1606[0]);
		    
		    // 生产性生物资产
			var n1621 =  map.GetValue('1621').name;
		    var n1622 =  map.GetValue('1622').name;
		    if(!n1621){n1621 = [0,0];}
		    if(!n1622){n1622 = [0,0];}
		    bs.ProductiveBiologicalAsset = parseFloat(n1621[1]) - parseFloat(n1621[0]) - parseFloat(n1622[1]) - parseFloat(n1622[0]);
		    
		    n1621 = endmap.GetValue('1621').name;
		    n1622 = endmap.GetValue('1622').name;
		    if(!n1621){n1621 = [0,0];}
		    if(!n1622){n1622 = [0,0];}
		    bs.ProductiveBiologicalAssetEnd = parseFloat(n1621[1]) - parseFloat(n1621[0]) - parseFloat(n1622[1]) - parseFloat(n1622[0]);
		    // 油气资产
			var n1631 =  map.GetValue('1631').name;
		    var n1632 =  map.GetValue('1632').name;
		    if(!n1631){n1631 = [0,0];}
		    if(!n1632){n1632 = [0,0];}
		    bs.OilAndGasAssets = parseFloat(n1631[1]) - parseFloat(n1631[0]) - parseFloat(n1632[1]) - parseFloat(n1632[0]);
		    
		    n1631 = endmap.GetValue('1631').name;
		    n1632 = endmap.GetValue('1632').name;
		    if(!n1631){n1631 = [0,0];}
		    if(!n1632){n1632 = [0,0];}
		    bs.OilAndGasAssetsEnd = parseFloat(n1631[1]) - parseFloat(n1631[0]) - parseFloat(n1632[1]) - parseFloat(n1632[0]);
		    // 无形资产
			var n1701 =  map.GetValue('1701').name;
		    var n1702 = map.GetValue('1702').name;
		    var n1703 = map.GetValue('1703').name;
		    if(!n1701){n1701 = [0,0];}
		    if(!n1702){n1702 = [0,0];}
		    if(!n1703){n1703 = [0,0];}
			bs.IntangibleAssets =parseFloat(n1701[1]) - parseFloat(n1701[0]) + parseFloat(n1702[1]) -
		    parseFloat(n1702[0]) + parseFloat(n1703[1]) - parseFloat(n1703[0]);
			n1701 =  endmap.GetValue('1701').name;
			n1702 = endmap.GetValue('1702').name;
			n1703 = endmap.GetValue('1703').name;
			if(!n1701){n1701 = [0,0];}
			if(!n1702){n1702 = [0,0];}
			if(!n1703){n1703 = [0,0];}
		    bs.IntangibleAssetsEnd = parseFloat(n1701[1]) - parseFloat(n1701[0]) + parseFloat(n1702[1]) -
		    parseFloat(n1702[0]) + parseFloat(n1703[1]) - parseFloat(n1703[0]);
			
		    // 开发支出
		    var n5301 =  map.GetValue('5301').name;
		    if(!n5301){n5301 = [0,0];}
		    bs.DevelopmentExpediture = parseFloat(n5301[1]) - parseFloat(n5301[0]);
		    n5301 = endmap.GetValue('5301').name;
		    if(!n5301){n5301 = [0,0];}
		    bs.DevelopmentExpeditureEnd = parseFloat(n5301[1]) - parseFloat(n5301[0]);
		    
		    // 商誉
			var n1711 =  map.GetValue('1711').name;
		    if(!n1711){n1711 = [0,0];}
		    bs.BusinessReputation = parseFloat(n1711[1]) - parseFloat(n1711[0]);
		    n1711 = endmap.GetValue('1711').name;
		    if(!n1711){n1711 = [0,0];}
		    bs.BusinessReputationEnd = parseFloat(n1711[1]) - parseFloat(n1711[0]);
		    
		    // 长期待摊费用
			var n1801 =  map.GetValue('1801').name;
		    if(!n1801){n1801 = [0,0];}
		    bs.LongTermUnamortizedExpenses = parseFloat(n1801[1]) -  parseFloat(n1801[0]);
		    n1801 = endmap.GetValue('1801').name;
		    if(!n1801){n1801 = [0,0];}
		    bs.LongTermUnamortizedExpensesEnd = parseFloat(n1801[1]) -  parseFloat(n1801[0]);
		    
		   // 递延所得税资产
			var n1811 =  map.GetValue('1811').name;
		    if(!n1811){n1811 = [0,0];}
		    bs.DeferredIncomeTaxAssets = parseFloat(n1811[1]) -  parseFloat(n1811[0]);
		    n1811 = endmap.GetValue('1811').name;
		    if(!n1811){n1811 = [0,0];}
		    bs.DeferredIncomeTaxAssetsEnd = parseFloat(n1811[1]) -  parseFloat(n1811[0]);
		    
		    // 其它非流动资产
		    var n1623 =  map.GetValue('1623').name;
		    if(!n1623){n1623 = [0,0];}
		    bs.OtherNonCurrentAssets = parseFloat(n1623[1]) -  parseFloat(n1623[0]);
		    n1811 = endmap.GetValue('1623').name;
		    if(!n1623){n1623 = [0,0];}
		    bs.OtherNonCurrentAssetsEnd = parseFloat(n1623[1]) -  parseFloat(n1623[0]);
		    
		    // 非流动资产合计
			bs.TotalNonCurrentAssets = parseFloat(bs.AvailableForSaleFinancialAssets);
			bs.TotalNonCurrentAssets += parseFloat(bs.HeldToMaturityInvestment);
			bs.TotalNonCurrentAssets += parseFloat(bs.LongTermReceivables);
			bs.TotalNonCurrentAssets += parseFloat(bs.longTermEquityInvestment);
			bs.TotalNonCurrentAssets += parseFloat(bs.InvestmentRealEstate);
			bs.TotalNonCurrentAssets += parseFloat(bs.FixedAssets);
			bs.TotalNonCurrentAssets += parseFloat(bs.ConstructionInProgress);
			bs.TotalNonCurrentAssets += parseFloat(bs.ProjectMaterial);
			bs.TotalNonCurrentAssets += parseFloat(bs.FixedAssetsDiaposal);
			bs.TotalNonCurrentAssets += parseFloat(bs.ProductiveBiologicalAsset);
			bs.TotalNonCurrentAssets += parseFloat(bs.OilAndGasAssets);
			bs.TotalNonCurrentAssets += parseFloat(bs.IntangibleAssets);
			bs.TotalNonCurrentAssets += parseFloat(bs.DevelopmentExpediture);
			bs.TotalNonCurrentAssets += parseFloat(bs.BusinessReputation);
			bs.TotalNonCurrentAssets += parseFloat(bs.LongTermUnamortizedExpenses);
			bs.TotalNonCurrentAssets += parseFloat(bs.DeferredIncomeTaxAssets);
			bs.TotalNonCurrentAssets += parseFloat(bs.OtherNonCurrentAssets);
			
			bs.TotalNonCurrentAssetsEnd = parseFloat(bs.AvailableForSaleFinancialAssetsEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.HeldToMaturityInvestmentEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.LongTermReceivablesEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.longTermEquityInvestmentEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.InvestmentRealEstateEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.FixedAssetsEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.ConstructionInProgressEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.ProjectMaterialEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.FixedAssetsDiaposalEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.ProductiveBiologicalAssetEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.OilAndGasAssetsEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.IntangibleAssetsEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.DevelopmentExpeditureEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.BusinessReputationEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.LongTermUnamortizedExpensesEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.DeferredIncomeTaxAssetsEnd);
			bs.TotalNonCurrentAssetsEnd += parseFloat(bs.OtherNonCurrentAssetsEnd);
			
		    // 资产总计
			bs.TotalAssets = parseFloat(bs.TotalCurrentAssets) + parseFloat(bs.TotalNonCurrentAssets);
			bs.TotalAssets = parseFloat(bs.TotalAssets).toFixed(2);
			bs.TotalAssetsEnd = parseFloat(bs.TotalCurrentAssetsEnd) + parseFloat(bs.TotalNonCurrentAssetsEnd);
			
		    // 短期借款
			var n2001 =  map.GetValue('2001').name;
		    if(!n2001){n2001 = [0,0];}
		    bs.ShortTermLoans =  0 - (parseFloat(n2001[1]) - parseFloat(n2001[0]));
		    n2001 = endmap.GetValue('2001').name;
		    if(!n2001){n2001 = [0,0];}
		    bs.ShortTermLoansEnd = 0 - (parseFloat(n2001[1]) - parseFloat(n2001[0]));
		    
		   // 交易性金融负债
			var n2101 =  map.GetValue('2101').name;
		    if(!n2101){n2101 = [0,0];}
		    bs.TradingFinancialLiabilities = 0- (parseFloat(n2101[1]) - parseFloat(n2101[0]));
		    n2101 = endmap.GetValue('2101').name;
		    if(!n2101){n2101 = [0,0];}
		    bs.TradingFinancialLiabilitiesEnd = 0- (parseFloat(n2101[1]) - parseFloat(n2101[0]));
		    
		   // 应付票据
			var n2201 =  map.GetValue('2201').name;
		    if(!n2201){n2201 = [0,0];}
		    bs.NotesPayable =0 - (parseFloat(n2201[1]) -  parseFloat(n2201[0]));
		    n2201 = endmap.GetValue('2201').name;
		    if(!n2201){n2201 = [0,0];}
		    bs.NotesPayableEnd = 0 - (parseFloat(n2201[1]) -  parseFloat(n2201[0]));
		    
		    // 应付账款
			var n2202 =  map.GetValue('2202').name;
		    if(!n2202){n2202 = [0,0];}
		    bs.AccountsPayable = 0 - ( parseFloat(n2202[1]) - parseFloat(n2202[0]));
		    n2202 = endmap.GetValue('2202').name;
		    if(!n2202){n2202 = [0,0];}
		    bs.AccountsPayableEnd = 0 - (parseFloat(n2202[1]) - parseFloat(n2202[0]));
		    
		    // 预收款项
			var n2203 =  map.GetValue('2203').name;
		    if(!n2203){n2203 = [0,0];}
		    bs.AdvancesFromCustomers =  0 - (parseFloat(n2203[1]) - parseFloat(n2203[0]));
		    n2203 = endmap.GetValue('2203').name;
		    if(!n2203){n2203 = [0,0];}
		    bs.AdvancesFromCustomersEnd = 0 - (parseFloat(n2203[1]) - parseFloat(n2203[0]));
		    
		    // 应付职工薪酬
			var n2211 =  map.GetValue('2211').name;
		    if(!n2211){n2211 = [0,0];}
		    bs.AccruedPayroll = 0 - (parseFloat(n2211[1]) - parseFloat(n2211[0]));
		    n2211 = endmap.GetValue('2211').name;
		    if(!n2211){n2211 = [0,0];}
		    bs.AccruedPayrollEnd = 0 - (parseFloat(n2211[1]) - parseFloat(n2211[0]));
		    
		   // 应交税费
			var n2221 =  map.GetValue('2221').name;
		    if(!n2221){n2221 = [0,0];}
		    bs.TaxesPayable =0 - (parseFloat(n2221[1]) - parseFloat(n2221[0]));
		    n2221 = endmap.GetValue('2221').name;
		    if(!n2221){n2221 = [0,0];}
		    bs.TaxesPayableEnd = 0 - (parseFloat(n2221[1]) - parseFloat(n2221[0]));
		    
			// 应付利息
			var n2231 =  map.GetValue('2231').name;
		    if(!n2231){n2231 = [0,0];}
		    bs.InterestPayable =0 - (parseFloat(n2231[1]) - parseFloat(n2231[0]));
		    n2231 = endmap.GetValue('2231').name;
		    if(!n2231){n2231 = [0,0];}
		    bs.InterestPayableEnd = 0 - (parseFloat(n2231[1]) - parseFloat(n2231[0]));
		    
		   // 应付股利
			var n2232 =  map.GetValue('2232').name;
		    if(!n2232){n2232 = [0,0];}
		    bs.DividendsPayable =  0 - (parseFloat(n2232[1]) - parseFloat(n2232[0]));
		    n2232 = endmap.GetValue('2232').name;
		    if(!n2232){n2232 = [0,0];}
		    bs.DividendsPayableEnd = 0 - (parseFloat(n2232[1]) - parseFloat(n2232[0]));
		    
		    // 其他应付款
			var n2241 =  map.GetValue('2241').name;
		    if(!n2241){n2241 = [0,0];}
		    bs.OtherCreditors =  0 - (parseFloat(n2241[1]) - parseFloat(n2241[0]));
		    n2241 = endmap.GetValue('2241').name;
		    if(!n2241){n2241 = [0,0];}
		    bs.OtherCreditorsEnd = 0 - (parseFloat(n2241[1]) - parseFloat(n2241[0]));
		    
		    //如果其它应收款小于0，则放到其它应付款
		    for (var i = 0; i < notconfirmmap.Count; i++) {
				var specialid = notconfirmmap.ArrayList[i];
				var specialvalue =  notconfirmmap.GetValue(specialid).name;
				if(specialvalue && parseFloat(specialvalue)<0){
					  bs.OtherCreditors -= parseFloat(specialvalue);
				}
				//nlapiLogExecution('debug', 'OtherCreditors'+specialid, specialvalue);
		    }
		    for (var i = 0; i < notconfirmendmap.Count; i++) {
				var specialid = notconfirmendmap.ArrayList[i];
				var specialvalue =  notconfirmendmap.GetValue(specialid).name;
				if(specialvalue && parseFloat(specialvalue)<0){
				    	bs.OtherCreditorsEnd -= parseFloat(specialvalue);
				}
				//nlapiLogExecution('debug', 'OtherCreditorsEnd'+specialid, specialvalue);
		    }
		    
		    // 其他流动负债
			var n2401 =  map.GetValue('2401').name;
		    if(!n2401){n2401 = [0,0];}
		    bs.OtherCurrentLiabilities =  0 - (parseFloat(n2401[1]) - parseFloat(n2401[0]));
		    n2401 = endmap.GetValue('2401').name;
		    if(!n2401){n2401 = [0,0];}
		    bs.OtherCurrentLiabilitiesEnd = 0 - (parseFloat(n2401[1]) - parseFloat(n2401[0]));
		    
		    /*
		    nlapiLogExecution('debug', 'ShortTermLoans', bs.ShortTermLoans);
		    nlapiLogExecution('debug', 'TradingFinancialLiabilities', bs.TradingFinancialLiabilities);
		    nlapiLogExecution('debug', 'NotesPayable', bs.NotesPayable);
		    nlapiLogExecution('debug', 'AccountsPayable', bs.AccountsPayable);
		    nlapiLogExecution('debug', 'AdvancesFromCustomers', bs.AdvancesFromCustomers);
		    nlapiLogExecution('debug', 'AccruedPayroll', bs.AccruedPayroll);
		    nlapiLogExecution('debug', 'TaxesPayable', bs.TaxesPayable);
		    nlapiLogExecution('debug', 'InterestPayable', bs.InterestPayable);
		    nlapiLogExecution('debug', 'DividendsPayable', bs.DividendsPayable);
		    nlapiLogExecution('debug', 'OtherCreditors', bs.OtherCreditors);
		    nlapiLogExecution('debug', 'OtherCurrentLiabilities', bs.OtherCurrentLiabilities);
		    */
		    
		   // 流动负债合计
		   bs.TotalCurrentLiabilities = parseFloat(bs.ShortTermLoans);
		   bs.TotalCurrentLiabilities += parseFloat(bs.TradingFinancialLiabilities);
		   bs.TotalCurrentLiabilities += parseFloat(bs.NotesPayable);
		   bs.TotalCurrentLiabilities += parseFloat(bs.AccountsPayable);
		   bs.TotalCurrentLiabilities += parseFloat(bs.AdvancesFromCustomers);
		   bs.TotalCurrentLiabilities += parseFloat(bs.AccruedPayroll);
		   bs.TotalCurrentLiabilities += parseFloat(bs.TaxesPayable);
		   bs.TotalCurrentLiabilities += parseFloat(bs.InterestPayable);
		   bs.TotalCurrentLiabilities += parseFloat(bs.DividendsPayable);
		   bs.TotalCurrentLiabilities += parseFloat(bs.OtherCreditors);
		   bs.TotalCurrentLiabilities += parseFloat(bs.OtherCurrentLiabilities);
		   
		   
		   bs.TotalCurrentLiabilitiesEnd = parseFloat(bs.ShortTermLoansEnd);
		   bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.TradingFinancialLiabilitiesEnd);
		   bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.NotesPayableEnd);
		   bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.AccountsPayableEnd);
		   bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.AdvancesFromCustomersEnd);
		   bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.AccruedPayrollEnd);
		   bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.TaxesPayableEnd);
		   bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.InterestPayableEnd);
		   bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.DividendsPayableEnd);
		   bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.OtherCreditorsEnd);
		   bs.TotalCurrentLiabilitiesEnd += parseFloat(bs.OtherCurrentLiabilitiesEnd);
		   
		    // 长期借款
			var n2501 =  map.GetValue('2501').name;
		    if(!n2501){n2501 = [0,0];}
		    bs.LongTermLoansPayable = 0 - (parseFloat(n2501[1]) - parseFloat(n2501[0]));
		    n2501 = endmap.GetValue('2501').name;
		    if(!n2501){n2501 = [0,0];}
		    bs.LongTermLoansPayableEnd = 0 - (parseFloat(n2501[1]) - parseFloat(n2501[0]));
		    
		   // 应付债券
			var n2502 =  map.GetValue('2502').name;
		    if(!n2502){n2502 = [0,0];}
		    bs.BondsPayable = 0 - (parseFloat(n2502[1]) - parseFloat(n2502[0]));
		    n2502 = endmap.GetValue('2502').name;
		    if(!n2502){n2502 = [0,0];}
		    bs.BondsPayableEnd =0 - (parseFloat(n2502[1]) - parseFloat(n2502[0]));
		    
		   // 长期应付款
			var n2701 =  map.GetValue('2701').name;
			var n2702 =  map.GetValue('2702').name;
		    if(!n2701){n2701 = [0,0];}
		    if(!n2702){n2702 = [0,0];}
		    bs.longTermAccountsPayable = 0 - (parseFloat(n2701[1]) - parseFloat(n2701[0])) - (parseFloat(n2702[1]) - parseFloat(n2702[0]));
		    n2701 = endmap.GetValue('2701').name;
		    n2702 = endmap.GetValue('2702').name;
		    if(!n2701){n2701 = [0,0];}
		    if(!n2702){n2702 = [0,0];}
		    bs.longTermAccountsPayableEnd = 0 - (parseFloat(n2701[1]) - parseFloat(n2701[0])) - (parseFloat(n2702[1]) - parseFloat(n2702[0]));
		    
		   // 专项应付款
			var n2711 =  map.GetValue('2711').name;
		    if(!n2711){n2711 = [0,0];}
		    bs.SpecialAccountsPayable =0 - (parseFloat(n2711[1]) - parseFloat(n2711[0]));
		    n2711 = endmap.GetValue('2711').name;
		    if(!n2711){n2711 = [0,0];}
		    bs.SpecialAccountsPayableEnd = 0 - (parseFloat(n2711[1]) - parseFloat(n2711[0]));
		    
		    // 预计负债
			var n2801 =  map.GetValue('2801').name;
		    if(!n2801){n2801 = [0,0];}
		    bs.AccruedLiabilities = 0 - (parseFloat(n2801[1]) - parseFloat(n2801[0]));
		    n2801 = endmap.GetValue('2801').name;
		    if(!n2801){n2801 = [0,0];}
		    bs.AccruedLiabilitiesEnd = 0 - (parseFloat(n2801[1]) - parseFloat(n2801[0]));
		    
		    // 递延所得税负债
			var n2901 =  map.GetValue('2901').name;
		    if(!n2901){n2901 = [0,0];}
		    bs.DeferredIncomeTaxLiabilities =  0 - (parseFloat(n2901[1]) - parseFloat(n2901[0]));
		    n2901 = endmap.GetValue('2901').name;
		    if(!n2901){n2901 = [0,0];}
		    bs.DeferredIncomeTaxLiabilitiesEnd = 0 - (parseFloat(n2901[1]) - parseFloat(n2901[0]));
		    
		    // 其他非流动负债
		    bs.OtherNonCurrentLiabilities = parseFloat('0');		    
		    bs.OtherNonCurrentLiabilitiesEnd = parseFloat('0');
		    
		    // 非流动负债合计
			bs.TotalNonCurrentLiabilities = parseFloat(bs.LongTermLoansPayable);
			bs.TotalNonCurrentLiabilities += parseFloat(bs.BondsPayable);
			bs.TotalNonCurrentLiabilities += parseFloat(bs.longTermAccountsPayable);
			bs.TotalNonCurrentLiabilities += parseFloat(bs.SpecialAccountsPayable);
			bs.TotalNonCurrentLiabilities += parseFloat(bs.AccruedLiabilities);
			bs.TotalNonCurrentLiabilities += parseFloat(bs.DeferredIncomeTaxLiabilities);
			bs.TotalNonCurrentLiabilities += parseFloat(bs.OtherNonCurrentLiabilities);
			
			bs.TotalNonCurrentLiabilitiesEnd = parseFloat(bs.LongTermLoansPayableEnd);
			bs.TotalNonCurrentLiabilitiesEnd += parseFloat(bs.BondsPayableEnd);
			bs.TotalNonCurrentLiabilitiesEnd += parseFloat(bs.longTermAccountsPayableEnd);
			bs.TotalNonCurrentLiabilitiesEnd += parseFloat(bs.SpecialAccountsPayableEnd);
			bs.TotalNonCurrentLiabilitiesEnd += parseFloat(bs.AccruedLiabilitiesEnd);
			bs.TotalNonCurrentLiabilitiesEnd += parseFloat(bs.DeferredIncomeTaxLiabilitiesEnd);
			bs.TotalNonCurrentLiabilitiesEnd += parseFloat(bs.OtherNonCurrentLiabilitiesEnd);
			
		     // 负债合计
			bs.TotalLongTermLiabilities = parseFloat(bs.TotalCurrentLiabilities) + parseFloat(bs.TotalNonCurrentLiabilities);
			bs.TotalLongTermLiabilities = parseFloat(bs.TotalLongTermLiabilities).toFixed(2);
			bs.TotalLongTermLiabilitiesEnd = parseFloat(bs.TotalCurrentLiabilitiesEnd) + parseFloat(bs.TotalNonCurrentLiabilitiesEnd);
			
		    // 实收资本（或股本）
			var n4001 =  map.GetValue('4001').name;
		    if(!n4001){n4001 = [0,0];}
		    bs.SubscribedCapital = 0 - (parseFloat(n4001[1]) - parseFloat(n4001[0]));
		    n4001 = endmap.GetValue('4001').name;
		    if(!n4001){n4001 = [0,0];}
		    bs.SubscribedCapitalEnd = 0 - (parseFloat(n4001[1]) - parseFloat(n4001[0]));
		    
		    // 资本公积
			var n4002 =  map.GetValue('4002').name;
		    if(!n4002){n4002 = [0,0];}
		    bs.CapitalSurplus =  0 - (parseFloat(n4002[1]) - parseFloat(n4002[0]));
		    n4002 = endmap.GetValue('4002').name;
		    if(!n4002){n4002 = [0,0];}
		    bs.CapitalSurplusEnd = 0 - (parseFloat(n4002[1]) - parseFloat(n4002[0]));
		    
		    // 减：库存股
			var n4201 =  map.GetValue('4201').name;
		    if(!n4201){n4201 = [0,0];}
		    bs.SubtractionTreasuryStock = 0 - (parseFloat(n4201[1]) - parseFloat(n4201[0]));
		    n4201 = endmap.GetValue('4201').name;
		    if(!n4201){n4201 = [0,0];}
		    bs.SubtractionTreasuryStockEnd = 0 - (parseFloat(n4201[1]) - parseFloat(n4201[0]));
		    
			// 盈余公积
			var n4101 =  map.GetValue('4101').name;
		    if(!n4101){n4101 = [0,0];}
		    bs.SurplusReserve =0 - (parseFloat(n4101[1]) - parseFloat(n4101[0]));
		    n4101 = endmap.GetValue('4101').name;
		    if(!n4101){n4101 = [0,0];}
		    bs.SurplusReserveEnd = 0 - (parseFloat(n4101[1]) - parseFloat(n4101[0]));
		    
		    // 未分配利润
		    //4104 + 4103 + [6001,6401,6403,6051,6601,6602,6603,6701,6101,6111,6301,6711,6801]; 
		    var ntotal6000 = 0;
		    var ntotal6001 = 0;
			var n4104 =  map.GetValue('4104').name;
		    if(!n4104){n4104 = [0,0];}
		    ntotal6000 = parseFloat(n4104[1]) - parseFloat(n4104[0]);
		    n4104 = endmap.GetValue('4104').name;
		    if(!n4104){n4104 = [0,0];}
		    ntotal6001 =  parseFloat(n4104[1]) - parseFloat(n4104[0]);
		   
			var n4103 =  map.GetValue('4103').name;
		    if(!n4103){n4103 = [0,0];}
		    ntotal6000 += parseFloat(n4103[1]) - parseFloat(n4103[0]);
		    n4103 = endmap.GetValue('4103').name;
		    if(!n4103){n4103 = [0,0];}
		    ntotal6001 +=  parseFloat(n4103[1]) - parseFloat(n4103[0]);
		    
		    var arrtemp = this.GetundividedProfit(map, endmap);
		    
		    //nlapiLogExecution('debug', '4104', ntotal6000+'/'+ntotal6001);
		    //nlapiLogExecution('debug', '6000', arrtemp[0]+'/'+arrtemp[1]);
		    
		    bs.RetainedEarnings = 0 - (parseFloat( ntotal6000) + parseFloat( arrtemp[0]));
		    bs.RetainedEarningsEnd =0 - (parseFloat(ntotal6001) + parseFloat(arrtemp[1]));
		    
		    // 所有者权益（或股东权益）合计
		    bs.TotalShareholdersEquity = parseFloat(bs.SubscribedCapital);  
		    bs.TotalShareholdersEquity += parseFloat(bs.CapitalSurplus);
		    bs.TotalShareholdersEquity += parseFloat(bs.SubtractionTreasuryStock);
		    bs.TotalShareholdersEquity += parseFloat(bs.SurplusReserve);
		    bs.TotalShareholdersEquity += parseFloat(bs.RetainedEarnings);
		    
		    bs.TotalShareholdersEquityEnd = parseFloat(bs.SubscribedCapitalEnd);
		    bs.TotalShareholdersEquityEnd += parseFloat(bs.CapitalSurplusEnd);
		    bs.TotalShareholdersEquityEnd += parseFloat(bs.SubtractionTreasuryStockEnd);
		    bs.TotalShareholdersEquityEnd += parseFloat(bs.SurplusReserveEnd);
		    bs.TotalShareholdersEquityEnd += parseFloat(bs.RetainedEarningsEnd);
		    // 负债和所有者权益（或股东权益）总计
			bs.TotalLiabilitiesEquity = parseFloat(bs.TotalLongTermLiabilities) + parseFloat(bs.TotalShareholdersEquity); 
			bs.TotalLiabilitiesEquityEnd = parseFloat(bs.TotalLongTermLiabilitiesEnd) + parseFloat(bs.TotalShareholdersEquityEnd);
			
			//create by
			var arrname = rule.GetUserNameById();
			var name = arrname.custentity_chinese_name;
			if(!name){ name = arrname.entityid; }
			
			xml += template.GetBalanceSheetXML(bs, name);
			xml += template.GetFooterXML;
			xml += template.GetPDFClosingTagXML;
			
			var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
			filename  = "BalanceSheet-" + filename + ".PDF";
			new trigger.local.write().WriteXMLToPDF(response, xml, filename);
		},
	
		GetUnConfirmAccounts:function(filters){
			var map = new trigger.local.HashTable();
			var savedsearch = nlapiLoadSearch('transaction', 'customsearch_trigger_bs_not_confirm');
			savedsearch.addFilters(filters);
			var resultset = savedsearch.runSearch();
			var resultslice = resultset.getResults(0, 50);
			for ( var rs in resultslice) {
				var credit = resultslice[rs].getValue('creditamount', null, 'SUM');
				var debit = resultslice[rs].getValue('debitamount', null, 'SUM');
				var number = resultslice[rs].getValue('number', 'account', 'GROUP');
				if (!number || number == "0") {continue;}
				if (!credit) {credit = 0;}
				if (!debit) {debit = 0;}
				var val = parseFloat(debit) - parseFloat(credit);
				map.Add(number, new trigger.local.HashEntity(number, val));
				// nlapiLogExecution('debug', 'result',String.format(// "{0}/{1}/{2}",number,credit,debit));
			}
			return map;
		},
		
		/**
		 * 存货
		 */
		GetTotalByIntentories:function( map, endmap ){
			var n = 0;
			var m = 0;
		    var n1401 =  map.GetValue('1401').name;
		    if(!n1401){n1401 = [0,0];}
		    n = parseFloat(n1401[1]) - parseFloat(n1401[0]);
		    n1401 = endmap.GetValue('1401').name;
		    if(!n1401){n1401 = [0,0];}
		    m = parseFloat(n1401[1]) -parseFloat( n1401[0]);
		    
		    var n1402 =  map.GetValue('1402').name;
		    if(!n1402){n1402 = [0,0];}
		    n += parseFloat(n1402[1]) - parseFloat(n1402[0]);
		    n1402 = endmap.GetValue('1402').name;
		    if(!n1402){n1402 = [0,0];}
		    m += parseFloat(n1402[1]) -parseFloat( n1402[0]);
		    
		    var n1403 =  map.GetValue('1403').name;
		    if(!n1403){n1403 = [0,0];}
		    n += parseFloat(n1403[1]) - parseFloat(n1403[0]);
		    n1403 = endmap.GetValue('1403').name;
		    if(!n1403){n1403 = [0,0];}
		    m += parseFloat(n1403[1]) -parseFloat( n1403[0]);
		    
		    var n1404 =  map.GetValue('1404').name;
		    if(!n1404){n1404 = [0,0];}
		    n += parseFloat(n1404[1]) - parseFloat(n1404[0]);
		    n1404 = endmap.GetValue('1404').name;
		    if(!n1404){n1404 = [0,0];}
		    m += parseFloat(n1404[1]) -parseFloat( n1404[0]);
		    
		    var n1405 =  map.GetValue('1405').name;
		    if(!n1405){n1405 = [0,0];}
		    n += parseFloat(n1405[1]) - parseFloat(n1405[0]);
		    n1405 = endmap.GetValue('1405').name;
		    if(!n1405){n1405 = [0,0];}
		    m += parseFloat(n1405[1]) -parseFloat( n1405[0]);
		    
		    var n1406 =  map.GetValue('1406').name;
		    if(!n1406){n1406 = [0,0];}
		    n += parseFloat(n1406[1]) - parseFloat(n1406[0]);
		    n1406 = endmap.GetValue('1406').name;
		    if(!n1406){n1406 = [0,0];}
		    m += parseFloat(n1406[1]) -parseFloat( n1406[0]);
		    
		    var n1407 =  map.GetValue('1407').name;
		    if(!n1407){n1407 = [0,0];}
		    n += parseFloat(n1407[1]) - parseFloat(n1407[0]);
		    n1407 = endmap.GetValue('1407').name;
		    if(!n1407){n1407 = [0,0];}
		    m += parseFloat(n1407[1]) -parseFloat( n1407[0]);
		    
		    var n1408 =  map.GetValue('1408').name;
		    if(!n1408){n1408 = [0,0];}
		    n += parseFloat(n1408[1]) - parseFloat(n1408[0]);
		    n1408 = endmap.GetValue('1408').name;
		    if(!n1408){n1408 = [0,0];}
		    m += parseFloat(n1408[1]) -parseFloat( n1408[0]);
		    
		    var n1411 =  map.GetValue('1411').name;
		    if(!n1411){n1411 = [0,0];}
		    n += parseFloat(n1411[1]) - parseFloat(n1411[0]);
		    n1411 = endmap.GetValue('1411').name;
		    if(!n1411){n1411 = [0,0];}
		    m += parseFloat(n1411[1]) -parseFloat( n1411[0]);
		    
		    var n1421 =  map.GetValue('1421').name;
		    if(!n1421){n1421 = [0,0];}
		    n += parseFloat(n1421[1]) - parseFloat(n1421[0]);
		    n1421 = endmap.GetValue('1421').name;
		    if(!n1421){n1421 = [0,0];}
		    m += parseFloat(n1421[1]) -parseFloat( n1421[0]);		    
		    
		    var n1461 =  map.GetValue('1461').name;
		    if(!n1461){n1461 = [0,0];}
		    n += parseFloat(n1461[1]) - parseFloat(n1461[0]);
		    n1461 = endmap.GetValue('1461').name;
		    if(!n1461){n1461 = [0,0];}
		    m += parseFloat(n1461[1]) -parseFloat( n1461[0]);
		    
		    var n1471 =  map.GetValue('1471').name;
		    if(!n1471){n1471 = [0,0];}
		    n += parseFloat(n1471[1]) - parseFloat(n1471[0]);
		    n1471 = endmap.GetValue('1471').name;
		    if(!n1471){n1471 = [0,0];}
		    m += parseFloat(n1471[1]) -parseFloat( n1471[0]);
		    
		    var n1611 =  map.GetValue('1611').name;
		    if(!n1611){n1611 = [0,0];}
		    n += parseFloat(n1611[1]) - parseFloat(n1611[0]);
		    n1611 = endmap.GetValue('1611').name;
		    if(!n1611){n1611 = [0,0];}
		    m += parseFloat(n1611[1]) -parseFloat( n1611[0]);
		    
		    var n1321 =  map.GetValue('1321').name;
		    if(!n1321){n1321 = [0,0];}
		    n += parseFloat(n1321[1]) - parseFloat(n1321[0]);
		    n1321 = endmap.GetValue('1321').name;
		    if(!n1321){n1321 = [0,0];}
		    m += parseFloat(n1321[1]) -parseFloat( n1321[0]);
		    
		    var n2134 =  map.GetValue('2134').name;
		    if(!n2134){n2134 = [0,0];}
		    n += parseFloat(n2134[1]) - parseFloat(n2134[0]);
		    n2134 = endmap.GetValue('2134').name;
		    if(!n2134){n2134 = [0,0];}
		    m += parseFloat(n2134[1]) -parseFloat( n2134[0]);
		    
		    var n5001 =  map.GetValue('5001').name;
		    if(!n5001){n5001 = [0,0];}
		    n += parseFloat(n5001[1]) - parseFloat(n5001[0]);
		    n5001 = endmap.GetValue('5001').name;
		    if(!n5001){n5001 = [0,0];}
		    m += parseFloat(n5001[1]) -parseFloat( n5001[0]);
		    
		    var n5201 =  map.GetValue('5201').name;
		    if(!n5201){n5201 = [0,0];}
		    n += parseFloat(n5201[1]) - parseFloat(n5201[0]);
		    n5201 = endmap.GetValue('5201').name;
		    if(!n5201){n5201 = [0,0];}
		    m += parseFloat(n5201[1]) -parseFloat( n5201[0]);
		    
		    return [n,m];
		},
		/**
		 * 未分配利润
		 */
		GetundividedProfit:function(map, endmap){
			//主营业务收入参数 6001
			//主营业务收入数据
			var n = 0;
			var m = 0;
		    var n6001 =  map.GetValue('6001').name;
		    if(!n6001){n6001 = [0,0];}
		    n = parseFloat(n6001[1]) - parseFloat(n6001[0]);
		    n6001 = endmap.GetValue('6001').name;
		    if(!n6001){n6001 = [0,0];}
		    m = parseFloat(n6001[1]) -parseFloat( n6001[0]);
		    
			//其它业务收入参数 6051
		    var n6051 =  map.GetValue('6051').name;
		    if(!n6051){n6051 = [0,0];}
		    n += parseFloat(n6051[1]) - parseFloat(n6051[0]);
		    n6051 = endmap.GetValue('6051').name;
		    if(!n6051){n6051 = [0,0];}
		    m += parseFloat(n6051[1]) - parseFloat(n6051[0]);
		    
			//主营业务成本 6401
		    var n6401 =  map.GetValue('6401').name;
		    if(!n6401){n6401 = [0,0];}
		    n += parseFloat(n6401[1]) - parseFloat(n6401[0]);
		    n6401 = endmap.GetValue('6401').name;
		    if(!n6401){n6401 = [0,0];}
		    m +=parseFloat(n6401[1]) - parseFloat(n6401[0]);
		    
			//其它业务成本 6402
		    var n6402 =  map.GetValue('6402').name;
		    if(!n6402){n6402 = [0,0];}
		    n += parseFloat(n6402[1]) - parseFloat(n6402[0]);
		    n6402 = endmap.GetValue('6402').name;
		    if(!n6402){n6402 = [0,0];}
		    m += parseFloat(n6402[1]) - parseFloat(n6402[0]);

			//营业税金及附加 6403
		    var n6403 =  map.GetValue('6403').name;
		    if(!n6403){n6403 = [0,0];}
		    n +=parseFloat(n6403[1]) - parseFloat(n6403[0]);
		    n6403 = endmap.GetValue('6403').name;
		    if(!n6403){n6403 = [0,0];}
		    m += parseFloat(n6403[1]) - parseFloat(n6403[0]);
			
			//销售费用 6601
		    var n6601 =  map.GetValue('6601').name;
		    if(!n6601){n6601 = [0,0];}
		    n+= parseFloat(n6601[1]) - parseFloat(n6601[0]);
		    n6601 = endmap.GetValue('6601').name;
		    if(!n6601){n6601 = [0,0];}
		    m += parseFloat(n6601[1]) - parseFloat(n6601[0]);
		    
			//管理费用 6602
		    var n6602 =  map.GetValue('6602').name;
		    if(!n6602){n6602 = [0,0];}
		    n+= parseFloat(n6602[1]) - parseFloat(n6602[0]);
		    n6602 = endmap.GetValue('6602').name;
		    if(!n6602){n6602 = [0,0];}
		    m+= parseFloat(n6602[1]) - parseFloat(n6602[0]);
		   
			//账务费用 6603
		    var n6603 =  map.GetValue('6603').name;
		    if(!n6603){n6603 = [0,0];}
		    n+= parseFloat(n6603[1]) - parseFloat(n6603[0]);
		    n6603 = endmap.GetValue('6603').name;
		    if(!n6603){n6603 = [0,0];}
		    m+= parseFloat(n6603[1]) - parseFloat(n6603[0]);
		    
		    //资产减值损失 6701
		    var n6701 =  map.GetValue('6701').name;
		    if(!n6701){n6701 = [0,0];}
		    n+= parseFloat(n6701[1]) - parseFloat(n6701[0]);
		    n6701 = endmap.GetValue('6701').name;
		    if(!n6701){n6701 = [0,0];}
		    m+= parseFloat(n6701[1]) - parseFloat(n6701[0]);
		    
		    //加：公允价值变动收益 6101
		    var n6101 =  map.GetValue('6101').name;
		    if(!n6101){n6101 = [0,0];}
		    n+= parseFloat(n6101[1]) - parseFloat(n6101[0]);
		    n6101 = endmap.GetValue('6101').name;
		    if(!n6101){n6101 = [0,0];}
		    m+= parseFloat(n6101[1]) - parseFloat(n6101[0]);
		    
			//加：投资收益 6111
			var n6111 =  map.GetValue('6111').name;
		    if(!n6111){n6111 = [0,0];}
		    n+= parseFloat(n6111[1]) - parseFloat(n6111[0]);
		    n6111 = endmap.GetValue('6111').name;
		    if(!n6111){n6111 = [0,0];}
		    m+= parseFloat(n6111[1]) - parseFloat(n6111[0]);
			
			//营业外收入 6301
			var n6301 =  map.GetValue('6301').name;
		    if(!n6301){n6301 = [0,0];}
		    n+= parseFloat(n6301[1]) - parseFloat(n6301[0]);
		    n6301 = endmap.GetValue('6301').name;
		    if(!n6301){n6301 = [0,0];}
		    m+= parseFloat(n6301[1]) - parseFloat(n6301[0]);
		    
			//营业外支出 6711
			var n6711 =  map.GetValue('6711').name;
		    if(!n6711){n6711 = [0,0];}
		    n+= parseFloat(n6711[1]) - parseFloat(n6711[0]);
		    n6711 = endmap.GetValue('6711').name;
		    if(!n6711){n6711 = [0,0];}
		    m+= parseFloat(n6711[1]) - parseFloat(n6711[0]);
		    
		    //以前年度损益调整 6901
		    var n6901 =  map.GetValue('6901').name;
		    if(!n6901){n6901 = [0,0];}
		    n += parseFloat(n6901[1]) - parseFloat(n6901[0]);
		    n6901 = endmap.GetValue('6901').name;
		    if(!n6901){n6901 = [0,0];}
		    m += parseFloat(n6901[1]) - parseFloat(n6901[0]);
		    
			//所得税费用 6801
			var n6801 =  map.GetValue('6801').name;
		    if(!n6801){n6801 = [0,0];}
		    n+= parseFloat(n6801[1]) - parseFloat(n6801[0]);
		    n6801 = endmap.GetValue('6801').name;
		    if(!n6801){n6801 = [0,0];}
		    m+= parseFloat(n6801[1]) - parseFloat(n6801[0]);
			return [n,m];
		},

		/**
		 * get the results from the saved search that is sum by some of account and period date
		 * @param date  传入参数
		 */
		GetSumRecordsBySomeOfItem:function(internalids, date) {
			if (!date || !internalids) {
				return 0;
			}
			var filters = [];
			filters[0] = new nlobjSearchFilter('internalid', 'account', 'anyof', internalids);
			filters[1] = new nlobjSearchFilter('trandate', null, 'onorbefore', date);
			var savedsearch = nlapiLoadSearch('transaction', 'customsearch_trigger_balance_sheet');
			savedsearch.addFilters(filters);
			var resultset = savedsearch.runSearch();
			var resultslice = resultset.getResults(0, 1);

			var credit = resultslice[0].getValue('creditamount', null, 'sum');
			var debit = resultslice[0].getValue('debitamount', null, 'sum');
			return debit - credit;
		}
};
