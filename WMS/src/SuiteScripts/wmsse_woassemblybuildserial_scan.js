/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function CheckInSerial(request, response){
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

		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getWONo = request.getParameter('custparam_woid');
		
		var getNumber = request.getParameter('custparam_number');
		var getSerialArr = request.getParameter('custparam_serialno');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');	
		var whCompany= request.getParameter('custparam_company');
		var getWONo = request.getParameter('custparam_woid');
		var getWOItem = request.getParameter('custparam_woitem');		
		var getWOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getWOInternalId = request.getParameter('custparam_wointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemQty = request.getParameter('custparam_woitemqty');
		//var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemBuiltQty = request.getParameter('custparam_rec_qty');
		var getItemRemQty = request.getParameter('custparam_enterQty');
		var getItemRecQty = request.getParameter('custparam_number');
		if(getItemRecQty==null || getItemRecQty=='' || getItemRecQty=='null')
			getItemRecQty=0;
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var vUnits = request.getParameter('custparam_fetched_units');
		var selecteduomswithqty = request.getParameter('custparam_uomqtyselected');
		var getStockConversionRate = request.getParameter('custparam_stockconversionrate');
		getItemRemQty = getItemRemQty * getStockConversionRate ;
		var getBuildableQty = request.getParameter('custparam_rem_qty');

		var statusId = request.getParameter('custparam_statusId');
		
		
		

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var isactiveflag = 'F';
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));	
		itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		var itemcolumns= new Array();
		itemcolumns[0] = new nlobjSearchColumn('name');			
		var itemresults= nlapiSearchRecord('item', null, itemfilters, itemcolumns);
		if(itemresults!=null && itemresults!='')
		{
			isactiveflag = 'T';
			getWOItem = itemresults[0].getValue('name');
			
		}

		if(getWOItem == null || getWOItem =='' || getWOItem == 'null' || getWOItem == 'undefined')
		{
			getWOItem = '';
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		
		
		var logmsg = 'getWONo. = ' + getWONo + '<br>';
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';	
		logmsg = logmsg + 'getWOItem. = ' + getWOItem + '<br>';	
		logmsg = logmsg + 'getItemInternalId. = ' + getItemInternalId + '<br>';
		logmsg = logmsg + 'statusId. = ' + statusId + '<br>';	
		logmsg = logmsg + 'getItemRemQty. = ' + getItemRemQty + '<br>';	
		logmsg = logmsg + 'getItemRecQty. = ' + getItemRecQty + '<br>';	
		nlapiLogExecution('DEBUG', 'AssemblybuildSerial get values :', logmsg);
		
		var domainName = fndomainName();
		
		var st0 = domainName + '-Assembly Build Work Order';
		var getPreferBin=request.getParameter('custparam_preferbin');
		if(getNumber==null || getNumber=='' || getNumber=='null')
			getNumber=0;
	
		if(getNumber == null || getNumber == '' || parseInt(getNumber)==0)
		{
			var filterssertemp1 = new Array();
			//filterssertemp1[0] = new nlobjSearchFilter('custrecord_tempserialnumber', null, 'is', getSerialNo);
			filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
			filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', getWOLineNo);
			filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', getWOInternalId);
			filterssertemp1[3] = new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 2);
			var columnssertemp1 = new Array();
			columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
			columnssertemp1[1] = new nlobjSearchColumn('name');
			var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filterssertemp1,columnssertemp1);
			if(SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '')
			{	
				for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
					var TempRecord=SrchRecordTmpSerial1[j];
					
					var tempSerial=nlapiLoadRecord('customrecord_wmsse_serialentry',TempRecord.getId());
					tempSerial.setFieldValue('id', TempRecord.getId());
					tempSerial.setFieldValue('name', TempRecord.getValue('name'));
					tempSerial.setFieldValue('custrecord_wmsse_ser_note1', 'because of discontinue of serial number scanning we have marked this serial number as closed');
					tempSerial.setFieldValue('custrecord_wmsse_ser_status', 'T');
					nlapiSubmitRecord(tempSerial);
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
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
		var vInventoryStatus ='';
		if(statusId != null && statusId != '' && statusId != 'null' && statusId != 'undefined' && statusId != undefined)
		{
			var inventoryStatusLst = getDefaultInventoryStatusList(statusId);

			if(inventoryStatusLst !=null && inventoryStatusLst !='' && inventoryStatusLst.length > 0)
			{
				vInventoryStatus = inventoryStatusLst[0][0];
			}

		}		
		
		
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


		//html = html + "</head><body>"+
		html = html + "	<script type='text/javascript'>function validateForm() {var isactiveflag=document.getElementById('hdnisactiveflag').value; if(document.getElementById('txtserial').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan serial#';return false;} var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtserial').value; if(isactiveflag == 'F'){document.getElementById('div_error').innerHTML ='Assembly/member items are inactive';return false;} else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Assembly Build - Serial#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >&nbsp;"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+
		"		<table>"+
		//"			<tr border='1'><td align='center'  valign='top'><b>RECEIVING</b></td></tr>"+
		//"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Work Order# <label>" + getWONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWoInternalId' value=" + getWOInternalId + ">"+
		"				<input type='hidden' name='hdnWoLineno' value=" + getWOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnWoItem' value=" + getWOItem + ">"+
		"				<input type='hidden' name='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnNumber' value=" + getNumber + ">"+
		"				<input type='hidden' name='hdnSerialArr' value=" + getSerialArr + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' id='hdnisactiveflag' name='hdnisactiveflag' value=" + isactiveflag + ">"+
		"				<input type='hidden' name='hdnitemqty' value=" + getItemQty + ">"+	
		"				<input type='hidden' name='hdnitembuiltqty' value=" + getItemBuiltQty + ">"+
		"				<input type='hidden' name='hdnordunits' value='" + vUnits + "'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' value='" + selecteduomswithqty + "'>"+
		"				<input type='hidden' name='hdngetStockConversionRate' value='" + getStockConversionRate + "'>"+	
		"				<input type='hidden' name='hdnstatusId' value='" + statusId + "'>"+
		"				<input type='hidden' name='hdnbuildable' value='" + getBuildableQty + "'>"+		
		"				</td>"+
		"			</tr>"+	
		//"			<tr><td align='center'></td></tr>"+
		"			<tr><td align='left' class='labelmsg'>Assembly Item: <label>" + getWOItem + "</label></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Received Qty: <label>" + parseFloat(parseFloat(getItemRecQty).toFixed(8))  + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(Big(getItemRemQty).minus(getNumber)).toFixed(8))  + "</label>"+
		"			</tr>";
		if(vInventoryStatus !=null && vInventoryStatus !='' && vInventoryStatus !='null' &&
				vInventoryStatus !='undefined' && vInventoryStatus !=undefined)
		{
			html =html+ "			<tr>"+
			"				<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
			"				<input type='hidden' name='hdnInvtStatusText' id = 'hdnInvtStatusText' value='" + vInventoryStatus + "'>"+	
			"			</tr>";
		}			
		
		html =html+ "		<tr>"+
		"				<td align = 'left' class='labelmsg'>" + (parseFloat(getNumber) + 1) + " OF <label>" + getItemRemQty + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Serial#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtserial'  class='smalltextbox'  id='txtserial' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr><td align='center'></td></tr></table>"+
		/*"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td><td width=20px ></td><td>"+
		//"					<input name='cmdReceiveFulls' type='submit' value='RECEIVE FULL'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td>"+
		"			</tr>"+
		"		 </table>";*/
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/>"+
		"				</td>"+
		"			</tr>"+
		"		 </table>";
		html = html + "</td></tr></table></form>"+

		"<script type='text/javascript'>document.getElementById('txtserial').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array WOarray
		var WOarray = new Array();
		var tempflag='F';
		var getSerialNo=request.getParameter('txtserial');

		WOarray["custparam_woid"] = request.getParameter('custparam_woid');
		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		WOarray["custparam_option"] = request.getParameter('hdnOptedField');
		WOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		WOarray["custparam_wointernalid"] = request.getParameter('hdnWoInternalId');
		WOarray["custparam_lineno"] = request.getParameter('hdnWoLineno');
		WOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		WOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		WOarray["custparam_rec_qty"] = request.getParameter('hdnitembuiltqty');
		WOarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		WOarray["custparam_woitem"] = request.getParameter('hdnWoItem');
		WOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		WOarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber'));
		WOarray["custparam_serialno"] = request.getParameter('hdnSerialArr');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		WOarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		WOarray["custparam_enterBin"] = request.getParameter('hdnenterBin');
		WOarray["custparam_woitemqty"] = request.getParameter('hdnitemqty');
		WOarray["custparam_isactiveflag"] = request.getParameter('hdnisactiveflag');
		WOarray["custparam_fetched_units"] = request.getParameter('hdnordunits');
		WOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		WOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		WOarray["custparam_rem_qty"] = request.getParameter('hdnbuildable');
		var isactiveflag = request.getParameter('hdnisactiveflag');
		
		var orderType=request.getParameter('hdnordertype');
		WOarray["custparam_ordertype"]=orderType;
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var woInternalId=request.getParameter('hdnWoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var woLineno=request.getParameter('hdnWoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var whLocation =request.getParameter('hdnWhLocation');
		var getNumber=parseFloat(request.getParameter('hdnNumber'));


		var statusId=request.getParameter('hdnstatusId');
		WOarray["custparam_statusId"] = statusId;
    // Check Inventory status feature is enabled or not
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);
		var logMsg = 'WO = ' + WOarray["custparam_woid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'woInternalId = ' + woInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'woLineno = ' + woLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'statusId = ' + statusId + '<br>';
		logMsg = logMsg + 'inventoryStatusFeature = ' + inventoryStatusFeature + '<br>';
		nlapiLogExecution('DEBUG', 'Processing RF - Serial', logMsg);
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
						if(isactiveflag == 'T')
						{
							

							var vAdvBinManagement=false;

							var ctx = nlapiGetContext();
							if(ctx != null && ctx != '')
							{
								if(ctx.getFeature('advbinseriallotmgmt').toString() != null && ctx.getFeature('advbinseriallotmgmt').toString() != '')
									vAdvBinManagement=ctx.getFeature('advbinseriallotmgmt');
								
							}
							if(trantype=='transferorder')
							{
								var IsValidSerailNumber='F';
								var trecord = nlapiLoadRecord('transferorder', woInternalId);

								var links=trecord.getLineItemCount('links');
								if(links!=null  && links!='')
								{
									
									for(var j=0;j<links &&  IsValidSerailNumber=='F';j++)
									{
										var id=trecord.getLineItemValue('links','id',(parseInt(j)+1));
										var linktype = trecord.getLineItemValue('links','type',(parseInt(j)+1));
										
										if(linktype=='Item Fulfillment' || linktype=='Ejecuci�n de pedido de art�culo')
										{
											var frecord = nlapiLoadRecord('itemfulfillment', id);
											var fitemcount=frecord.getLineItemCount('item');
											for(var f=1;f<=fitemcount;f++)
											{
												var fitem=frecord.getLineItemValue('item','item',f);
												var fline=frecord.getLineItemValue('item','orderline',f);
												var pofline= fline-1;

												if(fitem==FetchedItemId) //&& parseInt(poLineno)==parseInt(pofline))
												{
													var  serialnumbers=frecord.getLineItemValue('item','serialnumbers',(parseInt(f)));
													//Case # 20124514? Start(while doing TO  CART  check in,system allows to give any lot# system accepting the lot other than fulfilled.) 
													var itemfulfilserialno;
													/*for(var j=1;j<=polinelength ;j++)
											{*/


													if(vAdvBinManagement)
													{
														frecord.selectLineItem('item', 1);
														
														var compSubRecord = frecord.viewCurrentLineItemSubrecord('item','inventorydetail');
														// case #20127404 starts
														var polinelength =0;
														//var polinelength = compSubRecord.getLineItemCount('inventoryassignment');
														//if(compSubRecord.length!=null||compSubRecord.length!=''||compSubRecord.length!='null')// Case# 20148759,20148761
														if(compSubRecord!=null && compSubRecord!=''&& compSubRecord!='null')
															polinelength = compSubRecord.getLineItemCount('inventoryassignment');
														//case #20127404 ends
														for(var j1=1;j1<=polinelength ;j1++)
														{
															//Case # 20127097 Start
//															itemfulfilserialno=compSubRecord.getLineItemValue('inventoryassignment','issueinventorynumber_display',j1);
															itemfulfilserialno=compSubRecord.getLineItemText('inventoryassignment','issueinventorynumber',j1);
															//Case # 20127097 End
															if(itemfulfilserialno!=null && itemfulfilserialno!='')
															{
																var tserials=itemfulfilserialno.split('');
																//nlapiLogExecution('DEBUG', 'serialnumbers',tserials[0]);
																if(tserials!=null && tserials!='' && tserials.length>0)
																{
																	if(tserials.indexOf(getSerialNo)!=-1)
																	{
																		
																		IsValidSerailNumber='T';
																		break;
																	}
																}
															}
														}
														
													}
													if(serialnumbers!=null && serialnumbers!='')
													{
														var tserials=serialnumbers.split('');
														//nlapiLogExecution('DEBUG', 'serialnumbers',tserials[0]);
														if(tserials!=null && tserials!='' && tserials.length>0)
														{
															if(tserials.indexOf(getSerialNo)!=-1)
															{
																nlapiLogExecution('DEBUG', 'getSerialNo111111',getSerialNo);
																IsValidSerailNumber='T';
																break;
															}
														}
													}
													//Case # 20124514� END

												}
											}
										}
									}

									if(IsValidSerailNumber=='F')
									{
										WOarray["custparam_error"] = "Matching Serial Number required.</br>The Serial number on a transfer order receipt must have been fulfilled.";
										response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_wserial_scan', 'customdeploy_wmsse_assembly_wserial_scan', false, WOarray);
										return; 
									}
								}


							}

							

							var isSerialExistsInInventory = isInventoryNumberExists(FetchedItemId,getSerialNo,whLocation);
							
							if(isSerialExistsInInventory)
							{
								//POarray["custparam_number"] =0;
								WOarray["custparam_error"] = 'This serial# already exists in inventory';
								response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_wserial_scan', 'customdeploy_wmsse_assembly_wserial_scan', false, WOarray);
								return; 
							}

							
							//checking serial no's in already scanned one's from temp table
							var filterssertemp = new Array();
							filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_no', null, 'is', getSerialNo));
							filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F'));
							filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', woLineno));
							filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof',woInternalId));
							filterssertemp.push(new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 2));
							var SrchRecordTmpSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filterssertemp);
							nlapiLogExecution('Debug', 'SrchRecordTmpSerial', SrchRecordTmpSerial);
							if(SrchRecordTmpSerial != null && SrchRecordTmpSerial !='')
							{

								WOarray["custparam_error"] = "Serial# already scanned";
								response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_wserial_scan', 'customdeploy_wmsse_assembly_wserial_scan', false, WOarray);
								return;
							}								
							else {

								WOarray["custparam_serialno"] = getSerialNo;

								WOarray["custparam_number"] = parseFloat(request.getParameter('hdnNumber')) + 1;
							}
							//Here we are creating serial# into new Temp Serial entry custom record
							var binInternalId=nswms_GetValidBinInternalId(enterBin,whLocation,null);
							var customrecord = nlapiCreateRecord('customrecord_wmsse_serialentry');
							customrecord.setFieldValue('name', getSerialNo);
							customrecord.setFieldValue('custrecord_wmsse_ser_ordno', woInternalId);
							customrecord.setFieldValue('custrecord_wmsse_ser_ordline', woLineno);
							customrecord.setFieldValue('custrecord_wmsse_ser_item', FetchedItemId);
							customrecord.setFieldValue('custrecord_wmsse_ser_qty', 1);
							customrecord.setFieldValue('custrecord_wmsse_ser_no', getSerialNo);	
							customrecord.setFieldValue('custrecord_wmsse_ser_bin', binInternalId);
							customrecord.setFieldValue('custrecord_wmsse_ser_status', 'F');
							customrecord.setFieldValue('custrecord_wmsse_ser_tasktype', 2);
							var rec = nlapiSubmitRecord(customrecord, false, true);

							nlapiLogExecution('Debug', '(getNumber + 1)', (parseInt(getNumber) + 1));
							nlapiLogExecution('Debug', 'remQty', remQty);
							if ((parseInt(getNumber) + 1) < parseInt(remQty)) {
								
								WOarray["custparam_error"] = "";
								response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_wserial_scan', 'customdeploy_wmsse_assembly_wserial_scan', false, WOarray);
								return;

							}
							else
							{
								try{
									
									var binInternalId=nswms_GetValidBinInternalId(enterBin,whLocation,null);
									
									if(inventoryStatusFeature == true)
									{
										var splitopentaskResults = buildAssembly(woInternalId,binInternalId,trantype,FetchedItemId,woLineno,
												whLocation,itemType,'',parseFloat(enterQty).toFixed(8),parseFloat(WOarray["custparam_woitemqty"]).toFixed(8),statusId,inventoryStatusFeature);
									}
									else
									{
										var splitopentaskResults = buildAssembly(woInternalId,binInternalId,trantype,FetchedItemId,woLineno,
												whLocation,itemType,'',parseFloat(enterQty).toFixed(8),parseFloat(WOarray["custparam_woitemqty"]).toFixed(8));
									}

									if(splitopentaskResults!=null && splitopentaskResults!='' && splitopentaskResults!=undefined){
										//START
										nlapiLogExecution('Debug', 'assemblyBuild posted successfully', splitopentaskResults[0]);

										if(splitopentaskResults[0] != null && splitopentaskResults[0] != '' && splitopentaskResults[0] != 'null' && splitopentaskResults[0] !='undefined')
										{


											var currentUserID = getCurrentUser();
											var createopentaskrec =  nlapiCreateRecord('customrecord_wmsse_trn_opentask');		    	
											createopentaskrec.setFieldValue('custrecord_wmsse_expe_qty', parseFloat(enterQty).toFixed(8));
											createopentaskrec.setFieldValue('custrecord_wmsse_act_qty', parseFloat(enterQty).toFixed(8));
											createopentaskrec.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
											createopentaskrec.setFieldValue('custrecord_wmsse_wms_status_flag', 3);//putaway completed
											createopentaskrec.setFieldValue('custrecord_wmsse_tasktype', 5); //For KTS
											createopentaskrec.setFieldValue('custrecord_wmsse_nsconfirm_ref_no',splitopentaskResults[0]);
											createopentaskrec.setFieldValue('custrecord_wmsse_actbeginloc', binInternalId);
											createopentaskrec.setFieldValue('custrecord_wmsse_actendloc', binInternalId);

											createopentaskrec.setFieldValue('custrecord_wmsse_order_no', woInternalId);
											createopentaskrec.setFieldValue('custrecord_wmsse_wms_location', whLocation);
											createopentaskrec.setFieldValue('custrecord_wmsse_parent_sku_no', FetchedItemId);
											createopentaskrec.setFieldValue('custrecord_wmsse_sku', FetchedItemId);

											var filters = new Array();

											filters[0] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', woInternalId);
											filters[1] = new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 2);
											filters[2] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'T');
											var columns = new Array();
											columns[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
											columns[1] = new nlobjSearchColumn('name');
											var SrchRecordSerial = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filters,columns);
											var serialStr = '';
											if(SrchRecordSerial !=null && SrchRecordSerial!="")
											{
												

												for (var n = 0; n < SrchRecordSerial.length; n++) {
													if(n == 0)
													{
														serialStr = SrchRecordSerial[n].getValue('custrecord_wmsse_ser_no');
													}
													else
													{
														serialStr = serialStr+","+SrchRecordSerial[n].getValue('custrecord_wmsse_ser_no');
													}

													var vSerialEntryId=SrchRecordSerial[n].getId();
													if(vSerialEntryId != null && vSerialEntryId !='')
													{
														
														nlapiDeleteRecord('customrecord_wmsse_serialentry', vSerialEntryId);
													}
												}
											}
											createopentaskrec.setFieldValue('custrecord_wmsse_serial_no', serialStr);
											
											if(statusId != null && statusId != 'null' && statusId != '' && statusId !=undefined)
												createopentaskrec.setFieldValue('custrecord_wmsse_inventorystatus', statusId);
											nlapiSubmitRecord(createopentaskrec, false, true);



										}

										for(var z=1;z<splitopentaskResults.length;z++)
										{
											var currRow =  splitopentaskResults[z];
											var assemblyBuildQty = currRow[0];
											//var assemblyBuildOpenTaskId = currRow[1];
											var openTaskLine = currRow[1];
											var openTaskItem = currRow[2];
											var openTaskLot = currRow[3];
											var openTaskSerial = currRow[4];
											
											//nlapiLogExecution('ERROR', 'assemblyBuildOpenTaskId', assemblyBuildOpenTaskId);
											var getOpenTaskDetails = getOpenTaskLineDetails(woInternalId,openTaskLine,openTaskItem,openTaskLot,openTaskSerial); 
											if(getOpenTaskDetails!=null && getOpenTaskDetails !='')
											{
												for(var h=0;h<getOpenTaskDetails.length && parseFloat(assemblyBuildQty) > 0;h++)
												{
													var assemblyBuildOpenTaskId = getOpenTaskDetails[h].getId();
													
													var transaction = nlapiLoadRecord('customrecord_wmsse_trn_opentask', assemblyBuildOpenTaskId);
													var opentaskactQty = transaction.getFieldValue('custrecord_wmsse_act_qty');
													var opentaskactSerail = transaction.getFieldValue('custrecord_wmsse_serial_no');
													
													if(parseFloat(assemblyBuildQty) < parseFloat(opentaskactQty))
													{
														var vNewSerial='';
														if(opentaskactSerail !=null && opentaskactSerail !='' && opentaskactSerail !='null' && openTaskSerial !=null && openTaskSerial !='')
														{
															var totalSerialArray=opentaskactSerail.split(',');
															
															for (var n = 0; n < totalSerialArray.length; n++) {
																if(openTaskSerial.indexOf(totalSerialArray[n]) == -1)
																{
																	if(vNewSerial =='')
																		vNewSerial = totalSerialArray[n];
																	else
																		vNewSerial = vNewSerial +","+ totalSerialArray[n];
																}
															}
														}
														
														var currentContext = nlapiGetContext();  
														var currentUserID = currentContext.getUser();
														var remainQty = Big(opentaskactQty).minus(assemblyBuildQty);
														
														var createopentaskrec =  nlapiCopyRecord('customrecord_wmsse_trn_opentask',assemblyBuildOpenTaskId);		    	
														createopentaskrec.setFieldValue('custrecord_wmsse_expe_qty', parseFloat(remainQty).toFixed(8));
														createopentaskrec.setFieldValue('custrecord_wmsse_act_qty', parseFloat(remainQty).toFixed(8));
														createopentaskrec.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
														createopentaskrec.setFieldValue('custrecord_wmsse_serial_no', vNewSerial);
														createopentaskrec.setFieldValue('custrecord_wmsse_nsconfirm_ref_no','');
														nlapiSubmitRecord(createopentaskrec, false, true);
														transaction.setFieldValue('custrecord_wmsse_expe_qty', parseFloat(assemblyBuildQty).toFixed(8));
														transaction.setFieldValue('custrecord_wmsse_act_qty', parseFloat(assemblyBuildQty).toFixed(8));

													}

													transaction.setFieldValue('custrecord_wmsse_nsconfirm_ref_no',splitopentaskResults[0]);
													nlapiSubmitRecord(transaction, false, true);
													assemblyBuildQty = Big(assemblyBuildQty).minus(opentaskactQty);
												}
											}
										}





									}

									/*	var receivedQty = parseFloat(request.getParameter('hdnItemRecQty'))+parseFloat(enterQty);
						if(parseFloat(receivedQty) < parseFloat(mainQty))
						{*/
									WOarray["custparam_error"]='';
									//	WOarray["custparam_rem_qty"] = parseFloat(request.getParameter('hdnItemRemQty'))-parseFloat(enterQty);
									//		WOarray["custparam_rec_qty"] = parseFloat(request.getParameter('hdnItemRecQty'))+parseFloat(enterQty);
									//response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
									response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan', 'customdeploy_wmsse_assembly_woscan', false, WOarray);
									return;	
									/*}
						else
						{
							WOarray["custparam_error"]='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan', 'customdeploy_wmsse_assembly_woscan', false, WOarray);
							return;
						}*/
								}				
								catch(e)
								{
									nlapiLogExecution('DEBUG', 'inside catch exception', e);
									WOarray["custparam_number"] =0;


									if ( e instanceof nlobjError )
									{
										var msgstr = e.getDetails();
										nlapiLogExecution( 'DEBUG', 'msgstr.indexOf Invalid binnumber reference key',msgstr.indexOf('Invalid binnumber reference key') );
										if(msgstr.indexOf('Invalid binnumber reference key')!=-1 )
										{
											WOarray["custparam_error"]='There is no inventory at WIP location.';
										}
										else
										{
											WOarray["custparam_error"]=e.getDetails();
											nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
										}

									}
									else
									{
										WOarray["custparam_error"]=e.toString();
										nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
									}

									response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_wserial_scan', 'customdeploy_wmsse_assembly_wserial_scan', false, WOarray);
									return;
								}
							}
						}
						else
						{
							WOarray["custparam_error"] = 'Assembly/member items are inactive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_wserial_scan', 'customdeploy_wmsse_assembly_wserial_scan', false, WOarray);
							return;
						}
					}
					else
					{
						WOarray["custparam_error"] = 'Please enter/scan valid serial#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_wserial_scan', 'customdeploy_wmsse_assembly_wserial_scan', false, WOarray);
						return;
					}
				} 
				else {
					WOarray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
				}
			}
			catch (e) 
			{
				if ( e instanceof nlobjError )
				{					
					WOarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );				

				}
				else
				{
					WOarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}

				response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_wserial_scan', 'customdeploy_wmsse_assembly_wserial_scan', false, WOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			WOarray["custparam_error"] = 'Transaction is in progress...';
			response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_wserial_scan', 'customdeploy_wmsse_assembly_wserial_scan', false, WOarray);
		}
	} //end of first if condition
} //end of function.

function buildAssembly(assemblyrecid,Bin,trantype,FetchedItemId,woLineno,whLocation,ItemType,batchno,vqty,
      vmainitemQty,statusId,inventoryStatusFeature)
{


	var fromRecord = 'workorder';
	var toRecord = 'assemblybuild'; 

	var logMsg = 'ItemType = ' + ItemType + '<br>';
	logMsg = logMsg + 'enterQty = ' + vqty + '<br>';
	logMsg = logMsg + 'enterBin = ' + Bin + '<br>';
	logMsg = logMsg + 'trantype = ' + trantype + '<br>';
	logMsg = logMsg + 'assemblyrecid = ' + assemblyrecid + '<br>';
	logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
	logMsg = logMsg + 'woLineno = ' + woLineno + '<br>';
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
	logMsg = logMsg + 'batchno = ' + batchno + '<br>';
	logMsg = logMsg + 'statusId = ' + statusId + '<br>';
	nlapiLogExecution('DEBUG', 'Processing nswms_assemblyBuild', logMsg);

	var idl="";
	var opentaskArray = new Array();
	var serialIds = new Array();
	var trecord = nlapiTransformRecord(fromRecord, assemblyrecid, toRecord);

	trecord.setFieldValue('quantity', vqty);
	trecord.setFieldValue('location', whLocation);
	trecord.setFieldValue('item', FetchedItemId);
	//trecord.setFieldValue('binnumber', Bin);		
	if (ItemType == "lotnumberedinventoryitem" || ItemType=="lotnumberedassemblyitem")
	{
		var bodySubRecord  = trecord.createSubrecord('inventorydetail');
		bodySubRecord.selectNewLineItem('inventoryassignment');		
		bodySubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
		bodySubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', vqty);
		if(statusId != '' && statusId != 'null' && statusId != null)
		bodySubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', statusId);
		bodySubRecord.commitLineItem('inventoryassignment');
		bodySubRecord.commit();
	}
	else if (ItemType == "serializedinventoryitem" || ItemType=="serializedassemblyitem") {

		var filterssertemp1 = new Array();

		filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
		//filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', soLineno);
		filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', assemblyrecid);
		filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_tasktype', null, 'anyof', 2);
		var columnssertemp1 = new Array();
		columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
		columnssertemp1[1] = new nlobjSearchColumn('name');
		var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', null, filterssertemp1,columnssertemp1);
		if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
		{
			
			//trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);
			var bodySubRecord = trecord.createSubrecord('inventorydetail');
			
			for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
				bodySubRecord.selectNewLineItem('inventoryassignment');
				bodySubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
				bodySubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'));
				if(Bin!=null && Bin!="" && Bin!='null')
					bodySubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', Bin);
				if(statusId != '' && statusId != 'null' && statusId != null)
				bodySubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', statusId);
				bodySubRecord.commitLineItem('inventoryassignment');
				
			}
			bodySubRecord.commit();
			
			for (var fn = 0; fn < SrchRecordTmpSerial1.length; fn++) {
				var vSerialEntryId=SrchRecordTmpSerial1[fn].getId();
				if(vSerialEntryId != null && vSerialEntryId !='')
				{
					
					nlapiSubmitField('customrecord_wmsse_serialentry', vSerialEntryId,'custrecord_wmsse_ser_status','T');
				}
			}
		}
	}
	else if(ItemType == "inventoryitem" || ItemType == "assemblyitem")
	{
		var bodySubRecord = trecord.createSubrecord('inventorydetail');
		bodySubRecord.selectNewLineItem('inventoryassignment');
		bodySubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', vqty);
		bodySubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', Bin);
		if(statusId != '' && statusId != 'null' && statusId != null)
		bodySubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', statusId);
		bodySubRecord.commitLineItem('inventoryassignment');
		bodySubRecord.commit();
	}


	var CompItemCount=0;
	if(trecord !=null && trecord!='')
	{
		CompItemCount=trecord.getLineItemCount('component');
	}
	
	var opentaskmemberitemdetailsResults = null;
	var memberItemsArray= new Array();
	if(CompItemCount > 0)
	{
		
		opentaskmemberitemdetailsResults=getopentaskDetails(assemblyrecid,inventoryStatusFeature);
		memberItemsArray=getMemItemQty(assemblyrecid,vmainitemQty);
	}
	for(var c=1;c<=CompItemCount;c++)
	{

		trecord.selectLineItem('component', c);
		var tLine = trecord.getLineItemValue('component','orderline', c);
		var tItem = trecord.getLineItemValue('component','item', c);		
		var itemType = nswms_GetItemType(tItem, whLocation);
	
		var compSubRecord ='';
		var enteredQty=0;
		var enteredLineArr = new Array();
		for(var c1=0;c1<opentaskmemberitemdetailsResults.length;c1++)
		{
			
			var Qty=0;
			var opentaskResult = opentaskmemberitemdetailsResults[c1];
			var openTaskSku = opentaskResult.getValue('custrecord_wmsse_sku',null,'group');
			var openTaskLine = opentaskResult.getValue('custrecord_wmsse_line_no',null,'group');
			if(openTaskSku == tItem && tLine == openTaskLine && enteredLineArr.indexOf(tLine) == -1)
			{
				var vSerialNumArray=new Array();
				var vLotNumArray=new Array();
				var componentItemOpentaskQty = opentaskResult.getValue('custrecord_wmsse_act_qty',null,'sum');
				
				//for(var m=0;m<opentaskmemberitemdetailsResults.length && (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem");m++)
				for(var m=0;m<opentaskmemberitemdetailsResults.length;m++)
				{					
					var opentaskResultSerial = opentaskmemberitemdetailsResults[m];
					var componentopenTaskSku = opentaskResultSerial.getValue('custrecord_wmsse_sku',null,'group');
					var componentopenTaskLine = opentaskResultSerial.getValue('custrecord_wmsse_line_no',null,'group');
					if(m==0)
					{
						componentItemOpentaskQty =0;
					}
					if(componentopenTaskSku == tItem && tLine == componentopenTaskLine)
					{
						componentItemOpentaskQty = parseFloat(componentItemOpentaskQty)+parseFloat(opentaskmemberitemdetailsResults[m].getValue('custrecord_wmsse_act_qty',null,'sum'));
					}
				}
				if(enteredQty ==0)
				{
					for(var m=0;m<memberItemsArray.length;m++)
					{
						var memItemDetails = memberItemsArray[m]; 
						var memItem = memItemDetails[0];
						var memItemqty = memItemDetails[1];
						var memItemline = memItemDetails[2];						
						if(memItem == tItem && memItemline == tLine)
						{
							enteredQty = Number(Big(vqty).mul(memItemqty));							
							break;
						}
					}
				}
				if(parseFloat(enteredQty)<=parseFloat(componentItemOpentaskQty))
				{
					Qty = enteredQty;
				}
				else
				{
					Qty = componentItemOpentaskQty;
				}
				var enterBin = opentaskResult.getValue('custrecord_wmsse_actendloc',null,'group');
				var batchno = opentaskResult.getValue('custrecord_wmsse_batch_num',null,'group');
				var lineno=opentaskResult.getValue('custrecord_wmsse_line_no',null,'group');
				var vConversionRate=opentaskResult.getValue('custrecord_wmsse_conversionrate',null,'group');
				
				if(vConversionRate == null || vConversionRate =='' || vConversionRate =='- None -')
					vConversionRate = 1;

				Qty = Number(Big(Qty).mul(vConversionRate));

				
				trecord.setCurrentLineItemValue('component','quantity',Qty.toFixed(8));
				
				
				if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") {
					
					var TotQtytoBuild = Qty;
					if(parseFloat(enteredQty)<=parseFloat(componentItemOpentaskQty))
					{
						enteredLineArr.push(tLine);

					}
					for(var l=0;l<opentaskmemberitemdetailsResults.length;l++)
					{
						var opentaskResult = opentaskmemberitemdetailsResults[l];
						var openTaskLotSku = opentaskResult.getValue('custrecord_wmsse_sku',null,'group');
						var openTaskLotLine = opentaskResult.getValue('custrecord_wmsse_line_no',null,'group');
						if(openTaskLotSku == tItem && tLine == openTaskLotLine && parseFloat(Qty) > 0 && parseFloat(TotQtytoBuild)>0)
						{
							var openTaskLotQty = opentaskResult.getValue('custrecord_wmsse_act_qty',null,'sum');
							var openTaskLot = opentaskResult.getValue('custrecord_wmsse_batch_num',null,'group');
							var openTaskBin = opentaskResult.getValue('custrecord_wmsse_actendloc',null,'group');
							var openTaskStatusId ="";
							if(inventoryStatusFeature == true)
							 openTaskStatusId = opentaskResult.getValue('custrecord_wmsse_inventorystatus',null,'group');
							

							var vQty = Number(Big(openTaskLotQty).mul(vConversionRate));

							if(parseFloat(TotQtytoBuild)<=parseFloat(openTaskLotQty))
							{
								openTaskLotQty=TotQtytoBuild;
							}
							else if(parseFloat(openTaskLotQty)<parseFloat(TotQtytoBuild))
							{
								openTaskLotQty=vQty;
							}							


							compSubRecord = trecord.editCurrentLineItemSubrecord('component','componentinventorydetail');

							if(compSubRecord=='' || compSubRecord==null)
							{
								compSubRecord = trecord.createCurrentLineItemSubrecord('component','componentinventorydetail');
							}
							compSubRecord.selectNewLineItem('inventoryassignment');


							//compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', openTaskLotQty);
							/*if(parseFloat(enteredQty)<=parseFloat(openTaskLotQty))
							{
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Qty);
							}
							else
							{
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', openTaskLotQty);
							}*/
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', openTaskLotQty.toFixed(8));
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', openTaskLot);
							if(openTaskStatusId != '' && openTaskStatusId != 'null' && openTaskStatusId != null)
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', openTaskStatusId);
							if(openTaskBin!=null && openTaskBin!="" && openTaskBin!='null')
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', openTaskBin);
							compSubRecord.commitLineItem('inventoryassignment');
							//compSubRecord.commit();
							vLotNumArray.push(batchno);
							//Qty = parseFloat(Qty)-parseFloat(openTaskLotQty);
							TotQtytoBuild = Number(Big(TotQtytoBuild).minus(openTaskLotQty));
						}
						//if(Qty == 0)
						if(TotQtytoBuild <= 0)
						{
							break;
						}
					}
				}
				else if (itemType == "inventoryitem" || itemType == "assemblyitem") {

					var vTotQtytoBuild = Qty;
					if(parseFloat(enteredQty)<=parseFloat(componentItemOpentaskQty))
					{
						enteredLineArr.push(tLine);

					}

					for(var z=0;z<opentaskmemberitemdetailsResults.length;z++)
					{
						var opentaskResult = opentaskmemberitemdetailsResults[z];
						var openTaskSku = opentaskResult.getValue('custrecord_wmsse_sku',null,'group');
						var openTaskLine = opentaskResult.getValue('custrecord_wmsse_line_no',null,'group');
						if(openTaskSku == tItem && tLine == openTaskLine && parseFloat(Qty) > 0 && parseFloat(vTotQtytoBuild)>0)
						{
							var openTaskQty = opentaskResult.getValue('custrecord_wmsse_act_qty',null,'sum');
							var openTaskBin = opentaskResult.getValue('custrecord_wmsse_actendloc',null,'group');
							var vConversionRate=opentaskResult.getValue('custrecord_wmsse_conversionrate',null,'group');
							var openTaskStatusId ="";
							if(inventoryStatusFeature == true)
							openTaskStatusId = opentaskResult.getValue('custrecord_wmsse_inventorystatus',null,'group');
							
							if(vConversionRate == null || vConversionRate =='' || vConversionRate =='- None -')
								vConversionRate = 1;
							var vOTQty = Number(Big(openTaskQty).mul(vConversionRate));
							if(parseFloat(vTotQtytoBuild)<=parseFloat(openTaskQty))
							{
								openTaskQty=vTotQtytoBuild;
							}
							else if(parseFloat(openTaskQty)<parseFloat(vTotQtytoBuild))
							{
								openTaskQty=vOTQty;
							}
							

							//trecord.setCurrentLineItemValue('component', 'fulfillmentbin', enterBin);	
							var compSubRecord = trecord.editCurrentLineItemSubrecord('component','componentinventorydetail');
							var cnt=0;
							if(compSubRecord=='' || compSubRecord==null)
							{
								compSubRecord = trecord.createCurrentLineItemSubrecord('component','componentinventorydetail');
								cnt =compSubRecord.getLineItemCount('inventoryassignment');
							}
							nlapiLogExecution('DEBUG', 'cnt',cnt);
							//This condition is to override prefered Bin
							if(cnt == 1)
							{
								compSubRecord.selectLineItem('inventoryassignment',1);
							}
							else
							{
								compSubRecord.selectNewLineItem('inventoryassignment');
							}
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', Qty.toFixed(8));
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
							if(openTaskStatusId != '' && openTaskStatusId != 'null' && openTaskStatusId != null)
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', openTaskStatusId);
							compSubRecord.commitLineItem('inventoryassignment');
							//compSubRecord.commit();
							vTotQtytoBuild = Number(Big(vTotQtytoBuild).minus(openTaskQty));

						}

						if(vTotQtytoBuild <= 0)
						{
							nlapiLogExecution('DEBUG', ' Invt into break',vTotQtytoBuild);
							break;
						}

					}
				}
				else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") {

					var filterssertemp1 = new Array();

					
					filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', parseInt(lineno));
					filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', assemblyrecid);
					filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', tItem);
					filterssertemp1[3] = new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', enterBin);
					
					//var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask', null, filterssertemp1,columnssertemp1);
					var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_assembly_qtyscan_ot', filterssertemp1,null);
					
					if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
					{
						var serialArray='';
						for (var k = 0; k < SrchRecordTmpSerial1.length; k++) {
							var openTaskStatusId="";
							if(inventoryStatusFeature == true)
							openTaskStatusId = SrchRecordTmpSerial1[k].getValue('custrecord_wmsse_inventorystatus',null,'group');
						
							if(serialArray==null || serialArray=='')
							{
								serialArray=SrchRecordTmpSerial1[k].getValue('custrecord_wmsse_serial_no');
							}
							else
							{
								serialArray=serialArray+","+SrchRecordTmpSerial1[k].getValue('custrecord_wmsse_serial_no');
							}
						}
						var totalSerialArray=serialArray.split(',');
						
						//trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);
						var	compSubRecord = trecord.editCurrentLineItemSubrecord('component','componentinventorydetail');

						if(compSubRecord=='' || compSubRecord==null)
						{
							compSubRecord = trecord.createCurrentLineItemSubrecord('component','componentinventorydetail');
						}
						var cnt =compSubRecord.getLineItemCount('inventoryassignment');
						if(cnt==null || cnt == '' || cnt == 'null')
						{
							cnt=0;
						}
						for (var n = 0; n < totalSerialArray.length && n < Qty; n++) {
							if(cnt > n)
							{
								compSubRecord.selectLineItem('inventoryassignment',(parseInt(n)+1));
							}
							else
							{
								compSubRecord.selectNewLineItem('inventoryassignment');
							}
							nlapiLogExecution('DEBUG', 'totalSerialArray[k]',totalSerialArray[n]);
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', totalSerialArray[n]);
							if(enterBin!=null && enterBin!="" && enterBin!='null')
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
							if(openTaskStatusId != '' && openTaskStatusId != 'null' && openTaskStatusId != null)
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', openTaskStatusId);
							compSubRecord.commitLineItem('inventoryassignment');
							
							//Case# 201416086  end
							vSerialNumArray.push(totalSerialArray[n]);
						}
						//compSubRecord.commit();
					}
				}
				//var opentaskdet = [Qty,opentaskResult.getId()];
				var opentaskdet = [Qty,openTaskLine,openTaskSku,vLotNumArray,vSerialNumArray];
				opentaskArray.push(opentaskdet);
				
			}
		}
		nlapiLogExecution('DEBUG', 'compSubRecord',compSubRecord);
		if(compSubRecord != null && compSubRecord != '')
		{
			compSubRecord.commit();
		}
		trecord.commitLineItem('component');
	}
	//}
	if(trecord != null && trecord != '')
		idl = nlapiSubmitRecord(trecord);	

	//this block is for deleting the picked serials from serial entry after  sucessfull assembuild .
	if(idl != null && idl != '' && idl != 'null' && idl != 'undefined')
	{
		/*for(var s2=0;s2<serialIds.length;s2++)
		    	{
		    	nlapiLogExecution('ERROR', 'Delete vSerialEntryId',serialIds[s2]);
				nlapiDeleteRecord('customrecord_wmsse_serialentry', serialIds[s2]);
		    	}*/
	}


	var splitdetailsArray =  new Array();
	splitdetailsArray.push(idl);
	for(var k1=0;k1<opentaskArray.length;k1++)
	{
		splitdetailsArray.push(opentaskArray[k1]);
	}

	return splitdetailsArray;
}
function getMemItemQty(vWoID,mainItemOrdQty){


	nlapiLogExecution('Debug','vWoID',vWoID);

	var filters = new Array(); 

	filters[0] = new nlobjSearchFilter('internalid', null, 'is', vWoID);
	//filters[1] = new nlobjSearchFilter('isinactive', null, 'is', 'F');//kit_id is the parameter name 
	filters[1] = new nlobjSearchFilter('mainline', null, 'is', 'F');
	
	var columns1 = new Array(); 
	/*columns1[0] = new nlobjSearchColumn('item'); 
	columns1[1] = new nlobjSearchColumn('quantity');*/
	columns1.push(new nlobjSearchColumn('line'));

	var searchresults = nlapiSearchRecord('workorder', 'customsearch_wmsse_woassembly_srh', filters, columns1 );  
	var kititemsarr = new Array();
	for(var q=0; searchresults!=null && q<searchresults.length;q++) 
	{
		var vMemQty=searchresults[q].getValue('quantity');
		var vLine = searchresults[q].getValue('line');
		if(vMemQty == null || vMemQty == '')
			vMemQty=0;

		var vMemUOMQty=0;
		if(mainItemOrdQty != null && mainItemOrdQty != '' && mainItemOrdQty != 0)
			vMemUOMQty = Number(Big(vMemQty).div(mainItemOrdQty));
		var currRow= [searchresults[q].getValue('item'),vMemUOMQty,vLine];
		kititemsarr.push(currRow);
	}
	
	return kititemsarr;



}


function getopentaskDetails(woInternalId,inventoryStatusFeature)
{
	var opentaskFilters =  new Array();
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_parent_sku_no',null,'anyof',item));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null,'anyof', ['@NONE@']));

	var opentaskColumns =  new Array();
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_batch_num',null,'group'));
	/*opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_sku',null,'group'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_line_no',null,'group'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum'));*/
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_actendloc',null,'group'));
	//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_conversionrate',null,'group'));
   if(inventoryStatusFeature == true)
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_inventorystatus',null,'group'));
	var opentaskResultsArray = new Array();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_assembly_woscan_ot',opentaskFilters,opentaskColumns);
	/*if(opentaskResults !=null && opentaskResults !='')
	{

		for(var k=0;k<opentaskResults.length;k++)
		{
			var sku = opentaskResults[k].getValue('custrecord_wmsse_sku');
			var lineno = opentaskResults[k].getValue('custrecord_wmsse_line_no');
			var key = sku+"-"+lineno
			var currRow = [key,opentaskResults[k]];
			opentaskResultsArray.push(currRow);
		}
	}
	 */
	return opentaskResults;
}

function getOpenTaskLineDetails(woInternalid,otLine,otSku,otLot,otSerial)
{
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalid));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null,'anyof', ['@NONE@']));
	//opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	if(otSku !=null && otSku !='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof',otSku));
	if(otLine !=null && otLine !='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'equalto',otLine));
	if(otLot !=null && otLot !='' && otLot !='null')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_batch_num',null,'is',otLot));
	if(otSerial !=null && otSerial !='' && otSerial !='null')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_serial_no',null,'contains',otSerial));

	var opentaskColumns =  new Array();
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_sku'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_line_no'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty'));
	opentaskColumns[0].setSort();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentask_search',opentaskFilters,opentaskColumns);


	return opentaskResults;

}