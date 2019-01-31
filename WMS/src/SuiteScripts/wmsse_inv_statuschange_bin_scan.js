/**
 * Script Description
 * This script is used for scan bin for Inventory Status Change process
 */
/***************************************************************************
 Copyright � 2018,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

/**
 * Main function to scan BIN for Inventory Status Change
 */
function RFInvStatusChangeBIN(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');
		var POArray = new Array();
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whCompany= request.getParameter('custparam_company');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var itemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var getPageCount = request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;

		var itemCount=0;

		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');

		var strItemGrp="";
		var strItemFam="";
		var blnMixItem="F";
		var blnMixLot="F";
		var getPreferBin="";
		var blnItemUnit="";
		var VUnitType ="";
		var Vdepartment ="";
		var Vclass ="";
		var vClassification="";

		/*This function is for Fetching item details based on itemid. */

		var resultfngetItemdetails = null;
		resultfngetItemdetails = fngetItemdetails(getItemInternalId,whLocation,departments,classes);
		if(resultfngetItemdetails!=null && resultfngetItemdetails!='')
		{
			nlapiLogExecution('ERROR', 'resultfngetItemdetails.length', resultfngetItemdetails.length);
			var itemarray = null;

			for(var itemdetailsItr=0; itemdetailsItr < resultfngetItemdetails.length; itemdetailsItr++)
			{                    	 
				getPreferBin = resultfngetItemdetails[itemdetailsItr][0];
				itemarray =resultfngetItemdetails[itemdetailsItr][1];


				blnMixItem = itemarray[0];
				blnMixLot = itemarray[1];
				strItemGrp = itemarray[2];
				strItemFam = itemarray[3];
				blnItemUnit = itemarray[4];
				VUnitType = itemarray[5];
				vClassification = itemarray[6];
				if(departments == true)
					Vdepartment = itemarray[7];
				if(classes == true)
					Vclass = itemarray[8];
			}
		}

		var getStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
		var uomResult = '';
		if(VUnitType != null && VUnitType != '')
		{	
			uomResult= getUnitsType(VUnitType);
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
		if(parseFloat(getStockConversionRate) != 1 && vBaseUnit != "")
			vUnitsText = 'In '+ vBaseUnit;
		if(parseFloat(getStockConversionRate) == 1)
			vBaseUnit="";

		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;

		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && qtyUOMCtrlSelectedVal !='undefined'
			&& qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}

		var logMsg = 'departments = ' + departments + '<br>';
		logMsg = logMsg + 'Vclass = ' + Vclass + '<br>';
		logMsg = logMsg + 'getPreferBin = ' + getPreferBin + '<br>';
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
		logMsg = logMsg + 'qtyUOMCtrlSelectedVal = ' + qtyUOMCtrlSelectedVal + '<br>';
		logMsg = logMsg + 'qtyUomCntrlSelectedConversionRate = ' + qtyUomCntrlSelectedConversionRate + '<br>';
		logMsg = logMsg + 'Classification  = ' + vClassification + '<br>';

		nlapiLogExecution('ERROR', 'Processing status change get method- BIN', logMsg);

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
		}

		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		var objBinDetails=null;
		var AllowAllLots = 'T';
		if(itemType == "inventoryitem" || itemType == "assemblyitem"|| itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
		{
			nlapiLogExecution('ERROR', 'Inside if itemType', itemType);
//			objBinDetails=fnGetPickBinDetails(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,
//					Vclass,'','','',getPageCount,makeInvAvailFlagFromSelect,itemType,VUnitType,blnItemUnit,vConversionRate);
			objBinDetails=fnGetPickBinDetails(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,
					Vclass,'','','',getPageCount,makeInvAvailFlagFromSelect,itemType,VUnitType,blnItemUnit,vConversionRate,null,vClassification);

		}
		else
		{
			nlapiLogExecution('ERROR', 'Inside else itemType', itemType);
//			objBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,
//					Vclass,'','','',getPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,vConversionRate,'',AllowAllLots);
			objBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,
					Vclass,'','','',getPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,vConversionRate,'',AllowAllLots,vClassification);
		}
		nlapiLogExecution('ERROR', 'objBinDetails', objBinDetails);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
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
		CSSfilefound=null;


		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item');
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";

		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";

		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "</head><body>"+
		"	<script type='text/javascript'>function DisplayBin(val) {document.getElementById('txtbin').value=val;document.forms['_rf_checkin_item'].submit();return true;}</script>";
		"	<script type='text/javascript'>function validateForm() {var bin = document.getElementById('hdnPreferBin').value;if(document.getElementById('txtbin').value == '' && bin==''){document.getElementById('div_error').innerHTML ='Please enter/scan bin location';return false;} else{this.form.submit();this.form.cmdPrevious.disabled=true; return true;}</script>"+
		"	<script type='text/javascript'>function validateItem(usedBins,vpoitem) {if(usedBins == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item ' +vpoitem+ ' to receive.';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";


		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Inventory Status - Bin</td></tr>"+
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
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdnItemType' value=" + itemType + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnvUnitsText' id='hdnvUnitsText' value='" + vUnitsText + "'>"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnmakeinvtflagavail' id='hdnmakeinvtflagavail' value='" + makeInvAvailFlagFromSelect + "'>"+
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+	
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
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
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr></table>";

		html = html + 	"<tr><td><table  class='uomstatus-gridgap' >";			
		html = html +"<tr>";
		if(uomResult !=null &&  uomResult !='' && uomResult.length>0)
		{
			html=html+"<td align = 'left' class='labelmsg'>UOM</td>";
			html=html+"<td class='uom-status-display'></td>";

		}
		html = html +"<td align = 'left' class='labelmsg'>Inv Status</td></tr>";


		html = html +"<tr>";

		if(uomResult !=null &&  uomResult !='' && uomResult.length>0)
		{
			html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUom_OnChange();'>";
			var selectedUOM = request.getParameter('custparam_uomprevselected');

			for(var uomCnt=0; uomCnt < uomResult.length; uomCnt++)
			{                    	 
				var vUOM = uomResult[uomCnt].getValue('conversionrate');
				var UOMText =uomResult[uomCnt].getValue('unitname');
				nlapiLogExecution('DEBUG', 'uomCnt,UOMText,vUOM,selectedUOM', uomCnt+","+UOMText+","+vUOM+","+selectedUOM);
				if(( (selectedUOM == null && getStockConversionRate == vUOM) || (selectedUOM == '' && getStockConversionRate == vUOM)  
						|| (selectedUOM =='null' && getStockConversionRate == vUOM) || (selectedUOM =='undefined'  && getStockConversionRate == vUOM )
						|| (selectedUOM == undefined && getStockConversionRate == vUOM) )|| (selectedUOM == vUOM))
				{
					html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";
				}
				else
				{
					html = html +" <option     value="+vUOM+"> "+UOMText+"</option>";
				}
			}
			html = html+"</select></td>";

			html=html+"<td class='uom-status-display'></td>";

		}

		var statusOptsArr = getStatusOptions();
		html = html +"<td > <select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
		if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
		{
			for(var statusItr=0; statusItr < statusOptsArr.length; statusItr++)
			{                    	 
				var val = statusOptsArr[statusItr][0];
				var StatusText =statusOptsArr[statusItr][1];
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

		html = html +"</table>" ;


		if((objBinDetails!=null && objBinDetails!='') ||
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))

		{
			nlapiLogExecution('ERROR', 'objBinDetails length', objBinDetails.length);

			html = html + 	"<tr><td><table  style='border-spacing: 0;' id='tblqtyUOM'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Bin"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";
			html = html +	"			<td></td>	<td  class='status-rw-display'>Inv Status";	
			html = html +"				</td>";	


			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			{
				html = html +	"			<td></td>	<td>Lot#";	
				html = html +"				</td>";
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';	
			var convRate = 1;
			var selectedUOM = request.getParameter('custparam_uomprevselected');
			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
			{
				convRate = Big(getStockConversionRate).div(selectedUOM);
			}
			for (var objBinItr = 0; objBinItr < objBinDetails.length; objBinItr++) 
			{
				itemCount=parseInt(itemCount)+1;
				nlapiLogExecution('DEBUG', 'itemCount', itemCount);
				if(objBinItr%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var txtBin='';
				var binAvailQty=0;
				var binLot='';
				var currValues = objBinDetails[objBinItr];
				var inventoryStatus = '';
				if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
				{
					txtBin = currValues[0];
					binAvailQty = Big(currValues[1]).mul(convRate);					
					//binAvailQty = parseFloat(parseFloat(binAvailQty).toFixed(5));
					inventoryStatus = currValues[4];					

				}
				else
				{
					txtBin = currValues[0];
					binAvailQty = Big(currValues[1]).mul(convRate);					
					//binAvailQty = parseFloat(parseFloat(binAvailQty).toFixed(5));
					inventoryStatus = currValues[6];
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						binLot = currValues[3];
					}
				}

				nlapiLogExecution('ERROR', 'getPreferBin, txtBin,binAvailQty', getPreferBin+","+txtBin+","+binAvailQty);
				var linkBin=txtBin;
				if(getPreferBin == txtBin)
				{
					txtBin=txtBin+ "<span style='color:red;'>* </span>";
				}
				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td><a  onclick='DisplayBin(\""+linkBin+"\");' href='#' >"+txtBin+"</a></td>";	
				html = html +"				<td class='align-right'>"+parseFloat(parseFloat(binAvailQty).toFixed(8)) +
				"				</td>";


				html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
				html = html +"				</td>";

				if(binLot!=null && binLot!='')
				{
					html = html +"				<td></td><td>"+binLot;	
					html = html +"				</td>";
				}
				html = html +"			</tr>";

				if(parseInt(itemCount)>=5)
					break;
			}
			html = html + "	</table>"+	
			"				<input type='hidden' name='hdngetPageCount' id='hdngetPageCount' value=" + getPageCount + ">"+
			" </td>"+
			"</tr>"+
			"</table>";

		}
		else
		{
			POArray["custparam_error"] = 'There is no inventory available for this item';
			POArray["custparam_whlocation"] = whLocation;
			POArray["custparam_whlocationname"] = whLocationName;
			response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_item_scan', 'customdeploy_wmsse_invstchange_item_scan', false, POArray);
			return;
		}

		html = html + "</table></td></tr></table>	" ;
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

		if((( objBinDetails != null && objBinDetails !='') &&(objBinDetails.length)) >= (6))
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>"+		
		"</form>"+

		"<script type='text/javascript'>document.getElementById('txtbin').focus();</script>"+
		"</body>"+
		"</html>";
		objBinDetails=null;	
		response.write(html);
	}
	else 
	{
		nlapiLogExecution('ERROR', 'Processing RF Post', 'Validating  BIN');

		try
		{
			var POarray = new Array();
			var enterBin=request.getParameter('txtbin');		
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
			POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');//
			var makeInvAvailFlagFromSelect = request.getParameter('hdnmakeinvtflagavail');
			POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');

			if(getStockConversionRate == null || getStockConversionRate == '')
				getStockConversionRate=1;
			var FetchedItemId=request.getParameter('hdnItemInternalId');
			var itemType=request.getParameter('hdnItemType');
			var whLocation=POarray["custparam_whlocation"];
			var preferBin=request.getParameter('hdnPreferBin');
			var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
			var itemunitsType = request.getParameter('hdnVUnitType');
			var blnItemUnit = request.getParameter('hdnblnItemUnit');
			var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');

			var logMsg = 'LocationId = ' + POarray["custparam_whlocation"] + '<br>';
			logMsg = logMsg + 'LocationName = ' + POarray["custparam_whlocationname"] + '<br>';
			logMsg = logMsg + 'POarray["custparam_itemtype"] = ' + POarray["custparam_itemtype"] + '<br>';
			logMsg = logMsg + 'POarray["custparam_fetcheditemid"] = ' + POarray["custparam_fetcheditemid"] + '<br>';
			logMsg = logMsg + 'POarray["custparam_fetcheditemname"] = ' + POarray["custparam_fetcheditemname"] + '<br>';
			logMsg = logMsg + 'getStockConversionRate = ' + getStockConversionRate + '<br>';
			logMsg = logMsg + 'itemunitsType = ' + itemunitsType + '<br>';
			logMsg = logMsg + 'blnItemUnit = ' + blnItemUnit + '<br>';
			nlapiLogExecution('ERROR', 'Processing RF - BIN', logMsg);

			if(optedEvent != 'Back (F7)')
			{

				POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
				POarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'));
				var isFromStatusChange = request.getParameter('hdnfromstatuschange');
				if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' 
					&& isFromStatusChange != undefined && isFromStatusChange=='T' )
				{
					POarray["custparam_pagecount"]=0;
					POarray["custparam_error"] = '';
					//POarray["custparam_uomprevselected"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
					return;
				}

				if(request.getParameter('cmdNextList')=="Next")
				{
					POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+1;
					POarray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
					return;
				}
				if(request.getParameter('cmdPrevList')=="Prev")
				{
					POarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-1;
					POarray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
					return;
				}
				if(enterBin==null || enterBin =='' || enterBin=='null' || enterBin=='undefined' && (preferBin!=null && preferBin!='' && preferBin!='null' && preferBin!='undefined'))
				{
					enterBin = preferBin;
				}
				if (enterBin != null && enterBin!="")
				{			
					var binInternalId='';
					var vLocationType = '';
					var vLocationTypeID = '';
					var selectedStatus='';
					var selectedStatusName='';
				var resultbinValidationDetails = null;

				resultbinValidationDetails = fnbinValidationDetails(enterBin,whLocation);
				if(resultbinValidationDetails != null & resultbinValidationDetails != '')
				{
					vLocationType = resultbinValidationDetails[0];
					binInternalId = resultbinValidationDetails[1];
				}
				if(vLocationType=='WIP')
				{
					POarray["custparam_error"] = "Bin tranfer is not possible from "+vLocationType+".";
					response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
					nlapiLogExecution('ERROR', 'No Item scanned ', '');
					return;
				}
					if(binInternalId=='' || binInternalId==null)
					{									
						POarray["custparam_error"] = 'Please enter/scan valid bin location';
						response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
						return;
					}
					else
					{
						//	var objBinDetails=null;
						POarray["custparam_enteredBinID"]=binInternalId;
						POarray["custparam_enteredbin"]=enterBin;
						var availableQty=0;
						var resultobjbinDetais = null;
						var enterBinVSvBinText="T";

						/* The below function is used to fetch available qty details [excluding open picks] */

						resultobjbinDetais = fnobjbinDetais(whLocation,itemType,FetchedItemId,binInternalId,makeInvAvailFlagFromSelect,
								itemunitsType,blnItemUnit,enterBin);
						if(resultobjbinDetais != null & resultobjbinDetais != '')
						{
							enterBinVSvBinText = resultobjbinDetais[0];
							availableQty = resultobjbinDetais[1];
						}
						else
						{
							nlapiLogExecution('ERROR', 'availableQty in 2','returning back to bin scaning');
							nlapiLogExecution('ERROR', 'objbinDetais is null',resultobjbinDetais);
							POarray["custparam_error"] = 'Please enter/scan valid bin location';
							response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
							return;

						}

						if(enterBinVSvBinText == "F")
						{
							nlapiLogExecution('ERROR', 'enterBinVSvBinText',enterBinVSvBinText);
							POarray["custparam_error"] = 'Please enter/scan valid bin location';
							response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
							return;
						}

						nlapiLogExecution('ERROR', 'availableQty',availableQty);
						if(availableQty == 0 || availableQty < 0)
						{
							nlapiLogExecution('ERROR', 'availableQty before error',availableQty);
							POarray["custparam_error"] = 'Please enter/scan valid bin location';
							response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
							return;
						}


						if(enterBin!=null && enterBin!='')
							POarray["custparam_enterBin"] = enterBin;
						POarray["custparam_availableqty"] = Number(availableQty);
						POarray["custparam_lotavailableqty"] = Number(availableQty);

						if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
						{
							POarray["custparam_error"] = '';
							response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_lot_scan', 'customdeploy_wmsse_invstchange_lot_scan', false, POarray);
							nlapiLogExecution('ERROR', 'redirecting to lot ', '');
							return;
						}
						else
						{			
							var vStatusDetails = new Array();

							/* This function is for inv status details */

							vStatusDetails = fnobjBinStatusDetails(itemType,FetchedItemId,binInternalId,whLocation,itemunitsType,blnItemUnit);
							nlapiLogExecution('DEBUG', 'vStatusDetails', vStatusDetails.length);

							if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' &&
									vStatusDetails != 'undefined' && vStatusDetails != undefined &&
									vStatusDetails.length != null && vStatusDetails.length == 1)
							{
								var currSelectedRow= vStatusDetails[0];
								selectedStatus = currSelectedRow[0];
								selectedStatusName = currSelectedRow[1];
								POarray["custparam_invtstatusName"] = selectedStatusName;
								POarray["custparam_enteredstatus"] = selectedStatus;

							}
							else
							{
								response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_stat_scan', 'customdeploy_wmsse_invstchange_stat_scan', false, POarray);
								return;  

							}							
//							if there is a single status then directly to status change screen
							response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_changstat', 'customdeploy_wmsse_invstchange_changstat', false, POarray);
							return;  
						}
					}

				} 
				else
				{
					POarray["custparam_error"] = 'Please enter/scan bin location';
					response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
					nlapiLogExecution('ERROR', 'No Item scanned ', '');
					return;
				}

			} 
			else 
			{
				POarray["custparam_error"] = '';
				response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_item_scan', 'customdeploy_wmsse_invstchange_item_scan', false, POarray);
				return;
			}

		}
		catch(e)
		{
			var msgstring= e.toString();
			var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
			nlapiLogExecution('ERROR', 'inside catch exception', msg);
			POarray["custparam_error"] = msg;
			response.sendRedirect('SUITELET', 'customscript_wmsse_invstchange_bin_scan', 'customdeploy_wmsse_invstchange_bin_scan', false, POarray);
			return;
		}

	} //end of first if condition
} //end of function.





/**
 * Fetching item details based on itemid.
 * @param vIntId
 * @param whLocation
 * @param departments
 * @param classes
 * @returns {vitemTotalDetailsArr}
 */

function fngetItemdetails(vIntId,whLocation,departments,classes)
{

	var vitemDetailsArr=new Array();
	var vitemTotalDetailsArr=new Array();
	var vitemBinDetailsArr=new Array();
	var itemfilters=new Array();
	itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',vIntId));

	if(whLocation != null && whLocation !='' && whLocation != null)
	{
		itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
	}

	var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);

	if(itemresults!=null && itemresults!='')
	{
		for(var itemresItr=0;itemresItr<itemresults.length;itemresItr++)
		{
			if(itemresults[itemresItr].getValue('preferredbin')=="T" && itemresults[itemresItr].getValue('location','binnumber') == whLocation)
			{
				vitemBinDetailsArr.push(itemresults[itemresItr].getValue('binnumber'));
			}
		}
		vitemDetailsArr.push(itemresults[0].getValue('custitem_wmsse_mix_item'));
		vitemDetailsArr.push(itemresults[0].getValue('custitem_wmsse_mix_lot'));
		vitemDetailsArr.push(itemresults[0].getValue('custitem_wmsse_itemgroup'));
		vitemDetailsArr.push(itemresults[0].getValue('custitem_wmsse_itemfamily'));
		vitemDetailsArr.push(itemresults[0].getText('stockunit'));
		vitemDetailsArr.push(itemresults[0].getValue('unitstype'));
		vitemDetailsArr.push(itemresults[0].getValue('locationinvtclassification'));
		
		if(departments == true)
			vitemDetailsArr.push(itemresults[0].getValue('department'));
		if(classes == true)
			vitemDetailsArr.push(itemresults[0].getValue('class'));
		
		var currRow = [vitemBinDetailsArr,vitemDetailsArr];
		vitemTotalDetailsArr.push(currRow);
	}

	itemfilters=null;
	itemresults=null;
	nlapiLogExecution('ERROR','vitemBinDetailsArr',vitemBinDetailsArr);
	nlapiLogExecution('ERROR','vitemDetailsArr',vitemDetailsArr);
	nlapiLogExecution('ERROR','vitemTotalDetailsArr',vitemTotalDetailsArr);
	return vitemTotalDetailsArr;
}


/**
 * Fetching Bin Validation details.
 * @param enterBin
 * @param whLocation
 * @returns {binValidationDetailsArr}
 */
function fnbinValidationDetails(enterBin,whLocation)
{
	try
	{
		var binValidationDetailsArr=new Array();
		var binInternalId='';
		var vLocationType = '';
		var vLocationTypeID = '';
		
		var stgLocId=new Array();
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
					stgLocId.push(BinlocationTypes[b].getId());
					break;
				}
			}
		}

		
		var filter=new Array(); 
		filter.push(new nlobjSearchFilter('binnumber',null,'is',enterBin));
		filter.push(new nlobjSearchFilter('inactive',null, 'is','F'));
		if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
			filter.push(new nlobjSearchFilter('location',null,'anyof',whLocation));

		var searchrecord=nlapiSearchRecord('Bin','customsearch_wmsse_binnumbers',filter,null);

		if(searchrecord!=null && searchrecord!="")
		{	
			vLocationType=searchrecord[0].getText('custrecord_wmsse_bin_loc_type');
			vLocationTypeID=searchrecord[0].getValue('custrecord_wmsse_bin_loc_type');
			nlapiLogExecution('ERROR','vLocationType',vLocationType);
			if((vLocationType == '' || vLocationType == 'null' || vLocationType == null) ||
					(stgLocId.indexOf(searchrecord[0].getValue('custrecord_wmsse_bin_loc_type')!=-1) && 
							(searchrecord[0].getValue('custrecord_wmsse_bin_stg_direction')==1)))
				binInternalId=searchrecord[0].getId();
		}
		binValidationDetailsArr.push(vLocationType);
		binValidationDetailsArr.push(binInternalId);
	}
	catch (exp) {
		binInternalId='';
		binValidationDetailsArr.push(vLocationType);
		binValidationDetailsArr.push(binInternalId);
		nlapiLogExecution('Debug', 'Exception in fnbinValidationDetails: ', exp);
		return binValidationDetailsArr;
	}
	cols=null;
	filter=null;
	nlapiLogExecution('ERROR','binValidationDetailsArr in function fnbinValidationDetails',binValidationDetailsArr);
	return binValidationDetailsArr;
}

/* The below function is used to fetch available qty details [excluding open picks] */

function fnobjbinDetais(whLocation,itemType,FetchedItemId,binInternalId,makeInvAvailFlagFromSelect,itemunitsType,
		blnItemUnit,enterBin)
{
	var logMsg = 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'itemType = ' + itemType + '<br>';
	logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
	logMsg = logMsg + 'binInternalId = ' + binInternalId + '<br>';
	logMsg = logMsg + 'makeInvAvailFlagFromSelect = ' + makeInvAvailFlagFromSelect + '<br>';
	logMsg = logMsg + 'itemunitsType = ' + itemunitsType + '<br>';
	logMsg = logMsg + 'blnItemUnit = ' + blnItemUnit + '<br>';
	logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
	nlapiLogExecution('ERROR', 'into fnobjbinDetais', logMsg);

	var objbinDetaisArr = new Array();
	var availableQty = 0;
	var enterBinVSvBinText = "T";
	var vmakeInvAvailFlag = "T";
	var fields = ['makeinventoryavailable'];
	var vLocDetails= nlapiLookupField('location',whLocation,fields);
	vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;

	if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" ||
			itemType=="serializedassemblyitem")
	{
		//To get the status and respective quantity 

		var objBinDetails = [];

		var searchName = 'customsearch_wmsse_invtbalance_invt_item';
		if(itemType == "inventoryitem" || itemType == "assemblyitem")
		{
			searchName = 'customsearch_wmsse_invtbalance_invt_item';
		}
		else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") 
		{
			searchName = 'customsearch_wmsse_invtbalance_serialsrh';

		}

		var result=nlapiLoadSearch('InventoryBalance', searchName);

		if(FetchedItemId != null && FetchedItemId != '' && FetchedItemId != 'null')
			result.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
		if(binInternalId !=null && binInternalId!='' && binInternalId!='null')
			result.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
		if(whLocation!= null && whLocation!= '' && whLocation!= 'null')
			result.addFilter(new nlobjSearchFilter('location',null, 'anyof', whLocation));

		result.addFilter(new nlobjSearchFilter('available',null, 'greaterthan', 0));
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
			return true;                // return true to keep iterating
				});

	}
	else
	{


		var objBinDetails = [];
		var result=nlapiLoadSearch('InventoryBalance', 'customsearch_wmsse_inventorybalance');

		if(FetchedItemId != null && FetchedItemId != '' && FetchedItemId != 'null')
			result.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
		if(binInternalId !=null && binInternalId!='' && binInternalId!='null')
			result.addFilter(new nlobjSearchFilter('binnumber',null, 'is', binInternalId));
		if(whLocation!= null && whLocation!= '' && whLocation!= 'null')
			result.addFilter(new nlobjSearchFilter('location',null, 'anyof', whLocation));
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
			return true;                // return true to keep iterating
				});

	}


	if(objBinDetails != null || objBinDetails != '' || objBinDetails != 'null' || objBinDetails !='undefined' 
		|| objBinDetails.length != null)
	{
		if(objBinDetails.length > 0)
		{
			nlapiLogExecution('DEBUG', 'objBinDetails length in fnobjbinDetais',objBinDetails.length);
			if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" 
				|| itemType=="serializedassemblyitem")
			{
				var vOpenPickDetails=getOPenTaskPickBinDetails(FetchedItemId,binInternalId,whLocation,
						itemunitsType,blnItemUnit);
				var vOpenPickQty=0;
				var vBinOpenTaskBinQtyArr = "";
				/*if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
				{
					vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
					vOpenPickQty = vBinOpenTaskBinQtyArr[0];
				}
				if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
					vOpenPickQty =0;
				nlapiLogExecution('DEBUG', 'vOpenPickQty fnobjbinDetais',vOpenPickQty); */
				for(var BinDetailsItr=0;BinDetailsItr<objBinDetails.length;BinDetailsItr++)
				{
					var vBinQtyAvail='';
					var vBinText='';
					var statusId='';
					var status = '';

					if(itemType == "inventoryitem" || itemType == "assemblyitem")
					{
						if(vmakeInvAvailFlag == "T")
							vBinQtyAvail=objBinDetails[BinDetailsItr].getValue('available');
						else
							vBinQtyAvail=objBinDetails[BinDetailsItr].getValue('onhand');											

						vBinText=objBinDetails[BinDetailsItr].getText('binnumber');
						statusId = objBinDetails[BinDetailsItr].getValue('status');
						status = objBinDetails[BinDetailsItr].getText('status');
					}
					else
					{
						if(vmakeInvAvailFlag == "T")
							vBinQtyAvail=objBinDetails[BinDetailsItr].getValue('available',null,'sum');
						else
							vBinQtyAvail=objBinDetails[BinDetailsItr].getValue('onhand',null,'sum');								

						vBinText=objBinDetails[BinDetailsItr].getText('binnumber',null,'group');
						statusId = objBinDetails[BinDetailsItr].getValue('status',null,'group');
						status = objBinDetails[BinDetailsItr].getText('status',null,'group');
					}


					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{
						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinStatusArr = vOpenPickDetails[3];

						nlapiLogExecution('DEBUG', 'vOpenPickQtyArr in fnobjbinDetais',vOpenPickQtyArr);
						nlapiLogExecution('DEBUG', 'vBinStatusArr in fnobjbinDetais',vBinStatusArr);

						if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined'
							&& vBinStatusArr != undefined)
						{
							for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
							{
								var opentaskStatus = vBinStatusArr[binIterator];

								if(opentaskStatus == statusId)
								{
									vOpenPickQty = vOpenPickQtyArr[binIterator];
									break;
								}
							}
						}

					}

					if(enterBin != vBinText)
					{
						enterBinVSvBinText = "F";
					}

					var logMsg = 'enterBin = ' + enterBin + '<br>';
					logMsg = logMsg + 'vBinText = ' + vBinText + '<br>';
					logMsg = logMsg + 'vBinQtyAvail = ' + vBinQtyAvail + '<br>';
					logMsg = logMsg + 'availableQty = ' + availableQty + '<br>';

					nlapiLogExecution('ERROR', 'In fnobjbinDetais INV and SER - BIN', logMsg);

					if(vBinQtyAvail > 0)
					{
						availableQty=Big(availableQty).plus(vBinQtyAvail);
					}
				}
				nlapiLogExecution('DEBUG', 'availableQty in fnobjbinDetais mid',availableQty);
				availableQty = Big(availableQty).minus(vOpenPickQty);
				nlapiLogExecution('DEBUG', 'availableQty in fnobjbinDetais after',availableQty);

			}
			else
			{
				var vOpenPickDetails=getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,whLocation,itemunitsType,blnItemUnit);
				var vBinOpenLotArr="";
				if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
				{
					vBinOpenLotArr = vOpenPickDetails[3];
				}
				for(var BinDetailsItr=0;BinDetailsItr<objBinDetails.length;BinDetailsItr++)
				{
					var vBinQtyAvail='';
					var vBinText='';
					var vInvLot='';
					var statusId='';
					var vOpenPickQty = 0;

					if(itemType == "inventoryitem" || itemType == "assemblyitem")
					{
						if(vmakeInvAvailFlag == "T")
							vBinQtyAvail=objBinDetails[BinDetailsItr].getValue('available');
						else
							vBinQtyAvail=objBinDetails[BinDetailsItr].getValue('onhand');

						vBinText=objBinDetails[BinDetailsItr].getText('binnumber');
						vInvLot=objBinDetails[BinDetailsItr].getText('inventorynumber');
					}
					else
					{
						if(vmakeInvAvailFlag == "T")
							vBinQtyAvail=objBinDetails[BinDetailsItr].getValue('available',null, 'sum');
						else
							vBinQtyAvail=objBinDetails[BinDetailsItr].getValue('onhand',null, 'sum');

						vBinText=objBinDetails[BinDetailsItr].getText('binnumber', null, 'group');
						vInvLot=objBinDetails[BinDetailsItr].getText('inventorynumber',null,'group');
						statusId = objBinDetails[BinDetailsItr].getValue('status',null,'group');

					}

					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{
						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinLotArr = vOpenPickDetails[3];
						var	vBinStatusArr = vOpenPickDetails[5];
						nlapiLogExecution('Debug','vBinStatusArr',vBinStatusArr);
						if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null'
							&& vBinStatusArr != 'undefined' && vBinStatusArr != undefined)
						{
							for(var binItr=0;binItr<vBinStatusArr.length;binItr++)
							{
								var opentaskStatus = vBinStatusArr[binItr];
								var opentaskLotText =vBinLotArr[binItr];

								var logMsg = 'opentaskStatus = ' + opentaskStatus + '<br>';
								logMsg = logMsg + 'statusId = ' + statusId + '<br>';
								logMsg = logMsg + 'vInvLot = ' + vInvLot + '<br>';
								logMsg = logMsg + 'opentaskLotText = ' + opentaskLotText + '<br>';

								nlapiLogExecution('ERROR', 'In fnobjbinDetais LOT - BIN', logMsg);

								if(opentaskStatus == statusId && vInvLot==opentaskLotText)
								{
									vOpenPickQty = vOpenPickQtyArr[binItr];
									break;
								}
							}
						}

						nlapiLogExecution('Debug','vOpenPickQty',vOpenPickQty);

					}

					if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
						vOpenPickQty =0;

					vBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPickQty));
					if(enterBin != vBinText)
					{
						enterBinVSvBinText = "F";

					}

					if(vBinQtyAvail > 0)
					{
						availableQty=Number(Big(availableQty).plus(vBinQtyAvail));
					}


				}
			}

			objbinDetaisArr.push(enterBinVSvBinText);
			objbinDetaisArr.push(availableQty);
		}


	}
	nlapiLogExecution('ERROR', 'objbinDetaisArr before returning from fnobjbinDetais ',objbinDetaisArr);
	return objbinDetaisArr;
}

/* This function is for inv status details */

function fnobjBinStatusDetails(itemType,FetchedItemId,binInternalId,whLocation,itemunitsType,blnItemUnit)
{
	var objBinStatusDetails = new Array();
	var vStatusResults = null;
	var vStatusDetails = new Array();

	var searchName = 'customsearch_wmsse_invtbalance_invt_item';
	if(itemType == "inventoryitem" || itemType == "assemblyitem")
	{
		searchName = 'customsearch_wmsse_invtbalance_invt_item';
	}
	else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") 
	{
		searchName = 'customsearch_wmsse_invtbalance_serialsrh';

	}

	vStatusResults = nlapiLoadSearch('InventoryBalance',searchName);		

	var logMsg = 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
	logMsg = logMsg + 'binInternalId = ' + binInternalId + '<br>';
	logMsg = logMsg + 'itemType = ' + itemType + '<br>';
	logMsg = logMsg + 'itemunitsType = ' + itemunitsType + '<br>';
	logMsg = logMsg + 'blnItemUnit = ' + blnItemUnit + '<br>';
	nlapiLogExecution('ERROR', 'Processing InventoryBalance saved', logMsg);


	var invfilterStrat =  new Array();
	if(whLocation != null && whLocation != '')
		vStatusResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', whLocation));
	if(FetchedItemId != null && FetchedItemId != '')
		vStatusResults.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
	if(binInternalId!= null && binInternalId!= '')
		vStatusResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
	vStatusResults.addFilter(new nlobjSearchFilter('available',null, 'greaterthan', 0));

	var resLen = vStatusResults.runSearch();
	var invItr=0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		invItr++;
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
		nlapiLogExecution('DEBUG', 'objBinStatusDetails.length', objBinStatusDetails.length);
		if(itemType == "lotnumberedinventoryitem" || itemType =="lotnumberedassemblyitem")
		{
			var vOpenPickDetails = getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,
					whLocation,itemunitsType,blnItemUnit);
		}
		else
		{
			var vOpenPickDetails = getOPenTaskPickBinDetails(FetchedItemId,binInternalId,
					whLocation,itemunitsType,blnItemUnit,'','');
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
			nlapiLogExecution('DEBUG', 'vBinQtyAvail', vBinQtyAvail);
			nlapiLogExecution('DEBUG', 'vstatus', status);
			var openPickQty = 0;
			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			{

				if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
				{

					nlapiLogExecution('DEBUG', 'vOpenPickDetails.length', vOpenPickDetails.length);
					var	vOpenPickQtyArr = vOpenPickDetails[1];
					var	vBinLotArr = vOpenPickDetails[3];
					var	vBinStatusArr = vOpenPickDetails[5];
					nlapiLogExecution('Debug','vBinStatusArr',vBinStatusArr);
					if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null'
						&& vBinStatusArr != 'undefined' && vBinStatusArr != undefined)
					{
						for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
						{
							var opentaskStatus = vBinStatusArr[binIterator];
							var opentaskLotText =vBinLotArr[binIterator];


							var logMsg = 'opentaskStatus = ' + opentaskStatus + '<br>';
							logMsg = logMsg + 'statusId = ' + statusId + '<br>';
							logMsg = logMsg + 'eneteredLotTxt = ' + eneteredLotTxt + '<br>';
							logMsg = logMsg + 'opentaskLotText = ' + opentaskLotText + '<br>';
							logMsg = logMsg + 'opentaskLotText = ' + opentaskLotText + '<br>';

							nlapiLogExecution('ERROR', 'In fnobjBinStatusDetails - BIN', logMsg);

							if(opentaskStatus == statusId && eneteredLotTxt==opentaskLotText)
							{
								openPickQty = vOpenPickQtyArr[binIterator];
								break;
							}
						}
					}

					nlapiLogExecution('Debug','openPickQty',openPickQty);

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

			vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);
			nlapiLogExecution('DEBUG', 'openPickQty', openPickQty);
			nlapiLogExecution('DEBUG', 'vBinQtyAvail', vBinQtyAvail);
			if(parseFloat(vBinQtyAvail) > 0)
			{
				var row= [statusId,status];
				vStatusDetails.push(row);
			}
			if(vStatusDetails.length >= 3)
			{
				break;
			}
		}

	}
	nlapiLogExecution('DEBUG', 'vStatusDetails in function fnobjBinStatusDetails', vStatusDetails);
	return vStatusDetails;

}
