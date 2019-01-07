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
						+ '<h3>报表预览</h3>'
						+ html
						+ '<button style="margin:20px auto;" id="download" data-link='
						+ downURL
						+ '>点击下载Excel报表</button>'
						+ '<iframe style="display:none;" id="fileloader"></iframe>'
						+ '<script src="/core/media/media.nl?id=503&c=4810841&h=9af53d561a97b545e477&_xt=.js"></script>'
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

				// 用这种方式是为了修复不能下载pdf的bug
				var triggerCache = cache.getCache({
					name : 'TriggerCache',
					scope : cache.Scope.PRIVATE
				});

				triggerCache.put({
					key : fileName,
					value : fileContent,
					ttl : 8 * 60 * 60
				// 缓存一个工作日
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
					var errorMsg = '<html><body><p id="errorMsg">报表不存在或者已经过期, 请重新打印</p></body></html>';
					var errorMsg2 = '<html><body><p id="errorMsg">程序出错，请联系管理员！</p></body></html>';
					var cacheName = parameters.cacheName;
					if (cacheName) {
						var triggerCache = cache.getCache({
							name : 'TriggerCache',
							scope : cache.Scope.PRIVATE
						});

						var cachedContent = triggerCache.get({
							key : cacheName
						});
//						log.debug({
//							title : 'cachedContent',
//							details : cachedContent
//						});
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
//					return false;
				}

			}

			// create and download excel files
			function download(response, parameters) {
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
									output : '<html><body><p id="errorMsg">报表不存在或者已经过期, 请重新打印</p></body></html>'
								});
						return false;
					}
				}

				response
						.write({
							output : '<html><body><p id="errorMsg">报表不存在或者已经过期, 请重新打印</p></body></html>'
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
				// 中国时间
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

				// 将文件内容存储到缓存中，等待用户下载
				var triggerCache = cache.getCache({
					name : 'TriggerCache',
					scope : cache.Scope.PRIVATE
				});

				triggerCache.put({
					key : fileName,
					value : fileContent,
					ttl : 8 * 60 * 60
				// 缓存一个工作日
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
				 * load和save一个iff消耗大约30 goverance,suitelet大约可以处理34个record
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
					rspMsg = '<p style="color:red;">以下记录回写失败，请手动回写:</p>'
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
			// po 1 to n PO C合并打印
			function po1toN(response, parameters) {
//				log.debug({
//					title : 'PO C合并打印start！'
//				});
				var checkedSummary = decodeURIComponent(parameters.checkedsummary);
				checkedSummary = JSON.parse(checkedSummary);
				var printDate = getCurrentChinaTime();
				var orderNote = checkedSummary.orderNote || '';
				var fileName = printDate.replace(/\/|:|\s+/g, '-') + '.pdf';

				// construct render data
				var renderData = {
					poNos : '',// 采购单号
					vender : '',// 供应商
					venderAdd : '',// 供应商地址
					printDate : printDate,// 打印日期
					remarks : orderNote,// 备注
					contactPerson : '',// 联系人
					contactPhone : '',// 联系方法
					fax : '',// 传真
					deliveryTerm : '',// 交货方式
					deliveryPort : '',// 交货地点
					termsOfPayment : '',// 付款方式
					custItemNo : '',// 客户产品编码
					subCustItemNo : '',// 客户产品货号
					description : '',// 产品描述
					upc : '',// upc
					boxsize : '',// 外箱尺寸
					notice : '',// 订单注意事项
					status : 'Approved',
					totalQty : 0,
					totalCtnQty : 0,
					totalAmt : 0,
					lines : []
				// 订单行
				};

				checkedSummary.lines
						.forEach(function(line, index) {

							// P.O.NO.（采购单号）
							renderData.poNos += line['custpage_list_tranid']
									+ '<br />';

							// vendor（供应工厂）
							if (!renderData.vender) {
								var venderName = line['custpage_list_vendor_companyname'];
								if (venderName) {
									fileName = 'C-' + venderName + '-'
											+ fileName;
									renderData.vender = venderName;
								}
							}
							;

							// vendor add（供应工厂地址）
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

							// 联系人，电话，传真
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

							// delivery term（交货方式）
							if (!renderData.deliveryTerm) {
								var deliveryTerm = line['custpage_list_custbody_del_term'];
								if (deliveryTerm) {
									renderData.deliveryTerm = deliveryTerm;
								}
							}

							// delivery port（交货地点）
							if (!renderData.deliveryPort) {
								var deliveryPort = line['custpage_list_custbody_del_port']
								if (deliveryPort) {
									renderData.deliveryPort = deliveryPort;
								}
							}

							// terms of payment（付款方式）
							if (!renderData.termsOfPayment) {
								var termsOfPayment = line['custpage_list_custbody_tn_pay_term'];
								if (termsOfPayment) {
									renderData.termsOfPayment = termsOfPayment;
								}
							}

							// 客户产品编码
							if (!renderData.custItemNo) {
								var custItemNo = line['custpage_list_custcol_tn_cus_item_code'];
								if (custItemNo) {
									renderData.custItemNo = custItemNo;
								}
							}

							// 客户产品货号
							if (!renderData.subCustItemNo) {
								var subCustItemNo = line['custpage_list_custcol_tn_cus_pro_id'];
								if (subCustItemNo) {
									renderData.subCustItemNo = subCustItemNo;
								}
							}

							// 产品描述
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

							// 外箱尺寸
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

							// 订单注意事项
							if (!renderData.notice) {
								var notice = line['custpage_list_custbody_tn_bus_con'];
								if (notice) {
									renderData.notice = notice;
								}
							}

							// 判断是否输出签名
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
//							log.debug({
//								title : line['custpage_list_custbody_port_of_dest']
//							});
							renderData.lines
									.push({
										sid : index + 1,
										deliveryDate : line['custpage_list_custcol_tn_del_date'],// delivery
										// date
										// 工厂交期
										estimateInspection : line['custpage_list_custcol_tn_est_ins_date'],// Estimate
										// inspection预定客验
										soNo : line['custpage_list_custbody_customer_so_no'],// 客户订单号
										destinationPort : line['custpage_list_custbody_port_of_dest'],// Destination
										// Port目的港口
										ctnQty : ctnQty,// CNT QTY 箱数
										packQty : line['custpage_list_custcol_tn_pack_size'],// PACK
										// QTY
										// 装箱数
										units : line['custpage_list_unit'],// 数量单位
										qty : qty,// QTY 数量
										unitPrice : unitPrice.toFixed(3),// unit
										// price
										// 单价
										currency : line['custpage_list_currency'],// 货币
										total : total.toFixed(2),// total 总金额
										note : line['custpage_list_custcol_tn_note']
									// Note 备注
									});
						});

				renderData.totalAmt = renderData.totalAmt.toFixed(2);

				outputPDF(response, '379', renderData, fileName);
				return true;
			}

			// po n to n PO AE合并打印
			function poNtoN(response, parameters) {
//				log.debug({
//					title : 'PO AE合并打印start！'
//				});
				var checkedSummary = decodeURIComponent(parameters.checkedsummary);
				checkedSummary = JSON.parse(checkedSummary);
				var printDate = getCurrentChinaTime();
				var orderNote = checkedSummary.orderNote || '';
				var fileName = printDate.replace(/\/|:|\s+/g, '-') + '.pdf';
				var itemIDs = [];

				// construct render data
				var renderData = {
					printDate : printDate,// 打印日期
					remarks : orderNote,// 备注
					vender : '',// 供应商
					customerName : '',// 客户名称
					venderAdd : '',// 供应商地址
					contactPerson : '',// 联系人
					contactPhone : '',// 联系电话
					fax : '',// 联系人传真
					subCustName : '',// 子客户名
					deliveryPort : '',// 交货地点
					deliveryTerm : '',// 交货方式
					termsOfPayment : '',// 付款方式
					notice : '',// 交易条件
					status : 'Approved',
					totalCtnQty : 0,
					totalQty : 0,
					totalAmt : 0,
					lines : []
				// lines
				};

				checkedSummary.lines
						.forEach(function(line, index) {
							// vendor（供应工厂）
							if (!renderData.vender) {
								var venderName = line['custpage_list_vendor_companyname'];
								if (venderName) {
									fileName = 'AE-' + venderName + '-'
											+ fileName;
									renderData.vender = venderName;
								}
							}
							;

							// 客户名称
							if (!renderData.customerName) {
								var customerName = line['custpage_list_customer_companyname'];
								if (customerName) {
									renderData.customerName = customerName;
								}
							}
							;

							// vendor add（供应工厂地址）
							if (!renderData.venderAdd) {
								var venderAddress = line['custpage_list_vendor_address'];
								if (venderAddress) {
									var lastIndex = venderAddress
											.lastIndexOf(' ');
									renderData.venderAdd = venderAddress
											.substring(0, lastIndex);
								}
							}

							// 联系人，电话，传真
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

							// 子客户名
							if (!renderData.subCustName) {
								var subCustName = line['custpage_list_custbody_sub_customer_companyname'];
								if (subCustName) {
									renderData.subCustName = subCustName;
								}
							}

							// delivery term（交货方式）
							if (!renderData.deliveryTerm) {
								var deliveryTerm = line['custpage_list_custbody_del_term'];
								if (deliveryTerm) {
									renderData.deliveryTerm = deliveryTerm;
								}
							}

							// delivery port（交货地点）
							if (!renderData.deliveryPort) {
								var deliveryPort = line['custpage_list_custbody_del_port'];
								if (deliveryPort) {
									renderData.deliveryPort = deliveryPort;
								}
							}

							// terms of payment（付款方式）
							if (!renderData.termsOfPayment) {
								var termsOfPayment = line['custpage_list_custbody_tn_pay_term'];
								if (termsOfPayment) {
									renderData.termsOfPayment = termsOfPayment;
								}
							}

							// 订单注意事项
							if (!renderData.notice) {
								var notice = line['custpage_list_custbody_tn_bus_con'];
								if (notice) {
									renderData.notice = notice;
								}
							}

							// 判断是否输出签名
							if (line['custpage_list_approvalstatus'] != 'Approved'
									&& renderData.status == 'Approved') {
								renderData.status = line['custpage_list_approvalstatus'];
							}

							// 记录itemid，以便于一次性搜索item描述
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
										sid : index + 1,// 序号
										soNo : line['custpage_list_custbody_customer_so_no'],// 客户订单号
										custItemNo : line['custpage_list_custcol_tn_cus_item_code'],// 客户产品编码
										subCustItemNo : line['custpage_list_custcol_tn_sub_cus_item_co'],// 子客户产品编码
										subCustSoNo : line['custpage_list_custbody_sub_customer_so_no'],// 子客户订单号
										itemProductNo : line['custpage_list_custcol_tn_com_pro_id'],// 公司产品货号
										itemCnName : line['custpage_list_custcol_tn_item_cn_name'],// 产品名称
										itemID : itemID,
										description : '',// 产品描述
										UPC : UPC,// upc
										outUPC : line['custpage_list_custcol_tn_out_upc'],// 外箱UPC编码
										ctnQty : ctnQty,// 箱数
										packQty : line['custpage_list_custcol_tn_pack_size'],// PACK
										// QTY
										// 装箱数
										units : line['custpage_list_unit'],// 数量单位
										qty : qty,// QTY 数量
										currency : line['custpage_list_currency'],// 货币
										unitPrice : unitPrice.toFixed(3),// unit
										// price
										// 单价
										total : total.toFixed(2),// total 总金额
										deliveryDate : line['custpage_list_custcol_tn_del_date'],// delivery
										// date
										// 工厂交期
										note : line['custpage_list_custcol_tn_note']
									// Note 备注
									});
						});

				renderData.totalAmt = renderData.totalAmt.toFixed(2);

				// 搜索item描述
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

				outputPDF(response, '388', renderData, fileName);
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
								'Purchase order number:', 'Carton number＿of' ] ];
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

							// 计算总的值
							renderData.ctnQtyTotal += ctnQty;
							renderData.qtyTotal += qty;
							renderData.amountTotal += amount;

							// 填写customer地址等信息
							if (!renderData.customerName) {
								var customerName = line['custpage_list_customer_companyname'];
								if (customerName) {
									renderData.customerName = customerName;
								}
							}

							// 收集客户地址信息
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

							// 收集回写字段的信息
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

							// 找到相同的组
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

				// 将so number 分组
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

				// 写入group左侧的文字
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

				// 将柜号等信息回写到Invoice的行上
				var wbMsg = writeBack(writeBackInfo);

				previewExcel({
					response : response,
					tplID : '507',
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
								'Purchase order number:', 'Carton number＿of' ] ];
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

							// 计算总的值
							renderData.ctnQtyTotal += ctnQty;
							renderData.qtyTotal += qty;
							renderData.netWeightTotal += netWeightAmt;
							renderData.grossWeightTotal += grossWeightAmt;
							renderData.cbmTotal += cbmAmt;

							// 填写customer地址等信息
							if (!renderData.customerName) {
								var customerName = line['custpage_list_customer_companyname'];
								if (customerName) {
									renderData.customerName = customerName;
								}
							}

							// 收集客户地址信息
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

							// 收集会写字段的信息
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

							// 找到相同的组
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

				// 将so number 分组
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

				// 写入group左侧的文字
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

				// 将柜号等信息回写到item fulfillment的行上
				// var wbMsg = writeBackIff(writeBackInfo);
				// var wbMsg = writeBack('ITEM_FULFILLMENT', writeBackInfo);

				previewExcel({
					response : response,
					tplID : '504',
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
								function(customer) {// 汇总
									allCustomers.push(customer);
									var total = customer.months[0];// 用0月来表示total
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

				renderData.customers = allCustomers;// 转换为数组已变模板渲染，因为对freemarker的渲染机制不是怎么熟，所以都用数组处理

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
				date = date.getFullYear() + '年' + (date.getMonth() + 1) + '月'
						+ date.getDate() + '日';

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
				var rspMsg = '<p style="text-align:center;font-weight:bold;">利润分析表生成请求已提交，完成后你将会收到一封包含结果的邮件，请耐心等待</p>';
				rspMsg += '<p style="text-align:center;font-weight:bold;"><a href="https://system.na2.netsuite.com/app/common/scripting/mapreducescriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY&scripttype=221&primarykey=557">点击查看状态</a></p>';

				response.write({
					output : rspMsg
				});
				return true;
			}

			// wip
			/*
			 * function wipReport(response, parameters){
			 * 
			 * response.write({ output : '功能开发中，敬请期待' }); return false;
			 * 
			 * var mrTask = task.create({ taskType: task.TaskType.MAP_REDUCE,
			 * scriptId: 'customscript_tn_generate_wip_reports', deploymentId:
			 * 'customdeploy_tn_generate_wip_reports', params : {
			 * 'custscript_wipcheckedsummary' : parameters.checkedsummary } });
			 * 
			 * var mrTaskId = mrTask.submit(); var rspMsg = '<p style="text-align:center;font-weight:bold;">WIP总表生成请求已提交，完成后你将会收到一封包含结果的邮件，请耐心等待</p>';
			 * rspMsg += '<p style="text-align:center;font-weight:bold;"><a
			 * href="https://system.na2.netsuite.com/app/common/scripting/mapreducescriptstatus.nl?sortcol=dcreated&sortdir=DESC&date=TODAY&scripttype=222&primarykey=559">点击查看状态</a></p>';
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