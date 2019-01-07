/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../lib/commons',
    '../../res/vat/vatresource-client'
],

function(commons, resource) {

    var status = resource.load(resource.Name.Status);

    function isExported(invoiceRecord) {
        var vatStatus = invoiceRecord.getText('custrecord_cn_vat_status');
        if (commons.ensure(vatStatus) && vatStatus === this.Status.exported) {
            return true;
        }
        return false;
    }

    function isCompleted(invoiceRecord) {
        var vatStatus = invoiceRecord.getText('custrecord_cn_vat_status');
        if (commons.ensure(vatStatus) && vatStatus === this.Status.completed) {
            return true;
        }
        return false;
    }

    function isConsolidated(invoiceRecord) {
        var vatStatus = invoiceRecord.getText('custrecord_cn_vat_status');
        if (commons.ensure(vatStatus) && vatStatus === this.Status.consolidated) {
            return true;
        }
        return false;
    }

    function isSplit(invoiceRecord) {
        var vatStatus = invoiceRecord.getText('custrecord_cn_vat_status');
        if (commons.ensure(vatStatus) && vatStatus === this.Status.split) {
            return true;
        }
        return false;
    }

    var wrapper = {
        isExported: isExported,
        isCompleted: isCompleted,
        isConsolidated: isConsolidated,
        isSplit: isSplit
    };

    Object.defineProperty(wrapper, 'Status', {
        enumerable: true,
        get: function() {
            return status;
        }
    });

    return wrapper;

});
