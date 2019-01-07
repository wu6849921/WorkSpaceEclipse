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

			var clientScriptPath = '/SuiteScripts/Trigger/TN_CS_ReportClient.js';

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

				// 澶勭悊椤甸潰瓒婄晫
				if (pageId < 1) {
					pageId = 1
				} else if (pageId > pageCount) {
					pageId = pageCount;
				}

				// 璁剧疆client script
				form.clientScriptModulePath = clientScriptPath;

				// 璁剧疆缈婚〉涓嬫媺妗�
				form.addFieldGroup({
					id : 'custpage_pagerange',
					label : '鍒嗛〉閫夐」'
				});

				// pageid selection
				var selectOptions = form.addField({
					id : 'custpage_pageid',
					label : '鍏�' + pageCount + '椤�',
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
					label : '姣忛〉鏁伴噺(5-1000)',
					type : serverWidget.FieldType.INTEGER,
					container : 'custpage_pagerange'
				}).updateLayoutType({
					layoutType : serverWidget.FieldLayoutType.OUTSIDE
				});

				// 鍒濆鍖栨悳绱㈡潯浠�
				form.updateDefaultValues(refreshParams);

				// add sublist
				var sublist = form.addSublist({
					id : 'custpage_searchresults',
					type : serverWidget.SublistType.LIST,
					label : '鎼滅储缁撴灉'
				});

				// 濡傛灉娌℃湁缁撴灉锛屽氨鐩存帴杩斿洖
				if (!pagedData.count)
					return form;

				// 璁剧疆涓婁竴椤碉紝涓嬩竴椤垫寜閽�
				if (pageId !== 1) {
					sublist.addButton({
						id : 'custpage_list_previous',
						label : '涓婁竴椤�',
						functionName : 'goToPage(' + (pageId - 1) + ')'
					});
				}

				if (pageId !== pageCount) {
					sublist.addButton({
						id : 'custpage_list_next',
						label : '涓嬩竴椤�',
						functionName : 'goToPage(' + (pageId + 1) + ')'
					});
				}

				// add mark all button
				sublist.addMarkAllButtons();

				// add sublist columns
				sublist.addField({
					id : 'custpage_list_index',
					type : serverWidget.FieldType.TEXT,
					label : '搴忓彿'
				});
				sublist.addField({
					id : 'custpage_list_checked',
					type : serverWidget.FieldType.CHECKBOX,
					label : '閫夋嫨'
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

				// 鎼滅储褰撻〉鏁版嵁骞跺～鍏卻ublist
				pageId--;// page 鏁扮粍浠�0寮�濮嬶紝鑰宲age id浠�1寮�濮�
				var startIndex = pageId * pageSize;
				pagedData.fetch({
					index : pageId
				}).data.forEach(function(result, line) {
					// 璁剧疆搴忓彿
					sublist.setSublistValue({
						id : 'custpage_list_index',
						value : String(++startIndex),
						line : line
					});
					// 璁剧疆鍏朵粬鍒�
					util.each(columnMap, function(column, fieldId) {
						var columnVaule;
						if (column.show) {
							columnVaule = result.getText(column.detail)
									|| result.getValue(column.detail);
						} else {
							columnVaule = result.getValue(column.detail);
						}

						if (columnVaule && columnVaule != '- None -') {
							// var convertValue = Number(columnVaule);
							// if(!isNaN(convertValue)) columnVaule =
							// convertValue;
							// columnVaule
							// 淇oracle鏁版嵁搴撳皬鏁扮偣鍓嶆病鏈�0鐨勯棶棰�
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

				// 璁剧疆涓�浜涢粯璁や俊鎭湪椤甸潰涓婏紝浠ヤ究杩涜椤甸潰璺宠浆鐨勬椂鍊欙紝浠ュ強璇诲彇鎵�鏈塻ublist
				// column鍊肩殑鏃跺�欎娇鐢紝鍥犱负currentRecord娌℃湁鎻愪緵getSublistFields API
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
						'custbody_customer_so_no' : '瀹㈡埛璁㈠崟鍙�',
						'custcol_tn_cus_item_code' : '瀹㈡埛浜у搧缂栫爜',
						'item.itemid' : '鐗╂枡缂栫爜',
						'customer.companyname' : '瀹㈡埛鍚嶇О'
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
						'tranid' : 'PO鍗曞彿',
						'custbody_customer_so_no' : '瀹㈡埛璁㈠崟鍙�',
						'custcol_tn_cus_item_code' : '瀹㈡埛浜у搧缂栫爜',
						'item.itemid' : '鐗╂枡缂栫爜',
						'custcol_tn_item_name' : '鐗╂枡鍚嶇О',
						'customer.companyname' : '瀹㈡埛鍚嶇О',
						'custbody_tn_early_ship_date' : '鍑鸿繍寮�濮嬫棩鏈�',
						'custbody_tn_last_ship_date' : '鍑鸿繍缁撴潫鏃ユ湡',
						'vendor.companyname' : '渚涘簲鍟�',
						'currency' : '甯佺',
						'custbody_del_term' : '浜よ揣鏂瑰紡',
						'custbody_del_port' : '浜よ揣鍦扮偣',
						'custbody_tn_pay_term' : '浠樻鏂瑰紡',
						'quantity' : '璁㈠崟鏁伴噺',
						'approvalstatus' : '瀹℃壒鐘舵��',
						'statusref' : '璁㈠崟鐘舵��'
					}
					var filterLayoutType = serverWidget.FieldLayoutType.OUTSIDE;

					// create page form
					var form = serverWidget.createForm({
						title : '鎼滅储PO璁㈠崟'
					});

					// create filter group
					form.addFieldGroup({
						id : filterGroupID,
						label : '鎼滅储鏉′欢'
					});

					// filter label
					form.addField({
						id : 'custpage_searchlabel',
						type : serverWidget.FieldType.LABEL,
						label : '鎸�&nbsp;',
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
					}).defaultValue = '鍖呭惈';

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
						label : '鍑鸿繍寮�濮嬫棩鏈熶粠&nbsp;',
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
						label : '鍒�&nbsp;',
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
						label : '瀹℃壒鐘舵��&nbsp;',
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
						label : '璁㈠崟鐘舵��&nbsp;',
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
						label : '鎼滅储',
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).defaultValue = '<input type="button" value="鏌ヨ" onclick="require([\''
							+ clientScriptPath
							+ '\'], function(mod){ mod.searchPO(); return false;});" style="font-size: 14px;font-weight: 600;padding: 0 12px;" />';

					// report note group
					form.addFieldGroup({
						id : 'custpage_reportnotegroup',
						label : '濉啓鍒版姤琛ㄤ笂闈㈢殑澶囨敞'
					});
					// report note field
					form.addField({
						id : 'custpage_ordernote',
						type : serverWidget.FieldType.TEXT,
						label : ' ',
						container : 'custpage_reportnotegroup'
					}).updateLayoutType({
						layoutType : serverWidget.FieldLayoutType.OUTSIDEBEL鈥婳W
					}).updateDisplaySize({
						height : 60,
						width : 50
					});

					// add print button
					form.addButton({
						id : 'custpage_printpo1ton',
						label : 'PO C鍚堝苟鎵撳嵃',
						functionName : 'printPO1toN'
					});
					form.addButton({
						id : 'custpage_printponton',
						label : 'PO AE鍚堝苟鎵撳嵃',
						functionName : 'printPONtoN'
					});

					// get user search criteria
					var addFilters = [], refreshParams = {};// 瀛樺偍琛ㄥ崟鍏冪礌榛樿鍊�
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
			 * 'custpage_itemnamenumber', fieldLabel: '浜у搧缂栫爜', },
			 * 'custcol_tn_item_name': { fieldId: 'custpage_itemdisname',
			 * fieldLabel: '浜у搧鍚嶇О', }, 'custbody_customer_so_no': { fieldId:
			 * 'custpage_custorderno', fieldLabel: '瀹㈡埛璁㈠崟鍙�', },
			 * 'custbody_sub_customer_so_no': { fieldId:
			 * 'custpage_subcustorderno', fieldLabel: '瀛愬鎴疯鍗曞彿', },
			 * 'custcol_tn_cus_item_code': { fieldId: 'custpage_custitemcode',
			 * fieldLabel: '瀹㈡埛浜у搧缂栫爜', } };
			 * 
			 * var columnShowMap = { 'item.itemid' : '浜у搧缂栫爜',
			 * 'custcol_tn_item_name' : '浜у搧鍚嶇О', 'custcol_tn_cus_item_code' :
			 * '瀹㈡埛浜у搧缂栫爜', 'custcol_tn_cus_pro_id' : '瀹㈡埛浜у搧璐у彿',
			 * 'custcol_tn_sub_cus_item_co' : '瀛愬鎴蜂骇鍝佺紪鐮�',
			 * 'customer.companyname' : '瀹㈡埛鍚嶇О', 'custcol_tn_carton_qty' :
			 * '绠辨暟', 'custbody_sub_customer.companyname' : '瀛愬鎴峰悕绉�',
			 * 'custbody_sub_customer_so_no' : '瀛愬鎴峰崟鍙�',
			 * 'custbody_customer_so_no' : '瀹㈡埛璁㈠崟鍙�', 'trandate' : '鍒跺崟鏃堕棿',
			 * 'custcol_tn_sam_con_date' : 'QC楠岃揣鏃堕棿', 'quantity' : '鏁伴噺',
			 * 'custbody_port_of_dest' : 'PORT OF DESTINATION',
			 * 'custbody_del_term' : 'TERMS OF DELIVERY', 'custbody_ship_port' :
			 * 'SHIPMENT PORT', 'custcol_tn_ship_no' : 'SO NO.鑸瑰叕鍙歌鑸卞彿',//input
			 * 'custcol_tn_con_no' : 'CONTAINERNO.鏌滃彿',//input
			 * 'custcol_tn_seal_no' : 'SEAL NO.灏佹潯鍙�',//input
			 * 'custcol_tn_con_typ' : '鏌滃瀷'//input };
			 * 
			 * var inputColumn = [ 'custcol_tn_ship_no', 'custcol_tn_con_no',
			 * 'custcol_tn_seal_no', 'custcol_tn_con_typ' ];
			 * 
			 * //create page form var form = serverWidget.createForm({ title:
			 * '鎼滅储Item Fulfillment' }); form.addFieldGroup({ id: filterGroupID,
			 * label: '蹇�熸悳绱�' });
			 * 
			 * //add search fields var addFilters = [], refreshParams = {};
			 * util.each(searchFieldMap, function (fieldInfo, filterName) { var
			 * fieldId = fieldInfo.fieldId;
			 * 
			 * //鍒涘缓鎼滅储瀛楁 form.addField({ id: fieldId, label:
			 * fieldInfo.fieldLabel, type: serverWidget.FieldType.TEXT,
			 * container: filterGroupID }).updateLayoutType({ layoutType:
			 * filterLayoutType });
			 * 
			 * //鍒濆鍖栧瓧娈靛�硷紝骞惰缃悳绱㈡潯浠� var searchValue = parameters[fieldId];
			 * if (searchValue) { addFilters.push( 'AND', [filterName,
			 * 'contains', searchValue] ); refreshParams[fieldId] = searchValue; }
			 * });
			 * 
			 * //add html search button form.addField({ id:
			 * 'custpage_searchbutton', label: '鎼滅储', type:
			 * serverWidget.FieldType.INLINEHTML, container: filterGroupID
			 * }).updateLayoutType({ layoutType: filterLayoutType
			 * }).defaultValue = '<input value="鏌ヨ" type="button"
			 * onclick="require([\'' + clientScriptPath + '\'], function(mod){
			 * mod.searchIFF(); return false;});" style="font-size:
			 * 14px;font-weight: 600;padding: 0 12px;margin-top: 20px;" />';
			 * 
			 * //濉啓鍥炲啓瀛楁 var writeBackGroupID = 'custpage_writebackgroup';
			 * form.addFieldGroup({ id: writeBackGroupID, label: '鍥炲啓瀛楁' });
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
			 * filterLayoutType }).defaultValue = '<input value="杈撳叆鍕鹃��"
			 * type="button" onclick="require([\'' + clientScriptPath + '\'],
			 * function(mod){ mod.inputIffLine(); return false;});"
			 * style="font-size: 14px;font-weight: 600;padding: 0
			 * 12px;margin-top: 20px;" />';
			 * 
			 * //add print button form.addButton({ id: 'custpage_printpacklist',
			 * label: '鎵撳嵃Packing List', functionName: 'printPackList' });
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

			// 鍚堝苟packing list鍜宑ommercial invoice 鎼滅储椤甸潰
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
							fieldLabel : '浜у搧缂栫爜',
						},
						'custcol_tn_item_name' : {
							fieldId : 'custpage_itemdisname',
							fieldLabel : '浜у搧鍚嶇О',
						},
						'custbody_customer_so_no' : {
							fieldId : 'custpage_custorderno',
							fieldLabel : '瀹㈡埛璁㈠崟鍙�',
						},
						'custbody_sub_customer_so_no' : {
							fieldId : 'custpage_subcustorderno',
							fieldLabel : '瀛愬鎴疯鍗曞彿',
						},
						'custcol_tn_cus_item_code' : {
							fieldId : 'custpage_custitemcode',
							fieldLabel : '瀹㈡埛浜у搧缂栫爜',
						},
						'approvalstatus' : {
							fieldId : 'custpage_approvalstatus',
							fieldLabel : '瀹℃壒鐘舵��',
							source : {
								'1' : 'Pending Approval',
								'2' : 'Approved',
								'3' : 'Rejected'
							}
						},
						'status' : {
							fieldId : 'custpage_orderstatus',
							fieldLabel : '鍗曟嵁鐘舵��',
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
						'tranid' : 'Invoice鍗曞彿',
						'item.itemid' : '浜у搧缂栫爜',
						'custcol_tn_item_name' : '浜у搧鍚嶇О',
						'custcol_tn_cus_item_code' : '瀹㈡埛浜у搧缂栫爜',
						'custcol_tn_cus_pro_id' : '瀹㈡埛浜у搧璐у彿',
						'custcol_tn_sub_cus_item_co' : '瀛愬鎴蜂骇鍝佺紪鐮�',
						'customer.companyname' : '瀹㈡埛鍚嶇О',
						'custcol_tn_carton_qty' : '绠辨暟',
						'custbody_sub_customer.companyname' : '瀛愬鎴峰悕绉�',
						'custbody_sub_customer_so_no' : '瀛愬鎴峰崟鍙�',
						'custbody_customer_so_no' : '瀹㈡埛璁㈠崟鍙�',
						'trandate' : '鍒跺崟鏃堕棿',
						'custcol_tn_sam_con_date' : 'QC楠岃揣鏃堕棿',
						'quantity' : '鏁伴噺',
						'custbody_port_of_dest' : 'PORT OF DESTINATION',
						'custbody_del_term' : 'TERMS OF DELIVERY',
						'custbody_ship_port' : 'SHIPMENT PORT',
						'approvalstatus' : '瀹℃壒鐘舵��',
						'statusref' : '鍗曟嵁鐘舵��',
						'custcol_tn_ship_no' : 'SO NO.鑸瑰叕鍙歌鑸卞彿',// input
						'custcol_tn_con_no' : 'CONTAINERNO.鏌滃彿',// input
						'custcol_tn_seal_no' : 'SEAL NO.灏佹潯鍙�',// input
						'custcol_tn_con_typ' : '鏌滃瀷'// input
					};

					var inputColumn = [ 'custcol_tn_ship_no',
							'custcol_tn_con_no', 'custcol_tn_seal_no',
							'custcol_tn_con_typ' ];

					// create page form
					var form = serverWidget.createForm({
						title : '鎼滅储Invoice'
					});
					form.addFieldGroup({
						id : filterGroupID,
						label : '蹇�熸悳绱�'
					});

					// add search fields
					var addFilters = [], refreshParams = {};
					util.each(searchFieldMap, function(fieldInfo, filterName) {
						var fieldId = fieldInfo.fieldId;
						var selectOption = fieldInfo.source;

						// 鍒涘缓鎼滅储瀛楁
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

						// 鍒濆鍖栧瓧娈靛�硷紝骞惰缃悳绱㈡潯浠�
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
						label : '鎼滅储',
						type : serverWidget.FieldType.INLINEHTML,
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).defaultValue = '<input value="鏌ヨ" type="button" onclick="require([\''
							+ clientScriptPath
							+ '\'], function(mod){ mod.searchINV(); return false;});" style="font-size: 14px;font-weight: 600;padding: 0 12px;margin-top: 20px;" />';

					// 濉啓鍥炲啓瀛楁
					var writeBackGroupID = 'custpage_writebackgroup';
					form.addFieldGroup({
						id : writeBackGroupID,
						label : '鍥炲啓瀛楁'
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
					}).defaultValue = '<input value="鎵归噺杈撳叆鏌滃彿淇℃伅" type="button" onclick="require([\''
							+ clientScriptPath
							+ '\'], function(mod){ mod.inputIffLine(); return false;});" style="font-size: 14px;font-weight: 600;padding: 0 12px;margin-top: 20px;" />';

					// 娣诲姞閫夋嫨鍦板潃鐨勯�夐」
					form.addFieldGroup({
						id : 'custpage_additionaloption',
						label : '閫夋嫨鍏徃淇℃伅'
					});
					var companyField = form.addField({
						id : 'custpage_selectcompany',
						label : '鍙戣揣鍦板潃',
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
						label : '鍦板潃璇︽儏',
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
					var filterLayoutType = serverWidget.FieldLayoutType.OUTSIDEABO鈥媀鈥婨;
					var filterBreakType = serverWidget.FieldBreakType.STARTROW;
					var filterGroupID = 'custpage_filtergroup';
					var form = serverWidget.createForm({
						title : '绛涢�塖hipping Report'
					});

					form.clientScriptModulePath = clientScriptPath;
					form.addFieldGroup({
						id : filterGroupID,
						label : '绛涢�夋潯浠�'
					});

					// 閫夋嫨瀹㈡埛
					form.addField({
						id : 'custpage_selectcustomer',
						label : '閫夋嫨瀹㈡埛',
						type : serverWidget.FieldType.MULTISELEC鈥婽,
						container : filterGroupID,
						source : 'customer'
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).updateBreakType({
						breakType : filterBreakType
					});

					// 閫夋嫨瀵规瘮骞翠唤
					form.addField({
						id : 'custpage_compareyear1',
						label : '瀵规瘮骞翠唤1',
						type : serverWidget.FieldType.INTEGER,
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).updateBreakType({
						breakType : filterBreakType
					});

					form.addField({
						id : 'custpage_compareyear2',
						label : '瀵规瘮骞翠唤2',
						type : serverWidget.FieldType.INTEGER,
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).updateBreakType({
						breakType : filterBreakType
					});

					// 璁剧疆searchId
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
						label : '鎵撳嵃Shipping Port',
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
							fieldLabel : '瀹㈡埛 customer',
							type : 'SELECT',
							source : 'customer'
						},
						'custbody_customer_so_no' : {
							fieldId : 'custpage_custorderno',
							fieldLabel : '瀹汉璁㈠崟鍙� SO',
							type : 'TEXT'
						},
						'item' : {
							fieldId : 'custpage_item',
							fieldLabel : '浜ф垚鍝佸搧缂栧彿 Item',
							type : 'SELECT',
							source : 'item'
						},
						'custcol_tn_cus_item_code' : {
							fieldId : 'custpage_custitemcode',
							fieldLabel : '瀹㈡埛浜у搧缂栫爜',
							type : 'TEXT'
						}
					};

					var columnShowMap = {
						'formulatext' : 'SO Number',
						'tranid' : 'Invoice Number',
						'item.itemid' : '浜ф垚鍝佺紪鍙�',
						'inventorydetail.binnumber' : 'Vendor Bin',
						'customer.companyname' : '瀹㈡埛',
						'custbody_customer_so_no' : '瀹汉璁㈠崟鍙�',
						'custcol_tn_cus_item_code' : '瀹㈡埛浜у搧缂栫爜'
					};

					// create page form
					var form = serverWidget.createForm({
						title : '鎼滅储Invoice鎴愬搧'
					});
					form.addFieldGroup({
						id : filterGroupID,
						label : '蹇�熸悳绱�'
					});

					// add search fields
					var addFilters = [], refreshParams = {};
					util.each(searchFieldMap, function(fieldInfo, filterName) {
						var fieldId = fieldInfo.fieldId;
						var fieldType = fieldInfo.type;

						// 鍒涘缓鎼滅储瀛楁
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
						}

						// 鍒濆鍖栧瓧娈靛�硷紝骞惰缃悳绱㈡潯浠�
						var searchValue = parameters[fieldId];
						if (searchValue) {
							addFilters.push('AND', [ filterName,
									fieldType == 'TEXT' ? 'contains' : 'anyof',
									searchValue ]);
							refreshParams[fieldId] = searchValue;
						}
					});

					// add html search button
					form.addField({
						id : 'custpage_searchbutton',
						label : '鎼滅储',
						type : serverWidget.FieldType.INLINEHTML,
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).defaultValue = '<input value="鏌ヨ" type="button" onclick="require([\''
							+ clientScriptPath
							+ '\'], function(mod){ mod.searchPF(); return false;});" style="font-size: 14px;font-weight: 600;padding: 0 12px;margin-top: 20px;" />';

					// add print button
					form.addButton({
						id : 'custpage_printprofit',
						label : '鎵撳嵃鍒╂鼎鍒嗘瀽琛�',
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
							fieldLabel : '瀹㈡埛',
							type : 'SELECT',
							source : 'customer'
						},
						'custbody_customer_so_no' : {
							fieldId : 'custpage_custorderno',
							fieldLabel : '瀹㈡埛璁㈠崟鍙�',
							type : 'TEXT'
						},
						'custcol_tn_item_name' : {
							fieldId : 'custpage_englishname',
							fieldLabel : '浜у搧鑻辨枃鍚嶇О',
							type : 'TEXT'
						},
						'trandate_start' : {
							fieldId : 'custpage_startdate',
							fieldLabel : '鏃堕棿寮�濮�',
							type : 'DATE'
						},
						'trandate_end' : {
							fieldId : 'custpage_enddate',
							fieldLabel : '鏃堕棿缁撴潫',
							type : 'DATE'
						}
					};

					var columnShowMap = {
						'tranid' : 'Invoice鍗曞彿',
						'item.itemid' : '浜у搧缂栫爜',
						'customer.companyname' : '瀹㈡埛',
						'custbody_customer_so_no' : '瀹㈡埛璁㈠崟鍙�',
						'custcol_tn_item_name' : '浜у搧鑻辨枃鍚嶇О',
						'trandate' : '鏃堕棿'
					};

					// create page form
					var form = serverWidget.createForm({
						title : '鎼滅储WIP淇℃伅'
					});
					form.addFieldGroup({
						id : filterGroupID,
						label : '蹇�熸悳绱�'
					});

					// add search fields
					var addFilters = [], refreshParams = {};
					util.each(searchFieldMap, function(fieldInfo, filterName) {
						var fieldId = fieldInfo.fieldId;
						var fieldType = fieldInfo.type;

						// 鍒涘缓鎼滅储瀛楁
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

						// 鍒濆鍖栧瓧娈靛�硷紝骞惰缃悳绱㈡潯浠�
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
						label : '鎼滅储',
						type : serverWidget.FieldType.INLINEHTML,
						container : filterGroupID
					}).updateLayoutType({
						layoutType : filterLayoutType
					}).defaultValue = '<input value="鏌ヨ" type="button" onclick="require([\''
							+ clientScriptPath
							+ '\'], function(mod){ mod.searchWIP(); return false;});" style="font-size: 14px;font-weight: 600;padding: 0 12px;margin-top: 20px;" />';

					// add print button
					form.addButton({
						id : 'custpage_printwip',
						label : '鎵撳嵃WIP鎬昏〃',
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
					name : 'custscript_reportfilterpagetype'
				});
				var searchId = currentScript.getParameter({
					name : 'custscript_reportfilterpagesearchid'
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