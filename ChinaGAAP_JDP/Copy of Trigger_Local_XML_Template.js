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
		xml += "<p id='header'>�����</p>";
		xml += "<table id='content'>";
		xml += "<tr><td  colspan='3' align='right'>����02��</td></tr>";
		xml += String
				.format(
						"<tr><td>���Ƶ�λ��{0}</td><td>{1}</td><td align='right'>��λ��Ԫ</td></tr>",
						subsidiaryname, peroidtime);
		xml += "</table>";
		return xml;
	},

	/**
	 * 2014���׼����ʽ
	 */
	GetProfitXML : function(profit, name) {
		var xml = "<table id='main'>";
		xml += "<tr id='title'><th id='col1'>��Ŀ</th><th id='col2'>����</th><th id='col3'>������</th><th id='col4'>�����ۼ���</th></tr>";
		xml += String
				.format(
						"<tr><th class='bgcolor'>һ��Ӫҵ����</th><th>1</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthallincome), com
								.formatCurrency(profit.allincome));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;����Ӫҵ�ɱ�</th><th>2</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthoperatingcost), com
								.formatCurrency(profit.operatingcost));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ӫҵ˰�𼰸���</th><th>3</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthmaintax), com
								.formatCurrency(profit.maintax));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ӫҵ����</th><th>4</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthsellcost), com
								.formatCurrency(profit.sellcost));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;�������</th><th>5</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthmanagercost), com
								.formatCurrency(profit.managercost));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;�������</th><th>6</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthfinancialcost), com
								.formatCurrency(profit.financialcost));
		// xml +=
		// String.format("<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;�ʲ���ֵ��ʧ</th><th>7</th><td>{0}</td><td>{1}</td></tr>",com.formatCurrency(profit.monthassetsimpairmentloss),
		// com.formatCurrency(profit.assetsimpairmentloss));
		// xml += String.format("<tr><th>&nbsp;&nbsp;�ӣ� ���ʼ�ֵ�䶯����
		// ����ʧ�ԡ�-������ʾ��</th><th>8</th><td>{0}</td><td>{1}</td></tr>",com.formatCurrency(profit.monthgainsonthechanges),
		// com.formatCurrency(profit.gainsonthechanges));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ͷ�����棨��ʧ�ԡ����������У�</th><th>7</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthinvestmentincome), com
								.formatCurrency(profit.investmentincome));

		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;�������루��ʧ�ԡ����������У�</th><th>8</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthsubsidyincome), com
								.formatCurrency(profit.subsidyincome));

		xml += "<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;���У�����Ӫ��ҵ�ͺ�Ӫ��ҵ��Ͷ������</th><th>9</th><td>0.00</td><td>0.00</td></tr>";
		xml += String
				.format(
						"<tr><th class='bgcolor'>����Ӫҵ���󣨿����ԡ����������У�</th><th>10</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthoperatingprofit), com
								.formatCurrency(profit.operatingprofit));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;�ӣ�Ӫҵ������</th><th>11</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthoutsideincome), com
								.formatCurrency(profit.outsideincome));
		xml += "<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;���У��������ʲ���������</th><th>12</th><td>0.00</td><td>0.00</td></tr>";
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;����Ӫҵ��֧��</th><th>13</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthoutsidecost), com
								.formatCurrency(profit.outsidecost));
		xml += "<tr><th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;���У��������ʲ�������ʧ</th><th>14</th><td>0.00</td><td>0.00</td></tr>"; // 15
		// end
		xml += String
				.format(
						"<tr><th class='bgcolor'>���������ܶ�����ԡ����������У�</th><th>15</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthtotalprofit), com
								.formatCurrency(profit.totalprofit));
		xml += String
				.format(
						"<tr><th>&nbsp;&nbsp;��������˰����</th><th>16</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthtax), com
								.formatCurrency(profit.tax));
		xml += String
				.format(
						"<tr><th class='bgcolor'>�ġ������󣨿����ԡ����������У�</th><th>17</th><td>{0}</td><td>{1}</td></tr>",
						com.formatCurrency(profit.monthnetprofit), com
								.formatCurrency(profit.netprofit));
		xml += "<tr><th class='bgcolor'>�塢ÿ������</th><th>18</th><td>0.00</td><td>0.00</td></tr>";
		xml += "<tr><th>&nbsp;&nbsp;��һ������ÿ������</th><th>19</th><td>0.00</td><td>0.00</td></tr>";
		xml += "<tr><th>&nbsp;&nbsp;������ϡ��ÿ������</th><th>20</th><td>0.00</td><td>0.00</td></tr>";

		xml += String
				.format(
						"<tr><td colspan='4' style='border:0;color:black;'>�Ʊ��ˣ�{0}</td></tr>",
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
		var xml = "<table id='tablecss' cellpadding='0'><tr><td id='title'>�ʲ���ծ��</td></tr><tr><td align='center'>";
		xml += "<table id='header'>";
		xml += "<tr><td colspan='3' align='right'>����01��</td></tr>";
		xml += "<tr>";
		xml += String.format("<td>���Ƶ�λ��{0}</td>", subsidiaryname);
		xml += String.format("<td>{0}</td>", time);
		xml += "<td id='txtright'>��λ��Ԫ</td>";
		xml += "</tr>";
		xml += "</table>";
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th id='col1'>�ʲ�</th>";
		xml += "<th id='col2'>�д�</th>";
		xml += "<th id='col3'>�����</th>";
		xml += "<th id='col4'>��ĩ��</th>";
		xml += "<th id='col5'>��ծ��������Ȩ��<br />&nbsp;&nbsp;&nbsp;&nbsp;(��ɶ�Ȩ��)</th>";
		xml += "<th id='col6'>�д�</th>";
		xml += "<th id='col7'>�����</th>";
		xml += "<th id='col8'>��ĩ��</th>";
		xml += "</tr>";
		return xml;
	},

	GetBalanceSheetXML : function(bs, name) {
		// var bs = BalanceSheet();
		var xml = "<tr>";
		xml += "<th class='bgcolor'>�����ʲ���</th>";
		xml += "<td>&nbsp;</td> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<th class='bgcolor'>������ծ��</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>�����ʽ�</th>";
		xml += "<th>1</th> ";
		xml += String.format("<td>{0}</td>", com.formatCurrency(bs.Cash));
		xml += String.format("<td>{0}</td>", com.formatCurrency(bs.CashEnd));
		xml += "<th>���ڽ��</th>";
		xml += "<th>1</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ShortTermLoans));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ShortTermLoansEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>����Ͷ��</th>";
		xml += "<th>2</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.CurrentInvestment));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.CurrentInvestmentEnd));
		xml += "<th>Ӧ��Ʊ��</th>";
		xml += "<th>2</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NotesPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NotesPayableEnd));

		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>Ӧ��Ʊ��</th>";
		xml += "<th>3</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NotesReceivable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NotesReceivableEnd));
		xml += "<th>Ӧ���˿�</th>";
		xml += "<th>3</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccountsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccountsPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>Ӧ�չ���</th>";
		xml += "<th>4</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DividendReceivable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DividendReceivableEnd));
		xml += "<th>Ԥ���˿�</th>";
		xml += "<th>4</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AdvancesFromCustomers));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AdvancesFromCustomersEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>Ӧ����Ϣ</th>";
		xml += "<th>5</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.InterestReceivable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.InterestReceivableEnd));
		xml += "<th>Ӧ������</th>";
		xml += "<th>5</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccruedPayroll));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccruedPayrollEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>Ӧ���˿�</th>";
		xml += "<th>6</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NetReceivable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.NetReceivableEnd));
		xml += "<th>Ӧ��������</th>";
		xml += "<th>6</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.welfarePayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.welfarePayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>����Ӧ�տ�</th>";
		xml += "<th>7</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherReceivables));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherReceivablesEnd));
		xml += "<th>Ӧ�����󣨹�����</th>";
		xml += "<th>7</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DividendsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DividendsPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>Ԥ���˿�</th>";
		xml += "<th>8</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccountsPrepaid));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccountsPrepaidEnd));
		xml += "<th>Ӧ��˰��</th>";
		xml += "<th>8</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TaxesPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TaxesPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>Ӧ�ղ�����</th>";
		xml += "<th>9</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SubsidyReceivable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SubsidyReceivableEnd));
		xml += "<th>Ӧ�ղ�����</th>";
		xml += "<th>9</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherAccountsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherAccountsPayableEnd));

		xml += "</tr>";

		// joe add Ӧ�ղ�����
		xml += "<tr>";
		xml += "<th>���</th>";
		xml += "<th>10</th> ";
		xml += String
				.format("<td>{0}</td>", com.formatCurrency(bs.Inventories));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.InventoriesEnd));
		xml += "<th>����Ӧ����</th>";
		xml += "<th>10</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCreditors));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCreditorsEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>��̯����</th>";
		xml += "<th>11</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.UnamortizedExpense));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.UnamortizedExpenseEnd));
		xml += "<th>Ԥ�����</th>";
		xml += "<th>11</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.accruedExpenses));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.accruedExpensesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>�����������ʲ�����ʧ</th>";
		xml += "<th>12</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.UnsettledGLOnCurrentAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.UnsettledGLOnCurrentAssetsEnd));
		xml += "<th>Ԥ�Ƹ�ծ</th>";
		xml += "<th>12</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccruedLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.AccruedLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>һ���ڵ��ڵĳ���ծȨͶ��</th>";
		xml += "<th>13</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermDebtInvestmentDueWithinOneYear));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermDebtInvestmentDueWithinOneYearEnd));
		xml += "<th>һ���ڵ��ڵĳ��ڸ�ծ</th>";
		xml += "<th>13</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.currentMaturitiesOfLongTermDebt));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.currentMaturitiesOfLongTermDebtEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>���������ʲ�</th>";
		xml += "<th>14</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCurrentAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCurrentAssetsEnd));
		xml += "<th>����������ծ</th>";
		xml += "<th>14</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCurrentLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.OtherCurrentLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>�����ʲ��ϼ�</th>";
		xml += "<th>15</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalCurrentAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalCurrentAssetsEnd));
		xml += "<th class='bgcolor'>������ծ�ϼ�</th>";
		xml += "<th>15</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalCurrentLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalCurrentLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>����Ͷ�ʣ�</th>";
		xml += "<th>16</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<th class='bgcolor'>���ڸ�ծ��</th>";
		xml += "<th>16</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>���ڹ�ȨͶ��</th>";
		xml += "<th>17</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermEquityInvestment));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermEquityInvestmentEnd));
		xml += "<th>���ڽ��</th>";
		xml += "<th>17</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermLoansPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermLoansPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>����ծȨͶ��</th>";
		xml += "<th>18</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermBondInvestment));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermBondInvestmentEnd));
		xml += "<th>Ӧ��ծȯ</th>";
		xml += "<th>18</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.BondsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.BondsPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>�ϲ��۲�</th>";
		xml += "<th>19</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.incorporatingPriceDifference));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.incorporatingPriceDifferenceEnd));
		xml += "<th>����Ӧ����</th>";
		xml += "<th>19</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermAccountsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.longTermAccountsPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>����Ͷ�ʺϼ�</th>";
		xml += "<th>20</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLongTermInvestment));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLongTermInvestmentEnd));
		xml += "<th>ר��Ӧ����</th>";
		xml += "<th>20</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SpecialAccountsPayable));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SpecialAccountsPayableEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>�̶��ʲ���</th>";
		xml += "<th>21</th> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<th>�������ڸ�ծ</th>";
		xml += "<th>21</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherLongTermDebt));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherLongTermDebtEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>�̶��ʲ�ԭ��</th>";
		xml += "<th>22</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.FixedAssetsOriginal));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.FixedAssetsOriginalEnd));
		xml += "<th class='bgcolor'>���ڸ�ծ�ϼ�</th>";
		xml += "<th>22</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLongTermLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLongTermLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>    ��:�ۼ��۾�</th>";
		xml += "<th>23</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.accumulatedDepreciation));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.accumulatedDepreciationEnd));
		xml += "<th class='bgcolor'>����˰�</th>";
		xml += "<th>23</th> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>�̶��ʲ���ֵ</th>";
		xml += "<th>24</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsNetValue));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsNetValueEnd));
		xml += "<th>����˰�����</th>";
		xml += "<th>24</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DeferredIncomeTaxLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.DeferredIncomeTaxLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>�����̶��ʲ���ֵ׼��</th>";
		xml += "<th>25</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsDepreciationReserve));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsDepreciationReserveEnd));
		xml += "<th class='bgcolor'>��ծ�ϼ�</th>";
		xml += "<th>25</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLiabilities));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalLiabilitiesEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>�̶��ʲ�����</th>";
		xml += "<th>26</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsAmount));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.fixedAssetsAmountEnd));
		xml += "<th class='bgcolor'>�����ɶ�Ȩ�棺</th>";
		xml += "<th>26</th> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th> �̶��ʲ�����</th>";
		xml += "<th>27</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.FixedAssetsDiaposal));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.FixedAssetsDiaposalEnd));
		xml += "<th>�����ɶ�Ȩ��</th>";
		xml += "<th>27</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.minorityEquity));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.minorityEquityEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>��������</th>";
		xml += "<th>28</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ProjectMaterial));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ProjectMaterialEnd));
		xml += "<th class='bgcolor'>������Ȩ�棺</th>";
		xml += "<th>28</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>�ڽ�����</th>";
		xml += "<th>29</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ConstructionInProgress));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.ConstructionInProgressEnd));
		xml += "<th>ʵ���ʱ����ɱ���</th>";
		xml += "<th>29</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SubscribedCapital));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SubscribedCapitalEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>������̶��ʲ�����ʧ</th>";
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
		xml += "<th class='bgcolor'>�̶��ʲ��ϼ�</th>";
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
		// xml += "<th class='bgcolor'>��ծ�ϼ�</th>";
		// xml += "<th>32</th>";
		// xml += String.format("<td>{0}</td>", com
		// .formatCurrency(bs.TotalLongTermLiabilities));
		// xml += String.format("<td>{0}</td>", com
		// .formatCurrency(bs.TotalLongTermLiabilitiesEnd));
		// xml += "<th class='bgcolor'>������Ȩ��(��ɶ�Ȩ��):</th>";
		// xml += "<th>32</th>";
		// xml += "<td></td>";
		// xml += "<td></td>";
		// xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>�����ʲ��������ʲ���</th>";
		xml += "<th>32</th> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<th></th>";
		xml += "<th>32</th>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>�����ʲ�</th>";
		xml += "<th>33</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.IntangibleAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.IntangibleAssetsEnd));
		xml += "<th>�ʱ�����</th>";
		xml += "<th>33</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.CapitalSurplus));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.CapitalSurplusEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>���ڴ�̯����</th>";
		xml += "<th>34</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermUnamortizedExpenses));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.LongTermUnamortizedExpensesEnd));
		xml += "<th>ӯ�๫��</th>";
		xml += "<th>34</th>";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SurplusReserve));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.SurplusReserveEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>���������ʲ�</th>";
		xml += "<th>35</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherLongTermAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.otherLongTermAssetsEnd));
		xml += "<th>δȷ�ϵ�Ͷ����ʧ</th>";
		xml += "<th>35</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.unaffirmedInvestmentLoss));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.unaffirmedInvestmentLossEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>�����ʲ��������ʲ��ϼ�</th>";
		xml += "<th>36</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalIntangibleAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.totalIntangibleAssetsEnd));
		xml += "<th>δ��������</th>";
		xml += "<th>36</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.RetainedEarnings));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.RetainedEarningsEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>����˰�</th>";
		xml += "<th>37</th> ";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<th>��ұ���������</th>";
		xml += "<th>37</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.translationReserve));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.translationReserveEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th>����˰�����</th>";
		xml += "<th>38</th> ";
		xml += "<td>0</td>";
		xml += "<td>0</td>";
		xml += "<th class='bgcolor'>������Ȩ��ϼ�</th>";
		xml += "<th>38</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalShareholdersEquity));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalShareholdersEquityEnd));
		xml += "</tr>";

		xml += "<tr>";
		xml += "<th class='bgcolor'>�ʲ��ϼ�</th>";
		xml += "<th>39</th>";
		xml += String
				.format("<td>{0}</td>", com.formatCurrency(bs.TotalAssets));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalAssetsEnd));
		xml += "<th  class='bgcolor'>��ծ��������Ȩ�棨��ɶ�Ȩ�棩�ܼ�</th>";
		xml += "<th>39</th> ";
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalLiabilitiesEquity));
		xml += String.format("<td>{0}</td>", com
				.formatCurrency(bs.TotalLiabilitiesEquityEnd));
		xml += "</tr>";
		xml += String
				.format(
						"<tr><td colspan='8' style='border:0;color:black;'>�Ʊ��ˣ�{0}</td></tr>",
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
		var xml = "<table id='tablecss' cellpadding='0' class='alltbl'><tr><td id='title'>��ϸ��</td></tr><tr><td align='center'>";
		xml += "<table id='header'>";
		xml += String
				.format(
						"<tr><td>========================================</td></tr><tr><td align='center'>{0}</td></tr>",
						year);
		xml += "</table>";
		xml += String
				.format("<table id='content'><tr><td>��Ŀ��{0}</td>", account);
		xml += String.format(
				"<td id='txtright'>ҳ�ţ�{0} / {1}</td></tr></table>", number,
				pages);
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th colspan='2' id='col1'>����</th>";
		xml += "<th rowspan='2' id='col2'>ƾ֤��</th>";
		xml += "<th rowspan='2' id='col3'>ժҪ</th>";
		xml += "<th rowspan='2' id='col4'>��Ӧ��Ŀ</th>";
		xml += "<th rowspan='2' id='col5'>�跽</th>";
		xml += "<th rowspan='2' id='col6'>����</th>";
		xml += "<th rowspan='2' colspan='2' id='col7'>���</th>";
		xml += "</tr>";
		xml += "<tr><th>��</th><th>��</th></tr>";
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
						"<tr><th>{0}</th><th>{1}</th><th>{2}</th><th>{3}</th><th>{4}</th><td>{5}</td><td>{6}</td><th>��</th><td>{7}</td></tr>",
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
		xml += "<th id='col8'>��</th>";
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
		var xml = "<table class='tablecss alltbl' cellpadding='0'><tr><td id='title'>�ܷ�����</td></tr><tr><td align='center'>";
		xml += "<table id='header'>";
		xml += String
				.format(
						"<tr><td>========================================</td></tr><tr><td align='center'>{0}</td></tr>",
						yearmonth);
		xml += "</table>";
		xml += String
				.format(
						"<table id='content'><tr><td>��Ŀ��{0}</td><td id='txtright'>ҳ�ţ�1 / 1</td></tr></table>",
						account);
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th colspan='2' id='col1'>����</th>";
		xml += "<th rowspan='2' id='col2'>ժҪ</th>";
		xml += "<th rowspan='2' id='col3'>�跽</th>";
		xml += "<th rowspan='2' id='col4'>����</th>";
		xml += "<th rowspan='2' colspan='2' id='col5'>���</th>";
		xml += "</tr>";
		xml += "<tr><th>��</th><th>��</th></tr>";
		return xml;
	},

	/**
	 * Get table Content
	 * 
	 * @param month
	 * @param day
	 * @param name
	 *            ���ºϼƣ�����ϼ�
	 * @param credit
	 * @param debit
	 * @param type
	 *            �裬����ƽ
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
	 * �ڳ����
	 * 
	 * @param type
	 *            ==��,��,ƽ
	 * @param balance
	 * @returns {String}
	 */
	GetOpeningBalanceByYearXML : function(type, balance) {
		var xml = "<tr><td></td>";
		xml += "<td></td>";
		xml += "<td>������</td>";
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
		xml += "<td>��ĩ���</td>";
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
		var xml = "<table id='tablecss' cellpadding='0' class='alltbl'><tr><td id='title'>�� �� ��</td></tr><tr><td align='center'>";
		xml += "<table id='header'>";
		xml += String
				.format(
						"<tr><td>========================================</td></tr><tr><td align='center'>{0}</td></tr>",
						year);
		xml += "</table>";
		xml += String
				.format(
						"<table id='content'><tr><td>��Ŀ��{0}</td><td id='txtright'>ҳ�ţ�<pagenumber/> / <totalpages/></td></tr></table>",
						account);
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th colspan='2' id='col1'>����</th>";
		xml += "<th rowspan='2' id='col2'>ƾ֤��</th>";
		xml += "<th rowspan='2' id='col3'>ժҪ</th>";
		xml += "<th rowspan='2' id='col4'>��Ӧ��Ŀ</th>";
		xml += "<th rowspan='2' id='col5'>�跽</th>";
		xml += "<th rowspan='2' id='col6'>����</th>";
		xml += "<th rowspan='2' colspan='2' id='col7'>���</th>";
		xml += "</tr>";
		xml += "<tr><th>��</th><th>��</th></tr>";
		return xml;
	},

	/**
	 * �ڳ����
	 * 
	 * @param type
	 *            ==��,��,ƽ
	 * @param balance
	 * @returns {String}
	 */
	GetOpeningBalanceXML : function(type, balance) {
		var xml = "<tr><td></td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<td>�ڳ����</td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += String.format("<th  id='col8'>{0}</th>", type);
		xml += String.format("<td  id='col9'>{0}</td>", balance);
		xml += "</tr>";
		return xml;
	},

	/**
	 * �������
	 * 
	 * @param money
	 * @returns {String}
	 */
	GetBalanceOfDayXML : function(credit, debit, balance) {
		var xml = "<tr><td></td>";
		xml += "<td></td>";
		xml += "<td></td>";
		xml += "<td>�������</td>";
		xml += "<td></td>";
		xml += String.format("<td>{0}</td>", credit);
		xml += String.format("<td>{0}</td>", debit);
		xml += "<th>��</th>";
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
						"<tr><th>{0}</th><th>{1}</th><th>{2}</th><th>{3}</th><th>{4}</th><td>{5}</td><td>{6}</td><th>��</th><td>{7}</td></tr>",
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
		xml += "<table id='tablecss' cellpadding='0'><tr><td id='title'>����ƽ���</td></tr><tr><td align='center'>";
		xml += "<table id='header'>";
		xml += String.format("<tr><td align='center'>{0}</td></tr>", date);
		xml += "</table>";
		xml += String
				.format(
						"<table id='content'><tr><td id='txtright'>ҳ�ţ�{0} / <totalpages/></td></tr></table>",
						number);
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th rowspan='2' id='col1'>�� Ŀ</th>";
		xml += "<th colspan='2' id='col2'>�ڳ����</th>";
		xml += "<th colspan='2' id='col3'>���ڷ���</th>";
		xml += "<th colspan='2' id='col4'>��ĩ���</th>";
		xml += "</tr>";
		xml += "<tr>";
		xml += "<th>�跽</th><th>����</th>";
		xml += "<th>�跽</th><th>����</th>";
		xml += "<th>�跽</th><th>����</th>";
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
		xml += "<table width='523pt' id='title'><tr><th>�� �� ƾ ֤</th></tr><tr><td>=================</td></tr>";
		xml += String.format("<tr><td>{0}</td></tr></table>", date);
		xml += "<table id='number'><tr>";
		xml += String.format("<td>��������: {0}</td>", type);
		xml += String.format("<td>��������: {0}</td>", voucherdate);
		xml += String.format("<td>����: {0}</td>", currency);
		xml += String
				.format(
						"<td align='right'>��ţ�{0}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
								+ "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;���˱�ţ�{1}</td>",
						number, serialNumber);
		xml += "</tr></table>";
		xml += "<table id='main'>";
		xml += "<tr>";
		xml += "<th rowspan='2' id='col1'>ժҪ</th>";
		xml += "<th colspan='2' id='col2'>��ƿ�Ŀ</th>";
		xml += "<th rowspan='2' id='col3'>��ҽ��</th>";
		xml += "<th rowspan='2' id='col4'>����</th>";
		xml += "<th rowspan='2' id='col5'>�跽</th>";
		xml += "<th rowspan='2' id='col6'>����</th>";
		xml += "</tr>";
		xml += "<tr>";
		xml += "<th id='col7'>һ����Ŀ</th>";
		xml += "<th id='col8'>��ϸ��Ŀ</th>";
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
						"<table id='foot'><tr><td>�������</td><td>����</td><td>�Ƶ�: {0}</td></tr></table>",
						createby);
		xml += "</td></tr></table>";
		return xml;
	},

	GetVoucherXMLTotal : function(totalcredit, totaldebit) {
		var xml = String
				.format(
						"<tr><td>�ϼ�</td><td>&nbsp;</td><td>&nbsp;</td><td></td><td></td><td>{0}</td><td>{1}</td></tr>",
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
			+ "None Records [�ò�ѯ�����������ݿ���]</div></body></html>",

	GetLimitOfNumberXML : function(number) {
		var xml = String
				.format(
						"<html><body style='width:100%;text-align:center'><div style='margin:0 auto;width:500px;'>"
								+ "<table><tr>"
								+ "<td>Total {0} records what you selected had over max 8000 records in your date ranges. "
								+ "please reselect your date range and search it again.</td></tr>"
								+ "<tr><td>����ѡ������ڷ�Χ�ڣ�һ����{0}����¼���ѳ�����������8000����¼��, ����С���ڷ�Χ����������."
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