/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define([ 'N/record', 'N/search', 'N/format' ],
		function(record, search, format) {
			/**
			 * Function to be executed after line is selected.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.currentRecord - Current form record
			 * @param {string}
			 *            scriptContext.sublistId - Sublist name
			 * 
			 * @since 2015.2
			 */
			function lineInit(context) {
				try {
					var currentRecord = context.currentRecord;
					var sublistName = context.sublistId;
					if (sublistName === 'inventoryassignment') {
						var exDate = currentRecord.getCurrentSublistValue({
							sublistId : 'inventoryassignment',
							fieldId : 'expirationdate'
						});
						if (exDate) {
							return;
						}
						var item = currentRecord.getValue({
							fieldId : 'item'
						});
						var days = search.lookupFields({
							type : 'item',
							id : item,
							columns : 'custitem_tn_item_expirationqtydate'
						});
						days = days.custitem_tn_item_expirationqtydate;
						if (!days) {
							return;
						}
						// days = days ? days : 0;
						days = parseInt(days);
						var tmpDate = search.lookupFields({
							type : 'customrecord_tn_tmp',
							id : '1',
							columns : 'custrecord_tn_tmp_date'
						});
						tmpDate = tmpDate.custrecord_tn_tmp_date;
						if (!tmpDate) {
							tmpDate = search.lookupFields({
								type : 'customrecord_tn_tmp',
								id : '1',
								columns : 'custrecord_tn_tmpdatemain'
							});
							tmpDate = tmpDate.custrecord_tn_tmpdatemain;
						}
						tmpDate = format.parse({
							value : tmpDate,
							type : format.Type.DATE
						});
						// alert(tmpDate);
						tmpDate.setDate(tmpDate.getDate() + days);
						currentRecord.setCurrentSublistValue({
							sublistId : 'inventoryassignment',
							fieldId : 'expirationdate',
							value : tmpDate
						});
					}
					// return true;
				} catch (e) {
					alert(e);
				}

			}
			/**
			 * Function to be executed after line is selected.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.currentRecord - Current form record
			 * @param {string}
			 *            scriptContext.sublistId - Sublist name
			 * 
			 * @since 2015.2
			 */
			function pageInit(context) {
				try {
					var currentRecord = context.currentRecord;
					// var externalid = currentRecord.getValue({
					// fieldId : 'externalid'
					// });
					// alert(externalid);
					// var tmpDate = search.lookupFields({
					// type : 'customrecord_tn_tmp',
					// id : '1',
					// columns : 'custrecord_tn_tmp_date'
					// });
					// alert(JSON.stringify(tmpDate));
					currentRecord.selectNewLine({
						sublistId : 'inventoryassignment'
					});
				} catch (e) {
					alert(e);
				}

			}
			/**
			 * Validation function to be executed when record is saved.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.currentRecord - Current form record
			 * @returns {boolean} Return true if record is valid
			 * 
			 * @since 2015.2
			 */
			function saveRecord(scriptContext) {
				var id = record.submitFields({
					type : 'customrecord_tn_tmp',
					id : '1',
					values : {
						custrecord_tn_tmp_date : ''
					}
				});
				return true;
			}
			return {
				saveRecord : saveRecord,
				lineInit : lineInit,
				pageInit : pageInit
			};
		});