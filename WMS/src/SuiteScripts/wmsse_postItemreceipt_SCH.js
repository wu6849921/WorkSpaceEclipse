
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function PostItemReceipt_SCH(type){
	nlapiLogExecution('Debug', 'Post item receipt scheduler Start', type);
	if ( type == 'ondemand') {
		try
		{

			var context = nlapiGetContext(); 
			var vcuruserId = context.getUser();
			var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
			var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
			var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
			var vLocation = context.getSetting('SCRIPT', 'custscript_wmsse_pir_location');
			
			var isSchdulescriptinvoked = 'F';

			var logMsg = 'getPOid = ' + getPOid + '<br>';	
			logMsg = logMsg + 'tranType = ' + tranType + '<br>';	
			logMsg = logMsg + 'containerID = ' + containerID + '<br>';	

			nlapiLogExecution('ERROR', 'Processing Post item receipt scheduler', logMsg);

			var POfilters=new Array();
			POfilters.push(new nlobjSearchFilter('tranid',null,'is',getPOid));
			POfilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
			POfilters.push(new nlobjSearchFilter('recordtype',null,'is',tranType));


			var POcols=new Array();
//			POcols[0]=new nlobjSearchColumn('status');
//			POcols[1]=new nlobjSearchColumn('location');
//			POcols[2]=new nlobjSearchColumn('recordtype');
//			POcols[3]=new nlobjSearchColumn('internalid');

			var PORec=nlapiSearchRecord('transaction','customsearch_wmsse_transactionid_details',POfilters,null);
			
			if(PORec!=null && PORec!='')
			{
				var poStatus=PORec[0].getValue('status');
				var poid = PORec[0].getValue('internalid');			
				
				var poToLocationID=PORec[0].getValue('location');
				nlapiLogExecution('DEBUG','poToLocation',poToLocationID);
				if(poToLocationID==null || poToLocationID=='')
					poToLocationID=vLocation;
					
				nlapiLogExecution('DEBUG','tranType tstts',tranType);	
				var fields = ['custrecord_wmsse_make_wh_site'];
				var currentUserID = getCurrentUser();
				updateScheduleScriptStatus('post item receipt scheduler',currentUserID,'In Progress',poid,tranType);
			
				if(poStatus=='pendingReceipt'|| poStatus=='partiallyReceived' || poStatus=='pendingRefundPartReceived' || poStatus=='pendingBillPartReceived'|| poStatus=='pendingReceiptPartFulfilled' || poStatus=='Pending Refund/Partially Received')
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
						try
						{
							var finalID = nswms_PostItemReceiptNew(tranType,poid,poToLocationID,getPOid,useitemcostflag);
						}
						catch(e)
						{

							makeSchduleTaskInactive(currentUserID,'post item receipt scheduler',poid);
							var errStr = '';  
							if (e instanceof nlobjError) 
							{	
								errStr = e.getDetails();
								
							}
							else
							{
								errStr = e.toString();
							}
							

						}
					}
					else
					{
						var opentaskSearchResults=getopentaskresultsforIRPosting(poid,containerID,-1,'','',vLocation);
					

						if(opentaskSearchResults!=null && opentaskSearchResults!='' && opentaskSearchResults.length>0)
						{
							
							//var trecord = nlapiTransformRecord(tranType, poid, 'itemreceipt');
							
							var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
							
							var trecord = '';
							if(crossSubsidiaryFeature == true && tranType=='returnauthorization')
							{
								
								var subs = getSubsidiaryNew(vLocation);								
								trecord = nlapiTransformRecord(tranType, poid, 'itemreceipt',{'orderinvtsub' : subs});
							}
							else
							{
								trecord = nlapiTransformRecord(tranType, poid, 'itemreceipt');
							}
							
							
							for(var i=0;i<opentaskSearchResults.length;i++)
							{
								if(context.getRemainingUsage()<= 500 )
								{

									setRecoveryPoint();
									var state = nlapiYieldScript();
									if( state.status == 'FAILURE')
									{
										var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
										var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
										var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
										var param = new Array();
										param['custscript_wmsse_pir_poid'] = getPOid;											
										param['custscript_wmsse_pir_trantype'] =  tranType ;
										param['custscript_wmsse_pir_container'] =  containerID ;
										param['custscript_wmsse_pir_location'] =  vLocation ;
										nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
										isSchdulescriptinvoked = 'T';

									}
									else if ( state.status == 'RESUME' )
									{
										nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
									}
								}
								if(isSchdulescriptinvoked == 'F')
								{
									var actQuantity=opentaskSearchResults[i][2];
									var linenum=opentaskSearchResults[i][0];
									var	itemid=opentaskSearchResults[i][1];
									var	batchno=opentaskSearchResults[i][4];								
									var	expiryDate=opentaskSearchResults[i][5];
									var	enterBin=opentaskSearchResults[i][3];
									var	serialArray=opentaskSearchResults[i][6];
									generateItemReceipt(trecord,actQuantity,linenum,itemid,tranType,batchno,expiryDate,poToLocationID,enterBin,serialArray,
											opentaskSearchResults,tranType,poid);
								}

							}
							if(isSchdulescriptinvoked == 'F')
							{
								if(trecord != null && trecord != '')
								{
									idl = nlapiSubmitRecord(trecord);
								}
								nlapiLogExecution('ERROR','idl',idl);
								if(idl!=null && idl!='')
								{					

									for(var j=0;j<opentaskSearchResults.length;j++)
									{
										if(context.getRemainingUsage()<= 500 )
										{

											setRecoveryPoint();
											var state = nlapiYieldScript();
											if( state.status == 'FAILURE')
											{
												var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
												var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
												var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
												var param = new Array();
												param['custscript_wmsse_pir_poid'] = getPOid;											
												param['custscript_wmsse_pir_trantype'] =  tranType ;
												param['custscript_wmsse_pir_container'] =  containerID ;
												nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
												isSchdulescriptinvoked = 'T';

											}
											else if ( state.status == 'RESUME' )
											{
												nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
											}
										}
										if(isSchdulescriptinvoked == 'F')
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
									}



								}
							}

						}

					}

				}
				var currentUserID = getCurrentUser();
				updateScheduleScriptStatus('post item receipt scheduler',currentUserID,'Completed',poid,tranType);


			}

		}
		catch(e)
		{
			makeSchduleTaskInactive(currentUserID,'post item receipt scheduler',poid);
			if ( e instanceof nlobjError )
			{

				nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
			}
			else
			{

				nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
			}


		}
		finally 
		{					

		}

	}
}

function setRecoveryPoint()
{
	var state = nlapiSetRecoveryPoint(); 
	if( state.status == 'SUCCESS' ) return;  
	if( state.status == 'RESUME' ) 
	{
		nlapiLogExecution("ERROR", "Resuming script because of " + state.reason+".  Size = "+ state.size);

	}
	else if ( state.status == 'FAILURE' )  
	{
		nlapiLogExecution("ERROR","Failed to create recovery point. Reason = "+state.reason + " / Size = "+ state.size);

	}


}
function generateItemReceipt(trecord,ActQuantity,linenum,itemid,trantype,batchno,expiryDate,templocation,enterBin,serialArray,opentaskSearchResults,
		tranType,poid)
{
	try {
		var context = nlapiGetContext();
		var vcuruserId = context.getUser();
		var compSubRecord=null;
		var polinelength = trecord.getLineItemCount('item');
		

		var idl;
		var vAdvBinManagement=true;
		var whLocation='';
		var isSchdulescriptinvoked = 'F';
		var tempSerial = "";		
		var commitflag = 'N';
		for (var j = 1; j <= polinelength; j++) {

			if(context.getRemainingUsage()<= 500 )
			{

				setRecoveryPoint();
				var state = nlapiYieldScript();
				if( state.status == 'FAILURE')
				{
					var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
					var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
					var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
					var vLocation = context.getSetting('SCRIPT', 'custscript_wmsse_pir_location');
					var param = new Array();
					param['custscript_wmsse_pir_poid'] = getPOid;											
					param['custscript_wmsse_pir_trantype'] =  tranType ;
					param['custscript_wmsse_pir_container'] =  containerID ;
					param['custscript_wmsse_pir_location'] =  vLocation ;
					nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
					isSchdulescriptinvoked = 'T';

				}
				else if ( state.status == 'RESUME' )
				{
					nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
				}
			}


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
						//totallineQty = parseFloat(totallineQty)+parseFloat(actlineQuantity);
						totallineQty = Number((Big(totallineQty).plus(actlineQuantity)).toFixed(5));
						
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
				trecord.setCurrentLineItemValue('item', 'quantity', totallineQty);
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
					//columnssertemp1[1] = new nlobjSearchColumn('name');
					var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,null);
					if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
					{	
						
						
							for (var j3 = 0; j3 < SrchRecordTmpSerial1.length; j3++) {
								if(context.getRemainingUsage()<= 500 )
								{

									setRecoveryPoint();
									var state = nlapiYieldScript();
									if( state.status == 'FAILURE')
									{
										var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
										var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
										var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
										var param = new Array();
										param['custscript_wmsse_pir_poid'] = getPOid;											
										param['custscript_wmsse_pir_trantype'] =  tranType ;
										param['custscript_wmsse_pir_container'] =  containerID ;
										nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
										isSchdulescriptinvoked = 'T';

									}
									else if ( state.status == 'RESUME' )
									{
										nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
									}
								}
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
								if(vInvStatus_select!=null && vInvStatus_select!="" && vInvStatus_select!='null' && vInvStatus_select!='undefined' && tranType!="transferorder")
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInvStatus_select);
								compSubRecord.commitLineItem('inventoryassignment');

							}
						}

					}
					else if (Itype == "inventoryitem" || Itype == "assemblyitem") {	

						for(var r1=0;r1<opentaskSearchResults.length;r1++)
						{

							var opentaskLinenumber=opentaskSearchResults[r1][0];
							if(opentaskLinenumber == linenum)
							{
								var opentaskQuantity=opentaskSearchResults[r1][2];
								var opentaskBin=opentaskSearchResults[r1][3];
								var	vInvStatus_select=opentaskSearchResults[r1][9];
								
								
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
			nlapiLogExecution('DEBUG', 'commitflag is N', commitflag);
			trecord.selectLineItem('item', j);
			trecord.setCurrentLineItemValue('item', 'itemreceive', 'F');
			trecord.commitLineItem('item');
		}
	}
	catch(exp)
	{
		makeSchduleTaskInactive(vcuruserId,'post item receipt scheduler',poid);

		if (exp instanceof nlobjError) 
			nlapiLogExecution('ERROR', 'system error', exp.getCode() + '\n' + exp.getDetails());
		else 
			nlapiLogExecution('ERROR', 'unexpected error', exp.toString());

	}	
}


//To post Item receipts for transfer order when Use Item cost as Transfer cost flag is enabled
function nswms_PostItemReceiptNew(trantype,toInternalId,whLocation,poname,useitemcostflag)
{
	var logMsg = 'trantype = ' + trantype + '<br>';	
	logMsg = logMsg + 'toInternalId = ' + toInternalId + '<br>';	
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';	
	logMsg = logMsg + 'poname = ' + poname + '<br>';
	logMsg = logMsg + 'useitemcostflag = ' + useitemcostflag + '<br>';
	nlapiLogExecution('Debug', 'Processing nswms_PostItemReceipt', logMsg);
	var context = nlapiGetContext();
	var vcuruserId = context.getUser();
	var idl="";
	var vCurrCompRecLine=0;
	var itemindex=1;
	var isSchdulescriptinvoked = 'F';

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
				if(context.getRemainingUsage()<= 500 )
				{

					setRecoveryPoint();
					var state = nlapiYieldScript();
					if( state.status == 'FAILURE')
					{
						var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
						var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
						var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
						var param = new Array();
						param['custscript_wmsse_pir_poid'] = getPOid;											
						param['custscript_wmsse_pir_trantype'] =  tranType ;
						param['custscript_wmsse_pir_container'] =  containerID ;
						nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
						isSchdulescriptinvoked = 'T';

					}
					else if ( state.status == 'RESUME' )
					{
						nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
					}
				}
				
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
				makeSchduleTaskInactive(vcuruserId,'post item receipt scheduler',toInternalId);
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
				if(context.getRemainingUsage()<= 500 )
				{

					setRecoveryPoint();
					var state = nlapiYieldScript();
					if( state.status == 'FAILURE')
					{
						var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
						var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
						var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
						var param = new Array();
						param['custscript_wmsse_pir_poid'] = getPOid;											
						param['custscript_wmsse_pir_trantype'] =  tranType ;
						param['custscript_wmsse_pir_container'] =  containerID ;
						nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
						isSchdulescriptinvoked = 'T';

					}
					else if ( state.status == 'RESUME' )
					{
						nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
					}
				}
				
				vitemfulfillmentid = TOLineDetails[d];
				var openTaskIdArr = new Array();
				

				if(vitemfulfillmentid!=null && vitemfulfillmentid!= 'null' && vitemfulfillmentid!= undefined && vitemfulfillmentid != '')
				{
					trecord = nlapiTransformRecord(trantype, toInternalId, 'itemreceipt',{'itemfulfillment' : vitemfulfillmentid});
					

					var tolinelength = trecord.getLineItemCount('item');
				
					for (var j = 0; j < tolinelength; j++)
					{
						if(context.getRemainingUsage()<= 500 )
						{

							setRecoveryPoint();
							var state = nlapiYieldScript();
							if( state.status == 'FAILURE')
							{
								var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
								var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
								var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
								var param = new Array();
								param['custscript_wmsse_pir_poid'] = getPOid;											
								param['custscript_wmsse_pir_trantype'] =  tranType ;
								param['custscript_wmsse_pir_container'] =  containerID ;
								nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
								isSchdulescriptinvoked = 'T';

							}
							else if ( state.status == 'RESUME' )
							{
								nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
							}
						}
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
								if(context.getRemainingUsage()<= 500 )
								{

									setRecoveryPoint();
									var state = nlapiYieldScript();
									if( state.status == 'FAILURE')
									{
										var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
										var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
										var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
										var param = new Array();
										param['custscript_wmsse_pir_poid'] = getPOid;											
										param['custscript_wmsse_pir_trantype'] =  tranType ;
										param['custscript_wmsse_pir_container'] =  containerID ;
										nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
										isSchdulescriptinvoked = 'T';

									}
									else if ( state.status == 'RESUME' )
									{
										nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
									}
								}

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

								
									trecord.selectLineItem('item', itemindex);
									trecord.setCurrentLineItemValue('item', 'itemreceive', 'T');


									if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") 
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
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', enterQty);
											
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
											if(enterBin!=null && enterBin!="" && enterBin!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
										
											if(expiryDate!=null && expiryDate!="" && expiryDate!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'expirationdate', expiryDate);

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

											var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
											
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
											if(itemStatus != null && itemStatus != '' && itemStatus != undefined)
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', itemStatus);
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
											//columnssertemp1[1] = new nlobjSearchColumn('name');
											var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,null);
											if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
											{
												
												var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
												
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
												if(context.getRemainingUsage()<= 500 )
												{

													setRecoveryPoint();
													var state = nlapiYieldScript();
													if( state.status == 'FAILURE')
													{
														var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
														var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
														var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
														var param = new Array();
														param['custscript_wmsse_pir_poid'] = getPOid;											
														param['custscript_wmsse_pir_trantype'] =  tranType ;
														param['custscript_wmsse_pir_container'] =  containerID ;
														nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
														isSchdulescriptinvoked = 'T';

													}
													else if ( state.status == 'RESUME' )
													{
														nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
													}
												}
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
													compSubRecord.commitLineItem('inventoryassignment');
												}

											}
											compSubRecord.commit();
											
											for (var j1 = 0; j1 < SrchRecordTmpSerial1.length; j1++) {
												if(context.getRemainingUsage()<= 500 )
												{

													setRecoveryPoint();
													var state = nlapiYieldScript();
													if( state.status == 'FAILURE')
													{
														var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
														var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
														var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
														var param = new Array();
														param['custscript_wmsse_pir_poid'] = getPOid;											
														param['custscript_wmsse_pir_trantype'] =  tranType ;
														param['custscript_wmsse_pir_container'] =  containerID ;
														nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
														isSchdulescriptinvoked = 'T';

													}
													else if ( state.status == 'RESUME' )
													{
														nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
													}
												}
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
										trecord.commitLineItem('item');
									}
									if(itemStatus == null || itemStatus == '')
										trecord.commitLineItem('item');
								}
							}
						}
					}
					if(trecord != null && trecord != '')
						idl = nlapiSubmitRecord(trecord);	
					

					if(idl != null && idl != '')
					{

						nlapiLogExecution('Debug', 'openTaskIdArr',openTaskIdArr);
						for(var q=0; q<openTaskIdArr.length;q++)
						{
							if(context.getRemainingUsage()<= 500 )
							{

								setRecoveryPoint();
								var state = nlapiYieldScript();
								if( state.status == 'FAILURE')
								{
									var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
									var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
									var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
									var param = new Array();
									param['custscript_wmsse_pir_poid'] = getPOid;											
									param['custscript_wmsse_pir_trantype'] =  tranType ;
									param['custscript_wmsse_pir_container'] =  containerID ;
									nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
									isSchdulescriptinvoked = 'T';

								}
								else if ( state.status == 'RESUME' )
								{
									nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
								}
							}
							var vid = openTaskIdArr[q];							
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
				makeSchduleTaskInactive(vcuruserId,'post item receipt scheduler',toInternalId);
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
	var context = nlapiGetContext();
	if(context.getRemainingUsage()<= 500 )
	{

		setRecoveryPoint();
		var state = nlapiYieldScript();
		if( state.status == 'FAILURE')
		{
			var getPOid=context.getSetting('SCRIPT', 'custscript_wmsse_pir_poid');
			var tranType = context.getSetting('SCRIPT', 'custscript_wmsse_pir_trantype');
			var containerID = context.getSetting('SCRIPT', 'custscript_wmsse_pir_container');
			var param = new Array();
			param['custscript_wmsse_pir_poid'] = getPOid;											
			param['custscript_wmsse_pir_trantype'] =  tranType ;
			param['custscript_wmsse_pir_container'] =  containerID ;
			param['custscript_wmsse_pir_location'] =  vLocation ;
			nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
			isSchdulescriptinvoked = 'T';

		}
		else if ( state.status == 'RESUME' )
		{
			nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
		}
	}
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
function setRecoveryPoint()
{
	var state = nlapiSetRecoveryPoint(); 
	nlapiLogExecution("Audit",'state status',state.status);
	if( state.status == 'SUCCESS' ) return;  //we successfully create a new recovery point
	if( state.status == 'RESUME' ) //a recovery point was previously set, we are resuming due to some unforeseen error
	{
		nlapiLogExecution("Audit", "Resuming script because of " + state.reason+".  Size = "+ state.size);

	}
	else if ( state.status == 'FAILURE' )  //we failed to create a new recovery point
	{
		nlapiLogExecution("Audit","Failed to create recovery point. Reason = "+state.reason + " / Size = "+ state.size);

	}
}
function makeSchduleTaskInactive(curuserId,processname,transactionrefno)
{
	var filter=new Array();
	if(curuserId!=null && curuserId!='')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsinitiatedby',null,'anyof',curuserId));	
	filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname',null,'is',processname));
	filter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',null,'is',transactionrefno));

	var column=new Array();
	column[0]=new nlobjSearchColumn('custrecord_wmsse_schprsname');
	column[1]=new nlobjSearchColumn('id').setSort();

	var searchresult=nlapiSearchRecord('customrecord_wmsse_schscripts_status',null,filter,column);
	if(searchresult!=null && searchresult!='')
	{
		for(var cs=0;cs<searchresult.length;cs++)
		{
			var vid=searchresult[cs].getId();
			nlapiLogExecution("error",' making scheduler task record inactive :vid',vid);
			var fields = new Array();
			var values = new Array();

			fields[0] = 'isinactive';
			values[0] = 'T';
			

			nlapiSubmitField('customrecord_wmsse_schscripts_status', vid, fields, values);
		}
	}
}
