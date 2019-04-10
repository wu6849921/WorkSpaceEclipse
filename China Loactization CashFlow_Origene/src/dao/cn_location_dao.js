/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define(
		[ '../lib/wrapper/ns_wrapper_search', '../lib/commons',
				'./helper/search_helper', '../lib/wrapper/ns_wrapper_runtime' ],
		function(search, commons, helper, runtime) {
			/**
			 * @desc fetch locations by parameters.
			 * @param {object}
			 *            [params]- parameters.
			 * @return location list.
			 */
			function fetchLocations(params) {
				// no params, return all
				var rs = query(params);
				if (commons.makesure(rs)) {
					return rs;
				}

			}
			/**
			 * @desc query location by parameters.
			 * @param {object}
			 *            [params]- parameters.
			 * @return {array} - location list.
			 */
			function query(params) {
				return search.create({
					type : search.Type.LOCATION,
					filters : filters(params),
					columns : columns(params)
				}).run().getRange({
					start : 0,
					end : 1000
				}) || [];

			}
			/**
			 * @desc create filter by parameters.
			 * @param {object}
			 *            [params]- parameters.
			 * @return {array} - filter list.
			 */
			function filters(params) {

				var filters = [

				];
				// no params return all
				if (!commons.makecertain(params)) {
					return filters;
				}

				if (runtime.isOW() && commons.ensure(params.subsidiary)) {
					filters.push(helper.filter('subsidiary').is(
							JSON.parse(params.subsidiary)));
				}
				return filters;

			}
			/**
			 * @desc create columns by parameters.
			 * @param {object}
			 *            [params]- parameters.
			 * @return {array} - column list.
			 */
			function columns(params) {

				var column = [ helper.column('internalid').create(),
						helper.column('name').create(),
						helper.column('namenohierarchy').create() ];

				return column;
			}
			/**
			 * @desc fetch locations as drop down by parameters.
			 * @param {object}
			 *            [params] - parameters.
			 * @return {array} - period list.
			 */
			function fetchLocationsAsDropDown(params) {
				log.debug('cn_location_dao.js: fetchLocationsAsDropDown',
						'params' + JSON.stringify(params));

				var results = fetchLocations(params);
				if (!commons.makesure(results)) {
					return [];
				}
				var options = [];
				for ( var i in results) {
					var count = results[i].getValue('name').match(/ : /g) == null ? 0
							: results[i].getValue('name').match(/ : /g).length;
					for (var leadingSpaces = '', j = 0; j < count; ++j) {
						leadingSpaces += '&nbsp;&nbsp;&nbsp;';
					}
					options[i] = {
						value : results[i].id,
						text : leadingSpaces
								+ results[i].getValue('namenohierarchy')
					};
				}
				return commons.dedup(options, function(mapEntry) {
					return mapEntry.value;
				});
			}

			return {
				fetchLocations : fetchLocations,
				fetchLocationsAsDropDown : fetchLocationsAsDropDown
			};

		});
