/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */


define([
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_format',
],

function(commons, formatter) {

    function isEntryValid(newEntry, oldEntry) {
        var newStartDate = formatter.parseDate(newEntry.startDate);
        var oldStartDate = formatter.parseDate(oldEntry.startDate);
        var oldEndDate = oldEntry.endDate;

        if (commons.makesure(oldEndDate)) {
            if (newStartDate.getTime() > formatter.parseDate(oldEndDate).getTime()) {
                return true;
            }
        }

        if (newStartDate >= oldStartDate) {
            return false;
        } else {
            if (!commons.makesure(newEntry.endDate)) {
                return false;
            }

            if (formatter.parseDate(newEntry.endDate).getTime() >= oldStartDate.getTime()) {
                return false;
            }
        }
        return true;
    }

    return {
        isEntryValid: isEntryValid
    }
});
