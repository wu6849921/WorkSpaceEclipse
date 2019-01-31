
/**
 * Script Description
 * This script is used for scan bin for Inventory Status Change process
 */
/***************************************************************************
 Copyright � 2018,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to change inventory status in inventory status change process
 */
function RFInvStatusChangeStatusChange(request, response){
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

		var html = '';
		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whCompany= request.getParameter('custparam_company');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var availableQty=request.getParameter('custparam_availableqty');
		var availableqtyDetail=request.getParameter('custparam_availableqtyDetail');
		var enteredBin=request.getParameter('custparam_enterBin');
		var blnMixItem=request.getParameter('custparam_blnmixitem');
		var blnMixLot=request.getParameter('custparam_blnmixlot'); 
		var getPreferBin=request.getParameter('custparam_preferbin');
		var vInvLotId=request.getParameter('custparam_vInvLotId');
		var vUnitsText=request.getParameter('custparam_unitstext');
		var vBaseUnit=request.getParameter('custparam_baseunit');
		var VUnitType=request.getParameter('custparam_itemunitstype');
		var blnItemUnit=request.getParameter('custparam_itemunits');
		var getStockConversionRate=request.getParameter('hdngetStockConversionRate');
		var invtstatus = request.getParameter('custparam_enteredstatus');
		var invtstatusName = request.getParameter('custparam_invtstatusName');
		var availableLotQty=request.getParameter('custparam_lotavailableqty');
		var eneteredBinId = request.getParameter('custparam_enteredBinID');
		var enteredLot=request.getParameter('custparam_enteredlot');// this is lotid
		var statusScreenflag = request.getParameter('custparam_statusflag');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var makeInvAvailFlag = request.getParameter('custparam_makeinventoryavailflag');

		var getStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
		var uomresults= new Array();
		var results='';
		var addbtnimgUrl='';
		var delbtnimgUrl='';

		if(VUnitType != null && VUnitType != '')
		{	
			var vBaseUOMSearch=getBaseUnitRate(VUnitType);

			vBaseUnit='Base unit';
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

		var objBinDetails=null;
		var AllowAllLots = 'T';
		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' 
			&& qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}

		var logMsg = 'invtstatus = ' + invtstatus + '<br>';
		logMsg = logMsg + 'invtstatusName = ' + invtstatusName + '<br>';
		logMsg = logMsg + 'availableQty = ' + availableQty + '<br>';
		logMsg = logMsg + 'availableLotQty = ' + availableLotQty + '<br>';
		logMsg = logMsg + 'getPreferBin = ' + getPreferBin + '<br>';
		logMsg = logMsg + 'eneteredBinId = ' + eneteredBinId + '<br>';
		logMsg = logMsg + 'lotno = ' + lotno + '<br>';
		logMsg = logMsg + 'vInvLotId = ' + vInvLotId + '<br>';
		logMsg = logMsg + 'statusScreenflag = ' + statusScreenflag + '<br>';
		logMsg = logMsg + 'makeInvAvailFlag = ' + makeInvAvailFlag + '<br>';
		logMsg = logMsg + 'makeInvAvailFlagFromSelect = ' + makeInvAvailFlagFromSelect + '<br>';
		logMsg = logMsg + 'blnMixItem = ' + blnMixItem + '<br>';
		logMsg = logMsg + 'blnMixLot = ' + blnMixLot + '<br>';
		logMsg = logMsg + 'VUnitType = ' + VUnitType + '<br>';
		logMsg = logMsg + 'blnItemUnit = ' + blnItemUnit + '<br>';
		logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
		logMsg = logMsg + 'getItemInternalId = ' + getItemInternalId + '<br>';
		logMsg = logMsg + 'getFetchedItemName = ' + getFetchedItemName + '<br>';
		logMsg = logMsg + 'VUnitType = ' + VUnitType + '<br>';
		logMsg = logMsg + 'getStockConversionRate = ' + getStockConversionRate + '<br>';
		logMsg = logMsg + 'vBaseUnit = ' + vBaseUnit + '<br>';
		logMsg = logMsg + 'vUnitsText = ' + vUnitsText + '<br>';
		logMsg = logMsg + 'qtyUOMCtrlSelectedVal = ' + qtyUOMCtrlSelectedVal + '<br>';
		logMsg = logMsg + 'qtyUomCntrlSelectedConversionRate = ' + qtyUomCntrlSelectedConversionRate + '<br>';

		nlapiLogExecution('ERROR', 'Processing status change get method- change status', logMsg);

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
		var st0 = domainName + '-Inventory Status';
		var st1 = 'Inventory Status - Change Status';
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
		" var ConvertQty=document.getElementById('hdngetStockConversionRate').value;  " +
		 /*var conversionQty=(qty)*(ConvertQty); " +
		if(conversionQty.toString().indexOf('.') != -1){ " +
		document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';" +
		var uomTbl = document.getElementById('tblUOM');" +
		if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{" +
		document.getElementById('txtqty').value='';
		document.getElementById('txtqty').focus();}return false;}}" +*/
				
		"if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){if(parseFloat(document.getElementById('txtqty').value) >= 0.000001){var conversionQty=(qty)*(ConvertQty);" +
		"if(conversionQty.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}else{if(document.getElementById('txtqty').value.toString().indexOf('.') != -1){ " +
		"document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}document.getElementById('txtqty').focus(); " +
		"}else{var rowcount1 = uomTbl.rows.length;var rowInd = parseInt(rowcount1)-1;if(parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value) >= 0.000001){var conversionQty=parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value)*(ConvertQty); " +
		"if(conversionQty.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}else{ " +
		"if(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();}}" +
		"else if(itemtype == 'lotnumberedinventoryitem' || itemtype=='lotnumberedassemblyitem'){" +
		"if(document.getElementById('txtlot').value == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan lot#';document.getElementById('txtlot').focus();return false;}" +
		"}" +
		"document.getElementById('txtbin').value=val;document.getElementById('hdnqtyAvail').value=qtyavail;document.forms['_rf_it_frombin'].submit();" +
		" document.getElementById('loading').style.display = ''; }" +	
		" </script>"+


			"<script type='text/javascript'>function validateForm_IT() {" +
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
		 /*var conversionQty=enteredQty;
		 alert(conversionQty); if(conversionQty.toString().indexOf('.') > 0){" +
		document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';" +
		var uomTbl = document.getElementById('tblUOM');" +
		if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		var rowcount1 = uomTbl.rows.length;var rowind = parseInt(rowcount1)-1;" +
		document.getElementById('tblUOM').rows[rowind].cells[0].childNodes[0].focus();}else{" +
		document.getElementById('txtqty').value='';document.getElementById('txtqty').focus();}return false;" +
		}}" +
*/			" if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){if(parseFloat(document.getElementById('txtqty').value) >= 0.000001){var conversionQty=enteredQty;" +
			"	if(conversionQty.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}else{if(document.getElementById('txtqty').value.toString().indexOf('.') != -1){" +
			"	document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}document.getElementById('txtqty').focus();" +
			"	}else{var rowcount1 = uomTbl.rows.length;var rowInd = parseInt(rowcount1)-1;if(parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value) >= 0.000001){var conversionQty=parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value)*(ConvertQty);" +
			"	if(conversionQty.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}else{" +
			"	if(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();}}" +
		/*"else if(itemtype == 'lotnumberedinventoryitem' || itemtype=='lotnumberedassemblyitem'){" +
		"if(document.getElementById('txtlot').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';document.getElementById('txtlot').focus();return false;}" +
		"} " +*/
		"document.getElementById('hdntotaluomqtyentered').value = enteredQty;" +
		"var jspreviousStatusId = document.getElementById('hdnenetedstatusid').value;" +
		"var jsrevisedStatusId = document.getElementById('inventorystatuslist').value;" +
		"if(jspreviousStatusId == jsrevisedStatusId){" +
		"document.getElementById('div_error').innerHTML ='You must change the status to a different value.';" +
		"return false;}" +
		"document.getElementById('hdntotaluomqtyentered').value = enteredQty;" +
		"var jspreviousStatusId = document.getElementById('hdnenetedstatusid').value;" +
		"var jsrevisedStatusId = document.getElementById('inventorystatuslist').value;" +
		"if(jspreviousStatusId == jsrevisedStatusId){" +
		"document.getElementById('div_error').innerHTML ='You must change the status to a different value.';" +
		"return false;}" +
		"var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}"+
		"}</script>";



		html = html + "	<script type='text/javascript'>function validateItem(usedBins,vpoitem) {if(usedBins == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item ' +vpoitem+ ' to receive.';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		"	<script type='text/javascript'>function validateForm() { if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;}else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_it_frombin'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_it_frombin'].cmdSend.disabled=true;document.forms['_rf_it_frombin'].cmdPrevious.disabled=true; return true;}}}</script>";
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
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+
		"				<input type='hidden' name='hdnlotavailableqty' value=" + availableLotQty + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' id='hdnItemType' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnAvailableQty1' id='hdnAvailableQty1' value=" + availableLotQty + ">"+
		"				<input type='hidden' name='hdnAvailableQty' id='hdnAvailableQty' value=" + availableQty + ">"+
		"				<input type='hidden' name='hdnavailableqtyDetail' id='hdnavailableqtyDetail' value=" + availableqtyDetail + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnenteredbin' id='hdnenteredbin' value='" +enteredBin+"' >"+
		"				<input type='hidden' name='hdnenteredbinid' id='hdnenteredbinid' value='" +eneteredBinId+"' >"+
		"				<input type='hidden' name='hdnenteredqty' id='hdnenteredqty' value='" +availableQty+"' >"+
		"				<input type='hidden' name='hdnlotno' id='hdnlotno' value='" + lotno + "'>"+
		"				<input type='hidden' name='hdnlotid' id='hdnlotid' value=" + enteredLot + ">"+
		"				<input type='hidden' name='hdnenetedstatus' id='hdnenetedstatus' value=" + invtstatusName + ">"+
		"				<input type='hidden' name='hdnenetedstatusid' id='hdnenetedstatusid' value=" + invtstatus + ">"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnvUnitsText' id='hdnvUnitsText' value='" + vUnitsText + "'>"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+	
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+	
		"				<input type='hidden' name='hdnStatusScanQuantity' id='hdnStatusScanQuantity' value='" + availableQty + "'>"+
		"				<input type='hidden' name='hdnvInvLotId' id='hdnvInvLotId' value='" + vInvLotId + "'>"+
		"				<input type='hidden' name='hdnselectedqty' id='hdnselectedqty'>"+	
		"				<input type='hidden' name='hdnstatusScreen' id='hdnstatusScreen' value='" + statusScreenflag + "'>"+
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				</td>"+
		"			</tr>";

		html = html + "			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enteredBin + "</label>"+
		"			</tr>"+


		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Available Qty: <label>" + parseFloat(availableLotQty) + " " + blnItemUnit + "</label>"+
		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Previous Status: <label>" + invtstatusName + "</label>"+
		"			</tr>";


		if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
		{
			html = html + "			<tr>"+
			"				<td align = 'left' class='labelmsg'>Lot#: <label>" + lotno + "</label>"+
			"			</tr>";


		}
		if(results !=null &&  results !='' && results.length>0)
		{
			var selectedUomStr = request.getParameter('custparam_uomqtyselected');
			nlapiLogExecution('DEBUG', 'selectedUomStr', selectedUomStr);
			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				nlapiLogExecution('DEBUG', 'inside', selectedUomStr);
				html = html +"			<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox'  id='txtqty0'  type='text' /></td><td></td>";
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
				html = html +"			<tr><td><table id='tblUOM'  >";
				for(var u=0;u<uomQtyArr.length;u++)
				{
					var arr = uomQtyArr[u].split('_');

					var qty = arr[0];
					var uom  = arr[1];

					html = html +"<tr><td align = 'left'><input name='txtqty"+u+"'  class='smalltextbox'  id='txtqty"+u+"' type='text' ></input></td><td></td>";
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
			"				<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>"+
			"				</td>"+
			"			</tr>";

		}
		var invtStatusArr = getDefaultInventoryStatusList(null,-1,null);
		invtStatusArr = multiDimensionalUnique(invtStatusArr);
		html = html+"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Revised Status"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";


		//html = html +"<td><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
		html = html +"<td><select id='inventorystatuslist' name='inventorystatuslist' class='labelmsg'>" ;

		if(invtStatusArr !=null &&  invtStatusArr !='' && invtStatusArr.length>0)
		{
			for(var statusItr=0; statusItr < invtStatusArr.length; statusItr++)
			{                    	 
				var statusVal = invtStatusArr[statusItr][1];
				var statusText =invtStatusArr[statusItr][0];

				if(invtstatus == statusVal)
				{
					html = html +" <option   selected  value="+statusVal+"> "+statusText+"</option>";

				}
				else
				{
					html = html +" <option     value="+statusVal+"> "+statusText+"</option>";
				}

			}
		}
		html =html+ "<tr>"+
		"<input type='hidden' name='hdnrevisedStatusText' id = 'hdnrevisedStatusText' value='" + statusText + "'>"+	
		"<input type='hidden' name='hdnrevisedStatus' id = 'hdnrevisedStatus' value='" + statusVal + "'>"+	
		"</tr>";

		html = html +"</table>"+


		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm_IT();'/>"+

		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm_IT();'/></td>"+
		"			</tr></table>";



		"</form>";
		/*if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")	
		{
			html = html + "<script type='text/javascript'>document.getElementById('txtlot').focus();</script>";
		}
		else
		{*/
			if(results ==null ||  results =='' || results == 'null')
			{
				html = html + "<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
			}
			else
			{
				html = html +"<script type='text/javascript'>setFocus();</script>";
			}
		//}
		//objBinDetails=null;
		html = html + "</body>"+
		"</html>";

		response.write(html);
	}
	else {

		nlapiLogExecution('DEBUG', 'Processing RF', 'Change Inventory Status');
		var POarray = new Array();
		var enterQty=request.getParameter('txtqty');
		nlapiLogExecution('DEBUG', 'enterQty',enterQty);

		if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
		{
			enterQty = request.getParameter('hdntotaluomqtyentered');
			POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			nlapiLogExecution('DEBUG', 'request.getParameter(hdntotaluomqtyentered)',request.getParameter('hdntotaluomqtyentered'));
			nlapiLogExecution('DEBUG', 'enterQty1',enterQty);
			/*if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined')
			{
				enterQty = parseFloat(enterQty).toFixed(5);

			}*/
		}
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		if(POarray["custparam_stockconversionrate"] != null && POarray["custparam_stockconversionrate"] != 'null' 
			&& POarray["custparam_stockconversionrate"] != '' && enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined' && !isNaN(enterQty))
		{
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
		POarray["custparam_unitstext"] = request.getParameter('hdnvUnitsText');//hdnvUnitsText
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_fetcheditemname"]=request.getParameter('hdnItemName');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		POarray["custparam_makeinventoryavailflag"] = request.getParameter('hdnmakeInvAvailFlagFromSelect');
		POarray["custparam_enteredBinID"] = request.getParameter('hdnenteredbinid');
		POarray["custparam_lotno"] = request.getParameter('hdnlotno');
		POarray["custparam_enteredlot"] = request.getParameter('hdnlotid');
		POarray["custparam_unitstext"] = request.getParameter('hdnvUnitsText');	
		POarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
		POarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');//
		var makeInvAvailFlagFromSelect = request.getParameter('hdnmakeinvtflagavail');
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		POarray["custparam_enterBin"] = request.getParameter('hdnenteredbin');
		POarray["custparam_availableqty"] = request.getParameter('hdnAvailableQty');
		POarray["custparam_availableqtyDetail"] = request.getParameter('hdnavailableqtyDetail');
		POarray["custparam_statusflag"] = request.getParameter('hdnstatusScreen');

		var previousstatusText = request.getParameter('hdnenetedstatus');
		var previousstatus = request.getParameter('hdnenetedstatusid');
		var revisedStatus = request.getParameter('inventorystatuslist');
		var revisedStatusText = request.getParameter('inventorystatuslist');

		POarray["custparam_invtstatusName"] = request.getParameter('hdnenetedstatus');
		POarray["custparam_revisedStatusid"] = request.getParameter('inventorystatuslist');
		POarray["custparam_enteredstatus"] = request.getParameter('hdnenetedstatusid');
		POarray["custparam_lotavailableqty"] = request.getParameter('hdnlotavailableqty');
		POarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;
		var availableQty=request.getParameter('hdnAvailableQty1');

		/*if(availableQty != null && availableQty != '' && availableQty != 'null' && availableQty != 'undefined')
		{
			availableQty = (parseFloat(availableQty) * parseFloat(getStockConversionRate)).toFixed(5);
		}
		 */

		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var itemType=request.getParameter('hdnItemType');
		var whLocation=POarray["custparam_whlocation"];
		var preferBin=request.getParameter('hdnPreferBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var vEnteredTotQty = enterQty;

		var logMsg = 'LocationId = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'LocationName = ' + POarray["custparam_whlocationname"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_itemtype"] = ' + POarray["custparam_itemtype"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_fetcheditemid"] = ' + POarray["custparam_fetcheditemid"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_fetcheditemname"] = ' + POarray["custparam_fetcheditemname"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_invtstatusName"] = ' + POarray["custparam_invtstatusName"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_enteredstatus"] = ' + POarray["custparam_enteredstatus"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_revisedStatusid"] = ' + POarray["custparam_revisedStatusid"] + '<br>';
		logMsg = logMsg + 'revisedStatusText = ' + revisedStatusText + '<br>';
		logMsg = logMsg + 'availableQty = ' + availableQty + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'getStockConversionRate = ' + getStockConversionRate + '<br>';
		logMsg = logMsg + 'POarray["custparam_availableqty"] = ' + POarray["custparam_availableqty"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_availableqtyDetail"] = ' + POarray["custparam_availableqtyDetail"] + '<br>';


		nlapiLogExecution('DEBUG', 'logs for inv status in RF post - change status', logMsg);

		var selectedStatus='';
		var selectedStatusName='';
		// Processing only if the 'Previous' button is not pressed
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				if(optedEvent != 'Back (F7)'){

					var invstatusid='';
					var invstatusname ='';
					var tavailableQty=0;

					if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && parseFloat(availableQty) >= parseFloat(enterQty))
					{
						if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
						{
							POarray["custparam_error"] = '';

							POarray["custparam_enterQty"]=Number(Big(enterQty).mul(getStockConversionRate));
							response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_seri_scan', 'customdeploy_wmsse_invstchange_seri_scan', false, POarray);
							return;
						}
						else if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
						{
							var invstschangeqtyQty = Number((Big(enterQty).mul(getStockConversionRate)).toFixed(8));
							var inventoryStatusChangeId='';

							inventoryStatusChangeId= inventoryStatusChange(itemType,POarray["custparam_whlocation"],
									POarray["custparam_whlocationname"],FetchedItemId,POarray["custparam_fetcheditemname"],
									invstschangeqtyQty,POarray["custparam_enteredBinID"],POarray["custparam_lotno"],POarray["custparam_enteredlot"],
									POarray["custparam_actualbegintime"],POarray["custparam_itemunits"],getStockConversionRate,
									Number(Big(enterQty).toFixed(8)),previousstatus,revisedStatus);

							nlapiLogExecution('ERROR', 'inventory status changed successfully', inventoryStatusChangeId);
							response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, POarray);
							return;
						}
					}
					else
					{
						if(parseFloat(enterQty) > parseFloat(availableQty))
						{
							POarray["custparam_error"] = 'Entered qty is greater than available qty ';
						}
						else
						{
							POarray["custparam_error"] = 'Please enter valid qty';
						}

						response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_changstat', 'customdeploy_wmsse_invstchange_changstat', false, POarray);
						return;
					}

				} 
				else 
				{

					if(POarray["custparam_statusflag"]=='T')
					{	
						nlapiLogExecution('ERROR', 'redirecting back to select status', POarray["custparam_availableqty"]);
						POarray["custparam_availableqty"]=request.getParameter('hdnAvailableQty1');
						response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_stat_scan', 'customdeploy_wmsse_invstchange_stat_scan', false, POarray);
						return;
					}
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{

						POarray["custparam_error"]='';
						//POarray["custparam_availableqty"]=request.getParameter('hdnAvailableQty1');
						nlapiLogExecution('ERROR', 'redirecting back to lot scan',POarray["custparam_availableqty"]);		
						response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_lot_scan', 'customdeploy_wmsse_invstchange_lot_scan', false, POarray);
						return;
					}
					else
					{
						POarray["custparam_error"]='';
						nlapiLogExecution('ERROR', 'redirecting back to bin scan', 'redirecting back to bin scan on prev button click');	
						response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
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
				response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_changstat', 'customdeploy_wmsse_invstchange_changstat', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_changstat', 'customdeploy_wmsse_invstchange_changstat', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.





function multiDimensionalUnique(arr) {
	var uniques = [];
	var itemsFound = {};
	for(var i = 0, l = arr.length; i < l; i++) {
		var stringified = JSON.stringify(arr[i]);
		if(itemsFound[stringified]) { continue; }
		uniques.push(arr[i]);
		itemsFound[stringified] = true;
	}
	return uniques;
}
