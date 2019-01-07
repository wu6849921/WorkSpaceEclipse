define([ 'N/currentRecord', 'N/url' ], function(currentRecord, url) {
	var suiteletPage = currentRecord.get();
	function printForm() {
		// alert(1);
		try {
			var numLines = suiteletPage.getLineCount({
				sublistId : 'custpage_gllines'
			});
			// alert(numLines);
			var savedTranIds = '';// id¼¯ºÏ
			for (var i = 0; i < numLines; i++) {
				var select = suiteletPage.getSublistValue({
					sublistId : 'custpage_gllines',
					fieldId : 'custpage_gl_select',
					line : i
				})
				var tranId = suiteletPage.getSublistValue({
					sublistId : 'custpage_gllines',
					fieldId : 'custpage_gl_transactionname',
					line : i
				})
				if (select) {
					if (savedTranIds.indexOf(tranId + ',') == -1) {
						savedTranIds += tranId + ',';
					}
				}
			}
			if (savedTranIds.indexOf(',') != -1) {
				savedTranIds = savedTranIds.substring(0,
						savedTranIds.length - 1);
			}
			// alert(savedTranIds);
			window.onbeforeunload = function() {
				return;
			};
			window.open(url.resolveScript({
				scriptId : 'customscript_tn_voucher',
				deploymentId : 'customdeploy_tn_voucher',
				params : {
					savedTranIds : savedTranIds
				}
			}));
		} catch (e) {
			alert(e);
		}

	}
	return {
		printForm : printForm
	};
});
