/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Oct 2015     GA300732
 *
 */

function WSAfterSubmit(type){
	nlapiLogExecution('DEBUG',type);
	if(type == 'create')
	{
		var vItem =nlapiGetFieldValue('custrecord_wmsse_ws_item');
		var vItemName =nlapiGetFieldText('custrecord_wmsse_ws_item');
		var vWHLocation =nlapiGetFieldValue('custrecord_wmsse_ws_whlocation');
		var vBinLocation =nlapiGetFieldValue('custrecord_wmsse_ws_tobin');
		var vUnits =nlapiGetFieldValue('custrecord_wmsse_ws_units');
		var vSerialLot =nlapiGetFieldValue('custrecord_wmsse_serial_lot');
		var vPutQty =nlapiGetFieldValue('custrecord_wmsse_ws_qty');
		var newRecord = nlapiGetNewRecord();

		var Recid = newRecord.getId();
		if(vPutQty == null || vPutQty=='')
			vPutQty=0; 
		var errMsg="";
		nlapiLogExecution('DEBUG','vItem : vItemName : vWHLocation : vBinLocation : vUnits : vSerialLot : vPutQty : Recid', vItem +":" + vItemName +":" + vWHLocation +":" + vBinLocation +":" + vUnits +":" + vSerialLot +":" + vPutQty +":"+ Recid);
		if(vWHLocation == null || vWHLocation == '' || vWHLocation == 'null')
		{
			errMsg='custrecord_wmsse_ws_notes','WH Location should not be null';
			fnUpdateErrorMsg(errMsg,Recid);

			var cannotReceiveError = nlapiCreateError('Cannot Receive', 'WH Location should not be null' , true);
			throw cannotReceiveError; //throw this error object, do not catch it
		} 
		var vItemType="";
		if(vItem != null && vItem != '')
		{	
			vItemType = nlapiLookupField('item', vItem, 'recordType');

		}
		var vSerialArr=new Array();
		if ((vItemType == "serializedinventoryitem" || vItemType == "serializedassemblyitem") && vSerialLot != null && vSerialLot != '')
		{
			vSerialArr=vSerialLot.split(',');
		}
		else if ((vItemType == "serializedinventoryitem" || vItemType == "serializedassemblyitem") && (vSerialLot == null || vSerialLot == ''))
		{
			errMsg='Serial/Lot number value should not be null for serialized items';
			fnUpdateErrorMsg(errMsg,Recid);

			var cannotReceiveError = nlapiCreateError('Cannot Receive', 'Serial/Lot number value should not be null for serialized items' , true);
			throw cannotReceiveError; //throw this error object, do not catch it
		}	
		if((vItemType =='lotnumberedinventoryitem' || vItemType =='lotnumberedassemblyitem') && (vSerialLot == null || vSerialLot == ''))		 
		{
			errMsg='Serial/Lot number value should not be null for lotnumbered items';
			fnUpdateErrorMsg(errMsg,Recid);			 
			var cannotReceiveError = nlapiCreateError('Cannot Receive', 'Serial/Lot number value should not be null for lotnumbered items' , true);
			throw cannotReceiveError; //throw this error object, do not catch it
		}	

		nlapiLogExecution('DEBUG','Before');

		var trecord = nlapiCreateRecord('binworksheet', {
			recordmode: 'dynamic'
		}); // dynamic
		trecord.setFieldValue('location', vWHLocation);
		nlapiLogExecution('DEBUG','After');
		//We can initialize a for-loop logic starting here based on the number of line items
		var vLineCount = trecord.getLineItemCount('item');
		nlapiLogExecution('DEBUG','vLineCount ',vLineCount);
		var blnItemAvailable='F';
		if(parseFloat(vLineCount) > 0)
		{

			for(var i=1;i<=parseFloat(vLineCount);i++)
			{	
				var vLineItem= trecord.getLineItemValue('item','item',i);
				nlapiLogExecution('ERROR','i : vLineCount : vLineItem : vItem = ',i + ' : ' +  vLineCount + ' : ' + vLineItem + ' : ' + vItem);

				if(vLineItem == vItem)
				{	
					blnItemAvailable='T';
					var vLineQtyToPut= trecord.getLineItemValue('item','quantity',i);
					if(vLineQtyToPut == null || vLineQtyToPut == '' || vLineQtyToPut == 'null')
						vLineQtyToPut=0;
					nlapiLogExecution('ERROR','vLineQtyToPut',vLineQtyToPut);
					if(parseFloat(vLineQtyToPut) >= parseFloat(vPutQty)) 
					{
						nlapiLogExecution('ERROR','into IF',i);
						trecord.selectLineItem('item',i); // select the first line item 
						trecord.setCurrentLineItemValue('item', 'quantity', vPutQty);
						if(vUnits != null && vUnits != '')
							trecord.setCurrentLineItemValue('item', 'unit', vUnits);
						var compSubRecord = trecord.createCurrentLineItemSubrecord( 'item','inventorydetail');
						compSubRecord.selectNewLineItem('inventoryassignment');
						compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', vBinLocation);
						compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', vPutQty); // quantity here should be less than or equal to the quantity on the item sublist
						nlapiLogExecution('ERROR','vItemType',vItemType);
						if(vItemType == "lotnumberedinventoryitem" || vItemType=="lotnumberedassemblyitem")
						{	
							nlapiLogExecution('ERROR','vSerialLot',vSerialLot);
							if(vSerialLot!= null && vSerialLot != '')
							{
								var filtersLot = new Array();

								 
								filtersLot.push(new nlobjSearchFilter('inventorynumber', null,'is', vSerialLot)); 
								filtersLot.push(new nlobjSearchFilter('item', null,'anyof', vItem)); 
 
								var searchresultlot = nlapiSearchRecord('inventorynumber', null, filtersLot, null);
								if(searchresultlot != null && searchresultlot != '')
								{
									nlapiLogExecution('ERROR','searchresultlot[0].getId()',searchresultlot[0].getId());
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'issueinventorynumber', searchresultlot[0].getId());
									//compSubRecord.setCurrentLineItemValue('inventoryassignment', 'newinventorynumber', vSerialLot);
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', vPutQty);
								}
								else
								{
									errMsg='Lot number does not exist';
									fnUpdateErrorMsg(errMsg,Recid);
									 
									var cannotReceiveError = nlapiCreateError('Cannot Receive', 'Lot number does not exist' , true);
									throw cannotReceiveError; //throw this error object, do not catch it
								}	
							}
							else
							{
								errMsg='Lot number does not exist';
								fnUpdateErrorMsg(errMsg,Recid);
								 
								var cannotReceiveError = nlapiCreateError('Cannot Receive', 'Lot number does not exist' , true);
								throw cannotReceiveError; //throw this error object, do not catch it
							}	
							
						}

						if(vItemType == "serializedinventoryitem" || vItemType == "serializedassemblyitem")
						{
							for (var j = 0; j < vSerialArr.length; j++) {
								
								var filtersSer = new Array();

								 
								filtersSer.push(new nlobjSearchFilter('inventorynumber', null,'is', vSerialArr[j])); 
								filtersSer.push(new nlobjSearchFilter('item', null,'anyof', vItem)); 
 
								var searchresultSer = nlapiSearchRecord('inventorynumber', null, filtersSer, null);
								if(searchresultSer != null && searchresultSer != '')
								{
									nlapiLogExecution('ERROR','searchresultSer[0].getId()',searchresultSer[0].getId());
									/*compSubRecord.setCurrentLineItemValue('inventoryassignment', 'issueinventorynumber', searchresultSer[0].getId());
									//compSubRecord.setCurrentLineItemValue('inventoryassignment', 'newinventorynumber', vSerialLot);
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', vPutQty);*/
									
									compSubRecord.selectNewLineItem('inventoryassignment');
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'issueinventorynumber', searchresultSer[0].getId());
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'newinventorynumber', vSerialArr[j]);
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', vBinLocation);  
									compSubRecord.commitLineItem('inventoryassignment');
									
								}
								else
								{
									errMsg='Serial number does not exist';
									fnUpdateErrorMsg(errMsg,Recid);
									 
									var cannotReceiveError = nlapiCreateError('Cannot Receive', 'Serial number does not exist' , true);
									throw cannotReceiveError; //throw this error object, do not catch it
								}
								
								
								

							}
						}
						else
						{
							compSubRecord.commitLineItem('inventoryassignment');
						}						

						compSubRecord.commit();
						trecord.commitLineItem('item');
						try
						{
							var idl = nlapiSubmitRecord(trecord);
							if(Recid != null && Recid != '')
							{	
								var vRec=nlapiLoadRecord('customrecord_wmsse_binput_worksheet',Recid)
								vRec.setFieldValue('custrecord_wmsse_ws_nsconfirmno',idl);
								nlapiSubmitRecord(vRec, false, true);
							}
						}
						catch(ex)
						{
							errMsg='Exception ' + ex;
							fnUpdateErrorMsg(errMsg,Recid);

							var cannotReceiveError = nlapiCreateError('Cannot Receive', 'Exception : ' + ex , true);
							throw cannotReceiveError; //throw this error object, do not catch it
						}
						break;
					}
					else
					{
						errMsg='Putaway quantity should be less than equal to ' + vLineQtyToPut;
						fnUpdateErrorMsg(errMsg,Recid);

						var cannotReceiveError = nlapiCreateError('Cannot Receive', 'Putaway quantity should be less than equal to ' + vLineQtyToPut , true);
						throw cannotReceiveError; //throw this error object, do not catch it
					}	
				}
			}
			if(blnItemAvailable=='F')
			{
				errMsg='Cannot perform work sheet for this item';
				fnUpdateErrorMsg(errMsg,Recid); 
				var cannotReceiveError = nlapiCreateError('Cannot Receive', 'Cannot perform work sheet for this item' , true);
				throw cannotReceiveError; //throw this error object, do not catch it
			}	
		}
		else
		{
			errMsg='No items found in work sheet';
			fnUpdateErrorMsg(errMsg,Recid); 
			var cannotReceiveError = nlapiCreateError('Cannot Receive', 'No items found in work sheet' , true);
			throw cannotReceiveError; //throw this error object, do not catch it
		}	

	}	  
}

function fnUpdateErrorMsg(errMsg,Recid)
{
	nlapiLogExecution('DEBUG','Recid',Recid);
	if(Recid != null && Recid != '')
	{	
		var vRec=nlapiLoadRecord('customrecord_wmsse_binput_worksheet',Recid)
		vRec.setFieldValue('custrecord_wmsse_ws_notes',errMsg);
		nlapiSubmitRecord(vRec, false, true);
	}
}
