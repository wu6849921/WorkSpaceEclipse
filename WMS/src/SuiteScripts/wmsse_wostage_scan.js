/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan qty and bin location
 */
function FulfillmentStageScan(request, response)
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

		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getWONo = request.getParameter('custparam_woid');	

		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer=request.getParameter('custparam_customer');
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
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var itemType=request.getParameter('custparam_itemtype');
	 
		var whLocationName = request.getParameter('custparam_whlocationname');
		 
		var vUnits = request.getParameter("custparam_uom"); 
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var ordType = request.getParameter('custparam_ordtype');
		var pickType= request.getParameter('custparam_picktype');
		var orderLevel=request.getParameter('custparam_orderlevel');
		var getItemType = request.getParameter('custparam_itemtype');
		var enterQty = request.getParameter('custparam_enterQty');
	
		var str='getOptedField :'+getOptedField+ '<br>';
		str=str + 'getWONo :'+getWONo+ '<br>';		
		str=str + 'whLocation:'+whLocation+ '<br>';
		str=str + 'getWOItem:'+getWOItem+ '<br>';		
		nlapiLogExecution('Debug', 'WOStage Get ', str);
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		
		var domainName = fndomainName();
		
		var st0 = domainName + '-FULFILLMENT QTY SCAN';
		var getPreferBin='';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		 
			st0 = domainName + '-WO Picking';
			ordVar = "Work Order#";
	 
			
		
		var vBinDetails=fnGetPickWIPSatgeBinDetails(whLocation);
	
		
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
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_wip');
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

		html = html + "<script type='text/javascript'>function validateForm(){ if(document.getElementById('txtbin').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan WIP bin location';return false;} else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		//html = html + "</head><body>"+
		//case # 201412820 start
		html = html + "	<script type='text/javascript'>function DisplayBin(val) { document.getElementById('txtbin').value=val;document.forms['_rf_picking_wip'].submit();document.getElementById('loading').style.display = ''; return true;}</script>";
		//case # 201412820 end
		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_picking_wip' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking WIP Location</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr></table>"+
		"		<table>"+ 
		//"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getWONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWoInternalId' value=" + getWOInternalId + ">"+
		"				<input type='hidden' name='hdnWoLineno' value=" + getWOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnWoItem' value='" + getWOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		  
		"				<input type='hidden' name='hdnItemType' id='hdnitemtype' value=" + getItemType + ">"+
		"				<input type='hidden' name='hdnorderLevel' value=" + orderLevel + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		 
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnenterQty' id='hdnenterQty' value=" + enterQty + ">"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan WIP Bin"+	
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
			"				<td>Bin Location"+	
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
				html = html +"				<td><a  onclick='return DisplayBin(\""+linkBin+"\");' href='#' >"+txtBin;	
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
	else 
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating WIP BIN');

		// Forming the temporary array WOarray
		var WOarray = new Array();
		var tempflag='F';
		var enterBin=request.getParameter('txtbin');
		var ordType= request.getParameter('hdnOrdtype');
		WOarray["custparam_ordtype"] =ordType;
		WOarray["custparam_woid"] = request.getParameter('custparam_woid');
		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		WOarray["custparam_option"] = request.getParameter('hdnOptedField');
		WOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		WOarray["custparam_wointernalid"] = request.getParameter('hdnWoInternalId');
		WOarray["custparam_lineno"] = request.getParameter('hdnWoLineno');
		WOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		WOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		WOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		//WOarray["custparam_woitem"] = request.getParameter('hdnWoItem');
		WOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		 
		WOarray["custparam_itemtype"]=request.getParameter('hdnItemType');
		WOarray["custparam_orderlevel"]=request.getParameter('hdnorderLevel');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		WOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		WOarray["custparam_orderqty"] = request.getParameter('hdnorderQty');
		  
		WOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		WOarray["custparam_uom"] = request.getParameter('hdnuom');
		WOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		WOarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		WOarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		WOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		var enterQty = request.getParameter('hdnenterQty');
		WOarray["custparam_enterQty"] = enterQty;
		var pickType = request.getParameter('hdnPickType');
		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var orderLevel=request.getParameter('hdnorderLevel');
		var itemType=request.getParameter('hdnItemType');
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var woInternalId=request.getParameter('hdnWoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var woLineno=request.getParameter('hdnWoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var preferBinQty=request.getParameter('hdnPreferBinQty');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		nlapiLogExecution('Debug', 'optedEvent', optedEvent);

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
					
					
					var stgLocId=0;
					var cols =new Array();
					cols[0] = new nlobjSearchColumn('name');
					var BinlocationTypes =  new nlapiSearchRecord('customlist_wmsse_bin_loc_type', null, null, cols);
					nlapiLogExecution('Debug','BinlocationTypes',BinlocationTypes);
					if(BinlocationTypes != null && BinlocationTypes !='' && BinlocationTypes.length > 0)
					{
						var strName ='WIP';
						for(var b=0;b<BinlocationTypes.length;b++)
						{
							var tName= BinlocationTypes[b].getValue('name');
							
							if(tName == strName)
							{
								stgLocId = BinlocationTypes[b].getId();
								break;
							}
						}
					}
					var vwipbinInternalId='';
					var filter=new Array(); 
					filter.push(new nlobjSearchFilter('binnumber',null,'is',enterBin));
					if(WOarray["custparam_whlocation"]!=null && WOarray["custparam_whlocation"]!='')
						filter.push(new nlobjSearchFilter('location',null,'anyof',WOarray["custparam_whlocation"]));				
					filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type','null','anyof',stgLocId));
					filter.push(new nlobjSearchFilter('custrecord_wmsse_bin_stg_direction','null','anyof',['@NONE@', '2']));

					var searchrecord=nlapiSearchRecord('Bin','customsearch_wmsse_wo_stagescan_bin',filter,null);
					if(searchrecord!=null && searchrecord!="")
						vwipbinInternalId=searchrecord[0].getId();
					

					if(vwipbinInternalId=='' || vwipbinInternalId==null)
					{
						WOarray["custparam_error"] = 'Please enter/scan valid wip bin';
						response.sendRedirect('SUITELET', 'customscript_wmsse_wostage_scan', 'customdeploy_wmsse_wostage_scan', false, WOarray);
						return;
					}

					var filtersPick = new Array();
					filtersPick.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', woInternalId));

					var opentaskSearchResultsPick=nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_wo_stagescan_opentask',filtersPick);
				
					if(opentaskSearchResultsPick !=null && opentaskSearchResultsPick !='' && opentaskSearchResultsPick !='null' && opentaskSearchResultsPick !='undefined')
					{
						var REC_TYPE = 'bintransfer';
						var binTransfer= nlapiCreateRecord(REC_TYPE);
						var itemId ='';
						var vnbinInternalId='';
						var vInvStatus = '';
						nlapiLogExecution('Debug','opentaskSearchResultsPick.length',opentaskSearchResultsPick.length);
						for(var x=0; x < opentaskSearchResultsPick.length; x++)
						{
							var RecordIdPick=opentaskSearchResultsPick[x].getValue('internalid');
							if(RecordIdPick!=null && RecordIdPick!='')
							{
								
								var vnFetchedItemId=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_sku');
								var vnItemType=nswms_GetItemType(vnFetchedItemId,WOarray["custparam_whlocation"]);
								
								var vnenterQty=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_act_qty');
								var vnConversionRate=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_conversionrate');
								var vnbinInternalId=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_actendloc');
								var vnBatchNum=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_batch_num');
								var vnSerialNum=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_serial_no');
								var vnWoInternalId=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_order_no');
								vInvStatus=opentaskSearchResultsPick[x].getValue('custrecord_wmsse_inventorystatus');
								
								if(vnItemType == "inventoryitem" || vnItemType == "assemblyitem" || vnItemType == "lotnumberedinventoryitem" || vnItemType=="lotnumberedassemblyitem" || vnItemType == "serializedinventoryitem" || vnItemType=="serializedassemblyitem")
								{
									pickStageInventoryBinTransfer(vnWoInternalId,vnItemType,WOarray["custparam_whlocation"],vnFetchedItemId,
									Number((Big(vnenterQty).mul(vnConversionRate)).toFixed(8)),vnbinInternalId,vwipbinInternalId,vnBatchNum,vnSerialNum,
									binTransfer,WOarray["custparam_woid"],vInvStatus);
								}
							}


						}
						var binTransferId = nlapiSubmitRecord(binTransfer);
						
						if(binTransferId != null && binTransferId != 'null' && binTransferId != '' && binTransferId != 'undefined')
						{
							for(var x1=0; x1 < opentaskSearchResultsPick.length; x1++)
							{
								var RecordIdPick=opentaskSearchResultsPick[x1].getValue('internalid');
								
								var recId=nlapiLoadRecord('customrecord_wmsse_trn_opentask',RecordIdPick);
								if(binTransferId != null && binTransferId !='')
									recId.setFieldValue('custrecord_wmsse_nstrn_ref_no',binTransferId);
								recId.setFieldValue('custrecord_wmsse_stagebinloc',vwipbinInternalId);
								recId.setFieldValue('custrecord_wmsse_actendloc',vwipbinInternalId);
								/*if(parseInt(x1) == parseInt(opentaskSearchResultsPick.length-1))
								{
									recId.setFieldValue('custrecord_wmsse_device_upload_flag','T');
								}*/
								var vPackRecId = nlapiSubmitRecord(recId);
								
							}
							var taskType="MOVE";
							var quantity ='';
							//To update/create open task with Move task type
							
							updateMoveOpenTaskforInventory(itemType,WOarray["custparam_whlocation"],itemId,Number(Big(vnenterQty).toFixed(8)),vnbinInternalId,vwipbinInternalId,'',binTransferId,
									taskType,null,woInternalId,'','','',vInvStatus,vInvStatus);
						}


					}

					var woLineDetails = getWOLineDetailsNew(WOarray["custparam_woid"],WOarray["custparam_whlocation"]);

				
					if(woLineDetails !=null && woLineDetails!="")
					{
						nlapiLogExecution('Debug', 'woLineDetails.length', woLineDetails.length);
						if(woLineDetails.length>0)
						{
							var totalpickQtyIndex =7;
							var comittedQtyIndex =15;
							var builtQtyIndex =16;
							var unitsIndex =14;
							var coversionRateIndex =17;
							var vColumnslist=woLineDetails[0].getAllColumns();
							for(var x1=0;x1<vColumnslist.length;x1++)
							{
								var summaryLabel = vColumnslist[x1].getLabel();
								var name = vColumnslist[x1].getName();
								if(name == 'unit')
								{
									unitsIndex =x1;
								}
								else if(summaryLabel == 'Committed Quantity')
								{
									comittedQtyIndex = x1;
								}
								else if(summaryLabel == 'Built Quantity')
								{
									builtQtyIndex = x1;
								}
								else if(summaryLabel == 'Conversion Rate')
								{
									coversionRateIndex = x1;
								}
								else
								{

								}
							}
							var totalWOQty = 0;
							for(var cnt=0;cnt<woLineDetails.length;cnt++)
							{
								var vnitemType = woLineDetails[cnt].getValue('type','item','group');
								var vwoitemQty = woLineDetails[cnt].getValue('quantity',null,'sum');
								var itemCommitedQty=woLineDetails[cnt].getValue(vColumnslist[comittedQtyIndex]);
								var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);
								
								if(vwoitemRcvQty == null || vwoitemRcvQty =='')
									vwoitemRcvQty = 0;
								//if(vnitemType == "NonInvtPart" || vnitemType=="OthCharge" || vnitemType=="Service" || vnitemType=="DwnLdItem" || vnitemType=="GiftCert")
								if(vnitemType == 'noninventoryitem' || vnitemType == 'otherchargeitem' || vnitemType=='serviceitem' || vnitemType=='downloaditem' || vnitemType=='giftcertificateitem' 
									||vnitemType == "NonInvtPart" || vnitemType=="OthCharge" || vnitemType=="Service" || vnitemType=="DwnLdItem" || vnitemType=="GiftCert")
								{
									itemCommitedQty=woLineDetails[cnt].getValue('quantity',null,'sum');
								}
								if(itemCommitedQty == null || itemCommitedQty =='' || itemCommitedQty=='null')
								{
									itemCommitedQty=0;
								}
								totalWOQty=new Big(totalWOQty);
								itemCommitedQty=new Big(itemCommitedQty);
								vwoitemRcvQty=new Big(vwoitemRcvQty);
								
								totalWOQty = (totalWOQty).plus(itemCommitedQty).plus(vwoitemRcvQty);
								nlapiLogExecution('Debug', 'totalWOQty', totalWOQty); 
							}

							var pickedQty  = getopentaskDetails(woInternalId); 
							if(pickedQty == '' || pickedQty == null || isNaN(pickedQty))
							{
								pickedQty = 0;
							}
							

							var itemRemQty = Big(totalWOQty).minus(pickedQty);

							if((parseFloat(itemRemQty)>0))
							{	
								WOarray["custparam_error"] ='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
								return;
							}

							WOarray["custparam_error"] ='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
							return;
								 
							
						}
						else
						{
							WOarray["custparam_error"] ='';
							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
							return;

						}
					}
					else
					{
						WOarray["custparam_error"] ='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
						return;

					}
				}
				else
				{
					WOarray["custparam_error"] = '';
					response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
					return;
				}

			}
			catch (e) 
			{

				nlapiLogExecution('Debug', 'Exception: ', e);
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
				response.sendRedirect('SUITELET', 'customscript_wmsse_wostage_scan', 'customdeploy_wmsse_wostage_scan', false, WOarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_wostage_scan', 'customdeploy_wmsse_wostage_scan', false, WOarray);
		}
	} //end of first if condition
} //end of function.

function fnGetPickWIPSatgeBinDetails(strLocation)
{
	nlapiLogExecution('ERROR','Into fnGetPickWIPSatgeBinDetails - strLocation',strLocation);
	var vBinLocArr=new Array();
	var vPutZoneArr=new Array();

	var filterStrat = new Array(); 
	
	if(strLocation!= null && strLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', strLocation));
	var objBinDetails = new nlapiSearchRecord('bin','customsearch_wip_bindetails',filterStrat, null);
	if(objBinDetails != null && objBinDetails != '')
	{
		
		for(var j=0;j<objBinDetails.length;j++)
		{
			var vValidBin=objBinDetails[j].getValue('binnumber');
			
			if(vValidBin != null && vValidBin != '' && vBinLocArr.indexOf(vValidBin) == -1 && vBinLocArr.length<5)
				vBinLocArr.push(vValidBin);
			if(vBinLocArr.length>=5)
				break;
		}	
	} 

	return vBinLocArr;
}

function pickStageInventoryBinTransfer(vnSoInternalId,itemType,whLocation,itemId,quantity,fromBinId,toBinId,batchno,serialno,binTransfer,WOName,vInvStatus)
{
	nlapiLogExecution('ERROR', 'Into pickStageInventoryBinTransfer',vnSoInternalId);
	//var skt=nlapiLoadRecord('bintransfer',1076);



	binTransfer.setFieldValue('location', whLocation);
	binTransfer.setFieldValue('trandate', DateStamp());
	binTransfer.setFieldValue('memo',WOName);

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
		if(vInvStatus!=null && vInvStatus!='' && vInvStatus!='null')
		{
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInvStatus);
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'toinventorystatus', vInvStatus);
		}
		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);                                                                                                                                            
		compSubRecord.commitLineItem('inventoryassignment');
		compSubRecord.commit();
		var compSubRecord=null;
	}
	else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
	{
		var vSerialArray=serialno.split(',');
	
		if(vSerialArray != null && vSerialArray !='')
		{
			var compSubRecord = binTransfer.createCurrentLineItemSubrecord('inventory','inventorydetail');
			for (var n = 0; n < vSerialArray.length; n++) {
				compSubRecord.selectNewLineItem('inventoryassignment');
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', vSerialArray[n]);
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', fromBinId);       
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'tobinnumber', toBinId);
				if(vInvStatus!=null && vInvStatus!='' && vInvStatus!='null')
				{
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInvStatus);
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'toinventorystatus', vInvStatus);
				}
				compSubRecord.commitLineItem('inventoryassignment');

			}
			compSubRecord.commit();
			compSubRecord=null;

		}
	}
	else
	{}
	binTransfer.commitLineItem('inventory');



}

function getWOLineDetails(wonumber,whLocation,itemID)
{
	nlapiLogExecution('ERROR', 'sonumber,whLocation,itemID',wonumber+","+whLocation+","+itemID);

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
	if(itemID != null && itemID != '' && itemID !='null' && itemID!='undefined')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID));

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_fulfil_detail', filters, columns);


	return WOLineDetails;
}

function getWOLineDetailsNew(wonumber,whLocation,itemID)
{
	nlapiLogExecution('ERROR', 'sonumber,whLocation,itemID',wonumber+","+whLocation+","+itemID);

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));
	//filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
	if(itemID != null && itemID != '' && itemID !='null' && itemID!='undefined')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID));

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_woscan_srh', filters, columns);


	return WOLineDetails;
}

function getopentaskDetails(woInternalId)
{
	var pickQty = 0;
	nlapiLogExecution('ERROR', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); 
	opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

	var opentaskColumns =  new Array();

	//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum'));

	var opentaskResultsArray = new Array();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);
	
	if(opentaskResults !=null && opentaskResults !='')
	{
		
		for(var k=0;k<opentaskResults.length;k++)
		{
			
			pickQty = Number(Big(pickQty).plus(opentaskResults[k].getValue('custrecord_wmsse_act_qty',null,'sum')));
		}
	}
	return pickQty;
}