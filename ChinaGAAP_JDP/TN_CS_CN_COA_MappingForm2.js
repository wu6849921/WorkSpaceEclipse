/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 09 Nov 2016 Veronica
 * 
 */

triggernamespace("trigger.local");

var common = new trigger.local.common();
var mappingCommon = new trigger.local.mappingcommon();
var classlang = new trigger.local.language();
var lang = nlapiGetContext().getPreference('language');
var displayTxt = classlang.AccountMappingUI(lang);

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type) {
	try {
		var url = window.location.href;
		var obj = common.convertUrlParasToObj(url);

		if (obj.mode == 'create') {
			// hide classification fields: department, class and location
			nlapiSetFieldDisplay('custrecord_trigger_ns_department', false);
			// nlapiSetFieldDisplay('custrecord_trigger_ns_location', false);
			nlapiSetFieldDisplay('custrecord_trigger_ns_class', false);
			nlapiSetFieldDisplay('isinactive', false);
		}

		if (obj.mode == 'edit') {
			nlapiSetFieldDisplay('isinactive', true);
			var recordID = obj.recordID;
			var showData = populateMappingFormWithExistingRecordData(recordID);
			if (showData.status == 'error') {
				throw showData.details;
			}
		}
		if (obj.mode == 'view') {
			nlapiSetFieldDisplay('isinactive', true);
			var recordID = obj.recordID;
			var showData = populateMappingFormWithExistingRecordData(recordID);
			document.getElementById('accountname').disabled = true;
			if (showData.status == 'error') {
				throw showData.details;
			}
		}

		// avoid the standard NetSuite warning message when navigating away
		if (window.onbeforeunload) {
			window.onbeforeunload = function() {
				null;
			};
		}
		;

	} catch (ex) {
		nlapiLogExecution('DEBUG', 'clientPageInit', ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'clientPageInit', ex.message);
	}

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {
	try {
		if (isSublistEmpty()) {
			alert(displayTxt.noMapingsToCreateMsg);
			nlapiLogExecution('DEBUG', 'clientSaveRecord',
					displayTxt.noMapingsToCreateMsg);
			return false;
		} else { // there are chosen mappings for creation
			var statusOfCreation = createNewMappingRecords();
			if (statusOfCreation.status == 'error') {
				throw statusOfCreation.details;
			} else { // if there weren't errors with creation, refresh the
				// list of line items
				var statusOfLineItemCleanup = cleanupLineItemsAfterMappingCreation();
				if (statusOfLineItemCleanup.status == 'error') {
					throw statusOfLineItemCleanup.details;
				}
			}
		}
		return false;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'clientSaveRecord', ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'clientSaveRecord', ex);
	}
}

function createNewMappingRecords() {
	try {
		var chinaAccnt;
		var nsAccnt;
		var nsAccntID;
		var sbsdry;
		var isMapped;
		var dptmnt;
		var lctn;
		var clss;
		var idOfCreatedRecord;
		var amountOfCreatedRecords = 0;
		var amountOfSkippedRecords = 0;
		var idListOfCreatedRecords = '';
		var sublistLenght = nlapiGetLineItemCount('custpage_sublist_cncoa_mapping');
		for (var i = 1; i <= sublistLenght; i++) {
			var currLineItemSelection = nlapiGetLineItemValue(
					'custpage_sublist_cncoa_mapping',
					'custpage_is_mapping_selected', i);

			if (currLineItemSelection == 'T') {
				chinaAccnt = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_china_acc',
						i);
				nsAccnt = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_ns_acc', i);
				nsAccntID = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_ns_acc_id',
						i);
//				isMapped = nlapiGetLineItemValue(
//						'custpage_sublist_cncoa_mapping',
//						'custpage_mapping2many', i);
				isMapped = 'F';
				dptmnt = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_deptmnt', i);
//				lctn = nlapiGetLineItemValue('custpage_sublist_cncoa_mapping',
//						'custpage_lctn', i);
				lctn ='';
				clss = nlapiGetLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_cls', i);
				sbsdry = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_sbsdry', i);

				var needToCreate = isNeedToCreateNewMapping(chinaAccnt,
						nsAccntID, sbsdry, isMapped, dptmnt, lctn, clss);
				if (needToCreate.status == 'error') {
					throw needToCreate.details;
				}
				if (needToCreate) {
					idOfCreatedRecord = createMappingRecord(chinaAccnt,
							nsAccnt, nsAccntID, sbsdry, isMapped, dptmnt, lctn,
							clss);
					amountOfCreatedRecords++;
					if (amountOfCreatedRecords == 1) {
						idListOfCreatedRecords += idOfCreatedRecord;
					} else {
						idListOfCreatedRecords += ', ' + idOfCreatedRecord;
					}
				} else {
					amountOfSkippedRecords++;
				}
			}
		}

		alert('Amount of new created mappings is: ' + amountOfCreatedRecords
				+ '\nCreated Record IDs are: ' + idListOfCreatedRecords
				+ '\nAmount of the skipped records is: '
				+ amountOfSkippedRecords);

		return 0;
	} catch (ex) {
		alert(ex.message);
		nlapiLogExecution('DEBUG', 'createNewMappingRecords', ex.message);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, createNewMappingRecords Error: '
						+ ex);
	}
}

/**
 * Checks if the existing mapping already have the new one.The following
 * scenario is verified: if isMapped is F, then check is there is existing
 * mapping for the requested chinaAccnt and nsAccntID. If such mapping exists,
 * return falsec If isMapped is T, then check the existing mapping if it already
 * exists. If the requested mapping exists return false. Otherwise return true.
 * Returns true if there is a need to create a new mapping, otherwise returns
 * false
 * 
 * @param chinaAccnt
 * @param nsAccntID
 * @param sbsdry
 * @param isMapped
 *            isOneToMany mapping checkbox value
 * @param dptmnt
 * @param lctn
 * @param clss
 * @returns {Boolean}
 */
function isNeedToCreateNewMapping(chinaAccnt, nsAccntID, sbsdry, isMapped,
		dptmnt, lctn, clss) {
	try {
		var rslt = false;
		if (isMapped == 'F') {
			var isMappingExist = isAlreadyExistingMapping(chinaAccnt,
					nsAccntID, sbsdry, null);
			if (isMappingExist.status == 'error') {
				throw isMappingExist.details;
			}
			// nlapiLogExecution('DEBUG', 'isNeedToCreateNewMapping', 'CHECKING
			// Existing Mapping for isMapped == F for NS_Account ID= ' +
			// nsAccntID + ' and China_Account=' + chinaAccnt + ',
			// mappedDepartment=' + dptmnt + ', mappedLocation=' + lctn + ',
			// mappedClass=' + clss +' DoesHaveExistingMapping: ' +
			// isMappingExist);
			if (!isMappingExist) { // if no mappings exist, need to create a
				// new mapping
				rslt = true;
			}
		} else { // support special verification for multi mapping isMapped
			// == 'T'
			// nlapiLogExecution('DEBUG', 'isNeedToCreateNewMapping', 'CHECKING
			// Existing Mapping for isMapped == T for NS_Account ID= ' +
			// nsAccntID +
			// ' and China_Account=' + chinaAccnt + ', mappedDepartment=' +
			// dptmnt +
			// ', mappedLocation=' + lctn + ', mappedClass=' + clss);
			var isOne2OneMappingExist = isAlreadyExistingMappedValueMapping(
					chinaAccnt, nsAccntID, sbsdry, 'F');
			if (isOne2OneMappingExist.status == 'error') {
				throw isOne2OneMappingExist.details;
			}
			// nlapiLogExecution('DEBUG', 'isNeedToCreateNewMapping', '1.
			// checking Existing Mapping for isOne2many == F, Result: ' +
			// isOne2OneMappingExist);
			if (!isOne2OneMappingExist) { // if one2one mapping doesn't
				// exists, check the existence of
				// the same mapping as a new one
				var isTheSameExist = isAlreadyExistingMultipleValueMappingWithClassification(
						chinaAccnt, nsAccntID, sbsdry, dptmnt, lctn, clss, null);
				if (isTheSameExist.status == 'error') {
					throw isTheSameExist.details;
				}
				// nlapiLogExecution('DEBUG', 'isNeedToCreateNewMapping', '2.
				// checking isTheSame exist for OneToMany, Result: ' +
				// isTheSameExist);
				if (!isTheSameExist) {
					rslt = true;
				}
			}
		}
		return rslt;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'isNeedToCreateNewMapping', ex.message);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, isNeedToCreateNewMapping Error: '
						+ ex);
	}

}

/**
 * Returns true if mapping for provided values is already exists. Otherwise,
 * returns false.
 * 
 * @param chinaAccnt
 * @param nsAccntID
 * @param sbsdry
 * @param isOne2ManyMapping
 *            if the value is null, then this field is not referenced as a
 *            filter
 * @returns {Boolean}
 */
function isAlreadyExistingMapping(chinaAccnt, nsAccntID, sbsdry,
		isOne2ManyMapping) {
	var result = false;
	var filters = [];
	filters[0] = new nlobjSearchFilter('custrecord_trigger_ns_account_id',
			null, 'is', nsAccntID);// NS account ID
	filters[1] = new nlobjSearchFilter('custrecord_trigger_cn_account_number',
			null, 'anyof', [ chinaAccnt ]);// china account
	filters[2] = new nlobjSearchFilter('custrecord_trigger_ns_subsidiary',
			null, 'is', sbsdry);

	if (isOne2ManyMapping != null) {
		filters[3] = new nlobjSearchFilter('custrecord_trigger_one_to_many',
				null, 'is', isOne2ManyMapping);
	}
	try {
		var savedSearch = nlapiLoadSearch(
				'customrecord_trigger_mapping_cn_coa',
				'customsearch_trigger_mapping_cn_coa');
		savedSearch.setFilters(null);
		savedSearch.addFilters(filters);
		var resultSet = savedSearch.runSearch();
		var rslt = resultSet.getResults(0, 1000);
		if (rslt != null && rslt.length >= 1) {// mapping already exists
			result = true;
		}

		savedSearch.setFilters(null);
		return result;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'isAlreadyExistingMapping', ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'isAlreadyExistingMapping', ex);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, isAlreadyExistingMapping Error: '
						+ ex);
	}
}

/**
 * Returns true if mapping for provided values is already exists. Otherwise,
 * returns false.
 * 
 * @param chinaAccnt
 * @param nsAccntID
 * @param isOneTwoMany
 * @param sbsdry
 * @returns {Boolean}
 */
function isAlreadyExistingMappedValueMapping(chinaAccnt, nsAccntID, sbsdry,
		isOneTwoMany) {
	try {
		var result = false;
		var filters = [];
		filters[0] = new nlobjSearchFilter('custrecord_trigger_ns_account_id',
				null, 'is', nsAccntID);// NS account ID
		filters[1] = new nlobjSearchFilter(
				'custrecord_trigger_cn_account_number', null, 'anyof',
				[ chinaAccnt ]);// china account
		filters[2] = new nlobjSearchFilter('custrecord_trigger_ns_subsidiary',
				null, 'is', sbsdry);
		filters[3] = new nlobjSearchFilter('custrecord_trigger_one_to_many',
				null, 'is', isOneTwoMany);// oneToMany mapping : T/F

		var savedSearch = nlapiLoadSearch(
				'customrecord_trigger_mapping_cn_coa',
				'customsearch_trigger_mapping_cn_coa');
		savedSearch.setFilters(null);
		savedSearch.addFilters(filters);
		var resultSet = savedSearch.runSearch();
		var rslt = resultSet.getResults(0, 1000);
		if (rslt != null && rslt.length >= 1) {// mapping already exists
			// nlapiLogExecution('DEBUG', 'isAlreadyExistingMappedValueMapping',
			// 'SavedSearch RESULT: has existing mappings for filter values:
			// NSAccntID = ' + nsAccntID + ' chinaAccntID = ' + chinaAccnt + '
			// isOne2Many = ' + isOneTwoMany);
			result = true;
		}

		savedSearch.setFilters(null);
		return result;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'isAlreadyExistingMappedValueMapping',
				ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm',
				'isAlreadyExistingMappedValueMapping', ex);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, isAlreadyExistingMappedValueMapping Error: '
						+ ex);
	}
}

/**
 * Checks if the mapping of type 1ToMany with the provided parameters exactly
 * already exists
 * 
 * @param chinaAccnt
 * @param nsAccntID
 * @param sbsdry
 * @param mappedDepartment
 * @param mappedLocation
 * @param mappedClass
 * @returns {Boolean}
 */
function isAlreadyExistingMultipleValueMappingWithClassification(chinaAccnt,
		nsAccntID, sbsdry, mappedDepartment, mappedLocation, mappedClass,
		origRecID) {
	var isOneTwoMany = 'T';
	var result = false;
	try {
		var filters = [];
		filters[0] = new nlobjSearchFilter('custrecord_trigger_ns_account_id',
				null, 'is', nsAccntID);// NS account ID
		filters[1] = new nlobjSearchFilter(
				'custrecord_trigger_cn_account_number', null, 'anyof',
				[ chinaAccnt ]);// china account
		filters[2] = new nlobjSearchFilter('custrecord_trigger_ns_subsidiary',
				null, 'is', sbsdry);
		filters[3] = new nlobjSearchFilter('custrecord_trigger_one_to_many',
				null, 'is', isOneTwoMany);

		if (common.isEmpty(mappedDepartment)) {
			filters[4] = new nlobjSearchFilter(
					'custrecord_trigger_ns_department', null, 'anyof', '@NONE@');
		} else {
			filters[4] = new nlobjSearchFilter(
					'custrecord_trigger_ns_department', null, 'is',
					mappedDepartment);
		}

		// if (common.isEmpty(mappedLocation)) {
		// filters[5] = new nlobjSearchFilter(
		// 'custrecord_trigger_ns_location', null, 'anyof', '@NONE@');
		// } else {
		// filters[5] = new nlobjSearchFilter(
		// 'custrecord_trigger_ns_location', null, 'is',
		// mappedLocation);
		// }

		if (common.isEmpty(mappedClass)) {
			filters[6] = new nlobjSearchFilter('custrecord_trigger_ns_class',
					null, 'anyof', '@NONE@');
		} else {
			filters[6] = new nlobjSearchFilter('custrecord_trigger_ns_class',
					null, 'is', mappedClass);
		}

		if (origRecID != null) {
			filters[7] = new nlobjSearchFilter('internalid', null, 'is',
					origRecID);
		}

		var sc = nlapiLoadSearch('customrecord_trigger_mapping_cn_coa',
				'customsearch_trigger_mapping_cn_coa');
		sc.setFilters(null);
		sc.addFilters(filters);

		var resultSet = sc.runSearch();
		var rts = resultSet.getResults(0, 1000); // need to check that there
		// is one existing mapping.
		// no need to go through all
		// the results

		if (rts != null && rts.length >= 1) {
			result = true;
		}

		return result;

	} catch (ex) {
		nlapiLogExecution('DEBUG',
				'isAlreadyExistingMultipleValueMappingWithClassification',
				ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm',
				'isAlreadyExistingMultipleValueMappingWithClassification',
				ex.message);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, isAlreadyExistingMultipleValueMappingWithClassification Error: '
						+ ex);
	}
}

/**
 * Goes through the LineItems elements. Returns true, if at least one of the
 * line item is selected. Otherwise, returns false
 */
function isSublistEmpty() {
	var sublistLenght = nlapiGetLineItemCount('custpage_sublist_cncoa_mapping');
	for (var i = 1; i <= sublistLenght; i++) {
		var currLineItemSelection = nlapiGetLineItemValue(
				'custpage_sublist_cncoa_mapping',
				'custpage_is_mapping_selected', i);
		if (currLineItemSelection == 'T') {
			return false;
		}
	}
	return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function fieldChange(type, name, linenum) {
	try {
		if (name == 'custpage_chinaaccountname') { // update the disabled value
			// of china account number
			// when field 'China
			// Account' value is changed
			var val = nlapiGetFieldValue(name);
			nlapiSetFieldValue('custrecord_trigger_cn_account_number', val,
					false, true);
		} else if (name == 'custrecord_trigger_one_to_many') {// if checkbox
			// is F, remove
			// the values
			// and make the
			// fields grey
			// for
			// department,
			// location and
			// class
			if (nlapiGetFieldValue(name) == 'F') {
				// hide classification fields and init their values
				nlapiSetFieldDisplay('custrecord_trigger_ns_department', false);
				// nlapiSetFieldDisplay('custrecord_trigger_ns_location',
				// false);
				nlapiSetFieldDisplay('custrecord_trigger_ns_class', false);
			} else {
				// show classification fields
				nlapiSetFieldDisplay('custrecord_trigger_ns_department', true);
				// nlapiSetFieldDisplay('custrecord_trigger_ns_location', true);
				nlapiSetFieldDisplay('custrecord_trigger_ns_class', true);
			}
		}
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'fieldChange', ex);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'fieldChange', ex.message);
	}
}

function onSelectAccountNameChange() {
	try {
		var o = document.getElementById("accountname");
		var n = o.selectedIndex;
		var targetid = document
				.getElementById("custrecord_trigger_ns_account_id");
		var targetname = document
				.getElementById("custrecord_trigger_netsuite_account");

		targetid.value = o.options[n].value;
		targetname.value = o.options[n].text;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'onSelectAccountNameChange', ex);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'onSelectAccountNameChange',
				ex.message);
	}
}

/**
 * A trigger for Add button. When SUBSIDIARY field is non-empty, creates new
 * line in mapping list area and populates it with provided values
 * 
 * @param chAcc
 *            china account
 * @param nsAcc
 *            netSuite account
 * @param nsAccID
 *            netSuite account ID
 * @param sbsdry
 *            subsidiary
 * @param isO2MMapping
 *            is oneToMany mapping
 * @param dptmnt
 *            department
 * @param lctn
 *            location
 * @param cls
 *            class
 */
function addMappingToTheWaitingList() {
	try {
		// arguments for Add button
		var chAcc = nlapiGetFieldValue('custrecord_trigger_cn_account_number');
		var chAccName = nlapiGetFieldText('custpage_chinaaccountname');// CHINA
		// ACCOUNT
		// NAME
		var nsAcc = nlapiGetFieldValue('custrecord_trigger_netsuite_account');
		var nsAccID = nlapiGetFieldValue('custrecord_trigger_ns_account_id');
		var sbsdry = nlapiGetFieldValue('custrecord_trigger_ns_subsidiary');
		var sbsdryName = nlapiGetFieldText('custrecord_trigger_ns_subsidiary');// SBSDRY
		// NAME
		var isO2MMapping = nlapiGetFieldValue('custrecord_trigger_one_to_many');
		var dptmnt = nlapiGetFieldValue('custrecord_trigger_ns_department');
		var dptmntName = nlapiGetFieldText('custrecord_trigger_ns_department');// DEPARTMENT
		// NAME
		// var lctn = nlapiGetFieldValue('custrecord_trigger_ns_location');joe
		var lctn = '';
		// var lctnName = nlapiGetFieldText('custrecord_trigger_ns_location');//
		// LOCATION
		var lctnName = ''; // name
		var cls = nlapiGetFieldValue('custrecord_trigger_ns_class');
		var clsName = nlapiGetFieldText('custrecord_trigger_ns_class');// CLASS
		// name

		var isInputValid = isValidMapping(sbsdry, isO2MMapping, dptmnt, lctn,
				cls);
		if (isInputValid.status == 'error') {
			throw isInputValid.details;
		}
		if (isInputValid) {
			nlapiSelectNewLineItem('custpage_sublist_cncoa_mapping');
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_is_mapping_selected', 'T', false, true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_china_acc_name', chAccName, false, true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_ns_acc', nsAcc, false, true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_sbsdry_name', sbsdryName, false, true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_mapping2many', isO2MMapping, false, true);

			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_china_acc', chAcc, false, true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_ns_acc_id', nsAccID, false, true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_sbsdry', sbsdry, false, true);

			if (isO2MMapping == 'T') { // populate classification values only
				// for 12Many mapping chosen
				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_deptmnt_name', dptmntName, false, true);
				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_deptmnt', dptmnt, false, true);

				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_lctn_name', lctnName, false, true);
				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_lctn', lctn, false, true);

				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_cls_name', clsName, false, true);
				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_cls', cls, false, true);
			}
			nlapiCommitLineItem('custpage_sublist_cncoa_mapping');
		}
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'addMappingToTheWaitingList', ex);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'addMappingToTheWaitingList',
				ex.message);
	}
}

/**
 * Validates if values for Account Name and Subsidiary were chosen, then return
 * true. Otherwise return false.
 * 
 * @param sbsdry
 * @param isO2MMapping
 * @param dptmnt
 * @param lctn
 * @param cls
 * @returns {Boolean}
 */
function isValidMapping(sbsdry, isO2MMapping, dptmnt, lctn, cls) {
	try {
		var obj = document.getElementById("accountname");
		var ndx = obj.selectedIndex;
		if (ndx == '0') {
			alert(displayTxt.missingAccountNameValue);
			return false;
		}
		if (common.isEmpty(sbsdry)) {// subsidiary validation
			alert(displayTxt.missingSubsidiaryValue);
			return false;
		}

		if (isO2MMapping == 'T') {
			if (common.isEmpty(dptmnt) && common.isEmpty(lctn)
					&& common.isEmpty(cls)) {
				alert(displayTxt.missingClassificationValuesMsg);
				return false;
			}
		}
		return true;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'isValidMapping', ex);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'isValidMapping', ex.message);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, isValidMapping Error: '
						+ ex);
	}
}

/**
 * Creates CN COA Mapping record
 * 
 * @param chnaAccnt
 * @param nsAccnt
 * @param nsAccntID
 * @param sbsdr
 * @param isMapped
 * @param dptmnt
 * @param lctn
 * @param clss
 * @returns ID of the new created record
 */
function createMappingRecord(chnaAccnt, nsAccnt, nsAccntID, sbsdr, isMapped,
		dptmnt, lctn, clss) {
	try {
		var rec = nlapiCreateRecord('customrecord_trigger_mapping_cn_coa');

		rec.setFieldValue('custrecord_trigger_cn_account_number', chnaAccnt);
		rec.setFieldValue('custrecord_trigger_ns_account_id', nsAccntID);
		rec.setFieldValue('custrecord_trigger_netsuite_account', nsAccnt);
		rec.setFieldValue('custrecord_trigger_ns_subsidiary', sbsdr);
		rec.setFieldValue('isinactive', 'F');
		rec.setFieldValue('custrecord_trigger_one_to_many', isMapped);
		if (isMapped == 'T') {
			if (!common.isEmpty(dptmnt)) {
				rec.setFieldValue('custrecord_trigger_ns_department', dptmnt);
			}

			// if (!common.isEmpty(lctn)) {
			// rec.setFieldValue('custrecord_trigger_ns_location', lctn);
			// }

			if (!common.isEmpty(clss)) {
				rec.setFieldValue('custrecord_trigger_ns_class', clss);
			}
		}

		var recordID = nlapiSubmitRecord(rec);
		return recordID;

	} catch (ex) {
		nlapiLogExecution('DEBUG', 'createMappingRecord', ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'createMappingRecord', ex.message);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, createMappingRecord Error: '
						+ ex.message);
	}
}

/**
 * The function refreshes line items and keeps only line items that weren't
 * chosen for creation. The steps for execution are: - Go through lineitem list
 * and removes all the lines. Before the removal in case the line item wasnt
 * marked for creation , will store all line item columns aside - Create new
 * line items from data of non chosen line items that was stored aside.
 * 
 * @returns
 */
function cleanupLineItemsAfterMappingCreation() {
	var listItemsToKeep = [];
	var currElementForList = {};

	try {
		var sublistLenght = nlapiGetLineItemCount('custpage_sublist_cncoa_mapping');
		// remove all the line items , keep aside only line items that weren't
		// chosen for mapping creation
		for (var i = sublistLenght; i >= 1; i--) {
			var currLineItemSelection = nlapiGetLineItemValue(
					'custpage_sublist_cncoa_mapping',
					'custpage_is_mapping_selected', i);

			if (currLineItemSelection == 'F') {
				currElementForList = {};
				currElementForList.chinaAccntName = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping',
						'custpage_china_acc_name', i); // china accnt name
				currElementForList.chinaAccnt = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_china_acc',
						i);
				currElementForList.nsAccnt = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_ns_acc', i);
				currElementForList.nsAccntID = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_ns_acc_id',
						i);
				currElementForList.sbsdrName = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping',
						'custpage_sbsdry_name', i);// subsidiary name
				currElementForList.sbsdr = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_sbsdry', i);
				currElementForList.isMapped = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping',
						'custpage_mapping2many', i);
				currElementForList.dptmntName = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping',
						'custpage_deptmnt_name', i);// department name
				currElementForList.dptmnt = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_deptmnt', i);
				currElementForList.lctnName = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_lctn_name',
						i);// location name
				currElementForList.lctn = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_lctn', i);
				currElementForList.clssName = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_cls_name',
						i);// class name
				currElementForList.clss = nlapiGetLineItemValue(
						'custpage_sublist_cncoa_mapping', 'custpage_cls', i);

				listItemsToKeep.push(currElementForList);
			}

			nlapiRemoveLineItem('custpage_sublist_cncoa_mapping', i);
		}

		// create new line items from the list
		for (var j = 0; j < listItemsToKeep.length; j++) {
			var curElementWithData = listItemsToKeep[j];
			nlapiSelectNewLineItem('custpage_sublist_cncoa_mapping');
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_is_mapping_selected', 'F', false, true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_china_acc_name',
					curElementWithData.chinaAccntName, false, true);// china
			// accnt
			// name
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_china_acc', curElementWithData.chinaAccnt, false,
					true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_ns_acc', curElementWithData.nsAccnt, false, true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_ns_acc_id', curElementWithData.nsAccntID, false,
					true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_sbsdry_name', curElementWithData.sbsdrName,
					false, true);// subsidiary name
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_sbsdry', curElementWithData.sbsdr, false, true);
			nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
					'custpage_mapping2many', curElementWithData.isMapped,
					false, true);
			if (curElementWithData.isMapped == 'T') { // populate
				// classification values
				// only for 12Many
				// mapping chosen
				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_deptmnt_name', curElementWithData.dptmntName,
						false, true);// department name
				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_deptmnt', curElementWithData.dptmnt, false,
						true);
				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_lctn_name', curElementWithData.lctnName,
						false, true);// location name
				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_lctn', curElementWithData.lctn, false, true);
				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_cls_name', curElementWithData.clssName,
						false, true);// class name
				nlapiSetCurrentLineItemValue('custpage_sublist_cncoa_mapping',
						'custpage_cls', curElementWithData.clss, false, true);
			}
			nlapiCommitLineItem('custpage_sublist_cncoa_mapping');
		}
		return 0;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'cleanupLineItemsAfterMappingCreation',
				ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm',
				'cleanupLineItemsAfterMappingCreation', ex.message);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, cleanupLineItemsAfterMappingCreation Error: '
						+ ex.message);
	}
}

/**
 * uploads existing CN COA Mapping record by origRecordID number and populates
 * the form with the parameters of this record.
 * 
 * @param origRecordID
 * @returns
 */
function populateMappingFormWithExistingRecordData(origRecordID) {
	try {
		var recordToEdit = nlapiLoadRecord(
				'customrecord_trigger_mapping_cn_coa', origRecordID);

		var nsAcc = recordToEdit
				.getFieldValue('custrecord_trigger_netsuite_account'); // NETSUITE
		// ACCOUNT
		nlapiSetFieldValue('custrecord_trigger_netsuite_account', nsAcc, false,
				true);

		var nsAccID = recordToEdit
				.getFieldValue('custrecord_trigger_ns_account_id'); // NETSUITE
		// ACCOUNT
		// ID
		nlapiSetFieldValue('custrecord_trigger_ns_account_id', nsAccID, false,
				true);

		// update Account Name
		nlapiSetFieldValue('accountname', nsAccID, false, true);

		var chAcc = recordToEdit
				.getFieldValue('custrecord_trigger_cn_account_number');
		nlapiSetFieldValue('custrecord_trigger_cn_account_number', chAcc,
				false, true);

		// update CHINA ACCOUNT
		nlapiSetFieldValue('custpage_chinaaccountname', chAcc, false, true);

		var sbsdry = recordToEdit
				.getFieldValue('custrecord_trigger_ns_subsidiary');
		nlapiSetFieldValue('custrecord_trigger_ns_subsidiary', sbsdry, false,
				true);

		var isInactive = recordToEdit.getFieldValue('isinactive');
		nlapiSetFieldValue('isinactive', isInactive, true, true);

		var isO2MMapping = recordToEdit
				.getFieldValue('custrecord_trigger_one_to_many');
		nlapiSetFieldValue('custrecord_trigger_one_to_many', isO2MMapping,
				true, true);

		// var log = 'origRecordID = ' + origRecordID + ', nsAcc = ' + nsAcc +
		// ', nsAccID = ' + nsAccID + ', chAcc = ' + chAcc + ', sbsdry = ' +
		// sbsdry + ', isO2MMapping = ' + isO2MMapping;

		if (isO2MMapping == 'T') {
			var dptmnt = recordToEdit
					.getFieldValue('custrecord_trigger_ns_department');
			nlapiSetFieldValue('custrecord_trigger_ns_department', dptmnt,
					false, true);

			// var lctn = recordToEdit
			// .getFieldValue('custrecord_trigger_ns_location');
			// nlapiSetFieldValue('custrecord_trigger_ns_location', lctn, false,
			// true);

			var cls = recordToEdit.getFieldValue('custrecord_trigger_ns_class');
			nlapiSetFieldValue('custrecord_trigger_ns_class', cls, false, true);

			nlapiSetFieldDisplay('custrecord_trigger_ns_department', true);
			// nlapiSetFieldDisplay('custrecord_trigger_ns_location', true);
			nlapiSetFieldDisplay('custrecord_trigger_ns_class', true);

			// log += 'dptmnt = ' + dptmnt + ', lctn = ' + lctn + ', cls = ' +
			// cls;
		} else {
			nlapiSetFieldDisplay('custrecord_trigger_ns_department', false);
			// nlapiSetFieldDisplay('custrecord_trigger_ns_location', false);
			nlapiSetFieldDisplay('custrecord_trigger_ns_class', false);
		}
		// alert(log);
		// nlapiLogExecution('DEBUG','populateMappingFormWithExistingRecordData',log);
		return 0;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'populateMappingFormWithExistingRecordData',
				ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm',
				'populateMappingFormWithExistingRecordData', ex.message);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, populateMappingFormWithExistingRecordData Error: '
						+ ex.message);
	}
}

/**
 * Edit the required record if the following scenarios are true If the
 * newOne2ManyMappings is F if the existing mapping newChinaAcc, newNSAccntID,
 * newSubsidary is the current record OR there is no existing mapping for
 * newChinaAcc, newNSAccID, newSubsidiary, then edit the record. else show the
 * message that the record will not be updated If the newOne2ManyMappings is T
 * if there is existing mapping with newChinaAcc, newNSAccID, newSubsidiary,
 * isOne2ManyMapping is 'F' and it has the same recordID as origRecordID, then
 * edit the record if there is no existing mapping with newChinaAcc, newNSAccID,
 * newSubsidiary, isOne2ManyMapping is 'F' and the new mapping with required
 * classification doesn't exist then edit the record else show the message that
 * the record will not be updated
 * 
 * @param origRecordID
 * @returns
 */
function editMappingRecord(origRecordID) {
	try {
		var isInactive = nlapiGetFieldValue('isinactive');
		// var isO2MMapping =
		// nlapiGetFieldValue('custrecord_trigger_one_to_many'); joe
		var isO2MMapping = 'F';
		var chAcc = nlapiGetFieldValue('custrecord_trigger_cn_account_number');
		var nsAccnt = nlapiGetFieldValue('custrecord_trigger_netsuite_account');
		var nsAccID = nlapiGetFieldValue('custrecord_trigger_ns_account_id');
		var sbsdry = nlapiGetFieldValue('custrecord_trigger_ns_subsidiary');
		var dptmnt = nlapiGetFieldValue('custrecord_trigger_ns_department');
		// var lctn = nlapiGetFieldValue('custrecord_trigger_ns_location');
		var lctn = '';
		var clss = nlapiGetFieldValue('custrecord_trigger_ns_class');

		var wasRcrdEdited = false;

		var rcrdID = null;

		var isInputValid = isValidMapping(sbsdry, isO2MMapping, dptmnt, lctn,
				clss);
		if (isInputValid.status == 'error') {
			throw isInputValid.details;
		}
		if (isInputValid) {
			if (isO2MMapping == 'F') {
				var existingMappings = getExistingMappings(chAcc, nsAccID,
						sbsdry, null);

				if (existingMappings == null || existingMappings.length == 0) {
					rcrdID = updateMappingRecord(origRecordID, chAcc, nsAccnt,
							nsAccID, sbsdry, isO2MMapping, null, null, null,
							isInactive);
					alert(displayTxt.successRecordEditMsg);
					wasRcrdEdited = true;
				} else if (existingMappings.length == 1) {
					// check internal id if the same - edit, if different -
					// don't edit
					var existingRecID = existingMappings[0]
							.getValue('internalid');
					if (existingRecID == origRecordID) {
						rcrdID = updateMappingRecord(origRecordID, chAcc,
								nsAccnt, nsAccID, sbsdry, isO2MMapping, null,
								null, null, isInactive);
						alert(displayTxt.successRecordEditMsg);
						wasRcrdEdited = true;
					} else {
						alert(displayTxt.notEditableRecordMsg);
					}
				} else {
					alert(displayTxt.notEditableRecordMsg);
				}
			} else if (isO2MMapping == 'T') {
				var existingMappings = getExistingMappings(chAcc, nsAccID,
						sbsdry, 'F');

				if (existingMappings != null && existingMappings.length == 1) {
					// check internal id if the same - edit, if different -
					// don't edit
					var existingRecID = existingMappings[0]
							.getValue('internalid');
					if (existingRecID == origRecordID) {
						rcrdID = updateMappingRecord(origRecordID, chAcc,
								nsAccnt, nsAccID, sbsdry, isO2MMapping, dptmnt,
								lctn, clss, isInactive);
						alert(displayTxt.successRecordEditMsg);
						wasRcrdEdited = true;
					} else {
						alert(displayTxt.notEditableRecordMsg);
					}
				} else if ((existingMappings == null || existingMappings.length == 0)
						&& !isAlreadyExistingMultipleValueMappingWithClassification(
								chAcc, nsAccID, sbsdry, dptmnt, lctn, clss,
								null)) {// no F and no the same T mapping, edit
					// record
					rcrdID = updateMappingRecord(origRecordID, chAcc, nsAccnt,
							nsAccID, sbsdry, isO2MMapping, dptmnt, lctn, clss,
							isInactive);
					alert(displayTxt.successRecordEditMsg);
					wasRcrdEdited = true;
				} else if (isAlreadyExistingMultipleValueMappingWithClassification(
						chAcc, nsAccID, sbsdry, dptmnt, lctn, clss,
						origRecordID)) {// if current record is the same as a
					// new record then edit
					rcrdID = updateMappingRecord(origRecordID, chAcc, nsAccnt,
							nsAccID, sbsdry, isO2MMapping, dptmnt, lctn, clss,
							isInactive);
					alert(displayTxt.successRecordEditMsg);
					wasRcrdEdited = true;
				} else {
					alert(displayTxt.notEditableRecordMsg);
				}
			}

			if (wasRcrdEdited) {
				var mappingListURL = mappingCommon
						.getURLForMappingList(origRecordID);
				if (mappingListURL.status == 'error') {
					throw mappingListURL.details;
				}

				window.location.href = mappingListURL;
			}
		}
		return 0;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'editMappingRecord', ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'editMappingRecord', ex.message);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, editMappingRecord Error: '
						+ ex.message);
	}
}

function isExistRecordWithSrcAndTarget(chAcc, nsAccID, sbsdry, origRecordID,
		isMapped2Many) {
	var result = false;
	var filters = [];
	filters[0] = new nlobjSearchFilter('custrecord_trigger_ns_account_id',
			null, 'is', nsAccID);// NS account ID
	filters[1] = new nlobjSearchFilter('custrecord_trigger_cn_account_number',
			null, 'anyof', [ chAcc ]);// china account
	filters[2] = new nlobjSearchFilter('custrecord_trigger_ns_subsidiary',
			null, 'is', sbsdry);
	filters[3] = new nlobjSearchFilter('internalid', null, 'is', origRecordID);
	if (isMapped2Many != null) {
		filters[4] = new nlobjSearchFilter('custrecord_trigger_one_to_many',
				null, 'is', isMapped2Many);
	}
	try {
		var savedSearch = nlapiLoadSearch(
				'customrecord_trigger_mapping_cn_coa',
				'customsearch_trigger_mapping_cn_coa');
		savedSearch.setFilters(null);
		savedSearch.addFilters(filters);
		var resultSet = savedSearch.runSearch();
		var rslt = resultSet.getResults(0, 1000);
		if (rslt != null && rslt.length == 1) {// mapping already exists
			result = true;
		}
		savedSearch.setFilters(null);
		return result;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'isAlreadyExistingMapping', ex.message);
		common
				.sendErrorEmail('dev_support@triggerasia.com',
						'FinLocalization', 'TN_CS_CN_COA_MappingForm',
						'isExistRecordWithSrcAndTarget', ex);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, isExistRecordWithSrcAndTarget Error: '
						+ ex);
	}
}

/**
 * Returns array of existing records in the DB based on the query of
 * chinaAccount, nsAccount and subsidiary.
 * 
 * @param chinaAccnt
 * @param nsAccntID
 * @param sbsdry
 * @param isOne2ManyMapping
 *            if the value is null, then this field is not referenced as a
 *            filter
 * @returns [] mapping records
 */
function getExistingMappings(chinaAccnt, nsAccntID, sbsdry, isMapped2Many) {
	var filters = [];
	filters[0] = new nlobjSearchFilter('custrecord_trigger_ns_account_id',
			null, 'is', nsAccntID);// NS account ID
	filters[1] = new nlobjSearchFilter('custrecord_trigger_cn_account_number',
			null, 'anyof', [ chinaAccnt ]);// china account
	filters[2] = new nlobjSearchFilter('custrecord_trigger_ns_subsidiary',
			null, 'is', sbsdry);
	if (isMapped2Many != null) {
		filters[3] = new nlobjSearchFilter('custrecord_trigger_one_to_many',
				null, 'is', isMapped2Many);
	}

	try {
		var savedSearch = nlapiLoadSearch(
				'customrecord_trigger_mapping_cn_coa',
				'customsearch_trigger_mapping_cn_coa');
		savedSearch.setFilters(null);
		savedSearch.addFilters(filters);
		var resultSet = savedSearch.runSearch();
		var rslt = resultSet.getResults(0, 1000);

		savedSearch.setFilters(null);
		return rslt;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'getExistingMappings', ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'getExistingMappings', ex);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, getExistingMappings Error: '
						+ ex);
	}
}

function updateMappingRecord(recordID, chnaAccnt, nsAccnt, nsAccntID, sbsdr,
		isMapped, dptmnt, lctn, clss, isInactive) {
	try {

		var rec = nlapiLoadRecord('customrecord_trigger_mapping_cn_coa',
				recordID);
		rec.setFieldValue('isinactive', isInactive);
		rec.setFieldValue('custrecord_trigger_cn_account_number', chnaAccnt);
		rec.setFieldValue('custrecord_trigger_ns_account_id', nsAccntID);
		rec.setFieldValue('custrecord_trigger_netsuite_account', nsAccnt);
		rec.setFieldValue('custrecord_trigger_ns_subsidiary', sbsdr);
		rec.setFieldValue('custrecord_trigger_one_to_many', isMapped);
		rec.setFieldValue('custrecord_trigger_ns_department', dptmnt);
//		rec.setFieldValue('custrecord_trigger_ns_location', lctn);
		rec.setFieldValue('custrecord_trigger_ns_class', clss);

		var recordID = nlapiSubmitRecord(rec);
		return recordID;

	} catch (ex) {
		alert(ex.message);
		nlapiLogExecution('DEBUG', 'updateMappingRecord', ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'updateMappingRecord', ex.message);
		return common
				.getReturnError('TN_CS_CN_COA_MappingForm, updateMappingRecord Error: '
						+ ex.message);
	}
}

/**
 * Delete the providied mapping by recordID. Redirect URL the page to the CN COA
 * mapping list.
 * 
 * @param origRecordID
 */
function deleteMappingRecord(origRecordID) {
	try {
		var mappingListURL = mappingCommon.getURLForMappingList(origRecordID);
		if (mappingListURL.status == 'error') {
			throw mappingListURL.details;
		}

		nlapiDeleteRecord('customrecord_trigger_mapping_cn_coa', origRecordID);
		alert(displayTxt.successRecordDeleteMsg);

		window.location.href = mappingListURL;

	} catch (ex) {
		nlapiLogExecution('DEBUG', 'deleteMappingRecord', ex.message);
		common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization',
				'TN_CS_CN_COA_MappingForm', 'deleteMappingRecord', ex.message);
		alert(displayTxt.failureRecordDeleteMsg);
	}
}