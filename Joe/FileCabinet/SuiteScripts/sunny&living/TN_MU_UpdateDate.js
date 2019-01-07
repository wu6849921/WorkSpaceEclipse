/**
 * @NApiVersion 2.0
 * @NScriptType MassUpdateScript
 */
define([ 'N/record', 'N/runtime' ], function(record, runtime) {
	function each(params) {
		var currentScript = runtime.getCurrentScript();
		var date = currentScript.getParameter({
			name : 'custscript_tn_date'
		});
		var dateNew = date.getDate() + '/' + (date.getMonth() + 1) + '/'
				+ date.getFullYear();

		var id = record.submitFields({
			type : params.type,
			id : params.id,
			values : {
				'trandate' : dateNew
			}
		});

		// recOpportunity.setValue('probability', 61);
		// recOpportunity.save();
	}
	return {
		each : each
	};
});