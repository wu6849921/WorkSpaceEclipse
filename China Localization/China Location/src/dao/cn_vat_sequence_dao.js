/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/wrapper/ns_wrapper_record',
    './helper/search_helper',
    '../constant/constant_cn_vat',
    '../lib/commons'
],

function(search, record, helper, consts, commons) {

    /**
     * @desc Sync up sequence number record.
     * It updates record with latest number + 1 as the new latest number.
     * @return {string} - new generated internal id.
     */
    function nextSequenceNumber() {
        var sequenceObj = querySequenceNumber();
        if (!commons.makesure(sequenceObj)) {
            var seqRecord = record.create({
                type: 'customrecord_cn_vat_seq_number',
                isDynamic: true
            });
            var latestNumber = 1;
        } else {
            seqRecord = record.load({
                type: 'customrecord_cn_vat_seq_number',
                id: sequenceObj.internalId,
                isDynamic: true
            });
            latestNumber = sequenceObj.number + 1;
        }
        seqRecord.setValue('custrecord_cn_vat_seq_number', latestNumber);
        seqRecord.save();
        return formConsolidatedTranNumber(latestNumber);
    }

    /**
     * @desc Query the latest internal id of sequence number record.
     * @return {(string|undefined)} - the latest internal id.
     */
    function currentSequenceNumber() {
        var latestNumber = querySequenceNumber();
        if (!commons.makesure(latestNumber)) {
            return;
        }
        return formConsolidatedTranNumber(latestNumber.number);
    }

    function querySequenceNumber() {
        var searchNumber = search.create({
            type: 'customrecord_cn_vat_seq_number',
            columns: [
                helper.column('internalid').create(),
                helper.column('custrecord_cn_vat_seq_number').create()
            ]
        });

        var seqNums = searchNumber.run().getRange(0, 1);
        if (!commons.makesure(seqNums)) {
            return;
        }
        return {
            internalId: commons.toNumber(seqNums[0].getValue('internalid')),
            number: commons.toNumber(seqNums[0].getValue('custrecord_cn_vat_seq_number'))
        };
    }

    function formConsolidatedTranNumber(num) {
        if (commons.makesure(num)) {
            var numLength = (num + '').length;
            if (numLength < 6) {
                var padNum = '';
                for (var i = 0; i < 6 - numLength; i++) {
                    padNum += '0';
                }
                return consts.PREFIX_INTERNAL_ID + padNum + num;
            }
            return consts.PREFIX_INTERNAL_ID + num;
        }
    }

    return {
        nextSequenceNumber: nextSequenceNumber,
        currentSequenceNumber: currentSequenceNumber
    };

});
