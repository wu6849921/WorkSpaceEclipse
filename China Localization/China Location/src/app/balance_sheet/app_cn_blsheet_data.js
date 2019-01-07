/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_format',
    '../../lib/wrapper/ns_wrapper_record'
],

function(commons, format, record) {

    var _unit = 1;
    /**
     * @desc get balance sheet data.
     * @param {Object} [labels] - balance sheet labels.
     * @param {array} [dataSets] -balance sheet data sets include:subsidiaryId,periodId,unit.
     * @return {array} [dataSets] - balance sheet data.
     */
    function getBLSheetData(labels, dataSets) {
        if (dataSets == null || dataSets.reportDataId == null) {
            return [];
        }
        try {
            var reportDataRecord = record.load({
                type: 'customrecord_cn_blsheet_data',
                id: dataSets.reportDataId
            });
            var jsonDataSets = JSON.parse(reportDataRecord.getValue({
                fieldId: 'custrecord_cn_blsheet_data_record'
            }));
            record.remove({
                type: 'customrecord_cn_blsheet_data',
                id: dataSets.reportDataId
            });
            _unit = dataSets.unit;
            var assetTotal = {
                itemDesc: labels.totalassets.label,
                closingBalance: formatNumber(jsonDataSets.totalasset.cb),
                openBalance: formatNumber(jsonDataSets.totalasset.ob),
                isBold: labels.totalassets.isBold
            };

            var liaEquityTotal = {
                itemDesc: labels.totalliabequity.label,
                closingBalance: formatNumber(jsonDataSets.total_liaequ.cb),
                openBalance: formatNumber(jsonDataSets.total_liaequ.ob),
                isBold: labels.totalliabequity.isBold
            };

            var assetResult = createAssetDataArray(jsonDataSets.asset, labels);
            var liabEquityResult = createLiabEquityDataArray(jsonDataSets.liaequ, labels);

            var assetSets = [];
            var liabEquitySets = [];
            if (assetResult.length > liabEquityResult.length) {
                liabEquitySets = paddingDataSets(liabEquityResult, assetResult.length - liabEquityResult.length);
                assetSets = assetResult;
            } else {
                assetSets = paddingDataSets(assetResult, liabEquityResult.length - assetResult.length);
                liabEquitySets = liabEquityResult;
            }
            assetSets.push(assetTotal);
            liabEquitySets.push(liaEquityTotal);
        } catch (ex) {
            log.error('blsheet_data', 'error occurred: ' + ex + '; reportDataID: ' + dataSets.reportDataId);
            return [];
        }


        return combineDataSets(assetSets, liabEquitySets);

    }
    /**
     * @desc create data set with assets related data.
     * @param {object} [assets] - assets which used to create data set.
     * @param {object} [labels] - labels for item description.
     * @return {array} - new data set.
     */
    function createAssetDataArray(assets, labels) {
        var blank = '&nbsp;&nbsp;&nbsp;&nbsp;';
        var result = [];
        //currentAsset line
        result.push({
            itemDesc: labels.currentassets.label,
            closingBalance: '',
            openBalance: '',
            isBold: labels.currentassets.isBold,
            center: labels.currentassets.center
        });
        //currentAsset child line
        var curasset = assets.curasset;
        for ( var curassetIdx in curasset) {
            var curassetRow = {};
            curassetRow.itemDesc = blank + curasset[curassetIdx].an;
            curassetRow.closingBalance = formatNumber(curasset[curassetIdx].cb);
            curassetRow.openBalance = formatNumber(curasset[curassetIdx].ob);
            curassetRow.isBold = false;
            result.push(curassetRow);
        }
        //currentAsset Total line
        result.push({
            itemDesc: labels.totalcurrentassets.label,
            closingBalance: formatNumber(assets.total_curasset.cb),
            openBalance: formatNumber(assets.total_curasset.ob),
            isBold: labels.totalcurrentassets.isBold,
            center: labels.totalcurrentassets.center
        });

        //fixAsset line
        result.push({
            itemDesc: labels.noncurrentassets.label,
            closingBalance: '',
            openBalance: '',
            isBold: labels.noncurrentassets.isBold,
            center: labels.noncurrentassets.center
        });
        //fixAsset child line
        var fixasset = assets.fixasset;
        for ( var fixassetIdx in fixasset) {
            var fixassetRow = {};
            fixassetRow.itemDesc = blank + fixasset[fixassetIdx].an;
            fixassetRow.closingBalance = formatNumber(fixasset[fixassetIdx].cb);
            fixassetRow.openBalance = formatNumber(fixasset[fixassetIdx].ob);
            fixassetRow.isBold = false;
            result.push(fixassetRow);
        }

        //fixAsset Total line
        result.push({
            itemDesc: labels.totalnoncurrentassets.label,
            closingBalance: formatNumber(assets.total_fixasset.cb),
            openBalance: formatNumber(assets.total_fixasset.ob),
            isBold: labels.totalnoncurrentassets.isBold,
            center: labels.totalnoncurrentassets.center
        });
        return result;
    }
    /**
     * @desc create liability equity data array.
     * @param {object} [liabEquity] - liability equity which used to create liability equity data array.
     * @param {object} [labels] - labels for item description.
     * @return {array} new liability equity data array.
     */
    function createLiabEquityDataArray(liabEquity, labels) {
        var blank = '&nbsp;&nbsp;&nbsp;&nbsp;';
        var result = [];
        //current liability line
        result.push({
            itemDesc: labels.currentliabil.label,
            closingBalance: '',
            openBalance: '',
            isBold: labels.currentliabil.isBold,
            center: labels.currentliabil.center
        });
        //current liability child line
        var curliability = liabEquity.lia.curlia;
        for ( var curliaIdx in curliability) {
            var curliabilityRow = {};
            curliabilityRow.itemDesc = blank + curliability[curliaIdx].an;
            curliabilityRow.closingBalance = formatNumber(curliability[curliaIdx].cb);
            curliabilityRow.openBalance = formatNumber(curliability[curliaIdx].ob);
            curliabilityRow.isBold = false;
            result.push(curliabilityRow);
        }
        //current liability Total line
        result.push({
            itemDesc: labels.totalcurrentliabil.label,
            closingBalance: formatNumber(liabEquity.lia.total_curlia.cb),
            openBalance: formatNumber(liabEquity.lia.total_curlia.ob),
            isBold: labels.totalcurrentliabil.isBold,
            center: labels.totalcurrentliabil.center
        });

        //nonCurliability line
        result.push({
            itemDesc: labels.noncurrentliabil.label,
            closingBalance: '',
            openBalance: '',
            isBold: labels.noncurrentliabil.isBold,
            center: labels.noncurrentliabil.center
        });
        //nonCurliability child line
        var nonCurliability = liabEquity.lia.noncurlia;
        for ( var noncurliaIdx in nonCurliability) {
            var noncurliabilityRow = {};
            noncurliabilityRow.itemDesc = blank + nonCurliability[noncurliaIdx].an;
            noncurliabilityRow.closingBalance = formatNumber(nonCurliability[noncurliaIdx].cb);
            noncurliabilityRow.openBalance = formatNumber(nonCurliability[noncurliaIdx].ob);
            noncurliabilityRow.isBold = false;
            result.push(noncurliabilityRow);
        }
        //nonCurliability Total line
        result.push({
            itemDesc: labels.totalnoncurrentliabil.label,
            closingBalance: formatNumber(liabEquity.lia.total_noncurlia.cb),
            openBalance: formatNumber(liabEquity.lia.total_noncurlia.ob),
            isBold: labels.totalnoncurrentliabil.isBold,
            center: labels.totalnoncurrentliabil.center
        });

        //liability Total line
        result.push({
            itemDesc: labels.totalliability.label,
            closingBalance: formatNumber(liabEquity.total_lia.cb),
            openBalance: formatNumber(liabEquity.total_lia.ob),
            isBold: labels.totalliability.isBold,
            center: labels.totalliability.center
        });

        //equity line
        result.push({
            itemDesc: labels.equity.label,
            closingBalance: '',
            openBalance: '',
            isBold: labels.equity.isBold,
            center: labels.equity.center
        });
        var equity = liabEquity.equ;
        for ( var equityIdx in equity) {
            var equityRow = {};
            equityRow.itemDesc = blank + equity[equityIdx].an;
            equityRow.closingBalance = formatNumber(equity[equityIdx].cb);
            equityRow.openBalance = formatNumber(equity[equityIdx].ob);
            equityRow.isBold = false;
            result.push(equityRow);
        }
        //equity Total line
        result.push({
            itemDesc: labels.totalequity.label,
            closingBalance: formatNumber(liabEquity.total_equ.cb),
            openBalance: formatNumber(liabEquity.total_equ.ob),
            isBold: labels.totalequity.isBold,
            center: labels.totalequity.center
        });
        return result;
    }
    /**
     * @desc padding data sets with blank line.
     * @param {object} [dataSets] data sets need to be padding.
     * @param {number} [subLength] padding length.
     * @return {object} - data sets after padding.
     */
    function paddingDataSets(dataSets, subLength) {

        for (var i = 0; i < subLength; i++) {
            var blankLine = {
                itemDesc: '',
                closingBalance: '',
                openBalance: '',
                isBold: false,
                center: false
            };
            dataSets.push(blankLine);
        }
        return dataSets;
    }

    /**
     * @desc combine  data sets.
     * @param {array} [assetSets] data sets need to be combine.
     * @param {array} [liabEquitySets] data sets need to be combine.
     * @return {array} - data sets after combine.
     */
    function combineDataSets(assetSets, liabEquitySets) {
        var results = [];
        var lineNumber = 0;
        for ( var i in assetSets) {
            lineNumber = commons.toNumber(i) + 1;
            assetSets[i].lineNo = lineNumber;
            results.push(assetSets[i]);
        }

        for ( var j in liabEquitySets) {
            lineNumber = lineNumber + 1;
            liabEquitySets[j].lineNo = lineNumber;
            results.push(liabEquitySets[j]);
        }

        return results;
    }


    /**
     * @desc format number by system format and unit.
     * @param {number} [num] - number need to be format.
     * @return value after format.
     */
    function formatNumber(num) {

        if (!commons.makesure(num))
            return '';
        var result = num / _unit;
        if (!commons.makesure(result))
            return '';
        result = format.format({
            value: result,
            type: format.Type.CURRENCY
        //CURRENCY will display 2 digits, CURRENCY2 will display all digits.
        });

        return result;

    }


    return {
        getBLSheetData: getBLSheetData,
        formatNumber: formatNumber
    };

});
