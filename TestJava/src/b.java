
public class b {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		String a= "<!DOCTYPE html >\r\n" + 
				"<html >\r\n" + 
				"<head>\r\n" + 
				"<meta charset=\"utf-8\" />\r\n" + 
				"<title>�ɱ༭���</title>\r\n" + 
				"<script>\r\n" + 
				"function addRow(){\r\n" + 
				"    var oTable = document.getElementById(\"oTable\");\r\n" + 
				"    var tBodies = oTable.tBodies;\r\n" + 
				"    var tbody = tBodies[0];\r\n" + 
				"    var tr = tbody.insertRow(tbody.rows.length);\r\n" + 
				"    var td_1 = tr.insertCell(0);\r\n" + 
				"    td_1.innerHTML = \"<div contenteditable='true'>��1��</div>\";\r\n" + 
				"    var td_2 = tr.insertCell(1);\r\n" + 
				"    td_2.innerHTML = \"<div contenteditable='true'>��2��</div>\";\r\n" + 
				"    }\r\n" + 
				"\r\n" + 
				"</script>\r\n" + 
				"</head>\r\n" + 
				"<body>\r\n" + 
				"<fieldset>\r\n" + 
				"<legend>�ɱ༭�ı��</legend>\r\n" + 
				"<table id=\"oTable\" style=\"background-color:#eeeeee;\" bordercolor=\"#aaaaaa\" border=\"1\" cellpadding=\"0\" cellpadding=\"2\" width=\"100%\">\r\n" + 
				"<thead>\r\n" + 
				"<tr>\r\n" + 
				"<th>��һ�б���</th>\r\n" + 
				"<th>�ڶ��б���</th>\r\n" + 
				"</tr>\r\n" + 
				"</thead>\r\n" + 
				"<tbody>\r\n" + 
				"<tr>\r\n" + 
				"<td><div contenteditable=\"true\">��һ�е�һ��</div></td>\r\n" + 
				"<td><div contenteditable=\"true\">��һ�еڶ���</div></td>\r\n" + 
				"</tr>\r\n" + 
				"</tbody>\r\n" + 
				"</table>\r\n" + 
				"</fieldset>\r\n" + 
				"<input type=\"button\" onClick=\"addRow();\" style=\"font-size:16px;\" value=\"+\"/>\r\n" + 
				"</body>\r\n" + 
				"</html>";
	}

}
