/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function CheckInLot(request, response){
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

		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');		
		var whCompany= request.getParameter('custparam_company');
		var getWONo = request.getParameter('custparam_woid');
		var getWOItem = request.getParameter('custparam_woitem');		
		var getWOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getWOInternalId = request.getParameter('custparam_wointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getwoitemqty = request.getParameter('custparam_woitemqty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
		var enterBin = request.getParameter('custparam_enterBin');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var actualBeginTime = request.getParameter('custparam_actualbegintime');
		var vUnits = request.getParameter('custparam_fetched_units');
		
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		
		var domainName = fndomainName();
		
		var st0 = domainName + '-Assembly Build Work Order';
		var getPreferBin=request.getParameter('custparam_preferbin');
		
		var logmsg = 'getWONo. = ' + getWONo + '<br>';
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';	
		logmsg = logmsg + 'getWOItem. = ' + getWOItem + '<br>';	
		logmsg = logmsg + 'getItemInternalId. = ' + getItemInternalId + '<br>';
		logmsg = logmsg + 'actualBeginTime. = ' + actualBeginTime + '<br>';	
		logmsg = logmsg + 'getItemRemQty. = ' + getItemRemQty + '<br>';	
		logmsg = logmsg + 'getItemRecQty. = ' + getItemRecQty + '<br>';	
		nlapiLogExecution('DEBUG', 'Assemblybuildlot get values :', logmsg);
		
		var isactiveflag = 'F';
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));	
		//itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		
		var itemcolumns= new Array();
		/*itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_shelflife'));
		itemcolumns.push(new nlobjSearchColumn('name'));*/	
		var itemresults= nlapiSearchRecord('item','customsearch_wmsse_assembly_lotscan_item', itemfilters, itemcolumns);
		var shelflife ='';
		if(itemresults!=null && itemresults!='')
		{
			isactiveflag = 'T';
			getWOItem = itemresults[0].getValue('name');
			
			 shelflife = itemresults[0].getValue('custitem_wmsse_shelflife');			
		}
		
		if(getWOItem == null || getWOItem =='' || getWOItem == 'null' || getWOItem == 'undefined')
		{
			getWOItem = '';
		}
		var lotno = request.getParameter('custparam_lotno');
		var lotText='';
		if(lotno!=null && lotno!='' && lotno!='undefined')
		{
			lotText=lotno;
		}
		else
		{
			lotText='';
		}
		
		var dtsettingFlag = DateSetting();
		
		//Case # 201416180 start
		var st4 = "Format: " + dtsettingFlag;	
		//Case # 201416180 end
		var st7 = "Format: DDMMYY";
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			

		}
		
		var orderType = "Work Order#";
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			
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
        

		html = html + "</head><body>"+
		//"	<script type='text/javascript'>function validateForm() { if(document.getElementById('txtlot').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;}else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		"	<script type='text/javascript'>function validateForm() {var isactiveflag=document.getElementById('hdnisactiveflag').value;var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtlot').value;if(document.getElementById('txtlot').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;}else if(isactiveflag == 'F'){document.getElementById('div_error').innerHTML ='Assembly/member items are inactive';return false;}else{ document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+	
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Assembly Build - Lot#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
		//"			<tr border='1'><td align='center'  valign='top'><b>RECEIVING</b></td></tr>"+
		//"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+orderType+ " <label>" + getWONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+
		"				<input type='hidden' name='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnwoitemqty' value=" + getwoitemqty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWoInternalId' value=" + getWOInternalId + ">"+
		"				<input type='hidden' name='hdnWoLineno' value=" + getWOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnItemType' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnenterQty' value=" + enterQty + ">"+
		"				<input type='hidden' name='hdnenterBin' value=" + enterBin + ">"+
		"				<input type='hidden' name='hdnWoItem' value='" + getWOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' id='hdnisactiveflag' name='hdnisactiveflag' value=" + isactiveflag + ">"+
		"				<input type='hidden' name='hdnwono' value=" + getWONo + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdshelflife' id='hdnshelflife' value=" + shelflife + ">"+
		"				<input type='hidden' name='hdnactualBeginTime' value='" + actualBeginTime + "'>"+
		"				<input type='hidden' name='hdnordunits' value='" + vUnits + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr><td align='left' class='labelmsg'>Assembly Item: <label>" + getWOItem + "</label></td></tr>"+
		/*"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Preferred BIN: <label>" + getPreferBin + "</label>"+
		"			</tr>"+*/
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Built Qty: <label>" + parseFloat(parseFloat(getItemRecQty).toFixed(8)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(8)) + "</label>"+
		"			</tr>"+
		/*"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan BIN"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		"				</td>"+
		"			</tr>"+*/
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Lot#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtlot'  class='smalltextbox'  id='txtlot' type='text' value='"+lotText+"'/>"+
		"				</td>"+
		"			</tr>";

		html = html + "			<tr>";
		html = html + "				<td align = 'left'  class='labelmsg'><label>" + st4;
		html = html + "				</td>";
		html = html + "			</tr>";

		html = html + "			<tr>";
		html = html + "				<td align = 'left'  class='labelmsg'>Expiry Date:</td>";
		html = html + "				</td>";
		html = html + "			</tr>";
		html = html +"<tr>"+
		"				<td align = 'left'><input name='txtexpirydate'  class='smalltextbox'  id='txtexpirydate' type='text'/>"+
		"				</td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/>"+
		//"					<input name='cmdReceiveFulls' type='submit' value='RECEIVE FULL'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/>"+
		"				</td>"+
		"			</tr>"+
		"		 </table>";
		html = html + "</form>"+
		
		"<script type='text/javascript'>document.getElementById('txtlot').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');
		var st1 = "format: MMDDYY";
		var st2 = "format: DDMMYY";
		// Forming the temporary array WOarray
		var WOarray = new Array();
		var tempflag='F';
		var enterLot=request.getParameter('txtlot');
		var enterExpiryDate=request.getParameter('txtexpirydate');
		var shelflife=request.getParameter('hdshelflife');
		WOarray["custparam_poid"] = request.getParameter('custparam_poid');
		WOarray["custparam_screenno"] = '2';
		WOarray["custparam_actualbegindate"] = request.getParameter('hdnActualBeginDate');	
		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		WOarray["custparam_option"] = request.getParameter('hdnOptedField');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		WOarray["custparam_actualbegintimeampm"] = request.getParameter('hdnActualBeginTimeAMPM');
		WOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		WOarray["custparam_pointernalid"] = request.getParameter('hdnPoInternalId');
		WOarray["custparam_lineno"] = request.getParameter('hdnPoLineno');
		WOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		WOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		WOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		WOarray["custparam_itemtype"] = request.getParameter('hdnItemType');
		WOarray["custparam_poitem"] = request.getParameter('hdnPoItem');
		WOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		WOarray["custparam_woid"] = request.getParameter('hdnwono');
		WOarray["custparam_woitem"] = request.getParameter('hdnWoItem');
		WOarray["custparam_woitemqty"] = request.getParameter('hdnwoitemqty');
		WOarray["custparam_wointernalid"] = request.getParameter('hdnWoInternalId');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnactualBeginTime');
		WOarray["custparam_fetched_units"] = request.getParameter('hdnordunits');
	
		var orderType=request.getParameter('hdnordertype');
		WOarray["custparam_ordertype"]=orderType;
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var poInternalId=request.getParameter('hdnPoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var poLineno=request.getParameter('hdnPoLineno');
		var itemType=request.getParameter('hdnItemType');
		var enterQty=request.getParameter('hdnenterQty');
		var enterBin=request.getParameter('hdnenterBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);
		var logMsg = 'PO = ' + WOarray["custparam_poid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'poInternalId = ' + poInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'poLineno = ' + poLineno + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'shelflife = ' + shelflife + '<br>';
		nlapiLogExecution('Debug', 'Processing RF - Lot', logMsg);
		var dtsettingFlag = DateSetting();
		
		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){
			
			if(enterLot!=null && enterLot!="" && enterLot!='null')
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
					var trecord = nlapiLoadRecord('transferorder', poInternalId);

					var links=trecord.getLineItemCount('links');
					if(links!=null  && links!='')
					{
						
						for(var j=0;j<links &&  IsValidSerailNumber=='F';j++)
						{
							var id=trecord.getLineItemValue('links','id',(parseInt(j)+1));
							var linktype = trecord.getLineItemValue('links','type',(parseInt(j)+1));
							
							if(linktype=='Item Fulfillment' || linktype=='EjecuciÃ¯Â¿Â½n de pedido de artÃ¯Â¿Â½culo')
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
										
										var itemfulfilserialno='';
										
										if(vAdvBinManagement)
										{
											frecord.selectLineItem('item', 1);
											
											var compSubRecord = frecord.viewCurrentLineItemSubrecord('item','inventorydetail');
											
											var polinelength =0;
											
											if(compSubRecord!=null && compSubRecord!=''&& compSubRecord!='null')
												polinelength = compSubRecord.getLineItemCount('inventoryassignment');
											
											for(var j1=1;j1<=polinelength ;j1++)
											{
												
												itemfulfilserialno=compSubRecord.getLineItemText('inventoryassignment','issueinventorynumber',j1);
												
												if(itemfulfilserialno!=null && itemfulfilserialno!='')
												{
													var tserials=itemfulfilserialno.split('');
													
													if(tserials!=null && tserials!='' && tserials.length>0)
													{
														if(tserials.indexOf(enterLot)!=-1)
														{
															nlapiLogExecution('DEBUG', 'enterLot',enterLot);
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
											
											if(tserials!=null && tserials!='' && tserials.length>0)
											{
												if(tserials.indexOf(enterLot)!=-1)
												{
													nlapiLogExecution('DEBUG', 'enterLot111111',enterLot);
													IsValidSerailNumber='T';
													break;
												}
											}
										}
										

									}
								}
							}
						}

						if(IsValidSerailNumber=='F')
						{
							WOarray["custparam_error"] = "Matching Lot Number required.</br>The Lot number on a transfer order receipt must have been fulfilled.";
							response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_lotscan', 'customdeploy_wmsse_assembly_lotscan', false, WOarray);
							return; 
						}
					}


				}
				if(enterExpiryDate!=null && enterExpiryDate!='' && enterExpiryDate!='null')
				{
					//Case # 201416190 start
					var getExpDateresult=ValidateDate(enterExpiryDate,dtsettingFlag);
					if(getExpDateresult == null || getExpDateresult == "")
					{

						WOarray["custparam_error"] = "Expiry date should be in "+ dtsettingFlag;

						response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_lotscan', 'customdeploy_wmsse_assembly_lotscan', false, WOarray);
						return;
					}
					else
					{
						var now = convertDate();
						now.setHours(0, 0, 0, 0);
						nlapiLogExecution('ERROR','Current Date', now);
						if(now > getExpDateresult)
						{
							WOarray["custparam_error"] = "Expiry date cannot be less than current date";
							response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_lotscan', 'customdeploy_wmsse_assembly_lotscan', false, WOarray);
							return;
						}
						nlapiLogExecution('ERROR','Expdate',enterExpiryDate);
						WOarray["custparam_lotexpirydate"]=enterExpiryDate;

					} 
					//Case # 201416190 end
				}
				else
				{
					
					
						var enterLotId=isInventoryNumberExists(FetchedItemId,enterLot,WOarray["custparam_whlocation"]);
						if(!enterLotId && (enterExpiryDate==null || enterExpiryDate=='' || enterExpiryDate=='null'))
						{
							//Case # 201414807  start
							
							if(shelflife != null && shelflife != '' && shelflife != 'null' && shelflife != 'undefined')
							{
									
									if(shelflife != null && shelflife != '' && shelflife != 'null' && shelflife != 'undefined' && shelflife > 0)
									{
										var currDate = convertDate();								
																		
										var ExpiryDate = nlapiAddDays(currDate,parseInt(shelflife)) ;
										
										var getExpDateresult=nlapiDateToString(ExpiryDate,dtsettingFlag);
										WOarray["custparam_lotexpirydate"]=getExpDateresult;
									}
									else
									{
										if(shelflife != null && shelflife != '' && shelflife != 'null' && shelflife != 'undefined' && shelflife <= 0)
										{
											WOarray["custparam_lotno"] = enterLot;
											WOarray["custparam_error"] = 'Shelf life period value for this item should be greater than zero.';
											response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_lotscan', 'customdeploy_wmsse_assembly_lotscan', false, WOarray);
											return;
										}
									}
								

								
							}//Case # 201414807  end
						}
						if(enterLotId)
						{
							//if lot is already exists in inventory, no need to consider expiry date
							WOarray["custparam_lotexpirydate"]="";
							nlapiLogExecution('ERROR','WOarray["custparam_lotexpirydate"]11',WOarray["custparam_lotexpirydate"]);
						}
					
					
					
				}
				WOarray["custparam_lotno"] = enterLot;
				nlapiLogExecution('ERROR','WOarray["custparam_lotexpirydate"]',WOarray["custparam_lotexpirydate"]);
				WOarray["custparam_error"] ='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
				return;
				
			}
			else
			{
				WOarray["custparam_error"] = 'Please enter/scan valid lot#';
				response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_lotscan', 'customdeploy_wmsse_assembly_lotscan', false, WOarray);
			}
		} 
		else {
			WOarray["custparam_error"] = " ";				
			response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan', 'customdeploy_wmsse_assembly_woscan', false, WOarray);
		}
	} //end of first if condition
} //end of function.


