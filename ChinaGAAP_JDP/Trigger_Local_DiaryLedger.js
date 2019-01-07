/**
 * Module Description: Profit & Loss
 * Version    Date            Author           Remarks
 * 1.00       23 Oct 2014   Winson.Chen
 */

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.diaryledger = function() {}
trigger.local.diaryledger.prototype = {

    writeDiaryLedgerToPDF: function (subsidiaryid, periodid, period, accountid, response) {
        var year = com.GetCurrentYear();
        var map = rule.GetCOAAccountList();
        var xml = '';

        var filter = []; //期初余额
        var filters = [];
        if (subsidiaryid&&subsidiaryid!='-1') {
            filter[0] = new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryid);
            filters[0] = new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryid);
        }
        if (periodid && period) {
        	var accPeriod = nlapiLoadRecord('accountingperiod', periodid);
        	var accPeriodStartDate = accPeriod.getFieldValue('startdate'); //format of date M/D/YYYY, no leading zeros
			var firstSlash = accPeriodStartDate.indexOf('/');
			var lastSlash = accPeriodStartDate.lastIndexOf('/');
			var startMonth = accPeriodStartDate.substring(0,firstSlash);
			var startDay = accPeriodStartDate.substring(firstSlash +1, lastSlash);
			var startYear = accPeriodStartDate.substring(lastSlash+1);        	
                  
            var periodtime = String.format("{0}/{1}/{2}", startMonth, startDay, startYear);            

            filter[filter.length] = new nlobjSearchFilter('startdate', 'accountingperiod', 'before', periodtime);
            filters[filters.length] = new nlobjSearchFilter('postingperiod', null, 'abs', [periodid]);
        }
        var n = filter.length;
        var sqlin = this.GetAccIdList(accountid);
        for (var i = 0; i < sqlin.length; i++) {
            var internalids = sqlin[i];

            if (internalids.length > 0) {
                filter[n] = new nlobjSearchFilter('internalid', 'account', 'anyof', internalids);
                filters[n] = new nlobjSearchFilter('internalid', 'account', 'anyof', internalids);
            }
            var beginbalance = this.GetSumRecordstByAccountID(filter);
            xml += this.GetDiaryLedgerLists(filters, period, beginbalance, map);
        }
        if (xml) {
            xml = template.GetDiaryLedgerXMLHead + xml;
            xml += template.GetPDFClosingTagXML;
        }

        var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
        filename = "Diary Ledger-" + filename + ".PDF";
        new trigger.local.write().WriteXMLToPDF(response, xml, filename);
    },

    GetAccIdList: function (accountid) {
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
                //nlapiLogExecution('debug', str, number);
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

    GetSumRecordstByAccountID: function (filters) {
        var result = 0;
        if (filters.length <= 0) {
            return '';
        }
        var savedsearch = nlapiLoadSearch('transaction', 'customsearch_trigger_balance_sheet');
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
    * @param internalids
    * @returns {Array}
    */
    GetDiaryLedgerLists: function (filters, year, balance, map) {
        var xml = '';

        var savedsearch = nlapiLoadSearch('transaction', 'customsearch_trigger_journal');
        if (filters.length > 0) { savedsearch.addFilters(filters); }
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
        //var balance = 0;
        var month;
        var day;
        var m = 0;  //paging

        var resultslice = resultset.getResults(0, 1000);
        //nlapiLogExecution('debug', 'COUNT', resultslice.length);
        if (resultslice.length <= 0) { return ''; }
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

            if (!credit) { credit = 0; }
            if (!debit) { debit = 0; }

            //table head
            if (i == 0) {
                if (!accountnumber) { accountnumber = ''; }
                var type = "借";
                if (balance == 0) { type = "平"; }
                xml += template.GetDiaryLedgerContentHeadXML(year, accountnumber + ' ' + account);
                xml += template.GetOpeningBalanceXML(type, com.formatCurrency(balance)); //期初余额
                m++;
            }
            else{//check the max line numbers between memo and account, took max value and add it to toal lines amount
            	var nn =  Math.ceil(memo.length/45);
    			var nn2 = Math.ceil(account.length/19);
    			
    			if(nn2 > nn){
    				nn = nn2;
    			}
    			m += nn;
            } 
            if (m >= 45) {
                xml += template.GetFooterXML;
                xml += template.GetDiaryLedgerContentHeadXML(year, accountnumber + ' ' + account);
                m = 0;
            }
            //content
            totalcredit += parseFloat(credit);
            totaldebit += parseFloat(debit);
            balance = parseFloat(balance) + parseFloat(debit) - parseFloat(credit);
            // dynamic content
            xml += template.GetDiaryLedgerXML(month, day, number, nlapiEscapeXML(memo), account,
					com.formatCurrency(debit), com.formatCurrency(credit), com.formatCurrency(balance));

            // 当日余额
            if ((date != nextdate) || i == resultslice.length - 1) {//last one record
                xml += template.GetBalanceOfDayXML(com.formatCurrency(totaldebit),
						com.formatCurrency(totalcredit), com.formatCurrency(balance)); // total
                totalcredit = 0;
                totaldebit = 0;
                m++;
            }
            if (i == resultslice.length - 1) {
                xml += template.GetFooterXML;
            }
        } //for
        return xml;
    }
}