/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
//Portlet for Lines received per hour
function picksPerHour(portlet, column)
{  

	portlet.setTitle('Picks per hour by employee');  


	var context = nlapiGetContext();
	var User =  context.getUser();
	var CurrentDate=DateStamp();
	var filters = new Array();    	
	filters.push(new nlobjSearchFilter('custrecord_wmsse_upd_user_no', null, 'anyof',User));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_act_begin_date', null, 'on',CurrentDate));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof',['3']));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'noneof', ['9']));
	//filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8','28']));

	var columns = new Array();
	//columns.push(new nlobjSearchColumn('name',null,'group'));
	columns.push(new nlobjSearchColumn('id',null,'count'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_actualbegintime',null,'min'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_actualendtime',null,'max'));


	var searchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', null, filters, columns);

	var vLineCount=0;
	var LinesPickedPerHour =0;
	var timeTakentoPick =0;
	if(searchresults !=null && searchresults !='' && searchresults.length>0)
	{
		nlapiLogExecution('ERROR','searchresults.length',searchresults.length);
		for ( var i = 0; i < searchresults.length; i++) {

			 vLineCount = searchresults[i].getValue('id',null,'count'); 
			var vActBeginTime = searchresults[i].getValue('custrecord_wmsse_actualbegintime',null,'min');
			nlapiLogExecution('ERROR','vActBeginTime',vActBeginTime);
			if(vActBeginTime !=null && vActBeginTime != '')
			{
				var part = vActBeginTime.match(/(\d+):(\d+)(?: )?(am|pm)?/i);
				var ap = part[3] ? part[3].toUpperCase() : null;
				var hh = parseInt(part[1], 10);
				if (ap === "AM") {
					if (hh == 12) {
						hh = 0;
					}
				}
				if (ap === "PM") {
					if (hh != 12) {
						hh += 12;
					}
				}
				var Hours = hh*60;
				var mm = parseInt(part[2], 10);
				var TotalBeginHours = Hours + mm;

				var vActEndTime = searchresults[i].getValue('custrecord_wmsse_actualendtime',null,'max');


				var part = vActEndTime.match(/(\d+):(\d+)(?: )?(am|pm)?/i);
				var ap = part[3] ? part[3].toUpperCase() : null;
				var hh = parseInt(part[1], 10);
				if (ap === "AM") {
					if (hh == 12) {
						hh = 0;
					}
				}
				if (ap === "PM") {
					if (hh != 12) {
						hh += 12;
					}
				}
				var Hours = hh*60;
				var mm = parseInt(part[2], 10);
				var TotalEndHours = Hours + mm;
var vTimeDiff=TotalEndHours - TotalBeginHours;
if(vTimeDiff<=0)
	vTimeDiff=1;
				timeTakentoPick =Math.ceil(vTimeDiff/60);
				 LinesPickedPerHour =(vLineCount)/timeTakentoPick;
			}
		}
		nlapiLogExecution('ERROR','vLineCount',vLineCount);
		nlapiLogExecution('ERROR','timeTakentoPick',timeTakentoPick);
		


		nlapiLogExecution('ERROR','LinesPickedPerHour',LinesPickedPerHour);

	}

	var vMessage = "<b>Picks per hour by employee :</b>";



	var  content= vMessage + LinesPickedPerHour + "  &nbsp;        <b>    Total picks per hour :</b>" +vLineCount;
	portlet.setHtml( content );


}







