/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_search'
],

function(search) {

    function getTemplate(templateName) {
        var templateSearch = search.create({
            type: 'customrecord_cn_vat_templates',
            filters: [
                search.createFilter({
                    name: 'name',
                    operator: search.Operator.IS,
                    values: templateName
                })
            ],
            columns: [
                search.createColumn({
                    name: 'custrecord_cn_vat_template_content'
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
        for ( var i in templateResult) {
            var line = templateResult[i];
            templateContent = line.getValue("custrecord_cn_vat_template_content");
        }
        return templateContent;
    }

    return {
        getTemplate: getTemplate
    };
});
