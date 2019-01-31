/**
 * Script Description
 * This script is used for Cycle count plan quantity scanning
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

/**
 * Main function to scan quantity in Cycle count record process
 */
function ScanQty(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') {

		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		var getOptedField = request.getParameter('custparam_option');
		

		var getPlanid =request.getParameter('custparam_planid');
		var whLocation = request.getParameter('custparam_whlocation');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');

		var vPlanLine=request.getParameter('custparam_lineno');
		var vPlanItemId=request.getParameter('custparam_fetcheditemid');
		var vPlanItemText=request.getParameter('custparam_fetcheditemname');
		var vPlanBin=request.getParameter('custparam_binlocationid');
		var vPlanBinText=request.getParameter('custparam_binlocationname');

		vPlanBinText = nlapiLookupField('bin', vPlanBin, 'binnumber');
		nlapiLogExecution('DEBUG', 'vPlanBinText', vPlanBinText);
		var itemType=request.getParameter('custparam_itemtype');
		var vPlanInternalId=request.getParameter('custparam_planinternalid');
		var domainName = fndomainName();
		
		var st0,st1,st2,st3;
		var whLocationName = request.getParameter('custparam_whlocationname');
		var qtyCheckFlag="F";
		var vPlanStatus='F';
		var VUnitType ="";
		var vUnits ="";
		var blnItemUnit ="";
		var arrPlandetails=getPlanDetails(getPlanid,vPlanItemId,vPlanBin,null);
		if(arrPlandetails!=null && arrPlandetails!='' && arrPlandetails.length>0)
		{
			qtyCheckFlag="T";
			var planStatus=arrPlandetails[0].getValue('status');
			VUnitType = arrPlandetails[0].getValue('unitstype','item');
			blnItemUnit = arrPlandetails[0].getText('stockunit','item');
			vUnits = arrPlandetails[0].getValue('unit');
			nlapiLogExecution('DEBUG', 'planStatus', planStatus);
			if(planStatus == 'started')
				vPlanStatus = 'T';
		}//Case# 201414639 start
		else
		{
			var cycArray=new Array();
			cycArray["custparam_language"] = getLanguage;
			cycArray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
			cycArray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
			cycArray["custparam_error"] ="The plan "+getPlanid+" doesn't exist or deleted ,please choose valid plan.";
			response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
			return;
		}//Case# 201414639 end
		nlapiLogExecution('DEBUG', 'VUnitType : vUnits : blnItemUnit', VUnitType +" : "+ vUnits +" : "+ blnItemUnit);
		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		var vConversionRate =1;
		if(vUnits !=null && vUnits!='' && vUnits!='- None -')
			vConversionRate = getOpenTaskStockCoversionRate(VUnitType,vUnits);
		nlapiLogExecution('DEBUG', 'vConversionRate', vConversionRate); 

		var uomresults= new Array();
		var results='';
		var addbtnimgUrl='';
		var delbtnimgUrl='';

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		if(VUnitType != null && VUnitType != '')
		{
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

		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-CHECKIN SO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			st0 = domainName + "-CC Inventory";

			st1 = "Enter/Scan Item";

			st2 = "SEND";
			st3 = "PREV";
		}	
		
		var cycArray=new Array();
		cycArray["custparam_language"] = getLanguage;
		cycArray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		cycArray["custparam_actualbegintime"] = request.getParameter('custparam_actualbegintime');
		cycArray["custparam_lineno"] = request.getParameter('custparam_lineno');
		cycArray["custparam_fetcheditemid"] = request.getParameter('custparam_fetcheditemid');
		cycArray["custparam_planid"] = request.getParameter('custparam_planid');
		cycArray["custparam_binlocationid"] = request.getParameter('custparam_binlocationid');
		cycArray["custparam_binlocationname"] = request.getParameter('custparam_binlocationname');
		cycArray["custparam_itemtype"] = request.getParameter('custparam_itemtype');
		cycArray["custparam_planinternalid"]=request.getParameter('custparam_planinternalid');
		cycArray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
		var trantype='inventorycount';
		var currentUser=getCurrentUser();
		nlapiLogExecution('DEBUG','currentUser', currentUser);
		var lockfilters=new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',vPlanInternalId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',vPlanLine));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
		var lockcolumns= new Array();
		//lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_user'));
		//lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_line'));		
		var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, lockcolumns);

		if(lockresults!=null && lockresults!='')
		{
			var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
			var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
			nlapiLogExecution('DEBUG', 'getLockUser', getLockUser);
			nlapiLogExecution('DEBUG', 'getLockLine', getLockLine);
			if(getLockUser!=currentUser)
			{
				cycArray["custparam_error"]='The line item is being processed by other user.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
				nlapiLogExecution('DEBUG', 'Record Locked by another user', '');
				return;
			}
			else if(parseInt(getLockLine)!=parseInt(vPlanLine))
			{
				var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
				LockRecord.setFieldValue('name',vPlanInternalId);
				LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
				LockRecord.setFieldValue('custrecord_wmsse_order',vPlanInternalId);
				LockRecord.setFieldValue('custrecord_wmsse_line',vPlanLine);
				LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
				LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
				var recid = nlapiSubmitRecord(LockRecord);
				LockRecord=null;
				nlapiLogExecution('DEBUG', 'Inside else if Record Locked Successfully', recid);
			}
		}
		else
		{
			var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
			LockRecord.setFieldValue('name',vPlanInternalId);
			LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
			LockRecord.setFieldValue('custrecord_wmsse_order',vPlanInternalId);
			LockRecord.setFieldValue('custrecord_wmsse_line',vPlanLine);
			LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
			LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
			var recid = nlapiSubmitRecord(LockRecord);
			nlapiLogExecution('DEBUG', 'Record Locked Successfully', recid);
			LockRecord=null;
		}
		lockresults=null;
		lockcolumns=null;
		lockfilters=null;
		//end


		if(inventoryStatusFeature ==true && (itemType == "inventoryitem" || itemType=="assemblyitem"))
		{
			var filterssertemp1 = new Array();
			var SrchRecordTmpSerial1=fnGetAllSerials(vPlanInternalId,vPlanLine,'-1');

			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
			{
				nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial1.length', SrchRecordTmpSerial1.length);	
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of discontinue of serial number scanning we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
					tempSerial=null;
					TempRecord=null;
				}

			}	
			SrchRecordTmpSerial1=null;
			filterssertemp1=null;
			columnssertemp1=null;
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('DEBUG', 'CSSfilefound', CSSfilefound);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
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

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',vPlanItemId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		//Case # 201414303 start
		itemcolumns.push(new nlobjSearchColumn('isinactive'));
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
		if(itemresults!=null && itemresults!='' && itemresults != 'undefined' && itemresults != 'null')
		{
			if(itemresults[0].getValue('isinactive')=="T")
			{				
				cycArray["custparam_error"] = 'Entered item is inactive.';				
				response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
				return;
			}
			//Case # 201414303 end
			vPlanItemText = itemresults[0].getValue('itemid');
		}//Case# 201414599 start
		else
		{
			var itemfilters=new Array();
			itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',vPlanItemId));
			var itemcolumns= new Array();
			itemcolumns.push(new nlobjSearchColumn('itemid'));			
			itemcolumns.push(new nlobjSearchColumn('isinactive'));
			itemcolumns.push(new nlobjSearchColumn('location'));
			var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
			if(itemresults!=null && itemresults!='' && itemresults != 'undefined' && itemresults != 'null')
			{
				if(itemresults[0].getValue('isinactive')=="T")
				{				
					cycArray["custparam_error"] = 'Entered item is inactive.';				
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
					return;
				}
				else if(itemresults[0].getValue('location') !='' && itemresults[0].getValue('location') != whLocation)
				{
					cycArray["custparam_error"] = "Entered/scanned item belongs to different warehouse.";				
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
					return;
				}
				else
				{
					cycArray["custparam_error"] = 'Invalid item';				
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
					return;
				}
			}
			else
			{
				cycArray["custparam_error"] = 'Invalid item';				
				response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
				return;
			}

		}//Case# 201414599 end


		if(inventoryStatusFeature == true)
		{
			var btnText='Next (Ent)';
			var binInternalId = cycArray["custparam_binlocationid"];
			if(itemType== "inventoryitem" || itemType=="assemblyitem")
			{

				var objBinStatusDetails = fnGetInventoryBalanceDetails(cycArray["custparam_whlocation"],vPlanItemId,binInternalId);

				if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && objBinStatusDetails != 'undefined' &&
						objBinStatusDetails != undefined && objBinStatusDetails.length > 0)
				{
					if(objBinStatusDetails.length > 1)
					{
						var btnText='Next (Ent)';

					}
					else
					{
						var btnText='Save (Ent)';
					}
				}
			}
		}
		else
		{
			var btnText='Save (Ent)';
			if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem" || itemType =='lotnumberedinventoryitem' ||
					itemType =='lotnumberedassemblyitem')
			{
				btnText='Next (Ent)';
			}
		}

		var functionkeyHtml=getFunctionkeyScriptSE('_rf_Fulfillment');

		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		html = html +functionkeyHtml;
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 

		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		html=html+	"<script type='text/javascript'>function validateForm() {" +
		"if(document.getElementById('hdnqtyCheckFlag').value == 'F'){" +
		"document.getElementById('div_error').innerHTML ='RCRD_HAS_BEEN_CHANGED : This cycle count/cycle count line has been changed';return false;" +
		"} if(document.getElementById('hdnvPlanStatus').value == 'F'){" +
		"document.getElementById('div_error').innerHTML ='Count is already completed';return false;" +
		"}var selecteduomqtyArr = new Array();" +
		"var ConvertQty=document.getElementById('hdngetStockConversionRate').value;" +			
		"var uomTbl = document.getElementById('tblUOM');var enteredQty =0; if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){" +
		"var rowcount = uomTbl.rows.length;for(var r=0;r<rowcount;r++){var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;if(qty==''){" +
		"document.getElementById('div_error').innerHTML ='Please enter qty';document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;" +
		"}" +
		"else {if(isNaN(qty) || parseFloat(qty)<0){"+
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';"+
		"document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;"+	
		"}}"+
		"var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';" +
		"document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].focus();return false;}var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr); " +
		"if((qty)!=0){enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom)); }else{enteredQty = qty;}}document.getElementById('hdnselecteduomswithqty').value=selecteduomqtyArr;" +
		"var scannedqty=parseFloat(enteredQty)/parseFloat(ConvertQty);}else{enteredQty = document.getElementById('txtqty').value;}if(enteredQty == '' || enteredQty == 'null' || enteredQty == null){" +
		"document.getElementById('div_error').innerHTML ='Please enter qty';" +
		"if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){document.getElementById('txtqty').focus();}" +
		"return false;}else{var scannedqty=enteredQty;" +
		"if((isNaN(scannedqty) || parseFloat(scannedqty)<0)  ){" +
		"document.getElementById('div_error').innerHTML ='Please enter valid qty';" +
		"if(uomTbl == null || uomTbl == '' || uomTbl !== 'null' || uomTbl == 'undefined'){document.getElementById('txtqty').focus();}"+
		"return false;" +
		"}var itemtype=document.getElementById('hdnitemtype').value; if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){	if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){" +
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
		"	else{if(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value.toString().indexOf('.') != -1){document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';return false;}}	document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();}}document.getElementById('hdntotaluomqtyentered').value = enteredQty;" +
		"}}</script>";


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
		///Refresh Functionality ends
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> " +
		"</head><body  onkeydown='return OnKeyDown_CL();'> ";

		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Cycle Count - Qty</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Plan#: <label>" + getPlanid + "</label>"+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnPlanid' value=" + getPlanid + ">"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnvPlanLine' value=" + vPlanLine + ">"+
		"				<input type='hidden' name='hdnvPlanItemId' value=" + vPlanItemId + ">"+
		"				<input type='hidden' name='hdnvPlanItemText' value='" + vPlanItemText + "'>"+
		"				<input type='hidden' name='hdnvPlanBin' value=" + vPlanBin + ">"+
		"				<input type='hidden' name='hdnvPlanBinText' value='" + vPlanBinText + "'>"+
		"				<input type='hidden' name='hdnitemType' id='hdnitemtype' value='" + itemType + "'>"+
		"				<input type='hidden' name='hdnvPlanInternalId' value='" + vPlanInternalId + "'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnqtyCheckFlag' id='hdnqtyCheckFlag' value=" + qtyCheckFlag + ">"+
		"				<input type='hidden' name='hdnvPlanStatus' id='hdnvPlanStatus' value=" + vPlanStatus + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value='" + vUnits + "'>"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+	
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + vPlanItemText + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin Location: <label>" + vPlanBinText + "</label>"+
		"			</tr>";

		if(results !=null &&  results !='' && results.length>0)
		{
			var selectedUomStr = request.getParameter('custparam_uomqtyselected');
			nlapiLogExecution('DEBUG', 'selectedUomStr', selectedUomStr);
			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				nlapiLogExecution('ERROR', 'inside', selectedUomStr);

				html = html +"<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox'  id='txtqty0' type='text'/></td><td></td>";

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

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+null+"\",\""+vConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr></table>";	
			}
			else
			{
				nlapiLogExecution('DEBUG', 'else', selectedUomStr);
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
						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+null+"\",\""+vConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr>";
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
			if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty "+ vUnits;
			}
			else
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty " ;
			}
			html = html +"				</td>"+	 
			"			</tr>"+
			"			<tr>"+
			"				<td align = 'left'>" ;

			html= html+"<input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>";

			html= html+ "				</td>"+
			"			</tr>";

		}

		html = html +"<tr><td></td></tr></table>"+

		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='"+btnText+"' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		" 	</table>"+
		"	</form>";
		if(results ==null ||  results =='' || results == 'null')
		{
			html = html +"<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
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
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		var optedEvent = request.getParameter('cmdPrevious');
		var cycArray=new Array();
		nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);

		var getLanguage = request.getParameter('hdngetLanguage');
		cycArray["custparam_language"] = getLanguage;
		nlapiLogExecution('DEBUG', 'getLanguage', cycArray["custparam_language"]);
		cycArray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		cycArray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		cycArray["custparam_lineno"] = request.getParameter('hdnvPlanLine');
		cycArray["custparam_fetcheditemid"] = request.getParameter('hdnvPlanItemId');
		cycArray["custparam_planid"] = request.getParameter('hdnPlanid');
		cycArray["custparam_binlocationid"] = request.getParameter('hdnvPlanBin');
		cycArray["custparam_binlocationname"] = request.getParameter('hdnvPlanBinText');
		cycArray["custparam_itemtype"] = request.getParameter('hdnitemType');
		cycArray["custparam_planinternalid"]=request.getParameter('hdnvPlanInternalId');
		cycArray["custparam_whlocationname"]=request.getParameter('hdnWhLocationName');
		cycArray["custparam_uom"] = request.getParameter('hdnuom');
		cycArray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		cycArray["custparam_VUnitType"] = request.getParameter('hdnVUnitType');
		cycArray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var VUnitType = request.getParameter('hdnVUnitType');
		var st11,st12;
		if( getLanguage == 'es_ES')
		{
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "MainMenu";
		}
		else
		{
			st11 = "INVALID PLAN";
			st12 = "MainMenu";
		}


		var enterQty=request.getParameter('txtqty');
		nlapiLogExecution('DEBUG', 'enterQty',enterQty);
		if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
		{
			enterQty = request.getParameter('hdntotaluomqtyentered');
			cycArray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			nlapiLogExecution('DEBUG', 'cycArray["custparam_uomqtyselected"]',cycArray["custparam_uomqtyselected"]);
			
			/*if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined' && enterQty != 0)
			{
				enterQty = parseFloat(enterQty).toFixed(5);
			}*/
		}
		if(cycArray["custparam_conversionrate"] != null && cycArray["custparam_conversionrate"] != 'null' && cycArray["custparam_conversionrate"] != ''	&& 
				enterQty != null && enterQty != 'null' && enterQty != '' && enterQty != 0 && !isNaN(enterQty))
		{
			enterQty = Big(enterQty).div(cycArray["custparam_conversionrate"]);
			nlapiLogExecution('DEBUG', 'enterQty converted Big',enterQty);
		}

		var FetchedItemId = request.getParameter('hdnvPlanItemId');
		var whLocation = request.getParameter('hdnWhLocation');
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}


				if (optedEvent == 'Back (F7)') {
					nlapiLogExecution('DEBUG', 'PREVIOUS Back Pressed');

					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
					return;
				}
				else
				{
					if((enterQty!=null && enterQty!=''&& enterQty!='null'))
					{


						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
						itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						/*itemfilters.push(new nlobjSearchFilter('location','binnumber','anyof',['@NONE@',whLocation]));*/
						if(whLocation != null && whLocation !='' && whLocation != null)
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
						}
						//itemfilters.push(new nlobjSearchFilter('preferredbin', null, 'is', 'T'));
						var itemcolumns= new Array();

						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, null);							
						nlapiLogExecution('DEBUG', 'itemresults', itemresults); 
						if(itemresults == null || itemresults == '' || itemresults == 'null')
						{
							cycArray["custparam_error"] = 'Entered item is inactive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan', false, cycArray);
							return;
						}

						var validateBin = nswms_GetBinInternalId(cycArray["custparam_binlocationname"],whLocation);
						nlapiLogExecution('DEBUG', 'validateBin', validateBin);
						if(validateBin == null || validateBin =='' || validateBin =='null')
						{
							cycArray["custparam_error"] = 'Entered bin location is inactive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan', false, cycArray);
							return;
						}
						//var vOPenTaskPickBinDetails = getOPenTaskPickBinDetails(FetchedItemId,validateBin,whLocation,VUnitType,cycArray["custparam_uom"]);
						var openTaskBinIdArr = "";
						var openTaskBinQtyArr = "";
						/*if(vOPenTaskPickBinDetails != null && vOPenTaskPickBinDetails != '' && vOPenTaskPickBinDetails.length > 0)
						{
							openTaskBinIdArr = vOPenTaskPickBinDetails[0];
							openTaskBinQtyArr = vOPenTaskPickBinDetails[1];
						}*/
						var vOpenBinQty = 0;
						/*if(openTaskBinIdArr != null && openTaskBinIdArr != "")
						{
							if(openTaskBinIdArr.indexOf(validateBin) != -1)
							{
								vOpenBinQty = openTaskBinQtyArr[openTaskBinIdArr.indexOf(validateBin)];
							}
						}*/
						if(vOpenBinQty == null || vOpenBinQty =='' || vOpenBinQty =='null' || vOpenBinQty =='undefined')
							vOpenBinQty = 0;
						
						/*if(parseFloat(enterQty) < parseFloat(vOpenBinQty))
						{
							cycArray["custparam_error"] = 'Entered qty cannot be less than allocated qty: '+vOpenBinQty;
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan', false, cycArray);
							return;
						}*/
						cycArray["custparam_enterQty"] = Number(enterQty);
						nlapiLogExecution('DEBUG', 'inside enterQty',enterQty);
						if(parseFloat(enterQty)>0)
						{
							if(cycArray["custparam_itemtype"]=='serializedinventoryitem' || cycArray["custparam_itemtype"]=='serializedassemblyitem')
							{
								cycArray["custparam_error"] ='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
								return;
							}
							else if(cycArray["custparam_itemtype"]=='lotnumberedinventoryitem' || cycArray["custparam_itemtype"]=='lotnumberedassemblyitem')
							{
								cycArray["custparam_error"] ='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_lotscan', 'customdeploy_wmsse_cyc_lotscan', false, cycArray);
								return;
							}
						}
						if(inventoryStatusFeature ==true)
						{
							try
							{

								var selectedStatus="";
								var selectedStatusName="";
								var binInternalId = cycArray["custparam_binlocationid"];
								if(cycArray["custparam_itemtype"]== "inventoryitem" || cycArray["custparam_itemtype"]=="assemblyitem")
								{
									var objBinStatusDetails = fnGetInventoryBalanceDetails(cycArray["custparam_whlocation"],FetchedItemId,binInternalId);
									cycArray["custparam_error"] ='';
									nlapiLogExecution('DEBUG', 'objBinStatusDetails', objBinStatusDetails);
									if(objBinStatusDetails != null && objBinStatusDetails != '' && objBinStatusDetails != 'null' && objBinStatusDetails != 'undefined' && objBinStatusDetails != undefined && objBinStatusDetails.length > 0)
									{
										if(objBinStatusDetails.length > 1 && parseFloat(enterQty)>0)
										{
											response.sendRedirect('SUITELET', 'customscript_wmsse_cyclecountinvstatus', 'customdeploy_wmsse_cyclecountinvstatus', false, cycArray);
											return;
										}
										else
										{
											selectedStatus = objBinStatusDetails[0].getValue('status');
											selectedStatusName = objBinStatusDetails[0].getText('status');
										}
									}
									else
									{
										var	inventoryStatusLst = getDefaultInventoryStatusList('',-1,'');
										if(inventoryStatusLst != null && inventoryStatusLst != '' && inventoryStatusLst != 'null' &&
												inventoryStatusLst != 'undefined' && inventoryStatusLst.length > 0) 
										{
											selectedStatus = inventoryStatusLst[0][1];
											selectedStatusName=inventoryStatusLst[0][0];
										}

									}
								}
								if(parseFloat(enterQty)>0)
								{


									var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
									customrecord.setFieldValue('name', 'INVTCYC');
									customrecord.setFieldValue('custrecord_wmsse_ser_ordno', cycArray["custparam_planinternalid"]);
									customrecord.setFieldValue('custrecord_wmsse_ser_ordline', cycArray["custparam_lineno"]);
									customrecord.setFieldValue('custrecord_wmsse_ser_item', cycArray["custparam_fetcheditemid"]);
									customrecord.setFieldValue('custrecord_wmsse_ser_bin', cycArray["custparam_binlocationid"]);
									customrecord.setFieldValue('custrecord_wmsse_ser_qty', Number(Big(enterQty).toFixed(8)));

									if(selectedStatus !=null && selectedStatus !='' && selectedStatus !='null' && selectedStatus !='undefined'
										&& selectedStatus !=undefined)
										customrecord.setFieldValue('custrecord_serial_inventorystatus', selectedStatus);
									customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
									var rec = nlapiSubmitRecord(customrecord, false, true);

									var vRecid=inventoryCountCYCC(cycArray["custparam_planinternalid"],cycArray["custparam_lineno"],Number((Big(enterQty).plus(vOpenBinQty)).toFixed(8)),cycArray["custparam_itemtype"],
											cycArray["custparam_fetcheditemid"],cycArray["custparam_whlocation"],null,selectedStatus);
									nlapiLogExecution('DEBUG', 'vRecid',vRecid);
									if(vRecid=='INVALID_KEY_OR_REF')
									{ 
										cycArray["custparam_error"] ='Inventory Status not Available for Inventory Count #'+cycArray["custparam_planid"];
										response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
										return;
									}

									var filterssertemp1 = new Array();
									var serialArray='';
									filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
									filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', cycArray["custparam_lineno"]);

									filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', cycArray["custparam_planinternalid"]);
									var columnssertemp1 = new Array();
									//columnssertemp1.push(new nlobjSearchColumn('custrecord_wmsse_ser_no'));
									columnssertemp1.push(new nlobjSearchColumn('custrecord_wmsse_ser_bin'));
									columnssertemp1.push(new nlobjSearchColumn('custrecord_wmsse_ser_qty'));
									//columnssertemp1.push(new nlobjSearchColumn('name'));
									columnssertemp1.push(new nlobjSearchColumn('custrecord_serial_inventorystatus'));
									var SrchRecordTmpLot1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,columnssertemp1);
									if(SrchRecordTmpLot1!=null && SrchRecordTmpLot1!='')
									{
										var filters = new Array();
										var columns = new Array();
										filters.push(new nlobjSearchFilter('name', null, 'is', cycArray["custparam_planid"]));
										filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [31]));
										filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [7]));
										if(cycArray["custparam_lineno"]!=null && cycArray["custparam_lineno"]!='' && cycArray["custparam_lineno"]!='undefined')
											filters.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', cycArray["custparam_lineno"]));
										if(cycArray["custparam_fetcheditemid"]!=null && cycArray["custparam_fetcheditemid"]!='' && cycArray["custparam_fetcheditemid"]!='undefined')
											filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', cycArray["custparam_fetcheditemid"]));
										var vOpentaskPlanDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentask_search', filters, columns);
										if(vOpentaskPlanDetails !=null && vOpentaskPlanDetails!='' && vOpentaskPlanDetails.length > 0)
										{
											nlapiLogExecution('DEBUG', 'vOpentaskPlanDetails.length', vOpentaskPlanDetails.length);
											for(var delOpenItr=0;delOpenItr<vOpentaskPlanDetails.length;delOpenItr++)
											{
												var vRecId=vOpentaskPlanDetails[delOpenItr].getId();

												var id = nlapiDeleteRecord('customrecord_wmsse_trn_opentask', vRecId);

											}
										}
										nlapiLogExecution('DEBUG', 'SrchRecordTmpLot1.length',SrchRecordTmpLot1.length);
										for(var invUpdateItr=0;invUpdateItr<SrchRecordTmpLot1.length;invUpdateItr++)
										{
											var vInvQty=SrchRecordTmpLot1[invUpdateItr].getValue('custrecord_wmsse_ser_qty');
											var vInvStatus=SrchRecordTmpLot1[invUpdateItr].getValue('custrecord_serial_inventorystatus');
											var openTaskId=updateCycleCountOpenTask(cycArray["custparam_planinternalid"],
													cycArray["custparam_fetcheditemid"],cycArray["custparam_lineno"],vInvQty,
													cycArray["custparam_binlocationid"],cycArray["custparam_itemtype"],
													cycArray["custparam_whlocation"],'',vRecid,cycArray["custparam_planid"],
													cycArray["custparam_actualbegintime"],cycArray["custparam_uom"],cycArray["custparam_conversionrate"],'','',vInvStatus);
											var TempRecord=SrchRecordTmpLot1[invUpdateItr];
											var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
											tempSerial.setFieldValue('id', TempRecord.getId());
											tempSerial.setFieldValue('name', TempRecord.getValue('name'));
											tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of Inv Item is processed for CYCC we have marked this Inv Item as closed');
											tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
											nlapiSubmitRecord(tempSerial);
											TempRecord=null;
											tempSerial=null;
										}
									}
									SrchRecordTmpLot1=null;
									filterssertemp1=null;
									columnssertemp1=null;
								}
								else
								{

									var vRecid=inventoryCountCYCC(cycArray["custparam_planinternalid"],cycArray["custparam_lineno"],Number((Big(enterQty).plus(vOpenBinQty)).toFixed(8)),'','',cycArray["custparam_whlocation"]);
									nlapiLogExecution('DEBUG', 'vRecid',vRecid);
									var openTaskId=updateCycleCountOpenTask(cycArray["custparam_planinternalid"],cycArray["custparam_fetcheditemid"],cycArray["custparam_lineno"],Number(Big(enterQty).toFixed(8)),cycArray["custparam_binlocationid"],cycArray["custparam_itemtype"],cycArray["custparam_whlocation"],'',vRecid,cycArray["custparam_planid"],cycArray["custparam_actualbegintime"],cycArray["custparam_uom"],cycArray["custparam_conversionrate"],vOpenBinQty);
									nlapiLogExecution('DEBUG', 'open task updated successfully openTaskId',openTaskId);
								}
							}
							catch(e)
							{


								var errStr = '';
								if (e instanceof nlobjError) 
								{	
									errStr = e.getDetails();
								}
								else
								{
									errStr = e.toString();
								}

								nlapiLogExecution('ERROR', 'Exception in Cycle Count',errStr);
								cycArray["custparam_error"] = errStr;
								response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan', false, cycArray);
								return;
							}
						}
						else
						{
							var vRecid=inventoryCountCYCC(cycArray["custparam_planinternalid"],cycArray["custparam_lineno"],Number((Big(enterQty).plus(vOpenBinQty)).toFixed(8)),'','',cycArray["custparam_whlocation"]);
							nlapiLogExecution('DEBUG', 'vRecid',vRecid);
							var openTaskId=updateCycleCountOpenTask(cycArray["custparam_planinternalid"],cycArray["custparam_fetcheditemid"],cycArray["custparam_lineno"],Number(Big(enterQty).toFixed(8)),cycArray["custparam_binlocationid"],cycArray["custparam_itemtype"],cycArray["custparam_whlocation"],'',vRecid,cycArray["custparam_planid"],cycArray["custparam_actualbegintime"],cycArray["custparam_uom"],cycArray["custparam_conversionrate"],vOpenBinQty);
							nlapiLogExecution('DEBUG', 'open task updated successfully openTaskId',openTaskId);
						}

						var count=0;
						var arrPlandetails=getPlanDetails(cycArray["custparam_planid"],null,null,null);
						if(arrPlandetails!=null && arrPlandetails!='' && arrPlandetails.length>0)
						{
							nlapiLogExecution('DEBUG','arrPlandetails.length',arrPlandetails.length);
							for(var p=0;p<arrPlandetails.length;p++)
							{
								var vPlanCountQty=arrPlandetails[p].getValue('quantity');
								if(vPlanCountQty==null || vPlanCountQty=='')
								{
									count=parseFloat(count)+1;
								}
							}
							arrPlandetails=null;
							nlapiLogExecution('DEBUG','parseInt(count)',parseInt(count));
							if(parseInt(count)>0)
							{
								cycArray["custparam_error"] ='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_itemscan', 'customdeploy_wmsse_cyc_itemscan', false, cycArray);
								return;
							}
							else
							{
								cycArray["custparam_error"] ='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
								return;
							}
						}
						else
						{
							cycArray["custparam_error"] ='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
							return;
						}
					}
					else
					{
						cycArray["custparam_error"] ='Please enter valid qty';
						response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan', false, cycArray);
						return;

					}
				}
			}
			catch(e)
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

				if ( e instanceof nlobjError )
				{
					cycArray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					cycArray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}

				response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan', false, cycArray);
				return;
			}
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			cycArray["custparam_error"]="Transaction is in progress...";
			response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan', false, cycArray);
			return;
		}

	}
}