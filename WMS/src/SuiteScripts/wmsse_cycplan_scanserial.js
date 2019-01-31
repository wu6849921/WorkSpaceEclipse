/**
 * Script Description
 * This script is used for Cycle count plan serial number scanning
 */
/***************************************************************************
 Copyright 锟� 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function to scan serial numbers in cycle count record process. 
 */
function SerialScan(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		var getOptedField = request.getParameter('custparam_option');

		var getPlanid =request.getParameter('custparam_planid');
		var whLocation = request.getParameter('custparam_whlocation');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var getSerialArr = request.getParameter('custparam_serialno');
		var vPlanLine=request.getParameter('custparam_lineno');
		var vPlanItemId=request.getParameter('custparam_fetcheditemid');
		var vPlanItemText=request.getParameter('custparam_fetcheditemname');
		var vPlanBin=request.getParameter('custparam_binlocationid');
		var vPlanBinText=request.getParameter('custparam_binlocationname');
		var itemType=request.getParameter('custparam_itemtype');
		var vPlanInternalId=request.getParameter('custparam_planinternalid');
		var st0,st1,st2,st3;
		var domainName = fndomainName();

		var whLocationName = request.getParameter('custparam_whlocationname');
		var vUnits = request.getParameter('custparam_uom');
		var vConversionRate = request.getParameter('custparam_conversionrate');

		var VUnitType = request.getParameter('custparam_VUnitType');
		var selecteduomswithqty = request.getParameter('custparam_uomqtyselected');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		//To check Inventory Status Enable/Disable feature
		var inventoryStatusFeature = isInvStatusFeatureEnabled();	

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

		//To Bind the status from inventory status respective of item and bin combinations.			
		if(inventoryStatusFeature == true)
		{
			var invfilterStrat =  new Array();
			if(whLocation != null && whLocation != '' && whLocation != 'null')
				invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
			if(vPlanItemId != null && vPlanItemId != '' && vPlanItemId != 'null')
				invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', vPlanItemId));
			if(vPlanBin!= null && vPlanBin!= '' && vPlanBin!= 'null')
				invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', vPlanBin));		
			var vStatusDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh',invfilterStrat, null);
			var statusSelectArr = new Array();
			if(vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != null)
			{
				for(var statusDetailsItr=0; statusDetailsItr<vStatusDetails.length; statusDetailsItr++)
				{
					if(vStatusDetails.length>1 && statusDetailsItr==0)
					{
						statusSelectArr.push(" ");
					}
					var vStatus = vStatusDetails[statusDetailsItr].getText('status',null,'group');
					var vStatusId = vStatusDetails[statusDetailsItr].getValue('status',null,'group');
					var currRowStatus = [vStatus,vStatusId];
					statusSelectArr.push(currRowStatus);
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

					var currRowStatus = [selectedStatusName,selectedStatus];
					statusSelectArr.push(currRowStatus);
				}

			}
		}

		var getNumber = request.getParameter('custparam_number');
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;

		var getItemRemQty = request.getParameter('custparam_enterQty');
		var getItemRecQty = getNumber;
		var enterQty = request.getParameter('custparam_enterQty');


		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',vPlanItemId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
		if(itemresults!=null && itemresults!='')
		{
			vPlanItemText = itemresults[0].getValue('itemid');
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');


		nlapiLogExecution('DEBUG', 'CSSfilefound', CSSfilefound);
		var st0 = domainName + '-CC Inventory';

		if(getNumber == null || getNumber == '' || parseInt(getNumber)==0)
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
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item');
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />"+
		"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";

		// To handle double click of Key board Enter Button
		html = html + "<SCRIPT LANGUAGE='javascript' for='window' EVENT='onload()'>";  
		html = html + "function stopRKey(evt) { ";
		html = html + "	  var evt = (evt) ? evt : ((event) ? event : null); ";
		html = html + "	  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);"; 
		html = html + "	  if ((evt.keyCode == 13) && ((node.type=='text') || (node.type=='submit'))){";
		html = html + "	  if(document.getElementById('loading').style.display !='none'){";
		html = html + "	  alert('System Processing, Please wait...');";
		html = html + "	  return false;}} ";
		html = html + "	} ";
		html = html + "	document.onkeypress = stopRKey; ";
		html = html + "</script>";
		html = html +"	<script type='text/javascript'>function validateForm() { var patt = /[*|,\":<>{}`\';()@&$#%/ /]/g;var lotVal=document.getElementById('txtserial').value; var vLotWhiteSpace = lotVal.indexOf(' ') >= 0; var inventoryStatusFeature =document.getElementById('hdninventoryStatusFeature').value; if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;} else if((inventoryStatusFeature==true || inventoryStatusFeature=='true') && (document.getElementById('inventorystatuslist').value == 'undefined' || document.getElementById('inventorystatuslist').value == '' || document.getElementById('inventorystatuslist').value == 'null')){document.getElementById('div_error').innerHTML ='Please enter valid status';return false;}" +
		"else{var sessionObj = document.getElementById('hdnsession').value;if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';return false;}else{document.getElementById('hdnsession').value = 'session';document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true; return true;}}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";

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
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Cycle Count - Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<table>"+
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
		"				<input type='hidden' name='hdnitemType' value='" + itemType + "'>"+
		"				<input type='hidden' name='hdnvPlanInternalId' value='" + vPlanInternalId + "'>"+
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' value=" + selecteduomswithqty + ">"+
		"				<input type='hidden' name='hdninventoryStatusFeature' id='hdninventoryStatusFeature' value=" + inventoryStatusFeature + ">"+		
		"				<input type='hidden' name='hdnsession' id='hdnsession'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + vPlanItemText + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin Location: <label>" + vPlanBinText + "</label>"+
		"			</tr>"+
		"			<tr>";
		if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
		{
			html = html +"<td align = 'left' class='labelmsg'>Qty: <label>" + getItemRemQty + "</label>"+" In "+ vUnits;
		}
		else
		{
			html = html +"<td align = 'left' class='labelmsg'>Qty: <label>" + getItemRemQty + "</label>";
		}

		html = html +"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Scanned Qty: <label>" + getItemRecQty + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (Number(getNumber) + 1) + " OF <label>" + Number(Big(getItemRemQty).mul(vConversionRate)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";

		html = html + "	<td align = 'left'><input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>";

		html = html + "				</td>"+
		"			</tr><tr><td></td></tr></table>";

		//to Bind available inventory status in drop down
		html = html +"			<table>";
		if(statusSelectArr != null && statusSelectArr != '' && statusSelectArr != 'null' &&
				statusSelectArr != 'undefined' && statusSelectArr.length > 0) 
		{			
			html = html +"			<tr>";
			html = html +"	<td align = 'left' class='labelmsg'>Inv Status ";

			html=html+"</td></tr>";
			html = html +"			<tr><td>";
			html = html +"<select id='inventorystatuslist' class='labelmsg'  name = 'inventorystatuslist' >" ;
			for(var statusItr=0; statusItr < statusSelectArr.length; statusItr++)
			{                    	 
				var vInventoryStatus = statusSelectArr[statusItr][0];
				var vStatusId =statusSelectArr[statusItr][1];

				html = html +" <option     value="+vStatusId+"> "+vInventoryStatus+"</option>";	
			}
			html=html+"</select></td></tr>"+
			"<input type='hidden' id='hdnvId' name='hdnvId' value=" + vStatusId + ">";
		}
		html = html +"			</table>";

		html = html +"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";
		html = html + "</td></tr></table></form>"+

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
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating CYCC Serial');

		//To get selected status
		var vStatusId = request.getParameter('inventorystatuslist');	

		//To get the inventory status feature enable/disable
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		// Forming the temporary array cycArray
		var cycArray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtserial');
		var FetchedItemId = request.getParameter('hdnvPlanItemId');
		var whLocation = request.getParameter('hdnWhLocation');
		var optedEvent = request.getParameter('cmdPrevious');
		cycArray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		cycArray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		cycArray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		var getLanguage = request.getParameter('hdngetLanguage');
		cycArray["custparam_language"] = getLanguage;
		nlapiLogExecution('DEBUG', 'getLanguage', cycArray["custparam_language"]);
		cycArray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		cycArray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		cycArray["custparam_lineno"] = request.getParameter('hdnvPlanLine');
		cycArray["custparam_fetcheditemid"] = request.getParameter('hdnvPlanItemId');
		cycArray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		cycArray["custparam_planid"] = request.getParameter('hdnPlanid');
		cycArray["custparam_binlocationid"] = request.getParameter('hdnvPlanBin');
		cycArray["custparam_binlocationname"] = request.getParameter('hdnvPlanBinText');
		cycArray["custparam_itemtype"] = request.getParameter('hdnitemType');
		cycArray["custparam_planinternalid"]=request.getParameter('hdnvPlanInternalId');
		cycArray["custparam_whlocationname"]=request.getParameter('hdnWhLocationName');
		cycArray["custparam_uom"] = request.getParameter('hdnuom');
		cycArray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		nlapiLogExecution('DEBUG', 'cycArray["custparam_conversionrate"]1', cycArray["custparam_conversionrate"]);
		cycArray["custparam_VUnitType"] = request.getParameter('hdnVUnitType');
		cycArray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		cycArray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var VUnitType = request.getParameter('hdnVUnitType');
		var remQty=request.getParameter('hdnenterQty');
		var getNumber=request.getParameter('hdnNumber');
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

					if(getSerialNo!=null && getSerialNo!="" && getSerialNo!='null')
					{
						//To validate if the entered status is null
						if((inventoryStatusFeature == true) && (vStatusId == 'null' || vStatusId == null || vStatusId == '' || vStatusId == 'undefined' ||
								vStatusId == undefined))
						{
							cycArray["custparam_error"] = 'Please enter valid status';
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
							return;
						}


						var arrPlandetails=getPlanDetails(cycArray["custparam_planid"],null,null,null);
						nlapiLogExecution('DEBUG', 'arrPlandetails', arrPlandetails);
						if(arrPlandetails==null || arrPlandetails=='' || arrPlandetails =='null' || arrPlandetails.length == 0)
						{
							nlapiLogExecution('DEBUG', 'Empty Plan results for Plan No', cycArray["custparam_planid"]);
							cycArray["custparam_error"] = "Plan# "+cycArray["custparam_planid"]+" is deleted";
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
							return;
						}

						//checking serial no's in already scanned one's from temp table
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', cycArray["custparam_lineno"]));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', cycArray["custparam_planinternalid"]));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', cycArray["custparam_binlocationid"]));
						var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp);

						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{
							nlapiLogExecution('DEBUG', 'Inside if', SrchRecordTmpSerial);
							cycArray["custparam_error"] = "Serial# already scanned";
							SrchRecordTmpSerial=null;
							filterssertemp=null;
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
							return;
						}
						if(inventoryStatusFeature == true)
							var isSerialExistsInInventory = isInventoryNumberExistsCYCCbystatus(cycArray["custparam_fetcheditemid"],getSerialNo,
									cycArray["custparam_whlocation"],cycArray["custparam_binlocationid"],vStatusId);
						else
							var isSerialExistsInInventory = isInventoryNumberExistsCYCC(cycArray["custparam_fetcheditemid"],getSerialNo,
									cycArray["custparam_whlocation"],cycArray["custparam_binlocationid"]);
						nlapiLogExecution('DEBUG', 'isSerialExistsInInventory',isSerialExistsInInventory);
						if(isSerialExistsInInventory)
						{
							cycArray["custparam_error"] = 'This serial# already exists in inventory';
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
							return; 
						}
						/*else {
							nlapiLogExecution('ERROR', 'Inside else', getSerialNo);
							cycArray["custparam_serialno"] = getSerialNo;*/

						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
						itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
						/*itemfilters.push(new nlobjSearchFilter('location','binnumber','anyof',['@NONE@',whLocation]));*/
						if(whLocation != null && whLocation !='' && whLocation != null)
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
						}
						var itemcolumns= new Array();

						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);							
						nlapiLogExecution('DEBUG', 'itemresults', itemresults); 
						if(itemresults == null || itemresults == '' || itemresults == 'null')
						{
							cycArray["custparam_error"] = 'Entered item is inactive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
							return;
						}
						var validateBin = nswms_GetBinInternalId(cycArray["custparam_binlocationname"],whLocation);
						nlapiLogExecution('DEBUG', 'validateBin', validateBin);
						if(validateBin == null || validateBin =='' || validateBin =='null')
						{
							cycArray["custparam_error"] = 'Entered bin location is inactive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
							return;
						}

						cycArray["custparam_serialno"] = getSerialNo;
						cycArray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', getSerialNo);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordno', cycArray["custparam_planinternalid"]);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordline', cycArray["custparam_lineno"]);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', cycArray["custparam_fetcheditemid"]);
						customrecord.setFieldValue('custrecord_wmsse_ser_bin', cycArray["custparam_binlocationid"]);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
						customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						if(inventoryStatusFeature == true)
							customrecord.setFieldValue('custrecord_serial_inventorystatus', vStatusId);

						var rec = nlapiSubmitRecord(customrecord, false, true);
						customrecord=null;
						nlapiLogExecution('ERROR', '(getNumber + 1)', (parseInt(getNumber) + 1));
						nlapiLogExecution('ERROR', 'remQty', remQty);
						nlapiLogExecution('ERROR', 'parseInt(cycArray["custparam_conversionrate"]', parseInt(cycArray["custparam_conversionrate"]));

						var logmsg = '(getNumber + 1). = ' + (parseInt(getNumber) + 1) + '<br>';
						logmsg = logmsg + 'remQty. = ' + remQty + '<br>';	
						logmsg = logmsg + 'parseInt(cycArray["custparam_conversionrate"]. = ' + parseInt(cycArray["custparam_conversionrate"]) + '<br>';	

						nlapiLogExecution('DEBUG', 'cycplan status values :', logmsg);

						if ((parseInt(getNumber) + 1) < Big(remQty).mul(cycArray["custparam_conversionrate"])) {

							nlapiLogExecution('DEBUG', 'Scanning Serial No.');
							cycArray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
							return;

						}
						else
						{
							nlapiLogExecution('DEBUG', 'FetchedItemId', FetchedItemId);
							try{
								//To create serial entry and open task record according to the inventory status
								if(inventoryStatusFeature == true)
								{
									var serialArrayArr=new Array();
									var vSerialQtyArr = new Array();
									var vSerialStatustextArr = new Array();
									var vStatusIDArr = new Array();
									var serialDetailsArr = new Array();
									var filterssertemp1 = new Array();
									var serialArray='';
									filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
									filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', cycArray["custparam_lineno"]);

									filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', cycArray["custparam_planinternalid"]);

									var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry','customsearch_wmsse_serialdetails_search',filterssertemp1);
									if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!='')
									{
										var filters = new Array();
										filters.push(new nlobjSearchFilter('name', null, 'is', cycArray["custparam_planid"]));
										filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [31]));
										filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [7]));
										if(cycArray["custparam_lineno"]!=null && cycArray["custparam_lineno"]!='' && cycArray["custparam_lineno"]!='undefined')
											filters.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', cycArray["custparam_lineno"]));
										if(cycArray["custparam_fetcheditemid"]!=null && cycArray["custparam_fetcheditemid"]!='' && cycArray["custparam_fetcheditemid"]!='undefined')
											filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', cycArray["custparam_fetcheditemid"]));
										var vOpentaskPlanDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentask_search', filters);
										if(vOpentaskPlanDetails !=null && vOpentaskPlanDetails!='' && vOpentaskPlanDetails.length > 0)
										{

											for(var p=0;p<vOpentaskPlanDetails.length;p++)
											{
												var vRecId=vOpentaskPlanDetails[p].getId();

												var id = nlapiDeleteRecord('customrecord_wmsse_trn_opentask', vRecId);
											}
										}

										for(var zserialItr=0;zserialItr<SrchRecordTmpSerial1.length;zserialItr++)
										{
											var vSerialQty=SrchRecordTmpSerial1[zserialItr].getValue('custrecord_wmsse_ser_qty');
											var vSerialNum=SrchRecordTmpSerial1[zserialItr].getValue('custrecord_wmsse_ser_no');
											var vStatus=SrchRecordTmpSerial1[zserialItr].getValue('custrecord_serial_inventorystatus');
											var vStatusText=SrchRecordTmpSerial1[zserialItr].getText('custrecord_serial_inventorystatus');
											if(vStatusIDArr.indexOf(vStatus) == -1)
											{
												vStatusIDArr.push(vStatus);
												vSerialQtyArr.push(vSerialQty);
												serialArrayArr.push(vSerialNum);
												vSerialStatustextArr.push(vStatusText);
											}
											else
											{
												if(vStatusIDArr.length > 0 && vStatusIDArr.indexOf(vStatus) != -1)
												{
													var ind = vStatusIDArr.indexOf(vStatus);
													var tempQty = vSerialQtyArr[ind];
													var tempSerial = serialArrayArr[ind];
													var totalSerial = tempSerial +","+vSerialNum;
													var totalLotQty = Number(Big(tempQty).plus(vSerialQty));
													vSerialQtyArr[ind] = totalLotQty;
													serialArrayArr[ind] = totalSerial;
													vStatusIDArr[ind] = vStatus;
													vSerialStatustextArr[ind]=vStatusText;
												}
												else
												{
													vStatusIDArr.push(vStatus);
													vSerialQtyArr.push(vSerialQty);
													serialArrayArr.push(vSerialNum);
													vSerialStatustextArr.push(vStatusText);
												}
											}
											var row1=[vStatusIDArr,vSerialQtyArr,serialArrayArr,vSerialStatustextArr];
										}
										serialDetailsArr.push(row1);

										var serialStatusArr = "";
										var serialQtyArr = "";
										var serialArr = "";
										var serialsttextArr = "";
										var openStatusqty = 0;
										var statusForOpenPicks = new Array();
										if(serialDetailsArr != null && serialDetailsArr!='' && serialDetailsArr.length > 0)
										{
											for(var z=0;z<serialDetailsArr.length;z++)
											{
												serialStatusArr = serialDetailsArr[z][0];
												serialQtyArr = serialDetailsArr[z][1];
												serialArr = serialDetailsArr[z][2];
												serialsttextArr = serialDetailsArr[z][3];
											}
											if(serialStatusArr != null && serialStatusArr!='' && serialStatusArr.length > 0)
											{
												for(var statsItr=0;statsItr<serialStatusArr.length;statsItr++)
												{
													statusForOpenPicks.push(serialStatusArr[statsItr]);

													var vBinOpenTaskDetails = getOPenTaskPickBinDetailsSerialbyStatus(cycArray["custparam_fetcheditemid"],
															cycArray["custparam_binlocationid"],whLocation,VUnitType,cycArray["custparam_uom"],
															serialStatusArr[statsItr]);
													var vBinOpenTaskSerialArr = "";
													var vBinOpenTaskBinIdArr = "";
													var vBinOpenTaskBinQtyArr = "";
													if(vBinOpenTaskDetails != null && vBinOpenTaskDetails!='' && vBinOpenTaskDetails.length > 0)
													{
														vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
														vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
														vBinOpenTaskSerialArr = vBinOpenTaskDetails[3];
													}
													var vOpenBinQty=0;
													for(var m1=0;m1<vBinOpenTaskBinQtyArr.length;m1++)
													{
														var vnOpenBinQty = vBinOpenTaskBinQtyArr[m1];
														vOpenBinQty = Number(Big(vOpenBinQty).plus(vnOpenBinQty));
														nlapiLogExecution('DEBUG', 'vOpenBinQty big',vOpenBinQty);
													}
													if(openStatusqty == null || openStatusqty=='' || openStatusqty==0)
													{
														openStatusqty = vOpenBinQty;
													}
													else
													{
														openStatusqty = Number(Big(openStatusqty).plus(vOpenBinQty));
														nlapiLogExecution('DEBUG', 'openStatusqty big',openStatusqty);
													}

													var openTaskId =updateCycleCountOpenTask(cycArray["custparam_planinternalid"],
															cycArray["custparam_fetcheditemid"],cycArray["custparam_lineno"],
															Number(Big(serialQtyArr[statsItr]).toFixed(8)),cycArray["custparam_binlocationid"],cycArray["custparam_itemtype"],
															cycArray["custparam_whlocation"],'',cycArray["custparam_planinternalid"],
															cycArray["custparam_planid"],cycArray["custparam_actualbegintime"],
															cycArray["custparam_uom"],cycArray["custparam_conversionrate"],
															Number(Big(vOpenBinQty).toFixed(8)),vBinOpenTaskSerialArr,serialStatusArr[statsItr]);
												}
											}

											var StatusForItem = new Array();
											StatusForItemArr = getStatusesforPlanItem(whLocation,FetchedItemId,cycArray["custparam_binlocationid"]);

											if(StatusForItemArr != null && StatusForItemArr!='' && StatusForItemArr.length > 0)
											{
												var qtyforopen = 0;
												for(var statsItrr=0;statsItrr<StatusForItemArr.length;statsItrr++)
												{
													var statusArr=StatusForItemArr[statsItrr];
													if(statusForOpenPicks.indexOf(statusArr)== -1)												
													{
														var vBinOpenTaskDetails = getOPenTaskPickBinDetailsSerialbyStatus(cycArray["custparam_fetcheditemid"],
																cycArray["custparam_binlocationid"],whLocation,VUnitType,cycArray["custparam_uom"],statusArr);

														var vBinOpenTaskSerialArr = "";
														var vBinOpenTaskBinIdArr = "";
														var vBinOpenTaskBinQtyArr = "";
														if(vBinOpenTaskDetails != null && vBinOpenTaskDetails!='' && vBinOpenTaskDetails.length > 0)
														{
															vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
															vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
															vBinOpenTaskSerialArr = vBinOpenTaskDetails[3];
														}
														var vOpenBinQty=0;
														for(var m1=0;m1<vBinOpenTaskBinQtyArr.length;m1++)
														{
															var vnOpenBinQty = vBinOpenTaskBinQtyArr[m1];
															vOpenBinQty = Number(Big(vOpenBinQty).plus(vnOpenBinQty));
															nlapiLogExecution('DEBUG', 'vOpenBinQty big',vOpenBinQty);
														}
														if(openStatusqty == null || openStatusqty=='' || openStatusqty==0)
														{
															openStatusqty = vOpenBinQty;
														}
														else
														{
															openStatusqty = Number(Big(openStatusqty).plus(vOpenBinQty));
															nlapiLogExecution('DEBUG', 'openStatusqty big',openStatusqty);

														}

														if(vOpenBinQty!=0 && vOpenBinQty>0)
														{
															var openTaskId =updateCycleCountOpenTask(cycArray["custparam_planinternalid"],
																	cycArray["custparam_fetcheditemid"],cycArray["custparam_lineno"],
																	Number(Big(qtyforopen).toFixed(8)),cycArray["custparam_binlocationid"],cycArray["custparam_itemtype"],
																	cycArray["custparam_whlocation"],'',cycArray["custparam_planinternalid"],
																	cycArray["custparam_planid"],cycArray["custparam_actualbegintime"],
																	cycArray["custparam_uom"],cycArray["custparam_conversionrate"],
																	Number(Big(vOpenBinQty).toFixed(8)),vBinOpenTaskSerialArr,statusArr);
															serialStatusArr.push(statusArr);
														}
													}
												}
											}
											var vRecid=inventoryCountCYCC(cycArray["custparam_planinternalid"],
													cycArray["custparam_lineno"],Number((Big(remQty).plus(openStatusqty)).toFixed(8)),
													cycArray["custparam_itemtype"],cycArray["custparam_fetcheditemid"],
													cycArray["custparam_whlocation"],'',serialStatusArr,cycArray["custparam_binlocationid"],
													VUnitType,cycArray["custparam_uom"]);


											nlapiLogExecution('DEBUG', 'vRecid',vRecid);
											if(vRecid=='INVALID_KEY_OR_REF')
											{ 
												cycArray["custparam_error"] ='Inventory Status not Available for Inventory Count #'+cycArray["custparam_planid"];
												response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_plan', 'customdeploy_wmsse_cyc_plan', false, cycArray);
												return;
											}
										}
										var count=0;
										var arrPlandetails=getPlanDetails(cycArray["custparam_planid"],null,null,null);
										if(arrPlandetails!=null && arrPlandetails!='' && arrPlandetails.length>0)
										{

											for(var p=0;p<arrPlandetails.length;p++)
											{
												var vPlanCountQty=arrPlandetails[p].getValue('quantity');
												if(vPlanCountQty==null || vPlanCountQty=='')
												{
													count=parseFloat(count)+1;
												}
											}
											arrPlandetails=null;

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
								}
								else
								{
									var vBinOpenTaskDetails = getOPenTaskPickBinDetailsSerial(cycArray["custparam_fetcheditemid"],cycArray["custparam_binlocationid"],whLocation,VUnitType,cycArray["custparam_uom"]);

									var vBinOpenTaskSerialArr = "";
									var vBinOpenTaskBinIdArr = "";
									var vBinOpenTaskBinQtyArr = "";
									if(vBinOpenTaskDetails != null && vBinOpenTaskDetails!='' && vBinOpenTaskDetails.length > 0)
									{
										vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
										vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
										vBinOpenTaskSerialArr = vBinOpenTaskDetails[3];
									}
									var vOpenBinQty=0;
									for(var m1=0;m1<vBinOpenTaskBinQtyArr.length;m1++)
									{
										var vnOpenBinQty = vBinOpenTaskBinQtyArr[m1];
										vOpenBinQty = Number(Big(vOpenBinQty).plus(vnOpenBinQty));

									}
									nlapiLogExecution('DEBUG', 'vOpenBinQty',vOpenBinQty);
									var openTaskId=updateCycleCountOpenTask(cycArray["custparam_planinternalid"],
											cycArray["custparam_fetcheditemid"],cycArray["custparam_lineno"],
											Number(Big(remQty).toFixed(8)),cycArray["custparam_binlocationid"],
											cycArray["custparam_itemtype"],cycArray["custparam_whlocation"],'',cycArray["custparam_planinternalid"],
											cycArray["custparam_planid"],cycArray["custparam_actualbegintime"],cycArray["custparam_uom"],
											cycArray["custparam_conversionrate"],Number(Big(vOpenBinQty).toFixed(8)),
											vBinOpenTaskSerialArr);
									nlapiLogExecution('DEBUG', 'open task updated successfully openTaskId',openTaskId);

									var vRecid=inventoryCountCYCC(cycArray["custparam_planinternalid"],
											cycArray["custparam_lineno"], Number((Big(remQty).plus(vOpenBinQty)).toFixed(8)),
											cycArray["custparam_itemtype"],cycArray["custparam_fetcheditemid"],
											cycArray["custparam_whlocation"],vBinOpenTaskDetails);

									nlapiLogExecution('DEBUG', 'vRecid',vRecid);


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
							}				
							catch(e)
							{
								nlapiLogExecution('DEBUG', 'inside catch exception', e);
								cycArray["custparam_number"] = parseFloat(cycArray["custparam_number"]) - 1;
								cycArray["custparam_error"] = e;
								response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
								return;
							}
						}
					}
					else
					{
						cycArray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
					}
				} 
				else {
					cycArray["custparam_error"] = "";
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan', false, cycArray);
				}
			}
			catch(e)
			{
				cycArray["custparam_error"]=e;
				response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_serialscan', 'customdeploy_wmsse_cyc_serialscan', false, cycArray);
			return;
		}
	} //end of first if condition
} //end of function.

function isInventoryNumberExistsCYCC(item,serial,location,binlocation)
{
	var boolfound = false;
	var str='item :'+item;
	str=str + 'serial :'+serial;
	str=str + 'location :'+location;
	str=str + 'binlocation :'+binlocation;
	nlapiLogExecution('DEBUG', 'str ', str);

	var filterStrat = new Array();
	if(binlocation != null && binlocation != '')
		filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','noneof', binlocation));
	filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', item));
	filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', location));
	filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', serial));
	filterStrat.push(new nlobjSearchFilter('quantityonhand','inventoryNumberBinOnHand','greaterthan',0));

	var columnStrat=new Array();
	columnStrat.push(new nlobjSearchColumn('quantityavailable','inventoryNumberBinOnHand'));
	columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
	columnStrat[0].setSort(true);

	var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

	if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0)
	{

		boolfound = true;
	}

	return boolfound ;
}

//To check whether entered serial number with inventory status combination is valid or not
function isInventoryNumberExistsCYCCbystatus(item,serial,location,binlocation,vStatusId)
{
	var boolfound = false;
	var vinventoryNumberBinOnHand;
	var str='item :'+item;
	str=str + ' serial :'+serial;
	str=str + ' location :'+location;
	str=str + ' binlocation :'+binlocation;
	str=str + ' vStatusId :'+vStatusId;
	nlapiLogExecution('ERROR', 'str ', str);

	var filterStrat = new Array();
	if(binlocation!= null && binlocation!= '')
		filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand','anyof', binlocation));
	filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', item));
	filterStrat.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', location));
	filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand', 'is', serial));

	var columnStrat=new Array();
	columnStrat.push(new nlobjSearchColumn('inventorynumber','inventoryNumberBinOnHand'));
	columnStrat[0].setSort(true);						

	var objBinDetails_id = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);
	//Only One id will be fetched hence not changing it to Load search

	if(objBinDetails_id!=null && objBinDetails_id!='')
	{
		nlapiLogExecution('DEBUG', 'objBinDetails', objBinDetails_id.length);
		if(objBinDetails_id.length>0)
		{

			vinventoryNumberBinOnHand=objBinDetails_id[0].getValue('inventorynumber','inventoryNumberBinOnHand');

			var filterInvBal = new Array();

			filterInvBal.push(new nlobjSearchFilter('item',null, 'anyof', item));
			filterInvBal.push(new nlobjSearchFilter('location',null, 'anyof', location));
			if(vinventoryNumberBinOnHand!= null && vinventoryNumberBinOnHand != 'null' && vinventoryNumberBinOnHand != undefined && 
					vinventoryNumberBinOnHand != '')
				filterInvBal.push(new nlobjSearchFilter('inventorynumber',null, 'is', vinventoryNumberBinOnHand));
			filterInvBal.push(new nlobjSearchFilter('onhand',null,'greaterthan',0));


			var objBinDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',filterInvBal, null);



			if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0)
			{
				nlapiLogExecution('DEBUG', 'objBinDetails.length ', objBinDetails.length);
				for(var i =0; i<objBinDetails.length; i++)
				{
					var bin = objBinDetails[i].getValue('binnumber',null,'group');		
					var status = objBinDetails[i].getValue('status',null,'group');	
					if(bin==binlocation && status != vStatusId )
					{
						boolfound = true;
					}
					else if(bin!=binlocation)
					{
						boolfound = true;
					}
				}
			}
		}
	}
	else
	{
		boolfound = isInventoryNumberExistsCYCC(item,serial,location,binlocation);
	}

	return boolfound ;
}
