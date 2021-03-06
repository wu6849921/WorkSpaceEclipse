/**
 * Script Description
 * This script print the pick report with suggested bin locations for selected order.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

/**
 * This is the main function to print the PICK LIST against the given Order Number  
 */
function fnPickReportPDF(request, response){
	if (request.getMethod() == 'GET') {

		var form = nlapiCreateForm('Pick Report');
		var context = nlapiGetContext(); 
		var vSoNum=request.getParameter('custparam_order_no');
		var vSoNumLst=request.getParameter('custparam_order_no');
		var VtranType=request.getParameter('custparam_trantype');
		var VorderType=request.getParameter('custparam_ordertype');
		var Vcustomer=request.getParameter('custparam_customer');
		var VshipDate=request.getParameter('custparam_shipdate');
		var vTaskAssignTo=request.getParameter('custparam_taskassignedto');
		var vnoofLines = request.getParameter('custpage_nooflines');
		var vQty = request.getParameter('custpage_qty');
		var vshipcomplete = request.getParameter('custpage_shipcomplete');
		var whLocation = request.getParameter('custparam_whlocation');
		var vrePrint = request.getParameter('custparam_reprint');
		var vtranidlst = request.getParameter('custparam_tranid_lst');
		var vrePrint = request.getParameter('custparam_reprint');
		var vtranidlst = request.getParameter('custparam_tranid_lst');
		var vrePrint = request.getParameter('custparam_reprint');
		var vtranidlst = request.getParameter('custparam_tranid_lst');
		var vClass = request.getParameter('custparam_qbclass');
		var vDepartment = request.getParameter('custparam_qbdepartment');
		nlapiLogExecution('ERROR', 'vrePrint',vrePrint);
		nlapiLogExecution('ERROR', 'vSoNum',vSoNum);

		// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
		var isCrossSub = isIntercompanyCrossSubsidiaryFeatureEnabled();
		
		var soNumArray=new Array();
		if(vSoNum!=null && vSoNum!='' && vSoNum!='null')
		{

			var vsoId=vSoNum.split(',');


			for(var c=0;c<vsoId.length;c++)
			{
				if(vsoId[c] != '' && vsoId[c] != 'null' && vsoId[c] != null && vsoId[c] != 'undefined')
				{
					soNumArray.push(vsoId[c]);
				}
				//nlapiLogExecution('ERROR', 'vsoId[c]',vsoId[c]);

			}

		}
		var sysdate=DateStamp();
		var systime=TimeStamp();

		var loadConfig = nlapiLoadConfiguration('userpreferences');
		var getTimeZone = loadConfig.getFieldValue('TIMEZONE');
		var dateRec = nlapiCreateRecord('customrecord_wmsse_datetimestamp');
		var Timez =  dateRec.getDateTimeValue('custrecord_wmsse_datestamp',getTimeZone);
		nlapiLogExecution('ERROR','Remaining usage at the start',context.getRemainingUsage());
		var dateTimeArr = Timez.split(' ');
		var dtsettingFlag = DateSetting();
		nlapiLogExecution('Debug', 'dtsettingFlag', dtsettingFlag);
		var schtype="SingleOrder";
		if(dtsettingFlag == 'DD MONTH, YYYY')
		{
			var dateStamp = dateTimeArr[0]+ ' ' +dateTimeArr[1] + ' ' + dateTimeArr[2];
			var timeStamp = dateTimeArr[3]+dateTimeArr[4];
		}
		else
		{
			var dateStamp = dateTimeArr[0];
			var timeStamp = dateTimeArr[1]+dateTimeArr[2];
		}

		var replaceChar =/\$|,|@|#|~|`|\%|\*|\^|\+|\=|\-|\_|\[|\}|\{|\;|\:|\<|\>|\?|\||\\|\!|\$|\./g;
			nlapiLogExecution('ERROR', 'soNumArray',soNumArray);
		var pageno=0;
		var isScheduleScriptinvoked = 'F';
		if(vrePrint == "F")
		{

			var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdf>\n<head><macrolist><macro id='myfooter'><p align='center'>Page <pagenumber/> of <totalpages/></p></macro></macrolist></head><body  font-size=\"7\"  size=\"A4-landscape\"    padding-top=\" 0mm\"   footer='myfooter' footer-height='20mm'>\n";
			for(var w=0;w<soNumArray.length && isScheduleScriptinvoked == 'F' ;w++)
			{

				var vnAlrPickGenOrderArray= new Array();
				var vSoNum=soNumArray[w];	

				if(context.getRemainingUsage()<= 200 && isScheduleScriptinvoked == 'F')
				{
					try{


						var param = new Array();
						param['custscript_wmsse_sng_orderno_lst'] = vSoNumLst;				
						param['custscript_wmsse_sng_trantype'] = VtranType;
						param['custscript_wmsse_sng_customer'] = Vcustomer;
						param['custscript_wmsse_sng_shipdate'] = VshipDate;
						param['custscript_wmsse_sng_qbqty'] = vQty;
						param['custscript_wmsse_sng_nooflines'] = vnoofLines;
						param['custscript_wmsse_sng_shipcomplete'] = vshipcomplete;
						param['custscript_wmsse_sng_qbemployee'] = vTaskAssignTo;
						param['custscript_wmsse_sng_ordertype'] = VorderType;
						param['custscript_wmsse_sng_department']=vDepartment;
						param['custscript_wmsse_sng_class']=vClass;
						param['custscript_wmsse_sng_reprint']=vrePrint;
						param['custscript_wmsse_sng_whlocation']=whLocation;
						param['custscript_wmsse_sng_tranid_lst']=vtranidlst;
						//nlapiLogExecution('DEBUG', 'Scheduled Script Status');

						var schstatus = nlapiScheduleScript('customscript_wmsse_singord_pickrpt_sch',null,param);
						isScheduleScriptinvoked = 'T';
						nlapiLogExecution('DEBUG', 'Scheduled Script Status',schstatus);
						var currentUserID = getCurrentUser();
						updateScheduleScriptStatus('Single order pick report SCH',currentUserID,'Submitted',vtranidlst,VtranType);
						break;
					}
					catch(e){
						nlapiLogExecution('DEBUG', 'exception',e);
					}
				}
        
				var	searchresults = getSOLineDetailsForMultiOrd(null,vSoNum,VtranType,Vcustomer,VshipDate,null,vQty,vnoofLines,vshipcomplete,whLocation,VorderType);
				if(searchresults!=null&&searchresults!=''&&searchresults.length>0)
				{
					nlapiLogExecution('ERROR', 'searchresults.length',searchresults.length);
					var totalwt=0;

					var SoIds=new Array();
					var soname = new Array();
					var vColumnslist=searchresults[0].getAllColumns();



					var fulfilledQtyIndex = 6;
					var commitedQtyIndex = 25;
					var totalPickedQtyIndex =7;
					var totalNSPickedQtyIndex =37;
					var ERPConfirmedQty =38;
					for(var x1=0;x1<vColumnslist.length;x1++)
					{
						var summaryLabel = vColumnslist[x1].getLabel();

						var name = vColumnslist[x1].getName();
						if (summaryLabel == 'Fulfilled Quantity' && name == 'quantitycommitted')
						{
							fulfilledQtyIndex = x1;
						}

						else if (summaryLabel == 'Total Picked Quantity')
						{
							totalPickedQtyIndex = x1;
						}
						else if (summaryLabel == 'Committed Quantity')
						{
							commitedQtyIndex = x1;
						}
						else if (summaryLabel == 'ERPpickedQuantity')
						{
							totalNSPickedQtyIndex = x1;
						}
						else if (summaryLabel == 'ERP CONFIRMED QTY')
						{
							ERPConfirmedQty = x1;
						}
						else
						{

						}
					}



					var distinctSoIds =  new Array();
					var distname = new Array();
					for ( var intg = 0; intg < searchresults.length; intg++)
					{
						if(distinctSoIds.indexOf(searchresults[intg].getValue('internalid',null,'group')) == -1)
						{
							//var vsoitemQty=searchresults[intg].getValue('quantitycommitted',null,'max');
							var vsoitemQty=searchresults[intg].getValue(vColumnslist[commitedQtyIndex]);
							var vsoitemfulfillQty=searchresults[intg].getValue(vColumnslist[fulfilledQtyIndex]);
							var vsoitemopentaskQty=searchresults[intg].getValue(vColumnslist[totalPickedQtyIndex]);
							var vsoitemErpConfirmedQty=searchresults[intg].getValue(vColumnslist[ERPConfirmedQty]);
							var vsoitemNSReceivedQty=searchresults[intg].getValue(vColumnslist[totalNSPickedQtyIndex]);
							if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
							{
								vsoitemopentaskQty = 0;
							}
							if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' || vsoitemErpConfirmedQty=='undefined' )
							{
								vsoitemErpConfirmedQty = 0;
							}
							if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
							{
								vsoitemNSReceivedQty = 0;
							}

															
							vsoitemopentaskQty=new Big(vsoitemopentaskQty);
							vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
							vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
							var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty.minus(vsoitemErpConfirmedQty))));
							nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);
							if(vsoitemRcvQty==null || vsoitemRcvQty=='')
								vsoitemRcvQty=0;

							if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
								vsoitemfulfillQty=0;
							if(vsoitemQty==null || vsoitemQty=='')
								vsoitemQty=0;
														
							vsoitemQty=new Big(vsoitemQty);
							vsoitemfulfillQty=new Big(vsoitemfulfillQty);
							
							var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
							nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);
							
							if(parseFloat(vSoreminqty) > 0)
							{

								if(distinctSoIds.indexOf(searchresults[intg].getValue('internalid',null,'group')) == -1)
								{
									distinctSoIds.push(searchresults[intg].getValue('internalid',null,'group'));
									distname.push(searchresults[intg].getValue('tranid',null,'group'))

								}
							}
						}
					}



					nlapiLogExecution('ERROR', 'distinctSoIds',distinctSoIds);


					var vline, vitem, vqty,vSKU,vdono;

					var itemdesc="";


					var datetime= new Date();
					datetime=datetime.toLocaleTimeString() ;
					var finalimageurl = '';
					var currentUserID = getCurrentUser();
					var vPickGen = currentUserID+"_"+ distinctSoIds[0] +"_"+getTimeStamp();
					var vBinLocSeqArr=new Array();
					var vPickLocDetsArr=new Array();
					var url;
					var departments = '';
					var classes = '';
					for ( var count = 0; count < distinctSoIds.length && isScheduleScriptinvoked=='F'; count++)
					{ 

						var trantype = VtranType;

						if(context.getRemainingUsage()<= 200 )
						{
							try{


								var param = new Array();	
								param['custscript_wmsse_sng_orderno_lst'] = vSoNumLst;				
								param['custscript_wmsse_sng_trantype'] = VtranType;
								param['custscript_wmsse_sng_customer'] = Vcustomer;
								param['custscript_wmsse_sng_shipdate'] = VshipDate;
								param['custscript_wmsse_sng_qbqty'] = vQty;
								param['custscript_wmsse_sng_nooflines'] = vnoofLines;
								param['custscript_wmsse_sng_shipcomplete'] = vshipcomplete;
								param['custscript_wmsse_sng_qbemployee'] = vTaskAssignTo;
								param['custscript_wmsse_sng_ordertype'] = VorderType;
								param['custscript_wmsse_sng_department']=vDepartment;
								param['custscript_wmsse_sng_class']=vClass;
								param['custscript_wmsse_sng_reprint']=vrePrint;
								param['custscript_wmsse_sng_whlocation']=whLocation;
								param['custscript_wmsse_sng_tranid_lst']=vtranidlst;


								var schstatus = nlapiScheduleScript('customscript_wmsse_singord_pickrpt_sch',null,param);
								isScheduleScriptinvoked = 'T';
								nlapiLogExecution('DEBUG', 'Scheduled Script Status',schstatus);
								var currentUserID = getCurrentUser();
								updateScheduleScriptStatus('Single order pick report SCH',currentUserID,'Submitted',vtranidlst,VtranType);
								break;
							}
							catch(e){
								nlapiLogExecution('DEBUG', 'exception',e);
							}
						}
						
						
						var currentUser=getCurrentUser();
						var lockfilters=new Array();
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',distinctSoIds[count]));				
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
						var lockcolumns= new Array();
						
						var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

						if(lockresults!=null && lockresults!='')
						{
							
							
							if(vnAlrPickGenOrderArray.indexOf(distname[count]) == -1)
								vnAlrPickGenOrderArray.push(distname[count]);
							
							
							break;
						}
						else
						{
							try
							{
							var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
							LockRecord.setFieldValue('name',distinctSoIds[count]);
							LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
							LockRecord.setFieldValue('custrecord_wmsse_order',distinctSoIds[count]);
							LockRecord.setFieldValue('externalid',distinctSoIds[count]);
							LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
							LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

							var date = new Date();
							var mSecs = date.getTime();
							LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

							var recid = nlapiSubmitRecord(LockRecord);
							nlapiLogExecution('ERROR', 'Record Locked Successfully', recid);
							LockRecord=null;
							}
							catch(ex)
							{
								nlapiLogExecution('Debug', 'Exception: ', ex);
								break;
							}
						}
						lockresults=null;
						lockcolumns=null;
						lockfilters=null;
						var salesorder = nlapiLoadRecord(trantype, distinctSoIds[count]); 
						if(searchresults!=null && searchresults!='')
						{
							var vlineno=searchresults[0].getValue('line',null,'group');

						} 
						var SalesorderNo= salesorder.getFieldValue('tranid');
						var newvdono = distname[count];


						var tempLineNo;var pagetotalno=0;
						if (searchresults != null) {

							departments = nlapiGetContext().getFeature('departments');
							classes = nlapiGetContext().getFeature('classes');

							var vColumnslist=searchresults[0].getAllColumns();

							var custIndex = 12;
							var commitedQtyIndex = 25;
							var fulfilledQtyIndex = 26;
							var conversionRateIndex=27;							
							var quantityuomIndex =23;
							var totalPickedQtyIndex =7;
							var totalNSPickedQtyIndex =37;
							var ERPConfirmedQty =38;
							for(var x1=0;x1<vColumnslist.length;x1++)
							{
								var summaryLabel = vColumnslist[x1].getLabel();
								var name  = vColumnslist[x1].getName();

								if(summaryLabel == 'Customer Id')
								{
									custIndex = x1;
								}
								else if (summaryLabel == 'Committed Quantity')
								{
									commitedQtyIndex = x1;
								}
								else if (summaryLabel == 'Fulfilled Quantity' && name == 'formulanumeric')
								{
									fulfilledQtyIndex = x1;
								}
								else if (summaryLabel == 'Conversion Rate')
								{
									conversionRateIndex = x1;
								}
								else if (summaryLabel == 'Total Picked Quantity')
								{
									totalPickedQtyIndex = x1;
								}
								else if(name == 'quantityuom')
								{
									quantityuomIndex = x1;
								}
								else if (summaryLabel == 'ERPpickedQuantity')
								{
									totalNSPickedQtyIndex = x1;
								}
								else if (summaryLabel == 'ERP CONFIRMED QTY')
								{
									ERPConfirmedQty = x1;
								}
								else
								{

								}

							}

							for (var i = 0; i < searchresults.length && isScheduleScriptinvoked == 'F'; i++) {

								nlapiLogExecution('EMERGENCY','Remaining usage before getpickbindetails',context.getRemainingUsage()+","+isScheduleScriptinvoked);
								if(context.getRemainingUsage()<= 200 )
								{
									try{




										var param = new Array();	
										param['custscript_wmsse_sng_orderno_lst'] = vSoNumLst;				
										param['custscript_wmsse_sng_trantype'] = VtranType;
										param['custscript_wmsse_sng_customer'] = Vcustomer;
										param['custscript_wmsse_sng_shipdate'] = VshipDate;
										param['custscript_wmsse_sng_qbqty'] = vQty;
										param['custscript_wmsse_sng_nooflines'] = vnoofLines;
										param['custscript_wmsse_sng_shipcomplete'] = vshipcomplete;
										param['custscript_wmsse_sng_qbemployee'] = vTaskAssignTo;
										param['custscript_wmsse_sng_ordertype'] = VorderType;
										param['custscript_wmsse_sng_department']=vDepartment;
										param['custscript_wmsse_sng_class']=vClass;
										param['custscript_wmsse_sng_reprint']=vrePrint;
										param['custscript_wmsse_sng_whlocation']=whLocation;
										param['custscript_wmsse_sng_tranid_lst']=vtranidlst;

										var schstatus = nlapiScheduleScript('customscript_wmsse_singord_pickrpt_sch',null,param);
										isScheduleScriptinvoked = 'T';
										nlapiLogExecution('DEBUG', 'Scheduled Script Status',schstatus);
										var currentUserID = getCurrentUser();
										updateScheduleScriptStatus('Single order pick report SCH',currentUserID,'Submitted',vtranidlst,VtranType);
										break;
									}
									catch(e){
										nlapiLogExecution('DEBUG', 'exception',e);
									}

								}
								var searchresult = searchresults[i];
								//var vsoitemQty=searchresult.getValue('quantitycommitted',null,'max');
								var vsoitemQty=searchresult.getValue(vColumnslist[commitedQtyIndex]);
								var vsoitemfulfillQty=searchresult.getValue(vColumnslist[fulfilledQtyIndex]);
								var vsoitemopentaskQty=searchresult.getValue(vColumnslist[totalPickedQtyIndex]);
								var vsoitemErpConfirmedQty=searchresult.getValue(vColumnslist[ERPConfirmedQty]);
								var vsoitemNSReceivedQty=searchresult.getValue(vColumnslist[totalNSPickedQtyIndex]);
								if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
								{
									vsoitemopentaskQty = 0;
								}
								if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' || vsoitemErpConfirmedQty=='undefined' )
								{
									vsoitemErpConfirmedQty = 0;
								}
								if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
								{
									vsoitemNSReceivedQty = 0;
								}

															
								vsoitemopentaskQty=new Big(vsoitemopentaskQty);
								vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
								vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
								var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty.minus(vsoitemErpConfirmedQty))));
								nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);

								
								if(vsoitemRcvQty==null || vsoitemRcvQty=='')
									vsoitemRcvQty=0;
								var vSKUId= searchresult.getValue('item',null,'group');
								vline = searchresult.getValue('line',null,'group');
								var itemType=searchresult.getValue('type','item','group');
								if(vsoitemRcvQty==null || vsoitemRcvQty=='')
									vsoitemRcvQty=0;
								if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
									vsoitemfulfillQty=0;
								if(vsoitemQty==null || vsoitemQty=='')
									vsoitemQty=0;
																	
								vsoitemQty=new Big(vsoitemQty);
								vsoitemfulfillQty=new Big(vsoitemfulfillQty);
								
								var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
								nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);
								if(parseFloat(vSoreminqty) > 0 && (itemType != 'noninventoryitem' && itemType != 'NonInvtPart' &&   itemType != 'otherchargeitem' && itemType != 'OthCharge' && itemType != 'Service' && itemType != 'serviceitem' && itemType != 'downloaditem'  && itemType != 'DwnLdItem' && itemType != 'giftcertificateitem' && itemType != 'GiftCert'))
								{

									var vSoInternalId = '', vCustIntId='';
									vline = searchresult.getValue('line',null,'group');
									vdono = searchresult.getValue('tranid',null,'group');
									nlapiLogExecution('ERROR', 'vdono : SalesorderNo : vSoreminqty', vdono +" : "+SalesorderNo+" : "+vSoreminqty);
									if(vdono.split('.')[0] == SalesorderNo)
									{
										vSoInternalId = searchresult.getValue('internalid',null,'group');
										vSKU = searchresult.getText('item',null,'group');
										var vSKUId= searchresult.getValue('item',null,'group');
										//vqty = searchresult.getValue('quantity',null,'max');
										//vCommQty = searchresult.getValue('quantitycommitted',null,'max');
										if(itemType == 'Kit')
										{
											var vAlreadyPickGenQty=  fnGetAlreadyPickGenQtyforkit(vSoInternalId,vline,vSKUId);
										}
										else
										{
											var vAlreadyPickGenQty=  fnGetAlreadyPickGenQty(vSoInternalId,vline);
										}




										nlapiLogExecution('ERROR', 'vAlreadyPickGenQty : vsoitemQty : vsoitemfulfillQty : vsoitemopentaskQty : vAlreadyPickGenQty : vsoitemErpConfirmedQty : vsoitemNSReceivedQty', vAlreadyPickGenQty +" : "+parseFloat(vsoitemQty)+" : "+parseFloat(vsoitemfulfillQty)+" : "+parseFloat(vsoitemopentaskQty)+" : "+parseFloat(vAlreadyPickGenQty)+" : "+parseFloat(vsoitemErpConfirmedQty)+" : "+parseFloat(vsoitemNSReceivedQty));


										if(parseFloat(vsoitemopentaskQty)>parseFloat(vAlreadyPickGenQty))
										{
											vAlreadyPickGenQty=parseFloat(vsoitemopentaskQty);
										}

																				
										vsoitemQty=new Big(vsoitemQty);
										vsoitemfulfillQty=new Big(vsoitemfulfillQty);
										vAlreadyPickGenQty=new Big(vAlreadyPickGenQty);
										vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
										vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
										
										var vQtyToPickGen = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus((vAlreadyPickGenQty).plus(vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty))); 
										nlapiLogExecution('ERROR', 'vQtyToPickGen', vQtyToPickGen);
										
										
										if(parseFloat(vQtyToPickGen)>0)
										{	
											vqty = searchresult.getValue(vColumnslist[quantityuomIndex]);
											vCommQty = searchresult.getValue(vColumnslist[commitedQtyIndex]);
											var whLocation = '';
											if(isCrossSub == true && trantype == 'salesorder')
											{
												whLocation=searchresult.getValue('inventorylocation',null,'group');
											}
											else
											{
												whLocation=searchresult.getValue('location',null,'group');
											}

											var strItemFam=searchresult.getValue('custitem_wmsse_itemfamily','item','group');
											var strItemGrp=searchresult.getValue('custitem_wmsse_itemgroup','item','group');
											var strIsItemLot=searchresult.getValue('islotitem','item','group');
											vCustIntId=salesorder.getFieldValue('entity');//searchresult.getValue('internalid','customer','group');
											var vCustomer=salesorder.getFieldText('entity');//searchresult.getValue('entityid','customer','group');
											if(departments == true)
												var vdepartment=searchresult.getValue('department',null,'group');
											if(classes == true)
												var vclass=searchresult.getValue('class',null,'group');
											if(departments == true)
												var Idepartment=searchresult.getValue('department','item','group');
											if(classes == true)
												var Iclass=searchresult.getValue('class','item','group');
											var ordertype=searchresult.getValue('custbody_wmsse_ordertype',null,'group');
											if(Idepartment == null || Idepartment == '' || Idepartment == 'null' || Idepartment == 'undefined')
											{
												Idepartment = vdepartment;
											}
											if(Iclass == null || Iclass == '' || Iclass == 'null' || Iclass == 'undefined')
											{
												Iclass = vclass;
											}
											nlapiLogExecution('ERROR', 'vCustomer', vCustomer);
											if(vCustomer == null || vCustomer =='' || vCustomer == 'null' || vCustomer == 'undefined')
												vCustomer=searchresult.getValue('altname','customer','group');
											var vShipMethod=searchresult.getValue('shipmethod',null,'group');


											nlapiLogExecution('ERROR', 'itemType', itemType);

											nlapiLogExecution('ERROR', 'vShipMethod : vSKU : vdono : vline : strIsItemLot', vShipMethod +" : "+vSKU+" : "+vdono+" : "+vline+" : "+strIsItemLot);

											var VUnitType = searchresult.getValue('unitstype','item','group');
											var vUnits = searchresult.getText('stockunit','item','group');
											var vUnitsText = searchresult.getText('unit',null,'group');
											var vUnitsVal = searchresult.getValue('unit',null,'group');							 
											var vConversionRate = searchresult.getValue(vColumnslist[conversionRateIndex]);
											nlapiLogExecution('ERROR', 'VUnitType,vUnits,vConversionRate', VUnitType+","+vUnits+","+vConversionRate);
											var getStockConversionRate =1;
											if(vUnits !=null && vUnits!='' && vUnits !='null' && vUnits !='undefined' && vUnits !='- None -')
											{
												getStockConversionRate =getStockCoversionRate(VUnitType,vUnits,vConversionRate);
											}
											nlapiLogExecution('ERROR', 'getStockConversionRate', getStockConversionRate); 
											if(vUnitsText == null || vUnitsText =='' || vUnitsText =='- None -')
												vUnitsText='';
											var vBinDetails='';
											var componentItemDetails='';
											var getPrefBin ='';
											if(itemType=="Kit")
											{

												componentItemDetails=fnGetComponentItemDetails(vSKUId,vQtyToPickGen,whLocation);
											}
											else
											{
												var vItemTypeResult = nswms_GetItemTypedetails(vSKUId,whLocation);
												var vItemType='';
												var vClassification='';
												
												if(vItemTypeResult!=''||vItemTypeResult!=null){
													
														vItemType      = vItemTypeResult[0].recordType;
														vClassification = vItemTypeResult[0].getValue('locationinvtclassification');
												}
												
												nlapiLogExecution('EMERGENCY','Remaining usage before getpickbindetails',context.getRemainingUsage());
												getPrefBin = getPrefBinLocation(vSKUId,whLocation);
												//var vItemType = nswms_GetItemType(vSKUId,whLocation);      // Commented as part of ABC Velocity logic for pick strategy
												try{
													if(strIsItemLot =='T')
													{
														var AllowAllLots = 'T';
														if(trantype == 'salesorder')
														{
//															vBinDetails=fnGetPickReportBinDetailsLot(vSKUId,strItemGrp,strItemFam,getPrefBin,whLocation,Idepartment,Iclass,ordertype,vUnitsVal,'',request,schtype,vItemType);
															vBinDetails=fnGetPickReportBinDetailsLot(vSKUId,strItemGrp,strItemFam,getPrefBin,whLocation,Idepartment,Iclass,ordertype,vUnitsVal,'',request,schtype,vItemType,null,null,vClassification);
														}
														else 
															if(trantype == 'transferorder')
															{
//																vBinDetails=fnGetPickReportBinDetailsLot(vSKUId,strItemGrp,strItemFam,getPrefBin,whLocation,Idepartment,Iclass,ordertype,vUnitsVal,'',request,schtype,vItemType,AllowAllLots);
																vBinDetails=fnGetPickReportBinDetailsLot(vSKUId,strItemGrp,strItemFam,getPrefBin,whLocation,Idepartment,Iclass,ordertype,vUnitsVal,'',request,schtype,vItemType,AllowAllLots,null,vClassification);
															}
													}
													else
														vBinDetails=fnGetPickReportBinDetails(vSKUId,strItemGrp,strItemFam,getPrefBin,whLocation,Idepartment,Iclass,ordertype,vUnitsVal,'',request,schtype,vItemType,null,vClassification);

													if(vBinDetails == 'scheduleScriptinvoked')
													{
														isScheduleScriptinvoked = 'T';
														break;
													}
												}
												catch(e)
												{
													nlapiLogExecution('EMERGENCY','Error',e);
												}
												nlapiLogExecution('EMERGENCY','Remaining usage after getpickbindetails',context.getRemainingUsage());
											}
											nlapiLogExecution('ERROR', 'componentItemDetails', componentItemDetails);
											for(var actSOcount=1;actSOcount<=salesorder.getLineItemCount('item');actSOcount++)
											{
												var actLineno=salesorder.getLineItemValue('item','line',actSOcount);
												var tLineNO =vline;
												if(trantype == 'transferorder')
												{
													tLineNO = parseInt(tLineNO)-1;
												}
												if(tLineNO==actLineno)
												{
													itemdesc=salesorder.getLineItemValue('item','description',actSOcount);
													if(itemdesc == null || itemdesc == '' || itemdesc == 'null')
														itemdesc = nlapiLookupField('item', vSKUId,'salesdescription');
													break;
												}
											}



											if(tempLineNo==null)
											{
												tempLineNo=vline;
											}


											var vTotalLot = "";
											var vTotalExpDate = "";
											var vToatlBins = "";
											var vBinInternalId = "";
											var vexpiryDate = "";
											var strBinDets="";
											if(vBinDetails !=null && vBinDetails!='' && vBinDetails.length > 0)
											{
												nlapiLogExecution('ERROR', 'vBinDetails.length', vBinDetails.length);
												vBinLocSeqArr.push(vBinDetails[0][0]);
												vBinInternalId = vBinDetails[0][2];
												vexpiryDate = vBinDetails[0][4];
												for(var b=0;b<vBinDetails.length;b++)
												{
													var currValues = vBinDetails[b]; 

													var zone=currValues[3];

													if(strIsItemLot =='T')
													{
														zone = currValues[5];
													}

													//var bin = zone+","+currValues[0];
													var bin = currValues[0];
													var qty = currValues[1];

													if(getPrefBin !=null && getPrefBin !='' && getPrefBin == bin)
														bin = bin +" *";

													//strBinDets += 	bin+"("+qty+")";
													strBinDets += 	bin+"("+Number(Big(qty).mul(getStockConversionRate))+ " " +vUnitsText+")";
													if(strIsItemLot =='T')
													{
														var vLotNo = currValues[3];
														//vLotNo =vLotNo .replace(/&/g,"&amp;");
														var vExpDate = currValues[4];
														if(vLotNo != null && vLotNo != '')
														{
															strBinDets += " " + vLotNo;
														}
														if(vExpDate != null && vExpDate != '')
														{
															strBinDets += " (" + vExpDate + ")";
														}

														if(vTotalLot == null || vTotalLot =="")
														{
															vTotalLot = vLotNo;
														}
														else
														{
															vTotalLot = vTotalLot +","+ vLotNo;
														}

														if(vTotalExpDate == null || vTotalExpDate =="")
														{
															vTotalExpDate = vExpDate;
														}
														else
														{
															vTotalExpDate = vTotalExpDate +","+ vExpDate;
														}


													}	
													if(vToatlBins == null || vToatlBins =="")
													{
														vToatlBins = currValues[0];
													}
													else
													{
														vToatlBins = vToatlBins +","+ currValues[0];
													}
													strBinDets += '$';

													/*if(b>4)
														break;*/

												}

												try
												{

													var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
													nlapiLogExecution('ERROR', 'Creating Record', 'TRN_OPENTASK');

													if(vdono!=null && vdono!='')
														customrecord.setFieldValue('name', vdono);
													customrecord.setFieldValue('custrecord_wmsse_act_begin_date', dateStamp);
													customrecord.setFieldValue('custrecord_wmsse_act_end_date', dateStamp);

													//customrecord.setFieldValue('custrecord_wmsse_act_qty', parseFloat(enterQty).toFixed(5));

													customrecord.setFieldValue('custrecord_wmsse_sku', vSKUId);
													customrecord.setFieldValue('custrecord_wmsse_skudesc', itemdesc);
													customrecord.setFieldValue('custrecord_wmsse_line_no', vline);

													//customrecord.setFieldValue('custrecord_wmsse_expe_qty', parseFloat(vCommQty).toFixed(5));
													customrecord.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(vQtyToPickGen).toFixed(5)));

													customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 9);//pick locations assigned completed

													customrecord.setFieldValue('custrecord_wmsse_tasktype', 3); //For Pick

													if(vUnitsText !=null && vUnitsText!='' && vUnitsText!='- None -')
														customrecord.setFieldValue('custrecord_wmsse_uom', vUnitsText);
													if(vConversionRate !=null && vConversionRate!='' && vConversionRate!='- None -')
														customrecord.setFieldValue('custrecord_wmsse_conversionrate', vConversionRate);

													if(vBinInternalId!=null && vBinInternalId!='' && vBinInternalId!='null' && vBinInternalId!='undefined')
													{
														customrecord.setFieldValue('custrecord_wmsse_actbeginloc', vBinInternalId);

													}

													if(vexpiryDate!=null && vexpiryDate!='' && vexpiryDate !='null' && vexpiryDate !='undefined')
														customrecord.setFieldValue('custrecord_wmsse_expirydate', vexpiryDate);


													customrecord.setFieldValue('custrecord_wmsse_order_no', vSoInternalId);
													customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
													if(vCustIntId!=null && vCustIntId!='' && vCustIntId!='null' && vCustIntId!='undefined')
														customrecord.setFieldValue('custrecord_wmsse_customer', vCustIntId);

													customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
													if(vSKUId!=null && vSKUId!='' && vSKUId!='null' && vSKUId!='undefined')
														customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', vSKUId);
													if(itemType == 'Kit')
													{								
														customrecord.setFieldValue('custrecord_wmsse_kitflag', 'T');

														if(vQtyToPickGen!=null && vQtyToPickGen!='' && vQtyToPickGen!='null' && vQtyToPickGen!='undefined')
															customrecord.setFieldValue('custrecord_wmsse_compitm_expqty', Number(Big(vQtyToPickGen).toFixed(5)));
													}



													if(strBinDets!=null && strBinDets!='' && strBinDets!='null' && strBinDets!='undefined')
														customrecord.setFieldValue('custrecord_wmsse_multi_bins', strBinDets);

													if(vUnitsText!=null && vUnitsText!='' && vUnitsText!='null' && vUnitsText!='undefined')
														customrecord.setFieldValue('custrecord_wmsse_uom', vUnitsText);


													if(vShipMethod!=null && vShipMethod!='' && vShipMethod!='null' && vShipMethod!='undefined')
														customrecord.setFieldValue('custrecord_wmsse_shipmethod', vShipMethod);

													if(vPickGen!=null && vPickGen!='' && vPickGen!='null' && vPickGen!='undefined')
														customrecord.setFieldValue('custrecord_wmsse_pickreport_no', vPickGen);

													if(vTaskAssignTo !=null && vTaskAssignTo!='' && vTaskAssignTo!='null' && vTaskAssignTo!='undefined')
														customrecord.setFieldValue('custrecord_wmsse_task_assignedto',vTaskAssignTo);

													var recid = nlapiSubmitRecord(customrecord);
													nlapiLogExecution('ERROR', 'Done creating opentask Record', recid);
													customrecord=null;
												}
												catch(e)
												{
													nlapiLogExecution('ERROR', 'inside catch exception', e);

													if ( e instanceof nlobjError )
													{

														nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
													}
													else
													{

														nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
													}
												}
											}
											else
											{
												if(itemType!="Kit")
												{
													try
													{

														var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
														nlapiLogExecution('ERROR', 'Creating Record', 'TRN_OPENTASK');

														if(vdono!=null && vdono!='')
															customrecord.setFieldValue('name', vdono);
														customrecord.setFieldValue('custrecord_wmsse_act_begin_date', dateStamp);
														customrecord.setFieldValue('custrecord_wmsse_act_end_date', dateStamp);

														//customrecord.setFieldValue('custrecord_wmsse_act_qty', parseFloat(enterQty).toFixed(5));

														customrecord.setFieldValue('custrecord_wmsse_sku', vSKUId);
														customrecord.setFieldValue('custrecord_wmsse_skudesc', itemdesc);
														customrecord.setFieldValue('custrecord_wmsse_line_no', vline);

														//customrecord.setFieldValue('custrecord_wmsse_expe_qty', parseFloat(vCommQty).toFixed(5));
														customrecord.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(vQtyToPickGen).toFixed(5)));

														customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 26);//Failed picks

														customrecord.setFieldValue('custrecord_wmsse_tasktype', 3); //For Pick
														customrecord.setFieldValue('custrecord_wmsse_multi_bins', 'Failed picks due to configuration/insufficient inventory');
														customrecord.setFieldValue('custrecord_wmsse_order_no', vSoInternalId);
														customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
														if(vCustIntId!=null && vCustIntId!='' && vCustIntId!='null' && vCustIntId!='undefined')
															customrecord.setFieldValue('custrecord_wmsse_customer', vCustIntId);

														customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
														if(vSKUId!=null && vSKUId!='' && vSKUId!='null' && vSKUId!='undefined')
															customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', vSKUId);
														if(itemType == 'Kit')
														{								
															customrecord.setFieldValue('custrecord_wmsse_kitflag', 'T');
															/*if(vCommQty!=null && vCommQty!='' && vCommQty!='null' && vCommQty!='undefined')
															customrecord.setFieldValue('custrecord_wmsse_compitm_expqty', vCommQty);*/
															if(vQtyToPickGen!=null && vQtyToPickGen!='' && vQtyToPickGen!='null' && vQtyToPickGen!='undefined')
																customrecord.setFieldValue('custrecord_wmsse_compitm_expqty', vQtyToPickGen);
														}


														if(vShipMethod!=null && vShipMethod!='' && vShipMethod!='null' && vShipMethod!='undefined')
															customrecord.setFieldValue('custrecord_wmsse_shipmethod', vShipMethod);

														if(vPickGen!=null && vPickGen!='' && vPickGen!='null' && vPickGen!='undefined')
															customrecord.setFieldValue('custrecord_wmsse_pickreport_no', vPickGen);

														if(vTaskAssignTo !=null && vTaskAssignTo!='' && vTaskAssignTo!='null' && vTaskAssignTo!='undefined')
															customrecord.setFieldValue('custrecord_wmsse_task_assignedto',vTaskAssignTo);

														var recid = nlapiSubmitRecord(customrecord);
														nlapiLogExecution('ERROR', 'Done creating failed picks opentask Record', recid);
														customrecord=null;
													}
													catch(e)
													{
														nlapiLogExecution('ERROR', 'inside catch exception', e);

														if ( e instanceof nlobjError )
														{

															nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
														}
														else
														{

															nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
														}
													}

												}
											}
											nlapiLogExecution('ERROR', 'distinctSoIds[count]', distinctSoIds[count]);

											//End changed code
											vTotalLot = "";
											vTotalExpDate = "";
											vToatlBins = "";
											vBinInternalId = "";
											if(componentItemDetails!=null && componentItemDetails!='' && componentItemDetails.length>0)
											{


												for(var x=0;x<componentItemDetails.length && isScheduleScriptinvoked == 'F' ;x++)
												{
													if(context.getRemainingUsage()<= 200 && isScheduleScriptinvoked == 'F')
													{
														try{


															var param = new Array();	
															param['custscript_wmsse_sng_orderno_lst'] = vSoNumLst;				
															param['custscript_wmsse_sng_trantype'] = VtranType;
															param['custscript_wmsse_sng_customer'] = Vcustomer;
															param['custscript_wmsse_sng_shipdate'] = VshipDate;
															param['custscript_wmsse_sng_qbqty'] = vQty;
															param['custscript_wmsse_sng_nooflines'] = vnoofLines;
															param['custscript_wmsse_sng_shipcomplete'] = vshipcomplete;
															param['custscript_wmsse_sng_qbemployee'] = vTaskAssignTo;
															param['custscript_wmsse_sng_ordertype'] = VorderType;
															param['custscript_wmsse_sng_department']=vDepartment;
															param['custscript_wmsse_sng_class']=vClass;
															param['custscript_wmsse_sng_reprint']=vrePrint;
															param['custscript_wmsse_sng_whlocation']=whLocation;
															param['custscript_wmsse_sng_tranid_lst']=vtranidlst;


															var schstatus = nlapiScheduleScript('customscript_wmsse_singord_pickrpt_sch',null,param);
															isScheduleScriptinvoked = 'T';
															nlapiLogExecution('DEBUG', 'Scheduled Script Status',schstatus);
															var currentUserID = getCurrentUser();
															updateScheduleScriptStatus('Single order pick report SCH',currentUserID,'Submitted',vtranidlst,VtranType);
															break;
														}
														catch(e){
															nlapiLogExecution('DEBUG', 'exception',e);
														}

													}

													var currentRow=componentItemDetails[x];
													var componentItemId=currentRow[3];
													var componentItemText=currentRow[2];
													var componentItemQty=currentRow[0];
													var componentItemMemQty=currentRow[1];
													var componentItemFamily=currentRow[4];
													var componentItemGroup=currentRow[5];
													var componentItemDesc=currentRow[6];
													var componenetPrefBin=currentRow[7];
													var componenetItemDepartment=currentRow[8];  
													var componenetItemClass=currentRow[9];  

													if(componenetItemDepartment == null || componenetItemDepartment == '' || componenetItemDepartment == 'null' || componenetItemDepartment == 'undefined')
													{
														componenetItemDepartment = vdepartment;
													}
													if(componenetItemClass == null || componenetItemClass == '' || componenetItemClass == 'null' || componenetItemClass == 'undefined')
													{
														componenetItemClass = vclass;
													}

													strIsItemLot ='F';
													//var vItemType = nswms_GetItemType(componentItemId,whLocation);
													
													
													var vItemTypeResult = nswms_GetItemTypedetails(componentItemId,whLocation);
													var vItemType='';
													var vClassification='';
													
													if(vItemTypeResult!=''||vItemTypeResult!=null){
														
															vItemType      = vItemTypeResult[0].recordType;
															vClassification = vItemTypeResult[0].getValue('locationinvtclassification');
													}

													if (vItemType == "lotnumberedinventoryitem" || vItemType=="lotnumberedassemblyitem")
													{
														strIsItemLot ='T';
													}

													try{

														if(strIsItemLot =='T')
														{
															var AllowAllLots = 'T';
															if(trantype == 'salesorder')
															{
//																vBinDetails=fnGetPickReportBinDetailsLot(componentItemId,componentItemGroup,componentItemFamily,componenetPrefBin,whLocation,componenetItemDepartment,componenetItemClass,ordertype,vUnitsVal,'',request,schtype,vItemType);
																vBinDetails=fnGetPickReportBinDetailsLot(componentItemId,componentItemGroup,componentItemFamily,componenetPrefBin,whLocation,componenetItemDepartment,componenetItemClass,ordertype,vUnitsVal,'',request,schtype,vItemType,null,null,vClassification);
															}
															else
																if(trantype == 'transferorder')
																{
//																	vBinDetails=fnGetPickReportBinDetailsLot(componentItemId,componentItemGroup,componentItemFamily,componenetPrefBin,whLocation,componenetItemDepartment,componenetItemClass,ordertype,vUnitsVal,'',request,schtype,vItemType,AllowAllLots);
																	vBinDetails=fnGetPickReportBinDetailsLot(componentItemId,componentItemGroup,componentItemFamily,componenetPrefBin,whLocation,componenetItemDepartment,componenetItemClass,ordertype,vUnitsVal,'',request,schtype,vItemType,AllowAllLots,null,vClassification);
																}
														}
														else
														{
//															vBinDetails=fnGetPickReportBinDetails(componentItemId,componentItemGroup,componentItemFamily,componenetPrefBin,whLocation,componenetItemDepartment,componenetItemClass,ordertype,vUnitsVal,'',request,schtype,vItemType);     //commented by Nagaraju
															vBinDetails=fnGetPickReportBinDetails(componentItemId,componentItemGroup,componentItemFamily,componenetPrefBin,whLocation,componenetItemDepartment,componenetItemClass,ordertype,vUnitsVal,'',request,schtype,vItemType,null,vClassification);       //Added for classification
														}
														if(vBinDetails == 'scheduleScriptinvoked')
														{
															isScheduleScriptinvoked = 'T';
															break;
														}
													}
													catch(e){
														nlapiLogExecution('ERROR', 'from pickstratagies', e);
													}


													if(vBinDetails !=null && vBinDetails!='' && vBinDetails.length > 0)
													{
														vBinLocSeqArr.push(vBinDetails[0][0]);
														vBinInternalId = vBinDetails[0][2];
														nlapiLogExecution('ERROR', 'vBinDetails.length', vBinDetails.length);
														var strCompBinDets="";
														for(var f=0;f<vBinDetails.length;f++)
														{
															var currValues = vBinDetails[f]; 

															var zone=currValues[3];

															if(strIsItemLot =='T')
															{
																zone = currValues[5];
															}

															var bin = currValues[0];
															var qty = currValues[1];
															var binId= currValues[2];
															if(componenetPrefBin !=null && componenetPrefBin !='' && componenetPrefBin == bin)
																bin = bin +" *";
															strCompBinDets += bin+"("+Number((Big(qty).mul(getStockConversionRate)).toFixed(5))+ " "+vUnitsText+")";
															if(strIsItemLot =='T')
															{
																var vLotNo = currValues[3];
																var vExpDate = currValues[4];
																if(vLotNo != null && vLotNo != '')
																{
																	strCompBinDets += " " + vLotNo
																}
																if(vExpDate != null && vExpDate != '')
																{
																	strCompBinDets += " (" + vExpDate + ")";
																}

																if(vTotalLot == null || vTotalLot =="")
																{
																	vTotalLot = vLotNo;
																}
																else
																{
																	vTotalLot = vTotalLot +","+ vLotNo;
																}

																if(vTotalExpDate == null || vTotalExpDate =="")
																{
																	vTotalExpDate = vExpDate;
																}
																else
																{
																	vTotalExpDate = vTotalExpDate +","+ vExpDate;
																}

															}	
															if(vToatlBins == null || vToatlBins =="")
															{
																vToatlBins = currValues[0];
															}
															else
															{
																vToatlBins = vToatlBins +","+ currValues[0];
															}
															strCompBinDets += '$';	

															/*if(f>4)
																break;*/

														}

														try
														{

															var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
															nlapiLogExecution('ERROR', 'Creating Record', 'TRN_OPENTASK');

															if(vdono!=null && vdono!='')
																customrecord.setFieldValue('name', vdono);
															customrecord.setFieldValue('custrecord_wmsse_act_begin_date', dateStamp);
															customrecord.setFieldValue('custrecord_wmsse_act_end_date', dateStamp);

															//customrecord.setFieldValue('custrecord_wmsse_act_qty', parseFloat(enterQty).toFixed(5));

															customrecord.setFieldValue('custrecord_wmsse_sku', componentItemId);
															customrecord.setFieldValue('custrecord_wmsse_skudesc', componentItemDesc);
															customrecord.setFieldValue('custrecord_wmsse_line_no', vline);

															customrecord.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(componentItemQty).toFixed(5)));

															customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 9);//pick locations assigned completed

															customrecord.setFieldValue('custrecord_wmsse_tasktype', 3); //For Pick

															if(vUnitsText !=null && vUnitsText!='' && vUnitsText!='- None -')
																customrecord.setFieldValue('custrecord_wmsse_uom', vUnitsText);
															if(vConversionRate !=null && vConversionRate!='' && vConversionRate!='- None -')
																customrecord.setFieldValue('custrecord_wmsse_conversionrate', vConversionRate);

															if(vBinInternalId!=null && vBinInternalId!='' && vBinInternalId!='null' && vBinInternalId!='undefined')
															{
																customrecord.setFieldValue('custrecord_wmsse_actbeginloc', vBinInternalId);

															}

															if(vexpiryDate!=null && vexpiryDate!='' && vexpiryDate !='null' && vexpiryDate !='undefined')
																customrecord.setFieldValue('custrecord_wmsse_expirydate', vexpiryDate);


															customrecord.setFieldValue('custrecord_wmsse_order_no', vSoInternalId);
															customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
															if(vCustIntId!=null && vCustIntId!='' && vCustIntId!='null' && vCustIntId!='undefined')
																customrecord.setFieldValue('custrecord_wmsse_customer', vCustIntId);

															customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
															if(vSKUId!=null && vSKUId!='' && vSKUId!='null' && vSKUId!='undefined')
																customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', vSKUId);
															if(itemType == 'Kit')
															{								
																customrecord.setFieldValue('custrecord_wmsse_kitflag', 'T');
																if(componentItemQty!=null && componentItemQty!='' && componentItemQty!='null' && componentItemQty!='undefined')
																	customrecord.setFieldValue('custrecord_wmsse_compitm_expqty', componentItemQty);
															}


															if(strCompBinDets!=null && strCompBinDets!='' && strCompBinDets!='null' && strCompBinDets!='undefined')
																customrecord.setFieldValue('custrecord_wmsse_multi_bins', strCompBinDets);

															if(vShipMethod!=null && vShipMethod!='' && vShipMethod!='null' && vShipMethod!='undefined')
																customrecord.setFieldValue('custrecord_wmsse_shipmethod', vShipMethod);

															if(vPickGen!=null && vPickGen!='' && vPickGen!='null' && vPickGen!='undefined')
																customrecord.setFieldValue('custrecord_wmsse_pickreport_no', vPickGen);

															if(vTaskAssignTo !=null && vTaskAssignTo!='' && vTaskAssignTo!='null' && vTaskAssignTo!='undefined')
																customrecord.setFieldValue('custrecord_wmsse_task_assignedto',vTaskAssignTo);

															var recid = nlapiSubmitRecord(customrecord);
															nlapiLogExecution('ERROR', 'Done creating opentask Record', recid);
															customrecord=null;
														}
														catch(e)
														{
															nlapiLogExecution('ERROR', 'inside catch exception', e);

															if ( e instanceof nlobjError )
															{

																nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
															}
															else
															{

																nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
															}
														}
													}
													else
													{

														try
														{





															var vsoitemQty=componentItemQty;//searchresult.getValue('quantity',null,'max');
															var vSoInternalId = vSoInternalId;//searchresult.getValue('internalid',null,'group');
															var vCustIntId=vCustIntId;//searchresult.getValue('internalid','customer','group');
															var vShipMethod=vShipMethod;//searchresult.getValue('shipmethod',null,'group');
															var vAlreadyPickGenQty= fnGetAlreadyPickGenQty(vSoInternalId,vline,componentItemId);

															var vCanBeFulfillCheck ="T";

															vCanBeFulfillCheck = nlapiLookupField('item',vSKUId,'isfulfillable');


															nlapiLogExecution('ERROR', 'vAlreadyPickGenQty,vSKUId,vCanBeFulfillCheck', vAlreadyPickGenQty+","+vSKUId+","+vCanBeFulfillCheck);
															if(vCanBeFulfillCheck == "T" && (vItemType == 'noninventoryitem' || vItemType == 'NonInvtPart' ||   vItemType == 'otherchargeitem' || vItemType == 'OthCharge' || vItemType == 'Service' || vItemType == 'serviceitem' || vItemType == 'downloaditem'  || vItemType == 'DwnLdItem' || vItemType == 'giftcertificateitem' || vItemType == 'GiftCert') )
															{	
																																
																vsoitemQty=new Big(vsoitemQty);
																vsoitemfulfillQty=new Big(vsoitemfulfillQty);
																vAlreadyPickGenQty=new Big(vAlreadyPickGenQty);
																vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
																vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
																
																var vQtyToPickGen = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus((vAlreadyPickGenQty).plus(vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty))); 
																nlapiLogExecution('ERROR', 'vQtyToPickGen', vQtyToPickGen);
																
																if(parseFloat(vQtyToPickGen)>0)
																{						

																	nlapiLogExecution('EMERGENCY', ' itemType', vItemType); 

																	var binLoc= '';
																	if(vItemType == 'noninventoryitem' )
																	{
																		binLoc = 'Non-Inventory' ;
																	}
																	else if(vItemType == 'otherchargeitem' )
																	{
																		binLoc = 'Other Charge' ;
																	}
																	else if(vItemType == 'serviceitem' )
																	{
																		binLoc = 'Service Item' ;
																	}
																	else if(vItemType == 'downloaditem' )
																	{
																		binLoc = 'Download' ;
																	}
																	else if(vItemType == 'giftcertificateitem' )
																	{
																		binLoc = 'Gift Certificate' ;
																	}


																	var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
																	nlapiLogExecution('EMERGENCY', 'Creating Record', 'TRN_OPENTASK');

																	if(vdono!=null && vdono!='')
																		customrecord.setFieldValue('name', vdono);
																	customrecord.setFieldValue('custrecord_wmsse_act_begin_date', dateStamp);
																	customrecord.setFieldValue('custrecord_wmsse_act_end_date', dateStamp);

																	//customrecord.setFieldValue('custrecord_wmsse_act_qty', parseFloat(enterQty).toFixed(5));

																	customrecord.setFieldValue('custrecord_wmsse_sku', componentItemId);
																	customrecord.setFieldValue('custrecord_wmsse_line_no', vline);

																	customrecord.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(vsoitemQty).toFixed(5)));

																	if(vTaskAssignTo !=null && vTaskAssignTo!='' && vTaskAssignTo!='null' && vTaskAssignTo!='undefined')
																		customrecord.setFieldValue('custrecord_wmsse_task_assignedto',vTaskAssignTo);

																	customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 9);//pick locations assigned completed
																	customrecord.setFieldValue('custrecord_wmsse_order_no', vSoInternalId);
																	customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
																	customrecord.setFieldValue('custrecord_wmsse_tasktype', 3); //For Pick
																	customrecord.setFieldValue('custrecord_wmsse_multi_bins', binLoc);
																	if(vPickGen!=null && vPickGen!='' && vPickGen!='null' && vPickGen!='undefined')
																		customrecord.setFieldValue('custrecord_wmsse_pickreport_no', vPickGen);

																	if(vSKUId!=null && vSKUId!='' && vSKUId!='null' && vSKUId!='undefined')
																		customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', vSKUId);

																	if(vCustIntId!=null && vCustIntId!='' && vCustIntId!='null' && vCustIntId!='undefined')
																		customrecord.setFieldValue('custrecord_wmsse_customer', vCustIntId);

																	if(vShipMethod!=null && vShipMethod!='' && vShipMethod!='null' && vShipMethod!='undefined')
																		customrecord.setFieldValue('custrecord_wmsse_shipmethod', vShipMethod);


																	customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
																	var recid = nlapiSubmitRecord(customrecord);

																}
															}		
															else
															{



																var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
																nlapiLogExecution('ERROR', 'Creating Record', 'TRN_OPENTASK');

																if(vdono!=null && vdono!='')
																	customrecord.setFieldValue('name', vdono);
																customrecord.setFieldValue('custrecord_wmsse_act_begin_date', dateStamp);
																customrecord.setFieldValue('custrecord_wmsse_act_end_date', dateStamp);

																//customrecord.setFieldValue('custrecord_wmsse_act_qty', parseFloat(enterQty).toFixed(5));

																customrecord.setFieldValue('custrecord_wmsse_sku', componentItemId);
																customrecord.setFieldValue('custrecord_wmsse_skudesc', componentItemDesc);
																customrecord.setFieldValue('custrecord_wmsse_line_no', vline);

																customrecord.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(componentItemQty).toFixed(5)));

																customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 26);//Failed picks

																customrecord.setFieldValue('custrecord_wmsse_tasktype', 3); //For Pick

																customrecord.setFieldValue('custrecord_wmsse_multi_bins', 'Failed picks due to configuration/insufficient inventory');
																customrecord.setFieldValue('custrecord_wmsse_order_no', vSoInternalId);
																customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
																if(vCustIntId!=null && vCustIntId!='' && vCustIntId!='null' && vCustIntId!='undefined')
																	customrecord.setFieldValue('custrecord_wmsse_customer', vCustIntId);

																customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
																if(vSKUId!=null && vSKUId!='' && vSKUId!='null' && vSKUId!='undefined')
																	customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', vSKUId);
																if(itemType == 'Kit')
																{								
																	customrecord.setFieldValue('custrecord_wmsse_kitflag', 'T');
																	if(componentItemQty!=null && componentItemQty!='' && componentItemQty!='null' && componentItemQty!='undefined')
																		customrecord.setFieldValue('custrecord_wmsse_compitm_expqty', componentItemQty);
																}

																if(vShipMethod!=null && vShipMethod!='' && vShipMethod!='null' && vShipMethod!='undefined')
																	customrecord.setFieldValue('custrecord_wmsse_shipmethod', vShipMethod);

																if(vPickGen!=null && vPickGen!='' && vPickGen!='null' && vPickGen!='undefined')
																	customrecord.setFieldValue('custrecord_wmsse_pickreport_no', vPickGen);

																if(vTaskAssignTo !=null && vTaskAssignTo!='' && vTaskAssignTo!='null' && vTaskAssignTo!='undefined')
																	customrecord.setFieldValue('custrecord_wmsse_task_assignedto',vTaskAssignTo);

																var recid = nlapiSubmitRecord(customrecord);
																nlapiLogExecution('ERROR', 'Done creating failed picks opentask Record', recid);
																customrecord=null;
															}
														}
														catch(e)
														{
															nlapiLogExecution('ERROR', 'inside catch exception', e);

															if ( e instanceof nlobjError )
															{

																nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
															}
															else
															{

																nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
															}
														}

													}


												}
											}

											tempLineNo=vline;
											pagetotalno=parseFloat(pagetotalno)+1;
										}
										else
										{
											if(vnAlrPickGenOrderArray.indexOf(vdono) == -1)
												vnAlrPickGenOrderArray.push(vdono);
										}
									}
								}
								else
								{
									var vUnitsText = searchresult.getText('unit',null,'group');
									var vline = searchresult.getValue('line',null,'group');
									var vdono = searchresult.getValue('tranid',null,'group');
									var vsoitemQty=searchresult.getValue('quantity',null,'max');
									var vSoInternalId = searchresult.getValue('internalid',null,'group');
									var vCustIntId=salesorder.getFieldValue('entity');//searchresult.getValue('internalid','customer','group');
									var vShipMethod=searchresult.getValue('shipmethod',null,'group');
									var vAlreadyPickGenQty=  fnGetAlreadyPickGenQty(vSoInternalId,vline);

									var vCanBeFulfillCheck ="T";
									vCanBeFulfillCheck = nlapiLookupField('item',vSKUId,'isfulfillable');

									nlapiLogExecution('ERROR', 'vAlreadyPickGenQty,vCanBeFulfillCheck', vAlreadyPickGenQty+","+vCanBeFulfillCheck);
									if(vCanBeFulfillCheck == "T" && parseFloat(vSoreminqty) > 0)
									{	
										var vQtyToPickGen = (parseFloat(vsoitemQty) + parseFloat(vsoitemfulfillQty))  - (parseFloat(vAlreadyPickGenQty)+(parseFloat(vsoitemNSReceivedQty) -parseFloat(vsoitemErpConfirmedQty) ));
										nlapiLogExecution('ERROR', 'vQtyToPickGen old',vQtyToPickGen);
										
										vsoitemQty=new Big(vsoitemQty);
										vsoitemfulfillQty=new Big(vsoitemfulfillQty);
										vAlreadyPickGenQty=new Big(vAlreadyPickGenQty);
										vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
										vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
										
										var vQtyToPickGen = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus((vAlreadyPickGenQty).plus(vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty))); 
										nlapiLogExecution('ERROR', 'vQtyToPickGen', vQtyToPickGen);
										
										if(parseFloat(vQtyToPickGen)>0)
										{						

											nlapiLogExecution('ERROR', ' itemType', itemType); 

											var binLoc= '';
											if(itemType == 'NonInvtPart' )
											{
												binLoc = 'Non-Inventory' ;
											}
											else if(itemType == 'OthCharge' )
											{
												binLoc = 'Other Charge' ;
											}
											else if(itemType == 'Service' )
											{
												binLoc = 'Service Item' ;
											}
											else if(itemType == 'DwnLdItem' )
											{
												binLoc = 'Download' ;
											}
											else if(itemType == 'GiftCert' )
											{
												binLoc = 'Gift Certificate' ;
											}


											var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');
											nlapiLogExecution('EMERGENCY', 'Creating Record', 'TRN_OPENTASK');

											if(vdono!=null && vdono!='')
												customrecord.setFieldValue('name', vdono);
											customrecord.setFieldValue('custrecord_wmsse_act_begin_date', dateStamp);
											customrecord.setFieldValue('custrecord_wmsse_act_end_date', dateStamp);
											var itemdesc= '';
											for(var actSOcount=1;actSOcount<=salesorder.getLineItemCount('item');actSOcount++)
											{
												var actLineno=salesorder.getLineItemValue('item','line',actSOcount);
												var tLineNO =vline;
												if(trantype == 'transferorder')
												{
													tLineNO = parseInt(tLineNO)-1;
												}
												if(tLineNO==actLineno)
												{
													itemdesc=salesorder.getLineItemValue('item','description',actSOcount);
													if(itemdesc == null || itemdesc == '' || itemdesc == 'null')
														itemdesc = nlapiLookupField('item', vSKUId,'salesdescription');
													break;
												}
											}
											customrecord.setFieldValue('custrecord_wmsse_sku', vSKUId);
											if(itemdesc !=null && itemdesc!='' && itemdesc!='null' && itemdesc!='undefined')
												customrecord.setFieldValue('custrecord_wmsse_skudesc', itemdesc);
											customrecord.setFieldValue('custrecord_wmsse_line_no', vline);

											customrecord.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(vsoitemQty).toFixed(5)));

											if(vTaskAssignTo !=null && vTaskAssignTo!='' && vTaskAssignTo!='null' && vTaskAssignTo!='undefined')
												customrecord.setFieldValue('custrecord_wmsse_task_assignedto',vTaskAssignTo);

											customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 9);//pick locations assigned completed
											customrecord.setFieldValue('custrecord_wmsse_order_no', vSoInternalId);
											customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
											customrecord.setFieldValue('custrecord_wmsse_tasktype', 3); //For Pick
											customrecord.setFieldValue('custrecord_wmsse_multi_bins', binLoc);
											if(vPickGen!=null && vPickGen!='' && vPickGen!='null' && vPickGen!='undefined')
												customrecord.setFieldValue('custrecord_wmsse_pickreport_no', vPickGen);

											if(vSKUId!=null && vSKUId!='' && vSKUId!='null' && vSKUId!='undefined')
												customrecord.setFieldValue('custrecord_wmsse_parent_sku_no', vSKUId);

											if(vCustIntId!=null && vCustIntId!='' && vCustIntId!='null' && vCustIntId!='undefined')
												customrecord.setFieldValue('custrecord_wmsse_customer', vCustIntId);

											if(vShipMethod!=null && vShipMethod!='' && vShipMethod!='null' && vShipMethod!='undefined')
												customrecord.setFieldValue('custrecord_wmsse_shipmethod', vShipMethod);
											if(vUnitsText!=null && vUnitsText!='' && vUnitsText!='null' && vUnitsText!='undefined')
												customrecord.setFieldValue('custrecord_wmsse_uom', vUnitsText);

											customrecord.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
											var recid = nlapiSubmitRecord(customrecord);

										}
									}


								}

							}
						} 
						
						var lockfilters=new Array();
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',distinctSoIds[count]));				
						lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
						var lockcolumns= new Array();
						
						var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

						if(lockresults!=null && lockresults!='')
						{
							
							
							if(lockresults!=null && lockresults!='' && lockresults != 'null' && lockresults != undefined 
									&& lockresults != 'undefined' && lockresults.length > 0)
							{
								for(var lockItr = 0;lockItr < lockresults.length;lockItr ++)
								{
									var lockRecordId=lockresults[lockItr].getId();
									var LockDeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockrecs', lockRecordId);
								}
								LockDeleteRecordId=null;
							}
							
							
						}

					}
					//var pageno=0;
					if(isScheduleScriptinvoked=='F')
					{
						var trantype = VtranType;
						var salesorder = nlapiLoadRecord(trantype, distinctSoIds[0]);
						var	address = salesorder.getFieldValue('shipaddressee');


						var ismultilineship=salesorder.getFieldValue('ismultishipto');
						if(searchresults!=null && searchresults!='')
						{
							var vlineno=searchresults[0].getValue('line',null,'group');

						}
						var shiptovalue=salesorder.getLineItemValue('item','shipaddress',vlineno);
						var shiptotext=salesorder.getLineItemText('item','shipaddress',vlineno);


						var customerrecord=salesorder.getFieldValue('entity');


						var locationinternalid=salesorder.getFieldValue('location');

						var LogoValue;
						var LogoText;
						if(locationinternalid != null && locationinternalid != ""){
							var companylist = nlapiLoadRecord('location', locationinternalid);
							LogoValue=companylist.getFieldValue('logo');
							LogoText=companylist.getFieldText('logo');
						}


						nlapiLogExecution('ERROR', 'salesorder,address,ismultilineship,shiptovalue,shiptotext,logo value,logo text', salesorder+","+address+","+ismultilineship+","+shiptovalue+","+shiptotext+","+LogoValue+","+LogoText);
						var filefound='';
						//var filefound = getLoadFile('LOGOCOMP.jpg'); 
						if(LogoText !=null && LogoText !='')
							filefound = getLoadFile(''+LogoText+''); 
						else
							filefound = getLoadFile('LOGOCOMP.jpg');

						if (filefound) 
						{ 

							var imageurl = filefound.getURL();

							var finalimageurl = imageurl;							

							finalimageurl=finalimageurl.replace(/&/g,"&amp;");
							nlapiLogExecution('ERROR', 'Event,imageurl,imageurl', filefound.getId()+","+imageurl+","+finalimageurl);

						} 
						else 
						{
							nlapiLogExecution('ERROR', 'Event', 'No file;');
						}


						nlapiLogExecution('ERROR', 'customerrecord',customerrecord);
						var entityrecord ;
						if(customerrecord != "" && customerrecord != null)
						{
							entityrecord = nlapiLoadRecord('customer', customerrecord);
						}


						if(address != null && address !="")
							address=address.replace(replaceChar,'');
						else
							address="";

						var	HNo = salesorder.getFieldValue('shipaddr1');
						if(HNo != null && HNo !="")
							HNo=HNo.replace(replaceChar,'');
						else
							HNo="";
						var	addr2 = salesorder.getFieldValue('shipaddr2');
						if(addr2 != null && addr2 !="")
							addr2=addr2.replace(replaceChar,'');
						else
							addr2="";
						nlapiLogExecution('ERROR','addr2',addr2);
						var	city = salesorder.getFieldValue('shipcity');
						if(city != null && city !="")
							city=city.replace(replaceChar,'');
						else
							city="";
						var	state = salesorder.getFieldValue('shipstate');
						if(state != null && state !="")
							state=state.replace(replaceChar,'');
						else
							state="";
						var	country = salesorder.getFieldValue('shipcountry');
						if(country != null && country !="")
							country=country.replace(replaceChar,'');
						else
							country="";
						var	zipcode = salesorder.getFieldValue('shipzip');
						if(zipcode == null || zipcode =="" || zipcode =='null')
							zipcode = '';
						var	carrier = salesorder.getFieldText('shipmethod');
						if(carrier != null && carrier !="")
							carrier=carrier.replace(replaceChar,'');
						var SalesorderNo= salesorder.getFieldValue('tranid');


						if(ismultilineship=='T')
						{
							if(entityrecord!=null && entityrecord!='')
							{
								var custlineitemcount=entityrecord.getLineItemCount('addressbook');
								for(var customerline=1;customerline<=custlineitemcount;customerline++)
								{	
									var custline=parseInt(customerline).toString();
									var customerlabelid = entityrecord.getLineItemValue('addressbook','internalid',custline);
									if(customerlabelid==shiptovalue)
									{

										address = entityrecord.getLineItemValue('addressbook','addressee',custline);
										if(address != null && address !="")
											address=address.replace(replaceChar,'');
										else
											address="";
										HNo= entityrecord.getLineItemValue('addressbook','addr1',custline);
										if(HNo != null && HNo !="")
											HNo=HNo.replace(replaceChar,'');
										else
											HNo="";
										addr2 = entityrecord.getLineItemValue('addressbook','addr2',custline);
										if(addr2 != null && addr2 !="")
											addr2=addr2.replace(replaceChar,'');
										else
											addr2="";

										city = entityrecord.getLineItemValue('addressbook','city',custline);
										if(city != null && city !="")
											city=city.replace(replaceChar,'');
										else
											city="";
										state = entityrecord.getLineItemValue('addressbook','dropdownstate',custline);
										if(state != null && state !="")
											state=state.replace(replaceChar,'');
										else
											state="";
										zipcode = entityrecord.getLineItemValue('addressbook','zip',custline);
										if(zipcode != null && zipcode !="" && zipcode!='null')
											zipcode=zipcode.replace(replaceChar,'');

										if(zipcode == null || zipcode =="" || zipcode =='null')
											zipcode = '';

										country=entityrecord.getLineItemValue('addressbook','country',custline);
										if(country != null && country !="")
											country=country.replace(replaceChar,'');
										else
											country="";
									}
								}
							}
						}

						nlapiLogExecution('ERROR','address,HNo,city,state,country',address+","+HNo+","+city+","+state+","+country);
						var newvdono = distname[count];




						if(pageno==0)
						{	
							var strxml = "<table width='100%' >";
							pageno=parseFloat(pageno+1);
						}
						else
						{
							var strxml=strxml+"";
							strxml += "<table width='100%' >";
						}

						//var strxml = "<table width='100%' >";
						var vOpenTaskfilters = new Array();
						if(distinctSoIds != null && distinctSoIds != '')
							vOpenTaskfilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', distinctSoIds));
						vOpenTaskfilters.push(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', vPickGen));
						var vnobjOpenTaskDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_headlevel_pickrptdets',vOpenTaskfilters, null);
						var vTotalOrderWeight = 0;
						var vEDIFlag = "F";
						if(vnobjOpenTaskDetails !=null && vnobjOpenTaskDetails !='' && vnobjOpenTaskDetails.length > 0)
						{
							vTotalOrderWeight = vnobjOpenTaskDetails[0].getValue('formulanumeric',null,'sum');
							vEDIFlag = vnobjOpenTaskDetails[0].getValue('custentity_wmsse_asn_required','custrecord_wmsse_customer','group');
						}
						if(vTotalOrderWeight ==null || vTotalOrderWeight =='' || vTotalOrderWeight =='- None -')
							vTotalOrderWeight ="";
						nlapiLogExecution('ERROR','vTotalOrderWeight,vEDIFlag,distinctSoIds',vTotalOrderWeight+","+vEDIFlag+","+distinctSoIds);
						strxml += "<tr ><td valign='middle' align='left'><img src='" + finalimageurl + "'></img></td><td valign='middle' align='left'  style='font-size:xx-large;'>";
						strxml += "Pick Report ";
						strxml += "</td><td align='right'>&nbsp;</td></tr></table>";
						strxml += "<p align='right'>Date/Time:"+Timez+"</p>";
						strxml +="<table style='width:100%;'>";

						var vOpenfilters = new Array();
						var objOpenTaskDetails=new Array();
						var SOLineDetails= nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_getpickreport_details');
						if(distinctSoIds != null && distinctSoIds != '')
							SOLineDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', distinctSoIds));
						SOLineDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', vPickGen));
						
						var resLenDetails = SOLineDetails.runSearch();					
						
						var resultsPage = resLenDetails.getResults(0, 1000);
						var offset = 0;
						while (!!resultsPage && resultsPage.length > 0) 
						{
							objOpenTaskDetails = objOpenTaskDetails.concat(resultsPage);
							offset += 1000;
							resultsPage = resLenDetails.getResults(offset, offset + 1000);
						}
						
						if(objOpenTaskDetails != null && objOpenTaskDetails != '')
						{	

							if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
							{
								var vnOrderName = objOpenTaskDetails[0].getValue('name');

								strxml +="<tr><td valign='top'>";
								strxml +="<table align='left' style='width:70%;'>";

								strxml +="<tr><td align='left' style='width:51px'>Order # ";

								strxml +="&nbsp;&nbsp;";
								if(vnOrderName != null && vnOrderName != "")
								{
									strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
									strxml += vnOrderName;
									strxml += "\"/>";
								}
								strxml += "</td>";
								strxml +="<td align='left'>Pick Report # ";

								strxml +="&nbsp;&nbsp;";
								if(vPickGen != null && vPickGen != "")
								{
									strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
									strxml += vPickGen;
									strxml += "\"/>";
								}
								strxml += "</td></tr>";

								strxml +="<tr><td align='left' style='width:51px'>Total Order Weight: ";

								strxml +="&nbsp;&nbsp;";
								if(vTotalOrderWeight != null && vTotalOrderWeight != "")
								{					
									strxml += vTotalOrderWeight;
								}
								strxml += "</td>";
								strxml +="<td align='left'>EDI: ";

								strxml +="&nbsp;&nbsp;";
								if(vEDIFlag == "T")
								{
									strxml += 'Yes';
								}
								else
								{
									strxml += 'No';
								}
								strxml += "</td></tr>";

								strxml +="</table><table><tr><td>&nbsp;</td></tr></table>	<table align='right' style='width:70%;'>";
								strxml +="<tr align='right'>";
								strxml +="<td colspan='5' align='right'>";
								strxml +="<table align='right' style='width:40%;' border='1'>";
								strxml +="<tr><td align='right'><b>Ship To</b></td></tr>";
								strxml +="<tr><td align='right' style='width:51px'>Address:</td>";
								if(address != null && address !="" && address!='null')
									//strxml +="<td>"+address.replace(replaceChar,'')+"</td>";
								{
									address=address.replace(/\&/g,"&amp;");
									address=address.replace(/\"/g,"&quot;");
									address=address.replace(/\'/g,"&apos;");
									//address=address.replace(replaceChar,'');
									strxml +="<td>"+address+"</td>";
								}
								strxml +="</tr>";
								strxml +="<tr><td style='width:51px'>&nbsp;</td>";
								if(HNo != null && HNo !="" && HNo!='null')
									strxml +="<td>"+HNo.replace(replaceChar,'')+"</td>";
								strxml +="</tr>";
								if(addr2 != null && addr2 != '')
								{	
									strxml +="<tr><td style='width:51px'>&nbsp;</td>";
									strxml +="<td>"+addr2.replace(replaceChar,'')+"</td></tr>";
								}
								strxml +="<tr><td align='right' style='width:51px'>City:</td>";
								strxml +="<td>"+city.replace(replaceChar,'')+"</td></tr>";
								strxml +="<tr><td align='right' style='width:51px'>State:</td>";
								strxml +="<td>"+state.replace(replaceChar,'')+"</td></tr>";
								strxml +="<tr><td align='right' style='width:51px'>Zip:</td>";
								if(zipcode != null && zipcode !="" && zipcode!='null' )// Case# 20147997
									strxml +="<td>"+zipcode.replace(replaceChar,'')+"</td></tr>";
								else
								{
									strxml +="<td>"+zipcode+"</td></tr>";
								}
								strxml +="<tr><td align='right' style='width:51px'>Country:</td>";
								if(country != null && country !="" && country!='null' )// Case# 20147997
									strxml +="<td>"+country.replace(replaceChar,'')+"</td></tr>";			
								else
								{
									strxml +="<td>"+country+"</td></tr>";
								}
								strxml +="</table>";
								strxml +=" <p>&nbsp;</p>";
								strxml +="</td></tr></table>";
								strxml +="</td></tr></table>";

								strxml +="<table  width='100%'>";
								strxml +="<tr style=\"font-weight:bold;background-color:gray;color:white;\">";



								strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
								strxml += "Item ";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";			
								strxml += "Item Description";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='7%' style='border-width: 1px; border-color: #000000'>";
								strxml += "Line #";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";



								strxml += "<td width='5%' style='border-width: 1px; border-color: #000000'>";			
								strxml += "Committed Qty";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='3%' style='border-width: 1px; border-color: #000000'>";			
								strxml += "Units";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='3%' style='border-width: 1px; border-color: #000000'>";			
								strxml += "Weight";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='22%' style='border-width: 1px; border-color: #000000'>";
								strxml += "Bin Location (Qty)";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='10%' style='border-width: 1px; border-color: #000000'>";			
								strxml += "Ship Via </td>";

								strxml =strxml+  "</tr>";
								for(var j=0;j<objOpenTaskDetails.length;j++)
								{




									var vBinDetails = objOpenTaskDetails[j].getValue('custrecord_wmsse_multi_bins');
									var vnSku = objOpenTaskDetails[j].getText('custrecord_wmsse_sku');
									var vnSkuDesc = objOpenTaskDetails[j].getValue('custrecord_wmsse_skudesc');
									var vnOrder = objOpenTaskDetails[j].getValue('name');
									var vnCommQty = objOpenTaskDetails[j].getValue('custrecord_wmsse_expe_qty');
									var vnCustomer = objOpenTaskDetails[j].getText('custrecord_wmsse_customer');
									var vnShipVia = objOpenTaskDetails[j].getText('custrecord_wmsse_shipmethod');
									var vnLine = objOpenTaskDetails[j].getValue('custrecord_wmsse_line_no');
									var vnUnits = objOpenTaskDetails[j].getValue('custrecord_wmsse_uom');
									var vConversionRate = objOpenTaskDetails[j].getValue('custrecord_wmsse_conversionrate');
									var vItemWeight = objOpenTaskDetails[j].getValue('weight','custrecord_wmsse_sku');
									var vItemWeightUnit = objOpenTaskDetails[j].getText('weightunit','custrecord_wmsse_sku');
									var vTotalItemWeight = objOpenTaskDetails[j].getValue('formulanumeric');								
									if(vnUnits == null || vnUnits == '' || vnUnits == '- None -')
										vnUnits = "";								


									if(vTotalItemWeight == null || vTotalItemWeight == '' || vTotalItemWeight == '- None -' || vTotalItemWeight == 0)
										vTotalItemWeight = "";

									strxml =strxml+  "<tr>";
									strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
									if(vnSku != null && vnSku != '')
									{
										//case # 201414733 start
										//vnSku=vnSku.replace(replaceChar,'');	
										//case # 201414733 end
										vnSku=vnSku.replace(/\&/g,"&amp;");
										vnSku=vnSku.replace(/\"/g,"&quot;");
										vnSku=vnSku.replace(/\'/g,"&apos;");
										var index = vnSku.lastIndexOf(':');						
										vnSku = vnSku.substring(index+1);
										vnSku = vnSku.trim();
										strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
										strxml += vnSku;	

										nlapiLogExecution('ERROR', 'vnSku', vnSku);
										strxml += "\"/>";
									}
									strxml += "</td>";
									strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
									if(vnSkuDesc != null && vnSkuDesc != "")
									{
										vnSkuDesc = vnSkuDesc.replace(/\&/g,"&amp;");
										vnSkuDesc = vnSkuDesc.replace(/\"/g,"&quot;");
										vnSkuDesc = vnSkuDesc.replace(/\'/g,"&apos;");
										//vnSkuDesc = vnSkuDesc.replace(replaceChar,'');

										strxml += vnSkuDesc;
									}
									strxml += "</td>"; 

									strxml += "<td width='7%' align='right' style='border-width: 1px; border-color: #000000'>";			
									strxml += vnLine;
									strxml += "</td>"; 

									strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
									strxml += vnCommQty;
									strxml += "</td>"; 

									strxml += "<td width='3%' align='left' style='border-width: 1px; border-color: #000000'>";			
									strxml += vnUnits;
									strxml += "</td>"; 

									if(vItemWeightUnit != null && vItemWeightUnit != '')
									{
										strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
										strxml += vTotalItemWeight + "&nbsp;&nbsp;" + vItemWeightUnit;
										strxml += "</td>";
									}
									else
									{
										strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
										strxml += vTotalItemWeight;
										strxml += "</td>";
									}


									strxml += "<td width='22%'   style='border-width: 1px; border-color: #000000; text-align:left'>";

									if(vBinDetails != null && vBinDetails != '')
									{
										vBinDetails=vBinDetails.toString().replace(/\$/g,"<br/>");

										vBinDetails=vBinDetails.toString().replace(/\&/g,"&amp;");
										strxml += vBinDetails.toString();
									}
									strxml += "</td>";

									strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
									if(vnShipVia != null && vnShipVia != "")
										strxml += vnShipVia.replace(replaceChar,'');
									strxml += "</td>";

									strxml =strxml+  "</tr>";


									//Need to display vPickLocDetsArr[j];

								}	


								//strxml =strxml+"</table>";
							}

							searchresults=null;
							distinctSoIds=null;
							vBinDetails=null;
							componentItemDetails=null;

							strxml =strxml+"</table>";
							if(vnAlrPickGenOrderArray != null && vnAlrPickGenOrderArray !='')
							{
								strxml =strxml+  "<table style='width:100%;'>";
								strxml =strxml+  "<tr >";
								strxml += "<td width='3%' style='border-width: 1px; border-color: #000000;align:center; font-color: #FE042A;'  colspan='10'>";			
								strxml += "Already pick report has been generated for "+vnAlrPickGenOrderArray;
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
								strxml =strxml+  "</tr >";
								strxml =strxml+  "</table>";
							}
							if((soNumArray.length-w)>1)
							{
								pageno=parseFloat(pageno)+1;
								strxml=strxml+ "<p style='page-break-after:always'></p>";
							}


						}
					}


				}



			}


			if(isScheduleScriptinvoked == 'F')
			{
				strxml =strxml+ "</body></pdf>";
				xml=xml +strxml;
				nlapiLogExecution('ERROR', 'xml', xml.toString());
				var file = nlapiXMLToPDF(xml);	
				var pdffilename = vPickGen+'_PickReport.pdf';
				response.setContentType('PDF',pdffilename);
				nlapiLogExecution('ERROR','Remaining usage at the endd',context.getRemainingUsage());
				response.write( file.getValue() );
			}
			else
			{
				var form = nlapiCreateForm('Single order Pick report scheduler');
				var msg = form.addField('custpage_message', 'inlinehtml', null, null, null);
				msg.setLayoutType('outside','startcol');
				var message='Pick report for the selected orders successfully scheduled for generation.';
				var PickQBURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_pickstatusreport', 'customdeploy_wmsse_pickstatusreport');
				PickQBURL = PickQBURL+ '&custpage_reportstatustype='+ '2';
				msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Confirmation', '"+message+"', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
				form.addButton('custpage_print','Pick Report Status',"window.location.href = '"+PickQBURL+"' ");
				response.writePage(form);
			}

		}
		else if(vrePrint == "T")
		{
			var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdf>\n<head><macrolist><macro id='myfooter'><p align='center'>Page <pagenumber/> of <totalpages/></p></macro></macrolist></head><body  font-size=\"7\"  size=\"A4-landscape\"    padding-top=\" 0mm\"   footer='myfooter' footer-height='20mm'>\n";

			var isScheduleScriptinvoked = 'F';
			for(var w=0;w<soNumArray.length && isScheduleScriptinvoked == 'F';w++)
			{


				if(context.getRemainingUsage()<= 200 && isScheduleScriptinvoked == 'F')
				{
					try{


						var param = new Array();	
						param['custscript_wmsse_sng_orderno_lst'] = vSoNumLst;				
						param['custscript_wmsse_sng_trantype'] = VtranType;
						param['custscript_wmsse_sng_customer'] = Vcustomer;
						param['custscript_wmsse_sng_shipdate'] = VshipDate;
						param['custscript_wmsse_sng_qbqty'] = vQty;
						param['custscript_wmsse_sng_nooflines'] = vnoofLines;
						param['custscript_wmsse_sng_shipcomplete'] = vshipcomplete;
						param['custscript_wmsse_sng_qbemployee'] = vTaskAssignTo;
						param['custscript_wmsse_sng_ordertype'] = VorderType;
						param['custscript_wmsse_sng_department']=vDepartment;
						param['custscript_wmsse_sng_class']=vClass;
						param['custscript_wmsse_sng_reprint']=vrePrint;
						param['custscript_wmsse_sng_whlocation']=whLocation;
						param['custscript_wmsse_sng_tranid_lst']=vtranidlst;


						var schstatus = nlapiScheduleScript('customscript_wmsse_singord_pickrpt_sch',null,param);
						isScheduleScriptinvoked = 'T';
						nlapiLogExecution('DEBUG', 'Scheduled Script Status',schstatus);
						//var currentUserID = getCurrentUser();
						//updateScheduleScriptStatus('Single order pick report SCH',currentUserID,'Submitted',vtranidlst,VtranType);
						break;
					}
					catch(e){
						nlapiLogExecution('DEBUG', 'exception',e);
					}

				}


				var trantype = VtranType;
				var salesorder = nlapiLoadRecord(trantype, soNumArray[w]);
				var	address = salesorder.getFieldValue('shipaddressee');

				var ismultilineship=salesorder.getFieldValue('ismultishipto');
				var vlineno=salesorder.getLineItemValue('item','line',1);


				var shiptovalue=salesorder.getLineItemValue('item','shipaddress',vlineno);
				var shiptotext=salesorder.getLineItemText('item','shipaddress',vlineno);

				var customerrecord=salesorder.getFieldValue('entity');


				var locationinternalid=salesorder.getFieldValue('location');

				var LogoValue;
				var LogoText;
				if(locationinternalid != null && locationinternalid != ""){
					var companylist = nlapiLoadRecord('location', locationinternalid);
					LogoValue=companylist.getFieldValue('logo');
					LogoText=companylist.getFieldText('logo');
				}


				nlapiLogExecution('ERROR', 'salesorder,address,ismultilineship,shiptovalue,shiptotext,logo value,logo text',salesorder+","+address+","+ismultilineship+","+shiptovalue+","+shiptotext+","+LogoValue+","+LogoText);
				var filefound='';
				//var filefound = getLoadFile('LOGOCOMP.jpg'); 
				if(LogoText !=null && LogoText !='')
					filefound = getLoadFile(''+LogoText+''); 
				else
					filefound = getLoadFile('LOGOCOMP.jpg');

				if (filefound) 
				{ 

					var imageurl = filefound.getURL();

					var finalimageurl = imageurl;//+';';
					//finalimageurl=finalimageurl+ '&expurl=T;';

					finalimageurl=finalimageurl.replace(/&/g,"&amp;");
					nlapiLogExecution('ERROR','Event,imageurl,imageurl',filefound.getId()+","+imageurl+","+finalimageurl);

				} 
				else 
				{
					nlapiLogExecution('ERROR', 'Event', 'No file;');
				}


				nlapiLogExecution('ERROR', 'customerrecord',customerrecord);
				var entityrecord ;
				if(customerrecord != "" && customerrecord != null)
				{
					entityrecord = nlapiLoadRecord('customer', customerrecord);
				}


				if(address != null && address !="")
					address=address.replace(replaceChar,'');
				else
					address="";

				var	HNo = salesorder.getFieldValue('shipaddr1');
				if(HNo != null && HNo !="")
					HNo=HNo.replace(replaceChar,'');
				else
					HNo="";
				var	addr2 = salesorder.getFieldValue('shipaddr2');
				if(addr2 != null && addr2 !="")
					addr2=addr2.replace(replaceChar,'');
				else
					addr2="";
				nlapiLogExecution('ERROR','addr2',addr2);
				var	city = salesorder.getFieldValue('shipcity');
				if(city != null && city !="")
					city=city.replace(replaceChar,'');
				else
					city="";
				var	state = salesorder.getFieldValue('shipstate');
				if(state != null && state !="")
					state=state.replace(replaceChar,'');
				else
					state="";
				var	country = salesorder.getFieldValue('shipcountry');
				if(country != null && country !="")
					country=country.replace(replaceChar,'');
				else
					country="";
				var	zipcode = salesorder.getFieldValue('shipzip');
				if(zipcode == null || zipcode =="" || zipcode =='null')
					zipcode = '';
				var	carrier = salesorder.getFieldText('shipmethod');
				if(carrier != null && carrier !="")
					carrier=carrier.replace(replaceChar,'');
				var SalesorderNo= salesorder.getFieldValue('tranid');


				if(ismultilineship=='T')
				{
					if(entityrecord!=null && entityrecord!='')
					{
						var custlineitemcount=entityrecord.getLineItemCount('addressbook');
						for(var customerline=1;customerline<=custlineitemcount;customerline++)
						{	
							var custline=parseInt(customerline).toString();
							var customerlabelid = entityrecord.getLineItemValue('addressbook','internalid',custline);
							if(customerlabelid==shiptovalue)
							{

								address = entityrecord.getLineItemValue('addressbook','addressee',custline);
								if(address != null && address !="")
									address=address.replace(replaceChar,'');
								else
									address="";
								HNo= entityrecord.getLineItemValue('addressbook','addr1',custline);
								if(HNo != null && HNo !="")
									HNo=HNo.replace(replaceChar,'');
								else
									HNo="";
								addr2 = entityrecord.getLineItemValue('addressbook','addr2',custline);
								if(addr2 != null && addr2 !="")
									addr2=addr2.replace(replaceChar,'');
								else
									addr2="";

								city = entityrecord.getLineItemValue('addressbook','city',custline);
								if(city != null && city !="")
									city=city.replace(replaceChar,'');
								else
									city="";
								state = entityrecord.getLineItemValue('addressbook','dropdownstate',custline);
								if(state != null && state !="")
									state=state.replace(replaceChar,'');
								else
									state="";
								zipcode = entityrecord.getLineItemValue('addressbook','zip',custline);
								if(zipcode != null && zipcode !="" && zipcode!='null')
									zipcode=zipcode.replace(replaceChar,'');

								if(zipcode == null || zipcode =="" || zipcode =='null')
									zipcode = '';

								country=entityrecord.getLineItemValue('addressbook','country',custline);
								if(country != null && country !="")
									country=country.replace(replaceChar,'');
								else
									country="";
							}
						}
					}
				}

				nlapiLogExecution('ERROR','address,HNo,city,state,country',address+","+HNo+","+city+","+state+","+country);




				if(pageno==0)
				{	
					var strxml = "<table width='100%' >";
					pageno=parseFloat(pageno+1);
				}
				else
				{
					var strxml=strxml+"";
					strxml += "<table width='100%' >";
				}
				var pickedPickRptArr =  new Array();
				//var strxml = "<table width='100%' >";
				var vOpenTaskfilters = new Array();
				if(soNumArray[w] != null && soNumArray[w] != '')
					vOpenTaskfilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soNumArray[w]));

				var vnobjOpenTaskDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_headlevel_pickrptdets',vOpenTaskfilters, null);
				var vTotalOrderWeight = 0;
				var vEDIFlag = "F";
				var pickReportArr =  new Array();
				var strPickRpt = '';
				if(vnobjOpenTaskDetails !=null && vnobjOpenTaskDetails !='' && vnobjOpenTaskDetails.length > 0 && isScheduleScriptinvoked == 'F')
				{
					vEDIFlag = vnobjOpenTaskDetails[0].getValue('custentity_wmsse_asn_required','custrecord_wmsse_customer','group');
					for(var obj=0;obj<vnobjOpenTaskDetails.length;obj++)
					{
						var vOrderLineWt=vnobjOpenTaskDetails[obj].getValue('formulanumeric',null,'sum');
						if(vOrderLineWt == null || vOrderLineWt == '' || vOrderLineWt =='null' || vOrderLineWt =='undefined' || vOrderLineWt =='- None -')
							vOrderLineWt =0;
						vTotalOrderWeight = parseFloat(vTotalOrderWeight) + parseFloat(vOrderLineWt);
						var pickReportNo = vnobjOpenTaskDetails[obj].getValue('custrecord_wmsse_pickreport_no',null,'group');
						if(pickReportArr.indexOf(pickReportNo)==-1)
						{
							pickReportArr.push(pickReportNo);
						}
					}
					nlapiLogExecution('ERROR', 'pickReportArr',pickReportArr.length);


				}
				if(isScheduleScriptinvoked == 'F')
				{
					if(vTotalOrderWeight ==null || vTotalOrderWeight =='' || vTotalOrderWeight =='- None -')
						vTotalOrderWeight ="";
					nlapiLogExecution('ERROR','vTotalOrderWeight,vEDIFlag',vTotalOrderWeight+","+vEDIFlag);

					for(var p1=0;p1<pickReportArr.length;p1++)
					{

						if(p1 > 0)
						{
							var strxml=strxml+"";
							strxml += "<table width='100%' >";
						}
						strxml += "<tr ><td valign='middle' align='left'><img src='" + finalimageurl + "'></img></td><td valign='middle' align='left'  style='font-size:xx-large;'>";
						strxml += "Pick Report ";
						strxml += "</td><td align='right'>&nbsp;<b style='font-size:large;'>Duplicate</b></td></tr></table>";					
						strxml += "<p align='right'>Date/Time:"+Timez+"</p>";
						strxml +="<table style='width:100%;'>";

						var vOpenfilters = new Array();
						var objOpenTaskDetails=new Array();
						var SOLineDetails= nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_getpickreport_details');
						if(soNumArray[w] != null && soNumArray[w] != '')
							SOLineDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soNumArray[w]));
						SOLineDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', pickReportArr[p1]));
						
						var resLenDetails = SOLineDetails.runSearch();					
						
						var resultsPage = resLenDetails.getResults(0, 1000);
						var offset = 0;
						while (!!resultsPage && resultsPage.length > 0) 
						{
							objOpenTaskDetails = objOpenTaskDetails.concat(resultsPage);
							offset += 1000;
							resultsPage = resLenDetails.getResults(offset, offset + 1000);
						}
						
						if(objOpenTaskDetails != null && objOpenTaskDetails != '')
						{	

							if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
							{

								var vnOrderName = objOpenTaskDetails[0].getValue('name');

								vPickGen = objOpenTaskDetails[0].getValue('custrecord_wmsse_pickreport_no');

								strxml +="<tr><td valign='top'>";
								strxml +="<table align='left' style='width:70%;'>";

								strxml +="<tr><td align='left' style='width:51px'>Order # ";

								strxml +="&nbsp;&nbsp;";
								if(vnOrderName != null && vnOrderName != "")
								{
									strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
									strxml += vnOrderName;
									strxml += "\"/>";
								}
								strxml += "</td>";
								strxml +="<td align='left'>Pick Report # ";

								strxml +="&nbsp;&nbsp;";
								if(vPickGen != null && vPickGen != "")
								{
									strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
									strxml += vPickGen;
									strxml += "\"/>";
								}
								strxml += "</td></tr>";

								strxml +="<tr><td align='left' style='width:51px'>Total Order Weight: ";

								strxml +="&nbsp;&nbsp;";
								if(vTotalOrderWeight != null && vTotalOrderWeight != "")
								{					
									strxml += vTotalOrderWeight;
								}
								strxml += "</td>";
								strxml +="<td align='left'>EDI: ";

								strxml +="&nbsp;&nbsp;";
								if(vEDIFlag == "T")
								{
									strxml += 'Yes';
								}
								else
								{
									strxml += 'No';
								}
								strxml += "</td></tr>";

								strxml +="</table><table><tr><td>&nbsp;</td></tr></table>	<table align='right' style='width:70%;'>";
								strxml +="<tr align='right'>";
								strxml +="<td colspan='5' align='right'>";
								strxml +="<table align='right' style='width:40%;' border='1'>";
								strxml +="<tr><td align='right'><b>Ship To</b></td></tr>";
								strxml +="<tr><td align='right' style='width:51px'>Address:</td>";
								if(address != null && address !="" && address!='null')
								{
									address=address.replace(/\&/g,"&amp;");
									address=address.replace(/\"/g,"&quot;");
									address=address.replace(/\'/g,"&apos;");							
									strxml +="<td>"+address+"</td>";
								}
								strxml +="</tr>";
								strxml +="<tr><td style='width:51px'>&nbsp;</td>";
								if(HNo != null && HNo !="" && HNo!='null')
								{
									HNo=HNo.replace(/\&/g,"&amp;");
									HNo=HNo.replace(/\"/g,"&quot;");
									HNo=HNo.replace(/\'/g,"&apos;");
									strxml +="<td>"+HNo+"</td>";
								}
								strxml +="</tr>";
								if(addr2 != null && addr2 != '')
								{	
									strxml +="<tr><td style='width:51px'>&nbsp;</td>";
									addr2=addr2.replace(/\&/g,"&amp;");
									addr2=addr2.replace(/\"/g,"&quot;");
									addr2=addr2.replace(/\'/g,"&apos;");
									strxml +="<td>"+addr2+"</td></tr>";
								}
								strxml +="<tr><td align='right' style='width:51px'>City:</td>";
								strxml +="<td>"+city.replace(replaceChar,'')+"</td></tr>";
								strxml +="<tr><td align='right' style='width:51px'>State:</td>";
								strxml +="<td>"+state.replace(replaceChar,'')+"</td></tr>";
								strxml +="<tr><td align='right' style='width:51px'>Zip:</td>";
								if(zipcode != null && zipcode !="" && zipcode!='null' )// Case# 20147997
									strxml +="<td>"+zipcode.replace(replaceChar,'')+"</td></tr>";
								else
								{
									strxml +="<td>"+zipcode+"</td></tr>";
								}
								strxml +="<tr><td align='right' style='width:51px'>Country:</td>";
								if(country != null && country !="" && country!='null' )// Case# 20147997
									strxml +="<td>"+country.replace(replaceChar,'')+"</td></tr>";			
								else
								{
									strxml +="<td>"+country+"</td></tr>";
								}
								strxml +="</table>";
								strxml +=" <p>&nbsp;</p>";
								strxml +="</td></tr></table>";
								strxml +="</td></tr></table>";

								strxml +="<table  width='100%'>";
								strxml +="<tr style=\"font-weight:bold;background-color:gray;color:white;\">";



								strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
								strxml += "Item ";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";			
								strxml += "Item Description";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='7%' style='border-width: 1px; border-color: #000000'>";
								strxml += "Line #";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";



								strxml += "<td width='5%' style='border-width: 1px; border-color: #000000'>";			
								strxml += "Committed Qty";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='3%' style='border-width: 1px; border-color: #000000'>";			
								strxml += "Units";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='3%' style='border-width: 1px; border-color: #000000'>";			
								strxml += "Weight";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='22%' style='border-width: 1px; border-color: #000000'>";
								strxml += "Bin Location (Qty)";
								strxml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";

								strxml += "<td width='10%' style='border-width: 1px; border-color: #000000'>";			
								strxml += "Ship Via </td>";

								strxml =strxml+  "</tr>";
								for(var j=0;j<objOpenTaskDetails.length;j++)
								{



									var vBinDetails = objOpenTaskDetails[j].getValue('custrecord_wmsse_multi_bins');
									var vnSku = objOpenTaskDetails[j].getText('custrecord_wmsse_sku');
									var vnSkuDesc = objOpenTaskDetails[j].getValue('custrecord_wmsse_skudesc');
									var vnOrder = objOpenTaskDetails[j].getValue('name');
									var vnCommQty = objOpenTaskDetails[j].getValue('custrecord_wmsse_expe_qty');
									var vnCustomer = objOpenTaskDetails[j].getText('custrecord_wmsse_customer');
									var vnShipVia = objOpenTaskDetails[j].getText('custrecord_wmsse_shipmethod');
									var vnLine = objOpenTaskDetails[j].getValue('custrecord_wmsse_line_no');
									var vnUnits = objOpenTaskDetails[j].getValue('custrecord_wmsse_uom');
									var vConversionRate = objOpenTaskDetails[j].getValue('custrecord_wmsse_conversionrate');
									var vItemWeight = objOpenTaskDetails[j].getValue('weight','custrecord_wmsse_sku');
									var vItemWeightUnit = objOpenTaskDetails[j].getText('weightunit','custrecord_wmsse_sku');
									var vTotalItemWeight = objOpenTaskDetails[j].getValue('formulanumeric');
									if(vnUnits == null || vnUnits == '' || vnUnits == '- None -')
										vnUnits = "";



									if(vTotalItemWeight == null || vTotalItemWeight == '' || vTotalItemWeight == '- None -' || vTotalItemWeight == 0)
										vTotalItemWeight = "";

									strxml =strxml+  "<tr>";
									strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
									if(vnSku != null && vnSku != '')
									{

										vnSku=vnSku.replace(/\&/g,"&amp;");
										vnSku=vnSku.replace(/\"/g,"&quot;");
										vnSku=vnSku.replace(/\'/g,"&apos;");
										var index = vnSku.lastIndexOf(':');						
										vnSku = vnSku.substring(index+1);
										vnSku = vnSku.trim();
										strxml += "<barcode codetype=\"code128\" showtext=\"true\" value=\"";
										strxml += vnSku;	

										nlapiLogExecution('ERROR', 'vnSku', vnSku);
										strxml += "\"/>";
									}
									strxml += "</td>";
									strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
									if(vnSkuDesc != null && vnSkuDesc != "")
									{
										vnSkuDesc = vnSkuDesc.replace(/\&/g,"&amp;");
										vnSkuDesc = vnSkuDesc.replace(/\"/g,"&quot;");
										vnSkuDesc = vnSkuDesc.replace(/\'/g,"&apos;");

										strxml += vnSkuDesc;
									}
									strxml += "</td>"; 

									strxml += "<td width='7%' align='right' style='border-width: 1px; border-color: #000000'>";			
									strxml += vnLine;
									strxml += "</td>"; 




									strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
									strxml += vnCommQty;
									strxml += "</td>"; 

									strxml += "<td width='3%' align='left' style='border-width: 1px; border-color: #000000'>";			
									strxml += vnUnits;
									strxml += "</td>"; 

									if(vItemWeightUnit != null && vItemWeightUnit != '')
									{
										strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
										strxml += vTotalItemWeight + "&nbsp;&nbsp;" + vItemWeightUnit;
										strxml += "</td>";
									}
									else
									{
										strxml += "<td width='3%' align='right' style='border-width: 1px; border-color: #000000'>";			
										strxml += vTotalItemWeight;
										strxml += "</td>";
									} 

									strxml += "<td width='22%'   style='border-width: 1px; border-color: #000000; text-align:left'>";

									if(vBinDetails != null && vBinDetails != '')
									{
										vBinDetails=vBinDetails.toString().replace(/\$/g,"<br/>");

										vBinDetails=vBinDetails.toString().replace(/\&/g,"&amp;");
										strxml += vBinDetails.toString();
									}
									strxml += "</td>";

									strxml += "<td width='16%' style='border-width: 1px; border-color: #000000'>";
									if(vnShipVia != null && vnShipVia != "")
										strxml += vnShipVia.replace(replaceChar,'');
									strxml += "</td>";

									strxml =strxml+  "</tr>";




								}	
								if(p1 != (pickReportArr.length)-1)
								{
									strxml =strxml+"</table>";
									pageno=parseFloat(pageno)+1;
									strxml=strxml+ "<p style='page-break-after:always'></p>";
								}
							}

						}
					}
					strxml =strxml+"</table>";

					if((soNumArray.length-w)>1)
					{
						pageno=parseFloat(pageno)+1;
						strxml=strxml+ "<p style='page-break-after:always'></p>";
					}




				}

			}
			if(isScheduleScriptinvoked == 'F')
			{
				strxml =strxml+ "</body></pdf>";
				xml=xml +strxml;
				nlapiLogExecution('ERROR', 'xml', xml.toString());
				var file = nlapiXMLToPDF(xml);	
				var pdffilename = Timez+'_PickReport.pdf';
				response.setContentType('PDF',pdffilename);
				response.write( file.getValue() );
			}else
			{
				var form = nlapiCreateForm('Single order Pick report scheduler');
				var msg = form.addField('custpage_message', 'inlinehtml', null, null, null);
				msg.setLayoutType('outside','startcol');
				var message='Pick report for the selected orders successfully scheduled for generation.';				
				msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Confirmation', '"+message+"', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");

				response.writePage(form);
			}
		}

	}
	else //this is the POST block
	{

	}
}

/**
 * Remove duplicates from an array
 * @param arrayName
 * @returns {Array}
 */
function removeDuplicateElement(arr){
	var dups = {}; 
	return arr.filter(
			function(el) { 
				var hash = el.valueOf(); 
				var isDup = dups[hash]; 
				dups[hash] = true; 
				return !isDup; 
			}
	); 
}
/**
 * This function is used to get the Local Time
 */
function calcTime(offset) {

	//var vtime=new Date();

	//nlapiLogExecution('ERROR', 'TimeOffset', vtime.getTimezoneOffset());

	// create Date object for current location
	var nd = convertDate();

	// convert to msec
	// add local time zone offset 
	// get UTC time in msec
	//utc = d.getTime() + (d.getTimezoneOffset() * 60000);

	// create new Date object for different city
	// using supplied offset
	//nd = new Date(utc + (3600000*offset));

	// return time as a string
	//return "The local time in " + city + " is " + nd.toLocaleString();

	var stringDt=((parseFloat(nd.getMonth()) + 1) + '/' + (parseFloat(nd.getDate())) + '/' + nd.getFullYear());

	var timestamp;
	var a_p = "";

	//Getting time in hh:mm tt format.
	var curr_hour = nd.getHours();
	var curr_min = nd.getMinutes();

	// determining the am/pm indicator
	if (curr_hour < 12)
		a_p = "am";
	else
		a_p = "pm";

	// finalizing hours depending on 24hr clock
	if (curr_hour == 0)
		curr_hour = 12;
	else if(curr_hour > 12)
		curr_hour -= 12;

	if (curr_min.length == 1)
		curr_min = "0" + curr_min;

	//Adding fields to update time zones.
	timestamp = curr_hour + ":" + curr_min + " " + a_p;

	return stringDt + " " + timestamp;


}


/**
 * This function is used to get component items from main item
 */
function  fnGetComponentItemDetails(getItemInternalId,vReqQty,whLocation)
{
	var departments = nlapiGetContext().getFeature('departments');
	var classes = nlapiGetContext().getFeature('classes');

	var filters = new Array(); 

	filters[0] = new nlobjSearchFilter('internalid', null, 'is', getItemInternalId);//kit_id is the parameter name 
	filters[1]=new nlobjSearchFilter('isfulfillable', null, 'is', 'T');
	var columns1 = new Array(); 

	columns1.push(new nlobjSearchColumn('memberitem'));
	columns1.push(new nlobjSearchColumn('memberquantity'));
	columns1.push(new nlobjSearchColumn('custitem_wmsse_itemfamily','memberitem'));
	columns1.push(new nlobjSearchColumn('custitem_wmsse_itemgroup','memberitem'));
	columns1.push(new nlobjSearchColumn('description','memberitem'));
	columns1.push(new nlobjSearchColumn('salesdescription','memberitem'));
	if(departments == true)
		columns1.push(new nlobjSearchColumn('department'));
	if(classes == true)
		columns1.push(new nlobjSearchColumn('class'));
	columns1.push(new nlobjSearchColumn('type','memberitem'));

	var searchresults = nlapiSearchRecord( 'item', null, filters, columns1 );  
	var kititemsarr = new Array();
	for(var q=0; searchresults!=null && q<searchresults.length;q++) 
	{
		var vMemItemType=searchresults[q].getValue('type','memberitem');
		/*if(vMemItemType =='Assembly' || vMemItemType =='InvtPart')
		{*/
		var vSubArr=new Array();
		//vSubArr.push(searchresults[q].getText('memberitem'));
		var vMemItem=searchresults[q].getText('memberitem');
		var vMemItemId=searchresults[q].getValue('memberitem');
		var vMemQty=searchresults[q].getValue('memberquantity');
		var vMemItemFamily=searchresults[q].getValue('custitem_wmsse_itemfamily','memberitem');
		var vMemItemGroup=searchresults[q].getValue('custitem_wmsse_itemgroup','memberitem');
		var vMemItemDesc=searchresults[q].getValue('description','memberitem');
		if(departments == true)
			var vMemItemDepartment=searchresults[q].getValue('department');
		if(classes == true)
			var vMemItemClass=searchresults[q].getValue('class');
		if(vMemItemDesc == null || vMemItemDesc == '' || vMemItemDesc == 'null')
			vMemItemDesc = searchresults[q].getValue('salesdescription','memberitem');
		if(vMemQty == null || vMemQty == '')
			vMemQty=0;
			    
	    var vActQty= Number(Big(vMemQty).mul(vReqQty));
	    nlapiLogExecution('DEBUG', 'vActQty', vActQty);
		  
		// vSubArr.push(searchresults[q].getValue('memberquantity'));
		var getPrefBin = getPrefBinLocation(vMemItemId,whLocation);
		vSubArr.push(vActQty,vMemQty,vMemItem,vMemItemId,vMemItemFamily,vMemItemGroup,vMemItemDesc,getPrefBin,vMemItemDepartment,vMemItemClass);
		kititemsarr.push(vSubArr);
		/*}*/
	}
	filters=null;
	columns1=null;
	searchresults=null;
	vSubArr=null;
	return kititemsarr;
}

function getTimeStamp(){
	var timestamp='';
	var now = new Date();

	//Getting time in hh:mm tt format.
	var curr_hour = now.getHours();
	var curr_min = now.getMinutes();
	var curr_sec = now.getSeconds();
	var curr_day = now.getDate();
	var curr_month = (now.getMonth()) + 1;
	var curr_year = now.getFullYear();
	if (curr_min.length == 1)
		curr_min = "0" + curr_min;

	timestamp = curr_day + "" + curr_month + "" + curr_year + "" + curr_hour + "" + curr_min + "" + curr_sec;

	return timestamp;
}

/**
 * 
 * @param SOIntId
 */
function fnGetDelOldReportDetails(SOIntId,WHLocation)
{

	var filters=new Array();
	if(SOIntId != null && SOIntId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', SOIntId));

	if(WHLocation != null && WHLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', WHLocation));

	filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof',3));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [9,26]));

	var objOldReportResults = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', null, filters, null);
	if(objOldReportResults != null && objOldReportResults != '')
	{
		for(var t=0;t<objOldReportResults.length;t++)
		{
			var vIntid=objOldReportResults[t].getId();

			var id = nlapiDeleteRecord('customrecord_wmsse_trn_opentask', vIntid);
		}	
	}	
}


function fnGetAlreadyPickGenQtyforkit(SOIntId,vLineNo,vSKUId)
{
	var vsolinepickgeneratedQty = 0;
	var openComponentQty = 0;
	var memQty = 0;
	var componentItem = '';


	nlapiLogExecution('ERROR','lineno,itemid',vLineNo+","+vSKUId);
	var otFilters = new Array();
	otFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', SOIntId));
	otFilters.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', parseInt(vLineNo)));
	otFilters.push(new nlobjSearchFilter('custrecord_wmsse_parent_sku_no', null, 'anyof', vSKUId));
	var openKitResults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_kit_opentask_srh', otFilters, null);
	nlapiLogExecution('Error','openKitResults', openKitResults);
	if(openKitResults != null && openKitResults != '')
	{
		openComponentQty = openKitResults[0].getValue('custrecord_wmsse_expe_qty');
		memQty = openKitResults[0].getValue('memberquantity','custrecord_wmsse_parent_sku_no');

		vsolinepickgeneratedQty = Number(Big(openComponentQty).div(memQty));


		nlapiLogExecution('Error','openComponentQty,memQty,vsolinepickgeneratedQty', openComponentQty+','+memQty+','+vsolinepickgeneratedQty);
	}

	return vsolinepickgeneratedQty;
}


function fnGetAlreadyPickGenQty(SOIntId,vLineNo,vSKUId)
{
	var vExpQty = 0;
	var filters=new Array();
	if(SOIntId != null && SOIntId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', SOIntId));


	//filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof',3));
	//filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', 9));

	if(vLineNo != null && vLineNo != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', vLineNo));

	if(vSKUId != null && vSKUId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', vSKUId));
	//var vColumns=new Array();
	//vColumns[0] = new nlobjSearchColumn('custrecord_wmsse_expe_qty',null,'sum');
	var objOldReportResults = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_alreadypickgenqty', filters, null);
	if(objOldReportResults != null && objOldReportResults != '')
	{
		for(var t=0;t<objOldReportResults.length;t++)
		{
			var vExpQty=objOldReportResults[t].getValue('custrecord_wmsse_expe_qty',null,'sum');

			if(vExpQty == null || vExpQty == '')
				vExpQty=0;


		}	
	}
	return vExpQty;
}







