/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jun 2016     Trigger_Mark
 *
 */

/**
 * @param {nlobjRequest}
 *            request Request object
 * @param {nlobjResponse}
 *            response Response object
 * @returns {Void} Any output is written via response object
 */
function write(request, response) {
	try {
		var username = request.getParameter('username');
		var password = request.getParameter('psw');
		var loginRst = userValidation(username, password);
		if (loginRst != 'success') {
			response.write(loginRst);
			return;
		}
		response.setEncoding('UTF-8');
		var info = {};
		info.invoiceId = request.getParameter('invoiceId');
		info.invoiceNumber = request.getParameter('invoiceNumber');
		info.invoiceCode = request.getParameter('invoiceCode');
		info.invoiceDate = request.getParameter('invoiceDate');

		if (typeof (info) == 'string') {
			info = JSON.parse(info);
		}
		var res = writeInfo(info);
		response.write(res);

	} catch (ex) {
		nlapiLogExecution('debug', 'write', ex);
		var res = {
			'status' : 'error',
			'code' : '3',
			'details' : '�ӿ��쳣'
		};
		response.write(JSON.stringify(res));
		return;
	}
}

// ��д��Ϣ��NetSuite
function writeInfo(info) {
	try {
		if (!info.invoiceId || !info.invoiceNumber || !info.invoiceCode
				|| !info.invoiceDate) {
			var res = {
				'status' : 'error',
				'code' : '6',
				'details' : '��д��Ϣȱʧ'
			};
			return JSON.stringify(res);
		}
		var rts = nlapiSearchRecord('transaction', null,
				[ new nlobjSearchFilter('tranid', null, 'is', info.invoiceId) ]);
		if (!rts)
			throw 'Invoice:' + info.invoiceId + ' δ�ҵ�';
		var invId = rts[0].getId();
		var recType = rts[0].getRecordType();
		var key = [ 'custbody_tn_inv_statue', 'custbody_tn_inv_number',
				'custbody_tn_inv_issuedate' ];
		var val = [ '4', info.invoiceNumber + info.invoiceCode,
				info.invoiceDate ];
		nlapiSubmitField(recType, invId, key, val);
		var res = {
			'status' : 'success',
			'code' : '4'
		};
		return JSON.stringify(res);
	} catch (ex) {
		nlapiLogExecution('debug', 'writeInfo', ex);
		var rec = nlapiCreateRecord('customrecord_tn_inv_errorreturn');
		rec.setFieldValue('name', info.invoiceId);
		rec.setFieldValue('custrecord_tn_invwbe_number', info.invoiceNumber);
		rec.setFieldValue('custrecord_tn_invwbe_date', info.invoiceDate);
		rec.setFieldValue('custrecord_tn_invwbe_memo', ex);
		nlapiSubmitRecord(rec);
		var err = {
			'status' : 'error',
			'code' : '3',
			'details' : '�ӿ��쳣'
		};
		return JSON.stringify(err);
	}
}

// �û���������֤
function userValidation(username, password) {
	if (username != 'goldentax') {
		var err = {
			'status' : 'error',
			'code' : '1',
			'details' : '�û���������'
		};
		return JSON.stringify(err);
	}
	if (password != 'trigger123!@#') {
		var err = {
			'status' : 'error',
			'code' : '2',
			'details' : '�������'
		};
		return JSON.stringify(err);
	}
	return 'success';
}
