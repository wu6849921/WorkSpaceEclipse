/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
		[ 'N/record', 'N/redirect','N/https' ],
		function(_record, redirect,https) {
			// var clientScriptPath = '/SuiteScripts/Trigger/TN_CS_MergeGL.js';
			function onRequest(context) {
				if (context.request.method === 'GET') {
					var request = context.request;
					var parameters = request.parameters;
					var recordId = parameters.recordId;
					var recordType = parameters.recordType;
					var rectype = parameters.rectype;
					var objRecord = _record.load({
						type : recordType,
						id : recordId,
						isDynamic : true
					});
					objRecord.save();
					redirect.toRecord({
					    type : recordType, 
					    id : recordId
					});
//					var response = https.get({
//					    url: 'https://5059457-sb1.app.netsuite.com/app/common/custom/custrecordentrylist.nl?rectype='
//							+ rectype
//					});
				}
			}
			return {
				onRequest : onRequest
			};
		});