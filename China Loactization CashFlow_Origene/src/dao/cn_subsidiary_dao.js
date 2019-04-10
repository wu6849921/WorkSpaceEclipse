/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define(
		[ '../lib/wrapper/ns_wrapper_search',
				'../lib/wrapper/ns_wrapper_runtime', './helper/search_helper',
				'../lib/wrapper/ns_wrapper_record', '../lib/commons' ],
		function(search, runtime, helper, record, commons) {
			/**
			 * @desc fetch all subsidiaries.
			 * @return all subsidiaries.
			 */
			function fetchAllSubsidiaries() {
				return fetchSubsidiaries();
			}
			/**
			 * @desc fetch subsidiaries by parameters.
			 * @param {object}
			 *            [params] - parameters.
			 * @return subsidiary list.
			 */
			function fetchSubsidiaries(params) {
				return search.create({
					type : search.Type.SUBSIDIARY,
					columns : columns(),
					filters : filters(params)
				}).run().getRange({
					start : 0,
					end : 1000
				}) || [];
			}
			/**
			 * @desc create filters by parameters.
			 * @param {object}
			 *            [params] - parameters.
			 * @return {array} - filters.
			 */
			function filters(params) {
				var filters = [ helper.filter('isinactive').is('F') ];
				if (!commons.makesure(params)) {
					return filters;
				}
				if (commons.isPrimitive(params)) {
					filters.push(helper.filter('internalid').is(params));
				} else if (commons.makesure(params.id)) {
					filters.push(helper.filter('internalid').is(params.id));
				}
				return filters;
			}
			/**
			 * @desc create columns by parameters.
			 * @param {object}
			 *            [params]- parameters.
			 * @return {array} - column list.
			 */
			function columns() {
				var columns = [ helper.column('name').create(),
						helper.column('namenohierarchy').create() ];
				if (runtime.isMultipleCalendars()) {
					columns.push(helper.column('fiscalcalendar').create());
				}
				return columns;
			}

			/**
			 * @desc get fiscalcalendar by subsidiary id.
			 * @param {number}
			 *            [subsidiaryId] - subsidiary id.
			 * @return fiscalcalendar value.
			 */
			function getFiscalCalendar(subsidiaryId) {
				var subsidiaries = fetchSubsidiaries(subsidiaryId);
				if (commons.makesure(subsidiaries)) {
					var fiscalcalendar = subsidiaries[0]
							.getValue('fiscalcalendar');
					log.debug('cn_subsidiary_dao.js: fiscal calendar',
							fiscalcalendar);
					return fiscalcalendar;
				}
			}
			/**
			 * @desc fetch subsidiaries as drop down.
			 * @return subsidiary list.
			 */
			function fetchAllSubsidiariesAsDropdown() {
				var results = fetchAllSubsidiaries();

				var options = [];
				for ( var i in results) {
					var name = results[i].getValue('name');
					var count = name.match(/ : /g) == null ? 0 : name
							.match(/ : /g).length;
					for (var leadingSpaces = '', j = 0; j < count; ++j) {
						leadingSpaces += '&nbsp;&nbsp;&nbsp;';
					}

					options[i] = {
						value : results[i].id,
						text : leadingSpaces
								+ results[i].getValue('namenohierarchy')
					};
				}

				return options;
			}

			/**
			 * @desc fetch all China subsidiaries.
			 * @return subsidiary list.
			 */
			function fetchAllChinaSubsidiaries() {
				if (!runtime.isOW()) {
					return null;
				}
				var subsidiarySearch = search.create({
					type : search.Type.SUBSIDIARY,
					columns : [ 'namenohierarchy' ],
					filters : [ [ 'isinactive', 'is', 'F' ], 'and',
							[ 'country', 'is', 'CN' ] ]
				});
				var result = [];
				subsidiarySearch
						.run()
						.each(
								function(searchResult) {
									var id = searchResult.id;
									var name = searchResult
											.getValue('namenohierarchy');
									try {
										record.load({
											type : record.Type.SUBSIDIARY,
											id : id
										});
										result.push({
											id : id,
											name : name
										});
									} catch (ex) {
										log
												.error('cn_subsidiary_dao.js: fetchAllChinaSubsidiaries');
									}
									return true;
								});
				return result;
			}

			/**
			 * @desc fetch subsidiaries under the current login user's role
			 * @return subsidiary list.
			 */
			function fetchSubsidiariesOfCurrentRole() {
				var originresults = fetchAllSubsidiaries();
				var results = [];
				for ( var subIdx in originresults) {
					try {
						record.load({
							type : record.Type.SUBSIDIARY,
							id : originresults[subIdx].id
						});
						results.push(originresults[subIdx]);
					} catch (ex) {
						// means current login user doesn't under this
						// subsidiary
						continue;
					}
				}
				var options = [];
				for ( var i in results) {
					options[i] = reviseOptionsOfSubsidiaries(results[i]);
				}
				return options;

			}

			/**
			 * @desc add &nbsp in front of the subsidiaries in order to display
			 *       in hierarchy structure
			 * @return option list.
			 */
			function reviseOptionsOfSubsidiaries(result) {
				var name = result.getValue('name');
				var count = name.match(/ : /g) == null ? 0
						: name.match(/ : /g).length;
				for (var leadingSpaces = '', j = 0; j < count; ++j) {
					leadingSpaces += '&nbsp;&nbsp;&nbsp;';
				}

				var option = {
					value : result.id,
					text : leadingSpaces + result.getValue('namenohierarchy'),
					name : result.getValue('name')
				};
				return option;
			}

			/**
			 * fetch dropdown options subsidiaries with consolidated option
			 * 
			 * @param the
			 *            consolidated label should be append to original
			 *            subsidary name
			 * @return Array of options. Consolidated option format is like
			 *         {value: "["-1", "1", "2", "3"]", text: "Parent Company
			 *         (Consolidated)"}
			 */
			function fetchSubsidiariesWithConsolidatedOfCurrentRoleAsDropdown(
					consolidatedLabel) {
				return fetchSubsidiariesOfCurrentRole().reduce(
						function(results, option, i, allOptions) {
							return results.concat(
									consolidatedOption(allOptions, option,
											consolidatedLabel)).concat(option);
						}, []);
			}

			function consolidatedOption(allOptions, option, consolidatedLabel) {
				if (!hasChildren(allOptions, option)) {
					return [];
				}
				var option = {
					value : constructConsolidatedIdArray(allOptions, option),
					text : option.text + ' ' + consolidatedLabel
				};
				log
						.debug(
								'cn_subsidiary_dao:fetchSubsidiariesWithConsolidatedOfCurrentRoleAsDropdown',
								'consolidated option: '
										+ JSON.stringify(option));
				return option;
			}

			/**
			 * generate option value for consolidated subsidiary match among
			 * names with hierarchy to find all children
			 * 
			 * @return String of consolidated id array. [0] is consolidated id
			 *         with negative value, [1] is id [>1] are all children ids
			 */
			function constructConsolidatedIdArray(allOptions, parent) {
				var results = [ '-' + parent.value, parent.value ];
				allOptions.filter(isChildOf(parent)).forEach(function(row) {
					results.push(row.value);
				});
				return JSON.stringify(results);
			}

			function hasChildren(allOptions, parent) {
				return allOptions.some(isChildOf(parent));
			}

			function isChildOf(parent) {
				return function(row) {
					return row.name.indexOf(parent.name + ' : ') === 0;
				}
			}

			return {
				fetchAllSubsidiaries : fetchAllSubsidiaries,
				fetchSubsidiaries : fetchSubsidiaries,
				getFiscalCalendar : getFiscalCalendar,
				fetchAllSubsidiariesAsDropdown : fetchAllSubsidiariesAsDropdown,
				fetchAllChinaSubsidiaries : fetchAllChinaSubsidiaries,
				fetchSubsidiariesOfCurrentRole : fetchSubsidiariesOfCurrentRole,
				fetchSubsidiariesWithConsolidatedOfCurrentRoleAsDropdown : fetchSubsidiariesWithConsolidatedOfCurrentRoleAsDropdown
			};

		});
