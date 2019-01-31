/**
 * Script Description
 * This User event script is used to change the status of order to Shipped.  It triggers on shipmanifest custom record
 */ 
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * This function is used to update tracking number in ship manifestSE record type
 * @param 
 * @returns {}
 */ 
function AfterShipmanifestTrackingnoUpdateUESE(type)
{
	if(type=='create')
	{
		nlapiLogExecution('ERROR', 'Into Create');
		var vorderno="";
		var vcontainerlp="";
		var vcarrier ='';

		var newRecord = nlapiGetNewRecord();
		vcarrier =nlapiGetFieldValue('custrecord_wmsse_ship_carrier');
		var nsConfirmationNumber =nlapiGetFieldValue('custrecord_wmsse_ship_nsconf_no');		
		nlapiLogExecution('ERROR', 'nsConfirmationNumber ', nsConfirmationNumber);
		if(nsConfirmationNumber ==null || nsConfirmationNumber =='' || nsConfirmationNumber=='undefined' || nsConfirmationNumber==undefined)
		{

			nlapiLogExecution('ERROR', 'vorderno ', vorderno);
			nlapiLogExecution('ERROR', 'vcarrier ', vcarrier);
			if(vcarrier=="LTL")
			{
				nlapiLogExecution('ERROR', 'Into LTL');

				try{
					var vorderno =nlapiGetFieldValue('custrecord_wmsse_ship_order');

					vcontainerlp =nlapiGetFieldValue('custrecord_wmsse_ship_contlp');

					if(vorderno!="" && vorderno!=null)
					{
						var trackingno;
						var shipcharges;
						var pakageweight;
						var paymethodtype;
						
						var custom5=newRecord.getFieldValue('custrecord_wmsse_ship_custom5');
						paymethodtype = newRecord.getFieldValue('custrecord_wmsse_ship_paymethod');
						var shipref5=newRecord.getFieldValue('custrecord_wmsse_ship_ref5');	
						

						trackingno = nlapiGetFieldValue('custrecord_wmsse_ship_trackno');
						shipcharges =nlapiGetFieldValue('custrecord_wmsse_ship_charges');
						pakageweight=nlapiGetFieldValue('custrecord_wmsse_ship_actwght');

						var filters = new Array();
						var columns= new Array();
						var opentasksearchresults=new Array();

						var opentaskshipsearchresults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_shiptaskupdate');
						var filters = new Array();

						opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null,'is',vorderno));
						opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
						opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'isnotempty'));

						var columns= new Array();

						var resLenDetails = opentaskshipsearchresults.runSearch();


						var resultsPage = resLenDetails.getResults(0, 1000);
						var offset = 0;
						while (!!resultsPage && resultsPage.length > 0) 
						{
							opentasksearchresults = opentasksearchresults.concat(resultsPage);
							offset += 1000;
							resultsPage = resLenDetails.getResults(offset, offset + 1000);
						}


						nlapiLogExecution('ERROR', 'trackingno2', trackingno);
						nlapiLogExecution('ERROR', 'pakageweight2', pakageweight);
						nlapiLogExecution('ERROR', 'shipcharges2 ', shipcharges);

						if(opentasksearchresults !=null)
						{					
							transactionid=opentasksearchresults[0].getValue('custrecord_wmsse_nsconfirm_ref_no');
							nlapiLogExecution('ERROR', 'transactionidtransactionidtransactionid ', transactionid);
							if(transactionid!=null && transactionid!="")
							{
								var OpenTaskTransaction = nlapiLoadRecord('itemfulfillment', transactionid);
								OpenTaskTransaction.setFieldValue('shipstatus','C'); //Statusflag='C'
								var lastcharges =OpenTaskTransaction.getFieldValue('shippingcost');
								nlapiLogExecution('ERROR', 'shipcharges ', lastcharges);
								if(shipcharges==null || shipcharges=='')
									shipcharges='0.0';
								if(lastcharges==null || lastcharges=='')
									lastcharges='0.0'
								var totalshipcharges=Number(Big(lastcharges).plus(shipcharges));
								OpenTaskTransaction.setFieldValue('custbody_wmsse_fulfill_shipcost',totalshipcharges);
								OpenTaskTransaction.selectNewLineItem('package');
								OpenTaskTransaction.setCurrentLineItemValue('package', 'packagedescr', vcontainerlp);
								OpenTaskTransaction.setCurrentLineItemValue('package', 'packagetrackingnumber', trackingno);
								OpenTaskTransaction.setCurrentLineItemValue('package', 'packageweight',pakageweight);
								OpenTaskTransaction.commitLineItem('package');
								var id= nlapiSubmitRecord(OpenTaskTransaction ,true);
								nlapiLogExecution('ERROR', 'After open task submit record ', id);
								// Case # 20127782 starts code for updating nsconfirmation number
								if(id!=null && id!='')
								{	
									var internalidrecord=newRecord.getId();
									nlapiLogExecution('ERROR', 'UpdateShipManifestRecord# ', 'UpdateShipManifestRecord# ');
									nlapiLogExecution('ERROR', 'internalidrecord# ', internalidrecord);
									fnUpdateShipManifestRecord(id,internalidrecord);
								}
								OpenTaskTransaction=null;
							}
							opentasksearchresults=null;
						}
						filters=null;
						columns=null;
					}
				}
				catch(exp) {

					var exceptionname='SalesOrder';
					var functionality='ShipManifest Update';
					var trantype=2;
					nlapiLogExecution('ERROR', 'DetailsError', functionality);	
					nlapiLogExecution('ERROR', 'vcontainerlp', vcontainerlp);
					nlapiLogExecution('ERROR', 'vorderno', vorderno);
					var reference2=vcontainerlp;
					var reference3="";
					var reference4 ="";
					var reference5 ="";			
					var alertType=1;//1 for exception and 2 for report	

					nlapiLogExecution('ERROR', 'Exception in update Tracking Number for LTL Orders : ', exp);		
				}
			}
			else
			{
				nlapiLogExecution('ERROR', 'Into QuickShip Orders');

				try{

					var vorderno =nlapiGetFieldValue('custrecord_wmsse_ship_order');
					nlapiLogExecution('ERROR', 'vorderno QuickShip', vorderno);
					var shipcontainerlp=nlapiGetFieldValue('custrecord_wmsse_ship_contlp');
					nlapiLogExecution('ERROR', 'shipcontainerlp', shipcontainerlp);
					nlapiLogExecution('ERROR', 'intoelseofcreate', vorderno);
					vcontainerlp =nlapiGetFieldValue('custrecord_wmsse_ship_contlp');
					var newRecord = nlapiGetNewRecord();

					var trackingno;
					var shipcharges;
					var pakageweight;

					trackingno = nlapiGetFieldValue('custrecord_wmsse_ship_trackno');
					shipcharges =nlapiGetFieldValue('custrecord_wmsse_ship_charges');
					pakageweight=nlapiGetFieldValue('custrecord_wmsse_ship_actwght');

					nlapiLogExecution('ERROR', 'trackingno', trackingno);
					nlapiLogExecution('ERROR', 'pakageweight', pakageweight);
					nlapiLogExecution('ERROR', 'shipcharges ', shipcharges);

					if((vorderno!="" && vorderno!=null) && (trackingno!=null && trackingno!=''))
					{					
						var opentasksearchresults=new Array();
						var columns= new Array();
						var filters = new Array();
						var opentaskshipsearchresults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_shiptaskupdate');

						opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null,'is',vorderno));
						opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is',vcontainerlp));
						//Case # 201414822  start
						opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3','14']));
						// Case # 201414822  end
						opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null,'isnotempty'));


						var resLenDetails = opentaskshipsearchresults.runSearch();					

						var resultsPage = resLenDetails.getResults(0, 1000);
						var offset = 0;
						while (!!resultsPage && resultsPage.length > 0) 
						{
							opentasksearchresults = opentasksearchresults.concat(resultsPage);
							offset += 1000;
							resultsPage = resLenDetails.getResults(offset, offset + 1000);
						}



						var transactionid;


						nlapiLogExecution('ERROR', 'trackingno2', trackingno);
						nlapiLogExecution('ERROR', 'pakageweight2', pakageweight);
						nlapiLogExecution('ERROR', 'shipcharges2 ', shipcharges);
						if (pakageweight == '0.0' || pakageweight == '0.0000' || pakageweight == 'undefined' || pakageweight == '' || pakageweight == 'NAN' || pakageweight=='NaN')
						{
							pakageweight='0.11';

						}

						if(opentasksearchresults !=null)
						{
							nlapiLogExecution('ERROR', 'opentasksearchresults ', opentasksearchresults.length);
							var vNSConfirmArr=new Array();
							var wmslocation=opentasksearchresults[0].getValue('custrecord_wmsse_wms_location');
							for(var p=0;p<opentasksearchresults.length;p++)
							{
								transactionid=opentasksearchresults[p].getValue('custrecord_wmsse_nsconfirm_ref_no');
								if(vNSConfirmArr== null || vNSConfirmArr == '' || vNSConfirmArr.length==0)
								{
									vNSConfirmArr.push(transactionid);
								}
								else
								{
									// To avoid duplicate
									var vDuplicate=false;
									for(var s=0;s<vNSConfirmArr.length;s++)
									{
										if(vNSConfirmArr[s] == transactionid)
											vDuplicate=true;
									}
									if(vDuplicate == false)
									{
										vNSConfirmArr.push(transactionid);
									}	
								}	
							}

							nlapiLogExecution('ERROR', 'NS Confirmation # ', transactionid);
							nlapiLogExecution('ERROR', 'vNSConfirmArr # ', vNSConfirmArr);
							//var wmslocation=opentasksearchresults[0].getValue('custrecord_wms_location');
							transactionid=opentasksearchresults[0].getValue('custrecord_wmsse_nsconfirm_ref_no');
							nlapiLogExecution('ERROR', 'vcontainerlp ', vcontainerlp);
							nlapiLogExecution('ERROR', 'NS Confirmation #2 ', transactionid);

							if (pakageweight == '0.0' || pakageweight == '0.0000' || pakageweight == 'undefined' || pakageweight == '' || pakageweight == 'NAN' || pakageweight=='NaN') {
								pakageweight = '0.11';

							}
							if(transactionid!=null && transactionid!="")
							{
								for(k=0;k<vNSConfirmArr.length;k++)
								{	
									nlapiLogExecution('ERROR', 'NS Confirmation # ', vNSConfirmArr[k]);
									if(vNSConfirmArr[k]!='0')
									{
										var OpenTaskTransaction = nlapiLoadRecord('itemfulfillment', vNSConfirmArr[k]);
										var totalLine=OpenTaskTransaction.getLineItemCount('package');
										nlapiLogExecution('ERROR', 'lineNum ', totalLine);
										for(var i=1; i<= parseFloat(totalLine); i++)
										{

											var packagetrack=OpenTaskTransaction.getLineItemValue('package','packagetrackingnumber',i);
											var packageweight=OpenTaskTransaction.getLineItemValue('package','packageweight',i);
											nlapiLogExecution('ERROR', 'packageweight', packageweight);
											nlapiLogExecution('ERROR', 'packagetrack ', packagetrack);
											if((packagetrack==null)&&(packageweight!=null))
											{
												OpenTaskTransaction.removeLineItem('package',i);
											}
										}		

										OpenTaskTransaction.setFieldValue('shipstatus','C'); //Statusflag='C'
										var lastcharges =OpenTaskTransaction.getFieldValue('shippingcost');
										var totalshipcharges;
										
										if(lastcharges==null || lastcharges=='')
											lastcharges='0.0';
										if(shipcharges==null || shipcharges=='')
											shipcharges='0.0'

										if(lastcharges!=null && lastcharges!='' && parseFloat(lastcharges)>0)
											totalshipcharges = Number(Big(lastcharges).plus(shipcharges)); 

										OpenTaskTransaction.setFieldValue('custbody_fulfill_shipcost',totalshipcharges);
										OpenTaskTransaction.selectNewLineItem('package');
										OpenTaskTransaction.setCurrentLineItemValue('package', 'packagedescr', vcontainerlp);
										OpenTaskTransaction.setCurrentLineItemValue('package', 'packagetrackingnumber', trackingno);
										OpenTaskTransaction.setCurrentLineItemValue('package', 'packageweight',pakageweight);
										//OpenTaskTransaction.setCurrentLineItemValue('item', 'location',wmslocation);
										OpenTaskTransaction.commitLineItem('package');
										//OpenTaskTransaction.commitLineItem('item');
										var id= nlapiSubmitRecord(OpenTaskTransaction ,true);

										if(id!=null && id!='')
										{	
											var internalidrecord=newRecord.getId();
											nlapiLogExecution('ERROR', 'UpdateShipManifestRecord# ', 'UpdateShipManifestRecord# ');
											nlapiLogExecution('ERROR', 'internalidrecord# ', internalidrecord);
											fnUpdateShipManifestRecord(id,internalidrecord);
											nlapiLogExecution('ERROR', 'After open task submit record ', id);
										}
										OpenTaskTransaction=null;
									}
								}

								var  SalesOrderInternalId= opentasksearchresults[0].getValue('custrecord_wmsse_order_no');	
								nlapiLogExecution('ERROR', 'SalesOrderInternalId 2', SalesOrderInternalId);

								for (var j = 0; j < opentasksearchresults.length; j++)
								{

									var ffOrdNo = opentasksearchresults[j].getValue('name');
									var ffOrdLineNo = opentasksearchresults[j].getValue('custrecord_wmsse_line_no');
									var shipqty = opentasksearchresults[j].getValue('custrecord_wmsse_act_qty');


									var opentaskcontainerlpno=opentasksearchresults[j].getValue('custrecord_wmsse_container_lp_no');
									if(shipcontainerlp==opentaskcontainerlpno)
									{
										updateopentaskstatus(opentasksearchresults[j].getId());
									}
								}
							}
							opentasksearchresults=null;
						}
						filters=null;
						columns=null;

					}
				}

				catch(exp) {

					var exceptionname='SalesOrder';
					var functionality='ShipManifest Update';
					var trantype=2;
					nlapiLogExecution('ERROR', 'DetailsError', functionality);	
					nlapiLogExecution('ERROR', 'vcontainerlp', vcontainerlp);
					nlapiLogExecution('ERROR', 'vorderno', vorderno);
					var reference2=vcontainerlp;
					var reference3="";
					var reference4 ="";
					var reference5 ="";
					var alertType=1;//1 for exception and 2 for report
					nlapiLogExecution('ERROR', 'Exception in update Tracking Number for Quick Ship Orders : ', exp);		
				}
			}
		}
	}
	if(type=='edit' || type=='xedit')
	{
		nlapiLogExecution('ERROR', 'Into Edit');
		var vWMSContainerlp;
		var VsalesOrder;
		var vtrackingnonew;
		var chargesnew;
		var weightnew;
		var oldcontainerlp;
		var oldtrackingnumber;
		var oldcharges;
		var oldweight;
		var vOrdNo='';
		var pckgtype='';
		var returnsucess;
		try
		{
			var newRecord = nlapiGetNewRecord();
			vWMSContainerlp =newRecord.getFieldValue('custrecord_wmsse_ship_contlp');
			VsalesOrder = newRecord.getFieldValue('custrecord_wmsse_ship_order');
			vOrdNo = newRecord.getFieldValue('custrecord_wmsse_ship_orderno');
			vtrackingnonew =newRecord.getFieldValue('custrecord_wmsse_ship_trackno');
			chargesnew=newRecord.getFieldValue('custrecord_wmsse_ship_charges');
			weightnew=newRecord.getFieldValue('custrecord_wmsse_ship_actwght');
			pckgtype = newRecord.getFieldValue('custrecord_wmsse_ship_pkgtype');
			var shipref3=newRecord.getFieldValue('custrecord_wmsse_ship_ref3');
			var newshipmentid=newRecord.getId();			
			var oldRecord = nlapiGetOldRecord();
			oldtrackingnumber=oldRecord.getFieldValue('custrecord_wmsse_ship_trackno');
			oldcharges=oldRecord.getFieldValue('custrecord_wmsse_ship_charges');
			oldweight=oldRecord.getFieldValue('custrecord_wmsse_ship_actwght');
			oldcontainerlp=oldRecord.getFieldValue('custrecord_wmsse_ship_contlp');
			var vcarrier =oldRecord.getFieldValue('custrecord_wmsse_ship_carrier');
			var voidstatus=newRecord.getFieldValue('custrecord_wmsse_ship_void');
			var oldvoidstatus=oldRecord.getFieldValue('custrecord_wmsse_ship_void');
			var oldorderno=oldRecord.getFieldValue('custrecord_wmsse_ship_order');
			var shipref5=newRecord.getFieldValue('custrecord_wmsse_ship_ref5');
			var nsConfirmationNumber=oldRecord.getFieldValue('custrecord_wmsse_ship_nsconf_no');

			var str = 'newshipmentid. = ' + newshipmentid + '<br>';
			str = str + 'shipref3. = ' + shipref3 + '<br>';	
			str = str + 'vWMSContainerlp. = ' + vWMSContainerlp + '<br>';
			str = str + 'VsalesOrder. = ' + VsalesOrder + '<br>';
			str = str + 'voidstatus. = ' + voidstatus + '<br>';
			str = str + 'oldvoidstatus. = ' + oldvoidstatus + '<br>';
			str = str + 'oldorderno. = ' + oldorderno + '<br>';
			str = str + 'pckgtype. = ' + pckgtype + '<br>';
			str = str + ' shipref5= ' + shipref5 + '<br>';
			nlapiLogExecution('ERROR', 'Log1', str);

			if(nsConfirmationNumber ==null ||nsConfirmationNumber =='null'|| nsConfirmationNumber =='' || nsConfirmationNumber=='undefined' || nsConfirmationNumber==undefined)
			{
				var trantypeso = nlapiLookupField('transaction', oldorderno, 'recordType');
				var ActualCarrier;
				var ActualCarrierType="";
				var ActualCarrierName;
				var ActualCarrierId;
				var vShippingRule;
				var SalesOrder=oldRecord.getFieldValue('custrecord_wmsse_ship_order');

				var servicelevel=newRecord.getFieldValue('custrecord_wmsse_ship_act_carrier');
				var PublishedRate=newRecord.getFieldValue('custrecord_wmsse_ship_stdrate');

				nlapiLogExecution('ERROR', 'servicelevel ', servicelevel);
				nlapiLogExecution('ERROR', 'PublishedRate ', PublishedRate);

				if(servicelevel!=null && servicelevel !="")
				{
					var CarrierServiceLevelFilter=new Array();
					CarrierServiceLevelFilter.push(new nlobjSearchFilter('name',null,'is',servicelevel));

					var CarrierServiceLevelColumn=new Array();
					CarrierServiceLevelColumn[0]=new nlobjSearchColumn('custrecord_wmsse_carrier_nsmethod');
					CarrierServiceLevelColumn[1]=new nlobjSearchColumn('custrecord_wmsse_carrier_type');
					CarrierServiceLevelColumn[2]=new nlobjSearchColumn('custrecord_wmsse_carrier_service_level');
					var SearchRec=nlapiSearchRecord('customrecord_wmsse_carrier',null,CarrierServiceLevelFilter,CarrierServiceLevelColumn);

					if(SearchRec!=null&&SearchRec!="")
					{
						ActualCarrier = SearchRec[0].getValue('custrecord_wmsse_carrier_nsmethod');
						ActualCarrierName = SearchRec[0].getValue('custrecord_wmsse_carrier_service_level');
						ActualCarrierType = SearchRec[0].getText('custrecord_wmsse_carrier_type');
						ActualCarrierId = SearchRec[0].getId();
						SearchRec=null;
					}			
				}

				if(voidstatus !="Y")
				{
					var trackingno;
					var shipcharges;
					var pakageweight;
					var paymethodtype;
					var shipordernum;
					nlapiLogExecution('ERROR', 'vShippingRule ', vShippingRule);
					nlapiLogExecution('ERROR', 'vWMSContainerlp ', vWMSContainerlp);
					nlapiLogExecution('ERROR', 'vtrackingnonew ', vtrackingnonew);
					nlapiLogExecution('ERROR', 'vcarrier ', vcarrier);
					nlapiLogExecution('ERROR', 'voidstatus ', voidstatus);
					//If voidstatus 'N' it is not all in to this condition
					//if(vWMSContainerlp!=""&& (vtrackingnonew!=null||vtrackingnonew!="") && 
					//(vcarrier!="LTL" || vShippingRule=='BuildShip') && (voidstatus !="N"))
					if(vWMSContainerlp!=""&& (vtrackingnonew!=null||vtrackingnonew!="") && (voidstatus !="N"))

					{
						var custom5=newRecord.getFieldValue('custrecord_wmsse_ship_custom5');
						trackingno = newRecord.getFieldValue('custrecord_wmsse_ship_trackno');
						pakageweight=newRecord.getFieldValue('custrecord_wmsse_ship_actwght');
						paymethodtype = newRecord.getFieldValue('custrecord_wmsse_ship_paymethod');

						shipordernum=newRecord.getFieldValue('custrecord_wmsse_ship_order');
						nlapiLogExecution('ERROR', 'shipordernum', shipordernum);
						var customerShipCost = newRecord.getFieldValue('custrecord_wmsse_ship_custshipcost');

						nlapiLogExecution('ERROR', 'paymethodtype', paymethodtype);

						if(paymethodtype =='FREE_FRIEGHT')
						{
							shipcharges="0.00";
							nlapiLogExecution('ERROR', 'freefrieght', shipcharges);  
						}
						else if(paymethodtype =="COLLECT")
						{
							shipcharges="0.00";
							nlapiLogExecution('ERROR', 'collectcharges', shipcharges);  

						}
						else if((shipref5=='')||(shipref5==null))
						{
							shipcharges="";
							nlapiLogExecution('ERROR', 'firstordershipcharges', shipcharges);
						}
						else
						{
							shipcharges =newRecord.getFieldValue('custrecord_wmsse_ship_charges');
						}		

						if(ActualCarrierType=='PC')
							vShippingRule="";

						var opentasksearchresults= getopentaskdetails(vWMSContainerlp,shipordernum);

						//Upto here 30 Units

						if(opentasksearchresults !=null && opentasksearchresults != '')
						{
							var vNSConfirmArr=new Array();
							var wmslocation=opentasksearchresults[0].getValue('custrecord_wmsse_wms_location');

							for(var p=0;p<opentasksearchresults.length;p++)
							{
								transactionid=opentasksearchresults[p].getValue('custrecord_wmsse_nsconfirm_ref_no');
								if(vNSConfirmArr== null || vNSConfirmArr == '' || vNSConfirmArr.length==0)
								{
									vNSConfirmArr.push(transactionid);
								}
								else
								{
									// To avoid duplicate
									var vDuplicate=false;
									for(var s=0;s<vNSConfirmArr.length;s++)
									{
										if(vNSConfirmArr[s] == transactionid)
											vDuplicate=true;
									}
									if(vDuplicate == false)
									{
										vNSConfirmArr.push(transactionid);
									}
								}	
							}

							nlapiLogExecution('ERROR', 'NS Confirmation # ', transactionid);
							nlapiLogExecution('ERROR', 'vNSConfirmArr # ', vNSConfirmArr);
							if(transactionid!=null && transactionid!="")
							{
								nlapiLogExecution('ERROR', 'voidstatus # ', voidstatus);
								nlapiLogExecution('ERROR', 'oldvoidstatus # ', oldvoidstatus);

								if((voidstatus =="U"))
								{
									var shipcontainerlp=oldRecord.getFieldValue('custrecord_wmsse_ship_contlp');
									//if New Void Status 'U' and oldvoidstatus 'N' it creates updateitemfullment

									for(k=0;k<vNSConfirmArr.length;k++)
									{								

										var	itemfulfillmentransactionid =UpdateItemFulfillment(vNSConfirmArr[k],shipcharges,vWMSContainerlp,trackingno,pakageweight,vOrdNo,wmslocation)
										var internalidrecord=newRecord.getId();
										if((itemfulfillmentransactionid!=null)&&(itemfulfillmentransactionid!=''))
										{
											fnUpdateShipManifestRecord(itemfulfillmentransactionid,internalidrecord);
										}

									}
								}
							}
							opentasksearchresults=null;
						}
					}
				}
			}
		}
		catch(exp) {
			var exceptionname='SalesOrder';
			var functionality='ShipManifest Update';
			var trantype=2;
			nlapiLogExecution('ERROR', 'DetailsError', functionality);	
			nlapiLogExecution('ERROR', 'vWMSContainerlp', vWMSContainerlp);
			nlapiLogExecution('ERROR', 'vOrdNo', vOrdNo);
			var reference2=vWMSContainerlp;
			var reference3="";
			var reference4 ="";
			var reference5 ="";
			var alertType=1;	
			nlapiLogExecution('ERROR', 'Exception in update Tracking Number for Carrier PC : ', exp);		
		}
	}

}

/**
 * This function is used to fetch open task record type
 * @param containerlp 
 * @returns {string}
 */
function getopentaskdetails(vWMSContainerlp,shipordernum)
{
	var opentasksearchresults = new Array();
	if(vWMSContainerlp!=null && vWMSContainerlp!='')
	{

		var opentaskshipsearchresults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_shiptaskupdate');

		var filters = new Array();		
		opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is',vWMSContainerlp));	
		opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null,'anyof',[shipordernum]));		
		opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
		opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28','7']));
		opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'isnotempty'));


		var resLenDetails = opentaskshipsearchresults.runSearch();					

		var resultsPage = resLenDetails.getResults(0, 1000);
		var offset = 0;
		while (!!resultsPage && resultsPage.length > 0) 
		{
			opentasksearchresults = opentasksearchresults.concat(resultsPage);
			offset += 1000;
			resultsPage = resLenDetails.getResults(offset, offset + 1000);
		}



	}

	nlapiLogExecution('ERROR', 'Out of getopentaskdetails');
	//Nullify the objects.	 	
	filters=null;
	columns=null;
	return opentasksearchresults;
}
/**
 * This function is used to update itemfillfillment
 * @param 
 * @returns {}
 */ 
function UpdateItemFulfillment(transactionid,shipcharges,vWMSContainerlp,trackingno,pakageweight,vOrdNo,wmslocation)
{
	nlapiLogExecution('DEBUG', 'Into UpdateItemFulfillment - wmslocation ', wmslocation);
	//var OpenTaskTransaction = nlapiLoadRecord('itemfulfillment', transactionid); 

	var OpenTaskTransaction = nlapiLoadRecord('itemfulfillment', transactionid);
	var lastcharges =OpenTaskTransaction.getFieldValue('custbody_wmsse_fulfill_shipcost');
	nlapiLogExecution('DEBUG', 'shipchargeslast ', lastcharges);
	var totalshipcharges="";
	if((lastcharges=='')||(lastcharges==null))
	{
		totalshipcharges=parseFloat(shipcharges);
	}
	else
	{

		totalshipcharges = Number(Big(lastcharges).plus(shipcharges)); 
		//totalshipcharges=parseFloat(lastcharges)+parseFloat(shipcharges);

	}
	OpenTaskTransaction.setFieldValue('custbody_wmsse_fulfill_shipcost',totalshipcharges);
	OpenTaskTransaction.setFieldValue('generateintegratedshipperlabel', 'F');

	if (pakageweight == '0.0' || pakageweight == '0.0000' || pakageweight == 'undefined' || pakageweight == '' || pakageweight == null || pakageweight == "" || pakageweight == 'NAN' || pakageweight == 'NaN')
	{
		pakageweight='0.01';

	}
	var trackingnumberarray = new Array();
	trackingnumberarray=trackingno.split(',');

	var packageweightarray = new Array();
	packageweightarray=pakageweight.split(',');

	for(var t=0;t<trackingnumberarray.length;t++)
	{
		trackingno=trackingnumberarray[t];
		pakageweight=packageweightarray[t];

		if (pakageweight == '0.0' || pakageweight == '0.0000' || pakageweight == 'undefined' || pakageweight == '' || pakageweight == null || pakageweight == "" || pakageweight == 'NAN' || pakageweight == 'NaN')
		{
			pakageweight='0.01';

		}
		nlapiLogExecution('DEBUG', 'Packageweight in for loop ', pakageweight);
		OpenTaskTransaction.selectNewLineItem('package');
		OpenTaskTransaction.setCurrentLineItemValue('package', 'packagedescr', vWMSContainerlp);
		OpenTaskTransaction.setCurrentLineItemValue('package', 'packagetrackingnumber', trackingno);
		OpenTaskTransaction.setCurrentLineItemValue('package', 'packageweight',pakageweight);
		OpenTaskTransaction.commitLineItem('package');
		OpenTaskTransaction.selectNewLineItem('packagefedex');
		OpenTaskTransaction.setCurrentLineItemValue('packagefedex', 'packagedescrfedex', vWMSContainerlp);
		OpenTaskTransaction.setCurrentLineItemValue('packagefedex', 'packagetrackingnumberfedex', trackingno);
		OpenTaskTransaction.setCurrentLineItemValue('packagefedex', 'packageweightfedex',pakageweight);
		OpenTaskTransaction.commitLineItem('packagefedex');
		OpenTaskTransaction.selectNewLineItem('packageups');
		OpenTaskTransaction.setCurrentLineItemValue('packageups', 'packagedescrups', vWMSContainerlp);
		OpenTaskTransaction.setCurrentLineItemValue('packageups', 'packagetrackingnumberups', trackingno);
		OpenTaskTransaction.setCurrentLineItemValue('packageups', 'packageweightups',pakageweight);
		OpenTaskTransaction.commitLineItem('packageups');
		OpenTaskTransaction.selectNewLineItem('packageusps');
		OpenTaskTransaction.setCurrentLineItemValue('packageusps', 'packagedescrusps', vWMSContainerlp);
		OpenTaskTransaction.setCurrentLineItemValue('packageusps', 'packagetrackingnumberusps', trackingno);
		OpenTaskTransaction.setCurrentLineItemValue('packageusps', 'packageweightusps',pakageweight);
		OpenTaskTransaction.commitLineItem('packageusps');
	}
	var FULFILLMENTATORDERLEVEL=getSystemRuleValue('Consolidate item fulfillments by sales order?',wmslocation);
	var id;
	var searchshipmanifestshippedrecords=GetShipManifestCustomRecords(vOrdNo,vWMSContainerlp,FULFILLMENTATORDERLEVEL);
	if(FULFILLMENTATORDERLEVEL=='Y')
	{
		nlapiLogExecution('DEBUG', 'searchshipmanifestshippedrecords ', searchshipmanifestshippedrecords);
		if(searchshipmanifestshippedrecords==null)
		{
			nlapiLogExecution('DEBUG', 'into if ');
			OpenTaskTransaction.setFieldValue('shipstatus','C'); 
			id= nlapiSubmitRecord(OpenTaskTransaction ,true);
			UpdateShiptask(transactionid);
		}
		else
		{
			nlapiLogExecution('DEBUG', 'searchshipmanifestshippedrecords.length ', searchshipmanifestshippedrecords.length);
			nlapiLogExecution('DEBUG', 'into else');
			OpenTaskTransaction.setFieldValue('shipstatus','B'); //Statusflag='C'
			id= nlapiSubmitRecord(OpenTaskTransaction ,true);
			UpdateShiptaskforcorton(transactionid,vWMSContainerlp);
		}
	}

	else
	{
		OpenTaskTransaction.setFieldValue('shipstatus','C');
		id= nlapiSubmitRecord(OpenTaskTransaction ,true);

		UpdateShiptask(transactionid);
	}
	OpenTaskTransaction=null;
	return id;
}

/**
 * This function is used to update itemfillfillment
 * @param ordernumber
 * @returns {string}
 */
function GetShipManifestCustomRecords(OrderNo,vContLpNo,fulfillmentorderlevel)
{
	nlapiLogExecution('ERROR', 'Into GetShipManifestCustomRecords - vContLpNo', vContLpNo);
	var shipmentfilter = new Array();
	shipmentfilter.push(new nlobjSearchFilter('custrecord_wmsse_ship_orderno', null, 'is', OrderNo));
	//if(vContLpNo!=null && vContLpNo!='' && fulfillmentorderlevel!='Y')
	if(vContLpNo!=null && vContLpNo!='' && vContLpNo!='null')
		shipmentfilter.push(new nlobjSearchFilter('custrecord_wmsse_ship_contlp',null,'is',vContLpNo));
	shipmentfilter.push(new nlobjSearchFilter('custrecord_wmsse_ship_trackno', null, 'isempty'));

	var shipmentcolumns = new Array();
	shipmentcolumns[0] = new nlobjSearchColumn('custrecord_wmsse_ship_ref5');
	var searchshipmanifestshippedrecords= nlapiSearchRecord('customrecord_wmsse_ship_manifest', 'customsearch_wmsse_shipmanifest_details', shipmentfilter, shipmentcolumns);
	//Nullify the objects.	 	
	shipmentfilter=null;
	shipmentcolumns=null;
	return searchshipmanifestshippedrecords;
}

/**
 * This function is used to update shiptask in open task
 * @param transactionid
 * @returns {}
 */

function UpdateShiptaskforcorton(transactionid,vWMSContainerlp)
{
	nlapiLogExecution('ERROR', 'Into UpdateShiptaskforcorton');
	var opentasksearchresults = new Array();	
	var vDate=DateStamp();
	var vTime=TimeStampNew();
	var filters = new Array();	


	var opentaskshipsearchresults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_shiptaskupdate');

	var filters = new Array();		
	var columns= new Array();
	opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null,'anyof',[transactionid]));
	if(vWMSContainerlp!=null && vWMSContainerlp!='')
		opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is',vWMSContainerlp));



	var resLenDetails = opentaskshipsearchresults.runSearch();					

	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		opentasksearchresults = opentasksearchresults.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}



	//opentasksearchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,filters ,columns);

	if (opentasksearchresults!=null && opentasksearchresults!='')
	{		
		for (var s = 0; s < opentasksearchresults.length; s++)
		{
			var opentaskid = opentasksearchresults[s].getId();	
			var fieldNames = new Array(); 		
			var newValues = new Array(); 
			fieldNames.push('custrecord_wmsse_wms_status_flag'); 			
			newValues.push('14'); 

			var vNewDate=vDate + ' ' + vTime;
			fieldNames.push('custrecord_wmsse_ship_comp_date'); 			
			newValues.push(vNewDate); 

			nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskid, fieldNames, newValues);

		}
		opentasksearchresults=null;
	}

}
function UpdateShiptask(transactionid)
{	
	nlapiLogExecution('ERROR', 'Into UpdateShiptask');
	var opentasksearchresults = new Array();	
	var filters = new Array();	
	var vDate=DateStamp();
	var vTime=TimeStampNew();
	var opentaskshipsearchresults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_shiptaskupdate');

	var filters = new Array();		
	var columns= new Array();
	opentaskshipsearchresults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null,'anyof',[transactionid]));


	var resLenDetails = opentaskshipsearchresults.runSearch();					

	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		opentasksearchresults = opentasksearchresults.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	if (opentasksearchresults!=null && opentasksearchresults!='')
	{		
		for (var s = 0; s < opentasksearchresults.length; s++)
		{
			var opentaskid = opentasksearchresults[s].getId();	
			var fieldNames = new Array(); 		
			var newValues = new Array(); 
			fieldNames.push('custrecord_wmsse_wms_status_flag'); 			
			newValues.push('14'); 

			var vNewDate=vDate + ' ' + vTime;
			fieldNames.push('custrecord_wmsse_ship_comp_date'); 			
			newValues.push(vNewDate); 

			nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskid, fieldNames, newValues);

		}
		opentasksearchresults=null;
	}
}


/**
 * This function is used to update shiptask in open task through quickship
 * @param opentaskid
 * @returns {}
 */
function updateopentaskstatus(opentaskid)
{
	nlapiLogExecution('ERROR', 'Into updateopentaskstatus - Id', opentaskid);

	var fieldNames = new Array(); 
	fieldNames.push('custrecord_wmsse_wms_status_flag');  	
	fieldNames.push('custrecord_wmsse_notes'); 

	var newValues = new Array(); 
	newValues.push(14);
	newValues.push('QuickShip');	

	nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskid, fieldNames, newValues);


	nlapiLogExecution('ERROR', 'Out of updateopentaskstatus - Id', opentaskid);
}

//case 201411592

function fnUpdateShipManifestRecord(nsConfirmnumber,shipmentinternalid)
{
	nlapiLogExecution('DEBUG', 'UpdateShipManifestRecord', nsConfirmnumber);	
	var fields = new Array();
	var values = new Array();
	fields[1] ='custrecord_wmsse_ship_nsconf_no';
	values[1] = nsConfirmnumber;
	fields[2] ='custrecord_wmsse_ship_itemfulfill_no';
	values[2] = nsConfirmnumber;

	var updatefields = nlapiSubmitField('customrecord_wmsse_ship_manifest',shipmentinternalid,fields,values);
	nlapiLogExecution('DEBUG', 'UpdateShipManifestRecord', nsConfirmnumber);	
}
