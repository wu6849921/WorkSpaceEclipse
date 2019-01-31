/**
 * Script Description
 * This script is used to scan the Lot for selected item.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ****************************************************************************/
/**
 * Main function to scan lot number for kit/package item picking
 */
function PickingLotScan(request, response)
{

	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';
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
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var getenteredQty = request.getParameter('custparam_enteredqty');
		var getItemId = request.getParameter('custparam_itemid');
		var getmemItemqty = request.getParameter('custparam_memitementeredqty');
		var getmemItembin = request.getParameter('custparam_memitementeredbin');
		var getmemItempickedqty = request.getParameter('custparam_memitempickedqty');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate');
		var getbaseUom = request.getParameter('custparam_baseunit');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		var vUnitType=request.getParameter('custparam_memunittype');
		var StockUnitText=request.getParameter('custparam_memstockunit');
		var getItemRemainingQty = request.getParameter('custparam_itemremainingquantity');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		if(getItemRecQty==null || getItemRecQty=="" || getItemRecQty=="null")
		{
			getItemRecQty=0;
		}
		if(getmemItempickedqty==null || getmemItempickedqty =='' ||getmemItempickedqty=='null' ||getmemItempickedqty=='undefined')
		{
			getmemItempickedqty=0;
		}
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		var results = null;
		var vConversionRate=1;
		if(vUnitType != null && vUnitType != '' && vUnitType != 'null' && vUnitType != 'undefined')
		{
			results= getUnitsType(vUnitType);
			var vBaseUOMSearch=getBaseUnitRate(vUnitType);
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
			}	

		}
		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		if(makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == '' || makeInvAvailFlagFromSelect == 'null' || 
				makeInvAvailFlagFromSelect == 'undefined')
			makeInvAvailFlagFromSelect ='T';

		nlapiLogExecution('ERROR', 'itemType', itemType);
		var vPageCount = request.getParameter('custparam_pagecount');

		if(vPageCount == null || vPageCount == '' || vPageCount == 'null' || vPageCount == 'undefined')
		{
			vPageCount = 0;
		}
		var getCarton = request.getParameter('custparam_carton');
		var getCartonSize = request.getParameter('custparam_cartonsize');
		var getCartonWeight = request.getParameter('custparam_cartonweight');
		var getCartonscreenValue = request.getParameter('custparam_cartonscreenrulevalue');
		var componentItem  = request.getParameter('custparam_coitem');
		//var reminQty = parseFloat(getmemItemqty)-parseFloat(getmemItempickedqty);
		var reminQty = Number(Big(getmemItemqty).minus(getmemItempickedqty));
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');


		var logmsg = 'getOptedField. = ' + getOptedField + '<br>';
		logmsg = logmsg + 'getSONo. = ' + getSONo + '<br>';
		logmsg = logmsg + 'getItemRemQty. = ' + getItemRemQty + '<br>';	
		logmsg = logmsg + 'getItemRecQty. = ' + getItemRecQty + '<br>';	
		logmsg = logmsg + 'CSSfilefound. = ' + CSSfilefound + '<br>';		
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';						
		nlapiLogExecution('DEBUG', 'Values :', logmsg);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-FULFILLMENT LOT SCAN';
		var getPreferBin=request.getParameter('custparam_preferbin');
		var orderLevel=request.getParameter('custparam_orderlevel');
		var binInternalId=nswms_GetBinInternalId(enterBin,whLocation);
		var AllowAllLots = 'T';
		if(trantype == 'salesorder')
		{
			var objBinDetails = fnGetPickBinDetailsLotWithExpiryDates(getItemId,binInternalId,'',whLocation,
					vPageCount,makeInvAvailFlagFromSelect,vUnitType,StockUnitText,getStockConversionRate);
		}
		else
			if(trantype == 'transferorder')
			{
				var objBinDetails = fnGetPickBinDetailsLotWithExpiryDates(getItemId,binInternalId,'',whLocation,
						vPageCount,makeInvAvailFlagFromSelect,vUnitType,StockUnitText,getStockConversionRate,AllowAllLots);
			}
		var qtyCheckFlag="F";
		var mainItemQty=0;
		var vOrderType = null;
		var vUnits =null;
		
		var soMainItemDetails = getSOLineDetailsItemandqty(getSOInternalId,trantype,getFetchedItemId,whLocation);
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
			//context.setSessionObject('record', null);
			var vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',whLocation,'2');		

			if(vStageScanRequired!=null && vStageScanRequired!='')
			{ 
				vStageScanRequired="T";			 
			}
			else
			{
				vStageScanRequired="F";
			}

			var SOarray =  new Array();			
			SOarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			SOarray["custparam_trantype"]= request.getParameter('custparam_trantype');
			SOarray["custparam_company"]= request.getParameter('custparam_company');
			SOarray["custparam_soid"] = request.getParameter('custparam_soid');			
			SOarray["custparam_lineno"] = request.getParameter('custparam_lineno');
			SOarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
			SOarray["custparam_sointernalid"] = request.getParameter('custparam_sointernalid');
			SOarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
			SOarray["custparam_rem_qty"] = request.getParameter('custparam_rem_qty');
			SOarray["custparam_rec_qty"] = request.getParameter('custparam_rec_qty');
			SOarray["custparam_itemtype"] = request.getParameter('custparam_itemtype');
			SOarray["custparam_enterQty"] = request.getParameter('custparam_enterQty');
			SOarray["custparam_enterBin"] = request.getParameter('custparam_enterBin');
			SOarray["custparam_enteredqty"] = request.getParameter('custparam_enteredqty');
			SOarray["custparam_itemid"] = request.getParameter('custparam_itemid');
			SOarray["custparam_memitementeredqty"] = request.getParameter('custparam_memitementeredqty');
			SOarray["custparam_memitementeredbin"] = request.getParameter('custparam_memitementeredbin');
			SOarray["custparam_memitempickedqty"] = request.getParameter('custparam_memitempickedqty');
			SOarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
			SOarray["custparam_pickreportid"] = request.getParameter('custparam_pickreportid');
			SOarray["custparam_stockconversionrate"] = request.getParameter('custparam_stockconversionrate');
			SOarray["custparam_baseunit"] = request.getParameter('custparam_baseunit');
			SOarray["custparam_actualbegintime"] = request.getParameter('custparam_actualbegintime');
			SOarray["custparam_ordtype"] = request.getParameter('custparam_ordtype');
			SOarray["custparam_department"] = request.getParameter('custparam_department');
			SOarray["custparam_class"] = request.getParameter('custparam_class');
			SOarray["custparam_memunittype"] = request.getParameter('custparam_memunittype');
			SOarray["custparam_memstockunit"] = request.getParameter('custparam_memstockunit');			
			SOarray["custparam_carton"] = request.getParameter('custparam_carton');
			SOarray["custparam_cartonsize"] = request.getParameter('custparam_cartonsize');
			SOarray["custparam_cartonweight"] = request.getParameter('custparam_cartonweight');
			SOarray["custparam_cartonscreenrulevalue"] = request.getParameter('custparam_cartonscreenrulevalue');
			SOarray["custparam_coitem"]  = request.getParameter('custparam_coitem');
			SOarray["custparam_itemremainingquantity"] = getItemRemainingQty ;
			SOarray["custparam_bcComponents"] = request.getParameter('custparam_bcComponents');	

			//soLineDetails = getSOLineDetailsItem(getSOInternalId, trantype,null,whLocation,'');
			soLineDetails=getSOqtyscandetails(getSOInternalId,trantype,whLocation);
			if(soLineDetails !=null && soLineDetails!="" && soLineDetails.length>0)
			{

				var vLinecount=0;
				var vShipCount=0;
				var vColumnslist=soLineDetails[0].getAllColumns();
				

				var deviceUploadFlag='T';
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
						var itemRemQty = Number((vsoitemQty).plus(vsoitemNSshippedQty).minus(vsoitemRcvQty));
					}

					if(vsoitemMultiShipping ==  null || vsoitemMultiShipping =='')
						vsoitemMultiShipping='F';
					if(vsoitemMultiShipping == "F")
					{

						if((parseFloat(itemRemQty)>0) && orderLevel =="T" )
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
							SOarray["custparam_memitempickedqty"] = vsoitemRcvQty;

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

				if(deviceUploadFlag=='T' && orderLevel =="T" )
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
					if(vStageScanRequired == "T")
						response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
					else
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
		if(itemresults!=null && itemresults!='')
		{
			componentItem = itemresults[0].getValue('itemid');
		}
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

		if (CSSfilefound) 
		{ 
			CSSurl = CSSfilefound.getURL();
		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();

		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		var JSSurl ='';
		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			nlapiLogExecution('ERROR', 'JSSurl', JSSurl); 
		}
		var qtyUomCntrlSelectedConversionRate =vConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}

		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
		//Ends here
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

		html = html + "<script type='text/javascript'>function validateLot(enterlot){var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.getElementById('txtlot').value = enterlot ;document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html + "<script type='text/javascript'>function validateForm(){var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtlot').value; var vLotWhiteSpace = lotVal.indexOf(' ') >= 0; if(document.getElementById('txtlot').value == '' ){document.getElementById('div_error').innerHTML ='Please enter/scan lot';return false;} else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}}}</script>";

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
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking Lot#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getSONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getSOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnPreferBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnItemId' value=" + getItemId + ">"+
		"				<input type='hidden' name='hdnmemItemQty' value=" + getmemItemqty + ">"+
		"				<input type='hidden' name='hdnenteredQty' value=" + getenteredQty + ">"+
		"				<input type='hidden' name='hdnmemitementeredQty' value=" + getmemItemqty + ">"+
		"				<input type='hidden' name='hdnmemitementeredbin' value=" + getmemItembin + ">"+
		"				<input type='hidden' name='hdnCarton' value='" + getCarton + "'>"+
		"				<input type='hidden' name='hdnCartonsize' value='" + getCartonSize + "'>"+
		"				<input type='hidden' name='hdnCartonweight' value='" + getCartonWeight + "'>"+
		"				<input type='hidden' name='hdnCartonscreenvalue' value='" + getCartonscreenValue + "'>"+
		"				<input type='hidden' name='hdnCOitem' value='" + componentItem + "'>"+
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + reminQty + ">"+	
		"				<input type='hidden' name='hdnmemItempickedQty'  value=" + getmemItempickedqty + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnorderLevel' value=" + orderLevel + ">"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + getbaseUom + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + vUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + StockUnitText + "'>"+
		"				<input type='hidden' name='hdnItemRemainingQty' id='hdnItemRemainingQty' value=" + getItemRemainingQty + ">"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnPageCount' id='hdnPageCount' value=" + vPageCount + ">"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + componentItem + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + parseFloat(parseFloat(getmemItempickedqty).toFixed(5)) + " " + getbaseUom + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Entered Qty: <label>" + parseFloat(parseFloat(enterQty).toFixed(5)) + " " + getbaseUom + "</label>"+
		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";
		html = html +"	<td align = 'left'><input name='txtlot'  class='smalltextbox'  id='txtlot' type='text'/>";

		html = html +"				</td>"+
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+

		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'  type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Pick (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";
		if((objBinDetails !=null && objBinDetails != '' && objBinDetails.length !=null) || (makeInvAvailFlagFromSelect != null
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
				nlapiLogExecution('ERROR', 'selectedUOM', selectedUOM);
				for(var Cnt1=0; Cnt1 < results.length; Cnt1++)
				{                    	 
					var vUOM = results[Cnt1].getValue('conversionrate');
					var UOMText =results[Cnt1].getValue('unitname');
					nlapiLogExecution('ERROR', 'vConversionRate', vConversionRate);
					nlapiLogExecution('ERROR', 'vUOM', vUOM);
					if( ( (selectedUOM == null && vConversionRate == vUOM) || (selectedUOM == '' && vConversionRate == vUOM)  
							|| (selectedUOM =='null' && vConversionRate == vUOM) || (selectedUOM =='undefined'  && vConversionRate == vUOM )
							|| (selectedUOM == undefined && vConversionRate == vUOM) )|| (selectedUOM == vUOM))
					{
						nlapiLogExecution('ERROR', 'selectedUOM', selectedUOM);
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
			html = html + "	<table >"+
			" <tr>"+
			" <td>"+
			"	<table style='border-spacing: 0;' id='tblqtyUOM'>"+
			" <tr class='uir-machine-headerrow' colspan='3'>"+


			" <td>Lot#"+
			" </td>"+	
			" <td class='align-right'>Qty"+
			" </td>";
			if(inventoryStatusFeature == true)
			{
				html = html +	"			<td></td>	<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}
			html = html + " <td>Expiry Date"+
			" </td>"+
			"</tr>";


			for (var s = 0; s < objBinDetails.length && s < 5; s++) {
				if(s%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';

				var selectedUOM = request.getParameter('custparam_uomprevselected');
				var convRate = getStockConversionRate;
				if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
				{
					convRate = Number(Big(getStockConversionRate).div(selectedUOM));
				}
				var lotDetails = objBinDetails[s];
				var vitemLotQty =Number(Big(lotDetails[1]).mul(convRate));
				var vitemLot = lotDetails[3];
				var vitemLotExp = lotDetails[4];
				var inventoryStatus = lotDetails[5];
				var vitemLotQtyvalue =Number(Big(vitemLotQty).mul(getStockConversionRate));
				html = html + "	<tr class='" + vAltClass + "'>"+
				" <td> <a href='#' onclick='return validateLot(\""+vitemLot+"\");' >"+vitemLot+" </a></td>"+
				" <td class='align-right'>"+parseFloat(parseFloat(vitemLotQtyvalue).toFixed(5))+"</td>";	
				if(inventoryStatusFeature == true)
				{
					html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
					html = html +"				</td>";	
				}

				html = html + " <td> "+vitemLotExp+"</td>"+
				"</tr>";
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

		html = html + "</form>"+

		"<script type='text/javascript'>document.getElementById('txtlot').focus();</script>";
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var enterLot=request.getParameter('txtlot');
		var ordType= request.getParameter('hdnOrdtype');
		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		SOarray["custparam_memunittype"]=request.getParameter('hdnVUnitType');
		SOarray["custparam_memstockunit"]=request.getParameter('hdnblnItemUnit');
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
		SOarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		SOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		SOarray["custparam_itemid"] = request.getParameter('hdnItemId');
		SOarray["custparam_enteredqty"] = request.getParameter('hdnenteredQty');
		SOarray["custparam_memitementeredqty"] = request.getParameter('hdnmemitementeredQty');;
		SOarray["custparam_memitemlot"] = enterLot;
		SOarray["custparam_memitementeredbin"] =request.getParameter('hdnmemitementeredbin');
		SOarray["custparam_cartonsize"] = request.getParameter('hdnCartonsize');
		SOarray["custparam_carton"] = request.getParameter('hdnCarton');
		SOarray["custparam_cartonweight"] = request.getParameter('hdnCartonweight');
		SOarray["custparam_cartonscreenrulevalue"] = request.getParameter('hdnCartonscreenvalue');
		SOarray["custparam_enterBin"]=request.getParameter('hdnenterBin');
		SOarray["custparam_enterQty"]=request.getParameter('hdnenterQty');
		SOarray["custparam_memitempickedqty"]=request.getParameter('hdnmemItempickedQty');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_memitemqty"] = request.getParameter('custparam_memitemqty');
		SOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		SOarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
		var getStockConversionRate= request.getParameter('hdngetStockConversionRate');
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
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var soInternalId=request.getParameter('hdnSoInternalId');
		var recQty=request.getParameter('hdnItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var soLineno=request.getParameter('hdnSoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnmemitementeredQty');
		var enterBin=request.getParameter('hdnenterBin');
		var memItemExpectedQty=request.getParameter('hdnmemItemQty');
		var memItemPickedQty=request.getParameter('custparam_memitempickedqty');
		var memitem =request.getParameter('hdnItemId');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button

		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'optedEvent = ' + optedEvent + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'soInternalId = ' + soInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'soLineno = ' + soLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'memitemid = ' + memitem + '<br>';
		logMsg = logMsg + 'SOarray["custparam_carton"] = ' + SOarray["custparam_carton"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonsize"] = ' + SOarray["custparam_cartonsize"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonweight"] = ' + SOarray["custparam_cartonweight"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonscreenrulevalue"] = ' + SOarray["custparam_cartonscreenrulevalue"] + '<br>';
		nlapiLogExecution('Debug', 'Processing RF - Lot', logMsg);
		var vStageScanRequired="F";


		var vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',request.getParameter('hdnWhLocation'),'2');		

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


		if (sessionobj!=context.getUser()) 
		{
			try
			{
				var inventoryStatusFeature = isInvStatusFeatureEnabled();

				var binInternalId=nswms_GetBinInternalId(enterBin,request.getParameter('hdnWhLocation'));
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
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan', 'customdeploy_wmsse_kitorpkg_lotscan', false, SOarray);
						return;
					}
					if(request.getParameter('cmdEnbPrevList')=="Prev")
					{
						SOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						SOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))-1;						
						SOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan', 'customdeploy_wmsse_kitorpkg_lotscan', false, SOarray);
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
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan', 'customdeploy_wmsse_kitorpkg_lotscan', false, SOarray);
						return;

					}

					var inventoryStatus ='';
					var objBinStatusDetails =null;
					if(enterLot!=null && enterLot!="" && enterLot!='null')
					{

						try{
							nlapiLogExecution('DEBUG', 'inside if', itemType);						

							if(inventoryStatusFeature ==true)
							{
								var lotInternalId = '';

								var filterStrat = new Array();
								if(memitem != null && memitem != '')
									filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', memitem));
								if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] != '')
									filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', SOarray["custparam_whlocation"]));
								if(binInternalId != null && binInternalId != '')
									filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));

								if(enterLot != null && enterLot != '' && enterLot != 'null'  && enterLot != 'undefined')
								{
									 
									filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', enterLot));
								}

								var columnStrat=new Array();

								columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
								columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
								columnStrat[0].setSort(true);

								var objlotDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
							
								if(objlotDetails != null && objlotDetails != '' && objlotDetails != 'null' &&
										objlotDetails != 'undefined' && objlotDetails != undefined && objlotDetails.length != null)
								{
									
									lotInternalId =objlotDetails[0].getValue('inventorynumber','inventoryNumberBinOnHand');
								}
								else
								{
									SOarray["custparam_error"] = 'Enter/Scan valid lot.';
									response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan', 
											'customdeploy_wmsse_kitorpkg_lotscan', false, SOarray);									
									return;
								}
								

								var invfilterStrat =  new Array();
								if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] != '')
									invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', SOarray["custparam_whlocation"]));
								if(memitem != null && memitem != '')
									invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', memitem));
								if(binInternalId!= null && binInternalId!= '')
									invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
								if(lotInternalId != null && lotInternalId != '')
									invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', lotInternalId));

								// No need for loadsearch here this search is for navigating to other screen if the serach returns more
								//than one status.
								objBinStatusDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);
								
								if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null'
									&& objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined && objBinStatusDetails.length ==1)
								{
									
									inventoryStatus = objBinStatusDetails[0].getValue('status',null,'group');
								}
								else 
								{
									var vStatusDetails = new Array();
									if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null'
										&& objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined)
									{
										SOarray['custparam_enteredlot'] = objBinStatusDetails[0].getValue('inventorynumber',null,'group');
										
										vOpenPickDetails = getOPenTaskPickBinDetailsLot(memitem,binInternalId,
												SOarray["custparam_whlocation"],request.getParameter('hdnVUnitType'),
												request.getParameter('hdnblnItemUnit'),'','');
										
										for(var stsItr=0;stsItr<objBinStatusDetails.length;stsItr++)
										{
											openPickQty=0;
											var statusId = objBinStatusDetails[stsItr].getValue('status',null,'group');
											var vBinQtyAvail = objBinStatusDetails[stsItr].getValue('available',null,'sum');
											var eneteredLotTxt = objBinStatusDetails[stsItr].getText('inventorynumber',null,'group');
											if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
											{
												var	vOpenPickQtyArr = vOpenPickDetails[1];
												var	vBinLotArr = vOpenPickDetails[3];
												var	vBinStatusArr = vOpenPickDetails[5];
												if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined'
													&& vBinStatusArr != undefined)
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
											vBinQtyAvail=new Big(vBinQtyAvail);
											openPickQty=new Big(openPickQty);
											vBinQtyAvail = Number(vBinQtyAvail.minus(openPickQty));
											if(parseFloat(vBinQtyAvail) > 0)
											{
												vStatusDetails.push(statusId);
											}
										}
										
										
										
										if(vStatusDetails.length > 1)
										{
											SOarray["custparam_stagescanrequired"]=vStageScanRequired;
											SOarray["custparam_enteredBinID"]=binInternalId;
											SOarray["custparam_enteredbin"]=enterBin;
											SOarray["custparam_enterQty"]=enterQty;
											response.sendRedirect('SUITELET', 'customscript_wmsse_kitpkg_selectsts',
													'customdeploy_wmsse_kitpkg_selectsts', false, SOarray);
											return;  
										}

									}
								}
							}

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
								LockRecord.setFieldValue('custrecord_wmsse_lock_seriallot',enterLot);
								if(inventoryStatus != '')
								{
									LockRecord.setFieldValue('custrecord_wmsse_lock_invtstatus',inventoryStatus);	
								}
								LockRecord.setFieldValue('custrecord_wmsse_lock_trantype',trantype);
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


								response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan', 'customdeploy_wmsse_kitorpkg_lotscan', false, SOarray);									
								return;
							}

							lockresults=null;									
							lockfilters=null;





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

											break;
										}

									}
								}

								for(var z=0;z<soLineItemDetails.length;z++)
								{
									var vsoLine = soLineItemDetails[z].getValue('line',null,'group');

									var vsoitemQty=soLineItemDetails[z].getValue(vColumnslist[commitedQtyIndex]);
									var vsoitemfulfillQty=soLineItemDetails[z].getValue(vColumnslist[fulfilledQtyIndex]);							

									if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
										vsoitemfulfillQty=0;

									var vsoitemopentaskQty=soLineItemDetails[z].getValue(vColumnslist[totalPickedQtyIndex]);
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
									vSoreminqty = Number((vsoitemQty).plus(vsoitemfulfillQty).minus(kitPickConfirmedQty));

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

							var isItLastPick='F';
							var soLineDetails =null;
							if(parseFloat(vSoreminqty) > 0)
							{
								updateOpenTask(soInternalId,memitem,soLineno,Number(Big(enterQty).toFixed(5)),binInternalId,itemType,SOarray["custparam_whlocation"],
										enterLot,null,null,'',soInternalId,null,null,null,'PICK',
										SOarray["custparam_carton"],SOarray["custparam_cartonsize"],
										SOarray["custparam_cartonweight"],"F",trantype,SOarray["custparam_actualbegintime"],
										SOarray["custparam_customer"],'',Number(Big(memItemExpectedQty).toFixed(5)),Number(Big(enterQty).toFixed(5)),FetchedItemId,'T','','','',vShipVia
										,null,ordType,null,null,getPickreportid,null,inventoryStatus);
								context.setSessionObject('record', 'created'); 
								soLineDetails = getSOLineDetailskit(SOarray["custparam_soid"],trantype,FetchedItemId,SOarray["custparam_whlocation"],'');
								nlapiLogExecution('ERROR', 'soLineDetails', soLineDetails);
							}
							var compItemRequiredQtyArr = new Array();
							if(soLineDetails !=null && soLineDetails!="")
							{
								var vLinecount=0;
								nlapiLogExecution('DEBUG', 'soLineDetails.length', soLineDetails.length);
								if(soLineDetails.length>0)
								{
									var count= 0;
									//	var item=request.getParameter('hdnSoItem');
									var vColumnslist=soLineDetails[0].getAllColumns();
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
										var vcoitem = searchResult.getValue('memberitem','item','group');
										var vMemItemType = getComponentItemType(vcoitem);
										/*if(vMemItemType =='inventoryitem' || vMemItemType =='assemblyitem' || vMemItemType =='lotnumberedinventoryitem' || vMemItemType =='lotnumberedassemblyitem' || vMemItemType =='serializedinventoryitem' || vMemItemType =='serializedassemblyitem')
										{*/
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
									nlapiLogExecution('ERROR', 'count', count);
									if(parseFloat(count) >= 1)
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
								nlapiLogExecution('ERROR', 'isItLastPick', isItLastPick);
								//for main item
								var mianItemOPenTaskid =	updateOpenTask(soInternalId,FetchedItemId,soLineno,Number(Big(SOarray["custparam_enteredqty"]).toFixed(5)),
										binInternalId,itemType,SOarray["custparam_whlocation"],'','','','',soInternalId,null,null,null,'PICK',
										SOarray["custparam_carton"],SOarray["custparam_cartonsize"],SOarray["custparam_cartonweight"],"F",
										trantype,SOarray["custparam_actualbegintime"],SOarray["custparam_customer"],'','','','','F','','','',
										vShipVia,null,ordType,department,vclass,getPickreportid,null,inventoryStatus);
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
											nlapiLogExecution('ERROR', 'opentaskordersearchresultkit', 
													opentaskordersearchresultkit[k].getId());
											var loadRec = nlapiLoadRecord('customrecord_wmsse_trn_opentask',
													opentaskordersearchresultkit[k].getId());
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
														var copyRec = nlapiCopyRecord('customrecord_wmsse_trn_opentask',
																opentaskordersearchresultkit[k].getId());
														copyRec.setFieldValue('name', vName);
														copyRec.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(coRemainingQty).toFixed(5)));
														nlapiSubmitRecord(copyRec);
														expQty = coItemQty;
														loadRec.setFieldValue('custrecord_wmsse_expe_qty',Number(Big(expQty).toFixed(5)));

													}
												}

											}

											loadRec.setFieldValue('custrecord_wmsse_act_qty',Number(Big(expQty).toFixed(5)));
											nlapiSubmitRecord(loadRec);
										}
									}
									opentaskordersearchresultkit=null;
									if(SOarray["custparam_orderlevel"] =="F" && mianItemOPenTaskid != null && mianItemOPenTaskid != ''  
										&& vStageScanRequired == 'F')
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

										if(vsoitemMultiShipping ==  null || vsoitemMultiShipping =='')
											vsoitemMultiShipping='F';

										if(vsoitemMultiShipping == "F")
										{
											nlapiLogExecution('DEBUG', 'if vsoitemMultiShipping', vsoitemMultiShipping);
											if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
											{	deviceUploadFlag='F';
											SOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan',
													'customdeploy_wmsse_soitem_scan', false, SOarray);
											return;
											}

											else if((parseFloat(itemRemQty)>0))
											{
												deviceUploadFlag='F';
												SOarray["custparam_error"] ='';
												SOarray["custparam_memitemqty"] = request.getParameter('custparam_memitemqty');
												SOarray["custparam_memitempickedqty"] = vsoitemRcvQty;
												response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan',
														'customdeploy_wmsse_soitem_scan', false, SOarray);
												return;
											}
										}
										else
										{
											nlapiLogExecution('DEBUG', 'else vsoitemMultiShipping', vsoitemMultiShipping);
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

									if(deviceUploadFlag=='T' && SOarray["custparam_orderlevel"] =="T" )
									{
										if(mianItemOPenTaskid != null && mianItemOPenTaskid != '' && vStageScanRequired == 'F')
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
										if(vStageScanRequired == "T")
											response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
										else
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
								nlapiLogExecution('ERROR','DeleteRecordId', DeleteRecordId);
							}
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
							response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan', 'customdeploy_wmsse_kitorpkg_lotscan', false, SOarray);
							return;
						}

					}
					else
					{
						SOarray["custparam_error"] = 'Please enter/scan valid lot#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan', 'customdeploy_wmsse_kitorpkg_lotscan', false, SOarray);
					}
				} 
				else {

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
					SOarray["custparam_error"] = '';
					response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan', 'customdeploy_wmsse_kitorpkg_binscan', false, SOarray);
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
				var lockfilters=new Array();

				lockfilters.push(new nlobjSearchFilter('custrecord_wmse_lock_sku',null,'anyof',memitem));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_binlocation',null,'anyof',binInternalId));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lock_flag',null,'is','T'));
				lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockuser',null,'anyof',context.getUser()));
				var lockresults= nlapiSearchRecord('customrecord_wmsse_lockbin', 'customsearch_wmsse_binlockingrecords_del', lockfilters, null);

				if(lockresults!=null && lockresults!='null' &&  lockresults !='' && lockresults != 'undefined')
				{
					var DeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockbin', lockresults[0].getId());
					nlapiLogExecution('ERROR','DeleteRecordId', DeleteRecordId);
				}
				response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan', 'customdeploy_wmsse_kitorpkg_lotscan', false, SOarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_lotscan', 'customdeploy_wmsse_kitorpkg_lotscan', false, SOarray);
		}
	} //end of first if condition
} //end of function.

function nswms_ValidateLot(binInternalId,enterLot,FetchedItemId,whlocation)
{

	nlapiLogExecution('DEBUG', 'binInternalId,enterLot,FetchedItemId', binInternalId+","+enterLot+","+FetchedItemId);
	var enterLot1 =1;
	var itemfilters=new Array();
	itemfilters.push(new nlobjSearchFilter('item',null,'anyof',FetchedItemId));
	itemfilters.push(new nlobjSearchFilter('binnumber', null, 'anyof', binInternalId));
	itemfilters.push(new nlobjSearchFilter('inventorynumber',null,'is', enterLot1));

	var itemcolumns= new Array();

	var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);

	return itemresults;
}
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
	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{		
		if(trantype=='transferorder')
			lineid = parseInt(lineid) + 1;
		filters.push(new nlobjSearchFilter('line', null, 'equalto', lineid));
	}
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

	var SOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_ordline_details_kit', filters, columns);

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
			vActQty= Number(Big(vMemQty).mul(vReqQty));
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
