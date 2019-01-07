/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
		[ 'N/record', 'N/file', 'N/render', 'N/format' ],
		function(record, file, render, format) {
			// var clientScriptPath = '/SuiteScripts/Trigger/TN_CS_MergeGL.js';
			function onRequest(context) {
				if (context.request.method === 'GET') {
					var request = context.request;
					var parameters = request.parameters;
					var recordId = parameters.recordId;
					var errorMsg = '<html><body><p id="errorMsg">单据不存在！</p></body></html>';
					// 先查询时间段内所有的合并付款
					if (!recordId) {
						context.response.write({
							output : errorMsg
						});
						return;
					}
					var billRecord = record.load({
						type : record.Type.VENDOR_BILL,
						id : recordId,
					});
					var vendorId = billRecord.getValue({
						fieldId : 'entity'
					});
					var vendor = billRecord.getText({
						fieldId : 'entity'
					});
					var date = billRecord.getValue({
						fieldId : 'trandate'
					});
					date = format.format({
						value : date,
						type : format.Type.DATE
					});
					var customer = billRecord.getText({
						fieldId : 'custbody_tn_po_custid'
					});
					var department = billRecord.getText({
						fieldId : 'department'
					});
					var memo = billRecord.getValue({
						fieldId : 'memo'
					});
					var tranid = billRecord.getValue({
						fieldId : 'tranid'
					});
					var transactionnumber = billRecord.getValue({
						fieldId : 'transactionnumber'
					});

					// 打印模板新增10个字段 add by joe 1221
					var creator = billRecord.getText({
						fieldId : 'custbody15'
					});
					if (creator) {
						creator = creator.substring(creator.indexOf(' '));
					}
					var tranDate = billRecord.getValue({
						fieldId : 'createddate'
					});
					var supervisorW = billRecord.getText({
						fieldId : 'custbody_tn_workflow_supervisor'
					});
					tranDate = format.format({
						value : tranDate,
						type : format.Type.DATETIME
					});
					tranDate = tranDate.split(' ')[0];
					// log.debug({
					// title : 'tranDate',
					// details : tranDate
					// });
					if (supervisorW) {
						supervisorW = supervisorW.substring(supervisorW
								.indexOf(' '));
					}
					var vpofoprationW = billRecord.getText({
						fieldId : 'custbody_tn_workflow_vpofopration'
					});
					if (vpofoprationW) {
						vpofoprationW = vpofoprationW.substring(vpofoprationW
								.indexOf(' '));
					}
					var gmW = billRecord.getText({
						fieldId : 'custbody_tn_workflow_gm'
					});
					if (gmW) {
						gmW = gmW.substring(gmW.indexOf(' '));
					}
					var financeW = billRecord.getText({
						fieldId : 'custbody_tn_workflow_finance'
					});
					if (financeW) {
						financeW = financeW.substring(financeW.indexOf(' '));
					}
					var supervisorDate = billRecord.getValue({
						fieldId : 'custbody_tn_workflow_date1'
					});
					if (supervisorDate) {
						supervisorDate = format.format({
							value : supervisorDate,
							type : format.Type.DATE
						})
					}
					var vpofoprationDate = billRecord.getValue({
						fieldId : 'custbody_tn_workflow_date2'
					});
					if (vpofoprationDate) {
						vpofoprationDate = format.format({
							value : vpofoprationDate,
							type : format.Type.DATE
						})
					}
					var gmDate = billRecord.getValue({
						fieldId : 'custbody_tn_workflow_date3'
					});
					if (gmDate) {
						gmDate = format.format({
							value : gmDate,
							type : format.Type.DATE
						})
					}

					var financeDate = billRecord.getValue({
						fieldId : 'custbody_tn_workflow_date4'
					});
					if (financeDate) {
						financeDate = format.format({
							value : financeDate,
							type : format.Type.DATE
						})
					}

					// ////////
					var venRecord = record.load({
						type : record.Type.VENDOR,
						id : vendorId
					});

					var bankAccount = venRecord.getValue({
						fieldId : 'custentity_tn_vendor_bankacc'
					});
					bankAccount = bankAccount ? bankAccount : '';
					var bankAccountName = venRecord.getValue({
						fieldId : 'custentity_tn_vendor_bankname'
					});
					bankAccountName = bankAccountName ? bankAccountName : '';
					var bankAccountCode = venRecord.getValue({
						fieldId : 'custentity_tn_vendor_bankcode'
					});
					bankAccountCode = bankAccountCode ? bankAccountCode : '';
					var bankAccountAdd = venRecord.getValue({
						fieldId : 'custentity_tn_vendor_bankaddr'
					});
					bankAccountAdd = bankAccountAdd ? bankAccountAdd : '';
					var currency = billRecord.getText({
						fieldId : 'currency'
					});
					var amount = billRecord.getValue({
						fieldId : 'total'
					});
					amount = amount.toFixed(2);
					var duedate = billRecord.getValue({
						fieldId : 'duedate'
					});
					duedate = format.format({
						value : duedate,
						type : format.Type.DATE
					});
					var renderData = {// 数据载体
						vendor : vendor,
						date : date,
						customer : customer,
						department : department,
						memo : memo,
						tranid : tranid,
						transactionnumber : transactionnumber,
						bankInfo : bankAccountName + '<br/>' + bankAccount
								+ '<br/>' + bankAccountAdd + '<br/>'
								+ bankAccountCode,
						currency : currency,
						amount : amount,
						duedate : duedate,
						creator : creator + ' ' + tranDate,
						supervisorWDate : supervisorW + ' ' + supervisorDate,
						vpofoprationWDate : vpofoprationW + ' '
								+ vpofoprationDate,
						gmWDate : gmW + ' ' + gmDate,
						financeWDate : financeW + ' ' + financeDate,
						lines : []
					};
					var numLines = billRecord.getLineCount({
						sublistId : 'expense'
					});
					for (var i = 0; i < numLines; i++) {
						var category = billRecord.getSublistText({
							sublistId : 'expense',
							fieldId : 'category',
							line : i
						});
						var memo = billRecord.getSublistValue({
							sublistId : 'expense',
							fieldId : 'memo',
							line : i
						});
						var amount = billRecord.getSublistValue({
							sublistId : 'expense',
							fieldId : 'amount',
							line : i
						});
						// var grossamt = billRecord.getSublistValue({
						// sublistId : 'expense',
						// fieldId : 'grossamt',
						// line : i
						// });
						// var taxAmount = grossamt - amount;
						var refNo = billRecord.getSublistValue({
							sublistId : 'expense',
							fieldId : 'custcol_tn_reference_no',
							line : i
						});
						amount = amount.toFixed(2);
						// taxAmount = taxAmount.toFixed(2);
						renderData.lines.push({
							category : category,
							memo : memo,
							amount : amount,
							taxAmount : refNo
						});
					}
					// 生成报表
					var xmlTmpl = file.load({
						id : 'Templates/PDF Templates/Bill Template.xml'
					}).getContents();
					var renderer = render.create();
					renderer.templateContent = xmlTmpl;
					renderer.addCustomDataSource({
						format : render.DataSource.OBJECT,
						alias : 'renderData',
						data : renderData
					});
					var fileContent = renderer.renderAsString();
					fileContent = fileContent.replace(/&/g, "_");
					var pdf = render.xmlToPdf({
						xmlString : fileContent
					});
					pdf.name = 'Bill Report.pdf';
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

			return {
				onRequest : onRequest
			};
		});