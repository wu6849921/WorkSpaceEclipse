/**
 * Script Description
 * This script is used for inventory search option
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function is for inventory search option
 */
function RFInventorySearchContinue(request, response)
{ 
	var itemid = request.getParameter('custparam_enteritemid');
	var binloc = request.getParameter('custparam_enterbinloc');
	var itemname  = request.getParameter('custparam_enteritemname');
	var binlocid = request.getParameter('custparam_enterbinlocid');
	var whLocation = request.getParameter('custparam_whlocation');
	var whLocationName = request.getParameter('custparam_whlocationname');
	var total=0;
	var getNumber=0;
	var screenHeading="Item & Bin";
	if(itemid!=null && itemid!="")
	{		
		var itemType = nswms_GetItemType(itemid, null);
	}
	if(itemid!=null && itemid!="" && (binloc==null || binloc =='' || binloc =='null') )
	{
		screenHeading="Item";
	}
	if(binloc!=null && binloc!="" && (itemid==null || itemid =='' || itemid =='null') )
	{
		screenHeading="Bin";
	}

	if(request.getParameter('custparam_number') != null && request.getParameter('custparam_number') != "")
	{
		getNumber=parseInt(request.getParameter('custparam_number'));
	}
	else
	{
		getNumber=0; 

	}
	var objBinDetails = null;
	var binInternalId = '';
	if(binloc !=null && binloc!='')
		binInternalId=nswms_GetBinInternalId(binloc,whLocation);

	var objBinStatusDetails = '';
	var blnItemUnit = "";
	var VUnitType = "";

	var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
	//Fetching InventoryStatus feature is enabled or disabled
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	nlapiLogExecution('DEBUG','inventoryStatusFeature', inventoryStatusFeature);
	if((itemid!=null && itemid!="") || (binloc !=null && binloc!=""))
	{
		nlapiLogExecution('DEBUG', 'itemType', itemType);
		if(itemType=="inventoryitem" || itemType=='' ||itemType==null || itemType=='null' || itemType=="assemblyitem" )
		{
			if(	inventoryStatusFeature == true && (itemid!=null && itemid!=""))
			{
				var itemfilters=new Array();
				itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',itemid));
				if(whLocation != null && whLocation !='' && whLocation != null)
				{
					itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
				}
				var itemcolumns= new Array();
//				itemcolumns.push(new nlobjSearchColumn('preferredbin'));
//				itemcolumns.push(new nlobjSearchColumn('itemid'));
//				itemcolumns.push(new nlobjSearchColumn('stockunit'));
//				itemcolumns.push(new nlobjSearchColumn('unitstype'));
//				itemcolumns.push(new nlobjSearchColumn('isinactive'));
//				itemcolumns[0].setSort(true);
				// Here showing first 5 results only. No need to use loadsearch to retrive 4k or more records.
				objBinDetails_item = nlapiSearchRecord('item', 'customsearch_wmsse_itemwise_inv_report', itemfilters, null);

				if(objBinDetails_item!=null && objBinDetails_item!='' && objBinDetails_item!='null')
				{
					if(objBinDetails_item[0].getValue('isinactive')=="T")
					{
						SOarray["custparam_error"] = 'Entered item is inactive';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
						return;
					}
					blnItemUnit = objBinDetails_item[0].getText('stockunit');
					VUnitType = objBinDetails_item[0].getValue('unitstype');
				}

				objBinDetails = getInventoryBalance(itemid,binInternalId,whLocation,makeInvAvailFlagFromSelect);

				if(objBinDetails != null && objBinDetails != '' && objBinDetails != 'null' && objBinDetails != 'undefined' 
					&& objBinDetails != undefined && objBinDetails.length > 0)
				{
					total = objBinDetails.length;

				}
				else
				{
					var IMovearray=new Array();
					var getLanguage = request.getParameter('hdngetLanguage');
					IMovearray["custparam_language"] = getLanguage;
					IMovearray["custparam_enteritemid"] = request.getParameter('custparam_enteritemid');
					IMovearray["custparam_enterbinloc"] = request.getParameter('custparam_enterbinloc');
					IMovearray["custparam_enteritemname"] = request.getParameter('custparam_enteritemname');
					IMovearray["custparam_enterbinlocid"] = request.getParameter('custparam_enterbinlocid');

					IMovearray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
					IMovearray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
					IMovearray["custparam_number"] = request.getParameter('custparam_number');
					IMovearray["custparam_makeinventoryavailflag"] = request.getParameter('custparam_makeinventoryavailflag');
					if(request.getParameter('custparam_error')=='' || request.getParameter('custparam_error')=="null" || 
							request.getParameter('custparam_error')==null || request.getParameter('custparam_error')=='undefined')
					{
						IMovearray["custparam_error"] = 'No records to show';
						response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search_cnt', 'customdeploy_wmsse_inventory_search_cnt', false, IMovearray);
						return;
					}
				}
			}
			else
			{
				var filterStrat = new Array();
				if(itemid != null && itemid != '')
					filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', itemid));
				if(binInternalId !=null && binInternalId!='')
					filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'is', binInternalId));
				if(whLocation!= null && whLocation!= '')
					filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', whLocation));

				var itemcolumns= new Array();
				

				objBinDetails =  nlapiSearchRecord('item','customsearch_wmsse_itemwise_inv_report',filterStrat, null);

				if(objBinDetails!=null && objBinDetails!='' && objBinDetails!='null')
				{
					if(objBinDetails[0].getValue('isinactive')=="T")
					{
						SOarray["custparam_error"] = 'Entered item is inactive';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
						return;
					}

					blnItemUnit = objBinDetails[0].getText('stockunit');
					VUnitType = objBinDetails[0].getValue('unitstype');
				}

				var binloc = "";
				var binqohqty = "";
				var itemdesc = "";
				if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0) 
				{
					total = objBinDetails.length;
				}
				else
				{
					var IMovearray=new Array();

					var getLanguage = request.getParameter('hdngetLanguage');
					IMovearray["custparam_language"] = getLanguage;
					IMovearray["custparam_enteritemid"] = request.getParameter('custparam_enteritemid');
					IMovearray["custparam_enterbinloc"] = request.getParameter('custparam_enterbinloc');
					IMovearray["custparam_enteritemname"] = request.getParameter('custparam_enteritemname');
					IMovearray["custparam_enterbinlocid"] = request.getParameter('custparam_enterbinlocid');

					IMovearray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
					IMovearray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
					IMovearray["custparam_number"] = request.getParameter('custparam_number');
					if(request.getParameter('custparam_error')=='' || request.getParameter('custparam_error')=="null" ||
							request.getParameter('custparam_error')==null || request.getParameter('custparam_error')=='undefined')
					{
						IMovearray["custparam_error"] = 'No records to show';
						response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search_cnt', 'customdeploy_wmsse_inventory_search_cnt', false, IMovearray);
						return;
					}
				}
			}		 
		}
		else
		{
			if(inventoryStatusFeature == true)
			{
				if(itemid!=null && itemid!="")
				{
					var itemfilters=new Array();
					itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',itemid));

					if(whLocation != null && whLocation !='' && whLocation != null)
					{
						itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
					}
					var itemcolumns= new Array();
//					itemcolumns.push(new nlobjSearchColumn('preferredbin'));
//					itemcolumns.push(new nlobjSearchColumn('itemid'));
//					itemcolumns.push(new nlobjSearchColumn('stockunit'));
//					itemcolumns.push(new nlobjSearchColumn('unitstype'));
//					itemcolumns.push(new nlobjSearchColumn('isinactive'));
//					itemcolumns[0].setSort(true);
					// Here showing first 5 results only. No need to use loadsearch to retrive 4k or more records.
					objBinDetails_item = nlapiSearchRecord('item', 'customsearch_wmsse_itemwise_lots_rpt', itemfilters, null);

					if(objBinDetails_item!=null && objBinDetails_item!='' && objBinDetails_item!='null')
					{
						if(objBinDetails_item[0].getValue('isinactive')=="T")
						{
							SOarray["custparam_error"] = 'Entered item is inactive';
							response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
							return;
						}

						blnItemUnit = objBinDetails_item[0].getText('stockunit');
						VUnitType = objBinDetails_item[0].getValue('unitstype');
					}

					objBinDetails = getInventoryBalance(itemid,binInternalId,whLocation,makeInvAvailFlagFromSelect);

					if(objBinDetails != null && objBinDetails != '' && objBinDetails != 'null' && objBinDetails != 'undefined' && 
							objBinDetails != undefined && objBinDetails.length > 0)
					{
						total = objBinDetails.length;
					}
					else
					{

						var IMovearray=new Array();
						var getLanguage = request.getParameter('hdngetLanguage');
						IMovearray["custparam_language"] = getLanguage;
						IMovearray["custparam_enteritemid"] = request.getParameter('custparam_enteritemid');
						IMovearray["custparam_enterbinloc"] = request.getParameter('custparam_enterbinloc');
						IMovearray["custparam_enteritemname"] = request.getParameter('custparam_enteritemname');
						IMovearray["custparam_enterbinlocid"] = request.getParameter('custparam_enterbinlocid');
						IMovearray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
						IMovearray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
						IMovearray["custparam_number"] = request.getParameter('custparam_number');
						IMovearray["custparam_makeinventoryavailflag"] = request.getParameter('custparam_makeinventoryavailflag');
						if(request.getParameter('custparam_error')=='' || request.getParameter('custparam_error')=="null" ||
								request.getParameter('custparam_error')==null || request.getParameter('custparam_error')=='undefined')
						{
							IMovearray["custparam_error"] = 'No records to show';
							response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search_cnt', 'customdeploy_wmsse_inventory_search_cnt', false, IMovearray);
							return;
						}

					}
				}
			}
			else
			{
				var filterStrat = new Array();
				if (itemid != null && itemid != "")
				{
					filterStrat.push(new nlobjSearchFilter('internalid', null, 'anyof', itemid));		 
				}
				if(whLocation != null && whLocation != '' && whLocation != 'null')
					filterStrat.push(new nlobjSearchFilter('location', 'inventoryNumberBinOnHand', 'anyof', whLocation));
				if(binInternalId != null && binInternalId != '' && binInternalId != 'null')
					filterStrat.push(new nlobjSearchFilter('binnumber', 'inventoryNumberBinOnHand', 'anyof', binInternalId));

				var columnStrat= new Array();
				

				objBinDetails = nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots_rpt',filterStrat, null);

				if(objBinDetails!=null && objBinDetails!='' && objBinDetails!='null')
				{
					if(objBinDetails[0].getValue('isinactive')=="T")
					{
						SOarray["custparam_error"] = 'Entered item is inactive';
						response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan_sng', 'customdeploy_wmsse_soitem_scan_sng', false, SOarray);
						return;
					}
					blnItemUnit = objBinDetails[0].getText('stockunit');
					VUnitType = objBinDetails[0].getValue('unitstype');
				}

				var binloc = "";
				var binqohqty = "";
				var itemdesc = "";
				var lotname = "";
				if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0) 
				{
					total = objBinDetails.length;
				}
				else
				{
					var IMovearray=new Array();
					var getLanguage = request.getParameter('hdngetLanguage');
					IMovearray["custparam_language"] = getLanguage;
					IMovearray["custparam_enteritemid"] = request.getParameter('custparam_enteritemid');
					IMovearray["custparam_enterbinloc"] = request.getParameter('custparam_enterbinloc');
					IMovearray["custparam_enteritemname"] = request.getParameter('custparam_enteritemname');
					IMovearray["custparam_enterbinlocid"] = request.getParameter('custparam_enterbinlocid');
					IMovearray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
					IMovearray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
					IMovearray["custparam_number"] = request.getParameter('custparam_number');
					if(request.getParameter('custparam_error')=='' || request.getParameter('custparam_error')=="null" ||
							request.getParameter('custparam_error')==null || request.getParameter('custparam_error')=='undefined')
					{
						IMovearray["custparam_error"] = 'No records to show';
						response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search_cnt', 'customdeploy_wmsse_inventory_search_cnt', false, IMovearray);
						return;
					}
				}
			}
		}
	}
	if (request.getMethod() == 'GET') 
	{
		var JSSurl = '';
		var JSfile = getLoadFile('wmsse_uomfunctions.js'); 
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			nlapiLogExecution('DEBUG', 'JSSurl', JSSurl); 
		}
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);

		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0,st1,st2,st3,st4,st5,st6,st7,st8,st9,st10;

		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}

		if( getLanguage == 'es_ES' || getLanguage == 'es_AR')
		{
			st0 = domainName + "MEN&#218; PRINCIPAL";
			st1 = "RECEPCI&#211;N";
			st2 = "RECOLECCION";
			st3 = "INVENTARIO";			
			st7 = "SALIR";
			st8 = "INGRESAR SELECCI&#211;N";
			st9 = "ENVIAR";
			st10 = "ANTERIOR";


		}
		else
		{
			st0 = domainName + "-Search Inventory";
			st1 = "Item: ";
			st2 = "Item Description: ";	
			st3 = "Bin Location: ";
			st4 = "Qty: ";
			st5 = "Lot No: ";

		}
		if(isNaN(total))
			total = 0;

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('DEBUG', 'CSSfilefound', CSSfilefound);
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

		var functionkeyHtml=getFunctionkeyScriptSE('_rf_wmsse_invsearch'); 
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + 
			nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";

		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}

		//Quantity Change based on UOM
		html = html +	"<script type='text/javascript'>function qtyUomOnChange(){var qtyUomcntl = document.getElementById('qtyUOMLst');" +
		"var selectedUOMValue = qtyUomcntl.options[qtyUomcntl.selectedIndex].value;" +
		"var qtyUomTbl = document.getElementById('tblqtyUOMLst');" +
		"var prevselectedUOMValue = document.getElementById('hdnuomchangedvalue').value;" +
		"document.getElementById('hdnuomchangedvalue').value = selectedUOMValue;" +
		"var rowcount = qtyUomTbl.rows.length;" +
		"for(var r=1;r<rowcount;r++){var stockqty =document.getElementById('tblqtyUOMLst').rows[r].cells[1].innerHTML;" +
		"var conersionRate = parseFloat(prevselectedUOMValue)/parseFloat(selectedUOMValue);" +
		"document.getElementById('tblqtyUOMLst').rows[r].cells[1].innerHTML = parseFloat(parseFloat(parseFloat(stockqty)*parseFloat(conersionRate)).toFixed(8));" +
		"var stockavailqty =document.getElementById('tblqtyUOMLst').rows[r].cells[3].innerHTML;" +
		"var conersionRate = parseFloat(prevselectedUOMValue)/parseFloat(selectedUOMValue);" +
		"document.getElementById('tblqtyUOMLst').rows[r].cells[3].innerHTML = parseFloat(parseFloat(parseFloat(stockavailqty)*parseFloat(conersionRate)).toFixed(8));" +
		"}return true;}</script>";

		html = html + "<script type='text/javascript'>function validateForm() {if(document.getElementById('enteroption').value == '')" +
		"{document.getElementById('div_error').innerHTML ='Please enter inventory option.';	return false;}" +
		"else{var val = document.getElementById('enteroption').value; if( (val<=0) || (val >3) || isNaN(val)){" +
		"document.getElementById('div_error').innerHTML ='Please enter valid inventory option.';return false;}else{return true;}}}</script>";

		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_wmsse_invsearch'  method='POST' >"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+		
		"		<table width='100%'  >"+
		"			<tr><td class='tableheading'>Search Inventory - "+screenHeading+"</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+
		//"		<tr><td>"+
		"		<table>";


		var vAltClass='uir-list-row-tr line uir-list-row-even';	
		var minNum=0;
		if(parseInt(getNumber)<parseInt(total))
		{
			minNum=getNumber;
		}
		var count=0;

		var uomResult = '';
		var vConversionRate=1;
		var	getStockConversionRate=1;
		var vBaseUOMSearch = '';

		//if((objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0 )||
		//	(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
		//	&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		//{
		
		if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0 )
		{
		var vColumnslist=null;
		if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0 )
		{
			vColumnslist=objBinDetails[0].getAllColumns();
		}
		html = html + 	" <tr ><td  ><table  class = 'uomstatus-gridgap'>";
		if(itemid!=null && itemid!="")
		{
			if(inventoryStatusFeature == true)
			{
				if(objBinDetails_item != null && objBinDetails_item != '' && objBinDetails_item.length > 0 )
				{
					var vitemdesc = objBinDetails_item[0].getValue('description');
					var vitem = objBinDetails_item[0].getValue('name');
					var vStockUnits = "";
					if(objBinDetails_item[0].getText('stockunit') != null && objBinDetails_item[0].getText('stockunit') != '')
						vStockUnits=objBinDetails_item[0].getText('stockunit');
				}
			}
			else
			{
				if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0 )
				{
				var vitemdesc = objBinDetails[0].getValue('description');
				var vitem = objBinDetails[0].getValue('name');
				var vStockUnits = "";
				if(objBinDetails[0].getText('stockunit') != null && objBinDetails[0].getText('stockunit') != '')
					vStockUnits=objBinDetails[0].getText('stockunit');
				}
			}

			nlapiLogExecution('DEBUG', 'vitemdesc.length', vitemdesc);
			nlapiLogExecution('DEBUG', 'vitem.length', vitem);
			nlapiLogExecution('DEBUG', 'vStockUnits.length', vStockUnits);
			
			if(vitem==null || vitem=='' || vitem=='undefined' )
				vitem='';
			if(vitemdesc==null || vitemdesc=='' || vitemdesc=='undefined' )
				vitemdesc='';

			html = html +"			<tr>";
			html = html +"				<td align = 'left' class='labelmsg'>Item: <label>" + vitem + "</label></td>";
			html = html +"          </tr>";
			html = html +"		<tr><td></td></tr><tr><td></td></tr>";
			html = html +"          <tr>";
			html = html +"				<td align = 'left' class='labelmsg'>Item Desc: <label>" + vitemdesc + "</label></td>";
			html = html +"			</tr>";
			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;' >";			
			html = html +"<tr>";

			if(VUnitType == '- None -' || VUnitType == '' || VUnitType == null)
				VUnitType ='';

			if(VUnitType != null && VUnitType != '' && VUnitType != 'null' && VUnitType != 'undefined')
			{
				uomResult= getUnitsType(VUnitType);
				vBaseUOMSearch=getBaseUnitRate(VUnitType);
				if(vBaseUOMSearch != null && vBaseUOMSearch != '')
				{
					vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
				}	
				if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
				{
					getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
				}
			}
			var qtyUomCntrlSelectedConversionRate =getStockConversionRate;
			var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
			if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && 
					qtyUOMCtrlSelectedVal !='undefined' && qtyUOMCtrlSelectedVal !=undefined)
			{
				qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
			}

			if(uomResult !=null &&  uomResult !='' && uomResult.length>0)
			{
				html=html+"<td align = 'left' class='labelmsg'>UOM</td>";
				if(inventoryStatusFeature == true)
				{
					html=html+"<td class='uom-status-display'></td>";
				}

			}
			if(inventoryStatusFeature == true)
			{
				html = html+" <td align = 'left' class='labelmsg'>Inv Status</td></tr>";
			}
			else
			{
				html=html+"</tr>";
			}
			html = html +"<tr>";

			if(uomResult !=null &&  uomResult !='' && uomResult.length>0)
			{
				html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUomOnChange();'>";
				var selectedUOM = request.getParameter('custparam_uomprevselected');
				nlapiLogExecution('DEBUG', 'selectedUOM', selectedUOM);
				for(var uomcount=0; uomcount < uomResult.length; uomcount++)
				{                    	 
					var vUOM = uomResult[uomcount].getValue('conversionrate');
					var UOMText =uomResult[uomcount].getValue('unitname');
					nlapiLogExecution('ERROR', 'vUOM', vUOM);
					if(UOMText == vStockUnits)
					{
						html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";
					}
					else
					{
						html = html +" <option     value="+vUOM+"> "+UOMText+"</option>";
					}
				}
				html = html+"</select></td>";
				if(inventoryStatusFeature == true)
				{
					html=html+"<td class='uom-status-display'></td>";
				}
			}

			if(inventoryStatusFeature == true)
			{
				var statusOptsArr = getStatusOptions();
				html = html +"<td ><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
				if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
				{
					nlapiLogExecution('ERROR', 'makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect); 
					for(var statuscount=0; statuscount < statusOptsArr.length; statuscount++)
					{                    	 
						var val = statusOptsArr[statuscount][0];
						var StatusText =statusOptsArr[statuscount][1];
						if(makeInvAvailFlagFromSelect == val)
						{
							html = html +" <option   selected  value="+val+"> "+StatusText+"</option>";
						}
						else
						{
							html = html +" <option     value="+val+"> "+StatusText+"</option>";
						}
					}
				}
				html=html+"</select></td></tr>";
			}
		}
		else
		{
			var vbin="";
			if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0 )
			{
				if(itemType=="inventoryitem" || itemType=='' ||itemType==null || itemType=='null' || itemType=="assemblyitem")
					vbin = objBinDetails[0].getText('binnumber','binonhand');
				else
					vbin = objBinDetails[0].getText('binnumber','inventoryNumberBinOnHand');
			}

			nlapiLogExecution('ERROR', 'vbin', vbin);
			html = html +"			<tr>";
			html = html +"				<td align = 'left' class='labelmsg'>Bin Location: <label>" + vbin + "</label></td>";
			html = html +"			</tr>";

		}
		html = html +"		<tr><td></td></tr><tr><td></td></tr>";
		html = html +"		 </table>";
		if(itemid!=null && itemid!="")
		{
			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;'  id='tblqtyUOMLst'>"+
			"			<tr class='uir-machine-headerrow' >"+
			"				<td>Bin"+	
			"				</td>"+
			"				<td class='align-right'>On Hand"+	
			"				</td>"+
			"				<td></td>"+
			"				<td class='align-right'>Avail"+	
			"				</td>";

			if(inventoryStatusFeature == true)
			{
				html = html +	"				<td></td>	";
				html = html +	"				<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";
			}

			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType == "serializedinventoryitem" 
				|| itemType == "serializedassemblyitem")
			{
				html = html +	"				<td>&nbsp;</td>	";
				html = html +	"				<td>Lot#/Serial#";	
				html = html +"				</td>";
			}
			html = html +"			</tr>";
		}
		else
		{
			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;'>"+
			"			<tr class='uir-machine-headerrow' >"+
			"				<td>Item"+	
			"				</td>"+
			//"				<td></td>"+
			"				<td>&nbsp;</td><td>Item Desc"+	
			"				</td>"+
			"				<td>Units"+	
			"				</td>"+
			"				<td class='align-right'>On Hand"+	
			"				</td>"+
			//	"				<td></td>"+
			"				<td class='align-right'>Avail"+	
			"				</td>";
			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType == "serializedinventoryitem" || 
					itemType == "serializedassemblyitem")
			{
				html = html +	"				<td>&nbsp;</td>	";
				html = html +	"		<td>&nbsp;</td>		<td align = 'left' class='listheadertdleft listheadertextb uir-column-medium'>Lot/Serial #";	
				html = html +"				</td>";
			}
			html = html +"			</tr>";
		}
		
			for (var bindetcount = minNum; bindetcount <  objBinDetails.length; bindetcount++) 
			{
				if(bindetcount%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				nlapiLogExecution('ERROR', 'bindetcount', bindetcount);
				nlapiLogExecution('ERROR', 'objBinDetails.length', objBinDetails.length);

				var binloc = "";
				var binqohqty = "";
				var itemdesc = "";
				var lotname="";
				var	itemdesc = "";
				var blnIsLotItem='F';
				var blnIsSerialItem='F';
				var strBinId ='';
				var strLocation='';
				var strLocationId='';
				var vnitemid='';
				var vnSerialQty='';
				var vnitemType='';
				var binAvailQty='';
				var vStockUnits = "";
				var invt_status = "";
				var invt_statusid = "";
				count=parseInt(count)+1;
				if(itemType == "inventoryitem" || itemType=='' ||itemType==null || itemType=='null' || itemType == "assemblyitem")
				{
					var searchresult=objBinDetails[bindetcount];
					if(inventoryStatusFeature == true	&& (itemid!=null && itemid!=""))
					{
						binloc = searchresult.getText('binnumber', null, 'group');
						binqohqty = searchresult.getValue('onhand', null, 'sum');
						invt_status = searchresult.getText('status', null, 'group');
						invt_statusid=searchresult.getValue('status', null, 'group');
						binAvailQty = searchresult.getValue('available', null, 'sum');
						strBinId = searchresult.getValue('binnumber', null, 'group');
						vnitemType =itemType;
						vnitemid =itemid;
					}
					else
					{
						itemname = searchresult.getValue('name');  
						vnitemid = searchresult.getValue('internalid');
						binloc = searchresult.getText('binnumber','binonhand');
						binqohqty = searchresult.getValue('quantityonhand','binonhand');
						binAvailQty = searchresult.getValue('quantityavailable','binonhand');
						itemdesc = searchresult.getValue('description'); 
						if(searchresult.getText('stockunit') != null && searchresult.getText('stockunit') != '')
							vStockUnits=searchresult.getText('stockunit');


						strBinId = searchresult.getValue('binnumber','binOnHand');
						strLocation = searchresult.getText('location','binOnHand');
						strLocationId = searchresult.getValue('location','binOnHand');

						blnIsLotItem = searchresult.getValue('islotitem');
						blnIsSerialItem = searchresult.getValue('isserialitem');
						vnitemType = searchresult.recordType;
						nlapiLogExecution('DEBUG', 'binloc', binloc);

						nlapiLogExecution('DEBUG', 'binqohqty', binqohqty);
						nlapiLogExecution('DEBUG', 'itemdesc', itemdesc);
					}
				}
				else
				{
					nlapiLogExecution('Error', 'in else itemType', itemType);
					if(inventoryStatusFeature == true)
					{
						var searchresult=objBinDetails[bindetcount];
						binloc = searchresult.getText('binnumber', null, 'group');
						binqohqty = searchresult.getValue('onhand', null, 'sum');
						invt_status = searchresult.getText('status', null, 'group');
						invt_statusid=searchresult.getValue('status', null, 'group');
						strBinId = searchresult.getValue('binnumber', null, 'group');
						blnIsLotItem = searchresult.getValue('islotitem','item', 'group');					
						binAvailQty = searchresult.getValue('available', null, 'sum');
						lotname = searchresult.getText('inventorynumber',null,'group');
						vnitemType =itemType;
						vnitemid =itemid;

					}
					else
					{
						binloc = objBinDetails[bindetcount].getText('binnumber','inventoryNumberBinOnHand');
						binqohqty = objBinDetails[bindetcount].getValue('quantityonhand','inventoryNumberBinOnHand');
						binAvailQty = objBinDetails[bindetcount].getValue('quantityavailable','inventoryNumberBinOnHand');
						itemname = objBinDetails[bindetcount].getValue('itemid');
						lotname = objBinDetails[bindetcount].getText('inventorynumber','inventoryNumberBinOnHand');
						itemdesc = objBinDetails[bindetcount].getValue('description');
						vnitemid = objBinDetails[bindetcount].getValue('internalid');
						blnIsLotItem = objBinDetails[bindetcount].getValue('islotitem');
						blnIsSerialItem = objBinDetails[bindetcount].getValue('isserialitem');
						strBinId = objBinDetails[bindetcount].getValue('binnumber','inventoryNumberBinOnHand');
						strLocation = objBinDetails[bindetcount].getText('location','inventoryNumberBinOnHand');
						strLocationId = objBinDetails[bindetcount].getValue('location','inventoryNumberBinOnHand');
						vnitemType = objBinDetails[bindetcount].recordType;
						if(objBinDetails[bindetcount].getText('stockunit') != null && objBinDetails[bindetcount].getText('stockunit') != '')
							vStockUnits=objBinDetails[bindetcount].getText('stockunit');
					}
				}
				
				/*if(invt_status != null && invt_status != undefined &&
						invt_status != 'null' && invt_status != 'undefined' && invt_status != '')
				{
					var strInvtStatusArray = invt_status.split(' ');
					nlapiLogExecution('Error', 'strInvtStatusArray', strInvtStatusArray.length+''+invt_status);
					if(strInvtStatusArray.length > 1 && strInvtStatusArray != null && strInvtStatusArray != undefined &&
							strInvtStatusArray != 'null' && strInvtStatusArray != 'undefined' && strInvtStatusArray != '')
					{
						invt_status = getInvtStatusStr(strInvtStatusArray);
					}
				}*/

				nlapiLogExecution('Error', 'vnitemType', vnitemType);
				nlapiLogExecution('Error', 'vnitemid', vnitemid);
				nlapiLogExecution('Error', 'blnIsSerialItem:blnIsLotItem', blnIsSerialItem+":"+blnIsLotItem);
				nlapiLogExecution('Error', 'strBinId', strBinId);
				nlapiLogExecution('Error', 'invt_status', invt_statusid);
				if(blnIsLotItem != null && blnIsLotItem != '' && blnIsLotItem == 'T')
				{
					vBinOpenTaskDetails = getOPenTaskPickBinDetailsLot(vnitemid,strBinId,strLocationId,objBinDetails[bindetcount].getValue('unitstype'),
							objBinDetails[bindetcount].getText('stockunit'),null,invt_statusid);
				}
				else if(blnIsSerialItem != null && blnIsSerialItem != '' && blnIsSerialItem == 'T')
				{
					vBinOpenTaskDetails = getOPenTaskPickBinDetails(vnitemid,strBinId,strLocationId,objBinDetails[bindetcount].getValue('unitstype'),
							objBinDetails[bindetcount].getText('stockunit'),null,invt_statusid);
				}
				else
				{
					vBinOpenTaskDetails = getOPenTaskPickBinDetails(vnitemid,strBinId,strLocationId,searchresult.getValue('unitstype'),
							searchresult.getText('stockunit'),null,invt_statusid);
				}
				var vOpenPickQty=0;
				if(vnitemType == "inventoryitem" || vnitemType=="assemblyitem" || vnitemType == "serializedinventoryitem" || vnitemType=="serializedassemblyitem")
				{

					var vBinOpenTaskBinQtyArr = "";
					var vBinOpenTaskBinIdArr = "";
					if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
					{
						vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
						vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
						vOpenPickQty = vBinOpenTaskBinQtyArr[0];
					}
				}
				else
				{
					var vBinOpenTaskLotArr = "";
					var vBinOpenTaskExpDateArr = "";
					var vBinOpenTaskBinIdArr = "";
					var vBinOpenTaskBinQtyArr = "";
					if(vBinOpenTaskDetails != null && vBinOpenTaskDetails!='' && vBinOpenTaskDetails.length > 0)
					{
						vBinOpenTaskBinIdArr = vBinOpenTaskDetails[0];
						vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
						vBinOpenTaskLotArr = vBinOpenTaskDetails[3];
						vBinOpenTaskExpDateArr = vBinOpenTaskDetails[4];
					}

					/*if(vBinOpenTaskLotArr!=null && vBinOpenTaskLotArr!='')
					{
						if((vBinOpenTaskLotArr.indexOf(lotname)) != -1 && (vBinOpenTaskBinIdArr[vBinOpenTaskLotArr.indexOf(lotname)] == strBinId))
						{
							vOpenPickQty = vBinOpenTaskBinQtyArr[vBinOpenTaskLotArr.indexOf(lotname)];
						}
					}*/
					if(vBinOpenTaskBinIdArr != null && vBinOpenTaskBinIdArr !='')
					{
						for(var binopentskitr=0;binopentskitr<vBinOpenTaskBinIdArr.length;binopentskitr++)
						{
							var vOpenBinId = vBinOpenTaskBinIdArr[binopentskitr];
							if(strBinId == vOpenBinId)
							{
								if(lotname!=null && lotname!='undefined' && lotname != '')
								{	
									var vOpenLot=vBinOpenTaskDetails[3][binopentskitr];
									if(lotname == vOpenLot)
									{
										vOpenPickQty=vBinOpenTaskDetails[1][binopentskitr];
										break;
									} 
								}
								else
								{
									var vOpenQtyTemp=0;
									vOpenQtyTemp = vBinOpenTaskDetails[1][binopentskitr];
									if(vOpenQtyTemp == null || vOpenQtyTemp == 0 || vOpenQtyTemp == "")
										vOpenQtyTemp=0;
									//vOpenPickQty= parseFloat(vOpenPickQty) + parseFloat(vOpenQtyTemp);
									vOpenPickQty= Big(vOpenPickQty).plus(vOpenQtyTemp);
								}	

							}
						}
					}
				}
				if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
					vOpenPickQty =0;
								
				var str='vOpenPickQty :'+vOpenPickQty;
				str=str + 'binqohqty :'+binqohqty;
				str=str + 'binAvailQty :'+binAvailQty;
				str=str + 'itemid :'+itemid;
				nlapiLogExecution('DEBUG', 'str ', str);
				
				if(vnitemType != "serializedinventoryitem" && vnitemType != "serializedassemblyitem" || 
						(itemid == "" || itemid ==" " || itemid== null || itemid =='null' || itemid == 'undefined'))
					binAvailQty = Big(binAvailQty).minus(vOpenPickQty);

				if(parseFloat(binAvailQty) < 0)
					binAvailQty = 0;

				if((binloc==null|| binloc==''|| binloc=='null') && (request.getParameter('custparam_enterbinloc')!=null && 
						request.getParameter('custparam_enterbinloc')!='' &&request.getParameter('custparam_enterbinloc')!='null'))
				{
					binloc=request.getParameter('custparam_enterbinloc');
				}
				var vSerialArray=new Array();
				if(vnitemType == "serializedinventoryitem" || vnitemType == "serializedassemblyitem")
				{
					var filters = new Array();
					var columns = new Array();
					columns.push(new nlobjSearchColumn('custrecord_wmsse_sku'));
					//columns.push(new nlobjSearchColumn('custrecord_wmsse_serial_no'));	

					if(vnitemid != null && vnitemid != '')
						filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', vnitemid));

					if(strBinId != null && strBinId != '')
						filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', strBinId));
					if(strLocationId != null && strLocationId != '')
						filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', strLocationId));
					filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', 3));// 3 - PICK
					filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [8,28]));// 8 - Picking Completed,28 - Packing Completed
					filters.push(new nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is', 'T'));
					filters.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 
							'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
					filters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));

					var objOpenTaskDetails = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentask_search',filters, columns);
					var vnSerialArr="";
					if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
					{

						for(var opentskdetitr=0; opentskdetitr < objOpenTaskDetails.length ; opentskdetitr++)
						{
							var vSerialNo = objOpenTaskDetails[opentskdetitr].getValue('custrecord_wmsse_serial_no');
							if(vnSerialArr ==null || vnSerialArr=='')
								vnSerialArr=vSerialNo;
							else
								vnSerialArr = vnSerialArr +","+vSerialNo;
						}
					}
					if(vnSerialArr !=null && vnSerialArr !="")
						vSerialArray=vnSerialArr.split(',');
					nlapiLogExecution('DEBUG', 'vSerialArray',vSerialArray);
					nlapiLogExecution('DEBUG', 'lotname',lotname);
					if(vSerialArray.indexOf(lotname) != -1)
					{
						binAvailQty = 0;
					}
				}

				//binqohqty = parseFloat(parseFloat(binqohqty).toFixed(5));
				//binAvailQty = parseFloat(parseFloat(binAvailQty).toFixed(5));

				if(itemid!=null && itemid!="")
				{
					html = html +"				<tr class='" + vAltClass + "' >";
					html = html +"				<td align = 'left' >"+binloc;	
					html = html +"				</td>";
					html = html +"				<td align = 'right' >"+parseFloat(parseFloat(binqohqty).toFixed(8));	
					html = html +"				</td>";
					html = html +"				<td></td>";
					html = html +"				<td align = 'right' >"+parseFloat(parseFloat(binAvailQty).toFixed(8));	
					html = html +"				</td>";
					if(inventoryStatusFeature == true)
					{
						html = html +"				<td></td>";
						html = html +	"				<td  class='status-cl-display'>"+invt_status;	
						html = html +"				</td>";	
					}
					if(lotname!=null && lotname!='undefined' && lotname != '')
					{
						html = html +	"				<td>&nbsp;</td>	";
						html = html +"				<td align = 'middle' >"+lotname;	
						html = html +"				</td>";
					}
					html = html +"			</tr>";
				}
				else
				{
					html = html +"				<tr class='" + vAltClass + "' >";
					html = html +"				<td align = 'left' style='word-wrap:�break-word;' width='50px' >"+itemname;	
					html = html +"				</td>";
					if(itemdesc == "" || itemdesc ==" " || itemdesc== null || itemdesc =='null' || itemdesc == 'undefined')
					{
						html = html +"				<td>&nbsp;</td><td align = 'left'  style='word-wrap:�break-word;' width='120px' >"
					}
					else
					{
						html = html +"				<td>&nbsp;</td><td align = 'left'  style='word-wrap:�break-word;' width='120px' >"+itemdesc;
					}
					html = html +"				</td>";

					html = html +"				<td align = 'left'  style='word-wrap:�break-word;' >"+vStockUnits;	
					html = html +"				</td>";
					html = html +"				<td align = 'right' >"+parseFloat(parseFloat(binqohqty).toFixed(8));	
					html = html +"				</td>";
					html = html +"				<td align = 'right' >"+parseFloat(parseFloat(binAvailQty).toFixed(8));	
					html = html +"				</td>";
					if(lotname!=null && lotname!='undefined' && lotname != '')
					{
						html = html +"			<td>&nbsp;</td>		<td align = 'middle'>"+lotname;	
						html = html +"				</td>";
					}
					html = html +"			</tr>";
				}


				if(count >=5)
					break;
			}
		}
		//}


		html = html +"		<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				</td>"+
		"			</tr>"+
		"		 </table>"+
		"		<table>	<tr>"+
		"				<td align = 'left'>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/> ";

		if(objBinDetails !=null && objBinDetails !='' && objBinDetails.length !=null && objBinDetails.length > 5)
		{
			if(parseInt(minNum)>=5)
			{
				html = html +"	&nbsp;&nbsp;&nbsp;<input name='cmdprev' type='submit' value='Prev'/>";
			}
			if((parseInt(minNum)+5)<objBinDetails.length)
			{
				html = html +"&nbsp;&nbsp;&nbsp;<input name='cmdnext' type='submit' value='Next'/>";
			}
		}
		"				</td>"+
		"			</tr>"+
		" 	</table>"+
		"	</form>"+	
		"</body>"+
		"</html>";
		objBinDetails=null;
		response.write(html);
	}
	else 
	{
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('enteroption');
		var optedEvent= request.getParameter('cmdnext');
		var optedEvent1= request.getParameter('cmdprev');
		var POarray=new Array(); 
		nlapiLogExecution('ERROR', 'optedEvent', optedEvent);
		var getLanguage = request.getParameter('hdngetLanguage');
		POarray["custparam_language"] = getLanguage;
		POarray["custparam_enteritemid"] = request.getParameter('custparam_enteritemid');
		POarray["custparam_enterbinloc"] = request.getParameter('custparam_enterbinloc');
		POarray["custparam_enteritemname"] = request.getParameter('custparam_enteritemname');
		POarray["custparam_enterbinlocid"] = request.getParameter('custparam_enterbinlocid');

		POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');


		nlapiLogExecution('DEBUG', 'getLanguage', POarray["custparam_language"]);


		var st11,st12;
		if( getLanguage == 'es_ES')
		{
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "FulfillMenu";
		}
		else
		{
			st11 = "INVALID OPTION";
			st12 = "Receiving Menu";
		}
		//	var POarray = new Array();
		var getNumber =0;
		if(request.getParameter('custparam_number') != null && request.getParameter('custparam_number') != "")
		{
			getNumber=parseInt(request.getParameter('custparam_number'));
		}
		else
		{
			getNumber=0; 

		}

		//Status Change 
		var isFromStatusChange = request.getParameter('hdnfromstatuschange');
		nlapiLogExecution('DEBUG', 'isFromStatusChange', isFromStatusChange);
		var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');
		POarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
		if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined'
			&& isFromStatusChange != undefined && isFromStatusChange=='T' )
		{
			POarray["custparam_uomprevselected"]='';
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search_cnt', 'customdeploy_wmsse_inventory_search_cnt', false, POarray);
			return;

		}

		//Next button Clicked
		if(optedEvent=='Next')
		{

			getNumber=parseInt(getNumber)+5;
			POarray["custparam_number"]= getNumber;
			response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search_cnt', 'customdeploy_wmsse_inventory_search_cnt', false, POarray);
			return;
		}

		//Prev button Clicked
		else if(optedEvent1=='Prev')
		{
			getNumber=parseInt(getNumber)-5;
			POarray["custparam_number"]= getNumber;
			response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search_cnt', 'customdeploy_wmsse_inventory_search_cnt', false, POarray);
			return;	
		}
		else
		{
			response.sendRedirect('SUITELET', 'customscript_wmsse_inventory_search', 'customdeploy_wmsse_inventory_search', false, POarray);
			return;

		}
		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}

/** 
 * Function is used to fetch the results from InventoryBalance Search
 * @param itemid,binInternalId,whLocation,makeInvAvailFlagFromSelect
 * @returns {Search object}
 */

function getInventoryBalance(itemid,binInternalId,whLocation,makeInvAvailFlagFromSelect)
{
	var objBinDetails = [];
	var result=nlapiLoadSearch('InventoryBalance', 'customsearch_wmsse_inventorybalance');

	if(itemid != null && itemid != '')
		result.addFilter(new nlobjSearchFilter('internalid','item', 'anyof', itemid));
	if(binInternalId !=null && binInternalId!='')
		result.addFilter(new nlobjSearchFilter('binnumber',null, 'is', binInternalId));
	if(whLocation!= null && whLocation!= '')
		result.addFilter(new nlobjSearchFilter('location',null, 'anyof', whLocation));
	nlapiLogExecution('DEBUG', 'makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect);
	if(makeInvAvailFlagFromSelect != null && makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'null' &&
			makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined )
	{
		if(makeInvAvailFlagFromSelect == 'T' || makeInvAvailFlagFromSelect == 'F')
		{
			result.addFilter(new nlobjSearchFilter('inventoryavailable','inventorystatus', 'is', makeInvAvailFlagFromSelect));
		}
		else
		{
			if(makeInvAvailFlagFromSelect != 'All')
			{
				result.addFilter(new nlobjSearchFilter('status',null, 'anyof', makeInvAvailFlagFromSelect));	
			}
		}
	}

	var resLen = result.runSearch();
	var srhIterator = 0;
	var resultSet = resLen.forEachResult(function(searchResult)
			{
		srhIterator++;
		objBinDetails.push(searchResult);
		if(parseFloat(srhIterator) == 4000)
		{
			return false;
		}
		return true;                // return true to keep iterating
			});

	return objBinDetails;

}
