/**
 * @NApiVersion 2.0
 * @NScriptType MassUpdateScript
 */
define([ 'N/record' ], function(record) {
	function each(params) {
		var rec = record.load({
			type : params.type,
			id : params.id
		});
		rec.save();
	}
	return {
		each : each
	};
});