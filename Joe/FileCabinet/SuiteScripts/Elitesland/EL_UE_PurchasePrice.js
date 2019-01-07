/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/format'],

function(search, record, format) {
    /**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @param {Form}
	 *            scriptContext.form - Current form
	 * @Since 2015.2
	 */
    function afterSubmit(context) {
        if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
            var newRecord = context.newRecord;
            var vendor = newRecord.getValue({
                fieldId: 'custrecord_el_pp_vendor'
            });
            var item = newRecord.getValue({
                fieldId: 'custrecord_el_pp_item'
            });
            var area = newRecord.getValue({
                fieldId: 'custrecord_el_pp_area'
            });
            var subsidiary = newRecord.getValue({
                fieldId: 'custrecord_el_pp_subsidiary'
            });
            subsidiary = subsidiary ? subsidiary: '@NONE@';
            var shop = newRecord.getValue({
                fieldId: 'custrecord_el_pp_shop'
            });
            shop = shop ? shop: '@NONE@';
            var startDate = newRecord.getValue({
                fieldId: 'custrecord_el_pp_startdate'
            });
            // startDate = format.format({
            // value : startDate,
            // type : format.Type.DATE
            // });
            // var endDate = newRecord.getValue({
            // fieldId : ' custrecord_el_pp_enddate'
            // });
            var _filters = [['custrecord_el_pp_vendor', 'anyof', vendor], 'AND', ['custrecord_el_pp_item', 'anyof', item], 'AND', ['custrecord_el_pp_area', 'anyof', area], 'AND', ['custrecord_el_pp_subsidiary', 'anyof', subsidiary], 'AND', ['custrecord_el_pp_shop', 'anyof', shop], 'AND', ['internalid', 'noneof', newRecord.id]];
            // log.debug({
            // title : 'startDate',
            // details : startDate
            // });
            search.create({
                type: 'customrecord_el_purchaseprice',
                filters: _filters,
                columns: ['custrecord_el_pp_startdate', 'custrecord_el_pp_enddate']
            }).run().each(function(result) {
                var startDateHis = result.getValue(result.columns[0]);
                var endDateHis = result.getValue(result.columns[1]);
                startDateHis = format.parse({
                    value: startDateHis,
                    type: format.Type.DATE
                });
                endDateHis = format.parse({
                    value: endDateHis,
                    type: format.Type.DATE
                });
                // 判断时间区间，更新或删除历史数据
                if (startDateHis.getTime() == startDate.getTime()) { // 如果开始时间相等，则删除历史数据
                    var id = record.delete({
                        type: result.recordType,
                        id: result.id
                    });
                    log.debug({
                        title: 'deleteRecord',
                        details: result.id
                    });
                } else if (startDate.getTime() > startDateHis.getTime() && startDate.getTime() < endDateHis.getTime()) { // 如果startDateHis<startDate<endDateHis，则endDateHis=startDate-1
                    startDate = startDate.setDate(startDate.getDate() - 1);
                    endDateHis = format.format({
                        value: new Date(startDate),
                        type: format.Type.DATE
                    });
                    record.submitFields({
                        type: 'customrecord_el_purchaseprice',
                        id: result.id,
                        values: {
                            custrecord_el_pp_enddate: endDateHis
                        }
                    });

                }
                return true;
            });
        }
    }

    return {
        afterSubmit: afterSubmit
    }

});