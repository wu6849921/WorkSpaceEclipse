<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<#escape x as x?html>
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
				height: 30px;
				font-size: 8pt;
			}
			
			table.body td {
				padding-top: 2px;
			}
        </style>
        <macrolist>
            <macro id="abtlFooter">
                <table style="width: 100%; margin-top: 10px;" border="0">
                    <tr style="width: 100%">
                        <td style="width: 33%"><p align="left">${data.printBy.name}${data.printBy.value}</p></td>
                        <td style="width: 33%"><p align="center">${data.printTime.name}${data.printTime.value}</p></td>
                        <td style="width: 33%"><p align="right">${data.page.name}<pagenumber/> / <totalpages/></p></td>
                    </tr>
                </table>
            </macro>
        </macrolist>
    </head>
    <#function makesure value>
        <#if !value??><#return false></#if>
        <#if !value?has_content><#return false></#if>
        <#if value == ''><#return false></#if>
        <#return true>
    </#function>
    <body footer="abtlFooter" size="A4-landscape">		
	    <table id="atblstatement_header" class="header" style="width: 100%;">
		    <tr>
				<td width="100%" colspan="9" align="center" style="font-size: 20pt;"><b>${data.title}</b></td>
			</tr>
            <tr>
                <td colspan="3" align="left"><b>${data.subsidiary.name}</b>${data.subsidiary.value}</td>
                <td colspan="3" align="center" style="margin-left:20px">&nbsp;${data.date.from.value}&nbsp;-&nbsp;${data.date.to.value}</td>
                <td colspan="3" align="right" style="margin-left:60px"><b>${data.currency.name}</b>${data.currency.value}</td>
            </tr>
            <#if makesure(data.location.value) || makesure(data.department.value) || makesure(data.clasz.value)>
                <tr>
                    <td colspan="3" align="left">
                        <#if makesure(data.location.value)>
                            <b>${data.location.name}</b>${data.location.value}
                        <#elseif makesure(data.department.value)>
                            <b>${data.department.name}</b>${data.department.value}
                        <#else>
                            <b>${data.clasz.name}</b>${data.clasz.value}
                        </#if>
                    </td>
                    <td colspan="3" align="center" style="margin-left:20px">
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
                    <td colspan="3" align="right" style="margin-left:60px">
                        <#if makesure(data.location.value) && makesure(data.department.value) && makesure(data.clasz.value)>
                            <b>${data.clasz.name}</b>${data.clasz.value}
                        </#if>
                    </td>
                </tr>
            </#if>
        </table>
		<table id="atblstatement_data" class="itemtable" style="width: 100%; margin-top: 10px;" cellspacing="0" cellpadding="4">
            <thead>
                <tr style="height: 25px;">
                    <th width="25%" align="center" rowspan="2" style="vertical-align: middle;" bgcolor="#999999">${data.body.columnAccountName}</th>
                    <th width="25%" align="center" colspan='2' style="vertical-align: middle;" bgcolor="#999999">${data.body.columnOpeningBalanceName} </th>
                    <th width="25%" align="center" colspan='2' style="vertical-align: middle;" bgcolor="#999999">${data.body.columnCurrentPeriodName}</th>
                    <th width="25%" align="center" colspan='2' style="vertical-align: middle;" bgcolor="#999999">${data.body.columnClosingBalanceName}</th>
                </tr>
                <tr style="height: 25px;">
                    <th align="center" style="text-align: center;" bgcolor="#999999">${data.body.columnDirectionName}</th>
                    <th align="center" style="text-align: center;" bgcolor="#999999">${data.body.columnAmountName}</th>
                    <th align="center" style="text-align: center;" bgcolor="#999999">${data.body.columnDebitName}</th>
                    <th align="center" style="text-align: center;" bgcolor="#999999">${data.body.columnCreditName}</th>
                    <th align="center" style="text-align: center;" bgcolor="#999999">${data.body.columnDirectionName}</th>
                    <th align="center" style="text-align: center;" bgcolor="#999999">${data.body.columnAmountName}</th>
                </tr>
            </thead>   
			<#list data.body.rows as line>
			    <tr>
                    <td align="left" style="word-wrap:break-word; vertical-align: middle;">${line.account.name}</td>
                    <td align="left" style="vertical-align: middle;">${line.openingBalance.direction}</td>
                    <td align="right" style="vertical-align: middle;">${line.openingBalance.amount}</td>
                    <td align="right" style="vertical-align: middle;">${line.currentPeriod.debit}</td>
                    <td align="right" style="vertical-align: middle;">${line.currentPeriod.credit}</td>
                    <td align="left" style="vertical-align: middle;">${line.closingBalance.direction}</td>
                    <td align="right" style="vertical-align: middle;">${line.closingBalance.amount}</td>
                </tr>
			</#list>
        </table>
    </body>
</pdf>
</#escape>