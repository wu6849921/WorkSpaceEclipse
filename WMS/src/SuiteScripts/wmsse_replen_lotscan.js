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
 **/
function CheckInLot(request, response)
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
		var vitemgroup = request.getParameter('custparam_itemgroup');
		var vitemfamily = request.getParameter('custparam_itemfamily');
		var vreplenminqty = request.getParameter('custparam_replenminqty');
		var vreplenmaxqty = request.getParameter('custparam_replenmaxqty');
		var vreplenqty = request.getParameter('custparam_replenqty');
		var vreplenroundqty = request.getParameter('custparam_replenroundqty');

		if(vreplenminqty==''||vreplenminqty=='null'||vreplenminqty==undefined||vreplenminqty==null)
			vreplenminqty=0;
		if(vreplenmaxqty==''||vreplenmaxqty=='null'||vreplenmaxqty==undefined||vreplenmaxqty==null)
			vreplenmaxqty=0;
		if(vreplenqty==''||vreplenqty=='null'||vreplenqty==undefined||vreplenqty==null)
			vreplenqty=0;
		if(vreplenroundqty==''||vreplenroundqty=='null'||vreplenroundqty==undefined||
				vreplenroundqty==null)
			vreplenroundqty=0;

		var getActualBeginDate = request.getParameter('custparam_actualbegindate');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var whLocation = request.getParameter('custparam_whlocation');
		var getitemType=request.getParameter('custparam_itemtype');
		var getLineNo = request.getParameter('custparam_lineno');
		var getReplenItem = request.getParameter('custparam_item');
		var getFetchedItemId = request.getParameter('custparam_itemid');
		var getItemInternalId = request.getParameter('custparam_itemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		//getItemRemQty = parseFloat(parseFloat(getItemRemQty).toFixed(5));
		var getItemRecQty = request.getParameter('custparam_rec_qty');		
		var getItemAvailQty = request.getParameter('custparam_availqty');
		//getItemAvailQty = parseFloat(parseFloat(getItemAvailQty).toFixed(5));
		var getBin = request.getParameter('custparam_getbin');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var vUnits = request.getParameter("custparam_uom"); 
		var vStockConversionRate = request.getParameter("custparam_stockconversionrate");
		var vUnitstype = request.getParameter("custparam_unitstype");
		var vStockUnit = request.getParameter("custparam_stockunit");
		var frombin = request.getParameter("custparam_frombin");
		var tobin = request.getParameter("custparam_tobin");
		var strvUnits = "";
		var headerVar='Replenishment';
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');		

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		//Checking whether the  InventoryStatus feature is enabled or not
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+headerVar;
		var getPreferBin='';

		var blnItemUnit="";
		var VUnitType ="";
		var getStockConversionRate = 1;
		var vBaseUnit = '';
		var vConversionRate = 1;
		var uomResult= '';

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
		}

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));

		var itemresults= nlapiSearchRecord('item',
				'customsearch_wmsse_replen_item_srh', itemfilters, null);
		if(itemresults!=null && itemresults!='')
		{
			blnItemUnit = itemresults[0].getText('stockunit');
			VUnitType = itemresults[0].getValue('unitstype');
		}

		if(VUnitType != null && VUnitType != '')
		{	
			var vBaseUOMSearch=getBaseUnitRate(VUnitType);
			uomResult= getUnitsType(VUnitType);
			vBaseUnit='Base unit';
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
				vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
			}	

			if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && 
					blnItemUnit !='undefined' && blnItemUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
			}
		}

		var vUnitsText="";
		if(blnItemUnit != "" && blnItemUnit != null && blnItemUnit != "null")
			vUnitsText = 'In '+ blnItemUnit;

		var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
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
					errMsg == "This item has mixflag false, please configure new bin locations" || 
					errMsg =="Please configure bin locations" || 
					errMsg =="Please configure put strategies and bin locations") && 
					((vBinDetails.length != null &&  vBinDetails.length > 0) || 
							(getPreferBin != null && getPreferBin != 'null' && getPreferBin !='' &&
									getPreferBin != 'undefined' && systemRule == 'N')))
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

		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML(
			"https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + 
			"' type='text/css' rel='stylesheet'>";

		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		html = html +"	<script type='text/javascript'>function DisplayBin(val,aQty) {" +
		" document.getElementById('txtlot').value=val;" +
		"document.getElementById('hdnavailQty').value=aQty;" +
		"document.forms['_rf_checkin_item'].submit();" +
		" document.getElementById('loading').style.display = ''; return true; }</script>";

		html = html + "<script type='text/javascript'>function validateForm(){" +
		"var patt = /[+|,\":<>{};`\';()/ /]/g; " +
		"var lotVal=document.getElementById('txtlot').value;" +
		" var vLotWhiteSpace = lotVal.indexOf(' ') >= 0;" +
		" if(document.getElementById('txtlot').value == '' ){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan lot#';" +
		"return false;}" +
		" else{document.getElementById('loading').style.display = '';" +
		" return true;}}</script>";


		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){" +
		"window.history.forward();}" +
		"setTimeout('preventBack()', 0);window.onunload=function(){null};</script>" +
		" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image'  src='"+imgUrl+"' class='centerImage'" +
		"alt='Processing Please Wait....' ></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Replenishment Lot#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+
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
		"				<input type='hidden' name='hdnActualBeginDate' value=" +
		getActualBeginDate + ">"+		
		"				<input type='hidden' name='hdnActualBeginTime' value='" +
		getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnitemtype' id='hdnitemtype' value=" +
		getitemType + ">"+
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" +
		getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnLineno' value=" + getLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnReplenItem' value='" + getReplenItem + "'>"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vBaseUnit + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" +
		vConversionRate + ">"+
		"				<input type='hidden' name='hdnvStockConversionRate' id='hdnvStockConversionRate' " +
		"value=" +getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnunitstype' id='hdnunitstype' " +
		"value=" +VUnitType + ">"+
		"				<input type='hidden' name='hdnstockunit' id='hdnstockunit' " +
		"value=" +blnItemUnit + ">"+
		"				<input type='hidden' name='hdnfromBin' id='hdnfromBin' value='" + frombin + "'>"+
		"				<input type='hidden' name='hdntoBin' id='hdntoBin' value=" + tobin + ">"+
		"				<input type='hidden' name='hdnavailQty' id='hdnavailQty' value=" +
		getItemAvailQty + ">"+
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

		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+	
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + 
		qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnbinavailqty' id = 'hdnbinavailqty' value="+getItemAvailQty+">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>";	 

		html = html +"<tr>"+
		"				<td align = 'left' class='labelmsg'>From Bin : <label>" + frombin +
		"			</tr>";
		nlapiLogExecution('ERROR', 'vUnits', vUnitsText);
		html = html +"<tr>"+
		"				<td align = 'left' class='labelmsg'>Replen Qty: <label>" + vreplenqty +
		" " +vUnitsText+"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(8)) +
		" " +vUnitsText+"</label>"+
		"			</tr>";
		html = html +"<tr>"+
		"				<td align = 'left' class='labelmsg'>Avail Qty: <label>" + parseFloat(parseFloat(getItemAvailQty).toFixed(8)) +
		" " +vUnitsText+"</label>"+
		"			</tr>";
		html = html +"			<tr>";

		html = html +"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#:";

		html = html +"				</td>"+
		"			</tr>"+
		"			<tr>";
		html = html +"				<td align = 'left'><input name='txtlot'  class='smalltextbox' " +
		" id='txtlot' type='text'/>";
		html = html +"				</td>";

		html = html +"			</tr><tr><td></td></tr></table>"+

		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' class='defaultlink'  " +
		" type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' " +
		"onclick='return validateForm();'/></td><td width='20px'></td><td>"+
		"			</tr></table>"; 

		html = html + 	" <tr ><td  ><table  class='uomstatus-gridgap' >";			
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

				if( ( ( (selectedUOM == null && vConversionRate == vUOM) || (selectedUOM == '' && vConversionRate == vUOM)  
						|| (selectedUOM =='null' && vConversionRate == vUOM) || (selectedUOM =='undefined'  && vConversionRate == vUOM )
						|| (selectedUOM == undefined && vConversionRate == vUOM) )|| (selectedUOM == vUOM)) &&(UOMText==blnItemUnit))
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

			html = html +"<td><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
			if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
			{

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


		var itemCount = 0;

		var binInternalId=nswms_GetBinInternalId(frombin,whLocation);
		var toBinId = nswms_GetBinInternalId(tobin,whLocation);
		var AllowAllLots = 'T';
		//Fetching bins with expiry date for lot items
		vBinDetails=fnGetPickBinDetailsLotWithExpiryDates(getItemInternalId,binInternalId,null,
				whLocation,null,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate,AllowAllLots);

		var w = 0;
		if(vBinDetails !=null && vBinDetails!='' && vBinDetails.length > 0)
		{
			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;' id='tblqtyUOM'>";
			html = html +	"			<tr class='uir-machine-headerrow' >";
			html = html +	"			<td>Lot#";	
			html = html +"				</td>"+
			"		<td class='align-right'>Qty"+	
			"				</td>";
			if(inventoryStatusFeature == true)
			{
				html = html +	"			<td></td>	<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}

			html = html +	"			<td>Expiry Date";	
			html = html +"				</td>";

			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';

			var convRate = 1;
			var selectedInvUOM = request.getParameter('custparam_uomprevselected');
			if(selectedInvUOM != null && selectedInvUOM != '' && selectedInvUOM !='null' && 
					selectedInvUOM !='undefined' && selectedInvUOM != undefined )
			{
				convRate = Big(getStockConversionRate).div(selectedInvUOM);
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
				var lotDetails = vBinDetails[b];
				var lotExpiry = '';

				txtBin = lotDetails[0];
				binAvailQty = lotDetails[1];
				binId = lotDetails[1];
				binLot = lotDetails[3];
				lotExpiry = lotDetails[4];
				var inventoryStatus = lotDetails[5];

				binAvailQty =Big(binAvailQty).mul(convRate);					

				if(binId == toBinId)
				{
					w = w+1;
					continue;
				}

				var linkLot = binLot;
				var linkQty = binAvailQty;
				var stockrate = getStockConversionRate;

				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td><a  " +
				"onclick='return DisplayBin(\""+linkLot+"\",\""+linkQty+"\");' href='#' >"+binLot;	
				html = html +"				</a></td>";
				html = html +"			<td class='align-right'>"+parseFloat(parseFloat(binAvailQty).toFixed(8));	
				html = html +"				</td>";
				if(inventoryStatusFeature == true)
				{
					html = html +	"			<td></td><td  class='status-cl-display'>"+inventoryStatus;	
					html = html +"				</td>";
				}

				html = html +"				<td align = 'right' class='labelmsg'>"+
				lotExpiry;	
				html = html +"				</td>";

				html = html +"			</tr>";

				if(parseInt(b)-parseInt(w) >=4)
					break;
			}

			html = html + 	"</td></tr></table>";


		}
		html = html + " </table>";
		html = html + " </form>"+
		"<script type='text/javascript'>document.getElementById('txtlot').focus();</script>";
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
		nlapiLogExecution('DEBUG', 'Processing RF', 'Validating Lot');
		var REArray = new Array();

		try
		{
			//Variable Declaration		
			var tempflag='F';
			var enterLot=request.getParameter('txtlot');
			var enterExpiryDate=request.getParameter('txtexpirydate');
			var shelflife=request.getParameter('hdshelflife');

			REArray['custparam_whlocation'] = request.getParameter('hdnWhLocation');
			REArray['custparam_whlocationname'] = request.getParameter('hdnWhLocationName');
			REArray['custparam_frombin'] = request.getParameter('txtbin');
			REArray['custparam_itemid'] = request.getParameter('hdnItemInternalId');
			REArray['custparam_item'] = request.getParameter('hdnReplenItem');
			REArray['custparam_rem_qty'] = request.getParameter('hdnItemRemQty');
			REArray['custparam_rec_qty'] = request.getParameter('hdnItemRecQty');
			REArray['custparam_itemtype'] = request.getParameter('hdnitemtype');
			REArray['custparam_uom'] = request.getParameter('hdnuom');
			REArray['custparam_conversionrate'] = request.getParameter('hdnvConversionRate');
			REArray['custparam_stockconversionrate'] = request.getParameter('hdnvStockConversionRate');
			REArray['custparam_tobin'] = request.getParameter('hdntoBin');
			REArray['custparam_frombin'] = request.getParameter('hdnfromBin');
			REArray['custparam_availqty'] = request.getParameter('hdnavailQty');
			REArray['custparam_lotno'] = request.getParameter('txtlot');
			REArray['custparam_itemgroup'] = request.getParameter('hdnvitemgroup');
			REArray['custparam_itemfamily'] = request.getParameter('hdnvitemfamily');
			REArray['custparam_replenminqty'] = request.getParameter('hdnvreplenminqty');
			REArray['custparam_replenmaxqty'] = request.getParameter('hdnvreplenmaxqty');
			REArray['custparam_replenqty'] = request.getParameter('hdnvreplenqty');
			REArray['custparam_replenroundqty'] = request.getParameter('hdnvreplenroundqty');
			REArray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
			REArray["custparam_totbinavailableqty"] = request.getParameter('hdnbinavailqty');
			REArray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');	
			REArray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

			var replenItem = request.getParameter('hdnReplenItem');
			var replenItemId = request.getParameter('hdnItemInternalId');
			var whLocation = request.getParameter('hdnWhLocation');
			var whLocationName = request.getParameter('hdnWhLocationName');
			var itemType = request.getParameter('hdnitemtype');
			var enterBin = request.getParameter('hdnfromBin');
			var optedEvent = request.getParameter('cmdPrevious');
			var stockConversionRate = request.getParameter('hdnvStockConversionRate');
			var unitsType = request.getParameter('hdnunitstype');
			var stockUnitText = request.getParameter('hdnstockunit');

			var str = 'replenItem.' + replenItem + '<br/>';
			str = str + 'replenItemId.' + replenItemId + '<br/>';
			str = str + 'whLocation.' + whLocation + '<br/>';
			str = str + 'whLocationName.' + whLocationName + '<br/>';
			str = str + 'itemType.' + itemType + '<br/>';
			str = str + 'enterBin.' + enterBin + '<br/>';
			str = str + 'optedEvent.' + optedEvent + '<br/>';
			str = str + 'enterLot.' + enterLot + '<br/>';
			str = str + 'enterExpiryDate.' + enterExpiryDate + '<br/>';
			str = str + 'stockConversionRate.' + stockConversionRate + '<br/>';
			str = str + 'unitsType.' + unitsType + '<br/>';
			str = str + 'stockUnitText.' + stockUnitText + '<br/>';

			nlapiLogExecution('ERROR', 'Parameters in Post',str);

			//Checking whether the Inventory Status feature is enabled or not.
			var inventoryStatusFeature = isInvStatusFeatureEnabled();
			nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

			var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');

			if(optedEvent != 'Back (F7)')
			{
				nlapiLogExecution('DEBUG', 'Inside if enterLot', enterLot);

				REArray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
				var isFromStatusChange = request.getParameter('hdnfromstatuschange');

				if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' 
					&& isFromStatusChange != undefined && isFromStatusChange=='T' )
				{
					REArray["custparam_error"] = '';
					REArray["custparam_uomprevselected"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_lotscan',
							'customdeploy_wmsse_replen_lotscan', false, REArray);
					return;

				}
				if(enterLot!=null && enterLot!="" && enterLot!='null')
				{
					var filterStrat = new Array();
					var binInternalId=nswms_GetBinInternalId(enterBin,whLocation);//To retrieve bin internalid
					if(inventoryStatusFeature == true)
					{
						var objBinDetails = [];
						var EntLotId='';
						var filterStrat = new Array();

						if(binInternalId != null && binInternalId != '')
							filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
						filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', replenItemId));
						filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', whLocation));
						filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', enterLot));

						var columnStrat=new Array();
						columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));

						var objBinDetails_item = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
						if(objBinDetails_item!=null && objBinDetails_item!='' && objBinDetails_item!='null' && 
								objBinDetails_item!='undefined' && objBinDetails_item!=undefined)
						{
							EntLotId=objBinDetails_item[0].getValue('inventorynumber','inventoryNumberBinOnHand');

							nlapiLogExecution('DEBUG', 'EntLotId', EntLotId);

							var result=nlapiLoadSearch('InventoryBalance', 'customsearch_wmsse_inventorybalance');

							if(replenItemId != null && replenItemId != '')
								result.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', replenItemId));
							if(binInternalId !=null && binInternalId!='')
								result.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
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

					}
					else
					{
						if(binInternalId != null && binInternalId != '')
						{
							filterStrat.push(new nlobjSearchFilter('binnumber',
									'inventoryNumberBinOnHand','anyof', binInternalId));
						}
						filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', replenItemId));
						filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						filterStrat.push(new nlobjSearchFilter('location',
								'inventoryNumberBinOnHand', 'anyof', whLocation));
						filterStrat.push(new nlobjSearchFilter('inventorynumber',
								'inventoryNumberBinOnHand', 'is', enterLot));

						var columnStrat=new Array();
						columnStrat.push(new nlobjSearchColumn('quantityavailable',
						'inventoryNumberBinOnHand'));
						columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
						columnStrat[0].setSort(true);

						var objBinDetails = new nlapiSearchRecord('item',
								'customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
					}

					if(objBinDetails!=null && objBinDetails!='')
					{
						if(objBinDetails.length>0)
						{
							//To retrieve WMS system rule value
							var systemRule_AllowExpiredItems=' ';
							systemRule_AllowExpiredItems = getSystemRuleValue(
									'Allow picking of expired items?',whLocation);								
							nlapiLogExecution("DEBUG","systemRule_AllowExpiredItems" ,
									systemRule_AllowExpiredItems);
							if(systemRule_AllowExpiredItems == 'N' || 
									systemRule_AllowExpiredItems == '')
							{
								var filtersExp = new Array();
								if (replenItemId != null && replenItemId != "")
								{
									filtersExp.push(new nlobjSearchFilter(
											'internalid', null, 'anyof', replenItemId));		 
								}
								if(whLocation != null && whLocation != '' && whLocation != 'null')
								{
									filtersExp.push(new nlobjSearchFilter(
											'location', 'inventorynumber', 'anyof', whLocation));
								}

								filtersExp.push(new nlobjSearchFilter(
										'inventorynumber','inventorynumber', 'is', enterLot));
								filtersExp.push(new nlobjSearchFilter('formuladate',null,
										'onorafter',DateStamp()).setFormula(
												"NVL({inventorynumber.expirationdate}," +
										"TO_DATE('2199/01/01','YYYY/MM/DD'))"));

								var columnsExp = new Array(); 
								var searchresultsExp = nlapiSearchRecord('item',
										'customsearch_wmsse_expdate_lots', filtersExp, columnsExp);

								if(searchresultsExp == null || searchresultsExp == '' )
								{
									REArray["custparam_error"] = 'Expiry date for the' +
									'given lot is less than current date';
									response.sendRedirect('SUITELET', 'customscript_wmsse_replen_lotscan',
											'customdeploy_wmsse_replen_lotscan', false, REArray);
									return;
								}
							}

							var vOpenPickDetails=getOPenTaskPickBinDetailsLot(replenItemId,binInternalId,
									whLocation,unitsType,stockUnitText);//To retrieve bin details for lot items
							var vBinOpenLotArr="";
							if(vOpenPickDetails!=null && vOpenPickDetails !='' &&
									vOpenPickDetails.length >0)
							{
								vBinOpenLotArr = vOpenPickDetails[3];
							}

							var availableQty=0;var vinventoryNumberBinOnHand='';
							var vmakeInvAvailFlag = "T";
							var fields = ['makeinventoryavailable'];
							var vLocDetails= nlapiLookupField('location',whLocation,fields);
							vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;

							for(var k=0;k<objBinDetails.length;k++)
							{
								var vInvLot=objBinDetails[k].getText('inventorynumber',
								'inventoryNumberBinOnHand');
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
								if(vOpenPickQty == null || vOpenPickQty == '' ||
										vOpenPickQty =='null' || vOpenPickQty == '- None -')
									vOpenPickQty =0;
								nlapiLogExecution('DEBUG', 'vOpenPickQty',vOpenPickQty);
								var vBinQtyAvail='';
								if(inventoryStatusFeature == true)
								{									
									if(vmakeInvAvailFlag == "T")
										vBinQtyAvail=objBinDetails[k].getValue('available', null, 'sum');
									else
										vBinQtyAvail=objBinDetails[k].getValue('onhand', null, 'sum');
								}
								else
								{
									if(vmakeInvAvailFlag == "T")
									{
										vBinQtyAvail=objBinDetails[k].getValue(
												'quantityavailable','inventoryNumberBinOnHand');
									}
									else
									{
										vBinQtyAvail=objBinDetails[k].getValue(
												'quantityonhand','inventoryNumberBinOnHand');
									}
								}
								nlapiLogExecution('DEBUG', 'vBinQtyAvail',vBinQtyAvail);
								vBinQtyAvail = Big(vBinQtyAvail).minus(vOpenPickQty);
								availableQty=Big(availableQty).plus(vBinQtyAvail);

								if(inventoryStatusFeature == true)
								{
									vinventoryNumberBinOnHand=objBinDetails[k].getText('inventorynumber',null,'group');
								}
								else
								{
									vinventoryNumberBinOnHand=objBinDetails[0].getText('inventorynumber','inventoryNumberBinOnHand');
								}

							}

							nlapiLogExecution('DEBUG', 'availableQty', availableQty);
							nlapiLogExecution('DEBUG', 'stockConversionRate', stockConversionRate);
							if(Number(Big(availableQty).mul(stockConversionRate))<=0  ||
									(enterLot != vinventoryNumberBinOnHand))
							{
								REArray["custparam_error"] = 'Insufficient inventory for this lot#: '+
								enterLot;
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_lotscan',
										'customdeploy_wmsse_replen_lotscan', false, REArray);
								return;
							}
							else
							{
								REArray["custparam_totavailableqty"] =Number(availableQty);

								REArray["custparam_availqty"] =Number(availableQty);

							}
						}
						else
						{
							objBinDetails='';
						}
					}
					if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' ||
							objBinDetails =='undefined' ||objBinDetails.length < 1)
					{
						REArray["custparam_error"] = 'Please enter/scan valid lot#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_lotscan',
								'customdeploy_wmsse_replen_lotscan', false, REArray);
						return;
					}
					objBinDetails=null;
					columnStrat=null;
					filterStrat=null;
					REArray["custparam_lotno"] = enterLot;

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
						if(EntLotId!= null && EntLotId!= '')
							invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', EntLotId));

						//No need to use Load Search here as this search will not return more than 1K records.
						objBinStatusDetails = new nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);

						var selectedStatus='';
						var selectedStatusName='';

						if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && 
								objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined && objBinStatusDetails.length > 0)
						{
							REArray["custparam_enteredBinID"]=binInternalId;
							REArray["custparam_enteredbin"]=enterBin;
							REArray["custparam_enteredlotid"]=EntLotId;

							if(objBinStatusDetails.length > 1)
							{
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_statusscan', 
										'customdeploy_wmsse_replen_statusscan', false, REArray);
								return;  
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

					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan',
							'customdeploy_wmsse_replen_qtyscan', false, REArray);
					return;

				}
				else
				{
					REArray["custparam_error"] = 'Please enter/scan valid lot#';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_lotscan',
							'customdeploy_wmsse_replen_lotscan', false, REArray);
					return;
				}
			}
			else 
			{
				REArray["custparam_error"] = '';
				REArray["custparam_lotno"] = '';
				response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan',
						'customdeploy_wmsse_replen_binscan', false, REArray);
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
			nlapiLogExecution('ERROR', 'Exception inside Post method', errMsg); 	

			response.sendRedirect('SUITELET', 'customscript_wmsse_replen_lotscan',
					'customdeploy_wmsse_replen_lotscan', false, REArray);
			return;
		}
	}
}


/**
 * This function is to calculate stock conversion rate
 * 
 **/
function getStockRatefun(VUnitType,blnItemUnit) {

	var uomfilters=new Array();		
	uomfilters[0]=new nlobjSearchFilter("internalid",null,"anyof",VUnitType);
	uomfilters[1]=new nlobjSearchFilter("unitname",null,"is",blnItemUnit); 
	var uomcolumns=new Array();
	uomcolumns[0]=new nlobjSearchColumn("conversionrate"); 
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