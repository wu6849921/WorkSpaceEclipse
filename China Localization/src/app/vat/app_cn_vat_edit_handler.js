/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    './app_cn_vat_edit_form',
    './app_cn_vat_data',
    '../../dao/cn_vat_edit_dao'
],

function(form, data, editDao) {

    function handleAsPage(params) {
        form.setUserData(params);
        form.setTransactionData(data.getCachedData(params));
        return form.renderAsPage();
    }

    function handleAsData(params) {
        return data.getCachedData(params);
    }

    function handleAsSaveRequest(changes) {
        editDao.save(changes);
    }

    return {
        handleAsPage: handleAsPage,
        handleAsData: handleAsData,
        handleAsSaveRequest: handleAsSaveRequest
    };

});
