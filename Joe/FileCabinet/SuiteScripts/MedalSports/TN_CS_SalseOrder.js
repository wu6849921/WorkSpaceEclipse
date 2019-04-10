/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define(
		[ 'N/search', 'N/record' ],
		function(search, record) {
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
					var sublistName = context.sublistId;
					var sublistFieldName = context.fieldId;

					if (sublistName === 'item'
							&& (sublistFieldName === 'item'
									|| sublistFieldName === 'rate'
									|| sublistFieldName === 'custcol_tn_quote_salcommiper'
									|| sublistFieldName === 'custcol_tn_quote_afterserviceper'
									|| sublistFieldName === 'custcol_tn_quote_allowrancper'
									|| sublistFieldName === 'custcol_tn_quote_royalityper'
									|| sublistFieldName === 'custcol_tn_quote_markdownper'
									|| sublistFieldName === 'custcol_tn_quote_vendtermper'
									|| sublistFieldName === 'custcol_tn_quote_paytermper'
									|| sublistFieldName === 'custcol_tn_quote_storedaper' || sublistFieldName === 'custcol_tn_quote_otherfeeper')) {
						// alert(1);
						// // null.indexOf('a');
						// alert(2);
						var rate = currentRecord.getCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'rate'
						});
						var amount = currentRecord.getCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'amount'
						});
						if (amount != '') {
							calculateAmount(amount, currentRecord);
						}
					}

					if (sublistName === 'item' && sublistFieldName === 'item') {
						var entity = currentRecord.getValue({
							fieldId : 'entity'
						});
						var cusRecord = record.load({
							type : record.Type.CUSTOMER,
							id : entity
						});
						var salecomm = cusRecord.getValue({
							fieldId : 'custentity_tn_customer_salecomm'
						});
						var afterservice = cusRecord.getValue({
							fieldId : 'custentity_tn_customer_afterservice'
						});
						var mddefall = cusRecord.getValue({
							fieldId : 'custentity_tn_customer_mddefall'
						});
						var markdown = cusRecord.getValue({
							fieldId : 'custentity_tn_customer_markdown'
						});
						var program = cusRecord.getValue({
							fieldId : 'custentity_tn_customer_vendorterm'
						});
						var payterm = cusRecord.getValue({
							fieldId : 'custentity_tn_customer_paydis'
						});
						var storedaper = cusRecord.getValue({
							fieldId : 'custentity_tn_quote_storedaper'
						});
						currentRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_salcommiper',
							value : salecomm
						});
						currentRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_afterserviceper',
							value : afterservice
						});
						currentRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_allowrancper',
							value : mddefall
						});
						currentRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_markdownper',
							value : markdown
						});
						currentRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_vendtermper',
							value : program
						});
						currentRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_paytermper',
							value : payterm
						});
						currentRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_storedaper',
							value : storedaper
						});
					}

					// var total = currentRecord.getValue({
					// fieldId : 'total'
					// });
					if (sublistFieldName === 'custbody_tn_tr_ecp'
							|| sublistFieldName === 'custbody_tn_tr_ept'
							|| sublistFieldName === 'custbody_tn_tr_sda') {
						// 计算salse comm
						var ecp = currentRecord.getValue({
							fieldId : 'custbody_tn_tr_ecp'
						});
						var ept = currentRecord.getValue({
							fieldId : 'custbody_tn_tr_ept'
						});
						var sda = currentRecord.getValue({
							fieldId : 'custbody_tn_tr_sda'
						});
						var numLines = currentRecord.getLineCount({
							sublistId : 'item'
						});
						// alert(numLines);
						for (var i = 0; i < numLines; i++) {
							var amount = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'amount',
								line : i
							});
							var salcommiper = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_salcommiper',
								line : i
							});
							// alert(salcommiper);
							salcommiper = salcommiper / 100;
							// alert(salcommiper);
							var lineNum = currentRecord.selectLine({
								sublistId : 'item',
								line : i
							});

							// program
							var program = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_vendtermper',
								line : i
							});
							program = program / 100;
							var programAmt = ecp ? program * amount : 0;
							var program2 = ecp ? program : 0;
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_vendtermamt',
								value : programAmt
							});

							// payterm
							var payterm = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_paytermper',
								line : i
							});
							payterm = payterm / 100;
							var paytermAmt = ept ? payterm * amount : 0;
							var payterm2 = ept ? payterm : 0;
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_termamt',
								value : paytermAmt
							});

							// storeda
							var storeda = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_storedaper',
								line : i
							});
							storeda = storeda / 100;
							var storedaAmt = sda ? storeda * amount : 0;
							var storeda2 = sda ? storeda : 0;
							// alert(storedaAmt);
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_storeda',
								value : storedaAmt
							});

							// 设置Sales Comm. Amount
							var salcommiamt = amount * salcommiper
									* (1 - program2 - payterm2 - storeda2);
							// alert(amount + '|' + salcommiper);
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_salcommiamt',
								value : salcommiamt
							});
							lineNum.commitLine({
								sublistId : 'item'
							});
						}
					}

					if (sublistFieldName === 'entity') {
						var entity = currentRecord.getValue({
							fieldId : 'entity'
						});
						var cusRecord = record.load({
							type : record.Type.CUSTOMER,
							id : entity
						});
						merchandiser = cusRecord.getValue({
							fieldId : 'custentity_tn_customer_maerchanttpe',
						});
						shipTeam = cusRecord.getValue({
							fieldId : 'custentity_tn_customer_sshippingtpe',
						});
						if (merchandiser) {
							currentRecord.setValue({
								fieldId : 'custbody_tn_so_merchandiser',
								value : merchandiser
							});
						}
						if (shipTeam) {
							currentRecord.setValue({
								fieldId : 'custbody_tn_so_shipteam',
								value : shipTeam
							});
						}
					}

				} catch (e) {
					alert(e);
				}

			}

			function calculateAmount(rate, currentRecord) {
				// alert(1);
				var ecp = currentRecord.getValue({
					fieldId : 'custbody_tn_tr_ecp'
				});
				var ept = currentRecord.getValue({
					fieldId : 'custbody_tn_tr_ept'
				});
				var sda = currentRecord.getValue({
					fieldId : 'custbody_tn_tr_sda'
				});

				// After Service Amount
				var afterserviceper = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_afterserviceper'
				});
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_afterserviceamt',
					value : rate * afterserviceper / 100
				});
				// Defective Allowance Amount
				var allowrancper = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_allowrancper'
				});
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_allowrancamt',
					value : rate * allowrancper / 100
				});
				// Royality Amount
				var royalityper = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_royalityper'
				});
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_royalityamt',
					value : rate * royalityper / 100
				});
				// Markdown Amount
				var markdownper = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_markdownper'
				});
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_markdownamt',
					value : rate * markdownper / 100
				});

				// 计算salse comm
				// Program Amount
				var program = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_vendtermper'
				});
				program = program / 100;
				var programAmt = ecp ? program * rate : 0;
				var program2 = ecp ? program : 0;
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_vendtermamt',
					value : programAmt
				});
				// Payment Term Amount
				var paytermper = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_paytermper'
				});
				paytermper = paytermper / 100;
				var paytermperAmt = ept ? paytermper * rate : 0;
				var paytermper2 = ept ? paytermper : 0;
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_termamt',
					value : paytermperAmt
				});
				// Store Defective Allowance
				var storedaper = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_storedaper'
				});
				storedaper = storedaper / 100;
				var storedaperAmt = sda ? storedaper * rate : 0;
				var storedaper2 = sda ? storedaper : 0;
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_storeda',
					value : storedaperAmt
				});
				// salcommiper
				var salcommiper = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_salcommiper'
				});
				salcommiper = salcommiper / 100;
				// alert(program2 + '|' + paytermper2 + '|' + paytermper2);
				currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_salcommiamt',
					value : salcommiper * rate
							* (1 - program2 - paytermper2 - storedaper2)
				});
				// Other Expense Amount
				var otherfeeper = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_otherfeeper'
				});
				// alert(2);
				if (rate && otherfeeper) {
					currentRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_quote_otherfeeamt',
						value : rate * otherfeeper / 100
					});
				}
				// alert(3);
			}
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
			function pageInit(context) {
				try {
					// if (context.mode == 'create') {
					var currentRecord = context.currentRecord;
					var recType = currentRecord.type;
					var numLines = currentRecord.getLineCount({
						sublistId : 'item'
					});
					if (numLines == 0 || recType == 'invoice') {
						return;
					}

					for (var i = 0; i < numLines; i++) {
						var amount = currentRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'amount',
							line : i
						});
						var salcommiper = currentRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_salcommiper',
							line : i
						});
						if (amount != '' && !salcommiper) {
							var lineNum = currentRecord.selectLine({
								sublistId : 'item',
								line : i
							});
							//
							var salcommiper = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_salcommiper',
								line : i
							});
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_salcommiamt',
								value : amount * salcommiper / 100
							});
							// After Service Amount
							var afterserviceper = currentRecord
									.getSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_afterserviceper',
										line : i
									});
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_afterserviceamt',
								value : amount * afterserviceper / 100
							});
							// Defective Allowance Amount
							var allowrancper = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_allowrancper',
								line : i
							});
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_allowrancamt',
								value : amount * allowrancper / 100
							});
							// Royality Amount
							// 设置royalty费率 20180903
							var customer = currentRecord.getValue({
								fieldId : 'entity'
							});
							// 先取得brand
							var brand = currentRecord.getCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_opp_brand'
							});
							if (customer && brand) {
								var roylitySearch = search.create({
									type : 'customrecord_tn_roylity',
									filters : [
											[ 'custrecord_tn_customer_roylity',
													'is', customer ],
											'AND',
											[ 'custrecord_tn_brand', 'is',
													brand ] ],
									columns : [ 'custrecord_tn_roylity' ]
								});
								roylitySearch
										.run()
										.each(
												function(result) {
													var roylity = result
															.getValue({
																name : 'custrecord_tn_roylity'
															});
													roylity = roylity
															.substring(
																	0,
																	roylity.length - 1);
													currentRecord
															.setCurrentSublistValue({
																sublistId : 'item',
																fieldId : 'custcol_tn_quote_royalityper',
																value : roylity
															});
													lineNum
															.setCurrentSublistValue({
																sublistId : 'item',
																fieldId : 'custcol_tn_quote_royalityamt',
																value : amount
																		* roylity
																		/ 100
															});
													return true;
												});
								// var royalityper = currentRecord
								// .getSublistValue({
								// sublistId : 'item',
								// fieldId : 'custcol_tn_quote_royalityper',
								// line : i
								// });

							}

							// Markdown Amount
							var markdownper = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_markdownper',
								line : i
							});
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_markdownamt',
								value : amount * markdownper / 100
							});
							// // Program Amount
							// var vendtermper = currentRecord.getSublistValue({
							// sublistId : 'item',
							// fieldId : 'custcol_tn_quote_vendtermper',
							// line : i
							// });
							// lineNum.setCurrentSublistValue({
							// sublistId : 'item',
							// fieldId : 'custcol_tn_quote_vendtermamt',
							// value : rate * vendtermper / 100
							// });
							// // Payment Term Amount
							// var paytermper = currentRecord.getSublistValue({
							// sublistId : 'item',
							// fieldId : 'custcol_tn_quote_paytermper',
							// line : i
							// });
							// lineNum.setCurrentSublistValue({
							// sublistId : 'item',
							// fieldId : 'custcol_tn_quote_termamt',
							// value : rate * paytermper / 100
							// });
							// // Store Defective Allowance
							// var storedaper = currentRecord.getSublistValue({
							// sublistId : 'item',
							// fieldId : 'custcol_tn_quote_storedaper',
							// line : i
							// });
							// lineNum.setCurrentSublistValue({
							// sublistId : 'item',
							// fieldId : 'custcol_tn_quote_storeda',
							// value : rate * storedaper / 100
							// });
							lineNum.commitLine({
								sublistId : 'item'
							});
						}
					}
					// }
				} catch (ex) {
					alert(ex);
				}
			}
			return {
				fieldChanged : fieldChanged,
				pageInit : pageInit,
				validateLine : validateLine
			};
		});