/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record' ], function(record) {
	function afterSubmit(context) {
		try {
			if (context.type == context.UserEventType.CREATE
					|| context.type == context.UserEventType.EDIT) {
				var newRecord = context.newRecord;
				var customerInner = newRecord.getValue({
					fieldId : 'custbody_el_customerinner'
				});
				var subsidiaryInner = newRecord.getValue({
					fieldId : 'custbody_el_subsidiaryinner'
				});
				var soInner = newRecord.getValue({
					fieldId : 'custbody_el_salesorderinner'
				});
				var currency = newRecord.getValue({
					fieldId : 'currency'
				});
				var exchangeRate = newRecord.getValue({
					fieldId : 'exchangerate'
				});
				var lineCount = newRecord.getLineCount({
					sublistId : 'item'
				});
				if ((!customerInner || !subsidiaryInner) && soInner) {
					return;
				}
				// 创建SO
				var soRecord = record.create({
					type : record.Type.SALES_ORDER,
					isDynamic : true,
					defaultValues : {
						entity : customerInner
					}
				});
				soRecord.setValue({
					fieldId : 'subsidiary',
					value : subsidiaryInner
				});
				soRecord.setValue({
					fieldId : 'currency',
					value : currency
				});
				soRecord.setValue({
					fieldId : 'exchangeRate',
					value : exchangeRate
				});
				for (var i = 0; i < lineCount; i++) {
					var item = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'item',
						line : i
					});
					var quantity = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'quantity',
						line : i
					});
					var rate = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'rate',
						line : i
					});
					var rateTax = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_including_tax_unit_price',
						line : i
					});
					var taxCode = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'taxcode',
						line : i
					});
					soRecord.selectNewLine({
						sublistId : 'item'
					});
					soRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'item',
						value : item
					});
					soRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'quantity',
						value : quantity
					});
					soRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'rate',
						value : rate
					});
					soRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_including_tax_unit_price',
						value : rateTax
					});
					soRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'taxcode',
						value : taxCode
					});
					soRecord.commitLine({
						sublistId : 'item'
					});
				}
				var soId = soRecord.save({
					ignoreMandatoryFields : true
				});

				// 生成之后回写到PO
				if (soId) {
					var objRecord = record.load({
						type : 'purchaseorder',
						id : newRecord.id
					});
					objRecord.setValue({
						fieldId : 'custbody_el_salesorderinner',
						value : soId
					});
					objRecord.save({
						ignoreMandatoryFields : true
					});
				}
			}
		} catch (e) {
			log.debug({
				title : 'afterSubmit',
				details : e
			});
		}

	}

	return {
		afterSubmit : afterSubmit
	};

});