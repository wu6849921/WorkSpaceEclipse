/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/commons'
],

function(search, commons) {
    /**
     * @desc get report id by report name,cann't support fuzzy search.
     * @param {string} [reportname] - report name.
     * @return report id.
     * */
    function getReportId(reportname) {
        var reportId = null;

        if (!commons.makesure(reportname)) {
            return null;
        }
        var searchResult = search.global({
            keywords: 'page:' + reportname
        });
        log.debug('cn_savedreports_dao.js: getReportId', 'Global search: searchResult is ' + JSON.stringify(searchResult));

        reportname = reportname.toLowerCase().trim();
        for (var i = 0; searchResult && i < searchResult.length; i++) {
            var name = searchResult[i].getValue({
                name: 'name'
            }).toLowerCase().trim();

            if (searchResult[i].id.indexOf('REPO_') !== -1 && name === reportname) {
                reportId = searchResult[i].id.replace(/REPO_/, '');
                break;
            }
        }
        return reportId;
    }

    return {
        getReportId: getReportId
    };

});
