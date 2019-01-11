/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NAutor Charles
 * @NVersion 1.0
 * @NDescription create PO/Item Fulfillment search page
 */
define(
		[ 'N/ui/serverWidget', 'N/search', 'N/runtime' ],
		function(serverWidget, search, runtime) {

			var clientScriptPath = 'SuiteBundles/Bundle 264410/TN_CS_ReportClient.js';

			// common function
			function creatPagedSublist(option) {
				// initialnize parameters
				var form = option.form;
				var searchId = option.searchId;
				var parameters = option.parameters;
				var addFilters = option.addFilters;
				var refreshParams = option.refreshParams;
				var columnShowMap = option.columnShowMap;
				var inputColumn = option.inputColumn || [];
				var pageSize = parseInt(parameters['custpage_pagesize']) || 50;
				var pageId = parseInt(parameters['custpage_pageid']) || 1;
				refreshParams['custpage_pagesize'] = pageSize;

				// log.debug({
				// title : 'addFilters',
				// details : addFilters
				// });
				// load and run search
				var searchObj = search.load({
					id : searchId
				});
				if (addFilters.length) {
					searchObj.filterExpression = searchObj.filterExpression
							.concat(addFilters);
				}
				var pagedData = searchObj.runPaged({
					pageSize : pageSize
				});
				var pageCount = pagedData.pageRanges.length;
				var columnMap = {};

				// 处理页面越界
				if (pageId < 1) {
					pageId = 1
				} else if (pageId > pageCount) {
					pageId = pageCount;
				}

				// 设置client script
				form.clientScriptModulePath = clientScriptPath;

				// 设置翻页下拉框
				form.addFieldGroup({
					id : 'custpage_pagerange',
					label : '分页选项'
				});

				// pageid selection
				var selectOptions = form.addField({
					id : 'custpage_pageid',
					label : '共' + pageCount + '页',
					type : serverWidget.FieldType.SELECT,
					container : 'custpage_pagerange'
				}).updateLayoutType({
					layoutType : serverWidget.FieldLayoutType.OUTSIDE
				});
				for (i = 1; i <= pageCount; i++) {
					selectOptions.addSelectOption({
						value : i,
						text : i,
						isSelected : pageId === i
					});
				}

				// add pageSize input field
				form.addField({
					id : 'custpage_pagesize',
					label : '每页数量(5-1000)',
					type : serverWidget.FieldType.INTEGER,
					container : 'custpage_pagerange'
				}).updateLayoutType({
					layoutType : serverWidget.FieldLayoutType.OUTSIDE
				});

				// 初始化搜索条件
				form.updateDefaultValues(refreshParams);

				// add sublist
				var sublist = form.addSublist({
					id : 'custpage_searchresults',
					type : serverWidget.SublistType.LIST,
					label : '搜索结果'
				});

				// 如果没有结果，就直接返回
				if (!pagedData.count)
					return form;

				// 设置上一页，下一页按钮
				if (pageId !== 1) {
					sublist.addButton({
						id : 'custpage_list_previous',
						label : '上一页',
						functionName : 'goToPage(' + (pageId - 1) + ')'
					});
				}

				if (pageId !== pageCount) {
					sublist.addButton({
						id : 'custpage_list_next',
						label : '下一页',
						functionName : 'goToPage(' + (pageId + 1) + ')'
					});
				}

				// add mark all button
				sublist.addMarkAllButtons();

				// add sublist columns
				sublist.addField({
					id : 'custpage_list_index',
					type : serverWidget.FieldType.TEXT,
					label : '序号'
				});
				sublist.addField({
					id : 'custpage_list_checked',
					type : serverWidget.FieldType.CHECKBOX,
					label : '选择'
				});
				searchObj.columns.forEach(function(column) {
					var fieldId = column.name;

					if (column.join)
						fieldId = column.join + '.' + fieldId;
					fieldId = fieldId.toLowerCase();
					// log.debug({
					// title : 'fieldId',
					// details : fieldId
					// });
					var showColLabel = columnShowMap[fieldId];
					var isInput = inputColumn.indexOf(fieldId) !== -1;

					fieldId = 'custpage_list_' + fieldId.replace('.', '_');
					// columnMap[fieldId] = column;
					columnMap[fieldId] = {
						detail : column,
						show : !!showColLabel
					}

					var sublistField = sublist.addField({
						id : fieldId,
						label : showColLabel || column.label,
						type : serverWidget.FieldType.TEXT
					});

					if (!showColLabel) {
						sublistField.updateDisplayType({
							displayType : serverWidget.FieldDisplayType.HIDDEN
						});
					}

					if (isInput) {
						sublistField.updateDisplayType({
							displayType : serverWidget.FieldDisplayType.ENTRY
						});
					}
				});

				/*
				 * log.debug({ title : 'columnMap keys', details :
				 * Object.keys(columnMap) });
				 */

				// 搜索当页数据并填充sublist
				pageId--;// page 数组从0开始，而page id从1开始
				var startIndex = pageId * pageSize;
				pagedData.fetch({
					index : pageId
				}).data.forEach(function(result, line) {
					// 设置序号
					sublist.setSublistValue({
						id : 'custpage_list_index',
						value : String(++startIndex),
						line : line
					});
					// 设置其他列
					util.each(columnMap, function(column, fieldId) {
						var columnVaule;
						if (column.show) {
							columnVaule = result.getText(column.detail)
									|| result.getValue(column.detail);
						} else {
							columnVaule = result.getValue(column.detail);
						}

						if (columnVaule != ' ' && columnVaule
								&& columnVaule != '- None -') {
							// var convertValue = Number(columnVaule);
							// if(!isNaN(convertValue)) columnVaule =
							// convertValue;
							// columnVaule
							// 修复oracle数据库小数点前没有0的问题
//							log.debug({
//								title : 'columnVaule',
//								details : JSON.stringify(columnVaule) + ',' + fieldId
//							});
							if (columnVaule < 1)
								columnVaule = parseFloat(columnVaule);

							sublist.setSublistValue({
								id : fieldId,
								value : columnVaule,
								line : line
							});
						}
					});
				});

				// 设置一些默认信息在页面上，以便进行页面跳转的时候，以及读取所有sublist
				// column值的时候使用，因为currentRecord没有提供getSublistFields API
				var defaultInfo = {
					refresh : refreshParams,
					allSublistColumns : Object.keys(columnMap)
				}
				form.addField({
					id : 'custpage_defaultinfo',
					label : 'Default Info',
					type : serverWidget.FieldType.TEXTAREA,
					container : 'custpage_pagerange'
				}).updateDisplayType({
					displayType : serverWidget.FieldDisplayType.HIDDEN
				}).defaultValue = JSON.stringify(defaultInfo);

				return form;
			}

			// create page function
			function poPage(context, searchId) {
				var request = context.request;
				var response = context.response;
				var parameters = request.parameters;

				try {
					var filterGroupID = 'custpage_filtergroup';
					var filterNames = {
						'custbody_customer_so_no' : '客户订单号',
						'custcol_tn_cus_item_code' : '客户产品编码',
						'item.itemid' : '物料编码',
						'customer.companyname' : '客户名称',
						'vendor.entityid' : '供应商'// 新增供应商刷选条件
					};
					var approvalStatusMap = {
						'1' : 'Pending Approval',
						'2' : 'Approved',
						'3' : 'Rejected'
					};
					var orderStatusMap = {
						'PurchOrd:A' : 'Pending Supervisor Approval',
						'PurchOrd:B' : 'Pending Receipt',
						'PurchOrd:C' : 'Rejected by Supervisor',
						'PurchOrd:D' : 'Partially Received',
						'PurchOrd:E' : 'Pending Billing/Partially Received',
						'PurchOrd:F' : 'Pending Bill',
						'PurchOrd:G' : 'Fully Billed',
						'PurchOrd:H' : 'Closed'
					};
					var columnShowMap = {
						'tranid' : 'PO单号',
						'custbody_customer_so_no' : '客户订单号',
						'custcol_tn_cus_item_code' : '客户产品编码',
						'item.itemid' : '物料编码',
						'custcol_tn_item_name' : '物料名称',
						'customer.companyname' : '客户名称',
						'custbody_tn_early_ship_date' : '出运开始日期',
						'custbody_tn_last_ship_date' : '出运结束日期',
						'vendor.companyname' : '供应商',
						'currency' : '币种',
						'custbody_del_term' : '交货方式',
						'custbody_del_port' : '交货地点',
						'custbody_tn_pay_term' : '付款方式',
						'quantity' : '订单数量',
						'approvalstatus' : '审批状态',
						'statusref' : '订单状态'
					}
					var filterLayoutType = serverWidget.FieldLayoutType.OUTSIDE;

					// create page form
					var form = serverWidget.createForm({
						title : '搜索PO订单'
					});

					// create filter group
					form.addFieldGroup({
						id : filterGroupID,
						label : '搜索条件'
					});

					// filter label
					form.addField({
						id : 'custpage_searchlabel',
						type : serverWidget.FieldType.LABEL,
						label : '按&nbsp;',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});

					// filter field
					var filterNameField = form.addField({
						id : 'custpage_filtername',
						type : serverWidget.FieldType.SELECT,
						label : ' ',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});

					util.each(filterNames, function(text, value) {// add
						// option
						filterNameField.addSelectOption({
							text : text,
							value : value
						});
					});

					// filter operator
					form.addField({
						id : 'custpage_filteroperator',
						type : serverWidget.FieldType.TEXT,
						label : ' ',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).updateDisplayType({
						displayType : serverWidget.FieldDisplayType.INLINE
					}).defaultValue = '包含';

					// filter value
					form.addField({
						id : 'custpage_filtervalue',
						type : serverWidget.FieldType.TEXT,
						label : ' ',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});

					// start date
					form.addField({
						id : 'custpage_startdatelabel',
						type : serverWidget.FieldType.LABEL,
						label : '出运开始日期从&nbsp;',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});
					form.addField({
						id : 'custpage_startdate',
						type : serverWidget.FieldType.DATE,
						label : ' ',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});

					// end date
					form.addField({
						id : 'custpage_enddatelabel',
						type : serverWidget.FieldType.LABEL,
						label : '到&nbsp;',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});
					form.addField({
						id : 'custpage_enddate',
						type : serverWidget.FieldType.DATE,
						label : ' ',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});

					// add approve status filter
					form.addField({
						id : 'custpage_appstatuslabel',
						type : serverWidget.FieldType.LABEL,
						label : '审批状态&nbsp;',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});
					var approvalStatusField = form.addField({
						id : 'custpage_approvalstatus',
						type : serverWidget.FieldType.MULTISELECT,
						label : ' ',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});
					util.each(approvalStatusMap, function(text, value) {
						approvalStatusField.addSelectOption({
							text : text,
							value : value
						});
					});

					// add order status filter
					form.addField({
						id : 'custpage_orderstatuslabel',
						type : serverWidget.FieldType.LABEL,
						label : '订单状态&nbsp;',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});
					var orderStatusField = form.addField({
						id : 'custpage_orderstatus',
						type : serverWidget.FieldType.MULTISELECT,
						label : ' ',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});
					util.each(orderStatusMap, function(text, value) {
						orderStatusField.addSelectOption({
							text : text,
							value : value
						});
					});

					// search button
					form.addField({
						id : 'custpage_filterbutton',
						type : serverWidget.FieldType.INLINEHTML,
						label : '搜索',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).defaultValue = '<input type="button" value="查询" onclick="require([\''
							+ clientScriptPath
							+ '\'], function(mod){ mod.searchPO(); return false;});" style="font-size: 14px;font-weight: 600;padding: 0 12px;" />';

					// report note group
					form.addFieldGroup({
						id : 'custpage_reportnotegroup',
						label : '填写到报表上面的备注'
					});
					// report note field
					form.addField({
						id : 'custpage_ordernote',
						type : serverWidget.FieldType.TEXT,
						label : ' ',
						container : 'custpage_reportnotegroup'
					}).updateLayoutType({
						layoutType : serverWidget.FieldLayoutType.OUTSIDEBEL​OW
					}).updateDisplaySize({
						height : 60,
						width : 50
					});

					// add print button
					form.addButton({
						id : 'custpage_printpo1ton',
						label : 'PO C合并打印',
						functionName : 'printPO1toN(1)'
					});
					form.addButton({
						id : 'custpage_printponton',
						label : 'PO AE合并打印',
						functionName : 'printPONtoN(1)'
					});

					// add print button by joe 20180329 新增无金额报表
					form.addButton({
						id : 'custpage_printpo1ton_noprice',
						label : 'PO C合并打印（无金额）',
						functionName : 'printPO1toN(2)'
					});
					form.addButton({
						id : 'custpage_printponton_noprice',
						label : 'PO AE合并打印（无金额）',
						functionName : 'printPONtoN(2)'
					});

					// get user search criteria
					var addFilters = [], refreshParams = {};// 存储表单元素默认值
					var filterValue = parameters['custpage_filtervalue'];
					var startDate = parameters['custpage_startdate'];
					var endDate = parameters['custpage_enddate'];
					var approStatus = parameters['custpage_approvalstatus'];
					var orderStatus = parameters['custpage_orderstatus'];

					if (filterValue) {
						var filterName = parameters['custpage_filtername'];
						addFilters.push('AND', [ filterName, 'contains',
								filterValue ]);
						refreshParams['custpage_filtername'] = filterName;
						refreshParams['custpage_filtervalue'] = filterValue;
					}

					if (startDate) {
						addFilters.push('AND', [ 'custbody_tn_early_ship_date',
								'onorafter', startDate ]);
						refreshParams['custpage_startdate'] = startDate;
					}

					if (endDate) {
						addFilters.push('AND', [ 'custbody_tn_early_ship_date',
								'onorbefore', endDate ]);
						refreshParams['custpage_enddate'] = endDate;
					}

					if (approStatus) {
						approStatus = approStatus.split(',');
						addFilters.push('AND', [ 'approvalstatus', 'anyof',
								approStatus ]);
						refreshParams['custpage_approvalstatus'] = approStatus;
					}

					if (orderStatus) {
						orderStatus = orderStatus.split(',');
						addFilters.push('AND',
								[ 'status', 'anyof', orderStatus ]);
						refreshParams['custpage_orderstatus'] = orderStatus;
					}

					// create sublist and populate data
					form = creatPagedSublist({
						form : form,
						searchId : searchId,
						parameters : parameters,
						addFilters : addFilters,
						refreshParams : refreshParams,
						columnShowMap : columnShowMap
					});

					response.writePage({
						pageObject : form
					});

				} catch (e) {
					log.debug({
						title : 'create po search page error',
						details : e
					});
				}
			}

			/*
			 * function iffPage(context, searchId) { var request =
			 * context.request; var response = context.response; var parameters =
			 * request.parameters;
			 * 
			 * try { var filterGroupID = 'custpage_filtergroup'; var
			 * filterLayoutType = serverWidget.FieldLayoutType.OUTSIDE; //search
			 * fields var searchFieldMap = { 'item.itemid': { fieldId:
			 * 'custpage_itemnamenumber', fieldLabel: '产品编码', },
			 * 'custcol_tn_item_name': { fieldId: 'custpage_itemdisname',
			 * fieldLabel: '产品名称', }, 'custbody_customer_so_no': { fieldId:
			 * 'custpage_custorderno', fieldLabel: '客户订单号', },
			 * 'custbody_sub_customer_so_no': { fieldId:
			 * 'custpage_subcustorderno', fieldLabel: '子客户订单号', },
			 * 'custcol_tn_cus_item_code': { fieldId: 'custpage_custitemcode',
			 * fieldLabel: '客户产品编码', } };
			 * 
			 * var columnShowMap = { 'item.itemid' : '产品编码',
			 * 'custcol_tn_item_name' : '产品名称', 'custcol_tn_cus_item_code' :
			 * '客户产品编码', 'custcol_tn_cus_pro_id' : '客户产品货号',
			 * 'custcol_tn_sub_cus_item_co' : '子客户产品编码', 'customer.companyname' :
			 * '客户名称', 'custcol_tn_carton_qty' : '箱数',
			 * 'custbody_sub_customer.companyname' : '子客户名称',
			 * 'custbody_sub_customer_so_no' : '子客户单号',
			 * 'custbody_customer_so_no' : '客户订单号', 'trandate' : '制单时间',
			 * 'custcol_tn_sam_con_date' : 'QC验货时间', 'quantity' : '数量',
			 * 'custbody_port_of_dest' : 'PORT OF DESTINATION',
			 * 'custbody_del_term' : 'TERMS OF DELIVERY', 'custbody_ship_port' :
			 * 'SHIPMENT PORT', 'custcol_tn_ship_no' : 'SO NO.船公司订舱号',//input
			 * 'custcol_tn_con_no' : 'CONTAINERNO.柜号',//input
			 * 'custcol_tn_seal_no' : 'SEAL NO.封条号',//input 'custcol_tn_con_typ' :
			 * '柜型'//input };
			 * 
			 * var inputColumn = [ 'custcol_tn_ship_no', 'custcol_tn_con_no',
			 * 'custcol_tn_seal_no', 'custcol_tn_con_typ' ];
			 * 
			 * //create page form var form = serverWidget.createForm({ title:
			 * '搜索Item Fulfillment' }); form.addFieldGroup({ id: filterGroupID,
			 * label: '快速搜索' });
			 * 
			 * //add search fields var addFilters = [], refreshParams = {};
			 * util.each(searchFieldMap, function (fieldInfo, filterName) { var
			 * fieldId = fieldInfo.fieldId;
			 * 
			 * //创建搜索字段 form.addField({ id: fieldId, label:
			 * fieldInfo.fieldLabel, type: serverWidget.FieldType.TEXT,
			 * container: filterGroupID }).updateLayoutType({ layoutType:
			 * filterLayoutType });
			 * 
			 * //初始化字段值，并设置搜索条件 var searchValue = parameters[fieldId]; if
			 * (searchValue) { addFilters.push( 'AND', [filterName, 'contains',
			 * searchValue] ); refreshParams[fieldId] = searchValue; } });
			 * 
			 * //add html search button form.addField({ id:
			 * 'custpage_searchbutton', label: '搜索', type:
			 * serverWidget.FieldType.INLINEHTML, container: filterGroupID
			 * }).updateLayoutType({ layoutType: filterLayoutType
			 * }).defaultValue = '<input value="查询" type="button"
			 * onclick="require([\'' + clientScriptPath + '\'], function(mod){
			 * mod.searchIFF(); return false;});" style="font-size:
			 * 14px;font-weight: 600;padding: 0 12px;margin-top: 20px;" />';
			 * 
			 * //填写回写字段 var writeBackGroupID = 'custpage_writebackgroup';
			 * form.addFieldGroup({ id: writeBackGroupID, label: '回写字段' });
			 * form.addField({ id: 'custpage_commercial_invoice_no', label:
			 * 'COMMERCIAL INVOICE NO.', type: serverWidget.FieldType.TEXT,
			 * container: writeBackGroupID }).updateLayoutType({ layoutType:
			 * filterLayoutType });
			 * 
			 * form.addField({ id: 'custpage_terms_of_payment', label: 'TERMS OF
			 * PAYMENT', type: serverWidget.FieldType.SELECT, source : 'term',
			 * container: writeBackGroupID }).updateLayoutType({ layoutType:
			 * filterLayoutType });
			 * 
			 * form.addField({ id: 'custpage_etd_date', label: 'ETD DATE', type:
			 * serverWidget.FieldType.DATE, container: writeBackGroupID
			 * }).updateLayoutType({ layoutType: filterLayoutType });
			 * form.addField({ id: 'custpage_popup_line_input', label: ' ',
			 * type: serverWidget.FieldType.INLINEHTML, container:
			 * writeBackGroupID }).updateLayoutType({ layoutType:
			 * filterLayoutType }).defaultValue = '<input value="输入勾选"
			 * type="button" onclick="require([\'' + clientScriptPath + '\'],
			 * function(mod){ mod.inputIffLine(); return false;});"
			 * style="font-size: 14px;font-weight: 600;padding: 0
			 * 12px;margin-top: 20px;" />';
			 * 
			 * //add print button form.addButton({ id: 'custpage_printpacklist',
			 * label: '打印Packing List', functionName: 'printPackList' });
			 * 
			 * //create sublist and populate data form = creatPagedSublist({
			 * form : form, searchId : searchId, parameters : parameters,
			 * addFilters : addFilters, refreshParams : refreshParams,
			 * columnShowMap : columnShowMap, inputColumn : inputColumn });
			 * 
			 * //write page response.writePage({ pageObject: form }); } catch
			 * (e) { log.debug({ title: 'create item fulfillment search page
			 * error', details: e }); } }
			 */

			// 合并packing list和commercial invoice 搜索页面
			function ivPage(context, searchId) {
				var request = context.request;
				var response = context.response;
				var parameters = request.parameters;

				try {
					var filterGroupID = 'custpage_filtergroup';
					var filterLayoutType = serverWidget.FieldLayoutType.OUTSIDE;
					// search fields
					var searchFieldMap = {
						'item.itemid' : {
							fieldId : 'custpage_itemnamenumber',
							fieldLabel : '产品编码',
						},
						'custcol_tn_item_name' : {
							fieldId : 'custpage_itemdisname',
							fieldLabel : '产品名称',
						},
						'custbody_customer_so_no' : {
							fieldId : 'custpage_custorderno',
							fieldLabel : '客户订单号',
						},
						'custbody_sub_customer_so_no' : {
							fieldId : 'custpage_subcustorderno',
							fieldLabel : '子客户订单号',
						},
						'custcol_tn_cus_item_code' : {
							fieldId : 'custpage_custitemcode',
							fieldLabel : '客户产品编码',
						},
						'approvalstatus' : {
							fieldId : 'custpage_approvalstatus',
							fieldLabel : '审批状态',
							source : {
								'1' : 'Pending Approval',
								'2' : 'Approved',
								'3' : 'Rejected'
							}
						},
						'status' : {
							fieldId : 'custpage_orderstatus',
							fieldLabel : '单据状态',
							source : {
								'CustInvc:A' : 'Open',
								'CustInvc:B' : 'Paid In Full',
								'CustInvc:D' : 'Pending Approval',
								'CustInvc:E' : 'Rejected',
								'CustInvc:V' : 'Voided'
							}
						}
					};

					var columnShowMap = {
						'tranid' : 'Invoice单号',
						'item.itemid' : '产品编码',
						'custcol_tn_item_name' : '产品名称',
						'custcol_tn_cus_item_code' : '客户产品编码',
						'custcol_tn_cus_pro_id' : '客户产品货号',
						'custcol_tn_sub_cus_item_co' : '子客户产品编码',
						'customer.companyname' : '客户名称',
						'custcol_tn_carton_qty' : '箱数',
						'custbody_sub_customer.companyname' : '子客户名称',
						'custbody_sub_customer_so_no' : '子客户单号',
						'custbody_customer_so_no' : '客户订单号',
						'trandate' : '制单时间',
						'custcol_tn_sam_con_date' : 'QC验货时间',
						'quantity' : '数量',
						'custbody_port_of_dest' : 'PORT OF DESTINATION',
						'custbody_del_term' : 'TERMS OF DELIVERY',
						'custbody_ship_port' : 'SHIPMENT PORT',
						'approvalstatus' : '审批状态',
						'statusref' : '单据状态',
						'custcol_tn_ship_no' : 'SO NO.船公司订舱号',// input
						'custcol_tn_con_no' : 'CONTAINERNO.柜号',// input
						'custcol_tn_seal_no' : 'SEAL NO.封条号',// input
						'custcol_tn_con_typ' : '柜型'// input
					};

					var inputColumn = [ 'custcol_tn_ship_no',
							'custcol_tn_con_no', 'custcol_tn_seal_no',
							'custcol_tn_con_typ' ];

					// create page form
					var form = serverWidget.createForm({
						title : '搜索Invoice'
					});
					form.addFieldGroup({
						id : filterGroupID,
						label : '快速搜索'
					});

					// add search fields
					var addFilters = [], refreshParams = {};
					util.each(searchFieldMap, function(fieldInfo, filterName) {
						var fieldId = fieldInfo.fieldId;
						var selectOption = fieldInfo.source;

						// 创建搜索字段
						if (selectOption) {
							var selectField = form.addField({
								id : fieldId,
								label : fieldInfo.fieldLabel,
								type : serverWidget.FieldType.MULTISELECT,
								container : filterGroupID
							}).updateLayoutType({
								layoutType : filterLayoutType
							});
							util.each(selectOption, function(text, value) {
								selectField.addSelectOption({
									value : value,
									text : text
								});
							});
						} else {
							form.addField({
								id : fieldId,
								label : fieldInfo.fieldLabel,
								type : serverWidget.FieldType.TEXT,
								container : filterGroupID
							}).updateLayoutType({
								layoutType : filterLayoutType
							});
						}

						// 初始化字段值，并设置搜索条件
						var searchValue = parameters[fieldId];
						if (searchValue) {
							var operator;
							if (selectOption) {
								operator = 'anyof';
								searchValue = searchValue.split(',');
							} else {
								operator = 'contains';
							}
							addFilters.push('AND', [ filterName, operator,
									searchValue ]);
							refreshParams[fieldId] = searchValue;
						}
					});

					// add html search button
					form.addField({
						id : 'custpage_searchbutton',
						label : '搜索',
						type : serverWidget.FieldType.INLINEHTML,
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).defaultValue = '<input value="查询" type="button" onclick="require([\''
							+ clientScriptPath
							+ '\'], function(mod){ mod.searchINV(); return false;});" style="font-size: 14px;font-weight: 600;padding: 0 12px;margin-top: 20px;" />';

					// 填写回写字段
					var writeBackGroupID = 'custpage_writebackgroup';
					form.addFieldGroup({
						id : writeBackGroupID,
						label : '回写字段'
					});
					form.addField({
						id : 'custpage_commercial_invoice_no',
						label : 'COMMERCIAL INVOICE NO.',
						type : serverWidget.FieldType.TEXT,
						container : writeBackGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});

					form.addField({
						id : 'custpage_terms_of_payment',
						label : 'TERMS OF PAYMENT',
						type : serverWidget.FieldType.SELECT,
						source : 'term',
						container : writeBackGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});

					form.addField({
						id : 'custpage_etd_date',
						label : 'ETD DATE',
						type : serverWidget.FieldType.DATE,
						container : writeBackGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					});
					form.addField({
						id : 'custpage_popup_line_input',
						label : ' ',
						type : serverWidget.FieldType.INLINEHTML,
						container : writeBackGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).defaultValue = '<input value="批量输入柜号信息" type="button" onclick="require([\''
							+ clientScriptPath
							+ '\'], function(mod){ mod.inputIffLine(); return false;});" style="font-size: 14px;font-weight: 600;padding: 0 12px;margin-top: 20px;" />';

					// 添加选择地址的选项
					form.addFieldGroup({
						id : 'custpage_additionaloption',
						label : '选择公司信息'
					});
					var companyField = form.addField({
						id : 'custpage_selectcompany',
						label : '发货地址',
						type : serverWidget.FieldType.SELECT,
						container : 'custpage_additionaloption'
					}).updateLayoutType({
						layoutType : filterLayoutType
					});
					var defaultAddress = 'SUNNY LIVING HOME PRODUCTS CO.,LIMITED<br>Rm 3106, 31/F, HongCheong Plaza.<br>No 2001, Shennan East Road<br>Luohu District. Shenzhen City.';
					companyField.addSelectOption({
						value : defaultAddress,
						text : 'SUNNY LIVING CO.,LIMITED - Shennan East Road',
						isSelected : true
					});
					companyField
							.addSelectOption({
								value : 'SUNNY LIVING HOME PRODUCTS CO.,LIMITED<br>F/23 ONE CITY CENTER<br>MAMIAO STREET, SHA TOU JIAO YANTIAN<br>SHENZHEN, GUANGDONG 518000 CHINA',
								text : 'SUNNY LIVING CO.,LIMITED - SHA TOU JIAO YANTIAN'
							});
					companyField
							.addSelectOption({
								value : 'EASY HOME ORGANIZA TION MANUFACTURING CO.,LIMITED<br>Rm 3106, 31/F, HongCheong Plaza.<br>No 2001, Shennan East Road<br>Luohu District. Shenzhen City.',
								text : 'EASY HOME ORGANIZA TION MANUFACTURING CO.,LIMITED'
							});

					form.addField({
						id : 'custpage_addressdetail',
						label : '地址详情',
						type : serverWidget.FieldType.TEXTAREA,
						container : 'custpage_additionaloption'
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).updateDisplayType({
						displayType : serverWidget.FieldDisplayType.INLINE
					}).defaultValue = defaultAddress;

					// add print button
					form.addButton({
						id : 'custpage_printpacklist',
						label : 'Print Packing List',
						functionName : 'printInvoice("packingList")'
					});
					form.addButton({
						id : 'custpage_printcommercialinvoice',
						label : 'Print Commercial Invoice',
						functionName : 'printInvoice("commercialInvoice")'
					});

					// create sublist and populate data
					form = creatPagedSublist({
						form : form,
						searchId : searchId,
						parameters : parameters,
						addFilters : addFilters,
						refreshParams : refreshParams,
						columnShowMap : columnShowMap,
						inputColumn : inputColumn
					});

					// write page
					response.writePage({
						pageObject : form
					});
				} catch (e) {
					log.debug({
						title : 'create invoice search page error',
						details : e
					});
				}
			}

			function spPage(context, searchId) {
				var request = context.request;
				var response = context.response;
				var parameters = request.parameters;

				try {
					// create page form
					var filterLayoutType = serverWidget.FieldLayoutType.OUTSIDEABO​V​E;
					var filterBreakType = serverWidget.FieldBreakType.STARTROW;
					var filterGroupID = 'custpage_filtergroup';
					var form = serverWidget.createForm({
						title : '筛选Shipping Report'
					});

					form.clientScriptModulePath = clientScriptPath;
					form.addFieldGroup({
						id : filterGroupID,
						label : '筛选条件'
					});

					// 选择客户
					form.addField({
						id : 'custpage_selectcustomer',
						label : '选择客户',
						type : serverWidget.FieldType.MULTISELEC​T,
						container : filterGroupID,
						source : 'customer'
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).updateBreakType({
						breakType : filterBreakType
					});

					// 选择对比年份
					form.addField({
						id : 'custpage_compareyear1',
						label : '对比年份1',
						type : serverWidget.FieldType.INTEGER,
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).updateBreakType({
						breakType : filterBreakType
					});

					form.addField({
						id : 'custpage_compareyear2',
						label : '对比年份2',
						type : serverWidget.FieldType.INTEGER,
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).updateBreakType({
						breakType : filterBreakType
					});

					// 设置searchId
					form.addField({
						id : 'custpage_searchid',
						label : 'Saved Search ID',
						type : serverWidget.FieldType.TEXT,
						container : filterGroupID
					}).updateDisplayType({
						displayType : serverWidget.FieldDisplayType.HIDDEN
					}).defaultValue = searchId;

					form.addButton({
						id : 'custpage_printshipreport',
						label : '打印Shipping Port',
						functionName : 'printShipReport'
					});

					response.writePage({
						pageObject : form
					});
				} catch (e) {
					log.debug({
						title : 'create shipping port search page error',
						details : e
					});
				}
			}

			// 利润分析表新增时间筛选条件 joe 20180517
			function pfPage(context, searchId) {
				var request = context.request;
				var response = context.response;
				var parameters = request.parameters;
				try {
					var filterGroupID = 'custpage_filtergroup';
					var filterLayoutType = serverWidget.FieldLayoutType.OUTSIDE;
					// search fields
					var searchFieldMap = {
						'inventorydetail.binnumber' : {
							fieldId : 'custpage_itembinnumber',
							fieldLabel : 'Vendor Bin',
							type : 'SELECT',
							source : 'bin'
						},
						'entity' : {
							fieldId : 'custpage_customer',
							fieldLabel : '客户 customer',
							type : 'SELECT',
							source : 'customer'
						},
						'custbody_customer_so_no' : {
							fieldId : 'custpage_custorderno',
							fieldLabel : '客人订单号 SO',
							type : 'TEXT'
						},
						'item' : {
							fieldId : 'custpage_item',
							fieldLabel : '产成品品编号 Item',
							type : 'SELECT',
							source : 'item'
						},
						'custcol_tn_cus_item_code' : {
							fieldId : 'custpage_custitemcode',
							fieldLabel : '客户产品编码',
							type : 'TEXT'
						},
						'trandateBegin' : {// joe
							fieldId : 'custpage_datebegin',
							fieldLabel : 'BeginDate',
							type : 'DATE'
						},
						'trandateEnd' : {// joe
							fieldId : 'custpage_dateend',
							fieldLabel : 'EndDate',
							type : 'DATE'
						}
					};

					var columnShowMap = {
						'formulatext' : 'SO Number',
						'tranid' : 'Invoice Number',
						'item.itemid' : '产成品编号',
						'inventorydetail.binnumber' : 'Vendor Bin',
						'customer.companyname' : '客户',
						'custbody_customer_so_no' : '客人订单号',
						'custcol_tn_cus_item_code' : '客户产品编码'
					};

					// create page form
					var form = serverWidget.createForm({
						title : '搜索Invoice成品'
					});
					form.addFieldGroup({
						id : filterGroupID,
						label : '快速搜索'
					});

					// add search fields
					var addFilters = [], refreshParams = {};
					util.each(searchFieldMap, function(fieldInfo, filterName) {
						var fieldId = fieldInfo.fieldId;
						var fieldType = fieldInfo.type;

						// 创建搜索字段
						if (fieldType == 'TEXT') {
							form.addField({
								id : fieldId,
								label : fieldInfo.fieldLabel,
								type : serverWidget.FieldType.TEXT,
								container : filterGroupID
							}).updateLayoutType({
								layoutType : filterLayoutType
							});
						} else if (fieldType == 'SELECT') {
							form.addField({
								id : fieldId,
								label : fieldInfo.fieldLabel,
								type : serverWidget.FieldType.MULTISELECT,
								container : filterGroupID,
								source : fieldInfo.source
							}).updateLayoutType({
								layoutType : filterLayoutType
							});
						} else if (fieldType == 'DATE') {// joe
							form.addField({
								id : fieldId,
								label : fieldInfo.fieldLabel,
								type : serverWidget.FieldType.DATE,
								container : filterGroupID
							}).updateLayoutType({
								layoutType : filterLayoutType
							});
						}

						// joe
						switch (fieldType) {
						case 'TEXT':
							fieldType = 'contains';
							break;
						default:
							fieldType = 'anyof';
							break;
						}
						if (filterName == 'trandateBegin') {
							fieldType = 'onorafter';
							filterName = 'trandate';
						} else if (filterName == 'trandateEnd') {
							fieldType = 'onorbefore';
							filterName = 'trandate';
						}
						// 初始化字段值，并设置搜索条件
						var searchValue = parameters[fieldId];
						if (searchValue) {
							// addFilters.push('AND', [ filterName,
							// fieldType == 'TEXT' ? 'contains' : 'anyof',
							// searchValue ]);
							addFilters.push('AND', [ filterName, fieldType,
									searchValue ]);
							refreshParams[fieldId] = searchValue;
						}
					});

					log.debug({
						title : 'refreshParams',
						details : refreshParams
					});
					// add html search button
					form.addField({
						id : 'custpage_searchbutton',
						label : '搜索',
						type : serverWidget.FieldType.INLINEHTML,
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).defaultValue = '<input value="查询" type="button" onclick="require([\''
							+ clientScriptPath
							+ '\'], function(mod){ mod.searchPF(); return false;});" style="font-size: 14px;font-weight: 600;padding: 0 12px;margin-top: 20px;" />';

					// add print button
					form.addButton({
						id : 'custpage_printprofit',
						label : '打印利润分析表',
						functionName : 'printProfit'
					});

					// create sublist and populate data
					form = creatPagedSublist({
						form : form,
						searchId : searchId,
						parameters : parameters,
						addFilters : addFilters,
						refreshParams : refreshParams,
						columnShowMap : columnShowMap
					});

					// write page
					response.writePage({
						pageObject : form
					});
				} catch (e) {
					log.debug({
						title : 'create profit search page error',
						details : e
					});
				}
			}

			function wipPage(context, searchId) {
				var request = context.request;
				var response = context.response;
				var parameters = request.parameters;

				try {
					var filterGroupID = 'custpage_filtergroup';
					var filterLayoutType = serverWidget.FieldLayoutType.OUTSIDE;
					// search fields
					var searchFieldMap = {
						'entity' : {
							fieldId : 'custpage_customer',
							fieldLabel : '客户',
							type : 'SELECT',
							source : 'customer'
						},
						'custbody_customer_so_no' : {
							fieldId : 'custpage_custorderno',
							fieldLabel : '客户订单号',
							type : 'TEXT'
						},
						'custcol_tn_item_name' : {
							fieldId : 'custpage_englishname',
							fieldLabel : '产品英文名称',
							type : 'TEXT'
						},
						'trandate_start' : {
							fieldId : 'custpage_startdate',
							fieldLabel : '时间开始',
							type : 'DATE'
						},
						'trandate_end' : {
							fieldId : 'custpage_enddate',
							fieldLabel : '时间结束',
							type : 'DATE'
						}
					};

					var columnShowMap = {
						'tranid' : 'Invoice单号',
						'item.itemid' : '产品编码',
						'customer.companyname' : '客户',
						'custbody_customer_so_no' : '客户订单号',
						'custcol_tn_item_name' : '产品英文名称',
						'trandate' : '时间'
					};

					// create page form
					var form = serverWidget.createForm({
						title : '搜索WIP信息'
					});
					form.addFieldGroup({
						id : filterGroupID,
						label : '快速搜索'
					});

					// add search fields
					var addFilters = [], refreshParams = {};
					util.each(searchFieldMap, function(fieldInfo, filterName) {
						var fieldId = fieldInfo.fieldId;
						var fieldType = fieldInfo.type;

						// 创建搜索字段
						if (fieldType == 'TEXT' || fieldType == 'DATE') {
							form.addField({
								id : fieldId,
								label : fieldInfo.fieldLabel,
								type : serverWidget.FieldType[fieldType],
								container : filterGroupID
							}).updateLayoutType({
								layoutType : filterLayoutType
							});
						} else if (fieldType == 'SELECT') {
							form.addField({
								id : fieldId,
								label : fieldInfo.fieldLabel,
								type : serverWidget.FieldType.MULTISELECT,
								container : filterGroupID,
								source : fieldInfo.source
							}).updateLayoutType({
								layoutType : filterLayoutType
							});
						}

						// 初始化字段值，并设置搜索条件
						var searchValue = parameters[fieldId];
						if (searchValue) {
							var operator = 'contains';

							if (fieldType == 'SELECT') {
								operator = 'anyof';
							} else if (filterName == 'trandate_start') {
								filterName = 'trandate';
								operator = 'onorafter';
							} else if (filterName == 'trandate_end') {
								filterName = 'trandate';
								operator = 'onorbefore';
							}
							addFilters.push('AND', [ filterName, operator,
									searchValue ]);
							refreshParams[fieldId] = searchValue;
						}
					});

					// add html search button
					form.addField({
						id : 'custpage_searchbutton',
						label : '搜索',
						type : serverWidget.FieldType.INLINEHTML,
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).defaultValue = '<input value="查询" type="button" onclick="require([\''
							+ clientScriptPath
							+ '\'], function(mod){ mod.searchWIP(); return false;});" style="font-size: 14px;font-weight: 600;padding: 0 12px;margin-top: 20px;" />';

					// add print button
					form.addButton({
						id : 'custpage_printwip',
						label : '打印WIP总表',
						functionName : 'printWIP'
					});

					// create sublist and populate data
					form = creatPagedSublist({
						form : form,
						searchId : searchId,
						parameters : parameters,
						addFilters : addFilters,
						refreshParams : refreshParams,
						columnShowMap : columnShowMap
					});

					// write page
					response.writePage({
						pageObject : form
					});
				} catch (e) {
					log.debug({
						title : 'create WIP search page error',
						details : e
					});
				}
			}

			// entry point
			function onRequest(context) {
				var currentScript = runtime.getCurrentScript();
				var pageType = currentScript.getParameter({
					name : 'custscript_reportfilterpagetype_2'
				});
				var searchId = currentScript.getParameter({
					name : 'custscript_reportfilterpagesearchid_2'
				});

				switch (pageType) {
				case 'PO':
					poPage(context, searchId);
					break;
				/*
				 * case 'IFF': iffPage(context, searchId); break;
				 */
				case 'INV':
					ivPage(context, searchId);
					break;
				case 'SP':
					spPage(context, searchId);
					break;
				case 'PRO':
					pfPage(context, searchId);
					break;
				/*
				 * case 'WIP': wipPage(context, searchId); break;
				 */
				default:
					context.response.write({
						output : 'Invalid Report Page Type'
					});
					break;
				}
				return false;
			}

			return {
				onRequest : onRequest
			}
		});