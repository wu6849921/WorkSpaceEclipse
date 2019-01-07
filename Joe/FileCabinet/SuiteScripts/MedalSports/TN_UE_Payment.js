/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],

function(record, search) {
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
	 * 
	 * 提交之后生成自定义apply record
	 */
    function afterSubmit(context) {
        // log.debug({
        // title : 'afterSubmit'
        // });
        try {
            if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE || context.type == context.UserEventType.COPY) {
                var newRecord = context.newRecord;
                var oldRecord = context.oldRecord;
                if(context.type == context.UserEventType.CREATE){
                	arpaccountOld == '';
                	payeeOrCustomerOld == '';
                }else{
                	var arpaccountOld = oldRecord.getValue({
                		fieldId: 'custbody_tn_payment_apaccount'
                	});
                	var payeeOrCustomerOld = oldRecord.getValue({
                		fieldId: 'custbody_tn_payment_payee'
                	});
                }
                var arpaccount = newRecord.getValue({
                	fieldId: 'custbody_tn_payment_apaccount'
                });
                var payeeOrCustomer = newRecord.getValue({
                	fieldId: 'custbody_tn_payment_payee'
                });
                if (!arpaccount || !payeeOrCustomer) {
                    return;
                }
                // 如果参数有变化生成新的customrecord_tn_payment_apply
                if(arpaccountOld != arpaccount || payeeOrCustomerOld!=payeeOrCustomer){
                	 // 先删除原来的customrecord_tn_payment_apply
                    var appSearch = search.create({
                        type: 'customrecord_tn_payment_apply',
                        filters: [['custrecord_tn_apply_payment', 'is', newRecord.id]]
                    });
                    appSearch.run().each(function(result) {
                        var applyId = record.delete({
                            type: 'customrecord_tn_payment_apply',
                            id: result.id
                        });
                        return true;
                    });
                    // 查询符合条件的bill
                    var vpSearch = search.create({
                        type: search.Type.VENDOR_BILL,
                        filters: [['account', 'is', arpaccount], 'AND', ['entity', 'is', payeeOrCustomer]],
                        columns: ['duedate', 'status']
                    });
                    vpSearch.run().each(function(result) {
                        var status = result.getText({
                            name: 'status'
                        });
                        var date = result.getValue({
                            name: 'duedate'
                        });
                        // log.debug({
                        // title : 'status',
                        // details : status
                        // });
                        if (date && status == 'Open') {
                            var dateArr = date.split('/');
                            var dateNew = dateArr[1] + '/' + dateArr[0] + '/' + dateArr[2];
                            var applyRec = record.create({
                                type: 'customrecord_tn_payment_apply',
                                isDynamic: true
                            });
                            applyRec.setValue({
                                fieldId: 'custrecord_tn_apply_payment',
                                value: newRecord.id
                            });
                            applyRec.setValue({
                                fieldId: 'custrecord_tn_apply_type',
                                value: result.id
                            });
                            var applyId = applyRec.save();
                        }
                        return true;
                    });
                    // 如果没有变化则生成BillPayment
                }else if(arpaccountOld == arpaccount && payeeOrCustomerOld==payeeOrCustomer){
                	var selectedBill = [];
                    var appSearch = search.create({
                        type: 'customrecord_tn_payment_apply',
                        filters: [['custrecord_tn_apply_payment', 'is', newRecord.id]],
                        columns: ['custrecord_tn_apply_type', 'custrecord_tn_apply_apply']
                    });
                    appSearch.run().each(function(result) {
                        var appType = result.getValue({
                            name: 'custrecord_tn_apply_type'
                        });
                        var isApply = result.getValue({
                            name: 'custrecord_tn_apply_apply'
                        });
                         log.debug({
                         title : 'appType&&isApply',
                         details : appType+'&'+isApply
                         });
                        if (isApply) {
                            selectedBill.push(appType);
                        }
                        return true;
                    });

                     log.debug({
                     title : 'selectedBill',
                     details : selectedBill
                     });
                    if (selectedBill.lenght == 0) {
                        return;
                    }
                    // 生成billpayment
                    var vpRec = record.create({
                        type: search.Type.VENDOR_PAYMENT,
                        isDynamic: true
                    });
                    vpRec.setValue({
                        fieldId: 'entity',
                        value: payeeOrCustomer
                    });
                    var numLines = vpRec.getLineCount({
                        sublistId: 'apply'
                    });
                    for (var i = 0; i < numLines; i++) {
                        var internalid = vpRec.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'internalid',
                            line: i
                        });
                         log.debug({
                         title : 'internalid|selectedBill',
                         details : internalid+'|'+selectedBill
                         });
                        if (selectedBill.indexOf(internalid) >= 0) {
                            log.debug({
                                title: 'internalid',
                                details: internalid
                            });
                            // 动态模式下（DynamicRecord）用下面三个步骤设置line上的值
                            var lineNum = vpRec.selectLine({
                                sublistId: 'apply',
                                line: i
                            });
                            vpRec.setCurrentSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                value: true
                            });
                            vpRec.commitLine({
                                sublistId: 'apply'
                            });
                        }
                    }
                    var vpId = vpRec.save();
                }

            }
        } catch(e) {
            log.debug({
                title: 'afterSubmit',
                details: e
            });
        }
    }

    /**
	 * 提交之前生成billpayment
	 */
    function beforeSubmit(context) {
        try {
            if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE || context.type == context.UserEventType.COPY) {
                var newRecord = context.newRecord;
                var oldRecord = context.oldRecord;
                var arpaccount = newRecord.getValue({
                    fieldId: 'custbody_tn_payment_apaccount'
                });
                var payeeOrCustomer = newRecord.getValue({
                    fieldId: 'custbody_tn_payment_payee'
                });
                var selectedBill = [];
                var appSearch = search.create({
                    type: 'customrecord_tn_payment_apply',
                    filters: [['custrecord_tn_apply_payment', 'is', newRecord.id]],
                    columns: ['custrecord_tn_apply_type', 'custrecord_tn_apply_apply']
                });
                appSearch.run().each(function(result) {
                    var appType = result.getValue({
                        name: 'custrecord_tn_apply_type'
                    });
                    var isApply = result.getValue({
                        name: 'custrecord_tn_apply_apply'
                    });
                     log.debug({
                     title : 'appType&&isApply',
                     details : appType+'&'+isApply
                     });
                    if (isApply) {
                        selectedBill.push(appType);
                    }
                    return true;
                });

                 log.debug({
                 title : 'selectedBill',
                 details : selectedBill
                 });
                if (selectedBill.lenght == 0) {
                    return;
                }
                // 生成billpayment
                var vpRec = record.create({
                    type: search.Type.VENDOR_PAYMENT,
                    isDynamic: true
                });
                vpRec.setValue({
                    fieldId: 'entity',
                    value: payeeOrCustomer
                });
                var numLines = vpRec.getLineCount({
                    sublistId: 'apply'
                });
                for (var i = 0; i < numLines; i++) {
                    var internalid = vpRec.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'internalid',
                        line: i
                    });
                     log.debug({
                     title : 'internalid|selectedBill',
                     details : internalid+'|'+selectedBill
                     });
                    if (selectedBill.indexOf(internalid) >= 0) {
                        log.debug({
                            title: 'internalid',
                            details: internalid
                        });
                        // 动态模式下（DynamicRecord）用下面三个步骤设置line上的值
                        var lineNum = vpRec.selectLine({
                            sublistId: 'apply',
                            line: i
                        });
                        vpRec.setCurrentSublistValue({
                            sublistId: 'apply',
                            fieldId: 'apply',
                            value: true
                        });
                        vpRec.commitLine({
                            sublistId: 'apply'
                        });
                    }
                }
                var vpId = vpRec.save();

            }
        } catch(e) {
            log.debug({
                title: 'beforeSubmit',
                details: e
            });
        }
    }
    return {
// beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});