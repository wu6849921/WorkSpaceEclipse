/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 May 2016     Zed
 *
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */

var common = new trigger.common();
var rule = new trigger.rule();

function webAPIs(request, response) {
	try {
		var paras = request.getAllParameters();
		var responseData = '';
		var responseArr = '';
		var resetArr = '';
		var resetParas = {};
		var temp = {};
		//
		var username = common.convertValToString(paras.username);
		var password = common.convertValToString(paras.password);
		var md5String = common.convertValToString(paras.md5string);
		var method = paras.method;
		var integration = new trigger.integration();
		if (integration.validateLoginInfo(username, password, md5String)) {
			if (method == 'getcustomer') {
				var locationid = paras.location;
				var tmp = rule.buildFilterColumns('customer', [ locationid ]);
				integration.setRecordType('customer');
				if (paras.pagenumber)
					integration.setPageNumer(parseInt(paras.pagenumber));
				if (paras.pagecount)
					integration.setPageCount(parseInt(paras.pagecount));
				integration.initializeData(tmp[0], tmp[1], config
						.getCustomerFields(), 'customer');
				// resetParas.type = 'customer';
				// resetParas.field = 'custitem_tn_tobeupdate';
			} else if (method == 'getinventorystatus') {
				var itemid = paras.itemid;
				var locationid = paras.location;
				var isinbulk = paras.isinbulk;
				var tmp = rule.buildFilterColumns('inventorystatus', [ itemid,
						locationid ]);
				integration.setRecordType('lotnumberedinventoryitem');
				integration.initializeData(tmp[0], tmp[1], config
						.getItemInventoryFields(), 'inventorystatus', isinbulk);
				// resetParas.type = 'lotnumberedinventoryitem';
				// resetParas.field = 'custitem_tn_pricetobeupdate';
			} else if (method == 'getitem') {
				var tmp = rule.buildFilterColumns('item');
				integration.setRecordType('lotnumberedinventoryitem');
				integration.initializeData(tmp[0], tmp[1], config
						.getItemFields(), 'item');
			} else if (method == 'getpromotionlist') {
				var tmp = rule.buildFilterColumns('promotionlist');
				integration.setRecordType('customrecord_tn_chuxiaoguangli');
				integration.initializeData(tmp[0], tmp[1], config
						.getPromotionlistFields(),
						'customrecord_tn_chuxiaoguangli');
			} else if (method == 'getlocationmanagementlist') {
				var tmp = rule.buildFilterColumns('locationmangementlist');
				integration.setRecordType('customrecord_tn_locationmange');
				integration.initializeData(tmp[0], tmp[1], config
						.getLocationlistFields(),
						'customrecord_tn_locationmange');
			} else if (method == 'getitemcatagorylist') {
				var tmp = rule.buildFilterColumns('itemcategorylist');
				integration.setRecordType('customrecord_tn_cust_itemcategory');
				integration.initializeData(tmp[0], tmp[1], config
						.getItemcategoryFields(),
						'customrecord_tn_cust_itemcategory');
			} else if (method == 'getemployee') {
				var tmp = rule.buildFilterColumns('employee');
				integration.setRecordType('employee');
				integration.initializeData(tmp[0], tmp[1], config
						.getEmployeeFields(), 'employee');
			} else if (method == 'getcontact') {
				var tmp = rule.buildFilterColumns('contact');
				integration.setRecordType('contact');
				integration.initializeData(tmp[0], tmp[1], config
						.getContactFields(), 'contact');
			} else if (method == 'getwarehouse') {
				var tmp = rule.buildFilterColumns('warehouse');
				integration.setRecordType('location');
				integration.initializeData(tmp[0], tmp[1], config
						.getWarehouseFields(), 'location');
			} else if (method == 'getitemfulfillment') {
				temp = getItemFulfillment(paras);
				if (temp.status == 'error')
					throw temp.details;
			} else if (method == 'getinvoice') {
				temp = getInvoice(paras);
				if (temp.status == 'error')
					throw temp.details;
				else if (temp == 'noresult') {
					temp = {
						'status' : 'noresult',
						'details' : 'null'
					};
				}
			} else if (method == 'getsalesorder') {
				temp = getSOResponseArr(paras);
				if (temp.status == 'error')
					throw temp.details;
				if (temp == 'noresult') {
					temp = {
						'status' : 'error',
						'details' : 'noresult'
					};
				}
			} else if (method == 'getoldestlotdate') {
				temp = getOldestLot(paras);
				if (temp.status == 'error')
					throw temp.details;
			} else if (method == 'getremainpoint') {
				temp = getRemainPoint(paras);
				if (temp.status == 'error')
					throw temp.details;
			}
			// resetArr = integration.getResetArr();
			// resetParas.arr = resetArr;
			// nlapiScheduleScript('customscript_tn_sch_resethandler',
			// 'customdeploy_tn_sch_resethandler', {
			// 'custscript_tn_paras' : JSON.stringify(resetParas)
			// });
			responseArr = integration.getResults();
			if (method == 'getitemfulfillment' || method == 'getinvoice'
					|| method == 'getsalesorder'
					|| method == 'getoldestlotdate'
					|| method == 'getremainpoint') {
				responseArr = temp;
			}
			responseData = JSON.stringify(responseArr);
			response.write(responseData);
		} else {
			responseData = common.getReturnError('Login Failed');
			response.write(JSON.stringify(responseData));
		}

	} catch (ex) {
		nlapiLogExecution('debug', 'webAPIs', ex);
		common.sendErrorEmail('zwang@triggerasia.com', 'Horizon',
				'TN_SL_webAPIs', 'webAPIs', ex);
		responseData = common.getReturnError('Unexpected Error:' + method + ':'
				+ ex);
		response.write(JSON.stringify(responseData));
	}
}

function getRemainPoint(paras) {
	try {
		var customerId = paras.customerid;
		if (!customerId)
			throw 'Missing parameter customerid';
		var info = nlapiLookupField('customer', customerId, [
				'custentity_tn_remainpointamount',
				'custentity_tn_couponcommitted' ]);
		var remainPoint;
		if (common.convertValToNum(info.custentity_tn_couponcommitted) > 0) {
			remainPoint = common
					.convertValToNum(info.custentity_tn_remainpointamount)
					- common
							.convertValToNum(info.custentity_tn_couponcommitted);
		} else {
			remainPoint = common
					.convertValToNum(info.custentity_tn_remainpointamount);
		}
		return {
			'remainpoint' : remainPoint
		};

	} catch (ex) {
		return common.getReturnError('TN_SL_WebAPIs getRemainPoint Error: '
				+ ex);
	}
}

function getOldestLot(paras) {
	try {
		var item = paras.item;
		if (!item)
			throw 'Miss required parameter - item';
		var fils = [];
		fils.push(new nlobjSearchFilter('internalid', null, 'is', item));

		var rts = nlapiSearchRecord('item',
				'customsearch_tn_script_inbinonhand', fils);
		if (rts) {
			var cols = rts[0].getAllColumns();
			return rts[0].getText(cols[1]);
		} else {
			throw 'No lot info';
		}

	} catch (ex) {
		return common.getReturnError('TN_SL_WebAPIs getSOResponseArr Error: '
				+ ex);
	}
}

function getSOResponseArr(paras) {
	try {
		var arr = [];
		var soid = paras.soid;
		var salesrep = paras.employeeid;
		var datefrom = paras.datefrom;
		var dateto = paras.dateto;
		var fils = [];
		// fils.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
		fils.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));
		var cols = [];
		cols[0] = new nlobjSearchColumn('tranid');
		cols[1] = new nlobjSearchColumn('trandate');
		cols[2] = new nlobjSearchColumn('mainname');
		cols[3] = new nlobjSearchColumn('class');
		cols[4] = new nlobjSearchColumn('location');
		cols[5] = new nlobjSearchColumn('department');
		cols[6] = new nlobjSearchColumn('item');
		cols[7] = new nlobjSearchColumn('quantity');
		cols[8] = new nlobjSearchColumn('rate');
		cols[9] = new nlobjSearchColumn('amount');
		cols[10] = new nlobjSearchColumn('custcol_tn_chuxiaoguizhe');
		cols[11] = new nlobjSearchColumn('taxamount');
		cols[12] = new nlobjSearchColumn('status');
		cols[13] = new nlobjSearchColumn('salesrep');
		cols[14] = new nlobjSearchColumn('memo');
		cols[15] = new nlobjSearchColumn('custcol_tn_hanshuidanjia');
		cols[16] = new nlobjSearchColumn('mainline');
		cols[17] = new nlobjSearchColumn('grossamount');
		cols[18] = new nlobjSearchColumn('custcol_tn_discountrate');
		cols[19] = new nlobjSearchColumn('custcol_tn_grossamount');
		cols[20] = new nlobjSearchColumn('quantityuom');
		cols[21] = new nlobjSearchColumn('custbody_tn_couponaamount');
		cols[22] = new nlobjSearchColumn('custbody_tn_couponbamount');
		// settlementprice
		cols[23] = new nlobjSearchColumn('custcol_tn_settlementprice');
		if (soid) {
			fils.push(new nlobjSearchFilter('internalid', null, 'is', soid));
		} else {
			if (salesrep)
				fils.push(new nlobjSearchFilter('salesrep', null, 'is',
						salesrep));
			if (datefrom) {
				datefrom = new Date(datefrom);
				datefrom = nlapiDateToString(datefrom);
				fils.push(new nlobjSearchFilter('trandate', null, 'onorafter',
						datefrom));
			}
			if (dateto) {
				dateto = new Date(dateto);
				dateto = nlapiDateToString(dateto);
				fils.push(new nlobjSearchFilter('trandate', null, 'onorbefore',
						dateto));
			}
		}
		if (!soid && !salesrep && !datefrom && !dateto)
			throw '缂哄皯鎼滅储鏉′欢';
		var rts = nlapiSearchRecord('salesorder', null, fils, cols);
		if (rts) {
			var soids = [];
			for (var i = 0; i < rts.length; i++) {
				var recid = rts[i].getId();
				var index = soGetIndex(arr, recid);
				if (index == -1) {
					var temp = {};
					temp.type = 'salesorder';
					temp.internalid = recid;
					soids.push(recid);
					temp.sonumber = rts[i].getValue('tranid');
					var trandate = rts[i].getValue('trandate');
					if (trandate) {
						trandate = common.convertDateString(trandate,
								'MM/DD/YYYY');
						temp.date = trandate;
					}
					temp.entity = rts[i].getValue('mainname');
					temp.statusid = rts[i].getValue('status');
					temp.statustext = rts[i].getText('status');
					temp.memo = rts[i].getValue('memo');
					temp.salesrep = rts[i].getValue('salesrep');
					temp.classification = rts[i].getValue('class');
					temp.location = rts[i].getValue('location');
					temp.department = rts[i].getValue('department');
					temp.couponaamount = rts[i]
							.getValue('custbody_tn_couponaamount');
					temp.couponbamount = rts[i]
							.getValue('custbody_tn_couponbamount');
					temp.details = [];
					/*
					 * temp.details.push({ 'item' : '-15', 'rate' :
					 * rts[i].getValue('custbody_tn_couponaamount'), 'quantity' :
					 * '', 'amount' :
					 * rts[i].getValue('custbody_tn_couponaamount'),
					 * 'chuxiaoguizhe' : '' }); temp.details.push({ 'item' :
					 * '-16', 'rate' :
					 * rts[i].getValue('custbody_tn_couponbamount'), 'quantity' :
					 * '', 'amount' :
					 * rts[i].getValue('custbody_tn_couponbamount'),
					 * 'chuxiaoguizhe' : '' });
					 */
					temp.returnorders = [];
					if (rts[i].getValue('mainline') == '*') {
						temp.amounttotal = common.convertValToNum(rts[i]
								.getValue('amount'))
								- common.convertValToNum(rts[i]
										.getValue('custbody_tn_couponaamount'))
								- common.convertValToNum(rts[i]
										.getValue('custbody_tn_couponbamount'));
						// temp.amounttotal = rts[i].getValue('amount');
					} else {
						var tmp = {};
						tmp.item = rts[i].getValue('item');
						tmp.quantity = rts[i].getValue('quantityuom');
						tmp.rate = rts[i].getValue('custcol_tn_discountrate');
						tmp.amount = rts[i].getValue('custcol_tn_grossamount');
						tmp.custcol_tn_chuxiaoguizhe = rts[i]
								.getValue('custcol_tn_chuxiaoguizhe');
						// settlementprice
						if (rts[i].getText('custcol_tn_settlementprice') != ""
								&& rts[i]
										.getValue('custcol_tn_settlementprice') != 0) {
							tmp.settlementprice = rts[i]
									.getValue('custcol_tn_settlementprice');
						} else {
							tmp.settlementprice = tmp.amount;
						}
						// tmp.taxamount = rts[i].getValue('taxamount');
						temp.details.push(tmp);
					}
					arr.push(temp);
				} else {
					if (rts[i].getValue('mainline') == '*') {
						arr[index].amounttotal = common.convertValToNum(rts[i]
								.getValue('amount'))
								- common.convertValToNum(rts[i]
										.getValue('custbody_tn_couponaamount'))
								- common.convertValToNum(rts[i]
										.getValue('custbody_tn_couponbamount'));
						// arr[index].amounttotal = rts[i].getValue('amount');
					} else {
						var tmp = {};
						tmp.item = rts[i].getValue('item');
						tmp.quantity = rts[i].getValue('quantityuom');
						tmp.rate = rts[i].getValue('custcol_tn_discountrate');
						tmp.amount = rts[i].getValue('custcol_tn_grossamount');
						tmp.custcol_tn_chuxiaoguizhe = rts[i]
								.getValue('custcol_tn_chuxiaoguizhe');
						// settlementprice
						if (rts[i].getText('custcol_tn_settlementprice') != ""
								&& rts[i]
										.getValue('custcol_tn_settlementprice') != 0) {
							tmp.settlementprice = rts[i]
									.getValue('custcol_tn_settlementprice');
						} else {
							tmp.settlementprice = tmp.amount;
						}
						// tmp.taxamount = rts[i].getValue('taxamount');
						arr[index].details.push(tmp);
					}
				}
			}
			var r = getSORelatedRA(arr, soids);
			if (r.status == 'error')
				throw r.details;
			return arr;
		} else
			return 'noresult';
		// throw '鎼滅储鏃犵粨鏋�';
	} catch (ex) {
		return common.getReturnError('TN_SL_WebAPIs getSOResponseArr Error: '
				+ ex);
	}
}
function getSubtotalAmt(arr, l) {
	try {
		var amt = 0;
		for (var i = 0; i < l; i++) {
			if (arr[i].item == '-2') {
				amt = 0;
			} else {
				amt += common.convertValToNum(arr[i].amount);
			}
		}
		return amt;
	} catch (ex) {
		return common.getReturnError('TN_SL_WebAPIs getSubtotalAmt Error: '
				+ ex);
	}
}

function soGetIndex(arr, soid) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].internalid == soid) {
			return i;
		}
	}
	return -1;
}

function getSORelatedRA(arr, soids) {
	try {
		var fils = [];
		fils.push(new nlobjSearchFilter('createdfrom', null, 'anyof', soids));
		// fils.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
		fils.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));
		var cols = [];
		cols[0] = new nlobjSearchColumn('tranid');
		cols[1] = new nlobjSearchColumn('trandate');
		cols[2] = new nlobjSearchColumn('mainname');
		cols[3] = new nlobjSearchColumn('class');
		cols[4] = new nlobjSearchColumn('location');
		cols[5] = new nlobjSearchColumn('department');
		cols[6] = new nlobjSearchColumn('item');
		cols[7] = new nlobjSearchColumn('quantity');
		cols[8] = new nlobjSearchColumn('rate');
		cols[9] = new nlobjSearchColumn('amount');
		cols[10] = new nlobjSearchColumn('custcol_tn_chuxiaoguizhe');
		cols[11] = new nlobjSearchColumn('taxamount');
		cols[12] = new nlobjSearchColumn('status');
		cols[13] = new nlobjSearchColumn('salesrep');
		cols[14] = new nlobjSearchColumn('memo');
		cols[15] = new nlobjSearchColumn('createdfrom');
		cols[16] = new nlobjSearchColumn('mainline');
		cols[17] = new nlobjSearchColumn('grossamount');
		cols[18] = new nlobjSearchColumn('custcol_tn_discountrate');
		cols[19] = new nlobjSearchColumn('custcol_tn_grossamount');
		cols[20] = new nlobjSearchColumn('quantityuom');

		var rts = nlapiSearchRecord('returnauthorization', null, fils, cols);
		if (rts) {
			for (var i = 0; i < rts.length; i++) {
				var recid = rts[i].getId();
				var createdfrom = rts[i].getValue('createdfrom');
				var index = soGetIndex(arr, createdfrom);
				if (index != -1) {
					var t = arr[index].returnorders;
					var ind = soGetIndex(t, recid);
					if (ind == -1) {
						var temp = {};
						temp.type = 'returnauthorization';
						temp.internalid = recid;
						temp.ranumber = rts[i].getValue('tranid');
						var trandate = rts[i].getValue('trandate');
						if (trandate) {
							trandate = common.convertDateString(trandate,
									'MM/DD/YYYY');
							temp.date = trandate;
						}
						temp.createdfrom = createdfrom;
						temp.entity = rts[i].getValue('mainname');
						// temp.statusid = rts[i].getValue('status');
						// temp.statustext = rts[i].getText('status');
						temp.memo = rts[i].getValue('memo');
						temp.salesrep = rts[i].getValue('salesrep');
						temp.classification = rts[i].getValue('class');
						temp.location = rts[i].getValue('location');
						temp.department = rts[i].getValue('department');
						temp.details = [];
						if (rts[i].getValue('mainline') == '*') {
							temp.amounttotal = rts[i].getValue('amount');
						} else {
							var tmp = {};
							tmp.item = rts[i].getValue('item');
							tmp.quantity = rts[i].getValue('quantityuom');
							tmp.rate = rts[i]
									.getValue('custcol_tn_discountrate');
							tmp.amount = rts[i]
									.getValue('custcol_tn_grossamount');
							tmp.custcol_tn_chuxiaoguizhe = rts[i]
									.getValue('custcol_tn_chuxiaoguizhe');
							// tmp.taxamount = rts[i].getValue('taxamount');
							temp.details.push(tmp);
						}
						t.push(temp);
					} else {
						if (rts[i].getValue('mainline') == '*') {
							t[ind].amounttotal = rts[i].getValue('amount');
						} else {
							var tmp = {};
							tmp.item = rts[i].getValue('item');
							tmp.quantity = rts[i].getValue('quantityuom');
							tmp.rate = rts[i]
									.getValue('custcol_tn_discountrate');
							tmp.amount = rts[i]
									.getValue('custcol_tn_grossamount');
							tmp.custcol_tn_chuxiaoguizhe = rts[i]
									.getValue('custcol_tn_chuxiaoguizhe');
							// tmp.taxamount = rts[i].getValue('taxamount');
							t[ind].details.push(tmp);
						}
					}
				}
			}
		}
		return 0;
	} catch (ex) {
		return common.getReturnError('TN_SL_WebAPIs getSORelatedRA Error: '
				+ ex);
	}
}

function getItemFulfillment(paras) {
	try {
		var fulfillmentid = paras.internalid;
		// var rectype = nlapiLookupField('itemfulfillment', itemid,
		// 'recordtype');// 5 usage
		// var rec = nlapiLoadRecord(rectype, itemid);
		var rec = nlapiLoadRecord('itemfulfillment', fulfillmentid);
		var refNo = rec.getFieldValue('tranid');
		var fulfillDate = rec.getFieldValue('trandate');
		var fulfillCustomer = rec.getFieldValue('entity');
		var fulfillCustomerText = rec.getFieldText('entity');
		var postingPeriod = rec.getFieldValue('postingperiod');
		var postingPeriodText = rec.getFieldText('postingperiod');

		var createdFrom = rec.getFieldValue('createdfrom');
		var createdFromText = rec.getFieldText('createdfrom');
		var fulfillMemo = rec.getFieldValue('memo');
		var temp = {};
		temp['refNo'] = refNo;
		temp['fulfillDate'] = fulfillDate;
		temp['fulfillCustomer'] = fulfillCustomer;
		temp['fulfillCustomerText'] = fulfillCustomerText;
		temp['postingPeriod'] = postingPeriod;
		temp['postingPeriodText'] = postingPeriodText;
		temp['createdFrom'] = createdFrom;
		temp['createdFromText'] = createdFromText;
		temp['fulfillMemo'] = fulfillMemo;
		temp['details'] = [];
		var count = rec.getLineItemCount('item');
		for (var i = 1; i <= count; i++) {
			var itemName = rec.getLineItemValue('item', 'itemkey', i);
			var itemNameText = rec.getLineItemValue('item', 'itemname', i);
			var itemDescription = rec.getLineItemValue('item',
					'itemdescription', i);
			var itemLocation = rec.getLineItemValue('item', 'location', i);
			var itemLocationText = rec.getLineItemText('item', 'location', i);
			var onhand = rec.getLineItemValue('item', 'onhand', i);
			var orderline = rec.getLineItemValue('item', 'orderline', i);
			var unitsdisplayText = rec.getLineItemValue('item', 'unitsdisplay',
					i);
			var unitsdisplay = rec.getLineItemValue('item', 'units', i);
			var taxInclude = rec.getLineItemValue('item',
					'custcol_tn_hanshuidanjia', i);

			var tmp = {};
			tmp.itemName = itemName;
			tmp.itemNameText = itemNameText;
			tmp.itemDescription = itemDescription;
			tmp.itemLocation = itemLocation;
			tmp.itemLocationText = itemLocationText;
			tmp.onhand = onhand;
			tmp.orderline = orderline;
			tmp.unitsdisplayText = unitsdisplayText;
			tmp.unitsdisplay = unitsdisplay;
			tmp.taxInclude = taxInclude;
			temp.details.push(tmp);
		}
		return temp;
	} catch (ex) {
		return common.getReturnError('TN_SL_WebAPIs getItemFulfillment Error: '
				+ ex);
	}
}

function getInvoice(paras) {
	try {
		var arr = [];
		var internalid = paras.internalid;
		var soid = paras.soid;
		var ids = [];
		if (internalid && !soid) {
			ids.push(internalid);
		} else if (soid) {
			var tmpRts = nlapiSearchRecord('invoice', null, [
					new nlobjSearchFilter('mainline', null, 'is', 'T'),
					new nlobjSearchFilter('createdfrom', null, 'is', soid) ]);
			if (!tmpRts)
				return 'noresult';
			else {
				for (var j = 0; j < tmpRts.length; j++) {
					ids.push(tmpRts[j].getId());
				}
			}
		}
		for (var x = 0; x < ids.length; x++) {
			var rec = nlapiLoadRecord('invoice', ids[x]);
			var invoiceNo = rec.getFieldValue('tranid');
			var fulfillDate = rec.getFieldValue('trandate');
			var fulfillCustomer = rec.getFieldValue('entity');
			var fulfillCustomerText = rec.getFieldText('entity');
			var postingPeriod = rec.getFieldValue('postingperiod');
			var postingPeriodText = rec.getFieldText('postingperiod');
			var salesrep = rec.getFieldValue('salesrep');
			var salesrepText = rec.getFieldText('salesrep');
			var poNo = rec.getFieldText('otherrefnum');
			var createdFrom = rec.getFieldValue('createdfrom');
			var createdFromText = rec.getFieldText('createdfrom');
			var fulfillMemo = rec.getFieldValue('memo');
			var couponaamount = common.convertValToNum(rec
					.getFieldValue('custbody_tn_couponaamount'));
			var couponbamount = common.convertValToNum(rec
					.getFieldValue('custbody_tn_couponbamount'));
			var unpaid = common.convertValToNum(rec
					.getFieldValue('amountremainingtotalbox'))
					- couponbamount - couponaamount;
			unpaid = unpaid <= 0 ? 0 : unpaid;
			unpaid = unpaid <= 0 ? unpaid : common.convertValToNum(unpaid, 8);
			var temp = {};
			temp['invoiceid'] = ids[x];
			temp['invoiceNo'] = invoiceNo;
			temp['fulfillDate'] = fulfillDate;
			temp['fulfillCustomer'] = fulfillCustomer;
			temp['fulfillCustomerText'] = fulfillCustomerText;
			// temp['postingPeriod'] = postingPeriod;
			// temp['postingPeriodText'] = postingPeriodText;
			temp['salesrep'] = salesrep;
			temp['salesrepText'] = salesrepText;
			// temp['poNo'] = poNo;
			temp['createdFrom'] = createdFrom;
			temp['createdFromText'] = createdFromText;
			temp['fulfillMemo'] = fulfillMemo;
			temp['classification'] = rec.getFieldValue('class');
			temp['location'] = rec.getFieldValue('location');
			temp['department'] = rec.getFieldValue('department');
			temp['couponaamount'] = couponaamount;
			temp['couponbamount'] = couponbamount;
			temp['unbill'] = unpaid;
			temp['details'] = [];
			var count = rec.getLineItemCount('item');
			for (var i = 1; i <= count; i++) {
				var itemName = rec.getLineItemValue('item', 'item', i);
				var itemNameText = rec.getLineItemText('item', 'item', i);
				// var orderline = rec.getLineItemValue('item', 'orderline', i);
				// var price_display = rec.getLineItemValue('item',
				// 'price_display', i);
				var rate = rec.getLineItemValue('item',
						'custcol_tn_discountrate', i);
				// var amount = rec.getLineItemValue('item', 'amount', i);
				// var taxcode_display = rec.getLineItemValue('item',
				// 'taxcode_display', i);
				// var taxcode = rec.getLineItemValue('item', 'taxcode', i);
				var quantity = rec.getLineItemValue('item', 'quantity', i);
				var taxrate1 = rec.getLineItemValue('item', 'taxrate1', i);
				// var taxInclude = rec.getLineItemValue('item',
				// 'custcol_tn_hanshuidanjia', i);
				var grossamt = rec.getLineItemValue('item',
						'custcol_tn_grossamount', i);
				var tax1amt = rec.getLineItemValue('item', 'tax1amt', i);
				// var costestimate = rec.getLineItemValue('item',
				// 'costestimate', i);
				// var estgrossprofit = rec.getLineItemValue('item',
				// 'estgrossprofit', i);
				// var estgrossprofitpct = rec.getLineItemValue('item',
				// 'estgrossprofitpct', i);
				var promtRule = rec.getLineItemValue('item',
						'custcol_tn_chuxiaoguizhe', i);

				var tmp = {};
				tmp.item = itemName;
				tmp.itemText = itemNameText;
				// tmp.orderline = orderline;
				// tmp.price_display = price_display;
				tmp.rate = rate;
				tmp.amount = grossamt;
				// tmp.taxcode_display = taxcode_display;
				// tmp.taxcode = taxcode;
				tmp.taxrate = taxrate1;
				// tmp.taxInclude = taxInclude;
				// tmp.grossamt = grossamt;
				tmp.taxamt = tax1amt;
				// tmp.costestimate = costestimate;
				// tmp.estgrossprofit = estgrossprofit;
				// tmp.estgrossprofitpct = estgrossprofitpct;
				tmp.quantity = quantity;
				tmp.custcol_tn_chuxiaoguizhe = promtRule;

				// tmp.promtRule = promtRule;

				temp.details.push(tmp);
			}
			arr.push(temp);
		}
		return arr;
	} catch (ex) {
		return common.getReturnError('TN_SL_WebAPIs getInvoice Error: ' + ex);
	}
}