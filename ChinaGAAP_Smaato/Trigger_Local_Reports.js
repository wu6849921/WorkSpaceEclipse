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

	// account
	var accountid = request.getParameter('ACCOUNTID');
	var accountname = unescape(request.getParameter('ACCOUNTNAME'));

	// period
	var periodid = request.getParameter('PERIODID');
	var period = request.getParameter('PERIOD'); // format 2016-10

	// voucher dates
	var voucherDateFrom = request.getParameter('VOUCHERFROM');
	var voucherDateTo = request.getParameter('VOUCHERTO');
	// https://system.eu1.netsuite.com/app/site/hosting/scriptlet.nl?script=464&deploy=1&compid=3423566_SB1&SUBSIDIARY=12&SUBSIDIARYNAME=%25E8%25AA%2589%25E5%25B9%25BF%25E4%25BF%25A1%25E6%2581%25AF%25E7%25A7%2591%25E6%258A%2580%25EF%25BC%2588%25E4%25B8%258A%25E6%25B5%25B7%25EF%25BC%2589%25E6%259C%2589%25E9%2599%2590%25E5%2585%25AC%25E5%258F%25B8%2520Yu%2520Guang%2520Information%2520Technologies%2520(Shanghai)%2520Co.,%2520Ltd&PERIOD=2018%20-%20Closing%20#1-10&PERIODID=232&TYPE=VOUCHER
	// https://system.eu1.netsuite.com/app/site/hosting/scriptlet.nl?script=464&deploy=1&compid=3423566_SB1&SUBSIDIARY=12&SUBSIDIARYNAME=%25E8%25AA%2589%25E5%25B9%25BF%25E4%25BF%25A1%25E6%2581%25AF%25E7%25A7%2591%25E6%258A%2580%25EF%25BC%2588%25E4%25B8%258A%25E6%25B5%25B7%25EF%25BC%2589%25E6%259C%2589%25E9%2599%2590%25E5%2585%25AC%25E5%258F%25B8%2520Yu%2520Guang%2520Information%2520Technologies%2520(Shanghai)%2520Co.,%2520Ltd&PERIOD=2018-09&PERIODID=230&TYPE=VOUCHER
	// period=period.replace(/\#/g,"%23");
	// nlapiLogExecution('DEBUG', 'period', period);
	switch (type) {
	case 'VOUCHER':
		var o = new trigger.local.voucher();
		o.writeVoucherToPDF(subsidiaryid, periodid, accountid, period,
				voucherDateFrom, voucherDateTo, response);
		break;
	case 'PROFIT':
		var o = new trigger.local.profitloss();
		o.writeProfitToPDF(subsidiaryid, subsidiaryname, periodid, period,
				response);
		break;
	case 'SUBLEDGER':
		var o = new trigger.local.subledger();
		o.writeSubLedgerToPDF(subsidiaryid, periodid, period, accountid,
				response);
		break;
	case 'DIARYLEDGER':
		var o = new trigger.local.diaryledger();
		o.writeDiaryLedgerToPDF(subsidiaryid, periodid, period, accountid,
				response);
		break;
	case 'LEDGER':
		var o = new trigger.local.generalledger();
		o.writeGeneralLedgerToPDF(subsidiaryid, periodid, period, accountid,
				accountname, response);
		break;
	case 'TRIALBALANCE':
		var o = new trigger.local.trialbalance();
		o.writeTrialBalanceToPDF(subsidiaryid, periodid, period, response);
		break;
	case 'BALANCESHEET':
		var o = new trigger.local.balancesheet();
		o.writeBalanceSheetToPDF(subsidiaryid, subsidiaryname, periodid,
				period, response);
		break;
	}
}
