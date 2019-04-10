function BeforeLoad(type) {
	if (type == 'edit') {
		// UpdateEmail();
	}

	if (type == 'create') {
		try {
			AutoValue();
		} catch (e) {
		}

	}

}

function BeforeSubmit(type) {
	if (type == 'create') {
		Createcaseno();
	}

}

function UpdateEmail() {
	nlapiLogExecution("DEBUG", '1');
	var d = "";
	var h = nlapiGetFieldValue("company");
	/*
	 * if(h==""||nlapiGetRecordId()!="") {return true}
	 */
	nlapiLogExecution("DEBUG", 'h', h);
	var Filtes = new Array();
	Filtes[0] = new nlobjSearchFilter('internalid', null, 'anyof', h);
	Filtes[1] = new nlobjSearchFilter('isjob', null, 'is', 'T');

	var Results = new Array();
	Results[0] = new nlobjSearchColumn('internalid', 'parentcustomer');

	var SearchResult = nlapiSearchRecord('customer', null, Filtes, Results);
	if (SearchResult != '' && SearchResult != null) {
		h = SearchResult[0].getValue('internalid', 'parentcustomer');
		var case_message_language = nlapiLookupField('customer', h,
				'custentity_case_message_language_cnen', true);
		// nlapiSetFieldValue("custevent13",case_message_language);
		nlapiSubmitField('supportcase', nlapiGetRecordId(), 'custevent13',
				case_message_language);
	}

	var TempleteType = nlapiGetFieldValue("custevent_type");
	var ContactRole = 9;
	if (TempleteType == 2) {
		ContactRole = 8;
	}
	// kyle 2011-7-12 ^_^'' hold on kyle, I believe in you
	nlapiLogExecution("DEBUG", '3');

	var e = new Array();
	e[0] = new nlobjSearchFilter("contactrole", null, "anyof", ContactRole, 2);
	e[1] = new nlobjSearchFilter("internalid", "customer", "anyof", h);
	e[2] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
	var g = new Array();
	g[0] = new nlobjSearchColumn("email");

	var b = nlapiSearchRecord("contact", null, e, g);
	nlapiLogExecution("DEBUG", '4');
	for (var a = 0; (b != null) && (a < b.length); a++) {
		d += b[a].getValue("email") + ","
		nlapiLogExecution("DEBUG", '5');

	}
	if (d != null && d != "" && d.lastIndexOf(",") == d.length - 1) {
		d = d.substr(0, d.length - 1)
		nlapiLogExecution("DEBUG", '6');
	}

	nlapiSetFieldValue("email", d);
	nlapiLogExecution("DEBUG", 'email', d);

	nlapiSubmitField('supportcase', nlapiGetRecordId(), 'email', d);
	nlapiLogExecution("DEBUG", '7');

	return true;
}

function Createcaseno() {
	var j = nlapiGetFieldValue("custevent_type");

	var e = "";
	var a = new Array();
	a[0] = new nlobjSearchFilter("isinactive", null, "is", "F");
	a[1] = new nlobjSearchFilter("custevent_type", null, "anyof", j);
	var b = new Array();
	b[0] = new nlobjSearchColumn("internalid", null, "max");
	var c = nlapiSearchRecord("supportcase", null, a, b);
	var h = nlapiLookupField("supportcase", c[0].getValue("internalid", null,
			"max"), "casenumber");
	var k = "CASE";
	if (j == 2) {
		k = "RPM"
	}
	e = h.substr(k.length);
	e = parseFloat(e) + 1;
	var f = "";
	var g = String(e).length;
	for (var d = 0; d < (6 - g); d++) {
		f = f + String(0)
	}
	nlapiSetFieldValue("casenumber", k + String(f) + String(e));
	return true;

}

function AutoValue() {
	nlapiSetFieldText('emailemployees', 'Support ICD');
	var a = nlapiGetFieldValue("custevent_type");
	if (a != "") {
		nlapiSetFieldValue("casenumber", "number");
		// return true;
	}

	// 201205 kyle to add auto system
	var h = nlapiGetFieldValue("company");
	var Filtes = new Array();
	Filtes[0] = new nlobjSearchFilter('internalid', null, 'anyof', h);
	Filtes[1] = new nlobjSearchFilter('isjob', null, 'is', 'T');
	var Results = new Array();
	Results[0] = new nlobjSearchColumn('internalid', 'parentcustomer');

	var SearchResult = nlapiSearchRecord('customer', null, Filtes, Results);
	if (SearchResult != '' && SearchResult != null) {
		h = SearchResult[0].getValue('internalid', 'parentcustomer');
	}
	var CompanyNameShorted = nlapiLookupField('customer', h,
			'custentity_companynameshortened');
	var clientRec = nlapiLoadRecord('customer', h);
	var MaintenanceStatus = clientRec.getFieldText('custentity29');

	var ProductWarrantyStatus = nlapiLookupField('customer', h,
			'custentity_productwarranty');

	nlapiSetFieldValue('custevent_companynameshortened', CompanyNameShorted);
	nlapiSetFieldValue('custevent1', MaintenanceStatus);
	nlapiSetFieldValue('custevent3', ProductWarrantyStatus);
}