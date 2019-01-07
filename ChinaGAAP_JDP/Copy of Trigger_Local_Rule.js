/**
 * Module Description: common rule functionality Version Date Author Remarks
 * 1.00 23 Oct 2014 Winson.Chen
 */

triggernamespace("trigger.local");
trigger.local.rule = function() {
}
trigger.local.rule.prototype = {
	constructor : trigger.local.rule,
	/**
	 * return search filters from account id array
	 * 
	 * @param id
	 * @returns
	 */
	GetCNCOAFilters : function(id) {
		if (!id) {
			return '';
		}
		var filters = [];
		var temp = [];
		var accountid = id.split(",");
		for (var i = 0; i < accountid.length; i++) {
			var formula = [
					'formulatext: {custrecord_trigger_cn_account_number}',
					'startswith' ];
			formula.push(accountid[i]);
			temp.push(formula);
			if (i < accountid.length - 1) {
				temp.push('OR');
			}
		}
		filters.push(temp);
		return filters;
	},

	/**
	 * return internal id array from saved search
	 * 
	 * @param filters
	 * @returns
	 */
	/*
	 * GetMappingCNCOA : function(filters) { if (!filters) {return 0;} var
	 * savedsearch = nlapiLoadSearch('customrecord_trigger_mapping_cn_coa',
	 * 'customsearch_trigger_mapping_cn_coa'); if (filters) {
	 * savedsearch.setFilterExpression(filters); } var resultset =
	 * savedsearch.runSearch(); var internalid = ''; var temp = []; var
	 * resultslice = resultset.getResults(0, 1000); if(resultslice.length<=0){return
	 * '';} for ( var rs in resultslice) { //internalid =
	 * resultslice[rs].getValue('internalid',
	 * 'CUSTRECORD_TRIGGER_NETSUITE_ACCOUNT', null); internalid =
	 * resultslice[rs].getValue('custrecord_trigger_ns_account_id', null, null);
	 * temp.push(internalid); } return temp; },
	 */
	/**
	 * return internal id array from saved search
	 * 
	 * @param filters
	 * @returns
	 */
	GetMappingCNCOA : function(filters) {

		if (!filters) {
			return 0;
		}
		var columns = [];
		// 改成返回nsaccountid+dpt+cls+lct joe
		columns[0] = new nlobjSearchColumn('custrecord_trigger_ns_account_id',
				null, 'GROUP');
		columns[1] = new nlobjSearchColumn(
				'custrecord_trigger_cn_account_number', null, 'GROUP');
		columns[2] = new nlobjSearchColumn('custrecord_trigger_ns_department',
				null, 'GROUP');
		columns[3] = new nlobjSearchColumn('custrecord_trigger_ns_class', null,
				'GROUP');
		columns[4] = new nlobjSearchColumn('custrecord_trigger_ns_location',
				null, 'GROUP');
		columns[5] = new nlobjSearchColumn('custrecord_trigger_one_to_many',
				null, 'GROUP');
		var savedsearch = nlapiCreateSearch(
				'customrecord_trigger_mapping_cn_coa', null, columns);
		if (filters) {
			savedsearch.setFilterExpression(filters);
		}
		var resultset = savedsearch.runSearch();
		var internalid = '';
		var temp = [];
		var searchid = 0;
		do {
			var resultslice = resultset.getResults(searchid, searchid + 1000);
			if (resultslice.length <= 0) {
				return '';
			}
			for ( var rs in resultslice) {
				internalid = resultslice[rs].getValue(columns[0]);
				dept = resultslice[rs].getValue(columns[2]);
				cls = resultslice[rs].getValue(columns[3]);
				location = resultslice[rs].getValue(columns[4]);
				ismultiple = resultslice[rs].getValue(columns[5]);
				if (ismultiple && ismultiple == 'T') {
					if (dept) {
						internalid += dept;
					}
					if (cls) {
						internalid += cls;
					}
					if (location) {
						internalid += location;
					}
				}
				temp.push(internalid);
			}
		} while (resultslice.length >= 1000);
		// nlapiLogExecution('debug', 'temp',temp);
		return temp;
	},
	// joe 查询原始的nsaccountid
	GetMappingCNCOA1 : function(filters) {
		if (!filters) {
			return 0;
		}
		var columns = [];
		columns[0] = new nlobjSearchColumn('custrecord_trigger_ns_account_id',
				null, 'GROUP');
		columns[1] = new nlobjSearchColumn(
				'custrecord_trigger_cn_account_number', null, 'GROUP');
		var savedsearch = nlapiCreateSearch(
				'customrecord_trigger_mapping_cn_coa', null, columns);
		if (filters) {
			savedsearch.setFilterExpression(filters);
		}
		var resultset = savedsearch.runSearch();
		// nlapiLogExecution('debug', 'resultset=',resultset);//add by joe
		// 180105
		var internalid = '';
		var temp = [];
		var searchid = 0;
		do {
			var resultslice = resultset.getResults(searchid, searchid + 1000);
			if (resultslice.length <= 0) {
				return '';
			}
			for ( var rs in resultslice) {
				internalid = resultslice[rs].getValue(columns[0]);
				var an = resultslice[rs].getValue(columns[1]);
				// nlapiLogExecution('debug',
				// 'cn_account_number&ns_account_id',an+"&"+internalid);//add by
				// joe 180105
				temp.push(internalid);
			}
		} while (resultslice.length >= 1000);
		return temp;
	},

	GetIsJoinCostCenter : function() {
		var map = new trigger.local.HashTable();
		var columns = [];
		columns[0] = new nlobjSearchColumn('custrecord_trigger_ns_account_id',
				null, 'GROUP');
		var filters = [];
		filters[0] = new nlobjSearchFilter('custrecord_trigger_one_to_many',
				null, 'is', 'T');

		var savedsearch = nlapiCreateSearch(
				'customrecord_trigger_mapping_cn_coa', filters, columns);
		// result for search
		var resultset = savedsearch.runSearch();
		var internalid = '';
		var searchid = 0;
		do {
			var resultslice = resultset.getResults(searchid, searchid + 1000);
			for ( var rs in resultslice) {
				internalid = resultslice[rs].getValue(
						'custrecord_trigger_ns_account_id', null, 'GROUP');

				// nlapiLogExecution('debug', 'costconter',internalid);
				map.Add(internalid, internalid);
				searchid++;
			}
		} while (resultslice.length >= 1000);
		return map;
	},

	/**
	 * return mapping records one by one from internal id, account number,
	 * account name
	 * 
	 * @returns {trigger.local.HashTable}
	 */
	GetSubLedgerCOAAccountList : function() {
		var map = new trigger.local.HashTable();
		var columns = [];
		columns[0] = new nlobjSearchColumn(
				'custrecord_trigger_cn_account_number', null, 'GROUP');
		columns[1] = new nlobjSearchColumn('custrecord_trigger_name_coa_cn',
				'custrecord_trigger_cn_account_number', 'GROUP');
		var savedsearch = nlapiCreateSearch(
				'customrecord_trigger_mapping_cn_coa', null, columns);
		var resultset = savedsearch.runSearch();
		var accountnumber = '';
		var name = '';
		var searchid = 0;
		do {
			var resultslice = resultset.getResults(searchid, searchid + 1000);
			for ( var rs in resultslice) {
				accountnumber = resultslice[rs].getText(columns[0]);
				name = resultslice[rs].getValue(columns[1]);
				map.Add(accountnumber, new trigger.local.HashEntity(
						accountnumber, name));
				searchid++;
			}
		} while (resultslice.length >= 1000);
		return map;
	},

	GetCOAAccountList : function() {
		var map = new trigger.local.HashTable();
		var tags = this.GetCostCenterTags();
		var columns = [];
		columns[0] = new nlobjSearchColumn('custrecord_trigger_ns_account_id',
				null, null);
		columns[1] = new nlobjSearchColumn(
				'custrecord_trigger_cn_account_number', null, null);
		columns[2] = new nlobjSearchColumn('custrecord_trigger_name_coa_cn',
				'custrecord_trigger_cn_account_number', null);
		columns[3] = new nlobjSearchColumn('custrecord_trigger_ns_department',
				null, null);
		columns[4] = new nlobjSearchColumn('custrecord_trigger_ns_class', null,
				null);
		columns[5] = new nlobjSearchColumn('custrecord_trigger_ns_location',
				null, null);
		columns[6] = new nlobjSearchColumn('custrecord_trigger_one_to_many',
				null, null);

		var savedsearch = nlapiCreateSearch(
				'customrecord_trigger_mapping_cn_coa', null, columns);
		// result for search
		var resultset = savedsearch.runSearch();
		var internalid = '';
		var accountnumber = '';
		var name = '';
		var cls = '';
		var dept = '';
		var location = '';
		var ismultiple = '';
		var searchid = 0;
		do {
			var resultslice = resultset.getResults(searchid, searchid + 1000);
			for ( var rs in resultslice) {
				internalid = resultslice[rs].getValue(
						'custrecord_trigger_ns_account_id', null, null);
				accountnumber = resultslice[rs].getText(
						'custrecord_trigger_cn_account_number', null, null);
				name = resultslice[rs].getValue(
						'custrecord_trigger_name_coa_cn',
						'custrecord_trigger_cn_account_number', null);
				cls = resultslice[rs].getValue('custrecord_trigger_ns_class',
						null, null);
				dept = resultslice[rs].getValue(
						'custrecord_trigger_ns_department', null, null);
				location = resultslice[rs].getValue(
						'custrecord_trigger_ns_location', null, null);
				ismultiple = resultslice[rs].getValue(
						'custrecord_trigger_one_to_many', null, null);
				if (ismultiple && ismultiple == 'T') {
					if (tags.DEPARTMENT == true && dept) {
						internalid += dept;
					}
					if (tags.CLASS == true && cls) {
						internalid += cls;
						// nlapiLogExecution('DEBUG', 'internalid+cls',
						// internalid);
					}
					if (tags.LOCATION == true && location) {
						internalid += location;
					}
					// nlapiLogExecution('DEBUG', internalid, accountnumber +
					// name);// china
					// accountnumber+
					// china
					// accountname
					// 66010101营业费用
					// -
					// 广告费
					// -
					// China
					// Gaap
					// Test
				}
				// nlapiLogExecution('ERROR', internalid,accountnumber+name);

				map.Add(internalid, new trigger.local.HashEntity(accountnumber,
						name));
				searchid++;
			}
		} while (resultslice.length >= 1000);
		return map;
	},

	// 保存nsaccountname 和 dpt cls lct by joe 20180123
	// GetNSAccountList : function() {
	// var map = new trigger.local.HashTable();
	// var tags = this.GetCostCenterTags();
	// var columns = [];
	// columns[0] = new nlobjSearchColumn('custrecord_trigger_ns_account_id',
	// null, null);
	// columns[1] = new nlobjSearchColumn(
	// 'custrecord_trigger_cn_account_number', null, null);
	// columns[2] = new nlobjSearchColumn(
	// 'custrecord_trigger_netsuite_account', null, null);
	// columns[3] = new nlobjSearchColumn('custrecord_trigger_ns_department',
	// null, null);
	// columns[4] = new nlobjSearchColumn('custrecord_trigger_ns_class', null,
	// null);
	// columns[5] = new nlobjSearchColumn('custrecord_trigger_ns_location',
	// null, null);
	// columns[6] = new nlobjSearchColumn('custrecord_trigger_one_to_many',
	// null, null);
	//
	// var savedsearch = nlapiCreateSearch(
	// 'customrecord_trigger_mapping_cn_coa', null, columns);
	// // result for search
	// var resultset = savedsearch.runSearch();
	// var internalid = '';
	// var accountnumber = '';
	// var name = '';
	// var cls = '';
	// var dept = '';
	// var location = '';
	// var ismultiple = '';
	// var searchid = 0;
	// do {
	// var resultslice = resultset.getResults(searchid, searchid + 1000);
	// for ( var rs in resultslice) {
	// accountid = resultslice[rs].getValue(
	// 'custrecord_trigger_ns_account_id', null, null);
	// netsuiteaccountnumber = resultslice[rs].getText(
	// 'custrecord_trigger_netsuite_account', null, null);
	// cls = resultslice[rs].getValue('custrecord_trigger_ns_class',
	// null, null);
	// dept = resultslice[rs].getValue(
	// 'custrecord_trigger_ns_department', null, null);
	// location = resultslice[rs].getValue(
	// 'custrecord_trigger_ns_location', null, null);
	// ismultiple = resultslice[rs].getValue(
	// 'custrecord_trigger_one_to_many', null, null);
	//
	// var dcl;
	// if (ismultiple && ismultiple == 'T') {
	// if (tags.DEPARTMENT == true && dept) {
	// dcl += dept;
	// }
	// if (tags.CLASS == true && cls) {
	// dcl += cls;
	// // nlapiLogExecution('DEBUG', 'internalid+cls',
	// // internalid);
	// }
	// if (tags.LOCATION == true && location) {
	// dcl += location;
	// }
	// // nlapiLogExecution('DEBUG', internalid, accountnumber +
	// // name);// china
	// // accountnumber+
	// // china
	// // accountname
	// // 66010101营业费用
	// // -
	// // 广告费
	// // -
	// // China
	// // Gaap
	// // Test
	// map.Add(accountid, dcl);
	// }
	// // nlapiLogExecution('ERROR', internalid,accountnumber+name);
	// searchid++;
	// }
	// } while (resultslice.length >= 1000);
	// return map;
	// },
	GetOTMForMappingCNCOA : function(id, accountid) {// accountid:204
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
		var resultslice = resultset.getResults(0, 1000);

		// joe
		var chinaaccounts = accountid.split(",");
		var tags = this.GetCostCenterTags();
		var keys = [];
		for ( var rs in resultslice) {
			internalid = resultslice[rs].getValue('formulatext', null, null);
			if (internalid == 1) {
				continue;
			}
			number = resultslice[rs].getText(
					'custrecord_trigger_cn_account_number', null, null);
			name = resultslice[rs].getValue('custrecord_trigger_name_coa_cn',
					'custrecord_trigger_cn_account_number', null);

			// oTm by joe 20180124
			// accountid = resultslice[rs].getValue(
			// 'custrecord_trigger_ns_account_id', null, null);
			cls = resultslice[rs].getValue('custrecord_trigger_ns_class', null,
					null);
			dept = resultslice[rs].getValue('custrecord_trigger_ns_department',
					null, null);
			location = resultslice[rs].getValue(
					'custrecord_trigger_ns_location', null, null);
			ismultiple = resultslice[rs].getValue(
					'custrecord_trigger_one_to_many', null, null);

			var key = internalid;
			for ( var i in chinaaccounts) {// 加入chinaaccount的判断 onetomore
				if (chinaaccounts[i] == number) {
					if (ismultiple && ismultiple == 'T') {
						if (tags.DEPARTMENT == true && dept) {
							key += '|' + dept;
						}
						if (tags.CLASS == true && cls) {
							key += '|' + cls;
						}
						if (tags.LOCATION == true && location) {
							key += '|' + location;
						}
						// nlapiLogExecution('DEBUG', internalid, accountnumber
						// + name);//china accountnumber+ china accountname
						// 66010101营业费用 - 广告费 - China Gaap Test
					}
					// nlapiLogExecution('DEBUG', 'dcl', dcl);
					keys[i] = key;
				}
			}
		}
		// nlapiLogExecution('debug', 'keys', keys);
		return keys;
	},
	/**
	 * 杩斿洖涓浗鏌愪釜ACCOUNT ID 鍒楄〃MAPPING ID闆嗗悎
	 * 
	 * @param accountid
	 * @returns
	 */
	GetMappingIdList : function(accountid) {
		if (accountid <= 0) {
			return '';
		}
		var tags = this.GetCostCenterTags();
		var internalid = '';
		var accountnumber = '';
		var name = '';
		var ismultiple = '';
		var departmentid = '';
		var classid = '';
		var locationid = '';
		var temp;
		var filterexpression = this.GetCNCOAFilters(accountid);

		var accidarr = accountid.split(',');
		var t = accidarr[0].length;
		for (var i = 1; i < accidarr.length; i++) {
			t = accidarr[i].length > t ? t : accidarr[i].length;
		}
		// nlapiLogExecution('ERROR',
		// 'filterexpression',String.format("{0}/{1}",filterexpression,accountid));

		var formula = "{custrecord_trigger_ns_account_id}||{custrecord_trigger_ns_department.internalid}||";
		formula += "{custrecord_trigger_ns_class.internalid}||{custrecord_trigger_ns_location.internalid}";
		var columns = [];
		columns[0] = new nlobjSearchColumn('formulatext', null, null);
		columns[0].setFormula(formula);
		columns[1] = new nlobjSearchColumn('formulatext', null, null);
		columns[1]
				.setFormula("SUBSTR({custrecord_trigger_cn_account_number.name},0,"
						+ t + ")");
		columns[2] = new nlobjSearchColumn('custrecord_trigger_one_to_many',
				null, null);
		columns[3] = new nlobjSearchColumn('internalid',
				'custrecord_trigger_ns_department', null);
		columns[4] = new nlobjSearchColumn('internalid',
				'custrecord_trigger_ns_class', null);
		columns[5] = new nlobjSearchColumn('internalid',
				'custrecord_trigger_ns_location', null);

		var savedsearch = nlapiCreateSearch(
				'customrecord_trigger_mapping_cn_coa', filterexpression,
				columns);

		var resultset = savedsearch.runSearch();

		var searchid = 0;
		var map = new trigger.local.HashTable();
		do {
			var resultslice = resultset.getResults(searchid, searchid + 1000);

			for ( var rs in resultslice) {
				internalid = resultslice[rs].getValue(columns[0]);
				accountnumber = resultslice[rs].getValue(columns[1]);
				ismultiple = resultslice[rs].getValue(
						'custrecord_trigger_one_to_many', null, null);
				departmentid = resultslice[rs].getValue('internalid',
						'custrecord_trigger_ns_department', null);
				classid = resultslice[rs].getValue('internalid',
						'custrecord_trigger_ns_class', null);
				locationid = resultslice[rs].getValue('internalid',
						'custrecord_trigger_ns_location', null);
				temp = '{account.internalid}';
				if (tags.DEPARTMENT == true && departmentid) {
					temp += "||{department.internalid}";
				}
				if (tags.CLASS == true && classid) {
					temp += "||{class.internalid}";
				}
				if (tags.LOCATION == true && locationid) {
					temp += "||{location.internalid}";
				}
				map.Add(internalid, new trigger.local.HashEntity(accountnumber,
						[ ismultiple, temp ]));
				searchid++;
				// nlapiLogExecution('ERROR', 'ACCOUNTNUMBER'+internalid,
				// accountnumber);
			}
		} while (resultslice.length >= 1000);
		return map;
	},

	GetMergeObject : function(o, n) {
		for (var i = 0; i < n.Count; i++) {
			id = n.ArrayList[i];
			number = n.GetValue(id).internalid;
			arrvalue = n.GetValue(id).name;
			o.Add(id, new trigger.local.HashEntity(number, arrvalue));
		}
		return o;
	},

	GetMergeAllObject : function(map) {
		for (var m = 0; m < map.length - 1; m++) {
			for (var i = 0; i < map[m + 1].Count; i++) {
				id = map[m + 1].ArrayList[i];
				number = map[m + 1].GetValue(id).internalid;
				arrvalue = map[m + 1].GetValue(id).name;

				if (map[0].Contains(number) == true) {
					var temp = map[0].GetValue(id).name;
					// nlapiLogExecution('ERROR', number,temp);

					if (!temp) {
						temp = [ 0, 0 ];
					}
					if (!arrvalue) {
						arrvalue = [ 0, 0 ];
					}
					arrvalue[0] = parseFloat(arrvalue[0]) + parseFloat(temp[0]);
					arrvalue[1] = parseFloat(arrvalue[1]) + parseFloat(temp[1]);
					map[0].Remove(id);
				}

				map[0].Add(id, new trigger.local.HashEntity(number, arrvalue));

				// nlapiLogExecution('AUDIT', number,arrvalue);
			}
		}
		return map[0];
	},

	/**
	 * 鏈熷垵锛屽勾鍒濇暟鎹� At the beginning of the period, the beginning of the data
	 */
	GetSummaryLedgerRecordsByAllOfNumber : function(filters, column, m) {
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
		var resultslice = resultset.getResults(0, 1000);

		for ( var rs in resultslice) {
			var credit = resultslice[rs].getValue('creditamount', null, 'SUM');
			var debit = resultslice[rs].getValue('debitamount', null, 'SUM');
			var number = resultslice[rs].getValue(column);
			if (!number || number == "0") {
				continue;
			}
			if (!credit) {
				credit = 0;
			}
			if (!debit) {
				debit = 0;
			}
			map.Add(number, new trigger.local.HashEntity(number, [ credit,
					debit ]));

			// nlapiLogExecution('debug', 'result',String.format(//
			// "{0}/{1}/{2}",number,credit,debit));
		}
		return map;
	},

	/**
	 * From the beginning of the year(included) until chosen period (not
	 * included) For P&L (income)accounts only
	 */
	GetSummaryLedgerRecordsForIncomeAccounts : function(filters, column) {
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_pl_trial_blnc');
		if (filters.length > 0) {
			savedsearch.addFilters(filters);
			filters = savedsearch.getFilters();
		}
		if (column) {
			savedsearch.addColumns([ column ]);
		}
		var resultset = savedsearch.runSearch();
		var map = new trigger.local.HashTable();
		var resultslice = resultset.getResults(0, 1000);

		for ( var rs in resultslice) {
			var credit = resultslice[rs].getValue('creditamount', null, 'SUM');
			var debit = resultslice[rs].getValue('debitamount', null, 'SUM');
			var number = resultslice[rs].getValue(column);
			if (!number || number == "0") {
				continue;
			}
			if (!credit) {
				credit = 0;
			}
			if (!debit) {
				debit = 0;
			}
			map.Add(number, new trigger.local.HashEntity(number, [ credit,
					debit ]));

			nlapiLogExecution('debug', 'result', String.format(//
			"{0}/{1}/{2}", number, credit, debit));
		}
		return map;
	},

	/**
	 * Get level of one of the chart of account
	 * 
	 * @returns
	 */
	GetIdListOfLevelOneByCNCOA : function() {
		var savedsearch = nlapiLoadSearch('customrecord_trigger_cn_coa',
				'customsearch_trigger_level_1_cn_coa');
		var resultset = savedsearch.runSearch();
		var resultslice = resultset.getResults(0, 1000);
		var arr = [];
		for ( var rs in resultslice) {
			var cnnumber = resultslice[rs].getValue('name', null, null);
			arr.push(cnnumber);
		}
		return arr;
	},

	GetIdArrayListOfLevelOneOfCNCOA : function() {
		var savedsearch = nlapiLoadSearch('customrecord_trigger_cn_coa',
				'customsearch_trigger_level_1_cn_coa');
		var resultset = savedsearch.runSearch();
		var resultslice = resultset.getResults(0, 1000);
		var arr1 = [];// for income accounts (P&L)
		var arr2 = [];// all the rest accounts
		var list = [];
		for ( var rs in resultslice) {
			var cnnumber = resultslice[rs].getValue('name', null, null);
			if (!cnnumber) {
				continue;
			}

			if (cnnumber.substring(0, 1) == "5") {// income accounts
				arr1.push(cnnumber);
			} else {
				arr2.push(cnnumber);
			}
		}
		list.push(arr1);
		list.push(arr2);
		return list;
	},

	/**
	 * get sql from mapping records by accountid array
	 * 
	 * @param accountid
	 * @returns {String}
	 */
	GetSQLFromMappingRecords : function(accountid) {
		if (!accountid) {
			return '';
		}
		var arrid = accountid.split(",");

		var id;
		var list = [];
		var multiplelist = [];
		var arrvalue = [];
		var strvalue;
		var number = '';
		var sql = [];
		var tempsql = [];
		var tempmultiplesql = [];
		var map = this.GetMappingIdList(accountid);
		for (var n = 0; n < arrid.length; n++) {
			// var str = arrid[n];
			for (var i = 0; i < map.Count; i++) {
				id = map.ArrayList[i];
				number = map.GetValue(id).internalid;
				arrvalue = map.GetValue(id).name;
				// nlapiLogExecution('debug', 'number&arrvalue' + n, number +
				// '&'
				// + arrvalue);
				if (!number) {
					continue;
				}
				if (arrid[n] == number) {
					if (arrvalue.length > 0 && arrvalue[0] == 'F') {
						list.push(id);
					} else {
						multiplelist.push(id);
						strvalue = arrvalue[1];
					}
				}

			}

			if (list.length > 0) {
				// nlapiLogExecution('debug', 'list'+n,list);
				tempsql.push(String.format(
						"WHEN{account.internalid}IN{0}{1}{2}THEN {3} ", '(',
						list, ')', arrid[n]));
			}
			// nlapiLogExecution('debug',
			// 'multiplelist.length',multiplelist.length);
			if (multiplelist.length > 0) {
				if (multiplelist.length <= 100000) {
					tempmultiplesql.push(String.format(
							"WHEN TO_NUMBER({0})IN{1}{2}{3}THEN {4} ",
							strvalue, '(', multiplelist, ')', arrid[n]));
				} else {
					var newarrsql = this.GetNewArray(multiplelist, 650);

					for (var m = 0; m < newarrsql.length; m++) {
						tempmultiplesql.push(String.format(
								"WHEN TO_NUMBER({0})IN{1}{2}{3}THEN {4} ",
								strvalue, '(', newarrsql[m], ')', arrid[n]));
						// nlapiLogExecution('debug',
						// 'multiplelist'+n,newarrsql[n]);
					}
				}
			}
			list = [];
			multiplelist = [];
		}
		var finallysql = [];
		var tempstr = tempsql.join(" ") + " " + tempmultiplesql.join(" ");
		// total of sql characters is upper to 4000, so it need to split
		// it.//鍦ㄨ剼鏈噷鍐檉ormula鏄病鏈�4000瀛楃鐨勯檺鍒剁殑
		if (tempstr.length > (100000 - 16)) {
			finallysql.push(String.format("CASE {0} ELSE 0 END", tempsql
					.join(" ")));
			for (var x = 0; x < tempmultiplesql.length; x++) {
				finallysql.push(String.format("CASE {0} ELSE 0 END",
						tempmultiplesql[x]));
			}
			return finallysql;
		}
		finallysql.push(String.format("CASE {0} ELSE 0 END", tempstr));
		return finallysql;
	},

	GetCostCenterTags : function() {
		var columns = [];
		columns[0] = new nlobjSearchColumn('formulanumeric', null, 'SUM');
		columns[0]
				.setFormula("CASE WHEN {custrecord_trigger_ns_department} IS NOT NULL THEN 1 ELSE 0 END");
		columns[1] = new nlobjSearchColumn('formulanumeric', null, 'SUM');
		columns[1]
				.setFormula("CASE WHEN {custrecord_trigger_ns_location} IS NOT NULL THEN 1 ELSE 0 END");
		columns[2] = new nlobjSearchColumn('formulanumeric', null, 'SUM');
		columns[2]
				.setFormula("CASE WHEN {custrecord_trigger_ns_class} IS NOT NULL THEN 1 ELSE 0 END");

		var savedsearch = nlapiCreateSearch(
				'customrecord_trigger_mapping_cn_coa', null, columns);
		// result for search
		var resultset = savedsearch.runSearch();
		var clsbool = false;
		var deptbool = false;
		var locationbool = false;
		var resultslice = resultset.getResults(0, 1);
		for ( var rs in resultslice) {
			var dept = resultslice[rs].getValue(columns[0]);
			var location = resultslice[rs].getValue(columns[1]);
			var cls = resultslice[rs].getValue(columns[2]);

			if (cls && parseInt(cls) > 0) {
				clsbool = true;
			}
			if (dept && parseInt(dept) > 0) {
				deptbool = true;
			}
			if (location && parseInt(location) > 0) {
				locationbool = true;
			}
		}
		return {
			"DEPARTMENT" : deptbool,
			"CLASS" : clsbool,
			"LOCATION" : locationbool
		}
	},

	GetNewArray : function(myArray, size) {
		var len = parseInt(myArray.length / size);
		var remain = myArray.length % size;
		var my_array = [], count = 1, sot = remain > 0 ? len + 1 : len;
		for (var f = 1; f <= sot; f++) {
			var start = size * (f - 1);
			var end = (f > len) ? ((f - 1) * size + remain) : f * size;
			var mylocates = myArray.slice(start, end);
			my_array.push(mylocates);
		}
		return my_array;
	},

	/**
	 * Get subsidiary list from saved search
	 */
	GetSubsidiary : function() {
		try {
			var search = nlapiLoadSearch('subsidiary',
					'customsearch_trigger_subsidiary');
			var resultset = search.runSearch();
			var resultslice = resultset.getResults(0, 200);
			return resultslice;
		} catch (e) {
			var rts = {};
			var resultslice = [ rts ];
			rts.getValue = function(str) {
				if (str == 'formulatext') {
					return nlapiLoadConfiguration('companyinformation')
							.getFieldValue('companyname');
				}
				if (str == 'internalid')
					return '-1';
			};
			return resultslice;
		}
	},
	/**
	 * return name
	 * 
	 * @returns
	 */
	GetUserNameById : function() {
		var userid = nlapiGetUser();
		var username = nlapiLookupField('employee', userid, [ 'entityid',
				'custentity_chinese_name' ]);
		return username;
	},

	/*
	 * return array
	 */
	GetCreditDebitText : function(amount) {
		var arr = [];
		if (amount > 0) {
			arr = [ '借', com.formatCurrency(amount) ];
		}
		if (amount < 0) {
			arr = [ '贷', com.formatCurrency(amount * -1) ];
		}
		if (com.formatCurrency(amount) == '0.00') {
			arr = [ '平', '0.00' ];
		}
		return arr;
	},
	ObjectClone : function(obj) {
		if (typeof (obj) != 'object' || obj == null)
			return obj;
		var newObj = new Object();
		for ( var i in obj) {
			newObj[i] = obj[i];
		}
		return newObj;
	}
}