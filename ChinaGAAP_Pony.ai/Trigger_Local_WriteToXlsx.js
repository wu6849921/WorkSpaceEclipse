/**
 * Copyright Trigger Networks, Inc. 2014 All rights reserved. Module Description
 * Voucher Reports Version Date Author Remarks 1.00 05 Aug 2014 Winson.Chen
 * 
 */

triggernamespace("trigger.local");

trigger.local.write1 = function() {
}
trigger.local.write1.prototype = {
	/**
	 * convert XML to PDF
	 * 
	 * @param xml
	 * @param name
	 */
	WriteXMLToXlsx : function(response, xml, name) {
		if (!xml) {
			var newxml = new trigger.local.xmltemplate().GetNoneRecordsXML;
			response.write(newxml);
			return;
		}
		xml = nlapiEncrypt(xml, 'base64');
		// nlapiLogExecution('debug', 'xml', xml);
		var file = nlapiCreateFile(name, 'EXCEL', xml);
		// file.setName(name);
		// nlapiLogExecution('debug', 'file', file);
		response.setContentType('EXCEL', name, 'inline');

		response.write(file.getValue());
	},
	DisplayMessage : function(response, number) {
		var xml = new trigger.local.xmltemplate().GetLimitOfNumberXML(number);
		response.write(xml);
	}

};