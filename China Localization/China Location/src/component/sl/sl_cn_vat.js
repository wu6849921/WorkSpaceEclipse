/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    '../../app/vat/app_cn_vat_form',
    '../../app/vat/app_cn_vat_data',
    '../../app/vat/app_cn_vat_file',
    '../../app/vat/app_cn_vat_status_update',
    '../../lib/wrapper/ns_wrapper_cache',
    '../../lib/wrapper/ns_wrapper_error',
    '../../app/vat/app_cn_vat_validations'
], function(commons, vatForm, vatData, vatFile, updateStatus, cache, error, validations) {

    /**
     *  
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        var request = context.request;
        var response = context.response;
        var param = {};
        param.format = request.parameters.format;
        if (commons.makesure(request.parameters.transTypes)) {
            param.transTypes = request.parameters.transTypes.split(',');
        }
        if (commons.makesure(request.parameters.orginalTransTypes)) {
            param.orginalTransTypes = request.parameters.orginalTransTypes.split(',');
        }
        param.subsidiaryId = request.parameters.subsidiaryId;
        param.invoiceType = request.parameters.invoiceType;
        param.customerOperator = request.parameters.customerOperator;
        if (commons.makesure(request.parameters.customerIds) && request.parameters.customerIds.length > 0)
            param.customerIds = request.parameters.customerIds.split(',');
        if (commons.makesure(request.parameters.orginalCustomerIds) && request.parameters.orginalCustomerIds.length > 0)
            param.orginalCustomerIds = request.parameters.orginalCustomerIds.split(',');
        param.startDate = request.parameters.startDate;
        param.endDate = request.parameters.endDate;
        param.minDocNo = request.parameters.minDocNo;
        param.maxDocNo = request.parameters.maxDocNo;
        param.cacheKey = request.parameters.cacheKey;
        param.refreshTime = request.parameters.refreshTime;
        param.dataLength = request.parameters.dataLength;
        param.salesList = request.parameters.salesList;
        param.preview = request.parameters.preview;
        param.ignoreWarning = request.parameters.ignoreWarning;

        if (param.format === 'txt') {
            log.debug('onRequest:refresh', 'param: ' + JSON.stringify(param));
            //remove old cache data
            removeOrignalCacheData(param.cacheKey);
            var dataObj = vatData.getInvoiceData(param);
            if (!dataObj) {
                dataObj = {};
            } else {
                //in order to lower data press, we just should return cachekey.
                dataObj.invoices = [];
            }
            response.write(JSON.stringify(dataObj));
        } else if (param.format === 'export') {
            log.debug('onRequest: export', 'param: ' + JSON.stringify(param));
            var invoiceData = getInvoiceCacheData(param, true);
            log.debug('sl_cn_vat', 'invoiceData: ' + JSON.stringify(invoiceData));

            try {
                if (!param.ignoreWarning) {
                    validations.validateFieldsLength(invoiceData);
                }
                //update the status of invoice to exported
                updateVATStatus(invoiceData);
                var vatExpFile = vatFile.generateTxtFile(invoiceData);
                if (vatExpFile === null) {
                    response.write("error when generating file");
                } else {
                    response.writeLine({
                        output: JSON.stringify({
                            type: 'file',
                            url: vatExpFile.url
                        })
                    });
                }
            } catch (e) {
                if (e.name === 'warning') {
                    response.write(JSON.stringify(e));
                } else {
                    //other exception, the http response will be an error page
                    throw e;
                }
            }


        } else {
            log.debug('onRequest: refresh', 'param: ' + JSON.stringify(param));

            if (commons.makesure(param.cacheKey)) {
                param.preview = true;
                param.invoiceData = getInvoiceCacheData(param, false);
                log.debug('preview ', 'cacheKey: ' + param.cacheKey + '; invoiceData ' + JSON.stringify(param.invoiceData));
            } else {
                param.invoiceData = {};
            }
            var form = vatForm.createForm(param);
            response.writePage({
                pageObject: form
            });
        }

    }


    /*
     * update the status of invoice 
     * */
    function updateVATStatus(invoiceData) {
        filterErrorInvoices(invoiceData);
        var invoices = invoiceData.invoices;
        if (commons.makesure(invoices)) {
            var ids = [];
            for ( var i in invoices) {
                if (commons.makesure(invoices[i].children)) {
                    for (var j = 0; j < invoices[i].children.length; j++) {
                        var child = invoices[i].children[j];
                        ids.push(child.rawtraninternalid);
                    }
                } else {
                    ids.push(invoices[i].internalid);
                }

            }
            log.debug("sl_cn_vat", "update status ids: " + ids);
            updateStatus.updateStatusWhenExport(ids);
        }


    }

    /**
     * filter error invoices
     * */
    function filterErrorInvoices(dataObj) {
        var invoices = dataObj.invoices;
        var newInvoices = [];
        for (var i = 0; i < invoices.length; i++) {
            if (!commons.makesure(invoices[i].errMsg)) {
                newInvoices.push(invoices[i]);
            }
        }
        dataObj.invoices = newInvoices;
    }
    /*
     * remove old cache data
     * */
    function removeOrignalCacheData(cacheKey) {
        if (commons.makesure(cacheKey)) {
            //get invoice cache which cached in app_cn_vat_data when query invoice data.
            var invoiceCache = cache.getCache({
                name: 'vat',
                scope: cache.Scope.PROTECTED
            });
            //remove cache
            invoiceCache.remove({
                key: cacheKey
            });
        }
    }
    /*
     * fetch invoice data according to cache key, and support remove cache after get data
     * */
    function getInvoiceCacheData(param, isRemove) {
        var cacheKey = param.cacheKey;
        //get invoice cache which cached in app_cn_vat_data when query invoice data.
        var invoiceCache = cache.getCache({
            name: 'vat',
            scope: cache.Scope.PROTECTED
        });


        var invoiceData = JSON.parse(invoiceCache.get({
            key: cacheKey,
            loader: function() {
                return vatData.getInvoiceData(param);
            }
        }));
        if (isRemove) {
            log.debug('getInvoiceCacheData', 'remove cache, cache key:' + cacheKey);
            //remove cache
            invoiceCache.remove({
                key: invoiceData.cacheKey
            });
        }
        return invoiceData;
    }

    return {
        onRequest: onRequest,
        updateVATStatus: updateVATStatus,
        removeOrignalCacheData: removeOrignalCacheData

    };

});
