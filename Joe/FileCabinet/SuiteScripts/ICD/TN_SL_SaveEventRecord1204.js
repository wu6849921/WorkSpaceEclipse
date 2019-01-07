/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 10 Feb 2016 Veronica 1.01 9 Oct 2017 Charles
 * add new time tracking code block between //add new time tracking
 */

var common = new trigger.common();
var integration = new trigger.integration();

function saveEventRecord(request, response) {
	try {
		var username = common.replaceSpecialSymbol(request
				.getParameter('username'));
		var password = common.replaceSpecialSymbol(request.getParameter('psw'));

		if (!integration.validateLoginInfo(username, password, null)) {
			var err = {
				'status' : 'error',
				'code' : '1',
				'details' : 'Wrong Credentials'
			};
			response.write(JSON.stringify(err));
		} else {// if validation was successful, continue with the scenario
			var envtAssgnEng = request.getParameter('assgnengnr');
			var envtDateArrive = request.getParameter('arvldate');
			var envtTimeArrive = request.getParameter('arvltime');

			var envtDateDept = request.getParameter('deptdate');
			var envtTimeDept = request.getParameter('depttime');

			var envtOnSiteTime = request.getParameter('onsitetime');
			var envtResponseTime = request.getParameter('responsetime');
			var envtTechnicalSkill = request.getParameter('techskill');

			var envtSrvcMnr = request.getParameter('srvcmnr');
			var envtClientComments = request.getParameter('clntcmnts');

			var envtReportTemplate = request.getParameter('rprttmplt');

			var envtEmailGreeting = request.getParameter('emailgrtng');

			var envtProblemDesc = request.getParameter('prblmdesc');
			var envtOnSiteSteps = request.getParameter('onsitesteps');

			var envtCaseConclusion = request.getParameter('caseconcl');
			var envtCaseStatus = request.getParameter('casestatus');

			var envtEngnrSgntre = request.getParameter('engineer');

			var envtRdy2Email = request.getParameter('rdy2email');
			var envtUpdteClose = request.getParameter('updateClose');

			var caseType = request.getParameter('casetype');
			var caseIssue = request.getParameter('caseissue');
			var caseCategory = request.getParameter('casecategory');
			var caseDealChkBox = request.getParameter('casedeal');
			var caseMultiJobBox = request.getParameter('casemultjob');
			var caseStatus = request.getParameter('caseStatus');
			var caseID = request.getParameter('caseid');

			var file = request.getFile('eventAttach');// to store the file
			// that was sent

			var rslt;

			if (caseID) {
				var caseRcrd = nlapiLoadRecord('supportcase', caseID);
				var caseCompanyID = caseRcrd.getFieldValue('company');
				var caseSubject = caseRcrd.getFieldValue('title');

				var eventRec = nlapiCreateRecord('calendarevent');
				eventRec.setFieldValue('customform', 53);// ICD Event Form -
				// Customer Service

				eventRec.setFieldValue('company', caseCompanyID);
				eventRec.setFieldValue('supportcase', caseID);// connect event
				// to the case
				// that belongs
				// to the chosen
				// company,
				// hidden field
				eventRec.setFieldValue('title', caseSubject);

				eventRec.setFieldValue('custevent_assignedengineer',
						envtAssgnEng);
				eventRec.setFieldValue('custevent_logfileno', '123456');

				eventRec.setFieldValue('custevent_arrivaldate',
						nlapiDateToString(new Date(envtDateArrive)));// format
				// example:
				// 2/13/2017
				eventRec.setFieldValue('custevent_arrivaltime', envtTimeArrive);// format
				// example
				// '2:30
				// am'

				eventRec.setFieldValue('custevent_deptdate',
						nlapiDateToString(new Date(envtDateDept))); // format
				// example:
				// 2/13/2017
				eventRec.setFieldValue('custevent_depttime', envtTimeDept);// format
				// example
				// '2:30
				// pm'

				eventRec.setFieldValue('custevent_onsitetime', envtOnSiteTime);

				eventRec.setFieldValue('custevent_solvedvia', '2');// always is
				// 'On-Site
				// Support'

				eventRec.setFieldValue('custevent_respomse_time',
						envtResponseTime);
				eventRec.setFieldValue('custevent23', envtTechnicalSkill);// Technical
				// Skill
				eventRec.setFieldValue('custevent24', envtSrvcMnr);// Service
				// Manner
				eventRec.setFieldValue('custevent25', envtClientComments);// Client
				// Comments
				// -
				// TEXT

				eventRec.setFieldValue('custevent_reporttemplate',
						envtReportTemplate);
				eventRec.setFieldValue('custevent_emailbody1',
						envtEmailGreeting);// Email Greeting
				eventRec.setFieldValue('custevent_emailbody2', envtProblemDesc);// Problem
				// Description
				eventRec.setFieldValue('custevent_emailbody3', envtOnSiteSteps);// On
				// Site
				// Steps
				eventRec.setFieldValue('custevent_emailbody4',
						envtCaseConclusion);// Case Conclusion
				eventRec.setFieldValue('custevent_emailbody5', envtCaseStatus);// Case
				// Status

				eventRec.setFieldValue('custevent_engineersignature',
						envtEngnrSgntre);// Engineer
				eventRec.setFieldValue('custevent_ready_to_email',
						envtRdy2Email);// Ready To Email
				eventRec.setFieldValue('custevent19', envtUpdteClose);// Case
				// Update/Close
				eventRec.setFieldValue('accesslevel', 'PUBLIC');// define EVENT
				// ACCESS as
				// Public, in
				// order all the
				// roles will be
				// able to
				// observe it.

				var fileID = '';
				if (file) {
					var fileCreated = nlapiCreateFile(file.getName(), file
							.getType(), file.getValue());
					fileCreated.setEncoding('UTF-8');
					fileCreated.setFolder(2068717);// The file be saved under
					// 'Case update log files'
					// folder
					fileID = nlapiSubmitFile(fileCreated);
					if (fileID) {
						eventRec.setFieldValue('custevent18', fileID);// add
						// attachement
						// to
						// the
						// field
						// ATTACHED
						// REPORT
						// under
						// Report
						// SubTab
					}
				}

				var eventRecordID = nlapiSubmitRecord(eventRec);// check the ID
				nlapiLogExecution('DEBUG', 'TN_SL_SaveEventRecord',
						'Event record was created, EVENT ID: ' + eventRecordID);

				if (caseType) {// set value for case.caseType
					caseRcrd.setFieldValue('category', caseType);
				}

				if (caseIssue) {// set value for case.caseIssue
					caseRcrd.setFieldValue('issue', caseIssue);
				}

				if (caseCategory) {// set value for case.caseCategory
					caseRcrd.setFieldValue('custevent28', caseCategory);
				}

				if (caseDealChkBox) {// set value for case.quickDeal
					caseRcrd.setFieldValue('custevent26', caseDealChkBox);
				}

				if (caseMultiJobBox) {// set value for case.multiple Job
					caseRcrd.setFieldValue('custevent27', caseMultiJobBox);
				}

				if (caseStatus) {
					caseRcrd.setFieldValue('status', caseStatus);
				}

				// add new time tracking
				var timeTrackSublistId = 'timeitem';
				var timeTrackEmployee = request.getParameter('tcemployee');
				var timeTrackDate = request.getParameter('tcdate');
				var timeTrackDuration = request.getParameter('tcduration');
				var timeTrackMemo = request.getParameter('tcmemo');
				var timeTrackClass = request.getParameter('tcclass');

				if (timeTrackEmployee && timeTrackDate && timeTrackDuration
						&& timeTrackClass) {

					var timeTrackDepartment = nlapiLookupField('employee',
							timeTrackEmployee, 'department');

					caseRcrd.selectNewLineItem(timeTrackSublistId);
					caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
							'employee', timeTrackEmployee);// employee
					// 将时间格式化成dd/mm/yyyy by joe 20180118
					var timeTrackDateArr = timeTrackDate.split('/');
					var timeTrackDateNew = timeTrackDateArr[1] + '/'
							+ timeTrackDateArr[0] + '/' + timeTrackDateArr[2];
					caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
							'trandate', timeTrackDateNew);// date
					caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
							'hours', timeTrackDuration);

					if (timeTrackMemo) {
						caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
								'memo', timeTrackMemo);
					}

					caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
							'department', timeTrackDepartment);
					caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
							'class', timeTrackClass);

					// 增加默认值servise item add by joe 20180929
					caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
							'item', '28568');
					caseRcrd.commitLineItem(timeTrackSublistId);

				}
				// add new time tracking

				nlapiSubmitRecord(caseRcrd);
				nlapiLogExecution('DEBUG', 'TN_SL_SaveEventRecord',
						'Status of case record was updated, CASE ID: ' + caseID);

				rslt = {
					'status' : 'success',
					'code' : '4',
					'details' : eventRecordID
				};
			} else {// case ID is missing
				rslt = {
					'status' : 'error',
					'code' : '2',
					'details' : 'Case Id is missing'
				};

			}
			response.write(JSON.stringify(rslt));
		}
	} catch (ex) {

		var res = {
			'status' : 'error',
			'code' : '3',
			'details' : 'API Exception: ' + ex
		};
		nlapiLogExecution('DEBUG', 'saveEventRecord', ex);
		// common.sendErrorEmail('dev_support@triggerasia.com',
		// 'ICD','TN_SL_SaveEventRecord', 'saveEventRecord', ex);
		common.sendErrorEmail('veronica.bukin@triggerasia.com', 'ICD',
				'TN_SL_SaveEventRecord', 'saveEventRecord', 'Error message:'
						+ ex.message + ' Error name:' + ex.name);
		response.write(JSON.stringify(res));
	}
}