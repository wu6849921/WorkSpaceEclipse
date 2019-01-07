/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define(
		[ 'N/record', 'N/search', 'N/currency' ],
		function(record, search, currency) {
			/**
			 * Function to be executed when field is changed.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.currentRecord - Current form record
			 * @param {string}
			 *            scriptContext.sublistId - Sublist name
			 * @param {string}
			 *            scriptContext.fieldId - Field name
			 * @param {number}
			 *            scriptContext.lineNum - Line number. Will be undefined
			 *            if not a sublist or matrix field
			 * 
			 * @since 2015.2
			 */
			function fieldChanged(context) {
				try {
					var currentRecord = context.currentRecord;
					var sublistName = context.sublistId;
					var sublistFieldName = context.fieldId;
					var numLines = currentRecord.getLineCount({
						sublistId : 'item'
					});
					var entity = currentRecord.getValue({
						fieldId : 'entity'
					});
					var currencyTarget = currentRecord.getValue({
						fieldId : 'currency'
					});
					var recType = currentRecord.type;
					if (sublistName === 'item') {
						var itemId = currentRecord.getCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'item'
						});
						if (itemId == '') {
							return true;
						}
						if (sublistFieldName === 'item') {
							// 设置salse comm rate
							var scrSearch = search.create({
								type : 'customrecordcommissionrate',
								filters : [ [ 'custrecord_tn_cstmrcd_customer',
										'is', entity ] ],
								columns : [ 'custrecord_tn_cstmrcd_fcr' ]
							});
							var finalSR = 0;
							scrSearch.run().each(function(result) {
								finalSR = result.getValue({
									name : 'custrecord_tn_cstmrcd_fcr'
								});
								return true;
							});
							if (finalSR != 0) {
								// alert(finalSR.substring(0, finalSR.length -
								// 1));
								currentRecord.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_salcommiper',
									value : finalSR.substring(0,
											finalSR.length - 1)
								});
							}

							// 设置rate为0
							if (recType == record.Type.OPPORTUNITY
									|| recType == record.Type.ESTIMATE) {

								// 设置rate默认为0
								currentRecord.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'rate',
									value : 0
								});
							}

							// 设置duty%
							search.create(
									{
										type : 'customrecord_tn_hts',
										filters : [ [ 'custrecord_tn_item',
												'is', itemId ] ],
										columns : [ 'custrecord_tn_hts_duty' ]
									}).run().each(function(result) {
								var duty = result.getValue({
									name : 'custrecord_tn_hts_duty'
								});
								duty = duty.substring(0, duty.length - 1);
								currentRecord.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_dutyper',
									value : duty
								});
								return true;
							});

							// Factory ID/Name 设置默认值最后一条
							var _factory;
							search
									.create(
											{
												type : 'customrecord_tn_factoryhistorycost',
												filters : [ [
														'custrecord_tn_item_fobitem',
														'is', itemId ] ],
												columns : [ 'custrecord_tn_item_factory' ]
											}).run().each(function(result) {
										_factory = result.getValue({
											name : 'custrecord_tn_item_factory'
										});
										return true;
									});
							if (_factory) {
								currentRecord
										.setCurrentSublistValue({
											sublistId : 'item',
											fieldId : 'custcol_tn_quote_vendorshortname',
											value : _factory
										});
							}

						}

						if (sublistFieldName === 'item'
								|| sublistFieldName === 'custcol_tn_opp_brand') {
							// 设置royalty费率
							var customer = currentRecord.getValue({
								fieldId : 'entity'
							});
							// 先取得brand
							var brand = currentRecord.getCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_opp_brand'
							});
							if (!customer || !brand) {
								return;
							}
							var roylitySearch = search
									.create({
										type : 'customrecord_tn_roylity',
										filters : [
												[
														'custrecord_tn_customer_roylity',
														'is', customer ],
												'AND',
												[ 'custrecord_tn_brand', 'is',
														brand ] ],
										columns : [ 'custrecord_tn_roylity' ]
									});
							roylitySearch
									.run()
									.each(
											function(result) {
												var roylity = result
														.getValue({
															name : 'custrecord_tn_roylity'
														});
												roylity = roylity.substring(0,
														roylity.length - 1);
												currentRecord
														.setCurrentSublistValue({
															sublistId : 'item',
															fieldId : 'custcol_tn_quote_royalityper',
															value : roylity
														});
												return true;
											});
						}
						// Factory ID/Name for Short
						if (sublistFieldName === 'item'
								|| sublistFieldName === 'custcol_tn_quote_vendorshortname') {

							var factory = currentRecord
									.getCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_vendorshortname'
									});
							if (factory) {
								// 设置factory cost
								var factoryCost = 0;
								var currencySource;
								var fhcSearch = search
										.create({
											type : 'customrecord_tn_factoryhistorycost',
											filters : [
													[
															'custrecord_tn_item_fobitem',
															'is', itemId ],
													'AND',
													[
															'custrecord_tn_item_cusname',
															'anyof', entity ],
													'AND',
													[
															'custrecord_tn_item_factory',
															'anyof', factory ] ],
											columns : [
													'custrecord_tn_item_currency',
													'custrecord_tn_item_factorycost' ]
										});
								fhcSearch.run().each(function(result) {
									factoryCost = result.getValue({
										name : 'custrecord_tn_item_factorycost'
									});
									currencySource = result.getValue({
										name : 'custrecord_tn_item_currency'
									});
									return true;
								});
								if (currencySource) {
									var rate = currency.exchangeRate({
										source : currencySource,
										target : currencyTarget
									});
									factoryCost = factoryCost * rate;
									currentRecord
											.setCurrentSublistValue({
												sublistId : 'item',
												fieldId : 'custcol_tn_quote_factorycost',
												value : factoryCost
											});
								}

								// 设置 shipping port
								var vendorRecord = record.load({
									type : record.Type.VENDOR,
									id : factory
								});
								var port = vendorRecord.getValue({
									fieldId : 'custentity_tn_vendor_ports'
								})
								if (port) {
									currentRecord.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_shipport',
										value : port
									});
								}
							}

						}
						// 当containerType改变时候设置loadingQuantity
						if (sublistFieldName === 'custcol_tn_quote_contentype') {
							var nowContainerType = currentRecord
									.getCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_contentype',
									});
							var ciSearch = search.create({
								type : 'customrecord_tn_containerinfo',
								filters : [ [ 'custrecord_tn_parentrec2', 'is',
										itemId ] ],
								columns : [ 'custrecord_tn_containertype',
										'custrecord_tn_loadingquantity' ]
							});
							ciSearch.run().each(function(result) {
								var containerType = result.getValue({
									name : 'custrecord_tn_containertype'
								});
								var loadingQuantity = result.getValue({
									name : 'custrecord_tn_loadingquantity'
								});
								if (containerType == nowContainerType) {
									currentRecord.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_loadqty',
										value : loadingQuantity
									});
								}
								return true;
							});

							// 设置各种packingInfo相关参数
							var FHCSearch = search.create({
								type : 'customrecord_tn_packinginfo',
								filters : [
										[ 'custrecord_tn_parentrec', 'is',
												itemId ],
										'AND',
										[ 'custrecord_tn_packinfo_ct', 'is',
												nowContainerType ] ],
								columns : [ 'custrecord_tn_packingtype',
										'custrecord_tn_pack_size',
										'custrecord_tn_l', 'custrecord_tn_w',
										'custrecord_tn_h',
										'custrecord_tn_cuft',
										'custrecord_tn_cbm' ]
							});
							FHCSearch.run().each(function(result) {
								var packingType = result.getValue({
									name : 'custrecord_tn_packingtype'
								});
								var packingSize = result.getValue({
									name : 'custrecord_tn_pack_size'
								});
								var lSize = result.getValue({
									name : 'custrecord_tn_l'
								});
								var wSize = result.getValue({
									name : 'custrecord_tn_w'
								});
								var hSize = result.getValue({
									name : 'custrecord_tn_h'
								});
								var cuft = result.getValue({
									name : 'custrecord_tn_cuft'
								});
								var cbm = result.getValue({
									name : 'custrecord_tn_cbm'
								});
								// 将item record上的子record的值设置到本record
								if (packingType == '4') {
									currentRecord.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_loadpz',
										value : packingSize
									});
									currentRecord.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_loadingl',
										value : lSize
									});
									currentRecord.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_loadingw',
										value : wSize
									});
									currentRecord.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_loadingh',
										value : hSize
									});
									currentRecord.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_loadcuft',
										value : cuft
									});
									currentRecord.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_loadcbm',
										value : cbm
									});
								}
								return true;
							});
						}

						// 设置Warehouse相关字段
						if (sublistFieldName === 'custcol_tn_quote_whselocation') {
							var warehouse = currentRecord
									.getCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_whselocation'
									});
							var wcSearch = search
									.create({
										type : 'customrecord_tn_warehousecharges',
										filters : [
												[
														'custrecord_tn_warehousecharges_item',
														'is', itemId ],
												'AND',
												[ 'custrecord_tn_wc_warehouse',
														'is', warehouse ] ],
										columns : [
												'custrecord_tn_wc_inboundcharge',
												'custrecord_tn_wc_storageperiod',
												'custrecord_tn_wc_storagecost',
												'custrecord_tn_wc_outboundcharge',
												'custrecord_tn_wc_palletcost',
												'custrecord_tn_item_handcharge',
												'custrecord_tn_wc_ftc' ]
									});
							wcSearch
									.run()
									.each(
											function(result) {
												var inboundcharge = result
														.getValue({
															name : 'custrecord_tn_wc_inboundcharge'
														});
												var storageperiod = result
														.getValue({
															name : 'custrecord_tn_wc_storageperiod'
														});
												var storagecost = result
														.getValue({
															name : 'custrecord_tn_wc_storagecost'
														});
												var outboundcharge = result
														.getValue({
															name : 'custrecord_tn_wc_outboundcharge'
														});
												var palletcost = result
														.getValue({
															name : 'custrecord_tn_wc_palletcost'
														});
												var handCharge = result
														.getValue({
															name : 'custrecord_tn_item_handcharge'
														});
												var freToCust = result
														.getValue({
															name : 'custrecord_tn_wc_ftc'
														});
												currentRecord
														.setCurrentSublistValue({
															sublistId : 'item',
															fieldId : 'custcol_tn_quote_inbundcharge',
															value : inboundcharge
														});
												currentRecord
														.setCurrentSublistValue({
															sublistId : 'item',
															fieldId : 'custcol_tn_quote_storeperiod',
															value : storageperiod
														});
												currentRecord
														.setCurrentSublistValue({
															sublistId : 'item',
															fieldId : 'custcol_tn_storagecostbase',
															value : storagecost

														});
												currentRecord
														.setCurrentSublistValue({
															sublistId : 'item',
															fieldId : 'custcol_tn_quote_storecost',
															value : storagecost
																	* storageperiod
														});
												currentRecord
														.setCurrentSublistValue({
															sublistId : 'item',
															fieldId : 'custcol_tn_quote_outbundcharge',
															value : outboundcharge
														});
												currentRecord
														.setCurrentSublistValue({
															sublistId : 'item',
															fieldId : 'custcol_tn_quote_paletcost',
															value : palletcost
														});
												handCharge = handCharge
														.substring(
																0,
																handCharge.length - 1);
												currentRecord
														.setCurrentSublistValue({
															sublistId : 'item',
															fieldId : 'custcol_tn_pl_whcp',
															value : handCharge
														});
												currentRecord
														.setCurrentSublistValue({
															sublistId : 'item',
															fieldId : 'custcol_tn_quote_ltlftl',
															value : freToCust
														});
												return true;
											});
						}

					}

					// entity变化监听事件 20180516
					if (sublistFieldName == 'custbody_tn_entity') {
						var entity = currentRecord.getValue({
							fieldId : sublistFieldName
						});
						if (!entity) {
							return;
						}
						var entityRecord = record.load({
							type : 'customrecord_tn_subsidiaryinfo',
							id : entity,
							isDynamic : true,
						});
						var entityAddress = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiaryaddr'
						});
						var entityPhone = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiaryphone'
						});
						var entityZip = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiary_zip'
						});
						var entityContact = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiarycontact'
						});
						var entityFax = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiaryfax'
						});
						var entityEmail = entityRecord.getValue({
							fieldId : 'custrecord_tn_susidiaryemail'
						});
						var entityArea = entityRecord.getValue({
							fieldId : 'custrecord_52_cseg_tn_area'
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiaryaddr',
							value : entityAddress
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiaryphone',
							value : entityPhone
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiary_zip',
							value : entityZip
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiarycontact',
							value : entityContact
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiaryfax',
							value : entityFax
						});
						currentRecord.setValue({
							fieldId : 'custbody_tn_susidiaryemail',
							value : entityEmail
						});
						currentRecord.setValue({
							fieldId : 'custbody_cseg_tn_area',
							value : entityArea
						});
					}
					// Factor变化监听事件 20180830
					if (sublistFieldName == 'custbody_tn_quote_factor') {
						var factor = currentRecord.getValue({
							fieldId : sublistFieldName
						});
						if (!factor) {
							return;
						}

						var numLines = currentRecord.getLineCount({
							sublistId : 'item'
						});

						var incoterm = currentRecord.getValue({
							fieldId : 'custbody_tn_po_incoterm'
						});
						for (var i = 0; i < numLines; i++) {
							var lineNum = currentRecord.selectLine({
								sublistId : 'item',
								line : i
							});
							var totalStore = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_totalstorebase',
								line : i
							});
							var priceQuote = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_firstcostbase',
								line : i
							});
							if (incoterm == '7' || incoterm == '9') {
								priceQuote = priceQuote * factor;
								if (priceQuote) {
									lineNum.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_firstcost',
										value : priceQuote
									});
								}
							} else {
								if (totalStore) {
									totalStore = totalStore * factor;
									lineNum
											.setCurrentSublistValue({
												sublistId : 'item',
												fieldId : 'custcol_tn_quote_totalstore',
												value : totalStore
											});
								}
							}
							var msrp = currentRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_msrp',
								line : i
							});
							if (msrp > 0 && incoterm != '9') {
								// 设置Markup %
								if (incoterm != '7') {
									markup = (1 - totalStoreCost / msrp) * 100;
								} else {
									markup = (1 - priceQuote / msrp) * 100;
								}
								lineNum.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_markupper',
									value : markup
								});
							}
							if (incoterm == '3') {
								// 设置9 Digit Freight Amount
								var digifritper = currentRecord
										.getSublistValue({
											sublistId : 'item',
											fieldId : 'custcol_tn_quote_9digifritper',
											line : i
										});
								if (digifritper) {
									digifritper = digifritper / 100;
									lineNum
											.setCurrentSublistValue({
												sublistId : 'item',
												fieldId : 'custcol_tn_quote_9digitfrit',
												value : totalStoreCost
														* digifritper
											});
									// 设置Import Store Cost (w/ 9 Digit FF)
									lineNum
											.setCurrentSublistValue({
												sublistId : 'item',
												fieldId : 'custcol_tn_quote_importstorecost',
												value : totalStoreCost
														* digifritper
														+ totalStoreCost
											});
								}
								// 设置Markup % w/9 Digit FF
								if (msrp > 0) {
									lineNum.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_quote_9digit',
										value : (1 - (totalStoreCost
												* digifritper + totalStoreCost)
												/ msrp) * 100
									});
								}
							}
							lineNum.commitLine({
								sublistId : 'item'
							});
						}
					}

					// 设置palletdisabled
					// if (sublistFieldName == 'custbody_tn_po_incoterm') {
					//						
					// }

					// // test 需要删除 joe
					// if (sublistFieldName == 'approvalstatus') {
					// var a = currentRecord.getValue({
					// fieldId : 'approvalstatus'
					// });
					// alert(a);
					// }
				} catch (e) {
					alert(e);
				}

			}
			/**
			 * Function to be executed after page is initialized.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.currentRecord - Current form record
			 * @param {string}
			 *            scriptContext.mode - The mode in which the record is
			 *            being accessed (create, copy, or edit)
			 * 
			 * @since 2015.2
			 */
			function pageInit(context) {
				try {
					// if (context.mode == 'create') {
					var currentRecord = context.currentRecord;
					var recType = currentRecord.type;
					var numLines = currentRecord.getLineCount({
						sublistId : 'item'
					});
					if (numLines == 0) {
						return;
					}
					var entity = currentRecord.getValue({
						fieldId : 'entity'
					});
					var createdFrom = currentRecord.getValue({
						fieldId : 'createdfrom'
					});
					if (createdFrom == null
							|| currentRecord.type != record.Type.ESTIMATE) {
						// alert('1');
						return;
					}
					var cusRecord = record.load({
						type : record.Type.CUSTOMER,
						id : entity
					});

					var salecomm = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_salecomm'
					});
					var pli = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_pli'
					});
					var afterservice = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_afterservice'
					});
					var mddefall = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_mddefall'
					});
					var testingfee = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_testingfee'
					});
					var reserve = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_overhead'
					});
					var otherexp = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_otherexp'
					});
					var markdown = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_markdown'
					});
					var paypal = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_paypal'
					});
					var lcl = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_lcl'
					});
					var program = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_vendorterm'
					});
					var payterm = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_paydis'
					});
					var storedaper = cusRecord.getValue({
						fieldId : 'custentity_tn_quote_storedaper'
					});
					var brokerageins = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_brokerageins'
					});
					var ipe = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_ipe'
					});
					var agent = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_agent'
					});
					var rlc = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_rlc'
					});
					var digitfre = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_9digitfre'
					});
					var gst = cusRecord.getValue({
						fieldId : 'custentity_tn_customer_gst'
					});
					// 设置salse comm rate
					var scrSearch = search.create({
						type : 'customrecordcommissionrate',
						filters : [ [ 'custrecord_tn_cstmrcd_customer', 'is',
								entity ] ],
						columns : [ 'custrecord_tn_cstmrcd_fcr' ]
					});
					var finalSR = 0;
					scrSearch.run().each(function(result) {
						finalSR = result.getValue({
							name : 'custrecord_tn_cstmrcd_fcr'
						});
						return true;
					});

					for (var i = 0; i < numLines; i++) {
						// alert(i);
						var itemId = currentRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'item',
							line : i
						});
						var salecomm = currentRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_salcommiper',
							line : i
						});
						// alert(salecomm);
						// 如果有费率，则说明不需要带值
						if (!itemId || salecomm) {
							break;
						}
						var lineNum = currentRecord.selectLine({
							sublistId : 'item',
							line : i
						});

						// 设置customer中各种费率
						if (finalSR != 0) {
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_salcommiper',
								value : finalSR
										.substring(0, finalSR.length - 1)
							});
						} else {
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_salcommiper',
								value : salecomm
							});
						}
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_pliper',
							value : pli
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_afterserviceper',
							value : afterservice
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_allowrancper',
							value : mddefall
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_testfeeper',
							value : testingfee
						});
						var reserveCur = currentRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_overheadper',
							line : i
						});
						if (!reserveCur) {
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_overheadper',
								value : reserve
							});
						}
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_otherfeeper',
							value : otherexp
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_markdownper',
							value : markdown
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_pl_ppfp',
							value : paypal
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_pl_lcl',
							value : lcl
						});
						var programCur = currentRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_vendtermper',
							line : i
						});
						if (!programCur) {
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_vendtermper',
								value : program
							});
						}
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_paytermper',
							value : payterm
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_storedaper',
							value : storedaper
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_broinper',
							value : brokerageins
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_impfroeliper',
							value : ipe
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_agentper',
							value : agent
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_pl_rplcp',
							value : rlc
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_9digifritper',
							value : digitfre
						});
						lineNum.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_trlin_gstper',
							value : gst
						});

						// 设置各种packingInfo相关参数
						var FHCSearch = search.create({
							type : 'customrecord_tn_packinginfo',
							filters : [ [ 'custrecord_tn_parentrec', 'is',
									itemId ] ],
							columns : [ 'custrecord_tn_packingtype',
									'custrecord_tn_pack_size',
									'custrecord_tn_l', 'custrecord_tn_w',
									'custrecord_tn_h', 'custrecord_tn_cuft',
									'custrecord_tn_cbm' ]
						});
						FHCSearch.run().each(function(result) {
							var packingType = result.getValue({
								name : 'custrecord_tn_packingtype'
							});
							var packingSize = result.getValue({
								name : 'custrecord_tn_pack_size'
							});
							var lSize = result.getValue({
								name : 'custrecord_tn_l'
							});
							var wSize = result.getValue({
								name : 'custrecord_tn_w'
							});
							var hSize = result.getValue({
								name : 'custrecord_tn_h'
							});
							var cuft = result.getValue({
								name : 'custrecord_tn_cuft'
							});
							var cbm = result.getValue({
								name : 'custrecord_tn_cbm'
							});
							// 将item record上的子record的值设置到本record
							if (packingType == '4') {
								lineNum.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_loadpz',
									value : packingSize
								});
								lineNum.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_loadingl',
									value : lSize
								});
								lineNum.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_loadingw',
									value : wSize
								});
								lineNum.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_loadingh',
									value : hSize
								});
								lineNum.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_loadcuft',
									value : cuft
								});
								lineNum.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_loadcbm',
									value : cbm
								});
							}
							return true;
						});

						if (recType == record.Type.OPPORTUNITY
								|| recType == record.Type.ESTIMATE) {
							// 设置rate默认为0
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'rate',
								value : 0
							});
						}

						// 设置description
						// 得到item信息
						var salesDes;
						var loadType;
						search
								.create(
										{
											type : search.Type.ITEM,
											filters : [ [ 'internalid', 'is',
													itemId ] ],
											columns : [ 'salesdescription',
													'custitem_tn_outer_type' ]
										}).run().each(function(result) {
									salesDes = result.getValue({
										name : 'salesdescription'
									});
									loadType = result.getValue({
										name : 'custitem_tn_outer_type'
									});
									return true;
								});
						if (salesDes) {
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'description',
								value : salesDes
							});
						}
						if (loadType) {
							lineNum.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_loadingtype',
								value : loadType
							});
						}
						// Factory ID/Name 设置默认值
						var vendorshortname = currentRecord
								.getCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_vendorshortname'
								});
						search
								.create(
										{
											type : 'customrecord_tn_factoryhistorycost',
											filters : [ [
													'custrecord_tn_item_fobitem',
													'is', itemId ] ],
											columns : [ 'custrecord_tn_item_factory' ]
										})
								.run()
								.each(
										function(result) {
											var factory = result
													.getValue({
														name : 'custrecord_tn_item_factory'
													});
											if (!vendorshortname) {
												currentRecord
														.setCurrentSublistValue({
															sublistId : 'item',
															fieldId : 'custcol_tn_quote_vendorshortname',
															value : factory
														});
											}
										});
						// 设置royalty费率
						var customer = currentRecord.getValue({
							fieldId : 'entity'
						});
						// 先取得brand
						var brand = currentRecord.getCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_opp_brand'
						});
						if (!customer || !brand) {
							return;
						}
						var roylitySearch = search.create({
							type : 'customrecord_tn_roylity',
							filters : [
									[ 'custrecord_tn_customer_roylity', 'is',
											customer ], 'AND',
									[ 'custrecord_tn_brand', 'is', brand ] ],
							columns : [ 'custrecord_tn_roylity' ]
						});
						roylitySearch.run().each(function(result) {
							var roylity = result.getValue({
								name : 'custrecord_tn_roylity'
							});
							roylity = roylity.substring(0, roylity.length - 1);
							currentRecord.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_royalityper',
								value : roylity
							});
							return true;
						});
						// 设置duty%
						search.create(
								{
									type : 'customrecord_tn_hts',
									filters : [ [ 'custrecord_tn_item', 'is',
											itemId ] ],
									columns : [ 'custrecord_tn_hts_duty' ]
								}).run().each(function(result) {
							var duty = result.getValue({
								name : 'custrecord_tn_hts_duty'
							});
							duty = duty.substring(0, duty.length - 1);
							currentRecord.setCurrentSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_quote_dutyper',
								value : duty
							});
							return true;
						});
						// 设置 shipping port
						var factory = currentRecord.getCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_vendorshortname'
						});
						if (factory) {
							var vendorRecord = record.load({
								type : record.Type.VENDOR,
								id : factory
							});
							var port = vendorRecord.getValue({
								fieldId : 'custentity_tn_vendor_ports'
							})

							if (port) {
								currentRecord.setCurrentSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_quote_shipport',
									value : port
								});
							}
						}
						lineNum.commitLine({
							sublistId : 'item'
						});
					}
					// }
				} catch (ex) {
					alert(ex);
				}
			}

			return {
				fieldChanged : fieldChanged,
				pageInit : pageInit
			};
		});