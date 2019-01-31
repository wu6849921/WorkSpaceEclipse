/**
 * Script Description:
 * This userevent script used to Restrict to create the inventory status directly in WMS inventory status
 */

/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

/**
 * BeforeLoad event
 * @parameters {type}
 */
function InventorystatusBeforeLoad(type){

	try
	{
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('Error', 'inventoryStatusFeature: ', inventoryStatusFeature);
		var context = nlapiGetContext();
		nlapiLogExecution('Error', 'context.nlapiGetContext ', context.getExecutionContext());
		nlapiLogExecution('Error', 'type ', type);	
		if(inventoryStatusFeature == true)
		{
			if (context.getExecutionContext()== 'userinterface' && (type == 'create' || type == 'edit' ||type == 'delete')) 
			{

				var cannotDelError = nlapiCreateError('Cannot create',	'Use the menu option: SetUp->Company->Inventory Status Change, to create/edit the Inventory Status.', true);
				throw cannotDelError;  

			}	
		}

	}
	catch(ex)
	{
		nlapiLogExecution('Error', 'Exception: ', ex);
		var erroremsg = nlapiCreateError('',ex, true);
		throw erroremsg;
	}
}



