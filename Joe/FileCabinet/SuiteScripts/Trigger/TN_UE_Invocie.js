/*******************************************************************************
 * File Name : TN_UE_Invoie.js Description : User event on Invoie Company :
 * Trigger Networks Created By : Zed Wang Created On : 07/28/2014
 ******************************************************************************/
function afterSubmit(type) {
	try {
		if (type == 'create') {
			var _invppId = saveInvppRecord(type);
			if (_invppId != false)
				var arr = saveInvppsRecord(_invppId);
			var rec = nlapiLoadRecord('customrecord_tn_invoicependingprint',
					_invppId);
			rec.setFieldValue('custrecord_tn_amount', arr[0]);
			rec.setFieldValue('custrecord_tn_amounttax', arr[1]);
			rec.setFieldValue('custrecord_tn_invpp_grossamountsum', arr[0]
					+ arr[1]);
			nlapiSubmitRecord(rec);
			nlapiSetRedirectURL('RECORD',
					'customrecord_tn_invoicependingprint', _invppId);
		} else if (type == 'edit') {
			var _invppId = getInvppId();
			if (_invppId != null && _invppId != false) {
				var _ret = deleteRecord(_invppId);
				if (_ret != false) {
					var arr = saveInvppsRecord(_invppId);
					saveInvppRecord(type, _invppId);
					var rec = nlapiLoadRecord(
							'customrecord_tn_invoicependingprint', _invppId);
					rec.setFieldValue('custrecord_tn_amount', arr[0]);
					rec.setFieldValue('custrecord_tn_amounttax', arr[1]);
					rec.setFieldValue('custrecord_tn_invpp_grossamountsum',
							arr[0] + arr[1]);
					nlapiSubmitRecord(rec);
				}
			}
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'vraBeforeLoad', ex);
	}
}

function isContain(id, json) {
	if (json.length == null) {
		return false;
	}
	for ( var k in json) {
		if (id == k) {
			return true;
		}
	}
	return false;
}
function getCustomerInformation(id) {
	try {
		var filters = [ new nlobjSearchFilter('internalid', null, 'is', id) ];
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custentity_tn_custname');
		columns[1] = new nlobjSearchColumn(
				'custentity_tn_address_and_phone_number');
		columns[2] = new nlobjSearchColumn(
				'custentity_tn_bankname_and_accountnumber');
		columns[3] = new nlobjSearchColumn('custentity_tn_tax_register_number');
		columns[4] = new nlobjSearchColumn('custentity_tn_general_taxpayer');
		var rts = nlapiSearchRecord('customer', null, filters, columns);
		if (rts != 0) {
			var json = {};
			json.custname = rts[0].getValue(columns[0]);
			json.custAddAndPhone = rts[0].getValue(columns[1]);
			json.custBankAndAcc = rts[0].getValue(columns[2]);
			json.custTaxRegNum = rts[0].getValue(columns[3]);
			json.custGeneralTaxpayer = rts[0].getValue(columns[4]);
			return json;
		} else
			return null;
	} catch (ex) {
		nlapiLogExecution('debug', 'getCustomerInformation', ex);
	}
}
function getCompanyInformation() {
	try {
		var companyInformation = nlapiLoadConfiguration('companyinformation');
		var json = {};
		json.compname = companyInformation.getFieldValue('companyname');
		json.compAddAndPhone = companyInformation.getFieldValue('addresstext');
		json.compTaxRegNum = companyInformation.getFieldValue('employerid');
		return json;
	} catch (ex) {
		nlapiLogExecution('debug', 'getCompanyInformation', ex);
	}
}
function getCreditMemo(id) {
	try {
		var filters = [ new nlobjSearchFilter('createdfrom', null, 'is', id) ];
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('tranid');
		columns[1] = new nlobjSearchColumn('amount');
		var rts = nlapiSearchRecord('creditmemo', null, filters, columns);
		if (rts != null) {
			var arr = new Array();
			for (var i = 0; i < rts.length; i++) {
				var json = {};
				json.ids = rts[i].getValue(columns[0]);
				json.amount = rts[i].getValue(columns[1]);
				arr.push(json);
			}
			return arr;
		} else
			return null;
	} catch (ex) {
		nlapiLogExecution('debug', 'getCreditMemo', ex);
	}
}
function saveInvppRecord(type, id) {
	try {
		var _invoiceNum = nlapiGetFieldValue('tranid');
		var _invoiceId = nlapiGetRecordId();
		var _customer = nlapiGetFieldValue('entity');
		var _creaditMemo = getCreditMemo(_invoiceNum);
		var _receiver = nlapiGetFieldText('custbody_tn_remittee');
		var _checker = nlapiGetFieldText('custbody_tn_checker');
		var _memo = nlapiGetFieldValue('memo');
		var _companybankinfo = nlapiGetFieldValue('custbody_tn_seller_ban_nam_and_acc_num');
		var _customerInformation = getCustomerInformation(_customer);
		var _companyInformation = getCompanyInformation();
		if (type == 'create')
			var _rec = nlapiCreateRecord('customrecord_tn_invoicependingprint');
		else if (type == 'edit')
			var _rec = nlapiLoadRecord('customrecord_tn_invoicependingprint',
					id);
		_rec.setFieldValue('custrecord_tn_invp_sourcecustomer', _customer);
		_rec.setFieldValue('custrecord_tn_invp_sourceinvoice', _invoiceId);
		_rec.setFieldValue('custrecord_tn_invp_companybankinfo',
				_companybankinfo);
		// if (_creaditMemo != null)
		// _rec.setFieldValues('custrecord_tn_invp_sourcecreditmemo',
		// _creaditMemo.ids);
		_rec.setFieldValue('custrecord_tn_invp_receiver', _receiver);
		_rec.setFieldValue('custrecord_tn_invp_checker', _checker);
		_rec.setFieldValue('custrecord_tn_invp_invoicestatus', 1);
		_rec.setFieldValue('custrecord_tn_invp_memo', _memo);
		if (_customerInformation != null) {
			_rec.setFieldValue('custrecord_tn_invp_customername',
					_customerInformation.custname);
			_rec.setFieldValue('custrecord_tn_invp_customeradd',
					_customerInformation.custAddAndPhone);
			_rec.setFieldValue('custrecord_tn_invp_customerbankinfo',
					_customerInformation.custBankAndAcc);
			_rec.setFieldValue('custrecord_tn_invp_customerregno',
					_customerInformation.custTaxRegNum);
			_rec.setFieldValue('custrecord_tn_invp_invoicetype',
					_customerInformation.custGeneralTaxpayer == 'T' ? 1 : 2);
		}
		if (_companyInformation != null) {
			_rec.setFieldValue('custrecord_tn_invp_companyname',
					_companyInformation.compname);
			_rec.setFieldValue('custrecord_tn_invp_companyadd',
					_companyInformation.compAddAndPhone);
			_rec.setFieldValue('custrecord_tn_invp_companyregno',
					_companyInformation.compTaxRegNum);
		}
		var _invppId = nlapiSubmitRecord(_rec, true);
		return _invppId;
	} catch (ex) {
		nlapiLogExecution('debug', 'saveInvppRecord', ex);
		return false;
	}
}
function saveInvppsRecord(_invppid) {
	try {
		var _invpps = new Array();
		var _len = nlapiGetLineItemCount('item') + 1;
		var _netamountSum = 0;
		var _taxamountSum = 0;
		for (var i = 1; i < _len; i++) {
			var _item = nlapiGetLineItemValue('item', 'item', i);
			var _unitprice = nlapiGetLineItemValue('item', 'rate', i);
			var _quantity = nlapiGetLineItemValue('item', 'quantity', i);
			var _netamount = nlapiGetLineItemValue('item', 'amount', i);
			var _taxrate = nlapiGetLineItemValue('item', 'taxrate1', i);
			var _taxamount = _netamount
					* (parseFloat(_taxrate.substring(0, 2)) / 100);
			var _itemInformation = getItemInformation(_item);
			var _rec = nlapiCreateRecord('customrecord_tn_invoicependingprintsub');
			_rec.setFieldValue('custrecord_tn_invpps_detailline', _invppid);
			if (_itemInformation != null) {
				_rec.setFieldValue('custrecord_tn_invpps_itemname',
						_itemInformation.goodsname);
				_rec.setFieldValue('custrecord_tn_invpps_specification',
						_itemInformation.specifications);
				_rec.setFieldValue('custrecord_tn_invpps_unit',
						_itemInformation.unitofmeasurement);
			}
			_rec.setFieldValue('custrecord_tn_invpps_unitprice', _unitprice);
			_rec.setFieldValue('custrecord_tn_invpps_quantity', _quantity);
			_rec.setFieldValue('custrecord_tn_invpps_amount', _netamount);
			_rec.setFieldValue('custrecord_tn_invpps_taxrate', _taxrate);
			_rec.setFieldValue('custrecord_tn_invpps_taxamount', _taxamount);
			_netamountSum += parseFloat(_netamount);
			_taxamountSum += parseFloat(_taxamount);
			nlapiSubmitRecord(_rec, true);
		}
		var arr = [ _netamountSum, _taxamountSum ];
		return arr;
	} catch (ex) {
		nlapiLogExecution('debug', 'saveInvppsRecord', ex);
	}
}
function getItemInformation(id) {
	try {
		var filters = [ new nlobjSearchFilter('internalid', null, 'is', id) ];
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custitem_tn_goods_name');
		columns[1] = new nlobjSearchColumn('custitem_tn_specifications');
		columns[2] = new nlobjSearchColumn('custitem_tn_unit_of_measurement');
		var rts = nlapiSearchRecord('item', null, filters, columns);
		var json = {};
		if (rts != null) {
			json.goodsname = rts[0].getValue(columns[0]);
			json.specifications = rts[0].getValue(columns[1]);
			json.unitofmeasurement = rts[0].getValue(columns[2]);
			return json;
		} else
			return null;
	} catch (ex) {
		nlapiLogExecution('debug', 'getItemInformation', ex);
		return false;
	}
}
function getInvppId() {
	try {
		var _invoiceId = nlapiGetRecordId();
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('custrecord_tn_invp_sourceinvoice',
				null, 'is', _invoiceId);
		filters[1] = new nlobjSearchFilter(
				'custrecord_tn_invp_sourcecreditmemo', null, 'isempty');
		var rts = nlapiSearchRecord('customrecord_tn_invoicependingprint',
				null, filters, null);
		if (rts != null) {
			return rts[0].getId();
		} else
			return null;
	} catch (ex) {
		nlapiLogExecution('debug', 'getInvppId', ex);
		return false;
	}
}
function deleteRecord(_invppId) {
	try {
		var filters = [ new nlobjSearchFilter(
				'custrecord_tn_invpps_detailline', null, 'is', _invppId) ];
		var rts = nlapiSearchRecord('customrecord_tn_invoicependingprintsub',
				null, filters, null);
		if (rts != null) {
			for (var i = 0; i < rts.length; i++) {
				var _id = rts[i].getId();
				nlapiDeleteRecord('customrecord_tn_invoicependingprintsub', _id);
			}
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'deleteRecord', ex);
		return false;
	}
}