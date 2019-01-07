/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @author Joe
 * @appliedtorecord OPP
 */
define(
		[ 'N/record', 'N/search', 'N/format' ],

		function(record, search, _format) {

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
				if (context.type == context.UserEventType.EDIT
						|| context.type == context.UserEventType.CREATE) {
					var newRecord = context.newRecord;
					var orderStatus = newRecord.getValue({
						fieldId : 'orderstatus'
					});
					var _entity = newRecord.getValue({
						fieldId : 'custbody_tn_entity'
					});
					var merchandiser = newRecord.getValue({
						fieldId : 'custbody_tn_so_merchandiser'
					});
					var shipteam = newRecord.getValue({
						fieldId : 'custbody_tn_so_shipteam'
					});
					// log.debug({
					// title : 'orderStatus',
					// details : orderStatus
					// });
					if (orderStatus != 'B') {
						return;
					}

					var createdFrom = newRecord.getValue({
						fieldId : 'createdfrom'
					});
					var assemblyitem = newRecord.getValue({
						fieldId : 'assemblyitem'
					});
					// log.debug({
					// title : '_entity',
					// details : _entity + '|' + merchandiser + '|' + shipteam
					// });
					// 查询so上的po#
					if (!createdFrom) {
						return;
					}
					var customerPO;
					var esdPO;
					var lsdPO;
					var itdPO;
					var finalDesPO;
					var soRecord = record.load({
						type : record.Type.SALES_ORDER,
						id : createdFrom
					});
					var numLines = soRecord.getLineCount({
						sublistId : 'item'
					})

					for (var i = 0; i < numLines; i++) {
						var customerPOC = soRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_line_customerpo',
							line : i
						});
						var item = soRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'item',
							line : i
						});
						var esd = soRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_po_esd',
							line : i
						});
						var lsd = soRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_po_lsd',
							line : i
						});
						var itd = soRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_po_itd',
							line : i
						});
						var shipdes = soRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_shipdes',
							line : i
						});
						if (assemblyitem == item) {
							customerPO = customerPOC;
							esdPO = esd;
							lsdPO = lsd;
							itdPO = itd;
							finalDesPO = shipdes;
							break;
						}
					}

					// 设置rate为factory cost
					search.create(
							{
								type : search.Type.PURCHASE_ORDER,
								filters : [
										[ 'createdfrom', 'is', newRecord.id ],
										'AND', [ 'mainline', 'is', 'T' ],
										'AND', [ 'taxline', 'is', 'F' ] ],
								columns : [ 'internalid' ]
							}).run().each(
							function(result) {
								var poId = result.id;
								var poRec = record.load({
									type : record.Type.PURCHASE_ORDER,
									id : poId
								});
								// poRec.setValue({
								// fieldId : 'custbody_tn_entity',
								// value : _entity
								// });
								// poRec.setValue({
								// fieldId : 'custbody_tn_so_merchandiser',
								// value : merchandiser
								// });
								// poRec.setValue({
								// fieldId : 'custbody_tn_so_shipteam',
								// value : shipteam
								// });
								// log.debug({
								// title : '_entity',
								// details : _entity + '|' + merchandiser
								// + '|' + shipteam
								// });
								setPORate(poRec, search, customerPO, esdPO,
										lsdPO, itdPO, finalDesPO);
								poRec.save({
									ignoreMandatoryFields : true
								});
								return true;
							});

				}
			}

			function setPORate(poRec, search, customerPO, esdPO, lsdPO, itdPO,
					finalDesPO) {
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

					var factoryCost;
					var fhcSearch = search.create({
						type : 'customrecord_tn_factoryhistorycost',
						filters : filters,
						columns : [ 'custrecord_tn_item_factorycost',
								'custrecord_tn_item_currency',
								'custrecord_tn_item_validfrom',
								'custrecord_tn_cr_validto' ]
					});
					fhcSearch.run().each(function(result) {
						// factoryCost = result.getValue({
						// name : 'custrecord_tn_item_factorycost'
						// });

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
					if (factoryCost) {
						poRec.setSublistValue({
							sublistId : 'item',
							fieldId : 'rate',
							line : i,
							value : factoryCost
						});
					}

					// 设置Customer PO
					if (customerPO) {
						poRec.setSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_line_customerpo',
							line : i,
							value : customerPO
						});
					}
					if (esdPO) {
						poRec.setSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_po_esd',
							line : i,
							value : esdPO
						});
					}
					if (lsdPO) {
						poRec.setSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_po_lsd',
							line : i,
							value : lsdPO
						});
					}
					if (itdPO) {
						poRec.setSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_po_itd',
							line : i,
							value : itdPO
						});
					}
					if (finalDesPO) {
						poRec.setSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_quote_shipdes',
							line : i,
							value : finalDesPO
						});
					}
				}
			}

			return {
				afterSubmit : afterSubmit
			};

		});
