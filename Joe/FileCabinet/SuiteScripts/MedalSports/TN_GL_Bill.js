/**
 * GL Plug-in
 * 
 * @param record
 * @param standardLines
 * @param customLines
 * @param book
 * @returns
 * 
 */
function customizeGlImpact(record, standardLines, customLines, book) {
	var vendor2 = record.getFieldValue('custbody_tn_bill_vendor2');
	if (vendor2) {
		// nlapiLogExecution('debug', 'vendor2', vendor2);
		var newLine = customLines.addNewLine();
		newLine.setCreditAmount(standardLines.getLine(1).getDebitAmount());
		newLine.setAccountId(standardLines.getLine(1).getAccountId());
		newLine.setMemo("Joe Test");
		newLine.setLocationId(standardLines.getLine(1).getLocationId());

		var newLine1 = customLines.addNewLine();
		newLine1.setDebitAmount(standardLines.getLine(1).getDebitAmount());
		newLine1.setAccountId(standardLines.getLine(1).getAccountId());
		newLine1.setMemo("Joe Test");
		newLine1.setEntityId(parseInt(vendor2));
	}

}