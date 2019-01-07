<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Income Statement</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>
		<style type="text/css">
table {
            <#if .locale == "zh_CN">
                font-family: STSong, sans-serif;
            <#elseif .locale == "en_US">
                font-family: Arial, sans-serif;;
            <#else>
                font-family: Arial, sans-serif;
            </#if>
	font-size: 10pt;
	table-layout: fixed;
	border-collapse: collapse;
}

table.header td {
	font-size: 10pt;
}

table.itemtable th {
	padding-bottom: 10px;
	padding-top: 10px;
	background-color: #999999;
	border-top: thin solid #000;
	border-left: thin solid #000;
	font-weight: bold;
}

table.itemtable td.shadow {
	background-color: #D1D1D1;
}

table.itemtable {
	border-right: thin solid #000;
	border-bottom: thin solid #000;
}

table.itemtable td {
	border-left: thin solid #000;
	border-top: thin solid #000;
	height: 25px;
}

table.body td {
	padding-top: 2px;
}
</style>
		<!-- The income statement report will only take 65% of the screen width, and will not impact the exported PDF report width -->
		<table width="65%">
			<tr>
				<td>
					<table id="incomestatement_header" class="header"
						style="width: 100%;">
						<tr>
							<td width="100%" colspan="8" align="center"
								style="font-size: 20pt; padding-top: 20px;"><b>${data.title}</b></td>
						</tr>
						<tr>
							<td width="100%" colspan="8" align="right"
								style="font-size: 8pt;">${data.category}</td>
						</tr>
						<tr>
							<td colspan="3" align="left"><b>${data.preparedby.name} </b>${data.preparedby.value}</td>
							<td colspan="2" align="center">&nbsp;${data.period.value}</td>
							<td colspan="3" align="right"><b>${data.unit.name} </b>${data.unit.value}</td>
						</tr>
					<#if data.location.value != '' || data.department.value != '' || data.clasz.value != ''>
                        <tr>
                        	<td colspan="3" align="left"> 
                        		<#if data.location.value!= ''>
                        			<b>${data.location.name} </b>${data.location.value}
                        		<#elseif data.department.value!= ''>
                        			<b>${data.department.name} </b>${data.department.value}
                        		<#else>
                        			<b>${data.clasz.name} </b>${data.clasz.value}
                        		</#if>
                        	</td>
                            <td colspan="2" align="center">
                        		<#if data.location.value!= ''>
                        			<#if data.department.value!= ''>
                        				<b>${data.department.name} </b>${data.department.value}
                        			<#elseif data.clasz.value!= ''>
                        				<b>${data.clasz.name} </b>${data.clasz.value}
                        			</#if>
                        		<#else>
                        			<#if data.department.value!= '' && data.clasz.value!= ''>
                        				<b>${data.clasz.name} </b>${data.clasz.value}
                        			</#if>
                        		</#if>
                            </td>
                            <td colspan="3" align="right">
                            	<#if data.location.value!= '' && data.department.value!= '' && data.clasz.value!= ''>
                        			<b>${data.clasz.name} </b>${data.clasz.value}
                        		</#if>
                            </td>
                        </tr>
                     </#if>
					</table>
				</td>
			</tr>
			<tr>
				<td>
					<table id="incomestatement_data" class="itemtable"
						style="width: 100%; margin-top: 10px;" cellspacing="0"
						cellpadding="6">
						<tr style="height: 25px;">
							<th width="55%" align="center" colspan="5"
								style="text-align: center;" bgcolor="#999999">${data.body.columnItemsName}</th>
							<th width="7%" align="center" style="text-align: center;"
								bgcolor="#999999">${data.body.columnLinesName}</th>
							<th width="19%" align="center" style="text-align: center;"
								bgcolor="#999999">${data.body.columnName0}</th>
							<th width="19%" align="center" style="text-align: center;"
								bgcolor="#999999">${data.body.columnName1}</th>
						</tr>
					<#list data.body.rows as line>
						<tr>
							<td align="left" colspan="5">
								&nbsp;&nbsp;  ${data.body.rows[line_index?number].rowName}</td>
							<td align="center">${line_index?number + 1}</td>
							<td align="right">${data.body.rows[line_index?number].value0}</td>
							<td align="right">${data.body.rows[line_index?number].value1}</td>
						</tr>
					</#list>
					</table>
				</td>
			</tr>
		</table>
</body>
</html>