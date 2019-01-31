/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
function systemruleUpdateUE(type){

	nlapiLogExecution('DEBUG', 'Test1','test1');
	var columnstemp = new Array();
	columnstemp [0] = new nlobjSearchColumn('custrecord_wms_oldname'); 
	columnstemp [1] = new nlobjSearchColumn('custrecord_wms_newname');
	columnstemp [2] = new nlobjSearchColumn('custrecord_wms_old_description');
	columnstemp [3] = new nlobjSearchColumn('custrecord_wms_new_description');
	columnstemp [4] = new nlobjSearchColumn('custrecord_wms_rulevalue');
	columnstemp [5] = new nlobjSearchColumn('custrecord_wms_ruletype');
	


	var tempSearchResults = nlapiSearchRecord('customrecord_wms_temp_sysrules', null, null,columnstemp); 
	if(tempSearchResults!=null && tempSearchResults !='')
	{
		nlapiLogExecution('DEBUG', 'tempSearchResults',tempSearchResults.length);
		for(var i=0;i<tempSearchResults.length;i++)
		{
			var tempoldname=tempSearchResults[i].getValue('custrecord_wms_oldname');
			var tempnewname=tempSearchResults[i].getValue('custrecord_wms_newname');
			var tempolddesc=tempSearchResults[i].getValue('custrecord_wms_old_description');
			var tempnewdesc=tempSearchResults[i].getValue('custrecord_wms_new_description');

			var columnssystemrule = new Array();
			columnssystemrule [0] = new nlobjSearchColumn('name'); 
			columnssystemrule [1] = new nlobjSearchColumn('custrecord_wmssedescription');

			var systemruleSearchResults = nlapiSearchRecord('customrecord_wmsse_sysrules', null, null,columnssystemrule);

			if(systemruleSearchResults!=null && systemruleSearchResults!='')
			{
				nlapiLogExecution('DEBUG', 'systemruleSearchResults',systemruleSearchResults.length);
				for(var k=0;k<systemruleSearchResults.length;k++)
				{
					var name=systemruleSearchResults[k].getValue('name');
					var desc=systemruleSearchResults[k].getValue('custrecord_wmssedescription');
					nlapiLogExecution('DEBUG', 'tempoldname',tempoldname);
					nlapiLogExecution('DEBUG', 'name',name);
					nlapiLogExecution('DEBUG', 'tempnewname',tempnewname);
					nlapiLogExecution('DEBUG', 'tempnewdesc',tempnewdesc);
					if(tempoldname==name && tempnewname!=name )
					{
						var systemruleid=systemruleSearchResults[k].getId();

						var systemrulerec= nlapiLoadRecord('customrecord_wmsse_sysrules', systemruleid);
						systemrulerec.setFieldValue('name', tempnewname);
						systemrulerec.setFieldValue('custrecord_wmssedescription', tempnewdesc);
						var retval  =nlapiSubmitRecord(systemrulerec, true);

					}

				}
			}

		}


	}
	if(tempSearchResults!=null && tempSearchResults !='')
	{
		for(var z=0;z<tempSearchResults.length;z++)
		{
			var tempoldname=tempSearchResults[z].getValue('custrecord_wms_oldname');
			var tempnewname=tempSearchResults[z].getValue('custrecord_wms_newname');
			var tempolddesc=tempSearchResults[z].getValue('custrecord_wms_old_description');
			var tempnewdesc=tempSearchResults[z].getValue('custrecord_wms_new_description');
			var temprulevalue=tempSearchResults[z].getValue('custrecord_wms_rulevalue');
			var tempruletype=tempSearchResults[z].getValue('custrecord_wms_ruletype');


			var columnssystemrule = new Array();
			var filterssystemrule = new Array();
			filterssystemrule.push(new nlobjSearchFilter('name', null, 'is', tempnewname));
			var systemrulenewSearchResults = nlapiSearchRecord('customrecord_wmsse_sysrules', null, filterssystemrule,columnssystemrule);
			if(systemrulenewSearchResults==null || systemrulenewSearchResults=='')
			{
				var newsystemrule = nlapiCreateRecord('customrecord_wmsse_sysrules');
				newsystemrule.setFieldValue('name',tempnewname);
				newsystemrule.setFieldValue('custrecord_wmssedescription',tempnewdesc);
				newsystemrule.setFieldValue('custrecord_wmsserulevalue',temprulevalue);
				newsystemrule.setFieldValue('custrecord_wmsseruletype',tempruletype);

				var recid = nlapiSubmitRecord(newsystemrule);
			}

		}
	}



	var tempSearchResults = nlapiSearchRecord('customrecord_wms_temp_sysrules', null, null,null); 
	if(tempSearchResults!=null && tempSearchResults !='')
	{
		for(var d=0;d<tempSearchResults.length;d++)
		{
			nlapiLogExecution('DEBUG', 'testfinal','testfinal');
			var id = nlapiDeleteRecord('customrecord_wms_temp_sysrules', tempSearchResults[d].getId());	
		}
	}

} 

function systemruleCreateUE(type){
	var tempSearchResults = nlapiSearchRecord('customrecord_wms_temp_sysrules', null, null,null); 
	if(tempSearchResults!=null && tempSearchResults !='')
	{
		for(var c=0;c<tempSearchResults.length;c++)
		{
			nlapiLogExecution('DEBUG', 'testfinal','testfinal');
			var id = nlapiDeleteRecord('customrecord_wms_temp_sysrules', tempSearchResults[c].getId());	
		}
	}
}


