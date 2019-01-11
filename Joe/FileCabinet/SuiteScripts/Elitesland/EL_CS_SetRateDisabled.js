function lineInit(type) {
	if (type == 'item') {
		this.setDisable();
	}
}

function postSourcing(type, name) {
	if (type == 'item' && name == 'item') {
		this.setDisable();
	}

}
function setDisable() {
	nlapiDisableLineItemField('item', 'rate', true);
	var isBargain = true;
	if (nlapiGetRecordType() == 'purchaseorder') {
		isBargain = this.isBargain();
	}
	nlapiDisableLineItemField('item', 'custcol_including_tax_unit_price',
			isBargain);
	nlapiDisableLineItemField('item', 'taxcode', isBargain);
}

function isBargain() {
	// 当含税单价改变，再判断是否可议价
	var vendor = nlapiGetFieldValue('entity');
	var isBargain = nlapiLookupField('vendor', vendor, 'custentity1');
	// alert(isBargain);
	if (isBargain == 'F') {
		// 判断item是否可议价
		var item = nlapiGetCurrentLineItemValue('item', 'item');
		if (!item) {
			return true;
		}
		isBargain = nlapiLookupField('item', item, 'custitem1');
		// alert(isBargain);
	}
	return isBargain == 'F';
}