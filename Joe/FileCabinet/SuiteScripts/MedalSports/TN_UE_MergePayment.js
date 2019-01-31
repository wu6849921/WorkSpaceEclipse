/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/search', 'N/error', 'N/url', 'N/currency', 'N/format'],
/**
 * @param serverWidget
 * @param record
 * @param redirect
 * @param search
 * @param error
 * @param url
 * @param currencyF
 * @param format
 * @returns
 */
function(serverWidget, record, redirect, search, error, url, currencyF, format) {

    /**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @param {Form}
	 *            scriptContext.form - Current form
	 * @Since 2015.2
	 */
    function beforeLoad(context) {
        try {
            var newRecord = context.newRecord;
            // 第一步:创建时生成sublist
            // || context.type == context.UserEventType.VIEW
            if (context.type == context.UserEventType.VIEW) {
                // view状态下增加打印按钮
                var form = context.form;
                var newRecord = context.newRecord;
                var mpNumber = newRecord.getValue({
                    fieldId: 'custrecord_tn_mp_number'
                });
                // 第六步：添加打印按钮
                // alert(mpPrintURL);
                var mpPrintURL = url.resolveScript({
                    scriptId: 'customscript_tn_sl_printmp',
                    deploymentId: 'customdeploy_tn_sl_printmp',
                    params: {
                        mpNum: mpNumber
                    }
                });
                form.addButton({
                    id: 'custpage_tn_print',
                    label: 'Print',
                    functionName: '(function(){ window.open("' + mpPrintURL + '") })'
                });
            }
        } catch(e) {
            log.debug({
                title: 'beforeLoad',
                details: e
            });
        }

    }
    /**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {Record}
	 *            scriptContext.oldRecord - Old record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
    function afterSubmit(context) {
        // 第二步：保存后创建相应单据
        try {
            // log.debug({
            // title : 'afterSubmit'
            // });
            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                var newRecord = context.newRecord;
                var entity = newRecord.getValue({
                    fieldId: 'custrecord_tn_payment_entity'
                });
                var date = newRecord.getValue({
                    fieldId: 'custrecord_tn_payment_date'
                });
                var bankAccount = newRecord.getValue({
                    fieldId: 'custrecord_tn_payment_bankaccount'
                });
                var bankCurrency = newRecord.getValue({
                    fieldId: 'custrecord_tn_bankcurrency'
                });
                var currencyBody = newRecord.getValue({
                    fieldId: 'custrecord_tn_payment_currency'
                });
                var exchangeRate = newRecord.getValue({
                    fieldId: 'custrecord_tn_payment_exrate'
                });
                var memoBody = newRecord.getValue({
                    fieldId: 'custrecord_tn_payment_memo'
                });
                var memoAR = newRecord.getValue({
                    fieldId: 'custrecord_tn_memoar'
                });
                var memoAP = newRecord.getValue({
                    fieldId: 'custrecord_tn_memoap'
                });
                var mpNumber = newRecord.getValue({
                    fieldId: 'custrecord_tn_mp_number'
                });
                var subsidiary = newRecord.getValue({
                    fieldId: 'custrecord_tn_subsidiary'
                });
                var area = newRecord.getValue({ // 新增Area 带入后续单据 joe 1219
                    fieldId: 'custrecord_tn_mp_area'
                });

                // 如果修改，则先删除关联单据
                // if (context.type == context.UserEventType.EDIT) {
                // search.create({
                // type: search.Type.TRANSACTION,
                // filters: [['custbody_tn_mpnumber', 'is', mpNumber], 'AND',
                // ['mainline', 'is',
                // 'T']]
                // }).run().each(function(result) {
                // try {
                // var id = record.delete({
                // type: result.recordType,
                // id: result.id,
                // });
                // } catch(e) {
                // return true;
                // }
                // return true;
                // });
                // }
                var vendorId;
                var customerId;
                // 查找关联entity
                var entSearch = search.create({
                    type: search.Type.ENTITY,
                    filters: [['internalid', 'anyof', entity]]
                });
                entSearch.run().each(function(result) {
                    // alert(result.recordType);
                    if (result.recordType == 'customer') {
                        var cusRecord = record.load({
                            type: record.Type.CUSTOMER,
                            id: result.id,
                            isDynamic: true
                        });
                        customerId = entity;
                        vendorId = cusRecord.getValue({
                            fieldId: 'custentity_tn_customer_vendor'
                        });
                    } else if (result.recordType == 'vendor') {
                        var venRecord = record.load({
                            type: record.Type.VENDOR,
                            id: result.id,
                            isDynamic: true
                        });
                        vendorId = entity;
                        customerId = venRecord.getValue({
                            fieldId: 'custentity_tn_vendor_customer'
                        });
                    } else {
                        vendorId = entity;
                    }
                    return true;
                });
                // 1 创建invoiceList
                var invCount = newRecord.getLineCount({
                    sublistId: 'recmachcustrecord_tn_mpinv_mpid'
                });
                var currencys = [];
                var invoiceList = [];
                // 先查询有几种currency
                for (var i = 0; i < invCount; i++) {
                    var currency = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpinv_mpid',
                        fieldId: 'custrecord_inv_currency',
                        line: i
                    });
                    var isSelect = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpinv_mpid',
                        fieldId: 'custrecord_inv_apply',
                        line: i
                    });
                    var arAccount = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpinv_mpid',
                        fieldId: 'custrecord_inv_araccount',
                        line: i
                    });
                    var curAcc = currency + ',' + arAccount;
                    if (currencys.indexOf(curAcc) == '-1' && isSelect == 'T') {
                        currencys.push(curAcc);
                    }
                }
                for (var i = 0; i < currencys.length; i++) {
                    var currency = currencys[i].split(',')[0];
                    var arAccount = currencys[i].split(',')[1];
                    var invoiceMap = {
                        currency: currency,
                        arAccount: arAccount,
                        invoices: {}
                    };
                    for (var j = 0; j < invCount; j++) {
                        var isSelect = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpinv_mpid',
                            fieldId: 'custrecord_inv_apply',
                            line: j
                        });
                        var recordId = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpinv_mpid',
                            fieldId: 'custrecord_inv_type',
                            line: j
                        });
                        var line = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpinv_mpid',
                            fieldId: 'custrecord_inv_line',
                            line: j
                        });
                        var payment = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpinv_mpid',
                            fieldId: 'custrecord_inv_amount',
                            line: j
                        });
                        var currencyL = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpinv_mpid',
                            fieldId: 'custrecord_inv_currency',
                            line: j
                        });
                        var arAccountL = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpinv_mpid',
                            fieldId: 'custrecord_inv_araccount',
                            line: j
                        });
                        if (isSelect == 'T' && payment && currencyL == currency && arAccountL == arAccount) {
                            invoiceMap.invoices[recordId + '|' + line] = payment;
                        }
                    }
                    if (JSON.stringify(invoiceMap.invoices) != '{}') {
                        invoiceList.push(invoiceMap);
                    }
                }
                // 2 创建creditList
                var creCount = newRecord.getLineCount({
                    sublistId: 'recmachcustrecord_tn_mpcre_mpid'
                });
                var currencysCre = [];
                var creditList = [];
                for (var i = 0; i < creCount; i++) {
                    var isSelect = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpcre_mpid',
                        fieldId: 'custrecord_cre_apply',
                        line: i
                    });
                    var currency = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpcre_mpid',
                        fieldId: 'custrecord_cre_currency',
                        line: i
                    });
                    var arAccount = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpcre_mpid',
                        fieldId: 'custrecord_cre_araccount',
                        line: i
                    });
//                    log.debug({
//                        title: 'isSelect',
//                        details: isSelect
//                    });
                    var curAcc = currency + ',' + arAccount;
                    if (currencysCre.indexOf(curAcc) == '-1' && isSelect == 'T') {
                        currencysCre.push(curAcc);
                    }
                }
//                log.debug({
//                    title: 'currencysCre',
//                    details: JSON.stringify(currencysCre)
//                });
                for (var i = 0; i < currencysCre.length; i++) {
                    var currency = currencysCre[i].split(',')[0];
                    var arAccount = currencysCre[i].split(',')[1];
                    var creMap = {
                        currency: currency,
                        arAccount: arAccount,
                        credits: {}
                    };
                    for (var j = 0; j < creCount; j++) {
                        var isSelect = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpcre_mpid',
                            fieldId: 'custrecord_cre_apply',
                            line: j
                        });
                        var recordId = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpcre_mpid',
                            fieldId: 'custrecord_cre_type',
                            line: j
                        });
                        var line = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpcre_mpid',
                            fieldId: 'custrecord_cre_line',
                            line: j
                        });
                        var payment = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpcre_mpid',
                            fieldId: 'custrecord_cre_amount',
                            line: j
                        });
                        var currencyL = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpcre_mpid',
                            fieldId: 'custrecord_cre_currency',
                            line: j
                        });
                        var arAccountL = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpcre_mpid',
                            fieldId: 'custrecord_cre_araccount',
                            line: j
                        });
//                        log.debug({
//                            title: 'payment&currency&currencyL&account&arAccountL',
//                            details: payment+'&'+currency+'&'+currencyL+'&'+account+'&'+arAccountL
//                        });
                        if (isSelect == 'T' && payment && currency == currencyL && arAccount == arAccountL) {
                            creMap.credits[recordId + '|' + line] = payment;
                        }
                    }
                    if (JSON.stringify(creMap.credits) != '{}') {
                        creditList.push(creMap);
                    }

                }
//                log.debug({
//                    title: 'creditList',
//                    details: JSON.stringify(creditList)
//                });
                // 4、创建CUSTOMER_PAYMENT AR
                for (var i = 0; i < invoiceList.length; i++) {
                    var cpayRecord = record.create({
                        type: record.Type.CUSTOMER_PAYMENT,
                        isDynamic: true,
                        defaultValues: { // 注意：要用defaultValues才能达到和界面创建一样的效果，直接赋值customer没用
                            entity: customerId
                        }
                    });
                    // 设置mpnumber 作为标记
                    cpayRecord.setValue({
                        fieldId: 'custbody_tn_mpnumber',
                        value: mpNumber
                    });
                    // 设置date
                    cpayRecord.setValue({
                        fieldId: 'trandate',
                        value: date
                    });
                    // 设置date
                    cpayRecord.setValue({
                        fieldId: 'memo',
                        value: memoAR
                    });
                    // 设置currency
                    cpayRecord.setValue({
                        fieldId: 'currency',
                        value: invoiceList[i].currency
                    });
                    if (invoiceList[i].currency != '1') {
                        // 设置exchangerate
                        cpayRecord.setValue({
                            fieldId: 'exchangerate',
                            value: exchangeRate
                        });
                    }
                    // 设置undepfunds
                    cpayRecord.setValue({
                        fieldId: 'undepfunds',
                        value: 'F'
                    });
                    // 设置account
                    cpayRecord.setValue({
                        fieldId: 'account',
                        value: bankAccount
                    });
                    // 设置araccount
                    cpayRecord.setValue({
                        fieldId: 'aracct',
                        value: invoiceList[i].arAccount
                    });
                    // 设置area
                    if (area) {
                        cpayRecord.setValue({
                            fieldId: 'custbody_cseg_tn_area',
                            value: area
                        });
                    }
                    // 设置invoice
                    var invNum = cpayRecord.getLineCount({
                        sublistId: 'apply'
                    });
                    for (var j = 0; j < invNum; j++) {
                        var internalid = cpayRecord.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'internalid',
                            line: j
                        });
                        var line = cpayRecord.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'line',
                            line: j
                        });
                        var key = internalid + '|' + line;
                        // log.debug({
                        // title : 'invoiceList',
                        // details : JSON.stringify(invoiceList[i].invoices)
                        // +'|'+internalid
                        // });
                        if (invoiceList[i].invoices[key]) {
                            var payment = invoiceList[i].invoices[key];
                            // 动态模式下（DynamicRecord）用下面三个步骤设置line上的值
                            var lineNum = cpayRecord.selectLine({
                                sublistId: 'apply',
                                line: j
                            });
                            cpayRecord.setCurrentSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                value: true
                            });
                            cpayRecord.setCurrentSublistValue({
                                sublistId: 'apply',
                                fieldId: 'amount',
                                value: payment
                            });
                            cpayRecord.commitLine({
                                sublistId: 'apply'
                            });
                        }
                    }

                    // 设置Credit Memo
                    for (var j = 0; j < creditList.length; j++) {
                        if (creditList[j].currency == invoiceList[i].currency && creditList[j].arAccount == invoiceList[i].arAccount) {
                            var creNum = cpayRecord.getLineCount({
                                sublistId: 'credit'
                            });
                            for (var k = 0; k < creNum; k++) {
                                var internalid = cpayRecord.getSublistValue({
                                    sublistId: 'credit',
                                    fieldId: 'internalid',
                                    line: k
                                });
                                var line = cpayRecord.getSublistValue({
                                    sublistId: 'credit',
                                    fieldId: 'line',
                                    line: k
                                });
                                var key = internalid + '|' + line;
                                if (creditList[j].credits[key]) {
                                    var payment = creditList[j].credits[key];
                                    // 动态模式下（DynamicRecord）用下面三个步骤设置line上的值
                                    var lineNum = cpayRecord.selectLine({
                                        sublistId: 'credit',
                                        line: k
                                    });
                                    cpayRecord.setCurrentSublistValue({
                                        sublistId: 'credit',
                                        fieldId: 'apply',
                                        value: true
                                    });
                                    cpayRecord.setCurrentSublistValue({
                                        sublistId: 'credit',
                                        fieldId: 'amount',
                                        value: payment
                                    });
                                    cpayRecord.commitLine({
                                        sublistId: 'credit'
                                    });
                                }
                            }
                        }
                    }
                    var id = cpayRecord.save();
                }
                // 如果没有选择invoice 则生成CUSTOMER_REFUND
                if (invoiceList.length == 0) {
                    for (var i = 0; i < creditList.length; i++) {
                        var creRecord = record.create({
                            type: record.Type.CUSTOMER_REFUND,
                            isDynamic: true,
                            defaultValues: { // 注意：要用defaultValues才能达到和界面创建一样的效果，直接赋值customer没用
                                entity: customerId
                            }
                        });
                        // 设置mpnumber 作为标记
                        creRecord.setValue({
                            fieldId: 'custbody_tn_mpnumber',
                            value: mpNumber
                        });
                        // 设置date
                        creRecord.setValue({
                            fieldId: 'trandate',
                            value: date
                        });
                        // 设置date
                        creRecord.setValue({
                            fieldId: 'memo',
                            value: memoAR
                        });
                        // 设置currency
                        creRecord.setValue({
                            fieldId: 'currency',
                            value: creditList[i].currency
                        });
                        if (creditList[i].currency != '1') {
                            // 设置exchangerate
                            creRecord.setValue({
                                fieldId: 'exchangerate',
                                value: exchangeRate
                            });
                        }
                        // 设置account
                        creRecord.setValue({
                            fieldId: 'account',
                            value: bankAccount
                        });
                        // 设置paymentmethod 默认cash
                        creRecord.setValue({
                            fieldId: 'paymentmethod',
                            value: '2'
                        });
                        // 设置araccount
                        creRecord.setValue({
                            fieldId: 'aracct',
                            value: creditList[i].arAccount
                        });
                        // 设置area
                        if (area) {
                            creRecord.setValue({
                                fieldId: 'custbody_cseg_tn_area',
                                value: area
                            });
                        }
                        var creNum = creRecord.getLineCount({
                            sublistId: 'apply'
                        });
                        for (var j = 0; j < creNum; j++) {
                            var internalid = creRecord.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'internalid',
                                line: j
                            });
                            var line = creRecord.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'line',
                                line: j
                            });
                            var key = internalid + '|' + line;
                            if (creditList[j].credits[key]) {
                                var payment = creditList[j].credits[key];
                                // 动态模式下（DynamicRecord）用下面三个步骤设置line上的值
                                var lineNum = creRecord.selectLine({
                                    sublistId: 'apply',
                                    line: j
                                });
                                creRecord.setCurrentSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'apply',
                                    value: true
                                });
                                creRecord.setCurrentSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'amount',
                                    value: payment
                                });
                                creRecord.commitLine({
                                    sublistId: 'apply'
                                });
                            }
                        }
                        creRecord.save();
                    }
                }

                // 3 创建ap map
                var apCount = newRecord.getLineCount({
                    sublistId: 'recmachcustrecord_tn_mpap_mpid'
                });
                var curAccs = [];
                // 先计算apaccount和currency的组合
                for (var i = 0; i < apCount; i++) {
                    var currency = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpap_mpid',
                        fieldId: 'custrecord_ap_currency',
                        line: i
                    });
                    var apAccount = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpap_mpid',
                        fieldId: 'custrecord_ap_apaccount',
                        line: i
                    });
                    var isSelect = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpap_mpid',
                        fieldId: 'custrecord_ap_apply',
                        line: i
                    });
                    var curAcc = currency + ',' + apAccount;
                    if (curAccs.indexOf(curAcc) == '-1' && isSelect == 'T') {
                        curAccs.push(curAcc);
                    }
                }
                // log.debug({
                // title : 'curAccs',
                // details :curAccs
                // });
                var billList = [];
                for (var i = 0; i < curAccs.length; i++) {
                    var currency = curAccs[i].split(',')[0];
                    var apAccount = curAccs[i].split(',')[1];
                    var billMap = {
                        currency: currency,
                        apAccount: apAccount,
                        bills: {}
                    };
                    for (var j = 0; j < apCount; j++) {
                        var isSelect = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpap_mpid',
                            fieldId: 'custrecord_ap_apply',
                            line: j
                        });
                        var recordId = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpap_mpid',
                            fieldId: 'custrecord_ap_type',
                            line: j
                        });
                        var line = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpap_mpid',
                            fieldId: 'custrecord_ap_line',
                            line: j
                        });
                        var currencyLine = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpap_mpid',
                            fieldId: 'custrecord_ap_currency',
                            line: j
                        });
                        var apAccountLine = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpap_mpid',
                            fieldId: 'custrecord_ap_apaccount',
                            line: j
                        });
                        var payment = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpap_mpid',
                            fieldId: 'custrecord_ap_amount',
                            line: j
                        });
                        if (isSelect == 'T' && payment && currencyLine == currency && apAccountLine == apAccount) {
                            billMap.bills[recordId + '|' + line] = payment;
                        }
                    }
                    if (JSON.stringify(billMap.bills) != '{}') {
                        billList.push(billMap);
                    }
                }
                // log.debug({
                // title : 'billList',
                // details :billList
                // });
                // 5、创建bill payment
                for (var i = 0; i < billList.length; i++) {
                    var vpayRecord = record.create({
                        type: record.Type.VENDOR_PAYMENT,
                        isDynamic: true,
                        defaultValues: { // 注意：要用defaultValues才能达到和界面创建一样的效果，直接赋值customer没用
                            entity: vendorId
                        }
                    });
                    // log.debug({
                    // title : 'vendorId',
                    // details :vendorId
                    // });
                    // 设置mpnumber 作为标记
                    vpayRecord.setValue({
                        fieldId: 'custbody_tn_mpnumber',
                        value: mpNumber
                    });
                    // 设置date
                    vpayRecord.setValue({
                        fieldId: 'trandate',
                        value: date
                    });
                    vpayRecord.setValue({
                        fieldId: 'memo',
                        value: memoAP
                    });
                    // 设置currency
                    vpayRecord.setValue({
                        fieldId: 'currency',
                        value: billList[i].currency
                    });
                    if (billList[i].currency != '1') {
                        // 设置exchangerate
                        vpayRecord.setValue({
                            fieldId: 'exchangerate',
                            value: exchangeRate
                        });
                    }
                    // 设置account
                    vpayRecord.setValue({
                        fieldId: 'account',
                        value: bankAccount
                    });
                    // 设置apaccount
                    vpayRecord.setValue({
                        fieldId: 'apacct',
                        value: billList[i].apAccount
                    });
                    // 设置area
                    if (area) {
                        vpayRecord.setValue({
                            fieldId: 'custbody_cseg_tn_area',
                            value: area
                        });
                    }
                    // var billMap = {
                    // currency: currency,
                    // apAccount: apAccount,
                    // bills: {}
                    // };
                    var apNum = vpayRecord.getLineCount({
                        sublistId: 'apply'
                    });
                    for (var j = 0; j < apNum; j++) {
                        var internalid = vpayRecord.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'internalid',
                            line: j
                        });
                        var line = vpayRecord.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'line',
                            line: j
                        });
                        var key = internalid + '|' + line;
                        if (billList[i].bills[key]) {
                            var payment = billList[i].bills[key];
                            // 动态模式下（DynamicRecord）用下面三个步骤设置line上的值
                            var lineNum = vpayRecord.selectLine({
                                sublistId: 'apply',
                                line: j
                            });
                            vpayRecord.setCurrentSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                value: true
                            });
                            vpayRecord.setCurrentSublistValue({
                                sublistId: 'apply',
                                fieldId: 'amount',
                                value: payment
                            });
                            vpayRecord.commitLine({
                                sublistId: 'apply'
                            });
                        }
                    }
                    var vpayId = vpayRecord.save();
                    // 保存完payment，给汇兑损溢打上标记 Currency Revaluation
                    // var rateSys = currencyF.exchangeRate({
                    // source: currencyBody,
                    // target: 'USD'
                    // });
                    // log.debug({
                    // title : 'rateSys',
                    // details :rateSys
                    // });
                    // 如果没有产生汇兑损溢，则不执行
                    // if (exchangeRate != rateSys) {
                    // var curRevId;
                    // search.create({
                    // type: 'fxreval',
                    // filters: [['mainline', 'is', 'T']],
                    // columns:[search.createColumn({
                    // name:'internalid',
                    // sort:search.Sort.ASC
                    // })]
                    // }).run().each(function(result) {
                    // // log.debug({
                    // // title : 'result。id',
                    // // details :result.id
                    // // });
                    // curRevId = result.id;
                    // return true;
                    // });
                    // if (curRevId) {
                    // var curRevRec = record.load({
                    // type: 'fxreval',
                    // id: curRevId
                    // });
                    // curRevRec.setValue({
                    // fieldId: 'custbody_tn_mpnumber',
                    // value: mpNumber
                    // });
                    // // curRevRec.setValue({
                    // // fieldId: 'smemo',
                    // // value: memoBody
                    // // });
                    // curRevRec.save();
                    // }
                    // }
                }

                // 6、未立项创建JE
                var npCount = newRecord.getLineCount({
                    sublistId: 'recmachcustrecord_tn_mpnp_mpid'
                });
                if (npCount > 0) {
                    var jeRecord = record.create({
                        type: record.Type.JOURNAL_ENTRY,
                        isDynamic: true
                    });
                    // 设置subsidiary 先设置成1
                    jeRecord.setValue({
                        fieldId: 'subsidiary',
                        value: subsidiary
                    });
                    // 设置mpnumber 作为标记
                    jeRecord.setValue({
                        fieldId: 'custbody_tn_mpnumber',
                        value: mpNumber
                    });
                    // 设置date
                    jeRecord.setValue({
                        fieldId: 'trandate',
                        value: date
                    });
                    jeRecord.setValue({
                        fieldId: 'memo',
                        value: memoBody
                    });
                    // 设置area
                    if (area) {
                        jeRecord.setValue({
                            fieldId: 'custbody_cseg_tn_area',
                            value: area
                        });
                    }
                    var currencyW = bankCurrency ? bankCurrency: currencyBody;
                    // 设置currency
                    jeRecord.setValue({
                        fieldId: 'currency',
                        value: currencyW
                    });
                    if (currencyW != '1') {
                        // 设置exchangerate
                        jeRecord.setValue({
                            fieldId: 'exchangerate',
                            value: exchangeRate
                        });
                    }
                    // 设置approvalstatus
                    jeRecord.setValue({
                        fieldId: 'approvalstatus',
                        value: '2'
                    });
                    var sumDebit = 0;
                    var sumCredit = 0;
                    for (var i = 0; i < npCount; i++) {
                        var account = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpnp_mpid',
                            fieldId: 'custrecord_np_account',
                            line: i
                        });
                        var debit = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpnp_mpid',
                            fieldId: 'custrecord_np_debit',
                            line: i
                        });
                        var credit = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpnp_mpid',
                            fieldId: 'custrecord_np_credit',
                            line: i
                        });
                        var memo = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpnp_mpid',
                            fieldId: 'custrecord_np_memo',
                            line: i
                        });

                        var department = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpnp_mpid',
                            fieldId: 'custrecord_np_department',
                            line: i
                        });
                        var classification = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpnp_mpid',
                            fieldId: 'custrecord_np_class',
                            line: i
                        });
                        var location = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpnp_mpid',
                            fieldId: 'custrecord_np_location',
                            line: i
                        });
                        var area = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpnp_mpid',
                            fieldId: 'custrecord_np_area',
                            line: i
                        });

                        var line = jeRecord.selectNewLine({
                            sublistId: 'line'
                        });
                        // account
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: account
                        });
                        if (debit) {
                            // log.debug({
                            // title : 'debit',
                            // details : debit
                            // });
                            // debit
                            line.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: debit
                            });
                            line.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: 0
                            });
                            credit = 0;
                        }
                        if (credit) {
                            // log.debug({
                            // title : 'credit',
                            // details : credit
                            // });
                            // credit
                            line.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: credit
                            });
                            line.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: 0
                            });
                            debit = 0;
                        }
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: memo
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            value: department
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: classification
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: location
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_cseg_tn_area',
                            value: area
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: entity
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'currency',
                            value: currencyBody
                        });
                        line.commitLine({
                            sublistId: 'line'
                        });
                        sumDebit += parseFloat(debit);
                        sumCredit += parseFloat(credit);

                    }
                    sumDebit = sumDebit.toFixed(2);
                    sumCredit = sumCredit.toFixed(2);
                    var bankAmount = sumDebit - sumCredit;
                    bankAmount = bankAmount.toFixed(2);
                    // log.debug({
                    // title : 'bankAmount',
                    // details :sumDebit+'|'+ sumCredit+'|'+bankAmount
                    // });
                    if (bankAmount != 0) {
                        var line1 = jeRecord.selectNewLine({
                            sublistId: 'line'
                        });
                        // account
                        line1.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: bankAccount
                        });
                        // currency
                        line1.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'currency',
                            value: currencyBody
                        });
                        line1.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: memoBody
                        });
                        line1.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: entity
                        });
                        // 配平数据
                        // log.debug({
                        // title : 'bankAmount',
                        // details : bankAmount
                        // });
                        if (bankAmount > 0) {
                            line1.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: bankAmount
                            });
                            line1.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: 0
                            });
                        } else {
                            // log.debug({
                            // title : 'bankAmount',
                            // details : Math.abs(bankAmount)
                            // });
                            line1.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: 0
                            });
                            line1.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: Math.abs(bankAmount)
                            });
                        }
                        line1.commitLine({
                            sublistId: 'line'
                        });
                    }
                    // log.debug({
                    // title : 'line1',
                    // details : line1
                    // });
                    var id = jeRecord.save();
                    // log.debug({
                    // title : 'id',
                    // details : id
                    // });
                }

                // 7、Others
                var otCount = newRecord.getLineCount({
                    sublistId: 'recmachcustrecord_tn_mpot_mpid'
                });
                var currencys = [];
                for (var i = 0; i < otCount; i++) {
                    var currency = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpot_mpid',
                        fieldId: 'custrecord_ot_currency',
                        line: i
                    });
                    var isSelect = newRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_tn_mpot_mpid',
                        fieldId: 'custrecord_ot_apply',
                        line: i
                    });
                    if (currencys.indexOf(currency) == '-1' && isSelect == 'T') {
                        currencys.push(currency);
                    }
                }
                var jeList = [];
                for (var i = 0; i < currencys.length; i++) {
                    var currency = currencys[i];
                    var jeMap = {
                        currency: currency,
                        jes: []
                    };
                    for (var j = 0; j < otCount; j++) {
                        var isSelect = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpot_mpid',
                            fieldId: 'custrecord_ot_apply',
                            line: j
                        });
                        var currencyLine = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpot_mpid',
                            fieldId: 'custrecord_ot_currency',
                            line: j
                        });
                        var payment = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpot_mpid',
                            fieldId: 'custrecord_ot_amount',
                            line: j
                        });
                        var account = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpot_mpid',
                            fieldId: 'custrecord_ot_account',
                            line: j
                        });
                        var memo = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpot_mpid',
                            fieldId: 'custrecord_ot_memo',
                            line: j
                        });
                        var balance = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpot_mpid',
                            fieldId: 'custrecord_ot_balance',
                            line: j
                        });
                        // 新增year add by
                        // joe 1220
                        var _year = newRecord.getSublistValue({
                            sublistId: 'recmachcustrecord_tn_mpot_mpid',
                            fieldId: 'custrecord_ot_year',
                            line: j
                        });
                        // log.debug({
                        // title : 'payment',
                        // details : payment+'|'+account+'|'+currencyLine
                        // });
                        if (isSelect == 'T' && payment && account && currencyLine == currency && _year) {
                            memo = memo ? memo: '';
                            jeMap.jes.push([account, memo, payment, balance, _year]);
                        }
                    }
                    if (JSON.stringify(jeMap.jes) != '{}') {
                        jeList.push(jeMap);
                    }
                }
                // log.debug({
                // title : 'jeList',
                // details :jeList
                // });
                for (var i = 0; i < jeList.length; i++) {
                    var currency = jeList[i].currency;
                    var jes = jeList[i].jes;
                    var jeRecord = record.create({
                        type: record.Type.JOURNAL_ENTRY,
                        isDynamic: true
                    });
                    // 设置subsidiary
                    jeRecord.setValue({
                        fieldId: 'subsidiary',
                        value: subsidiary
                    });
                    // 设置mpnumber 作为标记
                    jeRecord.setValue({
                        fieldId: 'custbody_tn_mpnumber',
                        value: mpNumber
                    });
                    // 设置date
                    jeRecord.setValue({
                        fieldId: 'trandate',
                        value: date
                    });
                    jeRecord.setValue({
                        fieldId: 'memo',
                        value: memoBody
                    });
                    // 设置currency
                    jeRecord.setValue({
                        fieldId: 'currency',
                        value: currency
                    });
                    if (currency != '1') {
                        // 设置exchangerate
                        jeRecord.setValue({
                            fieldId: 'exchangerate',
                            value: exchangeRate
                        });
                    }
                    // 设置approvalstatus
                    jeRecord.setValue({
                        fieldId: 'approvalstatus',
                        value: '2'
                    });
                    // 设置area
                    if (area) {
                        jeRecord.setValue({
                            fieldId: 'custbody_cseg_tn_area',
                            value: area
                        });
                    }
                    for (var j = 0; j < jes.length; j++) {
                        var account = jes[j][0];
                        var memo = jes[j][1];
                        var payment = jes[j][2];
                        var balance = jes[j][3];
                        var _year = jes[j][4];
                        // 原本科目line
                        var line = jeRecord.selectNewLine({
                            sublistId: 'line'
                        });
                        // account
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: account
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: memo
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: entity
                        });
                        var debit = balance > 0 ? 0 : payment;
                        var credit = balance > 0 ? payment: 0;
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: credit
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: debit
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'custcol_csegtn_year',
                            value: _year
                        });
                        line.commitLine({
                            sublistId: 'line'
                        });

                        // 生成银行line
                        var lineBak = jeRecord.selectNewLine({
                            sublistId: 'line'
                        });
                        // accountBank
                        lineBak.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: bankAccount
                        });
                        lineBak.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: memo
                        });
                        lineBak.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: entity
                        });
                        var debit = balance > 0 ? payment: 0;
                        var credit = balance > 0 ? 0 : payment;
                        lineBak.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: debit
                        });
                        lineBak.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: credit
                        });
                        lineBak.commitLine({
                            sublistId: 'line'
                        });
                    }

// log.debug({
// title: 'jeRecord',
// details: jeRecord
// });
                    var id = jeRecord.save();
                }
                // 8、生成最後的jE
                var paymentAmount = newRecord.getValue({
                    fieldId: 'custrecord_tn_payment_amount'
                });
                var paymentBalance = newRecord.getValue({
                    fieldId: 'custrecord_tn_payment_balance'
                });
                var balanceAccount = newRecord.getValue({
                    fieldId: 'custrecord_tn_payment_balanceaccount'
                });
                if (paymentBalance == '0' || !balanceAccount || !paymentAmount) {
                    return;
                }
                var recType;
                // 查找关联entity
                var entSearch = search.create({
                    type: search.Type.ENTITY,
                    filters: [['internalid', 'anyof', entity]]
                });
                entSearch.run().each(function(result) {
                    recType = result.recordType;
                    return true;
                });
                if (paymentBalance != paymentAmount) {
                    var jeRecord = record.create({
                        type: record.Type.JOURNAL_ENTRY,
                        isDynamic: true
                    });
                    // 设置subsidiary
                    jeRecord.setValue({
                        fieldId: 'subsidiary',
                        value: subsidiary
                    });
                    // 设置mpnumber 作为标记
                    jeRecord.setValue({
                        fieldId: 'custbody_tn_mpnumber',
                        value: mpNumber
                    });
                    // 设置date
                    jeRecord.setValue({
                        fieldId: 'trandate',
                        value: date
                    });
                    jeRecord.setValue({
                        fieldId: 'memo',
                        value: memoBody
                    });
                    // 设置area
                    if (area) {
                        jeRecord.setValue({
                            fieldId: 'custbody_cseg_tn_area',
                            value: area
                        });
                    }
                    var currencyLast = bankCurrency ? bankCurrency: currencyBody;
                    // 设置currency
                    jeRecord.setValue({
                        fieldId: 'currency',
                        value: currencyLast
                    });
                    if (currencyLast != '1') {
                        // 设置exchangerate
                        jeRecord.setValue({
                            fieldId: 'exchangerate',
                            value: exchangeRate
                        });
                    }
                    // 设置approvalstatus
                    jeRecord.setValue({
                        fieldId: 'approvalstatus',
                        value: '2'
                    });
                    var line = jeRecord.selectNewLine({
                        sublistId: 'line'
                    });
                    // account
                    line.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: balanceAccount
                    });
                    line.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: memoBody
                    });
                    line.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: entity
                    });
                    if ((recType != 'customer' && paymentAmount > 0) || (recType == 'customer' && paymentAmount < 0)) {
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: 0
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: paymentBalance
                        });
                    } else if ((recType != 'customer' && paymentAmount < 0) || (recType == 'customer' && paymentAmount > 0)) {
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: paymentBalance
                        });
                        line.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: 0
                        });
                    }
                    line.commitLine({
                        sublistId: 'line'
                    });

                    // 銀行科目
                    var lineBank = jeRecord.selectNewLine({
                        sublistId: 'line'
                    });
                    // account
                    lineBank.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: bankAccount
                    });
                    // currency
                    lineBank.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'currency',
                        value: currencyBody
                    });
                    lineBank.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: memoBody
                    });
                    lineBank.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: entity
                    });
                    if ((recType != 'customer' && paymentAmount > 0) || (recType == 'customer' && paymentAmount < 0)) {
                        lineBank.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: paymentBalance
                        });
                        lineBank.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: 0
                        });
                    } else if ((recType != 'customer' && paymentAmount < 0) || (recType == 'customer' && paymentAmount > 0)) {
                        lineBank.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: 0
                        });
                        lineBank.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: paymentBalance
                        });
                    }
                    lineBank.commitLine({
                        sublistId: 'line'
                    });
                    var balanceid = lineBank.save();
                    // log.debug({
                    // title : 'balanceid',
                    // details : balanceid
                    // });
                }
            }
            // if (context.type == context.UserEventType.EDIT) {
            // var errorObj = error.create({
            // name :'系统提示',
            // message : '请不要修改合并付款！'
            // });
            // throw errorObj;
            // }
            // 删除的时候删除所有相关单据
            if (context.type == context.UserEventType.DELETE) {
                // log.debug({
                // title : 'delete',
                // details : 'delete'
                // });
                var newRecord = context.newRecord;
                var mpNumber = newRecord.getValue({
                    fieldId: 'custrecord_tn_mp_number'
                });
                search.create({
                    type: search.Type.TRANSACTION,
                    filters: [['custbody_tn_mpnumber', 'is', mpNumber], 'AND', ['mainline', 'is', 'T']]
                }).run().each(function(result) {
                    try {
                        var id = record.delete({
                            type: result.recordType,
                            id: result.id,
                        });
                    } catch(e) {
                        return true;
                    }
                    return true;
                });
            }
        } catch(e) {
            log.debug({
                title: 'afterSubmit',
                details: e
            });
            var errorObj = error.create({
                name: e.name,
                message: e.message
            });
            throw errorObj;
        }

    }

    function returnFloat(value) {
        var value = Math.round(parseFloat(value) * 100) / 100;
        var xsd = value.toString().split(".");
        if (xsd.length == 1) {
            value = value.toString() + ".00";
            return value;
        }
        if (xsd.length > 1) {
            if (xsd[1].length < 2) {
                value = value.toString() + "0";
            }
            return value;
        }
    }
    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    };

});