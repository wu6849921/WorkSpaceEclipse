/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    '../lib/wrapper/ns_wrapper_file',
    '../lib/commons',
    '../lib/wrapper/ns_wrapper_error'
],

function(file, commons, error) {

    function load(fileName) {
        if (!commons.makesure(fileName)) {
            throw error.create({
                name: 'LoadTemplateError',
                message: 'template file name is undefined',
                notifyOff: true
            });
        }
        return file.load({
            path: 'src/templates/' + fileName
        }).getContents();
    }

    return {
        load: load
    };

});
