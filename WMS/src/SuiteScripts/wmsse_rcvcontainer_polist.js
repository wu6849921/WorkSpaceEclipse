/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function fnpoList(request, response)
{

	if (request.getMethod() == 'GET') {
		var getLanguage = request.getParameter('custparam_language');
		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);

		var conatinerNo = request.getParameter('custparam_containerNo'); 
		nlapiLogExecution('DEBUG', 'conatinerNo', conatinerNo);

		var conatinerid = request.getParameter('custparam_container'); 
		nlapiLogExecution('DEBUG', 'conatinerNo', conatinerid);

		var item1 =	 request.getParameter('custparam_poitem'); 
		nlapiLogExecution('DEBUG', 'item1', item1);

		var getPONo = request.getParameter('custparam_po');
		nlapiLogExecution('DEBUG', 'getPONo', getPONo);

		var itemType = request.getParameter('custparam_itemtype'); 
		nlapiLogExecution('DEBUG', 'itemType', itemType);

		var itemInternalId = request.getParameter('custparam_fetcheditemid'); 
		nlapiLogExecution('DEBUG', 'itemInternalId', itemInternalId);

		var poInternalId = request.getParameter('custparam_pointernalid');
		nlapiLogExecution('DEBUG', 'poInternalId', poInternalId);

		var internalId = request.getParameter('custparam_container'); 
		nlapiLogExecution('DEBUG', 'internalId', internalId);


		var whLocation = request.getParameter('custparam_whlocation'); 
		nlapiLogExecution('DEBUG', 'whLocation', whLocation);

		var getActualBeginTime = request.getParameter('custparam_actualbegintime');
		var customer = request.getParameter('custparam_customer');		
		var whLocationName = request.getParameter('custparam_whlocationname');
		var trantype = request.getParameter('custparam_trantype');
		/*nlapiLogExecution('ERROR', 'whLocation', whLocation);*/
		var whCompany = request.getParameter('custparam_company');
		var orderType = request.getParameter('custparam_ordertype');		

		var st0,st1,st2,st3,st4,st5,st6,st7,st8,st9,st10;
		var headerVar = "Container";
		var errMsg='';
		errMsg = request.getParameter('custparam_error');
		if( getLanguage == 'es_ES')
		{
			st0 = "";
			st1 = "INGRESAR SELECCI&#211;N";			
			st2 = "ENVIAR";
			st3 = "ANTERIOR";

		}
		else
		{
			st0="";
			st1 = "CONTAINER#";
			st2 = "Item#";
			st3 = "Purchase Order#";
			st4 ="EXP QTY";
			//st5 = "PO1";
			st6 = "PO2";
			st7 = "PO3";
			st8= "SEND";
			st9= "PREV";
			st10= "RCVD QTY";
			st11="REM QTY";
			st12="LP#";
			st13="LOT#";

		}

		var oredrQuantity='';
		var rcvQuantity='';
		var remainingQty ='';
		var count = '';		
		var lot='';
		var po='';
		var searchresults='';



		var filter1=new Array();
		if(internalId!=null&&internalId!='')
			filter1.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgcontainer',null,'anyof',internalId));		
		if(itemInternalId!=null && itemInternalId!='')
			filter1.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgitem',null,'anyof',itemInternalId));
		var columns1 = new Array();
		columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgcontainer'));
		columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgitem'));
		columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpono'));
		columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgexpqty'));
		columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgordqty'));
		columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgrcvdqty'));		
		columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkglot'));
		columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpolineno'));
		var searchresults1 = nlapiSearchRecord('customrecord_wmsse_trailerlinepkgs', null, filter1, columns1);

		//if(searchresults1.length ==null||searchresults1.length==''){
		//nlapiLogExecution('DEBUG', 'searchresults1.length', searchresults1.length);
		var filter=new Array();
		if(internalId!=null&&internalId!='')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber',null,'anyof',internalId));		
		if(itemInternalId!=null && itemInternalId!='')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_trllineitem',null,'anyof',itemInternalId));
		var columns = new Array();
		columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineitem'));
		columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepono'));
		columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineordqty'));
		columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineexpqty'));
		columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepolineno'));
		columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineqtyrcvd'));

		searchresults = nlapiSearchRecord('customrecord_wmsse_trailerline', null, filter, columns);
		//}	

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var st0 = domainName + '-'+headerVar+' Receiving';
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
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_checkin_item'); 		
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html  style='height:device-height;width:device-width;'><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";		
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "</head><body style='height:device-height;width:device-width;'>"+
		"	<script type='text/javascript'>function validateForm() {if(document.getElementById('enterpo').value == ''){document.getElementById('div_error').innerHTML ='Please enter/scan purchase order#'; document.getElementById('enterpo').focus();	return false;}else{document.getElementById('loading').style.display = ''; return true;}}</script>"+
		"	<script type='text/javascript'>function validatePo(val) {document.getElementById('enterpo').value =val;document.forms['_rf_checkin_item'].submit();	return  true;}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_checkin_item' method='POST'>"+ //onkeydown='return OnKeyDown_CL()' >";
		//"		<table class='outertable'>"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Receiving Item</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		</table><table>"+
		"			<tr><td align='center'></td></tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+headerVar+"#: <label>" + conatinerNo + "</label>"+
		"				<input type='hidden' name='hdnActualBeginTime' value='" + getActualBeginTime + "'>"+	
		"				<input type='hidden' name='hdnCustomer' value=" + customer + ">"+	
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnWhCompany' value=" + whCompany + ">"+	
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnordertype' value='" + orderType + "'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value= '" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnwhLocation' value=" + whLocation + ">"+
		"				<input type='hidden' name='hdnitemType' id = 'hdnitemType' value= '" + itemType + "'>"+
		"				<input type='hidden' name='hdngetPONo' id = 'hdngetPONo' value= '" + getPONo + "'>"+
		"				<input type='hidden' name='hdninternalid' id = 'hdninternalid' value= '" + itemInternalId + "'>"+
		"				</td>"+
		"			</tr>"+	
		/*"			<tr>"+
		"				<td align = 'left'>"+st3+":<label>"+getPONo+"</label>"+
		"				</td>"+
		"			</tr>"+*/
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>"+st2+":<label>"+item1+"</label>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Enter/Scan Purchase Order#"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterpo'  class='smalltextbox'  id='enterpo' type='text'/>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+		
		"			</table><table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr><tr><td></td></tr>"+
		"		 </table>"+
		/*var arrCodetails = getConatinerDetails(vcontainer,whLocation);
		nlapiLogExecution('ERROR', 'getConatinerDetails', arrCodetails);*/
		"	<table>"+
		" <tr>"+
		" <td>"+
		"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
		" <tr class='uir-machine-headerrow' >"+
		" <td class='listheadertdleft listheadertextb uir-column-large' >PO#"+
		" </td>"+
		" <td class='listheadertdleft listheadertextb uir-column-large' >Item"+
		" </td>"+
		" <td align='right'> Received Qty"+
		" </td>"+	
		" <td align='right'> Expected Qty"+
		" </td>";
		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
		{
			html = html +"<td align = right'>Lot#"+
			" </td>";
		}

		html = html +"</tr>";

		var itemArray=new Array();
		if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
		{
			if(searchresults1!= null && searchresults1 != '' && searchresults1.length>0)
			{
				nlapiLogExecution('DEBUG', 'searchresults1.length', searchresults1.length);
				for (var i = 0; i < Math.min(5, searchresults1.length); i++) 
				{
					var vAltClass='uir-list-row-tr line uir-list-row-even';

					var pointernalid = searchresults1[i].getValue('custrecord_wmsse_trllinepkgpono');
					var po = searchresults1[i].getText('custrecord_wmsse_trllinepkgpono');
					po = po.split('#');
					var ponum = po[1];

					if(itemArray.indexOf(ponum)==-1)
					{
						if(i%2==1)
							vAltClass='uir-list-row-tr line uir-list-row-even';
						else
							vAltClass='uir-list-row-tr line uir-list-row-odd';

						itemArray.push(ponum);

						//po = searchresults1[i].getText('custrecord_wmsse_trllinepkgpono');

						var item = searchresults1[i].getValue('custrecord_wmsse_trllinepkgitem');	
						var itemText = searchresults1[i].getText('custrecord_wmsse_trllinepkgitem');
						var expectedQty = searchresults1[i].getValue('custrecord_wmsse_trllinepkgexpqty');
						var oredrQuantity = searchresults1[i].getValue('custrecord_wmsse_trllinepkgordqty');
						lot = searchresults1[i].getText('custrecord_wmsse_trllinepkglot');
						var polineno = searchresults1[i].getValue('custrecord_wmsse_trllinepkgpolineno');
						//var receivedQty = parseFloat(oredrQuantity)- parseFloat(expectedQty);
						var receivedQty = searchresults1[i].getValue('custrecord_wmsse_trllinepkgrcvdqty');
						if(receivedQty == null || receivedQty == '' || receivedQty == 'null')
						{
							receivedQty =0;
						}

						var str = "PO :" +ponum+ ", polineno :" +polineno+ ", item :" +item+ ", expectedQty :"+expectedQty +", receivedQty :"+receivedQty;
						nlapiLogExecution('ERROR', 'str', str);

						var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_rcvcontlot', 'customdeploy_wmsse_rcvcontlot');

						var linkURL_1="#";

						if(parseFloat(expectedQty) > parseFloat(receivedQty))
						{
							linkURL_1 = checkInURL_1 + '&custparam_pointernalid='+ pointernalid + '&custparam_potext='+ ponum + '&custparam_oredrquantity='+ expectedQty + '&custparam_expectquantity=' + expectedQty + '&custparam_rec_qty='+ receivedQty + '&custparam_lot='+ lot + '&custparam_container='+ conatinerNo + '&custparam_poitem='+ itemText + '&custparam_containerId='+ internalId + '&custparam_fetcheditemid='+ itemInternalId + '&custparam_internalid=' + itemInternalId + '&custparam_whlocation='+ whLocation + '&custparam_lineno='+ polineno;
							//linkURL_1 = checkInURL_1 + '&custparam_lineno=' + vpoitemLine + '&custparam_fetcheditemid=' + vpoitemId + '&custparam_pointernalid=' + arrPodetails[s].getValue('internalid',null,'group') + '&custparam_rem_qty=' + vPoreminqty + '&custparam_rec_qty=' + totalReceivedQty + '&custparam_whlocation=' + vLineLocation  + '&custparam_whlocationname =' + whLocationName  + '&custparam_poid=' + getPONo  + '&custparam_trantype=' + trantype + '&custparam_company=' + whCompany+ '&custparam_itemtype=' + itemType+ '&custparam_ordertype=' + orderType+ '&custparam_usedbinsflag=' + usedBins +'&custparam_actualbegintime='+ getActualBeginTime +'&custparam_customer='+ customer+'&custparam_uom='+ vUnits+'&custparam_conversionrate='+ vConversionRate+'&custparam_hibcflag='+getHIBCBarcodeFlag +'&custparam_hibcitem='+HIBCItem +'&custparam_hibcexpirydate='+HIBCLotExpiryDate +'&custparam_hibclot='+HIBCLot;
							nlapiLogExecution('ERROR', 'linkURL_1', linkURL_1);
						}				
						html = html + "	<tr class='" + vAltClass + "'  >";

						if(linkURL_1 == '#')				
							html = html + "<td>"+ponum+"</td>";			
						else
							html = html + 	"<td><a name='link1URL_1' href='#' onClick='validatePo(\""+ponum+"\");' > "+ponum+" </a></td>";

						html = html + "<td> "+itemText+" </td>"+					

						"<td align='right'> "+receivedQty+" </td>"+
						"<td align='right'> "+expectedQty+" </td>" +
						"<td align='right'> "+lot+" </td></tr>";

					}
					else
					{

					}
				}
			}
		}

		else
		{
			if(searchresults!= null && searchresults != '' && searchresults.length>0)
			{
				var vAltClass='uir-list-row-tr line uir-list-row-even';
				for (var i = 0; i < Math.min(5, searchresults.length); i++) 
				{
					nlapiLogExecution('DEBUG', 'Trailer/Container LineÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ custom record');
					var invtarray= searchresults[i];
					if (invtarray != null)
					{
						if(i%2==1)
							vAltClass='uir-list-row-tr line uir-list-row-even';
						else
							vAltClass='uir-list-row-tr line uir-list-row-odd';

						var frompolistflag = 'T';
						var po = searchresults[i].getText('custrecord_wmsse_trllinepono');
						po = po.split('#');
						var ponum = po[1];
						var pointernalid = searchresults[i].getValue('custrecord_wmsse_trllinepono');
						var item=searchresults[i].getValue('custrecord_wmsse_trllineitem');	
						var itemText=searchresults[i].getText('custrecord_wmsse_trllineitem');
						var oredrQuantity = searchresults[i].getValue('custrecord_wmsse_trllineordqty');
						var expectedQty = searchresults[i].getValue('custrecord_wmsse_trllineexpqty');
						//var receivedQty = parseFloat(oredrQuantity)- parseFloat(expectedQty);
						var receivedQty = searchresults[i].getValue('custrecord_wmsse_trllineqtyrcvd');
						if(receivedQty == null || receivedQty == '' || receivedQty == 'null')
						{
							receivedQty =0;
						}
						var polineno = searchresults[i].getValue('custrecord_wmsse_trllinepolineno');

						if (rcvQuantity==null||rcvQuantity=='')						
							rcvQuantity=0; 
						var str = "PO :" +po+ ", item :" +item+ ", expectedQty :"+expectedQty +", receivedQty :"+receivedQty;
						nlapiLogExecution('ERROR', 'str', str);


						var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty');

						var linkURL_1="#";

						if(parseFloat(expectedQty) > parseFloat(receivedQty))
						{							
							linkURL_1 = checkInURL_1 + '&custparam_pointernalid='+ pointernalid + '&custparam_potext='+ ponum + '&custparam_oredrquantity='+ oredrQuantity + '&custparam_expectquantity=' + expectedQty + '&custparam_rec_qty=' + receivedQty + '&custparam_lot='+ lot + '&custparam_container='+ conatinerNo + '&custparam_poitem='+ itemText + '&custparam_containerId='+ internalId + '&custparam_fetcheditemid='+ itemInternalId + '&custparam_internalid=' + itemInternalId + '&custparam_whlocation='+ whLocation + '&custparam_lineno='+ polineno + '&custparam_frompolistflag='+ frompolistflag;
							//linkURL_1 = checkInURL_1 + '&custparam_lineno=' + vpoitemLine + '&custparam_fetcheditemid=' + vpoitemId + '&custparam_pointernalid=' + arrPodetails[s].getValue('internalid',null,'group') + '&custparam_rem_qty=' + vPoreminqty + '&custparam_rec_qty=' + totalReceivedQty + '&custparam_whlocation=' + vLineLocation  + '&custparam_whlocationname =' + whLocationName  + '&custparam_poid=' + getPONo  + '&custparam_trantype=' + trantype + '&custparam_company=' + whCompany+ '&custparam_itemtype=' + itemType+ '&custparam_ordertype=' + orderType+ '&custparam_usedbinsflag=' + usedBins +'&custparam_actualbegintime='+ getActualBeginTime +'&custparam_customer='+ customer+'&custparam_uom='+ vUnits+'&custparam_conversionrate='+ vConversionRate+'&custparam_hibcflag='+getHIBCBarcodeFlag +'&custparam_hibcitem='+HIBCItem +'&custparam_hibcexpirydate='+HIBCLotExpiryDate +'&custparam_hibclot='+HIBCLot;
							nlapiLogExecution('ERROR', 'linkURL_1', linkURL_1);
						}				
						html = html + "	<tr class='" + vAltClass + "'  >";

						if(linkURL_1 == '#')				
							html = html + "<td>"+ponum+"</td>";			
						else
							html = html + 	"<td><a name='link1URL_1' href='#' onClick='validatePo(\""+ponum+"\");' > "+ponum+" </a></td>";

						html = html + "<td> "+itemText+" </td>"+


						"<td align='right'> "+receivedQty+" </td>"+
						"<td align='right'> "+expectedQty+" </td></tr>";

					}
				}
			}
		}

		html = html + "</table></td></tr></table>	</form>"+

		"<script type='text/javascript'>document.getElementById('enterpo').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);

	}

	else 
	{
		var getPo = request.getParameter('enterpo');
		nlapiLogExecution('ERROR', 'getPo', getPo); 

		var optedEvent = request.getParameter('cmdPrevious');
		nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);

		var getItem = request.getParameter('custparam_poitem');
		nlapiLogExecution('ERROR', 'getItem', getItem); 

		var getItemId = request.getParameter('custparam_fetcheditemid');
		nlapiLogExecution('ERROR', 'getItemId', getItemId); 

		var getLot = request.getParameter('hdnlot');
		nlapiLogExecution('ERROR', 'getItem', getItem); 

		var conatinerNo = request.getParameter('custparam_containerNo'); 
		nlapiLogExecution('DEBUG', 'conatinerNo111', conatinerNo);

		var conatinerId = request.getParameter('custparam_container'); 
		nlapiLogExecution('DEBUG', 'conatinerId', conatinerId);

		var internalId = request.getParameter('custparam_container');
		nlapiLogExecution('DEBUG', 'internalId', internalId);

		var trantype=request.getParameter('custparam_trantype');
		nlapiLogExecution('DEBUG', 'trantype', trantype);

		var itemType=request.getParameter('hdnitemType');
		nlapiLogExecution('DEBUG', 'itemType', itemType);

		var orderType=request.getParameter('hdnordertype');


		if(trantype == null || trantype == '' || trantype == 'null')
			trantype='purchaseorder';

		var po = request.getParameter('hdnpo'); 
		nlapiLogExecution('DEBUG', 'po', po);

		var orderQuanity = request.getParameter('custparam_oredrquantity'); 
		nlapiLogExecution('DEBUG', 'orderQuanity', orderQuanity);

		var itemInternalId = request.getParameter('hdninternalid'); 
		nlapiLogExecution('DEBUG', 'itemInternalId', itemInternalId);


		var whLocation = request.getParameter('hdnwhLocation'); 
		nlapiLogExecution('DEBUG', 'whLocation',whLocation); 

		var qtyCheckFlag = 'F';

		var POarray = new Array();
		POarray["custparam_containerNo"]=conatinerNo;
		POarray["custparam_container"]=internalId;
		POarray["custparam_poitem"]=getItem;		
		POarray["custparam_potext"]=po;
		POarray["custparam_remainingQty"]=remainingQty;
		POarray["custparam_oredrquantity"]=orderQuanity;
		POarray["custparam_rec_qty"]=request.getParameter('hdnrcvQuantity'); 
		POarray["custparam_whlocation"]=whLocation;
		POarray["custparam_fetcheditemid"]=itemInternalId;
		POarray["custparam_ordertype"]=orderType;
		POarray["custparam_trantype"] = trantype;
		POarray["custparam_itemType"] = itemType;
		POarray["custparam_actualbegintime"] = request.getParameter('hdnActualBeginTime');

		if (optedEvent == 'Back (F7)') 
		{
			POarray["custparam_error"] = '';
			response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontsku', 'customdeploy_wmsse_rcvcontsku', false, POarray);
			return;
		}

		else{

			var oredrQuantity='';
			var rcvQuantity='';
			var remainingQty ='';
			var count = '';
			var lp='';
			var lot='';
			var po='';
			var itemInternalId='';
			var searchresults='';
			var frompolistflag = 'T';

			if(getPo==null||getPo=='')
			{				
				POarray["custparam_error"] = 'Pleas enter a po';
				nlapiLogExecution('DEBUG', 'Error:', 'PLEASE ENTER PO');
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontpolist', 'customdeploy_wmsse_rcvcontpolist', false, POarray);
				return;
			}

			var vType='PurchOrd';
			var ordMsg='Transaction';
			if(trantype=='purchaseorder')
			{
				vType='PurchOrd';
				ordMsg='purchase order';
			}
			else if(trantype=='transferorder')
			{
				vType='TrnfrOrd';
				ordMsg='transfer order';
			}

			var filters = new Array();
			var columns = new Array();

			filters.push(new nlobjSearchFilter('tranid', null, 'is', getPo));
			filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));

			nlapiLogExecution('DEBUG','trantype',trantype);
			nlapiLogExecution('DEBUG','whlocation',whLocation);
			if(trantype=='transferorder')
			{
				if(whLocation!=null && whLocation!="")
					filters.push(new nlobjSearchFilter('transferlocation', null, 'anyof', ['@NONE@', whLocation]));
			}
			else
			{
				if(whLocation!=null && whLocation!="")
					filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@', whLocation]));
			}

			var PORecinternalids = new nlapiSearchRecord('transaction', 'customsearch_wmsse_rcv_ordline_details', filters, columns);
			var poid='';
			if(PORecinternalids!=null && PORecinternalids!='' && PORecinternalids!='null' && PORecinternalids!='undefined' && PORecinternalids.length != null)
			{
				//poid=PORecinternalids[0].getValue('internalid');
				poid=PORecinternalids[0].getValue('internalid',null,'group');
				nlapiLogExecution('DEBUG', 'poid', poid);
			}
			else{

				POarray["custparam_error"] = 'Please enter valid Purchase Order#';
				nlapiLogExecution('DEBUG', 'Error:', 'INVALID PO');
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontpolist', 'customdeploy_wmsse_rcvcontpolist', false, POarray);
				return;
			}

			if(poid!=null&&poid!=''){
				if(itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem")
				{
					var filter1=new Array();
					filter1.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgpono',null,'anyof',poid));
					if(internalId!=null&&internalId!='')
						filter1.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgcontainer',null,'is',internalId));		
					if(getItemId!=null && getItemId!='')
						filter1.push(new nlobjSearchFilter('custrecord_wmsse_trllinepkgitem',null,'is',getItemId));

					var columns1 = new Array();
					columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgitem'));
					columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpono'));
					columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgexpqty'));
					columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgrcvdqty'));	
					columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgordqty'));
					columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkglot'));
					columns1.push(new nlobjSearchColumn('custrecord_wmsse_trllinepkgpolineno'));

					var searchresults1 = nlapiSearchRecord('customrecord_wmsse_trailerlinepkgs', null, filter1, columns1);

					nlapiLogExecution('DEBUG', 'searchresults1', searchresults1);
					if(searchresults1!= null&&searchresults1!=''){
						for (var i = 0; i < Math.min(5, searchresults1.length); i++) {						

							var pointernalid = searchresults1[i].getValue('custrecord_wmsse_trllinepkgpono');
							itemInternalId=searchresults1[i].getValue('custrecord_wmsse_trllinepkgitem');
							oredrQuantity = searchresults1[i].getValue('custrecord_wmsse_trllinepkgordqty');
							var expdQuantity = searchresults1[i].getValue('custrecord_wmsse_trllinepkgexpqty');
							rcvQuantity = searchresults1[i].getValue('custrecord_wmsse_trllinepkgrcvdqty');
							//rcvQuantity = parseFloat(oredrQuantity)- parseFloat(expdQuantity);
							lot = searchresults1[i].getText('custrecord_wmsse_trllinepkglot');
							var polineno = searchresults1[i].getValue('custrecord_wmsse_trllinepkgpolineno');

							nlapiLogExecution('DEBUG', 'oredrQuantity2', oredrQuantity);
							nlapiLogExecution('DEBUG', 'rcvQuantity2', rcvQuantity);

							if (rcvQuantity==null||rcvQuantity=='')
							{
								rcvQuantity=0; 
								remainingQty=oredrQuantity-rcvQuantity;
							}
							else
								remainingQty=oredrQuantity-rcvQuantity;
							nlapiLogExecution('DEBUG','remainingQty2324',remainingQty);

							if(parseFloat(remainingQty)>0)
							{
								qtyCheckFlag = 'T';
							}
						}

						POarray["custparam_potext"] = getPo;
						POarray["custparam_oredrquantity"] = oredrQuantity;
						POarray["custparam_rec_qty"] = rcvQuantity;
						POarray["custparam_expectquantity"] = expdQuantity;
						POarray["custparam_remainingQty"] = remainingQty;					
						POarray["custparam_lot"] = lot;
						POarray["custparam_containerId"] = internalId;
						POarray["custparam_poitem"] = getItem;
						POarray["custparam_internalid"] = itemInternalId;
						POarray["custparam_lineno"] = polineno;
						POarray["custparam_pointernalid"] = pointernalid;
						POarray["custparam_fetcheditemid"]=itemInternalId;

						if(qtyCheckFlag == "F")
						{
							POarray["custparam_error"] = 'RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';
							response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontpolist', 'customdeploy_wmsse_rcvcontpolist', false, POarray);
							return;
						}

						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontlot', 'customdeploy_wmsse_rcvcontlot', false, POarray);
						return;
					}

				}
				else if(itemType == "inventoryitem" || itemType == "assemblyitem" || itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem")
				{
					var filter=new Array();					
					filter.push(new nlobjSearchFilter('custrecord_wmsse_trllinepono',null,'anyof',poid));
					if(conatinerNo!=null&&conatinerNo!='')
						filter.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber',null,'anyof',internalId));		
					if(getItemId!=null && getItemId!='')
						filter.push(new nlobjSearchFilter('custrecord_wmsse_trllineitem',null,'anyof',getItemId));
					var columns = new Array();
					columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineitem'));
					columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepono'));
					columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineordqty'));
					columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineexpqty'));
					columns.push(new nlobjSearchColumn('custrecord_wmsse_trllineqtyrcvd'));
					columns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepolineno'));

					searchresults = nlapiSearchRecord('customrecord_wmsse_trailerline', null, filter, columns);			
					nlapiLogExecution('DEBUG', 'searchresults', searchresults);
					if(searchresults!= null && searchresults!='' && searchresults.length>0)
					{
						var polineno="";
						for (var i = 0; i < Math.min(5, searchresults.length); i++) 
						{						
							itemInternalId=searchresults[i].getValue('custrecord_wmsse_trllineitem');
							oredrQuantity = searchresults[i].getValue('custrecord_wmsse_trllineordqty');
							var expdQuantity = searchresults[i].getValue('custrecord_wmsse_trllineexpqty');
							rcvQuantity = searchresults[i].getValue('custrecord_wmsse_trllineqtyrcvd');
							//rcvQuantity = parseFloat(oredrQuantity)- parseFloat(expdQuantity);				
							polineno = searchresults[i].getValue('custrecord_wmsse_trllinepolineno');
							var pointernalid = searchresults[i].getValue('custrecord_wmsse_trllinepono');

							nlapiLogExecution('DEBUG', 'oredrQuantity2', oredrQuantity);
							nlapiLogExecution('DEBUG', 'rcvQuantity2', rcvQuantity);
							nlapiLogExecution('DEBUG', 'pointernalid', pointernalid);
							nlapiLogExecution('DEBUG', 'polineno', polineno);
							nlapiLogExecution('DEBUG', 'getId', searchresults[i].getId());
							if (rcvQuantity==null||rcvQuantity=='')
							{
								rcvQuantity=0; 
								remainingQty=oredrQuantity-rcvQuantity;
							}
							else
								remainingQty=oredrQuantity-rcvQuantity;
							nlapiLogExecution('DEBUG','remainingQty2324 : itemInternalId',remainingQty + ':' + itemInternalId);

							if(parseFloat(remainingQty)>0)
							{
								qtyCheckFlag = 'T';
							}

						}

						POarray["custparam_frompolistflag"] = frompolistflag;
						POarray["custparam_potext"] = getPo;
						POarray["custparam_oredrquantity"] = oredrQuantity;
						POarray["custparam_expectquantity"] = expdQuantity;
						POarray["custparam_rec_qty"] = rcvQuantity;
						POarray["custparam_remainingQty"] = remainingQty;					
						POarray["custparam_containerId"] = internalId;
						POarray["custparam_poitem"] = getItem;
						POarray["custparam_internalid"] = itemInternalId;
						POarray["custparam_lineno"] = polineno;
						POarray["custparam_pointernalid"] = pointernalid;
						POarray["custparam_fetcheditemid"]=itemInternalId;
						nlapiLogExecution('DEBUG', 'custparam_lineno', POarray["custparam_lineno"]);
						nlapiLogExecution('DEBUG', 'frompolistflag', frompolistflag);

						if(qtyCheckFlag == "F")
						{
							POarray["custparam_error"] = 'RCRD_HAS_BEEN_CHANGED : This order/order line has been changed';
							response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontpolist', 'customdeploy_wmsse_rcvcontpolist', false, POarray);
							return;
						}
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontqty', 'customdeploy_wmsse_rcvcontqty', false, POarray);
						return;
					}
					else
					{
						POarray["custparam_error"] = "Please enter/scan valid "+orderType.toLowerCase() +"#";
						nlapiLogExecution('DEBUG', 'Error:', 'PLEASE ENTER VALID PO');
						response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontpolist', 'customdeploy_wmsse_rcvcontpolist', false, POarray);
						return;
					}


				}
				else
				{
					if(trantype == 'purchaseorder')
					{
						POarray["custparam_error"] = "Please enter/scan valid Purchase Order#";
					}
					else
					{
						POarray["custparam_error"] = "Please enter/scan valid Transfer Order#";
					}

					nlapiLogExecution('DEBUG', 'Error:', 'PLEASE ENTER VALID PO');
					response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontpolist', 'customdeploy_wmsse_rcvcontpolist', false, POarray);
					return;
				}

			}
			else
			{
				POarray["custparam_error"] = "Please enter/scan valid "+orderType.toLowerCase() +"#";
				nlapiLogExecution('DEBUG', 'Error:', 'PLEASE ENTER VALID PO');
				response.sendRedirect('SUITELET', 'customscript_wmsse_rcvcontpolist', 'customdeploy_wmsse_rcvcontpolist', false, POarray);
				return;
			}
		}

	}

}

