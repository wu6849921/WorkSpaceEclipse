/**
 * Script Description
 * This script is used to scan Item for kit or package item picking
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ****************************************************************************/

/**
 * Main function to scan item for kit/package items picking
 */
function PickingSKU(request, response)
{
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');

		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');
		ctx.setSessionObject('record', null);
		// Variable Declaration
		var customer=request.getParameter('custparam_customer');
		var whLocation = request.getParameter('custparam_whlocation');
		var trantype= request.getParameter('custparam_trantype');

		var whCompany= request.getParameter('custparam_company');
		var getSONo = request.getParameter('custparam_soid');
		var getSOItem = request.getParameter('custparam_soitem');

		var getSOLineNo = request.getParameter('custparam_lineno');
		var getSOInternalId = request.getParameter('custparam_sointernalid');
		var getItemInternalId = request.getParameter('custparam_fetcheditemid');
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getenteredQty = request.getParameter('custparam_enteredqty');
		var getItemRemainingQty = request.getParameter('custparam_itemremainingquantity');		
		var getCarton = request.getParameter('custparam_carton');
		var getCartonSize = request.getParameter('custparam_cartonsize');
		var getCartonWeight = request.getParameter('custparam_cartonweight');
		var getCartonscreenValue = request.getParameter('custparam_cartonscreenrulevalue');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var ordType = request.getParameter('custparam_ordtype');
		var department = request.getParameter('custparam_department');
		var vclass = request.getParameter('custparam_class');
		var pickType= request.getParameter('custparam_picktype');
		var BCLotExpiryDate = request.getParameter('custparam_bcexpirydate');
		var vBarcodeLot = request.getParameter('custparam_bclot');
		var vBarcodeqty = request.getParameter('custparam_bcqty');
		var vBarcodeUOM = request.getParameter('custparam_bcuom');
		var vBarcodeSerial = request.getParameter('custparam_bcserial');

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-FULFILLMENT ITEM SCAN';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			errMsg = request.getParameter('custparam_error');
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


		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
		}
		// This search returns required results, 4k records fetching not required.
		var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);
		if(itemresults!=null && itemresults!='')
		{
			getSOItem = itemresults[0].getValue('itemid');
		}

		var ServicePageURL = nlapiResolveURL('SUITELET',
				'customscript_wmsse_onbarcodescan', 'customdeploy_wmsse_onbarcodescan');

		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_item'); 
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('txtItem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item';return false;}else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +functionkeyHtml;

		html = html +"<script type = 'text/javascript'>";
		html = html +"function parsebarcode(url)";
		html = html +"{";
		html = html +"var txtitem = document.getElementById('txtItem').value;";
		html = html +"var hdnwhloc = document.getElementById('hdnWhLocation').value;";
		html = html +"var url=url+'&custpage_barcode='+txtitem+'&custpage_whloc='+hdnwhloc;";
		html = html +"var xhttp = new XMLHttpRequest();";
		html = html +"xhttp.onreadystatechange = function() {";
		html = html +"if (this.readyState == 4 && this.status == 200)";
		html = html +"{";
		html = html +"document.getElementById('div_error').innerHTML = '';";
		html = html +"document.getElementById('hdncompositebarcode').value = '';";
		html = html +"if(this.response!=null && this.response!='')";
		html = html +"{";
		html = html +"var bccomponents = JSON.parse(this.response);";
		html = html +"if(bccomponents['error'] !=null && bccomponents['error']!='')";
		html = html +"{";
		html = html +"document.getElementById('div_error').innerHTML = bccomponents['error'];";		
		html = html +"}";
		html = html +"else ";
		html = html +"{";		
		html = html +"var vitem = bccomponents['Item'];";
		html = html +"document.getElementById('hdncompositebarcode').value = this.response;";
		html = html +"document.getElementById('txtItem').value = vitem;";
		html = html +"}";
		html = html +"}";
		html = html +"}";
		html = html +"};";
		html = html +"  xhttp.open('GET',url, true);";
		html = html +"  xhttp.send();";
		html = html +"}";
		html = html +"</script>";

		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script></head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_picking_item' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+			
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Picking Item</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+ordVar+" <label>" + getSONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' id='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + getItemRemQty + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnSoInternalId' value=" + getSOInternalId + ">"+
		"				<input type='hidden' name='hdnSoLineno' value=" + getSOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnSoItem' value='" + getSOItem + "'>"+
		"				<input type='hidden' name='hdnenteredQty' id='hdnenteredQty' value=" + getenteredQty + ">"+
		"				<input type='hidden' name='hdnCarton' value='" + getCarton + "'>"+
		"				<input type='hidden' name='hdnCartonsize' value='" + getCartonSize + "'>"+
		"				<input type='hidden' name='hdnCartonweight' value='" + getCartonWeight + "'>"+
		"				<input type='hidden' name='hdnCartonscreenvalue' value='" + getCartonscreenValue + "'>"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+
		"				<input type='hidden' name='hdnOrdtype' value='" + ordType+ "'>"+
		"				<input type='hidden' name='hdndept' value='" +department+ "'>"+
		"				<input type='hidden' name='hdnclass' value='" +vclass+"'>"+
		"				<input type='hidden' name='hdnPickType' value='" +pickType+"'>"+
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+
		"				<input type='hidden' name='hdnItemRemainingQty' id='hdnItemRemainingQty' value=" + getItemRemainingQty + ">"+	
		"				<input type='hidden' name='hdnBarcodeqty' value=" + vBarcodeqty + ">"+
		"				<input type='hidden' name='hdnBarcodeuom' value=" + vBarcodeUOM + ">"+		
		"				<input type='hidden' name='hdnBarcodeLot' value='" + vBarcodeLot + "'>"+
		"				<input type='hidden' name='hdnBarcodeserial' value='" + vBarcodeSerial + "'>"+
		"				<input type='hidden' name='hdncompositebarcode' id='hdncompositebarcode'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr><td align = 'left' class='labelmsg'>Item: <label>" + getSOItem + "</label></td></tr>"+
		"			<tr><td align = 'left' class='labelmsg'>Picked Qty: <label>" + parseFloat(parseFloat(getItemRecQty).toFixed(5)) + "</label></td></tr>"+
		"			<tr><td align = 'left' class='labelmsg'>Remaining Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(5)) + "</label></td></tr>"+
		"			<tr><td align = 'left' class='labelmsg'>Expected Qty: <label>" + parseFloat(parseFloat(getenteredQty).toFixed(5)) + "</label></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Item"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtItem'  class='smalltextbox'  id='txtItem' type='text' onchange='parsebarcode(\""+ServicePageURL+"\");'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr><td></td></tr><tr><td>"+
		"		 </table>";
		html=html+"<table><tr><td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td><input name='cmdPrevious' type='submit' value='Back (F7)' /></td><td width='10px'></td><td><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td></tr></table>";
		var vItemDetails=getSOLineDetails(getSONo,trantype,getItemInternalId,whLocation,getSOLineNo);
		var vmemItemDetails=fnGetComponentItemDetails(getItemInternalId);
		nlapiLogExecution('ERROR', 'vItemDetails', vItemDetails);

		if(vItemDetails !=null && vItemDetails!='' && vItemDetails.length > 0)
		{
			var vColumnslist=vItemDetails[0].getAllColumns();
			var memitemcommitedQtyIndex = 8;
			var memitemfulfilledQtyIndex = 9;		
			var memitemtotalPickedQtyIndex =10;
			for(var x1=0;x1<vColumnslist.length;x1++)
			{
				var summaryLabel = vColumnslist[x1].getLabel();

				if(summaryLabel == 'Member Item Total Picked Quantity')
				{
					memitemtotalPickedQtyIndex = x1;
				}
				else if (summaryLabel == 'Member Item Committed Quantity')	
				{
					memitemcommitedQtyIndex = x1;
				}
				else if (summaryLabel == 'Member Item Fulfilled Quantity')
				{
					memitemfulfilledQtyIndex = x1;
				}				
				else
				{

				}
			}
			var openTaskDetails = getOpenTaskDetails(getSOInternalId,getSOLineNo);
			var OpenKitPickTaskDetails=getOpenKitPickTaskDetails(getSOInternalId,getSOLineNo);

			var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_kitorpkg_binscan_sng', 'customdeploy_wmsse_kitorpkg_binscan_sng');

			html = html + 	" <table  style='border-spacing: 0;' id='dynctable' > ";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Member Item"+	
			"				</td>"+
			"				<td class='align-right'>Picked "+	
			"				</td>"+
			"				<td class='align-right'>Remaining "+	
			"				</td>"+
			"			</tr>"; 
			for(var b=0;b<vItemDetails.length;b++)
			{
				var result = vItemDetails[b]; 
				var vSoLine = result.getValue('line',null,'group');
				var vsoitem = result.getValue('memberitem','item','group');
				var pickedqty = result.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
				var bomQty=result.getValue('memberquantity','item','group');
				var expQty=Number(Big(getenteredQty).mul(bomQty));
				var parentItemCommitedQty = result.getValue('quantitycommitted',null,'max');
				parentItemCommitedQty = Number(Big(parentItemCommitedQty).mul(bomQty));
				var vsoitemid='';
				var vMemItemFlag='F';
				for(var i=0;i<vmemItemDetails.length;i++)
				{
					var cRow=vmemItemDetails[i];
					var cSku=cRow[0];
					if(cSku==vsoitem)
					{
						vMemItemFlag='T';
						vsoitemid=cRow[1];
						break;
					}
				}
				if(vMemItemFlag == 'T')
				{
					if(pickedqty == null || pickedqty == '' || pickedqty =='null' || pickedqty =='undefined')
					{
						pickedqty = 0;
					}

					var pickConfirmedQty=0;
					if(openTaskDetails != null && openTaskDetails != '' )
					{
						for(var j=0;j < openTaskDetails.length;j++)
						{
							var sku = openTaskDetails[j].getText('custrecord_wmsse_sku',null,'group');

							if(sku == vsoitem)
							{
								pickConfirmedQty =   openTaskDetails[j].getValue('custrecord_wmsse_act_qty',null,'sum');
								break;
							}

						}
					}
					var kitPickConfirmedQty=0;
					if(OpenKitPickTaskDetails != null && OpenKitPickTaskDetails != '' )
					{
						for(var j=0;j < OpenKitPickTaskDetails.length;j++)
						{
							var sku = OpenKitPickTaskDetails[j].getText('custrecord_wmsse_sku',null,'group');

							if(sku == vsoitem)
							{
								kitPickConfirmedQty =   OpenKitPickTaskDetails[j].getValue('custrecord_wmsse_expe_qty',null,'sum');
								break;
							}

						}
					}

					var remainingQty =0;
					var actEnteredQty = Number(Big(getenteredQty).mul(bomQty));

					if(parseFloat(kitPickConfirmedQty) <= parseFloat(actEnteredQty))
					{
						remainingQty = Number(Big(actEnteredQty).minus(kitPickConfirmedQty));
					}


					if(parseFloat(remainingQty) < 0.0)
					{
						remainingQty = 0;
					}
					expQty=new Big(expQty);
					pickedqty=new Big(pickedqty);
					pickConfirmedQty=new Big(pickConfirmedQty)

					var vSoreminqty = Number((expQty).minus((pickedqty).minus(pickConfirmedQty)));

					var vClass='uir-list-row-tr line uir-list-row-even';
					if(b!=0 && b%2!=0)
						vClass='uir-list-row-tr line uir-list-row-odd';
					var linkURL_1 ='#';
					if(parseFloat(vSoLine) == parseFloat(getSOLineNo))
					{
						if(parseFloat(remainingQty) > 0)
						{
							linkURL_1 = checkInURL_1 +'&custparam_ordtype='+ordType+ '&custparam_memitemqty=' + expQty + 
							'&custparam_enteredqty=' + getenteredQty + '  &custparam_fetcheditemid=' + getItemInternalId + 
							'&custparam_itemid=' + vsoitemid + '   &custparam_sointernalid=' + getSOInternalId + '&custparam_rem_qty=' + 
							getItemRemQty + '&custparam_rec_qty=' + getItemRecQty + '&custparam_whlocation=' + whLocation  + '&custparam_whlocationname=' +
							whLocationName  + '&custparam_soid=' + getSONo  + '&custparam_trantype=' + trantype + '&custparam_company=' + whCompany +
							'&custparam_carton=' + getCarton + '&custparam_cartonsize=' + getCartonSize + '&custparam_cartonweight=' + getCartonWeight +
							'&custparam_cartonscreenrulevalue=' + getCartonscreenValue  + '&custparam_rem_qty=' + getItemRemQty + 
							'&custparam_memitempickedqty=' + 0  + '&custparam_lineno=' + getSOLineNo +'&custparam_actualbegintime='+ getActualBeginTime+
							'&custparam_department='+department+'&custparam_class='+vclass+'&custparam_picktype='+pickType+'&custparam_customer='+ 
							customer+'&custparam_itemremainingquantity='+ getItemRemainingQty;
						}
						html = html +	"			<tr class='"+vClass+"'>";
						if(linkURL_1 == '#')
						{
							html = html + " <td>"+vsoitem+"</td>";
						}
						else
						{
							html = html +" <td><a class='dottedlink' href='" + linkURL_1 + "'> "+vsoitem+"</a></td>";
						}

						html = html +"				</td>"+
						"				<td class = 'align-right' >"+parseFloat(parseFloat(kitPickConfirmedQty).toFixed(5))+""+	
						"				</td>"+
						"				<td class = 'align-right'  >"+parseFloat(parseFloat(remainingQty).toFixed(5))+""+	
						"				</td>"+
						"			</tr>";
					}
				}
			}
			html = html + 	"<tr><td></td><tr></table>";
			vItemDetails=null;
			vmemItemDetails=null;
		}

		html = html + "	</form>"+

		"<script type='text/javascript'>document.getElementById('txtItem').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {

		// Forming the temporary array SOarray
		var SOarray = new Array();
		var tempflag='F';
		var ordType= request.getParameter('hdnOrdtype');
		SOarray["custparam_ordtype"] =ordType;
		SOarray["custparam_soid"] = request.getParameter('custparam_soid');		
		var coItem = request.getParameter('txtItem');
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		SOarray["custparam_option"] = request.getParameter('hdnOptedField');
		SOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		SOarray["custparam_sointernalid"] = request.getParameter('hdnSoInternalId');
		SOarray["custparam_lineno"] = request.getParameter('hdnSoLineno');
		SOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		SOarray["custparam_rem_qty"] = request.getParameter('hdnItemRemQty');
		SOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		SOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		SOarray["custparam_enteredqty"] = request.getParameter('hdnenteredQty');
		SOarray["custparam_cartonsize"] = request.getParameter('hdnCartonsize');
		SOarray["custparam_carton"] = request.getParameter('hdnCarton');
		SOarray["custparam_cartonweight"] = request.getParameter('hdnCartonweight');
		SOarray["custparam_cartonscreenrulevalue"] = request.getParameter('hdnCartonscreenvalue');
		SOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		SOarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');
		SOarray["custparam_customer"] = request.getParameter('hdnCustomer');
		var department= request.getParameter('hdndept');
		var vclass= request.getParameter('hdnclass');
		SOarray["custparam_department"] =department;
		SOarray["custparam_class"] =vclass;
		SOarray["custparam_picktype"] = request.getParameter('hdnPickType');
		SOarray["custparam_itemremainingquantity"] = request.getParameter('hdnItemRemainingQty');
		SOarray["custparam_bcqty"] = request.getParameter('hdnBarcodeqty');
		SOarray["custparam_bcuom"] = request.getParameter('hdnBarcodeuom');			
		SOarray["custparam_bclot"] = request.getParameter('hdnBarcodeLot');
		SOarray["custparam_bcserial"] = request.getParameter('hdnBarcodeserial');
		SOarray["custparam_bcComponents"] = request.getParameter('hdncompositebarcode');

		var trantype=request.getParameter('hdntrantype');

		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button

		var logMsg = 'SO = ' + SOarray["custparam_soid"] + '<br>';
		logMsg = logMsg + 'optedEvent ='+ optedEvent + '<br>';
		logMsg = logMsg + 'SOarray["custparam_carton"] = ' + SOarray["custparam_carton"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonsize"] = ' + SOarray["custparam_cartonsize"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonweight"] = ' + SOarray["custparam_cartonweight"] + '<br>';
		logMsg = logMsg + 'SOarray["custparam_cartonscreenrulevalue"] = ' + SOarray["custparam_cartonscreenrulevalue"] + '<br>';
		nlapiLogExecution('ERROR', 'Processing RF - SKU', logMsg);

		// Processing only if the 'Previous' button is not pressed
		if(optedEvent != 'Back (F7)'){
			var context = nlapiGetContext();
			context.setSessionObject('record', null);
			if (coItem != "") {

				var filters = new Array();	
				var soid;
				filters.push(new nlobjSearchFilter('tranid', null, 'is', SOarray["custparam_soid"]));	
				// This search returns required results, 4k records fetching not required.
				var sosearch = nlapiSearchRecord(trantype, 'customsearch_wmsse_transactiondetails', filters, null);
				if(sosearch!=null && sosearch!='')
				{
					soid = sosearch[0].getId();


					var currItem = getSKUIdWithName(coItem, SOarray["custparam_whlocation"], SOarray["custparam_company"],soid);
					if(currItem==null ||  currItem=='')
					{
						nlapiLogExecution('DEBUG', 'Into Bar Code parsing', coItem);

						var currItem = new Array();

						var barcodecomponents = parsebarcodeoutsidereceiving(coItem,SOarray["custparam_whlocation"]);
						nlapiLogExecution('DEBUG', 'barcodecomponents', barcodecomponents);		
						if(barcodecomponents != null && barcodecomponents !='' && barcodecomponents !='null')
						{
							nlapiLogExecution('DEBUG', 'barcode error', barcodecomponents["error"]);	

							if(barcodecomponents["error"] == "NoBarcodeFormats")
							{
								SOarray["custparam_error"] = 'Invalid Item/Invalid Bar Code';
								response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);
								return;
							}
							if(barcodecomponents["error"] !=null && barcodecomponents["error"] !='' && barcodecomponents["error"] !='undefined')
							{
								SOarray["custparam_error"] = barcodecomponents["error"];
								response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);
								return;
							}

							var vItem =barcodecomponents['Item'];
							var vItemIntrid =barcodecomponents['ItemIntrid'];
							if(!isempty(vItemIntrid))
								currItem[0] =vItemIntrid;
							if(!isempty(vItem))
								currItem[1] =vItem;
							var vbarcodeQty = barcodecomponents['Quantity'];
							var vbarcodeUOM = barcodecomponents['UOM']; 
							var vbarcodeLot = '';
							var vbarcodeLotExpirydate ='';
							var vbarcodeSerial ='';

							if(currItem !=null && currItem !='' && currItem !='null' && 
									currItem !='undefined' && currItem !=undefined )
							{

								//WMSLITE-3232 - Composite Barcode Custom list mapping

								SOarray["custparam_bcComponents"] = JSON.stringify(barcodecomponents);						
								SOarray["custparam_bcuom"]='';
								SOarray["custparam_bcqty"]='';
								SOarray["custparam_bcserial"]='';
								SOarray["custparam_bcexpirydate"]='';
								SOarray["custparam_bclot"]='';

								// Upto here WMSLITE-3232 - Composite Barcode Custom list mapping

								var logMsg1 = 'vItem =' + vItem + '<br>';
								logMsg1 = logMsg1 + 'vItemIntrid = ' + vItemIntrid + '<br>';
								logMsg1 = logMsg1 + 'vbarcodeQty = ' + vbarcodeQty + '<br>';
								logMsg1 = logMsg1 + 'vbarcodeUOM = ' +vbarcodeUOM+ '<br>';
								logMsg1 = logMsg1 + 'vbarcodeLot = ' + vbarcodeLot + '<br>';
								logMsg1 = logMsg1 + 'vbarcodeLotExpirydate = ' + vbarcodeLotExpirydate + '<br>';
								logMsg1 = logMsg1 + 'vbarcodeSerial = ' + vbarcodeSerial + '<br>';


								nlapiLogExecution('DEBUG', 'Barcode Parsing parameters', logMsg1);

							}
						}

						nlapiLogExecution('DEBUG', 'Out of Bar Code parsing', coItem);
					}
					if(currItem!=null && currItem!='')
					{

						var vIntId=currItem[0];
						if(coItem != currItem[1])
							coItem = currItem[1];
						if(vIntId != null && vIntId != '')
						{

							var soLineDetails =
								getSOLineDetails(SOarray["custparam_soid"], trantype,SOarray["custparam_fetcheditemid"],SOarray["custparam_whlocation"],
										SOarray["custparam_lineno"]);



							if(soLineDetails !=null && soLineDetails !='' && soLineDetails.length !=null)
							{
								var vColumnslist = soLineDetails[0].getAllColumns();


								var memitemcommitedQtyIndex = 8;
								var memitemfulfilledQtyIndex = 9;		
								var memitemtotalPickedQtyIndex =10;
								for(var x1=0;x1<vColumnslist.length;x1++)
								{
									var summaryLabel = vColumnslist[x1].getLabel();

									if(summaryLabel == 'Member Item Total Picked Quantity')
									{
										memitemtotalPickedQtyIndex = x1;
									}
									else if (summaryLabel == 'Member Item Committed Quantity')	
									{
										memitemcommitedQtyIndex = x1;
									}
									else if (summaryLabel == 'Member Item Fulfilled Quantity')
									{
										memitemfulfilledQtyIndex = x1;
									}				
									else
									{

									}
								}
								var getenteredQty =request.getParameter('hdnenteredQty');
								var isValidItem = 'F';
								for(var j=0; j<soLineDetails.length; j++)
								{
									var result = soLineDetails[j]; 
									var vsoitem = result.getValue('memberitem','item','group');
									var pickedqty = result.getValue(vColumnslist[memitemtotalPickedQtyIndex]);
									var bomQty=result.getValue('memberquantity','item','group');
									var expQty=Number(Big(getenteredQty).mul(bomQty));
									var vsoitemid='';

									if(vsoitem==coItem)
									{
										isValidItem='T';
										SOarray["custparam_memitempickedqty"]=pickedqty;
										SOarray["custparam_memitemqty"]=expQty;
										SOarray["custparam_itemid"]=vIntId;

										var solineno=result.getValue('line');

										var vsoitemQty = result.getValue(vColumnslist[memitemcommitedQtyIndex]);
										var fulfiledQty=result.getValue(vColumnslist[memitemfulfilledQtyIndex]);
										var vsoitemRcvQty = Number(Big(result.getValue(vColumnslist[memitemtotalPickedQtyIndex])).plus(fulfiledQty));
										if(vsoitemQty == null || vsoitemQty == '')
											vsoitemQty=0;
										if(vsoitemRcvQty==null || vsoitemRcvQty=='')
											vsoitemRcvQty=0;

										var vSoreminqty = Number(Big(vsoitemQty).minus(vsoitemRcvQty));

										if(parseFloat(vSoreminqty)>0)
										{
											var getSOInternalId = request.getParameter('hdnSoInternalId');
											var getSOLineNo = request.getParameter('hdnSoLineno');
											var currentUser=getCurrentUser();
											var lockfilters=new Array();
											lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_trantype',null,'is',trantype));
											lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getSOInternalId));
											lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_line',null,'equalto',getSOLineNo));
											lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));

											var lockcolumns= new Array();

											var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

											if(lockresults!=null && lockresults!='')
											{
												var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
												var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');

												if(getLockUser!=currentUser)
												{
													SOarray["custparam_error"]='The line item is being processed by other user.';
													response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);
													return;
												}
												else if(parseInt(getLockLine)!=parseInt(getSOLineNo))
												{
													var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
													LockRecord.setFieldValue('name',getSOInternalId);
													LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
													LockRecord.setFieldValue('custrecord_wmsse_order',getSOInternalId);
													LockRecord.setFieldValue('custrecord_wmsse_line',getSOLineNo);
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
												LockRecord.setFieldValue('name',getSOInternalId);
												LockRecord.setFieldValue('custrecord_wmsse_trantype',trantype);
												LockRecord.setFieldValue('custrecord_wmsse_order',getSOInternalId);
												LockRecord.setFieldValue('custrecord_wmsse_line',getSOLineNo);
												LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
												LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
												var date = new Date();
												var mSecs = date.getTime();
												LockRecord.setFieldValue('custrecord_wmsse_time_msec',mSecs);
												var recid = nlapiSubmitRecord(LockRecord);			
												LockRecord=null;
											}
											lockresults=null;
											lockcolumns=null;
											lockfilters=null;


											SOarray["custparam_memitempickedqty"]=vsoitemRcvQty;
											tempflag='T';
											SOarray["custparam_error"]='';
											response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_binscan_sng', 'customdeploy_wmsse_kitorpkg_binscan_sng', false, SOarray);
										}
										break;
									}
								}
								vColumnslist=null;
								if(isValidItem=='F')
								{
									SOarray["custparam_error"]='Please enter/scan valid item';
									response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);

									return;
								}
								if(tempflag=='F')
								{
									SOarray["custparam_error"]='Entered/scanned item is already picked';
									response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);
									return;
								}
							}
							else
							{
								SOarray["custparam_error"]='Please enter/scan valid item';
								response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);
								return;
							}

						}

					}
					else
					{
						var itemfilters=new Array();
						itemfilters.push(new nlobjSearchFilter('nameinternal',null,'is',coItem));
						if(SOarray["custparam_whlocation"] != null && SOarray["custparam_whlocation"] !='' && SOarray["custparam_whlocation"] != null)
						{
							itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',SOarray["custparam_whlocation"]]));
						}
						// This search returns required results, 4k records fetching not required.
						var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_itemdetails', itemfilters, null);

						if(itemresults!=null && itemresults!='')
						{
							if(itemresults[0].getValue('isinactive')=="T")
							{
								SOarray["custparam_error"] = 'Entered item is inactive.';
							}
							else
							{
								SOarray["custparam_error"] = 'Please enter/scan valid item';
							}
						}
						else
						{
							SOarray["custparam_error"] = 'Please enter/scan valid item';
						}
						response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);
						nlapiLogExecution('DEBUG', 'itemRecord', 'Invalid Item Specified');
						return;
					}
				}
				else
				{
					SOarray["custparam_error"]='Please enter/scan valid item';
					response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);
					nlapiLogExecution('DEBUG', 'itemRecord', 'Invalid Item Specified');
					return;
				}
			} else {
				SOarray["custparam_error"]='No order lines retrieved for this sku';
				response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_itmscan_sng', 'customdeploy_wmsse_kitorpkg_itmscan_sng', false, SOarray);
				nlapiLogExecution('DEBUG', 'poLineDetails ', 'No order lines retrieved for this SKU');
				return;
			}
		}
		else {
			SOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_kitorpkg_qtyscan_sng', 'customdeploy_wmsse_kitorpkg_qtyscan_sng', false, SOarray);
			return;
		}
	} //end of first if condition
} //end of function.


/**
 * To get Component item details of Kit/Package item
 * @param getItemInternalId
 * @returns {Array}
 */
function  fnGetComponentItemDetails(getItemInternalId)
{
	var filters = new Array(); 

	filters[0] = new nlobjSearchFilter('internalid', null, 'is', getItemInternalId);//kit_id is the parameter name 
	filters[1]=new nlobjSearchFilter('isfulfillable', null, 'is', 'T');
	// This search returns required results, 4k records fetching not required.
	var searchresults = nlapiSearchRecord( 'item', 'customsearch_wmsse_itemdetails', filters, null);  
	var kititemsarr = new Array();
	for(var q=0; searchresults!=null && q<searchresults.length;q++) 
	{
		var vMemItemType=searchresults[q].getValue('type','memberitem');		
		var vSubArr=new Array();
		vSubArr.push(searchresults[q].getText('memberitem'));
		var vMemQty=searchresults[q].getValue('memberquantity');
		if(vMemQty == null || vMemQty == '')
			vMemQty=0;
		var cuurRow=[searchresults[q].getText('memberitem'),searchresults[q].getValue('memberitem')];
		kititemsarr.push(cuurRow);
	}
	searchresults=null;
	filters=null;	
	return kititemsarr;
}
/**
 * To get open order line details with combination of open task and order from saved search
 * @param sonumber
 * @param trantype
 * @param itemID
 * @param whLocation
 * @returns {nlapiSearchRecord}
 */
function getSOLineDetails(sonumber,trantype,itemID,whLocation,lineid)
{
	nlapiLogExecution('DEBUG', 'sonumber,trantype,whLocation,itemID',sonumber+","+trantype+","+whLocation+","+itemID);


	// check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();

	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';

	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('tranid', null, 'is', sonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
	{
		if(crossSubsidiaryFeature == true && trantype =="salesorder")
		{
			filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof', ['@NONE@',whLocation]));
		}
		else
		{
			filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',whLocation]));
		}
	}


	if(itemID != null && itemID != '')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 

	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{		
		if(trantype=='transferorder')
			lineid = parseInt(lineid) + 1;
		filters.push(new nlobjSearchFilter('line', null, 'equalto', lineid));
	}
	// This search returns required results, 4k records fetching not required.
	var SOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_ordline_details_kit', filters, columns);

	return SOLineDetails;
	filters=null;
	columns=null;
}

function getOpenTaskDetails(sonumber,lineid)
{
	var filter = new Array();

	filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', sonumber)); 
	filter.push(new nlobjSearchFilter('custrecord_wmsse_kitflag', null, 'is', 'T')); //PICK
	filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
	filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['28']));//8 picking completed

	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{		
		filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineid));
	}
	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	filter.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'noneof',['@NONE@'])); // NS REF no is empty

	// This search returns required results, 4k records fetching not required.
	var opentaskordersearchresultkit = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_picktask_details',filter,null);

	return opentaskordersearchresultkit;
}

function getOpenKitPickTaskDetails(sonumber,lineid)
{
	var filter = new Array();

	filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', sonumber)); 
	filter.push(new nlobjSearchFilter('custrecord_wmsse_kitflag', null, 'is', 'T')); //PICK
	filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3'])); //PICK
	filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8','28']));//8 picking completed
	filter.push(new nlobjSearchFilter('custrecord_wmsse_act_qty', null, 'isempty'));

	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{		
		filter.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineid));
	}
	filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));
	// This search returns required results, 4k records fetching not required.
	var opentaskordersearchresultkit = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_picktask_details',filter,null);

	return opentaskordersearchresultkit;
}
