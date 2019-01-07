/**
 * Copyright Trigger Networks, Inc. 2014 All rights reserved. Module Description
 * Voucher Reports Version Date Author Remarks 
 * 1.00 05 Aug 2014 Winson.Chen
 * 
 */

triggernamespace("trigger.local");

trigger.local.write = function() {}
trigger.local.write.prototype = {
	/**
	 * convert XML to PDF
	 * @param xml
	 * @param name
	 */
	WriteXMLToPDF : function(response, xml, name) {
		if (!xml) {
			var newxml = new trigger.local.xmltemplate().GetNoneRecordsXML;
			response.write(newxml);
			return;
		}

		var file = nlapiXMLToPDF(xml);
		file.setName(name);
		response.setContentType('PDF', name, 'inline');
		response.write(file.getValue());
	},
	DisplayMessage:function(response,number)
	{
		var xml = new trigger.local.xmltemplate().GetLimitOfNumberXML(number);
		response.write(xml);
	}

};