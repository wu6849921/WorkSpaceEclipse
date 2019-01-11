/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(
		[ 'N/runtime', 'N/search', 'N/record', 'N/file', 'N/email', 'N/render',
				'N/encode', 'N/format' ],
		function(runtime, search, record, file, email, render, encode, format) {

			function createExcel(xml, name) {
				xml = encode.convert({
					string : xml,
					inputEncoding : encode.Encoding.UTF_8,
					outputEncoding : encode.Encoding.BASE_64
				});

				var excelFile = file.create({
					name : name,
					fileType : file.Type.EXCEL,
					contents : xml
				});

				return excelFile;
			}

			function getCurrentChinaTime() {
				var date = format.format({
					value : new Date(),
					type : format.Type.DATE,
					timezone : 68
				// 中国时间
				});
				return date.replace(/\//g, '-');
			}

			function getInputData() {
				var checkedSummary = runtime.getCurrentScript().getParameter({
					name : 'custscript_checkedsummary'
				});
				checkedSummary = JSON.parse(decodeURIComponent(checkedSummary));

				return checkedSummary.lines;
			}

			function map(context) {
				var line = JSON.parse(context.value);
				var soId = line['custpage_list_createdfrom'];
				var assemItemId = line['custpage_list_item'];
				line.itemRate = line.itemQty = line.itemAmt = 0;
				line.totalCost = line.totalQty = line.avgRate = 0;
				line.margin = line.marginRate = '0%';

				try {
					// load so and find rate, quantity and amount
					var soRec = record.load({
						type : search.Type.SALES_ORDER,
						id : soId
					});
					var lineCount = soRec.getLineCount({
						sublistId : 'item'
					});

					var soExchangeRate = soRec.getValue({
						fieldId : 'exchangerate'
					});

					var findItem = 0;
					for (var i = 0; i < lineCount; i++) {
						var lineItem = soRec.getSublistValue({
							sublistId : 'item',
							fieldId : 'item',
							line : i
						});
						if (lineItem == assemItemId) {
							var lineRate = soRec.getSublistValue({
								sublistId : 'item',
								fieldId : 'rate',
								line : i
							}) || 0;
							var lineQty = soRec.getSublistValue({
								sublistId : 'item',
								fieldId : 'quantity',
								line : i
							}) || 0;
							var lineAmt = soRec.getSublistValue({
								sublistId : 'item',
								fieldId : 'amount',
								line : i
							}) || 0;

							line.itemRate += (lineRate * soExchangeRate);
							line.itemQty += lineQty;
							line.itemAmt += (lineAmt * soExchangeRate);
							findItem++;
						}
					}
					log.debug({
						title : 'line.itemQty1',
						details : line.itemQty
					});
					if (findItem > 1 && line.itemQty) {// 如果有重复的item，计算平均单价，否则用行上的单价
						line.itemRate = line.itemAmt / line.itemQty;
						log.debug({
							title : 'find duplicate items on single so',
							details : soId
						});
					}

					// search wo
					var poIds = [], componentIds = [];
					search.create(
							{
								type : search.Type.WORK_ORDER,
								filters : [ [ 'createdfrom', 'is', soId ],
										'AND', [ 'mainline', 'is', 'T' ],
										'AND', [ 'taxline', 'is', 'F' ] ],
								columns : [ 'internalid' ]
							}).run().each(function(result) {
						var woId = result.id;
						var woRec = record.load({
							type : record.Type.WORK_ORDER,
							id : woId
						});
						var woAssItem = woRec.getValue({
							fieldId : 'assemblyitem'
						});

						if (woAssItem == assemItemId) {
							var lineCount = woRec.getLineCount({
								sublistId : 'item'
							});
							for (var i = 0; i < lineCount; i++) {
								var poId = woRec.getSublistValue({
									sublistId : 'item',
									fieldId : 'poid',
									line : i
								});

								var componentId = woRec.getSublistValue({
									sublistId : 'item',
									fieldId : 'item',
									line : i
								});

								if (poId && poIds.indexOf(poId) == -1) {
									poIds.push(poId);
								}

								if (componentIds.indexOf(componentId) == -1) {
									componentIds.push(componentId);
								}
							}
						}

						return true;
					});

					// 如果没有搜索到wo，就直接搜索po
					if (!poIds.length) {
						search.create(
								{
									type : search.Type.PURCHASE_ORDER,
									filters : [ [ 'createdfrom', 'is', soId ],
											'AND', [ 'mainline', 'is', 'T' ],
											'AND', [ 'taxline', 'is', 'F' ] ],
									columns : [ 'internalid' ]
								}).run().each(function(result) {
							var poId = result.id;
							var poRec = record.load({
								type : record.Type.PURCHASE_ORDER,
								id : poId
							});

							var lineCount = poRec.getLineCount({
								sublistId : 'item'
							});
							for (var i = 0; i < lineCount; i++) {
								var itemId = poRec.getSublistValue({
									sublistId : 'item',
									fieldId : 'item',
									line : i
								});

								if (itemId == assemItemId) {
									poIds.push(poId);
									componentIds.push(itemId);
									break;
								}
							}

							return true;
						});
					}

					log.debug({
						title : 'poIds',
						details : poIds
					});

					log.debug({
						title : 'componentIds',
						details : componentIds
					});
					// search item receipt
					if (poIds.length && componentIds.length) {
						search
								.create(
										{
											type : search.Type.ITEM_RECEIPT,
											filters : [
													[ 'createdfrom', 'anyof',
															poIds ], 'AND',
													[ 'mainline', 'is', 'T' ],
													'AND',
													[ 'taxline', 'is', 'F' ] ],
											columns : [ 'internalid' ]
										})
								.run()
								.each(
										function(result) {
											var itemReceiptId = result.id;
											var itemReceiptRec = record
													.load({
														type : record.Type.ITEM_RECEIPT,
														id : itemReceiptId
													});

											var lineCount = itemReceiptRec
													.getLineCount({
														sublistId : 'item'
													});

											var irExchangeRate = itemReceiptRec
													.getValue({
														fieldId : 'exchangerate'
													});

											for (var i = 0; i < lineCount; i++) {
												var itemId = itemReceiptRec
														.getSublistValue({
															sublistId : 'item',
															fieldId : 'item',
															line : i
														});

												if (componentIds
														.indexOf(itemId) > -1) {
													var itemRate = itemReceiptRec
															.getSublistValue({
																sublistId : 'item',
																fieldId : 'rate',
																line : i
															}) || 0;
													var itemQty = itemReceiptRec
															.getSublistValue({
																sublistId : 'item',
																fieldId : 'quantity',
																line : i
															}) || 0;

													line.totalCost += (itemRate
															* irExchangeRate * itemQty);
													line.totalQty += itemQty;
												}
											}
											return true;
										});

						if (line.itemQty)
							// line.avgRate = ((line.totalCost * 1000) /
							// (line.itemQty * 1000))
							// .toFixed(2);
							// 改为保留四位 20181018 by Joe
							line.avgRate = ((line.totalCost * 1000) / (line.itemQty * 1000))
									.toFixed(4);

						line.margin = (parseInt(line.itemAmt * 100) - parseInt(line.totalCost * 100)) / 100;
						line.marginRate = line.itemAmt ? (line.margin * 100 / line.itemAmt)
								.toFixed(2)
								+ '%'
								: '0%';
					}

					context.write(context.key, line);
				} catch (e) {
					log.debug({
						title : 'map stage error',
						details : e
					});
				}
			}

			function summarize(summary) {
				try {
					var renderData = {
						lines : []
					};
					summary.output
							.iterator()
							.each(
									function(key, value) {
										var line = JSON.parse(value);
										renderData.lines
												.push({
													bin : line['custpage_list_inventorydetail_binnumber'],
													customer : line['custpage_list_customer_companyname'],
													custOrderNo : line['custpage_list_custbody_customer_so_no'],
													itemId : line['custpage_list_item_itemid'],
													custItemCode : line['custpage_list_custcol_tn_cus_item_code'],
													salesQty : line.itemQty,
													purAvgRate : line.avgRate,
													salesRate : line.itemRate,
													purCost : line.totalCost,
													salesAmt : line.itemAmt,
													margin : line.margin,
													marginRate : line.marginRate
												});
										return true;
									});

					/*
					 * log.debug({ title : 'renderData', details : renderData
					 * });
					 */

					var xmlTmpl = file.load({
						id : '711'
					}).getContents();

					var renderer = render.create();
					renderer.templateContent = xmlTmpl;
					renderer.addCustomDataSource({
						format : render.DataSource.OBJECT,
						alias : 'renderData',
						data : renderData
					});
					var fileContent = renderer.renderAsString();
					var fileName = '利润分析表-' + getCurrentChinaTime() + '.xls';
					var excelFile = createExcel(fileContent, fileName);

					// 改成固定Email地址 by joe 20180518
					var emailAddress = 'jenny@homeprod-organizer.com';
//					var emailAddress = 'joe.wu@triggerasia.com';
					// send email
					email.send({
						author : 4,
						recipients : emailAddress,
						bcc:'joe.wu@triggerasia.com',
						subject : '利润分析表结果',
						body : '请查看附件',
						attachments : [ excelFile ]
					});
				} catch (e) {
					email.send({
						author : 4,
						recipients : emailAddress,
						subject : '利润分析表生成失败',
						body : e.toString()
					});
					log.debug({
						title : '利润分析表生成失败',
						details : e
					});
				}

			}

			return {
				getInputData : getInputData,
				map : map,
				summarize : summarize
			}
		});
