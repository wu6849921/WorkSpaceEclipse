/**
 * Script Description
 * This script is used to Generate Replenishment process.
 */
/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function ReplenishGUI(request, response)
{
	var context = nlapiGetContext();
	var size = context.getPreference('LISTSEGMENTSIZE');//to retrieve number of lines in the sublist per page.
	nlapiLogExecution('DEBUG','size',size);

	if(size == null || size == '' || size == undefined || size == 0)
		size = 50;

	if (request.getMethod() == 'GET') 
	{
		var form = nlapiCreateForm('Generate Replenishment'); //Creates new form for Generate Replenishment.
		form.setScript('customscript_wmmse_gui_replen_cl'); //invokes client script.

		var whLocation = form.addField('custpage_location', 'select', 'Location').setMandatory(true); // added warehouse location field to the form.

		whLocation.addSelectOption("","");

		var vRolebasedLocation = getRoledBasedLocation(); // To fetch role based warehouse locations.

		if(vRolebasedLocation==null || vRolebasedLocation=='' || vRolebasedLocation==0)
		{
			vRolebasedLocation = new Array();
			var filters=new Array();
			filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site', null, 'is', 'T'));
			filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
			var searchresults = nlapiSearchRecord('location', null, filters, null);
			if(searchresults != null && searchresults !='')
			{				
				for(var locItr = 0; locItr < searchresults.length; locItr++)
				{
					vRolebasedLocation.push(searchresults[locItr].getId());
				}

			}
		}

		var roleBasedLocationArray=getLocationName(vRolebasedLocation); 

		if(roleBasedLocationArray != null && roleBasedLocationArray != '' && roleBasedLocationArray != 'null')
		{
			for (var roleLocItr = 0; roleBasedLocationArray != null && roleLocItr < roleBasedLocationArray.length; roleLocItr++) 
			{
				if(roleBasedLocationArray[roleLocItr][0] != null && roleBasedLocationArray[roleLocItr][0] != "" && 
						roleBasedLocationArray[roleLocItr][0] != " ")
				{
					var tslocation = form.getField('custpage_location').getSelectOptions(roleBasedLocationArray[roleLocItr][0], 'is');
					if (tslocation != null && tslocation != '') 
					{
						if (tslocation.length > 0) 
						{
							continue;
						}
					}
					whLocation.addSelectOption(roleBasedLocationArray[roleLocItr][0], roleBasedLocationArray[roleLocItr][1]);
				}
			}
		}
		//Setting location value as default if the subsidiary have only one location.
		if(vRolebasedLocation.length==1)
		{
			whLocation.setDefaultValue(vRolebasedLocation[0]);	
		}

		var itemclassification = form.addField('custpage_itemclassification', 'select', 
				'Item Classification','customlist_wmsse_abcvelocity');  //added Item Classification field to the form

		var itemfamily = form.addField('custpage_itemfamily', 'select', 'Item Family', 'customrecord_wmsse_item_family'); //added Item Family field to the form

		var itemgroup = form.addField('custpage_itemgroup', 'select', 'Item Group', 'customrecord_wmsse_itemgroup');  //added Item Group field to the form

		var VItem = form.addField('custpage_item', 'multiselect', 'Item','item');  //added Item field to the form

		form.addSubmitButton('Display'); 
		response.writePage(form);
	}
	else 
	{
		var timestamp1 = new Date();

		nlapiLogExecution('DEBUG','Remaining usage at the start of response',context.getRemainingUsage());
		var form = nlapiCreateForm('Generate Replenishment'); //Creates new form for Generate Replenishment
		form.setScript('customscript_wmmse_gui_replen_cl');//to invoke client script

		var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');

		var hdnselect= form.addField('custpage_hiddenfieldselectpage','checkbox','Validate Select').setDisplayType("hidden");

		var hdnselectAll = form.addField('custpage_hiddenselectallflag','longtext','Select All').setDisplayType("hidden");
		nlapiLogExecution('ERROR', 'hdnselectAll', request.getParameter('custpage_hiddenselectallflag'));
		if(request.getParameter('custpage_hiddenselectallflag') !='' && request.getParameter('custpage_hiddenselectallflag') !=null)
		{
			hdnselectAll.setDefaultValue(request.getParameter('custpage_hiddenselectallflag'));	
		}

		var RPLNArray = new Array();
		RPLNArray["custparam_item"]=request.getParameter('custpage_item');
		var vitem=request.getParameter('custpage_item');

		RPLNArray["custparam_location"]=request.getParameter('custpage_location');
		RPLNArray["custparam_itemfamily"]=request.getParameter('custpage_itemfamily');
		RPLNArray["custparam_itemgroup"]=request.getParameter('custpage_itemgroup');
		RPLNArray["custparam_itemclassification"]=request.getParameter('custpage_itemclassification');
		RPLNArray["custparam_assainedto"]=request.getParameter('custpage_assainedto');

		var actualBeginTime = request.getParameter('custpage_actualbegintime');

		var lineCount = request.getLineItemCount('custpage_packinglist');
		addSublistToForm(form); //To bind sublist to the form 
		try
		{
			var whLocation = form.addField('custpage_location', 'select', 'Location').setMandatory(true);//adds select field to the form

			whLocation.addSelectOption("","");

			var vRolebasedLocation = getRoledBasedLocation(); // To get role based wh locations

			if(vRolebasedLocation==null || vRolebasedLocation=='' || vRolebasedLocation==0)
			{
				vRolebasedLocation = new Array();
				var filters=new Array();
				filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site', null, 'is', 'T'));
				filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
				var searchresults = nlapiSearchRecord('location', null, filters, null);
				if(searchresults != null && searchresults !='')
				{				
					for(var locItr = 0; locItr < searchresults.length; locItr++)
					{
						vRolebasedLocation.push(searchresults[locItr].getId());
					}
				}
			}

			var roleBasedLocationArray=getLocationName(vRolebasedLocation);

			if(roleBasedLocationArray != null && roleBasedLocationArray != '' && roleBasedLocationArray != 'null')
			{
				for (var roleLocItr = 0; roleBasedLocationArray != null && roleLocItr < roleBasedLocationArray.length; roleLocItr++) 
				{
					if(roleBasedLocationArray[roleLocItr][0] != null && roleBasedLocationArray[roleLocItr][0] != "" && 
							roleBasedLocationArray[roleLocItr][0] != " ")
					{
						var tslocation = form.getField('custpage_location').getSelectOptions(roleBasedLocationArray[roleLocItr][0], 'is');
						if (tslocation != null && tslocation != '') 
						{
							if (tslocation.length > 0) 
							{
								continue;
							}
						}
						whLocation.addSelectOption(roleBasedLocationArray[roleLocItr][0], roleBasedLocationArray[roleLocItr][1]);
					}
				}
			}

			if(request.getParameter('custpage_location')!='' && request.getParameter('custpage_location')!=null)
			{
				whLocation.setDefaultValue(request.getParameter('custpage_location'));	
			}

			var itemclassification = form.addField('custpage_itemclassification', 'select', 
					'Item Classification','customlist_wmsse_abcvelocity');//binds Item Classification to the form

			if(request.getParameter('custpage_itemclassification')!='' && request.getParameter('custpage_itemclassification')!=null)
			{
				itemclassification.setDefaultValue(request.getParameter('custpage_itemclassification'));	
			}

			var itemfamily = form.addField('custpage_itemfamily', 'select', 'Item Family', 'customrecord_wmsse_item_family');//binds item family to the form

			if(request.getParameter('custpage_itemfamily')!='' && request.getParameter('custpage_itemfamily')!=null)
			{
				itemfamily.setDefaultValue(request.getParameter('custpage_itemfamily'));	
			}

			var itemgroup = form.addField('custpage_itemgroup', 'select', 'Item Group', 'customrecord_wmsse_itemgroup');//binds item group to the form

			if(request.getParameter('custpage_itemgroup')!='' && request.getParameter('custpage_itemgroup')!=null)
			{
				itemgroup.setDefaultValue(request.getParameter('custpage_itemgroup'));	
			}

			var Item = form.addField('custpage_item', 'multiselect', 'Item','item');//binds item to the form

			if(request.getParameter('custpage_item')!='' && request.getParameter('custpage_item')!=null)
			{
				if(request.getParameter('custpage_item')!='' && request.getParameter('custpage_item')!=null)
				{
					var itemValue=request.getParameter('custpage_item');
					var itemArray = new Array();
					itemArray = itemValue.split('');
					nlapiLogExecution('DEBUG', 'multiselect',itemArray.length);	
				}
				Item.setDefaultValue(request.getParameter('custpage_item'));
			}

			var assainedTo = form.addField('custpage_assainedto', 'select', 'Assigned To','employee');//binds Assigned To field to form
			var assignedTo = '';
			if(request.getParameter('custpage_assainedto')!='' && request.getParameter('custpage_assainedto')!=null)
			{
				assainedTo.setDefaultValue(request.getParameter('custpage_assainedto'));	
				assignedTo = request.getParameter('custpage_assainedto');
			}

			var VactualBeginTime = form.addField('custpage_actualbegintime','text', 'Actual Begin Time').setDisplayType('hidden');
			VactualBeginTime.setDefaultValue(request.getParameter('custpage_actualbegintime'));

			//hidden field to retrieve data of selected lines, when markall is not pressed.
			var oldResponse = form.addField('custpage_oldresponse','longtext', 'Old Response').setDisplayType('hidden');
			if(request.getParameter('custpage_oldresponse')!='' && request.getParameter('custpage_oldresponse')!=null)
			{
				oldResponse.setDefaultValue(request.getParameter('custpage_oldresponse'));	
			}

			var totalOldResponse = request.getParameter('custpage_oldresponse');
			if(totalOldResponse == '' || totalOldResponse == null || totalOldResponse == undefined || totalOldResponse == 'null')
				totalOldResponse = '';

			//hidden field to retrieve data of selected lines, when markall is not pressed and data is more than 100000 characters.
			var oldResponseContinue = form.addField('custpage_oldresponsecontinue','longtext', 'Old Response Continue').setDisplayType('hidden');
			if(request.getParameter('custpage_oldresponsecontinue')!='' && request.getParameter('custpage_oldresponsecontinue')!=null)
			{
				oldResponseContinue.setDefaultValue(request.getParameter('custpage_oldresponsecontinue'));	
			}

			var totalOldResponseCont = request.getParameter('custpage_oldresponsecontinue');
			if(totalOldResponseCont == '' || totalOldResponseCont == null || totalOldResponseCont == undefined || totalOldResponseCont == 'null')
				totalOldResponseCont = '';

			//hidden field to retrieve selected lines, when markall is not pressed
			var selectedLineDetails = form.addField('custpage_selectedlines','longtext', 'Selected lines').setDisplayType('hidden');
			if(request.getParameter('custpage_selectedlines')!='' && request.getParameter('custpage_selectedlines')!=null)
			{
				selectedLineDetails.setDefaultValue(request.getParameter('custpage_selectedlines'));	
			}

			var totalSelectedLines = request.getParameter('custpage_selectedlines');
			if(totalSelectedLines == '' || totalSelectedLines == null || totalSelectedLines == undefined || totalSelectedLines == 'null')
				totalSelectedLines = '';

			//hidden field to retrieve unselected lines, if markall button is pressed
			var unSelectedLineDetails = form.addField('custpage_unselectedlines','longtext', 'Un Selected lines').setDisplayType('hidden');
			if(request.getParameter('custpage_unselectedlines')!='' && request.getParameter('custpage_unselectedlines')!=null)
			{
				unSelectedLineDetails.setDefaultValue(request.getParameter('custpage_unselectedlines'));	
			}

			var totalUnSelectedLines = request.getParameter('custpage_unselectedlines');
			if(totalUnSelectedLines == '' || totalUnSelectedLines == null || totalUnSelectedLines == undefined || totalUnSelectedLines == 'null')
				totalUnSelectedLines = '';

			//hidden field to retrieve unselected lines, if markall button is pressed
			var oldResponseContItem1 = form.addField('custpage_oldresponsecontitem1','longtext', 'Old Item 1').setDisplayType('hidden');
			if(request.getParameter('custpage_oldresponsecontitem1')!='' && request.getParameter('custpage_oldresponsecontitem1')!=null)
			{
				oldResponseContItem1.setDefaultValue(request.getParameter('custpage_oldresponsecontitem1'));	
			}

			var totalOldItem1 = request.getParameter('custpage_oldresponsecontitem1');
			var totalOldItemArr1 = [];
			if(totalOldItem1 == '' || totalOldItem1 == null || totalOldItem1 == undefined || totalOldItem1 == 'null')
				totalOldItem1 = '';
			else
				totalOldItemArr1 = totalOldItem1.split(',');

			//hidden field to retrieve unselected lines, if markall button is pressed
			var oldResponseContItem2 = form.addField('custpage_oldresponsecontitem2','longtext', 'Old Item 2').setDisplayType('hidden');
			if(request.getParameter('custpage_oldresponsecontitem2')!='' && request.getParameter('custpage_oldresponsecontitem2')!=null)
			{
				oldResponseContItem2.setDefaultValue(request.getParameter('custpage_oldresponsecontitem2'));	
			}

			var totalOldItem2 = request.getParameter('custpage_oldresponsecontitem2');
			var totalOldItemArr2 = [];
			if(totalOldItem2 == '' || totalOldItem2 == null || totalOldItem2 == undefined || totalOldItem2 == 'null')
				totalOldItem2 = '';
			else
				totalOldItemArr2 = totalOldItem2.split(',');

			//hidden field to retrieve unselected lines, if markall button is pressed
			var oldResponseContItem3 = form.addField('custpage_oldresponsecontitem3','longtext', 'Old Item 3').setDisplayType('hidden');
			if(request.getParameter('custpage_oldresponsecontitem3')!='' && request.getParameter('custpage_oldresponsecontitem3')!=null)
			{
				oldResponseContItem3.setDefaultValue(request.getParameter('custpage_oldresponsecontitem3'));	
			}

			var totalOldItem3 = request.getParameter('custpage_oldresponsecontitem3');
			var totalOldItemArr3 = [];
			if(totalOldItem3 == '' || totalOldItem3 == null || totalOldItem3 == undefined || totalOldItem3 == 'null')
				totalOldItem3 = '';
			else
				totalOldItemArr3 = totalOldItem3.split(',');

			//hidden field to retrieve unselected lines, if markall button is pressed
			var oldResponseContItem4 = form.addField('custpage_oldresponsecontitem4','longtext', 'Old Item 4').setDisplayType('hidden');
			if(request.getParameter('custpage_oldresponsecontitem4')!='' && request.getParameter('custpage_oldresponsecontitem4')!=null)
			{
				oldResponseContItem4.setDefaultValue(request.getParameter('custpage_oldresponsecontitem4'));	
			}

			var totalOldItem4 = request.getParameter('custpage_oldresponsecontitem4');
			var totalOldItemArr4 = [];
			if(totalOldItem4 == '' || totalOldItem4 == null || totalOldItem4 == undefined || totalOldItem4 == 'null')
				totalOldItem4 = '';
			else
				totalOldItemArr4 = totalOldItem4.split(',');

			//hidden field to retrieve selected lines, if markall button is pressed
			var oldResponseContItem5 = form.addField('custpage_oldresponsecontitem5','longtext', 'Old Item 5').setDisplayType('hidden');
			if(request.getParameter('custpage_oldresponsecontitem5')!='' && request.getParameter('custpage_oldresponsecontitem5')!=null)
			{
				oldResponseContItem5.setDefaultValue(request.getParameter('custpage_oldresponsecontitem5'));	
			}

			var totalOldItem5 = request.getParameter('custpage_oldresponsecontitem5');
			var totalOldItemArr5 = [];
			if(totalOldItem5 == '' || totalOldItem5 == null || totalOldItem5 == undefined || totalOldItem5 == 'null')
				totalOldItem5 = '';
			else
				totalOldItemArr5 = totalOldItem5.split(',');

			var subsidiariesArr = new Array();
			subsidiariesArr = getRoleBasedSubsidiaries(); //To fetch Role based Subsidiaries
			nlapiLogExecution('DEBUG', 'subsidiariesArr',subsidiariesArr);

			var VItem = request.getParameter('custpage_item');
			var itemArray1 = new Array();
			if(VItem != null && VItem != '')
				itemArray1 = VItem.split('');
			nlapiLogExecution('DEBUG', 'replenitemmm...',itemArray1.length);	

			var VLoc = request.getParameter('custpage_location');
			var Vitemfamily = request.getParameter('custpage_itemfamily');
			var Vitemgroup = request.getParameter('custpage_itemgroup');
			var VitemClassification = request.getParameter('custpage_itemclassification');

			var itemClassText = getItemClassText(VitemClassification);
			nlapiLogExecution('DEBUG', 'itemClassText...',itemClassText);

			var itemresults = new Array();
			var maxno = -1;

			var vmakeInvAvailFlag = "T";
			var fields = ['makeinventoryavailable'];
			var vLocDetails= nlapiLookupField('location',VLoc,fields);
			vmakeInvAvailFlag = vLocDetails.makeinventoryavailable;
			
			var vLocname= nlapiLookupField('location',request.getParameter('custpage_location'),'name');
			nlapiLogExecution('DEBUG', 'vLocname', vLocname);

			var lineCount = request.getLineItemCount('custpage_items');
			var isSelected = 'F';
			var tempCnt = 0;
			var invokeScheduler = 'F';
			var iteratorHaltValue = 0;
			var oldProcessItrHaltValue = 0;
			var oldProcessContHaltValue = 0;
			var anyLineSelected = false;
			var validLine = false;

			var sItemArr = new Array();
			var sLocationArr = new Array();
			var sToBinArr = new Array();
			var sQohArr = new Array();
			var sOpenpickQtyArr = new Array();
			var sMaxQtyArr = new Array();
			var sReplenQtyArr = new Array();
			var sRoundQtyArr = new Array();
			var sBulkQtyArr = new Array();
			var sToBinIdArr = new Array();
			var sOpenRplnQtyArr = new Array();
			var sStockRateArr = new Array();
			var sStockUnitArr = new Array();
			var processedItems = [];

			nlapiLogExecution('ERROR','lineCount,totalOldResponse,totalOldResponseCont',lineCount+':'+totalOldResponse+':'+totalOldResponseCont);
			nlapiLogExecution('ERROR','custpage_hiddenfieldselectpage,Remaining usage',request.getParameter('custpage_hiddenfieldselectpage')+':'+context.getRemainingUsage());

			if(request.getParameter('custpage_hiddenfieldselectpage') != 'T')
			{
				if(request.getParameter('custpage_hiddenselectallflag') == 'mark')
				{
					//below code executes if user clicks markall button and then Generate and Release button .
					var unSelectedArr = [];
					if(totalUnSelectedLines != null && totalUnSelectedLines != '')
						unSelectedArr = totalUnSelectedLines.split(',');

					for(var processMarkItr = 0; processMarkItr < lineCount; processMarkItr++)
					{
						isSelected = request.getLineItemValue('custpage_items','custpage_select', processMarkItr+1);
						if(isSelected == 'F')
						{
							var itemMarkid = request.getLineItemValue('custpage_items','custpage_itemid', processMarkItr+1);
							unSelectedArr.push(itemMarkid);
						}
					}
					nlapiLogExecution('ERROR', 'unSelectedArr mark',unSelectedArr);

					itemresults = openreplenitems(VLoc,itemArray1,Vitemfamily,Vitemgroup,VitemClassification,subsidiariesArr,itemresults,maxno);
					//Returns the list of items for which preferred bin is configured. 

					if(itemresults != null && itemresults != '' && itemresults.length > 0)
					{ 
						nlapiLogExecution('ERROR', 'itemresults length',itemresults.length);
						var totalUOMArr = [];
						totalUOMArr = fnGetAllUOMStockRate();//To fetch all UOM records in the respective account

						for(var itemMarkIterator = 0; itemMarkIterator < itemresults.length; itemMarkIterator++)
						{
							var timestamp8 = new Date();
							var timeduration = (parseFloat(timestamp8.getTime()) - parseFloat(timestamp1.getTime()));

							if(parseFloat(context.getRemainingUsage()) > 200 && (parseFloat(timeduration)/1000 < 120))
							{
								invtClassification = itemresults[itemMarkIterator].getValue('locationinvtclassification');
								if(invtClassification != null && invtClassification != '' && itemClassText != null
										&& itemClassText != '' && invtClassification != itemClassText)
								{
									continue;
								}

								var itemInternalid = itemresults[itemMarkIterator].getId();
								if(unSelectedArr.indexOf(itemInternalid) != -1)
								{
									continue;
								}

								var getPreferBin = itemresults[itemMarkIterator].getValue('preferredbin');
								if(itemresults[itemMarkIterator].getValue('preferredbin') == "T" && 
										itemresults[itemMarkIterator].getValue('location','binnumber') == VLoc)
								{
									var itemInternalid = itemresults[itemMarkIterator].getId();
									var itemName = itemresults[itemMarkIterator].getValue('name');
									var vUnitType = itemresults[itemMarkIterator].getValue('unitstype');
									var stockUnitText = itemresults[itemMarkIterator].getText('stockunit');
									var stockUnit = itemresults[itemMarkIterator].getValue('stockunit');
									var getPreferBin = itemresults[itemMarkIterator].getValue('binnumber');
									var itemqty = itemresults[itemMarkIterator].getValue('quantityonhand');
									var replenminqty = itemresults[itemMarkIterator].getValue('custrecord_wmsse_replen_minqty','binnumber');
									var replenmaxqty = itemresults[itemMarkIterator].getValue('custrecord_wmsse_replen_maxqty','binnumber');
									var replenqty = itemresults[itemMarkIterator].getValue('custrecord_wmsse_replen_qty','binnumber');
									var replenroundqty = itemresults[itemMarkIterator].getValue('custrecord_wmsse_replen_roundqty','binnumber');
									var preferedBinId = itemresults[itemMarkIterator].getValue('internalid','binnumber');
									var vPrefBinQOH = itemresults[itemMarkIterator].getValue('binonhandcount');
									var vPrefBinQtyAvail = itemresults[itemMarkIterator].getValue('binonhandavail');
									var whLocQtyAvail = itemresults[itemMarkIterator].getValue('locationquantityavailable');
									var whLocQOH = itemresults[itemMarkIterator].getValue('locationquantityonhand');
									var qtyAvailinWH = 'No';

									var stockConversionRate = 1;
									if(vUnitType != null && vUnitType != '' && stockUnitText != null && stockUnitText != null)
										stockConversionRate = totalUOMArr[vUnitType.toString()+stockUnitText.toString()];

															
									vPrefBinQOH = Number(Big(vPrefBinQOH).div(stockConversionRate));
									vPrefBinQtyAvail = Number(Big(vPrefBinQtyAvail).div(stockConversionRate));

									if(replenminqty == null || replenminqty == '' || replenminqty == '- None -' || replenminqty == 'null')
										replenminqty=0;
									if(replenmaxqty == null || replenmaxqty == '' || replenmaxqty == '- None -' || replenmaxqty == 'null')
										replenmaxqty=0;
									if(replenqty == null || replenqty == '' || replenqty == '- None -' || replenqty == 'null')
										replenqty=0;
									if(replenroundqty == null || replenroundqty == '' || replenroundqty == '- None -' || replenroundqty == 'null')
										replenroundqty=0;
									if(vPrefBinQOH == null || vPrefBinQOH == '' || vPrefBinQOH == '- None -' || vPrefBinQOH == 'null' || isNaN(vPrefBinQOH))
										vPrefBinQOH=0;
									if(vPrefBinQtyAvail == null || vPrefBinQtyAvail == '' || vPrefBinQtyAvail == '- None -' || vPrefBinQtyAvail == 'null'
										|| isNaN(vPrefBinQtyAvail))
										vPrefBinQtyAvail=0;
									if(whLocQtyAvail == null || whLocQtyAvail == '' || whLocQtyAvail == '- None -' || whLocQtyAvail == 'null')
										whLocQtyAvail=0;

									var vAllocatedQty = Big(vPrefBinQOH).minus(vPrefBinQtyAvail);

									if((parseFloat(replenminqty) >= parseFloat(vPrefBinQOH)) && parseFloat(replenmaxqty) > 0 && parseFloat(replenminqty) >= 0 && 
											parseFloat(replenqty) > 0 && parseFloat(replenroundqty) > 0 && parseFloat(whLocQtyAvail) > 0)
									{
										anyLineSelected = true;
										var vOPenTaskPrefPickBinDetails =getOPenTaskPickBinDetailsRpln(itemInternalid,preferedBinId,VLoc,stockConversionRate);
										//To fetch Preferred bin open pick qty
										var openpickQty = 0;
										var vopenTaskBinIdArr = "";
										var vopenTaskBinQtyArr = "";
										if(vOPenTaskPrefPickBinDetails != null && 
												vOPenTaskPrefPickBinDetails != '' && 
												vOPenTaskPrefPickBinDetails.length > 0)
										{
											vopenTaskBinQtyArr = vOPenTaskPrefPickBinDetails[1];
											openpickQty = vopenTaskBinQtyArr[0];
										}

										var openRplnQty = fnOpenReplenQty(itemInternalid,VLoc,preferedBinId);
										//To get open replen quantity

										var bulkQty = 0;
										bulkQty = fnGetQtyOfBulkBins(itemInternalid, VLoc, bulkQty, preferedBinId);
										//To fetch bulk available quantity
										bulkQty = Big(bulkQty).div(stockConversionRate);

										if(openpickQty == '' || openpickQty == null || openpickQty == undefined || openpickQty == 'null')
											openpickQty = 0;

										if(bulkQty == '' || bulkQty == null || bulkQty == undefined || bulkQty == 'null')
											bulkQty = 0;

										if(openRplnQty == '' || openRplnQty == null || openRplnQty == undefined || openRplnQty == 'null')
											openRplnQty = 0;

										//Calculating remaining quantity to replen
									
										openRplnQty=Big(openRplnQty);
										vPrefBinQOH=Big(vPrefBinQOH);
										var diffQty = Big(replenmaxqty).minus((openRplnQty).plus(vPrefBinQOH).minus(openpickQty));
										nlapiLogExecution('DEBUG', 'diffQty in Big',diffQty);
										//Taking the minimum of Bulk Available Quantity and remaining quantity to replen 
										diffQty = Math.min(diffQty,bulkQty);

										if(parseFloat(diffQty) >= parseFloat(replenroundqty) || parseFloat(diffQty) != parseFloat(bulkQty))
										{
											//Rounding the final calculated quantity to replen 
																
											
											//diffQty = Number((Big(diffQty).div(replenroundqty)).mul(replenroundqty));
											
											diffQty = ((parseInt(parseFloat(diffQty)/parseFloat(replenroundqty)))*
													parseFloat(replenroundqty));
											nlapiLogExecution('DEBUG', 'diffQty 2 in big',diffQty);
										}

										if(replenqty == '' || replenqty == null || replenqty  == 'null' ||
												replenqty == 0 || replenqty == undefined)
											replenqty = diffQty;

										var opentaskcount = 0;
										//no. of Opentasks
																	
										opentaskcount = Big(diffQty).div(replenqty);
										nlapiLogExecution('DEBUG', 'opentaskcount in big2',opentaskcount);
										
										//rounding to next integer
										opentaskcount = Math.ceil(opentaskcount);

										var timestamp3 = new Date();
										var timeduration = (parseFloat(timestamp3.getTime()) - parseFloat(timestamp1.getTime()));

										var str = 'itemInternalid.' + itemInternalid + '<br/>';
										str = str + 'preferedBinId.' + preferedBinId + '<br/>';
										str = str + 'VLoc.' + VLoc + '<br/>';
										str = str + 'vPrefBinQOH.' + vPrefBinQOH + '<br/>';
										str = str + 'openpickQty.' + openpickQty + '<br/>';
										str = str + 'replenmaxqty.' + replenmaxqty + '<br/>';
										str = str + 'replenqty.' + replenqty + '<br/>';
										str = str + 'replenroundqty.' + replenroundqty + '<br/>';
										str = str + 'bulkQty.' + bulkQty + '<br/>';
										str = str + 'openRplnQty.' + openRplnQty + '<br/>';
										str = str + 'stockConversionRate.' + stockConversionRate + '<br/>';
										str = str + 'Remaining usage at the start of creating rpln tasks for each line.' + context.getRemainingUsage() + '<br/>';
										str = str + 'diffQty.' + diffQty + '<br/>';
										str = str + 'opentaskcount.' + opentaskcount + '<br/>';
										str = str + 'timeduration.' + timeduration + '<br/>';

										nlapiLogExecution('DEBUG', 'str',str);

										//If open replens are equal to bulk qty then system should not generate further for that item.
										if(Number(Big(bulkQty).minus(openRplnQty)) < Number(replenroundqty)  && Number(openRplnQty) > 0)
										{
											opentaskcount = 0;
										}

										if(parseFloat(opentaskcount) > 0)
										{
											if((parseFloat(context.getRemainingUsage()) > parseFloat(opentaskcount * 15)) && (parseFloat(timeduration)/1000 < 120))
											{
												//Below for loop creates replen open tasks 
												for(var createTaskItr = 0; createTaskItr < opentaskcount; createTaskItr++)
												{
													var recid = nlapiCreateRecord('customrecord_wmsse_trn_opentask'); 
													//Creating replen open task					
													if(itemInternalid != null && itemInternalid != '')
														recid.setFieldValue('name', itemInternalid);
													if(itemInternalid != null && itemInternalid != '')
														recid.setFieldValue('custrecord_wmsse_sku', itemInternalid);
													if(VLoc != null && VLoc != '')
														recid.setFieldValue('custrecord_wmsse_wms_location', VLoc);
													if(preferedBinId != null && preferedBinId != '')
														recid.setFieldValue('custrecord_wmsse_actendloc', preferedBinId);

													if(replenqty != null && replenqty != '' && replenqty != 'null' &&
															replenqty != undefined)
														recid.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(replenqty).toFixed(8)));
													
													if(stockUnitText != null && stockUnitText != '' && stockUnitText != 'null' && 
															stockUnitText != undefined)
														recid.setFieldValue('custrecord_wmsse_uom', stockUnitText);

													if(((parseFloat(opentaskcount)-1) == parseFloat(createTaskItr)) && replenqty != null &&
															replenqty != '' && replenqty != 'null' && replenqty != undefined &&
															((parseFloat(diffQty)%parseFloat(replenqty) == 0) != true))
													{
														replenqty = (((parseFloat(diffQty)/parseFloat(replenqty))%1)*
																parseFloat(replenqty));
														replenqty = Math.round(replenqty); 
														nlapiLogExecution('DEBUG','replenqty',replenqty);
														recid.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(replenqty).toFixed(8)));
													}
													if(assignedTo!='' && assignedTo!=null && assignedTo != 'null' &&
															assignedTo != undefined)						
														recid.setFieldValue('custrecord_wmsse_task_assignedto', assignedTo);

													recid.setFieldValue('custrecord_wmsse_wms_status_flag', '30'); //Replenishment

													recid.setFieldValue('custrecord_wmsse_tasktype', '17'); //RPLN

													if(parseFloat(replenqty) > 0)
													{
														var resultId = nlapiSubmitRecord(recid);
														nlapiLogExecution("DEBUG",'resultId',resultId);
													}
												}
											}
											else
											{
												var param = new Array();
												param['custscript_wmsse_mainitem'] = itemArray1.toString();				
												param['custscript_wmsse_sng_rpln_itemfamily'] = Vitemfamily;
												param['custscript_wmsse_sng_rpln_itemgroup'] = Vitemgroup;
												param['custscript_wmsse_sng_rpln_itemclass'] = VitemClassification;
												param['custscript_wmsse_sng_rpln_markall'] = request.getParameter('custpage_hiddenselectallflag');
												param['custscript_wmsse_sng_location'] = VLoc;
												param['custscript_wmsse_sng_rpln_itr'] = itemMarkIterator;
												param['custscript_wmsse_sng_rpln_unselectedline'] = unSelectedArr.toString();

												var currentUserID = getCurrentUser();
												var strUserID = 'R'+currentUserID;

												var day = new Date();
												var date = day.getDate();
												var month = day.getMonth();
												var year = day.getFullYear();
												var hours = day.getHours();
												var mins = day.getMinutes();
												var secs = day.getSeconds();

												var refNum = strUserID + date + month + year + hours + mins + secs;
												param['custscript_wmsse_sng_rpln_refno'] = refNum;

												//Invoking the scheduler
												var schstatus = nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
												nlapiLogExecution('DEBUG', 'Scheduled Script Status',schstatus);

												updateScheduleScriptStatus('Generate Replenishment',currentUserID,'Submitted',refNum,'Replenishment');
												//To update Schedule script status to Submitted

												var replenSchform = nlapiCreateForm('Replenishment');

												var schmsg = replenSchform.addField('custpage_schmessage', 'inlinehtml', null, null, 
														null).setLayoutType('outside','startrow');		  

												schmsg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
														"showAlertBox('div__alert', 'Confirmation', " +
														"'Replenishment process has been initiated successfully'," +
												" NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>"); //returns the confirmation message
												var htmlstring="";

												htmlstring="Replenishment scheduler has been initiated successfully";

												nlapiLogExecution('DEBUG', 'Htmlstring is:',htmlstring);

												response.writePage(replenSchform);
												return;
											}
										}
										else
										{
											var currentUserID = getCurrentUser();
											var strUserID = 'R'+currentUserID;

											var day = new Date();
											var date = day.getDate();
											var month = day.getMonth();
											var year = day.getFullYear();
											var hours = day.getHours();
											var mins = day.getMinutes();
											var secs = day.getSeconds();

											var refNum = strUserID + date + month + year + hours + mins + secs;

											var recid = nlapiCreateRecord('customrecord_wmsse_errorlog'); 
											//Creates Error Log record					
											recid.setFieldValue('name', 'Replenishment');

											recid.setFieldValue('custrecord_wmsse_error_tranref', refNum);

											recid.setFieldValue('custrecord_wmsse_error_processname', 'Generate Replenishment');

											if(itemInternalid != null && itemInternalid != '')
												recid.setFieldValue('custrecord_wmsse_error_ref1', itemInternalid);

											if(VLoc != null && VLoc != '')
												recid.setFieldValue('custrecord_wmsse_error_location', VLoc);

											if(preferedBinId != null && preferedBinId != '')
												recid.setFieldValue('custrecord_wmsse_error_ref2', preferedBinId);

											if(currentUserID!='' && currentUserID!=null && currentUserID != 'null' && currentUserID != undefined)						
												recid.setFieldValue('custrecord_wmsse_error_user', currentUserID);

											if(bulkQty == 0 || (parseFloat(openRplnQty) >= parseFloat(bulkQty)))
												recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to insufficeint quantity in bulk sotrage locations.');
											else if(openRplnQty > 0)
												recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to open replens exists for this item.');
											else
												recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed.');

											var errResultId = nlapiSubmitRecord(recid);
											nlapiLogExecution("DEBUG",'errResultId',errResultId);
										}
									}
								}
							}
							else
							{
								var param = new Array();
								param['custscript_wmsse_mainitem'] = itemArray1.toString();				
								param['custscript_wmsse_sng_rpln_itemfamily'] = Vitemfamily;
								param['custscript_wmsse_sng_rpln_itemgroup'] = Vitemgroup;
								param['custscript_wmsse_sng_rpln_itemclass'] = VitemClassification;
								param['custscript_wmsse_sng_rpln_markall'] = request.getParameter('custpage_hiddenselectallflag');
								param['custscript_wmsse_sng_location'] = VLoc;
								param['custscript_wmsse_sng_rpln_itr'] = itemMarkIterator;
								param['custscript_wmsse_sng_rpln_unselectedline'] = unSelectedArr.toString();

								var currentUserID = getCurrentUser();
								var strUserID = 'R'+currentUserID;

								var day = new Date();
								var date = day.getDate();
								var month = day.getMonth();
								var year = day.getFullYear();
								var hours = day.getHours();
								var mins = day.getMinutes();
								var secs = day.getSeconds();

								var refNum = strUserID + date + month + year + hours + mins + secs;
								param['custscript_wmsse_sng_rpln_refno'] = refNum;
								//param['custscript_wmsse_sng_rpln_userid'] = currentUserID;

								//Invoking the scheduler
								var schstatus = nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
								nlapiLogExecution('DEBUG', 'Scheduled Script Status',schstatus);

								updateScheduleScriptStatus('Generate Replenishment',currentUserID,'Submitted',refNum,'Replenishment');
								//To update Schedule script status to Submitted

								var replenSchform = nlapiCreateForm('Replenishment');

								var schmsg = replenSchform.addField('custpage_schmessage', 'inlinehtml', null, null, 
										null).setLayoutType('outside','startrow');		  

								schmsg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
										"showAlertBox('div__alert', 'Confirmation', " +
										"'Replenishment process has been initiated successfully'," +
								" NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>"); //returns the confirmation message
								var htmlstring="";

								htmlstring="Replenishment scheduler has been initiated successfully";

								nlapiLogExecution('DEBUG', 'Htmlstring is:',htmlstring);

								response.writePage(replenSchform);
								return;
							}
						}
					}
				}
				else
				{
					if(totalOldResponse != null && totalOldResponse != '' && totalOldResponse != undefined)
					{
						nlapiLogExecution('DEBUG','totalOldResponse.length',totalOldResponse.length);
						var oldResponseArr = totalOldResponse.split('|');
						if(oldResponseArr != null && oldResponseArr != '' && oldResponseArr != undefined)
						{
							anyLineSelected = true;
							nlapiLogExecution('DEBUG','oldResponseArr.length',oldResponseArr.length);
							var resultArray = processOldResponseData(oldResponseArr,timestamp1,context,request,assignedTo,oldProcessItrHaltValue,
									invokeScheduler,processedItems);
							validLine = resultArray[0];
							oldProcessItrHaltValue = resultArray[1];
							invokeScheduler = resultArray[2];
							nlapiLogExecution("DEBUG",'invokeScheduler,oldProcessContHaltValue,',invokeScheduler+','+oldProcessItrHaltValue);
							nlapiLogExecution('DEBUG','processedItems',processedItems);
							if(invokeScheduler == 'Y')
							{
								for(var oldschInvokeItr = oldProcessItrHaltValue; oldschInvokeItr < oldResponseArr.length-1; oldschInvokeItr++)
								{
									var curvalues = [];
									if(oldResponseArr[oldschInvokeItr] != null && oldResponseArr[oldschInvokeItr] != '' && oldResponseArr[oldschInvokeItr] != undefined)
										curvalues = oldResponseArr[oldschInvokeItr].split(',');
									if(curvalues != null && curvalues != '' && curvalues != undefined)
									{
										if(sItemArr.indexOf(curvalues[0]) == -1)
										{
											sItemArr.push(curvalues[0]);
											sLocationArr.push(request.getParameter('custpage_location'));
											//sToBinArr.push(curvalues[1]);
											sQohArr.push(curvalues[1]);
											sOpenpickQtyArr.push(0);
											sMaxQtyArr.push(curvalues[2]);
											sReplenQtyArr.push(curvalues[3]);
											sRoundQtyArr.push(curvalues[4]);
											sBulkQtyArr.push(0);
											sToBinIdArr.push(curvalues[5]);
											sOpenRplnQtyArr.push(0);
											sStockRateArr.push(curvalues[6]);
										}
									}
								}
								nlapiLogExecution("DEBUG",'sItemArr',sItemArr.length);
							}
						}
					}

					if(totalOldResponseCont != null && totalOldResponseCont != '' && totalOldResponseCont != undefined)
					{
						nlapiLogExecution('DEBUG','totalOldResponseCont.length',totalOldResponseCont.length);
						var oldResponseContArr = totalOldResponseCont.split('|');
						if(oldResponseContArr != null && oldResponseContArr != '' && oldResponseContArr != undefined)
						{
							nlapiLogExecution('DEBUG','oldResponseContArr.length',oldResponseContArr.length);
							if(invokeScheduler != 'Y')
							{
								anyLineSelected = true;
								var resultArray = processOldResponseData(oldResponseContArr,timestamp1,context,request,assignedTo,oldProcessContHaltValue,
										invokeScheduler,processedItems);
								validLine = resultArray[0];
								oldProcessContHaltValue = resultArray[1];
								invokeScheduler = resultArray[2];
								nlapiLogExecution("DEBUG",'invokeScheduler,oldProcessContHaltValue',invokeScheduler+','+oldProcessContHaltValue);
								if(invokeScheduler == 'Y')
								{
									for(var oldschInvokeContItr = oldProcessContHaltValue; oldschInvokeContItr < oldResponseContArr.length-1; oldschInvokeContItr++)
									{
										var curvalues = [];
										if(oldResponseContArr[oldschInvokeContItr] != null && oldResponseContArr[oldschInvokeContItr] != '' 
											&& oldResponseContArr[oldschInvokeContItr] != undefined)
											curvalues = oldResponseContArr[oldschInvokeContItr].split(',');

										if(curvalues != null && curvalues != '' && curvalues != undefined)
										{
											if(sItemArr.indexOf(curvalues[0]) == -1)
											{
												sItemArr.push(curvalues[0]);
												sLocationArr.push(request.getParameter('custpage_location'));
												//sToBinArr.push(curvalues[1]);
												sQohArr.push(curvalues[1]);
												sOpenpickQtyArr.push(0);
												sMaxQtyArr.push(curvalues[2]);
												sReplenQtyArr.push(curvalues[3]);
												sRoundQtyArr.push(curvalues[4]);
												sBulkQtyArr.push(0);
												sToBinIdArr.push(curvalues[5]);
												sOpenRplnQtyArr.push(0);
												sStockRateArr.push(curvalues[6]);
											}
										}
									}
								}
							}
							else
							{
								for(var oldschInvokeContItr = 0; oldschInvokeContItr < oldResponseContArr.length-1; oldschInvokeContItr++)
								{
									var curvalues = [];
									if(oldResponseContArr[oldschInvokeContItr] != null && oldResponseContArr[oldschInvokeContItr] != '' 
										&& oldResponseContArr[oldschInvokeContItr] != undefined)
										curvalues = oldResponseContArr[oldschInvokeContItr].split(',');

									if(curvalues != null && curvalues != '' && curvalues != undefined)
									{
										if(sItemArr.indexOf(curvalues[0]) == -1)
										{
											sItemArr.push(curvalues[0]);
											sLocationArr.push(request.getParameter('custpage_location'));
											//sToBinArr.push(curvalues[1]);
											sQohArr.push(curvalues[1]);
											sOpenpickQtyArr.push(0);
											sMaxQtyArr.push(curvalues[2]);
											sReplenQtyArr.push(curvalues[3]);
											sRoundQtyArr.push(curvalues[4]);
											sBulkQtyArr.push(0);
											sToBinIdArr.push(curvalues[5]);
											sOpenRplnQtyArr.push(0);
											sStockRateArr.push(curvalues[6]);
										}
									}
								}
								nlapiLogExecution("DEBUG",'sItemArr',sItemArr.length);
							}
						}
					}
					if(invokeScheduler != 'Y')
					{
						for(var processItr = 0; processItr < lineCount; processItr++)
						{
							isSelected = request.getLineItemValue('custpage_items','custpage_select', processItr+1);
							if(isSelected == 'T')
							{
								anyLineSelected = true;
								var timestamp5 = new Date();
								var timeduration = (parseFloat(timestamp5.getTime()) - parseFloat(timestamp1.getTime()));
								if((context.getRemainingUsage() > 200) && (parseFloat(timeduration)/1000 < 120))
								{
									tempCnt = parseInt(tempCnt)+1;
									var availQty = 0;
									var fromBin = '';
									//Fetching values from the respective line in the Sublist 
									var itemid = request.getLineItemValue('custpage_items','custpage_itemid', processItr+1);
									if(processedItems.indexOf(itemid) != -1)
									{
										continue;
									}
									var location = request.getParameter('custpage_location');

									var toBin = request.getLineItemValue('custpage_items','custpage_prefbinloc', processItr+1);
									var qoh = request.getLineItemValue('custpage_items','custpage_binqty', processItr+1);
									var openpickQty = request.getLineItemValue('custpage_items','custpage_binallocqty',processItr+1);
									var maxQty = request.getLineItemValue('custpage_items','custpage_maxqty', processItr+1);
									var replenQty = request.getLineItemValue('custpage_items','custpage_replenqty', processItr+1);
									var roundQty = request.getLineItemValue('custpage_items','custpage_roundqty', processItr+1);
									var toBinId = request.getLineItemValue('custpage_items','custpage_prefbinlocid',processItr+1);
									var stockConversionRate = request.getLineItemValue('custpage_items','custpage_stockrate',processItr+1);
									var stockUnitText = request.getLineItemValue('custpage_items','custpage_stockunit',processItr+1);
									var vOPenTaskPrefPickBinDetails =getOPenTaskPickBinDetailsRpln(itemid,toBinId,location,stockConversionRate);
									//To fetch Preferred bin open pick qty
									var openpickQty = 0;
									var vopenTaskBinIdArr = "";
									var vopenTaskBinQtyArr = "";
									if(vOPenTaskPrefPickBinDetails != null && 
											vOPenTaskPrefPickBinDetails != '' && 
											vOPenTaskPrefPickBinDetails.length > 0)
									{
										vopenTaskBinQtyArr = vOPenTaskPrefPickBinDetails[1];
										openpickQty = vopenTaskBinQtyArr[0];
									}

									var openRplnQty = fnOpenReplenQty(itemid,location,toBinId);
									//To get open replen quantity

									var bulkQty = 0;
									bulkQty = fnGetQtyOfBulkBins(itemid, location, bulkQty, toBinId);
									//To fetch bulk available quantity
									bulkQty = parseFloat(bulkQty)/parseFloat(stockConversionRate);

									if(maxQty == '' || maxQty == null || maxQty == undefined || maxQty == 'null')
										maxQty = 0;

									if(qoh == '' || qoh == null || qoh == undefined || qoh == 'null')
										qoh = 0;

									if(openpickQty == '' || openpickQty == null || openpickQty == undefined || openpickQty == 'null')
										openpickQty = 0;

									if(bulkQty == '' || bulkQty == null || bulkQty == undefined || bulkQty == 'null')
										bulkQty = 0;

									if(openRplnQty == '' || openRplnQty == null || openRplnQty == undefined || openRplnQty == 'null')
										openRplnQty = 0;

									//Calculating remaining quantity to replen
									
									openRplnQty=Big(openRplnQty);
									qoh=Big(qoh);
									var diffQty = (Big(maxQty).minus((openRplnQty).plus(qoh).minus(openpickQty)));
									nlapiLogExecution('DEBUG', 'diffQty in Big',diffQty);
									
									//Taking the minimum of Bulk Available Quantity and remaining quantity to replen 
									diffQty = Math.min(diffQty,bulkQty);

									if(parseFloat(diffQty) >= parseFloat(roundQty) || parseFloat(diffQty) != parseFloat(bulkQty))
									{
										//Rounding the final calculated quantity to replen 
									
										diffQty = ((Big(diffQty).div(roundQty)).mul(roundQty));
										nlapiLogExecution('DEBUG', 'diffQty222 in Big',diffQty);
										
									}

									if(replenQty == '' || replenQty == null || replenQty  == 'null' ||
											replenQty == 0 || replenQty == undefined)
										replenQty = diffQty;

									var opentaskcount = '';
									//no. of Opentasks
									
									opentaskcount = Big(diffQty).div(replenQty);
									nlapiLogExecution('DEBUG', 'opentaskcount in Big1',opentaskcount);
									//rounding to next integer
									opentaskcount = Math.ceil(opentaskcount);

									var timestamp3 = new Date();
									var timeduration = (parseFloat(timestamp3.getTime()) - parseFloat(timestamp1.getTime()));

									var str = 'toBin.' + toBin + '<br/>';
									str = str + 'itemid.' + itemid + '<br/>';
									str = str + 'location.' + location + '<br/>';
									str = str + 'qoh.' + qoh + '<br/>';
									str = str + 'maxQty.' + maxQty + '<br/>';
									str = str + 'replenQty.' + replenQty + '<br/>';
									str = str + 'roundQty.' + roundQty + '<br/>';
									str = str + 'toBinId.' + toBinId + '<br/>';
									str = str + 'stockConversionRate.' + stockConversionRate + '<br/>';
									str = str + 'diffQty.' + diffQty + '<br/>';
									str = str + 'openRplnQty.' + openRplnQty + '<br/>';
									str = str + 'bulkQty.' + bulkQty + '<br/>';
									str = str + 'openpickQty.' + openpickQty + '<br/>';
									str = str + 'opentaskcount.' + opentaskcount + '<br/>';
									str = str + 'timeduration in sec.' + parseFloat(timeduration)/1000 + '<br/>';
									str = str + 'remaining usage.' + context.getRemainingUsage() + '<br/>';

									nlapiLogExecution('DEBUG', 'str',str);

									//If open replens are equal to bulk qty then system should not generate further for that item.
									if(Number(Big(bulkQty).minus(openRplnQty)) < Number(roundQty)  && Number(openRplnQty) > 0)
									{
										opentaskcount = 0;
									}

									if(parseFloat(opentaskcount) > 0)
									{
										if((parseFloat(context.getRemainingUsage()) > parseFloat(opentaskcount * 15)) && (parseFloat(timeduration)/1000 < 120))
										{
											//Below for loop creates replen open tasks 
											for(var createTaskItr = 0; createTaskItr < opentaskcount; createTaskItr++)
											{
												var recid = nlapiCreateRecord('customrecord_wmsse_trn_opentask'); 
												//Creating replen open task					

												if(itemid != null && itemid != '')
													recid.setFieldValue('name', itemid);
												if(itemid != null && itemid != '')
													recid.setFieldValue('custrecord_wmsse_sku', itemid);
												if(location != null && location != '')
													recid.setFieldValue('custrecord_wmsse_wms_location', location);
												if(toBinId != null && toBinId != '')
													recid.setFieldValue('custrecord_wmsse_actendloc', toBinId);

												if(replenQty != null && replenQty != '' && replenQty != 'null' &&
														replenQty != undefined)
													recid.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(replenQty).toFixed(8)));

												if(stockUnitText != null && stockUnitText != '' && stockUnitText != 'null' && 
														stockUnitText != undefined)
													recid.setFieldValue('custrecord_wmsse_uom', stockUnitText);
												if(((parseFloat(opentaskcount)-1) == parseFloat(createTaskItr)) && replenQty != null &&
														replenQty != '' && replenQty != 'null' && replenQty != undefined &&
														((parseFloat(diffQty)%parseFloat(replenQty) == 0) != true))
												{
													replenQty = (((parseFloat(diffQty)/parseFloat(replenQty))%1)*
															parseFloat(replenQty));
													replenQty = Math.round(replenQty); 
													nlapiLogExecution('DEBUG','replenQty',replenQty);
													recid.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(replenQty).toFixed(8)));
												}

												if(assignedTo!='' && assignedTo!=null && assignedTo != 'null' &&
														assignedTo != undefined)						
													recid.setFieldValue('custrecord_wmsse_task_assignedto', assignedTo);

												recid.setFieldValue('custrecord_wmsse_wms_status_flag', '30'); //Replenishment

												recid.setFieldValue('custrecord_wmsse_tasktype', '17'); //RPLN

												if(parseFloat(replenQty) > 0)
												{
													var resultId = nlapiSubmitRecord(recid);
													nlapiLogExecution('DEBUG','resultId',resultId);
												}
											}
										}
										else
										{
											iteratorHaltValue = processItr;
											nlapiLogExecution("DEBUG",'iteratorHaltValue',iteratorHaltValue);
											invokeScheduler = 'Y';
											break;
										}
									}
									else
									{
										var currentUserID = getCurrentUser();
										var strUserID = 'R'+currentUserID;

										var day = new Date();
										var date = day.getDate();
										var month = day.getMonth();
										var year = day.getFullYear();
										var hours = day.getHours();
										var mins = day.getMinutes();
										var secs = day.getSeconds();

										var refNum = strUserID + date + month + year + hours + mins + secs;
										nlapiLogExecution('DEBUG','refNum',refNum);

										var recid = nlapiCreateRecord('customrecord_wmsse_errorlog'); 
										//Creates Error Log record				
										recid.setFieldValue('name', 'Replenishment');

										recid.setFieldValue('custrecord_wmsse_error_tranref', refNum);

										recid.setFieldValue('custrecord_wmsse_error_processname', 'Generate Replenishment');

										if(itemid != null && itemid != '')
											recid.setFieldValue('custrecord_wmsse_error_ref1', itemid);

										if(location != null && location != '')
											recid.setFieldValue('custrecord_wmsse_error_location', location);

										if(toBinId != null && toBinId != '')
											recid.setFieldValue('custrecord_wmsse_error_ref2', toBinId);

										if(currentUserID!='' && currentUserID!=null && currentUserID != 'null' && currentUserID != undefined)						
											recid.setFieldValue('custrecord_wmsse_error_user', currentUserID);

										if(bulkQty == 0 || (parseFloat(openRplnQty) >= parseFloat(bulkQty)))
											recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to insufficeint quantity in bulk sotrage locations.');
										else if(openRplnQty > 0)
											recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to open replens exists for this item.');
										else
											recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed.');

										var errResultId = nlapiSubmitRecord(recid);
										nlapiLogExecution("DEBUG",'errResultId',errResultId);
									}
								}
								else
								{
									iteratorHaltValue = processItr;
									nlapiLogExecution("DEBUG",'iteratorHaltValue',iteratorHaltValue);
									invokeScheduler = 'Y';
									break;
								}
							}
						}
					}
				}

				if(invokeScheduler == 'Y')
				{
					// To invoke scheduler to process further items 
					nlapiLogExecution("DEBUG",'sItemArr',sItemArr.length);
					for(var schInvokeItr = iteratorHaltValue; schInvokeItr < lineCount; schInvokeItr++)
					{
						isSelected = request.getLineItemValue('custpage_items','custpage_select', schInvokeItr+1);
						if(isSelected == 'T')
						{
							var itemIntrId = request.getLineItemValue('custpage_items','custpage_itemid', schInvokeItr+1);
							if(sItemArr.indexOf(itemIntrId) == -1)
							{
								sItemArr.push(request.getLineItemValue('custpage_items','custpage_itemid', schInvokeItr+1));
								sLocationArr.push(request.getParameter('custpage_location'));
								sToBinArr.push(request.getLineItemValue('custpage_items','custpage_prefbinloc', schInvokeItr+1));
								sQohArr.push(request.getLineItemValue('custpage_items','custpage_binqty', schInvokeItr+1));
								sOpenpickQtyArr.push(request.getLineItemValue('custpage_items','custpage_binallocqty',schInvokeItr+1));
								sMaxQtyArr.push(request.getLineItemValue('custpage_items','custpage_maxqty', schInvokeItr+1));
								sReplenQtyArr.push(request.getLineItemValue('custpage_items','custpage_replenqty', schInvokeItr+1));
								sRoundQtyArr.push(request.getLineItemValue('custpage_items','custpage_roundqty', schInvokeItr+1));
								sBulkQtyArr.push(request.getLineItemValue('custpage_items','custpage_bulkqtyavail',schInvokeItr+1));
								sToBinIdArr.push(request.getLineItemValue('custpage_items','custpage_prefbinlocid',schInvokeItr+1));
								sOpenRplnQtyArr.push(request.getLineItemValue('custpage_items','custpage_openrplnqty',schInvokeItr+1));
								sStockRateArr.push(request.getLineItemValue('custpage_items','custpage_stockrate',schInvokeItr+1));
								sStockUnitArr.push(request.getLineItemValue('custpage_items','custpage_stockunit',schInvokeItr+1));
							}
						}
					}

					var str = 'assainedTo.' + assainedTo + '<br/>';
					str = str + 'sItemArr.' + sItemArr + '<br/>';
					str = str + 'sLocationArr.' + sLocationArr + '<br/>';
					str = str + 'sToBinArr.' + sToBinArr + '<br/>';
					str = str + 'sQohArr.' + sQohArr + '<br/>';
					str = str + 'sOpenpickQtyArr.' + sOpenpickQtyArr + '<br/>';
					str = str + 'sMaxQtyArr.' + sMaxQtyArr + '<br/>';
					str = str + 'sReplenQtyArr.' + sReplenQtyArr + '<br/>';
					str = str + 'sRoundQtyArr.' + sRoundQtyArr + '<br/>';
					str = str + 'sBulkQtyArr.' + sBulkQtyArr + '<br/>';
					str = str + 'sToBinIdArr.' + sToBinIdArr + '<br/>';
					str = str + 'sOpenRplnQtyArr.' + sOpenRplnQtyArr + '<br/>';
					str = str + 'sStockRateArr.' + sStockRateArr + '<br/>';
					str = str + 'sItemArr.length.' + sItemArr.length + '<br/>';
					nlapiLogExecution('DEBUG','str',str);

					var param = new Array();
					param['custscript_wmsse_sng_item'] = sItemArr;				
					param['custscript_wmsse_sng_tobin'] = sToBinArr;
					param['custscript_wmsse_sng_qoh'] = sQohArr;
					param['custscript_wmsse_sng_openpickqty'] = sOpenpickQtyArr;
					param['custscript_wmsse_sng_maxqty'] = sMaxQtyArr;
					param['custscript_wmsse_sng_replenqty'] = sReplenQtyArr;
					param['custscript_wmsse_sng_roundqty'] = sRoundQtyArr;
					param['custscript_wmsse_sng_bulkqty'] = sBulkQtyArr;
					param['custscript_wmsse_sng_tobinid']=sToBinIdArr;
					param['custscript_wmsse_sng_openreplenqty']=sOpenRplnQtyArr;
					param['custscript_wmsse_sng_assignedto']=assignedTo;
					param['custscript_wmsse_sng_stockrate']=sStockRateArr;
					param['custscript_wmsse_sng_stockunit']=sStockUnitArr;

					param['custscript_wmsse_mainitem'] = itemArray1.toString();				
					param['custscript_wmsse_sng_rpln_itemfamily'] = Vitemfamily;
					param['custscript_wmsse_sng_rpln_itemgroup'] = Vitemgroup;
					param['custscript_wmsse_sng_rpln_itemclass'] = VitemClassification;
					param['custscript_wmsse_sng_location'] = VLoc;
					param['custscript_wmsse_sng_olditem1']=totalOldItem1;
					param['custscript_wmsse_sng_olditem2']=totalOldItem2;
					param['custscript_wmsse_sng_olditem3']=totalOldItem3;
					param['custscript_wmsse_sng_olditem4']=totalOldItem4;
					param['custscript_wmsse_sng_olditem5']=totalOldItem5;

					var currentUserID = getCurrentUser();
					var strUserID = 'R'+currentUserID;

					var day = new Date();
					
					var date = day.getDate();
					var month = day.getMonth();
					var year = day.getFullYear();
					var hours = day.getHours();
					var mins = day.getMinutes();
					var secs = day.getSeconds();

					var refNum = strUserID + date + month + year + hours + mins + secs;
					param['custscript_wmsse_sng_rpln_refno'] = refNum;
					//param['custscript_wmsse_sng_rpln_userid'] = currentUserID;

					//Invoking the scheduler
					var schstatus = nlapiScheduleScript('customscript_wmsse_replen_process_sch',null,param);
					nlapiLogExecution('DEBUG', 'Scheduled Script Status',schstatus);

					updateScheduleScriptStatus('Generate Replenishment',currentUserID,'Submitted',refNum,'Replenishment');
					//To update Schedule script status to Submitted

					var replenSchform = nlapiCreateForm('Replenishment');

					var schmsg = replenSchform.addField('custpage_schmessage', 'inlinehtml', null, null, 
							null).setLayoutType('outside','startrow');		  

					schmsg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
							"showAlertBox('div__alert', 'Confirmation', " +
							"'Replenishment process has been initiated successfully'," +
					" NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>"); //returns the confirmation message
					var htmlstring="";

					htmlstring="Replenishment scheduler has been initiated successfully";

					nlapiLogExecution('DEBUG', 'Htmlstring is:',htmlstring);

					response.writePage(replenSchform);
					return;
				}

				if((resultId != null && resultId != '') || validLine == true)
				{
					var replenform = nlapiCreateForm('Replenishment');

					var vnmsg = replenform.addField('custpage_message', 'inlinehtml', null, null, 
							null).setLayoutType('outside','startrow');		  

					vnmsg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
							"showAlertBox('div__alert', 'Confirmation', " +
							"'Replenishment generated successfully'," +
					" NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");//Returns confirmation message
					var htmlstring="";

					htmlstring="Replenishment generated successfully";

					nlapiLogExecution('DEBUG', 'Htmlstring is:',htmlstring);

					response.writePage(replenform);
					return;
				}
				else if(anyLineSelected)
				{
					var replenform = nlapiCreateForm('Replenishment');

					var vnmsg = replenform.addField('custpage_message', 'inlinehtml', null, null, 
							null).setLayoutType('outside','startrow');		  

					vnmsg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
							"showAlertBox('div__alert', 'ERROR', " +
							"'Replenishment is not generated for the selected Items'," +
					" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");//Returns confirmation message
					var htmlstring="";

					htmlstring="Replenishment is not generated for the selected Items";

					nlapiLogExecution('DEBUG', 'Htmlstring is:',htmlstring);

					response.writePage(replenform);
					return;
				}
				else
				{
					nlapiLogExecution('ERROR', 'something went wrong');
				}
			}
			else
			{
				var selectStr = [];
				if(totalSelectedLines != null && totalSelectedLines != '' && totalSelectedLines != undefined)
					selectStr = totalSelectedLines.split(',');

				var unSelectStr = [];
				if(totalUnSelectedLines != null && totalUnSelectedLines != '')
					unSelectStr = totalUnSelectedLines.split(',');

				for(var oldDataItr = 0; oldDataItr < lineCount; oldDataItr++)
				{
					isSelected = request.getLineItemValue('custpage_items','custpage_select', oldDataItr+1);
					if(isSelected == 'T')
					{
						if(request.getParameter('custpage_hiddenselectallflag') == 'unmark')
							hdnselectAll.setDefaultValue('');
						//Fetching values from the respective line in the Sublist
						var itemid = request.getLineItemValue('custpage_items','custpage_itemid', oldDataItr+1);
						var toBin = request.getLineItemValue('custpage_items','custpage_prefbinloc', oldDataItr+1);
						var qoh = request.getLineItemValue('custpage_items','custpage_binqty', oldDataItr+1);
						var maxQty = request.getLineItemValue('custpage_items','custpage_maxqty', oldDataItr+1);
						var replenQty = request.getLineItemValue('custpage_items','custpage_replenqty', oldDataItr+1);
						var roundQty = request.getLineItemValue('custpage_items','custpage_roundqty', oldDataItr+1);
						var toBinId = request.getLineItemValue('custpage_items','custpage_prefbinlocid',oldDataItr+1);
						var stockConversionRate = request.getLineItemValue('custpage_items','custpage_stockrate',oldDataItr+1);
						var curpageItr = request.getLineItemValue('custpage_items','custpage_iteratorvalue',oldDataItr+1);
						var stockUnitText = request.getLineItemValue('custpage_items','custpage_stockunit',oldDataItr+1);
						var curarr = [];
						if(selectStr.indexOf(itemid) == -1)
						{
							curarr = [itemid,qoh,maxQty,replenQty,roundQty,toBinId,stockConversionRate];
						}

						if(totalOldResponse.length < 99900 && selectStr.indexOf(itemid) == -1)
							totalOldResponse = totalOldResponse + curarr.toString() + '|';
						else if(totalOldResponseCont.length < 99900 && selectStr.indexOf(itemid) == -1)
							totalOldResponseCont = totalOldResponseCont + curarr.toString() + '|';
						else if(totalOldItemArr1.toString().length < 99900 && totalOldItemArr1.indexOf(itemid) == -1 && selectStr.indexOf(itemid) == -1)
							totalOldItemArr1.push(itemid);
						else if(totalOldItemArr2.toString().length < 99900 && totalOldItemArr2.indexOf(itemid) == -1 && selectStr.indexOf(itemid) == -1)
							totalOldItemArr2.push(itemid);
						else if(totalOldItemArr3.toString().length < 99900 && totalOldItemArr3.indexOf(itemid) == -1 && selectStr.indexOf(itemid) == -1)
							totalOldItemArr3.push(itemid);
						else if(totalOldItemArr4.toString().length < 99900 && totalOldItemArr4.indexOf(itemid) == -1 && selectStr.indexOf(itemid) == -1)
							totalOldItemArr4.push(itemid);
						else if(totalOldItemArr5.toString().length < 99900 && totalOldItemArr5.indexOf(itemid) == -1 && selectStr.indexOf(itemid) == -1)
							totalOldItemArr5.push(itemid);

						if(selectStr.indexOf(itemid) == -1 && selectStr.toString().length < 99900)
							selectStr.push(itemid);

						if(unSelectStr.indexOf(itemid) != -1)
						{
							var currItemIndex = unSelectStr.indexOf(itemid);
							unSelectStr.splice(currItemIndex,1);
						}
					}
					else
					{
						var itemid = request.getLineItemValue('custpage_items','custpage_itemid', oldDataItr+1);
						if(request.getParameter('custpage_hiddenselectallflag') == 'mark')
						{	
							if(unSelectStr.indexOf(itemid) == -1 && unSelectStr.toString().length < 99900)
								unSelectStr.push(itemid);
						}
						else
						{
							if(selectStr.indexOf(itemid) != -1)
							{
								var curIndex = selectStr.indexOf(itemid);
								selectStr.splice(curIndex,1);

								if(totalOldResponse != null && totalOldResponse != '' && totalOldResponse != undefined)
								{
									var totalOldResponseArray = totalOldResponse.split('|');
									for(var ifItr = 0; ifItr < totalOldResponseArray.length-1; ifItr++)
									{
										var insideIfArr = [];
										if(totalOldResponseArray[ifItr] != null && totalOldResponseArray[ifItr] != '' && totalOldResponseArray[ifItr] != undefined)
											insideIfArr = totalOldResponseArray[ifItr].split(',');
										if(insideIfArr[0] == itemid)
											totalOldResponseArray.splice(ifItr,1);
									}
									totalOldResponse = totalOldResponseArray.join('|');

									if(totalOldResponseCont != null && totalOldResponseCont != '' && totalOldResponseCont != undefined)
									{
										var totalOldResponseContArray = totalOldResponseCont.split('|');
										for(var ifContItr = 0; ifContItr < totalOldResponseContArray.length-1; ifContItr++)
										{
											var insideIfArr = [];
											if(totalOldResponseContArray[ifContItr] != null && totalOldResponseContArray[ifContItr] != '' 
												&& totalOldResponseContArray[ifContItr] != undefined)
											{
												insideIfArr = totalOldResponseContArray[ifContItr].split(',');
											}
											if(insideIfArr[0] == itemid)
												totalOldResponseContArray.splice(ifContItr,1);
										}
										totalOldResponseCont = totalOldResponseContArray.join('|');
									}
								}
							}
						}
					}
				}
				nlapiLogExecution('DEBUG', 'totalOldResponse,length', totalOldResponse.length+','+totalOldResponse);
				nlapiLogExecution('DEBUG', 'selectStr',selectStr.length+':'+selectStr);
				nlapiLogExecution('DEBUG', 'unSelectStr',unSelectStr.length+':'+unSelectStr);

				selectStr = selectStr.toString();
				selectedLineDetails.setDefaultValue(selectStr);//to track the itemid of selected lines.

				oldResponse.setDefaultValue(totalOldResponse);//to track the entire details of selected lines.
				oldResponseContinue.setDefaultValue(totalOldResponseCont);

				unSelectStr = unSelectStr.toString();//to track the itemid of unselected lines if markall is pressed.
				unSelectedLineDetails.setDefaultValue(unSelectStr);

				oldResponseContItem1.setDefaultValue(totalOldItemArr1.toString());
				oldResponseContItem2.setDefaultValue(totalOldItemArr2.toString());
				oldResponseContItem3.setDefaultValue(totalOldItemArr3.toString());
				oldResponseContItem4.setDefaultValue(totalOldItemArr4.toString());
				oldResponseContItem5.setDefaultValue(totalOldItemArr5.toString());
			}

			//Below code will execute when the "Display" button is clicked after selecting the search criteria
			var sublistCurLine = 0;
			var itemresults = new Array();
			var maxno = -1;
			var totalResponseStr = '';
			var sublistDetailArr = new Array();
			var ajaxResponseStr = '';
			var curValue = 0;
			var timeduration = 0;
			var isOutOfTime = false;
			var preferedbinid = '';
			var invtClassification = '';
			var selectedLinesArr = [];
			var selectedLinesStr = request.getParameter('custpage_selectedlines');
			if(selectedLinesStr == '' || selectedLinesStr == null || selectedLinesStr == undefined || selectedLinesStr == 'null')
				selectedLinesStr = '';
			else
				selectedLinesArr = selectedLinesStr.split(',');

			var unselectedLinesArr = [];
			var unselectedLinesStr = request.getParameter('custpage_unselectedlines');
			if(unselectedLinesStr == '' || unselectedLinesStr == null || unselectedLinesStr == undefined || unselectedLinesStr == 'null')
				unselectedLinesStr = '';
			else
				unselectedLinesArr = unselectedLinesStr.split(',');

			itemresults = openreplenitems(VLoc,itemArray1,Vitemfamily,Vitemgroup,VitemClassification,subsidiariesArr,itemresults,maxno);
			//Returns the list of items for which preferred bin is configured. 
			nlapiLogExecution('DEBUG', 'itemresults',itemresults);

			if(itemresults != null && itemresults != '' && itemresults.length > 0)
			{ 
				nlapiLogExecution('DEBUG', 'itemresults length',itemresults.length);
				var totalUOMArr = [];
				totalUOMArr = fnGetAllUOMStockRate();
				for(var itemIterator = 0; itemIterator < itemresults.length; itemIterator++)
				{
					invtClassification = itemresults[itemIterator].getValue('locationinvtclassification');
					if(invtClassification != null && invtClassification != '' && itemClassText != null
							&& itemClassText != '' && invtClassification != itemClassText)
					{
						continue;
					}

					var getPreferBin = itemresults[itemIterator].getValue('preferredbin');
					if(itemresults[itemIterator].getValue('preferredbin') == "T" && itemresults[itemIterator].getValue('location','binnumber') == VLoc)
					{
						var itemInternalid = itemresults[itemIterator].getId();
						var itemName = itemresults[itemIterator].getValue('name');
						var vUnitType = itemresults[itemIterator].getValue('unitstype');
						var stockUnitText = itemresults[itemIterator].getText('stockunit');
						var stockUnit = itemresults[itemIterator].getValue('stockunit');
						var getPreferBin = itemresults[itemIterator].getValue('binnumber');
						var itemqty = itemresults[itemIterator].getValue('quantityonhand');
						var replenminqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_minqty','binnumber');
						var replenmaxqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_maxqty','binnumber');
						var replenqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_qty','binnumber');
						var replenroundqty = itemresults[itemIterator].getValue('custrecord_wmsse_replen_roundqty','binnumber');
						var preferedBinId = itemresults[itemIterator].getValue('internalid','binnumber');
						var vPrefBinQOH = itemresults[itemIterator].getValue('binonhandcount');
						var vPrefBinQtyAvail = itemresults[itemIterator].getValue('binonhandavail');
						var whLocQtyAvail = itemresults[itemIterator].getValue('locationquantityavailable');
						var whLocQOH = itemresults[itemIterator].getValue('locationquantityonhand');
						var qtyAvailinWH = 'No';

						var stockConversionRate = 1;
						if(vUnitType != null && vUnitType != '' && stockUnitText != null && stockUnitText != null)
							stockConversionRate = totalUOMArr[vUnitType.toString()+stockUnitText.toString()];

					
						vPrefBinQOH = Number(Big(vPrefBinQOH).div(stockConversionRate));
						vPrefBinQtyAvail = Number(Big(vPrefBinQtyAvail).div(stockConversionRate));

						if(replenminqty == null || replenminqty == '' || replenminqty == '- None -' || replenminqty == 'null')
							replenminqty=0;
						if(replenmaxqty == null || replenmaxqty == '' || replenmaxqty == '- None -' || replenmaxqty == 'null')
							replenmaxqty=0;
						if(replenqty == null || replenqty == '' || replenqty == '- None -' || replenqty == 'null')
							replenqty=0;
						if(replenroundqty == null || replenroundqty == '' || replenroundqty == '- None -' || replenroundqty == 'null')
							replenroundqty=0;
						if(vPrefBinQOH == null || vPrefBinQOH == '' || vPrefBinQOH == '- None -' || vPrefBinQOH == 'null' || isNaN(vPrefBinQOH))
							vPrefBinQOH=0;
						if(vPrefBinQtyAvail == null || vPrefBinQtyAvail == '' || vPrefBinQtyAvail == '- None -' || vPrefBinQtyAvail == 'null'
							|| isNaN(vPrefBinQtyAvail))
							vPrefBinQtyAvail=0;

						if(whLocQtyAvail == null || whLocQtyAvail == '' || whLocQtyAvail == '- None -' || whLocQtyAvail == 'null' || whLocQtyAvail == undefined)
							whLocQtyAvail=0;
						if(whLocQOH == null || whLocQOH == '' || whLocQOH == '- None -' || whLocQOH == 'null' || whLocQOH == undefined)
							whLocQOH=0;

						
						var vAllocatedQty = Number(Big(vPrefBinQOH).minus(vPrefBinQtyAvail));
						nlapiLogExecution('DEBUG', 'vAllocatedQty in BIg',vAllocatedQty);

						if((parseFloat(replenminqty) >= parseFloat(vPrefBinQOH)) && parseFloat(replenmaxqty) > 0 && parseFloat(replenminqty) >= 0 && 
								parseFloat(replenqty) > 0 && parseFloat(replenroundqty) > 0)
						{
							var currow = [itemName,replenminqty,replenmaxqty,replenqty,replenroundqty,getPreferBin,itemqty,vPrefBinQOH,vAllocatedQty,vPrefBinQtyAvail,
								itemInternalid,preferedBinId,stockConversionRate,whLocQOH,whLocQtyAvail,vLocname,stockUnitText];
							sublistDetailArr.push(currow);
						}
					}
				}

				if(sublistDetailArr != null && sublistDetailArr != '' && sublistDetailArr.length>0)
				{

					whLocation.setDisplayType("disabled");
					itemclassification.setDisplayType("disabled");
					itemfamily.setDisplayType("disabled");
					itemgroup.setDisplayType("disabled");
					Item.setDisplayType("disabled");

					//var size = 500;						
					if(sublistDetailArr.length > parseInt(size))
					{	
						var select= form.addField('custpage_selectpage','select', 'Select Items');	
						select.setLayoutType('outsidebelow');			
						select.setDisplaySize(200,30);
						if(request.getParameter('custpage_selectpage') != null &&
								request.getParameter('custpage_selectpage') != 'null' &&
								request.getParameter('custpage_selectpage') != '' &&
								request.getParameter('custpage_selectpage') != 'undefined')
						{
							select.setDefaultValue(request.getParameter('custpage_selectpage'));	
						}

						var pagetLength = sublistDetailArr.length/parseInt(size);
						for(var pageIterator = 1; pageIterator <= Math.ceil(pagetLength); pageIterator++)
						{
							var from;var to;

							to=parseFloat(pageIterator)*parseInt(size);
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
					nlapiLogExecution('DEBUG','selectno', selectno);
					if(selectno!=null && selectno!='null'  && selectno!=undefined &&
							selectno!= '' && sublistDetailArr.length > parseInt(size))
					{
						var selectedPageArray = [];
						var selectedPage= request.getParameter('custpage_selectpage');
						if(selectedPage != '' && selectedPage != null)
							selectedPageArray=selectedPage.split(',');

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
					nlapiLogExecution('DEBUG','minval, maxval', minval+', '+maxval);

					var itemIntrIdArr = [];
					var preferBinIntrIdArr = [];
					for(var rplnItr = minval; rplnItr <= maxval; rplnItr++)
					{
						itemIntrIdArr.push(sublistDetailArr[rplnItr][10]);
						preferBinIntrIdArr.push(sublistDetailArr[rplnItr][11]);
					}

					var totalOpenRplnQtyArr = [];
					totalOpenRplnQtyArr = fnGetOpenReplenQtyAtOnce(itemIntrIdArr,VLoc,preferBinIntrIdArr,totalOpenRplnQtyArr);
					//to fetch open replen quantities of all items in that particular page.
					nlapiLogExecution('DEBUG','totalOpenRplnQtyArr', totalOpenRplnQtyArr);

					for(var sublistIterator = minval; sublistIterator <= maxval; sublistIterator++)
					{
						var openRplnQty = totalOpenRplnQtyArr[sublistDetailArr[sublistIterator][10].toString()+'$'+sublistDetailArr[sublistIterator][11].toString()];
						if(openRplnQty == null || openRplnQty == '' || openRplnQty == undefined || openRplnQty == 'undefined' || openRplnQty == 'null')
							openRplnQty = 0;

						if(selectedLinesArr.indexOf(sublistDetailArr[sublistIterator][10]) != -1 || request.getParameter('custpage_hiddenselectallflag') == 'mark')
							form.getSubList('custpage_items').setLineItemValue('custpage_select', sublistCurLine+1, 'T');
						else
							form.getSubList('custpage_items').setLineItemValue('custpage_select', sublistCurLine+1, 'F');

						if(request.getParameter('custpage_hiddenselectallflag') == 'unmark' || unselectedLinesArr.indexOf(sublistDetailArr[sublistIterator][10]) != -1)
							form.getSubList('custpage_items').setLineItemValue('custpage_select', sublistCurLine+1, 'F');

						if(parseFloat(sublistDetailArr[sublistIterator][14]) <= 0)
						{
							form.getSubList('custpage_items').setLineItemValue('custpage_select', sublistCurLine+1, 'F');
						}

						form.getSubList('custpage_items').setLineItemValue('custpage_sku', sublistCurLine+1, sublistDetailArr[sublistIterator][0]);
						form.getSubList('custpage_items').setLineItemValue('custpage_minqty', sublistCurLine+1, sublistDetailArr[sublistIterator][1]);
						form.getSubList('custpage_items').setLineItemValue('custpage_maxqty', sublistCurLine+1, sublistDetailArr[sublistIterator][2]);
						form.getSubList('custpage_items').setLineItemValue('custpage_replenqty', sublistCurLine+1, sublistDetailArr[sublistIterator][3]);
						form.getSubList('custpage_items').setLineItemValue('custpage_roundqty', sublistCurLine+1, sublistDetailArr[sublistIterator][4]);
						form.getSubList('custpage_items').setLineItemValue('custpage_prefbinloc', sublistCurLine+1, sublistDetailArr[sublistIterator][5]);
						form.getSubList('custpage_items').setLineItemValue('custpage_qty', sublistCurLine+1, sublistDetailArr[sublistIterator][6]);
						form.getSubList('custpage_items').setLineItemValue('custpage_binqty', sublistCurLine+1, sublistDetailArr[sublistIterator][7]);
						form.getSubList('custpage_items').setLineItemValue('custpage_binallocqty', sublistCurLine+1, sublistDetailArr[sublistIterator][8]); // now we are unable to show this field
						form.getSubList('custpage_items').setLineItemValue('custpage_binavailqty',sublistCurLine+1,sublistDetailArr[sublistIterator][9]);
						form.getSubList('custpage_items').setLineItemValue('custpage_itemid', sublistCurLine+1, sublistDetailArr[sublistIterator][10]);
						form.getSubList('custpage_items').setLineItemValue('custpage_bulkqtyavail', sublistCurLine+1, 0);
						form.getSubList('custpage_items').setLineItemValue('custpage_prefbinlocid', sublistCurLine+1, sublistDetailArr[sublistIterator][11]);
						form.getSubList('custpage_items').setLineItemValue('custpage_openrplnqty', sublistCurLine+1, parseFloat(openRplnQty));
						form.getSubList('custpage_items').setLineItemValue('custpage_stockrate', sublistCurLine+1, sublistDetailArr[sublistIterator][12]);
						form.getSubList('custpage_items').setLineItemValue('custpage_whqoh',sublistCurLine+1,sublistDetailArr[sublistIterator][13]);
						form.getSubList('custpage_items').setLineItemValue('custpage_whqtyavail',sublistCurLine+1,sublistDetailArr[sublistIterator][14]);
						form.getSubList('custpage_items').setLineItemValue('custpage_iteratorvalue',sublistCurLine+1,minval);
						form.getSubList('custpage_items').setLineItemValue('custpage_whloc',sublistCurLine+1,sublistDetailArr[sublistIterator][15]);

						form.getSubList('custpage_items').setLineItemValue('custpage_stockunit', sublistCurLine+1, sublistDetailArr[sublistIterator][16]);
						sublistCurLine++;
					}
				}
			}
			else
			{
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
						"showAlertBox('div__alert', 'ERROR', 'Items are not available'," +
				" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");//Returns error message if no items are available for replenishment

				form.addSubmitButton('Display');
				response.writePage(form);
				return;
			}

			if(parseInt(sublistCurLine) == 0)
			{
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
						"showAlertBox('div__alert', 'ERROR', 'Items are not available'," +
				" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");//Returns error message if no items are available for replenishment

				form.addSubmitButton('Display');
				response.writePage(form);
				return;
			}
		}
		catch(e)  
		{
			RPLNArray["custparam_error"] = e;
			var errStr = '';
			if (e instanceof nlobjError) 
			{	
				errStr = e.getDetails();
			}
			else
			{
				errStr = e.toString();
			}

			nlapiLogExecution('ERROR', 'Exception in ReplenishGUI',errStr);

			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
					"showAlertBox('div__alert', 'Error', '"+errStr+"'," +
					" NLAlertDialog.TYPE_HIGH_PRIORITY," +
			"  '100%', null, null, null);</script></div>");

			form.addSubmitButton('Generate & Release');
			response.writePage(form);
			return;
		} 
		finally 
		{					
			var timestamp4 = new Date();
			var timeduration = (parseFloat(timestamp4.getTime()) - parseFloat(timestamp1.getTime()));
			nlapiLogExecution('ERROR', 'timeduration in sec in finally', parseFloat(timeduration)/1000);

			nlapiLogExecution('ERROR', 'finally usage',context.getRemainingUsage());				
		}
		form.addSubmitButton('Generate & Release');
		response.writePage(form);
	}
}

/**
 * 
 * @param form object
 * @returns To bind sublist to the Generate Replenishment form
 */
function addSublistToForm(form)
{
	//Add Sublist to the Generate Replenishment form
	var sublist = form.addSubList("custpage_items", "list", "Generate Replenishment");

	sublist.addField("custpage_select", "checkbox", "Generate");
	sublist.addField("custpage_sku", "text", "Item");	
	sublist.addField("custpage_whloc", "text", "Location"); 
	sublist.addField("custpage_prefbinloc", "text", "Bin");
	sublist.addField("custpage_minqty", "text", "Min Qty"); 
	sublist.addField("custpage_maxqty", "text", "Max Qty");
	sublist.addField("custpage_replenqty", "text", "Replen Qty");
	sublist.addField("custpage_roundqty", "text", "Round Qty");
	sublist.addField("custpage_binqty", "text", "Bin On Hand");
	sublist.addField("custpage_binallocqty", "text", "Allocated").setDisplayType("hidden");
	sublist.addField("custpage_binavailqty", "text", "Bin Available");
	sublist.addField("custpage_whqoh", "text", "Location On Hand");
	sublist.addField("custpage_whqtyavail", "text", "Location Available");
	sublist.addField("custpage_qty", "text", 'Quantity').setDisplayType("hidden");
	sublist.addField("custpage_itemid", "text", 'Item Id').setDisplayType("hidden");
	sublist.addField("custpage_bulkqtyavail", "text", 'Bulk Quantity').setDisplayType("hidden");
	sublist.addField("custpage_prefbinlocid", "text", "Bin ID").setDisplayType("hidden");
	sublist.addField("custpage_openrplnqty", "text", "Open Replen Qty");
	sublist.addField("custpage_stockrate", "text", "Stock Conversion rate").setDisplayType("hidden");
	sublist.addField("custpage_itemresult", "text", "Item Result").setDisplayType("hidden");
	sublist.addField("custpage_iteratorvalue", "text", "Iterator value").setDisplayType("hidden");
	sublist.addField("custpage_stockunit", "text", "Stock Unit").setDisplayType("hidden");
	//sublist.addField("custpage_qtyavailinwhse", "text", "Qty Avail in WHSE");

	//sublist.addMarkAllButtons();
	sublist.addButton('custpage_markall','Mark All','markAll()');
	sublist.addButton('custpage_unmarkall','Unmark All','unMarkAll()');
}


/**
 * 
 * @param WarehouseLocation
 * @param Item
 * @param ItemFamily
 * @param ItemGroup
 * @returns Items that are applicable for replenishment
 */
function openreplenitems(WHLoc,VItem,itemfamily,itemgroup,VitemClassification,subs,itemresults,maxno)
{
	var currow = new Array();
	var str = 'VItem.' + VItem + '<br/>';
	str = str + 'itemfamily.' + itemfamily + '<br/>';
	str = str + 'WHLoc.' + WHLoc + '<br/>';
	str = str + 'itemgroup.' + itemgroup + '<br/>';
	str = str + 'VitemClassification.' + VitemClassification + '<br/>';
	str = str + 'maxno.' + maxno + '<br/>';
	nlapiLogExecution('DEBUG', 'str',str);

	var result = nlapiLoadSearch('item', 'customsearch_wmsse_rpln_item_srh');

	if(VItem != null && VItem !='' && VItem != null)
	{
		result.addFilter(new nlobjSearchFilter('internalid',null,'anyof',VItem));
	}

	//Filter on inventorylocation is enough to validate role based subsidiaries againist the item.This filter is not required.
	/*if(subs != null && subs !='' && subs != null)
	{
		result.addFilter(new nlobjSearchFilter('subsidiary', null, 'anyof', subs));
	}*/

	if(itemfamily != null && itemfamily !='' && itemfamily != null)
	{
		result.addFilter(new nlobjSearchFilter('custitem_wmsse_itemfamily',null,'anyof',itemfamily));
	}

	if(itemgroup != null && itemgroup !='' && itemgroup != null && itemgroup != undefined)
	{
		result.addFilter(new nlobjSearchFilter('custitem_wmsse_itemgroup',null,'anyof',itemgroup));
	}

	if(WHLoc != null && WHLoc !='' && WHLoc != 'null' && WHLoc != undefined)
	{
		result.addFilter(new nlobjSearchFilter('location',null,'anyof',['@NONE@',WHLoc]));
		result.addFilter(new nlobjSearchFilter('location','binnumber','anyof',WHLoc));
	}

	if(WHLoc != null && WHLoc != '' && WHLoc != undefined)
	{
		result.addFilter(new nlobjSearchFilter('inventorylocation',null, 'anyof',WHLoc));
	}

	if(maxno != -1 && maxno != null && maxno != '' && maxno != undefined)
	{
		result.addFilter(new nlobjSearchFilter('internalidnumber', null,'greaterthan', parseInt(maxno)));
	}

	var resLen = result.runSearch();
	var srhIterator = 0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		srhIterator++;
		itemresults.push(searchResult);		
		if(parseFloat(srhIterator) == 4000)
		{
			maxno = searchResult.getValue('internalid');
			openreplenitems(WHLoc,VItem,itemfamily,itemgroup,VitemClassification,subs,itemresults,maxno);//recursive calling
			return false;
		}
		return true;                // return true to keep iterating
			});

	nlapiLogExecution('DEBUG', 'srhIterator',srhIterator);
	return itemresults;
}

/**
 * @param ItemId
 * @param vBinArray
 * @param WarehouseLocation
 * @param vUnitType
 * @param StockUnitText
 * @returns Open Picks Details
 */
function getOPenTaskPickBinDetailsRpln(vItemId,vBinArray,whLocation,conversionRate)
{
	var vPickBinDetailsArr = new Array();
	var vPickBinIdArr = new Array();
	var vPickBinTextArr = new Array();
	var vPickBinQtyArr = new Array();
	var filters = new Array();

	if(vItemId != null && vItemId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', vItemId));

	if(vBinArray != null && vBinArray != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'anyof', vBinArray));
	if(whLocation != null && whLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whLocation));

	var objOpenTaskDetails = new nlapiSearchRecord(
			'customrecord_wmsse_trn_opentask','customsearch_wmsse_replen_openpicks_srh',filters, null);

	if(objOpenTaskDetails != null && objOpenTaskDetails != '' && objOpenTaskDetails.length > 0)
	{
		for(var openPickItr = 0; openPickItr < objOpenTaskDetails.length ; openPickItr++)
		{
			var KitFlag = objOpenTaskDetails[openPickItr].getValue('custrecord_wmsse_kitflag',null,'group');
			var vPickQty = 0;
			if(KitFlag == 'T')
				vPickQty = objOpenTaskDetails[openPickItr].getValue('custrecord_wmsse_expe_qty',null,'sum');
			else
				vPickQty = objOpenTaskDetails[openPickItr].getValue('custrecord_wmsse_act_qty',null,'sum');
			var vPickBeginLocId = objOpenTaskDetails[openPickItr].getValue('custrecord_wmsse_actendloc',null,
			'group');
			var vPickBeginLocText = objOpenTaskDetails[openPickItr].getText('custrecord_wmsse_actendloc',null,
			'group');
			var vPickConversionRate = objOpenTaskDetails[openPickItr].getValue('custrecord_wmsse_conversionrate',
					null,'group');
			if(vPickConversionRate == null || vPickConversionRate == '' ||
					vPickConversionRate == '- None -')
				vPickConversionRate=1;
			if(vPickQty == null || vPickQty == '' || vPickQty == '- None -' || vPickQty == 'null')
				vPickQty=0;
			if((vPickBinIdArr.indexOf(vPickBeginLocId) ==-1) )
			{
				vPickBinIdArr.push(vPickBeginLocId);
				vPickBinTextArr.push(vPickBeginLocText);
				//vPickBinQtyArr.push(vPickQty * (parseFloat(vPickConversionRate)/parseFloat(conversionRate)));
					vPickConversionRate=Big(vPickConversionRate)
					vPickBinQtyArr.push(Number(Big(vPickQty).mul((vPickConversionRate).div(conversionRate))));
			}
			else
			{
				if(vPickBinIdArr != null && vPickBinIdArr != '' && vPickBinIdArr.length > 0)
				{

					var ind = vPickBinIdArr.indexOf(vPickBeginLocId);
					var pickBinQty = vPickBinQtyArr[ind];
				vPickConversionRate=Big(vPickConversionRate)
					var tempQty = Number(Big(vPickQty).mul((vPickConversionRate).div(conversionRate)));
					vPickBinQtyArr[ind]=Number(Big(tempQty).plus(pickBinQty));
				}
			}


		}
		vPickBinDetailsArr.push(vPickBinIdArr,vPickBinQtyArr,vPickBinTextArr);
	}

	filters=null;
	columns=null;
	objOpenTaskDetails = null;
	return vPickBinDetailsArr;
}

/**
 * @returns open replen quantity
 * 
 */
function fnOpenReplenQty(internalid,VLoc,preferedbinid) 
{
	var expQty = 0;
	var actQty = 0;
	var filter = new Array();

	if(internalid != null && internalid != '' && internalid != undefined)
		filter.push(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof',internalid));

	if(VLoc != null && VLoc != '' && VLoc != undefined)
		filter.push(new nlobjSearchFilter('custrecord_wmsse_wms_location',null, 'anyof', VLoc));

	if(preferedbinid != null && preferedbinid != '' && preferedbinid != undefined)
		filter.push(new nlobjSearchFilter('custrecord_wmsse_actendloc',null, 'anyof', preferedbinid));

	var otResult =nlapiSearchRecord('customrecord_wmsse_trn_opentask',
			'customsearch_wmsse_rpln_opentask_srh',filter, null);

	if(otResult != null && otResult != '' && otResult.length>0)
	{
		for(var rplnQtyItr = 0; rplnQtyItr < otResult.length; rplnQtyItr++)
		{
			var tempExpQty = otResult[rplnQtyItr].getValue('custrecord_wmsse_expe_qty',null,'sum');
			var tempActQty = otResult[rplnQtyItr].getValue('custrecord_wmsse_act_qty',null,'sum');
			if(tempExpQty == '' || tempExpQty == null)
				tempExpQty = 0;
			if(tempActQty == '' || tempActQty == null)
				tempActQty = 0;
			
			expQty = Big(expQty).plus(tempExpQty);
			actQty = Big(actQty).plus(tempActQty);
			
		}
	}
	var remQty = Number(Big(expQty).minus(actQty));

	return remQty;
}

/**
 * @returns Item Claissification in Text 
 * 
 */
function getItemClassText(VitemClassification)
{
	var clsText = '';
	var filter = new Array();
	var col = new Array();
	col.push(new nlobjSearchColumn('name'));

	if(VitemClassification != null && VitemClassification != '')
	{
		filter.push(new nlobjSearchFilter('internalid',null, 'is', VitemClassification));

		var result = nlapiSearchRecord('customlist_wmsse_abcvelocity',null,filter,col);
		if(result != null && result != '')
		{
			clsText = result[0].getValue('name');
		}
	}
	return clsText;
}

/**
 * @returns Location names for given internalids 
 * 
 */
function getLocationName(vRoleLocation)
{
	var locationArray=new Array();

	nlapiLogExecution('DEBUG', 'vRoleLocation', vRoleLocation);
	var filters=new Array();
	if(vRoleLocation!=null && vRoleLocation!='')
		filters.push(new nlobjSearchFilter('internalid', null, 'anyof', vRoleLocation));
	var columns=new Array();
	columns.push(new nlobjSearchColumn('name'));
	var searchresults = nlapiSearchRecord('location', 'customsearch_wmsse_whloc_srh', filters, columns);
	if(searchresults!=null && searchresults!='')
	{
		for(var itr = 0; itr < searchresults.length; itr++)
		{
			locationArray[itr]=new Array();
			locationArray[itr][0]=searchresults[itr].getId();
			locationArray[itr][1]=searchresults[itr].getValue('name');
		}
	}
	searchresults=null;
	columns=null;
	filters=null;
	return locationArray;
}

/**
 * This function is to return Role based subsidiaries 
 * 
 */
function getRoleBasedSubsidiaries()
{
	var totSubArr = new Array();
	var subs = nlapiGetContext().getFeature('subsidiaries');
	nlapiLogExecution('DEBUG', 'subs', subs);
	if(subs != null && subs != '' && subs==true)
	{
		var vRoleLocation=new Array();
		var context=nlapiGetContext();
		var vSubsid=context.getSubsidiary();
		var vRoleid=context.getRole();
		nlapiLogExecution('Debug', 'vRoleid', vRoleid);
		var vRoleSubsidArray=new Array();
		if(vRoleid !=null && vRoleid !='')
		{
			var vRolefilters=new Array();

			if(vRoleid != null && vRoleid != '')
				vRolefilters.push(new nlobjSearchFilter('internalid', null, 'anyof', vRoleid));
			vRolefilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
			var vRoleColumns=new Array();
			vRoleColumns.push(new nlobjSearchColumn('name'));
			vRoleColumns.push(new nlobjSearchColumn('subsidiaries'));
			var vRolesearchresults = nlapiSearchRecord('Role', null, vRolefilters, vRoleColumns);
			if(vRolesearchresults !=null && vRolesearchresults !='' && vRolesearchresults.length > 0)
			{
				for(var subItr = 0; subItr < vRolesearchresults.length; subItr++)
				{
					var vnRoleSubsid=vRolesearchresults[subItr].getValue('subsidiaries');
					vRoleSubsidArray.push(vnRoleSubsid);
				}
			}
		}
		nlapiLogExecution('Debug', 'vRoleSubsidArray', vRoleSubsidArray);
		if(vRoleSubsidArray != null && vRoleSubsidArray != '' && vRoleSubsidArray.length>0)
		{
			totSubArr = vRoleSubsidArray;
		}
		else
		{
			totSubArr.push(vSubsid);
		}
		nlapiLogExecution('DEBUG', 'totSubArr', totSubArr);
	}
	return totSubArr;
}

/**
 * 
 * @returns stock conversion rate of all UOM records in respective account
 */
function fnGetAllUOMStockRate()
{
	var totalUOMArr = [];
	var result = nlapiLoadSearch('unitstype', 'customsearch_wmsse_rpln_unitstype_srh');

	var resLen = result.runSearch();

	var loadsrhItr = 0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		loadsrhItr++;
		var uom = searchResult.getValue('internalid');
		var unitName = searchResult.getValue('unitname');
		var conversionRate = searchResult.getValue('conversionrate');
		//nlapiLogExecution('Debug','uom,unitName,conversionRate',uom+','+unitName+','+conversionRate);

		totalUOMArr[uom.toString()+unitName.toString()] = conversionRate;

		if(parseFloat(loadsrhItr) == 4000)
		{
			return false;
		}
		return true;                // return true to keep iterating
			});
	return totalUOMArr;
}

/**
 * 
 * @returns Bulk quantity of respective item
 */
function fnGetQtyOfBulkBins(ItemInternalId, strLocation, bulkQty, preferedbinid)
{
	var result = nlapiLoadSearch('inventorydetail', 'customsearch_wmsse_rpln_bulkbin_details');

	if(ItemInternalId != null && ItemInternalId != '' && ItemInternalId != 'undefined' && ItemInternalId != undefined)
		result.addFilter(new nlobjSearchFilter('item',null,'anyof', ItemInternalId));

	if(strLocation!=null && strLocation!='' && strLocation!='undefined' && strLocation!='null' && strLocation!=undefined)
		result.addFilter(new nlobjSearchFilter('location','binnumber', 'anyof', strLocation));

	var resLen = result.runSearch();

	if(bulkQty == null || bulkQty == '')
		bulkQty = 0;

	var loadsrhItr = 0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		loadsrhItr++;
		if(preferedbinid != searchResult.getValue('internalid','binnumber','group'))
			bulkQty = parseFloat(bulkQty) + parseFloat(searchResult.getValue('itemcount',null,'sum'));

		if(parseFloat(loadsrhItr) == 4000)
		{
			return false;
		}
		return true;                // return true to keep iterating
			});
	return bulkQty;
}

/**
 * @returns open replen quantity
 * 
 */
function fnGetOpenReplenQtyAtOnce(ItemInternalId,VLoc,preferedbinid,totalOpenRplnQtyArr) 
{
	var result = nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_rpln_opentask_srh');

	if(ItemInternalId!=null && ItemInternalId!='' && ItemInternalId!='undefined' && ItemInternalId!=undefined)
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_sku',null,'anyof', ItemInternalId));

	if(VLoc!=null && VLoc!='' && VLoc!='undefined' && VLoc!=undefined)
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location',null, 'anyof', VLoc));

	if(preferedbinid != null && preferedbinid != '' && preferedbinid != 'undefined' && preferedbinid != undefined)
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_actendloc',null, 'anyof', preferedbinid));

	var resLen = result.runSearch();

	var expQty = 0;
	var actQty = 0;
	var loadsrhItr = 0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		loadsrhItr++;
		var itemId = searchResult.getValue('custrecord_wmsse_sku',null,'group');
		var prefBinId = searchResult.getValue('custrecord_wmsse_actendloc',null,'group');
		expQty = searchResult.getValue('custrecord_wmsse_expe_qty',null,'sum');
		actQty = searchResult.getValue('custrecord_wmsse_act_qty',null,'sum');
		if(expQty == '' || expQty == null)
			expQty = 0;
		if(actQty == '' || actQty == null)
			actQty = 0;

		var remQty = Big(expQty).minus(actQty);
		nlapiLogExecution('Debug','remQty',remQty);
		totalOpenRplnQtyArr[itemId.toString()+'$'+prefBinId.toString()] = remQty;
		if(parseFloat(loadsrhItr) == 4000)
		{
			return false;
		}
		return true;                // return true to keep iterating
			});
	nlapiLogExecution('Debug','totalOpenRplnQtyArr',totalOpenRplnQtyArr.length);
	return totalOpenRplnQtyArr;
}

/**
 * 
 * @returns process the selected items.
 */
function processOldResponseData(oldResponseArr,timestamp1,context,request,assignedTo,oldProcessItrHaltValue,invokeScheduler,processedItems)
{
	var isRecCreated = false;
	if(oldResponseArr != null && oldResponseArr != '' && oldResponseArr != undefined)
	{
		for(var oldpageItr = 0; oldpageItr < oldResponseArr.length-1; oldpageItr++)
		{
			var timestamp5 = new Date();
			var timeduration = (parseFloat(timestamp5.getTime()) - parseFloat(timestamp1.getTime()));
			if((context.getRemainingUsage() > 200) && (parseFloat(timeduration)/1000 < 120))
			{
				var curvalues = [];
				if(oldResponseArr[oldpageItr] != null && oldResponseArr[oldpageItr] != '' && oldResponseArr[oldpageItr] != undefined)
					curvalues = oldResponseArr[oldpageItr].split(',');
				if(curvalues != null && curvalues != '' && curvalues != undefined)
				{
					var itemid = curvalues[0];
					processedItems.push(itemid);
					var location = request.getParameter('custpage_location');

					var toBin = '';
					var qoh = curvalues[1];
					var maxQty = curvalues[2];
					var replenQty = curvalues[3];
					var roundQty = curvalues[4];
					var toBinId = curvalues[5];
					var stockConversionRate = curvalues[6];
					var stockUnitText = '';

					var vOPenTaskPrefPickBinDetails =getOPenTaskPickBinDetailsRpln(itemid,toBinId,location,stockConversionRate);
					//To fetch Preferred bin open pick qty
					var openpickQty = 0;
					var vopenTaskBinIdArr = "";
					var vopenTaskBinQtyArr = "";
					if(vOPenTaskPrefPickBinDetails != null && 
							vOPenTaskPrefPickBinDetails != '' && 
							vOPenTaskPrefPickBinDetails.length > 0)
					{
						vopenTaskBinQtyArr = vOPenTaskPrefPickBinDetails[1];
						openpickQty = vopenTaskBinQtyArr[0];
					}

					var openRplnQty = fnOpenReplenQty(itemid,location,toBinId);
					//To get open replen quantity

					var bulkQty = 0;
					bulkQty = fnGetQtyOfBulkBins(itemid, location, bulkQty, toBinId);
					//To fetch bulk available quantity
					bulkQty = Big(bulkQty).div(stockConversionRate);

					if(maxQty == '' || maxQty == null || maxQty == undefined || maxQty == 'null')
						maxQty = 0;

					if(qoh == '' || qoh == null || qoh == undefined || qoh == 'null')
						qoh = 0;

					if(openpickQty == '' || openpickQty == null || openpickQty == undefined || openpickQty == 'null')
						openpickQty = 0;

					if(bulkQty == '' || bulkQty == null || bulkQty == undefined || bulkQty == 'null')
						bulkQty = 0;

					if(openRplnQty == '' || openRplnQty == null || openRplnQty == undefined || openRplnQty == 'null')
						openRplnQty = 0;

					//Calculating remaining quantity to replen
					
					openRplnQty=Big(openRplnQty);
					qoh=Big(qoh);
					
					var diffQty = Number(Big(maxQty).minus((openRplnQty).plus(qoh).minus(openpickQty)));
					nlapiLogExecution('Debug','diffQty in Big',diffQty);
					
					//Taking the minimum of Bulk Available Quantity and remaining quantity to replen 
					diffQty = Math.min(diffQty,bulkQty);

					if(parseFloat(diffQty) >= parseFloat(roundQty) || parseFloat(diffQty) != parseFloat(bulkQty))
					{
						//Rounding the final calculated quantity to replen 
					
						diffQty = Number((Big(diffQty).div(roundQty)).mul(roundQty));
						nlapiLogExecution('Debug','diffQty 1234 in Big',diffQty);
					}

					if(replenQty == '' || replenQty == null || replenQty  == 'null' ||
							replenQty == 0 || replenQty == undefined)
						replenQty = diffQty;

					var opentaskcount = '';
					//no. of Opentasks
					opentaskcount = Big(diffQty).div(replenQty);
					//rounding to next integer
					opentaskcount = Math.ceil(opentaskcount);

					var timestamp3 = new Date();
					var timeduration = (parseFloat(timestamp3.getTime()) - parseFloat(timestamp1.getTime()));

					var str = 'toBin.' + toBin + '<br/>';
					str = str + 'itemid.' + itemid + '<br/>';
					str = str + 'location.' + location + '<br/>';
					str = str + 'qoh.' + qoh + '<br/>';
					str = str + 'maxQty.' + maxQty + '<br/>';
					str = str + 'replenQty.' + replenQty + '<br/>';
					str = str + 'roundQty.' + roundQty + '<br/>';
					str = str + 'toBinId.' + toBinId + '<br/>';
					str = str + 'stockConversionRate.' + stockConversionRate + '<br/>';
					str = str + 'diffQty.' + diffQty + '<br/>';
					str = str + 'openRplnQty.' + openRplnQty + '<br/>';
					str = str + 'bulkQty.' + bulkQty + '<br/>';
					str = str + 'openpickQty.' + openpickQty + '<br/>';
					str = str + 'opentaskcount.' + opentaskcount + '<br/>';
					str = str + 'timeduration.' + timeduration + '<br/>';
					str = str + 'remaining usage.' + context.getRemainingUsage() + '<br/>';

					nlapiLogExecution('DEBUG', 'str',str);

					//If open replens are equal to bulk qty then system should not generate further for that item.
					if((parseFloat(bulkQty) - parseFloat(openRplnQty)) < parseFloat(roundQty)  && parseFloat(openRplnQty) > 0)
					{
						opentaskcount = 0;
					}

					if(parseFloat(opentaskcount) > 0)
					{
						if((parseFloat(context.getRemainingUsage()) > parseFloat(opentaskcount * 15)) && (parseFloat(timeduration)/1000 < 120))
						{
							//Below for loop creates replen open tasks 
							for(var createTaskItr = 0; createTaskItr < opentaskcount; createTaskItr++)
							{
								var recid = nlapiCreateRecord('customrecord_wmsse_trn_opentask'); 
								//Creating replen open task					
								if(itemid != null && itemid != '')
									recid.setFieldValue('name', itemid);
								if(itemid != null && itemid != '')
									recid.setFieldValue('custrecord_wmsse_sku', itemid);
								if(location != null && location != '')
									recid.setFieldValue('custrecord_wmsse_wms_location', location);
								if(toBinId != null && toBinId != '')
									recid.setFieldValue('custrecord_wmsse_actendloc', toBinId);

								if(replenQty != null && replenQty != '' && replenQty != 'null' &&
										replenQty != undefined)
									recid.setFieldValue('custrecord_wmsse_expe_qty', replenQty);

								if(stockUnitText != null && stockUnitText != '' && stockUnitText != 'null' && 
										stockUnitText != undefined)
									recid.setFieldValue('custrecord_wmsse_uom', stockUnitText);
								if(((parseFloat(opentaskcount)-1) == parseFloat(createTaskItr)) && replenQty != null &&
										replenQty != '' && replenQty != 'null' && replenQty != undefined &&
										((parseFloat(diffQty)%parseFloat(replenQty) == 0) != true))
								{
									replenQty = (((parseFloat(diffQty)/parseFloat(replenQty))%1)*
											parseFloat(replenQty));
									replenQty = Math.round(replenQty); 
									nlapiLogExecution('DEBUG','replenQty',replenQty);
									recid.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(replenQty).toFixed(8)));
								}
								if(assignedTo!='' && assignedTo!=null && assignedTo != 'null' &&
										assignedTo != undefined)						
									recid.setFieldValue('custrecord_wmsse_task_assignedto', assignedTo);

								recid.setFieldValue('custrecord_wmsse_wms_status_flag', '30'); //Replenishment

								recid.setFieldValue('custrecord_wmsse_tasktype', '17'); //RPLN

								if(parseFloat(replenQty) > 0)
								{
									var resultId = nlapiSubmitRecord(recid);
									nlapiLogExecution("DEBUG",'resultId',resultId);
									isRecCreated = true;
								}
							}
						}
						else
						{
							oldProcessItrHaltValue = oldpageItr;
							nlapiLogExecution("ERROR",'oldProcessItrHaltValue',oldProcessItrHaltValue);
							invokeScheduler = 'Y';
							break;
						}
					}
					else
					{
						var currentUserID = getCurrentUser();
						var strUserID = 'R'+currentUserID;

						var day = new Date();
						var date = day.getDate();
						var month = day.getMonth();
						var year = day.getFullYear();
						var hours = day.getHours();
						var mins = day.getMinutes();
						var secs = day.getSeconds();

						var refNum = strUserID + date + month + year + hours + mins + secs;

						var recid = nlapiCreateRecord('customrecord_wmsse_errorlog'); 
						//Creates Error Log record					
						recid.setFieldValue('name', 'Replenishment');

						recid.setFieldValue('custrecord_wmsse_error_tranref', refNum);

						recid.setFieldValue('custrecord_wmsse_error_processname', 'Generate Replenishment');

						if(itemid != null && itemid != '')
							recid.setFieldValue('custrecord_wmsse_error_ref1', itemid);

						if(location != null && location != '')
							recid.setFieldValue('custrecord_wmsse_error_location', location);

						if(toBinId != null && toBinId != '')
							recid.setFieldValue('custrecord_wmsse_error_ref2', toBinId);

						if(currentUserID!='' && currentUserID!=null && currentUserID != 'null' && currentUserID != undefined)						
							recid.setFieldValue('custrecord_wmsse_error_user', currentUserID);

						if(bulkQty == 0 || (parseFloat(openRplnQty) >= parseFloat(bulkQty)))
							recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to insufficeint quantity in bulk sotrage locations.');
						else if(openRplnQty > 0)
							recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed due to open replens exists for this item.');
						else
							recid.setFieldValue('custrecord_wmsse_error_exception', 'Replenishment failed.');

						var errResultId = nlapiSubmitRecord(recid);
						nlapiLogExecution("DEBUG",'errResultId',errResultId);
					}
				}
			}
			else
			{
				oldProcessItrHaltValue = oldpageItr;
				nlapiLogExecution("DEBUG",'oldProcessItrHaltValue',oldProcessItrHaltValue);
				invokeScheduler = 'Y';
				break;
			}
		}
	}
	var currow = [isRecCreated, oldProcessItrHaltValue, invokeScheduler];

	return currow;
}

function updateScheduleScriptStatus(processname,curuserId,status,transactionrefno,trantype,notes)
{
	nlapiLogExecution('DEBUG','Into updateScheduleScriptStatus',status);

	var str = 'processname. = ' + processname + '<br>';
	str = str + 'curuserId. = ' + curuserId + '<br>';	
	str = str + 'transactionrefno. = ' + transactionrefno + '<br>';	
	str = str + 'trantype. = ' + trantype + '<br>';	
	str = str + 'notes. = ' + notes + '<br>';	

	nlapiLogExecution('Debug', 'Function Parameters', str);

	if(status=='Submitted')
	{
		var datetime = DateStamp() +" "+ getClockTime(); 

		var schedulestatus = nlapiCreateRecord('customrecord_wmsse_schscripts_status');
		schedulestatus.setFieldValue('name',processname);
		if(processname != null && processname != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprsname',processname);
		if(status != null && status != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprsstatus',status);
		if(datetime != null && datetime != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprsinitiateddatetime',datetime);
		if(transactionrefno != null && transactionrefno != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprstranrefno',transactionrefno);
		if(curuserId!=null && curuserId!='')
			schedulestatus.setFieldValue('custrecord_wmsse_schprsinitiatedby',curuserId);
		if(trantype != null && trantype != '')
			schedulestatus.setFieldValue('custrecord_wmsse_schprstrantype',trantype);
		var tranid = nlapiSubmitRecord(schedulestatus);
	}
	else if(status=='In Progress') 
	{
		var filter=new Array();
		if(curuserId!=null && curuserId!='')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsinitiatedby',null,'anyof',curuserId));
		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsstatus',null,'is','Submitted'));
		if(processname != null && processname != '')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname',null,'is',processname));
		if(transactionrefno != null && transactionrefno != '')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',null,'is',transactionrefno));

		var column=new Array();
		column[0]=new nlobjSearchColumn('custrecord_wmsse_schprsname');
		column[1]=new nlobjSearchColumn('id').setSort();

		var searchresult=nlapiSearchRecord('customrecord_wmsse_schscripts_status',null,filter,column);
		if(searchresult!=null && searchresult!='')
		{
			var vid=searchresult[0].getId();
			nlapiLogExecution('DEBUG','vid in In Progress',vid);
			var fields = new Array();
			var values = new Array();

			fields[0] = 'custrecord_wmsse_schprsstatus';
			fields[1] = 'custrecord_wmsse_schprsbegindate';
			fields[2] = 'custrecord_wmsse_schprsbegintime';

			values[0] = status;
			values[1] = DateStamp();
			values[2] = TimeStamp();

			nlapiSubmitField('customrecord_wmsse_schscripts_status', vid, fields, values);
		}

	}
	else if(status=='Completed') 
	{
		var filter=new Array();
		if(curuserId!=null && curuserId!='')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsinitiatedby',null,'anyof',curuserId));

		filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsstatus',null,'is','In Progress'));

		if(processname != null && processname != '')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprsname',null,'is',processname));

		if(transactionrefno != null && transactionrefno != '')
			filter.push(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',null,'is',transactionrefno));

		var column=new Array();
		column[0]=new nlobjSearchColumn('custrecord_wmsse_schprsname');
		column[1]=new nlobjSearchColumn('id').setSort();

		var searchresult=nlapiSearchRecord('customrecord_wmsse_schscripts_status',null,filter,column);
		if(searchresult!=null && searchresult!='')
		{
			var vid=searchresult[0].getId();
			nlapiLogExecution('DEBUG','vid in In Completed',vid);
			var fields = new Array();
			var values = new Array();

			fields[0] = 'custrecord_wmsse_schprsstatus';
			fields[1] = 'custrecord_wmsse_schprsenddate';
			fields[2] = 'custrecord_wmsse_schprsendtime';
			fields[3] = 'custrecord_wmsse_schprsnotes';
			if(notes == null || notes =='' || notes =='null' || notes =='undefined')
				notes ='';
			values[0] = status;
			values[1] = DateStamp();
			values[2] = TimeStamp();
			values[3] = notes;

			nlapiSubmitField('customrecord_wmsse_schscripts_status', vid, fields, values);
		}
	}
	nlapiLogExecution('DEBUG','updateScheduleScriptStatus end',transactionrefno);
}
