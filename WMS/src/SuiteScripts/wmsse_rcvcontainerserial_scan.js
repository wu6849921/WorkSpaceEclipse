/**
 * Script Description
 * This script is used to scan the Serial# for selected item.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function CheckInSerial(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';
		var getCONo = request.getParameter('custparam_containerNo');
		var getContainer = request.getParameter('custparam_container');
		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getPONo = request.getParameter('custparam_potext');
		nlapiLogExecution('ERROR', 'Into Request', getPONo);
		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var getActualBeginDate = request.getParameter('custparam_actualbegindate');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var getActualBeginTimeAMPM = request.getParameter('custparam_actualbegintimeampm');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var orderType=request.getParameter('custparam_ordertype');
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');
		var getPOItem = request.getParameter('custparam_poitem');
		nlapiLogExecution('ERROR','getPOItem', getPOItem);
		var getPOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getPOInternalId = request.getParameter('custparam_pointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_remainingQty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getItemEnteredQty = request.getParameter('custparam_enterQty');
		var getItemReceivedQty = request.getParameter('custparam_number');
		if(getItemReceivedQty==null || getItemReceivedQty=='' || getItemReceivedQty=='null')
			getItemReceivedQty=0;
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getItemRemainingQty = parseInt(getItemEnteredQty)-parseInt(getItemReceivedQty);
		nlapiLogExecution('ERROR','getItemRemQty', getItemRemQty);
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var ConainerInternalId=request.getParameter('custparam_container');
		var getshipmentno='';
		var vSerials = request.getParameter('custparam_vserial');
		
		if(vSerials ==null || vSerials =='' || vSerials=='null' || vSerials =='undefined')
		{
			var filter=new Array();
			if(ConainerInternalId!=null &&ConainerInternalId!='')
				filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgcontainer',null,'anyof',ConainerInternalId));		

			//if(getshipmentno!=null && getshipmentno!='' && getshipmentno!='null')
			//	filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgshipment',null,'is',getshipmentno));		

			if(getFetchedItemId!=null && getFetchedItemId!='')
				filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgitem',null,'anyof',getFetchedItemId));

			var columns = new Array();
			columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgcontainer'));
			columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgitem'));
			columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpono'));
			columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgloc'));
			columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgexpqty'));
			columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgrcvdqty'));
			columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgserialno'));

			var vSearchResults = nlapiSearchRecord('customrecord_wmsse_trailerlinepkgs', null, filter, columns);
			if(vSearchResults !=null && vSearchResults !='')
			{
				nlapiLogExecution('DEBUG', 'vSearchResults.length', vSearchResults.length);
				for(var k=0; k <vSearchResults.length; k++ )
				{
					if(vSerials == null || vSerials =='' || vSerials=='null' || vSerials =='undefined')
						vSerials = vSearchResults[k].getValue('custrecord_wmsse_trllinepkgserialno');
					else
						vSerials = vSerials +","+ vSearchResults[k].getValue('custrecord_wmsse_trllinepkgserialno');

				}
				
			}

		}
		nlapiLogExecution('ERROR', 'vSerials', vSerials);
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;
		nlapiLogExecution('ERROR', 'getNumber', getNumber);
		if(parseInt(getNumber)==0)
		{
			var filterssertemp1 = new Array();
			//filterssertemp1[0] = new nlobjSearchFilter('custrecord_tempserialnumber', null, 'is', getSerialNo);
			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', getPOLineNo);
			//filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', getPONo);
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', getPOInternalId);
			var columnssertemp1 = new Array();
			columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filterssertemp1,columnssertemp1);
			nlapiLogExecution('ERROR', 'getPOInternalId', getPOInternalId);
			nlapiLogExecution('ERROR', 'getPOLineNo', getPOLineNo);
			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
			{	
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];
					nlapiLogExecution('ERROR', 'TempRecord.getId()',TempRecord.getId());
					nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',TempRecord.getValue('name'));
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of discontinue of serial number scanning we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
				}

			}	
		}
		var headerVar='Container';

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var orderedQty = request.getParameter('custparam_oredrquantity');
		var expectedQty = request.getParameter('custparam_expectquantity');
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		nlapiLogExecution('ERROR', 'getItemRemQty :  getItemReceivedQty', getItemRemQty + " : " + getItemReceivedQty);
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+headerVar+' Receiving';
		var getPreferBin=request.getParameter('custparam_preferbin');
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;
		nlapiLogExecution('ERROR', 'getNumber', getNumber);
		


		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			nlapiLogExecution('ERROR', 'imgUrl', imgUrl);
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />"+
		"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";


		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() { if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;} var patt = /[+|,\":<>{}`\';()/ /]/g;var lotVal=document.getElementById('txtserial').value; if(lotVal.match(patt)!=null || lotVal.indexOf('[') !=-1 || lotVal.indexOf(']') != -1){document.getElementById('div_error').innerHTML ='Please enter/scan valid serial#';return false;} else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Receiving Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		//"		<tr><td></td></tr><tr><td></td></tr><tr><td>"+
		"		<table>"+
		//"			<tr border='1'><td align='center'  valign='top'><b>RECEIVING</b></td></tr>"+
		//"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+headerVar+"#: <label>" + getCONo + "</label></td></tr><tr><td align = 'left' class='labelmsg'> PO#: <label>" + getPONo + "</label></td></tr><tr><td align = 'left' class='labelmsg'> Item: <label>" + getPOItem + "</label>"+
		"				<input type='hidden' name='hdnActualBeginDate' value=" + getActualBeginDate + ">"+		
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+	
		"				<input type='hidden' name='hdnActualBeginTimeAMPM' value=" + getActualBeginTimeAMPM + ">"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnordertype' value='" + orderType + "'>"+
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnPoInternalId' value=" + getPOInternalId + ">"+
		"				<input type='hidden' name='hdnPoLineno' value=" + getPOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnPoItem' value=" + getPOItem + ">"+
		"				<input type='hidden' name='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnSerialItemRemainingQty' value=" + getItemRemainingQty + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnSerialnumbers' value=" + vSerials + ">"+
		"				<input type='hidden' name='hdnexpectedQty' value=" + expectedQty + ">"+
		"				<input type='hidden' name='hdnorderedQty' value=" + orderedQty + ">"+
		"				<input type='hidden' name='hdncontainer' value=" + getContainer + ">"+
		"				<input type='hidden' name='hdncontainerNo' value=" + getCONo + ">"+
		"				<input type='hidden' name='hdnPoNo' value=" + getPONo + ">"+
		"				</td>"+
		"			</tr>"+			 
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Ordered Qty: <label>" + orderedQty + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Received Qty: <label>" + getItemReceivedQty + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + getItemRemainingQty + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF <label>" + parseFloat(request.getParameter('custparam_enterQty')) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>"+
		"				</td>"+
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'  type='submit' value='' onclick='return validateForm();'/>"+
		//"					<input name='cmdReceiveFulls' type='submit' value='RECEIVE FULL'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/></td>";
		if((parseFloat(getNumber) + 1) == parseFloat(request.getParameter('custparam_enterQty')))
		{
			html = html + "<td width='20px'></td>";
			html = html + "				<td align = 'left'><input name='cmdSend' type='submit' value='New Container' onclick='return validateForm();'/></td><td width='20px'></td>";
		}
		html = html + "			</tr>"+
		"		 </table>";
		html = html + "</td></tr></table></form>"+

		"<script type='text/javascript'>document.getElementById('txtserial').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtserial');
		var whLocation = request.getParameter('hdnWhLocation');
		POarray["custparam_poid"] = request.getParameter('custparam_poid');
		POarray["custparam_screenno"] = '2';
		POarray["custparam_actualbegindate"] = request.getParameter('hdnActualBeginDate');	
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_customer"] = request.getParameter('hdnCustomer');
		POarray["custparam_actualbegintimeampm"] = request.getParameter('hdnActualBeginTimeAMPM');
		POarray["custparam_trantype"] = request.getParameter('hdntrantype');
		POarray["custparam_pointernalid"] = request.getParameter('hdnPoInternalId');
		POarray["custparam_lineno"] = request.getParameter('hdnPoLineno');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_remainingQty"] = request.getParameter('hdnItemRemQty');
		POarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_poitem"] = request.getParameter('custparam_poitem');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		POarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		POarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		POarray["custparam_enterBin"] = request.getParameter('hdnenterBin');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_po"] = request.getParameter('custparam_po');
		POarray['custparam_containerNo']=request.getParameter('custparam_containerNo');
		POarray['custparam_container']=request.getParameter('custparam_container');
		POarray["custparam_oredrquantity"] = request.getParameter('hdnorderedQty');
		POarray["custparam_expectquantity"] = request.getParameter('hdnexpectedQty');
		POarray["custparam_potext"] = request.getParameter('custparam_potext');
		var orderType=request.getParameter('hdnordertype');
		POarray["custparam_ordertype"]=orderType;
		var trantype=request.getParameter('hdntrantype');
		var actualBeginTime=request.getParameter('hdnActualBeginTime');
		//	var remQty=request.getParameter('hdnSerialItemRemainingQty');
		var poInternalId=request.getParameter('hdnPoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var poLineno=request.getParameter('hdnPoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		//var remQty=request.getParameter('enterQty');
		var remQty=request.getParameter('hdnenterQty');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var getNumber=parseFloat(request.getParameter('hdnNumber'));
		var vSerialNumbers = request.getParameter('hdnSerialnumbers');
		var containernumber=POarray["custparam_container"];
		POarray["custparam_vserial"]=request.getParameter('hdnSerialnumbers');
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);
		var logMsg = 'PO = ' + POarray["custparam_poid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'poInternalId = ' + poInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'poLineno = ' + poLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'vSerialNumbers = ' + vSerialNumbers + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - Serial', logMsg);
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){

					if(getSerialNo!=null && getSerialNo!="" && getSerialNo!='null')
					{
						var optedEventSend = request.getParameter('cmdSend');
						nlapiLogExecution('ERROR', 'optedEventSend', optedEventSend);
						var SrchRecordTmpSerial = new Array ();

						SrchRecordTmpSerial =request.getParameter('custparam_serialno');
						nlapiLogExecution('ERROR', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
						if(vSerialNumbers !=null && vSerialNumbers !='' && vSerialNumbers!='null')
						{
							var vSerialArray= new Array();
							var SerialFlag= false;

							vSerialArray = vSerialNumbers.split(',');
							for (var ct=0; ct<vSerialArray.length; ct++)
							{
								nlapiLogExecution('ERROR', 'vSerialArray [ct]', vSerialArray [ct]);
								if(vSerialArray [ct]==getSerialNo)
								{
									SerialFlag= true;
								}

							}

							nlapiLogExecution('ERROR', 'SerialFlag', SerialFlag);
							if(SerialFlag== false)
							{
								POarray["custparam_error"]= 'Please enter/scan valid serial#';
								response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
								return;
							}

						}
						if((SrchRecordTmpSerial != null && SrchRecordTmpSerial !='' && SrchRecordTmpSerial.length >0 && SrchRecordTmpSerial.indexOf(getSerialNo)!=-1))
						{

							POarray["custparam_error"] = "Serial# already scanned";
							response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
							return;
						}	


						var isSerialExistsInInventory = isInventoryNumberExists(FetchedItemId,getSerialNo,POarray["custparam_whlocation"]);
						nlapiLogExecution('ERROR', 'isSerialExistsInInventory',isSerialExistsInInventory);
						if(isSerialExistsInInventory)
						{
							POarray["custparam_error"] = 'This serial# already exists in inventory';
							response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
							return; 
						}
						else
						{


							//var systemRule=getSystemRuleValue('Manually post item receipts?',POarray["custparam_whlocation"]);
							//nlapiLogExecution('ERROR', 'systemRule', systemRule);

							//if(systemRule!=null && systemRule!='' && systemRule=='Y')
							//{
								var openTaskSerialArray = new Array();
								var filtersseropenTask = new Array();
								/*filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', poLineno));
								filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', poInternalId));*/ 
								filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', FetchedItemId));
								filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['2']));
								filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['3']));
								filtersseropenTask.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));

								var columnsOpenTask = new Array();
								columnsOpenTask.push(new nlobjSearchColumn('custrecord_wmsse_serial_no'));
								var SrchRecordOpenTaskSerial = nlapiSearchRecord('customrecord_wmsse_trn_opentask', null, filtersseropenTask,columnsOpenTask);
								nlapiLogExecution('ERROR', 'SrchRecordOpenTaskSerial', SrchRecordOpenTaskSerial);
								if(SrchRecordOpenTaskSerial != null && SrchRecordOpenTaskSerial != '' && SrchRecordOpenTaskSerial.length > 0)
								{
									for(var p1=0;p1<SrchRecordOpenTaskSerial.length;p1++)
									{
										var opentaskSerial = SrchRecordOpenTaskSerial[p1].getValue('custrecord_wmsse_serial_no');
										if(opentaskSerial != null && opentaskSerial != '' && opentaskSerial != 'null' && opentaskSerial != 'undefined')
										{
											var opentaskSerArray = opentaskSerial.split(',');

											if(opentaskSerArray != null && opentaskSerArray !='' && opentaskSerArray !='null' && opentaskSerArray != 'undefined')
											{
												for(var p3=0;p3<opentaskSerArray.length;p3++)
												{
													var serialNo = opentaskSerArray[p3];

													if(serialNo != null && serialNo !='' && serialNo !='null' && serialNo != 'undefined')
													{
														openTaskSerialArray.push(serialNo);
													}
												}
											}


										}
									}
								}
								nlapiLogExecution('ERROR', 'openTaskSerialArray', openTaskSerialArray);
								if(openTaskSerialArray.indexOf(getSerialNo) != -1)
								{
									POarray["custparam_error"] = 'This serial# already exists in inventory ';
									response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
									return; 
								}
							//}
						}

						nlapiLogExecution('ERROR', 'request.getParameter(custparam_serialno) before', request.getParameter('custparam_serialno'));


						nlapiLogExecution('ERROR', 'INTO SERIAL ENTRY');
						//checking serial no's in already scanned one's from temp table
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', poLineno));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', poInternalId));
						//filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', ['2']));
						var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filterssertemp);
						nlapiLogExecution('ERROR', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{

							POarray["custparam_error"] = "Serial# already scanned";
							response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
							return;
						}								
						else {

							POarray["custparam_serialno"] = getSerialNo;

							POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
						}
						//Here we are creating serial# into new Temp Serial entry custom record
						var binInternalId=nswms_GetBinInternalId(enterBin);
						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', getSerialNo);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordno', poInternalId);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordline', poLineno);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', FetchedItemId);
						customrecord.setFieldValue('custrecord_wmsse_ser_bin', binInternalId);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
						customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 2);
						var rec = nlapiSubmitRecord(customrecord, false, true);

						nlapiLogExecution('ERROR', '(getNumber + 1)', (parseInt(getNumber) + 1));
						nlapiLogExecution('ERROR', 'remQty', remQty);
						if ((parseInt(getNumber) + 1) < parseInt(remQty)) {
							nlapiLogExecution('ERROR', 'Scanning Serial No.');
							POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
							if(request.getParameter('custparam_serialno') != null && request.getParameter('custparam_serialno') !='' && request.getParameter('custparam_serialno') !='null' && request.getParameter('custparam_serialno') != 'undefined')
							{
								POarray["custparam_serialno"] = request.getParameter('custparam_serialno')+","+getSerialNo;
							}
							else
							{
								POarray["custparam_serialno"] = getSerialNo;
							}
							POarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
							return;

						}
						else
						{
							try{
								if(request.getParameter('custparam_serialno') != null && request.getParameter('custparam_serialno') !='' && request.getParameter('custparam_serialno') !='null' && request.getParameter('custparam_serialno') != 'undefined')
								{
									POarray["custparam_serialno"] = request.getParameter('custparam_serialno')+","+getSerialNo;
								}
								else
								{
									POarray["custparam_serialno"] = getSerialNo;
								}
								nlapiLogExecution('ERROR', 'inside if', itemType);
								var containerRec = getPkgContainerDetails(containernumber,whLocation,POarray["custparam_pointernalid"],FetchedItemId);
								//var containerRec = nlapiLoadRecord('customrecord_coco_lc_shipping_folio',request.getParameter('hdnPoInternalId'));
								if(containerRec != null && containerRec != '' && containerRec != 'null' && containerRec.length>0)
								{
									//var itemSubListCount = containerRec.getLineItemCount('recmachcustrecord_coco_lc_line_folio_number');
									var vTotalExp=0;
									var vnenterQty=0;
									for(var j=0 ; j<containerRec.length ; j++)
									{
										var poRecList = containerRec[j];
										var lineNo = poRecList.getValue('custrecord_wmsse_trllinepkgpolineno');
										if(parseInt(lineNo) == parseInt(request.getParameter('hdnPoLineno')))
										{
											var receivedQty = poRecList.getValue('custrecord_wmsse_trllinepkgrcvdqty');
											var vExpQty = poRecList.getValue('custrecord_wmsse_trllinepkgexpqty');
											if(request.getParameter('custparam_serialno') != null && request.getParameter('custparam_serialno') !='' && request.getParameter('custparam_serialno') !='null' && request.getParameter('custparam_serialno') != 'undefined')
											{
												var receivedSerial = poRecList.getValue('custrecord_wmsse_trllinepkgserialno');
												nlapiLogExecution('ERROR', 'receivedSerial', receivedSerial);

											}
											if(receivedQty == null || receivedQty == '' || receivedQty == 'null' || receivedQty =='undefined')
											{
												receivedQty =0;
											}
											if(vExpQty == null || vExpQty == '' || vExpQty == 'null' || vExpQty =='undefined')
											{
												vExpQty =0;
											}
											
											vTotalExp=parseFloat(vExpQty)-parseFloat(enterQty);
											
											vnenterQty = parseFloat(enterQty)+parseFloat(receivedQty);
											
											//poRecList.setFieldValue('custrecord_wmsse_trllineexpqty',vTotalExp);
											//poRecList.setFieldValue('custrecord_wmsse_trllinepkgrcvdqty',enterQty);
											var fields = new Array();
											var values = new Array();
											//fields[0] = 'custrecord_wmsse_trllinepkgexpqty';
											//values[0] = vTotalExp;
											fields[0] = 'custrecord_wmsse_trllinepkgrcvdqty';
											values[0] = vnenterQty;
											//fields[2] = 'custrecord_wmsse_trllinepkgserialno';
											//values[2] = receivedSerial;
											var submitRecordId=nlapiSubmitField('customrecord_wmsse_trailerlinepkgs', containerRec[j].getId(), fields, values);
											nlapiLogExecution('ERROR', 'submitRecordId', submitRecordId);
										}

									}
									var containerlineRec = getContainerDetails(containernumber,whLocation,POarray["custparam_pointernalid"],FetchedItemId);
									if(containerlineRec != null && containerlineRec != '' && containerlineRec != 'null' && containerlineRec.length>0)
									{
										var fields1 = new Array();
										var values1 = new Array();
										//fields1[0] = 'custrecord_wmsse_trllineexpqty';
										//values1[0] = vTotalExp;
										fields1[0] = 'custrecord_wmsse_trllineqtyrcvd';
										values1[0] = vnenterQty;
										var submitRecordId1=nlapiSubmitField('customrecord_wmsse_trailerline', containerlineRec[0].getId(), fields1, values1);
										nlapiLogExecution('ERROR', 'submitRecordId1', submitRecordId1);
									}

								}
								updateOpenTask(POarray["custparam_pointernalid"],FetchedItemId,request.getParameter('hdnPoLineno'),enterQty,binInternalId,itemType,whLocation,'','','','',POarray["custparam_potext"],'','','','PUTW','','','','','purchaseorder',actualBeginTime,'','','','','','','','','','','','','','','',containernumber);
								
								UpdateRestlet('edit',POarray["custparam_pointernalid"],containernumber,request.getParameter('hdnPoLineno'),FetchedItemId,enterQty,POarray["custparam_serialno"] )
								
								/*if(optedEventSend == 'Save (Ent)')*/
								if(optedEventSend == 'New Container')
								{	
									
									
									POarray["custparam_error"] = '';
									response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
									return;
									
									
								}
								else
								{
									var redirectFlag="F";
									var filter1=new Array();
									if(containernumber!=null&&containernumber!=''&&containernumber!='null')
										filter1.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber',null,'anyof',containernumber));	

									var containerSearchResults=nlapiSearchRecord('customrecord_wmsse_trailerline','customsearch_wmsse_trlline_summary',filter1,null);
									if(containerSearchResults!=null && containerSearchResults!='' && containerSearchResults!='null')
									{
										for(var b=0;b<containerSearchResults.length;b++)
										{
											var totalQty = containerSearchResults[b].getValue('custrecord_wmsse_trllineordqty',null,'sum');
											var expQty = containerSearchResults[b].getValue('custrecord_wmsse_trllineexpqty',null,'sum');
											var rcvd = containerSearchResults[b].getValue('custrecord_wmsse_trllineqtyrcvd',null,'sum');
											var rem = parseFloat(expQty)-parseFloat(rcvd);
											if(parseFloat(rem)>0)
											{
												redirectFlag="T";
												break;
											}
										}
									}
									nlapiLogExecution('ERROR', 'redirectFlag', redirectFlag);
									if(redirectFlag=="T")
									{
										POarray["custparam_error"] = '';
										response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
										return;	
									}
									else
									{
										POarray["custparam_error"] = '';
										response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
										return;
									}
								}

							}

							catch(e)
							{
								nlapiLogExecution('ERROR', 'inside catch exception', e);
								if ( e instanceof nlobjError )
								{
									POarray["custparam_error"]=e.getDetails();
									nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
								}
								else
								{
									POarray["custparam_error"]=e.toString();
									nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
								}

								response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
								return;
							}
						}
					}
					else
					{
						POarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
						return;
					}
				}
				else {
					POarray["custparam_error"] = '';
					response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
					return;
				}
			}
			catch(e)
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

				if ( e instanceof nlobjError )
				{
					POarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					POarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}

				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
				return;
			}
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			POarray["custparam_error"]="Transaction is in progress...";
			response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
			return;
		}

	} //end of first if condition
} //end of function.


function getContainerDetails(containernumber,whLocation,pointernalid,itemId)
{
	var filter = new Array();
	if(containernumber!=null && containernumber!='' && containernumber!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber',null,'anyof',containernumber));		
	if(pointernalid!=null && pointernalid!='' && pointernalid!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepono',null,'anyof',pointernalid));
	if(whLocation!=null && whLocation!='' && whLocation!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinelocation',null,'anyof',whLocation));
	if(itemId!=null && itemId!='' && itemId!='null' && itemId !='undefined')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllineitem',null,'anyof',itemId));
	
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trlnumber'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepono'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepolineno'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineqtyrcvd'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineexpqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineitem'));	
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinelocation'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineordqty'));
	var ContainerDetails = nlapiSearchRecord('customrecord_wmsse_trailerline', null, filter, columns);
	
	return ContainerDetails;
}

function getPkgContainerDetails(containernumber,whLocation,pointernalid,itemId)
{
	var filter = new Array();
	if(containernumber!=null && containernumber!='' && containernumber!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgcontainer',null,'anyof',containernumber));		
	if(pointernalid!=null && pointernalid!='' && pointernalid!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgpono',null,'anyof',pointernalid));
	if(whLocation!=null && whLocation!='' && whLocation!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgloc',null,'anyof',whLocation));
	if(itemId!=null && itemId!='' && itemId!='null' && itemId !='undefined')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgitem',null,'anyof',itemId));
	
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgcontainer'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpono'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpolineno'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgrcvdqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgexpqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgitem'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkglot'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgloc'));	
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgordqty'));	
	var ContainerDetails = nlapiSearchRecord('customrecord_wmsse_trailerlinepkgs', null, filter, columns);

	return ContainerDetails;
}
function UpdateRestlet(Type,PoId,ContainerNo,PoLineNo,PoItem,PoItemQtyEntered,serials)
{

	/*var url = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=739&deploy=1';

	var cred = new credentials();
	               
	var headers = {"User-Agent-x": "SuiteScript-Call",
	               "Authorization": "NLAuth nlauth_account=" + cred.account + ", nlauth_email=" + cred.email +
	                                ", nlauth_signature= " + cred.password + ", nlauth_role=" + cred.role,
	               "Content-Type": "application/json"};
	               

	var jsonobj= {"Container":[{"Type":"edit","Location": "5",
	              "name": "TR12345",
	              "ContainerNo": "5"}],
	              "ContainerLine":[{"Type":"edit","location": "4",
	                     "ContainerNo": "5",
	                     "PONo": "120451"},
	                     {"Type":"edit","location": "4",
	                           "ContainerNo": "5",
	                           "PONo": "120451"}]};               
	//Stringifying JSON
	var myJSONText = JSON.stringify(jsonobj, replacer);
	 
	var response = nlapiRequestURL(url, myJSONText , headers,'POST');*/
	 
	       nlapiLogExecution('ERROR', 'response',response );
	 

	
	 
	
	
}
function replacer(key, value){
    if (typeof value == "number" && !isFinite(value)){
        return String(value);
   }
    return value;
}
function credentials(){
    this.email = "radhika.mukkera@ebizscm.com";
    this.account = "TSTDRV889282";
    this.role = "3";
    this.password = "nswms1";
}
