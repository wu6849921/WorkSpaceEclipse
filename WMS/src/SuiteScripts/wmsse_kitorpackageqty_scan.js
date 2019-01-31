/**
 * Script Description
 * This script is used to scan the Lot for selected item.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ****************************************************************************/
/**
 * Main function to scan quantity for kit/package item picking.
 */
function qtyScan(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		//Variable Declaration
		var html = '';

		//	Get the PO# from the previous screen, which is passed as a parameter		
		var getSONo = request.getParameter('custparam_soid');


		var customer=request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');

		var whCompany= request.getParameter('custparam_company');
		var getSONo = request.getParameter('custparam_soid');
		var getSOItem = request.getParameter('custparam_soitem');

		var getSOLineNo = request.getParameter('custparam_lineno');
		var getFetchedItemId = request.getParameter('custparam_fetcheditemid');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getCarton = request.getParameter('custparam_carton');
		var getCartonSize = request.getParameter('custparam_cartonsize');
		var getCartonWeight = request.getParameter('custparam_cartonweight');
		var getCartonscreenValue = request.getParameter('custparam_cartonscreenrulevalue');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getPickreportid=request.getParameter('custparam_pickreportid');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		var pickType= request.getParameter('custparam_picktype');

		var vbarcodecompstring = request.getParameter('custparam_bcComponents');	

		var componentvalarr = new Array();

		if(!isempty(request.getParameter('custparam_bcComponents')))
		{			
			var currentscriptid = ctx.getScriptId();

			componentvalarr = getcomponentmapping(currentscriptid,vbarcodecompstring);			
		}

		nlapiLogExecution('Error', 'componentvalarr', componentvalarr);
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-FULFILLMENT QTY SCAN';
		var getPreferBin='';
		var errMsg='';
		if(request.getParameter('custparam_itemremainingquantity') != null && request.getParameter('custparam_itemremainingquantity') != '' && 
				request.getParameter('custparam_itemremainingquantity') != 'null' && request.getParameter('custparam_itemremainingquantity') != 'undefined')
		{
			getItemRemQty = request.getParameter('custparam_itemremainingquantity');

		}
		var qtyToShow =getItemRemQty;
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
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
		var SOarray = new Array();
		SOarray["custparam_soid"] = getSONo;
		SOarray["custparam_whlocation"] = whLocation;
		SOarray["custparam_company"] = whCompany;
		SOarray["custparam_option"] = getOptedField;
		SOarray["custparam_trantype"] = trantype;
		SOarray["custparam_actualbegintime"] = getActualBeginTime;
		SOarray["custparam_sointernalid"] = getSOInternalId;
		SOarray["custparam_lineno"] = getSOLineNo;
		SOarray["custparam_fetcheditemid"] = getItemInternalId;
		SOarray["custparam_cartonscreenrulevalue"] = getCartonscreenValue;
		SOarray["custparam_carton"] = getCarton;
		SOarray["custparam_cartonsize"] = getCartonSize;
		SOarray["custparam_cartonweight"] = getCartonWeight;
		SOarray["custparam_pickreportid"] =getPickreportid;
		SOarray["custparam_picktype"] = pickType;
		SOarray["custparam_ordtype"] = ordType;
		SOarray["custparam_department"] = department;
		SOarray["custparam_class"] = vclass;
		SOarray["custparam_whlocationname"] = whLocationName;

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		var itemcolumns= new Array();

		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		var strItemGrp="";
		var strItemFam="";		
		if(itemresults!=null && itemresults!='')
		{
			for(var d=0;d<itemresults.length;d++)
			{
				if(itemresults[d].getValue('preferredbin')=="T" && itemresults[d].getValue('location','binnumber')==whLocation)
				{
					getPreferBin = itemresults[d].getValue('binnumber');
				}
			}
			blnMixItem = itemresults[0].getValue('custitem_wmsse_mix_item');
			blnMixLot = itemresults[0].getValue('custitem_wmsse_mix_lot');
			strItemGrp = itemresults[0].getValue('custitem_wmsse_itemgroup');
			strItemFam = itemresults[0].getValue('custitem_wmsse_itemfamily');
			if(getSOItem==null || getSOItem =='' || getSOItem =='null' || getSOItem =='undefined')
			{
				getSOItem=itemresults[0].getValue('name');
			}

		}
		var vItemDetails=fnGetComponentItemDetails(getItemInternalId,qtyToShow,whLocation);

		var vFOoverageChecked='F';
		var vConfig=nlapiLoadConfiguration('accountingpreferences');
		if(vConfig != null && vConfig != '')
		{
			vFOoverageChecked=vConfig.getFieldValue('OVERFULFILLMENTS');
		}

		if (CSSfilefound) 
		{ 
			CSSurl = CSSfilefound.getURL();	
		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_qty');

		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";
		CSSfilefound=null;
		html = html +functionkeyHtml;
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +" <script type='text/javascript'>function validateForm(){var qty =document.getElementById('txtqty').value;var scanedQty =document.getElementById('txtqty').value;var serialcomponentItemExists =document.getElementById('hdnisSerialComponentitemExist').value;var fooveragecheck = document.getElementById('hdnvFOoverageChecked').value; var WhiteSpace = qty.indexOf(' ') >= 0;if(document.getElementById('txtqty').value == ''){document.getElementById('div_error').innerHTML ='Please enter qty';return false;}else if ((document.getElementById('txtqty').value <= 0 || isNaN(document.getElementById('txtqty').value))|| (WhiteSpace == true)){document.getElementById('div_error').innerHTML='Please enter valid qty';document.getElementById('txtqty').value = ''; return false;}  var qtyValidate = document.getElementById('txtqty').value.split('.'); if(qtyValidate.length > 1){if(parseInt(qtyValidate[1].length) > 5){document.getElementById('div_error').innerHTML ='Quantity can not have more than 5 decimal places.';document.getElementById('txtqty').focus();return false;}} if(serialcomponentItemExists=='T' && ((scanedQty) % 1 != 0)){document.getElementById('div_error').innerHTML='Serial component items exists, hence decimal qty is not allowed.';document.getElementById('txtqty').value = ''; return false;} else if((parseFloat((document.getElementById('txtqty').value)) > parseFloat(document.getElementById('hdnItemRemQty').value)) && fooveragecheck=='F'){ document.getElementById('div_error').innerHTML='Overage picking is not allowed';document.getElementById('txtqty').value = ''; return false; } else{document.getElementById('div_error').innerHTML=''; var tbl = document.getElementById('dynctable'); var lastRow = tbl.rows.length;   var tbl = document.getElementById('dynctable'); document.getElementById('dynctable').style.display = 'block'; if (tbl != null) {for (var i = 1; i < tbl.rows.length; i++) {tbl.rows[i].cells[1].innerHTML =parseFloat(parseFloat(document.getElementById('txtqty').value)*parseFloat(tbl.rows[i].cells[2].innerHTML)).toFixed(5)}}return true; }}function validateNext(){if(document.getElementById('txtqty').value == ''){document.getElementById('div_error').innerHTML ='Please enter qty';return false;}else{return true;}}</script></head><body>"+


		"	<form name='_rf_picking_qty' method='POST'>"+ 
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Picking Qty</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td></td></tr><tr><td></td></tr>"+
		"		</table>"+
		"		<table>"+

		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getSONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getSOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnSoItem' value='" + getSOItem + "'>"+
		"				<input type='hidden' name='hdnCarton' value='" + getCarton + "'>"+
		"				<input type='hidden' name='hdnCartonsize' value='" + getCartonSize + "'>"+
		"				<input type='hidden' name='hdnCartonweight' value='" + getCartonWeight + "'>"+
		"				<input type='hidden' name='hdnCartonscreenvalue' value='" + getCartonscreenValue + "'>"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnPickReportId' value='" + getPickreportid + "'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnvFOoverageChecked' id='hdnvFOoverageChecked' value=" + vFOoverageChecked + ">"+
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnItemRemainingQty' id='hdnItemRemainingQty' value=" + qtyToShow + ">"+	
		"				<input type='hidden' name='hdnbarcodecompstring' value='" + vbarcodecompstring + "'>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr><td align='left' class='labelmsg'>Item: <label>" + getSOItem + "</label></td></tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(5)) + "</label>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Picked Qty: <label>" + parseFloat(parseFloat(getItemRecQty).toFixed(5)) + "</label>"+
		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter Qty"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";
		html = html +"<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text' value="+qtyToShow+" >&nbsp;&nbsp;&nbsp; <input name='cmdgo' type='button' value='GO' onclick='return validateForm();'/>";

		html = html +"				</td>"+
		"			</tr>"+		
		"		 </table>";
		html = html +"			<table><tr>"+			
		"				<td><input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/></td><td align = 'left'><input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td width='10px'></td><td><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>";
		html = html + "</table>";
		var isSerialComponentitemExists = 'F';
		if(vItemDetails !=null && vItemDetails!='' && vItemDetails.length > 0)
		{
			html = html + 	"<table  style='border-spacing: 0;' id='dynctable' > ";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Member Item"+	
			"				</td>"+
			"				<td  colspan='2'  class='align-right'>Expected Qty"+	
			"				</td>"+
			"			</tr>";
			for(var b=0;b<vItemDetails.length;b++)
			{
				var currValues = vItemDetails[b]; 
				var memItem = currValues[2];
				var reqQty = currValues[0];
				var memQty = currValues[1];
				var memType = currValues[3];
				nlapiLogExecution('DEBUG', 'memType', memType);
				if( memType == "serializedinventoryitem" || memType=="serializedassemblyitem")
				{
					isSerialComponentitemExists = 'T';
				}

				var vClass='uir-list-row-tr line uir-list-row-even';
				if(b!=0 && b%2!=0)
					vClass='uir-list-row-tr line uir-list-row-odd';


				html = html +	"			<tr  class='"+vClass+"'>"+
				"				<td>"+memItem+""+	
				"				</td>"+
				"				<td class = 'align-right' >"+parseFloat(parseFloat(reqQty).toFixed(5))+""+	
				"				</td>"+
				"				<td class = 'align-right'  style='display:none'>"+memQty+""+	
				"				</td>"+
				"			</tr>";
			}

			html = html +	"<tr><td colspan='3'><input type='hidden' name='hdnisSerialComponentitemExist' id='hdnisSerialComponentitemExist' value=" + isSerialComponentitemExists + ">  </td></tr>" ;

			html = html + 	"</table>";

		}
		html = html + "</form>"+

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

		var SOarray = new Array();
		var tempflag='F';
		var enterQty=request.getParameter('txtqty');
		var getPickreportid=request.getParameter('hdnPickReportId');
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_pickreportid"] =getPickreportid;
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');
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
		SOarray["custparam_cartonsize"] = request.getParameter('hdnCartonsize');
		SOarray["custparam_carton"] = request.getParameter('hdnCarton');
		SOarray["custparam_cartonweight"] = request.getParameter('hdnCartonweight');
		SOarray["custparam_cartonscreenrulevalue"] = request.getParameter('hdnCartonscreenvalue');
		SOarray["custparam_enteredqty"] = enterQty;
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		SOarray["custparam_itemremainingquantity"] = request.getParameter('hdnItemRemainingQty');
		SOarray["custparam_bcComponents"] = request.getParameter('hdnbarcodecompstring');

		var foOverageCheck=request.getParameter('hdnvFOoverageChecked');
		if(foOverageCheck == 'T')
		{
			if(parseFloat(enterQty) >  SOarray["custparam_rem_qty"] )
			{
				SOarray["custparam_rem_qty"] =	enterQty;
			}
		}
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var soInternalId=request.getParameter('hdnSoInternalId');
		var recQty=request.getParameter('getItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		var soLineno=request.getParameter('hdnSoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button

		var logMsg = 'SO = ' + SOarray["custparam_poid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'soInternalId = ' + soInternalId + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'soLineno = ' + soLineno + '<br>';
		logMsg = logMsg + 'preferBin = ' + preferBin + '<br>';
		logMsg = logMsg + 'SOarray["custparam_carton"] = ' + SOarray["custparam_carton"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonsize"] = ' + SOarray["custparam_cartonsize"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonweight"] = ' + SOarray["custparam_cartonweight"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonscreenrulevalue"] = ' + SOarray["custparam_cartonscreenrulevalue"] + '<br>';
		logMsg = logMsg + 'foOverageCheck = ' + foOverageCheck + '<br>';
		nlapiLogExecution('DEBUG', 'Processing RF - QTY', logMsg);
		logMsg="";
		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){

			if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && parseFloat(enterQty) > 0)
			{
				SOarray["custparam_error"] ='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan', 'customdeploy_wmsse_kitorpkg_itmscan', false, SOarray);
				return;
			}
			else
			{
				SOarray["custparam_error"] = 'Please enter valid qty';				
				response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_qtyscan', 'customdeploy_wmsse_kitorpkg_qtyscan', false, SOarray);
			}
		} 
		else {
			SOarray["custparam_error"] ='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_soitem_scan', 'customdeploy_wmsse_soitem_scan', false, SOarray);
		}
	} //end of first if condition
} //end of function.
/**
 * To get component items list of kit/package item
 * @param getItemInternalId
 * @param vReqQty
 * @returns {Array}
 */
function  fnGetComponentItemDetails(getItemInternalId,vReqQty,whLocation)
{
	var filters = new Array(); 

	filters[0] = new nlobjSearchFilter('internalid', null, 'is', getItemInternalId);//kit_id is the parameter name 
	filters[1]=new nlobjSearchFilter('isfulfillable', null, 'is', 'T');
	var columns1 = new Array(); 

	var searchresults = nlapiSearchRecord( 'item', 'customsearch_wmsse_itemdetails', filters, null );  
	var kititemsarr = new Array();
	for(var q=0; searchresults!=null && q<searchresults.length;q++) 
	{
		var vMemItemType=searchresults[q].getValue('type','memberitem');

		var vSubArr=new Array();			
		var vMemItem=searchresults[q].getText('memberitem');
		var vMemItemid=searchresults[q].getValue('memberitem');
		var vMemQty=searchresults[q].getValue('memberquantity');
		if(vMemQty == null || vMemQty == '')
			vMemQty=0;
		//var vActQty= parseFloat(vMemQty) * parseFloat(vReqQty);
		var vActQty= Number(Big(vMemQty).mul(vReqQty));

		var vMemType = nswms_GetItemType(vMemItemid,whLocation);


		vSubArr.push(vActQty,vMemQty,vMemItem,vMemType);
		kititemsarr.push(vSubArr);

	}
	searchresults=null;
	columns1=null;
	filters=null;
	return kititemsarr;
}
