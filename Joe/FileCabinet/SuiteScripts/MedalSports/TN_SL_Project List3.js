/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([ 'N/ui/serverWidget', 'N/file' ], function(ui, file) {
	function onRequest(context) {
		if (context.request.method === 'GET') {
			var parameters = context.request.parameters;
			var plId = parameters.plId;
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
			title : 'Project List Item'
		});
		form.clientScriptFileId = 550;
		form.addField({
			id : 'custpage_pllist',
			type : ui.FieldType.INLINEHTML,
			label : 'Project List'
		}).defaultValue = getHtml();
		form.addButton({
			id : 'custpage_refresh',
			label : 'Refresh',
			functionName : 'refresh()'
		});
		return form;
	}

	function getHtml() {
		var html = "<!DOCTYPE html >\r\n" + "<html>\r\n" + "<head>\r\n"
				+ "<meta charset=\"UTF-8\" />\r\n" + "<title>¿É±à¼­±í¸ñ</title>\r\n"
				+ "<style type='text/css'>\r\n" + "td {\r\n"
				+ "	width: 100px;\r\n" + "}\r\n" + "\r\n" + "#left_div {\r\n"
				+ "	width: 200px;\r\n" + "	float: left;\r\n" + "}\r\n" + "\r\n"
				+ "#left_div1 {\r\n" + "	width: 100%;\r\n" + "}\r\n" + "\r\n"
				+ "#left_div2 {\r\n" + "	width: 100%;\r\n"
				+ "	height: 100px;\r\n" + "	overflow: hidden;\r\n" + "}\r\n"
				+ "\r\n" + "#right_div {\r\n" + "	width: 600px;\r\n"
				+ "	float: left;\r\n" + "}\r\n" + "\r\n" + "#right_div1 {\r\n"
				+ "	width: 100%;\r\n" + "	overflow: hidden;\r\n" + "}\r\n"
				+ "\r\n" + "#right_divx {\r\n" + "	width: 820px;\r\n" + "}\r\n"
				+ "\r\n" + "#right_div2 {\r\n" + "	width: 100%;\r\n"
				+ "	height: 120px;\r\n" + "	overflow: auto;\r\n" + "}\r\n"
				+ "\r\n" + "#right_table1 {\r\n" + "	width: 800px;\r\n"
				+ "}\r\n" + "\r\n" + "#right_table2 {\r\n"
				+ "	width: 800px;\r\n" + "}\r\n" + "</style>\r\n"
				+ "</head>\r\n" + "<body>\r\n" + "	<div id=\"left_div\">\r\n"
				+ "		<div id=\"left_div1\">\r\n"
				+ "			<table id=\"left_table1\">\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "			</table>\r\n" + "		</div>\r\n"
				+ "		<div id=\"left_div2\">\r\n"
				+ "			<table id=\"left_table2\">\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "				<tr>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "				</tr>\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "				<tr>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "				</tr>\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "				<tr>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "				</tr>\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "				<tr>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "				</tr>\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "				<tr>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "				</tr>\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "			</table>\r\n" + "		</div>\r\n"
				+ "	</div>\r\n" + "	<div id=\"right_div\">\r\n"
				+ "		<div id=\"right_div1\">\r\n"
				+ "			<div id=\"right_divx\">\r\n"
				+ "				<table id=\"right_table1\">\r\n" + "					<tr>\r\n"
				+ "						<td>1</td>\r\n" + "						<td>1</td>\r\n"
				+ "						<td>1</td>\r\n" + "						<td>1</td>\r\n"
				+ "					</tr>\r\n" + "				</table>\r\n" + "			</div>\r\n"
				+ "		</div>\r\n" + "		<div id=\"right_div2\">\r\n"
				+ "			<table id=\"right_table2\">\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "				<tr>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "				</tr>\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "				<tr>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "				</tr>\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "				<tr>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "				</tr>\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "				<tr>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "				</tr>\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "				<tr>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "				</tr>\r\n" + "				<tr>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "					<td>1</td>\r\n" + "					<td>1</td>\r\n"
				+ "				</tr>\r\n" + "			</table>\r\n" + "		</div>\r\n"
				+ "	</div>\r\n" + "</body>\r\n" + "</html>";
		return html;
	}
	return {
		onRequest : onRequest
	};
});