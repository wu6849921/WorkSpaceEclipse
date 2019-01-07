/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/record', 'N/search', 'N/error' ],

		function(record, search, error) {
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
				// 手输：MD Estimate Factory Cost,MD Final Factory Cost,N. FOB
				// Price,Factory ID/Name for Short,Whse
				// Location,Duty%,MSRP(Retail Price)
				try {
					if (context.type == context.UserEventType.EDIT
							|| context.type == context.UserEventType.CREATE) {
						var newRecord = context.newRecord;
						// var recType = newRecord.type;
						// if (recType == 'salesorder') {
						//
						// }
						var lineCount = newRecord.getLineCount({
							sublistId : 'item'
						});
						// var factor = newRecord.getValue({
						// fieldId : 'custbody_tn_quote_factor'
						// });
						var factor = 1;
						var incoterm = newRecord.getValue({
							fieldId : 'custbody_tn_po_incoterm'
						});
						var ecp = newRecord.getValue({
							fieldId : 'custbody_tn_tr_ecp'
						});
						incoterm = incoterm == '' ? '-None-' : incoterm;
						// 计算开始
						for (var i = 0; i < lineCount; i++) {
							// 得到amount
							var amount = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'amount',
								line : i
							});
							// 设置Price Quote
							var FOBQuotePrice = newRecord.getSublistValue({// 人工输入
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_fobqotpric',
								line : i
							});
							var mdEstimateFactoryCost = newRecord
									.getSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_estimitfcost',
										line : i
									});
							if (factor && FOBQuotePrice) {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_fobqotpric',
									line : i,
									value : FOBQuotePrice * factor
								});
								FOBQuotePrice = FOBQuotePrice * factor;
							}
							if (factor && mdEstimateFactoryCost) {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_estimitfcost',
									line : i,
									value : mdEstimateFactoryCost * factor
								});
								mdEstimateFactoryCost = mdEstimateFactoryCost
										* factor;
							}
							// from customer
							var brokerageIns = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_broinper',
								line : i
							});
							brokerageIns = brokerageIns ? (brokerageIns / 100)
									: 0;
							// from customer
							var importProfitElimination = newRecord
									.getSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_impfroeliper',
										line : i
									});
							importProfitElimination = importProfitElimination ? (importProfitElimination / 100)
									: 0;
							// from customer
							var agent = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_agentper',
								line : i
							});
							agent = agent ? (agent / 100) : 0;
							// from item 自动带出
							var whcp = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_pl_whcp',
								line : i
							});
							whcp = whcp ? (whcp / 100) : 0;
							var freightToCustomer = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_ltlftl',
								line : i
							});
							var loadcbm = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_loadcbm',
								line : i
							});
							// if (!loadcbm) {
							// loadcbm = 0;
							// }
							var loadpz = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_loadpz',
								line : i
							});
							var loadqty = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_loadqty',
								line : i
							});
							// 用客户端代码取到from custom child record： warehouse
							// charges
							var inbundcharge = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_inbundcharge',
								line : i
							});
							if (!inbundcharge) {
								inbundcharge = 0;
							}
							// var storecost = newRecord.getSublistValue({
							// sublistId : 'item',
							// fieldId : 'custcol_tn_quote_storecost',
							// line : i
							// });
							// if (!storecost) {
							// storecost = 0;
							// }
							var outbundcharge = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_outbundcharge',
								line : i
							});
							if (!outbundcharge) {
								outbundcharge = 0;
							}
							var paletcost = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_paletcost',
								line : i
							});
							if (!paletcost) {
								paletcost = 0;
							}
							var storeperiod = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_storeperiod',
								line : i
							});
							if (!storeperiod) {
								storeperiod = 0;
							}
							// 人工输入
							var duty = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_dutyper',
								line : i
							});
							duty = duty ? (duty / 100) : 0;

							// //////////////////////////
							// 计算各种费率 20180627
							var salesComm = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_salcommiper',
								line : i
							});
							salesComm = salesComm ? (salesComm / 100) : 0;
							var pli = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_pliper',
								line : i
							});
							pli = pli ? (pli / 100) : 0;
							var afterService = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_afterserviceper',
								line : i
							});
							afterService = afterService ? (afterService / 100)
									: 0;
							var mdAllowance = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_allowrancper',
								line : i
							});
							mdAllowance = mdAllowance ? (mdAllowance / 100) : 0;
							var testingFree = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_testfeeper',
								line : i
							});
							testingFree = testingFree ? (testingFree / 100) : 0;
							var reserve = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_overheadper',
								line : i
							});
							reserve = reserve ? (reserve / 100) : 0;
							var otherExpense = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_otherfeeper',
								line : i
							});
							otherExpense = otherExpense ? (otherExpense / 100)
									: 0;
							var royality = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_royalityper',
								line : i
							});
							royality = royality ? (royality / 100) : 0;
							var markdown = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_markdownper',
								line : i
							});
							markdown = markdown ? (markdown / 100) : 0;
							var coopReserve = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_coopreserveper',
								line : i
							});
							coopReserve = coopReserve ? (coopReserve / 100) : 0;
							var ppfp = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_pl_ppfp',
								line : i
							});
							ppfp = ppfp ? (ppfp / 100) : 0;
							var lcl = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_pl_lcl',
								line : i
							});
							lcl = lcl ? lcl : 0;
							// 更改名称vendorTerm改为program Program %
							var program = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_vendtermper',
								line : i
							});
							program = program ? (program / 100) : 0;
							var paymentTerm = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_paytermper',
								line : i
							});
							paymentTerm = paymentTerm ? (paymentTerm / 100) : 0;
							var storeDefectiveAllowance = newRecord
									.getSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_storedaper',
										line : i
									});
							storeDefectiveAllowance = storeDefectiveAllowance ? (storeDefectiveAllowance / 100)
									: 0;
							var gstper = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_trlin_gstper',
								line : i
							});
							gstper = gstper ? (gstper / 100) : 0;
							// 20180717
							var cluballowance = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcoltn_pl_cluballowance',
								line : i
							});
							cluballowance = cluballowance ? (cluballowance / 100)
									: 0;
							var clubinlandfreight = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcoltn_pl_clubinlandfreight',
								line : i
							});
							var clubidchandling = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcoltn_pl_clubidchandling',
								line : i
							});
							var clubstoragfee = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcoltn_pl_clubstoragfee',
								line : i
							});

							// /////////////////////////////////
							// 得到freightAmount
							var freightAmount = getFreightAmount(newRecord, i,
									incoterm, loadcbm, loadpz, loadqty);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_fritamt', i,
									freightAmount);

							// //////////////////////
							// 设置Price Quote和Landed Cost
							var priceQuote;// custcol_tn_quote_firstcost
							var landedCost;

							var brokerageInsAmount = 0;
							var importProfitEliminationAmount = 0;
							var agentAmount = 0;
							var dutyAmount = 0;
							var whseHandling = 0;
							// 费率amount
							var PLIAmount = 0
							var afterServiceAmount = 0;
							var testingFeeAmount = 0;
							var defectiveAllowanceAmount = 0;
							var reserveAmount = 0;
							var programAmount = 0;
							var paymentTermAmt = 0;
							var storeDefectiveAllowanceAmt = 0;
							// 设置gstAmount 201807196
							var gstAmount = 0;

							var salesPrice = 0;
							var royaltyPrice = 0;

							var otherExpenseAmt = FOBQuotePrice * otherExpense;
							var markdownAmt = FOBQuotePrice * markdown;
							var storageCost = 0;
							if (incoterm == '8' || incoterm == '6') {
								storageCost = storeperiod * 0.2;
							} else if (incoterm == '11' || incoterm == '12') {
								storageCost = storeperiod * 2;
							}
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_storecost', i,
									storageCost);
							switch (incoterm) {
							case '3':// FOB
								// Price Quote= N. FOB Price /(1- (Program %
								// +Payment Term %+Store Defective Allowance %);
								// ////////////////////////////////
								// Landed Cost= Price Quote-Store Defective
								// Allowance+
								// Brokerage Ins Amount - Import Profit
								// Elimination Amount + Agent Amount + Freight
								// Amount + Duty Amount+;
								// ////////////////////////////////
								// Store Defective Allowance=Store Defective
								// Allowance%*Price Quote;
								// Brokerage Ins Amount=(Price Quote-Store
								// Defective Allowance) * Brokerage Ins%;
								// Import Profit Elimination Amount= (Price
								// Quote-Store Defective Allowance) * Import
								// Profit Elimination%;
								// Agent Amount= (Price Quote-Store Defective
								// Allowance)* Agent%;
								// Freight Amount= Freight Rate * Loading
								// DIM-CBM / Loading Pack Size;
								// Duty Amount= (Price Quote-Store Defective
								// Allowance) * Duty%;
								priceQuote = FOBQuotePrice
										/ (1 - (program + paymentTerm + storeDefectiveAllowance));
								storeDefectiveAllowanceAmt = storeDefectiveAllowance
										* priceQuote;
								brokerageInsAmount = (priceQuote - storeDefectiveAllowanceAmt)
										* brokerageIns;
								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_broinamt', i,
										brokerageInsAmount);
								importProfitEliminationAmount = (priceQuote - storeDefectiveAllowanceAmt)
										* importProfitElimination;
								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_impfroeliamt', i,
										importProfitEliminationAmount);
								agentAmount = (priceQuote - storeDefectiveAllowanceAmt)
										* agent;
								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_agentamount', i,
										agentAmount);
								dutyAmount = (priceQuote - storeDefectiveAllowanceAmt)
										* duty;
								// gstAmount = gstper * FOBQuotePrice;

								// //////
								landedCost = parseFloat(priceQuote)
										- parseFloat(storeDefectiveAllowanceAmt)
										+ parseFloat(brokerageInsAmount)
										- parseFloat(importProfitEliminationAmount)
										+ parseFloat(agentAmount)
										+ parseFloat(freightAmount)
										+ parseFloat(dutyAmount);
								// log.debug({
								// title : 'landedCost1',
								// details : priceQuote + '|'
								// + storeDefectiveAllowanceAmt + '|'
								// + brokerageInsAmount + '|'
								// + importProfitEliminationAmount
								// + '|' + agentAmount + '|'
								// + freightAmount + '|' +
								// dutyAmount+'|'+otherExpenseAmt+''
								// });
								salesPrice = FOBQuotePrice;
								royaltyPrice = FOBQuotePrice;
								break;
							case '7':// POE
							case '4':// DDP
								// Price Quote= Landed Cost/(1-(Program % +
								// Payment Term %
								// + Store Defective Allowance %));
								// /////////////////
								// Landed Cost=N. FOB Price + Freight Amount +
								// Duty Amount;
								// ////////
								// Duty Amount=Price Quote*Duty%
								dutyAmount = FOBQuotePrice * duty;
								gstAmount = gstper * FOBQuotePrice;

								landedCost = parseFloat(FOBQuotePrice)
										+ parseFloat(freightAmount)
										+ parseFloat(dutyAmount)
										+ parseFloat(gstAmount);
								// log.debug({
								// title : 'landedCost2',
								// details : FOBQuotePrice + '|'
								// + freightAmount + '|' + dutyAmount
								// });
								priceQuote = landedCost
										/ (1 - (program + paymentTerm + storeDefectiveAllowance));
								programAmount = program * priceQuote;
								paymentTermAmt = paymentTerm * priceQuote;
								storeDefectiveAllowanceAmt = storeDefectiveAllowance
										* priceQuote;
								salesPrice = priceQuote - programAmount
										- paymentTermAmt
										- storeDefectiveAllowanceAmt;
								royaltyPrice = priceQuote;
								break;
							case '8':// Warehouse_Collect
								// Price Quote= Landed Cost/(1-(Program % +
								// Payment Term %
								// + Store Defective Allowance %));
								// /////////////////
								// Landed Cost= N. FOB Price + Freight + Duty +
								// Whse Handling + Inbound Charge + Storage Cost
								// + Outbound Charge + Pallet Cost;
								dutyAmount = FOBQuotePrice * duty;
								whseHandling = FOBQuotePrice * whcp;
								gstAmount = gstper * FOBQuotePrice;
								landedCost = parseFloat(FOBQuotePrice)
										+ parseFloat(freightAmount)
										+ parseFloat(dutyAmount)
										+ parseFloat(whseHandling)
										+ parseFloat(inbundcharge)
										+ parseFloat(storageCost)
										+ parseFloat(outbundcharge)
										+ parseFloat(paletcost)
										+ parseFloat(gstAmount);
								priceQuote = landedCost
										/ (1 - (program + paymentTerm + storeDefectiveAllowance));
								programAmount = program * priceQuote;
								paymentTermAmt = paymentTerm * priceQuote;
								storeDefectiveAllowanceAmt = storeDefectiveAllowance
										* priceQuote;
								salesPrice = priceQuote - programAmount
										- paymentTermAmt
										- storeDefectiveAllowanceAmt;
								royaltyPrice = priceQuote;
								break;
							case '6':// Warehouse_Prepaid
								// Price Quote= Landed Cost/(1-(Program % +
								// Payment Term %
								// + Store Defective Allowance %));
								// /////////////////
								// Landed Cost= N. FOB Price + Freight + Duty +
								// Whse Handling + Inbound Charge + Storage Cost
								// + Outbound Charge + Pallet Cost +Freight to
								// customer;
								dutyAmount = FOBQuotePrice * duty;
								whseHandling = FOBQuotePrice * whcp;
								gstAmount = gstper * FOBQuotePrice;
								if (!whseHandling) {
									whseHandling = 0;
								}

								landedCost = parseFloat(FOBQuotePrice)
										+ parseFloat(freightAmount)
										+ parseFloat(dutyAmount)
										+ parseFloat(whseHandling)
										+ parseFloat(inbundcharge)
										+ parseFloat(storageCost)
										+ parseFloat(outbundcharge)
										+ parseFloat(paletcost)
										+ parseFloat(freightToCustomer)
										+ parseFloat(gstAmount);
								// log.debug({
								// title : 'landedCost',
								// details : FOBQuotePrice + '|'
								// + freightAmount + '|' + dutyAmount
								// + '|' + whseHandling + '|'
								// + inbundcharge + '|' + storecost
								// + '|' + outbundcharge + '|'
								// + paletcost + '|'
								// + freightToCustomer + '|'
								// + landedCost
								// });
								priceQuote = landedCost
										/ (1 - (program + paymentTerm + storeDefectiveAllowance));

								programAmount = program * priceQuote;
								paymentTermAmt = paymentTerm * priceQuote;
								storeDefectiveAllowanceAmt = storeDefectiveAllowance
										* priceQuote;
								salesPrice = priceQuote - programAmount
										- paymentTermAmt
										- storeDefectiveAllowanceAmt;
								royaltyPrice = priceQuote;
								break;
							case '11':// Drop Ship_Collect
								// Price Quote= = N. FOB Price + Pallet cost;
								// /////////////////
								// Landed Cost= MD Estimate Factory Cost + PLI
								// Amount + After Service Amount + Defective
								// Allowance Amount + Testing Fee Amount +
								// Reserve Amount + Freight Amount + Duty Amount
								// + Inbound Charge + Storage Cost + Outbound
								// Charge;
								PLIAmount = pli * FOBQuotePrice;
								afterServiceAmount = afterService
										* FOBQuotePrice;
								defectiveAllowanceAmount = mdAllowance
										* FOBQuotePrice;
								testingFeeAmount = testingFree * FOBQuotePrice;
								reserveAmount = reserve * FOBQuotePrice;
								dutyAmount = mdEstimateFactoryCost * duty;
								// log.debug({
								// title : 'mdEstimateFactoryCost',
								// details : mdEstimateFactoryCost + '|'
								// + duty
								// });
								priceQuote = FOBQuotePrice + paletcost;
								gstAmount = gstper * priceQuote;
								landedCost = parseFloat(mdEstimateFactoryCost)
										+ parseFloat(PLIAmount)
										+ parseFloat(afterServiceAmount)
										+ parseFloat(defectiveAllowanceAmount)
										+ parseFloat(testingFeeAmount)
										+ parseFloat(reserveAmount)
										+ parseFloat(freightAmount)
										+ parseFloat(dutyAmount)
										+ parseFloat(inbundcharge)
										+ parseFloat(storageCost)
										+ parseFloat(outbundcharge)
										+ parseFloat(gstAmount)
										+ parseFloat(otherExpenseAmt)
										+ parseFloat(markdownAmt);

								// tmpPrice= Drop Ship_Collect Price
								// Quote-Program Amount-Store Defective
								// Allowance Amount;
								storeDefectiveAllowanceAmt = storeDefectiveAllowance
										* priceQuote;
								programAmount = program * priceQuote;
								salesPrice = priceQuote
										- storeDefectiveAllowanceAmt
										- programAmount;
								royaltyPrice = priceQuote;
								break;
							case '12':// Drop Ship_Prepaid
								PLIAmount = pli * FOBQuotePrice;
								afterServiceAmount = afterService
										* FOBQuotePrice;
								defectiveAllowanceAmount = mdAllowance
										* FOBQuotePrice;
								testingFeeAmount = testingFree * FOBQuotePrice;
								reserveAmount = reserve * FOBQuotePrice;
								dutyAmount = mdEstimateFactoryCost * duty;

								priceQuote = FOBQuotePrice;
								gstAmount = gstper * priceQuote;
								landedCost = parseFloat(mdEstimateFactoryCost)
										+ parseFloat(PLIAmount)
										+ parseFloat(afterServiceAmount)
										+ parseFloat(defectiveAllowanceAmount)
										+ parseFloat(testingFeeAmount)
										+ parseFloat(reserveAmount)
										+ parseFloat(freightAmount)
										+ parseFloat(dutyAmount)
										+ parseFloat(inbundcharge)
										+ parseFloat(storageCost)
										+ parseFloat(outbundcharge)
										+ parseFloat(gstAmount)
										+ parseFloat(otherExpenseAmt)
										+ parseFloat(markdownAmt);

								// tmpPrice= Drop Ship_Collect Price
								// Quote-Program Amount-Store Defective
								// Allowance Amount;
								storeDefectiveAllowanceAmt = storeDefectiveAllowance
										* priceQuote;
								programAmount = program * priceQuote;
								salesPrice = priceQuote
										- storeDefectiveAllowanceAmt
										- programAmount;
								royaltyPrice = priceQuote;
								break;

							default:
								break;
							}
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_firstcost', i, priceQuote);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_firstcostbase', i,
									priceQuote);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_landcost', i, landedCost);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_dutyamt', i, dutyAmount);
							setSublistValue(newRecord, 'item',
									'custcol_tn_trline_gstamount', i, gstAmount);
							// 设置Sales Comm. Amount等费率
							// if (calculateType == 1) {
							// tmpPrice = amount;
							// }
							// log.debug({
							// title : 'salesPrice',
							// details : salesPrice + '|' + salesComm
							// });
							var salesCommAmt = salesPrice * salesComm;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_salcommiamt', i,
									salesCommAmt);
							var pliAmt = FOBQuotePrice * pli;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_pliamt', i, pliAmt);
							var afterServiceAmt = FOBQuotePrice * afterService;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_afterserviceamt', i,
									afterServiceAmt);
							var mdAllowanceAmt = FOBQuotePrice * mdAllowance;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_allowrancamt', i,
									mdAllowanceAmt);
							var testingFreeAmt = FOBQuotePrice * testingFree;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_testfeeamt', i,
									testingFreeAmt);
							var reserveAmt = FOBQuotePrice * reserve;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_overheadamt', i,
									reserveAmt);
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_otherfeeamt', i,
									otherExpenseAmt);
							var royalityAmt = royaltyPrice * royality;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_royalityamt', i,
									royalityAmt);

							// if (incoterm != '11' && incoterm != '12') {
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_markdownamt', i,
									markdownAmt);
							// }
							var ppfpAmt = 0;
							// if (incoterm == '11' || incoterm == '12') {
							var ppfpAmt = priceQuote * ppfp;
							setSublistValue(newRecord, 'item',
									'custcol_tn_pl_ppcfa', i, ppfpAmt);
							// }
							if (incoterm == '11') {
								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_ltlftl', i, ppfpAmt);

							}
							var programAmt = priceQuote * program;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_vendtermamt', i,
									programAmt);

							var paymentTermAmt = priceQuote * paymentTerm;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_termamt', i,
									paymentTermAmt);

							var storeDefectiveAllowanceAmt = priceQuote
									* storeDefectiveAllowance;
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_storeda', i,
									storeDefectiveAllowanceAmt);
							var lclAmt = 0;
							var cluballowanceamount = 0;
							var clubinlandfreightamou = 0;
							var clubidchandlingamount = 0;
							var clubstoragefeeamount = 0;
							if (incoterm == '3') {
								// log.debug({
								// title : 'lclAmt',
								// details : loadcbm + '|' + lcl + '|'
								// + loadpz
								// });
								if (loadcbm && lcl && loadpz) {
									lclAmt = loadcbm * lcl / loadpz;
								}
								setSublistValue(newRecord, 'item',
										'custcol_tn_pl_lcl_amount', i, lclAmt);
								if (cluballowance && priceQuote) {
									// cluballowanceamount = cluballowance
									// * (priceQuote -
									// storeDefectiveAllowanceAmt);
									cluballowanceamount = cluballowance
											* priceQuote;
								}
								setSublistValue(newRecord, 'item',
										'custcoltn_pl_cluballowanceamount', i,
										cluballowanceamount);
								if (clubinlandfreight && loadcbm && loadpz) {
									clubinlandfreightamou = clubinlandfreight
											* loadcbm / loadpz;
								}
								setSublistValue(newRecord, 'item',
										'custcoltn_pl_clubinlandfreightamou',
										i, clubinlandfreightamou);
								if (clubidchandling && loadcbm && loadpz) {
									clubidchandlingamount = clubidchandling
											* loadcbm / loadpz;
								}
								setSublistValue(newRecord, 'item',
										'custcoltn_pl_clubidchandlingamount',
										i, clubidchandlingamount);
								if (clubstoragfee && loadcbm && loadpz) {
									clubstoragefeeamount = clubstoragfee
											* loadcbm / loadpz;
								}
								setSublistValue(newRecord, 'item',
										'custcoltn_pl_clubstoragefeeamount', i,
										clubstoragefeeamount);

							}
							// 设置Total Cost
							var totalCost = 0;
							switch (incoterm) {
							case '3':
								totalCost = parseFloat(mdEstimateFactoryCost)
										+ parseFloat(salesCommAmt)
										+ parseFloat(pliAmt)
										+ parseFloat(afterServiceAmt)
										+ parseFloat(mdAllowanceAmt)
										+ parseFloat(testingFreeAmt)
										+ parseFloat(reserveAmt)
										+ parseFloat(otherExpenseAmt)
										+ parseFloat(royalityAmt)
										+ parseFloat(markdownAmt)
										+ parseFloat(lclAmt)
										+ parseFloat(ppfpAmt);
								// log.debug({
								// title : 'totalCost',
								// details : mdEstimateFactoryCost + '|'
								// + salesCommAmt + '|' + pliAmt + '|'
								// + afterServiceAmt + '|'
								// + mdAllowanceAmt + '|'
								// + testingFreeAmt + '|' + reserveAmt
								// + '|' + otherExpenseAmt + '|'
								// + royalityAmt + '|' + markdownAmt
								// + '|' + lclAmt + '|' + ppfpAmt
								// + '|' + totalCost
								// });
								break;
							case '7':
							case '4':
							case '8':
							case '6':
								totalCost = parseFloat(mdEstimateFactoryCost)
										+ parseFloat(salesCommAmt)
										+ parseFloat(pliAmt)
										+ parseFloat(afterServiceAmt)
										+ parseFloat(mdAllowanceAmt)
										+ parseFloat(testingFreeAmt)
										+ parseFloat(reserveAmt)
										+ parseFloat(otherExpenseAmt)
										+ parseFloat(royalityAmt)
										+ parseFloat(markdownAmt)
										+ parseFloat(ppfpAmt);
								break;

							case '11':
								totalCost = parseFloat(landedCost)
										+ parseFloat(salesCommAmt)
										+ parseFloat(royalityAmt)
										+ parseFloat(programAmt)
										+ parseFloat(paymentTermAmt)
										+ parseFloat(storeDefectiveAllowanceAmt)
										+ parseFloat(ppfpAmt);
								break;

							case '12':
								totalCost = parseFloat(landedCost)
										+ parseFloat(salesCommAmt)
										+ parseFloat(royalityAmt)
										+ parseFloat(programAmt)
										+ parseFloat(paymentTermAmt)
										+ parseFloat(storeDefectiveAllowanceAmt)
										+ parseFloat(ppfpAmt)
										+ parseFloat(paletcost)
										+ parseFloat(freightToCustomer);
								break;

							default:
								break;
							}
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_totalcost', i, totalCost);

							// TODO
							// 设置MD Net Margin %
							if (totalCost > 0 && FOBQuotePrice > 0) {
								var mdNetMargin = (1 - totalCost
										/ FOBQuotePrice) * 100;
								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_netmargin', i,
										mdNetMargin);
							}

							// 设置MD Gross Margin %
							var totalStoreCost = 0;
							if (incoterm != '11' && incoterm != '12') {
								// log.debug({
								// title : 'mdEstimateFactoryCost',
								// details : mdEstimateFactoryCost
								// });
								if (mdEstimateFactoryCost && FOBQuotePrice) {
									var mdGrossMargin = (1 - mdEstimateFactoryCost
											/ FOBQuotePrice) * 100;
									setSublistValue(newRecord, 'item',
											'custcol_tn_quote_grosmargin', i,
											mdGrossMargin);
								}
								// 设置Reserve Amount_landed cost
								var reserveper = newRecord.getSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_pl_rplcp',
									line : i
								});
								reserveper = reserveper / 100;
								if (incoterm == '3') {
									setSublistValue(newRecord, 'item',
											'custcol_tn_pl_rplca', i,
											landedCost * reserveper);

								} else if (incoterm != '-None-') {
									setSublistValue(newRecord, 'item',
											'custcol_tn_pl_rplca', i,
											priceQuote * reserveper);
								}
								// 设置Total Store Cost
								if (incoterm == '3') {
									totalStoreCost = parseFloat(landedCost)
											+ parseFloat(landedCost)
											* reserveper + cluballowanceamount
											+ clubinlandfreightamou
											+ clubidchandlingamount
											+ clubstoragefeeamount;
								} else {
									totalStoreCost = priceQuote;
								}

								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_totalstore', i,
										totalStoreCost);
								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_totalstorebase', i,
										totalStoreCost);

							}
							totalStoreCost = parseFloat(totalStoreCost);
							// 设置MSRP(Retail Price)
							var msrp = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_msrp',
								line : i
							});
							if (factor) {
								msrp = msrp * factor;
							}
							if (incoterm == '12') {
								msrp = FOBQuotePrice;
							}
							setSublistValue(newRecord, 'item',
									'custcol_tn_quote_msrp', i, msrp);
							var markup = 0;
							if (msrp > 0 && incoterm != '12') {
								// 设置Markup %
								if (incoterm != '11') {
									markup = (1 - totalStoreCost / msrp) * 100;
								} else {
									markup = (1 - priceQuote / msrp) * 100;
								}
								setSublistValue(newRecord, 'item',
										'custcol_tn_quote_markupper', i, markup);
							}
							if (incoterm == '3') {
								// 设置9 Digit Freight Amount
								var digifritper = newRecord.getSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_9digifritper',
									line : i
								});
								if (digifritper) {
									digifritper = digifritper / 100;
									setSublistValue(newRecord, 'item',
											'custcol_tn_quote_9digitfrit', i,
											totalStoreCost * digifritper);
									// 设置Import Store Cost (w/ 9 Digit FF)
									setSublistValue(newRecord, 'item',
											'custcol_tn_quote_importstorecost',
											i, totalStoreCost * digifritper
													+ totalStoreCost);
								}
								// 设置Markup % w/9 Digit FF
								if (msrp > 0) {
									setSublistValue(
											newRecord,
											'item',
											'custcol_tn_quote_9digit',
											i,
											(1 - (totalStoreCost * digifritper + totalStoreCost)
													/ msrp) * 100);
								}
							}

							// 设置Whse Handling Charge_Amount
							if (incoterm == '8' || incoterm == '6') {
								setSublistValue(newRecord, 'item',
										'custcol_tn_pl_whcpa', i, whseHandling);
							}

						}

					}
				} catch (e) {
					log.debug({
						title : 'beforeSubmit',
						details : e
					});
					var errorObj = error.create({
						name : e.name,
						message : e.message
					});
					throw errorObj;
				}
			}
			function getFreightAmount(newRecord, i, incoterm, loadcbm, loadpz,
					loadqty) {
				var freightAmount = 0;
				var byCBM = newRecord.getValue({
					fieldId : 'custbody_tn_bycbm'
				});
				// 查询得到freightRate
				var fromPort = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_shipport',
					line : i
				});
				var containerType = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_contentype',
					line : i
				});
				fromPort = fromPort == '' ? '@NONE@' : fromPort;
				var shippingDestination = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_quote_shipdes',
					line : i
				});
				shippingDestination = shippingDestination == '' ? '@NONE@'
						: shippingDestination
				var freightRate;
				var filters = [];
				filters.push([ 'custrecord_tn_fritcost_incoterm', 'anyof',
						incoterm ], 'AND', [ 'custrecord_tn_fritcost_fpot',
						'anyof', fromPort ], 'AND', [
						'custrecord_tn_fritcost_topot', 'anyof',
						shippingDestination ], 'AND', [
						'custrecord_tn_fritcost_iscbm', 'is', byCBM ]);
				if (!byCBM && containerType != '') {
					filters.push('AND', [ 'custrecord_tn_freightcsot_ct', 'is',
							containerType ]);
				}
				// log.debug({
				// title : 'filters',
				// details : filters
				// });
				var fcSearch = search.create({
					type : 'customrecord_tn_freightcost',
					filters : filters,
					columns : [ 'custrecord_tn_fritcost_cost',
							'custrecord_tn_fritcost_iscbm' ]
				});
				fcSearch.run().each(function(result) {
					freightRate = result.getValue({
						name : 'custrecord_tn_fritcost_cost'
					});
					return true;
				});
				if (freightRate && loadcbm && loadpz && byCBM) {
					freightAmount = parseFloat(freightRate)
							* parseFloat(loadcbm) / parseFloat(loadpz);
				} else if (freightRate && loadqty && !byCBM) {
					freightAmount = parseFloat(freightRate)
							/ parseFloat(loadqty);
				}
				return freightAmount;
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
