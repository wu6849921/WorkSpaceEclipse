/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../dao/cn_transaction_dao',
    './app_cn_vat_data_process',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_cache',
    '../../lib/wrapper/ns_wrapper_runtime',
    './app_cn_vat_data_split',
    './app_cn_vat_label_parser',
    '../../lib/wrapper/ns_wrapper_config',
    '../../lib/wrapper/ns_wrapper_record',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_search',
    '../../dao/helper/search_helper',
    '../../dao/cn_vat_edit_dao'
],

function(transDao, dataProcess, formatter, cache, runtime, dataSplit, labelParser, config, record, commons, search, helper, vatEditDao) {

    /**
    Generate invoice data in json format
    @input: param
    param.subsidiaryId - subsidiary selected, -1 if SI
    param.invoiceType - 0: special, 1: common
    param.customerOperator - 'anyof', 'anyof' for all customers, don't support noneof
    param.customerIds - ID array
    param.minDocNo - Document Number From (nullable)
    param.maxDocNo - Document Number To (nullable)
    param.startDate - Date From (nullable)
    param.endDate - Date To (nullable)
    param.transTypes - Array ['CustInvc', 'CashSale', 'CustCred','CashRfnd']
    @return:invoiceData
    invoiceData = {
            taxregno: taxregno,
            invoices: invoices,
            cacheKey:key
        };
    invoices = {
            "internalid":"",
            "rawtraninternalid" :"",
            "parent":"",
            "cusname": "companyname",
            "cusaddrphoneno": "",
            "cusbankno": "bank",
            "custaxregno": "10000235689",
            "type": "CustInvc",
            "docno": "2",
            "internalid": "5",
            "docdate": "20170724",
            "itemnameforsales": "",
            "approver": "",
            "receiver": "",
            "sellerbankno": "",
            "selleraddrphoneno": "",
            "remark": "",
            "invoiceType": "Special VAT Invoice",
            "inforSheetNumber": "",
            "VATCode": "",
            "VATNumber": "",
            "errMsg": "",
            "taxpayerType": "General taxpayer",
            "linequantity": 1,
            "isperson": true,
            "taxexclusiveamt":"10000.00",
            "afterdiscountamt":"10000.00",
            "itemnameforsales":"refer to seles list",
            "status":""
            "items": [
                {
                    "internalid":"",
                    "rawiteminternalid":"",
                    "parent":"",
                    "line": "",
                    "name": "Ipad air maintain",
                    "model": "big",
                    "uom": "",
                    "quantity": "2", // 6 decimals, others are 2 decimals by default
                    "taxexclusiveamt": "10000.00",
                    "taxrate": 0,
                    "discountamt": "",
                    "taxdenom": 0,
                    "taxamt": "",
                    "discounttaxamt": "",
                    "discountrate": "",
                    "unitprice": "", // 6 decimals, others are 2 decimals by default
                    "baseprice":"",
                    "itemtype":"ShipItem",
                    "pricelevel":"",
                    "pricemethod": ""
                }
            ],
            "lineIds": [
                ""
            ]
        }
           */

    var _labels;
    function getInvoiceData(param) {
        var invoiceData = {};
        _labels = labelParser.loadResourceFile();
        try {
            checkParam(param);

            var taxregno = fetchVATRegNo(param.subsidiaryId);
            log.debug('app_cn_vat_data', 'taxregno: ' + taxregno);
            var rawVatData = queryRawVATData(param);
            var rawData = rawVatData.rawData;


            log.debug('app_cn_vat_data', 'raw VAT Data: ' + JSON.stringify(rawData));
            var invoices = dataProcess.processRawVATData(rawData, param.invoiceType);
            log.debug('app_cn_vat_data', 'invoices after process: ' + JSON.stringify(invoices));
            invoices = dataSplit.splitInvoices(invoices, param.subsidiaryId, param.salesList);
            log.debug('app_cn_vat_data', 'invoices after split:' + JSON.stringify(invoices));

            invoices = calculateTotals(invoices);
            log.debug('app_cn_vat_data', 'invoices after calculate totals:' + JSON.stringify(invoices));

            var mergedIds = rawVatData.mergedIds;
            log.debug('app_cn_vat_data', 'invoices id which already merged:' + JSON.stringify(mergedIds));
            if (commons.makesure(mergedIds)) {
                var result = vatEditDao.fetchMergedData(mergedIds);
                for (var i = 0; i < result.length; i++) {
                    if (dataProcess.filterInvoiceType(result[i], param.invoiceType)) {
                        invoices.push(result[i]);
                    }
                }
            }
            log.debug('app_cn_vat_data', "invoices after add merged data:" + JSON.stringify(invoices));


            //cache limit is 500*1024 just set to 500000
            if (JSON.stringify(invoices).length >= 500000 || invoices.length > 200) {
                log.audit('app_cn_vat_data', 'expExceedGovernance, reach cache limit 500000 length or result invoice >200');
                throw {

                    type: 'expExceedGovernance'
                };
            }


            invoiceData = {
                taxregno: taxregno,
                invoices: invoices
            };
        } catch (ex) {

            switch (ex.type) {
                case 'param_invalid':

                    log.audit('China VAT Data Gen', 'input param is invalid with reason: ' + ex.message);
                    return null;

                case 'expExceedGovernance':
                    //  case 'pageTimeout':
                    invoiceData = {
                        taxregno: taxregno,
                        invoices: [],
                        errorMsg: _labels.errorMessage[ex.type]
                    }
                    break;
                default: {
                    log.audit('app_cn_vat_data::getInvoiceData', 'catch unexpected exception' + JSON.stringify(ex));
                    throw ex;
                }

            }

        }

        cacheInvoiceData(invoiceData);
        return invoiceData;
    }
    /**
     * cache Invoice Data, in order to create file when export
     * */
    function cacheInvoiceData(invoiceData) {
        var key = runtime.getCurrentUser().id + Date.parse(new Date());
        log.debug('cacheKey', key);
        invoiceData.cacheKey = key;

        getCache().put({
            key: key,
            value: invoiceData,
            ttl: 300
        });
    }
    function getCache() {
        return cache.getCache({
            name: 'vat',
            scope: cache.Scope.PROTECTED
        });
    }

    /**
     * calculate total amount of taxexclusiveamt and  afterdiscountamt
     *
     * @param invoiceData
     * @returns
     */
    function calculateTotals(invoices) {
        for (var i = 0; i < invoices.length; i++) {
            var invoice = invoices[i];
            var taxexclusiveamt = 0.00;
            var afterdiscountamt = 0.00;
            for (var j = 0; j < invoice.items.length; j++) {
                var item = invoice.items[j];
                var amount = commons.makesure(item.taxexclusiveamt) ? commons.toNumber(item.taxexclusiveamt) : 0.00;
                var discount = commons.makesure(item.discountamt) ? commons.toNumber(item.discountamt) : 0.00;
                taxexclusiveamt += amount;
                afterdiscountamt += amount - discount;
            }
            invoice.taxexclusiveamt = '' + formatter.round(taxexclusiveamt);
            invoice.afterdiscountamt = '' + formatter.round(afterdiscountamt);
        }
        return invoices;

    }
    function checkParam(param) {
        try {
            if (param == null || param.subsidiaryId == null || param.transTypes == null || param.transTypes.length < 1) {
                throw 'param is invalid';
            }
            if (param.minDocNo != null && param.maxDocNo != null) {
                if (parseInt(param.minDocNo) > parseInt(param.maxDocNo)) {
                    throw 'minDocNo is larger than maxDocNo';
                }
            }
            if (param.endDate != null && param.startDate != null) {
                if (formatter.parseDate(param.startDate) > formatter.parseDate(param.endDate)) {
                    throw 'startDate is larger than endDate';
                }
            }
        } catch (ex) {
            throw {
                type: 'param_invalid',
                message: ex
            };
        }
    }
    /*
     * get VAT Register Number by subsidiary id
     * */
    function fetchVATRegNo(subsidiaryId) {
        if (!runtime.isOW()) {
            var country = config.getCountry();
            if (country !== 'CN') {
                return null;
            } else {
                return config.getEmployerId();
            }
        } else {
            if (subsidiaryId == null || isNaN(parseInt(subsidiaryId))) {
                return null;
            }
            var subsidiary;
            try {
                subsidiary = record.load({
                    type: record.Type.SUBSIDIARY,
                    id: subsidiaryId
                });
            } catch (ex) {
                return null;
            }

            return subsidiary.getValue({
                fieldId: 'federalidnumber'
            });
        }
    }
    /*
     * fetch transaction data by query parameter
     * */
    function queryRawVATData(param) {
        return transDao.fetchVATTransaction(param);
    }

    function getCachedData(param, isRemove) {
        var cacheKey = param.cacheKey;
        var vatCache = cache.getCache({
            name: 'vat',
            scope: cache.Scope.PROTECTED
        });

        var tranData = JSON.parse(vatCache.get({
            key: cacheKey,
            loader: function() {
                return getInvoiceData(param);
            }
        }));

        if (isRemove) {
            vatCache.remove({
                key: tranData.cacheKey
            });
        }

        return tranData;
    }

    function clearCachedData(cacheKey) {
        return cache.getCache({
            name: 'vat',
            scope: cache.Scope.PROTECTED
        }).remove({
            key: cacheKey
        });
    }

    return {
        getInvoiceData: getInvoiceData,
        getCachedData: getCachedData,
        clearCachedData: clearCachedData
    };

});
