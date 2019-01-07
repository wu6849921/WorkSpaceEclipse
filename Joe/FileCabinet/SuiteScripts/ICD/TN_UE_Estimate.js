/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
		[ 'N/record' ],

		function(record) {
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
			function afterSubmit(context) {
				var newRecord = context.newRecord;
				var oldRecord = context.oldRecord;
				if (context.type !== context.UserEventType.EDIT) {
					return;
				}

				var oldApprovelStatus = oldRecord.getValue({
					fieldId : 'custbody_contract_approved_by_finance'
				});
				var newApprovelStatus = newRecord.getValue({
					fieldId : 'custbody_contract_approved_by_finance'
				});
				var _class = newRecord.getValue({
					fieldId : 'class'
				});
				// log.debug({
				// title : 'oldApprovelStatus',
				// details : oldApprovelStatus
				// });
				// log.debug({
				// title : 'newApprovelStatus',
				// details : newApprovelStatus
				// });

				var param = 1;
				if ((oldApprovelStatus == '2' && newApprovelStatus == '2')
						|| _class == '51') {// 如果都为NO则返回
					return;
				}
				if (oldApprovelStatus === '2' && newApprovelStatus == '1') {// 如果状态为NO到YES则加全部
					param = 1;
					setJobValue(oldRecord, newRecord, param, false);
				}
				if (oldApprovelStatus == '1' && newApprovelStatus === '2') {// 如果状态为Yes到NO则减全部
					param = -1;
					setJobValue(oldRecord, newRecord, param, false);
				}
				if (oldApprovelStatus == '1' && newApprovelStatus === '1') {// 如果状态为Yes到Yes则加上变化的值
					param = 1;
					setJobValue(oldRecord, newRecord, param, true);
				}
			}
			function setJobValue(oldRecord, newRecord, param, isExtra) {
				// 加载job Record
				var jobId = newRecord.getValue({
					fieldId : 'job'
				});
				var _value = newRecord.getValue({
					fieldId : 'custbody16'
				});
				var jobRec = record.load({
					type : record.Type.JOB,
					id : jobId
				});

				// 设置Main Quotation
				var quotationType = newRecord.getValue({
					fieldId : 'custbody_main_quotation'
				});
				var estimateNumber = newRecord.getValue({
					fieldId : 'tranid'
				});
				if (!isExtra) {// 非Yes to Yes不需要处理quotation字段
					if (quotationType == '1') {// Main Quotation
						var mainQuotation = jobRec.getValue({
							fieldId : 'custentity_project_main_quotation'
						});
						if (mainQuotation) {
							if (param == -1) {// 如果param为-1则去除estimateNumber
								if (mainQuotation.indexOf(estimateNumber) != -1) {// 如果mainQuotation包含jobNumber则去除jobNumber
									if (mainQuotation.indexOf(',') != -1) {// 如果不止一个元素，则用数组的方式去除
										var mainQuotationArr = mainQuotation
												.split(',');
										var index = mainQuotationArr
												.indexOf(estimateNumber);
										mainQuotationArr.splice(index, 1);
										mainQuotation = mainQuotationArr
												.toString();
									} else {// 如果只有一个则全部去除
										mainQuotation = '';
									}
								}
							} else if (param == 1) {// 如果为1就加上
								mainQuotation = mainQuotation + ','
										+ estimateNumber;
							}
						} else {
							if (param == 1) {
								mainQuotation = estimateNumber;
							}
						}
						jobRec.setValue({
							fieldId : 'custentity_project_main_quotation',
							value : mainQuotation
						});
					} else if (quotationType == '2') {// Change Order
						var changeOrder = jobRec.getValue({
							fieldId : 'custentity_project_change_order'
						});
						if (changeOrder) {
							if (param == -1) {// 如果param为-1则去除jobNumber
								if (changeOrder.indexOf(estimateNumber) != -1) {// 如果mainQuotation包含jobNumber则去除jobNumber
									if (changeOrder.indexOf(',') != -1) {// 如果不止一个元素，则用数组的方式去除
										var changeOrderArr = changeOrder
												.split(',');
										var index = changeOrderArr
												.indexOf(estimateNumber);
										changeOrderArr.splice(index, 1);
										changeOrder = changeOrderArr.toString();
									} else {// 如果只有一个则全部去除
										changeOrder = '';
									}
								}
							} else if (param == 1) {// 如果为1就加上
								changeOrder = changeOrder + ','
										+ estimateNumber;
							}
						} else {
							if (param == 1) {
								changeOrder = estimateNumber;
							}
						}
						jobRec.setValue({
							fieldId : 'custentity_project_change_order',
							value : changeOrder
						});
					}
				}

				// 设置其他值
				var materialsCost = newRecord.getValue({
					fieldId : 'custbody_materials_cost'
				});
				var materialsCostOld = oldRecord.getValue({
					fieldId : 'custbody_materials_cost'
				});
				materialsCost = isExtra ? materialsCost - materialsCostOld
						: materialsCost;
				materialsCost = materialsCost * param;
				//
				var importTaxCost = newRecord.getValue({
					fieldId : 'custbody_import_tax_cost'
				});
				var importTaxCostOld = oldRecord.getValue({
					fieldId : 'custbody_import_tax_cost'
				});
				importTaxCost = isExtra ? importTaxCost - importTaxCostOld
						: importTaxCost;
				importTaxCost = importTaxCost * param;
				//
				var logisticCost = newRecord.getValue({
					fieldId : 'custbody_logistic_cost'
				});
				var logisticCostOld = oldRecord.getValue({
					fieldId : 'custbody_logistic_cost'
				});
				logisticCost = isExtra ? logisticCost - logisticCostOld
						: logisticCost;
				logisticCost = logisticCost * param;
				//
				var subconLaborCost = newRecord.getValue({
					fieldId : 'custbody71'
				});
				var subconLaborCostOld = oldRecord.getValue({
					fieldId : 'custbody71'
				});
				subconLaborCost = isExtra ? subconLaborCost
						- subconLaborCostOld : subconLaborCost;
				subconLaborCost = subconLaborCost * param;
				// log.debug({
				// title : 'subconLaborCost',
				// details : subconLaborCost
				// });
				//
				var subconMaterialCost = newRecord.getValue({
					fieldId : 'custbody_alarm_m_c'
				});
				var subconMaterialCostOld = oldRecord.getValue({
					fieldId : 'custbody_alarm_m_c'
				});
				subconMaterialCost = isExtra ? subconMaterialCost
						- subconMaterialCostOld : subconMaterialCost;
				subconMaterialCost = subconMaterialCost * param;
				//
				var ICDEngineerLaborCost = newRecord.getValue({
					fieldId : 'custbody_i_e_l_c'
				});
				var ICDEngineerLaborCostOld = oldRecord.getValue({
					fieldId : 'custbody_i_e_l_c'
				});
				ICDEngineerLaborCost = isExtra ? ICDEngineerLaborCost
						- ICDEngineerLaborCostOld : ICDEngineerLaborCost;
				ICDEngineerLaborCost = ICDEngineerLaborCost * param;
				//
				var travelCost = newRecord.getValue({
					fieldId : 'custbody73'
				});
				var travelCostOld = oldRecord.getValue({
					fieldId : 'custbody73'
				});
				travelCost = isExtra ? travelCost - travelCostOld : travelCost;
				travelCost = travelCost * param;
				//
				var tsbCost = newRecord.getValue({
					fieldId : 'custbody_t_s_b_c'
				});
				var tsbCostOld = oldRecord.getValue({
					fieldId : 'custbody_t_s_b_c'
				});
				tsbCost = isExtra ? tsbCost - tsbCostOld : tsbCost;
				tsbCost = tsbCost * param;
				//
				var firstTearAmcCost = newRecord.getValue({
					fieldId : 'custbody_f_y_a_c'
				});
				var firstTearAmcCostOld = oldRecord.getValue({
					fieldId : 'custbody_f_y_a_c'
				});
				firstTearAmcCost = isExtra ? firstTearAmcCost
						- firstTearAmcCostOld : firstTearAmcCost;
				firstTearAmcCost = firstTearAmcCost * param;
				//
				var secondYearAmcCost = newRecord.getValue({
					fieldId : 'custbody_second_y_a_c'
				});
				var secondYearAmcCostOld = oldRecord.getValue({
					fieldId : 'custbody_second_y_a_c'
				});
				secondYearAmcCost = isExtra ? secondYearAmcCost
						- secondYearAmcCostOld : secondYearAmcCost;
				secondYearAmcCost = secondYearAmcCost * param;
				//
				var bankCost = newRecord.getValue({
					fieldId : 'custbody_bank_cost'
				});
				var bankCostOld = oldRecord.getValue({
					fieldId : 'custbody_bank_cost'
				});
				bankCost = isExtra ? bankCost - bankCostOld : bankCost;
				bankCost = bankCost * param;
				//
				var miscCost = newRecord.getValue({
					fieldId : 'custbody72'
				});
				var miscCostOld = oldRecord.getValue({
					fieldId : 'custbody72'
				});
				miscCost = isExtra ? miscCost - miscCostOld : miscCost;
				miscCost = miscCost * param;
				//
				var commissionAmount = newRecord.getValue({
					fieldId : 'custbody_commissionamount'
				});
				var commissionAmountOld = oldRecord.getValue({
					fieldId : 'custbody_commissionamount'
				});
				commissionAmount = isExtra ? commissionAmount
						- commissionAmountOld : commissionAmount;
				commissionAmount = commissionAmount * param;
				//
				var engineerBounsCost = newRecord.getValue({
					fieldId : 'custbody_e_b_c'
				});
				var engineerBounsCostOld = oldRecord.getValue({
					fieldId : 'custbody_e_b_c'
				});
				engineerBounsCost = isExtra ? engineerBounsCost
						- engineerBounsCostOld : engineerBounsCost;
				engineerBounsCost = engineerBounsCost * param;
				//
				var totalCost = newRecord.getValue({
					fieldId : 'custbody_tcost'
				});
				var totalCostOld = oldRecord.getValue({
					fieldId : 'custbody_tcost'
				});
				totalCost = isExtra ? totalCost - totalCostOld : totalCost;
				totalCost = totalCost * param;
				//
				var gpForSales = newRecord.getValue({
					fieldId : 'custbody_gp_f_s'
				});
				var gpForSalesOld = oldRecord.getValue({
					fieldId : 'custbody_gp_f_s'
				});
				gpForSales = isExtra ? gpForSales - gpForSalesOld : gpForSales;
				gpForSales = gpForSales * param;
				//
				var total = newRecord.getValue({
					fieldId : 'total'
				});
				var totalOld = oldRecord.getValue({
					fieldId : 'total'
				});
				total = isExtra ? total - totalOld : total;
				total = total * param;
				total = _value == '1' ? total : total * -1;// 如果value字段是-则结果乘以负一
				// log.debug({
				// title : 'total',
				// details : total
				// });
				// 开始设值
				var materialsCostJob = jobRec.getValue({
					fieldId : 'custentity_materials_cost'
				});
				jobRec.setValue({
					fieldId : 'custentity_materials_cost',
					value : materialsCostJob + materialsCost
				});
				var importTaxCostJob = jobRec.getValue({
					fieldId : 'custentity_import_tax_cost'
				});
				jobRec.setValue({
					fieldId : 'custentity_import_tax_cost',
					value : importTaxCostJob + importTaxCost
				});
				var logisticCostJob = jobRec.getValue({
					fieldId : 'custentity_logistic_cost'
				});
				jobRec.setValue({
					fieldId : 'custentity_logistic_cost',
					value : logisticCostJob + logisticCost
				});
				var subconLaborCostJob = jobRec.getValue({
					fieldId : 'custentity_sub_contractor_cost'
				});
				// log.debug({
				// title : 'subconLaborCostJob + subconLaborCost',
				// details : subconLaborCostJob + subconLaborCost
				// });
				jobRec.setValue({
					fieldId : 'custentity_sub_contractor_cost',
					value : subconLaborCostJob + subconLaborCost
				});
				var subconMaterialCostJob = jobRec.getValue({
					fieldId : 'custentity_alarm_m_c'
				});
				jobRec.setValue({
					fieldId : 'custentity_alarm_m_c',
					value : subconMaterialCostJob + subconMaterialCost
				});
				var ICDEngineerLaborCostJob = jobRec.getValue({
					fieldId : 'custentity_i_e_l_c'
				});
				jobRec.setValue({
					fieldId : 'custentity_i_e_l_c',
					value : ICDEngineerLaborCostJob + ICDEngineerLaborCost
				});
				var travelCostJob = jobRec.getValue({
					fieldId : 'custentity_travel_cost'
				});
				jobRec.setValue({
					fieldId : 'custentity_travel_cost',
					value : travelCostJob + travelCost
				});
				var tsbCostJob = jobRec.getValue({
					fieldId : 'custentity_t_s_b_c'
				});
				jobRec.setValue({
					fieldId : 'custentity_t_s_b_c',
					value : tsbCostJob + tsbCost
				});
				var firstTearAmcCostJob = jobRec.getValue({
					fieldId : 'custentity_f_y_a_c'
				});
				jobRec.setValue({
					fieldId : 'custentity_f_y_a_c',
					value : firstTearAmcCostJob + firstTearAmcCost
				});
				var secondYearAmcCostJob = jobRec.getValue({
					fieldId : 'custentity_second_y_a_c'
				});
				jobRec.setValue({
					fieldId : 'custentity_second_y_a_c',
					value : secondYearAmcCostJob + secondYearAmcCost
				});
				var bankCostJob = jobRec.getValue({
					fieldId : 'custentity_bank_cost'
				});
				jobRec.setValue({
					fieldId : 'custentity_bank_cost',
					value : bankCostJob + bankCost
				});
				var miscCostJob = jobRec.getValue({
					fieldId : 'custentity_misc_cost'
				});
				jobRec.setValue({
					fieldId : 'custentity_misc_cost',
					value : miscCostJob + miscCost
				});
				var commissionAmountJob = jobRec.getValue({
					fieldId : 'custentity_commissionamount'
				});
				jobRec.setValue({
					fieldId : 'custentity_commissionamount',
					value : commissionAmountJob + commissionAmount
				});
				var engineerBounsCostJob = jobRec.getValue({
					fieldId : 'custentity_e_b_c'
				});
				jobRec.setValue({
					fieldId : 'custentity_e_b_c',
					value : engineerBounsCostJob + engineerBounsCost
				});
				var totalCostJob = jobRec.getValue({
					fieldId : 'custentity_tcost'
				});
				jobRec.setValue({
					fieldId : 'custentity_tcost',
					value : totalCostJob + totalCost
				});
				var gpForSalesJob = jobRec.getValue({
					fieldId : 'custentity_gp_forsales'
				});
				jobRec.setValue({
					fieldId : 'custentity_gp_forsales',
					value : gpForSalesJob + gpForSales
				});
				var totalJob = jobRec.getValue({
					fieldId : 'custentity301'
				});
				jobRec.setValue({
					fieldId : 'custentity301',
					value : totalJob + total
				});
				jobRec.save({
					enableSourcing : false,
					ignoreMandatoryFields : true
				});
			}
			return {
				afterSubmit : afterSubmit
			}

		});
