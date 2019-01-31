/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function workorderassemblybuildQtyScan(request, response){

	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	if (request.getMethod() == 'GET') 
	{
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('ERROR', 'getOptedField', getOptedField);
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		var departments = nlapiGetContext().getFeature('departments');
		var classes = nlapiGetContext().getFeature('classes');
		
		//Variable Declaration
		var html = '';

		//	Get the WO# from the previous screen, which is passed as a parameter		
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
		var actualBeginTime = request.getParameter('custparam_actualbegintime');		
		var getItemRemQty = request.getParameter('custparam_rem_qty');
		var getItemRecQty = request.getParameter('custparam_rec_qty');
		var getItemQty = request.getParameter('custparam_woitemqty');
		var getitemType=request.getParameter('custparam_itemtype');
		var lotno = request.getParameter('custparam_lotno');
		var lotExpiryDate = request.getParameter('custparam_lotexpirydate');
		var vUnits = request.getParameter('custparam_fetched_units');
		var makeInvAvailFlag = request.getParameter('custparam_makeinventoryavailflag');
		
		
		
		var getStockConversionRate =1;
		var uomresults= new Array();
		var results='';
		var addbtnimgUrl='';
		var delbtnimgUrl='';

    //featching Inventory status
		var inventoryStatusLst = getDefaultInventoryStatusList(null,-1,null);	


		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');	
			
		var domainName = fndomainName();		

		var logmsg = 'getWONo. = ' + getWONo + '<br>';
		logmsg = logmsg + 'whLocation. = ' + whLocation + '<br>';	
		logmsg = logmsg + 'getWOItem. = ' + getWOItem + '<br>';	
		logmsg = logmsg + 'getItemInternalId. = ' + getItemInternalId + '<br>';
		logmsg = logmsg + 'actualBeginTime. = ' + actualBeginTime + '<br>';
		logmsg = logmsg + 'inventoryStatusLst. = ' + inventoryStatusLst + '<br>';
		logmsg = logmsg + 'getitemType. = ' + getitemType + '<br>';
		logmsg = logmsg + 'getItemRemQty. = ' + getItemRemQty + '<br>';
		logmsg = logmsg + 'getItemRecQty. = ' + getItemRecQty + '<br>';
		nlapiLogExecution('DEBUG', 'Assemblybuildqty get values :', logmsg);
		
		var st0 = domainName + '-Assembly Build Work Order';
		var getPreferBin='';
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		var ordVar = "Work Order#";
		var btnText='Save (Ent)';
		var whLocationName = request.getParameter('custparam_whlocationname');

		var itemfilters=new Array();
		itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',getItemInternalId));
		//itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		/*itemfilters.push(new nlobjSearchFilter('location','binnumber','anyof',['@NONE@',whLocation]));*/
		if(whLocation != null && whLocation !='' && whLocation != null)
		{
			itemfilters.push(new nlobjSearchFilter('inventorylocation',null,'anyof',[whLocation]));
		}
		//itemfilters.push(new nlobjSearchFilter('preferredbin', null, 'is', 'T'));
		var itemcolumns= new Array();

		var itemresults= nlapiSearchRecord('item','customsearch_wmsse_woqty_item_srh', itemfilters, itemcolumns);
		var isactiveflag = 'F';
		var strItemGrp="";
		var strItemFam="";	
		var Vdepartment ="";
		var Vclass ="";
		//var itemType ='';
		var itemType = '';
		var VUnitType = '';
		var vClissification;
		if(itemresults!=null && itemresults!='')
		{
			isactiveflag = 'T';
			/*if(itemresults[0].getValue('preferredbin')=="T")
			{
				getPreferBin = itemresults[0].getValue('binnumber');
			}*/
			for(var d=0;d<itemresults.length;d++)
			{
				if(itemresults[d].getValue('preferredbin')=="T" && itemresults[d].getValue('location','binnumber')==whLocation)
				{
					getPreferBin = itemresults[d].getValue('binnumber');
				}
			}
			getWOItem = itemresults[0].getValue('name');
			
			blnMixItem = itemresults[0].getValue('custitem_wmsse_mix_item');
			blnMixLot = itemresults[0].getValue('custitem_wmsse_mix_lot');
			strItemGrp = itemresults[0].getValue('custitem_wmsse_itemgroup');
			strItemFam = itemresults[0].getValue('custitem_wmsse_itemfamily');
			VUnitType = itemresults[0].getValue('unitstype');
			vClissification=itemresults[0].getValue('locationinvtclassification');

			itemType = itemresults[0].recordType;
			if(departments == true)
			Vdepartment = itemresults[0].getValue('department');
			if(classes == true)
			Vclass = itemresults[0].getValue('class');
		}


		if(VUnitType != null && VUnitType != '')
		{
			var vBaseUOMSearch=getBaseUnitRate(VUnitType);

			vBaseUnit='Base unit';
			if(vBaseUOMSearch != null && vBaseUOMSearch != '')
			{
				vConversionRate=vBaseUOMSearch[0].getValue('conversionrate');
				vBaseUnit=vBaseUOMSearch[0].getValue('unitname');
			}				
			if(vUnits !=null && vUnits!='' && vUnits !='null' && vUnits !='undefined' && vUnits !='- None -')
			{
				getStockConversionRate =getStockCoversionRate(VUnitType,vUnits,vConversionRate);
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
					
				}

				var imgfilefound2 =  getLoadFile('minus.png');
				if(imgfilefound2)
				{
					delbtnimgUrl = imgfilefound2.getURL();
					
				}

			}
		}
		if(getStockConversionRate == null || getStockConversionRate =='' || getStockConversionRate =='null' || getStockConversionRate =='undefined')
			getStockConversionRate = 1;
		var vUnitsText="";
		if(parseFloat(getStockConversionRate) != 1 && vBaseUnit != "")
			vUnitsText = 'In '+ vBaseUnit;
		if(parseFloat(getStockConversionRate) == 1)
			vBaseUnit="";

		if(getWOItem == null || getWOItem =='' || getWOItem == 'null' || getWOItem == 'undefined')
		{
			getWOItem = '';
		}

		if(itemType == null || itemType =='' || itemType == 'null' || itemType == 'undefined')
		{
			itemType = getitemType;
		}

		if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
		{
			btnText='Next (Ent)';
		}

		var makeInvAvailFlagFromSelect = request.getParameter('custparam_makeinventoryavailflag');
		
		if(inventoryStatusLst != null && inventoryStatusLst != "")
		{
			if(makeInvAvailFlagFromSelect == null || makeInvAvailFlagFromSelect == "")
				makeInvAvailFlagFromSelect = inventoryStatusLst[0][1];
		
		}
		nlapiLogExecution('ERROR','vClissification',vClissification);

		var vBinDetails=fnGetPutBinAndIntDetails(getItemInternalId,strItemGrp,strItemFam,blnMixItem,blnMixLot,getPreferBin,whLocation,itemType,lotno,
				Vdepartment,Vclass,vUnits,makeInvAvailFlagFromSelect,null,null,vClissification);
		
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

		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_picking_qty');
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

		if(JSSurl != null && JSSurl != '')
		{
			html = html + "<script type='text/javascript' src='"+JSSurl+"'></script>";
		}	


		html = html +"<script type = 'text/javascript' >function validate(){ return validateForm(\""+getStockConversionRate+"\",\""+getItemRemQty+"\",'hdnselecteduomswithqty','hdnItemType','txtbin','hdnPreferBin','hdntotaluomqtyentered') }</script>";
		html = html +"<script type = 'text/javascript' >function validatebin(bin){ return DisplayBin(bin,\""+getStockConversionRate+"\",\""+getItemRemQty+"\",'hdnselecteduomswithqty','hdntotaluomqtyentered','hdnItemType','txtbin','_rf_picking_qty') }</script>";

		html = html +functionkeyHtml;		
		//html = html + "</head><body onload='setFocus();'>";
		html = html +" <script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html + "</head><body onkeydown='return OnKeyDown_CL()'>";

		html = html +"	<form name='_rf_picking_qty' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<input name='cmdSend1' type='submit' class='defaultlink' value='' onclick='return validate();'/>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"		<tr><td class='tableheading'>Assembly Build - Qty</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table>"+
		"		<table>"+
		//"			<tr border='1'><td align='center'  valign='top'><b>RECEIVING</b></td></tr>"+
		//	"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Work Order# <label>" + getWONo + "</label>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnItemRemQty' id='hdnItemRemQty' value=" + (parseFloat(getItemRemQty).toFixed(8)) + ">"+	
		"				<input type='hidden' name='hdnItemRecQty' value=" + getItemRecQty + ">"+	
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWoInternalId' value=" + getWOInternalId + ">"+
		"				<input type='hidden' name='hdnWoLineno' value=" + getWOLineNo + ">"+
		"				<input type='hidden' name='hdnItemInternalId' value=" + getItemInternalId + ">"+
		"				<input type='hidden' name='hdnWoItem' value='" + getWOItem + "'>"+
		"				<input type='hidden' name='hdnPreferBin' id='hdnPreferBin' value=" + getPreferBin + ">"+
		"				<input type='hidden' name='hdnlotno' value='" + lotno + "'>"+
		"				<input type='hidden' id='hdnisactiveflag' name='hdnisactiveflag' value=" + isactiveflag + ">"+
		"				<input type='hidden' name='hdnlotexpirydate' value='" + lotExpiryDate + "'>"+
		"				<input type='hidden' name='hdnblnMixItem' value=" + blnMixItem + ">"+
		"				<input type='hidden' name='hdnblnMixLot' value=" + blnMixLot + ">"+	
		"				<input type='hidden' name='hdnitemqty' value=" + getItemQty + ">"+	
		"				<input type='hidden' name='hdnWONo' value=" + getWONo + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnItemType' id='hdnItemType' value=" + itemType + ">"+
		"				<input type='hidden' name='hdngetStockConversionRate' id='hdngetStockConversionRate' value=" + getStockConversionRate + ">"+
		"				<input type='hidden' name='hdnselecteduomswithqty' id='hdnselecteduomswithqty' >"+	
		"				<input type='hidden' name='hdntotaluomqtyentered' id='hdntotaluomqtyentered' >"+
		"				<input type='hidden' name='hdnVUnitType' id='hdnVUnitType' value=" + VUnitType + ">"+
		"				<input type='hidden' name='hdnactualBeginTime' value='" + actualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnordunits' value='" + vUnits + "'>"+	
		"				<input type='hidden' name='hdnfromstatuschange' id='hdnfromstatuschange' >"+
		"				</td>"+
		"			</tr>"+	
		"			<tr><td align='left' class='labelmsg'>Assembly Item: <label>" + getWOItem + "</label></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Quantity: <label>" + parseFloat(parseFloat(getItemQty).toFixed(8)) + "</label>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Built Qty: <label>" + parseFloat(parseFloat(getItemRecQty).toFixed(8)) + "</label>"+
		"			</tr>"+

		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Buildable Qty: <label>" + parseFloat(parseFloat(getItemRemQty).toFixed(8)) + "</label>"+
		"			</tr>";

		if(results !=null &&  results !='' && results.length>0)
		{

			var selectedUomStr = request.getParameter('custparam_uomqtyselected');
			nlapiLogExecution('ERROR', 'selectedUomStr', selectedUomStr);
			html=html+"<tr> <td class='labelmsg'>Enter Qty</td></tr>";
			if(selectedUomStr == null || selectedUomStr == '' || selectedUomStr == 'null' || selectedUomStr == 'undefined')
			{
				nlapiLogExecution('ERROR', 'inside', selectedUomStr);
				html = html +"			<tr><td><table id='tblUOM'  ><tr><td align = 'left'><input name='txtqty0'  class='smalltextbox'  id='txtqty0' type='text'/></td><td></td>";
				for(var Cnt=0; Cnt < results.length; Cnt++)
				{

					var UOMText =results[Cnt].getValue('unitname');
					var vQty = results[Cnt].getValue('conversionrate');
					if(Cnt==0)
					{
						html = html +"<td><select id='uomlist"+Cnt+"' class='labelmsg'  name = 'uomlist"+Cnt+"' onchange='return onUomChange(this,\""+uomresults+"\");'>  ";


					}
					if(vUnits !=null && vUnits !='' && vUnits!='null' && vUnits !='undefined' && vUnits !='- None -' && vUnits == UOMText)
					{
						html = html +" <option value="+vQty+" selected >"+UOMText +" </option>";
					}
					else
					{
						html = html +" <option value="+vQty+"  >"+UOMText +" </option>";
					}
				}

				html = html +"</select></td><td></td><td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+getItemRemQty+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr></table>";	
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
						html= html+"<td><input type='image' id='imgplus0' src='"+addbtnimgUrl+"' style='background-color:  #fff;border-radius: 5px;width: 75pxword-wrap: normal;' onclick='return validateaddUom(\""+getItemRemQty+"\",\""+getStockConversionRate+"\",\""+uomresults+"\",\""+delbtnimgUrl+"\",\""+addbtnimgUrl+"\");' alt='Add Uom'></td></tr>";
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
				nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');
				html = html +"				<td align = 'left' class='labelmsg'>Enter Qty " ;
			}
			html = html +"				</td>"+	 
			/*"				<td align = 'left' class='labelmsg'>Enter Qty "+ vUnitsText +
		"				</td>"+*/
			"			</tr>"+
			"			<tr>"+
			"				<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>"+
			"				</td>"+
			"			</tr>";

		}
		// Binding Item status dropdown
		if(inventoryStatusLst != null && inventoryStatusLst != '' && inventoryStatusLst != 'null' &&
				inventoryStatusLst != 'undefined' && inventoryStatusLst.length > 0) 
		{			
			html = html +"			<tr>";
			html = html +"	<td align = 'left' class='labelmsg'>Inv Status ";

			html=html+"</td></tr>";
			html = html +"			<tr><td>";
			html = html +"<select id='inventorystatuslist' class='labelmsg'  name = 'inventorystatuslist'  onchange='invtStatus_OnChange()'>" ;
			for(var statusItr=0; statusItr < inventoryStatusLst.length; statusItr++)
			{                    	 
				var vInventoryStatus = inventoryStatusLst[statusItr][0];
				var vStatusId =inventoryStatusLst[statusItr][1];

				if(makeInvAvailFlag == vStatusId)
				{
					html = html +" <option   selected  value="+vStatusId+"> "+vInventoryStatus+"</option>";

				}
				else
				{
					html = html +" <option     value="+vStatusId+"> "+vInventoryStatus+"</option>";
				}

				//html = html +" <option     value="+vStatusId+"> "+vInventoryStatus+"</option>";	


			}

			html=html+"</select></td></tr>"+
			"<input type='hidden' id='hdnvId' name='hdnvId' value=" + vStatusId + ">";


		}

		/*"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter Qty"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtqty'  class='smalltextbox'  id='txtqty' type='text'/>"+
		"				</td>"+
		"			</tr>"+*/
		html = html +"<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Bin"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='txtbin'  class='smalltextbox'  id='txtbin' type='text'/>"+
		"				</td>"+
		"			</tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='"+btnText+"' onclick='return validate();'/>"+
		"				</td>"+
		"			</tr>"+
		"		 </table>";
		
		if((vBinDetails!=null && vBinDetails!='') || (getPreferBin != null && getPreferBin != '' && getPreferBin != 'null') || (makeInvAvailFlagFromSelect 
				!= 'All' && makeInvAvailFlagFromSelect !=null && makeInvAvailFlagFromSelect != 'null' && makeInvAvailFlagFromSelect != '' && 
				makeInvAvailFlagFromSelect != 'undefined' && makeInvAvailFlagFromSelect != undefined))
		{

			html = html + 	" <table  style='border-spacing: 0;'>";
			html = html +	"			<tr class='uir-machine-headerrow' >"+
			"				<td>Bin Location"+	
			"				</td>"+
			"				<td class='align-right'>Qty"+	
			"				</td>"+
			"			</tr>";
			var vAltClass='uir-list-row-tr line uir-list-row-even';
			if(getPreferBin != null && getPreferBin != '' && getPreferBin != 'null')
			{
				var preferBinId = nswms_GetValidBinInternalIdWO(getPreferBin,whLocation,null);
				var preferqtyDetails = getBinwiseQtyDetails(preferBinId,whLocation);
				var vqty=preferqtyDetails[0];
				if(vqty == '' || vqty == null || vqty == 'undefined')
					vqty=0;
				html = html + "	<tr class='" + vAltClass + "'>"+
				//" <td>"+getPreferBin+"<span style='color:red;'>* </span></td>"+ 
				" <td><a  onclick='return validatebin(\""+getPreferBin+"\");' href='#' >"+getPreferBin+"</a><span style='color:red;'>* </span></td>"+

				"				<td align = 'right' >"+parseFloat(parseFloat(vqty).toFixed(8))+""+	
				"				</td>"+
				"</tr>";
			}	

			for (var st = 0; st < vBinDetails.length; st++) {
				if(st%2==1)
					vAltClass='uir-list-row-tr line uir-list-row-even';
				else
					vAltClass='uir-list-row-tr line uir-list-row-odd';
				var currValues = vBinDetails[st];
				//var txtBin = vBinDetails[st];
				var txtBin = currValues[0];
				var txtBinInternalId = currValues[1];
				var qtyDetails = getBinwiseQtyDetails(txtBinInternalId,whLocation);
				//var qty = qtyDetails[st];
				var qty = qtyDetails[0];
				if(qty == '' || qty == null || qty == 'undefined')
					qty=0;
				if(enterBin!=txtBin && getPreferBin != txtBin)
				{	

					html = html +	"			<tr class='" + vAltClass + "'>"+
					//"				<td align = 'left' >"+txtBin+""+	
					//"				</td>"+
					"				<td><a  onclick='return validatebin(\""+txtBin+"\");');' href='#' >"+txtBin+""+
					
					"				</a></td>"+
					"				<td class='align-right'>"+parseFloat(parseFloat(qty).toFixed(8))+""+	
					"				</td>"+
					"			</tr>";
				}
				if(parseInt(st) >= 4)
					break;
			}
			html = html +" </td>"+
			"</tr>"+
			"</table>";

		}
		html = html + "</form>";
		if(results ==null ||  results =='' || results == 'null')
		{
			nlapiLogExecution('ERROR', 'results ==null');
			html = html +"<script type='text/javascript'>document.getElementById('txtqty').focus();</script>";
		}
		else
		{
			html = html +"<script type='text/javascript'>setFocus();</script>";
		}
		html = html +"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('ERROR', 'Processing RF', 'Validating QTY/BIN');

		// Forming the temporary array WOarray
		var WOarray = new Array();
		var tempflag='F';
		var enterQty=request.getParameter('txtqty');
		
		if(enterQty == null || enterQty == '' || enterQty == 'null' || enterQty == 'undefined')
		{
			enterQty = request.getParameter('hdntotaluomqtyentered');
			WOarray["custparam_uomqtyselected"] = request.getParameter('hdnselecteduomswithqty');
			
			if(enterQty != null && enterQty != '' && enterQty != 'null' && enterQty != 'undefined')
			{
				enterQty = parseFloat(enterQty).toFixed(8);

			}
		}
		nlapiLogExecution('Debug', 'enterQty',enterQty);

		var tempflag='F';
		//var enterQty=request.getParameter('txtqty');
		var enterBin=request.getParameter('txtbin');
		WOarray["custparam_woid"] = request.getParameter('hdnWONo');
		WOarray["custparam_stockconversionrate"] = request.getParameter('hdngetStockConversionRate');
		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_company"] = request.getParameter('hdnWhCompany');
		WOarray["custparam_option"] = request.getParameter('hdnOptedField');
		WOarray["custparam_trantype"] = request.getParameter('hdntrantype');
		WOarray["custparam_wointernalid"] = request.getParameter('hdnWoInternalId');
		WOarray["custparam_lineno"] = request.getParameter('hdnWoLineno');
		WOarray["custparam_fetcheditemid"] = request.getParameter('hdnItemInternalId');
		WOarray["custparam_rem_qty"] = parseFloat(request.getParameter('hdnItemRemQty'));
		WOarray["custparam_rec_qty"] = request.getParameter('hdnItemRecQty');
		WOarray["custparam_woitem"] = request.getParameter('hdnWoItem');
		WOarray["custparam_preferbin"] = request.getParameter('hdnPreferBin');
		WOarray["custparam_woitemqty"] = request.getParameter('hdnitemqty');
		WOarray["custparam_actualbegintime"] = request.getParameter('hdnactualBeginTime');
		WOarray["custparam_fetched_units"] = request.getParameter('hdnordunits');		
		var actualBeginTime = request.getParameter('hdnactualBeginTime');
		
		WOarray["custparam_lotno"] =request.getParameter('hdnlotno');
		//Case# 201415931  start
		WOarray["custparam_lotexpirydate"] = request.getParameter('hdnlotexpirydate');
		//Case# 201415931  end
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		//WOarray["custparam_blnmixitem"] = request.getParameter('hdnblnMixItem');
		//WOarray["custparam_blnmixlot"] = request.getParameter('hdnblnMixLot');
		var trantype=request.getParameter('hdntrantype');
		var remQty=request.getParameter('hdnItemRemQty');
		var woInternalid=request.getParameter('hdnWoInternalId');
		var recQty=request.getParameter('hdnItemRecQty');
		var FetchedItemId=request.getParameter('hdnItemInternalId');
		
		var woLineno=request.getParameter('hdnWoLineno');
		var preferBin=request.getParameter('hdnPreferBin');
		var optedEvent = request.getParameter('cmdPrevious');	// To trap the previous button
		var lotno= request.getParameter('hdnlotno');
		var lotExpiryDate= request.getParameter('hdnlotexpirydate');
		var itemType = request.getParameter('hdnitemtype');

		var blnMixItem=request.getParameter('hdnblnMixItem');
		var blnMixLot=request.getParameter('hdnblnMixLot');
		var whLocation =request.getParameter('hdnWhLocation');

		var statusId = request.getParameter('inventorystatuslist');
	
		WOarray["custparam_statusId"] = statusId;
		nlapiLogExecution('Debug', 'WOarray["custparam_statusId"]', WOarray["custparam_statusId"]);
    // Check Inventorystatus feature is enabled or not
		var inventoryStatusFeature = isInvStatusFeatureEnabled();

	
		var logMsg = 'WO = ' + WOarray["custparam_woid"] + '<br>';
		logMsg = logMsg + 'enterQty = ' + enterQty + '<br>';
		logMsg = logMsg + 'enterBin = ' + enterBin + '<br>';
		logMsg = logMsg + 'trantype = ' + trantype + '<br>';
		logMsg = logMsg + 'remQty = ' + remQty + '<br>';
		logMsg = logMsg + 'woInternalid = ' + woInternalid + '<br>';
		logMsg = logMsg + 'recQty = ' + recQty + '<br>';
		logMsg = logMsg + 'FetchedItemId = ' + FetchedItemId + '<br>';
		logMsg = logMsg + 'woLineno = ' + woLineno + '<br>';
		logMsg = logMsg + 'preferBin = ' + preferBin + '<br>';
		logMsg = logMsg + 'lotno = ' + lotno + '<br>';
		logMsg = logMsg + 'lotExpiryDate = ' + lotExpiryDate + '<br>';
		logMsg = logMsg + 'blnMixItem = ' + blnMixItem + '<br>';
		logMsg = logMsg + 'blnMixLot = ' + blnMixLot + '<br>';
		logMsg = logMsg + 'whlocation = ' + whLocation + '<br>';
		logMsg = logMsg + 'optedEvent = ' + optedEvent + '<br>';
		nlapiLogExecution('Debug', 'Processing RF - QTY', logMsg);
		var mainQty = request.getParameter('hdnitemqty');
		var vbinInternalId='';
		
		if(WOarray["custparam_stockconversionrate"] != null && WOarray["custparam_stockconversionrate"] != 'null' && WOarray["custparam_stockconversionrate"] != '')
		{
			if(enterQty == null || enterQty =='' || enterQty=='null')
			{
				enterQty=0;
			}
			enterQty= Number(Big(enterQty).div(WOarray["custparam_stockconversionrate"]));
			
		}

		if (sessionobj!=context.getUser()) 
		{
			try
			{


				if(sessionobj==null || sessionobj=='')
				{
					sessionobj=context.getUser();
					context.setSessionObject('session', sessionobj); 
				}
				var itemType = '';
				if(FetchedItemId !=null && FetchedItemId !='' && FetchedItemId !='null')
				{
					var itemfilters=new Array();
					itemfilters.push(new nlobjSearchFilter('internalid',null,'anyof',FetchedItemId));
					itemfilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));				
					if(whLocation != null && whLocation !='' && whLocation != null)
					{
						itemfilters.push(new nlobjSearchFilter('location',null,'anyof',['@NONE@',whLocation]));
					}					
					var itemcolumns= new Array();
					var itemresults= nlapiSearchRecord('item','customsearch_wmsse_assembly_lotscan_item', itemfilters, itemcolumns);							
					nlapiLogExecution('DEBUG', 'itemresults', itemresults);					
					if(itemresults == null || itemresults == '' || itemresults == 'null')
					{
						WOarray["custparam_error"] = 'Assembly/member items are inactive';
						response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
						return;
					}
					else
					{
						itemType = itemresults[0].recordType;
					}
				}
				// Processing only if the 'Previous' button is not pressed
				if(optedEvent != 'Back (F7)'){
					
					
//Code to navigate to the same screnn when status is changed.
					
					var makeInventoryAvailFlag  = request.getParameter('inventorystatuslist');
					var isFromStatusChange = request.getParameter('hdnfromstatuschange');
					if(isFromStatusChange != null && isFromStatusChange != '' && isFromStatusChange != 'null' && isFromStatusChange != 'undefined' && 
							isFromStatusChange != undefined && isFromStatusChange=='T' )
					{

						WOarray["custparam_makeinventoryavailflag"] = makeInventoryAvailFlag;
						nlapiLogExecution('DEBUG', 'POarray["custparam_makeinventoryavailflag"]', WOarray["custparam_makeinventoryavailflag"]);
						WOarray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
						return;

					}
					
					
					if(enterQty!=null && enterQty!="" && enterQty!='null' && !isNaN(enterQty) && parseFloat(remQty) >= parseFloat(enterQty))
					{
						try{							

							var opentaskResults=validateenteredQty(woInternalid);
							if(opentaskResults != null && opentaskResults !='')
							{

								var memitemqty = new Array();
								memitemqty =fngetMemItemQty(woInternalid,enterQty,mainQty);
								for(var m = 0; m < memitemqty.length; m++){
									var memitem = memitemqty[m][0];
									var vTempMemQty = memitemqty[m][2];
									var memline = memitemqty[m][3];
									var memqty = vTempMemQty;

									var isValid=false;
									for(var p=0;p<opentaskResults.length;p++)
									{
										var memsku= opentaskResults[p].getValue('custrecord_wmsse_sku',null,'group');
										var memlineno= opentaskResults[p].getValue('custrecord_wmsse_line_no',null,'group');
										var memactqty= opentaskResults[p].getValue('custrecord_wmsse_act_qty',null,'sum');
										var memactconverserate= opentaskResults[p].getValue('custrecord_wmsse_conversionrate',null,'group');
										if(memactconverserate == null || memactconverserate == '' || memactconverserate == '- None -')
											memactconverserate = 1;
										if(memactqty == null || memactqty == '' || memactqty == 'null')
											memactqty = 0;
										nlapiLogExecution('Debug', 'memactconverserate,memactqty,memqty', memactconverserate+","+memactqty+","+memqty);
										if(memitem==memsku && memline==memlineno && Number(Big(memactqty).mul(memactconverserate))>=Number(memqty))
										{

											isValid=true;
											continue;
										}
									}
									if(isValid==false){
										WOarray["custparam_error"] = 'Please pick all the member items';
										response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
										return;
									}
								}

							}

						//	nlapiLogExecution('ERROR','Remaining usage2',context.getRemainingUsage());

							//var itemType = nswms_GetItemType(FetchedItemId, WOarray["custparam_whlocation"]);
							
							WOarray["custparam_itemtype"] = itemType;
							WOarray["custparam_enterQty"] = parseFloat(enterQty).toFixed(8);
							//Case# 201415931  start
							if(enterBin ==null || enterBin =='' || enterBin =='null'  || enterBin =='undefined')
							{
								enterBin = preferBin;
							}
							//Case# 201415931  end
							if(enterBin!=null && enterBin!="")
							{

								//Case# 201415884 start
								vbinInternalId=nswms_GetValidBinInternalIdWO(enterBin,whLocation,null);
								
								if(vbinInternalId=='' || vbinInternalId==null || vbinInternalId=='null' || vbinInternalId=='undefined')
								{
									var filter=new Array(); 
									filter.push(new nlobjSearchFilter('binnumber',null,'is',enterBin)); 
									filter.push(new nlobjSearchFilter('location',null,'anyof',whLocation));
									var  columns = new Array();
									/*columns.push(new nlobjSearchColumn('location'));
									columns.push(new nlobjSearchColumn('inactive'))*/
									var searchrecord=nlapiSearchRecord('Bin','customsearch_wmsse_woqty_bin_srh',filter,columns);
									if(searchrecord != null && searchrecord != '' && searchrecord.length >0)
									{
										var vLoc = searchrecord[0].getValue('location');
										var isactive = searchrecord[0].getValue('inactive');
										
										if(isactive == 'T')
										{
											WOarray["custparam_error"] = 'Entered/scanned bin is inactive';
										}
										else if(vLoc != whLocation)
										{
											WOarray["custparam_error"] = 'Entered/scanned bin is not associated with processing warehouse '+request.getParameter('hdnWhLocationName');
										}
										else
										{
											WOarray["custparam_error"] = 'Please enter/scan valid bin location';
										}
									}
									else
									{
										WOarray["custparam_error"] = 'Please enter/scan valid bin location';
									}

									//Case# 201415884 end

									response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
									return;
								}

							}
							//Case# 201415931 start
							if(enterBin != preferBin)
							{
								if(blnMixItem!="T")
								{

									var filterStrat = new Array();

									if(FetchedItemId != null && FetchedItemId != '')
										filterStrat.push(new nlobjSearchFilter('internalid',null, 'noneof', FetchedItemId));
									if(whLocation != null && whLocation != '')
										filterStrat.push(new nlobjSearchFilter('location','binonhand', 'anyof', whLocation));
									if(vbinInternalId!= null && vbinInternalId!= '')
										filterStrat.push(new nlobjSearchFilter('binnumber','binonhand', 'anyof', vbinInternalId));

									//var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_inventory',filterStrat, null);
									var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_invt_inbound',filterStrat, null);
									if(objInvDetails!=null && objInvDetails!='' && objInvDetails.length != null)
									{
										if(objInvDetails.length>0)
										{
											nlapiLogExecution('Debug', 'Inside if objInvDetails', objInvDetails.length);
											WOarray["custparam_error"] = 'This item has mix items in bins flag false choose different bin.';
											objBinDetails1=null;
											response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
											return;
										}
									}
								}

								if(blnMixLot != 'T' && (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem"))
								{
									nlapiLogExecution('Debug', 'Inside mixed lot', blnMixLot);

									var filterStrat = new Array();

									if(whLocation != null && whLocation != '')
										filterStrat.push(new nlobjSearchFilter('location','inventoryNumberBinOnHand', 'anyof', whLocation));
									if(vbinInternalId!= null && vbinInternalId!= '')
										filterStrat.push(new nlobjSearchFilter('binnumber','inventoryNumberBinOnHand', 'anyof', vbinInternalId));
									if(blnMixLot != 'T' && lotno!=null && lotno!='' && lotno!='null' && lotno!='undefined')
										filterStrat.push(new nlobjSearchFilter('inventorynumber','inventoryNumberBinOnHand','isnot', lotno));
									filterStrat.push(new nlobjSearchFilter('islotitem',null,'is', 'T'));
									var objInvDetails = new nlapiSearchRecord('item','customsearch_wmsse_itemwise_lots',filterStrat, null);

									if(objInvDetails!=null && objInvDetails!='' && objInvDetails.length != null)
									{
										if(objInvDetails.length>0)
										{
											nlapiLogExecution('Debug', 'Inside if objInvDetails', objInvDetails.length);
											WOarray["custparam_error"] = 'This item has mix lots in bins flag false choose different bin.';
											objBinDetails1=null;
											response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
											return;
										}
									}
								}
							}
							//Case# 201415931 end

							WOarray["custparam_enterBin"] = enterBin;

							if(itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
							{
								
								WOarray["custparam_error"]='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_wserial_scan', 'customdeploy_wmsse_assembly_wserial_scan', false, WOarray);
								return;
							}
							else if(itemType == "inventoryitem" || itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem" || itemType=="assemblyitem")
							{
								
								//Case# 201415884 start
								//var binInternalId=nswms_GetBinInternalId(WOarray["custparam_enterBin"],whLocation);								
								//Case# 201415884 end
								
								//Case# 201415931  start
								if(inventoryStatusFeature == true)
								{
									
									var splitopentaskResults = buildAssembly(woInternalid,vbinInternalId,trantype,FetchedItemId,woLineno,
											whLocation,itemType,lotno,parseFloat(enterQty).toFixed(8),parseFloat(mainQty).toFixed(8),lotExpiryDate,'','',statusId,inventoryStatusFeature);
								}
								else
								{
									var splitopentaskResults = buildAssembly(woInternalid,vbinInternalId,trantype,FetchedItemId,woLineno,
											whLocation,itemType,lotno,parseFloat(enterQty).toFixed(8),parseFloat(mainQty).toFixed(8),lotExpiryDate);
								}
								//Case# 201415931  end
								nlapiLogExecution('Debug', 'assemblyBuild posted successfully', splitopentaskResults);
								var schresults="";
								if(splitopentaskResults!=null && splitopentaskResults!='' && splitopentaskResults!=undefined){
									//START
									
									
									for(var s1=0;s1<splitopentaskResults.length;s1++)
									{
										
										var currRowfields =  splitopentaskResults[s1];
										var vassemblyBuildQty = currRowfields[0];
										var vopenTaskLine = currRowfields[1];
										var vopenTaskItem = currRowfields[2];
										var vopenTaskLot = currRowfields[3];
										var vopenTaskSerial = currRowfields[4];
										
										if(schresults==""||schresults==null)
											schresults=currRowfields+"$";
										else
											schresults=schresults+currRowfields+"$";

//										if(schresults==""||schresults==null)
//											schresults=vassemblyBuildQty+"&"+vopenTaskLine+"&"+vopenTaskItem+"&"+vopenTaskLot+"&"+vopenTaskSerial+"$";
//										else
//											schresults=schresults+vassemblyBuildQty+"&"+vopenTaskLine+"&"+vopenTaskItem+"&"+vopenTaskLot+"&"+vopenTaskSerial+"$";
										
									}
									
									
									var currentUserID = getCurrentUser();
									var createopentaskrec =  nlapiCreateRecord('customrecord_wmsse_trn_opentask');		    	
									createopentaskrec.setFieldValue('custrecord_wmsse_expe_qty', parseFloat(enterQty).toFixed(8));
									createopentaskrec.setFieldValue('custrecord_wmsse_act_qty', parseFloat(enterQty).toFixed(8));
									createopentaskrec.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
									createopentaskrec.setFieldValue('custrecord_wmsse_wms_status_flag', 3);//putaway completed
									createopentaskrec.setFieldValue('custrecord_wmsse_tasktype', 5); //For KTS
									createopentaskrec.setFieldValue('custrecord_wmsse_nsconfirm_ref_no',splitopentaskResults[0]);
									createopentaskrec.setFieldValue('custrecord_wmsse_actbeginloc', vbinInternalId);
									createopentaskrec.setFieldValue('custrecord_wmsse_actendloc', vbinInternalId);
									createopentaskrec.setFieldValue('custrecord_wmsse_batch_num', lotno);
									createopentaskrec.setFieldValue('custrecord_wmsse_act_begin_date', DateStamp());
									createopentaskrec.setFieldValue('custrecord_wmsse_act_end_date', DateStamp());
									
									if(actualBeginTime!=null && actualBeginTime!='' && actualBeginTime!='null' && actualBeginTime!='undefined')
										createopentaskrec.setFieldValue('custrecord_wmsse_actualbegintime', actualBeginTime);
									createopentaskrec.setFieldValue('custrecord_wmsse_actualendtime', TimeStamp());
									var lotDetails='';
									var lotInternalId = '';
									if(lotno!=null && lotno!='' && lotno != 'null' && lotno != 'undefined')
									{
										lotDetails = getLotInternalId(lotno);
										if(lotDetails != null && lotDetails != '')
											lotInternalId = lotDetails[0].getValue('internalid');
										
									}

									if(lotInternalId!=null && lotInternalId!='' && lotInternalId != 'null' && lotInternalId != 'undefined')
									{
										//var fields = ['inventorynumber','expirationdate'];
										//var vLotDetails= nlapiLookupField('inventorynumber',lotInternalId,fields);
										var vexpDate = lotDetails[0].getValue('expirationdate');
										
										if(vexpDate!=null && vexpDate!='' && vexpDate != 'null')
											createopentaskrec.setFieldValue('custrecord_wmsse_expirydate', vexpDate);
									}
									createopentaskrec.setFieldValue('custrecord_wmsse_order_no', woInternalid);
									createopentaskrec.setFieldValue('custrecord_wmsse_wms_location', whLocation);
									createopentaskrec.setFieldValue('custrecord_wmsse_parent_sku_no', FetchedItemId);
									createopentaskrec.setFieldValue('custrecord_wmsse_sku', FetchedItemId);
									if(statusId != null && statusId != 'null' && statusId != '' && statusId !=undefined)
										createopentaskrec.setFieldValue('custrecord_wmsse_inventorystatus', statusId);							
									
									
									nlapiSubmitRecord(createopentaskrec, false, true);

									for(var z=1;z<splitopentaskResults.length;z++)
									{
										var currRow =  splitopentaskResults[z];
										var assemblyBuildQty = currRow[0];
										//var assemblyBuildOpenTaskId = currRow[1];
										var openTaskLine = currRow[1];
										var openTaskItem = currRow[2];
										var openTaskLot = currRow[3];
										var openTaskSerial = currRow[4];
										var openTaskStatus = currRow[5];
										

										if(context.getRemainingUsage()<= 100)
										{
											try{

												var param = new Array();

												param['custscript_wms_woid'] = woInternalid;
												param['custscript_wms_wotype'] = trantype;
												param['custscript_wms_woresults'] = schresults;
												var schstatus = nlapiScheduleScript('customscript_wmsse_woassemblybuild_sch',null,param);
												isScheduleScriptinvoked = 'T';
												nlapiLogExecution('DEBUG', 'Scheduled Script Status',schstatus);
												var currentUserID = getCurrentUser();
												updateScheduleScriptStatus('Assebly build SCH',currentUserID,'Submitted',woInternalid,trantype);
												break;
											}
											catch(e){
												nlapiLogExecution('DEBUG', 'exception',e);
											}
										}
										else
										{										

											if(inventoryStatusFeature ==true)
											{
												var getOpenTaskDetails = getOpenTaskLineDetails(woInternalid,openTaskLine,openTaskItem,'',openTaskSerial,inventoryStatusFeature); 
												if(getOpenTaskDetails!=null && getOpenTaskDetails !='' && getOpenTaskDetails.length>0)
												{

													for(var OpenItr=0;OpenItr<getOpenTaskDetails.length && parseFloat(assemblyBuildQty) > 0;OpenItr++)
													{

														var assemblyBuildOpenTaskId = getOpenTaskDetails[OpenItr].getId();
														
														var transaction = nlapiLoadRecord('customrecord_wmsse_trn_opentask', assemblyBuildOpenTaskId);
														var opentaskactQty = transaction.getFieldValue('custrecord_wmsse_act_qty');
														var opentaskactSerail = transaction.getFieldValue('custrecord_wmsse_serial_no');
														var vOTstatus = transaction.getFieldValue('custrecord_wmsse_inventorystatus');
														var vOTbatchnum = transaction.getFieldValue('custrecord_wmsse_batch_num');

														if(openTaskStatus !=null && openTaskStatus !='' && openTaskStatus !='null' && openTaskStatus !=undefined && openTaskStatus !='undefined' &&
																openTaskStatus.length>0 && vOTstatus !=null && vOTstatus !='' && vOTstatus !='null' && vOTstatus !='undefined' && vOTstatus !=undefined )
														{

															var logMsg = 'openTaskStatus = ' + openTaskStatus + '<br>';
															logMsg = logMsg + 'vOTstatus = ' + vOTstatus + '<br>';
															logMsg = logMsg + 'openTaskStatus.indexOf(vOTstatus) = ' + openTaskStatus.indexOf(vOTstatus) + '<br>';
															logMsg = logMsg + 'openTaskStatus.length = ' + openTaskStatus.length + '<br>';
															logMsg = logMsg + 'opentaskactQty = ' +opentaskactQty + '<br>';
															logMsg = logMsg + 'assemblyBuildQty = ' +assemblyBuildQty + '<br>';
															logMsg = logMsg + 'vOTbatchnum = ' +vOTbatchnum + '<br>';
															logMsg = logMsg + 'openTaskLot = ' +openTaskLot + '<br>';

															nlapiLogExecution('DEBUG', 'logMsg', logMsg);

															if(((openTaskStatus.indexOf(vOTstatus) != -1) && (openTaskLot =='' || openTaskLot ==null || openTaskLot =='null')) ||
															((openTaskStatus.indexOf(vOTstatus) != -1) && (openTaskLot!='' && openTaskLot !=null && openTaskLot.indexOf(vOTbatchnum) != -1)))
															{

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

											}
											else
											{
												var getOpenTaskDetails = getOpenTaskLineDetails(woInternalid,openTaskLine,openTaskItem,openTaskLot,openTaskSerial,inventoryStatusFeature); 
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
															nlapiLogExecution('Debug', 'remainQty', remainQty);
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
														assemblyBuildQty = Number(Big(assemblyBuildQty).minus(opentaskactQty));
													}
												}
											}
											//}
										}




								}





								}

								WOarray["custparam_error"]='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan', 'customdeploy_wmsse_assembly_woscan', false, WOarray);
								return;
							}
						}
						catch(e)
						{
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

							response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
							return;
						}
					}
					else
					{
						WOarray["custparam_error"] = 'Please enter valid qty';
						response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
						return;
					}
				} 
				else {
					var FetchedItemId=request.getParameter('hdnItemInternalId');
					//var itemType = nswms_GetItemType(FetchedItemId, WOarray["custparam_whlocation"]);
					if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
					{
						WOarray["custparam_error"]='';
						nlapiLogExecution('ERROR', 'into lotnumberedinventoryitem', itemType);
						response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_lotscan', 'customdeploy_wmsse_assembly_lotscan', false, WOarray);
						return;
					}
					else
					{
						WOarray["custparam_error"]='';
						response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woscan','customdeploy_wmsse_assembly_woscan', false, WOarray);
						return;
					}
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
				response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_assembly_woqtyscan', 'customdeploy_wmsse_assembly_woqtyscan', false, WOarray);
		}
	} //end of first if condition
} //end of function.

function buildAssembly(assemblyrecid,Bin,trantype,FetchedItemId,woLineno,whLocation,ItemType,batchno,vqty,vmainItemOrdQty,
		lotExpiryDate,memberItemsArray,context,statusId,inventoryStatusFeature)
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
	logMsg = logMsg + 'inventoryStatusFeature = ' + inventoryStatusFeature + '<br>';
	//Case# 201415931  start
	logMsg = logMsg + 'lotExpiryDate = ' + lotExpiryDate + '<br>';
	//Case# 201415931  end
	nlapiLogExecution('ERROR', 'Processing nswms_assemblyBuild', logMsg);

	var idl="";
	var serialIds = new Array();
	var opentaskArray = new Array();
	var trecord = nlapiTransformRecord(fromRecord, assemblyrecid, toRecord);

	trecord.setFieldValue('quantity', vqty);
	trecord.setFieldValue('location', whLocation);
	trecord.setFieldValue('item', FetchedItemId);
	//trecord.setFieldValue('binnumber', Bin);		
	if (ItemType == "lotnumberedinventoryitem" || ItemType=="lotnumberedassemblyitem")
	{
		var compSubRecord1 = trecord.createSubrecord('inventorydetail');
		compSubRecord1.selectNewLineItem('inventoryassignment');		
		compSubRecord1.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
		compSubRecord1.setCurrentLineItemValue('inventoryassignment', 'quantity', vqty);
		compSubRecord1.setCurrentLineItemValue('inventoryassignment', 'binnumber', Bin);
		if(statusId != null && statusId != 'null' && statusId != '')
		compSubRecord1.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', statusId);
		//Case# 201415931  start
		
		if(lotExpiryDate!=null && lotExpiryDate!="" && lotExpiryDate!='null' && lotExpiryDate != 'undefined')
		{
			compSubRecord1.setCurrentLineItemValue('inventoryassignment', 'expirationdate', lotExpiryDate);
		}
		//Case# 201415931  end
		compSubRecord1.commitLineItem('inventoryassignment');
		compSubRecord1.commit();
	}
	else if (ItemType == "serializedinventoryitem" || ItemType=="serializedassemblyitem") {

		var filterssertemp1 = new Array();

		//filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
		//filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', soLineno);
		filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', assemblyrecid);
		var columnssertemp1 = new Array();
		//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
		//columnssertemp1[1] = new nlobjSearchColumn('name');
		var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry','customsearch_wmsse_wo_serialentry_srh', filterssertemp1,columnssertemp1);
		if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
		{
			//trecord.setCurrentLineItemValue('item', 'binnumber', enterBin);
			//var compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
			var compSubRecord = trecord.createSubrecord('inventorydetail');
			for (var n = 0; n < Math.min(SrchRecordTmpSerial1.length,Qty); n++) {
				compSubRecord.selectNewLineItem('inventoryassignment');
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
				if(statusId != null && statusId != 'null' && statusId != '')
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus',statusId);
				compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', SrchRecordTmpSerial1[n].getValue('custrecord_wmsse_ser_no'));
				if(Bin!=null && Bin!="" && Bin!='null')
					compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', Bin);
				compSubRecord.commitLineItem('inventoryassignment');

			}
			compSubRecord.commit();
		}
	}
	else if(ItemType == "inventoryitem" || ItemType == "assemblyitem")
	{
		
		var compSubRecord1 = trecord.createSubrecord('inventorydetail');
		compSubRecord1.selectNewLineItem('inventoryassignment');
		compSubRecord1.setCurrentLineItemValue('inventoryassignment', 'quantity', vqty);
		compSubRecord1.setCurrentLineItemValue('inventoryassignment', 'binnumber', Bin);
		if(statusId != null && statusId != 'null' && statusId != '')
		compSubRecord1.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', statusId);
		compSubRecord1.commitLineItem('inventoryassignment');
		compSubRecord1.commit();
	}
//	nlapiLogExecution('ERROR','Remaining usage after main item in buildAssembly',context.getRemainingUsage());

	var CompItemCount=0;
	if(trecord !=null && trecord!='')
	{
		CompItemCount=trecord.getLineItemCount('component');
	}
	nlapiLogExecution('Debug', 'CompItemCount',CompItemCount);
	var opentaskmemberitemdetailsResults = new Array();
	var maxno = -1;
	//var memberItemsArray= new Array();
	if(CompItemCount > 0)
	{
		
		opentaskmemberitemdetailsResults=getopentaskDetails(assemblyrecid,maxno,opentaskmemberitemdetailsResults);
		memberItemsArray=getMemItemQty(assemblyrecid,vmainItemOrdQty);
	}
	var enteredLineArr = new Array();
	for(var c=1;c<=CompItemCount;c++)
	{

		trecord.selectLineItem('component', c);
		var tLine = trecord.getLineItemValue('component','orderline', c);
		var tItem = trecord.getLineItemValue('component','item', c);


		nlapiLogExecution('Debug', 'tLine',tLine);
		nlapiLogExecution('Debug', 'tItem',tItem);

		//var itemType = nswms_GetItemType(tItem, whLocation);
		//nlapiLogExecution('ERROR', 'itemType', itemType);
		var compSubRecord ='';
		var enteredQty=0;

		for(var c1=0;c1<opentaskmemberitemdetailsResults.length;c1++)
		{
			
			var Qty=0;
			var diffQty = 0;
			var opentaskResult = opentaskmemberitemdetailsResults[c1];
			var openTaskSku = opentaskResult.getValue('custrecord_wmsse_sku',null,'group');
			var openTaskLine = opentaskResult.getValue('custrecord_wmsse_line_no',null,'group');
			var isLot = opentaskResult.getValue('islotitem','custrecord_wmsse_sku','group');
			var isSerial = opentaskResult.getValue('isserialitem','custrecord_wmsse_sku','group');
			var itemType = opentaskResult.getValue('type','custrecord_wmsse_sku','group');
			
			
			if (isLot == '' || isLot=='null' || isLot == undefined || isLot == null)
			{
				isLot = 'F';
			}
			
			if (isSerial == '' || isSerial=='null' || isSerial == undefined || isSerial == null)
			{
				isSerial = 'F';
			}
		
			if(openTaskSku == tItem && tLine == openTaskLine && enteredLineArr.indexOf(tLine) == -1)
			{
				var vSerialNumArray=new Array();
				var vLotNumArray=new Array();
				var vInvStatusArray=new Array();
				var componentItemOpentaskQty = opentaskResult.getValue('custrecord_wmsse_act_qty',null,'sum');

				for(var m=0;m<opentaskmemberitemdetailsResults.length;m++)
				{
					if(m==0)
					{
						componentItemOpentaskQty =0;
					}
					var componentopenTaskSku = opentaskmemberitemdetailsResults[m].getValue('custrecord_wmsse_sku',null,'group');
					var componentopenTaskLine = opentaskmemberitemdetailsResults[m].getValue('custrecord_wmsse_line_no',null,'group');
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
						var memItemLine = memItemDetails[2];
						if(memItem == tItem && memItemLine == tLine)
						{
							memItemqty = Big(memItemqty);				
							enteredQty = memItemqty.mul(vqty);
														
						}
					}
				}
				if(parseFloat(enteredQty)<=parseFloat(componentItemOpentaskQty))
				{
					Qty = enteredQty;
					diffQty = enteredQty;
				}
				else
				{
					Qty = componentItemOpentaskQty;
					diffQty = componentItemOpentaskQty;
				}
				
				var enterBin = opentaskResult.getValue('custrecord_wmsse_actendloc',null,'group');
				var batchno = opentaskResult.getValue('custrecord_wmsse_batch_num',null,'group');
				var lineno=opentaskResult.getValue('custrecord_wmsse_line_no',null,'group');
				var vConversionRate=opentaskResult.getValue('custrecord_wmsse_conversionrate',null,'group');
				
				if(vConversionRate == null || vConversionRate =='' || vConversionRate =='- None -')
					vConversionRate = 1;
				Qty = Big(Qty);				
				Qty = Qty.mul(vConversionRate);
				
				nlapiLogExecution('Debug', 'enterBin',enterBin);
				nlapiLogExecution('Debug', 'enteredQty',enteredQty);
				trecord.setCurrentLineItemValue('component','quantity', parseFloat(enteredQty).toFixed(8));
				
				if (isLot == 'T') {
					
				
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
							var vConversionRate=opentaskResult.getValue('custrecord_wmsse_conversionrate',null,'group');
							if(vConversionRate == null || vConversionRate =='' || vConversionRate =='- None -')
								vConversionRate = 1;
							
							openTaskLotQty = Big(openTaskLotQty);						
							var vQty = openTaskLotQty.mul(vConversionRate);

							if(parseFloat(TotQtytoBuild)<=parseFloat(openTaskLotQty))
							{
								openTaskLotQty=TotQtytoBuild;
							}
							else if(parseFloat(openTaskLotQty)<parseFloat(TotQtytoBuild))
							{
								openTaskLotQty=vQty;
							}
							

							//openTaskLotQty = parseFloat(openTaskLotQty)*parseFloat(vConversionRate);
							nlapiLogExecution('Debug', 'openTaskLotQty',openTaskLotQty);
							nlapiLogExecution('Debug', 'TotQtytoBuild',TotQtytoBuild);
							var openTaskLot = opentaskResult.getValue('custrecord_wmsse_batch_num',null,'group');
							var openTaskBin = opentaskResult.getValue('custrecord_wmsse_actendloc',null,'group');
							var openTaskStatusId="";
							if(inventoryStatusFeature == true)
								openTaskStatusId = opentaskResult.getValue('custrecord_wmsse_inventorystatus',null,'group');
							
							compSubRecord = trecord.editCurrentLineItemSubrecord('component','componentinventorydetail');

							if(compSubRecord=='' || compSubRecord==null)
							{
								compSubRecord = trecord.createCurrentLineItemSubrecord('component','componentinventorydetail');
							}
							compSubRecord.selectNewLineItem('inventoryassignment');

							trecord.setCurrentLineItemValue('component', 'quantity', parseFloat(TotQtytoBuild).toFixed(8));
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', parseFloat(openTaskLotQty).toFixed(8));
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', openTaskLot);
							if(openTaskStatusId != '' && openTaskStatusId != 'null' && openTaskStatusId != null)
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', openTaskStatusId);
							if(openTaskBin!=null && openTaskBin!="" && openTaskBin!='null')
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', openTaskBin);
							compSubRecord.commitLineItem('inventoryassignment');
							//compSubRecord.commit();
							if(vLotNumArray.indexOf(openTaskLot)==-1)
								vLotNumArray.push(openTaskLot);
							//	Qty = parseFloat(Qty)-parseFloat(openTaskLotQty);							
							if(openTaskStatusId != '' && openTaskStatusId != 'null' && openTaskStatusId != null && 
									openTaskStatusId !=undefined && openTaskStatusId !='undefined')
							{
								if(vInvStatusArray.indexOf(openTaskStatusId)==-1)
									vInvStatusArray.push(openTaskStatusId);
							}
							

							TotQtytoBuild = Number(Big(TotQtytoBuild).minus(openTaskLotQty));
							//diffQty = parseFloat(Qty)-parseFloat(openTaskLotQty);

						}
						if(TotQtytoBuild <= 0)
						{
							nlapiLogExecution('ERROR', 'into break',TotQtytoBuild);
							break;
						}
					}
				}
				else if ((itemType == "InvtPart" || itemType == "Assembly") && isLot == 'F' && isSerial == 'F' ) 
				{
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
							var openTaskStatusId="";
							if(inventoryStatusFeature == true)
							 openTaskStatusId = opentaskResult.getValue('custrecord_wmsse_inventorystatus',null,'group');
							
							if(vConversionRate == null || vConversionRate =='' || vConversionRate =='- None -')
								vConversionRate = 1;
							
							
							openTaskQty = Big(openTaskQty);
							var vOTQty = openTaskQty.mul(vConversionRate);
							if(parseFloat(vTotQtytoBuild)<=parseFloat(openTaskQty))
							{
								openTaskQty=vTotQtytoBuild;
							}
							else if(parseFloat(openTaskQty)<parseFloat(vTotQtytoBuild))
							{
								openTaskQty=vOTQty;
							}
							

							//trecord.setCurrentLineItemValue('component', 'fulfillmentbin', enterBin);	
							compSubRecord = trecord.editCurrentLineItemSubrecord('component','componentinventorydetail');
							var cnt=0;
							if(compSubRecord=='' || compSubRecord==null)
							{
								compSubRecord = trecord.createCurrentLineItemSubrecord('component','componentinventorydetail');
								cnt =compSubRecord.getLineItemCount('inventoryassignment');
							}
							
							//This condition is to override prefered Bin
							if(cnt == 1)
							{
								compSubRecord.selectLineItem('inventoryassignment',1);
							}
							else
							{
								compSubRecord.selectNewLineItem('inventoryassignment');
							}
							nlapiLogExecution('Debug', 'Qty @',openTaskQty);
							nlapiLogExecution('Debug', 'openTaskQty',openTaskQty);
							trecord.setCurrentLineItemValue('component', 'quantity', parseFloat(vTotQtytoBuild).toFixed(8));
							
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', parseFloat(openTaskQty).toFixed(8));
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', openTaskBin);
							if(openTaskStatusId != '' && openTaskStatusId != 'null' && openTaskStatusId != null)
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', openTaskStatusId);
							compSubRecord.commitLineItem('inventoryassignment');
							
							vTotQtytoBuild = Number(Big(vTotQtytoBuild).minus(openTaskQty));
							
							if(openTaskStatusId != '' && openTaskStatusId != 'null' && openTaskStatusId != null && 
									openTaskStatusId !=undefined && openTaskStatusId !='undefined')
							{
								if(vInvStatusArray.indexOf(openTaskStatusId)==-1)
									vInvStatusArray.push(openTaskStatusId);
							}
							
						}
						
						if(vTotQtytoBuild <= 0)
						{
							nlapiLogExecution('ERROR', ' Invt into break',vTotQtytoBuild);
							break;
						}

					}
				}
				else if (isSerial == 'T') {
					
					
					var filterssertemp1 = new Array();
					//commented because of when we are doing picking for item we are doing bin transfer for that item and closing the serial status in serial entry.

					filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineno);
					filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', assemblyrecid);
					filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', tItem);
					filterssertemp1[3] = new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', enterBin);
					//filterssertemp1[4] = new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@']);
					//filterssertemp1[5] = new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',  null,'anyof',['8']);
					var columnssertemp1 = new Array();
					/*columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_sku');
					columnssertemp1[1] = new nlobjSearchColumn('custrecord_wmsse_serial_no');
					columnssertemp1[2] = new nlobjSearchColumn('custrecord_wmsse_line_no');
					columnssertemp1[3] = new nlobjSearchColumn('custrecord_wmsse_act_qty');
					columnssertemp1[0].setSort();*/
					var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_assembly_qtyscan_ot', filterssertemp1,columnssertemp1);
					if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
					{
						var serialArray='';
						for (var k = 0; k < SrchRecordTmpSerial1.length; k++) {
							var openTaskStatusId="";
							if(inventoryStatusFeature == true)
							 openTaskStatusId = opentaskResult.getValue('custrecord_wmsse_inventorystatus',null,'group');
							
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
						compSubRecord = trecord.editCurrentLineItemSubrecord('component','componentinventorydetail');

						if(compSubRecord=='' || compSubRecord==null)
						{
							compSubRecord = trecord.createCurrentLineItemSubrecord('component','componentinventorydetail');
						}

						var finalSerialArray = new Array();
						if(parseFloat(Qty)<totalSerialArray.length)
						{
							for(var k=0;k<Qty;k++)
							{
								finalSerialArray[k]=totalSerialArray[k];
							}
						}
						else{
							for(var k=0;k<totalSerialArray.length;k++)
							{
								finalSerialArray[k]=totalSerialArray[k];
							}
						}
						for (var n = 0; n < finalSerialArray.length; n++) {
							compSubRecord.selectNewLineItem('inventoryassignment');
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
							compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', finalSerialArray[n]);
							if(enterBin!=null && enterBin!="" && enterBin!='null')
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
							if(openTaskStatusId != '' && openTaskStatusId != 'null' && openTaskStatusId != null)
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', openTaskStatusId);
							compSubRecord.commitLineItem('inventoryassignment');
							
							if(openTaskStatusId != '' && openTaskStatusId != 'null' && openTaskStatusId != null && 
									openTaskStatusId !=undefined && openTaskStatusId !='undefined')
							{
								if(vInvStatusArray.indexOf(openTaskStatusId)==-1)
									vInvStatusArray.push(openTaskStatusId);
							}
							/*var vSerialEntryId=SrchRecordTmpSerial1[n].getId();
							serialIds.push(vSerialEntryId);*/
							vSerialNumArray.push(finalSerialArray[n]);
						}
						//compSubRecord.commit();
					}
				}
			
				var opentaskdet = [Qty,openTaskLine,openTaskSku,vLotNumArray,vSerialNumArray,vInvStatusArray];
				opentaskArray.push(opentaskdet);
				
			}
		}
		nlapiLogExecution('Debug', 'compSubRecord',compSubRecord);
		if(compSubRecord != null && compSubRecord != '')
		{
			compSubRecord.commit();
		}
		trecord.commitLineItem('component');
		//nlapiLogExecution('ERROR','Remaining usage after each component item in buildAssembly',context.getRemainingUsage());
	}
	//}
	if(trecord != null && trecord != '')
		idl = nlapiSubmitRecord(trecord);	

	//nlapiLogExecution('ERROR','Remaining usage after component items in buildAssembly',context.getRemainingUsage());

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

function getopentaskDetails(woInternalId,maxno,opentaskResultsArray)
{
	

	var result = nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_wo_assemblyqty_ot');

	if(woInternalId != null && woInternalId != '' && woInternalId != '-None-')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', woInternalId));

	/*if(maxno != -1)
	{
		result.addFilter(new nlobjSearchFilter('internalidnumber', null,'greaterthan', parseInt(maxno)));
	}*/

	var resLen = result.runSearch();
	var sum ;
	var q=0;
	//returns upto 4000 results in one execution
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		q++;
		opentaskResultsArray.push(searchResult);

		if(q==4000)
		{
			//var maxno = searchResult.getValue('internalid',null,'group');
			//getopentaskDetails(woInternalId,maxno,opentaskResultsArray);
			return false; 			 // return false to come out of loop
		}
		return true;                // return true to keep iterating
			});
	return opentaskResultsArray; 
}

function validateenteredQty(woInternalid)
{
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalid));


	var opentaskColumns =  new Array();

	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_assembly_woscan_ot',opentaskFilters,opentaskColumns);


	return opentaskResults;

}
function splitOpentask(woInternalid)
{
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalid));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null,'anyof', ['@NONE@']));
	opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

	var opentaskColumns =  new Array();
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_sku'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_line_no'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty'));
	//opentaskColumns[1].setSort();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,opentaskFilters,opentaskColumns);


	return opentaskResults;

}
function fngetMemItemQty(woid,vReqQty,vMainQty){

	nlapiLogExecution('Debug','vReqQty',vReqQty);
	nlapiLogExecution('Debug','vMainQty',vMainQty);

	var filters = new Array(); 

	filters.push(new nlobjSearchFilter('internalid', null, 'is', woid));//kit_id is the parameter name 
	//filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
	//filters.push(new nlobjSearchFilter('quantitycommitted', null, 'greaterthan', 0));
	//filters.push(new nlobjSearchFilter('type', 'item', 'anyof', ['Assembly','InvtPart']));
//	nlapiLogExecution('DEBUG', 'vitem', vitem); 
	var columns1 = new Array(); 
	columns1[0] = new nlobjSearchColumn( 'item' ); 
	columns1[1] = new nlobjSearchColumn( 'quantity' );
	columns1[2] = new nlobjSearchColumn( 'line' );

	var searchresults = nlapiSearchRecord( 'workorder','customsearch_wmsse_assembly_qtyscan_wo', filters, columns1 );  
	var kititemsarr = new Array();
	for(var q=0; searchresults!=null && q<searchresults.length;q++) 
	{
		var vSubArr=new Array();
		vSubArr.push(searchresults[q].getValue('item'));
		var vMemQty=searchresults[q].getValue('quantity');
		
		if(vMemQty == null || vMemQty == '')
			vMemQty=0;
		vMemQty = Big(vMemQty);
		
		var vActQty = vMemQty.div(vMainQty); 
		
		vActQty = vActQty.mul(vReqQty);
		
		
		//var vActQty=(parseFloat(vMemQty)/parseFloat(vMainQty)) * parseFloat(vReqQty);
		vSubArr.push(searchresults[q].getValue('quantity'));
		vSubArr.push(vActQty);
		vSubArr.push(searchresults[q].getValue('line'));
		kititemsarr.push(vSubArr);
	}

	return kititemsarr;

}
function getMemItemQty(vWoID,mainItemOrdQty){


	nlapiLogExecution('Debug','vWoID',vWoID);

	var filters = new Array(); 

	filters[0] = new nlobjSearchFilter('internalid', null, 'is', vWoID);
	//filters[1] = new nlobjSearchFilter('isinactive', null, 'is', 'F');//kit_id is the parameter name 
	filters[1] = new nlobjSearchFilter('mainline', null, 'is', 'F');
	
	var columns1 = new Array(); 
	columns1[0] = new nlobjSearchColumn('item'); 
	columns1[1] = new nlobjSearchColumn('quantity');
	columns1[2] = new nlobjSearchColumn('line');

	var searchresults = nlapiSearchRecord('workorder','customsearch_wmsse_assembly_qtyscan_wo', filters, columns1 );  
	var kititemsarr = new Array();
	for(var q=0; searchresults!=null && q<searchresults.length;q++) 
	{
		var vMemQty=searchresults[q].getValue('quantity');
		var vLine = searchresults[q].getValue('line');
		if(vMemQty == null || vMemQty == '')
			vMemQty=0;

		var vMemUOMQty=0;
		if(mainItemOrdQty != null && mainItemOrdQty != '' && mainItemOrdQty != 0)
			{
			vMemQty = Big(vMemQty);		
			 vMemUOMQty = vMemQty.div(mainItemOrdQty); 
			}
			
		var currRow= [searchresults[q].getValue('item'),vMemUOMQty,vLine];
		kititemsarr.push(currRow);
	}
	
	return kititemsarr;



}


function getOpenTaskLineDetails(woInternalid,otLine,otSku,otLot,otSerial,inventoryStatusFeature)
{
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalid));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null,'anyof', ['@NONE@']));
	opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
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
	 if(inventoryStatusFeature == true)
		 opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_inventorystatus'));
	
	opentaskColumns[1].setSort();
	opentaskColumns[2].setSort(true);
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_assembly_qtyscan_ot',opentaskFilters,opentaskColumns);


	return opentaskResults;

}

function getLotInternalId(batchno,FetchedItemId)
{	
	var filterStrat = new Array();
	filterStrat.push(new nlobjSearchFilter('inventorynumber',null, 'is', batchno));

	var columns = new Array();
	//columns.push(new nlobjSearchColumn('internalid'));
	//columns.push(new nlobjSearchColumn('expirationdate')); 

	var lotDetails = nlapiSearchRecord('inventorynumber','customsearch_wmsse_assembly_lotscan_srh',filterStrat, columns);
	
	return lotDetails;
}


function WOAssemblybuildSchedular(type)
{
	nlapiLogExecution('Debug', 'Scheduler version', type);
	var context = nlapiGetContext(); 
	var currentUserID = getCurrentUser();

	var woInternalid;
	var trantype;
	var splitResults;

	woInternalid = context.getSetting('SCRIPT', 'custscript_wms_woid');
	trantype = context.getSetting('SCRIPT', 'custscript_wms_wotype');
	splitResults = context.getSetting('SCRIPT', 'custscript_wms_woresults');
	
	updateScheduleScriptStatus('Assebly build SCH',currentUserID,'In Progress',woInternalid,trantype);
	try{
		if(splitResults !=null && splitResults!='')
		{
			var splitopentaskResults=splitResults.split("$");
			for(var y=1;y<splitopentaskResults.length;y++)
			{	
				var currRowresult=splitopentaskResults[y];	
				var currRow=currRowresult.split(",");
				
				var assemblyBuildQty = currRow[0];
				//var assemblyBuildOpenTaskId = currRow[1];
				var openTaskLine = currRow[1];
				var openTaskItem = currRow[2];
				var openTaskLot = currRow[3];
				var openTaskSerial = currRow[4];
				



				var getOpenTaskDetails = getOpenTaskLineDetails(woInternalid,openTaskLine,openTaskItem,openTaskLot,openTaskSerial); 
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
								nlapiLogExecution('ERROR', 'totalSerialArray',totalSerialArray);
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
							nlapiLogExecution('ERROR', 'vNewSerial', vNewSerial);
							var currentContext = nlapiGetContext();  
							var currentUserID = currentContext.getUser();
							var remainQty = Big(opentaskactQty).minus(assemblyBuildQty);
							nlapiLogExecution('ERROR', 'remainQty', remainQty);
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
						assemblyBuildQty = Number(Big(assemblyBuildQty).minus(opentaskactQty));
					}
				}
			}
			updateScheduleScriptStatus('Assebly build SCH',currentUserID,'Completed',woInternalid,trantype);
		}
	}
	catch(exp)
	{

		nlapiLogExecution('ERROR','exception in WOSCH',exp);
	}

}



function nswms_GetValidBinInternalIdWO(Binnumber,whLocation,Item)
{
	var bininternalId='';
	var filter=new Array(); 
	if(Binnumber!=null && Binnumber!='' && Binnumber!='null' && Binnumber!='undefined')
		filter.push(new nlobjSearchFilter('binnumber',null,'is',Binnumber));
	filter.push(new nlobjSearchFilter('inactive',null, 'is','F'));
	if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
		filter.push(new nlobjSearchFilter('location',null,'anyof',whLocation));
	var columns= new Array();	
	var searchrecord=nlapiSearchRecord('Bin','customsearch_validate_bininternalid_wo',filter,columns);
	if(searchrecord!=null && searchrecord!="")
	{	
		var vStageDirection = '';
		var vLocationType=searchrecord[0].getText('custrecord_wmsse_bin_loc_type');
		nlapiLogExecution('Debug','vLocationType',vLocationType);
		if(vLocationType == 'Stage')
			vStageDirection = searchrecord[0].getValue('custrecord_wmsse_bin_stg_direction');
		
		if(vLocationType != 'WIP' && vStageDirection != 2)//Stage direction should not be "OUT"
			bininternalId=searchrecord[0].getId();
	}
	nlapiLogExecution('Debug','bininternalId,Item,whLocation,Binnumber',bininternalId+","+Item+","+whLocation+","+Binnumber);
	
	filter=null;
	searchrecord=null;
	filtersku=null;
	searchitemrecord=null;

	return bininternalId;
}