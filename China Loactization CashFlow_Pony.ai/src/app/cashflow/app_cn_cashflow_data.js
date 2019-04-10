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
					// ����reportlist Ҫ��cashflow_labels_en_US.json�ļ���id����һ��
					// һ����Ӫ��������ֽ�������
					// ��Ӫ��������ֽ�����*************
					var totalCashInflowsFromOperatingActivities = 0;
					resultArray.push({
						amount : ''
					});

					// 1�� ������Ʒ���ṩ�����յ����ֽ�
					var result1 = parseAmountWithUnit(result[1]);
					totalCashInflowsFromOperatingActivities += result1.value;
					resultArray.push({
						amount : result1.text
					});
					// 2���յ���˰�ѷ���
					var result2 = parseAmountWithUnit(result[2]);
					totalCashInflowsFromOperatingActivities += result2.value;
					resultArray.push({
						amount : result2.text
					});
					// 3���յ������뾭Ӫ��йص��ֽ�
					var result3 = parseAmountWithUnit(result[3]);
					totalCashInflowsFromOperatingActivities += result3.value;
					resultArray.push({
						amount : result3.text
					});

					// ��Ӫ��ֽ�����С��
					resultArray
							.push({
								amount : formatAmount(totalCashInflowsFromOperatingActivities).text
							});

					// ��Ӫ��ֽ�����*************
					var totalCashOutflowsFromOperatingActivities = 0;
					// 1��������Ʒ����������֧�����ֽ�
					var result4 = parseAmountWithUnit(result[4]);
					totalCashOutflowsFromOperatingActivities += result4.value;
					resultArray.push({
						amount : result4.text
					});
					// ���з�������Ʒ����������֧�����ֽ� addbyjoe 20190402
					var result5 = parseAmountWithUnit(result[5]);
					totalCashOutflowsFromOperatingActivities += result5.value;
					resultArray.push({
						amount : result5.text
					});

					// 2��֧����ְ���Լ�Ϊְ��֧�����ֽ�
					var result6 = parseAmountWithUnit(result[6]);
					totalCashOutflowsFromOperatingActivities += result6.value;
					resultArray.push({
						amount : result6.text
					});
					// 3��֧���ĸ���˰��
					var result7 = parseAmountWithUnit(result[7]);
					totalCashOutflowsFromOperatingActivities += result7.value;
					resultArray.push({
						amount : result7.text
					});
					// 4��֧�������뾭Ӫ��йص��ֽ�
					var result8 = parseAmountWithUnit(result[8]);
					totalCashOutflowsFromOperatingActivities += result8.value;
					resultArray.push({
						amount : result8.text
					});
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
					var result9 = parseAmountWithUnit(result[9]);
					totalCashInflowsFromInvestingActivities += result9.value;
					resultArray.push({
						amount : result9.text
					});
					// 2��ȡ����Ϣ�����յ����ֽ�
					var result10 = parseAmountWithUnit(result[10]);
					totalCashInflowsFromInvestingActivities += result10.value;
					resultArray.push({
						amount : result10.text
					});
					// 3��ȡ��Ͷ�������յ����ֽ�
					var result11 = parseAmountWithUnit(result[11]);
					totalCashInflowsFromInvestingActivities += result11.value;
					resultArray.push({
						amount : result11.text
					});
					// 4�����ù̶��ʲ��������ʲ������������ʲ��ջص��ֽ𾻶�
					var result12 = parseAmountWithUnit(result[12]);
					totalCashInflowsFromInvestingActivities += result12.value;
					resultArray.push({
						amount : result12.text
					});
					// 5�������ӹ�˾�յ����ֽ𾻶�
					var result13 = parseAmountWithUnit(result[13]);
					totalCashInflowsFromInvestingActivities += result13.value;
					resultArray.push({
						amount : result13.text
					});
					// 6��������Ӫ����Ӫ��˾������Ӫҵ��λ�յ����ֽ𾻶�
					var result14 = parseAmountWithUnit(result[14]);
					totalCashInflowsFromInvestingActivities += result14.value;
					resultArray.push({
						amount : result14.text
					});
					// 7���յ�������Ͷ�ʻ�йص��ֽ�
					var result15 = parseAmountWithUnit(result[15]);
					totalCashInflowsFromInvestingActivities += result15.value;
					resultArray.push({
						amount : result15.text
					});

					// Ͷ�ʻ�ֽ�����С��
					resultArray
							.push({
								amount : formatAmount(totalCashInflowsFromInvestingActivities).text
							});

					// Ͷ�ʻ�������ֽ�����
					var totalCashOutflowsFromInvestingActivities = 0;
					// 1�������̶��ʲ��������ʲ������������ʲ�֧�����ֽ�
					var result16 = parseAmountWithUnit(result[16]);
					totalCashOutflowsFromInvestingActivities += result16.value;
					resultArray.push({
						amount : result16.text
					});
					// 2��Ͷ��֧�����ֽ�
					var result17 = parseAmountWithUnit(result[17]);
					totalCashOutflowsFromInvestingActivities += result17.value;
					resultArray.push({
						amount : result17.text
					});
					// 3��ȡ���ӹ�˾֧�����ֽ�
					var result18 = parseAmountWithUnit(result[18]);
					totalCashOutflowsFromInvestingActivities += result18.value;
					resultArray.push({
						amount : result18.text
					});
					// 4��ȡ����Ӫ����Ӫ��˾������Ӫҵ��λ֧�����ֽ𾻶�
					var result19 = parseAmountWithUnit(result[19]);
					totalCashOutflowsFromInvestingActivities += result19.value;
					resultArray.push({
						amount : result19.text
					});
					// 5���ع��ӹ�˾�������ɶ�Ȩ��֧�����ֽ�
					var result20 = parseAmountWithUnit(result[20]);
					totalCashOutflowsFromInvestingActivities += result20.value;
					resultArray.push({
						amount : result20.text
					});
					// 6��֧��������Ͷ�ʻ�йص��ֽ�
					var result21 = parseAmountWithUnit(result[21]);
					totalCashOutflowsFromInvestingActivities += result21.value;
					resultArray.push({
						amount : result21.text
					});

					// Ͷ�ʻ�������ֽ�����С��
					resultArray
							.push({
								amount : formatAmount(totalCashOutflowsFromInvestingActivities).text
							});
					// Ͷ�ʻ�������ֽ���������
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
					var result22 = parseAmountWithUnit(result[22]);
					totalCashInflowsFromFinancingActivities += result22.value;
					resultArray.push({
						amount : result22.text
					});
					// 2�����У��ӹ�˾���������ɶ�Ͷ���յ����ֽ�
					var result23 = parseAmountWithUnit(result[23]);
					totalCashInflowsFromFinancingActivities += result23.value;
					resultArray.push({
						amount : result23.text
					});
					// 3��ȡ�ý���յ����ֽ�
					var result24 = parseAmountWithUnit(result[24]);
					totalCashInflowsFromFinancingActivities += result24.value;
					resultArray.push({
						amount : result24.text
					});
					// 4������ծȯ�յ����ֽ�
					var result25 = parseAmountWithUnit(result[25]);
					totalCashInflowsFromFinancingActivities += result25.value;
					resultArray.push({
						amount : result25.text
					});
					// 5���յ���������ʻ�йص��ֽ�
					var result26 = parseAmountWithUnit(result[26]);
					totalCashInflowsFromFinancingActivities += result26.value;
					resultArray.push({
						amount : result26.text
					});
					// ���ʻ�������ֽ�����С��
					resultArray
							.push({
								amount : formatAmount(totalCashInflowsFromFinancingActivities).text
							});

					// ���ʻ�������ֽ�֧��
					var totalCashOutflowsFromFinancingActivities = 0;
					// 1������ծ��֧�����ֽ�
					var result27 = parseAmountWithUnit(result[27]);
					totalCashOutflowsFromFinancingActivities += result27.value;
					resultArray.push({
						amount : result27.text
					});
					// 2��������Ϣ��֧�����ֽ�
					var result28 = parseAmountWithUnit(result[28]);
					totalCashOutflowsFromFinancingActivities += result28.value;
					resultArray.push({
						amount : result28.text
					});
					// 3����������֧�����ֽ�
					var result29 = parseAmountWithUnit(result[29]);
					totalCashOutflowsFromFinancingActivities += result29.value;
					resultArray.push({
						amount : result29.text
					});
					// 4�����У��ӹ�˾֧���������ɶ�������
					var result30 = parseAmountWithUnit(result[30]);
					totalCashOutflowsFromFinancingActivities += result30.value;
					resultArray.push({
						amount : result30.text
					});
					// 5��֧����������ʻ�йص��ֽ�
					var result31 = parseAmountWithUnit(result[31]);
					totalCashOutflowsFromFinancingActivities += result31.value;
					resultArray.push({
						amount : result31.text
					});
					// ���ʻ�ֽ�����С��
					resultArray
							.push({
								amount : formatAmount(totalCashOutflowsFromFinancingActivities).text
							});
					// ���ʻ�������ֽ���������
					var netCashFlowsFromFinancingActivities = totalCashInflowsFromFinancingActivities
							- totalCashOutflowsFromFinancingActivities;
					resultArray
							.push({
								amount : formatAmount(netCashFlowsFromFinancingActivities).text
							});
					// �ġ����ʱ䶯���ֽ��ֽ�ȼ����Ӱ��
					var effectOfForeignExchangeRateChanges = parseAmountWithUnit(result[32]);
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
					// �ֽ��ֽ�ȼ��ﾻ���Ӷ� (�������ԡ�-��������)
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

					// �ӣ�����ֽ��ֽ�ȼ������
					resultArray
							.push({
								amount : parseAmountWithUnit(filter.startBalanceCurrent).text
							});
					// ��ĩ�ֽ��ֽ�ȼ������
					resultArray
							.push({
								amount : parseAmountWithUnit(formatAmount(filter.startBalanceCurrent).value
										+ addCashAmt.value).text
							});

					// ��ĩ�ʲ���ծ���ֽ��ֽ�ȼ������ New
					resultArray
							.push({
								amount : parseAmountWithUnit(filter.endBalanceCurrent).text
							});
					// ��ĩ�ʲ���ծ���ֽ��ֽ�ȼ������ New
					// log.debug('��ĩ�ʲ�',
					// formatAmount(filter.endBalanceCurrent).value);
					// log.debug('��ĩ�ʲ�',
					// formatAmount(filter.startBalanceCurrent).value);
					var difAmount = parseFloat(filter.endBalanceCurrent)
							- (parseFloat(filter.startBalanceCurrent) + parseFloat(addCashAmt.value));
					resultArray.push({
						amount : parseAmountWithUnit(difAmount).text
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
				var cfsItems = cashflowItemDao.fetchCashFlowItems();// ��ѯ����ϵͳ��CFIitems
				log
						.debug("app_cn_cashflow_data.js: cfsItems(system)",
								cfsItems);

				var templateLabel = resource.load({
					name : resource.Name.Labels
				});
				var cfsInJSON = {};
				for ( var attr in templateLabel.data) {
					if (commons.makesure(templateLabel.data[attr].id)) {
						cfsInJSON[templateLabel.data[attr].label] = templateLabel.data[attr].id;
					}
				}
				log
						.debug("app_cn_cashflow_data.js: cfsInJSON(file)",
								cfsInJSON);

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
