/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 */
define([ 'N/record', 'N/search', 'N/currency' ], function(record, search,
		currency) {
	function pageInit(scriptContext) {
		try {
			var type = scriptContext.mode;
			var currentRecord = scriptContext.currentRecord;
			alert(type);
		} catch (ex) {
			alert(ex);
		}
	}
	return {
		pageInit : pageInit
	};
});