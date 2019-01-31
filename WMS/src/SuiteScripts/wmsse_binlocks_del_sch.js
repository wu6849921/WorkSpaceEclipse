/**
 * Script Description
 * This script is used to delete lock records created on Bin and Item combination.
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

function DeleteBinLocks(type) 
{
	nlapiLogExecution('ERROR','type',type); 
	try
	{
		var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlocks_del_sch');
		if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
		{
			nlapiLogExecution('ERROR','lockresults',lockresults.length);
			var checkflag = false;
			for(var i=0;i<lockresults.length;i++)
			{
				var dateCreated = lockresults[i].getValue('created');
				nlapiLogExecution('ERROR','dateCreated',dateCreated);

				checkflag = verifyDate(dateCreated);//to verify the record created date and time

				if(checkflag)
				{
					var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[i].getId());//delete
					nlapiLogExecution('ERROR','DeleteRecordId', DeleteRecordId);
				}
			}
		}

	}
	catch(ex)
	{
		nlapiLogExecution('Debug', 'Exception: ', ex);
	}
	
	

	try
	{
		var wmslockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_wmslockrecord_delete');
		if(wmslockresults!=null && wmslockresults!='null' &&  wmslockresults !='' && wmslockresults != 'undefined')
		{
			nlapiLogExecution('ERROR','wmslockresults',wmslockresults.length);
			var wmscheckflag = false;
			for(var vlock=0;vlock<wmslockresults.length;vlock++)
			{
				var wmsdateCreated = wmslockresults[vlock].getValue('created');
				
				wmscheckflag = verifyDate(wmsdateCreated);//to verify the record created date and time

				if(wmscheckflag)
				{
					var wmslockDeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockrecs', wmslockresults[vlock].getId());//delete
					nlapiLogExecution('ERROR','wmslockDeleteRecordId', wmslockDeleteRecordId);
				}
			}
		}

	}
	catch(ex)
	{
		nlapiLogExecution('Debug', 'Exception: ', ex);
	}
	
}

//to verify the record created date and time
function verifyDate(dateCreated)
{
	var day = new Date();
	nlapiLogExecution('ERROR','day',day);

	var todayTime = day.getTime();
	nlapiLogExecution('ERROR','todayTime',todayTime);

	var dtsettingFlag = DateSetting();//To convert into date format
	nlapiLogExecution('Debug', 'dtsettingFlag', dtsettingFlag);

	dateCreated=ValidateDate(dateCreated,dtsettingFlag);
	nlapiLogExecution('ERROR','dateCreated',dateCreated);

	var dateCreatedTime = dateCreated.getTime();
	nlapiLogExecution('ERROR','dateCreatedTime', dateCreatedTime);

	var mSec = parseFloat(todayTime) - parseFloat(dateCreatedTime);
	nlapiLogExecution('ERROR','mSec', mSec);

	var min = parseFloat(mSec)/60000;
	nlapiLogExecution('ERROR','min', min);

	if(parseFloat(min) > 180)
		return true;
	else
		return false;
}
