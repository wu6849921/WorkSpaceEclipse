/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    './helper/search_helper',
    '../lib/commons',
    '../constant/constant_cn_voucher',
    '../lib/wrapper/ns_wrapper_record'
],

function(search, helper, commons, constants, record) {
    var DATA_SUBLIST = 'recmachcustrecord_subsidiary_line';

    function columns() {
        return [
            helper.column('custrecord_type').create(),
            helper.column('custrecord_cn_voucher_trantypes_type').reference('custrecord_transaction_type').create(),
            helper.column('custrecord_user').create(),
            helper.column('custrecord_start_date').create(),
            helper.column('custrecord_end_date').create()
        ];
    }

    function filters(params) {
        var filters = [];

        if (commons.ensure(params.subsidiary)) {
            filters.push(helper.filter('custrecord_manage_subsidiary').reference("custrecord_subsidiary_line").is(params.subsidiary));
        }

        if (commons.ensure(params.type)) {
            filters.push(helper.filter('custrecord_type').is(params.type));
        }

        if (commons.makesure(params.trantype)) {
            filters.push(helper.filter('custrecord_cn_voucher_trantypes_type').reference('custrecord_transaction_type').is(params.trantype));
        }

        if (commons.ensure(params.user)) {
            filters.push(helper.filter('custrecord_user').is(params.user));
        }

        return filters;
    }

    /**
     * @desc Query all creator, approver and poster.
     * @param {Object} params - Parameters used to query
     * @returns {search.ResultSet} Query result
     */
    function queryOperators(params) {
        return helper.resultset(search.create({
            type: 'customrecord_cn_voucher_manage_data',
            columns: columns(),
            filters: filters(params)
        }).run());
    }

    /**
     * @desc Fetch transaction types supported in custom record.
     * @returns {Object} Object containing all transaction types supported.
     */
    function querySupportedTranTypes() {
        var supportedTranTypes = {};

        search.create({
            type: 'customrecord_cn_voucher_trantypes',
            columns: [
                helper.column('custrecord_cn_voucher_trantypes_type').create(),
                helper.column('name').create()
            ],
            filters: [
                helper.filter('custrecord_cn_voucher_trantypes_type').isnot(constants.TRANSACTION_TYPE_OTHER)
            ]
        }).run().each(function(tranTypeRecord) {
            var tranType = tranTypeRecord.getValue(helper.column('custrecord_cn_voucher_trantypes_type'));
            var name = tranTypeRecord.getValue(helper.column('name'));
            supportedTranTypes[tranType] = name;
            return true;
        });

        return supportedTranTypes;
    }

    function fetchMainRecordWithSubsidiary(subsidiary) {
        return search.create({
            type: 'customrecord_cn_voucher_manage_main',
            filters: [
                helper.filter('custrecord_manage_subsidiary').is(subsidiary)
            ]
        }).run().getRange({
            start: 0,
            end: 1
        }) || [];
    }

    function fetchDataRecordWithSubsidiary(params) {
        var filters = [];

        if (commons.ensure(params.subsidiary)) {
            filters.push(helper.filter('custrecord_subsidiary_line').is(params.subsidiary));
        }
        return search.create({
            type: 'customrecord_cn_voucher_manage_data',
            filters: filters
        }).run().getRange({
            start: 0,
            end: 1000
        }) || [];
    }

    /**
     * @desc Query voucher creator approver poster by subsidiary internal id for OW or account id for SI.
     * @returns {Object} List containing setup related to specific subsidiary or company.
     */
    function queryVoucherSetupById(id) {
        var filters = [];

        if (commons.ensure(id)) {
            filters.push(helper.filter('custrecord_manage_subsidiary').reference("custrecord_subsidiary_line").is(id));
        }

        var columns = [
            helper.column('custrecord_transaction_type').create(),
            helper.column('custrecord_type').create(),
            helper.column('custrecord_user').create(),
            helper.column('custrecord_start_date').create(),
            helper.column('custrecord_end_date').create()
        ];

        return search.create({
            type: 'customrecord_cn_voucher_manage_data',
            filters: filters,
            columns: columns
        }).run().getRange({
            start: 0,
            end: 1000
        }) || [];
    }

    function saveSetupData(id, setupData) {
        log.debug("cn_voucher_manage_dao.saveSetupData", "subsidiary=" + id);
        log.debug("cn_voucher_manage_dao.saveSetupData", "setupData=" + JSON.stringify(setupData));
        var searchResult = fetchMainRecordWithSubsidiary(id);
        if (searchResult.length === 0) {
            log.debug("cn_voucher_manage_dao.saveSetupData", "Add new subsidiary");
            // New setup for the subsidiary
            var mainRec = record.create({
                type: 'customrecord_cn_voucher_manage_main',
                isDynamic: true
            });
            mainRec.setValue({
                fieldId: 'custrecord_manage_subsidiary',
                value: id
            });
            for (var i = 0; i < setupData.length; i++) {
                addNewLine(mainRec, setupData[i]);
            }
            mainRec.save();
        } else {
            log.debug("cn_voucher_manage_dao.saveSetupData", "Update existing subsidiary");
            var mainRec = record.load({
                type: 'customrecord_cn_voucher_manage_main',
                id: searchResult[0].id,
                isDynamic: true
            });
            for (var i = 0; i < setupData.length; i++) {
                if (isNewLine(setupData[i]))
                    addNewLine(mainRec, setupData[i]);
                else
                    updateExistLine(mainRec, setupData[i]);
            }
            mainRec.save();
        }
    }

    function addNewLine(mainRec, data) {
        mainRec.selectNewLine({
            sublistId: DATA_SUBLIST
        });
        mainRec.setCurrentSublistValue({
            sublistId: DATA_SUBLIST,
            fieldId: 'custrecord_transaction_type',
            value: data.custrecord_transaction_type
        });
        mainRec.setCurrentSublistValue({
            sublistId: DATA_SUBLIST,
            fieldId: 'custrecord_type',
            value: data.custrecord_type
        });
        mainRec.setCurrentSublistValue({
            sublistId: DATA_SUBLIST,
            fieldId: 'custrecord_user',
            value: data.custrecord_user
        });
        mainRec.setCurrentSublistText({
            sublistId: DATA_SUBLIST,
            fieldId: 'custrecord_start_date',
            text: data.custrecord_start_date
        });
        if (commons.makesure(data.custrecord_end_date)) {
            mainRec.setCurrentSublistText({
                sublistId: DATA_SUBLIST,
                fieldId: 'custrecord_end_date',
                text: data.custrecord_end_date
            });
        }
        mainRec.commitLine({
            sublistId: DATA_SUBLIST
        });
    }

    function updateExistLine(mainRec, data) {
        if (commons.makesure(data.custrecord_end_date)) {
            var existLineNumber = mainRec.findSublistLineWithValue({
                sublistId: DATA_SUBLIST,
                fieldId: 'id',
                value: data.custrecord_id_hidden
            });
            mainRec.selectLine({
                sublistId: DATA_SUBLIST,
                line: existLineNumber
            });
            mainRec.setCurrentSublistText({
                sublistId: DATA_SUBLIST,
                fieldId: 'custrecord_end_date',
                text: data.custrecord_end_date
            });
            mainRec.commitLine({
                sublistId: DATA_SUBLIST
            });
        }
    }

    /**
     * @desc Check if current sublist line is new added line or updated line.
     * @returns {Boolean} Return true if it is new added line.
     */
    function isNewLine(data) {
        var idHidden = data.custrecord_id_hidden;
        return commons.makesure(idHidden) ? false : true;
    }

    function fetchTotalTrantypeNumber() {
        var tranTypeCountColumn = search.createColumn({
            name: 'internalid',
            summary: search.Summary.COUNT
        });
        var searchResult = search.create({
            type: 'customrecord_cn_voucher_trantypes',
            columns: tranTypeCountColumn
        }).run().getRange({
            start: 0,
            end: 1
        }) || [];

        if (!commons.ensure(searchResult))
            return 0;
        var totalCount = searchResult[0].getValue({
            name: 'internalid',
            summary: search.Summary.COUNT
        });
        return totalCount;
    }

    return {
        queryOperators: queryOperators,
        querySupportedTranTypes: querySupportedTranTypes,
        fetchMainRecordWithSubsidiary: fetchMainRecordWithSubsidiary,
        fetchDataRecordWithSubsidiary: fetchDataRecordWithSubsidiary,
        queryVoucherSetupById: queryVoucherSetupById,
        saveSetupData: saveSetupData,
        fetchTotalTrantypeNumber: fetchTotalTrantypeNumber
    };

});
