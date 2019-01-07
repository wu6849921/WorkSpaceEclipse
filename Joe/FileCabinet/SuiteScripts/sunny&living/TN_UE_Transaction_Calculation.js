/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(
		[ 'N/record', 'N/search' ],
		function(record, search) {

			function calculate(newRecord) {
				var lineCount = newRecord.getLineCount({
					sublistId : 'item'
				});
				var recType = newRecord.type;

				for (var i = 0; i < lineCount; i++) {
					var ctnQty = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_carton_qty',
						line : i
					});
					var packSize = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_pack_size',
						line : i
					});
					var quantity = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'quantity',
						line : i
					});
					var oldQty = quantity;

					if (quantity !== ''
							&& (recType == 'workorder' || recType == 'purchaseorder')) {
						// quantity = Math.ceil(quantity);
						// 改成四舍五入 20180606 joe
						quantity = Math.round(quantity);
						if (oldQty != quantity) {
							newRecord.setSublistValue({
								sublistId : 'item',
								fieldId : 'quantity',
								line : i,
								value : quantity
							});
						}
					}

					if (packSize && quantity !== '' && ctnQty === '') {
						ctnQty = (quantity * 100) / (packSize * 100);
						newRecord.setSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_carton_qty',
							line : i,
							value : ctnQty
						});
					} else if (ctnQty && quantity !== '' && packSize === '') {
						packSize = (quantity * 100) / (ctnQty * 100);
						newRecord.setSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_pack_size',
							line : i,
							value : packSize
						});
					} else if (ctnQty !== '' && packSize !== ''
							&& quantity === '') {
						quantity = ctnQty * packSize;
						if (recType == 'workorder'
								|| recType == 'purchaseorder') {
							// quantity = Math.ceil(quantity);
							// 改成四舍五入 20180606 joe
							quantity = Math.round(quantity);
						}
						newRecord.setSublistValue({
							sublistId : 'item',
							fieldId : 'quantity',
							line : i,
							value : quantity
						});
					}
				}

				return newRecord;
			}
			function beforeSubmit(context) {
				try {
					if (context.type == context.UserEventType.EDIT
							|| context.type == context.UserEventType.CREATE
							|| context.type == context.UserEventType.COPY) {
						var newRecord = context.newRecord;

						var allItemFields = newRecord.getSublistFields({
							sublistId : 'item'
						});

						var lineCount = newRecord.getLineCount({
							sublistId : 'item'
						});

						if (allItemFields.indexOf('custcol_tn_carton_qty') == -1
								|| allItemFields
										.indexOf('custcol_tn_pack_size') == -1
								|| allItemFields.indexOf('quantity') == -1) {
							return true;
						}
						// log.debug({
						// title : 'beforeSubmit calculate'
						// });
						calculate(newRecord);
						// newRecord.save({
						// ignoreMandatoryFields : true
						// });

						// for (var i = 0; i < lineCount; i++) {
						// var j = i + 1;
						// newRecord.setSublistValue({
						// sublistId : 'item',
						// fieldId : 'custcol1',
						// line : i,
						// value : j
						// });
						// }
					}
				} catch (e) {
					log.debug({
						title : 'set carton qty or pack size error',
						details : e
					});
				}
			}

			function afterSubmit(context) {
				var newRecord = context.newRecord;
				var poIds = [];

				if (newRecord.type == 'salesorder'
						&& (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.APPROVE)) {
					try {
						var oldRecord = context.oldRecord;
						var oldStatus = oldRecord.getValue('orderstatus');
						var newStatus = newRecord.getValue('orderstatus');
						if (!(oldStatus == 'A' && newStatus != 'A')) {
							log.debug({
								title : 'no need to change wo/po',
								details : newRecord.id
							});
							return true;
						}
						search
								.create(
										{
											type : search.Type.WORK_ORDER,
											filters : [
													[ 'createdfrom', 'is',
															newRecord.id ],
													'AND',
													[ 'mainline', 'is', 'T' ],
													'AND',
													[ 'taxline', 'is', 'F' ] ],
											columns : [ 'internalid' ]
										}).run().each(function(result) {
									var woId = result.id;
									var woRec = record.load({
										type : record.Type.WORK_ORDER,
										id : woId
									});

									var lineCount = woRec.getLineCount({
										sublistId : 'item'
									});
									for (var i = 0; i < lineCount; i++) {
										var poId = woRec.getSublistValue({
											sublistId : 'item',
											fieldId : 'poid',
											line : i
										});

										if (poId && poIds.indexOf(poId) == -1) {
											poIds.push(poId);
										}
									}
									// log.debug({
									// title : 'afterSubmit calculate'
									// });
									calculate(woRec);

									woRec.save({
										ignoreMandatoryFields : true
									});

									return true;
								});
						poIds.forEach(function(poId) {
							var poRec = record.load({
								type : record.Type.PURCHASE_ORDER,
								id : poId
							});
							calculate(poRec);
							poRec.save({
								ignoreMandatoryFields : true
							});
						});
					} catch (e) {
						log.debug({
							title : 'set WO/PO carton qty error',
							details : e
						});
					}
				}
			}

			return {
				beforeSubmit : beforeSubmit,
				afterSubmit : afterSubmit
			}
		});
