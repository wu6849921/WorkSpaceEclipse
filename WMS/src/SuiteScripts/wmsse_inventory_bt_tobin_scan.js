/**
 * Script Description
 * In this script we can scan to-bin location for bin transfer process
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan to bin location for bin transfer process
 */
function RFInventoryBTTOBIN(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');

		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		var whLocationName = request.getParameter('custparam_whlocationname');
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');

		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var availableQty=request.getParameter('custparam_availableqty');
		var enterBin=request.getParameter('custparam_enterBin');
		var blnMixItem=request.getParameter('custparam_blnmixitem');
		var blnMixLot=request.getParameter('custparam_blnmixlot'); 
		var getPreferBin=request.getParameter('custparam_preferbin');
		var availableLotQty=request.getParameter('custparam_lotavailableqty');
		var vBaseUnit = request.getParameter('custparam_baseunit');
		var vUnitsText = request.getParameter('custparam_unitstext');	
		var VUnitType = request.getParameter('custparam_itemunitstype');
		var blnItemUnit = request.getParameter('custparam_itemunits');
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate');
		var invtstatus = request.getParameter('custparam_enteredstatus');
		var invtstatusName = request.getParameter('custparam_invtstatusName');
		var statusScreenflag = request.getParameter('custparam_statusflag');
		var enteredlot = request.getParameter('custparam_enteredlot');
		var enteredBinId = request.getParameter('custparam_enteredBinID');
		var statusScanQuantity = request.getParameter('custparam_statusScanQuantity');
		var vInvLotId = request.getParameter('custparam_vInvLotId');
		var availableqtyDetail=request.getParameter('custparam_availableqtyDetail');
		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		nlapiLogExecution('ERROR', 'vUnitsText:getStockConversionRate', vUnitsText+":"+getStockConversionRate);

		var vPageCount = request.getParameter('custparam_pagecount');

		if(vPageCount == null || vPageCount == '' || vPageCount == 'null' || vPageCount == 'undefined')
		{
			vPageCount = 0;
		}

		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		if(whLocation!=null && whLocation!='')
			itemfilters.push(new nlobjSearchFilter('inventorylocation',null, 'anyof', whLocation));
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
			for(var d=0;d<itemresults.length;d++)
			{
				if(itemresults[d].getValue('preferredbin')=="T" && itemresults[d].getValue('location','binnumber') == whLocation)
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
			vClissification=itemresults[0].getValue('locationinvtclassification');
			if(departments == true)
				Vdepartment = itemresults[0].getValue('department');
			if(classes == true)
				Vclass = itemresults[0].getValue('class');
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
		nlapiLogExecution('DEBUG', 'getStockConversionRate', getStockConversionRate); 
		var vUnitsText="";
		if(vBaseUnit != "" && vBaseUnit != null && vBaseUnit != "null")
			vUnitsText = 'In '+ vBaseUnit;

		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && 
				qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}

		var statusEnableFlag = 'T';//To check whether status bind required or not while displaying Bins.
		var vBinDetails=fnGetPutBinAndIntDetails(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,
				whLocation,getItemType,lotno,Vdepartment,Vclass,'',makeInvAvailFlagFromSelect,statusEnableFlag,enteredBinId,vClissification);


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
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		
		nlapiLogExecution('DEBUG', 'getPreferBin', getPreferBin);
		if(enterBin == getPreferBin)
			getPreferBin='';
		var domainName = fndomainName();
		
		var st0=domainName + "-BT Inventory";
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
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item');

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
		html = html +"<script type = 'text/javascript' >function validate(){ return validateFormforinventory(\""+getStockConversionRate+"\",\""+availableLotQty+"\",'hdnselecteduomswithqty','hdnItemType','txtbin','hdnPreferBin','hdntotaluomqtyentered') }</script>";
		html= html+"<script type = 'text/javascript' >function validatebin(bin){ return DisplayBinforinventory(bin,\""+getStockConversionRate+"\",\""+availableLotQty+"\",'hdnselecteduomswithqty','hdntotaluomqtyentered','hdnItemType','txtbin','_rf_checkin_item') }</script>";
		html = html + "</head><body onkeydown='return OnKeyDown_CL();'> ";

		html = html +"	<form name='_rf_checkin_item' method='POST'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validate();'/>"+

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Bin Transfer - To Bin</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<table>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+		 
		"				<td align = 'left' class='labelmsg'>Available Qty: <label>" + parseFloat(parseFloat(availableLotQty).toFixed(8)) + " " + blnItemUnit + "</label>"+

		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+
		"				<input type='hidden' name='hdnlotavailableqty' value=" + availableLotQty + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' id='hdnItemType' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnEnterBin' id='hdnEnterBin' value='" + enterBin + "'>"+
		"				<input type='hidden' name='hdnlotid' id='hdnlotid' value=" + enteredlot + ">"+
		"				<input type='hidden' name='hdnAvailableQty' id='hdnAvailableQty' value=" + availableLotQty + ">"+
		"				<input type='hidden' name='hdnAvailableQty1' id='hdnAvailableQty1' value=" + availableQty + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnlotno' value='" + lotno + "'>"+
		"				<input type='hidden' name='hdninvtstatus' id='hdninvtstatus' value=" + invtstatus + ">"+
		"				<input type='hidden' name='hdninvtstatusName' id='hdninvtstatusName' value='" + invtstatusName + "'>"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnvUnitsText' id='hdnvUnitsText' value='" + vUnitsText + "'>"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnstatusScreen' id='hdnstatusScreen' value='" + statusScreenflag + "'>"+	
		"				<input type='hidden' name='hdnEntbinId' id='hdnEntbinId' value='" + enteredBinId + "'>"+
		"				<input type='hidden' name='hdnstatusScanQuantity' id='hdnstatusScanQuantity' value=" +statusScanQuantity + ">"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+	
		"				<input type='hidden' name='hdnvInvLotId' id='hdnvInvLotId' value=" +vInvLotId + ">"+
		"				<input type='hidden' name='hdnavailableqtyDetail' id='hdnavailableqtyDetail' value=" + availableqtyDetail + ">"+
		"				<input type='hidden' name='hdntostatusid' id='hdntostatusid'>"+
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+			 
		"			<tr>"+
		"			</tr>";
		if(lotno!=null && lotno!='' && lotno!='null')
		{
			html = html +"<tr>";
			html = html +"<td align = 'left' class='labelmsg'>Lot#: <label>" + lotno + "</label>";
			html = html +"</tr>";
		}
		if(inventoryStatusFeature == true)
		{
			if(invtstatus != null && invtstatus != '' && invtstatus != 'null' && invtstatus != 'undefined')
			{
				var vInventoryStatus = invtstatusName;

				html =html+ "			<tr>"+
				"			<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
				"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + vInventoryStatus + "'>"+	
				"			</tr>";
			}
		}

		if(results !=null &&  results !='' && results.length>0)
		{
			var selectedUomStr = request.getParameter('custparam_uomqtyselected');
			nlapiLogExecution('ERROR', 'selectedUomStr', selectedUomStr);
			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				html = html +"<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox' id='txtqty0' type='text'  /></td><td></td>";

				for(var Cnt=0; Cnt < results.length; Cnt++)
				{
					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					if(Cnt==0)
					{
						html = html +"<td><select id='uomlist"+Cnt+"' class='labelmsg'  name = 'uomlist"+Cnt+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";

					}

					if(blnItemUnit !=null && blnItemUnit !='' && blnItemUnit!='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -' && 
							blnItemUnit == UOMText)
					{
						html = html +" <option value="+vQty+" selected >"+UOMText +" </option>";
					}
					else
					{
						html = html +" <option value="+vQty+"  >"+UOMText +" </option>";
					}
				}

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+availableLotQty+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr></table>";	
			}
			else
			{
				nlapiLogExecution('ERROR', 'else', selectedUomStr);
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
						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+availableLotQty+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr>";
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
		html = html+"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan To Bin Location"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		"				</td>"+
		"			</tr>";

		if(inventoryStatusFeature == true)
		{
			html = html+"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Inv Status"+	
			"				</td>"+
			"			</tr>"+
			"			<tr>";

			var invtStatusArr = getDefaultInventoryStatusList(null,-1,null);
			invtStatusArr = multiDimensionalUnique(invtStatusArr);

			html = html +"<td><select id='invttostatus' name='invttostatus' class='labelmsg' >" ;

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
			"<input type='hidden' name='hdntoStatusText' id = 'hdntoStatusText' value='" + statusText + "'>"+	
			"</tr>";
		}


		html = html+"			</tr>";
		html = html+"			</table>"+

		"			<table><tr>"+
		"				<td align = 'left'>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='"+btnText+"' onclick='return validate();'/></td>"+

		"			</tr></table>";

		html = html+"		<table class='uomstatus-gridgap'><tr>";
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
			html = html +"	</tr>";
		}
		html = html+"		<tr>";
		if(results !=null &&  results !='' && results.length>0)
		{
			html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUom_OnChange();'>";
			var selectedUOM = request.getParameter('custparam_uomprevselected');

			for(var uomCnt=0; uomCnt < results.length; uomCnt++)
			{                    	 
				var vUOM = results[uomCnt].getValue('conversionrate');
				var UOMText =results[uomCnt].getValue('unitname');
				if( ( (selectedUOM == null && getStockConversionRate == vUOM) || (selectedUOM == '' && getStockConversionRate == vUOM)  
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
			//Inventorystatus Feature is enabled
			if(inventoryStatusFeature == true)
			{
				html=html+"<td class='uom-status-display'></td>";
			}
		}
		if(inventoryStatusFeature == true)
		{
			var statusOptsArr = getStatusOptions();
			statusOptsArr = multiDimensionalUnique(statusOptsArr);

			html = html +"<td><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;

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
		html = html+"		</table>";
		var errorMsgValue='';
		if((vBinDetails!=null && vBinDetails!='') || (getPreferBin != null && getPreferBin != '') ||
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{
			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;' id='tblqtyUOM'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Bin"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";

			if(inventoryStatusFeature == true)
			{
				html = html +	"			<td></td>	<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}

			html = html +	"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			var inventoryStatus = '';
			var vqty ='';
			var count = 0;
			var inventoryStatus = '';
			var vqty = '';
			var convRate = 1;
			var selectedUOM = request.getParameter('custparam_uomprevselected');
			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
			{			
				convRate =getStockCoversionRate(VUnitType,blnItemUnit,selectedUOM);
			}
			nlapiLogExecution('DEBUG', 'convRate',convRate); 
			if(getPreferBin != null && getPreferBin != '' && enterBin != getPreferBin)
			{
				var preferBinId = nswms_GetValidBinInternalId(getPreferBin,whLocation,null);
				if(inventoryStatusFeature == true)
				{
					//function to get the quantity deatils of TO Scan bin satus wise.
					var objBinStatusDetails = fnToGetInvDetailfromInvBalance(whLocation,preferBinId,makeInvAvailFlagFromSelect);

					if(objBinStatusDetails != '' && objBinStatusDetails != 'null' && objBinStatusDetails != null)
					{
						for(var tobindtls = 0; tobindtls < objBinStatusDetails.length && objBinStatusDetails.length<5; tobindtls++)
						{
							count++;

							inventoryStatus = objBinStatusDetails[tobindtls].getText('status',null,'group');
							vqty = objBinStatusDetails[tobindtls].getValue('onhand',null,'sum');

							//vqty = parseFloat(vqty)*parseFloat(convRate);
							vqty = Big(vqty).mul(convRate);
							html = html + "	<tr class='" + vAltClass + "'>"+
							" <td><a  onclick='return validatebin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+ 

							"				<td align = 'right' class='labelmsg'>"+parseFloat(parseFloat(vqty).toFixed(8))+""+	
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
						count++;
						nlapiLogExecution('DEBUG', 'vqty', 'vqty');

						vqty = 0;
						inventoryStatus = '';
						html = html + "	<tr class='" + vAltClass + "'>"+
						" <td><a  onclick='return validatebin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+ 

						"				<td class='align-right'>"+parseFloat(parseFloat(vqty).toFixed(8))+""+	
						"				</td>";					

						html = html +"				<td></td>";
						html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
						html = html +"				</td>";	

						html = html +"</tr>";
					}
				}

				else
				{			
					var preferqtyDetails ='';

					preferqtyDetails = getBinwiseQtyDetails(preferBinId,whLocation);
					var vqty=preferqtyDetails[0];
					if(vqty == '' || vqty == null || vqty == 'undefined')
						vqty=0;
					html = html + "	<tr class='" + vAltClass + "'>"+
					" <td><a  onclick='return validatebin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+ 
					"				<td align = 'right' class='labelmsg'>"+Big(vqty).mul(convRate)+""+
					"				</td>";

					html = html +"</tr>";
				}
			}	
			var vnCount=0;
			for (var st = 0; st < vBinDetails.length && count<5; st++) 
			{
				nlapiLogExecution('DEBUG', 'vBinDetails.length',vBinDetails.length);

				if(st%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';


				var currValues = vBinDetails[st];
				txtBin = currValues[0];
				nlapiLogExecution('DEBUG', 'txtBin',txtBin);
				var txtBinInternalId = currValues[1];
				var qtyDetails = '';
				var invtstatusId = currValues[3];
				var invtstatus = currValues[2];
				var vBinQtyAvail = currValues[4];

				if(vBinQtyAvail==null || vBinQtyAvail=='' || vBinQtyAvail=='null' || vBinQtyAvail=='undefined' || vBinQtyAvail==undefined)
				{
					var qtyDetails = getBinwiseQtyDetails(txtBinInternalId,whLocation);
					var qty = qtyDetails[0];
				}
				else
				{
					var qtyDetails = vBinQtyAvail;
					var qty = vBinQtyAvail;
				}
				if(qty == '' || qty == null || qty == 'undefined')
					qty=0;
				if(enterBin!=txtBin && getPreferBin != txtBin)
				{	
					count++;
					qty=Big(qty).mul(convRate);
					html = html +	"			<tr class='" + vAltClass + "'>"+
					"				<td><a  onclick='return validatebin(\""+txtBin+"\");' href='#' >"+txtBin+""+
					"				</a></td>"+
					"				<td class='align-right'>"+parseFloat(parseFloat(qty).toFixed(8))+""+	
					"				</td>";

					if(inventoryStatusFeature == true)
					{
						html = html +	"			<td></td>	<td  class='status-cl-display'>"+invtstatus;
					}

					html = html +"			</tr>";
					vnCount = parseInt(vnCount)+1;
				}


				if(getPreferBin==null || getPreferBin=='null' || getPreferBin=='' || getPreferBin==undefined)
				{
					if(parseInt(vnCount) >= 5)						
						break;
				}
				else
				{
					if(parseInt(vnCount) >= 4)
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
		html = html + " </table></td></tr></table></form>";
		if(results ==null ||  results =='' || results == 'null')
		{
			html = html+"<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
		}		
		else
		{
			html = html +"<script type='text/javascript'>setFocus();</script>";
		}
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
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var toBin=request.getParameter('txtbin');
		var enterQty=request.getParameter('txtqty');
		nlapiLogExecution('DEBUG', 'enterQty1',enterQty);
		if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
		{
			enterQty = request.getParameter('hdntotaluomqtyentered');
			POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined' && !isNaN(enterQty))
			{
				nlapiLogExecution('DEBUG', 'enterQty before',enterQty);
				//enterQty = parseFloat(enterQty).toFixed(5);

			}
		}
		POarray["custparam_lotavailableqty"] = request.getParameter('hdnlotavailableqty');
		POarray["custparam_enterQty"] =enterQty; 
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
		POarray["custparam_enterBin"] = request.getParameter('hdnEnterBin');
		POarray["custparam_enterBinText"] = request.getParameter('txtbin');
		POarray["custparam_availableqty"] = request.getParameter('hdnAvailableQty1');
		POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_unitstext"] = request.getParameter('hdnvUnitsText');	
		POarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
		POarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		POarray["custparam_statusflag"] = request.getParameter('hdnstatusScreen');
		POarray["custparam_enteredlot"] = request.getParameter('hdnlotid');
		POarray["custparam_enteredBinID"] = request.getParameter('hdnEntbinId');
		POarray["custparam_statusScanQuantity"] = request.getParameter('hdnstatusScanQuantity');
		POarray["custparam_toStatusText"] = request.getParameter('hdntoStatusText');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_availableqtyDetail"] = request.getParameter('hdnavailableqtyDetail');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;
		var availableQty=request.getParameter('hdnAvailableQty');
		nlapiLogExecution('DEBUG', 'availableQty1',availableQty);
		if(availableQty != null && availableQty != '' && availableQty != 'null' && availableQty != 'undefined' && !isNaN(availableQty))
		{
			//availableQty = (parseFloat(availableQty) * parseFloat(getStockConversionRate)).toFixed(5);
			availableQty = Big(availableQty).mul(getStockConversionRate);
		}

		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		var itemType=request.getParameter('hdnItemType');
		var invtstatus=request.getParameter('hdninvtstatus');
		var invtstatusName=request.getParameter('hdninvtstatusName');
		var toStatus=request.getParameter('invttostatus');
		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var lotno= request.getParameter('hdnlotno');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var optedEvent = request.getParameter('cmdPrevious');
		var preferBin=request.getParameter('hdnPreferBin');
		var fromBin =request.getParameter('hdnEnterBin');

		POarray["custparam_enteredstatus"] = invtstatus;
		POarray["custparam_invtstatusName"] = invtstatusName;
		POarray["custparam_toStatus"] = toStatus;
		POarray["custparam_vInvLotId"] = request.getParameter('hdnvInvLotId');;

		var logMsg = 'POarray["custparam_lotno"] = ' + POarray["custparam_lotno"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_whlocation"] = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_company"] = ' + POarray["custparam_company"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_whlocationname"] = ' + POarray["custparam_whlocationname"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_itemtype"] = ' + POarray["custparam_itemtype"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_fetcheditemid"] = ' + POarray["custparam_fetcheditemid"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_enterBin"] = ' + POarray["custparam_enterBin"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_availableqty"] = ' + POarray["custparam_availableqty"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_enterQty"] = ' + POarray["custparam_"] + '<br>';
		logMsg = logMsg + 'blnMixItem = ' + blnMixItem + '<br>';
		logMsg = logMsg + 'blnMixLot = ' + blnMixLot + '<br>';
		logMsg = logMsg + 'fromBin = ' + fromBin + '<br>';
		logMsg = logMsg + 'toBin = ' + toBin + '<br>';
		logMsg = logMsg + 'fromStatus_fromStatus = ' + invtstatus + '<br>';
		logMsg = logMsg + 'toStatus_toStatus = ' + toStatus + '<br>';
		nlapiLogExecution('DEBUG', 'Processing BT RF - TO BIN', logMsg);

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
				if(optedEvent != 'Back (F7)')
				{

					try{

						var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');

						var isFromStatusChange = request.getParameter('hdnfromstatuschange');
						if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && 
								isFromStatusChange != undefined && isFromStatusChange=='T' )
						{
							POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
							POarray["custparam_enteredstatus"] = request.getParameter('invttostatus');
							POarray["custparam_error"] = '';
							response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
							return;
						}

						if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && parseFloat(availableQty) >= parseFloat(enterQty))
						{
							var WhiteSpace = enterQty.indexOf(' ') >= 0;
							if(WhiteSpace == true)
							{
								POarray["custparam_error"] = 'Please enter valid qty';
								response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
								return;
							}

							if(fromBin == toBin)
							{
								POarray["custparam_error"] = 'The from and to bins must be different';
								response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
								return;
							}		
							if((toBin==null || toBin=='') && ((preferBin != null && preferBin != '')&& (fromBin !=null && fromBin !='' && preferBin != fromBin)))
							{
								toBin=preferBin;						 
							}

							if(toBin!=null && toBin!="" && toBin !='null')
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
								var vtoBinInternalId='';
								var filter=new Array(); 
								filter.push(new nlobjSearchFilter('binnumber','null','is',toBin));
								filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type','null','anyof',stgLocId));
								filter.push(new nlobjSearchFilter('location','null','anyof',POarray["custparam_whlocation"]));
								var searchrecord=nlapiSearchRecord('Bin',null,filter,null);
								if(searchrecord!=null && searchrecord!="")
									vtoBinInternalId=searchrecord[0].getId();
								if(vtoBinInternalId!='' && vtoBinInternalId!=null)
								{								
									POarray["custparam_error"] = 'Please enter/scan valid bin location';
									response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
									return;
								}
								var vbinInternalId='';
								vbinInternalId=nswms_GetValidBinInternalId(toBin,POarray["custparam_whlocation"],FetchedItemId);
								if(vbinInternalId=='' || vbinInternalId==null)
								{									
									POarray["custparam_error"] = 'Please enter/scan valid bin location';
									response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
									return;
								}

								if(toBin != preferBin)
								{
									if(blnMixItem!="T")
									{
										var filterStrat = new Array();
										if(FetchedItemId != null && FetchedItemId != '' && FetchedItemId != 'null')
											filterStrat.push(new nlobjSearchFilter('internalid',null, 'noneof', FetchedItemId));
										if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '' && POarray["custparam_whlocation"]!= 'null')
											filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', POarray["custparam_whlocation"]));
										if(vbinInternalId!= null && vbinInternalId!= '' && vbinInternalId!= 'null')
											filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', vbinInternalId));
										var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_invt_inbound',filterStrat, null);
										if(objInvDetails!=null && objInvDetails!='')
										{
											if(objInvDetails.length>0)
											{
												nlapiLogExecution('ERROR', 'Inside if objInvDetails', objInvDetails.length);
												POarray["custparam_error"] = 'This item has mix items in bins flag false choose different bin.';
												objBinDetails1=null;
												response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
												return;
											}
										}
									}

									if(blnMixLot != 'T' && (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
									{
										nlapiLogExecution('DEBUG', 'Inside mixed lot', blnMixLot);

										var filterStrat = new Array();

										if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '')
											filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', POarray["custparam_whlocation"]));
										if(vbinInternalId!= null && vbinInternalId!= '')
											filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', vbinInternalId));
										if(blnMixLot != 'T' && lotno!=null && lotno!='' && lotno!='null' && lotno!='undefined')
											filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand','isnot', lotno));
										filterStrat.push(new nlobjSearchFilter('islotitem',null,'is', 'T'));
										var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);

										if(objInvDetails!=null && objInvDetails!='')
										{
											if(objInvDetails.length>0)
											{
												nlapiLogExecution('ERROR', 'Inside else objInvDetails', objInvDetails.length);
												POarray["custparam_error"] = 'This item has mix lots in bins flag false choose different bin';
												objBinDetails1=null;
												response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
												return;
											}
										}
									}
								}
							}
							else
							{
								POarray["custparam_error"] = 'Please enter/scan bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
								return;
							}

							if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{
								POarray["custparam_error"] = '';
								POarray["custparam_enterToBin"] = vbinInternalId;
								//POarray["custparam_enterQty"]=(enterQty*parseFloat(getStockConversionRate)).toFixed(5);

								POarray["custparam_enterQty"]=Number(Big(enterQty).mul(getStockConversionRate));//convert the calculated value to Number,since when we keep this value into custparam_enterQty array invalid string is passing to next screen other than acutal value 
								nlapiLogExecution('ERROR', 'into serial scan', itemType);
								response.sendRedirect('SUITELET', 'customscript_wmsse_bt_serial_scan', 'customdeploy_wmsse_bt_serial_scan', false, POarray);
								return;
							}
							else if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "lotnumberedinventoryitem" || 
									itemType=="lotnumberedassemblyitem")
							{
								var fromBinInternalId='';
								fromBinInternalId=nswms_GetBinInternalId(POarray["custparam_enterBin"],POarray["custparam_whlocation"]);
								nlapiLogExecution('DEBUG', 'vbinInternalId', vbinInternalId);
								nlapiLogExecution('DEBUG', 'fromBinInternalId', fromBinInternalId);
								//var binTransferQty = (parseFloat(enterQty)*parseFloat(getStockConversionRate)).toFixed(5);
								var binTransferQty = Number((Big(enterQty).mul(getStockConversionRate)).toFixed(8));

								var binTransferId='';

								if(inventoryStatusFeature == true)
								{
									binTransferId= inventoryBinTransfer(itemType,POarray["custparam_whlocation"],FetchedItemId,
											binTransferQty,fromBinInternalId,vbinInternalId,lotno,POarray["custparam_actualbegintime"],
											POarray["custparam_itemunits"],getStockConversionRate,Number(Big(enterQty).toFixed(8)),invtstatus,toStatus);
								}
								else
								{
									binTransferId= inventoryBinTransfer(itemType,POarray["custparam_whlocation"],FetchedItemId,
											binTransferQty,fromBinInternalId,vbinInternalId,lotno,POarray["custparam_actualbegintime"],
											POarray["custparam_itemunits"],getStockConversionRate,Number(Big(enterQty).toFixed(8)));
								}

								nlapiLogExecution('DEBUG', 'Bin Transfered successfully', binTransferId);

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
							response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
							return;
						}
					}
					catch(e)
					{
						nlapiLogExecution('ERROR', 'inside catch exception', e);
						var msgstring= e.toString();
						var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
						POarray["custparam_error"]= msg;
						response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
						return;
					}

				} 
				else 
				{
					var toBinScreenFlag = 'T';
					POarray["custparam_toBinScreenFlag"] = toBinScreenFlag;

					if(inventoryStatusFeature==true && POarray["custparam_statusflag"]=='T')
					{						
						response.sendRedirect('SUITELET', 'customscript_wmsse_bintransfer_status', 'customdeploy_wmsse_bintransfer_status', false, POarray);
						return;
					}
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						POarray["custparam_error"]='';
						POarray["custparam_availableqty"]=request.getParameter('hdnAvailableQty1');
						nlapiLogExecution('DEBUG', 'into lotnumberedinventoryitem', itemType);
						response.sendRedirect('SUITELET', 'customscript_wmsse_bt_lot_scan', 'customdeploy_wmsse_bt_lot_scan', false, POarray);
						return;
					}
					else
					{
						POarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_bt_bin_scan','customdeploy_wmsse_bt_bin_scan', false, POarray);
						return;
					}
				}
			}
			catch(e)
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);
				var msgstring= e.toString();
				var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
				POarray["custparam_error"]= msg;
				response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_bt_tobin_scan', 'customdeploy_wmsse_bt_tobin_scan', false, POarray);
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


	var objBinStatusDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_srchres_statuswise',invfilterStrat, null);

	return objBinStatusDetails;
}
