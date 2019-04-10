/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Nov 2016     Veronica
 *
 */
triggernamespace("trigger.local.mappingcommon");


var common = new trigger.local.common();
var classlang = new trigger.local.language();
var lang = nlapiGetContext().getPreference('language');
var displayLbl = classlang.AccountMappingUI(lang);

trigger.local.mappingcommon = function() {}

trigger.local.mappingcommon.prototype = {
		
		/**
		 * Generates a list for Account Name field
		 * 
		 * @returns {String}
		 */
		 HTMLForAccountList : function() {
			var html = '<style type="text/css">';
			html += '#accountname{height:26px;width:300px;}';
			html += '.m_top{margin-top:5px;}';
			html += '</style>';
			html += '<div class="m_top"><span class="smallgraytextnolink uir-label">';
			html += '<a class="smallgraytextnolink">' + displayLbl.acntNameLbl + '</a></span></div>';
			html += '<div><select name="accountname" id="accountname" onchange="onSelectAccountNameChange()">';
			html += '<option selected value=-1></option>';
			var returnName = this.getAccountNameLists();
			for ( var key in returnName) {
				html += String.format('<option value="{0}">{1}</option>', key,
						returnName[key]);
			}
			html += '</select></div>';
			return html;
		},
		
		createFormBody : function(form) {
			try {
				
				var isInactiveChkBox = form.addField('isinactive', 'checkbox', displayLbl.inactiveLbl);
				
				var html = this.HTMLForAccountList();
				var acc = form.addField('custpage_accountname', 'inlinehtml', null,	null, null); // ACCOUNT NAME
				acc.setLayoutType('normal', 'none');
				acc.setDefaultValue(html);
				acc.setMandatory(true);

				var chinaAcc = form.addField('custpage_chinaaccountname', 'select', displayLbl.chinaAcntLbl);// CHINA ACCOUNT
				var chinaAcntNumberAndNameMap = {};
				var chinaAcntNumberMap = {};
				this.getChinaAccountNameLists(chinaAcntNumberAndNameMap,	chinaAcntNumberMap);

				for ( var k in chinaAcntNumberAndNameMap) {
					chinaAcc.addSelectOption(k, chinaAcntNumberAndNameMap[k]);
				}
				chinaAcc.setMandatory(true);

				var subsidiarySelect = form.addField( 'custrecord_trigger_ns_subsidiary', 'select',	displayLbl.sbsdryLbl);
				this.populateListWithSavedSearchResults('subsidiary', 'customsearch_trigger_subsidiars_clsfctn', subsidiarySelect);
				subsidiarySelect.setMandatory(true);

				var one2ManyChkBox = form.addField('custrecord_trigger_one_to_many', 'checkbox', displayLbl.one2manyChckBoxLbl);
				
				var netsuiteAccnt = form.addField('custrecord_trigger_netsuite_account', 'text', displayLbl.nsAccountLbl).setDisplayType('disabled');
				netsuiteAccnt.setLayoutType('normal', 'startcol');
				
				var accountIDSelect = form.addField('custrecord_trigger_ns_account_id', 'text',	displayLbl.accountIdLbl).setDisplayType('disabled');
				var chinaAcntNumberSelect = form.addField('custrecord_trigger_cn_account_number', 'select',	displayLbl.chinaAcntNumberLbl).setDisplayType('disabled');

				// populate china account numbers - start
				for ( var j in chinaAcntNumberMap) {
					chinaAcntNumberSelect.addSelectOption(j, chinaAcntNumberMap[j]);
				}

				// segments: Department, Location and Class
				var departmentSelect = form.addField('custrecord_trigger_ns_department', 'select', displayLbl.departmentLbl);
				departmentSelect.setLayoutType('normal', 'startcol');
				// use saved search to populate department values
				this.populateListWithSavedSearchResults('department', 'customsearch_trigger_departments_clsfctn', departmentSelect);

				// end of saved search

				var locationSelect = form.addField('custrecord_trigger_ns_location', 'select', displayLbl.locationLbl);
				this.populateListWithSavedSearchResults('location', 'customsearch_trigger_locations_clsfctn', locationSelect);

				var classSelect = form.addField('custrecord_trigger_ns_class', 'select', displayLbl.classLbl);
				this.populateListWithSavedSearchResults('classification', 'customsearch_trigger_classes_clsfctn', classSelect);
				
				return 0;
				
			} catch (ex) {
				nlapiLogExecution('DEBUG', 'createFormBody', ex.message);
				common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization', 'TN_SL_CN_COA_MappingForm', 'createFormBody', ex.message);
				return common.getReturnError('TN_SL_CN_COA_MappingForm, createFormBody Error: ' + ex.message);
			}
		},

		getAccountNameLists : function() {
			var map = {};
			var internalid;
			var name;
			var savedsearch = nlapiLoadSearch('account',
					'customsearch_trigger_account_lists');
			var resultset = savedsearch.runSearch();
			var resultslice = resultset.getResults(0, 1000);
			for (var i = 0; i < resultslice.length; i++) {
				internalid = resultslice[i].getValue('internalid', null, 'GROUP');
				name = resultslice[i].getValue('name', null, 'GROUP');
				map[internalid] = name;
			}
			return map;
		},
		
		getChinaAccountNameLists : function(acntNumberAndNameMap, acntNumberMap) {
			var internalid;
			var name;
			var cols = [];
			cols.push(new nlobjSearchColumn('name'));
			cols.push(new nlobjSearchColumn('custrecord_trigger_name_coa_cn'));
			var savedsearch = nlapiCreateSearch('customrecord_trigger_cn_coa', null,
					cols);
			var resultset = savedsearch.runSearch();
			for (var i = 0; i < 200; i++) {
				var resultslice = resultset.getResults(i * 1000, (i + 1) * 1000);
				if (resultslice.length <= 0) {
					break;
				} else {
					for (var j = 0; j < resultslice.length; j++) {
						internalid = resultslice[j].getId();
						name = resultslice[j].getValue(cols[0]) + ' '
								+ resultslice[j].getValue(cols[1]);
						acntNumberMap[internalid] = resultslice[j].getValue(cols[0]);
						acntNumberAndNameMap[internalid] = name;
					}
				}
				if (resultslice.length < 1000) {
					break;
				}
			}
		},
		
		populateListWithSavedSearchResults : function(searchRecordType, savedSearchID, selectList) {
			var map = {};
			var internalid;
			var name;
			var savedSearch = nlapiLoadSearch(searchRecordType, savedSearchID);// department,
																				// customsearch_trigger_departments_clsfctn
			var resultset = savedSearch.runSearch();
			var resultslice = resultset.getResults(0, 1000);
			// nlapiLogExecution('DEBUG', 'got ' + resultslice.length + ' from
			// savedSearch ' + savedSearchID);
			for (var i = 0; i < resultslice.length; i++) {
				internalid = resultslice[i].getValue('internalid', null, null);
				name = resultslice[i].getValue('name', null, null);
				// nlapiLogExecution('DEBUG','i = ' + i + 'internalid = ' + internalid +
				// ' name = ' + name);
				map[internalid] = name;
			}

			selectList.addSelectOption('', '');
			for ( var j in map) {
				selectList.addSelectOption(j, map[j]);
				// nlapiLogExecution('DEBUG', 'populate list=' + selectList, 'j=',
				// map[j]);
			}
		},
		
		/**
		 * uploads existing CN COA Mapping record by origRecordID number and populates the form with the parameters of this record.
		 * @param origRecordID
		 * @returns
		 */
		populateMappingFormWithExistingRecordData : function(origRecordID) {
			try {		
				var recordToEdit = nlapiLoadRecord('customrecord_trigger_mapping_cn_coa', origRecordID);			
				
				var nsAcc = recordToEdit.getFieldValue('custrecord_trigger_netsuite_account');	//NETSUITE ACCOUNT		
				nlapiSetFieldValue('custrecord_trigger_netsuite_account', nsAcc, false, true);
				
				var nsAccID = recordToEdit.getFieldValue('custrecord_trigger_ns_account_id');	//NETSUITE ACCOUNT ID
				nlapiSetFieldValue('custrecord_trigger_ns_account_id', nsAccID, false, true);
				
				//update Account Name		
				nlapiSetFieldValue('accountname', nsAccID, false, true);

				
				var chAcc = recordToEdit.getFieldValue('custrecord_trigger_cn_account_number');
				nlapiSetFieldValue('custrecord_trigger_cn_account_number', chAcc, false, true);
				
				
				//update CHINA ACCOUNT
				nlapiSetFieldValue('custpage_chinaaccountname', chAcc, false, true);
			
				var sbsdry = recordToEdit.getFieldValue('custrecord_trigger_ns_subsidiary');
				nlapiSetFieldValue('custrecord_trigger_ns_subsidiary', sbsdry, false, true);
				
				var isInactive = recordToEdit.getFieldValue('isinactive');
				nlapiSetFieldValue('isinactive', isInactive, true, true);
				
				var isO2MMapping = recordToEdit.getFieldValue('custrecord_trigger_one_to_many');
				nlapiSetFieldValue('custrecord_trigger_one_to_many', isO2MMapping, true, true);

//				var log = 'origRecordID = ' + origRecordID + ',  nsAcc = ' + nsAcc + ', nsAccID = ' + nsAccID + ', chAcc = ' + chAcc + ', sbsdry = ' + sbsdry + ', isO2MMapping = ' + isO2MMapping;

				if(isO2MMapping == 'T'){
					var dptmnt = recordToEdit.getFieldValue('custrecord_trigger_ns_department');
					nlapiSetFieldValue('custrecord_trigger_ns_department', dptmnt, false, true);
					
					var lctn = recordToEdit.getFieldValue('custrecord_trigger_ns_location');
					nlapiSetFieldValue('custrecord_trigger_ns_location', lctn, false, true);
					
					var cls = recordToEdit.getFieldValue('custrecord_trigger_ns_class');
					nlapiSetFieldValue('custrecord_trigger_ns_class', cls, false, true);
					
					nlapiSetFieldDisplay ('custrecord_trigger_ns_department', true);
					nlapiSetFieldDisplay ('custrecord_trigger_ns_location', true);
					nlapiSetFieldDisplay ('custrecord_trigger_ns_class', true);
					
					
//					log += 'dptmnt = ' + dptmnt + ',  lctn = ' + lctn + ', cls = ' + cls;				
				}
				else{
					nlapiSetFieldDisplay ('custrecord_trigger_ns_department', false);
					nlapiSetFieldDisplay ('custrecord_trigger_ns_location', false);
					nlapiSetFieldDisplay ('custrecord_trigger_ns_class', false);
				}	

//				nlapiLogExecution('DEBUG','populateMappingFormWithExistingRecordData',log);
				return 0;
			} catch (ex) {
				nlapiLogExecution('DEBUG','populateMappingFormWithExistingRecordData',ex.message);
				common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization', 'TN_MappingForm_Common', 'populateMappingFormWithExistingRecordData', ex.message);
				return common.getReturnError('TN_MappingForm_Common, populateMappingFormWithExistingRecordData Error: ' + ex.message);
			}
		},
		
		getURLForMappingList : function(mappingRcrdID) {
			try {
				var record = nlapiLoadRecord('customrecord_trigger_mapping_cn_coa', mappingRcrdID);
				var recordTypeInternalID = record.getFieldValue('rectype');
				
				var preURL = window.location.href.substring(0, window.location.href.indexOf('.com/') + 5);
				var mappingListURL = preURL + 'app/common/custom/custrecordentrylist.nl?rectype=' + recordTypeInternalID;
				
				return mappingListURL;
			} catch (ex) {
				nlapiLogExecution('DEBUG','getURLForMappingList' ,ex.message);
				common.sendErrorEmail('dev_support@triggerasia.com', 'FinLocalization', 'TN_MappingForm_Common', 'getURLForMappingList', ex.message);
				return common.getReturnError('TN_MappingForm_Common, getURLForMappingList Error: ' + ex.message);
			}	      
		}

}; //////end of class