/**
 * Script Description
 * This script is used to scan the item for Replenishment
 */
/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function CheckInBin(request, response)
{
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		//Variable Declaration
		var getOptedField = request.getParameter('custparam_option');
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var html = '';
		var itemid = '';
		itemid = request.getParameter('custparam_itemid');
		var getActualBeginDate = request.getParameter('custparam_actualbegindate');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var whLocation = request.getParameter('custparam_whlocation');
		var itemType=request.getParameter('custparam_itemtype');
		var getReplenItem = request.getParameter('custparam_item');
		var getFetchedItemId = request.getParameter('custparam_itemid');
		getItemInternalId = request.getParameter('custparam_itemid');
		var vitemgroup = request.getParameter('custparam_itemgroup');
		var vitemfamily = request.getParameter('custparam_itemfamily');
		var vreplenminqty = request.getParameter('custparam_replenminqty');
		var vreplenmaxqty = request.getParameter('custparam_replenmaxqty');
		var vreplenqty = request.getParameter('custparam_replenqty');
		var vreplenroundqty = request.getParameter('custparam_replenroundqty');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		if(vreplenminqty==''||vreplenminqty=='null'||vreplenminqty==undefined||vreplenminqty==null)
			vreplenminqty=0;
		if(vreplenmaxqty==''||vreplenmaxqty=='null'||vreplenmaxqty==undefined||vreplenmaxqty==null)
			vreplenmaxqty=0;
		if(vreplenqty==''||vreplenqty=='null'||vreplenqty==undefined||vreplenqty==null)
			vreplenqty=0;
		if(vreplenroundqty==''||vreplenroundqty=='null'||vreplenroundqty==undefined
				||vreplenroundqty==null)
			vreplenroundqty=0;

		//Checking whether the Inventory Status feature is enabled or not.
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var vUnits = request.getParameter("custparam_uom"); 
		var getPageCount = request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;

		if(vUnits ==null || vUnits =='' || vUnits =='null' || vUnits =='undefined' || 
				vUnits =='- None -')
		{
			vUnits = '';
		}

		var vConversionRate = request.getParameter("custparam_conversionrate");
		var fromBin = request.getParameter("custparam_frombin");
		var toBin = request.getParameter("custparam_tobin");

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
		}

		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');

		var strvUnits = "";
		var headerVar='Replenishment';
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');

		if(getItemRecQty == '' || getItemRecQty == null)
			getItemRecQty = 0;
		if(getItemRemQty == '' || getItemRemQty == null)
			getItemRemQty = 0;

		nlapiLogExecution('DEBUG', 'getItemRemQty :  getItemRecQty',
				getItemRemQty + " : " + getItemRecQty);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+headerVar;
		var getPreferBin='';

		var blnItemUnit="";
		var VUnitType ="";

		var itemfilters=new Array();
		if(getItemInternalId != null && getItemInternalId != '')
			itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));		

		//No need to use Load Search here as this search returns only one record.
		var itemresults= nlapiSearchRecord('item',
				'customsearch_wmsse_replen_item_srh', itemfilters, null);
		if(itemresults!=null && itemresults!='')
		{
			blnItemUnit = itemresults[0].getText('stockunit');
			VUnitType = itemresults[0].getValue('unitstype');
		}

		var getStockRate=1;
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
			if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' &&
					blnItemUnit !='undefined' && blnItemUnit !='- None -')
			{
				getStockRate = getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
				nlapiLogExecution('DEBUG', 'getStockRate', getStockRate); 
			}

			if(getStockRate == null || getStockRate == '' || getStockRate == 'null' ||
					getStockRate == undefined)
			{
				getStockRate = 1;
			}
		}
		var vUnitsText="";

		if(blnItemUnit != null && blnItemUnit != '' && blnItemUnit !='null' && 
				blnItemUnit !='undefined' && blnItemUnit !='- None -')
		{
			vUnitsText = 'In '+ blnItemUnit;
		}
		if(vBaseUnit != null && vBaseUnit != '' && vBaseUnit !='null' && 
				vBaseUnit !='undefined' && vBaseUnit !='- None -')
		{
			vBaseUnit = 'In '+vBaseUnit;
		}		

		var qtyUomCntrlSelectedConversionRate =getStockRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && 
				qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}


		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
			if((errMsg == "Please configure stage locations" || 
					errMsg == "This item has mixflag false, please configure new bin locations" 
						|| errMsg =="Please configure bin locations" 
							|| errMsg =="Please configure put strategies and bin locations") 
							&& ((vBinDetails.length != null &&  vBinDetails.length > 0) || 
									(getPreferBin != null && getPreferBin != 'null' && 
											getPreferBin !='' && getPreferBin != 'undefined' && 
											systemRule == 'N')))
			{
				errMsg = '';
			}
		}
		if (CSSfilefound) 
		{ 
			CSSurl = CSSfilefound.getURL();
		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound=  getLoadFile('bx_loader.gif');
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");

		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' " +
		"'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<style type='text/css'>" +
		"#loading{height:500px; width:500px;position: relative;background-color: none;}" +
		".centerImage{margin-left:90px;margin-top: 90px;}</style>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";

		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML(
			"https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") +
			"' type='text/css' rel='stylesheet'>";


		//Validation function for HyperLinks
		html = html+	"	<script type='text/javascript'>function DisplayBin(val,aQty,rate) {" +
		" var sessionObj = document.getElementById('hdnsession').value;" +
		"if(sessionObj != '' && sessionObj != null){" +
		"document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}" +
		"else{document.getElementById('hdnsession').value = 'session';" +
		"document.getElementById('txtbin').value=val;document.getElementById('vrate').value=rate;" +
		"document.getElementById('availqty').value=aQty;document.forms['_rf_checkin_item'].submit();" +
		" document.getElementById('loading').style.display = ''; return true;}}</script>";

		//Validation function for buttons
		html = html +"	<script type='text/javascript'>function validateForm() {" +
		" if(document.getElementById('txtbin').value == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan bin location';" +
		" document.getElementById('txtbin').focus();return false;} " +
		"else if(document.getElementById('txtbin').value ==document.getElementById('hdntoBin').value)" +
		"{document.getElementById('div_error').innerHTML ='Please enter/scan valid bin location';" +
		"document.getElementById('txtbin').focus();return false;}" +
		" else{document.getElementById('loading').style.display = ''; return true;}}</script>";

		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){" +
		"window.history.forward();}setTimeout('preventBack()', 0);" +
		"window.onunload=function(){null};</script>" +
		" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image'  src='"+imgUrl+"' class='centerImage' " +
		"alt='Processing Please Wait....' ></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Replenishment Bin Location</td></tr>"+
		"		<tr><td class='labelmsg'><div id='div_error' style='color:red;display:block;'>"+
		errMsg+"</div>" +
		"		</td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName +
		"</label>"+
		"			</tr>" +
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getReplenItem + "</label>"+		 
		"				<input type='hidden' name='hdnActualBeginDate' value=" + getActualBeginDate + ">"+		
		"				<input type='hidden' name='hdnActualBeginTime' value='" +
		getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnitemtype' id='hdnitemtype' value=" +
		itemType + ">"+
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" +
		getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnReplenItem' value='" + getReplenItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" +
		getPreferBin + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnvStockConversionRate' id='hdnvStockConversionRate' " +
		"value=" +getStockRate + ">"+
		"				<input type='hidden' name='hdnunitstype' id='hdnunitstype' " +
		"value=" +VUnitType + ">"+
		"				<input type='hidden' name='hdnstockunit' id='hdnstockunit' " +
		"value=" +blnItemUnit + ">"+
		"				<input type='hidden' name='hdnfromBin' id='hdnfromBin' value=" + fromBin + ">"+
		"				<input type='hidden' name='hdntoBin' id='hdntoBin' value=" + toBin + ">"+
		"				<input type='hidden' name='hdnvitemgroup' id='hdnvitemgroup' value=" +
		vitemgroup + ">"+
		"				<input type='hidden' name='hdnvitemfamily' id='hdnvitemfamily' value=" +
		vitemfamily + ">"+
		"				<input type='hidden' name='hdnvreplenminqty' id='hdnvreplenminqty' value=" +
		vreplenminqty + ">"+
		"				<input type='hidden' name='hdnvreplenmaxqty' id='hdnvreplenmaxqty' value=" +
		vreplenmaxqty + ">"+
		"				<input type='hidden' name='hdnvreplenqty' id='hdnvreplenqty' value=" +
		vreplenqty + ">"+
		"				<input type='hidden' name='hdnvreplenroundqty' id='hdnvreplenroundqty' value=" +
		vreplenroundqty + ">"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnmakeinvtflagavail' id='hdnmakeinvtflagavail' value='" + makeInvAvailFlagFromSelect + "'>"+
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+	
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>";	 

		html = html +"<tr>"+
		"				<td align = 'left' class='labelmsg'>Replen Qty: <label>" + parseFloat(parseFloat(vreplenqty).toFixed(8)) + " "
		+vUnitsText+"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(8)) +
		" " +vUnitsText+"</label>"+
		"			</tr>";
		html = html +"			<tr>";

		html = html +"				<td align = 'left' class='labelmsg'>Enter/Scan From Bin";

		html = html +"				</td>"+
		"			</tr>"+
		"			<tr>";
		html = html +"				<td align = 'left'><input name='txtbin'  class='smalltextbox' " +
		"id='txtbin' type='text'/>";
		html = html +"				</td>";
		html = html +"				<td align = 'left'><input name='availqty'  class='smalltextbox' " +
		" id='availqty' type='hidden'/>";
		html = html +"				</td>";
		html = html +"				<td align = 'left'><input name='vrate'  class='smalltextbox' " +
		" id='vrate' type='hidden'/>";
		html = html +"				</td>";

		html = html +"			</tr><tr><td></td></tr></table>"+

		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' class='defaultlink'   type='submit'" +
		" value='' onclick='return validateForm();'/></td><td>"+

		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' " +
		"onclick='return validateForm();'/>" +
		"</td><td width='20px'></td><td>"+
		"			</tr></table>"; 

		html = html + 	" <tr ><td><table  class='uomstatus-gridgap' >";			
		html = html +"<tr>";
		if(uomResult !=null &&  uomResult !='' && uomResult.length>0)
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
		if(uomResult !=null &&  uomResult !='' && uomResult.length>0)
		{
			html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUom_OnChange();'>";
			var selectedUOM = request.getParameter('custparam_uomprevselected');

			for(var uomCnt=0; uomCnt < uomResult.length; uomCnt++)
			{                    	 
				var vUOM = uomResult[uomCnt].getValue('conversionrate');
				var UOMText =uomResult[uomCnt].getValue('unitname');
				nlapiLogExecution('DEBUG', 'uomCnt,UOMText,vUOM', uomCnt+","+UOMText+","+vUOM);

				if((((selectedUOM == null && parseFloat(vConversionRate) == parseFloat(vUOM)) || 
						(selectedUOM == '' && parseFloat(vConversionRate) == parseFloat(vUOM)) ||   
						(selectedUOM =='null' && parseFloat(vConversionRate) == parseFloat(vUOM)) || 
						(selectedUOM =='undefined'  && parseFloat(vConversionRate) == parseFloat(vUOM)) || 
						(selectedUOM == undefined && parseFloat(vConversionRate) == parseFloat(vUOM)) )|| 
						(selectedUOM == vUOM)) &&(UOMText==blnItemUnit))
				{
					html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";

				}
				else
				{
					nlapiLogExecution('ERROR', 'selectedUOM else', vUOM + ' '+ UOMText);
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

			html = html +"<td><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
			if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
			{
				nlapiLogExecution('DEBUG', 'makeInvAvailFlagFromSelect 2', makeInvAvailFlagFromSelect); 

				for(var statusItr=0; statusItr < statusOptsArr.length; statusItr++)
				{                    	 
					var StatusValue = statusOptsArr[statusItr][0];
					var StatusText =statusOptsArr[statusItr][1];
					if(makeInvAvailFlagFromSelect == StatusValue)
					{
						html = html +" <option   selected  value="+StatusValue+"> "+StatusText+"</option>";

					}
					else
					{
						html = html +" <option     value="+StatusValue+"> "+StatusText+"</option>";
					}

				}
			}
			html=html+"</select></td></tr>";
		}
		html = html +"</table></td></tr>" ;

//      var itemType = nswms_GetItemType(getItemInternalId);
		var vItemTypeResult = nswms_GetItemTypedetails(getItemInternalId,whLocation);
		var itemType='';
		var vClassification='';

		if(vItemTypeResult!=''||vItemTypeResult!=null){
			    itemType      = vItemTypeResult[0].recordType;
				vClassification = vItemTypeResult[0].getValue('locationinvtclassification');
		}
		
		var toBinId=nswms_GetValidBinInternalId(toBin,whLocation,'');
		var AllowAllLots = 'T';
		if(itemType == "inventoryitem" || itemType == "assemblyitem"||
				itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
		{
			// Fetching bulk inventory locations for inventory/serialized items.
//			vBinDetails=fnGetPickBinDetails(getItemInternalId,vitemgroup,vitemfamily,null,whLocation,null,null,
//					null,null,'F',getPageCount,makeInvAvailFlagFromSelect,itemType,VUnitType,blnItemUnit,getStockRate,toBinId);
			vBinDetails=fnGetPickBinDetails(getItemInternalId,vitemgroup,vitemfamily,null,whLocation,null,null,
					null,null,'F',getPageCount,makeInvAvailFlagFromSelect,itemType,VUnitType,blnItemUnit,getStockRate,toBinId,vClassification);
		}
		else
		{
			// Fetching bulk inventory locations for lot items.
//			vBinDetails=fnGetPickBinDetailsLot(getItemInternalId,vitemgroup,vitemfamily,null,whLocation,null,null,
//					null,null,'F',getPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockRate,toBinId,AllowAllLots);
			vBinDetails=fnGetPickBinDetailsLot(getItemInternalId,vitemgroup,vitemfamily,null,whLocation,null,null,
					null,null,'F',getPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockRate,toBinId,AllowAllLots,vClassification);
		}

		var itemCount = 0;

		if(vBinDetails !=null && vBinDetails!='' && vBinDetails.length > 0  ||
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{
			html = html + 	" <tr ><td ><table  style='border-spacing: 0;' id='tblqtyUOM'>";
			html = html +	"<tr class='uir-machine-headerrow' >"+
			"				<td>Bin"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";			
			if(inventoryStatusFeature == true)
			{
				html = html +	"			<td></td><td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}
			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			{
				html = html +	"			<td></td>	" +
				"<td>Lot#";	
				html = html +"				</td>";
				html = html +	"			<td>Expiry Date";	
				html = html +"				</td>";
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			var w = 0;
			var convRate = 1;
			var selectedUOM = request.getParameter('custparam_uomprevselected');
			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && 
					selectedUOM !='undefined' && selectedUOM != undefined )
			{
				convRate = Big(getStockRate).div(selectedUOM);
			}
			for(var b=0;b<vBinDetails.length;b++)
			{
				if(b%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';

				var txtBin='';
				var binAvailQty=0;
				var binLot='';
				var currValues = vBinDetails[b];
				var lotExpiry = '';
				var inventoryStatus = '';
				if(itemType == "inventoryitem" || itemType == "assemblyitem" || 
						itemType == "serializedinventoryitem" || 
						itemType=="serializedassemblyitem")
				{
					txtBin = currValues[0];
					binAvailQty =Number((Big(currValues[1]).mul(convRate)).toFixed(8));		
					binId = currValues[2];
					inventoryStatus = currValues[4];	
				}
				else
				{

					txtBin = currValues[0];
					binAvailQty =Number((Big(currValues[1]).mul(convRate)).toFixed(8));		
					binId = currValues[2];
					inventoryStatus = currValues[6];
					if(itemType == "lotnumberedinventoryitem" || 
							itemType=="lotnumberedassemblyitem")
					{

						binLot = currValues[3];
						lotExpiry = currValues[4];
					}
				}

				var binTotQty = Number(binAvailQty);
				var linkBin = txtBin;
				var linkQty = binAvailQty;
				var stockrate = getStockRate;

				if(binId == toBinId)
				{
					w = w+1;
					continue;
				}

				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td>" +
				"<a  onclick='return DisplayBin(\""+linkBin+"\",\""+linkQty+"\",\""+stockrate+"\");' " +
				"href='#' >"+txtBin;	
				html = html +"				</a></td>";
				html = html +"				<td class='align-right'>"+parseFloat(parseFloat(binTotQty).toFixed(8));
				html = html +"				</td>";
				if(inventoryStatusFeature == true)
				{
					html = html +	"			<td></td><td  class='status-cl-display'>"+inventoryStatus;	
					html = html +"				</td>";
				}

				if(binLot!=null && binLot!='')
				{
					html = html +"				<td></td><td>"+binLot;	
					html = html +"				</td>";
					html = html +"				<td>"+lotExpiry;	
					html = html +"				</td>";
				}
				html = html +"			</tr>";

				if(parseInt(b)-parseInt(w) >=4)
					break;
			}

			html = html +	"<input type='hidden' name='hdngetPageCount' id='hdngetPageCount' value=" + getPageCount + ">";

			html = html + 	"</td></tr></table>";
		}

		html = html +"		<table>	<tr>";
		if(getPageCount>0)
		{
			html = html +"<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"<td width='20px'></td>";

		if((( vBinDetails != null && vBinDetails !='') &&(vBinDetails.length)) >= (6))
		{
			html = html +"<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"</tr>"+ 
		"		 </table>";	
		html = html + "	</table>";
		html = html + " </form>"+
		"<script type='text/javascript'>document.getElementById('txtbin').focus();</script>";
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);
	}
	else
	{
		nlapiLogExecution('DEBUG', 'Processing RF', 'Validating From Bin');
		var REArray = new Array();

		try
		{
			//Variable Declaration
			var replenBin = request.getParameter('txtbin');
			var availQty = request.getParameter('availqty');

			REArray['custparam_whlocation'] = request.getParameter('hdnWhLocation');
			REArray['custparam_whlocationname'] = request.getParameter('hdnWhLocationName');
			REArray['custparam_frombin'] = request.getParameter('txtbin');
			REArray['custparam_itemid'] = request.getParameter('hdnItemInternalId');
			REArray['custparam_item'] = request.getParameter('hdnReplenItem');
			REArray['custparam_rem_qty'] = request.getParameter('hdnItemRemQty');
			REArray['custparam_rec_qty'] = request.getParameter('hdnItemRecQty');
			REArray['custparam_itemtype'] = request.getParameter('hdnitemtype');
			REArray['custparam_uom'] = request.getParameter('hdnuom');
			REArray['custparam_stockconversionrate'] = request.getParameter('hdnvStockConversionRate');
			REArray['custparam_unitstype'] = request.getParameter('hdnunitstype');
			REArray['custparam_stockunit'] = request.getParameter('hdnstockunit');
			REArray['custparam_tobin'] = request.getParameter('hdntoBin');
			REArray['custparam_frombin'] = request.getParameter('txtbin');
			REArray['custparam_availqty'] = request.getParameter('availqty');
			REArray['custparam_itemgroup'] = request.getParameter('hdnvitemgroup');
			REArray['custparam_itemfamily'] = request.getParameter('hdnvitemfamily');
			REArray['custparam_replenminqty'] = request.getParameter('hdnvreplenminqty');
			REArray['custparam_replenmaxqty'] = request.getParameter('hdnvreplenmaxqty');
			REArray['custparam_replenqty'] = request.getParameter('hdnvreplenqty');
			REArray['custparam_replenroundqty'] = request.getParameter('hdnvreplenroundqty');
			var makeInvAvailFlagFromSelect = request.getParameter('hdnmakeinvtflagavail');
			REArray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			REArray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
			REArray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
			REArray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

			var replenItem = request.getParameter('hdnReplenItem');
			var replenItemId = request.getParameter('hdnItemInternalId');
			var whLocation = request.getParameter('hdnWhLocation');
			var whLocationName = request.getParameter('hdnWhLocationName');
			var itemType = request.getParameter('hdnitemtype');
			var optedEvent = request.getParameter('cmdPrevious');
			var stockconversionrate = request.getParameter('hdnvStockConversionRate');

			//Checking whether the Inventory Status feature is enabled or not
			var inventoryStatusFeature = isInvStatusFeatureEnabled();
			nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

			var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');

			var str = 'replenItem.' + replenItem + '<br/>';
			str = str + 'replenItemId.' + replenItemId + '<br/>';
			str = str + 'whLocation.' + whLocation + '<br/>';
			str = str + 'whLocationName.' + whLocationName + '<br/>';
			str = str + 'itemType.' + itemType + '<br/>';
			str = str + 'optedEvent.' + optedEvent + '<br/>';
			str = str + 'stockconversionrate.' + stockconversionrate + '<br/>';
			str = str + 'replenBin.' + replenBin + '<br/>';
			str = str + 'availQty.' + availQty + '<br/>';
			str = str + 'makeInventoryAvailFlag.' + makeInventoryAvailFlag + '<br/>';
			str = str + 'replenBin.' + replenBin + '<br/>';

			nlapiLogExecution('ERROR', 'Parameters in Post',str);

			if(optedEvent == 'Back (F7)')
			{
				REArray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan',
						'customdeploy_wmsse_replen_itemscan', false, REArray);
				return;
			}
			else
			{
				REArray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
				var binInternalId='';
				var isFromStatusChange = request.getParameter('hdnfromstatuschange');
				nlapiLogExecution('DEBUG', 'isFromStatusChange', isFromStatusChange);

				if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' 
					&& isFromStatusChange != undefined && isFromStatusChange=='T' )
				{

					REArray["custparam_error"] = '';
					REArray["custparam_uomprevselected"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan', 
							'customdeploy_wmsse_replen_binscan', false, REArray);
					return;

				}
				if(request.getParameter('cmdNextList')=="Next")
				{
					REArray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+1;
					REArray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan', 'customdeploy_wmsse_replen_binscan', false, REArray);
					return;
				}
				if(request.getParameter('cmdPrevList')=="Prev")
				{
					REArray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-1;
					REArray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan', 'customdeploy_wmsse_replen_binscan', false, REArray);
					return;
				}


				if(itemType!='noninventoryitem'&& itemType!='otherchargeitem' && itemType != 'Service' && 
						itemType !='serviceitem' && itemType !='downloaditem' &&
						itemType != 'Download Item' 
							&& itemType != 'giftcertificateitem')
				{


					if((replenBin=="" || replenBin==null || replenBin=='null'))
					{
						REArray["custparam_error"] = 'Please enter/scan bin location';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
								'customdeploy_wmsse_replen_binscan', false, REArray);
						return;
					}

					var binFilter=new Array(); 

					if(replenBin!=null && replenBin!='' && replenBin!='null' && replenBin!='undefined')
						binFilter.push(new nlobjSearchFilter('binnumber',null,'is',replenBin));									

					if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
						binFilter.push(new nlobjSearchFilter('location',null,'anyof',whLocation));		

					//No need to use Load Search here as this search returns only one record.
					var searchrecord=nlapiSearchRecord('Bin','customsearch_wmsse_guireplen_binsrh',binFilter);
					if(searchrecord!=null && searchrecord!="")
					{							
						binInternalId=searchrecord[0].getId();
					}

					if(binInternalId=='' || binInternalId==null ||
							replenBin == request.getParameter('hdntoBin') )
					{
						REArray["custparam_error"] = 'Please enter/scan valid bin location';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
								'customdeploy_wmsse_replen_binscan', false, REArray);
						return;
					}
					var vmakeInvAvailFlag = "T";
					var fields = ['makeinventoryavailable'];
					var vLocDetails= nlapiLookupField('location',whLocation,fields);
					vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
					var availableQty=0;
					if(itemType == "inventoryitem" || itemType=="assemblyitem" || 
							itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
					{
						if(	inventoryStatusFeature == true)
						{

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

							if(replenItemId != null && replenItemId != '')
								result.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', replenItemId));
							if(binInternalId !=null && binInternalId!='')
								result.addFilter(new nlobjSearchFilter('binnumber',null, 'is', binInternalId));
							if(whLocation!= null && whLocation!= '')
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

							//The below is the mechanism to retrieve more than 1K records from a search without recursive calls.
							var resultSet = result.runSearch();
							var resultsPage = resultSet.getResults(0, 1000);
							var offset = 0;
							while (!!resultsPage && resultsPage.length > 0) 
							{
								objBinDetails = objBinDetails.concat(resultsPage);
								offset += 1000;
								resultsPage = resultSet.getResults(offset, offset + 1000);
							}

						}
						else
						{
							var filterStrat = new Array();

							if(replenItemId != null && replenItemId != '')
							{
								filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', replenItemId));
							}
							if(whLocation!= null && whLocation!= '')
							{
								filterStrat.push(new nlobjSearchFilter(
										'location','binonhand', 'anyof', whLocation));
							}
							if(binInternalId!= null && binInternalId!= '')
							{
								filterStrat.push(new nlobjSearchFilter(
										'binnumber','binonhand', 'anyof', binInternalId));
							}

							objBinDetails = new nlapiSearchRecord('item',
									'customsearch_wmsse_itemwise_inventory',filterStrat, null);
						}
					}
					else
					{
						if(inventoryStatusFeature == true)
						{

							var objBinDetails = [];
							var result=nlapiLoadSearch('InventoryBalance', 'customsearch_wmsse_inventorybalance');

							if(replenItemId != null && replenItemId != '')
								result.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', replenItemId));
							if(binInternalId !=null && binInternalId!='')
								result.addFilter(new nlobjSearchFilter('binnumber',null, 'is', binInternalId));
							if(whLocation!= null && whLocation!= '')
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

							//The below is the mechanism to retrieve more than 1K records from a search without recursive calls.
							var resultSet = result.runSearch();
							var resultsPage = resultSet.getResults(0, 1000);
							var offset = 0;
							while (!!resultsPage && resultsPage.length > 0) 
							{
								objBinDetails = objBinDetails.concat(resultsPage);
								offset += 1000;
								resultsPage = resultSet.getResults(offset, offset + 1000);
							}

						}
						else
						{
							var filterStrat = new Array();

							if(replenItemId != null && replenItemId != '')
							{
								filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', replenItemId));
							}
							if(whLocation!= null && whLocation!= '')
							{
								filterStrat.push(new nlobjSearchFilter(
										'location','inventoryNumberBinOnHand', 'anyof', whLocation));
							}
							if(binInternalId!= null && binInternalId!= '')
							{
								filterStrat.push(new nlobjSearchFilter(
										'binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));
							}

							objBinDetails = new nlapiSearchRecord('item',
									'customsearch_wmsse_itemwise_lots',filterStrat, null);
						}
					}

					if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' ||
							objBinDetails =='undefined' || objBinDetails.length == null)
					{
						REArray["custparam_error"]='Insufficient inventory for this item and bin combination';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
								'customdeploy_wmsse_replen_binscan', false, REArray);
						return;
					}
					else
					{
						if(objBinDetails.length > 0)
						{
							nlapiLogExecution('DEBUG', 'objBinDetails.length',objBinDetails.length); 

							if(itemType == "inventoryitem" || itemType=="assemblyitem" ||
									itemType == "serializedinventoryitem" || 
									itemType=="serializedassemblyitem")
							{
								var vOpenPickDetails=getOPenTaskPickBinDetails(replenItemId,binInternalId,
										whLocation,REArray['custparam_unitstype'],REArray['custparam_stockunit']);//To get open picks
								var vOpenPickQty=0;
								var vBinOpenTaskBinQtyArr = "";
								if(vOpenPickDetails!=null && vOpenPickDetails !='' && 
										vOpenPickDetails.length >0)
								{
									vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
									vOpenPickQty = vBinOpenTaskBinQtyArr[0];
								}
								if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' 
									|| vOpenPickQty == '- None -')
									vOpenPickQty =0;
								nlapiLogExecution('DEBUG', 'vOpenPickQty',vOpenPickQty); 
								for(var p=0;p<objBinDetails.length;p++)
								{
									var vBinQtyAvail='';
									var vBinText='';

									if(inventoryStatusFeature == true)
									{	
										if(itemType == "inventoryitem" || itemType == "assemblyitem")
										{
											if(vmakeInvAvailFlag == "T")
												vBinQtyAvail=objBinDetails[p].getValue('available');
											else
												vBinQtyAvail=objBinDetails[p].getValue('onhand');											

											vBinText=objBinDetails[p].getText('binnumber');
										}
										else
										{
											if(vmakeInvAvailFlag == "T")
												vBinQtyAvail=objBinDetails[p].getValue('available',null,'sum');
											else
												vBinQtyAvail=objBinDetails[p].getValue('onhand',null,'sum');								

											vBinText=objBinDetails[p].getText('binnumber',null,'group');
										}
									}
									else
									{
										if(vmakeInvAvailFlag == "T")
										{
											vBinQtyAvail=objBinDetails[p].getValue(
													'quantityavailable','binonhand');
										}
										else
										{
											vBinQtyAvail=objBinDetails[p].getValue(
													'quantityonhand','binonhand');
										}
										vBinText=objBinDetails[p].getText('binnumber','binonhand');
									}

									if(replenBin != vBinText)
									{
										REArray["custparam_error"] = 'Please enter/scan valid bin location';
										response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
												'customdeploy_wmsse_replen_binscan', false, REArray);
										return;
									}
									nlapiLogExecution('DEBUG', 'availableQty', availableQty);
									nlapiLogExecution('DEBUG', 'vBinQtyAvail', vBinQtyAvail);


									if(vBinQtyAvail > 0)
									{
										availableQty=Number(Big(availableQty).plus(vBinQtyAvail));
									}
								}

								availableQty = Big(availableQty).minus(vOpenPickQty);

							}
							else
							{
								var vOpenPickDetails=getOPenTaskPickBinDetailsLot(replenItemId,binInternalId,
										whLocation,REArray['custparam_unitstype'],REArray['custparam_stockunit']);//To get open picks
								var vBinOpenLotArr="";
								if(vOpenPickDetails!=null && vOpenPickDetails !='' && 
										vOpenPickDetails.length >0)
								{
									vBinOpenLotArr = vOpenPickDetails[3];
								}

								for(var p=0;p<objBinDetails.length;p++)
								{
									var vBinQtyAvail='';
									var vBinText='';
									var vInvLot='';
									if(inventoryStatusFeature == true)
									{										
										if(itemType == "inventoryitem" || itemType == "assemblyitem")
										{
											if(vmakeInvAvailFlag == "T")
												vBinQtyAvail=objBinDetails[p].getValue('available');
											else
												vBinQtyAvail=objBinDetails[p].getValue('onhand');

											vBinText=objBinDetails[p].getText('binnumber');
											vInvLot=objBinDetails[p].getText('inventorynumber');
										}
										else
										{
											if(vmakeInvAvailFlag == "T")
												vBinQtyAvail=objBinDetails[p].getValue('available',null, 'sum');
											else
												vBinQtyAvail=objBinDetails[p].getValue('onhand',null, 'sum');

											vBinText=objBinDetails[p].getText('binnumber', null, 'group');
											vInvLot=objBinDetails[p].getText('inventorynumber',null,'group');
										}
									}
									else
									{
										if(vmakeInvAvailFlag == "T")
										{
											vBinQtyAvail=objBinDetails[p].getValue(
													'quantityavailable','inventoryNumberBinOnHand');
										}
										else
										{
											vBinQtyAvail=objBinDetails[p].getValue(
													'quantityonhand','inventoryNumberBinOnHand');
										}

										vBinText=objBinDetails[p].getText(
												'binnumber','inventoryNumberBinOnHand');
										vInvLot=objBinDetails[p].getText(
												'inventorynumber','inventoryNumberBinOnHand');
									}

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
									if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' 
										|| vOpenPickQty == '- None -')
									{
										vOpenPickQty =0;
									}

									vBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPickQty));
									if(replenBin != vBinText)
									{
										REArray["custparam_error"] = 'Please enter/scan valid bin location';
										response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
												'customdeploy_wmsse_replen_binscan', false, REArray);
										return;
									}

									if(vBinQtyAvail > 0)
									{
										availableQty=Big(availableQty).plus(vBinQtyAvail);
									}

								}
							}

							REArray['custparam_availqty'] = Number(availableQty);
							REArray["custparam_totbinavailableqty"] = Number(availableQty);
							if(availableQty == 0 || availableQty < 0)
							{
								REArray["custparam_error"] = 'Please enter/scan valid bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
										'customdeploy_wmsse_replen_binscan', false, REArray);
								return;
							}
						}
					}

					if(inventoryStatusFeature == true)
					{
						var objBinStatusDetails =null;
						var invfilterStrat =  new Array();
						if(whLocation != null && whLocation != '')
							invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
						if(replenItemId != null && replenItemId != '')
							invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', replenItemId));
						if(binInternalId!= null && binInternalId!= '')
							invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));

						var searchName = 'customsearch_wmsse_invtbalance_invt_item';
						if(itemType == "inventoryitem" || itemType == "assemblyitem")
						{
							searchName = 'customsearch_wmsse_invtbalance_invt_item';
						}
						else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") 
						{
							searchName = 'customsearch_wmsse_invtbalance_serialsrh';

						}

						//No need to use Load Search here as this search will not return more than 1K records.
						objBinStatusDetails = new nlapiSearchRecord('InventoryBalance',searchName,invfilterStrat, null);
						nlapiLogExecution('DEBUG', 'objBinStatusDetails', objBinStatusDetails);
					}

					var selectedStatus='';
					var selectedStatusName='';

					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						REArray["custparam_error"] ='';
						nlapiLogExecution('DEBUG', 'into lotnumberedinventoryitem', itemType);
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_lotscan',
								'customdeploy_wmsse_replen_lotscan', false, REArray);
						return;
					}
					else
					{
						if(inventoryStatusFeature == true)
						{
							if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && 
									objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined && objBinStatusDetails.length > 0)
							{
								REArray["custparam_enteredBinID"]=binInternalId;
								REArray["custparam_enteredbin"]=replenBin;
								nlapiLogExecution('DEBUG', 'objBinStatusDetails.length', objBinStatusDetails.length);
								if(objBinStatusDetails.length > 1)
								{
									response.sendRedirect('SUITELET', 'customscript_wmsse_replen_statusscan',
											'customdeploy_wmsse_replen_statusscan', false, REArray);
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
								}
							}

							REArray["custparam_enteredstatus"] = selectedStatus;
							REArray["custparam_invtstatusName"] = selectedStatusName;
						}

						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',replenItemId));

						if(whLocation != null && whLocation !='' && whLocation != 'null')
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',
									['@NONE@',whLocation]));
						}

						var itemresults= nlapiSearchRecord('item','customsearch_wmsse_replen_item_srh',
								itemfilters, null);							

						if(itemresults == null || itemresults == '' || itemresults == 'null')
						{
							REArray["custparam_error"] = 'Entered item is inactive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
									'customdeploy_wmsse_replen_binscan', false, REArray);
							return;
						}
						else
						{
							var itemLoc = itemresults[0].getValue('location');

							if((itemLoc != whLocation) && (itemLoc  != null && itemLoc != '' 
								&& itemLoc != 'null' && itemLoc != 'undefined'))
							{
								REArray["custparam_error"] = 'This item is mapped to different site';
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
										'customdeploy_wmsse_replen_binscan', false, REArray);
								return;
							}
						}
						REArray["custparam_error"] ='';
						REArray["custparam_totbinavailableqty"] = REArray['custparam_availqty'];

						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan',
								'customdeploy_wmsse_replen_qtyscan', false, REArray);
						return;
					}
				}
			}
		}
		catch(exp)
		{
			var errMsg = '';
			if (exp instanceof nlobjError) 
			{
				errMsg = 'System error: ' + exp.getCode() + '\n' + exp.getDetails();
				REArray["custparam_error"]=exp.getDetails();
			} 
			else 
			{
				errMsg = 'Unexpected error: ' + exp.toString();
				REArray["custparam_error"]=exp.toString();
			}
			nlapiLogExecution('ERROR', 'Exception inside post method', errMsg); 	

			response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
					'customdeploy_wmsse_replen_binscan', false, REArray);
			return;
		}
	}
}


/**
 * This function is to generate bins sorted by Pick Sequence number
 * 
 */
function getBinsBypickSeqNo(binArr,loc)
{
	var binNewinOrder = new Array();
	var binText = new Array();
	var finalBin = new Array();

	var filter = new Array();

	nlapiLogExecution('DEBUG','loc ',loc);
	filter.push(new nlobjSearchFilter('internalid',null, 'anyof', binArr));
	if(loc!=null && loc!='')
	{
		filter.push(new nlobjSearchFilter('location',null, 'anyof', loc));
	}

	var result =nlapiSearchRecord('bin','customsearch_wmsse_replen_binsearch',filter, null);

	if(result != '' && result != null)
	{
		nlapiLogExecution('DEBUG','result ',result.length);
		for(var t=0;t<result.length;t++)
		{
			binNewinOrder.push(result[t].getValue('internalid'));
			binText.push(result[t].getValue('binnumber'));
		}
		finalBin.push(binNewinOrder);
		finalBin.push(binText);
	}
	return finalBin;

}

/**
 * This function returns Quantity for an item in diffrent bins
 * 
 */
function getBinwiseQtyDetailsforItem(binId,itemid,location)
{
	nlapiLogExecution('DEBUG', 'binId,location,itemid', binId+','+location+','+itemid);
	var qtyArray=new Array();
	var filterStrat = new Array();
	filterStrat.push(new nlobjSearchFilter('internalid',null,'anyof', itemid));
	if(location!=null && location!='')
		filterStrat.push(new nlobjSearchFilter('location','binOnHand','anyof', location));
	if(binId!=null && binId!='')
		filterStrat.push(new nlobjSearchFilter('binnumber','binOnHand', 'anyof', binId));

	var objInvDetails = new nlapiSearchRecord('item',
			'customsearch_wmsse_replen_item_srh',filterStrat, null);
	if(objInvDetails !=null && objInvDetails !='' && objInvDetails.length > 0)
	{
		for(var s=0;s<objInvDetails.length;s++)
		{
			var qty=objInvDetails[s].getValue('quantityonhand','binOnHand');
			qtyArray.push(qty);
		}
	}
	nlapiLogExecution('Debug', 'qtyArray', qtyArray);
	return qtyArray;
}

/**
 * This function is to calculate stock conversion rate
 * 
 */
function getStockRatefun(vUnitTypeId,blnItemUnit) 
{

	nlapiLogExecution('Debug', 'vUnitTypeId', vUnitTypeId);
	nlapiLogExecution('Debug', 'blnItemUnit', blnItemUnit);

	var uomfilters=new Array();		

	if(vUnitTypeId != null && vUnitTypeId != '')
		uomfilters.push(new nlobjSearchFilter('internalid',null,'anyof',vUnitTypeId));
	if(blnItemUnit != null && blnItemUnit != '')
		uomfilters.push(new nlobjSearchFilter('unitname',null,'is',blnItemUnit)); 
	var uomcolumns=new Array();
	uomcolumns.push(new nlobjSearchColumn('conversionrate')); 
	var uomresults= nlapiSearchRecord('unitstype', null, uomfilters, uomcolumns);
	var vRetConversionRate=1;
	if(uomresults != null && uomresults != '')
	{
		var vRetConversionRate=uomresults[0].getValue('conversionrate');
		if(vRetConversionRate == null || vRetConversionRate == '')
			vRetConversionRate=1;
	}

	return vRetConversionRate;

}