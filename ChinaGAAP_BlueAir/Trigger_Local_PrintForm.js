/**

* Copyright Trigger Networks, Inc. 2014 All rights reserved. Module Description

* Create the user interface for printing journals entries. Version Date Author

* Remarks 1.00 05 Aug 2014 Winson.Chen

* 

*/



triggernamespace("trigger.local");



function clientPageInit() {

    //make the fields voucherDateFrom and voucherDateTo hidden . They will be available only for voucher type

    var dateFromFld = nlapiGetField('voucherdatefrom');

    dateFromFld.setDisplayType('hidden');



    var dateToFld = nlapiGetField('voucherdateto');

    dateToFld.setDisplayType('hidden');


    //Make the fields MonthFrom & MonthTo hidden. They will be available for TrialBalance Report
    var monthPeriodFromFld = nlapiGetField('custpage_monthperiodfrom');
    monthPeriodFromFld.setDisplayType('hidden');
    
    var monthPeriodToFld = nlapiGetField('custpage_monthperiodto');
    monthPeriodToFld.setDisplayType('hidden');
}

function main_report(request, response) {

    var main = new trigger.local.printform();

    main.main(request, response);

}



trigger.local.printform = function () { }



trigger.local.printform.prototype = {

    /**

    * Create the form for the page by chart of accounts localization

    */

    main: function (request, response) {

        var classlang = new trigger.local.language();

        var lang = nlapiGetContext().getPreference('language');

        var ren = classlang.UIoptions(lang);

        var form = nlapiCreateForm(classlang.GetMsgByFormTitle(lang), false);

        form.setScript('customscript_trigger_localization_form');



        // 凭证打印

        var btn_voucher = form.addButton('custpage_voucher_button', ren.Voucher, 'new trigger.local.printform().redirectToVoucherPrinting()');

        // 明细账

        form.addButton('custpage_detail_button', ren.Detail, "new trigger.local.printform().redirectToDetailPrinting()");

        // 日记账

        form.addButton('custpage_jorunal_button', ren.Journal, "new trigger.local.printform().redirectToJournalPrinting()");

        // 总分类账

        form.addButton('custpage_ledger_button', ren.Ledger, "new trigger.local.printform().redirectToLedgerPrinting()");

        // 汇总式总账

        form.addButton('custpage_summaryledger_button', ren.SummaryLedger, "new trigger.local.printform().redirectToSummaryLedgerPrinting()");

        // 利润表

        form.addButton('custpage_profit_button', ren.Profit, 'new trigger.local.printform().redirectToProfitPrinting()');

        // 资产负债表

        form.addButton('custpage_balancesheet_button', ren.BalanceSheet, "new trigger.local.printform().redirectToBalanceSheetPrinting()");
        
        //Button for Detailed Trial Balance
        form.addButton('custpage_trialblnc_dtl_button', ren.DetailedTrialBalance, "new trigger.local.printform().redirectToDetailedTrialBalancePrinting()");



        var selectgroup = form.addFieldGroup('triggergroup', classlang.GetMsgByType(lang));

        selectgroup.setShowBorder(true);

        // type

        var menu = form.addField('custpage_reporttype', 'inlinehtml', null, null, 'triggergroup');

        menu.setLayoutType('normal', 'startcol');

        var list = classlang.UIType(lang);

        menu.setDefaultValue(list);



        var paramtersgroup = form.addFieldGroup('parametersgroup', classlang.GetMsgByParameters(lang));

        // subsidiary

        var my_subsidiary = form.addField('subsidiary', 'select', ren.Subsidiary, null, 'parametersgroup');

        my_subsidiary.setLayoutType('normal', 'startcol');

        my_subsidiary.setDisplaySize(220, 6);

        my_subsidiary.addSelectOption('', '');

        var subsidiaryname;

        var internalid;

        var resultslice = this.GetSubsidiary();

        for (var rs in resultslice) {

            subsidiaryname = resultslice[rs].getValue('formulatext', null, null);

            internalid = resultslice[rs].getValue('internalid', null, null);

            my_subsidiary.addSelectOption(internalid, subsidiaryname);

        }

        paramtersgroup.setShowBorder(true);



        // 年

        var yearperiodhtml = this.GetYearPeriodHTML(ren.ReportYear);

        var year = form.addField('reportyear', 'inlinehtml', null, null, 'parametersgroup');

        year.setLayoutType('normal', 'startcol');

        year.setDefaultValue(yearperiodhtml);



        // 开始与结束期间

        var allmonthperiodhtml = this.GetAllMonthPeriodHTML();

        var allmonthperiod = form.addField('allreportperiod', 'inlinehtml', null, null, null);

        allmonthperiod.setDefaultValue(allmonthperiodhtml);


        //Define list for MONTH
        var monthperiodhtml = this.GetMonthPeriodHTML(ren.BeginMonth);
        var period = form.addField('reportperiod', 'inlinehtml', null, null, 'parametersgroup');
        period.setLayoutType('normal', 'startcol');
        period.setDefaultValue(monthperiodhtml);

        //Trial Balance MonthFrom & MonthTo		
        var monthPeriodFromFld = form.addField('custpage_monthperiodfrom', 'select', ren.MonthFrom, null, 'parametersgroup');
        monthPeriodFromFld.setLayoutType('normal', 'startcol');
        monthPeriodFromFld.setDisplaySize(100);
        monthPeriodFromFld.addSelectOption('', '', true);
        
        var monthPeriodToFld = form.addField('custpage_monthperiodto', 'select', ren.MonthTo, null, 'parametersgroup');
        monthPeriodToFld.setLayoutType('normal', 'startcol');
        monthPeriodToFld.setDisplaySize(100);
        monthPeriodToFld.addSelectOption('', '', true);

        //Voucher日期

        var voucherDateFromFld = form.addField('voucherdatefrom', 'date', ren.VoucherDateFromLbl, null, 'parametersgroup');
        voucherDateFromFld.setLayoutType('normal', 'startcol');
        voucherDateFromFld.setDisplaySize(40);

        var voucherDateToFld = form.addField('voucherdateto', 'date', ren.VoucherDateToLbl, null, 'parametersgroup');
        voucherDateToFld.setLayoutType('normal', 'startcol');
        voucherDateToFld.setDisplaySize(30);

        var accountgroup = form.addFieldGroup('accountgroup', classlang.GetMsgByCOA(lang));



        // 科目

        var htmlall = this.HTMLForAllAccountLists();

        var allacc = form.addField('custpage_allaccountlist', 'inlinehtml', null, null, null);

        allacc.setDefaultValue(htmlall);



        var html = this.HTMLForAccountList();

        var acc = form.addField('custpage_accountlist', 'inlinehtml', null, null, 'accountgroup');

        acc.setLayoutType('outside');

        acc.setDefaultValue(html);



        var option = this.HTMLForAccountListOption();

        var temp = form.addField('custpage_accountmove', 'inlinehtml', null, null, 'accountgroup');

        temp.setLayoutType('outside');

        temp.setDefaultValue(option);



        response.writePage(form);

    },



    /** ************************************资产负债表开始******************************************** */

    /**

    * 

    */

    redirectToBalanceSheetPrinting: function () {

        var parameters = this.returnParameters();

        if (!parameters) { return; }

        var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_trigger_localization_report', 'customdeploy_trigger_localization_report');

        suiteletUrl += parameters;

        suiteletUrl += String.format("&TYPE={0}", 'BALANCESHEET');

        window.open(suiteletUrl, '', 'height=600,width=1000,scrollbars, resizable');

    },

    /** ************************************资产负债表结束****************************************** */

    /** ************************************Trial Balance Start******************************************** */

    redirectToSummaryLedgerPrinting: function () {

        var parameters = this.returnParameters();

        if (!parameters) { return; }

        var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_trigger_localization_report', 'customdeploy_trigger_localization_report');

        suiteletUrl += parameters;

        suiteletUrl += String.format("&TYPE={0}", 'TRIALBALANCE');

        window.open(suiteletUrl, '', 'height=600,width=1000,scrollbars, resizable');

    },

    /** ************************************Trial Balance End ******************************************** */
    
    /** ************************************Detailed Trial Balance Start******************************************** */

    redirectToDetailedTrialBalancePrinting : function () {

        var parameters = this.returnParameters();

        if (!parameters) { return; }

        var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_trigger_localization_report', 'customdeploy_trigger_localization_report');

        suiteletUrl += parameters;

        suiteletUrl += String.format("&TYPE={0}", 'TRIALBALANCEDETAIL');

        window.open(suiteletUrl, '', 'height=600,width=1000,scrollbars, resizable');

    },

    /** ************************************Detailed Trial Balance End ******************************************** */

    /** ************************************总分类账开始******************************************** */

    redirectToLedgerPrinting: function () {

        var parameters = this.returnParameters();

        if (!parameters) { return; }

        var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_trigger_localization_report', 'customdeploy_trigger_localization_report');

        suiteletUrl += parameters;

        suiteletUrl += String.format("&TYPE={0}", 'LEDGER');

        window.open(suiteletUrl, '', 'height=600,width=1000,scrollbars, resizable');

    },

    /** ************************************总分类账结束******************************************** */

    /** ************************************日记账开始******************************************** */

    redirectToJournalPrinting: function () {

        var parameters = this.returnParameters();

        if (!parameters) { return; }

        var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_trigger_localization_report', 'customdeploy_trigger_localization_report');

        suiteletUrl += parameters;

        suiteletUrl += String.format("&TYPE={0}", 'DIARYLEDGER');

        window.open(suiteletUrl, '', 'height=600,width=1000,scrollbars, resizable');

    },

    /** ************************************日记账结束******************************************** */

    /** ************************************明细账开始******************************************** */

    redirectToDetailPrinting: function () {

        var parameters = this.returnParameters();

        if (!parameters) { return; }

        var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_trigger_localization_report', 'customdeploy_trigger_localization_report');

        suiteletUrl += parameters;

        suiteletUrl += String.format("&TYPE={0}", 'SUBLEDGER');

        window.open(suiteletUrl, '', 'height=600,width=1000,scrollbars, resizable');

    },

    /** ************************************明细账结束******************************************** */

    /** ************************************利润表开始******************************************** */

    redirectToProfitPrinting: function () {

        var parameters = this.returnParameters();

        if (!parameters) { return; }

        var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_trigger_localization_report', 'customdeploy_trigger_localization_report');

        suiteletUrl += parameters;

        suiteletUrl += String.format("&TYPE={0}", 'PROFIT');

        window.open(suiteletUrl, '', 'height=600,width=1000,scrollbars, resizable');

    },

    /** ************************************利润表结束******************************************** */

    /** ************************************VOUCHER BEGIN******************************************** */

    redirectToVoucherPrinting: function () {

        var parameters = this.returnParameters();

        if (!parameters) { return; }

        var suiteletUrl = nlapiResolveURL('SUITELET', 'customscript_trigger_localization_report', 'customdeploy_trigger_localization_report');

        suiteletUrl += parameters;

        suiteletUrl += String.format("&TYPE={0}", 'VOUCHER');

        window.open(suiteletUrl, '', 'height=600,width=1000,scrollbars, resizable');

    },

    /** ************************************VOUCHER END******************************************** */



    /**

    * ******************************************UI BEGIN**********************************************/



    /**

    * ******************************************YEARBEGIN******************************************/

    /**

    * 年

    */

    GetYearPeriodHTML: function (label_name) {

        var html = '<style type="text/css">';

        html += '#_yearperiod{width:100px;height:25px;}';

        html += '.ym_top{margin-top:10px;}';

        html += '</style>';

        html += '<div class="ym_top"><span class="smallgraytextnolink uir-label">';

        html += String.format('<a class="smallgraytextnolink">{0}</a></span></div>', label_name);

        html += '<div><select name="_yearperiod" id="_yearperiod" onchange="new trigger.local.printform().OnSelectYearPeriodChange()">';

        html += '<option value=""></option>';

        var returnYM = this.GetYearsBySubsidiary('');

        for (var key in returnYM) {

            html += String.format('<option value="{0}">{1}</option>', key, key);

        }

        html += '</select></div>';

        return html;

    },

    OnSelectYearPeriodChange: function () {
        
	    var year = document.getElementById("_yearperiod");
	
	    var n1 = document.getElementById("allmonthperiod");
	
	    var n2 = document.getElementById("monthperiod");
	
	    n2.options.length = 0;	    
	    
	    //remove previously existing options of MonthFrom & MonthTo
	    nlapiRemoveSelectOption('custpage_monthperiodfrom', null);
	    nlapiInsertSelectOption('custpage_monthperiodfrom', '', '', true);
	    
	    nlapiRemoveSelectOption('custpage_monthperiodto', null);
	    nlapiInsertSelectOption('custpage_monthperiodto', '', '', true);
	    
	    for (var i = 0; i < n1.options.length; i++) {
	        var o = document.createElement("OPTION");
	        o.value = n1.options[i].value;
	        o.text = n1.options[i].text;
	
	        var str = o.text.substring(0, 4);
	
	        if (str == year.value) {
	        	nlapiInsertSelectOption('custpage_monthperiodfrom', o.value, o.text, false);                    
	            nlapiInsertSelectOption('custpage_monthperiodto', o.value, o.text, false);
	        	n2.options.add(o);                    	            
	        }
	    }        
    },

    /**

    * 返回不重复日期数据，只包括年

    * 

    * @param subsidiaryid

    * @returns {Array}

    */

    GetYearsBySubsidiary: function (subsidiaryid) {

        var savedsearch = nlapiLoadSearch('accountingperiod', 'customsearch_trigger_accounting_period');

        var resultset = savedsearch.runSearch();

        var resultslice = resultset.getResults(0, 1000);

        var map = {};

        for (var i = 0; resultslice != null && i < resultslice.length; i++) {

            //var name = resultslice[i].getValue('formulatext', null, null);

            var date = resultslice[i].getValue('startdate', null, 'GROUP');

            date = nlapiStringToDate(date);

            var name = date.getFullYear();

            //var n = name.indexOf("-");

            //name = name.substring(0,n);

            if (!map.hasOwnProperty(name)) {

                map[name] = name;

            }

        }

        return map;

    },



    /**

    * ******************************************YEAR END************************************/

    /**

    * ******************************************MONTH  BEGIN*****************************/

    /**

    * Populates the HTML list of existing Accounting Periods
    * Uses formulatext from accountingperiod saved search as a name on the list
    * Uses id of corresponding accounting period as id for this name
    * 
    * @returns {String}
    */

    GetAllMonthPeriodHTML: function () {

        var html = '<div style="display:none;"><select name="allmonthperiod" id="allmonthperiod">';

        var savedsearch = nlapiLoadSearch('accountingperiod', 'customsearch_trigger_accounting_period');

        var resultset = savedsearch.runSearch();

        var resultslice = resultset.getResults(0, 1000);

        var arr = [];

        for (var i = 0; i < resultslice.length; i++) {

            var id = resultslice[i].getValue('internalid', null, 'GROUP');

            var name = resultslice[i].getValue('formulatext', null, 'GROUP');

            //			var date = resultslice[i].getValue('startdate',null,'GROUP');
            //
            //			date = nlapiStringToDate(date);
            //
            //			var year = date.getFullYear();
            //
            //			var month = date.getMonth() + 1;
            //
            //			var name = year+'-'+month;

            if (arr.indexOf(name) == -1) {

                //nlapiLogExecution('debug', 'MAP',   id+ name);

                html += String.format('<option value="{0}">{1}</option>', id, name);

                arr.push(name);

            }

        }

        html += '</select></div>';

        return html;

    },



    GetMonthPeriodHTML: function (label_name) {

        var html = '<style type="text/css">';

        html += '#monthperiod{width:100px;height:25px;}';

        html += '.ym_top{margin-top:10px;}';

        html += '</style>';

        html += '<div class="ym_top"><span class="smallgraytextnolink uir-label">';

        html += String.format('<a class="smallgraytextnolink">{0}</a></span></div>', label_name);

        html += '<div><select name="monthperiod" id="monthperiod">';

        html += '<option value=""></option>';

        html += '</select></div>';

        return html;

    },


    /**

    * ******************************************MONTH END***************************************/



    /*******************************************CHART OF ACCOUNT BEGIN********************/



    HTMLForAllAccountLists: function () {

        var html = '<div style="display:none;"><select name="allaccountlist" id="allaccountlist" multiple="true">';

        html += this.CreateChartOfAccount("1,2,3");

        html += '</select></div>';

        return html;

    },

    /**

    * 生成科目数据

    * 

    * @param level

    * @returns {String}

    */

    CreateChartOfAccount: function (level) {

        // 科目

        var map = this.GetCNCOAListByLevel(level);

        var accountname;

        var accountid;

        var temp = '';

        var html = '';

        for (var i = 0; i < map.Count; i++) {

            accountid = map.ArrayList[i];

            accountname = map.GetValue(accountid).name;

            temp = accountid + ' ' + accountname;

            html += String.format('<option value="{0}">{1}</option>', accountid, temp);

        }

        return html;

    },



    GetCNCOAListByLevel: function (internalids) {

        var cnnumber;

        var cnname;

        var filters = [];

        var map = new trigger.local.HashTable();

        var savedsearch = nlapiLoadSearch('customrecord_trigger_cn_coa', 'customsearch_trigger_level_23_cn_coa');

        if (internalids) {

            filters[0] = new nlobjSearchFilter('custrecord_trigger_level_cn_coa', null, 'anyof', [internalids]);

        }

        savedsearch.addFilters(filters);

        var resultset = savedsearch.runSearch();

        var resultslice = resultset.getResults(0, 1000);

        for (var i = 0; i < resultslice.length; i++) {

            cnnumber = resultslice[i].getValue('name', null, null);

            cnname = resultslice[i].getValue('custrecord_trigger_name_coa_cn', null, null);

            // nlapiLogExecution('debug', 'MAP', cnnumber+cnname);

            map.Add(cnnumber, new trigger.local.HashEntity(cnnumber, cnname));

        }

        return map;

    },



    HTMLForAccountList: function () {

        var html = '<style type="text/css">';

        html += '#accountlist_old{width:400px;height:200px;}';

        html += '.line{float:left;padding-top:3px; float:lefit;}';

        html += '</style>';

        html += "<div class='line'>";

        html += '<select name="accountlist_old" id="accountlist_old" ondblclick="new trigger.local.printform().AddItemsByOption();" multiple="true">';

        html += '</select></div>';

        return html;

    },



    HTMLForAccountListOption: function () {

        var html = '<style type="text/css">';

        html += '#accountlist_new{width:450px;height:200px;}';

        html += '#moveright{width:60px;height:20px;}';

        html += '#moveleft{width:60px;height:20px;}';

        html += '.mleft{padding:5px 5px 5px 5px}';

        html += '.line{float:left;}';

        html += '</style>';

        html += '<div class="line">';

        html += '<div class="mleft"><input name="moveright"  type="button" id="moveright" onclick="new trigger.local.printform().AddItemsByOption();"  value=">>" /></div>';

        html += '<div class="mleft"><input name="moveleft" type="button" id="moveleft" onclick="new trigger.local.printform().MoveItemsByOption();"  value="<<" /></div>';

        html += '</div>';

        html += '<div class="line" style="float:right">';

        html += '<select name="accountlist_new" id="accountlist_new" ondblclick="new trigger.local.printform().MoveItemsByOption();" multiple="true">';

        html += '</select></div>';

        return html;

    },



    /******************************************CHART OF ACCOUNT END*************************/

    /******************************************TYPE SELECT BEGIN****************************/

    OnSlectItemChange: function () {

        var o = document.getElementById("reporttype");

        var voucherDateFromFld = nlapiGetField('voucherdatefrom');
        var voucherDateToFld = nlapiGetField('voucherdateto');

        var monthPeriodFromFld = nlapiGetField('custpage_monthperiodfrom');
        var monthPeriodToFld = nlapiGetField('custpage_monthperiodto');

        voucherDateFromFld.setDisplayType('hidden');
        voucherDateToFld.setDisplayType('hidden');
        monthPeriodFromFld.setDisplayType('hidden');
        monthPeriodToFld.setDisplayType('hidden');



        if (o.value == 0) {//only when type is voucher, show the fields
            voucherDateFromFld.setDisplayType('normal');
            voucherDateToFld.setDisplayType('normal');
        } else if (o.value == 5 || o.value == 7 || o.value == 2) {//for Trial Balance report (5) or Detailed Trial Balance (7) show monthfrom & monthto
            monthPeriodFromFld.setDisplayType('normal');
            monthPeriodToFld.setDisplayType('normal');
        }

        if (o.value == 0 || o.value == 2 || o.value == 3 || o.value == 4) {

            this.MoveAllOfAccounts();

            this.GetSomeOfAccountByID(o.value);

        } else {

            this.MoveAllOfAccounts();

        }

        this.DisabledButtonsByID(o.value);

    },



    GetSomeOfAccountByID: function (val) {

        var n1 = document.getElementById("allaccountlist");

        var n2 = document.getElementById("accountlist_old");

        for (var i = 0; i < n1.options.length; i++) {

            var o = document.createElement("OPTION");

            o.value = n1.options[i].value;

            o.text = n1.options[i].text;

            var str = o.value.substring(0, 4);



            // 日记账

            if (val == 3 && (str == '1001' || str == '1002')) {

                n2.options.add(o);

                continue;

            }

            // 明细账

            if (val == 2 && (str != '1001' && str != '1002')) {

                n2.options.add(o);

                continue;

            }

            // 总分类账 凭证

            if (val == 0 || val == 4) {

                n2.options.add(o);

                // alert(val);

            }

        }

    },



    MoveAllOfAccounts: function () {

        var n1 = document.getElementById("accountlist_old");

        var n2 = document.getElementById("accountlist_new");

        n1.options.length = 0;

        n2.options.length = 0;

        // while (n1.options.length >0) {

        // n1.options.remove(i);

        // }

    },



    DisabledButtonsByID: function (id) {

        var arr = [];

        arr[0] = 'custpage_voucher_button';
        arr[1] = 'custpage_profit_button';
        arr[2] = 'custpage_detail_button';
        arr[3] = 'custpage_jorunal_button';
        arr[4] = 'custpage_ledger_button';
        arr[5] = 'custpage_summaryledger_button';
        arr[6] = 'custpage_balancesheet_button';
        arr[7] = 'custpage_trialblnc_dtl_button';
        

        for (var i = 0; i < arr.length; i++) {

            var traget = document.getElementById(arr[i]);



            if (i.toString() == id) {

                if (traget) {

                    traget.disabled = false;

                    traget.style.background = "";

                }

            } else {

                if (traget) {

                    traget.disabled = true;

                    traget.style.background = "#DCDCDC";

                }

            }

        }

    },



    /******************************************TYPE SELECT END****************************/



    /*************************************UI END*********************************************/



    /************************************operation multiple select begin***************/



    sortItem: function (sel) {

        var selLength = sel.options.length;

        var arr = new Array();

        var arrLength;

        for (var i = 0; i < selLength; i++) {

            arr[i] = sel.options[i];

        }

        arrLength = arr.length;

        arr.sort(this.fnSortByValue);

        // 删除原来的Option

        sel.options.length = 0;

        // while (selLength--) {

        // sel.options[selLength] = null;

        // }



        for (i = 0; i < arrLength; i++) {

            sel.options.add(new Option(arr[i].text, arr[i].value));

        }

    },

    /**

    * sort by value

    * 

    * @param a

    * @param b

    * @returns {Number}

    */

    fnSortByValue: function (a, b) {

        var aComp = a.value.toString();

        var bComp = b.value.toString();

        if (aComp < bComp)

            return -1;

        if (aComp > bComp)

            return 1;

        return 0;

    },



    AddItemsByOption: function () {

        var n1 = document.getElementById("accountlist_old");

        var n2 = document.getElementById("accountlist_new");

        while (n1.options.selectedIndex != -1) {

            var n = n1.options.selectedIndex;

            var value = n1.options[n].value;

            var text = n1.options[n].text;

            n2.options.add(new Option(text, value));

            n1.options.remove(n);

        }

        this.sortItem(n2);

    },

    MoveItemsByOption: function () {

        var n1 = document.getElementById("accountlist_new");

        var n2 = document.getElementById("accountlist_old");

        while (n1.options.selectedIndex != -1) {

            var indx = n1.options.selectedIndex;

            var value = n1.options[indx].value;

            var text = n1.options[indx].text;

            n2.options.add(new Option(text, value));

            n1.options.remove(indx);

        }

        this.sortItem(n2);

    },



    DisplayElement: function (id) {

        var traget = document.getElementById(id);

        if (traget.style.display == "none") {

            traget.style.display = "";

        } else {

            traget.style.display = "none";

        }

    },



    DisabledElement: function (id) {

        var traget = document.getElementById(id);

        if (traget.disabled == true) {

            traget.disabled = false;

            traget.style.background = "";

        } else {

            traget.disabled = true;

            traget.style.background = "#DCDCDC";

        }

    },



    /*************************************operation multiple select end*********************/



    /*****************************************SUBSIDIARY BEGIN****************************/

    /**

    * Get subsidiary list from saved search

    */

    GetSubsidiary: function () {

        try {

            var search = nlapiLoadSearch('subsidiary', 'customsearch_trigger_subsidiary');

            var resultset = search.runSearch();

            var resultslice = resultset.getResults(0, 200);

            return resultslice;

        }

        catch (e) {

            var rts = {};

            var resultslice = [rts];

            rts.getValue = function (str) {

                if (str == 'formulatext') {

                    return nlapiLoadConfiguration('companyinformation').getFieldValue('companyname');

                }

                if (str == 'internalid') return '-1';

            };

            return resultslice;

        }

    },



    /** ******************************************SUBSIDIARY END****************************/

    returnParameters: function () {

        var lang = nlapiGetContext().getPreference('language');

        var classlang = new trigger.local.language();

        // type

        var type = document.getElementById("reporttype");

        var nn = type.selectedIndex;

        if (nn <= 0) {

            alert(classlang.GetMsgByType(lang));

            return;

        }

        //var typevalue = type.options[nn].value;



        // for subsidiary

        var subsidiaryid = nlapiGetFieldValue('subsidiary');

        var subsidiaryname = nlapiGetFieldText('subsidiary');

        if (!subsidiaryid) {

            alert(classlang.GetMsgBySubsidiary(lang));

            return;

        }



        //voucher dates

        var voucherDateFrom = nlapiGetFieldValue('voucherdatefrom');

        var voucherDateTo = nlapiGetFieldValue('voucherdateto');
        
        var monthFromPeriodID = nlapiGetFieldValue('custpage_monthperiodfrom');
        var monthFromPeriodText = nlapiGetFieldText('custpage_monthperiodfrom');
        
        var monthToPeriodID = nlapiGetFieldValue('custpage_monthperiodto');
        var monthToPeriodText = nlapiGetFieldText('custpage_monthperiodto');



        var period, periodid;

        //when type==Voucher and therte are two values for voucherDateFrom and voucherDateTo

        //don't use period and periodid for calculations		

        if ((type.value == 0) && voucherDateFrom && voucherDateTo) {

            period = null;

            periodid = null;

        }else if((type.value == 5 || type.value == 7) && monthFromPeriodID && monthToPeriodID){//Trial Balance report: don't use period and period id when MonthFrom & MonthTo are chosen
        	
        	//DateFromID should be less or equal to DateToID
        	if (monthToPeriodID < monthFromPeriodID) {
                alert(classlang.GetMsgByPeriodFromPeriodTo(lang));
                return;
            }
        	
        	
        	period = null;
            periodid = null;
        } else {

            // 期间

            var o = document.getElementById("monthperiod");

            var index = o.selectedIndex;

            var periodData = o.options[index];

            if (!periodData) {

                alert(classlang.GetMsgByPeriodTime(lang));

                return;

            }

            period = periodData.text;

            //			if (type.value != 0 && !period) {

            if (!period) {//don't generate any report when there is no dates

                alert(classlang.GetMsgByPeriodTime(lang));

                return;

            }

            // 期间ID

            periodid = periodData.value;

        }





        // 科目

        var ids = [];

        var names = [];

        var n1 = document.getElementById("accountlist_new");

        for (var i = 0; i < n1.options.length; i++) {

            ids[i] = n1.options[i].value;

            names[i] = n1.options[i].text;

        }

        var accountid = ids.join(",");

        var accountname = escape(names.join(","));

        if ((type.value == 2 || type.value == 3 || type.value == 4) && !accountid) {// for subLedger(2), diaryLedger(3) and generalLedger when COA is not selected 

            alert(classlang.GetMsgByCOA(lang));

            return;

        }



        var temp = '';

        if (subsidiaryid) {

            temp += String.format("&SUBSIDIARY={0}", subsidiaryid);

        }

        if (subsidiaryname) {

            temp += String.format("&SUBSIDIARYNAME={0}", encodeURI(encodeURI(subsidiaryname)));

        }

        if (accountid) {

            temp += String.format("&ACCOUNTID={0}", accountid);

        }

        if (accountname) {

            temp += String.format("&ACCOUNTNAME={0}", accountname);

        }

        if (period) {

            temp += String.format("&PERIOD={0}", period);

        }

        if (periodid) {

            temp += String.format("&PERIODID={0}", periodid);

        }

        if (voucherDateFrom) {

            temp += String.format("&VOUCHERFROM={0}", voucherDateFrom);

        }

        if (voucherDateTo) {

            temp += String.format("&VOUCHERTO={0}", voucherDateTo);

        }
        
        if (monthFromPeriodID) {
            temp += String.format("&MONTHFROMID={0}", monthFromPeriodID);
        }
        
        if (monthFromPeriodText) {
            temp += String.format("&MONTHFROM={0}", monthFromPeriodText);
        }        

        if (monthToPeriodID) {
            temp += String.format("&MONTHTOID={0}", monthToPeriodID);
        }
        
        if (monthToPeriodText) {
            temp += String.format("&MONTHTO={0}", monthToPeriodText);
        }

        return temp;

    },



    /**

    * Description:format date.

    * 

    * @param {nlobj}

    *            the field id by date

    * @returns {string} style is 'yyyymmdd'.

    */

    formatdate: function (datefld) {

        datefld = nlapiStringToDate(datefld);

        var yyyy = datefld.getFullYear();

        var mm = this.padleft("" + datefld.getMonth(), '0');

        var dd = this.padleft("" + datefld.getDate(), '0');

        ;

        return yyyy + mm + dd;

    },

    padleft: function (stringToTrim, delimiter) {

        var paddedstr = stringToTrim + '';

        if (paddedstr.length < 2) {

            paddedstr = delimiter + paddedstr.replace(/^\s+/, "");

        }

        return paddedstr;

    }

};

//format string

String.format = function () {

    var args = arguments;

    return args[0].replace(/\{(\d+)\}/g, function (m, i) { return args[i * 1 + 1]; });

};

