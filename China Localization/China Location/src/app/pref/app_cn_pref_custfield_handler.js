/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../lib/wrapper/ns_wrapper_ui_serverWidget',
    '../../lib/commons'
],
function(serverWidget, commons) {

    function hideCustFields(form, fields) {
        for (var i = 0; i < fields.length; i++) {
            var field = form.getField({
                id: fields[i]
            });
            if (commons.ensure(field)) {
                field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
            }
        }
    }

    return {
        hideCustFields: hideCustFields
    };

});
