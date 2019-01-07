/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */

define([
    '../../dao/cn_cashflow_showrep_dao',
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_format',
    '../../dao/cn_cashflow_item_dao',
    '../../res/cashflow/cashflowresource'
],

function(cashflowRepDao, commons, formatter, cashflowItemDao, resource) {

    /**
     * @desc get the cash flow report data by calling the cashflowRepDao.
     * @param  {object} [filter] - the object containing the subsidiary id, the from period id and the to period id.
     * @return {object} - returnValue.
     */
    var unit = 1;
    function getRepData(filter) {
        log.debug('cashflow_data','getRepData, filter=' + JSON.stringify(filter));
        var subsidiaryId = filter.subsidiary;
        var fromPeriod = filter.period.from;
        var toPeriod = filter.period.to;
        //NSCHINA-2429
        //Add location/department/class to cashflow data
        var locationId = filter.location;
        var departmentId = filter.department;
        var classId = filter.classification;
        unit = filter.unit;
        var resultArray = [];
        var result = cashflowRepDao.fetchCashflowRepData(subsidiaryId, fromPeriod, toPeriod, locationId, departmentId, classId);
        log.debug('app_cn_cashflow_data.js: result', result);
        result = handleResult(result);
        log.debug('app_cn_cashflow_data.js: handledResult', result);
        if (commons.makesure(result)) {
            var totalCashInflowsFromOperatingActivities = 0;

            //1.Cash flows from operating activities
            resultArray.push({
                amount: ''
            });

            var result1 = parseAmountWithUnit(result[1]);
            totalCashInflowsFromOperatingActivities += result1.value;
            resultArray.push({
                amount: result1.text
            });

            var result2 = parseAmountWithUnit(result[2]);
            totalCashInflowsFromOperatingActivities += result2.value;
            resultArray.push({
                amount: result2.text
            });

            var result3 = parseAmountWithUnit(result[3]);
            totalCashInflowsFromOperatingActivities += result3.value;
            resultArray.push({
                amount: result3.text
            });

            resultArray.push({
                amount: formatAmount(totalCashInflowsFromOperatingActivities).text
            });

            var totalCashOutflowsFromOperatingActivities = 0;

            var result4 = parseAmountWithUnit(result[4]);
            totalCashOutflowsFromOperatingActivities += result4.value;
            resultArray.push({
                amount: result4.text
            });

            var result5 = parseAmountWithUnit(result[5]);
            totalCashOutflowsFromOperatingActivities += result5.value;
            resultArray.push({
                amount: result5.text
            });

            var result6 = parseAmountWithUnit(result[6]);
            totalCashOutflowsFromOperatingActivities += result6.value;
            resultArray.push({
                amount: result6.text
            });

            var result7 = parseAmountWithUnit(result[7]);
            totalCashOutflowsFromOperatingActivities += result7.value;
            resultArray.push({
                amount: result7.text
            });

            resultArray.push({
                amount: formatAmount(totalCashOutflowsFromOperatingActivities).text
            });
            var netCashFlowsFromOperatingActivities = totalCashInflowsFromOperatingActivities - totalCashOutflowsFromOperatingActivities;
            resultArray.push({
                amount: formatAmount(netCashFlowsFromOperatingActivities).text
            });


            var totalCashInflowsFromInvestingActivities = 0;
            //2.Cash flows from investing activities
            resultArray.push({
                amount: ''
            });

            var result8 = parseAmountWithUnit(result[8]);
            totalCashInflowsFromInvestingActivities += result8.value;
            resultArray.push({
                amount: result8.text
            });

            var result9 = parseAmountWithUnit(result[9]);
            totalCashInflowsFromInvestingActivities += result9.value;
            resultArray.push({
                amount: result9.text
            });

            var result10 = parseAmountWithUnit(result[10]);
            totalCashInflowsFromInvestingActivities += result10.value;
            resultArray.push({
                amount: result10.text
            });

            var result11 = parseAmountWithUnit(result[11]);
            totalCashInflowsFromInvestingActivities += result11.value;
            resultArray.push({
                amount: result11.text
            });

            var result12 = parseAmountWithUnit(result[12]);
            totalCashInflowsFromInvestingActivities += result12.value;
            resultArray.push({
                amount: result12.text
            });

            resultArray.push({
                amount: formatAmount(totalCashInflowsFromInvestingActivities).text
            });

            var totalCashOutflowsFromInvestingActivities = 0;
            var result13 = parseAmountWithUnit(result[13]);
            totalCashOutflowsFromInvestingActivities += result13.value;
            resultArray.push({
                amount: result13.text
            });

            var result14 = parseAmountWithUnit(result[14]);
            totalCashOutflowsFromInvestingActivities += result14.value;
            resultArray.push({
                amount: result14.text
            });

            var result15 = parseAmountWithUnit(result[15]);
            totalCashOutflowsFromInvestingActivities += result15.value;
            resultArray.push({
                amount: result15.text
            });

            var result16 = parseAmountWithUnit(result[16]);
            totalCashOutflowsFromInvestingActivities += result16.value;
            resultArray.push({
                amount: result16.text
            });

            resultArray.push({
                amount: formatAmount(totalCashOutflowsFromInvestingActivities).text
            });
            var netCashFlowsFromInvestingActivities = totalCashInflowsFromInvestingActivities - totalCashOutflowsFromInvestingActivities;
            resultArray.push({
                amount: formatAmount(netCashFlowsFromInvestingActivities).text
            });


            var totalCashInflowsFromFinancingActivities = 0;
            //3.Cash flows from financing activities
            resultArray.push({
                amount: ''
            });

            var result17 = parseAmountWithUnit(result[17]);
            totalCashInflowsFromFinancingActivities += result17.value;
            resultArray.push({
                amount: result17.text
            });

            var result18 = parseAmountWithUnit(result[18]);
            totalCashInflowsFromFinancingActivities += result18.value;
            resultArray.push({
                amount: result18.text
            });

            var result19 = parseAmountWithUnit(result[19]);
            totalCashInflowsFromFinancingActivities += result19.value;
            resultArray.push({
                amount: result19.text
            });

            resultArray.push({
                amount: formatAmount(totalCashInflowsFromFinancingActivities).text
            });

            var totalCashOutflowsFromFinancingActivities = 0;

            var result20 = parseAmountWithUnit(result[20]);
            totalCashOutflowsFromFinancingActivities += result20.value;
            resultArray.push({
                amount: result20.text
            });

            var result21 = parseAmountWithUnit(result[21]);
            totalCashOutflowsFromFinancingActivities += result21.value;
            resultArray.push({
                amount: result21.text
            });

            var result22 = parseAmountWithUnit(result[22]);
            totalCashOutflowsFromFinancingActivities += result22.value;
            resultArray.push({
                amount: result22.text
            });

            resultArray.push({
                amount: formatAmount(totalCashOutflowsFromFinancingActivities).text
            });

            var netCashFlowsFromFinancingActivities = totalCashInflowsFromFinancingActivities - totalCashOutflowsFromFinancingActivities;
            resultArray.push({
                amount: formatAmount(netCashFlowsFromFinancingActivities).text
            });

            //Get the run report results
            var effectOfForeignExchangeRateChanges;
            if (commons.makesure(filter.repDataCurrent)) {
                effectOfForeignExchangeRateChanges = parseAmountWithUnit(filter.unrealizedGainAndLossPrior);
                resultArray.push({
                    amount: effectOfForeignExchangeRateChanges.text
                });
            } else {
                effectOfForeignExchangeRateChanges = parseAmountWithUnit(filter.unrealizedGainAndLossCurrent);
                resultArray.push({
                    amount: effectOfForeignExchangeRateChanges.text
                });
            }

            resultArray.push({
                amount: formatAmount(netCashFlowsFromOperatingActivities + netCashFlowsFromInvestingActivities + netCashFlowsFromFinancingActivities + effectOfForeignExchangeRateChanges.value).text
            });

            //Get the run report results
            if (commons.makesure(filter.repDataCurrent)) {
                resultArray.push({
                    amount: parseAmountWithUnit(filter.startBalancePrior).text
                });
                resultArray.push({
                    amount: parseAmountWithUnit(filter.endBalancePrior).text
                });
            } else {
                resultArray.push({
                    amount: parseAmountWithUnit(filter.startBalanceCurrent).text
                });
                resultArray.push({
                    amount: parseAmountWithUnit(filter.endBalanceCurrent).text
                });
            }
        } //The dao will always return an object

        log.debug('cashflow data: resultArray', resultArray);

        return resultArray;
    }

    function parseAmountWithUnit(cfsAmount) {

        if (commons.makecertain(cfsAmount)) {

            if (commons.toNumber(cfsAmount) === 0) {
                return {
                    text: formatter.formatCurrency('0.00'),
                    value: 0
                };
            } else {
                var amountAfterunit = cfsAmount / unit;
                return {
                    text: formatter.formatCurrency(amountAfterunit),
                    value: formatter.round(amountAfterunit)
                };
            }
        } else {
            return {
                text: formatter.formatCurrency('0.00'),
                value: 0
            };
        }
    }

    function formatAmount(cfsAmount) {

        if (commons.makecertain(cfsAmount)) {

            if (commons.toNumber(cfsAmount) === 0) {
                return {
                    text: formatter.formatCurrency('0.00'),
                    value: 0
                };
            } else {
                return {
                    text: formatter.formatCurrency(cfsAmount),
                    value: formatter.round(cfsAmount)
                };
            }
        } else {
            return {
                text: formatter.formatCurrency('0.00'),
                value: 0
            };
        }

    }

    function handleResult(result) {
        var cfsItems = cashflowItemDao.fetchCashFlowItems();
        log.debug("app_cn_cashflow_data.js: cfsItems", cfsItems);

        var templateLabel = resource.load({
            name: resource.Name.Labels
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
        getRepData: getRepData
    };

});
