function clientbtn_newrpm() {
	window
			.open("https://system.na2.netsuite.com/app/crm/support/supportcase.nl?cf=54&default="
					+ nlapiGetRecordId());
	return true
}
function client_befloadsubtab_rpm(d, c) {
	var f = nlapiGetContext();
	var r = f.getUser();
	var s = f.getRole();
	if ((f.getExecutionContext() == "userinterface")
			&& (d == "edit" || d == "view")) {
		var h = nlapiGetFieldValue("entityid");
		var g = new Array();
		g[0] = new nlobjSearchFilter('custevent_type', null, 'is', 2);
		g[1] = new nlobjSearchFilter('company', null, 'is', h);
		g[2] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
		var v = new Array();
		v[0] = new nlobjSearchColumn('casenumber');
		v[1] = new nlobjSearchColumn('title');
		v[2] = new nlobjSearchColumn('company');
		v[3] = new nlobjSearchColumn('custevent_duedate');
		v[4] = new nlobjSearchColumn('assigned');
		v[5] = new nlobjSearchColumn('status');
		v[6] = new nlobjSearchColumn('custevent_rpmimplementationdate');
		v[7] = new nlobjSearchColumn('custevent_rpmonsitetime');
		v[8] = new nlobjSearchColumn('custevent4');
		v[9] = new nlobjSearchColumn('custevent_rpmengineers1');
		v[10] = new nlobjSearchColumn('custevent_rpmengineers2');
		v[11] = new nlobjSearchColumn('custevent_rpmengineers3');
		var m = nlapiSearchRecord('supportcase', null, g, v);
		var o = c.addSubList('custpage_rpmsublist', 'list', 'RPM');

		// c.insertSubList(o,'timeitem');
		c.insertSubList(o, 'cases');
		c
				.addButton(
						"custpage_mainbtnname",
						"New RPM",
						"window.open('https://system.na2.netsuite.com/app/crm/support/supportcase.nl?cf=54&default="
								+ nlapiGetRecordId() + "');");
		var e = o
				.addButton(
						"custpage_btnname",
						"New RPM",
						"window.open('https://system.na2.netsuite.com/app/crm/support/supportcase.nl?cf=54&default="
								+ nlapiGetRecordId() + "');");
		var b = o.addField("casenumber", "text", "RPM Number");
		var a = o.addField("title", "text", "Subject");
		var z = o.addField("company_display", "text", "Company");
		var y = o.addField("custevent_duedate", "date", "Due date");
		var x = o.addField("assigned_display", "text", "Assigned To");
		var w = o.addField("status_display", "text", "Status");
		var u = o.addField("custevent_rpmimplementationdate", "date",
				"RPM Implementation Date");
		var t = o.addField("custevent_rpmonsitetime", "text", "Onsite Time");
		var q = o.addField("custevent4", "text", "Memo");
		var l = o.addField("custevent_rpmengineers1_display", "text",
				"Engineers1");
		var k = o.addField("custevent_rpmengineers2_display", "text",
				"Engineers2");
		var j = o.addField("custevent_rpmengineers3_display", "text",
				"Engineers3");
		nlapiLogExecution("DEBUG", "debug message", "pasclient " + h
				+ "  results " + m + "  rpmSublist " + o);
		try {
			if ((m != null) && (m.length > 0)) {
				o.setLineItemValues(m);
				for (var n = 1; n <= m.length; n++) {
					o.setLineItemValue("casenumber", n, "<a href='"
							+ nlapiResolveURL("RECORD", "supportcase", m[n - 1]
									.getId()) + "' target='_blank'>"
							+ m[n - 1].getValue("casenumber") + "</a>")
				}
			}
		} catch (p) {
			if (p instanceof nlobjError) {
				nlapiLogExecution("DEBUG", "error", " " + p.getDetails())
			} else {
				nlapiLogExecution("DEBUG", "error", p)
			}
		}

	}
	return true

}

function case_update_sch() {
	var a = new Date();
	var d = new Array();
	d[0] = new nlobjSearchFilter("custevent_type", null, "is", 2);
	d[1] = new nlobjSearchFilter("status", null, "anyof", [ "7", "6" ]);
	d[2] = new nlobjSearchFilter("isinactive", null, "is", "F");
	var e = new Array();
	e[0] = new nlobjSearchColumn("title");
	e[1] = new nlobjSearchColumn("casenumber");
	e[2] = new nlobjSearchColumn("status");
	e[3] = new nlobjSearchColumn("priority");
	e[4] = new nlobjSearchColumn("assigned");
	e[5] = new nlobjSearchColumn("custevent_duedate");
	var c = nlapiSearchRecord("supportcase", null, d, e);
	if (c == null || c == "") {
		return true
	}
	for (var b = 0; b < c.length; b++) {
		if (a > nlapiStringToDate(c[b].getValue("custevent_duedate"))) {
			nlapiSubmitField("supportcase", c[b].getId(), "status", "3");
			nlapiLogExecution("DEBUG", "success message", "supportcase "
					+ c[b].getId() + " status to 3")
		}
	}
	return true
}

function gettextinterval(b) {
	var d = Math.floor(b / 24);
	b -= d * 24;
	var a = Math.floor(b);
	b -= a;
	var c = (b * 60);
	c = c.toFixed(0);
	if (d == 0) {
		if (a == 0) {
			return c + " min "
		} else {
			return a + " hrs " + c + " min "
		}
	} else {
		if (a == 0) {
			if (c == 0) {
				return d + " days "
			} else {
				return d + " days " + a + " hrs " + c + " min "
			}
		} else {
			return d + " days " + a + " hrs " + c + " min "
		}
	}
}

function case_calc_c(type) {
	try {
		if (nlapiGetFieldValue("custevent_type") != "1") {
			return true
		}
		var p = null;
		var j = "";
		var t = nlapiGetFieldValue("startdate");
		var i = nlapiGetFieldValue("starttime");
		var n = nlapiStringToDate(t + " " + i);
		try {
			if (isNaN(n)) {
				n = new Date(
						NLDate_parseString(nlapiGetFieldValue("startdate"))
								.getFullYear(), NLDate_parseString(
								nlapiGetFieldValue("startdate")).getMonth(),
						NLDate_parseString(nlapiGetFieldValue("startdate"))
								.getDate(), nlapiStringToDate(
								nlapiGetFieldValue("starttime")).getHours(),
						nlapiStringToDate(nlapiGetFieldValue("starttime"))
								.getMinutes())
			}
		} catch (s) {
		}
		if (nlapiGetRecordId() == "" || nlapiGetRecordId() == null) {
			nlapiSetFieldValue("custevent_firstcopyemployee",
					nlapiGetFieldValue("emailemployees"));

		}
		var m = new Array();
		m[0] = new nlobjSearchFilter("internalid", "case", "anyof",
				nlapiGetRecordId());
		var v = new Array();
		v[0] = new nlobjSearchColumn("internalid", null, "min");
		v[1] = new nlobjSearchColumn("custevent_arrivaldate", null, "min");
		v[2] = new nlobjSearchColumn("custevent_arrivaltime", null, "min");
		v[3] = new nlobjSearchColumn("createddate", null, "min");
		var q = nlapiSearchRecord("calendarevent", null, m, v);
		var d = true;
		if (q != null && q[0].getValue("internalid", null, "min") != "") {
			var g = "";
			var l = nlapiLoadRecord("calendarevent", q[0].getValue(
					"internalid", null, "min"));
			g = l.getFieldValue("custevent_arrivaldate");
			var r = l.getFieldValue("custevent_arrivaltime");
			if (g != "" && g != null) {
				var u = g + " " + r;
				var e = nlapiStringToDate(u);
				if (e != "" && e != null && isNaN(e) == false) {
					if (e.getTime() < n.getTime()) {
						p = (n.getTime() - e.getTime()) / (1000 * 60 * 60);
						d = false
					} else {
						p = (e.getTime() - n.getTime()) / (1000 * 60 * 60)
					}
				}
			}
		}
		if (isNaN(p) == false && p != null) {
			if (d == false) {
				nlapiSetFieldValue("custevent_caseresponsetime", "-"
						+ gettextinterval(p))
			} else {
				nlapiSetFieldValue("custevent_caseresponsetime",
						gettextinterval(p))
			}
		} else {
			nlapiSetFieldValue("custevent_caseresponsetime", "")
		}

		var m = new Array();
		m[0] = new nlobjSearchFilter("internalid", "case", "anyof",
				nlapiGetRecordId());
		var v = new Array();
		v[0] = new nlobjSearchColumn("internalid", null, "max");
		v[1] = new nlobjSearchColumn("custevent_deptdate", null, "max");
		v[2] = new nlobjSearchColumn("custevent_depttime", null, "max");
		v[3] = new nlobjSearchColumn("createddate", null, "max");
		var q = nlapiSearchRecord("calendarevent", null, m, v);
		if (q != null && q[0].getValue("internalid", null, "max") != "") {
			var l = nlapiLoadRecord("calendarevent", q[0].getValue(
					"internalid", null, "max"));
			var k = l.getFieldValue("createddate");
			if (k != "" && k != null) {
				var w = nlapiStringToDate(k);
				if (isNaN(w)) {
					lastevent_newdate = new Date(k);
					w = new Date(lastevent_newdate.getFullYear(),
							lastevent_newdate.getDate() - 1, lastevent_newdate
									.getMonth() + 1, lastevent_newdate
									.getHours(), lastevent_newdate.getMinutes())
				}
				j = (w.getTime() - n.getTime()) / (1000 * 60 * 60)
			}
		}
		if (j != "" && j != null && isNaN(j) == false) {
			var f = j / 24;
			f = Math.round(f * Math.pow(10, 3)) / Math.pow(10, 3);
			nlapiSetFieldValue("custevent_casedurationtime", f)
		} else {
			nlapiSetFieldValue("custevent_casedurationtime", "")
		}

		var m = new Array();
		m[0] = new nlobjSearchFilter("internalid", "case", "anyof",
				nlapiGetRecordId());
		var v = new Array();
		v[0] = new nlobjSearchColumn("internalid", null, "max");
		v[1] = new nlobjSearchColumn("custevent_deptdate", null, "max");
		v[2] = new nlobjSearchColumn("custevent_depttime", null, "max");
		v[3] = new nlobjSearchColumn("createddate", null, "max");
		var q = nlapiSearchRecord("calendarevent", null, m, v);
		var h;
		if (q != null && q[0].getValue("internalid", null, "max") != "") {
			var l = nlapiLoadRecord("calendarevent", q[0].getValue(
					"internalid", null, "max"));
			var c = l.getFieldValue("custevent_deptdate");
			var o = l.getFieldValue("custevent_depttime");
			if (c != "" && c != null) {
				var u = c + " " + o;
				var b = nlapiStringToDate(u);
				h = (b - n) / (1000 * 60 * 60)
			}
		}
		if (h != null && h != "") {
			nlapiSetFieldValue("custevent12", gettextinterval(h.toFixed(4)))
		} else {
			nlapiSetFieldValue("custevent12", "")
		}
	} catch (s) {
		nlapiLogExecution('debug', 'error', s.getDetails());
		if (s instanceof nlobjError) {
			// alert(s.getDetails())
			nlapiLogExecution('debug', 'error', s.getDetails());
		} else {
			// alert(s)
			nlapiLogExecution('debug', 'error', s);
		}
		return true
	}
	return true
}

function case_init_c(type) {
	nlapiLogExecution('debug', '1');
	var d = "";
	var h = nlapiGetFieldValue("company");
	/*
	 * try { var f = document.createElement("script"); f.src =
	 * "https://system.netsuite.com/core/media/media.nl?id=271&c=TSTDRV535623&h=c6fbb5b9d1c73f47abed&_xt=.txt";
	 * document.getElementById("div__body").appendChild(f) } catch (c) { }
	 */
	if (h == "") {
		return true
	}
	// alert(h);
	// kyle 2011-10-27 ^_^''' hold on, mangtikiya
	var Filtes = new Array();
	Filtes[0] = new nlobjSearchFilter('internalid', null, 'anyof', h);
	// Filtes[1] = new nlobjSearchFilter('isjob', null, 'is', 'T'); //klaus try

	var Results = new Array();
	Results[0] = new nlobjSearchColumn('internalid', 'parentcustomer');
	nlapiLogExecution('debug', '2');
	var SearchResult = nlapiSearchRecord('customer', null, Filtes, Results); // klaus
																				// customer
																				// =>
																				// job
	/*
	 * if (SearchResult != '' && SearchResult != null) { h =
	 * SearchResult[0].getValue('internalid', 'parentcustomer'); //alert(h); var
	 * case_message_language = nlapiLookupField('customer', h,
	 * 'custentity_case_message_language_cnen', true);
	 * nlapiSetFieldValue("custevent13", case_message_language); }
	 */

	// kyle 2011-10-27 ^_^''' to handle the case from project error

	// kyle 2011-7-12 ^_^'' hold on kyle, I believe in you
	var TempleteType = nlapiGetFieldValue("custevent_type");
	var ContactRole = 9;
	if (TempleteType == 2) {
		ContactRole = 8;
	}
	// kyle 2011-7-12 ^_^'' hold on kyle, I believe in you

	nlapiLogExecution('debug', '3');
	var jobId = nlapiGetFieldValue('company'); // klaus 1811
	var clientId = nlapiLookupField('job', jobId, 'customer'); // klaus 1811
	if (jobId != '' && jobId != null && clientId != '' && clientId != null) {
		var e = new Array();
		e[0] = new nlobjSearchFilter("contactrole", null, "anyof", ContactRole,
				2);
		e[1] = new nlobjSearchFilter("internalid", "customer", "anyof",
				clientId);
		e[2] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
		var g = new Array();
		g[0] = new nlobjSearchColumn("email");

		var b = nlapiSearchRecord("contact", null, e, g);
		for (var a = 0; (b != null) && (a < b.length); a++) {
			d += b[a].getValue("email") + ","

		}
		if (d != null && d != "" && d.lastIndexOf(",") == d.length - 1) {
			d = d.substr(0, d.length - 1)
		}
		if (type == 'create') {
			nlapiSetFieldValue("email", d);
		}
	}
	return true
}

function case_fieldchange_c(k, a) {
	if (a == "company" || a == "contact") {
		var l = "";
		var h = nlapiGetFieldValue("company");
		if (h == null || h == "") {
			return true
		}
		var b = new Array();
		b[0] = new nlobjSearchFilter("contactrole", null, "is", 2);
		var j = nlapiLookupField("customer", h, "companyname");
		if (j == null || j == "") {
			return true
		}
		b[1] = new nlobjSearchFilter("internalid", "customer", "anyof", h);
		var c = new Array();
		c[0] = new nlobjSearchColumn("email");
		var f = nlapiSearchRecord("contact", null, b, c);
		for (var e = 0; (f != null) && (e < f.length); e++) {
			l += f[e].getValue("email") + ","
		}
		if (l != null && l != "" && l.lastIndexOf(",") == l.length - 1) {
			l = l.substr(0, l.length - 1)
		}
		nlapiSetFieldValue("email", l)
	}
	if (a == "custevent_casereprece") {
		validate_field(document.getElementById("custevent_casereprece"),
				"emails", true, false)
	}

	var values = new Array()
	values[0] = nlapiGetFieldValue("emailemployees");
	// values[2] = '90843';
	if (a == "assigned") {

		values[1] = nlapiGetFieldValue("assigned");

		// var g=nlapiGetFieldValue("assigned");
		// var d=nlapiLookupField("employee",g,"entityid");
		// nlapiSetFieldValue("emailemployees_display",d)
		nlapiSetFieldValues("emailemployees", values);
	}
	return true
}

function case_semail_s(c, a) {
	try {
		if (c == "create") {
			if (nlapiGetFieldValue("custevent_type") != "1") {
				return true
			}
			var d = nlapiGetFieldValue("custevent_casereprece");
			var e = nlapiGetFieldValue("email");
			var k = nlapiGetFieldValue("company");
			var q = nlapiGetFieldValue("assigned");
			var v = nlapiGetFieldValue("emailemployees");
			var n = "";
			var l = new Array();
			if (d != "" && d != null) {
				if (d.indexOf(",") == -1) {
					n += d
				} else {
					var f = d.split(",");
					n += f[0];
					for (var r = 1; r < f.length; r++) {
						l[l.length] = f[r]
					}
				}
			}
			if (q != "" && q != null) {
				l[l.length] = nlapiLookupField("employee", q, "email");
				if (l[l.length] == null || l[l.length] == "") {
					var h = new Array();
					h[0] = new nlobjSearchFilter("group", null, "anyof", q);
					var u = new Array();
					u[0] = new nlobjSearchColumn("email");
					var p = nlapiSearchRecord("employee", null, h, u);
					for (var s = 0; (p != null) && (s < p.length); s++) {
						l[l.length] = p[s].getValue("email")
					}
				}
			}
			if (v != "" && v != null) {
				var g = v.split("");
				if (g != null) {
					for (var r = 0; r < g.length; r++) {
						l[l.length] = nlapiLookupField("employee", g[r],
								"email")
					}
				}
			}
			var caseId = nlapiGetRecordId();
			nlapiLogExecution('debug', 'caseId', caseId);
			var emailMerge = nlapiCreateEmailMerger('42');
			emailMerge.setSupportCase(caseId);
			var mailRec = emailMerge.merge();
			var emailBody = mailRec.getBody();
			var subject = mailRec.getSubject();
			nlapiLogExecution('debug', 'subject', subject);
			// var o = nlapiMergeRecord("42", "supportcase",
			// nlapiGetRecordId());
			// var m = o.getValue();
			var b = "Case # "
					+ nlapiLookupField("supportcase", nlapiGetRecordId(),
							"casenumber") + " Created: "
					+ nlapiGetFieldValue("title");
			if (n == "") {
				n = l[0]
			}
			if (n == "") {
				return true
			}
			if (nlapiGetFieldValue("internalonly") == "T") {
				n = l[0]
			}
			nlapiSendEmail(1166, n, b, emailBody, l, null, null);
			// nlapiSendEmail(1166, n, b, m, l, null, null);
			// nlapiLogExecution("DEBUG","case mail,"case
			// id"+nlapiGetRecordId()+"re:"+n+",emailtitle:"+b+",cc:"+l)
		}
	} catch (t) {
		if (t instanceof nlobjError) {// nlapiLogExecution("DEBUG","case
										// mail,"case
										// id"+nlapiGetRecordId()+"re:"+n+",emailtitle:"+b+",cc:"+l+";"+t.getDetails())
		} else {// nlapiLogExecution("DEBUG","case mail�,"case
				// id"+nlapiGetRecordId()+"re:"+n+",emailtitle:"+b+",cc:"+l+";"+t)
		}
		return true
	}
	return true
}

function event_befsubmitsemail_s(c, a) {
	try {
		if (c == "create" && nlapiGetFieldValue("supportcase") != ""
				&& nlapiGetFieldValue("supportcase") != null) {
			var u = new Array();
			u[0] = "email";
			u[1] = "assigned";
			// kyle20120411 remove people to cc
			// u[2]="emailemployees";
			var b = nlapiLoadRecord("supportcase",
					nlapiGetFieldValue("supportcase"));
			var n = "";
			var h = "";
			var z = b.getFieldValue("startdate");
			var g = b.getFieldValue("starttime");
			var l = nlapiStringToDate(z + " " + g);
			var e = "";
			e = nlapiGetFieldValue("custevent_deptdate");
			var w = nlapiGetFieldValue("custevent_depttime");
			var i = nlapiGetFieldValue("createddate");
			if (i != "" && i != null) {
				var A = nlapiStringToDate(i);
				if (isNaN(A)) {
					A = Date(i);
					A = new Date(A)
				}
				h = (A - l) / (1000 * 60 * 60)
			}
			if (h != "" && h != null && isNaN(h) == false) {
				b.setFieldValue("custevent_casedurationtime", gettextinterval(h
						.toFixed(2)))
			}
			if (b.getFieldValue("custevent_type") != "1") {
				return true
			}
			var v = "";
			var r = new Array();
			var d = b.getFieldValue("custevent_casereprece");
			if (d != null && d != "") {
				v += d
			}
			var f = b.getFieldValue("email");
			var t = nlapiGetFieldValue("custevent_emailbody1");
			var q = nlapiGetFieldValue("custevent_emailbody2");
			var o = nlapiGetFieldValue("custevent_emailbody3");
			var m = nlapiGetFieldValue("custevent_emailbody4");
			var k = nlapiGetFieldValue("custevent_emailbody5");
			var p = nlapiGetFieldValue("custevent_signature");
			var y = '<font size="2">' + t + "<br><br>" + q + "<br><br>" + o
					+ "<br><br>" + m + "<br><br>" + k + "<br><br>" + p
					+ "</font>";
			var j = b.getFieldValues("custevent_firstcopyemployee");
			if (j != "" && j != null) {
				b.setFieldValues("emailemployees", j)
			}
			if (nlapiGetFieldValue("custevent_internalonly") == "T") {
				b.setFieldValue("internalonly", "T")
			} else {
				b.setFieldValue("emailform", "T")
			}
			b.setFieldValue("outgoingmessage", y);
			var s = nlapiSubmitRecord(b, true);
			// nlapiLogExecution("DEBUG","event
			// case,"casedurationtime:"+h+",submit case id:"+s+",first
			// copyemployees:"+j+",mailBody:"+y)
		}
	} catch (x) {
		if (x instanceof nlobjError) {
			// nlapiLogExecution("DEBUG","event
			// �case�,"casedurationtime:"+h+",emailfields:"+f+",mailBody:"+y+",copyemployees:"+j+",submit
			// case id:"+s+";"+x.getDetails())
		} else {
			// nlapiLogExecution("DEBUG","event
			// �case�,"record"+b+"casedurationtime:"+h+";"+x)
		}
		return true
	}
	return true
};

// Amy 20120906

function event_semail(type, name) {

	if (type == "create" && nlapiGetFieldValue("supportcase") != ""
			&& nlapiGetFieldValue("supportcase") != null) {
		var u = new Array();
		u[0] = "email";
		u[1] = "assigned";
		u[2] = "emailemployees";
		var b = nlapiLoadRecord("supportcase",
				nlapiGetFieldValue("supportcase"));

		var newstatus = nlapiGetFieldValue("custevent19");
		var newfie = nlapiSubmitField('supportcase',
				nlapiGetFieldValue("supportcase"), 'custevent20', newstatus);

		var n = "";
		var h = "";
		var z = b.getFieldValue("startdate");
		var g = b.getFieldValue("starttime");
		var l = nlapiStringToDate(z + " " + g);
		var e = "";
		e = nlapiGetFieldValue("custevent_deptdate");
		var w = nlapiGetFieldValue("custevent_depttime");
		var i = nlapiGetFieldValue("createddate");
		if (i != "" && i != null) {
			var A = nlapiStringToDate(i);
			if (isNaN(A)) {
				A = Date(i);
				A = new Date(A)
			}
			h = (A - l) / (1000 * 60 * 60)
		}
		if (h != "" && h != null && isNaN(h) == false) {
			b.setFieldValue("custevent_casedurationtime", gettextinterval(h
					.toFixed(2)))
		}
		if (b.getFieldValue("custevent_type") != "1") {
			return true
		}
		var v = "";
		var r = new Array();
		var d = b.getFieldValue("custevent_casereprece");
		if (d != null && d != "") {
			v += d
		}

		// Amy 20120906
		var eventRec = nlapiGetNewRecord();
		var recipient = b.getFieldValue("email");
		// var subject = 'Case Update:' + b.getFieldValue('casenumber') + ' ' +
		// b.getFieldValue('title');
		var body1 = nlapiGetFieldValue("custevent_emailbody1");
		var body2 = nlapiGetFieldValue("custevent_emailbody2");
		var body3 = nlapiGetFieldValue("custevent_emailbody3");
		var body4 = nlapiGetFieldValue("custevent_emailbody4");
		var body5 = nlapiGetFieldValue("custevent_emailbody5");
		var signature = nlapiGetFieldValue("custevent_signature");
		var str = '<font size="2">' + body1 + "<br><br>" + body2 + "<br><br>"
				+ body3 + "<br><br>" + body4 + "<br><br>" + body5 + "<br><br>"
				+ signature + "</font>";

		var j = b.getFieldValues("custevent_firstcopyemployee");
		var cc = new Array();
		for (var m = 0; j != null && m < j.length; m++) {

			cc[m] = nlapiLookupField('employee', j[m], 'email');
		}
		var attach = null;
		var attach = null;

		var att = nlapiGetFieldValue("custevent18");
		if (att != null && att != "") {
			var attach = nlapiLoadFile(att);
		}
		// var mailRec = nlapiCreateEmailMerger(144, 'supportcase', b.getId(),
		// 'calendarevent', eventRec.getId());
		var emailMerge = nlapiCreateEmailMerger('192');
		emailMerge.setSupportCase(b.getId());
		// emailMerger.setCustomRecord('calendarevent',eventRec.getId());
		var mailRec = emailMerge.merge();
		var records = new Object();
		records['activity'] = b.getId();
		var emailBody = mailRec.getBody();
		var regexp = new RegExp('ignorewrongmessage', 'g');
		emailBody = emailBody.replace(regexp, str);
		var subject = mailRec.getSubject();
		nlapiLogExecution('debug', 'subject', subject);
		if (nlapiGetFieldValue("custevent_internalonly") == "T") {
			nlapiSendEmail(1166, cc, subject, emailBody, null, null, records,
					attach);
		} else {
			nlapiSendEmail(1166, recipient, subject, emailBody, cc, null,
					records, attach);
		}

	}
}