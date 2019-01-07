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
					var startDate = parameters.startDate;
					var endDate = parameters.endDate;
					var _mpNum = parameters.mpNum;
					var errorMsg = '<html><body><p id="errorMsg">���źϲ���Ʊ�����ݣ�</p></body></html>';
					var errorMsg2 = '<html><body><p id="errorMsg2">�벻Ҫ�޸ĺϲ����</p></body></html>';
					// �Ȳ�ѯʱ��������еĺϲ�����
					if (!startDate && !endDate && !_mpNum) {
						context.response.write({
							output : errorMsg2
						});
						return;
					}
					var _filters = [];
					if (startDate && endDate) {
						_filters.push([ 'custrecord_tn_payment_date',
								'onorafter', startDate ], 'AND', [
								'custrecord_tn_payment_date', 'onorbefore',
								endDate ]);
					} else if (_mpNum) {
						_filters
								.push([ 'custrecord_tn_mp_number', 'is', _mpNum ]);
					}
					var mpNums = [];
					var mpInfoList = [];
					var mpSearch = search.create({
						type : 'customrecord_tn_payment',
						filters : _filters,
						columns : [ 'custrecord_tn_mp_number',
								'custrecord_tn_payment_entity',
								'custrecord_tn_bankamount',
								'custrecord_tn_payment_bankaccount',
								'custrecord_tn_payment_currency',
								'custrecord_tn_payment_exrate',
								'custrecord_tn_payment_memo',
								'custrecord_tn_bankamountf',
								'custrecord_tn_bankcurrency' ]
					});
					mpSearch.run().each(
							function(result) {
								var mpNum = result.getValue({
									name : 'custrecord_tn_mp_number'
								});
								var payAmt = result.getValue({
									name : 'custrecord_tn_bankamount'
								});
								var payAmtF = result.getValue({
									name : 'custrecord_tn_bankamountf'
								});
								payAmtF = Math.abs(payAmtF);
								var paymentAmount = result.getValue({
									name : 'custrecord_tn_payment_amount'
								});
								var entity = result.getValue({
									name : 'custrecord_tn_payment_entity'
								});
								// var entityName = result.getText({
								// name : 'custrecord_tn_payment_entity'
								// });
								var bankAccount = result.getText({
									name : 'custrecord_tn_payment_bankaccount'
								});
								var currency = result.getText({
									name : 'custrecord_tn_payment_currency'
								});
								var bankCurrency = result.getText({
									name : 'custrecord_tn_bankcurrency'
								});
								var exrate = result.getValue({
									name : 'custrecord_tn_payment_exrate'
								});
								var memo = result.getValue({
									name : 'custrecord_tn_payment_memo'
								});
								if (mpNum && payAmt && payAmt != 0) {
									mpNums.push(mpNum);
									var mpInfo = [];
									var entityName;
									// ��ѯentity����
									var entityType;
									search.create(
											{
												type : search.Type.ENTITY,
												filters : [ [ 'internalid',
														'anyof', entity ] ],
												columns : [ 'entityid',
														'altname' ]
											}).run().each(function(result) {
										entityType = result.recordType;
										var entityid = result.getValue({
											name : 'entityid'
										});
										var altname = result.getValue({
											name : 'altname'
										});
										entityName = entityid + altname;
										return true;
									});
									if (paymentAmount) {
										if (entityType == 'customer') {
											if (payAmt > 0) {// �ͻ�����
												mpInfo.push(1);// 1��Debit
											}
											if (payAmt < 0) {// ���ͻ��˿�
												mpInfo.push(2);// 2��Credit
											}
										} else {
											if (payAmt > 0) {// ����Ӧ�̸���
												mpInfo.push(2);// 2��Credit
											}
											if (payAmt < 0) {// ��Ӧ���˿�
												mpInfo.push(1);// 1��Debit
											}
										}
									} else {
										if (payAmt > 0) {
											mpInfo.push(1);// 1��Debit
										} else {
											mpInfo.push(2);// 1��Credit

										}
									}
									var currencyV = bankCurrency ? bankCurrency
											: currency;
									// log.debug({
									// title : 'entityName',
									// details : entityName
									// });
									mpInfo.push(returnFloat(Math.abs(payAmt)));
									mpInfo.push(bankAccount);
									mpInfo.push(entityName);
									mpInfo.push(currencyV);
									mpInfo.push(payAmtF);
									mpInfo.push(memo);
									mpInfoList.push(mpInfo);
								}
								return true;
							});
					if (mpNums.length == 0) {
						context.response.write({
							output : errorMsg
						});
						return;
					}
					// ��ѯ���кϲ��������ɵĵ���
					var initColumn = [ 'transactionname', 'account',
							'debitamount', 'creditamount', 'memo', 'name',
							'subsidiary', 'department', 'class', 'location',
							'custbody_cseg_tn_area', 'currency',
							'exchangerate', 'fxamount' ];
					var tranDate;
					if (startDate && endDate) {
						tranDate = startDate + '-' + endDate;
					} else {
						tranDate = '';
					}
					var renderData = {// ��������
						date : tranDate,
						mpRec : []
					};

					for (var i = 0; i < mpNums.length; i++) {
						var mpNum = mpNums[i];
						var mpRec = {
							mpNum : mpNum,
							debitAmt : 0,
							creditAmt : 0,
							lines : []
						};
						var debitAmtV = 0;
						var creditAmtV = 0;
						search
								.create(
										{
											type : search.Type.TRANSACTION,
											filters : [ [
													'custbody_tn_mpnumber',
													'is', mpNum ] ],
											columns : initColumn
										})
								.run()
								.each(
										function(result) {
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
											var subsidiary = result
													.getValue(result.columns[6]);
											var department = result
													.getValue(result.columns[7]);
											var classV = result
													.getValue(result.columns[8]);
											var location = result
													.getValue(result.columns[9]);
											var area = result
													.getValue(result.columns[10]);
											var currency = result
													.getText(result.columns[11]);
											var exchangeRate = result
													.getValue(result.columns[12]);
											var fCurrencyAmount = result
													.getValue(result.columns[13]);
											// ���amount��Ϊ0����ʾ
											if (!debitAmount && !creditAmount) {
												return true
											}
											// var fCurrencyAmount = 0;
											fCurrencyAmount = Math
													.abs(fCurrencyAmount);
											if (!debitAmount) {
												debitAmount = 0;
											}
											if (!creditAmount) {
												creditAmount = 0;
											}
											if (account == mpInfoList[i][2]) {
												return true;
											}
											if (account.indexOf(':') != -1) {
												var accNum = account.split(' ')[0];
												var accounts = account
														.split(':');
												account = accNum
														+ ' '
														+ accounts[accounts.length - 1];
											}
											mpRec.lines
													.push({
														account : account,
														debitAmount : debitAmount,
														creditAmount : creditAmount,
														currency : currency,
														fCurrencyAmount : returnFloat(fCurrencyAmount),
														memo : memo,
														name : name,
														subsidiary : subsidiary,
														department : department,
														classV : classV,
														location : location,
														area : area
													});
											debitAmtV += parseFloat(debitAmount);
											creditAmtV += parseFloat(creditAmount);
											return true;
										});

						// ����bankAcount��
						var bankDebit = mpInfoList[i][0] == 1 ? mpInfoList[i][1]
								: 0;
						var bankCredit = mpInfoList[i][0] == 2 ? mpInfoList[i][1]
								: 0;
						var bankAcc = mpInfoList[i][2];
						if (bankAcc.indexOf(':') != -1) {
							var accNum = bankAcc.split(' ')[0];
							var accounts = bankAcc.split(':');
							bankAcc = accNum + ' '
									+ accounts[accounts.length - 1];
						}
						mpRec.lines.push({
							account : bankAcc,
							debitAmount : bankDebit,
							creditAmount : bankCredit,
							currency : mpInfoList[i][4],
							fCurrencyAmount : returnFloat(mpInfoList[i][5]),
							memo : mpInfoList[i][6],
							name : mpInfoList[i][3],
							subsidiary : '',
							department : '',
							classV : '',
							location : '',
							area : ''
						});
						// �����������
						// var mpRecLines = mpRec.lines;
						// var mpDebitLines = [];
						// var mpCreditLines = [];
						// for (var j = 0; j < mpRecLines.length; j++) {
						// var debitAmt = mpRecLines[j].debitAmount;
						// var creAmt = mpRecLines[j].creditAmount;
						// if (creAmt == '0') {
						// mpDebitLines.push(mpRecLines[j]);
						// } else {
						// mpCreditLines.push(mpRecLines[j]);
						// }
						// }
						// // �������
						// mpRec.lines.splice(0, mpRec.lines.length);
						// // ƴ������
						// mpRec.lines =
						// mpRec.lines.concat(mpDebitLines).concat(
						// mpCreditLines);
						// var debitMp = mpRec.lines.concat(mpDebitLines);
						// mpRec.lines = debitMp.concat(mpCreditLines);
						// ///////////////////////////

						debitAmtV += parseFloat(bankDebit);
						creditAmtV += parseFloat(bankCredit);
						debitAmtV = returnFloat(debitAmtV);
						creditAmtV = returnFloat(creditAmtV);
						mpRec.debitAmt = debitAmtV;
						mpRec.creditAmt = creditAmtV;
						// log.debug({
						// title : 'mpRec.crebitAmt',
						// details : mpRec.crebitAmt
						// });
						renderData.mpRec.push(mpRec);
					}

					// ���ɱ���
					var xmlTmpl = file.load({
						id : '87'
					}).getContents();
					var renderer = render.create();
					renderer.templateContent = xmlTmpl;
					renderer.addCustomDataSource({
						format : render.DataSource.OBJECT,
						alias : 'renderData',
						data : renderData
					});
					var fileContent = renderer.renderAsString();
					fileContent = fileContent.replace(/&/g, "_")
					var pdf = render.xmlToPdf({
						xmlString : fileContent
					});
					pdf.name = 'MergePayment Report.pdf';
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