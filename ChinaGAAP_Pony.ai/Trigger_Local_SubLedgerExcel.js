/**
 * Module Description: Profit & Loss Version Date Author Remarks 1.00 23 Oct
 * 2014 Winson.Chen
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.subledgerexcel = function() {
};
trigger.local.subledgerexcel.prototype = {
	writeSubLedgerToExcel : function(subsidiaryid, periodid, period, accountid,
			response) {
		var filterexpression = rule.GetCNCOAFilters(accountid);// 得到custrecord_trigger_cn_account_number的条件
		var internalids = rule.GetMappingCNCOA(filterexpression);// 根据filterexpression搜索customrecord_trigger_mapping_cn_coa里的custrecord_trigger_ns_account_id
		if (!internalids) {
			new trigger.local.write().WriteXMLToPDF(response, "", "");
			return '';
		}
		var entity = this.GetSQLForMappingCNCOA(internalids);
		var formula = entity.sql;
		nlapiLogExecution('debug', 'formula', formula);
		var prevfilter = [];
		var filter = [];
		var filters = [];
		if (internalids.length > 0) {
			prevfilter[0] = new nlobjSearchFilter('internalid', 'account',
					'anyof', internalids);
			filter[0] = new nlobjSearchFilter('internalid', 'account', 'anyof',
					internalids);
			filters[0] = new nlobjSearchFilter('internalid', 'account',
					'anyof', internalids);
		}
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
		if (formula) {
			var formulaname = new nlobjSearchColumn('formulatext');
			formulaname.setFormula(formula);
			formulaname.setSort(true);
			columns.push(formulaname);

			var temp = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
			temp.setFormula(formula);
			temp.setSort(true);
			cols.push(temp);
		}

		// 期初余额
		var initmap = this.GetTotalAmounts(prevfilter, cols);
		// 本年累计 一次计算所有所选科目合计
		var totalmap = this.GetTotalAmounts(filters, cols);

		// content for pdf
		var xml = this.GetSubLedgerLists(filter, period, columns, entity.map,
				initmap, totalmap);
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
		for (var i = 0; i < resultslice.length; i++) {
			accnumber = resultslice[i].getValue(columns[0]);
			credit = resultslice[i].getValue('creditamount', null, 'SUM');
			debit = resultslice[i].getValue('debitamount', null, 'SUM');
			map.Add(accnumber, new trigger.local.HashEntity(accnumber, [
					credit, debit ]));
		}
		return map;
	},

	GetSQLForMappingCNCOA : function(id) {
		var columns = [];
		if (id && id.length > 0) {
			var formula = String
					.format(
							"CASE WHEN TO_NUMBER({custrecord_trigger_ns_account_id}) IN({0}) THEN TO_NUMBER({custrecord_trigger_ns_account_id}) ELSE 1 END",
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
		var sql = 'CASE {account.internalid}';
		var resultslice = resultset.getResults(0, 1000);
		for ( var rs in resultslice) {
			internalid = resultslice[rs].getValue('formulatext', null, null);
			if (internalid == 1) {
				continue;
			}
			number = resultslice[rs].getText(
					'custrecord_trigger_cn_account_number', null, null);
			name = resultslice[rs].getValue('custrecord_trigger_name_coa_cn',
					'custrecord_trigger_cn_account_number', null);
			sql += String.format(" WHEN {0} THEN {1} ", internalid, number);
			if (!map.Contains(number)) {
				map.Add(number, new trigger.local.HashEntity(number, name));
			}
			// nlapiLogExecution('debug', 'name', number + '/' + name);
		}
		sql += 'ELSE 0 END';
		var entity = Object.create(trigger.local.entity.AccountDetail);
		entity.sql = sql;
		entity.map = map;
		return entity;
	},

	/**
	 * 取出明细账记录
	 * 
	 * @param internalids
	 * @returns {Array}
	 */
	GetSubLedgerLists : function(filters, year, columns, map, initmap, totalmap) {
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
		var m = 45; // lines per page
		var x = 0; // if x>=m then go to new page
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
		var renderData = {
			infos : []
		};
		var info = {// 数据载体
			date : '',
			account : '',
			lines : []
		};
		monthcredit = 0;
		monthdebit = 0;
		for (var i = 0; i < resultslice.length; i++) {
			accnumber = resultslice[i].getValue(columns[0]);
			account = map.GetValue(accnumber).name;
			// nlapiLogExecution('debug', 'name', accnumber + '/' + account);

			if (i < resultslice.length - 2) {
				next_accnumber = resultslice[i + 1].getValue(columns[0]);
			}
			number = resultslice[i].getValue('number', null, null);
			number = com.replaceSpecialSymbolforNumber(number);

			memo = resultslice[i].getValue('memo', null, null);
			memo = com.replaceSpecialSymbol(memo);
			if (memo && memo.length > 20) {
				memo = com.replaceitemwithspace(memo);
			}

			credit = resultslice[i].getValue('creditamount', null, null);
			debit = resultslice[i].getValue('debitamount', null, null);
			date = resultslice[i].getValue('trandate', null, null);

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

			rows += nn;
			if (rows >= 45) {
				if (x < m)
					m = x + 2;
				rows = 0;
			}
			var temp = new Date(date);
			month = temp.getMonth() + 1;
			day = temp.getDate();
			if (x % m == 0) {
				isfirst = true;
			}
			// table head
			if (isfirst == true) {
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
				// monthcredit = 0;//joe
				// monthdebit = 0;
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
			// total
			if (isfirst == false
					&& ((i == resultslice.length - 1 || x % m == m - 1) || accnumber != next_accnumber)) {
				if (x % m == m - 1) {
					page++;
				} else {
					page = 1;
				}
				if (accnumber != next_accnumber
						|| (i == resultslice.length - 1)) {
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
		}// for
		return xml;
	}
};