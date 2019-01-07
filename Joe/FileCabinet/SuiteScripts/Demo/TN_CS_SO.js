/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord payment billpayment
 */
define(
		[ 'N/record', 'N/search', 'N/format' ],
		function(record, search, format) {
			/**
			 * Validation function to be executed when field is changed.
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
			 * @param {number}
			 *            scriptContext.columnNum - Line number. Will be
			 *            undefined if not a matrix field
			 * 
			 * @returns {boolean} Return true if field is valid
			 * 
			 * @since 2015.2
			 */
			function validateField(context) {
				var currentRecord = context.currentRecord;
				var sublistName = context.sublistId;
				var sublistFieldName = context.fieldId;
				if (sublistFieldName === 'entity') {
					var entity = currentRecord.getValue({
						fieldId : 'entity'
					});
					var recType;
					var hint;
					if (currentRecord.type == record.Type.SALES_ORDER) {
						recType = record.Type.CUSTOMER;
						hint = 'No valid customer license';
					} else if (currentRecord.type == record.Type.PURCHASE_ORDER) {
						recType = record.Type.VENDOR;
						hint = 'No valid vendor license';
					} else {
						return true;
					}
					var cusRecord = record.load({
						type : recType,
						id : entity
					});
					var validFrom = cusRecord.getValue({
						fieldId : 'custentity_tn_valfrom'
					});
					var validTo = cusRecord.getValue({
						fieldId : 'custentity_tn_valto'
					});
					if ((validFrom <= new Date() && new Date() <= validTo)
							|| (!validFrom && !validTo)) {
						return true;
					} else {
						alert(hint);
						return false;
					}
				}
				return true;
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
			function saveRecord(context) {
				var currentRecord = context.currentRecord;
				var cusPass = true;
				var itemPass = true;
				var entity = currentRecord.getValue({
					fieldId : 'entity'
				});
				var recType;
				var hint;
				if (currentRecord.type == record.Type.ITEM_FULFILLMENT
						|| currentRecord.type == record.Type.SALES_ORDER) {
					hint = 'No valid customer license';
					if (currentRecord.type == record.Type.SALES_ORDER) {
						recType = record.Type.CUSTOMER;
					}
				}
				if (currentRecord.type == record.Type.PURCHASE_ORDER
						|| currentRecord.type == record.Type.ITEM_RECEIPT) {
					hint = 'No valid vendor license';
					if (currentRecord.type == record.Type.PURCHASE_ORDER) {
						recType = record.Type.VENDOR;
					}
				}
				if (recType) {
					var cusRecord = record.load({
						type : recType,
						id : entity
					});
					var validFrom = cusRecord.getValue({
						fieldId : 'custentity_tn_valfrom'
					});
					var validTo = cusRecord.getValue({
						fieldId : 'custentity_tn_valto'
					});
					if ((validFrom <= new Date() && new Date() <= validTo)
							|| (!validFrom && !validTo)) {
						cusPass = true;
					} else {
						// alert('No valid customer license');
						cusPass = false;
					}
				}

				//

				var numLines = currentRecord.getLineCount({
					sublistId : 'item'
				});
				for (var i = 0; i < numLines; i++) {
					var itemId = currentRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'item',
						line : i
					});
					var validFrom;
					var validTo;
					search.create(
							{
								type : search.Type.ITEM,
								filters : [ 'internalid', 'is', itemId ],
								columns : [ 'custitem_tn_item_valfrom',
										'custitem_tn_item_valto' ]
							}).run().each(function(result) {
						validFrom = result.getValue({
							name : 'custitem_tn_item_valfrom'
						});
						validTo = result.getValue({
							name : 'custitem_tn_item_valto'
						});
						return true;
					});
					if (validFrom && validTo) {
						validFrom = format.parse({
							value : validFrom,
							type : format.Type.DATE
						})
						validTo = format.parse({
							value : validTo,
							type : format.Type.DATE
						})
						var _date = new Date();
						if (currentRecord.type == record.Type.ITEM_RECEIPT) {
							_date = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_prodate',
								line : i
							});
							// alert(_date);
						}
						if (!(validFrom <= _date && _date <= validTo)) {
							itemPass = false;
							break;
						}
					}

				}
				// alert(itemPass);
				// alert(cusPass);
				if (cusPass && itemPass) {
					return true;
				} else {
					alert(hint);
					return false;
				}
			}
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
			function validateLine(context) {
				var currentRecord = context.currentRecord;
				var sublistName = context.sublistId;
				if (currentRecord.type == record.Type.SALES_ORDER) {
					recType = record.Type.CUSTOMER;
					hint = 'No valid customer license';
				} else if (currentRecord.type == record.Type.PURCHASE_ORDER) {
					recType = record.Type.VENDOR;
					hint = 'No valid vendor license';
				} else {
					return true;
				}
				if (sublistName === 'item') {
					var itemId = currentRecord.getCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'item'
					});
					var validFrom;
					var validTo;
					search.create(
							{
								type : search.Type.ITEM,
								filters : [ 'internalid', 'is', itemId ],
								columns : [ 'custitem_tn_item_valfrom',
										'custitem_tn_item_valto' ]
							}).run().each(function(result) {
						validFrom = result.getValue({
							name : 'custitem_tn_item_valfrom'
						});
						validTo = result.getValue({
							name : 'custitem_tn_item_valto'
						});
						return true;
					});
					validFrom = format.parse({
						value : validFrom,
						type : format.Type.DATE
					})
					validTo = format.parse({
						value : validTo,
						type : format.Type.DATE
					})
					// alert(validFrom);
					// alert(validTo);
					if (validFrom && validTo) {
						if (validFrom <= new Date() && new Date() <= validTo) {
							return true;
						} else {
							alert(hint);
							return false;
						}
					} else {
						return true;
					}
				}
				return true;
			}
			return {
				validateField : validateField,
				saveRecord : saveRecord,
				validateLine : validateLine
			};
		});