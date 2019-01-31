/**
 * Script Description
 * This script is used to scan the Order from Open orders list.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * Main function to scan order from open orders list
 */
function QuickShipSO(request, response){
	if (request.getMethod() == 'GET') {


		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');

		nlapiLogExecution('DEBUG', 'getLanguage', getLanguage);
		var getOptedField = request.getParameter('custparam_option');
		nlapiLogExecution('DEBUG', 'getOptedField', getOptedField);
		var userAccountId = ctx.getCompany();
		nlapiLogExecution('DEBUG', 'userAccountId', userAccountId);
		var vTranType = request.getParameter('custparam_trantype');
		nlapiLogExecution('DEBUG', 'vTranType', vTranType);
		var st0,st1,st2,st3;
		var domainName = fndomainName();
		nlapiLogExecution('Error', 'domainName', domainName);
		var whLocation = request.getParameter('custparam_whlocation');
		var whLocationName = request.getParameter('custparam_whlocationname');
		if( getLanguage == 'es_ES')
		{
			st0 = domainName + " - Quick Ship";
			st1 = "Entrar / Scan Transacci�n #";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			var headerVar='Quick Ship - Order#';


			st0 = domainName + " - Quick Ship";
			st1 ="Enter/Scan Transaction#";
			st2 = "SEND";
			st3 = "PREV";

		}	

		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		nlapiLogExecution('ERROR', 'CSSfilefound', CSSfilefound);
		var errMsg='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}
		if (CSSfilefound) 
		{ 

			CSSurl = CSSfilefound.getURL();
			nlapiLogExecution('ERROR', 'CSSurl', CSSurl); 

		}
		CSSurl=CSSurl.replace(/&/g,"&amp;");
		CSSfilefound=null;
		var imgUrl='';
		imgfilefound = loadProgressiveImage();
		if(imgfilefound)
		{
			imgUrl = imgfilefound.getURL();
			nlapiLogExecution('ERROR', 'imgUrl', imgUrl);
		}
		imgUrl=imgUrl.replace(/&/g,"&amp;");
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
		//html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterso').value != ''){ document.getElementById('loading').style.display = ''; return true;}else{return true;}}</script>";
		html = html + "<script type='text/javascript'>function validateForm(){if(document.getElementById('enterso').value != ''){document.getElementById('loading').style.display = '';  return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		//"		<tr><td></td></tr><tr><td></td></tr><tr><td>"+

		/*"		<tr><td>"+
		"		<table>"+*/
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>" + st1+
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnTrantype' id='hdnTrantype' value=" + vTranType + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'><input name='enterso'  class='smalltextbox'  id='enterso' type='text'/>"+
		"				</td>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"	<td width='10px'></td><td ></td>"+
		"			</tr><tr><td></td></table>"+
		"		<table>	<tr>"+
		//"				<td align = 'left'><input name='cmdSend'  class='defaultlink'   type='submit' value='Next' onclick='return validateForm();'/></td><td>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSendSO' type='submit' value='Sales Order' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"		<tr><td ><input name='cmdSendTO' type='submit' value='Transfer Order' onclick='return validateForm();'/></td><td width='20px'></td>	<td ><input name='cmdSendMainMenu' type='submit' value='Main Menu'/></td></tr>"+ 
		"		 </table>"+
		//" 	</td></tr>" +
		"</table>"+
		"	</form>"+
		"<script type='text/javascript'>document.getElementById('enterso').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');

		var optedField = request.getParameter('enterso');
		var optedEvent = request.getParameter('cmdPrevious');
		var tranType = '';
		var SOarray=new Array();
		nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);
		var SoId ='';
		var shipmethod='';
		var getLanguage = request.getParameter('hdngetLanguage');
		SOarray["custparam_language"] = getLanguage;
		nlapiLogExecution('DEBUG', 'getLanguage', SOarray["custparam_language"]); 
		SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
		SOarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');

		var whlocation = request.getParameter('custparam_whlocation');

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
			st11 = "INVALID OPTION";
			st12 = "MainMenu";
		} 
		SOarray["custparam_error"] = st11;
		SOarray["custparam_screenno"] = st12;
		SOarray["custparam_soid"] = request.getParameter('enterso');
		SOarray["custparam_trantype"] = '';

		if (optedEvent == 'Back (F7)') {
			nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
			SOarray["custparam_error"]='';
//			response.sendRedirect('SUITELET', 'customscript_wmsse_fulfillmenu', 'customdeploy_wmsse_fulfillmenu', false, SOarray);
			response.sendRedirect('SUITELET', 'customscript_wmsse_picking_menu', 'customdeploy_wmsse_picking_menu', false, SOarray);
		}
		else
		{
			var vMainMenuBtn = request.getParameter('cmdSendMainMenu');
			var vToBtn = request.getParameter('cmdSendTO');
			var vSoBtn = request.getParameter('cmdSendSO');
			nlapiLogExecution('DEBUG','request.getParameter("cmdSearch")',request.getParameter('cmdSearch'));
			nlapiLogExecution('DEBUG','vMainMenuBtn',vMainMenuBtn);
			nlapiLogExecution('DEBUG','vToBtn',vToBtn);
			nlapiLogExecution('DEBUG','vSoBtn',vSoBtn);
			
			if(vMainMenuBtn != null && vMainMenuBtn !='' && vMainMenuBtn !='null' && vMainMenuBtn !='undefined')
			{
				SOarray["custparam_error"] = '';
				//response.sendRedirect('SUITELET', 'customscript_wmsse_menu_loc_scan', 'customdeploy_wmsse_menu_loc_scan', false, SOarray);
				response.sendRedirect('SUITELET', 'customscript_wmsse_menu', 'customdeploy_wmsse_menu', false, SOarray);
				return;
			}
			else if(vToBtn != null && vToBtn !='' && vToBtn !='null' && vToBtn !='undefined')
			{
				SOarray["custparam_trantype"] = 'transferorder';
				tranType = 'transferorder';
			}
			else if(vSoBtn != null && vSoBtn !='' && vSoBtn !='null' && vSoBtn !='undefined')
			{
				SOarray["custparam_trantype"] = 'salesorder';
				tranType = 'salesorder';
			}
			else
			{
				SOarray["custparam_trantype"] = 'salesorder';
				tranType = 'salesorder';
			}
			var getSOid=request.getParameter('enterso');
			nlapiLogExecution('DEBUG','getSOid',getSOid);
			nlapiLogExecution('DEBUG','tranType',tranType);
			var ctx = nlapiGetContext();
			var blnMultiShipEnabled = ctx.getFeature('multishipto');
			nlapiLogExecution('ERROR','blnMultiShipEnabled',blnMultiShipEnabled);
			var objSoDetailsArray=null;
			var shipmethodValue='';
			var vShipMethodArr=new Array();
			var vShipMethodTextArr=new Array();
			var objSoDetailsArray =null;
			if(getSOid!=null && getSOid!='' && getSOid != 'null' && getSOid != 'undefined')
			{
				objSoDetailsArray=fnGetSOInternalId(getSOid,tranType,blnMultiShipEnabled);
				nlapiLogExecution('DEBUG','objSoDetailsArray',objSoDetailsArray);
			}
			else
			{
				if(tranType == 'salesorder')
				{
					SOarray["custparam_error"] = "Please enter/scan  sales order#";
				}
				else
				{
					SOarray["custparam_error"] = "Please enter/scan  transfer order#";	
				}
				response.sendRedirect('SUITELET','customscript_wmsse_rf_quickship', 'customdeploy_wmsse_rf_quickship', false, SOarray);
				return;
			}
			if(objSoDetailsArray!=null && objSoDetailsArray!="" && objSoDetailsArray != 'null' && objSoDetailsArray.length != null)
			{
				nlapiLogExecution('DEBUG','objSoDetailsArray',objSoDetailsArray.length);
				var vMultilineShip = 'F';
				for (f = 0; f < objSoDetailsArray.length; f++)
				{	
					var shipmethod='';
					SoId = objSoDetailsArray[f].getId();
					shipmethod = objSoDetailsArray[f].getValue('shipmethod');
					var shipmethodText = objSoDetailsArray[f].getText('shipmethod');
					if(blnMultiShipEnabled)
						vMultilineShip = objSoDetailsArray[f].getValue('ismultishipto');
					if(vMultilineShip == null || vMultilineShip =='')
						vMultilineShip = 'F';
					if(shipmethod !=null && shipmethod!='' && vShipMethodArr.indexOf(shipmethod) == -1)
					{
						vShipMethodArr.push(parseInt(shipmethod));
						vShipMethodTextArr.push(shipmethodText);
					}
				}

				nlapiLogExecution('ERROR','SoId',SoId);
				nlapiLogExecution('ERROR','vShipMethodArr',vShipMethodArr);
				nlapiLogExecution('ERROR','vMultilineShip',vMultilineShip);
				/*for (f = 0; f < objSoDetailsArray.length; f++)
				{		
					SoId = objSoDetailsArray[f][0];
					shipmethod = objSoDetailsArray[f][1];
					shipmethodValue =objSoDetailsArray[f][2];
				}*/
				if(vShipMethodArr !=null && vShipMethodArr !='' && vShipMethodArr.length > 0)
				{
					var vContLPArr=new Array();
					var vTempOTResults=new Array();
					for(var c=0;c<vShipMethodArr.length;c++)
					{
						var vnShipMethod = vShipMethodArr[c];
						var vnShipMethodText = vShipMethodTextArr[c];
						//Quickshpflag=fnGetQuickShipFlagbyShipmethod(vnShipMethod);
						nlapiLogExecution('ERROR','vnShipMethod',vnShipMethod);
						nlapiLogExecution('ERROR','vnShipMethodText',vnShipMethodText);
						//Case# 201415472  start
						var Quickshpflag=fnGetQuickShipFlagbyShipmethod(vnShipMethod);
						//Case# 201415472  end
						if(Quickshpflag=='T')
						{
							var columnsPicktsk = new Array();


							var filtersPicktsk = new Array();
							filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', SoId));
							//filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));//status.outbound.packcomplete
						//	filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));//pick task
							filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'noneof',['@NONE@'])); 
							filtersPicktsk.push(new nlobjSearchFilter('mainline','custrecord_wmsse_order_no','is','T'));
							filtersPicktsk.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
							if(vMultilineShip == 'T' && vnShipMethod!=null && vnShipMethod !='' && vnShipMethod !='- None -')
							{	
								nlapiLogExecution('ERROR','vnShipMethod1',vnShipMethod);

								filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyOf',vShipMethodArr));
							}
							filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));
							var opentasksosearchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_quickship_details', filtersPicktsk, null);
							if(opentasksosearchresults!="" && opentasksosearchresults!=null)
							{	
								nlapiLogExecution('ERROR','opentasksosearchresults.length',opentasksosearchresults.length);

								for(var s=0;s<opentasksosearchresults.length;s++)
								{
									var vContLP=opentasksosearchresults[s].getValue('custrecord_wmsse_container_lp_no');
									var vShipMehtod=opentasksosearchresults[s].getValue('custrecord_wmsse_shipmethod');
									var vShipMehtodText=opentasksosearchresults[s].getText('custrecord_wmsse_shipmethod');
									var openTaskId=opentasksosearchresults[s].getId();
									nlapiLogExecution('ERROR','open task internal id',openTaskId);
									var wgt='';
									var packwt='';
									if(vShipMehtod == vnShipMethod || vMultilineShip == 'F')
									{
										if(vContLP != null && vContLP != '' && vContLPArr.indexOf(vContLP)==-1)
										{

											if(opentasksosearchresults[s].getValue('custrecord_wmsse_total_weight')!=null && opentasksosearchresults[s].getValue('custrecord_wmsse_total_weight')!='')
											{
												wgt=parseFloat(opentasksosearchresults[s].getValue('custrecord_wmsse_total_weight'));
											}
											else
											{
												wgt=parseFloat(opentasksosearchresults[s].getValue('custrecord_wmsse_containerweight'));
											}		
											if(opentasksosearchresults[s].getValue('custrecord_wmsse_containerweight')!=null && opentasksosearchresults[s].getValue('custrecord_wmsse_containerweight')!='')
											{
												packwt=opentasksosearchresults[s].getValue('custrecord_wmsse_containerweight');
											}
											SOarray["custparam_error"] = '';
											SOarray["custparam_contlp"] = vContLP;
											SOarray["custparam_soid"] = SoId;
											SOarray["custparam_soname"] = getSOid;
											SOarray["custparam_weight"] = wgt;
											SOarray["custparam_packageweight"] = packwt;
											if(vShipMehtodText !=null && vShipMehtodText !='' && vShipMehtodText !='null' && vShipMehtodText!='- None -')
												shipmethodValue = vShipMehtodText;
											else
											{
												shipmethodValue = vnShipMethodText;
												var openTaskUpdate = nlapiSubmitField('customrecord_wmsse_trn_opentask', openTaskId,'custrecord_wmsse_shipmethod' ,vnShipMethod);
											}
											SOarray["custparam_shippingmethod"] = shipmethodValue ;
											response.sendRedirect('SUITELET','customscript_wmsse_quickship_tracking', 'customdeploy_wmsse_quickship_tracking', false, SOarray);
											return;
										}
									}
								}	

							}
							else
							{
								//SOarray["custparam_error"] = 'No containers found to quickship';
								SOarray["custparam_error"] = 'No containers found to perform quick ship';
								response.sendRedirect('SUITELET','customscript_wmsse_rf_quickship', 'customdeploy_wmsse_rf_quickship', false, SOarray);
								return;
							}

						}			
						else
						{
							if(tranType == 'salesorder')
							{
								SOarray["custparam_error"] = 'The Service Level for this SO is not tagged for Quickship';
							}
							else if(tranType == 'transferorder')
							{
								SOarray["custparam_error"] = 'The Service Level for this TO is not tagged for Quickship';
							}
							else
							{
								SOarray["custparam_error"] = 'The Service Level for this SO/TO is not tagged for Quickship';
							}
							response.sendRedirect('SUITELET','customscript_wmsse_rf_quickship', 'customdeploy_wmsse_rf_quickship', false, SOarray);
							return;
						}
					}
				}
				else
				{
					//SOarray["custparam_error"] = 'No containers found to quickship';
					SOarray["custparam_error"] = 'Shipping method is not mapped with order#';
					response.sendRedirect('SUITELET','customscript_wmsse_rf_quickship', 'customdeploy_wmsse_rf_quickship', false, SOarray);
					return;
				}
			}
			else
			{

				if(tranType == 'salesorder')
				{
					SOarray["custparam_error"] = "Please enter/scan valid sales order#";
				}
				else
				{
					SOarray["custparam_error"] = "Please enter/scan valid transfer order#";	
				}
				response.sendRedirect('SUITELET','customscript_wmsse_rf_quickship', 'customdeploy_wmsse_rf_quickship', false, SOarray);

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
function fnGetSOInternalId(SOText,ordertype,blnMultiShipEnabled)
{
	nlapiLogExecution('ERROR','Into fnGetSOInternalId (Input)',SOText);

	var ActualSoID='-1';
	var shipmethod="";

	var filter=new Array();
	filter.push(new nlobjSearchFilter('tranid',null,'is',SOText.toString()));
	filter.push(new nlobjSearchFilter('mainline',null,'is','F'));
	filter.push(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
	var columns=new Array();
	columns.push(new nlobjSearchColumn('shipmethod'));
	if(blnMultiShipEnabled)
		columns.push(new nlobjSearchColumn('ismultishipto'));
	var objSoDetailsArray = new Array();
	var searchrec=nlapiSearchRecord(ordertype,'customsearch_wmsse_quickship_iddetails',filter,columns);

	/*if(searchrec!=null && searchrec!='' && searchrec.length>0)
	{
		ActualSoID=searchrec[0].getId();
		shipmethod=searchrec[0].getValue('shipmethod');
		shipmethodTxt=searchrec[0].getText('shipmethod');
		var newrow = [ActualSoID,shipmethod,shipmethodTxt]; 
		objSoDetailsArray.push(newrow);
	}*/

	nlapiLogExecution('ERROR','Out of fnGetSOInternalId (Output)',ActualSoID);

	//Nullify the objects.	 
	filter=null;
	columns=null;

	//return objSoDetailsArray;
	return searchrec;
}

function fnIsContainerLpExist(vContLpNo)
{
	nlapiLogExecution('ERROR', 'Into IsContLpExist',vContLpNo);	
	var IsContLpExist='F';

	try
	{
		var filter = new Array();
		filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_contlp',null,'is',vContLpNo));
		var columns = new Array();
		//columns[0] = new nlobjSearchColumn('custrecord_wmsse_ship_order');
		var manifestList= nlapiSearchRecord('customrecord_wmsse_ship_manifest','customsearch_wmsse_shipmanifest_details',filter,null);
		if(manifestList!=null && manifestList.length>0)
			IsContLpExist='T';		
	}
	catch(e)
	{
		if (e instanceof nlobjError)
			nlapiLogExecution('ERROR', 'system error', e.getCode() + '\n'
					+ e.getDetails());
		else
			nlapiLogExecution('ERROR', 'unexpected error', e.toString());
		nlapiLogExecution('ERROR', 'unexpected error', 'I am unsuccess3');
	}
	nlapiLogExecution('ERROR', 'Out of IsContLpExist',IsContLpExist);	
	//Nullify the objects.	 
	filter=null;
	columns=null;
	return IsContLpExist;
}

function fnGetQuickShipFlagbyShipmethod(shipmethod)
{
	nlapiLogExecution('ERROR', 'Into fnGetQuickShipFlagbyShipmethod (Input)', shipmethod);

	var quickship='F';
	var filter=new Array();
	//Case# 201415472  start
	if(shipmethod!="" && shipmethod!=null)
		filter.push(new nlobjSearchFilter('custrecord_wmsse_carrier_nsmethod',null,'anyof',shipmethod));
	//Case# 201415472  end
	var columns=new Array();
	//columns.push(new nlobjSearchColumn('custrecord_wmsse_carrier_allow_quickship'));
	var carrierrec=nlapiSearchRecord('customrecord_wmsse_carrier','customsearch_wmsse_getquickshipflag',filter,null);
	if(carrierrec!=null && carrierrec!='' && carrierrec.length>0)
	{
		quickship=carrierrec[0].getValue('custrecord_wmsse_carrier_allow_quickship');
	}

	nlapiLogExecution('ERROR', 'Out of fnGetQuickShipFlagbyShipmethod (Output)', quickship);
	//Nullify the objects.	 
	filter=null;
	columns=null;
	return quickship;
}