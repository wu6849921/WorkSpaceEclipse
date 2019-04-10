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
				var html = "<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">\r\n"
						+ "<html>\r\n"
						+ "<head>\r\n"
						+ "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\r\n"
						+ "<title>css+htmlʵ�̶ֹ���ͷ</title>\r\n"
						+ "<style type=\"text/css\">\r\n"
						+ "#scrollTable {\r\n"
						+ "	width: 100%;\r\n"
//						+ "	border: 1px solid #EB8; /*tableû����Χ��border��ֻ���ڲ���td��th��border*/\r\n"
						//+ "	background: #FF8C00;\r\n"
						+ "}\r\n"
						+ "#scrollTable table {\r\n"
						+ "	border-collapse: collapse; /*ͳһ��������tableΪϸ�߱���*/\r\n"
						+ "}\r\n"
						+ "/*��ͷ div�ĵ�һ����Ԫ��**/\r\n"
						+ "#scrollTable table.thead {\r\n"
						+ "	width: 100%;\r\n"
						+ "}\r\n"
						+ "/*��ͷ*/\r\n"
						+ "#scrollTable table.thead th {\r\n"
						+ "	border: 1px solid;\r\n"
//						+ "	border: 1px solid #EB8;\r\n"
//						+ "	border-right: #C96;\r\n"
//						+ "	color: #666666;\r\n"
						+ "	background: grey; /*��ɫ*/\r\n"
						+ "}\r\n"
						+ "/*�ܴ��������ı���*/\r\n"
						+ "/*div�ĵڶ�����Ԫ��*/\r\n"
						+ "#scrollTable div {\r\n"
						+ "	width: 100%;\r\n"
						+ "	height: 300px;\r\n"
						+ "	overflow: auto; /*����*/\r\n"
//						+ "	scrollbar-face-color: #EB8; /*������С���εı���ɫ*/\r\n"
//						+ "	scrollbar-base-color: #ece9d8; /*������С���ε�ǰ��ɫ*/\r\n"
//						+ "	scrollbar-arrow-color: #FF8C00; /*���°�ť�����Ǽ�ͷ����ɫ*/\r\n"
//						+ "	scrollbar-track-color: #ece9d8; /*���������Ǹ�������ڵľ��εı���ɫ*/\r\n"
//						+ "	scrollbar-highlight-color: #800040; /*������С��������padding����ɫ*/\r\n"
//						+ "	scrollbar-shadow-color: #800040; /*������С��������padding����ɫ*/\r\n"
//						+ "	scrollbar-3dlight-color: #EB8; /*������С��������border����ɫ*/\r\n"
//						+ "	scrollbar-darkshadow-Color: #EB8; /*������С��������border����ɫ*/\r\n"
						+ "}\r\n"
						+ "/*�ܴ��������ı���������*/\r\n"
						+ "#scrollTable table.tbody {\r\n"
						+ "	width: 100%;\r\n"
						+ "	border: 1px solid;\r\n"
//						+ "	border: 1px solid #C96;\r\n"
//						+ "	border-right: #B74;\r\n"
//						+ "	color: #666666;\r\n"
//						+ "	background: #ECE9D8;\r\n"
						+ "}\r\n"
						+ "/*�ܴ��������ı����ĸ���*/\r\n"
						+ "#scrollTable table.tbody td {\r\n"
						+ "	border: 1px solid;\r\n"
//						+ "	border: 1px solid #C96;\r\n"
						+ "}\r\n"
						+ "</style>\r\n"
						+ "</head>\r\n"
						+ "<body>\r\n"
						+ "	<div id=\"scrollTable\">\r\n"
						+ "		<table class=\"thead\">\r\n"
						+ "			<col width=\"170px\"></col>\r\n"
						+ "			<col width=\"170px\"></col>\r\n"
						+ "			<col width=\"170px\"></col>\r\n"
						+ "			<col></col>\r\n"
						+ "			<tbody>\r\n"
						+ "				<tr>\r\n"
						+ "					<th>����</th>\r\n"
						+ "					<th>�﷨</th>\r\n"
						+ "					<th>˵��</th>\r\n"
						+ "					<th>����</th>\r\n"
						+ "				</tr>\r\n"
						+ "			</tbody>\r\n"
						+ "		</table>\r\n"
						+ "		<div>\r\n"
						+ "			<table class=\"tbody\">\r\n"
						+ "				<col width=\"170px\"></col>\r\n"
						+ "				<col width=\"170px\"></col>\r\n"
						+ "				<col width=\"170px\"></col>\r\n"
						+ "				<col></col>\r\n"
						+ "				<tbody>\r\n"
						+ "					<tr>\r\n"
						+ "						<td><div id='1' contenteditable=\"true\" style = 'height:100%'>����һ�οɱ༭�Ķ��䡣�����ű༭����</div></td>\r\n"
						+ "						<td><div contenteditable=\"true\" style = 'height:100%'>����һ�οɱ༭�Ķ��䡣�����ű༭����</div></td>\r\n"
						+ "						<td><div contenteditable=\"true\" style = 'height:100%'>����һ�οɱ༭�Ķ��䡣�����ű༭����</div></td>\r\n"
						+ "						<td><div contenteditable=\"true\" style = 'height:100%'>����һ�οɱ༭�Ķ��䡣�����ű༭����</div></td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "					<tr>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "						<td>1</td>\r\n"
						+ "					</tr>\r\n"
						+ "				</tbody>\r\n"
						+ "			</table>\r\n"
						+ "		</div>\r\n"
						+ "	</div>\r\n"
						+ "</body>\r\n"
						+ "</html>\r\n" + "";
				return html;
			}
			return {
				onRequest : onRequest
			};
		});