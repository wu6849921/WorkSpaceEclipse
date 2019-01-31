
/**
 * Main function 
 * 
 * This script will be used to select an item status during replenishment, if a bin is having multi status inventory for an item/lot.
 * 
 
 */
/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function StatusScan(request, response)
{
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
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
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getItemAvailQty = request.getParameter('custparam_availqty');
		//getItemAvailQty = parseFloat(parseFloat(getItemAvailQty).toFixed(5));
		var frombin = request.getParameter("custparam_frombin");
		var availableqtyDetail=request.getParameter('custparam_availableqtyDetail');
		var tobin = request.getParameter("custparam_tobin");
		var getLot = request.getParameter('custparam_lotno');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var vUnits = request.getParameter("custparam_uom"); 
		var binInternalId=request.getParameter("custparam_enteredBinID"); 
		var enteredLot = request.getParameter("custparam_enteredlotid");
		var lotavailqty = request.getParameter('custparam_totavailableqty');
		var binavailqty = request.getParameter('custparam_totbinavailableqty');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}


		if(vUnits ==null || vUnits =='' || vUnits =='null' || vUnits =='undefined' ||
				vUnits =='- None -')
		{
			vUnits = '';
		}

		var vConversionRate = request.getParameter("custparam_conversionrate");
		var strvUnits = "";
		var headerVar='Replenishment';
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+headerVar;
		var getPreferBin='';

		var stockUnit = '';
		var unitsType = '';

		var itemfilters=new Array();
		if(getItemInternalId != null && getItemInternalId !='')
		{
			itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		}
		if(whLocation != null && whLocation !='' && whLocation != 'null')
		{
			itemfilters.push(new nlobjSearchFilter(
					'location',null,'anyof',['@NONE@',whLocation]));
			itemfilters.push(new nlobjSearchFilter('location','binnumber','anyof',whLocation));
		}

		//No need to use Load Search here as this search returns only one record.
		var itemresults= nlapiSearchRecord(
				'item', 'customsearch_wmsse_rpln_item_srh', itemfilters, null);

		if(itemresults != null && itemresults != '' && itemresults != 'null' && 
				itemresults.length>0)
		{
			stockUnit = itemresults[0].getText('stockunit');
			unitsType = itemresults[0].getValue('unitstype');

			if(itemresults[0].getValue('preferredbin') == "T" && 
					itemresults[0].getValue('location','binnumber') == whLocation)
			{
				var internalid = itemresults[0].getId();
				getPreferBin = itemresults[0].getValue('binnumber');
				if(tobin != getPreferBin)
				{
					tobin = getPreferBin;
				}
			}
		}

		var getStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
		var uomresults= new Array();
		var addbtnimgUrl='';
		var delbtnimgUrl='';
		if(unitsType != null && unitsType != '')
		{	
			var vBaseUOMSearch=getBaseUnitRate(unitsType);

			vBaseUnit='Base unit';
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
				vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
			}	

			if(stockUnit !=null && stockUnit!='' && stockUnit !='null' &&
					stockUnit !='undefined' && stockUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(unitsType,stockUnit,vConversionRate);
			}
		}

		var vUnitsText="";
		if(stockUnit != "" && stockUnit != null && stockUnit != "null")
			vUnitsText = 'In '+ stockUnit;

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
			if((errMsg == "Please configure stage locations" ||
					errMsg == "This item has mixflag false, please configure new bin locations" || 
					errMsg =="Please configure bin locations" ||
					errMsg =="Please configure put strategies and bin locations"))
			{
				errMsg = '';
			}
		}

		var invfilterStrat =  new Array();
		if(whLocation != null && whLocation != '')
			invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
		if(getItemInternalId != null && getItemInternalId != '')
			invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', getItemInternalId));
		if(binInternalId!= null && binInternalId!= '')
			invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
		if(enteredLot != null && enteredLot != '')
			invfilterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'is', enteredLot));

		var searchName = 'customsearch_wmsse_invtbalance_invt_item';
		if(getitemType == "inventoryitem" || getitemType == "assemblyitem")
		{
			searchName = 'customsearch_wmsse_invtbalance_invt_item';
		}
		else if(getitemType == "serializedinventoryitem" || getitemType=="serializedassemblyitem") 
		{
			searchName = 'customsearch_wmsse_invtbalance_serialsrh';
		}
		else if(getitemType == "lotnumberedinventoryitem" || getitemType=="lotnumberedassemblyitem") 
		{
			searchName = 'customsearch_wmsse_inventorybalance';
		}

		//No need to use Load Search here as this search will not return more than 1K records.
		var vStatusDetails = new nlapiSearchRecord('InventoryBalance',searchName,invfilterStrat, null);

		var vStatusDetailsArr =  new Array();
		var eneteredLotTxt = '';		
		var vOpenPickDetails ="";

		if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != 'undefined'
			&& vStatusDetails != undefined && vStatusDetails.length != null && vStatusDetails.length >0)
		{
			if(getitemType == "lotnumberedinventoryitem" || getitemType=="lotnumberedassemblyitem")
				vOpenPickDetails = getOPenTaskPickBinDetailsLot(getItemInternalId,binInternalId,whLocation,unitsType,stockUnit);
			else
				vOpenPickDetails = getOPenTaskPickBinDetails(getItemInternalId,binInternalId,whLocation,unitsType,stockUnit,'','');

			if((getitemType == "serializedinventoryitem" || getitemType=="serializedassemblyitem" || getitemType == "lotnumberedinventoryitem" || 
					getitemType=="lotnumberedassemblyitem"))
			{

				eneteredLotTxt = vStatusDetails[0].getText('inventorynumber',null,'group');

				var statusArr = new Array();

				for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
				{
					var status = vStatusDetails[statusItr].getText('status',null,'group');
					var vBinQtyAvail=vStatusDetails[statusItr].getValue('available',null,'sum');
					var statusId = vStatusDetails[statusItr].getValue('status',null,'group');
					var vlotexpirydate = vStatusDetails[statusItr].getValue('expirationdate','inventorynumber','group');

					var openPickQty = 0;
					if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
					{						
						var	vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
						var	vOpenPickQtyArr = vOpenPickDetails[1];
						var	vBinLotArr = vOpenPickDetails[3];
						var	vBinStatusArr = vOpenPickDetails[5];

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

					vBinQtyAvail = Number(Big(vBinQtyAvail).minus(openPickQty));
					if(parseFloat(vBinQtyAvail) > 0)
					{
						if(statusArr.indexOf(statusId)==-1)
						{
							var currRow = [status,vBinQtyAvail,statusId,vlotexpirydate];
							statusArr.push(statusId);
							vStatusDetailsArr.push(currRow);
						}
						else
						{
							var indx = statusArr.indexOf(statusId);
							var Row = vStatusDetailsArr[indx];
							var qty = Row[1];
							var totalQty = Big(qty).plus(vBinQtyAvail);
							var currRow = [status,totalQty,statusId,vlotexpirydate];
							vStatusDetailsArr[indx]=currRow;
						}
					}
				}

			}
			else
			{
				for(var statusItr=0;statusItr<vStatusDetails.length;statusItr++)
				{
					var status = vStatusDetails[statusItr].getText('status');
					var vBinQtyAvail=vStatusDetails[statusItr].getValue('available');
					var statusId = vStatusDetails[statusItr].getValue('status');

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

					vBinQtyAvail = Big(vBinQtyAvail).minus(openPickQty);
					if(parseFloat(vBinQtyAvail) > 0)
					{
						var currRow = [status,vBinQtyAvail,statusId];
						vStatusDetailsArr.push(currRow);
					}
				}
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

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		var JSSurl ='';
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
		}

		var functionkeyHtml=getFunctionkeyScriptSE('_rf_replen_statusscan'); 

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

		html = html + "<script type='text/javascript'>function validate_selectedStatus(statusId,statusName){" +
		"	document.getElementById('hdnenetedstatus').value = statusId;document.getElementById('hdnenetedstatusname').value = statusName;"+
		" document.forms['_rf_replen_statusscan'].submit();" +
		"document.getElementById('loading').style.display = 'block'; return true;}</script>";

		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){" +
		"window.history.forward();}" +
		"setTimeout('preventBack()', 0);window.onunload=function(){null};</script>" ;

		//Refresh Functionality starts
		html = html + "<SCRIPT LANGUAGE='javascript' for='window' EVENT='onload()'>"; 
		html = html + "var version = navigator.appVersion;";
		html = html + "document.onkeydown = function (e) {";
		html = html + "var keycode = (window.event) ? event.keyCode : e.keyCode;"; 
		html = html + "if ((version.indexOf('MSIE') != -1)) { ";
		html = html + "	if (keycode == 116) {event.keyCode = 0;event.returnValue = false;return false;}}"; 
		html = html + "else {if (keycode == 116)return false;}";
		html = html + "};";
		html = html + "</script>";
		//Refresh Functionality ends

		html = html + "</head><body  onkeydown='return OnKeyDown_CL();' >";
		html = html +"	<form name='_rf_replen_statusscan' method='POST'><input name='cmdSend1' class='defaultlink' " +
		"  type='submit' value='' onclick='return validateForm_replen();'/>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage'" +
		"alt='Processing Please Wait....' ></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Replenishment Inventory Status</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error' style='color:red;display:block;' >"+
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
		"				<input type='hidden' name='hdnLot' value='" + getLot + "'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnLineno' value=" + getLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnReplenItem' value='" + getReplenItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" +
		getPreferBin + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + stockUnit + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" +
		vConversionRate + ">"+
		"				<input type='hidden' name='hdnvStockConversionRate' id='hdnvStockConversionRate' " +
		"value=" +getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnfromBin' id='hdnfromBin' value='" + frombin + "'>"+
		"				<input type='hidden' name='hdntoBin' id='hdntoBin' value=" + tobin + ">"+
		"				<input type='hidden' name='hdnavailQty' id='hdnavailQty' value=" +
		getItemAvailQty + ">"+
		"				<input type='hidden' name='hdnlotNo' id='hdnlotNo' value=" + getLot + ">"+
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
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+	
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+	
		"				<input type='hidden' name='hdnenetedstatus' id='hdnenetedstatus'>"+
		"				<input type='hidden' name='hdnenetedstatusname' id='hdnenetedstatusname'>"+
		"				<input type='hidden' name='hdnenteredbinid' value=" + binInternalId + ">"+
		"				<input type='hidden' name='hdnlotavailqty' id = 'hdnlotavailqty' value="+lotavailqty+">"+
		"				<input type='hidden' name='hdnavailableqtyDetail' id='hdnavailableqtyDetail' value=" + availableqtyDetail + ">"+
		"				<input type='hidden' name='hdnlotid' value=" + enteredLot + ">"+
		"				<input type='hidden' name='hdnbinavailqty' id = 'hdnbinavailqty' value="+binavailqty+">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>";	 

		html = html +"<tr>"+
		"				<td align = 'left' class='labelmsg'>From Bin : <label>" + frombin +
		"			</tr>";
		if(getitemType == "lotnumberedinventoryitem" || getitemType == "lotnumberedassemblyitem")
		{
			html = html +"<tr>"+
			"				<td align = 'left' class='labelmsg'>LOT#: <label>" + getLot +
			"			</tr>";
		}

		html = html +"<tr>"+
		"				<td align = 'left' class='labelmsg'>Avail Qty: <label>" + parseFloat(parseFloat(getItemAvailQty).toFixed(8)) +
		" " +vUnitsText+"</label>"+
		"			</tr>";
		html = html +"			<tr><td></td></tr></table>";
		var errorMsgValue='';
		if(vStatusDetailsArr !=null && vStatusDetailsArr!='' && vStatusDetailsArr.length > 0)
		{
			html = html + 	" <tr><td></td></tr><tr><td></td></tr><tr ><td  ><table  style='border-spacing: 0;' id='tblqtyUOM'>";	

			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td   class='status-rw-display'>Inv Status"+	
			"				</td>"+
			"				<td></td><td class='align-right'>Qty"+	
			"				</td>";	
			if(getitemType == 'lotnumberedinventoryitem' || getitemType == 'lotnumberedassemblyitem' )
			{
				html = html +"				<td></td><td>Expiry Date"+	
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
				var vStatusName = currValues[0];
				var eneteredLotExpdate = currValues[3];

				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td  class='status-cl-display'>";
				html = html +"				<a  onclick='return validate_selectedStatus(\""+vStatusId+"\",\""+vStatusName+"\");' href='#' >"+vStatus;	
				html = html +"				</a></td>";
				html = html +"				<td align = 'right' >";	
				html = html +"			</td>";
				html = html +"				<td class='align-right'>"+vQty;
				html = html +"				</td>";
				if(getitemType == 'lotnumberedinventoryitem' || getitemType == 'lotnumberedassemblyitem' )
				{
				html = html +"				<td></td>";
				
					if(eneteredLotExpdate ==null || eneteredLotExpdate =='' || eneteredLotExpdate =='null'|| eneteredLotExpdate == 'undefined' ||
							eneteredLotExpdate == undefined)
						eneteredLotExpdate="";
					html = html +"				<td>"+eneteredLotExpdate;
					html = html +"				</td>";		

				}

				html = html +"			</tr>";

			}
			html = html + 	"</table></td></tr>";
		}

		html = html +"	<table><tr>"+
		"				<td align = 'left'></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'></td><td width='20px'></td><td>"+
		"			</tr></table>"; 

		html = html + " </form>";		
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
		nlapiLogExecution('DEBUG', 'Processing RF', 'Validating Inventory Status');
		var REArray = new Array();

		try
		{			
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
			REArray['custparam_lotno'] = request.getParameter('hdnLot');
			REArray['custparam_itemgroup'] = request.getParameter('hdnvitemgroup');
			REArray['custparam_itemfamily'] = request.getParameter('hdnvitemfamily');
			REArray['custparam_replenminqty'] = request.getParameter('hdnvreplenminqty');
			REArray['custparam_replenmaxqty'] = request.getParameter('hdnvreplenmaxqty');
			REArray['custparam_replenqty'] = request.getParameter('hdnvreplenqty');
			REArray['custparam_replenroundqty'] = request.getParameter('hdnvreplenroundqty');
			REArray["custparam_enteredBinID"]=request.getParameter('hdnenteredbinid');
			REArray["custparam_enteredlotid"]=request.getParameter('hdnlotid');
			REArray["custparam_enteredstatus"] = request.getParameter('hdnenetedstatus');
			REArray["custparam_invtstatusName"] = request.getParameter('hdnenetedstatusname');
			REArray["custparam_availableqtyDetail"] = request.getParameter('hdnavailableqtyDetail');
			REArray["custparam_totavailableqty"] = request.getParameter('hdnlotavailqty');
			REArray["custparam_totbinavailableqty"] = request.getParameter('hdnbinavailqty');
			REArray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
			REArray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

			var vreplenqty = request.getParameter('hdnvreplenqty');
			var vreplenroundqty = request.getParameter('hdnvreplenroundqty');
			var replenItem = request.getParameter('hdnReplenItem');
			var replenItemId = request.getParameter('hdnItemInternalId');
			var whLocation = request.getParameter('hdnWhLocation');
			var whLocationName = request.getParameter('hdnWhLocationName');
			var itemType = request.getParameter('hdnitemtype');
			var fromBin =request.getParameter('hdnfromBin');
			var lotno = request.getParameter('hdnLot');
			var actQty = request.getParameter('hdnItemRecQty');
			var rQty = request.getParameter('hdnItemRemQty');
			var availQty = request.getParameter('hdnavailQty');
			var vUnits = request.getParameter('hdnuom');
			var stockConversionRate = request.getParameter('hdnvStockConversionRate');
			var enteredStatus = request.getParameter('hdnenetedstatus');
			var enteredStatusName = request.getParameter('hdnenetedstatusname');
			var enteredbinid = request.getParameter('hdnenteredbinid');
			var enteredlotid = request.getParameter('hdnlotid');

			var optedEvent = request.getParameter('cmdPrevious');	

			if(optedEvent != 'Back (F7)')
			{
				if(enteredStatus!=null && enteredStatus!="" && enteredStatus!='null' )
				{
					var invstatusid='';
					var invstatusname ='';
					var filterPrefInv = new Array();

					if(replenItemId != null && replenItemId != '')
						filterPrefInv.push(new nlobjSearchFilter('internalid','item','anyof', replenItemId));
					if(whLocation!= null && whLocation!= '')
						filterPrefInv.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
					if(enteredStatus != null && enteredStatus != '')
						filterPrefInv.push(new nlobjSearchFilter('status',null, 'anyof', enteredStatus));
					if(enteredbinid != null && enteredbinid != '')
						filterPrefInv.push(new nlobjSearchFilter('binnumber',null, 'anyof', enteredbinid));
					if(enteredlotid != null && enteredlotid != '' && enteredlotid != 'null')
						filterPrefInv.push(new nlobjSearchFilter('inventorynumber',null, 'anyof', enteredlotid));

					//No need to use Load Search here as this search will not return more than 1K records.
					var objBinDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterPrefInv, null);
					if(objBinDetails != null && objBinDetails != '')
					{
						if(objBinDetails.length != null)
						{
							var tavailableQty=0;
							for(var aVailQty=0;aVailQty<objBinDetails.length;aVailQty++)
							{
								tavailableQty=Big(tavailableQty).plus(objBinDetails[aVailQty].getValue('available',null,'sum'));
							}
							invstatusid = objBinDetails[0].getValue('status',null,'group');
							invstatusname = objBinDetails[0].getText('status',null,'group');


							REArray["custparam_availqty"] = Number(tavailableQty);
							nlapiLogExecution('ERROR', 'tavailableQty', tavailableQty);
						}
						else
						{
							objBinDetails='';
						}
					}

					REArray["custparam_statusflag"] = 'T';
					REArray["custparam_enteredstatus"] = enteredStatus;
					REArray["custparam_invtstatusName"] = enteredStatusName;
					nlapiLogExecution('ERROR', 'enteredStatus', enteredStatus);

					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan', 
							'customdeploy_wmsse_replen_qtyscan', false, REArray);
					return; 				

				} 
				else
				{
					REArray["custparam_error"] = 'Please select status';				
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_statusscan',
							'customdeploy_wmsse_replen_statusscan', false, REArray);
					return;
				}
			}
			else 
			{
				if(itemType == 'lotnumberedinventoryitem' || itemType == 'lotnumberedassemblyitem' )
				{		
					REArray["custparam_statusflag"] ='T';	
					REArray["custparam_error"] = '';
					REArray['custparam_availqty'] = REArray["custparam_totbinavailableqty"];
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_lotscan', 
							'customdeploy_wmsse_replen_lotscan', false, REArray);
					return;
				}
				else
				{
					REArray["custparam_error"] = '';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_binscan', 
							'customdeploy_wmsse_replen_binscan', false, REArray);
					return;
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
			nlapiLogExecution('ERROR', 'Exception inside Post method', errMsg); 	

			response.sendRedirect('SUITELET', 'customscript_wmsse_replen_statusscan',
					'customdeploy_wmsse_replen_statusscan', false, REArray);
			return;
		}
	} 
} 

