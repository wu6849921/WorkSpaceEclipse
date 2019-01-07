/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(
		[ 'N/url', 'N/search' ],
		function(url, search) {
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
					var numLines = newRecord.getLineCount({
						sublistId : 'item'
					});
					if (context.type == context.UserEventType.VIEW) {
						var form = context.form;
						var poMergePrintURL = url
								.resolveScript({
									scriptId : 'customscript_tn_report_filter_page',
									deploymentId : 'customdeploy_tn_report_filter_page_po'
								});
						form.addButton({
							id : 'custpage_popuppomergeprintwin',
							label : '打开合并打印页面',
							functionName : '(function(){ window.open("'
									+ poMergePrintURL + '") })'
						});

						// add by joe
						var deliveryDate = new Date();
						var estimateInspectionDate = new Date();
						var earlyShipDate = newRecord.getValue({
							fieldId : 'custbody_tn_early_ship_date',
						});
						if (earlyShipDate) {
							deliveryDate.setDate(earlyShipDate.getDate() - 10);
							estimateInspectionDate.setDate(earlyShipDate
									.getDate() - 8);
							for (var i = 0; i < numLines; i++) {
								var delDate = newRecord.getSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_del_date',
									line : i,
								});
								if (delDate == '') {
									// log.debug({
									// title : 'deliveryDate',
									// details : deliveryDate
									// });
									newRecord.setSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_del_date',
										line : i,
										value : deliveryDate
									});
								}

								var estInsDate = newRecord.getSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_est_ins_date',
									line : i,
								});
								if (estInsDate == '') {
									newRecord.setSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_tn_est_ins_date',
										line : i,
										value : estimateInspectionDate
									});
								}
							}
						}
					}

					// newRecord.setValue({
					// fieldId : 'memo',
					// value : 'test'
					// });
					for (var i = 0; i < numLines; i++) {
						var outLength = newRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_out_length',
							line : i
						});
						var outWidth = newRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_out_width',
							line : i
						});
						var outHeight = newRecord.getSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_out_height',
							line : i
						});

						if (outLength && outWidth && outHeight) {
							// log.debug({
							// title : 'outLength outWidth outHeight',
							// details : outLength + '*' + outWidth + '*' +
							// outHeight
							// });
							newRecord.setSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_car_size',
								line : i,
								value : outLength + '*' + outWidth + '*'
										+ outHeight
							});

						}
					}

					// context.form.getSublist('item').getField('description')
					// .updateDisplayType({
					// displayType : 'disabled'
					// });
					context.form.getSublist('item').getField('rate')
							.updateDisplayType({
								displayType : 'disabled'
							});
				} catch (e) {
					log.debug({
						title : 'add po button error',
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
			 * 
			 * joe add 20180315 update date batch and init 2 date
			 */
			function beforeSubmit(context) {
				if (context.type == context.UserEventType.EDIT
						|| context.type == context.UserEventType.CREATE
						|| context.type == context.UserEventType.COPY) {
					var newRecord = context.newRecord;
					var lineCount = newRecord.getLineCount({
						sublistId : 'item'
					});
					var deliveryDate = new Date();
					var estimateInspectionDate = new Date();
					var earlyShipDate = newRecord.getValue({
						fieldId : 'custbody_tn_early_ship_date',
					});
					if (earlyShipDate) {
						var addDay = earlyShipDate.getTime() - 24 * 60 * 60
								* 1000 * 10;
						deliveryDate.setTime(addDay);

						var addDay2 = earlyShipDate.getTime() - 24 * 60 * 60
								* 1000 * 8;
						estimateInspectionDate.setTime(addDay2);
						// log.debug({
						// title : 'deliveryDate',
						// details : deliveryDate
						// });
						// log.debug({
						// title : 'estimateInspectionDate',
						// details : estimateInspectionDate
						// });
						for (var i = 0; i < lineCount; i++) {
							var delDate = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_del_date',
								line : i,
							});
							if (delDate == '' || delDate == null) {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_del_date',
									line : i,
									value : deliveryDate
								});
							}

							var estInsDate = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_tn_est_ins_date',
								line : i,
							});
							if (estInsDate == '' || estInsDate == null) {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_est_ins_date',
									line : i,
									value : estimateInspectionDate
								});
							}
						}
					}

					var isUpdate = newRecord.getValue({
						fieldId : 'custbody_tn_po_update_date',
					});
					var deliveryDateUp = newRecord.getValue({
						fieldId : 'custbody_tn_po_delivery_date_up',
					});
					var eiDateUp = newRecord.getValue({
						fieldId : 'custbody_tn_po_ei_date_up',
					});
					if (isUpdate) {
						if (deliveryDateUp) {
							for (var i = 0; i < lineCount; i++) {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_del_date',
									line : i,
									value : deliveryDateUp
								});
							}
						}
						if (eiDateUp) {
							for (var i = 0; i < lineCount; i++) {
								newRecord.setSublistValue({
									sublistId : 'item',
									fieldId : 'custcol_tn_est_ins_date',
									line : i,
									value : eiDateUp
								});
							}
						}
					}
				}
			}
			return {
				beforeLoad : beforeLoad,
				beforeSubmit : beforeSubmit
			}
		});
