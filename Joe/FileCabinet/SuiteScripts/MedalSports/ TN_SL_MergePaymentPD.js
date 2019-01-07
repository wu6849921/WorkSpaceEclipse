/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([ 'N/ui/serverWidget' ], function(serverWidget) {
	// var clientScriptPath = '/SuiteScripts/Trigger/TN_CS_MergeGL.js';
	function onRequest(context) {
		if (context.request.method === 'GET') {
			var request = context.request;
			var parameters = request.parameters;
			var mpForm = serverWidget.createForm({
				title : '合并付款打印'
			});
			mpForm.clientScriptFileId = 70;
			mpForm.addButton({
				id : 'buttonid',
				label : 'Print',
				functionName : 'print()'
			});
			var startDate = mpForm.addField({
				id : 'custpage_startdate',
				type : serverWidget.FieldType.DATE,
				label : 'Start Date'
			}).defaultValue = new Date();
			var endDate = mpForm.addField({
				id : 'custpage_enddate',
				type : serverWidget.FieldType.DATE,
				label : 'End Date'
			}).defaultValue = new Date();
			context.response.writePage(mpForm);
		} else {
			var request = context.request;
			var parameters = request.parameters;
		}
	}

	return {
		onRequest : onRequest
	};
});