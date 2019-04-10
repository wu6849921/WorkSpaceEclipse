/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define(
		[ 'N/search', './helper/search_helper', './cn_accounting_period_dao',
				'../lib/wrapper/ns_wrapper_runtime', '../lib/commons' ],

		function(search, helper, periodDao, runtime, commons) {

			/**
			 * @desc create cashflow columns.
			 * @return {array} - column list.
			 */
			function columns() {
				var array = [
						helper.column('custrecord_cfs_item').asc().group()
								.create(),
						helper.column('custrecord_cfs_amount').asc().sum()
								.create() ];
				return array;
			}

			/**
			 * @desc create filters.
			 * @param {string} -
			 *            the id of subsidiary.
			 * @param {Object} -
			 *            the date range of the period that calculate begin.
			 * @param {Object} -
			 *            the date range of the period that calculate end.
			 * @return {array} - filters.
			 */
			function filters(subsidiaryId, frdateRange, todateRange,
					locationId, departmentId, classId) {
				var filters = [];

				if (runtime.isOW()) {
					filters.push(helper.filter('custrecord_cfs_subsidiary').is(
							subsidiaryId));
				}

				if (runtime.isLocationEnabled() && commons.makesure(locationId)) {
					filters.push(helper.filter('custrecord_cfs_location').is(
							locationId));
				}
				if (runtime.isDepartmentEnabled()
						&& commons.makesure(departmentId)) {
					filters.push(helper.filter('custrecord_cfs_department').is(
							departmentId));
				}
				if (runtime.isClassesEnabled() && commons.makesure(classId)) {
					filters.push(helper.filter('custrecord_cfs_class').is(
							classId));
				}

				filters.push(helper.filter('custrecord_cfs_trandate')
						.onorafter(frdateRange.startdate));
				filters.push(helper.filter('custrecord_cfs_trandate')
						.onorbefore(todateRange.enddate));
				filters.push(helper.filter('custrecord_mass_cfs_parent')
						.noneof('@NONE@'));

				log.debug('filters', filters);
				return filters;
			}

			/**
			 * @desc fetch the cashflow report data (sum amount group by the
			 *       cashflowitem)
			 * @param {string} -
			 *            the id of subsidiary.
			 * @param {Object} -
			 *            the period of the period that calculate begin.
			 * @param {Object} -
			 *            the period of the period that calculate end.
			 * @return {Object} - resultObj.
			 */
			function fetchCashflowRepData(subsidiaryId, periodfrom, periodto,
					locationId, departmentId, classId) {
				var resultObj = {};
				if ((!commons.makesure(subsidiaryId) && runtime.isOW())
						|| !commons.makesure(periodfrom)
						|| !commons.makesure(periodto)) {
					return {};
				}
				var frdateRange = periodDao.getDateRange(periodfrom);
				var todateRange = periodDao.getDateRange(periodto);
				log.debug('fetchCashflowRepData', 'periodFrom='
						+ JSON.stringify(frdateRange) + ', periodTo='
						+ JSON.stringify(todateRange));
				if (!commons.makesure(frdateRange)
						|| !commons.makesure(todateRange)) {
					return {};
				}
				// if location/departmentId/classId set as blank then the id is
				// hard
				// coded as -1
				locationId = (commons.makesure(locationId) && locationId > 0) ? locationId
						: '';
				departmentId = (commons.makesure(departmentId) && departmentId > 0) ? departmentId
						: '';
				classId = (commons.makesure(classId) && classId > 0) ? classId
						: '';
				var savedSearch = search.create({
					type : 'customrecord_cn_cashflow_record_detail'
				});
				savedSearch.filters = filters(subsidiaryId, frdateRange,
						todateRange, locationId, departmentId, classId);
				savedSearch.columns = columns();
				var resultset = savedSearch.run();
				// resultset.each(function(result) {
				// log.debug('resultsetjoe', 1);
				// return true;
				// })
				var cashflowitemcol = resultset.columns[0];
				var sumamountcol = resultset.columns[1];
				var results = helper.resultset(resultset);

				for (var i = 0; i < results.length; i++) {
					var key = results[i].getValue(cashflowitemcol);
					var val = results[i].getValue(sumamountcol);
					resultObj[key] = val;
				}
				log.debug('fetchCashflowRepData', 'resultObj='
						+ JSON.stringify(resultObj));
				return resultObj;

			}

			return {
				fetchCashflowRepData : fetchCashflowRepData
			};

		});
