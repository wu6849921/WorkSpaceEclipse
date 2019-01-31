/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function 
 */
function BinputawayStatusScan(request, response)
{
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	if (request.getMethod() == 'GET') 
	{
		var statusScanScreenFlag = 'T';
		var getOptedField = request.getParameter('custparam_option');		
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');

		var html = '';

		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var whLocation = request.getParameter('custparam_whlocation');
		var whCompany= request.getParameter('custparam_company');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var itemType=request.getParameter('custparam_itemtype');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var vUnits = request.getParameter("custparam_uom"); //CHK
		var vConversionRate = request.getParameter("custparam_conversionrate"); //CHK
		var VUnitType = request.getParameter("custparam_unittype");
		var enteredBin = request.getParameter('custparam_enterBin'); 
		var eneteredBinId = request.getParameter('custparam_enteredBinId'); 
		var enteredLot = request.getParameter('custparam_enteredlot');
		var lotNo = request.getParameter('custparam_lotno');
		var binAvailableQty = request.getParameter('custparam_binAvailableqty');
		var getItem = request.getParameter('custparam_fetcheditemname');
		var enteredQty = ''; 
		var toBinFlag = request.getParameter('custparam_toBinFlag');
		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		if(toBinFlag == 'T')
		{
			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			{
				enteredQty = request.getParameter('custparam_enteredQtyStatusScan');
			}
			else
			{
				enteredQty = request.getParameter('custparam_enteredQtyStatusScan'); 
			}
		}
		else
		{
			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			{
				enteredQty = request.getParameter('custparam_lotavailableqty');
			}
			else
			{
				enteredQty = request.getParameter('custparam_availableqty');
			}
		}

		var POarray = new Array();
		POarray["custparam_enteredlot"] = enteredLot;
		POarray["custparam_whlocation"] = whLocation;
		POarray["custparam_company"] = whCompany;
		POarray["custparam_option"] = getOptedField;
		POarray["custparam_actualbegintime"] = getActualBeginTime;
		POarray["custparam_fetcheditemid"] = getItemInternalId;

		POarray["custparam_uom"] = vUnits;
		POarray["custparam_conversionrate"] = vConversionRate;
		POarray["custparam_enterBin"] = request.getParameter('custparam_enterBin');
		POarray["custparam_lotavailableqty"] = request.getParameter('custparam_lotavailableqty');		
		POarray["custparam_enteredBinID"] = eneteredBinId;	
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);

		var st0 = domainName + '-Bin Putaway Status';
		var getPreferBin='';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}

		var invfilterStrat =  new Array();
		if(whLocation != null && whLocation != '' && whLocation != 'null')
			invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
		if(getItemInternalId != null && getItemInternalId != '' && getItemInternalId != 'null')
			invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', getItemInternalId));
		if(eneteredBinId!= null && eneteredBinId!= '' && eneteredBinId!= 'null')
			invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', eneteredBinId));
		if(enteredLot != null && enteredLot != '' && enteredLot != 'null')
			invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', enteredLot));
		var vStatusDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);

		var vStatusDetailsArr =  new Array();
		var eneteredLotTxt = '';
		if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined' && vStatusDetails != undefined && 
				vStatusDetails.length != null && vStatusDetails.length >0)
		{
			nlapiLogExecution('DEBUG', 'vStatusDetails length', vStatusDetails.length);

			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
				vOpenPickDetails = getOPenTaskPickBinDetailsLot(getItemInternalId,eneteredBinId,whLocation,VUnitType,vUnits);
			else
				vOpenPickDetails = getOPenTaskPickBinDetails(getItemInternalId,eneteredBinId,whLocation,VUnitType,vUnits,'','');

			if((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem" || itemType == "lotnumberedinventoryitem" || 
					itemType=="lotnumberedassemblyitem"))
			{
				eneteredLotTxt = vStatusDetails[0].getText('inventorynumber',null,'group');

				var statusArr = new Array();

				for(var statusItr=0; statusItr<vStatusDetails.length; statusItr++)
				{
					var status = vStatusDetails[statusItr].getText('status',null,'group');
					var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');
					var statusId = vStatusDetails[statusItr].getValue('status',null,'group');
					var openPickQty = 0;
					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{

						var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinLotArr = vOpenPickDetails[3]
						var	vBinStatusArr = vOpenPickDetails[5];
						if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined' && 
								vBinStatusArr != undefined)
						{
							for(var binItr=0; binItr<vBinStatusArr.length; binItr++)
							{
								var stsArr = vBinStatusArr[binItr].split('_');
								var stsID = stsArr[1];
								if(stsID == statusId)
								{
									openPickQty = vOpenPickQtyArr[binItr];
									break;
								}
							}
						}						
					}
					vBinQtyAvail = Number(Big(vBinQtyAvail).minus(openPickQty));
					if(statusArr.indexOf(statusId)==-1)
					{
						var currRow = [status,vBinQtyAvail,statusId];
						statusArr.push(statusId);
						vStatusDetailsArr.push(currRow);
					}
					else
					{
						var indx = statusArr.indexOf(statusId);
						var Row = vStatusDetailsArr[indx];
						var qty = Row[1];
						var totalQty = Big(qty).plus(vBinQtyAvail);
						var currRow = [status,totalQty,statusId];
						vStatusDetailsArr[indx]=currRow;
					}
				}
			}
			else
			{
				for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
				{
					var status = vStatusDetails[statusItr].getText('status',null,'group');
					var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');
					var statusId = vStatusDetails[statusItr].getValue('status',null,'group');

					var openPickQty = 0;
					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{
						var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinStatusArr = vOpenPickDetails[3];
						if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined' && 
								vBinStatusArr != undefined)
						{
							for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
							{
								var stsArr = vBinStatusArr[binItr];									
								if(stsArr == statusId)
								{
									openPickQty = vOpenPickQtyArr[binItr];
									break;
								}
							}
						}
					}

					vBinQtyAvail = Number(Big(vBinQtyAvail).minus(openPickQty));
					var currRow = [status,vBinQtyAvail,statusId];
					vStatusDetailsArr.push(currRow);
				}
			}
		}

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
			nlapiLogExecution('DEBUG', 'imgUrl', imgUrl);
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		CSSfilefound=null;

		var functionkeyHtml=getFunctionkeyScriptSE('_rf_binputaway_status');

		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "'" +
			" type='text/css' rel='stylesheet'>";	
		html = html +functionkeyHtml;

		//This function is to validate the form when Enter button or save button is clicked.
		html = html + "<script type='text/javascript'>function validate_selectedStatus(statusId){" +
		"	document.getElementById('hdnenetedstatus').value = statusId;document.forms['_rf_binputaway_status'].submit();" +
		"document.getElementById('loading').style.display = 'block'; return true;}</script>";

		html = html + "</head><body onkeydown='return OnKeyDown_CL();'> ";


		html = html +"	<form name='_rf_binputaway_status' method='POST'><input name='cmdSend1' type='submit'  class='defaultlink'   value='' onclick=' return validateForm_soQtySingle();'/>"+ 	

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Bin Putaway Status</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+ 	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnstatuschangevalue' id='hdnstatuschangevalue' value=" + vConversionRate + ">"+			
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+	
		"				<input type='hidden' name='hdnItemType' id='hdnItemType' value=" + itemType + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+		
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+
		"				<input type='hidden' name='hdnenteredbin' id='hdnenteredbin' value='" +enteredBin+"' >"+
		"				<input type='hidden' name='hdnenteredqty' id='hdnenteredqty' value='" +enteredQty+"' >"+
		"				<input type='hidden' name='hdnbinAvailableQty' id='hdnbinAvailableQty' value='" +binAvailableQty+"' >"+
		"				<input type='hidden' name='hdnenteredbinid' id='hdnenteredbinid' value='" +eneteredBinId+"' >"+
		"				<input type='hidden' name='hdnenetedstatus' id='hdnenetedstatus'>"+
		"				<input type='hidden' name='hdnenteredlot' id='hdnenteredlot' value='" +enteredLot+"' >"+
		"				<input type='hidden' name='hdnenteredlot' id='hdnenteredlot' value='" +enteredLot+"' >"+
		"				<input type='hidden' name='hdnlotNo' id='hdnlotNo' value='" +lotNo+"' >"+
		"				<input type='hidden' name='hdnstatusScanScreenFlag' id='hdnstatusScanScreenFlag' value='" +statusScanScreenFlag+"' >"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value='" +VUnitType+"' >"+
		"				<input type='hidden' name='hdngetItem' id='hdngetItem' value='" +getItem+"' >"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getItem  + "</label>"+
		"			</tr>"+		 
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enteredBin + " </label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Available Qty: <label>" + parseFloat(parseFloat(enteredQty).toFixed(8)) + " "+vUnits+"</label>"+
		"			</tr>";
		if(itemType == 'lotnumberedinventoryitem' || itemType == 'lotnumberedassemblyitem' )
		{
			html=html+	"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Lot#: <label>"+eneteredLotTxt+"</label>"+
			"			</tr>";

		}

		var errorMsgValue='';
		if(vStatusDetailsArr !=null && vStatusDetailsArr!='' && vStatusDetailsArr.length > 0)
		{
			html = html + 	" <tr><td></td></tr><tr><td></td></tr><tr ><td  ><table  style='border-spacing: 0;' id='tblqtyUOM'>";			


			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td  class='status-rw-display'>Inv Status"+	
			"				</td>"+
			"				<td colspan ='2'></td><td align = 'right' class='listheadertdleft listheadertextb uir-column-medium'>Qty"+	
			"				</td>";			

			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			for(var b=0;b<vStatusDetailsArr.length;b++)
			{
				if(b%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';


				var currValues = vStatusDetailsArr[b];
				var vStatus = currValues[0];
				var vQty = currValues[1];
				var vStatusId = currValues[2];

				if(vStatus != null && vStatus != undefined &&
						vStatus != 'null' && vStatus != 'undefined' && vStatus != '')
				{
					var strInvtStatusArray = vStatus.split(' ');
					nlapiLogExecution('DEBUG', 'strInvtStatusArray', strInvtStatusArray.length+''+vStatus);
					if(strInvtStatusArray.length > 1 && strInvtStatusArray != null && strInvtStatusArray != undefined &&
							strInvtStatusArray != 'null' && strInvtStatusArray != 'undefined' && strInvtStatusArray != '')
					{
						vStatus = getInvtStatusStr(strInvtStatusArray);
					}
				}

				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td class='status-cl-display'><a  onclick='return validate_selectedStatus(\""+vStatusId+"\");' href='#' >"+vStatus;	
				html = html +"				</a></td>";
				html = html +"				<td align = 'right' >";	
				html = html +"			</td>";

				html = html +"				<td></td>";
				html = html +"				<td align = 'right' class='labelmsg'>"+vQty;
				html = html +"				</td>";

				html = html +"			</tr>";
			}
			html = html + 	"</table></td></tr>";
		}
		html = html +"	<tr><td></td></tr>	<tr><td></td></tr>	<tr>	<td align = 'left'>";
		html = html +"				<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td>" +		
		"			</td></tr>";
		html = html + 	"</table>";
		html = html +"				<input type='hidden' name='hdnerrorMsgValue' id='hdnerrorMsgValue' value=" + errorMsgValue + ">";
		html = html +"				<input type='hidden' name='hdnvStatus' id='hdnvStatus' value='" + vStatus + "'>";
		html = html + "</form>";		
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
	else
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var enteredQty=request.getParameter('hdnenteredqty');	
		var enteredQtyStatusScan = request.getParameter('hdnenteredqty');	
		var binAvailableQty = request.getParameter('hdnbinAvailableQty');
		var enteredBin=request.getParameter('hdnenteredbin');
		var enteredStatus = request.getParameter('hdnenetedstatus');
		var vStatus = request.getParameter('hdnvStatus');

		var enteredLot = request.getParameter('hdnenteredlot');
		var lotNo = request.getParameter('hdnlotNo');
		POarray["custparam_statusScanScreenFlag"] = request.getParameter('hdnstatusScanScreenFlag');
		nlapiLogExecution('ERROR', 'POarray["custparam_statusScanScreenFlag"]',POarray["custparam_statusScanScreenFlag"]);
		POarray["custparam_enteredlot"] = enteredLot;
		POarray["custparam_enteredQtyStatusScan"] = enteredQtyStatusScan;
		POarray["custparam_unittype"] = request.getParameter('hdnVUnitType');
		POarray["custparam_fetcheditemname"] = request.getParameter('hdngetItem');
		POarray["custparam_lotno"] = lotNo;		
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_binAvailableqty"] = binAvailableQty;	
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');		
		POarray["custparam_itemtype"]=request.getParameter('hdnItemType');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');	
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		POarray["custparam_uom"] = request.getParameter('hdnuom');
		POarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		POarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');		
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		POarray["custparam_enterBin"] = request.getParameter('hdnenteredbin');
		POarray["custparam_lotavailableqty"] = request.getParameter('hdnenteredqty');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var eneteredBinId = request.getParameter('hdnenteredbinid');
		POarray["custparam_enteredBinID"] = eneteredBinId;
		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 

		var itemType=request.getParameter('hdnItemType');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button

		var logMsg = 'SO = ' + POarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'enteredQty = ' + enteredQty + '<br>';
		logMsg = logMsg + 'optedEvent = ' + optedEvent + '<br>';
		logMsg = logMsg + 'enterBin = ' + enteredBin + '<br>';	
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';		
		logMsg = logMsg + 'enteredStatus = ' + enteredStatus + '<br>';		
		logMsg = logMsg + 'sessionobj = ' + sessionobj + '<br>';
		logMsg = logMsg + 'context.getUser() = ' + context.getUser() + '<br>';
		logMsg = logMsg + 'itemType111 = ' + itemType + '<br>';

		nlapiLogExecution('DEBUG', 'Processing RF - QTY', logMsg);

		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
		{
			POarray["custparam_availableqty"]=request.getParameter('custparam_availableqty');
		}
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
				if(optedEvent != 'Back (F7)')
				{
					if(enteredStatus!=null && enteredStatus!="" && enteredStatus!='null' )
					{
						try
						{			
							var invstatusid='';
							var invstatusname ='';
							var filterPrefInv = new Array();

							if(FetchedItemId != null && FetchedItemId != '' && FetchedItemId != 'null')
								filterPrefInv.push(new nlobjSearchFilter('internalid','item','anyof', FetchedItemId));
							if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '' && POarray["custparam_whlocation"]!= '')
								filterPrefInv.push(new nlobjSearchFilter('location',null, 'anyof', POarray["custparam_whlocation"]));
							if(enteredStatus != null && enteredStatus != '' && enteredStatus != 'null')
								filterPrefInv.push(new nlobjSearchFilter('status',null, 'anyof', enteredStatus));
							if(eneteredBinId != null && eneteredBinId != '' && eneteredBinId != 'null')
								filterPrefInv.push(new nlobjSearchFilter('binnumber',null, 'anyof', eneteredBinId));
							if(enteredLot != null && enteredLot != '' && enteredLot != 'null')
								filterPrefInv.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', enteredLot));

							var objBinDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterPrefInv, null);
							if(objBinDetails != null && objBinDetails != '')
							{
								if(objBinDetails.length != null)
								{
									var tavailableQty=0;
									for(var aVailQty=0;aVailQty<objBinDetails.length;aVailQty++)
									{
										tavailableQty=Number(Big(tavailableQty).plus(objBinDetails[aVailQty].getValue('available',null,'sum')));
									}
									invstatusid = objBinDetails[0].getValue('status',null,'group');
									invstatusname = objBinDetails[0].getText('status',null,'group');


									POarray["custparam_lotavailableqty"] = tavailableQty;

								}
								else
								{
									objBinDetails='';
								}
							}
							POarray["custparam_error"] ='';
							POarray["custparam_invstatusid"] =invstatusid;
							POarray["custparam_invstatusname"] =invstatusname;
							POarray["custparam_availableqty"] =tavailableQty;
							POarray["custparam_enterBin"] =enteredBin;

							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
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


							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_status_scan', 'customdeploy_wmsse_bp_status_scan', false, POarray);
							return; 
						}

					}
					else
					{
						POarray["custparam_error"] = 'Please select status';				
						response.sendRedirect('SUITELET', 'customscript_wmsse_bp_status_scan', 'customdeploy_wmsse_bp_status_scan', false, POarray);
					}
				} 
				else 
				{
					POarray["custparam_error"] ='';
					POarray["custparam_status"] =enteredStatus;
					POarray["custparam_lotavailableqty"] =Number(enteredQty);
					POarray["custparam_enterBin"] =enteredBin;
					nlapiLogExecution( 'DEBUG', 'itemType', itemType);
					if(POarray["custparam_itemtype"] == 'inventoryitem' || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem" || itemType=='assemblyitem')
					{
						response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
					}					
					else
					{
						response.sendRedirect('SUITELET', 'customscript_wmsse_bp_lot_scan', 'customdeploy_wmsse_bp_lot_scan', false, POarray);
					}
				}
			}
			catch (e) 
			{

				nlapiLogExecution('Debug', 'Exception: ', e);
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
				response.sendRedirect('SUITELET', 'customscript_wmsse_bp_status_scan', 'customdeploy_wmsse_bp_status_scan', false, POarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			POarray["custparam_error"] = 'Transaction Is In Progress...';
			response.sendRedirect('SUITELET', 'customscript_wmsse_bp_status_scan', 'customdeploy_wmsse_bp_status_scan', false, POarray);
		}
	} //end of first if condition
} //end of function.


