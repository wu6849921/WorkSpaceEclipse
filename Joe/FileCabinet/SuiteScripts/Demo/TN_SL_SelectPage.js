/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
		[ 'N/ui/serverWidget', 'N/search' ],
		function(ui, search) {
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
					title : 'Select'
				});
				// form.clientScriptFileId = 161;
				form.addFieldGroup({
					id : 'custpage_exprepgroup',
					label : 'Expense Report'
				});
				form.addFieldGroup({
					id : 'custpage_pucregroup',
					label : 'Purchases Requisition'
				});
				form.addFieldGroup({
					id : 'custpage_pucgroup',
					label : 'Purchases'
				});
				form.addField({
					id : 'custpage_exprep',
					type : ui.FieldType.INLINEHTML,
					label : 'Expense Report',
					container : 'custpage_exprepgroup'
				}).defaultValue = '<a href="https://system.netsuite.com/app/accounting/transactions/transactionlist.nl?Transaction_TYPE=ExpRept&whence=" target="_blank">Expense Report List</a>';
				form.addField({
					id : 'custpage_exprep2',
					type : ui.FieldType.INLINEHTML,
					label : 'Expense Report',
					container : 'custpage_exprepgroup'
				}).defaultValue = '<a href="https://system.netsuite.com/app/accounting/transactions/exprept.nl?whence=" target="_blank">New Expense Report</a>';
				form.addField({
					id : 'custpage_pucre',
					type : ui.FieldType.INLINEHTML,
					label : 'Purchases Requisitions',
					container : 'custpage_pucregroup'
				}).defaultValue = '<a href="https://system.netsuite.com/app/accounting/transactions/transactionlist.nl?Transaction_TYPE=PurchReq&whence=" target="_blank">Purchases Requisition List</a>';
				form.addField({
					id : 'custpage_pucre2',
					type : ui.FieldType.INLINEHTML,
					label : 'Purchases Requisitions',
					container : 'custpage_pucregroup'
				}).defaultValue = '<a href="https://system.netsuite.com/app/accounting/transactions/purchreq.nl" target="_blank">New Purchases Requisition</a>';
				form.addField({
					id : 'custpage_puche',
					type : ui.FieldType.INLINEHTML,
					label : 'Purchases Requisitions',
					container : 'custpage_pucgroup'
				}).defaultValue = '<a href="https://system.netsuite.com/app/accounting/transactions/transactionlist.nl?Transaction_TYPE=PurchOrd&whence=" target="_blank">Purchases Order List</a>';
				form.addField({
					id : 'custpage_puche2',
					type : ui.FieldType.INLINEHTML,
					label : 'Purchases Order',
					container : 'custpage_pucgroup'
				}).defaultValue = '<a href="https://system.netsuite.com/app/accounting/transactions/purchord.nl" target="_blank">New Purchases Order</a>';
				return form;
			}
			return {
				onRequest : onRequest
			};
		});