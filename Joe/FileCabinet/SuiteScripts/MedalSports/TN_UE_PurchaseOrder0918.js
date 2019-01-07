/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/record', 'N/search' ],

		function(record, search) {
			function beforeLoad(context) {
				try {
					context.form.getSublist('item').getField('rate')
							.updateDisplayType({
								displayType : 'disabled'
							});
					log.debug({
						title : 'beforeLoad',
						details : context.form.getSublist('item').getField(
								'rate')
					});
					if (context.type !== context.UserEventType.VIEW)
						return;

					var newRecord = context.newRecord;
					var approvalStatus = newRecord.getText({
						fieldId : 'approvalstatus'
					});
					if (approvalStatus != 'Approved') {
						return;
					}
					var form = context.form;

					var receive = form.getButton({
						id : 'receive'
					});
					var process = form.getButton({
						id : 'process'
					});
					var hiddenReceive = true;

					var searchCount = 0;
					// 查询Inspection
					var inSearch = search
							.create({
								type : 'customrecord_tn_inspection',
								filters : [ [ 'custrecord_tn_po', 'is',
										newRecord.id ] ],
								columns : [
										'custrecord_tn_po_inspection_inspectionty',
										'custrecord_tn_po_inspection_status' ]
							});
					inSearch
							.run()
							.each(
									function(result) {
										searchCount++;
										var inspectionType = result
												.getText({
													name : 'custrecord_tn_po_inspection_inspectionty'
												});
										var inspectionStatus = result
												.getText({
													name : 'custrecord_tn_po_inspection_status'
												});
										// log.debug({
										// title : 'inspectionType',
										// details : inspectionType + '|' +
										// inspectionStatus
										// });
										if (inspectionType == 'MD Final inspection'
												&& (inspectionStatus == 'pass'
														|| inspectionStatus == 'No Need' || inspectionStatus == 'Gurantee letter')) {
											hiddenReceive = false;
										}
										return true;
									});
					if (searchCount == 0) {
						return;
					}
					// log.debug({
					// title : 'hiddenReceive',
					// details : hiddenReceive
					// });
					if (hiddenReceive) {
						if (receive) {
							receive.isHidden = true;
						}
						if (process) {
							process.isHidden = true;
						}
					}
				} catch (e) {
					log.debug({
						title : 'beforeLoad',
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
				try {
					if (context.type == context.UserEventType.EDIT) {
						// if (context.type == context.UserEventType.EDIT
						// || context.type == context.UserEventType.CREATE
						// || context.type == context.UserEventType.COPY) {
						var newRecord = context.newRecord;
						var numLines = newRecord.getLineCount({
							sublistId : 'item'
						});
						var approvalStatus = newRecord.getValue({
							fieldId : 'approvalstatus'
						});
						var poType = newRecord.getValue({
							fieldId : 'custbody_tn_po_type'
						});
						if (approvalStatus != '2' || poType == '4') {
							return;
						}
						var inSearch = search.create({
							type : 'customrecord_tn_inspection',
							filters : [ [ 'custrecord_tn_po', 'is',
									newRecord.id ] ]
						});
						var count = 0;
						inSearch.run().each(function(result) {
							count++;
							return true;
						});
						if (count > 0) {
							return;
						}

						for (var i = 0; i < numLines; i++) {
							var poItemId = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'item',
								line : i
							});
							var poItemLine = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'line',
								line : i
							});
							var description = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'description',
								line : i
							});
							var shipDate = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_po_shipdate',
								line : i
							});
							var quantity = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'quantity',
								line : i
							});
							var customerpo = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_line_customerpo',
								line : i
							});
							// 创建inspection八条
							for (var j = 1; j <= 8; j++) {
								var esd = newRecord.getSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_po_esd',
									line : i
								});
								var insRecord = record.create({
									type : 'customrecord_tn_inspection',
									isDynamic : true
								});

								// 设置po主键
								insRecord.setValue({
									fieldId : 'custrecord_tn_po',
									value : newRecord.id
								});
								// 设置item
								insRecord
										.setValue({
											fieldId : 'custrecord_tn_po_inspection_itemnum',
											value : poItemId
										});
								// 设置itemLine
								insRecord.setValue({
									fieldId : 'custrecord_tn_itemline',
									value : poItemLine
								});
								// 设置type
								insRecord
										.setValue({
											fieldId : 'custrecord_tn_po_inspection_inspectionty',
											value : j
										});
								// 设置Customer PO
								insRecord
										.setValue({
											fieldId : 'custrecord_tn_po_inspection_custpo',
											value : customerpo
										});
								if (esd) {
									// 设置 early ship date
									insRecord
											.setValue({
												fieldId : 'custrecord_tn_po_inspection_esd',
												value : esd
											});

									// 计算inspectionDate
									var addDate = 0;
									switch (j + '') {
									case '1':
										addDate = 90;
										break;
									case '2':
										addDate = 75;
										break;
									case '3':
										addDate = 45;
										break;
									case '4':
									case '5':
									case '6':
										addDate = 30;
										break;
									case '7':
										addDate = 10;
										break;
									case '8':
										addDate = 21;
										break;

									default:
										break;
									}
									// log.debug({
									// title : 'esd',
									// details : esd
									// });
									var inspectionDate = esd.setDate(esd
											.getDate()
											- addDate);
									// 设置 inspection date
									insRecord
											.setValue({
												fieldId : 'custrecord_tn_po_inspection_inspectionda',
												value : new Date(inspectionDate)
											});
								}

								if (shipDate) {
									// 设置Factory Shipping Date
									insRecord
											.setValue({
												fieldId : 'custrecord_tn_inspection_fsd',
												value : shipDate
											});
								}
								if (description) {
									// 设置description
									insRecord
											.setValue({
												fieldId : 'custrecord_tn_po_inspection_desc',
												value : description
											});
								}
								if (quantity) {
									// 设置quantity
									insRecord
											.setValue({
												fieldId : 'custrecord_tn_po_inspection_poqty',
												value : quantity
											});
								}

								insRecord.save();
							}
						}

					}
				} catch (e) {
					log.debug({
						title : 'afterSubmit',
						details : e
					});
				}
			}
			return {
				beforeLoad : beforeLoad,
				afterSubmit : afterSubmit
			};

		});
