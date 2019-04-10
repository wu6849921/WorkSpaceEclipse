/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define(
		[ '../../dao/cn_department_dao', '../../lib/commons' ],
		function(departmentDao, commons) {

			/**
			 * @desc initialize department.
			 * @param {object}
			 *            [field] - department field.
			 * @param {number}
			 *            [defaultDepartmentId] - department id.
			 * @param {number}
			 *            [subsidiaryId] - subsidiary id.
			 * @param {bool}
			 *            [isCreate] - initialize department from suitelet or
			 *            not.
			 */
			function initDepartment(field, defaultDepartmentId, subsidiaryId,
					isCreate) {
				if (!field) {
					return;
				}

				if (!isCreate) {
					removeAllSelectOption(field);
				}
				// init LOVs
				var rs = departmentDao.fetchDepartmentsAsDropDown({
					subsidiary : subsidiaryId
				});
				if (rs === null || rs === undefined || rs.length === 0)
					return null;

				// init a blank field
				if (!isCreate) {
					field.insertSelectOption({
						text : ' ',
						value : -1
					});
				} else {
					field.addSelectOption({
						text : ' ',
						value : -1
					});
				}

				var departmentObj = {};
				for ( var i in rs) {
					var internalid = rs[i].value;
					var namenohierarchy = rs[i].text;

					var hasDepartmentId = commons.makesure(defaultDepartmentId);
					var isSelected = hasDepartmentId ? parseInt(defaultDepartmentId) === parseInt(internalid)
							: false;

					if (isSelected) {
						departmentObj.id = internalid
						departmentObj.name = namenohierarchy
					}
					if (isCreate) {
						field.addSelectOption({
							text : namenohierarchy,
							value : internalid,
							isSelected : isSelected
						});
					} else {
						field.insertSelectOption({
							text : namenohierarchy,
							value : internalid
						});
					}
				}
				return departmentObj;
			}

			/**
			 * @desc remove all select option.
			 * @param {object}
			 *            [field] - select field.
			 */
			function removeAllSelectOption(field) {
				field.removeSelectOption({
					value : null
				});
			}

			return {
				initDepartment : initDepartment
			};

		});
