/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 * @appliedtorecord many
 * @NScriptId _cs_cn_cashflow_default
 * @NDeploymentId
 */
define([ '../../lib/wrapper/ns_wrapper_search', '../../lib/commons',
		'../../lib/wrapper/ns_wrapper_runtime', 'N/record' ], function(search,
		commons, runtime, record) {
	function fieldChanged(context) {
		var currentRecord = context.currentRecord;
		var userObj = runtime.getCurrentUser();
		var sublistId = context.sublistId;
		var fieldId = context.fieldId;
		// employee center role no need default cfs item, because this
		// role can not customize permission.
		if (userObj.roleCenter === 'EMPLOYEE'
				|| userObj.roleId === 'employee_center') {
			return;
		}
		if (fieldId === 'customer' && currentRecord.type == 'customerpayment') {
			var entityId = currentRecord.getValue({
				fieldId : 'customer'
			});
			var entityCategory = search.lookupFields({
				type : search.Type.CUSTOMER,
				id : entityId,
				columns : [ 'category' ]
			});
			if (!commons.makesure(entityCategory)) {
				return;
			}
			entityCategory = entityCategory.category[0].value;
			entityChanged(context, entityCategory, 'cus');
		}
		if (fieldId === 'entity') {
			if (currentRecord.type == 'customerrefund'
					|| currentRecord.type == 'cashsale'
					|| currentRecord.type == 'cashrefund'
					|| currentRecord.type == 'customerdeposit') {
				var entityId = currentRecord.getValue({
					fieldId : 'entity'
				});
				var entityCategory = search.lookupFields({
					type : search.Type.CUSTOMER,
					id : entityId,
					columns : [ 'category' ]
				});
				if (!commons.makesure(entityCategory)) {
					return;
				}
				entityCategory = entityCategory.category[0].value;
				entityChanged(context, entityCategory, 'cus');
			} else if (currentRecord.type == 'vendorpayment') {// entityΪ��Ӧ��
				var entityId = currentRecord.getValue({
					fieldId : 'entity'
				});
				var entityCategory = search.lookupFields({
					type : search.Type.VENDOR,
					id : entityId,
					columns : [ 'category' ]
				});
				if (!commons.makesure(entityCategory)) {
					return;
				}
				entityCategory = entityCategory.category[0].value;
				entityChanged(context, entityCategory, 'ven');
			} else if (currentRecord.type == 'check') {// �������Ϊ֧Ʊ����entity�п����ǿͻ�Ҳ�п����ǹ�Ӧ��
				var entityId = currentRecord.getValue({
					fieldId : 'entity'
				});
				var entityType;
				search.create({
					type : 'entity',
					filters : [ [ 'internalid', 'anyof', entityId ] ]
				}).run().each(function(result) {
					entityType = result.reordType;
					return true;
				});
				var entityCategory = search.lookupFields({
					type : entityType,
					id : entityId,
					columns : [ 'category' ]
				});
				if (!commons.makesure(entityCategory)) {
					return;
				}
				var _entityType;
				if (entityType == 'vendor') {
					_entityType = 'ven';
				} else if (entityType == 'customer') {
					_entityType = 'cus';
				} else {
					return;
				}
				entityChanged(context, entityCategory, _entityType);
			} else if (currentRecord.type == 'vendorbill'
					|| currentRecord.type == 'vendorcredit') {
				var vendorId = currentRecord.getValue({
					fieldId : 'entity'
				});
				var entityCategory = search.lookupFields({
					type : search.Type.VENDOR,
					id : vendorId,
					columns : [ 'category' ]
				});
				// alert(vendorCategory);
				if (!commons.makesure(entityCategory)) {
					return;
				}
				entityCategory = entityCategory.category[0].value;
				if (entityCategory != '16') {
					entityChanged(context, entityCategory, 'ven');
				}
			}
		}
		if (sublistId === 'expense' && fieldId === 'department') {
			if (currentRecord.type == 'vendorbill'
					|| currentRecord.type == 'vendorcredit') {
				var vendorId = currentRecord.getValue({
					fieldId : 'entity'
				});
				var entityCategory = search.lookupFields({
					type : search.Type.VENDOR,
					id : vendorId,
					columns : [ 'category' ]
				});
				// alert(vendorCategory);
				if (!commons.makesure(entityCategory)) {
					return;
				}
				entityCategory = entityCategory.category[0].value;
				// alert(entityCategory);
				if (entityCategory == '16') {// ����Ϊemployee�������expense
					departmentChanged(context);
				}
			}
		}
	}

	function departmentChanged(context) {
		var currentRecord = context.currentRecord;
		var departmentId = currentRecord.getCurrentSublistValue({
			sublistId : 'expense',
			fieldId : 'department'
		});
		var cashFlowItem = search.lookupFields({
			type : search.Type.DEPARTMENT,
			id : departmentId,
			columns : [ 'custrecord_n102_cseg_cn_cfi' ]
		});
		if (!commons.makesure(cashFlowItem)) {
			return;
		}
		// alert(JSON.stringify(cashFlowItem));
		if (cashFlowItem.custrecord_n102_cseg_cn_cfi[0]) {
			cashFlowItem = cashFlowItem.custrecord_n102_cseg_cn_cfi[0].value;
			currentRecord.setCurrentSublistValue({
				sublistId : 'expense',
				fieldId : 'custcol_cseg_cn_cfi',
				value : cashFlowItem
			});
		}
	}
	function entityChanged(context, entityCategory, entityType) {
		var currentRecord = context.currentRecord;
		var cashFlowItem;
		search
				.create(
						{
							type : 'customrecord_tn_' + entityType + '_cfi',
							filters : [ [
									'custrecord_tn_' + entityType + '_cate',
									'anyof', entityCategory ] ],
							columns : [ 'custrecord_tn_' + entityType
									+ '_cashflowitem' ]
						}).run().each(function(result) {
					cashFlowItem = result.getValue({
						name : 'custrecord_tn_' + entityType + '_cashflowitem'
					});
					return true;
				});
		if (!commons.makesure(cashFlowItem)) {
			return;
		}
		currentRecord.setValue({
			fieldId : 'custbody_cseg_cn_cfi',
			value : cashFlowItem
		});
	}
	function pageInit(context) {
		var currentRecord = context.currentRecord;
		var userObj = runtime.getCurrentUser();
		var sublistId = context.sublistId;
		var fieldId = context.fieldId;
		// employee center role no need default cfs item, because this
		// role can not customize permission.
		if (userObj.roleCenter === 'EMPLOYEE'
				|| userObj.roleId === 'employee_center') {
			return;
		}
		// alert(context.mode);
		if (context.mode !== 'create' && context.mode !== 'copy')
			return;

		if (currentRecord.type == 'customerpayment') {
			var entityId = currentRecord.getValue({
				fieldId : 'customer'
			});
			if (!entityId) {
				return;
			}
			var entityCategory = search.lookupFields({
				type : search.Type.CUSTOMER,
				id : entityId,
				columns : [ 'category' ]
			});
			if (!commons.makesure(entityCategory)) {
				return;
			}
			entityCategory = entityCategory.category[0].value;
			entityChanged(context, entityCategory, 'cus');
		}
		if (currentRecord.type == 'customerrefund'
				|| currentRecord.type == 'cashsale'
				|| currentRecord.type == 'cashrefund'
				|| currentRecord.type == 'customerdeposit') {
			var entityId = currentRecord.getValue({
				fieldId : 'entity'
			});
			if (!commons.makesure(entityId)) {
				return;
			}
			var entityCategory = search.lookupFields({
				type : search.Type.CUSTOMER,
				id : entityId,
				columns : [ 'category' ]
			});
			if (!commons.makesure(entityCategory)) {
				return;
			}
			entityCategory = entityCategory.category[0].value;
			entityChanged(context, entityCategory, 'cus');
		} else if (currentRecord.type == 'vendorpayment') {// entityΪ��Ӧ��
			var entityId = currentRecord.getValue({
				fieldId : 'entity'
			});
			if (!commons.makesure(entityId)) {
				return;
			}
			var entityCategory = search.lookupFields({
				type : search.Type.VENDOR,
				id : entityId,
				columns : [ 'category' ]
			});
			if (!commons.makesure(entityCategory)) {
				return;
			}
			entityCategory = entityCategory.category[0].value;
			entityChanged(context, entityCategory, 'ven');
		} else if (currentRecord.type == 'check') {// �������Ϊ֧Ʊ����entity�п����ǿͻ�Ҳ�п����ǹ�Ӧ��
			var entityId = currentRecord.getValue({
				fieldId : 'entity'
			});
			if (!commons.makesure(entityId)) {
				return;
			}
			var entityType;
			search.create({
				type : 'entity',
				filters : [ [ 'internalid', 'anyof', entityId ] ]
			}).run().each(function(result) {
				entityType = result.reordType;
				return true;
			});
			var entityCategory = search.lookupFields({
				type : entityType,
				id : entityId,
				columns : [ 'category' ]
			});
			if (!commons.makesure(entityCategory)) {
				return;
			}
			var _entityType;
			if (entityType == 'vendor') {
				_entityType = 'ven';
			} else if (entityType == 'customer') {
				_entityType = 'cus';
			} else {
				return;
			}
			entityChanged(context, entityCategory, _entityType);
		}
	}

	// /**
	// * Validation function to be executed when record is saved.
	// *
	// * @param {Object}
	// * scriptContext
	// * @param {Record}
	// * scriptContext.currentRecord - Current form record
	// * @returns {boolean} Return true if record is valid
	// *
	// * @since 2015.2
	// */
	// function saveRecord(scriptContext) {
	// // alert(1);
	// var currentRecord = scriptContext.currentRecord;
	// alert(1);
	// currentRecord.selectLine({
	// sublistId : 'line',
	// line : 0
	// });
	// alert(1);
	// currentRecord.setCurrentSublistValue({
	// sublistId : 'line',
	// fieldId : 'custcol_cseg_cn_cfi',
	// value : '1'
	// });
	// alert(1);
	// currentRecord.commitLine({
	// sublistId : 'line'
	// });
	// alert(1);
	// return false;
	// }
	return {
		fieldChanged : fieldChanged,
		pageInit : pageInit
	// ,
	// saveRecord : saveRecord
	};
});
