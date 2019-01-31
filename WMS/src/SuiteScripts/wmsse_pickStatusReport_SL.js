/**
 * Script Description
 * This script displays the pick report status for selected pick report number.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
function PickReportStatus(request, response){
	if (request.getMethod() == 'GET') {

		var form = nlapiCreateForm('Pick Report Status');
		var vQbPickReportNo = request.getParameter('custparam_pickreportno');
		var visfrompickrptstatustypechange = form.addField('custpage_hdnpickrptstatuschange', 'text').setDisplayType('hidden');
		
		form.setScript('customscript_wmsse_pickreport_status');
		var vPickReportStatusType = form.addField('custpage_reportstatustype', 'select', 'Pick Report Status Type');
		vPickReportStatusType.addSelectOption('1', 'Multi Order Pick Report Status');
		vPickReportStatusType.addSelectOption('2', 'Single Order Pick Report Status');
		if(request.getParameter('custpage_reportstatustype')!='' && request.getParameter('custpage_reportstatustype')!=null)
		{
			vPickReportStatusType.setDefaultValue( request.getParameter('custpage_reportstatustype') );
		}


		if(request.getParameter('custpage_reportstatustype')!='' && request.getParameter('custpage_reportstatustype')!=null && request.getParameter('custpage_reportstatustype')=='2' )
		{
			form.addField('custpage_fromdate1', 'date', 'Scheduler Begin Date');
			var vTranNumber=form.addField('custpage_trannumber','text','Transaction #');
			form.addField('custpage_todate', 'date', 'Scheduler End Date');
		}
		else
		{
			form.addField('custpage_fromdate', 'date', 'Pick Report Generation Date');
			var vPickReportNo = form.addField('custpage_pickreportno', 'text', 'Pick Report #');
			if(vQbPickReportNo != null && vQbPickReportNo !='' && vQbPickReportNo !='null' && vQbPickReportNo !='undefined')
				vPickReportNo.setDefaultValue(vQbPickReportNo);
		}

		form.addSubmitButton('Display');
		response.writePage(form);

	}
	else
	{
		try
		{
			var form = nlapiCreateForm('Pick Report Status');
			form.setScript('customscript_wmsse_pickreport_status');
			var visfrompickrptstatustypechange = form.addField('custpage_hdnpickrptstatuschange', 'text').setDisplayType('hidden');
			
			var vQbPickReportNo = request.getParameter('custpage_pickreportno');
			var vQbFromDate = request.getParameter('custpage_fromdate');
			var statusType = request.getParameter('custpage_ordstatus');
			var POarray = new Array();
			POarray['custpage_ordstatus'] = statusType;

			nlapiLogExecution('ERROR','statusType ',statusType);
			nlapiLogExecution('ERROR','vQbPickReportNo : vQbFromDate ',vQbPickReportNo+" : "+vQbFromDate);
			var vPickReportStatusType = form.addField('custpage_reportstatustype', 'select', 'Pick Report Status Type');
			vPickReportStatusType.addSelectOption('1', 'Multi Order Pick Report Status');
			vPickReportStatusType.addSelectOption('2', 'Single Order Pick Report Status');
			if(request.getParameter('custpage_reportstatustype')!='' && request.getParameter('custpage_reportstatustype')!=null)
			{
				vPickReportStatusType.setDefaultValue( request.getParameter('custpage_reportstatustype') );
			}

			if(request.getParameter('custpage_reportstatustype')!='' && request.getParameter('custpage_reportstatustype')!=null && request.getParameter('custpage_reportstatustype')=='2' )
			{

				var vFromDate = form.addField('custpage_fromdate1', 'date', 'Begin Date');
				var vTranNumber=form.addField('custpage_trannumber','text','Transaction #');
				var vToDate = form.addField('custpage_todate', 'date', 'End Date');
				var vQbTranNumber = request.getParameter('custpage_trannumber');
				var vQbFromDate = request.getParameter('custpage_fromdate1');
				var vQbToDate = request.getParameter('custpage_todate');
				if(vQbTranNumber !=null && vQbTranNumber != '')
					vTranNumber.setDefaultValue(vQbTranNumber);			

				if(vQbFromDate !=null && vQbFromDate !='')
					vFromDate.setDefaultValue(vQbFromDate);			

				if(vQbToDate !=null && vQbToDate !='')
					vToDate.setDefaultValue(vQbToDate);
				if(request.getParameter('custpage_hdnpickrptstatuschange')!='T')
				{

					var sublist = form.addSubList("custpage_items", "list", "Pick Report List");
					sublist.addField("custpage_transaction", "text", "Transaction #");
					sublist.addField("custpage_pickreportflag", "text", "Pick Report Status");
					sublist.addField("custpage_remarks", "text", "Remarks");
					sublist.addField("custpage_pickreport_link", "textarea", "Pick Report");

					var SOResults = getSOId(vQbTranNumber);
					nlapiLogExecution('ERROR', 'SOResults',SOResults);

					if(vQbTranNumber != null && vQbTranNumber != '' && (SOResults == null || SOResults == ''))
					{
						msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
								"showAlertBox('div__alert', 'ERROR', 'Please enter valid order'," +
						" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
						response.writePage(form);
						return;
					}

					if(SOResults != null && SOResults != '')
					{
						var schfilter=new Array();
						if(vQbTranNumber != null && vQbTranNumber !='')
							schfilter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',null,
									'contains',vQbTranNumber));

						schfilter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname',null,
								'is','Single order pick report SCH'));

						if(vQbFromDate !=null && vQbFromDate !='')
							schfilter.push(new nlobjSearchFilter('custrecord_wmsse_schprsbegindate',null,
									'onorafter',vQbFromDate));

						if(vQbToDate !=null && vQbToDate !='')
							schfilter.push(new nlobjSearchFilter('custrecord_wmsse_schprsenddate',null,
									'onorbefore',vQbToDate));

						var Pickstatus="";
						var schcolumn=new Array();
						schcolumn[0]=new nlobjSearchColumn('custrecord_wmsse_schprsstatus');
						schcolumn[1]=new nlobjSearchColumn('custrecord_wmsse_schprsname');
						schcolumn[2]=new nlobjSearchColumn('custrecord_wmsse_schprstranrefno').setSort(true);
						schcolumn[3]=new nlobjSearchColumn('custrecord_wmsse_schprsnotes');
						schcolumn[4]=new nlobjSearchColumn('internalid');
						var schedulersearchresult=nlapiSearchRecord('customrecord_wmsse_schscripts_status',
								null,schfilter,schcolumn);
						nlapiLogExecution('ERROR', 'schedulersearchresult',schedulersearchresult);
						var vremarks ='';
						if(schedulersearchresult!=null && schedulersearchresult!='')
						{
							var j=1;
							for(var x=0;x<schedulersearchresult.length;x++)
							{
								var id= schedulersearchresult[x].getValue('internalid');
								nlapiLogExecution('ERROR', 'id',id);
								Pickstatus = schedulersearchresult[x].getValue('custrecord_wmsse_schprsstatus');
								var vSchPickReportNo = schedulersearchresult[x].getValue(
								'custrecord_wmsse_schprsnotes');
								nlapiLogExecution('ERROR', 'vSchPickReportNo',vSchPickReportNo);

								var vSchPickReportNoArr = new Array();
								vSchPickReportNoArr = vSchPickReportNo.split(',');
								nlapiLogExecution('ERROR', 'vSchPickReportNoArr',vSchPickReportNoArr);

								var vTransactionNo = schedulersearchresult[x].getValue(
								'custrecord_wmsse_schprstranrefno');

								nlapiLogExecution('ERROR', 'vTransactionNo',vTransactionNo);
								nlapiLogExecution('ERROR', 'Pickstatus',Pickstatus);
								var finalArr = new Array();

								if(Pickstatus=='Completed')
								{
									for(var k=0;k<vSchPickReportNoArr.length;k++)
									{
										var vOpenfilters = new Array();
										vOpenfilters.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',
												null, 'is', vSchPickReportNoArr[k]));
										vOpenfilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',
												null, 'anyof', ['9','26']));
										//9-Pick Locations Assigned 26-Failed picks
										var Vopencolumns = new Array();
										Vopencolumns[0]=new nlobjSearchColumn('custrecord_wmsse_pickreport_no',
												null,'group');
										Vopencolumns[1]=new nlobjSearchColumn('custrecord_wmsse_wms_status_flag',
												null,'group');
										var objOpenTaskDetails = new nlapiSearchRecord(
												'customrecord_wmsse_trn_opentask',null,vOpenfilters,Vopencolumns);
										if(objOpenTaskDetails!=null && objOpenTaskDetails !='' &&
												objOpenTaskDetails.length > 0)
										{
											for(var i=0;i<objOpenTaskDetails.length;i++)
											{
												var vCount=0;
												var vnPickStatusFlag = objOpenTaskDetails[i].getValue(
														'custrecord_wmsse_wms_status_flag',null,'group');
												if(vnPickStatusFlag == 9)
												{
													vCount = parseFloat(vCount)+1;
												}
											}
											nlapiLogExecution('ERROR', 'vCount',vCount);
											var vnPickReportNo = objOpenTaskDetails[0].getValue(
													'custrecord_wmsse_pickreport_no',null,'group');
											if(vCount >= 1)
											{
												vremarks ="";
												finalArr.push(vnPickReportNo);
											}
											else
											{
												vremarks ='Failed picks due to configuration/insufficient'+ 
												'inventory';
											}
										}
									}
									nlapiLogExecution('ERROR', 'finalArr',finalArr);
									if(finalArr.length>0 && finalArr != null && finalArr != '')
									{
										vSchPickReportNo = finalArr.toString();
										nlapiLogExecution('ERROR', 'vSchPickReportNo',vSchPickReportNo);
										var	pickreport = nlapiResolveURL('SUITELET', 
												'customscript_wmsse_singpickreportpdf', 
										'customdeploy_wmsse_singpickreportpdf');
										pickreport = pickreport+ '&custparam_pickreportno='+ vSchPickReportNo+'&custparam_orderno='+vTransactionNo;
										
										
									
										form.getSubList('custpage_items').setLineItemValue(
												'custpage_transaction', j, vTransactionNo);	

										form.getSubList('custpage_items').setLineItemValue(
												'custpage_pickreportflag',j, Pickstatus);

										form.getSubList('custpage_items').setLineItemValue(
												'custpage_remarks',j, vremarks);

										form.getSubList('custpage_items').setLineItemValue(
												'custpage_pickreport_link', j,
												'<a href="' + pickreport + '">Download PDF</a>');

										j=parseInt(j)+1;
									}
									else
									{
										form.getSubList('custpage_items').setLineItemValue(
												'custpage_transaction', j, vTransactionNo);	

										form.getSubList('custpage_items').setLineItemValue(
												'custpage_pickreportflag',j, Pickstatus);

										form.getSubList('custpage_items').setLineItemValue(
												'custpage_remarks',j, vremarks);
										j=parseInt(j)+1;
									}
								}
								else
								{
									vremarks='';
									Pickstatus='In Progress';					
									form.getSubList('custpage_items').setLineItemValue('custpage_transaction',
											j, vTransactionNo);		
									form.getSubList('custpage_items').setLineItemValue('custpage_pickreportflag',
											j, 'In Progress');
									form.getSubList('custpage_items').setLineItemValue(
											'custpage_remarks',j, vremarks);
									j=parseInt(j)+1;
								}

							}
						}
						else
						{
							nlapiLogExecution('ERROR', 'No results found',vTranNumber);
							
						}
					}

				}
			}
			else
			{
				var fromDate = form.addField('custpage_fromdate', 'date', 'Pick Report Generation Date');
				var vPickReportNo = form.addField('custpage_pickreportno', 'text', 'Pick Report #');
				if(vQbPickReportNo != null && vQbPickReportNo !='' && vQbPickReportNo !='null' && vQbPickReportNo !='undefined')
					vPickReportNo.setDefaultValue(vQbPickReportNo);
				
				if(vQbFromDate != null && vQbFromDate !='' && vQbFromDate !='null' && vQbFromDate !='undefined')
					fromDate.setDefaultValue(vQbFromDate);
				
				if(request.getParameter('custpage_hdnpickrptstatuschange') != 'T')
				{

					var sublist = form.addSubList("custpage_items", "list", "Pick Report List");
					sublist.addField("custpage_pickreport", "text", "Pick Report #");	
					sublist.addField("custpage_pickreportflag", "text", "Pick Report Status");
					sublist.addField("custpage_remarks", "text", "Remarks");
					sublist.addField("custpage_pickreport_link", "text", "");

					var schfilter=new Array();
					if(vQbPickReportNo != null && vQbPickReportNo !='')
						schfilter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',null,'startswith',vQbPickReportNo));
					schfilter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname',null,'is','PICK REPORT'));
					if(vQbFromDate !=null && vQbFromDate !='')
						schfilter.push(new nlobjSearchFilter('custrecord_wmsse_schprsbegindate',null,'on',vQbFromDate));

					var Pickstatus="";
					var schcolumn=new Array();
					schcolumn[0]=new nlobjSearchColumn('custrecord_wmsse_schprsstatus');
					schcolumn[1]=new nlobjSearchColumn('custrecord_wmsse_schprsname');
					schcolumn[2]=new nlobjSearchColumn('custrecord_wmsse_schprstranrefno');
					schcolumn[3]=new nlobjSearchColumn('custrecord_wmsse_schprsnotes').setSort(true);
					var schedulersearchresult=nlapiSearchRecord('customrecord_wmsse_schscripts_status',null,schfilter,schcolumn);
					nlapiLogExecution('ERROR', 'schedulersearchresult',schedulersearchresult);
					var vremarks ='';
					if(schedulersearchresult!=null && schedulersearchresult!='')
					{
						var j=1;
						for(var x=0;x<schedulersearchresult.length;x++)
						{
							Pickstatus = schedulersearchresult[x].getValue('custrecord_wmsse_schprsstatus');
							var vSchPickReportNo = schedulersearchresult[x].getValue('custrecord_wmsse_schprstranrefno');
							nlapiLogExecution('ERROR', 'vSchPickReportNo',vSchPickReportNo);

							nlapiLogExecution('ERROR', 'Pickstatus',Pickstatus);

							if(Pickstatus=='Completed')
							{
								var vOpenfilters = new Array();
								vOpenfilters.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', vSchPickReportNo));
								vOpenfilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['9','26']));//9-Pick Locations Assigned 26-Failed picks
								var Vopencolumns = new Array();
								Vopencolumns[0]=new nlobjSearchColumn('custrecord_wmsse_pickreport_no',null,'group');
								Vopencolumns[1]=new nlobjSearchColumn('custrecord_wmsse_wms_status_flag',null,'group');
								var objOpenTaskDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,vOpenfilters, Vopencolumns);
								if(objOpenTaskDetails!=null && objOpenTaskDetails !='' && objOpenTaskDetails.length > 0)
								{
									for(var i=0;i<objOpenTaskDetails.length;i++)
									{
										var vCount=0;
										var vnPickStatusFlag = objOpenTaskDetails[i].getValue('custrecord_wmsse_wms_status_flag',null,'group');
										if(vnPickStatusFlag == 9)
										{
											vCount = parseFloat(vCount)+1;
										}
									}
									nlapiLogExecution('ERROR', 'vCount',vCount);
									if(vCount >= 1)
									{
										vremarks ="";
									}
									else
									{
										vremarks ='Failed picks due to configuration/insufficient inventory';
									}
									nlapiLogExecution('ERROR', 'vremarks',vremarks);
									var vnPickReportNo = objOpenTaskDetails[0].getValue('custrecord_wmsse_pickreport_no',null,'group');
									var	pickreport = nlapiResolveURL('SUITELET', 'customscript_wmsse_multipickreportpdf', 'customdeploy_wmsse_multipickreportpdf');
									pickreport = pickreport+ '&custparam_pickreportno='+ vnPickReportNo;
									form.getSubList('custpage_items').setLineItemValue('custpage_pickreport', j, vnPickReportNo);	
									form.getSubList('custpage_items').setLineItemValue('custpage_pickreportflag', j, Pickstatus);
									form.getSubList('custpage_items').setLineItemValue('custpage_remarks', j, '<font color=#ff0000><b>' +  vremarks + '</b></font>');
									if(vremarks =="")
										form.getSubList('custpage_items').setLineItemValue('custpage_pickreport_link', j, '<a href="' + pickreport + '">Pick Report</a>');
									j=parseInt(j)+1;

								}
								else
								{
									vremarks=schedulersearchresult[x].getValue('custrecord_wmsse_schprsnotes');					
									form.getSubList('custpage_items').setLineItemValue('custpage_pickreport', x+1, vSchPickReportNo);				
									form.getSubList('custpage_items').setLineItemValue('custpage_pickreportflag', x+1, Pickstatus);
									form.getSubList('custpage_items').setLineItemValue('custpage_remarks', x+1, '<font color=#ff0000><b>' +  vremarks + '</b></font>');
									j=parseInt(j)+1;
								}

							}
							else
							{
								vremarks='';
								Pickstatus='In Progress';					
								form.getSubList('custpage_items').setLineItemValue('custpage_pickreport', j, vSchPickReportNo);				
								form.getSubList('custpage_items').setLineItemValue('custpage_pickreportflag', j, 'In Progress');
								form.getSubList('custpage_items').setLineItemValue('custpage_remarks', j, '<font color=#ff0000><b>' +  vremarks + '</b></font>');
								j=parseInt(j)+1;

							}
						}
					}
					else
					{
						nlapiLogExecution('ERROR', 'No results found',vPickReportNo);

					}
				}
			}
			form.addSubmitButton('Display');
			response.writePage(form);
		}
		catch(ex)
		{
			nlapiLogExecution('ERROR', 'exception',ex);
			showInlineMessage(form, 'ERROR', ex);
		}
	}

}

function pickreportstatustype_onChange(type,name)
{

	if(name == 'custpage_reportstatustype')
	{
		if(nlapiGetFieldValue('custpage_hdnpickrptstatuschange')=='')
		{
			nlapiSetFieldValue('custpage_hdnpickrptstatuschange','T');
		}
		NLDoMainFormButtonAction('submitter',true);
	}

	
}

function getSOId(sonumber)
{
	var vType='SalesOrd';
	/*if(tranType=='salesorder')
		vType='SalesOrd';
	else if(tranType=='transferorder')
		vType='TrnfrOrd';*/

	var soId = '';
	var filters = new Array();
	var columns = new Array();

	if(sonumber != null && sonumber != '' && sonumber != 'null')
		filters.push(new nlobjSearchFilter('tranid', null, 'is', sonumber));

	//filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	columns.push(new nlobjSearchColumn('internalid'));
	columns.push(new nlobjSearchColumn('type'));
	
	var SODetails = nlapiSearchRecord('transaction', null, filters, columns);
	return SODetails;
}