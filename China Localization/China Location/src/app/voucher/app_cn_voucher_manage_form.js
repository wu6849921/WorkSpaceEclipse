/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../constant/constant_cn_voucher',
    '../../res/voucherresource',
    '../../app/helper/serverWidget_helper',
    '../../dao/cn_employee_dao',
    '../../dao/cn_voucher_manage_dao'
],

function(serverWidget, commons, runtime, constants, resource, helper, employeeDao, voucherManageDao) {

    var labels = resource.load(resource.Name.Labels);
    var sublist;
    function renderAsPage(userData) {
        log.debug('app_cn_voucher_manage_form.js: userData', userData);

        var form = createForm();
        addFields(form, userData);
        sublist = addSublist(form);
        addSublistVal(userData);
        addButtons(form);
        return form;
    }

    function createForm() {
        var form = serverWidget.createForm({
            title: labels.Voucher_Setup
        });
        form.clientScriptModulePath = '../../component/cs/cs_cn_voucher_manage.js';
        return form;
    }

    function addFields(form, userData) {
        if (runtime.isOW()) {
            helper.form(form).addField({
                id: 'subsidiary',
                label: labels.Voucher_Setup_Subsidiary,
                type: serverWidget.FieldType.SELECT,
                source: 'subsidiary'
            }).setDefaultValue(getSubsidiary(userData)).updateLayoutType(serverWidget.FieldLayoutType.STARTROW).setMandatory(true);
        } else {
            helper.form(form).addField({
                id: 'subsidiary',
                label: 'AccountId Hidden',
                type: serverWidget.FieldType.TEXT
            }).setDefaultValue(runtime.accountId).updateDisplayType(serverWidget.FieldDisplayType.HIDDEN);
        }
    }

    /**
     * @desc Add sublist to setup creator approver and poster.
     * @param {Object} form - add sublist to the form
     * @returns null
     */
    function addSublist(form) {
        var sublist = form.addSublist({
            id: 'recmachcustrecord_subsidiary_line',
            type: serverWidget.SublistType.INLINEEDITOR,
            label: labels.Voucher_Setup_Sublist
        });
        var type = sublist.addField({
            id: 'custrecord_type',
            type: serverWidget.FieldType.SELECT,
            label: labels.Voucher_Setup_Type
        });
        type.addSelectOption({
            value: ' ',
            text: '&nbsp;'
        });
        type.addSelectOption({
            value: constants.CREATOR,
            text: labels.Creator
        });
        type.addSelectOption({
            value: constants.APPROVER,
            text: labels.Approver
        });
        type.addSelectOption({
            value: constants.POSTER,
            text: labels.Poster
        });
        type.isMandatory = true;
        var transType = sublist.addField({
            id: 'custrecord_transaction_type',
            type: serverWidget.FieldType.SELECT,
            source: 'customrecord_cn_voucher_trantypes',
            label: labels.Voucher_Setup_TranType
        });
        transType.isMandatory = true;
        var user = sublist.addField({
            id: 'custrecord_user',
            type: serverWidget.FieldType.SELECT,
            label: labels.Voucher_Setup_User
        });
        addSelectOptions(user, employeeDao.fetchAllEmployeesAsDropdown());
        user.isMandatory = true;
        var startDate = sublist.addField({
            id: 'custrecord_start_date',
            type: serverWidget.FieldType.DATE,
            label: labels.Voucher_Setup_Start_Date
        });
        startDate.isMandatory = true;
        sublist.addField({
            id: 'custrecord_end_date',
            type: serverWidget.FieldType.DATE,
            label: labels.Voucher_Setup_End_Date
        });

        var startDateHidden = sublist.addField({
            id: 'custrecord_start_date_hidden',
            type: serverWidget.FieldType.TEXT,
            label: 'Start Date Hidden'
        });
        startDateHidden.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        var endDateHidden = sublist.addField({
            id: 'custrecord_end_date_hidden',
            type: serverWidget.FieldType.TEXT,
            label: 'End Date Hidden'
        });
        endDateHidden.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        // To check if it is edit or add
        var internalIdHidden = sublist.addField({
            id: 'custrecord_id_hidden',
            type: serverWidget.FieldType.TEXT,
            label: 'Hidden Id'
        });
        internalIdHidden.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        return sublist;
    }

    function addSublistVal(userData) {
        var id;
        if (runtime.isOW()) {
            id = getSubsidiary(userData);
        } else {
            id = runtime.accountId;
        }
        log.debug("app_cn_voucher_manage_form.addSublistVal", "id=" + id);
        var dataResult = voucherManageDao.queryVoucherSetupById(id);
        log.debug("app_cn_voucher_manage_form.addSublistVal", "dataResult.length=" + dataResult.length);
        for (var index = 0; index < dataResult.length; index++) {
            var data = dataResult[index];
            sublist.setSublistValue({
                id: 'custrecord_transaction_type',
                line: index,
                value: data.getValue({
                    name: 'custrecord_transaction_type'
                })
            });
            sublist.setSublistValue({
                id: 'custrecord_type',
                line: index,
                value: data.getValue({
                    name: 'custrecord_type'
                })
            });
            sublist.setSublistValue({
                id: 'custrecord_user',
                line: index,
                value: data.getValue({
                    name: 'custrecord_user'
                })
            });
            sublist.setSublistValue({
                id: 'custrecord_start_date',
                line: index,
                value: data.getValue({
                    name: 'custrecord_start_date'
                })
            });
            var endDate = data.getValue({
                name: 'custrecord_end_date'
            });
            if (commons.makesure(endDate)) {
                sublist.setSublistValue({
                    id: 'custrecord_end_date',
                    line: index,
                    value: endDate
                });
                sublist.setSublistValue({
                    id: 'custrecord_end_date_hidden',
                    line: index,
                    value: endDate
                });
            }
            sublist.setSublistValue({
                id: 'custrecord_id_hidden',
                line: index,
                value: data.id
            });
        }
    }

    function addButtons(form) {
        helper.form(form).addSubmitButton({
            label: labels.Voucher_Btn_Save
        });
        helper.form(form).addButton({
            id: 'cancel',
            label: labels.Voucher_Btn_Cancel,
            functionName: 'cancelChange'
        });
    }

    function getSubsidiary(userData) {
        var id = commons.makesure(userData)
            ? userData.subsidiary : runtime.getUserSubsidiary();
        log.debug('app_cn_voucher_forms.js: subsidiary', id);
        return id;
    }

    function addSelectOptions(filed, options) {
        if (commons.makesure(options)) {
            filed.addSelectOption({
                value: ' ',
                text: '&nbsp;'
            });
            for ( var i in options) {
                filed.addSelectOption({
                    value: options[i].value,
                    text: options[i].text,
                });
            }
        }
    }

    return {
        renderAsPage: renderAsPage
    };

});
