/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    './ns_wrapper_error'
],

function(error) {

    var dialog;

    function requireDialog() {
        if (dialog === undefined) {
            dialog = require('N/ui/dialog');
        }
        return dialog;
    }


    function alert(options) {
        var buttonOk = {
            label: error.Message.ConfirmButton,
            value: true
        };
        return requireDialog().create({
            title: options.title,
            message: options.message,
            buttons: [
                buttonOk
            ]
        });


    }

    function confirm(options) {
        var buttonOk = {
            label: error.Message.ConfirmButton,
            value: true
        };

        var buttonCancel = {
            label: error.Message.CancelButton,
            value: false
        };

        return requireDialog().create({
            title: options.title,
            message: options.message,
            buttons: [
                buttonOk,
                buttonCancel
            ]
        });

    }

    function create(options) {
        return requireDialog().create(options);
    }

    return {
        alert: alert,
        confirm: confirm,
        create: create
    };
});
