/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/record', 'N/search' ],

		function(record, search) {
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
				try {
					if (context.type == context.UserEventType.EDIT
							|| context.type == context.UserEventType.CREATE
							|| context.type == context.UserEventType.COPY) {
						var newRecord = context.newRecord;
						var recordType = newRecord.type;

						var calculateType = 2;// 1:so的计算逻辑 2:pl的计算逻辑
						var createdFrom = newRecord.getValue({
							fieldId : 'createdfrom'
						});
						// 如果是invoice
						if (recordType == record.Type.INVOICE) {
							// 如果是人工生成 则并不进行任何计算
							if (!createdFrom) {
								return;
							} else {
								var soRecord = record.load({
									type : record.Type.SALES_ORDER,
									id : createdFrom,
									isDynamic : true,
								});
								var soCreatedFrom = soRecord.getValue({
									fieldId : 'createdfrom'
								});
								if (soCreatedFrom) {
									calculateType = 2;
								} else {
									calculateType = 1;
								}
							}
						}

						// 如果是SO
						if (recordType == record.Type.SALES_ORDER) {
							if (createdFrom) {
								calculateType = 2;
							} else {
								calculateType = 1;
							}
						}

						// 如果是PL
						if (recordType == record.Type.ESTIMATE) {
							calculateType = 2;
						}

						log.debug({
							title : 'calculateType',
							details : calculateType
						});

						var lineCount = newRecord.getLineCount({
							sublistId : 'item'
						});
						var factor = newRecord.getValue({
							fieldId : 'custbody_tn_quote_factor'
						});
						var incoterm = newRecord.getValue({
							fieldId : 'custbody_tn_po_incoterm'
						});
						incoterm = incoterm == '' ? '-None-' : incoterm;
						// var incotermName = newRecord.getText({
						// fieldId : 'custbody_tn_po_incoterm'
						// });
						// if (calculateType == 2) {
						//
						// }
						// 计算开始
						for (var i = 0; i < lineCount; i++) {
							// 得到amount
							var amount = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'amount',
								line : i
							});
							// 设置FOB Quote Price
							var FOBQuotePrice = newRecord.getSublistValue({// 人工输入
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_fobqotpric',
								line : i
							});
							if (factor && FOBQuotePrice) {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_fobqotpric',
									line : i,
									value : FOBQuotePrice * factor
								});
							}
							FOBQuotePrice = FOBQuotePrice * factor;

							// from customer
							var brokerageIns = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_broinper',
								line : i
							});

							// from customer
							var importProfitElimination = newRecord
									.getSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_impfroeliper',
										line : i
									});

							// from customer
							var agent = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_agentper',
								line : i
							});

							// 人工输入
							var duty = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_dutyper',
								line : i
							});

							// remove
							// var dagrmntper = newRecord.getSublistValue({
							// sublistId : 'item',
							// fieldId : 'custcol_tn_quote_dagrmntper',
							// line : i
							// });
							if (FOBQuotePrice) {
								// 设置Brokerage Ins Amount
								if (brokerageIns) {
									newRecord.setSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_broinamt',
										line : i,
										value : FOBQuotePrice * brokerageIns
									});
								}
								// 设置Import Profit Elimination Amount
								if (importProfitElimination) {
									newRecord
											.setSublistValue({
												sublistId : 'item',
												fieldId : 'custcol_tn_quote_impfroeliamt',
												line : i,
												value : FOBQuotePrice
														* importProfitElimination
											});
								}
								// 设置Agent Amount
								if (agent) {
									newRecord
											.setSublistValue({
												sublistId : 'item',
												fieldId : 'custcol_tn_quote_agentamount',
												line : i,
												value : FOBQuotePrice * agent
											});
								}
								// 设置Duty Amount
								if (duty) {
									newRecord.setSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_dutyamt',
										line : i,
										value : FOBQuotePrice * duty
									});
								}

								// if (calculateType == 1) {
								// newRecord.setSublistValue({
								// sublistId : 'item',
								// fieldId : 'custcol_tn_quote_dagrmnt',
								// line : i,
								// value : amount * dagrmntper
								// });
								// }
								// 设置Price Quote
								if (dagrmntper) {
									newRecord.setSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_firstcost',
										line : i,
										value : FOBQuotePrice
												/ (1 - dagrmntper)
									});
									// newRecord.setSublistValue({
									// sublistId : 'item',
									// fieldId : 'custcol_tn_quote_dagrmnt',
									// line : i,
									// value : FOBQuotePrice
									// / (1 - dagrmntper) * dagrmntper
									// });
								}
							}

							// 设置Freight Amount
							// 查询得到loading类型的CBM和packSize
							var loadingCBM;
							var loadingPackSize;
							var itemId = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'item',
								line : i
							});
							var piSearch = search.create({
								type : 'customrecord_tn_packinginfo',
								filters : [ [ 'custrecord_tn_parentrec', 'is',
										itemId ] ],
								columns : [ 'custrecord_tn_cbm',
										'custrecord_tn_packingtype',
										'custrecord_tn_pack_size' ]
							});
							piSearch.run().each(function(result) {
								var CBM = result.getValue({
									name : 'custrecord_tn_cbm'
								});
								var packSize = result.getValue({
									name : 'custrecord_tn_pack_size'
								});
								var packingType = result.getText({
									name : 'custrecord_tn_packingtype'
								});
								if (packingType == 'Loading') {
									loadingCBM = CBM;
									loadingPackSize = packSize;
								}
								return true;
							});
							// 人工输入
							var fromPort = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_shipport',
								line : i
							});
							fromPort = fromPort == '' ? '-None-' : fromPort;
							// 人工输入
							var shippingDestination = newRecord
									.getSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_shipdes',
										line : i
									});
							shippingDestination = shippingDestination == '' ? '-None-'
									: shippingDestination
							var quantity = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'quantity',
								line : i
							});

							// 查询得到freightCostPerCBM
							var freightCostPer;
							var filters = [];
							filters.push([ 'custrecord_tn_fritcost_incoterm',
									'is', incoterm ], 'AND', [
									'custrecord_tn_fritcost_fpot', 'is',
									fromPort ], 'AND', [
									'custrecord_tn_fritcost_topot', 'is',
									shippingDestination ]);

							var fcSearch = search.create({
								type : 'customrecord_tn_freightcost',
								filters : filters,
								columns : [ 'custrecord_tn_fritcost_cost' ]
							});
							fcSearch.run().each(function(result) {
								freightCostPer = result.getValue({
									name : 'custrecord_tn_fritcost_cost'
								});
								return true;
							});

							if (freightCostPer && loadingCBM && loadingPackSize
									&& quantity) {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_fritamt',
									line : i,
									value : freightCostPer * loadingCBM
											/ loadingPackSize * quantity
								});
							}
							// 列出计算所需字段信息
							var brokerageInsAmount = newRecord
									.getSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_broinamt',
										line : i
									});
							var impProEliAmount = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_impfroeliamt',
								line : i
							});
							var agentAmount = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_agentamount',
								line : i
							});
							var dutyAmount = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_dutyamt',
								line : i
							});
							var freightAmount = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_fritamt',
								line : i
							});
							// var daPerAgreement = newRecord.getSublistValue({
							// sublistId : 'item',
							// fieldId : 'custcol_tn_quote_dagrmnt',
							// line : i
							// });

							// 设置Landed Cost及各种费用
							var landedCost;
							if (incoterm == '3') {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_landcost',
									line : i,
									value : FOBQuotePrice + brokerageInsAmount
											- impProEliAmount + agentAmount
											+ freightAmount + dutyAmount
								});
								landedCost = FOBQuotePrice + brokerageInsAmount
										- impProEliAmount + agentAmount
										+ freightAmount + dutyAmount;

							} else if (incoterm != '-None-') {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_landcost',
									line : i,
									// value : FOBQuotePrice + daPerAgreement
									// + brokerageInsAmount
									// + impProEliAmount + agentAmount
									// + freightAmount + dutyAmount
									value : FOBQuotePrice + brokerageInsAmount
											+ impProEliAmount + agentAmount
											+ freightAmount + dutyAmount
								});
								// landedCost = FOBQuotePrice + daPerAgreement
								// + brokerageInsAmount + impProEliAmount
								// + agentAmount + freightAmount
								// + dutyAmount
								landedCost = FOBQuotePrice + brokerageInsAmount
										+ impProEliAmount + agentAmount
										+ freightAmount + dutyAmount
							}
							var tmpPrice;
							if (incoterm == '3' || incoterm == '6'
									|| incoterm == '8') {
								tmpPrice = FOBQuotePrice;
							} else if (incoterm != '-None-') {
								tmpPrice = landedCost;
							}
							var salesComm = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_salcommiper',
								line : i
							});
							var pli = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_pliper',
								line : i
							});
							var afterService = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_afterserviceper',
								line : i
							});
							var mdAllowance = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_allowrancper',
								line : i
							});
							var testingFree = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_testfeeper',
								line : i
							});
							var overHead = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_overheadper',
								line : i
							});
							var otherExpense = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_otherfeeper',
								line : i
							});
							var royality = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_royalityper',
								line : i
							});
							var markdown = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_markdownper',
								line : i
							});
							var coopReserve = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_coopreserveper',
								line : i
							});
							var vendorTerm = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_vendtermper',
								line : i
							});
							var advertisingAllowance = newRecord
									.getSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_aaper',
										line : i
									});
							var promotionalAllowance = newRecord
									.getSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_promotallowper',
										line : i
									});
							var paymentTerm = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_paytermper',
								line : i
							});
							var storeDefectiveAllowance = newRecord
									.getSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_storedaper',
										line : i
									});

							// 设置Sales Comm. Amount
							if (calculateType == 1) {
								tmpPrice = amount;
							}
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_salcommiamt', i, tmpPrice
											* salesComm / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_pliamt', i, tmpPrice
											* pli / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_afterserviceamt', i,
									tmpPrice * afterService / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_allowrancamt', i,
									tmpPrice * mdAllowance / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_testfeeamt', i, tmpPrice
											* testingFree / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_overheadamt', i, tmpPrice
											* overHead / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_otherfeeamt', i, tmpPrice
											* otherExpense / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_royalityamt', i, tmpPrice
											* royality / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_markdownamt', i, tmpPrice
											* markdown / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_coopreserveamt', i,
									tmpPrice * coopReserve / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_vendtermamt', i, tmpPrice
											* vendorTerm / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_aaamt', i, tmpPrice
											* advertisingAllowance / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_promotallowamt', i,
									tmpPrice * promotionalAllowance / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_termamt', i, tmpPrice
											* paymentTerm / 100);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_storeda', i, tmpPrice
											* storeDefectiveAllowance / 100);

							// 设置Total Cost
							var estimitfcost = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_estimitfcost',
								line : i
							});
							var totalCost = estimitfcost
									+ tmpPrice
									* (salesComm + pli + afterService
											+ mdAllowance + testingFree
											+ overHead + otherExpense
											+ royality + markdown + coopReserve
											+ vendorTerm + advertisingAllowance
											+ promotionalAllowance
											+ paymentTerm + storeDefectiveAllowance)
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_totalcost', i, totalCost);

							// 设置MD Net Margin
							if (totalCost > 0 && FOBQuotePrice > 0) {
								var mdNetMargin;
								switch (incoterm) {
								case '3':
									mdNetMargin = (1 - totalCost
											/ FOBQuotePrice);
									break;
								case '7':
									mdNetMargin = (1 - totalCost
											/ FOBQuotePrice) * 1.01;
									break;
								case '4':
									mdNetMargin = (1 - totalCost
											/ FOBQuotePrice) * 1.02;
									break;
								case '8':
									mdNetMargin = (1 - totalCost
											/ FOBQuotePrice) * 1.03;
									break;
								case '6':
									mdNetMargin = (1 - totalCost
											/ FOBQuotePrice) * 1.04;
									break;

								default:
									break;
								}

								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_netmargin', i,
										mdNetMargin);
							}

							// 设置MD Gross Margin
							var mdGrossMargin = (1 - estimitfcost
									/ FOBQuotePrice);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_grosmargin', i,
									mdGrossMargin);

							// 设置Reserve Amount
							var reserveper = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_reserveper',
								line : i
							});
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_reseramt', i, landedCost
											* reserveper);

							// 设置Total Store Cost
							var totalStoreCost;
							var storecost = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_storecost',
								line : i
							});
							var outbundcharge = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_outbundcharge',
								line : i
							});
							var paletcost = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_paletcost',
								line : i
							});
							if (incoterm == '8') {
								totalStoreCost = storecost + outbundcharge
										+ paletcost + landedCost + reserveper;
							} else if (incoterm != '-None-') {
								totalStoreCost = landedCost + reserveper;
							}
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_totalstore', i,
									totalStoreCost);

							// 设置MSRP(Retail Price)
							var msrp = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_msrp',
								line : i
							});
							msrp = msrp * factor;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_msrp', i, msrp);
							if (msrp > 0) {
								// 设置Markup %
								var markup = (1 - totalStoreCost / msrp);
								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_markupper', i, markup);

								// 设置9 Digit Freight Amount
								var digifritper = newRecord.getSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_9digifritper',
									line : i
								});
								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_9digitfrit', i,
										totalStoreCost * digifritper);

								// 设置Import Store Cost (w/ 9 Digit FF)
								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_importstorecost', i,
										totalStoreCost * digifritper
												+ parseFloat(totalStoreCost));
								// 设置Markup % w/9 Digit FF
								setSublistValue(
										newRecord,
										'item',
										'custcol_tn_quote_9digit',
										i,
										1
												- (totalStoreCost * digifritper + parseFloat(totalStoreCost))
												/ msrp);
							}

						}

					}
				} catch (e) {
					log.debug({
						title : 'beforeSubmit',
						details : e
					});
				}
			}
			function setSublistValue(record, sublistName, sublistFieldName, i,
					value) {
				record.setSublistValue({
					sublistId : sublistName,
					fieldId : sublistFieldName,
					line : i,
					value : value
				});
			}
			return {
				beforeSubmit : beforeSubmit
			};

		});
