/**
 * Module Description: Profit & Loss Version Date Author Remarks 1.00 23 Oct
 * 2014 Winson.Chen
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.generalledger = function() {
};
trigger.local.generalledger.prototype = {
	writeGeneralLedgerToPDF : function(subsidiaryid, periodid, period,
			accountid, accountname, response) {
		// nlapiLogExecution('DEBUG', 'joe accountid1', accountid);
		// accountid=6601,660101,66010101,6601010101,660101010101,660101010102
		var filterexpression = rule.GetCNCOAFilters(accountid);// 得到查询条件
		// formulatext:
		// {custrecord_trigger_cn_account_number},startswith,6601,OR,
		// formulatext:
		// {custrecord_trigger_cn_account_number},startswith,660101,OR,
		// formulatext:
		// {custrecord_trigger_cn_account_number},startswith,66010101,OR,
		// formulatext:
		// {custrecord_trigger_cn_account_number},startswith,6601010101,OR,
		// formulatext:
		// {custrecord_trigger_cn_account_number},startswith,660101010101,OR,
		// formulatext:
		// {custrecord_trigger_cn_account_number},startswith,660101010102
		var internalids1 = rule.GetMappingCNCOA1(filterexpression);// 查询原始的nsaccountid
		var internalids = rule.GetMappingCNCOA(filterexpression);// 查询mapping
		// 通过cnaccountnum
		// 得到
		// nsaccountid（以cnaccountnum开头）
		// 同一个主科目 只取最大的科目对应的nsaccountid
		var entity = this.GetSQLForMappingCNCOA(internalids1);// 得到key(nsaccountid+dpt+cls+lct)对应的cnaccountnum(sql)
		// 以及cnaccountnum对应的cnaccountname(map)
		// 为了得到cnaccountid和cnaccountname 和最终数据条数无关
		var formula = entity.sql;

		var filter = [];// 年初余额筛选条件
		var filters = [];// 明细筛选条件

		var columns = [];// 明细返回值
		var cols = [];// 年初余额返回值
		var xml = '';

		// 封装晒筛选条件
		if (formula) {
			// var formulaname = new nlobjSearchColumn('formulatext', null,
			// 'GROUP');
			// formulaname.setFormula(formula);
			// formulaname.setSort(true);
			// columns.push(formulaname);
			//
			// var temp = new nlobjSearchColumn('formulanumeric', null,
			// 'GROUP');
			// temp.setFormula(formula);
			// // temp.setFormula('CASE {account.internalid} WHEN 5 THEN 100101
			// // WHEN 3 THEN 100101 WHEN 4 THEN 100103 ELSE
			// {account.internalid}
			// // END');
			// temp.setSort(true);
			// cols.push(temp);

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
		if (internalids.length > 0) {
			xml = template.GetLedgerXMLHead;
			// filters[0] = new nlobjSearchFilter('internalid',
			// 'account',//改到结果取刷选 joe
			// 'anyof', internalids);
			// filter[0] = new nlobjSearchFilter('internalid', 'account',
			// 'anyof',
			// internalids);
			if (subsidiaryid && subsidiaryid != '-1') {
				filters[filters.length] = new nlobjSearchFilter('subsidiary',
						null, 'anyof', subsidiaryid);
				filter[filter.length] = new nlobjSearchFilter('subsidiary',
						null, 'anyof', subsidiaryid);
			}
			var year;
			if (periodid && period) {
				year = period.substr(0, 4);
				var begintime = '1/1/' + year;
				var endtime = '12/31/' + year;
				filter[filter.length] = new nlobjSearchFilter('startdate',
						'accountingperiod', 'before', begintime);
				filters[filters.length] = new nlobjSearchFilter('startdate',
						'accountingperiod', 'within', begintime, endtime);

				// need this filter in order to filter out data of period 13
				// that has the same begin date as period 12
				filters[filters.length] = new nlobjSearchFilter(
						'internalidnumber', 'accountingperiod',
						'notgreaterthan', periodid);
			}
			var beginbalanceMap = this.GetBalanceByYearBegin(filter, cols,
					accountid); // 年初余额,balance
			// at
			// the
			// beginning
			// of
			// the
			// year

			// 加入刷选条件 by joe 得到所有符合条件的key的集合（nsaccountid+dpt+cls+lct）
			var coamappingkey = rule.GetOTMForMappingCNCOA(internalids,
					accountid);

			// nlapiLogExecution('DEBUG', 'joe accountid2', accountid);
			var _xml = this.GetGeneralLedgerLists(filters, period, cols,
					entity.map, beginbalanceMap, coamappingkey, accountid);
			if (_xml) {
				xml += _xml;
				xml += template.GetPDFClosingTagXML;
			} else {
				xml = '';
			}
		}
		var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
		filename = "Ledger-" + filename + ".PDF";
		new trigger.local.write().WriteXMLToPDF(response, xml, filename);
	},
	/**
	 * Get ledger records
	 * 
	 * @param internalids
	 * @returns {String}
	 */
	GetSQLForMappingCNCOA : function(id) {
		// chinaaccount6601010102
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
		var sql = 'CASE TO_NUMBER({account.internalid}||{department.internalid}||{class.internalid})';
		var resultslice = resultset.getResults(0, 1000);

		// var chinaaccounts = accountid.split(",");
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
		 nlapiLogExecution('debug', 'sql', sql);
		entity.map = map;
		return entity;
	},

	GetGeneralLedgerLists : function(filters, year, columns, entityMap,
			beginbalanceMap, coamappingkey, accountid) {
		var xml = '';

		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_ledger_by_months');
		if (filters.length > 0) {
			savedsearch.addFilters(filters);
		}
		if (columns.length > 0) {
			savedsearch.addColumns(columns);
		}
		// result for search
		var resultset = savedsearch.runSearch();
		var credit = 0;
		var debit = 0;
		var beginbalance = 0;
		var monthbeginbalance = 0;
		var totalcredit = 0;
		var totaldebit = 0;
		var period = '';
		var periodEndDate = '';
		var accountNum = '';
		var firstlevelaccountnum = '';
		var secondlevelaccountnum = '';
		var month;
		var day;
		var t;

		var resultslice = resultset.getResults(0, 1000);
		var map = new trigger.local.HashTable();

		// nlapiLogExecution('DEBUG', 'joe accountid', accountid);
		// joe
		var chinaaccounts = accountid.split(",");
		// var length = ;
		// nlapiLogExecution('DEBUG', 'resultslice.length', resultslice.length);
		var resultslicenew = [];

		var coamappingkeyStr = ',' + coamappingkey.join(',') + ',';
		for (var i = 0; i < resultslice.length; i++) {// 将刷选放到前面 以不干扰后面逻辑
//			var nsaccountid = resultslice[i].getValue('account', null, 'group');// nsaccountnum
//			var dpt = resultslice[i].getValue('department', null, 'group');// department
//			var cls = resultslice[i].getValue('class', null, 'group');// class
//			var lct = resultslice[i].getValue('location', null, 'group');// location
//			// accnumber = resultslice[i].getValue(columns[0]);
//			// account = map.GetValue(accnumber).name;
//			// nlapiLogExecution('debug', 'nsaccountid', nsaccountid);
//			if (dept) {
//				nsaccountid += dpt;
//			}
//			if (cls) {
//				nsaccountid += cls;
//			}
//			if (lct) {
//				nsaccountid += lct;
//			}
//
//			// nlapiLogExecution('DEBUG', 'coamappingkeyStr/nsaccountid',
//			// coamappingkeyStr+"/"+nsaccountid);
//			if (coamappingkeyStr.indexOf(',' + nsaccountid + ',') >= 0) {
//				resultslicenew[resultslicenew.length] = resultslice[i];
//			}
			var ndcl = resultslice[i].getValue(columns[1]);
			if (ndcl == 1) {
				continue;
			}
			resultslicenew[resultslicenew.length] = resultslice[i];
		}
		for (var i = 0; i < resultslicenew.length; i++) {

			var temp = {};
			var allcols = resultslicenew[i].getAllColumns();
			credit = resultslicenew[i].getValue('creditamount', null, 'sum');
			debit = resultslicenew[i].getValue('debitamount', null, 'sum');
			period = resultslicenew[i].getValue('formulatext', null, 'group');
			periodEndDate = resultslicenew[i].getValue('enddate',
					'accountingPeriod', 'group');
			accountNum = resultslicenew[i].getValue(columns[0]);// cnaccountnum
			
			nlapiLogExecution('DEBUG', 'accountNum',accountNum);

			firstlevelaccountnum = accountNum.substring(0, 4);

			secondlevelaccountnum = accountNum.substring(0, 6);

			if (accountNum.length == 4) {
				accountNum = null;
				secondlevelaccountnum = null;
			} else if (accountNum.length == 6) {
				accountNum = null;
			}

			if (credit) {
				temp.credit = parseFloat(credit);
			} else {
				temp.credit = 0;
			}
			if (debit) {
				temp.debit = parseFloat(debit);
			} else {
				temp.debit = 0;
			}
			temp.period = period;
			temp.periodEndDate = periodEndDate;

			/*
			 * 添加一级科目
			 */
			if (map.Contains(firstlevelaccountnum)) {
				// var temparr=map.GetValue(firstlevelaccountnum);
				var ind = this.FirstLevelContains(map
						.GetValue(firstlevelaccountnum), 'period', period);
				if (ind == -1) {
					map.GetValue(firstlevelaccountnum).push(
							rule.ObjectClone(temp));
				} else {
					map.GetValue(firstlevelaccountnum)[ind].credit += temp.credit;
					map.GetValue(firstlevelaccountnum)[ind].debit += temp.debit;
				}
			} else {
				map.Add(firstlevelaccountnum, [ rule.ObjectClone(temp) ]);
			}

			/*
			 * 添加二级科目
			 */
			if (secondlevelaccountnum != null) {
				if (map.Contains(secondlevelaccountnum)) {
					// var temparr=map.GetValue(secondlevelaccountnum);

					var ind = this.FirstLevelContains(map
							.GetValue(secondlevelaccountnum), 'period', period);
					if (ind == -1) {
						map.GetValue(secondlevelaccountnum).push(
								rule.ObjectClone(temp));
					} else {
						map.GetValue(secondlevelaccountnum)[ind].credit += temp.credit;
						map.GetValue(secondlevelaccountnum)[ind].debit += temp.debit;
					}
				} else {
					map.Add(secondlevelaccountnum, [ rule.ObjectClone(temp) ]);
				}
			}

			/*
			 * 添加明细科目
			 */
			if (accountNum != null) {
				if (map.Contains(accountNum)) {
					map.GetValue(accountNum).push(rule.ObjectClone(temp));
				} else {
					map.Add(accountNum, [ rule.ObjectClone(temp) ]);
				}
			}

		}

		for (var j = 0; j < map.Count; j++) {
			var accountNum = map.ArrayList[j];
			 nlapiLogExecution('DEBUG', 'accountNum',accountNum);

			var tempArr = map.GetValue(accountNum);
			totalcredit = 0;
			totaldebit = 0;
			if (!beginbalanceMap.Contains(accountNum))
				beginbalance = 0;
			else
				beginbalance = parseFloat(beginbalanceMap.GetValue(accountNum));
			monthbeginbalance = beginbalance;
			var accountname = entityMap.GetValue(accountNum).name;
			if (!accountname) {
				var f = [ new nlobjSearchFilter('name', null, 'is', accountNum) ];
				var c = [ new nlobjSearchColumn(
						'custrecord_trigger_name_coa_cn') ];
				rtemp = nlapiSearchRecord('customrecord_trigger_cn_coa', null,
						f, c);
				accountname = rtemp[0].getValue(c[0]);
			}

			xml += template.GetLedgerContentXMLHead(year, accountNum + ' '
					+ accountname); // table head
			t = rule.GetCreditDebitText(beginbalance);
			xml += template.GetOpeningBalanceByYearXML(t[0], t[1]); // 年初余额
			for (var x = 0; x < tempArr.length; x++) {
				var temp = tempArr[x];
				period = temp.period;
				credit = temp.credit;
				debit = temp.debit;
				periodEndDate = temp.periodEndDate; // period end date. Has
				// format of M/D/YYYY

				var firstSlash = periodEndDate.indexOf('/');
				var lastSlash = periodEndDate.lastIndexOf('/');
				var endMonth = periodEndDate.substring(0, firstSlash);
				var endDay = periodEndDate.substring(firstSlash + 1, lastSlash);

				// var year = period.substr(0, 4);
				// var month = com.GetMonthByPeriod(period);
				// var periodtime = String.format("{0}/{1}/{2}", month, '1',
				// year);
				//
				// var temp = com.GetLastDay(periodtime);
				// day = temp.getDate();

				// content
				if (credit) {
					totalcredit += parseFloat(credit);
				} else {
					credit = 0;
				}
				if (debit) {
					totaldebit += parseFloat(debit);
				} else {
					debit = 0;
				}

				monthbeginbalance = monthbeginbalance - parseFloat(credit)
						+ parseFloat(debit);
				t_beginbalance = beginbalance + parseFloat(totaldebit)
						- parseFloat(totalcredit);
				t = rule.GetCreditDebitText(monthbeginbalance);
				xml += template.GetLedgerXML(endMonth, endDay, '本月合计', com
						.formatCurrency(credit), com.formatCurrency(debit),
						t[0], t[1]);

				t = rule.GetCreditDebitText(t_beginbalance);
				xml += template.GetLedgerXML(endMonth, endDay, '本年合计', com
						.formatCurrency(totalcredit), com
						.formatCurrency(totaldebit), t[0], t[1]);

			}
			xml += template.GetEndBalanceByYearXML(t[0], t[1]);
			xml += template.GetFooterXML;
		}

		if (resultslicenew.length <= 0) {
			return '';
		}
		return xml;
	},

	/**
	 * Get the total of amount by the records that any one of the chart of
	 * accounts
	 * 
	 * @param internalids
	 * @returns
	 */

	GetBalanceByYearBegin : function(filters, columns, accountid) {
		var result = 0;
		var map = new trigger.local.HashTable();
		if (filters.length <= 0) {
			return '';
		}
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_ledger_by_years');
		if (filters.length > 0) {
			savedsearch.addFilters(filters);
		}
		if (columns.length > 0) {
			savedsearch.addColumns(columns);
		}
		var resultset = savedsearch.runSearch();
		var resultslice = resultset.getResults(0, 1000);
		if (resultslice.length > 0) {
			for (var i = 0; i < resultslice.length; i++) {
				var ndcl = resultslice[i].getValue(columns[1]);
				if (ndcl == 1) {
					continue;
				}
				var credit = resultslice[i].getValue('creditamount', null,
						'SUM');
				var debit = resultslice[i].getValue('debitamount', null, 'SUM');
				var accountnumber = resultslice[i].getValue(columns[0]);
				var firstlevelaccountnum = accountnumber.substring(0, 4);
				var secondlevelaccountnum = accountnumber.substring(0, 6);
				if (accountnumber.length == 4) {
					accountnumber = null;
					secondlevelaccountnum = null;
				} else if (accountnumber.length == 6) {
					accountnumber = null;
				}
				if (!credit) {
					credit = 0;
				}
				if (!debit) {
					debit = 0;
				}
				result = parseFloat(debit) - parseFloat(credit);
				if (map.Contains(firstlevelaccountnum)) {
					map.HashArr[firstlevelaccountnum] += result;
				} else {
					map.Add(firstlevelaccountnum, result);
				}
				if (secondlevelaccountnum != null) {
					if (map.Contains(secondlevelaccountnum)) {

						map.HashArr[secondlevelaccountnum] += result;
					} else {
						map.Add(secondlevelaccountnum, result);
					}
				}
				if (accountnumber != null)
					map.Add(accountnumber, result);
			}
		}

		return map;

	},

	FirstLevelContains : function(arr, key, val) {
		for (var i = 0; i < arr.length; i++) {
			// nlapiLogExecution('debug',arr[i].key,val);
			if (arr[i][key] == val)
				return i;
		}
		return -1;
	}
};