/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function WorkorderQtyScan(request, response)
{

	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();

	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');

		//Variable Declaration
		var html = '';

		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getWONo = request.getParameter('custparam_woid');

		var getActualBeginTime = request.getParameter('custparam_actualbegintime');

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
		getItemRecQty=parseFloat(parseFloat(getItemRecQty).toFixed(8));
		var vUnits = request.getParameter("custparam_uom");
		var vUnitsText = request.getParameter("custparam_uom");
		var vConversionRate = request.getParameter("custparam_conversionrate");
		var vOrderType = request.getParameter("custparam_ordertype");

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}	

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');


		var vStageScanRequired="F";		 

		vStageScanRequired=getSystemRuleProcessType('Stage picked items before shipping?',whLocation,'4');		

		if(vStageScanRequired!=null && vStageScanRequired!='')
		{ 
			vStageScanRequired="T";			 
		}
		else
		{
			vStageScanRequired="F";
		}


		var currentUser=getCurrentUser();


		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();
		var lockfilters=new Array();
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getWOInternalId));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',getWOLineNo));
		lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));

		var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

		if(lockresults!=null && lockresults!='')
		{
			var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
			var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');

			//Case # 201416005,201416187  start
			if(getLockUser!=currentUser && (parseInt(getLockLine)==parseInt(getWOLineNo)))
			{//Case # 201416005,201416187  end
				var WOarray = new Array();
				WOarray['custparam_woid']=request.getParameter('custparam_woid');
				WOarray['custparam_actualbegintime']=request.getParameter('custparam_actualbegintime');
				WOarray['custparam_whlocation']=request.getParameter('custparam_whlocation');
				WOarray['custparam_trantype']=request.getParameter('custparam_trantype');
				WOarray['custparam_company']=request.getParameter('custparam_company');
				WOarray['custparam_woitem']=request.getParameter('custparam_woitem');
				WOarray['custparam_lineno']=request.getParameter('custparam_lineno');
				WOarray['custparam_fetcheditemid']=request.getParameter('custparam_fetcheditemid');
				WOarray['custparam_wointernalid']=request.getParameter('custparam_wointernalid');
				WOarray['custparam_fetcheditemid']=request.getParameter('custparam_fetcheditemid');
				WOarray['custparam_rem_qty']=request.getParameter('custparam_rem_qty');
				WOarray['custparam_rec_qty']=request.getParameter('custparam_rec_qty');
				WOarray['custparam_uom']=request.getParameter('custparam_uom');
				WOarray['custparam_conversionrate']=request.getParameter('custparam_conversionrate');
				WOarray["custparam_error"]='The line item is being processed by other user.';
				response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
				return;
			}
			else if(parseInt(getLockLine)!=parseInt(getWOLineNo))
			{
				var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
				LockRecord.setFieldValue('name',getWOInternalId);
				LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
				LockRecord.setFieldValue('custrecord_wmsse_order',getWOInternalId);
				LockRecord.setFieldValue('custrecord_wmsse_line',getWOLineNo);
				LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
				LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
				var date = new Date();
				var mSecs = date.getTime();
				LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);
				var recid = nlapiSubmitRecord(LockRecord);
				LockRecord=null;
			}
		}
		else
		{
			var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
			LockRecord.setFieldValue('name',getWOInternalId);
			LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
			LockRecord.setFieldValue('custrecord_wmsse_order',getWOInternalId);
			LockRecord.setFieldValue('custrecord_wmsse_line',getWOLineNo);
			LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
			LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
			var date = new Date();
			var mSecs = date.getTime();
			LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);
			var recid = nlapiSubmitRecord(LockRecord);
			nlapiLogExecution('Debug', 'Record Locked Successfully', recid);
			LockRecord=null;
		}
		lockresults=null;

		lockfilters=null;


		var domainName = fndomainName();

		var st0 = domainName + '-Picking Work Order';
		var getPreferBin='';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "Work Order#";
		var btnText='Save (Ent)';
		var whLocationName = request.getParameter('custparam_whlocationname');

		var qtyCheckFlag="T";
		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();
		itemcolumns.push(new nlobjSearchColumn('preferredbin'));
		itemcolumns.push(new nlobjSearchColumn('itemid'));
		itemcolumns.push(new nlobjSearchColumn('binnumber'));
		itemcolumns.push(new nlobjSearchColumn('name'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_item'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_lot'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemgroup'));	
		itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemfamily'));	
		itemcolumns.push(new nlobjSearchColumn('binonhandavail'));
		itemcolumns.push(new nlobjSearchColumn('stockunit'));
		itemcolumns.push(new nlobjSearchColumn('unitstype'));
		itemcolumns.push(new nlobjSearchColumn('location','binnumber'));
		if(departments == true)
			itemcolumns.push(new nlobjSearchColumn('department'));
		if(classes == true)
			itemcolumns.push(new nlobjSearchColumn('class'));
		itemcolumns.push(new nlobjSearchColumn('isinactive'));
		itemcolumns[0].setSort(true);
		var itemresults= nlapiSearchRecord('item','customsearch_wmsse_woqty_item_srh', itemfilters, itemcolumns);
		var strItemGrp="";
		var strItemFam="";	
		var blnItemUnit="";
		var VUnitType ="";
		var isactiveflag = 'F';
		var itemType ='';
		var Vdepartment ="";
		var Iclass ="";
		var vClassification='';
		if(itemresults!=null && itemresults!='')
		{
			isactiveflag = 'T';

			for(var d=0;d<itemresults.length;d++)
			{
				if(itemresults[d].getValue('preferredbin')=="T" && itemresults[d].getValue('location','binnumber')==whLocation && 
						parseFloat(itemresults[d].getValue('binonhandavail'))>0)
				{
					getPreferBin = itemresults[d].getValue('binnumber');
				}
			}

			blnMixItem = itemresults[0].getValue('custitem_wmsse_mix_item');
			blnMixLot = itemresults[0].getValue('custitem_wmsse_mix_lot');
			strItemGrp = itemresults[0].getValue('custitem_wmsse_itemgroup');
			strItemFam = itemresults[0].getValue('custitem_wmsse_itemfamily');
			blnItemUnit = itemresults[0].getText('stockunit');
			VUnitType = itemresults[0].getValue('unitstype');			
			getWOItem = itemresults[0].getValue('itemid');
			itemType = itemresults[0].recordType;
			vClassification = itemresults[0].getValue('locationinvtclassification');			
			if(departments == true)
				Vdepartment = itemresults[0].getValue('department');
			if(classes == true)
				Iclass = itemresults[0].getValue('class');
			var department="";
			var vclass="";
			if(Vdepartment == null || Vdepartment == '' || Vdepartment == 'null' || Vdepartment == 'undefined')
			{
				Vdepartment = department;
			}
			if(Iclass == null || Iclass == '' || Iclass == 'null' || Iclass == 'undefined')
			{
				Iclass = vclass;
			}
		}


		if(isactiveflag == 'F')
		{
			//Case # 201416005  end
			var WOarray = new Array();
			WOarray['custparam_woid']=request.getParameter('custparam_woid');
			WOarray['custparam_actualbegintime']=request.getParameter('custparam_actualbegintime');
			WOarray['custparam_whlocation']=request.getParameter('custparam_whlocation');
			WOarray['custparam_trantype']=request.getParameter('custparam_trantype');
			WOarray['custparam_company']=request.getParameter('custparam_company');
			WOarray['custparam_woitem']=request.getParameter('custparam_woitem');
			WOarray['custparam_lineno']=request.getParameter('custparam_lineno');
			WOarray['custparam_fetcheditemid']=request.getParameter('custparam_fetcheditemid');
			WOarray['custparam_wointernalid']=request.getParameter('custparam_wointernalid');
			WOarray['custparam_fetcheditemid']=request.getParameter('custparam_fetcheditemid');
			WOarray['custparam_rem_qty']=request.getParameter('custparam_rem_qty');
			WOarray['custparam_rec_qty']=request.getParameter('custparam_rec_qty');
			WOarray['custparam_uom']=request.getParameter('custparam_uom');
			WOarray['custparam_conversionrate']=request.getParameter('custparam_conversionrate');
			WOarray["custparam_error"]='Please enter an active item';
			response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);

			return;
		}
		if(vUnits == '- None -' || vUnits == '' || vUnits == null)
			vUnits ='';
		if(VUnitType == '- None -' || VUnitType == '' || VUnitType == null)
			VUnitType ='';
		if(blnItemUnit == '- None -' || blnItemUnit == '' || blnItemUnit == null)
			blnItemUnit ='';

		var getStockConversionRate =1;

		var uomresults= new Array();
		var results='';
		var addbtnimgUrl='';
		var delbtnimgUrl='';

		if(VUnitType != null && VUnitType != '')
		{

			if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
			}

			results= getUnitsType(VUnitType);

			if(results != null && results != '' && results != 'null' && results != 'undefined')
			{
				uomresults= getUomvalues(results);

				var imgfilefound1=  getLoadFile('Plus.png');
				if(imgfilefound1)
				{
					addbtnimgUrl = imgfilefound1.getURL();

				}

				var imgfilefound2 =  getLoadFile('minus.png');
				if(imgfilefound2)
				{
					delbtnimgUrl = imgfilefound2.getURL();

				}

			}
		}
		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();

		}
		//Paging
		var vPageCount = request.getParameter('custparam_pagecount');

		if(vPageCount == null || vPageCount == '' || vPageCount == 'null' || vPageCount == 'undefined')
		{
			vPageCount = 0;
		}

		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');

		if(itemType!='noninventoryitem'&& itemType!='otherchargeitem' && itemType != 'Service' &&  itemType !='serviceitem' &&
				itemType !='downloaditem' && itemType != 'Download Item' && itemType != 'giftcertificateitem')
		{
			if(makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == '' || makeInvAvailFlagFromSelect == 'null' || 
					makeInvAvailFlagFromSelect == 'undefined')
				makeInvAvailFlagFromSelect ='T';
		}


		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType == "serializedinventoryitem" || 
				itemType=="serializedassemblyitem")
		{
			btnText='Next (Ent)';
		}


		var vBinDetails=null;
		if(itemType == "inventoryitem" || itemType == "assemblyitem"|| itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
		{

//			vBinDetails=fnGetPickBinDetails(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,vOrderType,
//					vUnits,null,vPageCount,makeInvAvailFlagFromSelect,itemType,VUnitType,blnItemUnit,getStockConversionRate);
			
			vBinDetails=fnGetPickBinDetails(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,vOrderType,
					vUnits,null,vPageCount,makeInvAvailFlagFromSelect,itemType,VUnitType,blnItemUnit,getStockConversionRate,null,vClassification);			
		}
		else if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
		{

//			vBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,vOrderType,
//					vUnits,null,vPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate);
			vBinDetails=fnGetPickBinDetailsLot(getItemInternalId,strItemGrp,strItemFam,getPreferBin,whLocation,Vdepartment,Iclass,vOrderType,
					vUnits,null,vPageCount,makeInvAvailFlagFromSelect,VUnitType,blnItemUnit,getStockConversionRate,null,null,vClassification);
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
		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		var JSSurl ='';
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();

		}


		var logMsg = 'getOptedField = ' + getOptedField + '<br>';	
		logMsg = logMsg + 'getWONo = ' + getWONo + '<br>';	
		logMsg = logMsg + 'getActualBeginTime = ' + getActualBeginTime + '<br>';	
		logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';
		logMsg = logMsg + 'getWOItem = ' + getWOItem + '<br>';
		logMsg = logMsg + 'currentUser = ' + currentUser + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';		
		nlapiLogExecution('Debug', 'Processing WO QTY Get', logMsg);

		// for UOM dropdown change
		var qtyUomCntrlSelectedConversionRate =vConversionRate;
		var qtyUOMCtrlSelectedVal = request.getParameter('custparam_uomprevselected');
		if(qtyUOMCtrlSelectedVal !=null && qtyUOMCtrlSelectedVal!='' && qtyUOMCtrlSelectedVal !='null' && qtyUOMCtrlSelectedVal !='undefined' && 
				qtyUOMCtrlSelectedVal !=undefined)
		{
			qtyUomCntrlSelectedConversionRate =qtyUOMCtrlSelectedVal;
		}

		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_qty');
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";
		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}	

		html = html +"<script type = 'text/javascript' >function validate(){ return validateFormforinventory(\""+vConversionRate+"\",\""+getItemRemQty+"\",'hdnselecteduomswithqty','hdnItemType','txtbin','hdnPreferBin','hdntotaluomqtyentered') }</script>";
		html = html +"<script type = 'text/javascript' >function validatebin(bin){ return DisplayBinforinventory(bin,\""+vConversionRate+"\",\""+getItemRemQty+"\",'hdnselecteduomswithqty','hdntotaluomqtyentered','hdnItemType','txtbin','_rf_picking_qty') }</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_picking_qty' method='POST'>"+ 
		"<input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validate();'/>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Work Order Picking</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
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
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnItemType' id='hdnItemType' value=" + itemType + ">"+
		"				<input type='hidden' name='hdnqtyCheckFlag' id='hdnqtyCheckFlag' value=" + qtyCheckFlag + ">"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnuom' id='hdnuom' value=" + vUnits + ">"+
		"				<input type='hidden' name='hdnuomtext' id='hdnuomtext' value=" + vUnitsText + ">"+
		"				<input type='hidden' name='hdnvConversionRate' id='hdnvConversionRate' value=" + vConversionRate + ">"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnblnItemUnit' id='hdnblnItemUnit' value='" + blnItemUnit + "'>"+
		"				<input type='hidden' name='hdnisactiveflag' id='hdnisactiveflag' value=" + isactiveflag + ">"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+	
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+
		"				<input type='hidden' name='hdnvStageScanRequired' value='" +vStageScanRequired+"'>"+
		"				<input type='hidden' name='hdnuomchangedvalue' id='hdnuomchangedvalue' value=" + qtyUomCntrlSelectedConversionRate + ">"+
		"				<input type='hidden' name='hdnPageCount' id='hdnPageCount' value=" + vPageCount + ">"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				<input type='hidden' name='hdntostatusid' id='hdntostatusid'>"+	
		"				<input type='hidden' name='hdnStageflag'>"+
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr><td align = 'left' class='labelmsg'>Item: <label>" + getWOItem + "</label></td></tr>"+
		"			<tr>";
		if(vUnitsText !=null && vUnitsText !='' && vUnitsText!='null' && vUnitsText !='undefined' && vUnitsText !='- None -')
		{
			html = html +"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + parseFloat(parseFloat(getItemRecQty).toFixed(8)) + " " +vUnitsText+"</label>";
		}else{
			html = html +"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + parseFloat(parseFloat(getItemRecQty).toFixed(8))+"</label>";
		}
		html = html +"			</tr>"+

		"			<tr>";
		if(vUnitsText !=null && vUnitsText !='' && vUnitsText!='null' && vUnitsText !='undefined' && vUnitsText !='- None -')
		{
			html = html +"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(8)) + " " +vUnitsText+"</label>";
		}
		else
		{
			html = html +"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(8)) +"</label>";
		}

		if(results !=null &&  results !='' && results.length>0)
		{

			var selectedUomStr = request.getParameter('custparam_uomqtyselected');

			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				html = html +"			<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox'  id='txtqty0' type='text' /></td><td></td>";

				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					if(Cnt==0)
					{						
						html = html +"<td><select id='uomlist"+Cnt+"' class='labelmsg'  name = 'uomlist"+Cnt+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";

					}
					if(vUnitsText !=null && vUnitsText !='' && vUnitsText!='null' && vUnitsText !='undefined' && vUnitsText !='- None -' && vUnitsText == UOMText)
					{
						html = html +" <option value="+vQty+" selected >"+UOMText +" </option>";
					}
					else
					{
						html = html +" <option value="+vQty+"  >"+UOMText +" </option>";
					}
				}

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+getItemRemQty+"\",\""+vConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr></table>";	
			}
			else
			{

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
					html = html +"<td><select id='uomlist"+u+"' class='labelmsg'  name = 'uomlist"+u+"'>";
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

						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+getItemRemQty+"\",\""+vConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr>";
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
			if(vUnitsText !=null && vUnitsText !='' && vUnitsText!='null' && vUnitsText !='undefined' && vUnitsText !='- None -')
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty "+ vUnitsText;
			}
			else
			{
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty " ;
			}
			html = html +"				</td>"+	 

			"			</tr>"+
			"			<tr>";
			html= html+"<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>";

			html= html+"				</td>"+
			"			</tr>";

		}

		if(itemType == "noninventoryitem" || itemType=="otherchargeitem" || itemType=="serviceitem" || itemType=="downloaditem" || itemType=="giftcertificateitem")
		{
			html = html +"			<tr>"+
			"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='hidden' value="+itemType+" readonly='readonly'/>"+
			"				</td>"+
			"			</tr>";
		}
		else
		{
			html = html +"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Enter/Scan Bin Location"+	
			"				</td>"+
			"			</tr>"+
			"			<tr>"+
			"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
			"				</td>"+
			"			</tr>";
		}

		html = html +"			</table>"+
		"			<table><tr>"+
		//	"			<tr>"+
		"				<td align = 'left'>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='"+btnText+"' onclick='return  validate();'/>"+
		"			</tr>";
		if( (itemType == "inventoryitem" || itemType == "assemblyitem") && (vStageScanRequired == "T"))
		{
			html = html +"<tr><td><input name='cmdStage' style='width:100px;' type='submit' value='Pick & Stage' onclick='this.form.hdnStageflag.value=this.value; return validate();'/></td><td colspan='4'></td></tr>";	
		}
		html = html +"		 </table>";

		// Implemented itemstatus and UOM dropdowns
		if((vBinDetails !=null && vBinDetails!='' && vBinDetails.length > 0 ) || 
				(makeInvAvailFlagFromSelect != 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null'
					&& makeInvAvailFlagFromSelect != '' && makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))

		{

			html = html + 	" <tr ><td  ><table  class='uomstatus-gridgap' >";			
			html = html +"<tr>";
			if(results !=null &&  results !='' && results.length>0)
			{
				html=html+"<td align = 'left' class='labelmsg'>UOM</td>";
				//Inventorystatus Feature is enabled
				if(inventoryStatusFeature == true)
				{
					html=html+"<td class='uom-status-display'></td>";
				}
			}

			//Inventorystatus Feature is enabled
			if(inventoryStatusFeature == true)
			{
				html = html +"<td align = 'left' class='labelmsg'>Inv Status</td></tr>";
			}
			else
			{
				html=html+"</tr>";
			}
			html = html +"<tr>";
			if(results !=null &&  results !='' && results.length>0)
			{
				html=html+"<td ><select id='qtyUOMLst' class='labelmsg'  name = 'qtyUOMLst' onchange='return qtyUom_OnChange();'>";
				var selectedUOM = request.getParameter('custparam_uomprevselected');			
				for(var uomItr=0; uomItr < results.length; uomItr++)
				{                    	 
					var vUOM = results[uomItr].getValue('conversionrate');
					var UOMText =results[uomItr].getValue('unitname');

					if( ( (selectedUOM == null && vConversionRate == vUOM) || (selectedUOM == '' && vConversionRate == vUOM)  
							|| (selectedUOM =='null' && vConversionRate == vUOM) || (selectedUOM =='undefined'  && vConversionRate == vUOM )
							|| (selectedUOM == undefined && vConversionRate == vUOM) )|| (selectedUOM == vUOM))
					{
						html = html +" <option   selected  value="+vUOM+"> "+UOMText+"</option>";

					}
					else
					{

						html = html +" <option     value="+vUOM+"> "+UOMText+"</option>";

					}
				}
				html = html+"</select></td>";
				//Inventorystatus Feature is enabled
				if(inventoryStatusFeature == true)
				{
					html=html+"<td class='uom-status-display'></td>";
				}
			}

			//Inventorystatus Feature is enabled
			if(inventoryStatusFeature == true)
			{
				var statusOptsArr = getStatusOptions();
				html = html +"<td ><select id='invtstatuslst' name='invtstatuslst' class='labelmsg'  name = 'invtfilter' onchange='invtStatus_OnChange()'>" ;
				if(statusOptsArr !=null &&  statusOptsArr !='' && statusOptsArr.length>0)
				{
					nlapiLogExecution('DEBUG', 'makeInvAvailFlagFromSelect', makeInvAvailFlagFromSelect); 

					for(var statusItr=0; statusItr < statusOptsArr.length; statusItr++)
					{           	 
						var StatusVal = statusOptsArr[statusItr][0];
						var StatusText =statusOptsArr[statusItr][1];


						if(makeInvAvailFlagFromSelect == StatusVal)
						{
							html = html +" <option   selected  value="+StatusVal+"> "+StatusText+"</option>";

						}
						else
						{
							html = html +" <option     value="+StatusVal+"> "+StatusText+"</option>";
						}

					}
				}
				html=html+"</select></td></tr>";
			}

			html = html +"</table></td></tr>" ;

			html = html +"<tr>" ;
			html = html + 	" <tr ><td  ><table  style='border-spacing: 0;' id='tblqtyUOM'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Bin"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>";
			if(inventoryStatusFeature == true)
			{
				html = html +	"			<td></td>	<td  class='status-rw-display'>Inv Status";	
				html = html +"				</td>";	
			}

			if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
			{
				html = html +"				<td></td>";
				html = html +	"			<td></td>	<td>Lot#";	
				html = html +"				</td>";
			}
			html = html +"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			var count = 0;
			var convRate = getStockConversionRate;
			var selectedUOM = request.getParameter('custparam_uomprevselected');

			if(selectedUOM != null && selectedUOM != '' && selectedUOM !='null' && selectedUOM !='undefined' && selectedUOM != undefined )
			{
				convRate = Number(Big(getStockConversionRate).div(selectedUOM));
			}
			for(var b=0;b<vBinDetails.length;b++)
			{
				count  = parseInt(count)+1;
				if(b%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';


				var txtBin='';
				var binAvailQty=0;
				var binLot='';
				var currValues = vBinDetails[b];
				var inventoryStatus = '';
				if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
				{

					txtBin = currValues[0];
					binAvailQty = Big(currValues[1]).mul(convRate);					

					inventoryStatus = currValues[4];


				}
				else
				{

					txtBin = currValues[0];
					binAvailQty = Big(currValues[1]).mul(convRate);					

					inventoryStatus = currValues[6];

					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						binLot = currValues[3];
					}
				}
				nlapiLogExecution('Debug', 'getPreferBin, txtBin', getPreferBin+","+txtBin);
				var linkBin =txtBin;
				if(getPreferBin == txtBin)
				{
					txtBin=txtBin+ "<span style='color:red;'>* </span>";
				}
				//case # 201412820 start
				html = html +"				<tr class='" + vAltClass + "' >";
				html = html +"				<td><a  onclick='return validatebin(\""+linkBin+"\");' href='#' >"+txtBin;

				html = html +"				</a></td>";
				html = html +"				<td class='align-right'>"+parseFloat(parseFloat(binAvailQty).toFixed(8));	
				html = html +"				</td>";
				if(inventoryStatusFeature == true)
				{
					html = html +	"			<td></td>	<td  class='status-cl-display'>"+inventoryStatus;	
					html = html +"				</td>";
				}

				//case # 201412820 end
				if(binLot!=null && binLot!='')
				{
					html = html +"				<td></td>";
					html = html +"				<td></td><td>"+binLot;	
					html = html +"				</td>";
				}
				html = html +"			</tr>";

				if(count >=5)
					break;
			}

			html = html + 	"</td></tr></table>";
			html = html +"		<table>	<tr>";			
			if(vPageCount>0)
			{
				html = html +"				<td align = 'left'><input name='cmdEnbPrevList' type='submit' value='Prev' onClick = 'return fnShowLoader();'/></td>";
			}
			else
			{
				html = html +"				<td >&nbsp;</td><td >&nbsp;</td>";
			}

			if((vBinDetails.length>5))
			{
				html = html +"				<td align = 'right'><input name='cmdEnbNextList' type='submit' value='Next' onClick = 'return fnShowLoader();'/></td>";
			}
			html = html +"			</tr>"+ 
			"		 </table>";

		}
		html = html + "</form>";
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
		html = html + "</body>"+
		"</html>";

		response.write(html);
	}
	else 
	{
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		//Check Inventorystatus Feature is turn on/off
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

		// Forming the temporary array WOarray
		var WOarray = new Array();
		var tempflag='F';
		var enterQty=request.getParameter('txtqty');
		var toStatus = request.getParameter('hdntostatusid');


		if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
		{
			enterQty = request.getParameter('hdntotaluomqtyentered');
			WOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');

			if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined')
			{
				enterQty = parseFloat(enterQty).toFixed(8);

			}
		}

		var enterBin=request.getParameter('txtbin');
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
		WOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		WOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate'); 
		WOarray["custparam_uom"] = request.getParameter('hdnuom');
		WOarray["custparam_uomtext"] = request.getParameter('hdnuomtext');
		WOarray["custparam_conversionrate"] = request.getParameter('hdnvConversionRate');
		WOarray["custparam_itemunitstype"] = request.getParameter('hdnVUnitType');
		WOarray["custparam_itemunits"] = request.getParameter('hdnblnItemUnit');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		WOarray["custparam_stagescanrequired"] = request.getParameter('hdnvStageScanRequired');
		WOarray["custparam_uomprevselected"] = request.getParameter('hdnuomchangedvalue');
		WOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var vUnitType=request.getParameter('hdnVUnitType');
		var StockUnitText=request.getParameter('hdnblnItemUnit');
		var whLocation = request.getParameter('custparam_whlocation');
		var scannedqty = enterQty;
		var remainingqty = request.getParameter('hdnItemRemQty');
		var getStockConversionRate = request.getParameter('hdngetStockConversionRate'); 
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var woInternalId=request.getParameter('hdnWoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var woLineno=request.getParameter('hdnWoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button

		var itemType = request.getParameter('hdnItemType');
		var vStageScanRequired = request.getParameter('hdnvStageScanRequired');
		var logMsg = 'WO = ' + WOarray["custparam_woid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'woInternalId = ' + woInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'woLineno = ' + woLineno + '<br>';
		logMsg = logMsg + 'preferBin = ' + preferBin + '<br>';
		logMsg = logMsg + 'itemType = ' + itemType + '<br>';
		logMsg = logMsg + 'vStageScanRequired = ' + vStageScanRequired + '<br>';
		nlapiLogExecution('Debug', 'Processing RF - QTY', logMsg);
		if (sessionobj!=context.getUser()) 
		{
			try
			{
				var makeInventoryAvailFlag  = request.getParameter('invtstatuslst');


				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)')
				{
					WOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;

					// Next button
					if(request.getParameter('cmdEnbNextList')=="Next")
					{
						WOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))+1;						
						WOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
						return;
					}
					//Prev button
					if(request.getParameter('cmdEnbPrevList')=="Prev")
					{
						WOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'))-1;						
						WOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
						return;
					}

					// Item status dropdown change
					WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdnPageCount'));
					var isFromStatusChange = request.getParameter('hdnfromstatuschange');
					nlapiLogExecution('DEBUG', 'isFromStatusChange', isFromStatusChange);
					if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && isFromStatusChange != undefined && isFromStatusChange=='T' )
					{
						WOarray["custparam_pagecount"]=0;
						WOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						WOarray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
						return;

					}
					if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && parseFloat(remQty) >= parseFloat(enterQty))
					{
						try{
							var itemfilters=new Array();
							itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
							if(whLocation != null && whLocation !='' && whLocation != null)
							{
								itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
							}
							var itemcolumns= new Array();

							var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_woqty_item_srh', itemfilters, itemcolumns);							

							if(itemresults == null || itemresults == '' || itemresults == 'null')
							{
								WOarray["custparam_error"] = 'Entered item is inactive';
								response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
								return;
							}

							if((enterBin==null || enterBin=='') && WOarray["custparam_preferbin"]!=null && WOarray["custparam_preferbin"]!='')
								enterBin = WOarray["custparam_preferbin"];

							var binInternalIdarr=nswms_GetValidBinInternalIdWithLocationType(enterBin,WOarray["custparam_whlocation"],null);
							var binInternalId = binInternalIdarr[0];
							WOarray["custparam_binInternalId"] = binInternalId;							  

							if((binInternalId=='' || binInternalId==null) && (itemType != 'noninventoryitem' && itemType != 'otherchargeitem' && itemType!='serviceitem' && itemType!='downloaditem' && itemType!='giftcertificateitem'))
							{
								WOarray["custparam_error"] = 'Please enter/scan valid bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
								return;
							}

							var objBinDetails='';
							var inventoryStatus = ''; 
							var objBinStatusDetails =null;
							var vStatusDetails = new Array();
							if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{


								////Inventorystatus Feature is enabled
								var selectedStatus = '';
								if(inventoryStatusFeature ==true)
								{
									if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
									{
										var invfilterStrat =  new Array();
										if(WOarray["custparam_whlocation"] != null && WOarray["custparam_whlocation"] != '')
											invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', WOarray["custparam_whlocation"]));
										if(FetchedItemId != null && FetchedItemId != '')
											invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
										if(binInternalId!= null && binInternalId!= '')
											invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
										// No need for loadsearch here this search is for navigating to other screen if the serach returns more
										//than one status.
										objBinDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_invtbalance_serialsrh',invfilterStrat, null);
										if(objBinDetails != null && objBinDetails != '' && objBinDetails != 'null' && objBinDetails != 'undefined' && 
												objBinDetails != undefined && objBinDetails.length == 1)
										{
											selectedStatus = objBinDetails[0].getValue('status',null,'group');
										}

									}
									else
									{
										var invfilterStrat =  new Array();
										if(WOarray["custparam_whlocation"] != null && WOarray["custparam_whlocation"] != '')
											invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', WOarray["custparam_whlocation"]));
										if(FetchedItemId != null && FetchedItemId != '')
											invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
										if(binInternalId!= null && binInternalId!= '')
											invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
										// No need for loadsearch here this search is for navigating to other screen if the serach returns more
										//than one status.
										objBinDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_invtbalance_invt_item',invfilterStrat, 
												null);


										if(objBinDetails != null && objBinDetails != '' && objBinDetails != 'null' && objBinDetails != 'undefined' && 
												objBinDetails != undefined && objBinDetails.length == 1)
										{
											selectedStatus = objBinDetails[0].getValue('status');
										}
									}
								}
								else
								{
									var filterStrat = new Array();

									if(FetchedItemId != null && FetchedItemId != '')
										filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
									if(WOarray["custparam_whlocation"]!= null && WOarray["custparam_whlocation"]!= '')
										filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', WOarray["custparam_whlocation"]));
									if(binInternalId!= null && binInternalId!= '')
										filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', binInternalId));

									objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterStrat, null);
								}
							}
							else if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
							{


								//Inventorystatus Feature is enabled
								if(inventoryStatusFeature ==true)
								{
									var invfilterStrat =  new Array();
									if(WOarray["custparam_whlocation"] != null && WOarray["custparam_whlocation"] != '')
										invfilterStrat.push(new nlobjSearchFilter('location',null, 'anyof', WOarray["custparam_whlocation"]));
									if(FetchedItemId != null && FetchedItemId != '')
										invfilterStrat.push(new nlobjSearchFilter('internalid','item', 'anyof', FetchedItemId));
									if(binInternalId!= null && binInternalId!= '')
										invfilterStrat.push(new nlobjSearchFilter('binnumber',null, 'anyof', binInternalId));
									// No need for loadsearch here this search is for navigating to other screen if the serach returns more
									//than one status.
									objBinDetails =  nlapiSearchRecord('InventoryBalance','customsearch_wmsse_inventorybalance',invfilterStrat, null);
									if(objBinDetails != null && objBinDetails != '' && objBinDetails != 'null' && objBinDetails != 'undefined' && 
											objBinDetails != undefined && objBinDetails.length == 1)
									{
										selectedStatus = objBinDetails[0].getValue('status',null,'group');
									}

								}
								else
								{
									var filterStrat = new Array();

									if(FetchedItemId != null && FetchedItemId != '')
										filterStrat.push(new nlobjSearchFilter('internalid',null, 'anyof', FetchedItemId));
									if(WOarray["custparam_whlocation"]!= null && WOarray["custparam_whlocation"]!= '')
										filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', WOarray["custparam_whlocation"]));
									if(binInternalId!= null && binInternalId!= '')
										filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', binInternalId));

									objBinDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);
								}
							}
							if((objBinDetails == null || objBinDetails == '' || objBinDetails == 'null' || objBinDetails =='undefined' || objBinDetails.length == null) && (itemType != 'noninventoryitem' && itemType != 'otherchargeitem' && itemType!='serviceitem' && itemType!='downloaditem' && itemType!='giftcertificateitem'))
							{
								WOarray["custparam_error"] = 'Please enter/scan valid bin location';
								response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
								return;
							}
							else
							{
								if(objBinDetails.length > 0)
								{
									nlapiLogExecution('Debug', 'objBinDetails.length',objBinDetails.length); 
									var qtyFlag="F";
									if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
									{	


										var vOpenPickDetails=getOPenTaskPickBinDetails(FetchedItemId,binInternalId,WOarray["custparam_whlocation"],vUnitType,
												StockUnitText,'',selectedStatus);
										var vOpenPickQty=0;
										var vBinOpenTaskBinQtyArr = "";
										if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
										{
											vBinOpenTaskBinQtyArr = vOpenPickDetails[1];
											vOpenPickQty = vBinOpenTaskBinQtyArr[0];
										}
										if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
											vOpenPickQty =0;


										if(inventoryStatusFeature ==true)
										{
											var status = '';
											var vBinQtyAvail ='';
											var statusId ='';
											var eneteredLotTxt ='';
											var vBinText="";
											for(var objItr=0;objItr<objBinDetails.length;objItr++)
											{
												if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
												{
													vBinQtyAvail=objBinDetails[objItr].getValue('available',null,'sum');
													vBinText=objBinDetails[objItr].getText('binnumber',null,'group');
													statusId = objBinDetails[objItr].getValue('status',null,'group');
													status = objBinDetails[objItr].getText('status',null,'group');	
												}
												else
												{
													vBinQtyAvail=objBinDetails[objItr].getValue('available');
													vBinText=objBinDetails[objItr].getText('binnumber');
													statusId = objBinDetails[objItr].getValue('status');
													status = objBinDetails[objItr].getText('status');	

												}

												var openPickQty = 0;
												if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
												{
													var	vOpenPickQtyArr = vOpenPickDetails[1];
													var	vBinStatusArr = vOpenPickDetails[3];
													if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null' && vBinStatusArr != 'undefined'
														&& vBinStatusArr != undefined)
													{
														for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
														{
															var opentaskStatus = vBinStatusArr[binIterator];

															if(opentaskStatus == statusId)
															{
																openPickQty = vOpenPickQtyArr[binIterator];
																break;
															}
														}
													}

												}

												vBinQtyAvail = Number(Big(vBinQtyAvail).minus(openPickQty));
												if(vBinQtyAvail > 0)
												{
													vStatusDetails.push(statusId);
													if(vStatusDetails.length >=2)
													{
														break;
													}
												}

												if((parseFloat(enterQty)) <= (Number(Big(vBinQtyAvail).mul(getStockConversionRate))) && qtyFlag=="F")
												{
													qtyFlag="T";
													if(vStatusDetails.length >=2)
													{
														break;
													}
												}


											}

										}
										else
										{
											for(var p=0;p<objBinDetails.length;p++)
											{
												var vBinQtyAvail=objBinDetails[p].getValue('quantityavailable','binonhand');
												var vBinText=objBinDetails[p].getText('binnumber','binonhand');

												vBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPickQty));
												if(parseFloat(enterQty) <= (Number(Big(vBinQtyAvail).mul(getStockConversionRate))))
												{
													qtyFlag="T";
													break;
												}
											}
										}

									}
									else if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
									{
										var vOpenPickDetails=getOPenTaskPickBinDetailsLot(FetchedItemId,binInternalId,WOarray["custparam_whlocation"],
												vUnitType,StockUnitText,'',selectedStatus);
										var vBinOpenLotArr="";
										if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
										{
											vBinOpenLotArr = vOpenPickDetails[3];
										}
										if(inventoryStatusFeature ==true)
										{
											for(var p=0;p<objBinDetails.length;p++)
											{
												var vBinQtyAvail=objBinDetails[p].getValue('available',null,'sum');
												var vBinText=objBinDetails[p].getText('binnumber',null,'group');
												var vInvLot=objBinDetails[p].getText('inventorynumber',null,'group');
												var eneteredLotTxt = objBinDetails[p].getText('inventorynumber',null,'group');
												var statusId = objBinDetails[p].getValue('status',null,'group');
												var status = objBinDetails[p].getText('status',null,'group');
												var vOpenPickQty=0;

												if(vOpenPickDetails!=null && vOpenPickDetails !='' && vOpenPickDetails.length >0)
												{
													var	vOpenPickQtyArr = vOpenPickDetails[1];
													var	vBinLotArr = vOpenPickDetails[3];
													var	vBinStatusArr = vOpenPickDetails[5];
													nlapiLogExecution('Debug','vBinStatusArr',vBinStatusArr);
													if(vBinStatusArr != null && vBinStatusArr != '' && vBinStatusArr != 'null'
														&& vBinStatusArr != 'undefined' && vBinStatusArr != undefined)
													{
														for(var binIterator=0;binIterator<vBinStatusArr.length;binIterator++)
														{
															var opentaskStatus = vBinStatusArr[binIterator];
															var opentaskLotText =vBinLotArr[binIterator];

															if(opentaskStatus == statusId && eneteredLotTxt==opentaskLotText)
															{
																openPickQty = vOpenPickQtyArr[binIterator];
																break;
															}
														}
													}
												}
												nlapiLogExecution('Debug','openPickQty',openPickQty);

												if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
													vOpenPickQty =0;

												nlapiLogExecution('Debug','vBinQtyAvail',vBinQtyAvail);
												vBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPickQty));
												if(vBinQtyAvail > 0)
												{
													nlapiLogExecution('Debug','vBinQtyAvail',vBinQtyAvail);
													vStatusDetails.push(statusId);

												}

												if((parseFloat(enterQty)) <= (Number(Big(vBinQtyAvail).mul(getStockConversionRate))) && qtyFlag=="F")
												{
													qtyFlag="T";
													if(vStatusDetails.length >=2)
													{
														break;
													}

												}
											}
										}
										else
										{
											for(var p=0;p<objBinDetails.length;p++)
											{
												var vBinQtyAvail=objBinDetails[p].getValue('quantityavailable','inventoryNumberBinOnHand');
												var vBinText=objBinDetails[p].getText('binnumber','inventoryNumberBinOnHand');
												var vInvLot=objBinDetails[p].getText('inventorynumber','inventoryNumberBinOnHand');
												var vOpenPickQty=0;
												for(var m=0;m<vBinOpenLotArr.length;m++)
												{ 
													var vOpenLot=vOpenPickDetails[3][m];

													if(vInvLot==vOpenLot)
													{
														vOpenPickQty=vOpenPickDetails[1][m];
														break;
													} 
												}
												if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
													vOpenPickQty =0;


												vBinQtyAvail = Number(Big(vBinQtyAvail).minus(vOpenPickQty));
												if(parseFloat(enterQty) <= (Number(Big(vBinQtyAvail).mul(getStockConversionRate))))
												{
													qtyFlag="T";
													break;
												}
											}
										}

									}
									nlapiLogExecution('Debug', 'qtyFlag',qtyFlag);
									if((qtyFlag=="F") && (itemType != 'noninventoryitem' && itemType != 'otherchargeitem' && itemType!='serviceitem' && itemType!='downloaditem' && itemType!='giftcertificateitem'))
									{
										WOarray["custparam_error"] = 'Insufficient inventory for this item and bin combination';
										response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
										return;
									}
								}
							}

							nlapiLogExecution('ERROR', 'vStatusDetails',vStatusDetails);

							WOarray["custparam_itemtype"] = itemType;
							WOarray["custparam_enterQty"] = enterQty;
							if(enterBin!=null && enterBin!='')
								WOarray["custparam_enterBin"] = enterBin;
							else
								WOarray["custparam_enterBin"] = preferBin;

							if(itemType == "inventoryitem" || itemType=="assemblyitem" || itemType == "serializedinventoryitem" ||
									itemType=="serializedassemblyitem")
							{
								if(vStatusDetails.length >0)
								{
									WOarray["custparam_enteredBinID"]=binInternalId;
									WOarray["custparam_enteredbin"]=enterBin;
									WOarray["custparam_enteredqty"]=enterQty;

									if(vStatusDetails != null && vStatusDetails != '' && vStatusDetails != 'null' &&
											vStatusDetails != 'undefined' && vStatusDetails != undefined &&
											vStatusDetails.length != null && vStatusDetails.length == 1)
									{

										selectedStatus = vStatusDetails[0];
										WOarray["custparam_inventorystatus"]=selectedStatus;

									}
									else
									{
										if(request.getParameter('hdnStageflag') == 'Pick & Stage')
										{
											WOarray["custparam_hdnCloseflag"]='Pick And Stage';
										}
										response.sendRedirect('SUITELET', 'customscript_wmsse_wopicking_status', 'customdeploy_wmsse_wopicking_status', false, WOarray);
										return;

									}


								}
							}


							if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
							{
								nlapiLogExecution('ERROR', 'into lotnumberedinventoryitem', itemType);
								WOarray["custparam_error"] = '';
								WOarray["custparam_pagecount"]=0;
								WOarray["custparam_makeinventoryavailflag"]="";
								response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lotscan', 'customdeploy_wmsse_wo_lotscan', false, WOarray);
								return;
							}
							else if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{

								nlapiLogExecution('ERROR', 'into serializedinventoryitem', itemType);
								WOarray["custparam_error"] = '';
								response.sendRedirect('SUITELET', 'customscript_wmsse_wo_serialscan', 'customdeploy_wmsse_wo_serialscan', false, WOarray);
								return;
							}
							else if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == 'noninventoryitem' || 
									itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || itemType=='giftcertificateitem')
							{


								if(vStageScanRequired == "F")
								{
									var toBinInternalId =fnGetWIPBinDetails(WOarray["custparam_whlocation"]);

									if(toBinInternalId=='' || toBinInternalId==null)
									{
										WOarray["custparam_error"] = 'Please configure wip bin location';
										response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
										return;
									}

								}
								else
								{
									var toBinInternalId = binInternalId;
								}

								var woLineDetails = getWOLineDetailsNew(WOarray["custparam_woid"],WOarray["custparam_whlocation"],FetchedItemId,woLineno);
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
										var isItemFound = false;
										for(var cnt=0;cnt<woLineDetails.length;cnt++)
										{
											var vwoitemQty = woLineDetails[cnt].getValue('quantity');
											var itemCommitedQty=woLineDetails[cnt].getValue(vColumnslist[comittedQtyIndex]);
											var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);

											var opentaskDetails=getopentaskDetailsforSku(WOarray["custparam_wointernalid"],woLineno,FetchedItemId,
													selectedStatus);

											var itemPickedQty = opentaskDetails[0].getValue('custrecord_wmsse_act_qty',null,'sum');

											if(itemPickedQty==null || itemPickedQty=='' || itemPickedQty =='null' || itemPickedQty =='undefined')
											{
												itemPickedQty = 0;
											}

											if(itemType == 'noninventoryitem' || itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || itemType=='giftcertificateitem' 
												||itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
											{
												itemCommitedQty=woLineDetails[cnt].getValue('quantity');
											}

											if(vwoitemRcvQty == null || vwoitemRcvQty =='')
												vwoitemRcvQty = 0;

											if(itemType == 'noninventoryitem' || itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || itemType=='giftcertificateitem' 
												||itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
											{
												var itemRemQty=Number(Big(itemCommitedQty).minus(itemPickedQty));
											}
											else
											{
												itemCommitedQty=new Big(itemCommitedQty);
												vwoitemRcvQty=new Big(vwoitemRcvQty);
												itemPickedQty=new Big(itemPickedQty);

												var itemRemQty=((itemCommitedQty).plus(vwoitemRcvQty)).minus(itemPickedQty);
											}
											nlapiLogExecution('Debug', 'itemRemQty', itemRemQty);
											var vwoitem = woLineDetails[cnt].getValue('item');
											var vwoitemline = woLineDetails[cnt].getValue('line');
											if((parseFloat(itemRemQty)>0) && (vwoitem == FetchedItemId) && (woLineno == vwoitemline))
											{
												isItemFound = true;
												if(itemType == 'noninventoryitem' || itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || itemType=='giftcertificateitem')
												{
													binInternalId ='';
													toBinInternalId ='';
												}
												var id=  updateOpenTaskWO(woInternalId,FetchedItemId,woLineno,Number(Big(enterQty).toFixed(8)),toBinInternalId,itemType,
														WOarray["custparam_whlocation"],'','','','',woInternalId,null,null,null,'PICK','','','','','workorder',
														WOarray["custparam_actualbegintime"],'','','','','','',binInternalId,WOarray["custparam_uom"],
														WOarray["custparam_conversionrate"],'','','',selectedStatus);


												try
												{
													if(vStageScanRequired == "F" && (itemType != 'noninventoryitem' && itemType != 'otherchargeitem' && itemType!='serviceitem' && itemType!='downloaditem' && itemType!='giftcertificateitem'))
													{	
														var binTransferId= inventoryBinTransfer(itemType,WOarray["custparam_whlocation"],FetchedItemId,
																(Number(Big(enterQty).mul(WOarray["custparam_conversionrate"]))).toFixed(8),binInternalId,toBinInternalId,
																'','','','','',selectedStatus,selectedStatus);
														nlapiLogExecution('Debug', 'Bin Transfered successfully', binTransferId);
														if(binTransferId != null && binTransferId != '' && id != null && id != '')
														{
															var fields = new Array();
															var values = new Array();
															fields[0] = 'custrecord_wmsse_nstrn_ref_no';
															values[0] = binTransferId;

															var updOpenTaskRecordId=nlapiSubmitField('customrecord_wmsse_trn_opentask', id, fields, values);
														}	
														break;
													}												 
												}				
												catch(e)
												{
													nlapiLogExecution('ERROR', 'inside catch exception', e);

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

													response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
													return;
												}

											}

										}
										if(isItemFound == false)
										{
											nlapiLogExecution('ERROR','First');
											WOarray["custparam_error"] ='Scanned qty is greater than remaining qty';
											response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
											return;
										}
									}
								}
								else
								{
									WOarray["custparam_error"] = 'Entered item is deleted from the order';
									response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
									return;
								}


								var woLineDetails = getWOLineDetailsNew(WOarray["custparam_woid"],WOarray["custparam_whlocation"],null,null);
								var cmdStage = request.getParameter('cmdStage');

								if(woLineDetails !=null && woLineDetails!=""  && cmdStage != 'Pick & Stage')
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
										var totalWOQty = 0;
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
										for(var cnt=0;cnt<woLineDetails.length;cnt++)
										{
											var vwoitemQty = woLineDetails[cnt].getValue('quantity');
											var itemCommitedQty=woLineDetails[cnt].getValue(vColumnslist[comittedQtyIndex]);
											var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);
											var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);
											var vwoitemRcvQty = woLineDetails[cnt].getValue(vColumnslist[builtQtyIndex]);
											var vLineItem = woLineDetails[cnt].getValue('item');

											var itemType= woLineDetails[cnt].getValue('type','item');

											if(vwoitemRcvQty == null || vwoitemRcvQty =='')
												vwoitemRcvQty = 0;

											if(itemType == 'noninventoryitem' || itemType == 'otherchargeitem' || itemType=='serviceitem' || itemType=='downloaditem' || itemType=='giftcertificateitem' 
												||itemType == "NonInvtPart" || itemType=="OthCharge" || itemType=="Service" || itemType=="DwnLdItem" || itemType=="GiftCert")
											{
												itemCommitedQty=woLineDetails[cnt].getValue('quantity');
											}
											if(itemCommitedQty == null || itemCommitedQty =='' || itemCommitedQty=='null')
											{
												itemCommitedQty=0;
											}
											totalWOQty =new Big(totalWOQty);
											itemCommitedQty =new Big(itemCommitedQty);
											vwoitemRcvQty =new Big(vwoitemRcvQty);

											totalWOQty =(totalWOQty).plus(itemCommitedQty).plus(vwoitemRcvQty);



										}

										var pickedQty  = getopentaskDetails(WOarray["custparam_wointernalid"]); 
										if(pickedQty == '' || pickedQty == null || isNaN(pickedQty))
										{
											pickedQty = 0;
										}


										var itemRemQty = (totalWOQty).minus(pickedQty);

										if((parseFloat(itemRemQty)>0))
										{	
											WOarray["custparam_error"] ='';
											WOarray["custparam_pagecount"]=0;
											response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
											return;
										}


										if(vStageScanRequired == "F")
										{	
											WOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
											return;
										}
										else
										{
											WOarray["custparam_error"] ='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_wostage_scan', 'customdeploy_wmsse_wostage_scan', false, WOarray);
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
									WOarray["custparam_error"] ='';
									if(vStageScanRequired == "T")
										response.sendRedirect('SUITELET', 'customscript_wmsse_wostage_scan', 'customdeploy_wmsse_wostage_scan', false, WOarray);
									else
										response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
									return; 

								}
							}
						}
						catch(e)
						{
							nlapiLogExecution('ERROR', 'inside catch exception', e);

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

							nlapiLogExecution('Debug', 'Exception: ', e);
							response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
							return;
						}
					}
					else
					{
						if(parseFloat(scannedqty)>parseFloat(remainingqty))
						{ 

							WOarray["custparam_error"] ='Scanned qty is greater than remaining qty';
						}
						else
						{
							WOarray["custparam_error"] = 'Please enter valid qty';		
						}
						response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
					}
				} 
				else {
					WOarray["custparam_error"] ='';
					WOarray["custparam_pagecount"]=0;
					response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);
				}
			}
			catch (e) 
			{
				nlapiLogExecution('ERROR', 'inside catch exception', e);

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

				response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_woqty_scan', 'customdeploy_wmsse_woqty_scan', false, WOarray);
		}
	} //end of first if condition
} //end of function.

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

function fnGetWIPBinDetails(strLocation)
{
	var wipBinId='';		
	var filterStrat = new Array(); 

	if(strLocation!= null && strLocation!= '')
		filterStrat.push(new nlobjSearchFilter('location',null, 'anyof', strLocation));
	var objBinDetails = new nlapiSearchRecord('bin','customsearch_wip_bindetails',filterStrat, null);
	if(objBinDetails != null && objBinDetails != '' && objBinDetails.length > 0)
	{
		var vValidBin=objBinDetails[0].getValue('binnumber');
		var vValidBinId=objBinDetails[0].getId();
		nlapiLogExecution('Debug','vValidBin',vValidBin);
		wipBinId = vValidBinId;		
	} 

	return wipBinId;
}

function getWOLineDetailsNew(wonumber,whLocation,itemID,woLineno)
{
	nlapiLogExecution('Debug', 'sonumber,whLocation',wonumber+","+whLocation);

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));
	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 

	if(woLineno != null && woLineno != '')
		filters.push(new nlobjSearchFilter('line', null, 'equalto', woLineno)); 

	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_item_srh', filters, columns);

	return WOLineDetails;
}

function getopentaskDetailsforSku(woInternalId,lineno,item,selectedStatus)
{
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	if(lineno!=null && lineno!='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_line_no',null,'equalto',lineno));	
	if(item!=null && item!='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof',item));
	if(selectedStatus!=null && selectedStatus!='')
		opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_inventorystatus',null,'anyof',selectedStatus));

	var opentaskColumns =  new Array();

	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);


	return opentaskResults;
}

function getopentaskDetails(woInternalId)
{
	var pickQty = 0;
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

	var opentaskColumns =  new Array();

	var opentaskResultsArray = new Array();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);

	if(opentaskResults !=null && opentaskResults !='')
	{

		for(var k=0;k<opentaskResults.length;k++)
		{

			var vActqty=opentaskResults[k].getValue('custrecord_wmsse_act_qty',null,'sum');
			if(vActqty == null || vActqty =='' || vActqty=='null')
			{
				vActqty=0;
			}
			pickQty = Number(Big(pickQty).plus(vActqty));
		}
	}
	return pickQty;
}