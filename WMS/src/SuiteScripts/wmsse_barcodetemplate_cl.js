
/***************************************************************************
 Copyright � 2018,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 *@NApiVersion 2.x
 *@NModuleScope Public
 *@NScriptType ClientScript
 */

define(['N/search', 'N/currentRecord','N/url','N/https','N/search','N/ui/message'], 
		function(SEARCHMODULE, currentRecord, url, https,search,message){
	var rec = currentRecord.get();

	/*
	 * This function will trigger when save the Bar Code Template data
	 */
	function onSaveRecord() 
	{
		if(rec.getValue('hdndeleteflag')!='T' &&
				rec.getValue('custpage_txtbarcodeformat')!=null && rec.getValue('custpage_txtbarcodeformat')!='')
		{
			var barcodetemplatename = rec.getValue('custpage_txtbarcodeformat');
			var barcodetemplateid =  rec.getValue('hdntemplateid');
			var barcodepaddingchar =  rec.getValue('custpage_selectpaddingcharacter');

			if(istemplateexist(barcodetemplatename,barcodetemplateid)=='T')
			{
				alert('A bar code template with that name already exists. Go back, change the name, and resubmit.');
				return false;
			}

			var vendorcount = rec.getLineCount('custpage_sublistvendors');
			var componentcount = rec.getLineCount('custpage_sublstcomponents');
			var vendorid = '';
			var vendorname='';
			for (var p = 0; p < vendorcount; p++) 
			{
				vendorid = rec.getSublistValue('custpage_sublistvendors', 'custpage_selectvendors', p);
				vendorname = rec.getSublistText('custpage_sublistvendors', 'custpage_selectvendors', p);

				if(issameindexesexist(vendorid,barcodetemplateid,componentcount)=='T')
				{
					alert('A bar code template with the same defined components already exists for the vendor '+vendorname);
					return false;
				}
			}
			var count=0;
			var countitr=0;
			var currcomponentid = 0;
			for (var totalcomp = 0; totalcomp < componentcount; totalcomp++) 
			{
				currcomponentid = rec.getSublistValue('custpage_sublstcomponents', 'custpage_selectcomponent', totalcomp);
				countitr++;		
				if(currcomponentid==1)
					count++;

			}

			if((count ==0 && countitr>0) || componentcount == 0)
			{
				alert('On the Bar Code Components tab, you must add an item component and configure associated index.');
				return false;
			}

		}

		return true;
	}

	/*
	 * This function will check, if the vendor is having another template with the same configuration.
	 */
	function issameindexesexist(pvendorid,ptemplateid,pcomponentcount)
	{
		var returnvalue='F';

		if(pcomponentcount==0)
			return 'F';

		var templateList = getbarcodetemplateheaderdata(null,ptemplateid,pvendorid);
		if(templateList!=null && templateList!='')
		{			
			for (var tempitr = 0; tempitr < templateList.length; tempitr++) 
			{
				returnvalue='T';

				var vtemplateid=templateList[tempitr].id;

				var compfilters = new Array();

				if(vtemplateid!=null && vtemplateid!='')
				{
					compfilters.push(search.createFilter({
						name: 'custrecord_wmsse_barcode_templatename',
						operator: search.Operator.ANYOF,
						values: vtemplateid
					}));
				}

				compfilters.push(search.createFilter({
					name: 'custrecord_wmsse_barcodevendor',
					join:'custrecord_wmsse_barcode_templatename',
					operator: search.Operator.ANYOF,
					values: pvendorid
				}));

				var componentsearch= search.load({
					id: 'customsearch_wmsse_barcodecomponents'
				});

				componentsearch.filters = compfilters;

				var componentsList = componentsearch.run().getRange({
					start: 0,
					end: 1000
				});

				if(componentsList!=null && componentsList!='')
				{

					var currcomponentid= '';
					var currcomponentname='';
					var currstartindex='';
					var currendindex='';
					var componentid = '';
					var componentname='';
					var startindex='';
					var endindex='';

					for (var compitr = 0; compitr < pcomponentcount; compitr++) 
					{
						if(pcomponentcount!=componentsList.length)
						{
							returnvalue='F';
							break;
						}

						currcomponentid = rec.getSublistValue('custpage_sublstcomponents', 'custpage_selectcomponent', compitr);
						currcomponentname=rec.getSublistText('custpage_sublstcomponents', 'custpage_selectcomponent', compitr);
						currstartindex=rec.getSublistValue('custpage_sublstcomponents', 'custpage_txtstartindex', compitr);
						currendindex=rec.getSublistValue('custpage_sublstcomponents', 'custpage_txtendindex', compitr);

						for (var srchitr = 0; srchitr < componentsList.length; srchitr++) 
						{
							componentid = componentsList[srchitr].id;
							componentname=componentsList[srchitr].getText('custrecord_wmsse_componentname');
							startindex=componentsList[srchitr].getValue('custrecord_wmsse_componentstartingindex');
							endindex=componentsList[srchitr].getValue('custrecord_wmsse_componentendingindex');

							if(currcomponentname==componentname)
							{
								if(parseInt(currstartindex)!=parseInt(startindex) ||
										parseInt(currendindex)!=parseInt(endindex))
								{
									returnvalue='F';
									break;
								}
							}
						}
					}
				}
				else
				{
					returnvalue='F';
				}
			}
		}
		else
		{
			returnvalue='F';
		}
		return returnvalue;
	}

	/*
	 * This function will give the Bar Code Template header data.
	 */
	function getbarcodetemplateheaderdata(ptemplatename,ptemplateid,pvendorid)
	{
		var filters = new Array();

		if(ptemplateid!=null && ptemplateid!='')
		{
			filters.push(search.createFilter({
				name: 'internalid',
				operator: search.Operator.NONEOF,
				values: ptemplateid
			}));
		}

		if(pvendorid!=null && pvendorid!='')
		{
			filters.push(search.createFilter({
				name: 'custrecord_wmsse_barcodevendor',
				operator: search.Operator.ANYOF,
				values: pvendorid
			}));
		}

		if(ptemplatename!=null && ptemplatename!='')
		{

			filters.push(search.createFilter({
				name: 'name',
				operator: search.Operator.IS,
				values: ptemplatename
			}));
		}

		var templatesearch= search.load({
			id: 'customsearch_wmsse_barcodetemplatesearch'
		});

		templatesearch.filters = filters;

		var templateList = templatesearch.run().getRange({
			start: 0,
			end: 1000
		});

		return templateList;
	}

	/*
	 * This function will check, if there is already another template with the same name.
	 */
	function istemplateexist(ptemplatename,ptemplateid)
	{
		var templateList = getbarcodetemplateheaderdata(ptemplatename,ptemplateid,null);

		if(templateList!=null && templateList!='')
		{
			return 'T';
		}

		return 'F';
	}

	/*
	 * This function will be triggered when clicking on Cancel button.
	 */
	function clearscreendata()
	{
		var templateURL = url.resolveScript({
			scriptId: 'customscript_wmsse_barcodetemplates',
			deploymentId: 'customdeploy_wmsse_barcodetemplates',
		});

		window.location.href = templateURL;
	}

	/*
	 * This function will be triggered when clicking on Search button.
	 */
	function gotosearch()
	{
		var templateURL = url.resolveScript({
			scriptId: 'customscript_wmsse_barcodetemplatesearch',
			deploymentId: 'customdeploy_wmsse_barcodetemplatesearch',
		});

		window.location.href = templateURL;
	}

	/*
	 * This function will be triggered when clicking on Delete button.
	 */
	function deletetemplatedata()
	{
		var vconfirm = confirm("Are you sure you want to delete this template?");
		if(vconfirm==true)
		{
			rec.setValue('hdndeleteflag','T');	
			NLDoMainFormButtonAction("submitter",true);	
		}
	}

	/*
	 * This function will be used to display the confirmation message on successful saving of the data.
	 */
	function displaymessage()
	{
		var barcodetemplateid =  rec.getValue('hdntemplateid');
		var fromsearchscreen =  rec.getValue('hdnfromsearchscr');
		var pagemode=rec.getValue('hdnpagemode');

		if(barcodetemplateid!=null && barcodetemplateid!='' && 
				fromsearchscreen!='Y' && pagemode!='Edit')
		{
			var myMsg = message.create({
				title: "Confirmation",
				message: "Composite Bar Code Template Saved Successfully",
				type: message.Type.CONFIRMATION
			});

			myMsg.show();
		}		
	}

	/*
	 * This function will be executed when adding/editing components/vendors to the template.
	 */
	function onInsertLine(context)
	{
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var barcodetemplateid =  currentRecord.getValue('hdntemplateid');

		if(sublistName=='custpage_sublistvendors')
		{
			var vendorcount = currentRecord.getLineCount('custpage_sublistvendors');			
			var componentcount = currentRecord.getLineCount('custpage_sublstcomponents');

			var currvendorname=currentRecord.getCurrentSublistText('custpage_sublistvendors', 'custpage_selectvendors', p);
			var currindex = currentRecord.getCurrentSublistIndex('custpage_sublistvendors');

			for (var p = 0; p < vendorcount; p++) 
			{
				var vendorid = currentRecord.getSublistValue('custpage_sublistvendors', 'custpage_selectvendors', p);
				var vendorname=currentRecord.getSublistText('custpage_sublistvendors', 'custpage_selectvendors', p);

				if(currvendorname==vendorname && currindex!=p)
				{
					alert('You cannot add the same vendor to the vendor list more than once.');
					return false;
				}
			}
		}

		if(sublistName=='custpage_sublstcomponents')
		{
			var currcomponentid = currentRecord.getCurrentSublistValue('custpage_sublstcomponents', 'custpage_selectcomponent');
			var currcomponentname=currentRecord.getCurrentSublistText('custpage_sublstcomponents', 'custpage_selectcomponent');
			var currstartindex=currentRecord.getCurrentSublistValue('custpage_sublstcomponents', 'custpage_txtstartindex');
			var currendindex=currentRecord.getCurrentSublistValue('custpage_sublstcomponents', 'custpage_txtendindex');
			var currdataformat=currentRecord.getCurrentSublistText('custpage_sublstcomponents', 'custpage_selectdataformat');
			var currcompindex = currentRecord.getCurrentSublistIndex('custpage_sublstcomponents');

			if(currcomponentid==null || currcomponentid=='')
			{
				alert('You must select a value in the Component field.');
				return false;
			}

			if(currstartindex==null || currstartindex=='')
			{
				alert('You must enter a value in the Starting Index field.');
				return false;
			}

			if(currstartindex<0)
			{
				alert('The value in the Starting Index field should not be negative.');
				return false;
			}

			if(currendindex==null || currendindex=='')
			{
				alert('You must enter a value in the Ending Index field.');
				return false;
			}

			if(currendindex<0)
			{
				alert('The value in the Ending Index field should not be negative.');
				return false;
			}

			if(currstartindex>currendindex)
			{
				alert('The value in the Ending Index field must be greater than the value in the Starting Index field.');
				return false;
			}
			if(currcomponentname=='Expiry Date')
			{
				if(currdataformat==null || currdataformat=='')
				{
					alert('You must select a value in the Data Format field for the Expiry Date component.');
					return false;
				}
				else
				{
					var formatlength = currdataformat.length;
					var componentlength = currendindex-(currstartindex-1);
					if(componentlength<formatlength)
					{
						alert('The size of index range for the Expiry Date component must be equal to the number of characters in the Data Format field. For example, if the Data Format field is set to MMDDYY, the index range size must be six. An example valid index range is 11-16.');
						return false;
					}
				}
			}

			var componentcount = currentRecord.getLineCount('custpage_sublstcomponents');

			for (var ccompitr = componentcount-1; ccompitr >= 0; ccompitr--)
			{
				var componentname=currentRecord.getSublistText('custpage_sublstcomponents', 'custpage_selectcomponent', ccompitr);

				if(currcomponentname==componentname && currcompindex!=ccompitr)
				{
					alert('You cannot add the same component to the component list more than once.');
					return false;
				}

				var startindex=currentRecord.getSublistValue('custpage_sublstcomponents', 'custpage_txtstartindex', ccompitr);
				var endindex=currentRecord.getSublistValue('custpage_sublstcomponents', 'custpage_txtendindex', ccompitr); 
				if(startindex<=currendindex && endindex>=currstartindex && currcompindex!=ccompitr)
				{
					alert('The value in the Starting Index field for the '+currcomponentname+' component must be greater than the value in the Ending Index field for the '+componentname+' component.');
					return false;
				}
			}
		}

		return true;
	}

	function onInitline(context) 
	{
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		if (sublistName == 'custpage_sublstcomponents')
		{
			var componentcount = currentRecord.getLineCount('custpage_sublstcomponents');

			if(componentcount>0)
			{
				var defstartindex = (currentRecord.getSublistValue('custpage_sublstcomponents', 'custpage_txtendindex', (componentcount-1)))+1;
				if(currentRecord.getCurrentSublistValue({sublistId:sublistName,fieldId:'custpage_txtstartindex',value: defstartindex})==null ||
						currentRecord.getCurrentSublistValue({sublistId:sublistName,fieldId:'custpage_txtstartindex',value: defstartindex})=='')
					currentRecord.setCurrentSublistValue({sublistId:sublistName,fieldId:'custpage_txtstartindex',value: defstartindex})
			}
		}
	}

	return {
		saveRecord:onSaveRecord,
		cleardata:clearscreendata,
		deletedata:deletetemplatedata,
		searchdata:gotosearch,
		pageInit:displaymessage,
		validateLine:onInsertLine,
		lineInit:onInitline
	};
});

