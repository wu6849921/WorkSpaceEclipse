/**
 * Script Description
 * This script is used to scan the Order from Open orders list.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan order from open orders list
 */
function PickReversal(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var userAccountId = ctx.getCompany();
		var st0,st1,st2,st3,st4,st5;
		var domainName = fndomainName();
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whlocation = request.getParameter('custparam_whlocation');

		//Fetching InventoryStatus feature is enabled or disabled
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-Pick Reversal";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			var headerVar='Pick Reversal';


			st0 = domainName + "-Pick Reversal";
			st1 = "Transaction #:";
			st2 = "Item:";
			st3 = "Picked Qty:";
			st4 = "Bin Location:";
			st5 = "Inv Status:"

		}	


		//var orderno = request.getParameter('custparam_so');
		var id = request.getParameter('custparam_id');
		var pickreportno = request.getParameter('custparam_pickreportno');
			
		var SORecinternalids=new Array();
		var objSORecinternalids = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_rf_pickreversal');
				
		if(id != null && id != 'null' && id != '' && id !='undefined')
		{
			nlapiLogExecution('DEBUG', 'id', id);
			objSORecinternalids.addFilter(new nlobjSearchFilter('internalid',null,'anyof',id));
		}

		objSORecinternalids.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
		objSORecinternalids.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8','28']));
		objSORecinternalids.addFilter(new nlobjSearchFilter('type','custrecord_wmsse_sku','noneof',['Kit']));
		objSORecinternalids.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));

		var resLenDetails = objSORecinternalids.runSearch();
		
		
		var resultsPage = resLenDetails.getResults(0, 1000);
		var offset = 0;
		while (!!resultsPage && resultsPage.length > 0) 
		{
			SORecinternalids = SORecinternalids.concat(resultsPage);
			offset += 1000;
			resultsPage = resLenDetails.getResults(offset, offset + 1000);
		}
		var getSOItem = '';
		var pickedQty='';
		var getSOBin = '';
		var orderno = '';
		var ordIntrId= '' ;
		var ordLineNo = '' ;
		var actLoc = '' ;
		var tasktype= '' ;
		var nsconfirmationno='';
		var parentskuno = '';
		var batchno ='';
		var serials= '';
		var itemId ='';
		var vBinTrIntId ='';
		var contLp = '';
		var componentactqty = '';
		var beginloc = '';
		var uom = '';
		//var Status ='';
		var StatusId = '';
		var getSOStatus = '';
		if(SORecinternalids != null && SORecinternalids != 'null' && SORecinternalids != '' && SORecinternalids != 'undefined')
		{
			getSOItem = SORecinternalids[0].getText('custrecord_wmsse_sku');
			pickedQty= SORecinternalids[0].getValue('custrecord_wmsse_act_qty');
			getSOBin = SORecinternalids[0].getText('custrecord_wmsse_actendloc');
			orderno = SORecinternalids[0].getValue('tranid','custrecord_wmsse_order_no');
			ordIntrId = SORecinternalids[0].getValue('custrecord_wmsse_order_no');
			ordLineNo = SORecinternalids[0].getValue('custrecord_wmsse_line_no');
			actLoc = SORecinternalids[0].getValue('custrecord_wmsse_actendloc');
			tasktype = SORecinternalids[0].getValue('custrecord_wmsse_tasktype');
			nsconfirmationno = SORecinternalids[0].getValue('custrecord_wmsse_nsconfirm_ref_no');
			parentskuno = SORecinternalids[0].getValue('custrecord_wmsse_parent_sku_no');
			batchno = SORecinternalids[0].getValue('custrecord_wmsse_batch_num');
			serials = SORecinternalids[0].getValue('custrecord_wmsse_serial_no');
			itemId = SORecinternalids[0].getValue('custrecord_wmsse_sku');
			vBinTrIntId = SORecinternalids[0].getValue('custrecord_wmsse_nstrn_ref_no');
			contLp = SORecinternalids[0].getValue('custrecord_wmsse_container_lp_no');
			componentactqty=SORecinternalids[0].getValue('custrecord_wmsse_compitm_actqty');
			uom = SORecinternalids[0].getValue('custrecord_wmsse_uom');
						
			var logMsg1 = 'batchno =' + batchno + '<br>';
			logMsg1 = logMsg1 + 'uom = ' + uom + '<br>';
			nlapiLogExecution('DEBUG', 'parameters of get', logMsg1);
			
			if(inventoryStatusFeature == true)
			{
				getSOStatus = SORecinternalids[0].getText('custrecord_wmsse_inventorystatus');
				nlapiLogExecution('DEBUG', 'getSOStatus', getSOStatus);
				StatusId = SORecinternalids[0].getValue('custrecord_wmsse_inventorystatus');
			}	

			if(uom == '' || uom == 'null' || uom == 'undefined' || uom == null || uom == undefined)
			{
				uom = '';
			}

			beginloc=SORecinternalids[0].getValue('custrecord_wmsse_actbeginloc');
			if((pickedQty=='' || pickedQty==null) && componentactqty!=null && componentactqty!='' )				
				pickedQty=componentactqty;

		}
		nlapiLogExecution('DEBUG', 'beginlocbeginlocbeginloc', beginloc);
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
	
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_Fulfillment');
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterorder').value == '' && document.getElementById('enterpickreport').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan  order/pick report#';return false;}else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr><tr><td></td></tr><tr><td></td></tr></table>"+


		/*"		<tr><td>"+
		"		<table>"+*/
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+st1+" " + orderno+

		"				</td>"+

		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+st2+" " + getSOItem+

		"				</td>"+

		"			</tr>";
		if(inventoryStatusFeature == true)
		{
			html = html +"				<tr>"+
			"				<td align = 'left' class='labelmsg'>"+st5+" " + getSOStatus+

			"				</td>"+

			"			</tr>";
		}

		html = html +"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+st4+" " + getSOBin+

		"				</td>"+

		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+st3+" " + parseFloat(parseFloat(pickedQty).toFixed(5))+" "+uom+

		"				</td>"+

		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whlocation + ">"+	
		"				<input type='hidden' name='hdnorderno' value='" + ordIntrId + "'>"+
		"				<input type='hidden' name='hdnpickreportNo' value=" + pickreportno + ">"+	
		"				<input type='hidden' name='hdnordLineNo' value=" + ordLineNo + ">"+	
		"				<input type='hidden' name='hdnactLoc' value=" + actLoc + ">"+	
		"				<input type='hidden' name='hdnnsconfirmationno' value=" + nsconfirmationno + ">"+	
		"				<input type='hidden' name='hdnparentskuno' value=" + parentskuno + ">"+	
		"				<input type='hidden' name='hdnbatchno' value=" + batchno + ">"+	
		"				<input type='hidden' name='hdnserials' value=" + serials + ">"+	
		"				<input type='hidden' name='hdnpickedQty' value=" + pickedQty + ">"+	
		"				<input type='hidden' name='hdnitemId' value=" + itemId + ">"+	
		"				<input type='hidden' name='hdnid' value='" + id + "'>"+
		"				<input type='hidden' name='hdnsonmuber' value='" + orderno + "'>"+
		"				<input type='hidden' name='hdnbeginloc' value='" + beginloc + "'>"+
		"				<input type='hidden' name='hdnbintransferid' value='" + vBinTrIntId + "'>"+
		"				<input type='hidden' name='hdncontlp' value='" + contLp + "'>"+
		"				<input type='hidden' name='hdnStatusId' value='" + StatusId + "'>"+
		"				</td>"+
		"			</tr>"+

		"			<tr>	<td align = 'left'><input name='cmdSend1'  class='defaultlink' id='cmdSend1'   type='submit' value='' /></td>"+
		"			</tr></table>"+
		"		<table>	<tr>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Revert (Ent)' /></td>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSkip' type='submit' value='Skip' /></td>"+
		"			</tr>"+ 
		"		 </table>"+
		"	</form>"+
		"<script type='text/javascript'>document.getElementById('cmdSend1').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		

		var SOarray=new Array();
		var pickreportNo = request.getParameter('hdnpickreportNo');
		var orderNo = request.getParameter('hdnorderno');
		SOarray["custparam_so"] = orderNo;
		SOarray["custparam_pickreportno"] = pickreportNo;

		var logMsg1 = 'pickreportNo =' + pickreportNo + '<br>';
		logMsg1 = logMsg1 + 'orderNo = ' + orderNo + '<br>';
		nlapiLogExecution('DEBUG', 'parameters of post', logMsg1);

		var optedEvent = request.getParameter('cmdPrevious');
		var optedSkip = request.getParameter('cmdSkip');

		

		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

		var whlocation = request.getParameter('hdnWhLocation');
		var orderno = request.getParameter('hdnsonmuber');



		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			SOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_pickreversal_ord_scan', 'customdeploy_wmsse_pickreversal_ord_scan', false, SOarray);
		}
		else if (optedSkip == 'Skip'){
			var skipCount ='';
			if(request.getParameter('custparam_skipcount')==null || request.getParameter('custparam_skipcount')=='null' || request.getParameter('custparam_skipcount')=='' ||request.getParameter('custparam_skipcount')=='undefined')
			{
				SOarray['custparam_skipcount'] = 1;
				skipCount =1;
			}
			else
			{
				skipCount =request.getParameter('custparam_skipcount');
				skipCount = parseInt(skipCount)+1;
				SOarray['custparam_skipcount'] = skipCount;

			}

			var ordArr = new Array();
			if(pickreportNo != '' && pickreportNo != null && pickreportNo != 'null' && pickreportNo != 'undefined')
			{
				var result = funtoGetOrdersOfPickreportNo(pickreportNo,whlocation);

				if(result != null && result != '' && result != 'null' && result != 'undefined')
				{
					for(var k=0;k<result.length;k++)
					{
						ordArr.push(result[k].getValue('custrecord_wmsse_order_no'));
					}
				}
				else
				{

					SOarray["custparam_error"]="Please enter/scan valid pickreportno ";
					response.sendRedirect('SUITELET', 'customscript_wmsse_pickreversal_ord_scan', 'customdeploy_wmsse_pickreversal_ord_scan', false, SOarray);
					return false;
				}
			}
			ordArr.push(orderNo);

			var opentaskResults = funtoCheckSo(ordArr,whlocation);

			if(opentaskResults != null && opentaskResults != 'null' && opentaskResults != '' && opentaskResults.length > 0)
			{				
				var logMsg1 = 'opentaskResults.length =' + opentaskResults.length + '<br>';
				logMsg1 = logMsg1 + 'skipCount = ' + skipCount + '<br>';
				nlapiLogExecution('DEBUG', 'parameters of opentaskResults', logMsg1);
				
				if(opentaskResults.length > skipCount)
				{
					SOarray["custparam_id"] = opentaskResults[skipCount].getId();
				}
				else
				{
					SOarray["custparam_id"] =opentaskResults[0].getId();
				}
			}
			SOarray["custparam_error"]="";
			response.sendRedirect('SUITELET', 'customscript_wmsse_rf_pickreversal', 'customdeploy_wmsse_rf_pickreversal', false, SOarray);	
			return;
		}
		else
		{
			var ordlineno = request.getParameter('hdnordLineNo');
			var taskid = request.getParameter('hdnid');
			var taskqty = request.getParameter('hdnpickedQty');
			var itemid = request.getParameter('hdnitemId');
			var tasktype = 'Open';//request.getParameter('custparam_tasktype');
			var taskactloc = request.getParameter('hdnactLoc');
			var taskbeginloc = request.getParameter('hdnbeginloc');
			var status = '';
			var trantype = '';
			var nsrefno = request.getParameter('hdnnsconfirmationno');
			var lotno = request.getParameter('hdnbatchno');
			var serials = request.getParameter('hdnserials');
			var parentSku = request.getParameter('hdnparentskuno');
			var confirmation = request.getParameter('hdnCofirmation');
			var binTransferID = request.getParameter('hdnbintransferid');
			var vBinTrIntId = request.getParameter('hdnbintransferid');
			var contlp = request.getParameter('hdncontlp');
			var StatusId = request.getParameter('hdnStatusId');
			SOarray['custparam_ordlineno'] = ordlineno;
			SOarray['custparam_taskid'] = taskid;
			SOarray['custparam_taskqty'] = taskqty;
			SOarray['custparam_itemid'] = itemid;
			SOarray['custparam_taskactloc'] = taskactloc;
			SOarray['custparam_nsrefno'] = nsrefno;
			SOarray['custparam_lotno'] = lotno;
			SOarray['custparam_serials'] = serials;
			SOarray['custparam_parentSku'] = parentSku;			
			SOarray['custparam_ordIntId'] = orderNo;
			SOarray['custparam_bintransferid'] = binTransferID;
			SOarray['custparam_contlp'] = contlp;
			SOarray['custparam_StatusId'] = StatusId;
			nlapiLogExecution('DEBUG', 'StatusId',StatusId);

			var ordArr = new Array();
			if(pickreportNo != '' && pickreportNo != null && pickreportNo != 'null' && pickreportNo != 'undefined')
			{
				var result = funtoGetOrdersOfPickreportNo(pickreportNo,whlocation);

				if(result != null && result != '' && result != 'null' && result != 'undefined')
				{
					for(var k=0;k<result.length;k++)
					{
						if(ordArr.indexOf(result[k].getValue('custrecord_wmsse_order_no')) == -1)
						{
							ordArr.push(result[k].getValue('custrecord_wmsse_order_no'));
						}

					}
				}
				else
				{

					SOarray["custparam_error"]="Please enter/scan valid pickreportno ";
					response.sendRedirect('SUITELET', 'customscript_wmsse_pickreversal_ord_scan', 'customdeploy_wmsse_pickreversal_ord_scan', false, SOarray);
					return false;
				}
			}
			ordArr.push(orderNo);

			var itemType = nswms_GetItemType(parentSku,null);
			if(itemType == 'kititem' && nsrefno != null && nsrefno != '' && nsrefno !='null' && nsrefno != 'undefined' )
			{
				SOarray["custparam_error"]=" ";
				response.sendRedirect('SUITELET', 'customscript_wmsse_pickreversal_conf', 'customdeploy_wmsse_pickreversal_conf', false, SOarray);
				return false;

			}			
			else
			{
				//performTaskReversal(orderNo,ordlineno,taskid,taskqty,itemid,tasktype,taskactloc,status,trantype,nsrefno,lotno,serials,parentSku,binTransferID,null,whlocation,taskbeginloc,orderno);
				if((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
						&&(nsrefno == null || nsrefno == '' ||nsrefno == 'null' ||  nsrefno == 'undefined')
						&&(vBinTrIntId == null || vBinTrIntId == '' ||  vBinTrIntId== 'null' ||  vBinTrIntId == 'undefined'))
				{
					var opentaskSerialArr = new Array();
					if(serials != null && serials != '' && serials != 'null' && serials != 'undefined')
					{
						opentaskSerialArr = serials.split(',');
					}
					var filters = new Array();
					var serialArray='';
					//filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
					filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseInt(ordlineno));									
					filters[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', orderNo);
					var columns = new Array();
					//columns[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
					//columns[1] = new nlobjSearchColumn('name');
					var SrchRecordSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filters,columns);
					nlapiLogExecution('DEBUG','SrchRecordSerial', SrchRecordSerial);
					if(SrchRecordSerial != null && SrchRecordSerial != '')
					{
						for(var m=0;m<SrchRecordSerial.length;m++)
						{
							if(opentaskSerialArr.indexOf(SrchRecordSerial[m].getValue('custrecord_wmsse_ser_no')) != -1)
							{
								var vRecId=SrchRecordSerial[m].getId();
								nlapiLogExecution('ERROR', 'Deleted serial entry', vRecId);
								nlapiDeleteRecord('customrecord_wmsse_serialentry', vRecId);
							}
						}
					}
				}
				performTaskReversal(orderNo,ordlineno,taskid,taskqty,itemid,tasktype,taskactloc,status,trantype,nsrefno,lotno,serials,parentSku,
						binTransferID,null,whlocation,taskbeginloc,orderno,StatusId,inventoryStatusFeature);
			}


			var opentaskResults = funtoCheckSo(ordArr,whlocation);

			if(opentaskResults != null && opentaskResults != 'null' && opentaskResults != '' && opentaskResults.length > 0)
			{
				var logMsg1 = 'opentaskResults.length =' + opentaskResults.length + '<br>';
				logMsg1 = logMsg1 + 'skipCount = ' + skipCount + '<br>';
				nlapiLogExecution('DEBUG', 'parameters of opentaskResults1', logMsg1);
				
				if(opentaskResults.length > skipCount)
				{
					SOarray["custparam_id"] = opentaskResults[skipCount].getId();
				}
				else
				{
					SOarray["custparam_id"] =opentaskResults[0].getId();
				}
				SOarray["custparam_error"]="";
				response.sendRedirect('SUITELET', 'customscript_wmsse_rf_pickreversal', 'customdeploy_wmsse_rf_pickreversal', false, SOarray);	
				return;
			}
			else
			{

				var isValid = 'F';
				var opentaskorderSearchresultPackTasks = new Array();
				/*var pfilter= new Array();
				if(	ordArr != null && 	ordArr != '' && 	ordArr != 'null' && 	ordArr != 'undefined' && 	ordArr.length > 0)
				{
					pfilter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordArr));
					isValid = 'T';
				}
				if(	contlp != null && 	contlp != '' && 	contlp != 'null' && 	contlp != 'undefined' )
				{
					pfilter.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'is', contlp));
					isValid = 'T';
				}
				pfilter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['28']));
				pfilter.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null,'anyof', whlocation));

				var pColumns = new Array();
				pColumns.push(new nlobjSearchColumn('custrecord_wmsse_tasktype',null,'group'));
				pColumns.push(new nlobjSearchColumn('type','custrecord_wmsse_sku','group'));
				pColumns.push(new nlobjSearchColumn('custrecord_wmsse_container_lp_no',null,'group'));
				pColumns.push(new nlobjSearchColumn('internalid',null,'max'));
				var opentaskorderSearchresultPackTasks = null;
				if(isValid == 'T')
				{
					opentaskorderSearchresultPackTasks = nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,pfilter,pColumns);
				}*/
				
				
				
				if(	ordArr != null && 	ordArr != '' && 	ordArr != 'null' && 	ordArr != 'undefined' && 	ordArr.length > 0)
				{
					isValid = 'T';
				}
				if(	contlp != null && 	contlp != '' && 	contlp != 'null' && 	contlp != 'undefined' )
				{
					isValid = 'T';
				}
				if(isValid == 'T')
				{
					var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_pickreversalofpack');
					
					if(	ordArr != null && 	ordArr != '' && 	ordArr != 'null' && 	ordArr != 'undefined' && 	ordArr.length > 0)
					{
						OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordArr));
					}
					if(	contlp != null && 	contlp != '' && 	contlp != 'null' && 	contlp != 'undefined' )
					{
						OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'is', contlp));
					}
					OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['28']));
					OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null,'anyof', whlocation));

					var resLenDetails = OTsearchresult.runSearch();
					var resultsPage = resLenDetails.getResults(0, 1000);
					var offset = 0;
					while (!!resultsPage && resultsPage.length > 0) 
					{
						opentaskorderSearchresultPackTasks = opentaskorderSearchresultPackTasks.concat(resultsPage);
						offset += 1000;
						resultsPage = resLenDetails.getResults(offset, offset + 1000);
					}
				}
				

				nlapiLogExecution('DEBUG', "opentaskorderSearchresultPackTasks", opentaskorderSearchresultPackTasks);
				var pickTasksExist = false;
				if(opentaskorderSearchresultPackTasks!= null && opentaskorderSearchresultPackTasks!= '' && opentaskorderSearchresultPackTasks!= 'null' && opentaskorderSearchresultPackTasks!= 'undefined' && 	opentaskorderSearchresultPackTasks.length > 0)
				{
					for(var p=0;p<opentaskorderSearchresultPackTasks.length;p++)
					{
						var taskType= opentaskorderSearchresultPackTasks[p].getValue('custrecord_wmsse_tasktype',null,'group');
						var skuType= opentaskorderSearchresultPackTasks[p].getValue('type','custrecord_wmsse_sku','group');
						
						if((taskType == '3' || taskType == 3) && (skuType != 'Kit'))
						{
							pickTasksExist =true;
							break;
						}

					}

					/*var logMsg1 = 'pickTasksExist =' + pickTasksExist + '<br>';
					logMsg1 = logMsg1 + 'opentaskorderSearchresultPackTasks.length) = ' + opentaskorderSearchresultPackTasks.length) + '<br>';
					nlapiLogExecution('DEBUG', 'parameters', logMsg1);*/
					
					for(var p=0;p<opentaskorderSearchresultPackTasks.length && pickTasksExist == false;p++)
					{

						var fields = new Array();
						var values = new Array();

						fields.push('custrecord_wmsse_notes');
						fields.push('custrecord_wmsse_nsconfirm_ref_no');
						fields.push('custrecord_wmsse_nstrn_ref_no');


						values.push('Updated by outbound reversal process');
						values.push(null);
						values.push(null);
						fields.push('custrecord_wmsse_wms_status_flag');
						values.push('33');


						nlapiLogExecution('DEBUG', 'open task id ',opentaskorderSearchresultPackTasks[p].getValue('internalid',null,'max')); 

						nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskorderSearchresultPackTasks[p].getValue('internalid',null,'max'), fields, values); 
					}
				}
				SOarray["custparam_error"]="";
				response.sendRedirect('SUITELET', 'customscript_wmsse_pickreversal_ord_scan', 'customdeploy_wmsse_pickreversal_ord_scan', false, SOarray);
				return false;
			}

		}


	}
}
function funtoCheckSo(orderNo,whlocation){

	nlapiLogExecution('DEBUG', 'orderNo', orderNo);
	var SORecinternalids=new Array();
	var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_rf_pickrev_orderno');
	
	if(orderNo != null && orderNo != 'null' && orderNo != '' && orderNo !='undefined')
	{
		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',orderNo));
	}
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8','28']));
	OTsearchresult.addFilter(new nlobjSearchFilter('type','custrecord_wmsse_sku','noneof',['Kit']));


	var resLenDetails = OTsearchresult.runSearch();
	
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SORecinternalids = SORecinternalids.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	//SOtrantypefilters=null;
	//SOtrantypecols=null;
	return SORecinternalids;
}

function performTaskReversal(ordid,ordlineno,taskid,taskqty,itemid,tasktype,taskactloc,wmsstatus,trantype,nsrefno,lotno,serials,parentSku,
		vBinTrIntId,kitItemLenth,whlocation,taskbeginloc,orderno,StatusId,inventoryStatusFeature)
{

	var str = 'ordid. = ' + ordid + '<br>';	
	str = str + 'ordlineno. = ' + ordlineno + '<br>';
	str = str + 'taskid. = ' + taskid + '<br>';
	str = str + 'taskqty. = ' + taskqty + '<br>';	 
	str = str + 'itemid. = ' + itemid + '<br>';
	str = str + 'trantype. = ' + trantype + '<br>';
	str = str + 'nsrefno. = ' + nsrefno + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'vBinTrIntId. = ' + vBinTrIntId + '<br>';
	str = str + 'StatusId. = ' + StatusId + '<br>';
	nlapiLogExecution('DEBUG', 'performTaskReversal Parameters', str);
	vblnUpdOpentask='T';
	if(nsrefno != null && nsrefno != '' &&  nsrefno != 'null' &&  nsrefno != 'undefined')
	{
		var vIFId = updateTransaction(ordid,ordlineno,taskqty,itemid,nsrefno,taskactloc,lotno,serials,parentSku,'itemfulfillment',kitItemLenth,
				whlocation,taskbeginloc,orderno,vBinTrIntId,StatusId,inventoryStatusFeature);
		if(vIFId != null && vIFId != '' && vIFId != 'null' && vIFId != 'undefined')
			vblnUpdOpentask='T';
		else
			vblnUpdOpentask='F';
	}
	if(vBinTrIntId != null && vBinTrIntId != '' &&  vBinTrIntId != 'null' &&  vBinTrIntId != 'undefined' && vblnUpdOpentask == 'T')
	{
		var vBTId = updateTransaction(ordid,ordlineno,taskqty,itemid,vBinTrIntId,taskactloc,lotno,serials,parentSku,'bintransfer',kitItemLenth,
				whlocation,taskbeginloc,orderno,'',StatusId,inventoryStatusFeature);
		if(vBTId != null && vBTId != '' && vBTId != 'null' && vBTId != 'undefined')
			vblnUpdOpentask='T';
		else
			vblnUpdOpentask='F';
	}
	nlapiLogExecution('DEBUG', 'vIFId : vBTId', vIFId + ' : ' + vBTId);
	if(vblnUpdOpentask == 'T')
	{
		updateOBOpentask(taskqty,taskid,taskqty,itemid,ordid,taskactloc,ordlineno,tasktype,wmsstatus,StatusId);
	}

}
function performTaskReversalOld(ordid,ordlineno,taskid,taskqty,itemid,tasktype,taskactloc,wmsstatus,trantype,nsrefno,lotno,serials,parentSku)
{

	var str = 'ordid. = ' + ordid + '<br>';	
	str = str + 'ordlineno. = ' + ordlineno + '<br>';
	str = str + 'taskid. = ' + taskid + '<br>';
	str = str + 'taskqty. = ' + taskqty + '<br>';	 
	str = str + 'itemid. = ' + itemid + '<br>';
	str = str + 'trantype. = ' + trantype + '<br>';
	str = str + 'nsrefno. = ' + nsrefno + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	nlapiLogExecution('DEBUG', 'performTaskReversal Parameters', str);

	if(nsrefno != null && nsrefno != '' &&  nsrefno != 'null' &&  nsrefno != 'undefined')
	{
		var id = 	updateItemFulfillment(ordid,ordlineno,taskqty,itemid,nsrefno,taskactloc,lotno,serials,parentSku);

		nlapiLogExecution('DEBUG', 'id', id);
		if(id != null && id != '' && id != 'null' && id != 'undefined')
		{
			updateOBOpentask(taskqty,taskid,taskqty,itemid,ordid,taskactloc,ordlineno,tasktype,wmsstatus);
		}

	}
	else
	{
		updateOBOpentask(taskqty,taskid,taskqty,itemid,ordid,taskactloc,ordlineno,'Open',wmsstatus);
	}

}
function updateItemFulfillment(ordid,ordlineno,taskqty,itemid,nsrefno,taskactloc,lotno,serials,parentSku)
{
	
	var str = 'Into updateItemFulfillment. = ' + ordid + '<br>';	
	str = str + 'ordlineno. = ' + ordlineno + '<br>';
	str = str + 'taskqty. = ' + taskqty + '<br>';
	str = str + 'itemid. = ' + itemid + '<br>';	 
	str = str + 'nsrefno. = ' + nsrefno + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'lotno. = ' + lotno + '<br>';
	str = str + 'serials. = ' + serials + '<br>';
	nlapiLogExecution('DEBUG', 'updateItemFulfillment Parameters', str);
	
	var opentaskSerialArr = new Array();
	var itemType ='';
	var Id='';
	if(ordid!=null && ordid!='')
	{
		try
		{
			var trantype = nlapiLookupField('transaction', ordid, 'recordType');
			nlapiLogExecution('DEBUG','trantype',trantype);

			var itemIndex=0;
			var totalqty=taskqty;
			var vLotQty=0;
			var boolfound=true;
			var TransformRecId ='';
			var filters = new Array();
			filters.push(new nlobjSearchFilter('createdfrom', null, 'is', ordid));
			filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));

			filters.push(new nlobjSearchFilter('item', null, 'anyof', itemid));

			var columns = new Array();    
			columns.push(new nlobjSearchColumn('quantity')); 
			columns.push(new nlobjSearchColumn('line'));
			columns.push(new nlobjSearchColumn('location'));

			var itemReceiptResults = nlapiSearchRecord('itemfulfillment', null, filters, columns);
			if(itemReceiptResults != null && itemReceiptResults !='')
			{	
				if(nsrefno != null && nsrefno !='' && nsrefno !='null' && nsrefno !='undefined')
				{
					var TransformRec = nlapiLoadRecord('itemfulfillment', nsrefno);

					//  To get the no of lines from item fulfillment record
					var IFLength = TransformRec.getLineItemCount('item');  

					for (var j = 1; IFLength!=null && j <= IFLength; j++) {

						var itemLineNo = TransformRec.getLineItemValue('item', 'orderline', j);

						/*if(trantype=="transferorder")
						itemLineNo=parseInt(itemLineNo)-2;*/

						if (itemLineNo == ordlineno) {
							itemIndex=j;    				
						}

					}


					if(itemIndex!=0 )
					{

						nlapiLogExecution('ERROR', "itemIndex", itemIndex);
						var item_id = TransformRec.getLineItemValue('item', 'item', itemIndex);
						var itemname = TransformRec.getLineItemText('item', 'item', itemIndex);
						if(itemname!=null && itemname!='')
							itemname=itemname.replace(/ /g,"-");
						var itemrec = TransformRec.getLineItemValue('item', 'itemreceive', itemIndex);
						var itemloc2 = TransformRec.getLineItemValue('item', 'location', itemIndex);
						var NSOrdUOM = TransformRec.getLineItemValue('item', 'units', itemIndex);
						nlapiLogExecution('ERROR', 'item_id', item_id);
						nlapiLogExecution('ERROR', 'itemname', itemname);
						nlapiLogExecution('ERROR', 'NSOrdUOM', NSOrdUOM);
						nlapiLogExecution('ERROR', 'itemType', itemType);
						
						
						var logMsg1 = 'itemIndex =' + itemIndex + '<br>';
						logMsg1 = logMsg1 + 'item_id = ' + item_id + '<br>';
						logMsg1 = logMsg1 + 'itemname = ' + itemname + '<br>';
						logMsg1 = logMsg1 + 'NSOrdUOM = ' + NSOrdUOM + '<br>';
						logMsg1 = logMsg1 + 'itemType = ' + itemType + '<br>';
						
						nlapiLogExecution('DEBUG', 'parameters', logMsg1);
						
						itemType = nswms_GetItemType(item_id,itemloc2);




						if(boolfound)
						{
							if(totalqty>0)
							{
								if(serials != null && serials != '' && serials != 'null' && serials != 'undefined')
								{
									opentaskSerialArr = serials.split(',');
								}
								TransformRec.selectLineItem('item', itemIndex);
								var oldputqty = TransformRec.getCurrentLineItemValue('item', 'quantity');
								
								
								//var newputqty = parseFloat(oldputqty)-parseFloat(totalqty);
								var newputqty = Number(Big(oldputqty).minus(totalqty));
								
								
								var logMsg1 = 'oldputqty =' + oldputqty + '<br>';
								logMsg1 = logMsg1 + 'totalqty = ' + totalqty + '<br>';
								logMsg1 = logMsg1 + 'newputqty = ' + newputqty + '<br>';
								nlapiLogExecution('DEBUG', 'parameters qty', logMsg1);
								
								if(parseFloat(newputqty)>0)
								{
									TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'T');
									TransformRec.setCurrentLineItemValue('item', 'quantity', newputqty);					
									TransformRec.setCurrentLineItemValue('item', 'location', itemloc2);

									if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {

										var compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
										var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
										nlapiLogExecution('DEBUG', 'complinelength', complinelength);
										for(var r1=1;r1<=complinelength;r1++)
										{
											if(totalqty > 0 )
											{
												compSubRecord.selectLineItem('inventoryassignment',r1);
												var vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'binnumber');
												var vOldSubBinLocQty = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
												var vOldReceiptInventoryNumber = compSubRecord.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');
												nlapiLogExecution('DEBUG', 'vOldReceiptInventoryNumber', vOldReceiptInventoryNumber);
												if(vOldSubBinLocText == taskactloc && totalqty > 0 && (lotno == vOldReceiptInventoryNumber))
												{
													var vNewSubBinLocQty = '';

													if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
													{
														//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
														vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
													}
													else
													{
														//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
														vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
													}
													nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
													if(parseFloat(vNewSubBinLocQty) > 0)
													{
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', vNewSubBinLocQty);
														compSubRecord.commitLineItem('inventoryassignment');
														//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty);
														totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty)); 
													}
													else
													{
														nlapiLogExecution('DEBUG', 'inside else',r1);
														compSubRecord.removeLineItem('inventoryassignment', r1);
														totalqty = 0; 
														break;
													}
												}
											}
										}
										compSubRecord.commit();
									}
									else if (itemType == "inventoryitem" || itemType == "assemblyitem") {

										var compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
										var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
										nlapiLogExecution('DEBUG', 'complinelength', complinelength);
										for(var r1=1;r1<=complinelength;r1++)
										{
											if(totalqty > 0 )
											{
												compSubRecord.selectLineItem('inventoryassignment',r1);
												var vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'binnumber');
												var vOldSubBinLocQty = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
												if(vOldSubBinLocText == taskactloc && totalqty > 0)
												{
													var vNewSubBinLocQty = '';

													if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
													{
														//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
														vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
													}
													else
													{
														//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
														vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
													}
													nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
													if(parseFloat(vNewSubBinLocQty) > 0)
													{
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', vNewSubBinLocQty);
														compSubRecord.commitLineItem('inventoryassignment');
														//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty);
														totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty));
													}
													else
													{
														compSubRecord.removeLineItem('inventoryassignment', r1);
														totalqty = 0; 
														break;
													}
												}
											}
										}
										compSubRecord.commit();
									}
									else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {





										var compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');

										var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

										if( totalqty > 0)
										{
											var tQty =	totalqty;
											if(parseInt(complinelength)>0)
											{
												for(var r1=1;r1<=complinelength;r1++)
												{
													compSubRecord.selectLineItem('inventoryassignment',r1);
													var vOldSubBinLocText = compSubRecord.getCurrentLineItemText('inventoryassignment', 'binnumber');
													var serialNum = compSubRecord.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');
													if(vOldSubBinLocText == taskactloc && opentaskSerialArr.indexOf(serialNum) != -1)
													{
														tQty = parseInt(tQty)-1;
														compSubRecord.removeLineItem('inventoryassignment', r1);
													}

													if(tQty == 0)
													{
														break;
													}
												}
												compSubRecord.commit();
											}
										}
									}
									TransformRec.commitLineItem('item');
								}
								else
								{									
									var logMsg1 = 'putaway Qty is Zero =' + newputqty + '<br>';
									logMsg1 = logMsg1 + 'IFLength = ' + IFLength + '<br>';
									nlapiLogExecution('DEBUG', 'parameters', logMsg1);

									if(IFLength==1)
									{
										TransformRecId = nlapiDeleteRecord('itemfulfillment', nsrefno);
										TransformRec=null;
										Id= TransformRecId;

									}
									else
										TransformRec.setLineItemValue('item','itemreceive',itemIndex,'F');

								}
							}
							else
							{								
								var logMsg1 = 'Picked Qty is Zero =' + totalqty + '<br>';
								logMsg1 = logMsg1 + 'IFLength = ' + IFLength + '<br>';
								nlapiLogExecution('DEBUG', 'parameters', logMsg1);

								if(IFLength==1)
								{
									TransformRecId = nlapiDeleteRecord('itemfulfillment', nsrefno);
									TransformRec=null;
									Id= TransformRecId;

								}
								else
									TransformRec.setLineItemValue('item','itemreceive',itemIndex,'F');
							}
						}
					}

					
					if(TransformRec!=null)
					{
						var TransformRecId = nlapiSubmitRecord(TransformRec, true);
						nlapiLogExecution('DEBUG', 'After Submit', TransformRecId);
						Id= TransformRecId;
					}
					if(TransformRecId != null && TransformRecId != '' && TransformRecId != 'null' && TransformRecId != 'undefined' && (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem"))
					{
						var logMsg1 = 'ordlineno =' + ordlineno + '<br>';
						logMsg1 = logMsg1 + 'ordid = ' + ordid + '<br>';
						nlapiLogExecution('DEBUG', 'parameters ord', logMsg1);

						//fetch serials from serial entry
						var filters = new Array();
						var serialArray='';
						//filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
						filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseInt(ordlineno));									
						filters[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', ordid);
						var columns = new Array();
						//columns[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
						//columns[1] = new nlobjSearchColumn('name');
						var SrchRecordSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filters,columns);
						nlapiLogExecution('DEBUG','SrchRecordSerial', SrchRecordSerial);
						if(SrchRecordSerial != null && SrchRecordSerial != '')
						{
							for(var m=0;m<SrchRecordSerial.length;m++)
							{
								if(opentaskSerialArr.indexOf(SrchRecordSerial[m].getValue('custrecord_wmsse_ser_no')) != -1)
								{
									var vRecId=SrchRecordSerial[m].getId();
									nlapiLogExecution('DEBUG', 'Deleted serial entry', vRecId);
									nlapiDeleteRecord('customrecord_wmsse_serialentry', vRecId);
								}
							}
						}

					}

				}
			}
		}
		catch(exp)
		{
			nlapiLogExecution('ERROR', 'Exception in updateItemReceipt',exp);
		}
	}

	nlapiLogExecution('DEBUG', 'Out of updateItemReceipt');

	return Id;
}

function updateOBOpentask(reversalqty,taskid,taskactqty,itemid,ordintrid,taskactloc,lineno,tasktype,wmsstatus,StatusId)
{
	

	var str = 'reversalqty. = ' + reversalqty + '<br>';	
	str = str + 'taskactqty. = ' + taskactqty + '<br>';	
	str = str + 'opentaskid. = ' + taskid + '<br>';
	str = str + 'tasktype. = ' + tasktype + '<br>';	 
	str = str + 'itemid. = ' + itemid + '<br>';
	//str = str + 'lprecid. = ' + lprecid + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'ordintrid. = ' + ordintrid + '<br>';
	str = str + 'lineno. = ' + lineno + '<br>';
	str = str + 'wmsstatus. = ' + wmsstatus + '<br>';
	str = str + 'StatusId. = ' + StatusId + '<br>';
	nlapiLogExecution('DEBUG', 'Function Parameters', str);

	updateOpenTask(taskid,reversalqty,taskactqty,tasktype,lineno,itemid,ordintrid,StatusId);

	nlapiLogExecution('ERROR', 'Out of updateOpentaskandInventory');
}

function updateOpenTask(taskid,reversalqty,taskactqty,tasktype,lineno,itemid,ordintrid,StatusId)
{
	

	var str = 'taskid. = ' + taskid + '<br>';
	str = str + 'reversalqty. = ' + reversalqty + '<br>';
	str = str + 'taskactqty. = ' + taskactqty + '<br>';
	str = str + 'tasktype. = ' + tasktype + '<br>';
	str = str + 'lineno. = ' + lineno + '<br>';
	str = str + 'itemid. = ' + itemid + '<br>';
	str = str + 'ordintrid. = ' + ordintrid + '<br>';

	var taskremqty=parseFloat(taskactqty)-parseFloat(reversalqty);

	str = str + 'taskremqty. = ' + taskremqty + '<br>';

	nlapiLogExecution('DEBUG', 'Function Parameters', str);
	var cartlpArray=new Array();
	if(tasktype=='Open')
	{
		var opentaskList=new Array();
		var objopentaskList = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_pickreversal');
	
		if(taskid != null && taskid !='' && taskid !='null' && taskid !='undefined')
		{
			objopentaskList.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', taskid));
		}
		else
		{
			if(ordintrid != null && ordintrid != '')
				objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordintrid));
			if(lineno != null && lineno != '')
				objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineno));
			//3-Putaway completed
			objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [3]));

			//2- putaway
			objopentaskList.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_tasktype', null, 'anyof', [2]));

			if(StatusId != null && StatusId != '' && StatusId != 'null' && StatusId != 'undefined' && StatusId != undefined)
				objopentaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_inventorystatus', null, 'anyof', StatusId));
		}	
		var resLenDetails = objopentaskList.runSearch();
		
		
		var resultsPage = resLenDetails.getResults(0, 1000);
		var offset = 0;
		while (!!resultsPage && resultsPage.length > 0) 
		{
			opentaskList = opentaskList.concat(resultsPage);
			offset += 1000;
			resultsPage = resLenDetails.getResults(offset, offset + 1000);
		}
		nlapiLogExecution('DEBUG', 'opentaskList at updateOpenTask', opentaskList);
		if(opentaskList != null && opentaskList != '')
		{
			for(var i=0;i<opentaskList.length;i++)
			{
				var fields = new Array();
				var values = new Array();

				fields.push('custrecord_wmsse_notes');
				fields.push('custrecord_wmsse_reversalqty');
				fields.push('custrecord_wmsse_act_qty');
				fields.push('custrecord_wmsse_compitm_actqty');



				values.push('Updated by outbound reversal process');
				values.push(parseFloat(reversalqty));
				values.push(parseFloat(taskremqty));
				values.push(parseFloat(taskremqty));


				if(parseFloat(taskremqty)<1)
				{
					fields.push('custrecord_wmsse_wms_status_flag');
					values.push('33');
					fields.push('custrecord_wmsse_act_end_date');
					values.push(DateStamp());

				}
				nlapiLogExecution('DEBUG', 'open task id ',opentaskList[i].getId());
				nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskList[i].getId(), fields, values);

			}
			var vSku=opentaskList[0].getValue('custrecord_wmsse_sku');
			var vParentSku=opentaskList[0].getValue('custrecord_wmsse_parent_sku_no');
			if(vParentSku != vSku)
			{
				var vKitOpenTaskList=new Array();
				var objvKitOpenTaskList = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_pickreversal');
							
				//To Update Kit item task 
				var vFilters=new Array();
				if(ordintrid != null && ordintrid != '')
					objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordintrid));
				if(lineno != null && lineno != '')
					objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineno));

				objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [8]));
				objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [3]));
				objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_reversalqty', null, 'isempty'));
				if(vParentSku !=null && vParentSku!='' && vParentSku !='null')
					objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof',vParentSku));
				if(StatusId != null && StatusId != '' && StatusId != 'null' && StatusId != 'undefined' && StatusId != undefined)
					objvKitOpenTaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_inventorystatus', null, 'anyof', StatusId));

				var resLenDetails = objvKitOpenTaskList.runSearch();
				
				
				var resultsPage = resLenDetails.getResults(0, 1000);
				var offset = 0;
				while (!!resultsPage && resultsPage.length > 0) 
				{
					vKitOpenTaskList = vKitOpenTaskList.concat(resultsPage);
					offset += 1000;
					resultsPage = resLenDetails.getResults(offset, offset + 1000);
				}
				if(vKitOpenTaskList !=null && vKitOpenTaskList !='' && vKitOpenTaskList !='null')
				{
					nlapiLogExecution('DEBUG', 'open kit task id ',vKitOpenTaskList[0].getId()); 
					var fields = new Array();
					var values = new Array();

					fields.push('custrecord_wmsse_notes');
					fields.push('custrecord_wmsse_reversalqty');
					fields.push('custrecord_wmsse_act_qty');
					fields.push('custrecord_wmsse_nsconfirm_ref_no');
					fields.push('custrecord_wmsse_nstrn_ref_no');


					values.push('Updated by outbound reversal process');
					values.push(parseFloat(reversalqty));
					values.push(parseFloat(taskremqty));
					values.push(null);
					values.push(null);


					if(parseFloat(taskremqty)<1)
					{
						fields.push('custrecord_wmsse_wms_status_flag');
						values.push('33');
						//fields.push('custrecord_wmsse_act_end_date');
						//values.push(DateStamp());

					}
					nlapiSubmitField('customrecord_wmsse_trn_opentask', vKitOpenTaskList[0].getId(), fields, values);
				}
			}
		}
	}
	else
	{
		var closedtaskList=new Array();
		var objclosedtaskList = new nlapiLoadSearch('customrecord_wmsse_trn_closedtask', 'customsearch_wmsse_ct_pickreversal');
		
		if(taskid != null && taskid !='' && taskid !='null' && taskid !='undefined')
		{
			objclosedtaskList.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', taskid));
		}
		else
		{
			if(ordintrid != null && ordintrid != '')
				objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no_clt', null, 'is', ordintrid));
			if(lineno != null && lineno != '')
				objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no_clt', null, 'equalto', lineno));
			//3-Putaway completed
			objclosedtaskList.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_wms_status_flag_clt', null, 'anyof', [3]));

			//2- putaway
			objclosedtaskList.addFilter(new nlobjSearchFilter( 'custrecord_wmsse_tasktype_clt', null, 'anyof', [2]));
			if(StatusId != null && StatusId != '' && StatusId != 'null' && StatusId != 'undefined' && StatusId != undefined)
				objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_inventorystatus_clt', null, 'anyof', StatusId));
		}

		var resLenDetails = objclosedtaskList.runSearch();
		
		
		var resultsPage = resLenDetails.getResults(0, 1000);
		var offset = 0;
		while (!!resultsPage && resultsPage.length > 0) 
		{
			closedtaskList = closedtaskList.concat(resultsPage);
			offset += 1000;
			resultsPage = resLenDetails.getResults(offset, offset + 1000);
		}
		if(closedtaskList != null && closedtaskList != '')
		{
			for(var i=0;i<closedtaskList.length;i++)
			{
				var fields = new Array();
				var values = new Array();

				fields.push('custrecord_wmsse_notes_clt');
				fields.push('custrecord_wmsse_reversalqty_clt');
				fields.push('custrecord_wmsse_act_qty_clt');
				values.push('Updated by outbound reversal process');
				values.push(parseFloat(reversalqty));
				values.push(parseFloat(taskremqty));

				if(parseFloat(taskremqty)<1)
				{
					fields.push('custrecord_wmsse_wms_status_flag_clt');
					values.push('33');
					fields.push('custrecord_wmsse_act_end_date_clt');
					values.push(DateStamp());
				}
				nlapiLogExecution('DEBUG', 'Closed task id ',closedtaskList[i].getId());
				nlapiSubmitField('customrecord_wmsse_trn_closedtask', closedtaskList[i].getId(), fields, values);

			}
		} 
	}

	nlapiLogExecution('ERROR', 'Out of updateOpenTask');
}
function funtoGetOrdersOfPickreportNo(pickreportNo,whlocation){

	nlapiLogExecution('DEBUG', 'pickreportNo', pickreportNo);
	var SORecinternalids=new Array();
	var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_rf_pickrev_orderno');
	
	if(pickreportNo != null && pickreportNo != 'null' && pickreportNo != '' && pickreportNo !='undefined')
	{
		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',pickreportNo));
		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['9']));
	}
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));

	OTsearchresult.addFilter(new nlobjSearchFilter('type','custrecord_wmsse_sku','noneof',['Kit']));

	var resLenDetails = OTsearchresult.runSearch();
	
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SORecinternalids = SORecinternalids.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}
	
	
	nlapiLogExecution('DEBUG', 'SORecinternalids', SORecinternalids);

	//SOtrantypefilters=null;
	//SOtrantypecols=null;
	return SORecinternalids;
}

function updateTransaction(ordid,ordlineno,taskqty,itemid,nsrefno,taskactloc,lotno,serials,parentSku,processType,kitItemLenth,whlocation,
		taskbeginloc,orderno,vBinTrIntId,StatusId,inventoryStatusFeature)
{
	var str = 'ordid. = ' + ordid + '<br>';	
	str = str + 'ordlineno. = ' + ordlineno + '<br>';
	str = str + 'taskqty. = ' + taskqty + '<br>';
	str = str + 'itemid. = ' + itemid + '<br>';	 
	str = str + 'nsrefno. = ' + nsrefno + '<br>';
	str = str + 'taskactloc. = ' + taskactloc + '<br>';
	str = str + 'lotno. = ' + lotno + '<br>';
	str = str + 'serials. = ' + serials + '<br>';
	str = str + 'processType. = ' + processType + '<br>';
	str = str + 'kitItemLenth. = ' + kitItemLenth + '<br>';
	str = str + 'orderno. = ' + orderno + '<br>';
	str = str + 'vBinTrIntId. = ' + vBinTrIntId + '<br>';
	str = str + 'StatusId. = ' + StatusId + '<br>';
	nlapiLogExecution('DEBUG', 'updateTransaction Parameters', str);

	var opentaskSerialArr = new Array();
	var itemType ='';
	var Id='';
	var TransformRecId = '';
	if(ordid!=null && ordid!='')
	{
		try
		{
			// var trantype = nlapiLookupField('transaction', ordid, 'recordType');
			//nlapiLogExecution('ERROR','trantype',trantype);

			var itemIndex=0;
			var totalqty=taskqty;
			var vLotQty=0;
			var boolfound=true;

			if(nsrefno != null && nsrefno !='' && nsrefno !='null' && nsrefno !='undefined' && processType != null && processType != '')
			{
				var vSubRecordId='item';
				//var TransformRec = nlapiLoadRecord('itemfulfillment', nsrefno);
				var TransformRec = nlapiLoadRecord(processType, nsrefno);
				//Case# 201418288 start
				var trantype = nlapiLookupField('transaction', ordid, 'recordType');
				//Case# 201418288 end
				// To get the no of lines from item fulfillment record
				var blnItemUnit="";
				var VUnitType ="";
				var vConversionRate ="";
				var vColumnslist ='';
				var soLineItemDetails=getSOLineDetailsNew(orderno,trantype,itemid,whlocation,ordlineno);
				nlapiLogExecution('DEBUG', 'soLineItemDetails', soLineItemDetails.length); 
				if(soLineItemDetails !=null && soLineItemDetails !='' && soLineItemDetails.length > 0)
				{
					vColumnslist=soLineItemDetails[0].getAllColumns();
					for(var x1=0;x1<vColumnslist.length;x1++)
					{
						var summaryLabel = vColumnslist[x1].getLabel();
						if (summaryLabel == 'Conversion Rate')
						{
							coversionRateIndex = x1;
						}
					}
					for(var j=0; j<soLineItemDetails.length; j++)
					{
						vConversionRate = soLineItemDetails[j].getValue(vColumnslist[coversionRateIndex]);
					}
				}
				
				var itemfilters=new Array();
				itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',itemid));
				var itemcolumns= new Array();
				itemcolumns.push(new nlobjSearchColumn('stockunit'));
				itemcolumns.push(new nlobjSearchColumn('unitstype'));
				var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
				if(itemresults!=null && itemresults!='')
				{
					blnItemUnit = itemresults[0].getText('stockunit');
					VUnitType = itemresults[0].getValue('unitstype');
				}
				

				
				var getStockConversionRate =1;
				if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
				{
					getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
				}

				nlapiLogExecution('DEBUG', 'getStockConversionRate', getStockConversionRate);
				if(processType == 'itemfulfillment')
				{	
					var IFLength = TransformRec.getLineItemCount(vSubRecordId);  
					for (var j = 1; IFLength!=null && j <= IFLength; j++) {

						var itemLineNo = TransformRec.getLineItemValue(vSubRecordId, 'orderline', j);
						var item = TransformRec.getLineItemValue(vSubRecordId, 'item', j);
						//Case# 201418288 start
						if(trantype=="transferorder")
						{
							itemLineNo=parseInt(itemLineNo)-1;
						}

						//Case# 201418288 end

						if (itemLineNo == ordlineno  ) {
							itemIndex=j;  
							break;
						}

					}
				}
				else if(processType == 'bintransfer')
				{	
					vSubRecordId = 'inventory';
					var IFLength = TransformRec.getLineItemCount(vSubRecordId);  
					for (var j = 1; IFLength!=null && j <= IFLength; j++) {

						var vbtItem = TransformRec.getLineItemValue(vSubRecordId, 'item', j);

						/*if(trantype=="transferorder")
							itemLineNo=parseInt(itemLineNo)-2;*/
						nlapiLogExecution('DEBUG', 'vbtItem : itemid', vbtItem + ":" + itemid);


						if (vbtItem == itemid) {
							itemIndex=j;    				
						}

					}
				}



				if(itemIndex!=0 )
				{

					
					var item_id = TransformRec.getLineItemValue(vSubRecordId, 'item', itemIndex);
					var itemname = TransformRec.getLineItemText(vSubRecordId, 'item', itemIndex);
					if(itemname!=null && itemname!='')
						itemname=itemname.replace(/ /g,"-");
					var itemrec = TransformRec.getLineItemValue(vSubRecordId, 'itemreceive', itemIndex);
					var itemloc2 = TransformRec.getLineItemValue(vSubRecordId, 'location', itemIndex);
					var NSOrdUOM = TransformRec.getLineItemValue(vSubRecordId, 'units', itemIndex);
					
					var logMsg1 = 'itemIndex =' + itemIndex + '<br>';
					logMsg1 = logMsg1 + 'item_id = ' + item_id + '<br>';
					logMsg1 = logMsg1 + 'itemname = ' + itemname + '<br>';
					logMsg1 = logMsg1 + 'NSOrdUOM = ' + NSOrdUOM + '<br>';
					logMsg1 = logMsg1 + 'itemType = ' + itemType + '<br>';
					
					nlapiLogExecution('DEBUG', 'parameters', logMsg1);
					
					itemType = nswms_GetItemType(item_id,itemloc2);
					if(boolfound)
					{
						TransformRec.selectLineItem(vSubRecordId, itemIndex);
						if(totalqty>0)
						{
							if(serials != null && serials != '' && serials != 'null' && serials != 'undefined')
							{
								opentaskSerialArr = serials.split(',');
							}

							var oldputqty = TransformRec.getCurrentLineItemValue(vSubRecordId, 'quantity');
										
							
							var logMsg1 = 'oldputqty =' + oldputqty + '<br>';
							logMsg1 = logMsg1 + 'totalqty = ' + totalqty + '<br>';
							nlapiLogExecution('DEBUG', 'parameters qty', logMsg1);
							
							
							if(processType == 'bintransfer')
							{	
								//oldputqty = parseFloat(oldputqty) * parseFloat(getStockConversionRate);
								oldputqty = Number(Big(oldputqty) .mul(getStockConversionRate));
								nlapiLogExecution('DEBUG', 'oldputqty after conversion', oldputqty);
							}
							//var newputqty = parseFloat((parseFloat(oldputqty)-parseFloat(totalqty)).toFixed(5));
							var newputqty = Number(Big(oldputqty).minus(totalqty));
							nlapiLogExecution('DEBUG', 'newputqty ', newputqty);

							if(parseFloat(newputqty)>0)
							{
								TransformRec.setCurrentLineItemValue(vSubRecordId, 'itemreceive', 'T');
								if(processType == 'itemfulfillment')
								{
									TransformRec.setCurrentLineItemValue(vSubRecordId, 'quantity', Number(Big(newputqty).toFixed(5)));
								}
								else
								{
									TransformRec.setCurrentLineItemValue(vSubRecordId, 'quantity', Number(Big(newputqty).toFixed(8)));
								}
								TransformRec.setCurrentLineItemValue(vSubRecordId, 'location', itemloc2);

								if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {

									var compSubRecord = TransformRec.editCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');
									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
									nlapiLogExecution('DEBUG', 'complinelength', complinelength);
									for(var r1=1;r1<=complinelength;r1++)
									{
										if(totalqty > 0 )
										{
											var vInvenDetailsStausId="";
											compSubRecord.selectLineItem('inventoryassignment',r1);
											var vOldSubBinLocText = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'binnumber');
											var vOldSubBinLocQty = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
											var vOldReceiptInventoryNumber = compSubRecord.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');
											nlapiLogExecution('DEBUG', 'vOldReceiptInventoryNumber', vOldReceiptInventoryNumber);
											if(inventoryStatusFeature == true)
												vInvenDetailsStausId =compSubRecord.getCurrentLineItemValue('inventoryassignment', 'inventorystatus');
											nlapiLogExecution('DEBUG', 'vInvenDetailsStausId', vInvenDetailsStausId);
											if(vOldSubBinLocText == taskactloc && totalqty > 0 && (lotno == vOldReceiptInventoryNumber))
											{
												var vNewSubBinLocQty = '';
												if(inventoryStatusFeature == true)
												{
													if((vInvenDetailsStausId !=null && vInvenDetailsStausId !='' && vInvenDetailsStausId!='null') 
															&& (StatusId == vInvenDetailsStausId))
													{
														if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
														{
															//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
															vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
														}
														else
														{
															//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
															vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
														}
														nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
														if(parseFloat(vNewSubBinLocQty) > 0)
														{
															if(processType == 'itemfulfillment')
															{
																compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
															}
															else
															{
																compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
															}
															compSubRecord.commitLineItem('inventoryassignment');
															//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty); 
															totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty)); 
														}
														else
														{
															nlapiLogExecution('DEBUG', 'inside else',r1);
															compSubRecord.removeLineItem('inventoryassignment', r1);
															totalqty = 0; 
															break;
														}
													}

												}
												else
												{
													if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
													{
														//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
														vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
													}
													else
													{
														//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
														vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
													}
													nlapiLogExecution('ERROR', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
													if(parseFloat(vNewSubBinLocQty) > 0)
													{
														if(processType == 'itemfulfillment')
														{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
														}
														else
														{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
														}
														compSubRecord.commitLineItem('inventoryassignment');
														//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty);
														totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty));
													}
													else
													{
														nlapiLogExecution('ERROR', 'inside else',r1);
														compSubRecord.removeLineItem('inventoryassignment', r1);
														totalqty = 0; 
														break;
													}
												}
											}
										}
									}
									compSubRecord.commit();
								}
								else if (itemType == "inventoryitem" || itemType == "assemblyitem") 
								{

									var compSubRecord = TransformRec.editCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');
									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
									nlapiLogExecution('DEBUG', 'complinelength', complinelength);
									for(var r1=1;r1<=complinelength;r1++)
									{
										if(totalqty > 0 )
										{
											compSubRecord.selectLineItem('inventoryassignment',r1);
											var vOldSubBinLocText = '';
											var vInvenDetailsStausId='';
											if(processType == 'itemfulfillment')
											{
												vOldSubBinLocText = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'binnumber');
												if(inventoryStatusFeature == true)
													vInvenDetailsStausId =compSubRecord.getCurrentLineItemValue('inventoryassignment', 'inventorystatus');
											}
											else if(processType == 'bintransfer')
											{
												vOldSubBinLocText = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'tobinnumber');
												if(inventoryStatusFeature == true)
													vInvenDetailsStausId =compSubRecord.getCurrentLineItemValue('inventoryassignment', 'toinventorystatus');
											}
											var vOldSubBinLocQty = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
																						
											if(vOldSubBinLocText == taskactloc && totalqty > 0)
											{
												var vNewSubBinLocQty = '';
												if(inventoryStatusFeature == true)
												{
													nlapiLogExecution('DEBUG', 'vInvenDetailsStausId ', vInvenDetailsStausId);												
													if((vInvenDetailsStausId !=null && vInvenDetailsStausId !='' && vInvenDetailsStausId!='null') && (StatusId == vInvenDetailsStausId))
													{
														if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
														{
															//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
															vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
														}
														else
														{
															//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
															vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
														}														
														if(parseFloat(vNewSubBinLocQty) > 0)
														{
															if(processType == 'itemfulfillment')
															{
																compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
															}
															else
															{
																compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
															}
															compSubRecord.commitLineItem('inventoryassignment');
															//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty); 
															totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty)); 
														}
														else
														{
															compSubRecord.removeLineItem('inventoryassignment', r1);
															totalqty = 0; 
															break;
														}
													}
												}
												else
												{
													if(parseFloat(vOldSubBinLocQty)>parseFloat(totalqty))
													{
														//vNewSubBinLocQty=parseFloat(vOldSubBinLocQty)-parseFloat(totalqty);
														vNewSubBinLocQty=Number(Big(vOldSubBinLocQty).minus(totalqty));
													}
													else
													{
														//vNewSubBinLocQty=parseFloat(totalqty)-parseFloat(vOldSubBinLocQty);
														vNewSubBinLocQty=Number(Big(totalqty).minus(vOldSubBinLocQty));
													}
													nlapiLogExecution('DEBUG', 'vOldSubBinLocText : vNewSubBinLocQty', vOldSubBinLocText +" : "+vNewSubBinLocQty);
													if(parseFloat(vNewSubBinLocQty) > 0)
													{
														if(processType == 'itemfulfillment')
														{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(5)));
														}
														else
														{
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(vNewSubBinLocQty).toFixed(8)));
														}
														compSubRecord.commitLineItem('inventoryassignment');
														//totalqty = parseFloat(totalqty) - parseFloat(vNewSubBinLocQty); 
														totalqty = Number(Big(totalqty).minus(vNewSubBinLocQty)); 
													}
													else
													{
														compSubRecord.removeLineItem('inventoryassignment', r1);
														totalqty = 0; 
														break;
													}
												}
											}
										}
									}
									compSubRecord.commit();
								}
								else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {


									if(vConversionRate == null || vConversionRate == '' || vConversionRate == 'null' || vConversionRate == 'undefined')
									{
										vConversionRate = 1;
									}

									//totalqty = parseFloat(totalqty) * parseFloat(vConversionRate);
									totalqty = Number(Big(totalqty).mul(vConversionRate));
									nlapiLogExecution('DEBUG', 'totalqty after conversion', totalqty);
									var compSubRecord = TransformRec.editCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');

									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

									if( totalqty > 0)
									{
										var tQty =	totalqty;
										if(parseInt(complinelength)>0)
										{
											var vr1 = 1;
											for(var r1=1;r1<=complinelength;r1++)
											{
												compSubRecord.selectLineItem('inventoryassignment',vr1);
												var vOldSubBinLocText = compSubRecord.getCurrentLineItemValue('inventoryassignment', 'binnumber');
												var serialNum = compSubRecord.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');
												if(vOldSubBinLocText == taskactloc && opentaskSerialArr.indexOf(serialNum) != -1 && tQty > 0)
												{
													tQty = parseInt(tQty)-1;
													compSubRecord.removeLineItem('inventoryassignment', 1);
												}
												else
												{
													vr1++;
												}

												if(tQty == 0)
												{
													break;
												}
											}
											compSubRecord.commit();
										}
									}
								}
								TransformRec.commitLineItem(vSubRecordId);
							}
							else
							{
								var logMsg1 = 'picked Qty is Zero =' + newputqty + '<br>';
								logMsg1 = logMsg1 + 'IFLength = ' + IFLength + '<br>';
								logMsg1 = logMsg1 + 'kitItemLenth = ' + kitItemLenth + '<br>';
								logMsg1 = logMsg1 + 'itemIndex = ' + itemIndex + '<br>';
								logMsg1 = logMsg1 + 'processType = ' + processType + '<br>';
																
								nlapiLogExecution('DEBUG', 'parameters', logMsg1);
								
								
								if((IFLength==1) || (IFLength == kitItemLenth))
								{
									TransformRecId = nlapiDeleteRecord(processType, nsrefno);
									nlapiLogExecution('DEBUG', 'Id TransformRecId', TransformRecId);
									TransformRec = 0;
									//return Id;
								}
								else
								{
									if(processType == 'itemfulfillment')
									{
										TransformRec.setLineItemValue(vSubRecordId,'itemreceive',itemIndex,'F');
									}
									else
									{
										
										//TransformRec.removeLineItem(vSubRecordId,itemIndex);
										nlapiLogExecution('DEBUG', 'Into bkjdshkjfelete line',taskbeginloc);
										TransformRecId = inventoryBinTransferpickrev(itemType,whlocation,itemid,Number(Big(taskqty).toFixed(8)),taskactloc,taskbeginloc,
												lotno,'','','','',ordid,serials,StatusId,inventoryStatusFeature);
										//TransformRec.removeCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');
										//TransformRec.commitLineItem(vSubRecordId);

									}
								}

							}
						}
						else
						{							
							var logMsg1 = 'picked Qty is Zero =' + totalqty + '<br>';
							logMsg1 = logMsg1 + 'IFLength = ' + IFLength + '<br>';
							logMsg1 = logMsg1 + 'kitItemLenth = ' + kitItemLenth + '<br>';
							logMsg1 = logMsg1 + 'itemIndex = ' + itemIndex + '<br>';
																					
							nlapiLogExecution('DEBUG', 'parameters1', logMsg1);

							if((IFLength==1) || (IFLength == kitItemLenth))
							{
								TransformRecId = nlapiDeleteRecord(processType, nsrefno);
								nlapiLogExecution('DEBUG', 'Id', TransformRecId);
								TransformRec = 0;
								//return Id;
							}
							else
							{
								if(processType == 'itemfulfillment')
								{
									TransformRec.setLineItemValue(vSubRecordId,'itemreceive',itemIndex,'F');
								}
								else
								{
									nlapiLogExecution('DEBUG', 'Into bitransfer delete line');

									TransformRec.removeLineItem(vSubRecordId,itemIndex);
									//TransformRec.removeCurrentLineItemSubrecord(vSubRecordId,'inventorydetail');
									//TransformRec.commitLineItem(vSubRecordId);

								}
							}
						}
					}
				}
				
				nlapiLogExecution('DEBUG', 'Before Submit TransformRec', TransformRecId);

				if(processType == 'itemfulfillment')
				{
					nlapiLogExecution('DEBUG', 'Before Submit TransformRecID value', TransformRec);
					if(TransformRec != null && TransformRec != '' && TransformRec != 'null' && TransformRec != 'undefined' && TransformRec != 0) 
					{
						TransformRecId = nlapiSubmitRecord(TransformRec, true);
						nlapiLogExecution('DEBUG', 'After Submit', TransformRecId);
						//Id= TransformRecId;
					}
				}

				if(((TransformRecId != null && TransformRecId != '' && TransformRecId != 'null' && TransformRecId != 'undefined') || (TransformRec != 0))&&(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")&&(processType != 'itemfulfillment' || vBinTrIntId == null || vBinTrIntId == '' ||  vBinTrIntId == 'null' ||  vBinTrIntId == 'undefined'))
				{
					var logMsg1 = 'ordlineno =' + ordlineno + '<br>';
					logMsg1 = logMsg1 + 'ordid = ' + ordid + '<br>';
					nlapiLogExecution('DEBUG', 'parameters ord', logMsg1);
					//fetch serials from serial entry
					var filters = new Array();
					var serialArray='';
					//filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
					filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseInt(ordlineno));									
					filters[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', ordid);
					var columns = new Array();
					//columns[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
					//columns[1] = new nlobjSearchColumn('name');
					var SrchRecordSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filters,columns);
					nlapiLogExecution('DEBUG','SrchRecordSerial', SrchRecordSerial);
					if(SrchRecordSerial != null && SrchRecordSerial != '')
					{
						for(var m=0;m<SrchRecordSerial.length;m++)
						{
							if(opentaskSerialArr.indexOf(SrchRecordSerial[m].getValue('custrecord_wmsse_ser_no')) != -1)
							{
								var vRecId=SrchRecordSerial[m].getId();
								nlapiLogExecution('DEBUG', 'Deleted serial entry', vRecId);
								nlapiDeleteRecord('customrecord_wmsse_serialentry', vRecId);
							}
						}
					}
				}

				//}
				//}
			}

		}
		catch(exp)
		{
			nlapiLogExecution('ERROR', 'Exception in updateItemReceipt',exp);
		}
	}

	nlapiLogExecution('DEBUG', 'Out of updateItemReceipt',TransformRecId);

	return TransformRecId;
}

function inventoryBinTransferpickrev(itemType,whLocation,itemId,quantity,fromBinId,toBinId,batchno,actualBeginTime,vUnits,vStockConversionRate,
		opentaskQty,ordno,serials,StatusId,inventoryStatusFeature)
{

	//var skt=nlapiLoadRecord('bintransfer',1076);
	var REC_TYPE = 'bintransfer';
	var binTransfer= nlapiCreateRecord(REC_TYPE);
	nlapiLogExecution('DEBUG', 'StatusId', StatusId);

	nlapiLogExecution('DEBUG', 'serials', serials);
	binTransfer.setFieldValue('location', whLocation);
	binTransfer.setFieldValue('trandate', DateStamp());


	binTransfer.selectNewLineItem('inventory');
	binTransfer.setCurrentLineItemValue('inventory', 'item', itemId);

	binTransfer.setCurrentLineItemValue('inventory', 'quantity', quantity);
	//binTransfer.setCurrentLineItemValue('inventory', 'preferredbin', '7');
	if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") 
	{
		var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
		compSubRecord.selectNewLineItem('inventoryassignment');
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', quantity);
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);       
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
		if(StatusId != null && StatusId != '' && StatusId != 'null' && StatusId != 'undefined' && StatusId != undefined)
		{
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', StatusId);
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'toinventorystatus', StatusId);
		}

		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);                                                                                                                                            
		compSubRecord.commitLineItem('inventoryassignment');
		compSubRecord.commit();
		var compSubRecord=null;
	}
	else
	{
		if(inventoryStatusFeature == true)
		{
			var filterssertemp = new Array();
			filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', ordno));
			filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', itemId));

			var columnssertemp1 = new Array();
			//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			//columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp,columnssertemp1);
			nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial1', SrchRecordTmpSerial1);
			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 !='')
			{
				var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
				for (var n = 0; n < Math.min(SrchRecordTmpSerial1.length,quantity); n++) 
				{

					if(serials.indexOf(SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'))==-1)
					{
						quantity = quantity+1;
						continue;
					}
					compSubRecord.selectNewLineItem('inventoryassignment');
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'));
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);       
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
					if(StatusId != null && StatusId != '' && StatusId != 'null' && StatusId != 'undefined' && StatusId != undefined)
					{
						compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', StatusId);
						compSubRecord.setCurrentLineItemValue('inventoryassignment', 'toinventorystatus', StatusId);
					}
					compSubRecord.commitLineItem('inventoryassignment');

				}
				compSubRecord.commit();
				compSubRecord=null;
				for (var j = 0; j < Math.min(SrchRecordTmpSerial1.length,quantity); j++) {
					var TempRecord=SrchRecordTmpSerial1[j];		

					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of inventory move completed for serial number  we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
					TempRecord=null;
				}
			}
			SrchRecordTmpSerial1= null;
			filterssertemp=null;
			columnssertemp1= null;
		}
		else
		{
			var filterssertemp = new Array();
			//filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
			//filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 9));//9--Move
			//filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', toBinId));
			filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', ordno));
			filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', itemId));
			var columnssertemp1 = new Array();
			//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			//columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp,columnssertemp1);
			nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial1', SrchRecordTmpSerial1);
			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 !='')
			{
				var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
				for (var n = 0; n < Math.min(SrchRecordTmpSerial1.length,quantity); n++) {
					compSubRecord.selectNewLineItem('inventoryassignment');
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'));
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);       
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
					compSubRecord.commitLineItem('inventoryassignment');

				}
				compSubRecord.commit();
				compSubRecord=null;
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];
					nlapiLogExecution('DEBUG', 'TempRecord.getValue(name)',TempRecord.getValue('name'));
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of inventory move completed for serial number  we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
					TempRecord=null;
				}
			}
			SrchRecordTmpSerial1= null;
			filterssertemp=null;
			columnssertemp1= null;
		}
	}
	binTransfer.commitLineItem('inventory');

	var inventoryCountId = nlapiSubmitRecord(binTransfer);
	var taskType="MOVE";
	var Qty = quantity;
	if(opentaskQty != null && opentaskQty != '' && opentaskQty != 'null' && opentaskQty != 'undefined')
	{
		Qty = opentaskQty;
	}
	//To update/create open task with Move task type
	updateMoveOpenTask(itemType,whLocation,itemId,Qty,fromBinId,toBinId,batchno,inventoryCountId,taskType,'','',actualBeginTime,vUnits,vStockConversionRate);
	binTransfer=null;
	return inventoryCountId;
}
