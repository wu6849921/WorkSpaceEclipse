/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
function StatusScan(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	var recArray = new Array();
	if (request.getMethod() == 'GET') 
	{
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);
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
		nlapiLogExecution('DEBUG', 'vConversionRate1', vConversionRate);
		var VUnitType = request.getParameter('custparam_VUnitType');
		var selecteduomswithqty = request.getParameter('custparam_uomqtyselected');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
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

		var getNumber = request.getParameter('custparam_number');
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;
		nlapiLogExecution('DEBUG', 'getNumber', getNumber);
		var getItemRemQty = request.getParameter('custparam_enterQty');
		nlapiLogExecution('DEBUG', 'getItemRemQty', getItemRemQty);
		var getItemRecQty = getNumber;
		var enterQty = request.getParameter('custparam_enterQty');

		var invfilterStrat =  new Array();
		if(whLocation != null && whLocation != '' && whLocation != 'null')
			invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', whLocation));
		if(vPlanItemId != null && vPlanItemId != '' && vPlanItemId != 'null')
			invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', vPlanItemId));
		if(vPlanBin!= null && vPlanBin!= '' && vPlanBin!= 'null')
			invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', vPlanBin));		
		var vStatusDetails = nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);
		var statusSelectArr = new Array();
		if(vStatusDetails != '' && vStatusDetails != 'null' && vStatusDetails != null)
		{
			nlapiLogExecution('DEBUG', 'vStatusDetails.length', vStatusDetails.length);
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
		nlapiLogExecution('DEBUG', 'statusSelectArr', statusSelectArr);


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



		html = html +	"<script type='text/javascript'>function validateForm() { var patt = /[*|,\":<>{}`\';()@&$#%/ /]/g;" +
		"var intVal=document.getElementById('txtqty').value; var vLotWhiteSpace = intVal.indexOf(' ') >= 0;" +
		"if(document.getElementById('txtqty').value == ''){document.getElementById('div_error').innerHTML " +
		"='Please enter/scan qty#';return false;} else if(document.getElementById('txtqty').value <= 0.000000005 ){document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';document.getElementById('txtqty').focus();	return false;} else if(document.getElementById('inventorystatuslist').value == 'undefined' " +
		"|| document.getElementById('inventorystatuslist').value == '' || document.getElementById('inventorystatuslist').value == 'null'){" +
		"document.getElementById('div_error').innerHTML ='Please enter valid status';return false;} else if(intVal.indexOf('[') !=-1 || intVal.indexOf(']') != -1" +
		" || vLotWhiteSpace == true){document.getElementById('div_error').innerHTML ='Please enter/scan valid qty#';" +
		"document.getElementById('txtqty').value = ''; return false;} else{var sessionObj = document.getElementById('hdnsession').value;" +
		"if(sessionObj != '' && sessionObj != null){document.getElementById('div_error').innerHTML ='Transcation is in progress...';" +
		"return false;}else{document.getElementById('hdnsession').value = 'session';" +
		"document.forms['_rf_checkin_item'].submit();document.getElementById('loading').style.display = '';" +
		"document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true;" +
		"return true;}}}</script>";

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
		"		<tr><td class='tableheading'>Cycle Count - Status</td></tr>"+
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
			html = html +"<td align = 'left' class='labelmsg'>Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(8)) + "</label>"+" In "+ vUnits;
		}
		else
		{
			html = html +"<td align = 'left' class='labelmsg'>Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(8)) + "</label>";
		}

		html = html +"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Scanned Qty: <label>" + parseFloat(parseFloat(getItemRecQty).toFixed(8)) + "</label>"+
		"			</tr>"+

		"			<tr>";

		if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -')
		{
			html = html +"				<td align = 'left' class='labelmsg'>Enter Qty"+" In "+ vUnits;

		}
		else
		{
			html = html +"				<td align = 'left' class='labelmsg'>Enter Qty";

		}

		html = html +"				</td>";
		html = html +"		        </tr>";


		html=html+"			<tr>";

		html=html +	"<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>";

		html=html +"				</td>"+
		"			</tr><tr><td></td></tr></table>";


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
				//html = html +" <option   selected  value="+statusVal+"> "+statusText+"</option>";

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

		"<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
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
	else {
		nlapiLogExecution('DEBUG', 'Processing RF', 'Validating CYCC Serial');
		var getQty=request.getParameter('txtqty');
		var vStatusId = request.getParameter('inventorystatuslist');
		nlapiLogExecution('DEBUG', 'vStatusId RF', vStatusId);
		// Forming the temporary array cycArray
		var cycArray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtqty');
		var FetchedItemId = request.getParameter('hdnvPlanItemId');
		var whLocation = request.getParameter('hdnWhLocation');
		var optedEvent = request.getParameter('cmdPrevious');
		var enterTotQty = request.getParameter('hdnItemRemQty');
		var enterQty = enterTotQty;
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
			nlapiLogExecution('DEBUG', 'sessionobj', sessionobj);

			try
			{
				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){
					if((enterQty!=null && enterQty!=''&& enterQty!='null'))
					{
						nlapiLogExecution('DEBUG', 'enterQty', enterQty);

						if(vStatusId == 'null' || vStatusId == null || vStatusId == '' || vStatusId == 'undefined' || vStatusId == undefined)
						{
							cycArray["custparam_error"] = 'Please enter valid status';
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyclecountinvstatus', 'customdeploy_wmsse_cyclecountinvstatus', false, cycArray);
							return;
						}
						if(getQty <=0 || isNaN(getQty))
						{
							cycArray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
							cycArray["custparam_error"] = "Please enter valid quantity";
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyclecountinvstatus', 'customdeploy_wmsse_cyclecountinvstatus', false, cycArray);
							return;
						}
						var sumQty = 0;
						sumQty = Number((Big(getNumber).plus(getQty)).toFixed(8));
						if(parseFloat(sumQty) > parseFloat(remQty))
						{
							cycArray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
							cycArray["custparam_error"] = "Total scanned qty is greater than entered qty";
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyclecountinvstatus', 'customdeploy_wmsse_cyclecountinvstatus', false, cycArray);
							return;
						}


						cycArray["custparam_number"] = Number((Big(request.getParameter('hdnNumber')).plus(getQty)).toFixed(8));

						var vOpenBinQty = 0;

						if(vOpenBinQty == null || vOpenBinQty =='' || vOpenBinQty =='null' || vOpenBinQty =='undefined')
							vOpenBinQty = 0;
						nlapiLogExecution('DEBUG', 'inside enterQty',enterQty);
						nlapiLogExecution('DEBUG', 'vOpenBinQty',vOpenBinQty);
						

						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', 'INVTCYC');
						customrecord.setFieldValue('custrecord_wmsse_ser_ordno', cycArray["custparam_planinternalid"]);
						customrecord.setFieldValue('custrecord_wmsse_ser_ordline', cycArray["custparam_lineno"]);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', cycArray["custparam_fetcheditemid"]);
						customrecord.setFieldValue('custrecord_wmsse_ser_bin', cycArray["custparam_binlocationid"]);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', getQty);
						customrecord.setFieldValue('custrecord_serial_inventorystatus', vStatusId);
						//customrecord.setFieldValue('custrecord_wmsse_ser_no', getLotNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						var rec = nlapiSubmitRecord(customrecord, false, true);
						nlapiLogExecution('DEBUG', 'rec id' ,rec);



						var vFinalQty = 0;
						vFinalQty = Number((Big(getNumber).plus(getQty)).toFixed(8));
						nlapiLogExecution('DEBUG', 'remQty' ,remQty);
						if (parseFloat(vFinalQty) < parseFloat(remQty)) {	
							nlapiLogExecution('DEBUG', 'Scanning Qty');
							cycArray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_cyclecountinvstatus', 'customdeploy_wmsse_cyclecountinvstatus', false, cycArray);
							return;

						}
						else
						{
							try{

								var serialArrayArr=new Array();
								var invQtyArr = new Array();
								var vinvStatustextArr = new Array();
								var vStatusIDArr = new Array();
								var invDetailsArr = new Array();

								var vBinOpenTaskLotArr = "";
								var vBinOpenTaskBinIdArr = "";
								var vBinOpenTaskBinQtyArr = "";

								var vOpenBinQty=0;

								nlapiLogExecution('DEBUG', 'vOpenBinQty',vOpenBinQty);
								var vRecid=inventoryCountCYCC(cycArray["custparam_planinternalid"],cycArray["custparam_lineno"],
										Number((Big(remQty).plus(vOpenBinQty)).toFixed(8)),cycArray["custparam_itemtype"],
										cycArray["custparam_fetcheditemid"],cycArray["custparam_whlocation"],null,null);
								nlapiLogExecution('DEBUG', 'Into Updating opentask vRecid',vRecid);
								
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
								/*var columnssertemp1 = new Array();
								columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
								columnssertemp1[1] = new nlobjSearchColumn('custrecord_wmsse_ser_bin');
								columnssertemp1[2] = new nlobjSearchColumn('custrecord_wmsse_ser_qty');
								columnssertemp1[3] = new nlobjSearchColumn('name');
								columnssertemp1[4] = new nlobjSearchColumn('custrecord_serial_inventorystatus');*/
								var SrchRecordTmpLot1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp1);
								if(SrchRecordTmpLot1!=null && SrchRecordTmpLot1!='')
								{
									var filters = new Array();
									filters.push(new nlobjSearchFilter('name', null, 'is', cycArray["custparam_planid"]));
									filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [31]));
									filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [7]));
									if(cycArray["custparam_lineno"]!=null && cycArray["custparam_lineno"]!='' && cycArray["custparam_lineno"]!='undefined')
										filters.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', cycArray["custparam_lineno"]));
									if(cycArray["custparam_fetcheditemid"]!=null && cycArray["custparam_fetcheditemid"]!='' 
										&& cycArray["custparam_fetcheditemid"]!='undefined')
										filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', cycArray["custparam_fetcheditemid"]));
									var vOpentaskPlanDetails = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentask_search', filters);
									if(vOpentaskPlanDetails !=null && vOpentaskPlanDetails!='' && vOpentaskPlanDetails.length > 0)
									{
										nlapiLogExecution('DEBUG', 'vOpentaskPlanDetails.length22', vOpentaskPlanDetails.length);
										for(var p=0;p<vOpentaskPlanDetails.length;p++)
										{
											var vRecId=vOpentaskPlanDetails[p].getId();
											nlapiLogExecution('DEBUG', 'Deleted Old cycc task22', vRecId);
											var id = nlapiDeleteRecord('customrecord_wmsse_trn_opentask', vRecId);

										}
									}

									for(var zInvItr=0;zInvItr<SrchRecordTmpLot1.length;zInvItr++)
									{


										nlapiLogExecution('DEBUG', 'SrchRecordTmpLot1.length',SrchRecordTmpLot1.length);
										var invQty=SrchRecordTmpLot1[zInvItr].getValue('custrecord_wmsse_ser_qty');
										var vStatus=SrchRecordTmpLot1[zInvItr].getValue('custrecord_serial_inventorystatus');
										var vStatusText=SrchRecordTmpLot1[zInvItr].getText('custrecord_serial_inventorystatus');
										nlapiLogExecution('DEBUG', 'vStatus',vStatus);



										if(vStatusIDArr.indexOf(vStatus) == -1)
										{
											vStatusIDArr.push(vStatus);
											invQtyArr.push(invQty);
											vinvStatustextArr.push(vStatusText);
											
											var logmsg = 'vStatusIDArr. = ' + vStatusIDArr + '<br>';
											logmsg = logmsg + 'invQtyArr. = ' + invQtyArr + '<br>';	
											logmsg = logmsg + 'serialArrayArr. = ' + serialArrayArr + '<br>';	
											
											nlapiLogExecution('DEBUG', 'cycplan status serial values :', logmsg);


										}
										else
										{
											if(vStatusIDArr.length > 0 && vStatusIDArr.indexOf(vStatus) != -1)
											{
												nlapiLogExecution('DEBUG', 'Inside same Status', vStatusIDArr);
												var ind = vStatusIDArr.indexOf(vStatus);
												nlapiLogExecution('DEBUG', 'ind', ind);
												var tempQty = invQtyArr[ind];												
												var totalLotQty =Number(Big(tempQty).plus(invQty));
												invQtyArr[ind] = totalLotQty;
												vStatusIDArr[ind] = vStatus;
												vinvStatustextArr[ind]=vStatusText;
											}
											else
											{
												vStatusIDArr.push(vStatus);
												invQtyArr.push(invQty);
												vinvStatustextArr.push(vStatusText);
												
												var logmsg = 'vStatusIDArr. = ' + vStatusIDArr + '<br>';
												logmsg = logmsg + 'invQtyArr. = ' + invQtyArr + '<br>';	
												logmsg = logmsg + 'serialArrayArr. = ' + serialArrayArr + '<br>';	
												
												nlapiLogExecution('DEBUG', 'cycplan status serial values :', logmsg);
												
											}



										}

										var row1=[vStatusIDArr,invQtyArr,vinvStatustextArr];



									}
									invDetailsArr.push(row1);
									nlapiLogExecution('DEBUG', 'invDetailsArr',invDetailsArr);

									if(invDetailsArr != null && invDetailsArr!='' && invDetailsArr.length > 0)
									{
										for(var z=0;z<invDetailsArr.length;z++)
										{
											serialStatusArr = invDetailsArr[z][0];
											serialQtyArr = invDetailsArr[z][1];
										
											serialsttextArr = invDetailsArr[z][2];
																						
											var logmsg = 'serialStatusArr. = ' + serialStatusArr + '<br>';
											logmsg = logmsg + 'serialQtyArr. = ' + serialQtyArr + '<br>';	
											logmsg = logmsg + 'serialsttextArr. = ' + serialsttextArr + '<br>';	
											
											nlapiLogExecution('DEBUG', 'cycplan status serial values :', logmsg);
											

										}
										if(serialStatusArr != null && serialStatusArr!='' && serialStatusArr.length > 0)
										{
											for(var statsItr=0;statsItr<serialStatusArr.length;statsItr++)
											{
												var openTaskId =updateCycleCountOpenTask(cycArray["custparam_planinternalid"],
														cycArray["custparam_fetcheditemid"],cycArray["custparam_lineno"],
														Number(Big(serialQtyArr[statsItr]).toFixed(8)),cycArray["custparam_binlocationid"],cycArray["custparam_itemtype"],
														cycArray["custparam_whlocation"],'',cycArray["custparam_planinternalid"],
														cycArray["custparam_planid"],cycArray["custparam_actualbegintime"],
														cycArray["custparam_uom"],cycArray["custparam_conversionrate"],
														'','',serialStatusArr[statsItr]);
											}

										}
									}
									for(var invUpdateItr=0;invUpdateItr<SrchRecordTmpLot1.length;invUpdateItr++)
									{
										nlapiLogExecution('DEBUG', 'SrchRecordTmpLot1.length',SrchRecordTmpLot1.length);

										var TempRecord=SrchRecordTmpLot1[invUpdateItr];
										var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
										tempSerial.setFieldValue('id', TempRecord.getId());
										tempSerial.setFieldValue('name', TempRecord.getValue('name'));
										tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of Inventory Item is processed for CYCC we have marked this lot number as closed');
										tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
										nlapiSubmitRecord(tempSerial);
										TempRecord=null;
										tempSerial=null;
									}
								}
								SrchRecordTmpLot1=null;
								filterssertemp1=null;
								columnssertemp1=null;

								////////////////
								/*	var vRecid=inventoryCountCYCC(cycArray["custparam_planinternalid"],cycArray["custparam_lineno"],parseFloat(remQty)+parseFloat(vOpenBinQty),'','',cycArray["custparam_whlocation"],null,vStatusId);
							nlapiLogExecution('DEBUG', 'vRecid',vRecid);
							var openTaskId=updateCycleCountOpenTask(cycArray["custparam_planinternalid"],cycArray["custparam_fetcheditemid"],cycArray["custparam_lineno"],enterQty,cycArray["custparam_binlocationid"],cycArray["custparam_itemtype"],cycArray["custparam_whlocation"],'',vRecid,cycArray["custparam_planid"],cycArray["custparam_actualbegintime"],cycArray["custparam_uom"],cycArray["custparam_conversionrate"],vOpenBinQty,null,vStatusId);
							nlapiLogExecution('DEBUG', 'open task updated successfully openTaskId',openTaskId);*/
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

								response.sendRedirect('SUITELET', 'customscript_wmsse_cyclecountinvstatus', 'customdeploy_wmsse_cyclecountinvstatus', false, cycArray);
								return;
							}
							////////////////
						}
					}
					else
					{
						cycArray["custparam_error"] ='Please enter valid qty';
						response.sendRedirect('SUITELET', 'customscript_wmsse_cyclecountinvstatus', 'customdeploy_wmsse_cyclecountinvstatus', false, cycArray);
						return;

					}
				} 
				else {

					cycArray["custparam_error"] = "";
					response.sendRedirect('SUITELET', 'customscript_wmsse_cyc_qtyscan', 'customdeploy_wmsse_cyc_qtyscan', false, cycArray);
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

				response.sendRedirect('SUITELET', 'customscript_wmsse_cyclecountinvstatus', 'customdeploy_wmsse_cyclecountinvstatus', false, cycArray);
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

	//var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_getinv_bin_recv_lot',filterStrat, columnStrat);
	var objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, columnStrat);

	if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0)
	{
		nlapiLogExecution('DEBUG', 'objBinDetails.length ', objBinDetails.length);
		boolfound = true;
	}

	return boolfound ;
}
