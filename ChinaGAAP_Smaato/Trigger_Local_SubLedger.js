/**
 * Module Description: Profit & Loss Version Date Author Remarks 1.00 23 Oct
 * 2014 Winson.Chen
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.subledger = function() {
};
trigger.local.subledger.prototype = {
	writeSubLedgerToPDF : function(subsidiaryid, periodid, period, accountid,
			response) {
		var filterexpression = rule.GetCNCOAFilters(accountid);// 得到custrecord_trigger_cn_account_number的条件accountid=
		// chinnaaccount
		// nlapiLogExecution('debug', 'accountid', accountid);
		var internalids1 = rule.GetMappingCNCOA1(filterexpression);// 查询原始的nsaccountid
		var internalids = rule.GetMappingCNCOA(filterexpression);// 根据filterexpression搜索customrecord_trigger_mapping_cn_coa里的custrecord_trigger_ns_account_id
		// internalids = accountIds 返回的是 nsaccountid+dpt+cls+lct
		if (!internalids) {
			new trigger.local.write().WriteXMLToPDF(response, "", "");
			return '';
		}
		var entity = this.GetSQLForMappingCNCOA(internalids1, accountid);// 选出nsaccountid对应的cnaccountnum
		var formula = entity.sql;
		// nlapiLogExecution('debug', 'formula', formula);
		var prevfilter = [];
		var filter = [];
		var filters = [];
		if (subsidiaryid && subsidiaryid != '-1') {
			prevfilter[prevfilter.length] = new nlobjSearchFilter('subsidiary',
					null, 'anyof', subsidiaryid);
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

			var periodtime = String.format("{0}/{1}/{2}", endMonth, endDay,
					endYear);// end of chosen period

			var begintime = '1/1/' + startYear;

			// 期初余额时间
			var prevtime = String.format("{0}/{1}/{2}", startMonth, startDay,
					startYear);// beginning of chosen period

			prevfilter[prevfilter.length] = new nlobjSearchFilter('startdate',
					'accountingperiod', 'before', prevtime);
			filter[filter.length] = new nlobjSearchFilter('postingperiod',
					null, 'abs', [ periodid ]);
			filters[filters.length] = new nlobjSearchFilter('startdate',
					'accountingperiod', 'within', begintime, periodtime);
		}

		var cols = [];
		var columns = [];
		if (formula) {// 改为到结果筛选 joe
			var formulakey = String
					.format(
							"CASE WHEN TO_NUMBER({account.internalid}||{department.internalid}||{class.internalid}) IN({0})"
									+ " THEN TO_NUMBER({account.internalid}||{department.internalid}||{class.internalid}) ELSE 1 END",
							internalids);

			var formulaname = new nlobjSearchColumn('formulatext');
			formulaname.setFormula(formula);
			formulaname.setSort(true);
			columns.push(formulaname);
			var formulaname1 = new nlobjSearchColumn('formulatext');
			formulaname1.setFormula(formulakey);
			formulaname1.setSort(true);
			columns.push(formulaname1);

			var temp = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
			temp.setFormula(formula);
			temp.setSort(true);
			cols.push(temp);
			var temp1 = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
			temp1.setFormula(formulakey);
			temp1.setSort(true);
			cols.push(temp1);

		}

		// 期初余额
		var initmap = this.GetTotalAmounts(prevfilter, cols);
		// 本年累计 一次计算所有所选科目合计
		var totalmap = this.GetTotalAmounts(filters, cols);

		// 加入刷选条件 by joe
		var coamappingkey = rule.GetOTMForMappingCNCOA(internalids, accountid);
		// content for pdf
		var xml = this.GetSubLedgerLists(filter, period, columns, entity.map,
				initmap, totalmap, coamappingkey, accountid);
		if (xml) {
			xml = template.GetSubLedgerXMLHead + xml;
			xml += template.GetPDFClosingTagXML;
		}

		var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
		filename = "Sub Ledger-" + filename + ".PDF";
		new trigger.local.write().WriteXMLToPDF(response, xml, filename);
	},

	/**
	 * Totals by years per every one account
	 * 
	 * @param filters
	 * @param columns
	 * @returns {HashTable}
	 */
	GetTotalAmounts : function(filters, columns) {
		var credit = 0;
		var debit = 0;
		var accnumber = '';
		var ndcl;
		var map = new trigger.local.HashTable();
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_balance_sheet');

		if (filters.length > 0) {
			savedsearch.addFilters(filters);
		}
		if (columns.length > 0) {
			savedsearch.addColumns(columns);
		}
		var resultset = savedsearch.runSearch();
		var resultslice = resultset.getResults(0, 1000);
		//nlapiLogExecution('debug', 'resultslice', resultslice.length);
		for (var i = 0; i < resultslice.length; i++) {
			ndcl = resultslice[i].getValue(columns[1]);
			if (ndcl == 1) {
				continue;
			}
			accnumber = resultslice[i].getValue(columns[0]);
			//nlapiLogExecution('debug', 'accnumber', accnumber);
			credit = resultslice[i].getValue('creditamount', null, 'SUM');
			debit = resultslice[i].getValue('debitamount', null, 'SUM');
			map.Add(accnumber, new trigger.local.HashEntity(accnumber, [
					credit, debit ]));
		}
		return map;
	},

	GetSQLForMappingCNCOA : function(id, accountid) {// accountid:204
		// chinaaccount6601010102
		var columns = [];
		if (id && id.length > 0) {
			var formula = String
					.format(
							"CASE WHEN TO_NUMBER({custrecord_trigger_ns_account_id}) IN({0})"
									+ " THEN TO_NUMBER({custrecord_trigger_ns_account_id}) ELSE 1 END",
							id);
			columns[0] = new nlobjSearchColumn('formulatext', null, null);
			columns[0].setFormula(formula);
		}
		var savedsearch = nlapiLoadSearch(
				'customrecord_trigger_mapping_cn_coa',
				'customsearch_trigger_mapping_cn_coa');
		if (columns) {
			savedsearch.addColumns(columns);
		}

		var resultset = savedsearch.runSearch();
		var internalid = '';
		var number = '';
		var name = '';
		var map = new trigger.local.HashTable();
		var sql = 'CASE TO_NUMBER({account.internalid}||{department.internalid}||{class.internalid})';
		var resultslice = resultset.getResults(0, 1000);

		var chinaaccounts = accountid.split(",");
		for ( var rs in resultslice) {
			internalid = resultslice[rs].getValue('formulatext', null, null);
			if (internalid == 1) {
				continue;
			}
			cls = resultslice[rs].getValue('custrecord_trigger_ns_class', null,
					null);
			dept = resultslice[rs].getValue('custrecord_trigger_ns_department',
					null, null);
			location = resultslice[rs].getValue(
					'custrecord_trigger_ns_location', null, null);
			ismultiple = resultslice[rs].getValue(
					'custrecord_trigger_one_to_many', null, null);
			if (ismultiple && ismultiple == 'T') {
				if (dept) {
					internalid += dept;
				}
				if (cls) {
					internalid += cls;
					// nlapiLogExecution('DEBUG', 'internalid+cls',
					// internalid);
				}
				if (location) {
					internalid += location;
				}
			}
			number = resultslice[rs].getText(
					'custrecord_trigger_cn_account_number', null, null);
			name = resultslice[rs].getValue('custrecord_trigger_name_coa_cn',
					'custrecord_trigger_cn_account_number', null);
			sql += String.format(" WHEN {0} THEN {1} ", internalid, number);
			if (!map.Contains(number)) {
				map.Add(number, new trigger.local.HashEntity(number, name));
			}
		}
		sql += 'ELSE 0 END';
		var entity = Object.create(trigger.local.entity.AccountDetail);
		entity.sql = sql;
		// nlapiLogExecution('debug', 'sql', sql)
		entity.map = map;
		return entity;
	},

	/**
	 * 取出明细账记录
	 * 
	 * @param internalids
	 * @returns {Array}
	 */
	GetSubLedgerLists : function(filters, year, columns, map, initmap,
			totalmap, coamappingkey, accountid) {
		var xml = '';
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_journal');
		if (filters.length > 0) {
			savedsearch.addFilters(filters);
		}
		if (columns.length > 0) {
			savedsearch.addColumns(columns);
		}

		// result for search
		var resultset = savedsearch.runSearch();
		var m = 45; // lines per page 每一页的行数
		var x = 0; // if x>=m then go to new page 当前行数
		var isfirst = true;
		var number = '';
		var memo = '';
		var account = '';
		var accnumber = '';
		var next_accnumber = '';
		var initarr = [];
		var initcredit = 0;
		var initdebit = 0;
		var credit = 0;
		var debit = 0;
		var monthcredit = 0;
		var monthdebit = 0;
		var yearcredit = 0;
		var yeardebit = 0;
		var date = '';
		var totalarr = [];
		var initbalance = true;
		var balance = 0;
		var month;
		var day;
		var rows = 0;
		var pages = [];
		var page = 1;
		// 修改为创建SAVED SEARCH，
		var resultslice = resultset.getResults(0, 1000);
		// nlapiLogExecution('debug', 'length', resultslice.length);
		// monthcredit = 0;
		// monthdebit = 0;

		// joe
		var chinaaccounts = accountid.split(",");
		// var length = ;
//		 nlapiLogExecution('DEBUG', 'resultslice.length', resultslice.length);
		var resultslicenew = [];
		for (var i = 0; i < resultslice.length; i++) {// 只筛选页面上选择的同一个nsaccount下的特定cnaccount
			// 不影响其他未被选择的nsaccount
			var ndcl = resultslice[i].getValue(columns[1]);
			if (ndcl == 1) {
				continue;
			}
			resultslicenew[resultslicenew.length] = resultslice[i];
		}
		// nlapiLogExecution('DEBUG', 'esultslicenew.length',
		// resultslicenew.length);

		for (var i = 0; i < resultslicenew.length; i++) {

			accnumber = resultslicenew[i].getValue(columns[0]);
			// accnumber = chinaaccounts[i];
			// nlapiLogExecution('DEBUG', 'accnumber', accnumber)
			account = map.GetValue(accnumber).name;
			//nlapiLogExecution('debug', 'name', accnumber + '/' + account);

			if (i < resultslicenew.length - 1) {
				next_accnumber = resultslicenew[i + 1].getValue(columns[0]);
			}
			number = resultslicenew[i].getValue('number', null, null);// JE
			// num
			number = com.replaceSpecialSymbolforNumber(number);
			// nlapiLogExecution('debug', 'number', number);

			memo = resultslicenew[i].getValue('memo', null, null);// 备注
			memo = com.replaceSpecialSymbol(memo);
			if (memo && memo.length > 20) {
				memo = com.replaceitemwithspace(memo);
			}

			credit = resultslicenew[i].getValue('creditamount', null, null);// 贷
			debit = resultslicenew[i].getValue('debitamount', null, null);// 借
			date = resultslicenew[i].getValue('trandate', null, null);// 时间

			// 计算出number memo accountname 3者之间最大的行数
			var nn = 0;// nn var holds max amount of lines between number, memo
			// & account name values
			if (memo && memo.length > 0) {
				nn = Math.ceil(memo.length / 50);
			}

			var nn1 = 0;
			if (number && number.length > 0) {
				nn1 = Math.ceil(number.length / 10);
			}
			if (nn1 > nn) {
				nn = nn1;
			}

			nn1 = 0;
			if (account && account.length > 0) {
				nn1 = Math.ceil(account.length / 13);
			}
			if (nn1 > nn) {
				nn = nn1;
			}

			// m:lines per page 每一页的行数 45
			// x:if x>=m then go to new page
			rows += nn; // 当前页行数
			if (rows >= 45) {
				if (x < m)
					m = x + 2;
				rows = 0;
			}
			var temp = new Date(date);// 时间
			month = temp.getMonth() + 1;
			day = temp.getDate();
			if (x % m == 0) {
				isfirst = true;
			}
//			nlapiLogExecution('debug', 'x/m', x + '/' + m+isfirst);
			// table head
			if (isfirst == true) {
				// nlapiLogExecution('debug', 'isfirst', isfirst);
				m = 45;
				rows = 0;
				if (initbalance == true) {
					pages = [];
				}
				pages.push(page);
				xml += template.GetSubLedgerContentHeadXML(year, accnumber
						+ ' ' + account, page, "{0}");
				initarr = initmap.GetValue(accnumber).name;
				initcredit = 0;
				initdebit = 0;
				if (initarr && initarr[0]) {
					initcredit = parseFloat(initarr[0]);
				}
				if (initarr && initarr[1]) {
					initdebit = parseFloat(initarr[1]);
				}
				// 如果多页，期初余额不重新获取
				if (initbalance == true) {
					balance = parseFloat(initdebit) - parseFloat(initcredit);
				}
				var type = "借";
				if (balance == 0) {
					type = "平";
				}
				if (initbalance == true) {
					xml += template.GetOpeningBalanceXML(type, com
							.formatCurrency(balance)); // 期初余额
				}
				isfirst = false;
				initbalance = false;
				monthcredit = 0;
				monthdebit = 0;
				x = 0;

				// 根据中方科目长度确定PDF的行数,不具有通用性
				var mm = 0;
				if (account && account.length > 0) {
					mm = Math.ceil(account.length / 13);
				}
				if (mm == 2)
					m = 28;
				else if (mm == 3)
					m = 21;
				else if (mm == 4)
					m = 15;
			}
			// content
			if (isfirst == false || accnumber == next_accnumber) {
				if (!credit) {
					credit = 0;
				}
				if (!debit) {
					debit = 0;
				}
				monthcredit += parseFloat(credit);
				monthdebit += parseFloat(debit);
				balance = parseFloat(balance) + parseFloat(debit)
						- parseFloat(credit);
				xml += template.GetSubLedgerAccountXML(month, day, number,
						nlapiEscapeXML(memo), account, com
								.formatCurrency(debit), com
								.formatCurrency(credit), com
								.formatCurrency(balance));
				x++;
			}
			
			 nlapiLogExecution('debug', 'x % m == m - 1', x % m == m - 1);
			 nlapiLogExecution('debug', 'isfirst', isfirst);
			 nlapiLogExecution('debug', 'accnumber|next_accnumber', accnumber +'|'+ next_accnumber);

			 // total
			if (isfirst == false
					&& ((i == resultslicenew.length - 1 || x % m == m - 1) || accnumber != next_accnumber)) {
				if (x % m == m - 1) {
					page++;
				} else {
					page = 1;
				}
				if (accnumber != next_accnumber
						|| (i == resultslicenew.length - 1)) {
					xml = String.format(xml, pages.length);
				}
				// nlapiLogExecution('debug', 'param', pages.length);

				if (x % m != m - 1) {
					balance = parseFloat(monthdebit) - parseFloat(monthcredit);
					xml += template.GetTotalBalanceXML(month, '本月累计', com
							.formatCurrency(monthdebit), com
							.formatCurrency(monthcredit), com
							.formatCurrency(balance));

					totalarr = totalmap.GetValue(accnumber).name;
					if (totalarr && totalarr[0]) {
						yearcredit = parseFloat(totalarr[0]);
					}
					if (totalarr && totalarr[1]) {
						yeardebit = parseFloat(totalarr[1]);
					}
					balance = yeardebit - yearcredit;
					xml += template.GetTotalBalanceXML(month, '本年累计', com
							.formatCurrency(yeardebit), com
							.formatCurrency(yearcredit), com
							.formatCurrency(balance));

					initbalance = true;
					balance = 0;
				}
				xml += template.GetFooterXML;
				isfirst = true;
				yearcredit = 0;
				yeardebit = 0;
			}
			// }
			// }
		}// for
		return xml;
	}
};