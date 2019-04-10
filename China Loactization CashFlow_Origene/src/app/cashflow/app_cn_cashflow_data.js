/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
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
				// ��ѡ����װ�ֽ���������Ŀ
				var result = cashflowRepDao
						.fetchCashflowRepData(subsidiaryId, fromPeriod,
								toPeriod, locationId, departmentId, classId);
				log.debug('app_cn_cashflow_data.js: result', result);
				// {"18":"688.99","1":"4784.58"}
				result = handleResult(result);
				log.debug('app_cn_cashflow_data.js: handledResult', result);
				if (commons.makesure(result)) {
					// һ����Ӫ��������ֽ�������
					// ��Ӫ��������ֽ�����*************
					var totalCashInflowsFromOperatingActivities = 0;
					resultArray.push({
						amount : ''
					});

					// 1�� ������Ʒ���ṩ�����յ����ֽ��ⲿ����������
					var result1 = parseAmountWithUnit(result[1]);
					totalCashInflowsFromOperatingActivities += result1.value;
					resultArray.push({
						amount : result1.text
					});
					// 2�� ������Ʒ���ṩ�����յ����ֽ��ڲ�����������
					var result2 = parseAmountWithUnit(result[2]);
					totalCashInflowsFromOperatingActivities += result2.value;
					resultArray.push({
						amount : result2.text
					});
					// 3���յ���˰�ѷ���
					var result3 = parseAmountWithUnit(result[3]);
					totalCashInflowsFromOperatingActivities += result3.value;
					resultArray.push({
						amount : result3.text
					});
					// 4���յ������뾭Ӫ��йص��ֽ��ⲿ����������
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
					// 5���յ������뾭Ӫ��йص��ֽ��ڲ�����������
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

					// ��Ӫ��ֽ�����С��
					resultArray
							.push({
								amount : formatAmount(totalCashInflowsFromOperatingActivities).text
							});

					// ��Ӫ��ֽ�����*************
					var totalCashOutflowsFromOperatingActivities = 0;
					// 1��������Ʒ����������֧�����ֽ��ⲿ�����������������������ɱ���صģ�
					var result18 = parseAmountWithUnit(result[18]);
					totalCashOutflowsFromOperatingActivities += result18.value;
					resultArray.push({
						amount : result18.text
					});
					// 2��������Ʒ����������֧�����ֽ��ڲ�����������
					var result19 = parseAmountWithUnit(result[19]);
					totalCashOutflowsFromOperatingActivities += result19.value;
					resultArray.push({
						amount : result19.text
					});
					// 3��֧����ְ���Լ�Ϊְ��֧�����ֽ�
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
					// 4��֧���ĸ���˰��
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
					// 5��֧�������뾭Ӫ��йص��ֽ��ⲿ����������
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
					// 6��֧�������뾭Ӫ��йص��ֽ��ڲ�����������
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
					// ��Ӫ��ֽ�����С��
					resultArray
							.push({
								amount : formatAmount(totalCashOutflowsFromOperatingActivities).text
							});
					// ��Ӫ��������ֽ���������
					var netCashFlowsFromOperatingActivities = totalCashInflowsFromOperatingActivities
							- totalCashOutflowsFromOperatingActivities;
					resultArray
							.push({
								amount : formatAmount(netCashFlowsFromOperatingActivities).text
							});

					// һ����Ӫ��������ֽ�������END

					// ����Ͷ�ʻ�������ֽ�������
					var totalCashInflowsFromInvestingActivities = 0;
					resultArray.push({
						amount : ''
					});
					// Ͷ�ʻ�������ֽ�����
					// 1���ջ�Ͷ���յ����ֽ�
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
					// 2��ȡ��Ͷ�������յ����ֽ�
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

					// Ͷ�ʻ�������ֽ�����
					var totalCashOutflowsFromInvestingActivities = 0;
					// 1�������̶��ʲ��������ʲ������������ʲ�֧�����ֽ�
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
					// 2��Ͷ��֧�����ֽ�
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
					// ����Ͷ�ʻ�������ֽ�������END

					// �������ʻ�������ֽ�������
					var totalCashInflowsFromFinancingActivities = 0;
					resultArray.push({
						amount : ''
					});
					// ���ʻ�������ֽ�����
					// 1������Ͷ���յ����ֽ�
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
					// 2��ȡ�ý���յ����ֽ�
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

					// ���ʻ�������ֽ�֧��
					var totalCashOutflowsFromFinancingActivities = 0;
					// 1������ծ��֧�����ֽ�
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
					// 2���������������򳥸���Ϣ֧�����ֽ�
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
					// ���ʻ�ֽ�����С��
					resultArray
							.push({
								amount : formatAmount(totalCashOutflowsFromFinancingActivities).text
							});
					// ���ʻ�ֽ�����С��
					var netCashFlowsFromFinancingActivities = totalCashInflowsFromFinancingActivities
							- totalCashOutflowsFromFinancingActivities;
					resultArray
							.push({
								amount : formatAmount(netCashFlowsFromFinancingActivities).text
							});
					// �ġ����ʱ䶯���ֽ��ֽ�ȼ����Ӱ��
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
