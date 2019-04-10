/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([ '../lib/wrapper/ns_wrapper_record',
		'../lib/wrapper/ns_wrapper_search', './helper/search_helper',
		'../lib/commons' ], function(record, search, helper, commons) {
	/**
	 * @desc create filters.
	 * @param {object}
	 *            [params] - parameters.
	 * @return {array} - filters.
	 */
	function filters(params) {
		var filters = [ helper.filter('isinactive').is('F') ];

		if (commons.isPrimitive(params)) {
			filters.push(helper.filter('internalid').is(params));
		}
		return filters;
	}

	/**
	 * @desc fetch currency id by parameters.
	 * @param {object}
	 *            [params] - parameters.
	 * @return currency id.
	 */
	function fetchCurrencyId(params) {
		// not include adjust period for lov.
		var currencyId;
		var currencySearch = search.create({
			type : record.Type.SUBSIDIARY,
			filters : filters(params),
			columns : 'currency'
		});
		currencySearch.run().each(function(result) {
			currencyId = result.getValue({
				name : 'currency'
			});
		});
		return currencyId;
	}
	/**
	 * @desc fetch currency code by parameters.
	 * @param {object}
	 *            [params] - parameters.
	 * @return currency code.
	 */
	function fetchCurrencyCode(params) {
		// not include adjust period for lov.
		var currencyCode;
		var currencySearch = search.create({
			type : record.Type.CURRENCY,
			filters : filters(params),
			columns : 'symbol'
		});
		currencySearch.run().each(function(result) {
			currencyCode = result.getValue({
				name : 'symbol'
			});
		});
		return currencyCode;
	}

	function fetchCurrencyById(internalid) {
		var results = helper.resultset(search.create({
			type : record.Type.CURRENCY,
			filters : filters(internalid),
			columns : [ 'symbol', 'name' ]
		}).run());

		if (commons.makesure(results)) {
			return {
				name : results[0].getValue({
					name : 'name'
				}),
				code : results[0].getValue({
					name : 'symbol'
				})
			};
		}
	}

	/**
	 * @desc fetch a object of currency name and code by parameters.
	 * @param {object}
	 *            [params] - parameters.
	 * @return {object} - currencyNamesAndCodes.
	 */
	function fetchCurrencyNamesAndCodes(params) {
		var currencyNamesAndCodes = {};
		var filters = [ helper.filter('isinactive').is('F') ];

		if (commons.isArray(params)) {
			filters.push(helper.filter('internalid').anyof(params));
		}

		var currencySearch = search.create({
			type : record.Type.CURRENCY,
			filters : filters,
			columns : [ 'name', 'symbol' ]
		});

		currencySearch.run().each(function(result) {
			currencyNamesAndCodes[result.getValue({
				name : 'name'
			})] = result.getValue({
				name : 'symbol'
			});
			return true;
		});
		return currencyNamesAndCodes;
	}

	/**
	 * @desc Get currency ISO Code of the specified subsidiary.
	 * @param {Number} -
	 *            subsidiaryId
	 * @return {string} - currency ISO Code
	 */
	function getCurrencyOfSubsidiary(subsidiaryId) {
		if (!commons.ensure(subsidiaryId)) {
			return;
		}
		var currencyId = fetchCurrencyId(subsidiaryId);
		return fetchCurrencyById(currencyId);
	}

	return {
		fetchCurrencyId : fetchCurrencyId,
		fetchCurrencyCode : fetchCurrencyCode,
		fetchCurrencyById : fetchCurrencyById,
		fetchCurrencyNamesAndCodes : fetchCurrencyNamesAndCodes,
		getCurrencyOfSubsidiary : getCurrencyOfSubsidiary
	};
});
