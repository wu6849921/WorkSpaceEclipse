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
function CheckInSerial(request, response)
{
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

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
		var frombin = request.getParameter("custparam_frombin");
		var tobin = request.getParameter("custparam_tobin");
		var getLot = request.getParameter('custparam_lotno');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var enterQty = request.getParameter("custparam_enterQty");
		var enterToBin = request.getParameter("custparam_enterToBin");
		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var uomqtyArr = request.getParameter('custparam_uomqtyselected');
		var invtstatus = request.getParameter('custparam_enteredstatus');
		var invtstatusName = request.getParameter('custparam_invtstatusName');
		var toinvtstatus = request.getParameter('custparam_toStatus');
		var toinvtstatusname = request.getParameter('custparam_toStatusname');
		var statusScreenflag = request.getParameter('custparam_statusflag');
		var enteredlot = request.getParameter('custparam_enteredlotid');
		var enteredBinId = request.getParameter('custparam_enteredBinID');
		var binavailqty = request.getParameter('custparam_totbinavailableqty');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		if(vConversionRate == '- None -' || vConversionRate == '' || vConversionRate == null)
			vConversionRate =1;

		var strvUnits = "";
		var headerVar='Replenishment';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && 
				request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+headerVar;

		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;
		nlapiLogExecution('ERROR', 'getNumber', getNumber);
		var toBinInternalId=nswms_GetBinInternalId(tobin,whLocation);
		if(parseInt(getNumber)==0)
		{
			var filterssertemp1 = new Array();

			filterssertemp1[0] = new nlobjSearchFilter(
					'custrecord_wmsse_ser_bin', null, 'anyof', toBinInternalId);
			filterssertemp1[1] = new nlobjSearchFilter(
					'custrecord_wmsse_ser_item', null, 'anyof', getItemInternalId);

			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry',
					'customsearch_wmsse_replen_serial_srh', filterssertemp1,null);

			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
			{	
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) 
				{
					var TempRecord=SrchRecordTmpSerial1[j];
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1',
							'because of discontinue of serial number scanning we'
							+'have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
				}
			}	
		}

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

		var itemresults= nlapiSearchRecord(
				'item', 'customsearch_wmsse_rpln_item_srh', itemfilters, null);

		if(itemresults != null && itemresults != '' && itemresults != 'null' && 
				itemresults.length>0)
		{
			stockUnit = itemresults[0].getText('stockunit');
			unitsType = itemresults[0].getValue('unitstype');
			getReplenItem = itemresults[0].getValue('itemid');
		}

		var vStockConversionRate =1;
		var vConversionRate=1;
		var vBaseUnit='';
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
				vStockConversionRate =getStockCoversionRate(unitsType,stockUnit,vConversionRate);
			}
		}

		var vUnitsText="";
		if(stockUnit != "" && stockUnit != null && stockUnit != "null")
			vUnitsText = 'In '+ stockUnit;

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

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
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />"+
		"<link rel='stylesheet' type='text/css' " +
		"href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML(
			"https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + 
			"' type='text/css' rel='stylesheet'>";

		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() {" +
		"var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtserial').value;" +
		" var vSerialWhiteSpace = lotVal.indexOf(' ') >= 0;" +
		" if(document.getElementById('txtserial').value == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;}" +
		" else{var sessionObj = document.getElementById('hdnsession').value;" +
		"if(sessionObj != '' && sessionObj != null){" +
		"document.getElementById('div_error').innerHTML ='Transcation is in progress...';" +
		"return false;}else{document.getElementById('hdnsession').value = 'session';" +
		"document.forms['_rf_checkin_item'].submit();" +
		"document.getElementById('loading').style.display = '';" +
		"document.forms['_rf_checkin_item'].cmdSend.disabled=true;" +
		"document.forms['_rf_checkin_item'].cmdPrevious.disabled=true;" +
		" return true;}}}</script>";

		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){" +
		"window.history.forward();}setTimeout('preventBack()', 0);" +
		"window.onunload=function(){null};</script>" +
		" </head><body  onkeydown='return OnKeyDown_CL();'>";

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

		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ 
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image'  src='"+imgUrl+"' class='centerImage'" +
		"alt='Processing Please Wait....' ></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Replenishment Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+
		errMsg+"</div></td></tr>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Location: <label>" +
		whLocationName +"</label>"+
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
		"				<input type='hidden' name='hdnLot' value=" + getLot + ">"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnLineno' value=" + getLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnReplenItem' value='" + getReplenItem + "'>"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+		
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + stockUnit + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" +
		vConversionRate + ">"+
		"				<input type='hidden' name='hdnvStockConversionRate' id='hdnvStockConversionRate' " +
		"value=" +vStockConversionRate + ">"+
		"				<input type='hidden' name='hdnfromBin' id='hdnfromBin' value='" + frombin + "'>"+
		"				<input type='hidden' name='hdntoBin' id='hdntoBin' value='" + tobin + "'>"+
		"				<input type='hidden' name='hdnavailQty' id='hdnavailQty' value=" +
		getItemAvailQty + ">"+
		"				<input type='hidden' name='hdnlotNo' id='hdnlotNo' value=" + getLot + ">"+
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterToBin + ">"+
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
		"				<input type='hidden' name='hdnselecteduomswithqty'  value=" + uomqtyArr + ">"+
		"				<input type='hidden' name='hdninvtstatus' id='hdninvtstatus' value=" + invtstatus + ">"+
		"				<input type='hidden' name='hdninvtstatusName' id='hdninvtstatusName' value='" + invtstatusName + "'>"+
		"				<input type='hidden' name='hdnstatusScreen' id='hdnstatusScreen' value='" + statusScreenflag + "'>"+	
		"				<input type='hidden' name='hdnEntbinId' id='hdnEntbinId' value='" + enteredBinId + "'>"+
		"				<input type='hidden' name='hdnlotid' value=" + enteredlot + ">"+ 
		"				<input type='hidden' name='hdntoinvtstatus' value=" + toinvtstatus + ">"+
		"				<input type='hidden' name='hdntoinvtstatusname' value=" + toinvtstatusname + ">"+
		"				<input type='hidden' name='hdnbinavailqty' id = 'hdnbinavailqty' value="+binavailqty+">"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"				</td>"+
		"			</tr>"+			 
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>From Bin: <label>" + frombin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: " +
		"<label>" + (parseFloat(getItemRemQty)) + " " +vUnitsText+ "</label>"+
		"			</tr>";

		if(invtstatusName != null && invtstatusName != '' && invtstatusName != 'null' && invtstatusName != 'undefined')
		{
			var toInventoryStatusArray = getDefaultInventoryStatusList(toinvtstatus,-1,null);
			toInventoryStatusArray = toInventoryStatusArray.toString();

			var toInventoryStatus = toInventoryStatusArray.split(',');
			nlapiLogExecution('DEBUG', 'toInventoryStatus', toInventoryStatus[0]+'+'+toInventoryStatus[1]+'+'+toInventoryStatus[2]);
			toinvtstatusname = toInventoryStatus[0];

			html = html + "<tr>"+
			"			<td align = 'left' class='labelmsg'>From Inv Status: <label>" + invtstatusName + "</label>"+
			"			</td></tr>"+
			"			<tr>"+
			"				<td align = 'left' class='labelmsg'>To Inv Status: <label>" + toinvtstatusname + "</label>"+
			"				<input type='hidden' name='hdntoinvtstatusname' value=" + toinvtstatusname + ">"+
			"			</td></tr>";
		}

		html = html + "<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF" +
		" <label>"+Number(Big(request.getParameter('custparam_enterQty')).mul(vStockConversionRate))+
		"</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";

		html = html + "<td align = 'left'><input name='txtserial'  class='smalltextbox' " +
		" id='txtserial' type='text'/>";

		html = html + "				</td>";
		html = html + "			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink' " +
		" type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)'" +
		" onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";
		html = html + "</table></form>"+

		"<script type='text/javascript'>document.getElementById('txtserial').focus();</script>";
		if(componentvalarr!=null && componentvalarr!='' && componentvalarr.length>0)
		{
			var JSfile = getLoadFile('wmsse_uomfunctions.js');
			var JSSurl ='';
			if (JSfile) 
			{ 
				JSSurl = JSfile.getURL();
			}

			if(JSSurl != null && JSSurl != '')
			{
				html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
			}

			html = html +"<script type='text/javascript'>setFieldDefaults(\""+componentvalarr+"\");</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);

	}
	else
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating Serial #');

		var REArray = new Array();

		try
		{
			var tempflag='F';
			var getSerialNo=request.getParameter('txtserial');

			REArray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			REArray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
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
			REArray["custparam_enterToBin"] = request.getParameter('hdnenterBin');
			REArray["custparam_enterQty"]=request.getParameter('hdnenterQty');
			REArray['custparam_itemgroup'] = request.getParameter('hdnvitemgroup');
			REArray['custparam_itemfamily'] = request.getParameter('hdnvitemfamily');
			REArray['custparam_replenminqty'] = request.getParameter('hdnvreplenminqty');
			REArray['custparam_replenmaxqty'] = request.getParameter('hdnvreplenmaxqty');
			REArray['custparam_replenqty'] = request.getParameter('hdnvreplenqty');
			REArray['custparam_replenroundqty'] = request.getParameter('hdnvreplenroundqty');
			REArray["custparam_enteredlotid"] = request.getParameter('hdnlotid');
			REArray["custparam_enteredBinID"] = request.getParameter('hdnEntbinId');		
			REArray["custparam_statusflag"] = request.getParameter('hdnstatusScreen');	
			REArray["custparam_enteredstatus"] = request.getParameter('hdninvtstatus');
			REArray["custparam_invtstatusName"] = request.getParameter('hdninvtstatusName');
			REArray["custparam_toStatus"] = request.getParameter('hdntoinvtstatus');
			REArray["custparam_toStatusname"] = request.getParameter('hdntoinvtstatusname');
			REArray["custparam_totbinavailableqty"] = request.getParameter('hdnbinavailqty');
			REArray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
			REArray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');


			var replenItem = request.getParameter('hdnReplenItem');
			var replenItemId = request.getParameter('hdnItemInternalId');
			var whLocation = request.getParameter('hdnWhLocation');
			var whLocationName = request.getParameter('hdnWhLocationName');
			var itemType = request.getParameter('hdnitemtype');
			var fromBin =request.getParameter('hdnfromBin');
			var toBin =request.getParameter('hdntoBin');
			var lotno = request.getParameter('hdnLot');
			var actQty = request.getParameter('hdnItemRecQty');
			var rQty = request.getParameter('hdnItemRemQty');
			var enterQty=request.getParameter('hdnenterQty');
			var enterBin=request.getParameter('hdnenterBin');
			var vUnits = request.getParameter('hdnuom');
			var stockConversionRate = request.getParameter('hdnvStockConversionRate');
			var fromstatusid=request.getParameter('hdninvtstatus');
			var tostatusid=request.getParameter('hdntoinvtstatus');

			nlapiLogExecution('DEBUG', 'fromstatusid', fromstatusid);
			nlapiLogExecution('DEBUG', 'tostatusid', tostatusid);

			nlapiLogExecution('DEBUG', 'stockConversionRate,hdnuom',
					stockConversionRate+','+vUnits);

			if(actQty == '' || actQty == null)
				actQty = 0;

			if(rQty == '' || rQty == null)
				rQty = 0;

			var optedEvent = request.getParameter('cmdPrevious');

			//Checking whether the Inventory Status feature is enabled or not.
			var inventoryStatusFeature = isInvStatusFeatureEnabled();
			nlapiLogExecution('DEBUG', 'inventoryStatusFeature', inventoryStatusFeature);

			if(optedEvent != 'Back (F7)')
			{
				if(getSerialNo!=null && getSerialNo!="" && getSerialNo!='null')
				{
					nlapiLogExecution('DEBUG', 'After Serial No Parsing', getSerialNo);
					nlapiLogExecution('ERROR', 'request.getParameter(custparam_serialno) before',
							request.getParameter('custparam_serialno'));
					var binInternalId=nswms_GetBinInternalId(fromBin,whLocation);//to get bin internalid
					nlapiLogExecution('DEBUG', 'binInternalId', binInternalId);
					var objBinDetails = null;
					if(inventoryStatusFeature ==true)
					{
						var vinventoryNumberBinOnHand='';

						var filterStrat = new Array();
						if(binInternalId != null && binInternalId != '')
							filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
						filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', replenItemId));
						filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', whLocation));
						filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

						var columnStrat=new Array();
						columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
						columnStrat[0].setSort(true);						

						//No need to use Load Search here as this search will return only one record.
						var objBinDetailsGetInternalId = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

						if(objBinDetailsGetInternalId!=null && objBinDetailsGetInternalId!='')
						{
							if(objBinDetailsGetInternalId.length>0)
							{
								vinventoryNumberBinOnHand=objBinDetailsGetInternalId[0].getValue('inventorynumber','inventoryNumberBinOnHand');
							}
						}

						var filterStrat = new Array();

						if(binInternalId != null && binInternalId != '' && binInternalId != 'null')
							filterStrat.push(new nlobjSearchFilter('binnumber',null,'anyof', binInternalId));
						if(replenItemId != null && replenItemId != '' && replenItemId != 'null')
							filterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', replenItemId));
						if(whLocation != null && whLocation != '' && whLocation != 'null')
							filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));						
						if(vinventoryNumberBinOnHand!= null && vinventoryNumberBinOnHand != 'null' && 
								vinventoryNumberBinOnHand != undefined && vinventoryNumberBinOnHand != '')
							filterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'is', vinventoryNumberBinOnHand));
						if(fromstatusid != null && fromstatusid != '' && fromstatusid != 'null')
							filterStrat.push(new nlobjSearchFilter('status', null, 'anyof', fromstatusid));

						//No need to use Load Search here as this search will not return more than 1K records.
						objBinDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterStrat, null);

						if(objBinDetails!=null && objBinDetails!='')
						{
							if(objBinDetails.length>0)
							{
								var serial_matchfound='F';
								for(var i =0; i<objBinDetails.length; i++)
								{
									var availableQty=objBinDetails[i].getValue('available',null,'group');
									var vinventorynumber=objBinDetails[i].getText('inventorynumber',null,'group');
									nlapiLogExecution('DEBUG', 'enterQty,availableQt,vinventorynumber', enterQty+","+availableQty+","+vinventorynumber);
									if(vinventorynumber == getSerialNo)
									{
										serial_matchfound='T';
										break;
									}

								}
								if(serial_matchfound =='F')
								{
									REArray["custparam_error"] = 'Insufficient inventory for this serial#: '+getSerialNo;
									response.sendRedirect('SUITELET', 'customscript_wmsse_replen_serial_scan', 
											'customdeploy_wmsse_replen_serial_scan', false, REArray);
									return;
								}
							}
							else
							{
								objBinDetails='';
							}
						}
					}
					else
					{
						var filterStrat = new Array();
						if(binInternalId != null && binInternalId != '')
						{
							filterStrat.push(new nlobjSearchFilter(
									'binnumber','inventoryNumberBinOnHand','anyof', binInternalId));
						}
						filterStrat.push(new nlobjSearchFilter(
								'internalid',null, 'anyof', replenItemId));
						filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						filterStrat.push(new nlobjSearchFilter(
								'location','inventoryNumberBinOnHand', 'anyof', whLocation));
						filterStrat.push(new nlobjSearchFilter(
								'inventorynumber','inventoryNumberBinOnHand', 'is', getSerialNo));

						var columnStrat=new Array();
						columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
						columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
						columnStrat[0].setSort(true);

						objBinDetails = new nlapiSearchRecord('item',
								'customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

						if(objBinDetails!=null && objBinDetails!='')
						{
							if(objBinDetails.length>0)
							{
								var vmakeInvAvailFlag = "T";
								var fields = ['makeinventoryavailable'];
								var vLocDetails= nlapiLookupField('location',whLocation,fields);
								vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
								nlapiLogExecution('ERROR', 'vmakeInvAvailFlag',vmakeInvAvailFlag);
								if(vmakeInvAvailFlag == "T")
								{
									var availableQty=objBinDetails[0].getValue(
											'quantityavailable','inventoryNumberBinOnHand');
								}
								else
								{
									var availableQty=objBinDetails[0].getValue(
											'quantityonhand','inventoryNumberBinOnHand');
								}
								var vinventoryNumberBinOnHand=objBinDetails[0].getText(
										'inventorynumber','inventoryNumberBinOnHand');
								nlapiLogExecution('ERROR', 'availableQty', availableQty);
								if(parseInt(availableQty) <= 0 || (getSerialNo != vinventoryNumberBinOnHand))
								{
									REArray["custparam_error"] = 'Insufficient inventory for this serial#: '+
									getSerialNo;
									response.sendRedirect('SUITELET', 'customscript_wmsse_replen_serial_scan',
											'customdeploy_wmsse_replen_serial_scan', false, REArray);
									return;
								}
							}
							else
							{
								objBinDetails='';
							}
						}
					}
					if(objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' ||
							objBinDetails =='undefined' ||objBinDetails.length < 1)
					{
						nlapiLogExecution('DEBUG', 'objBinDetails inside null', '');
						REArray["custparam_error"] = 'Serial#: '+ getSerialNo + ' is not available';
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_serial_scan', 
								'customdeploy_wmsse_replen_serial_scan', false, REArray);
						return;
					}
					objBinDetails=null;
					columnStrat=null;
					filterStrat=null;

					var toBinInternalId=nswms_GetBinInternalId(toBin,whLocation);//to get bin internal id
					nlapiLogExecution('ERROR', 'INTO SERIAL ENTRY');
					//checking serial no's in already scanned one's from temp table
					var filterssertemp = new Array();
					filterssertemp.push(new nlobjSearchFilter(
							'custrecord_wmsse_ser_no', null, 'is', getSerialNo));

					filterssertemp.push(new nlobjSearchFilter(
							'custrecord_wmsse_ser_bin', null, 'anyof', toBinInternalId));

					var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry',
							'customsearch_wmsse_replen_serial_srh', filterssertemp);
					nlapiLogExecution('ERROR', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
					if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
					{

						REArray["custparam_error"] = "Serial# already scanned";
						SrchRecordTmpSerial=null;
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_serial_scan',
								'customdeploy_wmsse_replen_serial_scan', false, REArray);
						return;
					}								
					else 
					{

						REArray["custparam_serialno"] = getSerialNo;
						REArray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
					}
					SrchRecordTmpSerial=null;
					filterssertemp=null;

					//Here we are creating serial# into new Temp Serial entry custom record

					var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
					customrecord.setFieldValue('name', getSerialNo);
					customrecord.setFieldValue('custrecord_wmsse_ser_item', replenItemId);
					customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
					customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
					customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
					customrecord.setFieldValue('custrecord_wmsse_ser_bin', toBinInternalId);
					customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 17);
					var rec = nlapiSubmitRecord(customrecord, false, true);
					customrecord=null;
					nlapiLogExecution('ERROR', '(getNumber + 1)',
							(parseFloat(request.getParameter('hdnNumber')) + 1));
					nlapiLogExecution('ERROR', 'enterQty', enterQty);
					if ((parseFloat(request.getParameter('hdnNumber')) + 1) < 
							Number(Big(enterQty).mul(stockConversionRate))) 
					{
						nlapiLogExecution('ERROR', 'Scanning Serial No.');
						REArray["custparam_error"] = "";
						response.sendRedirect('SUITELET', 'customscript_wmsse_replen_serial_scan',
								'customdeploy_wmsse_replen_serial_scan', false, REArray);
						return;

					}
					else
					{
						var stockConvertedQty = Number((Big(enterQty).mul(stockConversionRate)).toFixed(8));

						//Transfering inventory from bulk location to pickface location
						var binTransferId= inventoryBinTransferReplen(itemType,REArray['custparam_whlocation'],								
								replenItemId,stockConvertedQty,binInternalId,toBinInternalId,lotno,REArray["custparam_actualbegintime"],
								vUnits,stockConversionRate,Number(Big(enterQty).toFixed(8)),fromstatusid,tostatusid,inventoryStatusFeature);

						nlapiLogExecution('ERROR', 'Bin Transfered successfully', binTransferId);

						var currentUserID = getCurrentUser();
						nlapiLogExecution('ERROR', 'currentUserID', currentUserID);
						var recId = '';
						var expQty = 0;
						var remQty = 0;
						var tempRemQty = 0;
						var Recinternalids = getReplenItemsList(whLocation,replenItemId,
								toBinInternalId,currentUserID);
						//to generate items that are valid for Replenishment
						if(Recinternalids!=null && Recinternalids!='' && Recinternalids.length != null)
						{
							nlapiLogExecution('ERROR', 'Recinternalids.length', Recinternalids.length);
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
								rId.setFieldValue('custrecord_wmsse_actbeginloc', binInternalId);
								rId.setFieldValue('custrecord_wmsse_actendloc', toBinInternalId);

								nlapiLogExecution('ERROR', 'actQty,remQty,expQty',
										actQty+','+remQty+','+expQty);

								if(parseInt(remQty) == 0 && parseInt(expQty) == parseInt(actQty))
									rId.setFieldValue('custrecord_wmsse_wms_status_flag', 19);
								//Inventory in Storage

								var id = nlapiSubmitRecord(rId);
								rId=null;
								nlapiLogExecution('ERROR', 'Done updating opentask Record', id);

								nlapiLogExecution('ERROR', 'enterQty', enterQty);
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
					REArray["custparam_error"] = 'Please enter/scan valid serial#';
					response.sendRedirect('SUITELET', 'customscript_wmsse_replen_serial_scan',
							'customdeploy_wmsse_replen_serial_scan', false, REArray);
					return;
				}
			} 
			else 
			{
				REArray["custparam_error"] = "";
				response.sendRedirect('SUITELET', 'customscript_wmsse_replen_qtyscan',
						'customdeploy_wmsse_replen_qtyscan', false, REArray);
				return;
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

			REArray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));

			response.sendRedirect('SUITELET', 'customscript_wmsse_replen_serial_scan',
					'customdeploy_wmsse_replen_serial_scan', false, REArray);
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

	nlapiLogExecution('ERROR', 'getReplenItemsList',str);
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

	var str = 'fromBinId.' + fromBinId + '<br/>';
	str = str + 'toBinId.' + toBinId + '<br/>';
	str = str + 'fromstatus.' + fromstatus + '<br/>';
	str = str + 'tostatus.' + tostatus + '<br/>';
	str = str + 'whLocation.' + whLocation + '<br/>';
	str = str + 'itemId.' + itemId + '<br/>';
	str = str + 'quantity' + quantity + '<br/>';
	str = str + 'itemType' + itemType + '<br/>';

	nlapiLogExecution('ERROR', 'Into inventoryBinTransferReplen',str);

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
		nlapiLogExecution('ERROR', 'SrchRecordTmpSerial1', SrchRecordTmpSerial1);


		if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 !='')
		{
			nlapiLogExecution('ERROR', 'SrchRecordTmpSerial1', SrchRecordTmpSerial1.length);

			var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
			for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
				nlapiLogExecution('ERROR', 'Serial#', SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'));
				compSubRecord.selectNewLineItem('inventoryassignment');
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
				compSubRecord.setCurrentLineItemValue('inventoryassignment','receiptinventorynumber',
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
				nlapiLogExecution('ERROR', 'TempRecord.getId()',TempRecord.getId());
				nlapiLogExecution('ERROR', 'TempRecord.getValue(name)',TempRecord.getValue('name'));
				var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
				tempSerial.setFieldValue('id', TempRecord.getId());
				tempSerial.setFieldValue('name', TempRecord.getValue('name'));
				tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 
						'because of inventory move completed for serial number' 
						+'we have marked this serial number as closed');
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