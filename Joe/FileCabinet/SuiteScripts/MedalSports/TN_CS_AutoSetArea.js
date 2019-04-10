/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define(
		[ 'N/record', 'N/search', 'N/currency' ],
		function(record, search, currency) {
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
			 *            scriptContext.lineNum - Line number. Will be undefined
			 *            if not a sublist or matrix field
			 * 
			 * @since 2015.2
			 */
			function fieldChanged(context) {
				try {
					var currentRecord = context.currentRecord;
					var sublistFieldName = context.fieldId;
					// entity变化监听事件 20180516
					if (((currentRecord.type == 'vendor' || currentRecord.type == 'customer') && sublistFieldName == 'custentity_tn_entityf_entity')
							|| sublistFieldName == 'custbody_tn_entity') {
						var areaId = 'custbody_cseg_tn_area';
						if (currentRecord.type == 'vendor'
								|| currentRecord.type == 'customer') {
							areaId = 'custentity_cseg_tn_area';
						}
						// alert(sublistFieldName);
						var entity = currentRecord.getValue({
							fieldId : sublistFieldName
						});
						if (!entity) {
							return;
						}
						// alert(entity);
						var entityRecord = record.load({
							type : 'customrecord_tn_subsidiaryinfo',
							id : entity,
							isDynamic : true,
						});
						var entityAddress = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiaryaddr'
						});
						var entityPhone = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiaryphone'
						});
						var entityZip = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiary_zip'
						});
						var entityContact = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiarycontact'
						});
						var entityFax = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiaryfax'
						});
						var entityEmail = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiaryemail'
						});
						var entityArea = entityRecord.getValue({
							fieldId : 'custrecord_52_cseg_tn_area'
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiaryaddr',
							value : entityAddress
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiaryphone',
							value : entityPhone
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiary_zip',
							value : entityZip
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiarycontact',
							value : entityContact
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiaryfax',
							value : entityFax
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiaryemail',
							value : entityEmail
						});
						currentRecord.setValue({
							fieldId : areaId,
							value : entityArea
						});
					}

				} catch (e) {
					alert(e);
				}

			}
			var intLine = 1;

			/**
			 * Validation function to be executed when sublist line is
			 * committed.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.currentRecord - Current form record
			 * @param {string}
			 *            scriptContext.sublistId - Sublist name
			 * 
			 * @returns {boolean} Return true if sublist line is valid
			 * 
			 * @since 2015.2
			 */
			function validateLine(scriptContext) {
				var currentRecord = scriptContext.currentRecord;
				var sublistName = scriptContext.sublistId;
				if (sublistName === 'item') {
					var uniqueId = currentRecord.getCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_uniqueid'
					});
					if (uniqueId) {
						return true;
					}
					currentRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_uniqueid',
						value : intLine
					});
					intLine += 1;
				}
				return true;
			}
			return {
				fieldChanged : fieldChanged,
				validateLine : validateLine
			};
		});