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
                vertical-align: middle;
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
                border-bottom: thin solid #000;
            }

            table.itemtable td {
                border-left: thin solid #000;
                border-top: thin solid #000;
                height: 32px;
                font-size: 8pt;
            }

            table.body td {
                padding-top: 2px;
            }
        </style>
        <#function makesure value>
            <#if !value??><#return false></#if>
            <#if !value?has_content><#return false></#if>
            <#if value == ''><#return false></#if>
            <#return true>
        </#function>
        <macrolist>
            <macro id="sblgFooter">
                <table style="width: 100%; margin-top: 10px;" border="0">
                    <tr style="width: 100%">
                        <td style="width: 33%"><p align="left">${data.printBy.name}${data.printBy.value}</p></td>
                        <td style="width: 33%"><p align="center">${data.printTime.name}${data.printTime.value}</p></td>
                        <td style="width: 33%"><p align="right">${data.page.name}<pagenumber/> / <totalpages/></p></td>
                    </tr>
                </table>
            </macro>
        </macrolist>
        <#function trancate string number>
            <#if string??>
                 <#if string?length lte number>
                     <#return string>
                 <#else>
                     <#return string?substring(0,number)>
                 </#if>
            </#if>
        </#function>
    </head>
    <body size="A4-landscape" footer ="sblgFooter">
    <#list data.body.pages as pages>
    <table id="sblgstatement_data"  class="itemtable" style="page-break-after:always; width: 100%; margin-top: 10px;bottom: 1cm" cellspacing="0" cellpadding="2">
        <thead >
        <tr style="height: 25px;border-right-style:none;" >
            <th width="100%" colspan="28" align="center" border = "0" style="font-size: 20pt;border-right-style:none;vertical-align: middle;background-color:#FFFFFF;">
                ${data.title}
            </th>
        </tr>
        <tr style="font-size: 10pt;margin-top: 10px;border-right-style:none;">
            <th colspan="12"  align="left" border="0" style="border-right-style:none;vertical-align: middle;background-color:#FFFFFF;font-weight: normal;" ><b>${data.subsidiary.name}</b>${data.subsidiary.value}</th>
            <th colspan="7"  align="left" border="0" style="background-color:#FFFFFF;font-weight: normal;">&nbsp;${data.date.from.value}&nbsp;-&nbsp;${data.date.to.value}</th>
            <th colspan="9"  align="right" border="0" style="margin-left:60px;background-color:#FFFFFF;font-weight: normal;"><b>${data.currency.name}</b>${data.currency.value}</th>
        </tr>

        <tr style="border-right-style:none ;font-size: 10pt;">
            <th width="100%" colspan = "12"  align="left"
                style="border-right-style:none;vertical-align: middle;background-color:#FFFFFF;font-weight: normal;" border="0" ><b>${data.account.name}</b>${pages.account}
            </th>
            <#if makesure(data.location.value ) || makesure(data.department.value ) || makesure(data.clasz.value )>
                <th colspan="7" align="left" style="border-style:none;vertical-align: middle;background-color:#FFFFFF;font-weight: normal;">
                        		<#if makesure(data.location.value)>
                                    <b>${data.location.name}</b>${data.location.value}
                                <#elseif makesure(data.department.value)>
                        			<b>${data.department.name}</b>${data.department.value}
                                <#else>
                        			<b>${data.clasz.name}</b>${data.clasz.value}
                                </#if>
                </th>
                <th colspan="9" align="right" style="border-style:none;vertical-align: middle;background-color:#FFFFFF;font-weight: normal;">
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
                </th>



            </#if>
            </tr>

            <#if makesure(data.location.value) && makesure(data.department.value) && makesure(data.clasz.value)>
                 <tr style="font-size: 10pt;border-style:none;">
                     <th colspan="28" align="left" style="border-style:none;vertical-align: middle;background-color:#FFFFFF;font-weight: normal;">
                         <b>${data.clasz.name}</b>${data.clasz.value}
                     </th>
                 </tr>
            </#if>

        <tr style="height: 25px;">
            <th align="center" rowspan="2" colspan="3" style="vertical-align: middle;" bgcolor="#999999" >${data.body.columnTypeName}</th>
            <th align="center" rowspan="2" colspan="2" style="vertical-align: middle;" bgcolor="#999999">${data.body.columnDocumentNumberName}</th>
            <th align="center" rowspan="2" colspan="3" style="vertical-align: middle;" bgcolor="#999999">${data.body.columnGLNumberName}</th>
            <th align="center" rowspan="2" colspan="2" style="vertical-align: middle;" bgcolor="#999999">${data.body.columnDateName}</th>
            <th align="center" rowspan="2" colspan="6" style="vertical-align: middle;" bgcolor="#999999">${data.body.columnMemoName}</th>
            <th align="center" rowspan="2" colspan="3" style="vertical-align: middle;" bgcolor="#999999">${data.body.columnDebitName}</th>
            <th align="center" rowspan="2" colspan="3" style="vertical-align: middle;" bgcolor="#999999">${data.body.columnCreditName}</th>
            <th align="center" colspan="6" style="vertical-align: middle;border-right: thin solid #000;" bgcolor="#999999">${data.body.columnBalanceName}</th>
        </tr>
        <tr style="height: 25px;">
            <th align="center" colspan="3" style="vertical-align: middle" bgcolor="#999999">${data.body.columnDirectionName}</th>
            <th align="center" colspan="3" style="text-align: center;vertical-align: middle;border-right: thin solid #000;" bgcolor="#999999">${data.body.columnAmountName}</th>
        </tr>
        </thead>
           <#list pages.rows as line>
			    <tr>
                    <#assign istotal = makesure(line.istotal)>
                    <td align="left" colspan="3" style="vertical-align: middle;"><#if istotal><b>${line.type}</b><#else>${line.type}</#if></td>
                    <td align="left" colspan="2" style="vertical-align: middle;"><#if istotal><b>${line.documentNumber}</b><#else>${line.documentNumber}</#if></td>
                    <td align="left" colspan="3" style="vertical-align: middle;"><#if istotal><b>${line.glNumber}</b><#else>${line.glNumber}</#if></td>
                    <td align="left" colspan="2" style="vertical-align: middle;"><#if istotal><b>${line.date}</b><#else>${line.date}</#if></td>
                    <td align="left" colspan="6" style="vertical-align: middle;padding-top:0px;"><#if istotal><b>${trancate(line.memo,38)}</b><#else>${trancate(line.memo,38)}</#if></td>
                    <td align="right" colspan="3" style="vertical-align: middle;"><#if istotal><b>${line.debit}</b><#else>${line.debit}</#if></td>
                    <td align="right" colspan="3" style="vertical-align: middle;"><#if istotal><b>${line.credit}</b><#else>${line.credit}</#if></td>
                    <td align="left" colspan="3" style="vertical-align: middle;"><#if istotal><b>${line.balance.direction}</b><#else>${line.balance.direction}</#if></td>
                    <td align="right" colspan="3" style="vertical-align: middle;border-right: thin solid #000;"><#if istotal><b>${line.balance.amount}</b><#else>${line.balance.amount}</#if></td>
                </tr>
           </#list>
    </table>
    </#list>
    </body>
</pdf>
</#escape>