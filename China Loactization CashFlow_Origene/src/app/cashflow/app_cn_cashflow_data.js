/**
 * Copyright 漏 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define(
		[ '../../dao/cn_cashflow_showrep_dao', '../../lib/commons',
				'../../lib/wrapper/ns_wrapper_format',
				'../../dao/cn_cashflow_item_dao',
				'../../res/cashflow/cashflowresource' ],
		function(cashflowRepDao, commons, formatter, cashflowItemDao, resource) {

			/**
			 * @desc get the cash flow report data by calling the
			 *       cashflowRepDao.
			 * @param {object}
			 *            [filter] - the object containing the subsidiary id,
			 *            the from period id and the to period id.
			 * @return {object} - returnValue.
			 */
			var unit = 1;
			function getRepData(filter) {
				log.debug('cashflow_data', 'getRepData, filter='
						+ JSON.stringify(filter));
				var subsidiaryId = filter.subsidiary;
				var fromPeriod = filter.period.from;
				var toPeriod = filter.period.to;
				// NSCHINA-2429
				// Add location/department/class to cashflow data
				var locationId = filter.location;
				var departmentId = filter.department;
				var classId = filter.classification;
				unit = filter.unit;
				var resultArray = [];
				// 差选并封装现金流量表条目
				var result = cashflowRepDao
						.fetchCashflowRepData(subsidiaryId, fromPeriod,
								toPeriod, locationId, departmentId, classId);
				log.debug('app_cn_cashflow_data.js: result', result);
				// {"18":"688.99","1":"4784.58"}
				result = handleResult(result);
				log.debug('app_cn_cashflow_data.js: handledResult', result);
				if (commons.makesure(result)) {
					// 一、经营活动产生的现金流量：
					// 经营活动产生的现金流入*************
					var totalCashInflowsFromOperatingActivities = 0;
					resultArray.push({
						amount : ''
					});

					// 1、 销售商品、提供劳务收到的现金（外部客商往来）
					var result1 = parseAmountWithUnit(result[1]);
					totalCashInflowsFromOperatingActivities += result1.value;
					resultArray.push({
						amount : result1.text
					});
					// 2、 销售商品、提供劳务收到的现金（内部客商往来）
					var result2 = parseAmountWithUnit(result[2]);
					totalCashInflowsFromOperatingActivities += result2.value;
					resultArray.push({
						amount : result2.text
					});
					// 3、收到的税费返还
					var result3 = parseAmountWithUnit(result[3]);
					totalCashInflowsFromOperatingActivities += result3.value;
					resultArray.push({
						amount : result3.text
					});
					// 4、收到其他与经营活动有关的现金（外部客商往来）
					var receivedOtherCashRelatedToBusinessActivitiesEM = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 4; i < 16; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						receivedOtherCashRelatedToBusinessActivitiesEM += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					receivedOtherCashRelatedToBusinessActivitiesEM = formatAmount(receivedOtherCashRelatedToBusinessActivitiesEM);
					resultArray[4].amount = receivedOtherCashRelatedToBusinessActivitiesEM.text;
					totalCashInflowsFromOperatingActivities += receivedOtherCashRelatedToBusinessActivitiesEM.value;
					// 5、收到其他与经营活动有关的现金（内部客商往来）
					var receivedOtherCashRelatedToBusinessActivitiesIM = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 16; i < 18; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						receivedOtherCashRelatedToBusinessActivitiesIM += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					receivedOtherCashRelatedToBusinessActivitiesIM = formatAmount(receivedOtherCashRelatedToBusinessActivitiesIM);
					resultArray[17].amount = receivedOtherCashRelatedToBusinessActivitiesIM.text;
					totalCashInflowsFromOperatingActivities += receivedOtherCashRelatedToBusinessActivitiesIM.value;

					// 经营活动现金流入小计
					resultArray
							.push({
								amount : formatAmount(totalCashInflowsFromOperatingActivities).text
							});

					// 经营活动现金流出*************
					var totalCashOutflowsFromOperatingActivities = 0;
					// 1、购买商品、接受劳务支付的现金（外部客商往来）（含制造费用与成本相关的）
					var result18 = parseAmountWithUnit(result[18]);
					totalCashOutflowsFromOperatingActivities += result18.value;
					resultArray.push({
						amount : result18.text
					});
					// 2、购买商品、接受劳务支付的现金（内部客商往来）
					var result19 = parseAmountWithUnit(result[19]);
					totalCashOutflowsFromOperatingActivities += result19.value;
					resultArray.push({
						amount : result19.text
					});
					// 3、支付给职工以及为职工支付的现金
					var cashPaidToEmployeesAndPaidForEmployees = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 20; i < 22; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						cashPaidToEmployeesAndPaidForEmployees += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					cashPaidToEmployeesAndPaidForEmployees = formatAmount(cashPaidToEmployeesAndPaidForEmployees);
					resultArray[23].amount = cashPaidToEmployeesAndPaidForEmployees.text;
					totalCashOutflowsFromOperatingActivities += cashPaidToEmployeesAndPaidForEmployees.value;
					// 4、支付的各项税费
					var variousTaxesAndFeesPaid = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 22; i < 30; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						variousTaxesAndFeesPaid += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					variousTaxesAndFeesPaid = formatAmount(variousTaxesAndFeesPaid);
					resultArray[26].amount = variousTaxesAndFeesPaid.text;
					totalCashOutflowsFromOperatingActivities += variousTaxesAndFeesPaid.value;
					// 5、支付其他与经营活动有关的现金（外部客商往来）
					var payOtherCashRelatedToBusinessActivitiesEM = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 30; i < 41; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						payOtherCashRelatedToBusinessActivitiesEM += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					payOtherCashRelatedToBusinessActivitiesEM = formatAmount(payOtherCashRelatedToBusinessActivitiesEM);
					resultArray[35].amount = payOtherCashRelatedToBusinessActivitiesEM.text;
					totalCashOutflowsFromOperatingActivities += payOtherCashRelatedToBusinessActivitiesEM.value;
					// 6、支付其他与经营活动有关的现金（内部客商往来）
					var payOtherCashRelatedToBusinessActivitiesIM = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 41; i < 43; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						payOtherCashRelatedToBusinessActivitiesIM += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					payOtherCashRelatedToBusinessActivitiesIM = formatAmount(payOtherCashRelatedToBusinessActivitiesIM);
					resultArray[47].amount = payOtherCashRelatedToBusinessActivitiesIM.text;
					totalCashOutflowsFromOperatingActivities += payOtherCashRelatedToBusinessActivitiesIM.value;
					// 经营活动现金流出小计
					resultArray
							.push({
								amount : formatAmount(totalCashOutflowsFromOperatingActivities).text
							});
					// 经营活动产生的现金流量净额
					var netCashFlowsFromOperatingActivities = totalCashInflowsFromOperatingActivities
							- totalCashOutflowsFromOperatingActivities;
					resultArray
							.push({
								amount : formatAmount(netCashFlowsFromOperatingActivities).text
							});

					// 一、经营活动产生的现金流量：END

					// 二、投资活动产生的现金流量：
					var totalCashInflowsFromInvestingActivities = 0;
					resultArray.push({
						amount : ''
					});
					// 投资活动产生的现金流入
					// 1、收回投资收到的现金
					var cashRecoveredFromInvestment = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 43; i < 48; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						cashRecoveredFromInvestment += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					cashRecoveredFromInvestment = formatAmount(cashRecoveredFromInvestment);
					resultArray[53].amount = cashRecoveredFromInvestment.text;
					totalCashInflowsFromInvestingActivities += cashRecoveredFromInvestment.value;
					// 2、取得投资收益收到的现金
					var cashReceivedFromInvestmentIncome = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 48; i < 53; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						cashReceivedFromInvestmentIncome += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					cashReceivedFromInvestmentIncome = formatAmount(cashReceivedFromInvestmentIncome);
					resultArray[59].amount = cashReceivedFromInvestmentIncome.text;
					totalCashInflowsFromInvestingActivities += cashReceivedFromInvestmentIncome.value;
					resultArray
							.push({
								amount : formatAmount(totalCashInflowsFromInvestingActivities).text
							});

					// 投资活动产生的现金流出
					var totalCashOutflowsFromInvestingActivities = 0;
					// 1、购建固定资产、无形资产和其他长期资产支付的现金
					var cashPaidForThePurchaseAndConstructionOfFixedAssetsIntangibleAssetsAndOtherLongTermAssets = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 53; i < 56; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						cashPaidForThePurchaseAndConstructionOfFixedAssetsIntangibleAssetsAndOtherLongTermAssets += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					cashPaidForThePurchaseAndConstructionOfFixedAssetsIntangibleAssetsAndOtherLongTermAssets = formatAmount(cashPaidForThePurchaseAndConstructionOfFixedAssetsIntangibleAssetsAndOtherLongTermAssets);
					resultArray[66].amount = cashPaidForThePurchaseAndConstructionOfFixedAssetsIntangibleAssetsAndOtherLongTermAssets.text;
					totalCashOutflowsFromInvestingActivities += cashPaidForThePurchaseAndConstructionOfFixedAssetsIntangibleAssetsAndOtherLongTermAssets.value;
					// 2、投资支付的现金
					var cashInvestment = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 56; i < 62; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						cashInvestment += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					cashInvestment = formatAmount(cashInvestment);
					resultArray[70].amount = cashInvestment.text;
					totalCashOutflowsFromInvestingActivities += cashInvestment.value;
					resultArray
							.push({
								amount : formatAmount(totalCashOutflowsFromInvestingActivities).text
							});
					var netCashFlowsFromInvestingActivities = totalCashInflowsFromInvestingActivities
							- totalCashOutflowsFromInvestingActivities;
					resultArray
							.push({
								amount : formatAmount(netCashFlowsFromInvestingActivities).text
							});
					// 二、投资活动产生的现金流量：END

					// 三、筹资活动产生的现金流量：
					var totalCashInflowsFromFinancingActivities = 0;
					resultArray.push({
						amount : ''
					});
					// 筹资活动产生的现金收入
					// 1、吸收投资收到的现金
					var cashReceivedFromInvestments = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 62; i < 64; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						cashReceivedFromInvestments += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					cashReceivedFromInvestments = formatAmount(cashReceivedFromInvestments);
					resultArray[80].amount = cashReceivedFromInvestments.text;
					totalCashInflowsFromFinancingActivities += cashReceivedFromInvestments.value;
					// 2、取得借款收到的现金
					var cashReceivedFromBorrowings = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 64; i < 69; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						cashReceivedFromBorrowings += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					cashReceivedFromBorrowings = formatAmount(cashReceivedFromBorrowings);
					resultArray[83].amount = cashReceivedFromBorrowings.text;
					totalCashInflowsFromFinancingActivities += cashReceivedFromBorrowings.value;

					resultArray
							.push({
								amount : formatAmount(totalCashInflowsFromFinancingActivities).text
							});

					// 筹资活动产生的现金支出
					var totalCashOutflowsFromFinancingActivities = 0;
					// 1、偿还债务支付的现金
					var cashRepaymentsForDebts = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 69; i < 72; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						cashRepaymentsForDebts += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					cashRepaymentsForDebts = formatAmount(cashRepaymentsForDebts);
					resultArray[90].amount = cashRepaymentsForDebts.text;
					totalCashOutflowsFromFinancingActivities += cashRepaymentsForDebts.value;
					// 2、分配股利、利润或偿付利息支付的现金
					var cashPaymentsForDistributionOfDividends = 0;
					resultArray.push({
						amount : 0
					});
					for (var i = 72; i < 75; i++) {
						var resultTmp = parseAmountWithUnit(result[i]);
						cashPaymentsForDistributionOfDividends += resultTmp.value;
						resultArray.push({
							amount : resultTmp.text
						});
					}
					cashPaymentsForDistributionOfDividends = formatAmount(cashPaymentsForDistributionOfDividends);
					resultArray[94].amount = cashPaymentsForDistributionOfDividends.text;
					totalCashOutflowsFromFinancingActivities += cashPaymentsForDistributionOfDividends.value;
					// 筹资活动现金流出小计
					resultArray
							.push({
								amount : formatAmount(totalCashOutflowsFromFinancingActivities).text
							});
					// 筹资活动现金流出小计
					var netCashFlowsFromFinancingActivities = totalCashInflowsFromFinancingActivities
							- totalCashOutflowsFromFinancingActivities;
					resultArray
							.push({
								amount : formatAmount(netCashFlowsFromFinancingActivities).text
							});
					// 四、汇率变动对现金及现金等价物的影响
					var effectOfForeignExchangeRateChanges = parseAmountWithUnit(result[75]);
					resultArray.push({
						amount : effectOfForeignExchangeRateChanges.text
					});
					// Get the run report results
					// var effectOfForeignExchangeRateChanges;
					// if (commons.makesure(filter.repDataCurrent)) {
					// effectOfForeignExchangeRateChanges =
					// parseAmountWithUnit(filter.unrealizedGainAndLossPrior);
					// resultArray.push({
					// amount : effectOfForeignExchangeRateChanges.text
					// });
					// } else {
					// effectOfForeignExchangeRateChanges =
					// parseAmountWithUnit(filter.unrealizedGainAndLossCurrent);
					// resultArray.push({
					// amount : effectOfForeignExchangeRateChanges.text
					// });
					// }
					var addCashAmt = formatAmount(netCashFlowsFromOperatingActivities
							+ netCashFlowsFromInvestingActivities
							+ netCashFlowsFromFinancingActivities
							+ effectOfForeignExchangeRateChanges.value);
					resultArray.push({
						amount : addCashAmt.text
					});

					// Get the run report results
					// if (commons.makesure(filter.repDataCurrent)) {
					// resultArray
					// .push({
					// amount :
					// parseAmountWithUnit(filter.startBalancePrior).text
					// });
					// resultArray
					// .push({
					// amount : parseAmountWithUnit(filter.endBalancePrior).text
					// });
					// } else {
					// log.debug('cashflow data: addCashAmt',
					// formatAmount(filter.startBalanceCurrent).value
					// + addCashAmt.value);
					resultArray
							.push({
								amount : parseAmountWithUnit(filter.startBalanceCurrent).text
							});
					resultArray
							.push({
								amount : parseAmountWithUnit(formatAmount(filter.startBalanceCurrent).value
										+ addCashAmt.value).text
							});
					// }
				} // The dao will always return an object

				log.debug('cashflow data: resultArray', resultArray);

				return resultArray;
			}

			function parseAmountWithUnit(cfsAmount) {

				if (commons.makecertain(cfsAmount)) {

					if (commons.toNumber(cfsAmount) === 0) {
						return {
							text : formatter.formatCurrency('0.00'),
							value : 0
						};
					} else {
						var amountAfterunit = cfsAmount / unit;
						return {
							text : formatter.formatCurrency(amountAfterunit),
							value : formatter.round(amountAfterunit)
						};
					}
				} else {
					return {
						text : formatter.formatCurrency('0.00'),
						value : 0
					};
				}
			}

			function formatAmount(cfsAmount) {

				if (commons.makecertain(cfsAmount)) {

					if (commons.toNumber(cfsAmount) === 0) {
						return {
							text : formatter.formatCurrency('0.00'),
							value : 0
						};
					} else {
						return {
							text : formatter.formatCurrency(cfsAmount),
							value : formatter.round(cfsAmount)
						};
					}
				} else {
					return {
						text : formatter.formatCurrency('0.00'),
						value : 0
					};
				}

			}

			function handleResult(result) {
				var cfsItems = cashflowItemDao.fetchCashFlowItems();
				log.debug("app_cn_cashflow_data.js: cfsItems", cfsItems);

				var templateLabel = resource.load({
					name : resource.Name.Labels
				});
				var cfsInJSON = {};
				for ( var attr in templateLabel.data) {
					if (commons.makesure(templateLabel.data[attr].id)) {
						cfsInJSON[templateLabel.data[attr].label] = templateLabel.data[attr].id;
					}
				}
				log.debug("app_cn_cashflow_data.js: cfsInJSON", cfsInJSON);

				var returnResult = {};
				for ( var idx in result) {
					if (commons.makesure(idx)) {
						var desc = cfsItems[idx];
						log.debug("cash flow desc", desc);
						if (commons.makesure(desc)) {
							var id = cfsInJSON[desc];
							log.debug("cash flow id", id);
							if (commons.makesure(id)) {
								returnResult[id] = result[idx];
								log.debug("result[idx]", result[idx]);
							}
						}
					}
				}

				return returnResult;
			}

			return {
				getRepData : getRepData
			};

		});
