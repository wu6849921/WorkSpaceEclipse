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
			// 2. 增加一个上传的字段 custevent_replacement，对应页面字段Replacement (Repair)
			// Name by joe 181205
			var replaceMent = request.getParameter('replaceMent');
			// 3. 增加一个上传的字段custevent4， 对应页面字段Memo by joe 181205
			var caseMemo = request.getParameter('caseMemo');
			// 6. API接口上传新增字段isCase:T|N
			var isCase = request.getParameter('isCase');
			var rslt;

			if (caseID) {
				var caseRcrd = nlapiLoadRecord('supportcase', caseID);
				if (!caseRcrd) {
					rslt = {
						'status' : 'error',
						'code' : '2',
						'details' : 'Case does not exist'
					};
					response.write(JSON.stringify(rslt));
				}
				if (isCase == 'T') {
					var caseCompanyID = caseRcrd.getFieldValue('company');
					var caseSubject = caseRcrd.getFieldValue('title');

					if (envtAssgnEng) {
						var eventRec = nlapiCreateRecord('calendarevent');
						eventRec.setFieldValue('customform', 53);// ICD Event
						// Form -
						// Customer Service

						eventRec.setFieldValue('company', caseCompanyID);
						eventRec.setFieldValue('supportcase', caseID);// connect
						// event
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
						eventRec.setFieldValue('custevent_arrivaltime',
								envtTimeArrive);// format
						// example
						// '2:30
						// am'

						eventRec.setFieldValue('custevent_deptdate',
								nlapiDateToString(new Date(envtDateDept))); // format
						// example:
						// 2/13/2017
						eventRec.setFieldValue('custevent_depttime',
								envtTimeDept);// format
						// example
						// '2:30
						// pm'

						eventRec.setFieldValue('custevent_onsitetime',
								envtOnSiteTime);

						eventRec.setFieldValue('custevent_solvedvia', '2');// always
						// is
						// 'On-Site
						// Support'

						eventRec.setFieldValue('custevent_respomse_time',
								envtResponseTime);
						eventRec.setFieldValue('custevent23',
								envtTechnicalSkill);// Technical
						// Skill
						eventRec.setFieldValue('custevent24', envtSrvcMnr);// Service
						// Manner
						eventRec.setFieldValue('custevent25',
								envtClientComments);// Client
						// Comments
						// -
						// TEXT

						eventRec.setFieldValue('custevent_reporttemplate',
								envtReportTemplate);
						eventRec.setFieldValue('custevent_emailbody1',
								envtEmailGreeting);// Email Greeting
						eventRec.setFieldValue('custevent_emailbody2',
								envtProblemDesc);// Problem
						// Description
						eventRec.setFieldValue('custevent_emailbody3',
								envtOnSiteSteps);// On
						// Site
						// Steps
						eventRec.setFieldValue('custevent_emailbody4',
								envtCaseConclusion);// Case Conclusion
						eventRec.setFieldValue('custevent_emailbody5',
								envtCaseStatus);// Case
						// Status

						eventRec.setFieldValue('custevent_engineersignature',
								envtEngnrSgntre);// Engineer
						eventRec.setFieldValue('custevent_ready_to_email',
								envtRdy2Email);// Ready To Email
						eventRec.setFieldValue('custevent19', envtUpdteClose);// Case
						// Update/Close
						eventRec.setFieldValue('accesslevel', 'PUBLIC');// define
						// EVENT
						// ACCESS as
						// Public, in
						// order all the
						// roles will be
						// able to
						// observe it.

						var fileID = '';
						if (file) {
							var fileCreated = nlapiCreateFile(file.getName(),
									file.getType(), file.getValue());
							fileCreated.setEncoding('UTF-8');
							fileCreated.setFolder(2068717);// The file be saved
							// under
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
						
						//新增上传字段wellPrepared 190107
						var wellPrepared = request.getParameter('wellPrepared');
//						 nlapiLogExecution('DEBUG', 'wellPrepared',
//								 wellPrepared);
						if (wellPrepared) {
							eventRec.setFieldValue('custevent_well_prepared',
									wellPrepared);
						}
						var eventRecordID = nlapiSubmitRecord(eventRec, false,
								true);// check
						// the
						// ID
						nlapiLogExecution('DEBUG', 'TN_SL_SaveEventRecord',
								'Event record was created, EVENT ID: '
										+ eventRecordID);
					}

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
						var caseStatusOld = caseRcrd.getFieldValue('status');
						var caserestoDate = caseRcrd
								.getFieldValue('custevent_tn_caserestodate');
						caseRcrd.setFieldValue('status', caseStatus);
						// nlapiLogExecution('DEBUG', 'caseStatus', caseStatus);
						// nlapiLogExecution('DEBUG', 'caseStatusOld',
						// caseStatusOld);
						var dateTmp = new Date();
						var localTime = dateTmp.getTime();
						var localOffset = dateTmp.getTimezoneOffset() * 60000;
						var utc = localTime + localOffset;
						var offset = 8;
						var beijingDateTmp = utc + (3600000 * offset);
						var beijingDate = new Date(beijingDateTmp);
						beijingDate = nlapiDateToString(beijingDate,
								'datetimetz');
						// nlapiLogExecution('DEBUG', 'beijingDate',
						// beijingDate);
						// 记录第一次 状态为13-Case Responded To(Case)更新时间 joe 181205
						if (caseStatus == '13' && (caseStatus != caseStatusOld)
								&& !caserestoDate) {
							caseRcrd.setFieldValue(
									'custevent_tn_caserestodate', beijingDate);
						}
					}
					// 2. 增加一个上传的字段 custevent_replacement，对应页面字段Replacement
					// (Repair)
					// Name by joe 181205
					if (replaceMent) {
						caseRcrd.setFieldValue('custevent_replacement',
								replaceMent);
					}
					// 3. 增加一个上传的字段 custevent_replacement，对应页面字段Replacement
					// (Repair)
					// Name by joe 181205
					if (caseMemo) {
						caseRcrd.setFieldValue('custevent4', caseMemo);
					}
					// add new time tracking
					// 4. time tracking能增加多人
					setTimeTacking(request, caseRcrd);
					// add new time tracking
					// 通过API上传多张图片
					// 新增caseImageCount字段，表示上传的图片个数 add by joe 181205
					// 新增caseImageCount条图片文件字段
					var caseImageCount = request.getParameter('caseImageCount');
					for (var i = 1; i <= parseInt(caseImageCount); i++) {
						var caseImage = request.getFile('caseImage' + i);
						// nlapiLogExecution('DEBUG', 'TN_SL_SaveEventRecord',
						// 'caseImage: ' + caseImage);
						var fileID;
						if (caseImage) {
							var fileCreated = nlapiCreateFile(caseImage
									.getName(), caseImage.getType(), caseImage
									.getValue());
							// fileCreated.setEncoding('UTF-8');
							fileCreated.setFolder(2068717);
							fileID = nlapiSubmitFile(fileCreated);
							// 将附件加到case附件列表
							if (fileID) {
								nlapiAttachRecord("file", fileID,
										"supportcase", caseID);

							}
//							nlapiLogExecution('DEBUG', 'TN_SL_SaveEventRecord',
//									'fileID ' + fileID);
						}
					}
					
					// 通过API更新RPM add by joe 181205
				} else if (isCase == 'F') {
					var fArrivalDate = request.getParameter('fArrivalDate');
					var fArrivalTime = request.getParameter('fArrivalTime');
					var fDepartureDate = request.getParameter('fDepartureDate');
					var fDepartureTime = request.getParameter('fDepartureTime');
					var sArrivalDate = request.getParameter('sArrivalDate');
					var sArrivalTime = request.getParameter('sArrivalTime');
					var sDepartureDate = request.getParameter('sDepartureDate');
					var sDepartureTime = request.getParameter('sDepartureTime');
					var rpmImplementationDate = request
							.getParameter('rpmImplementationDate');
					var assigneDengineers = request
							.getParameter('assigneDengineers');
					var rpmDurationTime = request
							.getParameter('rpmDurationTime');
					var file = request.getFile('eventAttach');
					var status = request.getParameter('status');
					if (fArrivalDate) {
						caseRcrd.setFieldValue('custevent_1st_arrival_date',
								nlapiDateToString(new Date(fArrivalDate)));
					}

					if (fArrivalTime) {
						caseRcrd.setFieldValue('custevent_1st_arrival_time',
								fArrivalTime);
					}
					if (fDepartureDate) {
						caseRcrd.setFieldValue('custevent_1st_departure_date',
								nlapiDateToString(new Date(fDepartureDate)));
					}
					if (fDepartureTime) {
						caseRcrd.setFieldValue('custevent_1st_departure_time',
								fDepartureTime);
					}
					if (sArrivalDate) {
						caseRcrd.setFieldValue('custevent_2nd_arrival_date',
								nlapiDateToString(new Date(sArrivalDate)));
					}
					if (sArrivalTime) {
						caseRcrd.setFieldValue('custevent_2nd_arrival_time',
								sArrivalTime);
					}
					if (sDepartureDate) {
						caseRcrd.setFieldValue('custevent_2nd_departure_date',
								nlapiDateToString(new Date(sDepartureDate)));
					}
					if (sDepartureTime) {
						caseRcrd.setFieldValue('custevent_2nd_departure_time',
								sDepartureTime);
					}
					if (rpmImplementationDate) {
						caseRcrd.setFieldValue(
								'custevent_rpmimplementationdate',
								nlapiDateToString(new Date(
										rpmImplementationDate)));
					}
					if (assigneDengineers) {
						assigneDengineers = assigneDengineers.split(',');
						caseRcrd.setFieldValue('custevent_assignedengineers',
								assigneDengineers);
					}
					if (rpmDurationTime) {
						caseRcrd.setFieldValue('custevent_rpmdurationtime',
								rpmDurationTime);
					}
					// nlapiLogExecution('DEBUG', 'TN_SL_SaveEventRecord',
					// 'rpmDurationTime: ' + rpmDurationTime);
					var fileID = '';
					if (file) {
						var fileCreated = nlapiCreateFile(file.getName(), file
								.getType(), file.getValue());
						fileCreated.setEncoding('UTF-8');
						fileCreated.setFolder(2068717);

						// 发送邮件根据不同地区调用不同模板 by joe 181205
						var author = 1166;
						var recipient = caseRcrd.getFieldValue('email');
						var assigned = caseRcrd.getFieldValue('assigned');
						var templateId;
						if (assigned == '15406' || assigned == '17966'
								|| assigned == '1165' || assigned == '11303'
								|| assigned == '14022' || assigned == '15901') {
							templateId = 160;// CS - RPM Report Template -
							// Kyle (Converted)
						} else if (assigned == '33316') {
							templateId = 194;// CS - RPM Report Template -
							// Japan (Converted)
						} else if (assigned == '1164' || assigned == '26096'
								|| assigned == '39233' || assigned == '15898'
								|| assigned == '15897' || assigned == '1170'
								|| assigned == '1168' || assigned == '24647') {
							templateId = 193;// CS - RPM Report Template - CN
							// (Converted)
						} else if (assigned == '30983') {
							templateId = 132;// CS - RPM Report Template -
							// Kyle
						}
						// nlapiLogExecution('DEBUG', 'TN_SL_SaveEventRecord',
						// 'templateId: ' + templateId);
						if (templateId) {
							var emailMerger = nlapiCreateEmailMerger(templateId);
							// emailMerger.setTransaction(caseID);
							var mergeResult = emailMerger.merge();
							nlapiSendEmail(author, recipient, mergeResult
									.getSubject(), mergeResult.getBody(), null,
									null, null, fileCreated);
							// nlapiLogExecution('DEBUG',
							// 'TN_SL_SaveEventRecord',
							// 'mergeResult: ' + mergeResult);
						}
						// ////////////////////////////////////////////////////
						// 保存文件到系统
						fileCreated.setEncoding('UTF-8');
						fileCreated.setFolder(2068717);// The file be saved
						fileID = nlapiSubmitFile(fileCreated);
						if (fileID) {
							caseRcrd.setFieldValue('custevent18', fileID);
						}
						// add new time tracking
					}
					// 4. time tracking能增加多人
					setTimeTacking(request, caseRcrd);
					if (status) {
						caseRcrd.setFieldValue('status', status);
					}
				}
				nlapiSubmitRecord(caseRcrd, false, true);
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

	function setTimeTacking(request, caseRcrd) {
		// add new time tracking
		// 4. time tracking能增加多人
		var timeTrackSublistId = 'timeitem';
		var timeTracks = request.getParameter('timeTracks');
		// nlapiLogExecution('DEBUG', 'timeTracks', timeTracks);
		var timeTracksArr = JSON.parse(timeTracks);
		// nlapiLogExecution('DEBUG', 'timeTracksArr', timeTracksArr);
		if (!timeTracksArr) {
			return;
		}
		for (var i = 0; i < timeTracksArr.length; i++) {
			var timeTrackEmployee = timeTracksArr[i].tcemployee;
			var timeTrackDate = timeTracksArr[i].tcdate;
			var timeTrackDuration = timeTracksArr[i].tcduration;
			var timeTrackMemo = timeTracksArr[i].tcmemo;
			var timeTrackClass = timeTracksArr[i].tcclass;
//			nlapiLogExecution('DEBUG', 'timeTrackDate', timeTrackDate);
			if (timeTrackEmployee && timeTrackDate && timeTrackDuration
					&& timeTrackClass) {

				var timeTrackDepartment = nlapiLookupField('employee',
						timeTrackEmployee, 'department');

				caseRcrd.selectNewLineItem(timeTrackSublistId);
				caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
						'employee', timeTrackEmployee);// employee
				// // 将时间格式化成dd/mm/yyyy by joe 20180118
				// var timeTrackDateArr = timeTrackDate.split('/');
				// var timeTrackDateNew = timeTrackDateArr[1] + '/'
				// + timeTrackDateArr[0] + '/' + timeTrackDateArr[2];
				caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
						'trandate', nlapiDateToString(new Date(timeTrackDate)));// date
				caseRcrd.setCurrentLineItemValue(timeTrackSublistId, 'hours',
						timeTrackDuration);

				if (timeTrackMemo) {
					caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
							'memo', timeTrackMemo);
				}

				caseRcrd.setCurrentLineItemValue(timeTrackSublistId,
						'department', timeTrackDepartment);
				caseRcrd.setCurrentLineItemValue(timeTrackSublistId, 'class',
						timeTrackClass);

				// 增加默认值servise item add by joe 20180929
				caseRcrd.setCurrentLineItemValue(timeTrackSublistId, 'item',
						'28568');
				caseRcrd.commitLineItem(timeTrackSublistId);

			}
		}
//		nlapiLogExecution('DEBUG', 'caseRcrd', caseRcrd);
	}
}