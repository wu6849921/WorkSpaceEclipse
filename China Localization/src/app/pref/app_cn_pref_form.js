/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons',
    '../../res/pref/prefresource',
    '../helper/serverWidget_helper'
],

function(serverWidget, url, runtime, commons, resource, helper) {

    var resourceLabels;
    var userData;

    function labels() {
        if (!commons.makesure(resourceLabels)) {
            resourceLabels = resource.load(resource.Name.Labels);
        }
        return resourceLabels;
    }

    function renderAsPage(){
        var form = createForm();
        addButtons(form);
        addSubTabs(form);
        addFieldGroups(form);
        addFields(form);
        return form;
    }

    function addFieldGroups(form) {
        helper.form(form).addFieldGroup({
            id: 'custpage_general_field_group',
            label: labels().EnableFeatures,
            tab: 'custpage_general_subtab'
        });
    }

    function addSubTabs(form){
        form.addTab({
                id: 'custpage_general_subtab',
                label: labels().EnableFeatures
        });
        form.addTab({
            id: 'custpage_notes_subtab',
            label: labels().Notes
        });

    }

    function addFields(form){

        var replacement = url.resolveDomain({hostType: url.HostType.APPLICATION, accountId: runtime.accountId});

        var vatHelp = resource.load({
            name: resource.Name.Labels,
            key: 'ChinaVatIntegrationHelp',
            replacements: {NETSUITE_WEBSITE_DOMAIN: replacement}
        });

        var cfsHelp = resource.load({
            name: resource.Name.Labels,
            key: 'ChinaCashFlowStatementHelp',
            replacements: {NETSUITE_WEBSITE_DOMAIN: replacement}
        });

        helper.form(form).addField({
            id: 'custrecord_cn_pref_vat',
            label: labels().ChinaVatIntegration,
            type:serverWidget.FieldType.CHECKBOX,
            container: 'custpage_general_field_group'
        }).setDefaultValue(userData.custrecord_cn_pref_vat).setHelpText(vatHelp);

        helper.form(form).addField({
            id: 'custrecord_cn_pref_vat_field_abs',
            label: labels().ChinaVatIntegrationAbstract,
            type:serverWidget.FieldType.LABEL,
            container: 'custpage_general_field_group'
        });

        helper.form(form).addField({
            id: 'custrecord_cn_pref_cfs',
            label: labels().ChinaCashFlowStatement,
            type:serverWidget.FieldType.CHECKBOX,
            container: 'custpage_general_field_group'
        }).setDefaultValue(userData.custrecord_cn_pref_cfs).setHelpText(cfsHelp).setPadding(1);

        helper.form(form).addField({
            id: 'custrecord_cn_pref_cfs_field_abs',
            label: labels().ChinaCashFlowStatementAbstract,
            type:serverWidget.FieldType.LABEL,
            container: 'custpage_general_field_group'
        });

        //In order to UI arrangement
        for(var i=0;i<4;i++){
            helper.form(form).addField({
                id: 'place_holder' + i,
                type: serverWidget.FieldType.INLINEHTML,
                label: ' ',
                container: 'custpage_general_field_group'
            });
        }
        helper.form(form).addField({
            id: 'custpage_notes',
            label: ' ',  //in order to show Notes tab page , the Notes tab page will not be shown when there is no field in tab page
            type:serverWidget.FieldType.LABEL,
            container: 'custpage_notes_subtab'
        });
    }

    function addButtons(form){

        helper.form(form).addSubmitButton({
            id: 'custpage_save_button',
            label: labels().Save
        });

        helper.form(form).addButton({
            id: 'custpage_cancel_button',
            label: labels().Cancel,
            functionName: 'cancel'
        });
    }

    function createForm() {
        var form = serverWidget.createForm({
            title: labels().Title
        });
        form.clientScriptModulePath = '../../component/cs/cs_cn_pref.js';
        return form;
    }

    function setUserData(data){
        userData = data;
    }

return{
    renderAsPage: renderAsPage,
    setUserData: setUserData
}
})