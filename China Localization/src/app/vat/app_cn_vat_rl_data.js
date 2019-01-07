/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_search',
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../dao/helper/search_helper',
    '../../lib/commons',
    './app_cn_vat_label_parser',
    '../../dao/cn_vat_dao',
],

/**
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
function(search, runtime, helper, commons, labelParser, vatDao) {//get red letter data

    var _labels;

    var VAT_TYPE = [
        'Special VAT Invoice',
        'Common VAT Invoice'
    ];

    var error_types = {
        noApplied: 'noAppliedVAT',
        noVAT: 'noVATInfo',
        moreThanOne: 'moreThanOneAppliedVAT',
        sheetNoIsBlank: 'sheetNoIsBlank'
    }

    var CUSTOMER_REFERENCE = runtime.isFeatureInEffect('JOBS') ? 'customerMain' : 'customer';

    var _columns = {
        type: helper.column('type').create(),
        custType: helper.column('custentity_cn_vat_taxpayer_types').reference(CUSTOMER_REFERENCE).create(),
        sheetNo: helper.column('custbody_cn_info_sheet_number').create(),
        invoiceType: helper.column('custbody_cn_vat_invoice_type').create(),
        appliedId: helper.column('internalid').reference('appliedToTransaction').create(),
        custCreatedFromId: helper.column('custbody_cn_vat_createdfrom_id').create(),
        createdFrom: helper.column('createdfrom').create(),
    }

    var _vatColumns = {
        vatCode: helper.column('custrecord_cn_vat_invoice_code').create(),
        vatNo: helper.column('custrecord_cn_vat_invoice_number').create(),
        tranId: helper.column('custrecord_cn_invoice_type_fk_tran').create()
    }


    /**
     * get red letter  memo vat data for remark in export VAT file.
     * 
     * @param transaction internal id []
     * type = red letter vat type or 
     *      if red letter vat invoice type is null
     *          if customer type is general
     *             = special
     *          else(if is null, the customer will not show on ui)
     *             = common 
     * 
     * if type is special
     *      get INFORMATION SHEET NUMBER from China VAT tab
     * else type is common
     *      get VAT INVOICE CODE & number of all applied invoice
     *      validation
     *
     * return 
     * {'122':{'VATType':'Special VAT Invoice','VATCode':['sheetNumber'],'VATNumber':[],errorMsg:''},
     * '123':{'VATType':'Common VAT Invoice','VATCode':['invc001'],'VATNumber':['invn001'], errorMsg:''}}
     */
    function getRLVATData(transIds) {
        if (!commons.makesure(transIds))
            return null;

        log.debug('getRLVATData::param transIds', transIds);

        var rawRLTrans = queryTransactionData(transIds);

        log.debug('getRLVATData::rawRLTrans', rawRLTrans);

        //the formatted result red letter data
        var rlData = processRLTypes(rawRLTrans);

        var allAppliedIds = genAppliedIdList(rawRLTrans, rlData);
        var rawVATInfo = queryInvoicesData(allAppliedIds);
        log.debug('getRLVATData::rawVATInfo', rawVATInfo);
        processRLData(rawRLTrans, rawVATInfo, rlData);

        log.debug('getRLVATData::processed red letter data result', rlData);
        return rlData;
    }

    /**
     * process rlData, change values on rlData param. 
     * 
     * @param rawRLTrans red letter transactions resultset from search
     * @param rawVATInfo  applied transactions resultset from search
     * @param rlData result data will be processed. already have VATType.
     * @returns no return value.change values on rlData param.  
     */
    function processRLData(rawRLTrans, rawVATInfo, rlData) {


        _labels = labelParser.loadResourceFile();

        //map only include common type
        var appliedMap = genRLTransMap(rawRLTrans, rawVATInfo, rlData);
        log.debug('processRLData::appliedMap', appliedMap);
        for ( var i in rawRLTrans) {

            var id = rawRLTrans[i].id;
            rlData[id]['VATCode'] = [];
            rlData[id]['VATNumber'] = [];
            rlData[id]['errorMsg'] = '';

            if (isCommonVAT(rlData[id])) {
                var errorType = validateCommonVATCode(appliedMap[id]);
                if (errorType !== null) {
                    rlData[id]['errorMsg'] = getErrorMsg(errorType);
                } else {
                    convertCodeNumberArray(rlData[id], appliedMap[id]);
                }
            } else {
                rlData[id]['VATCode'] = [
                    rawRLTrans[i].getValue(_columns.sheetNo)
                ];
                var type = rawRLTrans[i].getValue(_columns.type);
                var sheetNo = rawRLTrans[i].getValue(_columns.sheetNo);
                if ((type === 'CustCred' || type === 'CashRfnd')&& !sheetNo )
                    {
                        rlData[id]['errorMsg'] = getErrorMsg(error_types.sheetNoIsBlank);
                    }

            }
        }

    }


    /**
     * generate map for processing the red letter /apply/vat data
     * 
     * @param rawRLTrans red letter transactions resultset from search
     * @param rawVATInfo  applied transactions resultset from search
     * @param rlData. use to check vattype. 
    
     * @returns
     *  a map: red letter data...applied transaction data...VAT data..
     *      structure: 
     *      {
     *      'red letter id 1': {
     *           'applied id 1': [
     *                   {
     *                       VATCode: 'Code001',
     *                       VATNumber: 'Number001'
     *                  },
     *                   {
     *                       VATCode: 'Code002',
     *                       VATNumber: 'Number002'
     *                   }
     *               ],
     *               'applied id 2': [{...}]
     *           }
     *       };
     */
    function genRLTransMap(rawRLTrans, rawVATInfo, rlData) {
        var rsMap = {};

        for ( var i in rawRLTrans) {
            var rlId = rawRLTrans[i].id;

            if (!isCommonVAT(rlData[rlId])) {
                continue;
            }

            var appliedId = getAppliedIdFromTrans(rawRLTrans[i]);
            if (!commons.makecertain(appliedId))// no apply will get a empty array [].
                continue;
            if (!commons.makecertain(rsMap[rlId]))
                rsMap[rlId] = {};
            rsMap[rlId][appliedId] = getVATSublist(appliedId, rawVATInfo);

        }

        return rsMap;
    }


    /**
     * get applied/created from id from raw transaction 
     * if type is credit memo, get column _columns.appliedId
     * else if type is cash refund get column _columns.createdFrom or _columns.custCreatedFromId. assume only one of the 2 field have value.
     * 
     * @param rawRLTrans
     * @returns applied id
     */
    function getAppliedIdFromTrans(rawRLTrans) {


        var type = rawRLTrans.getValue(_columns.type);
        var appliedId = rawRLTrans.getValue(_columns.appliedId);
        var createdFromId = rawRLTrans.getValue(_columns.createdFrom);
        var custCreatedFromId = rawRLTrans.getValue(_columns.custCreatedFromId);


        if (type === 'CashRfnd') {//credit memo also could have create from value
            if (commons.makesure(createdFromId))
                return createdFromId;

            if (commons.makesure(custCreatedFromId))
                return custCreatedFromId;
        }
        return appliedId;

    }
    /**
     * validate commont VAT code between applied transactions
     * @param appliedTs
     * applied map, key is applied trans id, value is vat info array:
     *  'applied id 1': [
     *                   {
     *                       VATCode: 'Code001',
     *                       VATNumber: 'Number001'
     *                  },
     *                   {
     *                       VATCode: 'Code002',
     *                       VATNumber: 'Number002'
     *                   }
     *               ],
     *               'applied id 2': [{...}]
     * 
     * @returns
     *          error code in error_types.
     *          null if no error.
     */
    function validateCommonVATCode(appliedTs) {
        // no applied. 
        if (!commons.makecertain(appliedTs)) {
            return error_types.noApplied;
        }

        var firstCode = '';
        var firstNumber = '';

        for ( var aId in appliedTs) {

            //have applied, but no Applied VAT sublist(no code/number)
            if (!commons.makecertain(appliedTs[aId]))
                return error_types.noVAT;

            //now only validate first line
            var currentCode = appliedTs[aId][0]['VATCode'];
            var currentNumber = appliedTs[aId][0]['VATNumber'];

            //applied, but no VAT sublist, same error 
            if (!commons.makesure(currentCode) || !commons.makesure(currentNumber)) {
                return error_types.noVAT;
            }

            if (firstCode === '') {
                firstCode = currentCode;
                firstNumber = currentNumber;

            } else if (firstCode !== currentCode || firstNumber !== currentNumber) {
                return error_types.moreThanOne;
            }

        }
        return null;
    }

    function getErrorMsg(errorType) {

        var error = _labels.errorMessage[errorType];
        return error;
    }


    /**
     * change the format to fit caller from of data_process
     * 
     * change [{VATCode:C1,VATNumber:N1},{VATCode:C2,VATNumber:N2}..]
     * to {VATCode:[N1,N2],VATNumber:[N1,N2]
    */
    function convertCodeNumberArray(rlDataLine, appliedTs) {

        for ( var appliedId in appliedTs) {
            setCodeNumber(rlDataLine, appliedTs[appliedId]);
            //now only return first apply. others must be the same with first.
            return;
        }
    }

    function setCodeNumber(rlDataLine, appliedTsLine) {
        for ( var j in appliedTsLine) {
            rlDataLine['VATCode'].push(appliedTsLine[j]['VATCode']);
            rlDataLine['VATNumber'].push(appliedTsLine[j]['VATNumber']);
        }

    }


    /**
     * get sublist with applied id
     * 
     * [
     * {VATCode:'Code001',VATNumber:'Number001'},
     * {VATCode:'Code002',VATNumber:'Number002'},
     * ]
     */

    function getVATSublist(appliedId, rawVATInfo) {

        var result = [];
        for ( var i in rawVATInfo) {
            var rawAppliedId = rawVATInfo[i].getValue(_vatColumns.tranId);
            if (appliedId !== rawAppliedId) {
                continue;
            }
            result.push({
                'VATCode': rawVATInfo[i].getValue(_vatColumns.vatCode),
                'VATNumber': rawVATInfo[i].getValue(_vatColumns.vatNo)
            });
        }
        return result;
    }


    function isCommonVAT(trLine) {
        var rs = VAT_TYPE.indexOf(trLine['VATType']) === 1;
        return rs;
    }

    /**
     * determine red letter VAT type, create&return a new object.
     * @param rawRLTrans
     * @returns {red letter id : {'VATType': 'Special VAT Invoice / Common VAT Invoice'}}
     */
    function processRLTypes(rawRLTrans) {
        var result = {};
        for ( var i in rawRLTrans) {
            result[rawRLTrans[i].id] = {
                'VATType': determineInvoiceType(rawRLTrans[i])
            };
        }
        return result;
    }

    /**
     * generate applied/created from id list
     * 
     * @param rawRLTrans
     * @param rlData
     * @returns
     */
    function genAppliedIdList(rawRLTrans, rlData) {

        var appliedIdList = [];

        for ( var i in rawRLTrans) {
            var id = rawRLTrans[i].id;
            if (!isCommonVAT(rlData[id])) {
                continue;
            }

            var appliedId = getAppliedIdFromTrans(rawRLTrans[i]);
            if (commons.makesure(appliedId))
                appliedIdList.push(appliedId);

        }
        return appliedIdList;
    }


    //return vat type text
    function determineInvoiceType(rlTrans) {
        var custType = rlTrans.getValue(_columns.custType);
        var VATType = rlTrans.getValue(_columns.invoiceType);
        //custom list value is internal id, start from 1.
        // 1 is general/special 2 is small-scale/common
        var rsVATValue = commons.makesure(VATType)
            ? parseInt(VATType) : parseInt(custType);

        var rsVATType = VAT_TYPE[rsVATValue - 1];
        return rsVATType;

    }


    function queryTransactionData(transIds) {
        if (!commons.makesure(transIds))
            return null;

        var trSearch = search.create({
            type: search.Type.TRANSACTION,
            columns: columns(),
            filters: [
                helper.filter('mainline').is('T'),
                helper.filter('internalid').anyof(transIds)
            ]
        })

        var rs = trSearch.run().getRange({
            start: 0,
            end: 1000
        }) || [];

        return rs;

    }


    function queryInvoicesData(transIds) {
        if (!commons.makesure(transIds))
            return null;



        return vatDao.getVATByRecId(transIds);

    }

    function columns() {
        var rs = []
        for ( var c in _columns) {
            rs.push(_columns[c]);
        }
        return rs;
    }


    return {
        getRLVATData: getRLVATData,
        //below for UT
        processRLData: processRLData,
        validateCommonVATCode: validateCommonVATCode,
        determineInvoiceType: determineInvoiceType,
        processRLTypes: processRLTypes,
        genAppliedIdList: genAppliedIdList,
        queryTransactionData: queryTransactionData
    };

});
