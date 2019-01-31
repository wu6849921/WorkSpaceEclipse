/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * This function is used to print packlist report
 * @param 
 * @returns {String}
 */
function printpacklistSE(request, response){
	if (request.getMethod() == 'GET') {
		
		var soid=request.getParameter('custparam_wmsse_soid');
		var containerlp=request.getParameter('custparam_wmsse_containerlp');
		var isbulkpack=request.getParameter('custparam_bul_pack');
		var whLocation=request.getParameter('custparam_wmsse_Locationid');
		var strHtmlString="";

		if(isbulkpack == null || isbulkpack == '' || isbulkpack == 'null' || isbulkpack == 'undefined')
			isbulkpack='';

		nlapiLogExecution('ERROR','printpacklistSE soid',soid);
		nlapiLogExecution('ERROR','printpacklistSE containerlp',containerlp);
		nlapiLogExecution('ERROR','printpacklistSE isbulkpack',isbulkpack);
		nlapiLogExecution('ERROR','printpacklistSE whLocation',whLocation);

		strHtmlString=fngethtmlstring(soid,containerlp,isbulkpack,whLocation);			
		//start of getting logo from filecabinet
		var strUrl="";
		var ctx = nlapiGetContext();
		nlapiLogExecution('ERROR', 'Environment',ctx.getEnvironment());
		if (ctx.getEnvironment() == 'PRODUCTION') 
		{
			strUrl = 'https://system.netsuite.com';			
		}
		else if (ctx.getEnvironment() == 'SANDBOX') 
		{
			strUrl = 'https://system.sandbox.netsuite.com';				
		}
		nlapiLogExecution('ERROR', 'PDF strUrl',strUrl);
		var imageurl;
		var filefound = getLoadFile('LOGOCOMP.jpg'); 
		if (filefound) 
		{ 
			nlapiLogExecution('ERROR', 'Event', 'file;'+filefound.getId()); 
			imageurl = filefound.getURL();
			nlapiLogExecution('ERROR','imageurl',imageurl);
			imageurl = strUrl + imageurl;//+';';
			nlapiLogExecution('ERROR','imageurl',imageurl);
			imageurl=imageurl.replace(/&/g,"&amp;");

		} 
		
		if(strHtmlString!=null && strHtmlString!="")
		{
			strHtmlString=strHtmlString.replace('headerimage',imageurl);
		}		
		nlapiLogExecution('ERROR', 'strHtmlString', strHtmlString);		
		response.write( strHtmlString );
	}
	else //this is the POST block
	{

	}
}

/**
 * This function is used to retrieve html sting
 * @param OrderNumber
 * @returns {String}
 */

function fngethtmlstring(soid,containerlp,isbulkpack,whLocation)
{
	nlapiLogExecution('ERROR', 'fngethtmlstring soid', soid);	
	nlapiLogExecution('ERROR', 'fngethtmlstring containerlp', containerlp);	
	nlapiLogExecution('ERROR', 'fngethtmlstring isbulkpack', isbulkpack);
	nlapiLogExecution('ERROR', 'fngethtmlstring whLocation', whLocation);
	
	var FULFILLMENTATORDERLEVEL=getSystemRuleValue('Consolidate item fulfillments by sales order?',whLocation);
	nlapiLogExecution('ERROR', 'FULFILLMENTATORDERLEVEL', FULFILLMENTATORDERLEVEL);
	
	var searchfilter=new Array();
	if(isbulkpack != 'YES')
	{
	searchfilter.push(new nlobjSearchFilter('name',null,'is',soid));
	}
	
	if(FULFILLMENTATORDERLEVEL!='Y')
	{	
	searchfilter.push(new nlobjSearchFilter('custrecord_wmsse_label_lp',null,'is',containerlp));
	}
	searchfilter.push(new nlobjSearchFilter('custrecord_wmsse_label_type',null,'is','PackList'));

	var searchcolumn=new Array();
	searchcolumn[0]=new nlobjSearchColumn('custrecord_wmsse_label_data');

	var Labelprintingsearchrec=nlapiSearchRecord('customrecord_wmsse_labelprinting',null,searchfilter,searchcolumn);
	nlapiLogExecution('ERROR', 'Labelprintingsearchrec', Labelprintingsearchrec);
	var strHtmlString="";
	if(Labelprintingsearchrec!=null && Labelprintingsearchrec!="")
	{
		for(var m=0; m < Labelprintingsearchrec.length; m++)
		{
			strHtmlString += Labelprintingsearchrec[m].getValue('custrecord_wmsse_label_data');			
		}
	}
	//Nullify the objects.	 
	searchcolumn=null;
	searchfilter=null;
	return strHtmlString;

}

