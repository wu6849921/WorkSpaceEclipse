/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NScriptName CN SL Voucher Manage
 * @NScriptId _sl_cn_voucher_manage
 * @NModuleScope TargetAccount
 */
define([
    '../../app/voucher/app_cn_voucher_manage_form',
    '../../lib/commons',
    '../../dao/cn_voucher_manage_dao',
    'N/http',
    '../../lib/wrapper/ns_wrapper_runtime',
],

function(form, commons, voucherManageDao, http, runtime) {

    /**
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
        var filter = request.parameters.filter;
        log.debug('sl_cn_voucher_manage.js: request.parameters.filter', filter);
        if (context.request.method === 'GET') {
            // Access from menu, change subsidiary and cancel
            if (commons.makesure(filter)) {
                filter = JSON.parse(filter);
            }
            response.writePage(form.renderAsPage(filter));
        } else {
            var subsidiary = request.parameters.subsidiary;
            // recmachcustrecord_subsidiary_line is the id of sublist
            var data = request.parameters.recmachcustrecord_subsidiary_linedata;
            if (commons.makesure(data)) {
                var setupData = [];
                // if the trantypeTotalNumber is larger than the preference,the component will change
                var trantypeTotalNumber = voucherManageDao.fetchTotalTrantypeNumber();
                // \u0002 is used to split different lines
                var dataArray = data.split('\u0002');
                for (var i = 0; i < dataArray.length; i++) {
                    // \u0001 is used to split fields in a line
                    var lineData = dataArray[i].split('\u0001');
                    if (commons.toNumber(runtime.getUserMaxdropdownsize()) <= trantypeTotalNumber) {
                        setupData.push({
                            custrecord_type: lineData[0],
                            custrecord_transaction_type: lineData[2],
                            custrecord_user: lineData[3],
                            custrecord_start_date: lineData[4],
                            custrecord_end_date: lineData[5],
                            custrecord_id_hidden: lineData[8]
                        });
                    } else {
                        setupData.push({
                            custrecord_type: lineData[0],
                            custrecord_transaction_type: lineData[1],
                            custrecord_user: lineData[2],
                            custrecord_start_date: lineData[3],
                            custrecord_end_date: lineData[4],
                            custrecord_id_hidden: lineData[7]
                        });
                    }
                }
                voucherManageDao.saveSetupData(subsidiary, setupData);
            }
            // Using redirect to prevent F5 issue
            response.sendRedirect({
                type: http.RedirectType.SUITELET,
                identifier: 'customscript_sl_cn_voucher_manage',
                id: 'customdeploy_sl_cn_voucher_manage',
                parameters: {
                    filter: JSON.stringify({
                        subsidiary: subsidiary
                    })
                }
            });
        }
    }

    return {
        onRequest: onRequest
    };

});
