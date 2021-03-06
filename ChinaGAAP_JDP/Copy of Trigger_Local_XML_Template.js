/**
 * Module Description Localization report template for the PDF file Version Date
 * Author Remarks 1.00 09 Sep 2014 Winson.Chen
 * 
 */

triggernamespace("trigger.local");
var com = new trigger.local.common();

trigger.local.xmltemplate = function() {
}
trigger.local.xmltemplate.prototype = {
	constructor : trigger.local.xmltemplate,
	/**
	 * *****************************************Profit Report
	 * Begin*********************************************************
	 */
	GetProfitXMLHeader : function(subsidiaryname, peroidtime) {
		var xml = "<?xml version='1.0' encoding='UTF-8'?>\n";
		xml += "<!DOCTYPE pdf PUBLIC '-//big.faceless.org//report' 'report-1.1.dtd'>\n";
		xml += "<pdf lang='zh-CN' xml:lang='zh-CN'>\n";
		xml += "<head>"; // head
		xml += "<macrolist><macro id='footer'><p align='right'>Page <pagenumber/> of  <totalpages/></p></macro></macrolist>";
		xml += "<style type='text/css'>";
		xml += "html{font:normal 10pt STSong;}";
		xml += "body{font-size:10pt;width:100%;text-align:left;}";
		xml += "#tablecss {width:100%;height:100%}";
		xml += "#content {width:523pt}";
		xml += "#header{align:center;width:523pt; margin-top:20pt;font-size:14pt;font-weight:bold;}";
		xml += "#main th{border:0.2pt;padding-left:5px;valign:middle;}";
		xml += "#main td{align:right;border:0.2pt;color:blue;}";
		xml += ".bgcolor{background-color:#AAAAAA;}";
		xml += "#title{font:12px;font-weight:blod;}";
		xml += "#col1 {width:230pt;align:center;}";
		xml += "#col2 {width:33pt;align:center}";
		xml += "#col3 {width:130pt;align:center;}";
		xml += "#col4 {width:130pt;align:center;}";
		xml += "</style>";

		xml += "</head>\n";
		xml += "<body footer='footer' size='A4'>\n";

		xml += "<table id='tablecss'><tr><td align='center'>";
		xml += "<p id='header'>利润表</p>";
		xml += "<table id='content'>";
		xml += "<tr><td  colspan='3' align='right'>会企02表</td></tr>";
		xml += String
				.format(
						"<tr><td>编制单位：{0}</td><td>{1}</td><td align='right'>单位：元</td></tr>",
						subsidiaryname, peroidtime);
		xml += "</table>";
		return xml;
	},

	/**
	 * 2014会计准则样式
	 */
	GetProfitXML : function(profit, name) {
		var xml = "<table id='main'>";
		xml += "<tr id='title'><th id='col1'>项目</th><th id='col2'>行数</th><th id='col3'>本月数</th><th id='col4'>本年累计数</th></tr>";
		xml += String
				.format(
						"<tr><th class='bgcolor'>一、营业收入</th><th>1</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthallincome), com
								.formatCurrency(profit.allincome));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;减：营业成本</th><th>2</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthoperatingcost), com
								.formatCurrency(profit.operatingcost));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;营业税金及附加</th><th>3</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthmaintax), com
								.formatCurrency(profit.maintax));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;营业费用</th><th>4</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthsellcost), com
								.formatCurrency(profit.sellcost));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;管理费用</th><th>5</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthmanagercost), com
								.formatCurrency(profit.managercost));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;财务费用</th><th>6</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthfinancialcost), com
								.formatCurrency(profit.financialcost));
		// xml +=
		// String.format("<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;资产减值损失</th><th>7</th><td>{0}</td><td>{1}</td></tr>",com.formatCurrency(profit.monthassetsimpairmentloss),
		// com.formatCurrency(profit.assetsimpairmentloss));
		// xml += String.format("<tr><th>&nbsp;&nbsp;加： 公允价值变动收益
		// （损失以“-”号列示）</th><th>8</th><td>{0}</td><td>{1}</td></tr>",com.formatCurrency(profit.monthgainsonthechanges),
		// com.formatCurrency(profit.gainsonthechanges));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;投资收益（损失以“－”号填列）</th><th>7</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthinvestmentincome), com
								.formatCurrency(profit.investmentincome));

		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;补贴收入（损失以“－”号填列）</th><th>8</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthsubsidyincome), com
								.formatCurrency(profit.subsidyincome));

		xml += "<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;其中：对联营企业和合营企业的投资收益</th><th>9</th><td>0.00</td><td>0.00</td></tr>";
		xml += String
				.format(
						"<tr><th class='bgcolor'>二、营业利润（亏损以“－”号填列）</th><th>10</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthoperatingprofit), com
								.formatCurrency(profit.operatingprofit));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;加：营业外收入</th><th>11</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthoutsideincome), com
								.formatCurrency(profit.outsideincome));
		xml += "<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;其中：非流动资产处置利得</th><th>12</th><td>0.00</td><td>0.00</td></tr>";
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;减：营业外支出</th><th>13</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthoutsidecost), com
								.formatCurrency(profit.outsidecost));
		xml += "<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;其中：非流动资产处置损失</th><th>14</th><td>0.00</td><td>0.00</td></tr>"; // 15
		// end
		xml += String
				.format(
						"<tr><th class='bgcolor'>三、利润总额（亏损以“－”号填列）</th><th>15</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthtotalprofit), com
								.formatCurrency(profit.totalprofit));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;减：所得税费用</th><th>16</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthtax), com
								.formatCurrency(profit.tax));
		xml += String
				.format(
						"<tr><th class='bgcolor'>四、净利润（亏损以“－”号填列）</th><th>17</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthnetprofit), com
								.formatCurrency(profit.netprofit));
		xml += "<tr><th class='bgcolor'>五、每股收益</th><th>18</th><td>0.00</td><td>0.00</td></tr>";
		xml += "<tr><th>&nbsp;&nbsp;（一）基本每股收益</th><th>19</th><td>0.00</td><td>0.00</td></tr>";
		xml += "<tr><th>&nbsp;&nbsp;（二）稀释每股收益</th><th>20</th><td>0.00</td><td>0.00</td></tr>";

		xml += String
				.format(
						"<tr><td colspan='4' style='border:0;color:black;'>制表人：{0}</td></tr>",
						name);
		xml += "</table>";
		xml += "</td></tr>";
		xml += "</table>";
		xml += "</body>\n</pdf>";
		return xml;
	},

	/**
	 * *****************************************Profit Report
	 * End*********************************************************
	 */
	/**
	 * *****************************************Balance Sheet
	 * Begin*****************************************************
	 */
	GetBalanceSheetXMLHead : "<?xml version='1.0' encoding='UTF-8'?>\n"
			+ "<!DOCTYPE pdf PUBLIC '-//big.faceless.org//report' 'report-1.1.dtd'>\n"
			+ "<pdf lang='zh-CN' xml:lang='zh-CN'>\n"
			+ "<head>"
			+ "<macrolist><macro id='footer'><p align='right'>Page <pagenumber/> of <totalpages/></p></macro></macrolist>"
			+ "<style type='text/css'>"
			+ "html{font:normal 8pt 'Microsoft YaHei',STSong;}"
			+ "body{width:100%;text-align:left;}"
			+ "#tablecss {width:100%;height:100%;}"
			+ "#content {width:523pt;font-size:10pt}"
			+ "#title{font-size:14pt;font-weight:bold;align:center}"
			+ "#header{width:523pt;font-size:10pt;}"
			+ "#txtright{align:right}"
			+ "#main{width:523pt;font-size:8pt;}"
			+ "#main th{valign:middle;font:10pt;border:0.2pt;padding-left:2px;}"
			+ ".bgcolor{background-color:#AAAAAA;}"
			+ "#main td{align:right;border:0.2pt;color:blue;}"
			+ "#col1 {width:100pt;valign:middle;align:center;}"
			+ "#col2 {width:20pt;valign:middle;align:center;}"
			+ "#col3 {width:60pt;valign:middle;align:center;}"
			+ "#col4 {width:60pt;valign:middle;align:center;}"
			+ "#col5 {width:143pt;;align:center;}"
			+ "#col6 {width:20pt;valign:middle;align:center;}"
			+ "#col7 {width:60pt;valign:middle;align:center;}"
			+ "#col8 {width:60pt;valign:middle;align:center;}" + "</style>"
			+ "</head>\n" + "<body footer='footer' size='A4'>\n",

	GetBalanceSheetContentHeadXML : function(subsidiaryname, time) {
		var xml = "<table id='tablecss' cellpadding='0'><tr><td id='title'>资产负债表</td></tr><tr><td align='center'>";
		xml += "<table id='header'>";
		xml += "<tr><td colspan='3' align='right'>会企01表</td></tr>";
		xml += "<tr>";
		xml += String.format("<td>编制单位：{0}</td>", subsidiaryname);
		xml += String.format("<td>{0}</td>", time);
		xml += "<td id='txtright'>单位：元</td>";
		xml += "</tr>";
		xml += "</table>";
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th id='col1'>资产</th>";
		xml += "<th id='col2'>行次</th>";
		xml += "<th id='col3'>年初数</th>";
		xml += "<th id='col4'>期末数</th>";
		xml += "<th id='col5'>负债与所有者权益<br />&nbsp;&nbsp;&nbsp;&nbsp;(或股东权益)</th>";
		xml += "<th id='col6'>行次</th>";
		xml += "<th id='col7'>年初数</th>";
		xml += "<th id='col8'>期末数</th>";
		xml += "</tr>";
		return xml;
	},

	GetBalanceSheetXML : function(bs, name) {
		// var bs = BalanceSheet();
		var xml = "<tr>";
		xml += "<th class='bgcolor'>流动资产：</th>";
		xml += "<td>&nbsp;</td> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<th class='bgcolor'>流动负债：</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>货币资金</th>";
		xml += "<th>1</th> ";
		xml += String.format("<td>{0}</td>", com.formatCurrency(bs.Cash));
		xml += String.format("<td>{0}</td>", com.formatCurrency(bs.CashEnd));
		xml += "<th>短期借款</th>";
		xml += "<th>1</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ShortTermLoans));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ShortTermLoansEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>短期投资</th>";
		xml += "<th>2</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.CurrentInvestment));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.CurrentInvestmentEnd));
		xml += "<th>应付票据</th>";
		xml += "<th>2</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NotesPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NotesPayableEnd));

		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>应收票据</th>";
		xml += "<th>3</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NotesReceivable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NotesReceivableEnd));
		xml += "<th>应付账款</th>";
		xml += "<th>3</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccountsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccountsPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>应收股利</th>";
		xml += "<th>4</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DividendReceivable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DividendReceivableEnd));
		xml += "<th>预收账款</th>";
		xml += "<th>4</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AdvancesFromCustomers));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AdvancesFromCustomersEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>应收利息</th>";
		xml += "<th>5</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.InterestReceivable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.InterestReceivableEnd));
		xml += "<th>应付工资</th>";
		xml += "<th>5</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccruedPayroll));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccruedPayrollEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>应收账款</th>";
		xml += "<th>6</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NetReceivable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NetReceivableEnd));
		xml += "<th>应付福利费</th>";
		xml += "<th>6</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.welfarePayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.welfarePayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>其他应收款</th>";
		xml += "<th>7</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherReceivables));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherReceivablesEnd));
		xml += "<th>应付利润（股利）</th>";
		xml += "<th>7</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DividendsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DividendsPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>预付账款</th>";
		xml += "<th>8</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccountsPrepaid));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccountsPrepaidEnd));
		xml += "<th>应交税金</th>";
		xml += "<th>8</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TaxesPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TaxesPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>应收补贴款</th>";
		xml += "<th>9</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SubsidyReceivable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SubsidyReceivableEnd));
		xml += "<th>应收补贴款</th>";
		xml += "<th>9</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherAccountsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherAccountsPayableEnd));

		xml += "</tr>";

		// joe add 应收补贴款
		xml += "<tr>";
		xml += "<th>存货</th>";
		xml += "<th>10</th> ";
		xml += String
				.format("<td>{0}</td>", com.formatCurrency(bs.Inventories));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.InventoriesEnd));
		xml += "<th>其他应付款</th>";
		xml += "<th>10</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCreditors));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCreditorsEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>待摊费用</th>";
		xml += "<th>11</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.UnamortizedExpense));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.UnamortizedExpenseEnd));
		xml += "<th>预提费用</th>";
		xml += "<th>11</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.accruedExpenses));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.accruedExpensesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>待处理流动资产净损失</th>";
		xml += "<th>12</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.UnsettledGLOnCurrentAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.UnsettledGLOnCurrentAssetsEnd));
		xml += "<th>预计负债</th>";
		xml += "<th>12</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccruedLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccruedLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>一年内到期的长期债权投资</th>";
		xml += "<th>13</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermDebtInvestmentDueWithinOneYear));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermDebtInvestmentDueWithinOneYearEnd));
		xml += "<th>一年内到期的长期负债</th>";
		xml += "<th>13</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.currentMaturitiesOfLongTermDebt));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.currentMaturitiesOfLongTermDebtEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>其他流动资产</th>";
		xml += "<th>14</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCurrentAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCurrentAssetsEnd));
		xml += "<th>其他流动负债</th>";
		xml += "<th>14</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCurrentLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCurrentLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>流动资产合计</th>";
		xml += "<th>15</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalCurrentAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalCurrentAssetsEnd));
		xml += "<th class='bgcolor'>流动负债合计</th>";
		xml += "<th>15</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalCurrentLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalCurrentLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>长期投资：</th>";
		xml += "<th>16</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<th class='bgcolor'>长期负债：</th>";
		xml += "<th>16</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>长期股权投资</th>";
		xml += "<th>17</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermEquityInvestment));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermEquityInvestmentEnd));
		xml += "<th>长期借款</th>";
		xml += "<th>17</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermLoansPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermLoansPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>长期债权投资</th>";
		xml += "<th>18</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermBondInvestment));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermBondInvestmentEnd));
		xml += "<th>应付债券</th>";
		xml += "<th>18</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.BondsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.BondsPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>合并价差</th>";
		xml += "<th>19</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.incorporatingPriceDifference));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.incorporatingPriceDifferenceEnd));
		xml += "<th>长期应付款</th>";
		xml += "<th>19</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermAccountsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermAccountsPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>长期投资合计</th>";
		xml += "<th>20</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLongTermInvestment));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLongTermInvestmentEnd));
		xml += "<th>专项应付款</th>";
		xml += "<th>20</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SpecialAccountsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SpecialAccountsPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>固定资产：</th>";
		xml += "<th>21</th> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<th>其他长期负债</th>";
		xml += "<th>21</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherLongTermDebt));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherLongTermDebtEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>固定资产原价</th>";
		xml += "<th>22</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.FixedAssetsOriginal));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.FixedAssetsOriginalEnd));
		xml += "<th class='bgcolor'>长期负债合计</th>";
		xml += "<th>22</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLongTermLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLongTermLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>    减:累计折旧</th>";
		xml += "<th>23</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.accumulatedDepreciation));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.accumulatedDepreciationEnd));
		xml += "<th class='bgcolor'>递延税项：</th>";
		xml += "<th>23</th> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>固定资产净值</th>";
		xml += "<th>24</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsNetValue));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsNetValueEnd));
		xml += "<th>递延税款贷项</th>";
		xml += "<th>24</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DeferredIncomeTaxLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DeferredIncomeTaxLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>减：固定资产减值准备</th>";
		xml += "<th>25</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsDepreciationReserve));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsDepreciationReserveEnd));
		xml += "<th class='bgcolor'>负债合计</th>";
		xml += "<th>25</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>固定资产净额</th>";
		xml += "<th>26</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsAmount));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsAmountEnd));
		xml += "<th class='bgcolor'>少数股东权益：</th>";
		xml += "<th>26</th> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th> 固定资产清理</th>";
		xml += "<th>27</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.FixedAssetsDiaposal));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.FixedAssetsDiaposalEnd));
		xml += "<th>少数股东权益</th>";
		xml += "<th>27</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.minorityEquity));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.minorityEquityEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>工程物资</th>";
		xml += "<th>28</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ProjectMaterial));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ProjectMaterialEnd));
		xml += "<th class='bgcolor'>所有者权益：</th>";
		xml += "<th>28</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>在建工程</th>";
		xml += "<th>29</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ConstructionInProgress));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ConstructionInProgressEnd));
		xml += "<th>实收资本（股本）</th>";
		xml += "<th>29</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SubscribedCapital));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SubscribedCapitalEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>待处理固定资产净损失</th>";
		xml += "<th>30</th>";
		xml += String.format("<td>{0}</td>", com.formatCurrency(bs.unsettled));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.unsettledEnd));
		xml += "<th></th>";
		xml += "<th>30</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>固定资产合计</th>";
		xml += "<th>31</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalFixedAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalFixedAssetsEnd));
		xml += "<th></th>";
		xml += "<th>31</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		// xml += "<tr>";
		// xml += "<th class='bgcolor'>负债合计</th>";
		// xml += "<th>32</th>";
		// xml += String.format("<td>{0}</td>", com
		// .formatCurrency(bs.TotalLongTermLiabilities));
		// xml += String.format("<td>{0}</td>", com
		// .formatCurrency(bs.TotalLongTermLiabilitiesEnd));
		// xml += "<th class='bgcolor'>所有者权益(或股东权益):</th>";
		// xml += "<th>32</th>";
		// xml += "<td></td>";
		// xml += "<td></td>";
		// xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>无形资产及其他资产：</th>";
		xml += "<th>32</th> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<th></th>";
		xml += "<th>32</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>无形资产</th>";
		xml += "<th>33</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.IntangibleAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.IntangibleAssetsEnd));
		xml += "<th>资本公积</th>";
		xml += "<th>33</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.CapitalSurplus));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.CapitalSurplusEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>长期待摊费用</th>";
		xml += "<th>34</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermUnamortizedExpenses));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermUnamortizedExpensesEnd));
		xml += "<th>盈余公积</th>";
		xml += "<th>34</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SurplusReserve));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SurplusReserveEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>其他长期资产</th>";
		xml += "<th>35</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherLongTermAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherLongTermAssetsEnd));
		xml += "<th>未确认的投资损失</th>";
		xml += "<th>35</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.unaffirmedInvestmentLoss));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.unaffirmedInvestmentLossEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>无形资产及其他资产合计</th>";
		xml += "<th>36</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalIntangibleAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalIntangibleAssetsEnd));
		xml += "<th>未分配利润</th>";
		xml += "<th>36</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.RetainedEarnings));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.RetainedEarningsEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>递延税项：</th>";
		xml += "<th>37</th> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<th>外币报表折算差额</th>";
		xml += "<th>37</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.translationReserve));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.translationReserveEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>递延税款借项</th>";
		xml += "<th>38</th> ";
		xml += "<td>0</td>";
		xml += "<td>0</td>";
		xml += "<th class='bgcolor'>所有者权益合计</th>";
		xml += "<th>38</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalShareholdersEquity));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalShareholdersEquityEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>资产合计</th>";
		xml += "<th>39</th>";
		xml += String
				.format("<td>{0}</td>", com.formatCurrency(bs.TotalAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalAssetsEnd));
		xml += "<th  class='bgcolor'>负债和所有者权益（或股东权益）总计</th>";
		xml += "<th>39</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalLiabilitiesEquity));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalLiabilitiesEquityEnd));
		xml += "</tr>";
		xml += String
				.format(
						"<tr><td colspan='8' style='border:0;color:black;'>制表人：{0}</td></tr>",
						name);

		return xml;
	},

	/**
	 * *****************************************Balance Sheet
	 * End*****************************************************
	 */
	/**
	 * *****************************************Sub Ledger
	 * Begin***********************************************
	 */
	/**
	 * Get Itemized Account css style
	 */
	GetSubLedgerXMLHead : "<?xml version='1.0' encoding='UTF-8'?>\n"
			+ "<!DOCTYPE pdf PUBLIC '-//big.faceless.org//report' 'report-1.1.dtd'>\n"
			+ "<pdf lang='zh-CN' xml:lang='zh-CN'>\n"
			+ "<head>"
			+ "<macrolist><macro id='footer'><p align='right'>Page <pagenumber/> of  <totalpages/></p></macro></macrolist>"
			+ "<style type='text/css'>" + "html{font:normal 8pt STSong;}"
			+ "body{width:100%;text-align:left;}"
			+ ".alltbl{page-break-after:always;}"
			+ "#tablecss {width:100%;height:100%}"
			+ "#content {width:523pt;font-size:10pt}"
			+ "#title{font-size:14pt;font-weight:bold;align:center}"
			+ "#header{align:center}" + "#txtright{align:right}"
			+ "#main{width:523pt;font-size:8pt;}"
			+ "#main th{font:10pt;border:0.2pt;valign:middle;padding:0px 2px;}"
			+ "#main td{align:right;border:0.2pt;color:blue;}"
			+ "#col1 {width:25pt;}"
			+ "#col2 {width:50pt; valign:middle;align:center;}"
			+ "#col3 {width:160pt;valign:middle;align:center;}"
			+ "#col4 {width:100pt;valign:middle;align:center;}"
			+ "#col5 {width:56pt;valign:middle;align:center;}"
			+ "#col6 {width:56pt;valign:middle;align:center;}"
			+ "#col7 {width:76pt;valign:middle;align:center;}"
			+ "#col8 {width:13pt;}" + "#col9 {width:63pt;}" + "</style>"
			+ "</head>\n" + "<body footer='footer' size='A4'>\n",

	/**
	 * get header
	 * 
	 * @param year
	 * @param account
	 * @returns {String}
	 */
	GetSubLedgerContentHeadXML : function(year, account, number, pages) {
		var xml = "<table id='tablecss' cellpadding='0' class='alltbl'><tr><td id='title'>明细账</td></tr><tr><td align='center'>";
		xml += "<table id='header'>";
		xml += String
				.format(
						"<tr><td>========================================</td></tr><tr><td align='center'>{0}</td></tr>",
						year);
		xml += "</table>";
		xml += String
				.format("<table id='content'><tr><td>科目：{0}</td>", account);
		xml += String.format(
				"<td id='txtright'>页号：{0} / {1}</td></tr></table>", number,
				pages);
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th colspan='2' id='col1'>日期</th>";
		xml += "<th rowspan='2' id='col2'>凭证号</th>";
		xml += "<th rowspan='2' id='col3'>摘要</th>";
		xml += "<th rowspan='2' id='col4'>对应科目</th>";
		xml += "<th rowspan='2' id='col5'>借方</th>";
		xml += "<th rowspan='2' id='col6'>贷方</th>";
		xml += "<th rowspan='2' colspan='2' id='col7'>余额</th>";
		xml += "</tr>";
		xml += "<tr><th>月</th><th>日</th></tr>";
		return xml;
	},

	/**
	 * Get Content line by line
	 * 
	 * @param month
	 * @param day
	 * @param number
	 * @param memo
	 * @param account
	 * @param credit
	 * @param debit
	 * @param balance
	 * @returns
	 */
	GetSubLedgerAccountXML : function(month, day, number, memo, account, debit,
			credit, balance) {
		var xml = String
				.format(
						"<tr><th>{0}</th><th>{1}</th><th>{2}</th><th>{3}</th><th>{4}</th><td>{5}</td><td>{6}</td><th>借</th><td>{7}</td></tr>",
						month, day, number, memo, account, debit, credit,
						balance);
		return xml;
	},

	/**
	 * Get total balance by month or year
	 * 
	 * @param month
	 * @param name
	 * @param total
	 * @param balance
	 * @returns {String}
	 */
	GetTotalBalanceXML : function(month, name, totalcredit, totaldebit, balance) {
		var xml = "<tr>";
		xml += String.format("<td>{0}</td>", month);
		xml += "<td></td>";
		xml += "<td></td>";
		xml += String.format("<td>{0}</td>", name);
		xml += "<td></td>";
		xml += String.format("<td>{0}</td>", totalcredit);
		xml += String.format("<td>{0}</td>", totaldebit);
		xml += "<th id='col8'>借</th>";
		xml += String.format("<td id='col9'>{0}</td>", balance);
		xml += "</tr>";
		return xml;
	},

	/**
	 * *****************************************Sub Ledger
	 * End************************************************
	 */
	/**
	 * ***************************************** General Ledger
	 * Begin*****************************************
	 */

	/**
	 * form header
	 */
	GetLedgerXMLHead : "<?xml version='1.0' encoding='UTF-8'?>\n"
			+ "<!DOCTYPE pdf PUBLIC '-//big.faceless.org//report' 'report-1.1.dtd'>\n"
			+ "<pdf lang='zh-CN' xml:lang='zh-CN'>\n"
			+ "<head>"
			+ "<macrolist><macro id='footer'><p align='right'>Page <pagenumber/> of  <totalpages/></p></macro></macrolist>"
			+ "<style type='text/css'>" + "html{font:normal 8pt STSong;}"
			+ "body{width:100%;text-align:left;}"
			+ ".alltbl{page-break-after:always;}"
			+ ".tablecss {width:100%;height:100%;}"
			+ "#content {width:523pt;font-size:10pt}"
			+ "#title{font-size:14pt;font-weight:bold;align:center}"
			+ "#header{align:center}" + "#txtright{align:right}"
			+ "#main{width:523pt;font-size:8pt;}"
			+ "#main th{align:center;font:10pt;border:0.2pt}"
			+ "#main td{align:right;border:0.2pt;color:blue;}"
			+ "#col1 {width:40pt;valign:middle;align:center;}"
			+ "#col2 {width:163pt;valign:middle;align:center;}"
			+ "#col3 {width:100pt;valign:middle;align:center;}"
			+ "#col4 {width:100pt;valign:middle;align:center;}"
			+ "#col5 {width:110pt;valign:middle;align:center;}"
			+ "#col6 {width:20pt;valign:middle;align:center;}"
			+ "#col7 {width:100pt;valign:middle;align:center;}" + "</style>"
			+ "</head>\n" + "<body footer='footer' size='A4'>\n",

	/**
	 * table header
	 * 
	 * @param yearmonth
	 * @param account
	 */
	GetLedgerContentXMLHead : function(yearmonth, account) {
		var xml = "<table class='tablecss alltbl' cellpadding='0'><tr><td id='title'>总分类账</td></tr><tr><td align='center'>";
		xml += "<table id='header'>";
		xml += String
				.format(
						"<tr><td>========================================</td></tr><tr><td align='center'>{0}</td></tr>",
						yearmonth);
		xml += "</table>";
		xml += String
				.format(
						"<table id='content'><tr><td>科目：{0}</td><td id='txtright'>页号：1 / 1</td></tr></table>",
						account);
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th colspan='2' id='col1'>日期</th>";
		xml += "<th rowspan='2' id='col2'>摘要</th>";
		xml += "<th rowspan='2' id='col3'>借方</th>";
		xml += "<th rowspan='2' id='col4'>贷方</th>";
		xml += "<th rowspan='2' colspan='2' id='col5'>余额</th>";
		xml += "</tr>";
		xml += "<tr><th>月</th><th>日</th></tr>";
		return xml;
	},

	/**
	 * Get table Content
	 * 
	 * @param month
	 * @param day
	 * @param name
	 *            本月合计，本年合计
	 * @param credit
	 * @param debit
	 * @param type
	 *            借，贷，平
	 * @param balance
	 * @returns {String}
	 */
	GetLedgerXML : function(month, day, name, credit, debit, type, balance) {
		var xml = "<tr>";
		xml += String.format("<th>{0}</th>", month);
		xml += String.format("<th>{0}</th>", day);
		xml += String.format("<th>{0}</th>", name);
		xml += String.format("<td>{0}</td>", debit);
		xml += String.format("<td>{0}</td>", credit);
		xml += String.format("<th>{0}</th>", type);
		xml += String.format("<td>{0}</td>", balance);
		xml += "</tr>";
		return xml;
	},

	/**
	 * 期初余额
	 * 
	 * @param type
	 *            ==借,贷,平
	 * @param balance
	 * @returns {String}
	 */
	GetOpeningBalanceByYearXML : function(type, balance) {
		var xml = "<tr><td></td>";
		xml += "<td></td>";
		xml += "<td>年初余额</td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += String.format("<th id='col6'>{0}</th>", type);
		xml += String.format("<td id='col7'>{0}</td>", balance);
		xml += "</tr>";
		return xml;
	},
	GetEndBalanceByYearXML : function(type, balance) {
		var xml = "<tr><td></td>";
		xml += "<td></td>";
		xml += "<td>年末余额</td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += String.format("<th id='col6'>{0}</th>", type);
		xml += String.format("<td id='col7'>{0}</td>", balance);
		xml += "</tr>";
		return xml;
	},

	/**
	 * *****************************************General Ledger
	 * End************************************************
	 */
	/**
	 * *****************************************Diary Ledger
	 * Begin*************************************************
	 */

	/**
	 * head and css style
	 */
	GetDiaryLedgerXMLHead : "<?xml version='1.0' encoding='UTF-8'?>\n"
			+ "<!DOCTYPE pdf PUBLIC '-//big.faceless.org//report' 'report-1.1.dtd'>\n"
			+ "<pdf lang='zh-CN' xml:lang='zh-CN'>\n"
			+ "<head>"
			+ "<macrolist><macro id='footer'><p align='right'>Page <pagenumber/> of  <totalpages/></p></macro></macrolist>"
			+ "<style type='text/css'>" + "html{font:normal 8pt STSong;}"
			+ "body{width:100%;text-align:left;}"
			+ ".alltbl{page-break-after:always;}"
			+ "#tablecss {width:100%;height:100%;}"
			+ "#content {width:523pt;font-size:10pt}"
			+ "#title{font-size:14pt;font-weight:bold;align:center}"
			+ "#header{align:center}" + "#txtright{align:right}"
			+ "#main{width:523pt;font-size:8pt;}"
			+ "#main th{font:10pt;border:0.2pt;padding:0px 2px;}"
			+ "#main td{align:right;border:0.2pt;color:blue;}"
			+ "#col1 {width:25pt;}"
			+ "#col2 {width:45pt; valign:middle;align:center;}"
			+ "#col3 {width:160pt;valign:middle;align:center;}"
			+ "#col4 {width:100pt;valign:middle;align:center;}"
			+ "#col5 {width:60pt;valign:middle;align:center;}"
			+ "#col6 {width:60pt;valign:middle;align:center;}"
			+ "#col7 {width:73pt;valign:middle;align:center;}"
			+ "#col8 {width:13pt}" + "#col9 {width:60pt}" + "</style>"
			+ "</head>\n" + "<body footer='footer' size='A4'>\n",

	/**
	 * table head and column name
	 */
	GetDiaryLedgerContentHeadXML : function(year, account) {
		var xml = "<table id='tablecss' cellpadding='0' class='alltbl'><tr><td id='title'>日 记 账</td></tr><tr><td align='center'>";
		xml += "<table id='header'>";
		xml += String
				.format(
						"<tr><td>========================================</td></tr><tr><td align='center'>{0}</td></tr>",
						year);
		xml += "</table>";
		xml += String
				.format(
						"<table id='content'><tr><td>科目：{0}</td><td id='txtright'>页号：<pagenumber/> / <totalpages/></td></tr></table>",
						account);
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th colspan='2' id='col1'>日期</th>";
		xml += "<th rowspan='2' id='col2'>凭证号</th>";
		xml += "<th rowspan='2' id='col3'>摘要</th>";
		xml += "<th rowspan='2' id='col4'>对应科目</th>";
		xml += "<th rowspan='2' id='col5'>借方</th>";
		xml += "<th rowspan='2' id='col6'>贷方</th>";
		xml += "<th rowspan='2' colspan='2' id='col7'>余额</th>";
		xml += "</tr>";
		xml += "<tr><th>月</th><th>日</th></tr>";
		return xml;
	},

	/**
	 * 期初余额
	 * 
	 * @param type
	 *            ==借,贷,平
	 * @param balance
	 * @returns {String}
	 */
	GetOpeningBalanceXML : function(type, balance) {
		var xml = "<tr><td></td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<td>期初余额</td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += String.format("<th  id='col8'>{0}</th>", type);
		xml += String.format("<td  id='col9'>{0}</td>", balance);
		xml += "</tr>";
		return xml;
	},

	/**
	 * 当日余额
	 * 
	 * @param money
	 * @returns {String}
	 */
	GetBalanceOfDayXML : function(credit, debit, balance) {
		var xml = "<tr><td></td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<td>当日余额</td>";
		xml += "<td></td>";
		xml += String.format("<td>{0}</td>", credit);
		xml += String.format("<td>{0}</td>", debit);
		xml += "<th>借</th>";
		xml += String.format("<td>{0}</td>", balance);
		xml += "</tr>";
		return xml;
	},

	/**
	 * Journal Report Content
	 */
	GetDiaryLedgerXML : function(month, day, number, memo, account, debit,
			credit, balance) {
		var xml = String
				.format(
						"<tr><th>{0}</th><th>{1}</th><th>{2}</th><th>{3}</th><th>{4}</th><td>{5}</td><td>{6}</td><th>借</th><td>{7}</td></tr>",
						month, day, number, memo, account, debit, credit,
						balance);
		return xml;
	},

	/**
	 * *****************************************Diray Ledger
	 * End*********************************************************
	 */
	/**
	 * *****************************************Trial Balance
	 * Begin*******************************************
	 */

	GetTrialBalanceXMLHead : "<?xml version='1.0' encoding='UTF-8'?>\n"
			+ "<!DOCTYPE pdf PUBLIC '-//big.faceless.org//report' 'report-1.1.dtd'>\n"
			+ "<pdf lang='zh-CN' xml:lang='zh-CN'>\n"
			+ "<head>"
			+ "<macrolist><macro id='footer'><p align='right'>Page <pagenumber/> of  <totalpages/></p></macro></macrolist>"
			+ "<style type='text/css'>"
			+ "html{font:normal 8pt STSong;}"
			+ "body{width:100%;text-align:left;}"
			+ ".alltbl{page-break-after:always;}"
			+ "#tablecss {width:100%;height:100%;}"
			+ "#content {width:523pt;font-size:10pt}"
			+ "#title{font-size:14pt;font-weight:bold;align:center}"
			+ "#header{align:center}"
			+ "#txtright{align:right}"
			+ "#main{width:523pt;font-size:8pt;}"
			+ "#main th{font:10pt;border:0.2pt;valign:middle;padding-left:5px;}"
			+ "#main td{align:right;border:0.2pt;color:blue;}"
			+ "#col1 {width:118pt;valign:middle;align:center;}"
			+ "#col2 {width:135pt;align:center;}"
			+ "#col3 {width:135pt;align:center;}"
			+ "#col4 {width:135pt;align:center;}" + "</style>" + "</head>\n"
			+ "<body footer='footer' size='A4'>\n",

	GetTrialBalanceContentHeadXML : function(date, number) {
		var xml = "<table width='100%' class='alltbl'><tr><td align='center'>";
		xml += "<table id='tablecss' cellpadding='0'><tr><td id='title'>试算平衡表</td></tr><tr><td align='center'>";
		xml += "<table id='header'>";
		xml += String.format("<tr><td align='center'>{0}</td></tr>", date);
		xml += "</table>";
		xml += String
				.format(
						"<table id='content'><tr><td id='txtright'>页号：{0} / <totalpages/></td></tr></table>",
						number);
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th rowspan='2' id='col1'>科 目</th>";
		xml += "<th colspan='2' id='col2'>期初余额</th>";
		xml += "<th colspan='2' id='col3'>本期发生</th>";
		xml += "<th colspan='2' id='col4'>期末余额</th>";
		xml += "</tr>";
		xml += "<tr>";
		xml += "<th>借方</th><th>贷方</th>";
		xml += "<th>借方</th><th>贷方</th>";
		xml += "<th>借方</th><th>贷方</th>";
		xml += "</tr>";
		return xml;
	},

	/**
	 * Summary ledger content
	 */
	GetTrialBalanceXML : function(summary) {
		var xml = "<tr>";
		xml += String.format("<th>{0}</th>", summary.name);
		xml += String.format("<td>{0}</td>", summary.beginDebit);
		xml += String.format("<td>{0}</td>", summary.beginCredit);
		xml += String.format("<td>{0}</td>", summary.currentDebit);
		xml += String.format("<td>{0}</td>", summary.currentCredit);
		xml += String.format("<td>{0}</td>", summary.endDebit);
		xml += String.format("<td>{0}</td>", summary.endCredit);
		xml += "</tr>";
		return xml;
	},

	GetTrialBalanceXMLFoot : "</table></td></tr>",

	/**
	 * *****************************************Trial Balance
	 * End*************************************************
	 */
	/**
	 * *****************************************Voucher
	 * Begin*********************************************************
	 */

	/**
	 * Create voucher header
	 */
	GetVoucherXMLHead : "<?xml version='1.0' encoding='UTF-8'?>\n"
			+ "<!DOCTYPE pdf PUBLIC '-//big.faceless.org//report' 'report-1.1.dtd'>\n"
			+ "<pdf lang='zh-CN' xml:lang='zh-CN'>\n"
			+ "<head>"
			+ "<macrolist><macro id='footer'><p align='right'>Page <pagenumber/> of&nbsp;&nbsp;<totalpages/></p></macro></macrolist>"
			+ "<style type='text/css'>"
			+ "html{font:normal 8pt STSong;}"
			+ "body{width:100%;text-align:left;}"
			+ ".alltbl{page-break-after:always;}"
			+ "#tablecss {width:100%;height:100%}"
			+ "#title th{font-size:12pt;font-weight:bold;align:center}"
			+ "#header{align:center}"
			+ "#txtright{align:right}"
			+ "#title td{align:center;}"
			+ "#number{width:521pt;font-size:8pt;}"
			+ "#main{width:523pt;font-size:8pt;}"
			+ "#main th{font-size:8pt;border:0.2pt;valign:middle;padding:0px 2px;}"
			+ "#main td{align:right;border:0.2pt;color:blue;}"
			+ "#col1 {width:138pt;valign:middle;align:center;}"
			+ "#col2 {width:170pt;valign:middle;align:center;}"
			+ "#col3 {width:50pt;valign:middle;align:center;}"
			+ "#col4 {width:25pt;valign:middle;align:center;}"
			+ "#col5 {width:70pt;valign:middle;align:center;}"
			+ "#col6 {width:70pt;valign:middle;align:center;}"
			+ "#col7 {width:80pt;valign:middle;align:center;}"
			+ "#col8 {width:90pt;valign:middle;align:center;}"
			+ "#foot{width:523pt;margin-top:8pt;}#foot td{width:120pt;font-size:10pt;}"
			+ "</style>" + "</head>\n" + "<body footer='footer' size='A4'>\n",

	/**
	 * 
	 * header
	 */
	GetVoucherContentHeadXML : function(date, number, type, voucherdate,
			currency, glNumber, serialNumber) {
		var xml = "<table width='100%' class='alltbl'><tr><td align='center'>";
		xml += "<table width='523pt' id='title'><tr><th>记 账 凭 证</th></tr><tr><td>=================</td></tr>";
		xml += String.format("<tr><td>{0}</td></tr></table>", date);
		xml += "<table id='number'><tr>";
		xml += String.format("<td>交易类型: {0}</td>", type);
		xml += String.format("<td>交易日期: {0}</td>", voucherdate);
		xml += String.format("<td>币种: {0}</td>", currency);
		xml += String
				.format(
						"<td align='right'>编号：{0}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;记账编号：{1}</td>",
						number, serialNumber);
		xml += "</tr></table>";
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th rowspan='2' id='col1'>摘要</th>";
		xml += "<th colspan='2' id='col2'>会计科目</th>";
		xml += "<th rowspan='2' id='col3'>外币金额</th>";
		xml += "<th rowspan='2' id='col4'>汇率</th>";
		xml += "<th rowspan='2' id='col5'>借方</th>";
		xml += "<th rowspan='2' id='col6'>贷方</th>";
		xml += "</tr>";
		xml += "<tr>";
		xml += "<th id='col7'>一级科目</th>";
		xml += "<th id='col8'>明细科目</th>";
		xml += "</tr>";
		return xml;
	},

	/**
	 * Create accounting voucher XML file
	 * 
	 * @param table
	 * @param temp
	 * @returns {String}
	 */
	GetVoucherXML : function(memo, levelonename, detailname, foreign, rate,
			credit, debit) {
		var xml = String
				.format(
						"<tr><th>{0}</th><th>{1}</th><th>{2}</th><td>{3}</td><td>{4}</td><td>{5}</td><td>{6}</td></tr>",
						memo, levelonename, detailname, foreign, rate, credit,
						debit);
		return xml;
	},

	/**
	 * Create voucher footer
	 */
	GetVoucherXMLFoot : function(createby) {
		var xml = "</table>";
		xml += String
				.format(
						"<table id='foot'><tr><td>会计主管</td><td>复核</td><td>制单: {0}</td></tr></table>",
						createby);
		xml += "</td></tr></table>";
		return xml;
	},

	GetVoucherXMLTotal : function(totalcredit, totaldebit) {
		var xml = String
				.format(
						"<tr><td>合计</td><td>&nbsp;</td><td>&nbsp;</td><td></td><td></td><td>{0}</td><td>{1}</td></tr>",
						totalcredit, totaldebit);
		return xml;
	},

	AddVoucherBlankLines : function(searchid) {
		var temp = "";
		if (searchid < 7) {
			var str = "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td></td><td></td><td>&nbsp;</td></tr>";
			for (var i = 0; i < 7 - searchid; i++) {
				temp += str;
			}
		}
		return temp;
	},
	/**
	 * *****************************************Voucher
	 * End*********************************************************
	 */

	/**
	 * if the records is null by the search result. then return the message
	 * 
	 * @returns {String}
	 */
	GetNoneRecordsXML : "<html><body style='width:100%;text-align:center'><div style='margin:0 auto;width:500px;'>"
			+ "None Records [该查询条件下无数据可用]</div></body></html>",

	GetLimitOfNumberXML : function(number) {
		var xml = String
				.format(
						"<html><body style='width:100%;text-align:center'><div style='margin:0 auto;width:500px;'>"
								+ "<table><tr>"
								+ "<td>Total {0} records what you selected had over max 8000 records in your date ranges. "
								+ "please reselect your date range and search it again.</td></tr>"
								+ "<tr><td>你所选择的日期范围内，一共有{0}条记录，已超过允许的最大8000条记录数, 请缩小日期范围后重新生成."
								+ "</td></tr></table></div></body></html>",
						number);
		return xml;
	},

	/**
	 * footer
	 * 
	 * @returns {String}
	 */
	GetFooterXML : "</table></td></tr></table>",

	/**
	 * Closing tag
	 * 
	 * @returns {String}
	 */
	GetPDFClosingTagXML : "</body>\n</pdf>"

};
// format string
String.format = function() {
	var args = arguments;
	return args[0].replace(/\{(\d+)\}/g, function(m, i) {
		return args[i * 1 + 1];
	});
};