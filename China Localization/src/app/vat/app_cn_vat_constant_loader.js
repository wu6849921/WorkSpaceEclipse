/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../lib/wrapper/ns_wrapper_file'
],

function(file) {

    function load(filename) {
        var fileContentObj = JSON.parse(file.load({
            path: 'src/res/vat/' + filename
        }).getContents());
        var regExp = RegExp(fileContentObj.lineBreakerRegExp.substring(1,fileContentObj.lineBreakerRegExp.length-1));
        fileContentObj.lineBreakerRegExp = regExp;
        return fileContentObj;
    }

    return {
        "load": load
    }
});
