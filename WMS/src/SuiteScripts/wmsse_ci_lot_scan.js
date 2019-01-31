/**
 * Script Description
 * This script is used to Scan Lot for Create Inventory.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function for Lot scan screen
 */
function RFInventoryCILot(request, response){
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

		var whLocation = request.getParameter('custparam_whlocation');

		nlapiLogExecution('ERROR', 'whLocation', whLocation);

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
		var lotno = request.getParameter('custparam_lotno');
		var inventorystatus = request.getParameter('custparam_inventorystatus');


		var uomqtyArr = request.getParameter('custparam_uomqtyselected');
		var lotText='';
		var isempty = 'F';
		if(lotno!=null && lotno!='' && lotno!='undefined')
		{
			lotText=lotno;
		}
		else
		{
			lotText='';
			isempty = 'T';
		}
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'is',getItemInternalId));
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('isinactive'));
		itemcolumns.push(new nlobjSearchColumn('location'));
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_shelflife'));
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
		nlapiLogExecution('ERROR', 'itemresults', itemresults);
		var shelflife ='';
		if(itemresults!=null && itemresults!='')
		{
			getFetchedItemName = itemresults[0].getValue('itemid');
			shelflife = itemresults[0].getValue('custitem_wmsse_shelflife');
		}
		nlapiLogExecution('ERROR','lotText', lotText);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-CI Inventory';
		var getPreferBin=request.getParameter('custparam_preferbin');
		var accountNo = request.getParameter('custparam_accountno');
		var dtsettingFlag = DateSetting();
		nlapiLogExecution('Debug', 'dtsettingFlag', dtsettingFlag);
		var st4 = "Format: " + dtsettingFlag;
		var st7 = "Format: DDMMYY";
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

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
		"	<script type='text/javascript'>function validateForm() {var patt = /[+|,\":<>{};`\';()/ /]/g; var lotVal=document.getElementById('txtlot').value;var dateString=document.getElementById('txtexpirydate').value; var tempDate = '20'+dateString.substring(4);if(document.getElementById('txtlot').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan lot#';return false;}else if(tempDate != null && tempDate !='' && tempDate != 'null' && dateString.length == 6 &&  (new Date(tempDate,parseInt(dateString.substring(0,2))-parseInt(1),dateString.substring(2,4)) < new Date())){document.getElementById('div_error').innerHTML ='Expiry date should be greater than current date';return false;}else{ document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+				
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Create Inventory Lot#</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+
		//"		<tr><td></td></tr><tr><td></td></tr><tr><td>"+
		"		<table>"+
		//"			<tr border='1'><td align='center'  valign='top'><b>RECEIVING</b></td></tr>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Warehouse Location: <label>" + whLocationName + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Bin Location: <label>" + enterBin + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Item: <label>" + getFetchedItemName + "</label>"+
		"			</tr>";

		html =html+"			<tr>";
		if(blnItemUnit!=null && blnItemUnit!='')
			html = html +"				<td align = 'left' class='labelmsg'>Qty: <label>" + parseFloat(parseFloat(enterQty).toFixed(8))  +  " in " + blnItemUnit  + "</label>";
		else
			html = html +"				<td align = 'left' class='labelmsg'>Qty: <label>" + parseFloat(parseFloat(enterQty).toFixed(8)) + "</label>";

		if(inventorystatus != null && inventorystatus != '' && inventorystatus != 'null' && inventorystatus != 'undefined')
		{
			var vInventoryStatus ='';
			var inventoryStatusLst = getDefaultInventoryStatusList(inventorystatus);

			if(inventoryStatusLst.length > 0)
			{
				vInventoryStatus = inventoryStatusLst[0][0];
			}

			html =html+ "			<tr>"+
			"				<td align = 'left' class='labelmsg'>Inv Status: <label>" + vInventoryStatus + "</label>"+
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
		"				<input type='hidden' name='hdnaccountNo' value=" + accountNo + ">"+	
		"				<input type='hidden' name='hdshelflife' id='hdnshelflife' value=" + shelflife + ">"+
		"				<input type='hidden' name='hdnselecteduomswithqty'  value=" + uomqtyArr + ">"+
		"				<input type='hidden' name='hdnscannedbin' id='hdscannedbin' value=" + scannedBin + ">"+
		"				<input type='hidden' name='hdnscanneditm' id='hdnsanneditm'  value=" + scannedItem + ">"+
		"               <input type='hidden' name='hdninvtstatus' id='hdnivtstatus' value=" + inventorystatus + ">"+
		"				<input type='hidden' name='hdnstockconversionrate' id='hdnstockconversionrate'  value=" + getStockConversionRate + ">"+

		"				</td>"+
		"			</tr>"+		 

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
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit'  class='defaultlink'  value='' onclick='return validateForm();'/>"+
		//"					<input name='cmdReceiveFulls' type='submit' value='RECEIVE FULL'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/></td>"+
		"				</td>"+
		"			</tr>"+
		"		 </table>"+
		"</form>"+		
		"<script type='text/javascript'>document.getElementById('txtlot').focus();</script>";
		if(isempty == 'F')
		{	
			nlapiLogExecution('ERROR', 'isempty', isempty);
			html = html +"<script type='text/javascript'>document.getElementById('txtexpirydate').focus();</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating Lot');

		// Forming the temporary array POarray  
		var POarray = new Array();
		var tempflag='F';
		var enterLot=request.getParameter('txtlot');
		var enterExpiryDate=request.getParameter('txtexpirydate');
		var shelflife=request.getParameter('hdshelflife');
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
		//POarray["custparam_enterQty"] = request.getParameter('hdnenterventerQty');
		POarray["custparam_enterQty"] = request.getParameter('hdnenterQty');
		POarray["custparam_fetcheditemname"] = request.getParameter('hdnItemName');
		POarray["custparam_accountno"] = request.getParameter('hdnaccountNo');
		POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
		POarray["custparam_entereditemid"] = request.getParameter('hdnItemInternalId');
		POarray["custparam_scanbin"] = request.getParameter('hdnscannedbin');
		POarray["custparam_scanitem"] = request.getParameter('hdnscanneditm');
		POarray["custparam_stockConversionRate"] = request.getParameter('hdnstockconversionrate');
		POarray["custparam_inventorystatus"] = inventoryStatus;
		var accountNo = request.getParameter('hdnaccountNo');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		nlapiLogExecution('ERROR', 'Processing RF - Lot', enterLot);
		nlapiLogExecution('ERROR', 'enterExpiryDate', enterExpiryDate);
		var dtsettingFlag = DateSetting();
		nlapiLogExecution('Debug', 'dtsettingFlag', dtsettingFlag);
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

					if(enterLot!=null && enterLot!="" && enterLot!='null')
					{
						var resArray =getItemMixFlag(request.getParameter('hdnItemInternalId'),
								request.getParameter('hdnenterBinId'),request.getParameter('hdnWhLocation'),
								enterLot,POarray["custparam_fromBin"]);
						nlapiLogExecution('ERROR', 'resArray', resArray);
						if(resArray[0] == 'F')
						{
							POarray["custparam_error"] = 'This item has mixlot flag false choose different bin to receive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_ci_lot_scan',
									'customdeploy_wmsse_ci_lot_scan', false, POarray);
							return;
						}
						if(resArray[1] == 'F')
						{
							POarray["custparam_error"] = 'Please select use bins flag for this item  to receive.';
							response.sendRedirect('SUITELET', 'customscript_wmsse_ci_lot_scan',
									'customdeploy_wmsse_ci_lot_scan', false, POarray);
							return;
						}


						if(enterExpiryDate!=null && enterExpiryDate!='' && enterExpiryDate!='null')
						{
							var getExpDateresult=ValidateDate(enterExpiryDate,dtsettingFlag);
							if(getExpDateresult == null || getExpDateresult == "")
							{

								POarray["custparam_error"] = "Expiry date should be in "+ dtsettingFlag;

								response.sendRedirect('SUITELET', 'customscript_wmsse_ci_lot_scan',
										'customdeploy_wmsse_ci_lot_scan', false, POarray);
								return;
							}
							else
							{
								var now = convertDate();
								now.setHours(0, 0, 0, 0);
								nlapiLogExecution('ERROR','Current Date', now);
								if(now > getExpDateresult)
								{
									nlapiLogExecution('ERROR','enterLot',enterLot);
									POarray["custparam_lotno"] = enterLot;
									POarray["custparam_error"] = "Expiry date cannot be less than current date";
									response.sendRedirect('SUITELET', 'customscript_wmsse_ci_lot_scan',
											'customdeploy_wmsse_ci_lot_scan', false, POarray);
									return;
								}
								nlapiLogExecution('ERROR','Expdate',enterExpiryDate);
								POarray["custparam_lotexpirydate"]=enterExpiryDate;

							}
						}
						else
						{


							var enterLotId=isInventoryNumberExists(POarray["custparam_fetcheditemid"],
									enterLot,POarray["custparam_whlocation"]);
							if(!enterLotId && (enterExpiryDate==null || enterExpiryDate=='' || enterExpiryDate=='null'))
							{
								//Case # 201414807  start

								if(shelflife != null && shelflife != '' && shelflife != 'null' && shelflife != 'undefined')
								{



									nlapiLogExecution('ERROR','shelfLife',shelflife);
									if(shelflife != null && shelflife != '' && shelflife != 'null'
										&& shelflife != 'undefined' && shelflife > 0)
									{
										var currDate = convertDate();								
										nlapiLogExecution('ERROR','Current Date', currDate);								
										var ExpiryDate = nlapiAddDays(currDate,parseInt(shelflife)) ;
										nlapiLogExecution('ERROR','ExpiryDate', ExpiryDate);
										var getExpDateresult=nlapiDateToString(ExpiryDate,dtsettingFlag);
										POarray["custparam_lotexpirydate"]=getExpDateresult;
									}
									else
									{
										if(shelflife != null && shelflife != '' && shelflife != 'null' 
											&& shelflife != 'undefined' && shelflife <= 0)
										{
											POarray["custparam_lotno"] = enterLot;
											POarray["custparam_error"] = 'Shelf life period value for this item should be greater than zero.';
											response.sendRedirect('SUITELET', 'customscript_wmsse_ci_lot_scan',
													'customdeploy_wmsse_ci_lot_scan', false, POarray);
											return;
										}
									}


									nlapiLogExecution('ERROR','enterExpiryDate',enterExpiryDate);
								}//Case # 201414807  end
							}




						}
						nlapiLogExecution('ERROR', 'Inside else', enterLot);
						var inventoryAdjustId=InvokeNSInventoryAdjustment(POarray["custparam_fetcheditemid"],
								POarray["custparam_itemtype"],POarray["custparam_whlocation"],Number(Big(POarray["custparam_enterQty"]).toFixed(8)),
								POarray["custparam_fromBinId"],POarray["custparam_lotexpirydate"],enterLot,'',DateStamp(),'',
								accountNo,inventoryStatus);
						POarray["custparam_error"] = '';
						nlapiLogExecution('ERROR', 'inventoryAdjustId', inventoryAdjustId);
						var taskType="INVT";
						createInventoryOpenTask(POarray["custparam_itemtype"],POarray["custparam_whlocation"],
								POarray["custparam_fetcheditemid"],Number(Big(POarray["custparam_enterQty"]).toFixed(8)),POarray["custparam_fromBinId"],
								enterLot,inventoryAdjustId,taskType,POarray["custparam_lotexpirydate"],
								POarray["custparam_blnItemUnit"],POarray["custparam_stockConversionRate"],inventoryStatus);
						response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu', 
								'customdeploy_wmsse_inventorymenu', false, POarray);
						return;

					}
					else
					{
						POarray["custparam_error"] = 'Please enter/scan valid lot#';
						response.sendRedirect('SUITELET', 'customscript_wmsse_ci_lot_scan', 
								'customdeploy_wmsse_ci_lot_scan', false, POarray);
					}
				} 
				else {
					POarray["custparam_error"] = '';
					POarray["custparam_lotno"] = '';
					response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',
							'customdeploy_wmsse_ci_bin_scan', false, POarray);
					return;
				}
			}
			catch(e)
			{
				var msgstring= e.toString();
				var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length);
				nlapiLogExecution('ERROR', 'inside catch exception', msg);
				POarray["custparam_number"] =0;
				POarray["custparam_error"] = msg;
				response.sendRedirect('SUITELET', 'customscript_wmsse_ci_lot_scan',
						'customdeploy_wmsse_ci_lot_scan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_ci_lot_scan',
					'customdeploy_wmsse_ci_lot_scan', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.

function getItemMixFlag(itemNo,binInternalId,strLocation,lotno,BinLocation)
{
	var resultArray = new Array();
	var mixFlag = "T";
	var isValid='T';
	var useBins='T';
	var mixLot='T';
	var vfilter=new Array();						
	vfilter[0]=new nlobjSearchFilter("internalid",null,"anyof",itemNo);
	//vfilter[1]=new nlobjSearchFilter("custitem_wmsse_mix_item",null,"is",'T');
	var vColumns = new Array();
	vColumns.push(new nlobjSearchColumn('custitem_wmsse_mix_item'));
	vColumns.push(new nlobjSearchColumn('usebins'));
	vColumns.push(new nlobjSearchColumn('custitem_wmsse_mix_lot'));
	var searchres=nlapiSearchRecord("item",'customsearch_wmsse_inv_basic_itemdetails',vfilter,vColumns);
	if(searchres!=null && searchres !="")
	{
		mixFlag = searchres[0].getValue('custitem_wmsse_mix_item');
		useBins= searchres[0].getValue('usebins');
		mixLot= searchres[0].getValue('custitem_wmsse_mix_lot');
	}
	nlapiLogExecution('ERROR', 'mixFlag', mixFlag);
	var getPreferBin='';
	var itemfilters=new Array();
	itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',itemNo));
	itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	//itemfilters.push(new nlobjSearchFilter('location','binnumber','anyof',['@NONE@',strLocation]));
	if(strLocation != null && strLocation !='' && strLocation != 'null')
	{
		itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',strLocation]));
	}
	var itemcolumns= new Array();
	//itemcolumns.push(new nlobjSearchColumn('preferredbin'));
	itemcolumns.push(new nlobjSearchColumn('itemid'));
	//itemcolumns.push(new nlobjSearchColumn('binnumber'));
	//itemcolumns[0].setSort(true);
	var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inventory_itemdetails', itemfilters, itemcolumns);
	if(itemresults!=null && itemresults!='')
	{
		if(itemresults[0].getValue('preferredbin')=="T")
		{
			getPreferBin = itemresults[0].getValue('binnumber');
		}
	}
	nlapiLogExecution('ERROR', 'getPreferBin', getPreferBin);
	nlapiLogExecution('ERROR', 'BinLocation', BinLocation);
	if(mixLot=='F' && (getPreferBin != BinLocation))
	{
		var filterStrat = new Array();
		/*var columns = new Array();
		columns.push(new nlobjSearchColumn('binnumber',null,'group'));*/
		//filterStrat.push(new nlobjSearchFilter('internalid',null,'noneof', itemNo));
		//filterStrat.push(new nlobjSearchFilter('quantityonhand','inventorynumber', 'greaterthan', 0));
		if(binInternalId!=null && binInternalId!='')
			filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));
		if(strLocation!= null && strLocation!= '')
			filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', strLocation));
		if(mixLot != null && mixLot != 'null' && mixLot=='F')
		{
			var LotInternalId='';
			if(lotno!=null && lotno!='' && lotno!='null' && lotno!='undefined')
			{
				//LotInternalId=GetInventoryNumberInternalId(lotno,strLocation);
				filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand','isnot', lotno));
				filterStrat.push(new nlobjSearchFilter('islotitem',null,'is', 'T'));
			}
			/*if(LotInternalId != null && LotInternalId !='' && LotInternalId != 'null')
			{
				filterStrat.push(new nlobjSearchFilter('inventorynumber',null,'noneof', LotInternalId));
			}*/
		}

		//var objInvDetails = new nlapiSearchRecord('inventorydetail',null,filterStrat, columns);
		var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);
		if(objInvDetails!=null && objInvDetails != '' && objInvDetails != 'null' && objInvDetails != 'undefined' && objInvDetails.length != null && objInvDetails.length > 0)
		{
			nlapiLogExecution('ERROR', 'objInvDetails.length', objInvDetails.length);
			isValid='F';
		}
	}
	resultArray.push(isValid);
	resultArray.push(useBins);
	return resultArray;

}
function GetInventoryNumberInternalId(lot,location)
{
	var lotInternalId = '';
	var str='lot :'+lot;
	str=str + 'location :'+location;
	nlapiLogExecution('ERROR', 'str ', str);
	var filter = new Array();
	var cols = new Array();
	cols[0]=new nlobjSearchColumn('inventorynumber');
	cols[1]=new nlobjSearchColumn('location');
	if(location != null && location != '')
		filter.push(new nlobjSearchFilter('location',null, 'anyof', location)); 
	if(lot!=null && lot!='')
		filter.push(new nlobjSearchFilter('inventorynumber',null, 'is', lot)); 
	var objDetails = new nlapiSearchRecord('inventorynumber','null',filter, cols);

	if(objDetails != null && objDetails != '' && objDetails.length > 0)
	{
		lotInternalId = objDetails[0].getId();
	}
	nlapiLogExecution('ERROR', 'lotInternalId ', lotInternalId);
	return lotInternalId;
}
