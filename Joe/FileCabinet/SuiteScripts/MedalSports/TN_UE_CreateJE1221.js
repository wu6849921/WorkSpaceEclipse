/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/record', 'N/search', 'N/error', 'N/format' ],

		function(record, search, error, formatF) {
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
			function afterSubmit(context) {
				try {
					if (context.type == context.UserEventType.CREATE
							|| context.type == context.UserEventType.EDIT) {
						var newRecord = context.newRecord;
						var createJe = newRecord.getValue({
							fieldId : 'custbody_tn_createje'
						});
						var iscreatedje = newRecord.getValue({
							fieldId : 'custbody_tn_iscreatedje'
						});
						if (iscreatedje || !createJe) {
							return;
						}
						var lineCount = newRecord.getLineCount({
							sublistId : 'item'
						});
						var currency = newRecord.getValue({
							fieldId : 'currency'
						});
						var salesRep = newRecord.getValue({
							fieldId : 'custbody_tn_pl_salesrep'
						});
						var salesRep2 = newRecord.getValue({
							fieldId : 'custbody_tn_pl_salesrep2'
						});
						var customer = newRecord.getValue({
							fieldId : 'entity'
						});
						var entityText = newRecord.getText({
							fieldId : 'tranid'
						});
						// var department = newRecord.getValue({
						// fieldId : 'department'
						// });
						var subsidiary = newRecord.getValue({
							fieldId : 'subsidiary'
						});
						// var classV = newRecord.getValue({
						// fieldId : 'class'
						// });
						// var location = newRecord.getValue({
						// fieldId : 'location'
						// });
						var area = newRecord.getValue({
							fieldId : 'custbody_cseg_tn_area'
						});
						var exchangeRate = newRecord.getValue({
							fieldId : 'exchangerate'
						});
						var tranDate = newRecord.getValue({
							fieldId : 'trandate'
						});
						// 为每一条line上的数据生成JE Fee reservation.
						for (var i = 0; i < lineCount; i++) {
							var classV = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'class',
								line : i
							});
							var location = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'location',
								line : i
							});
							var amountTotal = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'amount',
								line : i
							});
							var item = newRecord.getSublistText({
								sublistId : 'item',
								fieldId : 'item',
								line : i
							});
							var salcommiper = newRecord.getSublistText({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_salcommiper',
								line : i
							});
							var afterserviceper = newRecord.getSublistText({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_afterserviceper',
								line : i
							});
							var allowrancper = newRecord.getSublistText({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_allowrancper',
								line : i
							});
							var royalityper = newRecord.getSublistText({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_royalityper',
								line : i
							});
							var markdownper = newRecord.getSublistText({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_markdownper',
								line : i
							});
							var programper = newRecord.getSublistText({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_vendtermper',
								line : i
							});
							var paytermper = newRecord.getSublistText({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_paytermper',
								line : i
							});
							var storedaper = newRecord.getSublistText({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_storedaper',
								line : i
							});
							var otherfeeper = newRecord.getSublistText({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_otherfeeper',
								line : i
							});
							var isNeedSave = false;
							var jeRec = record.create({
								type : record.Type.JOURNAL_ENTRY,
								isDynamic : true
							});
							// 设置subsidiary
							jeRec.setValue({
								fieldId : 'subsidiary',
								value : subsidiary
							});
							jeRec.setValue({
								fieldId : 'currency',
								value : currency
							});
							jeRec.setValue({
								fieldId : 'trandate',
								value : tranDate
							});
							jeRec.setValue({
								fieldId : 'custbody_tn_createdfrom',
								value : newRecord.id
							});
							// var quantity = newRecord.getSublistValue({
							// sublistId : 'item',
							// fieldId : 'quantity',
							// line : i
							// });

							var royMemo;
							var feeResSearch = search.create({
								type : 'customrecord_feecalculation',
								// filters : [ [ 'custrecord_tn_parentrec',
								// 'is',
								// itemId ] ],
								columns : [ 'custrecord_tn_costlist',
										'custrecord_tn_craccount',
										'custrecord_tn_draccount',
										'custrecord_tn_fee_memo' ]
							});
							feeResSearch
									.run()
									.each(
											function(result) {
												var feeType = result
														.getValue({
															name : 'custrecord_tn_costlist'
														});
												var creAccount = result
														.getValue({
															name : 'custrecord_tn_craccount'
														});
												var debAccount = result
														.getValue({
															name : 'custrecord_tn_draccount'
														});
												var memo = result
														.getValue({
															name : 'custrecord_tn_fee_memo'
														});
												var memoValue = entityText
														+ '/' + item + '  ';
												var amount = 0;
												var name;
												// log.debug({
												// title : 'result.id',
												// details : result.id
												// });
												switch (result.id) {
												case '4':// Sales Comm.%
													var amount = newRecord
															.getSublistValue({
																sublistId : 'item',
																fieldId : 'custcol_tn_quote_salcommiamt',
																line : i
															});
													name = salesRep;
													memoValue += memo
															+ salcommiper
															+ '  '
															+ amountTotal + '*'
															+ salcommiper;
													break;
												case '5':// After Service%
													amount = newRecord
															.getSublistValue({
																sublistId : 'item',
																fieldId : 'custcol_tn_quote_afterserviceamt',
																line : i
															});
													name = customer;
													memoValue += memo
															+ afterserviceper
															+ '  '
															+ amountTotal + '*'
															+ afterserviceper;
													break;
												case '6':// MD Allowance%
													amount = newRecord
															.getSublistValue({
																sublistId : 'item',
																fieldId : 'custcol_tn_quote_allowrancamt',
																line : i
															});
													name = customer;
													memoValue += memo
															+ allowrancper
															+ '  '
															+ amountTotal + '*'
															+ allowrancper;
													break;
												case '7':// Royality%
													royMemo = memoValue + memo
															+ royalityper
															+ '  '
															+ amountTotal + '*'
															+ royalityper;
													break;
												case '8':// Markdown%
													amount = newRecord
															.getSublistValue({
																sublistId : 'item',
																fieldId : 'custcol_tn_quote_markdownamt',
																line : i
															});
													name = customer;
													memoValue += memo
															+ markdownper
															+ '  '
															+ amountTotal + '*'
															+ markdownper;
													break;
												case '10':// Vendor Term%
													amount = newRecord
															.getSublistValue({
																sublistId : 'item',
																fieldId : 'custcol_tn_quote_vendtermamt',
																line : i
															});
													name = customer;
													memoValue += memo
															+ programper + '  '
															+ amountTotal + '*'
															+ programper;
													break;
												case '13':// Payment Term%
													amount = newRecord
															.getSublistValue({
																sublistId : 'item',
																fieldId : 'custcol_tn_quote_termamt',
																line : i
															});
													name = customer;
													memoValue += memo
															+ paytermper + '  '
															+ amountTotal + '*'
															+ paytermper;
													break;
												case '14':// Store Defective
													// Allowance%
													amount = newRecord
															.getSublistValue({
																sublistId : 'item',
																fieldId : 'custcol_tn_quote_storeda',
																line : i
															});
													name = customer;
													memoValue += memo
															+ storedaper + '  '
															+ amountTotal + '*'
															+ storedaper;
													break;
												case '16':// Sales Comm.%2
													amount = newRecord
															.getSublistValue({
																sublistId : 'item',
																fieldId : 'custcol_tn_quote_otherfeeamt',
																line : i
															});
													name = salesRep2;
													memoValue += memo
															+ otherfeeper
															+ '  '
															+ amountTotal + '*'
															+ otherfeeper;
												default:
													break;
												}
												// log.debug({
												// title : 'amount',
												// details : amount
												// });
												// 创建JE
												if (amount > 0 && name) {
													isNeedSave = true;
													// amount = formatF
													// .format({
													// value : amount,
													// type :
													// formatF.Type.CURRENCY
													// })
													amount = amount.toFixed(2);
													jeRec.selectNewLine({
														sublistId : 'line'
													});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'entity',
																value : name
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'memo',
																value : memoValue
															});
													// jeRec
													// .setCurrentSublistValue({
													// sublistId : 'line',
													// fieldId : 'department',
													// value : department
													// });
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'class',
																value : classV
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'location',
																value : location
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'custcol_cseg_tn_area',
																value : area
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'custcol_tn_usaamount',
																value : amount
																		* exchangeRate
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'account',
																value : debAccount
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'debit',
																value : amount
															});
													jeRec.commitLine({
														sublistId : 'line'
													});

													jeRec.selectNewLine({
														sublistId : 'line'
													});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'entity',
																value : name
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'memo',
																value : memoValue
															});
													// jeRec
													// .setCurrentSublistValue({
													// sublistId : 'line',
													// fieldId : 'department',
													// value : department
													// });
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'class',
																value : classV
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'location',
																value : location
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'custcol_cseg_tn_area',
																value : area
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'custcol_tn_usaamount',
																value : amount
																		* exchangeRate
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'account',
																value : creAccount
															});
													jeRec
															.setCurrentSublistValue({
																sublistId : 'line',
																fieldId : 'credit',
																value : amount
															});
													jeRec.commitLine({
														sublistId : 'line'
													});
												}
												return true;
											});
							var brand = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_opp_brand',
								line : i
							});
							// 用brand取得vonder
							var vendor = '';
							search
									.create(
											{
												type : 'customrecord_tn_cr_brandvsvendor',
												filters : [ [
														'custrecord_tn_brandvsvendor_brand',
														'is', brand ] ],
												columns : [ 'custrecord_tn_brandvsvendor_vendor' ]
											})
									.run()
									.each(
											function(result) {
												vendor = result
														.getValue({
															name : 'custrecord_tn_brandvsvendor_vendor'
														});
												return true;
											});
							var royAmount = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_royalityamt',
								line : i
							});
							log.debug({
								title : 'royAmount',
								details : royAmount + '|' + vendor
							});
							if (royAmount && royAmount > 0 && vendor) {
								isNeedSave = true;
								// royAmount = formatF.format({
								// value : royAmount,
								// type : formatF.Type.CURRENCY
								// })
								royAmount = royAmount.toFixed(2);
								var vendorRecord = record.load({
									type : 'vendor',
									id : vendor
								});
								var debitAccount = vendorRecord.getValue({
									fieldId : 'custentity_tn_entity_rda'
								});
								var creditAccount = vendorRecord.getValue({
									fieldId : 'custentity_tn_entity_rca'
								});
								if (debitAccount && creditAccount) {
									jeRec.selectNewLine({
										sublistId : 'line'
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'entity',
										value : vendor
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'memo',
										value : royMemo
									});
									// jeRec.setCurrentSublistValue({
									// sublistId : 'line',
									// fieldId : 'department',
									// value : department
									// });
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'class',
										value : classV
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'location',
										value : location
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'custcol_cseg_tn_area',
										value : area
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'custcol_tn_usaamount',
										value : royAmount * exchangeRate
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'account',
										value : debitAccount
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'debit',
										value : royAmount
									});
									jeRec.commitLine({
										sublistId : 'line'
									});

									jeRec.selectNewLine({
										sublistId : 'line'
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'entity',
										value : vendor
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'memo',
										value : royMemo
									});
									// jeRec.setCurrentSublistValue({
									// sublistId : 'line',
									// fieldId : 'department',
									// value : department
									// });
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'class',
										value : classV
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'location',
										value : location
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'custcol_cseg_tn_area',
										value : area
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'custcol_tn_usaamount',
										value : royAmount * exchangeRate
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'account',
										value : creditAccount
									});
									jeRec.setCurrentSublistValue({
										sublistId : 'line',
										fieldId : 'credit',
										value : royAmount
									});
									jeRec.commitLine({
										sublistId : 'line'
									});
								}
							}
							if (isNeedSave) {
								jeId = jeRec.save({
									ignoreMandatoryFields : true
								});
							}
						}
						if (createJe) {
							var objRecord = record.load({
								type : record.Type.INVOICE,
								id : newRecord.id
							});
							objRecord.setValue({
								fieldId : 'custbody_tn_iscreatedje',
								value : true
							});
							objRecord.save();
						}

					}
				} catch (e) {
					log.debug({
						title : 'afterSubmit',
						details : e
					});
					var errorObj = error.create({
						name : e.name,
						message : e.message
					});
					throw errorObj;
				}
			}
			return {
				afterSubmit : afterSubmit
			};

		});
