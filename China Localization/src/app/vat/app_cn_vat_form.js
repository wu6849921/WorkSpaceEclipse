/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
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
    '../../dao/cn_subsidiary_dao',
    '../../lib/commons',
    './app_cn_vat_label_parser',
    './app_cn_vat_subsidiary_init',
    './app_cn_vat_template',
],

function(search, serverWidget, config, render, runtime, url, format, periodDao, subsidiaryDao, commons, labelParser, subsidiary_init, template) {
    var _labels;
    var _advancePrintEnable = true;
    var _param;
    var allSubsidiary;

    function createForm(param) {
        labelParser.refreshResourceFile();
        _labels = labelParser.loadResourceFile();
        _param = param;
        log.debug('_param', JSON.stringify(_param));
        var form = serverWidget.createForm({
            title: _labels.fieldLabel.title
        });
        form.clientScriptModulePath = '../../component/cs/cs_cn_vat.js';
        cacheInfo(form, param);
        createmultiLangField(form);
        createRefreshField(form);
        createSubsidiaryField(form);
        createVATInvoiceTypeField(form);
        createDateFromField(form);
        createDateToField(form);
        createCustomerField(form);
        createTransactionTypeField(form);
        createDocumentNumberFromField(form);
        createDocumentNumberToField(form);
        createSalesListField(form);
        if (param.preview) {
            createReportField(form, param);
            createExportField(form);
        }
        createImportField(form);
        if (param.preview) {
            createEditField(form);
        }
        return form;
    }


    /**
     * cache Information
     * */
    function cacheInfo(form, param) {
        var cnCountry;
        var cacheField = form.addField({
            id: 'custpage_cachefield',
            label: 'cacheInfo',
            type: serverWidget.FieldType.LONGTEXT
        });
        cacheField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        if (runtime.isOW()) {
            allSubsidiary = subsidiaryDao.fetchAllChinaSubsidiaries();
            log.debug('allSubsidiary: ', allSubsidiary);
        } else {
            var configRecObj = config.load({
                type: config.Type.COMPANY_INFORMATION
            });
            var country = configRecObj.getValue('country');
            if (country !== 'CN') {
                cnCountry = false;
            }

        }
        var cacheInfo = {
            messageInfor: _labels,
            cacheKey: param.cacheKey,
            cnCountry: cnCountry,
            dataLength: 0,
            refreshTime: param.refreshTime,
            existEditableData: false,
        // current page invoices data size
        };

        if (commons.makesure(param.invoiceData)) {


            cacheInfo.errorMsg = param.invoiceData.errorMsg;
            if (commons.makesure(param.invoiceData.invoices)) {
                cacheInfo.existEditableData = existEditableData(param.invoiceData.invoices);
                cacheInfo.dataLength = param.invoiceData.invoices.length;
            }



        }
        cacheField.defaultValue = JSON.stringify(cacheInfo);
    }


    function existEditableData(invoices) {
        if (!commons.makesure(invoices)) {
            return false;
        }
        for (var i = 0; i < invoices.length; i++) {

            if (invoices[i].editable) {
                return true;
            }
        }
        return false;

    }

    function createmultiLangField(form) {
        var multiLangField = form.addField({
            id: 'cn_vat_multilang_bundle',
            label: 'Multi-Lang',
            type: serverWidget.FieldType.LONGTEXT
        });
        multiLangField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });

        multiLangField.defaultValue = JSON.stringify(_labels.errorMessage);
    }

    function createVATInvoiceTypeField(form) {
        var cbo = form.addField({
            id: 'custpage_vatinvoicetype',
            label: _labels.fieldLabel.vatinvoicetype,
            type: serverWidget.FieldType.SELECT
        });
        // Defect   NSCHINA-419    [VAT]SI:The position of DATE FROM and To is not correct 
        if (runtime.isOW()) {
            cbo.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.ENDROW
            });
        } else {
            cbo.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.STARTROW
            });
        }
        cbo.isMandatory = true;
        var VATInvoiceType = [
            _labels.fieldLabel.specialinvoice,
            _labels.fieldLabel.commoninvoice
        ];
        for ( var i in VATInvoiceType) {
            cbo.addSelectOption({
                text: VATInvoiceType[i],
                value: i,
                isSelected: true
            });
        }
        if (commons.makesure(_param.invoiceType)) {
            cbo.defaultValue = _param.invoiceType;
        } else {
            cbo.defaultValue = 'Special VAT Invoice';
        }

    }

    function createSalesListField(form) {
        var cbo = form.addField({
            id: 'custpage_saleslist',
            label: _labels.fieldLabel.saleslist,
            type: serverWidget.FieldType.SELECT
        });

        var SalesList = [
            _labels.fieldLabel.yes,
            _labels.fieldLabel.no
        ];
        for ( var i in SalesList) {
            cbo.addSelectOption({
                text: SalesList[i],
                value: i,
                isSelected: true
            });
        }
        log.debug('salesList: ', _param.salesList);
        if (commons.makesure(_param.salesList)) {

            cbo.defaultValue = _param.salesList;
        } else {
            cbo.defaultValue = 'Yes';
        }
    }

    function createSubsidiaryField(form) {
        if (runtime.isOW()) {
            var cbo = form.addField({
                id: 'custpage_subsidiary',
                label: _labels.fieldLabel.subsidiary,
                type: serverWidget.FieldType.SELECT
            });

            cbo.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.STARTROW
            });
            cbo.isMandatory = true;
            var subsidiaryId;
            if (commons.makesure(_param.subsidiaryId)) {
                subsidiaryId = _param.subsidiaryId;
            }
            var subsidiary = subsidiary_init.initSubsidiary(cbo, subsidiaryId);
            log.debug('subsidiary: ', subsidiary);
        }
    }

    function createTransactionTypeField(form) {
        var cbo = form.addField({
            id: 'custpage_transactiontype',
            label: _labels.fieldLabel.trantype,
            type: serverWidget.FieldType.MULTISELECT
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.STARTROW
        });

        var transactionType = [
            _labels.fieldLabel.trantypeinvoice,
            _labels.fieldLabel.trantypecashsale,
            _labels.fieldLabel.trantypecreditmemo,
            _labels.fieldLabel.trantypecashrefund
        ];
        var transactionTypeId = [
            'CustInvc',
            'CashSale',
            'CustCred',
            'CashRfnd'
        ];

        for ( var i in transactionType) {
            var isSelected = false;
            if (commons.makesure(_param.orginalTransTypes)) {
                for (var j = 0; j < _param.orginalTransTypes.length; j++) {
                    if (transactionTypeId[i] === _param.orginalTransTypes[j]) {
                        isSelected = true;
                        break;
                    }
                }
            }
            cbo.addSelectOption({
                text: transactionType[i],
                value: transactionTypeId[i],
                isSelected: isSelected
            });
        }

    }

    function createCustomerField(form) {
        var cbo = form.addField({
            id: 'custpage_customer',
            label: _labels.fieldLabel.customer,
            type: serverWidget.FieldType.MULTISELECT,
            source: 'customer'
        });
        cbo.updateDisplaySize({
            height: 3,
            width: 300
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.STARTROW
        });
        if (commons.makesure(_param.orginalCustomerIds)) {
            cbo.defaultValue = _param.orginalCustomerIds;
        }

    }

    function createDateFromField(form) {
        var cbo = form.addField({
            id: 'custpage_datefrom',
            type: serverWidget.FieldType.DATE,
            label: _labels.fieldLabel.datefrom
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.STARTROW
        });
        cbo.isMandatory = true;
        if (commons.makesure(_param.startDate)) {
            cbo.defaultValue = _param.startDate;
        } else {
            cbo.defaultValue = new Date();
        }

    }

    function createDateToField(form) {
        var cbo = form.addField({
            id: 'custpage_dateto',
            type: serverWidget.FieldType.DATE,
            label: _labels.fieldLabel.dateto
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.ENDROW
        });
        cbo.isMandatory = true;
        if (commons.makesure(_param.endDate)) {
            cbo.defaultValue = _param.endDate;
        } else {
            cbo.defaultValue = new Date();
        }

    }

    function createDocumentNumberFromField(form) {
        var cbo = form.addField({
            id: 'custpage_documentnumberfrom',
            type: serverWidget.FieldType.INTEGER,
            label: _labels.fieldLabel.docnumfrom
        });
        cbo.updateDisplaySize({
            height: 10,
            width: 30
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.STARTROW
        });
        if (commons.makesure(_param.minDocNo)) {
            cbo.defaultValue = _param.minDocNo;
        }

    }

    function createDocumentNumberToField(form) {
        var cbo = form.addField({
            id: 'custpage_documentnumberto',
            type: serverWidget.FieldType.INTEGER,
            label: _labels.fieldLabel.docnumto
        });
        cbo.updateDisplaySize({
            height: 10,
            width: 30
        });
        cbo.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.ENDROW
        });
        if (commons.makesure(_param.maxDocNo)) {
            cbo.defaultValue = _param.maxDocNo;
        }
    }

    function createRefreshField(form) {
        var refreshButton = form.addButton({
            id: 'custpage_refresh',
            label: _labels.fieldLabel.refresh,
            functionName: 'refreshVATForm'
        });

        if (!_advancePrintEnable || haveCNCountry() === false) {
            refreshButton.isDisabled = true;
        } else {
            refreshButton.isDisabled = false;
        }
    }

    function createExportField(form) {
        var exportButton = form.addButton({
            id: 'custpage_export',
            label: _labels.fieldLabel.exporttxt,
            functionName: 'exportTxtFile'
        });
        if (disableExportButton() === false) {
            exportButton.isDisabled = true;
        } else {
            exportButton.isDisabled = false;
        }
    }

    function createImportField(form) {
        form.addButton({
            id: 'custpage_import',
            label: _labels.fieldLabel.importtxt,
            functionName: 'importTxtFile'
        });
    }

    function createEditField(form) {
        var editButton = form.addButton({
            id: 'custpage_edit',
            label: _labels.fieldLabel.edittxt,
            functionName: 'edit'
        });
        editButton.isDisabled = !enableEditButton();


    }

    function createReportField(form, param) {
        var divStyle = 'display:inline-block; overflow:hidden;';
        var div = [
            "<div id='divvat' name='divvat' style='width:100%; border-top: 1px dotted #000000; margin-top:5px;" + divStyle + "'>"
        ];
        var cbo = form.addField({
            id: 'custpage_cn_vat_preview',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'preview'
        });

        //        log.error('TEST no data' , JSON.stringify(param))

        var invoiceData = param.invoiceData.invoices;
        log.debug('invoiceData', JSON.stringify(invoiceData));
        if (commons.makesure(invoiceData)) {
            setRenderReportContent(invoiceData);
            div.push(render.renderAsString());
        } else {
            div.push("<div  style='font-size:12pt'>" + _labels.errorMessage.noDataExport + "</div>");
        }
        div.push('</div>');
        var reportContent = div.join('');


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
    function setRenderReportContent(invoiceData) {
        var dataSourceLabel = {};
        dataSourceLabel.tableHeader = _labels.tableHeader;
        dataSourceLabel.itemHeader = _labels.itemHeader;
        log.debug('label', JSON.stringify(dataSourceLabel));
        var vatDataSource = {};
        vatDataSource.label = dataSourceLabel;
        vatDataSource.invoiceData = reviseReportData(invoiceData);
        render.addCustomDataSource('datasource', render.DataSource.OBJECT, vatDataSource);
        var templateContent = template.getTemplate('China VAT Preview Template');
        render.setTemplateContents(templateContent);
    }

    function reviseReportData(invoiceData) {
        if (!commons.makesure(invoiceData)) {
            return invoiceData;
        }
        for (var i = 0; i < invoiceData.length; i++) {
            if (isConsolidatedTran(invoiceData[i])) {
                invoiceData[i].href = resolveMergedTransURL(invoiceData[i].internalid);
                invoiceData[i].internalid = invoiceData[i].rawtraninternalid;
            }
        }
        return invoiceData;
    }

    function resolveMergedTransURL(internalid) {
        return url.resolveScript({
            scriptId: 'customscript_sl_cn_vat_preview_drilldown',
            deploymentId: 'customdeploy_sl_cn_vat_preview_drilldown',
            params: {
                internalid: internalid
            }
        });
    }

    function isConsolidatedTran(invoice) {
        return commons.makesure(invoice.rawtraninternalid) && invoice.rawtraninternalid.indexOf('CON') !== -1;
    }

    function disableExportButton() {
        // if result is null or all transaction have error, then the export button is disable.
        if (commons.makesure(_param.invoiceData)) {
            var invoices = _param.invoiceData.invoices;
            if (!commons.makesure(invoices)) {
                return false;
            }
            for (var i = 0; i < invoices.length; i++) {
                if (!commons.makesure(invoices[i].errMsg)) {
                    return true;
                }
            }
            return false;
        }


        return haveCNCountry();
    }

    function enableEditButton() {
        if (!commons.makesure(_param.invoiceData)) {
            return false;
        }
        var invoices = _param.invoiceData.invoices;
        if (!commons.makesure(invoices)) {
            return false;
        }
        return true;
    }

    /**
     * if is OW and no CN country
     * of is SI and current country is not SN
     * 
     * @returns if have CN country, return true. else false.
     */
    function haveCNCountry() {
        if (!runtime.isOW()) {
            var configRecObj = config.load({
                type: config.Type.COMPANY_INFORMATION
            });
            var country = configRecObj.getValue('country');
            log.debug('title' + _labels.fieldLabel.title);
            if (country !== 'CN') {
                return false;
            }

        } else {
            if (!commons.makesure(allSubsidiary)) {
                return false;
            }
        }
        return true;
    }

    return {
        createForm: createForm,
    };

});
