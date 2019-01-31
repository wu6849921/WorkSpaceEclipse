/**
 * Script Description
 * This script is used for inventory transfer from bin location scan.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan from bin location for Inventory transfer process
 */
function RFInventoryITBIN(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('DEBUG', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');
		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');
		var POArray = new Array();
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whTOLocation = request.getParameter('custparam_towhlocation');
		var whTOLocationName = request.getParameter('custparam_towhlocationname');
		whLocationName = nlapiLookupField('location', whLocation, 'name');
		whTOLocationName = nlapiLookupField('location', whTOLocation, 'name');
		nlapiLogExecution('DEBUG', 'whLocation', whLocation);
		nlapiLogExecution('DEBUG', 'whTOLocation', whTOLocation);
		var whCompany= request.getParameter('custparam_company');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmappinginvt(currentscriptid,vbarcodecompstring,getItemType);			
		}

		var lottext = request.getParameter('custparam_lotno');
		var getTotQty = request.getParameter('custparam_scantotqty');
		if(getTotQty == null || getTotQty =='' || getTotQty == 'null' || getTotQty == undefined || getTotQty == 0)
		{
			getTotQty = '';
		}
		if(lottext == null || lottext =='' || lottext == 'null' || lottext == undefined)
		{
			lottext = '';
		}
		var vInvTrnsId=request.getParameter('custparam_ITId');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));

		var makeInvAvailFlag = request.getParameter('custparam_makeinventoryavailflag');
		var inventoryStatusFeature = nlapiGetContext().getFeature('inventorystatus');
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

		var getPageCount = request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		nlapiLogExecution('DEBUG','getPageCount_123', getPageCount);

		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();
		//itemcolumns.push(new nlobjSearchColumn('preferredbin'));
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		/*itemcolumns.push(new nlobjSearchColumn('binnumber'));
		itemcolumns.push(new nlobjSearchColumn('name'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_item'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_lot'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemgroup'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemfamily'));	
		itemcolumns.push(new nlobjSearchColumn('stockunit'));
		itemcolumns.push(new nlobjSearchColumn('unitstype'));
		itemcolumns.push(new nlobjSearchColumn('location','binnumber'));*/
		if(departments == true)
			itemcolumns.push(new nlobjSearchColumn('department'));
		if(classes == true)
			itemcolumns.push(new nlobjSearchColumn('class'));
		//itemcolumns[0].setSort(true);

		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inventory_itemdetails', itemfilters, itemcolumns);
		var strItemGrp="";
		var strItemFam="";
		var blnMixItem="F";
		var blnMixLot="F";
		var getPreferBin="";
		var blnItemUnit="";
		var VUnitType ="";
		var Vdepartment ="";
		var Vclass ="";
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
			blnItemUnit = itemresults[0].getText('stockunit');
			VUnitType = itemresults[0].getValue('unitstype');
			if(departments == true)
				Vdepartment = itemresults[0].getValue('department');
			if(classes == true)
				Vclass = itemresults[0].getValue('class');
			vClassification = itemresults[0].getValue('locationinvtclassification');
		}
		itemresults=null;
		itemcolumns=null;
		itemfilters=null;

		var getStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
		var uomresults= new Array();
		var results='';
		var addbtnimgUrl='';
		var delbtnimgUrl='';
		nlapiLogExecution('DEBUG', 'VUnitType', VUnitType);
		if(VUnitType != null && VUnitType != '')
		{	
			var vBaseUOMSearch=getBaseUnitRate(VUnitType);

			vBaseUnit='Base unit';
			nlapiLogExecution('DEBUG', 'vBaseUOMSearch', vBaseUOMSearch);
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
				vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
				nlapiLogExecution('DEBUG', 'vConversionRate,vBaseUnit,blnItemUnit', vConversionRate+','+vBaseUnit+','+blnItemUnit);
			}

			if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
			}
			nlapiLogExecution('DEBUG', 'getStockConversionRate', getStockConversionRate);

			results= getUnitsType(VUnitType);
			nlapiLogExecution('DEBUG', 'results', results);
			if(results != null && results != '' && results != 'null' && results != 'undefined')
			{
				for(var Cnt=0; Cnt < results.length; Cnt++)
				{
					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					var row = [UOMText+"_"+vQty];
					uomresults.push(row);
				}

				var imgfilefound1=  getLoadFile('Plus.png');
				if(imgfilefound1)
				{
					addbtnimgUrl = imgfilefound1.getURL();
					nlapiLogExecution('DEBUG', 'imgUrl', addbtnimgUrl);
				}

				var imgfilefound2 =  getLoadFile('minus.png');
				if(imgfilefound2)
				{
					delbtnimgUrl = imgfilefound2.getURL();
					nlapiLogExecution('DEBUG', 'imgUrl', delbtnimgUrl);
				}
			}
		}

		vUnits = blnItemUnit;
		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		var vUnitsText="";
		if(parseFloat(getStockConversionRate) != 1 && vBaseUnit != "")
			vUnitsText = 'In '+ vBaseUnit;
		if(parseFloat(getStockConversionRate) == 1)
			vBaseUnit="";
		nlapiLogExecution('DEBUG', 'getStockConversionRate', getStockConversionRate); 
		var objBinDetails=null;
		var AllowAllLots = 'T';
		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		nlapiLogExecution('DEBUG', 'makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect); 
		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && 
				qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}
		if(getItemType == "inventoryitem" || getItemType == "assemblyitem" || getItemType == "serializedinventoryitem" || 
				getItemType=="serializedassemblyitem")
		{
			nlapiLogExecution('DEBUG', 'Inside if itemType', getItemType);
//			objBinDetails=fnGetPickBinDetails(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,
//					Vclass,'','','',getPageCount,makeInvAvailFlagFromSelect,getItemType,VUnitType,blnItemUnit,vConversionRate);
			objBinDetails=fnGetPickBinDetails(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,
					Vclass,'','','',getPageCount,makeInvAvailFlagFromSelect,getItemType,VUnitType,blnItemUnit,vConversionRate,null,vClassification);

		}
		else
		{
			nlapiLogExecution('DEBUG', 'Inside else itemType', getItemType);

//			objBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,
//					Vclass,'','','',getPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,vConversionRate,'',AllowAllLots);
			objBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,
					Vclass,'','','',getPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,vConversionRate,'',AllowAllLots,vClassification);
		}
		nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('DEBUG', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-IT Inventory';
		var st1 = 'Inventory Transfer - From Bin';
		if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
		{
			st1 = 'Inventory Transfer - From Bin Lot#';
		}
		if (CSSfilefound) 
		{ 
			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('DEBUG', 'CSSurl', CSSurl); 
		}

		CSSurl=CSSurl.replace(/&/g,"&amp;");

		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			nlapiLogExecution('DEBUG', 'imgUrl', imgUrl);
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		var JSSurl ='';
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			nlapiLogExecution('DEBUG', 'JSSurl', JSSurl); 
		}

		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_it_frombin'); 
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


		html=html+"<script type='text/javascript'>function DisplayBin_IT(val,qtyavail) {var reWhiteSpace ='';var selecteduomqtyArr = new Array();" +
		"var enteredQty =0;" +
		"var ConvertQty=document.getElementById('hdngetStockConversionRate').value;var uomTbl = document.getElementById('tblUOM');" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount = uomTbl.rows.length;" +
		"for(var r=0;r<rowcount;r++){var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;" +
		"if(qty=='' || isNaN(qty) || parseFloat(qty)<=0){" +
		"if(qty==''){"+
		"document.getElementById('div_error').innerHTML ='Please enter qty';}else{" +
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';}" +
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();" +
		"return false;}" +
		"var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;" +
		"if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';" +
		"document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].focus();" +
		"return false;}" +
		"var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr);" +
		"enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom));if(document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value <= 0.000000005 ){document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}" +
		"document.getElementById('hdnselecteduomswithqty').value=selecteduomqtyArr;" +
		"document.getElementById('hdntotaluomqtyentered').value = enteredQty;qty=enteredQty;}" +
		"else{" +
		"var qty = document.getElementById('txtqty').value; reWhiteSpace = qty.indexOf(' ') >= 0;if(document.getElementById('txtqty').value <= 0.000000005 ){document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';document.getElementById('txtqty').focus();	return false;}}" +		
		" var itemtype=document.getElementById('hdnItemType').value; if(qty ==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter  qty';" +		
		"var uomTbl = document.getElementById('tblUOM');" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		"document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{" +
		"document.getElementById('txtqty').value='';document.getElementById('txtqty').focus();}return false;}" +
		"else if(isNaN(qty) || parseFloat(qty)<=0 || (reWhiteSpace == true)){" +
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';" +
		"var uomTbl = document.getElementById('tblUOM');" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		"document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{" +
		"document.getElementById('txtqty').value='';document.getElementById('txtqty').focus();}return false;" +
		"}" +
		"else if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){ " +
		" var ConvertQty=document.getElementById('hdngetStockConversionRate').value; " +
		"if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){if(parseFloat(document.getElementById('txtqty').value) >= 0.000001){var conversionQty=enteredQty;" +
		"if(conversionQty.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}else{if(document.getElementById('txtqty').value.toString().indexOf('.') != -1){" +
		"document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}document.getElementById('txtqty').focus();" +
		"}else{var rowcount1 = uomTbl.rows.length;var rowInd = parseInt(rowcount1)-1;if(parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value) >= 0.000001){var conversionQty=parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value)*(ConvertQty);" +
		"if(conversionQty.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}else{" +
		"if(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();}}" +
		"else if(itemtype == 'lotnumberedinventoryitem' || itemtype=='lotnumberedassemblyitem'){" +
		"if(document.getElementById('txtlot').value == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan lot#';document.getElementById('txtlot').focus();return false;}" +
		"}" +
		"document.getElementById('txtbin').value=val;document.getElementById('hdnqtyAvail').value=qtyavail;document.forms['_rf_it_frombin'].submit();" +
		"document.getElementById('loading').style.display = ''; }" +		
		" </script>"+
		"	<script type='text/javascript'>function validateForm_IT() {" +
		"var selecteduomqtyArr = new Array();" +
		"var ConvertQty=document.getElementById('hdngetStockConversionRate').value;" +			
		"var uomTbl = document.getElementById('tblUOM');var enteredQty =0;" +
		" if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount = uomTbl.rows.length;" +
		"for(var r=0;r<rowcount;r++){" +
		"var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;" +
		"if(qty==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter qty';" +
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();" +
		"return false;" +
		"}" +
		"else {if(isNaN(qty) || parseFloat(qty)<=0){"+
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';"+
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;"+	
		"}}"+
		"var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;if(uom==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter uom';" +
		"document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].focus();return false;}" +
		"var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr); " +
		"enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom)); if(document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value <= 0.000000005 ){document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}" +
		"document.getElementById('hdnselecteduomswithqty').value=selecteduomqtyArr;" +
		"var scannedqty=parseFloat(enteredQty)/parseFloat(ConvertQty);}" +
		"else{" +
		"enteredQty = document.getElementById('txtqty').value;if(document.getElementById('txtqty').value <= 0.000000005 ){document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';document.getElementById('txtqty').focus();	return false;}}" +
		"if(enteredQty == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter qty';" +
		"var uomTbl = document.getElementById('tblUOM');" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		"document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{" +
		"document.getElementById('txtqty').value='';document.getElementById('txtqty').focus();}return false;}" +
		"else{var scannedqty=enteredQty;" +
		"if((isNaN(scannedqty) || parseFloat(scannedqty)<=0)  ){" +
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';" +
		"var uomTbl = document.getElementById('tblUOM');" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		"document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{" +
		"document.getElementById('txtqty').value='';document.getElementById('txtqty').focus();}return false;}" +
		"}" +
		"var itemtype=document.getElementById('hdnItemType').value;" +
		" if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){" +
		"if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){if(parseFloat(document.getElementById('txtqty').value) >= 0.000001){var conversionQty=enteredQty;" +
		"if(conversionQty.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}else{if(document.getElementById('txtqty').value.toString().indexOf('.') != -1){" +
		"document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}document.getElementById('txtqty').focus();" +
		"}else{var rowcount1 = uomTbl.rows.length;var rowInd = parseInt(rowcount1)-1;if(parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value) >= 0.000001){var conversionQty=parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value)*(ConvertQty);" +
		"if(conversionQty.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}else{" +
		"if(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();}}" +

		"else if(itemtype == 'lotnumberedinventoryitem' || itemtype=='lotnumberedassemblyitem'){" +
		"if(document.getElementById('txtlot').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';document.getElementById('txtlot').focus();return false;}" +
		"} " +
		"if(document.getElementById('txtbin').value == '' && (document.getElementById('hdnPreferBin').value == '')){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan bin location'; document.getElementById('txtbin').focus();return false;}  else{" +		
		"document.getElementById('hdntotaluomqtyentered').value = enteredQty;" +
		"}}</script>";

		html = html + "	<script type='text/javascript'>function validateItem(usedBins,vpoitem) {if(usedBins == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item ' +vpoitem+ ' to receive.';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;

		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";

		html = html +"	<form name='_rf_it_frombin' method='POST'>"+ 

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>" + st1 + "</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+

		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>From Warehouse Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>To Warehouse Location: <label>" + whTOLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdntoWhLocation' value=" + whTOLocation + ">"+	
		"				<input type='hidden' name='hdntoWhLocationName' value='" + whTOLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value=" + blnItemUnit + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdnItemType' id='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnVUnitType' id='VUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdnITId' value=" + vInvTrnsId + ">"+	
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnvUnitsText' id='hdnvUnitsText' value='" + vUnitsText + "'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+	
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+
		"				<input type='hidden' name='hdninventoryStatusFeature' value=" + inventoryStatusFeature + ">"+
		"				<input type='hidden' name='hdnmakeInvAvailFlagFromSelect' value=" + makeInvAvailFlagFromSelect + ">"+
		"				<input type='hidden' name='hdnmakeinvtflagavail' id='hdnmakeinvtflagavail' value='" + makeInvAvailFlagFromSelect + "'>"+
		"				<input type='hidden' name='hdnqtyAvail' id='hdnqtyAvail'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>";

		if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
		{
			html = html + "			<tr>"+
			"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#"+	
			"				</td>"+
			"			</tr>"+
			"			<tr>"+
			"			<td align = 'left'>";
			html = html +" <input name='txtlot'  class='smalltextbox'  id='txtlot'  type='text' value = '"+lottext+"'/>";

			html = html +"</td>"+

			"	</tr>"+
			"				<td align = 'left'><input name='txtlot'  class='smalltextbox'  id='txtstatus' type='hidden'/>"+
			"				</td></tr>";
		}


		if(results !=null &&  results !='' && results.length>0)
		{
			var selectedUomStr = request.getParameter('custparam_uomqtyselected');
			nlapiLogExecution('DEBUG', 'selectedUomStr', selectedUomStr);
			html=html+"<tr> <td class='labelmsg'>Qty to Transfer</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{				
				nlapiLogExecution('DEBUG', 'inside', selectedUomStr);

				html = html +"<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox' id='txtqty0' type='text' value = '"+getTotQty+"' /></td><td></td>";

				for(var Cnt=0; Cnt < results.length; Cnt++)
				{
					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					if(Cnt==0)
					{
						html = html +"<td><select id='uomlist"+Cnt+"' class='labelmsg'  name = 'uomlist"+Cnt+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";
					}						
					if(blnItemUnit !=null && blnItemUnit !='' && blnItemUnit!='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -' && blnItemUnit == UOMText)
					{
						html = html +" <option value="+vQty+" selected >"+UOMText +" </option>";
					}
					else
					{
						html = html +" <option value="+vQty+"  >"+UOMText +" </option>";
					}

				}

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+null+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr></table>";	
			}
			else
			{
				nlapiLogExecution('DEBUG', 'else', selectedUomStr);
				var uomQtyArr = selectedUomStr.split(',');
				var uomsArr = new Array();
				for(var u=0;u<uomQtyArr.length;u++)
				{
					var arr = uomQtyArr[u].split('_');

					var uom  = arr[1];
					uomsArr.push(uom);
				}
				html = html +"			<tr><td><table id='tblUOM'>";
				for(var u=0;u<uomQtyArr.length;u++)
				{
					var arr = uomQtyArr[u].split('_');

					var qty = arr[0];
					var uom  = arr[1];

					html = html +"<tr><td align = 'left'><input name='txtqty"+u+"'  class='smalltextbox'  id='txtqty"+u+"' type='text' value="+qty+"></input></td><td></td>";
					html = html +"<td><select id='uomlist"+u+"' class='labelmsg'  name = 'uomlist"+u+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";
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
						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+null+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr>";
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
			html = html + "			<tr>";
			if(vUnitsText !=null && vUnitsText !='' && vUnitsText!='null' && vUnitsText !='undefined' && vUnitsText !='- None -')
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty "+ vUnitsText;
			}
			else
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty " ;
			}
			html = html +"				</td>"+	 

			"			</tr>"+
			"			<tr>"+
			"<td align = 'left'>";

			html= html+"<input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>";

			html= html+"</td></tr>";

		}

		html = html +"<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan From Bin Location"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		"				</td>"+
		"			</tr></table>"+


		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm_IT();'/>"+

		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm_IT();'/></td>"+
		"			</tr></table>";


		if((objBinDetails!=null && objBinDetails!='')||
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{
			html = html + 	"<table  class='uomstatus-gridgap'>";			
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

			if(inventoryStatusFeature != null && inventoryStatusFeature != '' && inventoryStatusFeature != 'null' && 
					inventoryStatusFeature != 'undefined' && inventoryStatusFeature != false)
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
				nlapiLogExecution('DEBUG', 'selectedUOM1', selectedUOM);
				for(var Cnt1=0; Cnt1 < results.length; Cnt1++)
				{                    	 
					var vUOM = results[Cnt1].getValue('conversionrate');
					var UOMText =results[Cnt1].getValue('unitname');

					if(( (selectedUOM == null && getStockConversionRate == vUOM) || (selectedUOM == '' && getStockConversionRate == vUOM)  
							|| (selectedUOM =='null' && getStockConversionRate == vUOM) || (selectedUOM =='undefined'  && getStockConversionRate == vUOM )
							|| (selectedUOM == undefined && getStockConversionRate == vUOM) )|| (selectedUOM == vUOM))
					{
						nlapiLogExecution('DEBUG', 'selectedUOM', selectedUOM);
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

			if(inventoryStatusFeature != null && inventoryStatusFeature != '' && inventoryStatusFeature != 'null' && 
					inventoryStatusFeature != 'undefined' && inventoryStatusFeature != false)
			{
				var statusOptsArr = getStatusOptions();
				html = html +"<td ><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
				if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
				{
					nlapiLogExecution('DEBUG', 'makeInvAvailFlag', makeInvAvailFlag); 

					for(var Cnt2=0; Cnt2 < statusOptsArr.length; Cnt2++)
					{                    	 
						var val = statusOptsArr[Cnt2][0];
						var StatusText =statusOptsArr[Cnt2][1];


						if(makeInvAvailFlag == val)
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
			"				<td>Bin"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";
			if(inventoryStatusFeature != null && inventoryStatusFeature != '' && inventoryStatusFeature != 'null' && 
					inventoryStatusFeature != 'undefined' && inventoryStatusFeature != false)
			{
				html = html +"				<td></td>";
				html = html +	"				<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}
			if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
			{
				html = html +	"			<td></td><td>Lot#";	
				html = html +"				</td>";
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';	
			var convRate = 1;
			var selectedInvUOM = request.getParameter('custparam_uomprevselected');
			if(selectedInvUOM != null && selectedInvUOM != '' && selectedInvUOM !='null' && selectedInvUOM !='undefined' && 
					selectedInvUOM != undefined )
			{
				convRate =getStockCoversionRate(VUnitType,blnItemUnit,selectedInvUOM);
			}

			for (var s = 0; s < objBinDetails.length; s++) {
				if(s%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var txtBin='';
				var binAvailQty=0;
				var binLot='';
				var invStatus='';
				var currValues = objBinDetails[s];

				if(getItemType == "inventoryitem" || getItemType == "assemblyitem" || getItemType == "serializedinventoryitem" || 
						getItemType=="serializedassemblyitem")
				{
					txtBin = currValues[0];
					binAvailQty =Big(currValues[1]).mul(convRate);	
					invStatus = currValues[4];
				}
				else
				{
					txtBin = currValues[0];
					binAvailQty =Big(currValues[1]).mul(convRate);	
					if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
					{
						binLot = currValues[3];
					}
					invStatus = currValues[6];
				}

				nlapiLogExecution('DEBUG', 'getPreferBin, txtBin', getPreferBin+","+txtBin);
				var linkBin =txtBin;
				if(getPreferBin == txtBin)
				{
					txtBin=txtBin+ "<span style='color:red;'>* </span>";
				}
				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td><a  onclick='return DisplayBin_IT(\""+linkBin+"\",\""+binAvailQty+"\",\""+invStatus+"\");' href='#' >"+txtBin;	
				html = html +"				</a></td>";
				html = html +"				<td class='align-right'>"+parseFloat(parseFloat(binAvailQty).toFixed(8));	
				html = html +"				</td>";
				if(inventoryStatusFeature != null && inventoryStatusFeature != '' && inventoryStatusFeature != 'null' && 
						inventoryStatusFeature != 'undefined' && inventoryStatusFeature != false)
				{
					html = html +"				<td></td>";
					html = html +"				<td  class='status-cl-display'>"+invStatus;	
					html = html +"				</td>";
				}
				if(binLot!=null && binLot!='')
				{
					html = html +"				<td></td><td>"+binLot;	
					html = html +"				</td>";
				}
				html = html +"			</tr>";

				if(s >=4)
					break;
			}
			html = html + "	</table>"+	
			"				<input type='hidden' name='hdngetPageCount' id='hdngetPageCount' value=" + getPageCount + ">";

		}
		else
		{
			nlapiLogExecution('DEBUG', 'INSIDE RF');
			POArray["custparam_error"] = 'There is no inventory available for this item';
			POArray["custparam_whlocation"] = whLocation;
			POArray["custparam_whlocationname"] = whLocationName;
			POArray["custparam_towhlocation"] = whTOLocation;
			response.sendRedirect('SUITELET', 'customscript_wmsse_it_item_scan', 'customdeploy_wmsse_it_item_scan', false, POArray);
			return;
		}
		html = html +"		<table>	<tr>";
		if(getPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"				<td width='20px'></td>";
		nlapiLogExecution('EMERGENCY', 'objBinDetails, parseInt(getPageCount)', objBinDetails.length+","+parseInt(getPageCount));
		if((( objBinDetails != null && objBinDetails !='') &&(objBinDetails.length)) >= (6))
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>"+			

		"</form>";
		if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")	
		{
			html = html + "<script type='text/javascript'>document.getElementById('txtlot').focus();</script>";
		}
		else
		{
			if(results ==null ||  results =='' || results == 'null')
			{
				html = html + "<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
			}
			else
			{
				html = html +"<script type='text/javascript'>setFocus();</script>";
			}
		}
		objBinDetails=null;
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('DEBUG', 'Processing RF', 'Validating From BIN');
		var POarray = new Array();
		var enterQty=request.getParameter('txtqty');
		nlapiLogExecution('DEBUG', 'enterQty',enterQty);
		var inventoryStatusFeature = request.getParameter('hdninventoryStatusFeature');
		if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
		{
			enterQty = request.getParameter('hdntotaluomqtyentered');
			POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			nlapiLogExecution('DEBUG', 'POarray["custparam_uomqtyselected"]',POarray["custparam_uomqtyselected"]);
			nlapiLogExecution('DEBUG', 'enterQty1',enterQty);

		}
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		if(POarray["custparam_stockconversionrate"] != null && POarray["custparam_stockconversionrate"] != 'null' && 
				POarray["custparam_stockconversionrate"] != ''&& enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined' && !isNaN(enterQty))
		{
			nlapiLogExecution('DEBUG', ' enterQty',enterQty);
			enterQty = Big(enterQty).div(POarray["custparam_stockconversionrate"]);
			nlapiLogExecution('DEBUG', ' converted enterQty',enterQty);
		}
		// Forming the temporary array POarray		
		var VUnitType = request.getParameter('hdnVUnitType');
		var stockUnit = request.getParameter('hdnblnItemUnit');
		var enterBin=request.getParameter('txtbin');	
		var AvailqtyforBin=request.getParameter('hdnqtyAvail');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_whlocationname"] = request.getParameter('hdnvUnitsText');//hdnvUnitsText
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_fetcheditemname"]=request.getParameter('hdnItemName');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		POarray["custparam_towhlocation"] = request.getParameter('hdntoWhLocation');
		POarray["custparam_makeinventoryavailflag"] = request.getParameter('hdnmakeInvAvailFlagFromSelect');
		POarray["custparam_scantotqty"]=Number(enterQty);
		POarray["custparam_towhlocationname"] = request.getParameter('hdntoWhLocationName');


		nlapiLogExecution('DEBUG', ' POarray["custparam_scantotqty"]',POarray["custparam_scantotqty"]);
		POarray["custparam_scanlot"] = request.getParameter('txtlot');
		POarray["custparam_lotno"] = request.getParameter('txtlot');
		POarray["custparam_ITId"] =request.getParameter('hdnITId');
		POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		var makeInvAvailFlagFromSelect = request.getParameter('hdnmakeinvtflagavail');
		POarray["custparam_uom"] = request.getParameter('hdnuom');
		POarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		var lotno= request.getParameter('txtlot');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var itemType=request.getParameter('hdnItemType');
		var whLocation=POarray["custparam_whlocation"];
		var preferBin=request.getParameter('hdnPreferBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var vEnteredTotQty = enterQty;

		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var logMsg = 'LocationId = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'LocationName = ' + POarray["custparam_whlocationname"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_itemtype"] = ' + POarray["custparam_itemtype"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_fetcheditemid"] = ' + POarray["custparam_fetcheditemid"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_fetcheditemname"] = ' + POarray["custparam_fetcheditemname"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_lotno"] = ' + POarray["custparam_lotno"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'vEnteredTotQty = ' + vEnteredTotQty + '<br>';
		nlapiLogExecution('DEBUG', 'Processing RF - BIN', logMsg);

		var isFromStatusChange = request.getParameter('hdnfromstatuschange');
		nlapiLogExecution('DEBUG', 'isFromStatusChange', isFromStatusChange);
		var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
		POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
		if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined'
			&& isFromStatusChange != undefined && isFromStatusChange=='T' )
		{
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
			return;
		}

		if(request.getParameter('cmdNextList')=="Next")
		{
			POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+1;
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
			return;
		}
		if(request.getParameter('cmdPrevList')=="Prev")
		{
			POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-1;
			POarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
			return;
		}

		var selectedStatus;
		var selectedStatusName;
		// Processing only if the 'Previous' button is not pressed


		if(optedEvent != 'Back (F7)')
		{
			try
			{
				nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);
				if((enterBin == null || enterBin == '')&& preferBin != null && preferBin != '')
					enterBin=preferBin;
				if(enterBin != null && enterBin!="") 
				{
					nlapiLogExecution('DEBUG', 'enterBin', enterBin);
					nlapiLogExecution('DEBUG', 'preferBin', preferBin);

					var binInternalId = nswms_ValidateEnteredBin(enterBin,whLocation);
					if(binInternalId==null || binInternalId=='')
					{
						POarray["custparam_error"] = 'Please enter/scan valid from bin location';
						response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
						nlapiLogExecution('DEBUG', 'No Item scanned ', '');
						return;
					}
					else
					{
						nlapiLogExecution('DEBUG', 'inventoryStatusFeatureqqqqqqq', inventoryStatusFeature);
						if(inventoryStatusFeature == true || inventoryStatusFeature == 'true')
						{
							var EntLotId;
							//to Validate given Lot
							var filterStratforlot = new Array();

							if(binInternalId != null && binInternalId != '')
								filterStratforlot.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
							filterStratforlot.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
							filterStratforlot.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
							filterStratforlot.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
							if(lotno!= null && lotno!= '')
								filterStratforlot.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', lotno));

							var columnStrat=new Array();
							columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));

							var objBinDetails_item = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStratforlot, columnStrat);
							if(objBinDetails_item!=null && objBinDetails_item!='' && objBinDetails_item!='null' && 
									objBinDetails_item!='undefined' && objBinDetails_item!=undefined)
							{
								EntLotId=objBinDetails_item[0].getValue('inventorynumber','inventoryNumberBinOnHand');
								nlapiLogExecution('DEBUG', 'EntLotId TEST', EntLotId);
							}

							var lotInternalId;
							nlapiLogExecution('DEBUG', 'inventoryStatusFeature', inventoryStatusFeature);
							POarray["custparam_fromBinId"] = binInternalId;
							if(enterBin!=null && enterBin!='')
								POarray["custparam_fromBin"] = enterBin;
							var objBinDetails=null;
							var availableQty=0;
							if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" || 
									itemType=="serializedassemblyitem")
							{
								if(itemType == "inventoryitem" || itemType=="assemblyitem")
									var objBinDetails = fnGetInventoryBalanceDetails(POarray["custparam_whlocation"],FetchedItemId,binInternalId,
											makeInvAvailFlagFromSelect);
								if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
									var objBinDetails = fnGetInventoryBalanceDetailsSerials(POarray["custparam_whlocation"],FetchedItemId,binInternalId,
											makeInvAvailFlagFromSelect);


								nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails);
							}
							else
							{
								nlapiLogExecution('DEBUG', 'itemType itemType', itemType);
								nlapiLogExecution('DEBUG', 'itemType FetchedItemId', FetchedItemId);
								nlapiLogExecution('DEBUG', 'itemType whLocation', whLocation);
								nlapiLogExecution('DEBUG', 'itemType binInternalId', binInternalId);
								nlapiLogExecution('DEBUG', 'itemType lotno', lotno);
								nlapiLogExecution('DEBUG', 'itemType makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect);

								var objBinDetails = [];
								var result=nlapiLoadSearch('InventoryBalance', 'customsearch_wmsse_inventorybalance');

								if(FetchedItemId != null && FetchedItemId != '')
									result.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
								if(binInternalId !=null && binInternalId!='')
									result.addFilter(new nlobjSearchFilter('binnumber',null, 'is', binInternalId));
								if(whLocation!= null && whLocation!= '')
									result.addFilter(new nlobjSearchFilter('location',null, 'anyof', whLocation));
								if(EntLotId!= null && EntLotId!= '')
									result.addFilter(new nlobjSearchFilter('inventorynumber',null, 'anyof', EntLotId));

								nlapiLogExecution('DEBUG', 'makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect);
								if(makeInvAvailFlagFromSelect != null && makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'null' &&
										makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined )
								{
									if(makeInvAvailFlagFromSelect == 'T' || makeInvAvailFlagFromSelect == 'F')
									{
										result.addFilter(new nlobjSearchFilter('inventoryavailable','inventorystatus', 'is', makeInvAvailFlagFromSelect));
									}
									else
									{
										if(makeInvAvailFlagFromSelect != 'All')
										{
											result.addFilter(new nlobjSearchFilter('status',null, 'anyof', makeInvAvailFlagFromSelect));	
										}
									}
								}

								var resLen = result.runSearch();
								var srhIterator = 0;
								var resultSet = resLen.forEachResult(function(searchResult)
										{
									srhIterator++;
									objBinDetails.push(searchResult);
									if(parseFloat(srhIterator) == 4000)
									{
										return false;
									}
									return true;              
										});
								if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' ||
										objBinDetails.length == null)
								{
									POarray["custparam_error"] = 'Please enter/scan lot # with valid bin combination';
									response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
									return;
								}
							}
							if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' || 
									objBinDetails.length == null)
							{
								POarray["custparam_error"] = 'Please enter/scan valid bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
								return;
							}
							else
							{
								if(objBinDetails.length > 0)
								{
									selectedStatus = objBinDetails[0].getValue('status');
									selectedStatusName = objBinDetails[0].getText('status');
									POarray['custparam_enteredstatus'] = selectedStatus;
									POarray['custparam_enteredstatusName'] = selectedStatusName;
									nlapiLogExecution('DEBUG', 'objBinDetails.length',objBinDetails.length); 
									var vmakeInvAvailFlag = "T";
									var fields = ['makeinventoryavailable'];
									var vLocDetails= nlapiLookupField('location',whLocation,fields);
									vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
									nlapiLogExecution('DEBUG', 'vmakeInvAvailFlag',vmakeInvAvailFlag); 
									nlapiLogExecution('DEBUG', 'itemType!!!!!!!!!!!',itemType); 
									if(itemType == "inventoryitem" || itemType=="assemblyitem")
									{		
										var vOpenPickDetails=getOPenTaskPickBinDetails(FetchedItemId,binInternalId,whLocation,VUnitType,stockUnit);
										var vOpenPickQty=0;
										var vBinOpenTaskBinQtyArr = "";
										if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
										{
											vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
											vOpenPickQty = vBinOpenTaskBinQtyArr[0];
										}
										if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
											vOpenPickQty =0;
										nlapiLogExecution('DEBUG', 'vOpenPickQty',vOpenPickQty);

										for(var p=0;p<objBinDetails.length;p++)
										{
											if(vmakeInvAvailFlag == "T")
												var vBinQtyAvail=objBinDetails[p].getValue('available');
											else
												var vBinQtyAvail=objBinDetails[p].getValue('onhand');
											var vBinText=objBinDetails[p].getText('binnumber');
											nlapiLogExecution('DEBUG', 'vBinQtyAvail',vBinQtyAvail); 
											nlapiLogExecution('DEBUG', 'vBinText',vBinText); 
											if(vBinQtyAvail > 0)
											{
												availableQty=Big(availableQty).plus(vBinQtyAvail);
											}
										}

										availableQty = Big(availableQty).minus(vOpenPickQty);


									}
									else
										if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
										{		
											var vOpenPickDetails=getOPenTaskPickBinDetails(FetchedItemId,binInternalId,whLocation,VUnitType,stockUnit);
											var vOpenPickQty=0;
											var vBinOpenTaskBinQtyArr = "";
											if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
											{
												vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
												vOpenPickQty = vBinOpenTaskBinQtyArr[0];
											}
											if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
												vOpenPickQty =0;
											nlapiLogExecution('DEBUG', 'vOpenPickQty',vOpenPickQty);
											nlapiLogExecution('DEBUG', 'objBinDetails.length..........',objBinDetails.length);
											for(var p=0;p<objBinDetails.length;p++)
											{
												if(vmakeInvAvailFlag == "T")
													var vBinQtyAvail=objBinDetails[p].getValue('available',null,'sum');
												else
													var vBinQtyAvail=objBinDetails[p].getValue('onhand',null,'sum');
												var vBinText=objBinDetails[p].getText('binnumber',null,'group');
												nlapiLogExecution('DEBUG', 'vBinQtyAvail',vBinQtyAvail); 
												nlapiLogExecution('DEBUG', 'vBinText',vBinText); 
												if(vBinQtyAvail > 0)
												{
													availableQty=Big(availableQty).plus(vBinQtyAvail);
												}
											}

											availableQty = Big(availableQty).minus(vOpenPickQty);


										}
										else
										{
											var vOpenPickDetails=getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,whLocation,VUnitType,stockUnit);
											var vBinOpenLotArr="";
											if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
											{
												vBinOpenLotArr = vOpenPickDetails[3];
											}
											nlapiLogExecution('DEBUG', 'objBinDetails.length',objBinDetails.length);
											for(var p=0;p<objBinDetails.length;p++)
											{
												if(vmakeInvAvailFlag == "T")
													var vBinQtyAvail=objBinDetails[p].getValue('available',null,'sum');
												else
													var vBinQtyAvail=objBinDetails[p].getValue('onhand',null,'sum');
												var vBinText=objBinDetails[p].getText('binnumber',null,'group');

												var vInvLot=objBinDetails[p].getText('inventorynumber',null,'group');
												var vInvLotID=objBinDetails[p].getValue('inventorynumber',null,'group');
												nlapiLogExecution('DEBUG', 'vInvLot',vInvLot);
												nlapiLogExecution('DEBUG', 'vInvLotID',vInvLotID);
												lotInternalId=vInvLotID;
												var vOpenPickQty=0;
												for(var m=0;m<vBinOpenLotArr.length;m++)
												{ 
													var vOpenLot=vOpenPickDetails[3][m];
													if(vInvLot==vOpenLot)
													{
														vOpenPickQty=vOpenPickDetails[1][m];
														break;
													} 
												}
												if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
													vOpenPickQty =0;
												nlapiLogExecution('DEBUG', 'vOpenPickQty',vOpenPickQty);
												nlapiLogExecution('DEBUG', 'vBinQtyAvail else',vBinQtyAvail);
												nlapiLogExecution('DEBUG', 'vBinText else',vBinText);
												vBinQtyAvail = Big(vBinQtyAvail).minus(vOpenPickQty);
												if(vBinQtyAvail > 0)
												{
													availableQty=Big(availableQty).plus(vBinQtyAvail);
												}
											}

											if((parseFloat(availableQty))<=0  || (lotno != vInvLot))
											{
												POarray["custparam_error"] = 'Insufficient inventory for this lot#: '+lotno;
												response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
												return;
											}
										}
									nlapiLogExecution('DEBUG', 'getStockConversionRate',getStockConversionRate); 
									nlapiLogExecution('DEBUG', 'getStockConversionRate',getStockConversionRate); 
									nlapiLogExecution('DEBUG', 'availableQty',availableQty); 
									nlapiLogExecution('DEBUG', 'vEnteredTotQty',vEnteredTotQty); 

									if(availableQty <= 0 || parseFloat(availableQty) < parseFloat(vEnteredTotQty))
									{
										POarray["custparam_error"] = 'Available qty for this bin location is zero/less than entered qty.';
										response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
										return;
									}
								}

							}
							if(enterBin!=null && enterBin!='')
								POarray["custparam_fromBin"] = enterBin;

							POarray["custparam_lotavailableqty"] = Number(availableQty);

							POarray["custparam_FromAvailableqty"] = Number(availableQty);
							objBinDetails=null;

							nlapiLogExecution('DEBUG', 'inventoryStatusFeature ', inventoryStatusFeature);
							if(inventoryStatusFeature == true || inventoryStatusFeature == 'true')
							{
								nlapiLogExecution('DEBUG', 'binInternalId ', binInternalId);
								var objBinStatusDetails =null;
								var invfilterStrat =  new Array();
								if(POarray["custparam_whlocation"] != null && POarray["custparam_whlocation"] != '')
									invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', POarray["custparam_whlocation"]));
								if(FetchedItemId != null && FetchedItemId != '')
									invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
								if(binInternalId!= null && binInternalId!= '')
									invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
								if(lotInternalId != null && lotInternalId != '')
									invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', lotInternalId));
								invfilterStrat.push(new nlobjSearchFilter('available',null, 'greaterthan', 0));

								var searchName = 'customsearch_wmsse_inventorybalance';
								if(itemType == "inventoryitem" || itemType == "assemblyitem")
								{
									searchName = 'customsearch_wmsse_invtbalance_invt_item';
								}
								else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") 
								{
									searchName = 'customsearch_wmsse_invtbalance_serialsrh';
								}

								objBinStatusDetails = new nlapiSearchRecord('InventoryBalance',searchName,invfilterStrat, null);
								nlapiLogExecution('DEBUG', 'objBinStatusDetails', objBinStatusDetails);
							}

							nlapiLogExecution('DEBUG', 'objBinStatusDetails', objBinStatusDetails);
							if(inventoryStatusFeature == true|| inventoryStatusFeature == 'true')
							{
								if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && 
										objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined && objBinStatusDetails.length > 0)
								{
									POarray["custparam_enteredBinID"]=binInternalId;
									POarray["custparam_enteredbin"]=enterBin;
									POarray["custparam_scanlot"]=lotInternalId;
									if(itemType == "inventoryitem" || itemType == "assemblyitem")
									{
										selectedStatus = objBinStatusDetails[0].getValue('status');
										selectedStatusName = objBinStatusDetails[0].getText('status');

									}
									else
									{
										selectedStatus = objBinStatusDetails[0].getValue('status',null,'group');
										selectedStatusName = objBinStatusDetails[0].getText('status',null,'group');
									}
									nlapiLogExecution('DEBUG', 'objBinStatusDetails.length', objBinStatusDetails.length);

									POarray['custparam_enteredstatus'] = selectedStatus;
									POarray['custparam_enteredstatusName'] = selectedStatusName;
									if(objBinStatusDetails.length > 1)
									{
										response.sendRedirect('SUITELET', 'customscript_wmsse_it_status_scan', 'customdeploy_wmsse_it_status_scan', false, POarray);
										return;  
									}
									else
									{
										if(itemType == "inventoryitem" || itemType == "assemblyitem")
										{
											selectedStatus = objBinStatusDetails[0].getValue('status');
											selectedStatusName = objBinStatusDetails[0].getText('status');
										}
										else
										{
											selectedStatus = objBinStatusDetails[0].getValue('status',null,'group');
											selectedStatusName = objBinStatusDetails[0].getText('status',null,'group');
										}

										nlapiLogExecution('DEBUG', 'selectedStatus', selectedStatus);
									}
								}
							}


							POarray["custparam_error"] = '';
							POarray["custparam_enteredstatus"] = selectedStatus;
							POarray["custparam_enteredstatusName"] = selectedStatusName;
							response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
							nlapiLogExecution('DEBUG', 'redirecting to Bin Scanning', '');
							return;

						}
						else
						{
							POarray["custparam_fromBinId"] = binInternalId;
							var objBinDetails=null;

							var availableQty=0;
							if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" || 
									itemType=="serializedassemblyitem")
							{
								nlapiLogExecution('DEBUG', 'itemType', itemType);
								var filterStrat = new Array();

								if(FetchedItemId != null && FetchedItemId != '')
									filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
								if(whLocation!= null && whLocation!= '')
									filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', whLocation));
								if(binInternalId!= null && binInternalId!= '')
									filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', binInternalId));
								objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_invt_inbound',filterStrat, null);
							}
							else
							{
								nlapiLogExecution('DEBUG', 'itemType else', itemType);
								var filterStrat = new Array();

								if(FetchedItemId != null && FetchedItemId != '')
									filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
								if(whLocation!= null && whLocation!= '')
									filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', whLocation));
								if(binInternalId!= null && binInternalId!= '')
									filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));
								if(lotno != null && lotno != '' && lotno != 'null')
								{
									filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', lotno));
								}

								objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots_rpt',filterStrat, null);
								if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' || 
										objBinDetails.length == null)
								{
									POarray["custparam_error"] = 'Please enter/scan lot # with valid bin combination';
									response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
									return;
								}
							}
							if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' || 
									objBinDetails.length == null)
							{
								POarray["custparam_error"] = 'Please enter/scan valid bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
								return;
							}
							else
							{
								if(objBinDetails.length > 0)
								{
									nlapiLogExecution('DEBUG', 'objBinDetails.length',objBinDetails.length); 
									var vmakeInvAvailFlag = "T";
									var fields = ['makeinventoryavailable'];
									var vLocDetails= nlapiLookupField('location',whLocation,fields);
									vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
									nlapiLogExecution('DEBUG', 'vmakeInvAvailFlag',vmakeInvAvailFlag); 
									if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" || 
											itemType=="serializedassemblyitem")
									{		
										var vOpenPickDetails=getOPenTaskPickBinDetails(FetchedItemId,binInternalId,whLocation,
												objBinDetails[0].getValue('unitstype'),objBinDetails[0].getText('stockunit'));
										var vOpenPickQty=0;
										var vBinOpenTaskBinQtyArr = "";
										if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
										{
											vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
											vOpenPickQty = vBinOpenTaskBinQtyArr[0];
										}
										if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
											vOpenPickQty =0;
										nlapiLogExecution('DEBUG', 'vOpenPickQty',vOpenPickQty);
										for(var p=0;p<objBinDetails.length;p++)
										{
											if(vmakeInvAvailFlag == "T")
												var vBinQtyAvail=objBinDetails[p].getValue('quantityavailable','binonhand');
											else
												var vBinQtyAvail=objBinDetails[p].getValue('quantityonhand','binonhand');
											var vBinText=objBinDetails[p].getText('binnumber','binonhand');
											nlapiLogExecution('DEBUG', 'vBinQtyAvail',vBinQtyAvail); 
											nlapiLogExecution('DEBUG', 'vBinText',vBinText); 
											vBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPickQty));
											if(vBinQtyAvail > 0)
											{
												availableQty=Number(Big(availableQty).plus(vBinQtyAvail));
											}
											
										}

									}
									else
									{
										var vOpenPickDetails=getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,whLocation,
												objBinDetails[0].getValue('unitstype'),objBinDetails[0].getText('stockunit'));
										var vBinOpenLotArr="";
										if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
										{
											vBinOpenLotArr = vOpenPickDetails[3];
										}
										for(var p=0;p<objBinDetails.length;p++)
										{
											if(vmakeInvAvailFlag == "T")
												var vBinQtyAvail=objBinDetails[p].getValue('quantityavailable','inventoryNumberBinOnHand');
											else
												var vBinQtyAvail=objBinDetails[p].getValue('quantityonhand','inventoryNumberBinOnHand');
											var vBinText=objBinDetails[p].getText('binnumber','inventoryNumberBinOnHand');
											var vInvLot=objBinDetails[p].getText('inventorynumber','inventoryNumberBinOnHand');
											var vOpenPickQty=0;
											for(var m=0;m<vBinOpenLotArr.length;m++)
											{ 
												var vOpenLot=vOpenPickDetails[3][m];
												if(vInvLot==vOpenLot)
												{
													vOpenPickQty=vOpenPickDetails[1][m];
													break;
												} 
											}
											if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
												vOpenPickQty =0;
											nlapiLogExecution('DEBUG', 'vOpenPickQty',vOpenPickQty);
											nlapiLogExecution('DEBUG', 'vBinQtyAvail else',vBinQtyAvail);
											nlapiLogExecution('DEBUG', 'vBinText else',vBinText);
											vBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPickQty));
											if(vBinQtyAvail > 0)
											{
												availableQty=Big(availableQty).plus(vBinQtyAvail);
											}
										}

									}
									nlapiLogExecution('DEBUG', 'getStockConversionRate',getStockConversionRate); 
									nlapiLogExecution('DEBUG', 'wqeqiygwfahurtwscaEWDWA',vEnteredTotQty,availableQty);
									if(availableQty <= 0 || parseFloat(availableQty) < parseFloat(vEnteredTotQty))
									{
										POarray["custparam_error"] = 'Available qty for this bin location is zero/less than entered qty.';
										response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
										return;
									}
								}
							}
							if(enterBin!=null && enterBin!='')
								POarray["custparam_fromBin"] = enterBin;

							POarray["custparam_FromAvailableqty"] = Number(availableQty);
							objBinDetails=null;

							POarray["custparam_error"] = '';
							response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
							nlapiLogExecution('DEBUG', 'redirecting to Bin Scanning', '');
							return;
						}

					}

				}			 	
				else 
				{
					POarray["custparam_error"] = 'Please enter/scan valid from bin location';
					response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
					nlapiLogExecution('DEBUG', 'No Item scanned ', '');
					return;
				}

			}
			catch(e)
			{
				POarray["custparam_error"]=e.toString();
				response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
				return;
			}		

		} 
		else 
		{
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_it_item_scan', 'customdeploy_wmsse_it_item_scan', false, POarray);
			return;		
		}
	} //end of first if condition
} //end of function.

function nswms_ValidateEnteredBin(Binnumber,whLocation)
{
	var bininternalId='';
	var filter=new Array(); 
	if(Binnumber!=null && Binnumber!='' && Binnumber!='null' && Binnumber!='undefined')
		filter.push(new nlobjSearchFilter('binnumber',null,'is',Binnumber));
	filter.push(new nlobjSearchFilter('inactive',null, 'is','F'));
	if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
		filter.push(new nlobjSearchFilter('location',null,'anyof',whLocation));
	var columns= new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_bin_loc_type'); 
	columns[1] = new nlobjSearchColumn('custrecord_wmsse_bin_stg_direction'); 
	var searchrecord=nlapiSearchRecord('Bin',null,filter,columns);
	if(searchrecord!=null && searchrecord!="")
	{	
		var vLocationType=searchrecord[0].getText('custrecord_wmsse_bin_loc_type');
		var vStageDirType=searchrecord[0].getText('custrecord_wmsse_bin_stg_direction');
		nlapiLogExecution('DEBUG','vLocationType',vLocationType);
		if(vLocationType != 'WIP' && vStageDirType !='Out')
			bininternalId=searchrecord[0].getId();
	}

	filter=null;
	searchrecord=null;
	filtersku=null;
	searchitemrecord=null;

	return bininternalId;
}


function fnGetInventoryBalanceDetails(whLocation,vIntId,binInternalId,makeInvAvailFlagFromSelect)
{
	var invfilterStrat =  new Array();
	if(whLocation != null &&whLocation != '')
		invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
	if(vIntId != null && vIntId != '')
		invfilterStrat.push(new nlobjSearchFilter('internalid','item','anyof', vIntId));
	if(binInternalId!= null && binInternalId!= '')
		invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
	if(makeInvAvailFlagFromSelect != null && makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'null' &&
			makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined )
	{
		if(makeInvAvailFlagFromSelect == 'T' || makeInvAvailFlagFromSelect == 'F')
		{
			invfilterStrat.push(new nlobjSearchFilter('inventoryavailable','inventorystatus', 'is', makeInvAvailFlagFromSelect));

		}
		else
		{
			if(makeInvAvailFlagFromSelect != 'All')
			{
				invfilterStrat.push(new nlobjSearchFilter('status',null, 'anyof', makeInvAvailFlagFromSelect));	

			}
		}
	}

	var objBinStatusDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_invtbalance_invt_item',invfilterStrat, null);
	return objBinStatusDetails;

}

function fnGetInventoryBalanceDetailsSerials(whLocation,vIntId,binInternalId,makeInvAvailFlagFromSelect)
{
	var invfilterStrat =  new Array();
	if(whLocation != null &&whLocation != '')
		invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
	if(vIntId != null && vIntId != '')
		invfilterStrat.push(new nlobjSearchFilter('internalid','item','anyof', vIntId));
	if(binInternalId!= null && binInternalId!= '')
		invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
	if(makeInvAvailFlagFromSelect != null && makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'null' &&
			makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined )
	{
		if(makeInvAvailFlagFromSelect == 'T' || makeInvAvailFlagFromSelect == 'F')
		{
			invfilterStrat.push(new nlobjSearchFilter('inventoryavailable','inventorystatus', 'is', makeInvAvailFlagFromSelect));
		}
		else
		{
			if(makeInvAvailFlagFromSelect != 'All')
			{
				invfilterStrat.push(new nlobjSearchFilter('status',null, 'anyof', makeInvAvailFlagFromSelect));	
			}
		}
	}

	var objBinStatusDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh',invfilterStrat, null);
	return objBinStatusDetails;
}

/*
 * This function will return the Composite Bar Code Component mapping details to the current page/script.
 * TODO - We need to revisit this function.
 */
function getcomponentmappinginvt(scriptid,barcodecomponentsstring,itemtype)
{
	nlapiLogExecution('DEBUG','barcodecomponentsstring', barcodecomponentsstring);
	var barcodecomponents=JSON.parse(barcodecomponentsstring);

	var compmappingarr = new Array();

	if(barcodecomponents!=null && barcodecomponents!='')
	{
		var filters = new Array();

		filters.push(new nlobjSearchFilter('custrecord_barcode_pagescriptid','custrecord_barcode_mappingpage', 'is',scriptid));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

		var columns=new Array();
		columns[0] = new nlobjSearchColumn('custrecord_barcode_mappingcomponent');
		columns[1] = new nlobjSearchColumn('custrecord_barcode_mappinginputfieldtype');
		columns[2] = new nlobjSearchColumn('custrecord_barcode_mappingfieldposition');

		var srchbccomponentmapping = nlapiSearchRecord('customrecord_barcode_componentmapping','customsearch_wmsse_barcodecomp_mapping', filters,columns);

		if(srchbccomponentmapping!=null && srchbccomponentmapping!='')
		{
			for (srchitr=0;srchitr<srchbccomponentmapping.length;srchitr++)
			{
				var vfieldtype = srchbccomponentmapping[srchitr].getText('custrecord_barcode_mappinginputfieldtype');
				var vfieldposition = srchbccomponentmapping[srchitr].getValue('custrecord_barcode_mappingfieldposition');
				var vcomponentname = srchbccomponentmapping[srchitr].getText('custrecord_barcode_mappingcomponent');
				var vcomponentvalue ='';
				if(!isempty(barcodecomponents[vcomponentname]))
					vcomponentvalue = barcodecomponents[vcomponentname];

				var logMsg = 'vfieldtype = ' + vfieldtype + '<br>';
				logMsg = logMsg + 'vfieldposition = ' + vfieldposition + '<br>';
				logMsg = logMsg + 'vcomponentname = ' + vcomponentname + '<br>';
				logMsg = logMsg + 'vcomponentvalue = ' + vcomponentvalue + '<br>';

				nlapiLogExecution('DEBUG', 'Component Mapping Details', logMsg);

				if(itemtype != "lotnumberedinventoryitem" && itemtype!="lotnumberedassemblyitem")
				{
					if(vcomponentname!='Lot')
					{
						if(vcomponentname=='Quantity')
							vfieldposition=parseInt(vfieldposition)-1;

						var currow = [vfieldtype+'$'+vfieldposition+'$'+vcomponentvalue];
						compmappingarr.push(currow);
					}
				}
				else
				{

					var currow = [vfieldtype+'$'+vfieldposition+'$'+vcomponentvalue];
					compmappingarr.push(currow);
				}
			}
		}
	}

	return compmappingarr;
}
