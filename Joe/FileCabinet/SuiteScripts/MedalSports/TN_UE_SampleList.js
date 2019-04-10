/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Joe
 * @appliedtorecord OPP
 */
define(
		[ 'N/record', 'N/file', 'N/search', 'N/format', 'N/currency', 'N/url' ],

		function(record, file, search, _format, _currency, url) {

			/**
			 * Function definition to be triggered before record is loaded.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.newRecord - New record
			 * @param {string}
			 *            scriptContext.type - Trigger type
			 * @param {Form}
			 *            scriptContext.form - Current form
			 * @Since 2015.2
			 */
			function beforeLoad(context) {
				try {
					var newRecord = context.newRecord;
					if (context.type == context.UserEventType.VIEW) {
						var lineCount = newRecord.getLineCount({
							sublistId : 'item'
						});
						var recType = newRecord.type;
						for (var i = 0; i < lineCount; i++) {
							var itemId = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'item',
								line : i
							});
							if (itemId == '') {
								return true;
							}
							var itemSearch = search.create({
								type : search.Type.ITEM,
								filters : [ [ 'internalid', 'is', itemId ] ],
								columns : [ 'storedisplaythumbnail' ]
							});
							var imageId;
							itemSearch.run().each(function(result) {
								imageId = result.getValue({
									name : 'storedisplaythumbnail'
								});
								return true;
							});
							if (imageId) {
								var image = file.load({
									id : imageId
								});
								newRecord
										.setSublistValue({
											sublistId : 'item',
											fieldId : 'custcol_tn_opp_image',
											line : i,
											value : '<img height = "50" width = "50"src="'
													+ image.url + '">'
										});
							}

						}

					}
					// pl新增跳转到project list 页面按钮 190220
					if (newRecord.type !== record.Type.ESTIMATE) {
						return;
					}
					var form = context.form;
					var plURL = url.resolveScript({
						scriptId : 'customscript_tn_projectlist',
						deploymentId : 'customdeploy_tn_projectlist',
						params : {
							plId : newRecord.id
						}
					});
					form.addButton({
						id : 'custpage_popuppomergeprintwin',
						label : 'Project List Items',
						functionName : '(function(){ window.open("' + plURL
								+ '") })'
					});

				} catch (e) {
					log.debug({
						title : 'e:',
						details : e
					});
				}
			}

			/**
			 * Function definition to be triggered before record is loaded.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.newRecord - New record
			 * @param {Record}
			 *            scriptContext.oldRecord - Old record
			 * @param {string}
			 *            scriptContext.type - Trigger type
			 * @Since 2015.2
			 */
			function beforeSubmit(context) {
				try {
					var newRecord = context.newRecord;
					var lineCount = newRecord.getLineCount({
						sublistId : 'item'
					});
					if (newRecord.type == 'estimate'
							&& (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE)) {
						var recType = newRecord.type;

						var isCompleted = true;
						// 设置status
						for (var i = 0; i < lineCount; i++) {
							var status = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_opp_status',
								line : i
							});
							if (status != '4' || status != '5') {
								isCompleted = false;
							}
						}
						if (isCompleted) {
							newRecord.setValue({
								fieldId : 'entitystatus',
								value : 13
							});
						}
					}

					if (newRecord.type == 'salesorder'
							&& (context.type == context.UserEventType.EDIT)) {
						for (var i = 0; i < lineCount; i++) {
							var _line = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'line',
								line : i
							});
							// log.debug({
							// title : '_line:',
							// details : _line
							// });
							if (_line) {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_sonumber',
									line : i,
									value : _line
								});
							}
						}
					}
				} catch (e) {
					log.debug({
						title : 'e:',
						details : e
					});
				}
			}

			/**
			 * Function definition to be triggered before record is loaded.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.newRecord - New record
			 * @param {Record}
			 *            scriptContext.oldRecord - Old record
			 * @param {string}
			 *            scriptContext.type - Trigger type
			 * @Since 2015.2
			 */
			function afterSubmit(context) {
				var newRecord = context.newRecord;
				if (newRecord.type == 'salesorder'
						&& context.type == context.UserEventType.EDIT) {
					var orderstatus = newRecord.getValue({
						fieldId : 'orderstatus'
					});
					// log.debug({
					// title : 'orderstatus',
					// details : orderstatus
					// });
					if (orderstatus != 'B') {
						return;
					}
					var numLines = newRecord.getLineCount({
						sublistId : 'item'
					});
					var vendorIds = [];
					for (var i = 0; i < numLines; i++) {
						var item = newRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'item',
							line : i
						});
						var vendorId = newRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_vendorshortname',
							line : i
						});
						if (vendorId) {
							vendorIds.push([ item, vendorId ]);
						}
					}

					var soEntity = newRecord.getValue({
						fieldId : 'custbody_tn_entity',
					});
					var soMerchandiser = newRecord.getValue({
						fieldId : 'custbody_tn_so_merchandiser',
					});
					var soShipteam = newRecord.getValue({
						fieldId : 'custbody_tn_so_shipteam',
					});
					// 设置rate为factory cost
					search.create(
							{
								type : search.Type.PURCHASE_ORDER,
								filters : [
										[ 'createdfrom', 'is', newRecord.id ],
										'AND', [ 'mainline', 'is', 'T' ],
										'AND', [ 'taxline', 'is', 'F' ] ],
								columns : [ 'internalid' ]
							}).run().each(function(result) {
						var poId = result.id;
						var poRec = record.load({
							type : record.Type.PURCHASE_ORDER,
							id : poId
						});
						var itemIdPO = poRec.getSublistValue({
							sublistId : 'item',
							fieldId : 'item',
							line : 0
						});
						poRec.setValue({
							fieldId : 'custbody_tn_entity',
							value : soEntity
						});
						poRec.setValue({
							fieldId : 'custbody_tn_so_merchandiser',
							value : soMerchandiser
						});
						poRec.setValue({
							fieldId : 'custbody_tn_so_shipteam',
							value : soShipteam
						});
						// log.debug({
						// title : 'vendorIds',
						// details : vendorIds
						// });
						// 设置vendor为SO上的Factory ID/Name
						for (var i = 0; i < vendorIds.length; i++) {
							if (vendorIds[i][0] == itemIdPO) {
								poRec.setValue({
									fieldId : 'entity',
									value : vendorIds[i][1]
								});
								break;
							}
						}
						setPORate(poRec, search);

						poRec.save({
							ignoreMandatoryFields : true
						});
						return true;
					});

				}
			}

			function setPORate(poRec, search) {
				var lineCount = poRec.getLineCount({
					sublistId : 'item'
				});
				var factory = poRec.getValue({
					fieldId : 'entity'
				});
				var custId = poRec.getValue({
					fieldId : 'custbody_tn_po_custid'
				});
				var _date = poRec.getValue({
					fieldId : 'trandate'
				});
				var currencyTarget = poRec.getValue({
					fieldId : 'currency'
				});
				for (var i = 0; i < lineCount; i++) {
					// 设置factory cost
					var itemId = poRec.getSublistValue({
						sublistId : 'item',
						fieldId : 'item',
						line : i
					});
					if (!itemId) {
						return;
					}
					var filters = [
							[ 'custrecord_tn_item_fobitem', 'is', itemId ],
							'AND',
							[ 'custrecord_tn_item_factory', 'anyof', factory ] ];
					if (custId) {
						filters.push('AND', [ 'custrecord_tn_item_cusname',
								'anyof', custId ]);
					}

					var factoryCost = 0;
					var currencySource;
					var fhcSearch = search.create({
						type : 'customrecord_tn_factoryhistorycost',
						filters : filters,
						columns : [ 'custrecord_tn_item_factorycost',
								'custrecord_tn_item_currency',
								'custrecord_tn_item_validfrom',
								'custrecord_tn_cr_validto' ]
					});
					fhcSearch.run().each(function(result) {
						var validfrom = result.getValue({
							name : 'custrecord_tn_item_validfrom'
						});
						var validto = result.getValue({
							name : 'custrecord_tn_cr_validto'
						});
						// var currencySource = result.getValue({
						// name : 'custrecord_tn_cr_validto'
						// });
						var validfromDate = _format.parse({
							value : validfrom,
							type : _format.Type.DATE
						})
						var validtoDate;
						if (validto) {
							validtoDate = _format.parse({
								value : validto,
								type : _format.Type.DATE
							})
						}
						// alert(validfromDate);
						if (validfromDate <= _date) {
							if (validtoDate) {
								if (validtoDate >= _date) {
									// alert(validfromDate);
									factoryCost = result.getValue({
										name : 'custrecord_tn_item_factorycost'
									});
									currencySource = result.getValue({
										name : 'custrecord_tn_item_currency'
									});
								}
							} else {
								factoryCost = result.getValue({
									name : 'custrecord_tn_item_factorycost'
								});
								currencySource = result.getValue({
									name : 'custrecord_tn_item_currency'
								});
							}
						}
						return true;
					});
					// log.debug({
					// title : 'factoryCost',
					// details : factoryCost
					// });
					if (factoryCost) {
						var exchangeRate = _currency.exchangeRate({
							source : currencySource,
							target : currencyTarget
						});
						poRec.setSublistValue({
							sublistId : 'item',
							fieldId : 'rate',
							line : i,
							value : factoryCost * exchangeRate
						});
					}
				}
			}

			return {
				beforeLoad : beforeLoad,
				beforeSubmit : beforeSubmit,
				afterSubmit : afterSubmit
			}

		});
