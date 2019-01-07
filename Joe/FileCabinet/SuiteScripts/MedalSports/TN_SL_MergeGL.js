/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
		[ 'N/search', 'N/file', 'N/render', 'N/record' ],
		function(search, file, render, _record) {
			// var clientScriptPath = '/SuiteScripts/Trigger/TN_CS_MergeGL.js';
			function onRequest(context) {
				if (context.request.method === 'GET') {
					var request = context.request;
					var parameters = request.parameters;
					var savedTranIds = parameters.savedTranIds;
					var date = parameters.date;
					var glNum = parameters.glNum;
					var transactionTypeId = parameters.transactionTypeId;
					var errorMsg = '<html><body><p id="errorMsg">该张合并传票无数据！</p></body></html>';
					var errorMsg2 = '<html><body><p id="errorMsg2">请不要修改合并传票！</p></body></html>';
					// 查询需要的数据
					var initColumn = [ 'tranid', 'account',
							search.createColumn({
								name : 'debitamount',
								sort : search.Sort.ASC
							}), 'creditamount', 'memo', 'name', 'currency',
							'custbody_tn_mpnumber', 'fxamount' ];
					var renderData = {
						infos : [],
						debit : 0,
						crebit : 0,
					};
					if (!glNum) {
						context.response.write({
							output : errorMsg2
						});
						return;
					}
					if (!savedTranIds) {
						context.response.write({
							output : errorMsg
						});
						return;
					}
					savedTranIds = savedTranIds.split(',');
					var countNum = 0;
					var info = {// 数据载体
						date : date,
						glNum : glNum,
						lines : [],
						lastPage : 'F'
					};
					for (var i = 0; i < savedTranIds.length; i++) {
						var tranId = savedTranIds[i];
						// 手工je直接查询record操作
						if (transactionTypeId == '4') {
							var jeRecord = _record.load({
								type : _record.Type.JOURNAL_ENTRY,
								id : tranId
							});
							var recLine = jeRecord.getLineCount({
								sublistId : 'line'
							});
							var rectype = jeRecord.type;
							var currency = jeRecord.getText({
								fieldId : initColumn[6]
							});
							for (var j = 0; j < recLine; j++) {
								var tranId = jeRecord.getSublistValue({
									sublistId : 'line',
									fieldId : initColumn[0],
									line : j
								});
								var account = jeRecord.getSublistText({
									sublistId : 'line',
									fieldId : initColumn[1],
									line : j
								});
								var debitAmount = jeRecord.getSublistValue({
									sublistId : 'line',
									fieldId : 'debit',
									line : j
								});
								var creditAmount = jeRecord.getSublistValue({
									sublistId : 'line',
									fieldId : 'credit',
									line : j
								});
								var memo = jeRecord.getSublistValue({
									sublistId : 'line',
									fieldId : initColumn[4],
									line : j
								});
								var name = jeRecord.getSublistText({
									sublistId : 'line',
									fieldId : initColumn[5],
									line : j
								});
								var mpNum = jeRecord.getSublistValue({
									sublistId : 'line',
									fieldId : initColumn[7],
									line : j
								});
								var fCurrencyAmount = jeRecord
										.getSublistValue({
											sublistId : 'line',
											fieldId : 'custcol_tn_usaamount',
											line : j
										});
								if (!debitAmount) {
									debitAmount = 0;
								}
								if (!creditAmount) {
									creditAmount = 0;
								}
								// 对于billPayment memo 进行特殊处理
								if (mpNum && rectype == 'vendorpayment') {
									search
											.create(
													{
														type : 'customrecord_tn_payment',
														filters : [ [
																'custrecord_tn_mp_number',
																'is', mpNum ] ],
														columns : 'custrecord_tn_memoap'
													})
											.run()
											.each(
													function(result) {
														memo = result
																.getValue(result.columns[0]);
													});
								}
								if (account.indexOf(':') != -1) {
									var accNum = account.split(' ')[0];
									var accounts = account.split(':');
									account = accNum + ' '
											+ accounts[accounts.length - 1];
								}
								info.lines
										.push({
											account : account,
											debitAmount : debitAmount,
											creditAmount : creditAmount,
											currency : currency,
											fCurrencyAmount : returnFloat(fCurrencyAmount),
											memo : memo,
											name : name
										});
								renderData.debit += parseFloat(debitAmount);
								renderData.crebit += parseFloat(creditAmount);

								// 12条作为一个内容
								countNum++;
								if (countNum >= 12 && countNum % 12 == 0) {
									var str = JSON.stringify(info);
									var infoTmp = JSON.parse(str);
									renderData.infos.push(infoTmp);
									info.lines = [];
								}
							}

						} else {// 其他类型，用saved search操作
							var tranSearch = search.create({
								type : search.Type.TRANSACTION,
								filters : [ [ 'internalid', 'is', tranId ] ],
								columns : initColumn
							});
							tranSearch
									.run()
									.each(
											function(result) {
												var tranId = result
														.getValue(result.columns[0]);
												var account = result
														.getText(result.columns[1]);
												var debitAmount = result
														.getValue(result.columns[2]);
												var creditAmount = result
														.getValue(result.columns[3]);
												var memo = result
														.getValue(result.columns[4]);
												var name = result
														.getText(result.columns[5]);
												var currency = result
														.getText(result.columns[6]);
												var mpNum = result
														.getValue(result.columns[7]);
												var fCurrencyAmount = result
														.getValue(result.columns[8]);
												// 如果amount都为0则不显示
												if (!debitAmount
														&& !creditAmount) {
													return true
												}
												if (!debitAmount) {
													debitAmount = 0;
												}
												if (!creditAmount) {
													creditAmount = 0;
												}
												// 计算原币金额

												if (!fCurrencyAmount) {
													if (!debitAmount) {
														debitAmount = 0;
														fCurrencyAmount = creditAmount
																/ exchangeRate;
													}
													if (!creditAmount) {
														creditAmount = 0;
														fCurrencyAmount = debitAmount
																/ exchangeRate;
													}
												}
												if (mpNum
														&& result.recordType == 'vendorpayment') {
													search
															.create(
																	{
																		type : 'customrecord_tn_payment',
																		filters : [ [
																				'custrecord_tn_mp_number',
																				'is',
																				mpNum ] ],
																		columns : 'custrecord_tn_memoap'
																	})
															.run()
															.each(
																	function(
																			result) {
																		memo = result
																				.getValue(result.columns[0]);
																	});
												}
												if (account.indexOf(':') != -1) {
													var accNum = account
															.split(' ')[0];
													var accounts = account
															.split(':');
													account = accNum
															+ ' '
															+ accounts[accounts.length - 1];
												}
												info.lines
														.push({
															account : account,
															debitAmount : debitAmount,
															creditAmount : creditAmount,
															currency : currency,
															fCurrencyAmount : returnFloat(fCurrencyAmount),
															memo : memo,
															name : name
														});
												renderData.debit += parseFloat(debitAmount);
												renderData.crebit += parseFloat(creditAmount);

												// 12条作为一个内容
												countNum++;
												if (countNum >= 12
														&& countNum % 12 == 0) {
													var str = JSON
															.stringify(info);
													var infoTmp = JSON
															.parse(str);
													renderData.infos
															.push(infoTmp);
													info.lines = [];
												}
												return true;
											});
						}

					}
					renderData.debit = renderData.debit.toFixed(2);
					renderData.crebit = renderData.crebit.toFixed(2);
					info.lastPage = 'T';
					renderData.infos.push(info);
					// log.debug({
					// title : 'renderData',
					// details : JSON.stringify(renderData)
					// });
					// renderData.debit = returnFloat(renderData.debit);
					// renderData.crebit = returnFloat(renderData.crebit);
					// 生成报表
					var xmlTmpl = file.load({
						id : 'Templates/PDF Templates/MegerGL Template.xml'
					}).getContents();
					var renderer = render.create();
					renderer.templateContent = xmlTmpl;
					renderer.addCustomDataSource({
						format : render.DataSource.OBJECT,
						alias : 'renderData',
						data : renderData
					});
					var fileContent = renderer.renderAsString();
					fileContent = fileContent.replace(/&/g, "&amp;");
					var pdf = render.xmlToPdf({
						xmlString : fileContent
					});
					pdf.name = 'MergeGL Report.pdf';
					context.response.writeFile({
						file : pdf,
						isInline : true
					});
					// context.response.writePage(form);
				} else {
					var request = context.request;
					var parameters = request.parameters;
					log.debug({
						title : 'post',
						details : savedTranId
					});
				}
			}

			function returnFloat(value) {
				var value = Math.round(parseFloat(value) * 100) / 100;
				var xsd = value.toString().split(".");
				if (xsd.length == 1) {
					value = value.toString() + ".00";
					return value;
				}
				if (xsd.length > 1) {
					if (xsd[1].length < 2) {
						value = value.toString() + "0";
					}
					return value;
				}
			}
			return {
				onRequest : onRequest
			};
		});