/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
function ECM_Rest_GET(datain) 
{
	nlapiLogExecution('ERROR', 'datain.recordtype', 'datain');
}
function ECM_Rest_PUT(request, response) 
{
}



function ECM_Rest_POST(datain) 
{
	var err = new Object();
	try
	{
		nlapiLogExecution('ERROR', 'datain.recordtype', 'datain');
		//nlapiLogExecution('ERROR', 'datain.recordtype', datain);

		//"Trailer":[{"location": "Main Warehouse","name": "TR12345","TrailerName": "TR12345"}],
		if(datain != null && datain != 'null' && datain != '' && datain != 'undefined' && datain != '' && datain.Container != 'null' && datain.Container != '')
		{
			var vContNumber=datain.Container[0].ContainerNo;
			//updateRestletScriptStatus('3',vcuruserId,'Invoked',vContNumber,intergration,RestletName,ErrorDetails,TransactionType,vContNumber);
			for(var i=0;i<datain.Container.length;i++)
			{
				try{
					var vType = datain.Container[i].Type;
					var vTrailerLocation = datain.Container[i].Location;
					var vContainerNo=datain.Container[i].ContainerNo;
					var vContainerIntrId = datain.Container[i].ContainerInternalId;
					//var vTrailerName=datain.Trailer[i].TrailerNo;
					var vAppointmentNo=datain.Container[i].AppointmentNo;
					var vContainerType = datain.Container[i].ContainerType;					
					var vDescription=datain.Container[i].Description;
					var vBOLNo=datain.Container[i].BOLNo;
					var vBOLDate=datain.Container[i].BOLDate;
					var vIncoTerms=datain.Container[i].IncoTerms;
					var vOriginPort=datain.Container[i].OriginPort;
					var vLoadPort=datain.Container[i].LoadPort;
					var vDischargePort=datain.Container[i].DischargePort;
					var vCountryOfOrigin=datain.Container[i].CountryOfOrigin;
					var vTotalVolume=datain.Container[i].TotalVolume;
					var vTotalVolumeUOM=datain.Container[i].TotalVolumeUOM;					
					var vTotalWeight=datain.Container[i].TotalWeight;
					var vTotalWeightUOM=datain.Container[i].TotalWeightUOM;
					var vShippingDate=datain.Container[i].ShippingDate;
					var vCarrierId=datain.Container[i].CarrierId;
					var vDockNo=datain.Container[i].DockNo;
					var vDestination=datain.Container[i].Destination;
					var vExpArrDate=datain.Container[i].ExpArrDate;
					var vExpArrTime=datain.Container[i].ExpArrTime;					
					var vArrDate=datain.Container[i].ArrDate;
					var vArrTime=datain.Container[i].ArrTime;
					var vExpDepartDate=datain.Container[i].ExpDepartDate;
					var vExpDepartTime=datain.Container[i].ExpDepartTime;
					var vDepartDate=datain.Container[i].DepartDate;
					var vDepartTime=datain.Container[i].DepartTime;
					var vDCNo=datain.Container[i].DCNo;
					var vSealNo=datain.Container[i].SealNo;
					var vHazmat=datain.Container[i].Hazmat;					
					var vMasterShipperNo=datain.Container[i].MasterShipperNo;
					var vProNo=datain.Container[i].ProNo;
					var vFactoryInvNo=datain.Container[i].FactoryInvNo;
					var vStatus=datain.Container[i].Status;

					var str = 'vType = ' + vType + '<br>';
					str = str + 'vContainerNo =' + vContainerNo + '<br>';
					str = str + 'vTrailerLocation =' + vTrailerLocation + '<br>';	
					str = str + 'vContainerIntrId. = ' + vContainerIntrId + '<br>';
					str = str + 'vAppointmentNo. = ' + vAppointmentNo + '<br>';
					str = str + 'vContainerType. = ' + vContainerType + '<br>';					
					str = str + 'vDescription =' + vDescription + '<br>';	
					str = str + 'vBOLNo. = ' + vBOLNo + '<br>';
					str = str + 'vBOLDate. = ' + vBOLDate + '<br>';
					str = str + 'vIncoTerms. = ' + vIncoTerms + '<br>';					
					str = str + 'vOriginPort =' + vOriginPort + '<br>';	
					str = str + 'vLoadPort. = ' + vLoadPort + '<br>';
					str = str + 'vDischargePort. = ' + vDischargePort + '<br>';
					str = str + 'vCountryOfOrigin. = ' + vCountryOfOrigin + '<br>';					
					str = str + 'vTotalVolume. = ' + vTotalVolume + '<br>';					
					str = str + 'vTotalVolumeUOM =' + vTotalVolumeUOM + '<br>';	
					str = str + 'vTotalWeight. = ' + vTotalWeight + '<br>';
					str = str + 'vTotalWeightUOM. = ' + vTotalWeightUOM + '<br>';
					str = str + 'vShippingDate. = ' + vShippingDate + '<br>';					
					str = str + 'vCarrierId. = ' + vCarrierId + '<br>';					
					str = str + 'vDockNo =' + vDockNo + '<br>';	
					str = str + 'vDestination. = ' + vDestination + '<br>';
					str = str + 'vExpArrDate. = ' + vExpArrDate + '<br>';
					str = str + 'vExpArrTime. = ' + vExpArrTime + '<br>';					
					str = str + 'vArrDate =' + vArrDate + '<br>';	
					str = str + 'vArrTime. = ' + vArrTime + '<br>';
					str = str + 'vExpDepartDate. = ' + vExpDepartDate + '<br>';
					str = str + 'vExpDepartTime. = ' + vExpDepartTime + '<br>';					
					str = str + 'vDepartDate =' + vDepartDate + '<br>';	
					str = str + 'vDepartTime. = ' + vDepartTime + '<br>';
					str = str + 'vDCNo. = ' + vDCNo + '<br>';
					str = str + 'vSealNo. = ' + vSealNo + '<br>';					
					str = str + 'vHazmat. = ' + vHazmat + '<br>';
					str = str + 'vMasterShipperNo. = ' + vMasterShipperNo + '<br>';					
					str = str + 'vProNo. = ' + vProNo + '<br>';
					str = str + 'vFactoryInvNo. = ' + vFactoryInvNo + '<br>';
					str = str + 'vStatus. = ' + vStatus + '<br>';
					
					nlapiLogExecution('DEBUG', 'str', str);

					var vContainerTypeIntrId,vIncotermsIntrId,vOriginPortIntrId,vLoadPortIntrId,vDischargePortIntrId,vTotalVolumeUOMIntrId,vTotalWeightUOMIntrId,vDockNoIntrId,vDestinationIntrId,vStatusIntrId='';

					if(vContainerType!=null && vContainerType!='')
					{
						vContainerTypeIntrId = getContainerTypeId(vContainerType);
					}

					if(vIncoTerms!=null && vIncoTerms!='')
					{
						vIncotermsIntrId = getIncoTermsId(vIncoTerms);
					}

					if(vOriginPort!=null && vOriginPort!='')
					{
						vOriginPortIntrId = getPortId(vOriginPort);
					}

					if(vLoadPort!=null && vLoadPort!='')
					{
						vLoadPortIntrId = getPortId(vLoadPort);
					}

					if(vDischargePort!=null && vDischargePort!='')
					{
						vDischargePortIntrId = getPortId(vDischargePort);
					}

					if(vTotalVolumeUOM!=null && vTotalVolumeUOM!='')
					{
						vTotalVolumeUOMIntrId = getUOMId(vTotalVolumeUOM);
					}

					if(vTotalWeightUOM!=null && vTotalWeightUOM!='')
					{
						vTotalWeightUOMIntrId = getUOMId(vTotalWeightUOM);
					}

					if(vDockNo!=null && vDockNo!='')
					{
						vDockNoIntrId = getDockId(vDockNo,vTrailerLocation);
					}

					if(vDestination!=null && vDestination!='')
					{
						vDestinationIntrId = getDestinationId(vDestination);
					}

					if(vStatus!=null && vStatus!='')
					{
						vStatusIntrId = getStatusId(vStatus);
					}


					if(vContainerNo != null && vContainerNo != '')
					{
						/*var recordidvalue = getRecordIdval(vContainerNo);	
						nlapiLogExecution('DEBUG', 'Container recordidvalue', recordidvalue);*/

						if(vType == 'edit')
						{

							var recordidvalue = getRecordIdval(vContainerNo);	
							nlapiLogExecution('DEBUG', 'Container recordidvalue', recordidvalue);

							if(recordidvalue!=null && recordidvalue!='' && recordidvalue!='null' && recordidvalue.length>0)
							{
								for(var p=0;p<recordidvalue.length;p++)
								{

									var customrecordedit = nlapiLoadRecord('customrecord_wmsse_trailer',recordidvalue[p]);
									customrecordedit.setFieldValue('name', vContainerNo);

									if(vTrailerLocation!=null && vTrailerLocation!='' && vTrailerLocation!='null' && vTrailerLocation!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_sitetrailer', vTrailerLocation);

									if(vAppointmentNo!=null && vAppointmentNo!='' && vAppointmentNo!='null' && vAppointmentNo!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_appointmenttrailer', vAppointmentNo);

									if(vCarrierId!=null && vCarrierId!='' && vCarrierId!='null' && vCarrierId!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_carrieridtrailer', vCarrierId);

									if(vDockNoIntrId!=null && vDockNoIntrId!='' && vDockNoIntrId!='null' && vDockNoIntrId!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_dock', vDockNoIntrId);

									/*if(vDestinationIntrId!=null && vDestinationIntrId!='')
								customrecordedit.setFieldValue('custrecord_ebizdestination', vDestinationIntrId);*/

									if(vExpArrDate!=null && vExpArrDate!='' && vExpArrDate!='null' && vExpArrDate!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_exparrivaldate', vExpArrDate);

									if(vExpArrTime!=null && vExpArrTime!='' && vExpArrTime!='null' && vExpArrTime!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_exparrivaltime', vExpArrTime);

									if(vExpDepartDate!=null && vExpDepartDate!='' && vExpDepartDate!='null' && vExpDepartDate!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_expdepartdate', vExpDepartDate);

									if(vExpDepartTime!=null && vExpDepartTime!='' && vExpDepartTime!='null' && vExpDepartTime!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_expdeparttime', vExpDepartTime);
									
									if(vDCNo!=null && vDCNo!='' && vDCNo!='null' && vDCNo!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_dc', vDCNo);
									
									if(vSealNo!=null && vSealNo!='' && vSealNo!='null' && vSealNo!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_seal', vSealNo);

									if(vArrDate!=null && vArrDate!='' && vArrDate!='null' && vArrDate!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_arrivaldate', vArrDate);

									if(vArrTime!=null && vArrTime!='' && vArrTime!='null' && vArrTime!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_arrivaltime', vArrTime);

									if(vDepartDate !=null && vDepartDate !='' && vDepartDate !='null' && vDepartDate !='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_departdate', vDepartDate);

									if(vDepartTime !=null && vDepartTime !='' && vDepartTime !='null' && vDepartTime !='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_departtime', vDepartTime);	
									
									if(vHazmat !=null && vHazmat!='' && vHazmat!='null' && vHazmat!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_hazmat', vHazmat);		
									
									if(vMasterShipperNo !=null && vMasterShipperNo!='' && vMasterShipperNo!='null' && vMasterShipperNo!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_mastershipper', vMasterShipperNo);
									
									if(vContainerNo!=null && vContainerNo!='' && vContainerNo!='null' && vContainerNo!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_vehicle', vContainerNo);
									
									if(vProNo!=null && vProNo!='' && vProNo!='null' && vProNo!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_pro', vProNo);	
									
									if(vDescription!=null && vDescription!='' && vDescription!='null' && vDescription!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_trldescription', vDescription);
									
									if(vBOLNo!=null && vBOLNo!='' && vBOLNo!='null' && vBOLNo!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_trlbolno', vBOLNo);

									if(vBOLDate != null && vBOLDate != 'null' && vBOLDate != '' && vBOLDate != 'undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trlboldate', vBOLDate);
									
									if(vTotalVolume != null && vTotalVolume != 'null' && vTotalVolume != '' && vTotalVolume != 'undefined')
										{
										customrecordedit.setFieldValue('custrecord_wmsse_trltotvolume', vTotalVolume);
										}
									if(vTotalWeight != null && vTotalWeight != 'null' && vTotalWeight != '' && vTotalWeight != 'undefined')
									{
									customrecordedit.setFieldValue('custrecord_wmsse_trltotweight', vTotalWeight);
									}
									if(vShippingDate!=null && vShippingDate!='' && vShippingDate != 'null' && vShippingDate != 'undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trlshippingdate', vShippingDate);
									
									if(vFactoryInvNo!=null && vFactoryInvNo!='' && vFactoryInvNo!='null' && vFactoryInvNo!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_trlfactoryinvoice', vFactoryInvNo);

									if(vContainerTypeIntrId !=null && vContainerTypeIntrId !='' && vContainerTypeIntrId !='null' && vContainerTypeIntrId !='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trlconttype', vContainerTypeIntrId);

									if(vIncotermsIntrId !=null && vIncotermsIntrId !='' && vIncotermsIntrId !='null' && vIncotermsIntrId !='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trlincoterms', vIncotermsIntrId);											

									if(vOriginPortIntrId !=null && vOriginPortIntrId !='' && vOriginPortIntrId !='null' && vOriginPortIntrId !='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trloriginport', vOriginPortIntrId);

									if(vLoadPortIntrId !=null && vLoadPortIntrId !='' && vLoadPortIntrId !='null' && vLoadPortIntrId !='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trlloadport', vLoadPortIntrId);

									if(vDischargePortIntrId !=null && vDischargePortIntrId !='' && vDischargePortIntrId !='null' && vDischargePortIntrId !='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trldischargeport', vDischargePortIntrId);

									if(vCountryOfOrigin !=null && vCountryOfOrigin !='' && vCountryOfOrigin !='null' && vCountryOfOrigin !='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trlcountryoforigin', vCountryOfOrigin);

									if(vTotalVolumeUOMIntrId !=null && vTotalVolumeUOMIntrId !='' && vTotalVolumeUOMIntrId !='null' && vTotalVolumeUOMIntrId !='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trltotvolumeuom', vTotalVolumeUOMIntrId);

									if(vTotalWeightUOMIntrId !=null && vTotalWeightUOMIntrId !='' && vTotalWeightUOMIntrId!='null' && vTotalWeightUOMIntrId!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trltotweightuom', vTotalWeightUOMIntrId);

									if(vStatusIntrId!=null && vStatusIntrId!='' && vStatusIntrId!='null' && vStatusIntrId!='undefined')
										customrecordedit.setFieldValue('custrecord_wmsse_trlstatus', vStatusIntrId);
									
									if(vContainerIntrId!=null && vContainerIntrId!='' && vContainerIntrId!='null' && vContainerIntrId!='undefined')
									customrecordedit.setFieldValue('custrecord_wmsse_ecmcontainerrefno', vContainerIntrId);

									var recidedit = nlapiSubmitRecord(customrecordedit);
									nlapiLogExecution('ERROR', 'recidHeader', recidedit);


								}
							}

						}


						else
						{

							//if(vType == 'create' || vType == '' || vType == null || vType == 'null')
							//{

							var customrecord = nlapiCreateRecord('customrecord_wmsse_trailer');

							customrecord.setFieldValue('name', vContainerNo);

							if(vTrailerLocation !=null && vTrailerLocation !='' && vTrailerLocation !='null' && vTrailerLocation !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_sitetrailer', vTrailerLocation);
							
							if(vAppointmentNo !=null && vAppointmentNo !='' && vAppointmentNo !='null' && vAppointmentNo!='undefined')
							customrecord.setFieldValue('custrecord_wmsse_appointmenttrailer', vAppointmentNo);

							if(vCarrierId !=null && vCarrierId !='' && vCarrierId !='null' && vCarrierId !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_carrieridtrailer', vCarrierId);

							if(vDockNoIntrId !=null && vDockNoIntrId !='' && vDockNoIntrId !='null' && vDockNoIntrId !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_dock', vDockNoIntrId);

							/*if(vDestinationIntrId!=null && vDestinationIntrId!='')
									customrecord.setFieldValue('custrecord_ebizdestination', vDestinationIntrId);*/

							if(vExpArrDate !=null && vExpArrDate !='' && vExpArrDate !='null' && vExpArrDate !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_exparrivaldate', vExpArrDate);

							if(vExpArrTime !=null && vExpArrTime !='' && vExpArrTime !='null' && vExpArrTime !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_exparrivaltime', vExpArrTime);

							if(vExpDepartDate !=null && vExpDepartDate !='' && vExpDepartDate !='null' && vExpDepartDate !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_expdepartdate', vExpDepartDate);

							if(vExpDepartTime !=null && vExpDepartTime !='' && vExpDepartTime !='null' && vExpDepartTime !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_expdeparttime', vExpDepartTime);

							if(vDCNo !=null && vDCNo !='' && vDCNo !='null' && vDCNo !='undefined')
							customrecord.setFieldValue('custrecord_wmsse_dc', vDCNo);
							
							if(vSealNo !=null && vSealNo !='' && vSealNo !='null' && vSealNo !='undefined')
							customrecord.setFieldValue('custrecord_wmsse_seal', vSealNo);

							if(vArrDate !=null && vArrDate !='' && vArrDate !='null' && vArrDate !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_arrivaldate', vArrDate);

							if(vArrTime !=null && vArrTime !='' && vArrTime !='null' && vArrTime !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_arrivaltime', vArrTime);

							if(vDepartDate !=null && vDepartDate !='' && vDepartDate !='null' && vDepartDate !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_departdate', vDepartDate);

							if(vDepartTime !=null && vDepartTime !='' && vDepartTime !='null' && vDepartTime !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_departtime', vDepartTime);						

							if(vHazmat !=null && vHazmat !='' && vHazmat !='null' && vHazmat !='undefined')
							customrecord.setFieldValue('custrecord_wmsse_hazmat', vHazmat);		
							
							if(vMasterShipperNo !=null && vMasterShipperNo !='' && vMasterShipperNo !='null' && vMasterShipperNo !='undefined')
							customrecord.setFieldValue('custrecord_wmsse_mastershipper', vMasterShipperNo);
							
							if(vContainerNo !=null && vContainerNo !='' && vContainerNo !='null' && vContainerNo !='undefined')
							customrecord.setFieldValue('custrecord_wmsse_vehicle', vContainerNo);
							
							if(vProNo !=null && vProNo !='' && vProNo !='null' && vProNo!='undefined')
							customrecord.setFieldValue('custrecord_wmsse_pro', vProNo);						
							
							if(vDescription !=null && vDescription !='' && vDescription !='null' && vDescription !='undefined')
							customrecord.setFieldValue('custrecord_wmsse_trldescription', vDescription);
							
							if(vBOLNo !=null && vBOLNo!='' && vBOLNo!='null' && vBOLNo!='undefined')
							customrecord.setFieldValue('custrecord_wmsse_trlbolno', vBOLNo);

							if(vBOLDate!=null && vBOLDate!='' && vBOLDate!='null' && vBOLDate!='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trlboldate', vBOLDate);
							if(vTotalVolume!=null && vTotalVolume!='' && vTotalVolume!='null' && vTotalVolume!='undefined')
							customrecord.setFieldValue('custrecord_wmsse_trltotvolume', vTotalVolume);
							if(vTotalWeight!=null && vTotalWeight!='' && vTotalWeight!='null' && vTotalWeight!='undefined')
							customrecord.setFieldValue('custrecord_wmsse_trltotweight', vTotalWeight);

							if(vShippingDate!=null && vShippingDate!='' && vShippingDate!='null' && vShippingDate!='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trlshippingdate', vShippingDate);

							if(vFactoryInvNo!=null && vFactoryInvNo!='' && vFactoryInvNo!='null' && vFactoryInvNo!='undefined')
							customrecord.setFieldValue('custrecord_wmsse_trlfactoryinvoice', vFactoryInvNo);

							if(vContainerTypeIntrId!=null && vContainerTypeIntrId!='' && vContainerTypeIntrId!='null' && vContainerTypeIntrId!='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trlconttype', vContainerTypeIntrId);

							if(vIncotermsIntrId!=null && vIncotermsIntrId!='' && vIncotermsIntrId!='null' && vIncotermsIntrId!='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trlincoterms', vIncotermsIntrId);											

							if(vOriginPortIntrId !=null && vOriginPortIntrId !='' && vOriginPortIntrId !='null' && vOriginPortIntrId!='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trloriginport', vOriginPortIntrId);

							if(vLoadPortIntrId !=null && vLoadPortIntrId !='' && vLoadPortIntrId !='null' && vLoadPortIntrId !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trlloadport', vLoadPortIntrId);

							if(vDischargePortIntrId !=null && vDischargePortIntrId !='' && vDischargePortIntrId !='null' && vDischargePortIntrId !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trldischargeport', vDischargePortIntrId);

							if(vCountryOfOrigin !=null && vCountryOfOrigin !='' && vCountryOfOrigin !='null' && vCountryOfOrigin !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trlcountryoforigin', vCountryOfOrigin);

							if(vTotalVolumeUOMIntrId !=null && vTotalVolumeUOMIntrId!='' && vTotalVolumeUOMIntrId!='null' && vTotalVolumeUOMIntrId!='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trltotvolumeuom', vTotalVolumeUOMIntrId);

							if(vTotalWeightUOMIntrId !=null && vTotalWeightUOMIntrId!='' && vTotalWeightUOMIntrId!='null' && vTotalWeightUOMIntrId!='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trltotweightuom', vTotalWeightUOMIntrId);

							if(vStatusIntrId !=null && vStatusIntrId !='' && vStatusIntrId !='null' && vStatusIntrId!='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trlstatus', vStatusIntrId);

							if(vContainerIntrId !=null && vContainerIntrId!='' && vContainerIntrId!='null' && vContainerIntrId!='undefined')
							customrecord.setFieldValue('custrecord_wmsse_ecmcontainerrefno', vContainerIntrId);

							var recid = nlapiSubmitRecord(customrecord);
							nlapiLogExecution('ERROR', 'recidHeader', recid);
							//}
						}
					}
				}
				catch (e)
				{
					nlapiLogExecution('DEBUG', 'Exception in Container details', e);
					ErrorDetails=e;
					//updateRestletScriptStatus('3',vcuruserId,'Error',vContNumber,intergration,RestletName,ErrorDetails,TransactionType,vContNumber);
				}
			}

			//{"location": "Main Warehouse","name": "TR12345","POName": "PO1","Item":"327BLU","POLineNo":"1","OrdQty":"10","ExpQty":"8","Closed":"F","UOM":"EACH","Notes":"TEST"}
			if(datain != null && datain != '' && datain.ContainerLine != null && datain.ContainerLine != '')
			{


				for(var j=0;j<datain.ContainerLine.length;j++)
				{
					try
					{
						var vType=datain.ContainerLine[j].Type;
						var vLineLocation=datain.ContainerLine[j].Location;
						var vLineContainerNo=datain.ContainerLine[j].ContainerNo;
						var vLineShipmentNo=datain.ContainerLine[j].ShipmentNo;
						var vPOName=datain.ContainerLine[j].PONo;				
						var vLineTransactionType=datain.ContainerLine[j].TransactionType;
						var vLinePOLineNo=datain.ContainerLine[j].POLineNo;
						var vLineItem=datain.ContainerLine[j].Item;
						var vLineOrdQty=datain.ContainerLine[j].OrdQty;
						var vLineExpQty=datain.ContainerLine[j].ExpQty;
						var vLineUOM=datain.ContainerLine[j].UOM;
						var vLineNotes=datain.ContainerLine[j].Notes;
						var vLineTotWeight=datain.ContainerLine[j].TotalWeight;
						var vLineTotWeightUOM=datain.ContainerLine[j].TotalWeightUOM;
						var vLineTotalVolume=datain.ContainerLine[j].TotalVolume;
						var vLineTotalVolumeUOM=datain.ContainerLine[j].TotalVolumeUOM;

						var str = 'vLineLocation =' + vLineLocation + '<br>';
						str = str + 'vType. = ' + vType + '<br>';
						str = str + 'vLineContainerNo. = ' + vLineContainerNo + '<br>';
						str = str + 'vLineShipmentNo. = ' + vLineShipmentNo + '<br>';
						str = str + 'vLinePONo. = ' + vPOName + '<br>';
						str = str + 'vLineTransactionType. = ' + vLineTransactionType + '<br>';
						str = str + 'vLinePOLineNo. = ' + vLinePOLineNo + '<br>';
						str = str + 'vLineItem. = ' + vLineItem + '<br>';
						str = str + 'vLineOrdQty. = ' + vLineOrdQty + '<br>';
						str = str + 'vLineExpQty. = ' + vLineExpQty + '<br>';
						str = str + 'vLineUOM. = ' + vLineUOM + '<br>';
						str = str + 'vLineNotes. = ' + vLineNotes + '<br>';
						str = str + 'vLineTotWeight. = ' + vLineTotWeight + '<br>';
						str = str + 'vLineTotWeightUOM. = ' + vLineTotWeightUOM + '<br>';
						str = str + 'vLineTotalVolume. = ' + vLineTotalVolume + '<br>';
						str = str + 'vLineTotalVolumeUOM. = ' + vLineTotalVolumeUOM + '<br>';

						nlapiLogExecution('DEBUG', 'Container Line', str);
						nlapiLogExecution('DEBUG', 'datain.ContainerLine.length',datain.ContainerLine.length);

						var customrecordID3 = "purchaseorder"; //for purchase order internal id
						var vLinePONo = GetId(vPOName,customrecordID3);

						var vLineUOMIntrId='';

						if(vLineUOM!=null && vLineUOM!='')
							vLineUOMIntrId=getUOMId(vLineUOM);

						if(vLineContainerNo != null && vLineContainerNo != '')
						{


							if(vType == 'edit')
							{

								var recordidvalueline = getRecordIdvalLine(vLineContainerNo);	
								nlapiLogExecution('DEBUG', 'Container recordidvalue Line', recordidvalueline);

								if(recordidvalueline!=null && recordidvalueline!='' && recordidvalueline!='null' && recordidvalueline.length>0)
								{
									for(var q=0;q<recordidvalueline.length;q++)
									{

										var customrecordline = nlapiLoadRecord('customrecord_wmsse_trailerline',recordidvalueline[q]);
										customrecordline.setFieldValue('name', vLineContainerNo);

										if(vLineContainerNo !=null && vLineContainerNo !='' && vLineContainerNo !='null' && vLineContainerNo!='undefined')
											customrecordline.setFieldValue('custrecord_wmsse_trlnumber', vLineContainerNo);

										if(vLineShipmentNo !=null && vLineShipmentNo !='' && vLineShipmentNo !='null' && vLineShipmentNo !='undefined')
										customrecordline.setFieldValue('custrecord_wmsse_trllineshipment', vLineShipmentNo);

										if(vLinePONo !=null && vLinePONo !='' && vLinePONo !='null' && vLinePONo !='undefined')
											customrecordline.setFieldValue('custrecord_wmsse_trllinepono', vLinePONo);

										if(vLineTransactionType  !=null && vLineTransactionType !='' && vLineTransactionType !='null' && vLineTransactionType !='undefined')
											customrecordline.setFieldValue('custrecord_wmsse_trllinetrantype', vLineTransactionType);							

										if(vLinePOLineNo  !=null && vLinePOLineNo !='' && vLinePOLineNo !='null' && vLinePOLineNo !='undefined')
											customrecordline.setFieldValue('custrecord_wmsse_trllinepolineno', vLinePOLineNo);

										if(vLineItem !=null && vLineItem !='' && vLineItem !='null' && vLineItem !='undefined')
											customrecordline.setFieldValue('custrecord_wmsse_trllineitem', vLineItem);	

										if(vLineOrdQty !=null && vLineOrdQty !='' && vLineOrdQty !='null' && vLineOrdQty !='undefined')
										customrecordline.setFieldValue('custrecord_wmsse_trllineordqty', vLineOrdQty);							

										if(vLineExpQty !=null && vLineExpQty !='' && vLineExpQty !='null' && vLineExpQty!='undefined')
										customrecordline.setFieldValue('custrecord_wmsse_trllineexpqty', vLineExpQty);

										if(vLineUOMIntrId  !=null && vLineUOMIntrId !='' && vLineUOMIntrId !='null' && vLineUOMIntrId !='undefined')
											customrecordline.setFieldValue('custrecord_wmsse_trllineuom', vLineUOMIntrId);					

										if(vLineLocation !=null && vLineLocation !='' && vLineLocation !='null' && vLineLocation !='undefined')
											customrecordline.setFieldValue('custrecord_wmsse_trllinelocation', vLineLocation);

										if(vLineNotes !=null && vLineNotes !='' && vLineNotes !='null' && vLineNotes !='undefined')
											customrecordline.setFieldValue('custrecord_wmsse_trllinenotes', vLineNotes);

										if(vLineTotWeight !=null && vLineTotWeight !='' && vLineTotWeight !='null' && vLineTotWeight!='undefined')
										customrecordline.setFieldValue('custrecord_wmsse_trllinetotweight', vLineTotWeight);
										
										if(vLineTotalVolume !=null && vLineTotalVolume !='' && vLineTotalVolume !='null' && vLineTotalVolume !='undefined')
										customrecordline.setFieldValue('custrecord_wmsse_trllinetotvolume', vLineTotalVolume);


										var linerecidedit = nlapiSubmitRecord(customrecordline);
										nlapiLogExecution('ERROR', 'linerecidedit', linerecidedit);


									}
								}

							}
							else
							{

								var customrecord = nlapiCreateRecord('customrecord_wmsse_trailerline');

								customrecord.setFieldValue('name', vLineContainerNo);

								if(vLineContainerNo  !=null && vLineContainerNo !='' && vLineContainerNo !='null' && vLineContainerNo !='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trlnumber', vLineContainerNo);

								if(vLineShipmentNo !=null && vLineShipmentNo !='' && vLineShipmentNo !='null' && vLineShipmentNo!='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trllineshipment', vLineShipmentNo);

								if(vLinePONo !=null && vLinePONo !='' && vLinePONo !='null' && vLinePONo!='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllinepono', vLinePONo);

								if(vLineTransactionType !=null && vLineTransactionType !='' && vLineTransactionType !='null' && vLineTransactionType !='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllinetrantype', vLineTransactionType);							

								if(vLinePOLineNo !=null && vLinePOLineNo !='' && vLinePOLineNo !='null' && vLinePOLineNo !='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllinepolineno', vLinePOLineNo);

								if(vLineItem !=null && vLineItem !='' && vLineItem !='null' && vLineItem!='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllineitem', vLineItem);	

								if(vLineOrdQty !=null && vLineOrdQty !='' && vLineOrdQty !='null' && vLineOrdQty !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trllineordqty', vLineOrdQty);							

								if(vLineExpQty !=null && vLineExpQty !='' && vLineExpQty !='null' && vLineExpQty !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trllineexpqty', vLineExpQty);

								if(vLineUOMIntrId !=null && vLineUOMIntrId !='' && vLineUOMIntrId !='null' && vLineUOMIntrId !='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllineuom', vLineUOMIntrId);					

								if(vLineLocation !=null && vLineLocation !='' && vLineLocation !='null' && vLineLocation !='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllinelocation', vLineLocation);

								if(vLineNotes !=null && vLineNotes !='' && vLineNotes !='null' && vLineNotes !='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllinenotes', vLineNotes);

								if(vLineTotWeight !=null && vLineTotWeight !='' && vLineTotWeight !='null' && vLineTotWeight !='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trllinetotweight', vLineTotWeight);
								
								if(vLineTotalVolume !=null && vLineTotalVolume !='' && vLineTotalVolume!='null' && vLineTotalVolume!='undefined')
								customrecord.setFieldValue('custrecord_wmsse_trllinetotvolume', vLineTotalVolume);


								var linerecid = nlapiSubmitRecord(customrecord);
								nlapiLogExecution('ERROR', 'recidLine', linerecid);
							}
						}	

					}
					catch(exp)
					{
						nlapiLogExecution('DEBUG', 'Exception in Container line details', exp);
						ErrorDetails=exp;
						//updateRestletScriptStatus('3',vcuruserId,'Error',vContNumber,intergration,RestletName,ErrorDetails,TransactionType,vContNumber);
					}
				}
			}

				if(datain != null && datain != '' && datain.ContainerLinePkgDetails != null && datain.ContainerLinePkgDetails != '')
				{
					for(var k=0;k<datain.ContainerLinePkgDetails.length;k++)
					{
						try
						{
							var vLinePkgLocation=datain.ContainerLinePkgDetails[k].Location;
							var vLinePkgContainerNo=datain.ContainerLinePkgDetails[k].ContainerNo;
							var vLinePkgShipmentNo=datain.ContainerLinePkgDetails[k].ShipmentNo;
							var vPOName=datain.ContainerLinePkgDetails[k].PONo;				
							var vLinePkgTransactionType=datain.ContainerLinePkgDetails[k].TransactionType;
							var vLinePkgPOLineNo=datain.ContainerLinePkgDetails[k].POLineNo;
							var vLinePkgItem=datain.ContainerLinePkgDetails[k].Item;
							var vLinePkgOrdQty=datain.ContainerLinePkgDetails[k].OrdQty;
							var vLinePkgExpQty=datain.ContainerLinePkgDetails[k].ExpQty;
							var vLinePkgTotWeight=datain.ContainerLinePkgDetails[k].TotalWeight;
							var vLinePkgTotWeightUOM=datain.ContainerLinePkgDetails[k].TotalWeightUOM;
							var vLinePkgTotalVolume=datain.ContainerLinePkgDetails[k].TotalVolume;
							var vLinePkgTotalVolumeUOM=datain.ContainerLinePkgDetails[k].TotalVolumeUOM;
							var vLinePkgLotNo=datain.ContainerLinePkgDetails[k].LotNo;
							var vLinePkgLPNo=datain.ContainerLinePkgDetails[k].LPNo;
							var vLinePkgSerialNo=datain.ContainerLinePkgDetails[k].SerialNo;
							var vLinePkgLotQty=datain.ContainerLinePkgDetails[k].LotNoQty;


							var str = 'vLinePkgLocation =' + vLinePkgLocation + '<br>';	
							str = str + 'vLinePkgContainerNo. = ' + vLinePkgContainerNo + '<br>';
							str = str + 'vLinePkgShipmentNo. = ' + vLinePkgShipmentNo + '<br>';
							str = str + 'vPOName. = ' + vPOName + '<br>';
							str = str + 'vLinePkgTransactionType. = ' + vLinePkgTransactionType + '<br>';
							str = str + 'vLinePkgPOLineNo. = ' + vLinePkgPOLineNo + '<br>';
							str = str + 'vLinePkgItem. = ' + vLinePkgItem + '<br>';						
							str = str + 'vLinePkgOrdQty. = ' + vLinePkgOrdQty + '<br>';
							str = str + 'vLinePkgExpQty. = ' + vLinePkgExpQty + '<br>';
							str = str + 'vLinePkgTotWeight. = ' + vLinePkgTotWeight + '<br>';
							str = str + 'vLinePkgTotWeightUOM. = ' + vLinePkgTotWeightUOM + '<br>';
							str = str + 'vLinePkgTotalVolume. = ' + vLinePkgTotalVolume + '<br>';
							str = str + 'vLinePkgTotalVolumeUOM. = ' + vLinePkgTotalVolumeUOM + '<br>';						
							str = str + 'vLinePkgLotNo. = ' + vLinePkgLotNo + '<br>';
							str = str + 'vLinePkgLPNo. = ' + vLinePkgLPNo + '<br>';
							str = str + 'vLinePkgSerialNo. = ' + vLinePkgSerialNo + '<br>';
							str = str + 'vLinePkgLotQty. = ' + vLinePkgLotQty + '<br>';

							nlapiLogExecution('DEBUG', 'Container Line Package', str);
							nlapiLogExecution('DEBUG', 'datain.ContainerLinePkgDetails.length', datain.ContainerLinePkgDetails.length);

							var customrecordID3 = "purchaseorder"; //for purchase order internal id
							var vLinePkgPONo = GetId(vPOName,customrecordID3);
							var vLotArray=new Array();
							var vLotQty= new Array();
							if(vLinePkgLotNo != null && vLinePkgLotNo !=''&& vLinePkgLotNo !='null' && vLinePkgLotQty !=null && vLinePkgLotQty !='' && vLinePkgLotQty !='null')
							{


								//replace the Parenthesis to empty [{}]

								vLinePkgLotNo= vLinePkgLotNo.replace(/"/g, "").replace(/'/g, "").replace(/\{|\}/g, "");
								nlapiLogExecution('ERROR', 'str1 ', vLinePkgLotNo);							
								vLotArray=vLinePkgLotNo.split(',');
								nlapiLogExecution('DEBUG', 'vLotArray length', vLotArray.length);

								vLinePkgLotQty= vLinePkgLotQty.replace(/"/g, "").replace(/'/g, "").replace(/\{|\}/g, "");

								vLotQty=vLinePkgLotQty.split(',');
								nlapiLogExecution('DEBUG', 'vLotQty length', vLotQty.length);



							}

							if(vLinePkgContainerNo != null && vLinePkgContainerNo != '')
							{

								if(vLotArray !=null && vLotArray !='' && vLotArray.length>0)
								{
									for(var z=0;z<vLotArray.length; z++)
									{
										nlapiLogExecution('DEBUG', 'z', z);

										var vBatchId= getBatchId(vLotArray[z],vLinePkgItem, vLinePkgLocation)
										nlapiLogExecution('DEBUG', 'vBatchId', vBatchId);

										var customrecord = nlapiCreateRecord('customrecord_wmsse_trailerlinepkgs');

										customrecord.setFieldValue('name', vLinePkgContainerNo);

										if(vLinePkgContainerNo !=null && vLinePkgContainerNo !='' && vLinePkgContainerNo !='null' && vLinePkgContainerNo !='undefined')
											customrecord.setFieldValue('custrecord_wmsse_trllinepkgcontainer', vLinePkgContainerNo);

										if(vLinePkgShipmentNo  !=null && vLinePkgShipmentNo !='' && vLinePkgShipmentNo !='null' && vLinePkgShipmentNo !='undefined')
										customrecord.setFieldValue('custrecord_wmsse_trllinepkgshipment', vLinePkgShipmentNo);

										if(vLinePkgPONo !=null && vLinePkgPONo !='' && vLinePkgPONo !='null' && vLinePkgPONo !='undefined')
											customrecord.setFieldValue('custrecord_wmsse_trllinepkgpono', vLinePkgPONo);

										if(vLinePkgTransactionType !=null && vLinePkgTransactionType !='' && vLinePkgTransactionType !='null' && vLinePkgTransactionType !='undefined')
											customrecord.setFieldValue('custrecord_wmsse_trllinepkgtrantype', vLinePkgTransactionType);							

										if(vLinePkgPOLineNo !=null && vLinePkgPOLineNo !='' && vLinePkgPOLineNo !='null' && vLinePkgPOLineNo !='undefined')
											customrecord.setFieldValue('custrecord_wmsse_trllinepkgpolineno', vLinePkgPOLineNo);

										if(vLinePkgItem !=null && vLinePkgItem !='' && vLinePkgItem !='null' && vLinePkgItem !='undefined')
											customrecord.setFieldValue('custrecord_wmsse_trllinepkgitem', vLinePkgItem);	

										/*if(vLinePkgLPNo !=null && vLinePkgLPNo !='') // Need to check for the availability
											customrecord.setFieldValue('custrecord_wms_trllinepkglp', vLinePkgLPNo);	*/

										nlapiLogExecution('DEBUG', 'vLotQty[z]', vLotQty[z]);
										nlapiLogExecution('DEBUG', 'vLotArray[z]', vLotArray[z]);
										if(vLotQty[z] !=null && vLotQty[z] !='' && vLotQty[z] !='null' && vLotQty[z] !='undefined')
										customrecord.setFieldValue('custrecord_wms_trllinepkgexpqty', vLotQty[z]);

										if(vLotArray[z] !=null && vLotArray[z]!='' && vLotArray[z]!='null' && vLotArray[z] !='undefined') // // Need to check for the availability
											customrecord.setFieldValue('custrecord_wmsse_trllinepkglot', vLotArray[z]);

										if(vLinePkgSerialNo !=null && vLinePkgSerialNo !='' && vLinePkgSerialNo !='null' && vLinePkgSerialNo!='undefined')
										customrecord.setFieldValue('custrecord_wmsse_trllinepkgserialno', vLinePkgSerialNo);					

										if(vLinePkgLocation !=null && vLinePkgLocation !='' && vLinePkgLocation !='null' && vLinePkgLocation!='undefined')
											customrecord.setFieldValue('custrecord_wmsse_trllinepkgloc', vLinePkgLocation);

										if(vLinePkgTotWeight !=null && vLinePkgTotWeight !='' && vLinePkgTotWeight !='null' && vLinePkgTotWeight!='undefined')
										customrecord.setFieldValue('custrecord_wmsse_trllinepkgtotweight', vLinePkgTotWeight);
										
										if(vLinePkgTotalVolume !=null && vLinePkgTotalVolume !='' && vLinePkgTotalVolume!='null' && vLinePkgTotalVolume!='undefined')
										customrecord.setFieldValue('custrecord_wmsse_trllinepkgtotvolume', vLinePkgTotalVolume);


										var pkglinerecid = nlapiSubmitRecord(customrecord);
										nlapiLogExecution('ERROR', 'pkglinerecid11', pkglinerecid);

									}
								}
								else
								{

									var customrecord = nlapiCreateRecord('customrecord_wmsse_trailerlinepkgs');

									customrecord.setFieldValue('name', vLinePkgContainerNo);

									if(vLinePkgContainerNo !=null && vLinePkgContainerNo !='' && vLinePkgContainerNo !='null' && vLinePkgContainerNo !='undefined')
										customrecord.setFieldValue('custrecord_wmsse_trllinepkgcontainer', vLinePkgContainerNo);

									if(vLinePkgShipmentNo !=null && vLinePkgShipmentNo !='' && vLinePkgShipmentNo !='null' && vLinePkgShipmentNo!='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllinepkgshipment', vLinePkgShipmentNo);

									if(vLinePkgPONo !=null && vLinePkgPONo!='' && vLinePkgPONo!='null' && vLinePkgPONo!='undefined')
										customrecord.setFieldValue('custrecord_wmsse_trllinepkgpono', vLinePkgPONo);

									if(vLinePkgTransactionType !=null && vLinePkgTransactionType!='' && vLinePkgTransactionType!='null' && vLinePkgTransactionType!='undefined')
										customrecord.setFieldValue('custrecord_wmsse_trllinepkgtrantype', vLinePkgTransactionType);							

									if(vLinePkgPOLineNo !=null && vLinePkgPOLineNo!='' && vLinePkgPOLineNo!='null' && vLinePkgPOLineNo!='undefined')
										customrecord.setFieldValue('custrecord_wmsse_trllinepkgpolineno', vLinePkgPOLineNo);

									if(vLinePkgItem !=null && vLinePkgItem!='' && vLinePkgItem!='null' && vLinePkgItem!='undefined')
										customrecord.setFieldValue('custrecord_wmsse_trllinepkgitem', vLinePkgItem);	

									/*if(vLinePkgLPNo !=null && vLinePkgLPNo !='') // Need to check for the availability
										customrecord.setFieldValue('custrecord_wms_trllinepkglp', vLinePkgLPNo);	*/

									if(vLinePkgExpQty !=null && vLinePkgExpQty!='' && vLinePkgExpQty!='null' && vLinePkgExpQty!='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllinepkgexpqty', vLinePkgExpQty);							

									if(vLinePkgLotNo !=null && vLinePkgLotNo!='' && vLinePkgLotNo!='null' && vLinePkgLotNo!='undefined') // // Need to check for the availability
										customrecord.setFieldValue('custrecord_wmsse_trllinepkglot', vLinePkgLotNo);

									if(vLinePkgSerialNo !=null && vLinePkgSerialNo!='' && vLinePkgSerialNo!='null' && vLinePkgSerialNo!='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllinepkgserialno', vLinePkgSerialNo);					

									if(vLinePkgLocation !=null && vLinePkgLocation!='' && vLinePkgLocation!='null' && vLinePkgLocation!='undefined')
										customrecord.setFieldValue('custrecord_wmsse_trllinepkgloc', vLinePkgLocation);

									if(vLinePkgTotWeight !=null && vLinePkgTotWeight!='' && vLinePkgTotWeight!='null' && vLinePkgTotWeight!='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllinepkgtotweight', vLinePkgTotWeight);
									
									if(vLinePkgTotalVolume !=null && vLinePkgTotalVolume!='' && vLinePkgTotalVolume!='null' && vLinePkgTotalVolume!='undefined')
									customrecord.setFieldValue('custrecord_wmsse_trllinepkgtotvolume', vLinePkgTotalVolume);


									var pkglinerecid = nlapiSubmitRecord(customrecord);
									nlapiLogExecution('ERROR', 'pkglinerecid', pkglinerecid);


								}
							}

						}
						catch(exp)
						{
							nlapiLogExecution('DEBUG', 'Exception in Container line package details', exp);
							ErrorDetails=exp;
							//updateRestletScriptStatus('3',vcuruserId,'Error',vContNumber,intergration,RestletName,ErrorDetails,TransactionType,vContNumber);
						}
					}
				}
				//updateRestletScriptStatus('3',vcuruserId,'Completed',vContNumber,intergration,RestletName,ErrorDetails,TransactionType,vContNumber);
			}
		
	}
	catch(exp1)
	{
		nlapiLogExecution('DEBUG', 'Exception in Container line details', exp1);
		err.status = "failed";
		err.message = "missing recordtype";
		ErrorDetails=exp1;
		//updateRestletScriptStatus('3',vcuruserId,'Error',vContNumber,intergration,RestletName,ErrorDetails,TransactionType,vContNumber);
		return err;

	}


}

function ECM_Rest_DELETE(request, response) 
{
}



//function return @ internal id
function GetId(vName,customrecordID)
{
	var vInternalID='';

	nlapiLogExecution('DEBUG', 'customrecordID', customrecordID);
	nlapiLogExecution('DEBUG', 'vName', vName);

	if(vName!=null && vName!='' && vName!='null' && vName!='undefined' && customrecordID !=null && customrecordID !='' && customrecordID !='null')
	{
		var filters= new Array();

		if(customrecordID == "purchaseorder")
		{
			filters.push(new nlobjSearchFilter('tranid',null,'is',vName));
			filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

		}
		else
		{
			filters.push(new nlobjSearchFilter('name',null,'is',vName));
			filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		}


		var SearchResults=nlapiSearchRecord(customrecordID,null,filters,null);
		if(SearchResults!=null && SearchResults!='' && SearchResults.length>0)
		{
			vInternalID=SearchResults[0].getId()
		}
	}

	nlapiLogExecution('DEBUG', 'vInternalID', vInternalID);
	return vInternalID;

}
function getRecordIdval(ContainerNo)
{
	//var recordidval='';

	var recordidval=new Array();

	var contFilters = new Array();

	contFilters[0] = new nlobjSearchFilter('isinactive',null, 'is','F');
	contFilters[1] = new nlobjSearchFilter('name',null, 'is',ContainerNo);

	var contColumns = new Array();

	contColumns[0] = new nlobjSearchColumn('name');
	contColumns[1] = new nlobjSearchColumn('isinactive');
	contColumns[2] = new nlobjSearchColumn('internalid');

	var contSearchResult = nlapiSearchRecord('customrecord_wmsse_trailer', null, contFilters, contColumns);
	if(contSearchResult!=null && contSearchResult!='' && contSearchResult.length>0)
	{
		nlapiLogExecution('DEBUG', 'recordidval details', contSearchResult.length);
		for(var z=0;z<contSearchResult.length; z++)
		{

			recordidval.push(parseInt(contSearchResult[z].getId()));
			//recordidval = contSearchResult[z].getValue('internalid');


		}
		nlapiLogExecution('DEBUG', 'recordidval details 1', recordidval);
		return recordidval;
	}
	else
		return null;


}

function getContainerTypeId(pcontainertype)
{
	var vcontainertypeid='';
	var containertypeFilters = new Array();

	containertypeFilters[0] = new nlobjSearchFilter('isinactive',null, 'is','F');
	containertypeFilters[1] = new nlobjSearchFilter('name',null, 'is',pcontainertype);

	var containertypeColumns = new Array();

	containertypeColumns[0] = new nlobjSearchColumn('name');
	containertypeColumns[1] = new nlobjSearchColumn('isinactive');
	containertypeColumns[2] = new nlobjSearchColumn('internalid');

	var containertypeSearchResult = nlapiSearchRecord('customlist_wmsse_listcontainertype', null, containertypeFilters, containertypeColumns);
	if(containertypeSearchResult!=null && containertypeSearchResult!='')
	{
		vcontainertypeid=containertypeSearchResult[0].getValue('internalid');
	}
	else
	{
		var customlist = nlapiCreateRecord('customlist_wmsse_listcontainertype');
		customlist.setFieldValue('name', pcontainertype);
		customlist.setFieldValue('isinactive', 'F');

		vcontainertypeid = nlapiSubmitRecord(customlist, false, true);
	}

	return vcontainertypeid;
}
function getPortId(pportname)
{
	var vportintrid='';
	var portFilters = new Array();

	portFilters[0] = new nlobjSearchFilter('isinactive',null, 'is','F');
	portFilters[1] = new nlobjSearchFilter('name',null, 'is',pportname);

	var portColumns = new Array();

	portColumns[0] = new nlobjSearchColumn('name');
	portColumns[1] = new nlobjSearchColumn('isinactive');
	portColumns[2] = new nlobjSearchColumn('internalid');

	var portSearchResult = nlapiSearchRecord('customlist_wmsse_ports', null, portFilters, portColumns);
	if(portSearchResult!=null && portSearchResult!='')
	{
		vportintrid=portSearchResult[0].getValue('internalid');
	}
	else
	{
		var customlist = nlapiCreateRecord('customlist_wmsse_ports');
		customlist.setFieldValue('name', pportname);
		customlist.setFieldValue('isinactive', 'F');

		vportintrid = nlapiSubmitRecord(customlist, false, true);
	}

	return vportintrid;
}
function getUOMId(puomname)
{
	/*var vuomintrid='';
	var uomFilters = new Array();

	uomFilters[0] = new nlobjSearchFilter('isinactive',null, 'is','F');
	uomFilters[1] = new nlobjSearchFilter('name',null, 'is',puomname);

	var uomColumns = new Array();

	uomColumns[0] = new nlobjSearchColumn('name');
	uomColumns[1] = new nlobjSearchColumn('isinactive');
	uomColumns[2] = new nlobjSearchColumn('internalid');

	var uomSearchResult = nlapiSearchRecord('customlist_ebiznet_uom', null, uomFilters, uomColumns);
	if(uomSearchResult!=null && uomSearchResult!='')
	{
		vuomintrid=uomSearchResult[0].getValue('internalid');
	}
	else
	{
		var customlist = nlapiCreateRecord('customlist_ebiznet_uom');
		customlist.setFieldValue('name', puomname);
		customlist.setFieldValue('isinactive', 'F');

		vuomintrid = nlapiSubmitRecord(customlist, false, true);
	}*/

	return puomname;
}

function getIncoTermsId(IncoTermsId)
{
	return IncoTermsId;
}

function getDockId(pdockname, plocation)
{
	var vdockid='';
	var dockFilters = new Array();

	dockFilters[0] = new nlobjSearchFilter('isinactive',null, 'is','F');
	dockFilters[1] = new nlobjSearchFilter('name',null, 'is',pdockname);
	if(plocation!=null && plocation!='')
		dockFilters[2] = new nlobjSearchFilter('location',null, 'is',plocation);

	var dockColumns = new Array();

	dockColumns[0] = new nlobjSearchColumn('name');
	dockColumns[1] = new nlobjSearchColumn('isinactive');
	dockColumns[2] = new nlobjSearchColumn('internalid');

	var dockSearchResult = nlapiSearchRecord('bin', null, dockFilters, dockColumns);
	if(dockSearchResult!=null && dockSearchResult!='')
	{
		vdockid=dockSearchResult[0].getValue('internalid');
	}
	else
	{
		var customrecord = nlapiCreateRecord('bin');
		customrecord.setFieldValue('name', pdockname);
		customrecord.setFieldValue('location', plocation);
		customrecord.setFieldValue('isinactive', 'F');
		//customrecord.setFieldText('custrecord_ebizlocationtype', 'DOCK');		

		vdockid = nlapiSubmitRecord(customrecord, false, true);
	}

	return vdockid;
}
function getDestinationId(pdestname)
{
	var vdestintrid='';
	/*var destFilters = new Array();

	destFilters[0] = new nlobjSearchFilter('isinactive',null, 'is','F');
	destFilters[1] = new nlobjSearchFilter('name',null, 'is',pdestname);

	var destColumns = new Array();

	destColumns[0] = new nlobjSearchColumn('name');
	destColumns[1] = new nlobjSearchColumn('isinactive');
	destColumns[2] = new nlobjSearchColumn('internalid');

	var destSearchResult = nlapiSearchRecord('customlist_nswmsdestinationlov', null, destFilters, countryColumns);
	if(destSearchResult!=null && destSearchResult!='')
	{
		vdestintrid=destSearchResult[0].getValue('internalid');
	}
	else
	{
		var customlist = nlapiCreateRecord('customlist_nswmsdestinationlov');
		customlist.setFieldValue('name', pdestname);
		customlist.setFieldValue('isinactive', 'F');

		vdestintrid = nlapiSubmitRecord(customlist, false, true);
	}*/

	return vdestintrid;
}

function getRecordIdvalLine(ContainerNoline)
{
	//var recordidvalline='';

	var recordidvalline = new Array();

	var contFilters = new Array();

	contFilters[0] = new nlobjSearchFilter('isinactive',null, 'is','F');
	contFilters[1] = new nlobjSearchFilter('name',null, 'is',ContainerNoline);

	var contColumns = new Array();

	contColumns[0] = new nlobjSearchColumn('name');
	contColumns[1] = new nlobjSearchColumn('isinactive');
	contColumns[2] = new nlobjSearchColumn('internalid');

	var contSearchResult = nlapiSearchRecord('customrecord_wmsse_trailerline', null, contFilters, contColumns);
	if(contSearchResult!=null && contSearchResult!='' && contSearchResult.length>0)
	{
		nlapiLogExecution('DEBUG', 'recordidvalline details', contSearchResult.length);
		for(var z=0;z<contSearchResult.length; z++)
		{

			recordidvalline.push(parseInt(contSearchResult[z].getId()));
			//recordidvalline = contSearchResult[z].getValue('internalid');


		}
		nlapiLogExecution('DEBUG', 'recordidvalline details 1', recordidvalline);
		return recordidvalline;
	}
	else
		return null;


}
