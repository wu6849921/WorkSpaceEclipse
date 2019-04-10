/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define(
		[ '../../app/balance_sheet/app_cn_blsheet_subsidiary',
				'../../dao/cn_blsheet_acc_period_dao',
				'../../lib/wrapper/ns_wrapper_runtime', '../../lib/commons',
				'../../lib/wrapper/ns_wrapper_format',
				'../../dao/cn_accounting_period_dao'

		],
		function(subsidiaryDao, balance_sheet_periodDao, runtime, commons,
				format, periodDao) {

			/**
			 * @desc initialize period.
			 * @param {object}
			 *            [field] - period field.
			 * @param {number}
			 *            [defaultPeriodId] -period id.
			 * @param {number}
			 *            [subsidiaryId] - subsidiary id.
			 * @param {bool}
			 *            [calendarEnable] - calendar enable or not.
			 * @param {bool}
			 *            [isCreate] - initialize period from suitelet or not.
			 * @return {object} - selected period.
			 */
			function initPeriod(field, defaultPeriodId, rs, subsidiaryId,
					isCreate) {
				if (!isCreate) {
					removeAllSelectOption(field);
				}
				if (rs === null || rs === undefined || rs.length === 0)
					return null;
				var selectedPeriod = {};
				var id;
				var periodName;
				var isyear;
				var isquarter;
				var startDate;
				var endDate;
				for ( var i in rs) {
					id = rs[i].id;
					periodName = rs[i].getValue('periodname');
					isyear = rs[i].getValue('isyear');
					isquarter = rs[i].getValue('isquarter');
					startDate = rs[i].getValue('startdate');
					endDate = rs[i].getValue('enddate');

					var leadingSpaces = '';
					if (isyear) {

					} else if (isquarter) {
						leadingSpaces = '&nbsp;&nbsp;&nbsp;';
					} else {// isMonth
						leadingSpaces = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
					}
					var isSelected = commons.makesure(defaultPeriodId) ? id === defaultPeriodId
							: isCurrentMonth(startDate, endDate);
					if (isSelected) {
						selectedPeriod.id = id;
						selectedPeriod.endDate = endDate;
					}
					if (isCreate) {
						field.addSelectOption({
							text : leadingSpaces + periodName,
							value : id,
							isSelected : isSelected
						});
					} else {
						field.insertSelectOption({
							text : leadingSpaces + periodName,
							value : id
						});
					}

				}

				return selectedPeriod;
			}
			/**
			 * @desc remove all select option.
			 * @param {object}
			 *            [field] - select field.
			 */
			function removeAllSelectOption(field) {
				field.removeSelectOption({
					value : null
				});

			}
			/**
			 * @desc get calendarId by subsidiary id.
			 * @param {number}
			 *            [subsidiaryId] - subsidiary id.
			 * @param {bool}
			 *            [calendarEnable] - calendar enable or not.
			 * @return {number} calendar id.
			 */
			function fetchCalendarIdBySubsidiary(subsidiaryId, calendarEnable) {
				var subsidiaryResults = subsidiaryDao.fetchAllSubsidiaries({
					id : subsidiaryId,
					calendarEnable : calendarEnable
				});
				var calendarId;
				for ( var i in subsidiaryResults) {
					var line = subsidiaryResults[i];
					calendarId = line.getValue("fiscalcalendar");
					break;
				}
				return calendarId;
			}

			/**
			 * @desc get period by subsidiary id.
			 * @param {number}
			 *            [subsidiaryId] - subsidiary id.
			 * @param {bool}
			 *            [calendarEnable] - calendar enable or not.
			 * @return {number} calendar id.
			 */
			function fetchPeriodByCalendarId(calendarId, calendarEnable) {
				if (calendarEnable) {
					var periods = balance_sheet_periodDao
							.fetchAllPeriodsforLOV(calendarId);
				} else {
					periods = balance_sheet_periodDao.fetchAllPeriodsforLOV();
				}
				return periods;
			}

			/**
			 * @desc check if 2 dates are in the same month.
			 * @param {date}
			 *            [startDate] - start date.
			 * @param {date}
			 *            [endDate] - end date.
			 * @return {bool} start date and end date are in the same month or
			 *         not.
			 */
			function isCurrentMonth(startDate, endDate) {
				var sysDate = new Date();
				var sysYear = sysDate.getFullYear();
				var sysMonth = sysDate.getMonth() + 1;
				var periodStartDate = format.parseDate(startDate);
				var periodYear = periodStartDate.getFullYear();
				var periodStartMonth = periodStartDate.getMonth() + 1;
				var periodEndDate = format.parseDate(endDate);
				var periodEndMonth = periodEndDate.getMonth() + 1;

				return (sysYear === periodYear)
						&& (sysMonth === periodStartMonth)
						&& (sysMonth === periodEndMonth);

			}

			function latestPeriod(fiscalcalendarId, calendarEnable) {
				if (calendarEnable) {
					return periodDao.fetchLatestPeriod({
						fiscalcalendar : fiscalcalendarId
					});
				} else {
					return periodDao.fetchLatestPeriod();
				}
			}

			return {
				initPeriod : initPeriod,
				fetchPeriodByCalendarId : fetchPeriodByCalendarId,
				fetchCalendarIdBySubsidiary : fetchCalendarIdBySubsidiary,
				latestPeriod : latestPeriod
			};

		});
