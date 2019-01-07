<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta name=ProgId content=Excel.Sheet>
	<meta name=Generator content="Microsoft Excel 11">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<!--[if gte mso 9]>
	<xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
		<x:Name>Account Balance</x:Name>
		<x:WorksheetOptions><x:DisplayGridlines/>
		</x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
	</xml><![endif]-->
</head>
<body>
<table><style type="text/css">
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
<#function makesure value>
    <#if !value??><#return false></#if>
    <#if !value?has_content><#return false></#if>
	<#if value == ''><#return false></#if>
	<#return true>
</#function>
</style>
		<!-- The atbl statement report will only take 65% of the screen width, and will not impact the exported PDF report width -->
		<table width="100%">
			<tr>
				<td>
					<table id="atblstatement_header" class="header"
						style="width: 100%;">
						<tr>
							<td width="100%" colspan="7" align="center"
								style="font-size: 20pt; padding-top: 20px;"><b>${data.title}</b></td>
						</tr>
                        <tr>
                            <td colspan="2" align="left"><b>${data.subsidiary.name}</b>${data.subsidiary.value}</td>
                            <td colspan="3" align="center">${data.date.from.value}&nbsp;-&nbsp;${data.date.to.value}</td>
                            <td colspan="2" align="right"><b>${data.currency.name}</b>${data.currency.value}</td>
                        </tr>
					<#if makesure(data.location.value) || makesure(data.department.value) || makesure(data.clasz.value)>
                        <tr>
                            <td colspan="2" align="left">
								<#if makesure(data.location.value)>
                                    <b>${data.location.name}</b>${data.location.value}
								<#elseif makesure(data.department.value)>
                                    <b>${data.department.name}</b>${data.department.value}
								<#else>
                                    <b>${data.clasz.name}</b>${data.clasz.value}
								</#if>
                            </td>
                            <td colspan="3" align="center">
								<#if makesure(data.location.value)>
									<#if makesure(data.department.value)>
                                        <b>${data.department.name}</b>${data.department.value}
									<#elseif makesure(data.clasz.value)>
                                        <b>${data.clasz.name}</b>${data.clasz.value}
									</#if>
								<#else>
									<#if makesure(data.department.value) && makesure(data.clasz.value)>
                                        <b>${data.clasz.name}</b>${data.clasz.value}
									</#if>
								</#if>
                            </td>
                            <td colspan="2" align="right">
								<#if makesure(data.location.value) && makesure(data.department.value) && makesure(data.clasz.value)>
                                    <b>${data.clasz.name}</b>${data.clasz.value}
								</#if>
                            </td>
                        </tr>
					</#if>
					</table>
				</td>
			</tr>
			<tr>
				<td>
					<table id="atblstatement_data" class="itemtable"
						style="width: 100%; margin-top: 10px;" cellspacing="0"
						cellpadding="6">
						<tr style="height: 25px;">
							<th width="25%" align="center" rowspan="2"
								style="text-align: center;" bgcolor="#999999">${data.body.columnAccountName}</th>
							<th width="25%" align="center" colspan='2' style="text-align: center;"
								bgcolor="#999999">${data.body.columnOpeningBalanceName} </th>
							<th width="25%" align="center" colspan='2' style="text-align: center;"
								bgcolor="#999999">${data.body.columnCurrentPeriodName}</th>
							<th width="25%" align="center" colspan='2' style="text-align: center;"
								bgcolor="#999999">${data.body.columnClosingBalanceName}</th>
						</tr>
                        <tr style="height: 25px;">
                            <th align="center" style="text-align: center;" bgcolor="#999999">${data.body.columnDirectionName}</th>
                            <th align="center"  style="text-align: center;" bgcolor="#999999">${data.body.columnAmountName}</th>
                            <th align="center"  style="text-align: center;" bgcolor="#999999">${data.body.columnDebitName}</th>
                            <th align="center"  style="text-align: center;" bgcolor="#999999">${data.body.columnCreditName}</th>
                            <th align="center"  style="text-align: center;" bgcolor="#999999">${data.body.columnDirectionName}</th>
                            <th align="center"  style="text-align: center;" bgcolor="#999999">${data.body.columnAmountName}</th>
                        </tr>
					<#list data.body.rows as line>
						<tr>
                            <td align="left">${data.body.rows[line_index?number].account.name}</td>
                            <td align="left">${data.body.rows[line_index?number].openingBalance.direction}</td>
                            <td align="right">${data.body.rows[line_index?number].openingBalance.amount}</td>
                            <td align="right">${data.body.rows[line_index?number].currentPeriod.debit}</td>
                            <td align="right">${data.body.rows[line_index?number].currentPeriod.credit}</td>
                            <td align="left">${data.body.rows[line_index?number].closingBalance.direction}</td>
                            <td align="right">${data.body.rows[line_index?number].closingBalance.amount}</td>
						</tr>
					</#list>
					</table>
				</td>
			</tr>
		</table>
</body>
</html>