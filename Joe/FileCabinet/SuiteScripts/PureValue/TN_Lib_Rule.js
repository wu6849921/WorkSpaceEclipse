/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 01 Jul 2016 Zed
 * 
 */
triggernamespace('trigger.rule');
var common = new trigger.common();
var config = new trigger.config();

trigger.rule = function() {

	var buildCustomerFilterColumns = function(locationid) {
		var fields = config.getCustomerFields();
		var filters = [];
		// filters.push(new nlobjSearchFilter('custitem_tn_tobeupdate', null,
		// 'is', 'T'));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		if (locationid) {
			filters.push(new nlobjSearchFilter('custentity_tn_warehouse', null, 'is', locationid));
		}
		var columns = [];
		for (var i = 0; i < fields.length; i++) {
			columns[i] = new nlobjSearchColumn(fields[i].id);
		}
		return [ filters, columns ];
	};

	var buildInventoryStatusFilterColumns = function(itemid, locationid) {
		var fields = config.getItemInventoryFields();
		var filters = [];
		// filters.push(new
		// nlobjSearchFilter('custitem_tn_pricetobeupdate','custrecord_tn_pqp_productno','is','T'));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		// filters.push(new
		// nlobjSearchFilter('custrecord_tn_pqp_standardprice',null,'is','T'));
		filters.push(new nlobjSearchFilter('internalid', null, 'is', itemid));
		filters.push(new nlobjSearchFilter('inventorylocation', null, 'is', locationid));
		var columns = [];
		for (var i = 0; i < fields.length; i++) {
			if (fields[i].id == 'quantityavailable') {
				columns[i] = new nlobjSearchColumn('locationquantityavailable');
			} else {
				columns[i] = new nlobjSearchColumn(fields[i].id);
			}
		}
		return [ filters, columns ];
	};

	var buildItemFilterColumns = function() {
		var fields = config.getItemFields();
		var filters = [];
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var columns = [];
		for (var i = 0; i < fields.length; i++) {
			columns[i] = new nlobjSearchColumn(fields[i].id);
		}
		return [ filters, columns ];
	};

	var buildSalesrepFilterColumns = function() {

	};

	var buildPromotionlistFilterColumns = function() {
		var fields = config.getPromotionlistFields();
		var filters = [];
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var columns = [];
		for (var i = 0; i < fields.length; i++) {
			columns[i] = new nlobjSearchColumn(fields[i].id);
		}
		return [ filters, columns ];
	};

	var buildLocationmanagementFilterColumns = function() {
		var fields = config.getLocationlistFields();
		var filters = [];
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var columns = [];
		for (var i = 0; i < fields.length; i++) {
			columns[i] = new nlobjSearchColumn(fields[i].id);
		}
		return [ filters, columns ];
	};

	var buildItemCategorylistFilterColumns = function() {
		var fields = config.getItemcategoryFields();
		var filters = [];
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var columns = [];
		for (var i = 0; i < fields.length; i++) {
			columns[i] = new nlobjSearchColumn(fields[i].id);
		}
		return [ filters, columns ];
	};

	var buildEmployeeFilterColumns = function() {
		var fields = config.getEmployeeFields();
		var filters = [];
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var columns = [];
		for (var i = 0; i < fields.length; i++) {
			columns[i] = new nlobjSearchColumn(fields[i].id);
		}
		return [ filters, columns ];
	};

	var buildContactlistFilterColumns = function() {
		var fields = config.getContactFields();
		var filters = [];
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var columns = [];
		for (var i = 0; i < fields.length; i++) {
			columns[i] = new nlobjSearchColumn(fields[i].id);
		}
		return [ filters, columns ];
	};

	var buildWarehouseListFilterColumns = function() {
		var fields = config.getWarehouseFields();
		var filters = [];
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var columns = [];
		for (var i = 0; i < fields.length; i++) {
			columns[i] = new nlobjSearchColumn(fields[i].id);
		}
		return [ filters, columns ];
	};

	this.buildFilterColumns = function(type, arr) {
		var rt;
		if (type == 'customer') {
			rt = buildCustomerFilterColumns(arr[0]);
			return rt;
		} else if (type == 'inventorystatus') {
			rt = buildInventoryStatusFilterColumns(arr[0], arr[1]);
			return rt;
		} else if (type == 'item') {
			rt = buildItemFilterColumns();
			return rt;
		} else if (type == 'salesrep') {
			rt = buildSalesrepFilterColumns();
			return rt;
		} else if (type == 'promotionlist') {
			rt = buildPromotionlistFilterColumns();
			return rt;
		} else if (type == 'locationmangementlist') {
			rt = buildLocationmanagementFilterColumns();
			return rt;
		} else if (type == 'itemcategorylist') {
			rt = buildItemCategorylistFilterColumns();
			return rt;
		} else if (type == 'employee') {
			rt = buildEmployeeFilterColumns();
			return rt;
		} else if (type == 'contact') {
			rt = buildContactlistFilterColumns();
			return rt;
		} else if (type == 'warehouse') {
			rt = buildWarehouseListFilterColumns();
			return rt;
		}
	};
};
