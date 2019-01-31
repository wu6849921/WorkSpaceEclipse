/***************************************************************************
  Copyright � 2018,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Function to be used as BeforeSubmit event for custom records to hide the Inventory status field
 * when inventory status flag is not enabled.
 * 
 * @param type
 */
function Inventorystatusenable(type,form){

	try
	{
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('Error', 'inventoryStatusFeature: ', inventoryStatusFeature);
		var invfield = form.getField('custrecord_wmsse_put_invstatus');  
		if(inventoryStatusFeature ==false)
		{
			invfield.setDisplayType('hidden');
		}		

	}
	catch(ex)
	{
		var msgstring= ex.toString();
		var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
		nlapiLogExecution('Error', 'Exception: ', msg);
	}
}

function InventorystatusBeforeSubmit(type)
{
	nlapiLogExecution('Error', 'type ', type);
	
}

