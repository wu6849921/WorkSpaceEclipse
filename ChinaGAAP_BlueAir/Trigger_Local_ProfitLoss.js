/**
 * Module Description: Profit & Loss
 * Version    Date            Author           Remarks
 * 1.00       23 Oct 2014   Winson.Chen 2014
 * 
 */


triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.profitloss = function(){}
trigger.local.profitloss.prototype = {
		writeProfitToPDF:function(subsidiaryid,subsidiaryname, periodid, period, response) {
			var filter = [];     //本月, this month
			var filters = [];    //本年, this year
			var titletime;
			var profit = Object.create(trigger.local.entity.ProfitAndLoss);

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
				
				var accPeriodEndDate = accPeriod.getFieldValue('enddate');
				firstSlash = accPeriodEndDate.indexOf('/');
				lastSlash = accPeriodEndDate.lastIndexOf('/');
				var endMonth = accPeriodEndDate.substring(0,firstSlash);
				var endDay = accPeriodEndDate.substring(firstSlash +1, lastSlash);
				var endYear = accPeriodEndDate.substring(lastSlash+1);							
				
				var month = com.GetMonthByPeriod(period);				
				var begintime =   '1/1/' + startYear;
				titletime = startYear+'年' + month+'月';	
				
				var currentmonthstart = String.format("{0}/{1}/{2}", startMonth, startDay, startYear);				
				var currentmonthend = String.format("{0}/{1}/{2}",endMonth, endDay, endYear);	
				
//				nlapiLogExecution('debug', '本月', 'currentmonthstart - currentmonthend:' + currentmonthstart +'-'+ currentmonthend);				
//				nlapiLogExecution('debug', '本年', 'begintime - periodtime:' + begintime  +'-'+  periodtime);				
				
				//本月
				filter[filter.length] = new nlobjSearchFilter('postingperiod', null, 'abs', [periodid]);//supports a solution for adjust period
//				filter[filter.length] = new nlobjSearchFilter('startdate', 'accountingperiod','within', currentmonthstart, currentmonthend);
				//本年
				filters[filters.length] = new nlobjSearchFilter('startdate', 'accountingperiod','within', begintime, currentmonthstart);
			}
		
			var xml = template.GetProfitXMLHeader(subsidiaryname , titletime);
			var profit = this.GetProfitRecords( filter, filters );
			var arrname = rule.GetUserNameById();
			var name = arrname.custentity_chinese_name;
			if(!name){ name = arrname.entityid; }
		
			xml += template.GetProfitXML(profit, name); 
			var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
			filename  = "ProfitAndLoss-" + filename + ".PDF";
			new trigger.local.write().WriteXMLToPDF(response, xml, filename);
		},

		
		GetProfitRecords:function( filter, filters )
		{
			//profit parameters, it could be change on diferent company.
			var strid = "6402,6403,6051,6601,6603,6701,6101,6111,6301,6711,6801,6901,6001,6401,6602";
			var sql = rule.GetSQLFromMappingRecords( strid );

			//nlapiLogExecution('debug', 'PROFIT-SQL',sql);

			var column = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
			column.setFormula(sql);
					
			var map = this.GetProfitSUMOfRecordsByCNID( filters,column );
			var endmap = this.GetProfitSUMOfRecordsByCNID( filter, column );

			var profit = Object.create(trigger.local.entity.ProfitAndLoss);
			//主营业务收入参数 6001
			//主营业务收入数据
		    var n6001 =  map.GetValue('6001').name;
		    if(!n6001){n6001 = [0,0];}
		    profit.income = parseFloat(n6001[1]) - parseFloat(n6001[0]);
		    n6001 = endmap.GetValue('6001').name;
		    if(!n6001){n6001 = [0,0];}
		    profit.monthincome = parseFloat(n6001[1]) -parseFloat( n6001[0]);
		    
			//其它业务收入参数 6051
		    var n6051 =  map.GetValue('6051').name;
		    if(!n6051){n6051 = [0,0];}
		    profit.otherincome = parseFloat(n6051[1]) - parseFloat(n6051[0]);
		    n6051 = endmap.GetValue('6051').name;
		    if(!n6051){n6051 = [0,0];}
		    profit.monthotherincome = parseFloat(n6051[1]) - parseFloat(n6051[0]);
		    
			//主营业务成本 6401
		    var n6401 =  map.GetValue('6401').name;
		    if(!n6401){n6401 = [0,0];}
		    profit.maincost = parseFloat(n6401[1]) - parseFloat(n6401[0]);
		    n6401 = endmap.GetValue('6401').name;
		    if(!n6401){n6401 = [0,0];}
		    profit.monthmaincost =parseFloat(n6401[1]) - parseFloat(n6401[0]);
		    
			//其它业务成本 6402
		    var n6402 =  map.GetValue('6402').name;
		    if(!n6402){n6402 = [0,0];}
		    profit.othercost = parseFloat(n6402[1]) - parseFloat(n6402[0]);
		    n6402 = endmap.GetValue('6402').name;
		    if(!n6402){n6402 = [0,0];}
		    profit.monthothercost = parseFloat(n6402[1]) - parseFloat(n6402[0]);

			
			//营业税金及附加 6403
		    var n6403 =  map.GetValue('6403').name;
		    if(!n6403){n6403 = [0,0];}
		    profit.maintax =parseFloat(n6403[1]) - parseFloat(n6403[0]);
		    n6403 = endmap.GetValue('6403').name;
		    if(!n6403){n6403 = [0,0];}
		    profit.monthmaintax = parseFloat(n6403[1]) - parseFloat(n6403[0]);
			
			//营业收入
			profit.allincome = 0 - (parseFloat(profit.income)  + parseFloat(profit.otherincome));
			profit.monthallincome = 0 - ( parseFloat(profit.monthincome)  + parseFloat(profit.monthotherincome));
			
			//营业成本
			profit.operatingcost = parseFloat(profit.maincost)  + parseFloat(profit.othercost);
			profit.monthoperatingcost = parseFloat(profit.monthmaincost)  + parseFloat(profit.monthothercost);
			
			//经营利润
			profit.earnprofit = profit.allincome - profit.operatingcost - profit.maintax;
			profit.monthearnprofit = profit.monthallincome - profit.monthoperatingcost - profit.monthmaintax;
			
			//其它业务利润
			profit.otherprofit = 0-( profit.otherincome -  profit.othercost);
			profit.monthotherprofit = 0 - (profit.monthotherincome -  profit.monthothercost);
			//nlapiLogExecution('debug', '其它业务利润',profit.otherincome + '/' + profit.othercost);
			
			//销售费用 6601
		    var n6601 =  map.GetValue('6601').name;
		    if(!n6601){n6601 = [0,0];}
		    profit.sellcost = parseFloat(n6601[1]) - parseFloat(n6601[0]);
		    n6601 = endmap.GetValue('6601').name;
		    if(!n6601){n6601 = [0,0];}
		    profit.monthsellcost = parseFloat(n6601[1]) - parseFloat(n6601[0]);
		    
			//管理费用 6602
		    var n6602 =  map.GetValue('6602').name;
		    if(!n6602){n6602 = [0,0];}
		    profit.managercost = parseFloat(n6602[1]) - parseFloat(n6602[0]);
		    n6602 = endmap.GetValue('6602').name;
		    if(!n6602){n6602 = [0,0];}
		    profit.monthmanagercost = parseFloat(n6602[1]) - parseFloat(n6602[0]);
		   
			//财务费用 6603
		    var n6603 =  map.GetValue('6603').name;
		    if(!n6603){n6603 = [0,0];}
		    profit.financialcost = parseFloat(n6603[1]) - parseFloat(n6603[0]);
		    n6603 = endmap.GetValue('6603').name;
		    if(!n6603){n6603 = [0,0];}
		    profit.monthfinancialcost = parseFloat(n6603[1]) - parseFloat(n6603[0]);
		    
		  //nlapiLogExecution('debug', '财务费用',profit.financialcost + '/' + profit.monthfinancialcost);
		    
		    //资产减值损失 6701
		    var n6701 =  map.GetValue('6701').name;
		    if(!n6701){n6701 = [0,0];}
		    profit.assetsimpairmentloss = parseFloat(n6701[1]) - parseFloat(n6701[0]);
		    n6701 = endmap.GetValue('6701').name;
		    if(!n6701){n6701 = [0,0];}
		    profit.monthassetsimpairmentloss = parseFloat(n6701[1]) - parseFloat(n6701[0]);
		    
		    //加：公允价值变动收益 6101
		    var n6101 =  map.GetValue('6101').name;
		    if(!n6101){n6101 = [0,0];}
		    profit.gainsonthechanges = parseFloat(n6101[1]) - parseFloat(n6101[0]);
		    n6101 = endmap.GetValue('6101').name;
		    if(!n6101){n6101 = [0,0];}
		    profit.monthgainsonthechanges = parseFloat(n6101[1]) - parseFloat(n6101[0]);
		    
			//加：投资收益 6111
			var n6111 =  map.GetValue('6111').name;
		    if(!n6111){n6111 = [0,0];}
		    profit.investmentincome = parseFloat(n6111[1]) - parseFloat(n6111[0]);
		    n6111 = endmap.GetValue('6111').name;
		    if(!n6111){n6111 = [0,0];}
		    profit.monthinvestmentincome = parseFloat(n6111[1]) - parseFloat(n6111[0]);
		    
		    //营业利润
		    profit.operatingprofit = profit.allincome;
		    profit.operatingprofit -= profit.operatingcost;
		    profit.operatingprofit -= profit.maintax;
		    profit.operatingprofit -= profit.sellcost; 
		    profit.operatingprofit -= profit.managercost;
		    profit.operatingprofit -= profit.financialcost;
		    profit.operatingprofit -= profit.assetsimpairmentloss;
		    profit.operatingprofit += profit.gainsonthechanges; 
		    profit.operatingprofit += profit.investmentincome; 

		    
		    profit.monthoperatingprofit = profit.monthallincome;
		    profit.monthoperatingprofit -= profit.monthoperatingcost;
		    profit.monthoperatingprofit -= profit.monthmaintax;
		    profit.monthoperatingprofit -= profit.monthsellcost;
		    profit.monthoperatingprofit -= profit.monthmanagercost;
		    profit.monthoperatingprofit -= profit.monthfinancialcost;
		    profit.monthoperatingprofit -= profit.monthassetsimpairmentloss;
		    profit.monthoperatingprofit += profit.monthgainsonthechanges;
		    profit.monthoperatingprofit += profit.monthinvestmentincome;
			
			//营业外收入 6301
			var n6301 =  map.GetValue('6301').name;
		    if(!n6301){n6301 = [0,0];}
		    profit.outsideincome = 0 - (parseFloat(n6301[1]) - parseFloat(n6301[0]));
		    n6301 = endmap.GetValue('6301').name;
		    if(!n6301){n6301 = [0,0];}
		    profit.monthoutsideincome =0 - ( parseFloat(n6301[1]) - parseFloat(n6301[0]));
		    
			//营业外支出 6711
			var n6711 =  map.GetValue('6711').name;
		    if(!n6711){n6711 = [0,0];}
		    profit.outsidecost = parseFloat(n6711[1]) - parseFloat(n6711[0]);
		    n6711 = endmap.GetValue('6711').name;
		    if(!n6711){n6711 = [0,0];}
		    profit.monthoutsidecost = parseFloat(n6711[1]) - parseFloat(n6711[0]);
		     
		    //以前年度损益调整 6901
		    var n6901 =  map.GetValue('6901').name;
		    if(!n6901){n6901 = [0,0];}
		    profit.profitandlossadjust = parseFloat(n6901[1]) - parseFloat(n6901[0]);
		    n6901 = endmap.GetValue('6901').name;
		    if(!n6901){n6901 = [0,0];}
		    profit.monthprofitandlossadjust = parseFloat(n6901[1]) - parseFloat(n6901[0]);
		    
			//利润总额
			profit.totalprofit = profit.operatingprofit + profit.outsideincome;
			profit.totalprofit -= profit.outsidecost;
			profit.monthtotalprofit = profit.monthoperatingprofit + profit.monthoutsideincome;
			profit.monthtotalprofit -= profit.monthoutsidecost;
			
			//所得税费用 6801
			var n6801 =  map.GetValue('6801').name;
		    if(!n6801){n6801 = [0,0];}
		    profit.tax = parseFloat(n6801[1]) - parseFloat(n6801[0]);
		    n6801 = endmap.GetValue('6801').name;
		    if(!n6801){n6801 = [0,0];}
		    profit.monthtax = parseFloat(n6801[1]) - parseFloat(n6801[0]);
		    
		    //净利润
			profit.netprofit = profit.totalprofit  - profit.tax; 
			profit.monthnetprofit = profit.monthtotalprofit  - profit.monthtax;
			return profit;
		},
		
		GetProfitSUMOfRecordsByCNID:function(filters, column) {
			var savedsearch = nlapiLoadSearch('transaction','customsearch_trigger_balance_sheet');
			
			if (filters.length > 0) {
				savedsearch.addFilters(filters);
				filters = savedsearch.getFilters();
			}
		    if(column){
			   savedsearch.addColumns([column]);
		    }
			var resultset = savedsearch.runSearch();
			var map = new trigger.local.HashTable();

			var resultslice = resultset.getResults(0, 50);
			for ( var rs in resultslice) {
				var credit = resultslice[rs].getValue('creditamount', null, 'SUM');
				var debit = resultslice[rs].getValue('debitamount', null, 'SUM');
				var number = resultslice[rs].getValue(column);
				if (!credit) {credit = 0;}
				if (!debit) {debit = 0;}
				map.Add(number, new trigger.local.HashEntity(number, [ credit, debit ]));
				//nlapiLogExecution('debug', 'result',number+'/'+credit+'/'+debit);
			}
			return map;
		}
};