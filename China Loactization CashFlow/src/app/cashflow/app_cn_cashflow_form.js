/**
 * Copyright 漏 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../dao/cn_blsheet_acc_period_dao',
    '../../dao/cn_subsidiary_dao',
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../helper/serverWidget_helper',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_record',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../res/cashflow/cashflowresource',
    '../../app/cashflow/app_cn_cashflow_period_init',
    '../../app/balance_sheet/app_cn_blsheet_location_init',
    '../../app/balance_sheet/app_cn_blsheet_department_init',
    '../../app/balance_sheet/app_cn_blsheet_class_init'
],
function(periodDAO, subsidiaryDAO, serverWidget, helper, commons, record, runtime, resource, period_init, location_init, department_init, class_init) {

    var userData;
    var inlineTemplate;
    var fiscalCalendar;
    var _calendarEnable;

    // constructed formObj to call widget_helper addSelectOptions method
    var formObj;
    function renderAsPage() {// 初始化页面
        log.debug('app_cn_cashflow_forms.js: userData', userData);
        log.debug('app_cn_cashflow_forms.js: inlineTemplate', inlineTemplate);
        var form = createForm();
        cacheInfor(form);// 缓存字段
        addFields(form);// 查询字段
        addButtons(form);// 添加刷新按钮
        addInlineHTMLArea(form);// 结果区域

        if (commons.makesure(userData) && !userData.reset && runtime.isFeatureInEffect('ADVANCEDPRINTING')) {
            createExportExcelField(form);
            createExportPDFField(form);
        }

        return form;
    }

    function createForm() {
    	var labels = resource.load(resource.Name.Labels);
        var form = serverWidget.createForm({
            title: labels.CashFlowStatement
        });
        form.clientScriptModulePath = './app_cn_cashflow_client.js';
        log.debug('app_cn_cashflow_forms.js: createForm',  form.clientScriptModulePath);
        formObj = helper.form(form);
        return form;
    }

    function createPeriodFromField(form) {
    	var labels = resource.load(resource.Name.Labels);
        var cboPeriodFrom = form.addField({
            id: 'custpage_periodfrom',
            label: labels.Period_From,
            type: serverWidget.FieldType.SELECT
        });
        cboPeriodFrom.updateDisplaySize({
            height: 10,
            width: 200
        });
        cboPeriodFrom.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.MIDROW
        });
        return cboPeriodFrom;
    }

    function createPeriodToField(form) {
    	var labels = resource.load(resource.Name.Labels);
        var cboPeriodTo = form.addField({
            id: 'custpage_periodto',
            label: labels.Period_To,
            type: serverWidget.FieldType.SELECT
        });
        cboPeriodTo.updateDisplaySize({
            height: 10,
            width: 200
        });
        cboPeriodTo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.MIDROW
        });
        return cboPeriodTo;
    }

    function createPeriodField(form, subsidiaryId) {
        var cboPeriodFrom = createPeriodFromField(form);
        var cboPeriodTo = createPeriodToField(form);
        _calendarEnable = runtime.isFeatureInEffect('MULTIPLECALENDARS');
        var calendarId;
        if (runtime.isOW()) {
            calendarId = period_init.fetchCalendarIdBySubsidiary(subsidiaryId, _calendarEnable);
        }
        var rs = period_init.fetchPeriodByCalendarId(calendarId, _calendarEnable);
        if (!(rs === null || rs === undefined || rs.length === 0)) {
            period_init.initPeriod(cboPeriodFrom, commons.makesureall(userData, 'period') ? userData.period.from : null, rs, subsidiaryId, true);
            period_init.initPeriod(cboPeriodTo, commons.makesureall(userData, 'period') ? userData.period.to : null, rs, subsidiaryId, true);
            var accountPeriods = getAccoutPeriods(rs);
            var cacheField = form.getField({
                id: 'custpage_cachefield'
            });

            var cacheInfor = cacheField.defaultValue;
            if (commons.makesure(cacheInfor)) {
                var cacheObj = JSON.parse(cacheInfor);
                cacheObj.accountPeriods = accountPeriods;
                cacheField.defaultValue = JSON.stringify(cacheObj);
            }
        }
    }

    function createUnitField(form) {
    	var labels = resource.load(resource.Name.Labels);
        var unit = {
            value: 1,
            text: labels.UnitContent
        };
        var thousand = {
            value: 1000,
            text: labels.ThousandUnit
        };
        var tenThousandUnit = {
            value: 10000,
            text: labels.TenThousandUnit
        };
        var unitValueLabel = [];
        unitValueLabel.push(unit);
        unitValueLabel.push(thousand);
        unitValueLabel.push(tenThousandUnit);
        var cbo = form.addField({
            id: 'unit',
            type: serverWidget.FieldType.SELECT,
            label: labels.Unit
        });
        cbo.updateDisplaySize({
            height: 10,
            width: 200
        });
        cbo.updateBreakType({
            breakType: serverWidget.FieldBreakType.STARTROW
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.ENDROW
        });
        formObj.field = cbo;
        formObj.addSelectOptions(unitValueLabel);
        cbo.defaultValue = (commons.makesureall(userData, 'unit') ? userData.unit : unit);
    }

    function createSubsidiaryField(form) {
    	var labels = resource.load(resource.Name.Labels);
        var cbo = form.addField({
            id: 'custpage_subsidiary',
            label: labels.Subsidiary,
            type: serverWidget.FieldType.SELECT
        });
        var options = fetchSubsidiariesAsDropdown();
        formObj.field = cbo;
        formObj.addSelectOptions(options);

        // Subsidiary Default Logic
        // Default the first subsidiary that user has access if it is initial
		// load
        // Default the subsidiary that is given if it is page refresh
        if (commons.makesure(userData)) {
            // page refresh
            if (commons.makesureall(userData, 'subsidiary')) {
                cbo.defaultValue = userData.subsidiary;
            } else {
                // should not happen since subsidiary is mandatory for cashflow
            }
        } else {
            // initial load
            if (options[0]) {
                userData = {};
                userData.subsidiary = options[0].value;
                userData.reset = true;
                cbo.defaultValue = userData.subsidiary;
            } else {
                // should not happen
            }
        }

        cbo.updateBreakType({
            breakType: serverWidget.FieldBreakType.STARTCOL
        });

        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.STARTROW
        });

        cbo.updateDisplaySize({
            height: 10,
            width: 200
        });
        fiscalCalendar = getFiscalCalendar();
        var cboCalender = form.addField({
            id: 'custpage_fiscalcalendar',
            label: 'Fiscal Calendar',
            type: serverWidget.FieldType.TEXT
        });
        cboCalender.defaultValue = (commons.makesure(fiscalCalendar) ? fiscalCalendar : null);
        cboCalender.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
    }

    function addFields(form) {
        if (runtime.isOW()) {
            createSubsidiaryField(form);
            var subsidiaryId = userData.subsidiary;
        }
        createPeriodField(form, subsidiaryId);
        createUnitField(form);
        var isLocationEnabled = runtime.isFeatureInEffect('LOCATIONS');
        var isDepartmentEnabled = runtime.isFeatureInEffect('DEPARTMENTS');
        var isClassEnabled = runtime.isFeatureInEffect('CLASSES');
        if (isLocationEnabled) {
            createLocationField(form, subsidiaryId);
        }
        if (isDepartmentEnabled) {
            createDepartmentField(form, subsidiaryId, isLocationEnabled);
        }
        if (isClassEnabled) {
            createClassField(form, subsidiaryId, isLocationEnabled, isDepartmentEnabled);
        }
    }

    function createLocationField(form, subsidiaryId) {
    	var labels = resource.load(resource.Name.Labels);
        var cbo = form.addField({
            id: 'custpage_location',
            type: serverWidget.FieldType.SELECT,
            label: labels.location
        });
        cbo.updateDisplaySize({
            height: 10,
            width: 200
        });
        cbo.updateDisplayType({
        	displayType: serverWidget.FieldDisplayType.HIDDEN
        });
// cbo.updateBreakType({
// breakType: serverWidget.FieldBreakType.STARTROW
// });
// cbo.updateLayoutType({
// layoutType: serverWidget.FieldLayoutType.STARTROW
// });
// cbo.updateDisplayType({
// displayType: serverWidget.FieldDisplayType.NORMAL
// });
        var defaultLocationId = commons.makesureall(userData) ? userData.location : null;
        location_init.initLocation(cbo, defaultLocationId, subsidiaryId, true);
        cbo.defaultValue = (commons.makesureall(userData, 'location') ? userData.location : null);
    }

    /**
	 * @desc create department field.
	 * @param {object}
	 *            [form] - balance sheet form.
	 */
    function createDepartmentField(form, subsidiaryId, locationEnable) {
    	var labels = resource.load(resource.Name.Labels);
        var cbo = form.addField({
            id: 'custpage_department',
            type: serverWidget.FieldType.SELECT,
            label: labels.department
        });
        cbo.updateDisplaySize({
            height: 10,
            width: 200
        });
        cbo.updateDisplayType({
        	displayType: serverWidget.FieldDisplayType.HIDDEN
        });
// if (locationEnable) {
// cbo.updateLayoutType({
// layoutType: serverWidget.FieldLayoutType.MIDROW
// });
// } else {
// // if location disabled
// // department needs to be on the second row
// cbo.updateBreakType({
// breakType: serverWidget.FieldBreakType.STARTROW
// });
// cbo.updateLayoutType({
// layoutType: serverWidget.FieldLayoutType.STARTROW
// });
// cbo.updateDisplayType({
// displayType: serverWidget.FieldDisplayType.NORMAL
// });
// }

        var departmentId = commons.makesureall(userData) ? userData.department : null;
        department_init.initDepartment(cbo, departmentId, subsidiaryId, true);
        cbo.defaultValue = (commons.makesureall(userData, 'department') ? userData.department : null);
    }

    /**
	 * @desc create classification field.
	 * @param {object}
	 *            [form] - balance sheet form.
	 */
    function createClassField(form, subsidiaryId, isLocationEnabled, isDepartmentEnabled) {
    	var labels = resource.load(resource.Name.Labels);
        var cbo = form.addField({
            id: 'custpage_class',
            type: serverWidget.FieldType.SELECT,
            label: labels.class
        });
        cbo.updateDisplaySize({
            height: 3,
            width: 200
        });
        cbo.updateDisplayType({
        	displayType: serverWidget.FieldDisplayType.HIDDEN
        });
// if (isLocationEnabled || isDepartmentEnabled) {
// cbo.updateLayoutType({
// layoutType: serverWidget.FieldLayoutType.ENDROW
// });
// } else {
// // if none of location/department enabled
// // class still needs to be on the second row
// cbo.updateBreakType({
// breakType: serverWidget.FieldBreakType.STARTROW
// });
// cbo.updateLayoutType({
// layoutType: serverWidget.FieldLayoutType.STARTROW
// });
// cbo.updateDisplayType({
// displayType: serverWidget.FieldDisplayType.NORMAL
// });
// }

        var classId = commons.makesureall(userData) ? userData.classification : null;
        class_init.initClass(cbo, classId, subsidiaryId, true);
        cbo.defaultValue = (commons.makesureall(userData, 'classification') ? userData.classification : null);
    }

    function subsidiary() {
        var id = commons.makesure(userData) && commons.makesure(userData.subsidiary) ? userData.subsidiary : runtime.getUserSubsidiary();
        log.debug('app_cn_cashflow_forms.js: subsidiary', id);
        return id;
    }

    function getFiscalCalendar() {
        return subsidiaryDAO.getFiscalCalendar(subsidiary());
    }

    function addButtons(form) {
    	var labels = resource.load(resource.Name.Labels);
        form.addButton({
            id: 'refresh',
            label: labels.Refresh,
            functionName: 'refreshCashFlowFilterForm'
        });

    }

    function addInlineHTMLArea(form) {
        var divStyle = 'display:inline-block; overflow:hidden;';
        var div = [
            "<div id='divvat' name='divvat' style='border-top: 0px dotted #000000; margin-top:5px;" + divStyle + "'>"
        ];
        div.push(inlineTemplate);
        div.push('</div>');
        var reportContent = div.join('');

        var cbo = form.addField({
            id: 'inlinehtml',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'cashflow_statement'
        });
        cbo.defaultValue = reportContent;
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
        });
    }

    function setTemplateContents(contents) {
        inlineTemplate = contents;
    }

    function setUserData(data) {
        userData = data;
    }

    /**
	 * @desc fetch subsidiaries as drop down.
	 * @return subsidiary list.
	 */
    function fetchSubsidiariesAsDropdown() {
        var originresults = subsidiaryDAO.fetchAllSubsidiaries();
        var results = [];
        for ( var subIdx in originresults) {
            try {
                record.load({
                    type: record.Type.SUBSIDIARY,
                    id: originresults[subIdx].id
                });
                results.push(originresults[subIdx]);
            } catch (ex) {
                continue;
            }
        }
        var options = [];
        for ( var i in results) {
            options[i] = fetchOption(results[i]);
        }
        return options;

    }

    function fetchOption(result) {
        var name = result.getValue('name');
        var count = name.match(/ : /g) == null ? 0 : name.match(/ : /g).length;
        for (var leadingSpaces = '', j = 0; j < count; ++j) {
            leadingSpaces += '&nbsp;&nbsp;&nbsp;';
        }

        var option = {
            value: result.id,
            text: leadingSpaces + result.getValue('namenohierarchy')
        };
        return option;
    }
    /**
	 * @desc cache Information.
	 * @param {object}
	 *            [form] - cash flow form.
	 */
    function cacheInfor(form) {
    	var labels = resource.load(resource.Name.Labels);
        var cacheField = form.addField({
            id: 'custpage_cachefield',
            label: 'cacheInfo',
            type: serverWidget.FieldType.LONGTEXT
        });
        cacheField.updateDisplaySize({
            height: 10,
            width: 30
        });
        cacheField.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.MIDROW
        });
        cacheField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });

        var fileNamePrefix = labels.exportName;
        var fileName = fileNamePrefix + '.xls';
        var cacheInfo = {
            messageInfo: labels,// labels信息
            cashflow_fileNamePrefix: fileNamePrefix,// 文件名前缀Cash Flow Statement
            exportname: fileName// 文件名Cash Flow Statement。xls
        };
        cacheField.defaultValue = JSON.stringify(cacheInfo);
    }
    /**
	 * @desc create export excel button.
	 * @param {object}
	 *            [form] -cash flow form.
	 */
    function createExportExcelField(form) {
    	var labels = resource.load(resource.Name.Labels);
        form.addButton({
            id: 'custpage_export_excel',
            label: labels.ExportExcel,
            functionName: 'exportExcel'
        });
    }
    /**
	 * @desc create export pdf button.
	 * @param {object}
	 *            [form] - cash flow form.
	 */
    function createExportPDFField(form) {
    	var labels = resource.load(resource.Name.Labels);
        form.addButton({
            id: 'custpage_export_pdf',
            label: labels.ExportPDF,
            functionName: 'exportCashFlowAsPDF'
        });
    }

    function getAccoutPeriods(rs) {
        // Cache all the accounting periods of the selected subsidiary
        var accountPeriods = {};
        if (commons.makesure(rs)) {
            for ( var i in rs) {
                accountPeriods[rs[i].id] = {
                    startdate: rs[i].getValue('startdate'),
                    enddate: rs[i].getValue('enddate')
                };
            }
        }

        return accountPeriods;
    }

    return {
        renderAsPage: renderAsPage,
        setTemplateContents: setTemplateContents,
        setUserData: setUserData
    };

});
