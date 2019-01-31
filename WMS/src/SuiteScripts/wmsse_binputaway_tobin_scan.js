/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

function RFBinPutawayTOBIN(request, response)
{
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

		var whLocationName = request.getParameter('custparam_whlocationname');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		if(whLocation != null && whLocation !='' && (whLocationName == '' || whLocationName == 'null' || whLocationName == null || 
				whLocationName =='undefined'))
		{
			var locationRec= nlapiLoadRecord('location',whLocation);
			whLocationName = locationRec.getFieldValue('name');
		}
		nlapiLogExecution('ERROR', 'whLocation', whLocation);
		var whCompany= request.getParameter('custparam_company');

		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemType = request.getParameter('custparam_itemtype');
		var lotno=request.getParameter('custparam_lotno');
		var status=request.getParameter('custparam_invstatusname');
		var statusID = request.getParameter('custparam_invstatusid');
		var availableQty = request.getParameter('custparam_availableqty');
		var binAvailableQty = request.getParameter('custparam_binAvailableqty');
		var statusScanScreenFlag = request.getParameter('custparam_statusScanScreenFlag');
		var makeInvAvailFlag = request.getParameter('custparam_makeinventoryavailflag');
		var enteredBinID = request.getParameter('custparam_enteredBinID');
		var enteredlot = request.getParameter('custparam_enteredlot');
		var vUnits = request.getParameter('custparam_uom');
		var VUnitType = request.getParameter('custparam_unittype');
		var enteredQtyStatusScan = request.getParameter('custparam_enteredQtyStatusScan');
		//Function to fetch if the inventory status feature is enabled.
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

		var enterBin=request.getParameter('custparam_enterBin');
		var blnMixItem=request.getParameter('custparam_blnmixitem');
		var blnMixLot=request.getParameter('custparam_blnmixlot'); 
		var getPreferBin=request.getParameter('custparam_preferbin');
		var enterQty=request.getParameter('custparam_enterQty');
		var toBinFlag ='T';
		
		var vbarcodecompstring = request.getParameter('custparam_bcComponents');

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		
		if(whLocation!=null && whLocation!='' && getItemType != "noninventoryitem" && 
				getItemType!="otherchargeitem" && getItemType!="serviceitem" && getItemType!="downloaditem" && getItemType!="giftcertificateitem")
			itemfilters.push(new nlobjSearchFilter('inventorylocation',null, 'anyof', whLocation));
		
		var itemcolumns= new Array();


		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_receivingitemdetails', itemfilters, null);
		var strItemGrp="";
		var strItemFam="";
		var blnMixItem="F";
		var blnMixLot="F";
		var itemType='';
		var blnItemUnit="";
		var VUnitType ="";
		var Vdepartment ="";
		var Vclass ="";
		var uomresults= new Array();
		var results='';
		var addbtnimgUrl='';
		var delbtnimgUrl='';
		var vClissification;
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
				response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
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
			vClissification=itemresults[0].getValue('locationinvtclassification');
			getFetchedItemName = itemresults[0].getValue('itemid');
			if(departments == true)
				Vdepartment = itemresults[0].getValue('department');
			if(classes == true)
				Vclass = itemresults[0].getValue('class');
		}
		var getStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
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
		if(getStockConversionRate == null || getStockConversionRate =='' || getStockConversionRate =='null' || getStockConversionRate =='undefined')
			getStockConversionRate = 1;
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


		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');

		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselect');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && qtyUOMCtrlSelectedVal !='undefined' && 
				qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}
		var statusEnableFlag = 'T';//To check whether status bind required or not while displaying Bins.

if(statusID!=null && statusID!='' && statusID!='null' && statusID!='undefined' && 
				request.getParameter('flgStatusChange') != 'T')
		{	
            makeInvAvailFlagFromSelect = statusID;
		    makeInvAvailFlag = statusID;
		}
		//to fetch bins according to Put Strategies.
		var vBinDetails=fnGetPutBinAndIntDetails(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,whLocation,itemType,lotno,
				Vdepartment,Vclass,'',makeInvAvailFlagFromSelect,statusEnableFlag,null,vClissification);


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

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-Bin Putaway';
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

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		var JSSurl ='';
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			nlapiLogExecution('ERROR', 'JSSurl', JSSurl); 
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

		html = html +"<script type = 'text/javascript' >function validate(){ return validateFormforinventory(\""+getStockConversionRate+"\",\""+availableQty+"\",'hdnselecteduomswithqty','hdnItemType','txtbin','hdnPreferBin','hdntotaluomqtyentered') }</script>";
		html= html+"<script type = 'text/javascript' >function validatebin(bin){return DisplayBinforinventory(bin,\""+getStockConversionRate+"\",\""+availableQty+"\",'hdnselecteduomswithqty','hdntotaluomqtyentered','hdnItemType','txtbin','_rf_checkin_item') }</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();' >";
		html = html +"	<form name='_rf_checkin_item' method='POST'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validate();'/>"+ //onkeydown='return OnKeyDown_CL()' >";onload='setFocus();'
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Bin Putaway To Bin</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Stage Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Available Qty: <label>" + parseFloat(parseFloat(availableQty).toFixed(8)) + " " + blnItemUnit + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdnItemType' id='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnEnterBin' value='" + enterBin + "'>"+
		"				<input type='hidden' name='hdnAvailableQty' id='hdnAvailableQty' value=" + availableQty + ">"+
		"				<input type='hidden' name='hdnbinAvailableQty' id='hdnbinAvailableQty' value=" + binAvailableQty + ">"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnlotno' value='" + lotno + "'>"+
		"				<input type='hidden' name='hdnEnterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnBaseUnitText' id='hdnBaseUnitText' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+	
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnInvtStatusText' id='hdnInvtStatusText' value='" + status + "'>"+
		"				<input type='hidden' name='hdnstatusID' id='hdnstatusID' value='" + statusID + "'>"+
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdntostatusid' id='hdntostatusid'>"+	
		"				<input type='hidden' name='hdnstatusScanScreenFlag' id='hdnstatusScanScreenFlag' value=" + statusScanScreenFlag + ">"+
		"				<input type='hidden' name='hdnenteredBinID' id='hdnenteredBinID' value=" + enteredBinID + ">"+
		"				<input type='hidden' name='hdnenteredlot' id='hdnenteredlot' value=" + enteredlot + ">"+
		"				<input type='hidden' name='hdnvUnits' id='hdnvUnits' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnenteredQtyStatusScan' id='hdnenteredQtyStatusScan' value=" + enteredQtyStatusScan + ">"+
		"				<input type='hidden' name='hdntoBinFlag' id='hdntoBinFlag' value=" + toBinFlag + ">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+	
		"				</td>"+
		"			</tr>";
		if(lotno!=null && lotno!='' && lotno!='null')
		{
			html = html +"<tr>";
			html = html +"<td align = 'left' class='labelmsg'>Lot#: <label>" + lotno + "</label>";
			html = html +"</tr>";
		}
		if(statusID!=null && statusID!='' && statusID!='null')
		{

			var vInventoryStatus = status;

			html =html+ "			<tr>"+
			"			<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
			"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + vInventoryStatus + "'>"+	
			"			</tr>";

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

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+availableQty+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr></table>";	
			}
			else
			{
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
			html = html +"<tr>"+
			"				<td align = 'left' class='labelmsg'>Enter Qty "+ vUnitsText +
			"				</td>"+
			"			</tr>"+
			"			<tr>"+
			"<td align = 'left'>";

			html= html+"<input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>";

			html= html+"</td></tr>";
		}
		html = html +"<tr>"+

		"				<td align = 'left' class='labelmsg'>Enter/Scan To Bin Location"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		"				</td>"+
		"			</tr></table>"+

		"			<table><tr>"+
		"				<td align = 'left'>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='"+btnText+"' onclick='return validate();'/>"+
		"			</tr></table>";

		var errorMsgValue='';
		if((vBinDetails!=null && vBinDetails!='') || (getPreferBin != null && getPreferBin != '' && getPreferBin != 'null') ||
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{
			html = html + 	" <tr ><td  ><table   class='uomstatus-gridgap' >";			
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
				html = html +"<td align = 'left' " +
				"class='labelmsg'>Inv Status</td></tr>";
			}
			else
			{
				html=html+"</tr>";
			}
			html = html +"<tr>";
			nlapiLogExecution('DEBUG', 'getStockConversionRate', getStockConversionRate);
			if(results !=null &&  results !='' && results.length>0)
			{
				html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUom_OnChange();'>";
				var selectedUOM = request.getParameter('custparam_uomprevselect');
				nlapiLogExecution('DEBUG', 'selectedUOM 0', selectedUOM);
				for(var Cnt1=0; Cnt1 < results.length; Cnt1++)
				{                    	 
					var vUOM = results[Cnt1].getValue('conversionrate');
					var UOMText =results[Cnt1].getValue('unitname');
					nlapiLogExecution('DEBUG', 'vConversionRate,vUOM', vConversionRate +','+ vUOM);

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
			// code to execute only if the inventory status feature is enabled.
			if(inventoryStatusFeature == true)
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

			html = html +"</table></td></tr>" ;

			html = html +"<tr>" ;


			html = html + 	" <table  style='border-spacing: 0;' id='tblqtyUOM'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Bin"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";
			if(inventoryStatusFeature == true)
			{
				html = html +"				<td></td>";
				html = html +	"			<td></td>	<td class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}
			else if(parseFloat(getStockConversionRate) != 1 && vUnitsText != '')
			{
				html = html +"				<td></td>";
				html = html +	"<td class='align-right'>Qty "+ vUnitsText +	
				"				</td>";
			}
			html = html +	"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			var inventoryStatus = '';
			var count = 0;
			var precount=0;
			var inventoryStatus = '';
			var vqty = '';
			var convRate = 1;
			var selectedUOM = request.getParameter('custparam_uomprevselect');
			nlapiLogExecution('DEBUG', 'selectedUOM 2', selectedUOM);
			nlapiLogExecution('DEBUG', 'VUnitType', VUnitType);
			nlapiLogExecution('DEBUG', 'blnItemUnit', blnItemUnit);
			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
			{			
				convRate =getStockCoversionRate(VUnitType,blnItemUnit,selectedUOM);
			}

			nlapiLogExecution('DEBUG', 'convRate', convRate);
			if(getPreferBin != null && getPreferBin != '' && enterBin != getPreferBin)
			{
				var preferBinId = nswms_GetValidBinInternalId(getPreferBin,whLocation,null);

				if(inventoryStatusFeature == true)
				{
					//function to get the quantity deatils of TO Scan bin satus wise.
					var objBinStatusDetails = fnToGetInvDetailfromInvBalance(whLocation,preferBinId,makeInvAvailFlagFromSelect);
					nlapiLogExecution('DEBUG', 'objBinStatusDetails', 'objBinStatusDetails');
					if(objBinStatusDetails != '' && objBinStatusDetails != 'null' && objBinStatusDetails != null)
					{
						nlapiLogExecution('DEBUG', 'objBinStatusDetails', objBinStatusDetails.length);
						for(var tobindtls = 0; tobindtls < objBinStatusDetails.length  && count <5; tobindtls++)
						{
							count++;
							precount++
							nlapiLogExecution('DEBUG', 'count', count);
							inventoryStatus = objBinStatusDetails[tobindtls].getText('status',null,'group');
							vqty = objBinStatusDetails[tobindtls].getValue('onhand',null,'sum');
							nlapiLogExecution('DEBUG', 'inventoryStatus', inventoryStatus);
							nlapiLogExecution('DEBUG', 'vqty', vqty);
							vqty=Number(Big(vqty).mul(convRate));

							html = html + "	<tr class='" + vAltClass + "'>"+
							" <td><a  onclick='return validatebin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+ 

							"				<td class='align-right'>"+parseFloat(parseFloat(vqty).toFixed(8))+""+	
							"				</td>";
							html = html +"				<td></td>";
							html = html +	"			<td></td>	<td class='status-cl-display'>"+inventoryStatus;	
							html = html +"				</td>";	

							html = html +"</tr>";

						}
					}
					else
					{
						nlapiLogExecution('DEBUG', 'vqty', 'vqty');

						vqty = 0;
						inventoryStatus = '';
						html = html + "	<tr class='" + vAltClass + "'>"+
						" <td><a  onclick='return validatebin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+ 

						"				<td class='align-right'>"+parseFloat(parseFloat(vqty).toFixed(8))+""+	
						"				</td>";

						html = html +"				<td></td>";
						html = html +	"			<td></td>	<td class='status-cl-display'>"+inventoryStatus;	
						html = html +"				</td>";	

						html = html +"</tr>";
					}
				}
				else
				{
					var preferqtyDetails = getBinwiseQtyDetails(preferBinId,whLocation);
					var vqty=preferqtyDetails[0];
					if(vqty == '' || vqty == null || vqty == 'undefined')
						vqty=0;
					html = html + "	<tr class='" + vAltClass + "'>"+
					" <td><a  onclick='return validatebin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+ 

					"				<td class='align-right'>"+parseFloat(parseFloat(vqty).toFixed(8))+""+	
					"				</td>";
					if(parseFloat(getStockConversionRate) != 1 && vUnitsText != '')
					{
						html = html +"				<td></td>";
						vqty=Number(Big(vqty).mul(getStockConversionRate));
						html = html +"				<td class='align-right'>"+parseFloat(parseFloat(vqty).toFixed(8))+"";
						html = html +"				</td>";
					}
					html = html +"</tr>";
				}	
			}
			for (var st = 0; st < vBinDetails.length && count<5; st++) {
				if(st%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';

				count++;

				var currValues = vBinDetails[st];
				var txtBin = currValues[0];
				var txtBinInternalId = currValues[1];
				var inventoryStatus = currValues[2];
				var invStatusId = currValues[3];
				var vBinQtyAvail = currValues[4];

				if(vBinQtyAvail==null || vBinQtyAvail=='')
				{
					var qtyDetails = getBinwiseQtyDetails(txtBinInternalId,whLocation);
					var qty = qtyDetails[0];
				}
				else{
					var qtyDetails = vBinQtyAvail;
					var qty = qtyDetails;
				}

				if(qty == '' || qty == null || qty == 'undefined')
					qty=0;
				if(enterBin!=txtBin && getPreferBin != txtBin)
				{	
					qty=Number(Big(qty).mul(convRate));
					html = html +	"			<tr class='" + vAltClass + "'>"+
					"				<td><a  onclick='return  validatebin(\""+txtBin+"\");' href='#' >"+txtBin+"</a>"+					
					"				</td>"+
					"				<td class='align-right'>"+parseFloat(parseFloat(qty).toFixed(8))+" "+	
					"				</td>";
					if(inventoryStatusFeature == true)
					{
						html = html +"				<td></td>";
						html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
						html = html +"				</td>";	
					}
					else if(parseFloat(getStockConversionRate) != 1 && vUnitsText != '')
					{
						html = html +"				<td></td>";
						qty=Number(Big(qty).mul(getStockConversionRate));
						html = html +"				<td class='align-right'>"+parseFloat(parseFloat(qty).toFixed(8))+"";
						html = html +"				</td>";
					}
					html = html +"			</tr>";
				}
				if(getPreferBin==null || getPreferBin=='null' || getPreferBin=='' || getPreferBin==undefined)
				{
					if(parseInt(count) >= 5)						
						break;
				}
				else
				{
					if(precount!=0)
					{
						if(parseInt(count) >= 5)
							break;
					}
					else
					{
						if(parseInt(count) >= 4)
							break;
					}
				}
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
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		if(results ==null ||  results =='' || results == 'null')
		{
			html = html +"<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
		}
		else
		{
			html = html +"<script type='text/javascript'>setFocus();</script>";
		}
		

		html=html+"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		//nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var toBin=request.getParameter('txtbin');
		var enterQty=request.getParameter('txtqty');
		var availableQty=request.getParameter('custparam_availableqty');
		var itemType=request.getParameter('hdnItemType');
		var fromStatus = request.getParameter('hdnstatusID');


		if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
		{
			enterQty = request.getParameter('hdntotaluomqtyentered');
			POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');


		}

		if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined'&& !isNaN(enterQty))
		{
			enterQty=Number(Big(enterQty));
			nlapiLogExecution('DEBUG', 'enterQty',enterQty);
		}

		POarray["custparam_invstatusid"] = fromStatus;
		POarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
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
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		POarray["custparam_baseunit"] = request.getParameter('hdnBaseUnitText');
		POarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		POarray["custparam_uomprevselect"] = request.getParameter('hdnuomchangedvalue');
		POarray["custparam_binAvailableqty"]=request.getParameter('hdnbinAvailableQty');
		POarray["custparam_invstatusname"] =request.getParameter('hdnInvtStatusText');
		POarray["custparam_enteredBinId"] =request.getParameter('hdnenteredBinID');
		POarray["custparam_statusScanScreenFlag"] =request.getParameter('hdnstatusScanScreenFlag');
		POarray["custparam_enteredBinID"] =request.getParameter('hdnenteredBinID');
		POarray["custparam_enteredlot"] =request.getParameter('hdnenteredlot');
		POarray["custparam_uom"] =request.getParameter('hdnvUnits');
		POarray["custparam_unittype"] =request.getParameter('hdnVUnitType');		
		POarray["custparam_enteredQtyStatusScan"] =request.getParameter('hdnenteredQtyStatusScan');
		POarray["custparam_toBinFlag"] =request.getParameter('hdntoBinFlag');
		POarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var getStockConversionRate = request.getParameter('hdngetStockConversionRate');
		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
		{
			POarray["custparam_availableqty"]=request.getParameter('custparam_lotavailableqty');
		}

		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var lotno= request.getParameter('hdnlotno');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var optedEvent = request.getParameter('cmdPrevious');
		var preferBin=request.getParameter('hdnPreferBin');

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
		logMsg = logMsg + 'POarray["custparam_actualbegintime"] = ' + POarray["custparam_actualbegintime"] + '<br>';
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

					try{
						var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
						var isFromStatusChange = request.getParameter('hdnfromstatuschange');
						if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && 
								isFromStatusChange != undefined && isFromStatusChange=='T' )
						{
							POarray["flgStatusChange"] = isFromStatusChange;
							POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
							nlapiLogExecution('DEBUG', 'POarray["custparam_makeinventoryavailflag"]', POarray["custparam_makeinventoryavailflag"]);
							POarray["custparam_error"] = '';
							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
							return;

						}

						if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty))
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
								//filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_stg_direction','null','anyof',['1']));
								var searchrecord=nlapiSearchRecord('Bin',null,filter,null);
								if(searchrecord!=null && searchrecord!="")
									vtoBinInternalId=searchrecord[0].getId();
								if(vtoBinInternalId!='' && vtoBinInternalId!=null)
								{
									POarray["custparam_error"] = 'Please enter/scan valid bin location';
									response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
									return;
								}
								var vbinInternalId='';
								vbinInternalId=nswms_GetValidBinInternalId(toBin,POarray["custparam_whlocation"],FetchedItemId);
								if(vbinInternalId=='' || vbinInternalId==null)
								{
									POarray["custparam_error"] = 'Please enter/scan valid bin location';
									response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
									return;
								}

								//nlapiLogExecution('ERROR', 'lotno',lotno);


								if(toBin != preferBin)
								{
									if(blnMixItem!="T")
									{


										var filterStrat = new Array();

										if(FetchedItemId != null && FetchedItemId != '')
											filterStrat.push(new nlobjSearchFilter('internalid',null, 'noneof', FetchedItemId));
										if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '')
											filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', POarray["custparam_whlocation"]));
										if(vbinInternalId!= null && vbinInternalId!= '')
											filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', vbinInternalId));

										var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterStrat, null);

										if(objInvDetails!=null && objInvDetails!='')
										{
											if(objInvDetails.length>0)
											{
												nlapiLogExecution('ERROR', 'Inside if objInvDetails', objInvDetails.length);
												POarray["custparam_error"] = 'This item has mix items in bins flag false, choose different bin.';
												objBinDetails1=null;
												response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
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
												nlapiLogExecution('ERROR', 'Inside if objInvDetails', objInvDetails.length);
												//POarray["custparam_error"] = 'Please enter/scan valid bin location';
												POarray["custparam_error"] = 'This item has mix lots in bins flag false choose different bin.';
												objBinDetails1=null;
												response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
												return;
											}
										}
									}
								}

							}
							else
							{
								POarray["custparam_error"]='Please enter/scan bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
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

							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
							nlapiLogExecution('ERROR', 'No Item scanned ', '');
							return;
						}
						var fromBinInternalId='';
						fromBinInternalId=nswms_GetBinInternalId(POarray["custparam_enterBin"]);
						var filterStrat = new Array();
						filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
						if(fromBinInternalId!=null && fromBinInternalId!='')
							filterStrat.push(new nlobjSearchFilter('binnumber','binOnHand', 'anyof', fromBinInternalId));
						if(POarray["custparam_whlocation"]!= null && POarray["custparam_whlocation"]!= '')
							filterStrat.push(new nlobjSearchFilter('location','binOnHand','anyof', POarray["custparam_whlocation"]));

						var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_binwise_inventory',filterStrat, null);
						nlapiLogExecution("Error", "objBinDetails1", objBinDetails);
						if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails.length == null || objBinDetails.length <= 0)
						{

							POarray["custparam_error"] = 'Bin Putaway has been completed for this item.';
							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
							return;
						}

						if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
						{
							POarray["custparam_error"] = '';
							POarray["custparam_enterToBin"] = vbinInternalId;
							POarray["custparam_toStatus"] = fromStatus;
							nlapiLogExecution('ERROR', 'into serial1 scan', itemType);
							POarray["custparam_enterQty"]=Number(Big(enterQty).mul(getStockConversionRate));
							nlapiLogExecution('ERROR', 'into serial scan', itemType);
							nlapiLogExecution('ERROR', 'POarray["custparam_enterQty"]', POarray["custparam_enterQty"]);
							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_serial_scan', 'customdeploy_wmsse_bp_serial_scan', false, POarray);
							return;
						}
						else if(itemType == "inventoryitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType=="assemblyitem")
						{

							var binTransferQty = Number(Big(enterQty).mul(getStockConversionRate).toFixed(8));
							var logMsg = 'lotno = ' + lotno + '<br>';
							logMsg = logMsg + 'vbinInternalId = ' + vbinInternalId + '<br>';
							logMsg = logMsg + 'fromBinInternalId = ' + fromBinInternalId + '<br>';
							logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
							logMsg = logMsg + 'Number(Big(enterQty).toFixed(8)) = ' + Number(Big(enterQty).toFixed(8)) + '<br>';
							logMsg = logMsg + 'binTransferQty.toFixed(8) = ' + binTransferQty.toFixed(8) + '<br>';
							nlapiLogExecution('DEBUG', 'logs for bintransfer - TO BIN', logMsg);


							var binTransferId= inventoryBinTransfer(itemType,POarray["custparam_whlocation"],FetchedItemId,binTransferQty,fromBinInternalId,
									vbinInternalId,lotno,POarray['custparam_actualbegintime'],POarray["custparam_itemunits"],POarray["custparam_stockconversionrate"],
									Number(Big(enterQty).toFixed(8)),fromStatus,fromStatus);

							nlapiLogExecution('ERROR', 'Bin Transfered successfully', binTransferId);

							var filterStrat = new Array();

							if(fromBinInternalId!=null && fromBinInternalId!='')
								filterStrat.push(new nlobjSearchFilter('binnumber','binOnHand', 'anyof', fromBinInternalId));
							if(whLocation!= null && whLocation!= '')
								filterStrat.push(new nlobjSearchFilter('location','binOnHand','anyof', whLocation));
							var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_binwise_inventory',filterStrat, null);
							POarray["custparam_error"]='';
							nlapiLogExecution('ERROR', 'objBinDetails', objBinDetails);
							if(objBinDetails!=null && objBinDetails!='' && objBinDetails.length != null && objBinDetails.length > 0)
							{
								response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan', 'customdeploy_wmsse_bp_item_scan', false, POarray);
								return;
							}
							else 
							{
								var vBinLocArr=new Array();

								var filterStrat = new Array(); 

								if(whLocation!= null && whLocation!= '')
									filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
								filterStrat.push(new nlobjSearchFilter('custrecord_wmsse_bin_stg_direction','null','anyof',['1']));
								var objBinDetails = new nlapiSearchRecord('bin','customsearch_stage_bindetails',filterStrat, null);
								if(objBinDetails != null && objBinDetails != '')
								{
									if(objBinDetails.length > 0)
									{
										nlapiLogExecution('ERROR','objBinDetails',objBinDetails.length);
										for(var j=0;j<objBinDetails.length;j++)
										{
											var vValidBin=objBinDetails[j].getValue('binnumber');
											var vValidBinId=objBinDetails[j].getId();
											nlapiLogExecution('ERROR','vValidBin',vValidBin);
											if(vValidBinId != null && vValidBinId != '' && vBinLocArr.indexOf(vValidBinId) == -1 && vValidBinId !=fromBinInternalId  )
												vBinLocArr.push(vValidBinId);
										}
									}

									var filterStrat = new Array();

									if(vBinLocArr!=null && vBinLocArr!='')
										filterStrat.push(new nlobjSearchFilter('binnumber','binOnHand', 'anyof', vBinLocArr));
									if(whLocation!= null && whLocation!= '')
										filterStrat.push(new nlobjSearchFilter('location','binOnHand','anyof', whLocation));
									var objNewStgBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_binwise_inventory',filterStrat, null);
									if(objNewStgBinDetails!=null && objNewStgBinDetails!='' && objNewStgBinDetails.length != null && objNewStgBinDetails.length > 0)
									{
										response.sendRedirect('SUITELET', 'customscript_wmsse_frombin_lstscan', 'customdeploy_wmsse_frombin_lstscan', false, POarray);
										return;
									}
								} 

							}

							response.sendRedirect('SUITELET', 'customscript_wmsse_menu', 'customdeploy_wmsse_menu', false, POarray);
							return;

						}

					}
					catch(e)
					{
						nlapiLogExecution('ERROR', 'inside catch exception', e);

						if ( e instanceof nlobjError )
						{
							POarray["custparam_error"]=e.getDetails();
							nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() );
						}
						else
						{
							POarray["custparam_error"]=e.toString();
							nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() );
						}


						response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
						return;
					}

				} 
				else {
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						POarray["custparam_error"]='';
						POarray["custparam_availableqty"]=request.getParameter('hdnbinAvailableQty');

						if((inventoryStatusFeature == true) && POarray["custparam_statusScanScreenFlag"] == 'T')
						{
							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_status_scan', 'customdeploy_wmsse_bp_status_scan', false, POarray);
							return;
						}
						else
						{
							nlapiLogExecution('ERROR', 'into lotnumberedinventoryitem', itemType);
							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_lot_scan', 'customdeploy_wmsse_bp_lot_scan', false, POarray);
							return;
						}
					}
					else
					{
						if((inventoryStatusFeature == true) && POarray["custparam_statusScanScreenFlag"] == 'T')
						{
							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_status_scan', 'customdeploy_wmsse_bp_status_scan', false, POarray);
							return;
						}
						else
						{
							POarray["custparam_error"]='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_bp_item_scan','customdeploy_wmsse_bp_item_scan', false, POarray);
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

				response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_bp_tobin_scan', 'customdeploy_wmsse_bp_tobin_scan', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.

function GetInventoryNumberInternalId(lot,location)
{
	var lotInternalId = '';
	var str='lot :'+lot;
	str=str + 'location :'+location;
	nlapiLogExecution('ERROR', 'str ', str);
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
	nlapiLogExecution('ERROR', 'lotInternalId ', lotInternalId);
	return lotInternalId;
}
//Code to fetch Tobin quantity details status wise
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

