/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define(
		[ './app_cn_cashflow_template', '../../lib/wrapper/ns_wrapper_render',
				'../../res/cashflow/cashflowresource',
				'./app_cn_cashflow_form', '../../lib/commons',
				'../../lib/wrapper/ns_wrapper_format',
				'../../lib/wrapper/ns_wrapper_runtime',
				'./app_cn_cashflow_data', '../../dao/cn_accounting_period_dao',
				'../../lib/wrapper/ns_wrapper_log',
				'../../lib/wrapper/ns_wrapper_config',
				'../../dao/cn_currency_dao', ],

		function(templatemanager, render, resource, forms, commons, format,
				runtime, data, periodDao, logger, config, currencyDao) {

			/**
			 * @desc create pdf report.
			 * @param {Object}
			 *            [reportDivStr] - cash flow report string value.
			 * @return pdf report file content.
			 */
			function handleAsPDF(reportDivStr) {
				var templateContent = templatemanager
						.getCashFlowInlinePDFTemplate();
				var divStr = reportDivStr == null ? "invalid pdf file generated"
						: reportDivStr.replace(/"([^"]*)"/g, "'$1'").replace(
								/\n/g, "");
				render.addCustomDataSource('divValue', render.DataSource.JSON,
						'{"value":"' + divStr + '"}');
				render.setTemplateContents(templateContent);
				var pdfFile;
				try {
					pdfFile = render.renderAsPdf();
				} catch (ex) {
					log.error('app_cn_cashflow_handler',
							'Export PDF failed with message ' + ex.message
									+ '; input is ' + reportDivStr);
					render.addCustomDataSource('divValue',
							render.DataSource.JSON,
							'{"value":"invalid pdf file generated"}');
					pdfFile = render.renderAsPdf();
				}
				return pdfFile.getContents();
			}

			function handleAsPage(filter) {
				if (commons.makesure(filter)) {
					if (!filter.reset) {
						getRepData(filter);
						render.setTemplateContents(templatemanager
								.getCashFlowInlineTemplate());
						var templateLabel = resource.load(resource.Name.Labels);
						render.addCustomDataSource('templateLabel',
								render.DataSource.OBJECT, templateLabel);
						var item = [];
						for ( var attr in templateLabel.data) {
							item.push(templateLabel.data[attr]);
						}
						var items = {
							desc : item
						};
						log.debug('cash flow handler: items', items);
						render.addCustomDataSource('lineItems',
								render.DataSource.OBJECT, items);

						if (!runtime.isOW()) {
							filter.subsidiaryName = config.getCompanyName();
						} else {
							// Trim the whitespace for child subsidiary
							filter.subsidiaryName = filter.subsidiaryName
									.trim();
						}
						filter.locationName = commons
								.makesure(filter.locationName) ? filter.locationName
								.trim()
								: '';
						filter.departmentName = commons
								.makesure(filter.departmentName) ? filter.departmentName
								.trim()
								: '';
						filter.className = commons.makesure(filter.className) ? filter.className
								.trim()
								: '';
						render.addCustomDataSource('data',
								render.DataSource.OBJECT, filter);
						log.debug('cash flow handler: data', filter);
						forms.setTemplateContents(render.renderAsString());
					}
					forms.setUserData(filter);
				}
				return forms.renderAsPage();
			}

			function getRepData(filter) {
				var periodFrom = filter.period.from;
				var periodTo = filter.period.to;
				// get current period's cash flow report data
				var repDataCurrent = data.getRepData(filter);
				filter.repDataCurrent = repDataCurrent;

				filter.period.from = periodDao.getPeriodIdOnBasis({
					id : filter.period.from,
					source : logger.sourceType.server,
					basis : periodDao.basisType.YoY
				});
				filter.period.to = periodDao.getPeriodIdOnBasis({
					id : filter.period.to,
					source : logger.sourceType.server,
					basis : periodDao.basisType.YoY
				});

				// get prior period's cash flow report data
				var repDataPrior = data.getRepData(filter);
				filter.repDataPrior = repDataPrior;
				filter.period.from = periodFrom;
				filter.period.to = periodTo;
				filter.currencyCode = getReportCurrency(filter.subsidiary);
			}

			/**
			 * @desc get cashflow report currency according to runtime
			 *       environment.
			 * @param subsidiararyId -
			 *            subsidirary id.
			 * @return currency code.
			 */
			function getReportCurrency(subsidiraryId) {
				var currencyId;
				var currencyCode;
				if (!runtime.isOW()) {
					var companyCurrencyId = config.getCompanyCurrency();
					if (commons.makesure(companyCurrencyId)) {
						currencyCode = currencyDao
								.fetchCurrencyCode(currencyId);
					} else {
						currencyCode = "CNY";
					}
				} else {// One World
					if (runtime.isFeatureInEffect('MULTICURRENCY')) {
						var subsidiary = subsidiraryId;
						currencyId = currencyDao.fetchCurrencyId(subsidiary);
						currencyCode = currencyDao
								.fetchCurrencyCode(currencyId);
					} else {
						currencyCode = "CNY";
					}
				}
				return currencyCode;
			}

			return {
				handleAsPDF : handleAsPDF,
				handleAsPage : handleAsPage
			};

		});
