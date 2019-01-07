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
					var venRecord = record.load({
						type : record.Type.VENDOR,
						id : vendorId
					});

					var bankAccount = venRecord.getValue({
						fieldId : 'custentity_tn_vendor_bankacc'
					});
					var bankAccountName = venRecord.getValue({
						fieldId : 'custentity_tn_vendor_bankname'
					});
					var bankAccountCode = venRecord.getValue({
						fieldId : 'custentity_tn_vendor_bankcode'
					});
					var bankAccountAdd = venRecord.getValue({
						fieldId : 'custentity_tn_vendor_bankaddr'
					});
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
						var grossamt = billRecord.getSublistValue({
							sublistId : 'expense',
							fieldId : 'grossamt',
							line : i
						});
						var taxAmount = grossamt - amount;
						amount = amount.toFixed(2);
						taxAmount = taxAmount.toFixed(2);
						renderData.lines.push({
							category : category,
							memo : memo,
							amount : amount,
							taxAmount : taxAmount
						});
					}
					// 生成报表
					var xmlTmpl = file.load({
						id : 'SuiteScripts/Bill Template.xml'
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