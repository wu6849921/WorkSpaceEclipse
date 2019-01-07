function pageInit(type) {
	nlapiDisableLineItemField('item', 'rate', true);
	nlapiDisableLineItemField('item', 'custcol_including_tax_unit_price', true);
}

function postSourcing(type, name) {
	if (type == 'item' && name == 'item') {
		nlapiDisableLineItemField('item', 'rate', true);
		nlapiDisableLineItemField('item', 'custcol_including_tax_unit_price',
				true);
	}

}