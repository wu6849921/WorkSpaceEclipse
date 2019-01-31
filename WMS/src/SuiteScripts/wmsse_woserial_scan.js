/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function WorkOrderPickingSerial(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';

		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getWONo = request.getParameter('custparam_woid');

		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var whCompany= request.getParameter('custparam_company');
		var getWONo = request.getParameter('custparam_woid');
		var getWOItem = request.getParameter('custparam_woitem');
		var getWOLineNo = request.getParameter('custparam_lineno');
		var enteredStatus = request.getParameter('custparam_inventorystatus');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getWOInternalId = request.getParameter('custparam_wointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemainingQty = request.getParameter('custparam_rem_qty');	
		var getItemEnteredQty = request.getParameter('custparam_enterQty');
		var getItemReceivedQty = request.getParameter('custparam_rec_qty');		
		var getItemRecQty = request.getParameter('custparam_number');
		var screenName = request.getParameter('custparam_screen');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		if(getItemRecQty==null || getItemRecQty=='' || getItemRecQty=='null')
			getItemRecQty=0;
		var enteredBin=request.getParameter('custparam_enteredbin');
		var enteredQty =  request.getParameter('custparam_enteredqty'); 
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var vUnits = request.getParameter("custparam_uom"); 
		var vUnitsText = request.getParameter("custparam_uomtext"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate'); 
		var selecteduomswithqty = request.getParameter('custparam_uomqtyselected'); 
		var binInternalId = request.getParameter('custparam_binInternalId');															  
		var stageFlag = request.getParameter('custparam_hdnCloseflag');
		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		if(vUnitsText == '- None -' || vUnitsText == '' || vUnitsText == null)
			vUnitsText ='';
		if(vConversionRate == '- None -' || vConversionRate == '' || vConversionRate == null)
			vConversionRate =1;
		var getItemRemQty = (parseFloat(getItemEnteredQty) * parseFloat(vConversionRate))-parseFloat(getItemRecQty);
		var errMsg='';
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "Work Order#";

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_woqty_item_srh', itemfilters, itemcolumns);
		if(itemresults!=null && itemresults!='')
		{
			getWOItem = itemresults[0].getValue('itemid');
		}
		var vStageScanRequired="F";

		vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',whLocation,'4');		

		if(vStageScanRequired!=null && vStageScanRequired!='')
		{ 
			vStageScanRequired="T";			 
		}
		else
		{
			vStageScanRequired="F";
		}

		var str='getOptedField :'+getOptedField+ '<br>';
		str=str + 'getWONo :'+getWONo+ '<br>';		
		str=str + 'whLocation:'+whLocation+ '<br>';
		str=str + 'getWOItem:'+getWOItem+ '<br>';
		str=str + 'getItemRemainingQty:'+getItemRemainingQty+ '<br>';		
		str=str + 'vStageScanRequired:'+vStageScanRequired+ '<br>';	
		nlapiLogExecution('Debug', 'WOSerial Get ', str);

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		var domainName = fndomainName();

		var st0 = domainName + '-Picking Work Order';
		var getPreferBin=request.getParameter('custparam_preferbin');
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;

		if(parseInt(getNumber)==0)
		{
			var filterssertemp1 = new Array();
			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', getWOLineNo);
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', getWOInternalId);
			var columnssertemp1 = new Array();
			columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry','customsearch_wmsse_wo_serialentry_srh', filterssertemp1,columnssertemp1);

			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
			{	
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];

					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of discontinue of serial number scanning we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
				}

			}	
		}

		if (CSSfilefound) 
		{ 
			CSSurl = CSSfilefound.getURL();
		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
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

		html = html +"<script type='text/javascript'>function validateForm() {var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtserial').value; var vSerialWhiteSpace = lotVal.indexOf(' ') >= 0; if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;}  else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking - Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getWONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+
		"				<input type='hidden' name='hdnItemReceivedQty' value=" + getItemReceivedQty + ">"+ 
		"				<input type='hidden' name='hdnItemRemainingQty' value=" + getItemRemainingQty + ">"+
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWoInternalId' value=" + getWOInternalId + ">"+
		"				<input type='hidden' name='hdnWoLineno' value=" + getWOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnWoItem' value='" + getWOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnbinInternalId' value=" + binInternalId + ">"+																		  
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnstatusscreen' value='" +screenName+"'>"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' value=" + selecteduomswithqty + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuomtext' value=" + vUnitsText + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnvStageScanRequired' value='" +vStageScanRequired+"'>"+
		"				<input type='hidden' name='hdnStageflag'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	

		"			<tr><td align = 'left' class='labelmsg'>Item: <label>" + getWOItem + "</label></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Entered Bin: <label>" + enterBin + "</label>"+
		"			</tr>";

		if(enteredStatus != null && enteredStatus != '' && enteredStatus != 'null' && enteredStatus != 'undefined' && enteredStatus != undefined)
		{
			var vInventoryStatus = '';
			var hdnInvtStatusText = request.getParameter('hdnInvtStatusText');
			if(hdnInvtStatusText != '' && hdnInvtStatusText != null && hdnInvtStatusText != 'null' && hdnInvtStatusText != 'undefined')
			{
				vInventoryStatus = hdnInvtStatusText;
			}
			else
			{
				vInventoryStatus = getInventoryStatusListForOutBound(-1,enteredStatus);
				if(vInventoryStatus.length>0)
				{
					vInventoryStatus = vInventoryStatus[0][0];
				}
			}
			html =html+ "			<tr>"+
			"			<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
			"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + vInventoryStatus + "'>"+	
			"				<input type='hidden' name='hdninventorystatus' id = 'hdninventorystatus' value='" + enteredStatus + "'>"+	
			"			</tr>";

		}

		html =html+"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + (parseFloat(getItemRecQty)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + (parseFloat(getItemRemQty)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF <label>" + (parseFloat(request.getParameter('custparam_enterQty')) * parseFloat(vConversionRate)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";
		html = html + "<td align = 'left'><input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>";

		html = html + "				</td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/>";
		if(vStageScanRequired == "T" && ((parseFloat(getNumber) + 1)==(parseFloat(request.getParameter('custparam_enterQty')) * parseFloat(vConversionRate))) )
		{
			html = html +"	<tr><td>	<input name='cmdStage' type='submit' value='Pick & Stage' onclick='return validateForm();'/></td><td colspan='2'></td></tr>";
		}
		html = html +"			</tr>"+
		"		 </table>";
		html = html + "</form>"+

		"<script type='text/javascript'>document.getElementById('txtserial').focus();</script>";
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			var JSfile = getLoadFile('wmsse_uomfunctions.js');
			var JSSurl ='';
			if (JSfile) 
			{ 
				JSSurl = JSfile.getURL();
			}

			if(JSSurl != null && JSSurl != '')
			{
				html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
			}
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array WOarray
		var WOarray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtserial');
		var cmdStage = request.getParameter('hdnStageflag');
		WOarray["custparam_enteredbin"] = request.getParameter('custparam_enteredbin');
		WOarray["custparam_enteredqty"] = request.getParameter('custparam_enteredqty');	
		WOarray['custparam_rec_qty']=request.getParameter('hdnItemReceivedQty');
		WOarray["custparam_woid"] = request.getParameter('custparam_woid');
		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		WOarray["custparam_option"] = request.getParameter('hdnOptedField');
		WOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		WOarray["custparam_wointernalid"] = request.getParameter('hdnWoInternalId');
		WOarray["custparam_lineno"] = request.getParameter('hdnWoLineno');
		WOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		WOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemainingQty');
		WOarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		WOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		WOarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		WOarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		WOarray["custparam_inventorystatus"] = request.getParameter('hdninventorystatus');
		WOarray["custparam_hdnCloseflag"] = cmdStage;	
		WOarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		WOarray["custparam_enterBin"] = request.getParameter('hdnenterBin');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		WOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		WOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty'); 
		WOarray["custparam_uom"] = request.getParameter('hdnuom');
		WOarray["custparam_uomtext"] = request.getParameter('hdnuomtext');
		WOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		WOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var vConversionRate = request.getParameter('hdnvConversionRate');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var trantype=request.getParameter('hdntrantype');
		var statusScreen = request.getParameter('hdnstatusscreen');
		WOarray["custparam_screen"]=statusScreen;
		var remQty=request.getParameter('hdnenterQty');
		var woInternalId=request.getParameter('hdnWoInternalId');
		var whLocation =request.getParameter('hdnWhLocation');
		var recQty=request.getParameter('hdnItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var woLineno=request.getParameter('hdnWoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		var status = request.getParameter('hdninventorystatus');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var getNumber=parseFloat(request.getParameter('hdnNumber'));
		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');

		var binInternalId = request.getParameter('hdnbinInternalId');													   
		var logMsg = 'WO = ' + WOarray["custparam_woid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'woInternalId = ' + woInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'woLineno = ' + woLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'vConversionRate = ' + vConversionRate + '<br>';
		logMsg = logMsg + 'status = ' + status + '<br>';
		logMsg = logMsg + 'getSerialNo = ' + getSerialNo + '<br>';
		logMsg = logMsg + 'cmdStage = ' + cmdStage + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		nlapiLogExecution('Debug', 'Processing RF - Serial', logMsg);
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				var inventoryStatusFeature = isInvStatusFeatureEnabled();

				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				var binInternalId=nswms_GetBinInternalId(enterBin,whLocation);
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){

					if(getSerialNo!=null && getSerialNo!="" && getSerialNo!='null')
					{
						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
						if(whLocation != null && whLocation !='' && whLocation != null)
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
						}
						var itemcolumns= new Array();

						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_woqty_item_srh', itemfilters, itemcolumns);							

						if(itemresults == null || itemresults == '' || itemresults == 'null')
						{
							WOarray["custparam_error"] = 'Entered item is inactive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
							return;
						}
						if(inventoryStatusFeature == true)
						{
							var getSerialNoId = inventoryNumberInternalId(getSerialNo,WOarray["custparam_whlocation"],FetchedItemId);

							var filterStrat = new Array();

							if(binInternalId != null && binInternalId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber',null,'anyof', binInternalId));
							filterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
							filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', WOarray["custparam_whlocation"]));
							if(getSerialNoId != null && getSerialNoId != '' && getSerialNoId != 'null')
								filterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', getSerialNoId));
							filterStrat.push(new nlobjSearchFilter('status', null, 'anyof', status));

							objBinDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterStrat, null);

							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('Debug', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									var serial_matchfound='F';
									for(var i =0; i<objBinDetails.length; i++)
									{
										var availableQty=objBinDetails[i].getValue('available',null,'group');
										var vinventorynumber=objBinDetails[i].getText('inventorynumber',null,'group');


										if(vinventorynumber == getSerialNo)
										{
											serial_matchfound='T';
											break;
										}

									}
									if(serial_matchfound =='F')
									{
										WOarray["custparam_error"] = 'Serial#: '+ getSerialNo + ' is not available';
										response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
										return;
									}
								}
								else
								{
									objBinDetails='';
								}
							}

						}
						else
						{	
							var filterStrat = new Array();
							if(binInternalId == null || binInternalId == '' || binInternalId == 'null' || binInternalId == undefined)
							{
								binInternalId=nswms_GetBinInternalId(enterBin,whLocation);
							}


							if(binInternalId != null && binInternalId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
							filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
							filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', WOarray["custparam_whlocation"]));
							filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

							var columnStrat=new Array();
							columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
							columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
							columnStrat[0].setSort(true);

							var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

							if(objBinDetails!=null && objBinDetails!='')
							{

								if(objBinDetails.length>0)
								{
									var availableQty=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
									var vinventorynumber=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');
									nlapiLogExecution('Debug', 'enterQty,availableQt,vinventorynumber', enterQty+","+availableQty+","+vinventorynumber);
									if(vinventorynumber != getSerialNo)
									{
										WOarray["custparam_error"] = 'Serial# not in storage: '+getSerialNo;
										response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
										return;
									}

								}
								else
								{
									objBinDetails='';
								}
							}
						}
						if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' ||objBinDetails.length < 1)
						{
							WOarray["custparam_error"] = 'Serial# not in storage: '+getSerialNo;
							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
							return;
						}

						var toBinInternalId =fnGetWIPBinDetails(WOarray["custparam_whlocation"]);

						if(toBinInternalId=='' || toBinInternalId==null)
						{
							WOarray["custparam_number"]=parseFloat(WOarray["custparam_number"])-1;
							WOarray["custparam_error"] = 'Please configure wip location';
							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
							return;
						}

						//checking serial no's in already scanned one's from temp table
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', woLineno));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', woInternalId));

						var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry','customsearch_wmsse_wo_serialentry_srh', filterssertemp);
						nlapiLogExecution('Debug', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{

							WOarray["custparam_error"] = "Serial# already scanned";
							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
							return;
						}								
						else 
						{
							WOarray["custparam_serialno"] = getSerialNo;
							WOarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
						}
						//Here we are creating serial# into new Temp Serial entry custom record

						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', getSerialNo);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordno', woInternalId);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordline', woLineno);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', FetchedItemId);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
						customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 9);
						customrecord.setFieldValue('custrecord_wmsse_ser_bin', toBinInternalId);
						var rec = nlapiSubmitRecord(customrecord, false, true);


						if ((Number(getNumber) + 1) < (Number(Big(remQty).mul(vConversionRate)))) {

							WOarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
							return;

						}
						else
						{
							try
							{
								var woLineDetails = getWOLineDetailsNew(WOarray["custparam_woid"],WOarray["custparam_whlocation"],FetchedItemId,woLineno);
								if(woLineDetails !=null && woLineDetails!="")
								{
									nlapiLogExecution('Debug', 'woLineDetails.length', woLineDetails.length);
									if(woLineDetails.length>0)
									{
										var totalpickQtyIndex =7;
										var comittedQtyIndex =15;
										var builtQtyIndex =16;
										var unitsIndex =14;
										var coversionRateIndex =17;
										var vColumnslist=woLineDetails[0].getAllColumns();
										for(var x1=0;x1<vColumnslist.length;x1++)
										{
											var summaryLabel = vColumnslist[x1].getLabel();
											var name = vColumnslist[x1].getName();

											if(name == 'unit')
											{
												unitsIndex =x1;
											}
											else if(summaryLabel == 'Committed Quantity')
											{
												comittedQtyIndex = x1;
											}
											else if(summaryLabel == 'Built Quantity')
											{
												builtQtyIndex = x1;
											}
											else if(summaryLabel == 'Conversion Rate')
											{
												coversionRateIndex = x1;
											}
											else
											{

											}
										}
										var isItemFound = false;
										for(var cnt=0;cnt<woLineDetails.length;cnt++)
										{
											var vwoitemQty = woLineDetails[cnt].getValue('quantity');
											var itemCommitedQty=woLineDetails[cnt].getValue(vColumnslist[comittedQtyIndex]);
											var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);

											var opentaskDetails=getopentaskDetailsforSku(WOarray["custparam_wointernalid"],woLineno,FetchedItemId);											
											var itemPickedQty = opentaskDetails[0].getValue('custrecord_wmsse_act_qty',null,'sum');

											if(itemPickedQty==null || itemPickedQty=='' || itemPickedQty =='null' || itemPickedQty =='undefined')
											{
												itemPickedQty = 0;
											}

											if(itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
											{
												itemCommitedQty=woLineDetails[cnt].getValue('quantity');
											}

											if(vwoitemRcvQty == null || vwoitemRcvQty =='')
												vwoitemRcvQty = 0;
											if(itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
											{
												var itemRemQty=Big(itemCommitedQty).minus(itemPickedQty);
											}
											else
											{
												itemCommitedQty=new Big(itemCommitedQty);
												vwoitemRcvQty=new Big(vwoitemRcvQty);
												itemPickedQty=new Big(itemPickedQty);

												var itemRemQty=((itemCommitedQty).plus(vwoitemRcvQty)).minus(itemPickedQty);
											}


											var vwoitem = woLineDetails[cnt].getValue('item');
											var vwoitemline = woLineDetails[cnt].getValue('line');
											if((parseFloat(itemRemQty)>0) && (vwoitem == FetchedItemId) && (woLineno == vwoitemline))
											{
												isItemFound= true;
												if(vStageScanRequired == "T")
												{
													toBinInternalId=binInternalId;
												}

												var id = updateOpenTaskWO(woInternalId,FetchedItemId,woLineno,Number(Big(enterQty).toFixed(8)),toBinInternalId,itemType,
														WOarray["custparam_whlocation"],'','','','',woInternalId,null,null,null,'PICK','','','','','workorder',
														WOarray["custparam_actualbegintime"],'','','','','','',binInternalId,WOarray["custparam_uom"],
														WOarray["custparam_conversionrate"],'','','',status);
												nlapiLogExecution('ERROR', 'opentaskid', id);	

												try{
													if(vStageScanRequired == "F")
													{														

														var binTransferId = inventoryBinTransfer(itemType,WOarray["custparam_whlocation"],FetchedItemId,
																Number((Big(enterQty).mul(WOarray["custparam_conversionrate"])).toFixed(8)),binInternalId,toBinInternalId,
																'','','','','',status,status);
														nlapiLogExecution('Debug', 'Bin Transfered successfully', binTransferId);
														if(binTransferId != null && binTransferId != '' && id != null && id != '')
														{
															var fields = new Array();
															var values = new Array();
															fields[0] = 'custrecord_wmsse_nstrn_ref_no';
															values[0] = binTransferId;

															var updOpenTaskRecordId=nlapiSubmitField('customrecord_wmsse_trn_opentask', id, fields, values);
														}
														break;
													}

												}				
												catch(e)
												{
													nlapiLogExecution('ERROR', 'inside catch exception', e);

													if ( e instanceof nlobjError )
													{
														WOarray["custparam_error"]=e.getDetails();
														nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
													}
													else
													{
														WOarray["custparam_error"]=e.toString();
														nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
													}
													WOarray["custparam_number"]=parseFloat(WOarray["custparam_number"])-1;
													response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
													return;
												}
											}

										}
										if(isItemFound == false)
										{
											WOarray["custparam_number"]=parseFloat(WOarray["custparam_number"])-1;
											WOarray["custparam_error"] ='Scanned qty is greater than remaining qty';
											response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
											return;
										}
									}
								}
								else
								{
									WOarray["custparam_error"] = 'Entered item is deleted from the order';
									response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
									return;
								}

								var woLineDetails = getWOLineDetailsNew(WOarray["custparam_woid"],WOarray["custparam_whlocation"],null,null);
								var cmdStage = request.getParameter('cmdStage');
								nlapiLogExecution('Debug','cmdStage',cmdStage);

								if(woLineDetails !=null && woLineDetails!="" && cmdStage != 'Pick & Stage')
								{
									nlapiLogExecution('ERROR', 'woLineDetails.length', woLineDetails.length);
									if(woLineDetails.length>0)
									{
										var vColumnslist=woLineDetails[0].getAllColumns();
										var totalpickQtyIndex =7;
										var comittedQtyIndex =15;
										var builtQtyIndex =16;
										var unitsIndex =14;
										var coversionRateIndex =17;
										var totalWOQty = 0;
										for(var x1=0;x1<vColumnslist.length;x1++)
										{
											var summaryLabel = vColumnslist[x1].getLabel();
											var name = vColumnslist[x1].getName();
											if(name == 'unit')
											{
												unitsIndex =x1;
											}
											else if(summaryLabel == 'Committed Quantity')
											{
												comittedQtyIndex = x1;
											}
											else if(summaryLabel == 'Built Quantity')
											{
												builtQtyIndex = x1;
											}
											else if(summaryLabel == 'Conversion Rate')
											{
												coversionRateIndex = x1;
											}
											else
											{

											}
										}
										for(var cnt=0;cnt<woLineDetails.length;cnt++)
										{
											var vwoitemQty = woLineDetails[cnt].getValue('quantity');
											var itemCommitedQty=woLineDetails[cnt].getValue(vColumnslist[comittedQtyIndex]);
											var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);
											var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);
											var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);

											if(vwoitemRcvQty == null || vwoitemRcvQty =='')
												vwoitemRcvQty = 0;
											if(itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
											{
												itemCommitedQty=woLineDetails[cnt].getValue('quantity',null,'sum');
											}
											if(itemCommitedQty == null || itemCommitedQty =='' || itemCommitedQty=='null')
											{
												itemCommitedQty=0;
											}

											totalWOQty=new Big(totalWOQty);
											itemCommitedQty=new Big(itemCommitedQty);
											vwoitemRcvQty=new Big(vwoitemRcvQty);

											totalWOQty = (totalWOQty).plus(itemCommitedQty).plus(vwoitemRcvQty);
										}

										var pickedQty  = getopentaskDetails(WOarray["custparam_wointernalid"]); 
										if(pickedQty == '' || pickedQty == null || isNaN(pickedQty))
										{
											pickedQty = 0;
										}


										var itemRemQty = Big(totalWOQty).minus(pickedQty);

										if((parseFloat(itemRemQty)>0))
										{	
											WOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
											return;
										}
										if(vStageScanRequired == "F")
										{	
											WOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
											return;
										}
										else
										{
											WOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_wostage_scan', 'customdeploy_wmsse_wostage_scan', false, WOarray);
											return;
										} 

									}
									else
									{
										WOarray["custparam_error"] ='';
										response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
										return;
									}
								}
								else
								{
									WOarray["custparam_error"] =''; 
									if(vStageScanRequired == "T")
										response.sendRedirect('SUITELET', 'customscript_wmsse_wostage_scan', 'customdeploy_wmsse_wostage_scan', false, WOarray);
									else
										response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
									return;   
								}
							}				
							catch(e)
							{
								nlapiLogExecution('ERROR', 'inside catch exception', e);

								if ( e instanceof nlobjError )
								{
									WOarray["custparam_error"]=e.getDetails();
									nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
								}
								else
								{
									WOarray["custparam_error"]=e.toString();
									nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
								}
								WOarray["custparam_number"]=parseFloat(WOarray["custparam_number"])-1;
								response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
								return;
							}
						}
					}
					else
					{
						WOarray["custparam_error"] = 'Please enter/scan serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
					}
				} 
				else {
					WOarray["custparam_error"] = "";
					nlapiLogExecution('Debug','status', status);
					var lockfilters=new Array();

					lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',FetchedItemId));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
					if(status != null && status != '' && status != 'null' &&
							status !='undefined' && status != undefined)
					{
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_invtstatus',null,'anyof',status));	
					}
					var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', null, lockfilters, null);

					if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
					{
						var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
						nlapiLogExecution('ERROR','DeleteRecordId', DeleteRecordId);
					}
					if(statusScreen != null && statusScreen != '' && statusScreen != 'null' && statusScreen != 'undefined' 
						&& statusScreen != 'undefined' && statusScreen == 'fromstatusscreen')
					{
						WOarray["custparam_enteredBinID"] = binInternalId;
						response.sendRedirect('SUITELET', 'customscript_wmsse_wopicking_status', 'customdeploy_wmsse_wopicking_status', false, WOarray);
						return;
					}

					response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
					return;
				}
			}
			catch (e) 
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

				if ( e instanceof nlobjError )
				{
					WOarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					WOarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}
				WOarray["custparam_number"]=parseFloat(WOarray["custparam_number"])-1;
				response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			WOarray["custparam_error"] = 'Transaction is in progress...';
			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
		}
	} //end of first if condition
} //end of function.

function getWOLineDetails(wonumber,whLocation,itemID)
{
	nlapiLogExecution('ERROR', 'sonumber,whLocation',wonumber+","+whLocation);

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));

	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID));

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_fulfil_detail', filters, columns);


	return WOLineDetails;
}

function fnGetWIPBinDetails(strLocation)
{
	var wipBinId='';		
	var filterStrat = new Array(); 

	if(strLocation!= null && strLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', strLocation));
	var objBinDetails = new nlapiSearchRecord('bin','customsearch_wip_bindetails',filterStrat, null);
	if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0)
	{
		nlapiLogExecution('Debug','objBinDetails',objBinDetails.length);

		var vValidBin=objBinDetails[0].getValue('binnumber');
		var vValidBinId=objBinDetails[0].getId();

		wipBinId = vValidBinId;
	} 

	return wipBinId;
}

function getWOLineDetailsNew(wonumber,whLocation,itemID,woLineno)
{
	nlapiLogExecution('Debug', 'sonumber,whLocation',wonumber+","+whLocation);

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 

	if(woLineno != null && woLineno != '')
		filters.push(new nlobjSearchFilter('line', null, 'equalto', woLineno)); 

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_item_srh', filters, columns);

	return WOLineDetails;
}

function getopentaskDetailsforSku(woInternalId,lineno,item)
{
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'equalto',lineno));	
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof',item));

	var opentaskColumns =  new Array();

	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);


	return opentaskResults;
}

function getopentaskDetails(woInternalId)
{
	var pickQty = 0;
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

	var opentaskColumns =  new Array();

	var opentaskResultsArray = new Array();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);

	if(opentaskResults !=null && opentaskResults !='')
	{
		nlapiLogExecution('Debug', 'opentaskResults', opentaskResults.length);
		for(var k=0;k<opentaskResults.length;k++)
		{

			pickQty = parseFloat(pickQty) + parseFloat(opentaskResults[k].getValue('custrecord_wmsse_act_qty',null,'sum'));
		}
	}
	return pickQty;
}