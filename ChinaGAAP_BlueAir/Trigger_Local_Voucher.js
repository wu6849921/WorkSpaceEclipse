/**
 * Copyright Trigger Networks, Inc. 2014 All rights reserved. Module Description Voucher Reports Version Date Author Remarks 1.00 05 Aug 2014 Winson.Chen
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
	writeVoucherToPDF : function(subsidiaryid, periodid, accountid, period, voucherDateFrom, voucherDateTo, response) {
		var subid = subsidiaryid;
		var fromToPeriod = null;
		var filter = [];
		var filters = [];
		if (accountid) {
			var filterexpression = rule.GetCNCOAFilters(accountid);
			var internalids = rule.GetMappingCNCOA(filterexpression);
			if (internalids.length > 0) {
				filters[filters.length] = new nlobjSearchFilter('internalid', 'account', 'anyof', internalids);
			}
		}
		if (subsidiaryid && subsidiaryid != '-1') {
			filters[filters.length] = new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryid);
			filter[filter.length] = new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryid);
		}

		if (voucherDateFrom && voucherDateTo) {
			filters[filters.length] = new nlobjSearchFilter('trandate', null, 'within', voucherDateFrom, voucherDateTo);
			filter[filter.length] = new nlobjSearchFilter('trandate', null, 'within', voucherDateFrom, voucherDateTo);
			fromToPeriod = voucherDateFrom + '-' + voucherDateTo;
		} else if (periodid) {
			filters[filters.length] = new nlobjSearchFilter('postingperiod', null, 'abs', [ periodid ]);
			filter[filter.length] = new nlobjSearchFilter('postingperiod', null, 'abs', [ periodid ]);
		}

		var arr = this.GetDistinctNumbersByID(filters);

		var xml = '';
		if (arr.length > 0) {
			filter[filter.length] = new nlobjSearchFilter('internalid', null, 'anyof', arr);

			// employee name
			var subsidiaryrec = rule.GetSubsidiary();
			var subsidiaryid = [];
			for ( var rs in subsidiaryrec) {
				var internalid = subsidiaryrec[rs].getValue('internalid', null, null);
				subsidiaryid.push(internalid);
			}
			var map = new trigger.local.employee().GetEmployeesList(subsidiaryid);
			if (fromToPeriod) {
				xml = this.GetVoucherResultXML(filter, fromToPeriod, map, subid);
			} else {
				xml = this.GetVoucherResultXML(filter, period, map, subid);
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
	 * according on current condition, calculate total number of records. if total number of records had over 8000, the PDF file's size will be over 5MB
	 * 
	 * @param filters
	 * @returns {Number}
	 */
	GetTotalNumberOfRecords : function(filters) {
		if (!filters) {
			return 0;
		}
		var savedsearch = nlapiLoadSearch('transaction', 'customsearch_trigger_total_of_records');
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
				var number = resultslice[rs].getValue('internalid', null, 'group');
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
	GetVoucherResultXML : function(filters, period, namemap, subsidiaryid) {
		var xml = '';
		var map = rule.GetCOAAccountList();
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
		var resultslice = this.GetVoucherResults(filters);
		// nlapiLogExecution('debug', 'count1', resultslice.length);

		var AMApprover = {};
		if (subsidiaryid && subsidiaryid != -1) {
			var f = [];
			f.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
			f.push(new nlobjSearchFilter('custrecord_tn_gaap_subsidiary', null, 'is', subsidiaryid));
			var r = nlapiSearchRecord('customrecord_tn_chinagaapconfiguration', null, f, [ new nlobjSearchColumn('custrecord_tn_gaap_accountmanager'),
					new nlobjSearchColumn('custrecord_tn_gaap_transactionapprover') ]);
			if (r) {
				AMApprover.am = r[0].getValue('custrecord_tn_gaap_accountmanager');
				AMApprover.approver = r[0].getValue('custrecord_tn_gaap_transactionapprover');
			} else {
				AMApprover.am = '';
				AMApprover.approver = '';
			}
		}

		for (var i = 0; i < resultslice.length; i++) {
			number = resultslice[i].getValue('transactionnumber', null, null);
			if (i < resultslice.length - 1) {
				nextnumber = resultslice[i + 1].getValue('transactionnumber', null, null);
			}
			internalid = resultslice[i].getValue('internalid', 'account', null);

			transtype = resultslice[i].getText('type', null, null);
			transcurrency = resultslice[i].getText('currency', null, null);
			transdate = resultslice[i].getValue('trandate', null, null);

			// create name or chinese name
			createbyid = resultslice[i].getValue('createdby', null, null);
			createby = resultslice[i].getText('createdby', null, null);
			// setbyid = resultslice[i].getValue('name', 'systemnotes', null);
			// setby='';

			var chinesename = namemap.GetValue(createbyid).name;
			if (chinesename) {
				createby = chinesename;
			}

			var approver = resultslice[i].getValue('custbody_tn_approver', null, null);
			approver = approver ? approver : AMApprover.approver;
			// chinesename = namemap.GetValue(setbyid).name;
			// if(chinesename){setby = chinesename;}
			memo = resultslice[i].getValue('memo', null, null);
			memo = com.replaceSpecialSymbol(memo);
			if (memo && memo.length > 20) {
				memo = com.replaceitemwithspace(memo);
			}
			detailname = map.GetValue(internalid).name;

			foreign = resultslice[i].getValue('fxamount', null, null);
			rate = resultslice[i].getValue('exchangerate', null, null);
			if (rate) {
				rate = parseFloat(rate).toFixed(4);
			}

			if (detailname) {
				var index = detailname.indexOf("-");
				if (index > 0) {
					levelonename = detailname.substring(0, index);
					detailname = detailname.substring(index + 1).toString().replace(/^\s+|\s+$/g, "");
				}
			} else {
				detailname = '';
			}
			credit = resultslice[i].getValue('creditamount', null, null);
			debit = resultslice[i].getValue('debitamount', null, null);
			if (credit) {
				credit = parseFloat(credit);
				if (!foreign) {
					foreign = 0 - credit / rate;
				}
			}
			if (debit) {
				debit = parseFloat(debit);
				if (!foreign) {
					foreign = debit / rate;
				} else if (parseFloat(foreign) <= 0) {
					foreign = 0 - foreign;
				}
			}

			var glNumber = com.formatStringValuesInXml(resultslice[i].getValue('glnumber', null, null));

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

			// head
			if (isfirst === true) {
				var temp = template.GetVoucherContentHeadXML(date, number, transtype, transdate, transcurrency, glNumber);
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
				xml += template.GetVoucherXML(nlapiEscapeXML(memo), levelonename, detailname, com.formatCurrency(foreign), rate, com.formatCurrency(debit), com.formatCurrency(credit)); // dynamic
				n++;
				x++;
			}
			// foot
			if ((number != nextnumber && isfirst == false || x % m == m - 1) && (i < resultslice.length - 1)) {
				// if (n < 8) {
				// var temp = template.AddVoucherBlankLines(8 - n); //add
				// xml += temp;
				// }

				if (number != nextnumber) {// print total on last page of total transaction number
					xml += template.GetVoucherXMLTotal(com.formatCurrency(totalcredit), com.formatCurrency(totaldebit)); // total
					totalcredit = 0;
					totaldebit = 0;
				}

				xml += template.GetVoucherXMLFoot(createby, AMApprover.am, approver); // signature
				isfirst = true;
			}

			// the last one records
			if (i == resultslice.length - 1) {
				xml += template.GetVoucherXML(nlapiEscapeXML(memo), levelonename, detailname, com.formatCurrency(foreign), rate, com.formatCurrency(debit), com.formatCurrency(credit));
				xml += template.AddVoucherBlankLines(n);

				if (credit) {
					totalcredit += parseFloat(credit);
				}
				if (debit) {
					totaldebit += parseFloat(debit);
				}

				xml += template.GetVoucherXMLTotal(com.formatCurrency(totalcredit), com.formatCurrency(totaldebit)); // total
				xml += template.GetVoucherXMLFoot(createby, AMApprover.am, approver);
				totalcredit = 0;
				totaldebit = 0;
			}
			n++;
			searchid++;
		}
		return xml;
	},

	GetVoucherResults : function(filters) {
		var results = [];
		var savedsearch = nlapiLoadSearch('transaction', 'customsearch_trigger_voucher');
		if (filters.length > 0) {
			savedsearch.addFilters(filters);
		}
		var resultset = savedsearch.runSearch();
		var searchid = 0;
		do {
			var resultslice = resultset.getResults(searchid, searchid + 1000);
			for ( var rs in resultslice) {
				results.push(resultslice[rs]);
				searchid++;
			}
		} while (resultslice.length >= 1000);
		return results;
	}
};