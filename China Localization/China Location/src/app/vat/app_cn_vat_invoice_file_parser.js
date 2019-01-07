/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../dao/cn_transaction_dao',
    '../../dao/cn_vat_dao',
    './app_cn_vat_file_import_helper',
    './app_cn_vat_label_parser',
    './app_cn_vat_constant_loader',
    './app_cn_vat_status',
    '../../lib/commons'
],

function(txDao, vatDao, helper, resourceBundle, loader, vatStatus, commons) {

    var fieldSeparator = "~~";
    var lineCartridge = "";

    function getInvoiceInstanceFromRawFile(content) {
        var constantObj = loader.load("vat_import_constants.json");
        var resourceObject = resourceBundle.loadResourceFile();
        //		To create a vat data entity
        var contentObject = {
            header: {
                heading: "",
                summary: {}
            },
            successCount: 0,
            failureCount: 0,
            failedInvoices: [],
            exceptionMessage: ""
        };

        //		To determine the line breaker
        lineCartridge = "";

        if (content.indexOf('\r') > 0) {
            lineCartridge += '\r';
        }

        if (content.indexOf('\n') > 0) {
            lineCartridge += '\n';
        }

        //		To split the content into sections
        var contentFragmentArray = content.split(constantObj.lineBreakerRegExp);

        if (contentFragmentArray.length < 2) {//At least, the file must have a header and a body
            contentObject.exceptionMessage = resourceObject.errorMessage.invalidFormat;
            return contentObject;
        } else if (contentFragmentArray.length > 51) {//The number of VAT entries in a file MUST be less than 50.
            contentObject.exceptionMessage = resourceObject.errorMessage.vatNumberExceed;
            return contentObject;
        }

        /*
         * To process header (It should be included in contentFragmentArray[0])
         */
        var isHeadingLineProcessed = false;
        var isSumaryLineProcessed = false;
        var trimmedLine;
        var headerLinesArray = contentFragmentArray[0].trim().split(lineCartridge);

        for ( var i in headerLinesArray) {
            if (!(trimmedLine = headerLinesArray[i].trim())) {
                continue;
            }

            if (!isHeadingLineProcessed) {
                if (trimmedLine.indexOf(/*fileHeader*/constantObj.heading) !== 0) {
                    contentObject.exceptionMessage = resourceObject.errorMessage.invalidFormat;
                } else {
                    isHeadingLineProcessed = true;
                    contentObject.header.heading = trimmedLine;
                    continue;
                }
            }

            /*			
             * Summary Line : In the second line of the flat file, 
             * the information about the scope of exported VAT invoices
             * will be provided as
             * {Total VAT Invoices} ~~ {Invoice Issued Start Date} ~~ {Invoice Issued End Date}��.
            */
            if (!isSumaryLineProcessed) {
                var summaryInfoArray = trimmedLine.split(fieldSeparator);
                if (summaryInfoArray === undefined || summaryInfoArray === null || summaryInfoArray.length !== 3) {
                    //					How to handle this case?
                } else {
                    isSumaryLineProcessed = true;
                    contentObject.header.summary.totalVATInvoices = summaryInfoArray[0];
                    contentObject.header.summary.invoiceStartDate = summaryInfoArray[1];
                    contentObject.header.summary.invoiceEndDate = summaryInfoArray[2];
                }
            }
        }


        //		To validate the result of header process
        if (!(isHeadingLineProcessed)) {//} && isSumaryLineProcessed)){
            //		What if the header is invalid?
            return contentObject;
        }

        /*
         * To process file body(The elements of contentFragmentArray index from 1)
         */
        //		Invoice data line
        var trimmedLineOfBody;
        //		Invoice props:
        var invoiceCategoryCode;
        var vatInvoiceNo;
        var invoiceDate;
        var salesDocNO;
        var taxAmnt;
        var taxExclusiveAmnt;

        //        To get ALL transactions in one run
        var salesDocNums = [];
        var invoiceArray = [];

        for (var i = 1; i < contentFragmentArray.length; i++) {
            if (contentFragmentArray[i] === undefined || contentFragmentArray[i] === null) {
                continue;
            }

            //To remove the comment line like
            trimmedLineOfBody = contentFragmentArray[i].trim();
            var bodyLineArray = trimmedLineOfBody.split(lineCartridge);
            var invoiceDataArray = bodyLineArray[0].split(fieldSeparator);
            //			Validate the number of fields
            if (invoiceDataArray === undefined || invoiceDataArray === null || invoiceDataArray.length < 9) {
                processInvalidVAT(contentObject)
                continue;
            }

            //			Sales Document Number
            salesDocNO = invoiceDataArray[8].trim();
            if (!salesDocNO) {
                //				Illegal Sales Document Number handling...
                processInvalidVAT(contentObject, salesDocNO);
                continue;
            }



            //			Important!
            invoiceCategoryCode = invoiceDataArray[3].trim();
            if (!invoiceCategoryCode) {
                //				Illegal Invoice Category Code handling...
                processInvalidVAT(contentObject, salesDocNO);
                continue;
            }

            //			Important!
            vatInvoiceNo = invoiceDataArray[4].trim();
            if (!vatInvoiceNo) {
                //				Illegal Invoice Category Code handling...
                processInvalidVAT(contentObject, salesDocNO);
                continue;
            }

            //			Important!
            invoiceDate = invoiceDataArray[6].trim();

            if (!invoiceDate) {
                //				Illegal Invoice Date handling...
                processInvalidVAT(contentObject, salesDocNO);
                continue;
            }

            taxAmnt = invoiceDataArray[11];
            if (taxAmnt === null || taxAmnt.trim() === '' || isNaN(taxAmnt)) {
                processInvalidVAT(contentObject, salesDocNO);
                continue;
            }
            taxExclusiveAmnt = invoiceDataArray[9];
            if (taxExclusiveAmnt === null || taxExclusiveAmnt.trim() === '' || isNaN(taxExclusiveAmnt)) {
                log.error("TaxExcl", "enter");
                processInvalidVAT(contentObject, salesDocNO);
                continue;
            }

            var invoiceObj = {
                "invoiceStatus": vatStatus.Status.completed,
                "invoiceCategoryCode": invoiceCategoryCode,
                "vatInvoiceNo": vatInvoiceNo,
                "invoiceDate": invoiceDate,
                "salesDocNO": salesDocNO.split('-')[0],
                "taxAmount": taxAmnt,
                "taxExclusiveAmount": taxExclusiveAmnt
            };

            invoiceArray.push(invoiceObj);
            if (salesDocNums.indexOf(invoiceObj.salesDocNO) < 0) {
                salesDocNums.push(invoiceObj.salesDocNO);
            }
        }

        var newInvoicesObj = processConsolidatedInvoices(invoiceArray, salesDocNums);
        salesDocNums = newInvoicesObj['transactionInternalIds'];
        invoiceArray = newInvoicesObj['invoiceArray'];

        if (salesDocNums.length > 0) {
            //        Refactor point -- Replace the implementation to query transaction by a single id with by id group
            var transactions = txDao.getMainlineByInternalIDs(salesDocNums);

            for (var j = 0; j < invoiceArray.length; j++) {
                //To see if the invoice was imported, or it existing in the system. 
                var result = checkVAT(invoiceArray[j], transactions);
                if (!result.isRecordExisting) {
                    processInvalidVAT(contentObject, invoiceArray[j].salesDocNO, resourceObject.errorMessage.internalIdCannotFound);
                } else if (result.isDuplicated) {
                    processInvalidVAT(contentObject, invoiceArray[j].salesDocNO, resourceObject.errorMessage.sameVatInfo);
                } else {
                    try {
                        //delete exported status
                        if (result.id !== '') {
                            helper.remove([
                                result.id
                            ]);
                        }
                        helper.save(invoiceArray[j]);
                        contentObject.successCount++;
                    } catch (e) {
                        log.debug('app_cn_vat_invoice_file_parser:', JSON.stringify(e));
                        processInvalidVAT(contentObject, invoiceArray[j].salesDocNO, resourceObject.errorMessage.internalIdCannotFound);

                    }
                }
            }

        }

        //		Assemble the message
        var summaryLine = resourceObject.summaryMessage.summaryLine;
        var detail = "";
        for ( var i in contentObject.failedInvoices) {
            detail += contentObject.failedInvoices[i].errorMessage.replace("Internal ID", contentObject.failedInvoices[i].salesDocNO);
        }
        contentObject.exceptionMessage = summaryLine.replace("{NumberA}", contentObject.successCount).replace("{NumberB}", contentObject.failureCount).replace("{DETAILS}", detail);
        return contentObject;
    }

    function processConsolidatedInvoices(invoiceArray, salesDocNums) {
        var rs = {
            'transactionInternalIds': [],
            'invoiceArray': []
        };
        var parentChildTransactionFkMap = getParentChildTransactionFkMap(salesDocNums);

        for (var i = 0; i < invoiceArray.length; i++) {
            var invoice = invoiceArray[i];
            var childrenIds = parentChildTransactionFkMap[invoice.salesDocNO];
            if (commons.makecertain(childrenIds)) {
                rs.transactionInternalIds = rs.transactionInternalIds.concat(childrenIds);
                rs.invoiceArray = rs.invoiceArray.concat(generateChildrenInvoices(invoice, childrenIds));
            } else {
                rs.transactionInternalIds.push(invoice.salesDocNO);
                rs.invoiceArray.push(invoice);
            }
        }

        return rs;
    }

    /**
     * 
     * @param salesDocNums
     * @returns 
     * {'sales doc number from import file':[child transaction internal ids]
     * 
     */
    function getParentChildTransactionFkMap(salesDocNums) {
        var rs = {};
        var parents = vatDao.getVATByRecId(salesDocNums);
        var children = vatDao.getVATByParentId(getIds(parents));
        if (!commons.makesure(parents) || !commons.makesure(children)) {
            return rs;
        }

        var parentIdFkMap = getParentIdFkMap(parents);

        for (var i = 0; i < children.length; i++) {
            var parentFk = parentIdFkMap[children[i].getValue('parent')];
            var childrenFk = children[i].getValue('custrecord_cn_invoice_type_fk_tran');
            rs[parentFk] = rs[parentFk] || [];
            rs[parentFk].push(childrenFk);
        }
        return rs;
    }

    function getParentIdFkMap(parents) {
        var parentIdFkMap = {};

        for (var i = 0; i < parents.length; i++) {
            parentIdFkMap[parents[i].id] = parents[i].getValue('custrecord_cn_invoice_type_fk_tran');
        }
        return parentIdFkMap;
    }


    function getIds(vat) {
        var ids = [];
        if (!commons.makesure(vat)) {
            return ids;
        }
        for (var i = 0; i < vat.length; i++) {
            ids.push(vat[i].id);
        }
        return ids;
    }

    function generateChildrenInvoices(invoice, childrenIds) {
        var rs = [];
        for (var i = 0; i < childrenIds.length; i++) {
            var childInvoice = commons.clone(invoice, true);
            childInvoice.salesDocNO = childrenIds[i];
            rs.push(childInvoice);
        }

        return rs;
    }

    function processInvalidVAT(contentObject, internalId, messageTemplate) {
        if (internalId !== undefined && internalId !== null && messageTemplate) {
            contentObject.failedInvoices.push({
                "salesDocNO": internalId,
                "errorMessage": messageTemplate
            });
        }
        contentObject.failureCount++;
    }

    function checkVAT(vat, transactions) {
        var result = {
            isRecordExisting: false,
            isDuplicated: false,
            id: ''
        };

        if (transactions && transactions.length > 0) {

            var tx;
            for ( var i in transactions) {
                tx = JSON.parse(JSON.stringify(transactions[i]));
                if (tx.id === vat.salesDocNO || (tx.id + '') === vat.salesDocNO) {
                    result.isRecordExisting = true;
                    break;
                }
            }
        }
        var ids = [];
        ids.push(vat.salesDocNO);
        var vats = vatDao.getVATByRecId(ids);
        for ( var v in vats) {
            var line = vats[v];

            if (vatStatus.isExported(line)) {
                // fetch id which status is exported, for remove old status.
                result.id = line.id;
            } else if (vatStatus.isConsolidated(line)) {
                continue;
            }
            if (vat.invoiceCategoryCode === line.getValue("custrecord_cn_vat_invoice_code") && vat.invoiceDate === line.getValue("custrecord_cn_vat_invoice_date") && vat.vatInvoiceNo === line.getValue("custrecord_cn_vat_invoice_number")) {
                result.isDuplicated = true;
                break;
            }
        }

        return result;
    }

    return {
        "getInvoiceInstanceFromRawFile": getInvoiceInstanceFromRawFile
    };


});
