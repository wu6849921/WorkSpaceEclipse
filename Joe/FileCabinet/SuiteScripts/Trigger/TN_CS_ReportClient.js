/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Charles
 * @Nversion 1.0
 * @NModuleScope Public
 */
// var customWindow = this;
define(
		[ 'N/ui/dialog', 'N/currentRecord', 'N/format', 'N/url' ],
		function(dialog, currentRecord, format, url) {

			// common parameters
			var suiteletPage = currentRecord.get();
			var sublistId = 'custpage_searchresults';
			var checkFieldID = 'custpage_list_checked';
			var printReportURL;

			// common function
			function getParameterFromURL(param) {
				var query = window.location.search.substring(1);
				var vars = query.split('&');
				for (var i = 0, len = vars.length; i < len; i++) {
					var pair = vars[i].split('=');
					if (pair[0] == param) {
						return decodeURIComponent(pair[1]);
					}
				}
				return false;
			}

			function refreshPage(params) {
				window.onbeforeunload = function() {
					return;
				};
				window.location = url.resolveScript({
					scriptId : getParameterFromURL('script'),
					deploymentId : getParameterFromURL('deploy'),
					params : params
				});
			}

			function createSubmitPage(reportType, checkedSummary, printType) {
				var html = '<html><head></head><body>'
						+ '<form id="submit" method="post" action="">'
						+ '<input name="reporttype" id="reporttype" type="hidden" />'
						+ '<input name="printtype" id="printtype" type="hidden" />'
						+ '<textarea name="checkedsummary" id="checkedsummary" style="display:none;"></textarea>'
						+ '</form>' + '</body></html>';

				// test
				console.log('checkedSummary', checkedSummary);
				checkedSummary = JSON.stringify(checkedSummary);
				checkedSummary = encodeURIComponent(checkedSummary);

				var popDocument = window.open().document;
				popDocument.write(html);
				popDocument.getElementById('submit').action = getReportURL();
				popDocument.getElementById('reporttype').value = reportType;
				popDocument.getElementById('checkedsummary').value = checkedSummary;
				popDocument.getElementById('printtype').value = printType;
				popDocument.getElementById('submit').submit();
			}

			function getReportURL() {
				if (!printReportURL) {
					printReportURL = url.resolveScript({
						scriptId : 'customscript_tn_createreports',
						deploymentId : 'customdeploy_tn_createreports'
					});
				}

				return printReportURL;
			}

			function goToPage(pageId) {
				var defaultInfo = currentRecord.get().getValue({
					fieldId : 'custpage_defaultinfo'
				});
				var refreshParams = JSON.parse(defaultInfo).refresh;
				refreshParams['custpage_pageid'] = pageId;
				refreshPage(refreshParams);
			}

			// search page function
			function searchPage(searchFields) {
				var urlParams = {
					'custpage_pageid' : 1,
					'custpage_pagesize' : suiteletPage.getValue({
						fieldId : 'custpage_pagesize'
					})
				};

				var pageSize = parseInt(urlParams['custpage_pagesize']);
				if (!pageSize || pageSize > 1000 || pageSize < 5) {
					dialog.alert({
						title : '错误',
						message : '每页显示数量必须在5-1000之间'
					});
					return false;
				}

				util.each(searchFields, function(fieldId) {
					var searchValue = suiteletPage.getValue({
						fieldId : fieldId
					});
					if (util.isDate(searchValue)) {
						searchValue = format.format({
							value : searchValue,
							type : format.Type.DATE
						});
					} else if (util.isArray(searchValue)) {
						searchValue = searchValue.join(',');
					} else {
						searchValue = jQuery.trim(searchValue);
					}

					if (searchValue) {
						urlParams[fieldId] = searchValue;
					}
				});

				refreshPage(urlParams);
				return true;
			}

			function searchPO() {
				var searchFields = [ 'custpage_filtername',
						'custpage_filtervalue', 'custpage_approvalstatus',
						'custpage_orderstatus', 'custpage_startdate',
						'custpage_enddate' ];

				searchPage(searchFields);
				return true;
			}

			/*
			 * function searchIFF(){ var searchFields = [
			 * 'custpage_itemnamenumber', 'custpage_itemdisname',
			 * 'custpage_custorderno', 'custpage_subcustorderno',
			 * 'custpage_custitemcode' ];
			 * 
			 * searchPage(searchFields); return true; }
			 */

			function searchINV() {
				var searchFields = [ 'custpage_itemnamenumber',
						'custpage_itemdisname', 'custpage_custorderno',
						'custpage_subcustorderno', 'custpage_custitemcode',
						'custpage_approvalstatus', 'custpage_orderstatus' ];

				searchPage(searchFields);
				return true;
			}

			function searchPF() {
				var searchFields = [ 'custpage_itembinnumber',
						'custpage_customer', 'custpage_custorderno',
						'custpage_item', 'custpage_custitemcode',
						'custpage_datebegin', 'custpage_dateend' ];// joe
				// new
				// search
				// field

				searchPage(searchFields);
				return true;
			}

			function searchWIP() {
				var searchFields = [ 'custpage_customer',
						'custpage_custorderno', 'custpage_englishname',
						'custpage_startdate', 'custpage_enddate' ];

				searchPage(searchFields);
				return true;
			}

			// print function
			function submitReport(option) {
				var reportType = option.reportType;
				var validateFields = option.validateFields;
				var checkedSummary = option.checkedSummary;
				var checkEmptyLineFields = option.checkEmptyLineFields;

				// 新增参数 判断是否是无金额打印 add by joe 20180329
				var printType = option.printType;

				var checkedLines = [];
				var allSublistColumns = suiteletPage.getValue({
					fieldId : 'custpage_defaultinfo'
				});
				allSublistColumns = JSON.parse(allSublistColumns).allSublistColumns;
				var lineCount = suiteletPage.getLineCount({
					sublistId : sublistId
				});

				// collect checked lines
				for (var i = 0; i < lineCount; i++) {
					var isChecked = suiteletPage.getSublistValue({
						sublistId : sublistId,
						fieldId : checkFieldID,
						line : i
					});

					if (isChecked) {
						var selectedLine = {};
						util.each(allSublistColumns, function(fieldId) {
							selectedLine[fieldId] = suiteletPage
									.getSublistValue({
										sublistId : sublistId,
										fieldId : fieldId,
										line : i
									}).replace(/&/g, '&amp;');
						});

						// 验证柜号信息等是否为空
						if (checkEmptyLineFields) {
							var isContainerEmpty = checkEmptyLineFields
									.some(function(fieldId) {
										return selectedLine[fieldId] == '';
									});
							if (isContainerEmpty) {
								dialog.alert({
									title : '错误',
									message : '柜号等信息不能为空'
								});
								return false;
							}
						}

						checkedLines.push(selectedLine);
					}
				}

				if (checkedLines.length) {
					// 验证合并条件
					for (var i = 1, checkedCount = checkedLines.length; i < checkedCount; i++) {
						for ( var key in validateFields) {
							if (validateFields.hasOwnProperty(key)) {
								if (checkedLines[i][key] !== checkedLines[0][key]) {
									dialog.alert({
										title : '选择错误',
										message : validateFields[key]
									});
									return false;
								}
							}
						}
					}

					checkedSummary.lines = checkedLines;
					createSubmitPage(reportType, checkedSummary, printType);
					return true;
				} else {
					dialog.alert({
						title : '提示',
						message : '您没有选择任何条目'
					});
					return false;
				}
			}
			// 新增参数 判断是否是无金额打印 add by joe 20180329
			function printPO1toN(printType) {
				// alert(printType);
				var checkedSummary = {
					orderNote : suiteletPage.getValue({
						fieldId : 'custpage_ordernote'
					})
				};
				var validateFields = {
					'custpage_list_item_itemid' : '您的选择包含不一样的物料编码',
					'custpage_list_vendor_companyname' : '您的选择包含不一样的供应商',
					'custpage_list_currency' : '您的选择包含不一样的货币',
					'custpage_list_custbody_del_term' : '您的选择包含不一样的交货方式',
					'custpage_list_custbody_del_port' : '您的选择包含不一样的交货地点',
					'custpage_list_custbody_tn_pay_term' : '您的选择包含不一样的付款方式'
				};

				submitReport({
					reportType : 'po1toN',
					validateFields : validateFields,
					checkedSummary : checkedSummary,
					printType : printType
				});
				return true;
			}
			// 新增参数 判断是否是无金额打印 add by joe 20180329
			function printPONtoN(printType) {
				var checkedSummary = {
					orderNote : suiteletPage.getValue({
						fieldId : 'custpage_ordernote'
					})
				};
				var validateFields = {
					'custpage_list_vendor_companyname' : '您的选择包含不一样的供应商',
					'custpage_list_currency' : '您的选择包含不一样的货币',
					'custpage_list_custbody_del_term' : '您的选择包含不一样的交货方式',
					'custpage_list_custbody_del_port' : '您的选择包含不一样的交货地点',
					'custpage_list_custbody_tn_pay_term' : '您的选择包含不一样的付款方式'
				};

				submitReport({
					reportType : 'poNtoN',
					validateFields : validateFields,
					checkedSummary : checkedSummary,
					printType : printType
				});
				return true;
			}

			function printInvoice(reportType) {
				var checkedSummary = {
					invoiceNo : suiteletPage.getValue({
						fieldId : 'custpage_commercial_invoice_no'
					}),
					termsOfPayment : suiteletPage.getValue({
						fieldId : 'custpage_terms_of_payment'
					}),
					termsOfPaymentText : suiteletPage.getText({
						fieldId : 'custpage_terms_of_payment'
					}),
					etdDate : suiteletPage.getValue({
						fieldId : 'custpage_etd_date'
					}),
					companyName : suiteletPage.getValue({
						fieldId : 'custpage_selectcompany'
					})
				}

				if (!checkedSummary.invoiceNo) {
					dialog.alert({
						title : '提示',
						message : '请输入COMMERCIAL INVOICE NO.'
					});
					return false;
				}

				if (!checkedSummary.termsOfPayment) {
					dialog.alert({
						title : '提示',
						message : '请选择TERMS OF PAYMENT'
					});
					return false;
				}

				if (!checkedSummary.etdDate) {
					dialog.alert({
						title : '提示',
						message : '请输入ETD DATE'
					});
					return false;
				}

				// 格式化日期
				checkedSummary.etdDate = format.format({
					value : checkedSummary.etdDate,
					type : format.Type.DATE
				});

				var validateFields = {
					'custpage_list_custbody_port_of_dest' : '您的选择包含不一样的Port of Destination',
					'custpage_list_custbody_del_term' : '您的选择包含不一样的Terms of Delivery',
					'custpage_list_custbody_ship_port' : '您的选择包含不一样的Shipment Port',
					'custpage_list_customer_companyname' : '您的选择包含不一样的客户'
				};

				var checkEmptyLineFields = [
						'custpage_list_custcol_tn_ship_no',
						'custpage_list_custcol_tn_con_no',
						'custpage_list_custcol_tn_seal_no',
						'custpage_list_custcol_tn_con_typ' ];

				submitReport({
					reportType : reportType,
					validateFields : validateFields,
					checkedSummary : checkedSummary,
					checkEmptyLineFields : checkEmptyLineFields
				});
				return function() {
				};
			}

			/*
			 * function printCommerInv() { var checkedSummary = { invoiceNo :
			 * suiteletPage.getValue({ fieldId :
			 * 'custpage_commercial_invoice_no' }), termsOfPayment :
			 * suiteletPage.getValue({ fieldId : 'custpage_terms_of_payment' }),
			 * termsOfPaymentText : suiteletPage.getText({ fieldId :
			 * 'custpage_terms_of_payment' }), etdDate : suiteletPage.getValue({
			 * fieldId : 'custpage_etd_date' }) }
			 * 
			 * if(!checkedSummary.invoiceNo){ dialog.alert({ title: '提示',
			 * message: '请输入COMMERCIAL INVOICE NO.' }); return false; }
			 * 
			 * if(!checkedSummary.termsOfPayment){ dialog.alert({ title: '提示',
			 * message: '请选择TERMS OF PAYMENT' }); return false; }
			 * 
			 * if(!checkedSummary.etdDate){ dialog.alert({ title: '提示', message:
			 * '请输入ETD DATE' }); return false; }
			 * 
			 * //格式化日期 checkedSummary.etdDate = format.format({ value:
			 * checkedSummary.etdDate, type: format.Type.DATE });
			 * 
			 * var validateFields = { 'custpage_list_custbody_port_of_dest' :
			 * '您的选择包含不一样的Port of Destination',
			 * 'custpage_list_custbody_del_term' : '您的选择包含不一样的Terms of
			 * Delivery', 'custpage_list_custbody_ship_port' :
			 * '您的选择包含不一样的Shipment Port' }
			 * 
			 * var checkEmptyLineFields = [ 'custpage_list_custcol_tn_ship_no',
			 * 'custpage_list_custcol_tn_con_no',
			 * 'custpage_list_custcol_tn_seal_no',
			 * 'custpage_list_custcol_tn_con_typ' ];
			 * 
			 * submitReport({ reportType : 'commercialInvoice', validateFields :
			 * validateFields, checkedSummary : checkedSummary,
			 * checkEmptyLineFields : checkEmptyLineFields }); return true; }
			 */

			function printShipReport() {
				var selectCustomers = suiteletPage.getValue({
					fieldId : 'custpage_selectcustomer'
				});
				var selectedYear1 = suiteletPage.getValue({
					fieldId : 'custpage_compareyear1'
				});
				var selectedYear2 = suiteletPage.getValue({
					fieldId : 'custpage_compareyear2'
				});

				var checkedSummary = {
					'custpage_searchid' : suiteletPage.getValue({
						fieldId : 'custpage_searchid'
					})
				}

				if (selectCustomers[0]) {
					checkedSummary['custpage_selectcustomer'] = selectCustomers;
				}

				if (selectedYear1 >= 2000) {
					checkedSummary['custpage_compareyear1'] = selectedYear1;
				} else {
					dialog.alert({
						title : '错误',
						message : '请输入有效的年份1'
					});
					return false;
				}

				if (selectedYear2 && selectedYear2 > selectedYear1) {
					checkedSummary['custpage_compareyear2'] = selectedYear2;
				} else {
					dialog.alert({
						title : '错误',
						message : '请输入有效的年份2, 年份2必须大于年份1'
					});
					return false;
				}

				createSubmitPage('shippingReport', checkedSummary);
			}

			function printProfit() {
				submitReport({
					reportType : 'profit',
					validateFields : {},
					checkedSummary : {}
				});
				return true;
			}

			function printWIP() {
				submitReport({
					reportType : 'wip',
					validateFields : {},
					checkedSummary : {}
				});
				return true;
			}

			// other page function
			function inputIffLine() {
				var checkedLines = [];
				var lineCount = suiteletPage.getLineCount({
					sublistId : sublistId
				});

				for (var i = 0; i < lineCount; i++) {
					var isChecked = suiteletPage.getSublistValue({
						sublistId : sublistId,
						fieldId : checkFieldID,
						line : i
					});

					if (isChecked) {
						checkedLines.push(i);
					}
				}

				if (!checkedLines.length) {
					dialog.alert({
						title : '提示',
						message : '您没有选择任何条目'
					});
					return false;
				}

				// 创建输入窗口
				var html = '<html><head><title>输入行信息</title></head><body>'
						+ '<form id="submit" method="post" action="" style="font-size:14px;">'
						+ '<table border="0" style="margin:0px auto;">'
						+ '<tr><td>SO NO.船公司订舱号:</td><td><input id="custpage_list_custcol_tn_ship_no" type="text" /></td></tr>'
						+ '<tr><td>CONTAINERNO.柜号:</td><td><input id="custpage_list_custcol_tn_con_no" type="text" /></td></tr>'
						+ '<tr><td>SEAL NO.封条号:</td><td><input id="custpage_list_custcol_tn_seal_no" type="text" /></td></tr>'
						+ '<tr><td>CONTAINER TYPE柜型:</td><td><input id="custpage_list_custcol_tn_con_typ" type="text" /></td></tr>'
						+ '<tr><td align="center" colspan="2" style="padding-top:20px;"><input id="confirm" type="button" value="确定" /></td></tr>'
						+ '</form>' + '</body></html>';

				// 计算窗口的位置
				var iWidth = 700, iHeight = 400;
				var iTop = (window.screen.availHeight - 30 - iHeight) / 2;
				var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
				var winProp = 'width=' + iWidth + ', height=' + iHeight
						+ ', top=' + iTop + ', left=' + iLeft;
				var popWin = window.open('', '_blank', winProp);
				var popDocument = popWin.document;
				popDocument.write(html);

				popDocument.getElementById('confirm').onclick = function(e) {
					var inputValues = {};
					var validateFiedls = {
						'custpage_list_custcol_tn_ship_no' : '请输入船公司订舱号',
						'custpage_list_custcol_tn_con_no' : '请输入柜号',
						'custpage_list_custcol_tn_seal_no' : '请输入封条号',
						'custpage_list_custcol_tn_con_typ' : '请输入柜型'
					}

					for ( var key in validateFiedls) {
						if (validateFiedls.hasOwnProperty(key)) {
							var curValue = popDocument.getElementById(key).value;
							if (curValue) {
								inputValues[key] = curValue;
							} else {
								popWin.alert(validateFiedls[key]);
								return false;
							}
						}
					}

					// 输入到行上
					for (var i = 0, len = checkedLines.length; i < len; i++) {
						var lineNum = checkedLines[i] + 1;
						for ( var fieldId in inputValues) {
							if (inputValues.hasOwnProperty(fieldId)) {
								// 我们没有使用suitescript
								// api是因为2.0的currentRecord模块没有提供setSublistValue这种针对list
								// sublist的api，为了不混用1.0 api，故而使用dom的方式
								jQuery('#' + fieldId + lineNum).val(
										inputValues[fieldId]).trigger('change');
							}
						}
					}

					popWin.close();
				}
			}

			// entry point
			function fieldChanged(context) {
				if (context.fieldId == 'custpage_pageid') {
					var pageId = context.currentRecord.getValue({
						fieldId : 'custpage_pageid'
					});
					goToPage(pageId);
				} else if (context.fieldId == 'custpage_selectcompany') {
					var currentRecord = context.currentRecord;
					var address = currentRecord.getValue({
						fieldId : 'custpage_selectcompany'
					});
					currentRecord.setValue({
						fieldId : 'custpage_addressdetail',
						value : address
					});
				}
			}

			return {
				fieldChanged : fieldChanged,
				goToPage : goToPage,
				searchPO : searchPO,
				// searchIFF: searchIFF,
				searchINV : searchINV,
				searchPF : searchPF,
				searchWIP : searchWIP,
				printPO1toN : printPO1toN,
				printPONtoN : printPONtoN,
				printInvoice : printInvoice,
				// printPackList : printPackList,
				// printCommerInv: printCommerInv,
				printShipReport : printShipReport,
				printProfit : printProfit,
				printWIP : printWIP,
				inputIffLine : inputIffLine
			};
		});