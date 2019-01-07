/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 11 Oct 2016 Zed
 * 
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
triggernamespace('trigger');
var common = new trigger.common();

function suitelet(request, response) {
	try {
		var method = request.getMethod();
		var newForm = nlapiCreateForm('车辆安排');
		if (method == 'GET') {
			newForm.setScript('customscript_tn_cs_truckarrange');
			newForm.addSubmitButton('提交');
			newForm.addButton('custpage_btn_refresh', '刷新', 'pageRefresh()');
			newForm.addFieldGroup('custpage_group_primaryinformation', '主要信息');
			newForm.addFieldGroup('custpage_group_truckinformation', '车辆信息');
			newForm.addFieldGroup('custpage_group_filter', '筛选条件');
			newForm.addFieldGroup('cuatpage_group_currentinfo', '已选信息');
			newForm.addFieldGroup('custpage_group_sublist', '订单明细');
			newForm.addField('custpage_long_hidden', 'text').setDisplayType(
					'hidden');
			// newForm.addField('custpage_long_vitoclose').setDisplayType('hidden');
			var creatorField = newForm.addField('custpage_select_creator',
					'select', '创建人', 'employee',
					'custpage_group_primaryinformation').setDisplayType(
					'inline');
			var dateCreateField = newForm.addField('custpage_date_datecreate',
					'date', '创建日期', null, 'custpage_group_primaryinformation')
					.setDisplayType('inline');
			var dateDeliverField = newForm.addField(
					'custpage_date_datedeliver', 'date', '配送日期', null,
					'custpage_group_primaryinformation');
			// var memoField = newForm.addField('custpage_text_memo', 'text',
			// display.memo, null, 'custpage_group_primaryinformation');
			var plateNumberField = newForm.addField(
					'custpage_select_platenumber', 'select', '车牌号',
					'customrecord_tn_carinformation',
					'custpage_group_truckinformation');
			var driverField = newForm.addField('custpage_select_driver',
					'select', '司机', 'employee',
					'custpage_group_truckinformation');
			var truckInfoField = newForm.addField('custpage_text_truckinfo',
					'text', '车辆信息', null, 'custpage_group_truckinformation')
					.setDisplayType('disabled');
			var capacityField = newForm.addField('custpage_text_capacity',
					'text', '车辆载重', null, 'custpage_group_truckinformation')
					.setDisplayType('disabled');
			var volumeField = newForm.addField('custpage_text_volume', 'text',
					'车辆体积', null, 'custpage_group_truckinformation')
					.setDisplayType('disabled');
			// var receiveByField = newForm.addField('custpage_date_receiveby',
			// 'date', display.receiptDate, null,
			// 'custpage_group_primaryinformation');

			// Filters
			var locationField = newForm.addField('custpage_select_location',
					'select', '区域仓库(县)', 'location', 'custpage_group_filter');

			// CurrentInfo
			newForm.addField('custpage_text_ordercount', 'text', '已选订单数', null,
					'cuatpage_group_currentinfo');
			newForm.addField('custpage_text_boxcount', 'text', '已选总箱数', null,
					'cuatpage_group_currentinfo');
			newForm.addField('custpage_text_weightcount', 'text', '已选总重量',
					null, 'cuatpage_group_currentinfo');
			newForm.addField('custpage_text_volumecount', 'text', '已选总体积',
					null, 'cuatpage_group_currentinfo');

			var sublist = newForm.addSubList('custpage_sublist_sublist',
					'list', '订单明细', 'custpage_group_sublist');
			// sublist.addButton('custpage_slbtn_markall', '全选',
			// "common.markAll('custpage_sublist_sublist','custpage_slfield_checkbox')");
			// sublist.addButton('custpage_slbtn_unmarkall', '清除',
			// "common.unmarkAll('custpage_sublist_sublist','custpage_slfield_checkbox')");
			sublist.addMarkAllButtons();
			sublist.addField('custpage_slfield_checkbox', 'checkbox', '已选');
			sublist.addField('custpage_slfield_number', 'text', '配送序号');
			sublist.addField('custpage_slfield_sonumber', 'select', '订单编号',
					'salesorder').setDisplayType('inline');
			sublist.addField('custpage_slfield_entitynumber', 'text', '客户编号');
			sublist.addField('custpage_slfield_entityname', 'select', '客户名称',
					'customer').setDisplayType('inline');
			sublist.addField('custpage_slfield_salesrep', 'select', '业务员',
					'employee').setDisplayType('inline');
			sublist.addField('custpage_slfield_address', 'text', '地址');
			sublist.addField('custpage_slfield_countofboxinorder', 'text',
					'订单总箱数');
			sublist.addField('custpage_slfield_amount', 'text', '订单总金额');
			// sublist.addField('custpage_slfield_salesrep', 'select', null,
			// 'employee').setDisplayType('hidden');
			sublist.addField('custpage_slfield_weight', 'text').setDisplayType(
					'hidden');
			sublist.addField('custpage_slfield_volume', 'text').setDisplayType(
					'hidden');
			sublist.addField('custpage_slfield_couponaamount', 'text')
					.setDisplayType('hidden');
			sublist.addField('custpage_slfield_couponbamount', 'text')
					.setDisplayType('hidden');

			var filters = [];
			// var creator = request.getParameter('creator');
			// var dateCreate = request.getParameter('datecreate');
			var dateDeliver = request.getParameter('datedeliver');
			var driver = request.getParameter('driver');
			var plateNumber = request.getParameter('platenumber');
			var truckInfo = request.getParameter('truckinfo');
			var capacity = request.getParameter('capacity');
			var volume = request.getParameter('volume');
			var locationid = request.getParameter('locationid');

			creatorField.setDefaultValue(nlapiGetUser());
			dateCreateField.setDefaultValue(common.getCurrentChineseDate());
			if (dateDeliver) {
				dateDeliverField.setDefaultValue(dateDeliver);
			} else {
				dateDeliverField.setDefaultValue(common
						.getCurrentChineseDate(1));
			}
			if (driver) {
				driverField.setDefaultValue(driver);
			}
			if (plateNumber) {
				plateNumberField.setDefaultValue(plateNumber);
			}
			if (truckInfo) {
				truckInfoField.setDefaultValue(truckInfo);
			}
			if (capacity) {
				capacityField.setDefaultValue(capacity);
			}
			if (volume) {
				volumeField.setDefaultValue(volume);
			}
			if (locationid) {
				locationField.setDefaultValue(locationid);
				var f = new nlobjSearchFilter('location', null, 'is',
						locationid);
				filters.push(f);
			}

			var rts = getOrderSearchResult(filters);
			if (rts.status == 'error')
				throw rts.details;
			for (var i = 0; i < rts.length; i++) {
				var rt = rts[i];
				sublist.setLineItemValue('custpage_slfield_number', i + 1,
						(i + 1).toString());
				sublist.setLineItemValue('custpage_slfield_sonumber', i + 1, rt
						.getValue('sonumber'));
				sublist.setLineItemValue('custpage_slfield_entitynumber',
						i + 1, rt.getValue('entitynumber'));
				sublist.setLineItemValue('custpage_slfield_entityname', i + 1,
						rt.getValue('entityname'));
				var address = rt.getValue('province') + rt.getValue('city')
						+ rt.getValue('country') + rt.getValue('town')
						+ rt.getValue('village') + rt.getValue('shopname');
				sublist.setLineItemValue('custpage_slfield_address', i + 1,
						address);
				sublist.setLineItemValue('custpage_slfield_countofboxinorder',
						i + 1, rt.getValue('boxcount'));
				sublist.setLineItemValue('custpage_slfield_amount', i + 1, rt
						.getValue('amount'));
				sublist.setLineItemValue('custpage_slfield_weight', i + 1, rt
						.getValue('weightcount'));
				sublist.setLineItemValue('custpage_slfield_volume', i + 1, rt
						.getValue('volumecount'));
				sublist.setLineItemValue('custpage_slfield_salesrep', i + 1, rt
						.getValue('salesrep'));
				sublist.setLineItemValue('custpage_slfield_couponaamount',
						i + 1, rt.getValue('couponaamount'));
				sublist.setLineItemValue('custpage_slfield_couponbamount',
						i + 1, rt.getValue('couponbamount'));
			}
			response.writePage(newForm);
		} else if (method == 'POST') {
			var data = request.getParameter('custpage_long_hidden');
			data = JSON.parse(data);

			var rec = nlapiCreateRecord('customrecord_tn_routearrange');

			var r = initializeRecMainLine(rec, data);
			if (r.status == 'error')
				throw r.details;

			var t = initializeOrderDetails(rec, data);
			if (t.status == 'error')
				throw t.details;

			r = initializePickDetails(rec, t[0], t[1]);
			if (r.status == 'error')
				throw r.details;

			var routeid = nlapiSubmitRecord(rec);
			var scriptid = 'customscript_tn_sl_sowriteback';
			var deployid = 'customdeploy_tn_sl_sowriteback';
			var url = nlapiResolveURL('SUITELET', scriptid, deployid, true);
			nlapiLogExecution('debug', 'url', url);
			nlapiRequestURL(url, {
				'soids' : JSON.stringify(t[0]),
				'routeid' : routeid
			});
			nlapiSetRedirectURL('RECORD', 'customrecord_tn_routearrange',
					routeid);
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'suitelet', ex);
		common.sendErrorEmail('zwang@triggerasia.com', 'Horizon',
				'TN_SL_TruckArrange', 'suitelet', ex);
	}
}

function initializeRecMainLine(rec, data) {
	try {
		rec.setFieldValue('custrecord_tn_createby', data.creator);
		rec.setFieldValue('custrecord_tn_createddate', data.datecreate);
		rec.setFieldValue('custrecord_tn_fulfilldate', data.datedeliver);
		rec.setFieldValue('custrecord_tn_carnumber', data.platenumber);
		rec.setFieldValue('custrecord_tn_driver2', data.driver);
		rec.setFieldValue('custrecord_tn_cardetail', data.truckinfo);
		rec.setFieldValue('custrecord_tn_zaizhong2', data.capacity);
		rec.setFieldValue('custrecord_tn_cheliangtiji', data.volume);
		rec.setFieldValue('custrecord_tn_orderweight', data.weightcount);
		rec.setFieldValue('custrecord_tn_ordertiji', data.volumecount);
		rec.setFieldValue('custrecord_tn_location', data.locationid);
		rec.setFieldValue('custrecord_tn_routing_boxestotal', data.boxcount);
		return 0;
	} catch (ex) {
		return common
				.getReturnError('TN_SL_TruckArrange initializeRecMainLine Error: '
						+ ex);
	}
}

function initializeOrderDetails(rec, data) {
	try {
		var soArr = [];
		var orderInfo = [];
		var details = data.details;
		for (var i = 1; i <= details.length; i++) {
			var detail = details[i - 1];
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_no2', i, i.toString());
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_sonumber', i, detail.soid);
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_customercode', i, detail.customernumber);
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_customername', i, detail.customerid);
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_dizhi', i, detail.address);
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_dindanxiangsu', i, detail.boxcount);
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_soamount', i, detail.amount);
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_zongtiji', i, detail.volume);
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_zongzhongliang', i, detail.weight);
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_salesrep', i, detail.salesrep);
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_couponaamount', i, detail.couponaamount);
			rec.setLineItemValue('recmachcustrecord_tn_luxianid',
					'custrecord_tn_couponbamount', i, detail.couponbamount);
			soArr.push(detail.soid);
			var tmp = {
				'soid' : detail.soid,
				'customerid' : detail.customerid
			};
			orderInfo.push(tmp);
		}
		return [ soArr, orderInfo ];
	} catch (ex) {
		return common
				.getReturnError('TN_SL_TruckArrange initializeOrderDetails Error: '
						+ ex);
	}
}

function buildUOMTable() {
	var tmp = {};
	var rec = nlapiLoadRecord('unitstype', 2);
	var c = rec.getLineItemCount('uom');
	for (var i = 1; i <= c; i++) {
		// map.add(rec.getLineItemValue('uom','internalid',i),rec.getLineItemValue('uom','conversionrate',i));
		tmp[rec.getLineItemValue('uom', 'unitname', i).toString()] = rec
				.getLineItemValue('uom', 'internalid', i);
	}
	return tmp;
}

function initializePickDetails(rec, soArr, orderArr) {
	try {
		var sc = nlapiLoadSearch('salesorder',
				'customsearch_tn_script_sodetails');
		var filter = new nlobjSearchFilter('internalid', null, 'anyof', soArr);
		sc.addFilter(filter);
		var UOMTable = buildUOMTable();
		var dataArr = [];
		var rtsSet = sc.runSearch();
		for (var n = 0; n < 200; n++) {
			var rts = rtsSet.getResults(n * 1000, (n + 1) * 1000);
			if (!rts || rts.length <= 0)
				break;
			for (var i = 0; i < rts.length; i++) {
				var cols = rts[i].getAllColumns();
				var itemtype = rts[i].getValue(cols[4]);
				if (itemtype == 'InvtPart') {
					var tmp = {};
					var quantity = rts[i].getValue(cols[2]);
					var grossrate = rts[i].getValue(cols[3]);
					var grossamt = common.convertValToNum(quantity)
							* common.convertValToNum(grossrate);
					grossamt = grossamt == 0 ? 0 : common.convertValToNum(
							grossamt, 8);
					tmp.soid = rts[i].getId();
					tmp.item = rts[i].getValue(cols[0]);
					tmp.unit = UOMTable[rts[i].getValue(cols[1]).toString()];
					tmp.countinbox = rts[i].getValue(cols[5]);
					tmp.quantity = quantity;
					tmp.grossrate = grossrate;
					tmp.grossamt = grossamt;
					dataArr.push(tmp);
				}
			}
			if (rts.length < 1000)
				break;
		}
		orderArr.reverse();
		var orderedArr = generateOrderedArr(orderArr, dataArr);
		if (orderedArr.status == 'error')
			throw orderedArr.details;

		orderedArr.reverse();
		for (var x = 1; x <= orderedArr.length; x++) {
			var d = orderedArr[x - 1];
			rec.setLineItemValue('recmachcustrecord_tn_jianhuodanid',
					'custrecord_tn_xiaoshoudindan', x, d.soid);
			rec.setLineItemValue('recmachcustrecord_tn_jianhuodanid',
					'custrecord_tn_kehu', x, d.customerid);
			rec.setLineItemValue('recmachcustrecord_tn_jianhuodanid',
					'custrecord_tn_zhuangcexuhao', x, d.pickorder);
			rec.setLineItemValue('recmachcustrecord_tn_jianhuodanid',
					'custrecord_tn_canpingmingcheng', x, d.item);
			rec.setLineItemValue('recmachcustrecord_tn_jianhuodanid',
					'custrecord_tn_dindansuliang', x, d.quantity);
			rec.setLineItemValue('recmachcustrecord_tn_jianhuodanid',
					'custrecord_tn_danjia', x, d.grossrate);
			rec.setLineItemValue('recmachcustrecord_tn_jianhuodanid',
					'custrecord_tn_jine', x, d.grossamt);
			rec.setLineItemValue('recmachcustrecord_tn_jianhuodanid',
					'custrecord_tn_danwei', x, d.unit);
		}
		return 0;
	} catch (ex) {
		return common
				.getReturnError('TN_SL_TruckArrange initializePickDetails Error: '
						+ ex);
	}
}

function generateOrderedArr(orderArr, dataArr) {
	try {
		var newArr = [];
		for (var i = 0; i < orderArr.length; i++) {
			var order = orderArr[i];
			var pickorder = i + 1;
			for (var j = 0; j < dataArr.length; j++) {
				var data = dataArr[j];
				if (order.soid == data.soid) {
					var tmp = {};
					tmp.soid = order.soid;
					tmp.customerid = order.customerid;
					tmp.pickorder = pickorder.toString();
					tmp.item = data.item;
					tmp.quantity = data.quantity;
					tmp.unit = data.unit;
					tmp.grossrate = data.grossrate;
					tmp.grossamt = data.grossamt;
					tmp.countinbox = data.countinbox;
					newArr.push(tmp);
				}
			}
		}
		return newArr;
	} catch (ex) {
		return common
				.getReturnError('TN_SL_TruckArrange generateOrderedArr Error: '
						+ ex);
	}
}

function getOrderSearchResult(filters) {
	try {
		var sc = nlapiLoadSearch('salesorder',
				'customsearch_tn_scriptsotoarrangerouting');
		sc.addFilters(filters);
		var c = new nlobjSearchColumn('custrecord_tn_no',
				'custbody_tn_so_village');
		c.setSort(false);
		sc.addColumn(c);
		var arr = [];
		var rtSet = sc.runSearch();
		for (var n = 0; n < 200; n++) {
			var rts = rtSet.getResults(n * 1000, (n + 1) * 1000);
			if (!rts || rts.length <= 0)
				break;
			for (var i = 0; i < rts.length; i++) {
				var cols = rts[i].getAllColumns();
				var map = new trigger.hashTable();
				var sonumber = rts[i].getId();
				var entitynumber = rts[i].getValue(cols[0]);
				var entityname = rts[i].getValue(cols[1]);
				var province = rts[i].getText(cols[2]);
				var city = rts[i].getText(cols[3]);
				var country = rts[i].getText(cols[4]);
				var town = rts[i].getText(cols[5]);
				var village = rts[i].getText(cols[6]);
				var shopname = rts[i].getValue(cols[7]);
				var boxcount = rts[i].getValue(cols[8]);
				var weightcount = rts[i].getValue(cols[9]);
				var volumecount = rts[i].getValue(cols[10]);
				var amount = rts[i].getValue(cols[11]);
				var salesrep = rts[i].getValue(cols[12]);
				var couponaamount = rts[i].getValue(cols[13]);
				var couponbamount = rts[i].getValue(cols[14]);
				map.add('sonumber', sonumber);
				map.add('entitynumber', entitynumber);
				map.add('entityname', entityname);
				map.add('province', province);
				map.add('city', city);
				map.add('country', country);
				map.add('town', town);
				map.add('village', village);
				map.add('shopname', shopname);
				map.add('boxcount', boxcount);
				map.add('weightcount', weightcount);
				map.add('volumecount', volumecount);
				map.add('amount', amount);
				map.add('salesrep', salesrep);
				map.add('couponaamount', couponaamount);
				map.add('couponbamount', couponbamount);
				arr.push(map);
			}
			if (rts.length < 1000)
				break;
		}
		return arr;
	} catch (ex) {
		return common
				.getReturnError('TN_SL_TruckArrange getOrderSearchResult Error: '
						+ ex);
	}
}
