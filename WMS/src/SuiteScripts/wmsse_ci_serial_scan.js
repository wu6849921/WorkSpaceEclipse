/**
 * Script Description
 * This script is used to Scan Serial for Create Inventory.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function for Serial scan screen
 */
function RFInventoryCISerial(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';

		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var whLocation = request.getParameter('custparam_whlocation');
		

		var whLocationName = request.getParameter('custparam_whlocationname');
		var getFetchedItemName = request.getParameter('custparam_fetcheditemname');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_scantotqty');
		var venterQty = request.getParameter('custparam_enterQty');
		var blnItemUnit = request.getParameter('custparam_blnItemUnit');
		var scannedBin = request.getParameter('custparam_scanbin');
		var scannedItem = request.getParameter('custparam_scanitem');
		var getStockConversionRate = request.getParameter('custparam_stockConversionRate');
		var enterBinId = request.getParameter('custparam_fromBinId');
		var enterBin = request.getParameter('custparam_fromBin');
		var uomqtyArr = request.getParameter('custparam_uomqtyselected');
		var enterBinId = request.getParameter('custparam_fromBinId');
		var enterBin = request.getParameter('custparam_fromBin');
		var accountNo = request.getParameter('custparam_accountno');
		var inventorystatus = request.getParameter('custparam_inventorystatus');
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		
		var st0 = domainName + '-CI Inventory';
		var getPreferBin=request.getParameter('custparam_preferbin');
		if(getNumber==null || getNumber=='' || getNumber=='null' || getNumber=='undefined')
			getNumber=0;
		nlapiLogExecution('DEBUG', 'getNumber', getNumber);
		//if(getNumber != null && getNumber != '' && parseInt(getNumber)==0)
		if(parseInt(getNumber)==0)
		{
			var filterssertemp1 = new Array();
			//filterssertemp1[0] = new nlobjSearchFilter('custrecord_tempserialnumber', null, 'is', getSerialNo);
			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 10);
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof', getItemInternalId);
			filterssertemp1[3] = new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', enterBinId);
			var columnssertemp1 = new Array();
			//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			//columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialdetails_search', filterssertemp1,columnssertemp1);
			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
			{	
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];
					nlapiLogExecution('DEBUG', 'TempRecord.getId()',TempRecord.getId());
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of discontinue of serial number scanning we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
				}

			}	
			SrchRecordTmpSerial1=null;
			filterssertemp1=null;
			columnssertemp1=null;
		}

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			

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
		CSSfilefound=null;
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


		html = html + "</head><body>"+
		"	<script type='text/javascript'>function validateForm() {var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtserial').value; var vSerialWhiteSpace = lotVal.indexOf(' ') >= 0; if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;}else{document.forms['_rf_checkin_item'].cmdSend1.disabled=true;document.forms['_rf_checkin_item'].cmdSend.disabled=true;document.forms['_rf_checkin_item'].cmdPrevious.disabled=true;document.getElementById('loading').style.display = '';document.forms['_rf_checkin_item'].submit(); return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Create Inventory Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+		
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Warehouse Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin Location: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"			</tr>"+
		"			<tr>";
		if(blnItemUnit!=null && blnItemUnit!='')
			html = html + "	<td align = 'left' class='labelmsg'>Qty: <label>" + venterQty +  " in " + blnItemUnit  + "</label>";
		else
			html = html +"	<td align = 'left' class='labelmsg'>Qty: <label>" + venterQty + "</label>";
		if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined')
		{
			var vInventoryStatus ='';
			var hdnInvtStatusText = request.getParameter('hdnInvtStatusText');
			if(hdnInvtStatusText != '' && hdnInvtStatusText != null && hdnInvtStatusText != 'null' && hdnInvtStatusText != 'undefined')
			{
				vInventoryStatus = hdnInvtStatusText;
			}
			else
			{

				var inventoryStatusLst = getDefaultInventoryStatusList(inventorystatus);

				if(inventoryStatusLst.length > 0)
				{
					vInventoryStatus = inventoryStatusLst[0][0];
				}
			}

			html =html+ "			<tr>"+
			"				<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
			"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + vInventoryStatus + "'>"+	
			"			</tr>";
		}

		html = html +"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemName' value='" + getFetchedItemName + "'>"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterblnItemUnit' value=" + blnItemUnit + ">"+
		"				<input type='hidden' name='hdnenterventerQty' value=" + venterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnenterBinId' value=" + enterBinId + ">"+
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnaccountNo' value=" + accountNo + ">"+	
		"				<input type='hidden' name='hdnselecteduomswithqty'  value=" + uomqtyArr + ">"+
		"				<input type='hidden' name='hdnscannedbin' id='hdscannedbin' value=" + scannedBin + ">"+
		"				<input type='hidden' name='hdnscanneditm' id='hdnsanneditm'  value='" + scannedItem + "'>"+
		"               <input type='hidden' name='hdninvtstatus' id='hdnivtstatus' value=" + inventorystatus + ">"+
		"				<input type='hidden' name='hdnstockconversionrate' id='hdnstockconversionrate'  value=" + getStockConversionRate + ">"+

		"				</td>"+
		"			</tr>"+			 
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Scanned Qty: <label>" + getNumber + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF <label>" + enterQty + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>"+
		"				</td>"+
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'  type='submit' value='' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		"		 </table>";
		html = html + "</table></form>"+

		"<script type='text/javascript'>document.getElementById('txtserial').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array POarray
		var POarray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtserial');
		var inventoryStatus = request.getParameter('hdninvtstatus');

		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');

		POarray["custparam_option"] = request.getParameter('hdnOptedField');

		POarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');

		POarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');

		POarray["custparam_fromBin"] = request.getParameter('hdnenterBin');
		POarray["custparam_fromBinId"] = request.getParameter('hdnenterBinId');
		POarray["custparam_scantotqty"] = request.getParameter('hdnenterQty');
		POarray["custparam_blnItemUnit"] = request.getParameter('hdnenterblnItemUnit');
		POarray["custparam_enterQty"] = request.getParameter('hdnenterventerQty');


		POarray["custparam_fetcheditemname"] = request.getParameter('hdnItemName');
		POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		POarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		POarray["custparam_accountno"] = request.getParameter('hdnaccountNo');

		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		POarray["custparam_entereditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_scanbin"] = request.getParameter('hdnscannedbin');
		POarray["custparam_scanitem"] = request.getParameter('hdnscanneditm');
		POarray["custparam_stockConversionRate"] = request.getParameter('hdnstockconversionrate');
		POarray["custparam_inventorystatus"] = inventoryStatus;
		var accountNo = request.getParameter('hdnaccountNo');

		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var getNumber=parseFloat(request.getParameter('hdnNumber'));
		
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

						nlapiLogExecution('DEBUG', 'After Serial No Parsing', getSerialNo);

						var isSerialExistsInInventory = isInventoryNumberExists(POarray["custparam_fetcheditemid"],getSerialNo,
								POarray["custparam_whlocation"]);
						nlapiLogExecution('DEBUG', 'isSerialExistsInInventory',isSerialExistsInInventory);
						if(isSerialExistsInInventory)
						{
							//POarray["custparam_number"] =0;
							POarray["custparam_error"] = 'This serial already exists in inventory';
							response.sendRedirect('SUITELET', 'customscript_wmsse_ci_serialscan',
									'customdeploy_wmsse_ci_serialscan', false, POarray);
							return; 
						}
						nlapiLogExecution('DEBUG', 'request.getParameter(custparam_serialno) before',
								request.getParameter('custparam_serialno'));


						nlapiLogExecution('DEBUG', 'INTO SERIAL ENTRY');
						//checking serial no's in already scanned one's from temp table
						var filterssertemp = new Array();
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 10));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_item', null, 'anyof',
								POarray["custparam_fetcheditemid"]));
						filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_bin', null, 'anyof', 
								POarray["custparam_fromBinId"]));
						var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp,null);
						nlapiLogExecution('DEBUG', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
						if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
						{

							POarray["custparam_error"] = "Serial# already scanned";
							response.sendRedirect('SUITELET', 'customscript_wmsse_ci_serialscan', 
									'customdeploy_wmsse_ci_serialscan', false, POarray);
							return;
						}				

						nlapiLogExecution('DEBUG', 'request.getParameter(hdnNumber)', request.getParameter('hdnNumber'));
						POarray["custparam_serialno"] = getSerialNo;

						POarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + parseFloat(1);

						filterssertemp=null;
						SrchRecordTmpSerial=null;
						//Here we are creating serial# into new Temp Serial entry custom record
						var binInternalId=nswms_GetBinInternalId(enterBin,POarray["custparam_whlocation"]);
						var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
						customrecord.setFieldValue('name', getSerialNo);
						customrecord.setFieldValue('custrecord_wmsse_ser_item', POarray["custparam_fetcheditemid"]);
						customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
						customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);				 
						customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
						customrecord.setFieldValue('custrecord_wmsse_ser_bin', POarray["custparam_fromBinId"]);
						customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 10);
						var rec = nlapiSubmitRecord(customrecord, false, true);
						customrecord=null;

						nlapiLogExecution('DEBUG', '(getNumber + 1)', (parseInt(getNumber) + 1));
						nlapiLogExecution('DEBUG', 'enterQty', enterQty);
						if ((parseFloat(getNumber) + 1) < parseFloat(enterQty)) {
							nlapiLogExecution('DEBUG', 'Scanning Serial No.');
							POarray["custparam_error"] = "";
							response.sendRedirect('SUITELET', 'customscript_wmsse_ci_serialscan',
									'customdeploy_wmsse_ci_serialscan', false, POarray);
							return;

						}
						else
						{
							try{
								var inventoryAdjustId=InvokeNSInventoryAdjustment(POarray["custparam_fetcheditemid"],
										POarray["custparam_itemtype"],POarray["custparam_whlocation"],
										Number(Big(POarray["custparam_enterQty"]).toFixed(8)),POarray["custparam_fromBinId"],'','','',DateStamp(),
										'',accountNo,inventoryStatus);
								POarray["custparam_error"] = '';
								nlapiLogExecution('DEBUG', 'inventoryAdjustId', inventoryAdjustId);
								var taskType="INVT";
								createInventoryOpenTask(POarray["custparam_itemtype"],POarray["custparam_whlocation"],
										POarray["custparam_fetcheditemid"],Number(Big(POarray["custparam_enterQty"]).toFixed(8)),
										POarray["custparam_fromBinId"],'',inventoryAdjustId,taskType,'',
										POarray["custparam_blnItemUnit"],POarray["custparam_stockConversionRate"],inventoryStatus);
								response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu',
										'customdeploy_wmsse_inventorymenu', false, POarray);
								return;

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
								
								response.sendRedirect('SUITELET', 'customscript_wmsse_ci_serialscan',
										'customdeploy_wmsse_ci_serialscan', false, POarray);
								return;
							}
						}
					}
					else
					{
						POarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_ci_serialscan',
								'customdeploy_wmsse_ci_serialscan', false, POarray);
					}
				} 
				else {
					POarray["custparam_error"] = "";
					response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan', 
							'customdeploy_wmsse_ci_bin_scan', false, POarray);
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

				response.sendRedirect('SUITELET', 'customscript_wmsse_ci_serialscan', 
						'customdeploy_wmsse_ci_serialscan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_ci_serialscan',
					'customdeploy_wmsse_ci_serialscan', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.


