/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_search',
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../../lib/wrapper/ns_wrapper_config',
    '../../lib/wrapper/ns_wrapper_render',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/wrapper/ns_wrapper_format',
    '../../dao/cn_blsheet_acc_period_dao',
    '../../dao/cn_currency_dao',
    '../../lib/commons',
    './app_cn_blsheet_label_parser',
    './app_cn_blsheet_template',
    './app_cn_blsheet_data',
    './app_cn_blsheet_subsidiary_init',
    './app_cn_blsheet_period_init',
    './app_cn_blsheet_location_init',
    './app_cn_blsheet_department_init',
    './app_cn_blsheet_class_init'
],

function(search, serverWidget, config, render, runtime, url, format, periodDao, currencyDao, commons, labelParser, template, data, subsidiary_init, period_init, location_init, department_init, class_init) {
    var _param, _labels;
    var _subsidiaryName;
    var _subsidiaryId;
    var _unit;
    var _unitName;
    var _periodId;
    var _periodEnd;
    var _location;
    var _department;
    var _class;
    var _calendarEnable = false;
    var _advancePrintEnable = true;
    var BLANK_REPORT_NAME = ' ';
    /**
     * @desc create form for balance sheet by request parameter.
     * @param {Object} [usrParam] - request parameter:type,reportName,reportId,periodId,bookId,subsidiaryId,unit,reportDataId,showReport,lang.
     * @return {object} balance sheet serverWidget.Form.
     */
    function createForm(usrParam) {
        _param = usrParam;
        _labels = labelParser.loadResourceFile();
        var form = serverWidget.createForm({
            title: _labels.header.pageTitle
        });
        form.clientScriptModulePath = '../../component/cs/cs_cn_blsheet.js';
        if (_param == null) {
            return form;
        }
        cacheInfor(form);
        createMainFilterGroup(form);
        createReportName(form, 'customrecord_cn_blsheet_report_names');
        createSubsidiaryField(form);
        createPeriodField(form);
        createUnitField(form);
        createRefreshField(form);

        createSecondaryFilterGroup(form);
        if(runtime.isFeatureInEffect('LOCATIONS')){
            createLocationField(form);
        }

        if(runtime.isFeatureInEffect('DEPARTMENTS')){
            createDepartmentField(form);
        }

        if(runtime.isFeatureInEffect('CLASSES')){
            createClassField(form);
        }

        if (_param.showReport) {
            createReportField(form);
            createExportExcelField(form);
            createExportPDFField(form);
        }

        return form;
    }
    /**
     * @desc create pdf report.
     * @param {Object} [reportDivStr] - balance sheet report string value.
     * @return pdf report file content.
     */
    function createPDFReport(reportDivStr) {
        var templateContent = template.getBLSheetTemplate('China Balance Sheet PDF');
        var divStr = reportDivStr == null
            ? "invalid pdf file generated" : reportDivStr.replace(/"([^"]*)"/g, "'$1'").replace(/\n/g, "");
        render.addCustomDataSource('divValue', render.DataSource.JSON, '{"value":"' + divStr + '"}');
        render.setTemplateContents(templateContent);
        var pdfFile;
        try {
            pdfFile = render.renderAsPdf();
        } catch (ex) {
            log.error('app_cn_blsheet_form', 'Export PDF failed with message ' + ex.message + '; input is ' + reportDivStr);
            render.addCustomDataSource('divValue', render.DataSource.JSON, '{"value":"invalid pdf file generated"}');
            pdfFile = render.renderAsPdf();
        }
        return pdfFile.getContents();
    }
    /**
     * @desc cache Information.
     * @param {object} [form] - balance sheet form.
     */
    function cacheInfor(form) {
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
        _calendarEnable = runtime.isFeatureInEffect('MULTIPLECALENDARS');
        _advancePrintEnable = runtime.isFeatureInEffect('ADVANCEDPRINTING');
        var cacheInfo = {
            messageInfor: _labels,
            calendarEnable: _calendarEnable,
            advancePrintEnable: _advancePrintEnable,
            langPref: runtime.getUserLanguage()
        };
        cacheField.defaultValue = JSON.stringify(cacheInfo);
    }

    function createMainFilterGroup(form){
        var mainFilterGroup = form.addFieldGroup({
            id: 'custpage_main_filter_group',
            label: 'fieldGroup'
        });
        mainFilterGroup.isBorderHidden = true;
        mainFilterGroup.isSingleColumn = true;
    }

    function createSecondaryFilterGroup(form){
        var secondaryFilterGroup = form.addFieldGroup({
            id: 'custpage_secondary_filter_group',
            label: 'fieldGroup'
        });
        secondaryFilterGroup.isBorderHidden = true;
        secondaryFilterGroup.isSingleColumn = true;
    }
    /**
     * @desc create subsidiary field.
     * @param {object} [form] - balance sheet form.
     */
    function createSubsidiaryField(form) {
        var cbo;
        //is Single Instance
        if (!runtime.isOW()) {
            cbo = form.addField({
                id: 'custpage_subsidiary',
                label: _labels.fieldLabel.company,
                type: serverWidget.FieldType.TEXT,
                container: 'custpage_main_filter_group'
            });
            cbo.updateDisplaySize({
                height: 10,
                width: 30
            });
            cbo.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.MIDROW
            });
            setCompanyFieldData(cbo);
            return;
        } else {//One World
            cbo = form.addField({
                id: 'custpage_subsidiary',
                label: _labels.fieldLabel.subsidiary,
                type: serverWidget.FieldType.SELECT,
                container: 'custpage_main_filter_group'
            });
            cbo.updateDisplaySize({
                height: 10,
                width: 300
            });
            cbo.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.MIDROW
            });
            //init Subsidiary by book
            var subsidiary = subsidiary_init.initSubsidiary(cbo, _param.subsidiaryId, _param.bookId, true);
            _subsidiaryId = subsidiary.id;
            _subsidiaryName = subsidiary.name;
        }
    }
    /**
     * @desc set company field data.
     * @param {object} [cbo] - subsidiary field.
     */
    function setCompanyFieldData(cbo) {
        cbo.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        _subsidiaryName = config.getCompanyName();
        _subsidiaryId = -1;
        cbo.defaultValue = _subsidiaryName;

        return;
    }

    /**
     * @desc create period field.
     * @param {object} [form] - balance sheet form.
     */
    function createPeriodField(form) {
        var cbo = form.addField({
            id: 'custpage_asof',
            type: serverWidget.FieldType.SELECT,
            label: _labels.fieldLabel.asof,
            container: 'custpage_main_filter_group'
        });
        cbo.updateDisplaySize({
            height: 10,
            width: 200
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.MIDROW
        });

        //init LOVs
        var rs = periodDao.fetchAllPeriodsforLOV();

        if (rs == null)
            return;
        var period = period_init.initPeriod(cbo, _param.periodId, _subsidiaryId, _calendarEnable, true);
        if (period) {
            _periodEnd = period.endDate;
        }
    }

    /**
     * @desc create unit field.
     * @param {object} [form] - balance sheet form.
     */
    function createUnitField(form) {

        var unitValueLabel = {
            1: _labels.header.unit,
            1000: _labels.header.thousand,
            10000: _labels.header.tenThousand
        };

        var cbo = form.addField({
            id: 'custpage_unit',
            type: serverWidget.FieldType.SELECT,
            label: _labels.fieldLabel.unit,
            container: 'custpage_main_filter_group'
        });

        cbo.updateDisplaySize({
            height: 10,
            width: 200
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.ENDROW
        });

        for ( var i in unitValueLabel) {
            var isSelected = commons.makesure(_param.unit)
                ? (_param.unit === i) : (i === 1);
            if (isSelected) {
                _unit = i;
                _unitName = unitValueLabel[i];
            }
            cbo.addSelectOption({
                text: unitValueLabel[i],
                value: i,
                isSelected: isSelected
            });
        }
    }

    /**
     * @desc create location field.
     * @param {object} [form] - balance sheet form.
     */
    function createLocationField(form) {
        var cbo = form.addField({
            id: 'custpage_location',
            type: serverWidget.FieldType.SELECT,
            label: _labels.fieldLabel.location,
            container: 'custpage_secondary_filter_group'
        });
        cbo.updateDisplaySize({
            height: 3,
            width: 200
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
        });

       var location = location_init.initLocation(cbo, _param.locationId, _subsidiaryId, true);
       _location=location;

    }

    /**
     * @desc create department field.
     * @param {object} [form] - balance sheet form.
     */
    function createDepartmentField(form) {
        var cbo = form.addField({
            id: 'custpage_department',
            type: serverWidget.FieldType.SELECT,
            label: _labels.fieldLabel.department,
            container: 'custpage_secondary_filter_group'
        });
        cbo.updateDisplaySize({
            height: 3,
            width: 200
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
        });
        var departmentObj=department_init.initDepartment(cbo, _param.departmentId, _subsidiaryId, true);
        _department=departmentObj;
    }

    /**
     * @desc create classification field.
     * @param {object} [form] - balance sheet form.
     */
    function createClassField(form) {
        var cbo = form.addField({
            id: 'custpage_class',
            type: serverWidget.FieldType.SELECT,
            label: _labels.fieldLabel.class,
            container: 'custpage_secondary_filter_group'
        });
        cbo.updateDisplaySize({
            height: 3,
            width: 200
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
        });
        var classesObj=class_init.initClass(cbo, _param.classId, _subsidiaryId, true);
        _class=classesObj;
    }

    /**
     * @desc create report name.
     * @param {object} [form] - balance sheet form.
     * @update: NSCHINA-3024 Add drop down list for report name field
     */
    function createReportName(form, source) {
        var reportNameField = form.addField({
            id: 'custpage_reportname',
            type: serverWidget.FieldType.SELECT,
            label: _labels.fieldLabel.templatename,
            container: 'custpage_main_filter_group',
            source: source //NSCHINA-3024
        });

        reportNameField.updateDisplaySize({
            height: 10,
            width: 300
        });

        reportNameField.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.STARTROW
        });
        reportNameField.isMandatory = true;

        var reportOptions = reportNameField.getSelectOptions();
        log.debug('app_cn_blsheet_form', 'createReportName, reportOptions=' + JSON.stringify(reportOptions));
        log.debug('app_cn_blsheet_form', 'createReportName, reportName=' + _param.reportName);
        if (commons.makesure(_param.reportNameId)) {
            log.debug('app_cn_blsheet_form', 'createReportName, _param.reportNameId' + _param.reportNameId);
            reportNameField.defaultValue = _param.reportNameId;
        } else if (reportOptions && reportOptions.length > 0 ){
            reportNameField.defaultValue = reportOptions[0].value;
        } else {
            reportNameField.defaultValue = BLANK_REPORT_NAME;
        }

    }


    /**
     * @desc create refresh button.
     * @param {object} [form] - balance sheet form.
     */
    function createRefreshField(form) {
        var refreshBotton = form.addButton({
            id: 'custpage_refresh',
            label: _labels.fieldLabel.refresh,
            functionName: 'refreshBLsheetFilterForm'
        });
        if (!_advancePrintEnable) {
            refreshBotton.isDisabled = true;
        }

    }
    /**
     * @desc create export excel button.
     * @param {object} [form] - balance sheet form.
     */
    function createExportExcelField(form) {
        form.addButton({
            id: 'custpage_export_excel',
            label: _labels.fieldLabel.exportexcel,
            functionName: 'exportExcel'
        });
    }
    /**
     * @desc create export pdf button.
     * @param {object} [form] - balance sheet form.
     */
    function createExportPDFField(form) {
        form.addButton({
            id: 'custpage_export_pdf',
            label: _labels.fieldLabel.exportpdf,
            functionName: 'exportPDF'
        });
    }
    /**
     * @desc set balance sheet report content.
     */
    function setRenderReportContent() {
        var dataSourceLabel = {};
        dataSourceLabel.header = _labels.header;
        dataSourceLabel.tableHeader = _labels.tableHeader;

        var headerData = {};
        headerData.reportDate = getReportAsOfDate();
        headerData.subsidiary = getReportSubsidiary();
        headerData.unit = getReportUnit();
        headerData.currencyCode = getReportCurrency();

        if(getReportLocation()){
            var locationName =  getReportLocation();
            headerData.location = locationName.replace(/\s|&nbsp;/gi, "");
            
        }
        if(getReportDepartment()){
            var departmentName = getReportDepartment();
            headerData.department = departmentName.replace(/\s|&nbsp;/gi, "");
        }
        if(getReportClass()){
            var classesName = getReportClass();
            headerData.classes = classesName.replace(/\s|&nbsp;/gi, "");
        }

        _param.subsidiaryId = _subsidiaryId;
        _param.periodId = _periodId;
        _param.unit = _unit;

        log.debug({
            title: 'label data',
            details: JSON.stringify(_labels)
        });
        var reportData = data.getBLSheetData(_labels.data, _param);

        var sheetDataSource = {};
        sheetDataSource.label = dataSourceLabel;
        sheetDataSource.headerData = headerData;
        sheetDataSource.tableData = reportData;
        sheetDataSource.length = reportData.length / 2;

        render.addCustomDataSource('datasource', render.DataSource.OBJECT, sheetDataSource);
        var templateContent = template.getBLSheetTemplate('China Balance Sheet');
        render.setTemplateContents(templateContent);
    }
    /**
     * @desc create balance sheet report.
     * @param {object} [form] - balance sheet form.
     */
    function createReportField(form) {
        var divStyle = 'display:inline-block; overflow:hidden;';
        var div = [
            "<div id='divvat' name='divvat' style='border-top: 1px dotted #000000; margin-top:5px;" + divStyle + "'>"
        ];

        setRenderReportContent();
        div.push(render.renderAsString());
        div.push('</div>');
        var reportContent = div.join('');

        var cbo = form.addField({
            id: 'custpage_cn_blsheet',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'report'
        });
        cbo.defaultValue = reportContent;
        cbo.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.NORMAL
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
        });
        cbo.updateBreakType({
            breakType: serverWidget.FieldBreakType.STARTROW
        });
    }
    /**
     * @desc get balance sheet report end of date.
     * @return {date} - end of date.
     */
    function getReportAsOfDate() {
        return _periodEnd;
    }
    /**
     * @desc get balance sheet report subsidiary.
     * @return subsidiary name.
     */
    function getReportSubsidiary() {
        return _subsidiaryName;
    }
    /**
     * @desc get balance sheet report unit name.
     * @return unit name.
     */
    function getReportUnit() {
        return _unitName;
    }
    /**
     * @desc get balance sheet report currency according to runtime environment.
     * @return currency code.
     */
    function getReportCurrency() {
        var currencyId;
        var currencyCode;
        //is Single Instance
        if (!runtime.isOW()) {
            currencyCode = "CNY";
        } else {//One World
            if (runtime.isFeatureInEffect('MULTICURRENCY')) {
                var subsidiary = _param.subsidiaryId;
                currencyId = currencyDao.fetchCurrencyId(subsidiary);
                currencyCode = currencyDao.fetchCurrencyCode(currencyId);
            } else {
                currencyCode = "CNY";
            }

        }
        return currencyCode;
    }
    /**
     * @desc get balance sheet report location.
     * @return location.
     */
    function getReportLocation(){
           return _location ? _location.name : null;
    }
    /**
     * @desc get balance sheet report department.
     * @return department.
     */
    function getReportDepartment(){
        return _department ? _department.name : null;
    }
    /**
     * @desc get balance sheet report class.
     * @return class.
     */
    function getReportClass(){
        return _class ? _class.name : null;
    }
    return {
        createForm: createForm,
        createPDFReport: createPDFReport
    };

});
