/**
 * Script Description
 * This script is used to Scan Bin Location ,Item, Qty for Create Inventory.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function for Bin Location scan screen
 */
function RFInventoryCIBIN(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();	
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var html = '';
		var whLocation = request.getParameter('custparam_whlocation');

		var whLocationName = request.getParameter('custparam_whlocationname');
		var accountNo = '';//request.getParameter('custparam_accountno');
		var vSubsid = getSubsidiary(whLocation);
		
		var logmsg = 'whLocation. = ' + whLocation + '<br>';
		logmsg = logmsg + 'accountNo. = ' + accountNo + '<br>';	
		logmsg = logmsg + 'vSubsid. = ' + vSubsid + '<br>';	
				
		nlapiLogExecution('DEBUG', 'CI Bin get values :', logmsg);
		
		var scannedBin = request.getParameter('custparam_scanbin');
		var scannedItem = request.getParameter('custparam_scanitem');

		if(scannedBin == null || scannedBin == '' || scannedBin == 'null' || scannedBin == 'undefined')
		{
			scannedBin = '';
		}
		if(scannedItem == null || scannedItem == '' || scannedItem == 'null' || scannedItem == 'undefined')
		{
			scannedItem = '';
		}

		var enteredItem = request.getParameter('custparam_entereditemid');
		var blnItemUnit ='';
		var VUnitType = '';
		var uomresults= new Array();
		var results='';
		var addbtnimgUrl='';
		var delbtnimgUrl='';
		var itemType ='';
		var preferbinId = '';
		var vSubsidiary ='';
		if(enteredItem != null && enteredItem != '' && enteredItem != 'null' && enteredItem != 'undefined')
		{

			var itemfilters=new Array();
			itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',enteredItem));

			if(whLocation != null && whLocation !='' && whLocation != null)
			{
				itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
			}

			var itemcolumns= new Array();
			/*itemcolumns.push(new nlobjSearchColumn('preferredbin'));
			itemcolumns.push(new nlobjSearchColumn('itemid'));
			itemcolumns.push(new nlobjSearchColumn('binnumber'));
			itemcolumns.push(new nlobjSearchColumn('name'));	
			itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_item'));	
			itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_mix_lot'));	
			itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemgroup'));	
			itemcolumns.push(new nlobjSearchColumn('custitem_wmsse_itemfamily'));	
			itemcolumns.push(new nlobjSearchColumn('stockunit'));
			itemcolumns.push(new nlobjSearchColumn('unitstype'));
			itemcolumns.push(new nlobjSearchColumn('location','binnumber'));
			itemcolumns.push(new nlobjSearchColumn('isinactive'));*/
			itemcolumns.push(new nlobjSearchColumn('itemid'));
			if(vSubsid != null && vSubsid != '' && vSubsid != 'null' && vSubsid != 'undefined')
				itemcolumns.push(new nlobjSearchColumn('subsidiary'));
			//itemcolumns[0].setSort(true);

			var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inventory_itemdetails', itemfilters, itemcolumns);

			if(itemresults != null && itemresults != '' && itemresults != 'null' && itemresults != 'undefined')
			{
				blnItemUnit = itemresults[0].getText('stockunit');
				VUnitType = itemresults[0].getValue('unitstype');
				itemType = itemresults[0].recordType;	
				preferbinId = itemresults[0].getValue('preferredbin');
				if(vSubsid != null && vSubsid != '' && vSubsid != 'null' && vSubsid != 'undefined')
					vSubsidiary = itemresults[0].getValue('subsidiary');
			}
			var getStockConversionRate =1;
			var vConversionRate=1;
			var vBaseUnit='';			
			var getStockCRate=0;
			if(VUnitType != null && VUnitType != '')
			{	
				var vBaseUOMSearch=getBaseUnitRate(VUnitType);

				vBaseUnit='Base unit';
				if(vBaseUOMSearch != null && vBaseUOMSearch != '')
				{
					vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
					vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
				}	

				if(blnItemUnit !=null && blnItemUnit!='' && blnItemUnit !='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -')
				{
					getStockConversionRate =getStockCoversionRate(VUnitType,blnItemUnit,vConversionRate);
					//Case # 201414603  start
					getStockCRate = getStockConversionRate;
					//Case # 201414603  end
				}
				results= getUnitsType(VUnitType);
				if(results != null && results != '' && results != 'null' && results != 'undefined')
				{
					for(var Cnt=0; Cnt < results.length; Cnt++)
					{

						var UOMText =results[Cnt].getValue('unitname');
						var vQty = results[Cnt].getValue('conversionrate');
						var row = [UOMText+"_"+vQty];
						uomresults.push(row);
					}



					var imgfilefound1=  getLoadFile('Plus.png');
					if(imgfilefound1)
					{
						addbtnimgUrl = imgfilefound1.getURL();
						nlapiLogExecution('DEBUG', 'imgUrl', addbtnimgUrl);
					}

					var imgfilefound2 =  getLoadFile('minus.png');
					if(imgfilefound2)
					{
						delbtnimgUrl = imgfilefound2.getURL();
						nlapiLogExecution('DEBUG', 'imgUrl', delbtnimgUrl);
					}

				}
			}

		}

		var errMsg='';
		var valid = validateLocationForAccNo(request.getParameter('custparam_whlocation'),vSubsid);

		if(valid == '')
		{
			errMsg='Please configure account no  for this warehouse location';
		}
		else
		{
			accountNo =valid;						

		}
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='' && errMsg == '')
		{
			errMsg = request.getParameter('custparam_error');
		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('DEBUG', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		
		var st0 = domainName + '-CI Inventory';

		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('DEBUG', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var imgfilefound='';
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			nlapiLogExecution('DEBUG', 'imgUrl', imgUrl);
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");

		var JSfile = getLoadFile('wmsse_uomfunctions.js');
		var JSSurl ='';
		if (JSfile) 
		{ 
			JSSurl = JSfile.getURL();
			nlapiLogExecution('DEBUG', 'JSSurl', JSSurl); 
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

		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}
		html = html + "	<script type='text/javascript'>function validateForm_ci() {" +
		"if(document.getElementById('div_error').innerHTML != ''&& document.getElementById('div_error').innerHTML != null &&" +
		" document.getElementById('div_error').innerHTML == 'Please configure account no  for this warehouse location'){" +
		"document.getElementById('txtBin').focus(); return false;}else{if(document.getElementById('txtBin').value == ''){" +
		"document.getElementById('div_error').innerHTML ='Please enter/scan bin location';	document.getElementById('txtBin').focus(); return false;}" +
		"else if(document.getElementById('txtItem').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan item';" +
		"document.getElementById('txtItem').focus(); return false;}else{return validateFormforinventory(\""+getStockConversionRate+"\",null,'hdnselecteduomswithqty','hdnItemType','txtBin','hdnPreferBin','hdntotaluomqtyentered');} }}</script>"+
		"	<script type='text/javascript'>function validateItem(usedBins,vpoitem) {if(usedBins == 'F'){document.getElementById('div_error').innerHTML ='Please select use bins flag for this item ' +vpoitem+ ' to receive.';	document.getElementById('txtBin').focus(); return false;}else{this.form.submit();this.disabled=true;this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html+"	<script type='text/javascript'>function OnitemScan() {document.getElementById('hdnIsFromItemScan').value ='Y';document.forms['_rf_checkin_item'].submit(); return true;}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();' onload='setFocus();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm_ci();'/>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Create Inventory</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+		
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Warehouse Location: <label>" + whLocationName + "</label>"+			
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnaccountNo' value=" + accountNo + ">"+	
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + preferbinId + ">"+	
		"				<input type='hidden' name='hdnItemType' id='hdnItemType' value=" + itemType + ">"+	
		"				<input type='hidden' name='hdnIsFromItemScan' id='hdnIsFromItemScan' >"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+	
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+	
		"				<input type='hidden' name='hdnitmstockunit' id='hdnitmstockunit' value='"+blnItemUnit+"' >"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value='"+getStockConversionRate+"' >"+
		"				<input type='hidden' name='hdnvSubsidiary' id='hdnvSubsidiary' value='"+vSubsidiary+"' >"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Bin Location"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>";
		if(scannedItem != null && scannedItem != 'null' && scannedItem != '' )
		{
			html = html +"				<td align = 'left'><input name='txtBin'  class='smalltextbox'  id='txtBin' type='text' value='"+scannedBin+"' onchange='return OnitemScan();' />";
		}
		else
		{
			html = html +	"				<td align = 'left'><input name='txtBin'  class='smalltextbox'  id='txtBin' type='text' value='"+scannedBin+"' />";
		}
		html = html +	"				</td>"+
		"			</tr>"+ 
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Item"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtItem'  class='smalltextbox'  id='txtItem' type='text' value='"+scannedItem+"' onchange='return OnitemScan();'/>"+
		"				</td>"+
		"			</tr>";
		if(results !=null &&  results !='' && results.length>0)
		{
			var selectedUomStr = request.getParameter('custparam_uomqtyselected');
			nlapiLogExecution('DEBUG', 'selectedUomStr', selectedUomStr);
			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				
				html = html +"<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox'  id='txtqty0' type='text'  /></td><td></td>";
				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					if(Cnt==0)
					{
						html = html +"<td><select id='uomlist"+Cnt+"' class='labelmsg'  name = 'uomlist"+Cnt+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";


					}
					if(blnItemUnit !=null && blnItemUnit !='' && blnItemUnit!='null' && blnItemUnit !='undefined' && blnItemUnit !='- None -' && blnItemUnit == UOMText)
					{
						html = html +" <option value="+vQty+" selected >"+UOMText +" </option>";
					}
					else
					{
						html = html +" <option value="+vQty+"  >"+UOMText +" </option>";
					}
				}

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(null,\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr></table>";	
			}
			else
			{
				nlapiLogExecution('DEBUG', 'else', selectedUomStr);
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
					html = html +"<td><select id='uomlist"+u+"' class='labelmsg'  name = 'uomlist"+u+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";
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
						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(null,\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr>";
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
			html = html+"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Enter Qty"+	
			"				</td>"+
			"			</tr>"+
			"			<tr>"+
			"				<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>"+
			"				</td>"+
			"			</tr>" ;
		}


		var inventoryStatusLst = getDefaultInventoryStatusList();
		if(inventoryStatusLst.length > 0)
		{

			nlapiLogExecution('DEBUG', 'inventoryStatusLst', inventoryStatusLst);
			html = html+"			<tr>"+
			"				<td align = 'left' class='labelmsg'>Inv Status "+	
			"				</td>"+
			"			</tr>";
			html = html +"			<tr>";
			html = html +"				<td align = 'left' class='labelmsg'>" +
			"<select id='inventorystatuslist' class='labelmsg'  name = 'inventorystatuslist' >" ;
			for(var Cnt1=0; Cnt1 < inventoryStatusLst.length; Cnt1++)
			{                    	 
				var vInventoryStatus = inventoryStatusLst[Cnt1][0];
				var vId =inventoryStatusLst[Cnt1][1];
				var prevSelectedStatus = request.getParameter('custparam_inventorystatus');
				if(prevSelectedStatus == vId)
				{
					html = html +" <option   selected  value="+vId+"> "+vInventoryStatus+"</option>";

				}
				else
				{

					html = html +" <option     value="+vId+"> "+vInventoryStatus+"</option>";
				}	

			}

			html=html+"</select></td></tr>";
		}
		html = html+"</table>"+
		"			<table><tr><td colspan='3'></td></tr><tr>"+
		"				<td align = 'left'>"+
		"				<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm_ci();'/></td>"+		
		"			</tr>"+
		"		 </table>";

		html = html + "	</form>"+
		"<script type='text/javascript'>document.getElementById('txtBin').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating SKU/ITEM');

		// Forming the temporary array POarray  
		var POarray = new Array();
		POarray["custparam_scanbin"] = request.getParameter('txtBin');
		POarray["custparam_scanitem"] = request.getParameter('txtItem');
		nlapiLogExecution('DEBUG', 'request.getParameter(txtqty)', request.getParameter('txtqty'));
		
		POarray["custparam_scantotqty"] = request.getParameter('txtqty');
		POarray["custparam_blnItemUnit"] = request.getParameter('hdnitmstockunit');
		POarray["custparam_stockConversionRate"] = request.getParameter('hdngetStockConversionRate');
		POarray["custparam_enterQty"] = parseFloat(POarray["custparam_scantotqty"]);

		var enteredItem = request.getParameter('txtItem');
		var whLocation = request.getParameter('hdnWhLocation');
		var eneteredStatus = request.getParameter('inventorystatuslist');
		var vSubsid = request.getParameter('hdnvSubsidiary');
		
		var vSubsidiary= new Array();		
		if(vSubsid != null && vSubsid !='' && vSubsid != null)
		{
			var itemsubfilters=new Array();
			if(enteredItem != null && enteredItem !='' && enteredItem != null)
			{
				itemsubfilters.push(new nlobjSearchFilter('internalid',null,'anyof',enteredItem));
			}
			if(whLocation != null && whLocation !='' && whLocation != null)
			{
				itemsubfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
			}
			var itemsubcolumns= new Array();
			itemsubcolumns.push(new nlobjSearchColumn('subsidiary'));
			var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemsubfilters, itemsubcolumns);
			if(itemresults != null && itemresults != '' && itemresults != 'null' && itemresults != 'undefined')
			{
				for(var v=0; v<itemresults; v++)
				{
					vSubsidiary = itemresults[v].getValue('subsidiary');
				}
			}
		}

		if(request.getParameter('txtqty') == null || request.getParameter('txtqty') == '' 
			|| request.getParameter('txtqty') == 'null' || request.getParameter('txtqty') == 'undefined')
		{

			nlapiLogExecution('DEBUG', 'request.getParameter(hdntotaluomqtyentered)',
					request.getParameter('hdntotaluomqtyentered'));
			POarray["custparam_scantotqty"] = request.getParameter('hdntotaluomqtyentered');
			POarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			POarray["custparam_enterQty"] = parseFloat(POarray["custparam_scantotqty"]);
			nlapiLogExecution('DEBUG','inside if' ,POarray["custparam_scantotqty"]);
		}
		POarray["custparam_scantotqty"] = parseFloat(parseFloat(POarray["custparam_scantotqty"]));
		POarray["custparam_enterQty"] = parseFloat(parseFloat(POarray["custparam_enterQty"]));
		
		POarray["custparam_accountno"] = request.getParameter('hdnaccountNo');
		POarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		//POarray["custparam_company"] = request.getParameter('hdnWhCompany');
		POarray["custparam_option"] = request.getParameter('hdnOptedField');
		POarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		POarray["custparam_inventorystatus"] = eneteredStatus;
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var accountNo = request.getParameter('hdnaccountNo');
		var logMsg = 'LocationId = ' + POarray["custparam_whlocation"] + '<br>';
		logMsg = logMsg + 'LocationName = ' + POarray["custparam_whlocationname"] + '<br>';
		nlapiLogExecution('DEBUG', 'Processing RF - SKU', logMsg);
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
					if (POarray["custparam_scanbin"] != "")
					{

						if (POarray["custparam_scanitem"] != "") {
							POarray["custparam_fromBin"] = POarray["custparam_scanbin"];
							var currItem = getSKUIdWithName(POarray["custparam_scanitem"], 
									POarray["custparam_whlocation"], null,null);
							nlapiLogExecution('DEBUG', 'currItem', currItem);
							if(currItem!=null && currItem!='')
							{						
								var vIntId=currItem[0];
								POarray["custparam_entereditemid"] = vIntId;
								var isFromItemScan = request.getParameter('hdnIsFromItemScan');

								if(isFromItemScan == 'Y')
								{
									POarray["custparam_entereditemid"] = vIntId;
									POarray["custparam_inventorystatus"] = '';//this is to set the default inv status when item is scanned
									response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan', 
											'customdeploy_wmsse_ci_bin_scan', false, POarray);
									return;
								}
								var vItemType = nswms_GetItemType(vIntId, POarray["custparam_whlocation"]);


								if(vIntId != null && vIntId != '')
								{

									var vScannedQty=0;
									nlapiLogExecution('DEBUG', 'POarray["custparam_scantotqty"] ', POarray["custparam_scantotqty"] );
									if(POarray["custparam_scantotqty"] != null && POarray["custparam_scantotqty"] != '')
									{
										vScannedQty=parseFloat(POarray["custparam_scantotqty"]);

									}
									nlapiLogExecution('DEBUG', 'vScannedQty', vScannedQty);
									if(parseFloat(vScannedQty) <=0)
									{
										POarray["custparam_error"] = 'Qty should be greater than 0';
										response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',
												'customdeploy_wmsse_ci_bin_scan', false, POarray);
										nlapiLogExecution('DEBUG', 'Qty2 should be greater than 0', '');
										return;
									}
									if(vItemType == 'serializedinventoryitem' || vItemType == 'serializedassemblyitem')
									{
										POarray["custparam_enterQty"] = parseFloat(POarray["custparam_scantotqty"]);
										POarray["custparam_scantotqty"] = Number(Big(POarray["custparam_stockConversionRate"]).mul(POarray["custparam_scantotqty"]));
										nlapiLogExecution('DEBUG', 'POarray["custparam_scantotqty"] big', POarray["custparam_scantotqty"]);
									}
									nlapiLogExecution('DEBUG', 'vScannedQty', vScannedQty);

									var Binandtypeflag=nswms_GetValidBinInternalIdWithLocationTypeInv(POarray["custparam_scanbin"],
											POarray["custparam_whlocation"],vIntId);
									var binInternalId = Binandtypeflag[0];
									var CheckFlag = Binandtypeflag[1];

									if((binInternalId==null || binInternalId=='') && (CheckFlag == 'F'))
									{
										POarray["custparam_error"] = 'Bin location should not be a stage/WIP location';
										response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan', 
												'customdeploy_wmsse_ci_bin_scan', false, POarray);
										nlapiLogExecution('DEBUG', 'Inavlid Bin scanned ', '');
										return;
									}

									else if(binInternalId==null || binInternalId=='')
									{
										POarray["custparam_error"] = 'Please enter/scan valid bin location';
										response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan', 
												'customdeploy_wmsse_ci_bin_scan', false, POarray);
										nlapiLogExecution('DEBUG', 'Inavlid Bin scanned ', '');
										return;
									}
									POarray["custparam_fromBinId"] = binInternalId;
									POarray["custparam_fetcheditemid"] = vIntId;

									POarray["custparam_fetcheditemname"] = currItem[1];

									var itemType = nswms_GetItemType(POarray["custparam_fetcheditemid"],
											POarray["custparam_whlocation"]);
									POarray["custparam_itemtype"] = itemType;
									nlapiLogExecution('DEBUG', 'itemType', itemType);
									if(itemType == 'Description' || itemType == 'descriptionitem' 
										|| itemType == 'discountitem' || itemType == 'Discount' || 
										itemType == 'Payment' || itemType == 'paymentitem'  ||
										itemType == 'Markup'  || itemType == 'markupitem' || itemType == 'Subtotal' ||
										itemType == 'subtotalitem' )
									{

										POarray["custparam_error"] = "Entered item is of type '"+itemType+"',which doesnot hold physical inventory.";
										response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',
												'customdeploy_wmsse_ci_bin_scan', false, POarray);
										return;
									}


									var logMsg = logMsg + 'Fetched Item = ' + POarray["custparam_fetcheditemid"] + '<br>';
									logMsg = logMsg + 'Location = ' + POarray["custparam_whlocation"] + '<br>';
									logMsg = logMsg + 'Locationname = ' + POarray["custparam_whlocationname"] + '<br>';
									logMsg = logMsg + 'Fetched Item Name = ' + POarray["custparam_fetcheditemname"] + '<br>';
									logMsg = logMsg + 'itemType = ' + itemType;
									nlapiLogExecution('DEBUG', 'Inside Item scan Details', logMsg);

									if(POarray["custparam_scanitem"] != ""){

										if(itemType == 'kititem')
										{
											nlapiLogExecution('DEBUG', 'We cannot create inventory for kit item', POarray["custparam_scanitem"]);
											POarray["custparam_error"] = 'We cannot create inventory for kit/package item';
											response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',													
													'customdeploy_wmsse_ci_bin_scan', false, POarray);
											return;
										}
										else
										{	

											var resArray = getItemMixFlag(vIntId,binInternalId,
													request.getParameter('hdnWhLocation'),POarray["custparam_fromBin"]);
											nlapiLogExecution('DEBUG', 'resArray', resArray);
											if(resArray[0] == 'F')
											{
												POarray["custparam_error"] = "This item has mix items in bins flag false choose different bin";
												response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',
														'customdeploy_wmsse_ci_bin_scan', false, POarray);
												return;
											}
											if(resArray[1] == 'F')
											{
												POarray["custparam_error"] = "Please select use bins flag for this item to create inventory.";
												response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',
														'customdeploy_wmsse_ci_bin_scan', false, POarray);
												return;
											}

											var ctx = nlapiGetContext();
											var vunitsofmeasure=ctx.getFeature('unitsofmeasure');	

											if(itemType == "serializedinventoryitem" || itemType == "serializedassemblyitem") 								 
											{
												POarray["custparam_error"] = '';
												response.sendRedirect('SUITELET', 'customscript_wmsse_ci_serialscan',
														'customdeploy_wmsse_ci_serialscan', false, POarray);
												return;
											}
											else if(itemType == "lotnumberedinventoryitem" || itemType == "lotnumberedassemblyitem") 
											{	
												POarray["custparam_error"] = '';
												response.sendRedirect('SUITELET', 'customscript_wmsse_ci_lot_scan',
														'customdeploy_wmsse_ci_lot_scan', false, POarray);
												return;
											}
											else
											{

												var logmsg = 'itemType. = ' + itemType + '<br>';
												logmsg = logmsg + 'accountNo. = ' + accountNo + '<br>';	
												logmsg = logmsg + 'vSubsidiary. = ' + vSubsidiary + '<br>';	
																								
												nlapiLogExecution('DEBUG', 'CI bin values :', logmsg);

												if(vSubsidiary !=null && vSubsidiary!='' && vSubsidiary!='null' 
													&& vSubsidiary!='undefined' && vSubsidiary.length>0)
												{
													var subs = nlapiGetContext().getFeature('subsidiaries');
													
													if(subs==true)
													{
														var vSubsidiaryVal=getSubsidiaryNew(POarray["custparam_whlocation"]);
														nlapiLogExecution('Debug','vSubsidiaryVal',vSubsidiaryVal);
														if(vSubsidiary.indexOf(vSubsidiaryVal) == -1)
														{
															POarray["custparam_error"] = 'Item is not mapped to this subsidiary';
															response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan', 
																	'customdeploy_wmsse_ci_bin_scan', false, POarray);
															return;
														}
													}
												}

												var inventoryAdjustId=InvokeNSInventoryAdjustment(POarray["custparam_fetcheditemid"],
														POarray["custparam_itemtype"],POarray["custparam_whlocation"],
														Number(Big(POarray["custparam_enterQty"]).toFixed(8)),POarray["custparam_fromBinId"],
														'','','',DateStamp(),'',accountNo,eneteredStatus);
												POarray["custparam_error"] = '';
												nlapiLogExecution('DEBUG', 'inventoryAdjustId', inventoryAdjustId);
												var taskType="INVT";
												createInventoryOpenTask(POarray["custparam_itemtype"],
														POarray["custparam_whlocation"],POarray["custparam_fetcheditemid"],
														Number(Big(POarray["custparam_scantotqty"]).toFixed(8)),POarray["custparam_fromBinId"],'',
														inventoryAdjustId,taskType,'',POarray["custparam_blnItemUnit"],
														POarray["custparam_stockConversionRate"],eneteredStatus);
												response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu',
														'customdeploy_wmsse_inventorymenu', false, POarray);
												return;
											}
										}

									} else {
										nlapiLogExecution('DEBUG', 'No SKU scanned or entered', POarray["custparam_scanitem"]);
										POarray["custparam_error"] = 'Please enter/scan valid item';
										response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',
												'customdeploy_wmsse_ci_bin_scan', false, POarray);
									}
								}
								else									 
								{
									POarray["custparam_error"] = 'Please enter/scan valid item';
									response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',
											'customdeploy_wmsse_ci_bin_scan', false, POarray);
									nlapiLogExecution('DEBUG', 'Qty1 should be greater than 0', '');
									return;
								}


							}
							else
							{

								var itemfilters=new Array();
								itemfilters.push(new nlobjSearchFilter('nameinternal',null,'is',request.getParameter('txtItem')));
								if(POarray["custparam_whlocation"] != null && POarray["custparam_whlocation"] !=''
									&& POarray["custparam_whlocation"] != null)
								{
									itemfilters.push(new nlobjSearchFilter('location',null,'anyof',
											['@NONE@',POarray["custparam_whlocation"]]));
								}
								var itemcolumns= new Array();
								itemcolumns.push(new nlobjSearchColumn('isinactive'));
								var itemresults= nlapiSearchRecord('item', 'customsearch_wmsse_inv_basic_itemdetails', itemfilters, itemcolumns);
								nlapiLogExecution('DEBUG', 'itemresults', itemresults);
								if(itemresults!=null && itemresults!='')
								{
									if(itemresults[0].getValue('isinactive')=="T")
									{
										POarray["custparam_error"] = 'Entered item is inactive.';
									}
									else
									{
										POarray["custparam_error"] = 'Please enter/scan valid item';
									}
								}
								else
								{
									POarray["custparam_error"] = 'Please enter/scan valid item';
								}
								response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan', 
										'customdeploy_wmsse_ci_bin_scan', false, POarray);
								nlapiLogExecution('DEBUG', 'itemRecord', 'Invalid Item Specified');
								return;
							}
						} else {
							POarray["custparam_error"] = 'Please enter/scan valid item';
							response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',
									'customdeploy_wmsse_ci_bin_scan', false, POarray);
							nlapiLogExecution('DEBUG', 'No Item scanned ', '');
							return;
						}
					}
					else{
						POarray["custparam_error"] = 'Please enter/scan valid bin location';
						response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',
								'customdeploy_wmsse_ci_bin_scan', false, POarray);
						nlapiLogExecution('DEBUG', 'No Item scanned ', '');
						return;
					}

				} else {
					POarray["custparam_error"] = '';
					response.sendRedirect('SUITELET', 'customscript_wmsse_inventorymenu',
							'customdeploy_wmsse_inventorymenu', false, POarray);
					return;
				}
			}
			catch(e)
			{
				var msgstring= e.toString();
				
				POarray["custparam_number"] =0;
				POarray["custparam_error"] = msgstring;
				response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan', 
						'customdeploy_wmsse_ci_bin_scan', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_ci_bin_scan',
					'customdeploy_wmsse_ci_bin_scan', false, POarray);
			return;
		}
	} //end of first if condition
} //end of function.
function getItemMixFlag(itemNo,binInternalId,strLocation,BinLocation)
{
	var resultArray = new Array();
	var mixFlag = "T";
	var isValid='T';
	var useBins='T';
	var vfilter=new Array();						
	vfilter[0]=new nlobjSearchFilter("internalid",null,"anyof",itemNo);
	var vColumns = new Array();
	vColumns.push(new nlobjSearchColumn('custitem_wmsse_mix_item'));
	vColumns.push(new nlobjSearchColumn('usebins'));
	var searchres=nlapiSearchRecord('item','customsearch_wmsse_inv_basic_itemdetails',vfilter,vColumns);
	if(searchres!=null && searchres !="")
	{
		mixFlag = searchres[0].getValue('custitem_wmsse_mix_item');
		useBins= searchres[0].getValue('usebins');
	}
	
	var getPreferBin='';
	var itemfilters=new Array();
	itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',itemNo));
	itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
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
		
	var logmsg = 'mixFlag. = ' + mixFlag + '<br>';
	logmsg = logmsg + 'getPreferBin. = ' + getPreferBin + '<br>';	
	logmsg = logmsg + 'BinLocation. = ' + BinLocation + '<br>';	
		
	nlapiLogExecution('DEBUG', 'ci bin values :', logmsg);
	
	if(mixFlag=='F' && (getPreferBin != BinLocation))
	{
		var filterStrat = new Array();
		var columns = new Array();
		columns.push(new nlobjSearchColumn('binnumber','binOnHand'));
		filterStrat.push(new nlobjSearchFilter('internalid',null,'noneof', itemNo));
		filterStrat.push(new nlobjSearchFilter('quantityonhand','binOnHand', 'greaterthan', 0));
		if(binInternalId!=null && binInternalId!='')
			filterStrat.push(new nlobjSearchFilter('binnumber','binOnHand', 'anyof', binInternalId));
		if(strLocation!= null && strLocation!= '')
			filterStrat.push(new nlobjSearchFilter('location','binOnHand', 'anyof', strLocation));
		var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterStrat, columns);
		if(objInvDetails!=null && objInvDetails != '' && objInvDetails != 'null' && objInvDetails != 'undefined' && objInvDetails.length != null)
		{
			isValid='F';
		}
	}
	resultArray.push(isValid);
	resultArray.push(useBins);
	return resultArray;

}

function validateLocationForAccNo(whLocation,vSubsid)
{
	nlapiLogExecution('DEBUG', 'whLocation', 'whLocation');
	nlapiLogExecution('DEBUG', 'vSubsid', vSubsid);
	var  isValid = '';

	var filters=new Array();
	//filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
	filters.push(new nlobjSearchFilter('internalid', null, 'is', whLocation));
	var columns = new Array();
	columns.push(new nlobjSearchColumn('custrecord_wmsse_wms_account'));

	var searchresults = nlapiSearchRecord('location', 'customsearch_wmsse_locsearchresults', filters, columns);	

	if(searchresults != null && searchresults !='' && searchresults.length > 0)
	{
		var searchRec = searchresults[0];
		var accNo = searchRec.getValue('custrecord_wmsse_wms_account');

		if(accNo != '' && accNo != 'null' && accNo != null && accNo != 'undefined')
		{
			isValid = accNo;
		}
		else
		{
			var filters=new Array();
			filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
			if(whLocation != null && whLocation != '' && whLocation != 'null' && vSubsid != null && vSubsid != '' && vSubsid != 'null')
			{
				var vSubsidiary=getSubsidiaryNew(whLocation);
				nlapiLogExecution('DEBUG', 'vSubsidiary', vSubsidiary);
				if(vSubsidiary != null && vSubsidiary != '')
					filters.push(new nlobjSearchFilter('subsidiary', null, 'anyof', vSubsidiary)); 
			}

			var columns = new Array();
			columns.push(new nlobjSearchColumn('internalid'));
			columns[0].setSort();
			var searchresults = nlapiSearchRecord('account', null, filters, columns);
			if(searchresults != '' && searchresults != 'null' && searchresults != null && searchresults != 'undefined')
			{
				isValid=searchresults[0].getId();
			}
		}
	}

	nlapiLogExecution('DEBUG', 'isValid', isValid);
	return isValid;
}

function getSubsidiary(whLocation)
{
	var subs = nlapiGetContext().getFeature('subsidiaries');
	nlapiLogExecution('DEBUG', 'subs', subs);
	if(subs != null && subs != '' && subs==true)
	{
		var filters=new Array(); 

		if(whLocation !=null && whLocation !='' && whLocation !=0)
			filters.push(new nlobjSearchFilter('internalid', null, 'is', whLocation));

		//filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
		var columns = new Array();
		columns.push(new nlobjSearchColumn('subsidiary'));

		var searchresults = nlapiSearchRecord('location', 'customsearch_wmsse_locsearchresults', filters, columns);

		if(searchresults != null && searchresults != '')
		{
			return searchresults[0].getValue('subsidiary');
		}
		else
			return "";
	}
	else
		return "";
}