/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
//Portlet for warehouse capacity
function WarehouseCapacity(portlet, column)
{  

	portlet.setTitle('Warehouse Capacity Used'); 

	var Totalbinscount=0;
	var Totalusedbinscount=0;
	
	
	/*var TotalbinsResults = nlapiSearchRecord('Bin',null,null,null);

	if(TotalbinsResults !=null && TotalbinsResults !='' && TotalbinsResults.length>0)
		Totalbinscount = TotalbinsResults.length;*/


	var location = new Array();
	location = getRoledBasedLocation();

	


	var search = nlapiLoadSearch('bin','customsearch_wmsse_binnumbers');
	var newFilter = new Array();
	if(location.length > 0 && location[0] != 0)
	{
		nlapiLogExecution('ERROR','location1',location.length);
		newFilter= new nlobjSearchFilter('location', null, 'anyof', location);
		search.addFilter(newFilter);
	}


	var resultSet = search.runSearch();
	if(resultSet != null && resultSet != '')
	{
	var vResultCount=0;
	var blnContinue=true;
	var i=0;

	while(blnContinue) {

	var firstThreeResults = resultSet.getResults((i*1000), ((i+1)*1000));
	   blnContinue=false;
	   if(firstThreeResults != null && firstThreeResults  != '' && firstThreeResults.length>=1000)
	      blnContinue=true;
	Totalbinscount=Totalbinscount+ firstThreeResults.length;
	    i++;
	} 
	 
	}
	
	var search2= nlapiLoadSearch('item','customsearch_wmsse_used_bins', null, null, null);

	var newFilter = new Array();
	if(location.length > 0 && location[0] != 0)
	{
		nlapiLogExecution('ERROR','location1',location.length);
		newFilter= new nlobjSearchFilter('location', null, 'anyof', location);
		search2.addFilter(newFilter);
	}
	var TotalusedbinsResults = search2.runSearch();
	if(TotalusedbinsResults != null && TotalusedbinsResults != '')
	{
	var vResultCount=0;
	var blnContinue=true;
	var j=0;

	while(blnContinue) {

	var firstThreeResultsUsed = TotalusedbinsResults.getResults((j*1000), ((j+1)*1000));
	   blnContinue=false;
	   if(firstThreeResultsUsed != null && firstThreeResultsUsed  != '' && firstThreeResultsUsed.length>=1000)
	      blnContinue=true;
	   Totalusedbinscount=Totalusedbinscount+ firstThreeResultsUsed.length;
	    j++;
	} 
	 
	}
	
	
	/*var TotalusedbinsResults = nlapiSearchRecord('item','customsearch_wmsse_used_bins', null, null, null);

	if(TotalusedbinsResults !=null && TotalusedbinsResults !='' && TotalusedbinsResults.length>0)
		Totalusedbinscount = TotalusedbinsResults.length;*/

	nlapiLogExecution('ERROR','Totalbinscount',Totalbinscount);
	nlapiLogExecution('ERROR','Totalusedbinscount',Totalusedbinscount);

	var emptyBinsPercent = '';
	/*if(TotalbinsResults == null || TotalbinsResults == "")
	{
		TotalbinsResults =0;
		Totalusedbinscount=0;

	}*/

	var TotalEmptySpace = parseFloat(Totalbinscount) - parseFloat(Totalusedbinscount);

	if(TotalEmptySpace != null && TotalEmptySpace != '' && TotalEmptySpace != 0)
	{
		emptyBinsPercent = Math.round((parseFloat(TotalEmptySpace)/parseFloat(Totalbinscount) * 100),2);
	}
	if(emptyBinsPercent != null && emptyBinsPercent != '')
		{
		TotalEmptySpace = TotalEmptySpace +"  ("+emptyBinsPercent+" %)";
		}
	//var content = "<b>Total bins :</b> "+ Totalbinscount +"     "+"   <b>Used bins :</b> "+Totalusedbinscount;
	var content = "<b>Total bins :</b> "+ Totalbinscount +"     "+"   <b>Empty bins :</b> "+TotalEmptySpace;

	//var  content= vMessage + LinesReceivedPerHour;
	portlet.setHtml( content );


}







