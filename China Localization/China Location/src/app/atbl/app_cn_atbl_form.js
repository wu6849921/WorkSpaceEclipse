/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../dao/cn_subsidiary_dao',
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../helper/serverWidget_helper',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_record',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../res/atbl/atblresource',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_date',
    '../../dao/cn_extended_report_dao',
    '../../dao/cn_location_dao',
    '../../dao/cn_department_dao',
    '../../dao/cn_class_dao'
],

function(subsidiaryDAO, serverWidget, helper, commons, record, runtime, resource, format, commonDate, atblDao, locationDAO, departmentDAO, classDAO) {

    var resourceLabels;
    var userData;    
    var listContent;
    var reportDataId;
    
    function labels() {
        if (!commons.makesure(resourceLabels)) {

            resourceLabels = resource.load(resource.Name.Labels);
        }
        return resourceLabels;
    }

    function renderAsPage() {
        var form = createForm();
        addButtons(form);
        addFields(form);
        if (commons.makesure(userData)) {
            addSublist(form);
            insertRows(form);
        }
        return form;
    }
    function insertRows(form) {
        var headerSublist = form.getSublist({
            id: 'custpage_atbl_report_sublist'
        });
        if (commons.makesure(listContent)) {
            for (var i = 0; i < listContent.body.rows.length; i++) {
                var account = listContent.body.rows[i].account;
                setSublistValue(headerSublist, 'custpage_account_name', i, formDrillDownUrl(account));
                setSublistValue(headerSublist, 'custpage_open_balance_direction', i, listContent.body.rows[i].openingBalance.direction);
                setSublistValue(headerSublist, 'custpage_open_balance_amount', i, format.parseCurrency(listContent.body.rows[i].openingBalance.amount));
                setSublistValue(headerSublist, 'custpage_debit_amount', i, format.parseCurrency(listContent.body.rows[i].currentPeriod.debit));
                setSublistValue(headerSublist, 'custpage_credit_amount', i, format.parseCurrency(listContent.body.rows[i].currentPeriod.credit));
                setSublistValue(headerSublist, 'custpage_close_balance_direction', i, listContent.body.rows[i].closingBalance.direction);
                setSublistValue(headerSublist, 'custpage_close_balance_amount', i, format.parseCurrency(listContent.body.rows[i].closingBalance.amount));
            }
        }
    }

    function formDrilldownFilters(account) {

        return {
            subsidiary: userData.subsidiary,
            date: userData.date,
            account: {
                from: {
                    id: account.id,
                    name: account.name
                },
                to: {
                    id: account.id,
                    name: account.name
                }
            },
            accountlevel: "onlylast",
            location: {
                id: userData.location.id,
                name: userData.location.name
            },
            department: {
                id: userData.department.id,
                name: userData.department.name
            },
            clasz: {
                id: userData.clasz.id,
                name: userData.clasz.name
            }
        };
    }

    function formDrillDownUrl(account) {
        return "<a class=\"dottedlink\" href=\"javascript:void(0)\" oncontextmenu=\"return false;\" onclick=\"var drilldownFilters ='" + encodeURI(JSON.stringify(formDrilldownFilters(account))) + "'; var accountType ='" + account.type + "';onClickAccount(drilldownFilters,accountType);\">" + account.name + "</a>";
    }

    function setSublistValue(sublist, id, index, value) {
        if (commons.makesure(value)) {
            sublist.setSublistValue({
                id: id,
                line: index,
                value: value
            });
        }
    }
    function addButtons(form) {
        addRefreshButton(form);
        if (commons.makesure(userData) && commons.makesure(listContent)) {
            addExportExcelButton(form);
            addExportPDFButton(form);
        }
    }
    function addRefreshButton(form) {
        helper.form(form).addButton({
            id: 'custpage_refresh',
            label: labels().Refresh,
            functionName: 'refresh'
        });
    }
    function addExportExcelButton(form) {
        helper.form(form).addButton({
            id: 'custpage_export_excel',
            label: labels().exportexcel,
            functionName: 'exportExcel'
        });
    }
    function addExportPDFButton(form) {
        helper.form(form).addButton({
            id: 'custpage_export_pdf',
            label:labels().exportpdf,
            functionName: 'exportPDF'
        });
    }
    function createForm() {
        var form = serverWidget.createForm({
            title: labels().atbl
        });
        form.clientScriptModulePath = '../../component/cs/cs_cn_atbl.js';
        return form;
    }

    function addFields(form) {
        addMainFilterGroup(form);
        addSubsidiaryField(form);
        addDateFields(form);
        addSecondaryFilterGroup(form);
        addAccountLevelField(form);
        addAccountFromField(form);
        addAccountToField(form);
        addThirdFilterGroup(form);
        if(runtime.isFeatureInEffect('LOCATIONS')){
            addLocationField(form);
        }
        if(runtime.isFeatureInEffect('DEPARTMENTS')){
            addDepartmentField(form);
        }
        if(runtime.isFeatureInEffect('CLASSES')){
            addClassField(form);
        }
        addHiddenReportDataIdField(form);
    }
    function addSublist(form) {
        var atblReportSublist = form.addSublist({
            id: 'custpage_atbl_report_sublist',
            type: serverWidget.SublistType.LIST,
            label: labels().atbl
        });

        atblReportSublist.addField({
            id: 'custpage_account_name',
            type: serverWidget.FieldType.TEXTAREA,
            label: labels().Account
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        atblReportSublist.addField({
            id: 'custpage_open_balance_direction',
            type: serverWidget.FieldType.TEXT,
            label: labels().OpenBalanceDirection
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        atblReportSublist.addField({
            id: 'custpage_open_balance_amount',
            type: serverWidget.FieldType.CURRENCY,
            label: labels().OpenBalanceAmount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        atblReportSublist.addField({
            id: 'custpage_debit_amount',
            type: serverWidget.FieldType.CURRENCY,
            label: labels().DebitAmount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        atblReportSublist.addField({
            id: 'custpage_credit_amount',
            type: serverWidget.FieldType.CURRENCY,
            label: labels().CreditAmount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        atblReportSublist.addField({
            id: 'custpage_close_balance_direction',
            type: serverWidget.FieldType.TEXT,
            label: labels().CloseBalanceDirection
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        atblReportSublist.addField({
            id: 'custpage_close_balance_amount',
            type: serverWidget.FieldType.CURRENCY,
            label: labels().CloseBalanceAmount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
    }

    function addMainFilterGroup(form) {
        helper.form(form).addFieldGroup({
            id: 'custpage_main_filter_group',
            label: 'MainFieldGroup'
        }).setBorderHidden(true).setSingleColumn(true);
    }

    function addSecondaryFilterGroup(form) {
        helper.form(form).addFieldGroup({
            id: 'custpage_secondary_filter_group',
            label: 'SecondFieldGroup'
        }).setBorderHidden(true).setSingleColumn(true);
    }

    function addThirdFilterGroup(form) {
        helper.form(form).addFieldGroup({
            id: 'custpage_third_filter_group',
            label: 'ThirdFieldGroup'
        }).setBorderHidden(true).setSingleColumn(true);
    }

    function addSubsidiaryField(form) {
        if (runtime.isOW()) {
            var subsidiaryField = helper.form(form).addField({
                id: 'custpage_subsidiary',
                label: labels().Subsidiary,
                type: serverWidget.FieldType.SELECT,
                container: 'custpage_main_filter_group'
            });
            subsidiaryField.addSelectOptions(subsidiaryDAO.fetchSubsidiariesWithConsolidatedOfCurrentRoleAsDropdown(labels().Consolidated));
            subsidiaryField.setDefaultValue(getSubsidiaryId(form)).updateLayoutType(serverWidget.FieldLayoutType.STARTROW);
            subsidiaryField.updateDisplaySize(10, 300);
            subsidiaryField.setMandatory(true);
        }
    }
        
    function addHiddenReportDataIdField(form) {
        var reportDataIdField = helper.form(form).addField({
            id: 'custpage_reportdataid',
            label: 'reportdataid',
            type: serverWidget.FieldType.TEXT
        });
        reportDataIdField.setDefaultValue(commons.makesure(reportDataId) ? reportDataId : '').updateDisplayType(serverWidget.FieldDisplayType.HIDDEN);
    }

    function getSubsidiaryId(form) {
        if (runtime.isOW()) {
            var defaultSubsidiary = form.getField({
                id: 'custpage_subsidiary'
            }).getSelectOptions()[0].value;
            return commons.makesureall(userData, 'subsidiary', 'id')
                ? userData.subsidiary.id : defaultSubsidiary;
        }
        return null;
    }

    function addDateFields(form){
        var params = {
            'firstDay': commonDate.firstDayOfMonth(),
            'lastDay': commonDate.lastDayOfMonth()
        };
        addDateFromField(form,params);
        addDateToField(form,params);
    }

    function addDateFromField(form, params){
        var defaultDateFrom = commons.makesureall(userData, 'date', 'from', 'name')
        ? userData.date.from.name : params.firstDay;
        helper.form(form).addField({
            id: 'custpage_datefrom',
            label: labels().DateFrom,
            type: serverWidget.FieldType.DATE,
            container: 'custpage_main_filter_group'
        }).setDefaultValue(defaultDateFrom).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 280).setMandatory(true);
    }

    function addDateToField(form, params) {
        var defaultDateTo = commons.makesureall(userData, 'date', 'to', 'name')
        ? userData.date.to.name : params.lastDay;
        helper.form(form).addField({
            id: 'custpage_dateto',
            label: labels().To,
            type: serverWidget.FieldType.DATE,
            container: 'custpage_main_filter_group'
        }).setDefaultValue(defaultDateTo).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 280).setMandatory(true);
    }


    function addAccountFromField(form) {
        var defaultAccountFrom = commons.makesureall(userData, 'account', 'from', 'id')
            ? userData.account.from.id : null;
        helper.form(form).addField({
            id: 'custpage_accountfrom',
            label: labels().AccountFrom,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_secondary_filter_group'
        }).addSelectOptions(getAccounts(form)).setDefaultValue(defaultAccountFrom).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 300);
    }

    function addAccountToField(form) {
        var defaultAccountTo = commons.makesureall(userData, 'account', 'to', 'id')
            ? userData.account.to.id : null;
        helper.form(form).addField({
            id: 'custpage_accountto',
            label: labels().To,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_secondary_filter_group'
        }).addSelectOptions(getAccounts(form)).setDefaultValue(defaultAccountTo).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 300);
    }

    function addAccountLevelField(form) {
        var defaultLevel=commons.makesureall(userData, 'accountlevel', 'id')
            ? userData.accountlevel.id : 'tolast';
        var tofirst = {
            value: 'tofirst',
            text: labels().ToFirst
        };
        var tolast = {
            value: 'tolast',
            text: labels().ToLast
        };
        var onlylast = {
            value: 'onlylast',
            text: labels().OnlyLast
        };
        var levelValueLabel = [
            tofirst,
            tolast,
            onlylast
        ];
        var accountLevelField = helper.form(form).addField({
            id: 'custpage_accountlevel',
            type: serverWidget.FieldType.SELECT,
            label: labels().AccountLevel,
            container: 'custpage_secondary_filter_group'
        });
        accountLevelField.updateDisplaySize(10, 300);
        accountLevelField.updateLayoutType(serverWidget.FieldLayoutType.MIDROW);
        accountLevelField.addSelectOptions(levelValueLabel).setDefaultValue(defaultLevel);
    }

    function getAccounts(form) {
        return atblDao.fetchAccountsAsDropDown({
            subsidiary: getSubsidiaryId(form)
        });
    }

    function addLocationField(form) {
        var defaultLocation = commons.makesureall(userData, 'location', 'id') ? userData.location.id : null;
        helper.form(form).addField({
            id: 'custpage_location',
            label: labels().Location,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_third_filter_group'
        }).addSelectOptions(getLocations(form)).setDefaultValue(defaultLocation).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 300);
    }

    function getLocations(form){
        var locationObj = locationDAO.fetchLocationsAsDropDown({
            subsidiary: getSubsidiaryId(form)
        });
        locationObj.unshift({value: ' ', text: '&nbsp;'});
        return locationObj;
    }

    function addDepartmentField(form) {
        var defaultDepartment = commons.makesureall(userData, 'department', 'id') ? userData.department.id : null;
        helper.form(form).addField({
            id: 'custpage_department',
            label: labels().Department,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_third_filter_group'
        }).addSelectOptions(getDepartments(form)).setDefaultValue(defaultDepartment).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 300);
    }

    function getDepartments(form){
        var departmentObj = departmentDAO.fetchDepartmentsAsDropDown({
            subsidiary: getSubsidiaryId(form)
        });
        departmentObj.unshift({value: ' ', text: '&nbsp;'});
        return departmentObj;
    }

    function addClassField(form) {
        var defaultClass = commons.makesureall(userData, 'clasz', 'id') ? userData.clasz.id : null;
        helper.form(form).addField({
            id: 'custpage_class',
            label: labels().Clasz,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_third_filter_group'
        }).addSelectOptions(getClasses(form)).setDefaultValue(defaultClass).updateLayoutType(serverWidget.FieldLayoutType.ENDROW).updateDisplaySize(10, 300);
    }

    function getClasses(form){
        var classObj = classDAO.fetchClassesAsDropDown({
            subsidiary: getSubsidiaryId(form)
        });
        classObj.unshift({value: ' ', text: '&nbsp;'});
        return classObj;
    }

    function setSublistContents(contents) {
        listContent = contents;
    }

    function setUserData(data) {
        userData = data;
    }
    function setTemplateContents( cachedReportDataId) {
        reportDataId = cachedReportDataId;
    }
    return {
        renderAsPage: renderAsPage,
        setUserData: setUserData,
        setSublistContents: setSublistContents,
        setTemplateContents: setTemplateContents
    }

});
