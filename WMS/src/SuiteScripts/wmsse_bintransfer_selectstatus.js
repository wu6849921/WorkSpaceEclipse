/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function 
 */
function StatusScan(request, response)
{
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');
		var whLocationName = request.getParameter('custparam_whlocationname');
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var availableQty=request.getParameter('custparam_availableqty');
		var availableqtyDetail=request.getParameter('custparam_availableqtyDetail');
		var enteredBin=request.getParameter('custparam_enterBin');
		var blnMixItem=request.getParameter('custparam_blnmixitem');
		var blnMixLot=request.getParameter('custparam_blnmixlot'); 
		var getPreferBin=request.getParameter('custparam_preferbin');
		var vInvLotId=request.getParameter('custparam_vInvLotId');
		var toBinScreenFlag = request.getParameter('custparam_toBinScreenFlag');
		var availableLotQty = '';
		if(toBinScreenFlag == 'T')
		{
			availableLotQty=request.getParameter('custparam_statusScanQuantity');
		}
		else
		{
			availableLotQty=request.getParameter('custparam_lotavailableqty');
		}

		var vBaseUnit = request.getParameter('custparam_baseunit');
		var vUnitsText = request.getParameter('custparam_unitstext');	
		var VUnitType = request.getParameter('custparam_itemunitstype');
		var blnItemUnit = request.getParameter('custparam_itemunits');
		var eneteredBinId = request.getParameter('custparam_enteredBinID');
		var enteredLot = request.getParameter('custparam_enteredlot');
		var vbarcodecompstring = request.getParameter('custparam_bcComponents');

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var getStockConversionRate = request.getParameter('custparam_stockconversionrate');
		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;

		nlapiLogExecution('ERROR', 'vUnitsText:getStockConversionRate', vUnitsText+":"+getStockConversionRate);
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));

		var itemcolumns= new Array();
		//itemcolumns.push(new nlobjSearchColumn('preferredbin'));
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		/*itemcolumns.push(new nlobjSearchColumn('binnumber'));
		itemcolumns.push(new nlobjSearchColumn('name'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_item'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_lot'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemgroup'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemfamily'));
		itemcolumns.push(new nlobjSearchColumn('stockunit'));
		itemcolumns.push(new nlobjSearchColumn('unitstype'));*/
		if(departments == true)
			itemcolumns.push(new nlobjSearchColumn('department'));
		if(classes == true)
			itemcolumns.push(new nlobjSearchColumn('class'));
		//itemcolumns.push(new nlobjSearchColumn('location','binnumber'));
		//itemcolumns[0].setSort(true);

		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inventory_itemdetails', itemfilters, itemcolumns);
		var strItemGrp="";
		var strItemFam="";
		var blnMixItem="F";
		var blnMixLot="F";
		var blnItemUnit="";
		var VUnitType ="";
		var Vdepartment ="";
		var Vclass ="";
		if(itemresults!=null && itemresults!='')
		{
			for(var d=0;d<itemresults.length;d++)
			{
				if(itemresults[d].getValue('preferredbin')=="T" && itemresults[d].getValue('location','binnumber') == whLocation)
				{
					getPreferBin = itemresults[d].getValue('binnumber');
				}
			}
			blnMixItem = itemresults[0].getValue('custitem_wmsse_mix_item');
			blnMixLot = itemresults[0].getValue('custitem_wmsse_mix_lot');
			strItemGrp = itemresults[0].getValue('custitem_wmsse_itemgroup');
			strItemFam = itemresults[0].getValue('custitem_wmsse_itemfamily');
			blnItemUnit = itemresults[0].getText('stockunit');
			VUnitType = itemresults[0].getValue('unitstype');
			if(departments == true)
				Vdepartment = itemresults[0].getValue('department');
			if(classes == true)
				Vclass = itemresults[0].getValue('class');
		}
		itemresults=null;
		itemcolumns=null;
		itemfilters=null;
		var getStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
		var uomresults= new Array();
		var results='';

		if(VUnitType != null && VUnitType != '')
		{	
			var vBaseUOMSearch=getBaseUnitRate(VUnitType);

			vBaseUnit='Base unit';
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
				vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
			}	

			if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
			}
			results= getUnitsType(VUnitType);

			if(results != null && results != '' && results != 'null' && results != 'undefined')
			{
				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					var row = [UOMText+"_"+vQty];
					uomresults.push(row);
				}

			}

		}
		nlapiLogExecution('ERROR', 'getStockConversionRate', getStockConversionRate); 
		var vUnitsText="";
		if(vBaseUnit != "" && vBaseUnit != null && vBaseUnit != "null")
			vUnitsText = 'In '+ vBaseUnit;

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var btnText='Save (Ent)';
		if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
		{
			btnText='Next (Ent)';
		}

		var invfilterStrat =  new Array();
		if(whLocation != null && whLocation != '')
			invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
		if(getItemInternalId != null && getItemInternalId != '')
			invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', getItemInternalId));
		if(eneteredBinId!= null && eneteredBinId!= '')
			invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', eneteredBinId));
		if(enteredLot != null && enteredLot != '')
			invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', enteredLot));

		var searchName = 'customsearch_wmsse_invtbalance_invt_item';
		if(getItemType == "inventoryitem" || getItemType == "assemblyitem")
		{
			searchName = 'customsearch_wmsse_invtbalance_invt_item';
		}
		else if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem") 
		{
			searchName = 'customsearch_wmsse_invtbalance_serialsrh';

		}
		else if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem") 
		{
			searchName = 'customsearch_wmsse_inventorybalance';

		}

		var vStatusDetails = nlapiSearchRecord('InventoryBalance',searchName,invfilterStrat, null);

		var vStatusDetailsArr =  new Array();
		var eneteredLotTxt = '';
		var eneteredLotExpdate ='';
		var vOpenPickDetails ="";
		var totalAvailQty = 0;
		if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined'
			&& vStatusDetails != undefined && vStatusDetails.length != null && vStatusDetails.length >0)
		{					 

			if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
				vOpenPickDetails = getOPenTaskPickBinDetailsLot(getItemInternalId,eneteredBinId,whLocation,VUnitType,blnItemUnit);
			else
				vOpenPickDetails = getOPenTaskPickBinDetails(getItemInternalId,eneteredBinId,whLocation,VUnitType,blnItemUnit,'','');


			if((getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem"))
			{

				eneteredLotTxt = vStatusDetails[0].getText('inventorynumber',null,'group');
				eneteredLotExpdate = vStatusDetails[0].getValue('expirationdate','inventorynumber','group');

				var statusArr = new Array();

				for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
				{
					var status = vStatusDetails[statusItr].getText('status',null,'group');

					var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');

					var statusId = vStatusDetails[statusItr].getValue('status',null,'group');
					nlapiLogExecution('DEBUG', 'status', status);
					var openPickQty = 0;
					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{						
						var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinLotArr = vOpenPickDetails[3];
						var	vBinStatusArr = vOpenPickDetails[5];

						nlapiLogExecution('DEBUG', 'vBinOpenTaskBinQtyArr', vBinOpenTaskBinQtyArr);
						if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined' && 
								vBinStatusArr != undefined)
						{
							for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
							{
								var stsArr = vBinStatusArr[binItr];
								var vLotText =vBinLotArr[binItr];									
								if(stsArr == statusId && eneteredLotTxt==vLotText)
								{
									openPickQty = vOpenPickQtyArr[binItr];
									break;
								}
							}
						}
					}
					nlapiLogExecution('DEBUG', 'vBinQtyAvail', vBinQtyAvail);
					nlapiLogExecution('DEBUG', 'openPickQty', openPickQty);
					//vBinQtyAvail = parseFloat((parseFloat(vBinQtyAvail)-parseFloat(openPickQty)).toFixed(5));
					vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);
					//totalAvailQty = parseFloat(totalAvailQty)+vBinQtyAvail;
					totalAvailQty = Big(totalAvailQty).plus(vBinQtyAvail);
					if(parseFloat(vBinQtyAvail) > 0)
					{
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
							//var totalQty = parseFloat(qty)+parseFloat(vBinQtyAvail);
							var totalQty = Big(qty).plus(vBinQtyAvail);
							var currRow = [status,totalQty,statusId];
							vStatusDetailsArr[indx]=currRow;
						}
					}
				}

			}
			else
			{
				for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
				{
					var status = ''; 
					var vBinQtyAvail ='';
					var statusId = '';
					if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
					{
						status = vStatusDetails[statusItr].getText('status',null,'group');
						vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');
						statusId = vStatusDetails[statusItr].getValue('status',null,'group');
					}
					else
					{
						status = vStatusDetails[statusItr].getText('status');
						vBinQtyAvail=vStatusDetails[statusItr].getValue('available');
						statusId = vStatusDetails[statusItr].getValue('status');
					}


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
					nlapiLogExecution('DEBUG', 'openPickQty', openPickQty);
					nlapiLogExecution('DEBUG', 'vBinQtyAvail before', vBinQtyAvail);
					//vBinQtyAvail = parseFloat((parseFloat(vBinQtyAvail)-parseFloat(openPickQty)).toFixed(5));
					vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);
					nlapiLogExecution('DEBUG', 'vBinQtyAvail after', vBinQtyAvail);
					//totalAvailQty = parseFloat(totalAvailQty)+vBinQtyAvail;
					totalAvailQty = Big(totalAvailQty).plus(vBinQtyAvail);
					nlapiLogExecution('DEBUG', 'totalAvailQty after', totalAvailQty);
					if(parseFloat(vBinQtyAvail) > 0)
					{
						var currRow = [status,vBinQtyAvail,statusId];
						vStatusDetailsArr.push(currRow);
					}
				}
			}
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('DEBUG', 'CSSfilefound', CSSfilefound);
		nlapiLogExecution('DEBUG', 'getPreferBin', getPreferBin);
		if(enteredBin == getPreferBin)
			getPreferBin='';
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0=domainName + "-BT Inventory";
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			nlapiLogExecution('ERROR', 'imgUrl', imgUrl);
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		var JSSurl ='';
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			nlapiLogExecution('ERROR', 'JSSurl', JSSurl); 
		}
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_status_scan');

		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";

		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";

		html = html +functionkeyHtml;
		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}
		//html = html + "</head><body onload='setFocus();'>";
		html = html +"<script type = 'text/javascript' >function validate(){ return validateForm(\""+getStockConversionRate+"\",\""+availableLotQty+"\",'hdnselecteduomswithqty','hdnItemType','txtbin','hdnPreferBin','hdntotaluomqtyentered') }</script>";
		html= html+"<script type = 'text/javascript' >function validatebin(bin){ return DisplayBin(bin,\""+getStockConversionRate+"\",\""+availableLotQty+"\",'hdnselecteduomswithqty','hdntotaluomqtyentered','hdnItemType','txtbin','_rf_checkin_item') }</script>";
		//This function is to validate the form when Enter button or save button is clicked.
		html = html + "<script type='text/javascript'>function validate_selectedStatus(statusId,selectedQty){" +
		"	document.getElementById('hdnenetedstatus').value = statusId;document.getElementById('hdnselectedqty').value = selectedQty; document.forms['_rf_status_scan'].submit();" +
		"document.getElementById('loading').style.display = 'block'; return true;}</script>";

		html = html + "</head><body onkeydown='return OnKeyDown_CL();'> ";

		html = html +"	<form name='_rf_status_scan' method='POST'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validate();'/>"+

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Bin Transfer - Status</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"	<tr><td>	<table>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enteredBin + "</label>"+
		"			</tr>"+
		"			<tr>"+		 

		"				<td align = 'left' class='labelmsg'>Available Qty: <label>" + parseFloat(parseFloat(totalAvailQty).toFixed(8)) + " " + blnItemUnit + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+
		"				<input type='hidden' name='hdnlotavailableqty' value=" + availableLotQty + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' id='hdnItemType' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnAvailableQty' id='hdnAvailableQty' value=" + availableLotQty + ">"+
		"				<input type='hidden' name='hdnAvailableQty1' id='hdnAvailableQty1' value=" + availableQty + ">"+
		"				<input type='hidden' name='hdnavailableqtyDetail' id='hdnavailableqtyDetail' value=" + availableqtyDetail + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnenteredbin' id='hdnenteredbin' value='" +enteredBin+"' >"+
		"				<input type='hidden' name='hdnenteredbinid' id='hdnenteredbinid' value='" +eneteredBinId+"' >"+
		"				<input type='hidden' name='hdnenteredqty' id='hdnenteredqty' value='" +availableQty+"' >"+
		"				<input type='hidden' name='hdnlotno' id='hdnlotno' value='" + lotno + "'>"+
		"				<input type='hidden' name='hdnlotid' id='hdnlotid' value=" + enteredLot + ">"+
		"				<input type='hidden' name='hdnenetedstatus' id='hdnenetedstatus'>"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnvUnitsText' id='hdnvUnitsText' value='" + vUnitsText + "'>"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+	
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+	
		"				<input type='hidden' name='hdnStatusScanQuantity' id='hdnStatusScanQuantity' value='" + availableQty + "'>"+
		"				<input type='hidden' name='hdnvInvLotId' id='hdnvInvLotId' value='" + vInvLotId + "'>"+
		"				<input type='hidden' name='hdnselectedqty' id='hdnselectedqty'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+			 
		"			<tr>"+
		"			</tr>";
		if(lotno!=null && lotno!='' && lotno!='null')
		{
			html = html +"<tr>";
			html = html +"<td align = 'left' class='labelmsg'>Lot#: <label>" + lotno + "</label>";
			html = html +"</tr>";
		}
		html = html +"			</table>";

		var errorMsgValue='';
		if(vStatusDetailsArr !=null && vStatusDetailsArr!='' && vStatusDetailsArr.length > 0)
		{
			html = html + 	" <tr><td></td></tr><tr><td></td></tr><tr ><td  ><table  style='border-spacing: 0;' id='tblqtyUOM'>";			


			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td class='status-rw-display'> Inv Status"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";	
			if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
			{
				html = html +"				<td colspan ='2'></td><td>Expiry Date"+	
				"				</td>";	
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			for(var invItr=0;invItr<vStatusDetailsArr.length;invItr++)
			{
				if(invItr%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';

				var currValues = vStatusDetailsArr[invItr];
				var vStatus = currValues[0];
				var vQty = currValues[1];
				var vStatusId = currValues[2];

				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"		<td  class='status-cl-display'><a  onclick='return validate_selectedStatus(\""+vStatusId+"\",\""+vQty+"\");' href='#' >"+vStatus;	
				html = html +"				</a></td>";				

				html = html +"				<td class='align-right'>"+vQty;
				html = html +"				</td>";
				//html = html +"				<td></td>";
				if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
				{
					if(eneteredLotExpdate ==null || eneteredLotExpdate =='' || eneteredLotExpdate =='null'|| eneteredLotExpdate == 'undefined' ||
							eneteredLotExpdate == undefined)
						eneteredLotExpdate="";
					html = html +"				<td colspan ='2'></td>";
					html = html +"				<td>"+eneteredLotExpdate;
					html = html +"				</td>";		

				}

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
		html = html + "</form>";		
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);
	}
	else 
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating From BIN');

		var POarray = new Array();
		var enteredQty=request.getParameter('hdnenteredqty');	
		var statusScanQuantity = request.getParameter('hdnStatusScanQuantity');
		var enteredBin=request.getParameter('hdnenteredbin');
		var enteredStatus = request.getParameter('hdnenetedstatus');
		var enteredLot = request.getParameter('hdnlotno');
		var vInvLotId = request.getParameter('hdnvInvLotId');
		POarray["custparam_vInvLotId"] = vInvLotId;
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_fetcheditemname"]=request.getParameter('hdnItemName');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_unitstext"] = request.getParameter('hdnvUnitsText');	
		POarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
		POarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_enteredstatus"] = request.getParameter('hdnenetedstatus');
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		POarray["custparam_lotno"] = request.getParameter('hdnlotno');
		POarray["custparam_lotavailableqty"] = request.getParameter('hdnAvailableQty');
		POarray["custparam_availableqty"] = request.getParameter('hdnAvailableQty1');
		POarray["custparam_enterBin"] = request.getParameter('hdnenteredbin');
		POarray["custparam_enteredlot"] = request.getParameter('hdnlotid');
		POarray["custparam_enteredBinID"] = request.getParameter('hdnenteredbinid');
		POarray["custparam_statusScanQuantity"] = request.getParameter('hdnAvailableQty');
		POarray["custparam_availableqtyDetail"] = request.getParameter('hdnavailableqtyDetail');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var itemType=request.getParameter('hdnItemType');
		var whLocation=POarray["custparam_whlocation"];
		var preferBin=request.getParameter('hdnPreferBin');
		var optedEvent = request.getParameter('cmdPrevious');
		var vAvailableQty = request.getParameter('hdnselectedqty');


		var logMsg = 'LocationId = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'LocationName = ' + POarray["custparam_whlocationname"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_itemtype"] = ' + POarray["custparam_itemtype"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_fetcheditemid"] = ' + POarray["custparam_fetcheditemid"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_fetcheditemname"] = ' + POarray["custparam_fetcheditemname"] + '<br>';
		logMsg = logMsg + 'getStockConversionRate = ' + getStockConversionRate + '<br>';
		logMsg = logMsg + 'enteredStatus = ' + enteredStatus + '<br>';
		logMsg = logMsg + 'vAvailableQty = ' + vAvailableQty + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - BIN', logMsg);

		if(optedEvent != 'Back (F7)')
		{
			if(enteredStatus!=null && enteredStatus!="" && enteredStatus!='null' )
			{
				try
				{
					var invstatusid='';
					var invstatusname ='';
					var tavailableQty=0;
					var filterPrefInv = new Array();

					if(FetchedItemId != null && FetchedItemId != '' && FetchedItemId != 'null')
						filterPrefInv.push(new nlobjSearchFilter('internalid','item','anyof', FetchedItemId));
					if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '' && POarray["custparam_whlocation"]!= 'null')
						filterPrefInv.push(new nlobjSearchFilter('location',null, 'anyof', POarray["custparam_whlocation"]));
					if(enteredStatus != null && enteredStatus != '' && enteredStatus != 'null')
						filterPrefInv.push(new nlobjSearchFilter('status',null, 'anyof', enteredStatus));
					if(POarray["custparam_enteredBinID"] != null && POarray["custparam_enteredBinID"] != '' && POarray["custparam_enteredBinID"] != 'null')
						filterPrefInv.push(new nlobjSearchFilter('binnumber',null, 'anyof', POarray["custparam_enteredBinID"]));
					if(vInvLotId != null && vInvLotId != '' && vInvLotId != 'null')
						filterPrefInv.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', vInvLotId));

					var objBinDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterPrefInv, null);
					if(objBinDetails != null && objBinDetails != '')
					{
						if(objBinDetails.length != null)
						{
							for(var aVailQty=0;aVailQty<objBinDetails.length;aVailQty++)
							{
								//tavailableQty=parseFloat(tavailableQty)+parseFloat(objBinDetails[aVailQty].getValue('available',null,'sum'));
								tavailableQty=Number(Big(tavailableQty).plus(objBinDetails[aVailQty].getValue('available',null,'sum')));
							}
							invstatusid = objBinDetails[0].getValue('status',null,'group');
							invstatusname = objBinDetails[0].getText('status',null,'group');


							//POarray["custparam_lotavailableqty"] =parseFloat(tavailableQty).toFixed(5);
							POarray["custparam_lotavailableqty"] =tavailableQty;
							nlapiLogExecution('ERROR', 'POarray["custparam_lotavailableqty"]', POarray["custparam_lotavailableqty"]);
						}
						else
						{
							objBinDetails='';
						}
					}

					POarray["custparam_statusflag"] = 'T';
					//POarray["custparam_availableqty"] = parseFloat(tavailableQty).toFixed(5);
					POarray["custparam_availableqty"] = tavailableQty;
					nlapiLogExecution('DEBUG', 'tavailableQty', tavailableQty);
					POarray["custparam_invtstatusName"] = invstatusname;
					if(vAvailableQty !=null && vAvailableQty !='' && vAvailableQty !='null' &&
							vAvailableQty !=undefined && vAvailableQty !='undefined')
					{
						//POarray["custparam_lotavailableqty"] =parseFloat(vAvailableQty).toFixed(5);
						//POarray["custparam_availableqty"] = parseFloat(vAvailableQty).toFixed(5);
						nlapiLogExecution('DEBUG', 'vAvailableQty', vAvailableQty);
						POarray["custparam_lotavailableqty"] =vAvailableQty;
						POarray["custparam_availableqty"] = vAvailableQty;
					}

					response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
					return; 
				}
				catch(e)
				{
					nlapiLogExecution('ERROR', 'inside catch exception', e);							

					if ( e instanceof nlobjError )
					{
						POarray["custparam_error"]=e.getDetails();
						nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() );
					}
					else
					{
						POarray["custparam_error"]=e.toString();
						nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() );
					}

					response.sendRedirect('SUITELET', 'customscript_wmsse_bintransfer_status', 'customdeploy_wmsse_bintransfer_status', false, POarray);
					return; 
				}
			} 
			else
			{
				POarray["custparam_error"] = 'Please select status';				
				response.sendRedirect('SUITELET', 'customscript_wmsse_bintransfer_status', 'customdeploy_wmsse_bintransfer_status', false, POarray);
				return;
			}
		}
		else 
		{
			if(itemType == 'lotnumberedinventoryitem' || itemType == 'lotnumberedassemblyitem' )
			{
				var statusScreenFlag = 'T';			
				POarray["custparam_statusScreenFlag"] =statusScreenFlag;
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET', 'customscript_wmsse_bt_lot_scan', 'customdeploy_wmsse_bt_lot_scan', false, POarray);
				return;
			}
			else
			{
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET', 'customscript_wmsse_bt_bin_scan', 'customdeploy_wmsse_bt_bin_scan', false, POarray);
				return;
			}
		}
	} 
} 

