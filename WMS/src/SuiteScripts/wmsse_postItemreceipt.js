/**
 * Script Description
 * This script used to post the item receipts for selected order.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function PostItemReceipt(request, response){
	var context = nlapiGetContext();
	var sessionobj = context.getSessionObject('session');
	var user=context.getUser();
	var vConfig=nlapiLoadConfiguration('accountingpreferences');
	var itemcostruleValue=vConfig.getFieldValue('ITEMCOSTASTRNFRORDCOST');

	if (request.getMethod() == 'GET') {
		var ctx = nlapiGetContext();
		var getLanguage = ctx.getPreference('LANGUAGE');


		var POarray=new Array(); 
		POarray["custparam_whlocation"] = request.getParameter('custparam_whlocation');
		POarray["custparam_whlocationname"] = request.getParameter('custparam_whlocationname');

		var ordType = request.getParameter('custparam_ordertype');
		var trantype = request.getParameter('custparam_trantype');
		var whLocation = request.getParameter('custparam_whlocation');
		var whLocationName = request.getParameter('custparam_whlocationname');
		var po= request.getParameter('custparam_po');
		var st0,st1,st2,st3,st4,st5,st6,st7,st8,st9,st10;
		var domainName = fndomainName();
		
		var errMsg='';var err='';
		if(request.getParameter('custparam_error')!=null && request.getParameter('custparam_error')!='')
		{
			var errMsg = request.getParameter('custparam_error');
		}


		if( getLanguage == 'es_ES' || getLanguage == 'es_AR' )
		{
			st0 = domainName + "-POST ITEM RECEIPT";
			st1 = "ENTRAR ORDEN DE COMPRA / ORDEN DE TRANSFERENCIA"; 
			st2 = "RECIBO DEL ART&#205;CULO";
			st3 = "PUBLICAR";
			st4 = "ANTERIOR";	
			st5 = "Enter Container#";

		}
		else
		{
			st0 = domainName + "-Post Item Receipt";


			st1 = "Enter/Scan Transaction#";
			err = "enter/scan transaction#";


			st2 = "ITEM RECEIPT";
			st3 = "POST";
			st4 = "PREV";
			st5 = "Enter Container#";

		}
		var CSSurl='';
		var CSSfilefound = getLoadFile('NS_common.css');
		

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
		var functionkeyHtml=getFunctionkeyScriptSE('_rf_wmsse_fulfillmentmenu'); 
		var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
		"<html><head><title>" + st0 + "</title>"+
		"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
		"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
		if(CSSurl != null && CSSurl != '')
			html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
		else
			html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";


		html = html + "<script type='text/javascript'>function validateForm() {if(document.getElementById('entertranid').value == ''){document.getElementById('div_error').innerHTML ='Please "+err+" ';	return false;}else{document.getElementById('loading').style.display = ''; return true;}}</script>";
		html = html +functionkeyHtml;
		html = html +"<script type = 'text/javascript' >function preventBack(){window.history.forward();}setTimeout('preventBack()', 0);window.onunload=function(){null};</script> </head><body  onkeydown='return OnKeyDown_CL();'>";
		html = html +"	<form name='_rf_wmsse_fulfillmentmenu'  method='POST' >"+
		"<div id='loading' style='display:none;'>"+
		"<img id='loading-image' src='"+imgUrl+"' class='centerImage' alt='Processing Please Wait....' background:none></img></div>"+				
		"		<table width='100%'  >"+
		"			<tr><td class='tableheading'>Post Item Receipt</td></tr>"+
		"			<tr><td class='labelmsg'><div id='div_error'  style='color:red;display:block;' >"+errMsg+"</div></td></tr>"+

		//"			<tr><td></td></tr><tr><td></td></tr><tr><td></td></tr><tr>"+
		"				<td align = 'left' class='labelmsg'>"+ st1 + "</a>"+
		"				</td>"+
		"			</tr>"+	
		"			<tr>"+
		"				<td align = 'left'><input name='entertranid'  class='smalltextbox'  id='entertranid' type='text'/>"+
		"				</td></tr>"+
//		"<tr>"+
//		"				<td align = 'left' class='labelmsg'>"+ st5 + "</a>"+
//		"				</td>"+
//		"			</tr>"+	
//		"			<tr>"+
//		"				<td align = 'left'><input name='entercontainer'  class='smalltextbox'  id='entercontainer' type='text'/>"+
//		"				</td>"+
//		"			</tr>"+
		"			<tr><td></td></tr></table>"+		
		"			<table><tr>"+
		"				<td><input name='cmdSend1'  class='defaultlink'   type='submit' value='' onclick='return validateForm(); '/>"+
		"				<input name='cmdPrevious' type='submit' value='Back (F7)'/></td><td>"+			
		"				<input name='cmdSendPO' type='submit' value='Purchase Order' onclick='return validateForm(); '/></td>"+
		"				</td>"+		
		"			</tr><tr><td></td><td></td></tr>"+
		"			<tr>"+

		"				<td align = 'left'> <input name='cmdSendRMA' type='submit' value=' RMA      ' onclick='return validateForm(); '/></td><td>"+
		"             <input name='cmdSendTO' type='submit' value='Transfer Order' onclick='return validateForm(); '/> </td>"+
		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnordType' value='" + ordType + "'>"+
		"				<input type='hidden' name='hdnwhLocation' value=" + whLocation + ">"+
		"				<input type='hidden' name='hdnwhLocationName' value='" + whLocationName + "'>"+
		//	"				</td>"+
		"			</tr>"+
		"			<tr>"+

//		"				<td align = 'left'> <input name='cmdClose' type='submit' value='Close Container' onclick='return validateContainer(); '/></td><td>"+
//		"             <input name='cmdClosePost' type='submit' value='Close Container And Post IR' onclick='return validateContainer(); '/> </td>"+

		"				<input type='hidden' name='hdntrantype' value=" + trantype + ">"+	
		"				<input type='hidden' name='hdnordType' value='" + ordType + "'>"+
		"				<input type='hidden' name='hdnwhLocation' value=" + whLocation + ">"+
		"				<input type='hidden' name='hdnwhLocationName' value='" + whLocationName + "'>"+
		//	"				</td>"+
		"			</tr>"+
		"			<tr>"+
		"				<td align = 'left'>"+
		"				<input type='hidden' name='hdngetLanguage' value=" + getLanguage + ">"+		
		"				</td>"+
		"			</tr>"+		
		" 	</table>"+
		"	</form>"+	

		"<script type='text/javascript'>document.getElementById('entertranid').focus();</script>"+
		"</body>"+
		"</html>";

		response.write(html);
	}
	else {
		nlapiLogExecution('DEBUG', 'into', 'response');
		var POarray = new Array();
		var optedEvent = request.getParameter('cmdPrevious');

		var optedfield = request.getParameter('hdnoptedfield');

		var getLanguage = request.getParameter('custparam_language');
		
		POarray["custparam_language"]=getLanguage;
		var trantype = request.getParameter('hdntrantype');
		var ordtype = request.getParameter('hdnordType');
		POarray["custparam_ordertype"]=ordtype;
		POarray["custparam_trantype"]=trantype;
		POarray["custparam_whlocation"]=request.getParameter('hdnwhLocation');
		POarray["custparam_whlocationname"]=request.getParameter('hdnwhLocationName');
		var whLocation=request.getParameter('hdnwhLocation');
		
		var st0,st1,st2,st3,st4,st5,st6;

		if( getLanguage == 'es_ES' || getLanguage == 'es_AR' )
		{
			st0 = "POR FAVOR ENTRAR PO / A";
			st1 = "POR FAVOR ENTRAR V&#193;LIDO PO / A"; 
			st2 = "CONFIRMACI&#243;N: RECIBO DEL ART&#237;CULO PUBLICADO CON &#193XITO";
			st3 = "PUBLICAR";
			st4 = "ANTERIOR";			
			st6=  "Confirmation:Item Receipt posting has been initiated";

		}
		else
		{
			st0 = "Please enter transaction#";
			st1 = "Please enter valid transaction#"; 

			st2 = "Confirmation:Item Receipt posted successfully";
			st3 = "POST";
			st4 = "PREV";			
			st5 = "Post Item Receipt is failed";
			st6=  "Confirmation:Item Receipt posting has been initiated successfully";

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
				try
				{

					if (optedEvent == 'Back (F7)') {
						
						POarray["custparam_error"] = '';
						response.sendRedirect('SUITELET', 'customscript_wmsse_receivingmenu', 'customdeploy_wmsse_receivingmenu', false, POarray);
					}
					else {
						var tranType ='';

						var getPOid=request.getParameter('entertranid');
						var getCloseBtn=request.getParameter('cmdClose');
						var getCloseAndPostBtn=request.getParameter('cmdClosePost');
						var getContainer=request.getParameter('entercontainer');
						
						var vPoNumArray = new Array();
						if(((getCloseBtn !=null  && getCloseBtn != '' && getCloseBtn != 'null'  && getCloseBtn != 'undefined')|| (getCloseAndPostBtn!="" && getCloseAndPostBtn!= null && getCloseAndPostBtn!="null" && getCloseAndPostBtn!="undefined")) && (getContainer == null || getContainer == "" || getContainer =='null' || getContainer == 'undefined'  ))
						{							
							POarray["custparam_error"] = 'Please enter container#';
							response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
							return;
						}

						if(((getCloseBtn !=null  && getCloseBtn != '' && getCloseBtn != 'null'  && getCloseBtn != 'undefined')|| (getCloseAndPostBtn!="" && getCloseAndPostBtn!= null && getCloseAndPostBtn!="null" && getCloseAndPostBtn!="undefined")) && (getContainer != null && getContainer != "" &&  getContainer !='null' && getContainer != 'undefined'  ))
						{							
							var vValidContainer=validateContainerNum(getContainer,POarray["custparam_whlocation"]);
							var vContainerID=-1;
							if(vValidContainer == null || vValidContainer == '' || vValidContainer =="null" || vValidContainer == 'undefined')
							{
								POarray["custparam_error"] = 'Please enter valid container#';
								response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
								return;
							}
							else
							{
								vContainerID = vValidContainer[0].getId();
							}
							if((getCloseAndPostBtn!="" && getCloseAndPostBtn!= null && getCloseAndPostBtn!="null" && getCloseAndPostBtn!="undefined"))
							{
								var	vContainerDeatils = getConatinerDetails(vContainerID);

								if(vContainerDeatils !=null && vContainerDeatils!='' && vContainerDeatils!='null')
								{
									for(var f=0;f<vContainerDeatils.length;f++)
									{
										var po = vContainerDeatils[f].getText('custrecord_wmsse_order_no');
										var pono = po.split('#');
										var ponum = pono[1];
										if(vPoNumArray.indexOf(ponum) == -1)
											vPoNumArray.push(ponum);
									}
								}
							}

							
							var submitRecordId=nlapiSubmitField('customrecord_wmsse_trailer', vContainerID, 'custrecord_wmsse_trlstatus', 1);
							

							var filters=new Array();
							if(vContainerID != null && vContainerID != '')
								filters.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber', null, 'anyof', vContainerID));



							var objTrlLineResults = new nlapiSearchRecord('customrecord_wmsse_trailerline', null, filters, null);

							if(objTrlLineResults != null && objTrlLineResults != '')
							{	
								for(var i=0;i<objTrlLineResults.length;i++)
								{	

									var submitRecordId=nlapiSubmitField('customrecord_wmsse_trailerline', objTrlLineResults[i].getId(), 'custrecord_wmsse_trllinetransstatus', 1);
									
								}
							}
						}
						else
						{

							var getPOBtn=request.getParameter('cmdSendPO');					

							var getTOBtn=request.getParameter('cmdSendTO');
							var getRMABtn=request.getParameter('cmdSendRMA');

							


							if(getPOBtn!=null&&getPOBtn!="" && getPOBtn!='null')
							{					
								tranType="purchaseorder";
							}
							else if(getTOBtn!=null && getTOBtn!="" && getTOBtn!='null')
							{
								tranType="transferorder";
							}
							else if(getRMABtn!=null && getRMABtn!="" && getRMABtn!='null')
							{
								tranType="returnauthorization";
							}
							else
							{
								tranType="purchaseorder";
							}
							
							if(getPOid==null||getPOid=="")
							{							
								POarray["custparam_error"] = 'Please enter transaction#';
								response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
								return;
							}
							else
							{
								vPoNumArray.push(getPOid);
							}
						}

						if(vPoNumArray !=null && vPoNumArray!='' && vPoNumArray.length > 0)
						{
							for(var k2=0;k2 <vPoNumArray.length;k2++)
							{
								var getPOid = vPoNumArray[k2];



								var getPOBtn=request.getParameter('cmdSendPO');								

								var getTOBtn=request.getParameter('cmdSendTO');
								var getRMABtn=request.getParameter('cmdSendRMA');

								


								if(getPOBtn!=null&&getPOBtn!="" && getPOBtn!='null')
								{					
									tranType="purchaseorder";
								}
								else if(getTOBtn!=null && getTOBtn!="" && getTOBtn!='null')
								{
									tranType="transferorder";
								}
								else if(getRMABtn!=null && getRMABtn!="" && getRMABtn!='null')
								{
									tranType="returnauthorization";
								}
								else
								{
									tranType="purchaseorder";
								}
								

								var POfilters=new Array();
								POfilters.push(new nlobjSearchFilter('tranid',null,'is',getPOid));
								POfilters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
								POfilters.push(new nlobjSearchFilter('recordtype',null,'is',tranType));


								var POcols=new Array();
								
								var PORec=nlapiSearchRecord('transaction','customsearch_wmsse_transactionid_details',POfilters,null);
							
								var isSchdulescriptinvoked = 'F';
								if(PORec!=null&&PORec!='')
								{
									var poStatus=PORec[0].getValue('status');
									var poid = PORec[0].getValue('internalid');
									// tranType = PORec[0].getValue('recordtype');
									nlapiLogExecution('Debug','poStatus',poStatus);
									var poToLocationID=PORec[0].getValue('location');
									if(poToLocationID==null || poToLocationID=='')
										poToLocationID=whLocation;

									var fields = ['custrecord_wmsse_make_wh_site'];

									if(poStatus=='pendingReceipt'|| poStatus=='partiallyReceived' || poStatus=='pendingRefundPartReceived' || poStatus=='pendingBillPartReceived'|| poStatus=='pendingReceiptPartFulfilled' || poStatus=='Pending Refund/Partially Received')
									{
										var filter=new Array();
										var curuserId = getCurrentUser();

										filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname',null,'is','post item receipt scheduler'));
										filter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',null,'is',poid));										
										filter.push(new nlobjSearchFilter('isinactive',null,'is','F'));

										var column=new Array();
										column[0]=new nlobjSearchColumn('custrecord_wmsse_schprsstatus');


										var searchresult=nlapiSearchRecord('customrecord_wmsse_schscripts_status',null,filter,column);
										var status = '';
										if(searchresult!=null && searchresult!='')
										{
											status = searchresult[0].getValue('custrecord_wmsse_schprsstatus');
										}
									
										if(status != '' && status != 'Completed')
										{
											var stmsg = 'Already schedule script has been initiated for this order';
											htmlSuccessMsg(response,stmsg);
										}
										else
										{
											var useitemcostflag = '';
											if(tranType=="transferorder")
											{
												var transferordervalues=nlapiLoadRecord('transferorder', poid);
												useitemcostflag=transferordervalues.getFieldValue('useitemcostastransfercost');
												if(useitemcostflag == null || useitemcostflag == '' || useitemcostflag == 'null')
												{
													useitemcostflag = itemcostruleValue;
												}
											}
											if(tranType=="transferorder" && useitemcostflag == 'T')
											{

												var opentaskSearchResultsAll=getopentaskresultsforIRPosting(poid,null,-1,null,null);
												if(opentaskSearchResultsAll != null  && opentaskSearchResultsAll != '' && opentaskSearchResultsAll != 'null' && opentaskSearchResultsAll != 'undefined' && opentaskSearchResultsAll.length > 50)
												{


													var param = new Array();
													param['custscript_wmsse_pir_poid'] = getPOid;											
													param['custscript_wmsse_pir_trantype'] =  tranType ;
													param['custscript_wmsse_pir_container'] =  vContainerID ;
													param['custscript_wmsse_pir_location'] =  whLocation ;
													nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
													isSchdulescriptinvoked = 'T';

													var currentUserID = getCurrentUser();
													updateScheduleScriptStatus('post item receipt scheduler',currentUserID,'Submitted',poid,tranType);

												}
												if(isSchdulescriptinvoked == 'F')
												{
													try
													{
														var finalID = nswms_PostItemReceiptNew(tranType,poid,poToLocationID,getPOid,useitemcostflag);

														htmlSuccessMsg(response,st2);//To display success message
													}
													catch(e)
													{
														var errStr = '';  
														if (e instanceof nlobjError) 
														{	
															errStr = e.getDetails();
															
														}
														else
														{
															errStr = e.toString();
														}
														nlapiLogExecution('ERROR', 'exception in  details',errStr);

														POarray["custparam_error"] ="Item receipt failed. "+errStr;
														response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
														return;

													}
												}
												else
												{
													var stmsg = 'Schedule script has been initiated for this order';
													htmlSuccessMsg(response,stmsg);
												}
											}
											else
											{
												
												var opentaskSearchResults=getopentaskresultsforIRPosting(poid,vContainerID,-1,'','',whLocation);
											

												if(opentaskSearchResults != null  && opentaskSearchResults != '' && opentaskSearchResults != 'null' && opentaskSearchResults != 'undefined' && opentaskSearchResults.length > 50)
												{

													var param = new Array();
													param['custscript_wmsse_pir_poid'] = getPOid;											
													param['custscript_wmsse_pir_trantype'] =  tranType ;
													param['custscript_wmsse_pir_container'] =  vContainerID ;
													param['custscript_wmsse_pir_location'] =  whLocation ;
													nlapiScheduleScript('customscript_wmsse_postitemreceipt_sch',null,param);
													isSchdulescriptinvoked = 'T';
													var currentUserID = getCurrentUser();
													updateScheduleScriptStatus('post item receipt scheduler',currentUserID,'Submitted',poid,tranType);


												}

												if(opentaskSearchResults!=null && opentaskSearchResults!='' && opentaskSearchResults.length>0 && isSchdulescriptinvoked == 'F')
												{
													
													var crossSubsidiaryFeature = isIntercompanyCrossSubsidiaryFeatureEnabled();
													var trecord = '';
													//Transforming RMA for IntercompanySubsidiary.
													if(crossSubsidiaryFeature == true && tranType=='returnauthorization')
													{
														var subs = getSubsidiaryNew(whLocation);														
														trecord = nlapiTransformRecord(tranType, poid, 'itemreceipt',{'orderinvtsub' : subs});
													}
													else
													{
														trecord = nlapiTransformRecord(tranType, poid, 'itemreceipt');
													}

													var prossedLinesArr =  new Array();
													for(var i=0;i<opentaskSearchResults.length;i++)
													{

														var linenum=opentaskSearchResults[i][0];
														if(prossedLinesArr.indexOf(linenum)==-1)
														{
															prossedLinesArr.push(linenum);
															var actQuantity=opentaskSearchResults[i][2];
															var	itemid=opentaskSearchResults[i][1];
															var	batchno=opentaskSearchResults[i][4];								
															var	expiryDate=opentaskSearchResults[i][5];
															var	enterBin=opentaskSearchResults[i][3];
															var	serialArray=opentaskSearchResults[i][6];
															generateItemReceipt(trecord,actQuantity,linenum,itemid,tranType,batchno,expiryDate,poToLocationID,
																	enterBin,serialArray,opentaskSearchResults,tranType,poid);

														}
													}
													if(trecord != null && trecord != '')
													{
														idl = nlapiSubmitRecord(trecord);
													}
													nlapiLogExecution('Debug','idl',idl);
													if(idl!=null && idl!='')
													{									 
														for(var j=0;j<opentaskSearchResults.length;j++)
														{
															var opentaskId =opentaskSearchResults[j][7];
															var fields = new Array();
															var values = new Array();

															fields[0] = 'custrecord_wmsse_nsconfirm_ref_no';
															fields[1] = 'name';
															values[0] = idl;
															values[1] = opentaskId;
															nlapiSubmitField('customrecord_wmsse_trn_opentask', opentaskId, fields, values);
														}

														if(vContainerID != null && vContainerID != '')
														{
															var filters=new Array();

															filters.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber', null, 'anyof', vContainerID));
															if(poid != null && poid != '')
																filters.push(new nlobjSearchFilter('custrecord_wmsse_trllinepono', null, 'anyof', poid));


															var objTrlLineResults = new nlapiSearchRecord('customrecord_wmsse_trailerline', null, filters, null);

															if(objTrlLineResults != null && objTrlLineResults != '')
															{	
																for(var i=0;i<objTrlLineResults.length;i++)
																{	

																	var submitRecordId=nlapiSubmitField('customrecord_wmsse_trailerline', objTrlLineResults[i].getId(), 'custrecord_wmsse_trllineitemreceipt', idl);
																	nlapiLogExecution('Debug', 'submitRecordId', submitRecordId);
																}
															}
														}

														if(k2 == (vPoNumArray.length -1) )
														{
															htmlSuccessMsg(response,st2);
														}
													}

												}
												else if(isSchdulescriptinvoked == 'T')
												{
													var stmsg = 'Schedule script has been initiated for this order';
													htmlSuccessMsg(response,stmsg);
												}
												else{

													if(tranType=='purchaseorder')
													{
														POarray["custparam_error"] = "Please enter valid purchase order#";
														response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
														return;	
													}
													else if(tranType=='transferorder')
													{
														POarray["custparam_error"] = "Please enter valid transfer order#";
														response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
														return;	
													}
													else if(tranType=='returnauthorization')
													{
														POarray["custparam_error"] = "Please enter valid return authorization#";
														response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
														return;	
													}
													else
													{
														POarray["custparam_error"] = "Please enter valid purchase order#";
														response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
														return;	
													}
												}
											}
										}
									}
									else
									{
										if(poStatus=='pendingBilling' || poStatus=='pendingRefund' || poStatus=='received')
										{
											if(tranType=='purchaseorder')
											{
												POarray["custparam_error"] = "Item receipt has been already posted successfully for this PO# "+getPOid+ " ";
											}
											else if(tranType=='transferorder')
											{
												POarray["custparam_error"] = "Item receipt has been already posted successfully for this TO# "+getPOid+ " ";
											}
											else if(tranType=='returnauthorization')
											{
												POarray["custparam_error"] = "Item receipt has been already posted successfully for this RMA# "+getPOid+ " ";
											}
											else
											{
												POarray["custparam_error"] = "Item receipt has been already posted successfully for this PO# "+getPOid+ " ";
											}


											//POarray["custparam_error"] = "Item receipt has been already posted successfully for the PO# "+getPOid+" ";
										}
										else
										{
											if(tranType=='purchaseorder')
											{
												POarray["custparam_error"] = "Please enter valid purchase order#";												
											}
											else if(tranType=='transferorder')
											{
												POarray["custparam_error"] = "Please enter valid transfer order#";													
											}
											else if(tranType=='returnauthorization')
											{
												POarray["custparam_error"] = "Please enter valid return authorization#";												
											}
											else
											{
												POarray["custparam_error"] = "Please enter valid purchase order#";												
											}
										}

										response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
										return;
									}
								}

							}
							if(PORec==null || PORec=='' || PORec=='null')								
							{
								if(tranType=='purchaseorder')
								{
									POarray["custparam_error"] = "Please enter valid purchase order#";
									response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
									return;	
								}
								else if(tranType=='transferorder')
								{
									POarray["custparam_error"] = "Please enter valid transfer order#";
									response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
									return;	
								}
								else if(tranType=='returnauthorization')
								{
									POarray["custparam_error"] = "Please enter valid return authorization#";
									response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
									return;	
								}
								else
								{
									POarray["custparam_error"] = "Please enter valid purchase order#";
									response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
									return;	
								}

							}
						}
						else
						{
							POarray["custparam_error"] = st0;
							response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
							return;
						}
					}
				}
				catch (e)  {
					
					var errStr = '';  
					if (e instanceof nlobjError) 
					{	
						errStr = e.getDetails();
						nlapiLogExecution('ERROR', 'into if',errStr);
					}
					else
					{
						errStr = e.toString();
					}
					POarray["custparam_error"] ="Item receipt failed. "+errStr;
					response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
					return;
				} finally {					
					nlapiLogExecution('DEBUG', 'finally','block');				
				}
			}
			catch(e)
			{
				
				var errStr = '';  
				if (e instanceof nlobjError) 
				{	
					errStr = e.getDetails();
					nlapiLogExecution('ERROR', 'into if',errStr);
				}
				else
				{
					errStr = e.toString();
				}
				POarray["custparam_error"] = msg;
				response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
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
			response.sendRedirect('SUITELET', 'customscript_wmsse_post_itemreceipt', 'customdeploy_wmsse_post_itemreceipt', false, POarray);
			return;
		}

	}
	
} 



function generateItemReceipt(trecord,ActQuantity,linenum,itemid,trantype,batchno,expiryDate,templocation,enterBin,serialArray,opentaskSearchResults,
		tranType,poid)
{
	try {

		var compSubRecord=null;
		var polinelength = trecord.getLineItemCount('item');
		

		var idl;
		var vAdvBinManagement=true;
		var whLocation='';

		var tempSerial = "";		
		var commitflag = 'N';
		for (var j = 1; j <= polinelength; j++) {


			var item_id = trecord.getLineItemValue('item', 'item', j);
			var itemrec = trecord.getLineItemValue('item', 'itemreceive', j);
			var itemLineNo = trecord.getLineItemValue('item', 'line', j);			
			var quantity = '0';
			quantity = ActQuantity;



			var inventorytransfer="";

			if (itemLineNo == linenum) {

				var totallineQty=0;
				for(var r=0;r<opentaskSearchResults.length;r++)
				{

					var opentaskLinenum=opentaskSearchResults[r][0];
					if(opentaskLinenum == linenum)
					{
						var actlineQuantity=opentaskSearchResults[r][2];
						totallineQty = Big(totallineQty).plus(actlineQuantity); 
						nlapiLogExecution('DEBUG', 'totallineQty', totallineQty);

					}
				}

				whLocation=trecord.getLineItemValue('item', 'location', j);//value
				if(whLocation==null||whLocation=="")
					whLocation=templocation;
				commitflag = 'Y';

				var fields = ['recordType'];
				var columns = nlapiLookupField('item', itemid, fields);
				if(columns != null && columns != '')
				{
					Itype = columns.recordType;	

				}

				trecord.selectLineItem('item', j);
				trecord.setCurrentLineItemValue('item', 'itemreceive', 'T');
				trecord.setCurrentLineItemValue('item', 'quantity', Number(Big(totallineQty).toFixed(5)));
				trecord.setCurrentLineItemValue('item', 'location', whLocation);


				if (Itype == "serializedinventoryitem" || Itype == "serializedassemblyitem" || Itype == "lotnumberedinventoryitem" || Itype=="lotnumberedassemblyitem" || Itype == "inventoryitem" || Itype == "assemblyitem") 
				{

					var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');

					if(compSubRecord=='' || compSubRecord==null)
					{

						compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');

					}



					var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
					if(parseInt(complinelength)>0)
					{
						for(var r1=1;r1<=complinelength;r1++)
						{ 
							compSubRecord.removeLineItem('inventoryassignment', 1);
						}
					}

				}

				if ((Itype == "serializedinventoryitem" || Itype == "serializedassemblyitem" )) 
				{		
					for(var r3=0;r3<opentaskSearchResults.length;r3++)
					{

						var opentaskLinenumber=opentaskSearchResults[r3][0];											

						if(opentaskLinenumber == linenum)
						{
							var opentaskQuantity=opentaskSearchResults[r3][2];
							var opentaskBin=opentaskSearchResults[r3][3];
							var	opentaskserialArray=opentaskSearchResults[r3][6];
							var	vInvStatus_select=opentaskSearchResults[r3][9];

							var totalSerialArray=opentaskserialArray.split(',');

							for (var k1 = 0; k1 < totalSerialArray.length; k1++) 
							{
								compSubRecord.selectNewLineItem('inventoryassignment');
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', totalSerialArray[k1]);
								if(enterBin!=null && enterBin!="" && enterBin!='null')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', opentaskBin);
								if(vInvStatus_select!=null && vInvStatus_select!="" && vInvStatus_select!='null' && vInvStatus_select!='undefined')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInvStatus_select);
								compSubRecord.commitLineItem('inventoryassignment');
							}
						}

					}

					var filterssertemp1 = new Array();
					var serialArray='';
					filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');
					filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseFloat(linenum));
					filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', poid);
					var columnssertemp1 = new Array();
					//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
					//columnssertemp1[1] = new nlobjSearchColumn('name');
					var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,null);
					if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
					{					
						for (var j3 = 0; j3 < SrchRecordTmpSerial1.length; j3++) 
						{
							var TempRecord=SrchRecordTmpSerial1[j3];
							var vid = TempRecord.getId();

							var fields = new Array();
							var values = new Array();

							fields[0] = 'custrecord_wmsse_ser_note1';
							values[0] = 'because of serial number is updated in opentask we have marked this serial number as closed';
							fields[1] = 'custrecord_wmsse_ser_status';
							values[1] = 'T';

							nlapiSubmitField('customrecord_wmsse_serialentry', vid, fields, values);							

						}



					}



				}							
				else 
					if ((Itype == "lotnumberedinventoryitem" || Itype=="lotnumberedassemblyitem")) {
						for(var r2=0;r2<opentaskSearchResults.length;r2++)
						{

							var opentaskLinenumber=opentaskSearchResults[r2][0];

							if(opentaskLinenumber == linenum)
							{
								var opentaskQuantity=opentaskSearchResults[r2][2];
								var opentaskBin=opentaskSearchResults[r2][3];
								var	opentaskBatchno=opentaskSearchResults[r2][4];								
								var	opentaskExpiryDate=opentaskSearchResults[r2][5];
								var	vInvStatus_select=opentaskSearchResults[r2][9];
								var complinelength = compSubRecord.getLineItemCount('inventoryassignment');
								compSubRecord.selectNewLineItem('inventoryassignment');
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', opentaskQuantity);
								if(enterBin!=null && enterBin!="" && enterBin!='null')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', opentaskBin);
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', opentaskBatchno);		
								if(opentaskExpiryDate!=null && opentaskExpiryDate!="" && opentaskExpiryDate!='null')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'expirationdate', opentaskExpiryDate);
								if(vInvStatus_select!=null && vInvStatus_select!="" && vInvStatus_select!='null' && vInvStatus_select!='undefined')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInvStatus_select);
								compSubRecord.commitLineItem('inventoryassignment');

							}
						}

					}
					else if (Itype == "inventoryitem" || Itype == "assemblyitem") 
					{	

						for(var r1=0;r1<opentaskSearchResults.length;r1++)
						{

							var opentaskLinenumber=opentaskSearchResults[r1][0];
							if(opentaskLinenumber == linenum)
							{
								var opentaskQuantity=opentaskSearchResults[r1][2];
								var opentaskBin=opentaskSearchResults[r1][3];
								var vInvStatus_select=opentaskSearchResults[r1][9];
								compSubRecord.selectNewLineItem('inventoryassignment');						
								compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', opentaskQuantity);
								if(enterBin!=null && enterBin!="" && enterBin!='null')
								{
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', opentaskBin);
								}
								if(vInvStatus_select!=null && vInvStatus_select!="" && vInvStatus_select!='null' && vInvStatus_select!='undefined')
									compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', vInvStatus_select);
								compSubRecord.commitLineItem('inventoryassignment');
							}
						}
					}
					else
					{

					}
				if(trecord!=null  && trecord!='')
				{
					nlapiLogExecution('ERROR', " committing linenum(Task)", linenum);

					if(compSubRecord!=null)
						compSubRecord.commit();
					trecord.commitLineItem('item');

					break;
				}
			}


		}
		if (commitflag == 'N' && trecord != null && trecord != '') {
			nlapiLogExecution('ERROR', 'commitflag is N', commitflag);
			trecord.selectLineItem('item', j);
			trecord.setCurrentLineItemValue('item', 'itemreceive', 'F');
			trecord.commitLineItem('item');
		}
	}
	catch(exp)
	{

		if (exp instanceof nlobjError) 
			nlapiLogExecution('ERROR', 'system error', exp.getCode() + '\n' + exp.getDetails());
		else 
			nlapiLogExecution('ERROR', 'unexpected error', exp.toString());

	}	
}


function validateContainerNum(containernumber,whLocation)
{
	var filters = new Array();	
	if(containernumber!=null && containernumber!='' && containernumber!='null' && containernumber!='undefined')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_appointmenttrailer', null, 'is', containernumber));
	if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sitetrailer', null, 'anyof', whLocation));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_trlstatus', null, 'noneof', '4'));//Not 4=closed

	var vcolumns = new Array();
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_appointmenttrailer'));	
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_sitetrailer'));

	var ContainerDetails = nlapiSearchRecord('customrecord_wmsse_trailer',null, filters, vcolumns);
	return ContainerDetails;
}

function getConatinerDetails(containernumber)
{
	var inboundcontainrfilters = new Array();
	if(containernumber!=null && containernumber!='' && containernumber!='null' && containernumber!='undefined')
		inboundcontainrfilters.push(new nlobjSearchFilter('custrecord_wmsse_inboundcontainer', null, 'anyof', containernumber));
	/*if(Orderinternalid!=null && Orderinternalid!='')
		inboundcontainrfilters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', Orderinternalid));*/
	inboundcontainrfilters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [3]));
	inboundcontainrfilters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));

	var inboundcolumns=new Array();
	inboundcolumns[0]=new nlobjSearchColumn('name');
	inboundcolumns[1]=new nlobjSearchColumn('custrecord_wmsse_order_no');	
	inboundcolumns[2]=new nlobjSearchColumn('custrecord_wmsse_inboundcontainer');

	var containeropentaskSearchResults=nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,inboundcontainrfilters,inboundcolumns);
	return containeropentaskSearchResults;
	/*var filters = new Array();	
	if(containernumber!=null && containernumber!='' && containernumber!='null' && containernumber!='undefined')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_trlnumber', null, 'is', containernumber));
	if(whLocation!=null && whLocation!='' && whLocation!='null' && whLocation!='undefined')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_trllinelocation', null, 'anyof', whLocation));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_trllinetransstatus', null, 'noneof', '4'));//Not 4=closed


	var vcolumns = new Array();
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trlnumber'));	
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepono'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllinepolineno'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllineordqty'));
	vcolumns.push(new nlobjSearchColumn('custrecord_wmsse_trllineexpqty'));

	var ContainerDetails = nlapiSearchRecord('customrecord_wmsse_trailerline',null, filters, vcolumns);
	return ContainerDetails;*/
}

//To post Item receipts for transfer order when Use Item cost as Transfer cost flag is enabled
function nswms_PostItemReceiptNew(trantype,toInternalId,whLocation,poname,useitemcostflag)
{
	var logMsg = 'trantype = ' + trantype + '<br>';	
	logMsg = logMsg + 'toInternalId = ' + toInternalId + '<br>';	
	logMsg = logMsg + 'whLocation = ' + whLocation + '<br>';	
	logMsg = logMsg + 'poname = ' + poname + '<br>';
	logMsg = logMsg + 'useitemcostflag = ' + useitemcostflag + '<br>';
	nlapiLogExecution('Debug', 'Processing nswms_PostItemReceipt', logMsg);

	var idl="";
	var vCurrCompRecLine=0;
	var itemindex=1;

	var lineFullQty=0;
	var filters = new Array();
	var trecord = '';
	if(toInternalId!=null && toInternalId!= 'null' && toInternalId!= undefined && toInternalId != '')
		filters.push(new nlobjSearchFilter('internalid', null, 'is',toInternalId));
	filters.push(new nlobjSearchFilter('formulatext', null, 'is', 'Shipping').setFormula("decode({type},'Transfer Order',{transactionlinetype},'Shipping')"));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', 'TrnfrOrd'));

	var TOLineDetailsNew = new nlapiSearchRecord('transferorder','customsearch_wmsse_transf_fulfill_detail',filters,null);
	

	var vitemfulfillmentid = '';

	if(TOLineDetailsNew!=null && TOLineDetailsNew!= 'null' && TOLineDetailsNew!= undefined && TOLineDetailsNew != ''&& TOLineDetailsNew.length>0)
	{
		var TOLineDetails = new Array();
		
		var remainingqty=0;
		for (var d = 0; d < TOLineDetailsNew.length; d++)
		{
			try
			{

				vitemfulfillmentid = TOLineDetailsNew[d].getValue('internalid','fulfillingTransaction','group');

				vitemfulfillmentitemid = TOLineDetailsNew[d].getValue('item','fulfillingTransaction','group');

				vitemfulfillmentqty = TOLineDetailsNew[d].getValue('quantity','fulfillingTransaction','sum');


				if(vitemfulfillmentid!=null && vitemfulfillmentid!= 'null' && vitemfulfillmentid!= undefined && vitemfulfillmentid != '' && TOLineDetails.indexOf(parseInt(vitemfulfillmentid)) == -1)
				{
					TOLineDetails.push(parseInt(vitemfulfillmentid));
				}
			}
			catch(e)
			{
				nlapiLogExecution('ERROR', 'exception in fulfillment details');
			}
		}
	}
	var vitemfulfillmentid = '';
	//var qtyEntered = enterQty;
	if(TOLineDetails!=null && TOLineDetails!= 'null' && TOLineDetails!= undefined && TOLineDetails != ''&& TOLineDetails.length>0)
	{
		
		var remainingqty=0;

	
		for (var d = 0; d < TOLineDetails.length; d++)
		{
			try
			{

				vitemfulfillmentid = TOLineDetails[d];
				var openTaskIdArr = new Array();


				if(vitemfulfillmentid!=null && vitemfulfillmentid!= 'null' && vitemfulfillmentid!= undefined && vitemfulfillmentid != '')
				{
					trecord = nlapiTransformRecord(trantype, toInternalId, 'itemreceipt',{'itemfulfillment' : vitemfulfillmentid});


					var tolinelength = trecord.getLineItemCount('item');

					for (var j = 0; j < tolinelength; j++)
					{
						var item_id = trecord.getLineItemValue('item', 'item', j+1);
						var itemrec = trecord.getLineItemValue('item', 'itemreceive', j+1);
						var itemLineNo = trecord.getLineItemValue('item', 'line', j+1);
						var itemQuantity = trecord.getLineItemValue('item', 'quantity', j+1);


						var opentaskSearchResults=getopentaskresultsforIRPosting(toInternalId,null,-1,item_id,itemLineNo);

						if(opentaskSearchResults!=null && opentaskSearchResults!='' && opentaskSearchResults.length>0)
						{
							var totalLineQty = 0;
							for(var tempItr = 0; tempItr < opentaskSearchResults.length; tempItr++)
							{
								var enterQty = opentaskSearchResults[tempItr][2];
								var toLineno = opentaskSearchResults[tempItr][0];

								if(parseFloat(toLineno) == parseFloat(itemLineNo))
									totalLineQty = Number(Big(totalLineQty).plus(enterQty));


							}

							for(var t=0; t<opentaskSearchResults.length;t++)
							{
								var enterQty = opentaskSearchResults[t][2];
								var toLineno = opentaskSearchResults[t][0];
								var enterBin = opentaskSearchResults[t][3];
								var batchno = opentaskSearchResults[t][4];
								var expiryDate = opentaskSearchResults[t][5];
								var FetchedItemId = opentaskSearchResults[t][1];
								var whLocation = opentaskSearchResults[t][8];
								var itemStatus = opentaskSearchResults[t][9];
								var serialNumber = opentaskSearchResults[t][6];

								var itemType = '';
								var fields = ['recordType'];
								var columns = nlapiLookupField('item', FetchedItemId, fields);
								if(columns != null && columns != '')
								{
									itemType = columns.recordType;	

								}								
								var enterQty1 =0;
								if ((parseInt(itemLineNo) ==  parseInt(toLineno)) && ((parseFloat(itemQuantity) == parseFloat(enterQty)) || (parseFloat(itemQuantity) == parseFloat(totalLineQty))))
								{
									openTaskIdArr.push(opentaskSearchResults[t][7]);
									itemindex=j+1;								
									enterQty1 = parseFloat(itemQuantity);



									trecord.selectLineItem('item', itemindex);
									trecord.setCurrentLineItemValue('item', 'itemreceive', 'T');


									if (itemType == "lotnumberedinventoryitem" || itemType=="lotnumberedassemblyitem") 
									{			

										if(itemStatus != null && itemStatus != '')
										{
											var frecord = nlapiLoadRecord('itemfulfillment', vitemfulfillmentid);
											frecord.selectLineItem('item',itemindex);
											var fulfillSubRecord = frecord.viewCurrentLineItemSubrecord('item','inventorydetail');

											var polinelength =0;
												
											if(fulfillSubRecord!=null && fulfillSubRecord!=''&& fulfillSubRecord!='null')
											polinelength = fulfillSubRecord.getLineItemCount('inventoryassignment');
											
											var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
											nlapiLogExecution('DEBUG', 'compSubRecord', compSubRecord);
											if(compSubRecord=='' || compSubRecord==null)
											{

												compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');

												var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

												if(parseInt(complinelength)>0)
												{
													for(var r1=1;r1<=complinelength;r1++)
													{ 
														compSubRecord.removeLineItem('inventoryassignment', 1);
													}
												}
											}

											compSubRecord.selectNewLineItem('inventoryassignment');
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', enterQty);

											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
											if(enterBin!=null && enterBin!="" && enterBin!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

											if(expiryDate!=null && expiryDate!="" && expiryDate!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'expirationdate', expiryDate);

											if(itemStatus != null && itemStatus != '' && itemStatus != undefined)
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', itemStatus);

											compSubRecord.commitLineItem('inventoryassignment');
											if(t+1 == polinelength)
											{
												compSubRecord.commit();
												trecord.commitLineItem('item');
												break;
											}

										}
										else
										{
											var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
											nlapiLogExecution('DEBUG', 'compSubRecord', compSubRecord);
											if(compSubRecord=='' || compSubRecord==null)
											{

												compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');

												var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

												if(parseInt(complinelength)>0)
												{
													for(var r1=1;r1<=complinelength;r1++)
													{ 
														compSubRecord.removeLineItem('inventoryassignment', 1);
													}
												}
											}

											compSubRecord.selectNewLineItem('inventoryassignment');
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', enterQty1);

											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', batchno);
											if(enterBin!=null && enterBin!="" && enterBin!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

											if(expiryDate!=null && expiryDate!="" && expiryDate!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'expirationdate', expiryDate);


											compSubRecord.commitLineItem('inventoryassignment');
											compSubRecord.commit();

										}
									}
									else if (itemType == "inventoryitem" || itemType == "assemblyitem")
									{
										
										if(itemStatus != null && itemStatus != '')
										{
											var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
											nlapiLogExecution('DEBUG', 'compSubRecord', compSubRecord);
											if(compSubRecord=='' || compSubRecord==null)
											{

												compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');

												var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

												if(parseInt(complinelength)>0)
												{
													for(var r1=1;r1<=complinelength;r1++)
													{ 
														compSubRecord.removeLineItem('inventoryassignment', 1);
													}
												}
											}

											compSubRecord.selectNewLineItem('inventoryassignment');
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', enterQty);

											if(enterBin!=null && enterBin!="" && enterBin!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

											if(itemStatus != null && itemStatus != '' && itemStatus != undefined)
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', itemStatus);

											compSubRecord.commitLineItem('inventoryassignment');
											if(t == (opentaskSearchResults.length - 1))
											{
												compSubRecord.commit();
												trecord.commitLineItem('item');
											}
										}
										else
										{
											var compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');
											var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

											nlapiLogExecution('ERROR', 'complinelength,vCurrCompRecLine', complinelength+','+vCurrCompRecLine);

										if(parseInt(complinelength)>0 && parseInt(complinelength)-parseInt(vCurrCompRecLine)>=0)
												compSubRecord.selectLineItem('inventoryassignment',parseInt(vCurrCompRecLine)+1);
											else
												compSubRecord.selectNewLineItem('inventoryassignment');
										//vCurrCompRecLine=parseInt(vCurrCompRecLine)+1;
											compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', enterQty1);

											if(enterBin!=null && enterBin!="" && enterBin!='null')
												compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

											compSubRecord.commitLineItem('inventoryassignment');
											compSubRecord.commit();
										}

									}
									else if (itemType == "serializedinventoryitem" || itemType=="serializedassemblyitem") 
									{
										if(itemStatus != null && itemStatus != '')
										{
											var filterssertemp1 = new Array();

											filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
											filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseFloat(toLineno));										
											filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', toInternalId);
											var columnssertemp1 = new Array();
											//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
											//columnssertemp1[1] = new nlobjSearchColumn('name');
											var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,null);
											if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
											{
											
												var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
												nlapiLogExecution('DEBUG', 'compSubRecord', compSubRecord);
												if(compSubRecord=='' || compSubRecord==null)
												{

													compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');

													var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

													if(parseInt(complinelength)>0)
													{
														for(var r2=1;r2<=complinelength;r2++)
														{ 
															compSubRecord.removeLineItem('inventoryassignment', 1);
														}
													}
												}

												var transerresultvalues = [];
												if(serialNumber != null && serialNumber != '')
													transerresultvalues = serialNumber.split(',');

												if(transerresultvalues != null && transerresultvalues != 'null' && transerresultvalues != '' && transerresultvalues.length > 0)
												{
													for(var n = 0; n < transerresultvalues.length; n++) 
													{												
														compSubRecord.selectNewLineItem('inventoryassignment');
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', transerresultvalues[n]);
														if(enterBin!=null && enterBin!="" && enterBin!='null')
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);

														if(itemStatus != null && itemStatus != '' && itemStatus != undefined)
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'inventorystatus', itemStatus);

														compSubRecord.commitLineItem('inventoryassignment');
													}
												}
												compSubRecord.commit();
												
												for (var j1 = 0; j1 < SrchRecordTmpSerial1.length; j1++) {
													var TempRecord=SrchRecordTmpSerial1[j1];

													var vid = TempRecord.getId();

													var fields = new Array();
													var values = new Array();

													fields[0] = 'customrecord_wmsse_serialentry';

													values[0] = idl;
													fields[1]='name';
													fields[2]='custrecord_wmsse_ser_note1';
													fields[3]='custrecord_wmsse_ser_status';
													values[1] = TempRecord.getValue('name');
													values[2]='because of item receipt posted for serial number  we have marked this serial number as closed';
													values[3]='T';
													nlapiSubmitField('customrecord_wmsse_serialentry', vid, fields, values);

												}
											}

											trecord.commitLineItem('item');

										}
										else
										{
											var filterssertemp1 = new Array();

											filterssertemp1[0] = new nlobjSearchFilter('custrecord_wmsse_ser_status', null, 'is', 'F');										
											filterssertemp1[1] = new nlobjSearchFilter('custrecord_wmsse_ser_ordline', null, 'equalto', parseFloat(toLineno));										
											filterssertemp1[2] = new nlobjSearchFilter('custrecord_wmsse_ser_ordno', null, 'anyof', toInternalId);
											var columnssertemp1 = new Array();
											//columnssertemp1[0] = new nlobjSearchColumn('custrecord_wmsse_ser_no');
											//columnssertemp1[1] = new nlobjSearchColumn('name');
											var SrchRecordTmpSerial1 = nlapiSearchRecord('customrecord_wmsse_serialentry', 'customsearch_wmsse_serialentry_details', filterssertemp1,null);
											if(SrchRecordTmpSerial1!=null && SrchRecordTmpSerial1!="")
											{
												
												var compSubRecord = trecord.editCurrentLineItemSubrecord('item','inventorydetail');
												nlapiLogExecution('DEBUG', 'compSubRecord', compSubRecord);
												if(compSubRecord=='' || compSubRecord==null)
												{

													compSubRecord = trecord.createCurrentLineItemSubrecord('item','inventorydetail');

													var complinelength = compSubRecord.getLineItemCount('inventoryassignment');

													if(parseInt(complinelength)>0)
													{
														for(var r2=1;r2<=complinelength;r2++)
														{ 
															compSubRecord.removeLineItem('inventoryassignment', 1);
														}
													}
												}


												var transerresultvalues = new Array();
												var tranfilter = new Array();

												if(toInternalId !=null && toInternalId != 'null' && toInternalId != undefined && toInternalId != '')
													tranfilter.push(new nlobjSearchFilter('internalid', null, 'is',toInternalId));

												tranfilter.push(new nlobjSearchFilter('item',null, 'is',FetchedItemId));


												var fline = (parseFloat(toLineno)-1);
												
												tranfilter.push(new nlobjSearchFilter('line',null, 'equalto',fline));											

												var tranlotresults = nlapiSearchRecord('transferorder','customsearch_wmsse_transf_ful_lot_detail',tranfilter,null);											
												

												for(var z = 0; z < tranlotresults.length; z++)
												{
													var seritemfulfillmentid = tranlotresults[z].getValue('internalid','fulfillingTransaction','group');

													if(seritemfulfillmentid == vitemfulfillmentid)
														transerresultvalues.push(tranlotresults[z].getValue('serialnumber','fulfillingTransaction','group')); 
												}

												if(transerresultvalues != null && transerresultvalues != 'null' && transerresultvalues != '' && transerresultvalues.length > 0)
												{
													for (var n = 0; n < transerresultvalues.length; n++) 
													{												

														compSubRecord.selectNewLineItem('inventoryassignment');
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
														compSubRecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', transerresultvalues[n]);
														if(enterBin!=null && enterBin!="" && enterBin!='null')
															compSubRecord.setCurrentLineItemValue('inventoryassignment', 'binnumber', enterBin);
														compSubRecord.commitLineItem('inventoryassignment');
													}

												}
												compSubRecord.commit();

												for (var j1 = 0; j1 < SrchRecordTmpSerial1.length; j1++) 
												{
													var TempRecord=SrchRecordTmpSerial1[j1];

													var vid = TempRecord.getId();

													var fields = new Array();
													var values = new Array();

													fields[0] = 'customrecord_wmsse_serialentry';

													values[0] = idl;
													fields[1]='name';
													fields[2]='custrecord_wmsse_ser_note1';
													fields[3]='custrecord_wmsse_ser_status';
													values[1] = TempRecord.getValue('name');
													values[2]='because of item receipt posted for serial number  we have marked this serial number as closed';
													values[3]='T';
													nlapiSubmitField('customrecord_wmsse_serialentry', vid, fields, values);

												}
											}


										}
										trecord.commitLineItem('item');
									}
									if(itemStatus == null || itemStatus == '')
										trecord.commitLineItem('item');
								}
							}
						}
					}
					if(trecord != null && trecord != '')
						idl = nlapiSubmitRecord(trecord);	
					nlapiLogExecution('ERROR', 'Item Receipt Id',idl);

					if(idl != null && idl != '')
					{
						
						for(var q=0; q<openTaskIdArr.length;q++)
						{
							var vid = openTaskIdArr[q];

							var fields = new Array();
							var values = new Array();

							fields[0] = 'custrecord_wmsse_nsconfirm_ref_no';

							values[0] = idl;

							nlapiSubmitField('customrecord_wmsse_trn_opentask', vid, fields, values);
						}
					}
				}
			}
			catch(e)
			{
				var errStr = '';  
				if (e instanceof nlobjError) 
				{	
					errStr = e.getDetails();
					nlapiLogExecution('ERROR', 'into if',errStr);
				}
				else
				{
					errStr = e.toString();
				}
				nlapiLogExecution('ERROR', 'exception in fulfillment details',errStr);
			}
		}					
	}

	return idl;
}


function htmlSuccessMsg(response,st2)
{
	var CSSurl='';
	var CSSfilefound = getLoadFile('NS_common.css');
	
	var whLocation=request.getParameter('hdnwhLocation');
	var whLocationName=request.getParameter('hdnwhLocationName');
	if (CSSfilefound) 
	{ 

		CSSurl = CSSfilefound.getURL();
		

	}
	var domainName = fndomainName();
	
	var titlename = domainName + '-Post Item Receipt';
	CSSurl=CSSurl.replace(/&/g,"&amp;");
	var functionkeyHtml=getFunctionkeyScriptSE('_rf_postitemreceipt');
	var html = "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01//EN' 'http://www.w3.org/TR/html4/strict.dtd'>" +
	"<html><head><title>" + titlename + " </title>"+
	"<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>"+
	"<meta http-equiv='X-UA-Compatible' content='IE=9' />";
	if(CSSurl != null && CSSurl != '')
		html = html + "<link href='" + CSSurl + "' type='text/css' rel='stylesheet'>";
	else
		html = html + "<link href='" + nlapiEscapeXML("https://system.na1.netsuite.com/c.TSTDRV909212/suitebundle19241/NS_common.css") + "' type='text/css' rel='stylesheet'>";


	html = html +"<html><head><title>Post Item Receipt</title>";
	//  html = html +"<html><head><title>WMS Lite-Post Item Receipt</title>";
	html = html + "<meta name='viewport' content='width=device-width, height=device-height, initial-scale=1.0'>";
	html = html + "<SCRIPT LANGUAGE='javascript' for='window' EVENT='onload()'>"; 
	html = html + "nextPage = new String(history.forward());";          
	html = html + "if (nextPage == 'undefined')";     
	html = html + "{}";     
	html = html + "else";     
	html = html + "{  location.href = window.history.forward();"; 
	html = html + "} ";
	html = html + " document.getElementById('enterlocation').focus();";        
	html = html + "function stopRKey(evt) { ";
	html = html + "	  var evt = (evt) ? evt : ((event) ? event : null); ";
	html = html + "	  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);"; 
	html = html + "	  if ((evt.keyCode == 13) && ((node.type=='text') || (node.type=='submit'))){";
	html = html + "	  if(document.getElementById('cmdSend').disabled==true){";
	html = html + "	  alert('System Processing, Please wait...');";
	html = html + "	  return false;}} ";
	html = html + "	} ";

	html = html + "	document.onkeypress = stopRKey; ";
	html = html + "</script>";
	html = html + "</head><body onkeydown='return OnKeyDown_CL();'>";
	html = html +functionkeyHtml;
	html = html + "	<form name='_rf_postitemreceipt' method='POST'>";

	html = html +"<div id='loading' style='display:none;'>"+
	"</div>"+				
	"		<table width='100%'  >"+
	"			<tr><td class='tableheading'>Post Item Receipt</td></tr>";


	html = html + "			<tr>";
	html = html + "				<td align = 'left'>"+st2.fontcolor("green")+"";
	html = html +"				<input type='hidden' name='hdnwhLocation' value=" + whLocation + ">";
	html = html +"				<input type='hidden' name='hdnwhLocationName' value='" + whLocationName + "'>";
	html = html + "				</td>";
	html = html + "			</tr>";
	html = html + "			<tr>";
	html = html + "				<td align = 'left'>";													
	html = html + "		<input name='cmdPrevious' type='submit' value='Back (F7)' /> ";
	html = html + "				</td>";
	html = html + "			</tr>";

	html = html + "		 </table>";
	html = html + "	</form>";
	html = html + "</body>";
	html = html + "</html>";

	response.write(html);	
}
function getopentaskresultsforIRPosting(poid,containerID,maxNo,item_id,itemLineNo,whLocation)
{		
	var searchresultsArr = new Array();
	var result=nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_postitemreceipt_srch');
	if(poid!= null && poid!= '')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no',null, 'anyof', poid));

	if(containerID != null && containerID != '')
	{
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_inboundcontainer', null, 'anyof',containerID));
	}
	if(maxNo != -1)
	{
		result.addFilter(new nlobjSearchFilter('internalid', null,'greaterthan', parseInt(maxNo)));
	}

	if(item_id !=null && item_id != 'null' && item_id != undefined && item_id != '')
	{
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', item_id));
	}
	if(itemLineNo !=null && itemLineNo != 'null' && itemLineNo != undefined && itemLineNo != '')
	{
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', itemLineNo));
	}
	if(whLocation !=null && whLocation != 'null' && whLocation != undefined && whLocation != '')
	{
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whLocation));
	}

	result.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof', ['@NONE@']));
	var resLen = result.runSearch();
	var q=0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		q++;
		var actQuantity=searchResult.getValue('custrecord_wmsse_act_qty');
		var linenum=searchResult.getValue('custrecord_wmsse_line_no');
		var	itemid=searchResult.getValue('custrecord_wmsse_sku');
		var	batchno=searchResult.getValue('custrecord_wmsse_batch_num');								
		var	expiryDate=searchResult.getValue('custrecord_wmsse_expirydate');
		var	enterBin=searchResult.getValue('custrecord_wmsse_actendloc');
		var	serial=searchResult.getValue('custrecord_wmsse_serial_no');
		var	wmsLocation=searchResult.getValue('custrecord_wmsse_act_wms_location');
		var	vInvStatus_select=searchResult.getValue('custrecord_wmsse_inventorystatus');

		var opentaskId = searchResult.getId();
		var serailNum='';
		if(serial != null && serial != '' && serial != 'null' && serial != 'undefined')
		{
			var serialArray = new Array();
			serailArray = serial.split(',');
			if(serialArray.length > 1)
			{
				for(var s=0;s<serialArray.length;s++)
				{
					if (s==0)
					{
						serailNum = serialArray[s] ;
					}
					else
					{
						serailNum = serailNum +"^"+ serialArray[s] ;
					}
				}
			}
			else
			{
				serailNum = serial;
			}
		}
		var currRow = [linenum,itemid,actQuantity,enterBin,batchno,expiryDate,serailNum,opentaskId,wmsLocation,vInvStatus_select];
		searchresultsArr.push(currRow);
		if(q==4000)
		{			
			getopentaskresultsforIRPosting(poid,containerID,opentaskId,item_id,itemLineNo,whLocation);
			return false;
		}
		return true;               
			});

	return searchresultsArr;
}