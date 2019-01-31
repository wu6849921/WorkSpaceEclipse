/**
 * Script Description
 * This script is used to scan the qty and bin location for selected item.
 */

/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function CheckInQty(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';

		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getCONo = request.getParameter('custparam_containerNo');
		nlapiLogExecution('ERROR', 'Into Request', getCONo);

		var frompolistflag = request.getParameter('custparam_frompolistflag');
		var getActualBeginDate = request.getParameter('custparam_actualbegindate');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var getActualBeginTimeAMPM = request.getParameter('custparam_actualbegintimeampm');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var orderType=request.getParameter('custparam_ordertype');
		var getitemType=request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lot');
		var lotExpiryDate=request.getParameter('custparam_lotexpirydate');
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');
		var getPONo = request.getParameter('custparam_potext');			
		nlapiLogExecution('ERROR','getPONo', getPONo);
		var getPOItem = request.getParameter('custparam_poitem');
		nlapiLogExecution('ERROR','getPOItem', getPOItem);
		var getPOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getPOInternalId = request.getParameter('custparam_pointernalid');
		nlapiLogExecution('ERROR','getPOInternalId', getPOInternalId);
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		
		nlapiLogExecution('ERROR', 'getFetchedItemId:getItemInternalId',  getFetchedItemId + " : " + getItemInternalId);
		var getItemRemQty = request.getParameter('custparam_remainingQty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var usedBins = request.getParameter('custparam_usedbinsflag');
		// var orderedQty = request.getParameter('custparam_ordered_qty');
		var orderedQty = request.getParameter('custparam_oredrquantity');
		var expectedQty = request.getParameter('custparam_expectquantity');
		var headerVar='Container';
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		nlapiLogExecution('ERROR', 'getItemRemQty :  getItemRecQty', getItemRemQty + " : " + getItemRecQty);
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);

		var vPOoverageChecked='F';
		var vConfig=nlapiLoadConfiguration('accountingpreferences');
		if(vConfig != null && vConfig != '' && trantype != 'transferorder')
		{
			vPOoverageChecked=vConfig.getFieldValue('OVERRECEIPTS');
		}
		nlapiLogExecution('Debug','vPOoverageChecked', vPOoverageChecked);
		var qtyCheckFlag="F";
		var poLineDetails=getPOLineDetailsNew(getPONo,trantype,getItemInternalId,whLocation);
		var openputawayQtyIndex = 7;
		var unitsIndex =14;
		var conversionQtyIndex =15;
		var coversionRcvdQtyIndex=16;
		var coversionRateIndex =17;
		var vColumnslist ='';
		if(poLineDetails !=null && poLineDetails !='' && poLineDetails.length > 0)
		{	
			vColumnslist=poLineDetails[0].getAllColumns();
			for(var x1=0;x1<vColumnslist.length;x1++)
			{
				var summaryLabel = vColumnslist[x1].getLabel();
				var name = vColumnslist[x1].getName();
				if(summaryLabel == 'Open Putaway Quantity')
				{
					openputawayQtyIndex = x1;
				}
				else if(name == 'unit')
				{
					unitsIndex =x1;
				}
				else if(summaryLabel == 'Conversion Order Quantity')
				{
					conversionQtyIndex = x1;
				}
				else if(summaryLabel == 'Conversion Received Quantity')
				{
					coversionRcvdQtyIndex = x1;
				}
				else if(summaryLabel == 'Conversion Rate')
				{
					coversionRateIndex = x1;
				}
				else
				{

				}
			}

			for(var j=0; j<poLineDetails.length; j++)
			{

				var usedBins='';
				var polineno=poLineDetails[j].getValue('line',null,'group');
				var pocheckinqty=poLineDetails[j].getValue('quantity',null,'max');
				var vUnits = poLineDetails[j].getText(vColumnslist[unitsIndex]);
				var vConversionRate = poLineDetails[j].getValue(vColumnslist[coversionRateIndex]);
				//var vpoitemQty = poLineDetails[j].getValue('quantity',null,'max');
				//var vpoitemRcvQty = poLineDetails[j].getValue('quantityshiprecv',null,'max');
				//var vpoitemNSRcvQty = poLineDetails[j].getValue('quantityshiprecv',null,'max');
				var vpoitemQty = poLineDetails[j].getValue(vColumnslist[conversionQtyIndex]);
				var vpoitemNSRcvQty = poLineDetails[j].getValue(vColumnslist[coversionRcvdQtyIndex]);
				var vpoitemRcvQty=poLineDetails[j].getValue(vColumnslist[openputawayQtyIndex]);
				if(vpoitemQty == null || vpoitemQty == '')
					vpoitemQty=0;
				if(trantype=="returnauthorization")
				{
					if(parseFloat(vpoitemQty)<0)
						vpoitemQty=parseFloat(vpoitemQty)*(-1);
				}
				if(vpoitemRcvQty==null || vpoitemRcvQty=='')
					vpoitemRcvQty=0;
				if(vpoitemNSRcvQty==null || vpoitemNSRcvQty=='')
					vpoitemNSRcvQty=0;
				var totalReceivedQty = parseFloat(vpoitemRcvQty) + parseFloat(vpoitemNSRcvQty)
				nlapiLogExecution('ERROR', 'totalReceivedQty', totalReceivedQty); 
				var vPoreminqty = parseFloat(vpoitemQty)- parseFloat(totalReceivedQty);
				nlapiLogExecution('ERROR', 'vPoreminqty', vPoreminqty); 
				if(parseFloat(polineno) == parseFloat(getPOLineNo))
				{
					if(parseFloat(vPoreminqty)>0)
					{
						qtyCheckFlag = "T";
						//getItemRemQty = vPoreminqty;
						//getItemRecQty = totalReceivedQty;
						break;
					}
				}
			}
		}
		//if(parseFloat(getItemRecQty)>0)
		//{
		//	expectedQty = parseFloat(expectedQty) - parseFloat(getItemRecQty);
		//}
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+headerVar+' Receiving';
		var getPreferBin='';

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		//itemfilters.push(new nlobjSearchFilter('location','binnumber','anyof',whLocation));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		//itemfilters.push(new nlobjSearchFilter('preferredbin', null, 'is', 'T'));
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('preferredbin'));
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		itemcolumns.push(new nlobjSearchColumn('binnumber'));
		itemcolumns.push(new nlobjSearchColumn('name'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_item'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_lot'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemgroup'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemfamily'));
		itemcolumns.push(new nlobjSearchColumn('stockunit'));
		itemcolumns.push(new nlobjSearchColumn('unitstype'));
		itemcolumns.push(new nlobjSearchColumn('location','binnumber'));
		itemcolumns.push(new nlobjSearchColumn('isinactive'));
		itemcolumns.push(new nlobjSearchColumn('location'));
		itemcolumns[0].setSort(true);
		var itemType='';
		var btnText='Save (Ent)';
		var itemresults= nlapiSearchRecord('item', null, itemfilters, itemcolumns);
		var strItemGrp="";
		var strItemFam="";
		var isactiveflag = 'F';
		var blnMixItem="F";
		var blnMixLot="F";
		var blnItemUnit="";
		var VUnitType ="";
		nlapiLogExecution('ERROR', 'itemresults1', itemresults); 
		if(itemresults!=null && itemresults!='')
		{
			var POarray = new Array();
			POarray["custparam_poid"] = request.getParameter('custparam_poid');
			POarray["custparam_actualbegindate"] = request.getParameter('custparam_actualbegindate');
			POarray["custparam_actualbegintime"] = request.getParameter('custparam_actualbegintime');	
			POarray["custparam_customer"] = request.getParameter('custparam_customer');
			POarray["custparam_actualbegintimeampm"] = request.getParameter('custparam_actualbegintimeampm');
			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_trantype"] = request.getParameter('custparam_trantype');
			POarray["custparam_ordertype"] = request.getParameter('custparam_ordertype');
			POarray["custparam_lotno"] = request.getParameter('custparam_lotno');
			POarray["custparam_itemtype"] = request.getParameter('custparam_itemtype');
			POarray["custparam_container"] = request.getParameter('custparam_container');
			POarray["custparam_containerNo"] = request.getParameter('custparam_containerNo');
			POarray["custparam_lotexpirydate"] = request.getParameter('custparam_lotexpirydate');
			POarray["custparam_company"] = request.getParameter('custparam_company');
			POarray["custparam_poitem"] = request.getParameter('custparam_poitem');
			POarray["custparam_lineno"] = request.getParameter('custparam_lineno');
			POarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
			POarray["custparam_rec_qty"] = request.getParameter('custparam_rec_qty');
			POarray["custparam_remainingQty"] = request.getParameter('custparam_remainingQty');
			POarray["custparam_pointernalid"] = request.getParameter('custparam_pointernalid');
			POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
			POarray["custparam_usedbinsflag"] = request.getParameter('custparam_usedbinsflag');
			POarray["custparam_uom"] = request.getParameter('custparam_uom');
			POarray["custparam_conversionrate"] = request.getParameter('custparam_conversionrate');
			if(itemresults[0].getValue('isinactive')=="T")
			{
				POarray["custparam_error"] = 'Entered item  is inactive.';
				//response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
				nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
				return;

			}
			var itemLoc = itemresults[0].getValue('location');
			nlapiLogExecution('ERROR', 'itemLoc', itemLoc);
			nlapiLogExecution('ERROR', 'POarray["custparam_whlocation"]', POarray["custparam_whlocation"]);
			if((itemLoc != POarray["custparam_whlocation"]) && (itemLoc  != null && itemLoc != '' && itemLoc != 'null' && itemLoc != 'undefined'))
			{
				POarray["custparam_error"] = 'This item is mapped to different site.';
				//response.sendRedirect('SUITELET', 'customscript_wmsse_checkinsku', 'customdeploy_wmsse_checkinsku', false, POarray);
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
				nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
				return;
			}
			isactiveflag = 'T';
			itemType = itemresults[0].recordType;
			/*if(itemresults[0].getValue('preferredbin')=="T")
			{
				getPreferBin = itemresults[0].getValue('binnumber');
			}*/
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
			getPOItem = itemresults[0].getValue('itemid');
		}
		
		nlapiLogExecution('ERROR', 'isactiveflag1', isactiveflag); 

		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		nlapiLogExecution('ERROR', 'itemType', itemType); 
		nlapiLogExecution('ERROR', 'blnItemUnit', blnItemUnit); 
		nlapiLogExecution('ERROR', 'vConversionRate', vConversionRate); 
		var getStockConversionRate =1;
		if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
		{
			getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
		}

		nlapiLogExecution('ERROR', 'getStockConversionRate', getStockConversionRate); 
		if(itemType == null || itemType =='' || itemType == 'null' || itemType == 'undefined')
		{
			itemType = getitemType;
		}
		if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
		{
			btnText='Next (Ent)';
		}
		var vBinDetails ='';
		//	var
		var systemRule=getSystemRuleValue('Stage received items before putting away?',whLocation);
		nlapiLogExecution('ERROR', 'systemRule', systemRule);
		if(systemRule==null || systemRule=='' || systemRule=='null' || systemRule=='undefined')
		{
			systemRule= 'N';
		}

		var tableHeaderText = 'Staging Bin Locations';
		if(systemRule==null || systemRule=='' || systemRule=='N')
		{
			vBinDetails=fnGetPutBinAndIntDetails(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,whLocation,itemType,lotno);
			tableHeaderText = 'Bin Locations';
		}
		else
		{
			vBinDetails=fnGetPutBinDetailsNew(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,whLocation,itemType,lotno);

		}

		nlapiLogExecution('ERROR', 'vBinDetails', vBinDetails);

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
			if((errMsg == "Please configure stage locations" || errMsg == "This item has mixflag false, please configure  new bin locations" || errMsg =="Please configure bin locations") && ((vBinDetails.length != null &&  vBinDetails.length > 0) || (getPreferBin != null && getPreferBin != 'null' && getPreferBin !='' && getPreferBin != 'undefined' && systemRule == 'N')))
			{
				errMsg = '';
			}
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			nlapiLogExecution('ERROR', 'imgUrl', imgUrl);
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		//"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";

		html = html + "</head><body>"+
		//case # 201412820 start
		"	<script type='text/javascript'>function DisplayBin(val) { var isactiveflag=document.getElementById('hdnisactiveflag').value;if(isactiveflag == 'F'){document.getElementById('div_error').innerHTML ='Entered item is inactive';return false;} var qty = document.getElementById('txtqty').value;var reWhiteSpace = qty.indexOf(' ') >= 0;var scannedqty=document.getElementById('txtqty').value;var remainingqty=document.getElementById('hdnItemRemQty').value; var pooveragecheck = document.getElementById('hdnvPOoverageChecked').value; var itemtype=document.getElementById('hdnitemtype').value; if(qty ==''){document.getElementById('div_error').innerHTML ='Please enter qty';return false;}else if(isNaN(qty) || parseFloat(qty)<=0 || (reWhiteSpace == true)){document.getElementById('div_error').innerHTML ='Please enter valid qty';document.getElementById('txtqty').value='';return false;}else if((parseFloat(qty)>parseFloat(remainingqty)) && pooveragecheck=='F'){ document.getElementById('div_error').innerHTML ='Overage receiving is not allowed';document.getElementById('txtqty').value = '';return false;}else if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){ var enteredqty=document.getElementById('txtqty').value; var ConvertQty=document.getElementById('hdnvConversionRate').value; var conversionQty=(enteredqty)*(ConvertQty); if(conversionQty.toString().indexOf('.') != -1){ document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';document.getElementById('txtqty').value='';return false; }else{document.getElementById('txtbin').value=val;document.forms['_rf_checkin_item'].submit(); document.getElementById('loading').style.display = ''; return true;}} else{document.getElementById('txtbin').value=val;document.forms['_rf_checkin_item'].submit(); document.getElementById('loading').style.display = ''; return true;} }</script>"+
		//case # 201412820 end
		//"	<script type='text/javascript'>function validateForm() { if(document.getElementById('hdnusedBins').value == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item';return false;} if(document.getElementById('txtqty').value == ''){document.getElementById('div_error').innerHTML ='Please enter qty';return false;}else{var scannedqty=document.getElementById('txtqty').value;var remainingqty=document.getElementById('hdnItemRemQty').value; var pooveragecheck = document.getElementById('hdnvPOoverageChecked').value; if(((parseFloat(scannedqty)>parseFloat(remainingqty)) && pooveragecheck=='F') || (isNaN(scannedqty) || parseFloat(scannedqty)<=0)){document.getElementById('div_error').innerHTML ='Please enter valid qty';document.getElementById('txtqty').value = '';return false;}  if(document.getElementById('txtbin').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan bin location';return false;} else{document.getElementById('loading').style.display = ''; return true;}}}</script>";
		"	<script type='text/javascript'>function validateForm() { var isactiveflag=document.getElementById('hdnisactiveflag').value;if(isactiveflag == 'F'){document.getElementById('div_error').innerHTML ='Entered item is inactive';return false;} if(document.getElementById('hdnqtyCheckFlag').value == 'F'){document.getElementById('div_error').innerHTML ='RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';return false;} if(document.getElementById('hdnusedBins').value == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item';return false;} if(document.getElementById('txtqty').value == ''){document.getElementById('div_error').innerHTML ='Please enter qty';return false;}else{var scannedqty=document.getElementById('txtqty').value;var reWhiteSpace = scannedqty.indexOf(' ') >= 0;var remainingqty=document.getElementById('hdnItemRemQty').value; var pooveragecheck = document.getElementById('hdnvPOoverageChecked').value; if((isNaN(scannedqty) || parseFloat(scannedqty)<=0) || (reWhiteSpace == true) ){document.getElementById('div_error').innerHTML ='Please enter valid qty';document.getElementById('txtqty').value = '';return false;} if((parseFloat(scannedqty)>parseFloat(remainingqty)) && pooveragecheck=='F'){ document.getElementById('div_error').innerHTML ='Overage receiving is not allowed';document.getElementById('txtqty').value = '';return false;} var itemtype=document.getElementById('hdnitemtype').value; if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){ var enteredqty=document.getElementById('txtqty').value; var ConvertQty=document.getElementById('hdnvConversionRate').value; var conversionQty=(enteredqty)*(ConvertQty); if(conversionQty.toString().indexOf('.') > 0){ document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false; }} if(document.getElementById('txtbin').value == '' && (document.getElementById('hdnPreferBin').value == '')){document.getElementById('div_error').innerHTML ='Please enter/scan bin location'; document.getElementById('txtbin').focus();return false;}  else{document.getElementById('loading').style.display = ''; return true;}}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Receiving Qty</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+headerVar+"#: <label>" + getCONo + "</label></td>"+ 
		"			</tr>" +
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>PO#: <label>"+getPONo+"</label></td>"+ 
		"			</tr>" +
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>"+getPOItem+"</label>"+		 
		"				<input type='hidden' name='hdnActualBeginDate' value=" + getActualBeginDate + ">"+		
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnActualBeginTimeAMPM' value=" + getActualBeginTimeAMPM + ">"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+
		"				<input type='hidden' name='hdnordertype' value='" + orderType + "'>"+
		"				<input type='hidden' name='hdnitemtype' id='hdnitemtype' value=" + itemType + ">"+
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnPoInternalId' value=" + getPOInternalId + ">"+
		"				<input type='hidden' name='hdnPoLineno' value=" + getPOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnPoItem' value='" + getPOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnlotno' value=" + lotno + ">"+
		"				<input type='hidden' name='hdnlotexpirydate' value='" + lotExpiryDate + "'>"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdnstrItemGrp' value=" + strItemGrp + ">"+
		"				<input type='hidden' name='hdnstrItemFam' value=" + strItemFam + ">"+
		"				<input type='hidden' name='hdnvPOoverageChecked' id='hdnvPOoverageChecked' value=" + vPOoverageChecked + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnusedBins' id='hdnusedBins' value=" + usedBins + ">"+
		"				<input type='hidden' name='hdnqtyCheckFlag' id='hdnqtyCheckFlag' value=" + qtyCheckFlag + ">"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnisactiveflag' id='hdnisactiveflag' value=" + isactiveflag + ">"+
		"				<input type='hidden' name='hdnPoNo' value=" + getPONo + ">"+
		"				<input type='hidden' name='hdnexpectedQty' value=" + expectedQty + ">"+
		"				<input type='hidden' name='hdnorderedQty' value=" + orderedQty + ">"+
		"				<input type='hidden' name='hdnfrompolistflag' id='hdnfrompolistflag' value='" + frompolistflag + "'>"+
		"				</td>"+
		"			</tr>";	 
		if(lotno!=null && lotno!='' && lotno!='null')
		{
			html = html +"<tr>";
			html = html +"<td align = 'left' class='labelmsg'>Lot#: <label>" + lotno + "</label>";
			html = html +"</tr>";
		}

		html=html+"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Ordered Qty: <label> "+orderedQty+"</label>"+
		"			</tr><tr>"+
		"				<td align = 'left' class='labelmsg'>Expected Qty: <label> "+expectedQty+"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Received Qty: <label> "+getItemRecQty+"</label>"+
		"			</tr>";
		
		if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
		{
			html = html +"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Enter Qty in "+ vUnits +	
			"				</td>"+
			"			</tr>";
		}
		else
		{
			html = html +"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Enter Qty"+	
			"				</td>"+
			"			</tr>";
		}
			 
 
		html = html +"			<tr>"+
		"				<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Bin Location"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		"				</td>"+
		"			</tr></table>"+

		"			<table><tr>"+
		"				<input name='cmdSend1' class='defaultlink'   type='submit' value='' onclick='return validateForm();'/><td>"+
		//"					<input name='cmdReceiveFulls' type='submit' value='RECEIVE FULL'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='"+btnText+"' onclick='return validateForm();'/></td><td width='20px'></td>";
		//"				<td width='20px'></td>";
		if(itemType !='serializedinventoryitem' && itemType!='serializedassemblyitem')
			html = html +"				<td align = 'left'><input name='cmdSend' type='submit' value='New Container' onclick='return validateForm();'/></td>";
			html = html +"			</tr></table>"; 
		/*if((vBinDetails!=null && vBinDetails!='') || (getPreferBin != null && getPreferBin != ''))*/
		nlapiLogExecution('ERROR', 'vBinDetails', vBinDetails);
		nlapiLogExecution('ERROR', 'errMsg', errMsg);
		if(((vBinDetails!=null &&  vBinDetails!='' && vBinDetails.length != null)||(getPreferBin != null && getPreferBin != 'null' && getPreferBin !='' && getPreferBin != 'undefined' && systemRule=='N')) || errMsg == "Please configure stage locations" || errMsg == "Please select use bins flag for this item" || errMsg =="RCRD_HAS_BEEN_CHANGED : This order/order line has been changed" || errMsg == "This item has mixflag false, please configure  new bin locations" || errMsg =="Please configure bin locations" )
		{
			if(tableHeaderText == "Staging Bin Locations")
			{
				html = html + "	<table>"+
				" <tr>"+
				" <td>"+
				"	<table class='table'>"+
				" <tr class='uir-machine-headerrow'>"+
				" <td class='listheadertdleft listheadertextb uir-column-large' >"+tableHeaderText+""+
				" </td>"+				 
				"</tr>";
				/*if(getPreferBin != null && getPreferBin != '')
			{
				html = html + "	<tr>"+
				" <td>"+getPreferBin+"<span style='color:red;'>* </span></td>"+ 
				"</tr>";
			}	*/
				var vAltClass='';
				for (var s = 0; s < vBinDetails.length; s++) {
					if(s%2==1)
						vAltClass='uir-list-row-tr line uir-list-row-even';
					else
						vAltClass='uir-list-row-tr line uir-list-row-odd';
					var txtBin = vBinDetails[s];					 
					html = html + "	<tr class='" + vAltClass + "'>"+
					" <td><a onclick='return DisplayBin(\""+txtBin+"\");' href='#' >"+txtBin+"</a></td>"+						
					"</tr>";
					if(s >=4)
					{
						if(errMsg != '')
						{

						}
						break;
					}
				}
				html = html + "	</table>"+		
				" </td>"+
				"</tr>"+
				"</table>";
			}
			else
			{
				html = html + 	" <table  style='border-spacing: 0;'>";
				html = html +	"			<tr class='uir-machine-headerrow' >"+
				"				<td  align = 'middle' class='listheadertdleft listheadertextb uir-column-medium'>Bin Location"+	
				"				</td>"+
				"				<td align = 'right' class='listheadertdleft listheadertextb uir-column-medium'>Qty"+	
				"				</td>";
				if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
				{
					html = html +"				<td></td>";
					html = html +"				<td align = 'right' class='listheadertdleft listheadertextb uir-column-medium'>Qty In "+vUnits+"";
					html = html +"				</td>";
				}
				html = html +"			</tr>";
				var vAltClass='uir-list-row-tr line uir-list-row-even';
				if(getPreferBin != null && getPreferBin != '')
				{
					var preferBinId = nswms_GetValidBinInternalId(getPreferBin,whLocation,null);
					var preferqtyDetails = getBinwiseQtyDetails(preferBinId,whLocation);
					var vqty=preferqtyDetails[0];
					if(vqty == '' || vqty == null || vqty == 'undefined')
						vqty=0;
					//case # 201412820 start
					html = html + "	<tr class='" + vAltClass + "'>"+
					" <td><a  onclick='return DisplayBin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+ 
					"				<td align = 'right' >"+vqty+""+	
					"				</td>";
					if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
					{
						html = html +"				<td></td>";
						html = html +"				<td align = 'right' >"+(parseFloat(vqty)*parseFloat(getStockConversionRate))+"";	
						html = html +"				</td>";
					}
					html = html +"</tr>";
					//case # 201412820 end
				}	

				for (var st = 0; st < vBinDetails.length; st++) {
					if(st%2==1)
						vAltClass='uir-list-row-tr line uir-list-row-even';
					else
						vAltClass='uir-list-row-tr line uir-list-row-odd';
					var currValues = vBinDetails[st];
					//var txtBin = vBinDetails[st];
					var txtBin = currValues[0];
					var txtBinInternalId = currValues[1];
					var qtyDetails = getBinwiseQtyDetails(txtBinInternalId,whLocation);
					//var qty = qtyDetails[st];
					var qty = qtyDetails[0];
					if(qty == '' || qty == null || qty == 'undefined')
						qty=0;
					if(getPreferBin != txtBin)
					{	
						/*html = html + "	<tr  class='" + vAltClass + "'>"+
						" <td align='left'>"+txtBin+"</td>"+				 
						"</tr>";*/
						//case # 201412820 start
						html = html +	"			<tr class='" + vAltClass + "'>"+
						"<td align = 'left' ><a  onclick='return DisplayBin(\""+txtBin+"\");' href='#' >"+txtBin+"</a>"+
						"				</td>"+
						"				<td align = 'right' >"+qty+""+	
						"				</td>";
						if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
						{
							html = html +"				<td></td>";
							html = html +"				<td align = 'right' >"+(parseFloat(qty)*parseFloat(getStockConversionRate))+"";
							html = html +	"				</td>";
						}
						html = html +"			</tr>";
						//case # 201412820 end
					}
					//nlapiLogExecution('ERROR', 'st', st);
					if(parseInt(st) >= 4)
						break;
				}
				//html = html + "	</table>"+		
				html = html +" </td>"+
				"</tr>"+
				"</table>";
			}

		}
		else
		{
			var POarray = new Array();
			POarray["custparam_frompolistflag"] = request.getParameter('custparam_frompolistflag');
			POarray["custparam_poid"] = request.getParameter('custparam_poid');
			POarray["custparam_actualbegindate"] = request.getParameter('custparam_actualbegindate');
			POarray["custparam_actualbegintime"] = request.getParameter('custparam_actualbegintime');	
			POarray["custparam_customer"] = request.getParameter('custparam_customer');
			POarray["custparam_actualbegintimeampm"] = request.getParameter('custparam_actualbegintimeampm');
			POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			POarray["custparam_trantype"] = request.getParameter('custparam_trantype');
			POarray["custparam_ordertype"] = request.getParameter('custparam_ordertype');
			POarray["custparam_lotno"] = request.getParameter('custparam_lotno');
			POarray["custparam_itemtype"] = request.getParameter('custparam_itemtype');
			POarray["custparam_lotexpirydate"] = request.getParameter('custparam_lotexpirydate');
			POarray["custparam_company"] = request.getParameter('custparam_company');
			POarray["custparam_poitem"] = request.getParameter('custparam_poitem');
			POarray["custparam_lineno"] = request.getParameter('custparam_lineno');
			POarray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
			POarray["custparam_rec_qty"] = request.getParameter('custparam_rec_qty');
			POarray["custparam_remainingQty"] = request.getParameter('custparam_remainingQty');
			POarray["custparam_pointernalid"] = request.getParameter('custparam_pointernalid');
			POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
			POarray["custparam_usedbinsflag"] = request.getParameter('custparam_usedbinsflag');
			POarray["custparam_uom"] = request.getParameter('custparam_uom');
			POarray["custparam_conversionrate"] = request.getParameter('custparam_conversionrate');
			POarray["custparam_stockconversionrate"] = getStockConversionRate; 
			nlapiLogExecution('ERROR', 'systemRule', systemRule);
			
			if(POarray["custparam_usedbinsflag"] == "F")
			{
				POarray["custparam_error"] = 'Please select use bins flag for this item';
			}
			else if  (systemRule=='Y')
			{
				nlapiLogExecution('ERROR', 'systemRule in ', systemRule);
				POarray["custparam_error"] = 'Please configure stage locations';
			}
			else
			{
				nlapiLogExecution('ERROR', 'systemRule in else', systemRule);
				if((vBinDetails == null || vBinDetails == '' || vBinDetails.length == null) && blnMixItem == 'F')
				{
					POarray["custparam_error"] = 'This item has mixflag false, please configure  new bin locations';
				}
				else
				{
					POarray["custparam_error"] = 'Please configure bin locations';
				}

			}
			if(qtyCheckFlag == "F")
			{
				POarray["custparam_error"] = 'RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';
			}
			response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
			return;
		}

		html = html + " </form>"+
		"<script type='text/javascript'>document.getElementById('txtqty').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');
		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var enterQty=request.getParameter('txtqty');
		var enterBin=request.getParameter('txtbin');
		var frompolistflag = request.getParameter('hdnfrompolistflag');
		POarray["custparam_frompolistflag"] = request.getParameter('hdnfrompolistflag');
		POarray["custparam_container"] = request.getParameter('custparam_container');
		POarray["custparam_containerNo"] = request.getParameter('custparam_containerNo');
		POarray["custparam_screenno"] = '2';
		POarray["custparam_actualbegindate"] = request.getParameter('hdnActualBeginDate');	
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_customer"] = request.getParameter('hdnCustomer');
		POarray["custparam_actualbegintimeampm"] = request.getParameter('hdnActualBeginTimeAMPM');
		POarray["custparam_trantype"] = request.getParameter('hdntrantype');
		var orderType=request.getParameter('hdnordertype');
		POarray["custparam_ordertype"]=orderType;
		var itemType=request.getParameter('hdnitemtype');
		POarray["custparam_itemtype"] = itemType;
		POarray["custparam_pointernalid"] = request.getParameter('hdnPoInternalId');
		POarray["custparam_oredrquantity"] = request.getParameter('hdnorderedQty');
		POarray["custparam_expectquantity"] = request.getParameter('hdnexpectedQty');
		POarray["custparam_potext"] = request.getParameter('hdnPoNo');
		POarray["custparam_lineno"] = request.getParameter('hdnPoLineno');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_remainingQty"] = request.getParameter('hdnItemRemQty');
		POarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		POarray["custparam_poitem"] = request.getParameter('custparam_poitem');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
		POarray["custparam_lotno"] =request.getParameter('hdnlotno');
		POarray["custparam_lotexpirydate"] = request.getParameter('hdnlotexpirydate');
		POarray["custparam_usedbinsflag"] = request.getParameter('hdnusedBins');		
		POarray['custparam_ordered_qty']=request.getParameter('custparam_ordered_qty');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		POarray["custparam_uom"] = request.getParameter('hdnuom');
		POarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		POarray["custparam_lot"] = request.getParameter('hdnlotno');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		var poOverageCheck=request.getParameter('hdnvPOoverageChecked');
		//POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		//POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var poInternalId=request.getParameter('hdnPoInternalId');
		var recQty=request.getParameter('hdnItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var poLineno=request.getParameter('hdnPoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var lotno= request.getParameter('hdnlotno');
		var lotExpiryDate= request.getParameter('hdnlotexpirydate');
		var actualBeginTime=request.getParameter('hdnActualBeginTime');
		var strItemGrp=request.getParameter('hdnstrItemGrp');
		var strItemFam=request.getParameter('hdnstrItemFam');

		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var whLocation = request.getParameter('custparam_whlocation');
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);
		var logMsg = 'PO = ' + POarray["custparam_container"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'poInternalId = ' + poInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'poLineno = ' + poLineno + '<br>';
		logMsg = logMsg + 'preferBin = ' + preferBin + '<br>';
		logMsg = logMsg + 'lotno = ' + lotno + '<br>';
		logMsg = logMsg + 'lotExpiryDate = ' + lotExpiryDate + '<br>';
		logMsg = logMsg + 'blnMixItem = ' + blnMixItem + '<br>';
		logMsg = logMsg + 'blnMixLot = ' + blnMixLot + '<br>';
		logMsg = logMsg + 'poOverageCheck = ' + poOverageCheck + '<br>';
		logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - QTY', logMsg);
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				nlapiLogExecution('ERROR', 'sessionobj', sessionobj);
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){
					nlapiLogExecution('ERROR', 'Inside if enterQty', enterQty);
					if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && ((parseFloat(remQty) >= parseFloat(enterQty)) || poOverageCheck=="T"))
					{
						var containernumber=POarray["custparam_container"];
						var optedEventSend = request.getParameter('cmdSend');
						try{
							var itemfilters=new Array();
							itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
							itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							/*itemfilters.push(new nlobjSearchFilter('location','binnumber','anyof',['@NONE@',whLocation]));*/
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
							//itemfilters.push(new nlobjSearchFilter('preferredbin', null, 'is', 'T'));
							var itemcolumns= new Array();

							var itemresults= nlapiSearchRecord('item', null, itemfilters, itemcolumns);							
							nlapiLogExecution('ERROR', 'itemresults', itemresults); 
							if(itemresults == null || itemresults == '' || itemresults == 'null')
							{
								POarray["custparam_error"] = 'Entered item is inactive';
								response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
								return;
							}
							/*var vnpoLineDetails = getPOLineDetailsNew(POarray["custparam_pointernalid"],trantype,FetchedItemId,POarray["custparam_whlocation"]);
							nlapiLogExecution('ERROR', 'vnpoLineDetails', vnpoLineDetails);
							//nlapiLogExecution('ERROR', 'vnpoLineDetails', vnpoLineDetails.length);
							if(vnpoLineDetails == null || vnpoLineDetails == '' || vnpoLineDetails.length == null)
							{
								POarray["custparam_error"] = 'Entered item is deleted from the order or the transaction is completed';
								response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
								return;
							}*/
							var itemType = nswms_GetItemType(FetchedItemId, POarray["custparam_whlocation"]);
							nlapiLogExecution('ERROR', 'itemType', itemType);
							POarray["custparam_itemtype"] = itemType;
							POarray["custparam_enterQty"] = enterQty;

							if((enterBin=="" || enterBin==null || enterBin=='null') && (preferBin!="" && preferBin !=null && preferBin !='null' && preferBin !='undefined'))
							{
								enterBin = preferBin;
							}

							if(enterBin!=null && enterBin!="")
							{
								var binInternalId='';
								//var vbinInternalId='';
								//vbinInternalId=nswms_GetBinInternalId(enterBin);
								/*var vBinDetails=fnGetPutBinDetailsNew(FetchedItemId,strItemGrp,strItemFam,blnMixItem,blnMixLot,preferBin,POarray["custparam_whlocation"],itemType,lotno);
								if(vBinDetails ==null || vBinDetails == '' || vBinDetails.length == 0)
								{
									POarray["custparam_error"] = 'Please configure stage locations';
									response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
									return;
								}*/

								var systemRule=getSystemRuleValue('Stage received items before putting away?',whLocation);
								nlapiLogExecution('ERROR', 'systemRule', systemRule);
								if(systemRule==null || systemRule=='' || systemRule=='null' || systemRule=='undefined')
								{
									systemRule= 'N';
								}

								if(systemRule==null || systemRule=='' || systemRule=='N')
								{
									var stageLocArr =  new  Array();
									var stgLocId=0;
									var cols =new Array();
									cols[0] = new nlobjSearchColumn('name');
									var BinlocationTypes =  new nlapiSearchRecord('customlist_wmsse_bin_loc_type', null, null, cols);
									nlapiLogExecution('ERROR','BinlocationTypes',BinlocationTypes);
									if(BinlocationTypes != null && BinlocationTypes !='' && BinlocationTypes.length > 0)
									{

										var strName ='Stage';
										var strWipc='WIP';
										for(var b=0;b<BinlocationTypes.length;b++)
										{
											var tName= BinlocationTypes[b].getValue('name');
											nlapiLogExecution('ERROR','tName',tName);
											if(tName == strName || tName == strWipc)
											{
												stageLocArr.push(BinlocationTypes[b].getId());

											}
										}
									}

									var filter=new Array(); 
									filter.push(new nlobjSearchFilter('binnumber','null','is',enterBin));
									if(stageLocArr != null && stageLocArr.length > 0)
									{
										filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type','null','noneof',stageLocArr));	
									}
									filter.push(new nlobjSearchFilter('inactive',null,'is','F'));
									if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
										filter.push(new nlobjSearchFilter('location',null,'anyof',whLocation));
									var searchrecord=nlapiSearchRecord('Bin',null,filter,null);
									if(searchrecord!=null && searchrecord!="")
										binInternalId=searchrecord[0].getId();
									if(binInternalId=='' || binInternalId==null)
									{
										POarray["custparam_error"] = 'Please enter/scan bin location';
										response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
										return;
									}


									if(enterBin != preferBin)
									{
										if(blnMixItem!="T")
										{

											var filterStrat = new Array();

											if(FetchedItemId != null && FetchedItemId != '')
												filterStrat.push(new nlobjSearchFilter('internalid',null, 'noneof', FetchedItemId));
											if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '')
												filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', POarray["custparam_whlocation"]));
											if(binInternalId!= null && binInternalId!= '')
												filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', binInternalId));

											//var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterStrat, null);
											var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_invt_inbound',filterStrat, null);
											if(objInvDetails!=null && objInvDetails!='')
											{
												if(objInvDetails.length>0)
												{
													nlapiLogExecution('ERROR', 'Inside if objInvDetails', objInvDetails.length);
													POarray["custparam_error"] = 'This item has mix items in bins flag false choose different bin.';
													objBinDetails1=null;
													response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
													return;
												}
											}
										}

										if(blnMixLot != 'T' && (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
										{
											nlapiLogExecution('ERROR', 'Inside mixed lot', blnMixLot);

											var filterStrat = new Array();

											if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '')
												filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
											if(binInternalId!= null && binInternalId!= '')
												filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));
											if(blnMixLot != 'T' && lotno!=null && lotno!='' && lotno!='null' && lotno!='undefined')
												filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand','isnot', lotno));
											filterStrat.push(new nlobjSearchFilter('islotitem',null,'is', 'T'));
											var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);

											if(objInvDetails!=null && objInvDetails!='')
											{
												if(objInvDetails.length>0)
												{
													nlapiLogExecution('ERROR', 'Inside if objInvDetails', objInvDetails.length);
													//POarray["custparam_error"] = 'Please enter/scan valid bin location';
													POarray["custparam_error"] = 'This item has mix lots in bins flag false choose different bin.';
													objBinDetails1=null;
													response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
													return;
												}
											}
										}
									}



								}
								else
								{
									var stgLocId=0;
									var cols =new Array();
									cols[0] = new nlobjSearchColumn('name');
									var BinlocationTypes =  new nlapiSearchRecord('customlist_wmsse_bin_loc_type', null, null, cols);
									nlapiLogExecution('ERROR','BinlocationTypes',BinlocationTypes);
									if(BinlocationTypes != null && BinlocationTypes !='' && BinlocationTypes.length > 0)
									{
										var strName ='Stage';
										for(var b=0;b<BinlocationTypes.length;b++)
										{
											var tName= BinlocationTypes[b].getValue('name');
											nlapiLogExecution('ERROR','tName',tName);
											if(tName == strName)
											{
												stgLocId = BinlocationTypes[b].getId();
												break;
											}
										}
									}
									var binInternalId='';
									var filter=new Array(); 
									filter.push(new nlobjSearchFilter('binnumber','null','is',enterBin));
									if(POarray["custparam_whlocation"]!=null && POarray["custparam_whlocation"]!='')
										filter.push(new nlobjSearchFilter('location',null,'anyof',POarray["custparam_whlocation"]));
									filter.push(new nlobjSearchFilter('inactive',null,'is','F'));
									filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type','null','anyof',stgLocId));
									filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_stg_direction','null','anyof',['@NONE@', '1']));
									var searchrecord=nlapiSearchRecord('Bin',null,filter,null);
									if(searchrecord!=null && searchrecord!="")
										binInternalId=searchrecord[0].getId();


									if(binInternalId=='' || binInternalId==null)
									{
										POarray["custparam_error"] = 'Please enter/scan valid stage bin';
										response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
										return;
									}
								}
								
							}
							else
							{
								POarray["custparam_error"] = 'Please enter/scan bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
								return;
							}

							if(enterBin!=null && enterBin!='')
								POarray["custparam_enterBin"] = enterBin;
							/*else
					{
						POarray["custparam_enterBin"] = preferBin;
						enterBin=preferBin;
					}*/
							/*if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						nlapiLogExecution('ERROR', 'into lotnumberedinventoryitem', itemType);
						response.sendRedirect('SUITELET', 'customscript_wmsse_checkinlot', 'customdeploy_wmsse_checkinlot', false, POarray);
						return;
					}*/
							if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{
								nlapiLogExecution('ERROR', 'POarray["custparam_conversionrate"]', POarray["custparam_conversionrate"]);
								var convertionQty = (enterQty)*(POarray["custparam_conversionrate"]);
								nlapiLogExecution('ERROR', 'convertionQty', convertionQty);
								if(convertionQty.toString().indexOf('.') != -1)//Added if because if we click on enter button javascript code is not executing.
								{
									POarray["custparam_error"] = 'Decimal qty is not allowed for serial item';
									response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
									return;
								}
								nlapiLogExecution('ERROR', 'into serializedinventoryitem', itemType);
								response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcont_serialscan', 'customdeploy_wmsse_rcvcont_serialscan', false, POarray);
								return;
							}
							else if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
							{
								var containerRec = getPkgContainerDetails(containernumber,whLocation,POarray["custparam_pointernalid"],FetchedItemId);
								//var containerRec = nlapiLoadRecord('customrecord_coco_lc_shipping_folio',request.getParameter('hdnPoInternalId'));
								if(containerRec != null && containerRec != '' && containerRec != 'null' && containerRec.length>0)
								{
									//var itemSubListCount = containerRec.getLineItemCount('recmachcustrecord_coco_lc_line_folio_number');
									var vTotalExp=0;
									var vnenterQty=0;
									for(var j=0 ; j<containerRec.length ; j++)
									{
										var poRecList = containerRec[j];
										var lineNo = poRecList.getValue('custrecord_wmsse_trllinepkgpolineno');
										if(parseInt(lineNo) == parseInt(request.getParameter('hdnPoLineno')))
										{
											var receivedQty = poRecList.getValue('custrecord_wmsse_trllinepkgrcvdqty');
											var vExpQty = poRecList.getValue('custrecord_wmsse_trllinepkgexpqty');
											if(lotno != null && lotno !='' && lotno != 'null' && lotno != 'undefined')
											{
												var receivedLot = poRecList.getValue('custrecord_wmsse_trllinepkglot');
												nlapiLogExecution('ERROR', 'receivedLot', receivedLot);
												/*receivedLot = lotno;
												nlapiLogExecution('ERROR', 'lotno', lotno);*/
												/*if(receivedLot == null || receivedLot == '' || receivedLot == 'null')
												{
													receivedLot = lotno + "(" + enterQty + ")";
												}
												else
												{
													receivedLot = receivedLot + "," + lotno + "(" + enterQty + ")";
												}*/
												//poRecList.setFieldValue('custrecord_wmsse_trllinepkglot',receivedLot);
											}
											if(receivedQty == null || receivedQty == '' || receivedQty == 'null' || receivedQty =='undefined')
											{
												receivedQty =0;
											}
											if(vExpQty == null || vExpQty == '' || vExpQty == 'null' || vExpQty =='undefined')
											{
												vExpQty =0;
											}
											
											vTotalExp=parseFloat(vExpQty)-parseFloat(enterQty);
											
											vnenterQty = parseFloat(enterQty)+parseFloat(receivedQty);
											
											//poRecList.setFieldValue('custrecord_wmsse_trllineexpqty',vTotalExp);
											//poRecList.setFieldValue('custrecord_wmsse_trllinepkgrcvdqty',enterQty);
											var fields = new Array();
											var values = new Array();
											//fields[0] = 'custrecord_wmsse_trllinepkgexpqty';
											//values[0] = vTotalExp;
											fields[0] = 'custrecord_wmsse_trllinepkgrcvdqty';
											values[0] = vnenterQty;
											//fields[2] = 'custrecord_wmsse_trllinepkglot';
											//values[2] = receivedLot;
											var submitRecordId=nlapiSubmitField('customrecord_wmsse_trailerlinepkgs', containerRec[0].getId(), fields, values);
											nlapiLogExecution('ERROR', 'submitRecordId', submitRecordId);
										}

									}
									var containerlineRec = getContainerDetails(containernumber,whLocation,POarray["custparam_pointernalid"],FetchedItemId);
									if(containerlineRec != null && containerlineRec != '' && containerlineRec != 'null' && containerlineRec.length>0)
									{
										var fields = new Array();
										var values = new Array();
										//fields[0] = 'custrecord_wmsse_trllineexpqty';
										//values[0] = vTotalExp;
										fields[0] = 'custrecord_wmsse_trllineqtyrcvd';
										values[0] = vnenterQty;
										var submitRecordId=nlapiSubmitField('customrecord_wmsse_trailerline', containerlineRec[0].getId(), fields, values);
										nlapiLogExecution('ERROR', 'submitRecordId', submitRecordId);
									}

								}
								
							}
							else if(itemType == "inventoryitem" || itemType == "assemblyitem")
							{
								var containerRec = getContainerDetails(containernumber,whLocation,POarray["custparam_pointernalid"],FetchedItemId);
								//var containerRec = nlapiLoadRecord('customrecord_coco_lc_shipping_folio',request.getParameter('hdnPoInternalId'));
								if(containerRec != null && containerRec != '' && containerRec != 'null' && containerRec.length>0)
								{
									//var itemSubListCount = containerRec.getLineItemCount('recmachcustrecord_coco_lc_line_folio_number');																
									for(var j=0 ; j<containerRec.length ; j++)
									{
										var poRecList = containerRec[j];
										var lineNo = poRecList.getValue('custrecord_wmsse_trllinepolineno');
										nlapiLogExecution('ERROR', 'lineNo : poRecList.getValue(custrecord_wmsse_trllinepolineno)', lineNo+":"+poRecList.getValue('custrecord_wmsse_trllinepolineno'));
										if(parseInt(lineNo) == parseInt(request.getParameter('hdnPoLineno')))
										{
											var receivedQty = poRecList.getValue('custrecord_wmsse_trllineqtyrcvd');
											var vExpQty = poRecList.getValue('custrecord_wmsse_trllineexpqty');
											var vOrdQty = poRecList.getValue('custrecord_wmsse_trllineordqty');
											if(receivedQty == null || receivedQty == '' || receivedQty == 'null' || receivedQty =='undefined')
											{
												receivedQty =0;
											}
											if(vExpQty == null || vExpQty == '' || vExpQty == 'null' || vExpQty =='undefined')
											{
												vExpQty =0;
											}
											if(vOrdQty == null || vOrdQty == '' || vOrdQty == 'null' || vOrdQty =='undefined')
											{
												vOrdQty =0;
											}
											
											var vTotalExp=parseFloat(vExpQty)-parseFloat(enterQty);
											
											var vnenterQty = parseFloat(enterQty)+parseFloat(receivedQty);
											
											//poRecList.setFieldValue('custrecord_wmsse_trllineexpqty',vTotalExp);
											//poRecList.setFieldValue('custrecord_wmsse_trllineqtyrcvd',enterQty);
											var fields = new Array();
											var values = new Array();
											//fields[0] = 'custrecord_wmsse_trllineexpqty';
											//values[0] = vTotalExp;
											fields[0] = 'custrecord_wmsse_trllineqtyrcvd';
											values[0] = vnenterQty;
											var submitRecordId=nlapiSubmitField('customrecord_wmsse_trailerline', containerRec[0].getId(), fields, values);
											nlapiLogExecution('ERROR', 'submitRecordId', submitRecordId);
										}
									}
								}							
							}
							
							updateOpenTask(POarray["custparam_pointernalid"],FetchedItemId,request.getParameter('hdnPoLineno'),enterQty,binInternalId,itemType,whLocation,lotno,'','','',POarray["custparam_potext"],'','','','PUTW','','','','','purchaseorder',actualBeginTime,'','','','','','','','','','','','','','','',containernumber);
							
							UpdateRestlet('edit',POarray["custparam_pointernalid"],containernumber,request.getParameter('hdnPoLineno'),FetchedItemId,enterQty,lotno)
							
							
							nlapiLogExecution('ERROR', 'optedEventSend', optedEventSend);
							/*if(optedEventSend == 'Save (Ent)')*/
							if(optedEventSend == 'New Container')
							{							

								POarray["custparam_error"] = '';
								response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
								return;
								
							}
							else
							{
								
								nlapiLogExecution('ERROR', 'containernumber', containernumber);
								var redirectFlag="F";
								var filter1=new Array();
								if(containernumber!=null&&containernumber!=''&&containernumber!='null')
									filter1.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber',null,'anyof',containernumber));	
								
								var containerSearchResults=nlapiSearchRecord('customrecord_wmsse_trailerline','customsearch_wmsse_trlline_summary',filter1,null);
								nlapiLogExecution('ERROR', 'containerSearchResults', containerSearchResults);
								if(containerSearchResults!=null && containerSearchResults!='' && containerSearchResults!='null')
								{
									for(var b=0;b<containerSearchResults.length;b++)
									{
										var totalQty = containerSearchResults[b].getValue('custrecord_wmsse_trllineordqty',null,'sum');
										nlapiLogExecution('ERROR', 'totalQty', totalQty);
										var expQty = containerSearchResults[b].getValue('custrecord_wmsse_trllineexpqty',null,'sum');
										nlapiLogExecution('ERROR', 'expQty', expQty);
										var rcvd = containerSearchResults[b].getValue('custrecord_wmsse_trllineqtyrcvd',null,'sum');
										nlapiLogExecution('ERROR', 'rcvd', rcvd);
										var rem = parseFloat(expQty)-parseFloat(rcvd);
										nlapiLogExecution('ERROR', 'rem', rem);
										if(parseFloat(rem)>0)
										{
											redirectFlag="T";
											break;
										}
									}
								}
								nlapiLogExecution('ERROR', 'redirectFlag', redirectFlag);
								nlapiLogExecution('ERROR', 'redirectFlag', redirectFlag);
								if(redirectFlag=="T")
								{
									POarray["custparam_error"] = '';
									response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
									return;	
								}
								else
								{
									POarray["custparam_error"] = '';
									response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontscan', 'customdeploy_wmsse_rcvcontscan', false, POarray);
									return;
								}
							}


						}
						catch(e)
						{
							nlapiLogExecution('ERROR', 'inside catch exception', e);
						}
					}
					else
					{
						if(poOverageCheck=="F" && (!isNaN(enterQty) )  && (!isNaN(remQty) )  && (parseFloat(enterQty) > parseFloat(remQty)))
						{
							POarray["custparam_error"] = 'Overage receiving is not allowed';
						}
						else
						{
							POarray["custparam_error"] = 'Please enter valid qty';
						}
						//POarray["custparam_error"] = 'Please enter valid qty';
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
						return;
					}
				} 
				else {
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						POarray["custparam_error"]='';
						nlapiLogExecution('ERROR', 'into lotnumberedinventoryitem', itemType);
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlot', 'customdeploy_wmsse_rcvcontlot', false, POarray);
						return;
					}
					else if(frompolistflag == null || frompolistflag == '' || frompolistflag == 'null' || frompolistflag =='undefined')
					{
						POarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
						return;
					}
					else
					{
						POarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontpolist', 'customdeploy_wmsse_rcvcontpolist', false, POarray);
						return;
					}
				}
			}
			catch(e)
			{
				var msgstring= e.toString();
				var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
				nlapiLogExecution('ERROR', 'inside catch exception', msg);
				POarray["custparam_error"] = msg;
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty',  false, POarray);
				return;
			}
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			POarray["custparam_error"]="Transaction is in progress...";
			response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.

/*function fnGetPutBinDetailsNew(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,strLocation)
{
	var strMsg="getItemInternalId : "+getItemInternalId +"<br>" +
	"strItemGrp : " + strItemGrp + "<br>" +
	"strItemFam : " + strItemFam + "<br>" +
	"blnMixItem : " + blnMixItem + "<br>" +
	"blnMixLot : " + blnMixLot + "<br>" +
	"getPreferBin : " + getPreferBin + "<br>" +
	"strLocation : " + strLocation + "<br>" 
	nlapiLogExecution('ERROR','fnGetPutBinDetails',strMsg);
	var vBinLocArr=new Array();
	var vPutZoneArr=new Array();
	var filters = new Array();
	var columns = new Array();
	if(getItemInternalId != null && getItemInternalId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_item', null, 'anyof', ['@NONE@',getItemInternalId]));
	if(strItemGrp != null && strItemGrp != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemgroup', null, 'anyof', ['@NONE@',strItemGrp]));
	if(strItemFam != null && strItemFam != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_itemfamily', null, 'anyof', ['@NONE@',strItemFam]));
	if(strLocation != null && strLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_location', null, 'anyof', ['@NONE@',strLocation]));
	filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));


	columns[0] = new nlobjSearchColumn('custrecord_wmsse_sequence');
	columns[1] = new nlobjSearchColumn('custrecord_wmsse_putzone');	
	columns[0].setSort();

	var objPutstrategies = new nlapiSearchRecord('customrecord_wmsse_putstrategies', null, filters, columns);
	if(objPutstrategies != null && objPutstrategies != '')
	{
		for(var i=0;i<objPutstrategies.length && vBinLocArr.length<5;i++)
		{
			var strPutZone= objPutstrategies[i].getValue('custrecord_wmsse_putzone');
			if(strPutZone != null && strPutZone != '' && vPutZoneArr.indexOf(strPutZone)== -1)
			{
				vPutZoneArr.push(strPutZone);

				var filterStrat = new Array();

				nlapiLogExecution('ERROR','strPutZone',strPutZone);

				if(strPutZone != null && strPutZone != '')
					filterStrat.push(new nlobjSearchFilter('custrecord_wmsse_zone','binnumber', 'anyof', strPutZone));
				if(blnMixItem !='T' && getItemInternalId != null && getItemInternalId != '')
					filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', getItemInternalId));
				if(strLocation!= null && strLocation!= '')
					filterStrat.push(new nlobjSearchFilter('location','binnumber', 'anyof', strLocation));

				filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));


				var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_getstage_bindetails',filterStrat, null);
				if(objBinDetails != null && objBinDetails != '')
				{
					nlapiLogExecution('ERROR','objBinDetails',objBinDetails.length);
					for(var j=0;j<objBinDetails.length;j++)
					{
						var vValidBin=objBinDetails[j].getValue('binnumber');
						if(vValidBin != null && vValidBin != '' && vValidBin != getPreferBin && vBinLocArr.indexOf(vValidBin) == -1 && vBinLocArr.length<5)
							vBinLocArr.push(vValidBin);
						if(vBinLocArr.length>=5)
							break;
					}	
				}	


			}	
		}
	}
	return vBinLocArr;
}*/

function fnGetPutBinDetailsNew(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,strLocation)
{
	var strMsg="getItemInternalId : "+getItemInternalId +"<br>" +
	"strItemGrp : " + strItemGrp + "<br>" +
	"strItemFam : " + strItemFam + "<br>" +
	"blnMixItem : " + blnMixItem + "<br>" +
	"blnMixLot : " + blnMixLot + "<br>" +
	"getPreferBin : " + getPreferBin + "<br>" +
	"strLocation : " + strLocation + "<br>" ;
	nlapiLogExecution('ERROR','fnGetPutBinDetails',strMsg);
	var vBinLocArr=new Array();
	var vPutZoneArr=new Array();

	var filterStrat = new Array(); 

	/*filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', getItemInternalId));
	if(strLocation!= null && strLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location','binnumber', 'anyof', strLocation));

	filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	var columnStrat= new Array();
	columnStrat.push(new nlobjSearchColumn('custrecord_wmsse_putseq_no','binnumber'));
	columnStrat[0].setSort(true);

	var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_getstage_bindetails',filterStrat, columnStrat);*/

	if(strLocation!= null && strLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', strLocation));
	filterStrat.push(new nlobjSearchFilter('custrecord_wmsse_bin_stg_direction',null, 'anyof', ['1']));
	var objBinDetails = new nlapiSearchRecord('bin','customsearch_stage_bindetails',filterStrat, null);
	if(objBinDetails != null && objBinDetails != '')
	{
		nlapiLogExecution('ERROR','objBinDetails',objBinDetails.length);
		for(var j=0;j<objBinDetails.length;j++)
		{
			var vValidBin=objBinDetails[j].getValue('binnumber');
			nlapiLogExecution('ERROR','vValidBin',vValidBin);
			if(vValidBin != null && vValidBin != '' && vValidBin != getPreferBin && vBinLocArr.indexOf(vValidBin) == -1 && vBinLocArr.length<5)
				vBinLocArr.push(vValidBin);
			if(vBinLocArr.length>=5)
				break;
		}	
	}
	return vBinLocArr;
}

function getContainerDetails(containernumber,whLocation,pointernalid,itemId)
{
	nlapiLogExecution('ERROR', 'Inside getContainerDetails', containernumber+":"+whLocation+":"+pointernalid+":"+itemId);
	var filter = new Array();
	if(containernumber!=null && containernumber!='' && containernumber!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber',null,'anyof',containernumber));		
	if(pointernalid!=null && pointernalid!='' && pointernalid!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepono',null,'anyof',pointernalid));
	if(whLocation!=null && whLocation!='' && whLocation!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinelocation',null,'anyof',whLocation));
	if(itemId!=null && itemId!='' && itemId!='null' && itemId !='undefined')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllineitem',null,'anyof',itemId));
	
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trlnumber'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepono'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepolineno'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineqtyrcvd'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineexpqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineitem'));	
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinelocation'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineordqty'));
	var ContainerDetails = nlapiSearchRecord('customrecord_wmsse_trailerline', null, filter, columns);
	
	return ContainerDetails;
}

function getPkgContainerDetails(containernumber,whLocation,pointernalid,itemId)
{
	nlapiLogExecution('ERROR', 'Inside getPkgContainerDetails', containernumber+":"+whLocation+":"+pointernalid+":"+itemId);
	var filter = new Array();
	if(containernumber!=null && containernumber!='' && containernumber!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgcontainer',null,'anyof',containernumber));		
	if(pointernalid!=null && pointernalid!='' && pointernalid!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgpono',null,'anyof',pointernalid));
	if(whLocation!=null && whLocation!='' && whLocation!='null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgloc',null,'anyof',whLocation));
	if(itemId!=null && itemId!='' && itemId!='null' && itemId !='undefined')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgitem',null,'anyof',itemId));
	
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgcontainer'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpono'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpolineno'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgrcvdqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgexpqty'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgitem'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkglot'));
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgloc'));	
	columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgordqty'));
	var ContainerDetails = nlapiSearchRecord('customrecord_wmsse_trailerlinepkgs', null, filter, columns);

	return ContainerDetails;
}

function UpdateRestlet(Type,PoId,ContainerNo,PoLineNo,PoItem,PoItemQtyEntered,LotNo)
{

	/*var url = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=739&deploy=1';

	var cred = new credentials();
	               
	var headers = {"User-Agent-x": "SuiteScript-Call",
	               "Authorization": "NLAuth nlauth_account=" + cred.account + ", nlauth_email=" + cred.email +
	                                ", nlauth_signature= " + cred.password + ", nlauth_role=" + cred.role,
	               "Content-Type": "application/json"};
	               

	var jsonobj= {"Container":[{"Type":"edit","Location": "5",
	              "name": "TR12345",
	              "ContainerNo": "5"}],
	              "ContainerLine":[{"Type":"edit","location": "4",
	                     "ContainerNo": "5",
	                     "PONo": "120451"},
	                     {"Type":"edit","location": "4",
	                           "ContainerNo": "5",
	                           "PONo": "120451"}]};               
	//Stringifying JSON
	var myJSONText = JSON.stringify(jsonobj, replacer);
	 
	var response = nlapiRequestURL(url, myJSONText , headers,'POST');*/
	 
	       nlapiLogExecution('ERROR', 'response',response );
	 

	
	 
	
	
}
function replacer(key, value){
    if (typeof value == "number" && !isFinite(value)){
        return String(value);
   }
    return value;
}
function credentials(){
    this.email = "radhika.mukkera@ebizscm.com";
    this.account = "TSTDRV889282";
    this.role = "3";
    this.password = "nswms1";
}