/**
 * Script Description
 * This script used to post the item fulfillments for selected order pick tasks.
 */

/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function PostingItemFullfillmentUE(type)
{
	try
	{

		nlapiLogExecution('Debug', 'Time1', TimeStampinSec());
		var newRecord = nlapiGetNewRecord();
		vWMSSeOrdNo= newRecord.getFieldValue('custrecord_wmsse_order_no');
		var recid=newRecord.getId();
		var taskType=newRecord.getFieldValue('custrecord_wmsse_tasktype');//
		var wmsstatusflag=newRecord.getFieldValue('custrecord_wmsse_wms_status_flag');
		var nsconfirmationno=newRecord.getFieldValue('custrecord_wmsse_nsconfirm_ref_no');
		var isItLastPick=newRecord.getFieldValue('custrecord_wmsse_device_upload_flag');
		var vcontainerLp=newRecord.getFieldValue('custrecord_wmsse_container_lp_no');
		var whLocation=newRecord.getFieldValue('custrecord_wmsse_wms_location');
		var vShipVia = newRecord.getFieldValue('custrecord_wmsse_shipmethod');
		var FULFILLMENTATORDERLEVEL=getSystemRuleValue('Consolidate item fulfillments by sales order?',whLocation);
		var trantype = nlapiLookupField('transaction', vWMSSeOrdNo, 'recordType');
		var ctx = nlapiGetContext();
		var packingFlag='F';
		var sysruleFilters1 = new Array();
		// sysruleFilters1.push(new nlobjSearchFilter('name', null, 'is', 'Is Packing Required?'));
		sysruleFilters1.push(new nlobjSearchFilter('name', null, 'is', 'Manually pack orders?'));
		if(whLocation !=null && whLocation!='' && whLocation!='null')
			sysruleFilters1.push(new nlobjSearchFilter('custrecord_wmssesite', null, 'anyof', ['@NONE@',whLocation]));
		sysruleFilters1.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		var sysruleColumns1 = new Array();
		sysruleColumns1[0] = new nlobjSearchColumn('custrecord_wmsserulevalue');
		sysruleColumns1[1] = new nlobjSearchColumn('custrecord_wmssesite').setSort();
		var systemRulesSearchresults1 = nlapiSearchRecord('customrecord_wmsse_sysrules', null, sysruleFilters1, sysruleColumns1);

		if(systemRulesSearchresults1 !=null && systemRulesSearchresults1 !='')
		{
			packingFlag=systemRulesSearchresults1[0].getValue('custrecord_wmsserulevalue');
		}
		if(packingFlag!=null && packingFlag!='')
		{
			if(packingFlag=="Y")
			{
				packingFlag="T";
			}
			else
			{
				packingFlag="F";
			}
		}

		// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
		var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
		sysruleFilters1=null;
		sysruleColumns1=null;
		systemRulesSearchresults1=null;
		var logMsg = 'vWMSSeOrdNo = ' + vWMSSeOrdNo + '<br>';
		logMsg = logMsg + 'recid = ' + recid + '<br>';
		logMsg = logMsg + 'taskType = ' + taskType + '<br>';
		logMsg = logMsg + 'wmsstatusflag = ' + wmsstatusflag + '<br>';
		logMsg = logMsg + 'nsconfirmationno = ' + nsconfirmationno + '<br>';
		logMsg = logMsg + 'isItLastPick = ' + isItLastPick + '<br>';
		logMsg = logMsg + 'vcontainerLp = ' + vcontainerLp + '<br>';
		logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
		logMsg = logMsg + 'FULFILLMENTATORDERLEVEL = ' + FULFILLMENTATORDERLEVEL + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'type = ' + type + '<br>';
		logMsg = logMsg + 'packingFlag = ' + packingFlag + '<br>';
		logMsg = logMsg + 'vShipVia = ' + vShipVia + '<br>';
		logMsg = logMsg + 'crossSubsidiaryFeature = ' + crossSubsidiaryFeature + '<br>';
		nlapiLogExecution('ERROR', 'Before nswms_ItemFulfillment', logMsg);

		var vDate=DateStamp();
		var vTime=TimeStampNew();
		var vNewDate=vDate + ' ' + vTime;

		var blnMultiShipEnabled = ctx.getFeature('multishipto');
		if((type=='create')&&taskType == 2 && wmsstatusflag ==3)
		{
			var ponumber= newRecord.getFieldText('custrecord_wmsse_order_no');
			var itemId= newRecord.getFieldValue('custrecord_wmsse_sku');
			var itemqty= newRecord.getFieldValue('custrecord_wmsse_act_qty');
			var username= newRecord.getFieldText('custrecord_wmsse_upd_user_no');
			var barcodestring= newRecord.getFieldValue('custrecord_wmsse_compositebarcode_string'); //get barcode string
			var zebrapalletlabel=getSystemRuleValue('Label Printing: Pallet labels using ZPL');
			nlapiLogExecution('ERROR', 'zebrapalletlabel', zebrapalletlabel);
			nlapiLogExecution('DEBUG', 'barcodestring', barcodestring);

			if(isempty(barcodestring))
				vBarcodestring="";

			if(zebrapalletlabel=="Y")
			{
				GeneratePalletLabel(ponumber,itemId,itemqty,username,whLocation,barcodestring);

			}


			var zebraitemlabel=getSystemRuleValue('Label Printing: Item labels using ZPL');
			nlapiLogExecution('ERROR', 'zebraitemlabel', zebraitemlabel);
			if(zebraitemlabel=="Y")
			{
				GenerateItemLabel(ponumber,itemId,whLocation);
			}

			var zebrathirdpartylabel=getSystemRuleValue('Label Printing: Item Labels with 3rd party integration');
			nlapiLogExecution('ERROR', 'zebrathirdpartylabel', zebrathirdpartylabel);
			if(zebrathirdpartylabel=="Y")
			{
				GenerateBartenderItemLabel(newRecord);
			}

		}

		if((type =='create' || type =='xedit' || type =='edit') && taskType == 3 && wmsstatusflag == 8 && isItLastPick=="T" && (nsconfirmationno==null || nsconfirmationno=='') && packingFlag=="F")
		{
			var cartonArray=new Array();

			var filter1= new Array();
			//var opentaskordersearchresult1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentasksearchresults',filter1,null);

			var result  = nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentasksearchresults');
			if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 

			if(FULFILLMENTATORDERLEVEL!='Y' && vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='- None -')
			{
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is', vcontainerLp));
			}
			else
			{
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null,'anyof', vWMSSeOrdNo));
			}
			if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', vShipVia)); 			

			if(whLocation!=null && whLocation !='' && whLocation !='null' && whLocation !='undefined')
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whLocation)); 


			var opentaskordersearchresult1 = new Array();
			var resLen = result.runSearch();
			var sum ;
			var q=0;

			var resultSet = resLen.forEachResult(function(searchResult)	
					{
				q++;
				opentaskordersearchresult1.push(searchResult);
				if(q==4000)
				{
					return false;
				}
				return true;                // return true to keep iterating
					});

			nlapiLogExecution('Debug', 'opentaskordersearchresult1',opentaskordersearchresult1);
			if(opentaskordersearchresult1!=null && opentaskordersearchresult1!='' && opentaskordersearchresult1.length > 0)
			{


				if(opentaskordersearchresult1.length>50)
				{
					nlapiLogExecution('Debug', 'Invoking Schedule Script Starts',opentaskordersearchresult1.length);

					var param = new Array();

					param['custscript_wms_ebizordno'] = vWMSSeOrdNo;
					param['custscript_wms_shipmethod'] = vShipVia;
					param['custscript_wms_confirmtons'] = isItLastPick;					
					param['custscript_wms_containerlp'] = vcontainerLp;
					param['custscript_wms_itemloc'] = whLocation;
					param['custscript_wms_fulfillmenttask'] = FULFILLMENTATORDERLEVEL;
					param['custscript_wms_ismultilineship'] = 'F';
					param['custscript_wms_recid'] = recid;

					nlapiScheduleScript('customscript_wmsse_itemfulfillment_sch', null,param);
					//To invoke Schedule script
					var currentUserID = getCurrentUser();//To get current user
					updateScheduleScriptStatus('Item Fulfillment SCH',currentUserID,'Submitted',vWMSSeOrdNo,trantype);
					//To update Schedule script status to Submitted
					return;
				}
				else
				{


					var vCustomer="";
					for(var z=0;z<opentaskordersearchresult1.length;z++)
					{
						var RecordId=opentaskordersearchresult1[z].getValue('internalid',null,'group');
						var vContainerLp=opentaskordersearchresult1[z].getValue('custrecord_wmsse_container_lp_no',null,'group');
						vCustomer=opentaskordersearchresult1[z].getValue('custrecord_wmsse_customer',null,'group');
						var vContainerWeight=opentaskordersearchresult1[z].getValue('custrecord_wmsse_containerweight',null,'group');
						var vShipMethod=opentaskordersearchresult1[z].getValue('custrecord_wmsse_shipmethod',null,'group');
						var fields = new Array();
						var values = new Array();

						fields[0]='custrecord_wmsse_wms_status_flag';
						values[0]=28;
						fields[1]='custrecord_wmsse_pack_comp_date';
						values[1]=vNewDate;
						nlapiLogExecution('ERROR', 'vContainerWeight', vContainerWeight);
						if(vContainerWeight == null || vContainerWeight == '' || vContainerWeight == 'null' || vContainerWeight == 'undefined')
						{
							fields[2]='custrecord_wmsse_containerweight';
							values[2]=1;
						}
						nlapiLogExecution('ERROR', 'RecordId', RecordId);
						if(RecordId!=null && RecordId!='')
						{
							nlapiSubmitField('customrecord_wmsse_trn_opentask', RecordId,fields, values);
						}
					}
					if(packingFlag=="F")
					{
						taskType = 14;  
						wmsstatusflag = 28;
						createPackTaskRecord(vWMSSeOrdNo,whLocation,vCustomer,vShipMethod,vNewDate);
					}
				}
			}
			filter1=null;
			columns1=null;
			opentaskordersearchresult1=null;
		}	
		// Case start 201415432 
		//Item fulfillment should post only when Last pick value is True
		if((type =='create' || type =='xedit' || type =='edit') && taskType == 14 && wmsstatusflag == 28 && isItLastPick=="T")

		{
			//Case end 201415432
			nlapiLogExecution('Debug', 'Time2', TimeStampinSec());
			//Case # 201411642 Start
			var filterOpenTask= new Array();
			if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
				filterOpenTask.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 

			if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
				filterOpenTask.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', vShipVia));

			if(whLocation!=null && whLocation !='' && whLocation !='null' && whLocation !='undefined')
				filterOpenTask.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whLocation)); 

			var opentaskOpenRecordsResult = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_openresults_fulfillue',filterOpenTask,null);

			nlapiLogExecution('Debug', 'opentaskOpenRecordsResult', opentaskOpenRecordsResult);
			//Case # 201411642 end
			var filter= new Array();
			var TransformRecId = null;

			if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
				filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 

			if(FULFILLMENTATORDERLEVEL!='Y' && vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='- None -')
			{
				filter.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is', vcontainerLp));
			}
			if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
				filter.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', vShipVia)); 


			//Case # 201411642 Start
			var opentaskordersearchresult =null;
			if(FULFILLMENTATORDERLEVEL=='Y' && opentaskOpenRecordsResult != null && opentaskOpenRecordsResult.length > 0)
			{				
				opentaskordersearchresult =null;
				nlapiLogExecution('ERROR', 'Open Picks Exists for the Order');
			}
			else
			{
				opentaskordersearchresult = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskresultsforif',filter,null);
				nlapiLogExecution('ERROR', 'opentaskordersearchresult', opentaskordersearchresult);
			}
			//Case # 201411642 end


			var vLineArray=new Array();

			if(opentaskordersearchresult !=null && opentaskordersearchresult!='')
			{
				nlapiLogExecution('ERROR', 'opentaskordersearchresult.length', opentaskordersearchresult.length);


				if(parseInt(opentaskordersearchresult.length)>50)
				{
					nlapiLogExecution('Debug', 'Invoking Schedule Script Starts',opentaskordersearchresult.length);

					var param = new Array();

					param['custscript_wms_ebizordno'] = vWMSSeOrdNo;
					param['custscript_wms_shipmethod'] = vShipVia;
					param['custscript_wms_confirmtons'] = isItLastPick;					
					param['custscript_wms_containerlp'] = vcontainerLp;
					param['custscript_wms_itemloc'] = whLocation;
					param['custscript_wms_fulfillmenttask'] = FULFILLMENTATORDERLEVEL;
					param['custscript_wms_ismultilineship'] = 'F';
					param['custscript_wms_recid'] = recid;

					nlapiScheduleScript('customscript_wmsse_itemfulfillment_sch', null,param);
					//To invoke Schedule script
					var currentUserID = getCurrentUser();//To get current user
					updateScheduleScriptStatus('Item Fulfillment SCH',currentUserID,'Submitted',vWMSSeOrdNo,trantype);
					//To update Schedule script status to Submitted
					return;
				}
				else
				{
					var ismultilineship='';
					var vshipgroup ='';
					if(vWMSSeOrdNo!=null && vWMSSeOrdNo!='')
					{
						nlapiLogExecution('Debug', 'Time3', TimeStampinSec());

						nlapiLogExecution('ERROR', 'vWMSSeOrdNo', vWMSSeOrdNo);
						var filters=new Array();
						filters.push(new nlobjSearchFilter('internalid', null, 'is', vWMSSeOrdNo));
						filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
						// Pending Fulfillment / Partially Fulfilled / Pending Billing_Partially Fulfilled
						filters.push(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E']));
						filters.push(new nlobjSearchFilter('shipping', null, 'is', 'F'));//To avoid shipping lines.
						filters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));//To avoid tax lines.
						if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
							filters.push(new nlobjSearchFilter('shipmethod', null, 'anyof', vShipVia));
						var columns=new Array();
						columns.push(new nlobjSearchColumn('shipgroup'));
						columns.push(new nlobjSearchColumn('item'));
						columns.push(new nlobjSearchColumn('line').setSort());
						if(blnMultiShipEnabled)
							columns.push(new nlobjSearchColumn('ismultishipto'));
						columns.push(new nlobjSearchColumn('shipmethod'));
						var searchresults = nlapiSearchRecord(trantype, null, filters, columns);
						nlapiLogExecution('Debug', 'Time4', TimeStampinSec());
						if(searchresults != null && searchresults !='')
						{

							for(var p=0;p<searchresults.length;p++)
							{
								var vnShipMethod = searchresults[p].getValue('shipmethod');
								var vnItem = searchresults[p].getValue('item');
								var itemListArray=new Array();
								var vLineNo =0;
								for(var p1=0;p1<opentaskordersearchresult.length;p1++)
								{
									var opentaskItemId=opentaskordersearchresult[p1].getValue('custrecord_wmsse_sku',null,'group');	
									if(opentaskItemId == vnItem )
									{
										vLineNo=opentaskordersearchresult[p1].getValue('custrecord_wmsse_line_no',null,'group');
										break;
									}

								}
								var vnLine = searchresults[p].getValue('line');							

								nlapiLogExecution('ERROR', 'vnLine', vnLine);
								nlapiLogExecution('ERROR', 'vLineNo', vLineNo);
								if(vnShipMethod == vShipVia && vnLine == vLineNo )
								{
									ismultilineship='F';
									if(blnMultiShipEnabled)
										ismultilineship = searchresults[p].getValue('ismultishipto');
									vshipgroup=searchresults[p].getValue('shipgroup');
									break;
								}
							}
						}
						nlapiLogExecution('ERROR', 'vWMSSeOrdNo after', vWMSSeOrdNo);

					}
					nlapiLogExecution('ERROR', 'vshipgroup', vshipgroup);
					nlapiLogExecution('ERROR', 'ismultilineship', ismultilineship);
					var trecord ='';
					// if Cross-Subsidiary Fulfillment feature is enabled, need to provide Inventorylocation as well while transform record	
					if(crossSubsidiaryFeature == true && trantype =="salesorder")
					{
						if(ismultilineship != 'T')
						{
							nlapiLogExecution('ERROR', 'inside if', ismultilineship);
							trecord = nlapiTransformRecord(trantype, vWMSSeOrdNo, 'itemfulfillment',{ 'inventorylocation' : whLocation});
						}
						else
						{
							nlapiLogExecution('ERROR', 'inside else', ismultilineship);
							trecord = nlapiTransformRecord(trantype, vWMSSeOrdNo, 'itemfulfillment', { 'shipgroup' : vshipgroup,'inventorylocation':whLocation});
						}
					}
					else
					{

						if(ismultilineship != 'T')
						{
							nlapiLogExecution('ERROR', 'inside if', ismultilineship);
							trecord = nlapiTransformRecord(trantype, vWMSSeOrdNo, 'itemfulfillment');
						}
						else
						{
							nlapiLogExecution('ERROR', 'inside else', ismultilineship);
							trecord = nlapiTransformRecord(trantype, vWMSSeOrdNo, 'itemfulfillment', { 'shipgroup' : vshipgroup});
						}
					}
					var itemListArray=new Array();
					for(var p=0;p<opentaskordersearchresult.length;p++)
					{

						var soLineno=opentaskordersearchresult[p].getValue('custrecord_wmsse_line_no',null,'group');
						if(vLineArray.indexOf(soLineno)==-1)
						{
							vLineArray.push(parseInt(soLineno));
						}	 

					}
					nlapiLogExecution('Debug', 'Time5', TimeStampinSec());
					nswms_PostItemFulfillment(trantype,vWMSSeOrdNo,opentaskordersearchresult,vLineArray,trecord,vShipVia,vcontainerLp,FULFILLMENTATORDERLEVEL);
					nlapiLogExecution('ERROR', 'trecord', trecord);
					var TransformRecId='';
					if(trecord!=null && trecord!='')
					{
						TransformRecId = nlapiSubmitRecord(trecord);
					}
					nlapiLogExecution('Debug', 'Time6', TimeStampinSec());
					nlapiLogExecution('ERROR', 'TransformRecId', TransformRecId);
					if(TransformRecId!=null && TransformRecId!='')
					{
						nlapiLogExecution('Debug', 'Time7', TimeStampinSec());
						updateNSRefInOpentask(vWMSSeOrdNo,TransformRecId,vcontainerLp,FULFILLMENTATORDERLEVEL,whLocation);
						nlapiLogExecution('Debug', 'Time8', TimeStampinSec());
					}
				}

			}
			filter=null;
			columns=null;
			opentaskordersearchresult=null;

			if(TransformRecId !='' && TransformRecId!=null && TransformRecId!='null')
			{
				nlapiLogExecution('Debug', 'Time9', TimeStampinSec());
				var shipmanifestcheck=getSystemRuleValue('Use WMS Shipping Integration?');
				var ASNCRuleVal = getSystemRuleValue('Generate EDI 856 outbound ASNs?');
				var UCCRuleVal=getSystemRuleValue('Label Printing: UCC/GS1 Labels with 3rd party integration');
				var Zebraucclabel=getSystemRuleValue('Label Printing: UCC/GS1 labels using ZPL');
				var ZebraAddresslabel=getSystemRuleValue('Label Printing: Address labels using ZPL');

				var trantype = nlapiLookupField('transaction', vWMSSeOrdNo, 'recordType');
				var salesorderrecord=nlapiLoadRecord(trantype, vWMSSeOrdNo);
				nlapiLogExecution('Debug', 'Time10', TimeStampinSec());
				var manualpack=getSystemRuleValue('Manually pack orders?',whLocation);
//				if(vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='null' && vcontainerLp!='undefined' &&  FULFILLMENTATORDERLEVEL!='Y')
//				{
//				createPacklistHtml(vWMSSeOrdNo,trantype,salesorderrecord,vcontainerLp);
//				}
				if(FULFILLMENTATORDERLEVEL=='Y' && manualpack=='Y')
				{
					var packlistexist=IsPackListExist(vWMSSeOrdNo);
					nlapiLogExecution('Debug', 'packlistexist', packlistexist);

					if(packlistexist=='T' && (TransformRecId == '' || TransformRecId == null || TransformRecId == 'null' || TransformRecId == 'undefined'))
					{
						nlapiLogExecution("Debug", "Packlist is already generated","Packlist is already generated");	
					}	
					else
					{
						if(TransformRecId == '' || TransformRecId == null || TransformRecId == 'null' || TransformRecId == 'undefined')
						{

							createPacklistHtml(vWMSSeOrdNo,trantype,salesorderrecord,"");
						}
						else
						{

							createPacklistHtml(vWMSSeOrdNo,trantype,salesorderrecord,vcontainerLp);	
						}


					}
				}
				else if(manualpack=='Y')
				{
					createPacklistHtml(vWMSSeOrdNo,trantype,salesorderrecord,vcontainerLp);
				}


				nlapiLogExecution('Debug', 'Time11', TimeStampinSec());
				var filtership= new Array();


				if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
					filtership.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 


				if(TransformRecId !='' && TransformRecId !=null)
					filtership.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',TransformRecId)); // NS REF no is not empty


				var opentaskordersearchresultShip = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskresultforship',filtership,null);
				if(opentaskordersearchresultShip!=null && opentaskordersearchresultShip!='')
				{
					nlapiLogExecution('Debug', 'Time12', TimeStampinSec());
					nlapiLogExecution('ERROR', 'opentaskordersearchresultShip', opentaskordersearchresultShip.length);
					for(var x=0;x<opentaskordersearchresultShip.length;x++)
					{
						var containerLpShip=opentaskordersearchresultShip[x].getValue('custrecord_wmsse_container_lp_no',null,'group');
						var containerSizeShip=opentaskordersearchresultShip[x].getValue('custrecord_wmsse_container_size',null,'group');
						var containerWeightShip=opentaskordersearchresultShip[x].getValue('custrecord_wmsse_containerweight',null,'group');
						var whLocation=opentaskordersearchresultShip[x].getValue('custrecord_wmsse_wms_location',null,'group');
						nlapiLogExecution('ERROR', 'containerLpShip,containerSizeShip,containerWeightShip',containerLpShip+","+containerSizeShip+","+containerWeightShip);
						if(containerSizeShip==null || containerSizeShip=='' || containerSizeShip=='undefined')
						{
							containerSizeShip="Size1";
						}
						if(containerWeightShip==null || containerWeightShip=='' || containerWeightShip=='undefined')
						{
							containerWeightShip=1;
						}

						nlapiLogExecution('Debug', 'Time13', TimeStampinSec());
						if(shipmanifestcheck=='Y')
						{
							CreateShippingManifestRecord(vWMSSeOrdNo,containerLpShip,containerSizeShip,containerWeightShip,1,1,1,trantype,salesorderrecord);
						}

						nlapiLogExecution('Debug', 'Time14', TimeStampinSec());
						if(ASNCRuleVal =='Y')
						{
							GenerateLabel(vWMSSeOrdNo,1,containerLpShip);
						}

						if(UCCRuleVal =='Y')
						{

							GenerateUCCLabel(vWMSSeOrdNo,containerLpShip);

						}


						if(Zebraucclabel =='Y')
						{
							GenerateZebraUccLabel(vWMSSeOrdNo,containerLpShip,salesorderrecord,whLocation);

						}

						if(ZebraAddresslabel =='Y')
						{


							GenerateZebraAddressLabel(vWMSSeOrdNo,salesorderrecord,whLocation);
						}
						nlapiLogExecution('Debug', 'Time15', TimeStampinSec());
						nlapiLogExecution('ERROR', 'shipmanifest created successfully for', containerLpShip);
					}
				}

			}
			filtership=null;
			columnsship=null;
			opentaskordersearchresultShip=null;

		}

		nlapiLogExecution('Debug','Remaining usage at the end of Item fulfillment line# ',ctx.getRemainingUsage());

	}
	catch(e)
	{
		var exceptiondetails=e;
		if ( e instanceof nlobjError )
		{
			nlapiLogExecution( 'Debug', 'system error', e.getCode() + '\n' + e.getDetails() );
			exceptiondetails=e.getCode() + '\n' + e.getDetails();
		}
		else
		{
			exceptiondetails=e.toString();
			nlapiLogExecution( 'Debug', 'unexpected error', e.toString() );
		}
		nlapiLogExecution('ERROR', 'Exception in item fulfillment UE', e);

		nlapiLogExecution('ERROR', 'exceptiondetails', exceptiondetails);
		//UpdateOpenTaskWithExceptionValue(vWMSSeOrdNo,vcontainerLp,FULFILLMENTATORDERLEVEL,exceptiondetails);
	}

}
function createPackTaskRecord(vWMSSeOrdNo,whLocation,vCustomer,vShipMethod,vNewDate)
{
	var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');

	if(whLocation!=null && whLocation!='')
		customrecord.setFieldValue('custrecord_wmsse_wms_location', whLocation);
	if(vWMSSeOrdNo!=null && vWMSSeOrdNo!='')
		customrecord.setFieldValue('custrecord_wmsse_order_no', vWMSSeOrdNo);

	customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 28);//picking completed

	customrecord.setFieldValue('custrecord_wmsse_tasktype', 14);

	customrecord.setFieldValue('custrecord_wmsse_act_begin_date', DateStamp());
	customrecord.setFieldValue('custrecord_wmsse_act_end_date', DateStamp());
	if(vCustomer != null && vCustomer != '')
		customrecord.setFieldValue('custrecord_wmsse_customer', vCustomer);

	customrecord.setFieldValue('custrecord_wmsse_pack_comp_date', vNewDate);
	if(vShipMethod != null && vShipMethod !='' && vShipMethod !='null' && vShipMethod !='undefined')
		customrecord.setFieldValue('custrecord_wmsse_shipmethod', vShipMethod);

	if(vWMSSeOrdNo!=null && vWMSSeOrdNo!='')
		customrecord.setFieldValue('name', vWMSSeOrdNo);
	var recid = nlapiSubmitRecord(customrecord);
	nlapiLogExecution('ERROR', 'Done creating pack task opentask Record', recid);
	customrecord=null;
	return recid;
}
function UpdateOpenTaskWithExceptionValue(vWMSSeOrdNo,vcontainerLp,fulfillment,exceptiondetails)
{

	nlapiLogExecution('ERROR', 'Into Update NsRef In Opentask', vWMSSeOrdNo+","+vcontainerLp);
	nlapiLogExecution('ERROR', 'exceptiondetails', exceptiondetails);
	var filter1= new Array();

	var openTaskId='';

	if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
		filter1.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 

	if(vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='null' && vcontainerLp!='undefined' && fulfillment != 'Y')
	{
		filter1.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is', vcontainerLp));
	}
	//filter1.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3','14'])); //PICK And PACK
	//filter1.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['28']));//28 packing completed

	filter1.push(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0')); 
	filter1.push(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0.0'));
	filter1.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	filter1.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); // NS REF no is empty

//	var columns1= new Array(); 


//	columns1[0]= new nlobjSearchColumn('custrecord_wmsse_container_lp_no',null,'group');
//	columns1[1]= new nlobjSearchColumn('internalid',null,'group');
//	columns1[2]= new nlobjSearchColumn('type','custrecord_wmsse_parent_sku_no','group');
//	columns1[3]= new nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum');
	var opentaskordersearchresult1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_nsupdate',filter1,null);
	if(opentaskordersearchresult1!=null && opentaskordersearchresult1!='')
	{
		for(var f=0;f<opentaskordersearchresult1.length;f++)
		{
			var RecordId=opentaskordersearchresult1[f].getValue('internalid',null,'group');
			var vContainerLp=opentaskordersearchresult1[f].getValue('custrecord_wmsse_container_lp_no',null,'group');
			var parentItemType=opentaskordersearchresult1[f].getValue('type','custrecord_wmsse_parent_sku_no','group');
			var actualqty=opentaskordersearchresult1[f].getValue('custrecord_wmsse_act_qty',null,'sum');
			nlapiLogExecution('ERROR', 'parentItemType', parentItemType);
			nlapiLogExecution('ERROR', 'actualqty', actualqty);
			if((parentItemType != null && parentItemType != '' && parentItemType !='undefined' && parentItemType == 'Kit' && actualqty != '' && actualqty !=0 && actualqty !=0.0) || (parentItemType != 'Kit'))
			{
				nlapiLogExecution('ERROR', 'inside', actualqty);
				var fields = new Array();
				var values = new Array();
				fields.push('custrecord_wmsse_notes');

				values.push(exceptiondetails);


				nlapiLogExecution('ERROR', 'RecordId', RecordId);
				if(RecordId!=null && RecordId!='')
				{
					nlapiSubmitField('customrecord_wmsse_trn_opentask', RecordId,fields, values);
				}

			}

		}


		filter1=null;
		columns1=null;
		opentaskordersearchresult1=null;
	}


}
function updateNSRefInOpentask(vWMSSeOrdNo,TransformRecId,vcontainerLp,fulfillment,whLocation)
{
	nlapiLogExecution('ERROR', 'Into Update NsRef In Opentask', vWMSSeOrdNo+","+TransformRecId+","+vcontainerLp);
	var filter1= new Array();
	var opentaskordersearchresultupdate=new Array();
	var openTaskId='';
	var opentaskresultDetails = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_nsupdate');
	if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
		opentaskresultDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 

	if(vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='null' && vcontainerLp!='undefined' && fulfillment != 'Y')
	{
		opentaskresultDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is', vcontainerLp));
	}

	opentaskresultDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0')); 
	opentaskresultDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0.0'));
	opentaskresultDetails.addFilter(new nlobjSearchFilter('isinactive',null,'is','F'));
	opentaskresultDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); // NS REF no is empty
	if(whLocation!=null && whLocation !='' && whLocation !='null' && whLocation !='undefined')
		opentaskresultDetails.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whLocation)); 

	var resLenDetails = opentaskresultDetails.runSearch();


	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		opentaskordersearchresultupdate = opentaskordersearchresultupdate.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	if(opentaskordersearchresultupdate!=null && opentaskordersearchresultupdate!='')
	{
		for(var f=0;f<opentaskordersearchresultupdate.length;f++)
		{
			var RecordId=opentaskordersearchresultupdate[f].getValue('internalid',null,'group');
			var vContainerLp=opentaskordersearchresultupdate[f].getValue('custrecord_wmsse_container_lp_no',null,'group');
			var parentItemType=opentaskordersearchresultupdate[f].getValue('type','custrecord_wmsse_parent_sku_no','group');
			var actualqty=opentaskordersearchresultupdate[f].getValue('custrecord_wmsse_act_qty',null,'sum');
			nlapiLogExecution('ERROR', 'parentItemType', parentItemType);
			nlapiLogExecution('ERROR', 'actualqty', actualqty);
			if((parentItemType != null && parentItemType != '' && parentItemType !='undefined' && parentItemType == 'Kit' && actualqty != '' && actualqty !=0 && actualqty !=0.0) || (parentItemType != 'Kit'))
			{

				nlapiLogExecution('ERROR', 'inside', actualqty);
				var fields = new Array();
				var values = new Array();
				fields.push('custrecord_wmsse_nsconfirm_ref_no');

				values.push(TransformRecId);
				nlapiLogExecution('ERROR', 'vContainerLp', vContainerLp);

				if(vContainerLp==null || vContainerLp=='' || vContainerLp=='null' || vContainerLp=='- None -')
				{
					fields.push('custrecord_wmsse_container_lp_no');
					values.push(TransformRecId);
				}

				nlapiLogExecution('ERROR', 'RecordId', RecordId);
				if(RecordId!=null && RecordId!='')
				{
					openTaskId=nlapiSubmitField('customrecord_wmsse_trn_opentask', RecordId,fields, values);
				}

			}

		}



		opentaskordersearchresultupdate=null;
	}
	return openTaskId;
}
function nswms_PostItemFulfillment(trantype,vWMSSeOrdNo,opentaskordersearchresult,filterLineArray,TransformRec,vShipVia,vcontainerLp,FULFILLMENTATORDERLEVEL)
{
	if(TransformRec!=null)
	{
		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		SOLength = TransformRec.getLineItemCount('item');  // To get the no of lines from item fulfillment record
		nlapiLogExecution('Debug', "SO Length", SOLength);
		nlapiLogExecution('Debug', "vShipVia", vShipVia);
		nlapiLogExecution('Debug', "vcontainerLp", vcontainerLp);
		for(var j=1; j<=SOLength;j++ ) // This array contains all disctinct lines no for the order
		{ 
			var itemIndex=0;

			var vitemLineNo = TransformRec.getLineItemValue('item', 'line', j);
			//var IsLineClosed = TransformRec.getLineItemValue('item', 'isclosed', j);
			if(trantype=="transferorder"){
				vitemLineNo=parseFloat(vitemLineNo)-1;
			}
			nlapiLogExecution('Debug', "vitemLineNo,filterLineArray", vitemLineNo+","+filterLineArray);
			nlapiLogExecution('Debug', "filterLineArray.indexOf(parseInt(vitemLineNo))!= -1", filterLineArray.indexOf(parseInt(vitemLineNo))!= -1);
			if(filterLineArray.indexOf(parseInt(vitemLineNo))!= -1)
			{
				nlapiLogExecution('Debug', "inside if itemIndex", itemIndex);
				itemIndex=j; 	
			}
			nlapiLogExecution('Debug', "itemIndex", itemIndex);
			if(itemIndex!=0)
			{
				var item_id = TransformRec.getLineItemValue('item', 'item', itemIndex);
				var itemname = TransformRec.getLineItemText('item', 'item', itemIndex);
				var itemLineNo = TransformRec.getLineItemValue('item', 'line', itemIndex);
				//itemname=itemname.replace(" ","-");
				if(trantype=="transferorder"){
					itemLineNo=parseFloat(itemLineNo)-1;
				}
				if(itemname!=null && itemname!='')
					itemname=itemname.replace(/ /g,"-");
				var itemrec = TransformRec.getLineItemValue('item', 'itemreceive', itemIndex);
				var itemloc2 = TransformRec.getLineItemValue('item', 'location', itemIndex);
				var itemType=nswms_GetItemType(item_id,itemloc2);
				if(itemType == 'kititem')
				{	

					//for kit/package items




					var filter= new Array();

					if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
						filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 
					filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', vitemLineNo));
					if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
						filter.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', vShipVia)); 

					var componentItemsArray= new Array();

					var opentaskordersearchresultkit = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_kititem_ot_search',filter,null);
					nlapiLogExecution('ERROR', 'opentaskordersearchresult', opentaskordersearchresultkit);


					var intTotPickQty=0;
					var compSubRecord='';
					if(opentaskordersearchresultkit != null && opentaskordersearchresultkit != '' && opentaskordersearchresultkit.length>0)
					{
						for(var s=0;s<opentaskordersearchresultkit.length;s++)
						{
							var vOTSkuNo=opentaskordersearchresultkit[s].getValue('custrecord_wmsse_sku',null,'group');
							if(componentItemsArray.indexOf(vOTSkuNo)==-1)
							{
								componentItemsArray.push(vOTSkuNo);
							}
						}
					}
					//	var kitItemsLineNo = parseInt(itemLineNo)+1;
					var w=0;
					for(var k2=itemIndex;k2<=SOLength;k2++)
					{
						TransformRec.selectLineItem('item', k2);
						TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'T');
						var vCheckflag="F";
						var item=TransformRec.getLineItemValue('item', 'item', k2);
						nlapiLogExecution('Debug', "item", item);
						nlapiLogExecution('Debug', "k2", k2);
						var compSubRecord = null;
						var vCurrCompRecLine=0;	
						var itemType=nswms_GetItemType(item,itemloc2);
						if(itemType != 'kititem' )
						{
							compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
							if(compSubRecord=='' || compSubRecord==null)
							{
								nlapiLogExecution('ERROR', 'compSubRecord', 'inside if compSubRecord'+k2+":"+itemIndex);
								compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
								try
								{
									TransformRec.removeCurrentLineItemSubrecord('item', 'inventorydetail');
									TransformRec.commitLineItem('item');
									TransformRec.selectLineItem('item', k2);
									TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'T');
									//compSubRecord='';

								}
								catch(ex)
								{
									nlapiLogExecution('Debug', "exception in subrecord", ex);
								}

							}
							else
							{
								nlapiLogExecution('ERROR', 'compSubRecord', 'inside else compSubRecord');
								var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
								if(parseInt(complinelength)>0)
								{
									for(var r1=1;r1<=complinelength;r1++)
									{ 
										compSubRecord.removeLineItem('inventoryassignment', 1);
									}
								}
							}
						}
						var prevQty = 0;
						var totalQty =0;
						for(var k3=0;k3<opentaskordersearchresultkit.length;k3++)
						{
							var inventorystatus='';
							var whlocation = opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_wms_location',null,'group');
							TransformRec.setCurrentLineItemValue('item', 'location', whlocation);
							var vOTSkuNo=opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_sku',null,'group');
							//if Inventorystatus feature is enabled
							if(inventoryStatusFeature == true)
								inventorystatus =opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_inventorystatus',null,'group');
							nlapiLogExecution('Debug', "vOTSkuNo,item_id", vOTSkuNo+","+item+","+inventorystatus);
							if(vOTSkuNo==item)
							{
								vCheckflag = "T";
								var itemType=nswms_GetItemType(item,itemloc2);
								var enterQty=opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_act_qty',null,'sum');

								if(enterQty == '' || enterQty == 'null' || enterQty == null || enterQty == undefined)
									enterQty=opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_compitm_actqty',null,'sum');

								var enterBin=opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_actendloc',null,'group');
								var batchno =opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_batch_num',null,'group');
								nlapiLogExecution('Debug', "enterQty,enterBin,batchno", enterQty+","+enterBin+","+batchno);
								nlapiLogExecution('Debug', "intTotPickQty", intTotPickQty);
								prevQty = TransformRec.getCurrentLineItemValue('item', 'quantity');
								if(prevQty == null || prevQty == '' || prevQty == 'null' || prevQty =='undefined')
									prevQty=0;
								if(enterQty == null || enterQty == '')
									enterQty=0;

								totalQty = Number(Big(enterQty).plus(prevQty));
								TransformRec.setCurrentLineItemValue('item', 'quantity', totalQty);
								if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {

									compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
									nlapiLogExecution('Debug', "compSubRecord", compSubRecord);
									if(compSubRecord=='' || compSubRecord==null)
									{
										compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
									}


									compSubRecord.selectNewLineItem('inventoryassignment');



									nlapiLogExecution('Error','enterQty',enterQty);
									//intTotPickQty=parseFloat(intTotPickQty) + parseFloat(enterQty);
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(enterQty).toFixed(5)));
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
									// updating inventorystatus in IF
									if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
											inventorystatus != undefined && inventorystatus != '-None-')
									{
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
									}


									if(enterBin!=null && enterBin!="" && enterBin!='null')
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
									compSubRecord.commitLineItem('inventoryassignment');
									//compSubRecord.commit();
								}
								else if (itemType == "inventoryitem" || itemType == "assemblyitem") {
									//TransformRec.setCurrentLineItemValue('item', 'binnumber', enterBin);
									if(enterQty == null || enterQty == '')
										enterQty=0;

									intTotPickQty=Number(Big(intTotPickQty).plus(enterQty));

									compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
									nlapiLogExecution('Debug', "compSubRecord", compSubRecord);
									var tempQty=enterQty;
									if(compSubRecord==null || compSubRecord =='' || compSubRecord =='null')
									{
										compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');	

									}							 
									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

									nlapiLogExecution('ERROR','complinelength',complinelength);
									/*if(parseInt(complinelength)>0 && parseInt(complinelength)-s>0)
										compSubRecord.selectLineItem('inventoryassignment',parseInt(s)+1);
									else*/
									if(parseInt(complinelength)>0 && parseInt(complinelength)-parseInt(vCurrCompRecLine)>0)
										compSubRecord.selectLineItem('inventoryassignment',parseInt(vCurrCompRecLine)+1);
									else
										compSubRecord.selectNewLineItem('inventoryassignment');
									vCurrCompRecLine=vCurrCompRecLine+1;


									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(enterQty).toFixed(5)));
									// updating inventorystatus in IF
									if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
											inventorystatus != undefined && inventorystatus != '-None-')
									{
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
									}
									if(enterBin!=null && enterBin!="" && enterBin!='null')
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
									compSubRecord.commitLineItem('inventoryassignment');
									//compSubRecord.commit();


								}
								else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {



									var filterssertemp1 = new Array();
									if(enterQty == null || enterQty == '')
										enterQty=0;
									intTotPickQty=Number(Big(intTotPickQty).plus(enterQty));

									filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', vWMSSeOrdNo);
									if(trantype!="transferorder")
									{
										filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', itemLineNo);
									}
									else
									{
										filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', (itemLineNo));
									}
									filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', vOTSkuNo);
									nlapiLogExecution('ERROR', 'enterBin',enterBin);
									filterssertemp1[3] = new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', enterBin);

									if(FULFILLMENTATORDERLEVEL!='Y' && vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='null' && vcontainerLp!='- None -')
									{
										filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is', vcontainerLp));
									}

									if(inventoryStatusFeature == true && inventorystatus != null && inventorystatus != '')
									{
										filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus', null,'anyof', inventorystatus));
									}


									var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_serialkit_search', filterssertemp1,null);
									nlapiLogExecution('ERROR', 'SrchRecordTmpSerial1',SrchRecordTmpSerial1);
									if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
									{
										nlapiLogExecution('ERROR', 'SrchRecordTmpSerial1.length',SrchRecordTmpSerial1.length);
										//trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);
										var serialArray='';
										for (var n = 0; n < SrchRecordTmpSerial1.length; n++) 
										{
											if(serialArray==null || serialArray=='')
											{
												serialArray=SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_serial_no');
											}
											else
											{
												serialArray=serialArray+","+SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_serial_no');
											}
										}

										var totalSerialArray = [];
										if(serialArray != '' && serialArray != null)
											totalSerialArray=serialArray.split(',');
										nlapiLogExecution('ERROR', 'totalSerialArray',totalSerialArray);
										compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
										if(compSubRecord=='' || compSubRecord==null)
										{
											compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
										}
										for (var k = 0; k < totalSerialArray.length; k++) {
											nlapiLogExecution('ERROR', 'totalSerialArray[k]',totalSerialArray[k]);
											if(totalSerialArray[k] != null && totalSerialArray[k]!='')
											{
												compSubRecord.selectNewLineItem('inventoryassignment');
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', totalSerialArray[k]);
												// updating inventorystatus in IF
												if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
														inventorystatus != undefined && inventorystatus != '-None-')
												{
													compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
												}
												if(enterBin!=null && enterBin!="" && enterBin!='null')
													compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
												compSubRecord.commitLineItem('inventoryassignment');
											}

										}
										//compSubRecord.commit();

									}

								}
								else
								{
									TransformRec.setCurrentLineItemValue('item', 'quantity', totalQty);	
								}
							}
						}
						nlapiLogExecution('Debug', "vCheckflag", vCheckflag);
						if(vCheckflag == "F")
						{
							nlapiLogExecution('Debug', "inside item check false", k2);
							TransformRec.selectLineItem('item', k2);
							TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'F');
						}
						if ((vCheckflag == "T") && (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType =="serializedassemblyitem"))
						{
							if(compSubRecord != null && compSubRecord != '')
								compSubRecord.commit();
						}

						TransformRec.commitLineItem('item');
						w++;
						nlapiLogExecution('Debug', "w", w);
						if(parseInt(w)==parseInt(opentaskordersearchresultkit.length))
							break;
						nlapiLogExecution('Debug', "opentaskordersearchresultkit.length", opentaskordersearchresultkit.length);
					}
					filter=null;	
					columns=null;
					opentaskordersearchresultkit=null;
					nlapiLogExecution('Debug', "intTotPickQty", intTotPickQty);
					//TransformRec.setCurrentLineItemValue('item', 'quantity', intTotPickQty);
					//TransformRec.commitLineItem('item');

					nlapiLogExecution('Debug', "componentItemsArray.length", componentItemsArray.length);
					nlapiLogExecution('Debug', "j", j);
					var len= parseInt(componentItemsArray.length)-1;
					j=j+parseInt(len);


				}
				else
				{
					TransformRec.selectLineItem('item', itemIndex);
					TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'T');
					var intTotPickQty=0;
					var compSubRecord='';
					var vCurrCompRecLine=0;
					compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
					if(compSubRecord=='' || compSubRecord==null)
					{
						compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
						try
						{
							TransformRec.removeCurrentLineItemSubrecord('item', 'inventorydetail');
							TransformRec.commitLineItem('item');
							TransformRec.selectLineItem('item', itemIndex);
							TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'T');
							compSubRecord='';
							//compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
						}
						catch(ex)
						{
							nlapiLogExecution('Debug', "exception in subrecord", ex);
						}

					}
					else
					{
						var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
						if(parseInt(complinelength)>0)
						{
							for(var r1=1;r1<=complinelength;r1++)
							{ 
								compSubRecord.removeLineItem('inventoryassignment', 1);
							}
						}
					}
					var vInvDetArr=new Array();
					if(opentaskordersearchresult != null && opentaskordersearchresult != '')
					{	
						for(var s=0;s<opentaskordersearchresult.length;s++)
						{
							var vOTLineNo=opentaskordersearchresult[s].getValue('custrecord_wmsse_line_no',null,'group');
							nlapiLogExecution('Debug', "vOTLineNo,itemLineNo", vOTLineNo+","+itemLineNo);
							if(vOTLineNo==itemLineNo)
							{
								var inventorystatus="";
								var enterQty1=opentaskordersearchresult[s].getValue('custrecord_wmsse_act_qty',null,'sum');
								var enterBin1=opentaskordersearchresult[s].getValue('custrecord_wmsse_actendloc',null,'group');
								var batchno1 =opentaskordersearchresult[s].getValue('custrecord_wmsse_batch_num',null,'group');
								//Inventorystatus Feature is enabled
								if(inventoryStatusFeature == true)
									inventorystatus =opentaskordersearchresult[s].getValue('custrecord_wmsse_inventorystatus',null,'group');
								if(enterQty1 == null || enterQty1 == '')
									enterQty1=0;
								intTotPickQty=Number(Big(intTotPickQty).plus(enterQty1));
								nlapiLogExecution('Debug', "enterQty,enterBin,batchno", enterQty1+","+enterBin1+","+batchno1);
								var vInnerArr=new Array();
								vInnerArr.push(enterQty1);
								vInnerArr.push(enterBin1);
								vInnerArr.push(batchno1);
								if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
										inventorystatus != undefined && inventorystatus != '-None-')
								{
									vInnerArr.push(inventorystatus);
								}
								vInvDetArr.push(vInnerArr);	
								enterQty1=0;
								enterBin1=0;
								batchno1=0;
								inventorystatus = 0;
							}	
						}
					}
					else
					{
						TransformRec.selectLineItem('item', itemIndex);
						TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'F');
					}	
					if(vInvDetArr != null && vInvDetArr != '')
					{	
						TransformRec.setCurrentLineItemValue('item', 'quantity', Number(Big(intTotPickQty).toFixed(5)));

						for(var sk=0;sk<vInvDetArr.length;sk++)
						{
							var enterQty= vInvDetArr[sk][0];
							var enterBin=vInvDetArr[sk][1];
							var batchno =vInvDetArr[sk][2];
							var inventorystatus = vInvDetArr[sk][3];
							if(enterQty == null || enterQty == '')
								enterQty=0;

							if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {
								compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
								if(compSubRecord=='' || compSubRecord==null)
								{
									compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
								}
								compSubRecord.selectNewLineItem('inventoryassignment');


								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(enterQty).toFixed(5)));
								// updating inventorystatus in IF
								if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
										inventorystatus != undefined && inventorystatus != '-None-')
								{
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
								}
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
								if(enterBin!=null && enterBin!="" && enterBin!='null')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
								compSubRecord.commitLineItem('inventoryassignment');
								//compSubRecord.commit();
							}
							else if (itemType == "inventoryitem" || itemType == "assemblyitem") {
								//TransformRec.setCurrentLineItemValue('item', 'binnumber', enterBin);

								compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
								if(compSubRecord=='' || compSubRecord==null)
								{
									compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
								}
								var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
								nlapiLogExecution('ERROR','complinelength',complinelength);
								/*if(parseInt(complinelength)>0 && parseInt(complinelength)-s>0)
								compSubRecord.selectLineItem('inventoryassignment',parseInt(s)+1);
							else*/
								if(parseInt(complinelength)>0 && parseInt(complinelength)-parseInt(vCurrCompRecLine)>0)
									compSubRecord.selectLineItem('inventoryassignment',parseInt(vCurrCompRecLine)+1);
								else																	 
									compSubRecord.selectNewLineItem('inventoryassignment');

								vCurrCompRecLine=vCurrCompRecLine+1;
								//var compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
								//compSubRecord.selectNewLineItem('inventoryassignment');
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(enterQty).toFixed(5)));
								//compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
								// updating inventorystatus in IF
								if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
										inventorystatus != undefined && inventorystatus != '-None-')
								{
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
								}
								if(enterBin!=null && enterBin!="" && enterBin!='null')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
								compSubRecord.commitLineItem('inventoryassignment');
								//compSubRecord.commit();
							}
							else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {

								var filterssertemp1 = new Array();


								filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', vWMSSeOrdNo);
								if(trantype!="transferorder")
								{
									filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', itemLineNo);
								}
								else
								{
									filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', (itemLineNo));
								}

								filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_parent_sku_no', null, 'anyof', item_id);
								filterssertemp1[3] = new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', enterBin);

								if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
									filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', vShipVia)); 

								if( FULFILLMENTATORDERLEVEL!='Y' && vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='null' && vcontainerLp!='- None -')
								{
									filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is', vcontainerLp));
								}
								//Case # 201415968  end

								if(inventoryStatusFeature == true && inventorystatus != null && inventorystatus != '')
								{
									filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus', null,'anyof', inventorystatus));
								}

								var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_serialkit_search', filterssertemp1,null);
								if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
								{
									//trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);
									var serialArray='';
									for (var n = 0; n < SrchRecordTmpSerial1.length; n++) 
									{	
										if(serialArray==null || serialArray=='')
										{
											serialArray=SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_serial_no');
										}
										else
										{
											serialArray=serialArray+","+SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_serial_no');
										}
									}
									var totalSerialArray = [];
									if(serialArray != '' && serialArray != null)
										totalSerialArray=serialArray.split(',');
									nlapiLogExecution('ERROR', 'totalSerialArray',totalSerialArray);
									if(compSubRecord=='' || compSubRecord==null)
									{
										compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
									}
									for (var k = 0; k < totalSerialArray.length; k++) {
										compSubRecord.selectNewLineItem('inventoryassignment');
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
										// updating inventorystatus in IF
										if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
												inventorystatus != undefined && inventorystatus != '-None-')
										{

											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
										}
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', totalSerialArray[k]);
										if(enterBin!=null && enterBin!="" && enterBin!='null')
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
										compSubRecord.commitLineItem('inventoryassignment');

									}
									//compSubRecord.commit();

								}
								filterssertemp1=null;
								columnssertemp1=null;
								SrchRecordTmpSerial1=null;
							}
						}
					}
					else
					{
						TransformRec.selectLineItem('item', itemIndex);
						TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'F');
					}	
					if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType =="serializedassemblyitem")
					{
						if(compSubRecord != null && compSubRecord != '')
							compSubRecord.commit();
					}

					nlapiLogExecution('Debug', "intTotPickQty", intTotPickQty);

					TransformRec.commitLineItem('item');
				}


			}


		}
	}
	return TransformRec;
}
function nswms_PostItemFulfillmentNew(trantype,soInternalId,FetchedItemId,tlineNo,enterQty,enterBin,itemType,whLocation,batchno,trecord)
{



	var logMsg = 'itemType = ' + itemType + '<br>';
	logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
	logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
	logMsg = logMsg + 'trantype = ' + trantype + '<br>';
	logMsg = logMsg + 'poInternalId = ' + soInternalId + '<br>';
	logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
	logMsg = logMsg + 'poLineno = ' + soLineno + '<br>';
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'batchno = ' + batchno + '<br>';
	nlapiLogExecution('ERROR', 'Processing nswms_ItemFulfillment', logMsg);

	var idl="";
	if(trantype=="transferorder")
		soLineno=parseFloat(soLineno)-1;

	var lineItemCount = trecord.getLineItemCount('item');
	for(var k=1;k<=lineItemCount;k++)
	{
		//var enterQty = soRec.getLineItemValue('item','custcol_wmsse_soqty',k);
		var soLineno = trecord.getLineItemValue('item', 'line', k);
		nlapiLogExecution('ERROR', 'tlineNo', tlineNo);
		nlapiLogExecution('ERROR', 'soLineno', soLineno);
		if(tlineNo== soLineno)
		{
			trecord.selectLineItem('item', k);
			trecord.setCurrentLineItemValue('item', 'itemreceive', 'T');
			trecord.setCurrentLineItemValue('item', 'quantity', enterQty);

			trecord.setCurrentLineItemValue('item', 'location', whLocation);

			if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {

				var compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
				compSubRecord.selectNewLineItem('inventoryassignment');
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(enterQty).toFixed(5)));
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
				if(enterBin!=null && enterBin!="" && enterBin!='null')
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
				compSubRecord.commitLineItem('inventoryassignment');
				compSubRecord.commit();
			}
			else if (itemType == "inventoryitem") {
				trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);

			}
			else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {

				var filterssertemp1 = new Array();

				filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
				if(trantype!="transferorder")
				{
					filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', soLineno);
				}
				else
				{
					filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseFloat(soLineno)+1);
				}
				filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', soInternalId);
				var columnssertemp1 = new Array();
				//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
				//columnssertemp1[1] = new nlobjSearchColumn('name');
				var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp1,columnssertemp1);
				if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
				{
					//trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);
					var compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
					for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
						compSubRecord.selectNewLineItem('inventoryassignment');
						compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
						compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'));
						if(enterBin!=null && enterBin!="" && enterBin!='null')
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
						compSubRecord.commitLineItem('inventoryassignment');

					}
					compSubRecord.commit();

					for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
						var TempRecord=SrchRecordTmpSerial1[j];
						nlapiLogExecution('ERROR', 'TempRecord.getId()',TempRecord.getId());
						nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',TempRecord.getValue('name'));
						var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
						tempSerial.setFieldValue('id', TempRecord.getId());
						tempSerial.setFieldValue('name', TempRecord.getValue('name'));
						tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of item receipt posted for serial number  we have marked this serial number as closed');
						tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
						nlapiSubmitRecord(tempSerial);
					}
				}
			}


		}
		else
		{
			trecord.selectLineItem('item', tlineNo);
			trecord.setCurrentLineItemValue('item', 'itemreceive', 'F');
			//trecord.setCurrentLineItemValue('item', 'quantity', enterQty);
		}
		trecord.commitLineItem('item');
	}
	/*if(trecord != null && trecord != '')
		idl = nlapiSubmitRecord(trecord);	
	nlapiLogExecution('ERROR', 'idl', idl);*/
	return trecord;



}


/**
 * This function is to post Item Fulfillment used in Schedule script
 * 
 */
//Item fulfillment scheduler
function ItemFulfillmentSchedular(type)
{
	nlapiLogExecution('Debug', 'Scheduler version', type);

	var vWMSSeOrdNo='';
	var vShipVia ='';
	var confirmLotToNS =''
		var nsrefno ='';
	var vcontainerLp ='';
	var wavenumber ='';
	var packtaskid='';
	var itemloc ='';
	var FULFILLMENTATORDERLEVEL ='';
	var packtaskid='';
	var vcontainerLp='';
	var trantype='';
	var vLineArray=new Array();
	var vDate=DateStamp();
	var vTime=getConvertedTimeStamp();
	var vNewDate=vDate + ' ' + vTime;
	var packingFlag='F';
	try{
		//Initializing required variables 
		var context = nlapiGetContext(); 
		var currentUserID = getCurrentUser();
		var blnMultiShipEnabled = context.getFeature('multishipto');
		vWMSSeOrdNo = context.getSetting('SCRIPT', 'custscript_wms_ebizordno');
		vShipVia = context.getSetting('SCRIPT', 'custscript_wms_shipmethod');
		isItLastPick = context.getSetting('SCRIPT', 'custscript_wms_confirmtons');		
		vcontainerLp = context.getSetting('SCRIPT', 'custscript_wms_containerlp');
		itemloc = context.getSetting('SCRIPT', 'custscript_wms_itemloc');
		FULFILLMENTATORDERLEVEL = context.getSetting('SCRIPT', 'custscript_wms_fulfillmenttask');
		ismultilineship = context.getSetting('SCRIPT', 'custscript_wms_ismultilineship');
		packtaskid = context.getSetting('SCRIPT', 'custscript_wms_recid');

		if(vWMSSeOrdNo!=null && vWMSSeOrdNo!='')
			trantype = nlapiLookupField('transaction', vWMSSeOrdNo, 'recordType');

		// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
		var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

		var str = 'type. = ' + type + '<br>';	
		str = str + 'vebizOrdNo. = ' + vWMSSeOrdNo + '<br>';
		str = str + 'vShipVia. = ' + vShipVia + '<br>';	
		str = str + 'itemloc. = ' + itemloc + '<br>';
		str = str + 'FULFILLMENTATORDERLEVEL. = ' + FULFILLMENTATORDERLEVEL + '<br>';
		str = str + 'ismultilineship. = ' + ismultilineship + '<br>';
		str = str + 'packtaskid. = ' + packtaskid + '<br>';
		str = str + 'vcontainerLp. = ' + vcontainerLp + '<br>';
		str = str + 'trantype. = ' + trantype + '<br>';
		str = str + 'crossSubsidiaryFeature. = ' + crossSubsidiaryFeature + '<br>';

		nlapiLogExecution('Debug', 'Parameter Details', str);


		updateScheduleScriptStatus('Item Fulfillment SCH',currentUserID,'In Progress',vWMSSeOrdNo,trantype);


		var sysruleFilters1 = new Array();
		//sysruleFilters1.push(new nlobjSearchFilter('name', null, 'is', 'Is Packing Required?'));
		sysruleFilters1.push(new nlobjSearchFilter('name', null, 'is', 'Manually pack orders?'));
		if(itemloc !=null && itemloc!='' && itemloc!='null')
			sysruleFilters1.push(new nlobjSearchFilter('custrecord_wmssesite', null, 'anyof', ['@NONE@',itemloc]));
		sysruleFilters1.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		var sysruleColumns1 = new Array();
		sysruleColumns1[0] = new nlobjSearchColumn('custrecord_wmsserulevalue');
		sysruleColumns1[1] = new nlobjSearchColumn('custrecord_wmssesite').setSort();
		var systemRulesSearchresults1 = nlapiSearchRecord('customrecord_wmsse_sysrules', null, sysruleFilters1, sysruleColumns1);

		if(systemRulesSearchresults1 !=null && systemRulesSearchresults1 !='')
		{
			packingFlag=systemRulesSearchresults1[0].getValue('custrecord_wmsserulevalue');
		}
		if(packingFlag!=null && packingFlag!='')
		{
			if(packingFlag=="Y")
			{
				packingFlag="T";
			}
			else
			{
				packingFlag="F";
			}
		}
		sysruleFilters1=null;
		sysruleColumns1=null;
		systemRulesSearchresults1=null;
		//To update Schedule script Status to IN PROGRESS

		if(type != 'aborted')
		{



			var cartonArray=new Array();

			var filter1= new Array();
			//var opentaskordersearchresult1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentasksearchresults',filter1,null);
			var opentaskordersearchresult1=new Array();
			var opentaskordersearch= nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentasksearchresults');
			if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
				opentaskordersearch.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 

			if(FULFILLMENTATORDERLEVEL!='Y' && vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='- None -')
			{
				opentaskordersearch.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is', vcontainerLp));
			}
			else
			{
				opentaskordersearch.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null,'anyof', vWMSSeOrdNo));
			}
			if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
				opentaskordersearch.addFilter(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', vShipVia)); 

			if(itemloc!=null && itemloc !='' && itemloc !='null' && itemloc !='undefined')
				opentaskordersearch.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', itemloc)); 

			if(opentaskordersearch!=null && opentaskordersearch!='')
			{

				var resLenDetails = opentaskordersearch.runSearch();
				var resultsPage = resLenDetails.getResults(0, 1000);
				var offset = 0;
				while (!!resultsPage && resultsPage.length > 0) 
				{
					opentaskordersearchresult1 = opentaskordersearchresult1.concat(resultsPage);
					offset += 1000;
					resultsPage = resLenDetails.getResults(offset, offset + 1000);
				}



				var vCustomer="";
				for(var z=0;z<opentaskordersearchresult1.length;z++)
				{
					var RecordId=opentaskordersearchresult1[z].getValue('internalid',null,'group');
					var vContainerLp=opentaskordersearchresult1[z].getValue('custrecord_wmsse_container_lp_no',null,'group');
					vCustomer=opentaskordersearchresult1[z].getValue('custrecord_wmsse_customer',null,'group');
					var vContainerWeight=opentaskordersearchresult1[z].getValue('custrecord_wmsse_containerweight',null,'group');
					var vShipMethod=opentaskordersearchresult1[z].getValue('custrecord_wmsse_shipmethod',null,'group');
					var fields = new Array();
					var values = new Array();

					fields[0]='custrecord_wmsse_wms_status_flag';
					values[0]=28;
					fields[1]='custrecord_wmsse_pack_comp_date';
					values[1]=vNewDate;

					if(vContainerWeight == null || vContainerWeight == '' || vContainerWeight == 'null' || vContainerWeight == 'undefined')
					{
						fields[2]='custrecord_wmsse_containerweight';
						values[2]=1;
					}

					if(RecordId!=null && RecordId!='')
					{
						nlapiSubmitField('customrecord_wmsse_trn_opentask', RecordId,fields, values);
					}
				}
				if(packingFlag=="F")
				{
					taskType = 14;  
					wmsstatusflag = 28;
					createPackTaskRecord(vWMSSeOrdNo,whLocation,vCustomer,vShipMethod,vNewDate);
				}


			}

			filter1=null;
			columns1=null;
			opentaskordersearchresult1=null;



			var opentaskOpenRecordsResult= new Array();

			var opentaskOpenRecords= nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_openresults_fulfillue');

			if(opentaskOpenRecords!=null && opentaskOpenRecords!='')
			{
				if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
					opentaskOpenRecords.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 

				if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
					opentaskOpenRecords.addFilter(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', vShipVia));
			
			if(itemloc!=null && itemloc !='' && itemloc !='null' && itemloc !='undefined')
				opentaskOpenRecords.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', itemloc));

				var resLenDetails = opentaskOpenRecords.runSearch();
				var resultsPage = resLenDetails.getResults(0, 1000);
				var offset = 0;
				while (!!resultsPage && resultsPage.length > 0) 
				{
					opentaskOpenRecordsResult = opentaskOpenRecordsResult.concat(resultsPage);
					offset += 1000;
					resultsPage = resLenDetails.getResults(offset, offset + 1000);
				}
			}


			//Case # 201411642 end
			var filter= new Array();
			var TransformRecId = null;
			//Case # 201411642 Start
			var opentaskordersearchresult =new Array();
			if(FULFILLMENTATORDERLEVEL=='Y' && opentaskOpenRecordsResult != null && opentaskOpenRecordsResult.length > 0)
			{				
				opentaskordersearchresult =null;
				nlapiLogExecution('ERROR', 'Open Picks Exists for the Order');
			}
			else
			{
				nlapiLogExecution('ERROR', 'test2','test2');

				var opentaskordersearchresul= nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskresultsforif');


				if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
					opentaskordersearchresul.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 


				if(FULFILLMENTATORDERLEVEL!='Y' && vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='- None -')
				{
					opentaskordersearchresul.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is', vcontainerLp));
				}
				if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
					opentaskordersearchresul.addFilter(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', vShipVia)); 

				var resLenDetails = opentaskordersearchresul.runSearch();				

				var resultsPage = resLenDetails.getResults(0, 1000);
				var offset = 0;
				while (!!resultsPage && resultsPage.length > 0) 
				{
					opentaskordersearchresult = opentaskordersearchresult.concat(resultsPage);
					offset += 1000;
					resultsPage = resLenDetails.getResults(offset, offset + 1000);
				}

			}


			if(opentaskordersearchresult !=null && opentaskordersearchresult!='')
			{
				var ismultilineship='';
				var vshipgroup ='';
				if(vWMSSeOrdNo!=null && vWMSSeOrdNo!='')
				{
					nlapiLogExecution('Debug', 'Time3', TimeStampinSec());

					nlapiLogExecution('ERROR', 'vWMSSeOrdNo', vWMSSeOrdNo);
					var filters=new Array();					
					var searchresults=new Array();


					var searchresultsvalues= nlapiLoadSearch(trantype, 'customsearch_wmsse_transactionifresults');

					searchresultsvalues.addFilter(new nlobjSearchFilter('internalid', null, 'is', vWMSSeOrdNo));
					searchresultsvalues.addFilter(new nlobjSearchFilter('mainline', null, 'is', 'F'));
					// Pending Fulfillment / Partially Fulfilled / Pending Billing_Partially Fulfilled
					searchresultsvalues.addFilter(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E']));
					searchresultsvalues.addFilter(new nlobjSearchFilter('shipping', null, 'is', 'F'));//To avoid shipping lines.
					searchresultsvalues.addFilter(new nlobjSearchFilter('taxline', null, 'is', 'F'));//To avoid tax lines.
					if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
						searchresultsvalues.addFilter(new nlobjSearchFilter('shipmethod', null, 'anyof', vShipVia));

					var resLenDetails = searchresultsvalues.runSearch();				

					var resultsPage = resLenDetails.getResults(0, 1000);
					var offset = 0;
					while (!!resultsPage && resultsPage.length > 0) 
					{
						searchresults = searchresults.concat(resultsPage);
						offset += 1000;
						resultsPage = resLenDetails.getResults(offset, offset + 1000);
					}

					nlapiLogExecution('Debug', 'Time4', TimeStampinSec());
					if(searchresults != null && searchresults !='')
					{

						for(var p=0;p<searchresults.length;p++)
						{
							var vnShipMethod = searchresults[p].getValue('shipmethod');
							var vnItem = searchresults[p].getValue('item');
							var itemListArray=new Array();
							var vLineNo =0;
							for(var p1=0;p1<opentaskordersearchresult.length;p1++)
							{
								var opentaskItemId=opentaskordersearchresult[p1].getValue('custrecord_wmsse_sku',null,'group');	
								if(opentaskItemId == vnItem )
								{
									vLineNo=opentaskordersearchresult[p1].getValue('custrecord_wmsse_line_no',null,'group');
									break;
								}

							}
							var vnLine = searchresults[p].getValue('line');							


							if(vnShipMethod == vShipVia && vnLine == vLineNo )
							{
								ismultilineship='F';
								if(blnMultiShipEnabled)
									ismultilineship = searchresults[p].getValue('ismultishipto');
								vshipgroup=searchresults[p].getValue('shipgroup');
								break;
							}
						}
					}
					nlapiLogExecution('ERROR', 'vWMSSeOrdNo after', vWMSSeOrdNo);

				}
				nlapiLogExecution('ERROR', 'vshipgroup', vshipgroup);
				nlapiLogExecution('ERROR', 'ismultilineship', ismultilineship);
				var trecord ='';

				// if Cross-Subsidiary Fulfillment feature is enabled, need to provide Inventorylocation as well while transform record				
				if(crossSubsidiaryFeature == true && trantype =="salesorder")
				{
					if(ismultilineship != 'T')
					{
						nlapiLogExecution('ERROR', 'inside if', ismultilineship);
						trecord = nlapiTransformRecord(trantype, vWMSSeOrdNo, 'itemfulfillment',{ 'inventorylocation' : itemloc});
					}
					else
					{
						nlapiLogExecution('ERROR', 'inside else', ismultilineship);
						trecord = nlapiTransformRecord(trantype, vWMSSeOrdNo, 'itemfulfillment', { 'shipgroup' : vshipgroup,'inventorylocation':itemloc});
					}
				}
				else
				{

					if(ismultilineship != 'T')
					{
						nlapiLogExecution('ERROR', 'inside if', ismultilineship);
						trecord = nlapiTransformRecord(trantype, vWMSSeOrdNo, 'itemfulfillment');
					}
					else
					{
						nlapiLogExecution('ERROR', 'inside else', ismultilineship);
						trecord = nlapiTransformRecord(trantype, vWMSSeOrdNo, 'itemfulfillment', { 'shipgroup' : vshipgroup});
					}
				}
				var itemListArray=new Array();
				for(var p=0;p<opentaskordersearchresult.length;p++)
				{

					var soLineno=opentaskordersearchresult[p].getValue('custrecord_wmsse_line_no',null,'group');
					if(vLineArray.indexOf(soLineno)==-1)
					{
						vLineArray.push(parseInt(soLineno));
					}	 

				}
				nlapiLogExecution('Debug', 'Time5', TimeStampinSec());
				nswms_PostItemFulfillmentscheduler(trantype,vWMSSeOrdNo,opentaskordersearchresult,vLineArray,trecord,vShipVia,vcontainerLp,FULFILLMENTATORDERLEVEL);
				//This function is to post item fulfillment
				nlapiLogExecution('ERROR', 'trecord', trecord);
				var TransformRecId='';
				if(trecord!=null && trecord!='')
				{
					TransformRecId = nlapiSubmitRecord(trecord);
				}
				nlapiLogExecution('Debug', 'Time6', TimeStampinSec());
				nlapiLogExecution('ERROR', 'TransformRecId', TransformRecId);
				if(TransformRecId!=null && TransformRecId!='')
				{
					nlapiLogExecution('Debug', 'Time7', TimeStampinSec());
					updateNSRefInOpentask(vWMSSeOrdNo,TransformRecId,vcontainerLp,FULFILLMENTATORDERLEVEL,itemloc);
					//This function is to update OpenTask with NS Ref Number
					nlapiLogExecution('Debug', 'Time8', TimeStampinSec());

					updateScheduleScriptStatus('Item Fulfillment SCH',currentUserID,'Completed',vWMSSeOrdNo,trantype);
					//To update Schedule Script status to COMPLETED
				}
			}

			if(TransformRecId !='' && TransformRecId!=null && TransformRecId!='null')
			{
				nlapiLogExecution('Debug', 'Time9', TimeStampinSec());
				var shipmanifestcheck=getSystemRuleValue('Use WMS Shipping Integration?');
				var ASNCRuleVal = getSystemRuleValue('Generate EDI 856 outbound ASNs?');
				var UCCRuleVal=getSystemRuleValue('Label Printing: UCC/GS1 Labels with 3rd party integration');
				var Zebraucclabel=getSystemRuleValue('Label Printing: UCC/GS1 labels using ZPL');
				var ZebraAddresslabel=getSystemRuleValue('Label Printing: Address labels using ZPL');

				var trantype = nlapiLookupField('transaction', vWMSSeOrdNo, 'recordType');
				var salesorderrecord=nlapiLoadRecord(trantype, vWMSSeOrdNo);
				nlapiLogExecution('Debug', 'Time10', TimeStampinSec());
				var manualpack=getSystemRuleValue('Manually pack orders?',whLocation);
				//To fetch System rule value of 'Manually pack orders?'
				if(vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='null' && vcontainerLp!='undefined' &&  FULFILLMENTATORDERLEVEL!='Y')
				{
					createPacklistHtml(vWMSSeOrdNo,trantype,salesorderrecord,vcontainerLp);
					//To create Packlist
				}
				else if(FULFILLMENTATORDERLEVEL=='Y' && manualpack=='Y')
				{
					var packlistexist=IsPackListExist(vWMSSeOrdNo);
					//To verify whether Packlist is already generated or not
					nlapiLogExecution('Debug', 'packlistexist', packlistexist);
					nlapiLogExecution('Debug', 'TransformRecId', TransformRecId);
					if(packlistexist=='T' && (TransformRecId == '' || TransformRecId == null || TransformRecId == 'null' || TransformRecId == 'undefined'))
					{
						nlapiLogExecution("Debug", "Packlist is already generated","Packlist is already generated");	
					}	
					else
					{
						if(TransformRecId == '' || TransformRecId == null || TransformRecId == 'null' || TransformRecId == 'undefined')
						{

							createPacklistHtml(vWMSSeOrdNo,trantype,salesorderrecord,"");
						}
						else
						{

							createPacklistHtml(vWMSSeOrdNo,trantype,salesorderrecord,vcontainerLp);	
						}
						//To create Packlist
					}
				}
				else
					createPacklistHtml(vWMSSeOrdNo,trantype,salesorderrecord,TransformRecId);
				//To create Packlist

				nlapiLogExecution('Debug', 'Time11', TimeStampinSec());
				var filtership= new Array();


				if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
					filtership.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 

				if(TransformRecId !='' && TransformRecId !=null)
					filtership.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',TransformRecId)); // NS REF no is not empty


				var opentaskordersearchresultShip = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskresultforship',filtership,null);
				if(opentaskordersearchresultShip!=null && opentaskordersearchresultShip!='')
				{
					nlapiLogExecution('Debug', 'Time12', TimeStampinSec());
					nlapiLogExecution('ERROR', 'opentaskordersearchresultShip', opentaskordersearchresultShip.length);
					for(var x=0;x<opentaskordersearchresultShip.length;x++)
					{
						var containerLpShip=opentaskordersearchresultShip[x].getValue('custrecord_wmsse_container_lp_no',null,'group');
						var containerSizeShip=opentaskordersearchresultShip[x].getValue('custrecord_wmsse_container_size',null,'group');
						var containerWeightShip=opentaskordersearchresultShip[x].getValue('custrecord_wmsse_containerweight',null,'group');
						var whLocation=opentaskordersearchresultShip[x].getValue('custrecord_wmsse_wms_location',null,'group');
						nlapiLogExecution('ERROR', 'containerLpShip,containerSizeShip,containerWeightShip',containerLpShip+","+containerSizeShip+","+containerWeightShip);
						if(containerSizeShip==null || containerSizeShip=='' || containerSizeShip=='undefined')
						{
							containerSizeShip="Size1";
						}
						if(containerWeightShip==null || containerWeightShip=='' || containerWeightShip=='undefined')
						{
							containerWeightShip=1;
						}

						nlapiLogExecution('Debug', 'Time13', TimeStampinSec());
						if(shipmanifestcheck=='Y')
						{
							CreateShippingManifestRecord(vWMSSeOrdNo,containerLpShip,containerSizeShip,containerWeightShip,1,1,1,trantype,salesorderrecord);
							//To create Ship Manifest record
						}

						nlapiLogExecution('Debug', 'Time14', TimeStampinSec());
						if(ASNCRuleVal =='Y')
						{
							GenerateLabel(vWMSSeOrdNo,1,containerLpShip);
							//To generate label
						}

						if(UCCRuleVal =='Y')
						{

							GenerateUCCLabel(vWMSSeOrdNo,containerLpShip);

						}


						if(Zebraucclabel =='Y')
						{
							GenerateZebraUccLabel(vWMSSeOrdNo,containerLpShip,salesorderrecord,whLocation);

						}

						if(ZebraAddresslabel =='Y')
						{


							GenerateZebraAddressLabel(vWMSSeOrdNo,salesorderrecord,whLocation);
						}
						nlapiLogExecution('Debug', 'Time15', TimeStampinSec());
						nlapiLogExecution('ERROR', 'shipmanifest created successfully for', containerLpShip);
					}
				}

			}


		}

	}
	catch(exp)
	{

		nlapiLogExecution('ERROR','exception in ItemFulfillmentSCH',exp);
	}
}


/**
 * This function is to post Item Fulfillment
 * 
 */
function nswms_PostItemFulfillmentscheduler(trantype,vWMSSeOrdNo,opentaskordersearchresult,filterLineArray,TransformRec,vShipVia,vcontainerLp,FULFILLMENTATORDERLEVEL)
{
	if(TransformRec!=null)
	{
		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		SOLength = TransformRec.getLineItemCount('item');  // To get the no of lines from item fulfillment record
		nlapiLogExecution('Debug', "SO Length", SOLength);
		nlapiLogExecution('Debug', "vShipVia", vShipVia);
		nlapiLogExecution('Debug', "vcontainerLp", vcontainerLp);
		var context = nlapiGetContext(); 
		for(var j=1; j<=SOLength;j++ ) // This array contains all disctinct lines no for the order
		{
			if(context.getRemainingUsage()<1000)// Yielding Schedule script if remaining units are less than 1000
			{
				setRecoveryPoint();
				var curuserId = context.getUser();
				nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());
				var state = nlapiYieldScript();//To Yield Schedule script
				if( state.status == 'FAILURE')
				{
					nlapiLogExecution("DEBUG","Failed to yield script, exiting: Reason = "+state.reason + " / Size = "+ state.size);
					nlapiLogExecution('Audit','Calling Second Scheduler - Remaining Usage',context.getRemainingUsage());

				} 
				else if ( state.status == 'RESUME' )
				{
					nlapiLogExecution("DEBUG", "Resuming script because of " + state.reason+".  Size = "+ state.size);
				}
			}
			var itemIndex=0;

			var vitemLineNo = TransformRec.getLineItemValue('item', 'line', j);
			//var IsLineClosed = TransformRec.getLineItemValue('item', 'isclosed', j);
			if(trantype=="transferorder"){
				vitemLineNo=parseFloat(vitemLineNo)-1;
			}

			if(filterLineArray.indexOf(parseInt(vitemLineNo))!= -1)
			{

				itemIndex=j; 	
			}

			if(itemIndex!=0)
			{
				var item_id = TransformRec.getLineItemValue('item', 'item', itemIndex);
				var itemname = TransformRec.getLineItemText('item', 'item', itemIndex);
				var itemLineNo = TransformRec.getLineItemValue('item', 'line', itemIndex);
				//itemname=itemname.replace(" ","-");
				if(trantype=="transferorder"){
					itemLineNo=parseFloat(itemLineNo)-1;
				}
				if(itemname!=null && itemname!='')
					itemname=itemname.replace(/ /g,"-");
				var itemrec = TransformRec.getLineItemValue('item', 'itemreceive', itemIndex);
				var itemloc2 = TransformRec.getLineItemValue('item', 'location', itemIndex);
				var itemType=nswms_GetItemType(item_id,itemloc2);
				if(itemType == 'kititem')
				{	

					//for kit/package items




					var filter= new Array();

					if(vWMSSeOrdNo != null && vWMSSeOrdNo != '')
						filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', vWMSSeOrdNo)); 
					filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', vitemLineNo));
					if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
						filter.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', vShipVia)); 

					var componentItemsArray= new Array();

					var opentaskordersearchresultkit = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_kititem_ot_search',filter,null);


					var intTotPickQty=0;
					var compSubRecord='';
					if(opentaskordersearchresultkit != null && opentaskordersearchresultkit != '' && opentaskordersearchresultkit.length>0)
					{
						for(var s=0;s<opentaskordersearchresultkit.length;s++)
						{
							var vOTSkuNo=opentaskordersearchresultkit[s].getValue('custrecord_wmsse_sku',null,'group');
							if(componentItemsArray.indexOf(vOTSkuNo)==-1)
							{
								componentItemsArray.push(vOTSkuNo);
							}
						}
					}
					//	var kitItemsLineNo = parseInt(itemLineNo)+1;
					var w=0;
					for(var k2=itemIndex;k2<=SOLength;k2++)
					{
						TransformRec.selectLineItem('item', k2);
						TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'T');
						var vCheckflag="F";
						var item=TransformRec.getLineItemValue('item', 'item', k2);

						var compSubRecord = null;
						var vCurrCompRecLine=0;	
						var itemType=nswms_GetItemType(item,itemloc2);
						if(itemType != 'kititem' )
						{
							compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
							if(compSubRecord=='' || compSubRecord==null)
							{

								compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
								try
								{
									TransformRec.removeCurrentLineItemSubrecord('item', 'inventorydetail');
									TransformRec.commitLineItem('item');
									TransformRec.selectLineItem('item', k2);
									TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'T');
									//compSubRecord='';

								}
								catch(ex)
								{
									nlapiLogExecution('Debug', "exception in subrecord", ex);
								}

							}
							else
							{
								nlapiLogExecution('ERROR', 'compSubRecord', 'inside else compSubRecord');
								var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
								if(parseInt(complinelength)>0)
								{
									for(var r1=1;r1<=complinelength;r1++)
									{ 
										compSubRecord.removeLineItem('inventoryassignment', 1);
									}
								}
							}
						}
						var prevQty = 0;
						var totalQty =0;
						for(var k3=0;k3<opentaskordersearchresultkit.length;k3++)
						{
							var inventorystatus='';
							var whlocation = opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_wms_location',null,'group');
							TransformRec.setCurrentLineItemValue('item', 'location', whlocation);
							var vOTSkuNo=opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_sku',null,'group');
							//if Inventorystatus feature is enabled
							if(inventoryStatusFeature == true)
								inventorystatus =opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_inventorystatus',null,'group');

							if(vOTSkuNo==item)
							{
								vCheckflag = "T";
								var itemType=nswms_GetItemType(item,itemloc2);
								var enterQty=opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_act_qty',null,'sum');

								if(enterQty == '' || enterQty == 'null' || enterQty == null || enterQty == undefined)
									enterQty=opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_compitm_actqty',null,'sum');

								var enterBin=opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_actendloc',null,'group');
								var batchno =opentaskordersearchresultkit[k3].getValue('custrecord_wmsse_batch_num',null,'group');

								prevQty = TransformRec.getCurrentLineItemValue('item', 'quantity');
								if(prevQty == null || prevQty == '' || prevQty == 'null' || prevQty =='undefined')
									prevQty=0;
								if(enterQty == null || enterQty == '')
									enterQty=0;

								totalQty = Number(Big(enterQty).plus(prevQty));
								TransformRec.setCurrentLineItemValue('item', 'quantity', totalQty);
								if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {

									compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');

									if(compSubRecord=='' || compSubRecord==null)
									{
										compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
									}


									compSubRecord.selectNewLineItem('inventoryassignment');




									//intTotPickQty=parseFloat(intTotPickQty) + parseFloat(enterQty);
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(enterQty).toFixed(5)));
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
									// updating inventorystatus in IF
									if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
											inventorystatus != undefined && inventorystatus != '-None-')
									{
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
									}


									if(enterBin!=null && enterBin!="" && enterBin!='null')
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
									compSubRecord.commitLineItem('inventoryassignment');
									//compSubRecord.commit();
								}
								else if (itemType == "inventoryitem" || itemType == "assemblyitem") {
									//TransformRec.setCurrentLineItemValue('item', 'binnumber', enterBin);
									if(enterQty == null || enterQty == '')
										enterQty=0;

									intTotPickQty=Number(Big(intTotPickQty).plus(enterQty));

									compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
									nlapiLogExecution('Debug', "compSubRecord", compSubRecord);
									var tempQty=enterQty;
									if(compSubRecord==null || compSubRecord =='' || compSubRecord =='null')
									{
										compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');	

									}							 
									var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

									nlapiLogExecution('ERROR','complinelength',complinelength);
									/*if(parseInt(complinelength)>0 && parseInt(complinelength)-s>0)
										compSubRecord.selectLineItem('inventoryassignment',parseInt(s)+1);
									else*/
									if(parseInt(complinelength)>0 && parseInt(complinelength)-parseInt(vCurrCompRecLine)>0)
										compSubRecord.selectLineItem('inventoryassignment',parseInt(vCurrCompRecLine)+1);
									else
										compSubRecord.selectNewLineItem('inventoryassignment');
									vCurrCompRecLine=vCurrCompRecLine+1;


									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(enterQty).toFixed(5)));
									// updating inventorystatus in IF
									if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
											inventorystatus != undefined && inventorystatus != '-None-')
									{
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
									}
									if(enterBin!=null && enterBin!="" && enterBin!='null')
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
									compSubRecord.commitLineItem('inventoryassignment');
									//compSubRecord.commit();


								}
								else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {



									var filterssertemp1 = new Array();
									if(enterQty == null || enterQty == '')
										enterQty=0;
									intTotPickQty=Number(Big(intTotPickQty).plus(enterQty));

									filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', vWMSSeOrdNo);
									if(trantype!="transferorder")
									{
										filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', itemLineNo);
									}
									else
									{
										filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', (itemLineNo));
									}
									filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', vOTSkuNo);
									nlapiLogExecution('ERROR', 'enterBin',enterBin);
									filterssertemp1[3] = new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', enterBin);

									if(FULFILLMENTATORDERLEVEL!='Y' && vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='null' && vcontainerLp!='- None -')
									{
										filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is', vcontainerLp));
									}

									if(inventoryStatusFeature == true && inventorystatus != null && inventorystatus != '')
									{
										filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus', null,'anyof', inventorystatus));
									}

									var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_serialkit_search', filterssertemp1,null);
									nlapiLogExecution('ERROR', 'SrchRecordTmpSerial1',SrchRecordTmpSerial1);
									if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
									{
										nlapiLogExecution('ERROR', 'SrchRecordTmpSerial1.length',SrchRecordTmpSerial1.length);
										//trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);
										var serialArray='';
										for (var n = 0; n < SrchRecordTmpSerial1.length; n++) 
										{
											if(serialArray==null || serialArray=='')
											{
												serialArray=SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_serial_no');
											}
											else
											{
												serialArray=serialArray+","+SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_serial_no');
											}
										}
										var totalSerialArray = [];
										if(serialArray != '' && serialArray != null)
											totalSerialArray=serialArray.split(',');
										nlapiLogExecution('ERROR', 'totalSerialArray',totalSerialArray);
										compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
										if(compSubRecord=='' || compSubRecord==null)
										{
											compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
										}
										for (var k = 0; k < totalSerialArray.length; k++) {
											nlapiLogExecution('ERROR', 'totalSerialArray[k]',totalSerialArray[k]);
											if(totalSerialArray[k] != null && totalSerialArray[k]!='')
											{
												compSubRecord.selectNewLineItem('inventoryassignment');
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', totalSerialArray[k]);
												// updating inventorystatus in IF
												if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
														inventorystatus != undefined && inventorystatus != '-None-')
												{
													compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
												}
												if(enterBin!=null && enterBin!="" && enterBin!='null')
													compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
												compSubRecord.commitLineItem('inventoryassignment');
											}

										}
										//compSubRecord.commit();

									}

								}
								else
								{
									TransformRec.setCurrentLineItemValue('item', 'quantity', totalQty);	
								}
							}
						}
						nlapiLogExecution('Debug', "vCheckflag", vCheckflag);
						if(vCheckflag == "F")
						{
							nlapiLogExecution('Debug', "inside item check false", k2);
							TransformRec.selectLineItem('item', k2);
							TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'F');
						}
						if ((vCheckflag == "T") && (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType =="serializedassemblyitem"))
						{
							if(compSubRecord != null && compSubRecord != '')
								compSubRecord.commit();
						}

						TransformRec.commitLineItem('item');
						w++;

						if(parseInt(w)==parseInt(opentaskordersearchresultkit.length))
							break;
						nlapiLogExecution('Debug', "opentaskordersearchresultkit.length", opentaskordersearchresultkit.length);
					}
					filter=null;	
					columns=null;
					opentaskordersearchresultkit=null;
					nlapiLogExecution('Debug', "intTotPickQty", intTotPickQty);
					//TransformRec.setCurrentLineItemValue('item', 'quantity', intTotPickQty);
					//TransformRec.commitLineItem('item');

					nlapiLogExecution('Debug', "componentItemsArray.length", componentItemsArray.length);
					nlapiLogExecution('Debug', "j", j);
					var len= parseInt(componentItemsArray.length)-1;
					j=j+parseInt(len);


				}
				else
				{
					TransformRec.selectLineItem('item', itemIndex);
					TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'T');
					var intTotPickQty=0;
					var compSubRecord='';
					var vCurrCompRecLine=0;
					compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
					if(compSubRecord=='' || compSubRecord==null)
					{
						compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
						try
						{
							TransformRec.removeCurrentLineItemSubrecord('item', 'inventorydetail');
							TransformRec.commitLineItem('item');
							TransformRec.selectLineItem('item', itemIndex);
							TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'T');
							compSubRecord='';
							//compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
						}
						catch(ex)
						{
							nlapiLogExecution('Debug', "exception in subrecord", ex);
						}

					}
					else
					{
						var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
						if(parseInt(complinelength)>0)
						{
							for(var r1=1;r1<=complinelength;r1++)
							{ 
								compSubRecord.removeLineItem('inventoryassignment', 1);
							}
						}
					}
					var vInvDetArr=new Array();
					if(opentaskordersearchresult != null && opentaskordersearchresult != '')
					{	
						for(var s=0;s<opentaskordersearchresult.length;s++)
						{
							var vOTLineNo=opentaskordersearchresult[s].getValue('custrecord_wmsse_line_no',null,'group');
							nlapiLogExecution('Debug', "vOTLineNo,itemLineNo", vOTLineNo+","+itemLineNo);
							if(vOTLineNo==itemLineNo)
							{
								var inventorystatus="";
								var enterQty1=opentaskordersearchresult[s].getValue('custrecord_wmsse_act_qty',null,'sum');
								var enterBin1=opentaskordersearchresult[s].getValue('custrecord_wmsse_actendloc',null,'group');
								var batchno1 =opentaskordersearchresult[s].getValue('custrecord_wmsse_batch_num',null,'group');
								//Inventorystatus Feature is enabled
								if(inventoryStatusFeature == true)
									inventorystatus =opentaskordersearchresult[s].getValue('custrecord_wmsse_inventorystatus',null,'group');
								if(enterQty1 == null || enterQty1 == '')
									enterQty1=0;
								intTotPickQty=Number(Big(intTotPickQty).plus(enterQty1));
								nlapiLogExecution('Debug', "enterQty,enterBin,batchno", enterQty1+","+enterBin1+","+batchno1);
								var vInnerArr=new Array();
								vInnerArr.push(enterQty1);
								vInnerArr.push(enterBin1);
								vInnerArr.push(batchno1);
								if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
										inventorystatus != undefined && inventorystatus != '-None-')
								{
									vInnerArr.push(inventorystatus);
								}
								vInvDetArr.push(vInnerArr);	
								enterQty1=0;
								enterBin1=0;
								batchno1=0;
								inventorystatus = 0;
							}	
						}
					}
					else
					{
						TransformRec.selectLineItem('item', itemIndex);
						TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'F');
					}	
					if(vInvDetArr != null && vInvDetArr != '')
					{	
						TransformRec.setCurrentLineItemValue('item', 'quantity', intTotPickQty);

						for(var sk=0;sk<vInvDetArr.length;sk++)
						{
							var enterQty= vInvDetArr[sk][0];
							var enterBin=vInvDetArr[sk][1];
							var batchno =vInvDetArr[sk][2];
							var inventorystatus = vInvDetArr[sk][3];
							if(enterQty == null || enterQty == '')
								enterQty=0;

							if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {
								compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
								if(compSubRecord=='' || compSubRecord==null)
								{
									compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
								}
								compSubRecord.selectNewLineItem('inventoryassignment');


								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(enterQty).toFixed(5)));
								// updating inventorystatus in IF
								if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
										inventorystatus != undefined && inventorystatus != '-None-')
								{
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
								}
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
								if(enterBin!=null && enterBin!="" && enterBin!='null')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
								compSubRecord.commitLineItem('inventoryassignment');
								//compSubRecord.commit();
							}
							else if (itemType == "inventoryitem" || itemType == "assemblyitem") {
								//TransformRec.setCurrentLineItemValue('item', 'binnumber', enterBin);

								compSubRecord = TransformRec.editCurrentLineItemSubrecord('item','inventorydetail');
								if(compSubRecord=='' || compSubRecord==null)
								{
									compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
								}
								var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
								nlapiLogExecution('ERROR','complinelength',complinelength);
								/*if(parseInt(complinelength)>0 && parseInt(complinelength)-s>0)
								compSubRecord.selectLineItem('inventoryassignment',parseInt(s)+1);
							else*/
								if(parseInt(complinelength)>0 && parseInt(complinelength)-parseInt(vCurrCompRecLine)>0)
									compSubRecord.selectLineItem('inventoryassignment',parseInt(vCurrCompRecLine)+1);
								else																	 
									compSubRecord.selectNewLineItem('inventoryassignment');

								vCurrCompRecLine=vCurrCompRecLine+1;
								//var compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
								//compSubRecord.selectNewLineItem('inventoryassignment');
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Number(Big(enterQty).toFixed(5)));
								//compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
								// updating inventorystatus in IF
								if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
										inventorystatus != undefined && inventorystatus != '-None-')
								{
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
								}
								if(enterBin!=null && enterBin!="" && enterBin!='null')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
								compSubRecord.commitLineItem('inventoryassignment');
								//compSubRecord.commit();
							}
							else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {

								var filterssertemp1 = new Array();


								filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', vWMSSeOrdNo);
								if(trantype!="transferorder")
								{
									filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', itemLineNo);
								}
								else
								{
									filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', (itemLineNo));
								}

								filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_parent_sku_no', null, 'anyof', item_id);
								filterssertemp1[3] = new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', enterBin);

								if(vShipVia!=null && vShipVia !='' && vShipVia !='null' && vShipVia !='undefined')
									filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', vShipVia)); 

								if( FULFILLMENTATORDERLEVEL!='Y' && vcontainerLp!=null && vcontainerLp!='' && vcontainerLp!='null' && vcontainerLp!='- None -')
								{
									filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null,'is', vcontainerLp));
								}
								//Case # 201415968  end

								if(inventoryStatusFeature == true && inventorystatus != null && inventorystatus != '')
								{
									filterssertemp1.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus', null,'anyof', inventorystatus));
								}

								var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_ot_serialkit_search', filterssertemp1,null);
								if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
								{
									//trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);
									var serialArray='';
									for (var n = 0; n < SrchRecordTmpSerial1.length; n++) 
									{
										if(serialArray==null || serialArray=='')
										{
											serialArray=SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_serial_no');
										}
										else
										{
											serialArray=serialArray+","+SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_serial_no');
										}
									}
									var totalSerialArray = [];
									if(serialArray != '' && serialArray != null)
										totalSerialArray=serialArray.split(',');
									nlapiLogExecution('ERROR', 'totalSerialArray',totalSerialArray);
									if(compSubRecord=='' || compSubRecord==null)
									{
										compSubRecord = TransformRec.createCurrentLineItemSubrecord('item','inventorydetail');
									}
									for (var k = 0; k < totalSerialArray.length; k++) {
										compSubRecord.selectNewLineItem('inventoryassignment');
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
										// updating inventorystatus in IF
										if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined' &&
												inventorystatus != undefined && inventorystatus != '-None-')
										{

											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventorystatus);
										}
										compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', totalSerialArray[k]);
										if(enterBin!=null && enterBin!="" && enterBin!='null')
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
										compSubRecord.commitLineItem('inventoryassignment');

									}
									//compSubRecord.commit();

								}
								filterssertemp1=null;
								columnssertemp1=null;
								SrchRecordTmpSerial1=null;
							}
						}
					}
					else
					{
						TransformRec.selectLineItem('item', itemIndex);
						TransformRec.setCurrentLineItemValue('item', 'itemreceive', 'F');
					}	
					if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType =="serializedassemblyitem")
					{
						if(compSubRecord != null && compSubRecord != '')
							compSubRecord.commit();
					}

					nlapiLogExecution('Debug', "intTotPickQty", intTotPickQty);

					TransformRec.commitLineItem('item');
				}


			}


		}
	}
	return TransformRec;
}

/**
 * This function is to set recovery point which can saves the State of the script
 * 
 */
function setRecoveryPoint()
{
	var state = nlapiSetRecoveryPoint(); //100 point governance
	nlapiLogExecution("Audit",'state status',state.status);
	if( state.status == 'SUCCESS' ) return;  //we successfully create a new recovery point
	if( state.status == 'RESUME' ) //a recovery point was previously set, we are resuming due to some unforeseen error
	{
		nlapiLogExecution("Audit", "Resuming script because of " + state.reason+".  Size = "+ state.size);
		//handleScriptRecovery();
	}
	else if ( state.status == 'FAILURE' )  //we failed to create a new recovery point
	{
		nlapiLogExecution("Audit","Failed to create recovery point. Reason = "+state.reason + " / Size = "+ state.size);
		//handleRecoveryFailure(state);
	}
}