/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * This function is used to Insert records in Asnc Parent and Stage record types
 * @param type
 * @returns {}
 */
function ASNConfirmSE(type)
{
	try {

		if ( type == 'scheduled' || type =='userinterface')
		{
			nlapiLogExecution('DEBUG', 'ASNConfirmSE Start', 'Done');
			nlapiLogExecution('DEBUG', 'type', type);

			var trailername="",departDate="",ASNCRuleVal = "",Dummylps="";			
			var containerLengthTotal = 0,containerWidthTotal = 0,containerHeightTotal = 0,containerWeightTotal=0,ShipUnitCharges=0;			
			var ShipunitlevelQty = 0,shipLP="", trailer="",wmsStatusflag="",tasktype="",ContainerSizeId="",uomLevel='',compid="",siteid="",SRRNO='';
			var SalesorderDetails="", MasterBOL="", salesOrderList="", batchDetails="", uomDetails="", skuDetails="", searchrecordOpenTasks="", orderList="",shiplpsList='',trailerList='';
			var OrderwithCustomerInfo="",CustomerMasterInfo="",ShippingDetailsforOrder="",EligibleTrailer='',ShipCountry = "",Shipzip = "",ShiptoPhone ="";  
			var skulist="",prevcompid="",prevsiteid="",UPCDetails="",CustomFieldDetails="";			
			var wmssePro="",wmsseSeal="",wmssemastershipper="",wmsseappointmenttrailer="",wmsseexparrivaldate="",scaccodetrlr="";
			var Phone='',Address1='',city='',state='',zip='',boscovsshippper='',Addressee='',QSBOL='',prevcontainerLP="", CUCC ='';
			var UOM1='',UOMQty1='',UOMLength1='' ,UOMWidth1='',UOMHeight1='',UOMWeight1='' ,UOMCube1='',Packcode1='',UOMlevel1='';
			var PrevShipmethod ="",FOB ="",ShipAddressee ="",ShipAddress1 = "",ShipAddress2 = "",Shipcity = "",ShipState = "";
			var ExpectedShipdate = "",ActualArrivalDate = "",PlannedArrivalDate = "",Destination = "",Route = "",Class = "",ConsigneeId = "",Billaddressee = "",Billaddr1 = "";
			var Billaddr2 = "",Billaddr3 = "",Billcity = "",BillState = "",Billzip = "",Billcountry = "",Billphone = "",location = "",Company = "",Department = "";
			var SKUList = new Array();	var SKUDetailsList = new Array();	var newRecIdsArray = new Array();var OrdersEligibleForASNGeneration=new Array();
			var EligibaleOrdersfor856=new Array();var EligibaleTrailersfor856=new Array();

			ASNCRuleVal = SystemRuleforASNC(siteid, compid);

			if (ASNCRuleVal == 'Y') {

				var EligibalePacktaskorderList=new Array();
				var OrdersEligibleForASNGeneration=new Array();

				var shiplpsearchresults=GetOpenTaskRecs('-1');

				if(shiplpsearchresults !=null && shiplpsearchresults !="")
				{
					nlapiLogExecution('DEBUG', 'shiplpsearchresults length', shiplpsearchresults.length);
					shiplpsList = getDistinctOrdersList(shiplpsearchresults);
					nlapiLogExecution('DEBUG', 'shiplpsList', shiplpsList);
					for (var z = 0; shiplpsList!= null && z < shiplpsList.length; z++) 
					{
						if(shiplpsList[z] != null && shiplpsList[z] !='')
						{
//							var PacktaskorderLististfilter = new Array();			

//							PacktaskorderLististfilter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', shiplpsList[z]));			
//							PacktaskorderLististfilter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [3])); 	
//							PacktaskorderLististfilter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [14]));
//							PacktaskorderLististsearchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', null, PacktaskorderLististfilter , null);
							//if(PacktaskorderLististsearchresults== null || PacktaskorderLististsearchresults == ""){    
							OrdersEligibleForASNGeneration.push(shiplpsList[z]);

							//}
						}				

					}
					nlapiLogExecution('DEBUG', 'OrdersEligibleForASNGeneration', OrdersEligibleForASNGeneration);
					if(OrdersEligibleForASNGeneration !=null && OrdersEligibleForASNGeneration !="")
					{
						searchrecordOpenTasks = GetAllopentaskData(siteid, compid,OrdersEligibleForASNGeneration,'-1');

						if(searchrecordOpenTasks != null &&  searchrecordOpenTasks != '')
						{
							skulist = getDistinctSKUsFromTaskList(searchrecordOpenTasks);
							skuDetails = GetSKUDetails(searchrecordOpenTasks,skulist);
							//uomDetails = GetUOMDetails(searchrecordOpenTasks,skulist);
							//var batchDetails = GetBatchDetails(searchrecordOpenTasks,skulist);
							salesOrderList = getDistinctOrderIDsFromTaskList(searchrecordOpenTasks);	
							SalesorderDetails = GetSalesOrderDetails(searchrecordOpenTasks,salesOrderList);
							ShippingDetailsforOrder=getShippingDetailsForEligibleOrders(OrdersEligibleForASNGeneration);
							var allsolineresults=getallSOLinedetails(OrdersEligibleForASNGeneration);	

							var lineno ="", skuid ="", skuidText ="", Actqty = "",SOid = "",uomlevel ="", containerLP ="", containerLPtext ="", SerilalId = "",IssueDate = "",IntId = "";
							var BatchIdText = "",packCode="",BatchId = "",uomIdText = "",upcCode="",customField="",IndividualSKUDetailsList ="",SKUDesc ="",SKUFamily ="",SKUGroup = "",SKUtype = "";
							var HazmatCode ="", TempCntrl ="", vendor ="",IndividualOrderInfoList ="",SalesOrdNo = "",OrderNo="",EDIREF = "",ShipmentVendor ="", Shipmethod = "",ShipmethodID ="", SCACCode = "";
							var PrevShipmethod ="",FOB ="",ShipAddressee ="",ShipAddress1 = "",ShipAddress2 = "",Shipcity = "",ShipState = "",ShipCountry = "",Shipzip = "",ShiptoPhone ="";
							var ExpectedShipdate = "",ActualArrivalDate = "",PlannedArrivalDate = "",Destination = "",Route = "",Class = "",ConsigneeId = "",Billaddressee = "",Billaddr1 = "";
							var Billaddr2 = "",Billaddr3 = "",Billcity = "",BillState = "",Billzip = "",Billcountry = "",Billphone = "",location = "",Company = "",Department = "";
							var varTerms = "",CustomerPO = "",Shipphone='',ShiptoPhone = "",Billphone = "",ShipAddrID = "",individualitemdimsList ="",UOM1 = "",UOMQty1 = "",UOMLength1 = "",UOMWidth1 = "";
							var UOMHeight1 = "",UOMWeight1 = "",UOMCube1 = "",Packcode1 = "",UOMlevel1 = "",CUCC = "",Conainercube = "",ContainerWeight = "",IndividualCUCCDetailsList = "";
							var EUCC = "",IndividualEUCCDetailsList = "",SUCC = "",ShipunitCube = "",ShipunitWeight = "",IndividualSUCCDetailsList = "",ContainerLength = "",ContainerWidth = "",ContainerHeight = "";
							var ContainerMaxWeight = "",ContainerTareWeight = "",ContainerCube = "",IndividualContainerDimslist ="",TrackingNumbers = "",ShippingCharges = "",IndividualShipmanfDetList ="",Pronum = "";
							var SealNo = "",MasterShipper = "",TrailerAppointNo = "",IndividualTrailerDetails = "",prevskuid="",prevcontainer  ="",prevshipLP ="",prevcontainerLP="", previtemId="", newcontlp="",prevtrailer="",PrevCarrier='',Prevsoshipmethod='';
							var PrevOrdNo = "",prevlineno = "",TaskInternalID="",CarrierOptions="",ShiptoEmail ="",ShiptoFax="", ShiptoEmail="",tranid="";
							var ConsigneeId="",salesordWeight="",salesordCube="",Billcity="",BillState="",Billzip="",Billcountry="",Billphone="",location="",locationvalue='',Company="",prevlocation='';
							var Department="",Terms="",OrderType="",OrderPriority="",CustomerPO="",ShipAddrID="",CUCC="",CUCC = "",Conainercube = "",ContainerWeight = "",EUCC="";
							var ContainerMaxWeight = "";
							var Pronum="",TrailerCarrier='',carrierIdnew='',carrierNamenew='',carrierScacnew='',SOid="",SOidText='',prevSOid="",soalternateidlist="",alternateid="", ItemID="";					
							var IndividualupcCodeDetailsList="",TrailerDetails='',IndividualcustomFieldDetailsList="",ConsigneeValue='';
							var sysdate=DateStamp();

							var parent = nlapiCreateRecord('customrecord_wmsse_throwaway_parent');
							for (var q = 0; ShippingDetailsforOrder!= null && q < ShippingDetailsforOrder.length; q++) 
							{	
								OrderNo = ShippingDetailsforOrder[q].getValue('internalid','custrecord_wmsse_order_no','group');


								var IndividiualOrdersearchrecordOpenTask=GetIndividiualOpenTaskDetails(searchrecordOpenTasks,OrderNo);
								for ( var count = 0; count < IndividiualOrdersearchrecordOpenTask.length; count++) {


									lineno=IndividiualOrdersearchrecordOpenTask[count][0];
									skuid=IndividiualOrdersearchrecordOpenTask[count][1];
									skuidText=IndividiualOrdersearchrecordOpenTask[count][2];					
									Actqty=IndividiualOrdersearchrecordOpenTask[count][3] ;
									SOid=IndividiualOrdersearchrecordOpenTask[count][4] ;
									uomlevel=IndividiualOrdersearchrecordOpenTask[count][5] ;					
									containerLP=IndividiualOrdersearchrecordOpenTask[count][6];
									containerLPtext=IndividiualOrdersearchrecordOpenTask[count][7] ;
									SerilalId=IndividiualOrdersearchrecordOpenTask[count][8] ;
									IssueDate=IndividiualOrdersearchrecordOpenTask[count][9] ;
									TaskInternalID=IndividiualOrdersearchrecordOpenTask[count][10];
									BatchIdText=IndividiualOrdersearchrecordOpenTask[count][11] ;
									packCode=IndividiualOrdersearchrecordOpenTask[count][12] ;
									SOidText=IndividiualOrdersearchrecordOpenTask[count][13] ;
									ContainerSizeId = IndividiualOrdersearchrecordOpenTask[count][14] ;

									if ( containerLP == prevcontainerLP){
										//No need to get the details, use the existing details
									}
									else{
										// Getting CUCC 
										IndividualCUCCDetailsList = GetContainerCUCCDetails(containerLP);
										nlapiLogExecution('DEBUG', 'Getting IndividualCUCCDetailsList',IndividualCUCCDetailsList);
										if (IndividualCUCCDetailsList != null && IndividualCUCCDetailsList.length > 0) {
											CUCC = IndividualCUCCDetailsList[0][0]; //['CUCC'];

										}
										//Getting Shipmanifest Details
										//GetIndividualShipmanifestDetails
										/*IndividualShipmanfDetList = GetShipmanifestDetails("", containerLP);
							if (IndividualShipmanfDetList != null && IndividualShipmanfDetList.length > 0) {
								TrackingNumbers = IndividualShipmanfDetList[0][1];//['TrackingNumbers'];
								ShippingCharges = IndividualShipmanfDetList[0][2];//['ShippingCharges'];

								if (ShippingCharges == null	 || ShippingCharges == "" || ShippingCharges == "0.0")
									ShippingCharges = 0;
							}*/

									} // end if -contlp
									prevcontainerLP = containerLP;


									if ( skuid == prevskuid )
									{	//No need to call upc API. You can use the existing one.
										nlapiLogExecution('DEBUG', 'skuid == prevskuid cond',	skuid);
									}
									else
									{ 
										// The below API will take skudetails , skuid as
										// parameter and
										// returns all the details of the skuid
										IndividualSKUDetailsList = GetIndividualSKUInfo(skuDetails, skuid);

										if(IndividualSKUDetailsList !=null && IndividualSKUDetailsList != '')
										{
											nlapiLogExecution('DEBUG', 'IndividualSKUDetailsList',	IndividualSKUDetailsList.length);
											ItemID= IndividualSKUDetailsList[0][0]; //SKU  	
											SKUDesc = IndividualSKUDetailsList[0][1];  		//SalesDesc
											vendor = IndividualSKUDetailsList[0][2];		// VendorName
											upcCode=IndividualSKUDetailsList[0][4];
											cost=IndividualSKUDetailsList[0][5];

										}

										// Get SKU dimensions for the sku.
										//individualitemdimsList = AssignUOMDetails(uomDetails, skuid);


										UOM1 =1;
										UOMQty1 = 1;
										UOMLength1 =1;
										UOMWidth1 = 1;
										UOMHeight1 = 1;
										UOMWeight1 = 1;
										UOMCube1 = 1;
										Packcode1 =1;
										UOMlevel1 =1;

									}
									prevskuid = skuid;

									if(SOid == prevSOid){
										//No need to call upc API. You can use the existing one.
										nlapiLogExecution('DEBUG', 'SOid == prevSOid cond',	SOid);
									}
									else
									{
										IndividualOrderInfoList = GetIndividualOrderInfo(SalesorderDetails, SOid);
										//nlapiLogExecution('DEBUG', 'Order info list-IndividualOrderInfoList',IndividualOrderInfoList);
										if(IndividualOrderInfoList !=null && IndividualOrderInfoList !=''){
											OrderNo=SOid;
											SalesOrdNo = IndividualOrderInfoList[0][0]; //tranID							
											tranid = IndividualOrderInfoList[0][0];

											Shipmethod = IndividualOrderInfoList[0][1];   // Shipmethod
											ShipAddressee = IndividualOrderInfoList[0][2]; //ShipAddressee
											ShipAddress1 = IndividualOrderInfoList[0][3];// ShipAddr1
											ShipAddress2 = IndividualOrderInfoList[0][4];// [ShipAddr2]
											Shipcity = IndividualOrderInfoList[0][5];// ['ShipCity'];
											ShipState = IndividualOrderInfoList[0][6];//['ShipState'];
											ShipCountry = IndividualOrderInfoList[0][7];//['Shipcountry'];
											Shipzip = IndividualOrderInfoList[0][8]; //['Shipzip'];
											ShiptoPhone = IndividualOrderInfoList[0][9]; //['ShiptoPhone'];						

											Class = IndividualOrderInfoList[0][10];//['class'];
											ConsigneeId = IndividualOrderInfoList[0][11]; 	
											Billaddressee = IndividualOrderInfoList[0][12];//['BillAddressee'];
											Billaddr1 = IndividualOrderInfoList[0][13]; //['Billaddr1'];
											Billaddr2 = IndividualOrderInfoList[0][14];//['Billaddr2'];
											Billaddr3 = IndividualOrderInfoList[0][15];//['Billaddr3'];
											Billcity = IndividualOrderInfoList[0][16];//['BillCity'];
											BillState = IndividualOrderInfoList[0][17];//['BillState'];
											Billzip = IndividualOrderInfoList[0][18];//['Billzip'];
											Billcountry = IndividualOrderInfoList[0][19];//['BillCountry'];
											Billphone = IndividualOrderInfoList[0][20];//['BillPhone'];
											location = IndividualOrderInfoList[0][21];//['Location'];
											CustomerPO = IndividualOrderInfoList[0][22];
											Department = IndividualOrderInfoList[0][25];// ['Department'];
											Terms = IndividualOrderInfoList[0][23]; //['Terms'];
											TrackingNumbers = IndividualOrderInfoList[0][26];


										}	
									}
									prevSOid=SOid;

									parent.selectNewLineItem('recmachcustrecord_wmsse_stagetable_parent');


									//Case Start 201416021 

									var EDICustRequired = IsEDICustRequired();
									nlapiLogExecution('ERROR', 'EDICustRequired', EDICustRequired);
									if(EDICustRequired == 'Y')
									{
										var ressoDetails = GetEDIconfig(SOid,lineno);
										for ( var w = 0 ; ressoDetails !=null && w < ressoDetails.length; w++ )
										{
											var columns= ressoDetails[w][0].getAllColumns();
											var columnLen = columns.length;
											for (c = 0; c < columnLen; c++)
											{

												var value = ressoDetails[w][0].getValue(columns[c]);
												nlapiLogExecution('ERROR', 'value PC', value);
												nlapiLogExecution('ERROR', 'ressoDetails[w][2]', ressoDetails[w][2]);
												if(ressoDetails[w][2] == 'PC')
												{
													//parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent',ressoDetails[w][1], value);
													if( (ressoDetails[w][3] != null && ressoDetails[w][3] != '') && (ressoDetails[w][3] == ConsigneeId) )
													{	
														nlapiLogExecution('ERROR', 'into customer specific', 'done');
														parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent',ressoDetails[w][1], value);
													}
													else
													{
														nlapiLogExecution('ERROR', 'into not customer specific', ressoDetails[w][1]);
														parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent',ressoDetails[w][1], value);
														//parent.commitLineItem('recmachcustrecord_wmsse_stagetable_parent');
													}
												}
												//parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent',ressoDetails[w][1], value);
											}

										}
										//line level
										var ressolineDetails = GetEDIconfigLinelevel(SOid,lineno);
										for ( var w = 0 ; ressolineDetails !=null && w < ressolineDetails.length; w++ )
										{
											var resval = ressolineDetails[w][0];
											if(ressolineDetails[w][2] == 'PC')
											{
												if( (ressoDetails[w][3] != null && ressoDetails[w][3] != '') && (ressoDetails[w][3] == ConsigneeId) )
												{	
													parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent',ressolineDetails[w][1], resval);
												}
												else
													parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent',ressolineDetails[w][1], resval);
											}
										}

										var resDefaultvalues = GetEDIconfigDefaultvalues(SOid,lineno);
										for ( var w = 0 ; resDefaultvalues !=null && w < resDefaultvalues.length; w++ )
										{
											var resdefaulval = resDefaultvalues[w][0];

											parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent',resDefaultvalues[w][1], resdefaulval);
										}
									}

									//Case End 201416021 

									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_ordno', OrderNo);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_deliveryid',tranid);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shipunitdimsuom', 'Inches');
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_containerdimsuom', 'Inches');
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_skudimsuom','Inches');
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_uom_id', UOM1);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_uom_qty',UOMQty1);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_sku_length',UOMLength1);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_sku_width',UOMWidth1);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_sku_weight',UOMWeight1);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_sku_height',UOMHeight1);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_c_ucc128',CUCC);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_eucc128', CUCC);
									if ( packCode == null || packCode =="")  // If packcode is null , defaulting to 1.
										packCode="1";
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_packcode', packCode);
									if (Billaddressee == "" || Billaddressee == null)
										Billaddressee = ConsigneeId;
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_billto_contactname',Billaddressee);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_billto_addr1',Billaddr1);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_billto_addr2',Billaddr2);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_billtocity',Billcity);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_billtostate',BillState);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_billtozip',Billzip);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_billtocountry', Billcountry);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_billtophone',Billphone);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_billinginfo_locid',Billaddr3);


									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_scac_code',carrierScacnew);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_carierservicelevel',carrierScacnew);

									if (vendor == null || vendor == "") {
										vendor = ItemID;
									}
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_wmsse_skuvendor',vendor);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_delivery_uom','EACH');

									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','ustrecord_wmsse_container_cube',ContainerCube);
									if (ShipAddressee == "" || ShipAddressee == null)
										ShipAddressee = ConsigneeId;
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shipto_contactname',ShipAddressee);							
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_department',Department);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_class', Class);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_carrierid',carrierIdnew);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_asn_carrier_name',carrierNamenew);
									if (Route == "" || Route == null)
										Route = Destination;
									// custbody_locationaddressid
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_route', Route);							
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_dest',Destination);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shiptoaddr1',ShipAddress1);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shiptoaddr2',ShipAddress2);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shiptocity',Shipcity);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shiptostate',ShipState);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shiptozip',Shipzip);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shiptocountry', ShipCountry);							
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shiptophone',Shipphone);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shiptoemail',ShiptoEmail); 
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shiptofax',ShiptoFax); 							
									if(ActualArrivalDate =="" || ActualArrivalDate == null) // Added by Mahesh
										ActualArrivalDate=sysdate;
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','ustrecord_wmsse_expected_arrivaldate',ActualArrivalDate);

									if(PlannedArrivalDate =="" || PlannedArrivalDate == null) // Added by Sudheer
										PlannedArrivalDate=sysdate;

									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_planned_arrival_date',PlannedArrivalDate);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_containerlp',containerLP);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_containerlp_charge',ShippingCharges);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_container_trackingno',TrackingNumbers);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_issue_period',IssueDate);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_payment_terms', Terms);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_container_weight',ContainerMaxWeight);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_deliveryid',tranid);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_ordertype',OrderType);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_order_priority',OrderPriority);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_consigneeid',ConsigneeId);
									if (Billaddressee == "" || Billaddressee == null)
										Billaddressee = ConsigneeId;

									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_billtoemail',ShiptoEmail);

									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_customer_pono', CustomerPO);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_host_ordno',SOid);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_deliveryline_no', lineno);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_item_internalid', skuid);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_asn_item', ItemID);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_sku_desc', SKUDesc);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_sku_family', SKUFamily);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_sku_group', SKUGroup);
									if(SKUtype == 'undefined' || SKUtype== "" || SKUtype == null)
										SKUtype="";
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_sku_type', SKUtype);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_upc_code',upcCode);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_batch_delivery_qty', Actqty);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_quantity',Actqty);							
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_wh_location',location);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_company',Company);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_container_levelqty', Actqty);	
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_deliverylineqty',Actqty);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shipfromlocationid',location);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shipfromcontactname',Addressee);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shipfromaddr2',Address1);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shipfromcity',city);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shipfromstate',state);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shipfromzip',zip);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_shipfromphone',Phone);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','custrecord_wmsse_vendor',vendor);

									parent.commitLineItem('recmachcustrecord_wmsse_stagetable_parent');

									nlapiSubmitField('customrecord_wmsse_trn_opentask',TaskInternalID, 'custrecord_wmsse_hostid', 'SPS');

								}
								updateHostIDforOrder(OrderNo);
								if(SOid !=null && SOid != '')
								{

									parent.selectNewLineItem('recmachcustrecord_wmsse_asn_parent');
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_asn_parent','custrecord_wmsse_parent_orderno', SOid);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_asn_parent','custrecord_wmsse_parent_deliveryid', SOidText);
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_asn_parent','custrecord_wmsse_parent_customer', ConsigneeId);	
									parent.setCurrentLineItemValue('recmachcustrecord_wmsse_stagetable_parent','name', SOidText);		

									parent.commitLineItem('recmachcustrecord_wmsse_asn_parent');

								}

							}
							nlapiLogExecution('DEBUG', 'Before inserting into stage table - Current Available Usage', nlapiGetContext().getRemainingUsage());
							nlapiLogExecution('DEBUG', 'Before inserting into stage table','done');
							var id=	nlapiSubmitRecord(parent); 
							nlapiLogExecution('DEBUG', 'After insertion of stage table - Current Available Usage', nlapiGetContext().getRemainingUsage());

						}
						else
						{
							nlapiLogExecution('DEBUG', 'No data found in closed task','done');
						}
					}
				}
			}
		}

	}
	catch(exception) {
		nlapiLogExecution('DEBUG', 'GetIndividiualBatchID', exception);
	}

}

/**
 * This function is used to get Individual salesorder line details list
 * @params SOList,line,salesorderid 
 * @returns {Array}
 */
function GetIndividualSOLinedetails(SOLIst,line,so)
{
	var buyerpart = "";var individiualSOLineT = new Array();
	var individiualSOLineList = new Array();
	try
	{
		if (SOLIst != null && SOLIst.length>0) {
			nlapiLogExecution('DEBUG', 'SOLIst.length', SOLIst.length);
			for ( var i=0; i < SOLIst.length ; i++){

				if (SOLIst[i].getValue('line') == line && SOLIst[i].getId() == so){

					individiualSOLineList = new Array();
					individiualSOLineList[0] = SOLIst[i].getValue('rate');
					individiualSOLineList[1] = SOLIst[i].getValue('amount');
					individiualSOLineList[2] = SOLIst[i].getValue('quantity');	

					i = SOLIst.length;
					individiualSOLineT.push(individiualSOLineList);
				}

			}
		}
	}
	catch(exception) {
		nlapiLogExecution('DEBUG', 'GetIndividualSOLinedetails', exception);
	}
	return individiualSOLineT;	
}

/**
 * This function is used to fetch eligible ship orders details from open task
 * @param orderlist
 * @returns {string}
 */
function getShippingDetailsForEligibleOrders(orderlist)
{
	nlapiLogExecution('DEBUG', 'getShippingDetailsForEligibleOrders', 'Start');
	var noofshiplpfilter = new Array();
	var noofshiplpcol = new Array();		

	noofshiplpfilter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', orderlist));
	noofshiplpfilter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [14])); 
	noofshiplpfilter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [14])); 
	noofshiplpfilter.push(new nlobjSearchFilter('custrecord_wmsse_hostid',  null, 'isempty')); 

	noofshiplpcol[0] = new nlobjSearchColumn('custrecord_wmsse_wms_status_flag',null,'group'); 
	noofshiplpcol[1] = new nlobjSearchColumn('custrecord_wmsse_tasktype',null,'group'); 		
	noofshiplpcol[2] = new nlobjSearchColumn('internalid','custrecord_wmsse_order_no','group');


	shiplpsearchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', null, noofshiplpfilter, noofshiplpcol);
	nlapiLogExecution('DEBUG', 'getShippingDetailsForEligibleOrders shiplpsearchresults', shiplpsearchresults);
	//Nullify the objects.	 
	noofshiplpfilter=null;
	noofshiplpcol=null;
	return shiplpsearchresults;
}



/**
 * This function is used to fetch distinct orders
 * @param OpenTaskList
 * @returns {Array}
 */
function getDistinctOrderIDsFromTaskList(OpenTaskList){
	nlapiLogExecution('DEBUG', 'getDistinctOrderIDsFromTaskList', 'Start');
	var OrderIDList = new Array();
	try{

		if(OpenTaskList != null && OpenTaskList.length > 0)
		{
			for(var i = 0; i < OpenTaskList.length; i++)
			{
				var OrderID = OpenTaskList[i].getValue('custrecord_wmsse_order_no');
				if(!isDistinctOrderID(OrderIDList, OrderID))
					OrderIDList.push(OrderID);
			}
		}

		nlapiLogExecution('DEBUG', 'getDistinctOrderIDsFromTaskList', 'End');
	}

	catch(exception) 
	{
		nlapiLogExecution('DEBUG', 'getDistinctOrderIDsFromTaskList', exception);
	}
	nlapiLogExecution('DEBUG', 'getDistinctOrderIDsFromTaskList', 'End');
	return OrderIDList;

}

function isDistinctOrderID(OrderIDList, OrderID){
	var matchFound = false;
	if(OrderIDList != null && OrderIDList.length > 0){
		for(var i = 0; i < OrderIDList.length; i++){
			if(OrderIDList[i] == OrderID)
				matchFound = true;
		}
	}

	return matchFound;
}

function getDistinctSKUsFromTaskList(OpenTaskList){
	nlapiLogExecution('DEBUG', 'getDistinctSKUsFromTaskList', 'Start');
	var skusList = new Array();
	try{	
		if(OpenTaskList != null && OpenTaskList.length > 0){
			for(var i = 0; i < OpenTaskList.length; i++){
				var skuID = OpenTaskList[i].getValue('custrecord_wmsse_sku');

				if(!isDistinctSKU(skusList, skuID))
					skusList.push(skuID);

			}
		}
	}
	catch(exception) 
	{
		nlapiLogExecution('DEBUG', 'getDistinctSKUsFromTaskList', exception);
	}

	nlapiLogExecution('DEBUG', 'getDistinctSKUsFromTaskList', 'End');
	nlapiLogExecution('DEBUG', 'skulist', skusList);
	return skusList;
}


function isDistinctSKU(skuList, sku) {
	var matchFound = false;

	try {

		if (skuList != null && skuList.length > 0) {
			for ( var i = 0; i < skuList.length; i++) {
				if (skuList[i] == sku)
					matchFound = true;
			}
		}
	} catch (exception) {
		nlapiLogExecution('DEBUG', 'isDistinctSKU', exception);
	}

	return matchFound;
}


/**
 * Function to retrieve the SKU details for a list of SKUs
 * @param skulist
 * @returns {Array}
 */
function GetSKUDetails(OpenTaskList,skulist){
	nlapiLogExecution('DEBUG', 'GetSKUDetails', skulist);

	var skuDetailsListT = new Array();
	try{
		// Get the list of distinct SKUs
		var skuDetailsList = new Array();

		var filters = new Array();
		var columns = new Array();


		filters.push(new nlobjSearchFilter('internalid', null, 'anyof', skulist));	
		filters.push(new nlobjSearchFilter('isinactive',null, 'is','F'));

		// Getting sku type is pending
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('salesdescription');	
		columns[1] = new nlobjSearchColumn('itemid');
		columns[2] = new nlobjSearchColumn('vendorname');
		columns[3] = new nlobjSearchColumn('internalid');
		columns[4] = new nlobjSearchColumn('upccode');
		columns[5] = new nlobjSearchColumn('cost');

		var ResSKUDetails = nlapiSearchRecord('item', null, filters, columns);

		if(ResSKUDetails != null && ResSKUDetails.length > 0){
			for(var i = 0; i < ResSKUDetails.length; i++ ){
				skuDetailsList = new Array();
				skuDetailsList[0] = ResSKUDetails[i].getValue('itemid');
				skuDetailsList[1] = ResSKUDetails[i].getValue('salesdescription');
				skuDetailsList[2] = ResSKUDetails[i].getText('vendorname');
				skuDetailsList[3] = ResSKUDetails[i].getValue('internalid');
				skuDetailsList[4] = ResSKUDetails[i].getValue('upccode');
				skuDetailsList[5] = ResSKUDetails[i].getValue('cost');
				skuDetailsListT.push (skuDetailsList);
			}
		}
	}catch(exception){
		nlapiLogExecution('DEBUG', 'Get SKU Details', exception);
	}

	nlapiLogExecution('DEBUG', 'GetSKUDetails', 'end');
	nlapiLogExecution('DEBUG', 'skuDetailsListT', skuDetailsListT);
	//Nullify the objects.	 
	filters=null;
	columns=null;
	return skuDetailsListT;
}

/**
 * Function to update status flag for dropshiporder
 * @param orderno
 * @returns {}
 */
function updateStatusflagForDropshipOrder(orderno)
{
	nlapiLogExecution('DEBUG', 'updateStatusflagForDropshipOrder', orderno);
	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', orderno));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [14])); 
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [28])); 
	filters.push(new nlobjSearchFilter('custrecord_wmsse_hostid',  null, 'is','P')); 	
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_wmsse_order_no');
	var searchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask' , null,	filters, columns);	
	if(searchresults !=null)
		nlapiLogExecution('DEBUG', 'number of orders for that trailer', searchresults.length);
	for(var cn=0; searchresults !=null && cn<searchresults.length; cn++)
	{
		nlapiLogExecution('DEBUG', 'UpdateOrderStausfortrailer orders', searchresults[cn].getText('custrecord_wmsse_order_no'));
		try
		{
			nlapiSubmitField('customrecord_wmsse_trn_opentask',searchresults[cn].getId(), 'custrecord_wmsse_hostid', '');
		}
		catch (exp) {
			nlapiLogExecution('DEBUG', 'Exeception in updateStatusflagForDropshipOrder', exp);
		}
	}
}

/**
 * Function to fetch records from open task
 * @param maxno
 * @returns {string}
 */
var ResultOpenTaskRecords ;
function GetOpenTaskRecs(maxno)
{
	try {
		nlapiLogExecution ('DEBUG','GetOpenTaskRecs',maxno);

		var noofshiplpfilter = new Array();

		if(maxno!=null && maxno!='' && maxno!='-1')
			noofshiplpfilter.push(new nlobjSearchFilter('id', null, 'greaterthan', maxno));
		else
			ResultOpenTaskRecords = new Array();

		noofshiplpfilter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [14])); 	
		noofshiplpfilter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [14])); 
		noofshiplpfilter.push(new nlobjSearchFilter('custrecord_wmsse_hostid',  null, 'isempty')); 
		noofshiplpfilter.push(new nlobjSearchFilter('custentity_wmsse_asn_required','custrecord_wmsse_customer','is','T'));

		var noofshiplpcol = new Array();
		noofshiplpcol[0] = new nlobjSearchColumn('custrecord_wmsse_container_lp_no'); 
		noofshiplpcol[1] = new nlobjSearchColumn('custrecord_wmsse_wms_status_flag'); 
		noofshiplpcol[2] = new nlobjSearchColumn('custrecord_wmsse_tasktype'); 
		noofshiplpcol[3] = new nlobjSearchColumn('custrecord_wmsse_comp_id'); 
		noofshiplpcol[4] = new nlobjSearchColumn('custrecord_wmsse_order_no');
		noofshiplpcol[5] = new nlobjSearchColumn('id').setSort();
		noofshiplpcol[6] = new nlobjSearchColumn('custrecord_wmsse_customer')

		var searchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', null,noofshiplpfilter, noofshiplpcol);

		if( searchresults!=null && searchresults.length>=1000)
		{ 
			for(var s=0;s<searchresults.length;s++)
			{	
				ResultOpenTaskRecords.push(searchresults[s]);
			}
			var maxno=searchresults[searchresults.length-1].getValue('id');
			GetOpenTaskRecs(maxno)	
		}
		else
		{
			for(var s=0;searchresults!=null && s<searchresults.length;s++)
			{	
				ResultOpenTaskRecords.push(searchresults[s]);
			} 
		}

		if(ResultOpenTaskRecords !=null && ResultOpenTaskRecords !='')
			nlapiLogExecution('DEBUG', 'ResultOpenTaskRecords length', ResultOpenTaskRecords.length);

	}

	catch(exception) {
		nlapiLogExecution('DEBUG', 'GetOpenTaskRecs', exception);
	}
	//Nullify the objects.	 
	noofshiplpfilter=null;
	noofshiplpcol=null;
	return ResultOpenTaskRecords;
}


/**
 * This function is used to fetch system rule for edi required or not
 * @param 
 * @returns {}
 */
function SystemRuleforASNC(siteid, compid)
{
	var ASNCRule = 'N';
	try {
		var filters = new Array();
		/*if (compid != null && compid != ""){
			filters.push(new nlobjSearchFilter('custrecord_wmssecomp', null, 'anyof', compid));
		}*/		

		filters.push(new nlobjSearchFilter('name', null, 'is','Generate EDI 856 outbound ASNs?'));
		//filters.push(new nlobjSearchFilter('custrecord_wmssedescription', null, 'is','ASN Confirmation Required?'));

		//case 201412011
		filters.push(new nlobjSearchFilter('custrecord_wmsserulevalue', null, 'is', 'Y'));

		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_wmsserulevalue');

		var ResASNCRule = nlapiSearchRecord('customrecord_wmsse_sysrules', null, filters,columns);

		if (ResASNCRule!= null  && ResASNCRule.length > 0){
			ASNCRule = 'Y'; 
		}
	}	
	catch(exception) {
		nlapiLogExecution('DEBUG', 'Systemrule Fetching-856', exception);
	}
	//Nullify the objects.	 
	filters=null;
	columns=null;
	return ASNCRule;
}


function getDistinctOrdersList(shiplpList){
	nlapiLogExecution('DEBUG', 'getDistinctOrdersList', shiplpList);
	var shiplpIDList = new Array();	
	try{

		if(shiplpList != null && shiplpList.length > 0)
		{
			for(var i = 0; i < shiplpList.length; i++)
			{
				var shiplpID = shiplpList[i].getValue('custrecord_wmsse_order_no');
				if(!isDistinctShipLP(shiplpIDList, shiplpID))
					shiplpIDList.push(shiplpID);
			}
		}
		nlapiLogExecution('DEBUG', 'getDistinctOrdersList', 'End');
	}

	catch(exception) 
	{
		nlapiLogExecution('DEBUG', 'getDistinctOrdersList', exception);
	}
	nlapiLogExecution('DEBUG', 'getDistinctOrdersList', shiplpIDList);
	return shiplpIDList;

}

function isDistinctShipLP(shiplpIDList, shiplpID){
	var matchFound = false;
	if(shiplpIDList != null && shiplpIDList.length > 0){
		for(var i = 0; i < shiplpIDList.length; i++){
			if(shiplpIDList[i] == shiplpID)
				matchFound = true;
		}
	}

	return matchFound;
}



/**
 *  This function will fetch records from open task.
 * @params orderno,siteid,compid,maxno
 * @returns {string}
 */

var ResultTaskRecords ;
function GetAllopentaskData(siteid, compid,orderno,maxno)
{

	try {
		nlapiLogExecution ('DEBUG','GetAllopentaskData orderno',orderno);
		var filters = new Array();
		if(maxno!=null && maxno!='' && maxno!='-1')
			filters.push(new nlobjSearchFilter('id', null, 'greaterthan', maxno));
		else
			ResultTaskRecords = new Array();

		filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', orderno));
		filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', '3'));// 3=pick	
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [14]));// ship
		filters.push(new nlobjSearchFilter('custrecord_wmsse_hostid', null, 'isempty'));
		filters.push(new nlobjSearchFilter('mainline','custrecord_wmsse_order_no','is','T'));
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_wmsse_line_no');
		columns[1] = new nlobjSearchColumn('custrecord_wmsse_sku');
		columns[2] = new nlobjSearchColumn('custrecord_wmsse_act_qty');
		columns[3] = new nlobjSearchColumn('tranid','custrecord_wmsse_order_no');
		columns[4] = new nlobjSearchColumn('custrecord_wmsse_container_lp_no');
		columns[5] = new nlobjSearchColumn('custrecord_wmsse_serial_no');
		columns[6] = new nlobjSearchColumn('custrecord_wmsse_act_end_date');
		columns[7] = new nlobjSearchColumn('custrecord_wmsse_batch_no');
		columns[8] = new nlobjSearchColumn('custrecord_wmsse_order_no');
		columns[9] = new nlobjSearchColumn('id');
		columns[10] = new nlobjSearchColumn('custrecord_wmsse_container_size');

		var searchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', null,filters, columns);

		if( searchresults!=null && searchresults.length>=1000)
		{ 
			for(var s=0;s<searchresults.length;s++)
			{	
				ResultTaskRecords.push(searchresults[s]);
			}
			var maxno=searchresults[searchresults.length-1].getValue('id');
			GetAllopentaskData(siteid, compid,orderno,maxno)	
		}
		else
		{
			for(var s=0;searchresults!=null && s<searchresults.length;s++)
			{	
				ResultTaskRecords.push(searchresults[s]);
			} 
		}

		if(ResultTaskRecords !=null && ResultTaskRecords !='')
			nlapiLogExecution('DEBUG', 'GetAllopentaskData ResultTaskRecords length', ResultTaskRecords.length);

	}
	catch(exception) {
		nlapiLogExecution('DEBUG', 'GetAllopentaskData', exception);
	}
	//Nullify the objects.	 
	filters=null;
	columns=null;
	return ResultTaskRecords;
}

/**
 *  This function will fetch sales order details
 * @params OpenTaskList and salesOrderList
 * @returns {Array}
 */

function GetSalesOrderDetails(OpenTaskList,salesOrderList){
	var salesorderDetailListT = new Array();
	try
	{
		List = new Array();

		var filters = new Array();
		var columns = new Array();

		filters.push(new nlobjSearchFilter('internalid', null, 'anyof', salesOrderList));
		filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

		columns[0] = new nlobjSearchColumn('tranid');			
		columns[1] = new nlobjSearchColumn('shipmethod');	
		columns[2] = new nlobjSearchColumn('shipaddressee');	
		columns[3] = new nlobjSearchColumn('shipaddress1');
		columns[4] = new nlobjSearchColumn('shipaddress2');
		columns[5] = new nlobjSearchColumn('shipcity');
		columns[6] = new nlobjSearchColumn('shipstate');
		columns[7] = new nlobjSearchColumn('shipcountry');
		columns[8] = new nlobjSearchColumn('shipzip');
		columns[9] = new nlobjSearchColumn('shipphone');
		columns[10] = new nlobjSearchColumn('class');
		columns[11] = new nlobjSearchColumn('entity');
		columns[12] = new nlobjSearchColumn('billaddressee');
		columns[13] = new nlobjSearchColumn('billaddress1');
		columns[14] = new nlobjSearchColumn('billaddress2');
		columns[15] = new nlobjSearchColumn('billaddress3');
		columns[16] = new nlobjSearchColumn('billcity');
		columns[17] = new nlobjSearchColumn('billstate');
		columns[18] = new nlobjSearchColumn('billzip');
		columns[19] = new nlobjSearchColumn('billcountry');
		columns[20] = new nlobjSearchColumn('billphone');
		columns[21] = new nlobjSearchColumn('location');
		columns[22] = new nlobjSearchColumn('otherrefnum');
		columns[23] = new nlobjSearchColumn('terms');
		columns[24] = new nlobjSearchColumn('internalid');	
		columns[25] = new nlobjSearchColumn('department');
		columns[26] = new nlobjSearchColumn('trackingnumbers');

		var ResSSODetails = nlapiSearchRecord('salesorder', null, filters,columns);
		nlapiLogExecution('DEBUG', 'ResSSODetails Length', ResSSODetails.length);

		if ( ResSSODetails !=null && ResSSODetails.length > 0)
		{
			for ( var i = 0 ; i < ResSSODetails.length; i++ ){
				salesorderDetailList = new Array();

				salesorderDetailList[0] = ResSSODetails[i].getValue('tranid');
				salesorderDetailList[1] = ResSSODetails[i].getText('Shipmethod');
				salesorderDetailList[2] = ResSSODetails[i].getValue('shipaddressee');
				salesorderDetailList[3] = ResSSODetails[i].getValue('shipaddress1');
				salesorderDetailList[4] = ResSSODetails[i].getValue('shipaddress2');
				salesorderDetailList[5] = ResSSODetails[i].getValue('shipcity');
				salesorderDetailList[6] = ResSSODetails[i].getValue('shipstate');
				salesorderDetailList[7] = ResSSODetails[i].getValue('shipcountry');
				salesorderDetailList[8] = ResSSODetails[i].getValue('shipzip');
				salesorderDetailList[9] = ResSSODetails[i].getValue('shipphone');
				salesorderDetailList[10] = ResSSODetails[i].getText('class');
				salesorderDetailList[11] = ResSSODetails[i].getValue('entity');	
				salesorderDetailList[12] = ResSSODetails[i].getValue('billaddressee');
				salesorderDetailList[13] = ResSSODetails[i].getValue('billaddress1');
				salesorderDetailList[14] = ResSSODetails[i].getValue('billaddress2');
				salesorderDetailList[15] = ResSSODetails[i].getValue('billaddress3');
				salesorderDetailList[16] = ResSSODetails[i].getValue('billcity');
				salesorderDetailList[17] = ResSSODetails[i].getValue('billstate');
				salesorderDetailList[18] = ResSSODetails[i].getValue('billzip');
				salesorderDetailList[19] = ResSSODetails[i].getValue('billcountry');
				salesorderDetailList[20] = ResSSODetails[i].getValue('billphone');
				salesorderDetailList[21] = ResSSODetails[i].getValue('location');					
				salesorderDetailList[22] = ResSSODetails[i].getValue('otherrefnum');
				salesorderDetailList[23]=  ResSSODetails[i].getText('terms');
				salesorderDetailList[24] = ResSSODetails[i].getValue('internalid');				
				salesorderDetailList[25] = ResSSODetails[i].getValue('department');
				salesorderDetailList[26] = ResSSODetails[i].getValue('trackingnumbers');

				salesorderDetailListT.push(salesorderDetailList);
			}
		}
		// Get details from item master against the given item
	}

	catch(exception) 
	{
		nlapiLogExecution('DEBUG', 'Exception GetSalesOrderDetails', exception);
	}
	//Nullify the objects.	 
	filters=null;
	columns=null;
	return salesorderDetailListT;

}

/**
 *  This function will fetch open task order details 
 * @params searchrecordOpenTasks and orderno
 * @returns {Array}
 */
function GetIndividiualOpenTaskDetails(searchrecordOpenTasks,orderno){

	var individiualOpenTaskDetailsListT = new Array();
	var individiualOpenTaskDetailsList = new Array();
	nlapiLogExecution('DEBUG', 'orderno', orderno);
	try{

		if (searchrecordOpenTasks != null && searchrecordOpenTasks.length >0 && orderno != null && orderno.length>0){
			for ( var i = 0 ; i < searchrecordOpenTasks.length ; i++){

				if (searchrecordOpenTasks[i].getValue('custrecord_wmsse_order_no')  == orderno )
				{

					individiualOpenTaskDetailsList = new Array();
					individiualOpenTaskDetailsList[0] = searchrecordOpenTasks[i].getValue('custrecord_wmsse_line_no');
					individiualOpenTaskDetailsList[1] = searchrecordOpenTasks[i].getValue('custrecord_wmsse_sku');
					individiualOpenTaskDetailsList[2] = searchrecordOpenTasks[i].getText('custrecord_wmsse_sku');					
					individiualOpenTaskDetailsList[3] = searchrecordOpenTasks[i].getValue('custrecord_wmsse_act_qty');
					individiualOpenTaskDetailsList[4] = searchrecordOpenTasks[i].getValue('custrecord_wmsse_order_no');
					individiualOpenTaskDetailsList[5] = searchrecordOpenTasks[i].getValue('custrecord_wmsse_uom_level');					
					individiualOpenTaskDetailsList[6] = searchrecordOpenTasks[i].getValue('custrecord_wmsse_container_lp_no');
					individiualOpenTaskDetailsList[7] = searchrecordOpenTasks[i].getText('custrecord_wmsse_container_lp_no');
					individiualOpenTaskDetailsList[8] = searchrecordOpenTasks[i].getText('custrecord_wmsse_serial_no');
					individiualOpenTaskDetailsList[9] = searchrecordOpenTasks[i].getValue('custrecord_wmsse_act_end_date');
					individiualOpenTaskDetailsList[10] = searchrecordOpenTasks[i].getId();
					individiualOpenTaskDetailsList[11] = searchrecordOpenTasks[i].getValue('custrecord_wmsse_batch_no');
					individiualOpenTaskDetailsList[12] = searchrecordOpenTasks[i].getValue('custrecord_wmsse_packcode');				
					individiualOpenTaskDetailsList[13] = searchrecordOpenTasks[i].getValue('tranid','custrecord_wmsse_order_no');
					individiualOpenTaskDetailsList[14] = searchrecordOpenTasks[i].getValue('custrecord_wmsse_container_size');
					individiualOpenTaskDetailsListT.push(individiualOpenTaskDetailsList);
				}
			}
		}
	}
	catch(exception){
		nlapiLogExecution('DEBUG', 'individiualOpenTaskDetailsListT', exception);
	}

	nlapiLogExecution('DEBUG', 'GetIndividualOrderInfo', 'end');
	nlapiLogExecution('DEBUG', 'Individual order info-individiualOpenTaskDetailsListT', individiualOpenTaskDetailsListT);
	return individiualOpenTaskDetailsListT;
}


/**
 *  This function will fetch details of the order
 * @param orderlist and order
 * @returns {Array}
 */
function GetIndividualOrderInfo(OrderDetailList, OrderNo ){
	var IndividualOrderInfoListT = new Array();
	var IndividualOrderInfoList = new Array();
	nlapiLogExecution('DEBUG', 'GetIndividualOrderInfo', 'Start');
	nlapiLogExecution('DEBUG', 'OrderDetailList', OrderDetailList);
	nlapiLogExecution('DEBUG', 'OrderNo', OrderNo);
	try{

		if (OrderDetailList != null && OrderDetailList.length >0 && OrderNo != null && OrderNo.length>0){
			for ( var i = 0 ; i < OrderDetailList.length ; i++){

				if (OrderDetailList[i][24]  == OrderNo )
				{
					nlapiLogExecution('DEBUG', 'OrderNo matches and order internalid', OrderDetailList[i][44]);				
					IndividualOrderInfoList = new Array();

					IndividualOrderInfoList[0] = OrderDetailList[i][0];
					IndividualOrderInfoList[1] = OrderDetailList[i][1];
					IndividualOrderInfoList[2] = OrderDetailList[i][2];
					IndividualOrderInfoList[3] = OrderDetailList[i][3];
					IndividualOrderInfoList[4] = OrderDetailList[i][4];
					IndividualOrderInfoList[5] = OrderDetailList[i][5];
					IndividualOrderInfoList[6] = OrderDetailList[i][6];
					IndividualOrderInfoList[7] = OrderDetailList[i][7];
					IndividualOrderInfoList[8] = OrderDetailList[i][8];
					IndividualOrderInfoList[9] = OrderDetailList[i][9];
					IndividualOrderInfoList[10] = OrderDetailList[i][10];
					IndividualOrderInfoList[11] = OrderDetailList[i][11];
					IndividualOrderInfoList[12] = OrderDetailList[i][12];
					IndividualOrderInfoList[13] = OrderDetailList[i][13];
					IndividualOrderInfoList[14] = OrderDetailList[i][14];
					IndividualOrderInfoList[15] = OrderDetailList[i][15];
					IndividualOrderInfoList[16] = OrderDetailList[i][16]
					IndividualOrderInfoList[17] = OrderDetailList[i][17];
					IndividualOrderInfoList[18] = OrderDetailList[i][18];
					IndividualOrderInfoList[19] = OrderDetailList[i][19];
					IndividualOrderInfoList[20] = OrderDetailList[i][20];
					IndividualOrderInfoList[21] = OrderDetailList[i][21];
					IndividualOrderInfoList[22] = OrderDetailList[i][22];
					IndividualOrderInfoList[23] = OrderDetailList[i][23];
					IndividualOrderInfoList[24] = OrderDetailList[i][24];
					IndividualOrderInfoList[25] = OrderDetailList[i][25];
					IndividualOrderInfoList[26] = OrderDetailList[i][26];

					IndividualOrderInfoListT.push(IndividualOrderInfoList);		

				}

			}
		}


	}
	catch(exception){
		nlapiLogExecution('DEBUG', 'GetIndividualOrderInfo', exception);
	}

	nlapiLogExecution('DEBUG', 'GetIndividualOrderInfo', 'end');
	nlapiLogExecution('DEBUG', 'Individual order info-IndividualOrderInfoListT', IndividualOrderInfoListT);
	return IndividualOrderInfoListT;
}


/**
 *  This function will fetch details of the sku
 * @param skulist and sku
 * @returns {Array}
 */
function GetIndividualSKUInfo(skulist, sku ){

	var IndividualSKUInfoList = new Array();

	var IndividualSKUInfoListT = new Array();
	nlapiLogExecution('DEBUG', 'GetIndividualSKUInfo', 'Start');
	nlapiLogExecution('DEBUG', 'skulist', skulist);
	nlapiLogExecution('DEBUG', 'sku', sku);
	try{

		if (skulist != null && skulist.length >0 && sku != null && sku.length>0){
			for ( var i = 0 ; i < skulist.length ; i++){

				if (skulist[i][3]  == sku )
				{
					IndividualSKUInfoList = new Array();				
					IndividualSKUInfoList[0] = skulist[i][0]; 				
					IndividualSKUInfoList[1] = skulist[i][1];
					IndividualSKUInfoList[2] = skulist[i][2];
					IndividualSKUInfoList[3] = skulist[i][3];
					IndividualSKUInfoList[4] = skulist[i][4];
					IndividualSKUInfoList[5] = skulist[i][5];


					IndividualSKUInfoListT.push(IndividualSKUInfoList);
					i = skulist.length; 	
				}

			}
		}


	}
	catch(exception){
		nlapiLogExecution('DEBUG', 'GetIndividualSKUInfo', exception);

	}

	nlapiLogExecution('DEBUG', 'GetIndividualSKUInfo', 'end');
	nlapiLogExecution('DEBUG', 'IndividualSKUInfoListT', IndividualSKUInfoListT);
	return IndividualSKUInfoListT;
}

/**
 *  This function will fetch SO Line Order Setails
 * @param orderlist
 * @returns {string}
 */
function getallSOLinedetails(orderList)
{
	nlapiLogExecution('DEBUG', 'getallSOLinedetails', orderList);	
	var salesorderDetailList = new Array();
	var filters = new Array();
	var columns = new Array();
	filters.push(new nlobjSearchFilter('internalid', null, 'anyof', orderList));
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));

	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('rate');
	columns[2] = new nlobjSearchColumn('amount');
	columns[3] = new nlobjSearchColumn('quantity');
	columns[4] = new nlobjSearchColumn('line');


	var Res = nlapiSearchRecord('salesorder', null, filters,columns);
	nlapiLogExecution('DEBUG', 'getallSOLinedetails Res', Res);	
	//Nullify the objects.	 
	filters=null;
	columns=null;
	return Res;
}

/**
 *  This function will fetch UCCNO from uccMaster
 * @param containerLP
 * @returns {Array}
 */
function GetContainerCUCCDetails(containerLP){
	nlapiLogExecution('DEBUG', 'GetContainerSUCCDetails', 'Start');


	var ShipunitDetailsListT = new Array();
	try
	{
		var filters = new Array();
		var columns = new Array();


		var filters = new Array();
		filters.push(new nlobjSearchFilter('custrecord_wmsse_contlp',  null, 'is',containerLP));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_wmsse_uccno');


		var ResShipunitDetails = nlapiSearchRecord('customrecord_wmsse_ucc_master', null,	filters, columns);
		if ( ResShipunitDetails !=null && ResShipunitDetails.length > 0)
		{
			for ( var i = 0 ; i < ResShipunitDetails.length; i++ ){
				var ShipunitDetailsList = new Array();

				ShipunitDetailsList[0] = ResShipunitDetails[i].getValue('custrecord_wmsse_uccno');

				ShipunitDetailsListT.push(ShipunitDetailsList);
			}
		}
	}

	catch(exception) 
	{
		nlapiLogExecution('DEBUG', ' GetContainerSUCCDetails', exception);
	}

	nlapiLogExecution('DEBUG', 'GetContainerSUCCDetails', 'end');
	nlapiLogExecution('DEBUG', 'ShipunitDetailsListT',ShipunitDetailsListT);
	//Nullify the objects.	 
	filters=null;
	columns=null;
	return ShipunitDetailsListT;

}

/**
 *  This function will fetch currentdate in mmddyy format
 * @param 
 * @returns {date}
 */

function DateStamp(){
	var now = new Date();
	return ((parseInt(now.getMonth()) + 1) + '/' + (parseInt(now.getDate())) + '/' + now.getFullYear());
}

/**
 *  This function will update hostid in open task for that order
 * @param Orderno
 * @returns {}
 */
function updateHostIDforOrder(Orderno)
{
	nlapiLogExecution('DEBUG', 'updateHostIDforOrder shiplp', Orderno);
	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', Orderno));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [14])); 	
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [14])); 

	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_wmsse_order_no');

	var searchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask' , null,	filters, columns);	
	if(searchresults !=null)
		nlapiLogExecution('DEBUG', 'number of orders for this order', searchresults.length);
	for(var cn=0; searchresults !=null && cn<searchresults.length; cn++)
	{
		nlapiLogExecution('DEBUG', 'updateHostIDforOrder orders', searchresults[cn].getText('custrecord_wmsse_order_no'));
		try
		{
			nlapiSubmitField('customrecord_wmsse_trn_opentask',searchresults[cn].getId(), 'custrecord_wmsse_hostid', 'SPS');
		}
		catch (exp) {
			nlapiLogExecution('DEBUG', 'Exeception in updateHostIDforOrder', exp);
		}
	}
}