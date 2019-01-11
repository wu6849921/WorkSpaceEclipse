//function beforeLoad(type, form) {
//	var newId = nlapiGetRecordId();
//	var newType = nlapiGetRecordType();
//	nlapiLogExecution('DEBUG', '<Before Load Script> type:' + type
//			+ ', RecordType: ' + newType + ', Id:' + newId);
//}
function afterSubmit(type) {
	// if (type !== 'edit') {
	// return;
	// }
	var newRecordOld = nlapiGetOldRecord();
	var newRecordNew = nlapiGetNewRecord();
	nlapiLogExecution('DEBUG', 'afterSubmit', 'afterSubmit');

	// var joeTestOld = newRecordOld.getFieldValue('custentity_tn_emp_joetest');
	// nlapiLogExecution('DEBUG', 'joeTestbeforeSubmitOld', joeTestOld);
	// var joeTestNew = newRecordNew.getFieldValue('custentity_tn_emp_joetest');
	// nlapiLogExecution('DEBUG', 'joeTestbeforeSubmitNew', joeTestNew);
	// var author = newRecord.getFieldValue('entityid');
	// var joeTest = newRecord.getFieldValue('custentity_tn_emp_joetest');
	// nlapiLogExecution('DEBUG', 'joeTest', joeTest);
	// var context = nlapiGetContext();
	// var recipient = context.getUser();
	// nlapiLogExecution('DEBUG', 'author&', joeTest);
	// nlapiSendEmail(author, recipient, 'test user event send email', '12345');

	// 1、创建phone call record
	// var phoneCallRec = nlapiCreateRecord('phonecall', [ 'customform', 105 ]);
	// phoneCallRec.setFieldValue('assigned', newRecordNew.getId());
	// phoneCallRec.setFieldValue('title', 'my phone call');
	// nlapiSubmitRecord(phoneCallRec);
	// load Record
	// var supId = newRecordNew.getFieldValue('supervisor');
	// var sup = nlapiLoadRecord('employee', supId);
	// var employeeId = sup.getFieldValue('entityid');
	// nlapiLogExecution('DEBUG', 'employeeId', employeeId);

	// ******************************//
	// 2、创建Event活动
	// var supervisorId = newRecordNew.getFieldValue('supervisor');
	// var eventRec = nlapiCreateRecord('calendarevent');
	// eventRec.setFieldValue('title', 'My Meeting Test');
	// eventRec.selectNewLineItem('attendee');
	// eventRec.setCurrentLineItemValue('attendee', 'attendee', newRecordNew
	// .getId());
	// eventRec.setCurrentLineItemText('attendee', 'attendance', 'Required');
	// eventRec.commitLineItem('attendee');
	// eventRec.selectNewLineItem('attendee');
	// eventRec.setCurrentLineItemValue('attendee', 'attendee', supervisorId);
	// eventRec.setCurrentLineItemText('attendee', 'attendance', 'Required');
	// eventRec.commitLineItem('attendee');
	// nlapiSubmitRecord(eventRec);

	// module15 重定向到suitlet
//	var notes = newRecordNew.getFieldValue('comments');
//	var emId = newRecordNew.getId();
//	var params = new Array();
//	params['custparam_tn_note'] = notes;
//	params['custparam_tn_emid'] = emId;
//	nlapiSetRedirectURL('SUITELET', 'customscript562', 'customdeploy1', null,
//			params);
}
function beforeSubmit(type) {
	var newRecordOld = nlapiGetOldRecord();
	var newRecordNew = nlapiGetNewRecord();
	// var joeTestOld = newRecordOld.getFieldValue('custentity_tn_emp_joetest');
	nlapiLogExecution('DEBUG', 'beforeSubmit', 'beforeSubmit');

	// var joeTestNew = newRecordNew.getFieldValue('custentity_tn_emp_joetest');
	// nlapiLogExecution('DEBUG', 'joeTestbeforeSubmitNew', joeTestNew);
	// newRecordNew.setFieldValue('custentity_tn_emp_joetest', '5');
	//
	// var department = newRecordNew.getFieldValue('department');
	// if (department == '') {
	// nlapiLogExecution('DEBUG', 'department', 'no department');
	// }

	// var newType = nlapiGetRecordType();
	// nlapiLogExecution('DEBUG', '<After Submit Script> type:' + type
	// + ', RecordType: ' + newType + ', Id:' + newId);
}
