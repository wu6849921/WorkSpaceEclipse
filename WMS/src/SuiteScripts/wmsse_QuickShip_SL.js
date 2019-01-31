/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * This function is used to do QuickShip
 * @param request and response
 * @returns {}
 */ 
function QuickShipSLSE(request,response)
{
	if (request.getMethod() == 'GET') {
		var form = nlapiCreateForm('Quick Ship');
		fncreateform(form);
		var OrderType = form.addField('custpage_ordertype', 'select', 'Transaction Type').setMandatory(true).setDisplaySize(150);
		OrderType.setLayoutType('normal', 'startcol');
		OrderType.addSelectOption("salesorder","Sales Order");
		OrderType.addSelectOption("transferorder","Transfer Order");
		form.setScript('customscript_wmsse_quickship_cl');
		if(request.getParameter('custpage_ordertype')!='' && request.getParameter('custpage_ordertype')!=null)
		{
			OrderType.setDefaultValue(request.getParameter('custpage_ordertype'));	
		}
		form.addSubmitButton('Display');
		response.writePage(form);
	}
	else
	{
		var vSo = request.getParameter('custpage_qbso');
		var vCarton = request.getParameter('custpage_qbcarton');
		var vOrderType = request.getParameter('custpage_ordertype');
		var vLocation = request.getParameter('custpage_qbwhlocation');
		
		var form = nlapiCreateForm('Quick Ship');	
		fncreateform(form);
		form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
		form.setScript('customscript_wmsse_quickship_cl');
		var OrderType = form.addField('custpage_ordertype', 'select', 'Transaction Type').setMandatory(true).setDisplaySize(150).setDisplayType('inline');//.setLayoutType('endrow','none').setDisplayType('inline');
		OrderType.addSelectOption("salesorder","Sales Order");
		OrderType.addSelectOption("transferorder","Transfer Order");
		OrderType.setLayoutType('normal', 'startcol');
		if(request.getParameter('custpage_ordertype')!='' && request.getParameter('custpage_ordertype')!=null)
		{
			OrderType.setDefaultValue(request.getParameter('custpage_ordertype'));	
		}
		var msg = form.addField('custpage_message', 'inlinehtml', null, null, null);
		msg.setLayoutType('outside','startcol');


		var SoId="";
		var shipmethod="";
		var bulkQuickShipFlag="F";
		form.addSubmitButton('Display');
		var columnsPicktsk = new Array();
//		columnsPicktsk[0] = new nlobjSearchColumn('custrecord_wmsse_order_no');
//		columnsPicktsk[1] = new nlobjSearchColumn('custrecord_wmsse_container_lp_no');
//		columnsPicktsk[2] = new nlobjSearchColumn('custrecord_wmsse_total_weight');
//		columnsPicktsk[3] = new nlobjSearchColumn('name');
//		columnsPicktsk[4] = new nlobjSearchColumn('custrecord_wmsse_line_no');
//		columnsPicktsk[5] = new nlobjSearchColumn('custrecord_wmsse_order_no');
//		columnsPicktsk[6] = new nlobjSearchColumn('custrecord_wmsse_containerweight');
//		columnsPicktsk[7] = new nlobjSearchColumn('custrecord_wmsse_shipmethod');
//		columnsPicktsk[2].setSort();

		var filtersPicktsk = new Array();		
		var ctx = nlapiGetContext();
		var blnMultiShipEnabled = ctx.getFeature('multishipto');
		nlapiLogExecution('ERROR','blnMultiShipEnabled',blnMultiShipEnabled);
		var vShipMethodArr=new Array();
		var vShipMethodTextArr=new Array();
		var hidenOrderType = form.addField('custpage_hidenordertype', 'text', 'OrderType #').setDisplayType('hidden');
		hidenOrderType.setDefaultValue(OrderType);

		if(vSo!=null && vSo!='' || vCarton!=null && vCarton!="")
		{
			nlapiLogExecution('ERROR','vCarton,vSo',vSo+","+vCarton);

			nlapiLogExecution('ERROR','vCarton',vCarton);
			var objSoDetailsArray = new Array();
			var vMultilineShip = 'F';

			if(vSo!=null && vSo!='')
			{
				var soSearchrec=fnGetSOInternalId(vSo,vOrderType,blnMultiShipEnabled,vLocation);
				if(soSearchrec != null && soSearchrec != '')
				{
					nlapiLogExecution('ERROR','soSearchrec',soSearchrec);
					for (var f = 0; f < soSearchrec.length; f++)
					{	
						var shipmethod='';
						SoId = soSearchrec[f].getId();
						nlapiLogExecution('ERROR','SoId',SoId);
						shipmethod = soSearchrec[f].getValue('shipmethod');
						var shipmethodText = soSearchrec[f].getText('shipmethod');
						if(blnMultiShipEnabled)
							vMultilineShip = soSearchrec[f].getValue('ismultishipto');
						if(vMultilineShip == null || vMultilineShip =='')
							vMultilineShip = 'F';
						if(shipmethod !=null && shipmethod!='' && vShipMethodArr.indexOf(parseInt(shipmethod)) == -1)
						{
							vShipMethodArr.push(parseInt(shipmethod));
							vShipMethodTextArr.push(shipmethodText);
						}
						objSoDetailsArray.push(SoId);
					}
				}
			}
			else
			{

				if(vCarton!=null && vCarton!="")
				{

					var gettotalOpenTaskBulkRecords=fnGetSOInternalIdBasedonOpenTask(vSo,vOrderType,blnMultiShipEnabled,vCarton,vLocation);
					if(gettotalOpenTaskBulkRecords!=null && gettotalOpenTaskBulkRecords!="")
					{
						nlapiLogExecution('ERROR','ReturnOpenTaskRecords',gettotalOpenTaskBulkRecords);
						for(var t=0;t<gettotalOpenTaskBulkRecords.length;t++)
						{

							var vSoInternalid=gettotalOpenTaskBulkRecords[t].getValue('InternalId','custrecord_wmsse_order_no','group');
							var shipmethod=gettotalOpenTaskBulkRecords[t].getValue('custrecord_wmsse_shipmethod',null,'group');
							var shipmethodText=gettotalOpenTaskBulkRecords[t].getText('custrecord_wmsse_shipmethod',null,'group');
							nlapiLogExecution('ERROR','vSoInternalid',vSoInternalid+","+shipmethodText);
							if(shipmethod !=null && shipmethod!='' && vShipMethodArr.indexOf(parseInt(shipmethod)) == -1)
							{
								vShipMethodArr.push(parseInt(shipmethod));
								vShipMethodTextArr.push(shipmethodText);
							}
							if(vSoInternalid!=null && vSoInternalid!="" && objSoDetailsArray.indexOf(vSoInternalid)==-1)
							{
								objSoDetailsArray.push(vSoInternalid);

							}
							bulkQuickShipFlag="T";
						}
					}
				}

			}
			if(SoId !=null && SoId !='' && SoId !='null' && SoId !='undefined')
			{
				var currentUser=getCurrentUser();
				nlapiLogExecution('ERROR','currentUser', currentUser);
				nlapiLogExecution('ERROR','SoId', SoId);

				var lockfilters=new Array();			
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',SoId));			
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_userlocklocation',null,'anyof',vLocation));
				var lockcolumns= new Array();
				
				var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);
				nlapiLogExecution('ERROR','lockresults', lockresults);
				if(lockresults!=null && lockresults!='')
				{
					var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
					var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
					nlapiLogExecution('ERROR', 'getLockUser', getLockUser);
					nlapiLogExecution('ERROR', 'getLockLine', getLockLine);
					if(getLockUser!=currentUser)
					{


						msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'SO/TO being processed by other user.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
						response.writePage(form);
						return;
					}

				}
				else
				{
					var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
					LockRecord.setFieldValue('name',SoId);
					//LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
					LockRecord.setFieldValue('custrecord_wmsse_order',SoId);
					//LockRecord.setFieldValue('custrecord_wmsse_line',getSOLineNo);
					LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
					LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
					LockRecord.setFieldValue('custrecord_wmsse_userlocklocation',vLocation);
					var recid = nlapiSubmitRecord(LockRecord);
					nlapiLogExecution('ERROR', 'Record Locked Successfully', recid);
					LockRecord=null;
				}
				lockresults=null;
				lockcolumns=null;
				lockfilters=null;
			}

			var trantype=vOrderType;
			nlapiLogExecution('ERROR','objSoDetailsArray',objSoDetailsArray.length);
			if(objSoDetailsArray != null && objSoDetailsArray != '')
			{	


				nlapiLogExecution('ERROR','SoId',SoId);
				nlapiLogExecution('ERROR','vShipMethodArr',vShipMethodArr);
				nlapiLogExecution('ERROR','vMultilineShip',vMultilineShip);
				var Quickshpflag='F';
				var falseQuickship=new Array();
				if(vShipMethodArr !=null && vShipMethodArr !='' && vShipMethodArr.length > 0)
				{
					var vTempOTResults=new Array();
					var vContLPArr=new Array();
					var vSoOrderArray = new Array();
					var falseQuickship = 'F';
					for(var c=0;c<vShipMethodArr.length;c++)
					{
						var vnShipMethod = vShipMethodArr[c];
						var vnShipMethodText = vShipMethodTextArr[c];
						nlapiLogExecution('ERROR','vnShipMethod',vnShipMethod);
						nlapiLogExecution('ERROR','vnShipMethodText',vnShipMethodText);
						var Quickshpflag=fnGetQuickShipFlagbyShipmethod(vnShipMethod);

						if(Quickshpflag=='T')
						{
							falseQuickship= 'T';
							if(bulkQuickShipFlag=="F")
							{
								if(SoId!=null && SoId!="")
								{
									filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', SoId));
								}

							}
							//filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [28]));//status.outbound.packcomplete
							//filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));//pick task
							filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'noneof',['@NONE@'])); 
							if(vCarton!=null && vCarton!="")
							{
								filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no',null,'is',vCarton));
							}

							if(vMultilineShip == 'T' && vnShipMethod!=null && vnShipMethod !='' && vnShipMethod !='- None -')
							{	
								nlapiLogExecution('ERROR','vnShipMethod1',vnShipMethod);

								filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyOf',vShipMethodArr));
							}
							filtersPicktsk.push(new nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is','T'));
							if(vLocation!='' && vLocation!=null && vLocation!='null')
							{
								filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', vLocation));
							}
							
							filtersPicktsk.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
							var opentasksosearchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_quickship_details', filtersPicktsk, null);
							nlapiLogExecution('ERROR','opentasksosearchresults',opentasksosearchresults);
							if(opentasksosearchresults!="" && opentasksosearchresults!=null)
							{	
								nlapiLogExecution('ERROR','opentasksosearchresults.length',opentasksosearchresults.length);


								for(var s=0;s<opentasksosearchresults.length;s++)
								{
									var vContLP=opentasksosearchresults[s].getValue('custrecord_wmsse_container_lp_no');
									var vShipMehtod=opentasksosearchresults[s].getValue('custrecord_wmsse_shipmethod');
									var vShipMehtodText=opentasksosearchresults[s].getText('custrecord_wmsse_shipmethod');
									nlapiLogExecution('ERROR','vShipMehtod : vnShipMethod ',vShipMehtod + ":" + vnShipMethod);
									var vSoOrderId=opentasksosearchresults[s].getValue('custrecord_wmsse_order_no');
									var openTaskId = opentasksosearchresults[s].getId();
									
									if(vShipMehtod == vnShipMethod || vMultilineShip == 'F')
									{

										if(Quickshpflag == 'T')
										{
											var filter = new Array();
											if(vContLP != null && vContLP != '' && vContLP != 'null' && vContLP != undefined)
												filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_contlp',null,'is',vContLP));
											if(SoId != null && SoId != '' && SoId != 'null' && SoId != undefined)
												filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_order',null,'anyof',SoId));
											if(vSoInternalid != null && vSoInternalid != '' && vSoInternalid != 'null' && vSoInternalid != undefined)
												filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_order',null,'anyof',vSoInternalid));
											var columns = new Array();
											//columns[0] = new nlobjSearchColumn('custrecord_wmsse_ship_order');
											var manifestList= nlapiSearchRecord('customrecord_wmsse_ship_manifest','customsearch_wmsse_shipmanifest_details',filter,null);
											
											if(vCarton!=null && vCarton!="")
											{
												if(vSoOrderId != null && vSoOrderId != '' && vSoOrderArray.indexOf(vSoOrderId)==-1)
												{
													nlapiLogExecution('ERROR','vSoId ',vSoOrderId);
													vSoOrderArray.push(vSoOrderId);
													vTempOTResults.push(opentasksosearchresults[s]);
												}

											}
											else
											{
												if(vContLP != null && vContLP != '' && vContLPArr.indexOf(vContLP)==-1)
												{
													vContLPArr.push(vContLP);
													vTempOTResults.push(opentasksosearchresults[s]);
												}	
											}
										}

									}
								}	

							}
							else
							{


								var filtersPicktsk = new  Array();
								var columnsPicktsk = new Array();
								if(SoId!=null && SoId!="")
								{
									filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', SoId));
								}


								//filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [28]));//status.outbound.packcomplete
								//filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));//pick task
								filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
								if(vCarton!=null && vCarton!="")
								{
									filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no',null,'is',vCarton));
								}
								filtersPicktsk.push(new nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is','T'));
								filtersPicktsk.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
								if(vMultilineShip == 'T' && vnShipMethod!=null && vnShipMethod !='' && vnShipMethod !='- None -')
								{	
									nlapiLogExecution('ERROR','vnShipMethod1',vnShipMethod);

									filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyOf',vShipMethodArr));
								}
								columnsPicktsk.push(new nlobjSearchColumn('custrecord_wmsse_nsconfirm_ref_no'));
								columnsPicktsk.push(new nlobjSearchColumn('custrecord_wmsse_wms_status_flag'));
								var opentasksosearchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_quickship_details', filtersPicktsk, null);
								nlapiLogExecution('ERROR','opentasksosearchresults',opentasksosearchresults);
								if(opentasksosearchresults != null && opentasksosearchresults != '' && opentasksosearchresults.length > 0)
								{

									msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'Item fullfillment not yet posted for the entered transaction.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");

								}
								else
								{				

									msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'No containers found to perform quick ship.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
								}
							}
							nlapiLogExecution('ERROR','falseQuickship',falseQuickship);
						}


					}
					if(falseQuickship == 'F')
					{
						if(trantype=='salesorder')
						{
							msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'The Service Level for this SO is not tagged for Quickship.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
						}
						else
						{
							msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'The Service Level for this TO is not tagged for Quickship.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
						}
						response.writePage(form);
						return;

					}
					fndisplaySublist(vTempOTResults,form,msg,vOrderType,vLocation);
				}
				else
				{
					if(trantype=='salesorder')
					{
						msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'The Service Level for this SO is not tagged for Quickship.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
					}
					else
					{
						msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'The Service Level for this TO is not tagged for Quickship.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
					}
				}
			}
			else
			{
				msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'Invalid transaction #.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");

			}	
		}
		var lineCount = request.getLineItemCount('custpage_items');
		nlapiLogExecution('ERROR','lineCount',lineCount);
		var refreshpage=false;
		var contlpArray=new Array();
		if(lineCount!=null && lineCount>0)	
		{
			var isLinesSelected ='F';
			for (var k=1; k<=lineCount; k++){
				if(request.getLineItemValue('custpage_items', 'custpage_select', k) == 'T'){
					isLinesSelected='T';
					var contlp=request.getLineItemValue('custpage_items', 'custpage_container', k);
					var trackingno=request.getLineItemValue('custpage_items', 'custpage_trackingno', k);
					var actwght=request.getLineItemValue('custpage_items', 'custpage_weight', k);
					var pakageweight=request.getLineItemValue('custpage_items', 'custpage_packweight', k);
					var vsoId=request.getLineItemValue('custpage_items', 'custpage_sonointernalid', k);
					var	vcarrier='';
					nlapiLogExecution('ERROR', 'into SoId',vsoId);
					fnCreateShipManifestRecord(vsoId,contlp,vcarrier,trackingno,actwght,pakageweight,vOrderType,shipmethod);
					contlpArray[contlpArray.length]=contlp;
					refreshpage=true;
				}	
			}
			if(isLinesSelected == 'F')
			{
				msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'Please select atleast one line for processing.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
			}
		}		
		if(refreshpage!=false)
		{
			nlapiLogExecution('ERROR', 'into refreshpage');
			if(SoId!=null && SoId!="" || vCarton!=null && vCarton!="")
			{
				try
				{

					var vnTempOTResults=new Array();
					var vnContLPArr=new Array();
					var vSoOrderArray= new Array();
					nlapiLogExecution('ERROR', 'trantype before empty', trantype);
					//Case# 201415667  start
					//var trantype="";
					//Case# 201415667  end
					nlapiLogExecution('ERROR', 'into refreshpage details',vSo+","+vCarton+","+SoId);
					if(vCarton==null || vCarton=="")
					{
						trantype= nlapiLookupField('transaction', SoId, 'recordType');
						nlapiLogExecution('ERROR', 'trantype', trantype);
					}

					nlapiLogExecution('ERROR', 'trantype', trantype);
					
					if(SoId!=null && SoId!="")
					{
						filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', SoId));
					}
					if(vCarton!=null && vCarton!="")
					{
						filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no',null,'is',vCarton));
					}
					//filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));//status.outbound.packcomplete
					//filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));//pick task
					filtersPicktsk.push(new nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is','T'));
					filtersPicktsk.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
					var opentasksosearchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_quickship_details', filtersPicktsk, null);
					nlapiLogExecution('ERROR', 'Refresh-opentasksosearchresults', opentasksosearchresults);
					if(opentasksosearchresults!=null && opentasksosearchresults!='' && opentasksosearchresults.length > 0)
					{				
						form.getSubList('custpage_items').setLineItemValues(null);
						var quickShipAllowedShipMethods = new Array();
						for(var g=0;g<opentasksosearchresults.length;g++)
						{   
							var quickShipFlag='T';
							var shipmethod = opentasksosearchresults[g].getValue('custrecord_wmsse_shipmethod');

							if(quickShipAllowedShipMethods.indexOf(shipmethod) == -1)
							{
								quickShipFlag = fnGetQuickShipFlagbyShipmethod(shipmethod);

								if(quickShipFlag == 'T')
								{
									quickShipAllowedShipMethods.push(shipmethod);
								}
							}

							var vnContLP=opentasksosearchresults[g].getValue('custrecord_wmsse_container_lp_no');
							var vSoOrderId=opentasksosearchresults[g].getValue('custrecord_wmsse_order_no');

							if(vCarton!=null && vCarton!="")
							{

								if(vSoOrderId != null && vSoOrderId != '' && vSoOrderArray.indexOf(vSoOrderId)==-1)
								{

									vSoOrderArray.push(vSoOrderId);
									vnTempOTResults.push(opentasksosearchresults[g]);
								}

							}
							else
							{
								if(vContLP != null && vContLP != '' && vContLPArr.indexOf(vContLP)==-1)
								{
									vContLPArr.push(vContLP);
									vnTempOTResults.push(opentasksosearchresults[g]);
								}	
							}
						}	
						fndisplaySublist(vnTempOTResults,form,msg,trantype,vLocation);	
					}
					else
					{
						form.getSubList('custpage_items').setLineItemValues(null);
						//Case # 201416335 start
						fndisplaySublist(vnTempOTResults,form,msg,trantype,vLocation);
						//Case # 201416335 end
					}
					if(trantype=='salesorder')
					{
						var contlpArrayNew=new Array();
						contlpArrayNew=removeDuplicateElement(contlpArray);
						var soField = form.getField('custpage_qbso');
						var cartonField= form.getField('custpage_qbcarton');
						var ordertype= form.getField('custpage_ordertype');

						cartonField.setDefaultValue('');
						soField.setDefaultValue('');
						ordertype.setDefaultValue('');
						var form = nlapiCreateForm('Quick Ship');	
						//form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
						form.setScript('customscript_wmsse_quickship_cl');
						form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
						var vmsg = form.addField('custpage_message', 'inlinehtml', null, null, null);
						vmsg.setLayoutType('outside','startcol');
						vmsg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Confirmation','SO/TO "+vSo+" with containerlp(s) "+contlpArrayNew.toString()+" shipped successfully' , NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
					}
					else
					{
						var listArray=new Array();
						listArray=removeDuplicateElement(contlpArray);
						var soField = form.getField('custpage_qbso');
						var cartonField= form.getField('custpage_qbcarton');
						var ordertype= form.getField('custpage_ordertype');

						cartonField.setDefaultValue('');
						soField.setDefaultValue('');
						ordertype.setDefaultValue('');
						var form = nlapiCreateForm('Quick Ship');	
						//form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
						form.setScript('customscript_wmsse_quickship_cl');
						form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
						var vmsg = form.addField('custpage_message', 'inlinehtml', null, null, null);
						vmsg.setLayoutType('outside','startcol');
						vmsg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Confirmation','SO/TO "+vSo+" with containerlp(s) "+listArray.toString()+" shipped successfully' , NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
						//msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Confirmation','TO "+vSo+" with containerlp(s) "+contlpArray.toString()+" shipped sucessfully' , NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
					}

				}
				catch (e) 
				{
					if (e instanceof nlobjError)
						nlapiLogExecution('ERROR', 'system error', e.getCode() + '\n'
								+ e.getDetails());
					else
						nlapiLogExecution('ERROR', 'unexpected error', e.toString());
					nlapiLogExecution('ERROR', 'unexpected error', 'I am unsuccess3');

				}
				finally
				{

					var currentUser=getCurrentUser();
					nlapiLogExecution('ERROR','currentUser', currentUser);
					var lockfilters=new Array();
					if(SoId!=null && SoId!="" && SoId!="null")
					{
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',SoId));	
					}
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
					lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_userlocklocation',null,'anyof',vLocation));
						
					var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

					if(lockresults!=null && lockresults!='')
					{
						var lockRecordId=lockresults[0].getId();
						nlapiLogExecution('ERROR','lockRecordId', lockRecordId);

						var LockDeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockrecs', lockRecordId);
						LockDeleteRecordId=null;
					}
					lockresults=null;
					lockcolumns=null;
					lockfilters=null;

				}
			}
		}
		response.writePage(form);
	}
}

/**
 * This function is used to display list of orders eligible for quick ship
 * @param 
 * @returns {}
 */
function fndisplaySublist(opentasksosearchresults,form,msg,vOrderType,vLocation)
{
	var shipmethod='';
	var wgt=0;
	var packwt=0;
	var vLocname= nlapiLookupField('location',vLocation,'name');
	nlapiLogExecution('DEBUG', 'vLocname', vLocname);
	
	if(opentasksosearchresults!=null && opentasksosearchresults!='' && opentasksosearchresults.length>0)
	{

		if(opentasksosearchresults[0].getValue('custrecord_wmsse_order_no')!=null && opentasksosearchresults[0].getValue('custrecord_wmsse_order_no')!='')
		{
			nlapiLogExecution('ERROR','soid',opentasksosearchresults[0].getValue('custrecord_wmsse_order_no'));
			nlapiLogExecution('ERROR','soid',opentasksosearchresults[0].getText('custrecord_wmsse_order_no'));
			var vorderno=opentasksosearchresults[0].getText('custrecord_wmsse_order_no')
			if(vOrderType==null || vOrderType=="")
			{
				var vsplitordno=''; 

				if(vorderno!=null)
				{
					vsplitordno=vorderno.split('#');
				}
				vOrderType=vsplitordno[0];
				vOrderType=vOrderType.split(' ').join('');
			}
			var searchrec=nlapiLoadRecord(vOrderType,opentasksosearchresults[0].getValue('custrecord_wmsse_order_no'));

			if(searchrec!=null && searchrec!='')
			{
				shipmethod=searchrec.getFieldText('shipmethod');
				nlapiLogExecution('ERROR','shipmethod',shipmethod);
			}
		} 
		nlapiLogExecution('ERROR','opentasksosearchresultslength',opentasksosearchresults.length);

		var strcntlp=new Array;var count=0;
		//case 201411590
		if(opentasksosearchresults!="" && opentasksosearchresults!=null)
		{
			for(var i=0;i<opentasksosearchresults.length;i++)
			{
				var so=opentasksosearchresults[i].getText('custrecord_wmsse_order_no');
				var soId=opentasksosearchresults[i].getValue('custrecord_wmsse_order_no');
				var cntlp=opentasksosearchresults[i].getValue('custrecord_wmsse_container_lp_no');
				var openTaskId=opentasksosearchresults[i].getId();
				
				if(opentasksosearchresults[i].getValue('custrecord_wmsse_total_weight')!=null && opentasksosearchresults[i].getValue('custrecord_wmsse_total_weight')!='')
				{
					wgt=parseFloat(opentasksosearchresults[i].getValue('custrecord_wmsse_total_weight'));
				}
				else
				{
					wgt=parseFloat(opentasksosearchresults[i].getValue('custrecord_wmsse_containerweight'));
				}		
				var name=opentasksosearchresults[i].getValue('name');
				var lineno=opentasksosearchresults[i].getValue('custrecord_wmsse_line_no');
				if(opentasksosearchresults[i].getValue('custrecord_wmsse_containerweight')!=null && opentasksosearchresults[i].getValue('custrecord_wmsse_containerweight')!='')
				{
					packwt=opentasksosearchresults[i].getValue('custrecord_wmsse_containerweight');
				}
				var vnShipMethod = opentasksosearchresults[i].getText('custrecord_wmsse_shipmethod');
				
				if((vnShipMethod == null || vnShipMethod == '' || vnShipMethod =='null' || vnShipMethod =='undefined' || vnShipMethod =='- None -')&&(shipmethod == null || shipmethod == '' || shipmethod =='null' || shipmethod =='undefined' || shipmethod =='- None -'))
				{
				vnShipMethod = shipmethod;				
				var openTaskUpdate = nlapiSubmitField('customrecord_wmsse_trn_opentask', openTaskId,'custrecord_wmsse_shipmethod' ,shipmethod );
				}
				
				form.getSubList('custpage_items').setLineItemValue('custpage_sonointernalid', count + 1,soId);
				form.getSubList('custpage_items').setLineItemValue('custpage_whloc', count + 1,vLocname);
				form.getSubList('custpage_items').setLineItemValue('custpage_sono', count + 1, so);
				form.getSubList('custpage_items').setLineItemValue('custpage_container', count + 1, cntlp);
				form.getSubList('custpage_items').setLineItemValue('custpage_weight', count + 1, wgt);	
				form.getSubList('custpage_items').setLineItemValue('custpage_packweight', count + 1, packwt);	
				form.getSubList('custpage_items').setLineItemValue('custpage_shippingmethod', count + 1, vnShipMethod);	
				count=count+1;
				var button = form.getButton('submitter');
				button.setLabel('Submit');

			}
		}
		else
		{
			form.getSubList('custpage_items').setLineItemValues(opentasksosearchresults);
			//Get the button
			var button = form.getButton('submitter');
			button.setLabel('Display');
			msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'Packing is not yet done for this SO/TO.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
		}
	}
}

/**
 * This function is used to create record in shipmanifest record
 * @params orderno,containrelp,carriertype,actualweight,packagewt,ordertype
 * @returns {}
 */
function fnCreateShipManifestRecord(vordNo,vContLpNo,vCarrierType,vTrackingNo,vActualweight,PackageWeight,vOrderType,shipmethod) {
	try {

		if(vTrackingNo==null || vTrackingNo=='')
			vTrackingNo=vContLpNo;
		nlapiLogExecution('ERROR', 'into fnCreateShipManifestRecord','from inside');		
		nlapiLogExecution('ERROR', 'Transaction #',vordNo);	
		nlapiLogExecution('ERROR', 'Container LP #',vContLpNo);	
		nlapiLogExecution('ERROR', 'Carrier Type',vCarrierType);	
		nlapiLogExecution('ERROR', 'vTrackingNo',vTrackingNo);
		if (vordNo != null && vordNo != "") 
		{
			nlapiLogExecution('ERROR', 'test');
			if(fnIsContainerLpExist(vContLpNo,vordNo)!='T')
			{
				nlapiLogExecution('ERROR', 'test');
				var freightterms ="";
				var otherrefnum="";
				var trantype =vOrderType
				nlapiLogExecution('ERROR', 'trantype', trantype);
				//Get the records in SalesOrder
				nlapiLogExecution('ERROR', 'SalesOrderList','');
				var  searchresults;
				if(trantype=="salesorder")
				{
					searchresults =SalesOrderList(vordNo);
				}

				else if(trantype=="transferorder")
				{
					nlapiLogExecution('ERROR', 'transferorder','');
					var filters = new Array();
					filters[0] = new nlobjSearchFilter('Internalid', null, 'is', vordNo);
					filters[1] = new nlobjSearchFilter('mainline', null, 'is', 'T');
					var columns = new Array();
					columns[0] = new nlobjSearchColumn('tranid');
					columns[1] = new nlobjSearchColumn('shipcarrier');
					columns[2] = new nlobjSearchColumn('shipaddress1');
					columns[3] = new nlobjSearchColumn('shipaddress2');
					columns[4] = new nlobjSearchColumn('shipcity');
					columns[5] = new nlobjSearchColumn('shipstate');
					columns[6] = new nlobjSearchColumn('shipcountry');
					columns[7] = new nlobjSearchColumn('shipzip');
					columns[8] = new nlobjSearchColumn('shipmethod');
					columns[9] = new nlobjSearchColumn('shipaddressee');
					columns[10] = new nlobjSearchColumn('transferlocation');

					searchresults = nlapiSearchRecord('transferorder', 'customsearch_wmsse_quickship_iddetails', filters, columns);
					nlapiLogExecution('ERROR', 'transferorder',searchresults.length);
				}
				nlapiLogExecution('ERROR', 'SalesOrderList',searchresults);

				//Get the records in customrecord_wmsse_trn_opentask
				var opentaskordersearchresult = fngetOpenTaskquickShipmentDetails(vordNo, vContLpNo);
				nlapiLogExecution('ERROR', 'getOpenTaskDetails',opentaskordersearchresult);
				var vreference3 = "";
				var ShipManifest = nlapiCreateRecord('customrecord_wmsse_ship_manifest');
				ShipManifest.setFieldValue('custrecord_wmsse_ship_order', searchresults[0].getValue('tranid'));
				ShipManifest.setFieldValue('custrecord_wmsse_ship_orderno', searchresults[0].getValue('tranid'));
				vreference3 = searchresults[0].getValue('tranid');
				ShipManifest.setFieldValue('custrecord_wmsse_ship_carrier','QuickShip');
				ShipManifest.setFieldValue('custrecord_wmsse_ship_city',searchresults[0].getValue('shipcity'));
				ShipManifest.setFieldValue('custrecord_wmsse_ship_state',searchresults[0].getValue('shipstate'));
				ShipManifest.setFieldValue('custrecord_wmsse_ship_country',searchresults[0].getValue('shipcountry'));
				ShipManifest.setFieldValue('custrecord_wmsse_ship_addr1',searchresults[0].getValue('shipaddress1'));
				ShipManifest.setFieldValue('custrecord_wmsse_ship_trackno',vTrackingNo);
				ShipManifest.setFieldValue('custrecord_wmsse_ship_actwght',vActualweight);
				ShipManifest.setFieldValue('name',vordNo);

				//sales order specific code 
				if(trantype=="salesorder")
				{
					var contactName=searchresults[0].getText('entity');
					var entity=searchresults[0].getText('entity');
					if(contactName!=null && contactName!='')
						contactName=contactName.replace(","," ");

					if(entity!=null && entity!='')
						entity=entity.replace(","," ");

					ShipManifest.setFieldValue('custrecord_wmsse_ship_contactname',contactName);					
					ShipManifest.setFieldValue('custrecord_wmsse_ship_ordertype',searchresults[0].getText('custbody_nswmssoordertype'));
					otherrefnum=searchresults[0].getValue('otherrefnum');			 
					ShipManifest.setFieldValue('custrecord_wmsse_ship_paymethod',freightterms);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_phone',searchresults[0].getValue('custbody_customer_phone'));
					var cashondelivery= searchresults[0].getValue('custbody_wmsse_nswmscodflag');
					ShipManifest.setFieldValue('custrecord_wmsse_ship_codflag',cashondelivery);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_email',searchresults[0].getValue('email'));

					var rec= nlapiLoadRecord('salesorder', vordNo);
					var zipvalue=rec.getFieldValue('shipzip');
					var servicelevelvalue=rec.getFieldText('shipmethod');
					var consignee=rec.getFieldValue('shipaddressee');
					var shipcomplete=rec.getFieldValue('shipcomplete');
					var termscondition=rec.getFieldText('terms');

					var shiptotal="0.00";
					if((shipcomplete=="T")&&(termscondition=="C.O.D."))
					{
						ShipManifest.setFieldValue('custrecord_wmsse_ship_codflag','T');
						shiptotal=rec.getFieldValue('subtotal');
						ShipManifest.setFieldValue('custrecord_wmsse_ship_codamount',shiptotal);
					}
					else
					{
						ShipManifest.setFieldValue('custrecord_wmsse_ship_codflag','F');
						ShipManifest.setFieldValue('custrecord_wmsse_ship_codamount',shiptotal);
					}

					if(consignee!="" || consignee!=null)
						ShipManifest.setFieldValue('custrecord_wmsse_ship_consignee',consignee);
					else
						ShipManifest.setFieldValue('custrecord_wmsse_ship_consignee',entity);

					ShipManifest.setFieldValue('custrecord_wmsse_ship_servicelevel',servicelevelvalue);			
					ShipManifest.setFieldValue('custrecord_wmsse_ship_zip',zipvalue);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_ref2',otherrefnum);
				}

				var address1=searchresults[0].getValue('shipaddress1');
				var address2=searchresults[0].getValue('shipaddress2');
				var zip=searchresults[0].getValue('shipzip');
				var servicelevel=searchresults[0].getText('shipmethod');

				if(address1!=null && address1!='')
					address1=address1.replace(","," ");


				if(address2!=null && address2!='')
					address2=address2.replace(","," ");

				ShipManifest.setFieldValue('custrecord_wmsse_ship_order',vordNo);
				ShipManifest.setFieldValue('custrecord_wmsse_ship_custom5',"S");	
				ShipManifest.setFieldValue('custrecord_wmsse_ship_void',"N");

				ShipManifest.setFieldValue('custrecord_wmsse_ship_contactname',contactName);					
				ShipManifest.setFieldValue('custrecord_wmsse_ship_ordertype',searchresults[0].getText('custbody_nswmssoordertype'));
				otherrefnum=searchresults[0].getValue('otherrefnum');			 
				ShipManifest.setFieldValue('custrecord_wmsse_ship_paymethod',freightterms);

				ShipManifest.setFieldValue('custrecord_wmsse_ship_addr1',address1);
				ShipManifest.setFieldValue('custrecord_wmsse_ship_addr2',address2);

				var servicelevelList=GetSerViceLevel(vCarrierType);
				if((servicelevelList!=null)&&(servicelevelList !='')&&(servicelevelList.length>0))
				{
					vserlevel=servicelevelList[0].getValue('custrecord_wmsse_carrier_service_level'); 
					nlapiLogExecution('ERROR', 'vserlevel', vserlevel);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_servicelevel',vserlevel);
				}

				if(trantype=="transferorder")
				{
					var tolocation = searchresults[0].getValue('transferlocation');
					nlapiLogExecution('ERROR', 'tolocation', tolocation);

					var record = nlapiLoadRecord('location', tolocation);

					var shipfromaddress1=record.getFieldValue('addr1');
					var shipfromaddress2=record.getFieldValue('addr2');
					var shipfromcity=record.getFieldValue('city');
					var shipfromstate=record.getFieldValue('state');
					var shipfromzipcode =record.getFieldValue('zip');
					var shipfromcompanyname=record.getFieldValue('addressee');
					var shipfromcountry =record.getFieldValue('country');

					ShipManifest.setFieldValue('custrecord_wmsse_ship_carrier','QuickShip');
					ShipManifest.setFieldValue('custrecord_wmsse_ship_city',shipfromcity);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_state',shipfromstate);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_country',shipfromcountry);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_addr1',shipfromaddress1);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_zip',shipfromzipcode);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_addr2',shipfromaddress2);
				}

				if (opentaskordersearchresult != null && opentaskordersearchresult != "")
				{
					nlapiLogExecution('ERROR', 'inside opentask search results', opentaskordersearchresult);

					var oldcontainer="";
					for (l = 0; l < opentaskordersearchresult.length; l++) 
					{ 
						var custlenght="";	
						var custheight="";
						var custwidht="";

						var sku="";
						var skuno="";
						var uomlevel=""; 
						var containerlpno = opentaskordersearchresult[l].getValue('custrecord_wmsse_container_lp_no');
						nlapiLogExecution('ERROR', 'containerlp', containerlpno);
						sku = opentaskordersearchresult[l].getText('custrecord_wmsse_sku');
						skuno = opentaskordersearchresult[l].getValue('custrecord_wmsse_sku');

						if(oldcontainer!=containerlpno){
							ShipManifest.setFieldValue('custrecord_wmsse_ship_contlp',containerlpno);
							ShipManifest.setFieldValue('custrecord_wmsse_ship_ref5',containerlpno);
							ShipManifest.setFieldValue('custrecord_wmsse_ship_ref1',sku);
							ShipManifest.setFieldValue('custrecord_wmsse_ship_ref3', vreference3);

							ShipManifest.setFieldValue('custrecord_ship_length',1);	
							ShipManifest.setFieldValue('custrecord_ship_width',1);
							ShipManifest.setFieldValue('custrecord_ship_height',1);
							ShipManifest.setFieldValue('custrecord_ship_ref2',otherrefnum);		 

							if (containerlpno != null && containerlpno != "") {

								if (PackageWeight == '0.0' || PackageWeight == '0.0000' || PackageWeight == 'undefined' || PackageWeight == '' || PackageWeight == 'NAN' || PackageWeight == 'NaN')
								{
									pakageweight='0.11';

								}

								ShipManifest.setFieldValue('custrecord_wmsse_ship_pkgwght',PackageWeight);
							}

							oldcontainer = containerlpno;

							var id=	nlapiSubmitRecord(ShipManifest, false, true);	
							nlapiLogExecution('ERROR', 'id', id);
						}
					}					
				}

				else
				{
					nlapiLogExecution('ERROR', 'unexpected error', 'I am success2');
					var id=nlapiSubmitRecord(ShipManifest, false, true);
					nlapiLogExecution('ERROR', 'id', id);
				}
			}
			else
			{
				var filter = new Array();
				if(vContLpNo != null && vContLpNo != '' && vContLpNo != 'null' && vContLpNo != undefined)
				filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_contlp',null,'is',vContLpNo));
				if(vordNo != null && vordNo != '' && vordNo != 'null' && vordNo != undefined)
				filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_order',null,'anyof',vordNo));
				var columns = new Array();
				//columns[0] = new nlobjSearchColumn('custrecord_wmsse_ship_order');
				var manifestList= nlapiSearchRecord('customrecord_wmsse_ship_manifest','customsearch_wmsse_shipmanifest_details',filter,null);
				if(manifestList!=null && manifestList!='' && manifestList.length>0)
				{
					var ShipManifestRecord=nlapiLoadRecord('customrecord_wmsse_ship_manifest',manifestList[0].getId());
					ShipManifestRecord.setFieldValue('custrecord_wmsse_ship_trackno',vTrackingNo);
					ShipManifestRecord.setFieldValue('custrecord_wmsse_ship_actwght',vActualweight);
					ShipManifestRecord.setFieldValue('custrecord_wmsse_ship_masttrackno',vTrackingNo);
					ShipManifestRecord.setFieldValue('custrecord_wmsse_ship_void',"U");
					var id=nlapiSubmitRecord(ShipManifestRecord, false, true);
					nlapiLogExecution('ERROR', 'id', id);
				}

			}	
		}
	}

	catch (e) {	
		if (e instanceof nlobjError)
			nlapiLogExecution('ERROR', 'system error', e.getCode() + '\n'
					+ e.getDetails());
		else
			nlapiLogExecution('ERROR', 'unexpected error', e.toString());
		nlapiLogExecution('ERROR', 'unexpected error', 'I am unsuccess3');
	}

	nlapiLogExecution('ERROR', 'Out of CreateShippingManifestRecord','');		
}


/**
 * This function is used to display Input form 
 * @param 
 * @returns {}
 */
function fncreateform(form)
{
	var soField = form.addField('custpage_qbso', 'text', 'Transaction #');
	var whLocation = form.addField('custpage_qbwhlocation', 'select', 'Location').setMandatory(true);
	
	whLocation.addSelectOption("","");

	var vRolebasedLocation = getRoledBasedLocation();

	

	var roleBasedLocationArray=getLocationName(vRolebasedLocation);

	if(roleBasedLocationArray != null && roleBasedLocationArray != '' && roleBasedLocationArray != 'null')
	{
		for (var j = 0; roleBasedLocationArray != null && j < roleBasedLocationArray.length; j++) {
			if(roleBasedLocationArray[j][0] != null && roleBasedLocationArray[j][0] != "" && roleBasedLocationArray[j][0] != " ")
			{
				var tslocation = form.getField('custpage_qbwhlocation').getSelectOptions(roleBasedLocationArray[j][0], 'is');
				if (tslocation != null) {
					if (tslocation.length > 0) {
						continue;
					}
				}
				whLocation.addSelectOption(roleBasedLocationArray[j][0], roleBasedLocationArray[j][1]);
			}
		}
	}
	
	if(request.getParameter('custpage_qbwhlocation')!='' && request.getParameter('custpage_qbwhlocation')!=null)
	{
		whLocation.setDefaultValue(request.getParameter('custpage_qbwhlocation'));	
	}
	//Setting location value as default if the subsidiary have only one location.
	if(vRolebasedLocation.length==1)
	{
		whLocation.setDefaultValue(vRolebasedLocation[0]);	
	}
	var cartonField= form.addField('custpage_qbcarton', 'text', 'Carton #');
	var vSo = request.getParameter('custpage_qbso');
	var vCarton = request.getParameter('custpage_qbcarton');
	cartonField.setDefaultValue(vCarton);
	soField.setDefaultValue(vSo);
	soField.setLayoutType('normal', 'startcol');
	cartonField.setLayoutType('normal', 'startcol');
	form.addField('custpage_updatesametrack','text','SameTrack').setDisplayType('hidden').setDefaultValue('T');
	var sublist = form.addSubList("custpage_items", "list", "ItemList");
	sublist.addMarkAllButtons();
	sublist.addField("custpage_select", "checkbox", "Select").setDefaultValue('T');
	sublist.addField("custpage_sono", "text", "Transaction #").setDisplayType('inline');
	sublist.addField("custpage_whloc", "text", "Location"); 
	sublist.addField("custpage_sonointernalid", "text", "SO Internalid").setDisplayType('hidden');
	sublist.addField("custpage_container", "text", "Carton #").setDisplayType('inline');
	sublist.addField("custpage_weight", "text", "Weight").setDisplayType('inline');
	sublist.addField("custpage_packweight", "text", "Package Weight").setDisplayType('inline');
	sublist.addField("custpage_shippingmethod", "text", "Shipping Method").setDisplayType('inline');
	var trackinno=	sublist.addField("custpage_trackingno", "text", "Tracking Number").setDisplayType('entry');
	//trackinno.setMandatory(true);

}

/**
 * This function is used to fetch records from open task
 * @param ordernumber and containerlp
 * @returns {string}
 */
function fngetOpenTaskquickShipmentDetails(vWMSSeOrdNo, vContLpNo) {
	nlapiLogExecution('ERROR', 'General Functions', 'In to getOpenTaskDetails');
	var filter = new Array();
	var opentaskordersearchresult = new Array();
	filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', vWMSSeOrdNo));	
	if (vContLpNo != null && vContLpNo != '')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'is', vContLpNo));

	var columns = new Array();
	
	opentaskordersearchresult = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_quickship_details', filter, null);
	//Nullify the objects.	 
	filter=null;
	columns=null;
	return opentaskordersearchresult;
}


/**
 * This function is used to check containerlp exist in shipmanifest record type
 * @param containerlp
 * @returns {string}
 */
function fnIsContainerLpExist(vContLpNo,vOrderno)
{
	nlapiLogExecution('ERROR', 'Into IsContLpExist',vContLpNo);	
	nlapiLogExecution('ERROR', 'Into IsContLpExist-vOrderno',vOrderno);	
	var IsContLpExist='F';

	try
	{
		var filter = new Array();
		if(vContLpNo != null && vContLpNo != '' && vContLpNo != 'null' && vContLpNo != undefined)
		filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_contlp',null,'is',vContLpNo));
	//	filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_order',null,'anyof',vOrderno));
		var columns = new Array();
		//columns[0] = new nlobjSearchColumn('custrecord_wmsse_ship_order');
		var manifestList= nlapiSearchRecord('customrecord_wmsse_ship_manifest','customsearch_wmsse_shipmanifest_details',filter,null);
		if(manifestList!=null && manifestList.length>0)
			IsContLpExist='T';		
	}
	catch(e)
	{
		nlapiLogExecution('ERROR', 'unexpected error in IsContLpExist');	
	}
	nlapiLogExecution('ERROR', 'Out of IsContLpExist',IsContLpExist);	
	//Nullify the objects.	 
	filter=null;
	columns=null;
	return IsContLpExist;
}

function fnGetQuickShipFlagbyShipmethod(shipmethod)
{
	nlapiLogExecution('ERROR', 'Into fnGetQuickShipFlagbyShipmethod (Input)', shipmethod);

	var quickship='F';
	var filter=new Array();
	//Case# 201415472  start
	if(shipmethod!="" && shipmethod!=null)
		filter.push(new nlobjSearchFilter('custrecord_wmsse_carrier_nsmethod',null,'anyof',shipmethod));
	//Case# 201415472  end
	var columns=new Array();
	//columns.push(new nlobjSearchColumn('custrecord_wmsse_carrier_allow_quickship'));
	var carrierrec=nlapiSearchRecord('customrecord_wmsse_carrier','customsearch_wmsse_getquickshipflag',filter,null);
	if(carrierrec!=null && carrierrec!='' && carrierrec.length>0)
	{
		nlapiLogExecution('ERROR', 'carrierrec', carrierrec.length);
		quickship=carrierrec[0].getValue('custrecord_wmsse_carrier_allow_quickship');
	}

	nlapiLogExecution('ERROR', 'Out of fnGetQuickShipFlagbyShipmethod (Output)', quickship);
	//Nullify the objects.	 
	filter=null;
	columns=null;
	return quickship;
}
function fnGetSOInternalIdBasedonOpenTask(SOText,ordertype,blnMultiShipEnabled,vContlp,vLocation)
{


	var vSoInternalid="";
	if(SOText!=null && SOText!="")
	{
		vSoInternalid=fnQuickSOInternalId(SOText,ordertype)
	}
	var columBulkPickTask = new Array();
	

	var filterBulkPickTask = new Array();
	if(vSoInternalid!=null && vSoInternalid!="")
	{
		filterBulkPickTask.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',vSoInternalid));
	}
	nlapiLogExecution('ERROR','Into fnGetSO-OpenRecords',SOText+","+vContlp+","+vSoInternalid);
	filterBulkPickTask.push(new nlobjSearchFilter('mainline','custrecord_wmsse_order_no','is','T'));
	filterBulkPickTask.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
	filterBulkPickTask.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no',null,'is',vContlp));
	filterBulkPickTask.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [28]));
	filterBulkPickTask.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [3]));
	//filterBulkPickTask.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [3]));
	if(vLocation!='' && vLocation!=null && vLocation!='null')
	{
		filterBulkPickTask.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', vLocation));
	}
	
	var getOpenTaskBulkRecords= nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_getinternaliddetails', filterBulkPickTask,columBulkPickTask);
	nlapiLogExecution('ERROR','getOpenTaskBulkRecords',getOpenTaskBulkRecords);
	return  getOpenTaskBulkRecords;

}
function fnQuickSOInternalId(SOText,ordertype)
{
	var filter=new Array();
	var columns=new Array();
	columns.push(new nlobjSearchColumn('Internalid'));
	filter.push(new nlobjSearchFilter('tranid',null,'is',SOText.toString()));
	filter.push(new nlobjSearchFilter('mainline',null,'is','T'));
	filter.push(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
	var objSoDetailsArray = new Array();
	var searchrec=nlapiSearchRecord(ordertype,'customsearch_wmsse_quickship_iddetails',filter,columns);
	var vSoId=searchrec[0].getId();
	return vSoId;
}
function fnGetSOInternalId(SOText,ordertype,blnMultiShipEnabled)
{
	nlapiLogExecution('ERROR','Into fnGetSOInternalId (Input)',SOText);
	nlapiLogExecution('ERROR','Into fnGetSOInternalId (ordertype)',ordertype);
	nlapiLogExecution('ERROR','Into fnGetSOInternalId (blnMultiShipEnabled)',blnMultiShipEnabled);
	var ActualSoID='-1';
	var shipmethod="";

	var filter=new Array();
	filter.push(new nlobjSearchFilter('tranid',null,'is',SOText.toString()));
	filter.push(new nlobjSearchFilter('mainline',null,'is','F'));
	filter.push(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
	var columns=new Array();
	columns.push(new nlobjSearchColumn('shipmethod'));
	if(blnMultiShipEnabled)
		columns.push(new nlobjSearchColumn('ismultishipto'));
	var objSoDetailsArray = new Array();
	var searchrec=nlapiSearchRecord(ordertype,'customsearch_wmsse_quickship_iddetails',filter,columns);

	/*if(searchrec!=null && searchrec!='' && searchrec.length>0)
	{
		ActualSoID=searchrec[0].getId();
		shipmethod=searchrec[0].getValue('shipmethod');
		var newrow = [ActualSoID,shipmethod]; 
		objSoDetailsArray.push(newrow);
	}*/

	nlapiLogExecution('ERROR','Out of fnGetSOInternalId (Output)',searchrec);

	//Nullify the objects.	 
	filter=null;
	columns=null;

	//return objSoDetailsArray;
	return searchrec;
}


function backtogeneratesearch()
{ 	 
	var PackingURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_quickship', 'customdeploy_wmsse_quickship');

	window.location.href = PackingURL;
}


