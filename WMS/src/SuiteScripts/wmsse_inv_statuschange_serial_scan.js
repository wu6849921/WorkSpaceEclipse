/***************************************************************************
 Copyright � 2018,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan serial numbers in inventory status change process
 */
function RFInvStatusChangeSerialScan(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{

		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
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
		var enterqtytostatuschange=request.getParameter('custparam_enterQty');
		var vUnitsText=request.getParameter('custparam_unitstext');
		var vBaseUnit=request.getParameter('custparam_baseunit');
		var VUnitType=request.getParameter('custparam_itemunitstype');
		var blnItemUnit=request.getParameter('custparam_itemunits');
		var getStockConversionRate=request.getParameter('hdngetStockConversionRate');
		var invtstatus = request.getParameter('custparam_enteredstatus');
		var invtstatusName = request.getParameter('custparam_invtstatusName');
		var revisedinvtstatus = request.getParameter('custparam_revisedStatusid');
		var invToStatusName = request.getParameter('custparam_revisedStatusText');
		var toInventoryStatusText = request.getParameter('custparam_revisedStatusText');
		var vInvLotId=request.getParameter('custparam_uomqtyselected');//check to comment this line
		var vInvLotId=request.getParameter('custparam_uomprevselected');//check to comment this line
		var availableLotQty=request.getParameter('custparam_lotavailableqty');
		var eneteredBinId = request.getParameter('custparam_enteredBinID');
		var enteredLot=request.getParameter('custparam_enteredlot');// this is lotid
		var statusScreenflag = request.getParameter('custparam_statusflag');
		var vInvLotId=request.getParameter('custparam_statusScanQuantity');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var makeInvAvailFlag = request.getParameter('custparam_makeinventoryavailflag');

		var logMsg = 'enterqtytostatuschange = ' + enterqtytostatuschange + '<br>';
		logMsg = logMsg + 'invtstatusName = ' + invtstatusName + '<br>';
		logMsg = logMsg + 'invtstatus = ' + invtstatus + '<br>';
		logMsg = logMsg + 'revisedinvtstatus = ' + revisedinvtstatus + '<br>';
		logMsg = logMsg + 'invToStatusName = ' + invToStatusName + '<br>';
		logMsg = logMsg + 'availableQty = ' + availableQty + '<br>';
		logMsg = logMsg + 'getStockConversionRate = ' + getStockConversionRate + '<br>';
		logMsg = logMsg + 'makeInvAvailFlag = ' + makeInvAvailFlag + '<br>';
		logMsg = logMsg + 'availableLotQty = ' + availableLotQty + '<br>';
		logMsg = logMsg + 'availableqtyDetail = ' + availableqtyDetail + '<br>';

		nlapiLogExecution('DEBUG', 'logs for inv status in get  - serial', logMsg);

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
		 
		var objBinDetails=null;
		var AllowAllLots = 'T';
		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		nlapiLogExecution('DEBUG', 'makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect); 
		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && qtyUOMCtrlSelectedVal !='undefined' 
			&& qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		var st0 = domainName + '-Inventory Status Change';
		var st1 = 'Inventory Status - Serial Scan';

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


		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;
		nlapiLogExecution('ERROR', 'getNumber', getNumber);
		if(parseFloat(getNumber)==0)
		{
			/* The below function is to update the back the discontinued serial#  */
			fnSerUpdateBackSerialinGet(enteredBin);
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
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
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />"+
		"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";


		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() { if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;}else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Inventory Status - Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enteredBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Scanned Qty: <label>" + getNumber + "</label>"+
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
		"				<input type='hidden' name='hdnlotno' id='hdnlotno' value=" + lotno + ">"+
		"				<input type='hidden' name='hdnlotid' id='hdnlotid' value=" + enteredLot + ">"+
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
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdninvstatus' value='" + invtstatus + "'>"+	
		"				<input type='hidden' name='hdninvtstatusName' value='" + invtstatusName + "'>"+	
		"				<input type='hidden' name='hdnrevisedstatus'  value=" + revisedinvtstatus + ">"+
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnenterqtytostatuschange' value=" + enterqtytostatuschange + ">"+
		"				</td>"+
		"			</tr>";		

		if(toInventoryStatusText == null || toInventoryStatusText == ''|| toInventoryStatusText == 'null'|| toInventoryStatusText == undefined)
		{
			var toInventoryStatusArray = getDefaultInventoryStatusList(revisedinvtstatus,-1,null);
			toInventoryStatusArray = toInventoryStatusArray.toString();

			var toInventoryStatus = toInventoryStatusArray.split(',');
			nlapiLogExecution('ERROR', 'toInventoryStatus', toInventoryStatus[0]+'+'+toInventoryStatus[1]+'+'+toInventoryStatus[2]);
			toInventoryStatusText = toInventoryStatus[0];
		}
		if(invtstatusName != null && invtstatusName != '' && invtstatusName != 'null' && invtstatusName != 'undefined')
		{
			var vInventoryStatus ='';
			var vToInventoryStatus ='';
			var hdnInvtStatusText = request.getParameter('hdninvtstatusName');
			var hdnToInvtStatusText = request.getParameter('hdnrevisedstatusName');
			if(hdnInvtStatusText != '' && hdnInvtStatusText != null && hdnInvtStatusText != 'null' && hdnInvtStatusText != 'undefined')
			{
				vInventoryStatus = hdnInvtStatusText;
				vToInventoryStatus = hdnToInvtStatusText;
			}
			else
			{
				var inventoryStatustx = invtstatusName;
				var inventoryToStatustx = invToStatusName;
			}
			html = html + "			<tr>"+
			"			<td align = 'left' class='labelmsg'>Previous Status: <label>" + inventoryStatustx + "</label>"+
			"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + inventoryStatustx + "'>"+	
			"			</tr>"+
			"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Revised Status: <label>" + toInventoryStatusText + "</label>"+
			"				<input type='hidden' name='hdnToInvtStatusText' id = 'hdnToInvtStatusText' value='" + toInventoryStatusText + "'>"+	
			"			</tr>";
		}


		html =html+	"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF <label>" + enterqtytostatuschange + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>"+
		"				</td>"+

		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'  type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";
		html = html + "</td></tr></table></form>"+

		"<script type='text/javascript'>document.getElementById('txtserial').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else 
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating Serial');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtserial');



		POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		POarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		POarray["custparam_lotavailableqty"] = request.getParameter('hdnlotavailableqty');
		POarray["custparam_enterQty"] = request.getParameter('hdnenterqtytostatuschange');
		POarray["custparam_statusflag"] = request.getParameter('hdnstatusflag');
		POarray["custparam_enterBin"] = request.getParameter('hdnenteredbin');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');		
		POarray["custparam_lotno"] =request.getParameter('hdnlotno');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_fetcheditemname"]=request.getParameter('hdnItemName');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_availableqty"] = request.getParameter('hdnAvailableQty');
		POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_unitstext"] = request.getParameter('hdnvUnitsText');	
		POarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
		POarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');//
		var makeInvAvailFlagFromSelect = request.getParameter('hdnmakeinvtflagavail');
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');

		POarray["custparam_enteredstatus"] = request.getParameter('hdninvstatus');
		POarray["custparam_invtstatusName"] = request.getParameter('hdninvtstatusName');
		//POarray["custparam_toStatusText"] = request.getParameter('hdnrevisedstatusName');
		POarray["custparam_revisedStatusid"] = request.getParameter('hdnrevisedstatus');
		POarray["custparam_statusScanQuantity"] = request.getParameter('hdnstatusScanQuantity');
		POarray["custparam_enteredlot"] = request.getParameter('hdnenteredlot');
		POarray["custparam_enteredBinID"] = request.getParameter('hdnenteredbinid');
		POarray["custparam_statusflag"] = request.getParameter('hdnstatusScreen');

		var availableQty=request.getParameter('hdnAvailableQty');
		var itemType=request.getParameter('hdnItemType');
		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var lotno= request.getParameter('hdnlotno');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var optedEvent = request.getParameter('cmdPrevious');
		var preferBin=request.getParameter('hdnPreferBin');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var stockconversionrate = request.getParameter('hdngetStockConversionRate');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=POarray["custparam_enterQty"];
		var enterBin=request.getParameter('hdnenteredbin');
		var optedEvent = request.getParameter('cmdPrevious');	
		var getNumber=parseFloat(request.getParameter('hdnNumber'));
		var whLocation = request.getParameter('hdnWhLocation');
		var fromstatus = request.getParameter('hdninvstatus');
		var tostatus = request.getParameter('hdnrevisedstatus');

		nlapiLogExecution('DEBUG', 'POarray["custparam_invtstatusName"]', POarray["custparam_invtstatusName"]);
		nlapiLogExecution('DEBUG', 'fromstatus', fromstatus);
		//nlapiLogExecution('DEBUG', 'POarray["custparam_toStatusText"]', POarray["custparam_toStatusText"]);
		nlapiLogExecution('DEBUG', 'tostatus', tostatus);


		var logMsg = 'enterqtytostatuschange = ' + enterqtytostatuschange + '<br>';
		logMsg = logMsg + 'fromstatus = ' + fromstatus + '<br>';
		logMsg = logMsg + 'tostatus = ' + tostatus + '<br>';
		logMsg = logMsg + 'availableQty = ' + availableQty + '<br>';
		logMsg = logMsg + 'stockconversionrate = ' + stockconversionrate + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'availableLotQty = ' + availableLotQty + '<br>';
		logMsg = logMsg + 'availableqtyDetail = ' + availableqtyDetail + '<br>';

		nlapiLogExecution('DEBUG', 'logs for inv status in post  - serial', logMsg);
		
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){

					if(getSerialNo!=null && getSerialNo!="" && getSerialNo!='null')
					{
						var serialmatchfound='F';
						var serial_matchfound='F';

						var binInternalId=nswms_GetBinInternalId(enterBin,POarray["custparam_whlocation"]);
						nlapiLogExecution('DEBUG', 'binInternalId Serial No ', binInternalId);
						var objBinDetailsRes = null;

						/* The below function 'fnSerValidationDetails' is for fetching serial# validation details */
						var resultSerValidationDetails = null;
						resultSerValidationDetails = fnSerValidationDetails(binInternalId,FetchedItemId,whLocation,getSerialNo,enterBin,fromstatus,serialmatchfound);

						if(resultSerValidationDetails!=null && resultSerValidationDetails!='')
						{
							serial_matchfound = resultSerValidationDetails[0];
							objBinDetailsRes = resultSerValidationDetails[1];
						}
						if(serial_matchfound =='F')
						{
							POarray["custparam_error"] = 'Insufficient inventory for this serial#: '+getSerialNo;
							response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_seri_scan', 'customdeploy_wmsse_invstchange_seri_scan', false, POarray);
							return;
						}

						if(objBinDetailsRes == null || objBinDetailsRes == '' || objBinDetailsRes == 'null' || objBinDetailsRes =='undefined' 
							||objBinDetailsRes.length < 1)
						{
							nlapiLogExecution('ERROR', 'objBinDetails inside null', '');
							POarray["custparam_error"] = 'Insufficient inventory for this serial#: '+getSerialNo;
							response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_seri_scan', 'customdeploy_wmsse_invstchange_seri_scan', false, POarray);
							return;
						}

						/* The below function 'fnSerValidationinPost' is to update the serial# in WMS serial entry */

						var resSerValidationinPost = null;
						var resSrchRecordTmpSerial = null;
						var wmsSerRecid = '';
						resSerValidationinPost = fnSerValidationinPost(getSerialNo,binInternalId,FetchedItemId,binInternalId);
						if(resSerValidationinPost!=null && resSerValidationinPost!='')
						{
							SrchRecordTmpSerial = resSerValidationinPost[0];
							wmsSerRecid = resSerValidationinPost[1];
						}


						if(resSrchRecordTmpSerial != null && resSrchRecordTmpSerial !='')
						{

							POarray["custparam_error"] = "Serial# already scanned";
							resSrchRecordTmpSerial=null;
							response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_seri_scan', 'customdeploy_wmsse_invstchange_seri_scan', false, POarray);
							return;
						}								
						else 
						{
							POarray["custparam_serialno"] = getSerialNo;
							POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
						}

						nlapiLogExecution('ERROR', '(getNumber + 1)', (parseInt(getNumber) + 1));
						nlapiLogExecution('ERROR', 'enterQty', enterQty);
						if ((parseInt(getNumber) + 1) < parseInt(enterQty)) 
						{
							nlapiLogExecution('ERROR', 'Scanning Serial No.');
							POarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_seri_scan', 'customdeploy_wmsse_invstchange_seri_scan', false, POarray);
							return;

						}
						else
						{
							try
							{

								nlapiLogExecution('DEBUG', 'enterQty', enterQty);
								
								var inventoryStatusChangeId='';
							
								inventoryStatusChangeId= inventoryStatusChange(itemType,POarray["custparam_whlocation"],
										POarray["custparam_whlocationname"],FetchedItemId,POarray["custparam_fetcheditemname"],
										Number(Big(enterQty).toFixed(8)),POarray["custparam_enteredBinID"],POarray["custparam_lotno"],POarray["custparam_enteredlot"],
										POarray["custparam_actualbegintime"],POarray["custparam_itemunits"],getStockConversionRate,
										Number(Big(enterQty).toFixed(8)),fromstatus,tostatus);

								nlapiLogExecution('ERROR', 'inventoryStatusChangeId successfully', inventoryStatusChangeId);
								response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, POarray);
								return;


							}				
							catch(e)
							{
								var msgstring= e.toString();
								var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
								nlapiLogExecution('ERROR', 'inside catch exception', msg);
								POarray["custparam_error"] = msg;
								response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_seri_scan', 'customdeploy_wmsse_invstchange_seri_scan', false, POarray);
								return;
							}
						}
					}
					else
					{
						POarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_seri_scan', 'customdeploy_wmsse_invstchange_seri_scan', false, POarray);
						return;
					}
				} 
				else 
				{
					POarray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_changstat', 'customdeploy_wmsse_invstchange_changstat', false, POarray);
					return;
					
				}
			}
			catch(e)
			{
				var msgstring= e.toString();
				var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
				nlapiLogExecution('ERROR', 'inside catch exception', msg);
				POarray["custparam_error"] = msg;
				response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_seri_scan', 'customdeploy_wmsse_invstchange_seri_scan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_seri_scan', 'customdeploy_wmsse_invstchange_seri_scan', false, POarray);
			return;
		}
	} 
} 

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

/* The below function is to update the back the discontinued serial#  */

function fnSerUpdateBackSerialinGet(enteredBin)
{

	var filterssertemp1 = new Array();
	filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
	filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 18);//18--XFER
	filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', enteredBin);
	var columnssertemp1 = new Array();
	columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
	columnssertemp1[1] = new nlobjSearchColumn('name');
//	var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filterssertemp1,columnssertemp1);
	// Here 4k records fetching not required.
	var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,null);
	if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
	{	
		for (var SrchRecordTmpSerial1itr = 0; SrchRecordTmpSerial1itr < SrchRecordTmpSerial1.length; SrchRecordTmpSerial1itr++) {
			var TempRecord=SrchRecordTmpSerial1[SrchRecordTmpSerial1itr];
			var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
			tempSerial.setFieldValue('id', TempRecord.getId());
			tempSerial.setFieldValue('name', TempRecord.getValue('name'));
			tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of discontinue of serial number scanning we have marked this serial number as closed');
			tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
			nlapiSubmitRecord(tempSerial);
			tempSerial=null;
		}

	}
	SrchRecordTmpSerial1=null;
	columnssertemp1=null;
	filterssertemp1=null;

}

/* The below function 'fnSerValidationDetails' is for fetching serial# validation details */

function fnSerValidationDetails(binInternalId,FetchedItemId,whLocation,getSerialNo,enterBin,fromstatus,serial_matchfound)
{
	var logMsg = 'binInternalId = ' + binInternalId + '<br>';
	logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'getSerialNo = ' + getSerialNo + '<br>';
	logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
	logMsg = logMsg + 'fromstatus = ' + fromstatus + '<br>';
	logMsg = logMsg + 'serial_matchfound = ' + serial_matchfound + '<br>';

	nlapiLogExecution('ERROR', 'into fnSerValidationDetails', logMsg);

	var SerValidationDetailsArr = new Array(); 
	var objBinDetails = null;

	var filterStrat = new Array();
	if(binInternalId != null && binInternalId != '')
		filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
	filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
	filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', whLocation));
	filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

	var columnStrat=new Array();
	columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
	columnStrat[0].setSort(true);						

	var objBinDetailsGetInternalId = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

	if(objBinDetailsGetInternalId!=null && objBinDetailsGetInternalId!='')
	{

		if(objBinDetailsGetInternalId.length>0)
		{
			var vinventoryNumberBinOnHand=objBinDetailsGetInternalId[0].getValue('inventorynumber','inventoryNumberBinOnHand');
			nlapiLogExecution('ERROR', 'vinventoryNumberBinOnHand', vinventoryNumberBinOnHand);
		}
	}



	var filterStrat = new Array();
	var binInternalId=nswms_GetBinInternalId(enterBin,whLocation);
	if(binInternalId != null && binInternalId != '' && binInternalId != 'null')
		filterStrat.push(new nlobjSearchFilter('binnumber',null,'anyof', binInternalId));
	if(FetchedItemId != null && FetchedItemId != '' && FetchedItemId != 'null')
		filterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
	if(whLocation != null && whLocation != '' && whLocation != 'null')
		filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));						
	if(vinventoryNumberBinOnHand!= null && vinventoryNumberBinOnHand != 'null' && vinventoryNumberBinOnHand != undefined && vinventoryNumberBinOnHand != '')
		filterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'is', vinventoryNumberBinOnHand));
	if(fromstatus != null && fromstatus != '' && fromstatus != 'null')
		filterStrat.push(new nlobjSearchFilter('status', null, 'anyof', fromstatus));


	objBinDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterStrat, null);


	nlapiLogExecution('ERROR', 'objBinDetails', objBinDetails);
	if(objBinDetails!=null && objBinDetails!='')
	{
		nlapiLogExecution('ERROR', 'objBinDetails length', objBinDetails.length);
		if(objBinDetails.length>0)
		{
			//var serial_matchfound='F';
			for(var i =0; i<objBinDetails.length; i++)
			{
				var availableQty=objBinDetails[i].getValue('available',null,'group');
				var vinventorynumber=objBinDetails[i].getText('inventorynumber',null,'group');

				if(vinventorynumber == getSerialNo)
				{
					nlapiLogExecution('ERROR', 'vinventorynumber', vinventorynumber);
					serial_matchfound='T';
					break;
				}

			}

		}
		else
		{
			objBinDetails='';
		}
	}

	SerValidationDetailsArr.push(serial_matchfound);
	SerValidationDetailsArr.push(objBinDetails);

	objBinDetails=null;
	columnStrat=null;
	filterStrat=null;

	nlapiLogExecution('ERROR', 'SerValidationDetailsArr in SerValidationDetails', SerValidationDetailsArr);
	return SerValidationDetailsArr;

}


/* The below function 'fnSerValidationinPost' is to update the serial# in WMS serial entry */
function fnSerValidationinPost(getSerialNo,binInternalId,FetchedItemId,binInternalId)
{
	var SerValidationinPostArr = new Array();
	var filterssertemp = new Array();
	filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
	filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
	filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 18));//18--Move
	filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', binInternalId));

	//var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filterssertemp);
	// Here 4k records fetching not required.
	var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp,null);
	nlapiLogExecution('ERROR', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
	
//	Here we are creating serial# into new Temp Serial entry custom record
	if(SrchRecordTmpSerial == null || SrchRecordTmpSerial =='')
	{
		var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
		customrecord.setFieldValue('name', getSerialNo);
		customrecord.setFieldValue('custrecord_wmsse_ser_item', FetchedItemId);
		customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
		customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
		customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
		customrecord.setFieldValue('custrecord_wmsse_ser_bin', binInternalId);
		customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 18);//18-XFER
		var rec = nlapiSubmitRecord(customrecord, false, true);
	}

	SerValidationinPostArr.push(SrchRecordTmpSerial);
	SerValidationinPostArr.push(rec);

	SrchRecordTmpSerial=null;
	filterssertemp=null;
	customrecord=null;

	return SerValidationinPostArr;
}
