


/**
 * This function is to delete the selected uom
 * @param row
 * @param uomresults
 */
function deleteUom(row,uomresults){
	var rowNum = row.parentNode.parentNode.sectionRowIndex;		

	var uomcntlid = document.getElementById('tblUOM').rows[rowNum].cells[2].childNodes[0].id;
	var uomcntl = document.getElementById(uomcntlid);
	var selectedUOMText = uomcntl.options[uomcntl.selectedIndex].text;	
	var selectedUOM = uomcntl.options[uomcntl.selectedIndex].value;	

	var uomValArr =uomresults.split(',');

	var delId = parseInt(rowNum);
	document.getElementById('tblUOM').deleteRow(delId);		
	var rowlength = document.getElementById('tblUOM').rows.length;

	for(r=0;r<rowlength;r++){

		var uomselectCntrlId = document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].id;
		var uomselectCntrl = document.getElementById(uomselectCntrlId);

		var option = document.createElement('option');
		option.text=selectedUOMText;option.value=selectedUOM;uomselectCntrl.add(option);
	}
	document.getElementById('div_error').innerHTML ='';
	return false;	
}
/**
 * This function fires when try to change the uom in the uoms dropdown
 * @param row
 * @param uomresults
 */
function onUomChange(row,uomresults) {

	var rowNum = row.parentNode.parentNode.sectionRowIndex;

	var uomcntlid = document.getElementById('tblUOM').rows[rowNum].cells[2].childNodes[0].id;
	var uomcntl = document.getElementById(uomcntlid);
	var selectedUOMValue = uomcntl.options[uomcntl.selectedIndex].text;


	var rowlength = document.getElementById('tblUOM').rows.length;

	var selecteduomsArr = new Array();

	for(var p=0;p<rowlength;p++){
		var uomcntlid = document.getElementById('tblUOM').rows[p].cells[2].childNodes[0].id;
		var uomcntl = document.getElementById(uomcntlid);
		var uomtxt = uomcntl.options[uomcntl.selectedIndex].text;				
		selecteduomsArr.push(uomtxt);
	}

	for(r=0;r<rowlength;r++){
		/*if(rowNum != r){*/

		var uomcntlid1 = document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].id;
		var uomselectcntrl = document.getElementById(uomcntlid1);
		var uomselectCntrlvalue = uomselectcntrl.options[uomselectcntrl.selectedIndex].text;	

		var optionslength = uomselectcntrl.options.length;
		for(var p=optionslength-1;p >= 0;p--){
			uomselectcntrl.remove(p);
		}
		var uomValArr =uomresults.split(',');
		if(uomselectCntrlvalue==''){var option = document.createElement('option');
		option.text='';option.value='';uomselectcntrl.add(option);
		}
		for(var u=0;u<uomValArr.length;u++){
			var tUom = uomValArr[u];
			var separatorInd =tUom.lastIndexOf('_');var uomText = tUom.substring(0,separatorInd);var uomVal =  tUom.substring(separatorInd+1);

			var boolFound = false; 
			for(var s1=0;s1<selecteduomsArr.length;s1++)
			{
				var selectedUomArrElem = selecteduomsArr[s1];
				if(selectedUomArrElem == uomText)
				{
					boolFound = true;
					break;
				}

			}
			if(boolFound==false || uomText == uomselectCntrlvalue){
				var option = document.createElement('option');
				option.text=uomText;option.value=uomVal;if(uomText == uomselectCntrlvalue){option.selected=true;}
				uomselectcntrl.add(option);
			}
		}
		//}

	}

}
/**
 * This function is to add the new row to select new uom
 * @param remainingQty
 * @param stockConversionRate
 * @param uomresults
 * @param delbtnimgUrl
 * @param addbtnimgUrl
 */
function validateaddUom(remainingQty,stockConversionRate,uomresults,delbtnimgUrl,addbtnimgUrl,overagecheck) {

	var remainQty=0;

	if(remainingQty != null && remainingQty != '' && remainingQty != 'null' && remainingQty != 'undefined')
	{
		remainQty=parseFloat(remainingQty).toFixed(5)*parseFloat(stockConversionRate).toFixed(5);
	}

	var tbl =document.getElementById('tblUOM');
	var rowlength = tbl.rows.length;
	var uomValArr =uomresults.split(',');
	var selectedUomArr = new Array();
	for(var r=0;r<rowlength;r++){		
		var uomcntlid = document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].id;
		var uomcntl = document.getElementById(uomcntlid);
		var uomtxt = uomcntl.options[uomcntl.selectedIndex].text;			
		selectedUomArr.push(uomtxt);
	}

	for(var k=0;k<rowlength;k++){
		var quantity =document.getElementById('tblUOM').rows[k].cells[0].childNodes[0].value;
		var uom =document.getElementById('tblUOM').rows[k].cells[2].childNodes[0].value;
		if(quantity == '' || isNaN(quantity) || quantity <= 0 ){if(quantity == ''){
			document.getElementById('div_error').innerHTML ='Please enter qty ';
			document.getElementById('tblUOM').rows[k].cells[0].childNodes[0].focus();
			return false;
		}
		else if(isNaN(quantity) || quantity <= 0 ){document.getElementById('div_error').innerHTML ='Please enter valid qty ';document.getElementById('tblUOM').rows[k].cells[0].childNodes[0].focus();}return false;}
		if(uom == ''){
			document.getElementById('div_error').innerHTML ='Please select uom ';
			document.getElementById('tblUOM').rows[k].cells[2].childNodes[0].focus();return false;}

		if(remainingQty != null && remainingQty != '' && remainingQty != 'null' && remainingQty != 'undefined')
		{
			var tremqty = parseFloat(uom)*parseFloat(quantity);
			remainQty = parseFloat(remainQty)-parseFloat(tremqty);
			if(overagecheck == null || overagecheck == '' || overagecheck == 'null' || overagecheck == 'undefined')
			{
				overagecheck = 'F';
			}
			if(remainQty < 0 && overagecheck=='F'){
				document.getElementById('div_error').innerHTML ='Entered/Scanned qty exceeds remaining qty';
				document.getElementById('tblUOM').rows[k].cells[0].childNodes[0].focus();	

				return false;}
			else{
				if(remainQty==0 && overagecheck=='F'){document.getElementById('div_error').innerHTML ='Qty completed';
				document.getElementById('tblUOM').rows[k].cells[0].childNodes[0].focus();
				return false;}
			}
		}
		if((selectedUomArr.length == (parseInt(uomValArr.length)) && (k== parseInt(rowlength)-1) ))
		{
			document.getElementById('div_error').innerHTML ='UOMs completed';
			document.getElementById('tblUOM').rows[k].cells[0].childNodes[0].focus();
			return false;
		}	
		else
		{
			document.getElementById('div_error').innerHTML ='';
		}
		var btn = document.getElementById('tblUOM').rows[k].cells[4].childNodes[0];btn.src=delbtnimgUrl;
		var delRow =k;
		btn.onclick = function(){return deleteUom(this,uomresults);};	
	}



	for(var r=0;r<rowcount;r++){

		var uomlistId = document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].id;
		var uomselected = document.getElementById(uomlistId);			
		var selecetedUOM = uomselected.options[uomselected.selectedIndex].text;	

		var optionslength = uomselected.options.length;
		for(var p=optionslength-1;p >= 0;p--)
		{
			uomselected.remove(p);
		}

		if(selecetedUOM==''){var option = document.createElement('option');
		option.text='';option.value='';uomselected.appendChild(option);
		}
		for(var u=0;u<uomValArr.length;u++){
			var tUom = uomValArr[u];
			var separatorInd =tUom.lastIndexOf('_');
			var uomText = tUom.substring(0,separatorInd);
			var uomVal =  tUom.substring(separatorInd+1);;
			var boolFound = false; 
			for(var s1=0;s1<selectedUomArr.length;s1++)
			{
				var selectedUomArrElem = selectedUomArr[s1];
				if(selectedUomArrElem == uomText)
				{
					boolFound = true;
					break;
				}

			}
			if(boolFound == false || uomText == selecetedUOM){				
				var option = document.createElement('option');
				option.text=uomText;option.value=uomVal;
				if(uomText == selecetedUOM){
					option.selected=true;
				}
				uomselected.add(option);				
			}
		}

	}
	var controlId =Math.random();

	var newRow = document.getElementById('tblUOM').insertRow(); var firstCell = newRow.insertCell(0);
	var secondCell = newRow.insertCell(1);var thirdCell = newRow.insertCell(2);var fourthCell = newRow.insertCell(3);
	var fifthCell = newRow.insertCell(4);
	var rowcount = rowlength;
	var el = document.createElement('input');
	el.type = 'text';
	el.name = 'txtqty' + controlId;
	el.id = 'txtqty' + controlId;
	el.className='smalltextbox';

	//el.style['font-size']= '1em';
	//el.style = 'background: white; border: 1px double #DDD; border-radius: 0px;box-shadow: 0 0 5px #333;color: #666; outline: none;height:20px; width: 150px;font-size: 16px;';

	firstCell.appendChild(el);el.focus();
	var el1 = document.createElement('select');
	el1.name = 'uomlist' + controlId;
	el1.id = 'uomlist' + controlId;
	el1.className  = 'labelmsg';	
	el1.onchange=function(){return onUomChange(this,uomresults);};	
	thirdCell.appendChild(el1);

	for(var u=0;u<uomValArr.length;u++){
		var tUom = uomValArr[u];
		var separatorInd =tUom.lastIndexOf('_');var uomText = tUom.substring(0,separatorInd);var uomVal =  tUom.substring(separatorInd+1);if(u==0){
			var option = document.createElement('option');option.text='';option.value='';el1.add(option);}
		var boolFound = false; 
		for(var s2=0;s2<selectedUomArr.length;s2++)
		{
			var selectedUomArrElem = selectedUomArr[s2];
			if(selectedUomArrElem == uomText)
			{
				boolFound = true;
				break;
			}

		}
		if(boolFound == false){
			var option = document.createElement('option');option.text=uomText;option.value=uomVal;el1.add(option);

		}
	}

	var el3 = document.createElement('input');
	el3.type = 'image';
	el3.name = 'imgplus' + controlId;
	el3.id = 'imgplus' + controlId;

	el3.onclick=function(){return validateaddUom(remainingQty,stockConversionRate,uomresults,delbtnimgUrl,addbtnimgUrl,overagecheck);};
	el3.src=addbtnimgUrl;  
	fifthCell.appendChild(el3);
	return false;
}

function validateForm(ConvertQty,remainingQty,hdnfielduomwithqtyId,hdnItemTypeId,txtBinId,hdnPreferBinId,hdnfldtotaluomqtyenteredId) {
	var remainQty=0;

	if(remainingQty != null && remainingQty != '' && remainingQty != 'null' && remainingQty != 'undefined')
	{
		remainQty=parseFloat(remainingQty).toFixed(5)*parseFloat(ConvertQty).toFixed(5);
	}

	var uomTbl = document.getElementById('tblUOM');
	var enteredQty =0;
	var selecteduomqtyArr = new Array();
	if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){
		var rowcount = uomTbl.rows.length;

		for(var r=0;r<rowcount;r++){
			var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;if(qty==''){
				document.getElementById('div_error').innerHTML ='Please enter qty';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;
			}
			else {if(isNaN(qty) || parseFloat(qty)<=0){
				document.getElementById('div_error').innerHTML ='Please enter valid qty';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;	
			}}
			var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;
			if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';
			document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].focus();return false;
			}
			var uomqtyStr = qty+'_'+uom;
			selecteduomqtyArr.push(uomqtyStr);
			enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom));
		}

		document.getElementById(hdnfielduomwithqtyId).value=selecteduomqtyArr;
		var scannedqty=parseFloat(enteredQty)/parseFloat(ConvertQty);

	}
	else{enteredQty = document.getElementById('txtqty').value;
	if(enteredQty == ''){
		document.getElementById('div_error').innerHTML ='Please enter qty';
		document.getElementById('txtqty').focus();return false;}
	else if(isNaN(enteredQty) || parseFloat(enteredQty)<=0)	
	{
		document.getElementById('div_error').innerHTML ='Please enter valid qty';
		document.getElementById('txtqty').focus();return false;
	}


	}
	if(enteredQty == ''){
		document.getElementById('div_error').innerHTML ='Please enter qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;}	
	else{
		var scannedqty=enteredQty;
		if(remainingQty != null && remainingQty != '' && remainingQty != 'null' && remainingQty != 'undefined')
		{
			var remainingqty=parseFloat(remainingQty)*parseFloat(ConvertQty);
			if((isNaN(scannedqty) || parseFloat(scannedqty)<=0)  ){
				document.getElementById('div_error').innerHTML ='Please enter valid qty';
				if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
					document.getElementById('txtqty').focus();
				}else{
					var rowcount1 = uomTbl.rows.length;
					var rowInd = parseInt(rowcount1)-1;
					document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
				}
				return false;
			}
			if((parseFloat(scannedqty)>parseFloat(remainingqty))){
				document.getElementById('div_error').innerHTML ='Entered/Scanned qty is greater than available quantity';
				if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
					document.getElementById('txtqty').focus();
				}else{
					var rowcount1 = uomTbl.rows.length;
					var rowInd = parseInt(rowcount1)-1;
					document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
				}

				return false;
			}
		}

		var itemtype=document.getElementById(hdnItemTypeId).value;
		if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){
			var conversionQty=enteredQty;
			if(conversionQty.toString().indexOf('.') > 0){
				document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';
				if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
					document.getElementById('txtqty').focus();
				}else{
					var rowcount1 = uomTbl.rows.length;
					var rowInd = parseInt(rowcount1)-1;
					document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
				}
				return false;
			}
		}
		if(document.getElementById(txtBinId).value == '' && (document.getElementById(hdnPreferBinId).value == '')){
			document.getElementById('div_error').innerHTML ='Please enter/scan bin location';
			document.getElementById(txtBinId).focus();return false;
		}
		else{
			if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){
				document.getElementById(hdnfldtotaluomqtyenteredId).value = enteredQty/ConvertQty;
			}
		}
	}
}
function DisplayBin(val,ConvertQty,availqty,hdnfielduomwithqtyId,hdnfldtotaluomqtyenteredId,hdnItemTypeId,txtBinId,formId) {
	var reWhiteSpace ='';var selecteduomqtyArr = new Array();var enteredQty =0;
	var uomTbl = document.getElementById('tblUOM');

	if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){
		var rowcount = uomTbl.rows.length;
		for(var r=0;r<rowcount;r++){
			var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;
			if(qty==''){			
				document.getElementById('div_error').innerHTML ='Please enter qty ';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}
			else {if(isNaN(qty) || parseFloat(qty)<=0){
				document.getElementById('div_error').innerHTML ='Please enter valid qty';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;	
			}}
			var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;
			if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';return false;}
			var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr);
			enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom));}
		document.getElementById(hdnfielduomwithqtyId).value=selecteduomqtyArr;
		document.getElementById(hdnfldtotaluomqtyenteredId).value = parseFloat(enteredQty)/parseFloat(ConvertQty);qty=enteredQty;}
	else{
		var qty = document.getElementById('txtqty').value;

		reWhiteSpace = qty.indexOf(' ') >= 0;
	}
	var itemtype=document.getElementById(hdnItemTypeId).value;
	if(qty ==''){
		document.getElementById('div_error').innerHTML ='Please enter qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;

	}
	else if(isNaN(qty) || parseFloat(qty)<=0 || (reWhiteSpace == true)){
		document.getElementById('div_error').innerHTML ='Please enter valid qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;
	}
	else if(parseFloat(qty) > (parseFloat(availqty)*parseFloat(ConvertQty))){
		document.getElementById('div_error').innerHTML ='Entered/Scanned qty is greater than available qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').value = ''; }
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;
	}
	else if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){
		var conversionQty=(qty)*(ConvertQty);
		if(conversionQty.toString().indexOf('.') != -1){
			document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';
			if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
				document.getElementById('txtqty').focus();
			}else{
				var rowcount1 = uomTbl.rows.length;
				var rowInd = parseInt(rowcount1)-1;
				document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
			}
			return false;
		}
	}
	document.getElementById(txtBinId).value=val;
	document.forms[0].submit();
	document.getElementById('loading').style.display = ''; return true;
}
function DisplayBin_h(val,tostatusid,ConvertQty,availqty,hdnfielduomwithqtyId,hdnfldtotaluomqtyenteredId,hdnItemTypeId,txtBinId,hdntostatusid,formId) {
	var reWhiteSpace ='';var selecteduomqtyArr = new Array();var enteredQty =0;
	var uomTbl = document.getElementById('tblUOM');

	if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){
		var rowcount = uomTbl.rows.length;
		for(var r=0;r<rowcount;r++){
			var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;
			if(qty==''){			
				document.getElementById('div_error').innerHTML ='Please enter qty ';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}
			else {if(isNaN(qty) || parseFloat(qty)<=0){
				document.getElementById('div_error').innerHTML ='Please enter valid qty';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;	
			}}
			var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;
			if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';return false;}
			var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr);
			enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom));}
		document.getElementById(hdnfielduomwithqtyId).value=selecteduomqtyArr;
		document.getElementById(hdnfldtotaluomqtyenteredId).value = parseFloat(enteredQty)/parseFloat(ConvertQty);qty=enteredQty;}
	else{
		var qty = document.getElementById('txtqty').value;

		reWhiteSpace = qty.indexOf(' ') >= 0;
	}
	var itemtype=document.getElementById(hdnItemTypeId).value;
	if(qty ==''){
		document.getElementById('div_error').innerHTML ='Please enter qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;

	}
	else if(isNaN(qty) || parseFloat(qty)<=0 || (reWhiteSpace == true)){
		document.getElementById('div_error').innerHTML ='Please enter valid qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;
	}
	else if(parseFloat(qty) > (parseFloat(availqty)*parseFloat(ConvertQty))){
		document.getElementById('div_error').innerHTML ='Entered/Scanned qty is greater than available qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').value = ''; }
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;
	}
	else if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){
		var conversionQty=(qty)*(ConvertQty);
		if(conversionQty.toString().indexOf('.') != -1){
			document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';
			if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
				document.getElementById('txtqty').focus();
			}else{
				var rowcount1 = uomTbl.rows.length;
				var rowInd = parseInt(rowcount1)-1;
				document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
			}
			return false;
		}
	}
	document.getElementById(txtBinId).value=val;
	document.getElementById(hdntostatusid).value=tostatusid;
	document.forms[0].submit();
	document.getElementById('loading').style.display = ''; return true;
}
function setFocus(){
	try{
		var frmElementsLength = document.forms[0].elements.length;
		for(var l=0;l<frmElementsLength;l++)	{
			var type = document.forms[0].elements[l].type; 
			var dataentered = document.forms[0].elements[l].value;
			if(type=='text' && dataentered == ''){
				document.forms[0].elements[l].focus();break;
			}

		}
	}
	catch(e){}
}


//UOM dropdown change
function qtyUom_OnChange()
{

	var qtyUomcntl = document.getElementById('qtyUOMLst');
	var selectedUOMValue = qtyUomcntl.options[qtyUomcntl.selectedIndex].value;
	var qtyUomTbl = document.getElementById('tblqtyUOM');
	var prevselectedUOMValue = document.getElementById('hdnuomchangedvalue').value;
	document.getElementById('hdnuomchangedvalue').value = selectedUOMValue;
	var rowcount = qtyUomTbl.rows.length;
	for(var rowItr=1;rowItr<rowcount;rowItr++){
		var stockqty =document.getElementById('tblqtyUOM').rows[rowItr].cells[1].innerHTML;
		var conersionRate = parseFloat(prevselectedUOMValue)/parseFloat(selectedUOMValue);
		document.getElementById('tblqtyUOM').rows[rowItr].cells[1].innerHTML = parseFloat(parseFloat(parseFloat(stockqty)*parseFloat(conersionRate)).toFixed(5));
	}

}
function invtStatus_OnChange()
{
	document.getElementById('hdnfromstatuschange').value = 'T';
	document.forms[0].submit();
	document.getElementById('loading').style.display = 'block';
}

function validateFormforinventory(ConvertQty,remainingQty,hdnfielduomwithqtyId,hdnItemTypeId,txtBinId,hdnPreferBinId,hdnfldtotaluomqtyenteredId) 
{
	var remainQty=0;

	var uomTbl = document.getElementById('tblUOM');
	var enteredQty =0;
	var selecteduomqtyArr = new Array();
	if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){
		var rowcount = uomTbl.rows.length;

		for(var r=0;r<rowcount;r++){
			var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;if(qty==''){
				document.getElementById('div_error').innerHTML ='Please enter qty';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;
			}
			else {if(isNaN(qty) || parseFloat(qty)<=0){
				document.getElementById('div_error').innerHTML ='Please enter valid qty';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;	
			}}
			var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;
			if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';
			document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].focus();return false;
			}
			var uomqtyStr = qty+'_'+uom;
			selecteduomqtyArr.push(uomqtyStr);
			enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom));

			if(document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value <= 0.000000005 )
			{
				document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();
				return false;
			}
		}

		document.getElementById(hdnfielduomwithqtyId).value=selecteduomqtyArr;
		var scannedqty=parseFloat(enteredQty)/parseFloat(ConvertQty);

	}
	else{enteredQty = document.getElementById('txtqty').value;
	if(enteredQty == ''){
		document.getElementById('div_error').innerHTML ='Please enter qty';
		document.getElementById('txtqty').focus();return false;}
	else if(isNaN(enteredQty) || parseFloat(enteredQty)<=0)	
	{
		document.getElementById('div_error').innerHTML ='Please enter valid qty';
		document.getElementById('txtqty').focus();return false;
	}
	if(document.getElementById('txtqty').value <= 0.000000005 )
	{
		document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';
		document.getElementById('txtqty').focus();
		return false;
	}

	}
	if(enteredQty == ''){
		document.getElementById('div_error').innerHTML ='Please enter qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;}	
	else{
		var scannedqty=enteredQty;
		if(remainingQty != null && remainingQty != '' && remainingQty != 'null' && remainingQty != 'undefined')
		{
			var remainingqty=parseFloat(remainingQty)*parseFloat(ConvertQty);
			if((isNaN(scannedqty) || parseFloat(scannedqty)<=0)  ){
				document.getElementById('div_error').innerHTML ='Please enter valid qty';
				if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
					document.getElementById('txtqty').focus();
				}else{
					var rowcount1 = uomTbl.rows.length;
					var rowInd = parseInt(rowcount1)-1;
					document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
				}
				return false;
			}
			if((parseFloat(scannedqty)>parseFloat(remainingqty))){
				document.getElementById('div_error').innerHTML ='Entered/Scanned qty is greater than available quantity';
				if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
					document.getElementById('txtqty').focus();
				}else{
					var rowcount1 = uomTbl.rows.length;
					var rowInd = parseInt(rowcount1)-1;
					document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
				}

				return false;
			}
		}

		var itemtype=document.getElementById(hdnItemTypeId).value;

		if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){
			var conversionQty=enteredQty;
			if(conversionQty.toString().indexOf('.') > 0){
				document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';
				if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
					document.getElementById('txtqty').focus();
				}else{
					var rowcount1 = uomTbl.rows.length;
					var rowInd = parseInt(rowcount1)-1;
					document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
				}
				return false;
			}
		}
		if(document.getElementById(txtBinId).value == '' && (document.getElementById(hdnPreferBinId).value == '')){
			document.getElementById('div_error').innerHTML ='Please enter/scan bin location';
			document.getElementById(txtBinId).focus();return false;
		}
		else{
			if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){
				document.getElementById(hdnfldtotaluomqtyenteredId).value = enteredQty/ConvertQty;
			}
		}
	}
}
function DisplayBinforinventory(val,ConvertQty,availqty,hdnfielduomwithqtyId,hdnfldtotaluomqtyenteredId,hdnItemTypeId,txtBinId,formId) {
	var reWhiteSpace ='';var selecteduomqtyArr = new Array();var enteredQty =0;
	var uomTbl = document.getElementById('tblUOM');

	if(uomTbl != null && uomTbl != '' && uomTbl != 'null' && uomTbl != 'undefined'){
		var rowcount = uomTbl.rows.length;
		for(var r=0;r<rowcount;r++){
			var qty =document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value;
			if(qty==''){			
				document.getElementById('div_error').innerHTML ='Please enter qty ';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;}
			else {if(isNaN(qty) || parseFloat(qty)<=0){
				document.getElementById('div_error').innerHTML ='Please enter valid qty';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();return false;	
			}}
			var uom =document.getElementById('tblUOM').rows[r].cells[2].childNodes[0].value;
			if(uom==''){document.getElementById('div_error').innerHTML ='Please enter uom';return false;}
			var uomqtyStr = qty+'_'+uom;selecteduomqtyArr.push(uomqtyStr);
			enteredQty = parseFloat(enteredQty)+(parseFloat(qty)*parseFloat(uom));
			if(document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].value <= 0.000000005 )
			{
				document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';
				document.getElementById('tblUOM').rows[r].cells[0].childNodes[0].focus();
				return false;
			}	
		}
		document.getElementById(hdnfielduomwithqtyId).value=selecteduomqtyArr;
		document.getElementById(hdnfldtotaluomqtyenteredId).value = parseFloat(enteredQty)/parseFloat(ConvertQty);qty=enteredQty;}
	else{
		var qty = document.getElementById('txtqty').value;

		reWhiteSpace = qty.indexOf(' ') >= 0;
		if(document.getElementById('txtqty').value <= 0.000000005 )
		{
			document.getElementById('div_error').innerHTML ='Invalid number (must be positive).';
			document.getElementById('txtqty').focus();
			return false;
		}
	}
	var itemtype=document.getElementById(hdnItemTypeId).value;
	if(qty ==''){
		document.getElementById('div_error').innerHTML ='Please enter qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;

	}
	else if(isNaN(qty) || parseFloat(qty)<=0 || (reWhiteSpace == true)){
		document.getElementById('div_error').innerHTML ='Please enter valid qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;
	}
	else if(parseFloat(qty) > (parseFloat(availqty)*parseFloat(ConvertQty))){
		document.getElementById('div_error').innerHTML ='Entered/Scanned qty is greater than available qty';
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').value = ''; }
		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;
			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();
		}
		return false;
	}
	else if(itemtype == 'serializedinventoryitem' || itemtype == 'serializedassemblyitem'){

		//if(conversionQty.toString().indexOf('.') != -1){

		if(uomTbl == null || uomTbl == '' || uomTbl == 'null' || uomTbl == 'undefined'){
			if(parseFloat(document.getElementById('txtqty').value) >= 0.000001)
			{

				var conversionQty=(qty)*(ConvertQty);

				if(conversionQty.toString().indexOf('.') != -1){
					document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';
					return false;
				}
			}
			else
			{
				if(document.getElementById('txtqty').value.toString().indexOf('.') != -1){
					document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';
					return false;
				}
			}
			document.getElementById('txtqty').focus();
		}else{
			var rowcount1 = uomTbl.rows.length;
			var rowInd = parseInt(rowcount1)-1;

			if(parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value) >= 0.000001)
			{

				var conversionQty=parseFloat(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value)*(ConvertQty);
				if(conversionQty.toString().indexOf('.') != -1){
					document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';
					return false;
				}
			}
			else
			{
				if(document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].value.toString().indexOf('.') != -1){
					document.getElementById('div_error').innerHTML ='Decimal qty is not allowed for serial item';
					return false;
				}
			}

			document.getElementById('tblUOM').rows[rowInd].cells[0].childNodes[0].focus();

		}


		//}
	}
	document.getElementById(txtBinId).value=val;
	document.forms[0].submit();
	document.getElementById('loading').style.display = ''; return true;
}


function setDefaultsbyFieldId(objfieldvalues)
{
	var frmElementsLength = document.forms[0].elements.length;
	var fldcnt=1;   
	var fielddata = objfieldvalues.split(',');
	for(var k=0;k<fielddata.length;k++)
	{
		var fieldseparatoridx = fielddata[k].lastIndexOf('$');
		var fieldid = fielddata[k].substring(0,fieldseparatoridx);
		var fieldvalue =  fielddata[k].substring(fieldseparatoridx+1);

		for(var l=0;l<frmElementsLength;l++)
		{
			var type = document.forms[0].elements[l].type;

			if(document.forms[0].elements[l].name.indexOf(fieldid) !== -1) 
			{
				document.forms[0].elements[l].value = fieldvalue;
				break;
			}
		}
	}
}

//This function will be used to set the default values to the page fields based on Composite Bar Code Field mapping.
function setFieldDefaults(objfieldvalues)
{
	var frmElementsLength = document.forms[0].elements.length;

	var fielddataarr = objfieldvalues.split(',');
	for(var k=0;k<fielddataarr.length;k++)
	{
		var fldcnt=0; 
		var individualfielddata = fielddataarr[k].split('$');
		var inputfieldtype = individualfielddata[0];
		var inputfieldposition = individualfielddata[1];
		var fieldvalue = individualfielddata[2];

		if(inputfieldtype=='Text Box')
			inputfieldtype='text';

		if(inputfieldtype=='Drop Down List')
			inputfieldtype='select';

		for(var l=0;l<frmElementsLength;l++)
		{
			var pagefieldtype = document.forms[0].elements[l].type;

			if(pagefieldtype.indexOf(inputfieldtype)!=-1)
			{ 
				fldcnt++;

				if(fldcnt==inputfieldposition)
				{				
					if(pagefieldtype=='text')
					{
						document.forms[0].elements[l].value = fieldvalue;						
						break;
					}
					if(pagefieldtype.indexOf('select')!=-1)
					{
						var seloptions = document.forms[0].elements[l].options;

						for (var m = 0; m < seloptions.length; m++) 
						{
							if (seloptions[m].text == fieldvalue) 
							{
								document.forms[0].elements[l].selectedIndex = m;
								break;
							}
						}
						break;
					}
				}
			} 
		}
	}
}