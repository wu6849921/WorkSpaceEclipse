/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define(['N/search', 'N/format'],
function(search, format) {
    /**
	 * Function to be executed when field is changed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * @param {string}
	 *            scriptContext.fieldId - Field name
	 * @param {number}
	 *            scriptContext.lineNum - Line number. Will be undefined if not
	 *            a sublist or matrix field
	 * 
	 * @since 2015.2
	 */
    function fieldChanged(context) {
        try {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var sublistFieldName = context.fieldId;
            if (sublistName === 'item') {
                if (sublistFieldName === 'custcol_including_tax_unit_price') { // 含税单价计算出不含税单价
                    var item = currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: 'item'
                    });
                    var vendor = currentRecord.getValue({
                        fieldId: 'entity'
                    });
                    var taxPrice = currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: sublistFieldName
                    });
                    var taxRate = currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: 'taxrate1'
                    });
                    if (taxRate) {
                        taxPrice = taxPrice / (1 + taxRate / 100);
                    }
                    currentRecord.setCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: 'rate',
                        value: taxPrice
                    });
                }
                if (sublistFieldName === 'quantity') {
                	var item = currentRecord.getCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: 'item'
                    });
                    var vendor;
                    if (currentRecord.type == 'salesorder') {
                        vendor = currentRecord.getValue({
                            fieldId: 'custbody_el_vendorinner'
                        });
                    } else {
                        vendor = currentRecord.getValue({
                            fieldId: 'entity'
                        });
                    }
                    var subInner = currentRecord.getValue({
                        fieldId: 'custbody_el_subsidiaryinner'
                    });
                    if (!item) {
                        return;
                    }
                    // 如果是SO，则特殊处理
                    if (currentRecord.type == 'salesorder' && (!subInner || !vendor)) {
                   	 currentRecord.setCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'taxcode',
                            value: 5
                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'custcol_including_tax_unit_price',
                            value: 0,
                            ignoreFieldChange: true
                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'rate',
                            value: 0
                        });
                       return;
                   }
                    var priceAndCode = getTaxPriceAndCode(currentRecord, format, search, item, vendor);
// alert(priceAndCode);
                    if (priceAndCode.length > 0) { // 如果有结果
                        currentRecord.setCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'taxcode',
                            value: priceAndCode[1]
                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'custcol_including_tax_unit_price',
                            value: priceAndCode[0]
                        });
                    } else {
                        currentRecord.setCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'taxcode',
                            value: 5
                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'custcol_including_tax_unit_price',
                            value: 0,
                            ignoreFieldChange: true
                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId: sublistName,
                            fieldId: 'rate',
                            value: 0
                        });
                    }
                }
            }
            if (sublistFieldName === 'subsidiary') {
                var subsidiary = currentRecord.getValue({
                    fieldId: 'subsidiary'
                });
                var conlumnsInit=currentRecord.type == 'salesorder'?['custrecord_vendor_num']:['custrecord_customer_num'];
                    var entity;
                    search.create({
                        type: 'customrecord_merchants_configuration',
                        filters: ['custrecord_corporation', 'anyof', subsidiary],
                        columns: conlumnsInit
                    }).run().each(function(result) {
                    	entity = result.getValue(result.columns[0]);
                        return true;
                    });
                    // alert(JSON.stringify(subArea.custrecord_area));
                    var entityFeild=currentRecord.type == 'salesorder'?'custbody_el_vendorinner':'custbody_el_customerinner';
                    if (entity) {
                        currentRecord.setValue({
                            fieldId: entityFeild,
                            value: entity
                        });
                    }else{
                    	currentRecord.setValue({
                            fieldId: entityFeild,
                            value: ''
                        });
                    }
                var area = currentRecord.getValue({
                    fieldId: 'custbody_el_area'
                });
                if (area || !subsidiary) {
                    return;
                }
                var subArea = search.lookupFields({
                    type: search.Type.SUBSIDIARY,
                    id: subsidiary,
                    columns: ['custrecord_area']
                });
                // alert(JSON.stringify(subArea.custrecord_area));
                if (subArea.custrecord_area.length > 0) {
                    subArea = subArea.custrecord_area[0].value;
                    currentRecord.setValue({
                        fieldId: 'custbody_el_area',
                        value: subArea
                    });
                }
            }
            // 判断是否内部交易
            if (sublistFieldName === 'entity') {
            	var entity = currentRecord.getValue({
            		fieldId: 'entity'
            	});
            	var filterInit=currentRecord.type == 'salesorder'?['custrecord_customer_num', 'anyof', entity]:['custrecord_vendor_num', 'anyof', entity];
                var subsidiary;
                search.create({
                    type: 'customrecord_merchants_configuration',
                    filters: filterInit,
                    columns: ['custrecord_corporation']
                }).run().each(function(result) {
                    subsidiary = result.getValue(result.columns[0]);
                    return true;
                });
                // alert(JSON.stringify(subArea.custrecord_area));
                if (subsidiary) {
                    currentRecord.setValue({
                        fieldId: 'custbody_el_subsidiaryinner',
                        value: subsidiary
                    });
                }else {
                	 currentRecord.setValue({
                         fieldId: 'custbody_el_subsidiaryinner',
                         value: ''
                     });
				}
            }
        } catch(e) {
            alert(e);
        }

    }
    /**
	 * Function to be executed when field is slaved.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * @param {string}
	 *            scriptContext.fieldId - Field name
	 * 
	 * @since 2015.2
	 */
    function postSourcing(context) {
        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
        if (sublistName === 'item' && sublistFieldName === 'item') { // 选择item带出对应价格
// alert(1);
        	var item = currentRecord.getCurrentSublistValue({
                sublistId: sublistName,
                fieldId: sublistFieldName
            });
            var vendor;
            if (currentRecord.type == 'salesorder') {
                vendor = currentRecord.getValue({
                    fieldId: 'custbody_el_vendorinner'
                });
            } else {
                vendor = currentRecord.getValue({
                    fieldId: 'entity'
                });
            }
            var subInner = currentRecord.getValue({
                fieldId: 'custbody_el_subsidiaryinner'
            });
            if (!item) {
                return;
            }
            // 如果是SO，则特殊处理
            if (currentRecord.type == 'salesorder' && (!subInner || !vendor)) {
            	 currentRecord.setCurrentSublistValue({
                     sublistId: sublistName,
                     fieldId: 'taxcode',
                     value: 5
                 });
                 currentRecord.setCurrentSublistValue({
                     sublistId: sublistName,
                     fieldId: 'custcol_including_tax_unit_price',
                     value: 0,
                     ignoreFieldChange: true
                 });
                 currentRecord.setCurrentSublistValue({
                     sublistId: sublistName,
                     fieldId: 'rate',
                     value: 0
                 });
                return;
            }
            var priceAndCode = getTaxPriceAndCode(currentRecord, format, search, item, vendor);
            if (priceAndCode.length > 0) { // 如果有结果
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'taxcode',
                    value: priceAndCode[1]
                });
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_including_tax_unit_price',
                    value: priceAndCode[0]
                });
            } else {
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'taxcode',
                    value: 5
                });
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'custcol_including_tax_unit_price',
                    value: 0,
                    ignoreFieldChange: true
                });
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'rate',
                    value: 0
                });
            }

            // var currIndex = currentRecord.getCurrentSublistIndex({
            // sublistId: 'item'
            // });
            // alert(currIndex);
            // var taxPriceField = currentRecord.getSublistField({
            // sublistId: 'item',
            // fieldId: 'custcol_including_tax_unit_price',
            // line: parseInt(currIndex)+1
            // });
            // taxPriceField.isDisabled=ture;
        }
    }

    function getTaxPriceAndCode(currentRecord, format, search, item, vendor) {
        var priceAndCode = [];
        var taxPrice;
        var taxCode;
        var area = currentRecord.getValue({
            fieldId: 'custbody_el_area'
        });
        var subsidiary;
        if (currentRecord.type == 'salesorder') {
            subsidiary = currentRecord.getValue({
                fieldId: 'custbody_el_subsidiaryinner'
            });
        } else {
            subsidiary = currentRecord.getValue({
                fieldId: 'subsidiary'
            });
        }
        var store = currentRecord.getValue({
            fieldId: 'cseg_the_store'
        });
        var tranDate = currentRecord.getValue({
            fieldId: 'trandate'
        });
        tranDate = format.format({
            value: tranDate,
            type: format.Type.DATE
        });
        if (store) {
            var _filters1 = [['custrecord_el_pp_vendor', 'anyof', vendor], 'AND', ['custrecord_el_pp_item', 'anyof', item], 'AND', ['custrecord_el_pp_startdate', 'onorbefore', tranDate], 'AND', ['custrecord_el_pp_enddate', 'onorafter', tranDate], 'AND', ['custrecord_el_pp_shop', 'anyof', store]];
        }
        // var _filters1 = [['custrecord_el_pp_vendor', 'anyof',
        // vendor], 'AND',
        // ['custrecord_el_pp_item', 'anyof', item], 'AND',
        // ['custrecord_el_pp_shop',
        // 'anyof', store]];
        var _filters2 = [['custrecord_el_pp_vendor', 'anyof', vendor], 'AND', ['custrecord_el_pp_item', 'anyof', item], 'AND', ['custrecord_el_pp_startdate', 'onorbefore', tranDate], 'AND', ['custrecord_el_pp_enddate', 'onorafter', tranDate], 'AND', ['custrecord_el_pp_subsidiary', 'anyof', subsidiary]];
        if (area) {
            var _filters3 = [['custrecord_el_pp_vendor', 'anyof', vendor], 'AND', ['custrecord_el_pp_item', 'anyof', item], 'AND', ['custrecord_el_pp_startdate', 'onorbefore', tranDate], 'AND', ['custrecord_el_pp_enddate', 'onorafter', tranDate], 'AND', ['custrecord_el_pp_area', 'anyof', area]];
        }
        var taxPrice;
        var taxCode;
        if (store) {
            search.create({
                type: 'customrecord_el_purchaseprice',
                filters: _filters1,
                columns: ['custrecord_el_pp_taxrate', 'custrecord_el_pp_taxcode']
            }).run().each(function(result) {
                taxPrice = result.getValue(result.columns[0]);
                taxCode = result.getValue(result.columns[1]);
                return true;
            });
        }
        if (!taxPrice && !taxCode) {
            search.create({
                type: 'customrecord_el_purchaseprice',
                filters: _filters2,
                columns: ['custrecord_el_pp_taxrate', 'custrecord_el_pp_taxcode']
            }).run().each(function(result) {
                taxPrice = result.getValue(result.columns[0]);
                taxCode = result.getValue(result.columns[1]);
                return true;
            });
        }
        if (!taxPrice && !taxCode && area) {
            search.create({
                type: 'customrecord_el_purchaseprice',
                filters: _filters3,
                columns: ['custrecord_el_pp_taxrate', 'custrecord_el_pp_taxcode']
            }).run().each(function(result) {
                taxPrice = result.getValue(result.columns[0]);
                taxCode = result.getValue(result.columns[1]);
                return true;
            });
        }
        if (taxPrice && taxCode) {
            priceAndCode.push(taxPrice);
            priceAndCode.push(taxCode);
        }
        return priceAndCode;

    }
    return {
        fieldChanged: fieldChanged,
        postSourcing: postSourcing
    };
});