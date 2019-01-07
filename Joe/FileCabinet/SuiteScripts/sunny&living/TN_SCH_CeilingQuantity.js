/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/search' ], function(record, search) {

	/**
	 * Definition of the Scheduled script trigger point.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {string}
	 *            scriptContext.type - The context in which the script is
	 *            executed. It is one of the values from the
	 *            scriptContext.InvocationType enum.
	 * @Since 2015.2
	 */
	function execute(scriptContext) {
		// if (scriptContext.type ==
		// scriptContext.InvocationType.ON_DEMAND) {
		try {
			// WO
			var date = new Date();// 获取当前时间
			// date.setDate(date.getDate() - 1);// 设置天数 -1 天
			date.setDate(date.getDate() - 3);// 设置天数 -3 天 20180611
			var time = date.getDate() + '/' + (date.getMonth() + 1) + '/'
					+ date.getFullYear();
			var WOSearch = search.create({
				type : search.Type.WORK_ORDER,
				filters : [ [ 'mainline', 'is', 'T' ], 'AND',
						[ 'taxline', 'is', 'F' ], 'AND',
						[ 'trandate', 'onorafter', time ] ],
				columns : [ 'internalid', 'tranid' ]
			});
			var searchResult = WOSearch.run().getRange({
				start : 0,
				end : 1000
			})
			var poIds = [];
			// log.debug({
			// title : 'searchResult.length',
			// details : searchResult.length
			// });
			for (var i = 0; i < searchResult.length; i++) {
				var recordId = searchResult[i].id;
				var tranid = searchResult[i].getValue({
					name : 'tranid'
				});
				// if (tranid === 'WO-18-001241') {
				// log.debug({
				// title : 'tranid',
				// details : tranid
				// });
				var WORec = record.load({
					type : record.Type.WORK_ORDER,
					id : recordId
				});
				var lineCount = WORec.getLineCount({
					sublistId : 'item'
				});
				for (var j = 0; j < lineCount; j++) {
					var poId = WORec.getSublistValue({
						sublistId : 'item',
						fieldId : 'poid',
						line : j
					});

					if (poId && poIds.indexOf(poId) == -1) {
						poIds.push(poId);
					}
				}
				calculate(WORec);
				WORec.save({
					ignoreMandatoryFields : true
				});

				// }

			}
			// log.debug({
			// title : 'poIds',
			// details : poIds
			// });
			poIds.forEach(function(poId) {
				var poRec = record.load({
					type : record.Type.PURCHASE_ORDER,
					id : poId
				});
				calculate(poRec);
				poRec.save({
					ignoreMandatoryFields : true
				});
			});

		} catch (e) {
			log.debug({
				title : 'execute',
				details : e
			});
		}
	}
	function calculate(newRecord) {
		var lineCount = newRecord.getLineCount({
			sublistId : 'item'
		});
		var recType = newRecord.type;

		for (var i = 0; i < lineCount; i++) {
			var ctnQty = newRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_tn_carton_qty',
				line : i
			});
			var packSize = newRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_tn_pack_size',
				line : i
			});
			var quantity = newRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'quantity',
				line : i
			});
			var oldQty = quantity;

			if (quantity !== '') {
				quantity = Math.ceil(quantity);
				if (oldQty != quantity) {
					newRecord.setSublistValue({
						sublistId : 'item',
						fieldId : 'quantity',
						line : i,
						value : quantity
					});
				}
			}

			if (packSize && quantity !== '' && ctnQty === '') {
				ctnQty = (quantity * 100) / (packSize * 100);
				newRecord.setSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_carton_qty',
					line : i,
					value : ctnQty
				});
			} else if (ctnQty && quantity !== '' && packSize === '') {
				packSize = (quantity * 100) / (ctnQty * 100);
				newRecord.setSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_pack_size',
					line : i,
					value : packSize
				});
			} else if (ctnQty !== '' && packSize !== '' && quantity === '') {
				quantity = ctnQty * packSize;
				quantity = Math.ceil(quantity);
				newRecord.setSublistValue({
					sublistId : 'item',
					fieldId : 'quantity',
					line : i,
					value : quantity
				});
			}
		}

		return newRecord;
	}
	return {
		execute : execute
	};

});
