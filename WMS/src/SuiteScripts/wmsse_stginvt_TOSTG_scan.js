/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function RFstageinvttransferTOstage(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();


	if (request.getMethod() == 'GET') 
	{
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		var getOptedField = request.getParameter('custparam_option');
		
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');

		var whLocationName = request.getParameter('custparam_whlocationname');

		if(whLocation != null && whLocation !='' && (whLocationName == '' || whLocationName == 'null' || whLocationName == null ||
				whLocationName =='undefined'))
		{
			var locationRec= nlapiLoadRecord('location',whLocation);
			whLocationName = locationRec.getFieldValue('name');
		}
		
		var whCompany= request.getParameter('custparam_company');

		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');
		var fromscreen = request.getParameter('custparam_fromscreen');
		var availableQty = request.getParameter('custparam_availableqty');
		var invt_status = request.getParameter('custparam_inventorystatus');
		var enteredBinId = request.getParameter('custparam_enteredBinID');
		var enterBin=request.getParameter('custparam_enterBin');
		var blnMixItem=request.getParameter('custparam_blnmixitem');
		var blnMixLot=request.getParameter('custparam_blnmixlot'); 
		var getPreferBin=request.getParameter('custparam_preferbin');
		var enterQty=request.getParameter('custparam_enterQty');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
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
		itemcolumns.push(new nlobjSearchColumn('location','binnumber'));
		itemcolumns.push(new nlobjSearchColumn('isinactive'));
		itemcolumns[0].setSort(true);*/

		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inventory_itemdetails', itemfilters, itemcolumns);
		var strItemGrp="";
		var strItemFam="";
		var blnMixItem="F";
		var blnMixLot="F";
		var itemType='';
		var blnItemUnit="";
		var VUnitType ="";
		if(itemresults!=null && itemresults!='')
		{
			if(itemresults[0].getValue('isinactive')=="T")
			{
				var POarray = new Array();
				POarray["custparam_enterQty"] = enterQty;
				POarray["custparam_preferbin"] = getPreferBin;		
				POarray["custparam_lotno"] = lotno;
				POarray["custparam_whlocation"] = whLocation;
				POarray["custparam_company"] = whCompany;
				POarray["custparam_whlocationname"] = whLocationName;
				POarray["custparam_itemtype"] = getItemType;
				POarray["custparam_fetcheditemid"] = getItemInternalId;
				POarray["custparam_fetcheditemname"]=request.getParameter('custparam_fetcheditemname');
				POarray["custparam_preferbin"] = getPreferBin;
				POarray["custparam_enterBin"] = enterBin;
				POarray["custparam_availableqty"] = request.getParameter('custparam_availableqty');
				POarray["custparam_blnmixitem"] = blnMixItem;
				POarray["custparam_blnmixlot"] = blnMixLot;
				if(getItemType == "lotnumberedinventoryitem" || getItemType=="lotnumberedassemblyitem")
				{
					POarray["custparam_availableqty"] = request.getParameter('custparam_lotavailableqty');
				}

				POarray["custparam_error"] = 'Entered item  is inactive.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
				nlapiLogExecution('ERROR', 'itemRecord', 'Invalid Item Specified');
				return;

			}

			itemType = itemresults[0].recordType;			
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
			getFetchedItemName = itemresults[0].getValue('itemid');
		}
		var getStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
		var uomresults= new Array();
		var results='';
		var addbtnimgUrl='';
		var delbtnimgUrl='';
		//Case # 201414603  start
		var getStockCRate=0;
		//Case # 201414603  end
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
				//Case # 201414603  start
				getStockCRate = getStockConversionRate;
				//Case # 201414603  end
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
					nlapiLogExecution('ERROR', 'imgUrl', addbtnimgUrl);
				}

				var imgfilefound2 =  getLoadFile('minus.png');
				if(imgfilefound2)
				{
					delbtnimgUrl = imgfilefound2.getURL();
					nlapiLogExecution('ERROR', 'imgUrl', delbtnimgUrl);
				}

			}
		}
		nlapiLogExecution('DEBUG', 'getStockConversionRate', getStockConversionRate); 
		if(getStockConversionRate == null || getStockConversionRate =='' || getStockConversionRate =='null' || getStockConversionRate =='undefined')
			getStockConversionRate = 1;
		nlapiLogExecution('DEBUG', 'getStockConversionRate', getStockConversionRate); 
		var vUnitsText="";
		//Case # 201414603  start
		if(parseFloat(getStockCRate) != 0 && vBaseUnit != "")
			vUnitsText = 'In '+ vBaseUnit;
		//Case # 201414603  end
		if(parseFloat(getStockConversionRate) == 1)
			vBaseUnit="";

		if(itemType == null || itemType == '')
			itemType = getItemType; 

		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
		{
			availableQty=request.getParameter('custparam_lotavailableqty');
		}

		// for UOM dropdown change
		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' &&
				qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}
		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');

		var vBinDetails=fnGetStageBinDetails(whLocation,enterBin);


		var btnText='Save (Ent)';
		if(getItemType == "serializedinventoryitem" || getItemType=="serializedassemblyitem")
		{
			btnText='Next (Ent)';
		}
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		
		var domainName = fndomainName();
		
		var st0 = domainName + '-Stage Bin Transfer';
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

		html = html + "</head><body onload='setFocus();'>";
		html = html +"<script type = 'text/javascript' >function validate(){ return validateFormforinventory(\""+getStockConversionRate+"\",\""+availableQty+"\",'hdnselecteduomswithqty','hdnItemType','txtbin','hdnPreferBin','hdntotaluomqtyentered') }</script>";
		html = html +"<script type = 'text/javascript' >function validatebin(bin){ return DisplayBinforinventory(bin,\""+getStockConversionRate+"\",\""+availableQty+"\",'hdnselecteduomswithqty','hdntotaluomqtyentered','hdnItemType','txtbin','_rf_checkin_item') }</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		"<input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validate();'/>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Stage Bin Transfer -To Stage</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Warehouse Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>From Stage Location: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Available Qty: <label>" + parseFloat(parseFloat(availableQty).toFixed(8))  + " " + blnItemUnit + "</label>"+
		"			</tr>"+		
		"			<tr>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdnItemType' id='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnEnterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnAvailableQty' id='hdnAvailableQty' value=" + availableQty + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnlotno' value='" + lotno + "'>"+
		"				<input type='hidden' name='hdnEnterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+	
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdnFromScreen' id='hdnFromScreen' value=" + fromscreen + ">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>";

		if(lotno!=null && lotno!='' && lotno!='null')
		{
			html = html +"<tr>";
			html = html +"<td align = 'left' class='labelmsg'>Lot#: <label>" + lotno + "</label>";
			html = html +"</tr>";
		}
		if(inventoryStatusFeature == true)
		{
			if(invt_status != null && invt_status != '' && invt_status != 'null' && invt_status != 'undefined')
			{
				var vInventoryStatus ='';
				var hdnInvtStatusText = request.getParameter('hdnInvtStatusText');
				if(hdnInvtStatusText != '' && hdnInvtStatusText != null && hdnInvtStatusText != 'null' && hdnInvtStatusText != 'undefined')
				{
					vInventoryStatus = hdnInvtStatusText;
				}
				else
				{
					var inventoryStatusLst = getInventoryStatusListForOutBound(-1,invt_status);

					if(inventoryStatusLst.length > 0)
					{
						vInventoryStatus = inventoryStatusLst[0][0];
					}
				}
				html =html+ "			<tr>"+
				"			<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
				"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + vInventoryStatus + "'>"+	
				"				<input type='hidden' name='hdnInvtStatus' id = 'hdnInvtStatus' value='" + invt_status + "'>"+	
				"				<input type='hidden' name='hdnEnteredBinId' id = 'hdnEnteredBinId' value='" + enteredBinId + "'>"+
				"			</tr>";

			}
		}

		//For UOM 
		if(results !=null &&  results !='' && results.length>0)
		{
			var selectedUomStr = request.getParameter('custparam_uomqtyselected');
			nlapiLogExecution('ERROR', 'selectedUomStr', selectedUomStr);
			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				nlapiLogExecution('ERROR', 'inside', selectedUomStr);
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

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+availableQty+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr></table>";	
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
						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+availableQty+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr>";
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
			"				<td align = 'left'>";			
			html= html+"<input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>";			
			html= html+"				</td>"+
			"			</tr>";

		}
		html = html +"<tr>"+

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

			html = html +"<td><select id='invttostatus' name='invttostatus' class='labelmsg' >" ;

			if(invtStatusArr !=null &&  invtStatusArr !='' && invtStatusArr.length>0)
			{
				for(var statusItr=0; statusItr < invtStatusArr.length; statusItr++)
				{                    	 
					var statusVal = invtStatusArr[statusItr][1];
					var statusText =invtStatusArr[statusItr][0];

					if(invt_status == statusVal)
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
		html=html+"</table>"+

		"			<table><tr>"+
		"				<td align = 'left'>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='"+btnText+"' onclick='return validate();'/>"+
		"			</tr></table>";

		var errorMsgValue='';
		if((vBinDetails!=null && vBinDetails!='') || (getPreferBin != null && getPreferBin != '' && getPreferBin != 'null'))
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
				html=html+"<td align = 'left' class='labelmsg'>Inv Status</td></tr>";
			}

			html = html +"<tr>";
			if(results !=null &&  results !='' && results.length>0)
			{
				html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUom_OnChange();'>";
				var selectedUOM = request.getParameter('custparam_uomprevselected');
				for(var Cnt1=0; Cnt1 < results.length; Cnt1++)
				{                    	 
					var vUOM = results[Cnt1].getValue('conversionrate');
					var UOMText =results[Cnt1].getValue('unitname');
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
				html=html+"<td ><select id='invtstatuslst' name='invtstatuslst' class='labelmsg' " +
				" name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
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

			html = html +"</table>" ;

			html = html + 	" <table  style='border-spacing: 0;' id='tblqtyUOM'>";
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

			var cnt = 0;

			var convRate = 1;
			var selectedUOM = request.getParameter('custparam_uomprevselected');
			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
			{			
				convRate =getStockCoversionRate(VUnitType,blnItemUnit,selectedUOM);
			}
			for (var st = 0; st < vBinDetails.length; st++) {
				if(st%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var currValues = vBinDetails[st];
				var txtBin = currValues[0];
				var txtBinInternalId = currValues[1];
				var qtyDetails = getBinwiseQtyDetails_stage(txtBinInternalId,whLocation,makeInvAvailFlagFromSelect);
				var qty = qtyDetails[0];
				var inventoryStatus = '';
				var itr = 1;
				if(inventoryStatusFeature == true &&(qtyDetails != null && qtyDetails != '' && qtyDetails != 'null' && qtyDetails != 'undefined' && qtyDetails.length >0) )
				{
					itr = qtyDetails.length;
				}
				for(var invtItr = 0;invtItr<itr;invtItr ++ )
				{

					qty = qtyDetails[invtItr];
					if(inventoryStatusFeature == true && qty != null && qty != '' && qty != 'null' && qty != undefined)
					{

						inventoryStatus = qty[1];
						qty = qty[0];
					}
					if(qty == '' || qty == null || qty == 'undefined')
						qty=0;
					if(enterBin!=txtBin && getPreferBin != txtBin)
					{
						cnt= cnt + 1 ; 
						html = html +	"			<tr class='" + vAltClass + "'>"+
						"				<td><a  onclick='return   validatebin(\""+txtBin+"\");' href='#' >"+txtBin+"</a>"+					
						"				</td>"+
						"				<td class='align-right'>"+Number(Big(qty).mul(convRate).toFixed(8))+""+
						"				</td>";
						if(inventoryStatusFeature == true)
						{
							html = html +	"			<td></td>	<td align = 'left' class='status-cl-display'>"+inventoryStatus;	
							html = html +"				</td>";	
						}
						html = html +"			</tr>";
					}
					if(parseInt(cnt) >= 5)
						break;
				}
				if(parseInt(cnt) >= 5)
					break;
			}
			html = html +" </td>"+
			"</tr>"+
			"</table>";

		}
		if(vBinDetails.length==0)
		{
			errorMsgValue="T";

		}
		vBinDetails=null;
		html = html +"			<table><tr>"+

		"				<input type='hidden' name='hdnerrorMsgValue' id='hdnerrorMsgValue' value=" + errorMsgValue + ">"+
		"				</td>"+
		"			</tr>";
		html = html + " </table></form>";
		if(results ==null ||  results =='' || results == 'null')
		{
			html = html+"<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
		}
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

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var toBin=request.getParameter('txtbin');
		var enterQty=request.getParameter('txtqty');

		nlapiLogExecution('ERROR', 'enterQty',enterQty);
		if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
		{
			enterQty = request.getParameter('hdntotaluomqtyentered');
			POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			nlapiLogExecution('ERROR', 'POarray["custparam_uomqtyselected"]',POarray["custparam_uomqtyselected"]);
			if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined' && !isNaN(enterQty))
			{
				enterQty = Big(enterQty);

			}
		}
		nlapiLogExecution('ERROR', 'enterQty after',enterQty);
		var availableQty=request.getParameter('custparam_availableqty');
		var itemType=request.getParameter('hdnItemType');
		var enteredBinId = request.getParameter('hdnEnteredBinId');

		POarray["custparam_enterQty"] = enterQty;
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');		
		POarray["custparam_lotno"] =request.getParameter('hdnlotno');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_fetcheditemname"]=request.getParameter('custparam_fetcheditemname');
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		POarray["custparam_enterBin"] = request.getParameter('hdnEnterBin');
		POarray["custparam_availableqty"] = request.getParameter('custparam_availableqty');
		POarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		POarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		POarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		POarray["custparam_lotavailableqty"]=request.getParameter('hdnAvailableQty'); 
		POarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
		POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		POarray["custparam_fromscreen"] = request.getParameter('hdnFromScreen');
		POarray["custparam_inventorystatus"] = request.getParameter('hdnInvtStatus');
		POarray["custparam_enteredBinID"]=  enteredBinId;
		POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		if(getStockConversionRate == null || getStockConversionRate == '')
			getStockConversionRate=1;
		var availableQty=request.getParameter('hdnAvailableQty');
		if(availableQty != null && availableQty != '' && availableQty != 'null' && availableQty != 'undefined' && !isNaN(availableQty))
		{
			availableQty = Big(availableQty).mul(getStockConversionRate);
		}

		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var lotno= request.getParameter('hdnlotno');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var optedEvent = request.getParameter('cmdPrevious');
		var preferBin=request.getParameter('hdnPreferBin');
		var whLocation = request.getParameter('custparam_whlocation');
		var logMsg = 'POarray["custparam_lotno"] = ' + POarray["custparam_lotno"] + '<br>';

		logMsg = logMsg + 'POarray["custparam_whlocation"] = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_company"] = ' + POarray["custparam_company"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_whlocationname"] = ' + POarray["custparam_whlocationname"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_itemtype"] = ' + POarray["custparam_itemtype"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_fetcheditemid"] = ' + POarray["custparam_fetcheditemid"] + '<br>';

		logMsg = logMsg + 'POarray["custparam_enterBin"] = ' + POarray["custparam_enterBin"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_availableqty"] = ' + POarray["custparam_availableqty"] + '<br>';
		logMsg = logMsg + 'POarray["custparam_enterQty"] = ' + POarray["custparam_enterQty"] + '<br>';
		logMsg = logMsg + 'blnMixItem = ' + blnMixItem + '<br>';
		logMsg = logMsg + 'blnMixLot = ' + blnMixLot + '<br>';
		logMsg = logMsg + 'POarray["custparam_stockconversionrate"] = ' + POarray["custparam_stockconversionrate"] + '<br>';
		nlapiLogExecution('ERROR', 'Processing BT RF - TO BIN', logMsg);
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

					var isFromStatusChange = request.getParameter('hdnfromstatuschange');
					nlapiLogExecution('DEBUG', 'isFromStatusChange', isFromStatusChange);
					if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' &&
							isFromStatusChange != 'undefined' && isFromStatusChange != undefined && isFromStatusChange=='T' )
					{
						var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
						nlapiLogExecution('DEBUG', 'invtstatuslst', makeInventoryAvailFlag);
						POarray["custparam_pagecount"]=0;
						POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						POarray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 
								'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
						return;

					}

					try{
						if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && parseFloat(availableQty) >= parseFloat(enterQty))
						{
							if((toBin==null || toBin=='') && (preferBin != null && preferBin != ''))
							{
								toBin=preferBin;						 
							}
							if(toBin!=null && toBin!="" && toBin !='null')
							{
								var stgLocId=0;
								var cols =new Array();
								cols[0] = new nlobjSearchColumn('name');
								var BinlocationTypes =  new nlapiSearchRecord('customlist_wmsse_bin_loc_type', null, null, cols);
								nlapiLogExecution('DEBUG','BinlocationTypes',BinlocationTypes);
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
								filter.push(new nlobjSearchFilter('binnumber','null','is',toBin));
								filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type','null','anyof',stgLocId));
								filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_stg_direction','null','anyof',['1']));
								if(whLocation!=null && whLocation!="" && whLocation!="null" && whLocation!=undefined)
									filter.push(new nlobjSearchFilter('location','null','anyof',whLocation));

								var searchrecord=nlapiSearchRecord('Bin',null,filter,null);
								if(searchrecord!=null && searchrecord!="" && searchrecord!="null")
									vtoBinInternalId=searchrecord[0].getId();
								if(vtoBinInternalId==null || vtoBinInternalId=='' || vtoBinInternalId == 'null' || vtoBinInternalId == 'undefined')
								{
									POarray["custparam_error"] = 'Please enter/scan valid stage location';
									response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
									return;
								}

							}
							else
							{
								POarray["custparam_error"]='Please enter/scan stage location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
								return;
							}
						}
						else {						
							if(Number(enterQty) > Number(Big(availableQty).mul(POarray["custparam_stockconversionrate"])))
							{
								POarray["custparam_error"] = 'Scanned qty is greater than available qty ';
							}
							else
							{
								POarray["custparam_error"] = 'Please enter valid qty';
							}

							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
							nlapiLogExecution('ERROR', 'No Item scanned ', '');
							return;
						}
						var fromBinInternalId='';
						fromBinInternalId=nswms_GetBinInternalId(POarray["custparam_enterBin"],whLocation);


						if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
						{
							POarray["custparam_inventorystatus"] = request.getParameter('hdnInvtStatus');
							POarray["custparam_toinventorystatus"] = request.getParameter('invttostatus');
							POarray["custparam_error"] = '';
							POarray["custparam_enterToBin"] = vtoBinInternalId;
							POarray["custparam_enterQty"]=Number(Big(enterQty).mul(getStockConversionRate));
							nlapiLogExecution('DEBUG', 'into serial scan', itemType);
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_serial_scan', 'customdeploy_wmsse_stginvt_serial_scan', false, POarray);
							return;
						}
						else if(itemType == "inventoryitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType=="assemblyitem")
						{

							nlapiLogExecution('DEBUG', 'vbinInternalId', vtoBinInternalId);
							nlapiLogExecution('DEBUG', 'fromBinInternalId', fromBinInternalId);
							var fromInvStatus = request.getParameter('hdnInvtStatus');
							var toInvStatus = request.getParameter('invttostatus');
							var binTransferQty = Number(Big(enterQty).mul(getStockConversionRate).toFixed(8));
							var binTransferId= inventoryBinTransfer(itemType,POarray["custparam_whlocation"],FetchedItemId,binTransferQty,
									fromBinInternalId,vtoBinInternalId,lotno,'',POarray["custparam_itemunits"],
									POarray["custparam_stockconversionrate"],Number(Big(enterQty).toFixed(8)),fromInvStatus,toInvStatus);
							nlapiLogExecution('DEBUG', 'Bin Transfered successfully', binTransferId);

							response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 'customdeploy_wmsse_inventorymenu', false, POarray);
							return;
						}

					}
					catch(e)
					{
						nlapiLogExecution('ERROR', 'inside catch exception', e);

						if ( e instanceof nlobjError )
						{
							POarray["custparam_error"]=e.getDetails();
							nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
						}
						else
						{
							POarray["custparam_error"]=e.toString();
							nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
						}


						response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
						return;
					}

				} 
				else {
					var prevScreen = request.getParameter('hdnFromScreen');
					if(prevScreen == 'StatusScan')
					{
						POarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_stg_statusscan', 
								'customdeploy_wmsse_stg_statusscan', false, POarray);
					}
					else
					{

						if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
						{
							POarray["custparam_error"]='';
							nlapiLogExecution('ERROR', 'into lotnumberedinventoryitem', itemType);
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_lot_scan', 'customdeploy_wmsse_stginvt_lot_scan', false, POarray);
							return;
						}
						else
						{
							POarray["custparam_error"]='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_item_scan', 'customdeploy_wmsse_stginvt_item_scan', false, POarray);
							return;
						}
					}
				}
			}
			catch(e)
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

				if ( e instanceof nlobjError )
				{
					POarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					POarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}

				response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_stginvt_tostage_scan', 'customdeploy_wmsse_stginvt_tostage_scan', false, POarray);
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
	cols[0]=new nlobjSearchColumn('inventorynumber');
	cols[1]=new nlobjSearchColumn('location');
	if(location != null && location != '')
		filter.push(new nlobjSearchFilter('location',null, 'anyof', location)); 
	if(lot!=null && lot!='')
		filter.push(new nlobjSearchFilter('inventorynumber',null, 'is', lot)); 
	var objDetails = new nlapiSearchRecord('inventorynumber','null',filter, cols);

	if(objDetails != null && objDetails != '' && objDetails.length > 0)
	{
		lotInternalId = objDetails[0].getId();
	}
	nlapiLogExecution('DEBUG', 'lotInternalId ', lotInternalId);
	return lotInternalId;
}

function fnGetStageBinDetails(strLocation,vFromSTgLoc)
{
	nlapiLogExecution('DEBUG','vFromSTgLoc',vFromSTgLoc);

	var vBinLocArr = new Array();
	var vTOStageLocArr = new Array();
	var filterStrat = new Array(); 

	if(strLocation!= null && strLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', strLocation));
	var objBinDetails = new nlapiSearchRecord('bin','customsearch_stage_bindetails',filterStrat, null);
	if(objBinDetails != null && objBinDetails != '')
	{
		nlapiLogExecution('DEBUG','objBinDetails',objBinDetails.length);
		for(var j=0;j<objBinDetails.length;j++)
		{
			var vValidBin=objBinDetails[j].getValue('binnumber');
			var vValidBinId=objBinDetails[j].getId();
			
			if(vValidBinId != null && vValidBinId != '' && (vFromSTgLoc != vValidBin) && vBinLocArr.indexOf(vValidBinId) == -1)
			{
				vBinLocArr.push(vValidBinId);
				var currRow = [vValidBin,vValidBinId];
				vTOStageLocArr.push(currRow);
			}
		}	
	} 

	return vTOStageLocArr;
}
//Function to get total qty against bin loaction
function getBinwiseQtyDetails_stage(binId,location,invstatus)
{
	nlapiLogExecution('Debug', 'binId', binId);
	nlapiLogExecution('Debug', 'location', location);


	var qtyArray=new Array();

	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	if(inventoryStatusFeature == true)
	{
		var objBinStatusDetails =  new Array();
		var vStatusResults =   nlapiLoadSearch('InventoryBalance','customsearch_wmsse_srchres_statusgrpwise');
		var invfilterStrat =  new Array();
		if(location != null && location != '')
			vStatusResults.addFilter(new nlobjSearchFilter('location',null, 'anyof', location));		
		if(binId != null && binId != '')
			vStatusResults.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binId));

		if(invstatus != null && invstatus != '' && invstatus != 'null' &&
				invstatus != 'undefined' && invstatus != undefined )
		{
			if(invstatus == 'T' || invstatus == 'F')
			{
				vStatusResults.addFilter(new nlobjSearchFilter('inventoryavailable','inventorystatus', 'is', invstatus));
			}
			else
			{
				if(invstatus != 'All')
				{
					vStatusResults.addFilter(new nlobjSearchFilter('status',null, 'anyof', invstatus));	
				}

			}

		}


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
			for(var stsItr=0;stsItr<objBinStatusDetails.length;stsItr++)
			{				

				var status = objBinStatusDetails[stsItr].getText('status',null,'group');					
				var vBinQty=objBinStatusDetails[stsItr].getValue('onhand',null,'sum');				
				var statusId = objBinStatusDetails[stsItr].getValue('status',null,'group');
				var eneteredLotTxt = objBinStatusDetails[stsItr].getText('inventorynumber',null,'group');
				var currRow = [vBinQty,status];
				qtyArray.push(currRow);
				if(qtyArray.length >= 5)
				{
					break;
				}
			}

		}
	}
	else
	{
		var filterStrat = new Array();
		if(location!=null && location!='')
			filterStrat.push(new nlobjSearchFilter('location','binOnHand','anyof', location));
		if(binId!=null && binId!='')
			filterStrat.push(new nlobjSearchFilter('binnumber','binOnHand', 'anyof', binId));

		var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_binwise_inventory',filterStrat, null);
		if(objInvDetails !=null && objInvDetails !='' && objInvDetails.length > 0)
		{
			for(var s=0;s<objInvDetails.length;s++)
			{
				var qty=objInvDetails[s].getValue('quantityonhand','binOnHand','sum');
				qtyArray.push(qty);
			}
		}
	}
	nlapiLogExecution('Debug', 'qtyArray', qtyArray);
	return qtyArray;
}
