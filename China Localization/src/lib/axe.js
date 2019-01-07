/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    './commons'
],

function(commons) {

    function hide(options) {
        NS.jQuery(document).ready(function() {
            if (commons.makesureall(options, 'id')) {
                var element = document.getElementById(options.id);
                if (commons.makesure(element)) {
                    element.style.display = 'none';
                }
            }
        });
    }

    function isChecked(options) {
        if (commons.makesureall(options, 'id')) {
            // # is an element ID selector while . is a element class selector
            var element = NS.jQuery('#' + options.id);
            if (commons.makesure(element)) {
                // :checkbox Selector - Selects all elements of type checkbox.
                return element.is(':checked');
            }
        }
        return false;
    }

    function makeBold(value) {
        return commons.makesure(value) ? '<b>' + value + '</b>' : value;
    }

    function align(params) {
        return commons.makesure(params.value) ? '<p align="' + params.align + '">' + params.value + '</p>' : params.value;
    }

    return {
        hide: hide,
        isChecked: isChecked,
        makeBold: makeBold,
        align: align
    };

});
