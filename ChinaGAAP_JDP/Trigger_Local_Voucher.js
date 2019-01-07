/**
 * Copyright Trigger Networks, Inc. 2014 All rights reserved. Module Description
 * Voucher Reports Version Date Author Remarks 1.00 05 Aug 2014 Winson.Chen
 * 
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.voucher = function() {
}
trigger.local.voucher.prototype = {
	constructor : trigger.local.voucher,
	writeVoucherToPDF : function(subsidiaryid, periodid, accountid, period,// ����
	// ����
	// ��Ŀ
	// ��ʼ��������
	voucherDateFrom, voucherDateTo, response) {
		var fromToPeriod = null;
		var filter = [];
		var filters = [];

		var serialNumber = 1;

		var halfMonthFilter = []; // 前半月的条件
		if (accountid) {
			var filterexpression = rule.GetCNCOAFilters(accountid);// �õ���Ŀid
			// ����
			var internalids = rule.GetMappingCNCOA(filterexpression);// 1��ͨ��mappingId��ѯ����ns_account_id�������ظ���������ͬ�����Ų�ͬ��
			if (internalids.length > 0) {
				filters[filters.length] = new nlobjSearchFilter('internalid',// ��������
				'account', 'anyof', internalids);

				// joe
				halfMonthFilter[halfMonthFilter.length] = new nlobjSearchFilter(
						'internalid', 'account', 'anyof', internalids);
			}
		}
		if (subsidiaryid && subsidiaryid != '-1') {
			filters[filters.length] = new nlobjSearchFilter('subsidiary', null,
					'anyof', subsidiaryid);
			filter[filter.length] = new nlobjSearchFilter('subsidiary', null,
					'anyof', subsidiaryid);
			// joe
			halfMonthFilter[halfMonthFilter.length] = new nlobjSearchFilter(
					'subsidiary', null, 'anyof', subsidiaryid);
		}

		var isNeedCalculate = false;
		if (voucherDateFrom && voucherDateTo) {
			filters[filters.length] = new nlobjSearchFilter('trandate', null,
					'within', voucherDateFrom, voucherDateTo);
			filter[filter.length] = new nlobjSearchFilter('trandate', null,
					'within', voucherDateFrom, voucherDateTo);
			fromToPeriod = voucherDateFrom + '-' + voucherDateTo;

			var voucherDateFroms = voucherDateFrom.split('/');
			// nlapiLogExecution('debug', 'voucherDateFrom',
			// typeof voucherDateFrom);
			// nlapiLogExecution('debug', fromToPeriod);
			// 如果开始日期为16号则需要计算
			if (voucherDateFroms[1] == '16') {
				isNeedCalculate = true;

				// joe
				var voucherDateFrom1 = voucherDateFroms[0] + '/1/'
						+ voucherDateFroms[2];
				var voucherDateFrom15 = voucherDateFroms[0] + '/15/'
						+ voucherDateFroms[2];
				halfMonthFilter[halfMonthFilter.length] = new nlobjSearchFilter(
						'trandate', null, 'within', voucherDateFrom1,
						voucherDateFrom15);

				// joe new
				var arrHalfMonth = this.GetDistinctNumbersByID(halfMonthFilter);// 得到前半个月的JEinternalid
				serialNumber = arrHalfMonth.length + 1;
				// nlapiLogExecution('debug', 'serialNumber',
				// serialNumber);
			}
		} else if (periodid) {
			filters[filters.length] = new nlobjSearchFilter('postingperiod',
					null, 'abs', [ periodid ]);
			filter[filter.length] = new nlobjSearchFilter('postingperiod',
					null, 'abs', [ periodid ]);
		}

		var arr = this.GetDistinctNumbersByID(filters);// 得到选择日期的JE的internalid

		var xml = '';
		if (arr.length > 0) {
			filter[filter.length] = new nlobjSearchFilter('internalid', null,
					'anyof', arr);

			// employee name
			var subsidiaryrec = rule.GetSubsidiary();// ��ѯ���л���
			var subsidiaryid = [];
			for ( var rs in subsidiaryrec) {
				var internalid = subsidiaryrec[rs].getValue('internalid', null,
						null);
				subsidiaryid.push(internalid);// �õ����л���id
			}
			var map = new trigger.local.employee()
					.GetEmployeesList(subsidiaryid);

			if (fromToPeriod) {
				xml = this.GetVoucherResultXML(filter, fromToPeriod, map,
						serialNumber);
			} else {
				xml = this.GetVoucherResultXML(filter, period, map,
						serialNumber);// 3���õ�xml
			}

			if (xml) {
				xml = template.GetVoucherXMLHead + xml;
				xml += template.GetPDFClosingTagXML;
			}
		}
		var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
		filename = "Voucher-" + filename + ".PDF";

		new trigger.local.write().WriteXMLToPDF(response, xml, filename);
	},

	/**
	 * according on current condition, calculate total number of records. if
	 * total number of records had over 8000, the PDF file's size will be over
	 * 5MB
	 * 
	 * @param filters
	 * @returns {Number}
	 */
	GetTotalNumberOfRecords : function(filters) {
		if (!filters) {
			return 0;
		}
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_total_of_records');
		if (filters) {
			savedsearch.addFilters(filters);
		}
		var resultset = savedsearch.runSearch();
		var number = 0;
		var resultslice = resultset.getResults(0, 1);
		if (resultslice && resultslice.length > 0) {
			number = resultslice[0].getValue('formulatext', null, 'count');
		}
		return number;
	},

	GetDistinctNumbersByID : function(filters) {
		var columns = [];
		columns[0] = new nlobjSearchColumn('internalid', null, 'group');
		var savedsearch = nlapiCreateSearch('transaction', filters, columns);
		var resultset = savedsearch.runSearch();
		var searchid = 0;
		var arr = [];
		do {
			var resultslice = resultset.getResults(searchid, searchid + 1000);
			for ( var rs in resultslice) {
				var number = resultslice[rs].getValue('internalid', null,
						'group');
				// nlapiLogExecution('debug', 'number',number);//add by joe
				// 180105 7625
				arr.push(number);
				searchid++;
			}
		} while (resultslice.length >= 1000);
		return arr;
	},

	/**
	 * Get result of the Voucher from saved search.
	 * 
	 * @param {jeinternalid}
	 *            journal entry id
	 * @param {jedatearr}
	 *            journal entry date range
	 * @returns {String}
	 */
	GetVoucherResultXML : function(filters, period, namemap, serialNumber) {
		var serialNum = serialNumber;
		var xml = '';
		var map = rule.GetCOAAccountList();// �õ�ns��Ŀ�б�
		var date = period;

		var n = 0;
		var m = 45;
		var x = 0;
		var rows = 0;
		var rowsdetail = 0;
		var isfirst = true;
		var number = '';
		var nextnumber = '';
		var internalid;
		var memo = '';
		var levelonename = '';
		var detailname = '';
		var foreign = 0;
		var rate = 0;
		var credit = 0;
		var debit = 0;
		var createbyid = '';
		var createby = '';
		// var setbyid = '';
		// var setby = '';
		var transtype = '';
		var transcurrency = '';
		var transdate = '';
		var totalcredit = 0;
		var totaldebit = 0;
		var searchid = 0;
		var resultslice = this.GetVoucherResults(filters);// ��ѯtransaction
		// nlapiLogExecution('debug', 'count1', resultslice.length);
		var oneToManyMap = rule.GetIsJoinCostCenter();// �õ�һ�Զ�id
		for (var i = 0; i < resultslice.length; i++) {
			number = resultslice[i].getValue('number', null, null);
			if (i < resultslice.length - 1) {
				nextnumber = resultslice[i + 1].getValue('number', null, null);
				// nlapiLogExecution('debug', 'number|nextnumber', number + '|'
				// + nextnumber);
			}
			internalid = resultslice[i].getValue('internalid', 'account', null);
			// nlapiLogExecution('debug', 'internalid', internalid);//add by joe
			// 180105
			transtype = resultslice[i].getText('type', null, null);
			transcurrency = resultslice[i].getText('currency', null, null);
			transdate = resultslice[i].getValue('trandate', null, null);

			// create name or chinese name
			createbyid = resultslice[i].getValue('createdby', null, null);
			createby = resultslice[i].getText('createdby', null, null);
			// setbyid = resultslice[i].getValue('name', 'systemnotes', null);
			// setby='';
			createbyid = resultslice[i].getValue('createdby', null, null);

			var chinesename = namemap.GetValue(createbyid).name;
			if (chinesename) {
				createby = chinesename;
			}
			// chinesename = namemap.GetValue(setbyid).name;
			// if(chinesename){setby = chinesename;}
			memo = resultslice[i].getValue('memo', null, null);
			memo = com.replaceSpecialSymbol(memo);
			if (memo && memo.length > 20) {
				memo = com.replaceitemwithspace(memo);
			}
			// nlapiLogExecution('debug', 'internalid1', internalid);
			// key���� dept, cls, location edit by joe 20180109

			if (oneToManyMap.GetValue(internalid)) {
				cls = resultslice[i].getValue('class', null, null);
				dept = resultslice[i].getValue('department', null, null);
				location = resultslice[i].getValue('location', null, null);
				if (dept != null && dept != '') {
					internalid += dept;
				}
				if (cls != null && cls != '') {
					internalid += cls;
					// nlapiLogExecution('DEBUG', 'internalid+cls', internalid);
				}
				if (location != null && location != '') {
					internalid += location;
				}
			}

			detailname = map.GetValue(internalid).name;

			// nlapiLogExecution('debug', 'internalid��ѯ����', internalid);//
			// add
			// by
			// joe
			// 180105

			foreign = resultslice[i].getValue('fxamount', null, null);
			rate = resultslice[i].getValue('exchangerate', null, null);
			if (rate) {
				rate = parseFloat(rate).toFixed(2);
			}

			if (detailname) {
				var index = detailname.indexOf("-");
				if (index > 0) {
					levelonename = detailname.substring(0, index);
					detailname = detailname.substring(index + 1).toString()
							.replace(/^\s+|\s+$/g, "");
				}
			} else {
				detailname = '';
			}
			credit = resultslice[i].getValue('creditamount', null, null);
			debit = resultslice[i].getValue('debitamount', null, null);
			if (credit) {
				credit = parseFloat(credit);
				if (!foreign || parseFloat(foreign) <= 0) {
					foreign = 0 - credit / rate;
				}
			}
			if (debit) {
				debit = parseFloat(debit);
				if (!foreign || parseFloat(foreign) <= 0) {
					foreign = debit / rate;
				}
			}
			var glNumber = com.formatStringValuesInXml(resultslice[i].getValue(
					'glnumber', null, null));

			var nn = Math.ceil(memo.length / 36);
			rows += nn;
			if (rows >= 45) {
				if (x < m)
					m = x + 2;
				rows = 0;
			}

			var mm = 0;
			if (detailname && detailname.length > 0) {
				mm = Math.ceil(detailname.length / 11);
			}
			rowsdetail += mm;
			if (rowsdetail >= 45) {
				if (x < m)
					m = x + 2;
				rowsdetail = 0;
			}

			memo = this.replaceAnd(memo);
			levelonename = this.replaceAnd(levelonename + '');
			detailname = this.replaceAnd(detailname + '');
			// foreign = this.replaceAnd(foreign + '');
			// debit = this.replaceAnd(debit + '');
			// credit = this.replaceAnd(credit + '');
			// totalcredit = this.replaceAnd(totalcredit + '');
			// totaldebit = this.replaceAnd(totaldebit + '');
			createby = this.replaceAnd(createby + '');
			number = this.replaceAnd(number + ''); // 对参数进行去除&符号处理 add by joe
			nextnumber = this.replaceAnd(nextnumber + ''); // 对参数进行去除&符号处理 add
			// by joe
			// 20180207
			// head
			if (isfirst === true) {
				var transdates = transdate.split('/');
				var serialNumFmt = (Array(3).join(0) + serialNum).slice(-3);
				var serialNumStr = transdates[2] + transdates[0] + serialNumFmt;
				// joe
				var temp = template.GetVoucherContentHeadXML(date, number,
						transtype, transdate, transcurrency, glNumber,
						serialNumStr);
				xml += temp;
				isfirst = false;
				m = 45;
				n = 0;
				x = 0;
				rowsdetail = 0;
				rows = 0;
				var mm;
				if (detailname && detailname.length > 0) {
					mm = Math.ceil(detailname.length / 13);
				}
			}
			// content
			if ((isfirst == false) && (i < resultslice.length - 1)) {
				if (credit) {
					totalcredit += parseFloat(credit);
				}
				if (debit) {
					totaldebit += parseFloat(debit);
				}
				// nlapiLogExecution('debug', 'totalcredit', totalcredit);
				xml += template.GetVoucherXML(nlapiEscapeXML(memo),
						levelonename, detailname, com.formatCurrency(foreign),
						rate, com.formatCurrency(debit), com
								.formatCurrency(credit)); // dynamic
				n++;
				x++;
			}

			// foot
			if ((number != nextnumber && isfirst == false || x % m == m - 1)
					&& (i < resultslice.length - 1)) {
				// if (n < 8) {
				// var temp = template.AddVoucherBlankLines(8 - n); //add
				// xml += temp;
				// }

				if (number != nextnumber) {// print total on last page of total
					// transaction number
					xml += template.GetVoucherXMLTotal(com
							.formatCurrency(totalcredit), com
							.formatCurrency(totaldebit)); // total
					// nlapiLogExecution('debug', 'memo|detailname4',
					// memo+'|'+detailname);//add by joe 180105

					totalcredit = 0;
					totaldebit = 0;

					// joe 在生成total的时候加1
					serialNum++;
				}

				xml += template.GetVoucherXMLFoot(createby); // signature
				isfirst = true;

			}
			// nlapiLogExecution('debug', 'internalid2', internalid);
			// the last one records
			if (i == resultslice.length - 1) {
				xml += template.GetVoucherXML(nlapiEscapeXML(memo),
						levelonename, detailname, com.formatCurrency(foreign),
						rate, com.formatCurrency(debit), com
								.formatCurrency(credit));
				xml += template.AddVoucherBlankLines(n);

				if (credit) {
					totalcredit += parseFloat(credit);
				}
				if (debit) {
					totaldebit += parseFloat(debit);
				}

				xml += template.GetVoucherXMLTotal(com
						.formatCurrency(totalcredit), com
						.formatCurrency(totaldebit)); // total
				xml += template.GetVoucherXMLFoot(createby);
				// nlapiLogExecution('debug', 'memo|detailname5',
				// memo+'|'+detailname);//add by joe 180105
				totalcredit = 0;
				totaldebit = 0;
			}
			n++;
			searchid++;
		}
		return xml;
	},

	replaceAnd : function(str) {
		return str.replace(/&/g, 'AND');
	},
	GetVoucherResults : function(filters) {
		var results = [];
		// for(var f in filters){
		// nlapiLogExecution('debug', 'filters', f);
		// }
		// nlapiLogExecution('debug', 'filters', filters);//add by joe 180105
		var savedsearch = nlapiLoadSearch('transaction',
				'customsearch_trigger_voucher');
		if (filters.length > 0) {
			savedsearch.addFilters(filters);
		}
		var resultset = savedsearch.runSearch();
		var searchid = 0;
		do {
			var resultslice = resultset.getResults(searchid, searchid + 1000);
			for ( var rs in resultslice) {
				results.push(resultslice[rs]);
				internalid = resultslice[rs].getValue('internalid', null, null);
				cls = resultslice[rs].getValue('class', null, null);
				// nlapiLogExecution('debug', 'GetVoucherResultsCls&internalid',
				// cls + '&' + internalid);// add by joe 180105
				searchid++;
			}
		} while (resultslice.length >= 1000);
		// nlapiLogExecution('debug', 'results', results.length);
		return results;
	}
};