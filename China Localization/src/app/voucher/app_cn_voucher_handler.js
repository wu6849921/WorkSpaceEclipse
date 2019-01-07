/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../dao/cn_voucher_dao',
    './app_cn_voucher_template_manager',
    '../../lib/wrapper/ns_wrapper_render',
    '../../res/voucherresource',
    './app_cn_voucher_forms',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_runtime',
    './app_cn_voucher_task',
    '../../constant/constant_cn_voucher',
],

function(voucherDAO, templateManager, render, resource, forms, commons, format, runtime, task, constants) {

    function handleAsHTML(filter) {
        handleAsFM(filter);
        return '<html><body>' + render.renderAsString() + '</body></html>';
    }

    function handleAsOnlinePDF(filter) {
        if (commons.makesure(filter)) {
            return generatePDFFile(filter);
        }
    }

    function generatePDFFile(filter) {
        handleAsFM(filter);

        // Check Render Start Time
        var renderStartTime = runtime.clock();
        log.audit('start rendering PDF...', renderStartTime);

        var pdf = render.renderAsPdf();
        pdf.name = format.formatFileName({
            prefix: resource.load(resource.Name.File).Accounting_Voucher + '_',
            suffix: '.pdf'
        });

        // Check Render End Time
        var renderEndTime = runtime.clock();
        log.audit('Time spent (ms) on Rendering PDF', renderEndTime - renderStartTime);

        return pdf;
    }

    function handleAsFM(filter) {

        if (commons.makesure(filter)) {
            if (filter.template === constants.SINGLE_CURRENCY) {
                render.setTemplateContents(templateManager.getSingleCurrencyVoucherTemplate());
            } else {
                render.setTemplateContents(templateManager.getVoucherTemplate());
            }
            log.debug('handleAsFM vouchers: ', voucherDAO.fetchVoucher(filter));
            render.addCustomDataSource('data', render.DataSource.OBJECT, {
                vouchers: voucherDAO.fetchVoucher(filter)
            });
            render.addCustomDataSource('templateLabel', render.DataSource.OBJECT, resource.load(resource.Name.Labels));
        }
    }

    function handleAsPage(filter) {
        if (commons.makesure(filter)) {
            if (!filter.reset) {
                if (filter.template === constants.SINGLE_CURRENCY) {
                    render.setTemplateContents(templateManager.getSingleCurrencyVoucherInlineTemplate());
                } else {
                    render.setTemplateContents(templateManager.getVoucherInlineTemplate());
                }
                log.debug('handleAsPage vouchers filter: ', filter);

                log.debug('handleAsPage vouchers: ', voucherDAO.fetchVoucher(filter));

                render.addCustomDataSource('data', render.DataSource.OBJECT, {
                    vouchers: voucherDAO.fetchVoucher(filter)
                });
                render.addCustomDataSource('templateLabel', render.DataSource.OBJECT, resource.load(resource.Name.Labels));
                forms.setTemplateContents(render.renderAsString());
            }
            forms.setUserData(filter);
        }
        return forms.renderAsPage();
    }

    function handleAsScheduledTask(filter) {
        if (commons.makesure(filter)) {
            task.createAndSubmitTask(filter);
        }
    }

    return {
        handleAsHTML: handleAsHTML,
        generatePDFFile: generatePDFFile,
        handleAsPage: handleAsPage,
        handleAsOnlinePDF: handleAsOnlinePDF,
        handleAsScheduledTask: handleAsScheduledTask
    };

});
