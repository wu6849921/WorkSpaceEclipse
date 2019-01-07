/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
],

function(commons) {

    var NUMBER_KEYS = [
        'internalid'
    ];

    /**
     * Sort the array base on the key list.
     * It will sort the array multiple times in the order of keys.
     * if the type of key is number, by numerical order, otherwise by alphabetical order.
     * 
     * @input: array - the data that need to be sorted
     * @input: keys - keys in the JSON String
     * @input: type - asc or desc, asc by default
     * 
     * Example:
     * sorter.keySort(transactionData.invoices, ['cusname','status','type','docno','internalid'])
     */
    function keySort(array, keys, type) {
        var order = 1;
        if (commons.makesure(type) && type === 'desc') {
            order = -1;
        }
        //Sort the array using the first key
        var key = keys[0];
        array.sort(compareKey(key, order));
        for (var i = 1; i < keys.length; i++) {
            //Sort the array using the rest keys
            var key = keys[i];
            array.sort(function(objA, objB) {
                for (var j = 0; j < i; j++) {
                    if (objA[keys[j]] !== objB[keys[j]]) {
                        return 0;
                    }
                }
                return compareKey(key, order)(objA, objB);

            });
        }
        return array;
    }

    function compareKey(key, order) {
        return function(objA, objB) {
            var valA = objA[key], valB = objB[key];
            if (isNumberKey(key)) {
                valA = commons.toNumber(valA);
                valB = commons.toNumber(valB);
            }
            if (valA > valB) {
                return order;
            } else if (valA < valB) {
                return 0 - order;
            } else {
                return 0;
            }
        }
    }

    function isNumberKey(key) {
        return NUMBER_KEYS.indexOf(key) >= 0;
    }

    return {
        keySort: keySort
    };

});
