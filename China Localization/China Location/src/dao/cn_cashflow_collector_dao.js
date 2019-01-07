/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/wrapper/ns_wrapper_record',
    '../lib/commons',
    '../dao/helper/search_helper'
],

function(search, record, commons, helper) {
    /**
     * @desc delete cashed transaction record by tranid.
     * @params {Number} [tranid] custrecord_mass_cfs_tranid. 
     * @return true or false according to delete result.
     */
    function delCashedTransaction(tranid) {
        //
        var tranSearch = search.create({
            type: 'customrecord_cn_cashflow_record_parent',
            filters: [
                search.createFilter({
                    name: 'custrecord_mass_cfs_tranid',
                    operator: search.Operator.EQUALTO,
                    values: tranid
                })
            ],
            columns: [
                search.createColumn({
                    name: 'internalid'
                })
            ],
        });
        var tranArray = tranSearch.run().getRange({
            start: 0,
            end: 1000
        }) || [];
        if (tranArray.length > 1) {
            log.audit('cn_cashflow_collector_dao delCashedTransaction', 'tranArray.length is ' + tranArray.length);
        }
        for ( var i in tranArray) {
            try {
                record.remove({
                    type: 'customrecord_cn_cashflow_record_parent',
                    id: tranArray[i].id
                });
            } catch (ex) {
                log.error('cn_cashflow_collector_dao', 'Delete error: ' + ex.message);
                return false;
            }
        }
        return true;
    }

    /**
     * @desc delete China Cash Flow Reconciliation whose Mass Parent is null.
     * @return true or false according to delete result.
     */
    function delCashflowReconciliation() {
        //

        var reconciliationSearch = search.create({
            type: 'customrecord_cn_cashflow_record_detail',
            filters: [
                search.createFilter({
                    name: 'custrecord_mass_cfs_parent',
                    operator: search.Operator.ANYOF,
                    values: '@NONE@'
                })
            ],
            columns: [
                search.createColumn({
                    name: 'internalid'
                })
            ],
        });
        var reconciliationArray = reconciliationSearch.run().getRange({
            start: 0,
            end: 1000
        }) || [];

        for ( var j in reconciliationArray) {
            try {
                record.remove({
                    type: 'customrecord_cn_cashflow_record_detail',
                    id: reconciliationArray[j].id
                });
            } catch (ex) {
                return false;
            }
        }
        return true;
    }

    /**
     * @desc Get the collected amount sum for the given line unique key.
     * @param linekey - unique key of the item line.
     * @return collected total amount of the item line.
     */
    function queryLineCollectedAmt(lineKey) {
        var lineSearch = search.create({
            type: 'customrecord_cn_cashflow_record_detail',
            filters: [
                search.createFilter({
                    name: 'custrecord_mass_cfs_parent',
                    operator: search.Operator.NONEOF,
                    values: '@NONE@'
                }),
                search.createFilter({
                    name: 'custrecord_cfs_line_unique_key',
                    operator: search.Operator.IS,
                    values: lineKey
                }),
                /**
                 * NSCHINA-3050, the payment might be voided using reversing Journal.
                 * VOID amount should not be accounted for collected amount.
                 * Add mainline is true to make sure that there are no duplicates.
                 * IMPORTANT: If pymt transaction is Journal Entry type, this search will return duplicate records. 
                 */
                search.createFilter({
                    name: 'voided',
                    join: 'custrecord_cfs_pymt_tranid',
                    operator: search.Operator.IS,
                    values: 'F'
                }),
                search.createFilter({
                    name: 'mainline',
                    join: 'custrecord_cfs_pymt_tranid',
                    operator: search.Operator.IS,
                    values: 'T'
                })
            ],
            columns: [
                search.createColumn({
                    name: 'custrecord_cfs_amount',
                    summary: search.Summary.SUM
                })
            ]
        });
        var collectedAmt = 0;
        lineSearch.run().each(function(result) {
            collectedAmt += commons.toNumber(result.getValue(search.createColumn({
                name: 'custrecord_cfs_amount',
                summary: search.Summary.SUM
            })));
        });
        log.debug('queryLineCollectedAmt', 'lineKey=' + lineKey + ', collectedAmt=' + collectedAmt);
        return collectedAmt;
    }

    //    /**
    //     * @desc Get the payment applied credit amount for the bill.
    //     * @param billId.
    //     * @param paymentId.
    //     * @return Amount of applied credit for the bill and payment.
    //     */
    //    function queryBillAppliedCreditAmt(billId, paymentId) {
    //        var lineSearch = search.create({
    //            type: 'customrecord_cn_cashflow_record_detail',
    //            filters: [
    //                search.createFilter({
    //                    name: 'custrecord_mass_cfs_parent',
    //                    operator: search.Operator.NONEOF,
    //                    values: '@NONE@'
    //                }),
    //                search.createFilter({
    //                    name: 'custrecord_cfs_pymt_tranid',
    //                    operator: search.Operator.IS,
    //                    values: paymentId
    //                }),
    //                search.createFilter({
    //                    name: 'custrecord_cfs_paid_tranid',
    //                    operator: search.Operator.IS,
    //                    values: billId
    //                })
    //            ],
    //            columns: [
    //                search.createColumn({
    //                    name: 'custrecord_cfs_pymt_credit_amount'
    //                })
    //            ]
    //        });
    //        var searchedResult = lineSearch.run().getRange({
    //            start: 0,
    //            end: 1
    //        }) || [];
    //        var result = 0;
    //        if (searchedResult.length > 0) {
    //            result = commons.toNumber(searchedResult[0].getValue('custrecord_cfs_pymt_credit_amount'));
    //        }
    //        return result;
    //    }

    /**
     * @desc insert into China Cash Flow Reconciliation record.
     * @param {Array} [paramArray] - the parameter array.
     * @return true or false according to insert result.
     */
    function insertCashFlowReconciliation(paramArray) {
        log.debug('Mass Save', 'params = ' + JSON.stringify(paramArray));
        if (!commons.makecertain(paramArray) || !commons.isArray(paramArray) || paramArray.length === 0) {
            log.debug('cn_cashflow_collector_dao : insertCashFlowReconciliation', 'parameter error');
            return false;
        }

        var massRecords = {};
        for ( var paramIdx in paramArray) {
            var cashedTransactionid;
            if (commons.makesure(paramArray[paramIdx]).parentid) {
                cashedTransactionid = paramArray[paramIdx].parentid;
            } else if (commons.makesure(paramArray[paramIdx].depositTranid)) {
                cashedTransactionid = paramArray[paramIdx].depositTranid;
            } else if (commons.makesure(paramArray[paramIdx].pymtTranid)) {
                cashedTransactionid = paramArray[paramIdx].pymtTranid;
            } else {
                log.error('cn_cashflow_collector_dao : insertCashFlowReconciliation', 'invalid parameter, both deposit transaction id and payment id are empty');
                continue;
            }
            var massOpsRecord;
            if (!massRecords[cashedTransactionid]) {
                massOpsRecord = record.create({
                    type: 'customrecord_cn_cashflow_record_parent',
                    isDynamic: true
                });
                massOpsRecord.setValue({
                    fieldId: 'custrecord_mass_cfs_tranid',
                    value: commons.toNumber(cashedTransactionid)
                });
                massRecords[cashedTransactionid] = massOpsRecord;
            } else {
                massOpsRecord = massRecords[cashedTransactionid];
            }

            massOpsRecord.selectNewLine({
                sublistId: 'recmachcustrecord_mass_cfs_parent'
            });
            massOpsRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_mass_cfs_parent',
                fieldId: 'custrecord_cfs_line_unique_key',
                value: paramArray[paramIdx].lineUniqueKey
            });
            massOpsRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_mass_cfs_parent',
                fieldId: 'custrecord_cfs_deposit_tranid',
                value: paramArray[paramIdx].depositTranid
            });
            massOpsRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_mass_cfs_parent',
                fieldId: 'custrecord_cfs_pymt_tranid',
                value: paramArray[paramIdx].pymtTranid
            });
            massOpsRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_mass_cfs_parent',
                fieldId: 'custrecord_cfs_paid_tranid',
                value: paramArray[paramIdx].paidTranid
            });
            massOpsRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_mass_cfs_parent',
                fieldId: 'custrecord_cfs_subsidiary',
                value: paramArray[paramIdx].subsidiary
            });
            massOpsRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_mass_cfs_parent',
                fieldId: 'custrecord_cfs_period',
                value: paramArray[paramIdx].period
            });
            massOpsRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_mass_cfs_parent',
                fieldId: 'custrecord_cfs_trandate',
                value: paramArray[paramIdx].trandate
            });
            massOpsRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_mass_cfs_parent',
                fieldId: 'custrecord_cfs_item',
                value: paramArray[paramIdx].item
            });
            massOpsRecord.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_mass_cfs_parent',
                fieldId: 'custrecord_cfs_amount',
                value: paramArray[paramIdx].amount
            });
            //            massOpsRecord.setCurrentSublistValue({
            //                sublistId: 'recmachcustrecord_mass_cfs_parent',
            //                fieldId: 'custrecord_cfs_pymt_credit_amount',
            //                value: paramArray[paramIdx].creditAppliedAmt
            //            });

            if (commons.makesure(paramArray[paramIdx].location)) {
                massOpsRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_mass_cfs_parent',
                    fieldId: 'custrecord_cfs_location',
                    value: paramArray[paramIdx].location
                });
            }
            if (commons.makesure(paramArray[paramIdx].department)) {
                massOpsRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_mass_cfs_parent',
                    fieldId: 'custrecord_cfs_department',
                    value: paramArray[paramIdx].department
                });
            }
            if (commons.makesure(paramArray[paramIdx].classification)) {
                massOpsRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_mass_cfs_parent',
                    fieldId: 'custrecord_cfs_class',
                    value: paramArray[paramIdx].classification
                });
            }
            massOpsRecord.commitLine({
                sublistId: 'recmachcustrecord_mass_cfs_parent'
            });
            log.debug('Mass Save', 'committed one line.');
        }

        for ( var recordIdx in massRecords) {
            massRecords[recordIdx].save();
            log.debug('Mass Save', 'saved one parent with its details.');
        }
        return true;
    }
    /**
     * @desc get cashed transaction record by tranid.
     * @params {Number} [tranid] custrecord_mass_cfs_tranid. 
     * @return cashed transaction array.
     */
    function getCashedTransactionById(tranid) {
        //
        var tranSearch = search.create({
            type: 'customrecord_cn_cashflow_record_parent',
            filters: [
                search.createFilter({
                    name: 'custrecord_mass_cfs_tranid',
                    operator: search.Operator.EQUALTO,
                    values: tranid
                })
            ],
            columns: [
                search.createColumn({
                    name: 'internalid'
                })
            ],
        });
        var tranArray = tranSearch.run().getRange({
            start: 0,
            end: 1000
        }) || [];
        return tranArray;
    }

    function deleteConditionedCollectedEntries(params) {
        log.debug('cn_cashflow_collector_dao.deleteConditionedCollectedEntries: params', params);
        var lineUniqueKey = params.lineUniqueKey;

        var asearch = search.create({
            type: 'customrecord_cn_cashflow_record_detail',
            filters: [
                helper.filter('custrecord_cfs_line_unique_key').is(lineUniqueKey)
            ],
            columns: [
                search.createColumn({
                    name: 'internalid'
                })
            ],
        });
        var entries = helper.resultset(asearch.run());
        log.debug('cn_cashflow_collector_dao.deleteConditionedCollectedEntries: entries', entries);

        for ( var i in entries) {
            var entry = record.load({
                type: 'customrecord_cn_cashflow_record_detail',
                id: entries[i].id,
                isDynamic: true
            });
            entry.setValue({
                fieldId: 'custrecord_mass_cfs_parent',
                value: null
            });
            entry.save();
        }
    }

    return {
        queryLineCollectedAmt: queryLineCollectedAmt,
        //        queryBillAppliedCreditAmt: queryBillAppliedCreditAmt,
        delCashflowReconciliation: delCashflowReconciliation,
        delCashedTransaction: delCashedTransaction,
        insertCashFlowReconciliation: insertCashFlowReconciliation,
        getCashedTransactionById: getCashedTransactionById,
        deleteConditionedCollectedEntries: deleteConditionedCollectedEntries
    };

});
