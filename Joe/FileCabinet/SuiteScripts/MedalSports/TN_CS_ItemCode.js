/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define(
		[ 'N/search', 'N/record' ],
		function(search, record) {
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

				// // UPCCode
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
					if (UPCCode) {
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

			// 得到item编码
			function getItemCode(currentRecord) {

				// 年份码
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
							featureCode = featureCode.split('|')[1];// 特色码
						}
						if (shortName.indexOf('_') != -1) {
							shortName = shortName.split('_')[1];// 简称

							var tmpCode = shortName.trim() + featureCode
									+ yearCode;
							// console.log('tmpCode=' + tmpCode);
							tmpCode = tmpCode.trim();
							// alert(tmpCode);
							// 序列码
							var codeBegin;
							var recSearch = search
									.create({
										type : 'item',
										filters : [ [ 'itemid', 'startswith',
												tmpCode ] ],
										columns : [ search.createColumn({
											name : 'itemid',
											sort : search.Sort.DESC
										}) ]
									});
							// var isExist = false;
							recSearch.run().each(function(result) {
								codeBegin = result.getValue({
									name : 'itemid'
								});
								// alert(codeBegin);
								// if (itemidC == '') {
								// isExist = true;
								// }
								// if (itemidC == itemid || ) {
								// alert(itemidC + '|' + itemid);
								//									
								// }
								// if (itemid) {
								// alert('itemid=' + itemid);
								// if (itemid.indexOf(tmpCode) != -1) {
								// console.log('itemid=' + itemid);
								// codeBegin++;
								// }
								// }
								// return true;
							});
							// codeBegin = PrefixInteger(codeBegin + 1, 3);
							// itemCode = tmpCode + codeBegin;
							// alert(codeBegin);
							if (codeBegin) {
								// alert(codeBegin);
								// Combo100Y19004
								codeBegin = PrefixInteger(parseInt(codeBegin
										.substring(codeBegin.length - 3)) + 1,
										3);
								// alert(codeBegin);
								itemCode = tmpCode + codeBegin;
							} else {
								itemCode = tmpCode + '001';
							}
							// if (!isExist) {
							// itemCode = '';
							// }
						}
					}
				}

				return itemCode;
			}

			// 得到UPC码
			function getUPCCode(currentRecord) {

				var UPCCodeC = currentRecord.getText({
					fieldId : 'upccode'
				});
				// 公司码
				var comCode = [ 8, 2, 1, 7, 3, 5 ];
				// var isExist = false;
				// 序列号
				var serial;

				var lastUpcShort = 0;
				var isFirst = true;// 序列号
				var upcSearch = search.load({
					id : 'customsearch_tn_upcsearch'
				});
				upcSearch.run().each(function(result) {
					var upcShortNow = result.getValue({
						name : 'custrecord_tn_item_shortupc'
					});
					upcShortNow = parseInt(upcShortNow);
					if (isFirst) {// 第一条作为初始值
						lastUpcShort = upcShortNow;
						isFirst = false;
						record.submitFields({
							type : 'customrecord_tn_item_upc',
							id : result.id,
							values : {
								'custrecord_tn_item_used' : 'T'
							}
						});
						return true;
					}
					// alert('2:' + upcShortNow);
					if (upcShortNow == lastUpcShort + 1) {// 如果上一个upc+1=现在的upc则修改本次upc的状态为已使用
						// alert(upcShortNow);
						// alert(lastUpcShort + 1);
						record.submitFields({
							type : 'customrecord_tn_item_upc',
							id : result.id,
							values : {
								'custrecord_tn_item_used' : 'T'
							}
						});
						lastUpcShort = upcShortNow;
						return true;
					} else {// 如果连续则插入
						serial = lastUpcShort + 1;
						serial = PrefixInteger(serial, 5) + '';
						var upcRecord = record.create({
							type : 'customrecord_tn_item_upc'
						});
						upcRecord.setValue({
							fieldId : 'custrecord_tn_item_shortupc',
							value : serial
						});
						upcRecord.setValue({
							fieldId : 'custrecord_tn_item_used',
							value : false
						});
						upcRecord.save();
					}
				});
				// if (!serial) {// 如果已经查询完，则
				//					
				// }

				var serialArr = serial.split('');
				// 偶数位
				var evenNum = (comCode[0] + comCode[2] + comCode[4]
						+ parseInt(serialArr[0]) + parseInt(serialArr[2]) + parseInt(serialArr[4])) * 3;
				// 奇数位
				var oddNum = comCode[1] + comCode[3] + comCode[5]
						+ parseInt(serialArr[1]) + parseInt(serialArr[3]);
				var oneCode = 1000 - (evenNum + oddNum);
				oneCode = oneCode + '';
				oneCode = oneCode.substr(oneCode.length - 1, 1);

				// 拼接字符串
				var UPCCode = comCode.join('') + serial + oneCode;

				return UPCCode;

			}
			return {
				saveRecord : saveRecord,
				fieldChanged : fieldChanged
			};
		});