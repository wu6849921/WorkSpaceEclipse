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
		nlapiLogExecution('debug', 'writeBigan', request);
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
		// add by joe 新增回写字段custbody_tracking_no
		info.trackingNo = request.getParameter('trackingNo');

		if (typeof (info) == 'string') {
			info = JSON.parse(info);
		}
		var res = writeInfo(info);
		response.write(res);
		nlapiLogExecution('debug', 'writeEnd', res);

	} catch (ex) {
		nlapiLogExecution('debug', 'write', ex);
		var res = {
			'status' : 'error',
			'code' : '3',
			'details' : '接口异常'
		};
		response.write(JSON.stringify(res));
		return;
	}
}

// 回写信息到NetSuite
function writeInfo(info) {
	try {
		if (!info.invoiceId || !info.invoiceNumber || !info.invoiceCode
				|| !info.invoiceDate || !info.trackingNo) {
			var res = {
				'status' : 'error',
				'code' : '6',
				'details' : '回写信息缺失'
			};
			return JSON.stringify(res);
		}
		var rts = nlapiSearchRecord('transaction', null,
				[ new nlobjSearchFilter('tranid', null, 'is', info.invoiceId) ]);
		if (!rts)
			throw 'Invoice:' + info.invoiceId + ' 未找到';
		var invId = rts[0].getId();
		var recType = rts[0].getRecordType();
		// var key = [ 'custbody_tn_inv_statue', 'custbody_tn_inv_number',
		// 'custbody_tn_inv_issuedate' ];
		// add by joe 20180326
		var key = [ 'custbody_tn_inv_statue', 'custbody_tn_inv_number',
				'custbody_tn_inv_issuedate', 'custbody_tracking_no' ];
		// var val = [ '4', info.invoiceNumber + info.invoiceCode,
		// info.invoiceDate ];
		var val = [ '4', info.invoiceNumber + info.invoiceCode,
				info.invoiceDate, info.trackingNo ];
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
			'details' : '接口异常'
		};
		return JSON.stringify(err);
	}
}

// 用户名密码验证
function userValidation(username, password) {
	if (username != 'goldentax') {
		var err = {
			'status' : 'error',
			'code' : '1',
			'details' : '用户名不存在'
		};
		return JSON.stringify(err);
	}
	if (password != 'trigger123!@#') {
		var err = {
			'status' : 'error',
			'code' : '2',
			'details' : '密码错误'
		};
		return JSON.stringify(err);
	}
	return 'success';
}
