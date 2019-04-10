/**
 * @NApiVersion 2.0
 * @NScriptType MassUpdateScript
 */
define([ 'N/record' ], function(record) {
	function each(params) {
		// Set the probability to 61%
		var recOpportunity = record.load({
			type : params.type,
			id : params.id
		// ,
		// isDynamic:true
		});
		log.debug({
			title : 'recOpportunity',
			details : recOpportunity
		});
		// recOpportunity.setValue('probability', 61);
		recOpportunity.save();
	}
	return {
		each : each
	};
});