/**
 * Script Description
 * This script is used for Todays warehouse portlet
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

var socount=0;
var cocount=0;

function TodaywarehousePortlet(portlet, column)
{  

	portlet.setTitle('Today\'s Completed Activity');  
	var filters = new Array();    	
	filters[0] = new nlobjSearchFilter('custrecord_wmsse_show_on_dashboard', null, 'is', 'T');
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_task_desc');
	var chdata="";var chdl="";var chl=""; 
	var searchresults = nlapiSearchRecord('customrecord_wmsse_tasktype', null, filters, columns);

	if(searchresults !=null)
	{

		for ( var i = 0; i < searchresults.length; i++) {
			var tasktype = searchresults[i].getValue(columns[0]); 
			tasktype=tasktype.replace(/ /g,"-");
			var id = searchresults[i].getId(); 
			var count = 0;
			socount=0;
			cocount=0;
			nlapiLogExecution('ERROR','main id',id);

			var taskcount=getTaskStatus(id,count);
			if(taskcount!=0)
			{

				chdata=chdata+taskcount+","; 
				chl=chl+taskcount+"|"; 
				// chl=chl+tasktype+"("+taskcount+")"+"|";
				chdl=chdl+tasktype+"("+taskcount+")"+"|";



			}
		}
		chdata = chdata.substring(0, chdata.length-1); 
		chl = chl.substring(0, chl.length-1); 
		chdl = chdl.substring(0, chdl.length-1); 
		searchresults=null;
	}


	var  content="<div align=center><img src= ''";
	content+="?chxs=0,676767,12.5";
	content+="&chxt=x";
	content+="&chs=460x185";
	content+="&cht=p";
	content+="&chds=500,200";   
	chdata="t:"+chdata;
	content+="&chd="+chdata+"";
	content+="&chds=a";
	content+="&chl="+chl;
	content+="&chdl="+chdl+"";

	content+="&chtt=Today\'s&nbsp;Completed&nbsp;Activity&chco=ff0099|2E8B57|00FF00|0000FF|AFDCEC|307D7E|387C44|FBB917|8A4117|F660AB|817339|87CEEB|FE4557";  
	content+=" /></div>";
	portlet.setHtml( content );


}
/**
 * TO get open task records with selected task type
 * @param status
 * @param maxno
 * @param sysdate
 * @returns {Number}
 */
function getOpenTaskStatus(status,maxno,sysdate)
{
	/*** The below code is merged from Lexjet production account on 04thMar13 by Santosh as part of Standard bundle***/
	var vRoleLocation=getRoledBasedLocation();
	/*** Up to here ***/ 
	var filtersso = new Array();

	filtersso[0] = new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'is', status);
	filtersso[1] = new nlobjSearchFilter('custrecord_wmsse_act_end_date', null, 'on', sysdate);
	if(status == '3')
		filtersso[2] = new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'noneof', [26,30]);// 
	//filtersso[2] = new nlobjSearchFilter('custrecord_act_end_date',  null, 'isempty');         
	//filtersso[1] = new nlobjSearchFilter('custrecordact_begin_date', null, 'on', '3/30/2012');         
	/*** The below code is merged from Lexjet production account on 04thMar13 by Santosh as part of Standard bundle***/
	nlapiLogExecution('ERROR','vRoleLocation',vRoleLocation);
	if(vRoleLocation != null && vRoleLocation != '' && vRoleLocation != 0)
	{
		filtersso.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', vRoleLocation));     
	}
	/*** Up to here ***/ 
	if(maxno!=0)
	{
		filtersso.push(new nlobjSearchFilter('id',null,'greaterthan',maxno));
	}
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_tasktype');
	columns[1] = new nlobjSearchColumn('internalid');
	columns[1].setSort();

	var searchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', null, filtersso, columns);

	if(searchresults != null && searchresults.length>=1000)
	{
		nlapiLogExecution('ERROR','getOpenTaskStatus if',searchresults.length);
		socount += parseFloat(searchresults.length);
		/*if(searchresults.length>=1000)
		{*/
		nlapiLogExecution('ERROR','socounttst OT',socount);
		var mno=searchresults[searchresults.length-1].getId();  
		searchresults=null;
		getOpenTaskStatus(status,mno,sysdate);
		/*}*/
	}
	else
	{

		if(searchresults != null)
		{
			nlapiLogExecution('ERROR','getOpenTaskStatus else',searchresults.length);
			socount += parseFloat(searchresults.length);
			nlapiLogExecution('ERROR','getOpenTaskStatus else',searchresults.length); 
		}
	}
	searchresults=null;
	nlapiLogExecution('ERROR','socount OT',socount);
	nlapiLogExecution('ERROR','cnt OT',socount);
	return socount;

}
/**
 * To get task types
 * @param status
 * @param count
 * @returns
 */ 
function getTaskStatus(status,count)
{
	var sysdate=DateStamp();
	//var socount=0;	

	var resOpenTaskStatus = getOpenTaskStatus(status,0,sysdate,count);

	nlapiLogExecution('ERROR', ' Open Task count', resOpenTaskStatus); 
	return parseFloat(resOpenTaskStatus);
} 