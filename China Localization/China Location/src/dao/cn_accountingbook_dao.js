/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../lib/wrapper/ns_wrapper_search',
    './helper/search_helper',
    '../lib/commons'
],

function(search, helper, commons) {
	/**
	 * @desc fecth accounting books.
	 * @return {array} - accounting book list.
	 */
    function fetchAccountingBook() {

        var primaryColumns = [
            helper.column('isprimary').create(),
            helper.column('name').create(),
            helper.column('internalid').create()
        ];
        var tempResults = search.create({
            type: search.Type.ACCOUNTING_BOOK,
            columns: primaryColumns
        }).run().getRange({
            start: 0,
            end: 1000
        }) || [];

        return tempResults;
    }
    /**
     * @desc fetch subsidiaries by book id.
     * @param {number} [bookId] - book id.
     * @return {array} - subsidiary list.
     */
    function fetchSubsidiaries(bookId) {
        if (!commons.makesure(bookId)) {
            return null;
        }
        return search.create({
            type: search.Type.ACCOUNTING_BOOK,
            columns: columns(),
            filters: filters(bookId)
        }).run().getRange({
            start: 0,
            end: 1000
        }) || [];
    }
    /**
     * @desc create filters by book id.
     * @param {number} [bookId] - book id.
     * @return {array} - filters.
     */
    function filters(bookId) {
        var filters = [
            helper.filter('internalid').is(bookId)
        ];
        return filters;
    }
    /**
     * @desc create columns.
     * @return {array} - column list.
     */
    function columns() {
        var columns = [
            helper.column('subsidiary').create(),
            helper.column('subsidiarynohierarchy').create()
        ];
        return columns;
    }


    return {
        fetchSubsidiaries: fetchSubsidiaries,
        fetchAccountingBook: fetchAccountingBook

    };

});
