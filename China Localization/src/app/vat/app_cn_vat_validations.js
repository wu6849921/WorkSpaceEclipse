/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    './app_cn_vat_label_parser',
    '../../lib/wrapper/ns_wrapper_error'
],

function(commons, labelParser, error) {

    var _labels = labelParser.loadResourceFile();

    //rules for validation. generated warning message must follow the sequence defined in this object. 
    var FIELDS_RULES = {
        invoices: [
            {
                name: 'cusname',
                resKey: 'customerName',
                limit: 100
            },

            {
                name: 'cusaddrphoneno',
                resKey: 'addressAndPhone',
                limit: 100
            },
            {
                name: 'cusbankno',
                resKey: 'bankAccount',
                limit: 100
            },

        ],
        items: [
            {
                name: 'name',
                resKey: 'itemName',
                limit: 92
            },

            {
                name: 'uom',
                resKey: 'uom',
                limit: 22
            },
            {
                name: 'model',
                resKey: 'model',
                limit: 40
            }
        ]

    };

    /**
     * validate length of fields.
     * if find error, throw SuiteScript Error: 
     * {
     *      name:'warning', 
     *      message: {fieldname:'field label text', limit: limit}
     * }
     * @param invoiceData
     * @returns return if no error
     * 
     */
    function validateFieldsLength(invoiceData) {
        var invoices = invoiceData.invoices;
        if (!commons.makesure(invoices)) {
            return;
        }
        var errorFields = {};//key is field name, value is message object
        for (var i = 0; i < invoices.length; i++) {
            doValidate(invoices[i], 'invoices', errorFields);
            for (var j = 0; j < invoices[i].items.length; j++) {
                doValidate(invoices[i].items[j], 'items', errorFields);
            }
        }
        if (!commons.makecertain(errorFields)) {
            return;
        }
        throw error.create({
            name: 'warning',
            message: JSON.stringify(getSortedMessages(errorFields)),
            notifyOff: true
        });

    }

    /**
     * do validate invoice header/ item line value. 
     * error will be added to errorFields
     * 
     * @param line  invoice header/ item line need to be validate 
     * @param type 'invoice'/'items' indicates the line type is header or item
     * @param errorFields result value. value will be changed in this function.
     * @returns
     */
    function doValidate(line, type, errorFields) {
        var rules = FIELDS_RULES[type];
        var resType = type === 'items' ? 'itemHeader' : 'tableHeader';
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            //only check fields don't exists in error map
            if (rule.name in errorFields) {
                return;
            }
            var value = line[rule.name];
            if (commons.byteLength(value) > rule.limit) {
                errorFields[rule.name] = {
                    fieldname: _labels[resType][rule.resKey],
                    limit: rule.limit
                };
            }

        }
    }


    function getSortedMessages(errorFields) {

        return getTypeSortedMessages(errorFields, FIELDS_RULES.invoices).concat(getTypeSortedMessages(errorFields, FIELDS_RULES.items));

    }


    function getTypeSortedMessages(errorFields, rules) {
        var rsArray = [];
        for (var i = 0; i < rules.length; i++) {

            var fieldName = rules[i].name;
            if (!(fieldName in errorFields)) {
                continue;
            }
            rsArray.push(errorFields[fieldName]);
        }
        return rsArray;
    }



    return {
        validateFieldsLength: validateFieldsLength
    };

});
