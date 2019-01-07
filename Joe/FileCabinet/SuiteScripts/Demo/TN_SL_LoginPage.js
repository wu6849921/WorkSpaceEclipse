/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([ 'N/ui/serverWidget', 'N/search' ], function(ui, search) {
	function onRequest(context) {
		if (context.request.method === 'GET') {
			var parameters = context.request.parameters;
			var form = initForm(ui);
			context.response.writePage(form);
		} else {
			// var loginName = context.request.custpage_loginname;
			// var loginPaw = parameters.custpage_loginpsw;
			// if (condition) {
			//				
			// }
		}

	}

	function initForm(ui) {
		var form = ui.createForm({
			title : 'Login'
		});
		form.clientScriptFileId = 161;
		var byDate = form.addFieldGroup({
			id : 'custpage_logingroup',
			label : 'Login'
		});
		form.addField({
			id : 'custpage_loginname',
			type : ui.FieldType.TEXT,
			label : 'Login Name',
			container : 'custpage_logingroup'
		}).updateLayoutType({
			layoutType : ui.FieldLayoutType.MIDROW
		});
		form.addField({
			id : 'custpage_loginpsw',
			type : ui.FieldType.TEXT,
			label : 'Login Password',
			container : 'custpage_logingroup'
		}).updateLayoutType({
			layoutType : ui.FieldLayoutType.MIDROW
		});
		form.addButton({
			id : 'custpage_login',
			label : 'Login',
			functionName : 'login()'
		});
		return form;
	}
	return {
		onRequest : onRequest
	};
});