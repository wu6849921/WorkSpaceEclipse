/**
 * Module Description: Profit & Loss Version Date Author Remarks 1.00 23 Oct
 * 2014 Winson.Chen
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.diaryledgerexcel = function() {
}
trigger.local.diaryledgerexcel.prototype = {

	writeDiaryLedgerToExcel : function(subsidiaryid, periodid, period,
			accountid, response) {
		// nlapiLogExecution('debug', 'writeDiaryLedgerToExcel',
		// 'writeDiaryLedgerToExcel');

		var year = com.GetCurrentYear();
		var map = rule.GetCOAAccountList();
		var xml = '';

		var filter = []; // 期初余额
		var filters = [];
		if (subsidiaryid && subsidiaryid != '-1') {
			filter[0] = new nlobjSearchFilter('subsidiary', null, 'anyof',
					subsidiaryid);
			filters[0] = new nlobjSearchFilter('subsidiary', null, 'anyof',
					subsidiaryid);
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

			filter[filter.length] = new nlobjSearchFilter('startdate',
					'accountingperiod', 'before', periodtime);
			filters[filters.length] = new nlobjSearchFilter('postingperiod',
					null, 'abs', [ periodid ]);
		}
		var n = filter.length;
		var sqlin = this.GetAccIdList(accountid);
		// nlapiLogExecution('debug', 'sqlin', sqlin);

		// 两层循环
		var tmpHead = nlapiLoadFile('Templates/DiaryLedgerTmpHead.xml');// 得到模板head
		var tmpHeadStr = tmpHead.getValue();
		xml += tmpHeadStr;
		for (var i = 0; i < sqlin.length; i++) {
			var internalids = sqlin[i];
			if (internalids.length > 0) {
				filter[n] = new nlobjSearchFilter('internalid', 'account',
						'anyof', internalids);
				filters[n] = new nlobjSearchFilter('internalid', 'account',
						'anyof', internalids);
			}
			var beginbalance = this.GetSumRecordstByAccountID(filter);
			var bodyTmp = this.GetDiaryLedgerLists(filters, period,
					beginbalance, map);
			xml += bodyTmp;
		}
		// nlapiLogExecution('debug', 'renderData', JSON.stringify(renderData));
		if (xml) {
			xml += this.getBodyEndTmp();
		}
		var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
		filename = "Diary Ledger-" + filename + ".xls";
		new trigger.local.write1().WriteXMLToXlsx(response, xml, filename);
	},

	GetAccIdList : function(accountid) {
		if (!accountid) {
			return '';
		}
		var arrid = accountid.split(",");
		var id;
		var list = [];
		var number = '';
		var sql = [];
		var map = rule.GetMappingIdList(accountid);
		for (var i = 0; i < map.Count; i++) {

			for (var n = 0; n < arrid.length; n++) {
				var str = arrid[n];
				id = map.ArrayList[i];
				// nlapiLogExecution('debug', str, number);
				number = map.GetValue(id).internalid;
				if (!number) {
					continue;
				}
				if (str == number) {
					list.push(id);
				}
			}
			if (list.length > 0) {
				sql.push(list);
			}
			list = [];
		}
		return sql;
	},

	GetSumRecordstByAccountID : function(filters) {
		var result = 0;
		if (filters.length <= 0) {
			return '';
		}
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_balance_sheet');
		if (filters.length > 0) {
			savedsearch.addFilters(filters);
		}

		var resultset = savedsearch.runSearch();
		var resultslice = resultset.getResults(0, 1);
		if (resultslice.length > 0) {
			var credit = resultslice[0].getValue('creditamount', null, 'SUM');
			var debit = resultslice[0].getValue('debitamount', null, 'SUM');

			if (!credit) {
				credit = 0;
			}
			if (!debit) {
				debit = 0;
			}
			result = parseFloat(debit) - parseFloat(credit);
		}
		return result;
	},
	/**
	 * 取出日记账记录
	 * 
	 * @param internalids
	 * @returns {Array}
	 */
	GetDiaryLedgerLists : function(filters, year, balance, map) {
		var bodyTmp = '';

		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_journal');
		if (filters.length > 0) {
			savedsearch.addFilters(filters);
		}
		// result for search
		var resultset = savedsearch.runSearch();
		var number = '';
		var internalid = '';
		var memo = '';
		var account = '';
		var accountnumber = '';
		var credit = '';
		var debit = '';
		var totalcredit = 0;
		var totaldebit = 0;
		var date = '';
		var nextdate = '';
		// var balance = 0;
		var month;
		var day;
		var m = 0; // paging

		var resultslice = resultset.getResults(0, 1000);
		// nlapiLogExecution('debug', 'COUNT', resultslice.length);
		if (resultslice.length <= 0) {
			return '';
		}
		for (var i = 0; i < resultslice.length; i++) {
			number = resultslice[i].getValue('number', null, null);
			internalid = resultslice[i].getValue('internalid', 'account', null);
			memo = resultslice[i].getValue('memo', null, null);
			memo = com.replaceSpecialSymbol(memo);
			if (memo && memo.length > 20) {
				memo = com.replaceitemwithspace(memo);
			}
			account = map.GetValue(internalid).name;
			accountnumber = map.GetValue(internalid).internalid;
			credit = resultslice[i].getValue('creditamount', null, null);
			debit = resultslice[i].getValue('debitamount', null, null);
			date = resultslice[i].getValue('trandate', null, null);
			if (i < resultslice.length - 1) {
				nextdate = resultslice[i + 1].getValue('trandate', null, null);
			}
			var temp = new Date(date);
			month = temp.getMonth() + 1;
			day = temp.getDate();

			if (!credit) {
				credit = 0;
			}
			if (!debit) {
				debit = 0;
			}

			// table head
			if (i == 0) {
				if (!accountnumber) {
					accountnumber = '';
				}
				var type = "借";
				if (balance == 0) {
					type = "平";
				}
				bodyTmp += this.getBodyHeadTmp(year, accountnumber + ' '
						+ account, type, com.formatCurrency(balance));
			}
			// content
			totalcredit += parseFloat(credit);
			totaldebit += parseFloat(debit);
			balance = parseFloat(balance) + parseFloat(debit)
					- parseFloat(credit);
			// dynamic content
			bodyTmp += this.getBodyLineTmp(month, day, number, memo, account,
					debit, credit, balance);
			// 当日余额
			if ((date != nextdate) || i == resultslice.length - 1) {// last one
				// record
				bodyTmp += this.getBodyLineTmp('', '', '', '单日余额', '', com
						.formatCurrency(totaldebit), com
						.formatCurrency(totalcredit), com
						.formatCurrency(balance));
				totalcredit = 0;
				totaldebit = 0;
				// m++;
			}
		} // for
		bodyTmp += this.getBodyEmtLineTmp();
		return bodyTmp;
	},
	getBodyHeadTmp : function(date, account, type, beginningBalance) {
		var bodyHeadTmp = "<Row ss:AutoFitHeight=\"0\">\r\n"
				+ "				<Cell ss:MergeAcross=\"8\" ss:MergeDown=\"1\" ss:StyleID=\"s63\">\r\n"
				+ "					<Data ss:Type=\"String\">日记账</Data>\r\n"
				+ "				</Cell>\r\n" + "			</Row>\r\n"
				+ "			<Row ss:AutoFitHeight=\"0\" />\r\n"
				+ "			<Row ss:AutoFitHeight=\"0\">\r\n"
				+ "				<Cell ss:MergeAcross=\"8\" ss:StyleID=\"s83\">\r\n"
				+ "					<Data ss:Type=\"String\">"
				+ date
				+ "</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "			</Row>\r\n"
				+ "			<Row ss:AutoFitHeight=\"0\">\r\n"
				+ "				<Cell>\r\n"
				+ "					<Data ss:Type=\"String\">"
				+ account
				+ "</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "			</Row>\r\n"
				+ "			<Row ss:AutoFitHeight=\"0\">\r\n"
				+ "				<Cell ss:MergeAcross=\"1\" ss:StyleID=\"m2421962877524\">\r\n"
				+ "					<Data ss:Type=\"String\">日期</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:MergeDown=\"1\" ss:StyleID=\"m2421962877544\">\r\n"
				+ "					<Data ss:Type=\"String\">凭证号</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:MergeDown=\"1\" ss:StyleID=\"m2421962877564\">\r\n"
				+ "					<Data ss:Type=\"String\">摘要</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:MergeDown=\"1\" ss:StyleID=\"m2421962877584\">\r\n"
				+ "					<Data ss:Type=\"String\">对应科目</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:MergeDown=\"1\" ss:StyleID=\"m2421962877604\">\r\n"
				+ "					<Data ss:Type=\"String\">借方</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:MergeDown=\"1\" ss:StyleID=\"m2421962877624\">\r\n"
				+ "					<Data ss:Type=\"String\">贷方</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:MergeAcross=\"1\" ss:MergeDown=\"1\"\r\n"
				+ "					ss:StyleID=\"m2421962877644\">\r\n"
				+ "					<Data ss:Type=\"String\">余额</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "			</Row>\r\n"
				+ "			<Row ss:AutoFitHeight=\"0\">\r\n"
				+ "				<Cell ss:StyleID=\"s65\">\r\n"
				+ "					<Data ss:Type=\"String\">日</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s65\">\r\n"
				+ "					<Data ss:Type=\"String\">月</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "			</Row>\r\n"
				+ "			<Row ss:AutoFitHeight=\"0\">\r\n"
				+ "				<Cell ss:StyleID=\"s65\" />\r\n"
				+ "				<Cell ss:StyleID=\"s65\" />\r\n"
				+ "				<Cell ss:StyleID=\"s65\" />\r\n"
				+ "				<Cell ss:StyleID=\"s78\">\r\n"
				+ "					<Data ss:Type=\"String\">期初余额</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s78\" />\r\n"
				+ "				<Cell ss:StyleID=\"s79\" />\r\n"
				+ "				<Cell ss:StyleID=\"s79\" />\r\n"
				+ "				<Cell ss:StyleID=\"s79\">\r\n"
				+ "					<Data ss:Type=\"String\">"
				+ type
				+ "</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s80\">\r\n"
				+ "					<Data ss:Type=\"Number\">"
				+ beginningBalance
				+ "</Data>\r\n" + "				</Cell>\r\n" + "			</Row>";
		return bodyHeadTmp;
	},
	getBodyLineTmp : function(month, day, tranid, memo, account, debit, credit,
			balance) {
		var bodyLineTmp = "<Row>\r\n" + "				<Cell ss:StyleID=\"s81\">\r\n"
				+ "					<Data ss:Type=\"String\">"
				+ day
				+ "</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s81\">\r\n"
				+ "					<Data ss:Type=\"String\">"
				+ month
				+ "</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s81\">\r\n"
				+ "					<Data ss:Type=\"String\">"
				+ tranid
				+ "</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s81\">\r\n"
				+ "					<Data ss:Type=\"String\">"
				+ memo
				+ "</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s78\">\r\n"
				+ "					<Data ss:Type=\"String\">"
				+ account
				+ "</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s80\">\r\n"
				+ "					<Data ss:Type=\"Number\">"
				+ debit
				+ "</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s80\">\r\n"
				+ "					<Data ss:Type=\"Number\">"
				+ credit
				+ "</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s79\">\r\n"
				+ "					<Data ss:Type=\"String\">借</Data>\r\n"
				+ "				</Cell>\r\n"
				+ "				<Cell ss:StyleID=\"s80\">\r\n"
				+ "					<Data ss:Type=\"Number\">"
				+ balance
				+ "</Data>\r\n"
				+ "				</Cell>\r\n" + "			</Row>";
		return bodyLineTmp;
	},
	getBodyEmtLineTmp : function() {
		var bodyEmtLineTmp = "<Row ss:AutoFitHeight=\"0\" />";
		return bodyEmtLineTmp;
	},
	getBodyEndTmp : function() {
		var bodyEntTmp = "</Table>\r\n" + "		<WorksheetOptions\r\n"
				+ "			xmlns=\"urn:schemas-microsoft-com:office:excel\">\r\n"
				+ "			<PageBreakZoom>100</PageBreakZoom>\r\n"
				+ "			<Selected />\r\n" + "			<Panes>\r\n" + "				<Pane>\r\n"
				+ "					<Number>3</Number>\r\n"
				+ "					<ActiveRow>10</ActiveRow>\r\n"
				+ "					<ActiveCol>6</ActiveCol>\r\n" + "				</Pane>\r\n"
				+ "			</Panes>\r\n"
				+ "			<ProtectObjects>False</ProtectObjects>\r\n"
				+ "			<ProtectScenarios>False</ProtectScenarios>\r\n"
				+ "		</WorksheetOptions>\r\n" + "	</Worksheet>\r\n"
				+ "</Workbook>";
		return bodyEntTmp;
	}
}