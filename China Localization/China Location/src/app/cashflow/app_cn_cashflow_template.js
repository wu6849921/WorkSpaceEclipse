/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../lib/wrapper/ns_wrapper_search'
],
/**
 * @param {search} search
 */
function(search) {


    function getCashFlowInlineTemplate() {
        //inline batch template
        var templateContent = getTemplate('China Cash Flow Inline');
        return templateContent;
    }

    function getCashFlowInlinePDFTemplate() {
        //inline pdf batch template
        var templateContent = getTemplate('China Cash Flow Inline PDF');
        return templateContent;
    }
    
    function getTemplate(templateName) {
        var templateSearch = search.create({
            type: 'customrecord_cn_cashflow_templates',
            filters: [
                search.createFilter({
                    name: 'name',
                    operator: search.Operator.IS,
                    values: templateName
                })
            ],
            columns: [
                search.createColumn({
                    name: 'custrecord_cn_cashflow_template_content'
                })
            ],
        });

        var templateResult = templateSearch.run().getRange({
            start: 0,
            end: 1
        }) || [];

        var line = templateResult[0];
        var templateContent = line.getValue("custrecord_cn_cashflow_template_content");
        log.debug("Template", templateContent);

        return templateContent;
    }
    return {
        getCashFlowInlineTemplate: getCashFlowInlineTemplate,
        getCashFlowInlinePDFTemplate:getCashFlowInlinePDFTemplate
    };
});
