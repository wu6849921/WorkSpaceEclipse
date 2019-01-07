/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_search'
],

function(search) {

    /**
     * @desc get balance sheet template by template name.
     * @param {string} [templateName] - template name.
     * @return {string} - template content.
     */
    function getTemplate(templateName) {
        var templateSearch = search.create({
            type: 'customrecord_cn_blsheet_templates',
            filters: [
                search.createFilter({
                    name: 'name',
                    operator: search.Operator.IS,
                    values: templateName
                })
            ],
            columns: [
                search.createColumn({
                    name: 'custrecord_cn_template_content'
                })
            ],
        });

        var templateResult = templateSearch.run().getRange({
            start: 0,
            end: 1
        }) || [];

        var templateContent = "";
        //because there is only one record saved, so if we choose [0], it must be the template.
        //but if there are two more templates, we need to add the logic
        if (templateResult.length > 0) {
            var line = templateResult[0];
            templateContent = line.getValue("custrecord_cn_template_content");
        }
        return templateContent;
    }

    return {
        getBLSheetTemplate: getTemplate
    };
});
