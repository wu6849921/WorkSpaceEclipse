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
    '../../res/income/incomeresource',
    '../../lib/wrapper/ns_wrapper_format',
    '../../dao/cn_accounting_period_dao',
    '../../dao/cn_location_dao',
    '../../dao/cn_department_dao',
    '../../dao/cn_class_dao'
],

function(subsidiaryDAO, serverWidget, helper, commons, record, runtime, resource, format, periodDAO, locationDAO, departmentDAO, classDAO) {
    var inlineTemplate;
    var userData;
    var resourceLabels;
    var postingPeriods;
    var reportDataId;

    function labels() {
        if (!commons.makesure(resourceLabels)) {
            resourceLabels = resource.load(resource.Name.Labels);
        }
        return resourceLabels;
    }

    function renderAsPage() {
        var form = createForm();
        addFields(form);
        addButtons(form);
        addInlineHTMLArea(form);
        return form;
    }

    function createForm() {
        var form = serverWidget.createForm({
            title: labels().IncomeStatement
        });
        form.clientScriptModulePath = '../../component/cs/cs_cn_income.js';
        return form;
    }

    function addFields(form) {
        createMainFilterGroup(form);
        addReportNameField(form);
        addSubsidiaryField(form);
        addPeriodField(form);
        addUnitField(form);
        createSecondaryFilterGroup(form);
        if (runtime.isFeatureInEffect('LOCATIONS')) {
            addLocationField(form);
        }
        if (runtime.isFeatureInEffect('DEPARTMENTS')) {
            addDepartmentField(form);
        }
        if (runtime.isFeatureInEffect('CLASSES')) {
            addClassField(form);
        }
        addHiddenReportDataIdField(form);
    }

    function createMainFilterGroup(form) {
        helper.form(form).addFieldGroup({
            id: 'custpage_main_filter_group',
            label: 'MainFieldGroup'
        }).setBorderHidden(true).setSingleColumn(true);
    }

    function createSecondaryFilterGroup(form) {
        helper.form(form).addFieldGroup({
            id: 'custpage_secondary_filter_group',
            label: 'SecondFieldGroup'
        }).setBorderHidden(true).setSingleColumn(true);
    }

    function addReportNameField(form) {
        var reportNameField = helper.form(form).addField({
            id: 'custpage_reportname',
            type: serverWidget.FieldType.SELECT,
            label: labels().templatename,
            container: 'custpage_main_filter_group',
            source: 'customrecord_cn_income_report_names'
        });
        reportNameField.updateDisplaySize(10, 300);

        var reportOptions = reportNameField.getSelectOptions();

        if (userData) {
            reportNameField.setDefaultValue(userData.reportNameId);
        } else {
            if (reportOptions && reportOptions.length > 0) {
                reportNameField.setDefaultValue(reportOptions[0].value);
            }
        }
        reportNameField.updateLayoutType(serverWidget.FieldLayoutType.STARTROW);
        reportNameField.setMandatory(true);
    }

    function addSubsidiaryField(form) {
        if (runtime.isOW()) {
            var subsidiaryField = helper.form(form).addField({
                id: 'custpage_subsidiary',
                label: labels().Subsidiary,
                type: serverWidget.FieldType.SELECT,
                container: 'custpage_main_filter_group'
            });
            subsidiaryField.addSelectOptions(subsidiaryDAO.fetchSubsidiariesOfCurrentRole());
            subsidiaryField.setDefaultValue(getSubsidiaryId()).updateLayoutType(serverWidget.FieldLayoutType.MIDROW);
            subsidiaryField.updateDisplaySize(10, 300);

        }
    }

    function addPeriodField(form) {
        var defaultPeriod = commons.makesureall(userData, 'period', 'id') ? userData.period.id : latestPeriod();
        helper.form(form).addField({
            id: 'custpage_period',
            label: labels().Period,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_main_filter_group'
        }).addSelectOptions(getPeriods()).setDefaultValue(defaultPeriod).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 200);
    }

    function getPeriods() {
        if (runtime.isMultipleCalendars()) {
            postingPeriods = periodDAO.fetchPeriodsAsDropDown({
                fiscalcalendar: getFiscalcalendar()
            });
        } else {
            postingPeriods = periodDAO.fetchAllPeriodsAsDropDown();
        }
        return postingPeriods;
    }

    function getFiscalcalendar() {
        return subsidiaryDAO.getFiscalCalendar(getSubsidiaryId());
    }

    function addUnitField(form) {
        var unit = {
            value: 1,
            text: labels().UnitContent
        };
        var thousandUnit = {
            value: 1000,
            text: labels().ThousandUnit
        };
        var tenThousandUnit = {
            value: 10000,
            text: labels().TenThousandUnit
        };
        var unitValueLabel = [
            unit,
            thousandUnit,
            tenThousandUnit
        ];
        var unitField = helper.form(form).addField({
            id: 'custpage_unit',
            type: serverWidget.FieldType.SELECT,
            label: labels().Unit,
            container: 'custpage_main_filter_group'
        });
        unitField.updateDisplaySize(10, 200);
        unitField.updateLayoutType(serverWidget.FieldLayoutType.ENDROW);
        unitField.addSelectOptions(unitValueLabel).setDefaultValue(commons.makesureall(userData, 'unit', 'id') ? userData.unit.id : unit);

    }

    /**
     * @desc create location field.
     * @param {object} [form] - Income Statements form.
     */
    function addLocationField(form) {
        var defaultLocation = commons.makesureall(userData, 'location', 'id') ? userData.location.id : null;
        helper.form(form).addField({
            id: 'custpage_location',
            label: labels().Location,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_secondary_filter_group'
        }).addSelectOptions(getLocations()).setDefaultValue(defaultLocation).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 200);
    }

    function getLocations() {
        var locationObj = locationDAO.fetchLocationsAsDropDown({
            subsidiary: getSubsidiaryId()
        });
        locationObj.unshift({
            value: -1,
            text: '&nbsp;'
        });
        return locationObj;

    }

    /**
     * @desc create department field.
     * @param {object} [form] - Income Statements form.
     */
    function addDepartmentField(form) {
        var defaultDepartment = commons.makesureall(userData, 'department', 'id') ? userData.department.id : null;
        helper.form(form).addField({
            id: 'custpage_department',
            label: labels().Department,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_secondary_filter_group'
        }).addSelectOptions(getDepartments()).setDefaultValue(defaultDepartment).updateLayoutType(serverWidget.FieldLayoutType.MIDROW).updateDisplaySize(10, 200);
    }

    function getDepartments() {
        var departmentObj = departmentDAO.fetchDepartmentsAsDropDown({
            subsidiary: getSubsidiaryId()
        });
        departmentObj.unshift({
            value: -1,
            text: '&nbsp;'
        });
        return departmentObj;
    }

    /**
     * @desc create class field.
     * @param {object} [form] - Income Statements form.
     */
    function addClassField(form) {
        var defaultClass = commons.makesureall(userData, 'clasz', 'id') ? userData.clasz.id : null;
        helper.form(form).addField({
            id: 'custpage_class',
            label: labels().Clasz,
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_secondary_filter_group'
        }).addSelectOptions(getClasses()).setDefaultValue(defaultClass).updateLayoutType(serverWidget.FieldLayoutType.ENDROW).updateDisplaySize(10, 200);
    }

    function getClasses() {
        var classObj = classDAO.fetchClassesAsDropDown({
            subsidiary: getSubsidiaryId()
        });
        classObj.unshift({
            value: -1,
            text: '&nbsp;'
        });
        return classObj;
    }

    function addHiddenReportDataIdField(form) {
        var reportDataIdField = helper.form(form).addField({
            id: 'custpage_reportdataid',
            label: 'reportdataid',
            type: serverWidget.FieldType.TEXT
        });
        reportDataIdField.setDefaultValue(commons.makesure(reportDataId) ? reportDataId : '').updateDisplayType(serverWidget.FieldDisplayType.HIDDEN);
    }

    function getSubsidiaryId() {
        var id = commons.makesure(userData) && commons.makesureall(userData, 'subsidiary', 'id') ? userData.subsidiary.id : runtime.getUserSubsidiary();
        log.debug('app_cn_income_form.js: subsidiary', id);
        return id;
    }

    function addButtons(form) {
        addRefreshButton(form);
        if (commons.makesure(userData) && commons.makesure(inlineTemplate)) {
            addExportExcelButton(form);
            addExportPDFButton(form);
        }
    }

    function addRefreshButton(form) {
        helper.form(form).addButton({
            id: 'custpage_refresh',
            label: labels().Refresh,
            functionName: 'refreshIncomeForm'
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
            label: labels().exportpdf,
            functionName: 'exportPDF'
        });
    }

    function addInlineHTMLArea(form) {
        helper.form(form).addField({
            id: 'custpage_inlinehtml',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Income Statement'
        }).setDefaultValue(inlineTemplate).updateDisplayType(serverWidget.FieldDisplayType.NORMAL).updateLayoutType(serverWidget.FieldLayoutType.OUTSIDEBELOW);
    }

    function latestPeriod() {
        if (runtime.isMultipleCalendars()) {
            return periodDAO.fetchLatestPeriod({
                fiscalcalendar: getFiscalcalendar()
            });
        } else {
            return periodDAO.fetchLatestPeriod();
        }
    }

    function setTemplateContents(contents, cachedReportDataId) {
        inlineTemplate = contents;
        reportDataId = cachedReportDataId;
    }

    function setUserData(data) {
        userData = data;
    }

    return {
        renderAsPage: renderAsPage,
        setUserData: setUserData,
        setTemplateContents: setTemplateContents
    };

});
