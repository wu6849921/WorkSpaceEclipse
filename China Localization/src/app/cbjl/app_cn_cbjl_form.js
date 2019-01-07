/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../../lib/commons',
    '../../res/cbjl/cbjlresource',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../helper/serverWidget_helper',
    '../../dao/cn_subsidiary_dao',
    '../../dao/cn_extended_report_dao',
    '../../dao/cn_accounting_period_dao',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_date',
    '../helper/extendedReport_helper',
    '../../dao/cn_location_dao',
    '../../dao/cn_department_dao',
    '../../dao/cn_class_dao'
],
function (serverWidget, commons, resource, runtime, helper, subsidiaryDAO, extDao, periodDAO, formatter, commonDate, reportHelper, locationDAO, departmentDAO, classDAO) {
    var resourceLabels;
    var userData;
    var listContent;
    var reportDataId;
    function labels(){
        if (!commons.makesure(resourceLabels)) {
            resourceLabels = resource.load(resource.Name.Labels);
        }
        return resourceLabels;
    }

    function renderAsPage(){
        var form = createForm();
        addButtons(form);
        addFields(form);
        if (commons.makesure(userData)) {
            addSublist(form);
            insertRows(form);
        }
        return form;
    }

    function addFields(form){
        createMainFilterGroup(form);
        addSubsidiaryField(form);
        addDateFields(form);
        addAccountFromField(form);
        addAccountToField(form);
        addHiddenReportDataIdField(form);
        createSecondaryFilterGroup(form);
        if(runtime.isFeatureInEffect('LOCATIONS')){
            addLocationField(form);
        }
        if(runtime.isFeatureInEffect('DEPARTMENTS')){
            addDepartmentField(form);
        }
        if(runtime.isFeatureInEffect('CLASSES')){
            addClassField(form);
        }
    }

    function createMainFilterGroup(form){
        helper.form(form).addFieldGroup({
            id: 'custpage_main_filter_group',
            label: 'MainFieldGroup'
        }).setBorderHidden(true).setSingleColumn(true);
    }

    function createSecondaryFilterGroup(form){
        helper.form(form).addFieldGroup({
            id: 'custpage_secondary_filter_group',
            label: 'SecondFieldGroup'
        }).setBorderHidden(true).setSingleColumn(true);
    }

    /**
     * @desc create location field.
     * @param {object} [form] - China Subledger form.
     */
    function addLocationField(form) {
        var defaultLocation = commons.makesureall(userData, 'location', 'id') ? userData.location.id : null;
        helper.form(form).addField({
            id: 'custpage_location',
            label: labels().Location,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_secondary_filter_group'
        }).addSelectOptions(getLocations(form)).setDefaultValue(defaultLocation).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 200);
    }

    function getLocations(form){
        var locationObj = locationDAO.fetchLocationsAsDropDown({
            subsidiary: getSubsidiaryId(form)
        });
        locationObj.unshift({value: ' ', text: '&nbsp;'});
        return locationObj;

    }

    /**
     * @desc create department field.
     * @param {object} [form] - China Subledger form.
     */
    function addDepartmentField(form) {
        var defaultDepartment = commons.makesureall(userData, 'department', 'id') ? userData.department.id : null;
        helper.form(form).addField({
            id: 'custpage_department',
            label: labels().Department,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_secondary_filter_group'
        }).addSelectOptions(getDepartments(form)).setDefaultValue(defaultDepartment).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 200);
    }

    function getDepartments(form){
        var departmentObj = departmentDAO.fetchDepartmentsAsDropDown({
            subsidiary: getSubsidiaryId(form)
        });
        departmentObj.unshift({value: ' ', text: '&nbsp;'});
        return departmentObj;
    }

    /**
     * @desc create class field.
     * @param {object} [form] - China Subledger form.
     */
    function addClassField(form) {
        var defaultClass = commons.makesureall(userData, 'clasz', 'id') ? userData.clasz.id : null;
        helper.form(form).addField({
            id: 'custpage_class',
            label: labels().Clasz,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_secondary_filter_group'
        }).addSelectOptions(getClasses(form)).setDefaultValue(defaultClass).updateLayoutType(serverWidget.FieldLayoutType.ENDROW).updateDisplaySize(10, 200);
    }

    function getClasses(form){
        var classObj = classDAO.fetchClassesAsDropDown({
            subsidiary: getSubsidiaryId(form)
        });
        classObj.unshift({value: ' ', text: '&nbsp;'});
        return classObj;
    }

    function addDateFields(form){
        var params = {
            'firstDay': commonDate.firstDayOfMonth(),
            'lastDay': commonDate.lastDayOfMonth()
        };
        addDateFromField(form,params);
        addDateToField(form,params);
    }

    function addHiddenReportDataIdField(form) {
        var reportDataIdField = helper.form(form).addField({
            id: 'custpage_reportdataid',
            label: 'reportdataid',
            type: serverWidget.FieldType.TEXT,
            container: 'custpage_main_filter_group'
        });
        reportDataIdField.setDefaultValue(commons.makesure(reportDataId) ? reportDataId : '').updateDisplayType(serverWidget.FieldDisplayType.HIDDEN);
    }

    function addSubsidiaryField(form) {
        if(runtime.isOW()){
            var subsidiaryField = helper.form(form).addField({
                id: 'custpage_subsidiary',
                label: labels().Subsidiary,
                type: serverWidget.FieldType.SELECT,
                container: 'custpage_main_filter_group'
            });
            subsidiaryField.addSelectOptions(subsidiaryDAO.fetchSubsidiariesWithConsolidatedOfCurrentRoleAsDropdown(labels().Consolidated));
            subsidiaryField.setDefaultValue(getSubsidiaryId(form)).updateLayoutType(serverWidget.FieldLayoutType.STARTROW);
            subsidiaryField.updateDisplaySize(10, 280);
            subsidiaryField.setMandatory(true);
        }

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

    function addAccountFromField(form){
        var defaultAccountFrom = commons.makesureall(userData, 'account', 'from', 'id')
            ? userData.account.from.id : null;
        helper.form(form).addField({
            id: 'custpage_accountfrom',
            label: labels().AccountFrom,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_main_filter_group'
        }).addSelectOptions(getAccounts(form)).setDefaultValue(defaultAccountFrom).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 260);
    }

    function addAccountToField(form) {
        var defaultAccountTo = commons.makesureall(userData, 'account', 'to', 'id')
            ? userData.account.to.id : null;
        helper.form(form).addField({
            id: 'custpage_accountto',
            label: labels().To,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_main_filter_group'
        }).addSelectOptions(getAccounts(form)).setDefaultValue(defaultAccountTo).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 260);
    }

    function getAccounts(form) {
        return extDao.fetchAccountsAsDropDown({
            subsidiary: getSubsidiaryId(form),
            type:'Bank'
        });
    }

    function addButtons(form) {
        helper.form(form).addButton({
            id: 'custpage_refresh',
            label: labels().Refresh,
            functionName: 'refresh'
        });
        if (commons.makesure(userData)) {
            var excelButton = helper.form(form).addButton({
                id: 'custpage_export_excel',
                label: labels().exportexcel,
                functionName: 'exportExcel'
            });
            var pdfButton = helper.form(form).addButton({
                id: 'custpage_export_pdf',
                label: labels().exportpdf,
                functionName: 'exportPDF'
            });
            if (!commons.makesureall(listContent, 'body', 'rows') && !commons.makesureall(userData, 'rowsExceedThreshold')) {
                excelButton.setButtonDisabled(true);
                pdfButton.setButtonDisabled(true);
            }
        }
    }

    function createForm(){
        var form = serverWidget.createForm({
            title:labels().cbjl
        });
        form.clientScriptModulePath = '../../component/cs/cs_cn_cbjl.js';
        return form;
    }

    function addSublist(form){
        var cbjlReportSublist = form.addSublist({
            id: 'custpage_report_sublist',
            type: serverWidget.SublistType.LIST,
            label:labels().cbjl
        });

        cbjlReportSublist.addField({
            id:'custpage_account_name',
            type: serverWidget.FieldType.TEXT,
            label: labels().Account
        }).updateDisplayType({
            displayType:serverWidget.FieldDisplayType.DISABLED
        });

        cbjlReportSublist.addField({
            id:'custpage_date',
            type: serverWidget.FieldType.TEXT,
            label: labels().Date
        }).updateDisplayType({
            displayType:serverWidget.FieldDisplayType.DISABLED
        });

        cbjlReportSublist.addField({
            id: 'custpage_type',
            type: serverWidget.FieldType.TEXT,
            label: labels().Type
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        cbjlReportSublist.addField({
            id: 'custpage_memo',
            type: serverWidget.FieldType.TEXT,
            label: labels().Memo
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        cbjlReportSublist.addField({
            id: 'custpage_document_number',
            type: serverWidget.FieldType.TEXT,
            label: labels().DocumentNumber
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        cbjlReportSublist.addField({
            id: 'custpage_payment_method',
            type: serverWidget.FieldType.TEXT,
            label: labels().PaymentMethod
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        cbjlReportSublist.addField({
            id: 'custpage_gl_number',
            type: serverWidget.FieldType.TEXT,
            label: labels().GLNumber
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        cbjlReportSublist.addField({
            id: 'custpage_debit_amount',
            type: serverWidget.FieldType.TEXT,
            label: labels().DebitAmount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        cbjlReportSublist.addField({
            id: 'custpage_credit_amount',
            type: serverWidget.FieldType.TEXT,
            label: labels().CreditAmount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        cbjlReportSublist.addField({
            id: 'custpage_balance_direction',
            type: serverWidget.FieldType.TEXT,
            label: labels().BalanceDirection
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        cbjlReportSublist.addField({
            id: 'custpage_balance_amount',
            type: serverWidget.FieldType.TEXT,
            label: labels().BalanceAmount
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
    }

    function insertRows(form) {
        var headerSublist = form.getSublist({
            id: 'custpage_report_sublist'
        });
        if (commons.makesure(listContent)) {
            for (var i = 0; i < listContent.body.rows.length; i++) {
                var currentRow = listContent.body.rows[i];
                setSublistValue(headerSublist, 'custpage_account_name', i, reportHelper.makeBold(currentRow.account, currentRow.istotal));
                setSublistValue(headerSublist, 'custpage_date', i, reportHelper.makeBold(currentRow.date, currentRow.istotal));
                setSublistValue(headerSublist, 'custpage_type', i, reportHelper.makeBold(currentRow.type, currentRow.istotal));
                setSublistValue(headerSublist, 'custpage_memo', i, reportHelper.makeBold(currentRow.memo, currentRow.istotal));
                setSublistValue(headerSublist, 'custpage_document_number', i, reportHelper.makeBold(reportHelper.generateGLImpactLink(currentRow), currentRow.istotal));
                setSublistValue(headerSublist, 'custpage_payment_method', i, reportHelper.makeBold(currentRow.paymentMethod, currentRow.istotal));
                setSublistValue(headerSublist, 'custpage_gl_number', i, reportHelper.makeBold(currentRow.glNumber, currentRow.istotal));
                setSublistValue(headerSublist, 'custpage_debit_amount', i, reportHelper.alignRight(reportHelper.makeBold(currentRow.debit, currentRow.istotal)));
                setSublistValue(headerSublist, 'custpage_credit_amount', i, reportHelper.alignRight(reportHelper.makeBold(currentRow.credit, currentRow.istotal)));
                setSublistValue(headerSublist, 'custpage_balance_direction', i, reportHelper.makeBold(currentRow.balance.direction, currentRow.istotal));
                setSublistValue(headerSublist, 'custpage_balance_amount', i, reportHelper.alignRight(reportHelper.makeBold(currentRow.balance.amount, currentRow.istotal)));
            }
        }
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

    function setUserData(data) {
        userData = data;
    }

    function setSublistContents(contents) {
        listContent = contents;
    }

    function setTemplateContents(cachedReportDataId) {
        reportDataId = cachedReportDataId;
    }

    return {
        renderAsPage: renderAsPage,
        setUserData: setUserData,
        setSublistContents: setSublistContents,
        setTemplateContents: setTemplateContents
    }
})