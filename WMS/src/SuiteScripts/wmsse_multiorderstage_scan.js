/**
 * Script Description
 * This script is used to scan the qty and bin location for selected item.
 */

/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan qty and bin location
 */
function StageScan(request, response){
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

		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getSONo = request.getParameter('custparam_soId');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');
		var whCompany= request.getParameter('custparam_company');
		var getSONo = request.getParameter('custparam_soId');
		var getSOItem = request.getParameter('custparam_soitem');
		var getSOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var itemType=request.getParameter('custparam_itemtype');
		var cartonScreenRuleValue=request.getParameter('custparam_cartonscreenrulevalue');
		var carton=request.getParameter('custparam_carton');
		var cartonSize=request.getParameter('custparam_cartonsize');
		var cartonWeight=request.getParameter('custparam_cartonweight');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var ordType = request.getParameter('custparam_ordtype');
		var pickType= request.getParameter('custparam_picktype');
		var orderLevel=request.getParameter('custparam_orderlevel');
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');


		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		
		nlapiLogExecution('DEBUG', 'getItemRemQty :  getItemRecQty', getItemRemQty + " : " + getItemRecQty);
		
		var domainName = fndomainName();
		var st0 = domainName + '-FULFILLMENT QTY SCAN';
		var getPreferBin='';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "SO/TO";

		if(trantype == 'salesorder')
		{
			st0 = domainName + '-SO Picking';
			ordVar = "Sales Order#";
		}
		else
		{
			st0 = domainName + '-TO Picking';
			ordVar = "Transfer Order#";
		}


		nlapiLogExecution('DEBUG', 'getItemType', getItemType); 
		var vBinDetails=fnGetPickSatgeBinDetails(whLocation);
		nlapiLogExecution('DEBUG', 'vBinDetails', vBinDetails);


		if((vBinDetails == null || vBinDetails == 'null' || vBinDetails == '' || vBinDetails == 'undefined' || vBinDetails.length == null || vBinDetails.length == 0 )&& (errMsg == ''))
		{
			errMsg = 'Please configure stage locations.';
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
		CSSfilefound=null;
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_stage');
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		//"<link rel='stylesheet' type='text/css' href='/uirefresh/css/machine.css__NS_VER=2014.2.0&minver=111&locale=en_US.nlqs' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";

		html = html + "<script type='text/javascript'>function validateForm(){ if(document.getElementById('txtbin').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan stage bin location';return false;} else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		//html = html + "</head><body>"+
		//case # 201412820 start
		html = html + "	<script type='text/javascript'>function DisplayBin(val) { document.getElementById('txtbin').value=val;document.forms['_rf_picking_stage'].submit();document.getElementById('loading').style.display = ''; return true;}</script>";
		//case # 201412820 end
		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_picking_stage' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking Stage</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+ 
		//"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Pick Report #: <label>" + getPickreportid + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getSOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnSoItem' value='" + getSOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdncartonScreenRuleValue' value=" + cartonScreenRuleValue + ">"+
		"				<input type='hidden' name='hdncarton' value=" + carton + ">"+
		"				<input type='hidden' name='hdncartonSize' value=" + cartonSize + ">"+
		"				<input type='hidden' name='hdncartonWeight' value=" + cartonWeight + ">"+
		"				<input type='hidden' name='hdnItemType' id='hdnitemtype' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnorderLevel' value=" + orderLevel + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"               <input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnenterQty' id='hdnenterQty' value=" + enterQty + ">"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Stage Bin"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		"				</td>"+
		"			</tr><tr><td></td></tr></table>"+

		"		<table>	<tr>";
		html = html +"				<td align = 'left'><input name='cmdSend1' type='submit'  class='defaultlink'   value='' onclick='return validateForm();'/>"+
		//"				<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		//"				</td><td width='20px'></td>"+
		"				</td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Pick (Ent)' onclick='return validateForm();'/></td><td width='20px'></td><td>"+
		"			</tr>"+
		"		 </table>";
		if(vBinDetails !=null && vBinDetails!='' && vBinDetails.length > 0)
		{
			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td  align = 'middle' class='listheadertdleft listheadertextb uir-column-medium'>Bin Location"+	
			"				</td>"+			
			"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			for(var b=0;b<vBinDetails.length;b++)
			{
				if(b%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';

				var txtBin=vBinDetails[b];
				var linkBin =txtBin;				
				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td align = 'left' class='labelmsg'><a  onclick='return DisplayBin(\""+linkBin+"\");' href='#' >"+txtBin;	
				html = html +"				</a></td>";
				html = html +"			</tr>";

				if(b >=4)
					break;
			}

			html = html + 	"</td></tr></table>";


		}
		vBinDetails=null;
		html = html + "</form>"+
		"<script type='text/javascript'>document.getElementById('txtbin').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating Stage BIN');

		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var enterBin=request.getParameter('txtbin');
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_soId"] = request.getParameter('custparam_soId');
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		SOarray["custparam_option"] = request.getParameter('hdnOptedField');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		SOarray["custparam_sointernalid"] = request.getParameter('hdnSoInternalId');
		SOarray["custparam_lineno"] = request.getParameter('hdnSoLineno');
		SOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		SOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		SOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		//SOarray["custparam_soitem"] = request.getParameter('hdnSoItem');
		SOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		SOarray["custparam_cartonscreenrulevalue"]=request.getParameter('hdncartonScreenRuleValue');
		SOarray["custparam_carton"] =request.getParameter('hdncarton');
		SOarray["custparam_cartonsize"] =request.getParameter('hdncartonSize');
		SOarray["custparam_cartonweight"] =request.getParameter('hdncartonWeight');
		SOarray["custparam_itemtype"]=request.getParameter('hdnItemType');
		SOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_orderqty"] = request.getParameter('hdnorderQty');
		var foOverageCheck=request.getParameter('hdnvFOoverageChecked');
		var getPickreportid=request.getParameter('hdnPickReportId');
		SOarray["custparam_pickreportid"] =getPickreportid;	
		SOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		SOarray["custparam_uom"] = request.getParameter('hdnuom');
		SOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		SOarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		SOarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		SOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		var enterQty = request.getParameter('hdnenterQty');
		SOarray["custparam_enterQty"] = enterQty;
		var pickType = request.getParameter('hdnPickType');
		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var orderLevel=request.getParameter('hdnorderLevel');
		var itemType=request.getParameter('hdnItemType');
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var soInternalId=request.getParameter('hdnSoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var soLineno=request.getParameter('hdnSoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var preferBinQty=request.getParameter('hdnPreferBinQty');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		

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

					nlapiLogExecution('DEBUG', 'Inside validate stage bin', enterBin);
					var stgLocId=0;
					var cols =new Array();
					cols[0] = new nlobjSearchColumn('name');
					var BinlocationTypes =  new nlapiSearchRecord('customlist_wmsse_bin_loc_type', null, null, cols);
					nlapiLogExecution('DEBUG','BinlocationTypes',BinlocationTypes);
					if(BinlocationTypes != null && BinlocationTypes !='' && BinlocationTypes.length > 0)
					{
						var strName ='Stage';
						for(var b=0;b<BinlocationTypes.length;b++)
						{
							var tName= BinlocationTypes[b].getValue('name');
							nlapiLogExecution('DEBUG','tName',tName);
							if(tName == strName)
							{
								stgLocId = BinlocationTypes[b].getId();
								break;
							}
						}
					}
					var vStagebinInternalId='';
					var ordArray=new Array();
					var filter=new Array(); 
					filter.push(new nlobjSearchFilter('binnumber','null','is',enterBin));
					if(SOarray["custparam_whlocation"]!=null && SOarray["custparam_whlocation"]!='')
						filter.push(new nlobjSearchFilter('location',null,'anyof',SOarray["custparam_whlocation"]));
					filter.push(new nlobjSearchFilter('inactive',null,'is','F'));
					filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type','null','anyof',stgLocId));
					filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_stg_direction','null','anyof',['@NONE@', '2']));
					var searchrecord=nlapiSearchRecord('Bin',null,filter,null);
					if(searchrecord!=null && searchrecord!="")
						vStagebinInternalId=searchrecord[0].getId();
					nlapiLogExecution('DEBUG','vStagebinInternalId',vStagebinInternalId);

					if(vStagebinInternalId=='' || vStagebinInternalId==null)
					{
						SOarray["custparam_error"] = 'Please enter/scan valid stage bin';
						//response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan_sng', 'customdeploy_wmsse_sostage_scan_sng', false, SOarray);
						response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
						return;
					}
					var inventoryStatusFeature = isInvStatusFeatureEnabled();
					var opentaskSearchResultsPick=new Array();
					
					var opentaskSearchResults = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_open_multiorder_stage');
					opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8']));
					opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
					opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
					opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
					opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'isempty'));
					opentaskSearchResults.addFilter(new nlobjSearchFilter('mainline','custrecord_wmsse_order_no','is', 'T'));
					opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_nstrn_ref_no', null, 'anyof',['@NONE@']));
					opentaskSearchResults.addFilter(new nlobjSearchFilter('type', 'custrecord_wmsse_sku', 'noneof',['Kit','NonInvtPart','OthCharge','Service','DwnLdItem','GiftCert']));
					opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty', null, 'isnotempty'));
					opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0')); 
					opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0.0'));
					opentaskSearchResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location',null,'anyof',SOarray["custparam_whlocation"]));

					
					var resLenDetails = opentaskSearchResults.runSearch();
					
					
					var resultsPage = resLenDetails.getResults(0, 1000);
					var offset = 0;
					while (!!resultsPage && resultsPage.length > 0) 
					{
						opentaskSearchResultsPick = opentaskSearchResultsPick.concat(resultsPage);
						offset += 1000;
						resultsPage = resLenDetails.getResults(offset, offset + 1000);
					}
					
					nlapiLogExecution('DEBUG','opentaskSearchResultsPick',opentaskSearchResultsPick);
					var inventoryStatus='';
					if(opentaskSearchResultsPick !=null && opentaskSearchResultsPick !='' && opentaskSearchResultsPick !='null' && opentaskSearchResultsPick !='undefined')
					{
						var REC_TYPE = 'bintransfer';
						var binTransfer= nlapiCreateRecord(REC_TYPE);
						var itemId ='';
						var vnbinInternalId='';
						nlapiLogExecution('DEBUG','opentaskSearchResultsPick.length',opentaskSearchResultsPick.length);
						for(var x=0; x < opentaskSearchResultsPick.length; x++)
						{

							var RecordIdPick=opentaskSearchResultsPick[x].getValue('internalid');

							if(RecordIdPick!=null && RecordIdPick!='')
							{
								var vnFetchedItemId=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_sku');
								var vnItemType=nswms_GetItemType(vnFetchedItemId,SOarray["custparam_whlocation"]);
								
								var vnenterQty=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_act_qty');
								var vnConversionRate=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_conversionrate');
								if(vnConversionRate == null || vnConversionRate == '' || vnConversionRate == 'null' || vnConversionRate == 'undefined')
								{
									vnConversionRate = 1;
								}
								vnbinInternalId=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_actendloc');
								var vnBatchNum=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_batch_num');
								var vnSerialNum=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_serial_no');
								var vnSoInternalId=opentaskSearchResultsPick[x].getValue('internalid','custrecord_wmsse_order_no');
								if(inventoryStatusFeature == true)
								{
									inventoryStatus = opentaskSearchResultsPick[x].getValue('custrecord_wmsse_inventorystatus');
								}
								itemId = opentaskSearchResultsPick[x].getValue('custrecord_wmsse_sku');
								ordArray.push(vnSoInternalId);


								vnenterQty=new Big(vnenterQty);
								vnConversionRate=new Big(vnConversionRate);
								var BigvnenterQty = Number((vnenterQty.mul(vnConversionRate)).toFixed(8));
								pickStageInventoryBinTransfer(vnSoInternalId,vnItemType,SOarray["custparam_whlocation"],
										vnFetchedItemId,BigvnenterQty,vnbinInternalId,
										vStagebinInternalId,vnBatchNum,vnSerialNum,binTransfer,inventoryStatus);

							}


						}
						var binTransferId = nlapiSubmitRecord(binTransfer);

						//{
						if(ordArray!=null && ordArray!='')
						{

							for(p=0 ; p<ordArray.length ;p++)
							{
								
								var opentaskSearchResultsPick=new Array();
								var filtersPick = new nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_open_multiorder_stage');
																
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8']));
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no', null, 'is', getPickreportid));
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', ordArray[p]));
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'isempty'));
								filtersPick.addFilter(new nlobjSearchFilter('mainline','custrecord_wmsse_order_no','is', 'T'));
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_nstrn_ref_no', null, 'anyof',['@NONE@']));
								filtersPick.addFilter(new nlobjSearchFilter('type', 'custrecord_wmsse_sku', 'noneof',['NonInvtPart','OthCharge','Service','DwnLdItem','GiftCert']));
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty', null, 'isnotempty'));
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0')); 
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty',  null,'notequalto','0.0'));
								filtersPick.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location',null,'anyof',SOarray["custparam_whlocation"]));

								
								var resLenDetails = filtersPick.runSearch();
																
								var resultsPage = resLenDetails.getResults(0, 1000);
								var offset = 0;
								while (!!resultsPage && resultsPage.length > 0) 
								{
									opentaskSearchResultsPick = opentaskSearchResultsPick.concat(resultsPage);
									offset += 1000;
									resultsPage = resLenDetails.getResults(offset, offset + 1000);
								}
								if(opentaskSearchResultsPick != null && opentaskSearchResultsPick != '' && opentaskSearchResultsPick != 'null' )
								{
									for(var x1=0; x1 < opentaskSearchResultsPick.length; x1++)
									{
										var RecordIdPick=opentaskSearchResultsPick[x1].getValue('internalid');
										
										var recId=nlapiLoadRecord('customrecord_wmsse_trn_opentask',RecordIdPick);
										if(binTransferId != null && binTransferId !='')
											recId.setFieldValue('custrecord_wmsse_nstrn_ref_no',binTransferId);
										recId.setFieldValue('custrecord_wmsse_stagebinloc',vStagebinInternalId);
										recId.setFieldValue('custrecord_wmsse_actendloc',vStagebinInternalId);
										if(parseInt(x1) == parseInt(opentaskSearchResultsPick.length-1))
										{
											recId.setFieldValue('custrecord_wmsse_device_upload_flag','T');
										}
										var vPackRecId = nlapiSubmitRecord(recId);
										

									}
								}
							}
							var taskType="MOVE";
							var quantity ='';
							//To update/create open task with Move task type
							updateMoveOpenTask(itemType,SOarray["custparam_whlocation"],itemId,quantity,vnbinInternalId,vStagebinInternalId,'',binTransferId,taskType,null,SOarray["custparam_soId"]);
						}


					}
					var soLineDetails = getSOLineDetailsNew(SOarray["custparam_soId"],trantype,null,SOarray["custparam_whlocation"]);
					SOarray["custparam_error"] ='';

					if(soLineDetails != null && soLineDetails != '' && soLineDetails != 'null' && soLineDetails != 'undefined' && soLineDetails.length != null)
					{


						var vColumnslist=soLineDetails[0].getAllColumns();
						var custIndex = 12;
						var commitedQtyIndex = 25;
						var fulfilledQtyIndex = 26;
						var conversionRateIndex=27;
						var totalPickedQtyIndex =7;
						var unitsIndex = 24;
						var totalNSPickedQtyIndex =37;
						var ERPConfirmedQty =38;
						for(var x1=0;x1<vColumnslist.length;x1++)
						{
							var summaryLabel = vColumnslist[x1].getLabel();
							var name = vColumnslist[x1].getName();
							if(summaryLabel == 'Customer')
							{
								custIndex = x1;
							}
							else if (summaryLabel == 'Committed Quantity')
							{
								commitedQtyIndex = x1;
							}
							else if (summaryLabel == 'Fulfilled Quantity' && name == 'formulanumeric')
							{
								fulfilledQtyIndex = x1;
							}
							else if (summaryLabel == 'Conversion Rate')
							{
								conversionRateIndex = x1;
							}
							else if (summaryLabel == 'Total Picked Quantity')
							{
								totalPickedQtyIndex = x1;
							}
							else if(name == 'unit')
							{
								unitsIndex =x1;
							}
							else if (summaryLabel == 'ERPpickedQuantity')
							{
								totalNSPickedQtyIndex = x1;
							}
							else if (summaryLabel == 'ERP CONFIRMED QTY')
							{
								ERPConfirmedQty = x1;
							}
							else
							{

							}
						}
						for(var cnt=0;cnt<soLineDetails.length;cnt++)
						{ 

							var vsoitemRcvQty = soLineDetails[cnt].getValue('quantityshiprecv',null,'max');
							var vsoitemQty = soLineDetails[cnt].getValue('quantity',null,'max');
							//var itemCommitedQty=soLineDetails[cnt].getValue('quantitycommitted',null,'max');
							var itemCommitedQty=soLineDetails[cnt].getValue(vColumnslist[commitedQtyIndex]);			 
							var itemfulfillQty=soLineDetails[cnt].getValue(vColumnslist[fulfilledQtyIndex]);
							var vsoitemopentaskQty=soLineDetails[cnt].getValue(vColumnslist[totalPickedQtyIndex]);
							var vsoitemErpConfirmedQty=soLineDetails[cnt].getValue(vColumnslist[ERPConfirmedQty]);
							var vsoitemNSReceivedQty=soLineDetails[cnt].getValue(vColumnslist[totalNSPickedQtyIndex]);
							if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
							{
								vsoitemopentaskQty = 0;
							}
							if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' || vsoitemErpConfirmedQty=='undefined' )
							{
								vsoitemErpConfirmedQty = 0;
							}
							if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
							{
								vsoitemNSReceivedQty = 0;
							}
							
							vsoitemopentaskQty=new Big(vsoitemopentaskQty);
							vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
							vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
							vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
							var itemPickedQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
							nlapiLogExecution('DEBUG','itemPickedQty in big',itemPickedQty);

							//var itemfulfillQty=soLineDetails[cnt].getValue(vColumnslist[6]);
							if(itemCommitedQty == null || itemCommitedQty == '')
								itemCommitedQty=0;
							if(itemfulfillQty==null || itemfulfillQty=='')
								itemfulfillQty=0;
							if(itemPickedQty==null || itemPickedQty=='')
								itemPickedQty=0;											

							
							itemCommitedQty=new Big(itemCommitedQty);
							itemfulfillQty=new Big(itemfulfillQty);
							itemPickedQty=new Big(itemPickedQty);
							var itemRemQty = Number((itemCommitedQty.plus(itemfulfillQty)).minus(itemPickedQty));
							nlapiLogExecution('DEBUG','itemRemQty in big',itemRemQty);
							
							
							if((parseFloat(itemRemQty)>0) && SOarray["custparam_orderlevel"] =="T" )
							{	
								SOarray["custparam_error"] ='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
								return;
							}

							else if((parseFloat(itemRemQty)>0))
							{
								SOarray["custparam_error"] ='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
								return;
							}	


						}

					}

					response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_pickgen_scan', 'customdeploy_wmsse_multiord_pickgen_scan', false, SOarray);
					return;
				}
				/*else
				{
					SOarray["custparam_error"] = '';
					response.sendRedirect('SUITELET', 'customscript_wmsse_soqty_scan', 'customdeploy_wmsse_soqty_scan', false, SOarray);
					return;
				}*/

			}
			catch (e) 
			{

				nlapiLogExecution('Debug', 'Exception: ', e);
				if ( e instanceof nlobjError )
				{
					SOarray["custparam_error"]=e.getDetails();
					nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				}
				else
				{
					SOarray["custparam_error"]=e.toString();
					nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				}
				//response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
				response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
				return;
			} 
			finally 
			{					
				context.setSessionObject('session', null);
			}
		}
		else
		{
			SOarray["custparam_error"] = 'Transaction is in progress...';
			//response.sendRedirect('SUITELET', 'customscript_wmsse_sostage_scan', 'customdeploy_wmsse_sostage_scan', false, SOarray);
			response.sendRedirect('SUITELET', 'customscript_wmsse_multiord_stagescan', 'customdeploy_wmsse_multiord_stagescan', false, SOarray);
			return;
		}
	} //end of first if condition
} //end of function.

function fnGetPickSatgeBinDetails(strLocation)
{
	nlapiLogExecution('DEBUG','Into fnGetPickSatgeBinDetails - strLocation',strLocation);
	var vBinLocArr=new Array();
	var vPutZoneArr=new Array();

	var filterStrat = new Array(); 

	if(strLocation!= null && strLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', strLocation));
	var objBinDetails = nlapiSearchRecord('bin','customsearch_wmsse_pickstage_bindetails',filterStrat, null);
	if(objBinDetails != null && objBinDetails != '')
	{
		nlapiLogExecution('ERROR','objBinDetails',objBinDetails.length);
		for(var j=0;j<objBinDetails.length;j++)
		{
			var vValidBin=objBinDetails[j].getValue('binnumber');
			nlapiLogExecution('ERROR','vValidBin',vValidBin);
			if(vValidBin != null && vValidBin != '' && vBinLocArr.indexOf(vValidBin) == -1 && vBinLocArr.length<5)
				vBinLocArr.push(vValidBin);
			if(vBinLocArr.length>=5)
				break;
		}	
	} 

	return vBinLocArr;
}

function pickStageInventoryBinTransfer(vnSoInternalId,itemType,whLocation,itemId,quantity,fromBinId,toBinId,batchno,
		serialno,binTransfer,inventoryStatus)
{
		
	var logMsg1 = 'itemType =' + itemType + '<br>';
	logMsg1 = logMsg1 + 'whLocation = ' + whLocation + '<br>';
	logMsg1 = logMsg1 + 'itemId = ' + itemId + '<br>';
	logMsg1 = logMsg1 + 'quantity = ' + quantity + '<br>';
	logMsg1 = logMsg1 + 'fromBinId = ' + fromBinId + '<br>';
	logMsg1 = logMsg1 + 'toBinId = ' + toBinId + '<br>';
	logMsg1 = logMsg1 + 'batchno = ' + batchno + '<br>';
	logMsg1 = logMsg1 + 'batchno = ' + batchno + '<br>';
	logMsg1 = logMsg1 + 'binTransfer = ' + binTransfer + '<br>';
	nlapiLogExecution('DEBUG', 'parameters of pickStageInventoryBinTransfer', logMsg1);
	


	binTransfer.setFieldValue('location', whLocation);
	binTransfer.setFieldValue('trandate', DateStamp());


	binTransfer.selectNewLineItem('inventory');
	binTransfer.setCurrentLineItemValue('inventory', 'item', itemId);

	binTransfer.setCurrentLineItemValue('inventory', 'quantity', quantity);
	//binTransfer.setCurrentLineItemValue('inventory', 'preferredbin', '7');
	if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") 
	{
		var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
		compSubRecord.selectNewLineItem('inventoryassignment');
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', quantity);
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);       
		compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
		if(inventoryStatus !=null && inventoryStatus !='' && inventoryStatus !='null' &&
				inventoryStatus !='undefined'&& inventoryStatus !=undefined)
		{
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventoryStatus);
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'toinventorystatus', inventoryStatus);
		}
		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);                                                                                                                                            
		compSubRecord.commitLineItem('inventoryassignment');
		compSubRecord.commit();
		var compSubRecord=null;
	}
	else
	{
		var vSerialArray=serialno.split(',');
		nlapiLogExecution('DEBUG', 'vSerialArray',vSerialArray);
		if(vSerialArray != null && vSerialArray !='')
		{
			var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
			for (var n = 0; n < vSerialArray.length; n++) {
				compSubRecord.selectNewLineItem('inventoryassignment');
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', vSerialArray[n]);
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);       
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
				if(inventoryStatus !=null && inventoryStatus !='' && inventoryStatus !='null' &&
						inventoryStatus !='undefined'&& inventoryStatus !=undefined)
				{
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', inventoryStatus);
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'toinventorystatus', inventoryStatus);
				}
				compSubRecord.commitLineItem('inventoryassignment');

			}
			compSubRecord.commit();
			//compSubRecord=null;

		}
	}
	binTransfer.commitLineItem('inventory');



}