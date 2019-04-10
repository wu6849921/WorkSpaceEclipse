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
					// 设置reportlist 要和cashflow_labels_en_US.json文件得id保持一致
					// 一、经营活动产生的现金流量：
					// 经营活动产生的现金流入*************
					var totalCashInflowsFromOperatingActivities = 0;
					resultArray.push({
						amount : ''
					});

					// 1、 销售商品、提供劳务收到的现金
					var result1 = parseAmountWithUnit(result[1]);
					totalCashInflowsFromOperatingActivities += result1.value;
					resultArray.push({
						amount : result1.text
					});
					// 2、收到的税费返还
					var result2 = parseAmountWithUnit(result[2]);
					totalCashInflowsFromOperatingActivities += result2.value;
					resultArray.push({
						amount : result2.text
					});
					// 3、收到其他与经营活动有关的现金
					var result3 = parseAmountWithUnit(result[3]);
					totalCashInflowsFromOperatingActivities += result3.value;
					resultArray.push({
						amount : result3.text
					});

					// 经营活动现金流入小计
					resultArray
							.push({
								amount : formatAmount(totalCashInflowsFromOperatingActivities).text
							});

					// 经营活动现金流出*************
					var totalCashOutflowsFromOperatingActivities = 0;
					// 1、购买商品、接受劳务支付的现金
					var result4 = parseAmountWithUnit(result[4]);
					totalCashOutflowsFromOperatingActivities += result4.value;
					resultArray.push({
						amount : result4.text
					});
					// 因研发购买商品、接受劳务支付的现金 addbyjoe 20190402
					var result5 = parseAmountWithUnit(result[5]);
					totalCashOutflowsFromOperatingActivities += result5.value;
					resultArray.push({
						amount : result5.text
					});

					// 2、支付给职工以及为职工支付的现金
					var result6 = parseAmountWithUnit(result[6]);
					totalCashOutflowsFromOperatingActivities += result6.value;
					resultArray.push({
						amount : result6.text
					});
					// 3、支付的各项税费
					var result7 = parseAmountWithUnit(result[7]);
					totalCashOutflowsFromOperatingActivities += result7.value;
					resultArray.push({
						amount : result7.text
					});
					// 4、支付其他与经营活动有关的现金
					var result8 = parseAmountWithUnit(result[8]);
					totalCashOutflowsFromOperatingActivities += result8.value;
					resultArray.push({
						amount : result8.text
					});
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
					var result9 = parseAmountWithUnit(result[9]);
					totalCashInflowsFromInvestingActivities += result9.value;
					resultArray.push({
						amount : result9.text
					});
					// 2、取得利息收入收到的现金
					var result10 = parseAmountWithUnit(result[10]);
					totalCashInflowsFromInvestingActivities += result10.value;
					resultArray.push({
						amount : result10.text
					});
					// 3、取得投资收益收到的现金
					var result11 = parseAmountWithUnit(result[11]);
					totalCashInflowsFromInvestingActivities += result11.value;
					resultArray.push({
						amount : result11.text
					});
					// 4、处置固定资产、无形资产和其他长期资产收回的现金净额
					var result12 = parseAmountWithUnit(result[12]);
					totalCashInflowsFromInvestingActivities += result12.value;
					resultArray.push({
						amount : result12.text
					});
					// 5、处置子公司收到的现金净额
					var result13 = parseAmountWithUnit(result[13]);
					totalCashInflowsFromInvestingActivities += result13.value;
					resultArray.push({
						amount : result13.text
					});
					// 6、处置联营及合营公司等其他营业单位收到的现金净额
					var result14 = parseAmountWithUnit(result[14]);
					totalCashInflowsFromInvestingActivities += result14.value;
					resultArray.push({
						amount : result14.text
					});
					// 7、收到其他与投资活动有关的现金
					var result15 = parseAmountWithUnit(result[15]);
					totalCashInflowsFromInvestingActivities += result15.value;
					resultArray.push({
						amount : result15.text
					});

					// 投资活动现金流入小计
					resultArray
							.push({
								amount : formatAmount(totalCashInflowsFromInvestingActivities).text
							});

					// 投资活动产生的现金流出
					var totalCashOutflowsFromInvestingActivities = 0;
					// 1、购建固定资产、无形资产和其他长期资产支付的现金
					var result16 = parseAmountWithUnit(result[16]);
					totalCashOutflowsFromInvestingActivities += result16.value;
					resultArray.push({
						amount : result16.text
					});
					// 2、投资支付的现金
					var result17 = parseAmountWithUnit(result[17]);
					totalCashOutflowsFromInvestingActivities += result17.value;
					resultArray.push({
						amount : result17.text
					});
					// 3、取得子公司支付的现金
					var result18 = parseAmountWithUnit(result[18]);
					totalCashOutflowsFromInvestingActivities += result18.value;
					resultArray.push({
						amount : result18.text
					});
					// 4、取得联营及合营公司等其他营业单位支付的现金净额
					var result19 = parseAmountWithUnit(result[19]);
					totalCashOutflowsFromInvestingActivities += result19.value;
					resultArray.push({
						amount : result19.text
					});
					// 5、回购子公司的少数股东权益支付的现金
					var result20 = parseAmountWithUnit(result[20]);
					totalCashOutflowsFromInvestingActivities += result20.value;
					resultArray.push({
						amount : result20.text
					});
					// 6、支付其他与投资活动有关的现金
					var result21 = parseAmountWithUnit(result[21]);
					totalCashOutflowsFromInvestingActivities += result21.value;
					resultArray.push({
						amount : result21.text
					});

					// 投资活动产生的现金流出小计
					resultArray
							.push({
								amount : formatAmount(totalCashOutflowsFromInvestingActivities).text
							});
					// 投资活动产生的现金流量净额
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
					var result22 = parseAmountWithUnit(result[22]);
					totalCashInflowsFromFinancingActivities += result22.value;
					resultArray.push({
						amount : result22.text
					});
					// 2、其中：子公司吸收少数股东投资收到的现金
					var result23 = parseAmountWithUnit(result[23]);
					totalCashInflowsFromFinancingActivities += result23.value;
					resultArray.push({
						amount : result23.text
					});
					// 3、取得借款收到的现金
					var result24 = parseAmountWithUnit(result[24]);
					totalCashInflowsFromFinancingActivities += result24.value;
					resultArray.push({
						amount : result24.text
					});
					// 4、发行债券收到的现金
					var result25 = parseAmountWithUnit(result[25]);
					totalCashInflowsFromFinancingActivities += result25.value;
					resultArray.push({
						amount : result25.text
					});
					// 5、收到其他与筹资活动有关的现金
					var result26 = parseAmountWithUnit(result[26]);
					totalCashInflowsFromFinancingActivities += result26.value;
					resultArray.push({
						amount : result26.text
					});
					// 筹资活动产生的现金收入小计
					resultArray
							.push({
								amount : formatAmount(totalCashInflowsFromFinancingActivities).text
							});

					// 筹资活动产生的现金支出
					var totalCashOutflowsFromFinancingActivities = 0;
					// 1、偿还债务支付的现金
					var result27 = parseAmountWithUnit(result[27]);
					totalCashOutflowsFromFinancingActivities += result27.value;
					resultArray.push({
						amount : result27.text
					});
					// 2、偿付利息所支付的现金
					var result28 = parseAmountWithUnit(result[28]);
					totalCashOutflowsFromFinancingActivities += result28.value;
					resultArray.push({
						amount : result28.text
					});
					// 3、分配利润支付的现金
					var result29 = parseAmountWithUnit(result[29]);
					totalCashOutflowsFromFinancingActivities += result29.value;
					resultArray.push({
						amount : result29.text
					});
					// 4、其中：子公司支付给少数股东的利润
					var result30 = parseAmountWithUnit(result[30]);
					totalCashOutflowsFromFinancingActivities += result30.value;
					resultArray.push({
						amount : result30.text
					});
					// 5、支付其他与筹资活动有关的现金
					var result31 = parseAmountWithUnit(result[31]);
					totalCashOutflowsFromFinancingActivities += result31.value;
					resultArray.push({
						amount : result31.text
					});
					// 筹资活动现金流出小计
					resultArray
							.push({
								amount : formatAmount(totalCashOutflowsFromFinancingActivities).text
							});
					// 筹资活动产生的现金流量净额
					var netCashFlowsFromFinancingActivities = totalCashInflowsFromFinancingActivities
							- totalCashOutflowsFromFinancingActivities;
					resultArray
							.push({
								amount : formatAmount(netCashFlowsFromFinancingActivities).text
							});
					// 四、汇率变动对现金及现金等价物的影响
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
					// 现金及现金等价物净增加额 (净减少以“-”号填列)
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

					// 加：年初现金及现金等价物余额
					resultArray
							.push({
								amount : parseAmountWithUnit(filter.startBalanceCurrent).text
							});
					// 年末现金及现金等价物余额
					resultArray
							.push({
								amount : parseAmountWithUnit(formatAmount(filter.startBalanceCurrent).value
										+ addCashAmt.value).text
							});

					// 年末资产负债表现金及现金等价物余额 New
					resultArray
							.push({
								amount : parseAmountWithUnit(filter.endBalanceCurrent).text
							});
					// 年末资产负债表现金及现金等价物余额 New
					// log.debug('年末资产',
					// formatAmount(filter.endBalanceCurrent).value);
					// log.debug('年末资产',
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
				var cfsItems = cashflowItemDao.fetchCashFlowItems();// 查询所有系统内CFIitems
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
