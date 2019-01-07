/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../lib/wrapper/ns_wrapper_search',
    '../../dao/cn_accounting_period_dao',
    '../../dao/cn_subsidiary_dao',
    '../../dao/cn_voucher_dao',
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../helper/serverWidget_helper',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../constant/constant_cn_voucher',
    '../../res/voucherresource'
],

function(search, periodDAO, subsidiaryDAO, voucherDAO, serverWidget, helper, commons, runtime, constants, resource) {

    var userData;
    var inlineTemplate;
    var fiscalCalendar;
    var postingPeriods;
    var labels = resource.load(resource.Name.Labels);

    function renderAsPage() {
        log.debug('app_cn_voucher_forms.js: userData', userData);
        log.debug('app_cn_voucher_forms.js: inlineTemplate', inlineTemplate);

        var form = createForm();
        addFields(form);
        addButtons(form);
        addInlineHTMLArea(form);
        return form;
    }

    function createForm() {
        var form = serverWidget.createForm({
            title: labels.Voucher_Printing_Report
        });
        form.clientScriptModulePath = './app_cn_voucher_print.js';
        return form;
    }

    function addFields(form) {
        helper.form(form).addFieldGroup({
            id: 'filterGroup',
            label: ' '
        }).setBorderHidden(true);

        if (runtime.isOW()) {
            helper.form(form).addField({
                id: 'subsidiary',
                label: labels.Subsidiary,
                type: serverWidget.FieldType.SELECT,
                container: 'filterGroup',
                source: 'subsidiary'
            }).setDefaultValue(subsidiary()).updateLayoutType(serverWidget.FieldLayoutType.STARTROW).setMandatory(true);
        } else {
            addPostingPeriodFields(form);
        }

        helper.form(form).addField({
            id: 'glnumberoper',
            type: serverWidget.FieldType.SELECT,
            label: labels.Voucher_Number,
            container: 'filterGroup'
        }).addSelectOptions(glNumberOperators()).setDefaultValue(commons.makesureall(userData, 'glnumber') ? userData.glnumber.oper : undefined).updateLayoutType(serverWidget.FieldLayoutType.STARTROW);
        helper.form(form).addField({
            id: 'glnumberval',
            type: serverWidget.FieldType.TEXT,
            label: ' ',
            container: 'filterGroup'
        }).setDefaultValue(commons.makesureall(userData, 'glnumber') ? userData.glnumber.value : undefined).updateLayoutType(serverWidget.FieldLayoutType.ENDROW);
        helper.form(form).addField({
            id: 'template',
            type: serverWidget.FieldType.SELECT,
            label: labels.Printing_Template,
            container: 'filterGroup'
        }).addSelectOptions(template()).setDefaultValue(commons.makesureall(userData, 'template') ? userData.template : preferenceTemplate()).updateLayoutType(serverWidget.FieldLayoutType.STARTROW);

        var isDisabled = runtime.isMultiCurrency() && (!commons.makesure(userData) || !commons.makesure(userData.template) || userData.template === 'Multiple_Currencies');
        if (runtime.isLocationEnabled()) {
            var locationField = helper.form(form).addField({
                id: 'location',
                type: serverWidget.FieldType.CHECKBOX,
                label: labels.Print_Location,
                container: 'filterGroup'
            }).setDefaultValue(commons.makesureall(userData, 'location') ? 'T' : 'F').updateLayoutType(serverWidget.FieldLayoutType.MIDROW);
            if (isDisabled) {
                locationField.updateDisplayType(serverWidget.FieldDisplayType.DISABLED);
            }
        }
        if (runtime.isDepartmentEnabled()) {
            var departmentField = helper.form(form).addField({
                id: 'department',
                type: serverWidget.FieldType.CHECKBOX,
                label: labels.Print_Department,
                container: 'filterGroup'
            }).setDefaultValue(commons.makesureall(userData, 'department') ? 'T' : 'F').updateLayoutType(serverWidget.FieldLayoutType.MIDROW);
            if (isDisabled) {
                departmentField.updateDisplayType(serverWidget.FieldDisplayType.DISABLED);
            }
        }
        if (runtime.isClassesEnabled()) {
            var classField = helper.form(form).addField({
                id: 'class',
                type: serverWidget.FieldType.CHECKBOX,
                label: labels.Print_Class,
                container: 'filterGroup'
            }).setDefaultValue(commons.makesureall(userData, 'classes') ? 'T' : 'F').updateLayoutType(serverWidget.FieldLayoutType.ENDROW);
            if (isDisabled) {
                classField.updateDisplayType(serverWidget.FieldDisplayType.DISABLED);
            }
        }

        if (runtime.isOW())
            addPostingPeriodFields(form);

        helper.form(form).addField({
            id: 'trandatefrom',
            type: serverWidget.FieldType.DATE,
            label: labels.Date_From,
            container: 'filterGroup'
        }).setDefaultValue(commons.makesureall(userData, 'trandate') ? userData.trandate.from : undefined).updateLayoutType(serverWidget.FieldLayoutType.STARTROW);
        helper.form(form).addField({
            id: 'trandateto',
            type: serverWidget.FieldType.DATE,
            label: labels.To,
            container: 'filterGroup'
        }).setDefaultValue(commons.makesureall(userData, 'trandate') ? userData.trandate.to : undefined).updateLayoutType(serverWidget.FieldLayoutType.ENDROW);


    }

    function addPostingPeriodFields(form) {
        helper.form(form).addField({
            id: 'periodfrom',
            label: labels.Period_From,
            type: serverWidget.FieldType.SELECT,
            container: 'filterGroup'
        }).addSelectOptions(periods()).setDefaultValue(commons.makesureall(userData, 'period') ? userData.period.from : latestPeriod()).updateLayoutType(serverWidget.FieldLayoutType.STARTROW).setMandatory(true);
        helper.form(form).addField({
            id: 'periodto',
            label: labels.To,
            type: serverWidget.FieldType.SELECT,
            container: 'filterGroup'
        }).addSelectOptions(periods()).setDefaultValue(commons.makesureall(userData, 'period') ? userData.period.to : latestPeriod()).updateLayoutType(serverWidget.FieldLayoutType.ENDROW).setMandatory(true);
    }

    function subsidiary() {
        var id = commons.makesure(userData) ? userData.subsidiary : runtime.getUserSubsidiary();
        log.debug('app_cn_voucher_forms.js: subsidiary', id);
        return id;
    }

    function template() {
        var options = [
            {
                value: constants.SINGLE_CURRENCY,
                text: labels.Single_Currency
            },
            {
                value: constants.MULTIPLE_CURRENCIES,
                text: labels.Multiple_Currencies
            }
        ];
        return options;
    }

    function preferenceTemplate() {
        if (runtime.isMultiCurrency()) {
            return constants.MULTIPLE_CURRENCIES;
        } else {
            return constants.SINGLE_CURRENCY;
        }
    }

    function fiscalcalendar() {
        if (!commons.makesure(fiscalCalendar)) {
            fiscalCalendar = subsidiaryDAO.getFiscalCalendar(subsidiary());
        }
        return fiscalCalendar;
    }

    function periods() {
        if (!commons.makesure(postingPeriods)) {
            if (runtime.isMultipleCalendars()) {
                postingPeriods = periodDAO.fetchPeriodsAsDropDown({
                    fiscalcalendar: fiscalcalendar()
                });
            } else {
                postingPeriods = periodDAO.fetchAllPeriodsAsDropDown();
            }
        }
        return postingPeriods;
    }

    function latestPeriod() {
        if (runtime.isMultipleCalendars()) {
            return periodDAO.fetchLatestPeriod({
                fiscalcalendar: fiscalcalendar()
            });
        } else {
            return periodDAO.fetchLatestPeriod();
        }
    }

    function transPerPage() {
        var papeSizeOptions = constants.TRANS_PER_PAGE.length;

        var options = [];
        for (var index = 0; index < papeSizeOptions; index++) {
            options.push({
                value: constants.TRANS_PER_PAGE[index],
                text: constants.TRANS_PER_PAGE[index]
            });
        }

        return options;
    }

    function selectPage(totalPage) {
        var options = [];

        for (var page = 0; page < totalPage; page++) {
            options.push({
                value: page + 1,
                text: (page + 1) + '/' + totalPage
            });
        }

        return options;
    }

    function glNumberOperators() {
        var operator = [
            {
                value: ' ',
                text: ' '
            }
        ];
        var glNumberOperator = resource.load(resource.Name.Operators);
        for ( var key in glNumberOperator)
            operator.push({
                value: key,
                text: glNumberOperator[key]
            });
        return operator;
    }

    function addButtons(form) {
        helper.form(form).addButton({
            id: 'refresh',
            label: labels.Refresh,
            functionName: 'refreshVoucherFilterForm'
        });

        helper.form(form).addButton({
            id: 'printAsPDF',
            label: labels.Print,
            functionName: 'printVouchersAsPDF'
        });
    }

    function addInlineHTMLArea(form) {
        addPaginationFields(form);

        helper.form(form).addField({
            id: 'inlinehtml',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Vouchers'
        }).setDefaultValue(inlineTemplate).updateLayoutType(serverWidget.FieldLayoutType.OUTSIDEBELOW);
    }

    function addPaginationFields(form) {
        if (commons.makesure(userData) && !commons.ensure(userData.reset)) {
            var totalPage = voucherDAO.getTransactionTotalPage(userData);

            if (totalPage !== 0) {
                helper.form(form).addFieldGroup({
                    id: 'paginationGroup',
                    label: ' '
                }).setBorderHidden(true);

                var searchResultTitle = "<div name='searchSeperator' style='border-top: 1px dotted #000000; margin-top: 20px;'/>";

                helper.form(form).addField({
                    id: 'resultstart',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' ',
                    container: 'paginationGroup'
                }).setDefaultValue(searchResultTitle).updateLayoutType(serverWidget.FieldLayoutType.NORMAL);

                helper.form(form).addField({
                    id: 'selectpage',
                    type: serverWidget.FieldType.SELECT,
                    label: labels.Select_Page,
                    container: 'paginationGroup'
                }).setDefaultValue(commons.makesure(userData) ? userData.selectpage : constants.SELECT_PAGE).addSelectOptions(selectPage(totalPage)).updateLayoutType(serverWidget.FieldLayoutType.STARTROW);

                helper.form(form).addField({
                    id: 'transperpage',
                    type: serverWidget.FieldType.SELECT,
                    label: labels.Transactions_Per_Page,
                    container: 'paginationGroup'
                }).setDefaultValue(commons.makesure(userData) ? userData.transperpage : constants.TRANS_PER_PAGE[0]).addSelectOptions(transPerPage()).updateLayoutType(serverWidget.FieldLayoutType.ENDROW);

                helper.form(form).addField({
                    id: 'resultend',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' ',
                    container: 'paginationGroup'
                }).setDefaultValue(searchResultTitle).updateLayoutType(serverWidget.FieldLayoutType.NORMAL);
            }
        }
    }

    function setTemplateContents(contents) {
        inlineTemplate = contents;
    }

    function setUserData(data) {
        userData = data;
    }

    return {
        renderAsPage: renderAsPage,
        setTemplateContents: setTemplateContents,
        setUserData: setUserData
    };

});
