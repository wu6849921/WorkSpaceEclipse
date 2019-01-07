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

    function getVoucherTemplate() {
        //single print and PDF print template
        var templateContent = getTemplate('China Voucher Print');
        return templateContent;
    }


    function getVoucherInlineTemplate() {
        //inline batch template
        var templateContent = getTemplate('China Voucher Inline Print');
        return templateContent;
    }

    function getSingleCurrencyVoucherTemplate() {
        //single print and PDF SingleCurrency print template
        var templateContent = getTemplate('China Voucher Print Single Currency');
        return templateContent;
    }


    function getSingleCurrencyVoucherInlineTemplate() {
        //inline batch SingleCurrency template
        var templateContent = getTemplate('China Voucher Inline Print Single Currency');
        return templateContent;
    }
    
    function getTemplate(templateName) {
        var templateSearch = search.create({
            type: 'customrecord_cn_voucher_templates',
            filters: [
                search.createFilter({
                    name: 'name',
                    operator: search.Operator.IS,
                    values: templateName
                })
            ],
            columns: [
                search.createColumn({
                    name: 'custrecord_cn_voucher_template_content'
                })
            ],
        });

        var templateResult = templateSearch.run().getRange({
            start: 0,
            end: 1
        }) || [];

        var line = templateResult[0];
        var templateContent = line.getValue("custrecord_cn_voucher_template_content");
        log.debug("Template", templateContent);

        return templateContent;
    }


    return {
        getVoucherTemplate: getVoucherTemplate,
        getVoucherInlineTemplate: getVoucherInlineTemplate,
        getSingleCurrencyVoucherTemplate: getSingleCurrencyVoucherTemplate,
        getSingleCurrencyVoucherInlineTemplate: getSingleCurrencyVoucherInlineTemplate
        
    };
});
