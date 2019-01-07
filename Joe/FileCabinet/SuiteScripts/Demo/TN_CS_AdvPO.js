/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 */
define(
		[],
		function() {
			function fieldChanged(context) {
				var currentRecord = context.currentRecord;
				var sublistName = context.sublistId;
				var sublistFieldName = context.fieldId;
				if (sublistName === 'recmachcustrecord9'
						&& (sublistFieldName === 'custrecord10' || sublistFieldName === 'custrecord11')) {
					var rate = currentRecord.getCurrentSublistValue({
						sublistId : 'recmachcustrecord9',
						fieldId : 'custrecord10'
					});
					var quantity = currentRecord.getCurrentSublistValue({
						sublistId : 'recmachcustrecord9',
						fieldId : 'custrecord11'
					});
					if (rate && quantity) {
						currentRecord.setCurrentSublistValue({
							sublistId : 'recmachcustrecord9',
							fieldId : 'custrecord12',
							value : rate * quantity
						});
					}
				}
			}
			return {
				fieldChanged : fieldChanged
			};
		});