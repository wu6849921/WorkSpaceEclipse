/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @Autor Charles
 * @Version 1.0
 * @Description generate reports
 */
define(
		[ 'N/render', 'N/file', 'N/cache', 'N/format', 'N/search', 'N/record',
				'N/encode', 'N/url', 'N/runtime', 'N/task', 'N/redirect' ],
		function(render, file, cache, format, search, record, encode, url,
				runtime, task, redirect) {

			// common function
			function convertExcelToHTML(excelXML) {
				var table = excelXML.match(/<Table[\s\S]+?<\/Table>/i);
				if (table) {
					table = table[0]
							.replace(
									/<Table /ig,
									'<Table border="1" style="border-collapse:collapse;margin:0px auto;text-align:center;font-size:12px;"')
							.replace(/<Column[\s\S]+?\/>/ig, '').replace(
									/<Row /ig, '<tr ').replace(/<\/Row>/ig,
									'</tr>').replace(/<Cell /ig, '<td ')
							.replace(/<\/Cell>/ig, '</td>').replace(/\/>/ig,
									'>&nbsp;</td>').replace(/<Data /ig, '<p ')
							.replace(/<\/Data>/ig, '<\p>').replace(
									/ss:MergeAcross="\d"/ig,
									function(value) {
										var num = value.slice(value
												.indexOf('"') + 1, -1);
										return 'colspan="'
												+ (parseInt(num) + 1) + '"';
									}).replace(
									/ss:MergeDown="\d"/ig,
									function(value) {
										var num = value.slice(value
												.indexOf('"') + 1, -1);
										return 'rowspan="'
												+ (parseInt(num) + 1) + '"';
									});

					return table;
				} else {
					return '<p>No table row element</p>';
				}
			}

			function createHTMLPage(html, fileName) {
				var downURL = url.resolveScript({
					scriptId : 'customscript_tn_createreports',
					deploymentId : 'customdeploy_tn_createreports',
					params : {
						cacheName : fileName,
						reporttype : 'download'
					}
				});
				var pageContent = '<html>'
						+ '<head><style>'
						+ 'td {min-width:50px;}'
						+ '</style></head>'
						+ '<body style="width:96%;box-shadow: 0px 0px 5px #888888;margin:10px 1%;text-align:center; padding:10px 1%;font-size:12px;">'
						+ '<h3>����Ԥ��</h3>'
						+ html
						+ '<button style="margin:20px auto;" id="download" data-link='
						+ downURL
						+ '>�������Excel����</button>'
						+ '<iframe style="display:none;" id="fileloader"></iframe>'
						+ '<script src="/c.TSTDRV1005259/suitebundle264410/TN_CS_DownloadPage.js"></script>'
						+ '</body>';

				return pageContent;
			}

			// create excel file
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

			// create and output pdf
			function outputPDF(response, tplID, renderData, fileName) {
				var xmlTmpl = file.load({
					id : tplID
				}).getContents();

				var renderer = render.create();
				renderer.templateContent = xmlTmpl;
				renderer.addCustomDataSource({
					format : render.DataSource.OBJECT,
					alias : 'renderData',
					data : renderData
				});
				var fileContent = renderer.renderAsString();

				// �����ַ�ʽ��Ϊ���޸���������pdf��bug
				var triggerCache = cache.getCache({
					name : 'TriggerCache',
					scope : cache.Scope.PRIVATE
				});

				triggerCache.put({
					key : fileName,
					value : fileContent,
					ttl : 8 * 60 * 60
				// ����һ��������
				});

				redirect.toSuitelet({
					scriptId : 'customscript_tn_createreports',
					deploymentId : 'customdeploy_tn_createreports',
					parameters : {
						'reporttype' : 'downloadPDF',
						'cacheName' : fileName
					}
				});
				/*
				 * var pdf = renderer.renderAsPdf(); pdf.name = fileName;
				 * response.writeFile({ file : pdf, isInline : true });
				 */
				// renderer.renderPdfToResponse(response, true);
				return true;
			}

			// download pdf
			function downloadPDF(response, parameters) {
				try {
					var errorMsg = '<html><body><p id="errorMsg">�������ڻ����Ѿ�����, �����´�ӡ</p></body></html>';
					var errorMsg2 = '<html><body><p id="errorMsg">�����������ϵ����Ա��</p></body></html>';
					var cacheName = parameters.cacheName;
					if (cacheName) {
						var triggerCache = cache.getCache({
							name : 'TriggerCache',
							scope : cache.Scope.PRIVATE
						});

						var cachedContent = triggerCache.get({
							key : cacheName
						});
						// log.debug({
						// title : 'cachedContent',
						// details : cachedContent
						// });
						if (cachedContent) {
							var pdf = render.xmlToPdf({
								xmlString : cachedContent
							});
							pdf.name = cacheName;
							response.writeFile({
								file : pdf,
								isInline : true
							});
							return true;
						} else {
							response.write({
								output : errorMsg
							});
							return false;
						}
					}

					response.write({
						output : errorMsg
					});
					return false;
				} catch (e) {
					log.debug({
						title : 'downloadPDFError',
						details : e.toString()
					});
					response.write({
						output : errorMsg2
					});
					// return false;
				}

			}

			// create and download excel files
			function download(response, parameters) {
				 log.debug({
				 title : 'parameters.cacheName',
				 details : parameters.cacheName
				 });
				var cacheName = parameters.cacheName;
				if (cacheName) {
					var triggerCache = cache.getCache({
						name : 'TriggerCache',
						scope : cache.Scope.PRIVATE
					});

					var cachedContent = triggerCache.get({
						key : cacheName
					});

					if (cachedContent) {
						var excelFile = createExcel(cachedContent, cacheName);
						response.writeFile({
							file : excelFile,
							isInline : true
						});
						return true;
					} else {
						response
								.write({
									output : '<html><body><p id="errorMsg">�������ڻ����Ѿ�����, �����´�ӡ</p></body></html>'
								});
						return false;
					}
				}

				response
						.write({
							output : '<html><body><p id="errorMsg">�������ڻ����Ѿ�����, �����´�ӡ</p></body></html>'
						});
				return false;
			}

			// remove file cache
			function removeFileCache(parameters) {
				var cacheName = parameters.cacheName;
				if (cacheName) {
					var triggerCache = cache.getCache({
						name : 'TriggerCache',
						scope : cache.Scope.PRIVATE
					});

					triggerCache.remove({
						key : cacheName
					});
				}
			}

			// get print date
			function getCurrentChinaTime() {
				var date = format.format({
					value : new Date(),
					type : format.Type.DATETIMETZ,
					timezone : 68
				// �й�ʱ��
				});
				return date;
			}

			function getCurrentChinaDate() {
				var date = getCurrentChinaTime();
				date = format.parse({
					value : date,
					type : format.Type.DATE
				});
				date = format.format({
					value : date,
					type : format.Type.DATE
				});
				return date;
			}

			function formatPercent(num) {
				return (num * 100).toFixed(2) + '%';
			}

			// preview Excel
			function previewExcel(option) {
				var response = option.response;
				var tplID = option.tplID;
				var renderData = option.renderData;
				var fileName = option.fileName;
				var wbMsg = option.wbMsg || '';
				// log.debug({
				// title : 'tplID',
				// details : tplID
				// });
				var xmlTmpl = file.load({
					id : tplID
				}).getContents();

				var renderer = render.create();
				renderer.templateContent = xmlTmpl;
				renderer.addCustomDataSource({
					format : render.DataSource.OBJECT,
					alias : 'renderData',
					data : renderData
				});
				var fileContent = renderer.renderAsString();

				var timeStamp = getCurrentChinaTime().replace(/\/|:|\s+/g, '-');
				fileName = fileName + '-' + timeStamp + '.xls';

				// ���ļ����ݴ洢�������У��ȴ��û�����
				var triggerCache = cache.getCache({
					name : 'TriggerCache',
					scope : cache.Scope.PRIVATE
				});

				triggerCache.put({
					key : fileName,
					value : fileContent,
					ttl : 8 * 60 * 60
				// ����һ��������
				});

				var html = convertExcelToHTML(fileContent);
				html = createHTMLPage(wbMsg + html, fileName);
				response.write({
					output : html
				});
				return true;
			}

			// write back to invoice
			function writeBack(info) {
				/*
				 * load��saveһ��iff���Ĵ�Լ30 goverance,suitelet��Լ���Դ���34��record
				 */
				var failedIds = [];
				var currentScript = runtime.getCurrentScript();
				var recLink = 'https://system.na2.netsuite.com/app/accounting/transactions/custinvc.nl?id=';

				Object
						.keys(info.summary)
						.every(
								function(recId) {
									try {
										var lines = info.summary[recId];
										var wbRecord = record.load({
											type : record.Type.INVOICE,
											id : recId
										});

										wbRecord.setValue({
											fieldId : 'custbody_tn_com_inv_no',
											value : info.input_invoiceNo
										});
										wbRecord.setValue({
											fieldId : 'custbody_tn_etd_date',
											value : format.parse({
												value : info.input_sailingDate,
												type : format.Type.DATE
											})
										});
										wbRecord.setValue({
											fieldId : 'terms',
											value : info.input_termsOfPayment
										});

										// loop lines
										var lineCount = wbRecord.getLineCount({
											sublistId : 'item'
										});

										lines
												.forEach(function(line) {
													for (var i = 0; i < lineCount; i++) {
														var itemID = wbRecord
																.getSublistValue({
																	sublistId : 'item',
																	fieldId : 'item',
																	line : i
																});

														var cntQty = wbRecord
																.getSublistValue({
																	sublistId : 'item',
																	fieldId : 'custcol_tn_carton_qty',
																	line : i
																});

														var quantity = wbRecord
																.getSublistValue({
																	sublistId : 'item',
																	fieldId : 'quantity',
																	line : i
																});

														var deliveryDate = wbRecord
																.getSublistValue({
																	sublistId : 'item',
																	fieldId : 'custcol_tn_del_date',
																	line : i
																});

														if (deliveryDate) {
															deliveryDate = format
																	.format({
																		value : deliveryDate,
																		type : format.Type.DATE
																	});
														} else if (deliveryDate == null) {
															deliveryDate = '';
														}

														if (itemID == line['custpage_list_item']
																&& deliveryDate == line['custpage_list_custcol_tn_del_date']
																&& cntQty == line['custpage_list_custcol_tn_carton_qty']
																&& quantity == line['custpage_list_quantity']) {
															wbRecord
																	.setSublistValue({
																		sublistId : 'item',
																		fieldId : 'custcol_tn_ship_no',
																		line : i,
																		value : line['custpage_list_custcol_tn_ship_no']
																	});

															wbRecord
																	.setSublistValue({
																		sublistId : 'item',
																		fieldId : 'custcol_tn_con_no',
																		line : i,
																		value : line['custpage_list_custcol_tn_con_no']
																	});

															wbRecord
																	.setSublistValue({
																		sublistId : 'item',
																		fieldId : 'custcol_tn_seal_no',
																		line : i,
																		value : line['custpage_list_custcol_tn_seal_no']
																	});

															wbRecord
																	.setSublistValue({
																		sublistId : 'item',
																		fieldId : 'custcol_tn_con_typ',
																		line : i,
																		value : line['custpage_list_custcol_tn_con_typ']
																	});

															return true;
														}
													}

													failedIds.push(recId);
												});

										wbRecord.save({
											ignoreMandatoryFields : true
										});

										delete info.summary[recId];

										if (currentScript.getRemainingUsage() > 50) {
											return true;
										} else {
											return false;
										}
									} catch (e) {
										failedIds.push(recId);
										log
												.debug({
													title : 'Invoice write back failed, id is '
															+ recId,
													details : e.toString()
												});
										return true;
									}
								});

				var remainRec = Object.keys(info.summary), rspMsg = '';
				if (remainRec.length) {
					failedIds = failedIds.concat(remainRec)
				}

				if (failedIds.length) {
					var idCache = {};
					failedIds.forEach(function(id) {
						idCache[id] = id;
					});
					failedIds = Object.keys(idCache);
					rspMsg = failedIds
							.map(function(failedId) {
								var html = '<p><a style="color:red;" target="_blank" href="'
										+ recLink
										+ failedId
										+ '">'
										+ failedId
										+ '</a></p>';
								return html;
							});
					rspMsg = '<p style="color:red;">���¼�¼��дʧ�ܣ����ֶ���д:</p>'
							+ rspMsg.join('');
				}

				return rspMsg;
			}

			// convert number to words
			function toWords(s) {
				var th = [ '', 'thousand', 'million', 'billion', 'trillion' ];
				var dg = [ 'zero', 'one', 'two', 'three', 'four', 'five',
						'six', 'seven', 'eight', 'nine' ];
				var tn = [ 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
						'fifteen', 'sixteen', 'seventeen', 'eighteen',
						'nineteen' ];
				var tw = [ 'twenty', 'thirty', 'forty', 'fifty', 'sixty',
						'seventy', 'eighty', 'ninety' ];

				s = s.toString();
				s = s.replace(/[\, ]/g, '');
				if (s != parseFloat(s))
					return 'not a number';
				var x = s.indexOf('.');
				if (x == -1)
					x = s.length;
				if (x > 15)
					return 'too big';
				var n = s.split('');
				var str = '';
				var sk = 0;
				for (var i = 0; i < x; i++) {
					if ((x - i) % 3 == 2) {
						if (n[i] == '1') {
							str += tn[Number(n[i + 1])] + ' ';
							i++;
							sk = 1;
						} else if (n[i] != 0) {
							str += tw[n[i] - 2] + ' ';
							sk = 1;
						}
					} else if (n[i] != 0) {
						str += dg[n[i]] + ' ';
						if ((x - i) % 3 == 0)
							str += 'hundred ';
						sk = 1;
					}

					if ((x - i) % 3 == 1) {
						if (sk)
							str += th[(x - i - 1) / 3] + ' ';
						sk = 0;
					}
				}
				if (x != s.length) {
					var y = s.length;
					var pointNum = parseInt(s.split('.')[1]);
					if (pointNum) {
						str += ' and ';
						str += toWords(pointNum);
						str += (pointNum > 1 ? ' cents only' : ' cent only')
					}
					// for (var i=x+1; i<y; i++) str += dg[n[i]] +' ';
				}
				return str.replace(/\s+/g, ' ').toUpperCase();
			}

			// get year string
			function getYearRange(year) {
				var start = new Date(), end = new Date();
				start.setFullYear(year, 0, 1);
				end.setFullYear(year, 11, 31);
				start = format.format({
					value : start,
					type : format.Type.DATE
				});
				end = format.format({
					value : end,
					type : format.Type.DATE
				});

				return [ start, end ];
				/*
				 * return { start : start, end : end }
				 */
			}

			// PRINT FUNCTION
			// po 1 to n PO C�ϲ���ӡ
			function po1toN(response, parameters) {
				// log.debug({
				// title : 'PO C�ϲ���ӡstart��'
				// });
				// �������� �ж��Ƿ����޽���ӡ add by joe 20180329
				var printType = parameters.printtype;

				var checkedSummary = decodeURIComponent(parameters.checkedsummary);
				checkedSummary = JSON.parse(checkedSummary);
				var printDate = getCurrentChinaTime();
				var orderNote = checkedSummary.orderNote || '';
				var fileName = printDate.replace(/\/|:|\s+/g, '-') + '.pdf';

				// construct render data
				var renderData = {
					poNos : '',// �ɹ�����
					vender : '',// ��Ӧ��
					venderAdd : '',// ��Ӧ�̵�ַ
					printDate : printDate,// ��ӡ����
					remarks : orderNote,// ��ע
					contactPerson : '',// ��ϵ��
					contactPhone : '',// ��ϵ����
					fax : '',// ����
					deliveryTerm : '',// ������ʽ
					deliveryPort : '',// �����ص�
					termsOfPayment : '',// ���ʽ
					custItemNo : '',// �ͻ���Ʒ����
					subCustItemNo : '',// �ͻ���Ʒ����
					description : '',// ��Ʒ����
					upc : '',// upc
					boxsize : '',// ����ߴ�
					notice : '',// ����ע������
					status : 'Approved',
					totalQty : 0,
					totalCtnQty : 0,
					totalAmt : 0,
					lines : []
				// ������
				};

				checkedSummary.lines
						.forEach(function(line, index) {

							// P.O.NO.���ɹ����ţ�
							renderData.poNos += line['custpage_list_tranid']
									+ '<br />';

							// vendor����Ӧ������
							if (!renderData.vender) {
								var venderName = line['custpage_list_vendor_companyname'];
								if (venderName) {
									fileName = 'C-' + venderName + '-'
											+ fileName;
									renderData.vender = venderName;
								}
							}

							// vendor add����Ӧ������ַ��
							if (!renderData.venderAdd) {
								var venderAddress = line['custpage_list_vendor_address'];
								if (venderAddress) {
									var lastIndex = venderAddress
											.lastIndexOf(' ');
									renderData.venderAdd = venderAddress
											.substring(0, lastIndex);
									// renderData.venderAdd = venderAddress;
								}
							}

							// ��ϵ�ˣ��绰������
							if (!renderData.contactPerson) {
								var primaryContact = line['custpage_list_vendor_contact'];
								if (primaryContact) {
									var contactInfo = search
											.lookupFields({
												type : search.Type.CONTACT,
												id : primaryContact,
												columns : [ 'entityid',
														'phone', 'fax' ]
											});
									renderData.contactPerson = contactInfo['entityid'];
									renderData.contactPhone = contactInfo['phone'];
									renderData.fax = contactInfo['fax'];
								}
							}

							// delivery term��������ʽ��
							if (!renderData.deliveryTerm) {
								var deliveryTerm = line['custpage_list_custbody_del_term'];
								if (deliveryTerm) {
									renderData.deliveryTerm = deliveryTerm;
								}
							}

							// delivery port�������ص㣩
							if (!renderData.deliveryPort) {
								var deliveryPort = line['custpage_list_custbody_del_port']
								if (deliveryPort) {
									renderData.deliveryPort = deliveryPort;
								}
							}

							// terms of payment�����ʽ��
							if (!renderData.termsOfPayment) {
								var termsOfPayment = line['custpage_list_custbody_tn_pay_term'];
								if (termsOfPayment) {
									renderData.termsOfPayment = termsOfPayment;
								}
							}

							// �ͻ���Ʒ����
							if (!renderData.custItemNo) {
								var custItemNo = line['custpage_list_custcol_tn_cus_item_code'];
								if (custItemNo) {
									renderData.custItemNo = custItemNo;
								}
							}

							// �ͻ���Ʒ����
							if (!renderData.subCustItemNo) {
								var subCustItemNo = line['custpage_list_custcol_tn_cus_pro_id'];
								if (subCustItemNo) {
									renderData.subCustItemNo = subCustItemNo;
								}
							}

							// ��Ʒ����
							if (!renderData.description) {
								var description = search.lookupFields({
									type : search.Type.ITEM,
									id : line['custpage_list_item'],
									columns : 'purchasedescription'
								});
								description = description['purchasedescription'];
								if (description) {
									renderData.description = description
											.replace(/\n/g, '<br/>').replace(
													/&/g, '&amp;');
								}
							}

							// upc
							if (!renderData.upc) {
								var upc = line['custpage_list_custcol_tn_upc'];
								if (upc) {
									renderData.upc = upc;
								}
							}

							// ����ߴ�
							if (!renderData.boxsize) {
								var outLength = line['custpage_list_custcol_tn_out_length'];
								var outWidth = line['custpage_list_custcol_tn_out_width'];
								var outHeight = line['custpage_list_custcol_tn_out_height'];
								var boxSize = outLength + '*' + outWidth + '*'
										+ outHeight;
								// var boxSize =
								// line['custpage_list_custcol_tn_car_size'];
								if (boxSize !== '**') {
									renderData.boxsize = boxSize;
								}
							}

							// ����ע������
							if (!renderData.notice) {
								var notice = line['custpage_list_custbody_tn_bus_con'];
								if (notice) {
									renderData.notice = notice;
								}
							}

							// �ж��Ƿ����ǩ��
							if (line['custpage_list_approvalstatus'] != 'Approved'
									&& renderData.status == 'Approved') {
								renderData.status = line['custpage_list_approvalstatus'];
							}

							// line items
							var qty = parseFloat(line['custpage_list_quantity']) || 0;
							var ctnQty = parseFloat(line['custpage_list_custcol_tn_carton_qty']) || 0;
							var total = parseFloat(line['custpage_list_fxamount']) || 0;

							var unitPrice = parseFloat(line['custpage_list_rate']);
							var exchangeRate = parseFloat(line['custpage_list_exchangerate']);
							unitPrice = (unitPrice * 10000)
									/ (exchangeRate * 10000);

							renderData.totalQty += qty;
							renderData.totalCtnQty += ctnQty;
							renderData.totalAmt += total;
							// log.debug({
							// title :
							// line['custpage_list_custbody_port_of_dest']
							// });
							renderData.lines
									.push({
										sid : index + 1,
										deliveryDate : line['custpage_list_custcol_tn_del_date'],// delivery
										// date
										// ��������
										estimateInspection : line['custpage_list_custcol_tn_est_ins_date'],// Estimate
										// inspectionԤ������
										soNo : line['custpage_list_custbody_customer_so_no'],// �ͻ�������
										destinationPort : line['custpage_list_custbody_port_of_dest'],// Destination
										// PortĿ�ĸۿ�
										ctnQty : ctnQty,// CNT QTY ����
										packQty : line['custpage_list_custcol_tn_pack_size'],// PACK
										// QTY
										// װ����
										units : line['custpage_list_unit'],// ������λ
										qty : qty,// QTY ����
										unitPrice : unitPrice.toFixed(3),// unit
										// price
										// ����
										currency : line['custpage_list_currency'],// ����
										total : total.toFixed(2),// total �ܽ��
										note : line['custpage_list_custcol_tn_note']
									// Note ��ע
									});
						});

				renderData.totalAmt = renderData.totalAmt.toFixed(2);
				// joe
				if (printType == '1')
					outputPDF(response, '379', renderData, fileName);
				else
					outputPDF(response, '2431', renderData, fileName);
				return true;
			}

			// po n to n PO AE�ϲ���ӡ
			function poNtoN(response, parameters) {
				// log.debug({
				// title : 'PO AE�ϲ���ӡstart��'
				// });
				// �������� �ж��Ƿ����޽���ӡ add by joe 20180329
				var printType = parameters.printtype;
				var checkedSummary = decodeURIComponent(parameters.checkedsummary);
				checkedSummary = JSON.parse(checkedSummary);
				var printDate = getCurrentChinaTime();
				var orderNote = checkedSummary.orderNote || '';
				var fileName = printDate.replace(/\/|:|\s+/g, '-') + '.pdf';
				var itemIDs = [];

				// construct render data
				var renderData = {
					printDate : printDate,// ��ӡ����
					remarks : orderNote,// ��ע
					vender : '',// ��Ӧ��
					customerName : '',// �ͻ�����
					venderAdd : '',// ��Ӧ�̵�ַ
					contactPerson : '',// ��ϵ��
					contactPhone : '',// ��ϵ�绰
					fax : '',// ��ϵ�˴���
					subCustName : '',// �ӿͻ���
					deliveryPort : '',// �����ص�
					deliveryTerm : '',// ������ʽ
					termsOfPayment : '',// ���ʽ
					notice : '',// ��������
					status : 'Approved',
					totalCtnQty : 0,
					totalQty : 0,
					totalAmt : 0,
					lines : []
				// lines
				};

				checkedSummary.lines
						.forEach(function(line, index) {
							// vendor����Ӧ������
							if (!renderData.vender) {
								var venderName = line['custpage_list_vendor_companyname'];
								if (venderName) {
									fileName = 'AE-' + venderName + '-'
											+ fileName;
									renderData.vender = venderName;
								}
							}
							;

							// �ͻ�����
							if (!renderData.customerName) {
								var customerName = line['custpage_list_customer_companyname'];
								if (customerName) {
									renderData.customerName = customerName;
								}
							}
							;

							// vendor add����Ӧ������ַ��
							if (!renderData.venderAdd) {
								var venderAddress = line['custpage_list_vendor_address'];
								if (venderAddress) {
									var lastIndex = venderAddress
											.lastIndexOf(' ');
									renderData.venderAdd = venderAddress
											.substring(0, lastIndex);
								}
							}

							// ��ϵ�ˣ��绰������
							if (!renderData.contactPerson) {
								var primaryContact = line['custpage_list_vendor_contact'];
								if (primaryContact) {
									var contactInfo = search
											.lookupFields({
												type : search.Type.CONTACT,
												id : primaryContact,
												columns : [ 'entityid',
														'phone', 'fax' ]
											});
									renderData.contactPerson = contactInfo['entityid'];
									renderData.contactPhone = contactInfo['phone'];
									renderData.fax = contactInfo['fax'];
								}
							}

							// �ӿͻ���
							if (!renderData.subCustName) {
								var subCustName = line['custpage_list_custbody_sub_customer_companyname'];
								if (subCustName) {
									renderData.subCustName = subCustName;
								}
							}

							// delivery term��������ʽ��
							if (!renderData.deliveryTerm) {
								var deliveryTerm = line['custpage_list_custbody_del_term'];
								if (deliveryTerm) {
									renderData.deliveryTerm = deliveryTerm;
								}
							}

							// delivery port�������ص㣩
							if (!renderData.deliveryPort) {
								var deliveryPort = line['custpage_list_custbody_del_port'];
								if (deliveryPort) {
									renderData.deliveryPort = deliveryPort;
								}
							}

							// terms of payment�����ʽ��
							if (!renderData.termsOfPayment) {
								var termsOfPayment = line['custpage_list_custbody_tn_pay_term'];
								if (termsOfPayment) {
									renderData.termsOfPayment = termsOfPayment;
								}
							}

							// ����ע������
							if (!renderData.notice) {
								var notice = line['custpage_list_custbody_tn_bus_con'];
								if (notice) {
									renderData.notice = notice;
								}
							}

							// �ж��Ƿ����ǩ��
							if (line['custpage_list_approvalstatus'] != 'Approved'
									&& renderData.status == 'Approved') {
								renderData.status = line['custpage_list_approvalstatus'];
							}

							// ��¼itemid���Ա���һ��������item����
							var itemID = line['custpage_list_item'];
							if (itemIDs.indexOf(itemID) == -1) {
								itemIDs.push(itemID);
							}

							// line items
							var UPC = line['custpage_list_custcol_tn_upc'];
							if (UPC)
								UPC = '<span>UPC</span> ' + UPC;

							var qty = parseFloat(line['custpage_list_quantity']) || 0;
							var ctnQty = parseFloat(line['custpage_list_custcol_tn_carton_qty']) || 0;
							var total = parseFloat(line['custpage_list_fxamount']) || 0;

							var unitPrice = parseFloat(line['custpage_list_rate']);
							var exchangeRate = parseFloat(line['custpage_list_exchangerate']);
							unitPrice = (unitPrice * 10000)
									/ (exchangeRate * 10000);

							renderData.totalQty += qty;
							renderData.totalCtnQty += ctnQty;
							renderData.totalAmt += total;

							renderData.lines
									.push({
										sid : index + 1,// ���
										soNo : line['custpage_list_custbody_customer_so_no'],// �ͻ�������
										custItemNo : line['custpage_list_custcol_tn_cus_item_code'],// �ͻ���Ʒ����
										subCustItemNo : line['custpage_list_custcol_tn_sub_cus_item_co'],// �ӿͻ���Ʒ����
										subCustSoNo : line['custpage_list_custbody_sub_customer_so_no'],// �ӿͻ�������
										itemProductNo : line['custpage_list_custcol_tn_com_pro_id'],// ��˾��Ʒ����
										itemCnName : line['custpage_list_custcol_tn_item_cn_name'],// ��Ʒ����
										itemID : itemID,
										description : '',// ��Ʒ����
										UPC : UPC,// upc
										outUPC : line['custpage_list_custcol_tn_out_upc'],// ����UPC����
										ctnQty : ctnQty,// ����
										packQty : line['custpage_list_custcol_tn_pack_size'],// PACK
										// QTY
										// װ����
										units : line['custpage_list_unit'],// ������λ
										qty : qty,// QTY ����
										currency : line['custpage_list_currency'],// ����
										unitPrice : unitPrice.toFixed(3),// unit
										// price
										// ����
										total : total.toFixed(2),// total �ܽ��
										deliveryDate : line['custpage_list_custcol_tn_del_date'],// delivery
										// date
										// ��������
										note : line['custpage_list_custcol_tn_note']
									// Note ��ע
									});
						});

				renderData.totalAmt = renderData.totalAmt.toFixed(2);

				// ����item����
				var descriptionCollection = {};
				search.create({
					type : search.Type.ITEM,
					filters : [ [ 'internalid', 'anyof', itemIDs ] ],
					columns : [ 'purchasedescription' ]
				}).run().each(function(result) {
					descriptionCollection[result.id] = result.getValue({
						name : 'purchasedescription'
					}).replace(/\n/g, '<br/>').replace(/&/g, '&amp;');
					return true;
				});

				renderData.lines.forEach(function(line) {
					line.description = descriptionCollection[line.itemID];
				});
				// joe
				if (printType == '1')
					outputPDF(response, '388', renderData, fileName);
				else
					outputPDF(response, '2432', renderData, fileName);
				return true;
			}

			// commercial invoice
			function commercialInvoice(response, parameters) {
				var checkedSummary = decodeURIComponent(parameters.checkedsummary);
				checkedSummary = JSON.parse(checkedSummary);
				var printDate = getCurrentChinaDate();
				var addressParts;

				var renderData = {
					// body fields
					soNos : [],
					input_termsOfPayment : checkedSummary.termsOfPaymentText,
					input_sailingDate : checkedSummary.etdDate,
					input_invoiceNo : checkedSummary.invoiceNo,
					printDate : printDate,
					companyName : checkedSummary.companyName.split('<br>'),
					customerName : '',
					customerAddPart1 : '',
					to : '',
					delTermPort : '',
					ctnQtyTotal : 0,
					qtyTotal : 0,
					amountTotal : 0,
					amountTotalCapital : 0,
					// groups
					groups : []
				}

				var SPECIALS = [
						[ 'Style Number:', 'DESCRIPTION:', 'Net Weight:',
								'Gross Weight:', 'Cube:cmX cmX cm' ],
						[ 'Country of origin:', 'Pieces or sets per cartons:',
								'Purchase order number:', 'Carton number��of' ] ];
				var SONOS = [];
				var writeBackInfo = {
					input_invoiceNo : renderData.input_invoiceNo,
					input_sailingDate : renderData.input_sailingDate,
					input_termsOfPayment : checkedSummary.termsOfPayment,
					summary : {}
				};

				checkedSummary.lines
						.forEach(function(line) {
							var shipNo = line['custpage_list_custcol_tn_ship_no'];
							var containerNo = line['custpage_list_custcol_tn_con_no'];
							var sealNo = line['custpage_list_custcol_tn_seal_no'];
							var containerType = line['custpage_list_custcol_tn_con_typ'];
							var soNo = line['custpage_list_custbody_customer_so_no'];

							var ctnQty = parseFloat(line['custpage_list_custcol_tn_carton_qty']) || 0;
							var qty = parseFloat(line['custpage_list_quantity']) || 0;
							var amount = parseFloat(line['custpage_list_amount']) || 0;

							// �����ܵ�ֵ
							renderData.ctnQtyTotal += ctnQty;
							renderData.qtyTotal += qty;
							renderData.amountTotal += amount;

							// ��дcustomer��ַ����Ϣ
							if (!renderData.customerName) {
								var customerName = line['custpage_list_customer_companyname'];
								if (customerName) {
									renderData.customerName = customerName;
								}
							}

							// �ռ��ͻ���ַ��Ϣ
							if (!addressParts) {
								var currentAdd = line['custpage_list_shipaddress'];
								if (currentAdd) {
									currentAdd = currentAdd.split(' ');
									var addLen = currentAdd.length;
									if (addLen < 3) {
										for (var i = 0; i < 3 - addLen; i++) {
											currentAdd.push('');
										}
										addressParts = currentAdd;
									} else if (addLen > 3) {
										var temp = Math.floor(addLen / 3);
										addressParts = [];
										for (var i = 0; i < 3; i++) {
											addressParts[i] = currentAdd.slice(
													i * temp, (i + 1) * temp)
													.join(' ');
										}
										addressParts[2] += ' '
												+ currentAdd.slice(i * temp)
														.join(' ');
									} else {
										addressParts = currentAdd;
									}
								}
							}

							// �ռ���д�ֶε���Ϣ
							var recId = line['custpage_list_internalid'];
							if (!writeBackInfo['summary'][recId]) {
								writeBackInfo['summary'][recId] = [];
							}
							writeBackInfo['summary'][recId].push(line);

							if (SONOS.indexOf(soNo) === -1) {
								SONOS.push(soNo);
							}

							var findedGroup;
							var groupLen = renderData.groups.length;

							// �ҵ���ͬ����
							for (var i = 0; i < groupLen; i++) {
								var currentGroup = renderData.groups[i];
								if (currentGroup.shipNo === shipNo
										&& currentGroup.containerNo === containerNo
										&& currentGroup.sealNo === sealNo
										&& currentGroup.containerType === containerType) {
									findedGroup = currentGroup;
									break;
								}
							}

							if (findedGroup) {
								findedGroup.ctnQtySubtotal += ctnQty;
								findedGroup.qtySubtotal += qty;
								findedGroup.amountSubtotal += amount;
								findedGroup.lines
										.push({
											soNo : soNo,
											itemNo : line['custpage_list_custcol_tn_cus_item_code'],
											itemName : line['custpage_list_custcol_tn_item_name'],
											ctnQty : ctnQty,
											qty : qty,
											unitPrice : line['custpage_list_rate'],
											amount : amount,
											htsCode : line['custpage_list_custcol_tn_hst_code'],
											material : line['custpage_list_custcol_tn_mat_breakdowm']
										});
							} else {
								renderData.groups
										.push({
											shipNo : shipNo,
											containerNo : containerNo,
											sealNo : sealNo,
											containerType : containerType,
											ctnQtySubtotal : ctnQty,
											qtySubtotal : qty,
											amountSubtotal : amount,
											index : groupLen + 1,
											lines : [ {
												soNo : soNo,
												itemNo : line['custpage_list_custcol_tn_cus_item_code'],
												itemName : line['custpage_list_custcol_tn_item_name'],
												ctnQty : ctnQty,
												qty : qty,
												unitPrice : line['custpage_list_rate'],
												amount : amount,
												htsCode : line['custpage_list_custcol_tn_hst_code'],
												material : line['custpage_list_custcol_tn_mat_breakdowm']
											} ]
										});
							}

							if (!renderData.to) {
								renderData.to = line['custpage_list_custbody_port_of_dest'];
							}

							var delTerm = line['custpage_list_custbody_del_term'];
							var delPort = line['custpage_list_custbody_ship_port'];
							if (!renderData.delTermPort && delTerm && delPort) {
								renderData.delTermPort = delTerm + ' '
										+ delPort;
							}

						});

				// ��so number ����
				var soNoLen = SONOS.length;
				if (soNoLen < 4) {
					for (var i = 0; i < 4 - soNoLen; i++) {
						SONOS.push('');
					}
				} else if (soNoLen % 2 !== 0) {
					SONOS.push('');
				}

				SONOS
						.forEach(function(soNo, index) {
							if (index % 2 === 0) {
								renderData.soNos.push({
									so1 : soNo
								});
							} else {
								renderData.soNos[renderData.soNos.length - 1]['so2'] = soNo;
							}

							if (index === 0) {
								renderData.soNos[0].message = '        '
										+ (addressParts ? addressParts[1] : '');
								renderData.soNos[0].label = 'PO NO.:';
							} else if (index === 2) {
								renderData.soNos[1].message = '        '
										+ (addressParts ? addressParts[2] : '');
							}
						});

				if (addressParts) {
					renderData.customerAddPart1 = addressParts[0];
				}

				// д��group��������
				renderData.groups.sort(function(a, b) {
					return b.lines.length - a.lines.length;
				});

				renderData.groups[0].lines.every(function(line) {
					if (SPECIALS.length) {
						line.messages = SPECIALS.shift();
						if (SPECIALS.length) {
							return true;
						} else {
							return false;
						}
					}
					return false;
				});

				if (SPECIALS.length) {
					renderData.groups[0].messages = SPECIALS.shift();
				}

				renderData.amountTotal = renderData.amountTotal.toFixed(2);
				renderData.amountTotalCapital = toWords(renderData.amountTotal);

				// ����ŵ���Ϣ��д��Invoice������
				var wbMsg = writeBack(writeBackInfo);

				previewExcel({
					response : response,
					tplID : 'SuiteBundles/Bundle 264410/Commercial-Invoice.xml',
					renderData : renderData,
					fileName : 'CommercialInvoice',
					wbMsg : wbMsg
				});
				return true;
			}

			// packing list
			function packingList(response, parameters) {
				var checkedSummary = decodeURIComponent(parameters.checkedsummary);
				checkedSummary = JSON.parse(checkedSummary);
				var printDate = getCurrentChinaDate();
				var addressParts;

				var renderData = {
					// body fields
					soNos : [],
					input_termsOfPayment : checkedSummary.termsOfPaymentText,
					input_sailingDate : checkedSummary.etdDate,
					input_invoiceNo : checkedSummary.invoiceNo,
					printDate : printDate,
					companyName : checkedSummary.companyName.split('<br>'),
					customerName : '',
					customerAddPart1 : '',
					to : '',
					delTermPort : '',
					ctnQtyTotal : 0,
					qtyTotal : 0,
					netWeightTotal : 0,
					grossWeightTotal : 0,
					cbmTotal : 0,
					// groups
					groups : []
				}

				var SPECIALS = [
						[ 'Style Number:', 'DESCRIPTION:', 'Net Weight:',
								'Gross Weight:', 'Cube:cmX cmX cm' ],
						[ 'Country of origin:', 'Pieces or sets per cartons:',
								'Purchase order number:', 'Carton number��of' ] ];
				var SONOS = [];
				/*
				 * var writeBackInfo = { input_invoiceNo :
				 * renderData.input_invoiceNo, input_sailingDate :
				 * renderData.input_sailingDate, input_termsOfPayment :
				 * checkedSummary.termsOfPayment, summary : {} };
				 */

				checkedSummary.lines
						.forEach(function(line) {
							var shipNo = line['custpage_list_custcol_tn_ship_no'];
							var containerNo = line['custpage_list_custcol_tn_con_no'];
							var sealNo = line['custpage_list_custcol_tn_seal_no'];
							var containerType = line['custpage_list_custcol_tn_con_typ'];
							var soNo = line['custpage_list_custbody_customer_so_no'];

							var ctnQty = parseFloat(line['custpage_list_custcol_tn_carton_qty']) || 0;
							var qty = parseFloat(line['custpage_list_quantity']) || 0;
							var netWeightAmt = parseFloat(line['custpage_list_custcol_tn_tol_net_weight']) || 0;
							var grossWeightAmt = parseFloat(line['custpage_list_custcol_tn_tol_gross_weight']) || 0;
							var cbmAmt = parseFloat(line['custpage_list_custcol_tn_tol_vol']) || 0;

							// �����ܵ�ֵ
							renderData.ctnQtyTotal += ctnQty;
							renderData.qtyTotal += qty;
							renderData.netWeightTotal += netWeightAmt;
							renderData.grossWeightTotal += grossWeightAmt;
							renderData.cbmTotal += cbmAmt;

							// ��дcustomer��ַ����Ϣ
							if (!renderData.customerName) {
								var customerName = line['custpage_list_customer_companyname'];
								if (customerName) {
									renderData.customerName = customerName;
								}
							}

							// �ռ��ͻ���ַ��Ϣ
							if (!addressParts) {
								var currentAdd = line['custpage_list_shipaddress'];
								if (currentAdd) {
									currentAdd = currentAdd.split(' ');
									var addLen = currentAdd.length;
									if (addLen < 3) {
										for (var i = 0; i < 3 - addLen; i++) {
											currentAdd.push('');
										}
										addressParts = currentAdd;
									} else if (addLen > 3) {
										var temp = Math.floor(addLen / 3);
										addressParts = [];
										for (var i = 0; i < 3; i++) {
											addressParts[i] = currentAdd.slice(
													i * temp, (i + 1) * temp)
													.join(' ');
										}
										addressParts[2] += ' '
												+ currentAdd.slice(i * temp)
														.join(' ');
									} else {
										addressParts = currentAdd;
									}
								}
							}

							// �ռ���д�ֶε���Ϣ
							/*
							 * var iffId = line['custpage_list_internalid'];
							 * if(!writeBackInfo['summary'][iffId]){
							 * writeBackInfo['summary'][iffId] = []; }
							 * writeBackInfo['summary'][iffId].push(line);
							 */

							if (SONOS.indexOf(soNo) === -1) {
								SONOS.push(soNo);
							}

							var findedGroup;
							var groupLen = renderData.groups.length;

							// �ҵ���ͬ����
							for (var i = 0; i < groupLen; i++) {
								var currentGroup = renderData.groups[i];
								if (currentGroup.shipNo === shipNo
										&& currentGroup.containerNo === containerNo
										&& currentGroup.sealNo === sealNo
										&& currentGroup.containerType === containerType) {
									findedGroup = currentGroup;
									break;
								}
							}

							if (findedGroup) {
								findedGroup.ctnQtySubtotal += ctnQty;
								findedGroup.qtySubtotal += qty;
								findedGroup.netWeightSubtotal += netWeightAmt;
								findedGroup.grossWeightSubtotal += grossWeightAmt;
								findedGroup.cbmSubtotal += cbmAmt;
								findedGroup.lines
										.push({
											soNo : soNo,
											itemNo : line['custpage_list_custcol_tn_cus_item_code'],
											itemName : line['custpage_list_custcol_tn_item_name'],
											ctnQty : ctnQty,
											qty : qty,
											netWeight : line['custpage_list_custcol_tn_net_weight'],
											grossWeight : line['custpage_list_custcol_tn_gross_weight'],
											boxSize : line['custpage_list_custcol_tn_car_size'],
											netWeightAmt : netWeightAmt,
											grossWeightAmt : grossWeightAmt,
											cbmAmt : cbmAmt,
											htsCode : line['custpage_list_custcol_tn_hst_code'],
											material : line['custpage_list_custcol_tn_mat_breakdowm']
										});
							} else {
								renderData.groups
										.push({
											shipNo : shipNo,
											containerNo : containerNo,
											sealNo : sealNo,
											containerType : containerType,
											ctnQtySubtotal : ctnQty,
											qtySubtotal : qty,
											netWeightSubtotal : netWeightAmt,
											grossWeightSubtotal : grossWeightAmt,
											cbmSubtotal : cbmAmt,
											index : groupLen + 1,
											lines : [ {
												soNo : soNo,
												itemNo : line['custpage_list_custcol_tn_cus_item_code'],
												itemName : line['custpage_list_custcol_tn_item_name'],
												ctnQty : ctnQty,
												qty : qty,
												netWeight : line['custpage_list_custcol_tn_net_weight'],
												grossWeight : line['custpage_list_custcol_tn_gross_weight'],
												boxSize : line['custpage_list_custcol_tn_car_size'],
												netWeightAmt : netWeightAmt,
												grossWeightAmt : grossWeightAmt,
												cbmAmt : cbmAmt,
												htsCode : line['custpage_list_custcol_tn_hst_code'],
												material : line['custpage_list_custcol_tn_mat_breakdowm']
											} ]
										});
							}

							if (!renderData.to) {
								renderData.to = line['custpage_list_custbody_port_of_dest'];
							}

							var delTerm = line['custpage_list_custbody_del_term'];
							var delPort = line['custpage_list_custbody_ship_port'];
							if (!renderData.delTermPort && delTerm && delPort) {
								renderData.delTermPort = delTerm + ' '
										+ delPort;
							}

						});

				// ��so number ����
				var soNoLen = SONOS.length;
				if (soNoLen < 4) {
					for (var i = 0; i < 4 - soNoLen; i++) {
						SONOS.push('');
					}
				} else if (soNoLen % 2 !== 0) {
					SONOS.push('');
				}

				SONOS
						.forEach(function(soNo, index) {
							if (index % 2 === 0) {
								renderData.soNos.push({
									so1 : soNo
								});
							} else {
								renderData.soNos[renderData.soNos.length - 1]['so2'] = soNo;
							}

							if (index === 0) {
								renderData.soNos[0].message = '        '
										+ (addressParts ? addressParts[1] : '');
								renderData.soNos[0].label = 'PO NO.:';
							} else if (index === 2) {
								renderData.soNos[1].message = '        '
										+ (addressParts ? addressParts[2] : '');
							}
						});

				if (addressParts) {
					renderData.customerAddPart1 = addressParts[0];
				}

				// д��group��������
				renderData.groups.sort(function(a, b) {
					return b.lines.length - a.lines.length;
				});

				renderData.groups[0].lines.every(function(line) {
					if (SPECIALS.length) {
						line.messages = SPECIALS.shift();
						if (SPECIALS.length) {
							return true;
						} else {
							return false;
						}
					}
					return false;
				});

				if (SPECIALS.length) {
					renderData.groups[0].messages = SPECIALS.shift();
				}

				// ����ŵ���Ϣ��д��item fulfillment������
				// var wbMsg = writeBackIff(writeBackInfo);
				// var wbMsg = writeBack('ITEM_FULFILLMENT', writeBackInfo);

				previewExcel({
					response : response,
					tplID : 'SuiteBundles/Bundle 264410/packing-list.xml',
					renderData : renderData,
					fileName : 'packingList'// ,
				// wbMsg : wbMsg
				});
				return true;
			}

			// shipping report
			function shipReport(response, parameters) {
				var checkedSummary = decodeURIComponent(parameters.checkedsummary);
				checkedSummary = JSON.parse(checkedSummary);

				var renderData = {
					year1 : checkedSummary['custpage_compareyear1'],
					year2 : checkedSummary['custpage_compareyear2'],
					year1CBMSum : 0,
					year2CBMSum : 0,
					CBMratioSum : 0,
					year1AMTSum : 0,
					year2AMTSum : 0,
					AMTratioSum : 0,
					customers : {}
				};

				var addFilters = [
						'AND',
						[
								[ 'custbody_tn_etd_date', 'within',
										getYearRange(renderData.year1) ],
								'OR',
								[ 'custbody_tn_etd_date', 'within',
										getYearRange(renderData.year2) ] ] ];

				if (checkedSummary['custpage_selectcustomer']) {
					addFilters.push('AND', [ 'entity', 'anyof',
							checkedSummary['custpage_selectcustomer'] ])
				}

				/*
				 * log.debug({ title : 'addFilters', details : addFilters });
				 */

				var searchObj = search.load({
					id : checkedSummary['custpage_searchid']
				});

				searchObj.filterExpression = searchObj.filterExpression
						.concat(addFilters);
				searchObj
						.run()
						.each(
								function(result) {
									var columns = result.columns;
									var id = result.getValue(columns[0]);
									var name = result.getValue(columns[1]);
									var yearMonth = result.getValue(columns[2])
											.split('-');
									var year = yearMonth[0];
									var month = Number(yearMonth[1]);
									var cbm = parseFloat(result
											.getValue(columns[3])) || 0;
									var amt = parseFloat(result
											.getValue(columns[4])) || 0;

									if (!renderData['customers'][id]) {
										renderData['customers'][id] = {
											name : name,
											months : []
										}
										for (var i = 0; i <= 12; i++) {
											renderData['customers'][id]['months']
													.push({
														year1CBM : 0,
														year2CBM : 0,
														CBMratio : '0%',
														year1AMT : 0,
														year2AMT : 0,
														AMTratio : '0%'
													});
										}
									}

									var currentMonth = renderData['customers'][id]['months'][month];

									if (year == renderData.year1) {
										currentMonth.year1CBM = cbm;
										currentMonth.year1AMT = amt;
									} else if (year == renderData.year2) {
										currentMonth.year2CBM = cbm;
										currentMonth.year2AMT = amt;
									}

									if (currentMonth.year1CBM /*
																 * &&
																 * currentMonth.year2CBM
																 */) {
										currentMonth.CBMratio = formatPercent((currentMonth.year2CBM - currentMonth.year1CBM)
												/ currentMonth.year1CBM);
									}

									if (currentMonth.year1AMT /*
																 * &&
																 * currentMonth.year2AMT
																 */) {
										currentMonth.AMTratio = formatPercent((currentMonth.year2AMT - currentMonth.year1AMT)
												/ currentMonth.year1AMT);
									}

									return true;
								});

				var allCustomers = [];
				util
						.each(
								renderData.customers,
								function(customer) {// ����
									allCustomers.push(customer);
									var total = customer.months[0];// ��0������ʾtotal
									for (var i = 1; i <= 12; i++) {
										total.year1CBM += customer.months[i].year1CBM;
										total.year2CBM += customer.months[i].year2CBM;
										total.year1AMT += customer.months[i].year1AMT;
										total.year2AMT += customer.months[i].year2AMT;

										renderData.year1CBMSum += customer.months[i].year1CBM;
										renderData.year1AMTSum += customer.months[i].year1AMT;
										renderData.year2CBMSum += customer.months[i].year2CBM;
										renderData.year2AMTSum += customer.months[i].year2AMT;
									}
									if (total.year1CBM) {
										total.CBMratio = formatPercent((total.year2CBM - total.year1CBM)
												/ total.year1CBM);
									}
									if (total.year1AMT) {
										total.AMTratio = formatPercent((total.year2AMT - total.year1AMT)
												/ total.year1AMT);
									}
								});

				if (renderData.year1CBMSum) {
					renderData.CBMratioSum = formatPercent((renderData.year2CBMSum - renderData.year1CBMSum)
							/ renderData.year1CBMSum);
				}
				if (renderData.year1AMTSum) {
					renderData.AMTratioSum = formatPercent((renderData.year2AMTSum - renderData.year1AMTSum)
							/ renderData.year1AMTSum);
				}

				renderData.customers = allCustomers;// ת��Ϊ�����ѱ�ģ����Ⱦ����Ϊ��freemarker����Ⱦ���Ʋ�����ô�죬���Զ������鴦��

				/*
				 * log.debug({ title : 'renderData', details : renderData });
				 */

				previewExcel({
					response : response,
					tplID : '508',
					renderData : renderData,
					fileName : 'shippingReport'
				});
			}

			// print itemfulfillment
			function itemfulfillment(response, parameters) {
				var recordId = parameters.recordId;
				var fulfillRec = record.load({
					type : record.Type.ITEM_FULFILLMENT,
					id : recordId
				});

				var noNum = fulfillRec.getValue({
					fieldId : 'tranid'
				});

				var customerOrderNo = fulfillRec.getValue({
					fieldId : 'custbody_customer_so_no'
				});

				var date = fulfillRec.getValue({
					fieldId : 'trandate'
				});
				date = date.getFullYear() + '��' + (date.getMonth() + 1) + '��'
						+ date.getDate() + '��';

				var renderData = {
					customer : fulfillRec.getText({
						fieldId : 'entity'
					}),
					date : date,
					noNum : noNum,
					totalNum : '',
					mergeDown : '',
					lines : []
				}

				var itemCount = fulfillRec.getLineCount({
					sublistId : 'item'
				});
				var unitMap = {};
				for (var i = 0; i < itemCount; i++) {
					var curUnit = fulfillRec.getSublistText({
						sublistId : 'item',
						fieldId : 'units',
						line : i
					});

					if (unitMap.hasOwnProperty(curUnit)) {
						curUnit = unitMap[curUnit];
					} else if (curUnit) {
						unitName = search.lookupFields({
							type : search.Type.UNITS_TYPE,
							id : curUnit,
							columns : 'name'
						});
						unitMap[curUnit] = unitName['name'];
						curUnit = unitMap[curUnit];
					}

					renderData.lines.push({
						orderNum : customerOrderNo,
						itemName : fulfillRec.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_item_name',
							line : i
						}),
						itemCode : fulfillRec.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_cus_item_code',
							line : i
						}),
						unit : curUnit,
						quantity : fulfillRec.getSublistValue({
							sublistId : 'item',
							fieldId : 'quantity',
							line : i
						}),
						containerNo : fulfillRec.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_con_no',
							line : i
						})
					})
				}

				renderData.mergeDown = renderData.lines.length + 1;
				renderData.totalNum = renderData.lines.reduce(function(
						subtotal, currentLine) {
					return subtotal + (parseInt(currentLine.quantity) || 0);
				}, 0);

				previewExcel({
					response : response,
					tplID : '390',
					renderData : renderData,
					fileName : 'itemfulfillment'
				});

				return true;
			}

			// profit
			function profitReport(response, parameters) {
				var mrTask = task.create({
					taskType : task.TaskType.MAP_REDUCE,
					scriptId : 'customscript_tn_generate_pro_reports',
					deploymentId : 'customdeploy_tn_generate_pro_reports',
					params : {
						'custscript_checkedsummary' : parameters.checkedsummary
					}
				});

				var mrTaskId = mrTask.submit();
				var rspMsg = '<p style="text-align:center;font-weight:bold;">��������������������ύ����ɺ��㽫���յ�һ�����������ʼ��������ĵȴ�</p>';
				rspMsg += '<p style="text-align:center;font-weight:bold;"><a href="https://system.na2.netsuite.com/app/common/scripting/mapreducescriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY&scripttype=221&primarykey=557">����鿴״̬</a></p>';

				response.write({
					output : rspMsg
				});
				return true;
			}

			// wip
			/*
			 * function wipReport(response, parameters){
			 * 
			 * response.write({ output : '���ܿ����У������ڴ�' }); return false;
			 * 
			 * var mrTask = task.create({ taskType: task.TaskType.MAP_REDUCE,
			 * scriptId: 'customscript_tn_generate_wip_reports', deploymentId:
			 * 'customdeploy_tn_generate_wip_reports', params : {
			 * 'custscript_wipcheckedsummary' : parameters.checkedsummary } });
			 * 
			 * var mrTaskId = mrTask.submit(); var rspMsg = '<p style="text-align:center;font-weight:bold;">WIP�ܱ������������ύ����ɺ��㽫���յ�һ�����������ʼ��������ĵȴ�</p>';
			 * rspMsg += '<p style="text-align:center;font-weight:bold;"><a
			 * href="https://system.na2.netsuite.com/app/common/scripting/mapreducescriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY&scripttype=222&primarykey=559">����鿴״̬</a></p>';
			 * 
			 * response.write({ output : rspMsg }); return true; }
			 */

			// entry point
			function onRequest(context) {
				try {
					var request = context.request;
					var response = context.response;
					var parameters = request.parameters;
					var reportType = parameters.reporttype;

					switch (reportType) {
					case 'po1toN':
						po1toN(response, parameters);
						break;
					case 'poNtoN':
						poNtoN(response, parameters);
						break;
					case 'commercialInvoice':
						commercialInvoice(response, parameters);
						break;
					case 'packingList':
						packingList(response, parameters);
						break;
					case 'shippingReport':
						shipReport(response, parameters);
						break;
					case 'itemfulfill':
						itemfulfillment(response, parameters);
						break;
					case 'download':
						download(response, parameters);
						break;
					case 'removecache':
						removeFileCache(parameters);
						break;
					case 'profit':
						profitReport(response, parameters);
						break;
					/*
					 * case 'wip': wipReport(response, parameters); break;
					 */
					case 'downloadPDF':
						downloadPDF(response, parameters);
						break;
					default:
						response.write({
							output : 'missing required parameters'
						});
						break;
					}

					return true;
				} catch (ex) {
					log.debug({
						title : 'create report error',
						details : ex
					});

					return false;
				}
			}

			return {
				onRequest : onRequest
			}
		});