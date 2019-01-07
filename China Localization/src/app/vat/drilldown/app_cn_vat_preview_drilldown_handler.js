/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    './app_cn_vat_preview_drilldown',
    '../../../dao/cn_vat_dao'
],

function(form, vatDao) {

    function handleAsPage(internalId) {
        var mergedTrans = vatDao.queryMergedTransByParent(internalId);
        form.setTransactionData(mergedTrans);
        return form.renderAsPage(mergedTrans);
    }

    return {
        handleAsPage: handleAsPage
    };

});
