/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([ 'N/ui/serverWidget', 'N/file','N/record' ], function(ui, file,record) {
	function onRequest(context) {
		if (context.request.method === 'GET') {
			var parameters = context.request.parameters;
			var plId = parameters.plId;
			var form = initForm(ui,plId);
			context.response.writePage(form);
		} else {
			// var loginName = context.request.custpage_loginname;
			// var loginPaw = parameters.custpage_loginpsw;
			// if (condition) {
			//				
			// }
		}

	}

	function initForm(ui,plId) {
		var plRecord = record.load({
		    type: record.Type.ESTIMATE, 
		    id: plId
		});
		var item =  plRecord.getSublistText({
		    sublistId: 'item',
		    fieldId: 'item',
		    line: 0
		});
		var estimitfCost =  plRecord.getSublistText({
			sublistId: 'item',
			fieldId: 'custcol_tn_quote_estimitfcost',
			line: 0
		});
		var form = ui.createForm({
			title : 'Project List Item'
		});
		form.clientScriptFileId = 550;
		form.addField({
			id : 'custpage_pllist',
			type : ui.FieldType.INLINEHTML,
			label : 'Project List'
		}).defaultValue = getHtml(item,estimitfCost);
		form.addButton({
			id : 'custpage_refresh',
			label : 'Refresh',
			functionName : 'refresh()'
		});
		return form;
	}

	function getHtml(item,estimitfCost) {
//		var html = file.load({
//			id: 'Templates/Html Templates/Project List Templates.html'
//		}).getContents();
		var html = "<html>\r\n" + 
		"<head>\r\n" + 
		"<meta charset=\"UTF-8\" />\r\n" + 
		"<title>�ɱ༭���</title>\r\n" + 
		"<style type='text/css'>\r\n" + 
		"#left_div {\r\n" + 
		"	width: 400px;\r\n" + 
		"	float: left;\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#left_div1 {\r\n" + 
		"	width: 100%;\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#left_div2 {\r\n" + 
		"	width: 100%;\r\n" + 
		"	height: 100px;/* ��2�����div�߶ȶ����Ա���߶ȴ���div��ʱ��������¹����� */\r\n" + 
		"	overflow: hidden;\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#right_div {\r\n" + 
		"	width: 900px; /* �����ұ�����table���div��ȣ�����С���ڲ�table��ȲŻ�������ҹ�����*/\r\n" + 
		"	float: left;\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#right_div1 {\r\n" + 
		"	width: 100%;\r\n" + 
		"	overflow: hidden;\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#right_divx {\r\n" + 
		"	width: 3220px; /* Ϊ�˲���right_table2������ľ��� Ҫ��right_table2��20px*/\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#right_div2 {\r\n" + 
		"	width: 100%;\r\n" + 
		"	height: 120px;/* ��2�����div�߶ȶ��������left_div2�߶�20����Ϊ�����ҹ�����*/\r\n" + 
		"	overflow: auto;/* ��2������div��������¼����ҹ����� */\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#left_table1 {\r\n" + 
		"	border: 1px solid;\r\n" + 
		"	border-collapse: collapse;\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#left_table2 {\r\n" + 
		"	border: 1px solid;\r\n" + 
		"	border-collapse: collapse;\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#left_table1 td {\r\n" + 
		"	border: 1px solid;\r\n" + 
		"	width: 200px;\r\n" + 
		"	height: 50px;/* ������1���tb�ĸ߶ȣ�Ϊ�˺���1�ı��߶ȱ���һ�� */\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#left_table2 td {\r\n" + 
		"	border: 1px solid;\r\n" + 
		"	width: 200px;\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#right_table1 {\r\n" + 
		"	width: 3200px; /* �����ұ��Ϸ�table��ȣ�����������div��ȲŻ�������ҹ�����*/\r\n" + 
		"	border: 1px solid;\r\n" + 
		"	border-collapse: collapse\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#right_table2 {\r\n" + 
		"	width: 3200px; /* �����ұ��·�table��ȣ�����������div��ȲŻ�������ҹ�����*/\r\n" + 
		"	border: 1px solid;\r\n" + 
		"	border-collapse: collapse\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#right_table1 td {\r\n" + 
		"	border: 1px solid;\r\n" + 
		"	width: 100px;\r\n" + 
		"	height: 50px;/* ������1���tb�ĸ߶ȣ�Ϊ�˺���1�ı��߶ȱ���һ�� */\r\n" + 
		"}\r\n" + 
		"\r\n" + 
		"#right_table2 td {\r\n" + 
		"	border: 1px solid;\r\n" + 
		"	width: 100px;\r\n" + 
		"}\r\n" + 
		"</style>\r\n" + 
		"</head>\r\n" + 
		"<body>\r\n" + 
		"	<div id=\"left_div\">\r\n" + 
		"		<div id=\"left_div1\">\r\n" + 
		"			<table id=\"left_table1\">\r\n" + 
		"				<tr>\r\n" + 
		"					<td>Item</td>\r\n" + 
		"					<td>Display Name</td>\r\n" + 
		"				</tr>\r\n" + 
		"			</table>\r\n" + 
		"		</div>\r\n" + 
		"		<div id=\"left_div2\">\r\n" + 
		"			<table id=\"left_table2\">\r\n" + 
		"				<tr>\r\n" + 
		"					<td><div id='item'>"+item+"</div></td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"			</table>\r\n" + 
		"		</div>\r\n" + 
		"	</div>\r\n" + 
		"	<div id=\"right_div\">\r\n" + 
		"		<div id=\"right_div1\">\r\n" + 
		"			<div id=\"right_divx\">\r\n" + 
		"				<table id=\"right_table1\">\r\n" + 
		"					<tr>\r\n" + 
		"						<td>Factory ID/Name for Short</td>\r\n" + 
		"						<td>Factory Cost</td>\r\n" + 
		"						<td>MD Estimate Factory Cost</td>\r\n" + 
		"						<td>Sales Comm. %</td>\r\n" + 
		"						<td>PLI %</td>\r\n" + 
		"						<td>After Service %</td>\r\n" + 
		"						<td>Defective Allowance%</td>\r\n" + 
		"						<td>Testing Fee %</td>\r\n" + 
		"						<td>Reserve%</td>\r\n" + 
		"						<td>Brand</td>\r\n" + 
		"						<td>Royalty%</td>\r\n" + 
		"						<td>Markdown%</td>\r\n" + 
		"						<td>Total Cost</td>\r\n" + 
		"						<td>N. FOB Price</td>\r\n" + 
		"						<td>MD Net Margin</td>\r\n" + 
		"						<td>MD Gross Margin</td>\r\n" + 
		"						<td>Whse Location</td>\r\n" + 
		"						<td>Inbound Charge</td>\r\n" + 
		"						<td>Storage Period(Month)</td>\r\n" + 
		"						<td>Storage Cost</td>\r\n" + 
		"						<td>Outbound Charge</td>\r\n" + 
		"						<td>Whse Handling Charge %</td>\r\n" + 
		"						<td>Pallet Cost</td>\r\n" + 
		"						<td>Freight to customer</td>\r\n" + 
		"						<td>Landed Cost</td>\r\n" + 
		"						<td>Program%</td>\r\n" + 
		"						<td>Payment Term%</td>\r\n" + 
		"						<td>Store Defective Allowance%</td>\r\n" + 
		"						<td>Price Quote</td>\r\n" + 
		"						<td>Total Store Cost</td>\r\n" + 
		"						<td>MSRP(Retail Price)</td>\r\n" + 
		"						<td>Markup %</td><!-- 32�� -->\r\n" + 
		"					</tr>\r\n" + 
		"				</table>\r\n" + 
		"			</div>\r\n" + 
		"		</div>\r\n" + 
		"		<div id=\"right_div2\">\r\n" + 
		"			<table id=\"right_table2\">\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td><div contenteditable=\"true\" id='estimitfCost'>"+estimitfCost+"</div></td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"				<tr>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"					<td>1</td>\r\n" + 
		"				</tr>\r\n" + 
		"			</table>\r\n" + 
		"		</div>\r\n" + 
		"	</div>\r\n" + 
		"	<script type=\"text/javascript\">\r\n" + 
		"		var right_div2 = document.getElementById(\"right_div2\");\r\n" + 
		"		right_div2.onscroll = function() {\r\n" + 
		"			var right_div2_top = this.scrollTop;\r\n" + 
		"			var right_div2_left = this.scrollLeft;\r\n" + 
		"			document.getElementById(\"left_div2\").scrollTop = right_div2_top;\r\n" + 
		"			document.getElementById(\"right_div1\").scrollLeft = right_div2_left;\r\n" + 
		"		}\r\n" + 
		"	</script>\r\n" + 
		"</body>\r\n" + 
		"</html>";
		return html;
	}
	return {
		onRequest : onRequest
	};
});