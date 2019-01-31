/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function PostItemReceipt(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	var vConfig=nlapiLoadConfiguration('accountingpreferences');
	var itemcostruleValue=vConfig.getFieldValue('ITEMCOSTASTRNFRORDCOST');

	if (request.getMethod() == 'GET') {

		var form = nlapiCreateForm('Post Item Receipt');
		//form.setScript('customscript_wmsse_postitemreceipt_cl');
		var soField = form.addField('custpage_order', 'text', 'Transaction #');
		var OrderType = form.addField('custpage_ordertype', 'select', 'Transaction Type');
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
		
		
		//Setting location value as default if the subsidiary have only one location.
		if(vRolebasedLocation.length==1)
		{
			whLocation.setDefaultValue(vRolebasedLocation[0]);	
		}
	
		var Container = form.addField('custpage_container', 'text', 'Container #').setDisplayType('hidden');

		//	var msgVar = form.addField('custpage_tempnew', 'text', 'msg').setDisplayType('hidden');
		//msgVar.setDefaultValue('');
		OrderType.addSelectOption("","");
		OrderType.addSelectOption("purchaseorder","Purchase Order");
		OrderType.addSelectOption("transferorder","Transfer Order");
		OrderType.addSelectOption("returnauthorization","RMA");



		form.addField('processtype', 'radio', 'Post Item Receipt', 'pir');
		form.addField('processtype', 'radio','Close Container','cc').setDisplayType('hidden');;
		form.addField('processtype', 'radio','Close And Post Item Receipt','cpir').setDisplayType('hidden');;

		if(request.getParameter('custpage_ordertype')!='' && request.getParameter('custpage_ordertype')!=null)
		{
			OrderType.setDefaultValue(request.getParameter('custpage_ordertype'));	
		}
		if(request.getParameter('custpage_container')!='' && request.getParameter('custpage_container')!=null)
		{
			Container.setDefaultValue(request.getParameter('custpage_container'));	
		}

		if(request.getParameter('processtype')!='' && request.getParameter('processtype')!=null)
		{
			form.getField('processtype', request.getParameter('processtype') ).setDefaultValue( request.getParameter('processtype') );
		}
		else
		{
			form.getField('processtype', 'pir' ).setDefaultValue( 'pir' );
		}
		form.addSubmitButton('Submit');
		response.writePage(form);
	}
	else {
		
		
		var form = nlapiCreateForm('Post Item Receipt');
		form.addSubmitButton('Submit');
		var vPoNumArray=new Array();
		var vContainerID;
		//form.setScript('customscript_wmsse_postitemreceipt_cl');
		var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');		  
		var soField = form.addField('custpage_order', 'text', 'Transaction #');
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
		var Container = form.addField('custpage_container', 'text', 'Container #').setDisplayType('hidden');
		var OrderType = form.addField('custpage_ordertype', 'select', 'Transaction Type');

		form.addField('processtype', 'radio', 'Post Item Receipt', 'pir').setLayoutType('startrow');
		form.addField('processtype', 'radio','Close Container','cc').setDisplayType('hidden');
		form.addField('processtype', 'radio','Close And Post Item Receipt','cpir').setDisplayType('hidden');

		//	var msgVar = form.addField('custpage_tempnew', 'text', 'msg').setDisplayType('hidden');
		OrderType.addSelectOption("","");
		OrderType.addSelectOption("purchaseorder","Purchase Order");
		OrderType.addSelectOption("transferorder","Transfer Order");
		OrderType.addSelectOption("returnauthorization","RMA");
		if(request.getParameter('custpage_ordertype')!='' && request.getParameter('custpage_ordertype')!=null)
		{
			OrderType.setDefaultValue(request.getParameter('custpage_ordertype'));	
		}
		if(request.getParameter('custpage_order')!='' && request.getParameter('custpage_order')!=null)
		{
			soField.setDefaultValue(request.getParameter('custpage_order'));	
			vPoNumArray.push(request.getParameter('custpage_order'));
		}
		if(request.getParameter('custpage_container')!='' && request.getParameter('custpage_container')!=null)
		{
			Container.setDefaultValue(request.getParameter('custpage_container'));	
		}

		if(request.getParameter('processtype')!='' && request.getParameter('processtype')!=null)
		{
			form.getField('processtype', request.getParameter('processtype') ).setDefaultValue( request.getParameter('processtype') );
		}
		else
		{
			form.getField('processtype', 'pir' ).setDefaultValue( 'pir' );
		}
		//form.addSubmitButton('Submit');
		/*
		var msgVariable=  request.getParameter('custpage_tempnew');

		nlapiLogExecution('ERROR','msgVariable',msgVariable);*/


		var processType= request.getParameter('processtype');

		if(processType != null && processType != 'null' && processType != '' && processType != 'undefined' && (processType == 'cc' ||  processType == 'cpir') && (request.getParameter('custpage_container')==null || request.getParameter('custpage_container') == '' || request.getParameter('custpage_container') == 'null') )
		{

			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'Please enter Container #', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
			response.writePage(form);
			return;
		}

		if(processType != null && processType != 'null' && processType != '' && processType != 'undefined' && (processType == 'cc' ||  processType == 'cpir')  )
		{
			vValidContainer=validateContainerNum(request.getParameter('custpage_container'));
			if(vValidContainer == null || vValidContainer == '')
			{
				nlapiLogExecution('ERROR','Please enter valid conatiner#');
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'Please enter valid conatiner#', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
				response.writePage(form);
				return;
			}	
			else
			{
				vContainerID = vValidContainer[0].getId();
			}
			//var vContainerDeatils = getConatinerDetails(request.getParameter('custpage_container'));
			var vContainerDeatils = getConatinerDetails(vContainerID);
			
			if(processType=='cpir')
			{	


				if(vContainerDeatils !=null && vContainerDeatils!='' && vContainerDeatils!='null')
				{
					nlapiLogExecution('DEBUG','vContainerDeatils length',vContainerDeatils.length);

					for(var f=0;f<vContainerDeatils.length;f++)
					{
						var po = vContainerDeatils[f].getText('custrecord_wmsse_order_no');
						nlapiLogExecution('ERROR','po',po);
						var pono = po.split('#');
						var ponum = pono[1];
						if(vPoNumArray.indexOf(ponum) == -1)
							vPoNumArray.push(ponum);
					}
				}

			}

			//var vContainerID=vValidContainer[0].getId();
			if(vContainerID != null && vContainerID != '')
			{
				
				var submitRecordId=nlapiSubmitField('customrecord_wmsse_trailer', vContainerID, 'custrecord_wmsse_trlstatus', 1);				

				var filters=new Array();
				if(vContainerID != null && vContainerID != '')
					filters.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber', null, 'anyof', vContainerID));



				var objTrlLineResults = new nlapiSearchRecord('customrecord_wmsse_trailerline', null, filters, null);

				if(objTrlLineResults != null && objTrlLineResults != '')
				{	
					for(var i=0;i<objTrlLineResults.length;i++)
					{	

						var submitRecordId=nlapiSubmitField('customrecord_wmsse_trailerline', objTrlLineResults[i].getId(), 'custrecord_wmsse_trllinetransstatus', 1);
						
					}
				}

				/*var message="Container# " +getContainerNo +" has been closed successfully";
				nlapiLogExecution('ERROR', 'message', message);
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+message+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");*/
				//response.writePage(form);
			}

		}


		var POarray = new Array();
		POarray["custpage_order"]=request.getParameter('custpage_order');
		POarray["custpage_ordertype"]=request.getParameter('custpage_ordertype');

		var	st0 = "Please enter Transaction #";
		var	st1 = "Please enter valid Transaction # "; 
		//case no 201410336
		var	st2 = "Confirmation:Item Receipt posted successfully";

		var	st6=  "Confirmation:Item Receipt posting has been initiated successfully";



		try
		{

			var getPOid=request.getParameter('custpage_order');
			var vLocation=request.getParameter('custpage_qbwhlocation');
			var tranType =request.getParameter('custpage_ordertype');		
			var PORecinternalids = null;

			if(request.getParameter('custpage_order')==null || request.getParameter('custpage_order') == '' || request.getParameter('custpage_order') == 'null')
			{

				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'Please enter transaction number', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
				response.writePage(form);
				return;
			}

			if(vPoNumArray != null && vPoNumArray !='null' && vPoNumArray != '' && vPoNumArray != 'undefined' && vPoNumArray.length > 0)
			{


				if(request.getParameter('custpage_ordertype')==null || request.getParameter('custpage_ordertype') == '' || request.getParameter('custpage_ordertype') == 'null' || request.getParameter('custpage_ordertype') == 'undefined')	
				{

					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'Please select transaction type', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
					response.writePage(form);
					return;

				}

				var isSchdulescriptinvoked ='F';
				for(var j1=0;j1<vPoNumArray.length ;j1++)
				{
					var getPOid = vPoNumArray[j1];				
					
					POarray["custparam_trantype"] = tranType;
					var POfilters=new Array();
					POfilters.push(new nlobjSearchFilter('tranid',null,'is',getPOid));
					POfilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
					POfilters.push(new nlobjSearchFilter('recordtype',null,'is',tranType));
					var POcols=new Array();
					
					var PORec=nlapiSearchRecord('transaction','customsearch_wmsse_transactionid_details',POfilters,null);
					if(PORec!=null&&PORec!='')
					{
						var  poid = PORec[0].getValue('internalid');
						var poStatus=PORec[0].getValue('status');
					
						var poToLocationID=PORec[0].getValue('location');
						
						
						if(poToLocationID==null || poToLocationID=='')
							poToLocationID=vLocation

						if(poToLocationID != null && poToLocationID != '' && poToLocationID != 'null' && poToLocationID != 'undefined')
						{
							var fields = ['custrecord_wmsse_make_wh_site'];
							var locationcolumns = nlapiLookupField('Location', poToLocationID, fields);
							var Tomwhsiteflag = locationcolumns.custrecord_wmsse_make_wh_site;
							nlapiLogExecution('DEBUG','Tomwhsiteflag',Tomwhsiteflag);
						}
						if(poStatus=='pendingReceipt'||poStatus=='partiallyReceived' ||poStatus=='pendingBillPartReceived'||poStatus=='pendingReceiptPartFulfilled' ||poStatus=='pendingRefundPartReceived')
						{
							var filter=new Array();
							var curuserId = getCurrentUser();

							filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname',null,'is','post item receipt scheduler'));
							filter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',null,'is',poid));
							filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
							var column=new Array();
							column[0]=new nlobjSearchColumn('custrecord_wmsse_schprsstatus');
							var searchresult=nlapiSearchRecord('customrecord_wmsse_schscripts_status',null,filter,column);
							var status = '';
							if(searchresult!=null && searchresult!='')
							{
								status = searchresult[0].getValue('custrecord_wmsse_schprsstatus');
							}
							nlapiLogExecution('DEBUG','schedule script status',status);	
							if(status != '' && status != 'Completed')
							{
								msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation', 'Already Schedule script has been initiated for this order. ', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
								response.writePage(form);
							}
							else
							{

								var useitemcostflag = '';
								if(tranType=="transferorder")
								{
									var transferordervalues=nlapiLoadRecord('transferorder', poid);
									useitemcostflag=transferordervalues.getFieldValue('useitemcostastransfercost');
									if(useitemcostflag == null || useitemcostflag == '' || useitemcostflag == 'null')
									{
										useitemcostflag = itemcostruleValue;
									}
								}
								if(tranType=="transferorder" && useitemcostflag == 'T')
								{
									var opentaskSearchResultsAll=getopentaskresultsforIRPosting(poid,null,-1,null,null);
									if(opentaskSearchResultsAll != null  && opentaskSearchResultsAll != '' && opentaskSearchResultsAll != 'null' && opentaskSearchResultsAll != 'undefined' && opentaskSearchResultsAll.length > 50)
									{


										var param = new Array();
										param['custscript_wmsse_pir_poid'] = getPOid;											
										param['custscript_wmsse_pir_trantype'] =  tranType ;
										param['custscript_wmsse_pir_container'] =  vContainerID ;
										param['custscript_wmsse_pir_location'] =  vLocation ;
										nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
										isSchdulescriptinvoked = 'T';

										var currentUserID = getCurrentUser();
										updateScheduleScriptStatus('post item receipt scheduler',currentUserID,'Submitted',poid,tranType);

									}
									if(isSchdulescriptinvoked == 'F')
									{
										try
										{
											var finalID = nswms_PostItemReceiptNew(tranType,poid,poToLocationID,getPOid,useitemcostflag);
											msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation','Item Receipt posted successfully ', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
											response.writePage(form);
										}
										catch(e)
										{
											var errStr = '';  
											if (e instanceof nlobjError) 
											{	
												errStr = e.getDetails();
												nlapiLogExecution('ERROR', 'into if',errStr);
											}
											else
											{
												errStr = e.toString();
											}
											nlapiLogExecution('ERROR', 'exception in fulfillment details',errStr);
											msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+errStr+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
											response.writePage(form);
										}
									}
									else
									{
										msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation', 'Schedule script has been initiated for this order. ', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
										response.writePage(form);
									}
								}
								else
								{

									var opentaskSearchResults=getopentaskresultsforIRPosting(poid,vContainerID,-1,'','',vLocation);

									

									if(opentaskSearchResults != null  && opentaskSearchResults != '' && opentaskSearchResults != 'null' && opentaskSearchResults != 'undefined' && opentaskSearchResults.length > 50)
									{

										var param = new Array();
										param['custscript_wmsse_pir_poid'] = getPOid;											
										param['custscript_wmsse_pir_trantype'] =  tranType ;
										param['custscript_wmsse_pir_container'] =  vContainerID ;
										param['custscript_wmsse_pir_location'] =  vLocation ;
										nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
										isSchdulescriptinvoked = 'T';
										var currentUserID = getCurrentUser();
										updateScheduleScriptStatus('post item receipt scheduler',currentUserID,'Submitted',poid,tranType);


									}

									if(opentaskSearchResults!=null && opentaskSearchResults!='' && opentaskSearchResults.length>0 && isSchdulescriptinvoked == 'F')
									{
																			
										
										var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
										
										var trecord = '';
										////Transforming RMA for IntercompanySubsidiary.
										if(crossSubsidiaryFeature == true && tranType=='returnauthorization')
										{
											
											var subs = getSubsidiaryNew(vLocation);
											
											trecord = nlapiTransformRecord(tranType, poid, 'itemreceipt',{'orderinvtsub' : subs});
										}
										else
										{
											trecord = nlapiTransformRecord(tranType, poid, 'itemreceipt');
										}
										
										
										var prossedLinesArr =  new Array();
										for(var i=0;i<opentaskSearchResults.length;i++)
										{

											var linenum=opentaskSearchResults[i][0];
											if(prossedLinesArr.indexOf(linenum)==-1)
											{
												prossedLinesArr.push(linenum);
												var actQuantity=opentaskSearchResults[i][2];
												var	itemid=opentaskSearchResults[i][1];
												var	batchno=opentaskSearchResults[i][4];								
												var	expiryDate=opentaskSearchResults[i][5];
												var	enterBin=opentaskSearchResults[i][3];
												var	serialArray=opentaskSearchResults[i][6];
												generateItemReceipt(trecord,actQuantity,linenum,itemid,tranType,batchno,expiryDate,poToLocationID,enterBin,
														serialArray,opentaskSearchResults,tranType,poid);

											}
										}
										if(trecord != null && trecord != '')
										{
											idl = nlapiSubmitRecord(trecord);
										}
										nlapiLogExecution('ERROR','idl',idl);
										if(idl!=null && idl!='')
										{									 

											for(var j=0;j<opentaskSearchResults.length;j++)
											{
												var opentaskId =opentaskSearchResults[j][7];
												var fields = new Array();
												var values = new Array();

												fields[0] = 'custrecord_wmsse_nsconfirm_ref_no';
												fields[1] = 'name';
												values[0] = idl;
												values[1] = opentaskId;
												nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskId, fields, values);
											}

											if(vContainerID != null && vContainerID != '')
											{
												var filters=new Array();

												filters.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber', null, 'anyof', vContainerID));
												if(poid != null && poid != '')
													filters.push(new nlobjSearchFilter('custrecord_wmsse_trllinepono', null, 'anyof', poid));


										var objTrlLineResults = new nlapiSearchRecord('customrecord_wmsse_trailerline', null, filters, null);

										if(objTrlLineResults != null && objTrlLineResults != '')
										{	
											for(var i=0;i<objTrlLineResults.length;i++)
											{	

														var submitRecordId=nlapiSubmitField('customrecord_wmsse_trailerline', objTrlLineResults[i].getId(), 'custrecord_wmsse_trllineitemreceipt', idl);
														nlapiLogExecution('DEBUG', 'submitRecordId', submitRecordId);
													}
												}
											}

											if(j1 == (vPoNumArray.length-1) )
											{
												msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation','Item Receipt posted successfully', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
												response.writePage(form);
											}


										}
										else{
											msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
											response.writePage(form);
										}
									}
									else
									{
										if(isSchdulescriptinvoked == 'T')
										{
											msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confiration', 'Schedule script has been initiated for this order. ', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
											response.writePage(form);
										}
										else
										{
											msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
											response.writePage(form);
										}
									}


								}
							}
						}
						else
						{
							if(poStatus=='pendingBilling' || poStatus == 'received')
							{
								st1 = "Item receipt already posted  for this Transaction # "+getPOid+" ";

							}
							nlapiLogExecution('ERROR','opentaskSearchResults 3',st1);
							msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
							response.writePage(form);
						}
					}
					else
					{
						nlapiLogExecution('ERROR','opentaskSearchResults 4');
						msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
						response.writePage(form);
					}
				}
			}
			else
			{
				nlapiLogExecution('ERROR','opentaskSearchResults 5');
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
				response.writePage(form);
			}

			response.writePage(form);

		}
		catch (e)  {


			nlapiLogExecution('ERROR', 'exception in postitemreceipt in catch',e);
			var exeptionvalue=e.getDetails();
			nlapiLogExecution('ERROR', 'exception in postitemreceipt in catch',exeptionvalue);
			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+exeptionvalue+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
			response.writePage(form);
			return;

		} 
		finally {					
			nlapiLogExecution('DEBUG', 'finally','block');				
		}


	}
}


function generateItemReceipt(trecord,ActQuantity,linenum,itemid,trantype,batchno,expiryDate,templocation,enterBin,serialArray,opentaskSearchResults,
		tranType,poid)
{
	try {

		var compSubRecord=null;
		var polinelength = trecord.getLineItemCount('item');
		nlapiLogExecution('DEBUG', "polinelength", polinelength);

		var idl;
		var vAdvBinManagement=true;
		var whLocation='';

		var tempSerial = "";		
		var commitflag = 'N';
		for (var j = 1; j <= polinelength; j++) {


			var item_id = trecord.getLineItemValue('item', 'item', j);
			var itemrec = trecord.getLineItemValue('item', 'itemreceive', j);
			var itemLineNo = trecord.getLineItemValue('item', 'line', j);			
			var quantity = '0';
			quantity = ActQuantity;



			var inventorytransfer="";

			if (itemLineNo == linenum) {

				var totallineQty=0;
				for(var r=0;r<opentaskSearchResults.length;r++)
				{

					var opentaskLinenum=opentaskSearchResults[r][0];
					if(opentaskLinenum == linenum)
					{
						var actlineQuantity=opentaskSearchResults[r][2];
											
						totallineQty = Big(totallineQty).plus(actlineQuantity); 
						
					}
				}

				whLocation=trecord.getLineItemValue('item', 'location', j);//value
				if(whLocation==null||whLocation=="")
					whLocation=templocation;
				commitflag = 'Y';

				var fields = ['recordType'];
				var columns = nlapiLookupField('item', itemid, fields);
				if(columns != null && columns != '')
				{
					Itype = columns.recordType;	

				}

				trecord.selectLineItem('item', j);
				trecord.setCurrentLineItemValue('item', 'itemreceive', 'T');
				//trecord.setCurrentLineItemValue('item', 'quantity', parseFloat(totallineQty));
				trecord.setCurrentLineItemValue('item', 'quantity', Number(Big(totallineQty)).toFixed(5));
				trecord.setCurrentLineItemValue('item', 'location', whLocation);


				if (Itype == "serializedinventoryitem" || Itype == "serializedassemblyitem" || Itype == "lotnumberedinventoryitem" || Itype=="lotnumberedassemblyitem" || Itype == "inventoryitem" || Itype == "assemblyitem") 
				{

					var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
					
					if(compSubRecord=='' || compSubRecord==null)
					{
						
						compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
						
					}						

					var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
					if(parseInt(complinelength)>0)
					{
						for(var r1=1;r1<=complinelength;r1++)
						{ 
							compSubRecord.removeLineItem('inventoryassignment', 1);
						}
					}

				}

				if ((Itype == "serializedinventoryitem" || Itype == "serializedassemblyitem" )) {		




					for(var r3=0;r3<opentaskSearchResults.length;r3++)
					{

						var opentaskLinenumber=opentaskSearchResults[r3][0];											

						if(opentaskLinenumber == linenum)
						{
							var opentaskQuantity=opentaskSearchResults[r3][2];
							var opentaskBin=opentaskSearchResults[r3][3];
							var	opentaskserialArray=opentaskSearchResults[r3][6];
							var	vInvStatus_select=opentaskSearchResults[r3][9];
							
							var totalSerialArray=opentaskserialArray.split(',');
						
							for (var k1 = 0; k1 < totalSerialArray.length; k1++) {
								compSubRecord.selectNewLineItem('inventoryassignment');
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', totalSerialArray[k1]);
								if(enterBin!=null && enterBin!="" && enterBin!='null')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', opentaskBin);
								if(vInvStatus_select!=null && vInvStatus_select!="" && vInvStatus_select!='null' && vInvStatus_select!='undefined' && tranType!="transferorder")
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInvStatus_select);
								compSubRecord.commitLineItem('inventoryassignment');
							}
						}

					}

					var filterssertemp1 = new Array();
					var serialArray='';
					filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');					
					filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseFloat(linenum));					
					filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', poid);
					var columnssertemp1 = new Array();
					//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
				//	columnssertemp1[1] = new nlobjSearchColumn('name');
					var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,null);
					if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
					{					
						
							for (var j3 = 0; j3 < SrchRecordTmpSerial1.length; j3++) {
								var TempRecord=SrchRecordTmpSerial1[j3];
								var vid = TempRecord.getId();
								
								var fields = new Array();
								var values = new Array();

								fields[0] = 'custrecord_wmsse_ser_note1';
								values[0] = 'because of serial number is updated in opentask we have marked this serial number as closed';
								fields[1] = 'custrecord_wmsse_ser_status';
								values[1] = 'T';

								nlapiSubmitField('customrecord_wmsse_serialentry', vid, fields, values);							
								
							}
							
						
						
					}



				}							
				else 
					if ((Itype == "lotnumberedinventoryitem" || Itype=="lotnumberedassemblyitem")) {
						for(var r2=0;r2<opentaskSearchResults.length;r2++)
						{

							var opentaskLinenumber=opentaskSearchResults[r2][0];

							if(opentaskLinenumber == linenum)
							{
								var opentaskQuantity=opentaskSearchResults[r2][2];
								var opentaskBin=opentaskSearchResults[r2][3];
								var	opentaskBatchno=opentaskSearchResults[r2][4];								
								var	opentaskExpiryDate=opentaskSearchResults[r2][5];
								var	vInvStatus_select=opentaskSearchResults[r2][9];
								var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
								compSubRecord.selectNewLineItem('inventoryassignment');
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', opentaskQuantity);
								if(enterBin!=null && enterBin!="" && enterBin!='null')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', opentaskBin);
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', opentaskBatchno);		
								if(opentaskExpiryDate!=null && opentaskExpiryDate!="" && opentaskExpiryDate!='null')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'expirationdate', opentaskExpiryDate);
								if(vInvStatus_select!=null && vInvStatus_select!="" && vInvStatus_select!='null' && vInvStatus_select!='undefined'  && tranType!="transferorder")
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInvStatus_select);
								compSubRecord.commitLineItem('inventoryassignment');

							}
						}

					}
					else if (Itype == "inventoryitem"  || Itype == "assemblyitem") {

						for(var r1=0;r1<opentaskSearchResults.length;r1++)
						{

							var opentaskLinenumber=opentaskSearchResults[r1][0];
							if(opentaskLinenumber == linenum)
							{
								var opentaskQuantity=opentaskSearchResults[r1][2];
								var opentaskBin=opentaskSearchResults[r1][3];
								var vInvStatus_select=opentaskSearchResults[r1][9];
								compSubRecord.selectNewLineItem('inventoryassignment');						
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', opentaskQuantity);
								if(enterBin!=null && enterBin!="" && enterBin!='null')
								{
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', opentaskBin);
								}
								if(vInvStatus_select!=null && vInvStatus_select!="" && vInvStatus_select!='null' && vInvStatus_select!='undefined' && tranType!="transferorder")
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInvStatus_select);
								compSubRecord.commitLineItem('inventoryassignment');
							}
						}
					}
					else
					{

					}
				if(trecord!=null  && trecord!='')
				{
					nlapiLogExecution('ERROR', " committing linenum(Task)", linenum);

					if(compSubRecord!=null)
						compSubRecord.commit();
					trecord.commitLineItem('item');

					break;
				}
			}


		}
		if (commitflag == 'N' && trecord != null && trecord != '') {
			nlapiLogExecution('ERROR', 'commitflag is N', commitflag);
			trecord.selectLineItem('item', j);
			trecord.setCurrentLineItemValue('item', 'itemreceive', 'F');
			trecord.commitLineItem('item');
		}
	}
	catch(exp)
	{

		if (exp instanceof nlobjError) 
			nlapiLogExecution('ERROR', 'system error', exp.getCode() + '\n' + exp.getDetails());
		else 
			nlapiLogExecution('ERROR', 'unexpected error', exp.toString());

	}	
}


function submitForm()
{
	alert('hi');
	//NLDoMainFormButtonAction("submitter",true);
}
function validateContainerNum(containernumber)
{
	var filters = new Array();	
	if(containernumber!=null && containernumber!='' && containernumber!='null' && containernumber!='undefined')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_appointmenttrailer', null, 'is', containernumber));
	/*if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sitetrailer', null, 'anyof', whLocation));*/
	filters.push(new nlobjSearchFilter('custrecord_wmsse_trlstatus', null, 'noneof', '4'));//Not 4=closed

	var vcolumns = new Array();
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_appointmenttrailer'));	
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_sitetrailer'));

	var ContainerDetails = nlapiSearchRecord('customrecord_wmsse_trailer',null, filters, vcolumns);
	return ContainerDetails;
}

function getConatinerDetails(containernumber)
{
	var inboundcontainrfilters = new Array();
	if(containernumber!=null && containernumber!='' && containernumber!='null' && containernumber!='undefined')
		inboundcontainrfilters.push(new nlobjSearchFilter('custrecord_wmsse_inboundcontainer', null, 'is', containernumber));
	/*if(Orderinternalid!=null && Orderinternalid!='')
		inboundcontainrfilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', Orderinternalid));*/
	inboundcontainrfilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [3]));
	inboundcontainrfilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));

	var inboundcolumns=new Array();
	inboundcolumns[0]=new nlobjSearchColumn('name');
	inboundcolumns[1]=new nlobjSearchColumn('custrecord_wmsse_order_no');	

	var containeropentaskSearchResults=nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,inboundcontainrfilters,inboundcolumns);
	return containeropentaskSearchResults;

}

function nswms_PostItemReceiptNew(trantype,toInternalId,whLocation,poname,useitemcostflag)
{
	var logMsg = 'trantype = ' + trantype + '<br>';	
	logMsg = logMsg + 'toInternalId = ' + toInternalId + '<br>';	
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';	
	logMsg = logMsg + 'poname = ' + poname + '<br>';
	logMsg = logMsg + 'useitemcostflag = ' + useitemcostflag + '<br>';
	nlapiLogExecution('Debug', 'Processing nswms_PostItemReceipt', logMsg);

	var idl="";
	var vCurrCompRecLine=0;
	var itemindex=1;

	var lineFullQty=0;
	var filters = new Array();
	var trecord = '';
	if(toInternalId!=null && toInternalId!= 'null' && toInternalId!= undefined && toInternalId != '')
		filters.push(new nlobjSearchFilter('internalid', null, 'is',toInternalId));
	filters.push(new nlobjSearchFilter('formulatext', null, 'is', 'Shipping').setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'TrnfrOrd'));

	var TOLineDetailsNew = new nlapiSearchRecord('transferorder','customsearch_wmsse_transf_fulfill_detail',filters,null);
	

	var vitemfulfillmentid = '';

	if(TOLineDetailsNew!=null && TOLineDetailsNew!= 'null' && TOLineDetailsNew!= undefined && TOLineDetailsNew != ''&& TOLineDetailsNew.length>0)
	{
		var TOLineDetails = new Array();
		
		var remainingqty=0;
		for (var d = 0; d < TOLineDetailsNew.length; d++)
		{
			try
			{
				
				vitemfulfillmentid = TOLineDetailsNew[d].getValue('internalid','fulfillingTransaction','group');
				
				vitemfulfillmentitemid = TOLineDetailsNew[d].getValue('item','fulfillingTransaction','group');
				
				vitemfulfillmentqty = TOLineDetailsNew[d].getValue('quantity','fulfillingTransaction','sum');
				

				if(vitemfulfillmentid!=null && vitemfulfillmentid!= 'null' && vitemfulfillmentid!= undefined && vitemfulfillmentid != '' && TOLineDetails.indexOf(parseInt(vitemfulfillmentid)) == -1)
				{
					TOLineDetails.push(parseInt(vitemfulfillmentid));
				}
			}
			catch(e)
			{
				nlapiLogExecution('ERROR', 'exception in fulfillment details');
			}
		}
	}
	var vitemfulfillmentid = '';
	//var qtyEntered = enterQty;
	if(TOLineDetails!=null && TOLineDetails!= 'null' && TOLineDetails!= undefined && TOLineDetails != ''&& TOLineDetails.length>0)
	{
		
		var remainingqty=0;

		for (var d = 0; d < TOLineDetails.length; d++)
		{
			try
			{
				
				vitemfulfillmentid = TOLineDetails[d];
				var openTaskIdArr = new Array();
				

				if(vitemfulfillmentid!=null && vitemfulfillmentid!= 'null' && vitemfulfillmentid!= undefined && vitemfulfillmentid != '')
				{
					trecord = nlapiTransformRecord(trantype, toInternalId, 'itemreceipt',{'itemfulfillment' : vitemfulfillmentid});
					

					var tolinelength = trecord.getLineItemCount('item');
				
					for (var j = 0; j < tolinelength; j++)
					{
						var item_id = trecord.getLineItemValue('item', 'item', j+1);
						var itemrec = trecord.getLineItemValue('item', 'itemreceive', j+1);
						var itemLineNo = trecord.getLineItemValue('item', 'line', j+1);
						var itemQuantity = trecord.getLineItemValue('item', 'quantity', j+1);

						var opentaskSearchResults=getopentaskresultsforIRPosting(toInternalId,null,-1,item_id,itemLineNo);
						

						if(opentaskSearchResults!=null && opentaskSearchResults!='' && opentaskSearchResults.length>0)
						{
							var totalLineQty = 0;
							for(var tempItr = 0; tempItr < opentaskSearchResults.length; tempItr++)
							{
								var enterQty = opentaskSearchResults[tempItr][2];
								var toLineno = opentaskSearchResults[tempItr][0];
								
								if(parseFloat(toLineno) == parseFloat(itemLineNo))
									totalLineQty = Big(totalLineQty).plus(enterQty);
								
															
							}
						
							for(var t=0; t<opentaskSearchResults.length;t++)
							{
								var enterQty = opentaskSearchResults[t][2];
								var toLineno = opentaskSearchResults[t][0];
								var enterBin = opentaskSearchResults[t][3];
								var batchno = opentaskSearchResults[t][4];
								var expiryDate = opentaskSearchResults[t][5];
								var FetchedItemId = opentaskSearchResults[t][1];
								var whLocation = opentaskSearchResults[t][8];
								var itemStatus = opentaskSearchResults[t][9];
								
								var itemType = '';
								var fields = ['recordType'];
								var columns = nlapiLookupField('item', FetchedItemId, fields);
								if(columns != null && columns != '')
								{
									itemType = columns.recordType;	

								}								
								var enterQty1 =0;
								if ((parseInt(itemLineNo) ==  parseInt(toLineno)) && ((parseFloat(itemQuantity) == parseFloat(enterQty)) || (parseFloat(itemQuantity) == parseFloat(totalLineQty))))
								{
									openTaskIdArr.push(opentaskSearchResults[t][7]);
									itemindex=j+1;								
									enterQty1 = parseFloat(itemQuantity);

									nlapiLogExecution('DEBUG', 'opentaskSearchResults.length', opentaskSearchResults.length);
								
									trecord.selectLineItem('item', itemindex);
									trecord.setCurrentLineItemValue('item', 'itemreceive', 'T');


									if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") 
									{			

										if(itemStatus != null && itemStatus != '')
										{
											var frecord = nlapiLoadRecord('itemfulfillment', vitemfulfillmentid);
											frecord.selectLineItem('item',itemindex);
											var fulfillSubRecord = frecord.viewCurrentLineItemSubrecord('item','inventorydetail');

											var polinelength =0;
												
											if(fulfillSubRecord!=null && fulfillSubRecord!=''&& fulfillSubRecord!='null')
											polinelength = fulfillSubRecord.getLineItemCount('inventoryassignment');
											
											var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
											nlapiLogExecution('DEBUG', 'compSubRecord', compSubRecord);
											if(compSubRecord=='' || compSubRecord==null)
											{

												compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');

												var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

												if(parseInt(complinelength)>0)
												{
													for(var r1=1;r1<=complinelength;r1++)
													{ 
														compSubRecord.removeLineItem('inventoryassignment', 1);
													}
												}
											}
											
											compSubRecord.selectNewLineItem('inventoryassignment');
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', enterQty);

											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
											if(enterBin!=null && enterBin!="" && enterBin!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

											if(expiryDate!=null && expiryDate!="" && expiryDate!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'expirationdate', expiryDate);

											if(itemStatus != null && itemStatus != '' && itemStatus != undefined)
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', itemStatus);

											compSubRecord.commitLineItem('inventoryassignment');
											if(t+1 == polinelength)
											{
												
												compSubRecord.commit();
												trecord.commitLineItem('item');
												break;
											}

										}
										else
										{
											var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
											nlapiLogExecution('DEBUG', 'compSubRecord', compSubRecord);
											if(compSubRecord=='' || compSubRecord==null)
											{

												compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');

												var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

												if(parseInt(complinelength)>0)
												{
													for(var r1=1;r1<=complinelength;r1++)
													{ 
														compSubRecord.removeLineItem('inventoryassignment', 1);
													}
												}
											}

											compSubRecord.selectNewLineItem('inventoryassignment');
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', enterQty1);

											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
											if(enterBin!=null && enterBin!="" && enterBin!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

											if(expiryDate!=null && expiryDate!="" && expiryDate!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'expirationdate', expiryDate);


											compSubRecord.commitLineItem('inventoryassignment');
											compSubRecord.commit();

										}
									}
									else if (itemType == "inventoryitem" || itemType == "assemblyitem")
									{
										
										if(itemStatus != null && itemStatus != '')
										{
											var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
											nlapiLogExecution('DEBUG', 'compSubRecord', compSubRecord);
											if(compSubRecord=='' || compSubRecord==null)
											{
												
												compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
												
												var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
												
												if(parseInt(complinelength)>0)
												{
													for(var r1=1;r1<=complinelength;r1++)
													{ 
														compSubRecord.removeLineItem('inventoryassignment', 1);
													}
												}
											}

											compSubRecord.selectNewLineItem('inventoryassignment');
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', enterQty1);

											if(enterBin!=null && enterBin!="" && enterBin!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

											if(itemStatus != null && itemStatus != '' && itemStatus != undefined)
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', itemStatus);

											compSubRecord.commitLineItem('inventoryassignment');
											if(t == (opentaskSearchResults.length - 1))
											{
												compSubRecord.commit();
												trecord.commitLineItem('item');
											}
											
										}
										else
										{
											var compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
											var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

											

										if(parseInt(complinelength)>0 && parseInt(complinelength)-parseInt(vCurrCompRecLine)>0)
											compSubRecord.selectLineItem('inventoryassignment',parseInt(vCurrCompRecLine)+1);
										else
											compSubRecord.selectNewLineItem('inventoryassignment');
										vCurrCompRecLine=parseInt(vCurrCompRecLine)+1;
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', enterQty1);

											if(enterBin!=null && enterBin!="" && enterBin!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

											compSubRecord.commitLineItem('inventoryassignment');
											compSubRecord.commit();
										}
									}
									else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") 
									{
										if(itemStatus != null && itemStatus != '')
										{
											var filterssertemp1 = new Array();

										filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
										filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseFloat(toLineno));										
										filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', toInternalId);
										var columnssertemp1 = new Array();
										//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
									//	columnssertemp1[1] = new nlobjSearchColumn('name');
										var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,null);
										if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
										{
											
											var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
											nlapiLogExecution('DEBUG', 'compSubRecord', compSubRecord);
											if(compSubRecord=='' || compSubRecord==null)
											{
												
												compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
												
												var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
												
												if(parseInt(complinelength)>0)
												{
													for(var r2=1;r2<=complinelength;r2++)
													{ 
														compSubRecord.removeLineItem('inventoryassignment', 1);
													}
												}
											}


											var transerresultvalues = new Array();
											var tranfilter = new Array();
											
											if(toInternalId !=null && toInternalId != 'null' && toInternalId != undefined && toInternalId != '')
												tranfilter.push(new nlobjSearchFilter('internalid', null, 'is',toInternalId));
											
											tranfilter.push(new nlobjSearchFilter('item',null, 'is',FetchedItemId));
											

											var fline = (parseFloat(toLineno)-1);
											
											tranfilter.push(new nlobjSearchFilter('line',null, 'equalto',fline));											

											var tranlotresults = nlapiSearchRecord('transferorder','customsearch_wmsse_transf_ful_lot_detail',tranfilter,null);											
											nlapiLogExecution('DEBUG', 'tranlotresults', tranlotresults);

											for(var z = 0; z < tranlotresults.length; z++)
											{
												var seritemfulfillmentid = tranlotresults[z].getValue('internalid','fulfillingTransaction','group');

												if(seritemfulfillmentid == vitemfulfillmentid)
													transerresultvalues.push(tranlotresults[z].getValue('serialnumber','fulfillingTransaction','group')); 
											}
											
											if(transerresultvalues != null && transerresultvalues != 'null' && transerresultvalues != '' && transerresultvalues.length > 0)
											{
												for (var n = 0; n < transerresultvalues.length; n++) {												

														compSubRecord.selectNewLineItem('inventoryassignment');
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', transerresultvalues[n]);
														if(enterBin!=null && enterBin!="" && enterBin!='null')
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

														if(itemStatus != null && itemStatus != '' && itemStatus != undefined)
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', itemStatus);

														compSubRecord.commitLineItem('inventoryassignment');
													}

											}
											compSubRecord.commit();
											
											for (var j1 = 0; j1 < SrchRecordTmpSerial1.length; j1++) {
												var TempRecord=SrchRecordTmpSerial1[j1];
												
												var vid = TempRecord.getId();												
												var fields = new Array();
												var values = new Array();

												fields[0] = 'customrecord_wmsse_serialentry';

												values[0] = idl;
												fields[1]='name';
												fields[2]='custrecord_wmsse_ser_note1';
												fields[3]='custrecord_wmsse_ser_status';
												values[1] = TempRecord.getValue('name');
												values[2]='because of item receipt posted for serial number  we have marked this serial number as closed';
												values[3]='T';
												nlapiSubmitField('customrecord_wmsse_serialentry', vid, fields, values);

												}
											}

											trecord.commitLineItem('item');

										}
										else
										{
											var filterssertemp1 = new Array();

											filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
											filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseFloat(toLineno));										
											filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', toInternalId);
											var columnssertemp1 = new Array();
											//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
											//columnssertemp1[1] = new nlobjSearchColumn('name');
											var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,null);
											if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
											{
												
												var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
												nlapiLogExecution('DEBUG', 'compSubRecord', compSubRecord);
												if(compSubRecord=='' || compSubRecord==null)
												{
													
													compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
													
													var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
													
													if(parseInt(complinelength)>0)
													{
														for(var r2=1;r2<=complinelength;r2++)
														{ 
															compSubRecord.removeLineItem('inventoryassignment', 1);
														}
													}
												}


												var transerresultvalues = new Array();
												var tranfilter = new Array();
												
												if(toInternalId !=null && toInternalId != 'null' && toInternalId != undefined && toInternalId != '')
													tranfilter.push(new nlobjSearchFilter('internalid', null, 'is',toInternalId));
												
												tranfilter.push(new nlobjSearchFilter('item',null, 'is',FetchedItemId));
												

												var fline = (parseFloat(toLineno)-1);
												
												tranfilter.push(new nlobjSearchFilter('line',null, 'equalto',fline));											

												var tranlotresults = nlapiSearchRecord('transferorder','customsearch_wmsse_transf_ful_lot_detail',tranfilter,null);											
												

												for(var z = 0; z < tranlotresults.length; z++)
												{
													var seritemfulfillmentid = tranlotresults[z].getValue('internalid','fulfillingTransaction','group');

													if(seritemfulfillmentid == vitemfulfillmentid)
														transerresultvalues.push(tranlotresults[z].getValue('serialnumber','fulfillingTransaction','group')); 
												}
												
												if(transerresultvalues != null && transerresultvalues != 'null' && transerresultvalues != '' && transerresultvalues.length > 0)
												{
													for (var n = 0; n < transerresultvalues.length; n++) 
													{												

														compSubRecord.selectNewLineItem('inventoryassignment');
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', transerresultvalues[n]);
														if(enterBin!=null && enterBin!="" && enterBin!='null')
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

														compSubRecord.commitLineItem('inventoryassignment');
													}

												}
												compSubRecord.commit();
												
												for (var j1 = 0; j1 < SrchRecordTmpSerial1.length; j1++) 
												{
													var TempRecord=SrchRecordTmpSerial1[j1];
													
													var vid = TempRecord.getId();
													
													var fields = new Array();
													var values = new Array();

													fields[0] = 'customrecord_wmsse_serialentry';

													values[0] = idl;
													fields[1]='name';
													fields[2]='custrecord_wmsse_ser_note1';
													fields[3]='custrecord_wmsse_ser_status';
													values[1] = TempRecord.getValue('name');
													values[2]='because of item receipt posted for serial number  we have marked this serial number as closed';
													values[3]='T';
													nlapiSubmitField('customrecord_wmsse_serialentry', vid, fields, values);

												}
											}


										}
									}
									if(itemStatus == null || itemStatus == '')
										trecord.commitLineItem('item');
									
								}
							}
						}
					}
					if(trecord != null && trecord != '')
						idl = nlapiSubmitRecord(trecord);	
					nlapiLogExecution('ERROR', 'Item Receipt Id',idl);


					if(idl != null && idl != '')
					{
						
						for(var q=0; q<openTaskIdArr.length;q++)
						{
							var vid = openTaskIdArr[q];
							nlapiLogExecution('ERROR', 'vid',vid);
							var fields = new Array();
							var values = new Array();

							fields[0] = 'custrecord_wmsse_nsconfirm_ref_no';

							values[0] = idl;

							nlapiSubmitField('customrecord_wmsse_trn_opentask', vid, fields, values);
						}
					}
				}
			}
			catch(e)
			{
				var errStr = '';  
				if (e instanceof nlobjError) 
				{	
					errStr = e.getDetails();
					nlapiLogExecution('ERROR', 'into if',errStr);
				}
				else
				{
					errStr = e.toString();
				}
				nlapiLogExecution('ERROR', 'exception in fulfillment details',errStr);
			}
		}					
	}

	return idl;
}

function getopentaskresultsforIRPosting(poid,containerID,maxNo,item_id,itemLineNo,vLocation)
{		
	var searchresultsArr = new Array();
	var result=nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_postitemreceipt_srch');
	if(poid!= null && poid!= '')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no',null, 'anyof', poid));

	if(containerID != null && containerID != '')
	{
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_inboundcontainer', null, 'anyof',containerID));
	}
	if(maxNo != -1)
	{
		result.addFilter(new nlobjSearchFilter('internalid', null,'greaterthan', parseInt(maxNo)));
	}

	if(item_id !=null && item_id != 'null' && item_id != undefined && item_id != '')
	{
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', item_id));
	}
	if(itemLineNo !=null && itemLineNo != 'null' && itemLineNo != undefined && itemLineNo != '')
	{
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', itemLineNo));
	}
	
	if(vLocation !=null && vLocation != 'null' && vLocation != undefined && vLocation != '')
	{
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', vLocation));
	}
	result.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));
	var resLen = result.runSearch();
	var q=0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		q++;
		var actQuantity=searchResult.getValue('custrecord_wmsse_act_qty');
		var linenum=searchResult.getValue('custrecord_wmsse_line_no');
		var	itemid=searchResult.getValue('custrecord_wmsse_sku');
		var	batchno=searchResult.getValue('custrecord_wmsse_batch_num');								
		var	expiryDate=searchResult.getValue('custrecord_wmsse_expirydate');
		var	enterBin=searchResult.getValue('custrecord_wmsse_actendloc');
		var	serial=searchResult.getValue('custrecord_wmsse_serial_no');
		var	wmsLocation=searchResult.getValue('custrecord_wmsse_act_wms_location');
		var	vInvStatus_select=searchResult.getValue('custrecord_wmsse_inventorystatus');
		var opentaskId = searchResult.getId();
		var serailNum='';
		if(serial != null && serial != '' && serial != 'null' && serial != 'undefined')
		{
			var serialArray = new Array();
			serailArray = serial.split(',');
			if(serialArray.length > 1)
			{
				for(var s=0;s<serialArray.length;s++)
				{
					if (s==0)
					{
						serailNum = serialArray[s] ;
					}
					else
					{
						serailNum = serailNum +"^"+ serialArray[s] ;
					}
				}
			}
			else
			{
				serailNum = serial;
			}
		}
		var currRow = [linenum,itemid,actQuantity,enterBin,batchno,expiryDate,serailNum,opentaskId,wmsLocation,vInvStatus_select];
		searchresultsArr.push(currRow);
		if(q==4000)
		{			
			getopentaskresultsforIRPosting(poid,containerID,opentaskId,item_id,itemLineNo,vLocation);
			return false;
		}
		return true;               
			});

	return searchresultsArr;
}

