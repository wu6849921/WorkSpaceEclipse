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
function CheckInQty(request, response)
{
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');		
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Checking whether the Inventory Status feature is enabled or not
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

		//Variable Declaration
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
		var tobin = request.getParameter("custparam_tobin");
		var getLot = request.getParameter('custparam_lotno');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var vUnits = request.getParameter("custparam_uom"); 
		var invtstatus = request.getParameter('custparam_enteredstatus');
		var invtstatusName = request.getParameter('custparam_invtstatusName');
		var statusScreenflag = request.getParameter('custparam_statusflag');
		var enteredlot = request.getParameter('custparam_enteredlotid');
		var enteredBinId = request.getParameter('custparam_enteredBinID');
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
		var results='';
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

			results= getUnitsType(unitsType);
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
				}

				var imgfilefound2 =  getLoadFile('minus.png');
				if(imgfilefound2)
				{
					delbtnimgUrl = imgfilefound2.getURL();
				}

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

		html = html +"	<script type='text/javascript'>function validateForm_replen() {" +
		"var enteredQty =0;var scannedqty='';var reWhiteSpace ='';var uomTbl = document.getElementById('tblUOM');" +
		"var ConvertQty=document.getElementById('hdnvStockConversionRate').value;var selecteduomqtyArr = new Array(); " +
		"var itemtype=document.getElementById('hdnitemtype').value;" +
		"if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){var rowcount = uomTbl.rows.length;" +
		"for(var r=0;r<rowcount;r++){var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;reWhiteSpace = qty.indexOf(' ') >= 0;if(qty==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter qty';" +
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}" +
		"else {if(isNaN(qty) || parseFloat(qty)<=0 || (reWhiteSpace == true)){document.getElementById('div_error').innerHTML ='Please enter valid qty';" +
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}" +
		"var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;" +
		"if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';" +
		"document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].focus();return false;}" +
		"var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr);enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom));if(document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value <= 0.000000005 ){" +
		"document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';" +
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}}" +
		"document.getElementById('hdnselecteduomswithqty').value=selecteduomqtyArr; scannedqty=parseFloat(enteredQty)/parseFloat(ConvertQty);}" +
		"else{enteredQty = document.getElementById('txtqty').value; scannedqty=enteredQty;reWhiteSpace = scannedqty.indexOf(' ') >= 0;if(document.getElementById('txtqty').value <= 0.000000005 ){document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';document.getElementById('txtqty').focus();return false;}}if(enteredQty == ''){document.getElementById('div_error').innerHTML ='Please enter qty';return false;}else{" +
		"var remainingqty=document.getElementById('hdnItemRemQty').value;remainingqty = remainingqty;" +
		"var availqty=document.getElementById('hdnavailQty').value;var replenqty=document.getElementById('hdnvreplenqty').value;" +
		"if((isNaN(scannedqty) || parseFloat(scannedqty)<=0) || (reWhiteSpace == true) ){document.getElementById('div_error').innerHTML ='Please enter valid qty';return false;}" +
		"if((parseFloat(scannedqty)>parseFloat(remainingqty))){document.getElementById('div_error').innerHTML ='Overage replenishment is not allowed'; return false;}" +
		"if((parseFloat(scannedqty)>parseFloat(replenqty))){document.getElementById('div_error').innerHTML ='Entered Quantity can not exceed Replen Quantity'; return false;}" +
		"if((parseFloat(scannedqty)>parseFloat(availqty))){document.getElementById('div_error').innerHTML ='Insufficeint Quantity in Bulk location';return false;}" +
		"if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){	if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){" +
		"	if(parseFloat(document.getElementById('txtqty').value) >= 0.000001)" +
		"	{" +
		"		var conversionQty=(document.getElementById('txtqty').value)*(ConvertQty);" +
		"		if(conversionQty.toString().indexOf('.') != -1){" +
		"			document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';" +
		"			return false;" +
		"		}" +
		"	}" +
		"	else{if(document.getElementById('txtqty').value.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}document.getElementById('txtqty').focus();" +
		"}else{var rowcount1 = uomTbl.rows.length;var rowInd = parseInt(rowcount1)-1;if(parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value) >= 0.000001){var conversionQty=parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value)*(ConvertQty);if(conversionQty.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}" +
		"	else{if(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}	document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();}}" +
		"if(document.getElementById('txtbin').value == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan bin location';" +
		" document.getElementById('txtbin').focus();return false;}" +
		"else if(document.getElementById('txtbin').value != " +
		"document.getElementById('hdnPreferBin').value){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan valid bin location';" +
		" document.getElementById('txtbin').focus();return false;}" +
		" else{document.getElementById('hdntotaluomqtyentered').value = scannedqty;  var sessionObj = document.getElementById('hdnsession').value;" +
		"if(sessionObj != '' && sessionObj != null){" +
		"document.getElementById('div_error').innerHTML ='Transcation is in progress...';" +
		"return false;}else{document.getElementById('hdnsession').value = 'session';" +
		"document.forms['_rf_checkin_item'].submit();" +
		"document.getElementById('loading').style.display = '';" +
		"document.forms['_rf_checkin_item'].cmdSend.disabled=true;" +
		"document.forms['_rf_checkin_item'].cmdPrevious.disabled=true;" +
		"return true;}}}}</script>" ;

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
		html = html +"	<form name='_rf_checkin_item' method='POST'><input name='cmdSend1' class='defaultlink' " +
		"  type='submit' value='' onclick='return validateForm_replen();'/>"+ 

		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage'" +
		"alt='Processing Please Wait....' ></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Replenishment Quantity</td></tr>"+
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
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value='" +
		getPreferBin + "'>"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + stockUnit + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" +
		vConversionRate + ">"+
		"				<input type='hidden' name='hdnvStockConversionRate' id='hdnvStockConversionRate' " +
		"value=" +getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnfromBin' id='hdnfromBin' value='" + frombin + "'>"+
		"				<input type='hidden' name='hdntoBin' id='hdntoBin' value='" + tobin + "'>"+
		"				<input type='hidden' name='hdnavailQty' id='hdnavailQty' value=" +
		getItemAvailQty + ">"+
		"				<input type='hidden' name='hdnlotNo' id='hdnlotNo' value='" + getLot + "'>"+
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
		"				<input type='hidden' name='hdninvtstatus' id='hdninvtstatus' value=" + invtstatus + ">"+
		"				<input type='hidden' name='hdninvtstatusName' id='hdninvtstatusName' value='" + invtstatusName + "'>"+
		"				<input type='hidden' name='hdnstatusScreen' id='hdnstatusScreen' value='" + statusScreenflag + "'>"+	
		"				<input type='hidden' name='hdnEntbinId' id='hdnEntbinId' value='" + enteredBinId + "'>"+
		"				<input type='hidden' name='hdnlotid' value=" + enteredlot + ">"+
		"				<input type='hidden' name='hdntostatustext' id = 'hdntostatustext'>"+
		"				<input type='hidden' name='hdnlotavailqty' id = 'hdnlotavailqty' value="+lotavailqty+">"+
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
		"				<td align = 'left' class='labelmsg'>Replen Qty: <label>" + parseFloat(parseFloat(vreplenqty).toFixed(8)) + 
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

			var finalUomQty = vreplenqty;
			if(parseFloat(vreplenqty) > parseFloat(getItemRemQty))
			{
				finalUomQty = parseFloat(parseFloat(getItemRemQty).toFixed(8));

			}

			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				html = html +"<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox'  id='txtqty0' type='text'/></td><td></td>";

				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					if(Cnt==0)
					{
						html = html +"<td><select id='uomlist"+Cnt+"' class='labelmsg'  name = 'uomlist"+Cnt+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";

					}
					if(stockUnit !=null && stockUnit !='' && stockUnit!='null' && stockUnit !='undefined' && 
							stockUnit !='- None -' && stockUnit == UOMText)
					{
						html = html +" <option value="+vQty+" selected >"+UOMText +" </option>";
					}
					else
					{
						html = html +" <option value="+vQty+"  >"+UOMText +" </option>";
					}

				}

				html = html +"</select></td><td></td>";
				html = html +"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' "+
				" style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' "+
				" onclick='return validateaddUom(\""+finalUomQty+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' "+
				" alt='Add Uom'> " +
				" </td></tr></table>";				
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

					html = html +"<tr><td align = 'left'>";

					html = html +" <input name='txtqty"+u+"'  class='smalltextbox'  id='txtqty"+u+"' type='text' value="+qty+"></input></td><td></td>";

					html = html +"<td><select id='uomlist"+u+"' class='labelmsg'  name = 'uomlist"+u+"'>  ";
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
						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"'";
						html= html+" style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;'";
						html= html+" onclick='return validateaddUom(\""+finalUomQty+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'>";
						html= html+" </td></tr>";
					}
					else
					{
						html= html+"<td><input type='image' id='imgplus0' src='"+delbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;'";
						html= html+" onclick='return deleteUom(this,\""+uomresults+"\");' alt='Add Uom'></td></tr>";
					}

				}
				html = html +"			</td></tr></table>";
			}

		}
		else
		{
			if(vUnitsText !=null && vUnitsText !='' && vUnitsText!='null' && vUnitsText !='undefined' 
				&& vUnitsText !='- None -')
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty "+ vUnitsText;
			}
			else
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty:";
			}

			html = html +"				</td>"+

			"			</tr>";

			html = html +"				<tr><td align = 'left'><input name='txtqty'  class='smalltextbox' id='txtqty' type='text'/></td></tr>";			


		}

		html = html +"<tr>"+
		"				<td align = 'left' class='labelmsg'>To Bin : <label>" + tobin +
		"			</tr>";
		html = html +"			<tr>";
		html = html +"				<td align = 'left' class='labelmsg'>Confirm To Bin:";

		html = html +"				</td>"+
		"			</tr>"+
		"			<tr>";
		html = html +"				<td align = 'left'><input name='txtbin'  class='smalltextbox' " +
		" id='txtbin' type='text'/>";
		html = html +"				</td>";

		html = html +"			</tr>";

		html = html+"			</table>";

		html=html+"<table><tr>"+
		"				<td align = 'left'></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)'" +
		" onclick='return validateForm_replen();'/></td><td width='20px'></td><td>"+
		"			</tr></table>"; 

		html = html + " </form>";
		if(results ==null ||  results =='' || results == 'null')
		{
			html = html + "<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
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
		var REArray = new Array();
		nlapiLogExecution('DEBUG', 'Processing RF', 'Validating QTY/TO BIN');

		try
		{
			//Variable Declaration
			var enterQty = request.getParameter('txtqty');
			if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
			{
				enterQty = request.getParameter('hdntotaluomqtyentered');
				REArray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');

				/*	if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined')
				{
					enterQty = parseFloat(enterQty).toFixed(5);

				}*/
			}
			var toBin = request.getParameter('txtbin');

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
			REArray["custparam_enteredlotid"] = request.getParameter('hdnlotid');
			REArray["custparam_enteredBinID"] = request.getParameter('hdnEntbinId');		
			REArray["custparam_statusflag"] = request.getParameter('hdnstatusScreen');	
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
			var invtstatus=request.getParameter('hdninvtstatus');
			var invtstatusName=request.getParameter('hdninvtstatusName');
			var toStatus=request.getParameter('hdninvtstatus');
			var tostatusname=request.getParameter('hdninvtstatusName');
			var statusscreenflag=request.getParameter('hdnstatusScreen');

			nlapiLogExecution('DEBUG', 'stockConversionRate,hdnuom',
					stockConversionRate+','+vUnits);

			if(actQty == '' || actQty == null)
				actQty = 0;

			if(rQty == '' || rQty == null)
				rQty = 0;

			if(availQty == '' || availQty == null)
				availQty = 0;

			//rQty = parseFloat(rQty).toFixed(5);
			//var qtw = enterQty%vreplenroundqty;
			var check1 = enterQty%vreplenroundqty;
			nlapiLogExecution('DEBUG', 'check1', enterQty%vreplenroundqty);			var qtw=0;
			if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty))
			{
				qtw = Big(enterQty).mod(vreplenroundqty);
			}
			///var qtw = Big(enterQty).mod(vreplenroundqty);
			nlapiLogExecution('DEBUG', 'qtw value Big mod', qtw);

			var optedEvent = request.getParameter('cmdPrevious');

			nlapiLogExecution('DEBUG', 'check', 
					((parseFloat(enterQty))%(parseFloat(vreplenroundqty)) == 0));

			//Checking whether the inventory feature is enabled or not.
			var inventoryStatusFeature = isInvStatusFeatureEnabled();
			nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);

			REArray["custparam_enteredstatus"] = invtstatus;
			REArray["custparam_invtstatusName"] = invtstatusName;
			REArray["custparam_toStatus"] = toStatus;
			REArray["custparam_toStatusname"] = tostatusname;

			if(optedEvent != 'Back (F7)')
			{
				if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && 
						parseFloat(rQty) >= parseFloat(enterQty) &&
						((parseFloat(enterQty))<=(parseFloat(vreplenqty))) && 
						parseFloat(availQty) >= parseFloat(enterQty))
				{
					var WhiteSpace = enterQty.indexOf(' ') >= 0;
					if(WhiteSpace == true)
					{
						REArray["custparam_error"] = 'Please enter valid qty';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan',
								'customdeploy_wmsse_replen_qtyscan', false, REArray);
						return;
					}

					if(parseFloat(enterQty) > parseFloat(vreplenqty))
					{
						REArray["custparam_error"] = 'Please enter replen qty';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan',
								'customdeploy_wmsse_replen_qtyscan', false, REArray);
						return;
					}

					if(fromBin == toBin)
					{
						REArray["custparam_error"] = 'The from and to bins must be different';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan', 
								'customdeploy_wmsse_replen_qtyscan', false, REArray);
						return;
					}		
					if((toBin==null || toBin==''))
					{
						REArray["custparam_error"] = 'Please enter bin location';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan',
								'customdeploy_wmsse_replen_qtyscan', false, REArray);
						return;						 
					}

					var vbinInternalId='';
					//To get bin internalid
					vbinInternalId=nswms_GetValidBinInternalId(toBin,REArray["custparam_whlocation"]);					
					nlapiLogExecution('DEBUG', 'vbinInternalId',vbinInternalId);

					var itemfilters=new Array();
					if(replenItemId != null && replenItemId !='')
					{
						itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',replenItemId));
					}
					if(whLocation != null && whLocation !='' && whLocation != 'null')
					{
						itemfilters.push(new nlobjSearchFilter(
								'location',null,'anyof',['@NONE@',whLocation]));
						itemfilters.push(new nlobjSearchFilter('location','binnumber',
								'anyof',whLocation));

					}

					//No need to use Load Search here as this search returns only one record.
					var itemresults= nlapiSearchRecord(
							'item', 'customsearch_wmsse_rpln_item_srh', itemfilters, null);

					if(itemresults != null && itemresults != '' && itemresults != 'null' && 
							itemresults.length>0)
					{
						nlapiLogExecution('ERROR', 'itemresults',itemresults.length);
						if(itemresults[0].getValue('preferredbin') == "T" && 
								itemresults[0].getValue('location','binnumber') == whLocation)
						{
							var internalid = itemresults[0].getId();
							var getPreferBin = itemresults[0].getValue('binnumber');

							if(getPreferBin != toBin)
							{
								REArray["custparam_error"] = 'Please enter valid To bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan',
										'customdeploy_wmsse_replen_qtyscan', false, REArray);
								return;
							}

						}
					}
					else if(toBin != REArray['custparam_tobin'])
					{
						REArray["custparam_error"] = 'Please enter valid To bin location';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan',
								'customdeploy_wmsse_replen_qtyscan', false, REArray);
						return;	
					}


					if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
					{
						REArray["custparam_error"] = '';
						REArray["custparam_enterToBin"] = vbinInternalId;
						REArray["custparam_enterQty"]=enterQty;
						nlapiLogExecution('DEBUG', 'into serial scan', itemType);
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_serial_scan',
								'customdeploy_wmsse_replen_serial_scan', false, REArray);
						return;
					}
					else if(itemType == "inventoryitem" || itemType == "assemblyitem" ||
							itemType == "lotnumberedinventoryitem" || 
							itemType=="lotnumberedassemblyitem")
					{
						var fromBinInternalId='';
						var stockConvertedQty = Number((Big(enterQty).mul(stockConversionRate)).toFixed(8));
						fromBinInternalId=nswms_GetBinInternalId(fromBin,REArray["custparam_whlocation"]);

						var binTransferId='';
						if(inventoryStatusFeature == true)
						{
							//inventory transfer from bulk loc to pickface location
							binTransferId= inventoryBinTransferReplen(itemType,REArray["custparam_whlocation"],									
									replenItemId,stockConvertedQty,fromBinInternalId,vbinInternalId,lotno,REArray["custparam_actualbegintime"],
									vUnits,stockConversionRate,Number(Big(enterQty).toFixed(8)),invtstatus,toStatus,inventoryStatusFeature);
						}
						else
						{
							//inventory transfer from bulk loc to pickface location
							binTransferId= inventoryBinTransferReplen(itemType,REArray["custparam_whlocation"],									
									replenItemId,stockConvertedQty,fromBinInternalId,vbinInternalId,lotno,REArray["custparam_actualbegintime"],
									vUnits,stockConversionRate,Number(Big(enterQty).toFixed(8)),null,null,inventoryStatusFeature);

						}
						nlapiLogExecution('DEBUG', 'Bin Transfered successfully', binTransferId);

						var currentUserID = getCurrentUser();

						var recId = '';
						var expQty = 0;
						var remQty = 0;
						var tempRemQty = 0;

						//to generate items that are valid for Replenishment	
						var Recinternalids = getReplenItemsList(whLocation,replenItemId,vbinInternalId,
								currentUserID);

						if(Recinternalids!=null && Recinternalids!='' && Recinternalids.length != null)
						{
							nlapiLogExecution('DEBUG', 'Recinternalids.length', Recinternalids.length);
							for(var i=0;i<Recinternalids.length;i++)
							{
								recId = Recinternalids[i].getValue('internalid',null,'group');

								var rId = nlapiLoadRecord('customrecord_wmsse_trn_opentask', recId);

								actQty = rId.getFieldValue('custrecord_wmsse_act_qty');
								expQty = rId.getFieldValue('custrecord_wmsse_expe_qty');
								if(expQty == '' || expQty == null)
									expQty = -1;
								if(actQty == '' || actQty == null)
									actQty = 0;

								actQty = Big(actQty).plus(enterQty);
								tempRemQty = Big(expQty).minus(actQty);
								nlapiLogExecution('DEBUG', 'tempRemQty', tempRemQty);
								if(parseFloat(tempRemQty) < 0)
								{
									tempRemQty = -(tempRemQty);
									actQty = Big(actQty).minus(tempRemQty);
									enterQty = parseFloat(tempRemQty);
									remQty = Big(expQty).minus(actQty);
								}
								else
								{
									remQty = parseFloat(tempRemQty);
									enterQty = 0;
								}

								rId.setFieldValue('custrecord_wmsse_act_qty',
										Number(Big(actQty).toFixed(8)));
								rId.setFieldValue('custrecord_wmsse_sku', replenItemId);
								rId.setFieldValue('custrecord_wmsse_actbeginloc', fromBinInternalId);
								rId.setFieldValue('custrecord_wmsse_actendloc', vbinInternalId);

								nlapiLogExecution('DEBUG', 'actQty,remQty,expQty',
										actQty+','+remQty+','+expQty);

								if(parseInt(remQty) == 0 && parseInt(expQty) == parseInt(actQty))
									rId.setFieldValue('custrecord_wmsse_wms_status_flag', 19);
								//Inventory in Storage

								var id = nlapiSubmitRecord(rId);
								rId=null;
								nlapiLogExecution('DEBUG', 'Done updating opentask Record', id);

								if(parseFloat(enterQty) == 0 || parseFloat(enterQty) == 0.0)
									break;	
							}

						}

						REArray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_itemscan',
								'customdeploy_wmsse_replen_itemscan', false, REArray);
						return;

					}
				}
				else
				{
					if(parseFloat(enterQty) > parseFloat(rQty))
					{
						REArray["custparam_error"] = 'Entered qty is greater than remaining qty ';
					}
					else if(parseFloat(enterQty) > parseFloat(availQty))
					{
						REArray["custparam_error"] = 'Insufficeint Quantity in Bulk Location ';
					}
					else if(((parseFloat(enterQty)) > (parseFloat(vreplenqty))))
					{						
						REArray["custparam_error"] = 'Entered quantity can not exceed Repeln Qty';

					}	
					else
					{
						REArray["custparam_error"] = 'Please enter valid qty';
					}
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan',
							'customdeploy_wmsse_replen_qtyscan', false, REArray);
					return;
				}
			} 
			else 
			{
				if(inventoryStatusFeature==true && REArray["custparam_statusflag"]=='T')
				{
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						REArray['custparam_availqty'] = REArray['custparam_totavailableqty'];
					}
					else
					{
						REArray['custparam_availqty'] = REArray["custparam_totbinavailableqty"];
					}
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_statusscan', 
							'customdeploy_wmsse_replen_statusscan', false, REArray);
					return;
				}

				if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
				{
					REArray["custparam_error"]='';					
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_lotscan',
							'customdeploy_wmsse_replen_lotscan', false, REArray);
					return;
				}
				else
				{
					REArray["custparam_error"]='';
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

			response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan',
					'customdeploy_wmsse_replen_qtyscan', false, REArray);
			return;
		}
	}
}

/**
 * This function is to generate items that are valid for Replenishment
 * 
 **/
function getReplenItemsList(whLocation,itemid,toBin,currentUserID)
{
	var str = 'whLocation.' + whLocation + '<br/>';
	str = str + 'itemid.' + itemid + '<br/>';
	str = str + 'toBin.' + toBin + '<br/>';
	str = str + 'currentUserID.' + currentUserID + '<br/>';

	nlapiLogExecution('DEBUG', 'getReplenItemsList',str);
	var filter = new Array();

	if(whLocation!= null && whLocation!= '' && whLocation != 'null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null, 'anyof', whLocation));
	if(itemid!= null && itemid!= '' && itemid != 'null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_sku',null, 'anyof', itemid));
	if(toBin!= null && toBin!= '' && toBin != 'null')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_actendloc',null, 'anyof', toBin));

	filter.push(new nlobjSearchFilter('custrecord_wmsse_task_assignedto',null,
			'anyof', ['@NONE@',currentUserID]));

	var otResult =nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask','customsearch_wmsse_rpln_getopentask_srh',filter, null);
	return otResult;
}

/**
 * This function transfers inventory from bulk location to pickface location
 * 
 **/
function inventoryBinTransferReplen(itemType,whLocation,itemId,quantity,fromBinId,toBinId,batchno,
		actualBeginTime,vUnits,vStockConversionRate,opentaskQty,fromstatus,tostatus,inventoryStatusFeature)
{
	var REC_TYPE = 'bintransfer';
	var binTransfer= nlapiCreateRecord(REC_TYPE);


	binTransfer.setFieldValue('location', whLocation);
	binTransfer.setFieldValue('trandate', DateStamp());


	binTransfer.selectNewLineItem('inventory');
	binTransfer.setCurrentLineItemValue('inventory', 'item', itemId);

	binTransfer.setCurrentLineItemValue('inventory', 'quantity', quantity);

	if(itemType == "inventoryitem" || itemType == "assemblyitem" ||
			itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") 
	{
		var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
		compSubRecord.selectNewLineItem('inventoryassignment');
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', quantity);
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);       
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
		if(inventoryStatusFeature==true)
		{
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', fromstatus);
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'toinventorystatus', tostatus);
		}
		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			compSubRecord.setCurrentLineItemValue('inventoryassignment',
					'receiptinventorynumber', batchno);                                                                                                                                            
		compSubRecord.commitLineItem('inventoryassignment');
		compSubRecord.commit();
		var compSubRecord=null;
	}
	else
	{
		var filterssertemp = new Array();

		filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', toBinId));
		filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', itemId));

		var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry',
				'customsearch_wmsse_replen_serial_srh',filterssertemp,null);
		nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial1', SrchRecordTmpSerial1);
		if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 !='')
		{
			var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
			for (var n = 0; n < SrchRecordTmpSerial1.length; n++) 
			{
				compSubRecord.selectNewLineItem('inventoryassignment');
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber',
						SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'));
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);       
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
				if(inventoryStatusFeature==true)
				{
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', fromstatus);
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'toinventorystatus', tostatus);
				}
				compSubRecord.commitLineItem('inventoryassignment');

			}
			compSubRecord.commit();
			compSubRecord=null;
			for (var j = 0; j < SrchRecordTmpSerial1.length; j++) 
			{
				var TempRecord=SrchRecordTmpSerial1[j];

				var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
				tempSerial.setFieldValue('id', TempRecord.getId());
				tempSerial.setFieldValue('name', TempRecord.getValue('name'));
				tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 
						'because of inventory move completed for serial number '+
				'we have marked this serial number as closed');
				tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
				nlapiSubmitRecord(tempSerial);
				TempRecord=null;
			}
		}
		SrchRecordTmpSerial1= null;
		filterssertemp=null;
		columnssertemp1= null;
	}
	binTransfer.commitLineItem('inventory');

	var inventoryCountId = nlapiSubmitRecord(binTransfer);
	var taskType="MOVE";
	var Qty = quantity;
	if(opentaskQty != null && opentaskQty != '' && opentaskQty != 'null' && opentaskQty != 'undefined')
	{
		Qty = opentaskQty;
	}
	//To update/create open task with RPLN task type
	updateMoveOpenTaskforInventory(itemType,whLocation,itemId,Qty,fromBinId,toBinId,batchno,inventoryCountId,
			taskType,'','',actualBeginTime,vUnits,vStockConversionRate,fromstatus,tostatus);
	binTransfer=null;
	return inventoryCountId;
}

function multiDimensionalUnique(arr) 
{
	var uniques = [];
	var itemsFound = {};
	for(var i = 0, l = arr.length; i < l; i++) 
	{
		var stringified = JSON.stringify(arr[i]);
		if(itemsFound[stringified]) 
		{ 
			continue; 
		}
		uniques.push(arr[i]);
		itemsFound[stringified] = true;
	}
	return uniques;
}