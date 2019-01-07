/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 25 Jul 2016 Veronica
 * 
 */
triggernamespace("trigger.local");

var common = new trigger.local.common();
var mappingCommon = new trigger.local.mappingcommon();
var classlang = new trigger.local.language();
var lang = nlapiGetContext().getPreference('language');
var displayLbl = classlang.AccountMappingUI(lang);

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response) {
	try {
		var type = request.getMethod();
		var origRecordID = request.getParameter('recordID');
		var recordMode = request.getParameter('mode');
		var form = nlapiCreateForm(displayLbl.formTitle, false);
		form.setScript('customscripttn_cs_cn_coa_mappingform');
		alert('TN_SL_CN_COA_MappingForm, type is: ' + type);
//		nlapiLogExecution('DEBUG', 'suitelet', 'TN_SL_CN_COA_MappingForm, type is: ' + type + ' Orig record ID is: ' + origRecordID);
		
		var prepareFormBody = mappingCommon.createFormBody(form);
		if(prepareFormBody.status == 'error'){
			throw prepareFormBody.details;
		}		
		
		if(recordMode == 'create'){
			var sublist = initMappingSublist(form);
			
			form.addSubmitButton(displayLbl.createMappings);			
			form.addButton('custpage_btn_add', displayLbl.add, 'addMappingToTheWaitingList()');
		}else if(recordMode == 'edit'){
			form.addButton('custpage_btn_edit', displayLbl.editLbl, 'editMappingRecord(' + origRecordID + ')');
			form.addButton('custpage_btn_dlt', displayLbl.deleteLbl, 'deleteMappingRecord(' + origRecordID + ')');			
		}else if (recordMode == 'view') {			
			mappingCommon.populateMappingFormWithExistingRecordData(origRecordID);				

			//mark all the fields as disabled
			form.getField('custpage_chinaaccountname').setDisplayType('disabled');
			form.getField('custrecord_trigger_ns_subsidiary').setDisplayType('disabled');			
			form.getField('isinactive').setDisplayType('disabled');			
			form.getField('custrecord_trigger_one_to_many').setDisplayType('disabled');
			form.getField('custrecord_trigger_ns_department').setDisplayType('disabled');
			form.getField('custrecord_trigger_ns_location').setDisplayType('disabled');
			form.getField('custrecord_trigger_ns_class').setDisplayType('disabled');			
		}
		
		response.writePage(form);
	} catch (ex) {
		nlapiLogExecution('debug', 'suitelet', ex.message);
		// common.sendErrorEmail('dev_support@triggerasia.com', 'China GAAP',
		// 'TN_SL_CN_COA_MappingForm', 'suitelet', ex);
		response.write(displayLbl.unexpectederror + '\n' + ex.message);
	}
}

/**
 * Adds sublist area to hold new mapping details
 * 
 * @param form
 * @returns
 */
function initMappingSublist(form) {
	// Definition of sublist area to hold mapping lines before submitting
	var sublist = form.addSubList('custpage_sublist_cncoa_mapping',	'inlineeditor', displayLbl.mappingLbl);// adds a sublist area to the bottom of the screen

	// Column definition of sublist
	// columns for names
	sublist.addField('custpage_is_mapping_selected', 'checkbox',
			displayLbl.selected);
	sublist.addField('custpage_china_acc_name', 'text', displayLbl.chinaAcntNameLbl)
		.setDisplayType('disabled');
	sublist.addField('custpage_ns_acc', 'text', displayLbl.nsAccountLbl)
		.setDisplayType('disabled');
	sublist.addField('custpage_sbsdry_name', 'text', displayLbl.sbsdryNameLbl)
		.setDisplayType('disabled');
	sublist.addField('custpage_mapping2many', 'checkbox',displayLbl.one2manyChckBoxLbl)
		.setDisplayType('disabled');
	sublist.addField('custpage_deptmnt_name', 'text', displayLbl.departmentNameLbl)
		.setDisplayType('disabled');
	sublist.addField('custpage_lctn_name', 'text', displayLbl.locationNameLbl)
		.setDisplayType('disabled');
	sublist.addField('custpage_cls_name', 'text', displayLbl.classNameLbl)
		.setDisplayType('disabled');

	
	
	// columns for ids
	sublist.addField('custpage_china_acc', 'text', displayLbl.chinaAcntLbl)
		.setDisplayType('hidden');
	sublist.addField('custpage_ns_acc_id', 'text', displayLbl.accountIdLbl)
		.setDisplayType('hidden');
	sublist.addField('custpage_sbsdry', 'text', displayLbl.sbsdryLbl)
		.setDisplayType('hidden');
	sublist.addField('custpage_deptmnt', 'text', displayLbl.departmentLbl)
		.setDisplayType('hidden');
	sublist.addField('custpage_lctn', 'text', displayLbl.locationLbl)
		.setDisplayType('hidden');
	sublist.addField('custpage_cls', 'text', displayLbl.classLbl)
		.setDisplayType('hidden');

	return sublist;
}