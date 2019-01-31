/***************************************************************************
 * Script Description
 * This script is used to find duplicate item aliases.
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
var eventtype;
function setDefaultValue(type)
{
	eventtype=type;

}

function onSave(type)
{	
	if(eventtype=='create' || eventtype=='copy' )
	{
		var itemalias=nlapiGetFieldValue('name');
//		alert("itemalias" + itemalias);
		var filterspo = new Array();
		filterspo.push(new nlobjSearchFilter('name', null, 'is', itemalias));


		var colspo = new Array();
		colspo[0]=new nlobjSearchColumn('name');
		colspo[0].setSort(true);

		var searchresults = nlapiSearchRecord('customrecord_wmsse_sku_alias', null, filterspo, colspo);

		//alert("searchresults" + searchresults);

		if(searchresults !="" && searchresults !=null)
		{
			alert("Item alias already exists");
			return false;
		}
		else
			return true;
	}
	else
		return true;

}


//upto here
