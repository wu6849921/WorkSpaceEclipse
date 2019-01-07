/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 17 May 2016 Zed
 * 
 */

triggernamespace('trigger');
var common = new trigger.common();
var rule = new trigger.rule();
var config = new trigger.config();

trigger.integration = function() {

	var _recordtype = '';
	var _resultArr = [];
	var _resetArr = [];
	var _pageNumber = 0;
	var _pageCount = 0;

	this.setPageNumer = function(val) {
		_pageNumber = val;
	};

	this.setPageCount = function(val) {
		_pageCount = val;
	};

	this.setRecordType = function(val) {
		_recordtype = val;
	};

	this.getResetArr = function() {
		return _resetArr;
	};

	var getMd5String = function() {
		return hex_md5(config.getUsername() + config.getPassword()
				+ config.getMd5Key());
	};

	// 鍒濆鍖栨暟鎹�--InitializeData
	this.initializeData = function(filters, columns, fields, type, isinbulk) {
		var uom = {};
		if (type == 'inventorystatus') {
			uom = buildUOMTransferTable();
		}
		var sc = nlapiCreateSearch(_recordtype);

		if (filters) {
			sc.addFilters(filters);
		}

		if (columns) {
			sc.addColumns(columns);
		}

		var rtSet = sc.runSearch();
		if (_pageNumber && _pageCount) {
			for (var n = (_pageNumber - 1) * _pageCount; n < 200000; n += 1000) {
				var rts = rtSet.getResults(n, n + 1000 < _pageNumber
						* _pageCount ? n + 1000 : _pageNumber * _pageCount);
				if (!rts || rts.length <= 0)
					break;
				for (var i = 0; i < rts.length; i++) {
					var t = {};
					for (var j = 0; j < fields.length; j++) {
						if (fields[j].id == 'quantityavailable'
								&& type == 'inventorystatus') {
							var stockunit = rts[i].getValue('stockunit');
							var salesunit = rts[i].getValue('saleunit');
							var quantityavailable = common
									.convertValToNum(rts[i]
											.getValue('locationquantityavailable'));
							var stockrate = common
									.convertValToNum(uom[stockunit.toString()]);
							var salesrate = common
									.convertValToNum(uom[salesunit.toString()]);
							if (isinbulk == 'T') {
								t['quantityavailable'] = common
										.convertValToNum(quantityavailable
												* stockrate, 4);
							} else {
								t['quantityavailable'] = common
										.convertValToNum(
												(quantityavailable * stockrate)
														/ salesrate, 4);
							}
						} else if (fields[j].id == 'class') {
							t['classification'] = rts[i].getValue('class');
						} else if (fields[j].id == 'quantityavailable') {
							t[fields[j].id] = rts[i]
									.getValue('locationquantityavailable');
						} else {
							if (fields[j].type == 'select') {
								t[fields[j].id] = rts[i].getText(fields[j].id);
							} else if (fields[j].type == 'multiselect') {
								t[fields[j].id] = rts[i].getValue(fields[j].id)
										.replace(/,/g, '\,');
							} else {
								t[fields[j].id] = rts[i].getValue(fields[j].id);
							}
						}
					}

					_resultArr.push(t);
				}
				if (rts.length < 1000)
					break;
			}
		} else {
			for (var n = 0; n < 200; n++) {
				var rts = rtSet.getResults(n * 1000, (n + 1) * 1000);
				if (!rts || rts.length <= 0)
					break;
				for (var i = 0; i < rts.length; i++) {
					var t = {};
					for (var j = 0; j < fields.length; j++) {
						if (fields[j].id == 'quantityavailable'
								&& type == 'inventorystatus') {
							var stockunit = rts[i].getValue('stockunit');
							var salesunit = rts[i].getValue('saleunit');
							var quantityavailable = common
									.convertValToNum(rts[i]
											.getValue('locationquantityavailable'));
							var stockrate = common
									.convertValToNum(uom[stockunit.toString()]);
							var salesrate = common
									.convertValToNum(uom[salesunit.toString()]);
							if (isinbulk == 'T') {
								t['quantityavailable'] = common
										.convertValToNum(quantityavailable
												* stockrate, 4);
							} else {
								t['quantityavailable'] = common
										.convertValToNum(
												(quantityavailable * stockrate)
														/ salesrate, 4);
							}
						} else if (fields[j].id == 'class') {
							t['classification'] = rts[i].getValue('class');
						} else if (fields[j].id == 'quantityavailable') {
							t[fields[j].id] = rts[i]
									.getValue('locationquantityavailable');
						} else {
							if (fields[j].type == 'select') {
								t[fields[j].id] = rts[i].getText(fields[j].id);
							} else if (fields[j].type == 'multiselect') {
								t[fields[j].id] = rts[i].getValue(fields[j].id)
										.replace(/,/g, '\,');
							} else {
								t[fields[j].id] = rts[i].getValue(fields[j].id);
							}
						}
					}

					_resultArr.push(t);
				}
				if (rts.length < 1000)
					break;
			}
		}
	};

	this.validateLoginInfo = function(username, password, md5Str) {
		try {
			if (username == config.getUsername()
					&& password == config.getPassword()) {
				var md5key = config.getMd5Key();
				if (md5key) {
					var _md5Str = getMd5String();
					if (_md5Str == md5Str) {
						return true;
					}
				} else {
					return true;
				}
			} else {
				return false;
			}
		} catch (ex) {
			nlapiLogExecution('debug', 'validateLoginInfo', ex);
		}
	};

	this.getResults = function() {
		return _resultArr;
	};
};

function buildUOMTransferTable() {
	var tmp = {};
	var rec = nlapiLoadRecord('unitstype', 2);
	var c = rec.getLineItemCount('uom');
	for (var i = 1; i <= c; i++) {
		// map.add(rec.getLineItemValue('uom','internalid',i),rec.getLineItemValue('uom','conversionrate',i));
		tmp[rec.getLineItemValue('uom', 'internalid', i).toString()] = rec
				.getLineItemValue('uom', 'conversionrate', i);
	}
	return tmp;
}
