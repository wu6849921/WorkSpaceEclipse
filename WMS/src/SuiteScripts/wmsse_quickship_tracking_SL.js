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
		var contlp = request.getParameter('custparam_contlp');
		var weight = request.getParameter('custparam_weight');
		var packageweight = request.getParameter('custparam_packageweight');
		var soId = request.getParameter('custparam_soid');
		var soName = request.getParameter('custparam_soname');
		var shippingmethod = request.getParameter('custparam_shippingmethod');
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
			st0 = domainName + "-CHECKIN SO SCAN";
			st1 = "INTRODUZCA ORDEN DE COMPRA";
			st2 = "ENVIAR";
			st3 = "ANTERIOR";	

		}
		else
		{
			var headerVar='Quick Ship - Carton#';


			st0 = domainName + "- Quick Ship";
			st1 ="Enter/Scan Carton# ";
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
		html = html + "<script type='text/javascript'>function validateForm(){this.form.submit();this.form.cmdPrevious.disabled=true; return true;}</script>";
		html = html +functionkeyHtml;
		html = html +" </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_Fulfillment' method='POST'>"+ 
		"		<table width='100%'>"+
		"			<tr><td class='tableheading'>"+headerVar+"</td></tr>"+

		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+
		"		<tr><td>"+

		/*"		<tr><td>"+
		"		<table>"+*/
		"		<table>"+
		"			<tr>"+
		"				<td align = 'left' >" +
		"				<input type='hidden' name='hdnOptedField' value=" + getOptedField + ">"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Transaction# <label> "+soName+"</label>" +
		"				<input type='hidden' name='hdnWeight' value='" + weight + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Carton# <label>"+contlp+"</label>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+	
		"				<input type='hidden' name='hdnTrantype' id='hdnTrantype' value=" + vTranType + ">"+	
		"				<input type='hidden' name='hdnWhLocationName' value='" + whLocationName + "'>"+
		"				<input type='hidden' name='hdnWhLocation' value=" + whLocation + ">"+	
		"				<input type='hidden' name='hdnContlp' value='" + contlp + "'>"+
		"				<input type='hidden' name='hdnSoID' value='" + soId + "'>"+
		"				<input type='hidden' name='hdnSoName' value='" + soName + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Weight: <label> "+weight+" </label>"+
		"				<input type='hidden' name='hdnWeight' value='" + weight + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Package Weight: <label> "+packageweight+" </label>"+
		"				<input type='hidden' name='hdnPckgWeight' value='" + packageweight + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left' class='labelmsg'>Shipping Method:  <label>"+shippingmethod+"  </label>"+
		"				<input type='hidden' name='hdnshippingmethod' value='" + shippingmethod + "'>"+
		"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'> "+
		"				</td>"+
		"				<td align = 'left'><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm();'/></td><td>"+
		"	<td width='10px'></td><td ></td>"+
		"			</tr><tr><td align = 'left' class='labelmsg'>Enter/Scan Carton#</td></tr><tr><td><input type='text' class='smalltextbox' name='txtcartanno' id='txtcartanno' value='"+contlp+"'/></td></tr><tr><td align = 'left' class='labelmsg'>Enter/Scan Tracking#</td></tr><tr><td><input type='text' class='smalltextbox' name='txttrackingno' id='txttrackingno'/></td></tr><tr><td colspan='3'></td></tr></table>"+
		"		<table>	<tr>"+
		//"				<td align = 'left'><input name='cmdSend'  class='defaultlink'   type='submit' value='Next' onclick='return validateForm();'/></td><td>"+
		"				<td>"+
		"					<input name='cmdPrevious' type='submit' value='Back (F7)'/>"+
		"				</td><td width='20px'></td>"+
		"				<td align = 'left'><input name='cmdSend' type='submit' value='Save (Ent)' onclick='return validateForm();'/></td>"+
		"			</tr>"+ 
		"		 </table>"+
		" 	</td></tr></table>"+
		"	</form>"+
		"<script type='text/javascript'>document.getElementById('txttrackingno').focus();</script>"+
		"</body>"+
		"</html>";			

		response.write(html);
	}


	else {
		nlapiLogExecution('DEBUG', 'Into Response', 'Into Response');
		var getSOInternalId;
		try
		{

			var optedField = request.getParameter('enterso');
			var optedEvent = request.getParameter('cmdPrevious');
			var SOarray=new Array();
			nlapiLogExecution('DEBUG', 'optedEvent', optedEvent);
			var vOrderType =request.getParameter('hdnTrantype');
			var getLanguage = request.getParameter('hdngetLanguage');
			SOarray["custparam_language"] = getLanguage;
			nlapiLogExecution('DEBUG', 'getLanguage', SOarray["custparam_language"]); 
			SOarray["custparam_whlocation"] = request.getParameter('hdnWhLocation');
			SOarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');
			SOarray["custparam_weight"] = request.getParameter('hdnWeight');
			SOarray["custparam_packageweight"] = request.getParameter('hdnPckgWeight');
			SOarray["custparam_shippingmethod"] = request.getParameter('hdnshippingmethod');
			SOarray["custparam_contlp"] = request.getParameter('hdnContlp');
			SOarray["custparam_soid"] = request.getParameter('hdnSoID');
			SOarray["custparam_soname"] = request.getParameter('hdnSoName');
			var whlocation = request.getParameter('custparam_whlocation');


			getSOInternalId=request.getParameter('hdnSoID');



			var context = nlapiGetContext();

			var userAccountId = context.getCompany();


			var currentUser=getCurrentUser();
			nlapiLogExecution('ERROR','currentUser', currentUser);
			nlapiLogExecution('ERROR','soId', getSOInternalId);
			var lockfilters=new Array();			
			lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getSOInternalId));			
			lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
			lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_userlocklocation',null,'anyof',whlocation));
			var lockcolumns= new Array();
			//lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_user'));
		//	lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_line'));		
			var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);
			nlapiLogExecution('ERROR','lockresults', lockresults);
			if(lockresults!=null && lockresults!='')
			{
				var getLockUser=lockresults[0].getValue('custrecord_wmsse_user');
				var getLockLine=lockresults[0].getValue('custrecord_wmsse_line');
				nlapiLogExecution('ERROR', 'getLockUser', getLockUser);
				nlapiLogExecution('ERROR', 'getLockLine', getLockLine);
				if(getLockUser!=currentUser)
				{
					SOarray["custparam_error"]='This order being processed by other user.';
					response.sendRedirect('SUITELET', 'customscript_wmsse_quickship_tracking', 'customdeploy_wmsse_quickship_tracking', false, SOarray);
					nlapiLogExecution('ERROR', 'Record Locked by another user', '');
					return;
				}

			}
			else
			{
				var LockRecord = nlapiCreateRecord('customrecord_wmsse_lockrecs');
				LockRecord.setFieldValue('name',soId);
				LockRecord.setFieldValue('custrecord_wmsse_trantype',vOrderType);
				LockRecord.setFieldValue('custrecord_wmsse_order',getSOInternalId);
				//LockRecord.setFieldValue('custrecord_wmsse_line',getSOLineNo);
				LockRecord.setFieldValue('custrecord_wmsse_lockflag','T');
				LockRecord.setFieldValue('custrecord_wmsse_user',currentUser);
				LockRecord.setFieldValue('custrecord_wmsse_userlocklocation',whlocation);
				
				var recid = nlapiSubmitRecord(LockRecord);
				nlapiLogExecution('ERROR', 'Record Locked Successfully', recid);
				LockRecord=null;
			}
			lockresults=null;
			lockcolumns=null;
			lockfilters=null;

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
			SOarray["custparam_trantype"] = request.getParameter('hdnTrantype');

			if (optedEvent == 'Back (F7)') {
				nlapiLogExecution('ERROR', 'PREVIOUS F7 Pressed');
				SOarray["custparam_error"]='';
				response.sendRedirect('SUITELET', 'customscript_wmsse_rf_quickship', 'customdeploy_wmsse_rf_quickship', false, SOarray);
			}
			else
			{


				var getTrackingNo=request.getParameter('txttrackingno');
				var getcontlpNo=request.getParameter('txtcartanno');
				nlapiLogExecution('DEBUG','getTrackingNo',getTrackingNo);
				nlapiLogExecution('DEBUG','getcontlpNo',getcontlpNo);
				var contlp=request.getParameter('hdnContlp');
				var SoId = request.getParameter('hdnSoID');
				if(getcontlpNo != null && getcontlpNo !='' && getcontlpNo != contlp)
				{
					var isValidContlp=	fnChkContainerLPExist(SoId,getcontlpNo);
					if(isValidContlp=='F')
					{
						SOarray["custparam_error"] = 'Please enter valid carton#';
						response.sendRedirect('SUITELET','customscript_wmsse_quickship_tracking', 'customdeploy_wmsse_quickship_tracking', false, SOarray);
						return; 
					}
					else
					{
						contlp= getcontlpNo;
					}
				}


				var actwght = request.getParameter('hdnWeight');
				var pakageweight = request.getParameter('hdnPckgWeight');

				var shipmethod = request.getParameter('hdnshippingmethod');
				var vcarrier='';
				fnCreateShipManifestRecord(SoId,contlp,vcarrier,getTrackingNo,actwght,pakageweight,vOrderType,shipmethod,SOarray,whlocation);
				var columnsPicktsk = new Array();
				

				var filtersPicktsk = new Array();
				filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', SoId));
				filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));//status.outbound.packcomplete
				filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));//pick task
				filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'noneof',['@NONE@'])); 				
				filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));
				var opentasksosearchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_rfquickshipdetails', filtersPicktsk, null);
				if(opentasksosearchresults!="" && opentasksosearchresults!=null)
				{	
					for(var s=0;s<opentasksosearchresults.length;s++)
					{
						var vContLPNew=opentasksosearchresults[s].getValue('custrecord_wmsse_container_lp_no',null,'group');
						var vShipMehtod=opentasksosearchresults[s].getValue('custrecord_wmsse_shipmethod',null,'group');
						var vShipMehtodText=opentasksosearchresults[s].getText('custrecord_wmsse_shipmethod',null,'group');
						var wgt='';
						var packwt='';
						if(vContLPNew != null && vContLPNew != '')
						{

							if(opentasksosearchresults[s].getValue('custrecord_wmsse_total_weight',null,'sum')!=null && opentasksosearchresults[s].getValue('custrecord_wmsse_total_weight',null,'sum')!='')
							{
								wgt=parseFloat(opentasksosearchresults[s].getValue('custrecord_wmsse_total_weight',null,'sum'));
							}
							else
							{
								wgt=parseFloat(opentasksosearchresults[s].getValue('custrecord_wmsse_containerweight',null,'sum'));
							}		
							if(opentasksosearchresults[s].getValue('custrecord_wmsse_containerweight',null,'sum')!=null && opentasksosearchresults[s].getValue('custrecord_wmsse_containerweight',null,'sum')!='')
							{
								packwt=opentasksosearchresults[s].getValue('custrecord_wmsse_containerweight',null,'sum');
							}
							SOarray["custparam_error"] = '';
							SOarray["custparam_contlp"] = vContLPNew;
							SOarray["custparam_soid"] = request.getParameter('hdnSoID');
							SOarray["custparam_soname"] =request.getParameter('hdnSoName');
							SOarray["custparam_weight"] = wgt;
							SOarray["custparam_packageweight"] = packwt;
							var searchrec=nlapiLoadRecord(vOrderType,request.getParameter('hdnSoID'));
							var vnShipMethod='';
							if(searchrec!=null && searchrec!='')
							{
								vnShipMethod=searchrec.getFieldText('shipmethod');
								nlapiLogExecution('ERROR','shipmethod',shipmethod);
							}
							nlapiLogExecution('ERROR','vShipMehtodText',vShipMehtodText);
							nlapiLogExecution('ERROR','vShipMehtod',vShipMehtod);
							if(vShipMehtodText !=null && vShipMehtodText !='' && vShipMehtodText !='null' && vShipMehtodText!='- None -')
								vnShipMethod = vShipMehtodText;
							SOarray["custparam_shippingmethod"] = vnShipMethod;
							var quickShipFlag='T';
							quickShipFlag = fnGetQuickShipFlagbyShipmethod(vShipMehtod);

							if(quickShipFlag == 'T')
							{
								response.sendRedirect('SUITELET','customscript_wmsse_quickship_tracking', 'customdeploy_wmsse_quickship_tracking', false, SOarray);
								return;
							}
							else
							{
								SOarray["custparam_error"]='';
								response.sendRedirect('SUITELET', 'customscript_wmsse_rf_quickship', 'customdeploy_wmsse_rf_quickship', false, SOarray);
								return;
							}
						}	
					}


					

				}
				else
				{
					SOarray["custparam_error"]='';
					response.sendRedirect('SUITELET', 'customscript_wmsse_rf_quickship', 'customdeploy_wmsse_rf_quickship', false, SOarray);
					return;
				}

			}

			nlapiLogExecution('DEBUG', 'Done customrecord', 'Success');
		}
		catch (e) {	
			if (e instanceof nlobjError)
				nlapiLogExecution('ERROR', 'system error', e.getCode() + '\n'
						+ e.getDetails());
			else
				nlapiLogExecution('ERROR', 'unexpected error', e.toString());
			nlapiLogExecution('ERROR', 'unexpected error', 'I am unsuccess3');


		}
		finally
		{
			
			var currentUser=getCurrentUser();
			nlapiLogExecution('ERROR','currentUser', currentUser);
			var lockfilters=new Array();			
			lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_order',null,'anyof',getSOInternalId));			
			lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_lockflag',null,'is','T'));
			lockfilters.push(new nlobjSearchFilter('custrecord_wmsse_userlocklocation',null,'anyof',whlocation));
			var lockcolumns= new Array();
		//	lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_user'));
			//lockcolumns.push(new nlobjSearchColumn('custrecord_wmsse_line'));		
			var lockresults= nlapiSearchRecord('customrecord_wmsse_lockrecs', 'customsearch_wmsse_lockrecs_srh', lockfilters, null);

			if(lockresults!=null && lockresults!='')
			{
				var lockRecordId=lockresults[0].getId();
				nlapiLogExecution('ERROR','lockRecordId', lockRecordId);

				var LockDeleteRecordId = nlapiDeleteRecord('customrecord_wmsse_lockrecs', lockRecordId);
				LockDeleteRecordId=null;
			}
			lockresults=null;
			lockcolumns=null;
			lockfilters=null;
		}

	}
}
function fnCreateShipManifestRecord(vordNo,vContLpNo,vCarrierType,vTrackingNo,vActualweight,PackageWeight,vOrderType,shipmethod,SOarray,whlocation) 
{
	try {
		nlapiLogExecution('ERROR', 'into fnCreateShipManifestRecord','from inside');		
		nlapiLogExecution('ERROR', 'Order #',vordNo);	
		nlapiLogExecution('ERROR', 'Container LP #',vContLpNo);	
		nlapiLogExecution('ERROR', 'Carrier Type',vCarrierType);	
		nlapiLogExecution('ERROR', 'vTrackingNo',vTrackingNo);
		if(vTrackingNo==null || vTrackingNo=='')
			vTrackingNo=vContLpNo;
		if (vordNo != null && vordNo != "") 
		{
			nlapiLogExecution('ERROR', 'test');
			if(fnIsContainerLpExist(vContLpNo)!='T')
			{
				nlapiLogExecution('ERROR', 'test');
				var freightterms ="";
				var otherrefnum="";
				var trantype =vOrderType
				nlapiLogExecution('ERROR', 'trantype', trantype);
				//Get the records in SalesOrder
				nlapiLogExecution('ERROR', 'SalesOrderList','');
				var  searchresults;
				if(trantype=="salesorder")
				{
					searchresults =SalesOrderList(vordNo);
				}

				else if(trantype=="transferorder")
				{
					nlapiLogExecution('ERROR', 'transferorder','');
					var filters = new Array();
					filters[0] = new nlobjSearchFilter('Internalid', null, 'is', vordNo);
					filters[1] = new nlobjSearchFilter('mainline', null, 'is', 'T');
					var columns = new Array();
					columns[0] = new nlobjSearchColumn('tranid');
					columns[1] = new nlobjSearchColumn('shipcarrier');
					columns[2] = new nlobjSearchColumn('shipaddress1');
					columns[3] = new nlobjSearchColumn('shipaddress2');
					columns[4] = new nlobjSearchColumn('shipcity');
					columns[5] = new nlobjSearchColumn('shipstate');
					columns[6] = new nlobjSearchColumn('shipcountry');
					columns[7] = new nlobjSearchColumn('shipzip');
					columns[8] = new nlobjSearchColumn('shipmethod');
					columns[9] = new nlobjSearchColumn('shipaddressee');
					columns[10] = new nlobjSearchColumn('transferlocation');

					searchresults = nlapiSearchRecord('transferorder', 'customsearch_wmsse_quickship_iddetails', filters, columns);
					nlapiLogExecution('ERROR', 'transferorder',searchresults.length);
				}
				nlapiLogExecution('ERROR', 'SalesOrderList',searchresults);

				//Get the records in customrecord_wmsse_trn_opentask
				var opentaskordersearchresult = fngetOpenTaskquickShipmentDetails(vordNo, vContLpNo,whlocation);
				nlapiLogExecution('ERROR', 'getOpenTaskDetails',opentaskordersearchresult);
				var vreference3 = "";
				var ShipManifest = nlapiCreateRecord('customrecord_wmsse_ship_manifest');
				ShipManifest.setFieldValue('custrecord_wmsse_ship_order', searchresults[0].getValue('tranid'));
				ShipManifest.setFieldValue('custrecord_wmsse_ship_orderno', searchresults[0].getValue('tranid'));
				vreference3 = searchresults[0].getValue('tranid');
				ShipManifest.setFieldValue('custrecord_wmsse_ship_carrier','QuickShip');
				ShipManifest.setFieldValue('custrecord_wmsse_ship_city',searchresults[0].getValue('shipcity'));
				ShipManifest.setFieldValue('custrecord_wmsse_ship_state',searchresults[0].getValue('shipstate'));
				ShipManifest.setFieldValue('custrecord_wmsse_ship_country',searchresults[0].getValue('shipcountry'));
				ShipManifest.setFieldValue('custrecord_wmsse_ship_addr1',searchresults[0].getValue('shipaddress1'));
				ShipManifest.setFieldValue('custrecord_wmsse_ship_trackno',vTrackingNo);
				ShipManifest.setFieldValue('custrecord_wmsse_ship_actwght',vActualweight);
				ShipManifest.setFieldValue('name',vordNo);

				//sales order specific code 
				if(trantype=="salesorder")
				{
					var contactName=searchresults[0].getText('entity');
					var entity=searchresults[0].getText('entity');
					if(contactName!=null && contactName!='')
						contactName=contactName.replace(","," ");

					if(entity!=null && entity!='')
						entity=entity.replace(","," ");

					ShipManifest.setFieldValue('custrecord_wmsse_ship_contactname',contactName);					
					ShipManifest.setFieldValue('custrecord_wmsse_ship_ordertype',searchresults[0].getText('custbody_nswmssoordertype'));
					otherrefnum=searchresults[0].getValue('otherrefnum');			 
					ShipManifest.setFieldValue('custrecord_wmsse_ship_paymethod',freightterms);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_phone',searchresults[0].getValue('custbody_customer_phone'));
					var cashondelivery= searchresults[0].getValue('custbody_wmsse_nswmscodflag');
					ShipManifest.setFieldValue('custrecord_wmsse_ship_codflag',cashondelivery);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_email',searchresults[0].getValue('email'));

					var rec= nlapiLoadRecord('salesorder', vordNo);
					var zipvalue=rec.getFieldValue('shipzip');
					var servicelevelvalue=rec.getFieldText('shipmethod');
					var consignee=rec.getFieldValue('shipaddressee');
					var shipcomplete=rec.getFieldValue('shipcomplete');
					var termscondition=rec.getFieldText('terms');

					var shiptotal="0.00";
					if((shipcomplete=="T")&&(termscondition=="C.O.D."))
					{
						ShipManifest.setFieldValue('custrecord_wmsse_ship_codflag','T');
						shiptotal=rec.getFieldValue('subtotal');
						ShipManifest.setFieldValue('custrecord_wmsse_ship_codamount',shiptotal);
					}
					else
					{
						ShipManifest.setFieldValue('custrecord_wmsse_ship_codflag','F');
						ShipManifest.setFieldValue('custrecord_wmsse_ship_codamount',shiptotal);
					}

					if(consignee!="" || consignee!=null)
						ShipManifest.setFieldValue('custrecord_wmsse_ship_consignee',consignee);
					else
						ShipManifest.setFieldValue('custrecord_wmsse_ship_consignee',entity);

					ShipManifest.setFieldValue('custrecord_wmsse_ship_servicelevel',servicelevelvalue);			
					ShipManifest.setFieldValue('custrecord_wmsse_ship_zip',zipvalue);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_ref2',otherrefnum);
				}

				var address1=searchresults[0].getValue('shipaddress1');
				var address2=searchresults[0].getValue('shipaddress2');
				var zip=searchresults[0].getValue('shipzip');
				var servicelevel=searchresults[0].getText('shipmethod');

				if(address1!=null && address1!='')
					address1=address1.replace(","," ");


				if(address2!=null && address2!='')
					address2=address2.replace(","," ");

				ShipManifest.setFieldValue('custrecord_wmsse_ship_order',vordNo);
				ShipManifest.setFieldValue('custrecord_wmsse_ship_custom5',"S");	
				ShipManifest.setFieldValue('custrecord_wmsse_ship_void',"N");

				ShipManifest.setFieldValue('custrecord_wmsse_ship_contactname',contactName);					
				ShipManifest.setFieldValue('custrecord_wmsse_ship_ordertype',searchresults[0].getText('custbody_nswmssoordertype'));
				otherrefnum=searchresults[0].getValue('otherrefnum');			 
				ShipManifest.setFieldValue('custrecord_wmsse_ship_paymethod',freightterms);

				ShipManifest.setFieldValue('custrecord_wmsse_ship_addr1',address1);
				ShipManifest.setFieldValue('custrecord_wmsse_ship_addr2',address2);

				var servicelevelList=GetSerViceLevel(vCarrierType);
				if((servicelevelList!=null)&&(servicelevelList !='')&&(servicelevelList.length>0))
				{
					vserlevel=servicelevelList[0].getValue('custrecord_wmsse_carrier_service_level'); 
					nlapiLogExecution('ERROR', 'vserlevel', vserlevel);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_servicelevel',vserlevel);
				}

				if(trantype=="transferorder")
				{
					var tolocation = searchresults[0].getValue('transferlocation');
					nlapiLogExecution('ERROR', 'tolocation', tolocation);

					var record = nlapiLoadRecord('location', tolocation);

					var shipfromaddress1=record.getFieldValue('addr1');
					var shipfromaddress2=record.getFieldValue('addr2');
					var shipfromcity=record.getFieldValue('city');
					var shipfromstate=record.getFieldValue('state');
					var shipfromzipcode =record.getFieldValue('zip');
					var shipfromcompanyname=record.getFieldValue('addressee');
					var shipfromcountry =record.getFieldValue('country');

					ShipManifest.setFieldValue('custrecord_wmsse_ship_carrier','QuickShip');
					ShipManifest.setFieldValue('custrecord_wmsse_ship_city',shipfromcity);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_state',shipfromstate);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_country',shipfromcountry);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_addr1',shipfromaddress1);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_zip',shipfromzipcode);
					ShipManifest.setFieldValue('custrecord_wmsse_ship_addr2',shipfromaddress2);
				}

				if (opentaskordersearchresult != null && opentaskordersearchresult != "")
				{
					nlapiLogExecution('ERROR', 'inside opentask search results', opentaskordersearchresult);

					var oldcontainer="";
					for (l = 0; l < opentaskordersearchresult.length; l++) 
					{ 
						var custlenght="";	
						var custheight="";
						var custwidht="";

						var sku="";
						var skuno="";
						var uomlevel=""; 
						var containerlpno = opentaskordersearchresult[l].getValue('custrecord_wmsse_container_lp_no');
						nlapiLogExecution('ERROR', 'containerlp', containerlpno);
						sku = opentaskordersearchresult[l].getText('custrecord_wmsse_sku');
						skuno = opentaskordersearchresult[l].getValue('custrecord_wmsse_sku');

						if(oldcontainer!=containerlpno){
							ShipManifest.setFieldValue('custrecord_wmsse_ship_contlp',containerlpno);
							ShipManifest.setFieldValue('custrecord_wmsse_ship_ref5',containerlpno);
							ShipManifest.setFieldValue('custrecord_wmsse_ship_ref1',sku);
							ShipManifest.setFieldValue('custrecord_wmsse_ship_ref3', vreference3);

							ShipManifest.setFieldValue('custrecord_ship_length',1);	
							ShipManifest.setFieldValue('custrecord_ship_width',1);
							ShipManifest.setFieldValue('custrecord_ship_height',1);
							ShipManifest.setFieldValue('custrecord_ship_ref2',otherrefnum);		 

							if (containerlpno != null && containerlpno != "") {

								if (PackageWeight == '0.0' || PackageWeight == '0.0000' || PackageWeight == 'undefined' || PackageWeight == '' || PackageWeight == 'NAN' || PackageWeight == 'NaN')
								{
									pakageweight='0.11';

								}

								ShipManifest.setFieldValue('custrecord_wmsse_ship_pkgwght',PackageWeight);
							}

							oldcontainer = containerlpno;

							var id=	nlapiSubmitRecord(ShipManifest, false, true);	
							nlapiLogExecution('ERROR', 'id', id);
						}
					}					
				}

				else
				{
					nlapiLogExecution('ERROR', 'unexpected error', 'I am success2');
					var id=nlapiSubmitRecord(ShipManifest, false, true);
					nlapiLogExecution('ERROR', 'id', id);
				}
			}


			else
			{
				var filter = new Array();
				filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_contlp',null,'is',vContLpNo));
				filter.push(new nlobjSearchFilter('custrecord_wmsse_ship_order',null,'anyof',vordNo));
				var columns = new Array();
				//columns[0] = new nlobjSearchColumn('custrecord_wmsse_ship_order');
				var manifestList= nlapiSearchRecord('customrecord_wmsse_ship_manifest','customsearch_wmsse_shipmanifest_details',filter,null);
				if(manifestList!=null && manifestList!='' && manifestList.length>0)
				{
					var ShipManifestRecord=nlapiLoadRecord('customrecord_wmsse_ship_manifest',manifestList[0].getId());
					ShipManifestRecord.setFieldValue('custrecord_wmsse_ship_trackno',vTrackingNo);
					ShipManifestRecord.setFieldValue('custrecord_wmsse_ship_actwght',vActualweight);
					ShipManifestRecord.setFieldValue('custrecord_wmsse_ship_masttrackno',vTrackingNo);
					ShipManifestRecord.setFieldValue('custrecord_wmsse_ship_void',"U");
					var id=nlapiSubmitRecord(ShipManifestRecord, false, true);
					nlapiLogExecution('ERROR', 'id', id);
				}

			}	
		}
	}

	catch (e) {	
		if (e instanceof nlobjError)
			nlapiLogExecution('ERROR', 'system error', e.getCode() + '\n'
					+ e.getDetails());
		else
			nlapiLogExecution('ERROR', 'unexpected error', e.toString());
		nlapiLogExecution('ERROR', 'unexpected error', 'I am unsuccess3');
		//SOarray["custparam_error"] = e.toString();
		var msgstring= e.toString();
		var msg = msgstring.substring((parseInt(msgstring.indexOf('Details:')))+8,msgstring.length-1);
		nlapiLogExecution('ERROR', 'inside catch exception', msg);
		SOarray["custparam_error"] = msg;
		response.sendRedirect('SUITELET','customscript_wmsse_quickship_tracking', 'customdeploy_wmsse_quickship_tracking', false, SOarray);
		return;
	}

	nlapiLogExecution('ERROR', 'Out of CreateShippingManifestRecord','');		
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
		nlapiLogExecution('ERROR', 'unexpected error in IsContLpExist');	
	}
	nlapiLogExecution('ERROR', 'Out of IsContLpExist',IsContLpExist);	
	//Nullify the objects.	 
	filter=null;
	columns=null;
	return IsContLpExist;
}
function fnChkContainerLPExist(SoId,vContLpNo)
{
	var isValid='T';
	var filtersPicktsk = new Array();
	filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', SoId));
	filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no',null,'is',vContLpNo));
	//filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));//status.outbound.packcomplete
	//filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));//pick task
	filtersPicktsk.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'noneof',['@NONE@'])); 
	var opentasksosearchresults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_quickship_details', filtersPicktsk, null);
	if(opentasksosearchresults=="" || opentasksosearchresults==null)
	{
		isValid='F';
	}
	return isValid;
}

/**
 * This function is used to fetch records from open task
 * @param ordernumber and containerlp
 * @returns {string}
 */
function fngetOpenTaskquickShipmentDetails(vWMSSeOrdNo, vContLpNo,whlocation) {
	nlapiLogExecution('ERROR', 'General Functions', 'In to getOpenTaskDetails');
	var filter = new Array();
	var opentaskordersearchresult = new Array();
	filter.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'is', vWMSSeOrdNo));
	filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [28])); //Status Flag - Outbound Pack Complete)		
	filter.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', [3])); //Task Type - PICK
	if (vContLpNo != null && vContLpNo != '')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'is', vContLpNo));
	if (whlocation != null && whlocation != '')
		filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whlocation));

	var columns = new Array();
	

	opentaskordersearchresult = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_quickship_details', filter, null);
	//Nullify the objects.	 
	filter=null;
	columns=null;
	return opentaskordersearchresult;
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
		nlapiLogExecution('ERROR', 'carrierrec', carrierrec.length);
		quickship=carrierrec[0].getValue('custrecord_wmsse_carrier_allow_quickship');
	}

	nlapiLogExecution('ERROR', 'Out of fnGetQuickShipFlagbyShipmethod (Output)', quickship);
	//Nullify the objects.	 
	filter=null;
	columns=null;
	return quickship;
}
