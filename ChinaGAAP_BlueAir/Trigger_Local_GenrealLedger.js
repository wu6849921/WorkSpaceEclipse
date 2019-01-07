/**
* Module Description: Profit & Loss
* Version    Date            Author           Remarks
* 1.00       23 Oct 2014   Winson.Chen
*/

triggernamespace("trigger.local");

var template = new trigger.local.xmltemplate();
var rule = new trigger.local.rule();
var com = new trigger.local.common();

trigger.local.generalledger = function () { };
trigger.local.generalledger.prototype = {
    writeGeneralLedgerToPDF: function (subsidiaryid, periodid, period, accountid, accountname, response) {

        var filterexpression = rule.GetCNCOAFilters(accountid);
        var internalids = rule.GetMappingCNCOA(filterexpression);
        var entity = this.GetSQLForMappingCNCOA(internalids);
        var formula = entity.sql;

        var filter = [];
        var filters = [];
        var incomeAccountsFilters = [];

        var columns = [];
        var cols = [];
        var xml = '';
        if (formula) {
            var formulaname = new nlobjSearchColumn('formulatext', null, 'GROUP');
            formulaname.setFormula(formula);
            formulaname.setSort(true);
            columns.push(formulaname);

            var temp = new nlobjSearchColumn('formulanumeric', null, 'GROUP');
            temp.setFormula(formula);
            //temp.setFormula('CASE {account.internalid} WHEN 5 THEN 100101 WHEN 3 THEN 100101 WHEN 4 THEN 100103 ELSE {account.internalid} END');
            temp.setSort(true);
            cols.push(temp);
        }
        if (internalids.length > 0) {
            xml = template.GetLedgerXMLHead;
            filters[0] = new nlobjSearchFilter('internalid', 'account', 'anyof', internalids);
            filter[0] = new nlobjSearchFilter('internalid', 'account', 'anyof', internalids);
            incomeAccountsFilters[0] = new nlobjSearchFilter('internalid', 'account', 'anyof', internalids); 
            if (subsidiaryid&&subsidiaryid!='-1') {
                filters[filters.length] = new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryid);
                filter[filter.length] = new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryid);
                incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaryid);
            }
            var year;
            if (periodid && period) {
            	year = period.substr(0, 4);
            	var month = com.GetMonthByPeriod(period);
                var periodtime = String.format("{0}/{1}/{2}", month, '1', year);                
                var begintime = '1/1/' + year;
                var endtime = '12/31/' + year;
                filter[filter.length] = new nlobjSearchFilter('startdate', 'accountingperiod', 'before', begintime);
                filters[filters.length] = new nlobjSearchFilter('startdate', 'accountingperiod', 'within', begintime, endtime);
                
                incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', begintime);
    			incomeAccountsFilters[incomeAccountsFilters.length] = new nlobjSearchFilter('startdate', 'accountingperiod', 'before', periodtime);
                
              //need this filter in order to filter out data of period 13 that has the same begin date as period 12
                filters[filters.length] = new nlobjSearchFilter('internalidnumber', 'accountingperiod', 'notgreaterthan', periodid);
            }
            
            var incomeAccountsMap = this.prepareMapOfIncomeAccountNumbers();
            
            var beginbalanceIncomeAccountsMap = this.GetBalanceByYearBegin(incomeAccountsFilters, cols, true, incomeAccountsMap); //年初余额,balance at the beginning of the year for income accounts
            var beginbalanceMap = this.GetBalanceByYearBegin(filter, cols, false, incomeAccountsMap); //年初余额,balance at the beginning of the year
            var _xml = this.GetGeneralLedgerLists(filters, period, cols, entity.map, beginbalanceMap, beginbalanceIncomeAccountsMap);
            if(_xml){
            	xml += _xml;
            	xml += template.GetPDFClosingTagXML;
            }
            else{
            	xml = '';
            }
        }
        var filename = com.formatCNDate(new Date(), "YYYYMMDDhhmm");
        filename = "Ledger-" + filename + ".PDF";
        new trigger.local.write().WriteXMLToPDF(response, xml, filename);
    },
    /**
    * Get ledger records
    * @param internalids
    * @returns {String}
    */
    GetSQLForMappingCNCOA: function (id) {
        var columns = [];
        if (id && id.length > 0) {
            var formula = String.format("CASE WHEN TO_NUMBER({custrecord_trigger_ns_account_id}) IN({0}) THEN TO_NUMBER({custrecord_trigger_ns_account_id}) ELSE 1 END", id);
            columns[0] = new nlobjSearchColumn('formulatext', null, null);
            columns[0].setFormula(formula);
        }
        var savedsearch = nlapiLoadSearch('customrecord_trigger_mapping_cn_coa', 'customsearch_trigger_mapping_cn_coa');
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
        for (var rs in resultslice) {
            internalid = resultslice[rs].getValue('formulatext', null, null);
            //if (internalid == 1) { continue; }
            number = resultslice[rs].getText('custrecord_trigger_cn_account_number', null, null);
            name = resultslice[rs].getValue('custrecord_trigger_name_coa_cn', 'custrecord_trigger_cn_account_number', null);
            sql += String.format(" WHEN {0} THEN {1} ", internalid, number);
            if (!map.Contains(number)) {
                map.Add(number, new trigger.local.HashEntity(number, name));
            }
            //nlapiLogExecution('debug', 'name', number + '/' + name);
        }
        sql += 'ELSE 0 END';
        var entity = Object.create(trigger.local.entity.AccountDetail);
        entity.sql = sql;
        entity.map = map;
        return entity;
    },

    GetGeneralLedgerLists: function (filters, year, columns, entityMap, beginbalanceMap, beginbalanceIncomeAccountsMap) {
        var xml = ''; 

        var savedsearch = nlapiLoadSearch('transaction', 'customsearch_trigger_ledger_by_months');
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
        var firstlevelaccountnum='';
        var secondlevelaccountnum='';
        var month;
        var day;
        var t;

        var resultslice = resultset.getResults(0, 1000);
        var map = new trigger.local.HashTable();
        for (var i = 0; i < resultslice.length; i++) {

            var temp = {};
            var allcols=resultslice[i].getAllColumns();
            credit = resultslice[i].getValue('creditamount', null, 'sum');
            debit = resultslice[i].getValue('debitamount', null, 'sum');
            period = resultslice[i].getValue('formulatext', null, 'group');
            periodEndDate = resultslice[i].getValue('enddate', 'accountingPeriod', 'group');
            accountNum = resultslice[i].getValue(columns[0]);
            
            firstlevelaccountnum=accountNum.substring(0, 4);
            
            secondlevelaccountnum=accountNum.substring(0,6);
            
            if(accountNum.length==4){
            	accountNum=null;
            	secondlevelaccountnum=null;
            }
            else if(accountNum.length==6){ 
            	accountNum=null;
            }
            
            if(credit){
                temp.credit = parseFloat(credit);
            }else{
            	temp.credit = 0;
            }
            if(debit){
                temp.debit = parseFloat(debit);
            }else{
            	temp.debit = 0;
            }
            temp.period = period;
            temp.periodEndDate = periodEndDate;

            /*
             * 添加一级科目
             */
            if(map.Contains(firstlevelaccountnum)){
                //var temparr=map.GetValue(firstlevelaccountnum);
            	var ind=this.FirstLevelContains(map.GetValue(firstlevelaccountnum), 'period', period);
            	if(ind==-1){
            		map.GetValue(firstlevelaccountnum).push(rule.ObjectClone(temp));
            	}
            	else{
            		map.GetValue(firstlevelaccountnum)[ind].credit+=temp.credit;
            		map.GetValue(firstlevelaccountnum)[ind].debit+=temp.debit;
            	}
            }
            else{
            	map.Add(firstlevelaccountnum, [rule.ObjectClone(temp)]);
            }
            
            /*
             * 添加二级科目
             */
            if(secondlevelaccountnum!=null){
                if(map.Contains(secondlevelaccountnum)){
                    //var temparr=map.GetValue(secondlevelaccountnum);
                
            	    var ind=this.FirstLevelContains(map.GetValue(secondlevelaccountnum), 'period', period);
                	if(ind==-1){
                		map.GetValue(secondlevelaccountnum).push(rule.ObjectClone(temp));
                	}
                	else{
                		map.GetValue(secondlevelaccountnum)[ind].credit+=temp.credit;
            		    map.GetValue(secondlevelaccountnum)[ind].debit+=temp.debit;
                	}
                }
                else{
                	map.Add(secondlevelaccountnum, [rule.ObjectClone(temp)]);
                }
            }
            
            /*
             * 添加明细科目
             */            
            if(accountNum!=null){
                if (map.Contains(accountNum)) {
                    map.GetValue(accountNum).push(rule.ObjectClone(temp));
                }
                else {
                	map.Add(accountNum, [rule.ObjectClone(temp)]);
                }
            }

        }

        for (var j = 0; j < map.Count; j++) {
            var accountNum = map.ArrayList[j];
            var tempArr = map.GetValue(accountNum);
            totalcredit = 0;
            totaldebit = 0;            
            if (!beginbalanceMap.Contains(accountNum) && !beginbalanceIncomeAccountsMap.Contains(accountNum)) {
            	beginbalance = 0;
            }else if(beginbalanceIncomeAccountsMap.Contains(accountNum)){
            	beginbalance = parseFloat(beginbalanceIncomeAccountsMap.GetValue(accountNum));
            }else{ 
            	beginbalance = parseFloat(beginbalanceMap.GetValue(accountNum));
            }            
            monthbeginbalance = beginbalance;
            var accountname=entityMap.GetValue(accountNum).name;
            if(!accountname){
            	var f=[new nlobjSearchFilter('name', null,'is',accountNum)];
            	var c=[new nlobjSearchColumn('custrecord_trigger_name_coa_cn')];
            	rtemp=nlapiSearchRecord('customrecord_trigger_cn_coa',null,f,c);
            	accountname=rtemp[0].getValue(c[0]);
            }
            
            xml += template.GetLedgerContentXMLHead(year, accountNum + ' ' + accountname); //table head
            t = rule.GetCreditDebitText(beginbalance);
            xml += template.GetOpeningBalanceByYearXML(t[0], t[1]); //年初余额
            for (var x = 0; x < tempArr.length; x++) {
                var temp = tempArr[x];
                period = temp.period;                
                credit = temp.credit;
                debit = temp.debit;
                periodEndDate = temp.periodEndDate; //period end date.  Has format of M/D/YYYY
                
                var firstSlash = periodEndDate.indexOf('/');
                var lastSlash = periodEndDate.lastIndexOf('/');
                var endMonth = periodEndDate.substring(0,firstSlash);
                var endDay = periodEndDate.substring(firstSlash +1, lastSlash);
                
                
//                var year = period.substr(0, 4);
//                var month = com.GetMonthByPeriod(period);
//                var periodtime = String.format("{0}/{1}/{2}", month, '1', year);
//
//                var temp = com.GetLastDay(periodtime);
//                day = temp.getDate();

                //content
                if (credit) {
                    totalcredit += parseFloat(credit);
                } else { credit = 0; }
                if (debit) {
                    totaldebit += parseFloat(debit);
                } else { debit = 0; }

                monthbeginbalance =  monthbeginbalance - parseFloat(credit) + parseFloat(debit);
                t_beginbalance = beginbalance + parseFloat(totaldebit) - parseFloat(totalcredit);
                t = rule.GetCreditDebitText(monthbeginbalance);
                xml += template.GetLedgerXML(endMonth, endDay, '本月合计',
					com.formatCurrency(credit), com.formatCurrency(debit), t[0], t[1]);
                
                t = rule.GetCreditDebitText(t_beginbalance);
                xml += template.GetLedgerXML(endMonth, endDay, '本年合计', com.formatCurrency(totalcredit), com.formatCurrency(totaldebit), t[0],
					t[1]);
                
            }
            xml += template.GetEndBalanceByYearXML(t[0], t[1]);
            xml += template.GetFooterXML;
        }

        if (resultslice.length <= 0) {
            return '';
        }
        return xml;
    },

    /**
    * Get the total of amount by the records that any one of the chart of accounts
    * @param internalids
    * @param isIncomeAccountsCase - false: will skip all income accounts, true: will collect only for income accounts
    * @param incomeAccountsMap - main containing first level of income accounts
    * @returns
    */
    
    
    GetBalanceByYearBegin: function (filters, columns, isIncomeAccountsCase, incomeAccountsMap) {
        var result = 0;
        var map = new trigger.local.HashTable();
        if (filters.length <= 0) { return ''; }
        var savedsearch = nlapiLoadSearch('transaction', 'customsearch_trigger_ledger_by_years');
        if (filters.length > 0) {
            savedsearch.addFilters(filters);
        }
        if (columns.length > 0) {
            savedsearch.addColumns(columns);
        }
        var resultset = savedsearch.runSearch();
        var resultslice = resultset.getResults(0, 1000);
        if (resultslice.length > 0) {
        	    for(var i=0;i<resultslice.length;i++){
	                var credit = resultslice[i].getValue('creditamount', null, 'SUM');
	                var debit = resultslice[i].getValue('debitamount', null, 'SUM');
	                var accountnumber = resultslice[i].getValue(columns[0]);
	//				nlapiLogExecution('DEBUG', 'GetBalanceByYearBegin', 'accountnumber = ' + accountnumber);//output accountnumber = 60010101
	                var firstlevelaccountnum = accountnumber.substring(0,4);
	                var secondlevelaccountnum = accountnumber.substring(0,6);
	                
	                //to destinquish between income accounts and the others
	                //for income accounts check the flag and verify the 1st level is defined in the saved search of income accounts
	               // for nonincome: check the flag and make sure the number doesnt exist in the saved search of income accounts
	                if((isIncomeAccountsCase && incomeAccountsMap.Contains(firstlevelaccountnum)) || (!isIncomeAccountsCase && !incomeAccountsMap.Contains(firstlevelaccountnum))){
		                if(accountnumber.length==4){
		                	accountnumber=null;
		                	secondlevelaccountnum=null;
		                }
		                else if(accountnumber.length==6){
		                	accountnumber=null;
		                }
		                if (!credit) { credit = 0; }
		                if (!debit) { debit = 0; }
		                result = parseFloat(debit) - parseFloat(credit);
		                if(map.Contains(firstlevelaccountnum)){
		                	map.HashArr[firstlevelaccountnum]+=result;
		                }
		                else{
		                	map.Add(firstlevelaccountnum,result);
		                }
		                if(secondlevelaccountnum!=null){
		                    if(map.Contains(secondlevelaccountnum)){
		                	    
		                    	map.HashArr[secondlevelaccountnum]+=result;
		                    }
		                    else{
		                	    map.Add(secondlevelaccountnum,result);
		                    }
		                }
		                if(accountnumber!=null){
		                	map.Add(accountnumber, result);
		                }
	                }
                
        	}//end of FOR loop
        }//end of IF

        return map;

    },
    
    FirstLevelContains:function (arr,key,val){
    	for(var i=0;i<arr.length;i++){
    		//nlapiLogExecution('debug',arr[i].key,val);
    		if(arr[i][key]==val) return i;
    	}
    	return -1;
    },
    
    /**
	 * Prepare map with P&L (income accounts) numbers as key of the map.
	 * @returns {trigger.local.HashTable}
	 */
	prepareMapOfIncomeAccountNumbers:function(){
		var incomeAccountsSearchResults = nlapiSearchRecord('customrecord_trigger_cn_coa', 'customsearch_trigger_coa_incomeaccounts', null, null);//bring P&L account numbers (income accounts)
		var cnnAcntNumber;
		var map = new trigger.local.HashTable(); //map to hold numbers of P&L accounts
		if(incomeAccountsSearchResults && incomeAccountsSearchResults.length >0){
			for(var j = 0; j < incomeAccountsSearchResults.length; j++){
				cnnAcntNumber = incomeAccountsSearchResults[j].getValue('name', null, null);
//				nlapiLogExecution('DEBUG', 'prepare Map Of P&L account numbers', 'account number = ' + cnnAcntNumber);
				map.Add(cnnAcntNumber, null);
			}				
		}				
		return map;
	}
};