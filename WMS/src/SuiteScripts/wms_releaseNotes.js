
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
function releaseNotes(request, response){
	if (request.getMethod() == 'GET')
	{
		var form = nlapiCreateForm('Release Notes');
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_wmslite_relversion');
		columns[1] = new nlobjSearchColumn('custrecord_wmslite_releasedate');
		columns[2] = new nlobjSearchColumn('custrecord_wmslite_details');
		var searchresults = nlapiSearchRecord('customrecord_wmslite_releasenotes', null, null, columns);
		nlapiLogExecution('ERROR', 'searchresults' ,searchresults);
		var sublist = form.addSubList("custpage_releasenotes", "list", "Release Notes List");
		sublist.addField("custpage_releaseversion", "text", "Release Version");
		sublist.addField("custpage_releasedate", "date", "	Release Date");
		sublist.addField("custpage_details", "textarea", "	Details");
		if(searchresults!=null&&searchresults!=''){
		for(var count=0;count<searchresults.length;count++){
			
			var releaseVersion = searchresults[count].getValue('custrecord_wmslite_relversion');
			var releaseDate = searchresults[count].getValue('custrecord_wmslite_releasedate');
			var releaseDetails = searchresults[count].getValue('custrecord_wmslite_details');
			nlapiLogExecution('ERROR', 'releaseVersion' ,releaseVersion);
			nlapiLogExecution('ERROR', 'releaseDate' ,releaseDate);
			nlapiLogExecution('ERROR', 'releaseDetails' ,releaseDetails);
			
		form.getSubList('custpage_releasenotes').setLineItemValue('custpage_releaseversion', count+1,releaseVersion);
		form.getSubList('custpage_releasenotes').setLineItemValue('custpage_releasedate', count+1,releaseDate);
		form.getSubList('custpage_releasenotes').setLineItemValue('custpage_details', count+1,releaseDetails);
		}
		}
		response.writePage(form);
	}
	
}