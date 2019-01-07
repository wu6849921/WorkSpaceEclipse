/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../pref/app_cn_pref_custfield_handler'
],
function(custFieldHandler) {

    /**
     * This script is used to hide vat custom fields.
     * UserEvent will be enabled when feature is disabled and vice versa
     * @param {Form} params - Current form from UserEvent
     */
    function handle(params) {
        log.debug('app_cn_vat_pref_custfield_handler.js, handle', 'start to handle vat custom fields');
        
        var form = params.form;
        hideItemFields(form);
        hideEntityFields(form);
        hideTransactionFields(form);
        hideOtherCustFields(form);
    }

    function hideItemFields(form) {
        var itemFields = ['custitem_cn_vat_item_model'];
        custFieldHandler.hideCustFields(form, itemFields);
    }

    function hideEntityFields(form) {
        var entityFields = [
            'custentity_cn_vat_taxpayer_types',
            'custentity_bank_account_name'
        ];
        custFieldHandler.hideCustFields(form, entityFields);
    }

    function hideTransactionFields(form) {
        var transactionBodyFields = [
            'custbody_cn_vat_split_rule',
            'custbody_cn_vat_invoice_type',
            'custbody_cn_vat_createdfrom_id',
            'custbody_cn_vat_createdfrom',
            'custbody_cn_info_sheet_number'
        ];
        custFieldHandler.hideCustFields(form, transactionBodyFields);
    }
    
    function hideOtherCustFields(form) {
        var otherCustFields = ['custrecord_cn_vat_max_invoice_amount'];
        custFieldHandler.hideCustFields(form, otherCustFields);
    }

    return {
        handle: handle
    };

});
