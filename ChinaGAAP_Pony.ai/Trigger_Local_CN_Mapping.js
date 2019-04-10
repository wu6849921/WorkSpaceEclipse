/**
 * Copyright Trigger Networks, Inc. 2014 All rights reserved. Module Description
 * Voucher Reports Version Date Author Remarks 
 * 1.00 19 DEV 2014 winsonchens@gmail.com
 * 
 */

var classlang = new trigger.local.language();
var lang = nlapiGetContext().getPreference('language');
var displayLbl = classlang.AccountMappingUI(lang);

function disableitemsonclient(type){
	document.getElementById('custrecord_trigger_ns_account_id').disabled = true;
	document.getElementById('custrecord_trigger_netsuite_account').disabled = true;
	//document.getElementById('custrecord_trigger_cn_account_number_display').disabled = true;
	//var voucherdatefield=nlapiGetField('voucherdate');
	//voucherdatefield.setDisplayType('hidden');
}
function savedaccoutrecords(){
	document.getElementById('custrecord_trigger_ns_account_id').disabled = false;
	document.getElementById('custrecord_trigger_netsuite_account').disabled = false;
	return true;
}

function usereventbeforeload(type, form, request)
{		
	if(type=='edit'){		
		var recordID = nlapiGetRecordId();
		var params = {'recordID' : recordID,'mode' : type};
		nlapiSetRedirectURL('SUITELET', 'customscripttn_sl_cn_coa_mappingform', 'customdeploytn_sl_cn_coa_mappingform', false, params);
	}else if(type =='create'){
		var params = {'mode' : type};
		nlapiSetRedirectURL('SUITELET', 'customscripttn_sl_cn_coa_mappingform', 'customdeploytn_sl_cn_coa_mappingform', false, params);
	}else if(type =='view'){
		var params = {'recordID' : nlapiGetRecordId(),'mode' : type};
		nlapiSetRedirectURL('SUITELET', 'customscripttn_sl_cn_coa_mappingform', 'customdeploytn_sl_cn_coa_mappingform', false, params);
	}
}

function HTMLForAccountList() {
	var html = '<style type="text/css">';
	html += '#accountname{height:26px;width:300px;}';
	html += '.m_top{margin-top:5px;}';
	html += '</style>';
	html += '<div class="m_top"><span class="smallgraytextnolink uir-label">';
	html += '<a class="smallgraytextnolink">' + displayLbl.acntNameLbl + '</a></span></div>';
	html += '<div><select name="accountname" id="accountname" onchange="OnSelectAccountNameChange()">';
	html += '<option selected value=-1></option>';
	var returnName = GetAccountNameLists();
	for (var key in returnName) {
		html += String.format('<option value="{0}">{1}</option>', key, returnName[key]);
	}
	html += '</select></div>';
	return html;
}
function OnSelectAccountNameChange(){
	var o = document.getElementById("accountname");
	var n = o.selectedIndex;
	var targetid = document.getElementById("custrecord_trigger_ns_account_id");
	var targetname = document.getElementById("custrecord_trigger_netsuite_account");
	targetid.value = o.options[n].value;
	targetname.value = o.options[n].text;
}

function GetAccountNameLists() {
	var map = {};
	var internalid;
	var name;
	var savedsearch = nlapiLoadSearch('account', 'customsearch_trigger_account_lists');
	var resultset = savedsearch.runSearch();
	var resultslice = resultset.getResults(0, 1000);
	for (var i = 0; i < resultslice.length; i++) {
		internalid = resultslice[i].getValue('internalid', null, 'GROUP');
		name = resultslice[i].getValue('name', null, 'GROUP');
		map[internalid] = name;
	}
	return map;
}

function GetChinaAccountNameLists(){
	var map = {};
	var internalid;
	var name;
	var cols=[];
	cols.push(new nlobjSearchColumn('name'));
	cols.push(new nlobjSearchColumn('custrecord_trigger_name_coa_cn'));
	var savedsearch = nlapiCreateSearch('customrecord_trigger_cn_coa',null,cols);
	var resultset = savedsearch.runSearch();
	for(var i = 0;i < 200; i++){
		var resultslice = resultset.getResults(i * 1000,(i + 1) * 1000);
		if(resultslice.length<=0){
			break;
		}
		else{
			for(var j = 0;j < resultslice.length;j++){
				internalid = resultslice[j].getId();
				name = resultslice[j].getValue(cols[0])+' '+resultslice[j].getValue(cols[1]);
				map[internalid] = name;
			}
		}
		if(resultslice.length < 1000){
			break;
		} 
	}
	return map;
}
String.format = function () {
	  var args = arguments;
	  return args[0].replace(/\{(\d+)\}/g, function (m, i) { return args[i * 1 + 1]; });
};

function fieldChange(type,name,linenum){
	try{
		if(name=='custpage_chinaaccountname'){
			var val = nlapiGetFieldValue(name);
			nlapiSetFieldValue('custrecord_trigger_cn_account_number',val);
		}
	}
	catch(ex){
		nlapiLogExecution('debug','fieldChange',ex);
	}
}
	