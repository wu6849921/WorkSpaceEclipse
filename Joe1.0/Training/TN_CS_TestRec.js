//���ݼ�CS
function pageInitRecord(type) {
	// function pageInit(type) {
	if (type !== 'edit') {
		return;
	}
	// ����ͷ�ֶ�

	// Display information
	// nlapiSetFieldValue('custentity_el_emp_testentity', 'abc');
	// nlapiDisableField('custentity_el_emp_testentity', true);
	// var joeTest = nlapiGetFieldValue('custentity_tn_emp_joetest');
	// alert(joeTest);
	// alert('this is record level');
	// nlapiDisableLineItemField('recmachcustrecord_tn_employeeid',
	// 'custrecord_tn_getprice', true);

	// �������ֶ�
	// 1����׼sublist
	// 1.1��������
	// nlapiSelectNewLineItem('rates');
	// nlapiSetCurrentLineItemValue('rates', 'rate', 123);
	// nlapiSetCurrentLineItemText('rates', 'entitycurrency', 'CNY');
	// nlapiCommitLineItem('rates');
	// 1.2���޸���
	// var count = nlapiGetLineItemCount('rates');
	// for (var i = 1; i <= count; i++) {
	// if (nlapiGetLineItemValue('rates', 'rate', i) > 100) {
	// nlapiSelectLineItem('rates', i);
	// nlapiSetCurrentLineItemValue('rates', 'rate', 888);
	// nlapiCommitLineItem('rates');
	// }
	// }

	// 2���Զ���sublist
	// 2.1��������
	// nlapiSelectNewLineItem('recmachcustrecord69');
	// nlapiSetCurrentLineItemValue('recmachcustrecord69', 'custrecord70', 123);
	// nlapiSetCurrentLineItemText('recmachcustrecord69', 'custrecord68',
	// 'CNY');
	// nlapiCommitLineItem('recmachcustrecord69');
	// 2.2���޸���
	// var count = nlapiGetLineItemCount('recmachcustrecord69');
	// for (var i = 1; i <= count; i++) {
	// nlapiSelectLineItem('recmachcustrecord69', i);
	// nlapiSetCurrentLineItemValue('recmachcustrecord69', 'custrecord70', 888);
	// nlapiCommitLineItem('recmachcustrecord69');
	// }

	// 3��ʼ��ʱ��������Performance Review GetPrice�ֶ�Ϊ666
	// var count = nlapiGetLineItemCount('recmachcustrecord_tn_employeeid');
	// for (var i = 1; i <= count; i++) {
	// nlapiSelectLineItem('recmachcustrecord_tn_employeeid', i);
	// nlapiSetCurrentLineItemValue('recmachcustrecord_tn_employeeid',
	// 'custrecord_tn_getprice', 888);
	// nlapiCommitLineItem('recmachcustrecord_tn_employeeid');
	// }

	// var context = nlapiGetContext();
	// var userId = context.getUser();
	// alert(userId);

	// module13 Script Parameters
	// var context = nlapiGetContext();
	// // var param = context.getSetting('SCRIPT', 'custscript1');
	// var param = context.getSetting('SCRIPT', 'custscript3');
	// nlapiSetFieldValue('comments', param);

}

function fieldChanged(type, name, linenum) {
	// Prompt for additional information, based on values already selected.
	// if (name === 'title') {
	// nlapiSetFieldValue('custentity_tn_emp_joetest',
	// nlapiGetFieldValue('title'));
	// }
	// Prompt for additional information, based on values already selected.
	// ����ͷ�ֶ�
	// if ((name === 'custentity_el_emp_testentity')
	// && (nlapiGetFieldValue('custentity_el_emp_testentity') === "abc")) {
	// var a = nlapiGetFieldValue('custentity_el_emp_testentity');
	// console.log('custentity_el_emp_testentity:' + a);
	// alert(a);
	// alert("Please provide additional information about fieldA in the text
	// field below.");
	// nlapiSetFieldValue('custentity_el_emp_testentity',
	// nlapiGetFieldValue('title'));
	// }
	// 1������sublist�ֶ� ����sublist�ֶ�
	// 1.1sublistΪϵͳsublist
	if (type == 'rates' && name == 'rate') {
		// var newRate = nlapiGetCurrentLineItemValue(type, name);// ��
		// if (newRate > 100) {
		// // nlapiSelectLineItem('rates', linenum);
		// nlapiSetCurrentLineItemText('rates', 'entitycurrency', 'CNY');// ��
		// // nlapiCommitLineItem('rates');
		// }
		// alert(newRate);
	}
	// 1.2sublistΪ�Զ���custom record
	// if (type == 'recmachcustrecord69' && name == 'custrecord70') {
	// var newPrice = nlapiGetCurrentLineItemValue(type, name);
	// alert(newPrice);
	// }
	// **********************//
	// 2������ͷ�ֶ� ����sublist�ֶ�
	if (name == 'custentity_el_emp_testentity') {
		// 2.1sublistΪϵͳsublist
		// ��
		// var newRate = nlapiGetLineItemValue('rates', 'rate', 1);
		// alert(newRate);
		// //////////////////////////////////////////////
		// �� *
		// nlapiSelectLineItem('rates', 1);
		// nlapiSetCurrentLineItemValue('rates', 'rate', 200);
		// nlapiCommitLineItem('rates');
		// var newRate = nlapiGetLineItemValue('rates', 'rate', 1);
		// alert(newRate);
		// ////////////////////////////////////////////////
		// ��*
		// nlapiSelectNewLineItem('rates');
		// nlapiSetCurrentLineItemValue('rates', 'rate', 898);
		// nlapiSetCurrentLineItemValue('rates', 'entitycurrency', 4);
		// nlapiCommitLineItem('rates');

		// ********************************//
		// 2.2sublistΪ�Զ���custom record
		// ��
		// var newPrice = nlapiGetLineItemValue('recmachcustrecord69',
		// 'custrecord70', 1);
		// alert(newPrice);
		// //////////////////////////////////////////////
		// �� *
		// nlapiSelectLineItem('recmachcustrecord69', 3);
		// nlapiSetCurrentLineItemValue('recmachcustrecord69', 'custrecord70',
		// 11990);
		// nlapiCommitLineItem('recmachcustrecord69');
		// var newPrice = nlapiGetLineItemValue('recmachcustrecord69',
		// 'custrecord70', 3);
		// alert(newPrice);
		// ////////////////////////////////////////////////
		// ��*
		// nlapiSelectNewLineItem('recmachcustrecord69');
		// // set the item and location values on the currently selected line
		// nlapiSetCurrentLineItemValue('recmachcustrecord69', 'custrecord70',
		// 888);
		// nlapiSetCurrentLineItemValue('recmachcustrecord69', 'custrecord68',
		// 6);
		// nlapiCommitLineItem('recmachcustrecord69');
	}

	// if (name == 'custpage_tn_subject') {
	// var subject = nlapiGetFieldValue('custpage_tn_subject');
	//
	// alert(subject);
	// }

}

function validateField(type, name, linenum) {
	// // if fieldA is not at least 6 characters, fail validation
	// ��֤ͷ�ֶ�
	// if (name === 'custentity_el_emp_testentity') {
	// var fieldALength =
	// String(nlapiGetFieldValue('custentity_el_emp_testentity')).length;
	//
	// if (fieldALength < 6) {
	// // alert("FieldA must be at least 6 characters.");
	// return false;
	// }
	// }
	// if (type === 'recmachcustrecord_tn_employeeid'
	// && name === 'custrecord_tn_getprice') {
	// var price = nlapiGetCurrentLineItemValue(type, 'custrecord_tn_getprice');
	// if (parseFloat(price) < 100) {
	// alert("Please > 100");
	// return false;
	// }
	// }
	// Always return true at this level, to continue validating other fields
	// abc(name);

	// if (type == 'rates' && name == 'rate') {
	// var newRate = nlapiGetCurrentLineItemValue(type, name);// ��
	// if (newRate > 100) {
	// // nlapiSelectLineItem('rates', linenum);
	// // nlapiSetCurrentLineItemText('rates', 'entitycurrency', 'CNY');//
	// // ��
	// // nlapiCommitLineItem('rates');
	// // alert('you must <100');
	// return false;
	// }
	// }
	return true;
}
function saveRecord() {
	// Check to see that fieldA is populated. If not, block the save and warn
	// with a popup.
	// ����ͷ�ֶ�
	// if (String(nlapiGetFieldValue('custentity_el_emp_testentity')).length ===
	// 0) {
	// alert("Please provide a value for fieldA");
	// return false;
	// }
	// alert("Are you sure you want to Save the record?");
	// var notes = nlapiGetFieldValue('comments');
	// var url = nlapiResolveURL('SUITELET', 'customscript563',
	// 'customdeploy1');
	// alert(url);
	// var params = new Array();
	// params['custparam_tn_note'] = notes;
	// var resposeObj = nlapiRequestURL(url, params);
	// // alert(resposeObj.getBody());
	// if (resposeObj.getBody() == 'false') {
	// alert('������notes�ֶ�Ϊ1��');
	// return false;
	// }

	// var isValidate = true;
	// var count = nlapiGetLineItemCount('rates');
	// for (var i = 1; i <= count; i++) {
	// if (nlapiGetLineItemValue('rates', 'rate', i) > 100) {
	// alert('you must <100');
	// return false;
	// }
	// }
	return true;
}
function validateLine(type) {// ����sublist lineʱ����
	if (type === 'recmachcustrecord69') {
		var price = nlapiGetCurrentLineItemValue(type, 'custrecord70');
		if (parseFloat(price) < 100) {
			alert("Please > 100");
			return false;
		}
	}
	alert("Are you sure you want to Save the Line?");
	return true;
}
function lineInit(type) {
	// if (type === 'recmachcustrecord69') {
	// var price = nlapiSetCurrentLineItemValue(type, 'custrecord70', 999);
	// }
}
function validateInsert(type) {
	// if (type === 'recmachcustrecord69') {
	// var price = nlapiGetCurrentLineItemValue(type, 'custrecord70');
	// if (parseFloat(price) < 100) {
	// alert("Please > 100");
	// return false;
	// }
	// }
	return true;
}
function validateDelete(type) {
	// if (type === 'recmachcustrecord69') {
	// var price = nlapiGetCurrentLineItemValue(type, 'custrecord70');
	// if (parseFloat(price) < 100) {
	// alert("Please > 100");
	// return false;
	// }
	// }
	return true;
}