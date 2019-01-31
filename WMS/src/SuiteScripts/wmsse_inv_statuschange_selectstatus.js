
/**
 * Script Description
 * This script is used for scan bin for Inventory Status Change process
 */
/***************************************************************************
 Copyright � 2018,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

/**
 * Main function to select status for Inventory Status Change
 */
function RFInvStatusChangeStatusScan(request, response)
{
	var context = nlapiGetContext();
	var user=context.getUser();
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');

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
		var toBinScreenFlag = request.getParameter('custparam_toBinScreenFlag');

		var availableLotQty = '';
		availableLotQty=request.getParameter('custparam_lotavailableqty');

		var vBaseUnit = request.getParameter('custparam_baseunit');
		var vUnitsText = request.getParameter('custparam_unitstext');	
		var VUnitType = request.getParameter('custparam_itemunitstype');
		var blnItemUnit = request.getParameter('custparam_itemunits');
		var eneteredBinId = request.getParameter('custparam_enteredBinID');
		var enteredLot = request.getParameter('custparam_enteredlot');
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate');
		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;

		var getStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
		var uomresults= new Array();
		var results='';

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

		}

		var vUnitsText="";
		if(vBaseUnit != "" && vBaseUnit != null && vBaseUnit != "null")
			vUnitsText = 'In '+ vBaseUnit;

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var btnText='Save (Ent)';
		if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
		{
			btnText='Next (Ent)';
		}

		var totalAvailQty = 0;
		var vStatusDetailsArr = null;

		/* The below function is to fetch inv status Details*/

		vStatusDetailsArr = fngetStatusDetails(whLocation,getItemInternalId,eneteredBinId,enteredLot,getItemType,VUnitType,blnItemUnit);



		var logMsg = 'departments = ' + departments + '<br>';
		logMsg = logMsg + 'classes = ' + classes + '<br>';
		logMsg = logMsg + 'whCompany = ' + whCompany + '<br>';
		logMsg = logMsg + 'getItemType = ' + getItemType + '<br>';
		logMsg = logMsg + 'lotno = ' + lotno + '<br>';
		logMsg = logMsg + 'vInvLotId = ' + vInvLotId + '<br>';
		logMsg = logMsg + 'enteredLot = ' + enteredLot + '<br>';
		logMsg = logMsg + 'availableQty = ' + availableQty + '<br>';
		logMsg = logMsg + 'getPreferBin = ' + getPreferBin + '<br>';
		logMsg = logMsg + 'enteredBin = ' + enteredBin + '<br>';
		logMsg = logMsg + 'blnMixItem = ' + blnMixItem + '<br>';
		logMsg = logMsg + 'blnMixLot = ' + blnMixLot + '<br>';
		logMsg = logMsg + 'VUnitType = ' + VUnitType + '<br>';
		logMsg = logMsg + 'blnItemUnit = ' + blnItemUnit + '<br>';
		logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
		logMsg = logMsg + 'getItemInternalId = ' + getItemInternalId + '<br>';
		logMsg = logMsg + 'VUnitType = ' + VUnitType + '<br>';
		logMsg = logMsg + 'getStockConversionRate = ' + getStockConversionRate + '<br>';
		logMsg = logMsg + 'vBaseUnit = ' + vBaseUnit + '<br>';
		logMsg = logMsg + 'vUnitsText = ' + vUnitsText + '<br>';
		logMsg = logMsg + 'vStatusDetailsArr = ' + vStatusDetailsArr + '<br>';

		nlapiLogExecution('ERROR', 'Processing status change get method- select status', logMsg);

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		if(enteredBin == getPreferBin)
			getPreferBin='';

		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0=domainName + "-Inventory Status";
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

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		var JSSurl ='';
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			nlapiLogExecution('ERROR', 'JSSurl', JSSurl); 
		}
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_status_scan');

		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";

		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";

		html = html +functionkeyHtml;
		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		html = html +"<script type = 'text/javascript' >function validate(){ return validateForm(\""+getStockConversionRate+"\",\""+availableLotQty+"\",'hdnselecteduomswithqty','hdnItemType','txtbin','hdnPreferBin','hdntotaluomqtyentered') }</script>";
		html= html+"<script type = 'text/javascript' >function validatebin(bin){ return DisplayBin(bin,\""+getStockConversionRate+"\",\""+availableLotQty+"\",'hdnselecteduomswithqty','hdntotaluomqtyentered','hdnItemType','txtbin','_rf_checkin_item') }</script>";
		//This function is to validate the form when Enter button or save button is clicked.
		html = html + "<script type='text/javascript'>function validate_selectedStatus(statusId,selectedQty){" +
		"	document.getElementById('hdnenetedstatus').value = statusId;document.getElementById('hdnselectedqty').value = selectedQty; document.forms['_rf_status_scan'].submit();" +
		"document.getElementById('loading').style.display = 'block'; return true;}</script>";

		html = html + "</head><body onkeydown='return OnKeyDown_CL();'> ";

		html = html +"	<form name='_rf_status_scan' method='POST'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validate();'/>"+

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Inventory Status - Select Status</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"	<tr><td>	<table>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName + "</label>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enteredBin + "</label>"+
		"				</td>"+
		"			</tr>";
		for(var invavailItr=0;invavailItr<vStatusDetailsArr.length;invavailItr++)
		{
			var currValues = vStatusDetailsArr[invavailItr];
			nlapiLogExecution('DEBUG', 'currValues', currValues);
			totalAvailQty  = currValues[3];
		}
		html = html +"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Available Qty: <label>" + parseFloat(parseFloat(totalAvailQty).toFixed(8)) + " " + blnItemUnit + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+
		"				<input type='hidden' name='hdnlotavailableqty' value=" + availableLotQty + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' id='hdnItemType' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnAvailableQty' id='hdnAvailableQty' value=" + availableLotQty + ">"+
		"				<input type='hidden' name='hdnAvailableQty1' id='hdnAvailableQty1' value=" + availableQty + ">"+
		"				<input type='hidden' name='hdnavailableqtyDetail' id='hdnavailableqtyDetail' value=" + availableqtyDetail + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnenteredbin' id='hdnenteredbin' value='" +enteredBin+"' >"+
		"				<input type='hidden' name='hdnenteredbinid' id='hdnenteredbinid' value='" +eneteredBinId+"' >"+
		"				<input type='hidden' name='hdnenteredqty' id='hdnenteredqty' value='" +availableQty+"' >"+
		"				<input type='hidden' name='hdnlotno' id='hdnlotno' value=" + lotno + ">"+
		"				<input type='hidden' name='hdnlotid' id='hdnlotid' value=" + enteredLot + ">"+
		"				<input type='hidden' name='hdnenetedstatus' id='hdnenetedstatus'>"+
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
		"				</td>"+
		"			</tr>"+			 
		"			<tr>"+
		"			</tr>";
		if(lotno!=null && lotno!='' && lotno!='null')
		{
			html = html +"<tr>";
			html = html +"<td align = 'left' class='labelmsg'>Lot#: <label>" + lotno + "</label>";
			html = html +"				</td>";
			html = html +"</tr>";
		}
		html = html +"			</table>";

		var errorMsgValue='';
		if(vStatusDetailsArr !=null && vStatusDetailsArr!='' && vStatusDetailsArr.length > 0)
		{
			html = html + 	" <tr><td></td></tr><tr><td></td></tr><tr ><td  ><table  style='border-spacing: 0;' id='tblqtyUOM'>";			


			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td class='status-rw-display'> Inv Status"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";	
			if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
			{
				html = html +"				<td colspan ='2'></td><td>Expiry Date"+	
				"				</td>";	
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			for(var invItr=0;invItr<vStatusDetailsArr.length;invItr++)
			{
				if(invItr%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';

				var currValues = vStatusDetailsArr[invItr];
				var vStatus = currValues[0];
				var vQty = currValues[1];
				var vStatusId = currValues[2];
				nlapiLogExecution('Debug','currValues[4]',currValues[4]);

				var eneteredLotExpdate = currValues[4];

				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"		<td  class='status-cl-display'><a  onclick='return validate_selectedStatus(\""+vStatusId+"\",\""+vQty+"\");' href='#' >"+vStatus;	
				html = html +"				</a></td>";				

				html = html +"				<td class='align-right'>"+vQty;
				html = html +"				</td>";
				//html = html +"				<td></td>";
				if(getItemType == 'lotnumberedinventoryitem' || getItemType == 'lotnumberedassemblyitem' )
				{
					nlapiLogExecution('Debug','eneteredLotExpdate',eneteredLotExpdate);
					if(eneteredLotExpdate ==null || eneteredLotExpdate =='' || eneteredLotExpdate =='null'|| eneteredLotExpdate == 'undefined' ||
							eneteredLotExpdate == undefined)
						eneteredLotExpdate="";
					html = html +"				<td colspan ='2'></td>";
					html = html +"				<td>"+eneteredLotExpdate;
					html = html +"				</td>";		

				}

				html = html +"			</tr>";

			}
			html = html + 	"</table></td></tr>";
		}

		html = html + 	"</table>";
		html = html +"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/>"+
		//"					<input name='cmdReceiveFulls' type='submit' value='RECEIVE FULL'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";

		html = html +"				<input type='hidden' name='hdnerrorMsgValue' id='hdnerrorMsgValue' value=" + errorMsgValue + ">";
		html = html + "</form>";		
		html=html+"</body>"+
		"</html>";

		response.write(html);
	}
	else 
	{
		nlapiLogExecution('ERROR', 'Processing RF Post', 'Validating  select status scan');
		try
		{
			var POarray = new Array();
			var enteredQty=request.getParameter('hdnenteredqty');	
			var statusScanQuantity = request.getParameter('hdnStatusScanQuantity');
			var enteredBin=request.getParameter('hdnenteredbin');
			var enteredStatus = request.getParameter('hdnenetedstatus');
			var enteredLot = request.getParameter('hdnlotno');
			var vInvLotId = request.getParameter('hdnvInvLotId');
			POarray["custparam_vInvLotId"] = vInvLotId;
			POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
			POarray["custparam_company"] = request.getParameter('hdnWhCompany');
			POarray["custparam_option"] = request.getParameter('hdnOptedField');
			POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
			POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
			POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
			POarray["custparam_fetcheditemname"]=request.getParameter('hdnItemName');
			POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
			POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
			POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
			POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
			POarray["custparam_unitstext"] = request.getParameter('hdnvUnitsText');	
			POarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
			POarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
			POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
			var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
			POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
			POarray["custparam_enteredstatus"] = request.getParameter('hdnenetedstatus');
			POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
			POarray["custparam_lotno"] = request.getParameter('hdnlotno');
			POarray["custparam_lotavailableqty"] = request.getParameter('hdnAvailableQty');
			POarray["custparam_availableqty"] = request.getParameter('hdnAvailableQty1');
			POarray["custparam_enterBin"] = request.getParameter('hdnenteredbin');
			POarray["custparam_enteredlot"] = request.getParameter('hdnlotid');
			POarray["custparam_enteredBinID"] = request.getParameter('hdnenteredbinid');
			//POarray["custparam_statusScanQuantity"] = request.getParameter('hdnAvailableQty');
			POarray["custparam_availableqtyDetail"] = request.getParameter('hdnavailableqtyDetail');
			if(getStockConversionRate == null || getStockConversionRate == '')
				getStockConversionRate=1;

			var FetchedItemId=request.getParameter('hdnItemInternalId');
			var itemType=request.getParameter('hdnItemType');
			var whLocation=POarray["custparam_whlocation"];
			var preferBin=request.getParameter('hdnPreferBin');
			var optedEvent = request.getParameter('cmdPrevious');
			var vAvailableQty = request.getParameter('hdnselectedqty');
			var enteredBinID = request.getParameter('hdnenteredbinid');
			var VUnitType = request.getParameter('hdnVUnitType');
			var blnItemUnit = request.getParameter('hdnblnItemUnit');

			var logMsg = 'LocationId = ' + POarray["custparam_whlocation"] + '<br>';
			logMsg = logMsg + 'LocationName = ' + POarray["custparam_whlocationname"] + '<br>';
			logMsg = logMsg + 'POarray["custparam_itemtype"] = ' + POarray["custparam_itemtype"] + '<br>';
			logMsg = logMsg + 'POarray["custparam_fetcheditemid"] = ' + POarray["custparam_fetcheditemid"] + '<br>';
			logMsg = logMsg + 'POarray["custparam_fetcheditemname"] = ' + POarray["custparam_fetcheditemname"] + '<br>';
			logMsg = logMsg + 'getStockConversionRate = ' + getStockConversionRate + '<br>';
			logMsg = logMsg + 'enteredStatus = ' + enteredStatus + '<br>';
			logMsg = logMsg + 'vAvailableQty = ' + vAvailableQty + '<br>';
			logMsg = logMsg + 'enteredBinID = ' + enteredBinID + '<br>';
			logMsg = logMsg + 'VUnitType = ' + VUnitType + '<br>';
			logMsg = logMsg + 'blnItemUnit = ' + blnItemUnit + '<br>';
			logMsg = logMsg + 'POarray["custparam_unitstext"] = ' + POarray["custparam_unitstext"] + '<br>';
			logMsg = logMsg + 'POarray["custparam_availableqty"] = ' + POarray["custparam_availableqty"] + '<br>';
			nlapiLogExecution('ERROR', 'Processing inventory status select status post ', logMsg);

			if(optedEvent != 'Back (F7)')
			{
				if(enteredStatus!=null && enteredStatus!="" && enteredStatus!='null' )
				{
					var invstatusid='';
					var invstatusname ='';
					var tavailableQty=0;
					var resultfnfetchstatus = null;

					/* The below function is to fetch item status details and there available qty  */

					resultfnfetchstatus = fnfetchstatus(FetchedItemId,whLocation,enteredStatus,enteredBinID,vInvLotId,VUnitType,blnItemUnit);
					if(resultfnfetchstatus != null & resultfnfetchstatus != '')
					{
						invstatusid = resultfnfetchstatus[0];
						invstatusname = resultfnfetchstatus[1];
						tavailableQty = resultfnfetchstatus[2];
					}

					POarray["custparam_statusflag"] = 'T';
					POarray["custparam_availableqty"] = Number(tavailableQty);  // this line is update the available as per the status of item[if there is total 10 with 9 good and 1 bad] and if select good status the system will consider only 9 qty as avaialble qty
					nlapiLogExecution('ERROR', 'tavailableQty', tavailableQty);
					POarray["custparam_invtstatusName"] = invstatusname;
					if(vAvailableQty !=null && vAvailableQty !='' && vAvailableQty !='null' &&
							vAvailableQty !=undefined && vAvailableQty !='undefined')
					{
						POarray["custparam_lotavailableqty"] =Number(vAvailableQty);
						//POarray["custparam_availableqty"] = parseFloat(vAvailableQty).toFixed(5);
					}

					response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_changstat', 'customdeploy_wmsse_invstchange_changstat', false, POarray);
					return; 

				} 
				else
				{
					POarray["custparam_error"] = 'Please select status';				
					response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_stat_scan', 'customdeploy_wmsse_invstchange_stat_scan', false, POarray);
					return;
				}
			}
			else 
			{
				if(itemType == 'lotnumberedinventoryitem' || itemType == 'lotnumberedassemblyitem' )
				{

					nlapiLogExecution('ERROR', 'custparam_availableqty while returning back to lot scan screen', POarray["custparam_availableqty"]);
					var statusScreenFlag = 'T';			
					POarray["custparam_statusScreenFlag"] =statusScreenFlag;
					POarray["custparam_availableqty"]=request.getParameter('hdnAvailableQty1');
					POarray["custparam_availableqtyDetail"]=request.getParameter('hdnavailableqtyDetail');
					POarray["custparam_error"] = '';
					response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_lot_scan', 'customdeploy_wmsse_invstchange_lot_scan', false, POarray);
					return;
				}
				else
				{
					POarray["custparam_error"] = '';
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_stat_scan', 'customdeploy_wmsse_invstchange_stat_scan', false, POarray);
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

/* The below function is to fetch inv status Details*/

function fngetStatusDetails(whLocation,getItemInternalId,eneteredBinId,enteredLot,getItemType,VUnitType,blnItemUnit)
{
	var logMsg = 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'getItemType = ' + getItemType + '<br>';
	logMsg = logMsg + 'getItemInternalId = ' + getItemInternalId + '<br>';
	logMsg = logMsg + 'eneteredBinId = ' + eneteredBinId + '<br>';
	logMsg = logMsg + 'enteredLot = ' + enteredLot + '<br>';
	logMsg = logMsg + 'VUnitType = ' + VUnitType + '<br>';
	logMsg = logMsg + 'blnItemUnit = ' + blnItemUnit + '<br>';

	nlapiLogExecution('ERROR', 'into fngetStatusDetails', logMsg);

	var invfilterStrat =  new Array();
	if(whLocation != null && whLocation != '')
		invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
	if(getItemInternalId != null && getItemInternalId != '')
		invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', getItemInternalId));
	if(eneteredBinId!= null && eneteredBinId!= '')
		invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', eneteredBinId));
	if(enteredLot != null && enteredLot != '')
		invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', enteredLot));

	var searchName = 'customsearch_wmsse_invtbalance_invt_item';
	if(getItemType == "inventoryitem" || getItemType == "assemblyitem")
	{
		searchName = 'customsearch_wmsse_invtbalance_invt_item';
	}
	else if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem") 
	{
		searchName = 'customsearch_wmsse_invtbalance_serialsrh';

	}
	else if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem") 
	{
		searchName = 'customsearch_wmsse_inventorybalance';

	}

	var vStatusDetails = nlapiSearchRecord('InventoryBalance',searchName,invfilterStrat, null);

	var vStatusDetailsArr =  new Array();
	var eneteredLotTxt = '';
	var eneteredLotExpdate ='';
	var vOpenPickDetails ="";
	var totalAvailQty = 0;
	if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined'
		&& vStatusDetails != undefined && vStatusDetails.length != null && vStatusDetails.length >0)
	{					 

		if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
			vOpenPickDetails = getOPenTaskPickBinDetailsLot(getItemInternalId,eneteredBinId,whLocation,VUnitType,blnItemUnit);
		else
			vOpenPickDetails = getOPenTaskPickBinDetails(getItemInternalId,eneteredBinId,whLocation,VUnitType,blnItemUnit,'','');


		if((getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem"))
		{

			eneteredLotTxt = vStatusDetails[0].getText('inventorynumber',null,'group');
			eneteredLotExpdate = vStatusDetails[0].getValue('expirationdate','inventorynumber','group');

			var statusArr = new Array();

			for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
			{
				var status = vStatusDetails[statusItr].getText('status',null,'group');

				var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');

				var statusId = vStatusDetails[statusItr].getValue('status',null,'group');
				nlapiLogExecution('DEBUG', 'status', status);
				var openPickQty = 0;
				if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
				{						
					var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
					var	vOpenPickQtyArr = vOpenPickDetails[1];
					var	vBinLotArr = vOpenPickDetails[3];
					var	vBinStatusArr = vOpenPickDetails[5];

					nlapiLogExecution('DEBUG', 'vBinOpenTaskBinQtyArr', vBinOpenTaskBinQtyArr);
					if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined' && 
							vBinStatusArr != undefined)
					{
						for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
						{
							var stsArr = vBinStatusArr[binItr];
							var vLotText =vBinLotArr[binItr];									
							if(stsArr == statusId && eneteredLotTxt==vLotText)
							{
								openPickQty = vOpenPickQtyArr[binItr];
								break;
							}
						}
					}
				}
				nlapiLogExecution('DEBUG', 'vBinQtyAvail', vBinQtyAvail);
				nlapiLogExecution('DEBUG', 'openPickQty', openPickQty);
				vBinQtyAvail = Number(Big(vBinQtyAvail).minus(openPickQty));
				totalAvailQty = Big(totalAvailQty).plus(vBinQtyAvail);
				if(parseFloat(vBinQtyAvail) > 0)
				{
					if(statusArr.indexOf(statusId)==-1)
					{
						var currRow = [status,vBinQtyAvail,statusId,totalAvailQty,eneteredLotExpdate];
						statusArr.push(statusId);
						vStatusDetailsArr.push(currRow);
					}
					else
					{
						var indx = statusArr.indexOf(statusId);
						var Row = vStatusDetailsArr[indx];
						var qty = Row[1];
						var totalQty = Big(qty).plus(vBinQtyAvail);
						var currRow = [status,totalQty,statusId,totalAvailQty,eneteredLotExpdate];
						vStatusDetailsArr[indx]=currRow;
					}
				}
			}

		}
		else
		{
			for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
			{
				var status = ''; 
				var vBinQtyAvail ='';
				var statusId = '';
				if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
				{
					status = vStatusDetails[statusItr].getText('status',null,'group');
					vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');
					statusId = vStatusDetails[statusItr].getValue('status',null,'group');
				}
				else
				{
					status = vStatusDetails[statusItr].getText('status');
					vBinQtyAvail=vStatusDetails[statusItr].getValue('available');
					statusId = vStatusDetails[statusItr].getValue('status');
				}


				var openPickQty = 0;
				if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
				{
					var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
					var	vOpenPickQtyArr = vOpenPickDetails[1];
					var	vBinStatusArr = vOpenPickDetails[3];
					if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined' && 
							vBinStatusArr != undefined)
					{
						for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
						{
							var stsArr = vBinStatusArr[binItr];									
							if(stsArr == statusId)
							{
								openPickQty = vOpenPickQtyArr[binItr];
								break;
							}
						}
					}
				}
				nlapiLogExecution('DEBUG', 'openPickQty', openPickQty);
				vBinQtyAvail = Number(Big(vBinQtyAvail).minus(openPickQty));
				totalAvailQty = Big(totalAvailQty).plus(vBinQtyAvail);
				if(parseFloat(vBinQtyAvail) > 0)
				{
					var currRow = [status,vBinQtyAvail,statusId,totalAvailQty];
					vStatusDetailsArr.push(currRow);
				}
			}
		}
	}
	nlapiLogExecution('DEBUG', 'vStatusDetailsArr in funtion fngetStatusDetails', vStatusDetailsArr);
	return vStatusDetailsArr;

}

/* The below function is to fetch item status details and there available qty  */

function fnfetchstatus(FetchedItemId,whLocation,enteredStatus,enteredBinID,vInvLotId)
{
	var invstatusid='';
	var invstatusname ='';
	var tavailableQty=0;
	var filterPrefInv = new Array();
	var invstatusArr = new Array();

	var logMsg = 'FetchedItemId = ' + FetchedItemId + '<br>';
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'enteredStatus = ' + enteredStatus + '<br>';
	logMsg = logMsg + 'enteredBinID = ' + enteredBinID + '<br>';
	logMsg = logMsg + 'vInvLotId = ' + vInvLotId + '<br>';

	nlapiLogExecution('ERROR', 'into fnfetchstatus', logMsg);

	if(FetchedItemId != null && FetchedItemId != '' && FetchedItemId != 'null')
		filterPrefInv.push(new nlobjSearchFilter('internalid','item','anyof', FetchedItemId));
	if(whLocation!= null && whLocation!= '' && whLocation!= 'null')
		filterPrefInv.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
	if(enteredStatus != null && enteredStatus != '' && enteredStatus != 'null')
		filterPrefInv.push(new nlobjSearchFilter('status',null, 'anyof', enteredStatus));
	if(enteredBinID != null && enteredBinID != '' && enteredBinID != 'null')
		filterPrefInv.push(new nlobjSearchFilter('binnumber',null, 'anyof', enteredBinID));
	if(vInvLotId != null && vInvLotId != '' && vInvLotId != 'null')
		filterPrefInv.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', vInvLotId));

	var objBinDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterPrefInv, null);


	if(objBinDetails != null && objBinDetails != '')
	{
		if(objBinDetails.length != null)
		{
			nlapiLogExecution('ERROR', 'objBinDetails.length bew', objBinDetails.length);
			for(var aVailQty=0;aVailQty<objBinDetails.length;aVailQty++)
			{
				tavailableQty=Big(tavailableQty).plus(objBinDetails[aVailQty].getValue('available',null,'sum'));
			}

			invstatusid = objBinDetails[0].getValue('status',null,'group');
			invstatusname = objBinDetails[0].getText('status',null,'group');
			invstatusArr.push(invstatusid);
			invstatusArr.push(invstatusname);
			invstatusArr.push(tavailableQty);
		}

	}
	nlapiLogExecution('ERROR', 'invstatusArr in fnfetchstatus', invstatusArr);
	return invstatusArr;


}