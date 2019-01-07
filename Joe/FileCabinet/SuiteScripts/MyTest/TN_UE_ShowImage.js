/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/file' ],

function(record, file) {

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
	function beforeLoad(context) {
		if (context.type == context.UserEventType.VIEW) {
			try {
				var newRecord = context.newRecord;
				var lineCount = newRecord.getLineCount({
					sublistId : 'item'
				});
				var recType = newRecord.type;
				for (var i = 0; i < lineCount; i++) {
					var itemId = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'item',
						line : i
					});
					if (itemId == '') {
						return true;
					}
					var itemRecord = record.load({
						type : record.Type.INVENTORY_ITEM,
						id : itemId,
						isDynamic : true,
					});
					var imageId = itemRecord.getValue({// tupian
						fieldId : 'custitem_tn_image'
					});
					if (imageId != '') {
						var image = file.load({
							id : imageId
						});
						// log.debug({
						// title : 'imageurl' + i + ':' + image.url
						// });
						newRecord.setSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_opp_image',
							line : i,
							value : '<img height = "50" width = "50" src="'
									+ image.url + '">'
						});
						// newRecord.setSublistValue({
						// sublistId : 'item',
						// fieldId : 'custcol_tn_opp_image',
						// line : i,
						// value : String.format('<image src="{0}">',image.url)
						// });
					}

				}
			} catch (e) {
				log.debug({
					title : 'e:',
					details : e
				});
			}
		}
	}

	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {Record}
	 *            scriptContext.oldRecord - Old record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function beforeSubmit(context) {
		// if (context.type == context.UserEventType.VIEW) {
		// try {
		// var newRecord = context.newRecord;
		// var lineCount = newRecord.getLineCount({
		// sublistId : 'item'
		// });
		// var recType = newRecord.type;
		// for (var i = 0; i < lineCount; i++) {
		// var itemId = newRecord.getSublistValue({
		// sublistId : 'item',
		// fieldId : 'item',
		// line : i
		// });
		// if (itemId == '') {
		// return true;
		// }
		// var itemRecord = record.load({
		// type : record.Type.INVENTORY_ITEM,
		// id : itemId,
		// isDynamic : true,
		// });
		// var imageId = itemRecord.getValue({// tupian
		// fieldId : 'custitem_tn_image'
		// });
		// if (imageId != '') {
		// var image = file.load({
		// id : imageId
		// });
		// log.debug({
		// title : 'imageurl' + i + ':' + image.url
		// });
		// newRecord.setSublistValue({
		// sublistId : 'item',
		// fieldId : 'custcol_tn_opp_image',
		// line : i,
		// value : '<h1>aa</h1>'
		// });
		// }
		//
		// }
		// } catch (e) {
		// log.debug({
		// title : 'e:' + e
		// });
		// }
		// }
	}

	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {Record}
	 *            scriptContext.oldRecord - Old record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function afterSubmit(scriptContext) {

	}

	return {
		beforeLoad : beforeLoad
	// beforeSubmit : beforeSubmit
	// afterSubmit : afterSubmit
	};

});
