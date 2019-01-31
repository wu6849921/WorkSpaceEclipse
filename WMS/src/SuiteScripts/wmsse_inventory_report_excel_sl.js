/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Apr 2015     GA300732
 *
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function fnInventoryReportExport(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		try
		{
			
			var inventoryStatusFeature = isInvStatusFeatureEnabled();
			
			var form = nlapiCreateForm("Inventory Report");
			

			var vLocation= request.getParameter('custpage_location');
			var vItem= request.getParameter('custpage_item');
			var vBinLoc= request.getParameter('custpage_binloc');
			var invstatus = request.getParameter('custpage_invstatus');

			var result=InventorySearchResults(vLocation,vItem,vBinLoc,-1,invstatus);

			var strxml="";
			var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdf>\n<head></head><body  font-size=\"7\"  size=\"A4-landscape\"  padding-top=\" 0mm\"   footer='myfooter' footer-height='20mm'>\n";
			if(inventoryStatusFeature == true)
			{
				try
				{

				if(result!=null && result!="")
				{
					strxml += "<table width='100%'>";
					strxml += "<tr><td><table width='100%' >";
					strxml += "<tr><td valign='middle' align='left' colspan='2'><p align='center' style='font-size:xx-large;'>";
					strxml += "Inventory Report";
					strxml += "</p></td></tr></table></td></tr>";
					strxml += "<tr><td><table width='100%' >";
					strxml += "<tr><td style='width:41px;font-size: 12px;'>";
					strxml += "</td></tr>";
					strxml += "</table>";
					strxml += "</td></tr>";

					strxml += "<tr><td><table width='100%' valign='top' >";
					strxml += "<tr><td>";

					strxml +="<table width='200%'>";
					strxml +="<tr style=\"font-weight:bold;background-color:gray;color:white;\">";

					strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
					strxml += "Item";
					strxml += "</td>";

					strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
					strxml += "Location";
					strxml += "</td>";

					strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
					strxml += "Bin Location";
					strxml += "</td>";


					strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
					strxml += "Quantity On Hand";
					strxml += "</td>";

					strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
					strxml += "Avail Qty";
					strxml += "</td>"; 
					
					strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
					strxml += "Status";
					strxml += "</td>"; 
					strxml += "</tr>";

						var vColumnslist=result[0].getAllColumns();

						for(var invStatusItr=0; invStatusItr< result.length;invStatusItr++)
						{
							var searchresult=result[invStatusItr];
							var strItemId = searchresult.getValue('item',null,'group');  
							var strItemName = searchresult.getText('item',null,'group');  
							var strBin = searchresult.getText('binnumber',null,'group');
							var strBinId = searchresult.getValue('binnumber',null,'group');
							var strLocation = searchresult.getText('location',null,'group');
							var strLocationId = searchresult.getValue('location',null,'group');
							var strOnhandQty = searchresult.getValue('onhand',null,'sum');
							var strAvailQty = searchresult.getValue('available',null,'sum');
							var strStatus = searchresult.getText('status',null,'group');
							var blnIsLotItem = searchresult.getValue('islotitem','item','group');
							var blnIsSerialItem = searchresult.getValue('isserialitem','item','group');
							var invStatusId = searchresult.getValue('status',null,'group')
							var vItemType='INV';
							if(blnIsLotItem != null && blnIsLotItem != '' && blnIsLotItem == 'T')
								vItemType='LOT';
							if(blnIsSerialItem != null && blnIsSerialItem != '' && blnIsSerialItem == 'T')
								vItemType='SERIAL';
							nlapiLogExecution('DEBUG', 'blnIsLotItem',blnIsLotItem);
							nlapiLogExecution('DEBUG', 'blnIsSerialItem',blnIsSerialItem);

							nlapiLogExecution('DEBUG', 'vItemType',vItemType);
							var vBinOpenTaskDetails=new Array();
							if(blnIsLotItem != null && blnIsLotItem != '' && blnIsLotItem == 'T')
								vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(strItemId,strBinId,strLocationId,
										searchresult.getValue('unitstype','item','group'),searchresult.getText('stockunit','item','group'),'',invStatusId);
							else
								vBinOpenTaskDetails = getOPenTaskPickBinDetails(strItemId,strBinId,strLocationId,
										searchresult.getValue('unitstype','item','group'),searchresult.getText('stockunit','item','group'),'',invStatusId);
							var vOpenPickQty=0;
							var vBinOpenTaskBinQtyArr = "";
							if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
							{
								vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
								vOpenPickQty = vBinOpenTaskBinQtyArr[0];
							}
							if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
								vOpenPickQty =0;

							strAvailQty = parseFloat(strAvailQty)-parseFloat(vOpenPickQty);
							strAvailQty = parseFloat(parseFloat(strAvailQty).toFixed(5));
							strOnhandQty = parseFloat(parseFloat(strOnhandQty).toFixed(5));
							strxml += "<tr>";
							strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
							strxml += strItemName;
							strxml += "</td>";
							strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
							strxml += strLocation;
							strxml += "</td>";
							strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
							strxml += strBin;
							strxml += "</td>";
							strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
							strxml += strOnhandQty;
							strxml += "</td>";
							strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
							strxml += strAvailQty;
							strxml += "</td>";
							strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
							strxml += strStatus;
							strxml += "</td>";
							strxml += "</tr>";
						}
						strxml += "</table>";
						strxml += "</td></tr>";
						strxml += "</table>";
						strxml += "</td></tr>";
						strxml += "</table>"; 
						strxml += "\n</body>\n</pdf>";
						xml=xml+strxml;
						var exportXML = strxml;
						response.setContentType('PLAINTEXT', 'ExcelResults.xls', 'attachment');
						response.write(exportXML);	
					}

				}
				catch(e)
				{
					nlapiLogExecution('ERROR', 'Exception in isInvStatusFeatureEnabled', e.toString());

				}

			}
			else{

				if(result!=null && result!="")
				{
					strxml += "<table width='100%'>";
					strxml += "<tr><td><table width='100%' >";
					strxml += "<tr><td valign='middle' align='left' colspan='2'><p align='center' style='font-size:xx-large;'>";
					strxml += "Inventory Report";
					strxml += "</p></td></tr></table></td></tr>";
					strxml += "<tr><td><table width='100%' >";
					strxml += "<tr><td style='width:41px;font-size: 12px;'>";
					strxml += "</td></tr>";
					strxml += "</table>";
					strxml += "</td></tr>";

				strxml += "<tr><td><table width='100%' valign='top' >";
				strxml += "<tr><td>";

				strxml +="<table width='200%'>";
				strxml +="<tr style=\"font-weight:bold;background-color:gray;color:white;\">";

				strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
				strxml += "Item";
				strxml += "</td>";

				strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
				strxml += "Location";
				strxml += "</td>";

				strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
				strxml += "Bin Location";
				strxml += "</td>";


				strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
				strxml += "Quantity On Hand";
				strxml += "</td>";

					strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
					strxml += "Avail Qty";
					strxml += "</td>"; 
					strxml += "</tr>";

					var vColumnslist=result[0].getAllColumns();
					for(var i=0; i< result.length;i++)
					{	
						var searchresult=result[i];
						var strItemName = searchresult.getValue('itemid');  
						var strBin = searchresult.getText('binnumber','binOnHand');
						var strBinId = searchresult.getValue('binnumber','binOnHand');
						var strLocation = searchresult.getText('location','binOnHand');
						var strLocationId = searchresult.getValue('location','binOnHand');
						var strOnhandQty = searchresult.getValue('quantityonhand','binOnHand');
						var strAvailQty = searchresult.getValue('quantityavailable','binOnHand');
						var blnIsLotItem = searchresult.getValue('islotitem');
						var blnIsSerialItem = searchresult.getValue('isserialitem');
						var vItemType='INV';
						if(blnIsLotItem != null && blnIsLotItem != '' && blnIsLotItem == 'T')
							vItemType='LOT';
						if(blnIsSerialItem != null && blnIsSerialItem != '' && blnIsSerialItem == 'T')
							vItemType='SERIAL';
						nlapiLogExecution('DEBUG', 'blnIsLotItem',blnIsLotItem);
						nlapiLogExecution('DEBUG', 'blnIsSerialItem',blnIsSerialItem);

						nlapiLogExecution('DEBUG', 'vItemType',vItemType);
						var vBinOpenTaskDetails=new Array();
						if(blnIsLotItem != null && blnIsLotItem != '' && blnIsLotItem == 'T')
							vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(vItem,strBinId,strLocationId,
									searchresult.getValue('unitstype'),searchresult.getText('stockunit'));
						else							
						   vBinOpenTaskDetails = getOPenTaskPickBinDetails(vItem,strBinId,strLocationId,
								   searchresult.getValue('unitstype'),searchresult.getText('stockunit'));
						var vOpenPickQty=0;
						var vBinOpenTaskBinQtyArr = "";
						if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
						{
							vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
							vOpenPickQty = vBinOpenTaskBinQtyArr[0];
						}
						if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
							vOpenPickQty =0;
						nlapiLogExecution('DEBUG', 'vOpenPickQty',vOpenPickQty); 
						nlapiLogExecution('DEBUG', 'strAvailQty',strAvailQty); 
						strAvailQty = parseFloat(strAvailQty)-parseFloat(vOpenPickQty);
						strAvailQty = parseFloat(parseFloat(strAvailQty).toFixed(5));
						strOnhandQty = parseFloat(parseFloat(strOnhandQty).toFixed(5));

					strxml += "<tr>";
					strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
					strxml += strItemName;
					strxml += "</td>";

						strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
						strxml += strLocation;
						strxml += "</td>";
						strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
						strxml += strBin;
						strxml += "</td>";
						strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
						strxml += strOnhandQty;
						strxml += "</td>";
						strxml += "<td width='10%' align='center' style='border-width: 1px; border-color: #000000;font-size: 14px;'>";
						strxml += strAvailQty;
						strxml += "</td>";
						strxml += "</tr>";
					}
					strxml += "</table>";
					strxml += "</td></tr>";
					strxml += "</table>";
					strxml += "</td></tr>";
					strxml += "</table>"; 
					strxml += "\n</body>\n</pdf>";
					xml=xml+strxml;
					var exportXML = strxml;
					response.setContentType('PLAINTEXT', 'ExcelResults.xls', 'attachment');
					response.write(exportXML);	
				}
			}
		}
		catch(exp)
		{
			nlapiLogExecution('DEBUG','Exception in Inventory report Excel Main',exp);
		}
	}
	else
	{

	}
}
function InventorySearchResults(vLocation,vItem,vBinLoc,max,vInvStatus)
{
	
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	if(inventoryStatusFeature == true)
	{
		// Fetch Inventory Balance record based Item status
		var vItemWiseInvDetails = [];

		var result=nlapiLoadSearch('InventoryBalance', 'customsearch_wmsse_inv_report_invbnew');
		if(vLocation==null || vLocation=='')
			var vLocation = getRoledBasedLocation();
		
		if(vLocation != null && vLocation != '')
			result.addFilter(new nlobjSearchFilter('location', null, 'anyof', vLocation));
		if(vItem != null && vItem != '')
			result.addFilter(new nlobjSearchFilter('item', null, 'anyof', vItem));
		if(vBinLoc != null && vBinLoc != '')
			result.addFilter(new nlobjSearchFilter('binnumber', null, 'anyof', vBinLoc));
		if(vInvStatus != null && vInvStatus != '')
			result.addFilter(new nlobjSearchFilter('status', null, 'anyof', vInvStatus));

		var resLen = result.runSearch();
		var srhIterator = 0;
		var resultSet = resLen.forEachResult(function(searchResult)
				{
			srhIterator++;
			vItemWiseInvDetails.push(searchResult);
			if(parseFloat(srhIterator) == 4000)
			{
				return false;
			}
			return true;                // return true to keep iterating
				});

	}
	else
	{
		
		if(vLocation==null || vLocation=='')
			var vLocation = getRoledBasedLocation();
		var filters=new Array();
		if(vLocation != null && vLocation != '')
			filters.push(new nlobjSearchFilter('location', 'binonhand', 'anyof', vLocation));
		if(vItem != null && vItem != '')
			filters.push(new nlobjSearchFilter('internalid', null, 'anyof', vItem));
		if(vBinLoc != null && vBinLoc != '')
			filters.push(new nlobjSearchFilter('binnumber', 'binonhand', 'anyof', vBinLoc));
		nlapiLogExecution('DEBUG','Values',vLocation + ',' + vItem + ',' + vBinLoc);

		var vItemWiseInvDetails=nlapiSearchRecord('item', 'customsearch_wmsse_itemwise_inv_report', filters, null);

	}
	return vItemWiseInvDetails;
}
