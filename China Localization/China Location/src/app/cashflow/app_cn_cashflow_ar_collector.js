/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../dao/cn_cashflow_dao',
    '../../dao/helper/search_helper',
    '../helper/cashflow_helper',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_record',
    '../../dao/cn_cashflow_collector_dao'
],

function(cashflowDAO, helper, cashflowHelper, runtime, commons, format, record, collectoDAO) {

    // tranType === record.Type.CUSTOMER_PAYMENT || tranType === record.Type.DEPOSIT || tranType === record.Type.CUSTOMER_DEPOSIT || tranType === record.Type.CUSTOMER_REFUND || tranType === record.Type.CASH_SALE || tranType === record.Type.CASH_REFUND || tranType === 'CustPymt';
    var recordTypeWhiteList = [
        record.Type.CUSTOMER_PAYMENT,
        record.Type.DEPOSIT,
        record.Type.CUSTOMER_DEPOSIT,
        record.Type.CUSTOMER_REFUND,
        record.Type.CASH_SALE,
        record.Type.CASH_REFUND,
        'CustPymt',
        'Deposit',
        'CustDep',
        'CustRfnd',
        'CashSale',
        'CashRfnd'
    ];

    /*
     * @desc A variable to store reconciliation lines. This will be auto-cleaned once next transaction is coming.
     * @var {Array} collectedEntries
     */
    var collectedEntries = [];

    /*
     * @desc A variable to store lines of single deposit/refund transaction like deposit etc. This will be auto-cleaned once next transaction is coming.
     * @var {Object} depositTranEntries
     */
    var depositTranEntries = []; // Deposit/Refund Transaction

    /*
     * @desc A variable to store lines of deposited transaction like payment, cash sale etc. This will be cleaned when exiting the file.
     * @var {Object} depositedTranEntries
     */
    var depositedTranEntries = []; // AppliedTo Transaction

    /*
     * @desc A variable to store lines of single transaction. This will be auto-cleaned once next transaction is coming.
     * @var {Array} tranEntries
     */
    var tranEntries = [];

    /*
     * @desc A variable to store lines of single paid transaction like bill, invoice etc.
     * @var {Object} paidTranEntries
     */
    var paidTranEntries = {};

    /*
     * @desc A variable to store lines of single credit transaction like credit memo etc.
     * @var {Array<search.Result>} creditTranEntries
     */
    var creditTranEntries = [];

    // Helper Vars //
    /*
     * @desc A variable to store total paid amount of preceding lines in an invoice or cash sale.
     * @var {Number} precedingLinePaidAmount
     */
    var precedingLinePaidAmount = 0;

    /*
     * @desc A variable to store shipping and gift amount in an invoice or cash sale.
     * @var {Number} otherExpenses
     */
    var otherExpenses = 0;

    /*
     * @desc A variable to store total paid amount of preceding transactions in an customer payment etc. It is an inner variable with no any business usage.
     * @var {Number} precedingTransPaidAmount
     */
    var precedingTransPaidAmount = 0;

    /*
     * @desc A variable to store internal id of preceding transaction in an customer payment etc. It is an inner variable with no any business usage.
     * @var {Number} preTranEntryId
     */
    var preTranEntryId = -1;

    /*
     * @desc A variable to store mapping information from deposited transaction ID to deposit transaction entry. It is an helper variable without business concept.
     * @var {Object<String:search.Result>} depositTranEntryMap
     */
    var depositTranEntryMap = {};
    // End //

    /*
     * @desc Collect cash flow related data for Journal Entry.
     */
    function collect(tranid) {
        cleanup();
        setup(arguments);
        collectAR();
        log.debug('AR: Totally collected entries', collectedEntries.length);
        return collectedEntries;
    }

    function setup(params) {
        // LAYER ONE: DEPOSIT | PAYING
        tranEntries = helper.resultset(cashflowDAO.fetchTransactionEntries({
            ids: params[0],
            hasdeposit: params[2] === record.Type.DEPOSIT
        }));
        log.debug('AR: returned raw Deposit|Paying results', tranEntries);

        //NSCHINA-3051 E-fix support AR direct void
        if (!commons.makesure(tranEntries)) {
            return;
        }

        // LAYER TWO: DEPOSITED(PAYING)
        if (tranEntries[0].getValue('type') === 'Deposit') {
            log.debug('Deposit: depositTranEntries initialized');
            depositTranEntries = tranEntries;
            depositedTranEntries = helper.resultset(cashflowDAO.fetchTransactionEntries({
                depositTransaction: tranEntries[0].id
            }));
            log.debug('AR: returned raw Deposited(Paying) results', depositedTranEntries);
        }

        // LAYER THREE: PAID & CREDIT
        if (tranEntries[0].getValue('type') === 'Deposit') {
            log.debug('Deposit: payingTranEntries initialized');
            var payingTranEntries = depositedTranEntries;
        } else {
            log.debug('Other Transactio Type: payingTranEntries initialized');
            payingTranEntries = tranEntries;
        }
        log.debug('AR: returned RAW Paying results', payingTranEntries);

        var paidTranIds = [];
        for (var k = 0; k < payingTranEntries.length; k++) {
            var invTranId = payingTranEntries[k].getValue({
                name: 'paidTransaction'
            });
            if (commons.makesure(invTranId)) {
                paidTranIds.push(invTranId);
            }
        }
        log.debug('AR: return paidTranIds', paidTranIds);
        if (commons.makesure(paidTranIds)) {
            var paidEntries = helper.resultset(cashflowDAO.fetchTransactionEntries({
                ids: paidTranIds
            }));
            paidTranEntries = cashflowHelper.assembleTransactionEntries(paidEntries);
            log.debug('AR: returned raw Paid results', paidTranEntries);
        }

        // Credit
        if (commons.makesure(params[1])) {
            creditTranEntries = helper.resultset(cashflowDAO.fetchTransactionEntries({
                ids: params[1],
                types: [
                    'CustCred'/*{value:'CustCred', text:'Credit Memo', recordType:'creditmemo'}*/,
                ],
                hascredit: true
            }));
            log.debug('AR: returned raw Credit results', creditTranEntries);
        }
    }

    /*
     * @desc Collect AR related cash flow entries.
     */
    function collectAR() {
        log.debug('ap_collector', 'Enter collectAR');
        //NSCHINA-3051 E-fix support AR direct void
        if (!commons.makesure(tranEntries)) {
            return;
        }

        if (tranEntries[0].getValue('type') === 'CustPymt') {
            if (cashflowHelper.isDepositedPayment({
                tranEntries: tranEntries,
                depositTranEntries: depositTranEntries
            })) {
                collectDepositedFunds(); // paid funds of invoices and Statement charge
                collectCreditedFunds(); // credited funds of paid invoices
                collectCredits(); // credits
            }
        } else if (tranEntries[0].getValue('type') === 'CashSale' || tranEntries[0].getValue('type') === 'CashRfnd' || tranEntries[0].getValue('type') === 'CustRfnd') {
            if (cashflowHelper.isDepositedPayment({
                tranEntries: tranEntries,
                depositTranEntries: depositTranEntries
            })) {
                collectDepositedCash();
            }
        } else if (tranEntries[0].getValue('type') === 'Deposit') {
            collectDeposits();
        } else if (tranEntries[0].getValue('type') === 'CustDep') {
            if (cashflowHelper.isDepositedPayment({
                tranEntries: tranEntries,
                depositTranEntries: depositTranEntries
            })) {
                collectCustomerDeposits();
            }
        }
    }

    /*
     * @desc Collect deposited cash sale and cash refund entries.
     */
    function collectDepositedCash() {
        log.debug('collectDepositedCash');
        tranEntries = removeEntries(tranEntries);
        var inline = cashflowHelper.hasInlineCashflowItem(tranEntries);
        var depositTranEntry = depositTransactionEntry(tranEntries[0]);
        for (var i = 0; i < tranEntries.length; i++) {
            if (!cashflowHelper.isMainline(tranEntries[i])) {
                var depositedAmount = depositedCashAmount({
                    payingTranEntry: tranEntries[i],
                    depositTranEntry: depositTranEntry,
                    isLastItem: i === tranEntries.length - 1
                });
                doCollect({
                    depositTran: commons.makesure(depositTranEntry) ? depositTranEntry.id : null,
                    payingTran: tranEntries[i].id,
                    subsidiary: subsidiary(tranEntries[i]),
                    postingperiod: postingperiod(tranEntries[i]),
                    trandate: trandate(tranEntries[i]),
                    cashflowitem: cashflowHelper.getCashflowItem({
                        entry: tranEntries[i],
                        //NSCHINA-2314
                        lineIndex: i,
                        inline: inline
                    }),
                    cashamount: depositedAmount,
                    //NSCHINA-2429
                    //Add location/department/classification filter to CFS AR Deposited Cash collect
                    location: getLocation(tranEntries[i]),
                    department: getDepartment(tranEntries[i]),
                    classification: getClassification(tranEntries[i])
                });
            }
        }
        otherExpenses = 0;
    }

    /*
     * @desc Collect customer deposit entries.
     * For now, it includes:
     * 1. account deposit
     * 2. undepfund
     * Later, invoice will be added.
     */
    function collectCustomerDeposits() {
        log.debug('collectCustomerDeposits');
        var depositTranEntry = depositTransactionEntry(tranEntries[0]);
        for (var i = 0; i < tranEntries.length; i++) {
            if (!cashflowHelper.isMainline(tranEntries[i])) {
                doCollect({
                    depositTran: commons.makesure(depositTranEntry) ? depositTranEntry.id : null,
                    payingTran: tranEntries[i].id,
                    subsidiary: subsidiary(tranEntries[i]),
                    postingperiod: postingperiod(tranEntries[i]),
                    trandate: trandate(tranEntries[i]),
                    cashflowitem: cashflowHelper.getCashflowItem({
                        entry: tranEntries[i],
                        //NSCHINA-2314
                        lineIndex: i,
                        inline: []
                    }),
                    cashamount: depositedCashAmount({
                        payingTranEntry: tranEntries[i],
                        depositTranEntry: depositTranEntry
                    }),
                    //NSCHINA-2429
                    //Add location/department/classification filter to CFS AR Customer Deposits Collect
                    location: getLocation(tranEntries[i]),
                    department: getDepartment(tranEntries[i]),
                    classification: getClassification(tranEntries[i])
                });
            }
        }
    }

    /*
     * @desc Collect deposited entries.
     */
    function collectDepositedFunds() {
        log.debug('collectDepositedFunds');
        for (var k = 0; k < tranEntries.length; k++) {
            var invTranId = tranEntries[k].getValue({
                name: 'paidTransaction'
            });
            if (!commons.makesure(invTranId)) {
                continue;
            }

            var invTranEntries = paidTransactionEntries(invTranId);
            invTranEntries = removeEntries(invTranEntries);
            //NSCHINA-2314
            var inline = useHeaderCFIOnLine(invTranEntries);
            var depositTranEntry = depositTransactionEntry(tranEntries[k]);
            for (var i = 0; i < invTranEntries.length; i++) {
                if (!cashflowHelper.hasSameAccountType({
                    one: invTranEntries[i],
                    other: tranEntries[k]
                })) {
                    var depositedAmount = depositedCashAmount({
                        payingTranEntry: tranEntries[k],
                        paidTranEntry: invTranEntries[i],
                        depositTranEntry: depositTranEntry,
                        isLastItem: i === invTranEntries.length - 1
                    });
                    doCollect({
                        depositTran: commons.makesure(depositTranEntry) ? depositTranEntry.id : null,
                        payingTran: tranEntries[k].id,
                        paidTran: invTranEntries[i].id,
                        subsidiary: subsidiary(tranEntries[k]),
                        postingperiod: postingperiod(tranEntries[k]),
                        trandate: trandate(tranEntries[k]),
                        cashflowitem: cashflowHelper.getCashflowItem({
                            entry: invTranEntries[i],
                            //NSCHINA-2314
                            lineIndex: i,
                            inline: inline
                        }),
                        cashamount: depositedAmount,
                        //NSCHINA-2429
                        //Add location/department/class to CFS AR Deposited Funds Collect
                        location: getLocation(invTranEntries[i]),
                        department: getDepartment(invTranEntries[i]),
                        classification: getClassification(invTranEntries[i])
                    });
                }
            }
            otherExpenses = 0;

        }
    }

    //NSCHINA-2314
    function useHeaderCFIOnLine(itemLines) {
        var useHeadLines = [];
        for (var i = 0; i < itemLines.length; i++) {
            if (!commons.makesure(itemLines[i].cfsItem)) {
                useHeadLines.push(i);
            }
        }
        return useHeadLines;
    }

    function collectCredits() {
        log.debug('collectCredits');
        creditTranEntries = removeEntries(creditTranEntries);
        for (var k = 0; k < creditTranEntries.length; k++) {
            var invTranId = creditTranEntries[k].getValue({
                name: 'appliedtotransaction'
            });
            if (!commons.makesure(invTranId) || !hasPaidTransactionEntries(invTranId)) {
                continue;
            }

            // This is because credit memo amount get accumulated on the same credit memo so we have to delete previously collected entries and re-collect.
            collectoDAO.deleteConditionedCollectedEntries({
                lineUniqueKey: creditTranEntries[k].id + '-' + invTranId
            });

            var creTranEntries = creditTransactionEntries(creditTranEntries[k].id);
            var inline = cashflowHelper.hasInlineCashflowItem(creTranEntries);
            for (var i = 0; i < creTranEntries.length; i++) {
                if (!cashflowHelper.hasSameAccountType({
                    one: creTranEntries[i],
                    other: creditTranEntries[k]
                })) {
                    var depositedAmount = depositedCashAmount({
                        payingTranEntry: creditTranEntries[k],
                        paidTranEntry: creTranEntries[i],
                        isLastItem: i === creTranEntries.length - 1
                    });
                    doCollect({
                        payingTran: tranEntries[0].id,
                        paidTran: creTranEntries[i].id,
                        subsidiary: subsidiary(creditTranEntries[k]),
                        postingperiod: postingperiod(tranEntries[0]),
                        trandate: trandate(tranEntries[0]),
                        cashflowitem: cashflowHelper.getCashflowItem({
                            entry: creTranEntries[i],
                            //NSCHINA-2314
                            lineIndex: i,
                            inline: inline
                        }),
                        cashamount: -depositedAmount,
                        //NSCHINA-2429
                        //Add location/department/classification filter to CFS AR Credit collect
                        location: getLocation(creTranEntries[i]),
                        department: getDepartment(creTranEntries[i]),
                        classification: getClassification(creTranEntries[i]),
                        lineUniqueKey: creditTranEntries[k].id + '-' + invTranId
                    });
                }
            }
        }
        otherExpenses = 0;
    }

    function collectCreditedFunds() {
        log.debug('collectCreditedFunds');
        for (var k = 0; k < creditTranEntries.length; k++) {
            var invTranId = creditTranEntries[k].getValue({
                name: 'appliedtotransaction'
            });
            if (!commons.makesure(invTranId) || !hasPaidTransactionEntries(invTranId)) {
                continue;
            }

            // This is because credit memo amount get accumulated on the same invoice so we have to delete previously collected entries and re-collect.
            collectoDAO.deleteConditionedCollectedEntries({
                lineUniqueKey: creditTranEntries[k].id + '-' + invTranId
            });

            var invTranEntries = paidTransactionEntries(invTranId);
            invTranEntries = removeEntries(invTranEntries);
            var inline = cashflowHelper.hasInlineCashflowItem(invTranEntries);
            for (var i = 0; i < invTranEntries.length; i++) {
                if (!cashflowHelper.isMainline(invTranEntries[i])) {
                    var depositedAmount = depositedCashAmount({
                        payingTranEntry: creditTranEntries[k],
                        paidTranEntry: invTranEntries[i],
                        isLastItem: i === invTranEntries.length - 1
                    });
                    doCollect({
                        payingTran: tranEntries[0].id,
                        paidTran: invTranEntries[i].id,
                        subsidiary: subsidiary(creditTranEntries[k]),
                        postingperiod: postingperiod(tranEntries[0]),
                        trandate: trandate(tranEntries[0]),
                        cashflowitem: cashflowHelper.getCashflowItem({
                            entry: invTranEntries[i],
                            //NSCHINA-2314
                            lineIndex: i,
                            inline: inline
                        }),
                        cashamount: depositedAmount,
                        //NSCHINA-2429
                        //Add location/department/classification filter to CFS AR collector
                        location: getLocation(invTranEntries[i]),
                        department: getDepartment(invTranEntries[i]),
                        classification: getClassification(invTranEntries[i]),
                        lineUniqueKey: creditTranEntries[k].id + '-' + invTranId
                    });
                }
            }
            otherExpenses = 0;
        }
    }

    function subsidiary(entry) {
        if (commons.makesure(depositTranEntries)) {
            return cashflowHelper.getCurrentSubsidiary(depositTranEntries[0].getValue('subsidiary'));
        } else {
            return cashflowHelper.getCurrentSubsidiary(entry.getValue('subsidiary'));
        }
    }

    //NSCHINA-2429
    //Add location/department/classification filter to CFS AR collector
    function getLocation(entry) {
        return entry.getValue('location');
    }

    function getDepartment(entry) {
        return entry.getValue('department');
    }

    function getClassification(entry) {
        return entry.getValue('class');
    }


    function postingperiod(entry) {
        if (commons.makesure(depositTranEntries)) {
            return depositTranEntries[0].getValue('postingperiod');
        } else {
            return entry.getValue('postingperiod');
        }
    }

    function trandate(entry) {
        if (commons.makesure(depositTranEntries)) {
            return depositTranEntries[0].getValue('trandate');
        } else {
            return entry.getValue('trandate');
        }
    }

    function depositTransactionEntry(appliedToEntry) {
        var value = depositTranEntryMap[appliedToEntry.id];
        if (!commons.makesure(value)) {
            for (var i = 0; i < depositTranEntries.length; i++) {
                var appliedTranId = depositTranEntries[i].getValue('appliedToTransaction');
                if (commons.makesure(appliedTranId)) {
                    depositTranEntryMap[appliedTranId] = depositTranEntries[i];
                }
            }
        }
        return depositTranEntryMap[appliedToEntry.id];
    }

    function removeEntries(entries) {
        var tempEntries = [];
        var shippingAmount = 0;
        var giftAmount = 0;
        for ( var i in entries) {
            var entryType = entries[i].getValue({
                name: 'type',
                join: 'item'
            });
            if (entryType === 'ShipItem') {
                shippingAmount = shippingAmount + commons.toNumber(entries[i].getValue('netamount')) + commons.toNumber(entries[i].getValue('taxamount'));
            } else if (entryType === 'GiftCert' && !commons.makesure(entries[i].getValue('taxamount'))) {
                //gift do not has taxamount, gift as a item need to be collected and has taxamount
                giftAmount = giftAmount + commons.toNumber(entries[i].getValue('netamount'));
            } else {
                tempEntries.push(entries[i]);
            }
        }
        otherExpenses = shippingAmount + giftAmount;
        return tempEntries;
    }

    /*
     * @desc Return paid transaction entries like invoice, bill. Query from record if desn't exist for case paid transaction and payment in different date.
     * @param {String} key - Internal ID of paid transaction entries
     * @return {search.Result[]}
     */
    function paidTransactionEntries(key) {
        return paidTranEntries[key];
    }

    function hasPaidTransactionEntries(key) {
        return commons.makesure(paidTranEntries[key]);
    }

    function creditTransactionEntries(key) { // JL - nice to enhance with a map
        var entries = [];
        for (var i = 0; i < creditTranEntries.length; i++) {
            if (creditTranEntries[i].id === key) {
                entries.push(creditTranEntries[i]);
            }
        }
        return entries;
    }

    /*
     * @desc Calculate and return deposited cash amount.
     * @param {Object} params
     * @params {search.Result} params.payingTranEntry - The transaction entry that really has cash-in-out
     * @params {search.Result} params.paidTranEntry - The transaction entry on which payment should be done
     * @return {Number}
     */
    function depositedCashAmount(params) {
        if (!commons.makesureall(params, 'payingTranEntry')) {
            return;
        }

        var payingTranEntry = params.payingTranEntry;
        var paidTranEntry = params.paidTranEntry;

        var paidAmount = calculatePaidAmount(params);

        var tranEntry = commons.makesure(paidTranEntry) ? paidTranEntry : payingTranEntry;
        var lnTotalAmount = cashflowHelper.cashamount({
            amount: tranEntry.getValue('netamount'),
            taxamount: tranEntry.getValue('taxamount'),
            taxrate: tranEntry.getValue({
                name: 'rate',
                join: 'taxitem'
            })
        });

        if (commons.ensure(params.isLastItem)) {
            var amount = format.round(commons.toAbsNumber(paidAmount) - commons.toAbsNumber(precedingLinePaidAmount));
            precedingLinePaidAmount = 0;
        } else {
            amount = format.round((lnTotalAmount * paidAmount) / lnsTotalAmount(tranEntry));
            precedingLinePaidAmount += amount;
        }

        return cashflowHelper.getAmountToRefDirection({
            ref: cashflowHelper.getDepositedBankAmount({
                tranEntries: tranEntries,
                depositTranEntries: depositTranEntries
            }), // JL - nice to enhance
            amount: amount
        });
    }

    function calculatePaidAmount(params) {
        var depositTranEntry = params.depositTranEntry;
        var payingTranEntry = params.payingTranEntry;
        var paidTranEntry = params.paidTranEntry;

        if (commons.makesure(depositTranEntry)) {
            if (commons.makesure(paidTranEntry)) {
                if (payingTranEntry === tranEntries[tranEntries.length - 1]) {
                    var paidAmount = commons.toAbsNumber(depositTranEntry.getValue('amount')) - commons.toAbsNumber(precedingTransPaidAmount);
                    if (commons.ensure(params.isLastItem)) {
                        returnPaidAmountToZero();
                    }
                } else {
                    paidAmount = (payingTranEntry.getValue('paidamount') * depositTranEntry.getValue('amount')) / payingTranEntry.getValue('total');
                    accumulatePaidAmount({
                        paidTranEntry: paidTranEntry,
                        paidAmount: paidAmount
                    });
                }
            } else {
                paidAmount = depositTranEntry.getValue('amount');
            }
        } else {
            if (commons.makesure(paidTranEntry)) {
                if (runtime.isMultiCurrency() && payingTranEntry.getValue('type') === 'CustCred') {
                    paidAmount = payingTranEntry.getValue('appliedtoforeignamount') * tranEntries[0].getValue('exchangerate');
                } else {
                    paidAmount = payingTranEntry.getValue('paidamount');
                }
            } else {
                paidAmount = payingTranEntry.getValue('total');
            }
        }

        return paidAmount;
    }

    function lnsTotalAmount(tranEntry) {
        var totalAmount = tranEntry.getValue('total');
        return commons.toNormalizedNumber(totalAmount) - commons.toNormalizedNumber(otherExpenses);
    }

    /*
     * Accumulate preceding paid amounts.
     */
    function accumulatePaidAmount(params) {
        if (params.paidTranEntry.id !== preTranEntryId) {
            precedingTransPaidAmount += params.paidAmount;
        }
        preTranEntryId = params.paidTranEntry.id;
    }

    function returnPaidAmountToZero() {
        precedingTransPaidAmount = 0;
        preTranEntryId = -1;
    }

    function collectDeposits() {
        log.debug('collectDeposits');
        tranEntries = [];
        for (var i = 0; i < depositedTranEntries.length; i++) {
            var entry = depositedTranEntries[i];
            if (tranEntries.length === 0 || entry.id === tranEntries[0].id) { // JL - can enhance with assembling in advance
                tranEntries.push(entry);
            } else {
                collectAR();
                tranEntries = [
                    entry
                ];
            }
        }
        if (commons.makesure(tranEntries)) {
            collectAR();
        }
    }

    /*
     * @desc Commit cash flow entries to custom record.
     * @param {Object} entry - The final revised data to be committed to custom record.
     */
    function doCollect(entry) {
        collectedEntries.push({
            depositTranid: entry.depositTran,
            pymtTranid: entry.payingTran,
            paidTranid: entry.paidTran,
            subsidiary: entry.subsidiary,
            trandate: format.parseDate(entry.trandate),
            period: entry.postingperiod,
            item: entry.cashflowitem,
            amount: entry.cashamount,
            //NSCHINA-2429
            //Add location/department/class to CFS AR Collector
            location: entry.location,
            department: entry.department,
            classification: entry.classification,
            lineUniqueKey: entry.lineUniqueKey
        });
        log.debug('AR: collected one cash flow entry', entry);
    }

    function matches(tranType) {
        return recordTypeWhiteList.indexOf(tranType) !== -1;
    }

    function cleanup() {
        collectedEntries = [];
        depositTranEntries = [];
        depositedTranEntries = [];
        tranEntries = [];
        paidTranEntries = {};
        creditTranEntries = [];
        precedingLinePaidAmount = 0;
        preTranEntryId = -1;
        precedingTransPaidAmount = 0;
        depositTranEntryMap = {};
        otherExpenses = 0;
    }

    return {
        collect: collect,
        matches: matches
    };

});
