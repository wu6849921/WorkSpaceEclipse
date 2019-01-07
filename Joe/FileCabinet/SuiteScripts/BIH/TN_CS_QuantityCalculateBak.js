/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180305
 */
define(
		[ 'N/record', 'N/search' ],
		function(record, search) {
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
			 * @param {number}
			 *            scriptContext.columnNum - Line number. Will be
			 *            undefined if not a matrix field
			 * 
			 * @since 2015.2
			 */
			function fieldChanged(context) {
				var currentRecord = context.currentRecord;
				var sublistName = context.sublistId;
				var sublistFieldName = context.fieldId;
				var numLines = currentRecord.getLineCount({
					sublistId : 'item'
				});

				// PO
				if ((sublistName === 'item' && sublistFieldName === 'custcol_purordpurchasequantity')
						|| sublistFieldName === 'custbody_purordpurchaseperiod') {// �ɹ�����
					// ��Ҫ��ѯitem��quantity����С������ֵ��Ӧ�õ�custcol_purordpurchasequantity
					// Quantity = �ɹ�����*�ɹ�����
					var quantity;
					var purchasePeriod = currentRecord.getText({// �ɹ�����
						fieldId : 'custbody_purordpurchaseperiod'
					});
					purchasePeriod = purchasePeriod.substring(0,
							purchasePeriod.length - 2);
					var purchaseQuantity = currentRecord
							.getCurrentSublistValue({// �ɹ�����
								sublistId : 'item',
								fieldId : 'custcol_purordpurchasequantity'
							});
					if (purchaseQuantity != '' && purchasePeriod != '') {
						quantity = purchaseQuantity * purchasePeriod;
					}
					currentRecord.setCurrentSublistValue({// Quantity
						sublistId : 'item',
						fieldId : 'quantity',
						value : quantity
					});

				}

				// SO QO
				if ((sublistName === 'item' && sublistFieldName === 'custcol_xsdd_gmsl')
						|| sublistFieldName === 'custbody_soproductserviceperiod') {
					// 2��Quantity = ��������*��������
					var quantity;
					// var servicePeriod = currentRecord.getValue({// ��������
					// fieldId : 'custbody_soproductserviceperiod'
					// });
					var servicePeriod = currentRecord.getText({// ��������
						fieldId : 'custbody_soproductserviceperiod'
					});
					servicePeriod = servicePeriod.substring(0,
							servicePeriod.length - 2);
					// alert(servicePeriod);

					var buyQuantity = currentRecord.getCurrentSublistValue({// �ɹ�����
						sublistId : 'item',
						fieldId : 'custcol_xsdd_gmsl'
					});
					if (buyQuantity != '' && servicePeriod != '') {
						quantity = buyQuantity * servicePeriod;
					}
					currentRecord.setCurrentSublistValue({// Quantity
						sublistId : 'item',
						fieldId : 'quantity',
						value : quantity
					});

				}
			}
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
			function validateField(scriptContext) {
				var currentRecord = scriptContext.currentRecord;
				var sublistName = scriptContext.sublistId;
				var sublistFieldName = scriptContext.fieldId;
				var line = scriptContext.line;
				if (sublistName === 'item') {
					if (sublistFieldName === 'custcol_xsdd_gmsl') {
						var buyQuantity = currentRecord
								.getCurrentSublistValue({// ��������
									sublistId : 'item',
									fieldId : 'custcol_xsdd_gmsl'
								});
						if (buyQuantity) {

							// 1����Ҫ��ѯitem��quantity����С������ֵ��Ӧ�õ�custcol_xsdd_gmsl
							var itemId = currentRecord.getCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'item'
							});
							if (itemId == '') {
								return true;
							}
							// alert(itemId);
							try {
								var itemRecord = record.load({
									type : record.Type.SERVICE_ITEM,
									id : itemId,
									isDynamic : true,
								});
							} catch (e) {
								return true;
							}
							var minimumQuantity = itemRecord.getValue({// ��С����
								fieldId : 'minimumquantity'
							});
							// alert(minimumQuantity);
							if (minimumQuantity != ''
									&& buyQuantity < minimumQuantity) {
								alert('������������С��' + minimumQuantity);
								return false;
							}
						}
					}
				}
				return true;
			}

			function validateLine(context) {
				var currentRecord = context.currentRecord;
				var sublistName = context.sublistId;
				// PO
				if (sublistName === 'item') {
					var buyQuantity = currentRecord.getCurrentSublistValue({// �ɹ�����
						sublistId : 'item',
						fieldId : 'custcol_xsdd_gmsl'
					});
					if (buyQuantity) {
						// 1����Ҫ��ѯitem��quantity����С������ֵ��Ӧ�õ�custcol_xsdd_gmsl
						var itemId = currentRecord.getCurrentSublistValue({// �ɹ�����
							sublistId : 'item',
							fieldId : 'item'
						});
						// alert(itemId);
						try {
							var itemRecord = record.load({
								type : record.Type.SERVICE_ITEM,
								id : itemId,
								isDynamic : true,
							});
						} catch (e) {
							return true;
						}
						var minimumQuantity = itemRecord.getValue({// ��С����
							fieldId : 'minimumquantity'
						});
						// alert(minimumQuantity);
						if (minimumQuantity != ''
								&& buyQuantity < minimumQuantity) {
							alert('������������С��' + minimumQuantity);
							return false;
						}
					}

				}
				return true;
			}
			return {
				fieldChanged : fieldChanged,
				validateField : validateField,
				validateLine : validateLine
			};
		});