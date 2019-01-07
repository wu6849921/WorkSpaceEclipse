/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    './app_cn_vat_file_import_helper',
    './app_cn_vat_status'
],

function(commons, importHelper, vatStatus) {
    /**
     * update the status of VAT invoices, when export
     * if the invoice has been exported, then one record should be inserted in VAT invoice, and the status should be exported.
     * @params ids[]  the invoices id array that should be updated
     * 
     * */
    function updateStatusWhenExport(ids) {
        if (!commons.makesure(ids)) {
            return;
        }
        var newIds = processDuplicateIds(ids);
        //status 1 : Exported
        //       2 : Completed
        for ( var i in newIds) {
            var params = {
                'salesDocNO': newIds[i],
                'invoiceStatus': vatStatus.Status.exported
            };
            importHelper.save(params);
        }


    }
    /*
     * as of splitting, the invoice could be split more than one invoices, so we should delete duplicate invoices. and the rule of invoice split is:
     * id-series, such as 1-1, 1-2, 1-3
     * @param ids
     * @return ids[] with no duplicate ids
     * */
    function processDuplicateIds(ids) {
        var newIds = [];
        for ( var i in ids) {
            var tempIds = ids[i].split('-');
            log.debug('tempIds', tempIds)
            if (!commons.contains(newIds, tempIds[0])) {
                newIds.push(tempIds[0]);
            }
        }
        log.debug('newIds', newIds)
        return newIds;

    }

    return {
        updateStatusWhenExport: updateStatusWhenExport
    };

});
