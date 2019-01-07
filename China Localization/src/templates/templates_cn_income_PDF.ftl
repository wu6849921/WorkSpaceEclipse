<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
    <head>
        <style type="text/css">
            table {
            <#if .locale == "zh_CN">
                font-family: STSong, sans-serif;
            <#else>
                font-family: Arial, sans-serif, STSong;
            </#if>
				font-size: 9pt;
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
    </head>
    <body>
		<table style="width: 100%">
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
							<td colspan="2" align="center">${data.period.value}</td>
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
</pdf>