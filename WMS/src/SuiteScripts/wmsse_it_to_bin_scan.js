/**
 * Script Description
 * This script is used for inventory transfer to-bin location scanning screen.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan to-bin location for inventory transfer process
 */
function InvTranToBinScan(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('DEBUG', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');
		var availableQtyForBack=request.getParameter('custparam_FromAvailableqty');

		//Variable Declaration
		var html = '';

		var whLocation = request.getParameter('custparam_whlocation');

		var whLocationName = request.getParameter('custparam_whlocationname');
		var whTOLocation = request.getParameter('custparam_towhlocation');

		var whTOLocationName = request.getParameter('custparam_towhlocationname');

		var fromStatusScreen = request.getParameter('custparam_fromstatusscreen');
		var qtyFromStatusScreen = request.getParameter('custparam_lotavailableqty');

		whLocationName = nlapiLookupField('location', whLocation, 'name');
		whTOLocationName = nlapiLookupField('location', whTOLocation, 'name');

		nlapiLogExecution('DEBUG', 'whLocation', whLocation);
		nlapiLogExecution('DEBUG', 'whTOLocation', whTOLocation);
		var whCompany= request.getParameter('custparam_company');
		var qtyanduoms = request.getParameter('custparam_uomqtyselected');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var getTotQty = request.getParameter('custparam_scantotqty');
		var lotno=request.getParameter('custparam_lotno');
		var fromBin=request.getParameter('custparam_fromBin');
		var fromAvailQty=request.getParameter('custparam_FromAvailableqty');
		var invStatusName = request.getParameter('custparam_enteredstatusName');
		var invtstatus = request.getParameter('custparam_enteredstatus');
		var vFromBinId=request.getParameter('custparam_fromBinId');
		var vInvTrnsId=request.getParameter('custparam_ITId');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var availableLotQty=request.getParameter('custparam_lotavailableqty');
		if(availableLotQty == '' || availableLotQty == 'null' || availableLotQty == null || availableLotQty == undefined || availableLotQty == 0)
		{
			availableLotQty = request.getParameter('custparam_FromAvailableqty');
		}

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var enteredLot = request.getParameter('custparam_scanlot');


		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		nlapiLogExecution('DEBUG', 'invtstatus', invtstatus);
		nlapiLogExecution('DEBUG', 'makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect);

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('DEBUG', 'CSSfilefound', CSSfilefound);

		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);

		var st0 = domainName + '-IT Inventory';

		var getPreferBin='';

		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		if(whTOLocation!=null && whTOLocation!='')
			itemfilters.push(new nlobjSearchFilter('inventorylocation',null, 'anyof', whTOLocation));
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
		itemcolumns.push(new nlobjSearchColumn('unitstype'));*/
		if(departments == true)
			itemcolumns.push(new nlobjSearchColumn('department'));
		if(classes == true)
			itemcolumns.push(new nlobjSearchColumn('class'));
		//itemcolumns.push(new nlobjSearchColumn('location','binnumber'));
		//itemcolumns[0].setSort(true);
		var itemType='';
		var btnText='Submit';
		//It will not return more than 4000 records
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inventory_itemdetails', itemfilters, itemcolumns);
		var strItemGrp="";
		var strItemFam="";
		var blnMixItem="F";
		var blnMixLot="F";
		var blnItemUnit="";
		var VUnitType ="";
		var Vdepartment ="";
		var Vclass ="";
		var vClissification;
		if(itemresults!=null && itemresults!='')
		{
			itemType = itemresults[0].recordType;

			for(var d=0;d<itemresults.length;d++)
			{
				if(itemresults[d].getValue('preferredbin')=="T" && itemresults[d].getValue('location','binnumber') == whTOLocation)
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
			vClissification=itemresults[0].getValue('locationinvtclassification');
		}
		itemresults=null;
		itemcolumns=null;
		itemfilters=null;

		var vConversionRate=1;


		var getStockConversionRate =1;
		var vBaseUnit='';
		var uomResult = '';
		if(VUnitType != null && VUnitType != '')
		{	uomResult= getUnitsType(VUnitType);
		var vBaseUOMSearch=getBaseUnitRate(VUnitType);

		vBaseUnit='Base unit';
		if(vBaseUOMSearch != null && vBaseUOMSearch != '')
		{
			vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
			vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
		}
		}

		if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
		{
			getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
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


		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && qtyUOMCtrlSelectedVal !='undefined' && 
				qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}

		var strFlag = 'T';
		var vBinDetails=fnGetPutBinAndIntDetails(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,whTOLocation,
				getItemType,lotno,Vdepartment,Vclass,'',makeInvAvailFlagFromSelect,strFlag,null,vClissification);

		var strhead = "Inventory Transfer - To Bin";

		var btnText='Save (Ent)';
		if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
		{
			btnText='Next (Ent)';
		}
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('DEBUG', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
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


		html = html + "</head><body>";		
		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}
		html = html + "	<script type='text/javascript'>function validateForm() {var bin = document.getElementById('hdnPreferBin').value; if(document.getElementById('txtbin').value == '' && (bin=='' || bin=='null')){document.getElementById('div_error').innerHTML ='Please enter/scan bin location';return false;} else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html + "	<script type='text/javascript'>function validateItem(usedBins,vpoitem) {if(usedBins == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item ' +vpoitem+ ' to receive.';	return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +"	<script type='text/javascript'>function DisplayBin(val) {document.getElementById('txtbin').value=val;document.forms['_rf_it_frombin'].submit();document.getElementById('loading').style.display = ''; return true;}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";

		html = html +"	<form name='_rf_it_frombin' method='POST'>"+ 

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>" + strhead + "</td></tr>"+
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
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + fromBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Entered Qty: <label>" + parseFloat(parseFloat(getTotQty).toFixed(8)) +  " " + blnItemUnit + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Available Qty: <label>" + parseFloat(parseFloat(availableLotQty).toFixed(8)) + " " + blnItemUnit + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdntoWhLocation' value=" + whTOLocation + ">"+	
		"				<input type='hidden' name='hdntoWhLocationName' value='" + whTOLocationName + "'>"+
		"				<input type='hidden' name='hdnTotQty' id='hdnTotQty' value=" + getTotQty + ">"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdninvStatusName' id='hdninvStatusName' value='" + invStatusName + "'>"+
		"				<input type='hidden' name='hdnavailableQtyForBack' id='hdnavailableQtyForBack' value=" + availableQtyForBack + ">"+
		"				<input type='hidden' name='hdninvtstatus' id='hdninvtstatus' value=" + invtstatus + ">"+
		"				<input type='hidden' name='hdnenteredLot' id='hdnenteredLot' value='" +enteredLot+"' >"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdnlotno' value='" + lotno + "'>"+	
		"				<input type='hidden' name='hdnfromStatusScreen' id='hdnfromStatusScreen' value=" + fromStatusScreen + ">"+	
		"				<input type='hidden' name='hdnAvailQty' value=" + fromAvailQty + ">"+	
		"				<input type='hidden' name='hdnFromBin' value=" + fromBin + ">"+
		"				<input type='hidden' name='hdnFromBinId' value=" + vFromBinId + ">"+
		"				<input type='hidden' name='hdnITId' value=" + vInvTrnsId + ">"+	
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnvUnitsText' id='hdnvUnitsText' value='" + vUnitsText + "'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' value="+qtyanduoms+">"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnqtyFromStatusScreen' id='hdnqtyFromStatusScreen' value=" + qtyFromStatusScreen + ">"+
		"				<input type='hidden' name='hdninventoryStatusFeature' value=" + inventoryStatusFeature + ">"+
		"				<input type='hidden' name='hdnmakeInvAvailFlagFromSelect' value=" + makeInvAvailFlagFromSelect + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>";

		if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
		{
			html = html + "	<tr>"+
			"				<td align = 'left' class='labelmsg'>Lot#: <label>" + lotno + "</label>"+
			"			</tr>";		 
		}
		if(inventoryStatusFeature == true)
		{
			if(invtstatus != null && invtstatus != '' && invtstatus != 'null' && invtstatus != 'undefined')
			{
				var vInventoryStatus ='';
				var inventoryStatustx = '';
				var hdnInvtStatusText = request.getParameter('custparam_hdnInvtStatusText');
				if(hdnInvtStatusText != '' && hdnInvtStatusText != null && hdnInvtStatusText != 'null' && hdnInvtStatusText != 'undefined')
				{
					vInventoryStatus = hdnInvtStatusText;
					inventoryStatustx = hdnInvtStatusText;
				}
				else
				{

					inventoryStatustx = invStatusName;

				}

				html =html+ "			<tr>"+
				"			<td align = 'left' class='labelmsg'>Inv Status: <label>" + inventoryStatustx + "</label>"+
				"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + inventoryStatustx + "'>"+	
				"			</tr>";

			}
		}
		html = html + "			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan To Bin Location"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		"				</td>"+
		"			</tr>" ;
		if(inventoryStatusFeature == true)
		{
			html = html+"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Inv Status"+	
			"				</td>"+
			"			</tr>"+
			"			<tr>";

			var invtStatusArr = getInventoryStatusOptions();
			invtStatusArr = multiDimensionalUnique(invtStatusArr);
			nlapiLogExecution('DEBUG', 'invtStatusArr', invtStatusArr);
			html = html +"<td><select id='invttostatus' name='invttostatus' class='labelmsg' >" ;

			if(invtStatusArr !=null &&  invtStatusArr !='' && invtStatusArr.length>0)
			{
				for(var statusItr=0; statusItr < invtStatusArr.length; statusItr++)
				{                    	 
					var statusVal = invtStatusArr[statusItr][0];
					var statusText =invtStatusArr[statusItr][1];


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
			html=html+"</select></td></tr>"+
			"<input type='hidden' id='hdnstatusVal' name='hdnstatusVal' value=" + statusVal + ">"+//hdnstatusVal,hdnstatusText
			"<input type='hidden' id='hdnstatusText' name='hdnstatusText' value=" + statusText + ">";
		}
		html=html+"</table></td></tr><tr><td>"+ 
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/>"+

		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='"+btnText+"' onclick='return validateForm();'/></td>"+
		"				<td width=20px></td>"+

		"			</tr></table></td></tr>";

		html = html+"		<table ><tr>";


		var errorMsgValue='';

		if((vBinDetails!=null && vBinDetails!='') || (getPreferBin != null && getPreferBin != '') ||
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{

			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;' >";			
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
				nlapiLogExecution('DEBUG', 'selectedUOM', selectedUOM);
				for(var uomCnt=0; uomCnt < uomResult.length; uomCnt++)
				{                    	 
					var vUOM = uomResult[uomCnt].getValue('conversionrate');
					var UOMText =uomResult[uomCnt].getValue('unitname');


					if(( (selectedUOM == null && getStockConversionRate == vUOM) || (selectedUOM == '' && getStockConversionRate == vUOM)  
							|| (selectedUOM =='null' && getStockConversionRate == vUOM) || (selectedUOM =='undefined'  && getStockConversionRate == vUOM )
							|| (selectedUOM == undefined && getStockConversionRate == vUOM) )|| (selectedUOM == vUOM))
					{
						nlapiLogExecution('DEBUG', 'selectedUOM if', vUOM + ' '+ UOMText);
						html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";

					}
					else
					{
						nlapiLogExecution('DEBUG', 'selectedUOM else', vUOM + ' '+ UOMText);
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
			var type = 'INB';
			if(inventoryStatusFeature == true)
			{				
				var statusOptsArr = getStatusOptions(type);
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
			}

			html = html +"<tr><td colspan='4'></td></tr></table></td></tr>" ;



			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;' id='tblqtyUOM'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Bin"+	
			"				</td>";

			html = html +"				<td class='align-right'>Qty";
			html = html +"				</td>";

			if(inventoryStatusFeature == true)
			{

				html = html +	"			<td></td>	<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			var count = 0;
			var countval=0;
			var inventoryStatus = '';
			var vqty = '';
			var convRate = 1;
			var selectedInvUOM = request.getParameter('custparam_uomprevselected');
			if(selectedInvUOM != null && selectedInvUOM != '' && selectedInvUOM !='null' && selectedInvUOM !='undefined' && selectedInvUOM != undefined )
			{
				//convRate = parseFloat(getStockConversionRate)/parseFloat(selectedInvUOM);
				convRate =getStockCoversionRate(VUnitType,blnItemUnit,selectedInvUOM);
			}

			if(getPreferBin != null && getPreferBin != '' && fromBin != getPreferBin)
			{
				var preferBinId = nswms_GetValidBinInternalId(getPreferBin,whTOLocation,null);

				if(inventoryStatusFeature == true)
				{
					//function to get the quantity deatils of TO Scan bin satus wise.
					var objBinStatusDetails = fnToGetInvDetailfromInvBalance(whTOLocation,preferBinId,makeInvAvailFlagFromSelect);

					if(objBinStatusDetails != '' && objBinStatusDetails != 'null' && objBinStatusDetails != null)
					{
						for(var tobindtls = 0; tobindtls < objBinStatusDetails.length && objBinStatusDetails.length<5; tobindtls++)
						{

							count++;
							inventoryStatus = objBinStatusDetails[tobindtls].getText('status',null,'group');
							vqty = objBinStatusDetails[tobindtls].getValue('onhand',null,'sum');


							html = html + "	<tr class='" + vAltClass + "'>"+
							" <td><a  onclick='return DisplayBin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+ 

							"				<td class='align-right'>"+parseFloat(parseFloat(Big(vqty).mul(convRate).toFixed(8)))+""+	
							"				</td>";
							if(inventoryStatusFeature == true)
							{							
								html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
								html = html +"				</td>";	
							}
							html = html +"</tr>";

						}
					}
					else
					{
						nlapiLogExecution('DEBUG', 'vqty', 'vqty');
						count++;
						vqty = 0;
						inventoryStatus = 'NA';
						html = html + "	<tr class='" + vAltClass + "'>"+
						" <td><a  onclick='return DisplayBin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+ 

						"				<td class='align-right'>"+vqty+""+	
						"				</td>";						


						html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
						html = html +"				</td>";	

						html = html +"</tr>";
					}
				}
				else
				{

					var preferqtyDetails = getBinwiseQtyDetails(preferBinId,whTOLocation);
					var vqty=preferqtyDetails[0];
					if(vqty == '' || vqty == null || vqty == 'undefined')
						vqty=0;
					html = html + "	<tr class='" + vAltClass + "'>"+

					" <td><a  onclick='return DisplayBin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+
					"				<td class='align-right'>"+parseFloat(parseFloat(vqty).toFixed(8))+""+	
					"				</td>";
					
					html = html +"</tr>";
				}

			}	

			for (var st = 0; st < vBinDetails.length && countval < 5; st++) {
				
				nlapiLogExecution('DEBUG', 'countval', countval);
				if(st%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				countval++;
				var currValues = vBinDetails[st];

				var txtBin = currValues[0];
				var txtBinInternalId = currValues[1];


				var invStatus = currValues[2];
				var invStatusId = currValues[3];


				var qty = currValues[4];
				if((qty == '' || qty == 0 || qty == 'null' || qty == null || qty == undefined) && (inventoryStatusFeature != true))
				{
					var qtyDetails = getBinwiseQtyDetails(txtBinInternalId,whTOLocation);
					qty = qtyDetails[0];					
				}
				if(qty == '' || qty == null || qty == 'undefined')
					qty=0;
				if(fromBin!=txtBin && getPreferBin != txtBin)
				{	

					html = html +	"			<tr class='" + vAltClass + "'>"+

					"				<td><a  onclick='DisplayBin(\""+txtBin+"\");' href='#' >"+txtBin+""+	
					"				</a></td>"+
					"				<td class='align-right'>"+Big(qty).mul(convRate)+""+	
					"				</td>";

					if(inventoryStatusFeature == true)
					{
						if(invStatus==null || invStatus=='')
							invStatus = 'NA';

						html = html +	"			<td></td>	<td  class='status-cl-display'>"+invStatus;	
						html = html +"				</td>";
					}
					html = html +"			</tr>";
				}

				if(getPreferBin==null || getPreferBin=='null' || getPreferBin=='' || getPreferBin==undefined)
				{
					if(parseInt(countval) >= 5)						
						break;
				}
				else
				{
					if(parseInt(countval) >= 4)
						break;
				}
			}

			html = html +" </td>"+
			"</tr>"+
			"</table></td></tr>";

		}
		if(vBinDetails.length==0)
		{
			errorMsgValue="T";

		}
		vBinDetails=null;
		html = html +"			<tr>"+
		"				<input type='hidden' name='hdnerrorMsgValue' id='hdnerrorMsgValue' value=" + errorMsgValue + ">"+
		"				</td>"+
		"			</tr>";
		html = html + "</table></td></tr></table>	</form>";

		html = html + "<script type='text/javascript'>document.getElementById('txtbin').focus();</script>";

		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>"; 

		response.write(html);
	}
	else {
		nlapiLogExecution('DEBUG', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var enterQty=request.getParameter('txtqty');
		var enterBin=request.getParameter('txtbin');
		var hdnInvtStatusText = request.getParameter('hdnInvtStatusText');
		POarray["custparam_hdnInvtStatusText"] = hdnInvtStatusText;
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
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
		POarray["custparam_towhlocation"] = request.getParameter('hdntoWhLocation');
		POarray["custparam_scanlot"]=request.getParameter('hdnenteredLot');
		POarray["custparam_towhlocationname"] = request.getParameter('hdntoWhLocationName');
		POarray["custparam_scantotqty"] = request.getParameter('hdnTotQty');
		POarray["custparam_fromBinId"] = request.getParameter('hdnFromBinId');
		POarray["custparam_lotno"] =request.getParameter('hdnlotno');	
		POarray["custparam_FromAvailableqty"] =request.getParameter('hdnAvailQty');
		POarray["custparam_enteredstatusName"] =request.getParameter('hdninvStatusName');
		POarray["custparam_fromBin"] =request.getParameter('hdnFromBin');
		POarray["custparam_ITId"] =request.getParameter('hdnITId');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		POarray["custparam_uom"] = request.getParameter('hdnuom');
		POarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		POarray["custparam_enteredTostatusValue"] = request.getParameter('hdnstatusVal');
		POarray["custparam_enteredTostatusName"] = request.getParameter('hdnstatusText');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var inventoryTransferId =request.getParameter('hdnITId');
		var vFromBinId = request.getParameter('hdnFromBinId');
		var itemType=request.getParameter('hdnItemType');

		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		var fromStatus=request.getParameter('hdninvtstatus');//fromStatus,toStatus
		var toStatus=request.getParameter('invttostatus');

		var lotno= request.getParameter('hdnlotno'); 
		var enterQty=request.getParameter('hdnTotQty');

		var vItemIntId= request.getParameter('hdnItemInternalId');
		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var intAvailQty=request.getParameter('hdnAvailQty');
		var optedEvent = request.getParameter('cmdPrevious');
		var vFromWHLocation= request.getParameter('hdnWhLocation'); 
		var vToWHLocation= request.getParameter('hdntoWhLocation'); 
		var preferBin= request.getParameter('hdnPreferBin'); 
		var fromStatusScreen= request.getParameter('hdnfromStatusScreen'); 
		POarray["custparam_fromstatusscreen"] = fromStatusScreen;
		nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);
		var vCmdCloseOption=request.getParameter('cmdClose');
		var logMsg = 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>'; 
		logMsg = logMsg + 'FetchedItemId = ' + vItemIntId + '<br>'; 
		logMsg = logMsg + 'preferBin = ' + preferBin + '<br>';
		logMsg = logMsg + 'lotno = ' + lotno + '<br>'; 
		logMsg = logMsg + 'blnMixItem = ' + blnMixItem + '<br>';
		logMsg = logMsg + 'blnMixLot = ' + blnMixLot + '<br>';
		logMsg = logMsg + 'intAvailQty = ' + intAvailQty + '<br>';
		logMsg = logMsg + 'vCmdCloseOption = ' + vCmdCloseOption + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		nlapiLogExecution('DEBUG', 'Processing RF - QTY', logMsg);

		POarray["custparam_enteredstatus"] = fromStatus;
		POarray["custparam_lotavailableqty"] = request.getParameter('hdnqtyFromStatusScreen');

		POarray["custparam_fromenteredstatus"] = fromStatus;
		POarray["custparam_toenteredstatus"] = toStatus;
		///
		var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
		POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
		nlapiLogExecution('DEBUG', 'makeInventoryAvailFlag', makeInventoryAvailFlag);
		var isFromStatusChange = request.getParameter('hdnfromstatuschange');
		nlapiLogExecution('DEBUG', 'isFromStatusChange', isFromStatusChange);
		if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && 
				isFromStatusChange != undefined && isFromStatusChange=='T' )
		{
			POarray["custparam_enteredstatus"] = request.getParameter('invttostatus');			
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
			return;

		}
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

					try{
						POarray["custparam_FromAvailableqty"] = request.getParameter('hdnavailableQtyForBack');


						nlapiLogExecution('DEBUG', 'itemType', itemType);
						POarray["custparam_itemtype"] = itemType;
						POarray["custparam_enterQty"] = enterQty;
						if((enterBin == null || enterBin == '')&& preferBin != null && preferBin != '')
							enterBin=preferBin;
						if(enterBin!=null && enterBin!="")
						{
							var stgLocId=0;
							var cols =new Array();
							cols[0] = new nlobjSearchColumn('name');
							//It will not return more than 4000 records
							var BinlocationTypes =  new nlapiSearchRecord('customlist_wmsse_bin_loc_type', null, null, cols);

							if(BinlocationTypes != null && BinlocationTypes !='' && BinlocationTypes.length > 0)
							{
								var strName ='Stage';
								for(var b=0;b<BinlocationTypes.length;b++)
								{
									var tName= BinlocationTypes[b].getValue('name');

									if(tName == strName)
									{
										stgLocId = BinlocationTypes[b].getId();
										break;
									}
								}
							}
							var vtoBinInternalId='';
							var filter=new Array(); 
							filter.push(new nlobjSearchFilter('binnumber','null','is',enterBin));
							filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type','null','anyof',stgLocId));
							//It will not return more than 4000 records
							filter.push(new nlobjSearchFilter('location','null','anyof',POarray["custparam_whlocation"]));
							var searchrecord=nlapiSearchRecord('Bin',null,filter,null);
							if(searchrecord!=null && searchrecord!="")
								vtoBinInternalId=searchrecord[0].getId();
							if(vtoBinInternalId!='' && vtoBinInternalId!=null)
							{

								POarray["custparam_error"] = 'Please enter/scan valid bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
								return;
							}
							var vbinInternalId='';


							vbinInternalId=nswms_GetValidBinInternalId(enterBin,vToWHLocation,vItemIntId);
							if(vbinInternalId=='' || vbinInternalId==null)
							{
								POarray["custparam_error"] = 'Please enter/scan valid bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
								return;
							}
							else
							{
								if(enterBin != preferBin)
								{
									if(blnMixItem!="T")
									{
										var filterStrat = new Array();

										if(vItemIntId != null && vItemIntId != '')
											filterStrat.push(new nlobjSearchFilter('internalid',null, 'noneof', vItemIntId));
										if(vToWHLocation!= null && vToWHLocation!= '')
											filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', vToWHLocation));
										if(vbinInternalId!= null && vbinInternalId!= '')
											filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', vbinInternalId));

										//It will not return more than 4000 records
										var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_invt_inbound',filterStrat, null);
										if(objInvDetails!=null && objInvDetails!='')
										{
											if(objInvDetails.length>0)
											{
												nlapiLogExecution('DEBUG', 'Inside if objInvDetails', objInvDetails.length);

												POarray["custparam_error"] = 'This item has mix items in bins flag false choose different bin.';
												objInvDetails=null;
												response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
												return;
											}
										}
									}

									if(blnMixLot != 'T' && (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
									{
										nlapiLogExecution('DEBUG', 'Inside mixed lot', blnMixLot);


										var filterStrat = new Array();

										if(vToWHLocation!= null && vToWHLocation!= '')
											filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', vToWHLocation));
										if(vbinInternalId!= null && vbinInternalId!= '')
											filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', vbinInternalId));
										if(blnMixLot != 'T' && lotno!=null && lotno!='' && lotno!='null' && lotno!='undefined')
											filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand','isnot', lotno));
										filterStrat.push(new nlobjSearchFilter('islotitem',null,'is', 'T'));
										var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);
										//It will not return more than 4000 records

										if(objInvDetails!=null && objInvDetails!='')
										{
											if(objInvDetails.length>0)
											{
												nlapiLogExecution('DEBUG', 'Inside if objInvDetails', objInvDetails.length);

												POarray["custparam_error"] = 'This item has mix lots in bins flag false choose different bin.';
												objInvDetails=null;
												response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
												return;
											}
										}
									}
								}
								nlapiLogExecution('DEBUG', 'enterQty', enterQty);
								nlapiLogExecution('DEBUG', 'Number(Big(enterQty).toFixed(8))', Number(Big(enterQty).toFixed(8)));
								POarray["custparam_toBin"] = enterBin;
								POarray["custparam_toBinInternalId"] = vbinInternalId;
								if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
								{
									nlapiLogExecution('DEBUG', 'into serializedinventoryitem', itemType);
									response.sendRedirect('SUITELET', 'customscript_wmsse_it_serial_scan', 'customdeploy_wmsse_it_serial_scan', false, POarray);
									return;
								}
								else if(itemType == "inventoryitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType=="assemblyitem")
								{
									nlapiLogExecution('DEBUG', 'inside itemtype ', itemType);
									nlapiLogExecution('DEBUG', 'vFromBinId ', vFromBinId);
									nlapiLogExecution('DEBUG', 'vbinInternalId ', vbinInternalId);
									nlapiLogExecution('DEBUG', 'fromStatus ', fromStatus);
									nlapiLogExecution('DEBUG', 'toStatus ', toStatus);
									var binInternalId=vbinInternalId;
									if(vCmdCloseOption == 'Close')
									{	var taskType="XFER";
									//To create or update open task 'XFER' task.
									if(inventoryStatusFeature == true)
									{
										updateMoveOpenTaskforInventory(itemType,vFromWHLocation,vItemIntId,Number(Big(enterQty).toFixed(8)),vFromBinId,vbinInternalId,lotno,inventoryTransferId,taskType,vToWHLocation,'',POarray["custparam_actualbegintime"],POarray["custparam_uom"],getStockConversionRate,fromStatus,toStatus);
									}
									else
									{
										updateMoveOpenTaskforInventory(itemType,vFromWHLocation,vItemIntId,Number(Big(enterQty).toFixed(8)),vFromBinId,vbinInternalId,lotno,inventoryTransferId,taskType,vToWHLocation,'',POarray["custparam_actualbegintime"],POarray["custparam_uom"],getStockConversionRate);
									}

									POarray["custparam_error"]='';								 
									response.sendRedirect('SUITELET', 'customscript_wmsse_menu', 'customdeploy_wmsse_menu', false, POarray);									 
									return;									 
									}
									else
									{
										var taskType="XFER";
										var recId = '';

										if(inventoryStatusFeature == true)
										{
											recId = updateMoveOpenTaskforInventory(itemType,vFromWHLocation,vItemIntId,Number(Big(enterQty).toFixed(8)),vFromBinId,vbinInternalId,lotno,inventoryTransferId,taskType,vToWHLocation,'',POarray["custparam_actualbegintime"],POarray["custparam_uom"],getStockConversionRate,fromStatus,toStatus);
											var vInvTrnId= nswms_PostInventoryTransfer(inventoryTransferId,taskType,itemType,recId,fromStatus,toStatus);
											nlapiLogExecution('DEBUG', 'Inventory transfer posted successfully', vInvTrnId);
										}
										else
										{
											recId = updateMoveOpenTaskforInventory(itemType,vFromWHLocation,vItemIntId,Number(Big(enterQty).toFixed(8)),vFromBinId,vbinInternalId,lotno,inventoryTransferId,taskType,vToWHLocation,'',POarray["custparam_actualbegintime"],POarray["custparam_uom"],getStockConversionRate);
											var vInvTrnId= nswms_PostInventoryTransfer(inventoryTransferId,taskType,itemType,recId);
											nlapiLogExecution('DEBUG', 'Inventory transfer posted successfully', vInvTrnId);
										}

										nlapiLogExecution('DEBUG', 'recId', recId);


										POarray["custparam_error"]='';
										response.sendRedirect('SUITELET', 'customscript_wmsse_menu', 'customdeploy_wmsse_menu', false, POarray);									 
										return;
									} 	

								}

							}	

						}
						else
						{
							POarray["custparam_error"]='Please enter/scan valid bin location';
							response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
							return;
						}				

					}
					catch(e)
					{
						nlapiLogExecution('ERROR', 'inside catch exception', e);
						POarray["custparam_error"]=e.toString();
						response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
						return;
					}

				} 
				else {


					POarray["custparam_error"]='';
					POarray["custparam_lotavailableqty"] = request.getParameter('hdnavailableQtyForBack');

					if((inventoryStatusFeature == 'true' || inventoryStatusFeature == true)&& (fromStatusScreen == 'T'))
					{
						response.sendRedirect('SUITELET', 'customscript_wmsse_it_status_scan', 'customdeploy_wmsse_it_status_scan', false, POarray);
					}
					else
					{
						response.sendRedirect('SUITELET', 'customscript_wmsse_it_bin_scan', 'customdeploy_wmsse_it_from_bin_scan', false, POarray);
					}					
					return;

				}
			}
			catch(e)
			{
				POarray["custparam_error"]=e.toString();
				response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_it_tobin_scan', 'customdeploy_wmsse_it_tobin_scan', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.


function GetInventoryNumberInternalId(lot,location)
{
	var lotInternalId = '';
	var str='lot :'+lot;
	str=str + 'location :'+location;
	nlapiLogExecution('DEBUG', 'str ', str);
	var filter = new Array();
	var cols = new Array();
	//cols[0]=new nlobjSearchColumn('inventorynumber');
	//cols[1]=new nlobjSearchColumn('location');
	if(location != null && location != '')
		filter.push(new nlobjSearchFilter('location',null, 'anyof', location)); 
	if(lot!=null && lot!='')
		filter.push(new nlobjSearchFilter('inventorynumber',null, 'is', lot)); 
	var objDetails = new nlapiSearchRecord('inventorynumber','customsearch_wmsse_inventornumbers_searc',filter, cols);

	if(objDetails != null && objDetails != '' && objDetails.length > 0)
	{
		lotInternalId = objDetails[0].getId();
	}
	nlapiLogExecution('DEBUG', 'lotInternalId ', lotInternalId);
	return lotInternalId;
}

function getInventoryStatusOptions()
{
	var sOptionsArr = new Array();

	var statusList = getDefaultInventoryStatusList(null,-1,null);
	nlapiLogExecution('DEBUG', 'statusList ', statusList.length);
	if(statusList != null && statusList != '' && statusList != 'null' && statusList != 'undefined' && statusList != undefined)
	{


		for ( var i = 0; statusList != null && i < statusList.length; i++ )
		{
			var res = statusList[i];
			var listValue = (res[0]);
			var listID = (res[1]);
			var row1=[listID,listValue];
			sOptionsArr.push(row1);

		} 
	}

	return sOptionsArr;
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

function fnToGetInvDetailfromInvBalance(whLocation,preferBinId,makeInvAvailFlagFromSelect)
{
	var vqty ='';
	var invfilterStrat =  new Array();
	if(whLocation != null &&whLocation != '')
		invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));

	if(preferBinId!= null && preferBinId!= '')
		invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', preferBinId));

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

	//It will not return more than 4000 records
	var objBinStatusDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_srchres_statuswise',invfilterStrat, null);

	return objBinStatusDetails;
}