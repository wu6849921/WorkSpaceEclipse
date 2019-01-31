/**
 * Script Description
 * This script is used to scan the Order and also for dispaying open orders list.
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to display all open orders list
 */
function PickingWOList(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		
		var getOptedField = request.getParameter('custparam_option');
	
		var userAccountId = ctx.getCompany();
		
		var vTranType = request.getParameter('custparam_trantype');
		
		var domainName = fndomainName();
		
		var st0,st1,st2,st3;
		var whLocationName = request.getParameter('custparam_whlocationname');
		var whLocation = request.getParameter('custparam_whlocation');
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + "-Picking Work Order";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			st0 = domainName + "-Picking Work Order";			
			st1 = "Enter/Scan Work Order#";			
			st2 = "SEND";
			st3 = "PREV";

		}	

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
	
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		var WORecinternalids=getWOList(vTranType,whLocation);
		var getPageCount=request.getParameter('custparam_pagecount');
		if(getPageCount == null || getPageCount=='' || getPageCount=='null')
			getPageCount=0;
		var pageSize=5;
		var nextOrd = 0;
		var totalPageSizeValue=parseInt(getPageCount)*parseInt(pageSize);
		
		var str='getOptedField :'+getOptedField+ '<br>';
		str=str + 'userAccountId :'+userAccountId+ '<br>';		
		str=str + 'vTranType:'+vTranType+ '<br>';
		str=str + 'totalPageSizeValue:'+totalPageSizeValue+ '<br>';	
		
		nlapiLogExecution('Debug', 'WOList Get ', str);
		var actualBeginTime=TimeStamp();
		//starts (Now form name is passed correctly in function to work keyboard enter button)
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_Fulfillment'); 
		//Ends here
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";	 
		html = html + "<script type='text/javascript'>function validateForm(woID){if(document.getElementById('enterwo').value == '' && (woID == '' || woID == 'null' || woID ==null || woID == 'undefined')){document.getElementById('div_error').innerHTML ='Please enter/scan work order#';return false;}else{document.getElementById('hdnWOID').value=woID;document.forms['_rf_Fulfillment'].submit();this.form.cmdPrevious.disabled=true; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>Work Order Picking - List</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr></table>"+


		/*"		<tr><td>"+
		"		<table>"+*/

		"			<table><tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdnWOID'  id='hdnWOID'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnTrantype' id='hdnTrantype' value=" + vTranType + ">"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterwo'  class='smalltextbox'  id='enterwo' type='text'/></td>"+
		"				</td>"+
		"			</tr><tr><td></td></tr></table>"+
		"			<table><tr>"+
		"				<td align = 'left'><input name='cmdSend1' type='submit' value='' class='defaultlink' onclick='return validateForm();'/>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width=20px></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Next (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+
		//"		 </table></td></tr>"+
		" 	</table>";
		if(WORecinternalids!=null && WORecinternalids!='' && WORecinternalids.length != null)
		{
			
			if(WORecinternalids.length>0)
			{


				var tblDeclared = false;
				var OrderNumArray=new Array();
				var orderCount=0;
				var vColumnslist=WORecinternalids[0].getAllColumns();
				var totalpickQtyIndex =7;
				var comittedQtyIndex =15;
				var builtQtyIndex =16;
				var unitsIndex =14;
				var coversionRateIndex =17;
				for(var x1=0;x1<vColumnslist.length;x1++)
				{
					var summaryLabel = vColumnslist[x1].getLabel();
					var name = vColumnslist[x1].getName();
					if(summaryLabel == 'Total Picked Quantity')
					{
						totalpickQtyIndex = x1;
					}
					else if(name == 'unit')
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

				for (var s = 0; s < WORecinternalids.length; s++) {
					var woInternalId=WORecinternalids[s].getValue('internalid',null,'group');
					var woId=WORecinternalids[s].getValue('tranid',null,'group');
					var vwoitemQty=WORecinternalids[s].getValue('quantity',null,'max');					
					var nooflines =WORecinternalids[s].getValue('line',null,'count'); 
					var customer=WORecinternalids[s].getValue('entityid','customer','group');
					if(customer == null || customer =='' || customer =='- None -')
						customer=WORecinternalids[s].getValue('altname','customer','group');


					var pickqty=WORecinternalids[s].getValue(vColumnslist[totalpickQtyIndex]);
					var vwoitemQty=WORecinternalids[s].getValue(vColumnslist[comittedQtyIndex]);
					var vwoitemRcvQty = WORecinternalids[s].getValue(vColumnslist[builtQtyIndex]);
					if(pickqty==null || pickqty=='')
						pickqty=0;					
					if(vwoitemRcvQty==null || vwoitemRcvQty=='')
						vwoitemRcvQty=0;
					
					
					vwoitemQty=new Big(vwoitemQty);
					vwoitemRcvQty=new Big(vwoitemRcvQty);
					pickqty=new Big(pickqty);
					var vWoreminqty = ((vwoitemQty).plus(vwoitemRcvQty)).minus(pickqty);
					

					if(Number(vWoreminqty)<=0)
					{
						continue;
					}
					if(OrderNumArray.indexOf(woId)!=-1)
					{

						continue;
					}
					else
					{
						if(parseInt(orderCount)<5)
						{

							OrderNumArray.push(woId);
						}
						if(parseInt(orderCount) >= 5 && parseInt(nextOrd) == 0)
						{
							
							nextOrd = parseInt(nextOrd) + 1;
						}

					}

					if((OrderNumArray.length>totalPageSizeValue) && (parseInt(orderCount)<5))
					{

						if(tblDeclared == false)
						{
							var strOrderText = "Work Order#";

							html = html + "	<table>"+
							" <tr>"+
							" <td>"+
							"	<table class='table' style='border-spacing: 0;border-left:1px;border-right:1px;'>"+
							" <tr class='uir-machine-headerrow' >"+
							" <td>"+strOrderText+""+
							" </td>"+		
							"<td>Assembly Item </td>"+	
							"<td class='align-right'>#Lines </td>"+	
							"</tr>";
							tblDeclared = true;
						}
						var whCompany= '';
						nlapiLogExecution('Debug', 'woInternalId', woInternalId);
						nlapiLogExecution('Debug', 'woId', woId);
						var woDetails =getWODetails(woId);
						var getWOLineItemDetials=getWOLineDetails(woId);
						var AssemblItem;
						var nooflines;
						if(woDetails!=null && woDetails!='')
						{
							//var woDetailsCount = woDetails.length;
							AssemblItem = woDetails[0].getText('item');								
							//nooflines = woDetailsCount-1; 
						}
						var woDetailsCount=1;
						if(getWOLineItemDetials !=null && getWOLineItemDetials !='')
							woDetailsCount = getWOLineItemDetials.length;
						

						orderCount=parseInt(orderCount)+1;
						var checkInURL_1 = nlapiResolveURL('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan');						 
						var linkURL_1 = checkInURL_1 + '&custparam_whlocation=' + whLocation + '&custparam_whlocationname=' + whLocationName + '&custparam_trantype=' + vTranType + '&custparam_language=' + getLanguage + '&custparam_woid=' + woId  + '&custparam_customer=' + customer  + '&custparam_actualbegintime=' + actualBeginTime + '&custparam_company=' + whCompany + '&custparam_wointernalid=' + woInternalId ;
						if(customer != null && customer !='' && customer !='- None -' && customer.length > 20)
						{
							customer = customer.substring(0,20)+"..";
						}
						html = html + "	<tr  class='uir-list-row-tr line uir-list-row-even'>"+
						" <td><a name='link1URL_1' href='#' onclick='return validateForm(\""+woInternalId+"\");'> "+woId+"</a></td>"+
						"<td>"+AssemblItem+"</td>"+
						//"<td align='right'>"+nooflines+"</td>"+
						"<td class='align-right'>"+woDetailsCount+"</td>"+
						"</tr>";
					}
					if(parseInt(orderCount)>=5)
					{
						var twoInternalId=0;
						if(WORecinternalids[s] != null  && WORecinternalids[s] !='null' && WORecinternalids[s] != '' && parseInt(nextOrd) >= 1)
						{
							twoInternalId=WORecinternalids[s].getValue('tranid',null,'group');


							
							if(((WORecinternalids.length)-(parseInt(s)) > 0) && (OrderNumArray.indexOf(twoInternalId)==-1))
							{
								orderCount=parseInt(orderCount)+1;
								break;
							}
						}
						/*else
							{
								if( (OrderNumArray.indexOf(twoInternalId)==-1))
								{
									orderCount=parseInt(orderCount)+1;
									break;
								}
							}*/

					}
					//	}
				}
				if(tblDeclared == false)
				{
					var WOarray = new Array();
					WOarray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
					WOarray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
					WOarray["custparam_trantype"]=request.getParameter('custparam_trantype');
					WOarray["custparam_error"] = 'No records to show.';

					response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
					return;
				}
				html = html + "	</table>"+	
				"				<input type='hidden' name='hdngetPageCount' id='hdngetPageCount' value=" + getPageCount + ">"+
				" </td>"+
				"</tr>"+
				"</table>";
			}
		}
		else
		{

			var WOarray = new Array();
			WOarray["custparam_whlocation"]=request.getParameter('custparam_whlocation');
			WOarray["custparam_whlocationname"]=request.getParameter('custparam_whlocationname');
			WOarray["custparam_trantype"]=request.getParameter('custparam_trantype');
			WOarray["custparam_error"] = 'No records to show.';

			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
			return;
		}
		WORecinternalids=null;
		//html = html +" 	</td></tr></table>";
		html = html +"		<table>	<tr>";
		if(getPageCount>0)
		{
			html = html +"				<td align = 'left'><input name='cmdPrevList' type='submit' value='Prev'/></td>";
		}
		else
		{
			html = html +"				<td >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
		}
		html = html +"				<td width='20px'></td>";
		if(parseInt(orderCount)>5)
		{
			html = html +"				<td align = 'right'><input name='cmdNextList' type='submit' value='Next'/></td>";
		}
		html = html +"			</tr>"+ 
		"		 </table>";
		"	</form>"+
		"<script type='text/javascript'>document.getElementById('enterwo').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedEvent = request.getParameter('cmdPrevious');
		var tranType = request.getParameter('hdnTrantype');
		var WOarray=new Array();
		

		WOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		WOarray["custparam_whlocationname"] = request.getParameter('hdnWhLocationName');
		var whlocation = request.getParameter('custparam_whlocation');

		var getLanguage = request.getParameter('hdngetLanguage');
		WOarray["custparam_language"] = getLanguage;
	

		var context = nlapiGetContext();

		var userAccountId = context.getCompany();

		var st11,st12;
		if( getLanguage == 'es_ES')
		{
			st11 = "OPCI&#211;N V&#193;LIDA";
			st12 = "MainMenu";
		}
		else
		{
			st11 = "Invalid Option";
			st12 = "MainMenu";
		}



		WOarray["custparam_woid"] = request.getParameter('enterwo');
		WOarray["custparam_trantype"] = request.getParameter('hdnTrantype');

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			WOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
			return;
		}
		
		if(request.getParameter('cmdNextList')=="Next")
		{
			WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))+1;
			WOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lstscan', 'customdeploy_wmsse_wo_lstscan', false, WOarray);
			return;
		}
		if(request.getParameter('cmdPrevList')=="Prev")
		{
			WOarray["custparam_pagecount"]=parseInt(request.getParameter('hdngetPageCount'))-1;
			WOarray["custparam_error"]='';
			response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lstscan', 'customdeploy_wmsse_wo_lstscan', false, WOarray);
			return;
		}
		else
		{
			var getWOid=request.getParameter('enterwo');
			
			var WOID = request.getParameter('hdnWOID');
			nlapiLogExecution('DEBUG','WOID',WOID);
			if(WOID != null &&  WOID != '' && WOID != 'null' && WOID != 'undefined')
			{
				var fields = ['tranid'];
				var woDetails= nlapiLookupField(tranType,WOID,fields);
				getWOid = woDetails.tranid;
			}
			
			var validatewo =fntocheckwo(getWOid,whlocation);
			if(validatewo=="T"){
				
				var filters = new Array();
				var columns = new Array();


				filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));
				if(getWOid!=null && getWOid!='' && getWOid!='undefined' && getWOid!='')
					filters.push(new nlobjSearchFilter('tranid', null, 'is', getWOid));
				if(whlocation!=null && whlocation!='' && whlocation!='undefined' && whlocation!='')
					filters.push(new nlobjSearchFilter('location', null, 'anyof', whlocation));

				filters.push(new nlobjSearchFilter('status', null, 'anyof',['WorkOrd:B','WorkOrd:D']));
				var WORecinternalids = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_fulfil_detail', filters, columns);
				var woid='';
				if(WORecinternalids!=null && WORecinternalids!='' && WORecinternalids.length > 0)
				{


					var vColumnslist=WORecinternalids[0].getAllColumns();
					var totalpickQtyIndex =7;
					var comittedQtyIndex =15;
					var builtQtyIndex =16;
					var unitsIndex =14;
					var coversionRateIndex =17;
					for(var x1=0;x1<vColumnslist.length;x1++)
					{
						var summaryLabel = vColumnslist[x1].getLabel();
						var name = vColumnslist[x1].getName();
						if(summaryLabel == 'Total Picked Quantity')
						{
							totalpickQtyIndex = x1;
						}
						else if(name == 'unit')
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



					woid=WORecinternalids[0].getValue('internalid',null,'group');
					
					WOarray["custparam_woid"] = WORecinternalids[0].getValue('tranid',null,'group');
					//WOarray["custparam_woassemblyitem"] =WORecinternalids[0].getText('assemblyitem');
					var backOrderFlag=false;var backorderItmsCount = 0;
					for (var t = 0; t < WORecinternalids.length; t++) {
						var vcommittedordqty = WORecinternalids[t].getValue(vColumnslist[comittedQtyIndex]);
						if(vcommittedordqty == null || vcommittedordqty =='' || vcommittedordqty=='null')
							vcommittedordqty=0;
						if(parseFloat(vcommittedordqty)<=0)
						{
							backOrderFlag=true;
							backorderItmsCount = parseInt(backorderItmsCount)+1;
						}
					}
					 
					
					if(backOrderFlag==true )
					{


						var filters=new Array();
						var columns=new Array();
						filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
						filters.push(new nlobjSearchFilter('quantity', null, 'greaterthan', 0));

						filters.push(new nlobjSearchFilter('shipping', null, 'is', 'F'));
						filters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));
						filters.push(new nlobjSearchFilter('tranid', null, 'is', getWOid));

						columns.push(new nlobjSearchColumn('line'));
						//columns.push(new nlobjSearchColumn('item'));	
						//columns.push(new nlobjSearchColumn('quantity'));
						//columns.push(new nlobjSearchColumn('quantitypicked'));
						//columns.push(new nlobjSearchColumn('quantityshiprecv'));
						columns.push(new nlobjSearchColumn('tranid'));	
						columns.push(new nlobjSearchColumn('location'));
						columns.push(new nlobjSearchColumn('internalid'));
						columns.push(new nlobjSearchColumn('quantitycommitted'));
						//columns[3].setSort();

						var WORec = nlapiSearchRecord('workorder','customsearch_wmsse_woassemblylist_srh',filters,columns);


						if(WORec != null && WORec != '' && WORec != 'null' && WORec != 'undefined' && WORec.length >0 && (parseInt(backorderItmsCount) == (parseInt(WORec.length))) )

						{
							nlapiLogExecution('Debug', 'WORec.length', WORec.length); 
							//WOarray["custparam_error"] = "All the items in this work order are back ordered.";
							WOarray["custparam_error"] = "All components are on back ordered for this work order";
							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lstscan', 'customdeploy_wmsse_wo_lstscan', false, WOarray);
							return;
						}
					}
					var opentaskDetails  = getopentaskDetails(woid);
				
					if(opentaskDetails != null && opentaskDetails != '')
					{
						var skuArray = new Array();
						var pickqtyArray = new Array();
						for(var m=0;m<opentaskDetails.length;m++)
						{
							skuArray.push(opentaskDetails[m][0]);
							pickqtyArray.push(opentaskDetails[m][1]);
						}
						

						var isValid=false;

						for (var s = 0; s < WORecinternalids.length; s++) {
							var vwoitem = WORecinternalids[s].getValue('item',null,'group');
							var vwoline = WORecinternalids[s].getValue('line',null,'group');
							//var vwoitemRcvQty = WORecinternalids[s].getValue('quantitypicked');
							//var vwoitemRcvQty = WORecinternalids[s].getValue('quantityshiprecv');
							//var vwoitemquantity = WORecinternalids[s].getValue('quantity');
							//var vwoitemQty=WORecinternalids[s].getValue('quantitycommitted');

							var pickqty=WORecinternalids[s].getValue(vColumnslist[totalpickQtyIndex]);
							var vwoitemQty=WORecinternalids[s].getValue(vColumnslist[comittedQtyIndex]);
							var vwoitemRcvQty = WORecinternalids[s].getValue(vColumnslist[builtQtyIndex]);
							if(pickqty==null || pickqty=='')
								pickqty=0;					
							if(vwoitemRcvQty==null || vwoitemRcvQty=='')
								
						//	vwoitemQty=new Big(vwoitemQty);
							vwoitemRcvQty=new Big(vwoitemRcvQty);
							pickqty=new Big(pickqty);
							
							var vWoreminqty = Number((Big(vwoitemQty).plus(vwoitemRcvQty)).minus(pickqty));						
							if(vWoreminqty > 0)
							{
								nlapiLogExecution('Debug', 'vWoreminqty', vWoreminqty);
								isValid=true;
								break;
							}

						}
						nlapiLogExecution('Debug', 'isValid', isValid);
						if(isValid==false)
						{
							WOarray["custparam_error"] = "All the items in this work order are picked.";						
							response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lstscan', 'customdeploy_wmsse_wo_lstscan', false, WOarray);
							return;
						}


					}

					//var woStatus=WORecinternalids[0].getValue('status');
					//nlapiLogExecution('DEBUG','woStatus',woStatus);
					var woToLocationID=WORecinternalids[0].getValue('location',null,'group');
								
					var whLocation= WORecinternalids[0].getValue('location',null,'group');

					var whCompany= WORecinternalids[0].getValue('custbody_nswms_company',null,'group');
					WOarray["custparam_whlocation"] = whLocation;
					WOarray["custparam_company"] =whCompany;

					message = 'whLocation = ' + whLocation + '<br>';
					message = message + 'whCompany = ' + whCompany;
					nlapiLogExecution('DEBUG', 'WO Details', message);
					WOarray["custparam_error"] ='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_woitem_scan', 'customdeploy_wmsse_woitem_scan', false, WOarray);




				}
				else
				{			
					WOarray["custparam_error"] = "Please enter/scan valid work order#";

					response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lstscan', 'customdeploy_wmsse_wo_lstscan', false, WOarray);
					return;
				}
			}
			else if(validatewo=="IVL")
			{
				//WOarray["custparam_error"] = "This WO is not tie up with the location";
				WOarray["custparam_error"] = "This work order is not mapped with any warehouse location";
				response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lstscan', 'customdeploy_wmsse_wo_lstscan', false, WOarray);
				return;
			}
			else if(validatewo=="IWL")
			{
				WOarray["custparam_error"] = "This work order is mapped with other warehouse location";

				response.sendRedirect('SUITELET', 'customscript_wmsse_wo_scan', 'customdeploy_wmsse_wo_scan', false, WOarray);
				return;
			}
			else{
				WOarray["custparam_error"] = "Please enter/scan valid work order#";

				response.sendRedirect('SUITELET', 'customscript_wmsse_wo_lstscan', 'customdeploy_wmsse_wo_lstscan', false, WOarray);
				return;
			}

		}

		nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
	}
}
/**
 * To validate order
 * @param soid
 * @param loc
 * @param tranType
 * @returns
 */
function getopentaskDetails(woInternalId)
{
	nlapiLogExecution('Debug', 'woInternalId', woInternalId);
	var opentaskFilters =  new Array();
	opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',woInternalId));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['8']));
	//opentaskFilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no',  null,'anyof',['@NONE@'])); 
	//opentaskFilters.push(new nlobjSearchFilter('isinactive',null,'is','F'));

	var opentaskColumns =  new Array();
	//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_batch_no'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_sku',null,'group'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_line_no',null,'group'));
	//opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_act_qty',null,'sum'));
	opentaskColumns.push(new nlobjSearchColumn('custrecord_wmsse_actendloc',null,'group'));
	var opentaskResultsArray = new Array();
	var opentaskResults =  nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpickqtysearch',opentaskFilters,opentaskColumns);
	
	if(opentaskResults !=null && opentaskResults !='')
	{
		nlapiLogExecution('Debug', 'opentaskResults', opentaskResults.length);
		for(var k=0;k<opentaskResults.length;k++)
		{
			
			var sku = opentaskResults[k].getValue('custrecord_wmsse_sku',null,'group');
			var lineno = opentaskResults[k].getValue('custrecord_wmsse_line_no',null,'group');
			var qty =  opentaskResults[k].getValue('custrecord_wmsse_act_qty',null,'sum');
			var key = sku+"-"+lineno;
			var currRow = [key,qty];
			opentaskResultsArray.push(currRow);
		}
	}
	
	return opentaskResultsArray;
}

function fntocheckwo(woid,loc){
	var resflag = "F";

	var filters=new Array();
	var columns=new Array();
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
	filters.push(new nlobjSearchFilter('tranid', null, 'is', woid));
	/*if(loc!=null && loc!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', loc));*/
	filters.push(new nlobjSearchFilter('status', null, 'anyof',['WorkOrd:B','WorkOrd:D']));

	columns[0] = new nlobjSearchColumn('location');

	var WORecinternalids=nlapiSearchRecord('workorder','customsearch_wmsse_woassemblylist_srh',filters,columns);

	if(WORecinternalids!=null && WORecinternalids!="")
	{
		resflag ="T";
		var woLocation=WORecinternalids[0].getValue('location');
		if(woLocation == null || woLocation == '' || woLocation =='null' || woLocation == 'undefined')
		{
			resflag ="IVL";
		}
		if(woLocation != null && woLocation !='' && (woLocation != loc))
		{
			resflag ="IWL";
		}
	}

	return resflag;

}
function getWOList(trantype,whLocation)
{
	


	var filters = new Array();
	var columns = new Array();


	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'WorkOrd'));

	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='')
		filters.push(new nlobjSearchFilter('location', null, 'anyof', whLocation));

	filters.push(new nlobjSearchFilter('status', null, 'anyof',['WorkOrd:B','WorkOrd:D']));
	var WOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_wo_fulfil_detail', filters, columns);


	return WOLineDetails;
}

function getWODetails(wonumber)
{
	var filters = new Array();
	var columns = new Array();
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
	filters.push(new nlobjSearchFilter('quantity', null, 'greaterthan', 0));

	filters.push(new nlobjSearchFilter('shipping', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));
	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));

	columns.push(new nlobjSearchColumn('line'));
	//columns.push(new nlobjSearchColumn('item'));	
	//columns.push(new nlobjSearchColumn('quantity'));
	//columns[3] = new nlobjSearchColumn('quantitypicked');
	//columns.push(new nlobjSearchColumn('quantityshiprecv'));
	columns.push(new nlobjSearchColumn('tranid'));	
	columns.push(new nlobjSearchColumn('location'));


	var woLineDetails = nlapiSearchRecord('workorder', 'customsearch_wmsse_woassembly_srh', filters, columns);

	nlapiLogExecution('Debug', 'woLineDetails', woLineDetails);
	return woLineDetails;
}

function getWOLineDetails(wonumber)
{
	var filters = new Array();
	var columns = new Array();
	filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));	
	filters.push(new nlobjSearchFilter('tranid', null, 'is', wonumber));	

	var woLineDetails = nlapiSearchRecord('workorder','customsearch_wmsse_wo_fulfil_detail',filters, columns);


	return woLineDetails;
}