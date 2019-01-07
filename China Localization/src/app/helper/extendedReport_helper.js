/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */

define([
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_url',
    '../../lib/axe'
],

function(commons, url, axe) {

    function generateGLImpactLink(params) {
        if (!commons.ensure(params.trannum)) {
            return;
        }
        var glImpactLink = url.resolveTaskLink('TRAN_IMPACT', {
            /*
             * trannum refers to transaction number column in report which is trantype + docnum.
             * a string starting with correct trantype will be accepted by resolveTaskLink.
             * e.g.
             *  CASHSALE102, CASHSALEabc, CASHSALEINVOICE123 etc are all cash sale for resolveTaskLink
             */
            trantype: params.trannum,
            searchid: '-36',
            Transaction_INTERNALID: params.internalid,
            Transaction_INTERNALIDtype: 'ANYOF',
            label: params.type
        });
        return '<a target="_blank" class="dottedlink" href="' + glImpactLink + '">' + params.documentNumber + '</a>';
    }

    function makeBold(value, isTotal) {
        return commons.ensure(isTotal) ?  axe.makeBold(value): value;
    }

    function alignRight(value) {
        return axe.align({
            value: value,
            align: 'right'
        });
    }

    return {
        generateGLImpactLink: generateGLImpactLink,
        makeBold: makeBold,
        alignRight: alignRight
    }
});
