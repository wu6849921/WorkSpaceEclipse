
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ****************************************************************************/


function GenerateBartenderItemLabel(newRecord)
{
	try
	{
		nlapiLogExecution('Debug', 'GenerateItemLabel', 'GenerateItemLabel');
		var itemId= newRecord.getFieldValue('custrecord_wmsse_sku');
		var itemName=newRecord.getFieldText('custrecord_wmsse_sku');
		var customerPo=newRecord.getFieldValue('name');
		var checkinQty= newRecord.getFieldValue('custrecord_wmsse_act_qty');
		var barcodestring= newRecord.getFieldValue('custrecord_wmsse_compositebarcode_string');
		var fields = ['itemid', 'upccode', 'displayname', 'upccode'];
		var columns = nlapiLookupField('item', itemId, fields);
		var upcnumber = columns.upccode;
		var itemDescription = columns.displayname;
		var location=newRecord.getFieldValue('custrecord_wmsse_wms_location');
		var ExternalLabelRecord = nlapiCreateRecord('customrecord_wmsse_ext_labelprinting');
		ExternalLabelRecord.setFieldValue('name',customerPo);
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_reference1',customerPo);
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_itemdesc', itemDescription);
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_qty',checkinQty);
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_ext_location',location);
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_external_item', itemName);
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_reference5', upcnumber);
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_labeltype', "ITEMLABEL");
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_ext_template', "ITEMLABEL");
		if(!isempty(barcodestring))
			ExternalLabelRecord.setFieldValue('custrecord_wmsse_external_barcode_string', barcodestring);
		
		var tranid = nlapiSubmitRecord(ExternalLabelRecord);
	}
	catch(ex)
	{
		nlapiLogExecution('Debug', 'Exception in GenerateBartenderItemLabel', ex);
	}

}
function GenerateItemLabel(ponumber,itemId,whLocation)
{
	try
	{
		var filteritems = new Array();
		if(itemId!=null && itemId!="")
		{
			filteritems.push(new nlobjSearchFilter('internalid', null,'is',itemId));
		}
		var columnitems = new Array();
		columnitems[0] = new nlobjSearchColumn('description');
		columnitems[1] = new nlobjSearchColumn('itemid');
		var searchresultitem = nlapiSearchRecord('item',null,filteritems,columnitems);
		var labeltype="ITEMLABEL";
		var ItemLabel=GetSELabelTemplate("",labeltype);
		var skuname="";
		var skudesc="";
		var location="";
		if(searchresultitem!=null)
		{
			skudesc=searchresultitem[0].getValue('description');
			skuname=searchresultitem[0].getValue('itemid');
		}



		if(ItemLabel!=null && ItemLabel!="")
		{
			nlapiLogExecution('DEBUG', 'inside function ', 'inside function');

			if((skudesc!=null)&&(skudesc!=""))
			{
				ItemLabel=ItemLabel.replace(/parameter21/,skudesc);
			}
			else
			{
				ItemLabel=ItemLabel.replace(/parameter21/,'');
			}
			if((skuname!=null)&&(skuname!=""))
			{
				ItemLabel=ItemLabel.replace(/parameter25/g,skuname);
			}
			else
			{
				ItemLabel=ItemLabel.replace(/parameter25/g,'');
			}
			var print="F";
			var reprint="F"
				var refno="";
			var printername="";		
			//printername=GetLabelSpecificPrintername(labeltype,whLocation);
			CreateLabelData(ItemLabel,labeltype,refno,print,reprint,"",ponumber,skuname,"",printername,"",whLocation);
		}

	}
	catch(ex)
	{
		nlapiLogExecution('Debug', 'Exception in GenerateItemLabel', ex);
	}
}
function GeneratePalletLabel(ponumber,itemId,itemqty,username,whLocation,barcodestring)
{
	try
	{
		nlapiLogExecution('DEBUG', 'Create Pallet Label ', 'Create Pallet Label');
		nlapiLogExecution('DEBUG', 'whLocation is ', whLocation);

		var recevieddate=DateStamp();
		var labeltype="PALLETLABEL";
		//if barcode is scanned in receiving process,use barcode template
		if(!isempty(barcodestring))
			labeltype="COMPOSITEPALLETLABEL";
		
		var palletlabel=GetSELabelTemplate("",labeltype);
		if(palletlabel!=null && palletlabel!="")
		{
			//Initializing labeltype= "PALLETLABEL" back, becuase this labeltype is updating in Refno field in label printing.
			labeltype="PALLETLABEL";
			nlapiLogExecution('DEBUG', 'insidepalletlabel', 'insidepalletlabel');
			var filteritems = new Array();
			if(itemId!=null && itemId!="")
			{
				filteritems.push(new nlobjSearchFilter('internalid', null,'is',itemId));
			}
			var columnitems = new Array();
			columnitems[0] = new nlobjSearchColumn('description');
			columnitems[1] = new nlobjSearchColumn('itemid');
			var searchresultitem = nlapiSearchRecord('item',null,filteritems,columnitems);
			var skuname="";
			var skudesc="";
			var location="";
			if(searchresultitem!=null)
			{
				skudesc=searchresultitem[0].getValue('description');
				skuname=searchresultitem[0].getValue('itemid');
			}

			var recevieddate=DateStamp();
			if((skudesc!=null)&&(skudesc!=""))
			{
				palletlabel=palletlabel.replace(/parameter21/,skudesc);
			}
			else
			{
				palletlabel=palletlabel.replace(/parameter21/,'');
			}
			if((ponumber!=null)&&(ponumber!=""))
			{
				palletlabel=palletlabel.replace(/parameter22/,ponumber);
			}
			else
			{
				palletlabel=palletlabel.replace(/parameter22/,'');
			}
			if((username!=null)&&(username!=""))
			{
				palletlabel=palletlabel.replace(/parameter23/,username);
			}
			else
			{
				palletlabel=palletlabel.replace(/parameter23/,'');
			}

		if((recevieddate!=null)&&(recevieddate!=""))
		{
			palletlabel=palletlabel.replace(/parameter24/,recevieddate);
		}
		else
		{

			palletlabel=palletlabel.replace(/parameter24/,recevieddate);
		}
		if((skuname!=null)&&(skuname!=""))
		{
			palletlabel=palletlabel.replace(/parameter25/g,skuname);
		}
		else
		{
			palletlabel=palletlabel.replace(/parameter25/g,'');
		}

		if((itemqty!=null)&&(itemqty!=""))
		{
			palletlabel=palletlabel.replace(/parameter26/,itemqty);
		}
		else
		{
			palletlabel=palletlabel.replace(/parameter26/,'');
		}
		
		// if composite barcode scanned in receiving process, need to show the composite barcode in PALLET label
		if(!isempty(barcodestring))
		{

			var barcodestringtext = removepaddingcharfrombarcodestring(barcodestring);			
			if(!isempty(barcodestringtext))
			{

				palletlabel=palletlabel.replace(/parameter27/,barcodestringtext[0]);
				palletlabel=palletlabel.replace(/parameter28/,barcodestringtext[1]);
			}

		}
			
			
			var print="F";
			var reprint="F"
				var refno="";
			var printername="";		
			//printername=GetLabelSpecificPrintername(labeltype,whLocation);
			CreateLabelData(palletlabel,labeltype,refno,print,reprint,"",ponumber,skuname,"",printername,"",whLocation);


		}


	}
	catch(ex)
	{
		nlapiLogExecution('Debug', 'Exception in GeneratePalletLabel', ex);
	}


}
function GenerateZebraUccLabel(vWMSSeOrdNo,containerLpShip,salesorderrecord,whLocation)
{

	nlapiLogExecution('DEBUG', 'CreateZebraUccLabel', 'CreateZebraUccLabel');
	nlapiLogExecution('DEBUG', 'vOrderNo',vWMSSeOrdNo);
	nlapiLogExecution('DEBUG', 'cartonnumber',containerLpShip);


	//var salesorderrecord=nlapiLoadRecord('salesorder', vWMSSeOrdNo);
	var labeltype="UCCLABEL";
	var shiptocompanyid=salesorderrecord.getFieldValue('entity');

	var labeldata=GetSELabelTemplate("",labeltype);
	var location;
	var customername,customerpo;	
	if(labeldata!=null && labeldata!="")
	{
		var uccnumbersearchresults=getUCCNumber(containerLpShip);
		var uccnumber="";

		if(uccnumbersearchresults!=null && uccnumbersearchresults!="")
		{
			uccnumber=uccnumbersearchresults[0].getValue('custrecord_wmsse_uccno');
		}
		var labelcount="";
		nlapiLogExecution('DEBUG', 'uccnumber',uccnumber);
		GenerateZebraLabel(labeltype,labeldata,uccnumber,vWMSSeOrdNo,"",labelcount,salesorderrecord,containerLpShip,whLocation);

	}
}
function GenerateZebraAddressLabel(vWMSSeOrdNo,salesorderrecord,whLocation)
{

	nlapiLogExecution('DEBUG', 'CreateZebraUccLabel', 'CreateZebraUccLabel');
	nlapiLogExecution('DEBUG', 'vOrderNo',vWMSSeOrdNo);
	//var salesorderrecord=nlapiLoadRecord('salesorder', vWMSSeOrdNo);
	var labeltype="ADDRESSLABEL";
	var labeldata=GetSELabelTemplate("",labeltype);
	var location;
	var customername,customerpo;	
	var labelcount="";
	if(labeldata!=null && labeldata!="")
	{
		GenerateZebraLabel(labeltype,labeldata,"",vWMSSeOrdNo,"",labelcount,salesorderrecord,"",whLocation);
	}
}
function GenerateZebraLabel(labeltype,Label,ucc,vWMSSeOrdNo,skuname,labelcount,salesorderrecord,containerLpShip,whLocation)
{

	try
	{
		//shiptocompanyAdress		
		var shiptocity=salesorderrecord.getFieldValue('shipcity');
		var shiptostate=salesorderrecord.getFieldValue('shipstate');
		var shiptocountry=salesorderrecord.getFieldValue('shipcountry');
		var shiptocompany=salesorderrecord.getFieldValue('shipaddressee');
		var shiptozipcode=salesorderrecord.getFieldValue('shipzip');
		var shiptoAddress2=salesorderrecord.getFieldValue('shipaddr2');
		var shiptoAddress1=salesorderrecord.getFieldValue('shipaddr1');
		nlapiLogExecution('ERROR', 'shiptoAddress1',shiptoAddress1);
		var customerpo=salesorderrecord.getFieldValue('otherrefnum');
		var location=salesorderrecord.getFieldValue('location');
		var shiptocompanyid=salesorderrecord.getFieldValue('entity');


		var customerpo=salesorderrecord.getFieldValue('otherrefnum');
		//var location=salesorderrecord.getFieldValue('location');
		var shipcarrier=salesorderrecord.getFieldText('shipmethod');
		var shiptocompanyid=salesorderrecord.getFieldValue('entity');
		location=whLocation;

	nlapiLogExecution('ERROR', 'location', location);
	var record = nlapiLoadRecord('location', location);
	var salesorder=salesorderrecord.getFieldValue('tranid');
	var shipfromaddress1=record.getFieldValue('addr1');
	var shipfromaddress2=record.getFieldValue('addr2');
	var shipfromcity=record.getFieldValue('city');
	var shipfromstate=record.getFieldValue('state');
	var shipfromzipcode =record.getFieldValue('zip');
	var shipfromcompanyname=record.getFieldValue('addressee');
	var shipfromcountry =record.getFieldValue('country');
	//This code not in Dev.Code For Production Dynacraft
	var shipfromaddress3=record.getFieldValue('addr3');

	var shipdate=DateStamp();
	if((shiptoAddress1!=null)&&(shiptoAddress1!=""))
	{
		Label =Label.replace(/parameter01/,shiptoAddress1);
	}
	else
	{
		Label =Label.replace(/parameter01/,'');
	}
	if((shiptoAddress2!=null)&&(shiptoAddress2!=""))
	{
		Label =Label.replace(/parameter02/,shiptoAddress2);
	}
	else
	{
		Label =Label.replace(/parameter02/,'');
	}
	if((shiptocity!=null)&&(shiptocity!=""))
	{
		Label =Label.replace(/parameter03/,shiptocity);
	}
	else
	{
		Label =Label.replace(/parameter03/,'');
	}
	if((shiptostate!=null)&&(shiptostate!=""))
	{
		Label =Label.replace(/parameter04/,shiptostate);
	}
	else
	{
		Label =Label.replace(/parameter04/,'');
	}
	if((shiptocountry!=null)&&(shiptocountry!=""))
	{
		Label =Label.replace(/parameter05/,shiptocountry);
	}
	else
	{
		Label =Label.replace(/parameter05/,'');
	}
	if((shiptozipcode!=null)&&(shiptozipcode!=""))
	{
		Label =Label.replace(/parameter06/g,shiptozipcode);
	}
	else
	{  
		Label =Label.replace(/parameter06/g,'');
	}


	if((shiptocompany!=null)&&(shiptocompany!=""))
	{
		Label =Label.replace(/parameter07/g,shiptocompany);
	}
	else
	{
		Label =Label.replace(/parameter07/g,'');
	}


	if((shipfromaddress1!=null)&&(shipfromaddress1!=""))
	{
		Label =Label.replace(/parameter08/,shipfromaddress1);
	}
	else
	{
		Label =Label.replace(/parameter08/,'');
	}
	if((shipfromaddress2!=null)&&(shipfromaddress2!=""))
	{
		Label =Label.replace(/parameter09/,shipfromaddress2);
	}
	else
	{
		Label =Label.replace(/parameter09/,'');
	}
	if((shipfromcity!=null) &&(shipfromcity!=""))
	{
		Label =Label.replace(/parameter10/,shipfromcity);
	}
	else
	{
		Label =Label.replace(/parameter10/,'');
	}
	if((shipfromstate!=null)&&(shipfromstate!=""))
	{
		Label =Label.replace(/parameter11/,shipfromstate);
	}
	else
	{
		Label =Label.replace(/parameter11/,'');

	}
	if((shipfromcountry!=null) && (shipfromcountry!=""))
	{
		Label =Label.replace(/parameter12/,shipfromcountry);
	}
	else
	{
		Label =Label.replace(/parameter12/,'');
	}
	if((shipfromzipcode!=null) && (shipfromzipcode!=""))
	{
		Label =Label.replace(/parameter13/,shipfromzipcode);
	}
	else
	{
		Label =Label.replace(/parameter13/,'');
	}
	if((customerpo!=null)&&(customerpo!=""))
	{
		Label =Label.replace(/parameter14/g,customerpo);
	}
	else
	{
		Label =Label.replace(/parameter14/g,'');
	}


	if((shipcarrier!=null)&&(shipcarrier!=""))
	{
		Label =Label.replace(/parameter15/,shipcarrier);
	}
	else
	{
		Label =Label.replace(/parameter15/,'');
	}


	if((salesorder!=null)&&(salesorder!=""))
	{
		Label =Label.replace(/parameter16/g,salesorder);
	}
	else
	{
		Label =Label.replace(/parameter16/g,'');
	}

		if((skuname!=null)&&(skuname!=""))
		{
			Label =Label.replace(/parameter17/,skuname);
		}
		else
		{
			Label =Label.replace(/parameter17/,'');
		}
		if((ucc!=null)&&(ucc!=""))
		{
			Label =Label.replace(/parameter18/g,ucc);
		}
		else
		{
			Label =Label.replace(/parameter18/g,'');
		}
		if((shipfromcompanyname!=null)&&(shipfromcompanyname!=""))
		{
			Label =Label.replace(/parameter19/,shipfromcompanyname);
		}
		else
		{
			Label =Label.replace(/parameter19/,'');
		}
		if((shipdate!=null)&&(shipdate!=""))
		{
			Label =Label.replace(/parameter20/,shipdate);
		}
		else
		{
			Label =Label.replace(/parameter20/,'');
		}

		var print="F";
		var reprint="F"
			var refno="";
		var printername="";	
		//printername=GetLabelSpecificPrintername(labeltype,whLocation);
		CreateLabelData(Label,labeltype,refno,print,reprint,shiptocompanyid,salesorder,skuname,labelcount,printername,containerLpShip,whLocation);
	}
	catch(ex)
	{
		nlapiLogExecution('Debug', 'Exception in GenerateZebraLabel', ex);
	}
}


function CreateLabelData(labeldata,labeltype,refno,print,reprint,company,salesorder,skuname,labelcount,printername,containerLpShip,location)
{
	try
	{
		nlapiLogExecution('ERROR','CreateLabelData','CreateLabelData');	
		var labelrecord = nlapiCreateRecord('customrecord_wmsse_labelprinting'); 
		labelrecord.setFieldValue('name', salesorder); 
		labelrecord.setFieldValue('custrecord_wmsse_label_data',labeldata);  
		labelrecord.setFieldValue('custrecord_wmsse_label_refno',labeltype);     

	labelrecord.setFieldValue('custrecord_wmsse_label_type',"ZEBRALABEL");                                                                                                                                                                     
	labelrecord.setFieldValue('custrecord_wmse_label_print', print);
	labelrecord.setFieldValue('custrecord_wmsse_label_reprint', reprint);
	labelrecord.setFieldValue('custrecord_wmsse_label_lp', containerLpShip);

		labelrecord.setFieldValue('custrecord_wmsse_label_printername', printername);
		labelrecord.setFieldValue('custrecord_wmsse_label_location', location);

		var tranid = nlapiSubmitRecord(labelrecord);
		nlapiLogExecution('ERROR','recordid',tranid);
	}
	catch(ex)
	{
		nlapiLogExecution('Debug', 'Exception in CreateLabelData', ex);
	}
}
function GetSELabelTemplate(shiptocompanyid,labeltype)
{
	var filtertempalte = new Array();

	nlapiLogExecution('ERROR', 'GetLabelTemplate','GetLabelTemplate');
	nlapiLogExecution('ERROR', 'shiptocompanyid', shiptocompanyid);
	if((shiptocompanyid!=null)&&(shiptocompanyid!=""))
	{
		filtertempalte.push(new nlobjSearchFilter('custrecord_wmsse_labeltemplate_name',null,'anyof',shiptocompanyid));
	}
	filtertempalte.push(new nlobjSearchFilter('name',null,'is',labeltype)); 
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_labeltemplate_data');
	var searchtemplate= nlapiSearchRecord('customrecord_wmsse_label_template',null,filtertempalte,columns);
	var Label="";
	if((searchtemplate !=null)&&(searchtemplate!=""))
	{

		Label=searchtemplate[0].getValue('custrecord_wmsse_labeltemplate_data');
	}	
	return Label;
}


function GenerateUCCLabel(vWMSSeOrdNo,containerLpShip)
{

	try
	{
		nlapiLogExecution('DEBUG', 'CreateExtLabelData', 'CreateExtLabelData');
		nlapiLogExecution('DEBUG', 'vOrderNo',vWMSSeOrdNo);
		nlapiLogExecution('DEBUG', 'cartonnumber',containerLpShip);


	var salesorderrecords=nlapiLoadRecord('salesorder', vWMSSeOrdNo);
	var location;
	var customername,customerpo;	
	var shiptoAddressee,shiptoAddress1,shiptoAddress2,shiptocity,shiptostate,shiptocountry,shiptocompany,shiptozipcode;
	customerpo=salesorderrecords.getFieldValue('otherrefnum'); 

	shiptoAddressee=salesorderrecords.getFieldValue('shipaddressee');
	shiptoAddress1=salesorderrecords.getFieldValue('shipaddr1');
	shiptoAddress2=salesorderrecords.getFieldValue('shipaddr2');

	shiptocity=salesorderrecords.getFieldValue('shipcity');
	shiptostate=salesorderrecords.getFieldValue('shipstate');
	shiptocountry=salesorderrecords.getFieldValue('shipcountry');
	shiptocompany=salesorderrecords.getFieldValue('entity');
	shiptozipcode=salesorderrecords.getFieldValue('shipzip');
	location=salesorderrecords.getFieldValue('location');


	var shipfromcity,shipfromcountry,shipfromzipcode,shipfromaddress,shipfromphone,shipfromstate;
	nlapiLogExecution('DEBUG', 'location',location);


	if(location !="" && location !=null)
	{
		nlapiLogExecution('ERROR', 'location', location);

		var record = nlapiLoadRecord('location', location);
		nlapiLogExecution('ERROR', 'location', location);
		shipfromaddress=record.getFieldValue('addr1');
		var addr2=record.getFieldValue('addr2');
		shipfromaddress=shipfromaddress+" " + addr2;
		shipfromcity=record.getFieldValue('city');
		shipfromstate=record.getFieldValue('state');
		shipfromzipcode =record.getFieldValue('zip');
		companyname=record.getFieldValue('addressee');
		shipfromphone=record.getFieldValue('addrphone');
		shipfromcountry =record.getFieldValue('country');


	}



	var uccnumber=getUCCNumber(containerLpShip);

	var ucc=uccnumber[0].getValue('custrecord_wmsse_uccno');


		var ExternalLabelRecord = nlapiCreateRecord('customrecord_wmsse_ext_labelprinting');
		ExternalLabelRecord.setFieldValue('name',containerLpShip); 
		//shipFrom Address
		nlapiLogExecution('DEBUG', 'vSalesOrderId', vWMSSeOrdNo);
		//ExternalLabelRecord.setFieldValue('custrecord_label_shipfromaddressee',sOrderArray["shipfromcompanyname"]); 
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_addr1',shipfromaddress); 
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_city',shipfromcity); 
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_state',shipfromstate); 
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_zip',shipfromzipcode); 
		//ShipToAddress
		//ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_shipaddressee',shipaddressee); 
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_shipaddr1',shiptoAddress1); 
		//ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_addr2',shiptoAddress2); 
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_shipcity',shiptocity); 
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_shipstate',shiptostate); 
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_shipcountry',shiptocountry); 
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_shipzip',shiptozipcode); 
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_custom1',customerpo);
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_label_licenseplatenum',ucc);
		ExternalLabelRecord.setFieldValue('custrecord_wmsse_ext_location',location);
		
		
		var tranid = nlapiSubmitRecord(ExternalLabelRecord);
		nlapiLogExecution('DEBUG', 'internalid', tranid);

	}
	catch(ex)
	{
		nlapiLogExecution('Debug', 'Exception in GenerateExtUCCLabel', ex);
	}
}
function getUCCNumber(containerLpShip)
{
	var filters=new Array();
	var columns=new Array();

	filters[0] = new nlobjSearchFilter('custrecord_wmsse_contlp', null, 'is', containerLpShip);
	columns[0] = new nlobjSearchColumn('custrecord_wmsse_uccno');
	var searchResults = nlapiSearchRecord('customrecord_wmsse_ucc_master', null, filters,columns);
	return searchResults;
}