function lineInit(type) {
	if (nlapiGetFieldValue('customform') !='102' && nlapiGetFieldValue('customform') !='103') {
		return;
	}
	if (type == 'item') {
		this.setDisable();
	}
}

function postSourcing(type, name) {
	if (nlapiGetFieldValue('customform') !='102' && nlapiGetFieldValue('customform') !='103') {
		return;
	}
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
	// ����˰���۸ı䣬���ж��Ƿ�����
	var vendor = nlapiGetFieldValue('entity');
	var isBargain = nlapiLookupField('vendor', vendor, 'custentity1');
	// alert(isBargain);
	if (isBargain == 'F') {
		// �ж�item�Ƿ�����
		var item = nlapiGetCurrentLineItemValue('item', 'item');
		if (!item) {
			return true;
		}
		isBargain = nlapiLookupField('item', item, 'custitem1');
		// alert(isBargain);
	}
	return isBargain == 'F';
}