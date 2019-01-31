/**
 * Script Description
 * This script is used to scan serials for bin putaway process
 */ 
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan serial numbers for bin putaway process
 */
function RFStgInvtSerialScan(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var getOptedField = request.getParameter('custparam_option');
		
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');
		var uomqtyselected = request.getParameter('custparam_uomqtyselected');
		var whLocationName = request.getParameter('custparam_whlocationname');
		
		var whCompany= request.getParameter('custparam_company');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');
		var availableQty=request.getParameter('custparam_availableqty');
		var enterBin=request.getParameter('custparam_enterBin');
		var invt_status = request.getParameter('custparam_toinventorystatus');
		var fromInvt_Status = request.getParameter('custparam_inventorystatus');
		var fromscreen = request.getParameter('custparam_fromscreen');
		var blnMixItem=request.getParameter('custparam_blnmixitem');
		var blnMixLot=request.getParameter('custparam_blnmixlot'); 
		var getPreferBin=request.getParameter('custparam_preferbin');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterToBin=request.getParameter('custparam_enterToBin');
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate');
		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;
		var vUnitsText = request.getParameter('custparam_baseunit');
		var blnItemUnit = request.getParameter('custparam_itemunits');
		var enteredBinId = request.getParameter('custparam_enteredBinID');
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		
		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		

		var domainName = fndomainName();
		
		var st0 = domainName + '-Stage Bin Transfer';
		var getPreferBin=request.getParameter('custparam_preferbin');
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;
		nlapiLogExecution('ERROR', 'getNumber', getNumber);
		if(parseFloat(getNumber)==0)
		{
			var filterssertemp1 = new Array();
			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 9);//9--Move
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', enterToBin);
			var columnssertemp1 = new Array();
			//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			//columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp1,columnssertemp1);
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

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));		
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
		if(itemresults!=null && itemresults!='')
		{
			getFetchedItemName = itemresults[0].getValue('itemid');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('DEBUG', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			nlapiLogExecution('DEBUG', 'imgUrl', imgUrl);
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
		"	<script type='text/javascript'>function validateForm() { var serialscanned = document.getElementById('txtserial').value; var WhiteSpace = serialscanned.indexOf(' ') >= 0; if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';document.getElementById('txtserial').value ='';return false;}else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Stage Bin Transfer - Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Scanned Qty: <label>" + getNumber + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnEnterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnAvailableQty' id='hdnAvailableQty' value=" + availableQty + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnlotno' value=" + lotno + ">"+
		"				<input type='hidden' name='hdnEnterToBin' value=" + enterToBin + ">"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+	
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnvUnitsText' id='hdnvUnitsText' value='" + vUnitsText + "'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' value='" + uomqtyselected + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnEnteredBinId' id = 'hdnEnteredBinId' value='" + enteredBinId + "'>"+
		"				<input type='hidden' name='hdnFromScreen' id='hdnFromScreen' value=" + fromscreen + ">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF <label>" + enterQty + "</label>"+
		"			</tr>";
		if(inventoryStatusFeature == true)
		{
			if(invt_status != null && invt_status != '' && invt_status != 'null' && invt_status != 'undefined')
			{
				var vInventoryStatus ='';
				var hdnInvtStatusText = request.getParameter('hdnInvtStatusText');
				if(hdnInvtStatusText != '' && hdnInvtStatusText != null && hdnInvtStatusText != 'null' && hdnInvtStatusText != 'undefined')
				{
					vInventoryStatus = hdnInvtStatusText;
				}
				else
				{
					var inventoryStatusLst = getInventoryStatusListForOutBound(-1,invt_status);

					if(inventoryStatusLst.length > 0)
					{
						vInventoryStatus = inventoryStatusLst[0][0];
					}
				}
				html =html+ "			<tr>"+
				"			<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
				"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + vInventoryStatus + "'>"+	
				"				<input type='hidden' name='hdnInvtStatus' id = 'hdnInvtStatus' value='" + invt_status + "'>"+	
				"				<input type='hidden' name='hdnFromInvtStatus' id = 'hdnFromInvtStatus' value='" + fromInvt_Status + "'>"+
				"			</tr>";

			}

		}
		html=html+"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>";
		html = html + "	 <input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>";
		html = html + "	 </td>"+
		"			</tr></table><tr><td><table>"+

		"			<tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink'  value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/>"+		 
		"				</td>"+
		"			</tr>";  
		"		 </table>";
		html = html + "</td></tr></table></form>"+

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
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating Serial');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtserial');
		nlapiLogExecution('DEBUG', 'getSerialNo',getSerialNo);
		if(getSerialNo !=null && getSerialNo!='' && getSerialNo !='null')
		{
			getSerialNo =getSerialNo.trim();
		}
		nlapiLogExecution('DEBUG', 'getSerialNo',getSerialNo);

		POarray["custparam_inventorystatus"] = request.getParameter('hdnFromInvtStatus');
		POarray["custparam_toinventorystatus"] = request.getParameter('hdnInvtStatus');
		POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		POarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		POarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		POarray["custparam_enterBin"] = request.getParameter('hdnEnterBin');
		POarray["custparam_enterToBin"] = request.getParameter('hdnEnterToBin');
		POarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');		
		POarray["custparam_lotno"] =request.getParameter('hdnlotno');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_fetcheditemname"]=request.getParameter('custparam_fetcheditemname');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_enterBin"] = request.getParameter('hdnEnterBin');
		POarray["custparam_availableqty"] = request.getParameter('hdnAvailableQty');
		POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		var enteredBinId = request.getParameter('hdnEnteredBinId');
		POarray["custparam_enteredBinID"]=  enteredBinId;

		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;
		POarray["custparam_unitstext"] = request.getParameter('hdnvUnitsText');	
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		var availableQty=request.getParameter('hdnAvailableQty');
		var itemType=request.getParameter('hdnItemType');
		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var lotno= request.getParameter('hdnlotno');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var optedEvent = request.getParameter('cmdPrevious');
		var preferBin=request.getParameter('hdnPreferBin');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		POarray["custparam_fromscreen"] = request.getParameter('hdnFromScreen');

		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnEnterBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var getNumber=parseFloat(request.getParameter('hdnNumber'));
		var toBinInternalId=request.getParameter('hdnEnterToBin');
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
						var serialArray = new Array();
						var serialString = request.getParameter('hdnSerialArr');
						if(serialString != null && serialString != '')
						{
							serialArray = serialString.split(',');

							if(serialArray.indexOf(getSerialNo)!=-1)
							{
								POarray["custparam_error"] = 'This serial#: '+getSerialNo+' already  scanned';
								response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
								return;
							}
						}
						nlapiLogExecution('DEBUG', 'After Serial No Parsing', getSerialNo);
						nlapiLogExecution('DEBUG', 'request.getParameter(custparam_serialno) before', request.getParameter('custparam_serialno'));
						var binInternalId=nswms_GetBinInternalId(enterBin,POarray["custparam_whlocation"]);
						nlapiLogExecution('DEBUG', 'binInternalId', binInternalId);

						var objBinDetails = null;
						var inventoryStatusFeature = isInvStatusFeatureEnabled();
						if(inventoryStatusFeature == true)
						{
							var getSerialNoId = inventoryNumberInternalId(getSerialNo,POarray["custparam_whlocation"],FetchedItemId)

							var filterStrat = new Array();
							if(binInternalId != null && binInternalId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber',null,'anyof', binInternalId));
							filterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
							filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', POarray["custparam_whlocation"]));
							if(getSerialNoId != null && getSerialNoId != '' && getSerialNoId != 'null')
								filterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', getSerialNoId));
							filterStrat.push(new nlobjSearchFilter('status', null, 'anyof', POarray["custparam_inventorystatus"]));


							objBinDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterStrat, null);
							nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails);
							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									var serial_matchfound='F';
									for(var i =0; i<objBinDetails.length; i++)
									{
										var availableQty=objBinDetails[i].getValue('available',null,'group');
										var vinventorynumber=objBinDetails[i].getText('inventorynumber',null,'group');
										nlapiLogExecution('ERROR', 'enterQty,availableQt,vinventorynumber', enterQty+","+availableQty+","+vinventorynumber);
										if(vinventorynumber == getSerialNo)
										{
											serial_matchfound='T';
											break;
										}

									}
									if(serial_matchfound =='F')
									{
										POarray["custparam_error"] = 'Scanned / Entered Serial# "'+getSerialNo+'" is not in this stage Location ';
										response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
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
							if(binInternalId != null && binInternalId != '')
								filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
							filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
							filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
							filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));


							var columnStrat=new Array();
							columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
							columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
							columnStrat.push(new nlobjSearchColumn('usebins'));
							columnStrat[0].setSort(true);

							var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

							if(objBinDetails!=null && objBinDetails!='')
							{
								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails.length);
								if(objBinDetails.length>0)
								{
									var availableQty=objBinDetails[0].getValue('quantityavailable','inventoryNumberBinOnHand');
									var vinventoryNumberBinOnHand=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');
									nlapiLogExecution('DEBUG', 'availableQty', availableQty);
									nlapiLogExecution('DEBUG', 'inventoryNumberBinOnHand', vinventoryNumberBinOnHand);
									var useBins =  objBinDetails[0].getValue('usebins');
									nlapiLogExecution('ERROR', 'useBins', useBins);
									if(useBins == 'F')
									{
										POarray["custparam_error"] = 'Please select usebins flag for this item.';
										response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
										return;
									}
									if(parseInt(availableQty) <= 0 || (getSerialNo != vinventoryNumberBinOnHand))
									{
										POarray["custparam_error"] = 'Scanned / Entered Serial# "'+getSerialNo+'" is not in this stage Location ';
										response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
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
							nlapiLogExecution('DEBUG', 'objBinDetails inside null', '');
							POarray["custparam_error"] =  'Scanned / Entered Serial# '+getSerialNo+' is not in this stage Location ';
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
							return;
						}

						nlapiLogExecution('DEBUG', 'INTO SERIAL ENTRY');
						//checking serial no's in already scanned one's from temp table
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 9));//9--Move
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', toBinInternalId));

						var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp);
						nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{

							POarray["custparam_error"] = "Serial# already scanned";
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
							return;
						}								
						else {

							POarray["custparam_serialno"] = POarray["custparam_serialno"]+","+getSerialNo;
							POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
						}
						//Here we are creating serial# into new Temp Serial entry custom record

						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', getSerialNo);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', FetchedItemId);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
						customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						customrecord.setFieldValue('custrecord_wmsse_ser_bin', toBinInternalId);
						customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 9);
						var rec = nlapiSubmitRecord(customrecord, false, true);

						nlapiLogExecution('DEBUG', '(getNumber + 1)', (parseInt(getNumber) + 1));
						nlapiLogExecution('DEBUG', 'enterQty', enterQty);
						if ((parseInt(getNumber) + 1) < parseInt(enterQty)) {
							nlapiLogExecution('ERROR', 'Scanning Serial No.');
							POarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
							return;

						}
						else
						{
							try{


								nlapiLogExecution('DEBUG', 'toBinInternalId', toBinInternalId);
								nlapiLogExecution('DEBUG', 'binInternalId', binInternalId);
								var openTaskQty = Number(Big(enterQty).div(getStockConversionRate).toFixed(8));
								var binTransferId= inventoryBinTransfer(itemType,POarray["custparam_whlocation"],FetchedItemId,Number(Big(enterQty).toFixed(8))
										,binInternalId,toBinInternalId,lotno,'',POarray["custparam_itemunits"],getStockConversionRate
										,openTaskQty,POarray["custparam_inventorystatus"],POarray["custparam_toinventorystatus"]);
								nlapiLogExecution('ERROR', 'Bin Transfered successfully', binTransferId);

								response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, POarray);
								return;


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
								POarray["custparam_number"] =0;
								response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
								return;
							}
						}
					}
					else
					{
						POarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
						return;
					}
				} 
				else {
					POarray["custparam_error"] = "";
					response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
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
				response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.

