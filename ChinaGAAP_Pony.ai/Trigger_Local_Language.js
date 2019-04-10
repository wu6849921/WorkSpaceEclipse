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
				Voucher : '凭证',
				Profit : '利润表',
				Detail : '明细账',
				Journal : '日记账',
				Ledger : '总账',
				SummaryLedger : '试算平衡表',
				BalanceSheet : '资产负债表',
				Subsidiary : '公司名称',
				DateFrom : '起始日期',
				DateTo : '截止日期',
				VoucherDateFromLbl : '凭证开始日期',
				VoucherDateToLbl : '凭证结束日期',
				ReportYear : '账务年度',
				BeginMonth : '期间',
				EndMonth : '结束期间',
				COA : '科目'
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
				formTitle : '科目映射表',
				createMappings : '创建科目映射表',
				add : '加入待添加清单',
				editLbl : '更新记录',
				deleteLbl : '删除记录',
				acntNameLbl : '科目名称',
				inactiveLbl : '停用',
				chinaAcntLbl : '中方会计科目',
				chinaAcntNameLbl : '中文科目名称',
				one2manyChckBoxLbl : '将NetSuite系统科目映射到多个中方会计科目',
				nsAccountLbl : 'NetSuite系统科目',
				accountIdLbl : 'NetSuite系统科目ID',
				chinaAcntNumberLbl : '中方会计科目编码',
				departmentLbl : '部门',
				departmentNameLbl : '部门名称',
				locationLbl : '地点',
				locationNameLbl : '地点名称',
				classLbl : '分类',
				classNameLbl : '类名称',
				sbsdryLbl : '子公司',
				sbsdryNameLbl : '子公司名称',
				mappingLbl : '待保存科目映射表',
				selected : '已选中',
				noMapingsToCreateMsg : '无可创建的映射表',
				missingSubsidiaryValue : '子公司为必填项，请选择子公司',
				missingAccountNameValue : '科目名称为必填项，请填写科目名称',
				missingClassificationValuesMsg : '所有分类空白。对于一对多科目的映射，需至少填写一个以下分类中的一个：部门，地点或者分类的数值',
				successRecordEditMsg : '更新成功',
				notEditableRecordMsg : '与现有科目映射冲突，更新失败',
				successRecordDeleteMsg : '删除成功',
				failureRecordDeleteMsg : '该记录无法删除',
				unexpectederror : '出现错误！请稍候尝试。如果此问题持续发生，请联系系统管理员.'
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
				unexpectederror : 'An unexpected error occurred! Please try again later. If problem still persists, please contact the system’s Administrator.'
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
	UIPrintExcel : function(type) {  //add by joe 20190306
		var temp;
		switch (type) {
		case 'zh_CN':
			temp = '打印Excel';
			break;
		default:
			temp = 'Print Excel';
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
		html += '<a class="smallgraytextnolink">报表类型</a></span></div>';// Report
																		// type
		html += '<div><select name="reporttype" id="reporttype" onchange="new trigger.local.printform().OnSlectItemChange()">';
		html += '<option selected value=-1></option>';
//		html += '<option value=6 >-- 资产负债表</option>';// balance sheet
//		html += '<option value=1 >-- 利润表</option>';// P&L
//		html += '<option value=5 >-- 试算平衡表</option>';// Trial Balance
//		html += '<option value=4 >-- 总分类账</option>';// General Ledger
//		html += '<option value=0 >-- 凭证</option>';// Voucher
		html += '<option value=2 >-- 明细账</option>';// SubLedger
		html += '<option value=3 >-- 日记账</option>';// Diary Ledger
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
//		html += '<option value=6 >-- Balance Sheet</option>';
//		html += '<option value=1 >-- Profit & Loss</option>';
//		html += '<option value=5 >-- Trial Balance</option>';
//		html += '<option value=4 >-- General Ledger</option>';
//		html += '<option value=0 >-- Voucher</o/ption>';
		html += '<option value=2 >-- Sub Ledger</option>';
		html += '<option value=3 >-- Diary Ledger</option>';
		html += '</select></div>';
		return html;
	},
	GetMsgByFormTitle : function(lang) {
		var title = 'CHINA GAAP FINANCIAL REPORTS';
		if (lang == 'zh_CN') {
			title = '财务本土化';
		}
		return title;
	},
	GetMsgByType : function(lang) {
		var title = 'PLEASE SELECT THE REPORT TYPE';
		if (lang == 'zh_CN') {
			title = '请选择报表类型';
		}
		return title;
	},
	GetMsgByParameters : function(lang) {
		var title = 'PLEASE SELECT PARAMETERS';
		if (lang == 'zh_CN') {
			title = '请选择报表参数';
		}
		return title;
	},
	GetMsgByCOA : function(lang) {
		var title = 'MAINLAND CHINA CHART OF ACCOUNTS';
		if (lang == 'zh_CN') {
			title = '请选择中方科目';
		}
		return title;
	},
	GetMsgBySubsidiary : function(lang) {
		var title = 'Please select subsidiary!';
		if (lang == 'zh_CN') {
			title = '请选择公司名称 ';
		}
		return title;
	},
	GetMsgByRangeDate : function(lang) {
		var title = 'Please select start date and end date!';
		if (lang == 'zh_CN') {
			title = '请选择正确的起始日期！ ';
		}
		return title;
	},
	GetMsgSuccesfullMaping : function(lang) {
		var msg = 'All accounts have been mapped successfully.';
		if (lang == 'zh_CN') {
			msg = '已全部映射 ';
		}
		return msg;
	},
	GetMsgMissingMaping : function(lang) {
		var msg = 'Mapping is missing for ';
		if (lang == 'zh_CN') {
			msg = '该科目无映射 ';
		}
		return msg;
	},
	GetMsgByPeriodTime : function(lang) {
		var title = 'Please select time period! (year and month)';
		if (lang == 'zh_CN') {
			title = '请选择正确的起始日期！ ';
		}
		return title;
	}

};