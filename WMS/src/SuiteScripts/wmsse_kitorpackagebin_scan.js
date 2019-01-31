/**
 * Script Description
 * This script is used to scan the Bin Location for selected item.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ****************************************************************************/

/**
 * Main function to scan kit item qty in picking process
 */
function FulfillmentQtyScan(request, response)
{

	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');

		// Variable Declaration
		var customer=request.getParameter('custparam_customer');
		//Get the PO# from the previous screen, which is passed as a parameter		
		var getSONo = request.getParameter('custparam_soid');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');		
		var whCompany= request.getParameter('custparam_company');
		var getSONo = request.getParameter('custparam_soid');		
		var getSOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var getItemInternalId = request.getParameter('custparam_itemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getenteredQty = request.getParameter('custparam_enteredqty');
		var getItemId = request.getParameter('custparam_itemid');
		var getmemItemqty = request.getParameter('custparam_memitemqty');
		var getmemItempickedqty = request.getParameter('custparam_memitempickedqty');
		var componentItem  = request.getParameter('custparam_coitem');
		var getCarton = request.getParameter('custparam_carton');
		var getCartonSize = request.getParameter('custparam_cartonsize');
		var getCartonWeight = request.getParameter('custparam_cartonweight');
		var getCartonscreenValue = request.getParameter('custparam_cartonscreenrulevalue');
		var reminQty = getmemItemqty;//parseFloat(getmemItemqty)-parseFloat(getmemItempickedqty);
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		var getItemRemainingQty = request.getParameter('custparam_itemremainingquantity');
				
		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}
		
		var SOarray =  new Array();
		SOarray["custparam_option"] = request.getParameter('custparam_option');				
		SOarray["custparam_customer"] = request.getParameter('custparam_customer');
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		SOarray["custparam_trantype"]= request.getParameter('custparam_trantype');
		SOarray["custparam_company"]= request.getParameter('custparam_company');
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_lineno"] = request.getParameter('custparam_lineno');
		SOarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
		SOarray["custparam_sointernalid"] = request.getParameter('custparam_sointernalid');
		SOarray["custparam_itemid"] = request.getParameter('custparam_itemid');
		SOarray["custparam_rem_qty"] = request.getParameter('custparam_rem_qty');
		SOarray["custparam_rec_qty"] = request.getParameter('custparam_rec_qty');
		SOarray["custparam_enteredqty"] = request.getParameter('custparam_enteredqty');
		SOarray["custparam_itemid"] = request.getParameter('custparam_itemid');
		SOarray["custparam_memitemqty"] = request.getParameter('custparam_memitemqty');
		SOarray["custparam_memitempickedqty"] = request.getParameter('custparam_memitempickedqty');
		SOarray["custparam_coitem"]  = request.getParameter('custparam_coitem');
		SOarray["custparam_carton"] = request.getParameter('custparam_carton');
		SOarray["custparam_cartonsize"] = request.getParameter('custparam_cartonsize');
		SOarray["custparam_cartonweight"] = request.getParameter('custparam_cartonweight');
		SOarray["custparam_cartonscreenrulevalue"] = request.getParameter('custparam_cartonscreenrulevalue');				
		SOarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		SOarray["custparam_pickreportid"]=request.getParameter('custparam_pickreportid');
		SOarray["custparam_actualbegintime"] = request.getParameter('custparam_actualbegintime');
		SOarray["custparam_ordtype"] = request.getParameter('custparam_ordtype');
		SOarray["custparam_department"] = request.getParameter('custparam_department');
		SOarray["custparam_class"] = request.getParameter('custparam_class');
		SOarray["custparam_itemremainingquantity"] = getItemRemainingQty;
		SOarray["custparam_bcComponents"] = request.getParameter('custparam_bcComponents');	
		
		var currentUser=getCurrentUser();
		nlapiLogExecution('ERROR','currentUser', currentUser);
		var lockfilters=new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getSOInternalId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',getSOLineNo));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
		
		var lockcolumns= new Array();
		
		var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

		if(lockresults!=null && lockresults!='')
		{
			var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
			var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
			
			if(getLockUser!=currentUser)
			{
				SOarray["custparam_error"]='The line item is being processed by other user.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan', 'customdeploy_wmsse_kitorpkg_itmscan', false, SOarray);
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
		lockcolumns=null;
		lockfilters=null;
		var orderLevel="F";
		// orderLevel=getSystemRuleValue('Order Level?',whLocation);
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
		nlapiLogExecution('ERROR', 'reminQty', reminQty);
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');


		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getSONo. = ' + getSONo + '<br>';
		logmsg = logmsg + 'reminQty. = ' + reminQty + '<br>';
		logmsg = logmsg + 'getItemRemQty. = ' + getItemRemQty + '<br>';	
		logmsg = logmsg + 'getItemRecQty. = ' + getItemRecQty + '<br>';	
		logmsg = logmsg + 'getFetchedItemId. = ' + getFetchedItemId + '<br>';		
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';						
		nlapiLogExecution('Debug', 'Values :', logmsg);
		var domainName = fndomainName();
		
		var st0 = domainName + '-FULFILLMENT QTY SCAN';
		var getPreferBin='';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "SO/TO";

		if(trantype == 'salesorder')
		{
			st0 = domainName + '-SO Picking';
			ordVar = "Sales Order#";
		}
		else
		{
			st0 = domainName + '-TO Picking';
			ordVar = "Transfer Order#";
		}

		var qtyCheckFlag="F";
		var mainItemQty=0;
		var vOrderType = null;
		var vUnits =null;

		var soMainItemDetails =	getSOLineDetailsItemandqty(getSOInternalId, trantype,getFetchedItemId,whLocation,getSOLineNo);
		if(soMainItemDetails!=null && soMainItemDetails!='' && soMainItemDetails.length>0)
		{
			for(var z=0; z<soMainItemDetails.length; z++)
			{
				mainItemQty = soMainItemDetails[z].getValue('quantitycommitted',null,'max');
				var vmainSoLine = soMainItemDetails[z].getValue('line',null,'max');
				if(parseFloat(vmainSoLine) == parseFloat(getSOLineNo))
				{
					vOrderType = soMainItemDetails[z].getValue('custbody_wmsse_ordertype',null,'group');
					vUnits = soMainItemDetails[z].getValue('unit',null,'group');

					if(parseFloat(mainItemQty) < parseFloat(getenteredQty))
					{
						getenteredQty = mainItemQty;

					}
				}
			}
		}
		if(getenteredQty == null || getenteredQty == '' || isNaN(getenteredQty))
			getenteredQty = request.getParameter('custparam_enteredqty');


		var memItemQtytoShow=getmemItemqty;
		var OpenKitPickTaskDetails=getOpenTaskDetails(getSOInternalId,getSOLineNo);

		var kitPickConfirmedQty=0;
		if(OpenKitPickTaskDetails != null && OpenKitPickTaskDetails != '' )
		{
			for(var j=0;j < OpenKitPickTaskDetails.length;j++)
			{
				var sku = OpenKitPickTaskDetails[j].getValue('custrecord_wmsse_sku',null,'group');

				if(parseInt(sku) == parseInt(getItemInternalId))
				{
					kitPickConfirmedQty =   OpenKitPickTaskDetails[j].getValue('custrecord_wmsse_expe_qty',null,'sum');				
					getmemItempickedqty=kitPickConfirmedQty;
					//memItemQtytoShow = parseFloat(getmemItemqty)-parseFloat(getmemItempickedqty);
					memItemQtytoShow = Number(Big(getmemItemqty).minus(getmemItempickedqty));

					break;
				}

			}
		}
		if(parseFloat(memItemQtytoShow) > 0)
		{
			qtyCheckFlag="T";
		}

		var isfromPageRefresh = context.getSessionObject('record');
		
		if(qtyCheckFlag == 'F'  || isfromPageRefresh == 'created')
		{

			//soLineDetails = getSOLineDetailsItem(getSOInternalId,trantype,null,whLocation);
			var soLineDetails = getSOqtyscandetails(getSOInternalId,trantype,whLocation);
			if(soLineDetails !=null && soLineDetails!="" && soLineDetails.length>0)
			{
				
				SOarray["custparam_option"] = request.getParameter('custparam_option');				
				SOarray["custparam_customer"] = request.getParameter('custparam_customer');
				SOarray["custparam_soid"] = request.getParameter('custparam_soid');
				SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
				SOarray["custparam_trantype"]= request.getParameter('custparam_trantype');
				SOarray["custparam_company"]= request.getParameter('custparam_company');
				SOarray["custparam_soid"] = request.getParameter('custparam_soid');
				SOarray["custparam_lineno"] = request.getParameter('custparam_lineno');
				SOarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
				SOarray["custparam_sointernalid"] = request.getParameter('custparam_sointernalid');
				SOarray["custparam_itemid"] = request.getParameter('custparam_itemid');
				SOarray["custparam_rem_qty"] = request.getParameter('custparam_rem_qty');
				SOarray["custparam_rec_qty"] = request.getParameter('custparam_rec_qty');
				SOarray["custparam_enteredqty"] = request.getParameter('custparam_enteredqty');
				SOarray["custparam_itemid"] = request.getParameter('custparam_itemid');
				SOarray["custparam_memitemqty"] = request.getParameter('custparam_memitemqty');
				SOarray["custparam_memitempickedqty"] = request.getParameter('custparam_memitempickedqty');
				SOarray["custparam_coitem"]  = request.getParameter('custparam_coitem');
				SOarray["custparam_carton"] = request.getParameter('custparam_carton');
				SOarray["custparam_cartonsize"] = request.getParameter('custparam_cartonsize');
				SOarray["custparam_cartonweight"] = request.getParameter('custparam_cartonweight');
				SOarray["custparam_cartonscreenrulevalue"] = request.getParameter('custparam_cartonscreenrulevalue');				
				SOarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
				SOarray["custparam_pickreportid"]=request.getParameter('custparam_pickreportid');
				SOarray["custparam_actualbegintime"] = request.getParameter('custparam_actualbegintime');
				SOarray["custparam_ordtype"] = request.getParameter('custparam_ordtype');
				SOarray["custparam_department"] = request.getParameter('custparam_department');
				SOarray["custparam_class"] = request.getParameter('custparam_class');
				SOarray["custparam_itemremainingquantity"] = getItemRemainingQty;
				SOarray["custparam_orderlevel"] = orderLevel ;
				SOarray["custparam_bcComponents"] = request.getParameter('custparam_bcComponents');	
				
				var vLinecount=0;
				var vShipCount=0;
				var vColumnslist=soLineDetails[0].getAllColumns();
				var vOpentaskdetails = getPickedqtydetails(getSOInternalId,trantype,whLocation);
				var deviceUploadFlag='T';
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
					var vsoitemShipVia = soLineDetails[cnt].getValue('shipmethod');
					var vsoitemMultiShipping = soLineDetails[cnt].getValue('ismultishipto');
					var vShipVia='';
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
					if(vsoitemMultiShipping ==  null || vsoitemMultiShipping =='')
						vsoitemMultiShipping='F';

					if(vsoitemMultiShipping == "F")
					{

						if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
						{	deviceUploadFlag='F';
						SOarray["custparam_error"] ='';
						
						response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
						return;
						}

						else if((parseFloat(itemRemQty)>0))
						{
							deviceUploadFlag='F';
							SOarray["custparam_error"] ='';
							SOarray["custparam_memitemqty"] = request.getParameter('custparam_memitemqty');
							SOarray["custparam_memitempickedqty"] = vsoitemRcvQty;//request.getParameter('custparam_memitemqty');

							response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
							return;
						}
					}
					else
					{

						if(parseFloat(itemRemQty)>0 && vsoitemShipVia == vShipVia)
						{
							vShipCount= parseFloat(vShipCount)+1;
						}
						else if(parseFloat(itemRemQty)>0)
						{
							vLinecount=parseFloat(vLinecount)+1;
						}

					}



				}

				if(deviceUploadFlag=='T' && SOarray["custparam_orderlevel"] =="T")
				{

					SOarray["custparam_error"] ='';
					if(vStageScanRequired == "T")
						response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
					else
						response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
					return;
				}
				else if(parseFloat(vShipCount)>0)
				{
					SOarray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
					return;
				}
				else if(parseFloat(vShipCount)==0)
				{


					if(parseFloat(vLinecount) > 0)
					{
						SOarray["custparam_error"] ='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
						return;
					}
					else
					{
						SOarray["custparam_error"] ='';
						if(vStageScanRequired == "T")
							response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
						else
							response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
						return;
					}
				}
				else
				{
					SOarray["custparam_error"] ='';
					if(vStageScanRequired == "T")
						response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
					else
						response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
					return;

				}


				soLineDetails=null;

			}
			else
			{
				SOarray["custparam_error"] ='';
				if(vStageScanRequired == "T")
					response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
				else
					response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
				return;

			}
		}
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();

		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		var strItemGrp="";
		var strItemFam="";	
		var itemType ='';
		var btnText="Next (Ent)";
		var blnItemUnit="";
		var VUnitType ="";
		var Vdepartment ="";
		var Iclass ="";
		var vClassification ='';
		
		if(itemresults!=null && itemresults!='')
		{

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
			itemType = itemresults[0].recordType;
			blnItemUnit = itemresults[0].getText('stockunit');
			VUnitType = itemresults[0].getValue('unitstype');
			componentItem = itemresults[0].getValue('itemid');
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
			
			vClassification = itemresults[0].getValue('locationinvtclassification');

			var logMsg = 'blnMixItem=' + blnMixItem + '<br>';
			logMsg =logMsg+ 'blnMixLot=' + blnMixLot + '<br>';
			logMsg =logMsg+ 'strItemGrp=' + strItemGrp + '<br>';
			logMsg =logMsg+ 'strItemFam=' + strItemFam + '<br>';
			logMsg =logMsg+ 'itemType=' + itemType + '<br>';
			logMsg =logMsg+ 'blnItemUnit=' + blnItemUnit + '<br>';
			logMsg =logMsg+ 'VUnitType=' + VUnitType + '<br>';
			logMsg =logMsg+ 'componentItem=' + componentItem + '<br>';
			logMsg =logMsg+ 'getPreferBin=' + getPreferBin + '<br>';
			nlapiLogExecution('DEBUG', 'logMsg', logMsg);
			itemresults=null;
			itemcolumns=null;
			itemfilters=null;
		}
		var results = null;
		if(VUnitType != null && VUnitType != '' && VUnitType != 'null' && VUnitType != 'undefined')
		{
			results= getUnitsType(VUnitType);
		}
		var getStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
		if(VUnitType != null && VUnitType != '')
		{	
			var vBaseUOMSearch=getBaseUnitRate(VUnitType);

			vBaseUnit='Base unit';
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
				vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
			}	

			if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
			}
		}
		
		var vUnitsText="";
		if(vBaseUnit != "" && vBaseUnit != '' && vBaseUnit != 'null')
			vUnitsText = 'In '+ vBaseUnit;
		/*if(parseFloat(getStockConversionRate) == 1)
			vBaseUnit="";*/


		
		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');

		if(itemType!='noninventoryitem'&& itemType!='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem' &&
				itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
		{
			if(makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == '' || makeInvAvailFlagFromSelect == 'null' || 
					makeInvAvailFlagFromSelect == 'undefined')
				makeInvAvailFlagFromSelect ='T';
		}
		nlapiLogExecution('Debug', 'itemType', itemType);
		var vPageCount = request.getParameter('custparam_pagecount');

		if(vPageCount == null || vPageCount == '' || vPageCount == 'null' || vPageCount == 'undefined')
		{
			vPageCount = 0;
		}
		
		var objBinDetails=null;
		if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
		{
			

//			objBinDetails=fnGetPickBinDetails(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,
//					vOrderType,vUnits,null,vPageCount,makeInvAvailFlagFromSelect,itemType,VUnitType,blnItemUnit,getStockConversionRate);
			objBinDetails=fnGetPickBinDetails(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,
					vOrderType,vUnits,null,vPageCount,makeInvAvailFlagFromSelect,itemType,VUnitType,blnItemUnit,getStockConversionRate,null,vClassification);
		
		}
		else
		{
			

//			objBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,
//					vOrderType,vUnits,null,vPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate);
			objBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,
					vOrderType,vUnits,null,vPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate,null,null,vClassification);

		}
		

		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		

		if(itemType == "inventoryitem" || itemType == "assemblyitem")
		{
			btnText="Pick (Ent)";
		}
		else
		{
			btnText="Next (Ent)";
		}
		var JSSurl ='';
		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			
		}
		var qtyUomCntrlSelectedConversionRate =vConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();


		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();

		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_qty'); 

		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";

		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}
		html = html + "	<script type='text/javascript'>function fnShowLoader() {" +
		"document.getElementById('loading').style.display = 'block';}</script>";
		html = html + "<script type='text/javascript'>function validateForm(){ var qtyValidate = document.getElementById('txtqty').value.split('.'); if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('txtqty').focus();return false;}}if(document.getElementById('hdnqtyCheckFlag').value == 'F'){document.getElementById('div_error').innerHTML ='RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';return false;}  var bin = document.getElementById('hdnPreferBin').value;var scannedqty=document.getElementById('txtqty').value;var remainingqty=document.getElementById('hdnmemItemQty').value; var itemtype=document.getElementById('hdnitemtype').value;if(document.getElementById('txtqty').value == ''){document.getElementById('div_error').innerHTML ='Please enter qty';return false;}else if((parseFloat(scannedqty)>parseFloat(remainingqty)) || (isNaN(scannedqty) || parseFloat(scannedqty)<=0)){if(parseFloat(scannedqty)>parseFloat(remainingqty)){document.getElementById('div_error').innerHTML ='Total entered/scanned qty is greater than expected qty';}else{document.getElementById('div_error').innerHTML ='Please enter valid qty';}document.getElementById('txtqty').value = '';return false;} else if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){ var enteredqty=document.getElementById('txtqty').value; if(enteredqty % 1 != 0){ document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';document.getElementById('txtqty').value = '';document.getElementById('txtqty').focus();return false; }}if(document.getElementById('txtbin').value == '' && bin==''){document.getElementById('div_error').innerHTML ='Please enter/scan bin location';return false;}var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_picking_qty'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_picking_qty'].cmdSend.disabled=true;document.forms['_rf_picking_qty'].cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html + "	<script type='text/javascript'>function DisplayBin(val) {var qtyValidate = document.getElementById('txtqty').value.split('.'); if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('txtqty').focus();return false;}}var scannedqty=document.getElementById('txtqty').value;var remainingqty=document.getElementById('hdnmemItemQty').value; var itemtype=document.getElementById('hdnitemtype').value; if(document.getElementById('txtqty').value == ''){document.getElementById('div_error').innerHTML ='Please enter qty';return false;}else if((parseFloat(scannedqty)>parseFloat(remainingqty)) || (isNaN(scannedqty) || parseFloat(scannedqty)<=0)){if(parseFloat(scannedqty)>parseFloat(remainingqty)){document.getElementById('div_error').innerHTML ='Total entered/scanned qty is greater than expected qty';}else{document.getElementById('div_error').innerHTML ='Please enter valid qty';}document.getElementById('txtqty').value = '';return false;}else if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){ var enteredqty=document.getElementById('txtqty').value; if((parseFloat(enteredqty) % 1) != 0){ document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';document.getElementById('txtqty').value = '';document.getElementById('txtqty').focus();return false; }else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.getElementById('txtbin').value=val;document.forms['_rf_picking_qty'].cmdSend.disabled=true;document.forms['_rf_picking_qty'].submit();document.getElementById('loading').style.display = ''; return true;}}}else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.getElementById('txtbin').value=val;document.forms['_rf_picking_qty'].cmdSend.disabled=true;document.forms['_rf_picking_qty'].submit();document.getElementById('loading').style.display = ''; return true;}}}</script>";

		//Refresh Functionality starts
		html = html + "<SCRIPT LANGUAGE='javascript' for='window' EVENT='onload()'>"; 
		html = html + "var version = navigator.appVersion;";
		html = html + "document.onkeydown = function (e) {";
		html = html + "var keycode = (window.event) ? event.keyCode : e.keyCode;"; 
		html = html + "if ((version.indexOf('MSIE') != -1)) { ";
		html = html + "	if (keycode == 116) {event.keyCode = 0;event.returnValue = false;return false;}}"; 
		html = html + "else {if (keycode == 116)return false;}";
		html = html + "};";
		html = html + "</script>";
		//Refresh Functionality ends

		html = html +"	<form name='_rf_picking_qty' method='POST'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking Qty</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr></table>"+
		"		<table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getSONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getSOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getFetchedItemId + ">"+
		//"				<input type='hidden' name='hdnSoItem' value='" + getSOItem + "'>"+
		"				<input type='hidden' name='hdnItemId' value=" + getItemId + ">"+
		"				<input type='hidden' name='hdnmemItemQty' id='hdnmemItemQty' value=" + memItemQtytoShow + ">"+
		"				<input type='hidden' name='hdnenteredQty' value=" + getenteredQty + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnCarton' value='" + getCarton + "'>"+
		"				<input type='hidden' name='hdnCartonsize' value='" + getCartonSize + "'>"+
		"				<input type='hidden' name='hdnCartonweight' value='" + getCartonWeight + "'>"+
		"				<input type='hidden' name='hdnCartonscreenvalue' value='" + getCartonscreenValue + "'>"+
		"				<input type='hidden' name='hdnCoitem' value='" + componentItem + "'>"+
		"				<input type='hidden' name='hdnCoitempikedqty' value='" + getmemItempickedqty + "'>"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnqtyCheckFlag' id='hdnqtyCheckFlag' value=" + qtyCheckFlag + ">"+
		"				<input type='hidden' name='hdnorderLevel' value=" + orderLevel + ">"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' id='hdnitemtype' name='hdnitemtype' value=" + itemType + ">"+
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnItemRemainingQty' id='hdnItemRemainingQty' value=" + getItemRemainingQty + ">"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnPageCount' id='hdnPageCount' value=" + vPageCount + ">"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+	
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				<input type='hidden' name='hdngetmemItemqty' value='" + getmemItemqty + "'>"+
		
		"				</td>"+
		"			</tr>"+	
		"			<tr><td align='left' class='labelmsg'>Item: <label>" + componentItem + "</label></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + parseFloat(parseFloat(getmemItempickedqty).toFixed(5)) + " " + vBaseUnit + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Expected Qty: <label>" + parseFloat(parseFloat(memItemQtytoShow).toFixed(5)) + " " + vBaseUnit + "</label>"+
		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter Qty "+ vUnitsText +
		"				</td>"+
		"			</tr>"+
		"			<tr>";
		
			html = html +"				<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>";
		
		html = html +"				</td></tr>";
		if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem' && itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
		{
			html= html+ "			<tr>"+
			"				<td align = 'left' class='labelmsg'>Enter/Scan Bin"+	
			"				</td>"+
			"			</tr>"+
			"			<tr>"+
			"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
			"				</td>"+
			"			</tr>";
		}
		html=html+"			<tr></td></td></tr></table><table>"+
		"			<tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/></td><td><input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width='10px'></td><td><input name='cmdSend' type='submit' value='"+btnText+"' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";
		if((objBinDetails !=null && objBinDetails!='' && objBinDetails.length > 0) || (makeInvAvailFlagFromSelect != null
				&& makeInvAvailFlagFromSelect !='' && makeInvAvailFlagFromSelect !='null' 
					&& makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined && makeInvAvailFlagFromSelect != 'All') )

		{
			html = html + 	"<table  class='uomstatus-gridgap' >";			
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
				nlapiLogExecution('Debug', 'selectedUOM', selectedUOM);
				for(var Cnt1=0; Cnt1 < results.length; Cnt1++)
				{                    	 
					var vUOM = results[Cnt1].getValue('conversionrate');
					var UOMText =results[Cnt1].getValue('unitname');
					
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
			
			if(inventoryStatusFeature == true)
			{
				var statusOptsArr = getStatusOptions();
				html = html +"<td ><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
				if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
				{

					for(var Cnt2=0; Cnt2 < statusOptsArr.length; Cnt2++)
					{                    	 
						var val = statusOptsArr[Cnt2][0];
						var StatusText =statusOptsArr[Cnt2][1];


						if(makeInvAvailFlagFromSelect == val)
						{
							html = html +" <option   selected  value="+val+"> "+StatusText+"</option>";

						}
						else
						{
							html = html +" <option     value="+val+"> "+StatusText+"</option>";
						}

					}
				}
				html=html+"</select></td></tr>";
			}

			html = html +"</table>" ;


			html = html + 	"<table  style='border-spacing: 0;' id='tblqtyUOM'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>BinLocation"+	
			"				</td>"+
			"				<td  class='align-right'>Qty"+	
			"				</td>";
			if(inventoryStatusFeature == true)
			{
				html = html +	"			<td></td>	<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}

			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			{
				html = html +	"			<td></td>	<td>Lot#";	
				html = html +"				</td>";
			}
			"			</tr>";
			var count = 0;
			for(var b=0;b<objBinDetails.length;b++)
			{

				count = count +1;
				if(b%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var txtBin='';
				var binAvailQty=0;
				var binLot='';
				var currValues = objBinDetails[b];
				var inventoryStatus ='';
				var convRate = 1/getStockConversionRate;
				var selectedUOM = request.getParameter('custparam_uomprevselected');
				if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
				{
					convRate = parseFloat(getStockConversionRate)/parseFloat(selectedUOM);
				}
				if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
				{

					txtBin = currValues[0];
					binAvailQty =Number(Big(currValues[1]).mul(convRate));
					inventoryStatus = currValues[4];
				}
				else
				{

					txtBin = currValues[0];
					binAvailQty =Number(Big(currValues[1]).mul(convRate));
					inventoryStatus = currValues[6];
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						binLot = currValues[3];
					}
				}
				nlapiLogExecution('ERROR', 'getPreferBin, txtBin', getPreferBin+","+txtBin);
				var linkBin =txtBin;
				if(getPreferBin == txtBin)
				{
					txtBin=txtBin+ "<span style='color:red;'>* </span>";
				}
				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td><a  onclick='return DisplayBin(\""+linkBin+"\");' href='#' >"+txtBin;	
				html = html +"				</a></td>";
				html = html +"				<td class='align-right'>"+Number((Big(binAvailQty).mul(getStockConversionRate)).toFixed(5));	
				html = html +"				</td>";
				if(inventoryStatusFeature == true)
				{
					html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
					html = html +"				</td>";	
				}


				if(binLot!=null && binLot!='')
				{
					html = html +"				<td></td><td>"+binLot;	
					html = html +"				</td>";
				}
				html = html +"			</tr>";

				if(count ==5)
					break;


			}
			html = html +"		<table>	<tr>";			
			if(vPageCount>0)
			{
				html = html +"				<td align = 'left'><input name='cmdEnbPrevList' type='submit' value='Prev' onClick = 'return fnShowLoader();'/></td>";
			}
			else
			{
				html = html +"				<td >&nbsp;</td><td >&nbsp;</td>";
			}

			if((objBinDetails.length>5))
			{
				html = html +"				<td align = 'right'><input name='cmdEnbNextList' type='submit' value='Next' onClick = 'return fnShowLoader();'/></td>";
			}
			html = html +"			</tr>"+ 
			"		 </table>";
			objBinDetails=null;
			html = html + 	"</table>";
		}
		html = html + "</table></form>"+

		"<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var enterQty=request.getParameter('txtqty');
		var enterBin=request.getParameter('txtbin');
		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var memItemExpectedQty=request.getParameter('hdnmemItemQty');
		var memItemPickedQty=request.getParameter('custparam_memitempickedqty');
		var memitem=request.getParameter('hdnItemId');
		if((enterBin == "" || enterBin == null || enterBin =="null") && (request.getParameter('hdnPreferBin') !=null && request.getParameter('hdnPreferBin') !='' && request.getParameter('hdnPreferBin')!='null' && request.getParameter('hdnPreferBin')!='undefined'))
		{
			enterBin=request.getParameter('hdnPreferBin');
		}
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_memunittype"] =vUnitType;
		SOarray["custparam_memstockunit"] =StockUnitText;
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		SOarray["custparam_option"] = request.getParameter('hdnOptedField');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		SOarray["custparam_sointernalid"] = request.getParameter('hdnSoInternalId');
		SOarray["custparam_lineno"] = request.getParameter('hdnSoLineno');
		SOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		SOarray["custparam_memitemqty"] = request.getParameter('hdngetmemItemqty');		

		SOarray["custparam_rem_qty"] = request.getParameter('hdnmemItemQty');
		SOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');		
		SOarray["custparam_rem_qty"] = request.getParameter('hdnmemItemQty');
		SOarray["custparam_rec_qty"] = request.getParameter('hdnCoitempikedqty');

		SOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		SOarray["custparam_enterBin"] = enterBin;
		SOarray["custparam_itemid"] = request.getParameter('hdnItemId');
		SOarray["custparam_enteredqty"] = request.getParameter('hdnenteredQty');
		SOarray["custparam_cartonsize"] = request.getParameter('hdnCartonsize');
		SOarray["custparam_carton"] = request.getParameter('hdnCarton');
		SOarray["custparam_cartonweight"] = request.getParameter('hdnCartonweight');
		SOarray["custparam_cartonscreenrulevalue"] = request.getParameter('hdnCartonscreenvalue');
		//SOarray["custparam_coitem"] = request.getParameter('hdnCoitem');
		SOarray["custparam_memitempickedqty"]=request.getParameter('hdnCoitempikedqty');
		SOarray["custparam_memitementeredqty"]=enterQty;
		//SOarray["custparam_memitemqty"] = request.getParameter('hdnmemItemQty');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		SOarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_itemremainingquantity"] = request.getParameter('hdnItemRemainingQty');
		SOarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');
		
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;
		var trantype=request.getParameter('hdntrantype');
		//var remQty=request.getParameter('hdnItemRemQty');
		var remQty=request.getParameter('hdnmemItemQty');
		var soInternalId=request.getParameter('hdnSoInternalId');
		//var recQty=request.getParameter('getItemRecQty');
		var recQty=request.getParameter('hdnCoitempikedqty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var soLineno=request.getParameter('hdnSoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		
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
		logMsg = logMsg + 'memItemExpectedQty = ' + memItemExpectedQty + '<br>';
		logMsg = logMsg + 'SOarray["custparam_carton"] = ' + SOarray["custparam_carton"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonsize"] = ' + SOarray["custparam_cartonsize"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonweight"] = ' + SOarray["custparam_cartonweight"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonscreenrulevalue"] = ' + SOarray["custparam_cartonscreenrulevalue"] + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - QTY', logMsg);

		var vStageScanRequired="F"; 

		vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',request.getParameter('hdnWhLocation'),'2');		

		if(vStageScanRequired!=null && vStageScanRequired!='')
		{ 
			vStageScanRequired="T";			 
		}
		else
		{
			vStageScanRequired="F";
		}
		
		var isfromPageRefresh = context.getSessionObject('record');
		nlapiLogExecution('DEBUG', 'isfromPageRefresh', isfromPageRefresh);
		if(isfromPageRefresh == 'created')
		{		
		
		response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
		return;
		}
		

		SOarray["custparam_stagescanrequired"]=vStageScanRequired;
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				if((enterBin == "" || enterBin == null) && preferBin != "" && preferBin != '')
					enterBin=preferBin;			

				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){

					var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
					SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
					if(request.getParameter('cmdEnbNextList')=="Next")
					{
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))+1;						
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
						return;
					}
					if(request.getParameter('cmdEnbPrevList')=="Prev")
					{
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))-1;						
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
						return;
					}

					SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'));
					var isFromStatusChange = request.getParameter('hdnfromstatuschange');
					nlapiLogExecution('ERROR', 'isFromStatusChange', isFromStatusChange);
					if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && isFromStatusChange != undefined && isFromStatusChange=='T' )
					{
						SOarray["custparam_pagecount"]=0;
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
						return;

					}

					var itemType = request.getParameter('hdnitemtype');

					if((enterBin == '' || enterBin == null) && (itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem' && itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem'))
					{
						SOarray["custparam_error"] = 'Please enter/scan bin location';
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
						return;
					}
					var binInternalId = '';				
					var selectedStatus = ''; 
					var objBinStatusDetails =null;
					nlapiLogExecution('Debug', 'Inside if enterQty', enterQty);
					if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && parseFloat(remQty) >= parseFloat(enterQty))
					{
						try{


							if(itemType !='noninventoryitem'&& itemType !='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem' && itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
							{

								binInternalId = nswms_GetValidBinInternalId(enterBin,SOarray["custparam_whlocation"],'');
								if(binInternalId=='' || binInternalId==null)
								{
									SOarray["custparam_error"] = 'Please enter/scan valid bin location';
									response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
									return;
								}

								var itemType = nswms_GetItemType(memitem, SOarray["custparam_whlocation"]);

								if(itemType == "inventoryitem" || itemType=="assemblyitem" || ((itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")))
								{

									if(inventoryStatusFeature == true)
									{
										var invfilterStrat =  new Array();
										if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] != '')
											invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', SOarray["custparam_whlocation"]));
										if(memitem != null && memitem != '')
											invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', memitem));
										if(binInternalId!= null && binInternalId!= '')
											invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
										// No need for loadsearch here this search is for navigating to other screen if the serach returns more
										//than one status.
										objBinStatusDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',
												invfilterStrat, null);
										
										if(objBinStatusDetails != null && objBinStatusDetails != '' &&
												objBinStatusDetails != 'null' && objBinStatusDetails != 'undefined' &&
												objBinStatusDetails != undefined && objBinStatusDetails.length ==1)
										{
											
											selectedStatus = objBinStatusDetails[0].getValue('status',null,'group');
											
										}
									}
									if((objBinStatusDetails == null || objBinStatusDetails == '' || objBinStatusDetails == 'null' ||
											objBinStatusDetails == 'undefined' || objBinStatusDetails == undefined 
											|| objBinStatusDetails.length ==1 ))
									{



										try{
											var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockbin');
											LockRecord.setFieldValue('name',binInternalId);
											LockRecord.setFieldValue('custrecord_wmse_lock_sku',memitem);
											LockRecord.setFieldValue('custrecord_wmsse_lock_binlocation',binInternalId);										
											LockRecord.setFieldValue('custrecord_wmsse_lock_flag','T');
											LockRecord.setFieldValue('custrecord_wmsse_lock_unittype',vUnitType);
											LockRecord.setFieldValue('custrecord_wmsse_lockqty',enterQty);
											LockRecord.setFieldValue('custrecord_wmsse_lockuser',context.getUser());
											LockRecord.setFieldValue('custrecord_wmsse_lock_stockunit',StockUnitText);
											LockRecord.setFieldValue('custrecord_wmsse_lock_conversionrate',getStockConversionRate);
											LockRecord.setFieldValue('custrecord_wmsse_lock_itemtype',itemType);
											if(selectedStatus != '')
											{
												LockRecord.setFieldValue('custrecord_wmsse_lock_invtstatus',selectedStatus);	
											}
											var recid = nlapiSubmitRecord(LockRecord);

											LockRecord=null;
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


											response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);									
											return;
										}

										lockresults=null;									
										lockfilters=null;
									}
								}
								SOarray["custparam_itemtype"] = itemType;
								SOarray["custparam_enterQty"] = enterQty;
								if(enterBin!=null && enterBin!='')
									SOarray["custparam_enterBin"] = enterBin;
								else
								{
									SOarray["custparam_enterBin"] = preferBin;
									enterBin=preferBin;
								}
							}
							if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
							{
								SOarray["custparam_pagecount"]=0;
								SOarray["custparam_makeinventoryavailflag"] ='';
								SOarray["custparam_memitemqty"] = request.getParameter('custparam_memitemqty');
								nlapiLogExecution('ERROR', 'into lotnumberedinventoryitem', itemType);
								SOarray["custparam_error"] = '';
								response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan', 'customdeploy_wmsse_kitorpkg_lotscan', false, SOarray);
								return;
							}
							else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{
								

								if(inventoryStatusFeature == true)
								{
									var invfilterStrat =  new Array();
									if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] != '')
										invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', SOarray["custparam_whlocation"]));
									if(memitem != null && memitem != '')
										invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', memitem));
									if(binInternalId!= null && binInternalId!= '')
										invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
									// No need for loadsearch here this search is for navigating to other screen if the serach returns more
									//than one status.
									var	objBinStatusDetailssrch =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh',
											invfilterStrat, null);
									var vStatusDetails = new Array();
									if(objBinStatusDetailssrch != null && objBinStatusDetailssrch != '' && objBinStatusDetailssrch != 'null' &&
											objBinStatusDetailssrch != 'undefined' && objBinStatusDetailssrch != undefined &&
											objBinStatusDetailssrch.length > 0)
									{
										
										vOpenPickDetails = getOPenTaskPickBinDetails(memitem,binInternalId,
												SOarray["custparam_whlocation"],request.getParameter('hdnVUnitType'),
												request.getParameter('hdnblnItemUnit'),'','');
										var statusId;
										nlapiLogExecution('DEBUG', 'objBinStatusDetailssrch.length', objBinStatusDetailssrch.length);
										for(var stsItr=0;stsItr<objBinStatusDetailssrch.length;stsItr++)
										{
											openPickQty=0;
											 statusId = objBinStatusDetailssrch[stsItr].getValue('status',null,'group');
											var vBinQtyAvail = objBinStatusDetailssrch[stsItr].getValue('available',null,'sum');
											var eneteredLotTxt = objBinStatusDetails[stsItr].getText('inventorynumber',null,'group');
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

											vBinQtyAvail=new Big(vBinQtyAvail);
											openPickQty=new Big(openPickQty);
											vBinQtyAvail = Number(vBinQtyAvail.minus(openPickQty));
											if(parseFloat(vBinQtyAvail) > 0)
											{
												vStatusDetails.push(statusId);
											}
										}
										
										SOarray["custparam_enteredBinID"]=binInternalId;
										SOarray["custparam_enteredbin"]=enterBin;
										SOarray["custparam_enterQty"]=enterQty;										
										if(vStatusDetails.length > 1)
										{
											response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts', 'customdeploy_wmsse_kitpkg_selectsts', false, SOarray);
											return;   
										}
										else
										{
											//selectedStatus = objBinStatusDetailssrch[0].getValue('status',null,'group');
											SOarray["custparam_inventorystatus"]=statusId;
										}
									}
								}


								SOarray["custparam_error"] = '';
								response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_serialscan', 'customdeploy_wmsse_kitorpkg_serialscan', false, SOarray);
								return;
							}
							else 
							{

								var binInternalId='';
								if(enterBin !='' && enterBin != null && enterBin != 'null' && enterBin != 'undefined')
								{
									binInternalId=nswms_GetBinInternalId(enterBin,SOarray["custparam_whlocation"]);
								}




								var soLineItemDetails =	getSOLineDetailsItemandqty(SOarray["custparam_sointernalid"], trantype,FetchedItemId,SOarray["custparam_whlocation"],soLineno);


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
									var OpenKitPickTaskDetails=getOpenTaskDetails(soInternalId,soLineno);

									var kitPickConfirmedQty=0;
									if(OpenKitPickTaskDetails != null && OpenKitPickTaskDetails != '' )
									{
										for(var j=0;j < OpenKitPickTaskDetails.length;j++)
										{
											var sku = OpenKitPickTaskDetails[j].getValue('custrecord_wmsse_sku',null,'group');

											if(parseInt(sku) == parseInt(FetchedItemId))
											{
												kitPickConfirmedQty =   OpenKitPickTaskDetails[j].getValue('custrecord_wmsse_expe_qty',null,'sum');
												nlapiLogExecution('DEBUG', 'kitPickConfirmedQty', kitPickConfirmedQty);												
												break;
											}

										}
									}
									for(var z=0;z<soLineItemDetails.length;z++)
									{
										var vsoLine = soLineItemDetails[z].getValue('line',null,'group');
										var vsoitemQty=soLineItemDetails[z].getValue(vColumnslist[commitedQtyIndex]);
										var vsoitemfulfillQty=soLineItemDetails[z].getValue(vColumnslist[fulfilledQtyIndex]);							
										var vsoitemRcvQty=soLineItemDetails[z].getValue(vColumnslist[totalPickedQtyIndex]);
										if(vsoitemRcvQty==null || vsoitemRcvQty=='')
											vsoitemRcvQty=0;
										if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
											vsoitemfulfillQty=0;
										var vsoitemopentaskQty;//=soLineItemDetails[z].getValue(vColumnslist[totalPickedQtyIndex]);
										var vsoitemErpConfirmedQty=soLineItemDetails[z].getValue(vColumnslist[ERPConfirmedQty]);
										var vsoitemNSReceivedQty=soLineItemDetails[z].getValue(vColumnslist[totalNSPickedQtyIndex]);
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

										//var vsoitemRcvQty = parseFloat(vsoitemopentaskQty)+parseFloat(vsoitemErpConfirmedQty)+(parseFloat(vsoitemNSReceivedQty)-parseFloat(vsoitemErpConfirmedQty));

										vsoitemopentaskQty=new Big(vsoitemopentaskQty);
										vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
										vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
										
										var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
										
										//vSoreminqty = (parseFloat(vsoitemQty) + parseFloat(vsoitemfulfillQty)) - parseFloat(kitPickConfirmedQty);
										
										vsoitemQty=new Big(vsoitemQty);
										var vSoreminqty=Number((vsoitemQty).plus(vsoitemfulfillQty).minus(kitPickConfirmedQty));

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
								var selectedStatus = '';
								var vStatusDetails = new Array();
								if(parseFloat(vSoreminqty) > 0)
								{

									if(inventoryStatusFeature == true)
									{


										if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined && objBinStatusDetails.length > 0)
										{
											nlapiLogExecution('ERROR', 'objBinStatusDetails', objBinStatusDetails.length);
											vOpenPickDetails = getOPenTaskPickBinDetails(memitem,binInternalId,
													SOarray["custparam_whlocation"],request.getParameter('hdnVUnitType'),
													request.getParameter('hdnblnItemUnit'),'','');
											
											for(var stsItr=0;stsItr<objBinStatusDetails.length;stsItr++)
											{
												openPickQty=0;
												var statusId = objBinStatusDetails[stsItr].getValue('status',null,'group');
												var vBinQtyAvail = objBinStatusDetails[stsItr].getValue('available',null,'sum');
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

												vBinQtyAvail=new Big(vBinQtyAvail);
												openPickQty=new Big(openPickQty);
												vBinQtyAvail = Number(vBinQtyAvail.minus(openPickQty));
												if(parseFloat(vBinQtyAvail) > 0)
												{
													vStatusDetails.push(statusId);
												}
											}
											
											SOarray["custparam_enteredBinID"]=binInternalId;
											SOarray["custparam_enteredbin"]=enterBin;
											SOarray["custparam_enterQty"]=enterQty;

											if(vStatusDetails.length > 1)
											{
												response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts', 'customdeploy_wmsse_kitpkg_selectsts', false, SOarray);
												return;  
											}
											else
											{
												selectedStatus = statusId;
											}
										}
									}
								}
								nlapiLogExecution('Debug', 'vMultiShipping : vShipVia ', vMultiShipping + ":" + vShipVia);
								var isItLastPick='F';
								var soLineDetails =null;
								if(parseFloat(vSoreminqty) > 0)
								{
									updateOpenTask(soInternalId,memitem,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,
											SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,'PICK',
											SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],
											"F",trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'',
											Number(Big(memItemExpectedQty).toFixed(5)),Number(Big(enterQty).toFixed(5)),FetchedItemId,'T','','','',vShipVia,null,ordType,department,vclass,
											getPickreportid,null,selectedStatus);
									context.setSessionObject('record', 'created'); 
									soLineDetails = getSOLineDetailskit(SOarray["custparam_soid"],trantype,FetchedItemId,
											SOarray["custparam_whlocation"],'');
									nlapiLogExecution('ERROR', 'soLineDetails', soLineDetails);
								}
								var mainItemCommitedQty =0;
								var compItemRequiredQtyArr = new Array();
								if(soLineDetails !=null && soLineDetails!="")
								{
									//var vLinecount=0;
									nlapiLogExecution('DEBUG', 'soLineDetails.length', soLineDetails.length);
									if(soLineDetails.length>0)
									{
										var count= 0;
										//	var item=request.getParameter('hdnSoItem');
										var vColumnslist = soLineDetails[0].getAllColumns();


										var memitemcommitedQtyIndex = 8;
										var memitemfulfilledQtyIndex = 9;		
										var memitemtotalPickedQtyIndex =10;
										for(var x1=0;x1<vColumnslist.length;x1++)
										{
											var summaryLabel = vColumnslist[x1].getLabel();

											if(summaryLabel == 'Member Item Total Picked Quantity')
											{
												memitemtotalPickedQtyIndex = x1;
											}
											else if (summaryLabel == 'Member Item Committed Quantity')	
											{
												memitemcommitedQtyIndex = x1;
											}
											else if (summaryLabel == 'Member Item Fulfilled Quantity')
											{
												memitemfulfilledQtyIndex = x1;
											}				
											else
											{

											}
										}
										var openTaskDetails  = getOpenTaskDetails(soInternalId,soLineno);

										for(var f=0;f<soLineDetails.length;f++)
										{		
											var searchResult=soLineDetails[f];
											var vSoLine = searchResult.getValue('line',null,'group');
											var vsoitemRcvQty = searchResult.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
											var vsoitemCommitedQty=searchResult.getValue(vColumnslist[memitemcommitedQtyIndex]);
											var vsoitem = searchResult.getValue('item',null,'group');
											mainItemCommitedQty = searchResult.getValue('quantitycommited',null,'max');
											var vcoitem = searchResult.getValue('memberitem','item','group');
											var vMemItemType = getComponentItemType(vcoitem);

											var qtyToCompare =	fnGetComponentItemDetails(FetchedItemId,vcoitem,SOarray["custparam_enteredqty"]);
											var currRow = [vcoitem,qtyToCompare];
											compItemRequiredQtyArr.push(currRow);

											var pickConfirmedQty=0;
											if(openTaskDetails != null && openTaskDetails != '' )
											{
												for(var j=0;j < openTaskDetails.length;j++)
												{
													var sku = openTaskDetails[j].getText('custrecord_wmsse_sku',null,'group');

													if(sku == vcoitem)
													{
														pickConfirmedQty =   openTaskDetails[j].getValue('custrecord_wmsse_expe_qty',null,'sum');
														break;
													}

												}
											}

											if(parseFloat(vSoLine) == parseFloat(soLineno))
											{
												if(parseFloat(pickConfirmedQty) >= parseFloat(qtyToCompare))
												{										
													//isItLastPick="T";


												}
												else
												{
													//isItLastPick="F";
													count=parseFloat(count)+1;
													break;
												}
											}
											//}
										}

										if(parseFloat(count) >= 1)
										{
											isItLastPick="F";
										}
										else
										{
											isItLastPick="T";
										}
									}
									soLineDetails=null;
								}
								nlapiLogExecution('DEBUG', 'isItLastPick', isItLastPick);

								// To post IF when order level is true and lastpick is true for already packed containers against order
								if(SOarray["custparam_orderlevel"] =="T" && isItLastPick=="T" && vStageScanRequired == 'F')
								{
									var filtersPack = new Array();
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['14']));
									filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'isnotempty'));

									var columnsPack=new Array();

									var opentaskSearchResultsPack=nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh',filtersPack,null);
									if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
									{
										nlapiLogExecution('DEBUG','opentaskSearchResultsPack at',opentaskSearchResultsPack.length);
										var fieldsPack = new Array();
										var valuesPack = new Array();
										for(var x=0; x < opentaskSearchResultsPack.length; x++)
										{

											var RecordIdPack=opentaskSearchResultsPack[x].getId();
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
									nlapiLogExecution('Debug', 'isItLastPick', isItLastPick);
									//for main item
									var mianItemOPenTaskid =	updateOpenTask(soInternalId,FetchedItemId,soLineno,
											Number(Big(SOarray["custparam_enteredqty"]).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],'','','','',
											soInternalId,null,null,null,'PICK',SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
											SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"]
									,SOarray["custparam_customer"],'','','','','F','','','',vShipVia,null,ordType,
									department,vclass,getPickreportid,null,selectedStatus);
									context.setSessionObject('record', 'created'); 
									nlapiLogExecution('ERROR', 'mianItemOPenTaskid', mianItemOPenTaskid);

									if(mianItemOPenTaskid != null && mianItemOPenTaskid !='')
									{

										var filter= new Array();
										filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId)); 
										filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', soLineno)); 
										filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
										filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8']));//8 picking completed
										filter.push(new nlobjSearchFilter('custrecord_wmsse_kitflag', null,'is', 'T'));//8 picking completed
										filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
										filter.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); // NS REF no is empty
										filter.push(new nlobjSearchFilter('custrecord_wmsse_act_qty', null, 'isempty'));
										var columns= new Array(); 


										var opentaskordersearchresultkit = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskdetails_srh',filter,null);

										if(opentaskordersearchresultkit != null && opentaskordersearchresultkit !='')
										{
											for(var k=0;k<opentaskordersearchresultkit.length;k++)
											{

												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',opentaskordersearchresultkit[k].getId());
												var expQty = loadRec.getFieldValue('custrecord_wmsse_expe_qty');

												var vName = loadRec.getFieldValue('name');
												var vCoItem = loadRec.getFieldText('custrecord_wmsse_sku');
												if(compItemRequiredQtyArr.length > 0)
												{
													for(var c=0;c<compItemRequiredQtyArr.length;c++)
													{
														var coItemVal = compItemRequiredQtyArr[c][0];
														var coItemQty = compItemRequiredQtyArr[c][1];

														if((coItemVal ==  vCoItem)&& (parseFloat(expQty) > parseFloat(coItemQty)))
														{
															//var coRemainingQty = parseFloat(expQty)-parseFloat(coItemQty);
															var coRemainingQty = Number(Big(expQty).minus(coItemQty));
															var copyRec = nlapiCopyRecord('customrecord_wmsse_trn_opentask',opentaskordersearchresultkit[k].getId());
															copyRec.setFieldValue('name', vName);
															copyRec.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(coRemainingQty).toFixed(5)));
															copyRec.setFieldValue('custrecord_wmsse_act_qty', Number(Big(coRemainingQty).toFixed(5)));
															nlapiSubmitRecord(copyRec);
															expQty = coItemQty;
															loadRec.setFieldValue('custrecord_wmsse_expe_qty',Number(Big(expQty).toFixed(5)));

														}
													}

												}



												loadRec.setFieldValue('custrecord_wmsse_act_qty',Number(Big(expQty).toFixed(5)));
												nlapiSubmitRecord(loadRec);
											}
											opentaskordersearchresultkit=null;
										}
										if(SOarray["custparam_orderlevel"] =="F" && mianItemOPenTaskid != null && mianItemOPenTaskid != ''  && vStageScanRequired == 'F')
										{	
											var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
											loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
											nlapiSubmitRecord(loadRec);
											loadRec=null;
										}
									}


									//soLineDetails = getSOLineDetailsItem(soInternalId,trantype,null,SOarray["custparam_whlocation"]);
									soLineDetails=getSOqtyscandetails(soInternalId,trantype,SOarray["custparam_whlocation"]);
									if(soLineDetails !=null && soLineDetails!="" && soLineDetails.length>0)
									{
										nlapiLogExecution('DEBUG', 'soLineDetails.length', soLineDetails.length);
										var vLinecount=0;
										var vShipCount=0;
										var vColumnslist=soLineDetails[0].getAllColumns();
										var vOpentaskdetails = getPickedqtydetails(soInternalId,trantype,SOarray["custparam_whlocation"]);

										var deviceUploadFlag='T';
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
											var vsoitemMultiShipping = soLineDetails[cnt].getValue('ismultishipto');
											var vsoitemShipVia = soLineDetails[cnt].getValue('shipmethod');

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
												
												var itemRemQty = Number(Big(vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
											}

											if(vsoitemMultiShipping ==  null || vsoitemMultiShipping =='')
												vsoitemMultiShipping='F';

											if(vsoitemMultiShipping == "F")
											{

												if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
												{	deviceUploadFlag='F';
												SOarray["custparam_error"] ='';
												//response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan', 'customdeploy_wmsse_kitorpkg_itmscan', false, SOarray);
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
												return;
												}

												else if((parseFloat(itemRemQty)>0))
												{
													deviceUploadFlag='F';
													SOarray["custparam_error"] ='';
													//SOarray["custparam_coitem"] = request.getParameter('custparam_coitem');
													SOarray["custparam_memitemqty"] = request.getParameter('custparam_memitemqty');
													SOarray["custparam_memitempickedqty"] = vsoitemRcvQty;//request.getParameter('custparam_memitemqty');

													//response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
													response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
													return;
												}
											}
											else
											{

												if(parseFloat(itemRemQty)>0 && vsoitemShipVia == vShipVia)
												{
													vShipCount= parseFloat(vShipCount)+1;
												}
												else if(parseFloat(itemRemQty)>0)
												{
													vLinecount=parseFloat(vLinecount)+1;
												}

											}



										}

										if(deviceUploadFlag=='T' && SOarray["custparam_orderlevel"] =="T")
										{
											if(mianItemOPenTaskid != null && mianItemOPenTaskid != ''  &&  vStageScanRequired == 'F')
											{	
												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
												loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												nlapiSubmitRecord(loadRec);
												loadRec=null;
											}
											SOarray["custparam_error"] ='';
											if(vStageScanRequired == "T")
												response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
											else
												response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
											return;
										}
										else if(parseFloat(vShipCount)>0)
										{
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
											return;
										}
										else if(parseFloat(vShipCount)==0)
										{

											if(mianItemOPenTaskid != null && mianItemOPenTaskid != '' && vStageScanRequired == 'F')
											{	
												var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',mianItemOPenTaskid);
												loadRec.setFieldValue('custrecord_wmsse_device_upload_flag','T');
												nlapiSubmitRecord(loadRec);
												loadRec=null;
											}
											if(parseFloat(vLinecount) > 0)
											{
												SOarray["custparam_error"] ='';
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
												return;
											}
											else
											{
												SOarray["custparam_error"] ='';
												if(vStageScanRequired == "T")
													response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
												else
													response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
												return;
											}
										}
										else
										{
											SOarray["custparam_error"] ='';
											if(vStageScanRequired == "T")
												response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
											else
												response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
											return;

										}


										soLineDetails=null;

									}
									else
									{
										SOarray["custparam_error"] ='';
										if(vStageScanRequired == "T")
											response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
										else
											response.sendRedirect('SUITELET', 'customscript_wmsse_soscan', 'customdeploy_wmsse_soscan', false, SOarray);
										return;

									}

								}
								else
								{



									//memItemPickedQty = parseFloat(memItemPickedQty)+parseFloat(enterQty);
									memItemPickedQty = Number(Big(memItemPickedQty).plus(enterQty));

									SOarray["custparam_error"] ='';
									response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan', 'customdeploy_wmsse_kitorpkg_itmscan', false, SOarray);
									return;


								}






							}
						}
						catch(e)
						{
							nlapiLogExecution('ERROR', 'inside catch exception', e);

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

							lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',memitem));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
							lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
							var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

							if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
							{
								var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
								
							}
							response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
							return;
						}
					}
					else
					{
						SOarray["custparam_error"] = 'Please enter valid qty';				
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
					}
				} 
				else {
					SOarray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan', 'customdeploy_wmsse_kitorpkg_itmscan', false, SOarray);
					return;
				}
			}
			catch (e) 
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

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
				response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			SOarray["custparam_error"] = 'Transaction is in progress...';
			response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
		}
	} //end of first if condition
} //end of function.
//Below function is added in generalfunction as this is called in more than one script
/*function getSOLineDetailskit(sonumber,trantype,itemID,whLocation,lineid)
{
	nlapiLogExecution('DEBUG', 'sonumber,trantype,whLocation,itemID',sonumber+","+trantype+","+whLocation+","+itemID);

	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';
	
	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', sonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
	{
		if(crossSubsidiaryFeature == true && trantype =="salesorder")
		{
			filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof', ['@NONE@',whLocation]));

		}
		else
		{
			filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',whLocation]));
		}
	}
	
	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 
	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{
		if(trantype=='transferorder')
			lineid = parseInt(lineid) + 1;
		//filters.push(new nlobjSearchFilter('line', 'custrecord_wmsse_line_no', 'anyof', lineid)); 
		filters.push(new nlobjSearchFilter('line', null, 'equalto', lineid));
	}
	var SOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_ordline_details_kit', filters, columns);
	filters=null;
	columns=null;
	return SOLineDetails;
}*/

function  fnGetComponentItemDetails(getMainItemInternalId,componentItem,vReqQty)
{
	nlapiLogExecution('DEBUG', 'getMainItemInternalId,componentItem,vReqQty', getMainItemInternalId+","+componentItem+","+vReqQty);
	var filters = new Array(); 

	filters[0] = new nlobjSearchFilter('internalid', null, 'is', getMainItemInternalId);//kit_id is the parameter name 
	filters[1]=new nlobjSearchFilter('isfulfillable', null, 'is', 'T');
	var columns1 = new Array(); 

	var vActQty=vReqQty;
	var searchresults = nlapiSearchRecord( 'item', 'customsearch_wmsse_itemdetails', filters, null );  

	for(var q=0; searchresults!=null && q<searchresults.length;q++) 
	{

		var vMemItem=searchresults[q].getText('memberitem');

		if(componentItem == vMemItem)
		{
			var vMemQty=searchresults[q].getValue('memberquantity');
			if(vMemQty == null || vMemQty == '')
				vMemQty=0;
			//vActQty= parseFloat(vMemQty) * parseFloat(vReqQty);
			vActQty= Number(Big(vMemQty) .mul(vReqQty));
			break;
		}


	}
	searchresults=null;
	columns1=null;
	filters=null;

	return vActQty;
}
function getOpenTaskDetails(sonumber,lineid)
{


	var filter = new Array();

	filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', sonumber)); 
	filter.push(new nlobjSearchFilter('custrecord_wmsse_kitflag', null, 'is', 'T')); //PICK
	filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
	filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8','28']));
	filter.push(new nlobjSearchFilter('custrecord_wmsse_act_qty', null, 'isempty'));
	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{		
		filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineid));
	}

	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	//filter.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'noneof',['@NONE@'])); // NS REF no is empty

	var columns= new Array(); 


	var opentaskordersearchresultkit = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_picktask_details',filter,null);

	return opentaskordersearchresultkit;
}
