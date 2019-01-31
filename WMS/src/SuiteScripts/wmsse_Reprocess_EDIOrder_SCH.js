/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function ReprocessEDIOrder_SCH(type)
{
	if ( type == 'ondemand') {
		nlapiLogExecution('ERROR', 'ReprocessEDIOrder SCH Start', type);	
		
		var context = nlapiGetContext(); 
		var vOrdNumber = context.getSetting('SCRIPT', 'custscript_wmsse_orderno');

		nlapiLogExecution('ERROR', 'ReprocessEDIOrder vOrdNumber', vOrdNumber);	
		if(vOrdNumber != null && vOrdNumber  != '')
		{
			try
			{
				var vOrdInternalID = GetSoID(vOrdNumber.trim());
				var vordtype = DeleteStagerecords(vOrdInternalID);
				nlapiLogExecution('ERROR', 'vOrdInternalID', vOrdInternalID);	
				nlapiLogExecution('ERROR', 'vordtype', vordtype);	
			}
			catch(exception)
			{
				nlapiLogExecution('ERROR', 'exception while deleting stage records', exception);
				DeleteStagerecords(vOrdInternalID);
			}
			
			if(vordtype == 'DropShip' || vordtype == '' || vordtype == null)
			{
				//open task
				nlapiLogExecution('ERROR', 'into vordtype', vordtype);

				var openfilters = new Array();
				var opencolumns = new Array();

				openfilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', [vOrdInternalID]));
				openfilters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [14])); 	//SHIP Task
				openfilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [28])); // SHIPPED
				openfilters.push(new nlobjSearchFilter('custrecord_wmsse_hostid',  null, 'isnotempty'));


				opencolumns[0] = new nlobjSearchColumn('internalid');
				opencolumns[1] = new nlobjSearchColumn('custrecord_wmsse_order_no');

				var opensearchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask' , null,	openfilters, opencolumns);	
				
				if(opensearchresults !=null && opensearchresults !='')
					nlapiLogExecution('ERROR', 'Order type Dropship length', opensearchresults.length);

				for(var cn=0; opensearchresults !=null && cn<opensearchresults.length; cn++)
				{      		
					nlapiSubmitField('customrecord_wmsse_trn_opentask',opensearchresults[cn].getId(), 'custrecord_wmsse_hostid', '');       		

				}
			}

			else
			{
				nlapiLogExecution('ERROR', 'into else vordtype', vordtype);

				var openfilters1 = new Array();
				var opencolumns1 = new Array();

				openfilters1.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', [vOrdInternalID]));
				openfilters1.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [4])); 	//SHIP Task
				openfilters1.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [14])); // SHIPPED
				openfilters1.push(new nlobjSearchFilter('custrecord_wmsse_hostid',  null, 'isnotempty'));


				opencolumns1[0] = new nlobjSearchColumn('internalid');
				opencolumns1[1] = new nlobjSearchColumn('custrecord_wmsse_order_no');

				var opensearchresults1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask' , null,	openfilters1, opencolumns1);
				
				if(opensearchresults1 !=null && opensearchresults1 !='')
					nlapiLogExecution('ERROR', 'Order type standard/georgia length', opensearchresults1.length);
				

				for(var cn=0; opensearchresults1 != null && cn<opensearchresults1.length; cn++)
				{       		
					nlapiSubmitField('customrecord_wmsse_trn_opentask',opensearchresults1[cn].getId(), 'custrecord_wmsse_hostid', '');       		

				}
			}
		}		
	}
}
function DeleteStagerecords(vOrdInternalID)
{
	var Ordertype='';
	nlapiLogExecution('ERROR', 'into DeleteStagerecords', vOrdInternalID);
	var filters2 = new Array();
	var columns2 = new Array();

	filters2.push(new nlobjSearchFilter('custrecord_wmsse_ordno', null, 'anyof', vOrdInternalID));

	var columns2 = new Array();
	columns2.push(new nlobjSearchColumn('custrecord_wmsse_ordno'));
	columns2.push(new nlobjSearchColumn('custrecord_wmsse_ordertype'));

	var searchresults2 = nlapiSearchRecord('customrecord_wmsse_inetinterfaceasnc', null, filters2, columns2);

	if(searchresults2 !=null && searchresults2 !='')
	{
		Ordertype = searchresults2[0].getValue('custrecord_wmsse_ordertype');
		nlapiLogExecution('ERROR', 'searchresults2 length', searchresults2.length);
		nlapiLogExecution('ERROR', 'DeleteStagerecords Ordertype', Ordertype);
	}

	for ( var count = 0; searchresults2 != null && count < searchresults2.length; count++)
	{
		var id=nlapiDeleteRecord('customrecord_wmsse_inetinterfaceasnc',searchresults2[count].getId());
	}
	return Ordertype;
}
function GetSoID(vOrdNumber)
{	
	nlapiLogExecution('ERROR', 'into GetSoID', vOrdNumber);
	var sofilters = new Array();
	sofilters.push(new nlobjSearchFilter('tranid', null, 'is', vOrdNumber));
	var socolumns = new Array();
	socolumns[0] = new nlobjSearchColumn('internalid'); 
	var sosearchresults = nlapiSearchRecord('salesorder', null, sofilters, socolumns);
	if(sosearchresults !=null && sosearchresults !='')
	{
		var SoID = sosearchresults[0].getValue('internalid');
	}
	nlapiLogExecution('ERROR', 'SoID', SoID);
	return SoID;
}