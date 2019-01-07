/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define([
    'N/ui/dialog',
    '../../lib/wrapper/ns_wrapper_search',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/wrapper/ns_wrapper_error',
    '../../dao/helper/search_helper',
    '../../app/cashflow/app_cn_cashflow_validator',
    '../../lib/wrapper/ns_wrapper_https',
    '../../lib/wrapper/ns_wrapper_url'
], function(dialog, search, commons, runtime, error, helper, validator, https, url) {
    //ar transaction type need to apply validation logic
    //customercharge is NOT included as there is no way to deploy cs script to this type of transaction
    var arTypeWhiteList = [
        'invoice',
        'cashsale',
        'cashrefund',
        'creditmemo',
        'customerdeposit',
        'customerrefund'
    ];

    //ap transaction type need to apply validation logic
    var apTypeWhiteList = [
        'vendorbill',
        'expensereport',
        'vendorcredit',
        'check'
    ];

    //journal entries
    var journalWhiteList = [
        'journalentry',
        'intercompanyjournalentry',
        'advintercompanyjournalentry',
    ];

    //transaction line need to ignore cfs validation logic
    var itemTypeBlackList = [
        'Group',
        'Discount',
        'Subtotal',
        'Endgroup',
        'Markup',
        'Description'
    ];

    var COL_CFS_FIELD_ID = 'custcol_cseg_cn_cfi';
    var ITEM_SUBLIST_ID = 'item';
    var JOURNAL_LINE_SUBLIST_ID = 'line';
    var EXPENSE_SUBLIST_ID = 'expense';

    //All sublist name may need to check, including AR/AP/Journal
    var sublistsNeedToValidate = [
        ITEM_SUBLIST_ID, // for AR/AP entries
        EXPENSE_SUBLIST_ID, // for AR/AP entries
        JOURNAL_LINE_SUBLIST_ID
    //for journal entries
    // 'itemcost', //"Billable Item" on invoice/cashsale
    // 'expcost'   //"Billable Expense" on invoice/cashsale
    ];

    //there is no cfi line entry for the following types
    var noCfiLineEntryTranType = [
        'customerdeposit',
        'customerrefund'
    ];

    function tranTypeRequiresValidation(currentRecType) {
        return commons.makesure(currentRecType) && ((apTypeWhiteList.indexOf(currentRecType) !== -1) || (arTypeWhiteList.indexOf(currentRecType) !== -1) || (journalWhiteList.indexOf(currentRecType) !== -1));
    }

    function isCFIFieldExist(currentRec, sublistName) {
        //only check journal/intercompanyjournal/advintercomapanyjournal
        return currentRec.getSublistField({
            sublistId: sublistName,
            fieldId: COL_CFS_FIELD_ID,
            line: 0
        });
    }

    function checkCfsOnLine(sublistName, lineIndex, currentRec, itemIdsRequireCfi) {
        if (commons.makesure(currentRec) && commons.makesure(sublistName) && commons.makesure(lineIndex)) {
            switch (sublistName) {
                case ITEM_SUBLIST_ID:
                    return handleItemSublistLine(currentRec, sublistName, lineIndex, itemIdsRequireCfi);
                case EXPENSE_SUBLIST_ID:
                    return handleExpenseSublistLine(currentRec, sublistName, lineIndex);
                default:
                    return handleOtherSublistLine(currentRec, sublistName, lineIndex);
            }
        }
        return {
            line: -1,
            result: true
        };
    }

    function handleItemSublistLine(currentRec, sublistName, lineIndex, itemIdsRequireCfi) {
        var resultObj = {
            line: -1,
            result: true
        };
        var itemId = currentRec.getSublistValue({
            sublistId: sublistName,
            fieldId: 'item',
            line: lineIndex
        });
        var cfsValue = currentRec.getSublistValue({
            sublistId: sublistName,
            fieldId: COL_CFS_FIELD_ID,
            line: lineIndex
        });
        var cfiRequired = commons.makesure(itemIdsRequireCfi) && commons.makesure(itemId) && itemId > 0 && itemIdsRequireCfi.indexOf(itemId) >= 0;
        //If there is cfsValue on line at lineIndex
        //return true as validation success
        //else return false indicate the cfs is empty
        if (cfiRequired === true && !commons.makesure(cfsValue)) {
            resultObj.line = lineIndex;
            resultObj.result = false;
        }
        return resultObj;
    }

    function handleExpenseSublistLine(currentRec, sublistName, lineIndex) {
        var resultObj = {
            line: -1,
            result: true
        };
        var isNONReimbursabel = currentRec.getSublistValue({
            sublistId: sublistName,
            fieldId: 'isnonreimbursable',
            line: lineIndex
        });
        var cfsValue = currentRec.getSublistValue({
            sublistId: sublistName,
            fieldId: COL_CFS_FIELD_ID,
            line: lineIndex
        });
        // when 'isNONReimbursabel' is not true(in expense report, check the NONReimbursabel will be true, but in check is undefined), the cfsValue can not be empty.
        if (isNONReimbursabel !== true && !commons.makesure(cfsValue)) {
            resultObj.line = lineIndex;
            resultObj.result = false;
        }
        return resultObj;
    }

    function handleOtherSublistLine(currentRec, sublistName, lineIndex) {
        var resultObj = {
            line: -1,
            result: true
        };
        var cfsValue = currentRec.getSublistValue({
            sublistId: sublistName,
            fieldId: COL_CFS_FIELD_ID,
            line: lineIndex
        });
        if (!commons.makesure(cfsValue)) {
            resultObj.line = lineIndex;
            resultObj.result = false;
        }
        return resultObj;
    }

    function getRequiredItemId(sublistName, lineCount, currentRec) {
        var requiredIds = [];

        //item blacklist check only applies to Item sublist
        if (sublistName !== ITEM_SUBLIST_ID) {
            return requiredIds;
        }

        var itemIds = [];
        //get item type list from target sublist
        for (var i = 0; i < lineCount; i++) {
            var itemId = currentRec.getSublistValue({
                sublistId: sublistName,
                fieldId: ITEM_SUBLIST_ID,
                line: i
            });
            if (itemId <= 0) {
                continue;
            } else {
                itemIds.push(itemId);
            }
        }

        //search for required item type and id
        if (commons.makesure(itemIds)) {
            var idFilter = [
                'internalid',
                "anyof"
            ].concat(itemIds);
            var typeFilter = [
                'type',
                'noneof'
            ].concat(itemTypeBlackList);
            var resultSet = helper.resultset(search.create({
                type: search.Type.ITEM,
                columns: [
                    'internalid'
                ],
                filters: [
                    idFilter,
                    'and',
                    typeFilter
                ]
            }).run());
            if (commons.makesure(resultSet) && resultSet.length > 0) {
                for (var i = 0; i < resultSet.length; i++) {
                    requiredIds.push(resultSet[i].getValue('internalid'));
                }
            }
        }
        return requiredIds;
    }

    /**
     *
     * @param sublistName: SubList internal ID
     * @param currentRec
     * @param lineCount: Total Line Count on target sublist (sublistName)
     * @return {{result: boolean, errorLineIndex: number}}
     * @return result: true => validate PASS and vice versa
     * @return errorLineIndex => line index if validate FAIL, index starts from zero
     */
    function validateCfsOnSublist(sublistName, currentRec, lineCount) {
        var resultObj = {
            result: true,
            errorLineIndex: -1
        //if -1 means no error line
        };

        if (lineCount <= 0) {
            return resultObj;
        }

        //scan all lines to get cfs mandatory item Id to reduce search on each line
        var itemIdsRequireCfi = getRequiredItemId(sublistName, lineCount, currentRec);

        //check cfs value line by line
        //Suppose all cfs is non-empty, if not in the following line by line loop
        //then change the value to be false
        for (var i = 0; i < lineCount; i++) {
            var cfsObject = checkCfsOnLine(sublistName, i, currentRec, itemIdsRequireCfi);
            if (cfsObject.result === false) {
                resultObj.result = false;
                resultObj.errorLineIndex = cfsObject.line;
                break;
            }
        }
        return resultObj;
    }

    /**
     *
     * @param currentRec
     * @return {{errorSublistName: null, finalResult: boolean, errorLine: number}}
     * @return errorSublistName: sublist internal ID if validate FAILED
     * @return finalResult: true => validate PASS and vice versa
     * @return errorLine => line index if validate FAIL, index starts from ONE
     */
    function validateJournalEntries(currentRec, lineCountPerSublist) {
        var validationResultObj = {
            errorSublistName: null,
            finalResult: true,
            errorLine: -1
        };
        //if no lines then no need to do validate
        if (!commons.makesure(lineCountPerSublist) || !commons.makesure(lineCountPerSublist[JOURNAL_LINE_SUBLIST_ID])) {
            return validationResultObj;
        }

        var subsidiary = {};
        for (var i = 0; i < lineCountPerSublist[JOURNAL_LINE_SUBLIST_ID]; i++) {
            var lineSubsidiaryId = -1;
            if (journalWhiteList.indexOf(currentRec.type) > 0) {
                //Handle intercompany/advintercompany journal entries
                lineSubsidiaryId = currentRec.getSublistValue({
                    sublistId: "line",
                    fieldId: "linesubsidiary",
                    line: i
                });
                if (lineSubsidiaryId && !subsidiary[lineSubsidiaryId]) {
                    var subsidiaryLookup = search.lookupFields({
                        type: search.Type.SUBSIDIARY,
                        id: lineSubsidiaryId,
                        columns: [
                            'custrecord_cn_cfi_mandatory'
                        ]
                    });
                    subsidiary[lineSubsidiaryId] = {};
                    subsidiary[lineSubsidiaryId].cfiMandatory = commons.makesure(subsidiaryLookup.custrecord_cn_cfi_mandatory) && subsidiaryLookup.custrecord_cn_cfi_mandatory;
                }
            } else {
                if (!subsidiary[lineSubsidiaryId]) {
                    subsidiary[lineSubsidiaryId] = {};
                    subsidiary[lineSubsidiaryId].cfiMandatory = true;
                }
            }

            var accountId = currentRec.getSublistValue({
                sublistId: JOURNAL_LINE_SUBLIST_ID,
                fieldId: "account",
                line: i
            });
            var accountType = search.lookupFields({
                type: search.Type.ACCOUNT,
                id: accountId,
                columns: [
                    'type'
                ]
            });
            subsidiary[lineSubsidiaryId].hasBankAccount = subsidiary[lineSubsidiaryId].hasBankAccount || accountType.type[0].value === 'Bank';
            if (accountType.type[0].value !== 'Bank') {
                var cfiField = currentRec.getSublistValue({
                    sublistId: JOURNAL_LINE_SUBLIST_ID,
                    fieldId: "custcol_cseg_cn_cfi",
                    line: i
                });
                subsidiary[lineSubsidiaryId].hasEmptyCFI = subsidiary[lineSubsidiaryId].hasEmptyCFI || !cfiField;

                //Add emptyCFI lineIndex
                if (commons.makesure(subsidiary) && commons.makesure(subsidiary[lineSubsidiaryId]) && commons.makesure(subsidiary[lineSubsidiaryId].hasEmptyCFI) && subsidiary[lineSubsidiaryId].hasEmptyCFI) {
                    subsidiary[lineSubsidiaryId].emptyCFILineIndex = {};
                    subsidiary[lineSubsidiaryId].emptyCFILineIndex = i;
                }
            }
        }
        log.debug("cs_cn_cashflow_journal_validation", subsidiary);
        for ( var subsidiaryId in subsidiary) {
            if (subsidiary[subsidiaryId].cfiMandatory && subsidiary[subsidiaryId].hasBankAccount && subsidiary[subsidiaryId].hasEmptyCFI) {

                validationResultObj.errorSublistName = JOURNAL_LINE_SUBLIST_ID;
                validationResultObj.finalResult = false;
                validationResultObj.errorLine = subsidiary[subsidiaryId].emptyCFILineIndex + 1; //change line starting indexe to ONE for pop up dialog
            }
        }

        return validationResultObj;
    }

    function checkHeaderCfiRequired(currentRec) {
        if (commons.makesure(currentRec)) {
            if (runtime.isOW() === true) {
                return validator.isSubsidiaryRequireCfi(currentRec);
            } else {
                //for SI when code touch this point should all be checked
                //as the subsidiary check is passed in toValidateTransactionLines
                return true;
            }
        } else {
            return false;
        }
    }

    /**
     *
     * @param currentRec
     * @return {{errorSublistName: null, finalResult: boolean, errorLine: number}}
     * @return errorSublistName: sublist internal ID if validate FAILED
     * @return finalResult: true => validate PASS and vice versa
     * @return errorLine => line index if validate FAIL, index starts from ONE
     */
    function validateNonJournalEntries(currentRec, lineCountPerSublist) {
        //Initialize resultObj as all PASS
        var validationResultObj = {
            errorSublistName: null,
            finalResult: true,
            errorLine: -1
        };

        //if there is header cfs item, skip validation logic as the empty transaction line will apply header cfs value
        var hadHeaderCfi = validator.hasHeaderCfsItem(currentRec);
        if (hadHeaderCfi) {
            return validationResultObj;
        } else if (noCfiLineEntryTranType.indexOf(currentRec.type) !== -1) {
            //handle customer deposit and customer refund
            //as there is no line cfi on customer deposit and customer refund
            //if header cfi is empty, report validation FAILURE
            var requireHeaderCfi = checkHeaderCfiRequired(currentRec);
            if (requireHeaderCfi === true) {
                validationResultObj.finalResult = false;
                return validationResultObj
            }
        }


        for (var i = 0; i < sublistsNeedToValidate.length; i++) {
            var resultObj = validateCfsOnSublist(sublistsNeedToValidate[i], currentRec, lineCountPerSublist[sublistsNeedToValidate[i]]);
            if (resultObj.result === false) {
                validationResultObj.finalResult = false;
                validationResultObj.errorSublistName = sublistsNeedToValidate[i];
                validationResultObj.errorLine = resultObj.errorLineIndex + 1; //change line index start from 1 for pop up dialog
                break;
            }
        }
        return validationResultObj;
    }

    /**
     * Validate line entries on transactions
     * @param currentRec
     * @return {validationResultObj}
     * validationResultObj = {
            errorSublistName: null,
            finalResult: true,
            errorLine: -1
        };
     */
    function validationLineEntries(currentRec, lineCountPerSublist) {
        //handle journal cases
        if (journalWhiteList.indexOf(currentRec.type) !== -1) {
            var validationResultObj = validateJournalEntries(currentRec, lineCountPerSublist);
        } else {
            //AR/AP validation
            validationResultObj = validateNonJournalEntries(currentRec, lineCountPerSublist);
        }
        return validationResultObj;
    }

    /**
     * populate sublistName <--> lineCount map for sublist line counter filter
     * @param currentRec
     * @return
     * {sublistId1: lineCount1,
     *  sublistId2: linecount2,
     *  .....}
     */
    function populateSublistLineCountMap(currentRec) {
        var lineCountPerSublist = {};
        if (commons.makesure(currentRec)) {
            for (var i = 0; i < sublistsNeedToValidate.length; i++) {
                var lineCount = currentRec.getLineCount({
                    sublistId: sublistsNeedToValidate[i]
                });
                if (lineCount > 0) {
                    lineCountPerSublist[sublistsNeedToValidate[i]] = lineCount;
                }
            }
        }
        return lineCountPerSublist;
    }

    /**
     *
     * @param lineCountPerSublist
     * @param currentRecType
     * @return {boolean}:
     *          true --> empty line entries, no need to do line validation later
     *          false --> with line entries, continue validation per line logic later
     */
    function sublistLineCountFilter(lineCountPerSublist, currentRecType) {
        if (commons.makesure(lineCountPerSublist)) {
            if (Object.hasOwnProperty('values')) {
                //Only ECMAScript 2017+ support Object.values
                //It runs fine if explorer is up to date
                var lineCountArray = Object.values(lineCountPerSublist);
            } else {
                //Support old browser without Object.values feature enabled
                lineCountArray = Object.keys(lineCountPerSublist).map(function(key) {
                    return lineCountPerSublist[key];
                });
            }
        } else {
            lineCountArray = [];
        }

        var totalLineCount = lineCountArray.reduce(function(a, b) {
            return a + b;
        }, 0);
        if (totalLineCount <= 0 && noCfiLineEntryTranType.indexOf(currentRecType) === -1) {
            return true;
        } else {
            return false;
        }

    }

    var api = {
        /**
         * Function to be executed when after submit button is pressed but before the form is submitted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        saveRecord: function(scriptContext) {
            var currentRec = scriptContext.currentRecord;
            var currentRecType = currentRec.type;

            //sublist line counter filter
            //if there is cfi line field but there is no line entries
            //ignore line validation logic, resuming system level validation as soon as possible
            var lineCountPerSublist = populateSublistLineCountMap(currentRec);
            if (sublistLineCountFilter(lineCountPerSublist, currentRecType) === true) {
                return true;
            }

            //transaction type filter
            //if not on the ar/ap/journal white list, do NOT check cfs
            if (!tranTypeRequiresValidation(currentRecType)) {
                return true;
            }

            //For Void journal, CFI field is hidden, so no validation is needed if CFI field does not exist
            if ((journalWhiteList.indexOf(currentRecType) !== -1) && !isCFIFieldExist(currentRec, JOURNAL_LINE_SUBLIST_ID)) {
                return true;
            }

            try {
                if (!validator.toValidateTransactionLines(currentRec, journalWhiteList)) {
                    return true;
                }
                var resultObj = validationLineEntries(currentRec, lineCountPerSublist);
            } catch (ex) {
                dialog.alert({
                    title: error.Message.Alert,
                    message: ex.message
                });
                return false;
            }

            if (commons.makesure(resultObj) && resultObj.finalResult === false) {
                dialog.alert({
                    title: error.Message.Alert,
                    message: error.Message.CashflowItemCannotBeEmpty
                });
                return false;
            } else {
                return true;
            }
        }

    };

    //Expose private method for UT
    api._tranTypeRequiresValidation = tranTypeRequiresValidation;
    api._isCFIFieldExist = isCFIFieldExist;
    api._checkCfsOnLine = checkCfsOnLine;
    api._getRequiredItemId = getRequiredItemId;
    api._validateCfsOnSublist = validateCfsOnSublist;
    api._validateJournalEntries = validateJournalEntries;
    api._populateSublistLineCountMap = populateSublistLineCountMap;
    api._sublistLineCountFilter = sublistLineCountFilter;
    api._validateNonJournalEntries = validateNonJournalEntries;
    api._validationLineEntries = validationLineEntries;
    return api;
});
