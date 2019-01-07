/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define(
		[ 'N/search' ],
		function(search) {
			/**
			 * Function to be executed after page is initialized.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.currentRecord - Current form record
			 * @param {string}
			 *            scriptContext.mode - The mode in which the record is
			 *            being accessed (create, copy, or edit)
			 * 
			 * @since 2015.2
			 */
			function fieldChanged(context) {
				var currentRecord = context.currentRecord;
				var fieldName = context.fieldId;
				if (fieldName === 'custitem_nt_item_featurecode'
						|| fieldName === 'class') {
					var itemCode = getItemCode(currentRecord);
					if (itemCode) {
						currentRecord.setValue({
							fieldId : 'itemid',
							value : itemCode.trim()
						});
					}
				}

				// UPCCode
				if (fieldName === 'custitem_tn_item_solditem') {
					var upcCodeValue = currentRecord.getValue({
						fieldId : 'upccode'
					});
					var soldItemV = currentRecord.getValue({
						fieldId : 'custitem_tn_item_solditem'
					});
					if (upcCodeValue || soldItemV == false) {
						return;
					}
					var UPCCode = getUPCCode(currentRecord);
					if (UPCCode) {
						currentRecord.setValue({
							fieldId : 'upccode',
							value : UPCCode.trim()
						});
					}
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
			function saveRecord(context) {
				var currentRecord = context.currentRecord;
				var itemidC = currentRecord.getText({
					fieldId : 'itemid'
				});
				var UPCCode = currentRecord.getText({
					fieldId : 'upccode'
				});
				if (itemidC) {
					return true;
				} else {
					var itemCode = getItemCode(currentRecord);
					if (itemCode) {
						currentRecord.setValue({
							fieldId : 'itemid',
							value : itemCode.trim()
						});
					}

					var soldItemV = currentRecord.getValue({
						fieldId : 'custitem_tn_item_solditem'
					});
					if (soldItemV == false) {
						return true;
					}
					var UPCCode = getUPCCode(currentRecord);
					if (UPCCode) {
						currentRecord.setValue({
							fieldId : 'upccode',
							value : UPCCode.trim()
						});
					}

				}

				return true;
			}

			function PrefixInteger(num, length) {
				return (Array(length).join('0') + num).slice(-length);
			}

			// �õ�item����
			function getItemCode(currentRecord) {

				// �����
				var yearCode = currentRecord.getText({
					fieldId : 'custitem_nt_item_featurecode'
				});
				var classValue = currentRecord.getText({
					fieldId : 'class'
				});

				// var itemidC = currentRecord.getText({
				// fieldId : 'itemid'
				// });
				var itemCode;
				if (yearCode && classValue) {
					// Backyard Game : Disc Game_DG : Disc Game|100
					if (classValue.indexOf(':') != -1) {
						var shortName = classValue.split(':')[1];
						var featureCode = classValue.split(':')[2];
						if (featureCode.indexOf('|') != -1) {
							featureCode = featureCode.split('|')[1];// ��ɫ��
						}
						if (shortName.indexOf('_') != -1) {
							shortName = shortName.split('_')[1];// ���

							var tmpCode = shortName.trim() + featureCode
									+ yearCode;
							// console.log('tmpCode=' + tmpCode);
							tmpCode = tmpCode.trim();
							// ������
							var codeBegin = 0;
							var recSearch = search.create({
								type : currentRecord.type,
								columns : [ 'itemid' ]
							});
							// var isExist = false;
							recSearch.run().each(function(result) {
								var itemid = result.getValue({
									name : 'itemid'
								});
								// if (itemidC == '') {
								// isExist = true;
								// }
								// if (itemidC == itemid || ) {
								// alert(itemidC + '|' + itemid);
								//									
								// }
								if (itemid) {
									// alert('itemid=' + itemid);
									if (itemid.indexOf(tmpCode) != -1) {
										// console.log('itemid=' + itemid);
										codeBegin++;
									}
								}
								return true;
							});
							codeBegin = PrefixInteger(codeBegin + 1, 3);
							itemCode = tmpCode + codeBegin;
							// if (!isExist) {
							// itemCode = '';
							// }
						}
					}
				}

				return itemCode;
			}

			// �õ�UPC��
			function getUPCCode(currentRecord) {

				var UPCCodeC = currentRecord.getText({
					fieldId : 'upccode'
				});
				// ��˾��
				var comCode = [ 8, 2, 1, 7, 3, 5 ];
				// var isExist = false;
				// ���к�
				var serial = 1;
				var itemSearch = search.create({
					type : search.Type.ITEM,
					columns : [ 'custitem_tn_item_solditem', 'upccode' ]
				});
				itemSearch.run().each(function(result) {
					var soldItem = result.getValue({
						name : 'custitem_tn_item_solditem'
					});
					var UPCCode = result.getValue({
						name : 'upccode'
					});
					if (soldItem == true) {
						serial++;
					}
					// if (UPCCodeC == UPCCode || UPCCodeC == '') {
					// isExist = true;
					// }
					return true;
				});
				// if (!isExist) {
				// return '';
				// }
				serial = PrefixInteger(serial, 5) + '';
				var serialArr = serial.split('');
				// ż��λ
				var evenNum = (comCode[0] + comCode[2] + comCode[4]
						+ parseInt(serialArr[0]) + parseInt(serialArr[2]) + parseInt(serialArr[4])) * 3;
				// ����λ
				var oddNum = comCode[1] + comCode[3] + comCode[5]
						+ parseInt(serialArr[1]) + parseInt(serialArr[3]);
				var oneCode = 1000 - (evenNum + oddNum);
				oneCode = oneCode + '';
				oneCode = oneCode.substr(oneCode.length - 1, 1);

				// ƴ���ַ���
				var UPCCode = comCode.join('') + serial + oneCode;

				return UPCCode;

			}
			return {
				saveRecord : saveRecord,
				fieldChanged : fieldChanged
			};
		});