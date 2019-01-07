/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([], function() {
	function beforeLoad(context) {
		try {
			var newRecord = context.newRecord;
			context.form.getSublist('item').getField('rate').updateDisplayType(
					{
						displayType : 'disabled'
					});
		} catch (e) {
			log.debug({
				title : 'beforeLoad',
				details : e
			});
		}

	}

	return {
		beforeLoad : beforeLoad
	};

});