/**
 * Script Description
 * This script is having functions that can be used in other scripts.
 */

/***************************************************************************
 Copyright 锟� 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * This function is used to get Item internal Id
 * 
 * @param itemNo
 * @returns {String}
 */
function wmsse_GetItemForItemNo(itemNo, location) {
	nlapiLogExecution('DEBUG', 'wmsse_RF_GetItemForItemNo', 'Start');
	nlapiLogExecution('DEBUG', 'Input Item No', itemNo);

	var currItem = "";

	var sitemno = "";

	if (sitemno != "") {
		itemNo = sitemno;
	}

	var filters = new Array();
	filters.push(new nlobjSearchFilter('nameinternal', null, 'is', itemNo));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	if (location != null && location != '' && location != 'null')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', [
				'@NONE@', location ]));

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('itemid');
	columns[0].setSort(true);
	columns[1] = new nlobjSearchColumn('purchasedescription');

	var itemSearchResults = nlapiSearchRecord('item', null, filters, columns);

	if (itemSearchResults != null)
		// currItem = itemSearchResults[0].getValue('itemid');
		currItem = itemSearchResults[0].getId();

	var logMsg = 'Item = ' + currItem;
	nlapiLogExecution('DEBUG', 'Item Retrieved', logMsg);
	nlapiLogExecution('DEBUG', 'wmsse_RF_GetItemForItemNo', 'End');
	// Nullify the objects.
	itemSearchResults = null;
	filters = null;
	columns = null;
	return currItem;
}

/**
 * This function is used to get Item internal Id
 * 
 * @param itemNo
 * @returns {String}
 */
function wmsse_GetItemIdWithNameForItemNo(itemNo, location) {
	nlapiLogExecution('DEBUG', 'wmsse_GetItemIdWithNameForItemNo', 'Start');
	nlapiLogExecution('DEBUG', 'Input Item No', itemNo);

	var currItem = new Array();

	var sitemno = "";

	if (sitemno != "") {
		itemNo = sitemno;
	}

	var filters = new Array();
	filters.push(new nlobjSearchFilter('nameinternal', null, 'is', itemNo));
	// filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	if (location != null && location != '' && location != 'null')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', [
				'@NONE@', location ]));

	var columns = new Array();
	/*
	 * columns[0] = new nlobjSearchColumn('itemid'); columns[0].setSort(true);
	 * columns[1] = new nlobjSearchColumn('purchasedescription');
	 */
	var itemSearchResults = nlapiSearchRecord('item',
			'customsearch_wmsse_validitem_name_srh', filters, columns);

	if (itemSearchResults != null && itemSearchResults != '') {
		for (var k = 0; k < itemSearchResults.length; k++) {
			var vItemActualName = itemSearchResults[k].getValue('itemid');
			// if(vItemActualName == itemNo)
			// {
			currItem.push(itemSearchResults[k].getId());
			currItem.push(itemSearchResults[k].getValue('itemid'));
			break;
			// }

		}

	}

	var logMsg = 'Item = ' + currItem;
	nlapiLogExecution('DEBUG', 'Item Retrieved', logMsg);
	nlapiLogExecution('DEBUG', 'wmsse_GetItemIdWithNameForItemNo', 'End');
	// Nullify the objects.
	itemSearchResults = null;
	filters = null;
	columns = null;
	return currItem;
}

/**
 * This function is used to get item id with scanned UPC code.
 * 
 * @param itemNo
 * @param location
 * @returns {String}
 */
function wmsse_GetItemBasedOnUPCCode(itemNo, location) {
	nlapiLogExecution('DEBUG', 'wmsse_RF_GetItemBasedOnUPCCode', 'Start');

	var currItem = "";

	var filters = new Array();
	filters.push(new nlobjSearchFilter('upccode', null, 'is', itemNo));
	if (location != null && location != '' && location != 'null')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', [
				'@NONE@', location ]));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	// var columns = new Array();
	// columns.push(new nlobjSearchColumn('itemid'));
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('itemid');
	columns[0].setSort(true);
	columns[1] = new nlobjSearchColumn('purchasedescription');
	var itemSearchResults = nlapiSearchRecord('item', null, filters, columns);

	if (itemSearchResults != null)
		currItem = itemSearchResults[0].getId();

	var logMsg = 'Item = ' + currItem;
	nlapiLogExecution('DEBUG', 'Item Retrieved', logMsg);
	nlapiLogExecution('DEBUG', 'wmsse_RF_GetItemBasedOnUPCCode', 'End');
	// Nullify the objects.
	itemSearchResults = null;
	filters = null;
	columns = null;
	return currItem;
}

/**
 * This function is used to get item id with scanned UPC code.
 * 
 * @param itemNo
 * @param location
 * @returns {String}
 */
function wmsse_GetItemIdWithNameBasedOnUPCCode(itemNo, location) {
	nlapiLogExecution('DEBUG', 'wmsse_GetItemIdWithNameBasedOnUPCCode', 'Start');

	var currItem = new Array();

	var filters = new Array();
	filters.push(new nlobjSearchFilter('upccode', null, 'is', itemNo));
	if (location != null && location != '' && location != 'null')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', [
				'@NONE@', location ]));
	// filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	// var columns = new Array();
	// columns.push(new nlobjSearchColumn('itemid'));
	var columns = new Array();
	/*
	 * columns[0] = new nlobjSearchColumn('itemid'); columns[0].setSort(true);
	 * columns[1] = new nlobjSearchColumn('purchasedescription');
	 */
	var itemSearchResults = nlapiSearchRecord('item',
			'customsearch_wmsse_validitem_name_srh', filters, columns);

	if (itemSearchResults != null) {
		currItem.push(itemSearchResults[0].getId());
		currItem.push(itemSearchResults[0].getValue('itemid'));
	}

	var logMsg = 'Item = ' + currItem;
	nlapiLogExecution('DEBUG', 'Item Retrieved', logMsg);
	nlapiLogExecution('DEBUG', 'wmsse_GetItemIdWithNameBasedOnUPCCode', 'End');
	// Nullify the objects.
	itemSearchResults = null;
	filters = null;
	columns = null;
	return currItem;
}

/**
 * This function gets PO line details for selected item.
 * 
 * @param poID
 * @param itemID
 * @param trantype
 * @returns {String}
 */
function wmsse_GetPOLineDetailsForItem(poID, itemID, trantype) {
	nlapiLogExecution('DEBUG', 'wmsse_RF_GetPOLineDetailsForItem', 'Start');
	var logMsg = 'PO ID = ' + poID + '<br>';
	logMsg = logMsg + 'Item ID = ' + itemID;
	nlapiLogExecution('DEBUG', 'Input Parameters', logMsg);

	if (trantype == '' || trantype == null || trantype == 'null'
			|| trantype == 'undefined')
		trantype = 'purchaseorder';

	var RoleLocation = getRoledBasedLocation();
	nlapiLogExecution('DEBUG', 'RoleLocation', RoleLocation);
	var filters = new Array();
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('tranid', null, 'is', poID));
	filters.push(new nlobjSearchFilter('item', null, 'is', itemID));
	if (RoleLocation != null && RoleLocation != '' && RoleLocation != 0) {

		RoleLocation.push('@NONE@');

		filters.push(new nlobjSearchFilter('location', null, 'anyof',
				RoleLocation));
	}

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('item');
	columns[1] = new nlobjSearchColumn('line');

	columns[2] = new nlobjSearchColumn('line');
	columns[3] = new nlobjSearchColumn('location');
	columns[4] = new nlobjSearchColumn('quantity');
	columns[5] = new nlobjSearchColumn('quantityshiprecv');
	var poLineSearchResults = nlapiSearchRecord(trantype, null, filters,
			columns);

	if (poLineSearchResults != null && poLineSearchResults.length > 0)
		nlapiLogExecution('DEBUG', 'No. of PO Lines Retrieved',
				poLineSearchResults.length);

	nlapiLogExecution('DEBUG', 'wmsse_RF_GetPOLineDetailsForItem', 'End');
	// Nullify the objects.
	RoleLocation = null;
	filters = null;
	columns = null;
	return poLineSearchResults;
}

/**
 * This function gets Role based locations list.
 * 
 * @returns {String}
 */
function getRoledBasedLocation() {

	var subs = nlapiGetContext().getFeature('subsidiaries');
	nlapiLogExecution('ERROR', 'subs', subs);
	nlapiLogExecution('ERROR', 'test', 'test');
	if (subs != null && subs != '' && subs == true) {
		var vRoleLocation = new Array();
		var context = nlapiGetContext();
		var vSubsid = context.getSubsidiary();
		var vRoleid = context.getRole();
		nlapiLogExecution('Debug', 'vRoleid', vRoleid);
		var vRoleSubsidArray = new Array();
		if (vRoleid != null && vRoleid != '') {
			var vRolefilters = new Array();

			if (vRoleid != null && vRoleid != '')
				vRolefilters.push(new nlobjSearchFilter('internalid', null,
						'anyof', vRoleid));
			vRolefilters.push(new nlobjSearchFilter('isinactive', null, 'is',
					'F'));
			var vRoleColumns = new Array();
			vRoleColumns.push(new nlobjSearchColumn('name'));
			vRoleColumns.push(new nlobjSearchColumn('subsidiaries'));
			var vRolesearchresults = nlapiSearchRecord('Role', null,
					vRolefilters, vRoleColumns);
			if (vRolesearchresults != null && vRolesearchresults != ''
					&& vRolesearchresults.length > 0) {
				for (var i = 0; i < vRolesearchresults.length; i++) {
					var vnRoleSubsid = vRolesearchresults[i]
							.getValue('subsidiaries');
					vRoleSubsidArray.push(vnRoleSubsid);
				}
			}
		}
		nlapiLogExecution('Debug', 'vRoleSubsidArray', vRoleSubsidArray);
		var vEmpRoleLocation = context.getLocation();
		nlapiLogExecution('Debug', 'vEmpRoleLocation', vEmpRoleLocation);
		var filters = new Array();
		if (vRoleSubsidArray != null && vRoleSubsidArray != '')
			filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof',
					vRoleSubsidArray));
		else if (vSubsid != null && vSubsid != '') {
			filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof',
					vSubsid));
		}

		if (vEmpRoleLocation != null && vEmpRoleLocation != ''
				&& vEmpRoleLocation != 0) {

			var vLocname = nlapiLookupField('location', vEmpRoleLocation,
					'name');
			nlapiLogExecution('ERROR', 'vLocname', vLocname);
			// var filters = new Array();
			var columns = new Array();

			filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site',
					null, 'is', 'T'));
			filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

			columns.push(new nlobjSearchColumn('name'));
			columns.push(new nlobjSearchColumn('namenohierarchy'))
			columns.push(new nlobjSearchColumn('formulatext'));
			columns[2]
					.setFormula('SUBSTR({name},0, LENGTH({name}) - LENGTH({namenohierarchy}) -3)'); // -3
																									// is
																									// selected
																									// to
																									// represent
																									// the
																									// 锟� :
																									// 锟�
																									// in
																									// the
																									// namenohierarchy
																									// field
			columns.push(new nlobjSearchColumn('subsidiary'));

			var x = nlapiSearchRecord('location', null, filters, columns);
			for (var i = 0; x != null && i < x.length; i++) {
				var searchresult = x[i];

				var loc_name = searchresult.getValue('name');
				var loc_nohier = searchresult.getValue('namenohierarchy');
				var loc_subs = searchresult.getValue(columns[2]); // Parent
				var loc_id = searchresult.getId(); // Parent
				var loc_subsidary = searchresult.getValue('subsidiary');
				// nlapiLogExecution('DEBUG','LOG', loc_name + "\nNo Hierarchy:
				// " + loc_nohier + "\nParent" + loc_subs);
				// nlapiLogExecution('ERROR', 'loc_id', loc_id);
				// nlapiLogExecution('ERROR', 'vEmpRoleLocation',
				// vEmpRoleLocation);

				if ((loc_subs != null && loc_subs != '')
						&& (vLocname == loc_subs))
					vRoleLocation.push(loc_id);
			}

		}

		// if(vEmpRoleLocation!=null && vEmpRoleLocation!='')
		// filters.push(new nlobjSearchFilter('internalid', null, 'is',
		// vEmpRoleLocation));

		filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site',
				null, 'is', 'T'));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var searchresults = nlapiSearchRecord('location', null, filters, null);
		if (searchresults != null && searchresults != '') {
			// var vRoleLocation=new Array();
			for (var k = 0; k < searchresults.length; k++) {
				vRoleLocation.push(searchresults[k].getId());
			}
			return vRoleLocation;
		} else
			return '-1';
	} else {

		var vMultiSite = true;
		var context = nlapiGetContext();
		var vRoleLocation = new Array();
		var emplocation = context.getLocation();
		vRoleLocation.push(emplocation);

		var vLocname = nlapiLookupField('location', emplocation, 'name');
		nlapiLogExecution('ERROR', 'vLocname', vLocname);
		var filters = new Array();
		var columns = new Array();

		filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site',
				null, 'is', 'T'));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		columns.push(new nlobjSearchColumn('name'));
		columns.push(new nlobjSearchColumn('namenohierarchy'))
		columns.push(new nlobjSearchColumn('formulatext'));
		columns[2]
				.setFormula('SUBSTR({name},0, LENGTH({name}) - LENGTH({namenohierarchy}) -3)'); // -3
																								// is
																								// selected
																								// to
																								// represent
																								// the
																								// 锟� :
																								// 锟�
																								// in
																								// the
																								// namenohierarchy
																								// field

		var locationSearchResults = nlapiSearchRecord('location', null,
				filters, columns);
		for (var locItr = 0; locationSearchResults != null
				&& locItr < locationSearchResults.length; locItr++) {
			var searchresult = locationSearchResults[locItr];

			var loc_name = searchresult.getValue('name');
			var loc_nohier = searchresult.getValue('namenohierarchy');
			var loc_subs = searchresult.getValue(columns[2]); // Parent
			var loc_id = searchresult.getId(); // Parent
			// nlapiLogExecution('DEBUG','LOG', loc_name + "\nNo Hierarchy: " +
			// loc_nohier + "\nParent" + loc_subs);
			// nlapiLogExecution('ERROR', 'loc_id', loc_id);
			// nlapiLogExecution('ERROR', 'vEmpRoleLocation', vEmpRoleLocation);

			// if((loc_subs!=null && loc_subs!='') && (vLocname==loc_subs))
			vRoleLocation.push(loc_id);
		}

		if (vRoleLocation == null || vRoleLocation == '' || vRoleLocation == 0) {
			for (var intItr = 0; locationSearchResults != null
					&& intItr < locationSearchResults.length; intItr++) {
				var searchResults = locationSearchResults[intItr];
				var locationId = searchResults.getId();
				vRoleLocation.push(locationId);
			}

		}

		if (vMultiSite == true) {
			nlapiLogExecution('ERROR', 'vRoleLocation', vRoleLocation);
			return vRoleLocation;

		} else
			return null;
	}
}

/**
 * This function is used to validate selected item
 * 
 * @param itemNo
 * @param location
 * @param company
 * @param poid
 * @returns
 */
function validateSKU(itemNo, location, company, poid) {
	nlapiLogExecution('ERROR', 'validateSKU', 'Start');

	var inputParams = 'Item = ' + itemNo + '<br>';
	inputParams = inputParams + 'Location = ' + location + '<br>';
	inputParams = inputParams + 'Company = ' + company + '<br>';
	;
	inputParams = inputParams + 'PO Id = ' + poid;
	nlapiLogExecution('ERROR', 'Input Parameters', inputParams);

	var currItem = wmsse_GetItemForItemNo(itemNo, location);

	if (currItem == "") {
		currItem = wmsse_GetItemBasedOnUPCCode(itemNo, location);
	}
	if (currItem == "") {
		currItem = wmsse_GetItemBasedOnItemAlias(itemNo, location);
	}
	var logMsg = "";
	if (currItem == "") {
		logMsg = 'Unable to retrieve item';
		currItem = null;
	} else {
		logMsg = 'Item = ' + currItem;
	}

	nlapiLogExecution('ERROR', 'Item Retrieved', logMsg);
	nlapiLogExecution('ERROR', 'validateSKU', 'End');
	return currItem;
}

/**
 * This function is used to validate selected item
 * 
 * @param itemNo
 * @param location
 * @param company
 * @param poid
 * @returns
 */
function getSKUIdWithName(itemNo, location, company, poid) {
	nlapiLogExecution('ERROR', 'getSKUIdWithName', 'Start');

	var inputParams = 'Item = ' + itemNo + '<br>';
	inputParams = inputParams + 'Location = ' + location + '<br>';
	inputParams = inputParams + 'Company = ' + company + '<br>';
	;
	inputParams = inputParams + 'PO Id = ' + poid;
	nlapiLogExecution('ERROR', 'Input Parameters', inputParams);

	var currItem = wmsse_GetItemIdWithNameForItemNo(itemNo, location);

	if (currItem == "") {
		currItem = wmsse_GetItemIdWithNameBasedOnUPCCode(itemNo, location);
	}
	if (currItem == "") {
		currItem = wmsse_GetItemIdWithNameBasedOnItemAlias(itemNo, location);
	}
	var logMsg = "";
	if (currItem == "") {
		logMsg = 'Unable to retrieve item';
		currItem = null;
	} else {
		logMsg = 'Item = ' + currItem;
	}

	nlapiLogExecution('ERROR', 'Item Retrieved', logMsg);
	nlapiLogExecution('ERROR', 'getSKUIdWithName', 'End');
	return currItem;
}

function wmsse_GetItemBasedOnItemAlias(itemNo, location) {
	var actItem = '';
	var skuAliasFilters = new Array();
	skuAliasFilters.push(new nlobjSearchFilter('name', null, 'is', itemNo));

	if (location != null && location != '')
		skuAliasFilters.push(new nlobjSearchFilter(
				'custrecord_wmsse_alias_location', null, 'anyof', [ '@NONE@',
						location ]));

	skuAliasFilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

	var skuAliasCols = new Array();
	skuAliasCols[0] = new nlobjSearchColumn('custrecord_wmsse_alias_item');

	var skuAliasResults = nlapiSearchRecord('customrecord_wmsse_sku_alias',
			null, skuAliasFilters, skuAliasCols);

	if (skuAliasResults != null)
		actItem = skuAliasResults[0].getValue('custrecord_wmsse_alias_item');

	var logMsg = 'Item = ' + actItem;
	nlapiLogExecution('DEBUG', 'Item Retrieved', logMsg);
	nlapiLogExecution('DEBUG', 'wmsse_GetItemBasedOnItemAlias', 'End');

	return actItem;
}

function wmsse_GetItemIdWithNameBasedOnItemAlias(itemNo, location) {
	nlapiLogExecution('DEBUG', 'wmsse_GetItemIdWithNameBasedOnItemAlias',
			'Start');
	var actItem = new Array();
	var skuAliasFilters = new Array();
	skuAliasFilters.push(new nlobjSearchFilter('name', null, 'is', itemNo));

	if (location != null && location != '')
		skuAliasFilters.push(new nlobjSearchFilter(
				'custrecord_wmsse_alias_location', null, 'anyof', [ '@NONE@',
						location ]));

	// skuAliasFilters.push(new nlobjSearchFilter('isinactive', null, 'is',
	// 'F'));

	var skuAliasCols = new Array();
	// skuAliasCols[0] = new nlobjSearchColumn('custrecord_wmsse_alias_item');

	var skuAliasResults = nlapiSearchRecord('customrecord_wmsse_sku_alias',
			'customsearch_wmsse_itemalias_validate', skuAliasFilters,
			skuAliasCols);

	if (skuAliasResults != null) {
		actItem
				.push(skuAliasResults[0]
						.getValue('custrecord_wmsse_alias_item'));
		actItem.push(skuAliasResults[0].getText('custrecord_wmsse_alias_item'));
	}

	var logMsg = 'Item = ' + actItem;
	nlapiLogExecution('DEBUG', 'Item Retrieved', logMsg);
	nlapiLogExecution('DEBUG', 'wmsse_GetItemIdWithNameBasedOnItemAlias', 'End');

	return actItem;
}

/**
 * This function is used to get Item type
 * 
 * @param itemNo
 * @param location
 * @returns
 */
function nswms_GetItemType(itemNo, location) {
	nlapiLogExecution('DEBUG', 'nswms_GetItemTypeForItemNo', 'Start');
	nlapiLogExecution('DEBUG', 'Input Item No', itemNo);

	var itemType = "";

	var vfilter = new Array();
	vfilter[0] = new nlobjSearchFilter("internalid", null, "anyof", itemNo);
	var vcolumn = new Array();
	// vcolumn[0]=new nlobjSearchColumn("type");

	var searchres = nlapiSearchRecord('item',
			'customsearch_wmsse_itemtype_srh', vfilter, vcolumn);
	if (searchres != null && searchres != "") {
		itemType = searchres[0].recordType;
	}

	var logMsg = 'ItemType = ' + itemType;
	nlapiLogExecution('DEBUG', 'ItemType Retrieved', logMsg);
	nlapiLogExecution('DEBUG', 'nswms_GetItemTypeForItemNo', 'End');

	return itemType;
}
/**
 * This function is used to get Item type,Stock units and Units type
 * 
 * @param itemNo
 * @param location
 * @returns
 */
function nswms_GetItemTypedetails(itemNo, location) {
	nlapiLogExecution('DEBUG', 'nswms_GetItemTypeForItemNo', itemNo);
	// nlapiLogExecution('DEBUG', 'Input Item No', itemNo);

	var itemTypedetails = "";

	var vfilter = new Array();
	vfilter[0] = new nlobjSearchFilter("internalid", null, "anyof", itemNo);
	var vcolumn = new Array();
	// vcolumn[0]=new nlobjSearchColumn("type");

	var itemTypedetails = nlapiSearchRecord('item',
			'customsearch_wmsse_itemtypedetails_srh', vfilter, vcolumn);

	// nlapiLogExecution('DEBUG', 'nswms_GetItemTypeForItemNo', 'End');

	return itemTypedetails;
}
/**
 * This function is used to post item receipt
 * 
 * @param trantype
 * @param poInternalId
 * @param FetchedItemId
 * @param poLineno
 * @param enterQty
 * @param enterBin
 * @param itemType
 * @param whLocation
 * @param batchno
 * @param expiryDate
 * @param fifoDate
 * @param poname
 * @param PutStrategy
 * @param zoneno
 * @param actualBeginTime
 * @param customer
 * @returns {String}
 */
function nswms_PostItemReceipt(trantype, poInternalId, FetchedItemId, poLineno,
		enterQty, enterBin, itemType, whLocation, batchno, expiryDate,
		fifoDate, poname, PutStrategy, zoneno, actualBeginTime, customer, uom,
		conversionRate, TOLineDetails, lineFullQty, useitemcostflag,
		vInvStatus_select, barcodestring) {

	var logMsg = 'itemType = ' + itemType + '<br>';
	logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
	logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
	logMsg = logMsg + 'trantype = ' + trantype + '<br>';
	logMsg = logMsg + 'poInternalId = ' + poInternalId + '<br>';
	logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
	logMsg = logMsg + 'poLineno = ' + poLineno + '<br>';
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'batchno = ' + batchno + '<br>';
	logMsg = logMsg + 'expiryDate = ' + expiryDate + '<br>';
	logMsg = logMsg + 'actualBeginTime = ' + actualBeginTime + '<br>';
	logMsg = logMsg + 'customer = ' + customer + '<br>';
	logMsg = logMsg + 'uom = ' + uom + '<br>';
	logMsg = logMsg + 'conversionRate = ' + conversionRate + '<br>';
	logMsg = logMsg + 'TOLineDetails = ' + TOLineDetails + '<br>';
	logMsg = logMsg + 'lineFullQty = ' + lineFullQty + '<br>';
	logMsg = logMsg + 'useitemcostflag = ' + useitemcostflag + '<br>';
	logMsg = logMsg + 'barcodestring = ' + barcodestring + '<br>';
	nlapiLogExecution('ERROR', 'Processing nswms_PostItemReceipt', logMsg);

	var idl = "";

	var vCurrCompRecLine = 0;
	var systemRule = getSystemRuleValue('Manually post item receipts?',
			whLocation);
	nlapiLogExecution('ERROR', 'systemRule', systemRule);

	if (systemRule == null || systemRule == '' || systemRule == 'N') {
		/*
		 * if(trantype=="transferorder") poLineno=parseFloat(poLineno)-2;
		 */
		var itemindex = 1;
		if (trantype == "transferorder") {
			if (itemType == "serializedinventoryitem"
					|| itemType == "serializedassemblyitem") {
				var lineFullQty = 0;
				var filts = new Array();
				if (poInternalId != null && poInternalId != 'null'
						&& poInternalId != undefined && poInternalId != '')
					filts.push(new nlobjSearchFilter('internalid', null, 'is',
							poInternalId));
				filts.push(new nlobjSearchFilter('type', null, 'anyof',
						'TrnfrOrd'));
				if (poLineno != null && poLineno != 'null'
						&& poLineno != undefined && poLineno != '')
					filts.push(new nlobjSearchFilter('line', null, 'equalto',
							(parseFloat(poLineno) - 1)));
				filts.push(new nlobjSearchFilter('quantityshiprecv', null,
						'notequalto', 0));
				var cols = new Array();
				cols.push(new nlobjSearchColumn('quantityshiprecv'));

				var TOLineDtls = new nlapiSearchRecord('transferorder', null,
						filts, cols);

				if (TOLineDtls != null && TOLineDtls != ''
						&& TOLineDtls != 'null' && TOLineDtls != 'undefined') {
					lineFullQty = TOLineDtls[0].getValue('quantityshiprecv');
				}

				var filters = new Array();
				var trecord = '';
				if (poInternalId != null && poInternalId != 'null'
						&& poInternalId != undefined && poInternalId != '')
					filters.push(new nlobjSearchFilter('internalid', null,
							'is', poInternalId));
				filters
						.push(new nlobjSearchFilter('formulatext', null, 'is',
								'Shipping')
								.setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
				filters.push(new nlobjSearchFilter('type', null, 'anyof',
						'TrnfrOrd'));
				if (poLineno != null && poLineno != 'null'
						&& poLineno != undefined && poLineno != '')
					filters.push(new nlobjSearchFilter('line', null, 'equalto',
							(parseFloat(poLineno) - 1)));
				var TOLineDetails = new nlapiSearchRecord('transferorder',
						'customsearch_wmsse_transf_fulfill_detail', filters,
						null);
				nlapiLogExecution('ERROR', 'TOLineDetails', TOLineDetails);
			}
			var vitemfulfillmentid = '';
			var qtyEntered = enterQty;
			if (TOLineDetails != null && TOLineDetails != 'null'
					&& TOLineDetails != undefined && TOLineDetails != ''
					&& TOLineDetails.length > 0) {
				nlapiLogExecution('ERROR', 'TOLineDetails',
						TOLineDetails.length);
				var remainingqty = 0;
				for (var d = 0; d < TOLineDetails.length; d++) {
					try {
						nlapiLogExecution('ERROR', 'd', d);
						vitemfulfillmentid = TOLineDetails[d];
						if (itemType == "serializedinventoryitem"
								|| itemType == "serializedassemblyitem") {
							vitemfulfillmentid = TOLineDetails[d].getValue(
									'internalid', 'fulfillingTransaction',
									'group');
						}
						nlapiLogExecution('ERROR', 'vitemfulfillmentid',
								vitemfulfillmentid);

						if (vitemfulfillmentid != null
								&& vitemfulfillmentid != 'null'
								&& vitemfulfillmentid != undefined
								&& vitemfulfillmentid != '') {
							trecord = nlapiTransformRecord(trantype,
									poInternalId, 'itemreceipt', {
										'itemfulfillment' : vitemfulfillmentid
									});
							nlapiLogExecution('ERROR', 'trecord', trecord);

							var polinelength = trecord.getLineItemCount('item');
							nlapiLogExecution('ERROR', 'polinelength',
									polinelength);
							for (var j = 0; j < polinelength; j++) {
								var item_id = trecord.getLineItemValue('item',
										'item', j + 1);
								var itemrec = trecord.getLineItemValue('item',
										'itemreceive', j + 1);
								var itemLineNo = trecord.getLineItemValue(
										'item', 'line', j + 1);
								var itemQuantity = trecord.getLineItemValue(
										'item', 'quantity', j + 1);
								nlapiLogExecution('ERROR', 'itemQuantity',
										itemQuantity);
								if ((itemQuantity == null || itemQuantity == ''
										|| itemQuantity == 'null' || itemQuantity == 0)
										&& useitemcostflag == 'F')
									itemQuantity = enterQty;

								// if inventory status flag is enabled.
								var opentaskSearchResults = getopentaskresultsforIRPosting(
										poInternalId, null, -1, item_id,
										itemLineNo);

								if (opentaskSearchResults != null
										&& opentaskSearchResults != ''
										&& opentaskSearchResults.length > 0) {
									var totalLineQty = 0;
									for (var tempItr = 0; tempItr < opentaskSearchResults.length; tempItr++) {
										var enterQty = opentaskSearchResults[tempItr][2];
										var toLineno = opentaskSearchResults[tempItr][0];
										nlapiLogExecution('ERROR',
												'toLineno,enterQty', toLineno
														+ ',' + enterQty);
										if (parseFloat(toLineno) == parseFloat(itemLineNo))
											totalLineQty = parseFloat(totalLineQty)
													+ parseFloat(enterQty);
									}
									enterQty = parseFloat(totalLineQty);
									nlapiLogExecution('ERROR', 'totalLineQty',
											totalLineQty);
								}

								// end when inventory status is enabled.
								nlapiLogExecution('ERROR',
										'itemLineNo,poLineno', itemLineNo + ","
												+ poLineno);
								nlapiLogExecution('ERROR',
										'itemQuantity,enterQty', itemQuantity
												+ "," + enterQty);
								var enterQty1 = 0;
								if ((parseInt(itemLineNo) == parseInt(poLineno))
										&& ((parseFloat(itemQuantity) == parseFloat(enterQty)) || (parseFloat(lineFullQty) == parseFloat(enterQty)))) {
									itemindex = j + 1;
									enterQty1 = parseFloat(itemQuantity);

									nlapiLogExecution('ERROR', 'itemindex',
											itemindex);
									trecord.selectLineItem('item', itemindex);
									trecord.setCurrentLineItemValue('item',
											'itemreceive', 'T');
									trecord.setCurrentLineItemValue('item',
											'quantity', enterQty1);

									trecord.setCurrentLineItemValue('item',
											'location', whLocation);

									if (itemType == "lotnumberedinventoryitem"
											|| itemType == "lotnumberedassemblyitem") {
										// trecord.setCurrentLineItemValue('item',
										// 'binnumber', enterBin);
										var compSubRecord = trecord
												.editCurrentLineItemSubrecord(
														'item',
														'inventorydetail');
										nlapiLogExecution('ERROR',
												'compSubRecord', compSubRecord);
										if (compSubRecord == ''
												|| compSubRecord == null) {
											nlapiLogExecution('ERROR',
													'compSubRecord',
													'inside null');
											compSubRecord = trecord
													.createCurrentLineItemSubrecord(
															'item',
															'inventorydetail');
											nlapiLogExecution('ERROR',
													'compSubRecord',
													compSubRecord);
										}
										var complinelength = compSubRecord
												.getLineItemCount('inventoryassignment');
										nlapiLogExecution('ERROR',
												'complinelength',
												complinelength);
										if (parseInt(complinelength) > 0) {
											for (var r1 = 1; r1 <= complinelength; r1++) {
												compSubRecord.removeLineItem(
														'inventoryassignment',
														1);
											}
										}
										compSubRecord
												.selectNewLineItem('inventoryassignment');
										compSubRecord.setCurrentLineItemValue(
												'inventoryassignment',
												'quantity', enterQty1);
										compSubRecord.setCurrentLineItemValue(
												'inventoryassignment',
												'receiptinventorynumber',
												batchno);
										if (enterBin != null && enterBin != ""
												&& enterBin != 'null')
											compSubRecord
													.setCurrentLineItemValue(
															'inventoryassignment',
															'binnumber',
															enterBin);
										nlapiLogExecution('ERROR',
												'expiryDate', expiryDate);
										if (expiryDate != null
												&& expiryDate != ""
												&& expiryDate != 'null')
											compSubRecord
													.setCurrentLineItemValue(
															'inventoryassignment',
															'expirationdate',
															expiryDate);

										if (vInvStatus_select != null
												&& vInvStatus_select != ""
												&& vInvStatus_select != 'null'
												&& vInvStatus_select != undefined)
											compSubRecord
													.setCurrentLineItemValue(
															'inventoryassignment',
															'inventorystatus',
															vInvStatus_select);

										compSubRecord
												.commitLineItem('inventoryassignment');
										compSubRecord.commit();
									} else if (itemType == "inventoryitem"
											|| itemType == "assemblyitem") {
										nlapiLogExecution('ERROR',
												'enterBin,enterQty1', enterBin
														+ ',' + enterQty1);
										/*
										 * if(enterBin!=null && enterBin!="" &&
										 * enterBin!='null')
										 * trecord.setCurrentLineItemValue('item',
										 * 'binnumber', enterBin);
										 */
										if (vInvStatus_select != null
												&& vInvStatus_select != '') {
											var compSubRecord = trecord
													.editCurrentLineItemSubrecord(
															'item',
															'inventorydetail');
											nlapiLogExecution('ERROR',
													'compSubRecord',
													compSubRecord);
											if (compSubRecord == ''
													|| compSubRecord == null) {
												nlapiLogExecution('ERROR',
														'compSubRecord',
														'inside null');
												compSubRecord = trecord
														.createCurrentLineItemSubrecord(
																'item',
																'inventorydetail');
												nlapiLogExecution('ERROR',
														'compSubRecord',
														compSubRecord);
											}
											var complinelength = compSubRecord
													.getLineItemCount('inventoryassignment');
											nlapiLogExecution('ERROR',
													'complinelength',
													complinelength);
											if (parseInt(complinelength) > 0) {
												for (var r1 = 1; r1 <= complinelength; r1++) {
													compSubRecord
															.removeLineItem(
																	'inventoryassignment',
																	1);
												}
											}
											compSubRecord
													.selectNewLineItem('inventoryassignment');
											compSubRecord
													.setCurrentLineItemValue(
															'inventoryassignment',
															'quantity',
															enterQty1);
											// compSubRecord.setCurrentLineItemValue('inventoryassignment',
											// 'receiptinventorynumber',
											// batchno);
											if (enterBin != null
													&& enterBin != ""
													&& enterBin != 'null')
												compSubRecord
														.setCurrentLineItemValue(
																'inventoryassignment',
																'binnumber',
																enterBin);

											if (vInvStatus_select != null
													&& vInvStatus_select != ""
													&& vInvStatus_select != 'null'
													&& vInvStatus_select != undefined)
												compSubRecord
														.setCurrentLineItemValue(
																'inventoryassignment',
																'inventorystatus',
																vInvStatus_select);

											compSubRecord
													.commitLineItem('inventoryassignment');
											compSubRecord.commit();
										} else {
											var compSubRecord = trecord
													.createCurrentLineItemSubrecord(
															'item',
															'inventorydetail');
											var complinelength = compSubRecord
													.getLineItemCount('inventoryassignment');
											// compSubRecord.selectLineItem('inventoryassignment',1);
											if (parseInt(complinelength) > 0
													&& parseInt(complinelength)
															- parseInt(vCurrCompRecLine) > 0)
												compSubRecord
														.selectLineItem(
																'inventoryassignment',
																parseInt(vCurrCompRecLine) + 1);
											else
												compSubRecord
														.selectNewLineItem('inventoryassignment');
											vCurrCompRecLine = parseInt(vCurrCompRecLine) + 1;
											compSubRecord
													.setCurrentLineItemValue(
															'inventoryassignment',
															'quantity',
															enterQty1);
											// compSubRecord.setCurrentLineItemValue('inventoryassignment',
											// 'receiptinventorynumber',
											// batchno);
											if (enterBin != null
													&& enterBin != ""
													&& enterBin != 'null')
												compSubRecord
														.setCurrentLineItemValue(
																'inventoryassignment',
																'binnumber',
																enterBin);
											compSubRecord
													.commitLineItem('inventoryassignment');
											compSubRecord.commit();
										}
									} else if (itemType == "serializedinventoryitem"
											|| itemType == "serializedassemblyitem") {
										var filterssertemp1 = new Array();

										filterssertemp1[0] = new nlobjSearchFilter(
												'custrecord_wmsse_ser_status',
												null, 'is', 'F');
										if (trantype != "transferorder") {
											filterssertemp1[1] = new nlobjSearchFilter(
													'custrecord_wmsse_ser_ordline',
													null, 'equalto', poLineno);
										} else {
											filterssertemp1[1] = new nlobjSearchFilter(
													'custrecord_wmsse_ser_ordline',
													null, 'equalto',
													parseFloat(poLineno));
										}
										filterssertemp1[2] = new nlobjSearchFilter(
												'custrecord_wmsse_ser_ordno',
												null, 'anyof', poInternalId);
										var columnssertemp1 = new Array();
										columnssertemp1[0] = new nlobjSearchColumn(
												'custrecord_wmsse_ser_no');
										columnssertemp1[1] = new nlobjSearchColumn(
												'name');
										var SrchRecordTmpSerial1 = nlapiSearchRecord(
												'customrecord_wmsse_serialentry',
												null, filterssertemp1,
												columnssertemp1);
										if (SrchRecordTmpSerial1 != null
												&& SrchRecordTmpSerial1 != "") {
											nlapiLogExecution(
													'ERROR',
													'SrchRecordTmpSerial1.length',
													SrchRecordTmpSerial1.length);
											var compSubRecord = trecord
													.editCurrentLineItemSubrecord(
															'item',
															'inventorydetail');
											nlapiLogExecution('ERROR',
													'compSubRecord',
													compSubRecord);
											if (compSubRecord == ''
													|| compSubRecord == null) {
												nlapiLogExecution('ERROR',
														'compSubRecord',
														'inside null');
												compSubRecord = trecord
														.createCurrentLineItemSubrecord(
																'item',
																'inventorydetail');
												nlapiLogExecution('ERROR',
														'compSubRecord',
														compSubRecord);
											}
											var complinelength = compSubRecord
													.getLineItemCount('inventoryassignment');
											nlapiLogExecution('ERROR',
													'complinelength',
													complinelength);
											if (parseInt(complinelength) > 0) {
												for (var r1 = 1; r1 <= complinelength; r1++) {
													compSubRecord
															.removeLineItem(
																	'inventoryassignment',
																	1);
												}
											}

											var transerresultvalues = new Array();
											var tranfilter = new Array();
											nlapiLogExecution('ERROR',
													'poInternalId',
													poInternalId);
											if (poInternalId != null
													&& poInternalId != 'null'
													&& poInternalId != undefined
													&& poInternalId != '')
												tranfilter
														.push(new nlobjSearchFilter(
																'internalid',
																null, 'is',
																poInternalId));
											nlapiLogExecution('ERROR',
													'FetchedItemId',
													FetchedItemId);
											tranfilter
													.push(new nlobjSearchFilter(
															'item', null, 'is',
															FetchedItemId));
											nlapiLogExecution('ERROR',
													'vitemfulfillmentid',
													vitemfulfillmentid);
											// tranfilter.push(new
											// nlobjSearchFilter('internalid','fulfillingTransaction','is',vitemfulfillmentid));
											// tranfilter.push(new
											// nlobjSearchFilter('serialnumber','fulfillingTransaction','is',SrchRecordTmpSerial1[n]));
											var fline = (parseFloat(poLineno) - 1);
											nlapiLogExecution('ERROR', 'fline',
													fline);
											tranfilter
													.push(new nlobjSearchFilter(
															'line', null,
															'equalto', fline));

											var tranlotresults = nlapiSearchRecord(
													'transferorder',
													'customsearch_wmsse_transf_ful_lot_detail',
													tranfilter, null);
											nlapiLogExecution('ERROR',
													'tranlotresults',
													tranlotresults);

											for (var z = 0; z < tranlotresults.length; z++) {
												var seritemfulfillmentid = tranlotresults[z]
														.getValue(
																'internalid',
																'fulfillingTransaction',
																'group');

												if (seritemfulfillmentid == vitemfulfillmentid)
													transerresultvalues
															.push(tranlotresults[z]);
											}
											nlapiLogExecution('ERROR',
													'transerresultvalues',
													transerresultvalues);
											for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {

												if (poInternalId != null
														&& poInternalId != 'null'
														&& poInternalId != undefined
														&& poInternalId != '')
													tranfilter
															.push(new nlobjSearchFilter(
																	'internalid',
																	null, 'is',
																	poInternalId));
												tranfilter
														.push(new nlobjSearchFilter(
																'item', null,
																'is',
																FetchedItemId));
												tranfilter
														.push(new nlobjSearchFilter(
																'internalid',
																'fulfillingTransaction',
																'is',
																vitemfulfillmentid));
												tranfilter
														.push(new nlobjSearchFilter(
																'serialnumber',
																'fulfillingTransaction',
																'is',
																SrchRecordTmpSerial1[n]));
												tranfilter
														.push(new nlobjSearchFilter(
																'line', null,
																'equalto',
																fline));

												var tranlotresults = nlapiSearchRecord(
														'transferorder',
														'customsearch_wmsse_transf_ful_lot_detail',
														tranfilter, null);

												if (transerresultvalues != null
														&& transerresultvalues != 'null'
														&& transerresultvalues != ''
														&& transerresultvalues.length > 0
														&& transerresultvalues
																.indexOf(SrchRecordTmpSerial1[n]
																		.getValue('custrecord_wmsse_ser_no')) == -1) {
													compSubRecord
															.selectNewLineItem('inventoryassignment');
													compSubRecord
															.setCurrentLineItemValue(
																	'inventoryassignment',
																	'quantity',
																	1);
													compSubRecord
															.setCurrentLineItemValue(
																	'inventoryassignment',
																	'receiptinventorynumber',
																	SrchRecordTmpSerial1[n]
																			.getValue('custrecord_wmsse_ser_no'));
													if (enterBin != null
															&& enterBin != ""
															&& enterBin != 'null')
														compSubRecord
																.setCurrentLineItemValue(
																		'inventoryassignment',
																		'binnumber',
																		enterBin);
													if (vInvStatus_select != null
															&& vInvStatus_select != ""
															&& vInvStatus_select != 'null'
															&& vInvStatus_select != 'undefined')
														compSubRecord
																.setCurrentLineItemValue(
																		'inventoryassignment',
																		'inventorystatus',
																		vInvStatus_select);
													compSubRecord
															.commitLineItem('inventoryassignment');
												}

											}
											compSubRecord.commit();
											nlapiLogExecution('ERROR',
													'transerresultvalues',
													'transerresultvalues');
											for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
												var TempRecord = SrchRecordTmpSerial1[j];
												nlapiLogExecution('ERROR',
														'TempRecord.getId()',
														TempRecord.getId());
												nlapiLogExecution(
														'ERROR',
														'TempRecord.getValue(name)',
														TempRecord
																.getValue('name'));
												nlapiLogExecution(
														'ERROR',
														'TempRecord.getValue(custrecord_wmsse_ser_no)',
														TempRecord
																.getValue('custrecord_wmsse_ser_no'));
												var tempSerial = nlapiLoadRecord(
														'customrecord_wmsse_serialentry',
														TempRecord.getId());
												tempSerial.setFieldValue('id',
														TempRecord.getId());
												tempSerial
														.setFieldValue(
																'name',
																TempRecord
																		.getValue('name'));
												tempSerial
														.setFieldValue(
																'custrecord_wmsse_ser_note1',
																'because of item receipt posted for serial number  we have marked this serial number as closed');
												tempSerial
														.setFieldValue(
																'custrecord_wmsse_ser_status',
																'T');
												nlapiSubmitRecord(tempSerial);
											}
										}
									}

									trecord.commitLineItem('item');

									if (trecord != null && trecord != '')
										idl = nlapiSubmitRecord(trecord);
									nlapiLogExecution('ERROR',
											'Item Receipt Id', idl);
									break;
								}
							}
						}
					} catch (e) {
						nlapiLogExecution('ERROR',
								'exception in fulfillment details');
					}
					if (idl != '' && idl != null)
						break;
				}
			}
		} else {
			// Check Intercompany Cross-Subsidiary fulfillment feature is
			// enabled or not
			var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

			var trecord = '';
			if (crossSubsidiaryFeature == true
					&& trantype == 'returnauthorization') {
				var subs = getSubsidiaryNew(whLocation);

				trecord = nlapiTransformRecord(trantype, poInternalId,
						'itemreceipt', {
							'orderinvtsub' : subs
						});
			} else {
				trecord = nlapiTransformRecord(trantype, poInternalId,
						'itemreceipt');
			}

			/*
			 * if(trantype=="transferorder") poLineno=parseFloat(poLineno)-2;
			 */
			var polinelength = trecord.getLineItemCount('item');
			nlapiLogExecution('ERROR', 'polinelength', polinelength);
			for (var j = 1; j <= polinelength; j++) {
				var item_id = trecord.getLineItemValue('item', 'item', j);
				var itemrec = trecord
						.getLineItemValue('item', 'itemreceive', j);
				var itemLineNo = trecord.getLineItemValue('item', 'line', j);
				nlapiLogExecution('ERROR', 'itemLineNo,poLineno', itemLineNo
						+ "," + poLineno);
				if (parseInt(itemLineNo) == parseInt(poLineno)) {
					itemindex = j;
					break;
				}
			}
			nlapiLogExecution('ERROR', 'Value of J', j);
			nlapiLogExecution('ERROR', 'itemindex', itemindex);
			trecord.selectLineItem('item', itemindex);
			trecord.setCurrentLineItemValue('item', 'itemreceive', 'T');
			trecord.setCurrentLineItemValue('item', 'quantity', enterQty);

			trecord.setCurrentLineItemValue('item', 'location', whLocation);

			if (itemType == "lotnumberedinventoryitem"
					|| itemType == "lotnumberedassemblyitem") {
				// trecord.setCurrentLineItemValue('item', 'binnumber',
				// enterBin);
				var compSubRecord = trecord.editCurrentLineItemSubrecord(
						'item', 'inventorydetail');
				nlapiLogExecution('ERROR', 'compSubRecord', compSubRecord);
				if (compSubRecord == '' || compSubRecord == null) {
					nlapiLogExecution('ERROR', 'compSubRecord', 'inside null');
					compSubRecord = trecord.createCurrentLineItemSubrecord(
							'item', 'inventorydetail');
					nlapiLogExecution('ERROR', 'compSubRecord', compSubRecord);
				}
				var complinelength = compSubRecord
						.getLineItemCount('inventoryassignment');
				nlapiLogExecution('ERROR', 'complinelength', complinelength);
				if (parseInt(complinelength) > 0) {
					for (var r1 = 1; r1 <= complinelength; r1++) {
						compSubRecord.removeLineItem('inventoryassignment', 1);
					}
				}
				compSubRecord.selectNewLineItem('inventoryassignment');
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'quantity', enterQty);
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'receiptinventorynumber', batchno);
				if (enterBin != null && enterBin != "" && enterBin != 'null')
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'binnumber', enterBin);
				nlapiLogExecution('ERROR', 'expiryDate', expiryDate);
				if (expiryDate != null && expiryDate != ""
						&& expiryDate != 'null')
					compSubRecord
							.setCurrentLineItemValue('inventoryassignment',
									'expirationdate', expiryDate);
				if (vInvStatus_select != null && vInvStatus_select != ""
						&& vInvStatus_select != 'null'
						&& vInvStatus_select != 'undefined')
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'inventorystatus',
							vInvStatus_select);
				compSubRecord.commitLineItem('inventoryassignment');
				compSubRecord.commit();
			} else if (itemType == "inventoryitem"
					|| itemType == "assemblyitem") {
				nlapiLogExecution('ERROR', 'enterBin', enterBin);
				/*
				 * if(enterBin!=null && enterBin!="" && enterBin!='null')
				 * trecord.setCurrentLineItemValue('item', 'binnumber',
				 * enterBin);
				 */

				var compSubRecord = trecord.createCurrentLineItemSubrecord(
						'item', 'inventorydetail');
				var complinelength = compSubRecord
						.getLineItemCount('inventoryassignment');
				// compSubRecord.selectLineItem('inventoryassignment',1);
				if (parseInt(complinelength) > 0
						&& parseInt(complinelength)
								- parseInt(vCurrCompRecLine) > 0)
					compSubRecord.selectLineItem('inventoryassignment',
							parseInt(vCurrCompRecLine) + 1);
				else
					compSubRecord.selectNewLineItem('inventoryassignment');
				vCurrCompRecLine = parseInt(vCurrCompRecLine) + 1;
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'quantity', enterQty);
				// compSubRecord.setCurrentLineItemValue('inventoryassignment',
				// 'receiptinventorynumber', batchno);
				if (enterBin != null && enterBin != "" && enterBin != 'null')
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'binnumber', enterBin);
				if (vInvStatus_select != null && vInvStatus_select != ""
						&& vInvStatus_select != 'null'
						&& vInvStatus_select != 'undefined')
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'inventorystatus',
							vInvStatus_select);
				compSubRecord.commitLineItem('inventoryassignment');
				compSubRecord.commit();
			} else if (itemType == "serializedinventoryitem"
					|| itemType == "serializedassemblyitem") {

				var filterssertemp1 = new Array();

				filterssertemp1[0] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_status', null, 'is', 'F');
				if (trantype != "transferorder") {
					filterssertemp1[1] = new nlobjSearchFilter(
							'custrecord_wmsse_ser_ordline', null, 'equalto',
							poLineno);
				} else {
					filterssertemp1[1] = new nlobjSearchFilter(
							'custrecord_wmsse_ser_ordline', null, 'equalto',
							parseFloat(poLineno));
				}
				filterssertemp1[2] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_ordno', null, 'anyof',
						poInternalId);
				var columnssertemp1 = new Array();
				columnssertemp1[0] = new nlobjSearchColumn(
						'custrecord_wmsse_ser_no');
				columnssertemp1[1] = new nlobjSearchColumn('name');
				var SrchRecordTmpSerial1 = nlapiSearchRecord(
						'customrecord_wmsse_serialentry', null,
						filterssertemp1, columnssertemp1);
				if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != "") {
					var compSubRecord = trecord.editCurrentLineItemSubrecord(
							'item', 'inventorydetail');
					nlapiLogExecution('ERROR', 'compSubRecord', compSubRecord);
					if (compSubRecord == '' || compSubRecord == null) {
						nlapiLogExecution('ERROR', 'compSubRecord',
								'inside null');
						compSubRecord = trecord.createCurrentLineItemSubrecord(
								'item', 'inventorydetail');
						nlapiLogExecution('ERROR', 'compSubRecord',
								compSubRecord);
					}
					var complinelength = compSubRecord
							.getLineItemCount('inventoryassignment');
					if (parseInt(complinelength) > 0) {
						for (var r1 = 1; r1 <= complinelength; r1++) {
							compSubRecord.removeLineItem('inventoryassignment',
									1);
						}
					}
					for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
						compSubRecord.selectNewLineItem('inventoryassignment');
						compSubRecord.setCurrentLineItemValue(
								'inventoryassignment', 'quantity', 1);
						compSubRecord.setCurrentLineItemValue(
								'inventoryassignment',
								'receiptinventorynumber',
								SrchRecordTmpSerial1[n]
										.getValue('custrecord_wmsse_ser_no'));
						if (enterBin != null && enterBin != ""
								&& enterBin != 'null')
							compSubRecord.setCurrentLineItemValue(
									'inventoryassignment', 'binnumber',
									enterBin);
						if (vInvStatus_select != null
								&& vInvStatus_select != ""
								&& vInvStatus_select != 'null'
								&& vInvStatus_select != 'undefined')
							compSubRecord.setCurrentLineItemValue(
									'inventoryassignment', 'inventorystatus',
									vInvStatus_select);
						compSubRecord.commitLineItem('inventoryassignment');

					}
					compSubRecord.commit();
					/*
					 * for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					 * var TempRecord=SrchRecordTmpSerial1[j];
					 * nlapiLogExecution('ERROR',
					 * 'TempRecord.getId()',TempRecord.getId());
					 * nlapiLogExecution('ERROR',
					 * 'TempRecord.getValue(name)',TempRecord.getValue('name'));
					 * nlapiLogExecution('ERROR',
					 * 'TempRecord.getValue(custrecord_wmsse_ser_no)',TempRecord.getValue('custrecord_wmsse_ser_no'));
					 * var
					 * tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					 * tempSerial.setFieldValue('id', TempRecord.getId());
					 * tempSerial.setFieldValue('name',
					 * TempRecord.getValue('name'));
					 * tempSerial.setFieldValue('custrecord_wmsse_ser_note1',
					 * 'because of item receipt posted for serial number we have
					 * marked this serial number as closed');
					 * tempSerial.setFieldValue('custrecord_wmsse_ser_status',
					 * 'T'); nlapiSubmitRecord(tempSerial); }
					 */
				}
			}

			trecord.commitLineItem('item');

			if (trecord != null && trecord != '')
				idl = nlapiSubmitRecord(trecord);
			nlapiLogExecution('ERROR', 'Item Receipt Id', idl);
		}

	}
	var taskType = "PUTW";
	// To update opentask with status
	updateOpenTask(poInternalId, FetchedItemId, poLineno, enterQty, enterBin,
			itemType, whLocation, batchno, expiryDate, fifoDate, idl, poname,
			PutStrategy, '', zoneno, taskType, '', '', '', '', trantype,
			actualBeginTime, '', systemRule, '', '', '', '', '', uom,
			conversionRate, '', '', '', '', '', '', '', vInvStatus_select,
			barcodestring);

	return idl;
}

/**
 * To get open order line details
 * 
 * @param ponumber
 * @param trantype
 * @param itemID
 * @param whLocation
 * @returns {nlapiSearchRecord}
 */
function getPOLineDetails(ponumber, trantype, itemID, whLocation) {
	nlapiLogExecution('ERROR', 'ponumber,trantype,whLocation', ponumber + ","
			+ trantype + "," + whLocation);
	var filters = new Array();
	var columns = new Array();
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('quantity', null, 'greaterthan', 0));
	// Pending Receipt / Partially Received / Pending Billing_Partially Received
	filters.push(new nlobjSearchFilter('status', null, 'anyof', [ 'PurchOrd:B',
			'PurchOrd:D', 'PurchOrd:E', 'RtnAuth:B', 'RtnAuth:D', 'RtnAuth:E',
			'TrnfrOrd:E', 'TrnfrOrd:F' ]));
	filters.push(new nlobjSearchFilter('shipping', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('tranid', null, 'is', ponumber));
	if (whLocation != null && whLocation != '')
		filters.push(new nlobjSearchFilter('location', null, 'anyof',
				whLocation));
	if (itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'is', itemID));

	columns[0] = new nlobjSearchColumn('line');
	columns[1] = new nlobjSearchColumn('item');
	columns[2] = new nlobjSearchColumn('quantity');
	// columns[3] = new nlobjSearchColumn('quantitypicked');
	columns[3] = new nlobjSearchColumn('quantityshiprecv');
	columns[4] = new nlobjSearchColumn('tranid');
	columns[5] = new nlobjSearchColumn('location');
	columns[6] = new nlobjSearchColumn('usebins', 'item');

	if (trantype != null && trantype != '')
		var POLineDetails = new nlapiSearchRecord(trantype, null, filters,
				columns);
	else
		var POLineDetails = new nlapiSearchRecord('purchaseorder', null,
				filters, columns);

	return POLineDetails;
}
/**
 * To get open order line details from saved search with open task and order
 * join
 * 
 * @param ponumber
 * @param trantype
 * @param itemID
 * @param whLocation
 * @returns {nlapiSearchRecord}
 */
function getPOLineDetailsNew(ponumber, trantype, itemID, whLocation,
		getPOLineNo) {
	nlapiLogExecution('ERROR', 'ponumber,trantype,whLocation,getPOLineNo',
			ponumber + "," + trantype + "," + whLocation + "," + getPOLineNo);

	var vType = 'PurchOrd';
	if (trantype == 'purchaseorder')
		vType = 'PurchOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';
	else if (trantype == 'returnauthorization')
		vType = 'RtnAuth';
	var filters = new Array();
	var columns = new Array();

	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', ponumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	if (whLocation != null && whLocation != '' && whLocation != undefined
			&& whLocation != 'null') {
		if (crossSubsidiaryFeature == true && trantype == 'returnauthorization') {
			filters.push(new nlobjSearchFilter('inventorylocation', null,
					'anyof', [ '@NONE@', whLocation ]));
		} else {
			filters.push(new nlobjSearchFilter('location', null, 'anyof', [
					'@NONE@', whLocation ]));
		}

	}

	if (itemID != null && itemID != '' && itemID != undefined
			&& itemID != 'null')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID));
	if (getPOLineNo != null && getPOLineNo != '' && getPOLineNo != undefined
			&& getPOLineNo != 'null')
		filters
				.push(new nlobjSearchFilter('line', null, 'equalto',
						getPOLineNo));

	var POLineDetails = new nlapiSearchRecord('transaction',
			'customsearch_wmsse_rcv_ordline_details', filters, columns);
	nlapiLogExecution('ERROR', 'POLineDetails ', POLineDetails);
	return POLineDetails;
}
/**
 * To get bin internal id
 * 
 * @param Binnumber
 * @param whLocation
 * @returns {String}
 */
function nswms_GetBinInternalId(Binnumber, whLocation) {
	var bininternalId = '';
	var filter = new Array();
	filter.push(new nlobjSearchFilter('binnumber', null, 'is', Binnumber));
	// filter.push(new nlobjSearchFilter('inactive',null, 'is','F'));
	if (whLocation != null && whLocation != '' && whLocation != 'null'
			&& whLocation != 'undefined')
		filter
				.push(new nlobjSearchFilter('location', null, 'anyof',
						whLocation));
	var searchrecord = nlapiSearchRecord('Bin',
			'customsearch_wmsse_woqty_bin_srh', filter, null);
	if (searchrecord != null && searchrecord != "")
		bininternalId = searchrecord[0].getId();

	return bininternalId;
}
/**
 * To get bin internal id
 * 
 * @param Binnumber
 * @param whLocation
 * @returns {String}
 */
function nswms_GetValidBinInternalId(Binnumber, whLocation, Item) {
	var bininternalId = '';
	var filter = new Array();
	if (Binnumber != null && Binnumber != '' && Binnumber != 'null'
			&& Binnumber != 'undefined')
		filter.push(new nlobjSearchFilter('binnumber', null, 'is', Binnumber));
	filter.push(new nlobjSearchFilter('inactive', null, 'is', 'F'));
	if (whLocation != null && whLocation != '' && whLocation != 'null'
			&& whLocation != 'undefined')
		filter
				.push(new nlobjSearchFilter('location', null, 'anyof',
						whLocation));
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_bin_loc_type');
	var searchrecord = nlapiSearchRecord('Bin', null, filter, columns);
	if (searchrecord != null && searchrecord != "") {
		var vLocationType = searchrecord[0]
				.getText('custrecord_wmsse_bin_loc_type');
		nlapiLogExecution('ERROR', 'vLocationType', vLocationType);
		if (vLocationType != 'WIP')
			bininternalId = searchrecord[0].getId();
	}
	nlapiLogExecution('ERROR', 'bininternalId,Item,whLocation,Binnumber',
			bininternalId + "," + Item + "," + whLocation + "," + Binnumber);
	// No need to check bin number was mapped to item or not
	/*
	 * if((bininternalId!=null && bininternalId!='') && (Item!=null && Item!='' &&
	 * Item!='undefined' && Item!='null')) { var filtersku = new Array();
	 * filtersku.push(new nlobjSearchFilter('internalid', null,'is',Item));
	 * filtersku.push(new nlobjSearchFilter('isinactive',null, 'is','F'));
	 * filtersku.push(new nlobjSearchFilter('binnumber',null, 'is',Binnumber));
	 * if(whLocation!=null && whLocation!='' && whLocation!='null' &&
	 * whLocation!='undefined') filtersku.push(new
	 * nlobjSearchFilter('location','binnumber', 'anyof',whLocation)); var
	 * searchitemrecord= nlapiSearchRecord('item', null, filtersku,null);
	 * nlapiLogExecution('ERROR','searchitemrecord',searchitemrecord);
	 * if(searchitemrecord==null || searchitemrecord=='') { bininternalId=''; } }
	 */
	filter = null;
	searchrecord = null;
	filtersku = null;
	searchitemrecord = null;

	return bininternalId;
}

/**
 * To post item fulfillment
 * 
 * @param trantype
 * @param soInternalId
 * @param FetchedItemId
 * @param soLineno
 * @param enterQty
 * @param enterBin
 * @param itemType
 * @param whLocation
 * @param batchno
 * @returns {String}
 */
function nswms_PostItemFulfillment(trantype, soInternalId, FetchedItemId,
		soLineno, enterQty, enterBin, itemType, whLocation, batchno) {
	var logMsg = 'itemType = ' + itemType + '<br>';
	logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
	logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
	logMsg = logMsg + 'trantype = ' + trantype + '<br>';
	logMsg = logMsg + 'poInternalId = ' + soInternalId + '<br>';
	logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
	logMsg = logMsg + 'poLineno = ' + soLineno + '<br>';
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'batchno = ' + batchno + '<br>';
	nlapiLogExecution('ERROR', 'Processing nswms_ItemFulfillment', logMsg);

	var idl = "";
	if (trantype == "transferorder")
		soLineno = parseFloat(soLineno) - 1;
	/*
	 * var vAdvBinManagement=true;
	 * 
	 * var ctx = nlapiGetContext(); if(ctx != null && ctx != '') {
	 * if(ctx.getFeature('advbinseriallotmgmt').toString() != null &&
	 * ctx.getFeature('advbinseriallotmgmt').toString() != '')
	 * vAdvBinManagement=ctx.getFeature('advbinseriallotmgmt');
	 * nlapiLogExecution('ERROR', 'vAdvBinManagement_if', vAdvBinManagement); }
	 */
	// var soRec = nlapiLoadRecord(trantype,soInternalId);
	var trecord = nlapiTransformRecord(trantype, soInternalId,
			'itemfulfillment');
	var lineItemCount = trecord.getLineItemCount('item');
	for (var k = 1; k <= lineItemCount; k++) {
		// var enterQty =
		// soRec.getLineItemValue('item','custcol_wmsse_soqty',k);
		var tlineNo = trecord.getLineItemValue('item', 'line', k);
		nlapiLogExecution('ERROR', 'tlineNo', tlineNo);
		nlapiLogExecution('ERROR', 'soLineno', soLineno);
		if (tlineNo == soLineno) {
			trecord.selectLineItem('item', k);
			trecord.setCurrentLineItemValue('item', 'itemreceive', 'T');
			trecord.setCurrentLineItemValue('item', 'quantity', enterQty);

			trecord.setCurrentLineItemValue('item', 'location', whLocation);

			if (itemType == "lotnumberedinventoryitem"
					|| itemType == "lotnumberedassemblyitem") {

				var compSubRecord = trecord.createCurrentLineItemSubrecord(
						'item', 'inventorydetail');
				compSubRecord.selectNewLineItem('inventoryassignment');
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'quantity', enterQty);
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'receiptinventorynumber', batchno);
				if (enterBin != null && enterBin != "" && enterBin != 'null')
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'binnumber', enterBin);
				compSubRecord.commitLineItem('inventoryassignment');
				compSubRecord.commit();
			} else if (itemType == "inventoryitem") {
				trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);
				/*
				 * var compSubRecord =
				 * trecord.createCurrentLineItemSubrecord('item','inventorydetail');
				 * compSubRecord.selectNewLineItem('inventoryassignment');
				 * compSubRecord.setCurrentLineItemValue('inventoryassignment',
				 * 'quantity', enterQty);
				 * //compSubRecord.setCurrentLineItemValue('inventoryassignment',
				 * 'receiptinventorynumber', batchno); if(enterBin!=null &&
				 * enterBin!="" && enterBin!='null')
				 * compSubRecord.setCurrentLineItemValue('inventoryassignment',
				 * 'binnumber', enterBin);
				 * compSubRecord.commitLineItem('inventoryassignment');
				 * compSubRecord.commit();
				 */
			} else if (itemType == "serializedinventoryitem"
					|| itemType == "serializedassemblyitem") {

				var filterssertemp1 = new Array();

				filterssertemp1[0] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_status', null, 'is', 'F');
				if (trantype != "transferorder") {
					filterssertemp1[1] = new nlobjSearchFilter(
							'custrecord_wmsse_ser_ordline', null, 'equalto',
							soLineno);
				} else {
					filterssertemp1[1] = new nlobjSearchFilter(
							'custrecord_wmsse_ser_ordline', null, 'equalto',
							parseFloat(soLineno) + 1);
				}
				filterssertemp1[2] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_ordno', null, 'anyof',
						soInternalId);
				var columnssertemp1 = new Array();
				columnssertemp1[0] = new nlobjSearchColumn(
						'custrecord_wmsse_ser_no');
				columnssertemp1[1] = new nlobjSearchColumn('name');
				var SrchRecordTmpSerial1 = nlapiSearchRecord(
						'customrecord_wmsse_serialentry', null,
						filterssertemp1, columnssertemp1);
				if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != "") {
					// trecord.setCurrentLineItemValue('item', 'binnumber',
					// enterBin);
					var compSubRecord = trecord.createCurrentLineItemSubrecord(
							'item', 'inventorydetail');
					for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
						compSubRecord.selectNewLineItem('inventoryassignment');
						compSubRecord.setCurrentLineItemValue(
								'inventoryassignment', 'quantity', 1);
						compSubRecord.setCurrentLineItemValue(
								'inventoryassignment',
								'receiptinventorynumber',
								SrchRecordTmpSerial1[n]
										.getValue('custrecord_wmsse_ser_no'));
						if (enterBin != null && enterBin != ""
								&& enterBin != 'null')
							compSubRecord.setCurrentLineItemValue(
									'inventoryassignment', 'binnumber',
									enterBin);
						compSubRecord.commitLineItem('inventoryassignment');

					}
					compSubRecord.commit();

					for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
						var TempRecord = SrchRecordTmpSerial1[j];
						nlapiLogExecution('ERROR', 'TempRecord.getId()',
								TempRecord.getId());
						nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',
								TempRecord.getValue('name'));
						var tempSerial = nlapiLoadRecord(
								'customrecord_wmsse_serialentry', TempRecord
										.getId());
						tempSerial.setFieldValue('id', TempRecord.getId());
						tempSerial.setFieldValue('name', TempRecord
								.getValue('name'));
						tempSerial
								.setFieldValue(
										'custrecord_wmsse_ser_note1',
										'because of item receipt posted for serial number  we have marked this serial number as closed');
						tempSerial.setFieldValue('custrecord_wmsse_ser_status',
								'T');
						nlapiSubmitRecord(tempSerial);
						tempSerial = null;
					}
					compSubRecord = null;
				}
				SrchRecordTmpSerial1 = null;
				filterssertemp1 = null;
				columnssertemp1 = null;
			}

		} else {
			trecord.selectLineItem('item', tlineNo);
			trecord.setCurrentLineItemValue('item', 'itemreceive', 'F');
			// trecord.setCurrentLineItemValue('item', 'quantity', enterQty);
		}
		trecord.commitLineItem('item');
	}
	if (trecord != null && trecord != '')
		idl = nlapiSubmitRecord(trecord);
	nlapiLogExecution('ERROR', 'idl', idl);
	// To nullify objects
	trecord = null;
	return idl;

}

/**
 * To get Order line details
 */
function getSOLineDetails(sonumber, trantype, itemID) {
	var filters = new Array();
	var columns = new Array();
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('quantity', null, 'greaterthan', 0));
	// filters.push(new nlobjSearchFilter('custcol_wmsse_soqty', null,
	// 'isempty'));
	// Pending Receipt / Partially Received / Pending Billing_Partially Received
	if (trantype == "salesorder") {
		filters.push(new nlobjSearchFilter('status', null, 'anyof', [
				'SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E' ]));
	} else {
		filters.push(new nlobjSearchFilter('status', null, 'anyof', [
				'TrnfrOrd:B', 'TrnfrOrd:D', 'TrnfrOrd:E' ]));
		filters.push(new nlobjSearchFilter('transactionlinetype', null,
				'anyof', 'RECEIVING'));
	}
	filters.push(new nlobjSearchFilter('shipping', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('tranid', null, 'is', sonumber));

	if (itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'is', itemID));

	columns[0] = new nlobjSearchColumn('line');
	columns[1] = new nlobjSearchColumn('item');
	columns[2] = new nlobjSearchColumn('quantity');
	// columns[3] = new nlobjSearchColumn('quantitypicked');
	columns[3] = new nlobjSearchColumn('quantityshiprecv');
	columns[4] = new nlobjSearchColumn('tranid');
	columns[5] = new nlobjSearchColumn('location');
	columns[6] = new nlobjSearchColumn('usebins', 'item');

	var SOLineDetails = new nlapiSearchRecord(trantype, null, filters, columns);

	return SOLineDetails;
}
/**
 * To get Order line details from saved search with given order only
 */
function getSOLineDetailsItemandqty(sonumber, trantype, itemID, whLocation,
		line) {
	nlapiLogExecution('ERROR', 'sonumber,trantype,itemID,whLocation,line',
			sonumber + "," + trantype + "," + itemID + "," + whLocation + ","
					+ line);

	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder') {
		vType = 'TrnfrOrd';
		if (line != null && line != '' && line != 'undefined' && line != 'null')
			line = parseInt(line) + 1;
	}

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('internalid', null, 'is', sonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != 'null') {
		if (crossSubsidiaryFeature == true && trantype == "salesorder") {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			filters.push(new nlobjSearchFilter('inventorylocation', null,
					'anyof', [ '@NONE@', whLocation ]));
		} else {
			filters.push(new nlobjSearchFilter('location', null, 'anyof', [
					'@NONE@', whLocation ]));
			filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site',
					'location', 'is', 'T'));
		}

	}
	if (itemID != null && itemID != '' && itemID != 'undefined'
			&& itemID != 'null')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID));
	if (line != null && line != '' && line != 'undefined' && line != 'null')
		filters.push(new nlobjSearchFilter('line', null, 'equalto', line));

	var SOitemLineDetailsqty = new nlapiSearchRecord('transaction',
			'customsearch_wmsse_item_search_details', filters, columns);

	return SOitemLineDetailsqty;
}
/**
 * To get Order line details from saved search with open task and order join
 */
function getSOLineDetailsItem(sonumber, trantype, itemID, whLocation) {
	nlapiLogExecution('ERROR', 'sonumber,trantype,whLocation', sonumber + ","
			+ trantype + "," + whLocation);
	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';

	var SOitemLineDetailsitem = nlapiLoadSearch('transaction',
			'customsearch_wmsse_soscan_search_details');

	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('internalid', null,
			'is', sonumber));
	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('type', null,
			'anyof', vType));
	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != 'null') {

		if (crossSubsidiaryFeature == true && trantype == 'salesorder') {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'inventorylocation', null, 'anyof',
					[ '@NONE@', whLocation ]));
		} else {
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('location',
					null, 'anyof', [ '@NONE@', whLocation ]));
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'custrecord_wmsse_make_wh_site', 'location', 'is', 'T'));
		}
	}
	if (itemID != null && itemID != '' && itemID != 'undefined'
			&& itemID != 'null')
		SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('item', null,
				'anyof', itemID));

	var objSodetails = new Array();

	var resLen = SOitemLineDetailsitem.runSearch();
	var q = 0;
	var resultSet = resLen.forEachResult(function(searchResult) {
		q++;
		objSodetails.push(searchResult);
		if (q == 4000) {
			return false;
		}
		return true;
	});

	return objSodetails;
}

/**
 * To get Order line details from saved search with open task and order join
 */
function getSOLineDetailsItemrefactor(sonumber, trantype, itemID, whLocation) {
	nlapiLogExecution('ERROR', 'sonumber,trantype,whLocation', sonumber + ","
			+ trantype + "," + whLocation);
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';

	var SOitemLineDetailsitem = nlapiLoadSearch('transaction',
			'customsearch_wmsse_soscan_details');

	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('internalid', null,
			'is', sonumber));
	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('type', null,
			'anyof', vType));

	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != 'null') {

		if (crossSubsidiaryFeature == true && trantype == 'salesorder') {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'inventorylocation', null, 'anyof',
					[ '@NONE@', whLocation ]));
		} else {
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('location',
					null, 'anyof', [ '@NONE@', whLocation ]));
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'custrecord_wmsse_make_wh_site', 'location', 'is', 'T'));
		}
	}

	if (itemID != null && itemID != '' && itemID != 'undefined'
			&& itemID != 'null')
		SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('item', null,
				'anyof', itemID));

	var objSodetails = new Array();

	var resLen = SOitemLineDetailsitem.runSearch();
	var q = 0;
	var resultSet = resLen.forEachResult(function(searchResult) {
		q++;
		objSodetails.push(searchResult);
		if (q == 4000) {
			return false;
		}
		return true;
	});

	return objSodetails;
}

/**
 * To get Order line details from saved search with open task and order join
 */
function getSOLineDetailsItemrefactorItem(sonumber, trantype, itemID,
		whLocation, line) {

	nlapiLogExecution('ERROR', 'sonumber,trantype,itemID,whLocation,line',
			sonumber + "," + trantype + "," + itemID + "," + whLocation + ","
					+ line);
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder') {
		vType = 'TrnfrOrd';
		if (line != null && line != '' && line != 'undefined' && line != 'null')
			line = parseInt(line) + 1;
	}

	var SOitemLineDetailsitem = nlapiLoadSearch('transaction',
			'customsearch_wmsse_soscan_details');

	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('internalid', null,
			'is', sonumber));
	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('type', null,
			'anyof', vType));
	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != 'null') {

		if (crossSubsidiaryFeature == true && trantype == 'salesorder') {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'inventorylocation', null, 'anyof',
					[ '@NONE@', whLocation ]));
		} else {
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('location',
					null, 'anyof', [ '@NONE@', whLocation ]));
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'custrecord_wmsse_make_wh_site', 'location', 'is', 'T'));
		}
	}
	if (itemID != null && itemID != '' && itemID != 'undefined'
			&& itemID != 'null')
		SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('item', null,
				'anyof', itemID));
	if (line != null && line != '' && line != 'undefined' && line != 'null')
		SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('line', null,
				'equalto', line));

	var objSodetails = new Array();

	var resLen = SOitemLineDetailsitem.runSearch();
	var q = 0;
	var resultSet = resLen.forEachResult(function(searchResult) {
		q++;
		objSodetails.push(searchResult);
		if (q == 4000) {
			return false;
		}
		return true;
	});

	return objSodetails;
}

/**
 * To get Order line details from saved search for scanned order.
 */
function getSOscandetails(sonumber, trantype, whLocation) {
	nlapiLogExecution('ERROR', 'sonumber,trantype,whLocation', sonumber + ","
			+ trantype + "," + whLocation);
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';

	var SOitemLineDetailsitem = nlapiLoadSearch('transaction',
			'customsearch_wmsse_soscanscreen_details');

	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('internalid', null,
			'is', sonumber));
	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('type', null,
			'anyof', vType));
	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != 'null') {

		if (crossSubsidiaryFeature == true && trantype == 'salesorder') {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'inventorylocation', null, 'anyof',
					[ '@NONE@', whLocation ]));
		} else {
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('location',
					null, 'anyof', [ '@NONE@', whLocation ]));
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'custrecord_wmsse_make_wh_site', 'location', 'is', 'T'));
		}
	}

	var objSodetails = new Array();

	var resLenDetails = SOitemLineDetailsitem.runSearch();

	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) {
		objSodetails = objSodetails.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	return objSodetails;
}
/**
 * To get Order line and Item details from saved search for scanned order.
 */
function getSOItemscandetails(sonumber, trantype, whLocation) {
	nlapiLogExecution('ERROR', 'sonumber,trantype,whLocation', sonumber + ","
			+ trantype + "," + whLocation);
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';

	var SOitemLineDetailsitem = nlapiLoadSearch('transaction',
			'customsearch_wmsse_soscanitem_details');

	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('internalid', null,
			'is', sonumber));
	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('type', null,
			'anyof', vType));
	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != 'null') {

		if (crossSubsidiaryFeature == true && trantype == 'salesorder') {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'inventorylocation', null, 'anyof',
					[ '@NONE@', whLocation ]));
		} else {
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('location',
					null, 'anyof', [ '@NONE@', whLocation ]));
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'custrecord_wmsse_make_wh_site', 'location', 'is', 'T'));
		}
	}

	var objSodetails = new Array();

	var resLenDetails = SOitemLineDetailsitem.runSearch();

	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) {
		objSodetails = objSodetails.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	return objSodetails;
}

/**
 * To get Order line and Item details from saved search for scanned order.
 */
function getSOqtyscandetails(sonumber, trantype, whLocation) {
	nlapiLogExecution('ERROR', 'sonumber,trantype,whLocation', sonumber + ","
			+ trantype + "," + whLocation);
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';

	var SOitemLineDetailsitem = nlapiLoadSearch('transaction',
			'customsearch_wmsse_soqtyscan_details');

	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('internalid', null,
			'is', sonumber));
	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('type', null,
			'anyof', vType));
	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != 'null') {

		if (crossSubsidiaryFeature == true && trantype == 'salesorder') {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'inventorylocation', null, 'anyof',
					[ '@NONE@', whLocation ]));
		} else {
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('location',
					null, 'anyof', [ '@NONE@', whLocation ]));
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'custrecord_wmsse_make_wh_site', 'location', 'is', 'T'));
		}
	}

	var objSodetails = new Array();

	var resLenDetails = SOitemLineDetailsitem.runSearch();

	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) {
		objSodetails = objSodetails.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	return objSodetails;
}

function getSOqtyscanitemdetails(sonumber, trantype, itemID, whLocation, line) {
	nlapiLogExecution('ERROR', 'sonumber,trantype,whLocation', sonumber + ","
			+ trantype + "," + whLocation);
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';

	else if (trantype == 'transferorder') {
		vType = 'TrnfrOrd';
		if (line != null && line != '' && line != 'undefined' && line != 'null')
			line = parseInt(line) + 1;
	}

	var SOitemLineDetailsitem = nlapiLoadSearch('transaction',
			'customsearch_wmsse_soqtyscan_details');

	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('internalid', null,
			'is', sonumber));
	SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('type', null,
			'anyof', vType));
	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != 'null') {

		if (crossSubsidiaryFeature == true && trantype == 'salesorder') {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'inventorylocation', null, 'anyof',
					[ '@NONE@', whLocation ]));
		} else {
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('location',
					null, 'anyof', [ '@NONE@', whLocation ]));
			SOitemLineDetailsitem.addFilter(new nlobjSearchFilter(
					'custrecord_wmsse_make_wh_site', 'location', 'is', 'T'));
		}
	}

	if (itemID != null && itemID != '' && itemID != 'undefined'
			&& itemID != 'null')
		SOitemLineDetailsitem.addFilter(new nlobjSearchFilter('item', null,
				'anyof', itemID));
	if (line != null && line != '' && line != 'undefined' && line != 'null')
		SOitemLineDetailsitem.push(new nlobjSearchFilter('line', null,
				'equalto', line));

	var objSodetails = new Array();

	var resLenDetails = SOitemLineDetailsitem.runSearch();

	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) {
		objSodetails = objSodetails.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	return objSodetails;
}

/**
 * To get Order line details from saved search with open task and order join
 * 
 * @param sonumber
 * @param trantype
 * @param itemID
 * @param whLocation
 * @returns {nlapiSearchRecord}
 */
function getSOLineDetailsNew(sonumber, trantype, itemID, whLocation, lineid) {
	nlapiLogExecution('ERROR', 'sonumber,trantype,whLocation', sonumber + ","
			+ trantype + "," + whLocation);

	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', sonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != 'null') {
		if (crossSubsidiaryFeature == true && trantype == 'salesorder') {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			filters.push(new nlobjSearchFilter('inventorylocation', null,
					'anyof', [ '@NONE@', whLocation ]));
		} else {
			filters.push(new nlobjSearchFilter('location', null, 'anyof', [
					'@NONE@', whLocation ]));
			filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site',
					'location', 'is', 'T'));

		}
	}
	if (itemID != null && itemID != '' && itemID != 'undefined'
			&& itemID != 'null')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID));

	if (lineid != null && lineid != '' && lineid != 'undefined'
			&& lineid != 'null') {
		if (trantype == 'transferorder')
			lineid = parseInt(lineid) + 1;
		// filters.push(new nlobjSearchFilter('line',
		// 'custrecord_wmsse_line_no', 'anyof', lineid));
		filters.push(new nlobjSearchFilter('line', null, 'equalto', lineid));
	}

	var SOLineDetails = new nlapiSearchRecord('transaction',
			'customsearch_wmsse_fulfil_ordline_detail', filters, columns);

	return SOLineDetails;
}

/**
 * To get Order line details from saved search with open task and order join
 * 
 * @param sonumber
 * @param soid
 * @param trantype
 * @param customer
 * @param shipdate
 * @returns {nlapiSearchRecord}
 */
function getSOLineDetailsForMultiOrd(sonumber, soid, trantype, customer,
		shipdate, vReprint, vQty, vnoofLines, vshipcomplete, whLocation,
		vOrderType, department, vclass, vshipmethod, vitemfamily, vitemgrp) {
	nlapiLogExecution('ERROR', 'department', department);
	nlapiLogExecution('ERROR', 'vclass', vclass);
	nlapiLogExecution('ERROR',
			'sonumber,soid,trantype,customer,shipdate,vReprint', sonumber + ","
					+ soid + "," + trantype + "," + customer + "," + shipdate
					+ "," + vReprint);
	nlapiLogExecution(
			'ERROR',
			'vQty,vnoofLines,vshipcomplete,whLocation,department,vclass,vshipmethod,vitemfamily,vitemgrp',
			vQty + "," + vnoofLines + "," + vshipcomplete + "," + whLocation
					+ "," + department + "," + vclass + "," + vshipmethod + ","
					+ vitemfamily + "," + vitemgrp);
	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';
	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var isCrossSub = isIntercompanyCrossSubsidiaryFeatureEnabled();

	var filters = new Array();
	var columns = new Array();
	var Soresults = new Array();
	var SOLineDetails = new nlapiLoadSearch('transaction',
			'customsearch_wmsse_fulfil_ordline_detail');

	if (sonumber != null && sonumber != '' && sonumber != 'null'
			&& sonumber != 'undefined')
		SOLineDetails.addFilter(new nlobjSearchFilter('tranid', null, 'is',
				sonumber));
	if (soid != null && soid != '' && soid != 'null' && soid != 'undefined')
		SOLineDetails.addFilter(new nlobjSearchFilter('internalid', null,
				'anyof', soid));
	SOLineDetails
			.addFilter(new nlobjSearchFilter('type', null, 'anyof', vType));

	if (customer != null && customer != '' && customer != 'undefined'
			&& customer != 'null')
		SOLineDetails.addFilter(new nlobjSearchFilter('name', null, 'anyof',
				customer));
	if (shipdate != null && shipdate != '' && shipdate != 'undefined'
			&& shipdate != 'null')
		SOLineDetails.addFilter(new nlobjSearchFilter('shipdate', null, 'on',
				shipdate));

	if (vQty != null && vQty != '' && vQty != 'undefined' && vQty != 'null')
		SOLineDetails.addFilter(new nlobjSearchFilter('formulanumeric', null,
				'lessthanorequalto', vQty).setFormula('TO_NUMBER({quantity})'));
	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != '') {

		if (isCrossSub == true && trantype == 'salesorder') {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			SOLineDetails.addFilter(new nlobjSearchFilter('inventorylocation',
					null, 'anyof', whLocation));
		} else {
			SOLineDetails.addFilter(new nlobjSearchFilter('location', null,
					'anyof', whLocation));
			SOLineDetails.addFilter(new nlobjSearchFilter(
					'custrecord_wmsse_make_wh_site', 'location', 'is', 'T'));

		}
	}

	if (department != null && department != '' && department != 'undefined'
			&& department != '')
		SOLineDetails.addFilter(new nlobjSearchFilter('department', null,
				'anyof', department));
	if (vclass != null && vclass != '' && vclass != 'undefined' && vclass != '')
		SOLineDetails.addFilter(new nlobjSearchFilter('class', null, 'anyof',
				vclass));
	if (vshipmethod != null && vshipmethod != '' && vshipmethod != 'undefined'
			&& vshipmethod != '')
		SOLineDetails.addFilter(new nlobjSearchFilter('shipmethod', null,
				'anyof', vshipmethod));
	if (vitemfamily != null && vitemfamily != '' && vitemfamily != 'undefined'
			&& vitemfamily != '')
		SOLineDetails.addFilter(new nlobjSearchFilter(
				'custitem_wmsse_itemfamily', 'item', 'anyof', vitemfamily));
	if (vitemgrp != null && vitemgrp != '' && vitemgrp != 'undefined'
			&& vitemgrp != '')
		SOLineDetails.addFilter(new nlobjSearchFilter(
				'custitem_wmsse_itemgroup', 'item', 'anyof', vitemgrp));
	if (vOrderType != null && vOrderType != '' && vOrderType != 'undefined'
			&& vOrderType != '')
		SOLineDetails.addFilter(new nlobjSearchFilter(
				'custbody_wmsse_ordertype', null, 'anyof', vOrderType));
	var SoIntArr = new Array();
	if (vnoofLines != null && vnoofLines != '' && vnoofLines != 'undefined'
			&& vnoofLines != 'null') {
		if (sonumber != null && sonumber != '' && sonumber != 'null'
				&& sonumber != 'undefined')
			filters.push(new nlobjSearchFilter('tranid', null, 'is', sonumber));
		if (soid != null && soid != '' && soid != 'null' && soid != 'undefined')
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof',
					soid));
		filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

		if (customer != null && customer != '' && customer != 'undefined'
				&& customer != 'null')
			filters
					.push(new nlobjSearchFilter('name', null, 'anyof', customer));
		if (shipdate != null && shipdate != '' && shipdate != 'undefined'
				&& shipdate != 'null')
			filters
					.push(new nlobjSearchFilter('shipdate', null, 'on',
							shipdate));

		if (vQty != null && vQty != '' && vQty != 'undefined' && vQty != 'null')
			filters.push(new nlobjSearchFilter('formulanumeric', null,
					'lessthanorequalto', vQty)
					.setFormula('TO_NUMBER({quantity})'));
		if (whLocation != null && whLocation != '' && whLocation != 'undefined'
				&& whLocation != '') {

			if (isCrossSub == true && trantype == 'salesorder') {
				// Will allow only locations for which WHsite falg is enabled,So
				// no need to check again
				filters.push(new nlobjSearchFilter('inventorylocation', null,
						'anyof', whLocation));
			} else {
				filters.push(new nlobjSearchFilter('location', null, 'anyof',
						whLocation));
				filters
						.push(new nlobjSearchFilter(
								'custrecord_wmsse_make_wh_site', 'location',
								'is', 'T'));

			}
		}
		/*
		 * if(vnoofLines != null && vnoofLines != '' && vnoofLines!='undefined' &&
		 * vnoofLines != 'null') filters.push(new
		 * nlobjSearchFilter('formulanumeric', null, 'lessthanorequalto',
		 * vnoofLines).setFormula('TO_NUMBER({line})'));
		 */
		if (department != null && department != '' && department != 'undefined'
				&& department != '')
			filters.push(new nlobjSearchFilter('department', null, 'anyof',
					department));
		if (vclass != null && vclass != '' && vclass != 'undefined'
				&& vclass != '')
			filters.push(new nlobjSearchFilter('class', null, 'anyof', vclass));
		if (vshipmethod != null && vshipmethod != ''
				&& vshipmethod != 'undefined' && vshipmethod != '')
			filters.push(new nlobjSearchFilter('shipmethod', null, 'anyof',
					vshipmethod));
		if (vitemfamily != null && vitemfamily != ''
				&& vitemfamily != 'undefined' && vitemfamily != '')
			filters.push(new nlobjSearchFilter('custitem_wmsse_itemfamily',
					'item', 'anyof', vitemfamily));
		if (vitemgrp != null && vitemgrp != '' && vitemgrp != 'undefined'
				&& vitemgrp != '')
			filters.push(new nlobjSearchFilter('custitem_wmsse_itemgroup',
					'item', 'anyof', vitemgrp));
		if (vOrderType != null && vOrderType != '' && vOrderType != 'undefined'
				&& vOrderType != '')
			filters.push(new nlobjSearchFilter('custbody_wmsse_ordertype',
					null, 'anyof', vOrderType));

		var SOLineCountDetails = new nlapiSearchRecord('transaction',
				'customsearch_wmsse_openpicklines_count', filters, columns);
		if (SOLineCountDetails != null && SOLineCountDetails != ''
				&& SOLineCountDetails.length > 0) {
			for (var f = 0; f < SOLineCountDetails.length; f++) {
				var vLineCount = SOLineCountDetails[f].getValue('line', null,
						'count');
				var vSoInternalId = SOLineCountDetails[f].getValue(
						'internalid', null, 'group');
				nlapiLogExecution('ERROR', 'vLineCount', vLineCount);
				if (parseFloat(vnoofLines) >= parseFloat(vLineCount)) {
					nlapiLogExecution('ERROR', 'vSoInternalId', vSoInternalId);
					SoIntArr.push(vSoInternalId);
				}
			}
		}
		nlapiLogExecution('ERROR', 'SoIntArr', SoIntArr);
		if (SoIntArr != null && SoIntArr != '')
			SOLineDetails.addFilter(new nlobjSearchFilter('internalid', null,
					'anyof', SoIntArr));
	}

	var resLenDetails = SOLineDetails.runSearch();

	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) {
		Soresults = Soresults.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	return Soresults;
}

/**
 * To get configured date format
 * 
 * @returns
 */
function DateSetting() {
	var ctx = nlapiGetContext();
	var setpreferencesdateformate = ctx.getPreference('DATEFORMAT');

	return setpreferencesdateformate;
}

/**
 * To get configured time format
 * 
 * @returns
 */
function TimeSetting() {
	var ctx = nlapiGetContext();
	var setpreferencestimeformat = ctx.getPreference('TIMEFORMAT');

	return setpreferencestimeformat;
}

/**
 * To get our own date format
 * 
 * @param value
 * @param dtsettingFlag
 * @returns {Array}
 */
function RFDateFormat(value, dtsettingFlag) {
	if (value) {
		var dateArray = new Array();

		if (dtsettingFlag != null && dtsettingFlag != '') {
			if (dtsettingFlag == 'DD/MM/YYYY') {
				var date = value.substring(0, 2);
				var month = value.substring(2, 4);
				var year = value.substring(4);
			} else {
				var month = value.substring(0, 2);
				var date = value.substring(2, 4);
				var year = value.substring(4);

			}
		} else {
			var month = value.substring(0, 2);
			var date = value.substring(2, 4);
			var year = value.substring(4);

		}

		// parseFloat(month,10):- since in java script parseFloat(09) will
		// return NaN so to overcome v have added 10 as its base.
		// so when ever user enter value between 1-9 parseFloat will convert it
		// to base 10 and returns the same what the user have entered.
		nlapiLogExecution('Debug', 'month', parseFloat(month, 10));
		if (parseFloat(month, 10) > 0 && parseFloat(month, 10) < 13) {
			nlapiLogExecution('Debug', 'date', parseFloat(date, 10));
			nlapiLogExecution('Debug', 'year', parseFloat(year, 10));
			if (((parseFloat(month, 10) == 2) || (parseFloat(month, 10) == 02))
					&& (parseFloat(year, 10) % 4 == 0)) {
				if ((parseFloat(date, 10) > 0) && (parseFloat(date, 10) <= 29)) {
					var now = new Date();
					var yearPrefix = now.getFullYear().toString();
					yearPrefix = yearPrefix.substring(0, 2);
					if (dtsettingFlag == 'DD/MM/YYYY')
						var dated = date + "/" + month + "/" + yearPrefix
								+ year;
					else
						var dated = month + "/" + date + "/" + yearPrefix
								+ year;
					dateArray[0] = 'true';
					dateArray[1] = dated;
					return dateArray;
				} else {
					nlapiLogExecution('Debug', 'Debug',
							'In a leap year ,in the month of Feb date:' + date
									+ 'will not exist');
					var error = ' In the month of Feb date: ' + date
							+ ' will not exist.';
					dateArray[0] = 'false';
					dateArray[1] = error;
					return dateArray;
				}
			} else if (((parseFloat(month, 10) == 2) || (parseFloat(month, 10) == 02))
					&& (parseFloat(year, 10) % 4 != 0)) {
				if ((parseFloat(date, 10) > 0) && (parseFloat(date, 10) <= 28)) {
					var now = new Date();
					var yearPrefix = now.getFullYear().toString();
					yearPrefix = yearPrefix.substring(0, 2);
					if (dtsettingFlag == 'DD/MM/YYYY')
						var dated = date + "/" + month + "/" + yearPrefix
								+ year;
					else
						var dated = month + "/" + date + "/" + yearPrefix
								+ year;
					;
					dateArray[0] = 'true';
					dateArray[1] = dated;
					return dateArray;
				} else {
					nlapiLogExecution('Debug', 'Debug',
							'In a non leap year,in month of Feb date:' + date
									+ 'will not exist');
					var error = ' In the month of Feb date: ' + date
							+ ' will not exist.';
					dateArray[0] = 'false';
					dateArray[1] = error;
					return dateArray;
				}

			} else if ((parseFloat(date, 10) > 0)
					&& (parseFloat(date, 10) <= 31)) {
				var now = new Date();
				var yearPrefix = now.getFullYear().toString();
				yearPrefix = yearPrefix.substring(0, 2);
				if (dtsettingFlag == 'DD/MM/YYYY')
					var dated = date + "/" + month + "/" + yearPrefix + year;
				else
					var dated = month + "/" + date + "/" + yearPrefix + year;

				if ((month == 4 || month == 6 || month == 9 || month == 11)
						&& parseFloat(date, 10) == 31) {
					nlapiLogExecution('Debug', 'Month doesnt have 31 days!',
							month);
					var error = 'Month doesnt have 31 days.';
					dateArray[0] = 'false';
					dateArray[1] = error;
					return dateArray;
				} else {
					dateArray[0] = 'true';
					dateArray[1] = dated;
					return dateArray;
				}

			} else {
				nlapiLogExecution('Debug', 'Debug', 'In a Year/Month Date:'
						+ date + ' doesnt exist ');
				var error = ' In a Month, with Date: ' + date
						+ ' doesnt exist.';
				dateArray[0] = 'false';
				dateArray[1] = error;
				return dateArray;

			}

		} else {
			nlapiLogExecution('Debug', 'Debug', 'month:' + month
					+ ' enterd doesnt exist ');
			var error = ' In a Year of month: ' + month + ' doesnt exist.';
			dateArray[0] = 'false';
			dateArray[1] = error;
			return dateArray;
		}

	}
}

/**
 * For Numeric validation
 * 
 * @param string
 * @returns {Boolean}
 */
function ValidateNumeric(string) {
	var iChars = "0123456789";
	if (string == null || string == '')
		return true;
	var length = string.length;
	for (var i = 0; i <= length; i++) {
		if (iChars.indexOf(string.charAt(i)) == -1) {
			// alert("you may only enter number into this field\n");
			break;
			return false;
		}
	}
	return true;
}
// Function to get Bins and InternalIds
function fnGetPutBinAndIntDetails(getItemInternalId, strItemGrp, strItemFam,
		blnMixItem, blnMixLot, getPreferBin, strLocation, itemType, strLot,
		strItemDepartment, strItemClass, strvUnits, makeInvAvailFlagFromSelect,
		statusEnableFlag, binTransferFrombinId, vClissification) {
	var strMsg = "getItemInternalId : " + getItemInternalId + "<br>"
			+ "strItemGrp : " + strItemGrp + "<br>" + "strItemFam : "
			+ strItemFam + "<br>" + "blnMixItem : " + blnMixItem + "<br>"
			+ "blnMixLot : " + blnMixLot + "<br>" + "getPreferBin : "
			+ getPreferBin + "<br>" + "strLocation : " + strLocation + "<br>"
			+ "itemType : " + itemType + "<br>" + "strLot : " + strLot + "<br>"
			+ "vClissification : " + vClissification + "<br>"
			+ "makeInvAvailFlagFromSelect : " + makeInvAvailFlagFromSelect
			+ "<br>";
	nlapiLogExecution('ERROR', 'fnGetPutBinDetails', strMsg);
	var inventoryStatusFeature = isInvStatusFeatureEnabled();

	var invstatusarray = new Array();
	if (makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == '') {
		makeInvAvailFlagFromSelect = 'All';
	}
	if (inventoryStatusFeature == true && makeInvAvailFlagFromSelect != null
			&& makeInvAvailFlagFromSelect != ''
			&& makeInvAvailFlagFromSelect != 'All') {
		if (makeInvAvailFlagFromSelect == 'T'
				|| makeInvAvailFlagFromSelect == 'F') {
			invstatusarray = getinvavailablestatusFromCore(makeInvAvailFlagFromSelect);
		} else {
			invstatusarray.push('@NONE@');
			invstatusarray.push(makeInvAvailFlagFromSelect);
		}

	}

	var vBinLocArr = new Array();
	var vPutZoneArr = new Array();
	var filters = new Array();
	var columns = new Array();
	var binlocationsArray = new Array();
	var vPutZoneArr = new Array();
	var vBinLocArr = new Array();
	var vBinArr = new Array();
	var vTotalBinArr = new Array();
	var vTotalBinArrNew = new Array();
	var vBinIntIdExcludeArr = new Array();
	var vInvstatusbinArr = new Array();
	var vInvstatusArr = new Array();

	if (binTransferFrombinId != null && binTransferFrombinId != ''
			&& binTransferFrombinId != 'null'
			&& binTransferFrombinId != undefined
			&& binTransferFrombinId != 'undefined') {
		vBinLocArr.push(binTransferFrombinId);
	}
	if (getItemInternalId != null && getItemInternalId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_item', null,
				'anyof', [ '@NONE@', getItemInternalId ]));
	if (strItemGrp != null && strItemGrp != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemgroup', null,
				'anyof', [ '@NONE@', strItemGrp ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemgroup', null,
				'anyof', [ '@NONE@' ]));
	if (strItemFam != null && strItemFam != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemfamily', null,
				'anyof', [ '@NONE@', strItemFam ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemfamily', null,
				'anyof', [ '@NONE@' ]));
	if (strLocation != null && strLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_location', null,
				'anyof', [ '@NONE@', strLocation ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_location', null,
				'anyof', [ '@NONE@' ]));

	if (strItemClass != null && strItemClass != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_class', null,
				'anyof', [ '@NONE@', strItemClass ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_class', null,
				'anyof', [ '@NONE@' ]));
	if (strItemDepartment != null && strItemDepartment != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_department',
				null, 'anyof', [ '@NONE@', strItemDepartment ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_department',
				null, 'anyof', [ '@NONE@' ]));
	// filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	if (strvUnits != undefined && strvUnits != null && strvUnits != 'null'
			&& strvUnits != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_units', null,
				'anyof', [ '@NONE@', strvUnits ]));

	if (inventoryStatusFeature == true && invstatusarray != undefined
			&& invstatusarray != null && invstatusarray != 'null'
			&& invstatusarray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_invstatus',
				null, 'anyof', invstatusarray));

	if (vClissification != undefined && vClissification != null
			&& vClissification != 'null' && vClissification != '') {
		nlapiLogExecution('ERROR', 'vClissification', vClissification);

		var columnsclasification = new Array();
		var filtersclasification = new Array();
		columnsclasification[0] = new nlobjSearchColumn('name');
		filtersclasification.push(new nlobjSearchFilter('name', null, 'is',
				vClissification));
		var objclassification = new nlapiSearchRecord(
				'customlist_wmsse_abcvelocity', 'null', filtersclasification,
				columnsclasification);
		if (objclassification != null && objclassification != '') {
			filters.push(new nlobjSearchFilter('custrecord_wmsse_abcvelocity',
					null, 'anyof', [ '@NONE@', objclassification[0].getId() ]));
		} else
			filters.push(new nlobjSearchFilter('custrecord_wmsse_abcvelocity',
					null, 'anyof', [ '@NONE@' ]));

	} else {
		filters.push(new nlobjSearchFilter('custrecord_wmsse_abcvelocity',
				null, 'anyof', [ '@NONE@' ]));
	}

	var objPutstrategies = new nlapiSearchRecord(
			'customrecord_wmsse_putstrategies',
			'customsearch_wmsse_putstrategies_srh', filters, columns);
	if (objPutstrategies != null && objPutstrategies != ''
			&& objPutstrategies.length > 0) {
		if (blnMixItem == 'F') {
			fnGetInventoryBins(strLocation, -1, getItemInternalId, vBinLocArr);

			nlapiLogExecution('ERROR', 'vBinLocArr', vBinLocArr);
		}

		if (blnMixLot != 'T'
				&& (itemType == "lotnumberedinventoryitem" || itemType == "lotnumberedassemblyitem")) {
			fnGetInventoryBinsForLot(strLocation, -1, strLot,
					getItemInternalId, vBinLocArr);

		}
		for (var i = 0; i < objPutstrategies.length && vTotalBinArr.length < 5; i++) {
			var strPutZone = objPutstrategies[i]
					.getValue('custrecord_wmsse_putzone');
			var invstatusid = objPutstrategies[i]
					.getValue('custrecord_wmsse_put_invstatus');

			if (strPutZone == null || strPutZone == '')
				strPutZone = "-None-";
			// if(strPutZone != null && strPutZone != '' &&
			// vPutZoneArr.indexOf(strPutZone)== -1)
			if (strPutZone != null
					&& strPutZone != ''
					&& (vPutZoneArr.indexOf(strPutZone) == -1)
					|| (inventoryStatusFeature == true && (invstatusid == null || invstatusid == ''))) {

				vPutZoneArr.push(strPutZone);

				var filterStrat = new Array();

				filterStrat.push(new nlobjSearchFilter('inactive', null, 'is',
						'F'));

				if (strPutZone != null && strPutZone != ''
						&& strPutZone != '-None-')
					filterStrat
							.push(new nlobjSearchFilter(
									'custrecord_wmsse_zone', null, 'anyof',
									strPutZone));

				if (strLocation != null && strLocation != '')
					filterStrat.push(new nlobjSearchFilter('location', null,
							'anyof', strLocation));

				if (vBinLocArr != null && vBinLocArr != '')
					filterStrat.push(new nlobjSearchFilter('internalid', null,
							'noneof', vBinLocArr));

				var objBinDetails = new nlapiSearchRecord('bin',
						'customsearch_wmsse_binsbyzones', filterStrat, null);
				nlapiLogExecution('ERROR', 'objBinDetails', objBinDetails);
				if (objBinDetails != null && objBinDetails != '') {
					nlapiLogExecution('ERROR', 'objBinDetails',
							objBinDetails.length);

					for (var j = 0; j < objBinDetails.length; j++) {
						if (objBinDetails[j].getValue('binnumber') != getPreferBin) {
							vBinLocArr.push(objBinDetails[j]
									.getValue('internalid'));
							vBinArr
									.push(objBinDetails[j]
											.getValue('binnumber'));
							var currentRowValues = [
									objBinDetails[j].getValue('binnumber'),
									objBinDetails[j].getValue('internalid') ];
							vTotalBinArr.push(currentRowValues);
						}

					}

				}
				// To get Bin details when Inventory status fetaure is true
				if (inventoryStatusFeature == true && vTotalBinArr != null
						&& vTotalBinArr != '' && statusEnableFlag == 'T') {

					var vBin = new Array();
					var binArr = new Array();

					for (var binDetailItr = 0; binDetailItr < objBinDetails.length; binDetailItr++) {
						if (objBinDetails[binDetailItr].getValue('binnumber') != getPreferBin) {
							var currentRowValues = [
									objBinDetails[binDetailItr]
											.getValue('binnumber'),
									objBinDetails[binDetailItr]
											.getValue('internalid') ];
							vBin.push(currentRowValues);
							binArr.push(objBinDetails[binDetailItr]
									.getValue('internalid'));
						}
					}

					var filterInvBal = new Array();

					if (strLocation != null && strLocation != '')
						filterInvBal.push(new nlobjSearchFilter('location',
								null, 'anyof', strLocation));

					if (binArr != null && binArr != '')
						filterInvBal.push(new nlobjSearchFilter('binnumber',
								null, 'anyof', binArr));

					if (blnMixItem == 'F') {
						nlapiLogExecution('DEBUG', 'blnMixItem', blnMixItem);
						filterInvBal.push(new nlobjSearchFilter('item', null,
								'anyof', getItemInternalId));

					}

					if (blnMixLot != 'T'
							&& (itemType == "lotnumberedinventoryitem" || itemType == "lotnumberedassemblyitem")) {
						filterInvBal.push(new nlobjSearchFilter(
								'inventorynumber', null, 'is', strLot));
					}

					if (strPutZone != null && strPutZone != ''
							&& strPutZone != '-None-')
						filterInvBal.push(new nlobjSearchFilter(
								'custrecord_wmsse_zone', 'binnumber', 'anyof',
								strPutZone));
					if (makeInvAvailFlagFromSelect != null
							&& makeInvAvailFlagFromSelect != ''
							&& makeInvAvailFlagFromSelect != 'null'
							&& makeInvAvailFlagFromSelect != 'undefined'
							&& makeInvAvailFlagFromSelect != undefined) {
						if (makeInvAvailFlagFromSelect == 'T'
								|| makeInvAvailFlagFromSelect == 'F') {
							filterInvBal.push(new nlobjSearchFilter(
									'inventoryavailable', 'inventorystatus',
									'is', makeInvAvailFlagFromSelect));
							if (invstatusid != null && invstatusid != ''
									&& invstatusid != 'undefined')
								filterInvBal.push(new nlobjSearchFilter(
										'status', null, 'anyof', invstatusid));
						} else {
							if (makeInvAvailFlagFromSelect != 'All') {
								filterInvBal.push(new nlobjSearchFilter(
										'status', null, 'anyof',
										makeInvAvailFlagFromSelect));
							} else {
								if (invstatusid != null && invstatusid != ''
										&& invstatusid != 'undefined') {
									filterInvBal.push(new nlobjSearchFilter(
											'status', null, 'anyof',
											invstatusid));
								}
							}

						}
					}

					var objBinDetails = nlapiSearchRecord('InventoryBalance',
							'customsearch_wmsse_srchres_statuswise',
							filterInvBal, null);
					var BinIdArr = new Array();
					var BinTextArr = new Array();
					var BinAvailQtyArr = new Array();
					var BinStatusArr = new Array();
					var BinStatusIdArr = new Array();

					if (objBinDetails != null && objBinDetails != '') {
						for (var vPutBinDtls = 0; vPutBinDtls < objBinDetails.length
								&& vTotalBinArrNew.length < 5; vPutBinDtls++) {
							var statusMakeAvailable = objBinDetails[vPutBinDtls]
									.getValue('inventoryavailable', 'status');
							var strBin = objBinDetails[vPutBinDtls].getText(
									'binnumber', null, 'group');
							var strBinId = objBinDetails[vPutBinDtls].getValue(
									'binnumber', null, 'group');
							var invStatus = objBinDetails[vPutBinDtls].getText(
									'status', null, 'group');
							var invStatusId = objBinDetails[vPutBinDtls]
									.getValue('status', null, 'group');
							var vBinQtyAvail = objBinDetails[vPutBinDtls]
									.getValue('onhand', null, 'sum');

							BinIdArr.push(strBinId);
							BinTextArr.push(strBin);
							BinAvailQtyArr.push(vBinQtyAvail);
							BinStatusArr.push(invStatus);
							BinStatusIdArr.push(invStatusId);
							vInvstatusbinArr.push(strBinId);
							vInvstatusArr.push(invStatusId);
							var currentRowValues = [ strBin, strBinId,
									invStatus, invStatusId, vBinQtyAvail ];

							for (var vPutduplicateval = 0; vPutduplicateval < vTotalBinArrNew.length; vPutduplicateval++) {

								var totalvalues = vTotalBinArrNew[vPutduplicateval];

								if (currentRowValues[0] == totalvalues[0]
										&& currentRowValues[1] == totalvalues[1]
										&& currentRowValues[2] == totalvalues[2]
										&& currentRowValues[3] == totalvalues[3]
										&& currentRowValues[4] == totalvalues[4]) {
									nlapiLogExecution('ERROR', 'text1', 'text1');
									currentRowValues = null;
									break;
								}

							}
							if (currentRowValues != null
									&& currentRowValues != '')
								vTotalBinArrNew.push(currentRowValues);

						}
					}
					var emptyBinArr = new Array();
					var cnt = 0;
					for (var vPutBin = 0; vPutBin < vBin.length && cnt < 5; vPutBin++) {
						var blnEmpty = 'T';
						for (var vInvBal = 0; vInvBal < BinIdArr.length; vInvBal++) {
							if (BinIdArr[vInvBal] == vBin[vPutBin][1]) {
								blnEmpty = 'F';
								cnt++;
							}
						}
						if (blnEmpty == 'T') {
							var isBinisEmpty = funToCheckIsBinEmpty(
									vBin[vPutBin][1], strLocation);

							if (isBinisEmpty == 'T') {
								var currentRowValues = [ vBin[vPutBin][0],
										vBin[vPutBin][1] ];
								emptyBinArr.push(currentRowValues);
								cnt++;
							}
						}
					}

					for (var vEmtyBin = 0; vEmtyBin < emptyBinArr.length; vEmtyBin++) {
						var currentRowValues = [ emptyBinArr[vEmtyBin][0],
								emptyBinArr[vEmtyBin][1], '', '', '0' ];
						vTotalBinArrNew.push(currentRowValues);

					}

				}

				if (strPutZone != null && strPutZone != ''
						&& strPutZone == '-None-' && vTotalBinArr.length == 5) {
					break;
				}
			}

		}
	}
	if (inventoryStatusFeature == true && statusEnableFlag == 'T')
		return vTotalBinArrNew;
	else
		return vTotalBinArr;

}

/**
 * To get Bin locations to put based on put strategies configured.
 * 
 * @param getItemInternalId
 * @param strItemGrp
 * @param strItemFam
 * @param blnMixItem
 * @param blnMixLot
 * @param getPreferBin
 * @param strLocation
 * @returns {Array}
 */
function fnGetPutBinDetails(getItemInternalId, strItemGrp, strItemFam,
		blnMixItem, blnMixLot, getPreferBin, strLocation, itemType, strLot,
		strItemDepartment, strItemClass, strunits) {
	var strMsg = "getItemInternalId : " + getItemInternalId + "<br>"
			+ "strItemGrp : " + strItemGrp + "<br>" + "strItemFam : "
			+ strItemFam + "<br>" + "blnMixItem : " + blnMixItem + "<br>"
			+ "blnMixLot : " + blnMixLot + "<br>" + "getPreferBin : "
			+ getPreferBin + "<br>" + "strLocation : " + strLocation + "<br>"
			+ "itemType : " + itemType + "<br>" + "strLot : " + strLot + "<br>";
	nlapiLogExecution('ERROR', 'fnGetPutBinDetails', strMsg);
	var vBinLocArr = new Array();
	var vPutZoneArr = new Array();
	var filters = new Array();
	var columns = new Array();
	var binlocationsArray = new Array();
	var vPutZoneArr = new Array();
	var vBinLocArr = new Array();
	var vBinArr = new Array();
	if (getItemInternalId != null && getItemInternalId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_item', null,
				'anyof', [ '@NONE@', getItemInternalId ]));
	if (strItemGrp != null && strItemGrp != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemgroup', null,
				'anyof', [ '@NONE@', strItemGrp ]));
	if (strItemFam != null && strItemFam != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemfamily', null,
				'anyof', [ '@NONE@', strItemFam ]));
	if (strLocation != null && strLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_location', null,
				'anyof', [ '@NONE@', strLocation ]));
	if (strItemClass != null && strItemClass != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_class', null,
				'anyof', [ '@NONE@', strItemClass ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_class', null,
				'anyof', [ '@NONE@' ]));
	if (strItemDepartment != null && strItemDepartment != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_department',
				null, 'anyof', [ '@NONE@', strItemDepartment ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_department',
				null, 'anyof', [ '@NONE@' ]));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	if (strunits != null && strunits != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_units', null,
				'anyof', [ '@NONE@', strunits ]));

	columns[0] = new nlobjSearchColumn('custrecord_wmsse_sequence');
	columns[1] = new nlobjSearchColumn('custrecord_wmsse_putzone');
	columns[0].setSort();

	var objPutstrategies = new nlapiSearchRecord(
			'customrecord_wmsse_putstrategies', null, filters, columns);
	if (objPutstrategies != null && objPutstrategies != '') {

		for (var i = 0; i < objPutstrategies.length; i++) {
			var strPutZone = objPutstrategies[i]
					.getValue('custrecord_wmsse_putzone');
			if (strPutZone != null && strPutZone != ''
					&& vPutZoneArr.indexOf(strPutZone) == -1) {
				vPutZoneArr.push(strPutZone);

				var filterStrat = new Array();

				filterStrat.push(new nlobjSearchFilter('inactive', null, 'is',
						'F'));
				filterStrat.push(new nlobjSearchFilter('custrecord_wmsse_zone',
						null, 'anyof', strPutZone));

				if (strLocation != null && strLocation != '')
					filterStrat.push(new nlobjSearchFilter('location', null,
							'anyof', strLocation));

				/*
				 * if(getPreferBin!= null && getPreferBin!= '')
				 * filterStrat.push(new nlobjSearchFilter('binnumber',null,
				 * 'noneof', getPreferBin));
				 */

				var objBinDetails = new nlapiSearchRecord('bin',
						'customsearch_wmsse_binsbyzones', filterStrat, null);
				nlapiLogExecution('ERROR', 'objBinDetails', objBinDetails);
				if (objBinDetails != null && objBinDetails != '') {
					nlapiLogExecution('ERROR', 'objBinDetails',
							objBinDetails.length);
					for (var j = 0; j < objBinDetails.length; j++) {
						if (objBinDetails[j].getValue('binnumber') != 'getPreferBin') {
							vBinLocArr.push(objBinDetails[j]
									.getValue('internalid'));
							vBinArr
									.push(objBinDetails[j]
											.getValue('binnumber'));
						}

					}
				}
			}
		}
		nlapiLogExecution('ERROR', 'vBinLocArr', vBinLocArr);
		var blnMixItemBins = new Array();
		if (blnMixItem == 'F') {
			var filterStrat = new Array();
			var columns = new Array();
			columns.push(new nlobjSearchColumn('binnumber', null, 'group'));
			filterStrat.push(new nlobjSearchFilter('item', 'inventorynumber',
					'noneof', getItemInternalId));
			filterStrat.push(new nlobjSearchFilter('quantityonhand',
					'inventorynumber', 'greaterthan', 0));
			if (vBinLocArr != null && vBinLocArr != '')
				filterStrat.push(new nlobjSearchFilter('binnumber', null,
						'anyof', vBinLocArr));
			if (strLocation != null && strLocation != '')
				filterStrat.push(new nlobjSearchFilter('location', 'binnumber',
						'anyof', strLocation));
			var objInvDetails = new nlapiSearchRecord('inventorydetail', null,
					filterStrat, columns);

			if (objInvDetails != null && objInvDetails != '') {
				nlapiLogExecution('ERROR', 'objInvDetails ',
						objInvDetails.length);
				for (var k = 0; k < objInvDetails.length; k++) {

					blnMixItemBins.push(objInvDetails[k].getValue('binnumber',
							null, 'group'));
				}
			}
		}
		nlapiLogExecution('ERROR', 'blnMixItemBins', blnMixItemBins);
		var vFilteredArr = new Array();
		if (blnMixItemBins.length > 0) {
			for (var k1 = 0; k1 < vBinLocArr.length && vFilteredArr.length <= 5; k1++) {
				if (blnMixItemBins.indexOf(vBinLocArr[k1]) == -1) {
					vFilteredArr.push(vBinArr[k1]);
				}
				if (vFilteredArr.length >= 5) {
					break;
				}
			}
		}
	}
	nlapiLogExecution('ERROR', 'vFilteredArr', vFilteredArr);
	if (blnMixItemBins.length > 0)
		return vFilteredArr;
	else
		return vBinArr;

	/*
	 * for(var i=0;i<objPutstrategies.length && vBinLocArr.length<5;i++) { var
	 * strPutZone= objPutstrategies[i].getValue('custrecord_wmsse_putzone');
	 * if(strPutZone != null && strPutZone != '' &&
	 * vPutZoneArr.indexOf(strPutZone)== -1) { vPutZoneArr.push(strPutZone);
	 * 
	 * var filterStrat = new Array(); if(itemType == "inventoryitem" || itemType ==
	 * "assemblyitem" || itemType == "serializedinventoryitem" ||
	 * itemType=="serializedassemblyitem") {
	 * nlapiLogExecution('ERROR','strPutZone',strPutZone);
	 * 
	 * if(strPutZone != null && strPutZone != '') filterStrat.push(new
	 * nlobjSearchFilter('custrecord_wmsse_zone','binnumber', 'anyof',
	 * strPutZone)); if(blnMixItem !='T' && getItemInternalId != null &&
	 * getItemInternalId != '') filterStrat.push(new
	 * nlobjSearchFilter('internalid',null, 'anyof', getItemInternalId));
	 * if(strLocation!= null && strLocation!= '') filterStrat.push(new
	 * nlobjSearchFilter('location','binnumber', 'anyof', strLocation));
	 * 
	 * filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	 * 
	 * 
	 * var objBinDetails = new
	 * nlapiSearchRecord('item','customsearch_wmsse_getinv_bindetails_rec',filterStrat,
	 * null); if(objBinDetails != null && objBinDetails != '') {
	 * nlapiLogExecution('ERROR','objBinDetails',objBinDetails.length); for(var
	 * j=0;j<objBinDetails.length;j++) { var
	 * vValidBin=objBinDetails[j].getValue('binnumber');
	 * nlapiLogExecution('ERROR','vValidBin',vValidBin); if(vValidBin != null &&
	 * vValidBin != '' && vValidBin != getPreferBin &&
	 * vBinLocArr.indexOf(vValidBin) == -1 && vBinLocArr.length<5) {
	 * nlapiLogExecution('ERROR','j',j); vBinLocArr.push(vValidBin); }
	 * if(vBinLocArr.length>=5) break; } } } else {
	 * nlapiLogExecution('ERROR','strPutZone',strPutZone);
	 * 
	 * if(strPutZone != null && strPutZone != '') filterStrat.push(new
	 * nlobjSearchFilter('custrecord_wmsse_zone','binnumber', 'anyof',
	 * strPutZone)); if(blnMixItem !='T' && getItemInternalId != null &&
	 * getItemInternalId != '') filterStrat.push(new
	 * nlobjSearchFilter('internalid',null, 'anyof', getItemInternalId));
	 * if(blnMixLot !='T' && strLot != null && strLot != '')
	 * filterStrat.push(new
	 * nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is',
	 * strLot));
	 * 
	 * if(strLocation!= null && strLocation!= '') filterStrat.push(new
	 * nlobjSearchFilter('location','binnumber', 'anyof', strLocation));
	 * 
	 * filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	 * 
	 * var objBinDetails = new
	 * nlapiSearchRecord('item','customsearch_wmsse_getinv_bin_recv_lot',filterStrat,
	 * null);
	 * 
	 * if(objBinDetails != null && objBinDetails != '') {
	 * 
	 * nlapiLogExecution('ERROR','objBinDetails',objBinDetails.length); for(var
	 * j=0;j<objBinDetails.length;j++) { var
	 * vValidBin=objBinDetails[j].getText('binnumber','inventoryNumberBinOnHand');
	 * //var vValidBin=objBinDetails[j].getValue('binnumber'); if(vValidBin !=
	 * null && vValidBin != '' && vValidBin != getPreferBin &&
	 * vBinLocArr.indexOf(vValidBin) == -1 && vBinLocArr.length<5)
	 * vBinLocArr.push(vValidBin); if(vBinLocArr.length>=5) break; } } }
	 * objBinDetails=null; filterStrat=null;
	 *  } } } //To nullify objects
	 * 
	 * objPutstrategies=null; filters=null; columns=null; return vBinLocArr;
	 */

}

// Function to get Bins and InternalIds
function fnGetPutBinAndIntDetailsOLD(getItemInternalId, strItemGrp, strItemFam,
		blnMixItem, blnMixLot, getPreferBin, strLocation, itemType, strLot,
		strItemDepartment, strItemClass, strvUnits) {
	var strMsg = "getItemInternalId : " + getItemInternalId + "<br>"
			+ "strItemGrp : " + strItemGrp + "<br>" + "strItemFam : "
			+ strItemFam + "<br>" + "blnMixItem : " + blnMixItem + "<br>"
			+ "blnMixLot : " + blnMixLot + "<br>" + "getPreferBin : "
			+ getPreferBin + "<br>" + "strLocation : " + strLocation + "<br>"
			+ "itemType : " + itemType + "<br>" + "strLot : " + strLot + "<br>";
	nlapiLogExecution('ERROR', 'fnGetPutBinDetails', strMsg);
	var vBinLocArr = new Array();
	var vPutZoneArr = new Array();
	var filters = new Array();
	var columns = new Array();
	var binlocationsArray = new Array();
	var vPutZoneArr = new Array();
	var vBinLocArr = new Array();
	var vBinArr = new Array();
	var vTotalBinArr = new Array();
	var vBinIntIdExcludeArr = new Array();
	if (getItemInternalId != null && getItemInternalId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_item', null,
				'anyof', [ '@NONE@', getItemInternalId ]));
	if (strItemGrp != null && strItemGrp != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemgroup', null,
				'anyof', [ '@NONE@', strItemGrp ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemgroup', null,
				'anyof', [ '@NONE@' ]));
	if (strItemFam != null && strItemFam != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemfamily', null,
				'anyof', [ '@NONE@', strItemFam ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemfamily', null,
				'anyof', [ '@NONE@' ]));
	if (strLocation != null && strLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_location', null,
				'anyof', [ '@NONE@', strLocation ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_location', null,
				'anyof', [ '@NONE@' ]));

	if (strItemClass != null && strItemClass != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_class', null,
				'anyof', [ '@NONE@', strItemClass ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_class', null,
				'anyof', [ '@NONE@' ]));
	if (strItemDepartment != null && strItemDepartment != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_department',
				null, 'anyof', [ '@NONE@', strItemDepartment ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_department',
				null, 'anyof', [ '@NONE@' ]));
	// filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	if (strvUnits != undefined && strvUnits != null && strvUnits != 'null'
			&& strvUnits != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_put_units', null,
				'anyof', [ '@NONE@', strvUnits ]));

	// columns[0] = new nlobjSearchColumn('custrecord_wmsse_sequence');
	// columns[1] = new nlobjSearchColumn('custrecord_wmsse_putzone');
	// columns[2] = new nlobjSearchColumn('custrecord_wmsse_location');
	// columns[2].setSort();
	// columns[0].setSort();

	var objPutstrategies = new nlapiSearchRecord(
			'customrecord_wmsse_putstrategies',
			'customsearch_wmsse_putstrategies_srh', filters, columns);
	if (objPutstrategies != null && objPutstrategies != '') {

		for (var i = 0; i < objPutstrategies.length; i++) {
			var strPutZone = objPutstrategies[i]
					.getValue('custrecord_wmsse_putzone');
			if (strPutZone == null || strPutZone == '')
				strPutZone = "-None-";
			if (strPutZone != null && strPutZone != ''
					&& vPutZoneArr.indexOf(strPutZone) == -1) {
				vPutZoneArr.push(strPutZone);

				var filterStrat = new Array();

				filterStrat.push(new nlobjSearchFilter('inactive', null, 'is',
						'F'));

				if (strPutZone != null && strPutZone != ''
						&& strPutZone != '-None-')
					filterStrat
							.push(new nlobjSearchFilter(
									'custrecord_wmsse_zone', null, 'anyof',
									strPutZone));

				if (strLocation != null && strLocation != '')
					filterStrat.push(new nlobjSearchFilter('location', null,
							'anyof', strLocation));

				if (vBinLocArr != null && vBinLocArr != '')
					filterStrat.push(new nlobjSearchFilter('internalid', null,
							'noneof', vBinLocArr));

				/*
				 * if(getPreferBin!= null && getPreferBin!= '')
				 * filterStrat.push(new nlobjSearchFilter('binnumber',null,
				 * 'noneof', getPreferBin));
				 */

				var objBinDetails = new nlapiSearchRecord('bin',
						'customsearch_wmsse_binsbyzones', filterStrat, null);
				nlapiLogExecution('ERROR', 'objBinDetails', objBinDetails);
				if (objBinDetails != null && objBinDetails != '') {
					nlapiLogExecution('ERROR', 'objBinDetails',
							objBinDetails.length);
					for (var j = 0; j < objBinDetails.length; j++) {
						if (objBinDetails[j].getValue('binnumber') != getPreferBin) {
							vBinLocArr.push(objBinDetails[j]
									.getValue('internalid'));
							vBinArr
									.push(objBinDetails[j]
											.getValue('binnumber'));
							var currentRowValues = [
									objBinDetails[j].getValue('binnumber'),
									objBinDetails[j].getValue('internalid') ];
							vTotalBinArr.push(currentRowValues);
						}

					}
				}
				if (strPutZone != null && strPutZone != ''
						&& strPutZone == '-None-') {
					break;
				}

			}
		}
		nlapiLogExecution('ERROR', 'vBinLocArr', vBinLocArr);
		nlapiLogExecution('ERROR', 'vTotalBinArr', vTotalBinArr);
		var blnMixItemBins = new Array();
		if (blnMixItem == 'F') {
			/*
			 * var filterStrat = new Array(); var columns = new Array();
			 * columns.push(new nlobjSearchColumn('binnumber',null,'group'));
			 * filterStrat.push(new
			 * nlobjSearchFilter('item','inventorynumber','noneof',
			 * getItemInternalId)); filterStrat.push(new
			 * nlobjSearchFilter('quantityonhand','inventorynumber',
			 * 'greaterthan', 0)); if(vBinLocArr!=null && vBinLocArr!='')
			 * filterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof',
			 * vBinLocArr)); if(strLocation!= null && strLocation!= '')
			 * filterStrat.push(new nlobjSearchFilter('location','binnumber',
			 * 'anyof', strLocation)); var objInvDetails = new
			 * nlapiSearchRecord('inventorydetail',null,filterStrat, columns);
			 * 
			 * if(objInvDetails !=null && objInvDetails !='') {
			 * nlapiLogExecution('ERROR','objInvDetails ',objInvDetails.length);
			 * for(var k=0;k<objInvDetails.length ;k++) {
			 * 
			 * blnMixItemBins.push(objInvDetails[k].getValue('binnumber',null,'group')); } }
			 */
			var filterStrat = new Array();
			var columns = new Array();
			columns.push(new nlobjSearchColumn('binnumber', 'binOnHand'));
			filterStrat.push(new nlobjSearchFilter('internalid', null,
					'noneof', getItemInternalId));
			filterStrat.push(new nlobjSearchFilter('quantityonhand',
					'binOnHand', 'greaterthan', 0));
			if (vBinLocArr != null && vBinLocArr != '')
				filterStrat.push(new nlobjSearchFilter('binnumber',
						'binOnHand', 'anyof', vBinLocArr));
			if (strLocation != null && strLocation != '')
				filterStrat.push(new nlobjSearchFilter('location', 'binOnHand',
						'anyof', strLocation));

			var objInvDetails = new nlapiSearchRecord('item',
					'customsearch_wmsse_itemwise_invt_inbound', filterStrat,
					columns);
			// var objInvDetails = new
			// nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterStrat,
			// columns);

			if (objInvDetails != null && objInvDetails != ''
					&& objInvDetails.length > 0) {
				nlapiLogExecution('ERROR', 'objInvDetails ',
						objInvDetails.length);
				for (var k = 0; k < objInvDetails.length; k++) {
					if (blnMixItemBins.indexOf(objInvDetails[k].getValue(
							'binnumber', 'binOnHand')) == -1) {
						blnMixItemBins.push(objInvDetails[k].getValue(
								'binnumber', 'binOnHand'));
					}

				}
			}
		}
		if (blnMixLot != 'T'
				&& (itemType == "lotnumberedinventoryitem" || itemType == "lotnumberedassemblyitem")) {
			/*
			 * var LotInternalId=''; if(strLot!=null && strLot!='' &&
			 * strLot!='null' && strLot!='undefined') {
			 * LotInternalId=inventoryNumberInternalId(strLot,strLocation); }
			 */
			/*
			 * var filterStrat = new Array(); var columns = new Array();
			 * columns.push(new nlobjSearchColumn('binnumber',null,'group'));
			 * filterStrat.push(new
			 * nlobjSearchFilter('quantityonhand','inventorynumber',
			 * 'greaterthan', 0)); if(vBinLocArr != null && vBinLocArr != '' &&
			 * vBinLocArr.length > 0) { filterStrat.push(new
			 * nlobjSearchFilter('binnumber',null, 'anyof', vBinLocArr)); }
			 * if(strLocation!= null && strLocation!= '') filterStrat.push(new
			 * nlobjSearchFilter('location','binnumber', 'anyof', strLocation));
			 * if(blnMixLot != 'T' && LotInternalId!=null && LotInternalId!='')
			 * filterStrat.push(new
			 * nlobjSearchFilter('inventorynumber',null,'noneof',
			 * LotInternalId)); var objInvDetails = new
			 * nlapiSearchRecord('inventorydetail',null,filterStrat, columns);
			 */
			nlapiLogExecution('ERROR', 'Inside MixLot ', blnMixLot);
			var filterStrat = new Array();
			if (strLocation != null && strLocation != '')
				filterStrat.push(new nlobjSearchFilter('location',
						'inventoryNumberBinOnHand', 'anyof', strLocation));
			if (vBinLocArr != null && vBinLocArr != '')
				filterStrat.push(new nlobjSearchFilter('binnumber',
						'inventoryNumberBinOnHand', 'anyof', vBinLocArr));
			if (blnMixLot != 'T' && strLot != null && strLot != ''
					&& strLot != 'null' && strLot != 'undefined')
				filterStrat.push(new nlobjSearchFilter('inventorynumber',
						'inventoryNumberBinOnHand', 'isnot', strLot));
			filterStrat
					.push(new nlobjSearchFilter('islotitem', null, 'is', 'T'));
			var objInvDetails = new nlapiSearchRecord('item',
					'customsearch_wmsse_itemwise_lots', filterStrat, null);

			if (objInvDetails != null && objInvDetails != ''
					&& objInvDetails.length > 0) {
				nlapiLogExecution('ERROR', 'objInvDetails.length ',
						objInvDetails.length);
				for (var f = 0; f < objInvDetails.length; f++) {
					if (blnMixItemBins.indexOf(objInvDetails[f].getValue(
							'binnumber', 'inventoryNumberBinOnHand')) == -1) {
						blnMixItemBins.push(objInvDetails[f].getValue(
								'binnumber', 'inventoryNumberBinOnHand'));
					}

				}
			}
		}
		nlapiLogExecution('ERROR', 'blnMixItemBins', blnMixItemBins);
		var vFilteredArr = new Array();
		if (blnMixItemBins.length > 0) {
			for (var k1 = 0; k1 < vBinLocArr.length && vFilteredArr.length <= 5; k1++) {
				if (blnMixItemBins.indexOf(vBinLocArr[k1]) == -1) {
					var currentRow = [ vBinArr[k1], vBinLocArr[k1] ];
					// vFilteredArr.push(vBinArr[k1]);
					vFilteredArr.push(currentRow);
				}
				if (vFilteredArr.length >= 5) {
					break;
				}
			}
		}
	}
	nlapiLogExecution('ERROR', 'vFilteredArr', vFilteredArr);
	if (blnMixItemBins.length > 0)
		return vFilteredArr;
	else
		return vTotalBinArr;

	/*
	 * for(var i=0;i<objPutstrategies.length && vBinLocArr.length<5;i++) { var
	 * strPutZone= objPutstrategies[i].getValue('custrecord_wmsse_putzone');
	 * if(strPutZone != null && strPutZone != '' &&
	 * vPutZoneArr.indexOf(strPutZone)== -1) { vPutZoneArr.push(strPutZone);
	 * 
	 * var filterStrat = new Array(); if(itemType == "inventoryitem" || itemType ==
	 * "assemblyitem" || itemType == "serializedinventoryitem" ||
	 * itemType=="serializedassemblyitem") {
	 * nlapiLogExecution('ERROR','strPutZone',strPutZone);
	 * 
	 * if(strPutZone != null && strPutZone != '') filterStrat.push(new
	 * nlobjSearchFilter('custrecord_wmsse_zone','binnumber', 'anyof',
	 * strPutZone)); if(blnMixItem !='T' && getItemInternalId != null &&
	 * getItemInternalId != '') filterStrat.push(new
	 * nlobjSearchFilter('internalid',null, 'anyof', getItemInternalId));
	 * if(strLocation!= null && strLocation!= '') filterStrat.push(new
	 * nlobjSearchFilter('location','binnumber', 'anyof', strLocation));
	 * 
	 * filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	 * 
	 * 
	 * var objBinDetails = new
	 * nlapiSearchRecord('item','customsearch_wmsse_getinv_bindetails_rec',filterStrat,
	 * null); if(objBinDetails != null && objBinDetails != '') {
	 * nlapiLogExecution('ERROR','objBinDetails',objBinDetails.length); for(var
	 * j=0;j<objBinDetails.length;j++) { var
	 * vValidBin=objBinDetails[j].getValue('binnumber');
	 * nlapiLogExecution('ERROR','vValidBin',vValidBin); if(vValidBin != null &&
	 * vValidBin != '' && vValidBin != getPreferBin &&
	 * vBinLocArr.indexOf(vValidBin) == -1 && vBinLocArr.length<5) {
	 * nlapiLogExecution('ERROR','j',j); vBinLocArr.push(vValidBin); }
	 * if(vBinLocArr.length>=5) break; } } } else {
	 * nlapiLogExecution('ERROR','strPutZone',strPutZone);
	 * 
	 * if(strPutZone != null && strPutZone != '') filterStrat.push(new
	 * nlobjSearchFilter('custrecord_wmsse_zone','binnumber', 'anyof',
	 * strPutZone)); if(blnMixItem !='T' && getItemInternalId != null &&
	 * getItemInternalId != '') filterStrat.push(new
	 * nlobjSearchFilter('internalid',null, 'anyof', getItemInternalId));
	 * if(blnMixLot !='T' && strLot != null && strLot != '')
	 * filterStrat.push(new
	 * nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is',
	 * strLot));
	 * 
	 * if(strLocation!= null && strLocation!= '') filterStrat.push(new
	 * nlobjSearchFilter('location','binnumber', 'anyof', strLocation));
	 * 
	 * filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	 * 
	 * var objBinDetails = new
	 * nlapiSearchRecord('item','customsearch_wmsse_getinv_bin_recv_lot',filterStrat,
	 * null);
	 * 
	 * if(objBinDetails != null && objBinDetails != '') {
	 * 
	 * nlapiLogExecution('ERROR','objBinDetails',objBinDetails.length); for(var
	 * j=0;j<objBinDetails.length;j++) { var
	 * vValidBin=objBinDetails[j].getText('binnumber','inventoryNumberBinOnHand');
	 * //var vValidBin=objBinDetails[j].getValue('binnumber'); if(vValidBin !=
	 * null && vValidBin != '' && vValidBin != getPreferBin &&
	 * vBinLocArr.indexOf(vValidBin) == -1 && vBinLocArr.length<5)
	 * vBinLocArr.push(vValidBin); if(vBinLocArr.length>=5) break; } } }
	 * objBinDetails=null; filterStrat=null;
	 *  } } } //To nullify objects
	 * 
	 * objPutstrategies=null; filters=null; columns=null; return vBinLocArr;
	 */

}

function inventoryNumberInternalId(lot, location, item) {
	var lotInternalId = '';
	var str = 'lot :' + lot;
	str = str + 'location :' + location;
	nlapiLogExecution('ERROR', 'str ', str);
	var filter = new Array();
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('inventorynumber');
	cols[1] = new nlobjSearchColumn('location');
	if (item != null && item != '' && item != 'null' && item != 'undefined'
			&& item != undefined) {
		filter.push(new nlobjSearchFilter('item', null, 'anyof', item));
	}
	if (location != null && location != '')
		filter.push(new nlobjSearchFilter('location', null, 'anyof', location));
	if (lot != null && lot != '')
		filter.push(new nlobjSearchFilter('inventorynumber', null, 'is', lot));
	var objDetails = new nlapiSearchRecord('inventorynumber', null, filter,
			cols);

	if (objDetails != null && objDetails != '' && objDetails.length > 0) {
		lotInternalId = objDetails[0].getId();
	}
	nlapiLogExecution('ERROR', 'lotInternalId ', lotInternalId);
	return lotInternalId;
}

// Function to get total qty against bin loaction
function getBinwiseQtyDetails(binId, location) {
	nlapiLogExecution('Debug', 'binId', binId);
	nlapiLogExecution('Debug', 'location', location);
	var qtyArray = new Array();
	var filterStrat = new Array();
	if (location != null && location != '')
		filterStrat.push(new nlobjSearchFilter('location', 'binOnHand',
				'anyof', location));
	if (binId != null && binId != '')
		filterStrat.push(new nlobjSearchFilter('binnumber', 'binOnHand',
				'anyof', binId));

	var objInvDetails = new nlapiSearchRecord('item',
			'customsearch_wmsse_binwise_inventory', filterStrat, null);
	if (objInvDetails != null && objInvDetails != ''
			&& objInvDetails.length > 0) {
		for (var s = 0; s < objInvDetails.length; s++) {
			var qty = objInvDetails[s].getValue('quantityonhand', 'binOnHand',
					'sum');
			qtyArray.push(qty);
		}
	}
	nlapiLogExecution('Debug', 'qtyArray', qtyArray);
	return qtyArray;
}

/**
 * To get date stamp
 * 
 * @returns {String}
 */
function DateStamp() {
	// var now = new Date();
	var now = convertDate();
	var dtsettingFlag = DateSetting();

	if (dtsettingFlag == 'DD/MM/YYYY') {
		return ((parseFloat(now.getDate())) + '/'
				+ (parseFloat(now.getMonth()) + 1) + '/' + now.getFullYear());
	} else if (dtsettingFlag == 'MM/DD/YYYY') {
		return ((parseFloat(now.getMonth()) + 1) + '/'
				+ (parseFloat(now.getDate())) + '/' + now.getFullYear());
	} else {
		return nlapiDateToString(now);
	}
	//
}

/**
 * Returns the current logged in user
 * 
 * @returns Current user from Context
 */
function getCurrentUser() {
	var context = nlapiGetContext();
	return context.getUser();
}

/**
 * To get Lot internalid
 * 
 * @param batchno
 * @param FetchedItemId
 * @returns {String}
 */
function getLotInternalId(batchno, FetchedItemId) {
	var lotInternalId = '';
	var filterStrat = new Array();
	filterStrat.push(new nlobjSearchFilter('inventorynumber', null, 'is',
			batchno));
	var lotDetails = nlapiSearchRecord('inventorynumber', null, filterStrat,
			null);
	if (lotDetails != null && lotDetails != '' && lotDetails != 'null'
			&& lotDetails != undefined)
		lotInternalId = lotDetails[0].getId();

	return lotInternalId;
}

/**
 * To update open task with below parameters
 * 
 * @param poInternalId
 * @param FetchedItemId
 * @param poLineno
 * @param enterQty
 * @param enterBin
 * @param itemType
 * @param whLocation
 * @param batchno
 * @param expiryDate
 * @param fifoDate
 * @param idl
 * @param poname
 * @param PutStrategy
 * @param PickStrategy
 * @param zoneno
 * @param taskType
 * @param carton
 * @param cartonSize
 * @param cartonWeight
 * @param isItLastPick
 * @param trantype
 * @param actualBeginTime
 * @param customer
 * @param systemRule
 * @param componentitemExpectedQty
 * @param componentitemActualQty
 * @param parentItem
 * @param kitFlag
 * @returns
 */
function updateOpenTask(poInternalId, FetchedItemId, poLineno, enterQty,
		enterBin, itemType, whLocation, batchno, expiryDate, fifoDate, idl,
		poname, PutStrategy, PickStrategy, zoneno, taskType, carton,
		cartonSize, cartonWeight, isItLastPick, trantype, actualBeginTime,
		customer, systemRule, componentitemExpectedQty, componentitemActualQty,
		parentItem, kitFlag, beginLoc, uom, conversionRate, shipMethod, ordQty,
		ordType, department, vclass, PickreportNo, InbcontainerId,
		vInvStatus_select, barcodestring) {
	var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
	nlapiLogExecution('ERROR', 'Creating Record', 'TRN_OPENTASK');
	var str = "poInternalId : '" + poInternalId + "' ,FetchedItemId : '"
			+ FetchedItemId + "' ,poLineno : '" + poLineno + "' ,enterQty : '"
			+ enterQty + "',enterBin : '" + enterBin + "',itemType : '"
			+ itemType + "' ,whLocation : '" + whLocation + "' ,batchno : '"
			+ batchno + "' ,expiryDate : '" + expiryDate + "',fifoDate : '"
			+ fifoDate + "',idl : '" + idl + "' ,poname : '" + poname
			+ "',PutStrategy : '" + PutStrategy + "' ,PickStrategy : '"
			+ PickStrategy + "' ,zoneno : '" + zoneno + "' ,taskType : '"
			+ taskType + "',PickreportNo : '" + PickreportNo + "'";
	nlapiLogExecution('ERROR', 'str', str);
	nlapiLogExecution(
			'ERROR',
			'carton,cartonSize,cartonWeight,isItLastPick,trantype,actualBeginTime,customer,systemRule,ordType,department,vclass',
			carton + "," + cartonSize + "," + cartonWeight + "," + isItLastPick
					+ "," + trantype + "," + actualBeginTime + "," + customer
					+ "," + systemRule + "," + ordType + "," + department + ","
					+ vclass);
	nlapiLogExecution('ERROR', 'uom,conversionRate,shipMethod,ordQty', uom
			+ "," + conversionRate + "," + shipMethod + "," + ordQty);
	var vDate = DateStamp();
	if (poname != null && poname != '')
		customrecord.setFieldValue('name', poname);
	customrecord.setFieldValue('custrecord_wmsse_act_begin_date', vDate);
	customrecord.setFieldValue('custrecord_wmsse_act_end_date', vDate);

	customrecord.setFieldValue('custrecord_wmsse_act_qty', enterQty);

	if (uom != null && uom != '' && uom != 'null' && uom != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_uom', uom);

	if (conversionRate != null && conversionRate != ''
			&& conversionRate != 'null' && conversionRate != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_conversionrate',
				conversionRate);

	if (shipMethod != null && shipMethod != '' && shipMethod != 'null'
			&& shipMethod != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_shipmethod', shipMethod);

	customrecord.setFieldValue('custrecord_wmsse_sku', FetchedItemId);

	customrecord.setFieldValue('custrecord_wmsse_line_no', poLineno);

	customrecord.setFieldValue('custrecord_wmsse_expe_qty', enterQty);
	if (taskType == "PUTW") {
		customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 3);// putaway
																			// completed

		customrecord.setFieldValue('custrecord_wmsse_tasktype', 2); // For PUTW
		if (InbcontainerId != null && InbcontainerId != ''
				&& InbcontainerId != 'null' && InbcontainerId != 'undefined')
			customrecord.setFieldValue('custrecord_wmsse_inboundcontainer',
					InbcontainerId);
	} else {
		customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 8);// picking
																			// completed

		customrecord.setFieldValue('custrecord_wmsse_tasktype', 3); // For Pick
		// customrecord.setFieldValue('custrecord_wmsse_actbeginloc', enterBin);
		var vDate = DateStamp();
		var vTime = getConvertedTimeStamp();
		var vNewDate = vDate + ' ' + vTime;

		customrecord.setFieldValue('custrecord_wmsse_pick_comp_date', vNewDate);
		if (ordQty != null && ordQty != '' && ordQty != 'null'
				&& ordQty != 'undefined')
			customrecord.setFieldValue('custrecord_wmsse_expe_qty', ordQty);
	}
	if (enterBin != null && enterBin != '' && enterBin != 'null'
			&& enterBin != 'undefined') {
		customrecord.setFieldValue('custrecord_wmsse_actbeginloc', enterBin);
		customrecord.setFieldValue('custrecord_wmsse_actendloc', enterBin);
	}
	if (beginLoc != null && beginLoc != 'null' && beginLoc != ''
			&& beginLoc != 'undefined' && trantype == 'workorder') {
		customrecord.setFieldValue('custrecord_wmsse_actbeginloc', beginLoc);
	}
	if (itemType == "lotnumberedinventoryitem"
			|| itemType == "lotnumberedassemblyitem") {
		/*
		 * var lotInternalId=0; if(systemRule != 'PO') {
		 * lotInternalId=getLotInternalId(batchno); }
		 */
		/*
		 * else { var objCreateBatch = nlapiCreateRecord('inventorynumber');
		 * objCreateBatch.setFieldValue('inventorynumber',batchno);
		 * objCreateBatch.setFieldValue('expirationdate',expiryDate);
		 * //objCreateBatch.setFieldValue('expirationdate',expiryDate);
		 * lotInternalId = nlapiSubmitRecord(objCreateBatch); }
		 */

		/*
		 * if(lotInternalId!=null && lotInternalId!='')
		 * customrecord.setFieldValue('custrecord_wmsse_batch_no',lotInternalId);
		 */
		if (batchno != null && batchno != '')
			customrecord.setFieldValue('custrecord_wmsse_batch_num', batchno);
		if (expiryDate != null && expiryDate != '' && expiryDate != 'null'
				&& expiryDate != 'undefined')
			customrecord.setFieldValue('custrecord_wmsse_expirydate',
					expiryDate);
		else {
			var lotInternalId = '';
			if (batchno != null && batchno != '' && batchno != 'null'
					&& batchno != undefined)
				lotInternalId = getLotInternalId(batchno);
			if (lotInternalId != null && lotInternalId != ''
					&& lotInternalId != 'null' && lotInternalId != undefined) {
				var fields = [ 'inventorynumber', 'expirationdate' ];
				var vLotDetails = nlapiLookupField('inventorynumber',
						lotInternalId, fields);
				var vexpDate = vLotDetails.expirationdate;
				nlapiLogExecution('ERROR', 'vexpDate', vexpDate);
				if (vexpDate != null && vexpDate != '' && vexpDate != 'null')
					customrecord.setFieldValue('custrecord_wmsse_expirydate',
							vexpDate);
			}
		}
		if (fifoDate != null && fifoDate != '')
			customrecord.setFieldValue('custrecord_wmsse_fifodate', fifoDate);

	}

	if ((itemType == "serializedinventoryitem" || itemType == "serializedassemblyitem")
			&& trantype != 'workorder') {

		var filterssertemp1 = new Array();
		var serialArray = '';
		filterssertemp1[0] = new nlobjSearchFilter(
				'custrecord_wmsse_ser_status', null, 'is', 'F');
		if (trantype != "transferorder") {
			filterssertemp1[1] = new nlobjSearchFilter(
					'custrecord_wmsse_ser_ordline', null, 'equalto', poLineno);
		} else {
			if (taskType == "PUTW") {
				nlapiLogExecution('ERROR', 'taskType', taskType);
				filterssertemp1[1] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_ordline', null, 'equalto',
						parseFloat(poLineno));
			} else {
				nlapiLogExecution('ERROR', 'taskType in else', taskType);
				filterssertemp1[1] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_ordline', null, 'equalto',
						parseFloat(poLineno));
			}
		}
		filterssertemp1[2] = new nlobjSearchFilter(
				'custrecord_wmsse_ser_ordno', null, 'anyof', poInternalId);
		var columnssertemp1 = new Array();
		columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
		columnssertemp1[1] = new nlobjSearchColumn('name');
		var SrchRecordTmpSerial1 = nlapiSearchRecord(
				'customrecord_wmsse_serialentry', null, filterssertemp1,
				columnssertemp1);
		if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != "") {
			var parent = nlapiCreateRecord('customrecord_wmsse_throwaway_parent'); // create
																					// new
																					// parent
																					// record
																					// on
																					// fo
																					// line.
			var serialparentid = nlapiSubmitRecord(parent);
			var serialparent = nlapiLoadRecord(
					'customrecord_wmsse_throwaway_parent', serialparentid);

			for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
				if (serialArray == null || serialArray == '')
					serialArray = SrchRecordTmpSerial1[n]
							.getValue('custrecord_wmsse_ser_no');
				else
					serialArray = serialArray
							+ ","
							+ SrchRecordTmpSerial1[n]
									.getValue('custrecord_wmsse_ser_no');
			}
			nlapiLogExecution('ERROR', 'serialArray', serialArray);
			customrecord.setFieldValue('custrecord_wmsse_serial_no',
					serialArray);
			if (systemRule == null || systemRule == '' || systemRule == 'N') {
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord = SrchRecordTmpSerial1[j];
					nlapiLogExecution('ERROR', 'TempRecord.getId()', TempRecord
							.getId());
					nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',
							TempRecord.getValue('name'));
					// var
					// tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());

					serialparent
							.selectNewLineItem('recmachcustrecord_wmsse_st_parent');
					serialparent.setCurrentLineItemValue(
							'recmachcustrecord_wmsse_st_parent', 'id',
							TempRecord.getId());
					serialparent.setCurrentLineItemValue(
							'recmachcustrecord_wmsse_st_parent', 'name',
							TempRecord.getValue('name'));
					serialparent
							.setCurrentLineItemValue(
									'recmachcustrecord_wmsse_st_parent',
									'custrecord_wmsse_ser_note1',
									'because of serial number is updated in opentask we have marked this serial number as closed');
					serialparent.setCurrentLineItemValue(
							'recmachcustrecord_wmsse_st_parent',
							'custrecord_wmsse_ser_status', 'T');
					// tempSerial.setFieldValue('id', TempRecord.getId());
					// tempSerial.setFieldValue('name',
					// TempRecord.getValue('name'));
					// tempSerial.setFieldValue('custrecord_wmsse_ser_note1',
					// 'because of serial number is updated in opentask we have
					// marked this serial number as closed');
					// tempSerial.setFieldValue('custrecord_wmsse_ser_status',
					// 'T');
					// nlapiSubmitRecord(tempSerial);
					serialparent
							.commitLineItem('recmachcustrecord_wmsse_st_parent');
				}
				nlapiSubmitRecord(serialparent);
			}

		}
		SrchRecordTmpSerial1 = null;
	}

	customrecord.setFieldValue('custrecord_wmsse_order_no', poInternalId);
	customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);

	if (PutStrategy != null && PutStrategy != '')
		customrecord
				.setFieldValue('custrecord_wmsse_put_strategy', PutStrategy);
	if (PickStrategy != null && PickStrategy != '')
		customrecord.setFieldValue('custrecord_wmsse_pick_strategy',
				PickStrategy);
	if (zoneno != null && zoneno != '')
		customrecord.setFieldValue('custrecord_wmsse_zone_no', zoneno);
	if (kitFlag != null && kitFlag != 'null' && kitFlag != 'undefined'
			&& kitFlag != '' && kitFlag == 'T') {
		customrecord.setFieldValue('custrecord_wmsse_kitflag', kitFlag);
		customrecord.setFieldValue('custrecord_wmsse_act_qty', '');
	}

	customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', FetchedItemId);
	if (idl != null && idl != '')
		customrecord.setFieldValue('custrecord_wmsse_nsconfirm_ref_no', idl);

	var currentUserID = getCurrentUser();

	customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
	if (PickreportNo != null && PickreportNo != '' && PickreportNo != 'null'
			&& PickreportNo != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_pickreport_no',
				PickreportNo);
	if (carton != null && carton != '' && carton != 'null'
			&& carton != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_container_lp_no', carton);
	if (cartonSize != null && cartonSize != '' && cartonSize != 'null'
			&& cartonSize != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_container_size',
				cartonSize);
	if (cartonWeight != null && cartonWeight != '' && cartonWeight != 'null'
			&& cartonWeight != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_containerweight',
				cartonWeight);
	if (isItLastPick != null && isItLastPick != '' && isItLastPick != 'null'
			&& isItLastPick != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_device_upload_flag',
				isItLastPick);
	if (actualBeginTime != null && actualBeginTime != ''
			&& actualBeginTime != 'null' && actualBeginTime != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_actualbegintime',
				actualBeginTime);
	customrecord.setFieldValue('custrecord_wmsse_actualendtime', TimeStamp());
	if (customer != null && customer != '' && customer != 'null'
			&& customer != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_customer', customer);
	if (componentitemExpectedQty != null && componentitemExpectedQty != ''
			&& componentitemExpectedQty != 'null'
			&& componentitemExpectedQty != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_compitm_expqty',
				componentitemExpectedQty);
	if (componentitemActualQty != null && componentitemActualQty != ''
			&& componentitemActualQty != 'null'
			&& componentitemActualQty != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_compitm_actqty',
				componentitemActualQty);
	if (parentItem != null && parentItem != '' && parentItem != 'null'
			&& parentItem != 'undefined')
		customrecord
				.setFieldValue('custrecord_wmsse_parent_sku_no', parentItem);
	if (ordType != null && ordType != '' && ordType != 'null'
			&& ordType != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_ord_type', ordType);
	if (department != null && department != '' && department != 'null'
			&& department != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_dept', department);
	if (vclass != null && vclass != '' && vclass != 'null'
			&& vclass != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_classification', vclass);
	if (vInvStatus_select != null && vInvStatus_select != ''
			&& vInvStatus_select != 'null' && vInvStatus_select != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_inventorystatus',
				vInvStatus_select);

	if (!isempty(barcodestring))
		customrecord.setFieldValue('custrecord_wmsse_compositebarcode_string',
				barcodestring);

	var recid = nlapiSubmitRecord(customrecord);
	nlapiLogExecution('ERROR', 'Done creating opentask Record', recid);
	customrecord = null;
	if (recid != null && recid != '') {

		nlapiLogExecution('ERROR', 'currentUserID', currentUserID);
		nlapiLogExecution('ERROR', 'trantype,poInternalId,poLineno', trantype
				+ "," + poInternalId + "," + poLineno);
		var lockfilters = new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',
				null, 'is', trantype));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order', null,
				'anyof', poInternalId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line', null,
				'equalto', poLineno));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',
				null, 'is', 'T'));
		// lockfilters.push(new
		// nlobjSearchFilter('custrecord_wmsse_user',null,'anyof',currentUserID));
		var lockcolumns = new Array();
		lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_user'));

		var lockresults = nlapiSearchRecord('customrecord_wmsse_lockrecs',
				null, lockfilters, lockcolumns);
		if (lockresults != null && lockresults != '' && lockresults != 'null'
				&& lockresults != undefined && lockresults != 'undefined'
				&& lockresults.length > 0) {
			for (var lockItr = 0; lockItr < lockresults.length; lockItr++) {
				var lockRecordId = lockresults[lockItr].getId();
				var LockDeleteRecordId = nlapiDeleteRecord(
						'customrecord_wmsse_lockrecs', lockRecordId);
			}
			LockDeleteRecordId = null;
		}
		lockresults = null;
		lockcolumns = null;
		lockfilters = null;
		var lockfilters = new Array();

		lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',
				null, 'anyof', FetchedItemId));
		if (enterBin != null && enterBin != '' && enterBin != 'null'
				&& enterBin != 'undefined') {
			lockfilters.push(new nlobjSearchFilter(
					'custrecord_wmsse_lock_binlocation', null, 'anyof',
					enterBin));
		}
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',
				null, 'is', 'T'));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',
				null, 'anyof', currentUserID));
		var lockresults = nlapiSearchRecord('customrecord_wmsse_lockbin', null,
				lockfilters, null);

		if (lockresults != null && lockresults != 'null' && lockresults != ''
				&& lockresults != 'undefined') {

			var DeleteRecordId = nlapiDeleteRecord(
					'customrecord_wmsse_lockbin', lockresults[0].getId());
			nlapiLogExecution('ERROR', 'DeleteRecordId', lockresults[0].getId());
		}
	}
	// Nullify opjects
	currentUserID = null;
	if (taskType != "PUTW") {
		return recid;
	}
}

/**
 * To get Bin location details to pick based on pick strategies
 */
function fnGetPickBinDetails(getItemInternalId, strItemGrp, strItemFam,
		getPreferBin, strLocation, strItemDept, strItemClass, strOrderType,
		strvUnits, boolinclIBStageInvFlag, pageCount,
		makeInvAvailFlagFromSelect, itemType, itemUnitType, itemStockUnit,
		getStockConversionRate, getPreferBinId, vClassification) {
	var strMsg = "getItemInternalId : " + getItemInternalId + "<br>"
			+ "strItemGrp : " + strItemGrp + "<br>" + "strItemFam : "
			+ strItemFam + "<br>" + "getPreferBin : " + getPreferBin + "<br>"
			+ "getPreferBinId : " + getPreferBinId + "<br>" + "strLocation : "
			+ strLocation + "<br>" + "strItemDept : " + strItemDept + "<br>"
			+ "strItemClass : " + strItemClass + "<br>" + "pageCount : "
			+ pageCount + "<br>" + "itemType : " + itemType + "<br>"
			+ "itemUnitType : " + itemUnitType + "<br>" + "itemStockUnit : "
			+ itemStockUnit + "<br>" + "getStockConversionRate : "
			+ getStockConversionRate + "<br>" + "makeInvAvailFlagFromSelect : "
			+ makeInvAvailFlagFromSelect + "<br>" + "vClassification:"
			+ vClassification;

	var invstatusarray = new Array();
	nlapiLogExecution('ERROR', 'fnGetPickBinDetails', strMsg);
	// Check Inventorystatus Feature is turn on/off
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	if (makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == '') {
		makeInvAvailFlagFromSelect = 'All';
	}
	if (inventoryStatusFeature == true && makeInvAvailFlagFromSelect != null
			&& makeInvAvailFlagFromSelect != ''
			&& makeInvAvailFlagFromSelect != 'All') {
		if (makeInvAvailFlagFromSelect == 'T'
				|| makeInvAvailFlagFromSelect == 'F') {
			invstatusarray = getinvavailablestatus(makeInvAvailFlagFromSelect);
		} else {
			invstatusarray = getselectedstatus(makeInvAvailFlagFromSelect);
		}

	}
	var count = 0;
	if (pageCount == null || pageCount == '' || pageCount == 'undefined'
			|| pageCount == 'null' || pageCount == undefined) {
		pageCount = 0;
	}
	var pageIndex = pageCount * 5;
	var vmakeInvAvailFlag = "T";
	var fields = [ 'makeinventoryavailable' ];
	var vLocDetails = nlapiLookupField('location', strLocation, fields);
	vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
	nlapiLogExecution('ERROR', 'vmakeInvAvailFlag', vmakeInvAvailFlag);
	var vBinLocArr = new Array();
	var vPickZoneArr = new Array();
	var vBinIntIdExcludeArr = new Array();
	var filterPref = new Array();

	var stgLocId = new Array();
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('name');
	var BinlocationTypes = new nlapiSearchRecord(
			'customlist_wmsse_bin_loc_type', null, null, cols);

	if (BinlocationTypes != null && BinlocationTypes != ''
			&& BinlocationTypes.length > 0) {
		var strName = 'Stage';
		for (var b = 0; b < BinlocationTypes.length; b++) {
			var tName = BinlocationTypes[b].getValue('name');
			// nlapiLogExecution('ERROR','tName',tName);
			if (tName == strName) {
				stgLocId.push(BinlocationTypes[b].getId());
				break;
			}
		}
	}
	if (getPreferBin != null && getPreferBin != '' && getPreferBin != 'null') {

		filterPref.push(new nlobjSearchFilter('inactive', null, 'is', 'F'));

		filterPref.push(new nlobjSearchFilter('binnumber', null, 'is',
				getPreferBin));

		if (strLocation != null && strLocation != '')
			filterPref.push(new nlobjSearchFilter('location', null, 'anyof',
					strLocation));

		var objPrefBinIdDetails = new nlapiSearchRecord('bin',
				'customsearch_wmsse_binsbypickzonesearch', filterPref, null);

		if (objPrefBinIdDetails != null && objPrefBinIdDetails != ''
				&& objPrefBinIdDetails.length > 0
				&& objPrefBinIdDetails[0].getValue('internalid') != null
				&& objPrefBinIdDetails[0].getValue('internalid') != ''
				&& getPreferBin != null && getPreferBin != '') {
			nlapiLogExecution('DEBUG', 'objPrefBinIdDetails length',
					objPrefBinIdDetails.length);
			if ((objPrefBinIdDetails[0]
					.getValue('custrecord_wmsse_bin_loc_type') == ''
					|| objPrefBinIdDetails[0]
							.getValue('custrecord_wmsse_bin_loc_type') == 'null' || objPrefBinIdDetails[0]
					.getValue('custrecord_wmsse_bin_loc_type') == null)
					|| (stgLocId.indexOf(objPrefBinIdDetails[0]
							.getValue('custrecord_wmsse_bin_loc_type') != -1) && (objPrefBinIdDetails[0]
							.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
				// Inventorystatus Feature is enabled
				if (inventoryStatusFeature == true) {
					var vStockUnit = "";
					var vUnittype = "";
					nlapiLogExecution('DEBUG', 'bin internalid',
							objPrefBinIdDetails[0].getValue('internalid'));
					var objPrefBinDetails = new Array();
					var searchName = 'customsearch_wmsse_invtbalance_invt_item';
					if (itemType == "inventoryitem"
							|| itemType == "assemblyitem") {
						searchName = 'customsearch_wmsse_invtbalance_invt_item';
					} else if (itemType == "serializedinventoryitem"
							|| itemType == "serializedassemblyitem") {
						searchName = 'customsearch_wmsse_invtbalance_serialsrh';

					}
					// fetching 4k records only, because columns are in group
					var objPrefresult = new nlapiLoadSearch('InventoryBalance',
							searchName);

					if (getItemInternalId != null && getItemInternalId != '')
						objPrefresult.addFilter(new nlobjSearchFilter(
								'internalid', 'item', 'anyof',
								getItemInternalId));
					if (strLocation != null && strLocation != '')
						objPrefresult.addFilter(new nlobjSearchFilter(
								'location', null, 'anyof', strLocation));

					if (makeInvAvailFlagFromSelect != null
							&& makeInvAvailFlagFromSelect != ''
							&& makeInvAvailFlagFromSelect != 'null'
							&& makeInvAvailFlagFromSelect != 'undefined'
							&& makeInvAvailFlagFromSelect != undefined) {
						if (makeInvAvailFlagFromSelect == 'T'
								|| makeInvAvailFlagFromSelect == 'F') {
							objPrefresult.addFilter(new nlobjSearchFilter(
									'inventoryavailable', 'inventorystatus',
									'is', makeInvAvailFlagFromSelect));
						} else {
							if (makeInvAvailFlagFromSelect != 'All') {
								objPrefresult.addFilter(new nlobjSearchFilter(
										'status', null, 'anyof',
										makeInvAvailFlagFromSelect));
							}

						}

					}
					objPrefresult.addFilter(new nlobjSearchFilter('binnumber',
							null, 'anyof', objPrefBinIdDetails[0]
									.getValue('internalid')));
					var resLen = objPrefresult.runSearch();
					var invprefItr = 0;
					var resultSet = resLen
							.forEachResult(function(searchResult) {
								invprefItr++;
								objPrefBinDetails.push(searchResult);
								if (invprefItr == 4000) {
									return false;
								}
								return true;
							});

					if (objPrefBinDetails != null && objPrefBinDetails != ''
							&& objPrefBinDetails.length > 0) {

						nlapiLogExecution('Error',
								'objPrefBinDetails,InventoryBalance',
								objPrefBinDetails.length);

						var vValidBinId = '';
						var vValidBin = '';
						var vPrefBinQtyAvail = '';
						var vBinStatus = '';
						var vBinStatusID = '';
						var VZone = '';
						var vOpenPrefBinQty = 0;
						var vopenTaskBinIdArr = "";
						var vopenTaskBinQtyArr = "";
						var vopenTaskPrefBinStatusArr = '';
						var vOPenTaskPrefPickBinDetails = getOPenTaskPickBinDetails(
								getItemInternalId, objPrefBinIdDetails[0]
										.getValue('internalid'), strLocation,
								itemUnitType, itemStockUnit);
						if (vOPenTaskPrefPickBinDetails != null
								&& vOPenTaskPrefPickBinDetails != ''
								&& vOPenTaskPrefPickBinDetails.length > 0) {
							vopenTaskBinQtyArr = vOPenTaskPrefPickBinDetails[1];
							vopenTaskPrefBinStatusArr = vOPenTaskPrefPickBinDetails[3];
						}
						for (var prefBinIterator = 0; prefBinIterator < objPrefBinDetails.length; prefBinIterator++) {
							if (itemType == "inventoryitem"
									|| itemType == "assemblyitem") {
								vValidBinId = objPrefBinDetails[prefBinIterator]
										.getValue('binnumber');
								vValidBin = objPrefBinDetails[prefBinIterator]
										.getText('binnumber');
								vPrefBinQtyAvail = objPrefBinDetails[prefBinIterator]
										.getValue('available');
								vBinStatus = objPrefBinDetails[prefBinIterator]
										.getText('status');
								VZone = objPrefBinDetails[prefBinIterator]
										.getText('custrecord_wmsse_zone',
												'binnumber');
								vBinStatusID = objPrefBinDetails[prefBinIterator]
										.getValue('status');

							} else {
								vValidBinId = objPrefBinDetails[prefBinIterator]
										.getValue('binnumber', null, 'group');
								vValidBin = objPrefBinDetails[prefBinIterator]
										.getText('binnumber', null, 'group');
								vPrefBinQtyAvail = objPrefBinDetails[prefBinIterator]
										.getValue('available', null, 'sum');
								vBinStatus = objPrefBinDetails[prefBinIterator]
										.getText('status', null, 'group');
								vBinStatusID = objPrefBinDetails[prefBinIterator]
										.getValue('status', null, 'group');
								VZone = objPrefBinDetails[prefBinIterator]
										.getText('custrecord_wmsse_zone',
												'binnumber', 'group');

							}

							var vOpenPrefBinQty = 0;
							if (vopenTaskPrefBinStatusArr != null
									&& vopenTaskPrefBinStatusArr != 'null'
									&& vopenTaskPrefBinStatusArr != ''
									&& vopenTaskPrefBinStatusArr != undefined) {

								for (var opentaskIterator = 0; opentaskIterator < vopenTaskPrefBinStatusArr.length; opentaskIterator++) {
									var vopenTaskStatusID = vopenTaskPrefBinStatusArr[opentaskIterator];

									if (vBinStatusID == vopenTaskStatusID) {
										vOpenPrefBinQty = vopenTaskBinQtyArr[opentaskIterator];
										break;
									}
								}
							}
							if (vOpenPrefBinQty == null
									|| vOpenPrefBinQty == ''
									|| vOpenPrefBinQty == 'null'
									|| vOpenPrefBinQty == 'undefined')
								vOpenPrefBinQty = 0;

							nlapiLogExecution('DEBUG',
									'vPrefBinQtyAvail,vOpenPrefBinQty',
									vPrefBinQtyAvail + "," + vOpenPrefBinQty);
							vPrefBinQtyAvail = parseFloat(vPrefBinQtyAvail)
									- parseFloat(vOpenPrefBinQty);
							if (parseFloat(vPrefBinQtyAvail) > 0) {
								count = count + 1;

								if (count > pageIndex) {
									/*
									 * if(getStockConversionRate != null &&
									 * getStockConversionRate != '' &&
									 * getStockConversionRate != 'null' &&
									 * getStockConversionRate != undefined &&
									 * getStockConversionRate != 'undefined') {
									 * vPrefBinQtyAvail =
									 * parseFloat(vPrefBinQtyAvail) *
									 * parseFloat(getStockConversionRate); }
									 */
									var currRow = [
											getPreferBin,
											vPrefBinQtyAvail,
											objPrefBinIdDetails[0]
													.getValue('internalid'),
											VZone, vBinStatus ];
									vBinIntIdExcludeArr
											.push(objPrefBinIdDetails[0]
													.getValue('internalid'));
									vBinLocArr.push(currRow);

								}
							}
						}
					}
				} else {
					var filterPrefInv = new Array();

					if (getItemInternalId != null && getItemInternalId != '')
						filterPrefInv.push(new nlobjSearchFilter('internalid',
								null, 'anyof', getItemInternalId));
					if (strLocation != null && strLocation != '')
						filterPrefInv.push(new nlobjSearchFilter('location',
								'binonhand', 'anyof', strLocation));

					filterPrefInv.push(new nlobjSearchFilter('binnumber',
							'binonhand', 'anyof', objPrefBinIdDetails[0]
									.getValue('internalid')));

					var objPrefBinDetails = new nlapiSearchRecord('item',
							'customsearch_wmsse_itemwise_inventory',
							filterPrefInv, null);
					if (objPrefBinDetails != null && objPrefBinDetails != ''
							&& objPrefBinDetails.length > 0) {
						var vOPenTaskPrefPickBinDetails = getOPenTaskPickBinDetails(
								getItemInternalId, objPrefBinIdDetails[0]
										.getValue('internalid'), strLocation,
								objPrefBinDetails[0].getValue('unitstype'),
								objPrefBinDetails[0].getText('stockunit'));
						if (vmakeInvAvailFlag == "T")
							var vPrefBinQtyAvail = objPrefBinDetails[0]
									.getValue('quantityavailable', 'binonhand');
						else
							var vPrefBinQtyAvail = objPrefBinDetails[0]
									.getValue('quantityonhand', 'binonhand');
						var VZone = objPrefBinIdDetails[0]
								.getText('custrecord_wmsse_zone');
						var vOpenPrefBinQty = 0;
						var vopenTaskBinIdArr = "";
						var vopenTaskBinQtyArr = "";
						if (vOPenTaskPrefPickBinDetails != null
								&& vOPenTaskPrefPickBinDetails != ''
								&& vOPenTaskPrefPickBinDetails.length > 0) {
							vopenTaskBinQtyArr = vOPenTaskPrefPickBinDetails[1];
							vOpenPrefBinQty = vopenTaskBinQtyArr[0];
						}
						if (vOpenPrefBinQty == null || vOpenPrefBinQty == ''
								|| vOpenPrefBinQty == 'null'
								|| vOpenPrefBinQty == 'undefined')
							vOpenPrefBinQty = 0;

						nlapiLogExecution('DEBUG',
								'vPrefBinQtyAvail,vOpenPrefBinQty',
								vPrefBinQtyAvail + "," + vOpenPrefBinQty);
						vPrefBinQtyAvail = parseFloat(vPrefBinQtyAvail)
								- parseFloat(vOpenPrefBinQty);
						if (parseFloat(vPrefBinQtyAvail) > 0) {

							var currRow = [
									getPreferBin,
									vPrefBinQtyAvail,
									objPrefBinIdDetails[0]
											.getValue('internalid'), VZone ];
							vBinIntIdExcludeArr.push(objPrefBinIdDetails[0]
									.getValue('internalid'));
							vBinLocArr.push(currRow);
							count = count + 1;
						}

					}
				}
			}
		}
	}
	nlapiLogExecution('DEBUG', 'vBinLocArr', vBinLocArr);
	var filters = new Array();
	var columns = new Array();
	if (getItemInternalId != null && getItemInternalId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_item', null,
				'anyof', [ '@NONE@', getItemInternalId ]));
	if (strItemGrp != null && strItemGrp != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemgroup',
				null, 'anyof', [ '@NONE@', strItemGrp ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemgroup',
				null, 'anyof', [ '@NONE@' ]));
	if (strItemFam != null && strItemFam != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemfamily',
				null, 'anyof', [ '@NONE@', strItemFam ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemfamily',
				null, 'anyof', [ '@NONE@' ]));
	if (strLocation != null && strLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_location',
				null, 'anyof', [ '@NONE@', strLocation ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_location',
				null, 'anyof', [ '@NONE@' ]));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

	if (strItemDept != null && strItemDept != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_department',
				null, 'anyof', [ '@NONE@', strItemDept ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_department',
				null, 'anyof', [ '@NONE@' ]));

	if (strItemClass != null && strItemClass != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_class', null,
				'anyof', [ '@NONE@', strItemClass ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_class', null,
				'anyof', [ '@NONE@' ]));

	if (strOrderType != undefined && strOrderType != null
			&& strOrderType != 'null' && strOrderType != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_ordertype',
				null, 'anyof', [ '@NONE@', strOrderType ]));
	if (strvUnits != undefined && strvUnits != null && strvUnits != 'null'
			&& strvUnits != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_units', null,
				'anyof', [ '@NONE@', strvUnits ]));
	// nlapiLogExecution('DEBUG','invstatusarray',invstatusarray);
	if (inventoryStatusFeature == true && invstatusarray != undefined
			&& invstatusarray != null && invstatusarray != 'null'
			&& invstatusarray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_invstatus', null,
				'anyof', invstatusarray));

	if (vClassification != 'undefined' && vClassification != null
			&& vClassification != '' && vClassification != 'null') {
		var columnsclasification = new Array();
		var filtersclasification = new Array();
		columnsclasification[0] = new nlobjSearchColumn('name');
		filtersclasification.push(new nlobjSearchFilter('name', null, 'is',
				vClassification));

		var objclassification = new nlapiSearchRecord(
				'customlist_wmsse_abcvelocity', 'null', filtersclasification,
				columnsclasification);

		if (objclassification != null && objclassification != '') {

			filters.push(new nlobjSearchFilter(
					'custrecord_wmsse_pick_abcvelocity', null, 'anyof', [
							'@NONE@', objclassification[0].getId() ]));
		} else {
			filters.push(new nlobjSearchFilter(
					'custrecord_wmsse_pick_abcvelocity', null, 'anyof',
					[ '@NONE@' ]));
		}
	} else {
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_abcvelocity',
				null, 'anyof', [ '@NONE@' ]));
	}

	var objPickstrategies = new nlapiSearchRecord(
			'customrecord_wmsse_pickstrategies',
			'customsearch_wmsse_get_pickstrategies', filters, columns);

	nlapiLogExecution('ERROR', 'objPickstrategies', objPickstrategies.length);

	if (objPickstrategies != null && objPickstrategies != ''
			&& objPickstrategies.length > 0) {
		// nlapiLogExecution('ERROR','objPickstrategies',objPickstrategies.length);
		var vBinLocStatusArr = new Array();
		for (var i = 0; i < objPickstrategies.length
				&& (vBinLocArr.length < 6 || pageCount == 0); i++) {

			var strPickZone = objPickstrategies[i]
					.getValue('custrecord_wmsse_pick_zone');
			var strInvStatus = objPickstrategies[i]
					.getText('custrecord_wmsse_invstatus');

			var inclIBStageInvFlag = objPickstrategies[i]
					.getValue('custrecord_wmsse_pick_from_stageloc');

			// This is to restrict the display of stage bins at inventroy to bin
			// scan page
			if (boolinclIBStageInvFlag != null && boolinclIBStageInvFlag != ''
					&& boolinclIBStageInvFlag != 'null'
					&& boolinclIBStageInvFlag != 'undefined'
					&& boolinclIBStageInvFlag == 'F') {
				inclIBStageInvFlag = 'F';
			}
			// ends

			if (strPickZone == null || strPickZone == '')
				strPickZone = "-None-";
			var strPickZoneText = objPickstrategies[i]
					.getText('custrecord_wmsse_pick_zone');
			nlapiLogExecution('ERROR', 'strPickZone:strPickZoneText',
					strPickZone + ":" + strPickZoneText);
			if ((strPickZone != null && strPickZone != '')
					&& (inventoryStatusFeature == true || vPickZoneArr
							.indexOf(strPickZone) == -1)) {
				vPickZoneArr.push(strPickZone);
				var vBinIdArr = new Array();
				var vBinArr = new Array();
				var vNonStorageBinIdArr = new Array();
				if (strPickZone != null && strPickZone != ''
						&& strPickZone != '-None-') {
					if (inclIBStageInvFlag == 'F') {
						var objBinByZoneDetails = new Array();
						var maxno = -1;
						objBinByZoneDetails = fnGetBinsbyZones(strPickZone,
								strLocation, maxno, objBinByZoneDetails);
						nlapiLogExecution('ERROR', 'objBinByZoneDetails',
								objBinByZoneDetails);
					} else {
						var objBinByZoneDetails = new Array();
						var maxno = -1;
						objBinByZoneDetails = fnGetBinsbyZonesAlongWithStage(
								strPickZone, strLocation, maxno,
								objBinByZoneDetails);
						nlapiLogExecution('ERROR', 'objBinByZoneDetails',
								objBinByZoneDetails);
					}
					if (objBinByZoneDetails != null
							&& objBinByZoneDetails != ''
							&& objBinByZoneDetails.length > 0) {

						for (var j = 0; j < objBinByZoneDetails.length; j++) {
							vBinIdArr.push(objBinByZoneDetails[j]
									.getValue('internalid'));
							vBinArr.push(objBinByZoneDetails[j]
									.getValue('binnumber'));

						}
					}
				} else if (strPickZone == '-None-') {
					if (inclIBStageInvFlag == 'T') {
						var objBinByZoneDetails = new Array();
						var maxno = -1;
						objBinByZoneDetails = fnGetBinsbyZonesAlongWithStage(
								strPickZone, strLocation, maxno,
								objBinByZoneDetails);

						if (objBinByZoneDetails != null
								&& objBinByZoneDetails != ''
								&& objBinByZoneDetails.length > 0) {
							nlapiLogExecution('ERROR', 'objBinByZoneDetails',
									objBinByZoneDetails.length);
							for (var j = 0; j < objBinByZoneDetails.length; j++) {
								vBinIdArr.push(objBinByZoneDetails[j]
										.getValue('internalid'));
								vBinArr.push(objBinByZoneDetails[j]
										.getValue('binnumber'));

							}
						}
					} else {
						var result = nlapiLoadSearch('bin',
								'customsearch_wmsse_non_storagebins');

						if (strLocation != null && strLocation != '')
							result.addFilter(new nlobjSearchFilter('location',
									null, 'anyof', strLocation));

						result.addFilter(new nlobjSearchFilter('inactive',
								null, 'is', 'F'));

						var objBinByZoneDetails = new Array();
						var resLen = result.runSearch();
						var q = 0;
						var resultSet = resLen.forEachResult(function(
								searchResult) {
							q++;
							objBinByZoneDetails.push(searchResult);
							if (q == 4000) {
								return false;
							}
							return true; // return true to keep iterating
						});

						if (objBinByZoneDetails != null
								&& objBinByZoneDetails != ''
								&& objBinByZoneDetails.length > 0) {
							nlapiLogExecution('ERROR', 'objBinByZoneDetails',
									objBinByZoneDetails.length);
							for (var j = 0; j < objBinByZoneDetails.length; j++) {
								vNonStorageBinIdArr.push(objBinByZoneDetails[j]
										.getId());

							}
						}
					}
				}

				if ((vNonStorageBinIdArr == null || vNonStorageBinIdArr == '')
						&& inclIBStageInvFlag == 'F') {
					var result = nlapiLoadSearch('bin',
							'customsearch_wmsse_non_storagebins');

					if (strLocation != null && strLocation != '')
						result.addFilter(new nlobjSearchFilter('location',
								null, 'anyof', strLocation));

					result.addFilter(new nlobjSearchFilter('inactive', null,
							'is', 'F'));

					var objBinByZoneDetails = new Array();
					var resLen = result.runSearch();
					var q = 0;
					var resultSet = resLen
							.forEachResult(function(searchResult) {
								q++;
								objBinByZoneDetails.push(searchResult);
								if (q == 4000) {
									return false;
								}
								return true; // return true to keep iterating
							});

					if (objBinByZoneDetails != null
							&& objBinByZoneDetails != ''
							&& objBinByZoneDetails.length > 0) {
						nlapiLogExecution('ERROR', 'objBinByZoneDetails',
								objBinByZoneDetails.length);
						for (var j = 0; j < objBinByZoneDetails.length; j++) {
							vNonStorageBinIdArr.push(objBinByZoneDetails[j]
									.getId());

						}
					}
				}

				nlapiLogExecution('ERROR', 'vNonStorageBinIdArr',
						vNonStorageBinIdArr);

				nlapiLogExecution('ERROR', 'strInvStatus', strInvStatus);
				var filterStrat = new Array();
				// Inventorystatus Feature is enabled
				if (inventoryStatusFeature == true) {
					var invstatusid = getStatusId(strInvStatus);
					nlapiLogExecution('ERROR', 'invstatusid', invstatusid);

					// nlapiLogExecution('ERROR','makeInvAvailFlagFromSelect',makeInvAvailFlagFromSelect);

					var objBinDetails = new Array();

					var searchName = 'customsearch_wmsse_invtbalance_invt_item';
					if (itemType == "inventoryitem"
							|| itemType == "assemblyitem") {
						searchName = 'customsearch_wmsse_invtbalance_invt_item';
					} else if (itemType == "serializedinventoryitem"
							|| itemType == "serializedassemblyitem") {
						searchName = 'customsearch_wmsse_invtbalance_serialsrh';

					}
					// fetching 4k records only, because columns are in group
					var resultDetails = new nlapiLoadSearch('InventoryBalance',
							searchName);

					if (strLocation != null && strLocation != '')
						resultDetails.addFilter(new nlobjSearchFilter(
								'location', null, 'anyof', strLocation));
					if (getItemInternalId != null && getItemInternalId != '')
						resultDetails.addFilter(new nlobjSearchFilter(
								'internalid', 'item', 'anyof',
								getItemInternalId));
					if (vBinIdArr != null && vBinIdArr != '')
						resultDetails.addFilter(new nlobjSearchFilter(
								'binnumber', null, 'anyof', vBinIdArr));
					if (vBinIntIdExcludeArr != null
							&& vBinIntIdExcludeArr != '')
						resultDetails.addFilter(new nlobjSearchFilter(
								'binnumber', null, 'noneof',
								vBinIntIdExcludeArr));
					if (vNonStorageBinIdArr != null
							&& vNonStorageBinIdArr != '')
						resultDetails.addFilter(new nlobjSearchFilter(
								'binnumber', null, 'noneof',
								vNonStorageBinIdArr));
					if (makeInvAvailFlagFromSelect != null
							&& makeInvAvailFlagFromSelect != ''
							&& makeInvAvailFlagFromSelect != 'null'
							&& makeInvAvailFlagFromSelect != 'undefined'
							&& makeInvAvailFlagFromSelect != undefined) {
						if (makeInvAvailFlagFromSelect == 'T'
								|| makeInvAvailFlagFromSelect == 'F') {
							resultDetails.addFilter(new nlobjSearchFilter(
									'inventoryavailable', 'inventorystatus',
									'is', makeInvAvailFlagFromSelect));
							if (invstatusid != null && invstatusid != ''
									&& invstatusid != 'undefined')
								resultDetails.addFilter(new nlobjSearchFilter(
										'status', null, 'anyof', invstatusid));
						} else {
							if (makeInvAvailFlagFromSelect != 'All') {
								resultDetails.addFilter(new nlobjSearchFilter(
										'status', null, 'anyof',
										makeInvAvailFlagFromSelect));
							} else {
								if (invstatusid != null && invstatusid != ''
										&& invstatusid != 'undefined') {
									resultDetails
											.addFilter(new nlobjSearchFilter(
													'status', null, 'anyof',
													invstatusid));
								} else {
									if (strInvStatus == 'All Available')
										resultDetails
												.addFilter(new nlobjSearchFilter(
														'inventoryavailable',
														'inventorystatus',
														'is', 'T'));
									else if (strInvStatus == 'Not Available')
										resultDetails
												.addFilter(new nlobjSearchFilter(
														'inventoryavailable',
														'inventorystatus',
														'is', 'F'));
								}
							}

						}

					}

					var resLenDetails = resultDetails.runSearch();

					var resultsPage = resLenDetails.getResults(0, 1000);
					var offset = 0;
					while (!!resultsPage && resultsPage.length > 0) {
						objBinDetails = objBinDetails.concat(resultsPage);
						offset += 1000;
						resultsPage = resLenDetails.getResults(offset,
								offset + 1000);
					}

					if (objBinDetails != null && objBinDetails != ''
							&& objBinDetails.length > 0) {
						nlapiLogExecution('DEBUG',
								'InventoryBalance objBinDetails',
								objBinDetails.length);

						var vValidBinIdArr = new Array();
						var vValidBinTextArr = new Array();
						var vValidBinAvailQtyArr = new Array();
						var vValidBinStatusArr = new Array();
						var vValidBinStatusIdArr = new Array();
						var vValidBinId = '';
						var vValidBin = '';
						var vBinQtyAvail = '';
						var vBinStatus = '';
						var vBinStatusId = '';
						for (var invIterator = 0; invIterator < objBinDetails.length
								&& vBinLocArr.length < 6; invIterator++) {
							if (itemType == "inventoryitem"
									|| itemType == "assemblyitem") {
								vValidBinId = objBinDetails[invIterator]
										.getValue('binnumber');
								vValidBin = objBinDetails[invIterator]
										.getText('binnumber');
								vBinQtyAvail = objBinDetails[invIterator]
										.getValue('available');
								vBinStatus = objBinDetails[invIterator]
										.getText('status');
								vBinStatusId = objBinDetails[invIterator]
										.getValue('status');
							} else {
								vValidBinId = objBinDetails[invIterator]
										.getValue('binnumber', null, 'group');
								vValidBin = objBinDetails[invIterator].getText(
										'binnumber', null, 'group');
								vBinQtyAvail = objBinDetails[invIterator]
										.getValue('available', null, 'sum');
								vBinStatus = objBinDetails[invIterator]
										.getText('status', null, 'group');
								vBinStatusId = objBinDetails[invIterator]
										.getValue('status', null, 'group');
							}

							var isStatusBinded = 'F';

							for (var binItr = 0; binItr < vBinLocStatusArr.length; binItr++) {
								var row = vBinLocStatusArr[binItr];

								if (vValidBinId == row[0]
										&& vBinStatusId == row[1]) {
									isStatusBinded = 'T';
									break;
								}
							}
							if (isStatusBinded == 'T') {
								continue;
							}
							vValidBinIdArr.push(vValidBinId);
							vValidBinTextArr.push(vValidBin);
							vValidBinAvailQtyArr.push(vBinQtyAvail);
							vValidBinStatusArr.push(vBinStatus);
							vValidBinStatusIdArr.push(vBinStatusId);

						}
						var objBinwithSeq = null;
						if (vValidBinIdArr != null && vValidBinIdArr != ''
								&& inclIBStageInvFlag == 'T') {

							var result = nlapiLoadSearch('bin',
									'customsearch_wmsse_binsbypickzonenodir');

							result
									.addFilter(new nlobjSearchFilter(
											'internalid', null, 'anyof',
											vValidBinIdArr));

							if (strLocation != null && strLocation != '')
								result
										.addFilter(new nlobjSearchFilter(
												'location', null, 'anyof',
												strLocation));

							result.addFilter(new nlobjSearchFilter('inactive',
									null, 'is', 'F'));

							var objBinwithSeq = new Array();
							var resLen = result.runSearch();
							var q = 0;
							var resultSet = resLen
									.forEachResult(function(searchResult) {
										if ((searchResult
												.getValue('custrecord_wmsse_bin_loc_type') == ''
												|| searchResult
														.getValue('custrecord_wmsse_bin_loc_type') == 'null' || searchResult
												.getValue('custrecord_wmsse_bin_loc_type') == null)
												|| (stgLocId
														.indexOf(searchResult
																.getValue('custrecord_wmsse_bin_loc_type') != -1) && (searchResult
														.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
											q++;
											objBinwithSeq.push(searchResult);
										}
										if (q == 4000) {
											return false;
										}
										return true; // return true to keep
														// iterating
									});

						} else if (vValidBinIdArr != null
								&& vValidBinIdArr != ''
								&& inclIBStageInvFlag != 'T') {

							var result = nlapiLoadSearch('bin',
									'customsearch_wmsse_binsbypickzones');

							result
									.addFilter(new nlobjSearchFilter(
											'internalid', null, 'anyof',
											vValidBinIdArr));

							if (strLocation != null && strLocation != '')
								result
										.addFilter(new nlobjSearchFilter(
												'location', null, 'anyof',
												strLocation));

							result.addFilter(new nlobjSearchFilter('inactive',
									null, 'is', 'F'));

							var objBinwithSeq = new Array();
							var resLen = result.runSearch();
							var q = 0;
							var resultSet = resLen.forEachResult(function(
									searchResult) {
								q++;
								objBinwithSeq.push(searchResult);
								if (q == 4000) {
									return false;
								}
								return true; // return true to keep iterating
							});
							nlapiLogExecution('ERROR', 'objBinwithSeq',
									objBinwithSeq);

						}
						var strPickZone = strPickZoneText;
						if (objBinwithSeq != null && objBinwithSeq != ''
								&& objBinwithSeq.length > 0) {
							var vOPenTaskPickBinDetails = getOPenTaskPickBinDetails(
									getItemInternalId, vValidBinIdArr,
									strLocation, itemUnitType, itemStockUnit);
							var openTaskBinIdArr = "";
							var openTaskBinQtyArr = "";
							var openTaskBinStatusArr = new Array();
							if (vOPenTaskPickBinDetails != null
									&& vOPenTaskPickBinDetails != ''
									&& vOPenTaskPickBinDetails.length > 0) {
								openTaskBinIdArr = vOPenTaskPickBinDetails[0];
								openTaskBinQtyArr = vOPenTaskPickBinDetails[1];
								openTaskBinStatusArr = vOPenTaskPickBinDetails[3];
							}

							for (var objItr = 0; objItr < objBinwithSeq.length
									&& vBinLocArr.length < 6; objItr++) {
								var vValidBinId = objBinwithSeq[objItr]
										.getValue('internalid');
								if (strPickZone == null || strPickZone == ""
										|| strPickZone == "null") {
									strPickZoneText = objBinwithSeq[objItr]
											.getText('custrecord_wmsse_zone');

								}
								for (var binItr = 0; binItr < vValidBinIdArr.length; binItr++) {
									var bin = vValidBinIdArr[binItr];
									var status = vValidBinStatusIdArr[binItr];
									var vValidBinStatus = vValidBinStatusArr[binItr];
									var vValidBinStatusId = vValidBinStatusIdArr[binItr];

									if (vValidBinId != null
											&& vValidBinId != ''
											&& vValidBinId == bin) {
										if (vValidBinIdArr.indexOf(vValidBinId) != -1) {
											var vValidBin = vValidBinTextArr[binItr];
											var vBinQtyAvail = vValidBinAvailQtyArr[binItr];

											var vValidBinStatus = vValidBinStatusArr[binItr];
											var vOpenBinQty = 0;
											if (openTaskBinIdArr != null
													&& openTaskBinIdArr != "") {
												if (openTaskBinIdArr
														.indexOf(vValidBinId) != -1) {

													for (var invItr = 0; invItr < openTaskBinStatusArr.length; invItr++) {
														if (vValidBinStatusId == openTaskBinStatusArr[invItr]
																&& bin == openTaskBinIdArr[invItr]) {

															vOpenBinQty = openTaskBinQtyArr[invItr];
															break;
														}
													}
												}
											}

											if (vOpenBinQty == null
													|| vOpenBinQty == ''
													|| vOpenBinQty == 'null'
													|| vOpenBinQty == 'undefined')
												vOpenBinQty = 0;
											// nlapiLogExecution('DEBUG','vBinQtyAvail,vOpenBinQty',vBinQtyAvail+","+vOpenBinQty);
											nlapiLogExecution(
													'ERROR',
													'vValidBin,vBinQtyAvail,vOpenBinQty',
													vValidBin + ","
															+ vBinQtyAvail
															+ "," + vOpenBinQty);
											vBinQtyAvail = parseFloat(vBinQtyAvail)
													- parseFloat(vOpenBinQty);
											if (parseFloat(vBinQtyAvail) > 0) {

												if (vValidBin != getPreferBin
														&& vValidBinId != getPreferBinId) {
													count = count + 1;

													if (count > pageIndex) {
														var currRow = [
																vValidBin,
																vBinQtyAvail,
																vValidBinId,
																strPickZoneText,
																vValidBinStatus ];
														// vBinIntIdExcludeArr.push(vValidBinId);
														vBinLocArr
																.push(currRow);
														var currRow1 = [
																vValidBinId,
																vValidBinStatusId ];
														vBinLocStatusArr
																.push(currRow1);
													} else {
														var currRow = [
																vValidBinId,
																vValidBinStatusId ];
														vBinLocStatusArr
																.push(currRow);
													}
												}
											}

										}
									}

									if (vBinLocArr.length >= 6)
										break;

								}
							}
						}

					}
					objBinDetails = null;

				} else {
					if (strLocation != null && strLocation != '')
						filterStrat.push(new nlobjSearchFilter('location',
								'binonhand', 'anyof', strLocation));
					if (getItemInternalId != null && getItemInternalId != '')
						filterStrat.push(new nlobjSearchFilter('internalid',
								null, 'anyof', getItemInternalId));
					if (vBinIdArr != null && vBinIdArr != '')
						filterStrat.push(new nlobjSearchFilter('binnumber',
								'binonhand', 'anyof', vBinIdArr));
					if (vBinIntIdExcludeArr != null
							&& vBinIntIdExcludeArr != '')
						filterStrat.push(new nlobjSearchFilter('binnumber',
								'binonhand', 'noneof', vBinIntIdExcludeArr));
					if (vNonStorageBinIdArr != null
							&& vNonStorageBinIdArr != '')
						filterStrat.push(new nlobjSearchFilter('binnumber',
								'binonhand', 'noneof', vNonStorageBinIdArr));

					var objBinDetails = new nlapiSearchRecord('item',
							'customsearch_wmsse_itemwise_inventory',
							filterStrat, null);
					if (objBinDetails != null && objBinDetails != ''
							&& objBinDetails.length > 0) {
						nlapiLogExecution('ERROR', 'objBinDetails',
								objBinDetails.length);

						var vValidBinIdArr = new Array();
						var vValidBinTextArr = new Array();
						var vValidBinAvailQtyArr = new Array();

						for (var vbinItr = 0; vbinItr < objBinDetails.length; vbinItr++) {
							var vValidBinId = objBinDetails[vbinItr].getValue(
									'binnumber', 'binonhand');
							var vValidBin = objBinDetails[vbinItr].getText(
									'binnumber', 'binonhand');
							if (vmakeInvAvailFlag == "T")
								var vBinQtyAvail = objBinDetails[vbinItr]
										.getValue('quantityavailable',
												'binonhand');
							else
								var vBinQtyAvail = objBinDetails[vbinItr]
										.getValue('quantityonhand', 'binonhand');
							vValidBinIdArr.push(vValidBinId);
							vValidBinTextArr.push(vValidBin);
							vValidBinAvailQtyArr.push(vBinQtyAvail);

						}
						var objBinwithSeq = null;
						if (vValidBinIdArr != null && vValidBinIdArr != ''
								&& inclIBStageInvFlag == 'T') {
							var result = nlapiLoadSearch('bin',
									'customsearch_wmsse_binsbypickzonenodir');
							// nlapiLogExecution('ERROR','vValidBinIdArr',vValidBinIdArr);
							result
									.addFilter(new nlobjSearchFilter(
											'internalid', null, 'anyof',
											vValidBinIdArr));

							if (strLocation != null && strLocation != '')
								result
										.addFilter(new nlobjSearchFilter(
												'location', null, 'anyof',
												strLocation));

							result.addFilter(new nlobjSearchFilter('inactive',
									null, 'is', 'F'));

							var objBinwithSeq = new Array();
							var resLen = result.runSearch();
							var q = 0;
							var resultSet = resLen
									.forEachResult(function(searchResult) {
										if ((searchResult
												.getValue('custrecord_wmsse_bin_loc_type') == ''
												|| searchResult
														.getValue('custrecord_wmsse_bin_loc_type') == 'null' || searchResult
												.getValue('custrecord_wmsse_bin_loc_type') == null)
												|| (stgLocId
														.indexOf(searchResult
																.getValue('custrecord_wmsse_bin_loc_type') != -1) && (searchResult
														.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
											q++;
											objBinwithSeq.push(searchResult);
										}
										if (q == 4000) {
											return false;
										}
										return true; // return true to keep
														// iterating
									});
							nlapiLogExecution('ERROR', 'objBinwithSeq',
									objBinwithSeq);

						} else if (vValidBinIdArr != null
								&& vValidBinIdArr != ''
								&& inclIBStageInvFlag != 'T') {
							nlapiLogExecution('ERROR', 'vValidBinIdArr.length',
									vValidBinIdArr.length);

							var result = nlapiLoadSearch('bin',
									'customsearch_wmsse_binsbypickzones');

							result
									.addFilter(new nlobjSearchFilter(
											'internalid', null, 'anyof',
											vValidBinIdArr));

							if (strLocation != null && strLocation != '')
								result
										.addFilter(new nlobjSearchFilter(
												'location', null, 'anyof',
												strLocation));

							result.addFilter(new nlobjSearchFilter('inactive',
									null, 'is', 'F'));

							var objBinwithSeq = new Array();
							var resLen = result.runSearch();
							var q = 0;
							var resultSet = resLen.forEachResult(function(
									searchResult) {
								q++;
								objBinwithSeq.push(searchResult);
								if (q == 4000) {
									return false;
								}
								return true; // return true to keep iterating
							});
							nlapiLogExecution('ERROR', 'objBinwithSeq',
									objBinwithSeq);

						}
						var strPickZone = strPickZoneText;
						if (objBinwithSeq != null && objBinwithSeq != ''
								&& objBinwithSeq.length > 0) {
							var vOPenTaskPickBinDetails = getOPenTaskPickBinDetails(
									getItemInternalId, vValidBinIdArr,
									strLocation, objBinDetails[0]
											.getValue('unitstype'),
									objBinDetails[0].getText('stockunit'));
							var openTaskBinIdArr = "";
							var openTaskBinQtyArr = "";
							if (vOPenTaskPickBinDetails != null
									&& vOPenTaskPickBinDetails != ''
									&& vOPenTaskPickBinDetails.length > 0) {
								openTaskBinIdArr = vOPenTaskPickBinDetails[0];
								openTaskBinQtyArr = vOPenTaskPickBinDetails[1];
							}
							// var pageIndex = pageCount * 5;
							for (var l = 0; l < objBinwithSeq.length; l++) {
								var vValidBinId = objBinwithSeq[l]
										.getValue('internalid');
								if (strPickZone == null || strPickZone == ""
										|| strPickZone == "null") {
									strPickZoneText = objBinwithSeq[l]
											.getText('custrecord_wmsse_zone');

								}
								if (vValidBinId != null && vValidBinId != '') {
									if (vValidBinIdArr.indexOf(vValidBinId) != -1) {
										var vValidBin = vValidBinTextArr[vValidBinIdArr
												.indexOf(vValidBinId)];
										var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinIdArr
												.indexOf(vValidBinId)];
										var vOpenBinQty = 0;
										if (openTaskBinIdArr != null
												&& openTaskBinIdArr != "") {
											if (openTaskBinIdArr
													.indexOf(vValidBinId) != -1) {
												vOpenBinQty = openTaskBinQtyArr[openTaskBinIdArr
														.indexOf(vValidBinId)];
											}
										}
										if (vOpenBinQty == null
												|| vOpenBinQty == ''
												|| vOpenBinQty == 'null'
												|| vOpenBinQty == 'undefined')
											vOpenBinQty = 0;
										nlapiLogExecution(
												'ERROR',
												'vValidBin,vBinQtyAvail,vOpenBinQty',
												vValidBin + "," + vBinQtyAvail
														+ "," + vOpenBinQty);
										vBinQtyAvail = parseFloat(vBinQtyAvail)
												- parseFloat(vOpenBinQty);
										if (parseFloat(vBinQtyAvail) > 0) {
											if (vValidBin != getPreferBin
													&& vValidBinId != getPreferBinId) {
												count = count + 1;

												if (count > pageIndex) {
													var currRow = [ vValidBin,
															vBinQtyAvail,
															vValidBinId,
															strPickZoneText ];
													vBinIntIdExcludeArr
															.push(vValidBinId);
													vBinLocArr.push(currRow);
												}
											}
										}

									}
								}
								if (vBinLocArr.length >= 6)
									break;
							}
						}

					}
					objBinDetails = null;
				}
				// }

			}
			if (vBinLocArr.length >= 6)
				break;
		}
	}
	objPickstrategies = null;
	filters = null;
	columns = null;
	return vBinLocArr;
}

/**
 * To get Bin location details to pick based on pick strategies
 */
function fnGetPickBinDetailsLot(getItemInternalId, strItemGrp, strItemFam,
		getPreferBin, strLocation, strItemDept, strItemClass, strOrderType,
		strvUnits, boolinclIBStageInvFlag, pageCount,
		makeInvAvailFlagFromSelect, itemUnitType, itemStockUnit,
		getStockConversionRate, getPreferBinId, AllowAllLots, vClassification) {
	var strMsg = "getItemInternalId : " + getItemInternalId + "<br>"
			+ "strItemGrp : " + strItemGrp + "<br>" + "strItemFam : "
			+ strItemFam + "<br>" + "getPreferBin : " + getPreferBin + "<br>"
			+ "getPreferBinId : " + getPreferBinId + "<br>" + "strLocation : "
			+ strLocation + "<br>" + "strItemDept : " + strItemDept + "<br>"
			+ "strItemClass : " + strItemClass + "<br>" + "strOrderType : "
			+ strOrderType + "<br>" + "strvUnits : " + strvUnits + "<br>"
			+ "pageCount : " + pageCount + "<br>" + "itemUnitType : "
			+ itemUnitType + "<br>" + "itemStockUnit : " + itemStockUnit
			+ "<br>" + "getStockConversionRate : " + getStockConversionRate
			+ "<br>" + "makeInvAvailFlagFromSelect : "
			+ makeInvAvailFlagFromSelect + "<br>" + "Classification  : "
			+ vClassification + "<br>";
	nlapiLogExecution('ERROR', 'fnGetPickBinDetailsLot', strMsg);
	var invstatusarray = new Array();
	// Check Inventorystatus Feature is turn on/off
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	if (makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == '') {
		makeInvAvailFlagFromSelect = 'All';
	}
	if (inventoryStatusFeature == true && makeInvAvailFlagFromSelect != null
			&& makeInvAvailFlagFromSelect != ''
			&& makeInvAvailFlagFromSelect != 'All') {
		if (makeInvAvailFlagFromSelect == 'T'
				|| makeInvAvailFlagFromSelect == 'F') {
			invstatusarray = getinvavailablestatus(makeInvAvailFlagFromSelect);
		} else {
			invstatusarray = getselectedstatus(makeInvAvailFlagFromSelect);
		}

	}

	var count = 0;
	if (pageCount == null || pageCount == '' || pageCount == 'undefined'
			|| pageCount == 'null' || pageCount == undefined) {
		pageCount = 0;
	}
	var pageIndex = pageCount * 5;
	var vmakeInvAvailFlag = "T";
	var fields = [ 'makeinventoryavailable' ];
	var vLocDetails = nlapiLookupField('location', strLocation, fields);
	vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
	nlapiLogExecution('ERROR', 'vmakeInvAvailFlag', vmakeInvAvailFlag);
	var vBinLocArr = new Array();
	var vPickZoneArr = new Array();
	var vValidZoneArr = new Array();
	var filterPref = new Array();
	var vIsLotItem = 'F';
	var objPrefBinDetails = "";
	var vPrefBinQtyAvailArr = new Array();
	var vPrefBinInvNumArr = new Array();
	var vPrefBinInvNumIDArr = new Array();
	var vPrefBinQtyAvailArr = new Array();
	var vprefBinStatusArr = new Array();
	var vprefBinStatusIDArr = new Array();
	var VZoneArr = new Array();
	var vBinIntIdExcludeArr = new Array();
	// Case # 201413255 start
	var systemRule_AllowExpiredItems = ' ';
	systemRule_AllowExpiredItems = getSystemRuleValue(
			'Allow picking of expired items?', strLocation);
	nlapiLogExecution("Error", "systemRule_AllowExpiredItems",
			systemRule_AllowExpiredItems);

	var stgLocId = new Array();
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('name');
	var BinlocationTypes = new nlapiSearchRecord(
			'customlist_wmsse_bin_loc_type', null, null, cols);

	if (BinlocationTypes != null && BinlocationTypes != ''
			&& BinlocationTypes.length > 0) {
		var strName = 'Stage';
		for (var b = 0; b < BinlocationTypes.length; b++) {
			var tName = BinlocationTypes[b].getValue('name');

			if (tName == strName) {
				stgLocId.push(BinlocationTypes[b].getId());
				break;
			}
		}
	}
	// Case # 201413255 end
	if (getPreferBin != null && getPreferBin != '' && getPreferBin != 'null') {

		filterPref.push(new nlobjSearchFilter('inactive', null, 'is', 'F'));
		filterPref.push(new nlobjSearchFilter('binnumber', null, 'is',
				getPreferBin));

		if (strLocation != null && strLocation != '')
			filterPref.push(new nlobjSearchFilter('location', null, 'anyof',
					strLocation));

		var objPrefBinIdDetails = new nlapiSearchRecord('bin',
				'customsearch_wmsse_binsbypickzonesearch', filterPref, null);

		var vsearchresultsExp = null;
		if (objPrefBinIdDetails != null && objPrefBinIdDetails != ''
				&& objPrefBinIdDetails.length > 0
				&& objPrefBinIdDetails[0].getValue('internalid') != null
				&& objPrefBinIdDetails[0].getValue('internalid') != '') {
			var vUnitType = "";
			var vStockUnit = "";
			if ((objPrefBinIdDetails[0]
					.getValue('custrecord_wmsse_bin_loc_type') == ''
					|| objPrefBinIdDetails[0]
							.getValue('custrecord_wmsse_bin_loc_type') == 'null' || objPrefBinIdDetails[0]
					.getValue('custrecord_wmsse_bin_loc_type') == null)
					|| (stgLocId.indexOf(objPrefBinIdDetails[0]
							.getValue('custrecord_wmsse_bin_loc_type') != -1) && (objPrefBinIdDetails[0]
							.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
				// Inventorystatus Feature is enabled
				if (inventoryStatusFeature == true) {
					vsearchresultsExp = new Array();
					// fetching 4k records only, because columns are in group
					var PrefInvDetails = new nlapiLoadSearch(
							'InventoryBalance',
							'customsearch_wmsse_inventorybalance');
					if (getItemInternalId != null && getItemInternalId != '') {
						PrefInvDetails.addFilter(new nlobjSearchFilter(
								'internalid', 'item', 'anyof',
								getItemInternalId));
					}

					if (strLocation != null && strLocation != '') {
						PrefInvDetails.addFilter(new nlobjSearchFilter(
								'location', null, 'anyof', strLocation));
					}
					PrefInvDetails.addFilter(new nlobjSearchFilter('binnumber',
							null, 'anyof', objPrefBinIdDetails[0]
									.getValue('internalid')));

					if (makeInvAvailFlagFromSelect != null
							&& makeInvAvailFlagFromSelect != ''
							&& makeInvAvailFlagFromSelect != 'null'
							&& makeInvAvailFlagFromSelect != 'undefined'
							&& makeInvAvailFlagFromSelect != undefined) {
						if (makeInvAvailFlagFromSelect == 'T'
								|| makeInvAvailFlagFromSelect == 'F') {
							PrefInvDetails.addFilter(new nlobjSearchFilter(
									'inventoryavailable', 'inventorystatus',
									'is', makeInvAvailFlagFromSelect));
						} else {
							if (makeInvAvailFlagFromSelect != 'All') {
								PrefInvDetails.addFilter(new nlobjSearchFilter(
										'status', null, 'anyof',
										makeInvAvailFlagFromSelect));
							}

						}
					}
					if (AllowAllLots == '' || AllowAllLots == 'null'
							|| AllowAllLots == null
							|| AllowAllLots == undefined) {
						AllowAllLots = 'F';
					}
					if ((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
							&& (AllowAllLots != 'T')) {
						nlapiLogExecution("Error",
								"systemRule_AllowExpiredItems",
								systemRule_AllowExpiredItems);
						PrefInvDetails
								.addFilter(new nlobjSearchFilter('formuladate',
										null, 'onorafter', DateStamp())
										.setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
					}

					var resLenDetails = PrefInvDetails.runSearch();
					var resItr = 0;
					var resultBinDetails = resLenDetails
							.forEachResult(function(searchResult) {
								resItr++;
								vsearchresultsExp.push(searchResult);
								if (resItr == 4000) {
									return false;
								}
								return true;
							});

				} else {

					var filterPrefInv = new Array();

					if (getItemInternalId != null && getItemInternalId != '')
						filterPrefInv.push(new nlobjSearchFilter('internalid',
								null, 'anyof', getItemInternalId));
					if (strLocation != null && strLocation != '')
						filterPrefInv.push(new nlobjSearchFilter('location',
								'inventoryNumberBinOnHand', 'anyof',
								strLocation));

					filterPrefInv.push(new nlobjSearchFilter('binnumber',
							'inventoryNumberBinOnHand', 'anyof',
							objPrefBinIdDetails[0].getValue('internalid')));

					objPrefBinDetails = new nlapiSearchRecord('item',
							'customsearch_wmsse_itemwise_lots', filterPrefInv,
							null);
					if (objPrefBinDetails != null && objPrefBinDetails != ''
							&& objPrefBinDetails.length > 0) {
						// case # 201412960 start
						for (var l1 = 0; l1 < objPrefBinDetails.length; l1++) {
							if (vmakeInvAvailFlag == "T")
								var vPrefBinQtyAvail = objPrefBinDetails[l1]
										.getValue('quantityavailable',
												'inventoryNumberBinOnHand');
							else
								var vPrefBinQtyAvail = objPrefBinDetails[l1]
										.getValue('quantityonhand',
												'inventoryNumberBinOnHand');
							var vPrefBinInvNum = objPrefBinDetails[l1].getText(
									'inventorynumber',
									'inventoryNumberBinOnHand');
							var vPrefBinInvNumID = objPrefBinDetails[l1]
									.getValue('inventorynumber',
											'inventoryNumberBinOnHand');
							vIsLotItem = objPrefBinDetails[l1]
									.getValue('islotitem');
							var VZone = objPrefBinDetails[l1]
									.getText('custrecord_wmsse_zone');
							vUnitType = objPrefBinDetails[l1]
									.getValue('unitstype');
							vStockUnit = objPrefBinDetails[l1]
									.getText('stockunit');
							vPrefBinQtyAvailArr.push(vPrefBinQtyAvail);
							vPrefBinInvNumArr.push(vPrefBinInvNum);
							vPrefBinInvNumIDArr.push(vPrefBinInvNumID);
							VZoneArr.push(VZone);
						}
					}
				}

				// Inventorystatus Feature is enabled
				if (inventoryStatusFeature == false) {
					var vLotExpDate = "";
					var vfiltersExp = new Array();
					if (getItemInternalId != null && getItemInternalId != "") {
						vfiltersExp.push(new nlobjSearchFilter('internalid',
								null, 'anyof', getItemInternalId));
					}
					if (strLocation != null && strLocation != ''
							&& strLocation != 'null')
						vfiltersExp.push(new nlobjSearchFilter('location',
								'inventorynumber', 'anyof', strLocation));

					if (vPrefBinInvNumIDArr != null
							&& vPrefBinInvNumIDArr != ''
							&& vPrefBinInvNumIDArr != 'null'
							&& vPrefBinInvNumIDArr != 'undefined')
						vfiltersExp
								.push(new nlobjSearchFilter('internalid',
										'inventorynumber', 'anyof',
										vPrefBinInvNumIDArr));

					// Case # 201413255 start

					if ((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
							&& (AllowAllLots != 'T')) {
						nlapiLogExecution("Error",
								"systemRule_AllowExpiredItems",
								systemRule_AllowExpiredItems);
						// vfiltersExp.push(new
						// nlobjSearchFilter('expirationdate','inventorynumber',
						// 'onorafter', DateStamp()));
						vfiltersExp
								.push(new nlobjSearchFilter('formuladate',
										null, 'onorafter', DateStamp())
										.setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
						// vfiltersExp[3].setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))");
					}
					// Case # 201413255 end

					var vcolumnsExp = new Array();
					vsearchresultsExp = nlapiSearchRecord('item',
							'customsearch_wmsse_expdate_lots', vfiltersExp,
							vcolumnsExp);
				}
				var vPrefBinOpenTaskDetails = "";
				if (objPrefBinDetails != null && objPrefBinDetails != ''
						&& objPrefBinDetails.length > 0)
					vPrefBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
							getItemInternalId, objPrefBinIdDetails[0]
									.getValue('internalid'), strLocation,
							vUnitType, vStockUnit);
				var vPrefBinOpenTaskLotArr = "";
				var vPrefBinOpenTaskExpDateArr = "";
				var vPrefBinOpenTaskBinIdArr = "";
				var vPrefBinOpenTaskBinQtyArr = "";
				var vPrefBinOpenTaskStatusArr = "";
				if (vPrefBinOpenTaskDetails != null
						&& vPrefBinOpenTaskDetails != ''
						&& vPrefBinOpenTaskDetails.length > 0) {

					vPrefBinOpenTaskBinIdArr = vPrefBinOpenTaskDetails[0];
					vPrefBinOpenTaskBinQtyArr = vPrefBinOpenTaskDetails[1];
					vPrefBinOpenTaskLotArr = vPrefBinOpenTaskDetails[3];
					vPrefBinOpenTaskExpDateArr = vPrefBinOpenTaskDetails[4];
					vPrefBinOpenTaskStatusArr = vPrefBinOpenTaskDetails[5];

				}
				if (vsearchresultsExp != null && vsearchresultsExp != '') {
					// nlapiLogExecution('EMERGENCY','vsearchresultsExp',vsearchresultsExp);
					for (var s1 = 0; s1 < vsearchresultsExp.length; s1++) {
						// nlapiLogExecution('EMERGENCY','vsearchresultsExp',vsearchresultsExp.length);
						if (inventoryStatusFeature == true) {
							if (vsearchresultsExp[s1].getValue(
									'inventorynumber', null, 'group') != null
									&& vsearchresultsExp[s1].getValue(
											'inventorynumber', null, 'group') != '') {

								vLotExpDate = vsearchresultsExp[s1].getValue(
										'expirationdate', 'inventorynumber',
										'group');
								var vnPrefBinQtyAvail = vsearchresultsExp[s1]
										.getValue('available', null, 'sum');

								var vnPrefBinInvNum = vsearchresultsExp[s1]
										.getText('inventorynumber', null,
												'group');
								var VnZone = vsearchresultsExp[s1].getText(
										'custrecord_wmsse_zone', 'binnumber',
										'group');
								var vPrefBinStatus = vsearchresultsExp[s1]
										.getText('status', null, 'group');
								var vPrefBinStatusID = vsearchresultsExp[s1]
										.getValue('status', null, 'group');
								var vOpenPrefLotQty = 0;

								if (vPrefBinOpenTaskBinIdArr != null
										&& vPrefBinOpenTaskBinIdArr != '') {
									for (var openTaskIterator = 0; openTaskIterator < vPrefBinOpenTaskBinIdArr.length; openTaskIterator++) {
										var vOpenBinId = vPrefBinOpenTaskBinIdArr[openTaskIterator];
										if (objPrefBinIdDetails[0]
												.getValue('internalid') == vOpenBinId) {
											var vOpenLot = vPrefBinOpenTaskDetails[3][openTaskIterator];
											var vOpenLotStatus = vPrefBinOpenTaskDetails[5][openTaskIterator];

											// Inventorystatus Feature is
											// enabled
											if (inventoryStatusFeature == true) {
												if (vnPrefBinInvNum == vOpenLot
														&& vPrefBinStatusID == vOpenLotStatus) {
													vOpenPrefLotQty = vPrefBinOpenTaskDetails[1][openTaskIterator];
													break;
												}
											} else {
												if (vnPrefBinInvNum == vOpenLot) {
													vOpenPrefLotQty = vPrefBinOpenTaskDetails[1][openTaskIterator];
													break;
												}
											}
										}
									}
								}
								nlapiLogExecution(
										'Error',
										'vnPrefBinQtyAvail,vOpenPrefLotQty,vPrefBinOpenTaskBinIdArr',
										vnPrefBinQtyAvail + ","
												+ vOpenPrefLotQty + ","
												+ vPrefBinOpenTaskBinIdArr);

								if (vOpenPrefLotQty == null
										|| vOpenPrefLotQty == 'null'
										|| vOpenPrefLotQty == ''
										|| vOpenPrefLotQty == 'undefined')
									vOpenPrefLotQty = 0;

								vnPrefBinQtyAvail = parseFloat(vnPrefBinQtyAvail)
										- parseFloat(vOpenPrefLotQty);
								if (parseFloat(vnPrefBinQtyAvail) > 0) {
									count = count + 1;
									if (inventoryStatusFeature == true) {
										/*
										 * if(getStockConversionRate != null &&
										 * getStockConversionRate != '' &&
										 * getStockConversionRate != 'null' &&
										 * getStockConversionRate != undefined &&
										 * getStockConversionRate !=
										 * 'undefined') { vnPrefBinQtyAvail =
										 * parseFloat(vnPrefBinQtyAvail) *
										 * parseFloat(getStockConversionRate); }
										 */
									}

									if (count > pageIndex) {

										var currRow = [
												getPreferBin,
												vnPrefBinQtyAvail,
												objPrefBinIdDetails[0]
														.getValue('internalid'),
												vnPrefBinInvNum, vLotExpDate,
												VnZone, vPrefBinStatus ];
										// vBinIntIdExcludeArr.push(objPrefBinIdDetails[0].getValue('internalid'));
										vBinLocArr.push(currRow);
									}
								}

							}

						} else {
							if (vsearchresultsExp[s1].getValue(
									'inventorynumber', 'inventorynumber') != null
									&& vsearchresultsExp[s1].getValue(
											'inventorynumber',
											'inventorynumber') != '') {
								if (vPrefBinInvNumArr
										.indexOf(vsearchresultsExp[s1]
												.getValue('inventorynumber',
														'inventorynumber')) != -1) {
									vLotExpDate = vsearchresultsExp[s1]
											.getValue('expirationdate',
													'inventorynumber');
									var vnPrefBinQtyAvail = vPrefBinQtyAvailArr[vPrefBinInvNumArr
											.indexOf(vsearchresultsExp[s1]
													.getValue(
															'inventorynumber',
															'inventorynumber'))];
									var vnPrefBinInvNum = vPrefBinInvNumArr[vPrefBinInvNumArr
											.indexOf(vsearchresultsExp[s1]
													.getValue(
															'inventorynumber',
															'inventorynumber'))];
									var VnZone = VZoneArr[vPrefBinInvNumArr
											.indexOf(vsearchresultsExp[s1]
													.getValue(
															'inventorynumber',
															'inventorynumber'))];
									var vPrefBinStatus = vprefBinStatusArr[vPrefBinInvNumArr
											.indexOf(vsearchresultsExp[s1]
													.getValue(
															'inventorynumber',
															'inventorynumber'))];
									var vPrefBinStatusID = vprefBinStatusIDArr[vPrefBinInvNumArr
											.indexOf(vsearchresultsExp[s1]
													.getValue(
															'inventorynumber',
															'inventorynumber'))];
									var vOpenPrefLotQty = 0;

									if (vPrefBinOpenTaskBinIdArr != null
											&& vPrefBinOpenTaskBinIdArr != '') {
										for (var openTaskIterator = 0; openTaskIterator < vPrefBinOpenTaskBinIdArr.length; openTaskIterator++) {
											var vOpenBinId = vPrefBinOpenTaskBinIdArr[openTaskIterator];
											if (objPrefBinIdDetails[0]
													.getValue('internalid') == vOpenBinId) {
												var vOpenLot = vPrefBinOpenTaskDetails[3][openTaskIterator];
												var vOpenLotStatus = vPrefBinOpenTaskDetails[5][openTaskIterator];

												// Inventorystatus Feature is
												// enabled
												if (inventoryStatusFeature == true) {
													if (vnPrefBinInvNum == vOpenLot
															&& vPrefBinStatusID == vOpenLotStatus) {
														vOpenPrefLotQty = vPrefBinOpenTaskDetails[1][openTaskIterator];
														break;
													}
												} else {
													if (vnPrefBinInvNum == vOpenLot) {
														vOpenPrefLotQty = vPrefBinOpenTaskDetails[1][openTaskIterator];
														break;
													}
												}
											}
										}
									}
									nlapiLogExecution(
											'ERROR',
											'vnPrefBinQtyAvail,vOpenPrefLotQty,vPrefBinOpenTaskBinIdArr',
											vnPrefBinQtyAvail + ","
													+ vOpenPrefLotQty + ","
													+ vPrefBinOpenTaskBinIdArr);

									if (vOpenPrefLotQty == null
											|| vOpenPrefLotQty == 'null'
											|| vOpenPrefLotQty == ''
											|| vOpenPrefLotQty == 'undefined')
										vOpenPrefLotQty = 0;

									vnPrefBinQtyAvail = parseFloat(vnPrefBinQtyAvail)
											- parseFloat(vOpenPrefLotQty);
									if (parseFloat(vnPrefBinQtyAvail) > 0) {
										count = count + 1;

										if (count > pageIndex) {
											var currRow = [
													getPreferBin,
													vnPrefBinQtyAvail,
													objPrefBinIdDetails[0]
															.getValue('internalid'),
													vnPrefBinInvNum,
													vLotExpDate, VnZone,
													vPrefBinStatus ];
											vBinIntIdExcludeArr
													.push(objPrefBinIdDetails[0]
															.getValue('internalid'));
											vBinLocArr.push(currRow);
										}
									}
								}
							}
						}
					}
				}

				// case # 201412960 end

			}
		}

	}

	nlapiLogExecution('ERROR', 'vBinLocArr', vBinLocArr);

	var filters = new Array();
	var columns = new Array();
	if (getItemInternalId != null && getItemInternalId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_item', null,
				'anyof', [ '@NONE@', getItemInternalId ]));
	if (strItemGrp != null && strItemGrp != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemgroup',
				null, 'anyof', [ '@NONE@', strItemGrp ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemgroup',
				null, 'anyof', [ '@NONE@' ]));
	if (strItemFam != null && strItemFam != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemfamily',
				null, 'anyof', [ '@NONE@', strItemFam ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemfamily',
				null, 'anyof', [ '@NONE@' ]));
	if (strLocation != null && strLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_location',
				null, 'anyof', [ '@NONE@', strLocation ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_location',
				null, 'anyof', [ '@NONE@' ]));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

	if (strItemDept != null && strItemDept != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_department',
				null, 'anyof', [ '@NONE@', strItemDept ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_department',
				null, 'anyof', [ '@NONE@' ]));

	if (strItemClass != null && strItemClass != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_class', null,
				'anyof', [ '@NONE@', strItemClass ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_class', null,
				'anyof', [ '@NONE@' ]));

	if (strOrderType != undefined && strOrderType != null
			&& strOrderType != 'null' && strOrderType != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_ordertype',
				null, 'anyof', [ '@NONE@', strOrderType ]));

	if (strvUnits != undefined && strvUnits != null && strvUnits != 'null'
			&& strvUnits != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_units', null,
				'anyof', [ '@NONE@', strvUnits ]));

	if (inventoryStatusFeature == true && invstatusarray != undefined
			&& invstatusarray != null && invstatusarray != 'null'
			&& invstatusarray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_invstatus', null,
				'anyof', invstatusarray));

	if (vClassification != undefined && vClassification != null
			&& vClassification != 'null' && vClassification != '') {
		var columnsclasification = new Array();
		var filtersclasification = new Array();
		columnsclasification[0] = new nlobjSearchColumn('name');
		filtersclasification.push(new nlobjSearchFilter('name', null, 'is',
				vClassification));
		var objclassification = new nlapiSearchRecord(
				'customlist_wmsse_abcvelocity', 'null', filtersclasification,
				columnsclasification);
		if (objclassification != null && objclassification != '') {
			filters.push(new nlobjSearchFilter(
					'custrecord_wmsse_pick_abcvelocity', null, 'anyof', [
							'@NONE@', objclassification[0].getId() ]));
		} else
			filters.push(new nlobjSearchFilter(
					'custrecord_wmsse_pick_abcvelocity', null, 'anyof',
					[ '@NONE@' ]));

	} else {
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_abcvelocity',
				null, 'anyof', [ '@NONE@' ]));
	}

	var objPickstrategies = new nlapiSearchRecord(
			'customrecord_wmsse_pickstrategies',
			'customsearch_wmsse_get_pickstrategies', filters, columns);
	if (objPickstrategies != null && objPickstrategies != ''
			&& objPickstrategies.length > 0) {

		var bindedBinStatusArr = new Array();
		for (var i = 0; i < objPickstrategies.length && vBinLocArr.length < 6; i++) {
			nlapiLogExecution('ERROR', 'objPickstrategies',
					objPickstrategies.length);

			var strPickZone = objPickstrategies[i]
					.getValue('custrecord_wmsse_pick_zone');
			var strInvStatus = objPickstrategies[i]
					.getText('custrecord_wmsse_invstatus');
			if (strPickZone == null || strPickZone == '')
				strPickZone = "-None-";
			var inclIBStageInvFlag = objPickstrategies[i]
					.getValue('custrecord_wmsse_pick_from_stageloc');

			// This is to restrict the display of stage bins at inventroy to bin
			// scan page
			if (boolinclIBStageInvFlag != null && boolinclIBStageInvFlag != ''
					&& boolinclIBStageInvFlag != 'null'
					&& boolinclIBStageInvFlag != 'undefined'
					&& boolinclIBStageInvFlag == 'F') {
				inclIBStageInvFlag = 'F';
			}
			// ends

			if (strPickZone != null
					&& strPickZone != ''
					&& (inventoryStatusFeature == true || vPickZoneArr
							.indexOf(strPickZone) == -1)) {
				vPickZoneArr.push(strPickZone);
				var vBinIdArr = new Array();
				var vBinArr = new Array();
				var vNonStorageBinIdArr = new Array();
				if (strPickZone != null && strPickZone != ''
						&& strPickZone != '-None-') {
					if (inclIBStageInvFlag == 'F') {

						var objBinByZoneDetails = new Array();
						var maxno = -1;
						objBinByZoneDetails = fnGetBinsbyZones(strPickZone,
								strLocation, maxno, objBinByZoneDetails);
						nlapiLogExecution('ERROR', 'objBinByZoneDetails',
								objBinByZoneDetails);
					} else {

						var objBinByZoneDetails = new Array();
						var maxno = -1;
						objBinByZoneDetails = fnGetBinsbyZonesAlongWithStage(
								strPickZone, strLocation, maxno,
								objBinByZoneDetails);

					}

					if (objBinByZoneDetails != null
							&& objBinByZoneDetails != ''
							&& objBinByZoneDetails.length > 0) {
						nlapiLogExecution('ERROR', 'objBinByZoneDetails',
								objBinByZoneDetails.length);
						for (var j = 0; j < objBinByZoneDetails.length; j++) {
							vBinIdArr.push(objBinByZoneDetails[j]
									.getValue('internalid'));
							vBinArr.push(objBinByZoneDetails[j]
									.getValue('binnumber'));
							var strPickZoneText = objBinByZoneDetails[j]
									.getText('custrecord_wmsse_zone');
							vValidZoneArr.push(strPickZoneText);

						}
					}
				} else if (strPickZone == '-None-') {
					if (inclIBStageInvFlag == 'T') {

						var objBinByZoneDetails = new Array();
						var maxno = -1;
						objBinByZoneDetails = fnGetBinsbyZonesAlongWithStage(
								strPickZone, strLocation, maxno,
								objBinByZoneDetails);

						if (objBinByZoneDetails != null
								&& objBinByZoneDetails != ''
								&& objBinByZoneDetails.length > 0) {
							nlapiLogExecution('ERROR', 'objBinByZoneDetails',
									objBinByZoneDetails.length);
							for (var j = 0; j < objBinByZoneDetails.length; j++) {
								vBinIdArr.push(objBinByZoneDetails[j]
										.getValue('internalid'));
								vBinArr.push(objBinByZoneDetails[j]
										.getValue('binnumber'));
								var strPickZoneText = objBinByZoneDetails[j]
										.getText('custrecord_wmsse_zone');
								vValidZoneArr.push(strPickZoneText);

							}
						}
					} else {

						var result = nlapiLoadSearch('bin',
								'customsearch_wmsse_non_storagebins');

						if (strLocation != null && strLocation != '')
							result.addFilter(new nlobjSearchFilter('location',
									null, 'anyof', strLocation));

						result.addFilter(new nlobjSearchFilter('inactive',
								null, 'is', 'F'));

						var objBinByZoneDetails = new Array();
						var resLen = result.runSearch();
						var q = 0;
						var resultSet = resLen.forEachResult(function(
								searchResult) {
							q++;
							objBinByZoneDetails.push(searchResult);
							if (q == 4000) {
								return false;
							}
							return true; // return true to keep iterating
						});

						if (objBinByZoneDetails != null
								&& objBinByZoneDetails != ''
								&& objBinByZoneDetails.length > 0) {
							nlapiLogExecution('ERROR', 'objBinByZoneDetails',
									objBinByZoneDetails.length);
							for (var j = 0; j < objBinByZoneDetails.length; j++) {
								vNonStorageBinIdArr.push(objBinByZoneDetails[j]
										.getId());

							}
						}
					}
				}

				if ((vNonStorageBinIdArr == null || vNonStorageBinIdArr == '')
						&& inclIBStageInvFlag == 'F') {

					var result = nlapiLoadSearch('bin',
							'customsearch_wmsse_non_storagebins');

					if (strLocation != null && strLocation != '')
						result.addFilter(new nlobjSearchFilter('location',
								null, 'anyof', strLocation));

					result.addFilter(new nlobjSearchFilter('inactive', null,
							'is', 'F'));

					var objBinByZoneDetails = new Array();
					var resLen = result.runSearch();
					var q = 0;
					var resultSet = resLen
							.forEachResult(function(searchResult) {
								q++;
								objBinByZoneDetails.push(searchResult);
								if (q == 4000) {
									return false;
								}
								return true; // return true to keep iterating
							});

					if (objBinByZoneDetails != null
							&& objBinByZoneDetails != ''
							&& objBinByZoneDetails.length > 0) {
						nlapiLogExecution('ERROR', 'objBinByZoneDetails',
								objBinByZoneDetails.length);
						for (var j = 0; j < objBinByZoneDetails.length; j++) {
							vNonStorageBinIdArr.push(objBinByZoneDetails[j]
									.getId());

						}
					}
				}

				var filterStrat = new Array();
				// Inventorystatus Feature is enabled
				if (inventoryStatusFeature == true) {
					var invstatusid = getStatusId(strInvStatus);
					nlapiLogExecution('ERROR', 'invstatusid', invstatusid);

					// nlapiLogExecution('ERROR','makeInvAvailFlagFromSelect',makeInvAvailFlagFromSelect);

					var objBinDetails = new Array();
					// fetching 4k records only, because columns are in group
					var vBinsearchDetails = new nlapiLoadSearch(
							'InventoryBalance',
							'customsearch_wmsse_inventorybalance');
					if (getItemInternalId != null && getItemInternalId != '')
						vBinsearchDetails.addFilter(new nlobjSearchFilter(
								'internalid', 'item', 'anyof',
								getItemInternalId));
					if (strLocation != null && strLocation != '')
						vBinsearchDetails.addFilter(new nlobjSearchFilter(
								'location', null, 'anyof', strLocation));
					if (vBinIdArr != null && vBinIdArr != '')
						vBinsearchDetails.addFilter(new nlobjSearchFilter(
								'binnumber', null, 'anyof', vBinIdArr));
					if (vBinIntIdExcludeArr != null
							&& vBinIntIdExcludeArr != '')
						vBinsearchDetails.addFilter(new nlobjSearchFilter(
								'binnumber', null, 'noneof',
								vBinIntIdExcludeArr));
					if (vNonStorageBinIdArr != null
							&& vNonStorageBinIdArr != '')
						vBinsearchDetails.addFilter(new nlobjSearchFilter(
								'binnumber', null, 'noneof',
								vNonStorageBinIdArr));
					if (makeInvAvailFlagFromSelect != null
							&& makeInvAvailFlagFromSelect != ''
							&& makeInvAvailFlagFromSelect != 'null'
							&& makeInvAvailFlagFromSelect != 'undefined'
							&& makeInvAvailFlagFromSelect != undefined) {
						if (makeInvAvailFlagFromSelect == 'T'
								|| makeInvAvailFlagFromSelect == 'F') {
							vBinsearchDetails.addFilter(new nlobjSearchFilter(
									'inventoryavailable', 'inventorystatus',
									'is', makeInvAvailFlagFromSelect));

							if (invstatusid != null && invstatusid != ''
									&& invstatusid != 'undefined')
								vBinsearchDetails
										.addFilter(new nlobjSearchFilter(
												'status', null, 'anyof',
												invstatusid));
						} else {
							if (makeInvAvailFlagFromSelect != 'All') {
								vBinsearchDetails
										.addFilter(new nlobjSearchFilter(
												'status', null, 'anyof',
												makeInvAvailFlagFromSelect));
							} else {
								if (invstatusid != null && invstatusid != ''
										&& invstatusid != 'undefined') {
									vBinsearchDetails
											.addFilter(new nlobjSearchFilter(
													'status', null, 'anyof',
													invstatusid));
								}

								else {
									if (strInvStatus == 'All Available')
										vBinsearchDetails
												.addFilter(new nlobjSearchFilter(
														'inventoryavailable',
														'inventorystatus',
														'is', 'T'));
									else if (strInvStatus == 'Not Available')
										vBinsearchDetails
												.addFilter(new nlobjSearchFilter(
														'inventoryavailable',
														'inventorystatus',
														'is', 'F'));
								}
							}

						}
					}
					// fetching 4k Records
					var resBinDetails = vBinsearchDetails.runSearch();
					// var resItr=0;
					var resultsPage = resBinDetails.getResults(0, 1000);
					var offset = 0;
					while (!!resultsPage && resultsPage.length > 0) {
						objBinDetails = objBinDetails.concat(resultsPage);
						offset += 1000;
						resultsPage = resBinDetails.getResults(offset,
								offset + 1000);
					}

					var vBinOpenTaskLotArr = new Array();
					var vBinOpenTaskExpDateArr = new Array();
					var vBinOpenTaskBinIdArr = new Array();
					var vBinOpenTaskBinQtyArr = new Array();
					var vBinOpenTaskStatusArr = new Array();
					if (objBinDetails != null && objBinDetails != ''
							&& objBinDetails.length > 0) {

						vIsLotItem = 'T';// objBinDetails[0].getValue('islotitem','item','group');

						var vLotExpArr = new Array();
						var vLotArr = new Array();
						var vUnitType = "";
						var vStockUnit = "";
						if (vIsLotItem == 'T') {
							var vValidBinIdArr = new Array();
							var vValidBinTextArr = new Array();
							var vValidBinAvailQtyArr = new Array();
							var vValidBinInvNumArr = new Array();
							var vValidInvNumIDArr = new Array();
							var vValidBinStatusArr = new Array();
							var vValidBinStatusIDArr = new Array();
							var vstrLotNameCSV = "";
							var strBinCSV = "";
							for (var binItr = 0; binItr < objBinDetails.length
									&& vBinLocArr.length < 6; binItr++) {
								// No need to check Status Make available flag
								var vValidBinId = objBinDetails[binItr]
										.getValue('binnumber', null, 'group');
								var vValidBin = objBinDetails[binItr].getText(
										'binnumber', null, 'group');
								var vBinQtyAvail = objBinDetails[binItr]
										.getValue('available', null, 'sum');
								/*
								 * if(getStockConversionRate != null &&
								 * getStockConversionRate != '' &&
								 * getStockConversionRate != 'null' &&
								 * getStockConversionRate != undefined &&
								 * getStockConversionRate != 'undefined') {
								 * vBinQtyAvail = parseFloat(vBinQtyAvail) *
								 * parseFloat(getStockConversionRate); }
								 */
								var vBinInvNum = objBinDetails[binItr].getText(
										'inventorynumber', null, 'group');
								vValidInvNumIDArr.push(objBinDetails[binItr]
										.getValue('inventorynumber', null,
												'group'));
								var vBinStatus = objBinDetails[binItr].getText(
										'status', null, 'group');
								var vBinStatusID = objBinDetails[binItr]
										.getValue('status', null, 'group');
								vUnitType = itemUnitType;
								vStockUnit = itemStockUnit;

								// bindedBinStatusArr
								var isLotBinStatusBinded = 'F';
								for (var binLotItr = 0; binLotItr < bindedBinStatusArr.length; binLotItr++) {
									var cRow = bindedBinStatusArr[binLotItr];
									var cBinId = cRow[0];
									var cStsId = cRow[1];
									var cLotId = cRow[2];
									if (cBinId == vValidBinId
											&& cStsId == vBinStatusID
											&& vBinInvNum == cLotId) {
										isLotBinStatusBinded = 'T';
										break;
									}
								}
								if (isLotBinStatusBinded == 'T') {
									continue;
								}

								vValidBinIdArr.push(vValidBinId);
								vValidBinTextArr.push(vValidBin);
								vValidBinAvailQtyArr.push(vBinQtyAvail);
								vValidBinInvNumArr.push(vBinInvNum);
								vValidBinStatusArr.push(vBinStatus);
								vValidBinStatusIDArr.push(objBinDetails[binItr]
										.getValue('status', null, 'group'))

								if (strBinCSV == "")
									strBinCSV = vValidBinId;
								else
									strBinCSV = strBinCSV + ',' + vValidBinId;
								if (vstrLotNameCSV == "")
									vstrLotNameCSV = vBinInvNum;
								else
									vstrLotNameCSV = vstrLotNameCSV + ','
											+ vBinInvNum;

							}

							var filtersExp = new Array();
							if (getItemInternalId != null
									&& getItemInternalId != "") {
								filtersExp.push(new nlobjSearchFilter(
										'internalid', null, 'anyof',
										getItemInternalId));
							}
							if (strLocation != null && strLocation != ''
									&& strLocation != 'null')
								filtersExp.push(new nlobjSearchFilter(
										'location', 'inventorynumber', 'anyof',
										strLocation));
							if (vValidInvNumIDArr != null
									&& vValidInvNumIDArr != '')
								filtersExp.push(new nlobjSearchFilter(
										'internalid', 'inventorynumber',
										'anyof', vValidInvNumIDArr));
							// Case # 201413255 start
							if ((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
									&& (AllowAllLots != 'T')) {
								nlapiLogExecution("Error",
										"systemRule_AllowExpiredItems",
										systemRule_AllowExpiredItems);
								// filtersExp.push(new
								// nlobjSearchFilter('expirationdate','inventorynumber',
								// 'onorafter', DateStamp()));
								filtersExp
										.push(new nlobjSearchFilter(
												'formuladate', null,
												'onorafter', DateStamp())
												.setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
								// filtersExp[2].setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))");
							}
							// Case # 201413255 end

							var columnsExp = new Array();
							var searchresultsExp = nlapiSearchRecord('item',
									'customsearch_wmsse_expdate_lots',
									filtersExp, columnsExp);
							var vTempInvBinArr = new Array();
							if (searchresultsExp != null
									&& searchresultsExp != '') {
								for (var searchItr = 0; searchItr < searchresultsExp.length; searchItr++) {

									if (searchresultsExp[searchItr].getValue(
											'inventorynumber',
											'inventorynumber') != null
											&& searchresultsExp[searchItr]
													.getValue(
															'inventorynumber',
															'inventorynumber') != '') {
										if (vValidBinInvNumArr
												.indexOf(searchresultsExp[searchItr]
														.getValue(
																'inventorynumber',
																'inventorynumber')) != -1) {
											vLotArr
													.push(searchresultsExp[searchItr]
															.getValue(
																	'inventorynumber',
																	'inventorynumber'));
											vLotExpArr
													.push(searchresultsExp[searchItr]
															.getValue(
																	'expirationdate',
																	'inventorynumber'));
										}
									}
								}
							}

							var vMainBinArr = new Array();
							var objBinwithSeq = null;
							if (vValidBinIdArr != null && vValidBinIdArr != ''
									&& inclIBStageInvFlag == 'T') {

								var result = nlapiLoadSearch('bin',
										'customsearch_wmsse_binsbypickzonenodir');

								result.addFilter(new nlobjSearchFilter(
										'internalid', null, 'anyof',
										vValidBinIdArr));

								if (strLocation != null && strLocation != '')
									result.addFilter(new nlobjSearchFilter(
											'location', null, 'anyof',
											strLocation));

								result.addFilter(new nlobjSearchFilter(
										'inactive', null, 'is', 'F'));

								var objBinwithSeq = new Array();
								var resLen = result.runSearch();
								var q = 0;
								var resultSet = resLen
										.forEachResult(function(searchResult) {
											if ((searchResult
													.getValue('custrecord_wmsse_bin_loc_type') == ''
													|| searchResult
															.getValue('custrecord_wmsse_bin_loc_type') == 'null' || searchResult
													.getValue('custrecord_wmsse_bin_loc_type') == null)
													|| (stgLocId
															.indexOf(searchResult
																	.getValue('custrecord_wmsse_bin_loc_type') != -1) && (searchResult
															.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
												q++;
												objBinwithSeq
														.push(searchResult);
											}

											if (q == 4000) {
												return false;
											}
											return true; // return true to
															// keep iterating
										});
								nlapiLogExecution('ERROR', 'objBinwithSeq',
										objBinwithSeq);
							}
							if (vValidBinIdArr != null && vValidBinIdArr != ''
									&& inclIBStageInvFlag != 'T') {

								var result = nlapiLoadSearch('bin',
										'customsearch_wmsse_binsbypickzones');

								result.addFilter(new nlobjSearchFilter(
										'internalid', null, 'anyof',
										vValidBinIdArr));

								if (strLocation != null && strLocation != '')
									result.addFilter(new nlobjSearchFilter(
											'location', null, 'anyof',
											strLocation));

								result.addFilter(new nlobjSearchFilter(
										'inactive', null, 'is', 'F'));

								var objBinwithSeq = new Array();
								var resLen = result.runSearch();
								var q = 0;
								var resultSet = resLen.forEachResult(function(
										searchResult) {
									q++;
									objBinwithSeq.push(searchResult);
									if (q == 4000) {
										return false;
									}
									return true; // return true to keep
													// iterating
								});
								nlapiLogExecution('ERROR', 'objBinwithSeq',
										objBinwithSeq);

							}

							var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
									getItemInternalId, vValidBinIdArr,
									strLocation, vUnitType, vStockUnit);

							if (vBinOpenTaskDetails != null
									&& vBinOpenTaskDetails != ''
									&& vBinOpenTaskDetails.length > 0) {
								vBinOpenTaskBinIdArr
										.push(vBinOpenTaskDetails[0]);
								vBinOpenTaskBinQtyArr
										.push(vBinOpenTaskDetails[1]);
								vBinOpenTaskLotArr.push(vBinOpenTaskDetails[3]);
								vBinOpenTaskExpDateArr
										.push(vBinOpenTaskDetails[4]);
								vBinOpenTaskStatusArr
										.push(vBinOpenTaskDetails[5]);

							}
							/* var pageIndex = pageCount * 5; */
							for (var lotItr = 0; lotItr < vLotArr.length
									&& vBinLocArr.length < 6; lotItr++) {
								var vZone = '';
								if (vLotArr[lotItr] != null
										&& vLotArr[lotItr] != '') {
									var vLotExp = vLotExpArr[lotItr];
									var vTempLotArrNew = vstrLotNameCSV
											.split(',');
									var vTempLotArr = new Array();
									for (var tempItr = 0; tempItr < vTempLotArrNew.length; tempItr++) {
										var tLot = vTempLotArrNew[tempItr];
										if (tLot == vLotArr[lotItr]) {
											vTempLotArr.push(tempItr);
										}
									}

									if (vTempLotArr.length > 1)// Means lot
																// occures in
																// more than
																// once
									{
										if (objBinwithSeq != null
												&& objBinwithSeq != ''
												&& objBinwithSeq.length > 0) {

											for (var binseqItr = 0; binseqItr < objBinwithSeq.length
													&& vBinLocArr.length < 6; binseqItr++) {
												var vValidBinId = objBinwithSeq[binseqItr]
														.getValue('internalid');

												var vZone = "";
												if (vBinIdArr.length > 0
														&& vBinIdArr
																.indexOf(vValidBinId) != -1) {
													vZone = vValidZoneArr[vBinIdArr
															.indexOf(vValidBinId)];
												} else {
													vZone = objBinwithSeq[binseqItr]
															.getText('custrecord_wmsse_zone');
												}

												if (vValidBinId != null
														&& vValidBinId != '') {
													for (invItr = 0; invItr < vValidBinIdArr.length; invItr++) {

														if (vValidBinIdArr[invItr] == vValidBinId
																&& vValidBinInvNumArr[invItr] == vLotArr[lotItr]) {

															var vValidBin = vValidBinTextArr[invItr];
															var vBinQtyAvail = vValidBinAvailQtyArr[invItr];
															var vBinQtyInvNum = vValidBinInvNumArr[invItr];
															var vValidBinStatus = vValidBinStatusArr[invItr];
															var vValidBinStatusId = vValidBinStatusIDArr[invItr];
															var vOpenLotQty = 0;

															nlapiLogExecution(
																	'ERROR',
																	'inside vBinQtyInvNum,vValidBin ',
																	vBinQtyInvNum
																			+ ","
																			+ vValidBin);
															if (vBinOpenTaskDetails[0] != null
																	&& vBinOpenTaskDetails[0] != '') {
																// nlapiLogExecution('ERROR',
																// 'vBinOpenTaskDetails[0]
																// ',vBinOpenTaskDetails[0].length);
																for (var openTskItr = 0; openTskItr < vBinOpenTaskDetails[0].length; openTskItr++) {
																	var vOpenBinId = vBinOpenTaskDetails[0][openTskItr];
																	var vOpenStatusID = vBinOpenTaskDetails[5][openTskItr];
																	if (vValidBinId == vOpenBinId) {
																		var vOpenLot = vBinOpenTaskDetails[3][openTskItr];
																		if (vBinQtyInvNum == vOpenLot
																				&& vOpenStatusID == vValidBinStatusId) {
																			vOpenLotQty = vBinOpenTaskDetails[1][openTskItr];
																			break;
																		}
																	}
																}
															}
															nlapiLogExecution(
																	'ERROR',
																	'inside if vBinQtyAvail,vOpenLotQty ',
																	vBinQtyAvail
																			+ ","
																			+ vOpenLotQty);

															if (vOpenLotQty == null
																	|| vOpenLotQty == 'null'
																	|| vOpenLotQty == ''
																	|| vOpenLotQty == 'undefined')
																vOpenLotQty = 0;

															vBinQtyAvail = parseFloat(vBinQtyAvail)
																	- parseFloat(vOpenLotQty);
															if (parseFloat(vBinQtyAvail) > 0) {
																/*
																 * if(getStockConversionRate !=
																 * null &&
																 * getStockConversionRate != '' &&
																 * getStockConversionRate !=
																 * 'null' &&
																 * getStockConversionRate !=
																 * undefined &&
																 * getStockConversionRate !=
																 * 'undefined') {
																 * vBinQtyAvail =
																 * parseFloat(vBinQtyAvail) *
																 * parseFloat(getStockConversionRate); }
																 */

																// if(vValidBin
																// !=
																// getPreferBin)
																if (vValidBin != getPreferBin
																		&& vValidBinId != getPreferBinId) {
																	count = count + 1;

																	if (count > pageIndex) {
																		var currRow = [
																				vValidBin,
																				vBinQtyAvail,
																				vValidBinId,
																				vBinQtyInvNum,
																				vLotExp,
																				vZone,
																				vValidBinStatus ];
																		vBinIntIdExcludeArr
																				.push(vValidBinId);
																		vBinLocArr
																				.push(currRow);
																		var row1 = [
																				vValidBinId,
																				vValidBinStatusId,
																				vBinQtyInvNum ];
																		bindedBinStatusArr
																				.push(row1);
																	} else {
																		var row = [
																				vValidBinId,
																				vValidBinStatusId,
																				vBinQtyInvNum ];
																		bindedBinStatusArr
																				.push(row);
																	}
																}
															}

														}
													}
												}
												if (vBinLocArr.length >= 6)
													break;

											}
										}
									} else {
										var vValidBin = vValidBinTextArr[vValidBinInvNumArr
												.indexOf(vLotArr[lotItr])];
										var vValidBinId = vValidBinIdArr[vValidBinInvNumArr
												.indexOf(vLotArr[lotItr])];
										var vValidBinStatus = vValidBinStatusArr[vValidBinInvNumArr
												.indexOf(vLotArr[lotItr])];
										var vValidBinStatusID = vValidBinStatusIDArr[vValidBinInvNumArr
												.indexOf(vLotArr[lotItr])];
										var vZone = "";
										if (vBinIdArr.indexOf(vValidBinId) != -1) {
											vZone = vValidZoneArr[vBinIdArr
													.indexOf(vValidBinId)];
										} else {
											for (var Itr = 0; Itr < objBinwithSeq.length; Itr++) {
												var vTempBinId = objBinwithSeq[Itr]
														.getValue('internalid');
												if (vTempBinId == vValidBinId) {
													vZone = objBinwithSeq[Itr]
															.getText('custrecord_wmsse_zone');
													break;
												}
											}
										}

										var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinInvNumArr
												.indexOf(vLotArr[lotItr])];
										var vBinQtyInvNum = vValidBinInvNumArr[vValidBinInvNumArr
												.indexOf(vLotArr[lotItr])];

										var vOpenLotQty = 0;

										if (vBinOpenTaskDetails[0] != null
												&& vBinOpenTaskDetails[0] != '') {
											for (var openTskItr = 0; openTskItr < vBinOpenTaskDetails[0].length; openTskItr++) {
												var vOpenBinId = vBinOpenTaskDetails[0][openTskItr];
												var vOpenStatusID = vBinOpenTaskDetails[5][openTskItr];
												if (vValidBinId == vOpenBinId) {
													var vOpenLot = vBinOpenTaskDetails[3][openTskItr];
													if (vBinQtyInvNum == vOpenLot
															&& vOpenStatusID == vValidBinStatusID) {
														vOpenLotQty = vBinOpenTaskDetails[1][openTskItr];
														break;
													}
												}
											}
										}
										nlapiLogExecution('ERROR',
												'vBinQtyAvail,vOpenLotQty ',
												vBinQtyAvail + ","
														+ vOpenLotQty);

										if (vOpenLotQty == null
												|| vOpenLotQty == 'null'
												|| vOpenLotQty == ''
												|| vOpenLotQty == 'undefined')
											vOpenLotQty = 0;

										vBinQtyAvail = parseFloat(vBinQtyAvail)
												- parseFloat(vOpenLotQty);
										if (parseFloat(vBinQtyAvail) > 0) {
											/*
											 * if(getStockConversionRate != null &&
											 * getStockConversionRate != '' &&
											 * getStockConversionRate != 'null' &&
											 * getStockConversionRate !=
											 * undefined &&
											 * getStockConversionRate !=
											 * 'undefined') { vBinQtyAvail =
											 * parseFloat(vBinQtyAvail) *
											 * parseFloat(getStockConversionRate); }
											 */

											// if(vValidBin != getPreferBin)
											if (vValidBin != getPreferBin
													&& vValidBinId != getPreferBinId) {
												count = count + 1;
												if (count > pageIndex) {
													var currRow = [ vValidBin,
															vBinQtyAvail,
															vValidBinId,
															vBinQtyInvNum,
															vLotExp, vZone,
															vValidBinStatus ];
													// vBinIntIdExcludeArr.push(vValidBinId);
													vBinLocArr.push(currRow);
													var row = [ vValidBinId,
															vValidBinStatusID,
															vBinQtyInvNum ];
													bindedBinStatusArr
															.push(row);
												} else {
													var row = [ vValidBinId,
															vValidBinStatusID,
															vBinQtyInvNum ];
													bindedBinStatusArr
															.push(row);
												}
											}
										}
									}
									if (vBinLocArr.length >= 6)
										break;
								}

							}

						} else {

							var vValidBinIdArr = new Array();
							var vValidBinTextArr = new Array();
							var vValidBinAvailQtyArr = new Array();
							var vValidBinInvNumArr = new Array();
							for (var binDetailsItr = 0; binDetailsItr < objBinDetails.length; binDetailsItr++) {
								var vValidBinId = objBinDetails[binDetailsItr]
										.getValue('binnumber',
												'inventoryNumberBinOnHand');
								var vValidBin = objBinDetails[binDetailsItr]
										.getText('binnumber',
												'inventoryNumberBinOnHand');
								if (vmakeInvAvailFlag == "T")
									var vBinQtyAvail = objBinDetails[binDetailsItr]
											.getValue('quantityavailable',
													'inventoryNumberBinOnHand');
								else
									var vBinQtyAvail = objBinDetails[binDetailsItr]
											.getValue('quantityonhand',
													'inventoryNumberBinOnHand');
								var vBinInvNum = objBinDetails[binDetailsItr]
										.getText('inventorynumber',
												'inventoryNumberBinOnHand');
								vValidBinIdArr.push(vValidBinId);
								vValidBinTextArr.push(vValidBin);
								vValidBinAvailQtyArr.push(vBinQtyAvail);
								vValidBinInvNumArr.push(vBinInvNum);

							}
							var objBinwithSeq = null;
							if (vValidBinIdArr != null && vValidBinIdArr != ''
									&& inclIBStageInvFlag == 'T') {

								var result = nlapiLoadSearch('bin',
										'customsearch_wmsse_binsbypickzonenodir');

								result.addFilter(new nlobjSearchFilter(
										'internalid', null, 'anyof',
										vValidBinIdArr));

								if (strLocation != null && strLocation != '')
									result.addFilter(new nlobjSearchFilter(
											'location', null, 'anyof',
											strLocation));

								result.addFilter(new nlobjSearchFilter(
										'inactive', null, 'is', 'F'));

								var objBinwithSeq = new Array();
								var resLen = result.runSearch();
								var q = 0;
								var resultSet = resLen
										.forEachResult(function(searchResult) {
											if ((searchResult
													.getValue('custrecord_wmsse_bin_loc_type') == ''
													|| searchResult
															.getValue('custrecord_wmsse_bin_loc_type') == 'null' || searchResult
													.getValue('custrecord_wmsse_bin_loc_type') == null)
													|| (stgLocId
															.indexOf(searchResult
																	.getValue('custrecord_wmsse_bin_loc_type') != -1) && (searchResult
															.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
												q++;
												objBinwithSeq
														.push(searchResult);
											}
											if (q == 4000) {
												return false;
											}
											return true; // return true to
															// keep iterating
										});
								nlapiLogExecution('ERROR', 'objBinwithSeq',
										objBinwithSeq);
							}
							if (vValidBinIdArr != null && vValidBinIdArr != ''
									&& inclIBStageInvFlag != 'T') {

								var result = nlapiLoadSearch('bin',
										'customsearch_wmsse_binsbypickzones');

								result.addFilter(new nlobjSearchFilter(
										'internalid', null, 'anyof',
										vValidBinIdArr));

								if (strLocation != null && strLocation != '')
									result.addFilter(new nlobjSearchFilter(
											'location', null, 'anyof',
											strLocation));

								result.addFilter(new nlobjSearchFilter(
										'inactive', null, 'is', 'F'));

								var objBinwithSeq = new Array();
								var resLen = result.runSearch();
								var q = 0;
								var resultSet = resLen.forEachResult(function(
										searchResult) {
									q++;
									objBinwithSeq.push(searchResult);
									if (q == 4000) {
										return false;
									}
									return true; // return true to keep
													// iterating
								});
								nlapiLogExecution('ERROR', 'objBinwithSeq',
										objBinwithSeq);
							}

							var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
									getItemInternalId, vValidBinIdArr,
									strLocation, objBinDetails[0]
											.getValue('unitstype'),
									objBinDetails[0].getText('stockunit'));

							if (vBinOpenTaskDetails != null
									&& vBinOpenTaskDetails != ''
									&& vBinOpenTaskDetails.length > 0) {
								vBinOpenTaskBinIdArr
										.push(vBinOpenTaskDetails[0]);
								vBinOpenTaskBinQtyArr
										.push(vBinOpenTaskDetails[1]);
								vBinOpenTaskLotArr.push(vBinOpenTaskDetails[3]);
								vBinOpenTaskExpDateArr
										.push(vBinOpenTaskDetails[4]);
							}

							if (objBinwithSeq != null && objBinwithSeq != ''
									&& objBinwithSeq.length > 0) {
								for (var binseqItr = 0; binseqItr < objBinwithSeq.length; binseqItr++) {
									var vValidBinId = objBinwithSeq[binseqItr]
											.getValue('internalid');
									var vZone = objBinwithSeq[binseqItr]
											.getText('custrecord_wmsse_zone');
									if (vValidBinId != null
											&& vValidBinId != '') {
										if (vValidBinIdArr.indexOf(vValidBinId) != -1) {
											var vValidBin = vValidBinTextArr[vValidBinIdArr
													.indexOf(vValidBinId)];
											var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinIdArr
													.indexOf(vValidBinId)];
											var vBinQtyInvNum = vValidBinInvNumArr[vValidBinIdArr
													.indexOf(vValidBinId)];
											var vOpenLotQty = 0;

											if (vBinOpenTaskDetails[0] != null
													&& vBinOpenTaskDetails[0] != '') {
												for (var openTskItr = 0; openTskItr < vBinOpenTaskDetails[0].length; openTskItr++) {
													var vOpenBinId = vBinOpenTaskDetails[0][openTskItr];
													var vOpenStatusId = vBinOpenTaskDetails[5][openTskItr];
													if (vValidBinId == vOpenBinId) {
														var vOpenLot = vBinOpenTaskDetails[3][openTskItr];
														if (vBinQtyInvNum == vOpenLot) {
															vOpenLotQty = vBinOpenTaskDetails[1][openTskItr];
															break;
														}
													}
												}
											}
											nlapiLogExecution(
													'ERROR',
													'vBinQtyAvail,vOpenLotQty ',
													vBinQtyAvail + ","
															+ vOpenLotQty);

											if (vOpenLotQty == null
													|| vOpenLotQty == 'null'
													|| vOpenLotQty == ''
													|| vOpenLotQty == 'undefined')
												vOpenLotQty = 0;

											vBinQtyAvail = parseFloat(vBinQtyAvail)
													- parseFloat(vOpenLotQty);
											if (parseFloat(vBinQtyAvail) > 0) {
												/*
												 * if(getStockConversionRate !=
												 * null &&
												 * getStockConversionRate != '' &&
												 * getStockConversionRate !=
												 * 'null' &&
												 * getStockConversionRate !=
												 * undefined &&
												 * getStockConversionRate !=
												 * 'undefined') { vBinQtyAvail =
												 * parseFloat(vBinQtyAvail) *
												 * parseFloat(getStockConversionRate); }
												 */
												if (vValidBin != getPreferBin
														&& vValidBinId != getPreferBinId) {
													count = count + 1;
													if (count > pageIndex) {
														var currRow = [
																vValidBin,
																vBinQtyAvail,
																vValidBinId,
																vBinQtyInvNum,
																'', vZone ];
														vBinIntIdExcludeArr
																.push(vValidBinId);
														vBinLocArr
																.push(currRow);
													}
												}
											}
										}
									}
									if (vBinLocArr.length >= 6)
										break;
								}
							}
						}

					}
					objBinDetails = null;

				} else {

					if (getItemInternalId != null && getItemInternalId != '')
						filterStrat.push(new nlobjSearchFilter('internalid',
								null, 'anyof', getItemInternalId));
					if (strLocation != null && strLocation != '')
						filterStrat.push(new nlobjSearchFilter('location',
								'inventoryNumberBinOnHand', 'anyof',
								strLocation));
					if (vBinIdArr != null && vBinIdArr != '')
						filterStrat
								.push(new nlobjSearchFilter('binnumber',
										'inventoryNumberBinOnHand', 'anyof',
										vBinIdArr));
					if (vBinIntIdExcludeArr != null
							&& vBinIntIdExcludeArr != '')
						filterStrat.push(new nlobjSearchFilter('binnumber',
								'inventoryNumberBinOnHand', 'noneof',
								vBinIntIdExcludeArr));
					if (vNonStorageBinIdArr != null
							&& vNonStorageBinIdArr != '')
						filterStrat.push(new nlobjSearchFilter('binnumber',
								'inventoryNumberBinOnHand', 'noneof',
								vNonStorageBinIdArr));

					var objBinDetails = new nlapiSearchRecord('item',
							'customsearch_wmsse_itemwise_lots', filterStrat,
							null);
					var vBinOpenTaskLotArr = new Array();
					var vBinOpenTaskExpDateArr = new Array();
					var vBinOpenTaskBinIdArr = new Array();
					var vBinOpenTaskBinQtyArr = new Array();
					if (objBinDetails != null && objBinDetails != ''
							&& objBinDetails.length > 0) {

						vIsLotItem = objBinDetails[0].getValue('islotitem');
						// nlapiLogExecution('ERROR','vIsLotItem',vIsLotItem);
						var vLotExpArr = new Array();
						var vLotArr = new Array();
						if (vIsLotItem == 'T') {
							var vValidBinIdArr = new Array();
							var vValidBinTextArr = new Array();
							var vValidBinAvailQtyArr = new Array();
							var vValidBinInvNumArr = new Array();
							var vValidInvNumIDArr = new Array();
							var vstrLotNameCSV = "";
							var strBinCSV = "";
							for (var j = 0; j < objBinDetails.length
									&& vBinLocArr.length < 6; j++) {
								var vValidBinId = objBinDetails[j]
										.getValue('binnumber',
												'inventoryNumberBinOnHand');
								var vValidBin = objBinDetails[j]
										.getText('binnumber',
												'inventoryNumberBinOnHand');
								if (vmakeInvAvailFlag == "T")
									var vBinQtyAvail = objBinDetails[j]
											.getValue('quantityavailable',
													'inventoryNumberBinOnHand');
								else
									var vBinQtyAvail = objBinDetails[j]
											.getValue('quantityonhand',
													'inventoryNumberBinOnHand');
								var vBinInvNum = objBinDetails[j].getText(
										'inventorynumber',
										'inventoryNumberBinOnHand');
								vValidInvNumIDArr.push(objBinDetails[j]
										.getValue('inventorynumber',
												'inventoryNumberBinOnHand'));
								// var VZone =
								// objBinDetails[j].getText('binnumber','custrecord_wmsse_zone');
								// nlapiLogExecution('ERROR',
								// 'currValues[5]VZone', VZone);
								vValidBinIdArr.push(vValidBinId);
								vValidBinTextArr.push(vValidBin);
								vValidBinAvailQtyArr.push(vBinQtyAvail);
								vValidBinInvNumArr.push(vBinInvNum);
								// vValidZoneArr.push(vValidBinId,strPickZone,strPickZoneText);
								if (strBinCSV == "")
									strBinCSV = vValidBinId;
								else
									strBinCSV = strBinCSV + ',' + vValidBinId;
								if (vstrLotNameCSV == "")
									vstrLotNameCSV = vBinInvNum;
								else
									vstrLotNameCSV = vstrLotNameCSV + ','
											+ vBinInvNum;

							}

							var filtersExp = new Array();
							if (getItemInternalId != null
									&& getItemInternalId != "") {
								filtersExp.push(new nlobjSearchFilter(
										'internalid', null, 'anyof',
										getItemInternalId));
							}
							if (strLocation != null && strLocation != ''
									&& strLocation != 'null')
								filtersExp.push(new nlobjSearchFilter(
										'location', 'inventorynumber', 'anyof',
										strLocation));
							if (vValidInvNumIDArr != null
									&& vValidInvNumIDArr != '')
								filtersExp.push(new nlobjSearchFilter(
										'internalid', 'inventorynumber',
										'anyof', vValidInvNumIDArr));
							// Case # 201413255 start
							if (systemRule_AllowExpiredItems == 'N'
									|| systemRule_AllowExpiredItems == '') {
								nlapiLogExecution("Error",
										"systemRule_AllowExpiredItems",
										systemRule_AllowExpiredItems);
								// filtersExp.push(new
								// nlobjSearchFilter('expirationdate','inventorynumber',
								// 'onorafter', DateStamp()));
								filtersExp
										.push(new nlobjSearchFilter(
												'formuladate', null,
												'onorafter', DateStamp())
												.setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
								// filtersExp[2].setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))");
							}
							// Case # 201413255 end

							var columnsExp = new Array();
							var searchresultsExp = nlapiSearchRecord('item',
									'customsearch_wmsse_expdate_lots',
									filtersExp, columnsExp);
							var vTempInvBinArr = new Array();
							if (searchresultsExp != null
									&& searchresultsExp != '') {
								for (var s = 0; s < searchresultsExp.length; s++) {

									if (searchresultsExp[s].getValue(
											'inventorynumber',
											'inventorynumber') != null
											&& searchresultsExp[s].getValue(
													'inventorynumber',
													'inventorynumber') != '') {
										if (vValidBinInvNumArr
												.indexOf(searchresultsExp[s]
														.getValue(
																'inventorynumber',
																'inventorynumber')) != -1) {
											vLotArr.push(searchresultsExp[s]
													.getValue(
															'inventorynumber',
															'inventorynumber'));
											vLotExpArr.push(searchresultsExp[s]
													.getValue('expirationdate',
															'inventorynumber'));
										}
									}
								}
							}

							var vMainBinArr = new Array();
							var objBinwithSeq = null;
							if (vValidBinIdArr != null && vValidBinIdArr != ''
									&& inclIBStageInvFlag == 'T') {

								var result = nlapiLoadSearch('bin',
										'customsearch_wmsse_binsbypickzonenodir');

								result.addFilter(new nlobjSearchFilter(
										'internalid', null, 'anyof',
										vValidBinIdArr));

								if (strLocation != null && strLocation != '')
									result.addFilter(new nlobjSearchFilter(
											'location', null, 'anyof',
											strLocation));

								result.addFilter(new nlobjSearchFilter(
										'inactive', null, 'is', 'F'));

								var objBinwithSeq = new Array();
								var resLen = result.runSearch();
								var q = 0;
								var resultSet = resLen
										.forEachResult(function(searchResult) {
											if ((searchResult
													.getValue('custrecord_wmsse_bin_loc_type') == ''
													|| searchResult
															.getValue('custrecord_wmsse_bin_loc_type') == 'null' || searchResult
													.getValue('custrecord_wmsse_bin_loc_type') == null)
													|| (stgLocId
															.indexOf(searchResult
																	.getValue('custrecord_wmsse_bin_loc_type') != -1) && (searchResult
															.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
												q++;
												objBinwithSeq
														.push(searchResult);
											}

											if (q == 4000) {
												return false;
											}
											return true; // return true to
															// keep iterating
										});
								nlapiLogExecution('ERROR', 'objBinwithSeq',
										objBinwithSeq);
							}
							if (vValidBinIdArr != null && vValidBinIdArr != ''
									&& inclIBStageInvFlag != 'T') {

								var result = nlapiLoadSearch('bin',
										'customsearch_wmsse_binsbypickzones');

								result.addFilter(new nlobjSearchFilter(
										'internalid', null, 'anyof',
										vValidBinIdArr));

								if (strLocation != null && strLocation != '')
									result.addFilter(new nlobjSearchFilter(
											'location', null, 'anyof',
											strLocation));

								result.addFilter(new nlobjSearchFilter(
										'inactive', null, 'is', 'F'));

								var objBinwithSeq = new Array();
								var resLen = result.runSearch();
								var q = 0;
								var resultSet = resLen.forEachResult(function(
										searchResult) {
									q++;
									objBinwithSeq.push(searchResult);
									if (q == 4000) {
										return false;
									}
									return true; // return true to keep
													// iterating
								});
								nlapiLogExecution('ERROR', 'objBinwithSeq',
										objBinwithSeq);

							}

							var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
									getItemInternalId, vValidBinIdArr,
									strLocation, objBinDetails[0]
											.getValue('unitstype'),
									objBinDetails[0].getText('stockunit'));

							if (vBinOpenTaskDetails != null
									&& vBinOpenTaskDetails != ''
									&& vBinOpenTaskDetails.length > 0) {
								vBinOpenTaskBinIdArr
										.push(vBinOpenTaskDetails[0]);
								vBinOpenTaskBinQtyArr
										.push(vBinOpenTaskDetails[1]);
								vBinOpenTaskLotArr.push(vBinOpenTaskDetails[3]);
								vBinOpenTaskExpDateArr
										.push(vBinOpenTaskDetails[4]);

							}

							for (var u = 0; u < vLotArr.length
									&& vBinLocArr.length < 6; u++) {
								var vZone = '';
								if (vLotArr[u] != null && vLotArr[u] != '') {
									var vLotExp = vLotExpArr[u];
									var vTempLotArrNew = vstrLotNameCSV
											.split(',');
									var vTempLotArr = new Array();
									for (var l = 0; l < vTempLotArrNew.length; l++) {
										var tLot = vTempLotArrNew[l];
										if (tLot == vLotArr[u]) {
											vTempLotArr.push(l);
										}
									}
									// var
									// vTempLotArr=vstrLotNameCSV.split(',');
									if (vTempLotArr.length > 1)// Means lot
																// occures in
																// more than
																// once
									{
										if (objBinwithSeq != null
												&& objBinwithSeq != ''
												&& objBinwithSeq.length > 0) {
											for (var l = 0; l < objBinwithSeq.length
													&& vBinLocArr.length < 6; l++) {
												var vValidBinId = objBinwithSeq[l]
														.getValue('internalid');
												// nlapiLogExecution('ERROR',
												// 'if
												// vLotArr[u],vValidBinInvNumArr.indexOf(vLotArr[u])
												// ',vLotArr[u]+","+vValidBinInvNumArr.indexOf(vLotArr[u]));
												// nlapiLogExecution('ERROR',
												// 'if vValidBinId
												// ',vValidBinId);
												var vZone = "";
												if (vBinIdArr.length > 0
														&& vBinIdArr
																.indexOf(vValidBinId) != -1) {
													vZone = vValidZoneArr[vBinIdArr
															.indexOf(vValidBinId)];
												} else {
													vZone = objBinwithSeq[l]
															.getText('custrecord_wmsse_zone');
												}

												if (vValidBinId != null
														&& vValidBinId != '') {
													for (l1 = 0; l1 < vValidBinIdArr.length; l1++) {
														/*
														 * if(vValidBinIdArr.indexOf(vValidBinId) !=
														 * -1 &&
														 * vValidBinInvNumArr[vValidBinIdArr.indexOf(vValidBinId)] ==
														 * vLotArr[u]) {
														 */
														if (vValidBinIdArr[l1] == vValidBinId
																&& vValidBinInvNumArr[l1] == vLotArr[u]) {

															/*
															 * var vValidBin =
															 * vValidBinTextArr[vValidBinIdArr.indexOf(vValidBinId)];
															 * var vBinQtyAvail =
															 * vValidBinAvailQtyArr[vValidBinIdArr.indexOf(vValidBinId)];
															 * var vBinQtyInvNum =
															 * vValidBinInvNumArr[vValidBinIdArr.indexOf(vValidBinId)];
															 * var vOpenLotQty =
															 * 0;
															 */
															var vValidBin = vValidBinTextArr[l1];
															var vBinQtyAvail = vValidBinAvailQtyArr[l1];
															var vBinQtyInvNum = vValidBinInvNumArr[l1];
															var vOpenLotQty = 0;
															/*
															 * if(vBinOpenTaskLotArr!=null &&
															 * vBinOpenTaskLotArr!='') {
															 * if((vBinOpenTaskLotArr.indexOf(vLotArr[u])) !=
															 * -1 &&
															 * (vBinOpenTaskBinIdArr[vBinOpenTaskLotArr.indexOf(vLotArr[u])] ==
															 * vValidBinId)) {
															 * vOpenLotQty =
															 * vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(vLotArr[u])]; } }
															 */
															nlapiLogExecution(
																	'ERROR',
																	'inside vBinQtyInvNum,vValidBin ',
																	vBinQtyInvNum
																			+ ","
																			+ vValidBin);
															if (vBinOpenTaskDetails[0] != null
																	&& vBinOpenTaskDetails[0] != '') {
																// nlapiLogExecution('ERROR',
																// 'vBinOpenTaskDetails[0]
																// ',vBinOpenTaskDetails[0].length);
																for (var m1 = 0; m1 < vBinOpenTaskDetails[0].length; m1++) {
																	var vOpenBinId = vBinOpenTaskDetails[0][m1];
																	if (vValidBinId == vOpenBinId) {
																		var vOpenLot = vBinOpenTaskDetails[3][m1];
																		if (vBinQtyInvNum == vOpenLot) {
																			vOpenLotQty = vBinOpenTaskDetails[1][m1];
																			break;
																		}
																	}
																}
															}
															nlapiLogExecution(
																	'ERROR',
																	'inside if vBinQtyAvail,vOpenLotQty ',
																	vBinQtyAvail
																			+ ","
																			+ vOpenLotQty);

															if (vOpenLotQty == null
																	|| vOpenLotQty == 'null'
																	|| vOpenLotQty == ''
																	|| vOpenLotQty == 'undefined')
																vOpenLotQty = 0;

															vBinQtyAvail = parseFloat(vBinQtyAvail)
																	- parseFloat(vOpenLotQty);
															if (parseFloat(vBinQtyAvail) > 0) {
																if (vValidBin != getPreferBin
																		&& vValidBinId != getPreferBinId) {
																	count = count + 1;
																	if (count > pageIndex) {
																		var currRow = [
																				vValidBin,
																				vBinQtyAvail,
																				vValidBinId,
																				vBinQtyInvNum,
																				vLotExp,
																				vZone ];
																		vBinIntIdExcludeArr
																				.push(vValidBinId);
																		vBinLocArr
																				.push(currRow);
																	}
																}
															}

														}
													}
												}
												if (vBinLocArr.length >= 6)
													break;
											}
										}
									} else {
										var vValidBin = vValidBinTextArr[vValidBinInvNumArr
												.indexOf(vLotArr[u])];
										var vValidBinId = vValidBinIdArr[vValidBinInvNumArr
												.indexOf(vLotArr[u])];
										var vZone = "";
										if (vBinIdArr.indexOf(vValidBinId) != -1) {
											vZone = vValidZoneArr[vBinIdArr
													.indexOf(vValidBinId)];
										} else {
											for (var q = 0; q < objBinwithSeq.length; q++) {
												var vTempBinId = objBinwithSeq[q]
														.getValue('internalid');
												if (vTempBinId == vValidBinId) {
													vZone = objBinwithSeq[q]
															.getText('custrecord_wmsse_zone');
													break;
												}
											}
										}

										var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinInvNumArr
												.indexOf(vLotArr[u])];
										var vBinQtyInvNum = vValidBinInvNumArr[vValidBinInvNumArr
												.indexOf(vLotArr[u])];
										// var vZone =
										// vValidZoneArr[vValidBinInvNumArr.indexOf(vLotArr[u])];
										var vOpenLotQty = 0;
										/*
										 * if(vBinOpenTaskLotArr!=null &&
										 * vBinOpenTaskLotArr!='') {
										 * if((vBinOpenTaskLotArr.indexOf(vLotArr[u]) !=
										 * -1) &&
										 * (vBinOpenTaskBinIdArr[vBinOpenTaskLotArr.indexOf(vLotArr[u])] ==
										 * vValidBinId ) ) { vOpenLotQty =
										 * vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(vLotArr[u])]; } }
										 */
										if (vBinOpenTaskDetails[0] != null
												&& vBinOpenTaskDetails[0] != '') {
											for (var m1 = 0; m1 < vBinOpenTaskDetails[0].length; m1++) {
												var vOpenBinId = vBinOpenTaskDetails[0][m1];
												if (vValidBinId == vOpenBinId) {
													var vOpenLot = vBinOpenTaskDetails[3][m1];
													if (vBinQtyInvNum == vOpenLot) {
														vOpenLotQty = vBinOpenTaskDetails[1][m1];
														break;
													}
												}
											}
										}
										nlapiLogExecution('ERROR',
												'vBinQtyAvail,vOpenLotQty ',
												vBinQtyAvail + ","
														+ vOpenLotQty);

										if (vOpenLotQty == null
												|| vOpenLotQty == 'null'
												|| vOpenLotQty == ''
												|| vOpenLotQty == 'undefined')
											vOpenLotQty = 0;

										vBinQtyAvail = parseFloat(vBinQtyAvail)
												- parseFloat(vOpenLotQty);
										if (parseFloat(vBinQtyAvail) > 0) {
											if (vValidBin != getPreferBin
													&& vValidBinId != getPreferBinId) {
												count = count + 1;
												if (count > pageIndex) {
													var currRow = [ vValidBin,
															vBinQtyAvail,
															vValidBinId,
															vBinQtyInvNum,
															vLotExp, vZone ];
													vBinIntIdExcludeArr
															.push(vValidBinId);
													vBinLocArr.push(currRow);
												}
											}
										}
									}
									if (vBinLocArr.length >= 6)
										break;
								}

							}

						} else {
							/*
							 * if(getPreferBin != null && getPreferBin != '')
							 * vBinLocArr[0]=[getPreferBin,0];
							 */
							var vValidBinIdArr = new Array();
							var vValidBinTextArr = new Array();
							var vValidBinAvailQtyArr = new Array();
							var vValidBinInvNumArr = new Array();
							for (var j = 0; j < objBinDetails.length; j++) {
								var vValidBinId = objBinDetails[j]
										.getValue('binnumber',
												'inventoryNumberBinOnHand');
								var vValidBin = objBinDetails[j]
										.getText('binnumber',
												'inventoryNumberBinOnHand');
								if (vmakeInvAvailFlag == "T")
									var vBinQtyAvail = objBinDetails[j]
											.getValue('quantityavailable',
													'inventoryNumberBinOnHand');
								else
									var vBinQtyAvail = objBinDetails[j]
											.getValue('quantityonhand',
													'inventoryNumberBinOnHand');
								var vBinInvNum = objBinDetails[j].getText(
										'inventorynumber',
										'inventoryNumberBinOnHand');
								vValidBinIdArr.push(vValidBinId);
								vValidBinTextArr.push(vValidBin);
								vValidBinAvailQtyArr.push(vBinQtyAvail);
								vValidBinInvNumArr.push(vBinInvNum);

							}
							var objBinwithSeq = null;
							if (vValidBinIdArr != null && vValidBinIdArr != ''
									&& inclIBStageInvFlag == 'T') {

								var result = nlapiLoadSearch('bin',
										'customsearch_wmsse_binsbypickzonenodir');

								result.addFilter(new nlobjSearchFilter(
										'internalid', null, 'anyof',
										vValidBinIdArr));

								if (strLocation != null && strLocation != '')
									result.addFilter(new nlobjSearchFilter(
											'location', null, 'anyof',
											strLocation));

								result.addFilter(new nlobjSearchFilter(
										'inactive', null, 'is', 'F'));

								var objBinwithSeq = new Array();
								var resLen = result.runSearch();
								var q = 0;
								var resultSet = resLen
										.forEachResult(function(searchResult) {
											if ((searchResult
													.getValue('custrecord_wmsse_bin_loc_type') == ''
													|| searchResult
															.getValue('custrecord_wmsse_bin_loc_type') == 'null' || searchResult
													.getValue('custrecord_wmsse_bin_loc_type') == null)
													|| (stgLocId
															.indexOf(searchResult
																	.getValue('custrecord_wmsse_bin_loc_type') != -1) && (searchResult
															.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
												q++;
												objBinwithSeq
														.push(searchResult);
											}
											if (q == 4000) {
												return false;
											}
											return true; // return true to
															// keep iterating
										});
								nlapiLogExecution('ERROR', 'objBinwithSeq',
										objBinwithSeq);
							}
							if (vValidBinIdArr != null && vValidBinIdArr != ''
									&& inclIBStageInvFlag != 'T') {

								var result = nlapiLoadSearch('bin',
										'customsearch_wmsse_binsbypickzones');

								result.addFilter(new nlobjSearchFilter(
										'internalid', null, 'anyof',
										vValidBinIdArr));

								if (strLocation != null && strLocation != '')
									result.addFilter(new nlobjSearchFilter(
											'location', null, 'anyof',
											strLocation));

								result.addFilter(new nlobjSearchFilter(
										'inactive', null, 'is', 'F'));

								var objBinwithSeq = new Array();
								var resLen = result.runSearch();
								var q = 0;
								var resultSet = resLen.forEachResult(function(
										searchResult) {
									q++;
									objBinwithSeq.push(searchResult);
									if (q == 4000) {
										return false;
									}
									return true; // return true to keep
													// iterating
								});
								nlapiLogExecution('ERROR', 'objBinwithSeq',
										objBinwithSeq);
							}

							var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
									getItemInternalId, vValidBinIdArr,
									strLocation, objBinDetails[0]
											.getValue('unitstype'),
									objBinDetails[0].getText('stockunit'));

							if (vBinOpenTaskDetails != null
									&& vBinOpenTaskDetails != ''
									&& vBinOpenTaskDetails.length > 0) {
								vBinOpenTaskBinIdArr
										.push(vBinOpenTaskDetails[0]);
								vBinOpenTaskBinQtyArr
										.push(vBinOpenTaskDetails[1]);
								vBinOpenTaskLotArr.push(vBinOpenTaskDetails[3]);
								vBinOpenTaskExpDateArr
										.push(vBinOpenTaskDetails[4]);
							}

							if (objBinwithSeq != null && objBinwithSeq != ''
									&& objBinwithSeq.length > 0) {
								for (var l = 0; l < objBinwithSeq.length; l++) {
									var vValidBinId = objBinwithSeq[l]
											.getValue('internalid');
									var vZone = objBinwithSeq[l]
											.getText('custrecord_wmsse_zone');
									if (vValidBinId != null
											&& vValidBinId != '') {
										if (vValidBinIdArr.indexOf(vValidBinId) != -1) {
											var vValidBin = vValidBinTextArr[vValidBinIdArr
													.indexOf(vValidBinId)];
											var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinIdArr
													.indexOf(vValidBinId)];
											var vBinQtyInvNum = vValidBinInvNumArr[vValidBinIdArr
													.indexOf(vValidBinId)];
											var vOpenLotQty = 0;
											/*
											 * if(vBinOpenTaskBinIdArr != null &&
											 * vBinOpenTaskBinIdArr !='') {
											 * if((vBinOpenTaskBinIdArr.indexOf(vValidBinId) !=
											 * -1) &&
											 * (vBinOpenTaskLotArr.indexOf(vBinQtyInvNum) !=
											 * -1) &&
											 * (vBinOpenTaskBinIdArr.indexOf(vValidBinId) ==
											 * vBinOpenTaskLotArr.indexOf(vBinQtyInvNum))) {
											 * vOpenLotQty =
											 * vBinOpenTaskBinQtyArr[vBinOpenTaskBinIdArr.indexOf(vValidBinId)]; } }
											 */
											if (vBinOpenTaskDetails[0] != null
													&& vBinOpenTaskDetails[0] != '') {
												for (var m1 = 0; m1 < vBinOpenTaskDetails[0].length; m1++) {
													var vOpenBinId = vBinOpenTaskDetails[0][m1];
													if (vValidBinId == vOpenBinId) {
														var vOpenLot = vBinOpenTaskDetails[3][m1];
														if (vBinQtyInvNum == vOpenLot) {
															vOpenLotQty = vBinOpenTaskDetails[1][m1];
															break;
														}
													}
												}
											}
											nlapiLogExecution(
													'ERROR',
													'vBinQtyAvail,vOpenLotQty ',
													vBinQtyAvail + ","
															+ vOpenLotQty);

											if (vOpenLotQty == null
													|| vOpenLotQty == 'null'
													|| vOpenLotQty == ''
													|| vOpenLotQty == 'undefined')
												vOpenLotQty = 0;

											vBinQtyAvail = parseFloat(vBinQtyAvail)
													- parseFloat(vOpenLotQty);
											if (parseFloat(vBinQtyAvail) > 0) {
												if (vValidBin != getPreferBin) {
													var currRow = [ vValidBin,
															vBinQtyAvail,
															vValidBinId,
															vBinQtyInvNum, '',
															vZone ];
													vBinIntIdExcludeArr
															.push(vValidBinId);
													vBinLocArr.push(currRow);
												}
											}

										}
									}
									if (vBinLocArr.length >= 6)
										break;
								}
							}
						}

					}
					objBinDetails = null;
				}

			}
			if (vBinLocArr.length >= 6)
				break;
		}
	}
	objPickstrategies = null;
	filters = null;
	columns = null;
	return vBinLocArr;
}

function fnGetPickBinDetailsLotWithExpiryDates(getItemInternalId, vBinIdArr,
		getPreferBin, strLocation, pageCount, makeInvAvailFlagFromSelect,
		itemUnitType, itemStockUnit, getStockConversionRate, AllowAllLots) {
	nlapiLogExecution('ERROR', 'getItemInternalId', getItemInternalId);
	nlapiLogExecution('ERROR', 'vBinIdArr', vBinIdArr);
	nlapiLogExecution('ERROR', 'getPreferBin', getPreferBin);
	nlapiLogExecution('ERROR', 'strLocation', strLocation);
	var vmakeInvAvailFlag = "T";
	var fields = [ 'makeinventoryavailable' ];
	var vLocDetails = nlapiLookupField('location', strLocation, fields);
	vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
	nlapiLogExecution('ERROR', 'vmakeInvAvailFlag', vmakeInvAvailFlag);
	// Check Inventorystatus Feature is turn on/off
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	var count = 0;
	if (pageCount == null || pageCount == '' || pageCount == 'undefined'
			|| pageCount == 'null' || pageCount == undefined) {
		pageCount = 0;
	}

	// Case # 201413255 start
	var systemRule_AllowExpiredItems = ' ';
	systemRule_AllowExpiredItems = getSystemRuleValue(
			'Allow picking of expired items?', strLocation);
	nlapiLogExecution("Error", "systemRule_AllowExpiredItems",
			systemRule_AllowExpiredItems);
	// Case # 201413255 end
	nlapiLogExecution('ERROR', 'inventoryStatusFeature', inventoryStatusFeature);
	// Inventorystatus Feature is enabled
	if (inventoryStatusFeature == true) {
		var objBinDetails = new Array();
		var vBinLocArr = new Array();
		// fetching 4k records only, because columns are in group
		var objBinResults = new nlapiLoadSearch('InventoryBalance',
				'customsearch_wmsse_inventorybalance');
		if (getItemInternalId != null && getItemInternalId != '')
			objBinResults.addFilter(new nlobjSearchFilter('internalid', 'item',
					'anyof', getItemInternalId));
		if (strLocation != null && strLocation != '')
			objBinResults.addFilter(new nlobjSearchFilter('location', null,
					'anyof', strLocation));
		if (vBinIdArr != null && vBinIdArr != '')
			objBinResults.addFilter(new nlobjSearchFilter('binnumber', null,
					'anyof', vBinIdArr));
		if (makeInvAvailFlagFromSelect != null
				&& makeInvAvailFlagFromSelect != ''
				&& makeInvAvailFlagFromSelect != 'null'
				&& makeInvAvailFlagFromSelect != 'undefined'
				&& makeInvAvailFlagFromSelect != undefined) {
			if (makeInvAvailFlagFromSelect == 'T'
					|| makeInvAvailFlagFromSelect == 'F') {
				objBinResults.addFilter(new nlobjSearchFilter(
						'inventoryavailable', 'inventorystatus', 'is',
						makeInvAvailFlagFromSelect));
			} else {
				if (makeInvAvailFlagFromSelect != 'All') {
					objBinResults.addFilter(new nlobjSearchFilter('status',
							null, 'anyof', makeInvAvailFlagFromSelect));
				}

			}
		}

		if ((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
				&& (AllowAllLots != 'T'))

		{
			nlapiLogExecution("Error", "systemRule_AllowExpiredItems",
					systemRule_AllowExpiredItems);
			objBinResults
					.addFilter(new nlobjSearchFilter('formuladate', null,
							'onorafter', DateStamp())
							.setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));

		}

		var resLenDetails = objBinResults.runSearch();
		/*
		 * var resItr=0; var resultBinDetails =
		 * resLenDetails.forEachResult(function(searchResult) { resItr++;
		 * objBinDetails.push(searchResult); if(resItr==4000) { return false; }
		 * return true; });
		 */

		var resultsPage = resLenDetails.getResults(0, 1000);
		var offset = 0;
		while (!!resultsPage && resultsPage.length > 0) {
			objBinDetails = objBinDetails.concat(resultsPage);
			offset += 1000;
			resultsPage = resLenDetails.getResults(offset, offset + 1000);
		}

		if (objBinDetails != null && objBinDetails != ''
				&& objBinDetails.length > 0) {

			var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
					getItemInternalId, vBinIdArr, strLocation, itemUnitType,
					itemStockUnit);
			var vBinOpenTaskLotArr = "";
			var vBinOpenTaskExpDateArr = "";
			var vBinOpenTaskBinIdArr = "";
			var vBinOpenTaskBinQtyArr = "";
			var pageIndex = pageCount * 5;
			if (vBinOpenTaskDetails != null && vBinOpenTaskDetails != ''
					&& vBinOpenTaskDetails.length > 0) {
				vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
				vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
				vBinOpenTaskLotArr = vBinOpenTaskDetails[3];
				vBinOpenTaskExpDateArr = vBinOpenTaskDetails[4];

			}
			nlapiLogExecution('ERROR', 'vBinOpenTaskDetails',
					vBinOpenTaskDetails);
			vIsLotItem = 'T';// objBinDetails[0].getValue('islotitem','item','group');
			nlapiLogExecution('ERROR', 'vIsLotItem', vIsLotItem);
			var vLotExpArr = new Array();
			var vLotArr = new Array();
			if (vIsLotItem == 'T') {
				var vValidBinIdArr = new Array();
				var vValidBinTextArr = new Array();
				var vValidBinAvailQtyArr = new Array();
				var vValidBinInvNumArr = new Array();
				var vValidBinStatusArr = new Array();
				var vValidBinStatusIDArr = new Array();
				var vstrLotNameCSV = "";
				var strBinCSV = "";
				for (var binItr = 0; binItr < objBinDetails.length; binItr++) {
					// No need to check status Makeavailable flag
					var vValidBinId = objBinDetails[binItr].getValue(
							'binnumber', null, 'group');
					var vValidBin = objBinDetails[binItr].getText('binnumber',
							null, 'group');
					var vBinQtyAvail = objBinDetails[binItr].getValue(
							'available', null, 'sum');
					var vBinInvNum = objBinDetails[binItr].getText(
							'inventorynumber', null, 'group');
					var vBinStatus = objBinDetails[binItr].getText('status',
							null, 'group');
					var vValidBinStatusId = objBinDetails[binItr].getValue(
							'status', null, 'group');
					var vLotExp = objBinDetails[binItr].getValue(
							'expirationdate', 'inventorynumber', 'group');
					var vOpenLotQty = 0;

					if (vBinOpenTaskBinIdArr != null
							&& vBinOpenTaskBinIdArr != '') {
						nlapiLogExecution('ERROR', 'vBinOpenTaskDetails',
								vBinOpenTaskDetails);
						for (var openTskItr = 0; openTskItr < vBinOpenTaskBinIdArr.length; openTskItr++) {
							var vOpenBinId = vBinOpenTaskBinIdArr[openTskItr];
							var vOpenStatusID = vBinOpenTaskDetails[5][openTskItr];
							nlapiLogExecution('ERROR', 'vOpenBinId', vOpenBinId);
							if (vValidBinId == vOpenBinId) {
								var vOpenLot = vBinOpenTaskDetails[3][openTskItr];

								if (vBinInvNum == vOpenLot
										&& vOpenStatusID == vValidBinStatusId) {
									nlapiLogExecution('ERROR', 'vOpenStatusID',
											vOpenStatusID);
									nlapiLogExecution('ERROR',
											'vValidBinStatusId',
											vValidBinStatusId);
									nlapiLogExecution('ERROR', 'vOpenLot',
											vOpenLot);
									nlapiLogExecution('ERROR', 'vBinInvNum',
											vBinInvNum);
									vOpenLotQty = vBinOpenTaskDetails[1][openTskItr];
									break;
								}
								nlapiLogExecution('ERROR', 'vOpenLotQty',
										vOpenLotQty);
							}
						}
					}

					if (vOpenLotQty == null || vOpenLotQty == 'null'
							|| vOpenLotQty == '' || vOpenLotQty == 'undefined')
						vOpenLotQty = 0;
					vBinQtyAvail = parseFloat(vBinQtyAvail)
							- parseFloat(vOpenLotQty);

					if (parseFloat(vBinQtyAvail) > 0) {
						/*
						 * if(getStockConversionRate != null &&
						 * getStockConversionRate != '' &&
						 * getStockConversionRate != 'null' &&
						 * getStockConversionRate != undefined &&
						 * getStockConversionRate != 'undefined') { vBinQtyAvail =
						 * parseFloat(vBinQtyAvail) *
						 * parseFloat(getStockConversionRate); }
						 */
						count = count + 1;
						if (vValidBin != getPreferBin) {
							if (count > pageIndex) {
								var currRow = [ vValidBin, vBinQtyAvail,
										vValidBinId, vBinInvNum, vLotExp,
										vBinStatus ];
								vBinLocArr.push(currRow);
							}
						}
					}

					if (vBinLocArr.length >= 6)
						break;
				}

			}

		}

	} else {
		var vBinLocArr = new Array();
		var filterStrat = new Array();

		if (getItemInternalId != null && getItemInternalId != '')
			filterStrat.push(new nlobjSearchFilter('internalid', null, 'anyof',
					getItemInternalId));
		if (strLocation != null && strLocation != '')
			filterStrat.push(new nlobjSearchFilter('location',
					'inventoryNumberBinOnHand', 'anyof', strLocation));
		if (vBinIdArr != null && vBinIdArr != '')
			filterStrat.push(new nlobjSearchFilter('binnumber',
					'inventoryNumberBinOnHand', 'anyof', vBinIdArr));
		// Case # 201413255 start
		var systemRule_AllowExpiredItems = ' ';
		systemRule_AllowExpiredItems = getSystemRuleValue(
				'Allow picking of expired items?', strLocation);
		nlapiLogExecution("Error", "systemRule_AllowExpiredItems",
				systemRule_AllowExpiredItems);
		// Case # 201413255 end
		var objBinDetails = new nlapiSearchRecord('item',
				'customsearch_wmsse_itemwise_lots', filterStrat, null);
		if (objBinDetails != null && objBinDetails != ''
				&& objBinDetails.length > 0) {
			nlapiLogExecution('ERROR', 'objBinDetails', objBinDetails.length);
			vIsLotItem = objBinDetails[0].getValue('islotitem');
			nlapiLogExecution('ERROR', 'vIsLotItem', vIsLotItem);
			var vLotExpArr = new Array();
			var vLotArr = new Array();
			if (vIsLotItem == 'T') {
				var vValidBinIdArr = new Array();
				var vValidBinTextArr = new Array();
				var vValidBinAvailQtyArr = new Array();
				var vValidBinInvNumArr = new Array();
				var vstrLotNameCSV = "";
				var strBinCSV = "";
				for (var j = 0; j < objBinDetails.length; j++) {
					var vValidBinId = objBinDetails[j].getValue('binnumber',
							'inventoryNumberBinOnHand');
					var vValidBin = objBinDetails[j].getText('binnumber',
							'inventoryNumberBinOnHand');
					if (vmakeInvAvailFlag == "T")
						var vBinQtyAvail = objBinDetails[j]
								.getValue('quantityavailable',
										'inventoryNumberBinOnHand');
					else
						var vBinQtyAvail = objBinDetails[j].getValue(
								'quantityonhand', 'inventoryNumberBinOnHand');
					var vBinInvNum = objBinDetails[j].getText(
							'inventorynumber', 'inventoryNumberBinOnHand');
					vValidBinIdArr.push(vValidBinId);
					vValidBinTextArr.push(vValidBin);
					vValidBinAvailQtyArr.push(vBinQtyAvail);
					vValidBinInvNumArr.push(vBinInvNum);
					if (strBinCSV == "")
						strBinCSV = vValidBinId;
					else
						strBinCSV = strBinCSV + ',' + vValidBinId;
					if (vstrLotNameCSV == "")
						vstrLotNameCSV = vBinInvNum;
					else
						vstrLotNameCSV = vstrLotNameCSV + ',' + vBinInvNum;

				}

				var filtersExp = new Array();
				if (getItemInternalId != null && getItemInternalId != "") {
					filtersExp[0] = new nlobjSearchFilter('internalid', null,
							'anyof', getItemInternalId);

				}
				if (strLocation != null && strLocation != ''
						&& strLocation != 'null')
					filtersExp[1] = new nlobjSearchFilter('location',
							'inventorynumber', 'anyof', strLocation);
				// Case # 201413255 start
				if ((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
						&& (AllowAllLots != 'T')) {
					nlapiLogExecution("Error", "systemRule_AllowExpiredItems",
							systemRule_AllowExpiredItems);
					// filtersExp[2] = new
					// nlobjSearchFilter('expirationdate','inventorynumber',
					// 'onorafter', DateStamp()));
					// filtersExp[0] = new nlobjSearchFilter('formuladate',null,
					// 'onorafter',date1);
					filtersExp
							.push(new nlobjSearchFilter('formuladate', null,
									'onorafter', DateStamp())
									.setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
					// filtersExp[2].setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))");
					// filtersExp[2] = new nlobjSearchFilter('formuladate',null,
					// 'onorafter',DateStamp());
					// filtersExp[2].setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))");
				}
				// Case # 201413255 end
				var columnsExp = new Array();
				var searchresultsExp = nlapiSearchRecord('item',
						'customsearch_wmsse_expdate_lots', filtersExp,
						columnsExp);
				var vTempInvBinArr = new Array();
				if (searchresultsExp != null && searchresultsExp != '') {
					for (var s = 0; s < searchresultsExp.length; s++) {

						if (searchresultsExp[s].getValue('inventorynumber',
								'inventorynumber') != null
								&& searchresultsExp[s].getValue(
										'inventorynumber', 'inventorynumber') != '') {
							if (vValidBinInvNumArr.indexOf(searchresultsExp[s]
									.getValue('inventorynumber',
											'inventorynumber')) != -1) {
								vLotArr.push(searchresultsExp[s].getValue(
										'inventorynumber', 'inventorynumber'));
								vLotExpArr.push(searchresultsExp[s].getValue(
										'expirationdate', 'inventorynumber'));
							}
						}
					}
				}
				nlapiLogExecution('ERROR', 'searchresultsExp', searchresultsExp);
				nlapiLogExecution('ERROR', 'vLot Arr', vLotArr);
				nlapiLogExecution('ERROR', 'vLotExpArr Arr', vLotExpArr);
				var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
						getItemInternalId, vValidBinIdArr, strLocation,
						objBinDetails[0].getValue('unitstype'),
						objBinDetails[0].getText('stockunit'));
				var vBinOpenTaskLotArr = "";
				var vBinOpenTaskExpDateArr = "";
				var vBinOpenTaskBinIdArr = "";
				var vBinOpenTaskBinQtyArr = "";
				var pageIndex = pageCount * 5;
				if (vBinOpenTaskDetails != null && vBinOpenTaskDetails != ''
						&& vBinOpenTaskDetails.length > 0) {
					vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
					vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
					vBinOpenTaskLotArr = vBinOpenTaskDetails[3];
					vBinOpenTaskExpDateArr = vBinOpenTaskDetails[4];
				}
				for (var u = 0; u < vLotArr.length; u++) {
					if (vLotArr[u] != null && vLotArr[u] != '') {
						var vLotExp = vLotExpArr[u];
						var vTempLotArrNew = vstrLotNameCSV.split(',');
						var vTempLotArr = new Array();
						for (var l = 0; l < vTempLotArrNew.length; l++) {
							var tLot = vTempLotArrNew[l];
							if (tLot == vLotArr[u]) {
								vTempLotArr.push(l);
							}
						}
						// var vTempLotArr=vstrLotNameCSV.split(vLotArr[u]);
						/*
						 * if(vTempLotArr.length>2)//Means lot occures in more
						 * than once {
						 */
						if (vTempLotArr.length > 1)// Means lot occures in more
													// than once
						{
							for (l1 = 0; l1 < vValidBinIdArr.length; l1++) {
								nlapiLogExecution('ERROR',
										'vTempLotArr inside if', vTempLotArr);
								if (vValidBinInvNumArr[l1] == vLotArr[u]) {
									/*
									 * var vValidBin =
									 * vValidBinTextArr[vValidBinInvNumArr.indexOf(vLotArr[u])];
									 * var vValidBinId =
									 * vValidBinIdArr[vValidBinInvNumArr.indexOf(vLotArr[u])];
									 * var vBinQtyAvail =
									 * vValidBinAvailQtyArr[vValidBinInvNumArr.indexOf(vLotArr[u])];
									 * var vBinQtyInvNum =
									 * vValidBinInvNumArr[vValidBinInvNumArr.indexOf(vLotArr[u])];
									 */
									var vValidBin = vValidBinTextArr[l1];
									var vValidBinId = vValidBinIdArr[l1];
									var vBinQtyAvail = vValidBinAvailQtyArr[l1];
									var vBinQtyInvNum = vValidBinInvNumArr[l1];
									var vOpenLotQty = 0;
									/*
									 * if(vBinOpenTaskLotArr != null &&
									 * vBinOpenTaskLotArr !='' &&
									 * vBinOpenTaskBinIdArr != null &&
									 * vBinOpenTaskBinIdArr != '' ) {
									 * if((vBinOpenTaskLotArr.indexOf(vBinQtyInvNum) !=
									 * -1) &&
									 * (vBinOpenTaskBinIdArr.indexOf(vValidBinId)
									 * !=-1 ) &&
									 * (vBinOpenTaskLotArr.indexOf(vBinQtyInvNum) ==
									 * vBinOpenTaskBinIdArr.indexOf(vValidBinId))) {
									 * vOpenLotQty =
									 * vBinOpenTaskBinQtyArr[vBinOpenTaskBinIdArr.indexOf(vBinQtyInvNum)]; } }
									 */
									nlapiLogExecution('ERROR', 'vLotArr[u]',
											vLotArr[u]);
									/*
									 * if(vBinOpenTaskLotArr!=null &&
									 * vBinOpenTaskLotArr!='') {
									 * if((vBinOpenTaskLotArr.indexOf(vLotArr[u])) !=
									 * -1 &&
									 * (vBinOpenTaskBinIdArr[vBinOpenTaskLotArr.indexOf(vLotArr[u])] ==
									 * vValidBinId)) { vOpenLotQty =
									 * vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(vLotArr[u])]; } }
									 */
									if (vBinOpenTaskBinIdArr != null
											&& vBinOpenTaskBinIdArr != '') {
										for (var m1 = 0; m1 < vBinOpenTaskBinIdArr.length; m1++) {
											var vOpenBinId = vBinOpenTaskBinIdArr[m1];
											if (vValidBinId == vOpenBinId) {
												var vOpenLot = vBinOpenTaskDetails[3][m1];
												if (vBinQtyInvNum == vOpenLot) {
													vOpenLotQty = vBinOpenTaskDetails[1][m1];
													break;
												}
											}
										}
									}
									nlapiLogExecution('ERROR',
											'vBinQtyAvail,vOpenLotQty ',
											vBinQtyAvail + "," + vOpenLotQty);

									if (vOpenLotQty == null
											|| vOpenLotQty == 'null'
											|| vOpenLotQty == ''
											|| vOpenLotQty == 'undefined')
										vOpenLotQty = 0;

									// vBinQtyAvail = parseFloat(vBinQtyAvail) -
									// parseFloat(vOpenLotQty);
									vBinQtyAvail = parseFloat(vBinQtyAvail)
											- parseFloat(vOpenLotQty);
									if (parseFloat(vBinQtyAvail) > 0) {
										count = count + 1;
										if (vValidBin != getPreferBin) {
											if (count > pageIndex) {
												var currRow = [ vValidBin,
														vBinQtyAvail,
														vValidBinId,
														vBinQtyInvNum, vLotExp ];
												vBinLocArr.push(currRow);
											}
										}
									}
								}
								if (vBinLocArr.length >= 6)
									break;

								/*
								 * if(vBinLocArr.length>=5) break;
								 */
							}

						} else {
							nlapiLogExecution('ERROR',
									'vTempLotArr inside else', vTempLotArr);
							var vValidBin = vValidBinTextArr[vValidBinInvNumArr
									.indexOf(vLotArr[u])];
							var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinInvNumArr
									.indexOf(vLotArr[u])];
							var vBinQtyInvNum = vValidBinInvNumArr[vValidBinInvNumArr
									.indexOf(vLotArr[u])];
							var vValidBinId = vValidBinIdArr[vValidBinInvNumArr
									.indexOf(vLotArr[u])];

							var vOpenLotQty = 0;
							/*
							 * if(vBinOpenTaskLotArr != null &&
							 * vBinOpenTaskLotArr !='' && vBinOpenTaskBinIdArr !=
							 * null && vBinOpenTaskBinIdArr != '' ) {
							 * if((vBinOpenTaskLotArr.indexOf(vBinQtyInvNum) !=
							 * -1) && (vBinOpenTaskBinIdArr.indexOf(vValidBinId)
							 * !=-1 ) &&
							 * (vBinOpenTaskLotArr.indexOf(vBinQtyInvNum) ==
							 * vBinOpenTaskBinIdArr.indexOf(vValidBinId))) {
							 * vOpenLotQty =
							 * vBinOpenTaskBinQtyArr[vBinOpenTaskBinIdArr.indexOf(vBinQtyInvNum)]; } }
							 */
							nlapiLogExecution('ERROR', 'vLotArr[u]', vLotArr[u]);
							/*
							 * if(vBinOpenTaskLotArr!=null &&
							 * vBinOpenTaskLotArr!='') {
							 * if((vBinOpenTaskLotArr.indexOf(vLotArr[u])) != -1 &&
							 * (vBinOpenTaskBinIdArr[vBinOpenTaskLotArr.indexOf(vLotArr[u])] ==
							 * vValidBinId)) { vOpenLotQty =
							 * vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(vLotArr[u])]; } }
							 */
							if (vBinOpenTaskBinIdArr != null
									&& vBinOpenTaskBinIdArr != '') {
								for (var m1 = 0; m1 < vBinOpenTaskBinIdArr.length; m1++) {
									var vOpenBinId = vBinOpenTaskBinIdArr[m1];
									if (vValidBinId == vOpenBinId) {
										var vOpenLot = vBinOpenTaskDetails[3][m1];
										if (vBinQtyInvNum == vOpenLot) {
											vOpenLotQty = vBinOpenTaskDetails[1][m1];
											break;
										}
									}
								}
							}
							nlapiLogExecution('ERROR',
									'vBinQtyAvail,vOpenLotQty ', vBinQtyAvail
											+ "," + vOpenLotQty);

							if (vOpenLotQty == null || vOpenLotQty == 'null'
									|| vOpenLotQty == ''
									|| vOpenLotQty == 'undefined')
								vOpenLotQty = 0;

							// vBinQtyAvail = parseFloat(vBinQtyAvail) -
							// parseFloat(vOpenLotQty);
							vBinQtyAvail = parseFloat(vBinQtyAvail)
									- parseFloat(vOpenLotQty);
							if (parseFloat(vBinQtyAvail) > 0) {
								count = count + 1;
								if (vValidBin != getPreferBin) {
									if (count > pageIndex) {
										var currRow = [ vValidBin,
												vBinQtyAvail, vValidBinId,
												vBinQtyInvNum, vLotExp ];
										vBinLocArr.push(currRow);
									}
								}
							}
						}
						if (vBinLocArr.length >= 6)
							break;
					}

				}

			}
		}
	}
	objBinDetails = null;
	searchresultsExp = null;
	return vBinLocArr;
}

/**
 * To get opoen task details of selected bin locations
 * 
 * @param vItemId
 * @param vBinArray
 * @param whLocation
 * @returns {vPickBinArr}
 */
function getOPenTaskPickBinDetails(vItemId, vBinArray, whLocation, vUnitType,
		StockUnitText, serialNUM, status) {
	nlapiLogExecution('ERROR', 'vItemId,{vBinArray},whLocation', vItemId + ",{"
			+ vBinArray + "}," + whLocation);
	nlapiLogExecution('ERROR', 'vUnitType,StockUnitText,serialNUM', vUnitType
			+ "," + StockUnitText + "," + serialNUM);
	var vPickBinDetailsArr = new Array();
	var vPickBinIdArr = new Array();
	var vPickBinTextArr = new Array();
	var vPickBinQtyArr = new Array();
	var vPickBinStatusArr = new Array();
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	var filters = new Array();
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_sku', null, 'group'));
	columns
			.push(new nlobjSearchColumn('custrecord_wmsse_act_qty', null, 'sum'));

	columns.push(new nlobjSearchColumn('custrecord_wmsse_actendloc', null,
			'group'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_pickseq_no',
			'custrecord_wmsse_actbeginloc', 'group'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_conversionrate', null,
			'group'));
	columns
			.push(new nlobjSearchColumn('custrecord_wmsse_expe_qty', null,
					'sum'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_kitflag', null,
			'group'));
	// Inventorystatus Feature is enabled
	if (inventoryStatusFeature == true) {
		columns.push(new nlobjSearchColumn('custrecord_wmsse_inventorystatus',
				null, 'group'));
	}
	columns[3].setSort();
	if (vItemId != null && vItemId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null,
				'anyof', vItemId));

	if (vBinArray != null && vBinArray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null,
				'anyof', vBinArray));
	if (whLocation != null && whLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',
				null, 'anyof', whLocation));

	if (serialNUM != null && serialNUM != '' && serialNUM != 'null'
			&& serialNUM != 'undefined') {
		filters.push(new nlobjSearchFilter('custrecord_wmsse_serial_no', null,
				'contains', serialNUM));
	}
	if (status != null && status != '' && status != 'null'
			&& status != 'undefined') {
		filters.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus',
				null, 'anyof', status));
	}
	var objOpenTaskDetails = nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_opentask_pickdetails', filters, columns);
	nlapiLogExecution('ERROR', 'objOpenTaskDetails', objOpenTaskDetails);

	var conversionRate = 1;
	if (StockUnitText != null && StockUnitText != ''
			&& StockUnitText != '- None -')
		conversionRate = getOpenTaskStockCoversionRate(vUnitType, StockUnitText);
	nlapiLogExecution('ERROR', 'conversionRate', conversionRate);
	if (objOpenTaskDetails != null && objOpenTaskDetails != ''
			&& objOpenTaskDetails.length > 0) {
		for (var z = 0; z < objOpenTaskDetails.length; z++) {
			var KitFlag = objOpenTaskDetails[z].getValue(
					'custrecord_wmsse_kitflag', null, 'group');
			var vPickQty = 0;
			var vPickinvtStatus = "";
			if (KitFlag == 'T')
				vPickQty = objOpenTaskDetails[z].getValue(
						'custrecord_wmsse_expe_qty', null, 'sum');
			else
				vPickQty = objOpenTaskDetails[z].getValue(
						'custrecord_wmsse_act_qty', null, 'sum');
			var vPickBeginLocId = objOpenTaskDetails[z].getValue(
					'custrecord_wmsse_actendloc', null, 'group');
			var vPickBeginLocText = objOpenTaskDetails[z].getText(
					'custrecord_wmsse_actendloc', null, 'group');
			var vPickConversionRate = objOpenTaskDetails[z].getValue(
					'custrecord_wmsse_conversionrate', null, 'group');

			// Inventorystatus Feature is enabled
			if (inventoryStatusFeature == true) {
				vPickinvtStatus = objOpenTaskDetails[z].getValue(
						'custrecord_wmsse_inventorystatus', null, 'group');
			}
			if (vPickConversionRate == null || vPickConversionRate == ''
					|| vPickConversionRate == '- None -')
				vPickConversionRate = 1;
			if (vPickQty == null || vPickQty == '' || vPickQty == '- None -'
					|| vPickQty == 'null')
				vPickQty = 0;
			var prevArrIndx = -1;
			if ((vPickBinIdArr.indexOf(vPickBeginLocId) == -1)) {
				vPickBinIdArr.push(vPickBeginLocId);
				vPickBinTextArr.push(vPickBeginLocText);
				vPickBinQtyArr
						.push(vPickQty
								* (parseFloat(vPickConversionRate) / parseFloat(conversionRate)));
				vPickBinStatusArr.push(vPickinvtStatus);
			} else {

				if (vPickinvtStatus != null && vPickinvtStatus != ''
						&& vPickinvtStatus != 'null'
						&& vPickinvtStatus != undefined
						&& vPickinvtStatus != 'undefined') {
					for (var invItr = 0; invItr < vPickBinStatusArr.length; invItr++) {
						if (vPickBinStatusArr[invItr] == vPickinvtStatus
								&& vPickBinIdArr[invItr] == vPickBeginLocId) {
							nlapiLogExecution('ERROR', 'inside');
							prevArrIndx = invItr;
							break;
						}
					}
				}

				nlapiLogExecution('ERROR', 'prevArrIndx', prevArrIndx);
				var ind = -1;
				if (prevArrIndx == -1) {
					if (vPickinvtStatus == null || vPickinvtStatus == ''
							|| vPickinvtStatus == 'null'
							|| vPickinvtStatus == 'undefined'
							|| vPickinvtStatus == undefined) {
						ind = vPickBinIdArr.indexOf(vPickBeginLocId);
					}
				} else {
					ind = prevArrIndx;
				}
				nlapiLogExecution('ERROR', 'ind', ind);
				if (ind >= 0) {
					var pickBinQty = vPickBinQtyArr[ind];
					var tempQty = parseFloat(vPickQty)
							* (parseFloat(vPickConversionRate) / parseFloat(conversionRate));
					vPickBinQtyArr[ind] = parseFloat(tempQty)
							+ parseFloat(pickBinQty);
				} else {
					vPickBinIdArr.push(vPickBeginLocId);
					vPickBinTextArr.push(vPickBeginLocText);
					vPickBinQtyArr
							.push(vPickQty
									* (parseFloat(vPickConversionRate) / parseFloat(conversionRate)));
					vPickBinStatusArr.push(vPickinvtStatus);
				}
			}
		}
		vPickBinDetailsArr.push(vPickBinIdArr, vPickBinQtyArr, vPickBinTextArr,
				vPickBinStatusArr);
	}

	nlapiLogExecution('ERROR', 'vPickBinDetailsArr', vPickBinDetailsArr);
	filters = null;
	columns = null;
	objOpenTaskDetails = null;
	return vPickBinDetailsArr;
}

/**
 * To get opoen task details of selected bin locations
 * 
 * @param vItemId
 * @param vBinArray
 * @param whLocation
 * @returns {vPickBinArr}
 */
function getOPenTaskPickBinDetailsLot(vItemId, vBinArray, whLocation,
		vUnitType, StockUnitText, serialNUM, status) {
	nlapiLogExecution('ERROR', 'vItemId,{vBinArray},whLocation', vItemId + ",{"
			+ vBinArray + "}," + whLocation);
	nlapiLogExecution('ERROR', 'vUnitType,StockUnitText', vUnitType + ","
			+ StockUnitText);
	var vPickBinDetailsArr = new Array();
	var vPickBinIdArr = new Array();
	var vPickBinTextArr = new Array();
	var vPickBinQtyArr = new Array();
	var vPickBinLotArr = new Array();
	var vPickBinExpArr = new Array();
	var vPickBinStatusArr = new Array();
	var inventoryStatusFeature = isInvStatusFeatureEnabled();

	var filters = new Array();

	if (vItemId != null && vItemId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null,
				'anyof', vItemId));

	if (vBinArray != null && vBinArray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null,
				'anyof', vBinArray));
	if (whLocation != null && whLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',
				null, 'anyof', whLocation));
	if (status != null && status != '' && status != 'null'
			&& status != 'undefined') {
		filters.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus',
				null, 'anyof', status));
	}
	/*
	 * filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null,
	 * 'anyof', 3));// 3 - PICK filters.push(new
	 * nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof',
	 * [8,28]));// 8 - Picking Completed,28 - Packing Completed filters.push(new
	 * nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is', 'T'));
	 * filters.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no',
	 * 'anyof',
	 * ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
	 * filters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',
	 * null, 'anyof', ['@NONE@']));
	 */

	var objOpenTaskDetails = nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_openpicklotqtydetails', filters, null);
	nlapiLogExecution('ERROR', 'objOpenTaskDetails', objOpenTaskDetails);

	var conversionRate = 1;
	if (StockUnitText != null && StockUnitText != ''
			&& StockUnitText != '- None -')
		conversionRate = getOpenTaskStockCoversionRate(vUnitType, StockUnitText);
	nlapiLogExecution('ERROR', 'conversionRate', conversionRate);
	if (objOpenTaskDetails != null && objOpenTaskDetails != ''
			&& objOpenTaskDetails.length > 0) {
		for (var z = 0; z < objOpenTaskDetails.length; z++) {
			var vinventorystatus = "";
			var vPickQty = objOpenTaskDetails[z].getValue('formulanumeric',
					null, 'sum');
			var vPickBeginLocId = objOpenTaskDetails[z].getValue(
					'custrecord_wmsse_actendloc', null, 'group');
			var vPickBeginLocText = objOpenTaskDetails[z].getText(
					'custrecord_wmsse_actendloc', null, 'group');
			var vPickBeginLocLot = objOpenTaskDetails[z].getValue(
					'custrecord_wmsse_batch_num', null, 'group');
			var vPickBeginLocExpDate = objOpenTaskDetails[z].getValue(
					'custrecord_wmsse_expirydate', null, 'max');
			// Inventorystatus Feature is enabled
			if (inventoryStatusFeature == true) {
				vinventorystatus = objOpenTaskDetails[z].getValue(
						'custrecord_wmsse_inventorystatus', null, 'group');
			}

			if (vPickQty == null || vPickQty == '' || vPickQty == '- None -'
					|| vPickQty == 'null')
				vPickQty = 0;
			nlapiLogExecution('ERROR', 'vinventorystatus', vinventorystatus);
			if (vPickBinIdArr.indexOf(vPickBeginLocId) == -1) {
				vPickBinIdArr.push(vPickBeginLocId);
				vPickBinTextArr.push(vPickBeginLocText);
				vPickBinQtyArr.push(vPickQty / parseFloat(conversionRate));
				vPickBinLotArr.push(vPickBeginLocLot);
				vPickBinExpArr.push(vPickBeginLocExpDate);
				vPickBinStatusArr.push(vinventorystatus);

			} else {
				if (vinventorystatus == null || vinventorystatus == ""
						|| vinventorystatus == 'null'
						|| vinventorystatus == 'undefined'
						|| vinventorystatus == undefined) {
					// same bin and lot
					if (vPickBinIdArr.length > 0
							&& vPickBinLotArr.indexOf(vPickBeginLocLot) != -1) {

						var ind = vPickBinLotArr.indexOf(vPickBeginLocLot);
						var tempQty = vPickBinQtyArr[ind];
						var totalLotQty = parseFloat(tempQty)
								+ (vPickQty / parseFloat(conversionRate));
						vPickBinQtyArr[ind] = totalLotQty;
					} else {
						vPickBinIdArr.push(vPickBeginLocId);
						vPickBinTextArr.push(vPickBeginLocText);
						vPickBinQtyArr.push(vPickQty
								/ parseFloat(conversionRate));
						vPickBinLotArr.push(vPickBeginLocLot);
						vPickBinExpArr.push(vPickBeginLocExpDate);

					}
				} else {
					var prevArrIndx = -1;
					if (vPickBinStatusArr != null && vPickBinStatusArr != '') {
						for (var invItr = 0; invItr < vPickBinStatusArr.length; invItr++) {
							if (vPickBinStatusArr[invItr] == vinventorystatus
									&& vPickBinIdArr[invItr] == vPickBeginLocId
									&& vPickBinLotArr[invItr] == vPickBeginLocLot) {
								prevArrIndx = invItr;
								break;
							}
						}

					}

					// same bin lot and status
					if (prevArrIndx >= 0) {

						var tempQty = vPickBinQtyArr[prevArrIndx];
						var totalLotQty = parseFloat(tempQty)
								+ (vPickQty / parseFloat(conversionRate));
						vPickBinQtyArr[ind] = totalLotQty;
					} else {
						vPickBinIdArr.push(vPickBeginLocId);
						vPickBinTextArr.push(vPickBeginLocText);
						// vPickBinQtyArr.push(vPickQty *
						// (parseFloat(vPickConversionRate)/parseFloat(conversionRate)));
						vPickBinQtyArr.push(vPickQty
								/ parseFloat(conversionRate));
						vPickBinLotArr.push(vPickBeginLocLot);
						vPickBinExpArr.push(vPickBeginLocExpDate);
						vPickBinStatusArr.push(vinventorystatus);

					}
				}
			}
		}
		vPickBinDetailsArr.push(vPickBinIdArr, vPickBinQtyArr, vPickBinTextArr,
				vPickBinLotArr, vPickBinExpArr, vPickBinStatusArr);
	}

	nlapiLogExecution('ERROR', 'vPickBinDetailsArr', vPickBinDetailsArr);
	filters = null;
	columns = null;
	objOpenTaskDetails = null;
	return vPickBinDetailsArr;
}

/**
 * To get opoen task details of selected bin locations
 * 
 * @param vItemId
 * @param vBinArray
 * @param whLocation
 * @returns {vPickBinArr}
 */
function getOPenTaskPickBinDetailsSerial(vItemId, vBinArray, whLocation,
		vUnitType, StockUnitText) {
	nlapiLogExecution('ERROR', 'vItemId,{vBinArray},whLocation', vItemId + ",{"
			+ vBinArray + "}," + whLocation);
	nlapiLogExecution('ERROR', 'vUnitType,StockUnitText', vUnitType + ","
			+ StockUnitText);
	var vPickBinDetailsArr = new Array();
	var vPickBinIdArr = new Array();
	var vPickBinTextArr = new Array();
	var vPickBinQtyArr = new Array();
	var vPickBinSerialArr = new Array();
	var vPickBinExpArr = new Array();
	var filters = new Array();
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_sku', null, 'group'));
	columns
			.push(new nlobjSearchColumn('custrecord_wmsse_act_qty', null, 'sum'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_expirydate', null,
			'max'));
	// columns.push(new
	// nlobjSearchColumn('custrecord_wmsse_serial_no',null,'group'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_actendloc', null,
			'group'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_pickseq_no',
			'custrecord_wmsse_actbeginloc', 'group'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_conversionrate', null,
			'group'));
	columns
			.push(new nlobjSearchColumn('custrecord_wmsse_expe_qty', null,
					'sum'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_kitflag', null,
			'group'));
	columns[2].setSort();
	columns[4].setSort();

	if (vItemId != null && vItemId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null,
				'anyof', vItemId));

	if (vBinArray != null && vBinArray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null,
				'anyof', vBinArray));
	if (whLocation != null && whLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',
				null, 'anyof', whLocation));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null,
			'anyof', 3));// 3 - PICK
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',
			null, 'anyof', [ 8, 28 ]));// 8 - Picking Completed,28 - Packing
										// Completed
	filters.push(new nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no',
			'is', 'T'));
	filters.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no',
			'anyof', [ 'SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E', 'TrnfrOrd:B',
					'TrnfrOrd:D', 'TrnfrOrd:E', 'WorkOrd:B', 'WorkOrd:D' ]));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',
			null, 'anyof', [ '@NONE@' ]));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_nstrn_ref_no', null,
			'anyof', [ '@NONE@' ]));

	var vnobjOpenTaskDetails = new nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask', null, filters, columns);
	nlapiLogExecution('ERROR', 'vnobjOpenTaskDetails', vnobjOpenTaskDetails);

	var conversionRate = 1;
	if (StockUnitText != null && StockUnitText != ''
			&& StockUnitText != '- None -')
		conversionRate = getOpenTaskStockCoversionRate(vUnitType, StockUnitText);
	nlapiLogExecution('ERROR', 'conversionRate', conversionRate);
	if (vnobjOpenTaskDetails != null && vnobjOpenTaskDetails != ''
			&& vnobjOpenTaskDetails.length > 0) {
		var vncolumns = new Array();
		vncolumns.push(new nlobjSearchColumn('custrecord_wmsse_sku'));
		vncolumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty'));
		vncolumns.push(new nlobjSearchColumn('custrecord_wmsse_expirydate'));
		vncolumns.push(new nlobjSearchColumn('custrecord_wmsse_serial_no'));
		vncolumns.push(new nlobjSearchColumn('custrecord_wmsse_actendloc'));
		vncolumns.push(new nlobjSearchColumn('custrecord_wmsse_pickseq_no',
				'custrecord_wmsse_actbeginloc'));
		vncolumns
				.push(new nlobjSearchColumn('custrecord_wmsse_conversionrate'));
		vncolumns.push(new nlobjSearchColumn('custrecord_wmsse_expe_qty'));
		vncolumns.push(new nlobjSearchColumn('custrecord_wmsse_kitflag'));
		vncolumns[2].setSort();
		vncolumns[5].setSort();
		var objOpenTaskDetails = new nlapiSearchRecord(
				'customrecord_wmsse_trn_opentask', null, filters, vncolumns);
		for (var z = 0; z < objOpenTaskDetails.length; z++) {
			var KitFlag = objOpenTaskDetails[z]
					.getValue('custrecord_wmsse_kitflag');
			var vPickQty = 0;
			if (KitFlag == 'T')
				vPickQty = objOpenTaskDetails[z]
						.getValue('custrecord_wmsse_expe_qty');
			else
				vPickQty = objOpenTaskDetails[z]
						.getValue('custrecord_wmsse_act_qty');
			var vPickBeginLocId = objOpenTaskDetails[z]
					.getValue('custrecord_wmsse_actendloc');
			var vPickBeginLocText = objOpenTaskDetails[z]
					.getText('custrecord_wmsse_actendloc');
			var vPickBeginLocSerial = objOpenTaskDetails[z]
					.getValue('custrecord_wmsse_serial_no');
			var vPickBeginLocExpDate = objOpenTaskDetails[z]
					.getValue('custrecord_wmsse_expirydate');
			var vPickConversionRate = objOpenTaskDetails[z]
					.getValue('custrecord_wmsse_conversionrate');
			if (vPickConversionRate == null || vPickConversionRate == ''
					|| vPickConversionRate == '- None -')
				vPickConversionRate = 1;
			if (vPickQty == null || vPickQty == '' || vPickQty == '- None -'
					|| vPickQty == 'null')
				vPickQty = 0;
			if (vPickBinIdArr.indexOf(vPickBeginLocId) == -1) {
				vPickBinIdArr.push(vPickBeginLocId);
				vPickBinTextArr.push(vPickBeginLocText);
				vPickBinQtyArr
						.push(vPickQty
								* (parseFloat(vPickConversionRate) / parseFloat(conversionRate)));
				vPickBinSerialArr.push(vPickBeginLocSerial);

			} else {
				// same bin
				if (vPickBinIdArr.length > 0
						&& vPickBinIdArr.indexOf(vPickBeginLocId) != -1) {
					nlapiLogExecution('ERROR', 'Inside same bin', vPickBinIdArr);
					var ind = vPickBinIdArr.indexOf(vPickBeginLocId);
					var tempQty = vPickBinQtyArr[ind];
					var tempSerial = vPickBinSerialArr[ind];
					var totalSerial = tempSerial + "," + vPickBeginLocSerial;
					var totalLotQty = parseFloat(tempQty)
							+ (vPickQty * (parseFloat(vPickConversionRate) / parseFloat(conversionRate)));
					vPickBinQtyArr[ind] = totalLotQty;
					vPickBinSerialArr[ind] = totalSerial;
				} else {
					vPickBinIdArr.push(vPickBeginLocId);
					vPickBinTextArr.push(vPickBeginLocText);
					vPickBinQtyArr
							.push(vPickQty
									* (parseFloat(vPickConversionRate) / parseFloat(conversionRate)));
					vPickBinSerialArr.push(vPickBeginLocSerial);

				}
			}
		}
		vPickBinDetailsArr.push(vPickBinIdArr, vPickBinQtyArr, vPickBinTextArr,
				vPickBinSerialArr);
	}

	nlapiLogExecution('ERROR', 'vPickBinDetailsArr', vPickBinDetailsArr);
	filters = null;
	columns = null;
	objOpenTaskDetails = null;
	return vPickBinDetailsArr;
}

function getOPenTaskPickBinDetailsSerialbyStatus(vItemId, vBinArray,
		whLocation, vUnitType, StockUnitText, vStatus) {
	nlapiLogExecution('ERROR', 'vItemId,{vBinArray},whLocation', vItemId + ",{"
			+ vBinArray + "}," + whLocation);
	nlapiLogExecution('ERROR', 'vUnitType,StockUnitText', vUnitType + ","
			+ StockUnitText);
	var vPickBinDetailsArr = new Array();
	var vPickBinIdArr = new Array();
	var vPickBinTextArr = new Array();
	var vPickBinQtyArr = new Array();
	var vPickBinSerialArr = new Array();
	var vPickBinExpArr = new Array();
	var filters = new Array();
	/*
	 * var columns = new Array(); columns.push(new
	 * nlobjSearchColumn('custrecord_wmsse_sku',null,'group')); columns.push(new
	 * nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum'));
	 * columns.push(new
	 * nlobjSearchColumn('custrecord_wmsse_expirydate',null,'max'));
	 * //columns.push(new
	 * nlobjSearchColumn('custrecord_wmsse_serial_no',null,'group'));
	 * columns.push(new
	 * nlobjSearchColumn('custrecord_wmsse_actendloc',null,'group'));
	 * columns.push(new
	 * nlobjSearchColumn('custrecord_wmsse_pickseq_no','custrecord_wmsse_actbeginloc','group'));
	 * columns.push(new
	 * nlobjSearchColumn('custrecord_wmsse_conversionrate',null,'group'));
	 * columns.push(new
	 * nlobjSearchColumn('custrecord_wmsse_expe_qty',null,'sum'));
	 * columns.push(new
	 * nlobjSearchColumn('custrecord_wmsse_kitflag',null,'group'));
	 * columns.push(new
	 * nlobjSearchColumn('custrecord_wmsse_inventorystatus',null,'group'));
	 * columns[2].setSort(); columns[4].setSort();
	 */

	if (vItemId != null && vItemId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null,
				'anyof', vItemId));

	if (vBinArray != null && vBinArray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null,
				'anyof', vBinArray));
	if (whLocation != null && whLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',
				null, 'anyof', whLocation));
	/*
	 * filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null,
	 * 'anyof', 3));// 3 - PICK filters.push(new
	 * nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof',
	 * [8,28]));// 8 - Picking Completed,28 - Packing Completed filters.push(new
	 * nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is', 'T'));
	 */
	filters.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no',
			'anyof', [ 'SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E', 'TrnfrOrd:B',
					'TrnfrOrd:D', 'TrnfrOrd:E', 'WorkOrd:B', 'WorkOrd:D' ]));
	/*
	 * filters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',
	 * null, 'anyof', ['@NONE@'])); filters.push(new
	 * nlobjSearchFilter('custrecord_wmsse_nstrn_ref_no', null, 'anyof',
	 * ['@NONE@']));
	 */
	if (vStatus != null && vStatus != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus',
				null, 'anyof', vStatus));

	var vnobjOpenTaskDetails = new nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_serbystat_openpickbin', filters);
	nlapiLogExecution('ERROR', 'vnobjOpenTaskDetails', vnobjOpenTaskDetails);

	var conversionRate = 1;
	if (StockUnitText != null && StockUnitText != ''
			&& StockUnitText != '- None -')
		conversionRate = getOpenTaskStockCoversionRate(vUnitType, StockUnitText);
	nlapiLogExecution('ERROR', 'conversionRate', conversionRate);
	if (vnobjOpenTaskDetails != null && vnobjOpenTaskDetails != ''
			&& vnobjOpenTaskDetails.length > 0) {
		/*
		 * var vncolumns = new Array(); vncolumns.push(new
		 * nlobjSearchColumn('custrecord_wmsse_sku')); vncolumns.push(new
		 * nlobjSearchColumn('custrecord_wmsse_act_qty')); vncolumns.push(new
		 * nlobjSearchColumn('custrecord_wmsse_expirydate')); vncolumns.push(new
		 * nlobjSearchColumn('custrecord_wmsse_serial_no')); vncolumns.push(new
		 * nlobjSearchColumn('custrecord_wmsse_actendloc')); vncolumns.push(new
		 * nlobjSearchColumn('custrecord_wmsse_pickseq_no','custrecord_wmsse_actbeginloc'));
		 * vncolumns.push(new
		 * nlobjSearchColumn('custrecord_wmsse_conversionrate'));
		 * vncolumns.push(new nlobjSearchColumn('custrecord_wmsse_expe_qty'));
		 * vncolumns.push(new nlobjSearchColumn('custrecord_wmsse_kitflag'));
		 * vncolumns.push(new
		 * nlobjSearchColumn('custrecord_wmsse_inventorystatus'));
		 * vncolumns[2].setSort(); vncolumns[5].setSort();
		 */
		var objOpenTaskDetails = new nlapiSearchRecord(
				'customrecord_wmsse_trn_opentask',
				'customsearch_wmsse_pickdetail_statuswise', filters);
		for (var z = 0; z < objOpenTaskDetails.length; z++) {
			var KitFlag = objOpenTaskDetails[z]
					.getValue('custrecord_wmsse_kitflag');
			var vPickQty = 0;
			if (KitFlag == 'T')
				vPickQty = objOpenTaskDetails[z]
						.getValue('custrecord_wmsse_expe_qty');
			else
				vPickQty = objOpenTaskDetails[z]
						.getValue('custrecord_wmsse_act_qty');
			var vPickBeginLocId = objOpenTaskDetails[z]
					.getValue('custrecord_wmsse_actendloc');
			var vPickBeginLocText = objOpenTaskDetails[z]
					.getText('custrecord_wmsse_actendloc');
			var vPickBeginLocSerial = objOpenTaskDetails[z]
					.getValue('custrecord_wmsse_serial_no');
			var vPickBeginLocExpDate = objOpenTaskDetails[z]
					.getValue('custrecord_wmsse_expirydate');
			var vPickConversionRate = objOpenTaskDetails[z]
					.getValue('custrecord_wmsse_conversionrate');
			if (vPickConversionRate == null || vPickConversionRate == ''
					|| vPickConversionRate == '- None -')
				vPickConversionRate = 1;
			if (vPickQty == null || vPickQty == '' || vPickQty == '- None -'
					|| vPickQty == 'null')
				vPickQty = 0;
			if (vPickBinIdArr.indexOf(vPickBeginLocId) == -1) {
				vPickBinIdArr.push(vPickBeginLocId);
				vPickBinTextArr.push(vPickBeginLocText);
				vPickBinQtyArr
						.push(vPickQty
								* (parseFloat(vPickConversionRate) / parseFloat(conversionRate)));
				vPickBinSerialArr.push(vPickBeginLocSerial);

			} else {
				// same bin
				if (vPickBinIdArr.length > 0
						&& vPickBinIdArr.indexOf(vPickBeginLocId) != -1) {
					nlapiLogExecution('ERROR', 'Inside same bin', vPickBinIdArr);
					var ind = vPickBinIdArr.indexOf(vPickBeginLocId);
					var tempQty = vPickBinQtyArr[ind];
					var tempSerial = vPickBinSerialArr[ind];
					var totalSerial = tempSerial + "," + vPickBeginLocSerial;
					var totalLotQty = parseFloat(tempQty)
							+ (vPickQty * (parseFloat(vPickConversionRate) / parseFloat(conversionRate)));
					vPickBinQtyArr[ind] = totalLotQty;
					vPickBinSerialArr[ind] = totalSerial;
				} else {
					vPickBinIdArr.push(vPickBeginLocId);
					vPickBinTextArr.push(vPickBeginLocText);
					vPickBinQtyArr
							.push(vPickQty
									* (parseFloat(vPickConversionRate) / parseFloat(conversionRate)));
					vPickBinSerialArr.push(vPickBeginLocSerial);

				}
			}
		}
		vPickBinDetailsArr.push(vPickBinIdArr, vPickBinQtyArr, vPickBinTextArr,
				vPickBinSerialArr);
	}

	nlapiLogExecution('ERROR', 'vPickBinDetailsArr', vPickBinDetailsArr);
	filters = null;
	columns = null;
	objOpenTaskDetails = null;
	return vPickBinDetailsArr;
}

function getStatusesforPlanItem(whLocation, vPlanItemId, vPlanBin) {

	var invfilterStrat = new Array();
	if (whLocation != null && whLocation != '' && whLocation != 'null')
		invfilterStrat.push(new nlobjSearchFilter('location', null, 'anyof',
				whLocation));
	if (vPlanItemId != null && vPlanItemId != '' && vPlanItemId != 'null')
		invfilterStrat.push(new nlobjSearchFilter('internalid', 'item',
				'anyof', vPlanItemId));
	if (vPlanBin != null && vPlanBin != '' && vPlanBin != 'null')
		invfilterStrat.push(new nlobjSearchFilter('binnumber', null, 'anyof',
				vPlanBin));
	var vStatusDetails = nlapiSearchRecord('InventoryBalance',
			'customsearch_wmsse_invtbalance_serialsrh', invfilterStrat, null);
	var statusSelectArr = new Array();
	if (vStatusDetails != '' && vStatusDetails != 'null'
			&& vStatusDetails != null) {
		nlapiLogExecution('ERROR', 'vStatusDetails.length',
				vStatusDetails.length);
		for (var statusDetailsItr = 0; statusDetailsItr < vStatusDetails.length; statusDetailsItr++) {
			// var vStatus =
			// vStatusDetails[statusDetailsItr].getText('status',null,'group');
			var vStatusId = vStatusDetails[statusDetailsItr].getValue('status',
					null, 'group');
			// var currRowStatus = [vStatusId];
			statusSelectArr.push(vStatusId);
		}
	}

	nlapiLogExecution('ERROR', 'statusSelectArr', statusSelectArr);
	return statusSelectArr;
}

function getOpenTaskStockCoversionRate(vUnitTypeId, vUnits) {
	var uomfilters = new Array();
	if (vUnitTypeId != null && vUnitTypeId != '' && vUnitTypeId != 'null')
		uomfilters.push(new nlobjSearchFilter("internalid", null, "anyof",
				vUnitTypeId));
	if (vUnits != null && vUnits != '' && vUnits != 'null')
		uomfilters.push(new nlobjSearchFilter("unitname", null, "is", vUnits));
	var uomcolumns = new Array();
	uomcolumns[0] = new nlobjSearchColumn("conversionrate");
	var uomresults = nlapiSearchRecord('unitstype', null, uomfilters,
			uomcolumns);
	var vFromRate = 1;
	if (uomresults != null && uomresults != '') {
		vFromRate = uomresults[0].getValue('conversionrate');
		if (vFromRate == null || vFromRate == '')
			vFromRate = 1;

	}
	return vFromRate;
}

function getPrefBinLocation(getItemInternalId, whLocation) {
	var getPreferBin = '';
	var itemfilters = new Array();
	if (getItemInternalId != null && getItemInternalId != '')
		itemfilters.push(new nlobjSearchFilter('internalid', null, 'anyof',
				getItemInternalId));
	/*
	 * itemfilters.push(new
	 * nlobjSearchFilter('location','binnumber','anyof',['@NONE@',whLocation]));
	 */
	if (whLocation != null && whLocation != '' && whLocation != null) {
		itemfilters.push(new nlobjSearchFilter('location', null, 'anyof', [
				'@NONE@', whLocation ]));
	}
	// itemfilters.push(new nlobjSearchFilter('preferredbin', null, 'is', 'T'));
	var itemcolumns = new Array();
	itemcolumns.push(new nlobjSearchColumn('preferredbin'));
	itemcolumns.push(new nlobjSearchColumn('itemid'));
	itemcolumns.push(new nlobjSearchColumn('binnumber'));
	itemcolumns.push(new nlobjSearchColumn('name'));
	itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_item'));
	itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_lot'));
	itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemgroup'));
	itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemfamily'));
	itemcolumns.push(new nlobjSearchColumn('location', 'binnumber'));
	itemcolumns[0].setSort(true);

	var itemresults = nlapiSearchRecord('item', null, itemfilters, itemcolumns);

	if (itemresults != null && itemresults != '' && itemresults.length > 0) {
		for (var p = 0; p < itemresults.length; p++) {
			if (itemresults[p].getValue('preferredbin') == "T"
					&& itemresults[p].getValue('location', 'binnumber') == whLocation) {
				getPreferBin = itemresults[p].getValue('binnumber');
			}
		}

	}

	return getPreferBin;
}
/**
 * To get opoen task details of selected order
 * 
 * @param soInternalId
 * @returns {nlapiSearchRecord}
 */
function getOPentaskdetails(soInternalId) {
	var filters = new Array();
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_sku');
	columns[1] = new nlobjSearchColumn('custrecord_wmsse_act_qty');
	columns[2] = new nlobjSearchColumn('custrecord_wmsse_line_no');
	columns[3] = new nlobjSearchColumn('custrecord_wmsse_actendloc');
	// columns[4] = new nlobjSearchColumn('custrecord_wmsse_batch_no');
	columns[4] = new nlobjSearchColumn('custrecord_wmsse_batch_num');
	filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null,
			'anyof', soInternalId));
	var objOpenTaskDetails = new nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask', null, filters, columns);
	nlapiLogExecution('ERROR', 'objOpenTaskDetails', objOpenTaskDetails);
	filters = null;
	columns = null;
	return objOpenTaskDetails;
}

/**
 * To Transfer bin location from one bin to another bin
 * 
 * @param itemType
 * @param whLocation
 * @param itemId
 * @param quantity
 * @param fromBinId
 * @param toBinId
 * @param batchno
 * @returns
 */
function inventoryBinTransfer(itemType, whLocation, itemId, quantity,
		fromBinId, toBinId, batchno, actualBeginTime, vUnits,
		vStockConversionRate, opentaskQty, fromStatus, toStatus) {

	// var skt=nlapiLoadRecord('bintransfer',1076);
	var REC_TYPE = 'bintransfer';
	var binTransfer = nlapiCreateRecord(REC_TYPE);
	var inventoryStatusFeature = isInvStatusFeatureEnabled();

	binTransfer.setFieldValue('location', whLocation);
	binTransfer.setFieldValue('trandate', DateStamp());

	var logMsg = 'itemType = ' + itemType + '<br>';
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'itemId = ' + itemId + '<br>';
	logMsg = logMsg + 'quantity = ' + quantity + '<br>';
	logMsg = logMsg + 'fromBinId = ' + fromBinId + '<br>';
	logMsg = logMsg + 'toBinId = ' + toBinId + '<br>';
	logMsg = logMsg + 'batchno = ' + batchno + '<br>';
	logMsg = logMsg + 'opentaskQty = ' + opentaskQty + '<br>';
	logMsg = logMsg + 'vUnits = ' + vUnits + '<br>';
	logMsg = logMsg + 'vStockConversionRate = ' + vStockConversionRate + '<br>';
	logMsg = logMsg + 'fromStatus = ' + fromStatus + '<br>';
	logMsg = logMsg + 'toStatus = ' + toStatus + '<br>';
	nlapiLogExecution('DEBUG', 'inventoryBinTransfer logs', logMsg);

	binTransfer.selectNewLineItem('inventory');
	binTransfer.setCurrentLineItemValue('inventory', 'item', itemId);

	binTransfer.setCurrentLineItemValue('inventory', 'quantity', quantity);
	// binTransfer.setCurrentLineItemValue('inventory', 'preferredbin', '7');
	if (itemType == "inventoryitem" || itemType == "assemblyitem"
			|| itemType == "lotnumberedinventoryitem"
			|| itemType == "lotnumberedassemblyitem") {
		var compSubRecord = binTransfer.createCurrentLineItemSubrecord(
				'inventory', 'inventorydetail');
		compSubRecord.selectNewLineItem('inventoryassignment');
		compSubRecord.setCurrentLineItemValue('inventoryassignment',
				'quantity', quantity);
		compSubRecord.setCurrentLineItemValue('inventoryassignment',
				'binnumber', fromBinId);
		compSubRecord.setCurrentLineItemValue('inventoryassignment',
				'tobinnumber', toBinId);
		if (inventoryStatusFeature == true) {
			compSubRecord.setCurrentLineItemValue('inventoryassignment',
					'inventorystatus', fromStatus);
			compSubRecord.setCurrentLineItemValue('inventoryassignment',
					'toinventorystatus', toStatus);
		}
		if (itemType == "lotnumberedinventoryitem"
				|| itemType == "lotnumberedassemblyitem")
			compSubRecord.setCurrentLineItemValue('inventoryassignment',
					'receiptinventorynumber', batchno);
		compSubRecord.commitLineItem('inventoryassignment');
		compSubRecord.commit();
		var compSubRecord = null;
	} else {
		var filterssertemp = new Array();
		filterssertemp.push(new nlobjSearchFilter(
				'custrecord_wmsse_ser_status', null, 'is', 'F'));
		filterssertemp.push(new nlobjSearchFilter(
				'custrecord_wmsse_ser_tasktype', null, 'anyof', 9));// 9--Move
		filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_bin',
				null, 'anyof', toBinId));
		filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item',
				null, 'anyof', itemId));
		var columnssertemp1 = new Array();
		columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
		columnssertemp1[1] = new nlobjSearchColumn('name');
		var SrchRecordTmpSerial1 = nlapiSearchRecord(
				'customrecord_wmsse_serialentry', null, filterssertemp,
				columnssertemp1);
		nlapiLogExecution('ERROR', 'SrchRecordTmpSerial1', SrchRecordTmpSerial1);
		if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '') {
			var compSubRecord = binTransfer.createCurrentLineItemSubrecord(
					'inventory', 'inventorydetail');
			for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
				compSubRecord.selectNewLineItem('inventoryassignment');
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'quantity', 1);
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'receiptinventorynumber', SrchRecordTmpSerial1[n]
								.getValue('custrecord_wmsse_ser_no'));
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'binnumber', fromBinId);
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'tobinnumber', toBinId);
				if (inventoryStatusFeature == true) {
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'inventorystatus',
							fromStatus);
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'toinventorystatus',
							toStatus);
				}
				compSubRecord.commitLineItem('inventoryassignment');

			}
			compSubRecord.commit();
			compSubRecord = null;
			for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
				var TempRecord = SrchRecordTmpSerial1[j];
				nlapiLogExecution('ERROR', 'TempRecord.getId()', TempRecord
						.getId());
				nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',
						TempRecord.getValue('name'));
				var tempSerial = nlapiLoadRecord(
						'customrecord_wmsse_serialentry', TempRecord.getId());
				tempSerial.setFieldValue('id', TempRecord.getId());
				tempSerial.setFieldValue('name', TempRecord.getValue('name'));
				tempSerial
						.setFieldValue(
								'custrecord_wmsse_ser_note1',
								'because of inventory move completed for serial number  we have marked this serial number as closed');
				tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
				nlapiSubmitRecord(tempSerial);
				TempRecord = null;
			}
		}
		SrchRecordTmpSerial1 = null;
		filterssertemp = null;
		columnssertemp1 = null;
	}
	binTransfer.commitLineItem('inventory');

	var inventoryCountId = nlapiSubmitRecord(binTransfer);
	var taskType = "MOVE";
	var Qty = quantity;
	if (opentaskQty != null && opentaskQty != '' && opentaskQty != 'null'
			&& opentaskQty != 'undefined') {
		Qty = opentaskQty;
	}
	// To update/create open task with Move task type
	// updateMoveOpenTask(itemType,whLocation,itemId,Qty,fromBinId,toBinId,batchno,inventoryCountId,taskType,'','',actualBeginTime,vUnits,vStockConversionRate,fromStatus,toStatus);
	updateMoveOpenTaskforInventory(itemType, whLocation, itemId, Qty,
			fromBinId, toBinId, batchno, inventoryCountId, taskType, '', '',
			actualBeginTime, vUnits, vStockConversionRate, fromStatus, toStatus);
	binTransfer = null;
	return inventoryCountId;
}

/**
 * To create/update open task with Move task type
 * 
 * @param itemType
 * @param whLocation
 * @param itemId
 * @param quantity
 * @param fromBinId
 * @param toBinId
 * @param batchno
 * @param inventoryCountId
 * @param taskType
 * @param ActwhLocation
 */
function updateMoveOpenTask(itemType, whLocation, itemId, quantity, fromBinId,
		toBinId, batchno, inventoryCountId, taskType, ActwhLocation,
		vnSoInternalId, actualBeginTime, vUnits, vStockConversionRate,
		fromStatus, toStatus) {

	var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
	nlapiLogExecution('ERROR', 'Creating Record', 'TRN_OPENTASK');

	if (inventoryCountId != null && inventoryCountId != '')
		customrecord.setFieldValue('name', inventoryCountId);
	customrecord.setFieldValue('custrecord_wmsse_act_begin_date', DateStamp());
	customrecord.setFieldValue('custrecord_wmsse_act_end_date', DateStamp());

	customrecord.setFieldValue('custrecord_wmsse_act_qty', quantity);

	customrecord.setFieldValue('custrecord_wmsse_sku', itemId);

	customrecord.setFieldValue('custrecord_wmsse_expe_qty', quantity);
	if (taskType == "MOVE") {
		customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 19);// storage

		customrecord.setFieldValue('custrecord_wmsse_tasktype', 9); // For MOVE
		if (vnSoInternalId != null && vnSoInternalId != ''
				&& vnSoInternalId != 'null' && vnSoInternalId != 'undefined')
			customrecord.setFieldValue('custrecord_wmsse_order_no',
					vnSoInternalId);
	} else if (taskType == "XFER")// For inventory transfer
	{
		customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 19);// storage

		customrecord.setFieldValue('custrecord_wmsse_tasktype', 18); // For
																		// Inventory
																		// Transfer
		if (ActwhLocation != null && ActwhLocation != '')
			customrecord.setFieldValue('custrecord_wmsse_act_wms_location',
					ActwhLocation);
	}
	if (vUnits != null && vUnits != '' && vUnits != 'null'
			&& vUnits != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_uom', vUnits);

	if (vStockConversionRate != null && vStockConversionRate != ''
			&& vStockConversionRate != 'null'
			&& vStockConversionRate != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_conversionrate',
				vStockConversionRate);

	customrecord.setFieldValue('custrecord_wmsse_actbeginloc', fromBinId);
	customrecord.setFieldValue('custrecord_wmsse_actendloc', toBinId);

	if (itemType == "lotnumberedinventoryitem"
			|| itemType == "lotnumberedassemblyitem") {
		/*
		 * var lotInternalId=getLotInternalId(batchno); if(lotInternalId!=null &&
		 * lotInternalId!='')
		 * customrecord.setFieldValue('custrecord_wmsse_batch_no',lotInternalId);
		 */
		if (batchno != null && batchno != '')
			customrecord.setFieldValue('custrecord_wmsse_batch_num', batchno);

	}
	if (actualBeginTime != null && actualBeginTime != ''
			&& actualBeginTime != 'null' && actualBeginTime != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_actualbegintime',
				actualBeginTime);
	customrecord.setFieldValue('custrecord_wmsse_actualendtime', TimeStamp());

	customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
	customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', itemId);
	if (inventoryCountId != null && inventoryCountId != ''
			&& taskType != "XFER")
		customrecord.setFieldValue('custrecord_wmsse_nsconfirm_ref_no',
				inventoryCountId);

	if (fromStatus != null && fromStatus != '' && fromStatus != "null")
		customrecord.setFieldValue('custrecord_wmsse_inventorystatus',
				fromStatus);

	if (toStatus != null && toStatus != '' && toStatus != "null")
		customrecord.setFieldValue('custrecord_wmsse_inventorystatusto',
				toStatus);

	var currentUserID = getCurrentUser();

	customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);

	var recid = nlapiSubmitRecord(customrecord);
	customrecord = null;
	nlapiLogExecution('ERROR', 'Done creating opentask Record', recid);
	return recid;

}
/**
 * Integration System Rule using to identify Standard Format or Custom Format.
 * 
 * @param RuleId
 * @param loc
 * @returns {String}
 */

function getIntegrationSystemRuleValue(RuleId, loc) {

	nlapiLogExecution('Debug', 'Into Integration systemRuleValue... ', RuleId);
	nlapiLogExecution('Debug', 'loc', loc);
	var systemIntegrationRulevalue = new Array();
	try {
		var integrationfilterarray = new Array();
		integrationfilterarray[0] = new nlobjSearchFilter('name', null, 'is',
				RuleId);
		integrationfilterarray[1] = new nlobjSearchFilter('isinactive', null,
				'is', 'F');
		if (loc != null && loc != '')
			integrationfilterarray.push(new nlobjSearchFilter(
					'custrecord_wmssesite', null, 'anyof', [ '@NONE@', loc ]));
		var integrationcolumns = new Array();
		integrationcolumns[0] = new nlobjSearchColumn(
				'custrecord_wmsserulevalue');
		integrationcolumns[1] = new nlobjSearchColumn('custrecord_wmssesite');
		integrationcolumns[1] = new nlobjSearchColumn(
				'custrecord_wmsseruletype');
		var searchresults = nlapiSearchRecord('customrecord_wmsse_sysrules',
				null, integrationfilterarray, integrationcolumns);
		if (searchresults != null && searchresults != '') {
			var rulevalue = searchresults[0]
					.getValue('custrecord_wmsserulevalue');
			var systemruletype = searchresults[0]
					.getValue('custrecord_wmsseruletype');
			systemIntegrationRulevalue[0] = rulevalue;
			systemIntegrationRulevalue[1] = systemruletype;
		}

	} catch (exp) {
		nlapiLogExecution('Debug', 'Exception in GetSystemRules: ', exp);
		return systemIntegrationRulevalue;
	}
	return systemIntegrationRulevalue;
}
/**
 * To get System rule
 * 
 * @param RuleId
 * @param loc
 * @returns {String}
 */
function getSystemRuleValue(RuleId, loc) {
	nlapiLogExecution('Debug', 'Into getSystemRuleValue... ', RuleId);
	nlapiLogExecution('Debug', 'loc', loc);
	var systemrulevalue = '';

	try {
		var filters = new Array();

		filters[0] = new nlobjSearchFilter('name', null, 'is', RuleId
				.toString());
		filters[1] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
		// starts
		if (loc != null && loc != '')
			filters.push(new nlobjSearchFilter('custrecord_wmssesite', null,
					'anyof', [ '@NONE@', loc ]));
		// ends

		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_wmsserulevalue');
		columns[1] = new nlobjSearchColumn('custrecord_wmssesite');

		columns[1].setSort();
		var searchresults = nlapiSearchRecord('customrecord_wmsse_sysrules',
				null, filters, columns);
		if (searchresults != null && searchresults != '') {
			if (searchresults[0].getValue('custrecord_wmsserulevalue') != null
					&& searchresults[0].getValue('custrecord_wmsserulevalue') != '') {
				systemrulevalue = searchresults[0]
						.getValue('custrecord_wmsserulevalue');
				searchresults = null;
				return systemrulevalue;
			} else
				return systemrulevalue;
		} else
			return systemrulevalue;
	} catch (exp) {
		nlapiLogExecution('Debug', 'Exception in GetSystemRules: ', exp);
		return systemrulevalue;
	}
}

/**
 * To get time stamp
 * 
 * @returns {String}
 */
function TimeStamp() {
	var timestamp;
	// var now = new Date();
	var now = convertDate();

	var a_p = "";

	// Getting time in hh:mm tt format.
	var curr_hour = now.getHours();
	var curr_min = now.getMinutes();
	var curr_sec = now.getSeconds();

	// determining the am/pm indicator
	if (curr_hour < 12)
		a_p = "am";
	else
		a_p = "pm";

	// finalizing hours depending on 24hr clock
	if (curr_hour == 0)
		curr_hour = 12;
	else if (curr_hour > 12)
		curr_hour -= 12;

	if (curr_min.toString().length == 1)
		curr_min = "0" + curr_min;

	// Adding fields to update time zones.
	var vTimeFormat = TimeSetting();
	nlapiLogExecution('Debug', 'vTimeFormat: ', vTimeFormat);
	if (vTimeFormat == 'fmHH:fmMI am') {
		timestamp = curr_hour + ":" + curr_min + " " + a_p;
	} else if (vTimeFormat == 'fmHH-fmMI am') {
		timestamp = curr_hour + "-" + curr_min + " " + a_p;
	} else if (vTimeFormat == 'fmHH24:fmMI') {
		curr_hour = parseInt(curr_hour) + 12;
		if (parseInt(curr_hour) == 24)
			curr_hour = 0;
		timestamp = curr_hour + ":" + curr_min;
	} else {
		curr_hour = parseInt(curr_hour) + 12;
		if (parseInt(curr_hour) == 24)
			curr_hour = 0;
		timestamp = curr_hour + "-" + curr_min;
	}

	return timestamp;
}

/**
 * To get Plan details
 */
function getPlanDetails(planid, itemId, binLocationId, whLocation) {
	var filters = new Array();
	var columns = new Array();
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('tranid', null, 'is', planid));
	filters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('transactionlinetype', null, 'is',
			'COUNTQUANTITY'));
	if (itemId != null && itemId != '' && itemId != 'undefined')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemId));
	if (binLocationId != null && binLocationId != ''
			&& binLocationId != 'undefined')
		filters.push(new nlobjSearchFilter('internalid', 'binnumber', 'anyof',
				binLocationId));
	if (whLocation != null && whLocation != '' && whLocation != 'undefined')
		filters.push(new nlobjSearchFilter('location', null, 'anyof',
				whLocation));

	columns[0] = new nlobjSearchColumn('line');
	columns[1] = new nlobjSearchColumn('item');
	columns[2] = new nlobjSearchColumn('location');
	columns[3] = new nlobjSearchColumn('binnumber');
	columns[4] = new nlobjSearchColumn('transactionlinetype');
	columns[5] = new nlobjSearchColumn('internalid', 'binnumber');
	columns[6] = new nlobjSearchColumn('internalid');
	columns[7] = new nlobjSearchColumn('quantity');
	columns[8] = new nlobjSearchColumn('status');
	columns[9] = new nlobjSearchColumn('unitstype', 'item');
	columns[10] = new nlobjSearchColumn('stockunit', 'item');
	columns[11] = new nlobjSearchColumn('unit');
	// Case# 201416108 start
	columns[7].setSort(true);
	// Case# 201416108 end
	var PlanLineDetails = nlapiSearchRecord('inventorycount', null, filters,
			columns);
	filters = null;
	columns = null;
	return PlanLineDetails;
}

/**
 * TO update/Create open task record for cycle count process
 * 
 * @param poInternalId
 * @param FetchedItemId
 * @param poLineno
 * @param enterQty
 * @param enterBin
 * @param itemType
 * @param whLocation
 * @param batchno
 * @param idl
 * @param poname
 * @param actualBeginTime
 */
function updateCycleCountOpenTask(poInternalId, FetchedItemId, poLineno,
		enterQty, enterBin, itemType, whLocation, batchno, idl, poname,
		actualBeginTime, vUnits, vConversionRate, vOpenBinQty,
		vBinOpenTaskSerialArr, vStatus) {

	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	try {

		if (inventoryStatusFeature != true) {
			if (itemType != "lotnumberedinventoryitem"
					&& itemType != "lotnumberedassemblyitem") {
				var filters = new Array();
				var columns = new Array();
				filters.push(new nlobjSearchFilter('name', null, 'is', poname));
				filters.push(new nlobjSearchFilter(
						'custrecord_wmsse_wms_status_flag', null, 'anyof',
						[ 31 ]));
				filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype',
						null, 'anyof', [ 7 ]));
				if (poLineno != null && poLineno != ''
						&& poLineno != 'undefined')
					filters.push(new nlobjSearchFilter(
							'custrecord_wmsse_line_no', null, 'equalto',
							poLineno));
				if (FetchedItemId != null && FetchedItemId != ''
						&& FetchedItemId != 'undefined')
					filters.push(new nlobjSearchFilter('custrecord_wmsse_sku',
							null, 'anyof', FetchedItemId));
				var vOpentaskPlanDetails = new nlapiSearchRecord(
						'customrecord_wmsse_trn_opentask', null, filters,
						columns);
				if (vOpentaskPlanDetails != null && vOpentaskPlanDetails != ''
						&& vOpentaskPlanDetails.length > 0) {
					nlapiLogExecution('ERROR', 'vOpentaskPlanDetails.length11',
							vOpentaskPlanDetails.length);
					for (var p = 0; p < vOpentaskPlanDetails.length; p++) {
						var vRecId = vOpentaskPlanDetails[p].getId();
						nlapiLogExecution('ERROR', 'Deleted Old cycc task11',
								vRecId);
						var id = nlapiDeleteRecord(
								'customrecord_wmsse_trn_opentask', vRecId);

					}
				}
			}
		}
	} catch (ex) {
		nlapiLogExecution('ERROR', 'Error in deleting open task', ex);
	}
	var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
	nlapiLogExecution('ERROR', 'Creating Record', 'TRN_OPENTASK');
	var str = "poInternalId : '" + poInternalId + " ,FetchedItemId : '"
			+ FetchedItemId + "' ,poLineno : '" + poLineno + "' ,enterQty : '"
			+ enterQty + "',enterBin : '" + enterBin + "',itemType : '"
			+ itemType + "' ,whLocation : '" + whLocation + "' ,batchno : '"
			+ batchno + "' ,idl : '" + idl + "' ,poname : '" + poname + "'";
	nlapiLogExecution('ERROR', 'str', str);
	nlapiLogExecution('ERROR', 'vOpenBinQty', vOpenBinQty);
	if (poname != null && poname != '')
		customrecord.setFieldValue('name', poname);
	customrecord.setFieldValue('custrecord_wmsse_act_begin_date', DateStamp());
	customrecord.setFieldValue('custrecord_wmsse_act_end_date', DateStamp());

	customrecord.setFieldValue('custrecord_wmsse_act_qty', enterQty);
	if (vOpenBinQty != null && vOpenBinQty != '' && vOpenBinQty != 'null'
			&& vOpenBinQty != 'undefined' && vOpenBinQty != 0) {
		if (itemType != "lotnumberedinventoryitem"
				&& itemType != "lotnumberedassemblyitem")
			customrecord
					.setFieldValue('custrecord_wmsse_act_qty',
							(parseFloat(enterQty) + parseFloat(vOpenBinQty))
									.toFixed(8));
		var vNotes = "System is added "
				+ vOpenBinQty
				+ " qty because this qty is picked from bin location but item fulfillment is not yet posted";
		customrecord.setFieldValue('custrecord_wmsse_notes', vNotes);
	}

	customrecord.setFieldValue('custrecord_wmsse_sku', FetchedItemId);

	customrecord.setFieldValue('custrecord_wmsse_line_no', poLineno);

	customrecord.setFieldValue('custrecord_wmsse_expe_qty', enterQty);

	customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 31);// cycle
																		// count
																		// record

	customrecord.setFieldValue('custrecord_wmsse_tasktype', 7); // For CYCC

	if (enterBin != null && enterBin != '' && enterBin != 'null'
			&& enterBin != 'undefined') {
		// customrecord.setFieldValue('custrecord_wmsse_actbeginloc', enterBin);
		customrecord.setFieldValue('custrecord_wmsse_actendloc', enterBin);
	}
	if (vUnits != null && vUnits != '' && vUnits != 'null'
			&& vUnits != 'undefined') {
		customrecord.setFieldValue('custrecord_wmsse_uom', vUnits);
	}
	if (vConversionRate != null && vConversionRate != ''
			&& vConversionRate != 'null' && vConversionRate != 'undefined') {
		customrecord.setFieldValue('custrecord_wmsse_conversionrate',
				vConversionRate);
	}
	if (vStatus != '' && vStatus != null && vStatus != 'null') {
		customrecord.setFieldValue('custrecord_wmsse_inventorystatus', vStatus);
		nlapiLogExecution('ERROR', 'vStatus TEST', vStatus);
	}
	if (itemType == "lotnumberedinventoryitem"
			|| itemType == "lotnumberedassemblyitem") {

		if (batchno != null && batchno != '')
			customrecord.setFieldValue('custrecord_wmsse_batch_num', batchno);

		var lotInternalId = '';
		if (batchno != null && batchno != '')
			lotInternalId = getLotInternalId(batchno);
		if (lotInternalId != null && lotInternalId != '') {
			var fields = [ 'inventorynumber', 'expirationdate' ];
			var vLotDetails = nlapiLookupField('inventorynumber',
					lotInternalId, fields);
			var vexpDate = vLotDetails.expirationdate;
			nlapiLogExecution('ERROR', 'vexpDate', vexpDate);
			if (vexpDate != null && vexpDate != '' && vexpDate != 'null')
				customrecord.setFieldValue('custrecord_wmsse_expirydate',
						vexpDate);
		}

	}

	if ((itemType == "serializedinventoryitem" || itemType == "serializedassemblyitem")) {

		if (inventoryStatusFeature == true) {
			// /
			nlapiLogExecution('ERROR', 'vStatus', vStatus);
			var vPickStatusIdArr = new Array();
			var maxno = -1;
			var SrchRecordTmpSerial1 = [];
			SrchRecordTmpSerial1 = fnGetAllSerialsbyStatus(poInternalId,
					poLineno, maxno, vStatus, SrchRecordTmpSerial1);
			var serialArray = '';

			if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != "") {
				nlapiLogExecution('ERROR', 'SrchRecordTmpSerial1.length',
						SrchRecordTmpSerial1.length);
				var parent = nlapiCreateRecord('customrecord_wmsse_throwaway_parent'); // create
																						// new
																						// parent
																						// record
																						// on
																						// fo
																						// line.
				var serialparentid = nlapiSubmitRecord(parent);
				var serialparent = nlapiLoadRecord(
						'customrecord_wmsse_throwaway_parent', serialparentid);

				for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
					if (serialArray == null || serialArray == '')
						serialArray = SrchRecordTmpSerial1[n]
								.getValue('custrecord_wmsse_ser_no');
					else
						serialArray = serialArray
								+ ","
								+ SrchRecordTmpSerial1[n]
										.getValue('custrecord_wmsse_ser_no');
				}

				nlapiLogExecution('ERROR', 'serialArray', serialArray);
				nlapiLogExecution('ERROR', 'vBinOpenTaskSerialArr',
						vBinOpenTaskSerialArr);
				if (vBinOpenTaskSerialArr != null
						&& vBinOpenTaskSerialArr != ''
						&& vBinOpenTaskSerialArr != 'null'
						&& vBinOpenTaskSerialArr != 'undefined') {
					for (var z = 0; z < vBinOpenTaskSerialArr.length; z++) {
						if (serialArray == null || serialArray == '') {
							if (serialArray.indexOf(vBinOpenTaskSerialArr[z]) == -1)
								serialArray = vBinOpenTaskSerialArr[z];
						} else {
							if (serialArray.indexOf(vBinOpenTaskSerialArr[z]) == -1)
								serialArray = serialArray + ","
										+ vBinOpenTaskSerialArr[z];
						}
					}
				}
				customrecord.setFieldValue('custrecord_wmsse_serial_no',
						serialArray);
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord = SrchRecordTmpSerial1[j];
					nlapiLogExecution('ERROR', 'TempRecord.getId()', TempRecord
							.getId());
					nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',
							TempRecord.getValue('name'));
					serialparent
							.selectNewLineItem('recmachcustrecord_wmsse_st_parent');
					serialparent.setCurrentLineItemValue(
							'recmachcustrecord_wmsse_st_parent', 'id',
							TempRecord.getId());
					serialparent.setCurrentLineItemValue(
							'recmachcustrecord_wmsse_st_parent', 'name',
							TempRecord.getValue('name'));
					serialparent
							.setCurrentLineItemValue(
									'recmachcustrecord_wmsse_st_parent',
									'custrecord_wmsse_ser_note1',
									'because of serial number is updated in opentask we have marked this serial number as closed');
					serialparent.setCurrentLineItemValue(
							'recmachcustrecord_wmsse_st_parent',
							'custrecord_wmsse_ser_status', 'T');
					serialparent
							.commitLineItem('recmachcustrecord_wmsse_st_parent');

				}
				nlapiSubmitRecord(serialparent);
			} else {
				if (vBinOpenTaskSerialArr != null
						&& vBinOpenTaskSerialArr != ''
						&& vBinOpenTaskSerialArr != 'null'
						&& vBinOpenTaskSerialArr != 'undefined') {

					for (var z = 0; z < vBinOpenTaskSerialArr.length; z++) {
						if (serialArray == null || serialArray == '') {
							if (serialArray.indexOf(vBinOpenTaskSerialArr[z]) == -1)
								serialArray = vBinOpenTaskSerialArr[z];
						} else {
							if (serialArray.indexOf(vBinOpenTaskSerialArr[z]) == -1)
								serialArray = serialArray + ","
										+ vBinOpenTaskSerialArr[z];
						}
					}

				}
				customrecord.setFieldValue('custrecord_wmsse_serial_no',
						serialArray);
			}
			SrchRecordTmpSerial1 = null;
			columnssertemp1 = null;
			filterssertemp1 = null;

			// /

		} else {
			var SrchRecordTmpSerial1 = fnGetAllSerials(poInternalId, poLineno,
					'-1');
			var serialArray = '';

			if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != "") {
				var parent = nlapiCreateRecord('customrecord_wmsse_throwaway_parent'); // create
																						// new
																						// parent
																						// record
																						// on
																						// fo
																						// line.
				var serialparentid = nlapiSubmitRecord(parent);
				var serialparent = nlapiLoadRecord(
						'customrecord_wmsse_throwaway_parent', serialparentid);

				for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
					if (serialArray == null || serialArray == '')
						serialArray = SrchRecordTmpSerial1[n]
								.getValue('custrecord_wmsse_ser_no');
					else
						serialArray = serialArray
								+ ","
								+ SrchRecordTmpSerial1[n]
										.getValue('custrecord_wmsse_ser_no');
				}
				nlapiLogExecution('ERROR', 'serialArray', serialArray);
				nlapiLogExecution('ERROR', 'vBinOpenTaskSerialArr',
						vBinOpenTaskSerialArr);
				if (vBinOpenTaskSerialArr != null
						&& vBinOpenTaskSerialArr != ''
						&& vBinOpenTaskSerialArr != 'null'
						&& vBinOpenTaskSerialArr != 'undefined') {
					for (var z = 0; z < vBinOpenTaskSerialArr.length; z++) {
						if (serialArray == null || serialArray == '') {
							if (serialArray.indexOf(vBinOpenTaskSerialArr[z]) == -1)
								serialArray = vBinOpenTaskSerialArr[z];
						} else {
							if (serialArray.indexOf(vBinOpenTaskSerialArr[z]) == -1)
								serialArray = serialArray + ","
										+ vBinOpenTaskSerialArr[z];
						}
					}
				}
				customrecord.setFieldValue('custrecord_wmsse_serial_no',
						serialArray);
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord = SrchRecordTmpSerial1[j];
					nlapiLogExecution('ERROR', 'TempRecord.getId()', TempRecord
							.getId());
					nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',
							TempRecord.getValue('name'));
					serialparent
							.selectNewLineItem('recmachcustrecord_wmsse_st_parent');
					serialparent.setCurrentLineItemValue(
							'recmachcustrecord_wmsse_st_parent', 'id',
							TempRecord.getId());
					serialparent.setCurrentLineItemValue(
							'recmachcustrecord_wmsse_st_parent', 'name',
							TempRecord.getValue('name'));
					serialparent
							.setCurrentLineItemValue(
									'recmachcustrecord_wmsse_st_parent',
									'custrecord_wmsse_ser_note1',
									'because of serial number is updated in opentask we have marked this serial number as closed');
					serialparent.setCurrentLineItemValue(
							'recmachcustrecord_wmsse_st_parent',
							'custrecord_wmsse_ser_status', 'T');
					serialparent
							.commitLineItem('recmachcustrecord_wmsse_st_parent');
					/*
					 * var
					 * tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					 * tempSerial.setFieldValue('id', TempRecord.getId());
					 * tempSerial.setFieldValue('name',
					 * TempRecord.getValue('name'));
					 * tempSerial.setFieldValue('custrecord_wmsse_ser_note1',
					 * 'because of serial number is updated in opentask we have
					 * marked this serial number as closed');
					 * tempSerial.setFieldValue('custrecord_wmsse_ser_status',
					 * 'T'); nlapiSubmitRecord(tempSerial);
					 */
				}
				nlapiSubmitRecord(serialparent);
			}
			SrchRecordTmpSerial1 = null;
			columnssertemp1 = null;
			filterssertemp1 = null;
		}
	}
	customrecord.setFieldValue('custrecord_wmsse_order_no', poInternalId);
	customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);

	customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', FetchedItemId);
	if (idl != null && idl != '')
		customrecord.setFieldValue('custrecord_wmsse_nsconfirm_ref_no', idl);

	var currentUserID = getCurrentUser();

	customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);

	if (actualBeginTime != null && actualBeginTime != ''
			&& actualBeginTime != 'null' && actualBeginTime != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_actualbegintime',
				actualBeginTime);
	customrecord.setFieldValue('custrecord_wmsse_actualendtime', TimeStamp());

	var recid = nlapiSubmitRecord(customrecord);
	if (recid != null && recid != '') {

		nlapiLogExecution('ERROR', 'currentUserID', currentUserID);
		nlapiLogExecution('ERROR', 'poInternalId,poLineno', poInternalId + ","
				+ poLineno);
		var lockfilters = new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',
				null, 'is', 'inventorycount'));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order', null,
				'anyof', poInternalId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line', null,
				'equalto', poLineno));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',
				null, 'is', 'T'));
		// lockfilters.push(new
		// nlobjSearchFilter('custrecord_wmsse_user',null,'anyof',currentUserID));
		var lockcolumns = new Array();
		lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_user'));

		var lockresults = nlapiSearchRecord('customrecord_wmsse_lockrecs',
				null, lockfilters, lockcolumns);
		if (lockresults != null && lockresults != '' && lockresults != 'null'
				&& lockresults != undefined && lockresults != 'undefined'
				&& lockresults.length > 0) {
			for (var lockItr = 0; lockItr < lockresults.length; lockItr++) {
				var lockRecordId = lockresults[lockItr].getId();
				var LockDeleteRecordId = nlapiDeleteRecord(
						'customrecord_wmsse_lockrecs', lockRecordId);
			}
			LockDeleteRecordId = null;
		}
		lockresults = null;
		lockcolumns = null;
		lockfilters = null;
	}
	customrecord = null;
	nlapiLogExecution('ERROR', 'Done creating opentask Record', recid);
}

/**
 * To update inventory cycle count quantity in NS
 * 
 * @param planInternalId
 * @param planLineNo
 * @param enterQty
 * @param itemType
 * @param itemId
 * @param whLocation
 * @returns
 */
function inventoryCountCYCC(planInternalId, planLineNo, enterQty, itemType,
		itemId, whLocation, vBinOpenTaskDetails, serialStatusArr,
		binlocationid, VUnitType, uom) {
	try {
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution(
				'ERROR',
				'planInternalId,planLineNo,enterQty,itemType,itemId,whLocation',
				planInternalId + "," + planLineNo + "," + enterQty + ","
						+ itemType + "," + itemId + "," + whLocation);
		var vInvRec = nlapiLoadRecord('inventorycount', planInternalId);

		vInvRec.selectLineItem('item', ((parseInt(planLineNo) + 2) / 3));

		vInvRec.setCurrentLineItemValue('item', 'countquantity', enterQty);
		vInvRec.setCurrentLineItemValue('item', 'location', whLocation);
		if (itemType == "serializedinventoryitem"
				|| itemType == "serializedassemblyitem") {
			if (inventoryStatusFeature == true) {
				try {

					//

					nlapiLogExecution('ERROR', 'inside itemtype', itemType);
					var filterssertemp1 = new Array();
					filterssertemp1[0] = new nlobjSearchFilter(
							'custrecord_wmsse_order_no', null, 'anyof',
							planInternalId);
					filterssertemp1[1] = new nlobjSearchFilter(
							'custrecord_wmsse_line_no', null, 'equalto',
							planLineNo);
					filterssertemp1[2] = new nlobjSearchFilter(
							'custrecord_wmsse_parent_sku_no', null, 'anyof',
							itemId);

					var columnssertemp1 = new Array();
					columnssertemp1[0] = new nlobjSearchColumn(
							'custrecord_wmsse_serial_no');
					columnssertemp1[1] = new nlobjSearchColumn(
							'custrecord_wmsse_actendloc');
					columnssertemp1[2] = new nlobjSearchColumn(
							'custrecord_wmsse_inventorystatus');
					var SrchRecordTmpSerial1 = nlapiSearchRecord(
							'customrecord_wmsse_trn_opentask', null,
							filterssertemp1, columnssertemp1);
					if (SrchRecordTmpSerial1 != null
							&& SrchRecordTmpSerial1 != "") {
						// trecord.setCurrentLineItemValue('item', 'binnumber',
						// enterBin);
						var compSubRecord = '';
						compSubRecord = vInvRec.editCurrentLineItemSubrecord(
								'item', 'countdetail');
						if (compSubRecord != '' && compSubRecord != null) {
							try {
								var complinelength = compSubRecord
										.getLineItemCount('inventorydetail');
								nlapiLogExecution('ERROR', 'complinelength',
										complinelength);
								if (parseInt(complinelength) > 0) {
									for (var r1 = 1; r1 <= complinelength; r1++) {
										compSubRecord.removeLineItem(
												'inventorydetail', 1);
									}
								}
							} catch (ex) {
								nlapiLogExecution('Debug',
										"exception in subrecord", ex);
							}

						}

						for (var statsItr = 0; statsItr < serialStatusArr.length; statsItr++) {
							var serialArray = '';
							var statusArray = '';
							var vBinOpenTaskDetails = getOPenTaskPickBinDetailsSerialbyStatus(
									itemId, binlocationid, whLocation,
									VUnitType, uom, serialStatusArr[statsItr]);
							statusArray = serialStatusArr[statsItr];

							for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {

								statusArr = SrchRecordTmpSerial1[n]
										.getValue('custrecord_wmsse_inventorystatus');
								if (statusArray == statusArr) {
									if (serialArray == null
											|| serialArray == '') {
										serialArray = SrchRecordTmpSerial1[n]
												.getValue('custrecord_wmsse_serial_no');
									} else {
										serialArray = serialArray
												+ ","
												+ SrchRecordTmpSerial1[n]
														.getValue('custrecord_wmsse_serial_no');
									}
								}

							}
							var vBinOpenTaskSerialArr = "";
							var vBinOpenTaskBinIdArr = "";
							var vBinOpenTaskBinQtyArr = "";
							if (vBinOpenTaskDetails != null
									&& vBinOpenTaskDetails != ''
									&& vBinOpenTaskDetails.length > 0) {
								vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
								vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
								vBinOpenTaskSerialArr = vBinOpenTaskDetails[3];
							}
							nlapiLogExecution('ERROR', 'vBinOpenTaskSerialArr',
									vBinOpenTaskSerialArr);
							for (var h = 0; h < vBinOpenTaskSerialArr.length; h++) {

								if (serialArray == null || serialArray == '') {
									if (serialArray
											.indexOf(vBinOpenTaskSerialArr[h]) == -1)
										serialArray = vBinOpenTaskSerialArr[h];
								} else {
									if (serialArray
											.indexOf(vBinOpenTaskSerialArr[h]) == -1)
										serialArray = serialArray + ","
												+ vBinOpenTaskSerialArr[h];
								}

							}

							var totalSerialArray = serialArray.split(',');
							nlapiLogExecution('ERROR', 'totalSerialArray',
									totalSerialArray);
							if (compSubRecord == '' || compSubRecord == null) {
								compSubRecord = vInvRec
										.createCurrentLineItemSubrecord('item',
												'countdetail');
							}
							for (var k = 0; k < totalSerialArray.length; k++) {
								compSubRecord
										.selectNewLineItem('inventorydetail');
								compSubRecord.setCurrentLineItemValue(
										'inventorydetail', 'quantity', 1);
								compSubRecord.setCurrentLineItemValue(
										'inventorydetail', 'inventorynumber',
										totalSerialArray[k]);
								nlapiLogExecution('ERROR', 'statusArray',
										statusArray);
								compSubRecord.setCurrentLineItemValue(
										'inventorydetail', 'inventorystatus',
										statusArray);
								compSubRecord.commitLineItem('inventorydetail');

							}
						}
						compSubRecord.commit();

					}
					SrchRecordTmpSerial1 = null;
					columnssertemp1 = null;
					filterssertemp1 = null;
				} catch (exn) {

					nlapiLogExecution('ERROR', 'exn', exn.toString());

					// return exn.toString();

				}

				//
			} else {
				nlapiLogExecution('ERROR', 'inside itemtype', itemType);
				var filterssertemp1 = new Array();
				filterssertemp1[0] = new nlobjSearchFilter(
						'custrecord_wmsse_order_no', null, 'anyof',
						planInternalId);
				filterssertemp1[1] = new nlobjSearchFilter(
						'custrecord_wmsse_line_no', null, 'equalto', planLineNo);
				filterssertemp1[2] = new nlobjSearchFilter(
						'custrecord_wmsse_parent_sku_no', null, 'anyof', itemId);
				/*
				 * var columnssertemp1 = new Array(); columnssertemp1[0] = new
				 * nlobjSearchColumn('custrecord_wmsse_serial_no');
				 * columnssertemp1[1] = new
				 * nlobjSearchColumn('custrecord_wmsse_actendloc');
				 */
				var SrchRecordTmpSerial1 = nlapiSearchRecord(
						'customrecord_wmsse_trn_opentask',
						'customsearch_wmsse_opentask_search', filterssertemp1);
				if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != "") {
					// trecord.setCurrentLineItemValue('item', 'binnumber',
					// enterBin);
					var compSubRecord = '';
					compSubRecord = vInvRec.editCurrentLineItemSubrecord(
							'item', 'countdetail');
					if (compSubRecord != '' && compSubRecord != null) {
						try {
							var complinelength = compSubRecord
									.getLineItemCount('inventorydetail');
							nlapiLogExecution('ERROR', 'complinelength',
									complinelength);
							if (parseInt(complinelength) > 0) {
								for (var r1 = 1; r1 <= complinelength; r1++) {
									compSubRecord.removeLineItem(
											'inventorydetail', 1);
								}
							}

						} catch (ex) {
							nlapiLogExecution('Debug',
									"exception in subrecord", ex);
						}

					}
					var serialArray = '';
					for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
						if (serialArray == null || serialArray == '') {
							serialArray = SrchRecordTmpSerial1[n]
									.getValue('custrecord_wmsse_serial_no');
						} else {
							serialArray = serialArray
									+ ","
									+ SrchRecordTmpSerial1[n]
											.getValue('custrecord_wmsse_serial_no');
						}
					}
					var vBinOpenTaskSerialArr = "";
					var vBinOpenTaskBinIdArr = "";
					var vBinOpenTaskBinQtyArr = "";
					if (vBinOpenTaskDetails != null
							&& vBinOpenTaskDetails != ''
							&& vBinOpenTaskDetails.length > 0) {
						vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
						vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
						vBinOpenTaskSerialArr = vBinOpenTaskDetails[3];
					}
					nlapiLogExecution('ERROR', 'vBinOpenTaskSerialArr',
							vBinOpenTaskSerialArr);
					for (var h = 0; h < vBinOpenTaskSerialArr.length; h++) {
						if (serialArray == null || serialArray == '') {
							if (serialArray.indexOf(vBinOpenTaskSerialArr[h]) == -1)
								serialArray = vBinOpenTaskSerialArr[h];
						} else {
							if (serialArray.indexOf(vBinOpenTaskSerialArr[h]) == -1)
								serialArray = serialArray + ","
										+ vBinOpenTaskSerialArr[h];
						}
					}
					var totalSerialArray = serialArray.split(',');
					nlapiLogExecution('ERROR', 'totalSerialArray',
							totalSerialArray);
					if (compSubRecord == '' || compSubRecord == null) {
						compSubRecord = vInvRec.createCurrentLineItemSubrecord(
								'item', 'countdetail');
					}
					for (var k = 0; k < totalSerialArray.length; k++) {
						compSubRecord.selectNewLineItem('inventorydetail');
						compSubRecord.setCurrentLineItemValue(
								'inventorydetail', 'quantity', 1);
						compSubRecord.setCurrentLineItemValue(
								'inventorydetail', 'inventorynumber',
								totalSerialArray[k]);
						compSubRecord.commitLineItem('inventorydetail');

					}
					compSubRecord.commit();

				}
				SrchRecordTmpSerial1 = null;
				columnssertemp1 = null;
				filterssertemp1 = null;
			}
		} else if (itemType == "lotnumberedinventoryitem"
				|| itemType == "lotnumberedassemblyitem") {
			nlapiLogExecution('ERROR', 'inside else itemtype', itemType);
			var filterssertemp1 = new Array();
			var serialArray = '';
			filterssertemp1[0] = new nlobjSearchFilter(
					'custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter(
					'custrecord_wmsse_ser_ordline', null, 'equalto', planLineNo);

			filterssertemp1[2] = new nlobjSearchFilter(
					'custrecord_wmsse_ser_ordno', null, 'anyof', planInternalId);
			var columnssertemp1 = new Array();
			columnssertemp1[0] = new nlobjSearchColumn(
					'custrecord_wmsse_ser_no');
			columnssertemp1[1] = new nlobjSearchColumn(
					'custrecord_wmsse_ser_bin');
			columnssertemp1[2] = new nlobjSearchColumn(
					'custrecord_wmsse_ser_qty');
			columnssertemp1[3] = new nlobjSearchColumn('name');
			if (inventoryStatusFeature == true)
				columnssertemp1[4] = new nlobjSearchColumn(
						'custrecord_serial_inventorystatus');

			var SrchRecordTmpLot1 = nlapiSearchRecord(
					'customrecord_wmsse_serialentry', null, filterssertemp1,
					columnssertemp1);
			var compSubRecord = '';
			compSubRecord = vInvRec.editCurrentLineItemSubrecord('item',
					'countdetail');
			if (compSubRecord != '' && compSubRecord != null) {
				try {
					var complinelength = compSubRecord
							.getLineItemCount('inventorydetail');
					nlapiLogExecution('ERROR', 'complinelength', complinelength);
					if (parseInt(complinelength) > 0) {
						for (var r1 = 1; r1 <= complinelength; r1++) {
							compSubRecord.removeLineItem('inventorydetail', 1);
						}
					}

				} catch (ex) {
					nlapiLogExecution('Debug', "exception in subrecord", ex);
				}

			}
			var LotArray = '';
			var QtyArray = '';
			if (SrchRecordTmpLot1 != null && SrchRecordTmpLot1 != ''
					&& SrchRecordTmpLot1 != 'null') {
				for (var n = 0; n < SrchRecordTmpLot1.length; n++) {
					/*
					 * if(serialArray==null || serialArray=='') {
					 * serialArray=SrchRecordTmpLot1[n].getValue('custrecord_wmsse_ser_no');
					 * QtyArray=SrchRecordTmpLot1[n].getValue('custrecord_wmsse_ser_qty'); }
					 * else {
					 * serialArray=serialArray+","+SrchRecordTmpLot1[n].getValue('custrecord_wmsse_ser_no');
					 * QtyArray=QtyArray+","+SrchRecordTmpLot1[n].getValue('custrecord_wmsse_ser_qty'); }
					 */

					/*
					 * var totalSerialArray=serialArray.split(','); var
					 * totalQtyArray=QtyArray.split(',');
					 * nlapiLogExecution('ERROR',
					 * 'totalSerialArray',totalSerialArray);
					 * nlapiLogExecution('ERROR',
					 * 'totalQtyArray',totalQtyArray);
					 */

					if (compSubRecord == '' || compSubRecord == null) {
						compSubRecord = vInvRec.createCurrentLineItemSubrecord(
								'item', 'countdetail');
					}

					compSubRecord.selectNewLineItem('inventorydetail');
					compSubRecord.setCurrentLineItemValue('inventorydetail',
							'quantity', SrchRecordTmpLot1[n]
									.getValue('custrecord_wmsse_ser_qty'));
					compSubRecord.setCurrentLineItemValue('inventorydetail',
							'inventorynumber', SrchRecordTmpLot1[n]
									.getValue('custrecord_wmsse_ser_no'));
					if (inventoryStatusFeature == true)
						compSubRecord
								.setCurrentLineItemValue(
										'inventorydetail',
										'inventorystatus',
										SrchRecordTmpLot1[n]
												.getValue('custrecord_serial_inventorystatus'));
					compSubRecord.commitLineItem('inventorydetail');

				}
				var vBinOpenTaskLotArr = "";
				var vBinOpenTaskBinIdArr = "";
				var vBinOpenTaskBinQtyArr = "";
				if (vBinOpenTaskDetails != null && vBinOpenTaskDetails != ''
						&& vBinOpenTaskDetails.length > 0) {
					vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
					vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
					vBinOpenTaskLotArr = vBinOpenTaskDetails[3];
				}
				nlapiLogExecution('Debug', "vBinOpenTaskLotArr",
						vBinOpenTaskLotArr);
				for (var h = 0; h < vBinOpenTaskLotArr.length; h++) {

					compSubRecord.selectNewLineItem('inventorydetail');
					compSubRecord.setCurrentLineItemValue('inventorydetail',
							'quantity', vBinOpenTaskBinQtyArr[h]);
					compSubRecord.setCurrentLineItemValue('inventorydetail',
							'inventorynumber', vBinOpenTaskLotArr[h]);
					compSubRecord.commitLineItem('inventorydetail');
				}

				compSubRecord.commit();

				// We are closing this lot numbers after updating the open task
				// record
				/*
				 * for (var j = 0; j < SrchRecordTmpLot1.length; j++) { var
				 * TempRecord=SrchRecordTmpLot1[j]; nlapiLogExecution('ERROR',
				 * 'TempRecord.getId()',TempRecord.getId());
				 * nlapiLogExecution('ERROR',
				 * 'TempRecord.getValue(name)',TempRecord.getValue('name')); var
				 * tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
				 * tempSerial.setFieldValue('id', TempRecord.getId());
				 * tempSerial.setFieldValue('name',
				 * TempRecord.getValue('name'));
				 * tempSerial.setFieldValue('custrecord_wmsse_ser_note1',
				 * 'because of lot number is processed for CYCC we have marked
				 * this lot number as closed');
				 * tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
				 * nlapiSubmitRecord(tempSerial); TempRecord=null;
				 * tempSerial=null; }
				 */
			}
			filterssertemp1 = null;
			SrchRecordTmpLot1 = null;
			columnssertemp1 = null;

		} else if (itemType == "inventoryitem" || itemType == "assemblyitem") {
			if (inventoryStatusFeature == true) {
				nlapiLogExecution('ERROR', 'inside else itemtype', itemType);
				var filterssertemp1 = new Array();
				var serialArray = '';
				filterssertemp1[0] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_status', null, 'is', 'F');
				filterssertemp1[1] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_ordline', null, 'equalto',
						planLineNo);
				filterssertemp1[2] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_ordno', null, 'anyof',
						planInternalId);
				filterssertemp1[3] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_item', null, 'anyof', itemId);
				// customrecord.setFieldValue('custrecord_wmsse_ser_item',
				// cycArray["custparam_fetcheditemid"]);
				/*
				 * var columnssertemp1 = new Array(); columnssertemp1[0] = new
				 * nlobjSearchColumn('custrecord_wmsse_ser_no');
				 * columnssertemp1[1] = new
				 * nlobjSearchColumn('custrecord_wmsse_ser_bin');
				 * columnssertemp1[2] = new
				 * nlobjSearchColumn('custrecord_wmsse_ser_qty');
				 * columnssertemp1[3] = new nlobjSearchColumn('name');
				 * columnssertemp1[4] = new
				 * nlobjSearchColumn('custrecord_serial_inventorystatus');
				 */

				var SrchRecordTmpLot1 = nlapiSearchRecord(
						'customrecord_wmsse_serialentry',
						'customsearch_wmsse_serialdetails_search',
						filterssertemp1);
				var compSubRecord = '';
				compSubRecord = vInvRec.editCurrentLineItemSubrecord('item',
						'countdetail');
				if (compSubRecord != '' && compSubRecord != null) {
					try {
						var complinelength = compSubRecord
								.getLineItemCount('inventorydetail');
						nlapiLogExecution('ERROR', 'complinelength',
								complinelength);
						if (parseInt(complinelength) > 0) {
							for (var r1 = 1; r1 <= complinelength; r1++) {
								compSubRecord.removeLineItem('inventorydetail',
										1);
							}
						}
					} catch (ex) {
						nlapiLogExecution('Debug', "exception in subrecord", ex);
					}

				}
				var LotArray = '';
				var QtyArray = '';
				if (SrchRecordTmpLot1 != null && SrchRecordTmpLot1 != ''
						&& SrchRecordTmpLot1 != 'null') {
					for (var invInvCount = 0; invInvCount < SrchRecordTmpLot1.length; invInvCount++) {
						if (compSubRecord == '' || compSubRecord == null) {
							compSubRecord = vInvRec
									.createCurrentLineItemSubrecord('item',
											'countdetail');
						}

						compSubRecord.selectNewLineItem('inventorydetail');
						compSubRecord.setCurrentLineItemValue(
								'inventorydetail', 'quantity',
								SrchRecordTmpLot1[invInvCount]
										.getValue('custrecord_wmsse_ser_qty'));
						// compSubRecord.setCurrentLineItemValue('inventorydetail',
						// 'inventorynumber',
						// SrchRecordTmpLot1[invInvCount].getValue('custrecord_wmsse_ser_no'));
						// if(inventoryStatusFeature == true)
						compSubRecord
								.setCurrentLineItemValue(
										'inventorydetail',
										'inventorystatus',
										SrchRecordTmpLot1[invInvCount]
												.getValue('custrecord_serial_inventorystatus'));
						compSubRecord.commitLineItem('inventorydetail');
					}

					compSubRecord.commit();
				}
				filterssertemp1 = null;
				SrchRecordTmpLot1 = null;
				columnssertemp1 = null;
				compSubRecord = null;
			}
		}

		vInvRec.commitLineItem('item');

		var recId = nlapiSubmitRecord(vInvRec);
		vInvRec = null;
		nlapiLogExecution('ERROR', 'cycle count qty updated successfully',
				recId);
	} catch (e) {
		nlapiLogExecution('ERROR', 'Catch Error in submitting inventory count',
				e);
		var recId = e.getCode();
		nlapiLogExecution('ERROR', 'recId', recId);
	}
	return recId;
}

/**
 * To create shipmanifest record
 * 
 * @param vWMSSeOrdNo
 * @param vContLpNo
 * @param containersize
 * @param packageweight
 * @param length
 * @param width
 * @param height
 */
function CreateShippingManifestRecord(vWMSSeOrdNo, vContLpNo, containersize,
		packageweight, length, width, height, trantype, rec) {
	try {

		if (vWMSSeOrdNo != null && vWMSSeOrdNo != "") {
			var freightterms = "";
			var otherrefnum = "";
			var servicelevelvalue = '';

			var ref5 = "";

			// var trantype = nlapiLookupField('transaction', vWMSSeOrdNo,
			// 'recordType');
			// Get the records in SalesOrder
			var searchresults;
			var vCustShipCountry;
			// var rec= nlapiLoadRecord(trantype, vWMSSeOrdNo);

			var opentaskordersearchresult = getOpenTaskShipmentDetails(
					vWMSSeOrdNo, vContLpNo);

			var entity = rec.getFieldValue('entity');
			var shiptocountry = rec.getFieldValue('shipcountry');
			var shipmethod = rec.getFieldText('shipmethod');
			var customerid;

			if (entity != "" && entity != null) {

				var fields = [ 'entityid', 'resalenumber', 'shipcountry' ];
				var columns = nlapiLookupField('customer', entity, fields);
				customerid = columns.entityid;
				var resaleno = columns.resalenumber;
				vCustShipCountry = columns.shipcountry;
			}

			vCustShipCountry = rec.getFieldValue('shipcountry');

			if (resaleno == '' || resaleno == null) {
				resaleno = "";
			}
			var ShipManifest = nlapiCreateRecord('customrecord_wmsse_ship_manifest');
			ShipManifest.setFieldValue('custrecord_wmsse_ship_orderno', rec
					.getFieldValue('tranid'));
			// ShipManifest.setFieldValue('custrecord_wmsse_ship_carrier',rec.getFieldValue('custbody_salesorder_carrier'));
			ShipManifest.setFieldValue('custrecord_wmsse_ship_custom1',
					resaleno);
			ShipManifest.setFieldValue('custrecord_wmsse_ship_city', rec
					.getFieldValue('shipcity'));
			ShipManifest.setFieldValue('custrecord_wmsse_ship_state', rec
					.getFieldValue('shipstate'));
			if (customerid != null && customerid != ''
					&& customerid != 'undefined') {
				ShipManifest.setFieldValue('custrecord_wmsse_ship_custid',
						customerid);
			}
			ShipManifest.setFieldValue('custrecord_wmsse_ship_country',
					vCustShipCountry);
			ShipManifest.setFieldValue('custrecord_wmsse_ship_addr1', rec
					.getFieldValue('shipaddress1'));
			ShipManifest.setFieldValue('custrecord_wmsse_ship_phone', rec
					.getFieldValue('shipphone'));

			// sales order specific code
			var islinelevelship = "F";
			/*
			 * if(trantype=="salesorder") {
			 */
			var contactName = rec.getFieldValue('shipattention');
			var entity = rec.getFieldText('entity');
			if (contactName != null && contactName != '')
				contactName = contactName.replace(",", " ");

			if (entity != null && entity != '')
				entity = entity.replace(",", " ");

			ShipManifest.setFieldValue('custrecord_wmsse_ship_contactname',
					contactName);
			// ShipManifest.setFieldValue('custrecord_wmsse_ship_ordertype',rec.getFieldText('custbody_nswmssoordertype'));
			freightterms = rec.getFieldText('custbody_wmsse_freightterms');
			nlapiLogExecution('Debug', 'freightterms', freightterms);
			otherrefnum = rec.getFieldValue('otherrefnum');
			ShipManifest.setFieldValue('custrecord_wmsse_ship_paymethod',
					freightterms);

			var cashondelivery = rec.getFieldValue('custbody_wmsse_codflag');
			ShipManifest.setFieldValue('custrecord_wmsse_ship_codflag',
					cashondelivery);
			// ShipManifest.setFieldValue('custrecord_wmsse_ship_codflag',cashondelivery);
			ShipManifest.setFieldValue('custrecord_wmsse_ship_email', rec
					.getFieldValue('email'));

			var zipvalue = rec.getFieldValue('shipzip');
			var servicelevelvalue = rec.getFieldText('shipmethod');
			var consignee = rec.getFieldValue('shipaddressee');

			var shipcomplete = rec.getFieldValue('shipcomplete');
			var termscondition = rec.getFieldText('terms');

			islinelevelship = rec.getFieldValue('ismultishipto');
			nlapiLogExecution('Debug', 'islinelevelship', islinelevelship);

			var residentialflag = 'F';
			residentialflag = rec.getFieldValue('shipisresidential');
			ShipManifest.setFieldValue(
					'custrecord_wmsse_ship_residential_flag', residentialflag);
			// nlapiLogExecution('Debug', 'lineno',lineno);

			/*
			 * if(lineno!=null && lineno!='') { var shipmethodLineLevel =
			 * rec.getLineItemText('item','shipmethod',lineno);
			 * 
			 *  }
			 */

			// nlapiLogExecution('Debug', 'signaturerequired',shipcomplete);
			// var shiptotal="0.00";
			/*
			 * if((shipcomplete=="T")&&(cashondelivery=="T")) {
			 * 
			 * ShipManifest.setFieldValue('custrecord_ship_codflag','T');
			 * shiptotal=rec.getFieldValue('subtotal');
			 * ShipManifest.setFieldValue('custrecord_ship_codamount',shiptotal); }
			 * else {
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_codflag','F');
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_codamount',shiptotal); }
			 */

			if (consignee != "" || consignee != null)
				ShipManifest.setFieldValue('custrecord_wmsse_ship_consignee',
						consignee);
			else
				ShipManifest.setFieldValue('custrecord_wmsse_ship_consignee',
						entity);

			ShipManifest.setFieldValue('custrecord_wmsse_ship_servicelevel',
					servicelevelvalue);

			if (servicelevelvalue == null || servicelevelvalue == '') {
				// ShipManifest.setFieldValue('custrecord_wmsse_ship_servicelevel',shipmethodLineLevel);

			}

			ShipManifest.setFieldValue('custrecord_wmsse_ship_zip', zipvalue);
			// ShipManifest.setFieldValue('custrecord_ship_zip',custzip);

			ShipManifest.setFieldValue('custrecord_wmsse_ship_ref2',
					otherrefnum);
			// if(weight == null || weight == '' || parseFloat(weight) == 0)
			// weight='0.01';
			ShipManifest.setFieldValue('custrecord_wmsse_ship_pkgwght',
					parseFloat(packageweight).toFixed(4));
			var signaturerequired = rec
					.getFieldValue('custbody_wmsse_signiturerequired');
			ShipManifest.setFieldValue('custrecord_wmsse_ship_signature_req',
					signaturerequired);
			var saturdaydelivery = rec
					.getFieldValue('custbody_wmsse_saturdaydelivery');
			ShipManifest.setFieldValue('custrecord_wmsse_ship_satflag',
					saturdaydelivery);
			ShipManifest.setFieldValue('custrecord_wmsse_ship_pkgtype',
					containersize);
			// }

			var address1 = rec.getFieldValue('shipaddr1');
			var address2 = rec.getFieldValue('shipaddr2');
			var address3 = "";
			// ship address3
			try {
				address3 = rec.getFieldValue('shipaddr3');
				nlapiLogExecution('Debug', 'address3', address3);
			} catch (exp) {

				nlapiLogExecution('Debug', 'shipaddress3 exception', exp);
			}
			// end of shi shipaddress3
			var zip = rec.getFieldValue('shipzip');
			var servicelevel = rec.getFieldText('shipmethod');
			if (address1 != null && address1 != '')
				address1 = address1.replace(",", " ");
			if (address2 != null && address2 != '')
				address2 = address2.replace(",", " ");

			ShipManifest.setFieldValue('custrecord_wmsse_ship_order',
					vWMSSeOrdNo);
			ShipManifest.setFieldValue('custrecord_wmsse_ship_custom5', "S");
			ShipManifest.setFieldValue('custrecord_wmsse_ship_void', "N");

			ShipManifest.setFieldValue('custrecord_wmsse_ship_contactname',
					contactName);
			// ShipManifest.setFieldValue('custrecord_wmsse_ship_ordertype',rec.getFieldText('custbody_nswmssoordertype'));

			ShipManifest.setFieldValue('custrecord_wmsse_ship_paymethod',
					freightterms);

			ShipManifest.setFieldValue('custrecord_wmsse_ship_addr1', address1);
			ShipManifest.setFieldValue('custrecord_wmsse_ship_addr2', address2);
			// inserting ship address3 value into ship manifst record
			if (address3 != "" || address3 != null) {
				ShipManifest.setFieldValue('custrecord_wmsse_ship_addr3',
						address3);
			}
			var entity = rec.getFieldValue('entity');
			if (islinelevelship == 'T') {
				var customaddressfound = "F";
				try {
					var wmsseaddresslength = rec.getLineItemCount('iladdrbook');
					var soshipinternalid = rec.getLineItemValue('item',
							'shipaddress', 1);

					for (var n = 1; n <= wmsseaddresslength; n++) {
						var shipaddrId = rec.getLineItemValue('iladdrbook',
								'iladdrinternalid', n);
						if (soshipinternalid != null) {
							if (soshipinternalid == shipaddrId) {
								customaddressfound = "T";
								var custaddr1 = rec.getLineItemValue(
										'iladdrbook', 'iladdrshipaddr1', n);
								var custaddr2 = rec.getLineItemValue(
										'iladdrbook', 'iladdrshipaddr2', n);
								var custaddresee = rec.getLineItemValue(
										'iladdrbook', 'iladdrshipaddressee', n);
								var custcity = rec.getLineItemValue(
										'iladdrbook', 'iladdrshipcity', n);
								vCustShipCountry = rec.getLineItemValue(
										'iladdrbook', 'iladdrshipcountry', n);
								var custstate = rec.getLineItemValue(
										'iladdrbook', 'iladdrshipstate', n);
								var custzip = rec.getLineItemValue(
										'iladdrbook', 'iladdrshipzip', n);
								var custphone = rec.getLineItemValue(
										'iladdrbook', 'iladdrshipphone', n);
								var custattention = rec.getLineItemValue(
										'iladdrbook', 'iladdrshipattention', n);

								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_phone',
										custphone);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_contactname',
										custattention);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_country',
										vCustShipCountry);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_city', custcity);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_state',
										custstate);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_addr1',
										custaddr1);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_addr2',
										custaddr2);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_zip', custzip);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_consignee',
										custaddresee);

								break;
							}
						}

					}
				} catch (exp) {

					nlapiLogExecution('Debug', 'Exp in LinLevelAddress', exp);
				}
				nlapiLogExecution('Debug', 'customaddressfound',
						customaddressfound);
				if (customaddressfound == "F") {
					if (entity != null && entity != '') {
						try {
							var entityrecord = nlapiLoadRecord('customer',
									entity); // Ganesh: We can try to replace
												// with search results Need to
												// think to remove this

							if (entityrecord != null && entityrecord != '') {
								var custaddr1 = entityrecord
										.getFieldValue('shipaddr1');
								var custaddr2 = entityrecord
										.getFieldValue('shipaddr2');
								var custaddresee = entityrecord
										.getFieldValue('shipaddressee');
								var custcity = entityrecord
										.getFieldValue('shipcity');
								var custstate = entityrecord
										.getFieldValue('shipstate');
								var custzip = entityrecord
										.getFieldValue('shipzip');
								var custcountry = entityrecord
										.getFieldValue('shipcountry');
								var customlength = entityrecord
										.getLineItemCount('addressbook');
								var custphone = entityrecord
										.getFieldValue('phone');
								var custcontact = entityrecord
										.getFieldValue('shipattention');
								for (var p = 1; p <= customlength; p++) {
									var defaultshipping = entityrecord
											.getLineItemValue('addressbook',
													'defaultshipping', p);
									if (defaultshipping == "T") {
										var custphone = entityrecord
												.getLineItemValue(
														'addressbook',
														'phone_initialvalue', p);

										ShipManifest.setFieldValue(
												'custrecord_wmsse_ship_phone',
												custphone);

										break;
									}
								}
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_country',
										custcountry);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_city', custcity);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_state',
										custstate);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_addr1',
										custaddr1);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_addr2',
										custaddr2);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_zip', custzip);
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_consignee',
										custaddresee);

								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_contactname',
										custcontact);

							}
						} catch (exp) {
							nlapiLogExecution('Debug',
									'Exception in Loading Customer', exp);
							entityrecord = '';
						}
					}
				}
			}

			var servicelevellbyshipmethod = "";
			var ServiceLevelId = "";
			ServiceLevelId = rec.getFieldValue('shipmethod');
			nlapiLogExecution('Debug', 'ServiceLevelId', ServiceLevelId);
			if (ServiceLevelId != null && ServiceLevelId != "") {
				servicelevellbyshipmethod = GetSerViceLevelByShipmethod(ServiceLevelId);
			} else {
				if (islinelevelship == 'T') {
					if (opentaskordersearchresult != null
							&& opentaskordersearchresult != "") {

						var ServiceLevelId = opentaskordersearchresult[0]
								.getValue('custrecord_wmsse_shipmethod', null,
										'group');
						if (ServiceLevelId != null && ServiceLevelId != "")
							servicelevellbyshipmethod = GetSerViceLevelByShipmethod(ServiceLevelId);
					}
				}
			}

			if ((servicelevellbyshipmethod != null)
					&& (servicelevellbyshipmethod != '')
					&& (servicelevellbyshipmethod.length > 0)) {
				nlapiLogExecution('Debug', 'servicelevellbyshipmethod',
						'servicelevellbyshipmethod');

				var shipserviceLevel = servicelevellbyshipmethod[0]
						.getValue('custrecord_wmsse_carrier_service_level');
				var wmscarriertype = servicelevellbyshipmethod[0]
						.getValue('custrecord_wmsse_carrier_id');
				nlapiLogExecution('Debug', 'shipmethodshipserviceLevel',
						shipserviceLevel);
				nlapiLogExecution('Debug', 'shipmethodshipserviceLevel',
						wmscarriertype);
				ShipManifest.setFieldValue(
						'custrecord_wmsse_ship_servicelevel', shipserviceLevel);
				ShipManifest.setFieldValue('custrecord_wmsse_ship_carrier',
						wmscarriertype);

			}
			/*
			 * if(trantype=="transferorder") { nlapiLogExecution('Debug',
			 * 'tolocationtstt', trantype); var tolocation =
			 * rec.getFieldValue('transferlocation'); nlapiLogExecution('Debug',
			 * 'tolocation', tolocation);
			 * 
			 * var record = nlapiLoadRecord('location', tolocation);
			 * 
			 * var shipfromaddress1=record.getFieldValue('addr1'); var
			 * shipfromaddress2=record.getFieldValue('addr2'); var
			 * shipfromcity=record.getFieldValue('city'); var
			 * shipfromstate=record.getFieldValue('state'); var shipfromzipcode
			 * =record.getFieldValue('zip'); var
			 * shipfromcompanyname=record.getFieldValue('addressee'); var
			 * shipfromphone=record.getFieldValue('addrphone'); var
			 * shipfromcountry =record.getFieldValue('country'); //var
			 * prefixshipmethod=record.getFieldValue('custrecord_preferred_ship_method');
			 * //ShipManifest.setFieldValue('custrecord_wmsse_ship_carrier',prefixshipmethod);
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_city',shipfromcity);
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_state',shipfromstate);
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_country',shipfromcountry);
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_addr1',shipfromaddress1);
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_zip',shipfromzipcode);
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_addr2',shipfromaddress2);
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_phone',shipfromphone);
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_custid',shipfromcompanyname);
			 * ShipManifest.setFieldValue('custrecord_wmsse_ship_contactname',shipfromcompanyname);
			 *  }
			 */
			// code for Third Party Account number
			if (freightterms != "SENDER") {

				// var
				// thirdpartyacct=entityrecord.getFieldValue('thirdpartyacct');
				var thirdpartyacct = rec
						.getFieldValue('custbody_wmsse_thirdpartyaccountnumber');
				nlapiLogExecution('ERROR', 'thirdpartyacct', thirdpartyacct);
				if ((thirdpartyacct != null) && (thirdpartyacct != '')) {
					nlapiLogExecution('ERROR', 'thirdpartyacct', thirdpartyacct);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_account',
							thirdpartyacct);

				}
			}
			nlapiLogExecution('Debug', 'freightterms', freightterms);
			var freightvalue = "";
			if (freightterms == "SENDER") {
				freightvalue = "SHP";
			}
			if (freightterms == "RECEIVER") {
				freightvalue = "REC";
			}
			if (freightterms == "3RDPARTY") {
				freightvalue = "TP";
			}
			nlapiLogExecution('Debug', 'freightvalue', freightvalue);

			var RefFiveExist = IsRefFiveExist(vContLpNo, site);
			nlapiLogExecution('Debug', 'RefFiveExist', RefFiveExist);
			ShipManifest.setFieldValue('custrecord_wmsse_ship_paymethod',
					freightvalue);
			if (opentaskordersearchresult != null
					&& opentaskordersearchresult != "") {
				nlapiLogExecution('Debug', 'inside opentask search results',
						opentaskordersearchresult);

				var oldcontainer = "";
				for (l = 0; l < opentaskordersearchresult.length; l++) {
					nlapiLogExecution('Debug', 'inside opentask', containerid);

					var custlenght = "";
					var custheight = "";
					var custwidht = "";

					var sku = "";
					var vskuno = "";
					var uomlevel = "";
					var shiplpno = "";

					var containerlpno = opentaskordersearchresult[l].getValue(
							'custrecord_wmsse_container_lp_no', null, 'group');
					var shiplpno = opentaskordersearchresult[l].getValue(
							'custrecord_wmsse_ship_lp_no', null, 'group');
					sku = opentaskordersearchresult[l].getText(
							'custrecord_wmsse_sku', null, 'group');
					vskuno = opentaskordersearchresult[l].getValue(
							'custrecord_wmsse_sku', null, 'group');
					// uomlevel =
					// opentaskordersearchresult[l].getValue('custrecord_uom_level');
					var name = opentaskordersearchresult[l].getValue('name',
							null, 'group');
					var site = opentaskordersearchresult[l].getValue(
							'custrecord_wmsse_wms_location', null, 'group');
					var sitecountry = "";
					ShipManifest.setFieldValue(
							'custrecord_wmsse_ship_location', site);
					// Start Case#:201413403
					/*
					 * if(trantype!="transferorder") Case#:201421457 {
					 */
					if (site != null && site != "") {

						var locrecord = nlapiLoadRecord('location', site);

						var shipfromaddress1 = locrecord.getFieldValue('addr1');
						var shipfromaddress2 = locrecord.getFieldValue('addr2');
						var shipfromcity = locrecord.getFieldValue('city');
						var shipfromstate = locrecord.getFieldValue('state');
						var shipfromzipcode = locrecord.getFieldValue('zip');
						var shipfromcompanyname = locrecord
								.getFieldValue('addressee');
						var shipfromphone = locrecord
								.getFieldValue('addrphone');
						sitecountry = getLocationCountry(site);

						ShipManifest
								.setFieldValue(
										'custrecord_wmsse_ship_from_city',
										shipfromcity);
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_from_state',
								shipfromstate);
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_from_addr1',
								shipfromaddress1);
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_from_zip',
								shipfromzipcode);
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_from_addr2',
								shipfromaddress2);
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_from_phone',
								shipfromphone);
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_from_company',
								shipfromcompanyname);
					}

					// }
					// End Case#:201413403
					if (oldcontainer != containerlpno) {
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_ref3', name);
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_contlp', containerlpno);
						if (RefFiveExist == "T") {
							ShipManifest.setFieldValue(
									'custrecord_wmsse_ship_ref5', "");
						} else {
							ShipManifest
									.setFieldValue(
											'custrecord_wmsse_ship_ref5',
											containerlpno);
						}

						var containerid = opentaskordersearchresult[l]
								.getValue('custrecord_wmsse_container', null,
										'group');
						var containername = opentaskordersearchresult[l]
								.getText('custrecord_wmsse_container', null,
										'group');
						nlapiLogExecution('Debug', 'container id', containerid);
						nlapiLogExecution('Debug', 'container name',
								containername);
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_length', parseFloat(
										length).toFixed(4));
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_width',
								parseFloat(width).toFixed(4));
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_height', parseFloat(
										height).toFixed(4));
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_ref2', otherrefnum);
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_pkgtype', containername);

						/*
						 * if (containerlpno != null && containerlpno != "") {
						 * var PackageWeight = getTotalWeight(containerlpno);
						 * if(PackageWeight == null || PackageWeight == '' ||
						 * parseFloat(PackageWeight) == 0)
						 * PackageWeight='0.0001';
						 */
						ShipManifest.setFieldValue(
								'custrecord_wmsse_ship_pkgwght', parseFloat(
										packageweight).toFixed(4));

						// Start Code for getting packagenumber by Fo

						var opentaskPackcompletesearchresults = getpackingcompletd(name);

						if (opentaskPackcompletesearchresults != null
								&& opentaskPackcompletesearchresults != '') {
							var totalpackagessearchresults = getTotalpackagenumberbyfo(vWMSSeOrdNo);

							var totalpakages = 0;
							if (totalpackagessearchresults != null
									|| totalpackagessearchresults != '') {

								totalpakages = totalpackagessearchresults.length;
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_pkgcount',
										totalpakages.toString());
							} else {
								totalpakages = 1;
								ShipManifest.setFieldValue(
										'custrecord_wmsse_ship_pkgcount',
										totalpakages.toString());
							}
						}
					}

					oldcontainer = containerlpno;

				}
				opentaskordersearchresult = null;
			}
			// }
		} else {

		}
		nlapiSubmitRecord(ShipManifest, false, true);
		try {
			// For international commodity shipment
			CommodityInternationalShipmentNew(vWMSSeOrdNo, vContLpNo, trantype,
					rec, vCustShipCountry, packageweight, sitecountry);
		} catch (exp) {

			nlapiLogExecution('Debug', 'CommodityshipmentExp', exp);
		}
	} catch (e) {

		nlapiLogExecution('Debug', 'unexpected error', e.toString());
		nlapiLogExecution('Debug', 'unexpected error', 'I am unsuccess3');
	}

	nlapiLogExecution('Debug', 'Out of CreateShippingManifestRecord', '');

}

function IsRefFiveExist(vContLpNo, site) {
	nlapiLogExecution('Debug', 'Into IsContLpExist', vContLpNo);
	var IsContLpExist = 'F';

	try {
		var filter = new Array();
		filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_contlp', null,
				'is', vContLpNo));
		filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_ref5', null,
				'is', vContLpNo));
		if (site != null) {
			filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_location',
					null, 'is', site));
		}
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_wmsse_ship_orderno');
		var manifestList = nlapiSearchRecord(
				'customrecord_wmsse_ship_manifest', null, filter, columns);
		if (manifestList != null && manifestList.length > 0)
			IsContLpExist = 'T';
	} catch (e) {
		nlapiLogExecution('Debug', 'unexpected error in IsContLpExist');
	}
	nlapiLogExecution('Debug', 'Out of IsContLpExist', IsContLpExist);
	return IsContLpExist;
}
/**
 * To get open task record details to ship with task type 'Pack' and status flag
 * 'Packing completed'
 * 
 * @param vWMSSeOrdNo
 * @param vContLpNo
 * @returns {Array}
 */
function getOpenTaskShipmentDetails(vWMSSeOrdNo, vContLpNo) {
	nlapiLogExecution('Debug', 'General Functions', 'In to getOpenTaskDetails');
	var filter = new Array();
	var opentaskordersearchresult = new Array();
	filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is',
			vWMSSeOrdNo));
	// filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',
	// null, 'anyof', [28]));//Status Flag - Outbound Pack Complete)
	// filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null,
	// 'anyof', [14]));//Task Type - PACK
	if (vContLpNo != null && vContLpNo != '')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no',
				null, 'is', vContLpNo));

	// var columns = new Array();
	// columns[0] = new
	// nlobjSearchColumn('custrecord_wmsse_comp_id',null,'group');
	// columns[1] = new
	// nlobjSearchColumn('custrecord_wmsse_container_lp_no',null,'group');
	// columns[2] = new
	// nlobjSearchColumn('custrecord_wmsse_total_weight',null,'group');
	// columns[3] = new nlobjSearchColumn('custrecord_wmsse_sku',null,'group');
	// columns[4] = new nlobjSearchColumn('name',null,'group');
	// columns[5] = new
	// nlobjSearchColumn('custrecord_wmsse_wms_location',null,'group');
	// columns[6] = new
	// nlobjSearchColumn('custrecord_wmsse_shipmethod',null,'group');
	// columns[1].setSort();

	opentaskordersearchresult = nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_opentaskresultforship', filter, null);
	filter = null;
	columns = null;
	return opentaskordersearchresult;
}

/**
 * To get packing completed records
 * 
 * @param fonumber
 * @returns
 */
function getpackingcompletd(fonumber) {
	var deviceuploadflag = 'F';

	var filtersopentask = new Array();
	filtersopentask.push(new nlobjSearchFilter('name', null, 'is', fonumber));
	filtersopentask.push(new nlobjSearchFilter('custrecord_wmsse_tasktype',
			null, 'anyof', [ 14 ]));
	filtersopentask.push(new nlobjSearchFilter(
			'custrecord_wmsse_wms_status_flag', null, 'anyof', [ 28 ]));
	var colsopentask = new Array();

	var opentasksearchresults = nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_packcompleteddetails', filtersopentask, null);
	filtersopentask = null;
	colsopentask = null;
	return opentasksearchresults;

}

/**
 * To get service level ship method
 * 
 * @param shipmethodId
 * @returns {String}
 */
function GetSerViceLevelByShipmethod(shipmethodId) {
	var servicelevelListbyshipmethod = '';
	try {
		nlapiLogExecution('Debug', 'carrier in Shipmethod', shipmethodId);
		var filter = new Array();
		// Case# 201415607锟� start
		if (shipmethodId != null && shipmethodId != '')
			filter.push(new nlobjSearchFilter(
					'custrecord_wmsse_carrier_nsmethod', null, 'anyof',
					shipmethodId));
		// Case# 201415607锟� end
		filter.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		var columns = new Array();
		columns[0] = new nlobjSearchColumn(
				'custrecord_wmsse_carrier_service_level');
		columns[1] = new nlobjSearchColumn('custrecord_wmsse_carrier_id');
		servicelevelListbyshipmethod = nlapiSearchRecord(
				'customrecord_wmsse_carrier', null, filter, columns);
		columns = null;
		filter = null;
	} catch (exp) {
		nlapiLogExecution('Debug', 'unexpectedbyshipmethod', exp.toString());
	}
	return servicelevelListbyshipmethod;

}

/**
 * To get total packing number
 * 
 * @param vWMSSeOrdNo
 * @returns
 */
function getTotalpackagenumberbyfo(vWMSSeOrdNo) {
	nlapiLogExecution('Debug', 'into CheckTotalNoOfPackages',
			'into CheckTotalNoOfPackages');
	nlapiLogExecution('Debug', 'vWMSSeOrdNo', vWMSSeOrdNo);
	var filtersopentask = new Array();
	filtersopentask.push(new nlobjSearchFilter('custrecord_wmsse_order_no',
			null, 'anyof', [ vWMSSeOrdNo ]));
	var colsopentask = new Array();
	// colsopentask [0] = new
	// nlobjSearchColumn('custrecord_wmsse_container_lp_no',null,'group');

	var opentasksearchresults = nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_gettotalpackagenumber', filtersopentask, null);
	colsopentask = null;
	filtersopentask = null;
	return opentasksearchresults;

}

/**
 * For internationsl commodity shipment
 * 
 * @param vWMSSeOrdNo
 * @param vWMSContainerlp
 * @param trantype
 * @param salesorderrecord
 * @param shiptocountry
 * @param packageweight
 */
function CommodityInternationalShipmentNew(vWMSSeOrdNo, vWMSContainerlp,
		trantype, salesorderrecord, shiptocountry, packageweight,
		locationcountry) {
	if (salesorderrecord != "" && salesorderrecord != null) {
		var entityvalue = salesorderrecord.getFieldValue('entity');
		nlapiLogExecution("ERROR", 'commodityShipment locationcountry',
				locationcountry);
		nlapiLogExecution("ERROR", 'commodityShipment vshipcountry',
				shiptocountry);
		if (shiptocountry != locationcountry && locationcountry != null
				&& locationcountry != '' && shiptocountry != null
				&& shiptocountry != '') {
			var filteropentask = new Array();

			filteropentask
					.push(new nlobjSearchFilter('custrecord_wmsse_order_no',
							null, 'anyof', [ vWMSSeOrdNo ]));
			filteropentask.push(new nlobjSearchFilter(
					'custrecord_wmsse_container_lp_no', null, 'is',
					[ vWMSContainerlp ]));
			filteropentask.push(new nlobjSearchFilter(
					'custrecord_wmsse_tasktype', null, 'anyof', [ 3 ]));

			var columnsopentask = new Array();
			var qtycolumns = new Array();

			var opentaskrecordsearch = nlapiSearchRecord(
					'customrecord_wmsse_trn_opentask',
					'customsearch_wmsse_commodityshipment', filteropentask,
					null);
			if (opentaskrecordsearch != null) {
				var itemId, itemName, itemtotalqty, upccode, itemeachweight, itemnumber, itemcountryname, containerlp, parentitemid;
				for (var g = 0; g < opentaskrecordsearch.length; g++) {
					containerlp = opentaskrecordsearch[g].getValue(
							'custrecord_wmsse_container_lp_no', null, 'group');
					itemId = opentaskrecordsearch[g].getValue(
							'custrecord_wmsse_sku', null, 'group');
					itemName = opentaskrecordsearch[g].getText(
							'custrecord_wmsse_sku', null, 'group');
					parentitemid = opentaskrecordsearch[g].getValue(
							'custrecord_wmsse_parent_sku_no', null, 'group');

					itemtotalqty = opentaskrecordsearch[g].getValue(
							'custrecord_wmsse_expe_qty', null, 'sum');
					nlapiLogExecution('Debug', 'commedityitemId', itemId);
					nlapiLogExecution('Debug', 'commedtiyitemName', itemName);
					nlapiLogExecution('Debug', 'commedityqty', itemtotalqty);
					nlapiLogExecution('Debug', 'containerlp', containerlp);
					nlapiLogExecution('Debug', 'parentitemid', parentitemid);
					var filtersku = new Array();
					filtersku.push(new nlobjSearchFilter('internalid', null,
							'is', itemId));
					filtersku.push(new nlobjSearchFilter('isinactive', null,
							'is', 'F'));
					var columnssku = new Array();
					columnssku[0] = new nlobjSearchColumn('upccode');
					columnssku[1] = new nlobjSearchColumn('itemid');
					columnssku[2] = new nlobjSearchColumn('displayname');
					columnssku[3] = new nlobjSearchColumn(
							'countryofmanufacture');
					var searchitemrecord = nlapiSearchRecord('item', null,
							filtersku, columnssku);
					if (searchitemrecord != null) {
						upccode = searchitemrecord[0].getValue('upccode');
						itemnumber = searchitemrecord[0].getValue('itemid');
						nlapiLogExecution('Debug', 'commedityupccode', upccode);
						itemdisplayname = searchitemrecord[0]
								.getValue('displayname');
						itemcountryname = searchitemrecord[0]
								.getValue('countryofmanufacture');
						nlapiLogExecution('Debug', 'commedityupccode',
								itemdisplayname);
						nlapiLogExecution('Debug', 'commeditycountrycode',
								itemcountryname);
					}

					var tranid = salesorderrecord.getFieldValue('tranid');
					var totalLine = salesorderrecord.getLineItemCount('item');
					nlapiLogExecution('Debug', 'lineNum ', totalLine);
					var itemunits;
					for (var i = 1; i <= parseFloat(totalLine); i++) {
						var skuname = salesorderrecord.getLineItemText('item',
								'item', i);
						var skuvalue = salesorderrecord.getLineItemValue(
								'item', 'item', i);
						if (parentitemid == skuvalue) {
							itemunits = salesorderrecord.getLineItemValue(
									'item', 'rate', i);
						}
					}
					var totalcummedityweight = parseFloat(packageweight)
							* (itemtotalqty);
					var totalcummedityunit = parseFloat(itemunits)
							* (itemtotalqty);
					nlapiLogExecution('Debug', 'commeditytotalcummedityweight',
							totalcummedityunit);
					var commodityShipment = nlapiCreateRecord('customrecord_wmsse_commodity_shipmentdts');
					commodityShipment.setFieldValue('name', tranid);
					commodityShipment.setFieldValue(
							'custrecord_wmsse_shipment_qty', parseFloat(
									itemtotalqty).toFixed(4));
					commodityShipment.setFieldValue(
							'custrecord_wmsse_shipment_unitofmeasure', 'EA');
					commodityShipment.setFieldValue(
							'custrecord_wmsse_shipment_unitvalue', itemunits);
					commodityShipment.setFieldValue(
							'custrecord_wmsse_shipment_totalcustomval',
							totalcummedityunit);
					commodityShipment.setFieldValue(
							'custrecord_wmss_shipment_totalcomoditywt',
							parseFloat(totalcummedityweight).toFixed(4));
					commodityShipment.setFieldValue(
							'custrecord_wmsse_shipment_skuupccode', upccode);
					commodityShipment.setFieldValue(
							'custrecord_wmsse_shipment_containerlp',
							containerlp);
					commodityShipment.setFieldValue(
							'custrecord_wmsse_shipment_orderno', tranid);
					commodityShipment.setFieldValue(
							'custrecord_wmsse_shipment_contrymanufact',
							itemcountryname);
					commodityShipment.setFieldValue(
							'custrecord_wmsse_shipment_commoditydesp',
							itemdisplayname);
					var tranid = nlapiSubmitRecord(commodityShipment);
					commodityShipment = null;

				}
			}
			filteropentask = null;
			columnsopentask = null;
		}
	}
}

/**
 * Ucc label Generation and inserting ito UCC Master
 * 
 * @param vWMSSeOrdNo
 * @param uompackflag
 * @param vContLpNo
 * @returns
 */
function GenerateLabel(vWMSSeOrdNo, uompackflag, vContLpNo) {
	var uccText = "";
	var duns = "";
	var label = "", uom = "", uccLabel = "";

	try {
		var lpMaxValue = GetMaxLPNo('1', '');
		var prefixlength = lpMaxValue.length;

		if (prefixlength == 0)
			label = "000000000";
		else if (prefixlength == 1)
			label = "00000000" + lpMaxValue;
		else if (prefixlength == 2)
			label = "0000000" + lpMaxValue;
		else if (prefixlength == 3)
			label = "000000" + lpMaxValue;
		else if (prefixlength == 4)
			label = "00000" + lpMaxValue;
		else if (prefixlength == 5)
			label = "0000" + lpMaxValue;
		else if (prefixlength == 6)
			label = "000" + lpMaxValue;
		else if (prefixlength == 7)
			label = "00" + lpMaxValue;
		else if (prefixlength == 8)
			label = "0" + lpMaxValue;
		else if (prefixlength == 9)
			label = lpMaxValue;

		// to get company id
		duns = '15671';
		if (uompackflag == "1")
			uom = "0";
		else if (uompackflag == "3")
			uom = "2";
		else
			uom = "0";
		uccText = uom + duns + label;

		// to get chk digit
		var checkStr = uccText;
		var ARL = 0;
		var BRL = 0;
		var CheckDigitValue = "";
		for (i = checkStr.length - 1; i > 0; i--) {
			ARL = ARL + parseInt(checkStr.charAt(i));
			i--;
		}
		ARL = ARL * 3;
		for (i = checkStr.length - 2; i > 0; i--) {
			BRL = BRL + parseInt(checkStr.charAt(i));
			i--;
		}
		var sumOfARLBRL = ARL + BRL;
		var CheckDigit = 0;

		while (CheckDigit < 10) {
			if (sumOfARLBRL % 10 == 0) {
				CheckDigitValue = CheckDigit;
				break;
			}

			sumOfARLBRL++;
			CheckDigit++;
		}
		nlapiLogExecution('ERROR', 'CreateMasterLPRecord CheckDigit',
				CheckDigitValue.toString());
		uccLabel = "00" + uccText + CheckDigitValue.toString();

		var uccNo = nlapiCreateRecord('customrecord_wmsse_ucc_master');
		uccNo.setFieldValue('name', vContLpNo);
		uccNo.setFieldValue('custrecord_wmsse_contlp', vContLpNo);
		uccNo.setFieldValue('custrecord_wmsse_uccno', uccLabel);
		uccNo.setFieldValue('custrecord_wmsse_orderno', vWMSSeOrdNo);

		var recid = nlapiSubmitRecord(uccNo);

	} catch (err) {

	}
	return recid
}

/**
 * To get LP number from lp range
 * 
 * @param lpType
 * @param whsite
 * @returns {String}
 */
function GetMaxLPNo(lpType, whsite) {
	var maxLP = 1;
	var maxLPPrefix = "";

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_lprange_lpmax');
	columns[1] = new nlobjSearchColumn('custrecord_wmsse_lprange_lpprfix');

	var filters = new Array();

	filters.push(new nlobjSearchFilter('custrecord_wmsse_lprange_lptype', null,
			'anyof', [ lpType ]));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	if (whsite != null && whsite != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_lprange_site',
				null, 'anyof', [ '@NONE@', whsite ]));

	var results = nlapiSearchRecord('customrecord_wmsse_lp_range', null,
			filters, columns);

	if (results != null) {
		if (results.length > 1) {
			alert('More records returned than expected');
			nlapiLogExecution('ERROR',
					'GetMaxLPNo:LP Max Query returned more than 1 row');
		} else {

			var scount = 1;

			LABL1: for (var i = 0; i < scount; i++) {

				nlapiLogExecution('Debug', 'CUSTOM_RECORD_COLLISION', i);
				try {
					var vLPRangeId = results[0].getId();
					var transaction = nlapiLoadRecord(
							'customrecord_wmsse_lp_range', vLPRangeId);
					if (transaction
							.getFieldValue('custrecord_wmsse_lprange_lpmax') != null) {
						maxLP = transaction
								.getFieldValue('custrecord_wmsse_lprange_lpmax');
						maxLPPrefix = transaction
								.getFieldValue('custrecord_wmsse_lprange_lpprfix');
					}
					if (maxLP == null || maxLP == '' || isNaN(maxLP))
						maxLP = 0;
					maxLP = parseInt(maxLP) + 1;
					transaction.setFieldValue('custrecord_wmsse_lprange_lpmax',
							maxLP);
					nlapiSubmitRecord(transaction, true, true);
					nlapiLogExecution('Debug', 'LP range updated for ref# ',
							vLPRangeId);
					transaction = null;

				} catch (ex) {
					var exCode = 'CUSTOM_RECORD_COLLISION';
					var wmsE = 'Inventory record being updated by another user. Please try again...';
					if (ex instanceof nlobjError) {
						wmsE = ex.getCode() + '\n' + ex.getDetails();
						exCode = ex.getCode();
					} else {
						wmsE = ex.toString();
						exCode = ex.toString();
					}
					nlapiLogExecution('Debug', 'Exception in Get Max LP : ',
							wmsE);
					if (exCode == 'CUSTOM_RECORD_COLLISION') {
						scount = scount + 1;
						continue LABL1;
					} else
						break LABL1;
				}
			}
		}
		results = null;
	}
	// convert maxLP to string
	maxLP = maxLP.toString();
	if (maxLPPrefix == 'null' || maxLPPrefix == null || maxLPPrefix == '')
		maxLPPrefix = '';
	nlapiLogExecution('ERROR', 'GetMaxLPNo:New MaxLP', maxLP);
	return maxLPPrefix + maxLP;
}

/**
 * To get Sales orders list with shipping address
 */
function SalesOrderList(vOrdNo) {
	nlapiLogExecution('ERROR', 'General Functions', 'In to SalesOrderList');
	var searchresults = new Array();
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('Internalid', null, 'is', vOrdNo);
	filters[1] = new nlobjSearchFilter('mainline', null, 'is', 'T');
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('tranid');
	columns[1] = new nlobjSearchColumn('shipcarrier');
	// columns[2] = new nlobjSearchColumn('custbody_nswms_company');
	columns[2] = new nlobjSearchColumn('shipaddress1');
	columns[3] = new nlobjSearchColumn('shipaddress2');
	columns[4] = new nlobjSearchColumn('shipcity');
	columns[5] = new nlobjSearchColumn('shipstate');
	columns[6] = new nlobjSearchColumn('shipcountry');
	// columns[8] = new nlobjSearchColumn('custbody_nswmssoordertype');
	columns[7] = new nlobjSearchColumn('entity');
	// columns[10] = new nlobjSearchColumn('custbody_nswmsfreightterms');
	// columns[11] = new nlobjSearchColumn('custbody_customer_phone');
	columns[8] = new nlobjSearchColumn('shipzip');
	columns[9] = new nlobjSearchColumn('email');
	// columns[14] = new nlobjSearchColumn('custbody_nswmssosaturdaydelivery');
	// columns[15] = new nlobjSearchColumn('custbody_nswmscodflag');
	columns[10] = new nlobjSearchColumn('shipmethod');
	columns[11] = new nlobjSearchColumn('otherrefnum');
	columns[12] = new nlobjSearchColumn('shipattention');
	// columns[19] = new nlobjSearchColumn('custbodyshipping_carrier');
	searchresults = nlapiSearchRecord('salesorder',
			'customsearch_wmsse_quickship_iddetails', filters, columns);
	columns = null;
	filters = null;
	return searchresults;
}

/**
 * To get Carrier service level details
 */
function GetSerViceLevel(carrier) {
	nlapiLogExecution('ERROR', 'carrier in GetSerViceLevel', carrier);
	var servicelevelList = '';
	try {

		var filter = new Array();
		filter.push(new nlobjSearchFilter('name', null, 'is', carrier));
		filter.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		var columns = new Array();
		columns[0] = new nlobjSearchColumn(
				'custrecord_wmsse_carrier_service_level');
		servicelevelList = nlapiSearchRecord('customrecord_wmsse_carrier',
				null, filter, columns);
		filter = null;
		columns = null;
	} catch (e) {
		nlapiLogExecution('ERROR', 'unexpected error', e.toString());
	}
	return servicelevelList;

}

/**
 * TO get functional keys
 * 
 * @param formid
 * @returns {String}
 */
function getFunctionkeyScriptSE(formid) {
	var html = "";
	html = html + "<SCRIPT LANGUAGE='javascript'>";
	html = html + "function OnKeyDown_CL() ";
	html = html + " { ";
	// html = html + " alert('hi');";
	html = html + "         if (";
	html = html
			+ " event.keyCode == 112 || event.keyCode == 113 || event.keyCode == 114 || event.keyCode == 115 || event.keyCode == 116 || event.keyCode == 117 ||";
	html = html
			+ " event.keyCode == 118 || event.keyCode == 119 || event.keyCode == 120 || event.keyCode == 121 || event.keyCode == 122 || event.keyCode == 123 || event.keyCode == 13) {";
	html = html + " var arrElements = document.getElementsByTagName('input');";
	html = html + " var keyFound = false;";
	html = html + " for (i = 0; i < arrElements.length; i++) {";
	html = html + " if (arrElements[i].type == 'submit') {";
	html = html + " switch (event.keyCode) {";
	html = html + " case 112:";
	html = html + " if (arrElements[i].value == 'F1')"; // F7 Key
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 113:";
	html = html + " if (arrElements[i].value == 'F2')"; // F8 Key
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 114:";
	html = html + " if (arrElements[i].value == 'F3')"; // F9 Key
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 115:";
	html = html + " if (arrElements[i].value == 'F4')"; // F10 Key
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 116:";
	html = html + " if (arrElements[i].value == 'F5')"; // F11 Key";
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 117:";
	html = html + " if (arrElements[i].value == 'F6')"; // F11 Key";
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 118:";
	html = html
			+ " if (arrElements[i].value == 'F7' || arrElements[i].value == 'Back (F7)')"; // F7
																							// Key";
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 119:";
	html = html + " if (arrElements[i].value == 'F8')"; // F8 Key";
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 120:";
	html = html + " if (arrElements[i].value == 'F9')"; // F9 Key";
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 121:";
	html = html + " if (arrElements[i].value == 'F10')"; // F10 Key";
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 122:";
	html = html + " if (arrElements[i].value == 'F11')"; // F11 Key";
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 123:";
	html = html + " if (arrElements[i].value == 'F12')"; // F12 Key";
	html = html + " keyFound = true;";
	html = html + " break;";
	html = html + " case 13:";
	html = html
			+ "if ((arrElements[i].value == 'ENT' ||  arrElements[i].value == '' || arrElements[i].value == 'Next (Ent)' || arrElements[i].value == 'Submit (Ent)' || arrElements[i].value == 'Revert (Ent)' || arrElements[i].value == 'Save (Ent)') && (window.event.srcElement.type != 'image'))"; // ENTER
																																																																										// KEY
																																																																										// --
																																																																										// ATTN";
	html = html + " keyFound = true;";
	html = html + " break;";

	// html = html + " case 13:";
	// html = html + " if (arrElements[i].value == 'Next [ENT]')"; //ENTER KEY
	// -- ATTN";
	// html = html + " keyFound = true;";
	// html = html + " break;";

	// html = html + " case 118:";
	// html = html + " if (arrElements[i].value == 'Back [F7]')"; //ENTER KEY --
	// ATTN";
	// html = html + " keyFound = true;";
	// html = html + " break;";

	html = html + " }";
	html = html
			+ " if (keyFound == true && arrElements[i].disabled == false) {";
	html = html + " eval('document." + formid
			+ ".' + arrElements[i].name + '.click();');";
	html = html + " return false;";
	html = html + " }";
	// html = html + " if (keyFound == false && window.event.srcElement.type ==
	// 'image') {alert(window.event.srcElement.name);";
	// html = html + " eval('document."+formid+".' +
	// window.event.srcElement.name + '.click();');";
	// html = html + " return false;";
	// html = html + " break;";
	// html = html + " }";
	html = html + " }";
	html = html + " }";
	html = html + " }    ";
	html = html + "   return true; ";
	html = html + "    }";
	html = html + " </SCRIPT>";
	return html;
}

/**
 * This function is used to create adjustment record.
 * 
 * @param item
 * @param vItemType
 * @param loc
 * @param qty
 * @param enterBin
 * @param batchno
 * @param expiryDate
 * @param lot
 * @param notes
 * @param date
 * @param period
 */
function InvokeNSInventoryAdjustment(item, vItemType, loc, qty, enterBin,
		expiryDate, lot, notes, date, period, accountNo, inventoryStatus) {

	nlapiLogExecution('Debug', 'Location info ::', loc);
	nlapiLogExecution('Debug', 'Qty ::', qty);
	nlapiLogExecution('Debug', 'Item ::', item);
	nlapiLogExecution('Debug', 'vItemType ::', vItemType);
	nlapiLogExecution('Debug', 'enterBin ::', enterBin);
	nlapiLogExecution('Debug', 'expiryDate ::', expiryDate);
	nlapiLogExecution('Debug', 'inventoryStatus ::', inventoryStatus);

	var vAccountNo = accountNo;
	var vCost = 0;
	var vAvgCost = 0;
	var vItemname = '';
	var avgcostlot = 0;

	var filters = new Array();
	filters.push(new nlobjSearchFilter('internalid', null, 'is', item));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

	if (loc != null && loc != '' && loc != 'null' && loc != 'undefined'
			&& loc > 0) {
		filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof',
				loc));
	}

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('cost');
	// columns[1] = new nlobjSearchColumn('averagecost');

	// As per email from NS on 02-May-2012 we have changed the code to use
	// 'locationaveragecost' as item unit cost
	// Email from Thad Johnson to Sid
	columns[1] = new nlobjSearchColumn('locationaveragecost');

	columns[2] = new nlobjSearchColumn('itemid');

	// As per recommendation from NS PM Jeff hoffmiester This field 'custitem16'
	// is used as avg cost for Default lot updation in Dec 2011 for TNT
	// columns[3] = new nlobjSearchColumn('custitem16');

	var itemdetails = nlapiSearchRecord('item', null, filters, columns);
	if (itemdetails != null && itemdetails != 'null' && itemdetails != '') {
		vItemname = itemdetails[0].getValue('itemid');
		vCost = itemdetails[0].getValue('cost');
		nlapiLogExecution('Debug', 'vCost', vCost);
		// vAvgCost = itemdetails[0].getValue('averagecost');
		vAvgCost = itemdetails[0].getValue('locationaveragecost');
		// As per recommendation from NS PM Jeff hoffmiester This field
		// custitem16 is used as avg cost for Default lot updation in Dec 2011
		// for TNT
		// avgcostlot=itemdetails[0].getValue('custitem16');
		// nlapiLogExecution('Debug', 'avgcostlot', avgcostlot);
		nlapiLogExecution('Debug', 'Average Cost', vAvgCost);
	}

	var outAdj = nlapiCreateRecord('inventoryadjustment');
	if (vAccountNo != null && vAccountNo != "" && vAccountNo != "null"
			&& vAccountNo != 'undefined') {
		nlapiLogExecution('Debug', 'account', vAccountNo);
		outAdj.setFieldValue('account', vAccountNo);
	} else
		outAdj.setFieldValue('account', 1);
	outAdj.setFieldValue('memo', notes);
	outAdj.selectNewLineItem('inventory');
	outAdj.setCurrentLineItemValue('inventory', 'item', item);
	outAdj.setCurrentLineItemValue('inventory', 'location', loc);
	outAdj.setCurrentLineItemValue('inventory', 'adjustqtyby', parseFloat(qty));

	if (date != null && date != '' && date != 'null' && date != 'undefined') {
		outAdj.setFieldValue('trandate', date);
	}
	if (period != null && period != '' && period != 'null'
			&& period != 'undefined') {
		outAdj.setFieldValue('postingperiod', period);
	}
	if (vAvgCost != null && vAvgCost != "") {
		nlapiLogExecution('Debug', 'into if cond vAvgCost', vAvgCost);
		outAdj.setCurrentLineItemValue('inventory', 'unitcost', vAvgCost);
	} else {
		nlapiLogExecution('Debug', 'into else cond.unit cost', vCost);
		outAdj.setCurrentLineItemValue('inventory', 'unitcost', vCost);
	}

	var subs = nlapiGetContext().getFeature('subsidiaries');
	nlapiLogExecution('Debug', 'subs', subs);
	if (subs == true) {
		var vSubsidiaryVal = getSubsidiaryNew(loc);
		nlapiLogExecution('Debug', 'vSubsidiaryVal', vSubsidiaryVal);
		if (vSubsidiaryVal != null && vSubsidiaryVal != '')
			outAdj.setFieldValue('subsidiary', vSubsidiaryVal);
	}

	nlapiLogExecution('Debug', 'lot', lot);
	if (vItemType == "serializedinventoryitem"
			|| vItemType == "serializedassemblyitem") {

		var tempQty;

		if (parseFloat(qty) < 0) {
			tempQty = -1;
		} else {
			tempQty = 1;
		}

		var filterssertemp1 = new Array();

		filterssertemp1.push(new nlobjSearchFilter(
				'custrecord_wmsse_ser_status', null, 'is', 'F'));

		filterssertemp1.push(new nlobjSearchFilter(
				'custrecord_wmsse_ser_tasktype', null, 'anyof', 10));

		filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_ser_item',
				null, 'anyof', item));
		filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_ser_bin',
				null, 'anyof', enterBin));
		var columnssertemp1 = new Array();
		columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
		columnssertemp1[1] = new nlobjSearchColumn('name');
		var SrchRecordTmpSerial1 = nlapiSearchRecord(
				'customrecord_wmsse_serialentry', null, filterssertemp1,
				columnssertemp1);
		if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != "") {

			nlapiLogExecution('Debug', 'SrchRecordTmpSerial1.length',
					SrchRecordTmpSerial1.length);
			var compSubRecord = outAdj.createCurrentLineItemSubrecord(
					'inventory', 'inventorydetail');
			for (var x = 0; x < SrchRecordTmpSerial1.length; x++) {

				compSubRecord.selectNewLineItem('inventoryassignment');

				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'quantity', tempQty);
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'inventorystatus', inventoryStatus);

				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'receiptinventorynumber', SrchRecordTmpSerial1[x]
								.getValue('custrecord_wmsse_ser_no'));
				if (enterBin != null && enterBin != "" && enterBin != 'null')
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'binnumber', enterBin);
				compSubRecord.commitLineItem('inventoryassignment');

			}
			compSubRecord.commit();

			for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
				var TempRecord = SrchRecordTmpSerial1[j];
				nlapiLogExecution('ERROR', 'TempRecord.getId()', TempRecord
						.getId());
				nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',
						TempRecord.getValue('name'));
				var tempSerial = nlapiLoadRecord(
						'customrecord_wmsse_serialentry', TempRecord.getId());
				tempSerial
						.setFieldValue(
								'custrecord_wmsse_ser_note1',
								'because of Adjustment posted for serial number  we have marked this serial number as closed');
				tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
				nlapiSubmitRecord(tempSerial);
				tempSerial = null;
			}
		}
		filterssertemp1 = null;
		columnssertemp1 = null;
		SrchRecordTmpSerial1 = null;
		compSubRecord = null;

	} else if (vItemType == "inventoryitem"
			|| vItemType == "lotnumberedinventoryitem"
			|| vItemType == "lotnumberedassemblyitem"
			|| vItemType == "assemblyitem") {

		var compSubRecord = outAdj.createCurrentLineItemSubrecord('inventory',
				'inventorydetail');
		var complinelength = compSubRecord
				.getLineItemCount('inventoryassignment');
		nlapiLogExecution('ERROR', 'complinelength', complinelength);
		if (parseInt(complinelength) > 0)
			compSubRecord.selectLineItem('inventoryassignment', 1);
		else
			compSubRecord.selectNewLineItem('inventoryassignment');

		compSubRecord.setCurrentLineItemValue('inventoryassignment',
				'quantity', qty);
		compSubRecord.setCurrentLineItemValue('inventoryassignment',
				'inventorystatus', inventoryStatus);

		if (enterBin != null && enterBin != "" && enterBin != 'null')
			compSubRecord.setCurrentLineItemValue('inventoryassignment',
					'binnumber', enterBin);
		nlapiLogExecution('ERROR', 'expiryDate', expiryDate);
		if (vItemType == "lotnumberedinventoryitem"
				|| vItemType == "lotnumberedassemblyitem") {
			if (lot != null && lot != '' && lot != 'null' && lot != 'undefined')
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'receiptinventorynumber', lot);
			if (expiryDate != null && expiryDate != "" && expiryDate != 'null')
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'expirationdate', expiryDate);
		}
		compSubRecord.commitLineItem('inventoryassignment');
		compSubRecord.commit();

		compSubRecord = null;
	}

	outAdj.commitLineItem('inventory');
	var id = nlapiSubmitRecord(outAdj, false, true);
	nlapiLogExecution('Debug', 'type argument', 'type is create');
	nlapiLogExecution('Debug', 'type argument id', id);
	outAdj = null;
	return id;
}

/**
 * To create/update open task with INVT task type
 * 
 * @param itemType
 * @param whLocation
 * @param itemId
 * @param quantity
 * @param fromBinId
 * @param batchno
 * @param inventoryAdjustId
 * @param taskType
 */
function createInventoryOpenTask(itemType, whLocation, itemId, quantity,
		fromBinId, batchno, inventoryAdjustId, taskType, ExpDate, uom,
		conversionRate, inventoryStatus) {

	var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
	nlapiLogExecution('ERROR', 'Creating Record', 'TRN_OPENTASK');

	if (inventoryAdjustId != null && inventoryAdjustId != '')
		customrecord.setFieldValue('name', inventoryAdjustId);
	customrecord.setFieldValue('custrecord_wmsse_act_begin_date', DateStamp());
	customrecord.setFieldValue('custrecord_wmsse_act_end_date', DateStamp());

	customrecord.setFieldValue('custrecord_wmsse_act_qty', quantity);

	customrecord.setFieldValue('custrecord_wmsse_sku', itemId);

	customrecord.setFieldValue('custrecord_wmsse_expe_qty', quantity);

	customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 19);// storage

	customrecord.setFieldValue('custrecord_wmsse_tasktype', 10); // For INVT

	customrecord.setFieldValue('custrecord_wmsse_actbeginloc', fromBinId);
	customrecord.setFieldValue('custrecord_wmsse_actendloc', fromBinId);

	if (itemType == "lotnumberedinventoryitem"
			|| itemType == "lotnumberedassemblyitem") {

		if (batchno != null && batchno != '')
			customrecord.setFieldValue('custrecord_wmsse_batch_num', batchno);

	}

	customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
	customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', itemId);
	if (inventoryAdjustId != null && inventoryAdjustId != '')
		customrecord.setFieldValue('custrecord_wmsse_nsconfirm_ref_no',
				inventoryAdjustId);

	var currentUserID = getCurrentUser();

	customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
	if (ExpDate != null && ExpDate != '')
		customrecord.setFieldValue('custrecord_wmsse_expirydate', ExpDate);

	if (uom != null && uom != '' && uom != 'null' && uom != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_uom', uom);

	if (conversionRate != null && conversionRate != ''
			&& conversionRate != 'null' && conversionRate != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_conversionrate',
				conversionRate);

	if (inventoryStatus != null && inventoryStatus != ''
			&& inventoryStatus != 'null' && inventoryStatus != 'undefined') {
		customrecord.setFieldValue('custrecord_wmsse_inventorystatus',
				inventoryStatus);
	}

	var recid = nlapiSubmitRecord(customrecord);

	customrecord = null;
	currentUserID = null;
	nlapiLogExecution('ERROR', 'Done creating opentask Record', recid);

}

/**
 * This function is used to create Inventory Transfer record.
 * 
 * @param inventoryTransferId
 * @param taskType
 * @param ItemType
 */
function nswms_PostInventoryTransfer(inventoryTransferId, taskType, ItemType,
		taskId, fromStatus, toStatus) {
	nlapiLogExecution('ERROR', 'Into InvokeInventoryTransfer',
			inventoryTransferId);
	nlapiLogExecution('ERROR', 'taskType', taskType);
	if (taskType == "XFER")
		taskType = 18;
	var filters = new Array();
	filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null,
			'anyof', taskType));
	filters
			.push(new nlobjSearchFilter('name', null, 'is', inventoryTransferId));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',
			null, 'anyof', [ '@NONE@' ]));
	if (taskId != null && taskId != '' && taskId != 'null')
		filters.push(new nlobjSearchFilter('internalid', null, 'is', taskId));

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_sku', null, 'group');
	columns[1] = new nlobjSearchColumn('formulanumeric', null, 'SUM');
	columns[1].setFormula("TO_NUMBER({custrecord_wmsse_act_qty})");

	columns[2] = new nlobjSearchColumn('custrecord_wmsse_wms_location', null,
			'group');
	columns[3] = new nlobjSearchColumn('custrecord_wmsse_act_wms_location',
			null, 'group');
	columns[4] = new nlobjSearchColumn('custrecord_wmsse_batch_num', null,
			'group');
	columns[5] = new nlobjSearchColumn('custrecord_wmsse_actbeginloc', null,
			'group');
	columns[6] = new nlobjSearchColumn('custrecord_wmsse_actendloc', null,
			'group');
	columns[7] = new nlobjSearchColumn('internalid', null, 'group');

	var opentaskSearchResults = nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask', null, filters, columns);
	if (opentaskSearchResults != null && opentaskSearchResults != '') {
		for (var k = 0; k < opentaskSearchResults.length; k++) {
			var Invtrymveloc = "";
			var InvItem = opentaskSearchResults[k].getValue(
					'custrecord_wmsse_sku', null, 'group');
			var InvQty = opentaskSearchResults[k].getValue('formulanumeric',
					null, 'SUM');

			var InvLocation = opentaskSearchResults[k].getValue(
					'custrecord_wmsse_wms_location', null, 'group');
			var InvToLocation = opentaskSearchResults[k].getValue(
					'custrecord_wmsse_act_wms_location', null, 'group');
			var InvBatch = opentaskSearchResults[k].getValue(
					'custrecord_wmsse_batch_num', null, 'group');
			var vFromBin = opentaskSearchResults[k].getValue(
					'custrecord_wmsse_actbeginloc', null, 'group');
			var vToBin = opentaskSearchResults[k].getValue(
					'custrecord_wmsse_actendloc', null, 'group');
			var vOTIntId = opentaskSearchResults[k].getValue('internalid',
					null, 'group');
			Invtrymveloc = InvokeNSInventoryTransfer(InvItem, InvLocation,
					InvToLocation, InvQty, InvBatch, null, vFromBin, vToBin,
					taskType, inventoryTransferId, fromStatus, toStatus);
			nlapiLogExecution('ERROR', 'Out of InvokeInventoryTransfer',
					Invtrymveloc);
			if (Invtrymveloc != null && Invtrymveloc != '') {
				var vOTRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',
						vOTIntId);

				vOTRec.setFieldValue('custrecord_wmsse_nsconfirm_ref_no',
						Invtrymveloc);
				nlapiSubmitRecord(vOTRec);
				vOTRec = null;
			}

		}
	}

}
/**
 * This function is used to create Inventory Transfer record.
 * 
 * @param item
 * @param loc
 * @param toloc
 * @param qty
 * @param lot
 * @param serialno
 * @param vFromBin
 * @param vToBin
 * @param taskType
 * @param inventoryTransferId
 */
function InvokeNSInventoryTransfer(item, loc, toloc, qty, lot, serialno,
		vFromBin, vToBin, taskType, inventoryTransferId, fromStatus, toStatus) {
	var vTranid = "";
	// try{
	nlapiLogExecution('ERROR', 'Into InvokeNSInventoryTransfer');
	nlapiLogExecution('ERROR', 'item', item);
	nlapiLogExecution('ERROR', 'loc', loc);
	nlapiLogExecution('ERROR', 'toloc', toloc);
	nlapiLogExecution('ERROR', 'qty', qty);
	nlapiLogExecution('ERROR', 'lot', lot);
	nlapiLogExecution('ERROR', 'vFromBin', vFromBin);
	nlapiLogExecution('ERROR', 'vToBin', vToBin);
	var subs = nlapiGetContext().getFeature('subsidiaries');
	nlapiLogExecution('Debug', 'subs', subs);

	var ItemType = '';

	var inventoryStatusFeature = isInvStatusFeatureEnabled();

	if (item != null && item != "") {
		var columns = nlapiLookupField('item', item, [ 'recordType' ]);
		ItemType = columns.recordType;
	}

	nlapiLogExecution('ERROR', 'ItemType', ItemType);

	var invttransfer = nlapiCreateRecord('inventorytransfer');

	if (subs == true) {
		var vSubsidiaryVal = getSubsidiaryNew(loc);
		nlapiLogExecution('Debug', 'vSubsidiaryVal', vSubsidiaryVal);
		if (vSubsidiaryVal != null && vSubsidiaryVal != '')
			invttransfer.setFieldValue('subsidiary', vSubsidiaryVal);
	}
	invttransfer.setFieldValue('location', loc);// from Location
	invttransfer.setFieldValue('transferlocation', toloc);
	invttransfer.selectNewLineItem('inventory');
	invttransfer.setCurrentLineItemValue('inventory', 'item', item);
	invttransfer.setCurrentLineItemValue('inventory', 'adjustqtyby', qty);
	invttransfer
			.setCurrentLineItemValue('inventory', 'unitconversionrate', '1');

	if (parseFloat(qty) < 0)
		qty = parseFloat(qty) * (-1);

	// For advanced Bin serial Lot management check
	var vAdvBinManagement = false;
	var ctx = nlapiGetContext();
	if (ctx != null && ctx != '') {
		if (ctx.getFeature('advbinseriallotmgmt') != null
				&& ctx.getFeature('advbinseriallotmgmt') != '')
			vAdvBinManagement = ctx.getFeature('advbinseriallotmgmt');
	}
	nlapiLogExecution('ERROR', 'vAdvBinManagement', vAdvBinManagement);

	if (vAdvBinManagement)// If advanced bin serial lot management check is
							// true then we are creating subrecord for
							// lot/serial
	{
		if (ItemType != "serializedinventoryitem"
				&& ItemType != "serializedassemblyitem") {
			var compSubRecord = invttransfer.createCurrentLineItemSubrecord(
					'inventory', 'inventorydetail');
			nlapiLogExecution('ERROR', 'test1', 'test1');
			compSubRecord.selectNewLineItem('inventoryassignment');
			compSubRecord.setCurrentLineItemValue('inventoryassignment',
					'quantity', qty);
			// compSubRecord.setCurrentLineItemValue('inventoryassignment',
			// 'binnumber', vSubsidiaryVal);
			if (lot != null
					&& lot != ''
					&& (ItemType == "lotnumberedinventoryitem" || ItemType == "lotnumberedassemblyitem")) {
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'receiptinventorynumber', lot);
			}
			compSubRecord.setCurrentLineItemValue('inventoryassignment',
					'binnumber', vFromBin);

			compSubRecord.setCurrentLineItemValue('inventoryassignment',
					'tobinnumber', vToBin);
			if (inventoryStatusFeature == true) {
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'inventorystatus', fromStatus);
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'toinventorystatus', toStatus);
			}

			compSubRecord.commitLineItem('inventoryassignment');
			compSubRecord.commit();
			invttransfer.commitLineItem('inventory');
			vTranid = nlapiSubmitRecord(invttransfer, true, true);
		} else if (ItemType == "serializedinventoryitem"
				|| ItemType == "serializedassemblyitem") {
			var filterssertemp1 = new Array();

			filterssertemp1.push(new nlobjSearchFilter(
					'custrecord_wmsse_ser_status', null, 'is', 'F'));

			filterssertemp1.push(new nlobjSearchFilter(
					'custrecord_wmsse_ser_tasktype', null, 'anyof', taskType));

			filterssertemp1.push(new nlobjSearchFilter('name', null, 'is',
					inventoryTransferId));
			filterssertemp1.push(new nlobjSearchFilter(
					'custrecord_wmsse_ser_item', null, 'anyof', item));
			var columnssertemp1 = new Array();
			columnssertemp1[0] = new nlobjSearchColumn(
					'custrecord_wmsse_ser_no');
			columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord(
					'customrecord_wmsse_serialentry', null, filterssertemp1,
					columnssertemp1);
			if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != "") {
				// trecord.setCurrentLineItemValue('item', 'binnumber',
				// enterBin);
				var compSubRecord = invttransfer
						.createCurrentLineItemSubrecord('inventory',
								'inventorydetail');
				for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
					compSubRecord.selectNewLineItem('inventoryassignment');
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'quantity', 1);
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'receiptinventorynumber',
							SrchRecordTmpSerial1[n]
									.getValue('custrecord_wmsse_ser_no'));
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'binnumber', vFromBin);
					compSubRecord.setCurrentLineItemValue(
							'inventoryassignment', 'tobinnumber', vToBin);
					if (inventoryStatusFeature == true) {
						compSubRecord.setCurrentLineItemValue(
								'inventoryassignment', 'inventorystatus',
								fromStatus);
						compSubRecord.setCurrentLineItemValue(
								'inventoryassignment', 'toinventorystatus',
								toStatus);
					}
					compSubRecord.commitLineItem('inventoryassignment');

				}
				compSubRecord.commit();
				invttransfer.commitLineItem('inventory');
				vTranid = nlapiSubmitRecord(invttransfer, true, true);
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord = SrchRecordTmpSerial1[j];
					nlapiLogExecution('ERROR', 'TempRecord.getId()', TempRecord
							.getId());
					nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',
							TempRecord.getValue('name'));
					var tempSerial = nlapiLoadRecord(
							'customrecord_wmsse_serialentry', TempRecord
									.getId());
					// tempSerial.setFieldValue('id', TempRecord.getId());
					// tempSerial.setFieldValue('name',
					// TempRecord.getValue('name'));
					tempSerial
							.setFieldValue(
									'custrecord_wmsse_ser_note1',
									'because of Inventory tranfer posted for serial number  we have marked this serial number as closed');
					tempSerial
							.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
				}
			}
		}
	}
	nlapiLogExecution('ERROR', 'type argument', 'type is create');
	// }
	// catch(exp) {
	// nlapiLogExecution('ERROR', 'Exception in InvokeNSInventoryTransferNew ',
	// exp);

	// }

	nlapiLogExecution('ERROR', 'Out of InvokeNSInventoryTransfer');
	return vTranid;
}

function createPacklistHtml(vOrdNo, trantype, salesorderdetails, vcontainerLp) {
	try {
		// var trantype = nlapiLookupField('transaction', vOrdNo, 'recordType');

		nlapiLogExecution('ERROR', 'trantype', trantype);

		// var salesorderdetails =nlapiLoadRecord(trantype, vOrdNo);

		var billtoaddress = salesorderdetails.getFieldValue('billaddress');

		var shipaddress = salesorderdetails.getFieldValue('shipaddress');

		var orderdate = salesorderdetails.getFieldValue('trandate');

		var ordernumber = salesorderdetails.getFieldValue('tranid');

		var customerpo = salesorderdetails.getFieldValue('otherrefnum');

		var entity = salesorderdetails.getFieldText('entity');

		var locationId = salesorderdetails.getFieldValue('location');

		var shipmethod = salesorderdetails.getFieldText('shipmethod');

		var shipDate = salesorderdetails.getFieldValue('shipdate');

		if ((customerpo == null) || (customerpo == ''))

		{

			customerpo = "";

		}

		if ((shipDate == null) || (shipDate == ''))

		{

			shipDate = "";

		}

		if ((orderdate == null) || (orderdate == ''))

		{
			orderdate = "";

		}

		shipmethod = shipmethod.replace(/\s/g, "");

		if ((shipmethod == null) || (shipmethod == ''))

		{
			shipmethod = "";

		}

		var FOB = '';

		nlapiLogExecution('ERROR', 'location ', locationId);

		var shipaddressee = "";
		var shipaddr1 = "";
		var shipaddr2 = "";
		var shipcity = "";
		var shipcountry = "";
		var shipstate = "";
		var shipzip = "";
		var shipstateandcountry = "";

		shipaddressee = salesorderdetails.getFieldValue('shipaddressee');

		shipaddr1 = salesorderdetails.getFieldValue('shipaddr1');

		shipaddr2 = salesorderdetails.getFieldValue('shipaddr2');

		shipcity = salesorderdetails.getFieldValue('shipcity');

		shipcountry = salesorderdetails.getFieldValue('shipcountry');

		shipstate = salesorderdetails.getFieldValue('shipstate');

		shipzip = salesorderdetails.getFieldValue('shipzip');

		if ((shipaddressee == null) || (shipaddressee == ''))

		{
			shipaddressee = "";

		}

		if ((shipaddr1 == null) || (shipaddr1 == ''))

		{
			shipaddr1 = "";

		}

		if ((shipaddr2 == null) || (shipaddr2 == ''))

		{
			shipaddr2 = "";

		}

		if ((shipcity == null) || (shipcity == ''))

		{
			shipcity = "";

		}

		if ((shipcountry == null) || (shipcountry == ''))

		{

			shipcountry = "";

		}

		if ((shipstate == null) || (shipstate == ''))

		{

			shipstate = "";

		}

		if ((shipzip == null) || (shipzip == ''))

		{

			shipzip = "";

		}

		shipaddr1 = shipaddr1 + ", " + shipaddr2;

		shipstateandcountry = shipcity + " " + shipstate + " " + shipzip;

		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);

		var groupopentaskfilterarray = new Array();

		groupopentaskfilterarray.push(new nlobjSearchFilter(
				'custrecord_wmsse_order_no', null, 'anyof', vOrdNo));

		if (vcontainerLp != null && vcontainerLp != '') {
			groupopentaskfilterarray.push(new nlobjSearchFilter(
					'custrecord_wmsse_container_lp_no', null, 'is',
					vcontainerLp));
		}

		groupopentaskfilterarray.push(new nlobjSearchFilter(
				'custrecord_wmsse_tasktype', null, 'anyof', [ 3 ]));

		groupopentaskfilterarray.push(new nlobjSearchFilter(
				'custrecord_wmsse_wms_status_flag', null, 'anyof', [ 28 ]));

		var groupopentaskcolumnarray = new Array();

		groupopentaskcolumnarray[0] = new nlobjSearchColumn(
				'custrecord_wmsse_sku', null, 'group');

		groupopentaskcolumnarray[1] = new nlobjSearchColumn(
				'custrecord_wmsse_line_no', null, 'group');

		groupopentaskcolumnarray[2] = new nlobjSearchColumn(
				'custrecord_wmsse_act_end_date', null, 'group');

		groupopentaskcolumnarray[3] = new nlobjSearchColumn('formulanumeric',
				null, 'sum');

		groupopentaskcolumnarray[3]
				.setFormula("TO_NUMBER({custrecord_wmsse_act_qty})");

		groupopentaskcolumnarray[4] = new nlobjSearchColumn(
				'custrecord_wmsse_parent_sku_no', null, 'group');

		groupopentaskcolumnarray[5] = new nlobjSearchColumn(
				'custrecord_wmsse_expe_qty', null, 'sum');

		groupopentaskcolumnarray[6] = new nlobjSearchColumn(
				'custrecord_wmsse_wms_location', null, 'group');
		// groupopentaskcolumnarray[7] = new nlobjSearchColumn('internalid',
		// null, 'group').setSort();

		var groupopentasksearchresults = nlapiSearchRecord(
				'customrecord_wmsse_trn_opentask', null,
				groupopentaskfilterarray, groupopentaskcolumnarray);

		var appendcontlp = "";

		var actualenddate = "";

		var strVar = "";

		var noofCartons = 0;

		if (groupopentasksearchresults != null)

		{

			nlapiLogExecution('ERROR', 'groupopentasksearchresults.length ',
					groupopentasksearchresults.length);
			nlapiLogExecution('ERROR', 'locationId ', locationId);
			if (locationId == null || locationId == '') {
				locationId = groupopentasksearchresults[0].getValue(
						'custrecord_wmsse_wms_location', null, 'group');
			}

			// to get the Location address
			var locationadress = nlapiLoadRecord('Location', locationId);

			var addr1 = "";
			var city = "";
			var state = "";
			var zip = "";
			var stateandzip = "";
			var returnadresse = "";
			if (locationId != null && locationId != '') {
				addr1 = locationadress.getFieldValue('addr1');

				city = locationadress.getFieldValue('city');

				state = locationadress.getFieldValue('state');

				zip = locationadress.getFieldValue('zip');

				returnadresse = locationadress.getFieldValue('addressee');
			}

			if ((addr1 == null) || (addr1 == ''))

			{

				addr1 = "";

			}

			if ((city == null) || (city == ''))

			{

				city = "";

			}

			if ((state == null) || (state == ''))

			{

				state = "";

			}

			if ((zip == null) || (zip == ''))

			{

				zip = "";

			}

			if ((returnadresse == null) || (returnadresse == ''))

			{

				returnadresse = "";

			}

			stateandzip = city + " " + state + " " + zip;

			var totalamount = '';

			var groupcount = groupopentasksearchresults.length;

			var grouplength = 0;

			var invoicetasklength = groupopentasksearchresults.length;

			var linenumber = 1;

			var pagecount = 1;

			var totalinvoice = 0;

			var totalcount = groupopentasksearchresults.length;

			var totalshipqty = 0;

			var totalcube = 0;

			var totalweight = 0;
			var vorderqty = "";

			var strVar = "";

			while (0 < totalcount)

			{
				var count = 0;

				var kititemcount = 0;

				strVar += "<html>";

				strVar += " <body>";

				strVar += "    <table style=\"width: 100%;\">";

				strVar += "    <tr>";

				strVar += "    <td >";

				strVar += "    <table>";

				strVar += " <td align=\"left\" style=\"width: 65%;\">";

				strVar += "        <table style=\"width: 25%;\" align=\"left\">";

				strVar += "            <tr>";

				strVar += "                <td>";

				strVar += "                    <img src=\"headerimage\" width=\"320\" height=\"65\" />";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "            <tr>";

				strVar += "                <td style=\"font-size: 12px; font-family:Arial;\">";

				strVar += "                 <b>" + domainName + "</b>";

				strVar += "<br \/>" + returnadresse + " <br \/>" + addr1
						+ " <br \/>" + stateandzip + "";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "        </table>";

				strVar += "        </td>";

				strVar += " <td></td>";

				strVar += "    <td></td>";

				strVar += "<td style=\"width: 35%; font-family:Arial;\" valign=\"top\">";

				strVar += "        <b>";

				strVar += "            <h2 align=\"right\">";

				strVar += "                Packing Slip</h2>";

				strVar += "        </b>";

				strVar += "        <table style=\"width: 150px;\" frame=\"box\" rules=\"all\" align=\"right\" border=\"0\" cellpadding=\"0.5\"";

				strVar += "            cellspacing=\"0\">";

				strVar += "            <tr>";

				strVar += "                <td style=\"font-size: 14px; text-align: center; border-top: 1px solid black; border-right: 1px solid black;";

				strVar += "                    border-left: 1px solid black; border-bottom: 1px solid black;\">";

				strVar += "                    Order Date";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "            <tr>";

				strVar += "                <td style=\"font-size: 12px; text-align: center; border-right: 1px solid black; border-left: 1px solid black;";

				strVar += "                    border-bottom: 1px solid black; height: 18px\">";

				strVar += "                                                                          "
						+ orderdate + "";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "        </table>";

				strVar += "        </td>";

				strVar += "</table>";

				strVar += "    </td>";

				strVar += "   </tr>";

				strVar += "   <tr>";

				strVar += "<td align=\"left\" style=\"width: 100%;\">";

				strVar += "        <table style=\"width: 100%\">";

				strVar += "            <tr>";

				strVar += "                <td>";

				strVar += "                    <table style=\"width: 55%;\" rules=\"all\" align=\"left\" border=\"0\" frame=\"box\">";

				strVar += "                        <tr>";

				strVar += "                            <td style=\"font-size: 15px; text-align: left; border-top: 1px solid black; border-right: 1px solid black;";

				strVar += "                                border-left: 1px solid black; border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                               &nbsp Ship To";

				strVar += "                            </td>";

				strVar += "                        </tr>";

				strVar += "                        <tr>";

				strVar += "                            <td style=\"font-size: 14px; text-align: left; border-right: 1px solid black; border-left: 1px solid black;";

				strVar += "                                border-bottom: 1px solid black; height: 80px;\" valign=\"top\">";

				strVar += "                                <table>";

				strVar += "                                    <tr>";

				strVar += "                                        <td style=\"font-size: 12px;\">";

				strVar += "                                                                                                                                                                          "
						+ shipaddressee + "";

				strVar += "                                        </td>";

				strVar += "                                    </tr>";

				strVar += "                                    <tr>";

				strVar += "                                        <td style=\"font-size: 12px;\">";

				strVar += "                                                                                                                                                                          "
						+ shipaddr1 + "";

				strVar += "                                        </td>";

				strVar += "                                    </tr>";

				strVar += "                                    <tr>";

				strVar += "                                        <td style=\"font-size: 12px;\">";

				strVar += "                                                                                                                                                                          "
						+ shipstateandcountry + "";

				strVar += "                                        </td>";

				strVar += "                                    </tr>";

				strVar += "                                </table>";

				strVar += "                            </td>";

				strVar += "                        </tr>";

				strVar += "                    </table>";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "            <br />";

				strVar += "            <tr>";

				strVar += "                <td>";

				strVar += "                    <table style=\"width: 100%;\" rules=\"all\" border=\"0\" frame=\"box\" cellpadding=\"0.5\"";

				strVar += "                        cellspacing=\"0\">";

				strVar += "                        <tr>";

				strVar += "                            <td style=\"font-size: 15px; text-align: left; border-top: 1px solid black; border-right: 1px solid black;";

				strVar += "                                border-left: 1px solid black; border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                                &nbsp Ship Date";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 15px; text-align: left; border-top: 1px solid black; border-right: 1px solid black;";

				strVar += "                                border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                                 &nbsp Ship Via";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 15px; text-align: left; border-top: 1px solid black; border-right: 1px solid black;";

				strVar += "                                border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                               &nbsp PO #";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 15px; text-align: left; border-top: 1px solid black; border-right: 1px solid black;";

				strVar += "                                border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                               &nbsp Order # / Container #";

				strVar += "                            </td>";

				strVar += "                        </tr>";

				strVar += "                        <tr>";

				strVar += "                            <td style=\"font-size: 14px; text-align: left; border-right: 1px solid black; border-left: 1px solid black;";

				strVar += "                                border-bottom: 1px solid black; height: 22px;\">";

				strVar += "                                                                                                                          &nbsp"
						+ shipDate + "";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 14px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black;";

				strVar += "                                height: 22px;\">";

				strVar += "                                                                                                                          &nbsp"
						+ shipmethod + "";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 14px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black;";

				strVar += "                                height: 22px;\">";

				strVar += "                                                                                                                          &nbsp"
						+ customerpo + "";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 14px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black;";

				strVar += "                                height: 22px;\">";

				strVar += "                                                                                                                          &nbsp"
						+ ordernumber + " /" + vcontainerLp + "";

				strVar += "                            </td>";

				strVar += "                        </tr>";

				strVar += "                    </table>";

				strVar += "                    <table style=\"width: 100%;\" rules=\"all\" border=\"0\" frame=\"box\" cellpadding=\"0.5\"";

				strVar += "                        cellspacing=\"0\">";

				strVar += "                        <tr>";

				strVar += "                            <td style=\"font-size: 15px; text-align: left; border-right: 1px solid black; border-left: 1px solid black;";

				strVar += "                                border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                               &nbsp Shipping Notes";

				strVar += "                            </td>";

				strVar += "                        </tr>";

				strVar += "                        <tr>";

				strVar += "                            <td style=\"font-size: 14px; text-align: left; border-right: 1px solid black; border-left: 1px solid black;";

				strVar += "                                border-bottom: 1px solid black; height: 22px;\">";

				strVar += "                            </td>";

				strVar += "                        </tr>";

				strVar += "                    </table>";

				strVar += "                    <table style=\"width: 100%;\" rules=\"all\" border=\"0\" frame=\"box\" cellpadding=\"0.5\"";

				strVar += "                        cellspacing=\"0\">";

				strVar += "                        <tr>";

				strVar += "                            <td style=\"font-size: 15px; text-align: center; border-right: 1px solid black; border-left: 1px solid black;";

				strVar += "                                border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                                Item #";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 15px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                               &nbsp Description";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 15px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                                Ordered";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 15px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                                Units";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 15px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                                Back Order";

				strVar += "                            </td>";

				strVar += "                            <td style=\"font-size: 15px; text-align: center; border-right: 1px solid black; border-bottom: 1px solid black; height:24px; font-family:Arial;\">";

				strVar += "                                Shipped";

				strVar += "                            </td>";

				strVar += "                        </tr>";

				// loop starts

				var repeatpartentsku;

				for (var g = grouplength; g < groupopentasksearchresults.length; g++)

				{

					count++;

					grouplength++;

					var itemText = groupopentasksearchresults[g].getText(
							'custrecord_wmsse_sku', null, 'group');

					var ItemId = groupopentasksearchresults[g].getValue(
							'custrecord_wmsse_sku', null, 'group');

					var lineno = groupopentasksearchresults[g].getValue(
							'custrecord_wmsse_line_no', null, 'group');

					var totalactqty = groupopentasksearchresults[g].getValue(
							'formulanumeric', null, 'sum');

					nlapiLogExecution('ERROR', 'totalactqty ', totalactqty);

					var totalqty = groupopentasksearchresults[g].getValue(
							'custrecord_wmsse_expe_qty', null, 'sum');

					nlapiLogExecution('ERROR', 'totalqty ', totalqty);

					var unitvalue = '';

					var backordervalue, decscription, suggestedprice;

					var parentskuitemid = groupopentasksearchresults[g]
							.getValue('custrecord_wmsse_parent_sku_no', null,
									'group');

					var parentsku = groupopentasksearchresults[g].getText(
							'custrecord_wmsse_parent_sku_no', null, 'group');

					nlapiLogExecution('ERROR', 'groupopentasklineno ', lineno);

					if ((parentskuitemid == null) || (parentskuitemid == ''))

					{

						parentskuitemid = ItemId;

					}

					var parentitemSubtype = nlapiLookupField('item',
							parentskuitemid, [ 'recordType' ]);

					var parentitemtype = parentitemSubtype.recordType;

					var itemsubtype = nlapiLookupField('item', ItemId,
							[ 'recordType' ]);

					var itemtype = itemsubtype.recordType;

					nlapiLogExecution('ERROR', 'itemtype ', itemtype);

					if (parentitemtype != "kititem")

					{

						if (trantype != 'transferorder')

						{

							/*
							 * Code commented on OCT23 by Siva Krishna.Vanama
							 * 
							 * //unitvalue=salesorderdetails.getLineItemValue('item','rate',lineno);
							 * 
							 * //suggestedprice=salesorderdetails.getLineItemValue('item','price_display',lineno);
							 * 
							 * backordervalue=salesorderdetails.getLineItemValue('item','quantitybackordered',lineno);
							 * 
							 * decscription=salesorderdetails.getLineItemValue('item','description',lineno);
							 * 
							 */

							var lineitemcount = salesorderdetails
									.getLineItemCount('item');

							for (var p = 1; p <= lineitemcount; p++)

							{

								var iteminternalid = salesorderdetails
										.getLineItemValue('item', 'item', p);
								var itemlineno = salesorderdetails
										.getLineItemValue('item', 'line', p);
								nlapiLogExecution('ERROR',
										'itemlineno,lineno ', itemlineno + ','
												+ lineno);

								if (iteminternalid == ItemId
										&& lineno == itemlineno)

								{
									// unitvalue=salesorderdetails.getLineItemValue('item','rate',p);

									// suggestedprice=salesorderdetails.getLineItemValue('item','price_display',p);

									vorderqty = salesorderdetails
											.getLineItemValue('item',
													'quantity', p);

									unitvalue = salesorderdetails
											.getLineItemText('item', 'units', p);

									backordervalue = salesorderdetails
											.getLineItemValue('item',
													'quantitybackordered', p);

									decscription = salesorderdetails
											.getLineItemValue('item',
													'description', p);

									break;

								}

							}

						}

						else

						{

							var lineitemcount = salesorderdetails
									.getLineItemCount('item');

							for (var p = 1; p <= lineitemcount; p++)

							{

								var iteminternalid = salesorderdetails
										.getLineItemValue('item', 'item', p)
								var itemlineno = salesorderdetails
										.getLineItemValue('item', 'line', p);
								if (iteminternalid == ItemId
										&& lineno == itemlineno)

								{

									// unitvalue=salesorderdetails.getLineItemValue('item','rate',p);

									// suggestedprice=salesorderdetails.getLineItemValue('item','price_display',p);
									vorderqty = salesorderdetails
											.getLineItemValue('item',
													'quantity', p);
									backordervalue = salesorderdetails
											.getLineItemValue('item',
													'quantitybackordered', p);

									unitvalue = salesorderdetails
											.getLineItemText('item', 'units', p);
									decscription = salesorderdetails
											.getLineItemValue('item',
													'description', p);

									break;

								}

							}

						}

					}

					else {
						if (trantype != 'transferorder')

						{

							/*
							 * Code commented on OCT23 by Siva Krishna.Vanama
							 * 
							 * //unitvalue=salesorderdetails.getLineItemValue('item','rate',lineno);
							 * 
							 * //suggestedprice=salesorderdetails.getLineItemValue('item','price_display',lineno);
							 * 
							 * backordervalue=salesorderdetails.getLineItemValue('item','quantitybackordered',lineno);
							 * 
							 * decscription=salesorderdetails.getLineItemValue('item','description',lineno);
							 * 
							 */

							var lineitemcount = salesorderdetails
									.getLineItemCount('item');
							nlapiLogExecution('ERROR', 'lineitemcount ',
									lineitemcount);
							for (var p = 1; p <= lineitemcount; p++) {
								var iteminternalid = salesorderdetails
										.getLineItemValue('item', 'item', p);
								var itemlineno = salesorderdetails
										.getLineItemValue('item', 'line', p);
								nlapiLogExecution('ERROR',
										'itemlineno,lineno ', itemlineno + ','
												+ lineno);
								nlapiLogExecution('ERROR',
										'iteminternalid,parentskuitemid ',
										iteminternalid + ',' + ItemId);

								if (iteminternalid == parentskuitemid
										&& lineno == itemlineno) {
									// unitvalue=salesorderdetails.getLineItemValue('item','rate',p);

									// suggestedprice=salesorderdetails.getLineItemValue('item','price_display',p);

									vorderqty = salesorderdetails
											.getLineItemValue('item',
													'quantity', p);

									unitvalue = salesorderdetails
											.getLineItemText('item', 'units', p);

									backordervalue = salesorderdetails
											.getLineItemValue('item',
													'quantitybackordered', p);

									decscription = salesorderdetails
											.getLineItemValue('item',
													'description', p);

									break;
								}
							}

						} else {
							var lineitemcount = salesorderdetails
									.getLineItemCount('item');

							for (var p = 1; p <= lineitemcount; p++) {
								var iteminternalid = salesorderdetails
										.getLineItemValue('item', 'item', p)
								var itemlineno = salesorderdetails
										.getLineItemValue('item', 'line', p);
								if (iteminternalid == ItemId
										&& lineno == itemlineno) {
									// unitvalue=salesorderdetails.getLineItemValue('item','rate',p);

									// suggestedprice=salesorderdetails.getLineItemValue('item','price_display',p);
									vorderqty = salesorderdetails
											.getLineItemValue('item',
													'quantity', p);
									backordervalue = salesorderdetails
											.getLineItemValue('item',
													'quantitybackordered', p);

									unitvalue = salesorderdetails
											.getLineItemText('item', 'units', p);
									decscription = salesorderdetails
											.getLineItemValue('item',
													'description', p);
									break;
								}
							}

						}

						nlapiLogExecution('ERROR', 'vorderqty ', vorderqty);

						/*
						 * backordervalue="0";
						 * 
						 * var itemdescription = nlapiLookupField('item',
						 * ItemId, ['displayname']);
						 * 
						 * decscription=itemdescription.displayname;
						 */

					}
					// case 201412009
					if ((decscription == null) || (decscription == ''))

					{

						decscription = "";

					}
					if ((backordervalue == null) || (backordervalue == ''))

					{

						backordervalue = "";

					}
					// case # 201417313

					if ((vorderqty == null) || (vorderqty == ''))

					{

						vorderqty = "";

					}

					// end of case # 201417313
					if (parentitemtype == "kititem")

					{

						if (parentsku != repeatpartentsku)

						{

							var parentskudesc = nlapiLookupField('item',
									parentskuitemid, [ 'displayname' ]);

							var parentdescription = parentskudesc.displayname;

							kititemcount++;

							strVar += "<tr>";

							strVar += "<td style=\"font-size: 14px;font-family:Times New Roman; text-align: center; border-right: 1px solid black; border-left: 1px solid black;";

							strVar += " border-bottom: none; height:22px;\">";

							strVar += "                                                                                                                          "
									+ parentsku + "";

							strVar += "</td>";

							strVar += "                            <td style=\"font-size: 12px; text-align: left; border-right: 1px solid black; border-bottom: none; height:22px;\">";

							strVar += "" + parentdescription + "";

							strVar += "                            </td>";

							strVar += "                            <td style=\"font-size: 12px; text-align: center; border-right: 1px solid black; border-bottom: none; height:22px;\">";

							strVar += "                                           &nbsp";

							strVar += "                            </td>";

							strVar += "                            <td style=\"font-size: 12px; text-align: center; border-right: 1px solid black; border-bottom: none; height:22px;\">";

							strVar += "                                           &nbsp ";

							strVar += "                            </td>";

							strVar += "                            <td style=\"font-size: 12px; text-align: center; border-right: 1px solid black; border-bottom: none; height:22px;\">";

							strVar += " &nbsp";

							strVar += "                            </td>";

							strVar += "                            <td style=\"font-size: 12px; text-align: center; border-right: 1px solid black; border-bottom: none; height:22px;\">";

							strVar += "   &nbsp";

							strVar += "                            </td>";

							strVar += "                        </tr>";

						}

					}

					if (itemtype != "kititem")

					{

						strVar += "                        <tr>";

						if (parentskuitemid == ItemId)

						{

							strVar += "                            <td style=\"font-size: 14px; text-align: left; border-right: 1px solid black; border-left: 1px solid black;";

							strVar += "                                border-bottom: none; height:22px;\">";

							strVar += "                                                                                                                         &nbsp"
									+ itemText + "";

							strVar += "                            </td>";

						}

						else

						{

							strVar += "                            <td style=\"font-size: 14px; text-align: left; border-right: 1px solid black; border-left: 1px solid black;";

							strVar += "                                border-bottom: none; height:22px;\">";

							strVar += "                                                                                                          &nbsp"
									+ itemText + "";

							strVar += "                            </td>";

						}

						if (parentskuitemid == ItemId)

						{

							strVar += "                            <td style=\"font-size: 12px; text-align: left; border-right: 1px solid black; border-bottom: none; height:22px;\">";

							strVar += "&nbsp" + decscription + "";

							strVar += "                            </td>";

						}

						else

						{

							strVar += "                            <td style=\"font-size: 12px; text-align: left; border-right: 1px solid black; border-bottom: none; height:22px;\">";

							strVar += "&nbsp" + decscription + "";

							strVar += "                            </td>";

						}

						// case:201417430
						strVar += "                            <td style=\"font-size: 12px; text-align: right; border-right: 1px solid black; border-bottom: none; height:22px;\">";

						strVar += "                                            "
								+ vorderqty + " &nbsp";

						strVar += "                            </td>";
						// case:201417430
						strVar += "                            <td style=\"font-size: 12px; text-align: left; border-right: 1px solid black; border-bottom: none; height:22px;\">";

						strVar += "    &nbsp                 " + unitvalue
								+ " &nbsp";

						strVar += "                            </td>";

						strVar += "                            <td style=\"font-size: 12px; text-align: right; border-right: 1px solid black; border-bottom: none; height:22px;\">";

						strVar += " &nbsp" + backordervalue + " &nbsp";

						strVar += "                            </td>";

						strVar += "                            <td style=\"font-size: 12px; text-align: right; border-right: 1px solid black; border-bottom: none; height:22px;\">";

						strVar += "                                            "
								+ totalactqty + " &nbsp";

						strVar += "                            </td>";

						strVar += "                        </tr>";
					}

					var pagebreakcount = parseInt(count)
							+ parseInt(kititemcount);

					if (pagebreakcount == 10)

					{

						break;

					}

					// Loop Ends

					repeatpartentsku = parentsku;

				}

				// start of for Not Having lines

				var Height = '';

				if (pagecount == 1)

				{

					Height = '230px';

				}

				if (pagecount > 1)

				{

					Height = '420px';

				}

				var recordCount = pagebreakcount;

				Height = parseInt(Height) - parseInt((recordCount * 20));

				nlapiLogExecution('ERROR', 'height ', Height);

				strVar += "                                    <tr>";

				strVar += "                                        <td style=\"font-size: 12px; text-align: left; border-right: 1px solid black; border-left: 1px solid black;";

				strVar += "                                            border-bottom: 1px solid black; height: "
						+ Height + ";\">";

				strVar += "                                        </td>";

				strVar += "                                        <td style=\"font-size: 12px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black;";

				strVar += "                                            height: 4px;\">";

				strVar += "                                        </td>";

				strVar += "                                        <td style=\"font-size: 12px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black;";

				strVar += "                                            height: 4px;\">";

				strVar += "                                        </td>";

				strVar += "                                        <td style=\"font-size: 12px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black;";

				strVar += "                                            height: 4px;\">";

				strVar += "                                        </td>";

				strVar += "                                        <td style=\"font-size: 12px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black;";

				strVar += "                                            height: 4px;\">";

				strVar += "                                        </td>";

				strVar += "                                        <td style=\"font-size: 12px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black;";

				strVar += "                                            height: 4px;\">";

				strVar += "                                        </td>";

				strVar += "                                    </tr>";

				// End of for Not Having lines

				strVar += "  </table>";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "        </table>";

				strVar += " </td>";

				strVar += "    </tr>";

				strVar += " <tr>";

				strVar += "    <td>";

				strVar += "    <br \/>";

				strVar += "    ----------------------------------------------------------------------------------------------------------------------------";

				strVar += "    <br \/>";

				strVar += "    <br \/>    ";

				strVar += "    </td>";

				strVar += "    </tr>";

				// strVar += " <tr>";

				// strVar += " <td style=\"width: 55%;\"align=\"right\">";

				// strVar += " <b>Customer Return From <\/b>";

				// strVar += " </td>";

				// strVar += " </tr>";

				strVar += "  <tr>";

				strVar += "   <td>";

				strVar += "        <table style=\"width: 45%;\" align=\"left\">";

				strVar += "<tr>";

				strVar += "            <td style=\"font-size: 15px;\">";

				strVar += "               <br \/>";

				strVar += "            </td>";

				strVar += "        </tr>";

				strVar += " <tr>";

				strVar += "            <td style=\"font-size: 13px; font-family:Arial;\">";

				strVar += "                <b>Ship Returns To<\/b>";

				strVar += "            </td>";

				strVar += "        </tr>";

				strVar += "            <tr>";

				strVar += "                <td style=\"font-size: 12px; \">";

				strVar += "" + returnadresse + " <br /> " + addr1 + " <br /> "
						+ stateandzip + " ";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "        </table>";

				strVar += "        <table style=\"width: 55%;\" align=\"right\">";

				strVar += "            <tr>";

				strVar += "                <td style=\"font-size: 13px; font-family:Arial;\"><b>Customer Return From </b>";

				strVar += "                </td>";

				strVar += "                <td >";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "            <tr>";

				strVar += "                <td style=\"font-size: 13px; font-family:Arial;\">";

				strVar += "                    <b>Customer </b>";

				strVar += "                </td>";

				strVar += "                <td style=\"font-size: 12px;\">";

				strVar += "                                                                                                                                                                          "
						+ shipaddressee + "";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "            <tr>";

				strVar += "                <td style=\"font-size: 13px; font-family:Arial;\">";

				strVar += "                    <b>Order  </b>";

				strVar += "                </td>";

				strVar += "                <td style=\"font-size: 12px;\">";

				strVar += "" + ordernumber + "";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "            <tr>";

				strVar += "                <td style=\"font-size: 13px; font-family:Arial;\">";

				strVar += "                    <b>R.A. # </b>";

				strVar += "                </td>";

				strVar += "                <td>";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "        </table>";

				strVar += "        <br />";

				strVar += "        <br />";

				strVar += "        <br />";

				strVar += "        <br />";

				strVar += " </td>";

				strVar += "     </tr>";

				strVar += " <tr>";

				strVar += "     <td>";

				strVar += "        <table style=\"width: 100%;\" frame=\"box\" rules=\"all\" align=\"right\" border=\"0\" cellpadding=\"0.5\"";

				strVar += "            cellspacing=\"0\">";

				strVar += "            <tr style=\"background-color: Gray;\">";

				strVar += "                <td style=\"font-size: 15px; text-align: left; color: white; border-top: 1px solid black;";

				strVar += "                    border-right: 1px solid black; border-left: 1px solid black; border-bottom: 1px solid black; font-family:Arial;\">";

				strVar += "                    &nbsp Item";

				strVar += "                </td>";

				strVar += "                <td style=\"font-size: 15px; text-align: left; color: white; border-top: 1px solid black;";

				strVar += "                    border-right: 1px solid black; border-bottom: 1px solid black; font-family:Arial;\">";

				strVar += "                    &nbsp Quantity";

				strVar += "                </td>";

				strVar += "                <td style=\"font-size: 15px; text-align: left; color: white; border-top: 1px solid black;";

				strVar += "                    border-right: 1px solid black; border-bottom: 1px solid black; font-family:Arial;\">";

				strVar += "                   &nbsp Reason For Returning";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "            <tr>";

				strVar += "                <td style=\"font-size: 16px; text-align: left; border-right: 1px solid black; border-left: 1px solid black;";

				strVar += "                    border-bottom: 1px solid black;\" height=\"55px\">";

				strVar += "                </td>";

				strVar += "                <td style=\"font-size: 16px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black;\"";

				strVar += "                    height=\"55px\">";

				strVar += "                </td>";

				strVar += "                <td style=\"font-size: 16px; text-align: left; border-right: 1px solid black; border-bottom: 1px solid black;\"";

				strVar += "                    valign=\"Top\">";

				strVar += "                </td>";

				strVar += "            </tr>";

				strVar += "        </table>";

				strVar += "</td>";

				strVar += "    </tr>";

				strVar += "        </table>";

				if (grouplength == groupopentasksearchresults.length)

				{

					strVar += "<p style=\" page-break-after:avoid\"></p>";

				}

				else

				{

					strVar += "<p style=\" page-break-after:always\"></p>";

				}

				strVar += " </body>";

				strVar += "        </html>";

				nlapiLogExecution('ERROR', 'totalcount', totalcount);

				totalcount = parseInt(totalcount) - parseInt(count);

				nlapiLogExecution('ERROR', 'totalcountafter', totalcount);

			}

			var tasktype = '14';

			var labeltype = 'PackList';

			var print = 'F';

			var reprint = 'F';

			var company = '';

			var location = '';

			var formattype = 'html';

			var labelrecord = nlapiCreateRecord('customrecord_wmsse_labelprinting');

			labelrecord.setFieldValue('name', vOrdNo);

			labelrecord.setFieldValue('custrecord_wmsse_label_data', strVar);

			labelrecord.setFieldValue('custrecord_wmsse_label_refno',
					ordernumber);

			labelrecord.setFieldValue('custrecord_wmsse_label_task_type',
					tasktype);// chkn task

			labelrecord.setFieldValue('custrecord_wmsse_label_type', labeltype);

			labelrecord
					.setFieldValue('custrecord_wmsse_label_lp', vcontainerLp);

			labelrecord.setFieldValue('custrecord_wmse_label_print', print);

			labelrecord
					.setFieldValue('custrecord_wmsse_label_reprint', reprint);

			// labelrecord.setFieldValue('custrecord_wmsse_label_company',
			// company);

			// labelrecord.setFieldValue('custrecord_wmsse_label_printername',printername);

			nlapiLogExecution('ERROR', 'htmlstring ', strVar);

			var tranid = nlapiSubmitRecord(labelrecord);

			nlapiLogExecution('ERROR', 'tranid ', tranid);

		}
	} catch (exp) {
		nlapiLogExecution('ERROR', 'Exception in CreatePacklistHtml ', exp);

	}

}

function TimeStampNew() {
	var timestamp;
	var now = convertDate();
	var a_p = "";

	// Getting time in hh:mm tt format.
	var curr_hour = now.getHours();
	var curr_min = now.getMinutes();
	var curr_sec = now.getSeconds();

	// determining the am/pm indicator
	if (curr_hour < 12)
		a_p = "am";
	else
		a_p = "pm";

	// finalizing hours depending on 24hr clock
	if (curr_hour == 0)
		curr_hour = 12;
	else if (curr_hour > 12)
		curr_hour -= 12;

	if (curr_min.toString().length == 1)
		curr_min = "0" + curr_min;

	if (curr_sec.toString().length == 1)
		curr_sec = "0" + curr_sec;

	// Adding fields to update time zones.
	var vTimeFormat = TimeSetting();
	nlapiLogExecution('Debug', 'vTimeFormat: ', vTimeFormat);
	if (vTimeFormat == 'fmHH:fmMI am') {
		timestamp = curr_hour + ":" + curr_min + ":" + curr_sec + " " + a_p;
	} else if (vTimeFormat == 'fmHH-fmMI am') {
		timestamp = curr_hour + "-" + curr_min + "-" + curr_sec + " " + a_p;
	} else if (vTimeFormat == 'fmHH24:fmMI') {
		curr_hour = parseInt(curr_hour) + 12;
		if (parseInt(curr_hour) == 24)
			curr_hour = 0;
		timestamp = curr_hour + ":" + curr_min + ":" + curr_sec;
	} else {
		curr_hour = parseInt(curr_hour) + 12;
		if (parseInt(curr_hour) == 24)
			curr_hour = 0;
		timestamp = curr_hour + "-" + curr_min + "-" + curr_sec;
	}

	return timestamp;
}

function getConvertedTimeStamp() {
	var timestamp;
	// var now = new Date();
	var now = convertDate();
	var a_p = "";

	// Getting time in hh:mm tt format.
	var curr_hour = now.getHours();
	var curr_min = now.getMinutes();
	var curr_sec = now.getSeconds();

	// determining the am/pm indicator
	if (curr_hour < 12)
		a_p = "am";
	else
		a_p = "pm";

	// finalizing hours depending on 24hr clock
	if (curr_hour == 0)
		curr_hour = 12;
	else if (curr_hour > 12)
		curr_hour -= 12;

	if (curr_min.toString().length == 1)
		curr_min = "0" + curr_min;

	if (curr_sec.toString().length == 1)
		curr_sec = "0" + curr_sec;
	// Adding fields to update time zones.
	var vTimeFormat = TimeSetting();
	nlapiLogExecution('Debug', 'vTimeFormat: ', vTimeFormat);
	if (vTimeFormat == 'fmHH:fmMI am') {
		timestamp = curr_hour + ":" + curr_min + ":" + curr_sec + " " + a_p;
	} else if (vTimeFormat == 'fmHH-fmMI am') {
		timestamp = curr_hour + "-" + curr_min + "-" + curr_sec + " " + a_p;
	} else if (vTimeFormat == 'fmHH24:fmMI') {
		curr_hour = parseInt(curr_hour) + 12;
		if (parseInt(curr_hour) == 24)
			curr_hour = 0;
		timestamp = curr_hour + ":" + curr_min + ":" + curr_sec;
	} else {
		curr_hour = parseInt(curr_hour) + 12;
		if (parseInt(curr_hour) == 24)
			curr_hour = 0;
		timestamp = curr_hour + "-" + curr_min + "-" + curr_sec;
	}

	return timestamp;
}

/**
 * To get subsidiaries of location
 */
function getSubsidiaryNew(location) {
	if (location != null && location != '') {
		var vSubsidiary;
		var locRec = nlapiLoadRecord('location', location);
		if (locRec != null && locRec != '')
			vSubsidiary = locRec.getFieldValue('subsidiary');
		if (vSubsidiary != null && vSubsidiary != '')
			return vSubsidiary;
		else
			return null;
	} else
		return null;

}
function isInventoryNumberExists(item, serial, location) {
	var boolfound = false;
	var str = 'item :' + item;
	str = str + 'serial :' + serial;
	str = str + 'location :' + location;
	nlapiLogExecution('ERROR', 'str ', str);
	var filter = new Array();
	var cols = new Array();
	/*
	 * cols[0]=new nlobjSearchColumn('inventorynumber'); cols[1]=new
	 * nlobjSearchColumn('item'); cols[2]=new nlobjSearchColumn('location');
	 */
	filter.push(new nlobjSearchFilter('item', null, 'anyof', item));
	// location filter commented because system is not accepting serial# which
	// is available in other warehouse location for same item
	/*
	 * if(location != null && location != '') filter.push(new
	 * nlobjSearchFilter('location',null, 'anyof', location));
	 */
	filter.push(new nlobjSearchFilter('inventorynumber', null, 'is', serial));
	// Case # 201412868 start
	// filter.push(new nlobjSearchFilter('quantityonhand',null, 'greaterthan',
	// 0));
	// Case # 201412868 end
	var objDetails = new nlapiSearchRecord('inventorynumber',
			'customsearch_wmsse_assembly_lotscan_srh', filter, cols);

	if (objDetails != null && objDetails != '' && objDetails.length > 0) {

		boolfound = true;
	}

	return boolfound;
}

function getLoadFile(fileName) {
	var nlobjContext = nlapiGetContext();
	var vBundleId = nlobjContext.getBundleId();
	var txtFilePath = "";
	// nlapiLogExecution('ERROR', 'vBundleId', vBundleId);
	if (vBundleId != null && vBundleId != '')
		txtFilePath = 'SuiteBundles/Bundle ' + vBundleId + '/' + 'src/Images/'
				+ fileName;

	var objFile = null;
	try {
		objFile = nlapiLoadFile(txtFilePath);
	} catch (e) {
		nlapiLogExecution('ERROR', 'Exception in file load', e);
		txtFilePath = "Images/" + fileName;
		objFile = nlapiLoadFile(txtFilePath);
		nlapiLogExecution('ERROR', 'Exception in file load', objFile);
	}
	return objFile;
}

function getLoadFileforIntegration(fileName) {
	var nlobjContext = nlapiGetContext();
	var vBundleId = nlobjContext.getBundleId();
	var txtFilePath = "";
	nlapiLogExecution('ERROR', 'vBundleId', vBundleId);
	if (vBundleId != null && vBundleId != '')
		txtFilePath = 'SuiteBundles/Bundle ' + vBundleId + '/'
				+ 'src/Integration/' + fileName;

	var objFile = null;
	try {
		objFile = nlapiLoadFile(txtFilePath);
	} catch (e) {
		nlapiLogExecution('ERROR', 'Exception in file load', e);
		txtFilePath = "Images/" + fileName;
		objFile = nlapiLoadFile(txtFilePath);
		nlapiLogExecution('ERROR', 'Exception in file load', objFile);
	}
	return objFile;
}
function getDefaultPickStatus() {
	var nlobjContext = nlapiGetContext();
	var strDefPickStatus = nlobjContext.getPreference('NAMING_PICKED');
	if (strDefPickStatus == null || strDefPickStatus == '')
		strDefPickStatus = 'Picked';
	return strDefPickStatus;
}

function getStockCoversionRate(vUnitTypeId, vUnits, cToConersionRate) {

	var vRetConversionRate = 1;
	if (vUnitTypeId != null && vUnitTypeId != '' && vUnitTypeId != 'null'
			&& vUnitTypeId != undefined && vUnitTypeId != 'undefined') {
		var uomfilters = new Array();
		uomfilters.push(new nlobjSearchFilter("internalid", null, "anyof",
				vUnitTypeId));
		if (vUnits != null && vUnits != '' && vUnits != 'null'
				&& vUnits != undefined)
			uomfilters.push(new nlobjSearchFilter("unitname", null, "is",
					vUnits));
		var uomcolumns = new Array();
		uomcolumns.push(new nlobjSearchColumn("conversionrate"));
		var uomresults = nlapiSearchRecord('unitstype', null, uomfilters,
				uomcolumns);
		// var vRetConversionRate=1;
		if (uomresults != null && uomresults != '') {
			var vFromRate = uomresults[0].getValue('conversionrate');
			if (vFromRate == null || vFromRate == '')
				vFromRate = 1;

			vRetConversionRate = parseFloat(vFromRate)
					/ parseFloat(cToConersionRate);

		}
	}
	return vRetConversionRate;
}

function convertDate(DS) {// DS(true/false) pass true for daylight saving.
	if (DS == null || DS == '')
		DS = false;

	var date = new Date(); // get current date

	var loadConfig = nlapiLoadConfiguration('userpreferences');
	var getTimeZone = loadConfig.getFieldText('TIMEZONE');
	// getTimeZone ='(GMT-00:30) Newfoundland';
	// nlapiLogExecution('ERROR', 'Time Zone', getTimeZone);

	var getOffset = '';
	var vgetOffsetDecimals = '';
	var vTempOffsetDecimals = '';
	// getTimeZone != '(GMT) Casablanca' || getTimeZone != '(GMT) Monrovia,
	// Reykjavik' ||
	if (getTimeZone != '(GMT) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London'
			&& getTimeZone != '(GMT) Casablanca'
			&& getTimeZone != '(GMT) Monrovia, Reykjavik') {

		getOffset = getTimeZone.substring(4, 7);
		var vgetSign = getTimeZone.substring(4, 5);
		vTempOffsetDecimals = getTimeZone.substring(4, 10);
		if (vTempOffsetDecimals.indexOf(':00') == -1) {
			vTempOffsetDecimals = getTimeZone.substring(8, 10);
			vTempOffsetDecimals = vTempOffsetDecimals / 60;
			if (vgetSign == '-') {
				var vTempgetOffset = parseInt(getOffset)
						- parseFloat(vTempOffsetDecimals);
				getOffset = vTempgetOffset;
			} else {
				var vTempgetOffset = parseInt(getOffset)
						+ parseFloat(vTempOffsetDecimals);
				getOffset = vgetSign + vTempgetOffset;
			}
		} else
			vTempOffsetDecimals = "";

	} else {

		getOffset = 1; // under 3 timezones above are equal to UTC which is
						// zero difference in hours

	}

	// nlapiLogExecution('ERROR', 'Offset', getOffset);

	var UTCDate = date.getTime() + (date.getTimezoneOffset() * 60000); // convert
																		// current
																		// date
																		// into
																		// UTC
																		// (Coordinated
																		// Universal
																		// Time)

	// nlapiLogExecution('ERROR', 'UTC Date', UTCDate);

	timezoneDate = new Date(UTCDate + (3600000 * getOffset)); // create new
																// date object
																// with,
																// subtract if
																// customer
																// timezone is
																// behind UTC
																// and add if
																// ahead

	// --Note: There should be a flag if the current customers timezone is under
	// Daylight saving--//

	if (DS) {
		var timezoneDateDayLight = new Date(timezoneDate.getTime() + 60 * 60000); // add
																					// 1
																					// hour
																					// customer's
																					// timezone
																					// is
																					// currently
																					// under
																					// daylight
																					// saving

		nlapiLogExecution('ERROR',
				'Date with respect to User Time Zone and Daylight Saving',
				timezoneDate);

		return timezoneDateDayLight;

	} else {

		nlapiLogExecution('ERROR', 'Date with respect to User Time Zone',
				timezoneDate);

		return timezoneDate;

	}

}

function getBaseUnitRate(vUnitTypeId) {
	var uomfilters = new Array();
	uomfilters[0] = new nlobjSearchFilter("internalid", null, "anyof",
			vUnitTypeId);
	uomfilters[1] = new nlobjSearchFilter("baseunit", null, "is", 'T');
	var uomcolumns = new Array();
	uomcolumns[0] = new nlobjSearchColumn("conversionrate");
	uomcolumns[1] = new nlobjSearchColumn("unitname");
	var uomresults = nlapiSearchRecord('unitstype', null, uomfilters,
			uomcolumns);

	return uomresults;
}

function TimeStampinSec() {
	var timestamp;
	var now = convertDate();
	var a_p = "";

	// Getting time in hh:mm tt format.
	var curr_hour = now.getHours();
	var curr_min = now.getMinutes();
	var curr_sec = now.getSeconds();

	// determining the am/pm indicator
	if (curr_hour < 12)
		a_p = "am";
	else
		a_p = "pm";

	// finalizing hours depending on 24hr clock
	if (curr_hour == 0)
		curr_hour = 12;
	else if (curr_hour > 12)
		curr_hour -= 12;

	if (curr_min.toString().length == 1)
		curr_min = "0" + curr_min;

	if (curr_sec.toString().length == 1)
		curr_sec = "0" + curr_sec;

	// Adding fields to update time zones.
	// timestamp = curr_hour + ":" + curr_min + ":" + curr_sec + " " + a_p;
	var vTimeFormat = TimeSetting();
	// nlapiLogExecution('Debug', 'vTimeFormat: ', vTimeFormat);
	if (vTimeFormat == 'fmHH:fmMI am') {
		timestamp = curr_hour + ":" + curr_min + ":" + curr_sec + " " + a_p;
	} else if (vTimeFormat == 'fmHH-fmMI am') {
		timestamp = curr_hour + "-" + curr_min + "-" + curr_sec + " " + a_p;
	} else if (vTimeFormat == 'fmHH24:fmMI') {
		curr_hour = parseInt(curr_hour) + 12;
		if (parseInt(curr_hour) == 24)
			curr_hour = 0;
		timestamp = curr_hour + ":" + curr_min + ":" + curr_sec;
	} else {
		curr_hour = parseInt(curr_hour) + 12;
		if (parseInt(curr_hour) == 24)
			curr_hour = 0;
		timestamp = curr_hour + "-" + curr_min + "-" + curr_sec;
	}

	return timestamp;
}

/**
 * Generic function to display different types of inline messages with 1 dynamic
 * operational variable/quantity
 * 
 * @param messageType
 * @param messageHeader
 * @param messageText
 */
function showInlineMessage(form, messageType, messageText, messageVariable) {
	var msg;
	var priority;

	// Create the message field in the form
	msg = form.addField('custpage_message', 'inlinehtml', null, null, null);

	if (messageType == 'Confirmation')
		priority = 'NLAlertDialog.TYPE_LOWEST_PRIORITY';
	else if (messageType == 'ERROR')
		priority = 'NLAlertDialog.TYPE_HIGH_PRIORITY';
	else
		priority = 'NLAlertDialog.TYPE_HIGH_PRIORITY';

	// Set the message value
	if (messageVariable != null) {
		if (messageText != null && messageText != "" && messageText != "null") {
			msg
					.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', '"
							+ messageType
							+ "', '"
							+ messageText
							+ ":"
							+ messageVariable
							+ "', "
							+ priority
							+ ",  '100%', null, null, null);</script></div>");
		} else {
			msg
					.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', '"
							+ messageType
							+ "', '"
							+ messageVariable
							+ "', "
							+ priority
							+ ",  '100%', null, null, null);</script></div>");
		}
	} else {

		msg
				.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', '"
						+ messageType
						+ "', '"
						+ messageText
						+ "', "
						+ priority
						+ ",  '100%', null, null, null);</script></div>");
	}
}

function updateScheduleScriptStatus(processname, curuserId, status,
		transactionrefno, trantype, notes) {
	nlapiLogExecution('DEBUG', 'Into updateScheduleScriptStatus', status);

	var str = 'processname. = ' + processname + '<br>';
	str = str + 'curuserId. = ' + curuserId + '<br>';
	str = str + 'transactionrefno. = ' + transactionrefno + '<br>';
	str = str + 'trantype. = ' + trantype + '<br>';
	str = str + 'notes. = ' + notes + '<br>';

	nlapiLogExecution('Debug', 'Function Parameters', str);

	if (status == 'Submitted') {
		var datetime = DateStamp() + " " + getClockTime();
		var schedulestatus = nlapiCreateRecord('customrecord_wmsse_schscripts_status');
		schedulestatus.setFieldValue('name', processname);
		schedulestatus
				.setFieldValue('custrecord_wmsse_schprsname', processname);
		schedulestatus.setFieldValue('custrecord_wmsse_schprsstatus', status);
		schedulestatus.setFieldValue(
				'custrecord_wmsse_schprsinitiateddatetime', datetime);
		schedulestatus.setFieldValue('custrecord_wmsse_schprstranrefno',
				transactionrefno);
		if (curuserId != null && curuserId != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprsinitiatedby',
					curuserId);
		if (trantype != null && trantype != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprstrantype',
					trantype);
		var tranid = nlapiSubmitRecord(schedulestatus);
	} else if (status == 'In Progress') {
		var filter = new Array();
		if (curuserId != null && curuserId != '')
			filter.push(new nlobjSearchFilter(
					'custrecord_wmsse_schprsinitiatedby', null, 'anyof',
					curuserId));
		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsstatus',
				null, 'is', 'Submitted'));
		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname', null,
				'is', processname));
		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',
				null, 'is', transactionrefno));

		var column = new Array();
		column[0] = new nlobjSearchColumn('custrecord_wmsse_schprsname');
		column[1] = new nlobjSearchColumn('id').setSort();

		var searchresult = nlapiSearchRecord(
				'customrecord_wmsse_schscripts_status', null, filter, column);
		if (searchresult != null && searchresult != '') {
			var vid = searchresult[0].getId();
			nlapiLogExecution('DEBUG', 'vid in In Progress', vid);
			var fields = new Array();
			var values = new Array();

			fields[0] = 'custrecord_wmsse_schprsstatus';
			fields[1] = 'custrecord_wmsse_schprsbegindate';
			fields[2] = 'custrecord_wmsse_schprsbegintime';

			values[0] = status;
			values[1] = DateStamp();
			values[2] = TimeStamp();

			nlapiSubmitField('customrecord_wmsse_schscripts_status', vid,
					fields, values);
		}

	} else if (status == 'Completed') {
		var filter = new Array();
		if (curuserId != null && curuserId != '')
			filter.push(new nlobjSearchFilter(
					'custrecord_wmsse_schprsinitiatedby', null, 'anyof',
					curuserId));
		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsstatus',
				null, 'is', 'In Progress'));
		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname', null,
				'is', processname));
		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',
				null, 'is', transactionrefno));

		var column = new Array();
		column[0] = new nlobjSearchColumn('custrecord_wmsse_schprsname');
		column[1] = new nlobjSearchColumn('id').setSort();

		var searchresult = nlapiSearchRecord(
				'customrecord_wmsse_schscripts_status', null, filter, column);
		if (searchresult != null && searchresult != '') {
			var vid = searchresult[0].getId();
			nlapiLogExecution('DEBUG', 'vid in In Completed', vid);
			var fields = new Array();
			var values = new Array();

			fields[0] = 'custrecord_wmsse_schprsstatus';
			fields[1] = 'custrecord_wmsse_schprsenddate';
			fields[2] = 'custrecord_wmsse_schprsendtime';
			fields[3] = 'custrecord_wmsse_schprsnotes';
			if (notes == null || notes == '' || notes == 'null'
					|| notes == 'undefined')
				notes = '';
			values[0] = status;
			values[1] = DateStamp();
			values[2] = TimeStamp();
			values[3] = notes;

			nlapiSubmitField('customrecord_wmsse_schscripts_status', vid,
					fields, values);
		}
	}
	nlapiLogExecution('DEBUG', 'updateScheduleScriptStatus end',
			transactionrefno);
}

function getClockTime() {
	var now = convertDate();
	var hour = now.getHours();
	var minute = now.getMinutes();
	var second = now.getSeconds();
	var ap = "AM";
	if (hour > 11) {
		ap = "PM";
	}
	if (hour > 12) {
		hour = hour - 12;
	}
	if (hour == 0) {
		hour = 12;
	}
	if (hour < 10) {
		hour = "0" + hour;
	}
	if (minute < 10) {
		minute = "0" + minute;
	}
	if (second < 10) {
		second = "0" + second;
	}
	// var timeString = hour + ':' + minute + ':' + second + " " + ap;
	var timeString = '';
	var vTimeFormat = TimeSetting();
	nlapiLogExecution('Debug', 'vTimeFormat: ', vTimeFormat);
	if (vTimeFormat == 'fmHH:fmMI am') {
		timeString = hour + ":" + minute + ':' + second + " " + ap;
	} else if (vTimeFormat == 'fmHH-fmMI am') {
		timeString = hour + "-" + minute + '-' + second + " " + ap;
	} else if (vTimeFormat == 'fmHH24:fmMI') {
		hour = parseInt(hour) + 12;
		if (parseInt(hour) == 24)
			hour = 0;
		timeString = hour + ":" + minute + ':' + second;
	} else {
		hour = parseInt(hour) + 12;
		if (parseInt(hour) == 24)
			hour = 0;
		timeString = hour + "-" + minute + '-' + second;
	}

	return timeString;
}

function updateOpenTaskWO(poInternalId, FetchedItemId, poLineno, enterQty,
		enterBin, itemType, whLocation, batchno, expiryDate, fifoDate, idl,
		poname, PutStrategy, PickStrategy, zoneno, taskType, carton,
		cartonSize, cartonWeight, isItLastPick, trantype, actualBeginTime,
		customer, systemRule, componentitemExpectedQty, componentitemActualQty,
		parentItem, kitFlag, beginLoc, uom, conversionRate, shipMethod, ordQty,
		ordType, selectedStatus) {
	var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
	nlapiLogExecution('ERROR', 'Creating Record', 'TRN_OPENTASK');
	var str = "poInternalId : '" + poInternalId + "' ,FetchedItemId : '"
			+ FetchedItemId + "' ,poLineno : '" + poLineno + "' ,enterQty : '"
			+ enterQty + "',enterBin : '" + enterBin + "',itemType : '"
			+ itemType + "' ,whLocation : '" + whLocation + "' ,batchno : '"
			+ batchno + "' ,expiryDate : '" + expiryDate + "',fifoDate : '"
			+ fifoDate + "',idl : '" + idl + "' ,poname : '" + poname
			+ "',PutStrategy : '" + PutStrategy + "' ,PickStrategy : '"
			+ PickStrategy + "' ,zoneno : '" + zoneno + "' ,taskType : '"
			+ taskType + "'";
	nlapiLogExecution('ERROR', 'str', str);
	nlapiLogExecution(
			'ERROR',
			'carton,cartonSize,cartonWeight,isItLastPick,trantype,actualBeginTime,customer,systemRule',
			carton + "," + cartonSize + "," + cartonWeight + "," + isItLastPick
					+ "," + trantype + "," + actualBeginTime + "," + customer
					+ "," + systemRule);
	nlapiLogExecution('ERROR', 'uom,conversionRate,shipMethod,ordQty', uom
			+ "," + conversionRate + "," + shipMethod + "," + ordQty);
	if (poname != null && poname != '')
		customrecord.setFieldValue('name', poname);
	customrecord.setFieldValue('custrecord_wmsse_act_begin_date', DateStamp());
	customrecord.setFieldValue('custrecord_wmsse_act_end_date', DateStamp());

	customrecord.setFieldValue('custrecord_wmsse_act_qty', enterQty);

	if (uom != null && uom != '' && uom != 'null' && uom != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_uom', uom);

	if (conversionRate != null && conversionRate != ''
			&& conversionRate != 'null' && conversionRate != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_conversionrate',
				conversionRate);

	if (shipMethod != null && shipMethod != '' && shipMethod != 'null'
			&& shipMethod != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_shipmethod', shipMethod);

	customrecord.setFieldValue('custrecord_wmsse_sku', FetchedItemId);

	customrecord.setFieldValue('custrecord_wmsse_line_no', poLineno);

	customrecord.setFieldValue('custrecord_wmsse_expe_qty', enterQty);
	if (taskType == "PUTW") {
		customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 3);// putaway
																			// completed

		customrecord.setFieldValue('custrecord_wmsse_tasktype', 2); // For PUTW
	} else {
		customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 8);// picking
																			// completed

		customrecord.setFieldValue('custrecord_wmsse_tasktype', 3); // For Pick
		// customrecord.setFieldValue('custrecord_wmsse_actbeginloc', enterBin);
		var vDate = DateStamp();
		var vTime = getConvertedTimeStamp();
		var vNewDate = vDate + ' ' + vTime;

		customrecord.setFieldValue('custrecord_wmsse_pick_comp_date', vNewDate);
		if (ordQty != null && ordQty != '' && ordQty != 'null'
				&& ordQty != 'undefined')
			customrecord.setFieldValue('custrecord_wmsse_expe_qty', ordQty);
	}
	if (enterBin != null && enterBin != '' && enterBin != 'null'
			&& enterBin != 'undefined') {
		customrecord.setFieldValue('custrecord_wmsse_actbeginloc', enterBin);
		customrecord.setFieldValue('custrecord_wmsse_actendloc', enterBin);
	}
	if (beginLoc != null && beginLoc != 'null' && beginLoc != ''
			&& beginLoc != 'undefined' && trantype == 'workorder') {
		customrecord.setFieldValue('custrecord_wmsse_actbeginloc', beginLoc);
	}
	if (itemType == "lotnumberedinventoryitem"
			|| itemType == "lotnumberedassemblyitem") {
		/*
		 * var lotInternalId=0; if(systemRule != 'PO') {
		 * lotInternalId=getLotInternalId(batchno); }
		 */
		/*
		 * else { var objCreateBatch = nlapiCreateRecord('inventorynumber');
		 * objCreateBatch.setFieldValue('inventorynumber',batchno);
		 * objCreateBatch.setFieldValue('expirationdate',expiryDate);
		 * //objCreateBatch.setFieldValue('expirationdate',expiryDate);
		 * lotInternalId = nlapiSubmitRecord(objCreateBatch); }
		 */

		/*
		 * if(lotInternalId!=null && lotInternalId!='')
		 * customrecord.setFieldValue('custrecord_wmsse_batch_no',lotInternalId);
		 */
		if (batchno != null && batchno != '')
			customrecord.setFieldValue('custrecord_wmsse_batch_num', batchno);
		if (expiryDate != null && expiryDate != '' && expiryDate != 'null'
				&& expiryDate != 'undefined')
			customrecord.setFieldValue('custrecord_wmsse_expirydate',
					expiryDate);
		else {
			var lotInternalId = '';
			if (batchno != null && batchno != '')
				lotInternalId = getLotInternalId(batchno);
			if (lotInternalId != null && lotInternalId != '') {
				var fields = [ 'inventorynumber', 'expirationdate' ];
				var vLotDetails = nlapiLookupField('inventorynumber',
						lotInternalId, fields);
				var vexpDate = vLotDetails.expirationdate;
				nlapiLogExecution('ERROR', 'vexpDate', vexpDate);
				if (vexpDate != null && vexpDate != '' && vexpDate != 'null')
					customrecord.setFieldValue('custrecord_wmsse_expirydate',
							vexpDate);
			}
		}
		if (fifoDate != null && fifoDate != '')
			customrecord.setFieldValue('custrecord_wmsse_fifodate', fifoDate);

	}

	if ((itemType == "serializedinventoryitem" || itemType == "serializedassemblyitem")) {

		var filterssertemp1 = new Array();
		var serialArray = '';
		filterssertemp1[0] = new nlobjSearchFilter(
				'custrecord_wmsse_ser_status', null, 'is', 'F');
		if (trantype != "transferorder") {
			filterssertemp1[1] = new nlobjSearchFilter(
					'custrecord_wmsse_ser_ordline', null, 'equalto', poLineno);
		} else {
			if (taskType == "PUTW") {
				nlapiLogExecution('ERROR', 'taskType', taskType);
				filterssertemp1[1] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_ordline', null, 'equalto',
						parseFloat(poLineno));
			} else {
				nlapiLogExecution('ERROR', 'taskType in else', taskType);
				filterssertemp1[1] = new nlobjSearchFilter(
						'custrecord_wmsse_ser_ordline', null, 'equalto',
						parseFloat(poLineno));
			}
		}
		filterssertemp1[2] = new nlobjSearchFilter(
				'custrecord_wmsse_ser_ordno', null, 'anyof', poInternalId);
		var columnssertemp1 = new Array();
		columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
		columnssertemp1[1] = new nlobjSearchColumn('name');
		var SrchRecordTmpSerial1 = nlapiSearchRecord(
				'customrecord_wmsse_serialentry', null, filterssertemp1,
				columnssertemp1);
		if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != "") {
			for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
				if (serialArray == null || serialArray == '')
					serialArray = SrchRecordTmpSerial1[n]
							.getValue('custrecord_wmsse_ser_no');
				else
					serialArray = serialArray
							+ ","
							+ SrchRecordTmpSerial1[n]
									.getValue('custrecord_wmsse_ser_no');
			}
			nlapiLogExecution('ERROR', 'serialArray', serialArray);
			customrecord.setFieldValue('custrecord_wmsse_serial_no',
					serialArray);
			/*
			 * for (var j = 0; j < SrchRecordTmpSerial1.length; j++) { var
			 * TempRecord=SrchRecordTmpSerial1[j]; nlapiLogExecution('ERROR',
			 * 'TempRecord.getId()',TempRecord.getId());
			 * nlapiLogExecution('ERROR',
			 * 'TempRecord.getValue(name)',TempRecord.getValue('name')); var
			 * tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
			 * tempSerial.setFieldValue('id', TempRecord.getId());
			 * tempSerial.setFieldValue('name', TempRecord.getValue('name'));
			 * tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because
			 * of serial number is updated in opentask we have marked this
			 * serial number as closed');
			 * tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
			 * nlapiSubmitRecord(tempSerial); }
			 */
		}
		SrchRecordTmpSerial1 = null;
	}
	customrecord.setFieldValue('custrecord_wmsse_order_no', poInternalId);
	customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);

	if (PutStrategy != null && PutStrategy != '')
		customrecord
				.setFieldValue('custrecord_wmsse_put_strategy', PutStrategy);
	if (PickStrategy != null && PickStrategy != '')
		customrecord.setFieldValue('custrecord_wmsse_pick_strategy',
				PickStrategy);
	if (zoneno != null && zoneno != '')
		customrecord.setFieldValue('custrecord_wmsse_zone_no', zoneno);
	if (kitFlag != null && kitFlag != 'null' && kitFlag != 'undefined'
			&& kitFlag != '' && kitFlag == 'T') {
		customrecord.setFieldValue('custrecord_wmsse_kitflag', kitFlag);
		customrecord.setFieldValue('custrecord_wmsse_act_qty', '');
	}

	customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', FetchedItemId);
	if (idl != null && idl != '')
		customrecord.setFieldValue('custrecord_wmsse_nsconfirm_ref_no', idl);

	var currentUserID = getCurrentUser();

	customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);

	if (carton != null && carton != '' && carton != 'null'
			&& carton != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_container_lp_no', carton);
	if (cartonSize != null && cartonSize != '' && cartonSize != 'null'
			&& cartonSize != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_container_size',
				cartonSize);
	if (cartonWeight != null && cartonWeight != '' && cartonWeight != 'null'
			&& cartonWeight != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_containerweight',
				cartonWeight);
	if (isItLastPick != null && isItLastPick != '' && isItLastPick != 'null'
			&& isItLastPick != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_device_upload_flag',
				isItLastPick);
	if (actualBeginTime != null && actualBeginTime != ''
			&& actualBeginTime != 'null' && actualBeginTime != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_actualbegintime',
				actualBeginTime);
	customrecord.setFieldValue('custrecord_wmsse_actualendtime', TimeStamp());
	if (customer != null && customer != '' && customer != 'null'
			&& customer != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_customer', customer);
	if (componentitemExpectedQty != null && componentitemExpectedQty != ''
			&& componentitemExpectedQty != 'null'
			&& componentitemExpectedQty != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_compitm_expqty',
				componentitemExpectedQty);
	if (componentitemActualQty != null && componentitemActualQty != ''
			&& componentitemActualQty != 'null'
			&& componentitemActualQty != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_compitm_actqty',
				componentitemActualQty);
	if (parentItem != null && parentItem != '' && parentItem != 'null'
			&& parentItem != 'undefined')
		customrecord
				.setFieldValue('custrecord_wmsse_parent_sku_no', parentItem);
	if (ordType != null && ordType != '' && ordType != 'null'
			&& ordType != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_ord_type', ordType);
	if (selectedStatus != null && selectedStatus != ''
			&& selectedStatus != 'null' && selectedStatus != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_inventorystatus',
				selectedStatus);

	var recid = nlapiSubmitRecord(customrecord);
	nlapiLogExecution('ERROR', 'Done creating opentask Record', recid);
	customrecord = null;
	if (recid != null && recid != '') {

		nlapiLogExecution('ERROR', 'currentUserID', currentUserID);
		nlapiLogExecution('ERROR', 'trantype,poInternalId,poLineno', trantype
				+ "," + poInternalId + "," + poLineno);
		var lockfilters = new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',
				null, 'is', trantype));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order', null,
				'anyof', poInternalId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line', null,
				'equalto', poLineno));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',
				null, 'is', 'T'));
		// lockfilters.push(new
		// nlobjSearchFilter('custrecord_wmsse_user',null,'anyof',currentUserID));
		var lockcolumns = new Array();
		lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_user'));

		var lockresults = nlapiSearchRecord('customrecord_wmsse_lockrecs',
				null, lockfilters, lockcolumns);
		if (lockresults != null && lockresults != '' && lockresults != 'null'
				&& lockresults != undefined && lockresults != 'undefined'
				&& lockresults.length > 0) {
			for (var lockItr = 0; lockItr < lockresults.length; lockItr++) {
				var lockRecordId = lockresults[lockItr].getId();
				var LockDeleteRecordId = nlapiDeleteRecord(
						'customrecord_wmsse_lockrecs', lockRecordId);
			}
			LockDeleteRecordId = null;
		}
		lockresults = null;
		lockcolumns = null;
		lockfilters = null;
	}
	// Nullify opjects
	currentUserID = null;
	if (taskType != "PUTW") {
		return recid;
	}
}
/**
 * This function is used to validate entered date string and if entered string
 * is valid then it returns data otherwise it returns null
 */
function ValidateDate(vDateString, dtsettingFlag) {
	if (vDateString != null && vDateString != '') {
		var vValidDate = nlapiStringToDate(vDateString, dtsettingFlag);
		nlapiLogExecution('ERROR', 'vValidDate', vValidDate);
		if (isNaN(vValidDate) || vValidDate == null || vValidDate == '')
			return null;
		else
			return vValidDate;
	} else
		return null;
}

function removeDuplicateElement(arrayName) {
	var newArray = new Array();
	label: for (var i = 0; i < arrayName.length; i++) {
		for (var j = 0; j < newArray.length; j++) {
			if (newArray[j] == arrayName[i])
				continue label;
		}
		newArray[newArray.length] = arrayName[i];
	}
	return newArray;
}

function nswms_GetValidBinInternalIdWithLocationType(Binnumber, whLocation,
		Item) {
	var bininternalId = '';
	var Binandtypeflag = new Array();
	var filter = new Array();
	filter.push(new nlobjSearchFilter('binnumber', null, 'is', Binnumber));
	// filter.push(new nlobjSearchFilter('inactive',null, 'is','F'));
	if (whLocation != null && whLocation != '' && whLocation != 'null'
			&& whLocation != 'undefined')
		filter
				.push(new nlobjSearchFilter('location', null, 'anyof',
						whLocation));
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_bin_loc_type');
	var searchrecord = nlapiSearchRecord('Bin',
			'customsearch_wmsse_woqty_bin_srh', filter, columns);
	if (searchrecord != null && searchrecord != "") {
		var Checkflag = 'F';
		var vLocationType = searchrecord[0]
				.getText('custrecord_wmsse_bin_loc_type');
		// nlapiLogExecution('ERROR','vLocationType',vLocationType);
		if (vLocationType != 'WIP') {
			bininternalId = searchrecord[0].getId();
			Checkflag = 'T';

		}
	}
	nlapiLogExecution('ERROR',
			'bininternalId,Item,whLocation,Binnumber,Checkflag', bininternalId
					+ "," + Item + "," + whLocation + "," + Binnumber + ","
					+ Checkflag);

	filter = null;
	searchrecord = null;
	filtersku = null;
	searchitemrecord = null;
	Binandtypeflag.push(bininternalId);
	Binandtypeflag.push(Checkflag);
	// nlapiLogExecution('ERROR','Binandtypeflag',Binandtypeflag.length);
	return Binandtypeflag;
}

function nswms_GetValidBinInternalIdWithLocationTypeInv(Binnumber, whLocation,
		Item) {
	var bininternalId = '';
	var Binandtypeflag = new Array();
	var filter = new Array();
	filter.push(new nlobjSearchFilter('binnumber', null, 'is', Binnumber));
	// filter.push(new nlobjSearchFilter('inactive',null, 'is','F'));
	if (whLocation != null && whLocation != '' && whLocation != 'null'
			&& whLocation != 'undefined')
		filter
				.push(new nlobjSearchFilter('location', null, 'anyof',
						whLocation));
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_bin_loc_type');
	var searchrecord = nlapiSearchRecord('Bin',
			'customsearch_wmsse_woqty_bin_srh', filter, columns);
	if (searchrecord != null && searchrecord != "") {
		var Checkflag = 'F';
		var vLocationType = searchrecord[0]
				.getText('custrecord_wmsse_bin_loc_type');
		nlapiLogExecution('ERROR', 'vLocationType', vLocationType);
		if (vLocationType != 'WIP' && vLocationType != 'Stage') {
			bininternalId = searchrecord[0].getId();
			Checkflag = 'T';

		}
	}
	nlapiLogExecution('ERROR',
			'bininternalId,Item,whLocation,Binnumber,Checkflag', bininternalId
					+ "," + Item + "," + whLocation + "," + Binnumber + ","
					+ Checkflag);

	filter = null;
	searchrecord = null;
	filtersku = null;
	searchitemrecord = null;
	Binandtypeflag.push(bininternalId);
	Binandtypeflag.push(Checkflag);
	nlapiLogExecution('ERROR', 'Binandtypeflag', Binandtypeflag.length);
	return Binandtypeflag;
}

function getCustomScriptId(vProcessId) {

	var filters = new Array();

	filters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
	filters[1] = new nlobjSearchFilter('custrecord_wmsse_processtype', null,
			'anyof', vProcessId);
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_custom_scriptid');
	columns[1] = new nlobjSearchColumn('custrecord_wmsse_custom_deploymentid');
	var resultArray = new Array();
	var searchresults = nlapiSearchRecord(
			'customrecord_wmsse_custompicking_script', null, filters, columns);
	if (searchresults != null && searchresults != '') {
		resultArray.push(searchresults[0]
				.getValue('custrecord_wmsse_custom_scriptid'));
		resultArray.push(searchresults[0]
				.getValue('custrecord_wmsse_custom_deploymentid'));
	}
	return resultArray;
}

function getComponentItemType(itemNo) {
	nlapiLogExecution('DEBUG', 'Input Item No', itemNo);
	var vItemType = "";
	var filters = new Array();
	filters.push(new nlobjSearchFilter('nameinternal', null, 'is', itemNo));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('isfulfillable', null, 'is', 'T'));

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('itemid');

	var itemSearchResults = nlapiSearchRecord('item', null, filters, columns);

	if (itemSearchResults != null && itemSearchResults != '') {
		vItemType = itemSearchResults[0].recordType;
	}

	var logMsg = 'vItemType = ' + vItemType;

	itemSearchResults = null;
	filters = null;
	columns = null;
	return vItemType;
}
var vAllSerialArray = new Array();
function fnGetAllSerials(poInternalId, poLineno, maxno) {
	var filterssertemp1 = new Array();
	var serialArray = '';
	filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status',
			null, 'is', 'F');
	filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline',
			null, 'equalto', poLineno);

	filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno',
			null, 'anyof', poInternalId);
	if (maxno != -1) {
		filterssertemp1.push(new nlobjSearchFilter('id', null, 'lessthan',
				parseFloat(maxno)));
	}
	var columnssertemp1 = new Array();
	columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
	columnssertemp1[1] = new nlobjSearchColumn('name');
	columnssertemp1[2] = new nlobjSearchColumn('internalid');
	columnssertemp1[2].setSort(true);
	var SrchRecordTmpSerial1 = nlapiSearchRecord(
			'customrecord_wmsse_serialentry', null, filterssertemp1,
			columnssertemp1);
	if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '') {
		for (var k = 0; k < SrchRecordTmpSerial1.length; k++) {
			vAllSerialArray.push(SrchRecordTmpSerial1[k]);
		}
		if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1.length >= 1000) {
			nlapiLogExecution('ERROR', 'SrchRecordTmpSerial2.length',
					SrchRecordTmpSerial1.length);

			var maxno = SrchRecordTmpSerial1[SrchRecordTmpSerial1.length - 1]
					.getValue('internalid');
			fnGetAllSerials(poInternalId, poLineno, maxno);

		}
	}
	return vAllSerialArray;

}

function fnGetAllSerialsbyStatus(poInternalId, poLineno, maxno, vstatus,
		vAllSerialArray) {
	// Fetch Serial Entry record based Item status
	var result = nlapiLoadSearch('customrecord_wmsse_serialentry',
			'customsearch_wmsse_serialentry_statussrh');

	result.addFilter(new nlobjSearchFilter('custrecord_wmsse_ser_status', null,
			'is', 'F'));
	if (poLineno != null && poLineno != '')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_ser_ordline',
				null, 'equalto', poLineno));
	if (poInternalId != null && poInternalId != '')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_ser_ordno',
				null, 'anyof', poInternalId));
	if (vstatus != null && vstatus != '')
		result.addFilter(new nlobjSearchFilter(
				'custrecord_serial_inventorystatus', null, 'anyof', vstatus));
	if (maxno != -1 && maxno != null && maxno != '') {
		result.addFilter(new nlobjSearchFilter('internalidnumber', null,
				'greaterthan', parseFloat(maxno)));
	}

	var resLen = result.runSearch();
	var srhIterator = 0;
	var resultSet = resLen.forEachResult(function(searchResult) {
		srhIterator++;
		vAllSerialArray.push(searchResult);
		if (parseFloat(srhIterator) == 4000) {
			maxno = searchResult.getValue('internalid');
			fnGetAllSerialsbyStatus(poInternalId, poLineno, maxno, vstatus,
					vAllSerialArray);
			return false;
		}
		return true; // return true to keep iterating
	});

	return vAllSerialArray;

}

function getSystemRuleProcessType(RuleId, loc, ProcessType) {
	nlapiLogExecution('Debug', 'Into getSystemRuleProcessType... ', RuleId);
	nlapiLogExecution('Debug', 'loc', loc);
	var systemrulevalue = '';

	try {
		var filters = new Array();

		filters[0] = new nlobjSearchFilter('name', null, 'is', RuleId
				.toString());
		filters[1] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
		// starts
		if (loc != null && loc != '')
			filters.push(new nlobjSearchFilter('custrecord_wmssesite', null,
					'anyof', [ '@NONE@', loc ]));
		if (ProcessType != null && ProcessType != '')
			filters.push(new nlobjSearchFilter('custrecord_wmsseprocesstype',
					null, 'anyof', ProcessType));
		filters.push(new nlobjSearchFilter('custrecord_wmsserulevalue', null,
				'is', 'Y'));

		// ends

		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_wmsseprocesstype');
		columns[1] = new nlobjSearchColumn('custrecord_wmssesite');

		columns[1].setSort();
		var searchresults = nlapiSearchRecord('customrecord_wmsse_sysrules',
				null, filters, columns);
		if (searchresults != null && searchresults != ''
				&& searchresults != 'null' && searchresults != 'undefined') {
			if (searchresults[0].getText('custrecord_wmsseprocesstype') != null
					&& searchresults[0].getText('custrecord_wmsseprocesstype') != '') {
				systemrulevalue = searchresults[0]
						.getText('custrecord_wmsseprocesstype');
				searchresults = null;
				return systemrulevalue;
			} else
				return systemrulevalue;
		} else {
			var filters = new Array();

			filters[0] = new nlobjSearchFilter('name', null, 'is', RuleId
					.toString());
			filters[1] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
			// starts
			if (loc != null && loc != '')
				filters.push(new nlobjSearchFilter('custrecord_wmssesite',
						null, 'anyof', [ '@NONE@', loc ]));

			filters.push(new nlobjSearchFilter('custrecord_wmsseprocesstype',
					null, 'is', 'All'));
			filters.push(new nlobjSearchFilter('custrecord_wmsserulevalue',
					null, 'is', 'Y'));

			var columns = new Array();
			columns[0] = new nlobjSearchColumn('custrecord_wmsseprocesstype');
			columns[1] = new nlobjSearchColumn('custrecord_wmssesite');

			columns[1].setSort();
			var searchresults = nlapiSearchRecord(
					'customrecord_wmsse_sysrules', null, filters, columns);
			if (searchresults != null && searchresults != ''
					&& searchresults != 'null' && searchresults != 'undefined') {
				if (searchresults[0].getText('custrecord_wmsseprocesstype') != null
						&& searchresults[0]
								.getText('custrecord_wmsseprocesstype') != '') {
					systemrulevalue = searchresults[0]
							.getText('custrecord_wmsseprocesstype');
					searchresults = null;
					return systemrulevalue;
				} else
					return systemrulevalue;
			} else {
				return systemrulevalue;
			}
		}

	} catch (exp) {
		nlapiLogExecution('Debug', 'Exception in GetSystemRules: ', exp);
		return systemrulevalue;
	}
}

function IsPackListExist(ordernum) {

	nlapiLogExecution('Debug', 'Into IsPackListExist', ordernum);
	var IsPacklistExist = 'F';

	try {
		var filter = new Array();
		filter.push(new nlobjSearchFilter('name', null, 'is', ordernum));
		filter.push(new nlobjSearchFilter('custrecord_wmsse_label_type', null,
				'is', "PackList"));

		var columns = new Array();

		var packlist = nlapiSearchRecord('customrecord_wmsse_labelprinting',
				null, filter, columns);
		if (packlist != null && packlist.length > 0)
			IsPacklistExist = 'T';
	} catch (e) {
		nlapiLogExecution('Debug', 'unexpected error in IsPacklistExist');
	}
	nlapiLogExecution('Debug', 'Out of IsPacklistExist', IsPacklistExist);
	return IsPacklistExist;
}
function getLocationCountry(locationid) {
	try {
		nlapiLogExecution('ERROR', 'into locationid', locationid);
		var filterStrat = new Array();
		var vLocation = '';

		filterStrat.push(new nlobjSearchFilter('internalid', null, 'anyof',
				locationid));

		objBinDetails = new nlapiSearchRecord('Location',
				'customsearch_wmsse_loccountrysearchresul', filterStrat, null);

		if (objBinDetails != null && objBinDetails != '')
			vLocation = objBinDetails[0].getValue('country');
	} catch (exception) {
		nlapiLogExecution('ERROR', 'exception in GetLocation', exception);
	}
	nlapiLogExecution('ERROR', 'vLocation', vLocation);

	return vLocation;
}
function getUnitsType(unitId) {
	var results = '';
	try {

		var uomfilters = new Array();

		uomfilters[0] = new nlobjSearchFilter("internalid", null, "anyof",
				unitId);

		results = nlapiSearchRecord('unitstype',
				'customsearch_wmsse_unitstype', uomfilters, null);

	} catch (e) {
		nlapiLogExecution('ERROR', 'exception in getUnitsType', e);
	}
	nlapiLogExecution('ERROR', 'results', results);

	return results;
}

function getUomvalues(results) {
	var uomresults = new Array();
	if (results != null && results != '') {
		for (var Cnt = 0; Cnt < results.length; Cnt++) {

			var UOMText = results[Cnt].getValue('unitname');
			var vQty = results[Cnt].getValue('conversionrate');
			var row = [ UOMText + "_" + vQty ];
			uomresults.push(row);

		}
	}

	return uomresults

}

/**
 * Function is used to load the progressive image while the transaction is being
 * processed*
 */
function loadProgressiveImage() {
	var fileName = 'bx_loader.gif';
	var nlobjContext = nlapiGetContext();
	var vBundleId = nlobjContext.getBundleId();
	var txtFilePath = "";
	nlapiLogExecution('ERROR', 'vBundleId', vBundleId);
	if (vBundleId != null && vBundleId != '')
		txtFilePath = 'SuiteBundles/Bundle ' + vBundleId + '/' + 'src/Images/'
				+ fileName;

	var objFile = null;
	try {
		objFile = nlapiLoadFile(txtFilePath);
	} catch (e) {
		nlapiLogExecution('ERROR', 'Exception in file load', e);
		txtFilePath = "Images/" + fileName;
		objFile = nlapiLoadFile(txtFilePath);
		nlapiLogExecution('ERROR', 'Exception in file load', objFile);
	}
	return objFile;

}

/**
 * To get storage Bin locations details based on Pick Zone sorted by Internal Id
 */
function fnGetBinsbyZones(strPickZone, strLocation, maxno, objBinByZoneDetails) {
	var result = nlapiLoadSearch('bin',
			'customsearch_wmsse_binssort_byinternalid');

	if (strPickZone != null && strPickZone != '' && strPickZone != '-None-')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_zone', null,
				'anyof', strPickZone));

	if (strLocation != null && strLocation != '')
		result.addFilter(new nlobjSearchFilter('location', null, 'anyof',
				strLocation));

	result.addFilter(new nlobjSearchFilter('inactive', null, 'is', 'F'));

	if (maxno != -1) {
		result.addFilter(new nlobjSearchFilter('internalidnumber', null,
				'greaterthan', parseInt(maxno)));
	}
	var resLen = result.runSearch();
	var q = 0;
	var resultSet = resLen.forEachResult(function(searchResult) {
		q++;
		objBinByZoneDetails.push(searchResult);
		if (q == 4000) {
			maxno = searchResult.getValue('internalid');
			fnGetBinsbyZones(strPickZone, strLocation, maxno,
					objBinByZoneDetails);
			return false;
		}
		return true; // return true to keep iterating
	});

	return objBinByZoneDetails;
}

/**
 * To get Storage and Stage Bin locations details based on Pick Zone sorted by
 * Internal Id
 */
function fnGetBinsbyZonesAlongWithStage(strPickZone, strLocation, maxno,
		objBinByZoneDetails) {
	var result = nlapiLoadSearch('bin',
			'customsearch_wmsse_binsbypickzonewithstg');

	if (strPickZone != null && strPickZone != '' && strPickZone != '-None-')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_zone', null,
				'anyof', strPickZone));

	if (strLocation != null && strLocation != '')
		result.addFilter(new nlobjSearchFilter('location', null, 'anyof',
				strLocation));

	result.addFilter(new nlobjSearchFilter('inactive', null, 'is', 'F'));

	if (maxno != -1) {
		result.addFilter(new nlobjSearchFilter('internalidnumber', null,
				'greaterthan', parseInt(maxno)));
	}
	var resLen = result.runSearch();
	var q = 0;
	var resultSet = resLen.forEachResult(function(searchResult) {
		q++;
		objBinByZoneDetails.push(searchResult);
		if (q == 4000) {
			maxno = searchResult.getValue('internalid');
			fnGetBinsbyZonesAlongWithStage(strPickZone, strLocation, maxno,
					objBinByZoneDetails);
			return false;
		}
		return true; // return true to keep iterating
	});

	return objBinByZoneDetails;
}

/**
 * To get Order line details from saved search with open task and order join for
 * pickreports
 * 
 * @param sonumber
 * @param soid
 * @param trantype
 * @param customer
 * @param shipdate
 * @returns {nlapiSearchRecord}
 */
function getSOLineDetailsforpickreports(sonumber, soid, trantype, customer,
		shipdate, vReprint, vQty, vnoofLines, vshipcomplete, whLocation,
		vOrderType, department, vclass, vshipmethod, vitemfamily, vitemgrp) {
	nlapiLogExecution('ERROR', 'department', department);
	nlapiLogExecution('ERROR', 'vclass', vclass);
	nlapiLogExecution('ERROR',
			'sonumber,soid,trantype,customer,shipdate,vReprint', sonumber + ","
					+ soid + "," + trantype + "," + customer + "," + shipdate
					+ "," + vReprint);
	nlapiLogExecution(
			'ERROR',
			'vQty,vnoofLines,vshipcomplete,whLocation,department,vclass,vshipmethod,vitemfamily,vitemgrp',
			vQty + "," + vnoofLines + "," + vshipcomplete + "," + whLocation
					+ "," + department + "," + vclass + "," + vshipmethod + ","
					+ vitemfamily + "," + vitemgrp);
	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';
	var Soresults = new Array();

	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var isCrossSub = isIntercompanyCrossSubsidiaryFeatureEnabled();

	var filters = new Array();
	var columns = new Array();
	var SOLineDetails = new nlapiLoadSearch('transaction',
			'customsearch_wmsse_fulfil_ordline_rpt');
	if (sonumber != null && sonumber != '' && sonumber != 'null'
			&& sonumber != 'undefined')
		SOLineDetails.addFilter(new nlobjSearchFilter('tranid', null, 'is',
				sonumber));
	if (soid != null && soid != '' && soid != 'null' && soid != 'undefined')
		SOLineDetails.addFilter(new nlobjSearchFilter('internalid', null,
				'anyof', soid));
	SOLineDetails
			.addFilter(new nlobjSearchFilter('type', null, 'anyof', vType));

	if (customer != null && customer != '' && customer != 'undefined'
			&& customer != 'null')
		SOLineDetails.addFilter(new nlobjSearchFilter('name', null, 'anyof',
				customer));
	if (shipdate != null && shipdate != '' && shipdate != 'undefined'
			&& shipdate != 'null')
		SOLineDetails.addFilter(new nlobjSearchFilter('shipdate', null, 'on',
				shipdate));

	if (vQty != null && vQty != '' && vQty != 'undefined' && vQty != 'null')
		SOLineDetails.addFilter(new nlobjSearchFilter('formulanumeric', null,
				'lessthanorequalto', vQty).setFormula('TO_NUMBER({quantity})'));
	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != '') {
		if (isCrossSub == true && trantype == 'salesorder') {
			// Will allow only locations for which WHsite falg is enabled,So no
			// need to check again
			SOLineDetails.addFilter(new nlobjSearchFilter('inventorylocation',
					null, 'anyof', whLocation));
		} else {
			SOLineDetails.addFilter(new nlobjSearchFilter('location', null,
					'anyof', whLocation));
			SOLineDetails.addFilter(new nlobjSearchFilter(
					'custrecord_wmsse_make_wh_site', 'location', 'is', 'T'));
		}
	}

	if (department != null && department != '' && department != 'undefined'
			&& department != '')
		SOLineDetails.addFilter(new nlobjSearchFilter('department', null,
				'anyof', department));
	if (vclass != null && vclass != '' && vclass != 'undefined' && vclass != '')
		SOLineDetails.addFilter(new nlobjSearchFilter('class', null, 'anyof',
				vclass));
	if (vshipmethod != null && vshipmethod != '' && vshipmethod != 'undefined'
			&& vshipmethod != '')
		SOLineDetails.addFilter(new nlobjSearchFilter('shipmethod', null,
				'anyof', vshipmethod));
	if (vitemfamily != null && vitemfamily != '' && vitemfamily != 'undefined'
			&& vitemfamily != '')
		SOLineDetails.addFilter(new nlobjSearchFilter(
				'custitem_wmsse_itemfamily', 'item', 'anyof', vitemfamily));
	if (vitemgrp != null && vitemgrp != '' && vitemgrp != 'undefined'
			&& vitemgrp != '')
		SOLineDetails.addFilter(new nlobjSearchFilter(
				'custitem_wmsse_itemgroup', 'item', 'anyof', vitemgrp));
	if (vOrderType != null && vOrderType != '' && vOrderType != 'undefined'
			&& vOrderType != '')
		SOLineDetails.addFilter(new nlobjSearchFilter(
				'custbody_wmsse_ordertype', null, 'anyof', vOrderType));
	if (vshipcomplete != null && vshipcomplete != ''
			&& vshipcomplete != 'undefined' && vshipcomplete != '')
		SOLineDetails.addFilter(new nlobjSearchFilter('shipcomplete', null,
				'is', vshipcomplete));
	var SoIntArr = new Array();
	if (vnoofLines != null && vnoofLines != '' && vnoofLines != 'undefined'
			&& vnoofLines != 'null') {
		if (sonumber != null && sonumber != '' && sonumber != 'null'
				&& sonumber != 'undefined')
			filters.push(new nlobjSearchFilter('tranid', null, 'is', sonumber));
		if (soid != null && soid != '' && soid != 'null' && soid != 'undefined')
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof',
					soid));
		filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

		if (customer != null && customer != '' && customer != 'undefined'
				&& customer != 'null')
			filters
					.push(new nlobjSearchFilter('name', null, 'anyof', customer));
		if (shipdate != null && shipdate != '' && shipdate != 'undefined'
				&& shipdate != 'null')
			filters
					.push(new nlobjSearchFilter('shipdate', null, 'on',
							shipdate));

		if (vQty != null && vQty != '' && vQty != 'undefined' && vQty != 'null')
			filters.push(new nlobjSearchFilter('formulanumeric', null,
					'lessthanorequalto', vQty)
					.setFormula('TO_NUMBER({quantity})'));
		if (whLocation != null && whLocation != '' && whLocation != 'undefined'
				&& whLocation != '') {
			if (isCrossSub == true && trantype == 'salesorder') {
				// Will allow only locations for which WHsite falg is enabled,So
				// no need to check again
				filters.push(new nlobjSearchFilter('inventorylocation', null,
						'anyof', whLocation));
			} else {
				filters.push(new nlobjSearchFilter('location', null, 'anyof',
						whLocation));
				filters
						.push(new nlobjSearchFilter(
								'custrecord_wmsse_make_wh_site', 'location',
								'is', 'T'));
			}
		}

		if (department != null && department != '' && department != 'undefined'
				&& department != '')
			filters.push(new nlobjSearchFilter('department', null, 'anyof',
					department));
		if (vclass != null && vclass != '' && vclass != 'undefined'
				&& vclass != '')
			filters.push(new nlobjSearchFilter('class', null, 'anyof', vclass));
		if (vshipmethod != null && vshipmethod != ''
				&& vshipmethod != 'undefined' && vshipmethod != '')
			filters.push(new nlobjSearchFilter('shipmethod', null, 'anyof',
					vshipmethod));
		if (vitemfamily != null && vitemfamily != ''
				&& vitemfamily != 'undefined' && vitemfamily != '')
			filters.push(new nlobjSearchFilter('custitem_wmsse_itemfamily',
					'item', 'anyof', vitemfamily));
		if (vitemgrp != null && vitemgrp != '' && vitemgrp != 'undefined'
				&& vitemgrp != '')
			filters.push(new nlobjSearchFilter('custitem_wmsse_itemgroup',
					'item', 'anyof', vitemgrp));
		if (vOrderType != null && vOrderType != '' && vOrderType != 'undefined'
				&& vOrderType != '')
			filters.push(new nlobjSearchFilter('custbody_wmsse_ordertype',
					null, 'anyof', vOrderType));

		var SOLineCountDetails = new nlapiSearchRecord('transaction',
				'customsearch_wmsse_openpicklines_count', filters, columns);
		if (SOLineCountDetails != null && SOLineCountDetails != ''
				&& SOLineCountDetails.length > 0) {
			for (var f = 0; f < SOLineCountDetails.length; f++) {
				var vLineCount = SOLineCountDetails[f].getValue('line', null,
						'count');
				var vSoInternalId = SOLineCountDetails[f].getValue(
						'internalid', null, 'group');
				nlapiLogExecution('ERROR', 'vLineCount', vLineCount);
				if (parseFloat(vnoofLines) >= parseFloat(vLineCount)) {
					nlapiLogExecution('ERROR', 'vSoInternalId', vSoInternalId);
					SoIntArr.push(vSoInternalId);
				}
			}
		}
		nlapiLogExecution('ERROR', 'SoIntArr', SoIntArr);
		if (SoIntArr != null && SoIntArr != '')
			SOLineDetails.addFilter(new nlobjSearchFilter('internalid', null,
					'anyof', SoIntArr));
	}

	var resLenDetails = SOLineDetails.runSearch();

	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) {
		Soresults = Soresults.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	return Soresults;
}
// var vBinLocLotArr=new Array();
// function
// fnGetInventoryBinsForLot(strPutZone,strLocation,maxno,strLot,ItemInternalId)
// {
// var result = nlapiLoadSearch('inventorydetail',
// 'customsearch_wmsse_mixflag_bins');

// var columns = new Array();

// if(strLocation!=null && strLocation!='' && strLocation!='undefined' &&
// strLocation!='')
// {
// result.addFilter(new nlobjSearchFilter('location','binnumber', 'anyof',
// strLocation));
// }

// if(strPutZone!=null && strPutZone!='' && strPutZone!='undefined' &&
// strPutZone!='')
// {
// result.addFilter(new nlobjSearchFilter('custrecord_wmsse_zone','binnumber',
// 'anyof', strPutZone));
// }
// if(maxno != -1)
// {
// result.addFilter(new nlobjSearchFilter('internalidnumber',
// null,'greaterthanorequalto', parseInt(maxno)));
// }
// var resLen = result.runSearch();

// var q=0;
// var resultSet = resLen.forEachResult(function(searchResult)
// {
// q++;
// if( ItemInternalId == searchResult.getValue('item') && strLot ==
// searchResult.getValue('inventorynumber','inventorynumber'))
// {

// }
// else
// {
// if(vBinLocLotArr.indexOf(searchResult.getValue('binnumber'))==-1)
// {
// vBinLocLotArr.push(searchResult.getValue('binnumber'));
// }
// }
// if(q==4000)
// {
// maxno = searchResult.getValue('internalid');
// fnGetInventoryBinsForLot(strPutZone,strLocation,maxno,strLot,ItemInternalId);
// return false;
// }
// return true; // return true to keep iterating
// });
// nlapiLogExecution('Debug','vBinLocLotArr',vBinLocLotArr);
// return vBinLocLotArr;
// }
// var vBinLocArr=new Array();
// function fnGetInventoryBins(strPutZone,strLocation,maxno,ItemInternalId)
// {
// var result = nlapiLoadSearch('inventorydetail',
// 'customsearch_wmsse_mixflag_bins');

// var columns = new Array();

// if(ItemInternalId!=null && ItemInternalId!='' && ItemInternalId!='undefined'
// && ItemInternalId!='')
// {
// result.addFilter(new nlobjSearchFilter('item',null,'noneof',
// ItemInternalId));
// }
// if(strLocation!=null && strLocation!='' && strLocation!='undefined' &&
// strLocation!='')
// {
// result.addFilter(new nlobjSearchFilter('location','binnumber', 'anyof',
// strLocation));
// }
// if(strPutZone!=null && strPutZone!='' && strPutZone!='undefined' &&
// strPutZone!='')
// {
// result.addFilter(new nlobjSearchFilter('custrecord_wmsse_zone','binnumber',
// 'anyof', strPutZone));
// }

// if(maxno != -1)
// {
// result.addFilter(new nlobjSearchFilter('internalidnumber',
// null,'greaterthanorequalto', parseInt(maxno)));
// }
// var resLen = result.runSearch();

// var q=0;
// var resultSet = resLen.forEachResult(function(searchResult)
// {
// q++;
// if(vBinLocArr.indexOf(searchResult.getValue('binnumber'))==-1)
// {
// vBinLocArr.push(searchResult.getValue('binnumber'));
// }
// if(q==4000)
// {
// maxno = searchResult.getValue('internalid');
// fnGetInventoryBins(strPutZone,strLocation,maxno,ItemInternalId);
// return false;
// }
// return true; // return true to keep iterating
// });
// nlapiLogExecution('Debug','vBinLocArr',vBinLocArr);
// return vBinLocArr;
// }

function fnGetInventoryBinsForLot(strLocation, maxno, strLot, ItemInternalId,
		vBinLocArr) {

	var result = nlapiLoadSearch('item', 'customsearch_wmsse_itemwise_lots');

	if (strLocation != null && strLocation != '') {
		result.addFilter(new nlobjSearchFilter('location', 'binOnHand',
				'anyof', strLocation));
	}

	result.addFilter(new nlobjSearchFilter('inventorynumber',
			'inventoryNumberBinOnHand', 'isnot', strLot));

	result.addFilter(new nlobjSearchFilter('islotitem', null, 'is', 'T'));

	var alltaskresults = [];
	var resultSet = result.runSearch();
	var resultsPage = resultSet.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) {
		alltaskresults = alltaskresults.concat(resultsPage);
		offset += 1000;
		resultsPage = resultSet.getResults(offset, offset + 1000);
	}

	if (alltaskresults != null && alltaskresults != ''
			&& alltaskresults.length > 0) {
		for (var f = 0; f < alltaskresults.length; f++) {
			if (vBinLocArr.indexOf(alltaskresults[f].getValue('binnumber',
					'inventoryNumberBinOnHand')) == -1) {
				vBinLocArr.push(alltaskresults[f].getValue('binnumber',
						'inventoryNumberBinOnHand'));
			}
		}
	}

}

function fnGetInventoryBins(strLocation, maxno, ItemInternalId, vBinLocArr) {

	nlapiLogExecution('ERROR', 'strLocation', strLocation);
	nlapiLogExecution('ERROR', 'ItemInternalId', ItemInternalId);

	var result = nlapiLoadSearch('item',
			'customsearch_wmsse_itemwise_invt_inbound');

	if (strLocation != null && strLocation != '') {
		result.addFilter(new nlobjSearchFilter('location', 'binOnHand',
				'anyof', strLocation));
	}
	result.addFilter(new nlobjSearchFilter('internalid', null, 'noneof',
			ItemInternalId));
	result.addFilter(new nlobjSearchFilter('quantityonhand', 'binOnHand',
			'greaterthan', 0));

	var alltaskresults = [];
	var resultSet = result.runSearch();
	var resultsPage = resultSet.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) {
		alltaskresults = alltaskresults.concat(resultsPage);
		offset += 1000;
		resultsPage = resultSet.getResults(offset, offset + 1000);
	}

	if (alltaskresults != null && alltaskresults != ''
			&& alltaskresults.length > 0) {
		for (var f = 0; f < alltaskresults.length; f++) {
			if (vBinLocArr.indexOf(alltaskresults[f].getValue('binnumber',
					'binOnHand')) == -1) {
				vBinLocArr.push(alltaskresults[f].getValue('binnumber',
						'binOnHand'));
			}
		}
	}

}

var inventoryStatusResultsArray = new Array;

function getDefaultInventoryStatusList(invtStatus_ID, maxno, isSpecOrd) {

	try {
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		if (inventoryStatusFeature == true) {

			var inventoryStatusResults = nlapiLoadSearch('inventorystatus',
					'customsearch_wmsse_getinventorystatuslst');
			if (invtStatus_ID != null && invtStatus_ID != ''
					&& invtStatus_ID != 'null' && invtStatus_ID != 'undefined') {
				inventoryStatusResults.addFilter(new nlobjSearchFilter(
						'internalid', null, 'anyof', invtStatus_ID));
			}
			// To include the filter only if it special order.
			if (isSpecOrd != null && isSpecOrd != '' && isSpecOrd != 'null'
					&& isSpecOrd != 'undefined' && isSpecOrd != undefined
					&& isSpecOrd == 'SpecOrd') {
				inventoryStatusResults.addFilter(new nlobjSearchFilter(
						'inventoryavailable', null, 'is', 'T'));
			}
			if (maxno != null && maxno != 'null' && maxno != ''
					&& maxno != undefined && maxno != 'undefined'
					&& maxno != -1) {
				inventoryStatusResults.addFilter(new nlobjSearchFilter(
						'internalidnumber', null, 'greaterthan',
						parseInt(maxno)));
			}
			var resLen = inventoryStatusResults.runSearch();
			var q = 0;
			var resultSet = resLen.forEachResult(function(searchResult) {
				q++;

				var currRow = [ searchResult.getValue('name'),
						searchResult.getId(),
						searchResult.getValue('inventoryavailable') ];
				inventoryStatusResultsArray.push(currRow);

				if (q == 4000) {
					var maxno = searchResult.getId();
					getDefaultInventoryStatusList(invtStatus_ID, maxno,
							isSpecOrd);
					return false;
				}
				return true;
			});
		}

	} catch (e) {
		nlapiLogExecution('ERROR',
				'exception in getDefaultInventoryStatusList', e);
	}
	nlapiLogExecution('ERROR', 'inventoryStatusResultsArray',
			inventoryStatusResultsArray);

	return inventoryStatusResultsArray;
}

function isInvStatusFeatureEnabled() {
	var vResult = false;
	try {
		var inventoryStatusFeature = nlapiGetContext().getFeature(
				'inventorystatus');

		if (inventoryStatusFeature != null && inventoryStatusFeature != ''
				&& inventoryStatusFeature != 'null'
				&& inventoryStatusFeature != 'undefined'
				&& inventoryStatusFeature != false) {
			// The Inventory Status feature if provisioned on your account then
			// return true

			vResult = true;

		}
	} catch (e) {
		// The Inventory Status feature if not provisioned on your account then
		// return false
		nlapiLogExecution('ERROR', 'exception in isInvStatusFeatureEnabled', e);

		vResult = false;
	}
	return vResult;
}

/**
 * To get open task details for the given item.
 * 
 */
function getopentaskDetailsforItem(orderid, lineno, item, whLocation) {

	nlapiLogExecution('ERROR', 'orderid,lineno,item,whLocation', orderid + ","
			+ lineno + "," + item + "," + whLocation);
	var opentaskFilters = new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',
			null, 'anyof', orderid));

	if (lineno != null && lineno != '')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_line_no',
				null, 'equalto', lineno));
	if (item != null && item != '')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_sku',
				null, 'anyof', item));

	var opentaskColumns = new Array();

	var itemPickedQty = 0;
	var opentaskResults = nlapiSearchRecord('customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_pickedqtydetails', opentaskFilters,
			opentaskColumns);
	if (opentaskResults != null && opentaskResults != '') {
		itemPickedQty = opentaskResults[0].getValue('custrecord_wmsse_act_qty',
				null, 'sum');
		// nlapiLogExecution('Debug','itemPickedQty',itemPickedQty);
	}

	return itemPickedQty;
}

function getPickedqtydetails(orderid, trantype, whLocation) {

	nlapiLogExecution('ERROR', 'orderid,trantype,whLocation', orderid + ","
			+ trantype + "," + whLocation);

	var result = nlapiLoadSearch('customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_totalqtydetails');

	if (orderid != null && orderid != '')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no',
				null, 'anyof', orderid));

	if (whLocation != null && whLocation != '')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location',
				null, 'anyof', whLocation));

	var alltaskresults = [];
	var resultSet = result.runSearch();
	var resultsPage = resultSet.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) {
		alltaskresults = alltaskresults.concat(resultsPage);
		offset += 1000;
		resultsPage = resultSet.getResults(offset, offset + 1000);
	}

	return alltaskresults;

}

/**
 * To get picked qty details for List of order
 */
function getPickedqtylistdetails(orderid, trantype, whLocation) {

	nlapiLogExecution('ERROR', 'orderid,trantype,whLocation', orderid + ","
			+ trantype + "," + whLocation);

	var result = nlapiLoadSearch('customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_solist_pickedqty');

	if (orderid != null && orderid != '')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no',
				null, 'anyof', orderid));

	if (whLocation != null && whLocation != '')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location',
				null, 'anyof', whLocation));

	var alltaskresults = [];
	var resultSet = result.runSearch();
	var resultsPage = resultSet.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) {
		alltaskresults = alltaskresults.concat(resultsPage);
		offset += 1000;
		resultsPage = resultSet.getResults(offset, offset + 1000);
	}

	return alltaskresults;

}

/**
 * To bind status values in the dropdown
 * 
 * @returns {sOptionsArr}
 */

function getStatusOptions() {
	var sOptionsArr = new Array();
	var col = new Array();
	col[0] = new nlobjSearchColumn('name');
	col[1] = new nlobjSearchColumn('internalId');
	var results = nlapiSearchRecord('customlist_wmsse_status_optionslst', null,
			null, col);
	for (var statusItr = 0; results != null && statusItr < results.length; statusItr++) {
		var res = results[statusItr];
		var listValue = (res.getValue('name'));
		var listID = null;
		if (listValue == 'All') {
			listID = 'All';
		} else if (listValue == 'All Available') {
			listID = 'T'
		} else if (listValue == 'Not Available') {
			listID = 'F';
		} else {

		}
		var row1 = [ listID, listValue ];
		sOptionsArr.push(row1);
	}
	var statusList = getInventoryStatusListForOutBound(-1, null);
	if (statusList != null && statusList != '' && statusList != 'null'
			&& statusList != 'undefined' && statusList != undefined) {
		for (var defstatusItr = 0; statusList != null
				&& defstatusItr < statusList.length; defstatusItr++) {
			var res = statusList[defstatusItr];
			var listValue = (res[0]);
			var listID = (res[1]);
			var row1 = [ listID, listValue ];
			sOptionsArr.push(row1);
		}
	}

	return sOptionsArr;
}

var inventoryResultsArray = null;
function getInventoryStatusListForOutBound(maxno, invtStatus_ID) {

	if (maxno != null && maxno != 'null' && maxno != '' && maxno != undefined
			&& maxno != 'undefined' && maxno == -1) {
		inventoryResultsArray = new Array();
	}

	try {
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		if (inventoryStatusFeature == true) {

			var inventoryStatusResults = nlapiLoadSearch('inventorystatus',
					'customsearch_wmsse_getinvtstatuslst_ob');

			if (maxno != null && maxno != 'null' && maxno != ''
					&& maxno != undefined && maxno != 'undefined'
					&& maxno != -1) {
				inventoryStatusResults.addFilter(new nlobjSearchFilter(
						'internalidnumber', null, 'greaterthan',
						parseInt(maxno)));
			}
			if (invtStatus_ID != null && invtStatus_ID != ''
					&& invtStatus_ID != 'null' && invtStatus_ID != 'undefined') {
				inventoryStatusResults.addFilter(new nlobjSearchFilter(
						'internalid', null, 'anyof', invtStatus_ID));
			}
			var resLen = inventoryStatusResults.runSearch();
			var q = 0;
			var resultSet = resLen.forEachResult(function(searchResult) {
				q++;

				var currRow = [ searchResult.getValue('name'),
						searchResult.getId(),
						searchResult.getValue('inventoryavailable') ];
				inventoryResultsArray.push(currRow);

				if (q == 4000) {
					var maxno = searchResult.getId();
					getInventoryStatusListForOutBound(maxno, invtStatus_ID);
					return false;
				}
				return true;
			});
		}

	} catch (e) {
		nlapiLogExecution('ERROR',
				'exception in getDefaultInventoryStatusList', e);
	}
	nlapiLogExecution('ERROR', 'inventoryResultsArray', inventoryResultsArray);

	return inventoryResultsArray;
}

/**
 * To split the status based on spaces.
 * 
 * @params {strInvtStatusArr}
 * @returns {invt_status}
 */

function getInvtStatusStr(strInvtStatusArr) {
	var invt_status = '';
	if (strInvtStatusArr != null && strInvtStatusArr != undefined
			&& strInvtStatusArr != 'null' && strInvtStatusArr != 'undefined'
			&& strInvtStatusArr != '') {
		invt_status = strInvtStatusArr[0];
		for (var strItr = 1; strItr < strInvtStatusArr.length; strItr++) {
			if (strInvtStatusArr[strItr] != null
					&& strInvtStatusArr[strItr] != undefined
					&& strInvtStatusArr[strItr] != 'null'
					&& strInvtStatusArr[strItr] != 'undefined'
					&& strInvtStatusArr[strItr] != '') {
				invt_status = invt_status + '<br>' + strInvtStatusArr[strItr];
			}
		}

	}
	return invt_status;
}
// function to get inventory balance details
function fnGetInventoryBalanceDetails(whLocation, vIntId, binInternalId) {
	var invfilterStrat = new Array();
	if (whLocation != null && whLocation != '')
		invfilterStrat.push(new nlobjSearchFilter('location', null, 'anyof',
				whLocation));
	if (vIntId != null && vIntId != '')
		invfilterStrat
				.push(new nlobjSearchFilter('item', null, 'anyof', vIntId));
	if (binInternalId != null && binInternalId != '')
		invfilterStrat.push(new nlobjSearchFilter('binnumber', null, 'anyof',
				binInternalId));

	var objBinStatusDetails = nlapiSearchRecord('InventoryBalance',
			'customsearch_wmsse_inv_report_invbalance', invfilterStrat, null);
	return objBinStatusDetails;

}
function getActvieStatusOptions() {
	var sOptionsArr = new Array();
	var col = new Array();
	col[0] = new nlobjSearchColumn('name');
	col[1] = new nlobjSearchColumn('internalId');
	var results = nlapiSearchRecord('customlist_wmsse_status_optionslst', null,
			null, col);
	for (var statusItr = 0; results != null && statusItr < results.length; statusItr++) {
		var res = results[statusItr];
		var listValue = (res.getValue('name'));
		var listID = null;
		if (listValue == 'All') {
			listID = 'All';
		} else if (listValue == 'All Available') {
			listID = 'T'
		} else if (listValue == 'Not Available') {
			listID = 'F';
		} else {

		}
		var row1 = [ listID, listValue ];
		sOptionsArr.push(row1);
	}
	var statusList = getDefaultInventoryStatusList('', -1);
	if (statusList != null && statusList != '' && statusList != 'null'
			&& statusList != 'undefined' && statusList != undefined) {
		for (var defstatusItr = 0; statusList != null
				&& defstatusItr < statusList.length; defstatusItr++) {
			var res = statusList[defstatusItr];
			var listValue = (res[0]);
			var listID = (res[1]);
			var row1 = [ listID, listValue ];
			sOptionsArr.push(row1);
		}
	}

	return sOptionsArr;
}

function funToCheckIsBinEmpty(vBinId, strLocation) {
	var isEmptyBinRes = 'T';

	var filterInvBal = new Array();

	if (vBinId != null && vBinId != '')
		filterInvBal.push(new nlobjSearchFilter('binnumber', null, 'anyof',
				vBinId));
	if (vBinId != null && vBinId != '')
		filterInvBal.push(new nlobjSearchFilter('location', null, 'anyof',
				strLocation));

	var objBinDetails = nlapiSearchRecord('InventoryBalance',
			'customsearch_wmsse_srchres_statuswise', filterInvBal, null);
	if (objBinDetails != null && objBinDetails != '') {
		isEmptyBinRes = 'F';
	}

	return isEmptyBinRes;
}
function getopentaskresultsforIRPosting(poid, containerID, maxNo, item_id,
		itemLineNo) {
	var searchresultsArr = new Array();
	var result = nlapiLoadSearch('customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_postitemreceipt_srch');
	if (poid != null && poid != '')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no',
				null, 'anyof', poid));

	if (containerID != null && containerID != '') {
		result
				.addFilter(new nlobjSearchFilter(
						'custrecord_wmsse_inboundcontainer', null, 'anyof',
						containerID));
	}
	if (maxNo != -1) {
		result.addFilter(new nlobjSearchFilter('internalid', null,
				'greaterthan', parseInt(maxNo)));
	}

	if (item_id != null && item_id != 'null' && item_id != undefined
			&& item_id != '') {
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_sku', null,
				'anyof', item_id));
	}
	if (itemLineNo != null && itemLineNo != 'null' && itemLineNo != undefined
			&& itemLineNo != '') {
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no',
				null, 'equalto', itemLineNo));
	}
	result.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',
			null, 'anyof', [ '@NONE@' ]));
	var resLen = result.runSearch();
	var q = 0;
	var resultSet = resLen.forEachResult(function(searchResult) {
		q++;
		var actQuantity = searchResult.getValue('custrecord_wmsse_act_qty');
		var linenum = searchResult.getValue('custrecord_wmsse_line_no');
		var itemid = searchResult.getValue('custrecord_wmsse_sku');
		var batchno = searchResult.getValue('custrecord_wmsse_batch_num');
		var expiryDate = searchResult.getValue('custrecord_wmsse_expirydate');
		var enterBin = searchResult.getValue('custrecord_wmsse_actendloc');
		var serial = searchResult.getValue('custrecord_wmsse_serial_no');
		var wmsLocation = searchResult
				.getValue('custrecord_wmsse_act_wms_location');
		var vInvStatus_select = searchResult
				.getValue('custrecord_wmsse_inventorystatus');

		var opentaskId = searchResult.getId();
		var serailNum = '';
		if (serial != null && serial != '' && serial != 'null'
				&& serial != 'undefined') {
			var serialArray = new Array();
			serailArray = serial.split(',');
			if (serialArray.length > 1) {
				for (var s = 0; s < serialArray.length; s++) {
					if (s == 0) {
						serailNum = serialArray[s];
					} else {
						serailNum = serailNum + "^" + serialArray[s];
					}
				}
			} else {
				serailNum = serial;
			}
		}
		var currRow = [ linenum, itemid, actQuantity, enterBin, batchno,
				expiryDate, serailNum, opentaskId, wmsLocation,
				vInvStatus_select ];
		searchresultsArr.push(currRow);
		if (q == 4000) {
			getopentaskresultsforIRPosting(poid, containerID, opentaskId,
					item_id, itemLineNo);
			return false;
		}
		return true;
	});

	return searchresultsArr;
}

function getStatusId(strInvStatus) {

	var statusid = '';
	nlapiLogExecution('ERROR', 'strStatus ', strInvStatus);
	var filterInvstatus = new Array();

	if (strInvStatus != null && strInvStatus != '') {
		filterInvstatus.push(new nlobjSearchFilter('name', null, 'is',
				strInvStatus));
		var objstatusdetails = nlapiSearchRecord('Inventorystatus',
				'customsearch_wmsse_inventorystatusvalues', filterInvstatus,
				null);
		if (objstatusdetails != null && objstatusdetails != '') {
			statusid = objstatusdetails[0].getId();
		}
	}

	return statusid;
}

/**
 * To get domain name
 */
function fndomainName() {
	var domainName = '';
	var ctx = nlapiGetContext();
	var getLanguage = ctx.getPreference('LANGUAGE');

	if (getLanguage == 'es_ES' || getLanguage == 'es_AR'
			|| getLanguage == 'fr_FR') {
		domainName = 'NS WMS';// convert via translator
	} else {
		domainName = 'NS WMS';
	}
	nlapiLogExecution('ERROR', 'domainName ', domainName);
	return domainName;

}

/**
 * To get logo
 */
function getLogoimage() {
	var logoimage = 'WMSLogo.svg';
	return logoimage;
}

/**
 * This funtion used to set recovery point for Yield api
 */
function setRecoveryPoint() {
	var state = nlapiSetRecoveryPoint();
	if (state.status == 'SUCCESS')
		return;
	if (state.status == 'RESUME') {
		nlapiLogExecution("ERROR", "Resuming script because of " + state.reason
				+ ".  Size = " + state.size);

	} else if (state.status == 'FAILURE') {
		nlapiLogExecution("ERROR", "Failed to create recovery point. Reason = "
				+ state.reason + " / Size = " + state.size);

	}

}

/**
 * To get Bin location details to pick based on pick strategies
 */
function fnGetPickReportBinDetails(getItemInternalId, strItemGrp, strItemFam,
		getPreferBin, strLocation, strItemDept, strItemClass, strOrderType,
		strvUnits, boolinclIBStageInvFlag, request, schtype, itemType,
		vPickReportNo, vClassification) {
	var context = nlapiGetContext();
	var strMsg = "getItemInternalId : " + getItemInternalId + "<br>"
			+ "strItemGrp : " + strItemGrp + "<br>" + "strItemFam : "
			+ strItemFam + "<br>" + "getPreferBin : " + getPreferBin + "<br>"
			+ "strLocation : " + strLocation + "<br>" + "strItemDept : "
			+ strItemDept + "<br>" + "strItemClass : " + strItemClass + "<br>"
			+ "Classification : " + vClassification + "<br>";
	nlapiLogExecution('ERROR', 'fnGetPickBinDetails', strMsg);
	var vmakeInvAvailFlag = "T";
	var fields = [ 'makeinventoryavailable' ];
	var vLocDetails = nlapiLookupField('location', strLocation, fields);
	vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;

	var vBinLocArr = new Array();
	var vPickZoneArr = new Array();
	var vBinIntIdExcludeArr = new Array();
	var vPickZoneArrCrossDockingTrue = new Array();
	var vPickZoneArrCrossDockingFalse = new Array();
	var filterPref = new Array();
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	var makeInvAvailFlagFromSelect = 'T';
	var vBinLocStatusArr = new Array();
	var getPreferBinId;
	var count = 0;
	var pageCount = 0;
	if (pageCount == null || pageCount == '' || pageCount == 'undefined'
			|| pageCount == 'null' || pageCount == undefined) {
		pageCount = 0;
	}
	var pageIndex = pageCount * 5;

	var stgLocId = new Array();
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('name');
	var BinlocationTypes = new nlapiSearchRecord(
			'customlist_wmsse_bin_loc_type', null, null, cols);

	if (BinlocationTypes != null && BinlocationTypes != ''
			&& BinlocationTypes.length > 0) {
		var strName = 'Stage';
		for (var b = 0; b < BinlocationTypes.length; b++) {
			var tName = BinlocationTypes[b].getValue('name');

			if (tName == strName) {
				stgLocId.push(BinlocationTypes[b].getId());
				break;
			}
		}
	}

	if (getPreferBin != null && getPreferBin != '' && getPreferBin != 'null') {
		filterPref.push(new nlobjSearchFilter('inactive', null, 'is', 'F'));

		filterPref.push(new nlobjSearchFilter('binnumber', null, 'is',
				getPreferBin));

		if (strLocation != null && strLocation != '')
			filterPref.push(new nlobjSearchFilter('location', null, 'anyof',
					strLocation));

		var objPrefBinIdDetails = new nlapiSearchRecord('bin',
				'customsearch_wmsse_binsbypickzones', filterPref, null);

		nlapiLogExecution('ERROR', 'objPrefBinIdDetails', objPrefBinIdDetails);
		if (objPrefBinIdDetails != null && objPrefBinIdDetails != ''
				&& objPrefBinIdDetails.length > 0
				&& objPrefBinIdDetails[0].getValue('internalid') != null
				&& objPrefBinIdDetails[0].getValue('internalid') != ''
				&& getPreferBin != null && getPreferBin != '') {
			var filterPrefInv = new Array();

			if (getItemInternalId != null && getItemInternalId != '')
				filterPrefInv.push(new nlobjSearchFilter('internalid', null,
						'anyof', getItemInternalId));
			if (strLocation != null && strLocation != '')
				filterPrefInv.push(new nlobjSearchFilter('location',
						'binonhand', 'anyof', strLocation));

			filterPrefInv.push(new nlobjSearchFilter('binnumber', 'binonhand',
					'anyof', objPrefBinIdDetails[0].getValue('internalid')));

			var objPrefBinDetails = new nlapiSearchRecord('item',
					'customsearch_wmsse_itemwise_inventory', filterPrefInv,
					null);
			if (objPrefBinDetails != null && objPrefBinDetails != ''
					&& objPrefBinDetails.length > 0) {
				var vOPenTaskPrefPickBinDetails = getOPenTaskPickBinDetails(
						getItemInternalId, objPrefBinIdDetails[0]
								.getValue('internalid'), strLocation,
						objPrefBinDetails[0].getValue('unitstype'),
						objPrefBinDetails[0].getText('stockunit'));
				if (vmakeInvAvailFlag == "T")
					var vPrefBinQtyAvail = objPrefBinDetails[0].getValue(
							'quantityavailable', 'binonhand');
				else
					var vPrefBinQtyAvail = objPrefBinDetails[0].getValue(
							'quantityonhand', 'binonhand');
				var VZone = objPrefBinIdDetails[0]
						.getText('custrecord_wmsse_zone');
				var vOpenPrefBinQty = 0;
				var vopenTaskBinIdArr = "";
				var vopenTaskBinQtyArr = "";
				if (vOPenTaskPrefPickBinDetails != null
						&& vOPenTaskPrefPickBinDetails != ''
						&& vOPenTaskPrefPickBinDetails.length > 0) {
					vopenTaskBinQtyArr = vOPenTaskPrefPickBinDetails[1];
					vOpenPrefBinQty = vopenTaskBinQtyArr[0];
				}
				if (vOpenPrefBinQty == null || vOpenPrefBinQty == ''
						|| vOpenPrefBinQty == 'null'
						|| vOpenPrefBinQty == 'undefined')
					vOpenPrefBinQty = 0;

				nlapiLogExecution('ERROR', 'vPrefBinQtyAvail,vOpenPrefBinQty',
						vPrefBinQtyAvail + "," + vOpenPrefBinQty);
				vPrefBinQtyAvail = parseFloat(vPrefBinQtyAvail)
						- parseFloat(vOpenPrefBinQty);
				if (parseFloat(vPrefBinQtyAvail) > 0) {
					var currRow = [ getPreferBin, vPrefBinQtyAvail,
							objPrefBinIdDetails[0].getValue('internalid'),
							VZone ];
					vBinIntIdExcludeArr.push(objPrefBinIdDetails[0]
							.getValue('internalid'));
					vBinLocArr.push(currRow);
				}

			}
		}
	}

	nlapiLogExecution('Error',
			'Remaining usage after prefer bin details,vBinLocArr', context
					.getRemainingUsage()
					+ "," + vBinLocArr);
	var filters = new Array();
	var columns = new Array();
	if (getItemInternalId != null && getItemInternalId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_item', null,
				'anyof', [ '@NONE@', getItemInternalId ]));
	if (strItemGrp != null && strItemGrp != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemgroup',
				null, 'anyof', [ '@NONE@', strItemGrp ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemgroup',
				null, 'anyof', [ '@NONE@' ]));
	if (strItemFam != null && strItemFam != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemfamily',
				null, 'anyof', [ '@NONE@', strItemFam ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemfamily',
				null, 'anyof', [ '@NONE@' ]));
	if (strLocation != null && strLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_location',
				null, 'anyof', [ '@NONE@', strLocation ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_location',
				null, 'anyof', [ '@NONE@' ]));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

	if (strItemDept != null && strItemDept != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_department',
				null, 'anyof', [ '@NONE@', strItemDept ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_department',
				null, 'anyof', [ '@NONE@' ]));

	if (strItemClass != null && strItemClass != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_class', null,
				'anyof', [ '@NONE@', strItemClass ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_class', null,
				'anyof', [ '@NONE@' ]));

	if (strOrderType != undefined && strOrderType != null
			&& strOrderType != 'null' && strOrderType != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_ordertype',
				null, 'anyof', [ '@NONE@', strOrderType ]));
	if (strvUnits != undefined && strvUnits != null && strvUnits != 'null'
			&& strvUnits != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_units', null,
				'anyof', [ '@NONE@', strvUnits ]));

	if (vClassification != 'undefined' && vClassification != null
			&& vClassification != '' && vClassification != 'null') {
		var columnsclasification = new Array();
		var filtersclasification = new Array();
		columnsclasification[0] = new nlobjSearchColumn('name');
		filtersclasification.push(new nlobjSearchFilter('name', null, 'is',
				vClassification));

		var objclassification = new nlapiSearchRecord(
				'customlist_wmsse_abcvelocity', 'null', filtersclasification,
				columnsclasification);

		if (objclassification != null && objclassification != '') {

			filters.push(new nlobjSearchFilter(
					'custrecord_wmsse_pick_abcvelocity', null, 'anyof', [
							'@NONE@', objclassification[0].getId() ]));
		} else {
			filters.push(new nlobjSearchFilter(
					'custrecord_wmsse_pick_abcvelocity', null, 'anyof',
					[ '@NONE@' ]));
		}
	} else {
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_abcvelocity',
				null, 'anyof', [ '@NONE@' ]));
	}

	var objPickstrategies = new nlapiSearchRecord(
			'customrecord_wmsse_pickstrategies',
			'customsearch_wmsse_get_pickstrategies', filters, columns);
	if (objPickstrategies != null && objPickstrategies != ''
			&& objPickstrategies.length > 0) {
		if (context.getRemainingUsage() <= 200) {
			var singleorderscheduler;
			if (schtype == "SingleOrder")
				singleorderscheduler = Invokesingleordersch(request);
			else if (schtype == "SingleOrderscheduler")
				singleorderscheduler = Invokesingleorderschyield(request);
			else if (schtype == "MultiOrder")
				singleorderscheduler = Invokingmultiordersch(request);
			else if (schtype == "MultiOrderscheduler")
				singleorderscheduler = Invokingmultiorderschyield(request);

			if (singleorderscheduler == 'scheduleScriptinvoked') {
				return 'scheduleScriptinvoked';
			}

		}

		for (var i = 0; i < objPickstrategies.length; i++) {
			nlapiLogExecution('ERROR', 'objPickstrategies',
					objPickstrategies.length);
			var strPickZone = objPickstrategies[i]
					.getValue('custrecord_wmsse_pick_zone');
			var inclIBStageInvFlag = objPickstrategies[i]
					.getValue('custrecord_wmsse_pick_from_stageloc');
			var strInvStatus = objPickstrategies[i]
					.getText('custrecord_wmsse_invstatus');

			// This is to restrict the display of stage bins at inventroy to bin
			// scan page
			if (boolinclIBStageInvFlag != null && boolinclIBStageInvFlag != ''
					&& boolinclIBStageInvFlag != 'null'
					&& boolinclIBStageInvFlag != 'undefined'
					&& boolinclIBStageInvFlag == 'F') {
				inclIBStageInvFlag = 'F';
			}
			// ends

			if (strPickZone == null || strPickZone == '')
				strPickZone = "-None-";
			var strPickZoneText = objPickstrategies[i]
					.getText('custrecord_wmsse_pick_zone');

			if (strPickZone != null && strPickZone != '') {
				vPickZoneArr.push(strPickZone);
				if (inclIBStageInvFlag == 'T') {
					vPickZoneArrCrossDockingTrue.push(strPickZone);
				} else {
					vPickZoneArrCrossDockingFalse.push(strPickZone);
				}
			}
		}

		var objBinByZoneDetails = new Array();
		// This function is to get the bins storage+stage bins
		if (vPickZoneArrCrossDockingTrue != null
				&& vPickZoneArrCrossDockingTrue != ''
				&& vPickZoneArrCrossDockingTrue != 'null'
				&& vPickZoneArrCrossDockingTrue != 'undefined'
				&& vPickZoneArrCrossDockingTrue.length > 0) {
			vPickZoneArrCrossDockingTrue = removeDuplicateElement(vPickZoneArrCrossDockingTrue);
			nlapiLogExecution('Error', 'vPickZoneArrCrossDockingTrue',
					vPickZoneArrCrossDockingTrue);
			// This loop is to separate the null zones
			var zonesArr = new Array();
			var isNoneZoneExists = 'F';
			for (var j1 = 0; j1 < vPickZoneArrCrossDockingTrue.length; j1++) {
				var tZone = vPickZoneArrCrossDockingTrue[j1];
				if (tZone != '-None-') {
					zonesArr.push(tZone);
				} else {
					isNoneZoneExists = 'T';
				}
			}

			var maxno = -1;
			objBinByZoneDetails = fnGetPickReportBinsbyZonesAlongWithStage(
					zonesArr, strLocation, maxno, objBinByZoneDetails,
					isNoneZoneExists, request, schtype);
			nlapiLogExecution('ERROR', 'objBinByZoneDetails,zonesArr',
					objBinByZoneDetails + "," + zonesArr);
			if (objBinByZoneDetails == 'scheduleScriptinvoked') {

				return 'scheduleScriptinvoked';
			}
		}
		// This function is to get the storage bins
		if (vPickZoneArrCrossDockingFalse != null
				&& vPickZoneArrCrossDockingFalse != ''
				&& vPickZoneArrCrossDockingFalse != 'null'
				&& vPickZoneArrCrossDockingFalse != 'undefined'
				&& vPickZoneArrCrossDockingFalse.length > 0) {
			vPickZoneArrCrossDockingFalse = removeDuplicateElement(vPickZoneArrCrossDockingFalse);
			nlapiLogExecution('ERROR', 'vPickZoneArrCrossDockingFalse',
					vPickZoneArrCrossDockingFalse);
			// This loop is to separate the null zones
			var zonesArray = new Array();
			var isNoneZoneExists = 'F';
			for (var j1 = 0; j1 < vPickZoneArrCrossDockingFalse.length; j1++) {
				var tZone = vPickZoneArrCrossDockingFalse[j1];
				if (tZone != '-None-') {
					zonesArray.push(tZone);
				} else {
					isNoneZoneExists = 'T';
				}
			}

			var maxno = -1;
			objBinByZoneDetails = fnGetPickReportBinsbyZones(zonesArray,
					strLocation, maxno, objBinByZoneDetails, isNoneZoneExists,
					request);

			if (objBinByZoneDetails == 'scheduleScriptinvoked') {

				return 'scheduleScriptinvoked';
			}

		}
		var vBinIdArr = new Array();
		var vBinArr = new Array();

		if (objBinByZoneDetails != null && objBinByZoneDetails != ''
				&& objBinByZoneDetails.length > 0) {
			nlapiLogExecution('ERROR', 'objBinByZoneDetails',
					objBinByZoneDetails.length);
			for (var j = 0; j < objBinByZoneDetails.length; j++) {
				vBinIdArr.push(objBinByZoneDetails[j].getValue('internalid'));
				vBinArr.push(objBinByZoneDetails[j].getValue('binnumber'));

			}
		}

		nlapiLogExecution('Error',
				'Remaining usage after non storage bin details', context
						.getRemainingUsage());

		if (context.getRemainingUsage() <= 200) {
			var singleorderscheduler;
			if (schtype == "SingleOrder")
				singleorderscheduler = Invokesingleordersch(request);
			else if (schtype == "SingleOrderscheduler")
				singleorderscheduler = Invokesingleorderschyield(request);
			else if (schtype == "MultiOrder")
				singleorderscheduler = Invokingmultiordersch(request);
			else if (schtype == "MultiOrderscheduler")
				singleorderscheduler = Invokingmultiorderschyield(request);

			if (singleorderscheduler == 'scheduleScriptinvoked') {
				return 'scheduleScriptinvoked';
			}
		}

		var filterStrat = new Array();
		// Inventorystatus Feature is enabled

		nlapiLogExecution('Error', 'strInvStatus', strInvStatus);
		if (inventoryStatusFeature == true) {

			nlapiLogExecution('Error', 'makeInvAvailFlagFromSelect',
					makeInvAvailFlagFromSelect);
			var objBinDetails = new Array();

			var searchName = 'customsearch_wmsse_invtbalance_invt_item';
			if (itemType == "inventoryitem" || itemType == "assemblyitem") {
				searchName = 'customsearch_wmsse_invtbalance_invt_item';
			} else if (itemType == "serializedinventoryitem"
					|| itemType == "serializedassemblyitem") {
				searchName = 'customsearch_wmsse_invtbalance_serialsrh';

			}
			// fetching 4k records only, because columns are in group
			var resultDetails = new nlapiLoadSearch('InventoryBalance',
					searchName);

			if (strLocation != null && strLocation != '')
				resultDetails.addFilter(new nlobjSearchFilter('location', null,
						'anyof', strLocation));
			if (getItemInternalId != null && getItemInternalId != '')
				resultDetails.addFilter(new nlobjSearchFilter('internalid',
						'item', 'anyof', getItemInternalId));
			if (vBinIdArr != null && vBinIdArr != '')
				resultDetails.addFilter(new nlobjSearchFilter('binnumber',
						null, 'anyof', vBinIdArr));
			if (vBinIntIdExcludeArr != null && vBinIntIdExcludeArr != '')
				resultDetails.addFilter(new nlobjSearchFilter('binnumber',
						null, 'noneof', vBinIntIdExcludeArr));
			// if(vNonStorageBinIdArr!= null && vNonStorageBinIdArr!= '')
			// resultDetails.addFilter(new nlobjSearchFilter('binnumber',null,
			// 'noneof', vNonStorageBinIdArr));
			if (makeInvAvailFlagFromSelect != null
					&& makeInvAvailFlagFromSelect != ''
					&& makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != 'undefined'
					&& makeInvAvailFlagFromSelect != undefined) {
				if (makeInvAvailFlagFromSelect == 'T'
						|| makeInvAvailFlagFromSelect == 'F') {
					resultDetails.addFilter(new nlobjSearchFilter(
							'inventoryavailable', 'inventorystatus', 'is',
							makeInvAvailFlagFromSelect));
				} else {
					if (makeInvAvailFlagFromSelect != 'All') {
						resultDetails.addFilter(new nlobjSearchFilter('status',
								null, 'anyof', makeInvAvailFlagFromSelect));
					}

				}

			}

			var resLenDetails = resultDetails.runSearch();

			var resultsPage = resLenDetails.getResults(0, 1000);
			var offset = 0;
			while (!!resultsPage && resultsPage.length > 0) {
				objBinDetails = objBinDetails.concat(resultsPage);
				offset += 1000;
				resultsPage = resLenDetails.getResults(offset, offset + 1000);
			}

			if (objBinDetails != null && objBinDetails != ''
					&& objBinDetails.length > 0) {
				nlapiLogExecution('Error', 'InventoryBalance objBinDetails',
						objBinDetails.length);

				var vValidBinIdArr = new Array();
				var vValidBinTextArr = new Array();
				var vValidBinAvailQtyArr = new Array();
				var vValidBinStatusArr = new Array();
				var vValidBinStatusIdArr = new Array();
				var vValidBinId = '';
				var vValidBin = '';
				var vBinQtyAvail = '';
				var vBinStatus = '';
				var vBinStatusId = '';

				for (var invIterator = 0; invIterator < objBinDetails.length
						&& vBinLocArr.length < 5; invIterator++) {
					if (itemType == "inventoryitem"
							|| itemType == "assemblyitem") {
						vValidBinId = objBinDetails[invIterator]
								.getValue('binnumber');
						vValidBin = objBinDetails[invIterator]
								.getText('binnumber');
						vBinQtyAvail = objBinDetails[invIterator]
								.getValue('available');
						vBinStatus = objBinDetails[invIterator]
								.getText('status');
						vBinStatusId = objBinDetails[invIterator]
								.getValue('status');
					} else {
						vValidBinId = objBinDetails[invIterator].getValue(
								'binnumber', null, 'group');
						vValidBin = objBinDetails[invIterator].getText(
								'binnumber', null, 'group');
						vBinQtyAvail = objBinDetails[invIterator].getValue(
								'available', null, 'sum');
						vBinStatus = objBinDetails[invIterator].getText(
								'status', null, 'group');
						vBinStatusId = objBinDetails[invIterator].getValue(
								'status', null, 'group');
					}

					var isStatusBinded = 'F';

					for (var binItr = 0; binItr < vBinLocStatusArr.length; binItr++) {
						var row = vBinLocStatusArr[binItr];

						if (vValidBinId == row[0] && vBinStatusId == row[1]) {
							isStatusBinded = 'T';
							break;
						}
					}
					if (isStatusBinded == 'T') {
						continue;
					}
					vValidBinIdArr.push(vValidBinId);
					vValidBinTextArr.push(vValidBin);
					vValidBinAvailQtyArr.push(vBinQtyAvail);
					vValidBinStatusArr.push(vBinStatus);
					vValidBinStatusIdArr.push(vBinStatusId);

				}
				var objBinwithSeq = null;
				if (vValidBinIdArr != null && vValidBinIdArr != ''
						&& inclIBStageInvFlag == 'T') {

					var result = nlapiLoadSearch('bin',
							'customsearch_wmsse_binsbypickzonenodir');
					result.addFilter(new nlobjSearchFilter('internalid', null,
							'anyof', vValidBinIdArr));

					if (strLocation != null && strLocation != '')
						result.addFilter(new nlobjSearchFilter('location',
								null, 'anyof', strLocation));

					result.addFilter(new nlobjSearchFilter('inactive', null,
							'is', 'F'));

					var objBinwithSeq = new Array();
					var resLen = result.runSearch();
					var q = 0;
					var resultSet = resLen
							.forEachResult(function(searchResult) {
								if ((searchResult
										.getValue('custrecord_wmsse_bin_loc_type') == ''
										|| searchResult
												.getValue('custrecord_wmsse_bin_loc_type') == 'null' || searchResult
										.getValue('custrecord_wmsse_bin_loc_type') == null)
										|| (stgLocId
												.indexOf(searchResult
														.getValue('custrecord_wmsse_bin_loc_type') != -1) && (searchResult
												.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
									q++;
									objBinwithSeq.push(searchResult);
								}
								if (q == 4000) {
									return false;
								}
								return true; // return true to keep iterating
							});

				} else if (vValidBinIdArr != null && vValidBinIdArr != ''
						&& inclIBStageInvFlag != 'T') {

					var result = nlapiLoadSearch('bin',
							'customsearch_wmsse_binsbypickzones');

					result.addFilter(new nlobjSearchFilter('internalid', null,
							'anyof', vValidBinIdArr));

					if (strLocation != null && strLocation != '')
						result.addFilter(new nlobjSearchFilter('location',
								null, 'anyof', strLocation));

					result.addFilter(new nlobjSearchFilter('inactive', null,
							'is', 'F'));

					var objBinwithSeq = new Array();
					var resLen = result.runSearch();
					var q = 0;
					var resultSet = resLen
							.forEachResult(function(searchResult) {
								q++;
								objBinwithSeq.push(searchResult);
								if (q == 4000) {
									return false;
								}
								return true; // return true to keep iterating
							});
					nlapiLogExecution('ERROR', 'objBinwithSeq', objBinwithSeq);

				}

				if (context.getRemainingUsage() <= 200) {
					var singleorderscheduler;
					if (schtype == "SingleOrder")
						singleorderscheduler = Invokesingleordersch(request);
					else if (schtype == "SingleOrderscheduler")
						singleorderscheduler = Invokesingleorderschyield(request);
					else if (schtype == "MultiOrder")
						singleorderscheduler = Invokingmultiordersch(request);
					else if (schtype == "MultiOrderscheduler")
						singleorderscheduler = Invokingmultiorderschyield(request);

					if (singleorderscheduler == 'scheduleScriptinvoked') {
						return 'scheduleScriptinvoked';
					}
				}
				var strPickZone = strPickZoneText;
				if (objBinwithSeq != null && objBinwithSeq != ''
						&& objBinwithSeq.length > 0) {
					var vOPenTaskPickBinDetails = getOPenTaskPickBinDetails(
							getItemInternalId, vValidBinIdArr, strLocation,
							null, null);
					var openTaskBinIdArr = "";
					var openTaskBinQtyArr = "";
					var openTaskBinStatusArr = new Array();
					if (vOPenTaskPickBinDetails != null
							&& vOPenTaskPickBinDetails != ''
							&& vOPenTaskPickBinDetails.length > 0) {
						openTaskBinIdArr = vOPenTaskPickBinDetails[0];
						openTaskBinQtyArr = vOPenTaskPickBinDetails[1];
						openTaskBinStatusArr = vOPenTaskPickBinDetails[3];
					}

					for (var objItr = 0; objItr < objBinwithSeq.length
							&& vBinLocArr.length < 5; objItr++) {
						var vValidBinId = objBinwithSeq[objItr]
								.getValue('internalid');
						if (strPickZone == null || strPickZone == ""
								|| strPickZone == "null") {
							strPickZoneText = objBinwithSeq[objItr]
									.getText('custrecord_wmsse_zone');

						}
						for (var binItr = 0; binItr < vValidBinIdArr.length; binItr++) {
							var bin = vValidBinIdArr[binItr];
							var status = vValidBinStatusIdArr[binItr];
							var vValidBinStatus = vValidBinStatusArr[binItr];
							var vValidBinStatusId = vValidBinStatusIdArr[binItr];

							if (vValidBinId != null && vValidBinId != ''
									&& vValidBinId == bin) {
								if (vValidBinIdArr.indexOf(vValidBinId) != -1) {
									var vValidBin = vValidBinTextArr[binItr];
									var vBinQtyAvail = vValidBinAvailQtyArr[binItr];

									var vValidBinStatus = vValidBinStatusArr[binItr];
									var vOpenBinQty = 0;
									if (openTaskBinIdArr != null
											&& openTaskBinIdArr != "") {
										if (openTaskBinIdArr
												.indexOf(vValidBinId) != -1) {

											for (var invItr = 0; invItr < openTaskBinStatusArr.length; invItr++) {
												if (vValidBinStatusId == openTaskBinStatusArr[invItr]
														&& bin == openTaskBinIdArr[invItr]) {

													vOpenBinQty = openTaskBinQtyArr[invItr];
													break;
												}
											}
										}
									}

									if (vOpenBinQty == null
											|| vOpenBinQty == ''
											|| vOpenBinQty == 'null'
											|| vOpenBinQty == 'undefined')
										vOpenBinQty = 0;
									nlapiLogExecution('Error',
											'vBinQtyAvail,vOpenBinQty',
											vBinQtyAvail + "," + vOpenBinQty);
									vBinQtyAvail = parseFloat(vBinQtyAvail)
											- parseFloat(vOpenBinQty);
									if (parseFloat(vBinQtyAvail) > 0) {

										if (vValidBin != getPreferBin
												&& vValidBinId != getPreferBinId) {
											count = count + 1;

											if (count > pageIndex) {
												var currRow = [ vValidBin,
														vBinQtyAvail,
														vValidBinId,
														strPickZoneText ];
												// vBinIntIdExcludeArr.push(vValidBinId);
												vBinLocArr.push(currRow);
												var currRow1 = [ vValidBinId,
														vValidBinStatusId ];
												vBinLocStatusArr.push(currRow1);
											} else {
												var currRow = [ vValidBinId,
														vValidBinStatusId ];
												vBinLocStatusArr.push(currRow);
											}
										}
									}

								}
							}

							if (vBinLocArr.length >= 5)
								break;

						}
					}
				}

			}
			objBinDetails = null;

		}

		else {
			var filterStrat = new Array();

			if (getItemInternalId != null && getItemInternalId != '')
				filterStrat.push(new nlobjSearchFilter('internalid', null,
						'anyof', getItemInternalId));
			if (strLocation != null && strLocation != '')
				filterStrat.push(new nlobjSearchFilter('location', 'binonhand',
						'anyof', strLocation));
			if (vBinIdArr != null && vBinIdArr != '')
				filterStrat.push(new nlobjSearchFilter('binnumber',
						'binonhand', 'anyof', vBinIdArr));
			if (vBinIntIdExcludeArr != null && vBinIntIdExcludeArr != '')
				filterStrat.push(new nlobjSearchFilter('binnumber',
						'binonhand', 'noneof', vBinIntIdExcludeArr));

			var objBinDetails = new nlapiSearchRecord('item',
					'customsearch_wmsse_itemwise_inventory', filterStrat, null);
			if (objBinDetails != null && objBinDetails != ''
					&& objBinDetails.length > 0) {
				nlapiLogExecution('Error',
						'Remaining usage in item,objBinDetails', context
								.getRemainingUsage()
								+ "," + objBinDetails.length);

				var vValidBinIdArr = new Array();
				var vValidBinTextArr = new Array();
				var vValidBinAvailQtyArr = new Array();

				for (var j = 0; j < objBinDetails.length; j++) {
					var vValidBinId = objBinDetails[j].getValue('binnumber',
							'binonhand');
					var vValidBin = objBinDetails[j].getText('binnumber',
							'binonhand');
					if (vmakeInvAvailFlag == "T")
						var vBinQtyAvail = objBinDetails[j].getValue(
								'quantityavailable', 'binonhand');
					else
						var vBinQtyAvail = objBinDetails[j].getValue(
								'quantityonhand', 'binonhand');
					vValidBinIdArr.push(vValidBinId);
					vValidBinTextArr.push(vValidBin);
					vValidBinAvailQtyArr.push(vBinQtyAvail);

				}
				var objBinwithSeq = null;
				if (vValidBinIdArr != null && vValidBinIdArr != '') {

					var filterbinSeq = new Array();

					filterbinSeq.push(new nlobjSearchFilter('inactive', null,
							'is', 'F'));
					filterbinSeq.push(new nlobjSearchFilter('internalid', null,
							'anyof', vValidBinIdArr));

					if (strLocation != null && strLocation != '')
						filterStrat.push(new nlobjSearchFilter('location',
								null, 'anyof', strLocation));

					objBinwithSeq = new nlapiSearchRecord('bin',
							'customsearch_wmsse_binsbypickzones_stage',
							filterbinSeq, null);

					nlapiLogExecution('ERROR', 'objBinwithSeq', objBinwithSeq);

				}

				if (objBinwithSeq != null && objBinwithSeq != ''
						&& objBinwithSeq.length > 0) {

					if (context.getRemainingUsage() <= 200) {
						var singleorderscheduler;
						if (schtype == "SingleOrder")
							singleorderscheduler = Invokesingleordersch(request);
						else if (schtype == "SingleOrderscheduler")
							singleorderscheduler = Invokesingleorderschyield(request);
						else if (schtype == "MultiOrder")
							singleorderscheduler = Invokingmultiordersch(request);
						else if (schtype == "MultiOrderscheduler")
							singleorderscheduler = Invokingmultiorderschyield(request);

						if (singleorderscheduler == 'scheduleScriptinvoked') {
							return 'scheduleScriptinvoked';
						}
					}

					var vOPenTaskPickBinDetails = getOPenTaskPickBinDetails(
							getItemInternalId, vValidBinIdArr, strLocation,
							objBinDetails[0].getValue('unitstype'),
							objBinDetails[0].getText('stockunit'));
					var openTaskBinIdArr = "";
					var openTaskBinQtyArr = "";
					if (vOPenTaskPickBinDetails != null
							&& vOPenTaskPickBinDetails != ''
							&& vOPenTaskPickBinDetails.length > 0) {
						openTaskBinIdArr = vOPenTaskPickBinDetails[0];
						openTaskBinQtyArr = vOPenTaskPickBinDetails[1];
					}
					for (var l = 0; l < objBinwithSeq.length; l++) {
						var vValidBinId = objBinwithSeq[l]
								.getValue('internalid');

						var strPickZoneText = objBinwithSeq[l]
								.getText('custrecord_wmsse_zone');

						if (vValidBinId != null && vValidBinId != '') {
							if (vValidBinIdArr.indexOf(vValidBinId) != -1) {
								var vValidBin = vValidBinTextArr[vValidBinIdArr
										.indexOf(vValidBinId)];
								var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinIdArr
										.indexOf(vValidBinId)];
								var vOpenBinQty = 0;
								if (openTaskBinIdArr != null
										&& openTaskBinIdArr != "") {
									if (openTaskBinIdArr.indexOf(vValidBinId) != -1) {
										vOpenBinQty = openTaskBinQtyArr[openTaskBinIdArr
												.indexOf(vValidBinId)];
									}
								}
								if (vOpenBinQty == null || vOpenBinQty == ''
										|| vOpenBinQty == 'null'
										|| vOpenBinQty == 'undefined')
									vOpenBinQty = 0;
								nlapiLogExecution('ERROR',
										'vBinQtyAvail,vOpenBinQty',
										vBinQtyAvail + "," + vOpenBinQty);
								vBinQtyAvail = parseFloat(vBinQtyAvail)
										- parseFloat(vOpenBinQty);
								if (parseFloat(vBinQtyAvail) > 0) {
									if (vValidBin != getPreferBin) {
										var currRow = [ vValidBin,
												vBinQtyAvail, vValidBinId,
												strPickZoneText ];
										vBinIntIdExcludeArr.push(vValidBinId);
										vBinLocArr.push(currRow);
									}
								}

							}
						}
						if (vBinLocArr.length >= 5) {
							break;
						}
					}
				}

			}
			objBinDetails = null;
		}

	}
	objPickstrategies = null;
	filters = null;
	columns = null;
	return vBinLocArr;
}

/**
 * To get Bin location details to pick based on pick strategies
 */

function fnGetPickReportBinDetailsLot(getItemInternalId, strItemGrp,
		strItemFam, getPreferBin, strLocation, strItemDept, strItemClass,
		strOrderType, strvUnits, boolinclIBStageInvFlag, request, schtype,
		vItemType, AllowAllLots, vPickReportNo, vClassification) {
	var context = nlapiGetContext();
	var strMsg = "getItemInternalId : " + getItemInternalId + "<br>"
			+ "strItemGrp : " + strItemGrp + "<br>" + "strItemFam : "
			+ strItemFam + "<br>" + "getPreferBin : " + getPreferBin + "<br>"
			+ "strLocation : " + strLocation + "<br>" + "strItemDept : "
			+ strItemDept + "<br>" + "strItemClass : " + strItemClass + "<br>"
			+ "strOrderType : " + strOrderType + "<br>" + "strvUnits : "
			+ strvUnits + "<br>" + "Classification :" + vClassification
			+ "<br>";

	nlapiLogExecution('ERROR', 'fnGetPickReportBinDetailsLot', strMsg);
	var vmakeInvAvailFlag = "T";
	var fields = [ 'makeinventoryavailable' ];
	var vLocDetails = nlapiLookupField('location', strLocation, fields);
	vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;

	if (AllowAllLots == '' || AllowAllLots == 'null' || AllowAllLots == null
			|| AllowAllLots == undefined) {
		AllowAllLots = 'F';
	}
	var vBinLocArr = new Array();
	var vPickZoneArr = new Array();
	var vValidZoneArr = new Array();
	var filterPref = new Array();
	var vIsLotItem = 'F';
	var vPrefBinQtyAvailArr = new Array();
	var vPrefBinInvNumArr = new Array();
	var vPrefBinInvNumIDArr = new Array();
	var vPrefBinQtyAvailArr = new Array();
	var VZoneArr = new Array();
	var vBinIntIdExcludeArr = new Array();
	var vPickZoneArrCrossDockingTrue = new Array();
	var vPickZoneArrCrossDockingFalse = new Array();
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	var makeInvAvailFlagFromSelect = 'T';
	var bindedBinStatusArr = new Array();
	var getPreferBinId;
	var count = 0;
	var pageCount = 0;
	if (pageCount == null || pageCount == '' || pageCount == 'undefined'
			|| pageCount == 'null' || pageCount == undefined) {
		pageCount = 0;
	}
	var pageIndex = pageCount * 5;

	var stgLocId = new Array();
	var cols = new Array();
	cols[0] = new nlobjSearchColumn('name');
	var BinlocationTypes = new nlapiSearchRecord(
			'customlist_wmsse_bin_loc_type', null, null, cols);

	if (BinlocationTypes != null && BinlocationTypes != ''
			&& BinlocationTypes.length > 0) {
		var strName = 'Stage';
		for (var b = 0; b < BinlocationTypes.length; b++) {
			var tName = BinlocationTypes[b].getValue('name');

			if (tName == strName) {
				stgLocId.push(BinlocationTypes[b].getId());
				break;
			}
		}
	}
	// Case # 201413255 start
	var systemRule_AllowExpiredItems = ' ';
	systemRule_AllowExpiredItems = getSystemRuleValue(
			'Allow picking of expired items?', strLocation);
	nlapiLogExecution("Error", "systemRule_AllowExpiredItems",
			systemRule_AllowExpiredItems);
	// Case # 201413255 end
	if (getPreferBin != null && getPreferBin != '' && getPreferBin != 'null') {
		filterPref.push(new nlobjSearchFilter('inactive', null, 'is', 'F'));
		filterPref.push(new nlobjSearchFilter('binnumber', null, 'is',
				getPreferBin));

		if (strLocation != null && strLocation != '')
			filterPref.push(new nlobjSearchFilter('location', null, 'anyof',
					strLocation));

		var objPrefBinIdDetails = new nlapiSearchRecord('bin',
				'customsearch_wmsse_binsbypickzones', filterPref, null);

		if (objPrefBinIdDetails != null && objPrefBinIdDetails != ''
				&& objPrefBinIdDetails.length > 0
				&& objPrefBinIdDetails[0].getValue('internalid') != null
				&& objPrefBinIdDetails[0].getValue('internalid') != '') {

			var filterPrefInv = new Array();

			if (getItemInternalId != null && getItemInternalId != '')
				filterPrefInv.push(new nlobjSearchFilter('internalid', null,
						'anyof', getItemInternalId));
			if (strLocation != null && strLocation != '')
				filterPrefInv.push(new nlobjSearchFilter('location',
						'inventoryNumberBinOnHand', 'anyof', strLocation));

			filterPrefInv.push(new nlobjSearchFilter('binnumber',
					'inventoryNumberBinOnHand', 'anyof', objPrefBinIdDetails[0]
							.getValue('internalid')));

			var objPrefBinDetails = new nlapiSearchRecord('item',
					'customsearch_wmsse_itemwise_lots', filterPrefInv, null);
			if (objPrefBinDetails != null && objPrefBinDetails != ''
					&& objPrefBinDetails.length > 0) {
				// case # 201412960 start
				for (var l1 = 0; l1 < objPrefBinDetails.length; l1++) {
					if (vmakeInvAvailFlag == "T")
						var vPrefBinQtyAvail = objPrefBinDetails[l1]
								.getValue('quantityavailable',
										'inventoryNumberBinOnHand');
					else
						var vPrefBinQtyAvail = objPrefBinDetails[l1].getValue(
								'quantityonhand', 'inventoryNumberBinOnHand');
					var vPrefBinInvNum = objPrefBinDetails[l1].getText(
							'inventorynumber', 'inventoryNumberBinOnHand');
					var vPrefBinInvNumID = objPrefBinDetails[l1].getValue(
							'inventorynumber', 'inventoryNumberBinOnHand');
					vIsLotItem = objPrefBinDetails[l1].getValue('islotitem');
					var VZone = objPrefBinIdDetails[0]
							.getText('custrecord_wmsse_zone');
					vPrefBinQtyAvailArr.push(vPrefBinQtyAvail);
					vPrefBinInvNumArr.push(vPrefBinInvNum);
					vPrefBinInvNumIDArr.push(vPrefBinInvNumID);
					VZoneArr.push(VZone);
				}
				var vLotExpDate = "";
				var vfiltersExp = new Array();
				if (getItemInternalId != null && getItemInternalId != "") {
					vfiltersExp.push(new nlobjSearchFilter('internalid', null,
							'anyof', getItemInternalId));
				}
				if (strLocation != null && strLocation != ''
						&& strLocation != 'null')
					vfiltersExp.push(new nlobjSearchFilter('location',
							'inventorynumber', 'anyof', strLocation));

				if (vPrefBinInvNumIDArr != null && vPrefBinInvNumIDArr != ''
						&& vPrefBinInvNumIDArr != 'null')
					vfiltersExp.push(new nlobjSearchFilter('internalid',
							'inventorynumber', 'anyof', vPrefBinInvNumIDArr));

				// Case # 201413255 start
				if ((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
						&& (AllowAllLots == 'F')) {
					nlapiLogExecution("Error", "systemRule_AllowExpiredItems",
							systemRule_AllowExpiredItems);
					// vfiltersExp.push(new
					// nlobjSearchFilter('expirationdate','inventorynumber',
					// 'onorafter', DateStamp()));
					vfiltersExp
							.push(new nlobjSearchFilter('formuladate', null,
									'onorafter', DateStamp())
									.setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
					// vfiltersExp[3].setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))");
				}
				// Case # 201413255 end

				var vcolumnsExp = new Array();
				var vsearchresultsExp = nlapiSearchRecord('item',
						'customsearch_wmsse_expdate_lots', vfiltersExp,
						vcolumnsExp);
				var vPrefBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
						getItemInternalId, objPrefBinIdDetails[0]
								.getValue('internalid'), strLocation,
						objPrefBinDetails[0].getValue('unitstype'),
						objPrefBinDetails[0].getText('stockunit'));
				var vPrefBinOpenTaskLotArr = "";
				var vPrefBinOpenTaskExpDateArr = "";
				var vPrefBinOpenTaskBinIdArr = "";
				var vPrefBinOpenTaskBinQtyArr = "";
				if (vPrefBinOpenTaskDetails != null
						&& vPrefBinOpenTaskDetails != ''
						&& vPrefBinOpenTaskDetails.length > 0) {
					vPrefBinOpenTaskBinIdArr = vPrefBinOpenTaskDetails[0];
					vPrefBinOpenTaskBinQtyArr = vPrefBinOpenTaskDetails[1];
					vPrefBinOpenTaskLotArr = vPrefBinOpenTaskDetails[3];
					vPrefBinOpenTaskExpDateArr = vPrefBinOpenTaskDetails[4];
				}
				if (vsearchresultsExp != null && vsearchresultsExp != '') {
					for (var s1 = 0; s1 < vsearchresultsExp.length; s1++) {

						if (vsearchresultsExp[s1].getValue('inventorynumber',
								'inventorynumber') != null
								&& vsearchresultsExp[s1].getValue(
										'inventorynumber', 'inventorynumber') != '') {
							// if(vPrefBinInvNum ==
							// vsearchresultsExp[s1].getValue('inventorynumber','inventorynumber'))
							if (vPrefBinInvNumArr.indexOf(vsearchresultsExp[s1]
									.getValue('inventorynumber',
											'inventorynumber')) != -1) {
								vLotExpDate = vsearchresultsExp[s1].getValue(
										'expirationdate', 'inventorynumber');
								var vnPrefBinQtyAvail = vPrefBinQtyAvailArr[vPrefBinInvNumArr
										.indexOf(vsearchresultsExp[s1]
												.getValue('inventorynumber',
														'inventorynumber'))];
								var vnPrefBinInvNum = vPrefBinInvNumArr[vPrefBinInvNumArr
										.indexOf(vsearchresultsExp[s1]
												.getValue('inventorynumber',
														'inventorynumber'))];
								var VnZone = VZoneArr[vPrefBinInvNumArr
										.indexOf(vsearchresultsExp[s1]
												.getValue('inventorynumber',
														'inventorynumber'))];

								var vOpenPrefLotQty = 0;

								if (vPrefBinOpenTaskBinIdArr != null
										&& vPrefBinOpenTaskBinIdArr != '') {
									for (var m1 = 0; m1 < vPrefBinOpenTaskBinIdArr.length; m1++) {
										var vOpenBinId = vPrefBinOpenTaskBinIdArr[m1];
										if (objPrefBinIdDetails[0]
												.getValue('internalid') == vOpenBinId) {
											var vOpenLot = vPrefBinOpenTaskDetails[3][m1];
											if (vnPrefBinInvNum == vOpenLot) {
												vOpenPrefLotQty = vPrefBinOpenTaskDetails[1][m1];
												break;
											}
										}
									}
								}
								nlapiLogExecution('ERROR',
										'vnPrefBinQtyAvail,vOpenPrefLotQty',
										vnPrefBinQtyAvail + ","
												+ vOpenPrefLotQty);

								if (vOpenPrefLotQty == null
										|| vOpenPrefLotQty == 'null'
										|| vOpenPrefLotQty == ''
										|| vOpenPrefLotQty == 'undefined')
									vOpenPrefLotQty = 0;

								vnPrefBinQtyAvail = parseFloat(vnPrefBinQtyAvail)
										- parseFloat(vOpenPrefLotQty);
								if (parseFloat(vnPrefBinQtyAvail) > 0) {
									var currRow = [
											getPreferBin,
											vnPrefBinQtyAvail,
											objPrefBinIdDetails[0]
													.getValue('internalid'),
											vnPrefBinInvNum, vLotExpDate,
											VnZone ];
									vBinIntIdExcludeArr
											.push(objPrefBinIdDetails[0]
													.getValue('internalid'));
									vBinLocArr.push(currRow);
								}
							}
						}
					}
				}

				// case # 201412960 end

			}
		}
	}

	nlapiLogExecution('ERROR', 'vBinLocArr', vBinLocArr);

	var filters = new Array();
	var columns = new Array();
	if (getItemInternalId != null && getItemInternalId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_item', null,
				'anyof', [ '@NONE@', getItemInternalId ]));
	if (strItemGrp != null && strItemGrp != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemgroup',
				null, 'anyof', [ '@NONE@', strItemGrp ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemgroup',
				null, 'anyof', [ '@NONE@' ]));
	if (strItemFam != null && strItemFam != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemfamily',
				null, 'anyof', [ '@NONE@', strItemFam ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_itemfamily',
				null, 'anyof', [ '@NONE@' ]));
	if (strLocation != null && strLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_location',
				null, 'anyof', [ '@NONE@', strLocation ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_location',
				null, 'anyof', [ '@NONE@' ]));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

	if (strItemDept != null && strItemDept != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_department',
				null, 'anyof', [ '@NONE@', strItemDept ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_department',
				null, 'anyof', [ '@NONE@' ]));

	if (strItemClass != null && strItemClass != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_class', null,
				'anyof', [ '@NONE@', strItemClass ]));
	else
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_class', null,
				'anyof', [ '@NONE@' ]));

	if (strOrderType != undefined && strOrderType != null
			&& strOrderType != 'null' && strOrderType != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_ordertype',
				null, 'anyof', [ '@NONE@', strOrderType ]));

	if (strvUnits != undefined && strvUnits != null && strvUnits != 'null'
			&& strvUnits != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_units', null,
				'anyof', [ '@NONE@', strvUnits ]));

	if (vClassification != 'undefined' && vClassification != null
			&& vClassification != '' && vClassification != 'null') {
		var columnsclasification = new Array();
		var filtersclasification = new Array();
		columnsclasification[0] = new nlobjSearchColumn('name');
		filtersclasification.push(new nlobjSearchFilter('name', null, 'is',
				vClassification));

		var objclassification = new nlapiSearchRecord(
				'customlist_wmsse_abcvelocity', 'null', filtersclasification,
				columnsclasification);

		if (objclassification != null && objclassification != '') {

			filters.push(new nlobjSearchFilter(
					'custrecord_wmsse_pick_abcvelocity', null, 'anyof', [
							'@NONE@', objclassification[0].getId() ]));
		} else {
			filters.push(new nlobjSearchFilter(
					'custrecord_wmsse_pick_abcvelocity', null, 'anyof',
					[ '@NONE@' ]));
		}
	} else {
		filters.push(new nlobjSearchFilter('custrecord_wmsse_pick_abcvelocity',
				null, 'anyof', [ '@NONE@' ]));
	}

	var objPickstrategies = new nlapiSearchRecord(
			'customrecord_wmsse_pickstrategies',
			'customsearch_wmsse_get_pickstrategies', filters, columns);
	if (objPickstrategies != null && objPickstrategies != ''
			&& objPickstrategies.length > 0) {
		nlapiLogExecution('ERROR', 'objPickstrategies', objPickstrategies);

		if (context.getRemainingUsage() <= 200) {
			var singleorderscheduler;
			if (schtype == "SingleOrder")
				singleorderscheduler = Invokesingleordersch(request);
			else if (schtype == "SingleOrderscheduler")
				singleorderscheduler = Invokesingleorderschyield(request);
			else if (schtype == "MultiOrder")
				singleorderscheduler = Invokingmultiordersch(request);
			else if (schtype == "MultiOrderscheduler")
				singleorderscheduler = Invokingmultiorderschyield(request);

			if (singleorderscheduler == 'scheduleScriptinvoked') {
				return 'scheduleScriptinvoked';
			}
		}

		for (var i = 0; i < objPickstrategies.length; i++) {

			var strPickZone = objPickstrategies[i]
					.getValue('custrecord_wmsse_pick_zone');
			if (strPickZone == null || strPickZone == '')
				strPickZone = "-None-";
			var inclIBStageInvFlag = objPickstrategies[i]
					.getValue('custrecord_wmsse_pick_from_stageloc');
			var strInvStatus = objPickstrategies[i]
					.getText('custrecord_wmsse_invstatus');

			// This is to restrict the display of stage bins at inventroy to bin
			// scan page
			if (boolinclIBStageInvFlag != null && boolinclIBStageInvFlag != ''
					&& boolinclIBStageInvFlag != 'null'
					&& boolinclIBStageInvFlag != 'undefined'
					&& boolinclIBStageInvFlag == 'F') {
				inclIBStageInvFlag = 'F';
			}
			// ends

			// var strPickZoneText=
			// objPickstrategies[i].getText('custrecord_wmsse_pick_zone');
			if (strPickZone != null && strPickZone != '') {
				vPickZoneArr.push(strPickZone);
				if (inclIBStageInvFlag == 'T') {
					vPickZoneArrCrossDockingTrue.push(strPickZone);
				} else {
					vPickZoneArrCrossDockingFalse.push(strPickZone);
				}
			}
		}
		var objBinByZoneDetails = new Array();
		// This function is to get the bins storage+stage bins
		if (vPickZoneArrCrossDockingTrue != null
				&& vPickZoneArrCrossDockingTrue != ''
				&& vPickZoneArrCrossDockingTrue != 'null'
				&& vPickZoneArrCrossDockingTrue != 'undefined'
				&& vPickZoneArrCrossDockingTrue.length > 0) {
			vPickZoneArrCrossDockingTrue = removeDuplicateElement(vPickZoneArrCrossDockingTrue);
			// This loop is to separate the null zones
			var zonesArr = new Array();
			var isNoneZoneExists = 'F';
			for (var j1 = 0; j1 < vPickZoneArrCrossDockingTrue.length; j1++) {
				var tZone = vPickZoneArrCrossDockingTrue[j1];
				if (tZone != '-None-') {
					zonesArr.push(tZone);
				} else {
					isNoneZoneExists = 'T';
				}
			}

			var maxno = -1;
			objBinByZoneDetails = fnGetPickReportBinsbyZonesAlongWithStage(
					zonesArr, strLocation, maxno, objBinByZoneDetails,
					isNoneZoneExists, request, schtype);
			nlapiLogExecution('ERROR', 'objBinByZoneDetails',
					objBinByZoneDetails);
			if (objBinByZoneDetails == 'scheduleScriptinvoked') {
				return 'scheduleScriptinvoked';
			}
		}

		nlapiLogExecution('EMERGENCY',
				'vPickZoneArrCrossDockingFalse,vPickZoneArrCrossDockingTrue',
				vPickZoneArrCrossDockingFalse + ","
						+ vPickZoneArrCrossDockingTrue);
		// This function is to get the storage bins
		if (vPickZoneArrCrossDockingFalse != null
				&& vPickZoneArrCrossDockingFalse != ''
				&& vPickZoneArrCrossDockingFalse != 'null'
				&& vPickZoneArrCrossDockingFalse != 'undefined'
				&& vPickZoneArrCrossDockingFalse.length > 0) {
			vPickZoneArrCrossDockingFalse = removeDuplicateElement(vPickZoneArrCrossDockingFalse);
			// This loop is to separate the null zones
			var zonesArray = new Array();
			var isNoneZoneExists = 'F';
			for (var j1 = 0; j1 < vPickZoneArrCrossDockingFalse.length; j1++) {
				var tZone = vPickZoneArrCrossDockingFalse[j1];
				if (tZone != '-None-') {
					zonesArray.push(tZone);
				} else {
					isNoneZoneExists = 'T';
				}
			}

			var maxno = -1;
			objBinByZoneDetails = fnGetPickReportBinsbyZones(zonesArray,
					strLocation, maxno, objBinByZoneDetails, isNoneZoneExists,
					request);
			if (objBinByZoneDetails == 'scheduleScriptinvoked') {
				return 'scheduleScriptinvoked';
			}

		}
		var vBinIdArr = new Array();
		var vBinArr = new Array();
		if (objBinByZoneDetails != null && objBinByZoneDetails != ''
				&& objBinByZoneDetails.length > 0) {
			nlapiLogExecution('ERROR', 'objBinByZoneDetails',
					objBinByZoneDetails.length);
			for (var j = 0; j < objBinByZoneDetails.length; j++) {
				vBinIdArr.push(objBinByZoneDetails[j].getValue('internalid'));
				vBinArr.push(objBinByZoneDetails[j].getValue('binnumber'));
				var strPickZoneText = objBinByZoneDetails[j]
						.getText('custrecord_wmsse_zone');
				vValidZoneArr.push(strPickZoneText);

			}
		}

		if (context.getRemainingUsage() <= 200) {
			var singleorderscheduler;
			if (schtype == "SingleOrder")
				singleorderscheduler = Invokesingleordersch(request);
			else if (schtype == "SingleOrderscheduler")
				singleorderscheduler = Invokesingleorderschyield(request);
			else if (schtype == "MultiOrder")
				singleorderscheduler = Invokingmultiordersch(request);
			else if (schtype == "MultiOrderscheduler")
				singleorderscheduler = Invokingmultiorderschyield(request);

			if (singleorderscheduler == 'scheduleScriptinvoked') {
				return 'scheduleScriptinvoked';
			}
		}

		var filterStrat = new Array();
		// Inventorystatus Feature is enabled

		if (inventoryStatusFeature == true) {

			nlapiLogExecution('ERROR', 'makeInvAvailFlagFromSelect',
					makeInvAvailFlagFromSelect);

			var objBinDetails = new Array();
			// fetching 4k records only, because columns are in group
			var vBinsearchDetails = new nlapiLoadSearch('InventoryBalance',
					'customsearch_wmsse_inventorybalance');
			if (getItemInternalId != null && getItemInternalId != '')
				vBinsearchDetails.addFilter(new nlobjSearchFilter('internalid',
						'item', 'anyof', getItemInternalId));
			if (strLocation != null && strLocation != '')
				vBinsearchDetails.addFilter(new nlobjSearchFilter('location',
						null, 'anyof', strLocation));
			if (vBinIdArr != null && vBinIdArr != '')
				vBinsearchDetails.addFilter(new nlobjSearchFilter('binnumber',
						null, 'anyof', vBinIdArr));
			if (vBinIntIdExcludeArr != null && vBinIntIdExcludeArr != '')
				vBinsearchDetails.addFilter(new nlobjSearchFilter('binnumber',
						null, 'noneof', vBinIntIdExcludeArr));
			// if(vNonStorageBinIdArr!= null && vNonStorageBinIdArr!= '')
			// vBinsearchDetails.addFilter(new
			// nlobjSearchFilter('binnumber',null, 'noneof',
			// vNonStorageBinIdArr));
			if (makeInvAvailFlagFromSelect != null
					&& makeInvAvailFlagFromSelect != ''
					&& makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != 'undefined'
					&& makeInvAvailFlagFromSelect != undefined) {
				if (makeInvAvailFlagFromSelect == 'T'
						|| makeInvAvailFlagFromSelect == 'F') {
					vBinsearchDetails.addFilter(new nlobjSearchFilter(
							'inventoryavailable', 'inventorystatus', 'is',
							makeInvAvailFlagFromSelect));
				} else {
					if (makeInvAvailFlagFromSelect != 'All') {
						vBinsearchDetails.addFilter(new nlobjSearchFilter(
								'status', null, 'anyof',
								makeInvAvailFlagFromSelect));
					}

				}
			}
			// fetching 4k Records
			var resBinDetails = vBinsearchDetails.runSearch();
			// var resItr=0;
			var resultsPage = resBinDetails.getResults(0, 1000);
			var offset = 0;
			while (!!resultsPage && resultsPage.length > 0) {
				objBinDetails = objBinDetails.concat(resultsPage);
				offset += 1000;
				resultsPage = resBinDetails.getResults(offset, offset + 1000);
			}

			var vBinOpenTaskLotArr = new Array();
			var vBinOpenTaskExpDateArr = new Array();
			var vBinOpenTaskBinIdArr = new Array();
			var vBinOpenTaskBinQtyArr = new Array();
			var vBinOpenTaskStatusArr = new Array();
			if (objBinDetails != null && objBinDetails != ''
					&& objBinDetails.length > 0) {
				nlapiLogExecution('ERROR', 'objBinDetails',
						objBinDetails.length);
				vIsLotItem = 'T';// objBinDetails[0].getValue('islotitem','item','group');

				var vLotExpArr = new Array();
				var vLotArr = new Array();
				var vUnitType = "";
				var vStockUnit = "";
				if (vIsLotItem == 'T') {
					var vValidBinIdArr = new Array();
					var vValidBinTextArr = new Array();
					var vValidBinAvailQtyArr = new Array();
					var vValidBinInvNumArr = new Array();
					var vValidInvNumIDArr = new Array();
					var vValidBinStatusArr = new Array();
					var vValidBinStatusIDArr = new Array();
					var vstrLotNameCSV = "";
					var strBinCSV = "";
					for (var binItr = 0; binItr < objBinDetails.length
							&& vBinLocArr.length < 5; binItr++) {
						// No need to check Status Make available flag
						var vValidBinId = objBinDetails[binItr].getValue(
								'binnumber', null, 'group');
						var vValidBin = objBinDetails[binItr].getText(
								'binnumber', null, 'group');
						var vBinQtyAvail = objBinDetails[binItr].getValue(
								'available', null, 'sum');

						var vBinInvNum = objBinDetails[binItr].getText(
								'inventorynumber', null, 'group');
						vValidInvNumIDArr.push(objBinDetails[binItr].getValue(
								'inventorynumber', null, 'group'));
						var vBinStatus = objBinDetails[binItr].getText(
								'status', null, 'group');
						var vBinStatusID = objBinDetails[binItr].getValue(
								'status', null, 'group');
						// vUnitType =itemUnitType;
						// vStockUnit=itemStockUnit;

						// bindedBinStatusArr
						var isLotBinStatusBinded = 'F';
						for (var binLotItr = 0; binLotItr < bindedBinStatusArr.length; binLotItr++) {
							var cRow = bindedBinStatusArr[binLotItr];
							var cBinId = cRow[0];
							var cStsId = cRow[1];
							var cLotId = cRow[2];
							if (cBinId == vValidBinId && cStsId == vBinStatusID
									&& vBinInvNum == cLotId) {
								isLotBinStatusBinded = 'T';
								break;
							}
						}
						if (isLotBinStatusBinded == 'T') {
							continue;
						}

						vValidBinIdArr.push(vValidBinId);
						vValidBinTextArr.push(vValidBin);
						vValidBinAvailQtyArr.push(vBinQtyAvail);
						vValidBinInvNumArr.push(vBinInvNum);
						vValidBinStatusArr.push(vBinStatus);
						vValidBinStatusIDArr.push(objBinDetails[binItr]
								.getValue('status', null, 'group'))
						nlapiLogExecution('ERROR', 'vBinQtyAvail', vBinQtyAvail);
						if (strBinCSV == "")
							strBinCSV = vValidBinId;
						else
							strBinCSV = strBinCSV + ',' + vValidBinId;
						if (vstrLotNameCSV == "")
							vstrLotNameCSV = vBinInvNum;
						else
							vstrLotNameCSV = vstrLotNameCSV + ',' + vBinInvNum;

					}

					var filtersExp = new Array();
					if (getItemInternalId != null && getItemInternalId != "") {
						filtersExp.push(new nlobjSearchFilter('internalid',
								null, 'anyof', getItemInternalId));
					}
					if (strLocation != null && strLocation != ''
							&& strLocation != 'null')
						filtersExp.push(new nlobjSearchFilter('location',
								'inventorynumber', 'anyof', strLocation));
					if (vValidInvNumIDArr != null && vValidInvNumIDArr != '')
						filtersExp.push(new nlobjSearchFilter('internalid',
								'inventorynumber', 'anyof', vValidInvNumIDArr));
					// Case # 201413255 start
					if ((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
							&& (AllowAllLots != 'T')) {
						nlapiLogExecution("Error",
								"systemRule_AllowExpiredItems",
								systemRule_AllowExpiredItems);
						// filtersExp.push(new
						// nlobjSearchFilter('expirationdate','inventorynumber',
						// 'onorafter', DateStamp()));
						filtersExp
								.push(new nlobjSearchFilter('formuladate',
										null, 'onorafter', DateStamp())
										.setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
						// filtersExp[2].setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))");
					}
					// Case # 201413255 end

					var columnsExp = new Array();
					var searchresultsExp = nlapiSearchRecord('item',
							'customsearch_wmsse_expdate_lots', filtersExp,
							columnsExp);
					var vTempInvBinArr = new Array();
					if (searchresultsExp != null && searchresultsExp != '') {
						for (var searchItr = 0; searchItr < searchresultsExp.length; searchItr++) {

							if (searchresultsExp[searchItr].getValue(
									'inventorynumber', 'inventorynumber') != null
									&& searchresultsExp[searchItr].getValue(
											'inventorynumber',
											'inventorynumber') != '') {
								if (vValidBinInvNumArr
										.indexOf(searchresultsExp[searchItr]
												.getValue('inventorynumber',
														'inventorynumber')) != -1) {
									vLotArr.push(searchresultsExp[searchItr]
											.getValue('inventorynumber',
													'inventorynumber'));
									vLotExpArr.push(searchresultsExp[searchItr]
											.getValue('expirationdate',
													'inventorynumber'));
								}
							}
						}
					}

					var vMainBinArr = new Array();
					var objBinwithSeq = null;
					if (vValidBinIdArr != null && vValidBinIdArr != ''
							&& inclIBStageInvFlag == 'T') {

						var result = nlapiLoadSearch('bin',
								'customsearch_wmsse_binsbypickzonenodir');

						result.addFilter(new nlobjSearchFilter('internalid',
								null, 'anyof', vValidBinIdArr));

						if (strLocation != null && strLocation != '')
							result.addFilter(new nlobjSearchFilter('location',
									null, 'anyof', strLocation));

						result.addFilter(new nlobjSearchFilter('inactive',
								null, 'is', 'F'));

						var objBinwithSeq = new Array();
						var resLen = result.runSearch();
						var q = 0;
						var resultSet = resLen
								.forEachResult(function(searchResult) {
									if ((searchResult
											.getValue('custrecord_wmsse_bin_loc_type') == ''
											|| searchResult
													.getValue('custrecord_wmsse_bin_loc_type') == 'null' || searchResult
											.getValue('custrecord_wmsse_bin_loc_type') == null)
											|| (stgLocId
													.indexOf(searchResult
															.getValue('custrecord_wmsse_bin_loc_type') != -1) && (searchResult
													.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
										q++;
										objBinwithSeq.push(searchResult);
									}

									if (q == 4000) {
										return false;
									}
									return true; // return true to keep
													// iterating
								});
						nlapiLogExecution('ERROR', 'objBinwithSeq',
								objBinwithSeq);
					}
					if (vValidBinIdArr != null && vValidBinIdArr != ''
							&& inclIBStageInvFlag != 'T') {

						var result = nlapiLoadSearch('bin',
								'customsearch_wmsse_binsbypickzones');

						result.addFilter(new nlobjSearchFilter('internalid',
								null, 'anyof', vValidBinIdArr));

						if (strLocation != null && strLocation != '')
							result.addFilter(new nlobjSearchFilter('location',
									null, 'anyof', strLocation));

						result.addFilter(new nlobjSearchFilter('inactive',
								null, 'is', 'F'));

						var objBinwithSeq = new Array();
						var resLen = result.runSearch();
						var q = 0;
						var resultSet = resLen.forEachResult(function(
								searchResult) {
							q++;
							objBinwithSeq.push(searchResult);
							if (q == 4000) {
								return false;
							}
							return true; // return true to keep iterating
						});
						nlapiLogExecution('ERROR', 'objBinwithSeq',
								objBinwithSeq);

					}

					var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
							getItemInternalId, vValidBinIdArr, strLocation,
							null, null);

					if (vBinOpenTaskDetails != null
							&& vBinOpenTaskDetails != ''
							&& vBinOpenTaskDetails.length > 0) {
						vBinOpenTaskBinIdArr.push(vBinOpenTaskDetails[0]);
						vBinOpenTaskBinQtyArr.push(vBinOpenTaskDetails[1]);
						vBinOpenTaskLotArr.push(vBinOpenTaskDetails[3]);
						vBinOpenTaskExpDateArr.push(vBinOpenTaskDetails[4]);
						vBinOpenTaskStatusArr.push(vBinOpenTaskDetails[5]);

					}
					/* var pageIndex = pageCount * 5; */
					for (var lotItr = 0; lotItr < vLotArr.length
							&& vBinLocArr.length < 6; lotItr++) {
						var vZone = '';
						if (vLotArr[lotItr] != null && vLotArr[lotItr] != '') {
							var vLotExp = vLotExpArr[lotItr];
							var vTempLotArrNew = vstrLotNameCSV.split(',');
							var vTempLotArr = new Array();
							for (var tempItr = 0; tempItr < vTempLotArrNew.length; tempItr++) {
								var tLot = vTempLotArrNew[tempItr];
								if (tLot == vLotArr[lotItr]) {
									vTempLotArr.push(tempItr);
								}
							}

							if (vTempLotArr.length > 1)// Means lot occures in
														// more than once
							{
								if (objBinwithSeq != null
										&& objBinwithSeq != ''
										&& objBinwithSeq.length > 0) {

									for (var binseqItr = 0; binseqItr < objBinwithSeq.length
											&& vBinLocArr.length < 6; binseqItr++) {
										var vValidBinId = objBinwithSeq[binseqItr]
												.getValue('internalid');

										var vZone = "";
										if (vBinIdArr.length > 0
												&& vBinIdArr
														.indexOf(vValidBinId) != -1) {
											vZone = vValidZoneArr[vBinIdArr
													.indexOf(vValidBinId)];
										} else {
											vZone = objBinwithSeq[binseqItr]
													.getText('custrecord_wmsse_zone');
										}

										if (vValidBinId != null
												&& vValidBinId != '') {
											for (invItr = 0; invItr < vValidBinIdArr.length; invItr++) {

												if (vValidBinIdArr[invItr] == vValidBinId
														&& vValidBinInvNumArr[invItr] == vLotArr[lotItr]) {

													var vValidBin = vValidBinTextArr[invItr];
													var vBinQtyAvail = vValidBinAvailQtyArr[invItr];
													var vBinQtyInvNum = vValidBinInvNumArr[invItr];
													var vValidBinStatus = vValidBinStatusArr[invItr];
													var vValidBinStatusId = vValidBinStatusIDArr[invItr];
													var vOpenLotQty = 0;

													if (vBinOpenTaskDetails[0] != null
															&& vBinOpenTaskDetails[0] != '') {

														for (var openTskItr = 0; openTskItr < vBinOpenTaskDetails[0].length; openTskItr++) {
															var vOpenBinId = vBinOpenTaskDetails[0][openTskItr];
															var vOpenStatusID = vBinOpenTaskDetails[5][openTskItr];
															if (vValidBinId == vOpenBinId) {
																var vOpenLot = vBinOpenTaskDetails[3][openTskItr];
																if (vBinQtyInvNum == vOpenLot
																		&& vOpenStatusID == vValidBinStatusId) {
																	vOpenLotQty = vBinOpenTaskDetails[1][openTskItr];
																	break;
																}
															}
														}
													}
													nlapiLogExecution(
															'ERROR',
															'inside if vBinQtyAvail,vOpenLotQty ',
															vBinQtyAvail
																	+ ","
																	+ vOpenLotQty);

													if (vOpenLotQty == null
															|| vOpenLotQty == 'null'
															|| vOpenLotQty == ''
															|| vOpenLotQty == 'undefined')
														vOpenLotQty = 0;

													vBinQtyAvail = parseFloat(vBinQtyAvail)
															- parseFloat(vOpenLotQty);
													if (parseFloat(vBinQtyAvail) > 0) {
														/*
														 * if(getStockConversionRate !=
														 * null &&
														 * getStockConversionRate != '' &&
														 * getStockConversionRate !=
														 * 'null' &&
														 * getStockConversionRate !=
														 * undefined &&
														 * getStockConversionRate !=
														 * 'undefined') {
														 * vBinQtyAvail =
														 * parseFloat(vBinQtyAvail) *
														 * parseFloat(getStockConversionRate); }
														 */

														// if(vValidBin !=
														// getPreferBin)
														if (vValidBin != getPreferBin
																&& vValidBinId != getPreferBinId) {
															count = count + 1;

															if (count > pageIndex) {
																var currRow = [
																		vValidBin,
																		vBinQtyAvail,
																		vValidBinId,
																		vBinQtyInvNum,
																		vLotExp,
																		vZone,
																		vValidBinStatus ];
																vBinIntIdExcludeArr
																		.push(vValidBinId);
																vBinLocArr
																		.push(currRow);
																var row1 = [
																		vValidBinId,
																		vValidBinStatusId,
																		vBinQtyInvNum ];
																bindedBinStatusArr
																		.push(row1);
															} else {
																var row = [
																		vValidBinId,
																		vValidBinStatusId,
																		vBinQtyInvNum ];
																bindedBinStatusArr
																		.push(row);
															}
														}
													}

												}
											}
										}
										if (vBinLocArr.length >= 5)
											break;

									}
								}
							} else {
								var vValidBin = vValidBinTextArr[vValidBinInvNumArr
										.indexOf(vLotArr[lotItr])];
								var vValidBinId = vValidBinIdArr[vValidBinInvNumArr
										.indexOf(vLotArr[lotItr])];
								var vValidBinStatus = vValidBinStatusArr[vValidBinInvNumArr
										.indexOf(vLotArr[lotItr])];
								var vValidBinStatusID = vValidBinStatusIDArr[vValidBinInvNumArr
										.indexOf(vLotArr[lotItr])];
								var vZone = "";
								if (vBinIdArr.indexOf(vValidBinId) != -1) {
									vZone = vValidZoneArr[vBinIdArr
											.indexOf(vValidBinId)];
								} else {
									for (var Itr = 0; Itr < objBinwithSeq.length; Itr++) {
										var vTempBinId = objBinwithSeq[Itr]
												.getValue('internalid');
										if (vTempBinId == vValidBinId) {
											vZone = objBinwithSeq[Itr]
													.getText('custrecord_wmsse_zone');
											break;
										}
									}
								}

								var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinInvNumArr
										.indexOf(vLotArr[lotItr])];
								var vBinQtyInvNum = vValidBinInvNumArr[vValidBinInvNumArr
										.indexOf(vLotArr[lotItr])];

								var vOpenLotQty = 0;

								if (vBinOpenTaskDetails[0] != null
										&& vBinOpenTaskDetails[0] != '') {
									for (var openTskItr = 0; openTskItr < vBinOpenTaskDetails[0].length; openTskItr++) {
										var vOpenBinId = vBinOpenTaskDetails[0][openTskItr];
										var vOpenStatusID = vBinOpenTaskDetails[5][openTskItr];
										if (vValidBinId == vOpenBinId) {
											var vOpenLot = vBinOpenTaskDetails[3][openTskItr];
											if (vBinQtyInvNum == vOpenLot
													&& vOpenStatusID == vValidBinStatusID) {
												vOpenLotQty = vBinOpenTaskDetails[1][openTskItr];
												break;
											}
										}
									}
								}
								nlapiLogExecution('ERROR',
										'vBinQtyAvail,vOpenLotQty ',
										vBinQtyAvail + "," + vOpenLotQty);

								if (vOpenLotQty == null
										|| vOpenLotQty == 'null'
										|| vOpenLotQty == ''
										|| vOpenLotQty == 'undefined')
									vOpenLotQty = 0;

								vBinQtyAvail = parseFloat(vBinQtyAvail)
										- parseFloat(vOpenLotQty);
								if (parseFloat(vBinQtyAvail) > 0) {

									// if(vValidBin != getPreferBin)
									if (vValidBin != getPreferBin
											&& vValidBinId != getPreferBinId) {
										count = count + 1;
										if (count > pageIndex) {
											var currRow = [ vValidBin,
													vBinQtyAvail, vValidBinId,
													vBinQtyInvNum, vLotExp,
													vZone, vValidBinStatus ];
											// vBinIntIdExcludeArr.push(vValidBinId);
											vBinLocArr.push(currRow);
											var row = [ vValidBinId,
													vValidBinStatusID,
													vBinQtyInvNum ];
											bindedBinStatusArr.push(row);
										} else {
											var row = [ vValidBinId,
													vValidBinStatusID,
													vBinQtyInvNum ];
											bindedBinStatusArr.push(row);
										}
									}
								}
							}
							if (vBinLocArr.length >= 5)
								break;
						}

					}

				} else {

					var vValidBinIdArr = new Array();
					var vValidBinTextArr = new Array();
					var vValidBinAvailQtyArr = new Array();
					var vValidBinInvNumArr = new Array();
					for (var binDetailsItr = 0; binDetailsItr < objBinDetails.length; binDetailsItr++) {
						var vValidBinId = objBinDetails[binDetailsItr]
								.getValue('binnumber',
										'inventoryNumberBinOnHand');
						var vValidBin = objBinDetails[binDetailsItr].getText(
								'binnumber', 'inventoryNumberBinOnHand');
						if (vmakeInvAvailFlag == "T")
							var vBinQtyAvail = objBinDetails[binDetailsItr]
									.getValue('quantityavailable',
											'inventoryNumberBinOnHand');
						else
							var vBinQtyAvail = objBinDetails[binDetailsItr]
									.getValue('quantityonhand',
											'inventoryNumberBinOnHand');
						var vBinInvNum = objBinDetails[binDetailsItr].getText(
								'inventorynumber', 'inventoryNumberBinOnHand');
						vValidBinIdArr.push(vValidBinId);
						vValidBinTextArr.push(vValidBin);
						vValidBinAvailQtyArr.push(vBinQtyAvail);
						vValidBinInvNumArr.push(vBinInvNum);

					}
					var objBinwithSeq = null;
					if (vValidBinIdArr != null && vValidBinIdArr != ''
							&& inclIBStageInvFlag == 'T') {

						var result = nlapiLoadSearch('bin',
								'customsearch_wmsse_binsbypickzonenodir');

						result.addFilter(new nlobjSearchFilter('internalid',
								null, 'anyof', vValidBinIdArr));

						if (strLocation != null && strLocation != '')
							result.addFilter(new nlobjSearchFilter('location',
									null, 'anyof', strLocation));

						result.addFilter(new nlobjSearchFilter('inactive',
								null, 'is', 'F'));

						var objBinwithSeq = new Array();
						var resLen = result.runSearch();
						var q = 0;
						var resultSet = resLen
								.forEachResult(function(searchResult) {
									if ((searchResult
											.getValue('custrecord_wmsse_bin_loc_type') == ''
											|| searchResult
													.getValue('custrecord_wmsse_bin_loc_type') == 'null' || searchResult
											.getValue('custrecord_wmsse_bin_loc_type') == null)
											|| (stgLocId
													.indexOf(searchResult
															.getValue('custrecord_wmsse_bin_loc_type') != -1) && (searchResult
													.getValue('custrecord_wmsse_bin_stg_direction') == 1))) {
										q++;
										objBinwithSeq.push(searchResult);
									}
									if (q == 4000) {
										return false;
									}
									return true; // return true to keep
													// iterating
								});
						nlapiLogExecution('ERROR', 'objBinwithSeq',
								objBinwithSeq);
					}
					if (vValidBinIdArr != null && vValidBinIdArr != ''
							&& inclIBStageInvFlag != 'T') {

						var result = nlapiLoadSearch('bin',
								'customsearch_wmsse_binsbypickzones');

						result.addFilter(new nlobjSearchFilter('internalid',
								null, 'anyof', vValidBinIdArr));

						if (strLocation != null && strLocation != '')
							result.addFilter(new nlobjSearchFilter('location',
									null, 'anyof', strLocation));

						result.addFilter(new nlobjSearchFilter('inactive',
								null, 'is', 'F'));

						var objBinwithSeq = new Array();
						var resLen = result.runSearch();
						var q = 0;
						var resultSet = resLen.forEachResult(function(
								searchResult) {
							q++;
							objBinwithSeq.push(searchResult);
							if (q == 4000) {
								return false;
							}
							return true; // return true to keep iterating
						});
						nlapiLogExecution('ERROR', 'objBinwithSeq',
								objBinwithSeq);
					}

					var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
							getItemInternalId, vValidBinIdArr, strLocation,
							objBinDetails[0].getValue('unitstype'),
							objBinDetails[0].getText('stockunit'));

					if (vBinOpenTaskDetails != null
							&& vBinOpenTaskDetails != ''
							&& vBinOpenTaskDetails.length > 0) {
						vBinOpenTaskBinIdArr.push(vBinOpenTaskDetails[0]);
						vBinOpenTaskBinQtyArr.push(vBinOpenTaskDetails[1]);
						vBinOpenTaskLotArr.push(vBinOpenTaskDetails[3]);
						vBinOpenTaskExpDateArr.push(vBinOpenTaskDetails[4]);
					}

					if (objBinwithSeq != null && objBinwithSeq != ''
							&& objBinwithSeq.length > 0) {
						for (var binseqItr = 0; binseqItr < objBinwithSeq.length; binseqItr++) {
							var vValidBinId = objBinwithSeq[binseqItr]
									.getValue('internalid');
							var vZone = objBinwithSeq[binseqItr]
									.getText('custrecord_wmsse_zone');
							if (vValidBinId != null && vValidBinId != '') {
								if (vValidBinIdArr.indexOf(vValidBinId) != -1) {
									var vValidBin = vValidBinTextArr[vValidBinIdArr
											.indexOf(vValidBinId)];
									var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinIdArr
											.indexOf(vValidBinId)];
									var vBinQtyInvNum = vValidBinInvNumArr[vValidBinIdArr
											.indexOf(vValidBinId)];
									var vOpenLotQty = 0;

									if (vBinOpenTaskDetails[0] != null
											&& vBinOpenTaskDetails[0] != '') {
										for (var openTskItr = 0; openTskItr < vBinOpenTaskDetails[0].length; openTskItr++) {
											var vOpenBinId = vBinOpenTaskDetails[0][openTskItr];
											var vOpenStatusId = vBinOpenTaskDetails[5][openTskItr];
											if (vValidBinId == vOpenBinId) {
												var vOpenLot = vBinOpenTaskDetails[3][openTskItr];
												if (vBinQtyInvNum == vOpenLot) {
													vOpenLotQty = vBinOpenTaskDetails[1][openTskItr];
													break;
												}
											}
										}
									}
									nlapiLogExecution('ERROR',
											'vBinQtyAvail,vOpenLotQty ',
											vBinQtyAvail + "," + vOpenLotQty);

									if (vOpenLotQty == null
											|| vOpenLotQty == 'null'
											|| vOpenLotQty == ''
											|| vOpenLotQty == 'undefined')
										vOpenLotQty = 0;

									vBinQtyAvail = parseFloat(vBinQtyAvail)
											- parseFloat(vOpenLotQty);
									if (parseFloat(vBinQtyAvail) > 0) {

										if (vValidBin != getPreferBin
												&& vValidBinId != getPreferBinId) {
											count = count + 1;
											if (count > pageIndex) {
												var currRow = [ vValidBin,
														vBinQtyAvail,
														vValidBinId,
														vBinQtyInvNum, '',
														vZone ];
												vBinIntIdExcludeArr
														.push(vValidBinId);
												vBinLocArr.push(currRow);
											}
										}
									}
								}
							}
							if (vBinLocArr.length >= 5)
								break;
						}
					}
				}

			}
			objBinDetails = null;

		}

		else {

			if (getItemInternalId != null && getItemInternalId != '')
				filterStrat.push(new nlobjSearchFilter('internalid', null,
						'anyof', getItemInternalId));
			if (strLocation != null && strLocation != '')
				filterStrat.push(new nlobjSearchFilter('location',
						'inventoryNumberBinOnHand', 'anyof', strLocation));
			if (vBinIdArr != null && vBinIdArr != '')
				filterStrat.push(new nlobjSearchFilter('binnumber',
						'inventoryNumberBinOnHand', 'anyof', vBinIdArr));
			if (vBinIntIdExcludeArr != null && vBinIntIdExcludeArr != '')
				filterStrat.push(new nlobjSearchFilter('binnumber',
						'inventoryNumberBinOnHand', 'noneof',
						vBinIntIdExcludeArr));

			var objBinDetails = new nlapiSearchRecord('item',
					'customsearch_wmsse_itemwise_lots', filterStrat, null);
			var vBinOpenTaskLotArr = new Array();
			var vBinOpenTaskExpDateArr = new Array();
			var vBinOpenTaskBinIdArr = new Array();
			var vBinOpenTaskBinQtyArr = new Array();
			if (objBinDetails != null && objBinDetails != ''
					&& objBinDetails.length > 0) {

				vIsLotItem = objBinDetails[0].getValue('islotitem');
				nlapiLogExecution('ERROR', 'vIsLotItem,objBinDetails',
						vIsLotItem + "," + objBinDetails.length);
				var vLotExpArr = new Array();
				var vLotArr = new Array();

				var vValidBinIdArr = new Array();
				var vValidBinTextArr = new Array();
				var vValidBinAvailQtyArr = new Array();
				var vValidBinInvNumArr = new Array();
				var vValidInvNumIDArr = new Array();
				var vstrLotNameCSV = "";
				var strBinCSV = "";
				for (var j = 0; j < objBinDetails.length; j++) {
					var vValidBinId = objBinDetails[j].getValue('binnumber',
							'inventoryNumberBinOnHand');
					var vValidBin = objBinDetails[j].getText('binnumber',
							'inventoryNumberBinOnHand');
					if (vmakeInvAvailFlag == "T")
						var vBinQtyAvail = objBinDetails[j]
								.getValue('quantityavailable',
										'inventoryNumberBinOnHand');
					else
						var vBinQtyAvail = objBinDetails[j].getValue(
								'quantityonhand', 'inventoryNumberBinOnHand');
					var vBinInvNum = objBinDetails[j].getText(
							'inventorynumber', 'inventoryNumberBinOnHand');
					vValidInvNumIDArr.push(objBinDetails[j].getValue(
							'inventorynumber', 'inventoryNumberBinOnHand'));
					vValidBinIdArr.push(vValidBinId);
					vValidBinTextArr.push(vValidBin);
					vValidBinAvailQtyArr.push(vBinQtyAvail);
					vValidBinInvNumArr.push(vBinInvNum);
					if (strBinCSV == "")
						strBinCSV = vValidBinId;
					else
						strBinCSV = strBinCSV + ',' + vValidBinId;
					if (vstrLotNameCSV == "")
						vstrLotNameCSV = vBinInvNum;
					else
						vstrLotNameCSV = vstrLotNameCSV + ',' + vBinInvNum;

				}

				var filtersExp = new Array();
				if (getItemInternalId != null && getItemInternalId != "") {
					filtersExp.push(new nlobjSearchFilter('internalid', null,
							'anyof', getItemInternalId));
				}
				if (strLocation != null && strLocation != ''
						&& strLocation != 'null')
					filtersExp.push(new nlobjSearchFilter('location',
							'inventorynumber', 'anyof', strLocation));
				if (vValidInvNumIDArr != null && vValidInvNumIDArr != '')
					filtersExp.push(new nlobjSearchFilter('internalid',
							'inventorynumber', 'anyof', vValidInvNumIDArr));
				// Case # 201413255 start
				if ((systemRule_AllowExpiredItems == 'N' || systemRule_AllowExpiredItems == '')
						&& (AllowAllLots == 'F')) {
					nlapiLogExecution("Error", "systemRule_AllowExpiredItems",
							systemRule_AllowExpiredItems);
					filtersExp
							.push(new nlobjSearchFilter('formuladate', null,
									'onorafter', DateStamp())
									.setFormula("NVL({inventorynumber.expirationdate},TO_DATE('2199/01/01','YYYY/MM/DD'))"));
				}
				// Case # 201413255 end

				var columnsExp = new Array();
				var searchresultsExp = nlapiSearchRecord('item',
						'customsearch_wmsse_expdate_lots', filtersExp,
						columnsExp);
				var vTempInvBinArr = new Array();
				if (searchresultsExp != null && searchresultsExp != '') {
					for (var s = 0; s < searchresultsExp.length; s++) {

						if (searchresultsExp[s].getValue('inventorynumber',
								'inventorynumber') != null
								&& searchresultsExp[s].getValue(
										'inventorynumber', 'inventorynumber') != '') {
							if (vValidBinInvNumArr.indexOf(searchresultsExp[s]
									.getValue('inventorynumber',
											'inventorynumber')) != -1) {
								vLotArr.push(searchresultsExp[s].getValue(
										'inventorynumber', 'inventorynumber'));
								vLotExpArr.push(searchresultsExp[s].getValue(
										'expirationdate', 'inventorynumber'));
							}
						}
					}
				}

				nlapiLogExecution('ERROR',
						'searchresultsExp,vLot Arr,vLotExpArr Arr',
						searchresultsExp + "," + vLotArr + "," + vLotExpArr);

				var vMainBinArr = new Array();
				var objBinwithSeq = null;
				if (vValidBinIdArr != null && vValidBinIdArr != '') {
					var filterbinSeq = new Array();

					filterbinSeq.push(new nlobjSearchFilter('inactive', null,
							'is', 'F'));
					filterbinSeq.push(new nlobjSearchFilter('internalid', null,
							'anyof', vValidBinIdArr));

					if (strLocation != null && strLocation != '')
						filterStrat.push(new nlobjSearchFilter('location',
								null, 'anyof', strLocation));

					objBinwithSeq = new nlapiSearchRecord('bin',
							'customsearch_wmsse_binsbypickzones_stage',
							filterbinSeq, null);

					nlapiLogExecution('ERROR', 'objBinwithSeq', objBinwithSeq);
				}

				if (objBinwithSeq != null && objBinwithSeq != ''
						&& objBinwithSeq.length > 0) {
					if (context.getRemainingUsage() <= 200) {
						var singleorderscheduler;
						if (schtype == "SingleOrder")
							singleorderscheduler = Invokesingleordersch(request);
						else if (schtype == "SingleOrderscheduler")
							singleorderscheduler = Invokesingleorderschyield(request);
						else if (schtype == "MultiOrder")
							singleorderscheduler = Invokingmultiordersch(request);
						else if (schtype == "MultiOrderscheduler")
							singleorderscheduler = Invokingmultiorderschyield(request);

						if (singleorderscheduler == 'scheduleScriptinvoked') {
							return 'scheduleScriptinvoked';
						}
					}

					var vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(
							getItemInternalId, vValidBinIdArr, strLocation,
							objBinDetails[0].getValue('unitstype'),
							objBinDetails[0].getText('stockunit'));

					if (vBinOpenTaskDetails != null
							&& vBinOpenTaskDetails != ''
							&& vBinOpenTaskDetails.length > 0) {
						vBinOpenTaskBinIdArr.push(vBinOpenTaskDetails[0]);
						vBinOpenTaskBinQtyArr.push(vBinOpenTaskDetails[1]);
						vBinOpenTaskLotArr.push(vBinOpenTaskDetails[3]);
						vBinOpenTaskExpDateArr.push(vBinOpenTaskDetails[4]);

						nlapiLogExecution(
								"Error",
								"vBinOpenTaskDetails,vBinOpenTaskDetails,vBinOpenTaskDetails[0],vBinOpenTaskDetails[1],vBinOpenTaskDetails[3],vBinOpenTaskDetails[4]",
								vBinOpenTaskDetails + ","
										+ vBinOpenTaskDetails.length + ","
										+ vBinOpenTaskDetails[0] + ","
										+ vBinOpenTaskDetails[1] + ","
										+ vBinOpenTaskDetails[3] + ","
										+ vBinOpenTaskDetails[4]);
					}

					for (var u = 0; u < vLotArr.length; u++) {
						var vZone = '';
						if (vLotArr[u] != null && vLotArr[u] != '') {
							var vLotExp = vLotExpArr[u];
							var vTempLotArrNew = vstrLotNameCSV.split(',');
							var vTempLotArr = new Array();
							for (var l = 0; l < vTempLotArrNew.length; l++) {
								var tLot = vTempLotArrNew[l];
								if (tLot == vLotArr[u]) {
									vTempLotArr.push(l);
								}
							}

							if (vTempLotArr.length > 1)// Means lot occures in
														// more than once
							{
								if (objBinwithSeq != null
										&& objBinwithSeq != ''
										&& objBinwithSeq.length > 0) {
									for (var l = 0; l < objBinwithSeq.length; l++) {
										var vValidBinId = objBinwithSeq[l]
												.getValue('internalid');

										var vZone = "";
										if (vBinIdArr.length > 0
												&& vBinIdArr
														.indexOf(vValidBinId) != -1) {
											vZone = vValidZoneArr[vBinIdArr
													.indexOf(vValidBinId)];
										} else {
											vZone = objBinwithSeq[l]
													.getText('custrecord_wmsse_zone');
										}

										if (vValidBinId != null
												&& vValidBinId != '') {
											for (l1 = 0; l1 < vValidBinIdArr.length; l1++) {

												if (vValidBinIdArr[l1] == vValidBinId
														&& vValidBinInvNumArr[l1] == vLotArr[u]) {

													var vValidBin = vValidBinTextArr[l1];
													var vBinQtyAvail = vValidBinAvailQtyArr[l1];
													var vBinQtyInvNum = vValidBinInvNumArr[l1];
													var vOpenLotQty = 0;

													if (vBinOpenTaskDetails[0] != null
															&& vBinOpenTaskDetails[0] != '') {

														for (var m1 = 0; m1 < vBinOpenTaskDetails[0].length; m1++) {
															var vOpenBinId = vBinOpenTaskDetails[0][m1];
															if (vValidBinId == vOpenBinId) {
																var vOpenLot = vBinOpenTaskDetails[3][m1];
																if (vBinQtyInvNum == vOpenLot) {
																	vOpenLotQty = vBinOpenTaskDetails[1][m1];
																	break;
																}
															}
														}
													}

													if (vOpenLotQty == null
															|| vOpenLotQty == 'null'
															|| vOpenLotQty == ''
															|| vOpenLotQty == 'undefined')
														vOpenLotQty = 0;

													vBinQtyAvail = parseFloat(vBinQtyAvail)
															- parseFloat(vOpenLotQty);
													if (parseFloat(vBinQtyAvail) > 0) {
														if (vValidBin != getPreferBin) {
															var currRow = [
																	vValidBin,
																	vBinQtyAvail,
																	vValidBinId,
																	vBinQtyInvNum,
																	vLotExp,
																	vZone ];
															vBinIntIdExcludeArr
																	.push(vValidBinId);
															vBinLocArr
																	.push(currRow);
														}
													}

												}
											}
										}
										if (vBinLocArr.length >= 5)
											break;
									}
								}
							} else {
								var vValidBin = vValidBinTextArr[vValidBinInvNumArr
										.indexOf(vLotArr[u])];
								var vValidBinId = vValidBinIdArr[vValidBinInvNumArr
										.indexOf(vLotArr[u])];
								var vZone = "";
								if (vBinIdArr.indexOf(vValidBinId) != -1) {
									vZone = vValidZoneArr[vBinIdArr
											.indexOf(vValidBinId)];
								} else {
									for (var q = 0; q < objBinwithSeq.length; q++) {
										var vTempBinId = objBinwithSeq[q]
												.getValue('internalid');
										if (vTempBinId == vValidBinId) {
											vZone = objBinwithSeq[q]
													.getText('custrecord_wmsse_zone');
											break;
										}
									}
								}
								nlapiLogExecution(
										'ERROR',
										'else vLotArr[u],vValidBinInvNumArr.indexOf(vLotArr[u]),vValidBinId ',
										vLotArr[u]
												+ ","
												+ vValidBinInvNumArr
														.indexOf(vLotArr[u])
												+ "," + vValidBinId);

								var vBinQtyAvail = vValidBinAvailQtyArr[vValidBinInvNumArr
										.indexOf(vLotArr[u])];
								var vBinQtyInvNum = vValidBinInvNumArr[vValidBinInvNumArr
										.indexOf(vLotArr[u])];

								var vOpenLotQty = 0;

								if (vBinOpenTaskDetails[0] != null
										&& vBinOpenTaskDetails[0] != '') {
									for (var m1 = 0; m1 < vBinOpenTaskDetails[0].length; m1++) {
										var vOpenBinId = vBinOpenTaskDetails[0][m1];
										if (vValidBinId == vOpenBinId) {
											var vOpenLot = vBinOpenTaskDetails[3][m1];
											if (vBinQtyInvNum == vOpenLot) {
												vOpenLotQty = vBinOpenTaskDetails[1][m1];
												break;
											}
										}
									}
								}
								nlapiLogExecution('ERROR',
										'vBinQtyAvail,vOpenLotQty ',
										vBinQtyAvail + "," + vOpenLotQty);

								if (vOpenLotQty == null
										|| vOpenLotQty == 'null'
										|| vOpenLotQty == ''
										|| vOpenLotQty == 'undefined')
									vOpenLotQty = 0;

								vBinQtyAvail = parseFloat(vBinQtyAvail)
										- parseFloat(vOpenLotQty);
								if (parseFloat(vBinQtyAvail) > 0) {
									if (vValidBin != getPreferBin) {
										var currRow = [ vValidBin,
												vBinQtyAvail, vValidBinId,
												vBinQtyInvNum, vLotExp, vZone ];
										vBinIntIdExcludeArr.push(vValidBinId);
										vBinLocArr.push(currRow);
									}
								}
							}
						}
						if (vBinLocArr.length >= 5)
							break;

					}

				}
			}
			objBinDetails = null;
		}
	}
	objPickstrategies = null;
	filters = null;
	columns = null;
	return vBinLocArr;
}
/**
 * To get Storage and Stage Bin locations details based on Pick Zone sorted by
 * Internal Id
 */
function fnGetPickReportBinsbyZonesAlongWithStage(strPickZone, strLocation,
		maxno, objBinByZoneDetails, emptyZoneFlag, request, schtype) {
	var context = nlapiGetContext();
	if (context.getRemainingUsage() <= 200) {
		var singleorderscheduler;
		if (schtype == "SingleOrder")
			singleorderscheduler = Invokesingleordersch(request);
		else if (schtype == "SingleOrderscheduler")
			singleorderscheduler = Invokesingleorderschyield(request);
		else if (schtype == "MultiOrder")
			singleorderscheduler = Invokingmultiordersch(request);
		else if (schtype == "MultiOrderscheduler")
			singleorderscheduler = Invokingmultiorderschyield(request);
		return singleorderscheduler;
	}

	nlapiLogExecution('Error', 'into loadsearch');
	var result = nlapiLoadSearch('bin',
			'customsearch_wmsse_binsbyintrnid_stage');

	if (strPickZone != null && strPickZone != '' && emptyZoneFlag != 'T') {
		nlapiLogExecution('Error', 'strPickZone if,strLocation', strPickZone
				+ "," + strLocation);
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_zone', null,
				'anyof', strPickZone));
	}

	if (strLocation != null && strLocation != '')
		result.addFilter(new nlobjSearchFilter('location', null, 'anyof',
				strLocation));

	result.addFilter(new nlobjSearchFilter('inactive', null, 'is', 'F'));

	if (maxno != -1) {
		result.addFilter(new nlobjSearchFilter('internalidnumber', null,
				'greaterthan', parseInt(maxno)));
	}

	var resLen = result.runSearch();
	nlapiLogExecution('Error', 'resLen ', resLen);
	var q = 0;
	var resultSet = resLen
			.forEachResult(function(searchResult) {
				q++;

				objBinByZoneDetails.push(searchResult);

				if (q == 4000) {
					maxno = searchResult.getValue('internalid');
					fnGetPickReportBinsbyZonesAlongWithStage(strPickZone,
							strLocation, maxno, objBinByZoneDetails,
							emptyZoneFlag, request, schtype);
					return false;
				}
				return true; // return true to keep iterating
			});

	return objBinByZoneDetails;
}
/**
 * To get storage Bin locations details based on Pick Zone sorted by Internal Id
 */
function fnGetPickReportBinsbyZones(strPickZone, strLocation, maxno,
		objBinByZoneDetails, emptyZoneFlag, request, schtype) {
	var context = nlapiGetContext();
	if (context.getRemainingUsage() <= 200) {
		var singleorderscheduler;
		if (schtype == "SingleOrder")
			singleorderscheduler = Invokesingleordersch(request);
		else if (schtype == "SingleOrderscheduler")
			singleorderscheduler = Invokesingleorderschyield(request);
		else if (schtype == "MultiOrder")
			singleorderscheduler = Invokingmultiordersch(request);
		else if (schtype == "MultiOrderscheduler")
			singleorderscheduler = Invokingmultiorderschyield(request);

		return singleorderscheduler;
	} else {
		nlapiLogExecution('Error', 'into else');
		var result = nlapiLoadSearch('bin',
				'customsearch_wmsse_binssort_byinternalid');

		if (strPickZone != null && strPickZone != '' && emptyZoneFlag != 'T') {
			result.addFilter(new nlobjSearchFilter('custrecord_wmsse_zone',
					null, 'anyof', strPickZone));
		} else {
			if (strPickZone.indexOf('@NONE@') == -1) {
				strPickZone.push('@NONE@');
			}
			result.addFilter(new nlobjSearchFilter('custrecord_wmsse_zone',
					null, 'anyof', strPickZone));
		}

		if (strLocation != null && strLocation != '')
			result.addFilter(new nlobjSearchFilter('location', null, 'anyof',
					strLocation));

		result.addFilter(new nlobjSearchFilter('inactive', null, 'is', 'F'));

		if (maxno != -1) {
			result.addFilter(new nlobjSearchFilter('internalidnumber', null,
					'greaterthan', parseInt(maxno)));
		}
		var resLen = result.runSearch();
		var q = 0;
		var resultSet = resLen.forEachResult(function(searchResult) {
			q++;
			objBinByZoneDetails.push(searchResult);
			if (q == 4000) {
				maxno = searchResult.getValue('internalid');
				fnGetPickReportBinsbyZones(strPickZone, strLocation, maxno,
						objBinByZoneDetails, emptyZoneFlag, request, schtype);
				return false;
			}
			return true; // return true to keep iterating
		});

		return objBinByZoneDetails;
	}
}
/**
 * To Invokemultiorderscheduler based on script usage
 */
function Invokingmultiorderschyield(context) {

	try {

		var vcuruserId = context.getUser();
		var vSoNum = context.getSetting('SCRIPT',
				'custscript_wmsse_orderno_lst');
		var vPickReportNo = context.getSetting('SCRIPT',
				'custscript_wmsse_pick_rptno');
		var VorderType = context.getSetting('SCRIPT',
				'custscript_wmsse_ordertype');
		var Vcustomer = context.getSetting('SCRIPT',
				'custscript_wmsse_customer');
		var VshipDate = context.getSetting('SCRIPT',
				'custscript_wmsse_shipdate');
		var vQty = context.getSetting('SCRIPT', 'custscript_wmsse_qbqty');
		var vnoofLines = context.getSetting('SCRIPT',
				'custscript_wmsse_nooflines');
		var vshipcomplete = context.getSetting('SCRIPT',
				'custscript_wmsse_shipcomplete');
		var vTaskAssignTo = context.getSetting('SCRIPT',
				'custscript_wmsse_qbemployee');
		var VtranType = context.getSetting('SCRIPT',
				'custscript_wmsse_trantype');
		var Vdepartment = context.getSetting('SCRIPT',
				'custscript_wmsse_department');
		var Vclass = context.getSetting('SCRIPT', 'custscript_wmsse_class');
		var vrePrint = context.getSetting('SCRIPT', 'custscript_wmsse_reprint');
		var VwhLocation = context.getSetting('SCRIPT',
				'custscript_wmsse_whlocation');
		var Vshipmethod = context.getSetting('SCRIPT',
				'custscript_wmsse_shipmethod');
		var Vitemfamily = context.getSetting('SCRIPT',
				'custscript_wmsse_itemfamily');
		var Vitemgroup = context.getSetting('SCRIPT',
				'custscript_wmsse_itemgroup');
		setRecoveryPoint();

		var curuserId = context.getUser();
		nlapiLogExecution('Audit',
				'Calling Second Scheduler - Remaining Usage', context
						.getRemainingUsage());
		var state = nlapiYieldScript();
		if (state.status == 'FAILURE') {
			nlapiLogExecution("Error",
					"Failed to yield script, exiting: Reason = " + state.reason
							+ " / Size = " + state.size);

			nlapiLogExecution('Audit',
					'Calling Second Scheduler - Remaining Usage', context
							.getRemainingUsage());

			var param = new Array();

			param['custscript_wmsse_orderno_lst'] = vSoNum;
			param['custscript_wmsse_pick_rptno'] = vPickReportNo;
			param['custscript_wmsse_trantype'] = VtranType;
			param['custscript_wmsse_customer'] = Vcustomer;
			param['custscript_wmsse_shipdate'] = VshipDate;
			param['custscript_wmsse_qbqty'] = vQty;
			param['custscript_wmsse_nooflines'] = vnoofLines;
			param['custscript_wmsse_shipcomplete'] = vshipcomplete;
			param['custscript_wmsse_qbemployee'] = vTaskAssignTo;
			param['custscript_wmsse_ordertype'] = VorderType;
			param['custscript_wmsse_department'] = Vdepartment;
			param['custscript_wmsse_class'] = Vclass;
			param['custscript_wmsse_reprint'] = vrePrint;
			param['custscript_wmsse_whlocation'] = VwhLocation;
			nlapiScheduleScript('customscript_wmsse_multiord_pickrpt_sch',
					null, param);
			return 'scheduleScriptinvoked';
		} else if (state.status == 'RESUME') {
			nlapiLogExecution("Error", "Resuming script because of "
					+ state.reason + ".  Size = " + state.size);
		}
	} catch (e) {
		nlapiLogExecution('Error', 'unexpected error', e.toString());
	}
}

/**
 * To Invokesinglescheduler based on script usage
 */
function Invokesingleorderschyield(context) {

	try {

		var vcuruserId = context.getUser();
		var vSoNum = new Array();
		vSoNum = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_orderno_lst');
		var vSoNumLst = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_orderno_lst');
		nlapiLogExecution('ERROR', 'vSoNum.length', vSoNum.length);
		var vPickReportNo = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_pick_rptno');
		var VorderType = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_ordertype');
		var Vcustomer = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_customer');
		var VshipDate = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_shipdate');
		var vQty = context.getSetting('SCRIPT', 'custscript_wmsse_sng_qbqty');
		var vnoofLines = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_nooflines');
		var vshipcomplete = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_shipcomplete');
		var vTaskAssignTo = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_qbemployee');
		var VtranType = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_trantype');
		var Vdepartment = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_department');
		var Vclass = context.getSetting('SCRIPT', 'custscript_wmsse_sng_class');
		var vrePrint = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_reprint');
		var VwhLocation = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_whlocation');
		var Vshipmethod = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_shipmethod');
		var Vitemfamily = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_itemfamily');
		var Vitemgroup = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_itemgroup');
		var Vtranidlist = context.getSetting('SCRIPT',
				'custscript_wmsse_sng_tranid_lst');
		setRecoveryPoint();

		var curuserId = context.getUser();
		nlapiLogExecution('Audit',
				'Calling Second Scheduler - Remaining Usage', context
						.getRemainingUsage());
		var state = nlapiYieldScript();
		if (state.status == 'FAILURE') {
			nlapiLogExecution("Error",
					"Failed to yield script, exiting: Reason = " + state.reason
							+ " / Size = " + state.size);

			nlapiLogExecution('Audit',
					'Calling Second Scheduler - Remaining Usage', context
							.getRemainingUsage());

			var param = new Array();
			param['custscript_wmsse_sng_orderno_lst'] = vSoNumLst;
			param['custscript_wmsse_sng_pick_rptno'] = vPickReportNo;
			param['custscript_wmsse_sng_ordertype'] = VorderType;
			param['custscript_wmsse_sng_customer'] = Vcustomer;
			param['custscript_wmsse_sng_shipdate'] = VshipDate;
			param['custscript_wmsse_sng_qbqty'] = vQty;
			param['custscript_wmsse_sng_nooflines'] = vnoofLines;
			param['custscript_wmsse_sng_shipcomplete'] = vshipcomplete;
			param['custscript_wmsse_sng_qbemployee'] = vTaskAssignTo;
			param['custscript_wmsse_sng_trantype'] = VtranType;
			param['custscript_wmsse_sng_department'] = Vdepartment;
			param['custscript_wmsse_sng_class'] = Vclass;
			param['custscript_wmsse_sng_reprint'] = vrePrint;
			param['custscript_wmsse_sng_whlocation'] = VwhLocation;
			param['custscript_wmsse_sng_shipmethod'] = Vshipmethod;
			param['custscript_wmsse_sng_itemfamily'] = Vitemfamily;
			param['custscript_wmsse_sng_itemgroup'] = Vitemgroup;
			nlapiScheduleScript('customscript_wmsse_singord_pickrpt_sch', null,
					param);
			return 'scheduleScriptinvoked';
		} else if (state.status == 'RESUME') {
			nlapiLogExecution("Error", "Resuming script because of "
					+ state.reason + ".  Size = " + state.size);
		}

	} catch (e) {
		nlapiLogExecution('Error', 'unexpected error', e.toString());
	}
}

function setRecoveryPoint() {
	var state = nlapiSetRecoveryPoint(); // 100 point governance
	nlapiLogExecution("Audit", 'state status', state.status);
	if (state.status == 'SUCCESS')
		return; // we successfully create a new recovery point
	if (state.status == 'RESUME') // a recovery point was previously set, we
									// are resuming due to some unforeseen error
	{
		nlapiLogExecution("Audit", "Resuming script because of " + state.reason
				+ ".  Size = " + state.size);
		// handleScriptRecovery();
	} else if (state.status == 'FAILURE') // we failed to create a new
											// recovery point
	{
		nlapiLogExecution("Audit", "Failed to create recovery point. Reason = "
				+ state.reason + " / Size = " + state.size);
		// handleRecoveryFailure(state);
	}
}
/**
 * To Invokemultiorderscheduler based on script usage
 */
function Invokingmultiordersch(request) {

	try {

		var vSoNum = request.getParameter('custparam_order_no');
		var vSoNumLst = request.getParameter('custparam_order_no');
		var VtranType = request.getParameter('custparam_trantype');
		var VorderType = request.getParameter('custparam_ordertype');
		var Vcustomer = request.getParameter('custparam_customer');
		var VshipDate = request.getParameter('custparam_shipdate');
		var vTaskAssignTo = request.getParameter('custparam_taskassignedto');
		var vnoofLines = request.getParameter('custpage_nooflines');
		var vQty = request.getParameter('custpage_qty');
		var vshipcomplete = request.getParameter('custpage_shipcomplete');
		var whLocation = request.getParameter('custparam_whlocation');
		var vrePrint = request.getParameter('custparam_reprint');
		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');
		var vtranidlst = request.getParameter('custparam_tranid_lst');
		// var vPickReportNo = request.getParameter('custpage_pickreportno');
		var param = new Array();

		param['custscript_wmsse_orderno_lst'] = vSoNumLst;
		param['custscript_wmsse_pick_rptno'] = vPickReportNo;
		param['custscript_wmsse_trantype'] = VtranType;
		param['custscript_wmsse_customer'] = Vcustomer;
		param['custscript_wmsse_shipdate'] = VshipDate;
		param['custscript_wmsse_qbqty'] = vQty;
		param['custscript_wmsse_nooflines'] = vnoofLines;
		param['custscript_wmsse_shipcomplete'] = vshipcomplete;
		param['custscript_wmsse_qbemployee'] = vTaskAssignTo;
		param['custscript_wmsse_ordertype'] = VorderType;
		param['custscript_wmsse_department'] = departments;
		param['custscript_wmsse_class'] = classes;
		param['custscript_wmsse_reprint'] = vrePrint;
		param['custscript_wmsse_whlocation'] = whLocation;

		var schstatus = nlapiScheduleScript(
				'customscript_wmsse_multiord_pickrpt_sch', null, param);

		nlapiLogExecution('Error', 'Scheduled Script Status', schstatus);
		var currentUserID = getCurrentUser();
		updateScheduleScriptStatus('PICK REPORT', currentUserID, 'Submitted',
				vPickReportNo, VtranType);
		return 'scheduleScriptinvoked';

	} catch (e) {
		nlapiLogExecution('Error', 'unexpected error', e.toString());
	}

}

/**
 * To Invokemultiorderscheduler based on script usage
 */
function Invokesingleordersch(request) {

	try {

		var vSoNum = request.getParameter('custparam_order_no');
		var vSoNumLst = request.getParameter('custparam_order_no');
		var VtranType = request.getParameter('custparam_trantype');
		var VorderType = request.getParameter('custparam_ordertype');
		var Vcustomer = request.getParameter('custparam_customer');
		var VshipDate = request.getParameter('custparam_shipdate');
		var vTaskAssignTo = request.getParameter('custparam_taskassignedto');
		var vnoofLines = request.getParameter('custpage_nooflines');
		var vQty = request.getParameter('custpage_qty');
		var vshipcomplete = request.getParameter('custpage_shipcomplete');
		var whLocation = request.getParameter('custparam_whlocation');
		var vrePrint = request.getParameter('custparam_reprint');
		var vtranidlst = request.getParameter('custparam_tranid_lst');
		var vrePrint = request.getParameter('custparam_reprint');
		var vtranidlst = request.getParameter('custparam_tranid_lst');
		var vrePrint = request.getParameter('custparam_reprint');
		var vtranidlst = request.getParameter('custparam_tranid_lst');
		var vClass = request.getParameter('custparam_qbclass');
		var vDepartment = request.getParameter('custparam_qbdepartment');

		var param = new Array();
		param['custscript_wmsse_sng_orderno_lst'] = vSoNumLst;
		param['custscript_wmsse_sng_trantype'] = VtranType;
		param['custscript_wmsse_sng_customer'] = Vcustomer;
		param['custscript_wmsse_sng_shipdate'] = VshipDate;
		param['custscript_wmsse_sng_qbqty'] = vQty;
		param['custscript_wmsse_sng_nooflines'] = vnoofLines;
		param['custscript_wmsse_sng_shipcomplete'] = vshipcomplete;
		param['custscript_wmsse_sng_qbemployee'] = vTaskAssignTo;
		param['custscript_wmsse_sng_ordertype'] = VorderType;
		param['custscript_wmsse_sng_department'] = vDepartment;
		param['custscript_wmsse_sng_class'] = vClass;
		param['custscript_wmsse_sng_reprint'] = vrePrint;
		param['custscript_wmsse_sng_whlocation'] = whLocation;
		param['custscript_wmsse_sng_tranid_lst'] = vtranidlst;

		var schstatus = nlapiScheduleScript(
				'customscript_wmsse_singord_pickrpt_sch', null, param);

		nlapiLogExecution('Error', 'Scheduled Script Status', schstatus);
		var currentUserID = getCurrentUser();
		updateScheduleScriptStatus('Single order pick report SCH',
				currentUserID, 'Submitted', vtranidlst, VtranType);
		return 'scheduleScriptinvoked';

	} catch (e) {
		nlapiLogExecution('Error', 'unexpected error', e.toString());
	}
}

/**
 * To Get Inventory availablestatus
 */
function getinvavailablestatus(makeInvAvailFlagFromSelect) {

	nlapiLogExecution('Error', 'makeInvAvailFlagFromSelect1',
			makeInvAvailFlagFromSelect);
	var wmsInvstatusidArray = new Array();
	var wmsstatusfilter = new Array();

	wmsstatusfilter.push(new nlobjSearchFilter(
			'custrecord_wmsse_makeinventoryflag', null, 'is',
			makeInvAvailFlagFromSelect));
	var objwmsstatusdetails = nlapiSearchRecord(
			'customrecord_wmsse_inventorystatus',
			'customsearch_wmsse_inventorystatus_det', wmsstatusfilter, null);
	if (objwmsstatusdetails != null && objwmsstatusdetails != '') {
		wmsInvstatusidArray.push('@NONE@');
		// wmsInvstatusidArray.push('1');
		for (var statusid = 0; statusid < objwmsstatusdetails.length; statusid++) {
			wmsInvstatusidArray.push(objwmsstatusdetails[statusid].getId());

		}
	}

	return wmsInvstatusidArray;
}

/**
 * To Get Inventory availablestatus from core status record
 */
function getinvavailablestatusFromCore(makeInvAvailFlagFromSelect) {

	nlapiLogExecution('Error', 'makeInvAvailFlagFromSelect1',
			makeInvAvailFlagFromSelect);
	var wmsInvstatusidArray = new Array();
	var wmsstatusfilter = new Array();

	wmsstatusfilter.push(new nlobjSearchFilter('inventoryavailable', null,
			'is', makeInvAvailFlagFromSelect));
	var objwmsstatusdetails = nlapiSearchRecord('inventorystatus',
			'customsearch_wmsse_inventorystatusvalues', wmsstatusfilter, null);
	if (objwmsstatusdetails != null && objwmsstatusdetails != '') {
		wmsInvstatusidArray.push('@NONE@');

		for (var statusid = 0; statusid < objwmsstatusdetails.length; statusid++) {
			wmsInvstatusidArray.push(objwmsstatusdetails[statusid].getId());

		}
	}

	return wmsInvstatusidArray;
}

/**
 * To Get selected Inventory available status
 */
function getselectedstatus(makeInvAvailFlagFromSelect) {
	nlapiLogExecution('Error', 'makeInvAvailFlagFromSelect2',
			makeInvAvailFlagFromSelect);
	var wmsInvstatusidArray = new Array();
	var InvstatusidArray = new Array();
	var getmakeflag;
	var makeinvflag;
	var getstatusname;

	InvstatusidArray.push(new nlobjSearchFilter('internalid', null, 'is',
			makeInvAvailFlagFromSelect));
	var getmakeflagresults = nlapiSearchRecord('inventorystatus',
			'customsearch_wmsse_inventorystatusvalues', InvstatusidArray, null);
	if (getmakeflagresults != null && getmakeflagresults != '') {
		getmakeflag = getmakeflagresults[0].getValue('inventoryavailable');
		getstatusname = getmakeflagresults[0].getValue('Name');
		if (getmakeflag == null || getmakeflag == '')
			makeinvflag = 'T';
		else
			makeinvflag = getmakeflag;
	}

	var wmsstatusfilter = new Array();

	wmsstatusfilter.push(new nlobjSearchFilter(
			'custrecord_wmsse_makeinventoryflag', null, 'is', makeinvflag));
	var objwmsstatusdetails = nlapiSearchRecord(
			'customrecord_wmsse_inventorystatus',
			'customsearch_wmsse_inventorystatus_det', wmsstatusfilter, null);
	if (objwmsstatusdetails != null && objwmsstatusdetails != '') {
		wmsInvstatusidArray.push('@NONE@');
		// if(makeinvflag=='F')
		// wmsInvstatusidArray.push('1');
		for (var statusid = 0; statusid < objwmsstatusdetails.length; statusid++) {
			var statusname = objwmsstatusdetails[statusid].getValue('Name')
			if (getstatusname == statusname || statusname == 'All Available'
					|| statusname == 'Not Available')
				wmsInvstatusidArray.push(objwmsstatusdetails[statusid].getId());

		}
	}

	return wmsInvstatusidArray;
}

/* To submit inventory status change record */

function inventoryStatusChange(itemType, whLocation, whLocationname, itemId,
		itemname, quantity, BinId, batchno, batchid, actualBeginTime, vUnits,
		vStockConversionRate, opentaskQty, fromStatusid, toStatusid) {

	var REC_TYPE = 'inventorystatuschange';
	var invStatusChange = nlapiCreateRecord(REC_TYPE);
	var logMsg = 'LocationId = ' + whLocation + '<br>';
	logMsg = logMsg + 'LocationName = ' + whLocationname + '<br>';
	logMsg = logMsg + 'itemType = ' + itemType + '<br>';
	logMsg = logMsg + 'itemId = ' + itemId + '<br>';
	logMsg = logMsg + 'itemname = ' + itemname + '<br>';
	logMsg = logMsg + 'quantity = ' + quantity + '<br>';
	logMsg = logMsg + 'BinId= ' + BinId + '<br>';
	logMsg = logMsg + 'batchno= ' + batchno + '<br>';
	logMsg = logMsg + 'batchid= ' + batchid + '<br>';
	logMsg = logMsg + 'vUnits= ' + vUnits + '<br>';
	logMsg = logMsg + 'vStockConversionRate= ' + vStockConversionRate + '<br>';
	logMsg = logMsg + 'opentaskQty= ' + opentaskQty + '<br>';
	logMsg = logMsg + 'fromStatusid= ' + fromStatusid + '<br>';
	logMsg = logMsg + 'toStatusid= ' + toStatusid + '<br>';

	nlapiLogExecution('DEBUG', 'Processing inv status change', logMsg);

	invStatusChange.setFieldValue('location', whLocation);
	invStatusChange.setFieldValue('previousstatus', fromStatusid);
	invStatusChange.setFieldValue('revisedstatus', toStatusid);
	invStatusChange.selectNewLineItem('inventory');
	invStatusChange.setCurrentLineItemValue('inventory', 'item', itemId);
	invStatusChange.setCurrentLineItemValue('inventory', 'quantity', quantity);

	if (itemType == "inventoryitem" || itemType == "assemblyitem"
			|| itemType == "lotnumberedinventoryitem"
			|| itemType == "lotnumberedassemblyitem") {

		nlapiLogExecution('ERROR', 'opentaskQty', opentaskQty);
		nlapiLogExecution('ERROR', 'BinId', BinId);

		var compSubRecord = invStatusChange.createCurrentLineItemSubrecord(
				'inventory', 'inventorydetail');
		compSubRecord.selectNewLineItem('inventoryassignment');
		compSubRecord.setCurrentLineItemValue('inventoryassignment',
				'quantity', quantity);
		compSubRecord.setCurrentLineItemValue('inventoryassignment',
				'binnumber', BinId);

		if (itemType == "lotnumberedinventoryitem"
				|| itemType == "lotnumberedassemblyitem")
			compSubRecord.setCurrentLineItemValue('inventoryassignment',
					'receiptinventorynumber', batchno);

		compSubRecord.commitLineItem('inventoryassignment');
		compSubRecord.commit();
		var compSubRecord = null;

	} else {
		var filterssertemp = new Array();
		filterssertemp.push(new nlobjSearchFilter(
				'custrecord_wmsse_ser_status', null, 'is', 'F'));
		filterssertemp.push(new nlobjSearchFilter(
				'custrecord_wmsse_ser_tasktype', null, 'anyof', 18));// 18--XFER
		filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_bin',
				null, 'anyof', BinId));
		filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item',
				null, 'anyof', itemId));
		var columnssertemp1 = new Array();
		columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
		columnssertemp1[1] = new nlobjSearchColumn('name');
		var SrchRecordTmpSerial1 = nlapiSearchRecord(
				'customrecord_wmsse_serialentry', null, filterssertemp,
				columnssertemp1);

		if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '') {
			nlapiLogExecution('ERROR', 'SrchRecordTmpSerial1.length',
					SrchRecordTmpSerial1.length);
			var compSubRecord = invStatusChange.createCurrentLineItemSubrecord(
					'inventory', 'inventorydetail');
			for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
				compSubRecord.selectNewLineItem('inventoryassignment');
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'quantity', 1);
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'receiptinventorynumber', SrchRecordTmpSerial1[n]
								.getValue('custrecord_wmsse_ser_no'));
				compSubRecord.setCurrentLineItemValue('inventoryassignment',
						'binnumber', BinId);
				compSubRecord.commitLineItem('inventoryassignment');

			}
			compSubRecord.commit();
			compSubRecord = null;
			for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
				var TempRecord = SrchRecordTmpSerial1[j];
				var tempSerial = nlapiLoadRecord(
						'customrecord_wmsse_serialentry', TempRecord.getId());
				tempSerial.setFieldValue('id', TempRecord.getId());
				tempSerial.setFieldValue('name', TempRecord.getValue('name'));
				tempSerial
						.setFieldValue(
								'custrecord_wmsse_ser_note1',
								'because of inventory status change completed for serial number  we have marked this serial number as closed');
				tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
				nlapiSubmitRecord(tempSerial);
				TempRecord = null;
			}
		}
		SrchRecordTmpSerial1 = null;
		filterssertemp = null;
		columnssertemp1 = null;
	}

	invStatusChange.commitLineItem('inventory');
	var inventoryCountId = nlapiSubmitRecord(invStatusChange);
	nlapiLogExecution('ERROR', 'inventoryCountId', inventoryCountId);

	var taskType = "XFER";// templorarly kep this,have decide yet confirmly
	var Qty = quantity;
	if (opentaskQty != null && opentaskQty != '' && opentaskQty != 'null'
			&& opentaskQty != 'undefined') {
		Qty = opentaskQty;
	}
	// To update/create open task with Move task type
	updateXFEROpenTaskInventoryStatusChange(itemType, whLocation, itemId, Qty,
			BinId, BinId, batchno, inventoryCountId, taskType, '', '',
			actualBeginTime, vUnits, vStockConversionRate, fromStatusid,
			toStatusid);
	invStatusChange = null;
	return inventoryCountId;
}

/**
 * To create/update open task with XFER Task type
 * 
 * @param itemType
 * @param whLocation
 * @param itemId
 * @param quantity
 * @param fromBinId
 * @param toBinId
 * @param batchno
 * @param inventoryCountId
 * @param taskType
 * @param ActwhLocation
 */
function updateXFEROpenTaskInventoryStatusChange(itemType, whLocation, itemId,
		quantity, fromBinId, toBinId, batchno, inventoryCountId, taskType,
		ActwhLocation, vnSoInternalId, actualBeginTime, vUnits,
		vStockConversionRate, fromStatus, toStatus) {

	var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
	nlapiLogExecution('ERROR', 'Creating Record', 'TRN_OPENTASK');

	if (inventoryCountId != null && inventoryCountId != '')
		customrecord.setFieldValue('name', inventoryCountId);
	customrecord.setFieldValue('custrecord_wmsse_act_begin_date', DateStamp());
	customrecord.setFieldValue('custrecord_wmsse_act_end_date', DateStamp());

	customrecord.setFieldValue('custrecord_wmsse_act_qty', quantity);

	customrecord.setFieldValue('custrecord_wmsse_sku', itemId);

	customrecord.setFieldValue('custrecord_wmsse_expe_qty', quantity);
	if (taskType == "MOVE") {
		customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 19);// storage

		customrecord.setFieldValue('custrecord_wmsse_tasktype', 9); // For MOVE
		if (vnSoInternalId != null && vnSoInternalId != ''
				&& vnSoInternalId != 'null' && vnSoInternalId != 'undefined')
			customrecord.setFieldValue('custrecord_wmsse_order_no',
					vnSoInternalId);
	} else if (taskType == "XFER")// For inventory transfer
	{
		customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 19);// storage

		customrecord.setFieldValue('custrecord_wmsse_tasktype', 18); // For
																		// Inventory
																		// Transfer
		if (ActwhLocation != null && ActwhLocation != '')
			customrecord.setFieldValue('custrecord_wmsse_act_wms_location',
					ActwhLocation);
	}
	if (vUnits != null && vUnits != '' && vUnits != 'null'
			&& vUnits != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_uom', vUnits);

	if (vStockConversionRate != null && vStockConversionRate != ''
			&& vStockConversionRate != 'null'
			&& vStockConversionRate != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_conversionrate',
				vStockConversionRate);

	customrecord.setFieldValue('custrecord_wmsse_actbeginloc', fromBinId);
	customrecord.setFieldValue('custrecord_wmsse_actendloc', toBinId);

	if (itemType == "lotnumberedinventoryitem"
			|| itemType == "lotnumberedassemblyitem") {
		/*
		 * var lotInternalId=getLotInternalId(batchno); if(lotInternalId!=null &&
		 * lotInternalId!='')
		 * customrecord.setFieldValue('custrecord_wmsse_batch_no',lotInternalId);
		 */
		if (batchno != null && batchno != '')
			customrecord.setFieldValue('custrecord_wmsse_batch_num', batchno);

	}
	if (actualBeginTime != null && actualBeginTime != ''
			&& actualBeginTime != 'null' && actualBeginTime != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_actualbegintime',
				actualBeginTime);
	customrecord.setFieldValue('custrecord_wmsse_actualendtime', TimeStamp());

	customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
	customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', itemId);
	if (inventoryCountId != null && inventoryCountId != '')// &&
															// taskType!="XFER")
		customrecord.setFieldValue('custrecord_wmsse_nstrn_ref_no',
				inventoryCountId);

	if (fromStatus != null && fromStatus != '' && fromStatus != "null")
		customrecord.setFieldValue('custrecord_wmsse_inventorystatus',
				fromStatus);

	if (toStatus != null && toStatus != '' && toStatus != "null")
		customrecord.setFieldValue('custrecord_wmsse_inventorystatusto',
				toStatus);

	var currentUserID = getCurrentUser();

	customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);

	var recid = nlapiSubmitRecord(customrecord);
	customrecord = null;
	nlapiLogExecution('ERROR', 'Done creating opentask Record', recid);
	return recid;

}

/**
 * Check Intercompany Cross-Subsidiary Fulfillment feature enable or not
 * 
 * @return True, if feature is enable
 * @return False, if feature is not enable
 * 
 */

function isIntercompanyCrossSubsidiaryFeatureEnabled() {
	var vResult = false;
	try {
		var crossSubsidiaryFeature = nlapiGetContext().getFeature(
				'crosssubsidiaryfulfillment');

		if (crossSubsidiaryFeature != null && crossSubsidiaryFeature != ''
				&& crossSubsidiaryFeature != 'null'
				&& crossSubsidiaryFeature != 'undefined'
				&& crossSubsidiaryFeature != false) {

			vResult = true;

		}
	} catch (e) {

		nlapiLogExecution('ERROR',
				'exception in isIntercompanyCrossSubsidiaryFeatureEnabled', e);

		vResult = false;
	}
	return vResult;
}

function getSOLineDetailskit(sonumber, trantype, itemID, whLocation, lineid) {
	nlapiLogExecution('DEBUG', 'sonumber,trantype,whLocation,itemID', sonumber
			+ "," + trantype + "," + whLocation + "," + itemID);

	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

	var vType = 'SalesOrd';
	if (trantype == 'salesorder')
		vType = 'SalesOrd';
	else if (trantype == 'transferorder')
		vType = 'TrnfrOrd';

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', sonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	if (whLocation != null && whLocation != '' && whLocation != 'undefined'
			&& whLocation != '') {
		if (crossSubsidiaryFeature == true && trantype == "salesorder") {
			filters.push(new nlobjSearchFilter('inventorylocation', null,
					'anyof', [ '@NONE@', whLocation ]));

		} else {
			filters.push(new nlobjSearchFilter('location', null, 'anyof', [
					'@NONE@', whLocation ]));
		}
	}
	if (itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID));
	if (lineid != null && lineid != '' && lineid != 'undefined'
			&& lineid != 'null') {
		if (trantype == 'transferorder')
			lineid = parseInt(lineid) + 1;
		filters.push(new nlobjSearchFilter('line', null, 'equalto', lineid));
	}
	// This search returns required results, 4k records fetching not required.
	var SOLineDetails = new nlapiSearchRecord('transaction',
			'customsearch_wmsse_ordline_details_kit', filters, columns);
	filters = null;
	columns = null;
	return SOLineDetails;
}

function getLocationName(vRoleLocation) {
	var locationArray = new Array();

	var filters = new Array();
	if (vRoleLocation != null && vRoleLocation != '')
		filters.push(new nlobjSearchFilter('internalid', null, 'anyof',
				vRoleLocation));
	var columns = new Array();
	columns.push(new nlobjSearchColumn('name'));
	var searchresults = nlapiSearchRecord('location', null, filters, columns);
	if (searchresults != null && searchresults != '') {
		for (var i = 0; i < searchresults.length; i++) {
			locationArray[i] = new Array();
			locationArray[i][0] = searchresults[i].getId();
			locationArray[i][1] = searchresults[i].getValue('name');
		}
	}
	searchresults = null;
	columns = null;
	filters = null;
	return locationArray;
}

/**
 * Get Barcode Parsing
 * 
 * @parameter :vendor
 * @parameter :barcode string
 * @parameter :warehouse
 * @parameter :transaction id
 * @return : barcode component details
 * 
 */

// Main calling function
function parsebarcodestring(vendor, barcodestring, whlocation, transactionid) {
	var logMsg = 'vendor = ' + vendor + '<br>';
	logMsg = logMsg + 'barcodestring = ' + barcodestring + '<br>';
	logMsg = logMsg + 'whlocation = ' + whlocation + '<br>';
	logMsg = logMsg + 'transactionid = ' + transactionid + '<br>',

	nlapiLogExecution('DEBUG', 'Into parsebarcodestring', logMsg);

	nlapiLogExecution('Error', 'parsebarcodestring function starts',
			TimeStampinSec());

	var barcodeformatarr = getbarcodeformat(vendor, barcodestring); // from
																	// parent
																	// record
	if (barcodeformatarr != null && barcodeformatarr != '') {
		for (bsrchitr = 0; bsrchitr < barcodeformatarr.length; bsrchitr++) {
			var barcodecomponents = {};

			barcodeformatref = barcodeformatarr[bsrchitr].getId();

			nlapiLogExecution('Error', 'getbarcodecomponents function starts',
					TimeStampinSec());
			if (barcodeformatref != null && barcodeformatref != '')
				barcodecomponents = getbarcodecomponents(barcodeformatref,
						barcodestring, whlocation); // from child record

			nlapiLogExecution('Error', 'getbarcodecomponents function ends',
					TimeStampinSec());

			if (barcodecomponents != null && barcodecomponents != ''
					&& barcodecomponents != 'null') {
				nlapiLogExecution('DEBUG', 'barcodecomponents[error]',
						barcodecomponents['error']);
				if (barcodecomponents['error'] == null
						|| barcodecomponents['error'] == ''
						|| barcodecomponents['error'] == 'null') {
					Insertbarcodestring(barcodestring, transactionid,
							barcodeformatref);
					break;
				}
			}
		}
	} else {
		nlapiLogExecution('ERROR',
				'Bar Code formats are not configured for the vendor');
		barcodecomponents["error"] = "Please enter/scan valid item.";
	}

	nlapiLogExecution('Error', 'parsebarcodestring function ends',
			TimeStampinSec());

	nlapiLogExecution('DEBUG', 'Out of parsebarcodestring', barcodecomponents)

	return barcodecomponents;

}

/**
 * Get Barcode Formats for vendor
 * 
 * @parameter :vendor
 * @parameter :barcode string
 * @return : barcode format details
 * 
 */

function getbarcodeformat(vendor, barcodestring) {
	var logMsg = 'vendor = ' + vendor + '<br>';
	logMsg = logMsg + 'barcodestring = ' + barcodestring + '<br>';

	nlapiLogExecution('DEBUG', 'Into getbarcodeformat', logMsg);

	var srchbarcodeformats = new Array();
	var vbarcodeformatref = '';

	if (!isempty(vendor)) {
		var result = nlapiLoadSearch('customrecord_wmsse_barcode_template',
				'customsearch_wmsse_barcodetemplatesearch');

		result.addFilter(new nlobjSearchFilter(
				'custrecord_wmsse_barcodevendor', null, 'anyof', vendor));
		result.addFilter(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var resLen = result.runSearch();
		var srhIterator = 0;
		var resultSet = resLen.forEachResult(function(searchResult) {
			srhIterator++;
			srchbarcodeformats.push(searchResult);
			if (parseFloat(srhIterator) == 4000) {

				return false;
			}
			return true;
		});
	}
	nlapiLogExecution('DEBUG', 'Out of getbarcodeformat', srchbarcodeformats);

	return srchbarcodeformats;
}

/**
 * Get Barcode component values
 * 
 * @parameter :barcodeformat id
 * @parameter :barcode string
 * @parameter :warehouse location
 * @return : barcodencomponent details
 * 
 */

function getbarcodecomponents(barcodeformatref, barcodestring, whlocation) {
	var logMsg = 'barcodeformatref = ' + barcodeformatref + '<br>';
	logMsg = logMsg + 'barcodestring = ' + barcodestring + '<br>';
	logMsg = logMsg + 'whlocation = ' + whlocation + '<br>';

	nlapiLogExecution('DEBUG', 'Into getbarcodecomponents', logMsg);

	var barcodecomponents = {};
	var filters = new Array();
	filters.push(new nlobjSearchFilter('custrecord_wmsse_barcode_templatename',
			null, 'anyof', barcodeformatref));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_componentname');
	columns[1] = new nlobjSearchColumn(
			'custrecord_wmsse_componentstartingindex').setSort();
	columns[2] = new nlobjSearchColumn('custrecord_wmsse_componentendingindex');
	columns[3] = new nlobjSearchColumn('custrecord_wmsse_componentdataformat');
	columns[4] = new nlobjSearchColumn('custrecord_wmsse_barcode_templatename');
	columns[5] = new nlobjSearchColumn(
			'custrecord_wms_barcode_paddingcharacter',
			'custrecord_wmsse_barcode_templatename');

	var srchbarcodecomponents = nlapiSearchRecord(
			'customrecord_wmsse_barcode_components',
			'customsearch_wmsse_barcodecomponents', filters, columns);
	if (srchbarcodecomponents != null && srchbarcodecomponents != '') {
		var vItem = '';
		var vLot = '';
		var vExpiryDate = '';
		var vQty = '';
		var vUOM = '';
		var vSerialNumber = '';

		// If the bar code string is not having all the components configured
		if (barcodestring.length < srchbarcodecomponents[srchbarcodecomponents.length - 1]
				.getValue('custrecord_wmsse_componentendingindex')) {
			barcodecomponents['error'] = 'The scanned bar code format is not supported. Scan an item or composite bar code.';
			return barcodecomponents;
		}

		for (srchitr = 0; srchitr < srchbarcodecomponents.length; srchitr++) {
			var datafield = srchbarcodecomponents[srchitr]
					.getText('custrecord_wmsse_componentname');
			var startindex = srchbarcodecomponents[srchitr]
					.getValue('custrecord_wmsse_componentstartingindex');
			var endindex = srchbarcodecomponents[srchitr]
					.getValue('custrecord_wmsse_componentendingindex');
			var dataformat = srchbarcodecomponents[srchitr]
					.getText('custrecord_wmsse_componentdataformat');
			var paddingchar = srchbarcodecomponents[srchitr].getText(
					'custrecord_wms_barcode_paddingcharacter',
					'custrecord_wmsse_barcode_templatename');

			switch (datafield) {
			case 'Item':
				vItem = barcodestring.substring(parseInt(startindex) - 1,
						parseInt(endindex));
				if (paddingchar != null && paddingchar != '')
					vItem = replaceAll(vItem, paddingchar, '');

				if (vItem != null && vItem != '') {
					vItem = vItem.trim();
					nlapiLogExecution('DEBUG',
							'Item after removing padding character', vItem);
					var curitem = getSKUIdWithName(vItem, whlocation, null,
							null);
					if (curitem != null && curitem != '') {
						barcodecomponents[datafield] = vItem;
						barcodecomponents['ItemIntrid'] = curitem[0];
					} else {
						barcodecomponents['error'] = 'The item on the scanned bar code does not exist in the system.';
					}
				} else {
					barcodecomponents['error'] = 'The item on the scanned bar code does not exist in the system.';
				}
				break;

			case 'Lot':
				vLot = barcodestring.substring(parseInt(startindex) - 1,
						parseInt(endindex));
				if (paddingchar != null && paddingchar != '')
					vLot = replaceAll(vLot, paddingchar, '');
				if (vLot != null && vLot != '') {
					vLot = vLot.trim();
					barcodecomponents[datafield] = vLot;
				} else {
					barcodecomponents[datafield] = '';
				}

				break;

			case 'Expiry Date':
				vExpiryDate = barcodestring.substring(parseInt(startindex) - 1,
						parseInt(endindex));
				if (paddingchar != null && paddingchar != '')
					vExpiryDate = replaceAll(vExpiryDate, paddingchar, '');

				if (vExpiryDate != null && vExpiryDate != '') {
					vExpiryDate = vExpiryDate.trim();
					if (vExpiryDate.length == dataformat.length) {
						var expiryDateFormat = DateSetting();
						var actexpirydate = getvalidexpirydate(vExpiryDate,
								dataformat);
						var getExpDateresult = ValidateDate(actexpirydate,
								expiryDateFormat);

						if (getExpDateresult == null || getExpDateresult == "") {
							barcodecomponents['error'] = 'The Expiry Date on the scanned bar code has an invalid format. The date format must match the format configured on the associated composite bar code template.';
						} else {
							barcodecomponents[datafield] = actexpirydate;
						}
					} else {
						barcodecomponents['error'] = 'The Expiry Date on the scanned bar code has an invalid format. The date format must match the format configured on the associated composite bar code template.';
					}

				} else {
					barcodecomponents[datafield] = '';
				}
				break;

			case 'Quantity':
				vQty = barcodestring.substring(parseInt(startindex) - 1,
						parseInt(endindex));
				if (paddingchar != null && paddingchar != '')
					vQty = replaceAll(vQty, paddingchar, '');
				if (vQty != null && vQty != '') {
					vQty = vQty.trim();
					// below code is used to replace the extra zeros, i.e 0001
					// replace 1
					vQty = vQty.replace(/^0+/, '');
				}
				if (parseFloat(vQty) > 0 && !isNaN(vQty)) {
					barcodecomponents[datafield] = vQty;
				} else {
					barcodecomponents['error'] = 'The Quantity value on the scanned bar code is invalid. The value can contain numerals only.';
				}
				break;

			case 'UOM':
				vUOM = barcodestring.substring(parseInt(startindex) - 1,
						parseInt(endindex));
				if (paddingchar != null && paddingchar != '')
					vUOM = replaceAll(vUOM, paddingchar, '');
				if (vUOM != null && vUOM != '')
					vUOM = vUOM.trim();
				if (!isempty(vUOM)) {
					var vResults = getUnitsTypeforBarcode(vUOM);
					if (vResults != null && vResults != ''
							&& vResults != 'null' && vResults != 'undefined') {
						barcodecomponents[datafield] = vUOM;
					} else {
						barcodecomponents['error'] = "The UOM on the scanned bar code does not exist in the system.";
					}
				} else {
					barcodecomponents[datafield] = '';
				}
				break;

			case 'Serial Number':
				vSerialNumber = barcodestring.substring(
						parseInt(startindex) - 1, parseInt(endindex));
				if (paddingchar != null && paddingchar != '')
					vSerialNumber = replaceAll(vSerialNumber, paddingchar, '');
				if (vSerialNumber != null && vSerialNumber != '')
					vSerialNumber = vSerialNumber.trim();
				var serValidationArr = new Array();
				if (!isempty(vSerialNumber)) {
					var serLen = vSerialNumber.length;
					for (var serItr = 0; serItr < serLen; serItr++) {
						serValidationArr.push(vSerialNumber[serItr]);
					}

					if (serValidationArr.indexOf('[') != -1
							|| serValidationArr.indexOf('+') != -1
							|| serValidationArr.indexOf('\\') != -1
							|| serValidationArr.indexOf(';') != -1
							|| serValidationArr.indexOf('<') != -1
							|| serValidationArr.indexOf('>') != -1
							|| serValidationArr.indexOf('{') != -1
							|| serValidationArr.indexOf('}') != -1
							|| serValidationArr.indexOf('(') != -1
							|| serValidationArr.indexOf(')') != -1
							|| serValidationArr.indexOf("'") != -1) {
						barcodecomponents['error'] = "The Serial Number on the scanned bar code should not contain special characters.";
					} else {
						barcodecomponents[datafield] = vSerialNumber;
					}
				} else {
					barcodecomponents[datafield] = '';
				}
				break;

			default:
				var defcompval = barcodestring.substring(
						parseInt(startindex) - 1, parseInt(endindex));
				if (paddingchar != null && paddingchar != '')
					defcompval = replaceAll(defcompval, paddingchar, '');
				defcompval = defcompval.trim();
				barcodecomponents[datafield] = defcompval;
				break;
			}
		}

		var componentCount = Object.keys(barcodecomponents).length;

		var logMsg1 = 'componentCount = ' + componentCount + '<br>';
		logMsg1 = logMsg1 + 'searchbarcode length = '
				+ srchbarcodecomponents.length + '<br>';
		nlapiLogExecution('DEBUG', 'getbarcodecomponents', logMsg1);

		if (barcodecomponents['error'] == null
				|| barcodecomponents['error'] == '') {
			if (componentCount < srchbarcodecomponents.length) {
				barcodecomponents['error'] = 'The size of index range for the scanned bar code does not match the size configured on the associated composite bar code template.';
			}
		}
	} else {
		nlapiLogExecution('DEBUG',
				'Components are not configured for the Template');
		barcodecomponents['error'] = "The scanned bar code format is not supported. Scan an item or composite bar code.";
	}
	nlapiLogExecution('DEBUG', 'out getbarcodecomponents', barcodecomponents);
	return barcodecomponents;
}

function getvalidexpirydate(expDate, dateformat) {
	var vyear = '';
	var vmonth = '';
	var vday = '';

	if (dateformat == 'MMDDYY') {
		vmonth = expDate.substring(0, 2);
		vday = expDate.substring(2, 4);
		vyear = expDate.substring(4, 6);
	} else if (dateformat == 'DDMMYY') {
		vday = expDate.substring(0, 2);
		vmonth = expDate.substring(2, 4);
		vyear = expDate.substring(4, 6);
	} else if (dateformat == 'YYDDMM') {
		vyear = expDate.substring(0, 2);
		vday = expDate.substring(2, 4);
		vmonth = expDate.substring(4, 6);
	} else if (dateformat == 'YYMMDD') {
		vyear = expDate.substring(0, 2);
		vmonth = expDate.substring(2, 4);
		vday = expDate.substring(4, 6);
	}

	var now = new Date();
	var yearPrefix = now.getFullYear().toString();
	yearPrefix = yearPrefix.substring(0, 2);

	vyear = yearPrefix + vyear;

	var expiryDateFormat = DateSetting();
	var expiryDate = setExpiryDate(expiryDateFormat, vmonth, vday, vyear);

	return expiryDate;
}

function setExpiryDate(expiryDateFormat, vmonth, vday, vyear) {
	var expDate = '';

	if (expiryDateFormat == 'MM/DD/YYYY') {
		if (vmonth.length == 3) {
			var months = {
				'JAN' : '01',
				'FEB' : '02',
				'MAR' : '03',
				'APR' : '04',
				'MAY' : '05',
				'JUN' : '06',
				'JUL' : '07',
				'AUG' : '08',
				'SEP' : '09',
				'OCT' : '10',
				'NOV' : '11',
				'DEC' : '12'
			};
			vmonth = months[vmonth];
		} else if (vmonth.length > 4) {
			var months = {
				'JANUARY' : 'Jan',
				'FEBRUARY' : 'Feb',
				'MARCH' : 'Mar',
				'APRIL' : 'Apr',
				'MAY' : 'May',
				'JUNE' : 'Jun',
				'JULY' : 'Jul',
				'AUGUST' : 'Aug',
				'SEPTEMBER' : 'Sep',
				'OCTOBER' : 'Oct',
				'NOVEMBER' : 'Nov',
				'DECEMBER' : 'Dec'
			};
			vmonth = months[vmonth];
		}

		expDate = vmonth + "/" + vday + "/" + vyear;
	}

	if (expiryDateFormat == 'DD/MM/YYYY') {
		if (vmonth.length == 3) {
			var months = {
				'JAN' : '01',
				'FEB' : '02',
				'MAR' : '03',
				'APR' : '04',
				'MAY' : '05',
				'JUN' : '06',
				'JUL' : '07',
				'AUG' : '08',
				'SEP' : '09',
				'OCT' : '10',
				'NOV' : '11',
				'DEC' : '12'
			};
			vmonth = months[vmonth];
		} else if (vmonth.length > 4) {
			var months = {
				'JANUARY' : '01',
				'FEBRUARY' : '02',
				'MARCH' : '03',
				'APRIL' : '04',
				'MAY' : '05',
				'JUNE' : '06',
				'JULY' : '07',
				'AUGUST' : '08',
				'SEPTEMBER' : '09',
				'OCTOBER' : '10',
				'NOVEMBER' : '11',
				'DECEMBER' : '12'
			};
			vmonth = months[vmonth];
		}

		expDate = vday + "/" + vmonth + "/" + vyear;
	}

	if (expiryDateFormat == 'DD-Mon-YYYY') {
		if (vmonth.length == 2) {
			var months = {
				'01' : 'Jan',
				'02' : 'Feb',
				'03' : 'Mar',
				'04' : 'Apr',
				'05' : 'May',
				'06' : 'Jun',
				'07' : 'Jul',
				'08' : 'Aug',
				'09' : 'Sep',
				'10' : 'Oct',
				'11' : 'Nov',
				'12' : 'Dec'
			};
			vmonth = months[vmonth];
		} else if (vmonth.length > 4) {
			var months = {
				'JANUARY' : 'Jan',
				'FEBRUARY' : 'Feb',
				'MARCH' : 'Mar',
				'APRIL' : 'Apr',
				'MAY' : 'May',
				'JUNE' : 'Jun',
				'JULY' : 'Jul',
				'AUGUST' : 'Aug',
				'SEPTEMBER' : 'Sep',
				'OCTOBER' : 'Oct',
				'NOVEMBER' : 'Nov',
				'DECEMBER' : 'Dec'
			};
			vmonth = months[vmonth];
		}

		expDate = vday + "-" + vmonth + "-" + vyear;
	}

	if (expiryDateFormat == 'DD.MM.YYYY') {
		if (vmonth.length == 3) {
			var months = {
				'JAN' : '01',
				'FEB' : '02',
				'MAR' : '03',
				'APR' : '04',
				'MAY' : '05',
				'JUN' : '06',
				'JUL' : '07',
				'AUG' : '08',
				'SEP' : '09',
				'OCT' : '10',
				'NOV' : '11',
				'DEC' : '12'
			};
			vmonth = months[vmonth];
		} else if (vmonth.length > 4) {
			var months = {
				'JANUARY' : '01',
				'FEBRUARY' : '02',
				'MARCH' : '03',
				'APRIL' : '04',
				'MAY' : '05',
				'JUNE' : '06',
				'JULY' : '07',
				'AUGUST' : '08',
				'SEPTEMBER' : '09',
				'OCTOBER' : '10',
				'NOVEMBER' : '11',
				'DECEMBER' : '12'
			};
			vmonth = months[vmonth];
		}

		expDate = vday + "." + vmonth + "." + vyear;
	}

	if (expiryDateFormat == 'DD-MONTH-YYYY') {
		if (vmonth.length == 3) {
			months = {
				'Jan' : 'JANUARY',
				'Feb' : 'FEBRUARY',
				'Mar' : 'MARCH',
				'Apr' : 'APRIL',
				'May' : 'MAY',
				'Jun' : 'JUNE',
				'Jul' : 'JULY',
				'Aug' : 'AUGUST',
				'Sep' : 'SEPTEMBER',
				'Oct' : 'OCTOBER',
				'Nov' : 'NOVEMBER',
				'Dec' : 'DECEMBER'
			};
			vmonth = months[vmonth];
		} else {
			months = {
				'01' : 'JANUARY',
				'02' : 'FEBRUARY',
				'03' : 'MARCH',
				'04' : 'APRIL',
				'05' : 'MAY',
				'06' : 'JUNE',
				'07' : 'JULY',
				'08' : 'AUGUST',
				'09' : 'SEPTEMBER',
				'10' : 'OCTOBER',
				'11' : 'NOVEMBER',
				'12' : 'DECEMBER'
			};
			vmonth = months[vmonth];
		}
		expDate = vday + "-" + vmonth + "-" + vyear;
	}

	if (expiryDateFormat == 'DD MONTH, YYYY') {
		if (vmonth.length == 3) {
			months = {
				'Jan' : 'JANUARY',
				'Feb' : 'FEBRUARY',
				'Mar' : 'MARCH',
				'Apr' : 'APRIL',
				'May' : 'MAY',
				'Jun' : 'JUNE',
				'Jul' : 'JULY',
				'Aug' : 'AUGUST',
				'Sep' : 'SEPTEMBER',
				'Oct' : 'OCTOBER',
				'Nov' : 'NOVEMBER',
				'Dec' : 'DECEMBER'
			};
			vmonth = months[vmonth];
		} else {
			months = {
				'01' : 'JANUARY',
				'02' : 'FEBRUARY',
				'03' : 'MARCH',
				'04' : 'APRIL',
				'05' : 'MAY',
				'06' : 'JUNE',
				'07' : 'JULY',
				'08' : 'AUGUST',
				'09' : 'SEPTEMBER',
				'10' : 'OCTOBER',
				'11' : 'NOVEMBER',
				'12' : 'DECEMBER'
			};
			vmonth = months[vmonth];
		}
		expDate = vday + " " + vmonth + ", " + vyear;
	}

	if (expiryDateFormat == 'YYYY/MM/DD') {
		if (vmonth.length == 3) {
			var months = {
				'JAN' : '01',
				'FEB' : '02',
				'MAR' : '03',
				'APR' : '04',
				'MAY' : '05',
				'JUN' : '06',
				'JUL' : '07',
				'AUG' : '08',
				'SEP' : '09',
				'OCT' : '10',
				'NOV' : '11',
				'DEC' : '12'
			};
			vmonth = months[vmonth];
		} else if (vmonth.length > 4) {
			var months = {
				'JANUARY' : '01',
				'FEBRUARY' : '02',
				'MARCH' : '03',
				'APRIL' : '04',
				'MAY' : '05',
				'JUNE' : '06',
				'JULY' : '07',
				'AUGUST' : '08',
				'SEPTEMBER' : '09',
				'OCTOBER' : '10',
				'NOVEMBER' : '11',
				'DECEMBER' : '12'
			};
			vmonth = months[vmonth];
		}

		expDate = vyear + "/" + vmonth + "/" + vday;
	}

	if (expiryDateFormat == 'YYYY-MM-DD') {
		if (vmonth.length == 3) {
			var months = {
				'JAN' : '01',
				'FEB' : '02',
				'MAR' : '03',
				'APR' : '04',
				'MAY' : '05',
				'JUN' : '06',
				'JUL' : '07',
				'AUG' : '08',
				'SEP' : '09',
				'OCT' : '10',
				'NOV' : '11',
				'DEC' : '12'
			};
			vmonth = months[vmonth];
		} else if (vmonth.length > 4) {
			var months = {
				'JANUARY' : '01',
				'FEBRUARY' : '02',
				'MARCH' : '03',
				'APRIL' : '04',
				'MAY' : '05',
				'JUNE' : '06',
				'JULY' : '07',
				'AUGUST' : '08',
				'SEPTEMBER' : '09',
				'OCTOBER' : '10',
				'NOVEMBER' : '11',
				'DECEMBER' : '12'
			};
			vmonth = months[vmonth];
		}

		expDate = vyear + "-" + vmonth + "-" + vday;
	}

	return expDate;
}

/**
 * Check provided parameter is empty or not
 * 
 * @return true, if parameter is empty
 * @return false, if parameter is not empty
 */

function isempty(vParameter) {

	if (vParameter != null && vParameter != '' && vParameter != 'null'
			&& vParameter != 'undefined' && vParameter != undefined)
		return false;
	else
		return true
}

/**
 * Get UOM values
 * 
 */

function getUnitsTypeforBarcode(uom) {
	var results = '';
	try {
		var uomfilters = new Array();

		uomfilters.push(new nlobjSearchFilter('unitname', null, 'is', uom));

		results = nlapiSearchRecord('unitstype',
				'customsearch_wmsse_unitstype', uomfilters, null);

	} catch (e) {
		nlapiLogExecution('ERROR', 'exception in getUnitsType', e);
	}

	return results;
}

/**
 * Insert barcode string in custom record
 * 
 * 
 */
function Insertbarcodestring(vbarcodestring, vtranaction, vbarcodetempid) {
	try {
		var vfilters = new Array();

		vfilters.push(new nlobjSearchFilter('custrecord_wmsse_barcode_string',
				null, 'is', vbarcodestring));

		var Searchresults = nlapiSearchRecord(
				'customrecord_wmsse_barcode_strings',
				'customsearch_wmsse_barcode_string', vfilters, null);
		if (Searchresults == null || Searchresults == "") {

			var barcoderecord = nlapiCreateRecord('customrecord_wmsse_barcode_strings');
			barcoderecord.setFieldValue('name', vtranaction);
			barcoderecord.setFieldValue('custrecord_wmsse_barcode_string',
					vbarcodestring);
			barcoderecord.setFieldValue(
					'custrecord_wmsse_barcode_transactionno', vtranaction);
			barcoderecord.setFieldValue(
					'custrecord_wmsse_barcode_templaterefno', vbarcodetempid);
			var recid = nlapiSubmitRecord(barcoderecord);
		}
	} catch (e) {
		nlapiLogExecution('ERROR', 'Exception in Insertbarcodestring', e);
	}

}

/**
 * To parse barcode string for outside receiving processes
 * 
 * @parameter :barcode string
 * @parameter :warehouse location
 * @return : barcodencomponent details
 * 
 */

function parsebarcodeoutsidereceiving(barcodestring, whlocation) {
	var logMsg = 'barcodestring = ' + barcodestring + '<br>';
	logMsg = logMsg + 'whlocation = ' + whlocation + '<br>';

	nlapiLogExecution('DEBUG', 'Into parsebarcodeoutsidereceiving', logMsg);

	nlapiLogExecution('Error', 'parsebarcodeoutsidereceiving function starts',
			TimeStampinSec());

	var barcodecomponents = {};

	var filters = new Array();

	filters.push(new nlobjSearchFilter('custrecord_wmsse_barcode_string', null,
			'is', barcodestring));

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_barcode_templaterefno');

	var searchresults = nlapiSearchRecord('customrecord_wmsse_barcode_strings',
			'customsearch_wmsse_barcode_string', filters, columns);
	if (searchresults != null && searchresults != "") {
		var barcodetemplaterefno = searchresults[0]
				.getValue('custrecord_wmsse_barcode_templaterefno');

		nlapiLogExecution('Error', 'getbarcodecomponents function starts',
				TimeStampinSec());
		barcodecomponents = getbarcodecomponents(barcodetemplaterefno,
				barcodestring, whlocation);
		if (barcodecomponents == null || barcodecomponents == '') {
			nlapiLogExecution('DEBUG',
					'Components are not configured for the Template');
			barcodecomponents['error'] = "The scanned bar code format is not supported. Scan an item or composite bar code.";
		}
		nlapiLogExecution('Error', 'getbarcodecomponents function ends',
				TimeStampinSec());
	} else {
		nlapiLogExecution('DEBUG', 'Bar Code string is not available');
		barcodecomponents["error"] = "Please enter/scan valid item.";
	}

	nlapiLogExecution('Error', 'parsebarcodeoutsidereceiving function ends',
			TimeStampinSec());
	return barcodecomponents;
}

/**
 * To create/update open task with Move task type
 * 
 * @param itemType
 * @param whLocation
 * @param itemId
 * @param quantity
 * @param fromBinId
 * @param toBinId
 * @param batchno
 * @param inventoryCountId
 * @param taskType
 * @param ActwhLocation
 */
function updateMoveOpenTaskforInventory(itemType, whLocation, itemId, quantity,
		fromBinId, toBinId, batchno, inventoryCountId, taskType, ActwhLocation,
		vnSoInternalId, actualBeginTime, vUnits, vStockConversionRate,
		fromStatus, toStatus) {

	var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
	nlapiLogExecution('DEBUG', 'Creating Record new', 'TRN_OPENTASK');

	var logMsg = 'itemType = ' + itemType + '<br>';
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'itemId = ' + itemId + '<br>';
	logMsg = logMsg + 'quantity = ' + quantity + '<br>';
	logMsg = logMsg + 'fromBinId = ' + fromBinId + '<br>';
	logMsg = logMsg + 'toBinId = ' + toBinId + '<br>';
	logMsg = logMsg + 'batchno = ' + batchno + '<br>';
	logMsg = logMsg + 'inventoryCountId = ' + inventoryCountId + '<br>';
	logMsg = logMsg + 'taskType = ' + taskType + '<br>';
	logMsg = logMsg + 'ActwhLocation = ' + ActwhLocation + '<br>';
	logMsg = logMsg + 'vnSoInternalId = ' + vnSoInternalId + '<br>';
	logMsg = logMsg + 'vUnits = ' + vUnits + '<br>';
	logMsg = logMsg + 'vStockConversionRate = ' + vStockConversionRate + '<br>';
	logMsg = logMsg + 'fromStatus = ' + fromStatus + '<br>';
	logMsg = logMsg + 'toStatus = ' + toStatus + '<br>';
	nlapiLogExecution('DEBUG', 'updateMoveOpenTaskforInventory logs', logMsg);

	if (inventoryCountId != null && inventoryCountId != '')
		customrecord.setFieldValue('name', inventoryCountId);
	customrecord.setFieldValue('custrecord_wmsse_act_begin_date', DateStamp());
	customrecord.setFieldValue('custrecord_wmsse_act_end_date', DateStamp());

	customrecord.setFieldValue('custrecord_wmsse_act_qty', quantity);

	customrecord.setFieldValue('custrecord_wmsse_sku', itemId);

	customrecord.setFieldValue('custrecord_wmsse_expe_qty', quantity);
	if (taskType == "MOVE") {
		customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 19);// storage

		customrecord.setFieldValue('custrecord_wmsse_tasktype', 9); // For MOVE
		if (vnSoInternalId != null && vnSoInternalId != ''
				&& vnSoInternalId != 'null' && vnSoInternalId != 'undefined')
			customrecord.setFieldValue('custrecord_wmsse_order_no',
					vnSoInternalId);
	} else if (taskType == "XFER")// For inventory transfer
	{
		customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 19);// storage

		customrecord.setFieldValue('custrecord_wmsse_tasktype', 18); // For
																		// Inventory
																		// Transfer
		if (ActwhLocation != null && ActwhLocation != '')
			customrecord.setFieldValue('custrecord_wmsse_act_wms_location',
					ActwhLocation);
	}
	if (vUnits != null && vUnits != '' && vUnits != 'null'
			&& vUnits != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_uom', vUnits);

	if (vStockConversionRate != null && vStockConversionRate != ''
			&& vStockConversionRate != 'null'
			&& vStockConversionRate != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_conversionrate',
				vStockConversionRate);

	customrecord.setFieldValue('custrecord_wmsse_actbeginloc', fromBinId);
	customrecord.setFieldValue('custrecord_wmsse_actendloc', toBinId);

	if (itemType == "lotnumberedinventoryitem"
			|| itemType == "lotnumberedassemblyitem") {
		/*
		 * var lotInternalId=getLotInternalId(batchno); if(lotInternalId!=null &&
		 * lotInternalId!='')
		 * customrecord.setFieldValue('custrecord_wmsse_batch_no',lotInternalId);
		 */
		if (batchno != null && batchno != '')
			customrecord.setFieldValue('custrecord_wmsse_batch_num', batchno);

	}
	if (actualBeginTime != null && actualBeginTime != ''
			&& actualBeginTime != 'null' && actualBeginTime != 'undefined')
		customrecord.setFieldValue('custrecord_wmsse_actualbegintime',
				actualBeginTime);
	customrecord.setFieldValue('custrecord_wmsse_actualendtime', TimeStamp());

	customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
	customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', itemId);
	if (inventoryCountId != null && inventoryCountId != ''
			&& taskType != "XFER")
		customrecord.setFieldValue('custrecord_wmsse_nsconfirm_ref_no',
				inventoryCountId);

	if (fromStatus != null && fromStatus != '' && fromStatus != "null")
		customrecord.setFieldValue('custrecord_wmsse_inventorystatus',
				fromStatus);

	if (toStatus != null && toStatus != '' && toStatus != "null")
		customrecord.setFieldValue('custrecord_wmsse_inventorystatusto',
				toStatus);

	var currentUserID = getCurrentUser();

	customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);

	var recid = nlapiSubmitRecord(customrecord);
	customrecord = null;
	nlapiLogExecution('DEBUG', 'Done creating opentask Record', recid);
	return recid;

}

/**
 * Get UOM Conversion Rate
 * 
 * @parameter :uom name
 * @return : uom conversion rate
 * 
 */

function getConversionRate(uomname) {
	var uomfilters = new Array();
	var vconversionrate = 1;
	if (uomname != null && uomname != '') {
		uomfilters.push(new nlobjSearchFilter('unitname', null, 'is', uomname));

		var unittypesearch = nlapiSearchRecord('unitstype',
				'customsearch_wmsse_unitstype', uomfilters, null);
		if (unittypesearch != null && unittypesearch != '') {
			vconversionrate = unittypesearch[0].getValue('conversionrate');
		}
	}

	return vconversionrate;
}

/**
 * To delete a bar code string from the saved bar codes
 * 
 * @parameter :barcodestring
 * 
 */
function deletebarcodestring(barcodestring) {
	var filters = new Array();

	filters.push(new nlobjSearchFilter('custrecord_wmsse_barcode_string', null,
			'is', barcodestring));

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_barcode_templaterefno');

	var searchresults = nlapiSearchRecord('customrecord_wmsse_barcode_strings',
			'customsearch_wmsse_barcode_string', filters, columns);
	if (searchresults != null && searchresults != '') {
		var barcodestringid = searchresults[0].getId();

		nlapiDeleteRecord('customrecord_wmsse_barcode_strings', barcodestringid);
	}
}

/**
 * To replace all the characters in a string
 * 
 * @parameter :original string
 * @parameter :character to replace
 * @parameter :replacement character
 * @return : new string
 * 
 */
function replaceAll(originalstring, charactertoreplace, replacementcharacter) {
	return originalstring.replace(new RegExp(escapeRegExp(charactertoreplace),
			'g'), replacementcharacter);
}

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/*
 * This function will return the Composite Bar Code Component mapping details to
 * the current page/script.
 */
function getcomponentmapping(scriptid, barcodecomponentsstring) {
	nlapiLogExecution('DEBUG', 'barcodecomponentsstring',
			barcodecomponentsstring);
	var barcodecomponents = JSON.parse(barcodecomponentsstring);

	var compmappingarr = new Array();

	if (barcodecomponents != null && barcodecomponents != '') {
		var filters = new Array();

		filters.push(new nlobjSearchFilter('custrecord_barcode_pagescriptid',
				'custrecord_barcode_mappingpage', 'is', scriptid));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var columns = new Array();
		columns[0] = new nlobjSearchColumn(
				'custrecord_barcode_mappingcomponent');
		columns[1] = new nlobjSearchColumn(
				'custrecord_barcode_mappinginputfieldtype');
		columns[2] = new nlobjSearchColumn(
				'custrecord_barcode_mappingfieldposition');

		var srchbccomponentmapping = nlapiSearchRecord(
				'customrecord_barcode_componentmapping',
				'customsearch_wmsse_barcodecomp_mapping', filters, columns);

		if (srchbccomponentmapping != null && srchbccomponentmapping != '') {
			for (srchitr = 0; srchitr < srchbccomponentmapping.length; srchitr++) {
				var vfieldtype = srchbccomponentmapping[srchitr]
						.getText('custrecord_barcode_mappinginputfieldtype');
				var vfieldposition = srchbccomponentmapping[srchitr]
						.getValue('custrecord_barcode_mappingfieldposition');
				var vcomponentname = srchbccomponentmapping[srchitr]
						.getText('custrecord_barcode_mappingcomponent');
				var vcomponentvalue = '';
				if (!isempty(barcodecomponents[vcomponentname]))
					vcomponentvalue = barcodecomponents[vcomponentname];

				var logMsg = 'vfieldtype = ' + vfieldtype + '<br>';
				logMsg = logMsg + 'vfieldposition = ' + vfieldposition + '<br>';
				logMsg = logMsg + 'vcomponentname = ' + vcomponentname + '<br>';
				logMsg = logMsg + 'vcomponentvalue = ' + vcomponentvalue
						+ '<br>';

				nlapiLogExecution('DEBUG', 'Component Mapping Details', logMsg);
				var currow = [ vfieldtype + '$' + vfieldposition + '$'
						+ vcomponentvalue ];
				compmappingarr.push(currow);
			}
		}
	}

	return compmappingarr;
}

/**
 * To replace padding characters from bar code string and replace padding char
 * with hexadeciamal value.
 * 
 * @parameter :original string
 * @return : barcode string array
 * 
 */
function removepaddingcharfrombarcodestring(barcodestring) {
	try {
		var paddingchar = "";
		var barcodetext = "";
		var barcodetextwithpadding = "";
		var barcodestringarray = new Array();
		var vfilters = new Array();
		vfilters.push(new nlobjSearchFilter('custrecord_wmsse_barcode_string',
				null, 'is', barcodestring));
		var barcodepaddingchardetails = nlapiSearchRecord(
				'customrecord_wmsse_barcode_strings',
				'customsearch_wmsse_barcode_string', vfilters, null);
		if (barcodepaddingchardetails != null
				&& barcodepaddingchardetails != ''
				&& barcodepaddingchardetails.length > 0) {

			paddingchar = barcodepaddingchardetails[0].getText(
					'custrecord_wms_barcode_paddingcharacter',
					'custrecord_wmsse_barcode_templaterefno');

		}

		if (paddingchar != null && paddingchar != '')
			barcodetext = replaceAll(barcodestring, paddingchar, '');
		barcodetext = barcodetext.trim();
		barcodestringarray[0] = barcodetext;

		if (paddingchar != null && paddingchar != '') {
			// need to replace padding characters with hexadecimal,
			// for barcode generation some of the characters(example:^,~) used
			// as a commands in ZPL.
			// in ZPL the default hexadecimal indiactor is '_'(underscore),so
			// added extra char('_') to replace.
			var paddingcharhexacode = ascii_to_hexa(paddingchar);
			barcodetextwithpadding = replaceAll(barcodestring, paddingchar, '_'
					+ paddingcharhexacode);
			barcodestringarray[1] = barcodetextwithpadding;
		}

		var logMsg = 'barcodestring = ' + barcodestring + '<br>';
		logMsg = logMsg + 'paddingchar = ' + paddingchar + '<br>';
		logMsg = logMsg + 'barcodetext without padding char = ' + barcodetext
				+ '<br>';
		logMsg = logMsg + 'barcodestring with padding char = '
				+ barcodetextwithpadding + '<br>';
		logMsg = logMsg + 'return array details = ' + barcodestringarray
				+ '<br>';
		nlapiLogExecution('DEBUG', 'logMsg', logMsg);

	} catch (e) {
		nlapiLogExecution('ERROR',
				'Exception in removePaddingCharfrombarcodestring', e);
	}
	return barcodestringarray;
}

/**
 * To covert the string to hexa decimal value
 * 
 * @parameter :string
 * @return : hexa decimal
 * 
 */
function ascii_to_hexa(str) {
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n++) {
		var hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	}
	return arr1.join('');
}