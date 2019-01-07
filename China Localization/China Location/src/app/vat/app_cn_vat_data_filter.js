/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    '../../dao/cn_vat_dao',
    '../../app/vat/app_cn_vat_status'
],

function(commons, vatDao, vatStatus) {

    var exportedTransIds = [];
    /**
     * this function used filter those transactions which have been exported
     * @param searchResults search.Result[]
     * @param newSearchResults search.Result[]
     * */
    function filterExportedTransaction(searchResults) {

        if (!commons.makesure(searchResults)) {
            return {};
        }
        var newSearchResults = [];
        var ids = [];
        for ( var i in searchResults) {
            if (!commons.contains(ids, searchResults[i].id)) {
                ids.push(searchResults[i].id);
            }
        }
        var results = vatDao.getVATByRecId(ids);

        exportedTransIds = getExportedTransIds(results);
        var mergedTransIds = getMergedTransIds(results);
        var mergedInternalIds = getMergedAndNotExportedInternalIds(results);

        for ( var i in searchResults) {
            if (!commons.contains(exportedTransIds, searchResults[i].id) && !commons.contains(mergedTransIds, searchResults[i].id)) {
                newSearchResults.push(searchResults[i]);
            }
        }

        return {
            rawData: newSearchResults,
            mergedIds: mergedInternalIds
        };
    }

    function getExportedTransIds(results) {
        var exportedTransIds = [];
        for (var i = 0; i < results.length; i++) {
            var line = results[i];
            if (!commons.contains(exportedTransIds, line.getValue('custrecord_cn_invoice_type_fk_tran'))) {
                if (vatStatus.isExported(line) || vatStatus.isCompleted(line)) {
                    exportedTransIds.push(line.getValue('custrecord_cn_invoice_type_fk_tran'));
                }
            }
        }
        return exportedTransIds;
    }

    function getMergedTransIds(results) {
        var mergedTransIds = [];
        for (var i = 0; i < results.length; i++) {
            var line = results[i];
            if (!commons.contains(mergedTransIds, line.getValue('custrecord_cn_invoice_type_fk_tran')) && vatStatus.isConsolidated(line)) {
                mergedTransIds.push(line.getValue('custrecord_cn_invoice_type_fk_tran'));
            }
        }
        return mergedTransIds;
    }

    function getMergedAndNotExportedInternalIds(results) {
        var mergedInternalIds = [];
        for (var i = 0; i < results.length; i++) {
            var line = results[i];
            if (!commons.contains(mergedInternalIds, line.id) && vatStatus.isConsolidated(line)) {
                if (!commons.contains(exportedTransIds, line.getValue('custrecord_cn_invoice_type_fk_tran'))) {
                    mergedInternalIds.push(line.id);
                }
            }
        }
        return mergedInternalIds;
    }

    return {
        filterExportedTransaction: filterExportedTransaction
    };

});
