/**
 * Module Description: get employee list by subsidiary functionality
 * Version    Date            Author           Remarks
 * 1.00       20 1 2015   Winson.Chen
 */



triggernamespace("trigger.local");

trigger.local.employee =  function(){}
trigger.local.employee.prototype = {
		constructor : trigger.local.employee,
		
		GetEmployeesList:function( subsidiaryid ){
	        var filters = [];
			var columns = [];
			columns[0] = new nlobjSearchColumn('internalid',null, null);
			columns[1] = new nlobjSearchColumn('entityid', null, null);
			columns[2] = new nlobjSearchColumn('custentity_chinese_name', null, null);
			if(subsidiaryid&&subsidiaryid!='-1'){
				filters.push( new nlobjSearchFilter('internalid','subsidiary', 'anyof', subsidiaryid));
			}
			filters.push( new nlobjSearchFilter('custentity_chinese_name',null, 'isnotempty', []));
			var savedsearch = nlapiCreateSearch('employee', filters, columns);
            var internalid,name,chinesename;
			var resultset = savedsearch.runSearch();
			var searchid = 0;
			var map = new trigger.local.HashTable();
			do {
				var resultslice = resultset.getResults(searchid, searchid + 1000);
				for ( var rs in resultslice) {
					internalid = resultslice[rs].getValue('internalid', null, null);
					name = resultslice[rs].getValue('entityid', null, null);
					chinesename = resultslice[rs].getValue('custentity_chinese_name', null, null);
					map.Add(internalid, new trigger.local.HashEntity(name, chinesename));
					searchid++;
				}
			} while (resultslice.length >= 1000);
			return map;
		},
}
