/**
 * Script Description
 * This script is used to generate and release the cycle count for selected items.
 */

/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function cycleCountGenAndRelease(request, response)
{
	var context = nlapiGetContext();
	var subs = nlapiGetContext().getFeature('subsidiaries');
	
	if (request.getMethod() == 'GET') 
	{
		try{
			nlapiLogExecution('DEBUG','Remaining usage at the start',context.getRemainingUsage());
			//Creating custom form
			var form = nlapiCreateForm('Cycle Count Generation and Release');
			form.addSubmitButton('Generate & Release');
			form.setScript('customscript_wmsse_cyc_gandr_paging_cl');
			var msg = form.addField('custpage_message', 'inlinehtml', null, null,
					null).setLayoutType('outside','startrow');		  
			var ccPlanNo = form.addField('custpage_plannum', 'select',
			'Plan Number').setDisplayType("disabled");
			var assignedTo = form.addField('custpage_assaignedto', 'select', 'Assigned To',
			'employee');
			var hdnselect= form.addField('custpage_hiddenfieldselectpage','checkbox',
			'Validate Select').setDisplayType("hidden");

			ccPlanNo.addSelectOption("","");

			var hdnstartDate= form.addField('custpage_hiddenstartdate','date',
			'Start Date').setDisplayType("hidden");

			var hdnendDate= form.addField('custpage_hiddenenddate','date',
			'End Date').setDisplayType("hidden");


			var startDate = request.getParameter('custparam_startdate');
			var endDate = request.getParameter('custparam_enddate');

			hdnstartDate.setDefaultValue(startDate);
			hdnendDate.setDefaultValue(endDate);

			var dtsettingFlag = DateSetting();//To convert into date format
			

			var getExpStartDate=ValidateDate(startDate,dtsettingFlag);
			var getExpEndDate=ValidateDate(endDate,dtsettingFlag);
			

			var filters = new Array();

			filters.push(new nlobjSearchFilter('isinactive',null, 'is', 'F'));

			var results = nlapiSearchRecord('customrecord_wmsse_cyclecount_plan',
					'customsearch_wmsse_cyccnt_template_srh', filters, null);
			//To show all plans in drop down type 
			nlapiLogExecution('ERROR', 'results',results);
			if(results != null && results != '')
			{
				
				for(var i=0;i<results.length;i++)
				{
					var id = results[i].getValue('name');					
					ccPlanNo.addSelectOption(id,id);
				}
			}
			if(request.getParameter('custpage_plannum')!=null &&
					request.getParameter('custpage_plannum') != '')
			{
				ccPlanNo.setDefaultValue(request.getParameter('custpage_plannum'));	
			}

			
			var filters = new Array();
			if(request.getParameter('custpage_plannum')!=null && 
					request.getParameter('custpage_plannum') != '')
			{
				filters.push(new nlobjSearchFilter(
						'name',null, 'is',request.getParameter('custpage_plannum')));
			}

			var srhResult = nlapiSearchRecord('customrecord_wmsse_cyclecount_plan',
					'customsearch_wmsse_cyccnt_template_srh', filters, null);
			//To fetch results of selected plan 
			
			if(srhResult != null && srhResult != '')
			{
				
				var itemId = srhResult[0].getValue('custrecord_wmsse_ccp_item');
				var itemIdArr = new Array();
				//Added not null condtions
				if(itemId !=null && itemId !='' && itemId !='null'&& itemId !='undefined' && itemId !=undefined)
					itemIdArr = itemId.split(',');				
				var item = srhResult[0].getText('custrecord_wmsse_ccp_item');				
				
				var itemArr = new Array();
				if(item !=null && item !='' && item !='null'&& item !='undefined' && item !=undefined)
					itemArr = item.split(',');
				
				var bins = srhResult[0].getValue('custrecord_wmsse_ccp_bin');
				var binArr1 = new Array();
				if(bins !=null && bins !='' && bins !='null'&& bins !='undefined' && bins !=undefined)
					binArr1 = bins.split(',');

				var department = srhResult[0].getValue('custrecord_wmsse_ccp_department');
				var cycClass = srhResult[0].getValue('custrecord_wmsse_ccp_class');
				var loc = '';
				if(subs == true)
				{
					loc = srhResult[0].getValue('custrecord_wmsse_ccp_location');
				}
				else
				{
					loc = srhResult[0].getValue('custrecord_wmsse_ccp_nonow_location');
				}
				var subsidiary = srhResult[0].getValue('custrecord_wmsse_subsidiary');
				var itemFamily = srhResult[0].getValue('custrecord_wmsse_ccp_item_family');
				var itemGrp = srhResult[0].getValue('custrecord_wmsse_ccp_item_group');
				var itemClss = srhResult[0].getText('custrecord_wmsse_ccp_item_classification');
				var zone = srhResult[0].getValue('custrecord_wmsse_ccp_zones');
				var aisle = srhResult[0].getValue('custrecord_wmsse_ccp_aisle');
				var vAssignTo = srhResult[0].getValue('custrecord_wmsse_ccp_assigned_to');
				if(request.getParameter('custpage_assaignedto')!='' && 
						request.getParameter('custpage_assaignedto')!=null)
				{
					assignedTo.setDefaultValue(request.getParameter('custpage_assaignedto'));	
				}else if(vAssignTo != '' && vAssignTo != null){
					assignedTo.setDefaultValue(vAssignTo);
				}

				var itemFreq = srhResult[0].getValue('custrecord_wmsse_ccp_use_itemfreq');
				var binsWithZeroQty = srhResult[0].getValue('custrecord_wmsse_ccp_count_binrowszqty');
				var sortByBins = srhResult[0].getValue('custrecord_wmsse_ccp_rowsort_bin');

				var str = 'location.' + loc + '<br/>';
				str = str + 'subsidiary.' + subsidiary + '<br/>';
				str = str + 'itemFamily.' + itemFamily + '<br/>';
				str = str + 'itemGrp.' + itemGrp + '<br/>';
				str = str + 'itemClss.' + itemClss + '<br/>';
				str = str + 'zone.' + zone + '<br/>';
				str = str + 'aisle.' + aisle + '<br/>';
				str = str + 'vAssignTo.' + vAssignTo + '<br/>';
				str = str + 'itemFreq.' + itemFreq + '<br/>';
				str = str + 'binsWithZeroQty.' + binsWithZeroQty + '<br/>';
				str = str + 'sortByBins.' + sortByBins + '<br/>';
				str = str + 'department.' + department + '<br/>';
				str = str + 'cycClass.' + cycClass + '<br/>';

				nlapiLogExecution('ERROR', 'str',str);

				var sublistDetailArr = new Array();
				//adding sublist to the custom form
				var sublist = form.addSubList("custpage_itemlist", "list", "items");
				sublist.addField("custpage_select", "checkbox", "Confirm").setDefaultValue('T');
				sublist.addField("custpage_bin", "text", "Bin");
				sublist.addField("custpage_item", "text", "Item");
				sublist.addField("custpage_itemid", "text", "ItemID").setDisplayType("hidden");
				sublist.addField("custpage_binid", "text", "BinID").setDisplayType("hidden");
				sublist.addMarkAllButtons();

				var binArr = new Array();
				var binArrayId = new Array();
				var binArrayText = new Array();
				binArr.push(binArrayId);
				binArr.push(binArrayText);
				var maxno = -1;

				binArr = fnGetBinDetails(zone,loc,binArr1,aisle,binArr,maxno);
				//}
				//To fetch all bins accoring to the selected plan

				
				binArrayId = binArr[0];//this array contains internalids of all the bins
				binArrayText = binArr[1];//this array contains all bin numbers
			

				var maxno = -1;
				var itemResult = new Array();
				if(binsWithZeroQty == 'T')
					itemResult = fnGetItemDetails(itemIdArr,itemGrp,itemFamily,loc,subsidiary,department,cycClass,maxno,itemResult,'','','','');//returns any number of records
				else
					itemResult = fnGetItemDetails(itemIdArr,itemGrp,itemFamily,loc,subsidiary,department,cycClass,maxno,itemResult,'','','',binArrayId);//returns any number of records
				

				if((binArrayId == null || binArrayId == '' || binArrayId.length<=0) &&
						((zone != '' && zone != null)||(loc != '' && loc != null) ||
								(bins != null && bins != '')||(aisle != null && aisle != '')))
				{
					msg.setDefaultValue("<div id='div__alert' align='center'></div>" +
							"<script>showAlertBox('div__alert', 'Error'," +
							" 'No Bins are available according to "+
							request.getParameter('custpage_plannum')+"'," +
							" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
					"</script></div>");
					response.writePage(form);
					return;
				}
				else if(itemResult != null && itemResult != '')
				{
					
					nlapiLogExecution("Debug",'itemFreq',itemFreq);
					var freqItems = new Array();
					var nonFreqItems = new Array();

					for(var i=0; i<itemResult.length; i++)
					{
						if(context.getRemainingUsage()<=410)
						{
							break;
						}
						internaid = itemResult[i].getValue('internalid');
						nxtCountDate = itemResult[i].getValue('locationnextinvtcountdate');
						if(nxtCountDate != null && nxtCountDate != '' && nxtCountDate != 'null')
						{
							nxtCountDate = ValidateDate(nxtCountDate,dtsettingFlag);
							//To validate next count date
						}
						invtClassification = itemResult[i].getValue(
						'locationinvtclassification');
						
						nlapiLogExecution("Debug",'invtClassification',invtClassification);
						nlapiLogExecution("Debug",'itemClss',itemClss);
						if((itemClss!=null && itemClss!='') && (invtClassification != itemClss))
						{
							nlapiLogExecution("Debug",'test2',itemClss);
							continue;
						}
						if(itemFreq == 'T' )
						{
							if(nxtCountDate != null && nxtCountDate != '')
							{
								freqItems.push(internaid);
							}
						}
						else
						{
							nonFreqItems.push(internaid);
						}
					}
					nlapiLogExecution("Debug",'freqItems.length,nonFreqItems.length',freqItems.length+','+nonFreqItems.length);

					if(freqItems != '' && freqItems != null)
					{
						if(binsWithZeroQty == 'T')
						{
							if(sortByBins == 'T')
							{
								
								var objInvDetails = new Array();

								var binarray = new Array();
								var binId = new Array();
								var binText = new Array();
								var binItemText = new Array();
								var binItemId = new Array();
								binarray.push(binId);
								binarray.push(binText);
								binarray.push(binItemText);
								binarray.push(binItemId);

								binarray = fnGetBinDetailsWithZeroQtySort(loc,binArrayId,binarray,freqItems,getExpStartDate,getExpEndDate,binsWithZeroQty);
								//returns maximum 4000 records								
								if(binId !=null && binId !='')
								{
									
									for(var fSortItr = 0;fSortItr < binId.length ;fSortItr++)
									{
										var currow = [binItemText[fSortItr],binItemId[fSortItr],binId[fSortItr],binText[fSortItr]];
										sublistDetailArr.push(currow);
									}
								}
							}
							else
							{
								nlapiLogExecution("Debug",'binsWithZeroQty,sortByBins',binsWithZeroQty+','+sortByBins);
								var objInvDetails = new Array();
								var binarray = new Array();
								var binId = new Array();
								var binText = new Array();
								var binItemText = new Array();
								var binItemId = new Array();
								binarray.push(binId);
								binarray.push(binText);
								binarray.push(binItemText);
								binarray.push(binItemId);

								binarray = fnGetBinDetailsWithZeroQty(loc,binArrayId,binarray,freqItems,getExpStartDate,getExpEndDate,binsWithZeroQty);
								//returns maximum 4000 records
								

								if(binId !=null && binId !='')
								{
									
									for(var fItr = 0; fItr < binId.length; fItr++)
									{
										var currow = [binItemText[fItr], binItemId[fItr], binId[fItr], binText[fItr]];
										sublistDetailArr.push(currow);
									}															
								}
							}
						}
						else
						{
							if(sortByBins == 'T')
							{	
								nlapiLogExecution("Debug",'binsWithZeroQty,sortByBins',binsWithZeroQty+','+sortByBins);
								var objInvDetails = new Array();
								objInvDetails = fnGetItemDetailsSort(freqItems,loc,objInvDetails,getExpStartDate,getExpEndDate,itemFreq,binArrayId);
								//returns max 4000 records
								

								if(objInvDetails !=null && objInvDetails !='')
								{
									
									for(var k=0;k<objInvDetails.length ;k++)
									{
										var currow = [objInvDetails[k].getValue('itemid'),
											objInvDetails[k].getValue('internalid'),
											objInvDetails[k].getValue('binnumber','binOnHand'),objInvDetails[k].getText('binnumber','binOnHand')];
										sublistDetailArr.push(currow);
									}
								}
							}
							else
							{
								
								var objInvDetails = new Array();
								var maxno = -1;
								objInvDetails = fnGetItemDetailsCycc(freqItems,itemFreq,getExpStartDate,loc,getExpEndDate,binArrayId,objInvDetails,maxno);

							

								if(objInvDetails !=null && objInvDetails !='')
								{
									
									for(var k=0;k<objInvDetails.length ;k++)
									{
										var currow = [objInvDetails[k].getValue('itemid'),
											objInvDetails[k].getValue('internalid'),
											objInvDetails[k].getValue('binnumber','binOnHand'),objInvDetails[k].getText('binnumber','binOnHand')];
										sublistDetailArr.push(currow);
									}
								}
							}
						}
					}

					if(nonFreqItems != '' && nonFreqItems != null)
					{
						if(binsWithZeroQty == 'T')
						{
							if(sortByBins == 'T')
							{
										

								var binarray = new Array();
								var binId = new Array();
								var binText = new Array();
								var binItemText = new Array();
								var binItemId = new Array();
								binarray.push(binId);
								binarray.push(binText);
								binarray.push(binItemText);
								binarray.push(binItemId);

								binarray = fnGetBinDetailsWithZeroQtySort(loc,binArrayId,binarray,nonFreqItems,'','','','');

								if(binId !=null && binId !='')
								{
									
									for(var nfSortItr = 0; nfSortItr < binId.length; nfSortItr++)
									{
										var currow = [binItemText[nfSortItr], binItemId[nfSortItr], binId[nfSortItr], binText[nfSortItr]];
										sublistDetailArr.push(currow);
									}									
								}
							}
							else
							{
								nlapiLogExecution("Debug",'NoN binsWithZeroQty,sortByBins',binsWithZeroQty+','+sortByBins);
								var binarray = new Array();
								var binId = new Array();
								var binText = new Array();
								var binItemText = new Array();
								var binItemId = new Array();
								binarray.push(binId);
								binarray.push(binText);
								binarray.push(binItemText);
								binarray.push(binItemId);

								binarray = fnGetBinDetailsWithZeroQty(loc,binArrayId,binarray,nonFreqItems,'','','','');
								

								if(binId !=null && binId !='')
								{
									
									for(var nfItr = 0; nfItr < binId.length; nfItr++)
									{
										var currow = [binItemText[nfItr], binItemId[nfItr], binId[nfItr], binText[nfItr]];
										sublistDetailArr.push(currow);
									}									
								}
							}
						}
						else
						{
							if(sortByBins == 'T')
							{
								
								var NonobjInvDetails = new Array();

								NonobjInvDetails = fnGetItemDetailsSort(nonFreqItems,loc,NonobjInvDetails,'','','',binArrayId);
								

								if(NonobjInvDetails !=null && NonobjInvDetails !='')
								{
									
									for(var k=0;k<NonobjInvDetails.length ;k++)
									{
										var currow = [NonobjInvDetails[k].getValue('itemid'),
											NonobjInvDetails[k].getValue('internalid'),
											NonobjInvDetails[k].getValue('binnumber','binOnHand'),NonobjInvDetails[k].getText('binnumber','binOnHand')];
										sublistDetailArr.push(currow);
									}
								}
							}
							else
							{
								
								var NonobjInvDetails = new Array();
								var maxno = -1;
								NonobjInvDetails = fnGetItemDetailsCycc(nonFreqItems,'','',loc,'',binArrayId,NonobjInvDetails,maxno);
								

								if(NonobjInvDetails !=null && NonobjInvDetails !='')
								{
									
									for(var k=0;k<NonobjInvDetails.length ;k++)
									{
										var currow = [NonobjInvDetails[k].getValue('itemid'),
											NonobjInvDetails[k].getValue('internalid'),
											NonobjInvDetails[k].getValue('binnumber','binOnHand'),NonobjInvDetails[k].getText('binnumber','binOnHand')];
										sublistDetailArr.push(currow);
									}
								}
							}
						}
					}

					nlapiLogExecution('DEBUG','Remaining usage before processing each item',
							context.getRemainingUsage());
					if(sublistDetailArr != null && sublistDetailArr != '' && sublistDetailArr.length>0)
					{
						

						var size = 30;						
						if(sublistDetailArr.length > parseInt(size))
						{	
							var select= form.addField('custpage_selectpage','select', 'Select Orders');	
							select.setLayoutType('outsidebelow');			
							select.setDisplaySize(200,30);
							if(request.getParameter('custpage_selectpage') != null &&
									request.getParameter('custpage_selectpage') != 'null' &&
									request.getParameter('custpage_selectpage') != '' &&
									request.getParameter('custpage_selectpage') != 'undefined')
							{
								select.setDefaultValue(request.getParameter('custpage_selectpage'));	
							}

							var len = sublistDetailArr.length/parseInt(size);
							for(var k=1;k<=Math.ceil(len);k++)
							{
								var from;var to;

								to=parseFloat(k)*parseInt(size);
								from=(parseFloat(to)-parseInt(size))+1;
								if(parseFloat(to)>sublistDetailArr.length)
								{
									to=sublistDetailArr.length;
								}

								var selectvalues=from.toString()+" to "+to.toString();
								var selectvalues_display=from.toString()+","+to.toString();
								select.addSelectOption(selectvalues_display,selectvalues);

							}//Setting values to Paging Dropdown box

						}
						var minval=0;
						var maxval=parseFloat(sublistDetailArr.length)-1;
						var selectno=request.getParameter('custpage_selectpage');
						
						if(selectno!=null && selectno!='null'  && selectno!=undefined &&
								selectno!= '' && sublistDetailArr.length > parseInt(size))
						{
							var selectedPage= request.getParameter('custpage_selectpage');
							var selectedPageArray=selectedPage.split(',');

							minval = parseFloat(selectedPageArray[0])-1;

							if(parseFloat(sublistDetailArr.length) >= parseFloat(selectedPageArray[1]))
							{
								maxval=parseFloat(selectedPageArray[1])-1;
							}

						}
						else
						{
							if(sublistDetailArr.length > parseInt(size))
							{
								maxval = parseInt(size)-1;
							}
						}
						var t=0;
						for(var w=minval; w<=maxval;w++)
						{
							form.getSubList('custpage_itemlist').setLineItemValue(
									'custpage_select', t+1, 'F');

							form.getSubList('custpage_itemlist').setLineItemValue(
									'custpage_item',t+1,sublistDetailArr[w][0]);

							form.getSubList('custpage_itemlist').setLineItemValue(
									'custpage_itemid',
									t+1,sublistDetailArr[w][1]);

							form.getSubList('custpage_itemlist').setLineItemValue(
									'custpage_binid', t+1, sublistDetailArr[w][2]);

							form.getSubList('custpage_itemlist').setLineItemValue(
									'custpage_bin', t+1, sublistDetailArr[w][3]);
							t++;
						}
					}
					else
					{
						msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
								"showAlertBox('div__alert', 'Error'," +
								" 'No Items are available according to "
								+request.getParameter('custpage_plannum')+"'," +
								" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
								"</script>" +
						"</div>");
					}
					nlapiLogExecution('ERROR', 'out of for');					
				}
				else
				{
					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
							"showAlertBox('div__alert', 'Error'," +
							" 'No Items are available according to "
							+request.getParameter('custpage_plannum')+"'," +
							" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
							"</script>" +
					"</div>");
				}
			}
			else
			{
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
						"showAlertBox('div__alert', 'Error'," +
						" 'Please enter valid plan'," +
						" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
						"</script>" +
				"</div>");
			}
			//end of form
		}catch(e)
		{
			nlapiLogExecution('ERROR', 'into catch',e);
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

			msg.setDefaultValue("<div id='div__alert' align='center'></div>" +
					"<script>showAlertBox('div__alert', 'Error', "+errStr+", " +
					"NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
			"</script></div>");
		}
		finally
		{
			nlapiLogExecution('DEBUG','Remaining usage at the end of get',context.getRemainingUsage());
			response.writePage(form);
			return;
		}

	}
	else
	{
		

		var expStr = '';
		try
		{
			var form = nlapiCreateForm('Cycle Count Generation and Release');
			form.setScript('customscript_wmsse_cyc_gandr_paging_cl');
			var msg = form.addField('custpage_message', 'inlinehtml', null, null, 
					null).setLayoutType('outside','startrow');
			form.addSubmitButton('Generate & Release');
			var hdnselect= form.addField('custpage_hiddenfieldselectpage','checkbox',
			'Validate Select').setDisplayType("hidden");

			var ccPlanNo = form.addField('custpage_plannum', 'select', 
			'Plan Number').setDisplayType("disabled");
			var assignedTo = form.addField('custpage_assaignedto', 'select', 'Assigned To',
			'employee');

			var errMsg = request.getParameter('custpage_message');
		

			if(request.getParameter('custpage_message')!='' &&
					request.getParameter('custpage_message')!=null)
			{
				msg.setDefaultValue(request.getParameter('custpage_message'));	
			}

			if(request.getParameter('custpage_assaignedto')!='' &&
					request.getParameter('custpage_assaignedto')!=null)
			{
				assignedTo.setDefaultValue(request.getParameter('custpage_assaignedto'));	
			}
			ccPlanNo.addSelectOption("","");

			var hdnstartDate= form.addField('custpage_hiddenstartdate','date',
			'Start Date').setDisplayType("hidden");

			var hdnendDate= form.addField('custpage_hiddenenddate','date',
			'End Date').setDisplayType("hidden");


			var startDate = request.getParameter('custpage_hiddenstartdate');
			var endDate = request.getParameter('custpage_hiddenenddate');

			hdnstartDate.setDefaultValue(startDate);
			hdnendDate.setDefaultValue(endDate);

			var dtsettingFlag = DateSetting();//To convert into date format
			

			var getExpStartDate=ValidateDate(startDate,dtsettingFlag);
			var getExpEndDate=ValidateDate(endDate,dtsettingFlag);
			

			var filters = new Array();

			filters.push(new nlobjSearchFilter('isinactive',null, 'is', 'F'));

			var results = nlapiSearchRecord('customrecord_wmsse_cyclecount_plan',
					'customsearch_wmsse_cyccnt_template_srh', filters, null);
			//To show all plans in drop down type 
			nlapiLogExecution('ERROR', 'results',results);
			if(results != null && results != '')
			{
				
				for(var i=0;i<results.length;i++)
				{
					var id = results[i].getValue('name');
					
					ccPlanNo.addSelectOption(id,id);
				}
			}
			if(request.getParameter('custpage_plannum')!=null &&
					request.getParameter('custpage_plannum') != '')
			{
				ccPlanNo.setDefaultValue(request.getParameter('custpage_plannum'));	
			}

		
			var filters = new Array();
			if(request.getParameter('custpage_plannum')!=null && 
					request.getParameter('custpage_plannum') != '')
			{
				filters.push(new nlobjSearchFilter(
						'name',null, 'is',request.getParameter('custpage_plannum')));
			}

			var srhResult = nlapiSearchRecord('customrecord_wmsse_cyclecount_plan',
					'customsearch_wmsse_cyccnt_template_srh', filters, null);
			//To fetch results of selected plan 
			
			if(srhResult != null && srhResult != '')
			{
				
				var itemId = srhResult[0].getValue('custrecord_wmsse_ccp_item');
				var itemIdArr = new Array();

				if(itemId !=null && itemId !='' && itemId !='null'&& itemId !='undefined' && itemId !=undefined)
					itemIdArr = itemId.split(',');

				var item = srhResult[0].getText('custrecord_wmsse_ccp_item');

				var itemArr = new Array();
				if(item !=null && item !='' && item !='null'&& item !='undefined' && item !=undefined)
					itemArr = item.split(',');

				var bins = srhResult[0].getValue('custrecord_wmsse_ccp_bin');

				var binArr1 = new Array();
				if(bins !=null && bins !='' && bins !='null'&& bins !='undefined' && bins !=undefined)
					binArr1 = bins.split(',');

				var department = srhResult[0].getValue('custrecord_wmsse_ccp_department');
				var cycClass = srhResult[0].getValue('custrecord_wmsse_ccp_class');
				var loc = '';
				if(subs == true)
				{
					loc = srhResult[0].getValue('custrecord_wmsse_ccp_location');
				}
				else
				{
					loc = srhResult[0].getValue('custrecord_wmsse_ccp_nonow_location');
				}
				var subsidiary = srhResult[0].getValue('custrecord_wmsse_subsidiary');
				var itemFamily = srhResult[0].getValue('custrecord_wmsse_ccp_item_family');
				var itemGrp = srhResult[0].getValue('custrecord_wmsse_ccp_item_group');
				var itemClss = srhResult[0].getText('custrecord_wmsse_ccp_item_classification');
				var zone = srhResult[0].getValue('custrecord_wmsse_ccp_zones');
				var aisle = srhResult[0].getValue('custrecord_wmsse_ccp_aisle');
				var vAssignTo = srhResult[0].getValue('custrecord_wmsse_ccp_assigned_to');
				if(request.getParameter('custpage_assaignedto')!='' && 
						request.getParameter('custpage_assaignedto')!=null)
				{
					assignedTo.setDefaultValue(request.getParameter('custpage_assaignedto'));	
				}else if(vAssignTo != '' && vAssignTo != null){
					assignedTo.setDefaultValue(vAssignTo);
				}

				var itemFreq = srhResult[0].getValue('custrecord_wmsse_ccp_use_itemfreq');
				var binsWithZeroQty = srhResult[0].getValue('custrecord_wmsse_ccp_count_binrowszqty');
				var sortByBins = srhResult[0].getValue('custrecord_wmsse_ccp_rowsort_bin');

				var str = 'location.' + loc + '<br/>';
				str = str + 'subsidiary.' + subsidiary + '<br/>';
				str = str + 'itemFamily.' + itemFamily + '<br/>';
				str = str + 'itemGrp.' + itemGrp + '<br/>';
				str = str + 'itemClss.' + itemClss + '<br/>';
				str = str + 'zone.' + zone + '<br/>';
				str = str + 'aisle.' + aisle + '<br/>';
				str = str + 'vAssignTo.' + vAssignTo + '<br/>';
				str = str + 'itemFreq.' + itemFreq + '<br/>';
				str = str + 'binsWithZeroQty.' + binsWithZeroQty + '<br/>';
				str = str + 'sortByBins.' + sortByBins + '<br/>';
				str = str + 'department.' + department + '<br/>';
				str = str + 'cycClass.' + cycClass + '<br/>';

				nlapiLogExecution('ERROR', 'str',str);

				var sublistDetailArr = new Array();
				//adding sublist to the custom form
				var sublist = form.addSubList("custpage_itemlist", "list", "items");
				sublist.addField("custpage_select", "checkbox", "Confirm").setDefaultValue('T');
				sublist.addField("custpage_bin", "text", "Bin");
				sublist.addField("custpage_item", "text", "Item");
				sublist.addField("custpage_itemid", "text", "ItemID").setDisplayType("hidden");
				sublist.addField("custpage_binid", "text", "BinID").setDisplayType("hidden");
				sublist.addMarkAllButtons();

				var binArr = new Array();
				var binArrayId = new Array();
				var binArrayText = new Array();
				binArr.push(binArrayId);
				binArr.push(binArrayText);
				var maxno = -1;

				binArr = fnGetBinDetails(zone,loc,binArr1,aisle,binArr,maxno);
				//}
				//To fetch all bins accoring to the selected plan

				
				binArrayId = binArr[0];//this array contains internalids of all the bins
				binArrayText = binArr[1];//this array contains all bin numbers
				nlapiLogExecution('Debug','binArrayId,binArrayText',binArrayId.length+' : '+
						binArrayText.length);

				var maxno = -1;
				var itemResult = new Array();
				if(binsWithZeroQty == 'T')
					itemResult = fnGetItemDetails(itemIdArr,itemGrp,itemFamily,loc,subsidiary,department,cycClass,maxno,itemResult,'','','');//returns any number of records
				else
					itemResult = fnGetItemDetails(itemIdArr,itemGrp,itemFamily,loc,subsidiary,department,cycClass,maxno,itemResult,'','','',binArrayId);//returns any number of records
				

				if((binArrayId == null || binArrayId == '' || binArrayId.length<=0) &&
						((zone != '' && zone != null)||(loc != '' && loc != null) ||
								(bins != null && bins != '')||(aisle != null && aisle != '')))
				{
					msg.setDefaultValue("<div id='div__alert' align='center'></div>" +
							"<script>showAlertBox('div__alert', 'Error'," +
							" 'No Bins are available according to "+
							request.getParameter('custpage_plannum')+"'," +
							" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
					"</script></div>");
					response.writePage(form);
					return;
				}
				else if(itemResult != null && itemResult != '')
				{
					
					var freqItems = new Array();
					var nonFreqItems = new Array();

					for(var i=0; i<itemResult.length; i++)
					{
						if(context.getRemainingUsage()<=410)
						{
							break;
						}
						internaid = itemResult[i].getValue('internalid');
						nxtCountDate = itemResult[i].getValue('locationnextinvtcountdate');
						if(nxtCountDate != null && nxtCountDate != '' && nxtCountDate != 'null')
						{
							nxtCountDate = ValidateDate(nxtCountDate,dtsettingFlag);
							//To validate next count date
						}
						invtClassification = itemResult[i].getValue(
						'locationinvtclassification');
						
						nlapiLogExecution("Debug",'invtClassification1',invtClassification);
						nlapiLogExecution("Debug",'itemClss1',itemClss);
						
						if((itemClss!=null && itemClss!='') && (invtClassification != itemClss))
						{
							nlapiLogExecution("Debug",'itemClss1',itemClss);
							continue;
						}
						
						if(itemFreq == 'T')
						{
							if(nxtCountDate != null && nxtCountDate != '')
							{
								freqItems.push(internaid);
							}
						}
						else
						{
							nonFreqItems.push(internaid);
						}
					}
					nlapiLogExecution("Debug",'freqItems.length,nonFreqItems.length',freqItems.length+','+nonFreqItems.length);

					if(freqItems != '' && freqItems != null)
					{
						if(binsWithZeroQty == 'T')
						{
							if(sortByBins == 'T')
							{
								
								var objInvDetails = new Array();

								var binarray = new Array();
								var binId = new Array();
								var binText = new Array();
								var binItemText = new Array();
								var binItemId = new Array();
								binarray.push(binId);
								binarray.push(binText);
								binarray.push(binItemText);
								binarray.push(binItemId);

								binarray = fnGetBinDetailsWithZeroQtySort(loc,binArrayId,binarray,freqItems,getExpStartDate,getExpEndDate,binsWithZeroQty);
								//returns maximum 4000 records								
								if(binId !=null && binId !='')
								{
									
									for(var fSortItr = 0;fSortItr < binId.length ;fSortItr++)
									{
										var currow = [binItemText[fSortItr],binItemId[fSortItr],binId[fSortItr],binText[fSortItr]];
										sublistDetailArr.push(currow);
									}
								}
							}
							else
							{
								nlapiLogExecution("Debug",'binsWithZeroQty,sortByBins',binsWithZeroQty+','+sortByBins);
								var objInvDetails = new Array();
								var binarray = new Array();
								var binId = new Array();
								var binText = new Array();
								var binItemText = new Array();
								var binItemId = new Array();
								binarray.push(binId);
								binarray.push(binText);
								binarray.push(binItemText);
								binarray.push(binItemId);

								binarray = fnGetBinDetailsWithZeroQty(loc,binArrayId,binarray,freqItems,getExpStartDate,getExpEndDate,binsWithZeroQty);
								//returns maximum 4000 records
								

								if(binId !=null && binId !='')
								{
									
									for(var fItr = 0; fItr < binId.length; fItr++)
									{
										var currow = [binItemText[fItr], binItemId[fItr], binId[fItr], binText[fItr]];
										sublistDetailArr.push(currow);
									}															
								}
							}
						}
						else
						{
							if(sortByBins == 'T')
							{	
								nlapiLogExecution("Debug",'binsWithZeroQty,sortByBins',binsWithZeroQty+','+sortByBins);
								var objInvDetails = new Array();
								objInvDetails = fnGetItemDetailsSort(freqItems,loc,objInvDetails,getExpStartDate,getExpEndDate,itemFreq,binArrayId);
								//returns max 4000 records
								

								if(objInvDetails !=null && objInvDetails !='')
								{
									
									for(var k=0;k<objInvDetails.length ;k++)
									{
										var currow = [objInvDetails[k].getValue('itemid'),
											objInvDetails[k].getValue('internalid'),
											objInvDetails[k].getValue('binnumber','binOnHand'),objInvDetails[k].getText('binnumber','binOnHand')];
										sublistDetailArr.push(currow);
									}
								}
							}
							else
							{
								nlapiLogExecution("Debug",'binsWithZeroQty,sortByBins',binsWithZeroQty+','+sortByBins);
								var objInvDetails = new Array();
								var maxno = -1;
								objInvDetails = fnGetItemDetailsCycc(freqItems,itemFreq,getExpStartDate,loc,getExpEndDate,binArrayId,objInvDetails,maxno);

								

								if(objInvDetails !=null && objInvDetails !='')
								{
									
									for(var k=0;k<objInvDetails.length ;k++)
									{
										var currow = [objInvDetails[k].getValue('itemid'),
											objInvDetails[k].getValue('internalid'),
											objInvDetails[k].getValue('binnumber','binOnHand'),objInvDetails[k].getText('binnumber','binOnHand')];
										sublistDetailArr.push(currow);
									}
								}
							}
						}
					}

					if(nonFreqItems != '' && nonFreqItems != null)
					{
						if(binsWithZeroQty == 'T')
						{
							if(sortByBins == 'T')
							{
								nlapiLogExecution("Debug",'NoN binsWithZeroQty,sortByBins',binsWithZeroQty+','+sortByBins);					

								var binarray = new Array();
								var binId = new Array();
								var binText = new Array();
								var binItemText = new Array();
								var binItemId = new Array();
								binarray.push(binId);
								binarray.push(binText);
								binarray.push(binItemText);
								binarray.push(binItemId);

								binarray = fnGetBinDetailsWithZeroQtySort(loc,binArrayId,binarray,nonFreqItems,'','','','');

								if(binId !=null && binId !='')
								{
									
									for(var nfSortItr = 0; nfSortItr < binId.length; nfSortItr++)
									{
										var currow = [binItemText[nfSortItr], binItemId[nfSortItr], binId[nfSortItr], binText[nfSortItr]];
										sublistDetailArr.push(currow);
									}									
								}
							}
							else
							{
								nlapiLogExecution("Debug",'NoN binsWithZeroQty,sortByBins',binsWithZeroQty+','+sortByBins);
								var binarray = new Array();
								var binId = new Array();
								var binText = new Array();
								var binItemText = new Array();
								var binItemId = new Array();
								binarray.push(binId);
								binarray.push(binText);
								binarray.push(binItemText);
								binarray.push(binItemId);

								binarray = fnGetBinDetailsWithZeroQty(loc,binArrayId,binarray,nonFreqItems,'','','','');
								

								if(binId !=null && binId !='')
								{
									
									for(var nfItr = 0; nfItr < binId.length; nfItr++)
									{
										var currow = [binItemText[nfItr], binItemId[nfItr], binId[nfItr], binText[nfItr]];
										sublistDetailArr.push(currow);
									}									
								}
							}
						}
						else
						{
							if(sortByBins == 'T')
							{
								nlapiLogExecution("Debug",'NoN binsWithZeroQty,sortByBins',binsWithZeroQty+','+sortByBins);
								var NonobjInvDetails = new Array();

								NonobjInvDetails = fnGetItemDetailsSort(nonFreqItems,loc,NonobjInvDetails,'','','',binArrayId);
								

								if(NonobjInvDetails !=null && NonobjInvDetails !='')
								{
									
									for(var k=0;k<NonobjInvDetails.length ;k++)
									{
										var currow = [NonobjInvDetails[k].getValue('itemid'),
											NonobjInvDetails[k].getValue('internalid'),
											NonobjInvDetails[k].getValue('binnumber','binOnHand'),NonobjInvDetails[k].getText('binnumber','binOnHand')];
										sublistDetailArr.push(currow);
									}
								}
							}
							else
							{
								nlapiLogExecution("Debug",'NoN binsWithZeroQty,sortByBins',binsWithZeroQty+','+sortByBins);
								var NonobjInvDetails = new Array();
								var maxno = -1;
								NonobjInvDetails = fnGetItemDetailsCycc(nonFreqItems,'','',loc,'',binArrayId,NonobjInvDetails,maxno);
								

								if(NonobjInvDetails !=null && NonobjInvDetails !='')
								{
									
									for(var k=0;k<NonobjInvDetails.length ;k++)
									{
										var currow = [NonobjInvDetails[k].getValue('itemid'),
											NonobjInvDetails[k].getValue('internalid'),
											NonobjInvDetails[k].getValue('binnumber','binOnHand'),NonobjInvDetails[k].getText('binnumber','binOnHand')];
										sublistDetailArr.push(currow);
									}
								}
							}
						}
					}

					nlapiLogExecution('DEBUG','Remaining usage before processing each item',
							context.getRemainingUsage());
					if(sublistDetailArr != null && sublistDetailArr != '' && sublistDetailArr.length>0)
					{
						

						var size = 30;						
						if(sublistDetailArr.length > parseInt(size))
						{	
							var select= form.addField('custpage_selectpage','select', 'Select Orders');	
							select.setLayoutType('outsidebelow');			
							select.setDisplaySize(200,30);
							if(request.getParameter('custpage_selectpage') != null &&
									request.getParameter('custpage_selectpage') != 'null' &&
									request.getParameter('custpage_selectpage') != '' &&
									request.getParameter('custpage_selectpage') != 'undefined')
							{
								select.setDefaultValue(request.getParameter('custpage_selectpage'));	
							}

							var len = sublistDetailArr.length/parseInt(size);
							for(var k=1;k<=Math.ceil(len);k++)
							{
								var from;var to;

								to=parseFloat(k)*parseInt(size);
								from=(parseFloat(to)-parseInt(size))+1;
								if(parseFloat(to)>sublistDetailArr.length)
								{
									to=sublistDetailArr.length;
								}

								var selectvalues=from.toString()+" to "+to.toString();
								var selectvalues_display=from.toString()+","+to.toString();
								select.addSelectOption(selectvalues_display,selectvalues);

							}//Setting values to Paging Dropdown box

						}
						var minval=0;
						var maxval=parseFloat(sublistDetailArr.length)-1;
						var selectno=request.getParameter('custpage_selectpage');
						
						if(selectno!=null && selectno!='null'  && selectno!=undefined &&
								selectno!= '' && sublistDetailArr.length > parseInt(size))
						{
							var selectedPage= request.getParameter('custpage_selectpage');
							var selectedPageArray=selectedPage.split(',');

							minval = parseFloat(selectedPageArray[0])-1;

							if(parseFloat(sublistDetailArr.length) >= parseFloat(selectedPageArray[1]))
							{
								maxval=parseFloat(selectedPageArray[1])-1;
							}

						}
						else
						{
							if(sublistDetailArr.length > parseInt(size))
							{
								maxval = parseInt(size)-1;
							}
						}
						var t=0;
						for(var w=minval; w<=maxval;w++)
						{
							form.getSubList('custpage_itemlist').setLineItemValue(
									'custpage_select', t+1, 'F');

							form.getSubList('custpage_itemlist').setLineItemValue(
									'custpage_item',t+1,sublistDetailArr[w][0]);

							form.getSubList('custpage_itemlist').setLineItemValue(
									'custpage_itemid',
									t+1,sublistDetailArr[w][1]);

							form.getSubList('custpage_itemlist').setLineItemValue(
									'custpage_binid', t+1, sublistDetailArr[w][2]);

							form.getSubList('custpage_itemlist').setLineItemValue(
									'custpage_bin', t+1, sublistDetailArr[w][3]);
							t++;
						}
					}
					else
					{
						msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
								"showAlertBox('div__alert', 'Error'," +
								" 'No Items are available according to "
								+request.getParameter('custpage_plannum')+"'," +
								" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
								"</script>" +
						"</div>");
					}
					nlapiLogExecution('ERROR', 'out of for');					
				}
				else
				{
					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
							"showAlertBox('div__alert', 'Error'," +
							" 'No Items are available according to "
							+request.getParameter('custpage_plannum')+"'," +
							" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
							"</script>" +
					"</div>");
				}
			}
			else
			{
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
						"showAlertBox('div__alert', 'Error'," +
						" 'Please enter valid plan'," +
						" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
						"</script>" +
				"</div>");
			}


			nlapiLogExecution('DEBUG','Remaining usage at the start of response2',
					context.getRemainingUsage());
			nlapiLogExecution('DEBUG','hdnflag value',
					request.getParameter('custpage_hiddenfieldselectpage'));
			if(request.getParameter('custpage_hiddenfieldselectpage') == 'F')
			{
				var planno = request.getParameter('custpage_plannum');
				
				var vassignedto = request.getParameter('custpage_assaignedto');
				
				var lineCount = request.getLineItemCount('custpage_itemlist');
				
				var itemArray = new Array();
				var iArray = new Array();
				var binArray = new Array();
				var binTxtArray = new Array();
				var binStr = '';
				var isSelected = 'F';
				var selectedCount = 0;
				for(var p=0;p<lineCount;p++){
					isSelected = request.getLineItemValue('custpage_itemlist','custpage_select', p+1);
					
					if(isSelected=='T')
					{
						selectedCount = selectedCount+1;
						iArray.push(request.getLineItemValue('custpage_itemlist','custpage_item', p+1));
						itemArray.push(request.getLineItemValue('custpage_itemlist','custpage_itemid', p+1));
						binArray.push(request.getLineItemValue('custpage_itemlist','custpage_binid', p+1));
						binTxtArray.push(request.getLineItemValue(
								'custpage_itemlist','custpage_bin', p+1));
						
						var fil = new Array();
						fil.push(new nlobjSearchFilter('item',null, 'anyof',itemArray[(itemArray.length)-1]));
						fil.push(new nlobjSearchFilter('internalid','binnumber','anyof',
								binArray[(binArray.length)-1]));

						var columns = new Array();
						columns.push(new nlobjSearchColumn('tranid'));
						columns.push(new nlobjSearchColumn('statusref'));
						var results = nlapiSearchRecord('inventorycount', null, fil, columns);
						
						if(results != null && results != '' && results != 'null' && results != 'undefined')
						{
							for(var w=0;w<results.length;w++)
							{
								var status = results[w].getValue('statusref');
								
								if(status != 'approved')
								{
									var id = results[w].getValue('tranid');
									nlapiLogExecution('ERROR','This item already has Cycle count plan');
									msg.setDefaultValue("<div id='div__alert' align='center'></div>" +
											"<script>showAlertBox('div__alert', 'Error'," +
											" '"+iArray[(iArray.length)-1]+" with "+
											binTxtArray[(binTxtArray.length)-1]+" is" +
											" currently part of Cycle count Ref No "
											+id+"', NLAlertDialog.TYPE_HIGH_PRIORITY," +
									"  '100%', null, null, null);</script></div>");
									response.writePage(form);
									return;
								}
							}
						}
					}
				}
				if(selectedCount == 0 && request.getParameter('custpage_hiddenfieldselectpage') == 'F')
				{
					nlapiLogExecution('ERROR','Please select atleast one line');
					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
							"showAlertBox('div__alert', 'Error', 'Please select atleast one line', " +
					"NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
					response.writePage(form);
					return;
				}

				nlapiLogExecution('DEBUG','Remaining usage after validating lines',
						context.getRemainingUsage());
				var filters = new Array();
				if(planno != null && planno != '')
					filters.push(new nlobjSearchFilter('name',null, 'is',planno));

				var results = nlapiSearchRecord('customrecord_wmsse_cyclecount_plan',
						'customsearch_wmsse_cyccnt_template_srh', filters, null);
						
				if(results != null && results != '' && selectedCount>0)
				{
					for(var i=0;i<results.length;i++)
					{
						var name = results[i].getValue('name');					
						var subsidiary = results[i].getValue('custrecord_wmsse_subsidiary');						
						var Cclass = results[i].getValue('custrecord_wmsse_ccp_class');						
						var memo = results[i].getValue('custrecord_wmsse_ccp_memo');						
						var account = results[i].getValue('custrecord_wmsse_ccp_account');
												
						var location = '';
						if(subs == true)
						{
							location = results[i].getValue('custrecord_wmsse_ccp_location');
						}
						else
						{
							location = results[i].getValue('custrecord_wmsse_ccp_nonow_location');
						}
						
						var dept = results[i].getValue('custrecord_wmsse_ccp_department');
					

						var crecord = nlapiCreateRecord('inventorycount');

						if(name != null && name != '')
						{
							crecord.setFieldValue('name', name);
						}

						if(subsidiary != null && subsidiary != '')
							crecord.setFieldValue('subsidiary', subsidiary);

						if(Cclass != null && Cclass != '')
							crecord.setFieldValue('class', Cclass);

						if(account != null && account != '')
							crecord.setFieldValue('account', account);


						if(memo != null && memo != '')
							crecord.setFieldValue('memo', memo);

						if(location != null && location != '')
							crecord.setFieldValue('location', location);

						if(dept != null && dept != '')
							crecord.setFieldValue('department', dept);


						var lineCount = request.getLineItemCount('custpage_itemlist');
						var item = '';
						var binArr = new Array();
						var binStr = '';
						var recCnt = 1;
						for(var p=0;p<lineCount;p++){
							var isSelected = request.getLineItemValue(
									'custpage_itemlist','custpage_select', p+1);
							if(isSelected=='T')
							{
								item = request.getLineItemValue('custpage_itemlist',
										'custpage_itemid', p+1);
								bin = request.getLineItemValue('custpage_itemlist',
										'custpage_binid', p+1);

								

								if(item != null && item != '')
									crecord.setLineItemValue('item','item', recCnt, item);

								if(bin != null && bin != '')
									crecord.setLineItemValue('item','binnumber', recCnt, bin);
								recCnt = parseInt(recCnt)+1;	
							}
						}

						try{
							var recid = nlapiSubmitRecord(crecord);
							
						}catch(e)
						{
							var errstr = '';
							if (e instanceof nlobjError) 
							{	
								errstr = e.getDetails();
								nlapiLogExecution('ERROR', 'into if',errstr);
							}
							else
							{
								errstr = e.toString();
							}

							msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
									"showAlertBox('div__alert', 'Error', '"+errstr+"'," +
									" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
							"</script></div>");
							response.writePage(form);
							return;
						}

						if(recid != null && recid != '')
						{
							var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');

							customrecord.setFieldValue('name', recid);
							customrecord.setFieldValue('custrecord_wmsse_tasktype', 7);
							customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 31);
							if(vassignedto != null && vassignedto != '')
								customrecord.setFieldValue('custrecord_wmsse_task_assignedto', vassignedto);

							var opentaskrecid = nlapiSubmitRecord(customrecord);
							
						}

					}
				}
				nlapiLogExecution('DEBUG','Remaining usage at the end of response1',
						context.getRemainingUsage());
				if(recid != null && recid != '')
				{
					try{
						var srkform = nlapiCreateForm('Cycle Count success');
						srkform.setScript('customscript_wmsse_cyclecountclient');
						var vnmsg = srkform.addField('custpage_message', 'inlinehtml',
								null, null, null).setLayoutType('outside','startrow');		  
						srkform.addButton('custpage_generatesearch','New Cycle Count',
						'backtogeneratesearch()');

						vnmsg.setDefaultValue("<div id='div__alert' align='center'></div>" +
								"<script>showAlertBox('div__alert', 'Confirmation'," +
								" 'Cycle Count record created successfully', " +
								"NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);" +
						"</script></div>");
						var htmlstring="";

						htmlstring="cycle count record created successfully";

						

						srkform.addButton('custpage_startcount','Start Count','startCount('+recid+')');

						response.writePage(srkform);
						return;
					}
					catch(e)
					{
						nlapiLogExecution('ERROR', 'Error in processing',e);
						var errstr = '';
						if (e instanceof nlobjError) 
						{	
							errstr = e.getDetails();
							nlapiLogExecution('ERROR', 'into if',errstr);
						}
						else
						{
							errstr = e.toString();
						}
						nlapiLogExecution('ERROR', 'errstr',errstr);
						vnmsg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
								"showAlertBox('div__alert', 'Error', '"+errstr+"', " +
								"NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);" +
						"</script></div>");
						response.writePage(srkform);
						return;
					}
				}
				else{
					nlapiLogExecution('ERROR', 'something went wrong');

				}
			}

		}
		catch(e)
		{
			nlapiLogExecution('ERROR', 'Error in processing',e);
			if (e instanceof nlobjError) 
			{	
				expStr = e.getDetails();
				nlapiLogExecution('ERROR', 'into if',expStr);
			}
			else
			{
				expStr = e.toString();
			}

			nlapiLogExecution('ERROR', 'expStr',expStr);
			if(expStr != '' && expStr != null)
			{
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
						"showAlertBox('div__alert', 'ERROR', '"+expStr+"'," +
				" NLAlertDialog.TYPE_HIGH_PRIORITY, '100%', null, null, null);</script></div>");

			}
			response.writePage(form);
			return;
		}
		finally
		{
			nlapiLogExecution('DEBUG','Remaining usage finally',
					context.getRemainingUsage());
		}
		response.writePage(form);
		return;
	}

}

/**
 * Description: This function is to generate all bin locations based on given Critiria
 * 				using Load Search.
 * @returns {Void} Array of Bin Locations
 */
function fnGetBinDetails(zone,loc,binArr1,aisle,binArr,maxno){

	var result = nlapiLoadSearch('bin', 'customsearch_wmsse_loadsearch_bins_cc');

	if(zone != null && zone != '' && zone != '-None-')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_zone', null, 'anyof', zone));

	if(loc!= null && loc!= '')
		result.addFilter(new nlobjSearchFilter('location',null, 'anyof', loc));

	if(binArr1!= null && binArr1!= '')
		result.addFilter(new nlobjSearchFilter('internalid',null, 'anyof', binArr1));

	if(aisle!= null && aisle!= '' && aisle != '- None -')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_aisle',null, 'is', aisle));

	result.addFilter(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type',null, 'noneof', ['3','4']));

	if(maxno != -1)
	{
		result.addFilter(new nlobjSearchFilter('internalidnumber', null,
				'greaterthan', parseInt(maxno)));
	}

	var resLen = result.runSearch();
	var sum ;
	var q=0;
	//returns upto 4000 results in one execution
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		q++;
		binArr[0].push(searchResult.getValue('internalid'));
		binArr[1].push(searchResult.getValue('binnumber'));

		if(q==4000)
		{
			var maxno = searchResult.getValue('internalid');
			fnGetBinDetails(zone,loc,binArr1,aisle,binArr,maxno);
			return false; 			 // return false to come out of loop
		}
		return true;                // return true to keep iterating
			});
	return binArr;
}

/**
 * Description: This function is to sort all bin locations according to 
 * Pick Sequence number
 * @returns {Void} Array of Bin Locations
 */
function fnGetBinDetailsSort(zone,loc,binArr1,aisle,binArr)
{
	var result = nlapiLoadSearch('bin', 'customsearch_wmsse_cyccnt_bins_sort');

	if(zone != null && zone != '' && zone != '-None-')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_zone', null, 'anyof', zone));

	if(loc!= null && loc!= '')
		result.addFilter(new nlobjSearchFilter('location',null, 'anyof', loc));

	if(binArr1!= null && binArr1!= '')
		result.addFilter(new nlobjSearchFilter('internalid',null, 'anyof', binArr1));

	if(aisle!= null && aisle!= '' && aisle != '- None -')
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_aisle',null, 'is', aisle));

	result.addFilter(new nlobjSearchFilter('custrecord_wmsse_bin_loc_type',null, 'noneof', ['3','4']));

	var resLen = result.runSearch();
	var sum ;
	var q=0;
	//returns upto 4000 results in one execution
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		q++;
		binArr[0].push(searchResult.getValue('internalid'));
		binArr[1].push(searchResult.getValue('binnumber'));

		if(q==4000)
		{			
			return false; 			 // return false to come out of loop
		}
		return true;                // return true to keep iterating
			});
	return binArr;
}

/**
 * This function is used to validate Cycle count Generate and Release form
 */
function OnSave(type,name)
{
	var tempFlag="F";
	var lineCnt = nlapiGetLineItemCount('custpage_itemlist');
	var validateFlag = nlapiGetFieldValue('custpage_hiddenfieldselectpage');

	for(var i=1;i<=lineCnt;i++)
	{
		var isSelected=nlapiGetLineItemValue('custpage_itemlist', 'custpage_select', i);
		if(isSelected == 'T')
		{
			tempFlag = 'T';
			break;
		}
	}
	if(tempFlag == 'F' && validateFlag != 'T')
	{
		alert('Please select atleast one line Item');
		return false;
	}
	return true;
}//end of OnSave


/**
 * This function is to validate paging.
 * 
 */
function  SelectPage_fieldchanged(type,name)
{
	if(trim(name)==trim('custpage_selectpage'))
	{
		nlapiSetFieldValue('custpage_hiddenfieldselectpage','T');
		//nlapiSetFieldValue('custpage_hiddenpagesizechange','F');
		NLDoMainFormButtonAction("submitter",true);	
	}
	else
	{
		return true;
	}
	/*else if(trim(name)==trim('custpage_pagesize'))
	{
		var pageSize = nlapiGetFieldValue('custpage_pagesize');
		//If PageSize is above 150 then System may throw script execution limit exceeded error.
		if(parseInt(pageSize) > 150)
		{
			alert('The value in the Page Size field cannot exceed 150.');
			return false;
		}
		nlapiSetFieldValue('custpage_hiddenfieldselectpage','T');
		nlapiSetFieldValue('custpage_hiddenpagesizechange','T');
		NLDoMainFormButtonAction("submitter",true);	
	}*/

}//end of field change function

function fnGetItemDetails(itemIdArr,itemGrp,itemFamily,loc,subsidiary,department,cycClass,maxno,results,getExpStartDate,getExpEndDate,itemFreq,binArr1)
{
	var itemResult = nlapiLoadSearch('item', 'customsearch_wmsse_cyccnt_items_srh');

	if(itemIdArr != null && itemIdArr != '')
		itemResult.addFilter(new nlobjSearchFilter('internalid',null, 'anyof',itemIdArr));

	if(itemGrp != null && itemGrp != '')
		itemResult.addFilter(new nlobjSearchFilter('custitem_wmsse_itemgroup',null,'anyof',itemGrp));

	if(itemFamily != null && itemFamily != '')
		itemResult.addFilter(new nlobjSearchFilter('custitem_wmsse_itemfamily',null, 'anyof',itemFamily));
	
	if(binArr1 != null && binArr1 != '')
		itemResult.addFilter(new nlobjSearchFilter('binnumber','binonhand', 'anyof',binArr1));

	if(loc != null && loc != '')
	{
		itemResult.addFilter(new nlobjSearchFilter('inventorylocation',null, 'anyof',loc));
		itemResult.addFilter(new nlobjSearchFilter('location',null,'anyof',['@NONE@',loc]));
	}

	if(subsidiary != null && subsidiary != '')
		itemResult.addFilter(new nlobjSearchFilter('subsidiary',null, 'anyof',subsidiary));

	if(department != null && department != '')
	{
		itemResult.addFilter(new nlobjSearchFilter('department',null, 'anyof',department));
	}
	if(cycClass != null && cycClass != '')
	{
		itemResult.addFilter(new nlobjSearchFilter('class',null, 'anyof',cycClass));
	}

	if(itemFreq == 'T' && getExpStartDate != null && getExpStartDate != '' && loc!= null && loc!= '')
	{	
		itemResult.addFilter(new nlobjSearchFilter('inventorylocation',null, 'anyof', loc));
		itemResult.addFilter(new nlobjSearchFilter('locationnextinvtcountdate',null, 'onorafter', getExpStartDate));
	}
	if(itemFreq == 'T' && getExpEndDate != null && getExpEndDate != '' && loc!= null && loc!= '')
	{
		itemResult.addFilter(new nlobjSearchFilter('inventorylocation',null, 'anyof', loc));
		itemResult.addFilter(new nlobjSearchFilter('locationnextinvtcountdate',null, 'onorbefore', getExpEndDate));
	}

	if(maxno != -1)
	{
		itemResult.addFilter(new nlobjSearchFilter('internalidnumber', null,'greaterthan', parseInt(maxno)));
	}

	var resLen = itemResult.runSearch();
	var sum ;
	var q=0;
	//returns upto 4000 results in one execution
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		q++;
		results.push(searchResult);

		if(q==4000)
		{
			var maxno = searchResult.getValue('internalid');
			fnGetItemDetails(itemIdArr,itemGrp,itemFamily,loc,subsidiary,department,cycClass,maxno,results,getExpStartDate,getExpEndDate,itemFreq,binArr1);
			return false; 			 // return false to come out of loop
		}
		return true;                // return true to keep iterating
			});
	return results;

}


function fnGetItemDetailsSort(itemIdArr,loc,results,getExpStartDate,getExpEndDate,itemFreq,binArrayId)
{
	var itemResult = nlapiLoadSearch('item', 'customsearch_wmsse_cycc_sortbin_srh');

	if(itemIdArr != null && itemIdArr != '')
		itemResult.addFilter(new nlobjSearchFilter('internalid',null, 'anyof',itemIdArr));

	itemResult.addFilter(new nlobjSearchFilter('quantityonhand','binOnHand', 'greaterthan', 0));

	if(itemFreq == 'T' && getExpStartDate != null && getExpStartDate != '' && loc!= null && loc!= '')
	{
		itemResult.addFilter(new nlobjSearchFilter('inventorylocation',null, 'anyof', loc));
		itemResult.addFilter(new nlobjSearchFilter('locationnextinvtcountdate',null, 'onorafter', getExpStartDate));
	}
	if(itemFreq == 'T' && getExpEndDate != null && getExpEndDate != '' && loc!= null && loc!= '')
	{
		itemResult.addFilter(new nlobjSearchFilter('inventorylocation',null, 'anyof', loc));
		itemResult.addFilter(new nlobjSearchFilter('locationnextinvtcountdate',null, 'onorbefore', getExpEndDate));
	}

	if(binArrayId!=null && binArrayId!='')
	{
		itemResult.addFilter(new nlobjSearchFilter('binnumber','binOnHand', 'anyof', binArrayId));
	}
	if(loc!= null && loc!= '')
	{
		itemResult.addFilter(new nlobjSearchFilter('location','binOnHand', 'anyof', loc));
	}

	var resLen = itemResult.runSearch();
	var sum ;
	var q=0;
	//returns upto 4000 results in one execution
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		q++;
		results.push(searchResult);

		if(q==4000)
		{
			return false; 			 // return false to come out of loop
		}
		return true;                // return true to keep iterating
			});
	return results;

}

function fnGetItemDetailsZero(nonFreqItems,results,maxno)
{
	var itemResult = nlapiLoadSearch('item', 'customsearch_wmsse_cycc_zerobin_srh');

	if(nonFreqItems != null && nonFreqItems != '')
		itemResult.addFilter(new nlobjSearchFilter('internalid',null, 'anyof',nonFreqItems));

	if(maxno != -1)
	{
		itemResult.addFilter(new nlobjSearchFilter('internalidnumber', null,'greaterthan', parseInt(maxno)));
	}

	var resLen = itemResult.runSearch();
	var sum ;
	var q=0;
	//returns upto 4000 results in one execution
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		q++;
		results.push(searchResult);

		if(q==4000)
		{
			var maxno = searchResult.getValue('internalid');
			fnGetItemDetailsZero(nonFreqItems,results,maxno);
			return false; 			 // return false to come out of loop
		}
		return true;                // return true to keep iterating
			});
	return results;
}

function fnGetItemDetailsCycc(freqItems,itemFreq,getExpStartDate,loc,getExpEndDate,binArrayId,objInvDetails,maxno)
{
	var itemResult = nlapiLoadSearch('item', 'customsearch_wmsse_itemsrh_cyccnt');

	if(freqItems != null && freqItems != '')
		itemResult.addFilter(new nlobjSearchFilter('internalid',null, 'anyof',freqItems));

	itemResult.addFilter(new nlobjSearchFilter('quantityonhand','binOnHand', 'greaterthan', 0));

	if(itemFreq == 'T' && getExpStartDate != null && getExpStartDate != '' && loc!= null && loc!= '')
	{	
		itemResult.addFilter(new nlobjSearchFilter('inventorylocation',null, 'anyof', loc));
		itemResult.addFilter(new nlobjSearchFilter('locationnextinvtcountdate',null, 'onorafter', getExpStartDate));
	}
	if(itemFreq == 'T' && getExpEndDate != null && getExpEndDate != '' && loc!= null && loc!= '')
	{
		itemResult.addFilter(new nlobjSearchFilter('inventorylocation',null, 'anyof', loc));
		itemResult.addFilter(new nlobjSearchFilter('locationnextinvtcountdate',null, 'onorbefore', getExpEndDate));
	}

	if(binArrayId!=null && binArrayId!='')
	{
		itemResult.addFilter(new nlobjSearchFilter('binnumber','binOnHand', 'anyof', binArrayId));
	}
	if(loc!= null && loc!= '')
	{
		itemResult.addFilter(new nlobjSearchFilter('location','binOnHand', 'anyof', loc));
	}

	if(maxno != -1)
	{
		itemResult.addFilter(new nlobjSearchFilter('internalidnumber', null,'greaterthan', parseInt(maxno)));
	}

	var resLen = itemResult.runSearch();
	var sum ;
	var q=0;
	//returns upto 4000 results in one execution
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		q++;
		objInvDetails.push(searchResult);

		if(q==4000)
		{
			var maxno = searchResult.getValue('internalid');
			fnGetItemDetailsCycc(freqItems,itemFreq,getExpStartDate,loc,getExpEndDate,binArrayId,objInvDetails,maxno)
			return false; 			 // return false to come out of loop
		}
		return true;                // return true to keep iterating
			});
	return objInvDetails;
}

function fnGetBinDetailsWithZeroQty(loc,binArr1,binArr,itemIdArr,getExpStartDate,getExpEndDate,itemFreq)
{
	var result = nlapiLoadSearch('inventorydetail', 'customsearch_wmsse_cyc_countbinszero');

	if(loc!= null && loc!= '')
		result.addFilter(new nlobjSearchFilter('location',null, 'anyof', loc));

	if(itemIdArr!= null && itemIdArr!= '')
		result.addFilter(new nlobjSearchFilter('item',null, 'anyof', itemIdArr));

	if(binArr1!= null && binArr1!= '')
		result.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binArr1));

	if(itemFreq == 'T' && getExpStartDate != null && getExpStartDate != '' && loc!= null && loc!= '')
	{	
		result.addFilter(new nlobjSearchFilter('inventorylocation','item', 'anyof', loc));
		result.addFilter(new nlobjSearchFilter('locationnextinvtcountdate','item', 'onorafter', getExpStartDate));
	}
	if(itemFreq == 'T' && getExpEndDate != null && getExpEndDate != '' && loc!= null && loc!= '')
	{
		result.addFilter(new nlobjSearchFilter('inventorylocation','item', 'anyof', loc));
		result.addFilter(new nlobjSearchFilter('locationnextinvtcountdate','item', 'onorbefore', getExpEndDate));
	}

	var resLen = result.runSearch();
	var loadSrhItr = 0;
	//returns upto 4000 results in one execution
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		loadSrhItr++;
		var binId = searchResult.getValue('internalid','binnumber','group');
		var binnum = searchResult.getText('binnumber',null,'group');
		var binitem = searchResult.getText('item',null,'group');
		var binItemId = searchResult.getText('internalid','item','group');

		binArr[0].push(binId);
		binArr[1].push(binnum);
		binArr[2].push(binitem);
		binArr[3].push(binItemId);

		if(loadSrhItr == 4000)
		{
			return false; 			 // return false to come out of loop
		}
		return true;                // return true to keep iterating
			});

	return binArr;
}

function fnGetBinDetailsWithZeroQtySort(loc,binArrayId,binarray,itemIdArr,getExpStartDate,getExpEndDate,itemFreq)
{
	var result = nlapiLoadSearch('inventorydetail', 'customsearch_wmsse_cyc_csortbinszero');

	if(loc!= null && loc!= '')
		result.addFilter(new nlobjSearchFilter('location',null, 'anyof', loc));

	if(itemIdArr!= null && itemIdArr!= '')
		result.addFilter(new nlobjSearchFilter('item',null, 'anyof', itemIdArr));

	if(binArrayId!= null && binArrayId!= '')
		result.addFilter(new nlobjSearchFilter('binnumber',null, 'anyof', binArrayId));

	if(itemFreq == 'T' && getExpStartDate != null && getExpStartDate != '' && loc!= null && loc!= '')
	{	
		result.addFilter(new nlobjSearchFilter('inventorylocation','item', 'anyof', loc));
		result.addFilter(new nlobjSearchFilter('locationnextinvtcountdate','item', 'onorafter', getExpStartDate));
	}
	if(itemFreq == 'T' && getExpEndDate != null && getExpEndDate != '' && loc!= null && loc!= '')
	{
		result.addFilter(new nlobjSearchFilter('inventorylocation','item', 'anyof', loc));
		result.addFilter(new nlobjSearchFilter('locationnextinvtcountdate','item', 'onorbefore', getExpEndDate));
	}

	var resLen = result.runSearch();
	var loadSrhItr = 0;
	//returns upto 4000 results in one execution
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		loadSrhItr++;
		binarray[0].push(searchResult.getValue('internalid','binnumber','group'));
		binarray[1].push(searchResult.getText('binnumber',null,'group'));
		binarray[2].push(searchResult.getText('item',null,'group'));
		binarray[3].push(searchResult.getText('internalid','item','group'));

		if(loadSrhItr == 4000)
		{
			return false; 			 // return false to come out of loop
		}
		return true;                // return true to keep iterating
			});	

	return binarray;
}