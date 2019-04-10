/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define(
		[ '../lib/wrapper/ns_wrapper_record',
				'../lib/wrapper/ns_wrapper_search',
				'../lib/wrapper/ns_wrapper_runtime', '../lib/commons',
				'./helper/search_helper', '../lib/wrapper/ns_wrapper_format',
				'../lib/wrapper/ns_wrapper_log',
				'../constant/const_cn_cashflow' ],
		function(record, search, runtime, commons, helper, format, logger,
				constant) {

			var basisType = {
				YoY : constant.YoY,
				MoM : constant.MoM
			};
			/**
			 * @desc fetch all periods.
			 * @return period list.
			 */
			function fetchAllPeriods() {
				return fetchPeriods();
			}
			/**
			 * @desc fetch periods by parameters.
			 * @param {object}
			 *            [params] - parameters.
			 * @return period list.
			 */
			function fetchPeriods(params) {
				// no params, return all
				return query(params);
			}
			/**
			 * @desc fetch latest period by parameters.
			 * @param {object}
			 *            [params] - parameters.
			 * @return {object} - return the current period, if none return
			 *         latest period.
			 */
			function fetchLatestPeriod(params) {
				// return the current period, if none return latest period
				var filter = {
					startdate : {
						value : format.formatDate(new Date()),
						operator : search.Operator.ONORBEFORE
					},
					enddate : {
						value : format.formatDate(new Date()),
						operator : search.Operator.ONORAFTER
					},
					ismonth : 'T'
				};
				if (commons.makesureall(params, 'fiscalcalendar')) {
					filter.fiscalcalendar = params.fiscalcalendar;
				}
				var rs = fetchPeriods(filter);
				if (commons.makesure(rs)) {
					return rs[0].id;
				} else {
					var filter2 = {
						startdate : {
							value : format.formatDate(new Date()),
							operator : search.Operator.ONORBEFORE,
							sort : search.Sort.DESC
						},
						ismonth : 'T'
					};
					if (commons.makesureall(params, 'fiscalcalendar')) {
						filter2.fiscalcalendar = params.fiscalcalendar;
					}
					var rs2 = fetchPeriods(filter2);
					if (commons.makesure(rs2)) {
						return rs2[0].id;
					}

				}

			}
			/**
			 * @desc query period by parameters.
			 * @param {object}
			 *            [params] - parameters.
			 * @return {array} - period list.
			 */
			function query(params) {
				return search.create({
					type : search.Type.ACCOUNTING_PERIOD,
					filters : filters(params),
					columns : columns(params)
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
				var source = commons.isPrimitive(params)
						|| !commons.makecertain(params) ? null : params.source;
				logger.debug('cn_accounting_period_dao.js: params', params,
						source);

				var filters = [ helper.filter('isadjust').is('F') ];
				// no params return all
				if (!commons.makecertain(params))
					return filters;
				if (commons.makesure(params.id))
					filters.push(helper.filter('internalid').is(params.id));

				if (commons.makesure(params.ismonth)) {
					filters.push(helper.filter('isyear').is('F'));
					filters.push(helper.filter('isquarter').is('F'));
				}
				if (commons.ensure(params.isYear)) {
					filters.push(helper.filter('isyear').is('T'));
				}
				if (commons.makesure(params.isinactive)) {
					filters.push(helper.filter('isinactive').is(
							params.isinactive));
				}
				if (commons.makesure(params.enddate)) {
					filters
							.push({
								name : 'enddate',
								operator : commons
										.makesure(params.enddate.operator) ? params.enddate.operator
										: search.Operator.ON,
								values : params.enddate.value
							});
				}
				if (commons.makesure(params.startdate)) {
					filters
							.push({
								name : 'startdate',
								operator : commons
										.makesure(params.startdate.operator) ? params.startdate.operator
										: search.Operator.ON,
								values : params.startdate.value
							});
				}
				if (commons.makesure(params.closed)) {
					filters.push(helper.filter('closed').is(params.closed));
				}
				if (runtime.isMultipleCalendars()
						&& commons.makesure(params.fiscalcalendar)) {
					filters.push(helper.filter('fiscalcalendar').is(
							params.fiscalcalendar));
				}

				logger.debug('cn_accounting_period_dao.js: filters', filters,
						source);
				return filters;
			}
			/**
			 * @desc create columns by parameters.
			 * @param {object}
			 *            [params] - parameters.
			 * @return {array} - column list.
			 */
			function columns(params) {

				var columnList = [ helper.column('periodname').create() ];
				if (commons.makesureall(params, 'startdate', 'sort')) {
					columnList.push(helper.column('startdate').sort(
							params.startdate.sort).create());
				} else {
					columnList.push(helper.column('startdate').sort(
							search.Sort.ASC).create());
				}
				columnList.push(helper.column('isyear').sort(search.Sort.DESC)
						.create());
				columnList.push(helper.column('isquarter').sort(
						search.Sort.DESC).create());
				columnList.push(helper.column('enddate').create());

				return columnList;
			}
			/**
			 * @desc fetch all periods as drop down.
			 * @return {array} - period list.
			 */
			function fetchAllPeriodsAsDropDown() {
				return fetchPeriodsAsDropDown();
			}
			/**
			 * @desc fetch periods as drop down by parameters.
			 * @param {object}
			 *            [params] - parameters.
			 * @return {array} - period list.
			 */
			function fetchPeriodsAsDropDown(params) {
				log.debug(
						'cn_accounting_period_dao.js: fetchPeriodsAsDropDown',
						params);

				var results = fetchPeriods(params);
				if (!commons.makesure(results)) {
					return;
				}

				var options = [];
				for ( var i in results) {
					var leadingSpaces = '';
					if (results[i].getValue('isyear')) {
						// Do nothing
					} else if (results[i].getValue('isquarter')) {
						leadingSpaces = '&nbsp;&nbsp;&nbsp;';
					} else {// isMonth
						leadingSpaces = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
					}

					options[i] = {
						value : results[i].id,
						text : leadingSpaces
								+ results[i].getValue('periodname')
					};
				}
				return options;
			}
			/**
			 * @desc get date range by parameters.
			 * @param {object}
			 *            [params] - parameters.
			 * @return {object} - date range with startdate and enddate.
			 */
			function getDateRange(params) {
				var id = commons.isPrimitive(params) ? params : params.id;
				var periodRec = record.load({
					type : record.Type.ACCOUNTING_PERIOD,
					id : id
				});

				if (commons.makesure(periodRec)) {
					var startdate = format.parseDate(periodRec
							.getText('startdate'));
					var enddate = format
							.parseDate(periodRec.getText('enddate'));
					if (params.basis === basisType.YoY) {
						startdate.setYear(startdate.getFullYear() - 1);
						enddate.setYear(enddate.getFullYear() - 1);
					} else if (params.basis === basisType.MoM) {
						if (periodRec.getValue('isyear')) {
							startdate.setYear(startdate.getFullYear() - 1);
							enddate.setYear(enddate.getFullYear() - 1);
						} else if (periodRec.getValue('isquarter')) {
							startdate.setMonth(startdate.getMonth() - 3);
							enddate.setMonth(enddate.getMonth() - 2);
							enddate.setDate(0);
						} else {
							startdate.setMonth(startdate.getMonth() - 1);
							enddate.setDate(0);
						}
					}
					return {
						startdate : format.formatDate(startdate),
						enddate : format.formatDate(enddate)
					}
				}
			}

			/**
			 * @desc get period id of time by parameters.
			 * @param {object}
			 *            [params] - parameters.
			 * @return {number} - period id.
			 */
			function getPeriodIdOnBasis(params) {
				var dateRange = getDateRange(params);
				var periodParams = {
					startdate : {
						value : dateRange.startdate
					},
					enddate : {
						value : dateRange.enddate
					}
				}

				if (commons.makesure(params.fiscalcalendar)) {
					periodParams.fiscalcalendar = params.fiscalcalendar;
				}

				if (commons.makesure(params.source)) {
					periodParams.source = params.source;
				}

				var periodLastFiscalendar = fetchPeriods(periodParams);
				if (commons.makesure(periodLastFiscalendar)) {
					return periodLastFiscalendar[0].id;
				}
			}

			return {
				fetchAllPeriods : fetchAllPeriods,
				fetchAllPeriodsAsDropDown : fetchAllPeriodsAsDropDown,
				fetchPeriodsAsDropDown : fetchPeriodsAsDropDown,
				getDateRange : getDateRange,
				fetchLatestPeriod : fetchLatestPeriod,
				getPeriodIdOnBasis : getPeriodIdOnBasis,
				fetchPeriods : fetchPeriods,
				basisType : basisType
			};

		});
