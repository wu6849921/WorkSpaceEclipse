/**
 * Script Description
 * This script is used to scan the qty and bin location for selected item.
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan qty and bin location
 */
function FulfillmentQtyScan(request, response)
{
	nlapiLogExecution('Error', 'FulfillmentQtyScan starts', TimeStampinSec());

	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	if (request.getMethod() == 'GET') 
	{
		nlapiLogExecution('Error', 'GET starts', TimeStampinSec());

		var getOptedField = request.getParameter('custparam_option');
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');
		var department = '';
		var vclass = '';
		//Variable Declaration
		var html = '';

		//Get the PO# from the previous screen, which is passed as a parameter		
		var getSONo = request.getParameter('custparam_soid');

		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var getSOresults = request.getParameter('custparam_soresults');
		var customer=request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var whCompany= request.getParameter('custparam_company');
		var getSONo = request.getParameter('custparam_soid');
		var getSOItem = request.getParameter('custparam_soitem');
		var getSOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var itemType=request.getParameter('custparam_itemtype');
		var cartonScreenRuleValue=request.getParameter('custparam_cartonscreenrulevalue');
		var carton=request.getParameter('custparam_carton');
		var cartonSize=request.getParameter('custparam_cartonsize');
		var cartonWeight=request.getParameter('custparam_cartonweight');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var vShipVia = request.getParameter('custparam_shipmethod');
		var ordType = request.getParameter('custparam_ordtype');
		if(departments == true)
			var department = request.getParameter('custparam_department');
		if(classes == true)
			var vclass = request.getParameter('custparam_class');
		var pickType= request.getParameter('custparam_picktype');
		var itemCount = request.getParameter('custparam_itemCount'); 
		//nlapiLogExecution('ERROR','itemCount', itemCount);
		var itemCount = request.getParameter('custparam_itemCount');
		var vPrebinquantity = request.getParameter('custparam_prebinqty');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		nlapiLogExecution('Error', 'getcomponentmapping starts', TimeStampinSec());

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		nlapiLogExecution('Error', 'getcomponentmapping ends', TimeStampinSec());

		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('ERROR','inventoryStatusFeature', inventoryStatusFeature);
		//Locking records
		var SOarray = new Array();
		SOarray["custparam_soid"] = getSONo;
		SOarray["custparam_whlocation"] = whLocation;
		SOarray["custparam_company"] = whCompany;
		SOarray["custparam_option"] = getOptedField;
		SOarray["custparam_trantype"] = trantype;
		SOarray["custparam_actualbegintime"] = getActualBeginTime;
		SOarray["custparam_sointernalid"] = getSOInternalId;
		SOarray["custparam_lineno"] = getSOLineNo;
		SOarray["custparam_fetcheditemid"] = getItemInternalId;
		SOarray["custparam_customer"] = customer;
		SOarray["custparam_cartonscreenrulevalue"] = cartonScreenRuleValue;
		SOarray["custparam_carton"] = carton;
		SOarray["custparam_cartonsize"] = cartonSize;
		SOarray["custparam_cartonweight"] = cartonWeight;
		SOarray["custparam_pickreportid"] =getPickreportid;
		SOarray["custparam_uom"] = vUnits;
		SOarray["custparam_conversionrate"] = vConversionRate;
		SOarray["custparam_picktype"] = request.getParameter('custparam_picktype');
		var currentUser=getCurrentUser();
		var lockfilters=new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getSOInternalId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',getSOLineNo));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
		// This search returns required results, 4k records fetching not required.
		var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

		if(lockresults!=null && lockresults!='')
		{
			var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
			var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');

			if(getLockUser!=currentUser)
			{
				SOarray["custparam_error"]='The line item is being processed by other user.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);

				return;
			}
			else if(parseInt(getLockLine)!=parseInt(getSOLineNo))
			{
				var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
				LockRecord.setFieldValue('name',getSOInternalId);
				LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
				LockRecord.setFieldValue('custrecord_wmsse_order',getSOInternalId);
				LockRecord.setFieldValue('custrecord_wmsse_line',getSOLineNo);
				LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
				LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

				var date = new Date();
				var mSecs = date.getTime();
				LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

				var recid = nlapiSubmitRecord(LockRecord);
				LockRecord=null;

			}
		}
		else
		{
			var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
			LockRecord.setFieldValue('name',getSOInternalId);
			LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
			LockRecord.setFieldValue('custrecord_wmsse_order',getSOInternalId);
			LockRecord.setFieldValue('custrecord_wmsse_line',getSOLineNo);
			LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
			LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);

			var date = new Date();
			var mSecs = date.getTime();
			LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);

			var recid = nlapiSubmitRecord(LockRecord);

			LockRecord=null;
		}
		lockresults=null;		
		lockfilters=null;
		//end

		var getItemType = "";
		var vStageScanRequired="F";

		vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',whLocation,'2');		

		if(vStageScanRequired!=null && vStageScanRequired!='')
		{ 
			vStageScanRequired="T";			 
		}
		else
		{
			vStageScanRequired="F";
		}


		//nlapiLogExecution('ERROR','vStageScanRequired', vStageScanRequired);
		var orderLevel="F";

		orderLevel=getSystemRuleValue('Consolidate item fulfillments by sales order?',whLocation);
		if(orderLevel!=null && orderLevel!='')
		{
			if(orderLevel=="Y")
			{
				orderLevel="T";
			}
			else
			{
				orderLevel="F";
			}
		}
		else
		{
			orderLevel="F";
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		//nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-FULFILLMENT QTY SCAN';
		var getPreferBin='';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "SO/TO";

		var vFOoverageChecked='F';

		if(trantype == 'salesorder')
		{
			st0 = domainName + '-SO Picking';
			ordVar = "Sales Order#";
			var vConfig=nlapiLoadConfiguration('accountingpreferences');
			if(vConfig != null && vConfig != '')
			{
				vFOoverageChecked=vConfig.getFieldValue('OVERFULFILLMENTS');
			}

		}
		else
		{
			st0 = domainName + '-TO Picking';
			ordVar = "Transfer Order#";
		}

		var qtyCheckFlag="F";


		var soLineDetails =	getSOLineDetailsItemandqty(getSOInternalId, trantype,getItemInternalId,whLocation,getSOLineNo);


		var orderQty=0;
		var custIndex = 12;
		var commitedQtyIndex = 25;
		var fulfilledQtyIndex = 26;
		var conversionRateIndex=27;
		var totalPickedQtyIndex =7;
		var unitsIndex = 24;
		var totalNSPickedQtyIndex =37;
		var ERPConfirmedQty =38;
		if(soLineDetails != null && soLineDetails != '' && soLineDetails.length > 0)
		{	
			var vColumnslist=soLineDetails[0].getAllColumns();
			for(var x1=0;x1<vColumnslist.length;x1++)
			{
				var summaryLabel = vColumnslist[x1].getLabel();
				var name = vColumnslist[x1].getName();
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
				else if(name == 'unit')
				{
					unitsIndex =x1;
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
			var vOrderType = null;
			var vUnits =null;
			var vUnitsValue =null;
			for(var j=0; j<soLineDetails.length; j++)
			{
				var usedBins='';

				var solineno=soLineDetails[j].getValue('line',null,'group');
				var socheckinqty=soLineDetails[j].getValue('quantity');
				vUnits = soLineDetails[j].getText(vColumnslist[unitsIndex]);
				vUnitsValue = soLineDetails[j].getValue(vColumnslist[unitsIndex]);
				vConversionRate = soLineDetails[j].getValue(vColumnslist[conversionRateIndex]);
				var vsoitem = soLineDetails[j].getText('item',null,'group');
				var vsoitemId = soLineDetails[j].getValue('item',null,'group');
				var vsoitemQty=soLineDetails[j].getValue(vColumnslist[commitedQtyIndex]);			 
				var vsoitemfulfillQty=soLineDetails[j].getValue(vColumnslist[fulfilledQtyIndex]);
				if(trantype == 'transferorder' && solineno != null)//adding because of TO line number getting 2 value
					solineno = parseInt(solineno)-1;
				var vsoitemopentaskQty=getopentaskDetailsforItem(getSOInternalId,solineno,vsoitemId,whLocation);
				var vsoitemErpConfirmedQty=soLineDetails[j].getValue(vColumnslist[ERPConfirmedQty]);
				var vsoitemNSReceivedQty=soLineDetails[j].getValue(vColumnslist[totalNSPickedQtyIndex]);
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
				//nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);

				if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
					vsoitemfulfillQty=0;
				if(vsoitemQty == null || vsoitemQty == '')
					vsoitemQty=0;
				if(vsoitemRcvQty==null || vsoitemRcvQty=='')
					vsoitemRcvQty=0;
				orderQty=vsoitemQty;



				vsoitemQty=new Big(vsoitemQty);
				vsoitemfulfillQty=new Big(vsoitemfulfillQty);
				vsoitemRcvQty=new Big(vsoitemRcvQty);
				var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
				//nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);

				if(parseFloat(getSOLineNo) == parseFloat(solineno))
				{
					if(parseFloat(vSoreminqty) > 0)
					{
						qtyCheckFlag = "T";
						//getItemRemQty = parseFloat(parseFloat(vSoreminqty).toFixed(5));
						//getItemRecQty = parseFloat(parseFloat(vsoitemRcvQty).toFixed(5));

						vOrderType = soLineDetails[j].getValue('custbody_wmsse_ordertype',null,'group');						
						vUnits = soLineDetails[j].getText('unit',null,'group');
						vUnitsValue=soLineDetails[j].getValue('unit',null,'group');
						break;
					}
				}
			}
		}

		var isfromPageRefresh = context.getSessionObject('record');
		//nlapiLogExecution('DEBUG', 'isfromPageRefresh', isfromPageRefresh);
		if((qtyCheckFlag == 'F' && vFOoverageChecked == 'F')  || isfromPageRefresh == 'created')
		{
			//soLineDetails = getSOLineDetailsItem(getSOInternalId,trantype,null,whLocation);


			var soLineDetails = getSOItemscandetails(getSOInternalId,trantype,whLocation);

			if(soLineDetails !=null && soLineDetails!="" )
			{

				if(soLineDetails.length>0)
				{
					var vColumnslist=soLineDetails[0].getAllColumns();


					var vOpentaskdetails = getPickedqtydetails(getSOInternalId,trantype,whLocation);
					for(var cnt=0;cnt<soLineDetails.length;cnt++)
					{ 

						var vsoitem = soLineDetails[cnt].getText('item');
						var vsoitemId = soLineDetails[cnt].getValue('item');
						var vsoitemType=soLineDetails[cnt].getValue('type','item');

						if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
							|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
						{
							var vsoitemQty=soLineDetails[cnt].getValue('quantity');
						}
						else
						{
							var vsoitemQty=soLineDetails[cnt].getValue('quantitycommitted');
						}
						var vsoitemfulfillQty=soLineDetails[cnt].getValue('quantitypicked');
						var vsoitemNSReceivedQty=soLineDetails[cnt].getValue('quantitypicked');
						var vsoitemNSshippedQty=soLineDetails[cnt].getValue('quantityshiprecv');

						var vsoitemLine = soLineDetails[cnt].getValue('line');					
						var vUnitsText = soLineDetails[cnt].getValue('unit');
						var vConversionRate = soLineDetails[cnt].getValue('formulanumeric');
						if(trantype == 'transferorder' && vsoitemLine != null)
							vsoitemLine = parseInt(vsoitemLine)-1;
						var vsoitemopentaskQty=0;
						for(var vOpentaskcount = 0; vOpentaskcount < vOpentaskdetails.length; vOpentaskcount++)
						{

							var vOpentaskitem = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_sku',null,'group');
							var vOpentaskLine = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_line_no',null,'group');

							if(vOpentaskitem==vsoitemId && vOpentaskLine==vsoitemLine)
							{
								vsoitemopentaskQty = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_act_qty',null,'sum');
								break;
							}
						}


						if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
						{
							vsoitemopentaskQty = 0;
						}
						if(vsoitemNSshippedQty==null || vsoitemNSshippedQty=='' ||vsoitemNSshippedQty=='null' || vsoitemNSshippedQty=='undefined' )
						{
							vsoitemNSshippedQty = 0;
						}

						if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
						{
							vsoitemNSReceivedQty = 0;
						}

						if(vConversionRate!=null && vConversionRate!='')
						{
							vsoitemQty=Number(Big(vsoitemQty).div(vConversionRate));
							vsoitemNSReceivedQty=Number(Big(vsoitemNSReceivedQty).div(vConversionRate));
							vsoitemNSshippedQty=Number(Big(vsoitemNSshippedQty).div(vConversionRate));

						}

						var vsoitemRcvQty = Number(Big(vsoitemopentaskQty).plus(vsoitemNSReceivedQty));
						if(vsoitemRcvQty==null || vsoitemRcvQty=='')
							vsoitemRcvQty=0;


						if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
							|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
						{
							var itemRemQty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));
						}
						else
						{
							vsoitemQty=Big(vsoitemQty);
							vsoitemNSshippedQty=Big(vsoitemNSshippedQty);
							vsoitemRcvQty=Big(vsoitemRcvQty);
							var itemRemQty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
						}


						if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
						{	
							SOarray["custparam_error"] ='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
							return;
						}

						else if((parseFloat(itemRemQty)>0))
						{
							SOarray["custparam_error"] ='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
							return;
						}	


					}
					if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
					{

						var resArr = getCustomScriptId(2);
						if(resArr.length > 0)
						{
							SOarray["custparam_error"]='';
							response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
							return;
						}
						else
						{
							SOarray["custparam_error"]="Custom flow not defined for this process";
							response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
							return;
						}
					}
					SOarray["custparam_error"] ='';
					if(vStageScanRequired == "F")
						response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
					else
						response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
					return;
				}
				else
				{
					if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
					{
						var resArr = getCustomScriptId(2);
						if(resArr.length > 0)
						{
							SOarray["custparam_error"]='';
							response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
							return;
						}
						else
						{
							SOarray["custparam_error"]="Custom flow not defined for this process";
							response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
							return;
						}
					}
					SOarray["custparam_error"] ='';
					if(vStageScanRequired == "F")
					{
						response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);		
					}

					else
					{
						response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
					}									

					return; 

				}
				soLineDetails=null;
			}
			else
			{
				if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
				{
					var resArr = getCustomScriptId(2);
					if(resArr.length > 0)
					{
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
						return;
					}
					else
					{
						SOarray["custparam_error"]="Custom flow not defined for this process";
						response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
						return;
					}
				}
				SOarray["custparam_error"] ='';
				if(vStageScanRequired == "F")
				{
					response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
				}										
				else
				{
					response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
				}

				return;

			}
		}
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));

		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		// This search returns required results, 4k records fetching not required.
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		var strItemGrp="";
		var strItemFam="";		
		var blnItemUnit="";
		var VUnitType ="";
		var Vdepartment ="";
		var Iclass ="";
		var addbtnimgUrl='';
		var delbtnimgUrl='';
		var uomresults= new Array();
		var results='';
		var JSSurl ='';
		var vClassification ='';
		
		if(itemresults!=null && itemresults!='')
		{
			if(itemresults[0].getValue('isinactive')=="T")
			{
				SOarray["custparam_error"] = 'Entered item is inactive';
				response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
				return;
			}
			for(var d=0;d<itemresults.length;d++)
			{
				if(itemresults[d].getValue('preferredbin')=="T" && itemresults[d].getValue('location','binnumber')==whLocation)
				{
					getPreferBin = itemresults[d].getValue('binnumber');
				}
			}
			blnMixItem = itemresults[0].getValue('custitem_wmsse_mix_item');
			blnMixLot = itemresults[0].getValue('custitem_wmsse_mix_lot');
			strItemGrp = itemresults[0].getValue('custitem_wmsse_itemgroup');
			strItemFam = itemresults[0].getValue('custitem_wmsse_itemfamily');
			blnItemUnit = itemresults[0].getText('stockunit');
			VUnitType = itemresults[0].getValue('unitstype');
			getItemType = itemresults[0].recordType;
			getSOItem = itemresults[0].getValue('itemid');
			vClassification = itemresults[0].getValue('locationinvtclassification');
            //nlapiLogExecution('DEBUG','Classification ',vClassification);
            
			if(departments == true)
				Vdepartment = itemresults[0].getValue('department');
			if(classes == true)
				Iclass = itemresults[0].getValue('class');

			if(Vdepartment == null || Vdepartment == '' || Vdepartment == 'null' || Vdepartment == 'undefined')
			{
				Vdepartment = department;
			}
			if(Iclass == null || Iclass == '' || Iclass == 'null' || Iclass == 'undefined')
			{
				Iclass = vclass;
			}
		}

		if(getItemType == null || getItemType =='' || getItemType == 'null' || getItemType == 'undefined')
		{
			getItemType = itemType;
		}


		itemfilters=null;		
		itemresults=null;
		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		if(VUnitType == '- None -' || VUnitType == '' || VUnitType == null)
			VUnitType ='';
		if(blnItemUnit == '- None -' || blnItemUnit == '' || blnItemUnit == null)
			blnItemUnit ='';
		var getStockConversionRate =1;
		if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
		{
			getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
		}


		if(VUnitType != null && VUnitType != '' && VUnitType != 'null' && VUnitType != 'undefined')
		{

			results= getUnitsType(VUnitType);

			if(results != null && results != '' && results != 'null' && results != 'undefined')
			{
				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					var row = [UOMText+"_"+vQty];
					uomresults.push(row);
				}
			}

			var imgfilefound1=  getLoadFile('Plus.png');
			if(imgfilefound1)
			{
				addbtnimgUrl = imgfilefound1.getURL();				
			}


			var imgfilefound2 =  getLoadFile('minus.png');
			if(imgfilefound2)
			{
				delbtnimgUrl = imgfilefound2.getURL();
			}


		}
		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			//nlapiLogExecution('ERROR', 'JSSurl', JSSurl); 
		}
		//Paging
		var vPageCount = request.getParameter('custparam_pagecount');

		if(vPageCount == null || vPageCount == '' || vPageCount == 'null' || vPageCount == 'undefined')
		{
			vPageCount = 0;
		}

		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');

		if(getItemType!='noninventoryitem'&& getItemType!='otherchargeitem' && getItemType != 'Service' &&  getItemType !='serviceitem' &&
				getItemType !='downloaditem' && getItemType != 'Download Item' && getItemType != 'giftcertificateitem')
		{
			if(makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == '' || makeInvAvailFlagFromSelect == 'null' ||
					makeInvAvailFlagFromSelect == 'undefined')
				makeInvAvailFlagFromSelect ='T';
		}

		var vBinDetails=null;
		var AllowAllLots = 'T';
		if(getItemType == "inventoryitem" || getItemType == "assemblyitem"|| getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
		{
			//nlapiLogExecution('ERROR', 'Inside if itemType', getItemType);
			
			vBinDetails=fnGetPickBinDetails(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,
					vOrderType,vUnitsValue,null,vPageCount,makeInvAvailFlagFromSelect,getItemType,VUnitType,blnItemUnit,getStockConversionRate,null,vClassification);
		}
		else
		{
			//nlapiLogExecution('ERROR', 'Inside else itemType', getItemType);
			if(trantype == 'salesorder')
			{
				
//				vBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,vOrderType,
//						vUnitsValue,null,vPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate);
				
				vBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,vOrderType,
						vUnitsValue,null,vPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate,null,null,vClassification);

			}
			else
				if(trantype == 'transferorder')
				{
					
//					vBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,vOrderType,
//							vUnitsValue,null,vPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate,'',AllowAllLots,vClassification);
					vBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,vOrderType,
							vUnitsValue,null,vPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate,'',AllowAllLots,vClassification);
				
				}
		}
		//nlapiLogExecution('ERROR', 'vBinDetails', vBinDetails);
		//nlapiLogExecution('Debug', 'vPrebinquantity', vPrebinquantity);		
		var getPreferBinQty=0;
		var preferBinFN = '';
		if(vBinDetails!=null && vBinDetails!='' && vBinDetails.length>0 && getPreferBin!=null && getPreferBin!='')
		{
			if(vPrebinquantity==null ||vPrebinquantity =='' || vPrebinquantity=='null' 
				||vPrebinquantity =="undefined"||vPrebinquantity ==undefined)
			{
				preferBinFN = vBinDetails[0][0];
				//nlapiLogExecution('ERROR', 'vBinDetails[0][0]', vBinDetails[0][0]);
				if(preferBinFN == getPreferBin)
				{
					getPreferBinQty=vBinDetails[0][1];
				}
				else
				{
					getPeferBinQty = 0;
				}
			}
			else
			{
				getPreferBinQty=vPrebinquantity
			}
			//nlapiLogExecution('ERROR', 'getPreferBinQty', getPreferBinQty);
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			//nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			//nlapiLogExecution('ERROR', 'imgUrl', imgUrl);
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		CSSfilefound=null;


		// for UOM dropdown change
		var qtyUomCntrlSelectedConversionRate =vConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}


		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_qty');

		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		//"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";


		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		//This function is to validate the form when Enter button or save button is clicked.
		html = html + "<script type='text/javascript'>function validateForm_soQtySingle(){var itemtype=document.getElementById('hdnitemtype').value;  " +
		"if(document.getElementById('hdnqtyCheckFlag').value == 'F'){" +
		"document.getElementById('div_error').innerHTML ='RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';return false;}" +
		"var selecteduomqtyArr = new Array(); var ConvertQty=document.getElementById('hdnvConversionRate').value;" +
		"var uomTbl = document.getElementById('tblUOM');var enteredQty =0;var enteredSerialQty =0;" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount = uomTbl.rows.length;for(var r=0;r<rowcount;r++){" +
		"var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;if(qty=='' || isNaN(qty) || parseFloat(qty) <= 0){" +
		"if(qty == ''){document.getElementById('div_error').innerHTML ='Please enter qty';}else{document.getElementById('div_error').innerHTML ='Please enter valid qty';}document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}" +

		"var qtyValidate = document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value.split('.');"+
		"if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}" +

		"var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;if(uom==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter uom';document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].focus();return false;}" +
		"var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr); enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom)); }" +
		"document.getElementById('hdnselecteduomswithqty').value=selecteduomqtyArr;enteredSerialQty = parseFloat(enteredQty);enteredQty =parseFloat(enteredQty)/parseFloat(ConvertQty);" +
		"scannedqty =enteredQty; }" +
		"else{ if(document.getElementById('txtqty').value == ''){document.getElementById('div_error').innerHTML ='Please enter qty';" +
		"document.getElementById('txtqty').focus();return false;}else{var scannedqty=document.getElementById('txtqty').value;}var WhiteSpace = scannedqty.indexOf(' ') >= 0;var qtyValidate = document.getElementById('txtqty').value.split('.');"+
		"if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('txtqty').focus();return false;}} }" +
		"var remainingqty=document.getElementById('hdnItemRemQty').value;var fooveragecheck = document.getElementById('hdnvFOoverageChecked').value;" +
		" if(((parseFloat(scannedqty)>parseFloat(remainingqty)) && fooveragecheck=='F')|| (isNaN(scannedqty) || parseFloat(scannedqty)<=0 || (WhiteSpace == true))){" +
		"if((parseFloat(scannedqty)>parseFloat(remainingqty)) && fooveragecheck=='F'){" +
		"document.getElementById('div_error').innerHTML ='Overage picking is not allowed';" +
		"var uomTbl = document.getElementById('tblUOM');if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{document.getElementById('txtqty').focus();}return false;" +
		"}else{" +
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';" +
		"var uomTbl = document.getElementById('tblUOM');if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{document.getElementById('txtqty').value = '';document.getElementById('txtqty').focus();}return false;}}if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){ enteredSerialQty = parseFloat(scannedqty);}" +		
		" if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){" +
		" if(enteredSerialQty % 1 != 0){ document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';" +
		"var uomTbl = document.getElementById('tblUOM');if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{document.getElementById('txtqty').focus();}return false;" +
		" }} " +
		"var bin = document.getElementById('hdnPreferBin').value;if(itemtype!='noninventoryitem' && itemtype !='otherchargeitem' && " +
		" itemtype !='Service' && itemtype !='serviceitem' && itemtype !='downloaditem' && itemtype !='Download Item' &&  itemtype !='giftcertificateitem'){" +
		"if(document.getElementById('txtbin').value == '' && (bin=='' || bin=='null')){ " +		
		"document.getElementById('div_error').innerHTML ='Please enter/scan bin location';document.getElementById('txtbin').focus();return false;}} " +
		"var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){" +
		"document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{" +
		"document.getElementById('hdntotaluomqtyentered').value = enteredQty;document.getElementById('hdnsession').value = 'session';" +
		"document.forms['_rf_picking_qty'].submit();document.getElementById('loading').style.display = '';" +
		"document.forms['_rf_picking_qty'].cmdSend.disabled=true;document.forms['_rf_picking_qty'].cmdSkip.disabled=true;" +
		"document.forms['_rf_picking_qty'].cmdStage.disabled=true;document.forms['_rf_picking_qty'].cmdClose.disabled=true;" +
		"document.forms['_rf_picking_qty'].cmdPrevious.disabled=true; return true;}}</script>";

		//This function is to validate the form when Bin link is clicked.
		html = html + "	<script type='text/javascript'>function fnShowLoader() {" +
		"document.getElementById('loading').style.display = 'block';}</script>";

		//This function is to validate the form when Bin link is clicked.
		html = html + "	<script type='text/javascript'>function DisplayBin_soQtySingle(val) {" +
		"var itemtype=document.getElementById('hdnitemtype').value; " +
		"var WhiteSpace = '';if(document.getElementById('hdnqtyCheckFlag').value == 'F'){" +
		"document.getElementById('div_error').innerHTML ='RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';return false;}" +
		"var selecteduomqtyArr = new Array();var enteredQty =0;var enteredSerialQty =0;" +
		"var ConvertQty=document.getElementById('hdnvConversionRate').value;" +
		"var uomTbl = document.getElementById('tblUOM');" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount = uomTbl.rows.length;for(var r=0;r<rowcount;r++){var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;" +
		"if(qty=='' || isNaN(qty) || parseFloat(qty) <= 0 ){if(qty==''){document.getElementById('div_error').innerHTML ='Please enter qty';}else{document.getElementById('div_error').innerHTML ='Please enter valid qty';}" +
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}" +
		"var qtyValidate = document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value.split('.');"+
		"if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}" +
		"var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;" +
		"if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';return false;}var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr);" +
		"enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom));}document.getElementById('hdnselecteduomswithqty').value=selecteduomqtyArr;" +
		"enteredSerialQty = parseFloat(enteredQty);enteredQty =parseFloat(enteredQty)/parseFloat(ConvertQty);document.getElementById('hdntotaluomqtyentered').value = enteredQty;scannedqty =enteredQty;" +
		" if(isNaN(enteredQty)==true){WhiteSpace=true;}}" +
		"else{ var qty = document.getElementById('txtqty').value;if(qty ==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter qty';document.getElementById('txtqty').focus();return false;}var scannedqty=document.getElementById('txtqty').value;" +
		"var WhiteSpace = scannedqty.indexOf(' ') >= 0;var qtyValidate = document.getElementById('txtqty').value.split('.');"+
		"if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('txtqty').focus();return false;}} }" +
		"var remainingqty=document.getElementById('hdnItemRemQty').value;" +
		"var fooveragecheck = document.getElementById('hdnvFOoverageChecked').value;" +
		"var itemtype=document.getElementById('hdnitemtype').value; " +
		"if(((parseFloat(scannedqty)>parseFloat(remainingqty)) && fooveragecheck=='F') || (isNaN(scannedqty) || parseFloat(scannedqty)<=0 || (WhiteSpace == true))){" +
		"if((parseFloat(scannedqty)>parseFloat(remainingqty)) && fooveragecheck=='F'){" +
		"document.getElementById('div_error').innerHTML ='Overage picking is not allowed';" +
		"var uomTbl = document.getElementById('tblUOM');" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}" +
		"else{document.getElementById('txtqty').focus();}return false;" +
		"}  else{document.getElementById('div_error').innerHTML ='Please enter valid qty';" +
		"var uomTbl = document.getElementById('tblUOM');" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		"document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{" +
		"document.getElementById('txtqty').value='';document.getElementById('txtqty').focus();}return false;}}" +		
		" if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){" +
		"if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){enteredSerialQty = document.getElementById('txtqty').value;}" +
		" if((enteredSerialQty) % 1 != 0){ document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';" +
		"var uomTbl = document.getElementById('tblUOM');if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{document.getElementById('txtqty').focus();}return false;" +
		"}} " +
		"var sessionObj = document.getElementById('hdnsession').value;" +
		"if(sessionObj != '' && sessionObj != null){" +
		"document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}" +
		"else{" +
		"document.getElementById('hdnsession').value = 'session';document.getElementById('txtbin').value=val;document.forms['_rf_picking_qty'].cmdSend.disabled=true;" +
		"document.forms['_rf_picking_qty'].cmdSkip.disabled=true;document.forms['_rf_picking_qty'].submit();document.getElementById('loading').style.display = '';" +
		" return true;}}</script>";

		//Refresh Functionality 
		html = html + "<SCRIPT LANGUAGE='javascript' for='window' EVENT='onload()'>"; 		
		html = html + "document.getElementById('loading').style.display = 'none';var version = navigator.appVersion;";
		html = html + "document.onkeydown = function (e) {";
		html = html + "var keycode = (window.event) ? event.keyCode : e.keyCode;"; 
		html = html + "if ((version.indexOf('MSIE') != -1)) { ";
		html = html + "	if (keycode == 116) {event.keyCode = 0;event.returnValue = false;return false;}}"; 
		html = html + "else {if (keycode == 116)return false;}";
		html = html + "};";
		html = html + "</script>";


		//case # 201412820 end
		html = html +functionkeyHtml;


		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}" +
		"setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_picking_qty' method='POST'><input name='cmdSend1' type='submit'  class='defaultlink'   value='' onclick=' return validateForm_soQtySingle();'/>"+ 	

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking Qty</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+ 		
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getSONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getSOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnSoItem' value='" + getSOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnPreferBinQty' id='hdnPreferBinQty' value=" + getPreferBinQty + ">"+
		"				<input type='hidden' name='hdncartonScreenRuleValue' value=" + cartonScreenRuleValue + ">"+
		"				<input type='hidden' name='hdncarton' value=" + carton + ">"+
		"				<input type='hidden' name='hdncartonSize' value=" + cartonSize + ">"+
		"				<input type='hidden' name='hdncartonWeight' value=" + cartonWeight + ">"+
		"				<input type='hidden' name='hdnItemType' id='hdnitemtype' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnorderLevel' value=" + orderLevel + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnvFOoverageChecked' id='hdnvFOoverageChecked' value=" + vFOoverageChecked + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnqtyCheckFlag' id='hdnqtyCheckFlag' value=" + qtyCheckFlag + ">"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"               <input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnorderQty' id='hdnorderQty' value=" + orderQty + ">"+
		"               <input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnPickType' value='" +pickType+"'>"+
		"				<input type='hidden' name='hdnShipVia' id='hdnShipVia' value='" +vShipVia+"'>"+
		"				<input type='hidden' name='hdnvStageScanRequired' value='" +vStageScanRequired+"'>"+
		"				<input type='hidden' name='hdnitemCount' value='" +itemCount+"'>"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnStageflag'>"+
		"				<input type='hidden' name='hdnSkip'>"+
		"				<input type='hidden' name='hdnCloseflag'>"+
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnPageCount' id='hdnPageCount' value=" + vPageCount + ">"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+	
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getSOItem  + "</label>"+
		"			</tr>"+		 
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + parseFloat(parseFloat(vsoitemRcvQty).toFixed(5)) + " " +vUnits+"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(vSoreminqty).toFixed(5)) + " " +vUnits+"</label>"+
		"			</tr>"+
		"			<tr>";
		if(results !=null &&  results !='' && results.length>0)
		{
			var selectedUomStr = request.getParameter('custparam_uomqtyselected');
			//nlapiLogExecution('ERROR', 'selectedUomStr', selectedUomStr);
			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				//nlapiLogExecution('ERROR', 'inside', selectedUomStr);

				html = html +"<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox'  id='txtqty0' type='text'/></td><td></td>";

				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					if(Cnt==0)
					{
						html = html +"<td><select id='uomlist"+Cnt+"' class='labelmsg'  name = 'uomlist"+Cnt+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";


					}

					if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -' && vUnits == UOMText)
					{
						html = html +" <option value="+vQty+" selected >"+UOMText +" </option>";
					}
					else
					{
						html = html +" <option value="+vQty+"  >"+UOMText +" </option>";
					}

				}

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+getItemRemQty+"\",\""+vConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\",\""+vFOoverageChecked+"\");' alt='Add Uom'></td></tr></table>";	
			}
			else
			{
				//nlapiLogExecution('ERROR', 'else', selectedUomStr);
				var uomQtyArr = selectedUomStr.split(',');
				var uomsArr = new Array();
				for(var u=0;u<uomQtyArr.length;u++)
				{
					var arr = uomQtyArr[u].split('_');

					var uom  = arr[1];
					uomsArr.push(uom);
				}
				html = html +"			<tr><td><table id='tblUOM'  >";
				for(var u=0;u<uomQtyArr.length;u++)
				{
					var arr = uomQtyArr[u].split('_');

					var qty = arr[0];
					var uom  = arr[1];

					html = html +"<tr><td align = 'left'><input name='txtqty"+u+"'  class='smalltextbox'  id='txtqty"+u+"' type='text' value="+qty+"></input></td><td></td>";
					html = html +"<td><select id='uomlist"+u+"' class='labelmsg'  name = 'uomlist"+u+"'>  ";
					for(var Cnt=0; Cnt < results.length; Cnt++)
					{                    	 
						var vUOM = results[Cnt].getValue('conversionrate');
						var UOMText =results[Cnt].getValue('unitname');
						if(uom == vUOM)
						{
							html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";

						}
						else
						{
							if(uomsArr.indexOf(vUOM)==-1)
							{
								html = html +" <option     value="+vUOM+"> "+UOMText+"</option>";
							}
						}
					}
					html = html+"</select></td><td></td>";
					if(u==parseInt(uomQtyArr.length)-1)
					{
						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+getItemRemQty+"\",\""+vConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\",\""+vFOoverageChecked+"\");' alt='Add Uom'></td></tr>";
					}
					else
					{
						html= html+"<td><input type='image' id='imgplus0' src='"+delbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return deleteUom(this,\""+uomresults+"\");' alt='Add Uom'></td></tr>";
					}

				}
				html = html +"			</td></tr></table>";
			}

		}
		else
		{
			if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty"+" In "+ vUnits;
			}
			else
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty";
			}

			html = html +"				</td>"+
			"			</tr>"+
			"			<tr>";

			html= html+"<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>";

			html= html+"</td>"+
			"			</tr>";
		}

		if(getItemType!='noninventoryitem'&& getItemType!='otherchargeitem' && getItemType != 'Service' &&  getItemType !='serviceitem' && getItemType !='downloaditem' && getItemType != 'Download Item' && getItemType != 'giftcertificateitem')
		{


			html=html+	"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Enter/Scan Bin"+	
			"				</td>"+
			"			</tr>"+
			"			<tr>"+
			"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
			"				</td></tr>";
		}
		html=html+		"			<tr><td></td></tr></table>"+

		"		<table>	<tr>";
		var btnText='Next (Ent)';
		if(getItemType == "inventoryitem")
		{
			btnText='Pick (Ent)';
		}

		html = html +"				<td align = 'left'>";
		html = html +"				<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='"+btnText+"' onclick=' return validateForm_soQtySingle();'/></td><td width='20px'></td>";
		html = html +"	<td><input name='cmdSkip' type='submit' value='Skip' onclick='this.form.hdnSkip.value=this.value;this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true;this.form.cmdSend.disabled=true;'/></td>"+
		"			</tr>";
		if((getItemType == "inventoryitem" || getItemType == "assemblyitem") && orderLevel=="T")
		{
			html = html +"	<tr><td><input name='cmdClose' style='width:100px;' type='submit' value='Pick & Close' onclick='this.form.hdnCloseflag.value=this.value; return validateForm_soQtySingle();'/></td>";
			if(vStageScanRequired == "T")
			{
				html = html +"<td width='15px'></td><td>";
			}
			else
			{
				html = html +"<td colspan='4'> </td></tr>";
			}
		}
		if( (getItemType == "inventoryitem" || getItemType == "assemblyitem") && (vStageScanRequired == "T"))
		{
			if((getItemType == "inventoryitem" || getItemType == "assemblyitem") && orderLevel=="T")
			{
				html = html +"	<input name='cmdStage' style='width:100px;' type='submit' value='Pick & Stage' onclick='this.form.hdnStageflag.value=this.value; return validateForm_soQtySingle();'/></td><td colspan='2'></td></tr>";
			}
			else
			{
				html = html +"<tr><td><input name='cmdStage' style='width:100px;' type='submit' value='Pick & Stage' onclick='this.form.hdnStageflag.value=this.value; return validateForm_soQtySingle();'/></td><td colspan='4'></td></tr>";
			}


		}



		html = html +"		 </table>";
		var errorMsgValue='';
		// Implemtented itemstatus and UOM dropdowns
		if((vBinDetails !=null && vBinDetails!='' && vBinDetails.length > 0 ) || 
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{
			html = html + 	" <tr ><td  ><table  class='uomstatus-gridgap' >";			
			html = html +"<tr>";
			if(results !=null &&  results !='' && results.length>0)
			{
				html=html+"<td align = 'left' class='labelmsg'>UOM</td>";
				//Inventorystatus Feature is enabled
				if(inventoryStatusFeature == true)
				{
					html=html+"<td class='uom-status-display'></td>";
				}
			}
			//Inventorystatus Feature is enabled
			if(inventoryStatusFeature == true)
			{
				html = html +"<td align = 'left' class='labelmsg'>Inv Status</td></tr>";
			}
			else
			{
				html=html+"</tr>";
			}
			html = html +"<tr>";
			if(results !=null &&  results !='' && results.length>0)
			{
				html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUom_OnChange();'>";
				var selectedUOM = request.getParameter('custparam_uomprevselected');			
				for(var uomItr=0; uomItr < results.length; uomItr++)
				{                    	 
					var vUOM = results[uomItr].getValue('conversionrate');
					var UOMText =results[uomItr].getValue('unitname');

					if( ( (selectedUOM == null && vConversionRate == vUOM) || (selectedUOM == '' && vConversionRate == vUOM)  
							|| (selectedUOM =='null' && vConversionRate == vUOM) || (selectedUOM =='undefined'  && vConversionRate == vUOM )
							|| (selectedUOM == undefined && vConversionRate == vUOM) )|| (selectedUOM == vUOM))
					{
						html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";

					}
					else
					{

						html = html +" <option     value="+vUOM+"> "+UOMText+"</option>";

					}
				}
				html = html+"</select></td>";
				//Inventorystatus Feature is enabled
				if(inventoryStatusFeature == true)
				{
					html=html+"<td class='uom-status-display'></td>";
				}
			}
			//Inventorystatus Feature is enabled
			if(inventoryStatusFeature == true)
			{
				var statusOptsArr = getStatusOptions();
				html = html +"<td ><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
				if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
				{
					//nlapiLogExecution('DEBUG', 'makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect); 

					for(var statusItr=0; statusItr < statusOptsArr.length; statusItr++)
					{           	 
						var StatusVal = statusOptsArr[statusItr][0];
						var StatusText =statusOptsArr[statusItr][1];


						if(makeInvAvailFlagFromSelect == StatusVal)
						{
							html = html +" <option   selected  value="+StatusVal+"> "+StatusText+"</option>";

						}
						else
						{
							html = html +" <option     value="+StatusVal+"> "+StatusText+"</option>";
						}

					}
				}
				html=html+"</select></td></tr>";
			}

			html = html +"</table>" ;



			html = html + 	"<table  style='border-spacing: 0;' id='tblqtyUOM'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Bin"+	
			"				</td>"+
			"				<td  class='align-right'>Qty"+	
			"				</td>";

			if(inventoryStatusFeature == true)
			{

				html = html +	"			<td></td>	<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}

			if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
			{

				html = html +	"			<td></td>	<td>Lot#";	
				html = html +"				</td>";
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			//var stIndex = vPageCount * 5;
			var count = 0;
			var convRate = getStockConversionRate;
			var selectedUOM = request.getParameter('custparam_uomprevselected');
			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
			{
				var isFromStatusChange = request.getParameter('hdnfromstatuschange');


				convRate =getStockCoversionRate(VUnitType,blnItemUnit,selectedUOM);
				//convRate = parseFloat(getStockConversionRate)*parseFloat(selectedUOM);



			}

			for(var b=0;b<vBinDetails.length;b++)
			{
				count  = parseInt(count)+1;
				if(b%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';

				var txtBin='';
				var binAvailQty=0;
				var binLot='';
				var currValues = vBinDetails[b];
				var inventoryStatus = '';
				if(getItemType == "inventoryitem" || getItemType == "assemblyitem" || getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
				{
					txtBin = currValues[0];
					binAvailQty =(Number(Big(currValues[1]).mul(convRate)));					
					binAvailQty = parseFloat(parseFloat(binAvailQty).toFixed(5));
					inventoryStatus = currValues[4];
				}
				else
				{

					txtBin = currValues[0];

					binAvailQty = Number(Big(currValues[1]).mul(convRate));
					//nlapiLogExecution('DEBUG', 'Big(currValues[1])', Big(currValues[1]));
					binAvailQty = parseFloat(parseFloat(binAvailQty).toFixed(5));
					//nlapiLogExecution('DEBUG', 'binAvailQty', binAvailQty);

					inventoryStatus = currValues[6];
					if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
					{

						binLot = currValues[3];
					}
				}

				if(inventoryStatus != null && inventoryStatus != '' && inventoryStatus != 'null' && inventoryStatus != undefined 
						&& inventoryStatus != 'undefined')
				{
					var invtStatusStringArray = inventoryStatus.split(' ');
					if(invtStatusStringArray != null && invtStatusStringArray != '' &&
							invtStatusStringArray != 'null' && invtStatusStringArray != undefined &&
							invtStatusStringArray !='undefined'&& invtStatusStringArray.length >1)
					{
						inventoryStatus   = getInvtStatusStr(invtStatusStringArray);
					}
				}
				//nlapiLogExecution('ERROR', 'getPreferBin, txtBin', getPreferBin+","+txtBin);
				var linkBin =txtBin;
				if(getPreferBin == txtBin)
				{
					txtBin=txtBin+ "<span style='color:red;'>* </span>";
				}
				//case # 201412820 start
				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td><a  onclick='return DisplayBin_soQtySingle(\""+linkBin+"\",\""+linkBin+"\");' href='#' >"+txtBin;	
				html = html +"				</a></td>";
				html = html +"				<td  class='align-right'>"+binAvailQty;	
				html = html +"				</td>";
				if(inventoryStatusFeature == true)
				{

					html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
					html = html +"				</td>";
				}

				//case # 201412820 end
				if(binLot!=null && binLot!='')
				{

					html = html +"				<td></td><td>"+binLot;	
					html = html +"				</td>";
				}
				html = html +"			</tr>";

				if(count >=5)
					break;
			}

			html = html + 	"</table>";

			html = html +"		<table>	<tr>";			
			if(vPageCount>0)
			{
				html = html +"				<td align = 'left'><input name='cmdEnbPrevList' type='submit' value='Prev' onClick = 'return fnShowLoader();'/></td>";
			}
			else
			{
				html = html +"				<td >&nbsp;</td><td >&nbsp;</td>";
			}

			if((vBinDetails.length>5))
			{
				html = html +"				<td align = 'right'><input name='cmdEnbNextList' type='submit' value='Next' onClick = 'return fnShowLoader();'/></td>";
			}
			html = html +"			</tr>"+ 
			"		 </table>";


		}
		if(vBinDetails.length==0)
		{
			errorMsgValue="T";

		}
		vBinDetails=null;
		html = html +"				<input type='hidden' name='hdnerrorMsgValue' id='hdnerrorMsgValue' value=" + errorMsgValue + ">";
		html = html + "</form>";

		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			nlapiLogExecution('Error', 'setFieldDefaults starts', TimeStampinSec());

			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";

			nlapiLogExecution('Error', 'setFieldDefaults ends', TimeStampinSec());
		}

		if(results ==null ||  results =='' || results == 'null')
		{
			html= html+"<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
		}
		else
		{
			html = html +"<script type='text/javascript'>setFocus();</script>";
		}

		html=html+"</body>"+
		"</html>";

		nlapiLogExecution('Error', 'Writing html to form starts', TimeStampinSec());

		response.write(html);

		nlapiLogExecution('Error', 'GET ends', TimeStampinSec());
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');
		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var enterQty=request.getParameter('txtqty');
		nlapiLogExecution('ERROR', 'enterQty',enterQty);
		if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
		{
			enterQty = request.getParameter('hdntotaluomqtyentered');
			/*if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined')
			{
				enterQty = parseFloat(enterQty).toFixed(5);
			}*/
		}

		var enterBin=request.getParameter('txtbin');
		var ordType= request.getParameter('hdnOrdtype');
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_shipmethod"] = request.getParameter('hdnShipVia');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		SOarray["custparam_option"] = request.getParameter('hdnOptedField');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		SOarray["custparam_sointernalid"] = request.getParameter('hdnSoInternalId');
		SOarray["custparam_lineno"] = request.getParameter('hdnSoLineno');
		SOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		SOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		SOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');		
		SOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		SOarray["custparam_cartonscreenrulevalue"]=request.getParameter('hdncartonScreenRuleValue');
		SOarray["custparam_carton"] =request.getParameter('hdncarton');
		SOarray["custparam_cartonsize"] =request.getParameter('hdncartonSize');
		SOarray["custparam_cartonweight"] =request.getParameter('hdncartonWeight');
		SOarray["custparam_itemtype"]=request.getParameter('hdnItemType');
		SOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_orderqty"] = request.getParameter('hdnorderQty');
		if(SOarray["custparam_orderqty"] == null || SOarray["custparam_orderqty"] == '')
			SOarray["custparam_orderqty"]=0;
		var foOverageCheck=request.getParameter('hdnvFOoverageChecked');
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;	
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		SOarray["custparam_uom"] = request.getParameter('hdnuom');
		SOarray["custparam_itemCount"] = request.getParameter('hdnitemCount');
		SOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		SOarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		SOarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		SOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		SOarray["custparam_stagescanrequired"] = request.getParameter('hdnvStageScanRequired');
		SOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		SOarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		SOarray["custparam_soresults"] = request.getParameter('hdnSOresults');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var pickType = request.getParameter('hdnPickType');
		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var orderLevel=request.getParameter('hdnorderLevel');
		var itemType=request.getParameter('hdnItemType');
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var soInternalId=request.getParameter('hdnSoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var soLineno=request.getParameter('hdnSoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var preferBinQty=request.getParameter('hdnPreferBinQty');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);

		SOarray["custparam_prebinqty"] = request.getParameter('hdnPreferBinQty');
		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'soInternalId = ' + soInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'soLineno = ' + soLineno + '<br>';
		logMsg = logMsg + 'preferBin = ' + preferBin + '<br>';
		logMsg = logMsg + 'foOverageCheck = ' + foOverageCheck + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		logMsg = logMsg + 'itemCount = ' + SOarray["custparam_itemCount"] + '<br>';
		logMsg = logMsg + 'preferBinQty = ' + preferBinQty+ '<br>';		
		nlapiLogExecution('ERROR', 'Processing RF - QTY', logMsg);
		nlapiLogExecution('ERROR', 'sessionobj', sessionobj);
		nlapiLogExecution('ERROR', 'context.getUser()', context.getUser());
		if (sessionobj!=context.getUser()) 
		{
			try
			{

				var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
				nlapiLogExecution('DEBUG', 'invtstatuslst', makeInventoryAvailFlag);
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){
					SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
					nlapiLogExecution('ERROR', 'request.getParameter(hdnSkip)', request.getParameter('hdnSkip'));

					if(request.getParameter('hdnSkip') == 'Skip')
					{
						if(SOarray["custparam_itemCount"] > 1)
						{
							SOarray["custparam_error"]='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
							return;
						}
						else
						{
							SOarray["custparam_error"]='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
							return;							
						}

					}
					// Next button
					if(request.getParameter('cmdEnbNextList')=="Next")
					{
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))+1;						
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
						return;
					}
					//Prev button
					if(request.getParameter('cmdEnbPrevList')=="Prev")
					{
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))-1;						
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
						return;
					}

					// Item status dropdown change
					SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'));
					var isFromStatusChange = request.getParameter('hdnfromstatuschange');
					nlapiLogExecution('DEBUG', 'isFromStatusChange', isFromStatusChange);
					if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && isFromStatusChange != undefined && isFromStatusChange=='T' )
					{
						SOarray["custparam_pagecount"]=0;
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
						return;

					}
					if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && ((parseFloat(remQty) >= parseFloat(enterQty))|| foOverageCheck=="T"))
					{
						try
						{

							SOarray["custparam_rem_qty"] = enterQty;


							var binInternalId='';
							//nlapiLogExecution('ERROR', 'getItemType', itemType);
							if(itemType!='noninventoryitem'&& itemType!='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem' && itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
							{
								//nlapiLogExecution('ERROR', 'preferBin', preferBin);
								//nlapiLogExecution('ERROR', 'enterBin', enterBin);
								if((enterBin=="" || enterBin==null || enterBin=='null') && (preferBin=="" || preferBin==null || preferBin=='null'))
								{
									SOarray["custparam_error"] = 'Please enter/scan valid bin location';
									response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
									return;
								}
								if(enterBin != preferBin && enterBin!=null && enterBin!='')
								{
									binInternalId=nswms_GetValidBinInternalId(enterBin,SOarray["custparam_whlocation"],'');
								}

								else
								{

									binInternalId=nswms_GetValidBinInternalId(preferBin,SOarray["custparam_whlocation"]);

									if(parseFloat(preferBinQty)<=0)
									{
										binInternalId='';
									}
								}
								if(binInternalId=='' || binInternalId==null)
								{
									SOarray["custparam_error"] = 'Please enter/scan valid bin location';
									response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
									return;
								}

								if(enterBin!=null && enterBin!='')
									SOarray["custparam_enterBin"] = enterBin;
								else
								{
									SOarray["custparam_enterBin"] = preferBin;
									enterBin=preferBin;
								}

								var selectedStatus = '';
								var objBinStatusDetails =new Array();
								var vStatusDetails = new Array();
								if(itemType == "inventoryitem" || itemType=="assemblyitem" ||
										((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")))
								{

									try
									{
										//Inventorystatus Feature is enabled
										if(inventoryStatusFeature ==true)
										{
											var vStatusResults = null;
											if((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem"))
											{
												var vStatusResults =   nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh');

											}
											else
											{
												var vStatusResults =  nlapiLoadSearch('InventoryBalance','customsearch_wmsse_invtbalance_invt_item');	  
											}


											if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] != '')
												vStatusResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', SOarray["custparam_whlocation"]));
											if(FetchedItemId != null && FetchedItemId != '')
												vStatusResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
											if(binInternalId!= null && binInternalId!= '')
												vStatusResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));

											var resLen = vStatusResults.runSearch();
											var invItr=0;
											var resultSet = resLen.forEachResult(function(searchResult)	
													{
												invItr++;
												nlapiLogExecution('DEBUG', 'searchResult', searchResult);

												objBinStatusDetails.push(searchResult);

												if(invItr==4000)
												{
													return false;
												}
												return true;                
													});

											if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && objBinStatusDetails != 'undefined' && 
													objBinStatusDetails != undefined && objBinStatusDetails.length != null && objBinStatusDetails.length >0)
											{
												if(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem")
												{
													vOpenPickDetails = getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,
															SOarray["custparam_whlocation"],request.getParameter('hdnVUnitType'),
															request.getParameter('hdnblnItemUnit'));
												}
												else
												{
													vOpenPickDetails = getOPenTaskPickBinDetails(FetchedItemId,binInternalId,
															SOarray["custparam_whlocation"],request.getParameter('hdnVUnitType'),
															request.getParameter('hdnblnItemUnit'),'','');
												}

												for(var stsItr=0;stsItr<objBinStatusDetails.length;stsItr++)
												{

													var status = '';
													var vBinQtyAvail ='';
													var statusId ='';
													var eneteredLotTxt ='';
													if((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem" || 
															itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
													{
														status = objBinStatusDetails[stsItr].getText('status',null,'group');					
														vBinQtyAvail=objBinStatusDetails[stsItr].getValue('available',null,'sum');				
														statusId = objBinStatusDetails[stsItr].getValue('status',null,'group');
														eneteredLotTxt = objBinStatusDetails[stsItr].getText('inventorynumber',null,'group');
													}
													else
													{
														status = objBinStatusDetails[stsItr].getText('status');					
														vBinQtyAvail=objBinStatusDetails[stsItr].getValue('available');				
														statusId = objBinStatusDetails[stsItr].getValue('status');
													}
													nlapiLogExecution('DEBUG', 'vBinQtyAvail  bef', vBinQtyAvail);
													nlapiLogExecution('DEBUG', 'vstatus', status);
													var openPickQty = 0;
													if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
													{

														if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
														{

															var	vOpenPickQtyArr = vOpenPickDetails[1];
															var	vBinLotArr = vOpenPickDetails[3];
															var	vBinStatusArr = vOpenPickDetails[5];
															
															if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null'
																&& vBinStatusArr != 'undefined' && vBinStatusArr != undefined)
															{
																for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
																{
																	var opentaskStatus = vBinStatusArr[binIterator];
																	var opentaskLotText =vBinLotArr[binIterator];
																	
																	if(opentaskStatus == statusId && eneteredLotTxt==opentaskLotText)
																	{
																		openPickQty = vOpenPickQtyArr[binIterator];
																		break;
																	}
																}
															}

															

														}
													}
													else
													{
														if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
														{
															var	vOpenPickQtyArr = vOpenPickDetails[1];
															var	vBinStatusArr = vOpenPickDetails[3];
															if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined'
																&& vBinStatusArr != undefined)
															{
																for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
																{
																	var opentaskStatus = vBinStatusArr[binIterator];

																	if(opentaskStatus == statusId)
																	{
																		openPickQty = vOpenPickQtyArr[binIterator];
																		break;
																	}
																}
															}

														}
													}
													nlapiLogExecution('DEBUG', 'vBinQtyAvail including openpicks', vBinQtyAvail);

													vBinQtyAvail=new Big(vBinQtyAvail);
													openPickQty=new Big(openPickQty);
													vBinQtyAvail = Number(vBinQtyAvail.minus(openPickQty));
													nlapiLogExecution('DEBUG', 'vBinQtyAvail excluding openpicks', vBinQtyAvail);
													if(parseFloat(vBinQtyAvail) > 0)
													{
														vStatusDetails.push(statusId);
													}
													if(vStatusDetails.length >= 3)
													{
														break;
													}
												}
												SOarray["custparam_numberofstatus"]=objBinStatusDetails.length;
											}
											if(vStatusDetails.length >0)
											{
												nlapiLogExecution('DEBUG', 'text', 'text');
												if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' &&
														vStatusDetails != 'undefined' && vStatusDetails != undefined &&
														vStatusDetails.length != null && vStatusDetails.length == 1)
												{

													selectedStatus = vStatusDetails[0];
													SOarray["custparam_status"]=selectedStatus;

												}
												else
												{
													SOarray["custparam_enteredBinID"]=binInternalId;
													SOarray["custparam_enteredbin"]=enterBin;
													SOarray["custparam_enteredqty"]=enterQty;

													if(request.getParameter('hdnCloseflag') == 'Pick & Close')
													{
														SOarray["custparam_hdnCloseflag"]='Pick And Close';
													}
													if(request.getParameter('hdnStageflag') == 'Pick & Stage')
													{
														SOarray["custparam_hdnCloseflag"]='Pick And Stage';
													}

													response.sendRedirect('SUITELET', 'customscript_wmssw_so_selectstatus_sng', 'customdeploy_wmssw_so_selectstatus_sng', false, SOarray);
													return;   

												}
											}
										}
										if((vStatusDetails == null || vStatusDetails == '' || vStatusDetails == 'null' ||
												vStatusDetails == 'undefined' || vStatusDetails == undefined  || vStatusDetails.length ==1 ))
										{
											var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockbin');
											LockRecord.setFieldValue('name',binInternalId);
											LockRecord.setFieldValue('custrecord_wmse_lock_sku',FetchedItemId);
											LockRecord.setFieldValue('custrecord_wmsse_lock_binlocation',binInternalId);										
											LockRecord.setFieldValue('custrecord_wmsse_lock_flag','T');
											LockRecord.setFieldValue('custrecord_wmsse_lock_unittype',vUnitType);
											LockRecord.setFieldValue('custrecord_wmsse_lockqty',enterQty);
											LockRecord.setFieldValue('custrecord_wmsse_lockuser',context.getUser());
											LockRecord.setFieldValue('custrecord_wmsse_lock_stockunit',StockUnitText);
											LockRecord.setFieldValue('custrecord_wmsse_lock_conversionrate',getStockConversionRate);
											LockRecord.setFieldValue('custrecord_wmsse_lock_itemtype',itemType);
											nlapiLogExecution('ERROR', 'selectedStatus', selectedStatus);
											if(selectedStatus != '' && selectedStatus !=null && selectedStatus !=undefined)
											{
												LockRecord.setFieldValue('custrecord_wmsse_lock_invtstatus',selectedStatus);	
											}
											var recid = nlapiSubmitRecord(LockRecord);
											nlapiLogExecution('ERROR', 'Record Locked Successfully', recid);
											LockRecord=null;
										}
									}
									catch(e)
									{	
										if ( e instanceof nlobjError )
										{
											SOarray["custparam_error"]=e.getDetails();
											nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
										}
										else
										{
											SOarray["custparam_error"]=e.toString();
											nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
										}
										response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
										return;
									}

									lockresults=null;									
									lockfilters=null;
								}


								var itemType=SOarray["custparam_itemtype"];
								nlapiLogExecution('DEBUG', 'SOarray["custparam_itemtype"]',itemType); 
								SOarray["custparam_enterQty"] = enterQty;

							}
							if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
							{
								SOarray["custparam_error"] ='';
								SOarray["custparam_pagecount"]=0;
								SOarray["custparam_makeinventoryavailflag"] = '';
								nlapiLogExecution('ERROR', 'into lotnumberedinventoryitem', itemType);
								response.sendRedirect('SUITELET', 'customscript_wmsse_solot_scan_sng', 'customdeploy_wmsse_solot_scan_sng', false, SOarray);
								return;
							}
							else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{
								SOarray["custparam_error"] ='';
								nlapiLogExecution('ERROR', 'into serializedinventoryitem', itemType);
								response.sendRedirect('SUITELET', 'customscript_wmsse_soserial_scan_sng', 'customdeploy_wmsse_soserial_scan_sng', false, SOarray);
								return;
							}
							else 
							{
								nlapiLogExecution('ERROR', 'into inventoryitem', itemType);
								nlapiLogExecution('ERROR', 'enterBin', enterBin);
								var binInternalId='';
								if(enterBin != '' && enterBin != null && enterBin != 'null' && enterBin != 'undefined')
								{
									binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);
								}

								nlapiLogExecution('ERROR', 'binInternalId', binInternalId);
								var itemfilters=new Array();
								itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
								itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

								if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] !='' && SOarray["custparam_whlocation"] != 'null')
								{
									itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',SOarray["custparam_whlocation"]]));
								}
								// This search returns required results, 4k records fetching not required.
								var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);							

								if(itemresults == null || itemresults == '' || itemresults == 'null')
								{
									SOarray["custparam_error"] = 'Entered item is inactive';
									response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
									return;
								}

								var soLineItemDetails = getSOLineDetailsItemandqty(soInternalId,trantype,FetchedItemId,SOarray["custparam_whlocation"],soLineno);


								var vMultiShipping='F';
								var vShipVia='';
								//To fetch Line level multi shipping flag and ship via validation
								if(soLineItemDetails !=null && soLineItemDetails!="")
								{	

									var vColumnslist=soLineItemDetails[0].getAllColumns();

									var custIndex = 12;
									var commitedQtyIndex = 25;
									var fulfilledQtyIndex = 26;
									var conversionRateIndex=27;
									var totalPickedQtyIndex =7;
									var totalNSPickedQtyIndex =37;
									var ERPConfirmedQty =38;
									for(var x1=0;x1<vColumnslist.length;x1++)
									{
										var summaryLabel = vColumnslist[x1].getLabel();
										var name =  vColumnslist[x1].getName();
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
									var vSoreminqty =0;
									for(var z=0;z<soLineItemDetails.length;z++)
									{

										var vsoLine = soLineItemDetails[z].getValue('line',null,'group');										
										var vsoitemQty=soLineItemDetails[z].getValue(vColumnslist[commitedQtyIndex]);										
										var vsoitemfulfillQty=soLineItemDetails[z].getValue(vColumnslist[fulfilledQtyIndex]);										
										var vsoitem = soLineItemDetails[z].getText('item',null,'group');										
										var vsoitemId = soLineItemDetails[z].getValue('item',null,'group');	
										if(trantype == 'transferorder' && vsoLine != null)//adding because of TO line number getting 2 value
											vsoLine = parseInt(vsoLine)-1;
										var vsoitemopentaskQty=getopentaskDetailsforItem(soInternalId,vsoLine,vsoitemId,SOarray["custparam_whlocation"]);										
										var vsoitemErpConfirmedQty=soLineItemDetails[z].getValue(vColumnslist[ERPConfirmedQty]);										
										var vsoitemNSReceivedQty=soLineItemDetails[z].getValue(vColumnslist[totalNSPickedQtyIndex]);

										if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
										{
											vsoitemopentaskQty = 0;
										}
										if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null'
											|| vsoitemErpConfirmedQty=='undefined' )
										{
											vsoitemErpConfirmedQty = 0;
										}
										if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' 
											|| vsoitemNSReceivedQty=='undefined' )
										{
											vsoitemNSReceivedQty = 0;
										}


										var vsoitemRcvQty = Number(Big(vsoitemopentaskQty).plus(vsoitemNSReceivedQty));
										nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);

										if(vsoitemRcvQty==null || vsoitemRcvQty=='')
											vsoitemRcvQty=0;
										if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
											vsoitemfulfillQty=0;


										vsoitemQty=new Big(vsoitemQty);
										vsoitemfulfillQty=new Big(vsoitemfulfillQty);
										vsoitemRcvQty=new Big(vsoitemRcvQty);
										vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
										nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);

										if((parseFloat(vsoLine) == parseFloat(soLineno)) || (parseFloat(vsoLine) == (parseFloat(soLineno)+1) && trantype == 'transferorder'))
										{
											vMultiShipping = soLineItemDetails[z].getValue('ismultishipto',null,'group');
											if(vMultiShipping ==  null || vMultiShipping =='')
												vMultiShipping='F';

											vShipVia=soLineItemDetails[z].getValue('shipmethod',null,'group');

											break;
										}			

									}	

								}
								nlapiLogExecution('ERROR', 'vMultiShipping : vShipVia ', vMultiShipping + ":" + vShipVia);
								nlapiLogExecution('DEBUG', 'request.getParameter(hdnCloseflag)', request.getParameter('hdnCloseflag'));

								var taskType="PICK";
								if(request.getParameter('hdnCloseflag') == 'Pick & Close')
								{
									if(parseFloat(vSoreminqty) > 0)
									{
										// passing invetorystatus as a parameter to the opentask creation function
										if(vStageScanRequired == "F")
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
													'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
													'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
													ordType,department,vclass,null,null,selectedStatus);
										else
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
													'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
													'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
													ordType,department,vclass,null,null,selectedStatus);
										context.setSessionObject('record', 'created'); 

										if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
										{
											var resArr = getCustomScriptId(2);
											if(resArr.length > 0)
											{
												SOarray["custparam_error"]='';
												response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
												return;
											}
											else
											{
												SOarray["custparam_error"]="Custom flow not defined for this process";
												response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
												return;
											}
										}
										SOarray["custparam_error"] ='';
										SOarray["custparam_closebtn"] = 'Pick&Close';
										if(vStageScanRequired == "F")
											response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
										else
											response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
										return;
									}
								}

								var isItLastPick='F';
								if(parseFloat(vSoreminqty) > 0)
								{

									
									if(vStageScanRequired == "F")
									{
										

										var soLineDetails=getSOqtyscandetails(soInternalId,trantype,SOarray["custparam_whlocation"]);

										if(soLineDetails !=null && soLineDetails!="")
										{
											var vLinecount=0;

											if(soLineDetails.length>0)
											{
												var vColumnslist=soLineDetails[0].getAllColumns();

												var vOpentaskdetails = getPickedqtydetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
												for(var f=0;f<soLineDetails.length;f++)
												{

													var vsoitem = soLineDetails[f].getText('item');
													var vsoitemId = soLineDetails[f].getValue('item');
													var vsoitemType=soLineDetails[f].getValue('type','item');

													if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
														|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
													{
														var vsoitemQty=soLineDetails[f].getValue('quantity');
													}
													else
													{
														var vsoitemQty=soLineDetails[f].getValue('quantitycommitted');
													}

													var vsoitemfulfillQty=soLineDetails[f].getValue('quantitypicked');				

													var vsoitemNSReceivedQty=soLineDetails[f].getValue('quantitypicked');
													var vsoitemNSshippedQty=soLineDetails[f].getValue('quantityshiprecv');
													var vsoitemMultiShipping = soLineDetails[f].getValue('ismultishipto');
													var vsoitemShipVia = soLineDetails[f].getValue('shipmethod');

													var vsoitemLine = soLineDetails[f].getValue('line');					
													var vUnitsText = soLineDetails[f].getValue('unit');
													var vConversionRate = soLineDetails[f].getValue('formulanumeric');


													if(trantype == 'transferorder' && vsoitemLine != null)
														vsoitemLine = parseInt(vsoitemLine)-1;

													var vsoitemopentaskQty=0;
													for(var vOpentaskcount = 0; vOpentaskcount < vOpentaskdetails.length; vOpentaskcount++)
													{

														var vOpentaskitem = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_sku',null,'group');
														var vOpentaskLine = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_line_no',null,'group');

														if(vOpentaskitem==vsoitemId && vOpentaskLine==vsoitemLine)
														{
															vsoitemopentaskQty = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_act_qty',null,'sum');
															break;
														}


													}

													if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
													{
														vsoitemopentaskQty = 0;
													}

													if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
													{
														vsoitemNSReceivedQty = 0;
													}
													if(vsoitemfulfillQty ==null || vsoitemfulfillQty=='' ||vsoitemfulfillQty=='null' || vsoitemfulfillQty=='undefined' )
													{
														vsoitemfulfillQty = 0;
													}
													if(vsoitemNSshippedQty ==null || vsoitemNSshippedQty=='' ||vsoitemNSshippedQty=='null' || vsoitemNSshippedQty=='undefined' )
													{
														vsoitemNSshippedQty = 0;
													}

													if(vConversionRate!=null && vConversionRate!='')
													{
														vsoitemQty=Number(Big(vsoitemQty).div(vConversionRate));
														vsoitemNSReceivedQty=Number(Big(vsoitemNSReceivedQty).div(vConversionRate));
														vsoitemNSshippedQty=Number(Big(vsoitemNSshippedQty).div(vConversionRate));

													}


													var vsoitemRcvQty = Number(Big(vsoitemopentaskQty).plus(vsoitemNSReceivedQty));
													if(vsoitemRcvQty==null || vsoitemRcvQty=='')
														vsoitemRcvQty=0;

													if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
														|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
													{
														var vsoitemRemQty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));
													}
													else
													{
														vsoitemQty=Big(vsoitemQty);
														vsoitemNSshippedQty=Big(vsoitemNSshippedQty);
														vsoitemRcvQty=Big(vsoitemRcvQty);
														var vsoitemRemQty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
													}


												if(vsoitemMultiShipping ==  null || vsoitemMultiShipping =='')
													vsoitemMultiShipping='F';
												if(vsoitemMultiShipping == "F")
												{
													if(parseFloat(vsoitemRemQty)>0)
													{
														vLinecount=parseFloat(vLinecount)+1;

													}
													if(trantype=='transferorder')
														vsoitemLine=vsoitemLine-1;
													if(vsoitemLine==SOarray["custparam_lineno"])
													{

														//enterQty = parseFloat(parseFloat(enterQty).toFixed(5));
														//vsoitemRemQty = parseFloat(parseFloat(vsoitemRemQty).toFixed(5));


														var totalQty=Number(Big(vsoitemRemQty).minus(enterQty));
														nlapiLogExecution('DEBUG', 'totalQty', totalQty);
														if(parseFloat(totalQty)> 0)
														{
															vLinecount=parseFloat(vLinecount)+1;
														}


													}
												}
												else
												{

													if(parseFloat(vsoitemRemQty)>0 && vsoitemShipVia == vShipVia)
													{
														vLinecount=parseFloat(vLinecount)+1;
													}
													if(trantype=='transferorder')
														vsoitemLine=vsoitemLine-1;
													if(vsoitemLine==SOarray["custparam_lineno"] && vsoitemShipVia == vShipVia)
													{


														var totalQty=Number(Big(vsoitemRemQty).minus(enterQty));
														nlapiLogExecution('DEBUG', 'totalQty', totalQty);

														if(parseFloat(totalQty)> 0)
														{
															vLinecount=parseFloat(vLinecount)+1;
														}

													}
												}

											}
											if(parseFloat(vLinecount)>1)
											{
												isItLastPick="F";
											}
											else
											{
												isItLastPick="T";
											}
										}

										}

										soLineDetails=null;
										nlapiLogExecution('ERROR', 'isItLastPick', isItLastPick);
									}

									// To post IF when order level is true and lastpick is true for already packed containers against order
									if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T")
									{
										var filtersPack = new Array();
										filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));

										// This search returns required results, 4k records fetching not required.
										var opentaskSearchResultsPack=nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_open_packtask_details',filtersPack,null);
										if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
										{

											var fieldsPack = new Array();
											var valuesPack = new Array();
											for(var x=0; x < opentaskSearchResultsPack.length; x++)
											{

												var RecordIdPack=opentaskSearchResultsPack[x].getValue('internalid',null,'group');
												if(RecordIdPack!=null && RecordIdPack!='')
												{
													var recId=nlapiLoadRecord('customrecord_wmsse_trn_opentask',RecordIdPack);
													recId.setFieldValue('custrecord_wmsse_device_upload_flag','T');
													var vPackRecId = nlapiSubmitRecord(recId);

												}
											}
										}
									}
									// end

									if(isItLastPick!=null && isItLastPick!='' && isItLastPick=="T")
									{
										// passing invetorystatus as a parameter to the opentask creation function
										if(vStageScanRequired == "F")
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
													'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
													'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
													ordType,department,vclass,null,null,selectedStatus);
										else
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
													'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
													'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
													ordType,department,vclass,null,null,selectedStatus);
										context.setSessionObject('record', 'created'); 
									}
									else
									{
										if(SOarray["custparam_orderlevel"] =="T")
										{
											var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
													'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
													SOarray["custparam_cartonweight"],'F',trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
													'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
													ordType,department,vclass,null,null,selectedStatus);
											context.setSessionObject('record', 'created'); 
										}
										else
										{
											// passing invetorystatus as a parameter to the opentask creation function
											if(vStageScanRequired == "F")
												var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
														'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
														SOarray["custparam_cartonweight"],"T",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
														'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
														ordType,department,vclass,null,null,selectedStatus);
											else
												var id=  updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
														'','','','',soInternalId,null,null,null,taskType,SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
														SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],
														'','','','','','',SOarray["custparam_uom"],SOarray["custparam_conversionrate"],vShipVia,Number(Big(SOarray["custparam_orderqty"]).toFixed(5)),
														ordType,department,vclass,null,null,selectedStatus);
											context.setSessionObject('record', 'created'); 

										}
									}
								}



								
								soLineDetails = getSOqtyscandetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
								var cmdStage = request.getParameter('hdnStageflag');
								nlapiLogExecution('ERROR','cmdStage',cmdStage);
								if(soLineDetails !=null && soLineDetails!="" && cmdStage != 'Pick & Stage')
								{
									nlapiLogExecution('ERROR', 'soLineDetails.length', soLineDetails.length);
									if(soLineDetails.length>0)
									{
										var vColumnslist=soLineDetails[0].getAllColumns();

										var vOpentaskdetails = getPickedqtydetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
										for(var cnt=0;cnt<soLineDetails.length;cnt++)
										{ 
											var vsoitem = soLineDetails[cnt].getText('item');
											var vsoitemId = soLineDetails[cnt].getValue('item');
											var vsoitemType=soLineDetails[cnt].getValue('type','item');

											if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
												|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
											{
												var vsoitemQty=soLineDetails[cnt].getValue('quantity');
											}
											else
											{
												var vsoitemQty=soLineDetails[cnt].getValue('quantitycommitted');
											}

											var vsoitemfulfillQty=soLineDetails[cnt].getValue('quantitypicked');				

											var vsoitemNSReceivedQty=soLineDetails[cnt].getValue('quantitypicked');
											var vsoitemNSshippedQty=soLineDetails[cnt].getValue('quantityshiprecv');


											var vsoitemLine = soLineDetails[cnt].getValue('line');					
											var vUnitsText = soLineDetails[cnt].getValue('unit');
											var vConversionRate = soLineDetails[cnt].getValue('formulanumeric');


											if(trantype == 'transferorder' && vsoitemLine != null)
												vsoitemLine = parseInt(vsoitemLine)-1;

											var vsoitemopentaskQty=0;
											for(var vOpentaskcount = 0; vOpentaskcount < vOpentaskdetails.length; vOpentaskcount++)
											{

												var vOpentaskitem = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_sku',null,'group');
												var vOpentaskLine = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_line_no',null,'group');

												if(vOpentaskitem==vsoitemId && vOpentaskLine==vsoitemLine)
												{
													vsoitemopentaskQty = vOpentaskdetails[vOpentaskcount].getValue('custrecord_wmsse_act_qty',null,'sum');
													break;
												}


											}

											if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
											{
												vsoitemopentaskQty = 0;
											}

											if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
											{
												vsoitemNSReceivedQty = 0;
											}
											if(vsoitemfulfillQty ==null || vsoitemfulfillQty=='' ||vsoitemfulfillQty=='null' || vsoitemfulfillQty=='undefined' )
											{
												vsoitemfulfillQty = 0;
											}
											if(vsoitemNSshippedQty ==null || vsoitemNSshippedQty=='' ||vsoitemNSshippedQty=='null' || vsoitemNSshippedQty=='undefined' )
											{
												vsoitemNSshippedQty = 0;
											}

											if(vConversionRate!=null && vConversionRate!='')
											{
												vsoitemQty=Number(Big(vsoitemQty).div(vConversionRate));
												vsoitemNSReceivedQty=Number(Big(vsoitemNSReceivedQty).div(vConversionRate));
												vsoitemNSshippedQty=Number(Big(vsoitemNSshippedQty).div(vConversionRate));

											}

											var vsoitemRcvQty = Number(Big(vsoitemopentaskQty).plus(vsoitemNSReceivedQty));
											if(vsoitemRcvQty==null || vsoitemRcvQty=='')
												vsoitemRcvQty=0;

											if(vsoitemType=='noninventoryitem' || vsoitemType=='otherchargeitem' || vsoitemType=='Service' || vsoitemType=='serviceitem' 
												|| vsoitemType=='downloaditem' || vsoitemType=='Download Item' || vsoitemType=='giftcertificateitem' || vsoitemType=='NonInvtPart' || vsoitemType=='OthCharge')
											{
												var itemRemQty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));
											}
											else
											{
												vsoitemQty=Big(vsoitemQty);
												vsoitemNSshippedQty=Big(vsoitemNSshippedQty);
												vsoitemRcvQty=Big(vsoitemRcvQty);
												var itemRemQty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
											}


											if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
											{	
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
												return;
											}

											else if((parseFloat(itemRemQty)>0))
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
												return;
											}	


										}
										if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
										{

											var resArr = getCustomScriptId(2);
											if(resArr.length > 0)
											{
												SOarray["custparam_error"]='';
												response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
												return;
											}
											else
											{
												SOarray["custparam_error"]="Custom flow not defined for this process";
												response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
												return;
											}
										}
										SOarray["custparam_error"] ='';
										if(vStageScanRequired == "F")
											response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
										else
											response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
										return;
									}
									else
									{
										if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
										{
											var resArr = getCustomScriptId(2);
											if(resArr.length > 0)
											{
												SOarray["custparam_error"]='';
												response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
												return;
											}
											else
											{
												SOarray["custparam_error"]="Custom flow not defined for this process";
												response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
												return;
											}
										}
										SOarray["custparam_error"] ='';
										if(vStageScanRequired == "F")
										{
											response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);		
										}

										else
										{
											response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
										}									

										return; 

									}
									soLineDetails=null;
								}
								else
								{
									if(pickType != null && pickType != '' && pickType != 'null' && pickType != 'undefined' && pickType =='custom')
									{
										var resArr = getCustomScriptId(2);
										if(resArr.length > 0)
										{
											SOarray["custparam_error"]='';
											response.sendRedirect('SUITELET', resArr[0], resArr[1], false, SOarray);
											return;
										}
										else
										{
											SOarray["custparam_error"]="Custom flow not defined for this process";
											response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
											return;
										}
									}
									SOarray["custparam_error"] ='';
									if(vStageScanRequired == "F")
									{
										response.sendRedirect('SUITELET', 'customscript_wmsse_soscan_sng', 'customdeploy_wmsse_soscan_sng', false, SOarray);
									}										
									else
									{
										response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
									}

									return;

								}
							}
						}
						catch(e)
						{
							nlapiLogExecution('DEBUG', 'inside catch exception', e);							

							if ( e instanceof nlobjError )
							{
								SOarray["custparam_error"]=e.getDetails();
								nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
							}
							else
							{
								SOarray["custparam_error"]=e.toString();
								nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
							}

							var lockfilters=new Array();

							lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',FetchedItemId));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
							// This search returns required results, 4k records fetching not required.
							var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

							if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
							{
								var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());

							}
							response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
							return;
						}

					}
					else
					{
						SOarray["custparam_error"] = 'Please enter valid qty';				
						response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
					}
				} 
				else {
					SOarray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
				}
			}
			catch (e) 
			{

				nlapiLogExecution('Debug', 'Exception: ', e);
				if ( e instanceof nlobjError )
				{
					SOarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					SOarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}
				response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			SOarray["custparam_error"] = 'Transaction Is In Progress...';
			response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan_sng', 'customdeploy_wmsse_soqty_scan_sng', false, SOarray);
		}
	} //end of first if condition
} //end of function.

