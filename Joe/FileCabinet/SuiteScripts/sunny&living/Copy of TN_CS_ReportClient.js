/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Charles
 * @Nversion 1.0
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

			function createSubmitPage(reportType, checkedSummary) {
				var html = '<html><head></head><body>'
						+ '<form id="submit" method="post" action="">'
						+ '<input name="reporttype" id="reporttype" type="hidden" />'
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
						title : '����',
						message : 'ÿҳ��ʾ����������5-1000֮��'
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
						'custpage_item', 'custpage_custitemcode' ];

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

						// ��֤�����Ϣ���Ƿ�Ϊ��
						if (checkEmptyLineFields) {
							var isContainerEmpty = checkEmptyLineFields
									.some(function(fieldId) {
										return selectedLine[fieldId] == '';
									});
							if (isContainerEmpty) {
								dialog.alert({
									title : '����',
									message : '��ŵ���Ϣ����Ϊ��'
								});
								return false;
							}
						}

						checkedLines.push(selectedLine);
					}
				}

				if (checkedLines.length) {
					// ��֤�ϲ�����
					for (var i = 1, checkedCount = checkedLines.length; i < checkedCount; i++) {
						for ( var key in validateFields) {
							if (validateFields.hasOwnProperty(key)) {
								if (checkedLines[i][key] !== checkedLines[0][key]) {
									dialog.alert({
										title : 'ѡ�����',
										message : validateFields[key]
									});
									return false;
								}
							}
						}
					}

					checkedSummary.lines = checkedLines;
					createSubmitPage(reportType, checkedSummary);
					return true;
				} else {
					dialog.alert({
						title : '��ʾ',
						message : '��û��ѡ���κ���Ŀ'
					});
					return false;
				}
			}

			function printPO1toN() {
				var checkedSummary = {
					orderNote : suiteletPage.getValue({
						fieldId : 'custpage_ordernote'
					})
				};
				var validateFields = {
					'custpage_list_item_itemid' : '����ѡ�������һ�������ϱ���',
					'custpage_list_vendor_companyname' : '����ѡ�������һ���Ĺ�Ӧ��',
					'custpage_list_currency' : '����ѡ�������һ���Ļ���',
					'custpage_list_custbody_del_term' : '����ѡ�������һ���Ľ�����ʽ',
					'custpage_list_custbody_del_port' : '����ѡ�������һ���Ľ����ص�',
					'custpage_list_custbody_tn_pay_term' : '����ѡ�������һ���ĸ��ʽ'
				};

				submitReport({
					reportType : 'po1toN',
					validateFields : validateFields,
					checkedSummary : checkedSummary
				});
				return true;
			}

			function printPONtoN() {
				var checkedSummary = {
					orderNote : suiteletPage.getValue({
						fieldId : 'custpage_ordernote'
					})
				};
				var validateFields = {
					'custpage_list_vendor_companyname' : '����ѡ�������һ���Ĺ�Ӧ��',
					'custpage_list_currency' : '����ѡ�������һ���Ļ���',
					'custpage_list_custbody_del_term' : '����ѡ�������һ���Ľ�����ʽ',
					'custpage_list_custbody_del_port' : '����ѡ�������һ���Ľ����ص�',
					'custpage_list_custbody_tn_pay_term' : '����ѡ�������һ���ĸ��ʽ'
				};

				submitReport({
					reportType : 'poNtoN',
					validateFields : validateFields,
					checkedSummary : checkedSummary
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
						title : '��ʾ',
						message : '������COMMERCIAL INVOICE NO.'
					});
					return false;
				}

				if (!checkedSummary.termsOfPayment) {
					dialog.alert({
						title : '��ʾ',
						message : '��ѡ��TERMS OF PAYMENT'
					});
					return false;
				}

				if (!checkedSummary.etdDate) {
					dialog.alert({
						title : '��ʾ',
						message : '������ETD DATE'
					});
					return false;
				}

				// ��ʽ������
				checkedSummary.etdDate = format.format({
					value : checkedSummary.etdDate,
					type : format.Type.DATE
				});

				var validateFields = {
					'custpage_list_custbody_port_of_dest' : '����ѡ�������һ����Port of Destination',
					'custpage_list_custbody_del_term' : '����ѡ�������һ����Terms of Delivery',
					'custpage_list_custbody_ship_port' : '����ѡ�������һ����Shipment Port',
					'custpage_list_customer_companyname' : '����ѡ�������һ���Ŀͻ�'
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
			 * if(!checkedSummary.invoiceNo){ dialog.alert({ title: '��ʾ',
			 * message: '������COMMERCIAL INVOICE NO.' }); return false; }
			 * 
			 * if(!checkedSummary.termsOfPayment){ dialog.alert({ title: '��ʾ',
			 * message: '��ѡ��TERMS OF PAYMENT' }); return false; }
			 * 
			 * if(!checkedSummary.etdDate){ dialog.alert({ title: '��ʾ', message:
			 * '������ETD DATE' }); return false; }
			 * 
			 * //��ʽ������ checkedSummary.etdDate = format.format({ value:
			 * checkedSummary.etdDate, type: format.Type.DATE });
			 * 
			 * var validateFields = { 'custpage_list_custbody_port_of_dest' :
			 * '����ѡ�������һ����Port of Destination',
			 * 'custpage_list_custbody_del_term' : '����ѡ�������һ����Terms of
			 * Delivery', 'custpage_list_custbody_ship_port' :
			 * '����ѡ�������һ����Shipment Port' }
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
						title : '����',
						message : '��������Ч�����1'
					});
					return false;
				}

				if (selectedYear2 && selectedYear2 > selectedYear1) {
					checkedSummary['custpage_compareyear2'] = selectedYear2;
				} else {
					dialog.alert({
						title : '����',
						message : '��������Ч�����2, ���2����������1'
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
						title : '��ʾ',
						message : '��û��ѡ���κ���Ŀ'
					});
					return false;
				}

				// �������봰��
				var html = '<html><head><title>��������Ϣ</title></head><body>'
						+ '<form id="submit" method="post" action="" style="font-size:14px;">'
						+ '<table border="0" style="margin:0px auto;">'
						+ '<tr><td>SO NO.����˾���պ�:</td><td><input id="custpage_list_custcol_tn_ship_no" type="text" /></td></tr>'
						+ '<tr><td>CONTAINERNO.���:</td><td><input id="custpage_list_custcol_tn_con_no" type="text" /></td></tr>'
						+ '<tr><td>SEAL NO.������:</td><td><input id="custpage_list_custcol_tn_seal_no" type="text" /></td></tr>'
						+ '<tr><td>CONTAINER TYPE����:</td><td><input id="custpage_list_custcol_tn_con_typ" type="text" /></td></tr>'
						+ '<tr><td align="center" colspan="2" style="padding-top:20px;"><input id="confirm" type="button" value="ȷ��" /></td></tr>'
						+ '</form>' + '</body></html>';

				// ���㴰�ڵ�λ��
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
						'custpage_list_custcol_tn_ship_no' : '�����봬��˾���պ�',
						'custpage_list_custcol_tn_con_no' : '��������',
						'custpage_list_custcol_tn_seal_no' : '�����������',
						'custpage_list_custcol_tn_con_typ' : '���������'
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

					// ���뵽����
					for (var i = 0, len = checkedLines.length; i < len; i++) {
						var lineNum = checkedLines[i] + 1;
						for ( var fieldId in inputValues) {
							if (inputValues.hasOwnProperty(fieldId)) {
								// ����û��ʹ��suitescript
								// api����Ϊ2.0��currentRecordģ��û���ṩsetSublistValue�������list
								// sublist��api��Ϊ�˲�����1.0 api���ʶ�ʹ��dom�ķ�ʽ
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