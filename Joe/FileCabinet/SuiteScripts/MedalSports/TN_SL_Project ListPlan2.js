/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([ 'N/ui/serverWidget', 'N/file', 'N/record' ],
		function(ui, file, record) {
			function onRequest(context) {
				if (context.request.method === 'GET') {
					var parameters = context.request.parameters;
					var plId = parameters.plId;
					var form = initForm(ui, plId);
					context.response.writePage(form);
				} else {
					// var loginName = context.request.custpage_loginname;
					// var loginPaw = parameters.custpage_loginpsw;
					// if (condition) {
					//				
					// }
				}

			}

			function initForm(ui, plId) {
				var form = ui.createForm({
					title : 'Project List Item'
				});
				// form.clientScriptFileId = 550;
				form.addButton({
					id : 'custpage_refresh',
					label : 'Refresh',
					functionName : 'refresh()'
				});
				var sublist = form.addSublist({
					id : 'custpage_sublistid',
					type : ui.SublistType.LIST,
					label : 'Inline Editor Sublist'
				});
				// sublist.addField({
				// id : 'custpage_infieldid',
				// type : ui.FieldType.INLINEHTML,
				// label : 'INLINEHTML'
				// });
				var c = sublist.addField({
					id : 'custpage_imfieldid',
					type : ui.FieldType.IMAGE,
					label : 'IMAGE'
				});
				var a = sublist.addField({
					id : 'custpage_txfieldid',
					type : ui.FieldType.TEXT,
					label : 'TEXT'
				});
				a.updateDisplayType({
					displayType : ui.FieldDisplayType.ENTRY
				});
				var b = sublist.addField({
					id : 'custpage_sefieldid',
					type : ui.FieldType.SELECT,
					label : 'SELECT',
					source:'invoice'
				});
				b.updateDisplayType({
					displayType : ui.FieldDisplayType.ENTRY
				});

				// sublist.addField({
				// id : 'custpage_recfieldid',
				// type : ui.FieldType.RICHTEXT,
				// label : 'RICHTEXT'
				// });
				sublist.setSublistValue({
				    id : 'custpage_txfieldid',
				    line : 0,
				    value : "adawd"
				});
				sublist.setSublistValue({
					id : 'custpage_imfieldid',
					line : 0,
					value : 'https://system.netsuite.com/core/media/media.nl?id=120&c=5052025_SB1&h=fd757195f5335d8d2101'
				});
				
				return form;
			}

			return {
				onRequest : onRequest
			};
		});