/**
 * Module Description: Multi-language Version Date Author Remarks 1.00 11 Oct
 * 2014 Winson.Chen
 * 
 * Chinese (Simplified) = 'zh_CN' Chinese (Traditional) = 'zh_TW' Danish =
 * 'da_DK' English (International) = 'en' English (U.S.) = 'en_US' French
 * (Canada) = 'fr_CA' French (France) = 'fr_FR' German = 'de_DE' Italian =
 * 'it_IT' Japanese = 'ja_JP' Korean = 'ko_KR' Nederlands = 'nl_NL' Portuguese
 * (Brazilian) = 'pt_BR' Russian = 'ru_RU' Spanish = 'es_ES' Swedish = 'sv_SE'
 * Thai = 'th_TH'
 */

function triggernamespace(ns) {
	if (typeof (ns) != 'string')
		return;
	ns = ns.split(".");
	var o, ni;
	for (var i = 0, len = ns.length; i < len, ni = ns[i]; i++) {
		try {
			o = (o ? (o[ni] = o[ni] || {}) : (eval(ni + '=' + ni + '||{};')));
		} catch (e) {
			o = eval(ni + '={};');
		}
	}
}

triggernamespace("trigger.local");

trigger.local.language = function() {
}
trigger.local.language.prototype = {
	constructor : trigger.local.language,
	/**
	 * User interface language
	 * 
	 * @param type
	 * @returns {___anonymous760_989}
	 */
	UIoptions : function(type) {
		var temp;
		switch (type) {
		case 'zh_CN':
			temp = {
				Voucher : 'ƾ֤',
				Profit : '�����',
				Detail : '��ϸ��',
				Journal : '�ռ���',
				Ledger : '����',
				SummaryLedger : '����ƽ���',
				BalanceSheet : '�ʲ���ծ��',
				// joe
				BalanceSheet1 : '�ʲ���ծ�����ڷ�����',
				BalanceSheet2 : '�ʲ���ծ����ĩ��',
				Subsidiary : '��˾����',
				DateFrom : '��ʼ����',
				DateTo : '��ֹ����',
				VoucherDateFromLbl : 'ƾ֤��ʼ����',
				VoucherDateToLbl : 'ƾ֤��������',
				ReportYear : '�������',
				BeginMonth : '�ڼ�',
				EndMonth : '�����ڼ�',
				COA : '��Ŀ'
			};
			break;
		default:
			temp = {
				Voucher : 'Voucher',
				Profit : 'Profit & Loss',
				Detail : 'Sub Ledger',
				Journal : 'Diary Ledger',
				Ledger : 'General Ledger',
				SummaryLedger : 'Trial Balance',
				// joe
				SummaryLedger1 : 'Trial Balance(Current Period)',
				SummaryLedger2 : 'Trial Balance(Ending Balance)',
				BalanceSheet : 'Balance Sheet',
				Subsidiary : 'Subsidiary',
				DateFrom : 'Start Date',
				DateTo : 'End Date',
				VoucherDateFromLbl : 'Voucher Date From',
				VoucherDateToLbl : 'Voucher Date To',
				ReportYear : 'Year',
				BeginMonth : 'Month',
				EndMonth : 'End Month',
				COA : 'CHART OF ACCOUNT'
			};
			break;
		}
		return temp;
	},

	AccountMappingUI : function(type) {
		var temp;
		switch (type) {
		case 'zh_CN':
			temp = {
				formTitle : '��Ŀӳ���',
				createMappings : '������Ŀӳ���',
				add : '���������嵥',
				editLbl : '���¼�¼',
				deleteLbl : 'ɾ����¼',
				acntNameLbl : '��Ŀ����',
				inactiveLbl : 'ͣ��',
				chinaAcntLbl : '�з���ƿ�Ŀ',
				chinaAcntNameLbl : '���Ŀ�Ŀ����',
				one2manyChckBoxLbl : '��NetSuiteϵͳ��Ŀӳ�䵽����з���ƿ�Ŀ',
				nsAccountLbl : 'NetSuiteϵͳ��Ŀ',
				accountIdLbl : 'NetSuiteϵͳ��ĿID',
				chinaAcntNumberLbl : '�з���ƿ�Ŀ����',
				departmentLbl : '����',
				departmentNameLbl : '��������',
				locationLbl : '�ص�',
				locationNameLbl : '�ص�����',
				classLbl : '����',
				classNameLbl : '������',
				sbsdryLbl : '�ӹ�˾',
				sbsdryNameLbl : '�ӹ�˾����',
				mappingLbl : '�������Ŀӳ���',
				selected : '��ѡ��',
				noMapingsToCreateMsg : '�޿ɴ�����ӳ���',
				missingSubsidiaryValue : '�ӹ�˾Ϊ�������ѡ���ӹ�˾',
				missingAccountNameValue : '��Ŀ����Ϊ���������д��Ŀ����',
				missingClassificationValuesMsg : '���з���հס�����һ�Զ��Ŀ��ӳ�䣬��������дһ�����·����е�һ�������ţ��ص���߷������ֵ',
				successRecordEditMsg : '���³ɹ�',
				notEditableRecordMsg : '�����п�Ŀӳ���ͻ������ʧ��',
				successRecordDeleteMsg : 'ɾ���ɹ�',
				failureRecordDeleteMsg : '�ü�¼�޷�ɾ��',
				unexpectederror : '���ִ������Ժ��ԡ�����������������������ϵϵͳ����Ա.'
			};
			break;
		default:
			temp = {
				formTitle : 'CN COA Mapping',
				createMappings : 'Create Mappings',
				add : 'Add to Waiting List',
				editLbl : 'Update Record',
				deleteLbl : 'Delete Record',
				acntNameLbl : 'ACCOUNT NAME',
				inactiveLbl : 'INACTIVE',
				chinaAcntLbl : 'China Account',
				chinaAcntNameLbl : 'China Account Name',
				one2manyChckBoxLbl : 'One NetSuite account maps to multiple China Accounts',
				nsAccountLbl : 'NETSUITE ACCOUNT',
				accountIdLbl : 'NETSUITE ACCOUNT ID',
				chinaAcntNumberLbl : 'CHINA ACCOUNT NUMBER',
				departmentLbl : 'DEPARTMENT',
				departmentNameLbl : 'DEPARTMENT NAME',
				locationLbl : 'LOCATION',
				locationNameLbl : 'LOCATION NAME',
				classLbl : 'CLASS',
				classNameLbl : 'CLASS NAME',
				sbsdryLbl : 'SUBSIDIARY',
				sbsdryNameLbl : 'SUBSIDIARY NAME',
				mappingLbl : 'Mappings waiting to be saved',
				selected : 'Selected',
				noMapingsToCreateMsg : 'There are no mappings to create',
				missingSubsidiaryValue : 'Subsidiary is a mandatory field. Please provide a value.',
				missingAccountNameValue : 'Account Name is a mandatory field. Please provide a value.',
				missingClassificationValuesMsg : 'All the classification fields are empty. For one to multiple mapping, at least one value of either department, location or class should be provided',
				successRecordEditMsg : 'The record was updated successfully.',
				notEditableRecordMsg : 'The record will not be updated since it conflicts with existing mapping definitions.',
				successRecordDeleteMsg : 'The record was deleted successfully.',
				failureRecordDeleteMsg : 'The record could not be deleted.',
				unexpectederror : 'An unexpected error occurred! Please try again later. If problem still persists, please contact the system��s Administrator.'
			};
			break;
		}
		return temp;
	},

	UIType : function(type) {
		var temp;
		switch (type) {
		case 'zh_CN':
			temp = this.UIType_ZH_CN();
			break;
		default:
			temp = this.UIType_EN_US();
			break;
		}
		return temp;
	},

	UIType_ZH_CN : function() {
		var html = '<style type="text/css">';
		html += '#reporttype{height:25px;}';
		html += '.m_top{margin-top:5px;}';
		html += '</style>';
		html += '<div class="m_top"><span class="smallgraytextnolink uir-label">';
		html += '<a class="smallgraytextnolink">��������</a></span></div>';// Report
		// type
		html += '<div><select name="reporttype" id="reporttype" onchange="new trigger.local.printform().OnSlectItemChange()">';
		html += '<option selected value=-1></option>';
		html += '<option value=6 >-- �ʲ���ծ��</option>';// balance sheet
		html += '<option value=1 >-- �����</option>';// P&L
		html += '<option value=5 >-- ����ƽ���</option>';// Trial Balance
		html += '<option value=4 >-- �ܷ�����</option>';// General Ledger
		html += '<option value=0 >-- ƾ֤</option>';// Voucher
		html += '<option value=2 >-- ��ϸ��</option>';// SubLedger
		html += '<option value=3 >-- �ռ���</option>';// Diary Ledger
		// joe
		html += '<option value=7 >-- ����ƽ������У�</option>';// Trial Balance
		html += '<option value=8 >-- ����ƽ�����ĩ��</option>';// Trial Balance
		html += '</select></div>';
		return html;
	},

	UIType_EN_US : function() {
		var html = '<style type="text/css">';
		html += '#reporttype{height:25px;}';
		html += '.m_top{margin-top:5px;}';
		html += '</style>';
		html += '<div class="m_top"><span class="smallgraytextnolink uir-label">';
		html += '<a class="smallgraytextnolink">TYPE</a></span></div>';
		html += '<div><select name="reporttype" id="reporttype" onchange="new trigger.local.printform().OnSlectItemChange()">';
		html += '<option selected value=-1></option>';
		html += '<option value=6 >-- Balance Sheet</option>';
		html += '<option value=1 >-- Profit & Loss</option>';
		html += '<option value=5 >-- Trial Balance</option>';
		html += '<option value=4 >-- General Ledger</option>';
		html += '<option value=0 >-- Voucher</option>';
		html += '<option value=2 >-- Sub Ledger</option>';
		html += '<option value=3 >-- Diary Ledger</option>';
		// joe
		html += '<option value=7 >-- Trial Balance(Current Period)</option>';
		html += '<option value=8 >-- Trial Balance(Ending Balance)</option>';
		html += '</select></div>';
		return html;
	},
	GetMsgByFormTitle : function(lang) {
		var title = 'CHINA GAAP FINANCIAL REPORTS';
		if (lang == 'zh_CN') {
			title = '��������';
		}
		return title;
	},
	GetMsgByType : function(lang) {
		var title = 'PLEASE SELECT THE REPORT TYPE';
		if (lang == 'zh_CN') {
			title = '��ѡ�񱨱�����';
		}
		return title;
	},
	GetMsgByParameters : function(lang) {
		var title = 'PLEASE SELECT PARAMETERS';
		if (lang == 'zh_CN') {
			title = '��ѡ�񱨱����';
		}
		return title;
	},
	GetMsgByCOA : function(lang) {
		var title = 'MAINLAND CHINA CHART OF ACCOUNTS';
		if (lang == 'zh_CN') {
			title = '��ѡ���з���Ŀ';
		}
		return title;
	},
	GetMsgBySubsidiary : function(lang) {
		var title = 'Please select subsidiary!';
		if (lang == 'zh_CN') {
			title = '��ѡ��˾���� ';
		}
		return title;
	},
	GetMsgByRangeDate : function(lang) {
		var title = 'Please select start date and end date!';
		if (lang == 'zh_CN') {
			title = '��ѡ����ȷ����ʼ���ڣ� ';
		}
		return title;
	},
	GetMsgSuccesfullMaping : function(lang) {
		var msg = 'All accounts have been mapped successfully.';
		if (lang == 'zh_CN') {
			msg = '��ȫ��ӳ�� ';
		}
		return msg;
	},
	GetMsgMissingMaping : function(lang) {
		var msg = 'Mapping is missing for ';
		if (lang == 'zh_CN') {
			msg = '�ÿ�Ŀ��ӳ�� ';
		}
		return msg;
	},
	GetMsgByPeriodTime : function(lang) {
		var title = 'Please select time period! (year and month)';
		if (lang == 'zh_CN') {
			title = '��ѡ����ȷ����ʼ���ڣ� ';
		}
		return title;
	},
	GetMsgByVoucherDate : function(lang) {
		var title = 'Please select day 1 to 15 or 16 to last day of month';
		if (lang == 'zh_CN') {
			title = '��ѡ������Ϊ1��15�Ż���16�ŵ����µ����һ�죡 ';
		}
		return title;
	}

};