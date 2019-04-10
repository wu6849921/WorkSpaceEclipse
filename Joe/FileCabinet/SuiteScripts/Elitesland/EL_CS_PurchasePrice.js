/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define([ 'N/search', ], function(search) {
	/**
	 * Function to be executed when field is changed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * @param {string}
	 *            scriptContext.fieldId - Field name
	 * @param {number}
	 *            scriptContext.lineNum - Line number. Will be undefined if not
	 *            a sublist or matrix field
	 * 
	 * @since 2015.2
	 */
	function fieldChanged(context) {
		try {
			var currentRecord = context.currentRecord;
			var fieldName = context.fieldId;
			if (fieldName == 'custrecord_el_pp_subsidiary') {
				var area = currentRecord.getValue({
					fieldId : 'custrecord_el_pp_area'
				});
				var subsidiary = currentRecord.getValue({
					fieldId : 'custrecord_el_pp_subsidiary'
				});
				if (area || !subsidiary) {
					return;
				}
				var subArea = search.lookupFields({
					type : search.Type.SUBSIDIARY,
					id : subsidiary,
					columns : [ 'custrecord_area' ]
				});
				if (subArea.custrecord_area[0]) {
					subArea = subArea.custrecord_area[0].value;
					currentRecord.setValue({
						fieldId : 'custrecord_el_pp_area',
						value : subArea
					});
				}
			}
			if (fieldName == 'custrecord_el_pp_taxrate') {
				var taxRate = currentRecord.getValue({
					fieldId : 'custrecord_el_pp_taxrate'
				});
				var taxCode = currentRecord.getValue({
					fieldId : 'custrecord_el_pp_taxcode'
				});
				if (!taxRate) {
					return;
				}
				if (taxCode) {
					var taxNum = search.lookupFields({
						type : search.Type.SALES_TAX_ITEM,
						id : taxCode,
						columns : [ 'rate' ]
					});
					// alert(JSON.stringify(taxNum));
					if (taxNum.rate) {
						taxNum = toPoint(taxNum.rate);
						// alert(taxNum);
						taxRate = taxRate / (1 + taxNum);
					}
				}
				currentRecord.setValue({
					fieldId : 'custrecord_el_pp_rate',
					value : taxRate
				});
			}
		} catch (e) {
			alert(e);
		}

	}
	function toPoint(percent) {
		var str = percent.replace("%", "");
		str = str / 100;
		return str;
	}
	/**
	 * Function to be executed after page is initialized.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.mode - The mode in which the record is being
	 *            accessed (create, copy, or edit)
	 * 
	 * @since 2015.2
	 */
	function pageInit(context) {
		try {
			// if (context.mode == 'create') {
			var currentRecord = context.currentRecord;
			var recType = currentRecord.type;
			var numLines = currentRecord.getLineCount({
				sublistId : 'item'
			});
			if (numLines == 0) {
				return;
			}
		} catch (ex) {
			alert(ex);
		}
	}

	return {
		fieldChanged : fieldChanged
	// ,
	// pageInit : pageInit
	};
});