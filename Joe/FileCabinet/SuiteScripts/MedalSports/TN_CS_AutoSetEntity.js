/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define([ 'N/record', 'N/search', 'N/currency', 'N/currentRecord' ], function(
		record, search, currency, _currentRecord) {
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
			var sublistFieldName = context.fieldId;
			// entity变化监听事件 20180516
			if (sublistFieldName == 'entity') {
				var entity = currentRecord.getValue({
					fieldId : sublistFieldName
				});
				if (!entity) {
					return;
				}
				var mdEntity = search.lookupFields({
					type : 'customer',
					id : entity,
					columns : 'custentity_tn_entityf_entity'
				});
				// alert(JSON.stringify(mdEntity));
				// alert(mdEntity.custentity_tn_entityf_entity[0].value);
				var entityV = mdEntity.custentity_tn_entityf_entity[0];
				if (!entityV) {
					return;
				}
				var mdEntityV = entityV.value;
				if (mdEntityV) {
					currentRecord.setValue({
						fieldId : 'custbody_tn_entity',
						value : mdEntityV
					});
				}
			}
		} catch (e) {
			alert(e);
		}
	}
	function refresh() {
		try {

			var suiteletPage = _currentRecord.get();
			alert(document.getElementById("item").innerText + '|'
					+ document.getElementById("estimitfCost").innerText);
		} catch (e) {
			alert(e);
		}
	}
	return {
		fieldChanged : fieldChanged,
		refresh : refresh
	};
});