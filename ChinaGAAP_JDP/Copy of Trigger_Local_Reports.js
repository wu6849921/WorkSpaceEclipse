/**
 * Copyright Trigger Networks, Inc. 2014 All rights reserved. Module Description
 * Create the user interface for printing journals entries. 
 * Version    Date            Author           Remarks
 * 1.00      05 Aug 2014   Winson.Chen
 * 
 */


/**
 * Create the form for printing journals entries.
 * 
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function main(request, response) {
	var type = request.getParameter('TYPE');
	// for subsidiary
	var subsidiaryid = request.getParameter('SUBSIDIARY');
	var subsidiaryname = request.getParameter('SUBSIDIARYNAME');
	subsidiaryname = decodeURI(subsidiaryname);
	
    //account
	var accountid =  request.getParameter('ACCOUNTID');
	var accountname = unescape(request.getParameter('ACCOUNTNAME'));
	
	//period
	var periodid = request.getParameter('PERIODID');
	var period = request.getParameter('PERIOD'); //format 2016-10
	
	//voucher dates
	var voucherDateFrom = request.getParameter('VOUCHERFROM');
	var voucherDateTo = request.getParameter('VOUCHERTO');
	
	switch ( type )
	{
		case 'VOUCHER':
			var o = new trigger.local.voucher();
		   	o.writeVoucherToPDF(subsidiaryid, periodid, accountid, period, voucherDateFrom, voucherDateTo, response );
			break;
		case 'PROFIT': 
			var o = new trigger.local.profitloss();
			o.writeProfitToPDF(subsidiaryid,subsidiaryname,periodid, period, response);
			break;
		case 'SUBLEDGER':
			var o = new trigger.local.subledger();
			o.writeSubLedgerToPDF(subsidiaryid, periodid, period, accountid, response);
			break;
		case 'DIARYLEDGER':
			var o = new trigger.local.diaryledger();
			o.writeDiaryLedgerToPDF(subsidiaryid,  periodid, period, accountid, response);
			break;
		case 'LEDGER':
			var o = new trigger.local.generalledger();
			o.writeGeneralLedgerToPDF( subsidiaryid, periodid, period, accountid,accountname, response);
			break;
		case 'TRIALBALANCE':
			var o = new trigger.local.trialbalance();
			o.writeTrialBalanceToPDF(subsidiaryid, periodid, period, response);
			break;
		case 'BALANCESHEET':
			var o = new trigger.local.balancesheet();
			o.writeBalanceSheetToPDF(subsidiaryid, subsidiaryname, periodid, period, response);
			break;
	};
}

