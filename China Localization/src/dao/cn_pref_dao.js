/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/wrapper/ns_wrapper_record',
    '../lib/commons',
    './helper/search_helper',
],

function(search, record, commons, helper) {
    var recordType = 'customrecord_cn_preferences';
    /**
     * @desc fetch preference row. 
     * If not exists, then create one with all true values.
     * @return only one preference row.
     */
    function fetchPreference() {
        var rs = query();
        if (commons.makesure(rs)) {
            return {
                "custrecord_cn_pref_vat": rs[0].getValue('custrecord_cn_pref_vat') || "T",
                "custrecord_cn_pref_cfs": rs[0].getValue('custrecord_cn_pref_cfs') || "T"
            }
        } else {
            return {
                "custrecord_cn_pref_vat": "T",
                "custrecord_cn_pref_cfs": "T"
            };
        }

    }

    function save(params) {
        var rs = query();
        var prefRec;
        if (commons.makesure(rs)) {
            prefRec = record.load({
                type: recordType,
                id: rs[0].id
            });

        } else {
            prefRec = record.create({
                type: recordType,
                isDynamic: true
            });
        }

        setValues(prefRec, params);
        prefRec.save();
    }

    function query() {
        return search.create({
            type: "customrecord_cn_preferences",
            columns: [
                helper.column('internalid').create(),
                helper.column('custrecord_cn_pref_vat').create(),
                helper.column('custrecord_cn_pref_cfs').create()
            ]
        }).run().getRange({
            start: 0,
            end: 1000
        }) || [];
    }

    function setValues(record, params) {
        var fields = ['custrecord_cn_pref_vat', 'custrecord_cn_pref_cfs'];
        for (var i = 0; i < fields.length; i++) {
            record.setValue({
                fieldId: fields[i],
                value: params[fields[i]]
            });
        }
    }

    return {
        fetchPreference: fetchPreference,
        save: save
    };

});
