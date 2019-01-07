/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
		[ 'N/search', 'N/file', 'N/render' ],
		function(search, file, render) {
			// var clientScriptPath = '/SuiteScripts/Trigger/TN_CS_MergeGL.js';
			function onRequest(context) {
				if (context.request.method === 'GET') {
					var request = context.request;
					var parameters = request.parameters;
					var savedTranIds = parameters.savedTranIds;
					var errorMsg = '<html><body><p id="errorMsg">该张合并传票无数据！</p></body></html>';
					// 查询需要的数据
					var initColumn = [ 'tranid', 'account', 'debitamount',
							'creditamount', 'memo', 'currency', 'exchangerate',
							'trandate', 'name' ];
					var renderData = {
						infos : []
					};
					if (!savedTranIds) {
						context.response.write({
							output : errorMsg
						});
						return;
					}
					savedTranIds = savedTranIds.split(',');
					var countNum = 0;
					for (var i = 0; i < savedTranIds.length; i++) {
						var info = {// 数据载体
							date : '',
							tranId : '',
							debit : 0,
							crebit : 0,
							lines : []
						};
						var tranId = savedTranIds[i];
						search
								.create(
										{
											type : search.Type.TRANSACTION,
											filters : [ [ 'internalid', 'is',
													tranId ] ],
											columns : initColumn
										})
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
											var currency = result
													.getText(result.columns[5]);
											var exchangeRate = result
													.getValue(result.columns[6]);
											var date = result
													.getValue(result.columns[7]);
											var name = result
													.getText(result.columns[8]);
											// log.debug({
											// title : 'name',
											// details : name
											// });
											// 如果amount都为0则不显示
											if (!debitAmount && !creditAmount) {
												return true
											}
											var fCurrencyAmount = 0;
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

											// 取最末科目
											var oneClass = '';
											var twoClass = '';
											if (account.indexOf(':') != -1) {
												var accounts = account
														.split(':');
												var oneClass = accounts[0];
												for (var i = 1; i < accounts.length; i++) {
													if (i == 1) {
														twoClass = twoClass
																+ accounts[i];
													} else {
														twoClass = twoClass
																+ ' : '
																+ accounts[i];
													}
												}
											} else {
												oneClass = account;
											}
											info.lines
													.push({
														memo : memo,
														account : oneClass,
														currency : currency,
														name : twoClass,
														exchangeRate : exchangeRate,
														fCurrencyAmount : returnFloat(fCurrencyAmount),
														debitAmount : debitAmount,
														creditAmount : creditAmount,
													});
											info.debit += parseFloat(debitAmount);
											info.crebit += parseFloat(creditAmount);
											if (!info.date) {
												info.date = date;
											}
											if (!info.tranId) {
												info.tranId = tranId;
											}
											return true;
										});
						renderData.infos.push(info);
					}
					// 生成报表
					var xmlTmpl = file.load({
						id : '2874'
					}).getContents();
					var renderer = render.create();
					renderer.templateContent = xmlTmpl;
					renderer.addCustomDataSource({
						format : render.DataSource.OBJECT,
						alias : 'renderData',
						data : renderData
					});
					var fileContent = renderer.renderAsString();
					fileContent = fileContent.replace(/&/g, "&amp;")
					var pdf = render.xmlToPdf({
						xmlString : fileContent
					});
					pdf.name = 'Voucher Report.pdf';
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