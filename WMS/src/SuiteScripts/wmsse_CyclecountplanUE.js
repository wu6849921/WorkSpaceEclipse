/**
 * Script Description
 * This script is to post fulfillment for partially picked Orders
 */
/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * This function is used to update tracking number in ship manifestSE record type
 * @param 
 * @returns {}
 */ 
function Cyclecountplan(type,form)
{
	var subs = nlapiGetContext().getFeature('subsidiaries');
	nlapiLogExecution('DEBUG','subs', subs);
	nlapiLogExecution('DEBUG','form', form);
	var vCyccaccountfield = form.getField('custrecord_wmsse_ccp_account');
    var vAccountConfig=nlapiLoadConfiguration('accountingpreferences');
    var vDefaultaccountvalue=vAccountConfig.getFieldValue('INVCOUNTACCOUNT');
    nlapiLogExecution('DEBUG','vDefaultaccountvalue', vDefaultaccountvalue);
    if(vDefaultaccountvalue!=null && vDefaultaccountvalue!='')
        vCyccaccountfield.setDefaultValue(vDefaultaccountvalue);
	if(subs==false)
	{
		var subfield = form.getField('custrecord_wmsse_subsidiary');  
		nlapiLogExecution('DEBUG','subfield', subfield);

		if(subfield!=null)
		{
			subfield.setMandatory(false);//('custrecord_wmsse_subsidiary');
			subfield.setDisplayType('hidden');
			//subfield.setVisible(false);
		}
		var locfield = form.getField('custrecord_wmsse_ccp_location');   
		nlapiLogExecution('DEBUG','locfield', locfield);

		if(locfield != null)
		{
			locfield.setMandatory(false);//('custrecord_wmsse_ccp_location');
			locfield.setDisplayType('hidden');
		}

	}
	else
	{
		var nowLocField = form.getField('custrecord_wmsse_ccp_nonow_location');   
		nlapiLogExecution('DEBUG','nowLocField', nowLocField);

		if(nowLocField != null)
		{
			nowLocField.setMandatory(false);//('custrecord_wmsse_ccp_nonow_location');
			nowLocField.setDisplayType('hidden');
		}
	}

}


