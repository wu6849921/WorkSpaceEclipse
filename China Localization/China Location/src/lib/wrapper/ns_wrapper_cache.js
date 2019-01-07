/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    'N/cache'
],

function(cache) {

    var names = {
        Voucher: 'VOUCHER_CACHE',
        CashFlow: 'CASHFLOW_CACHE',
        Income: 'INCOME_CACHE',
        Atbl:'ATBL_CACHE',
        Sblg:'SBLG_CACHE',
        Cbjl:'CBJL_CACHE',
        Pref: 'PREF_CACHE',
        Common: 'COMMON_CACHE',
        VAT: 'vat',
        BLSheet: 'blsheet_labels'
    };

    var keys = [
        'Labels',
        'File',
        'Currencies',
        'Operators',
        'Errors',
        'Email',
        'vat_labels',
        'blsheet_labels'
    ];

    function getCache(options) {
        return cache.getCache(options);
    }

    var wrapper = {
        getCache: getCache
    };

    Object.defineProperty(wrapper, 'Cache', {
        enumerable: true,
        get: function() {
            return cache.Cache;
        }
    });

    Object.defineProperty(wrapper, 'Scope', {
        enumerable: true,
        get: function() {
            return cache.Scope;
        }
    });

    Object.defineProperty(wrapper, 'Name', {
        enumerable: true,
        get: function() {
            return names;
        }
    });

    Object.defineProperty(wrapper, 'Key', {
        enumerable: true,
        get: function() {
            return keys;
        }
    });

    return wrapper;

});
