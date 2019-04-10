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
//		form.clientScriptFileId = 161;
		form.addField({
			id : 'custpage_loginname',
			type : ui.FieldType.INLINEHTML,
			label:'a'
		}).defaultValue="<!DOCTYPE html >\r\n" + 
		"<html >\r\n" + 
		"<head>\r\n" + 
		"<meta charset=\"utf-8\" />\r\n" + 
		"<title>可编辑表格</title>\r\n" + 
		"<style type='text/css'>\r\n" + 
		".table-head{padding-right:17px;background-color:#999;color:#000;}\r\n" + 
		".table-body{width:100%; height:300px;overflow-y:scroll;}\r\n" + 
		".table-head table,.table-body table{width:100%;}\r\n" + 
		".table-body table tr:nth-child(2n+1){background-color:#f2f2f2;}\r\n" + 
		"</style>\r\n" + 
		"</head>\r\n" + 
		"<body>\r\n" + 
		"<div style=\"width: 800px;\">\r\n" + 
		"    <div class=\"table-head\">\r\n" + 
		"    <table>\r\n" + 
		"        <colgroup>\r\n" + 
		"            <col style=\"width: 80px;\" />\r\n" + 
		"            <col />\r\n" + 
		"        </colgroup>\r\n" + 
		"        <thead>\r\n" + 
		"            <tr><th>序号</th><th>内容</th></tr>\r\n" + 
		"        </thead>\r\n" + 
		"    </table>\r\n" + 
		"    </div>\r\n" + 
		"    <div class=\"table-body\">\r\n" + 
		"    <table>\r\n" + 
		"        <colgroup><col style=\"width: 80px;\" /><col /></colgroup>\r\n" + 
		"        <tbody>\r\n" + 
		"            <tr><td>1</td><td><div id = '1'; contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"            <tr><td>1</td><td><div contenteditable=\"true\">第一行第一列</div></td></tr>\r\n" + 
		"        </tbody>\r\n" + 
		"    </table>\r\n" + 
		"    </div>\r\n" + 
		"</div>\r\n" + 
		"</body>\r\n" + 
		"</html>";
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