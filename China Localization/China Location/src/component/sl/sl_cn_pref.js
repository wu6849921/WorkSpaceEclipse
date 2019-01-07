/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NScriptName Preference Suitelet
 * @NScriptId _sl_cn_pref
 * @NModuleScope TargetAccount
*/
define([
    '../../app/pref/app_cn_pref_handler',
    '../../lib/commons',
    '../../dao/cn_pref_dao',
    '../../app/pref/app_cn_pref_dispatcher',
    'N/https'
],
function(handler, commons, dao, prefDispatcher, https){

    function onRequest(context) {
        var request = context.request;
        var response = context.response;
        var parameters = request.parameters;

        log.debug('sl_cn_pref.js: onRequest', 'parameters: ' + JSON.stringify(parameters));

        if (request.method === 'POST') {
            dao.save(parameters);
            /*
             * The governence limit for suitelet is 1000, and nlapiSubmitField will consume 5 per call.
             * If deployment number reaches 200, and all deployments change at the same time, 
             * although this rate is low, there would be a potential risk here.
             */ 
            prefDispatcher.dispatch(parameters);
            response.sendRedirect({
                type: https.RedirectType.TASK_LINK,
                identifier: 'ADMI_SETUPMANAGER'
            });
        } else {
            response.writePage(handler.handleAsPage());
        }
    }

    return{
        onRequest: onRequest
    }

})