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
function read(request, response) {
	try {
		var username = request.getParameter('username');
		var password = request.getParameter('psw');
		var loginRst = userValidation(username, password);
		if (loginRst != 'success') {
			response.write(loginRst);
			return;
		}
		response.setEncoding('UTF-8');

		var arr = [];
		var sc = nlapiLoadSearch('transaction', 'customsearch_tn_inv_pushinfo');
		var rtSet = sc.runSearch();
		for (var n = 0; n < 200; n++) {
			var rts = rtSet.getResults(n * 1000, (n + 1) * 1000);
			if (rts.length <= 0) {
				break;
			} else {
				for (var i = 0; i < rts.length; i++) {
					var temp = {};
					var ar = [];
					var cols = rts[i].getAllColumns();
					var invoiceId = rts[i].getValue(cols[0]);
					var customerId = rts[i].getValue(cols[1]);
					var isMainLine = rts[i].getValue(cols[2]);
					var invStatus = rts[i].getText(cols[3]);
					var customerName = rts[i].getText(cols[4]);
					var regNumber = rts[i].getValue(cols[5]);
					var address_phone = rts[i].getValue(cols[6]);
					var bank_account = rts[i].getValue(cols[7]);

					// 新增字段 add by joe 20180326
					var fapiaoRecipient = rts[i].getValue(cols[18]);
					if (fapiaoRecipient) {
						var record = nlapiLoadRecord(
								'customrecord_mailing_person', fapiaoRecipient);
						fapiaoRecipient = record.getFieldValue('name');
					}
					var phoneNo = rts[i].getValue(cols[19]);
					var mailingAddress = rts[i].getValue(cols[20]);

					var itemName = rts[i].getValue(cols[8]); /* item */
					var itemSpecifi = rts[i].getValue(cols[9]);
					var itemUnit = rts[i].getValue(cols[10]);
					var itemQty = rts[i].getValue(cols[11]);
					var itemPrice = rts[i].getValue(cols[12]);
					var itemRate = rts[i].getValue(cols[13]);
					var invoiceMemo1 = rts[i].getValue(cols[14]);
					var invoiceMemo2 = rts[i].getValue(cols[15]);
					var itemTax = rts[i].getValue(cols[16]);
					var itemAmount = rts[i].getValue(cols[17]);

					var invInternalId = rts[i].getId();
					var recordType = rts[i].getRecordType();

					if (isMainLine == '*')
						continue;
					if (invoiceMemo1 == null) {
						invoiceMemo1 = '';
					}
					if (invoiceMemo2 == null) {
						invoiceMemo2 = '';
					}

					var lineDetails = {
						'itemName' : itemName,
						'itemSpecifi' : itemSpecifi,
						'itemUnit' : itemUnit,
						'itemQty' : itemQty,
						'itemPrice' : itemPrice,
						'itemRate' : itemRate,
						'itemTax' : itemTax,
						'itemAmount' : itemAmount,
					}
					var index = keyInArr(invoiceId, arr);
					if (index == -1) { /* item with different invoice number */
						temp = {
							'status' : 'success',
							'code' : '4',
							'invoiceId' : invoiceId,
							'customerId' : customerId,
							'invStatus' : invStatus,

							'customerName' : customerName,
							'address_phone' : address_phone,
							'bank_account' : bank_account,
							'regNumber' : regNumber,
							'invoiceMemo' : invoiceMemo1 + invoiceMemo2,
							// add by joe
							'fapiaoRecipient' : fapiaoRecipient,
							'phoneNo' : phoneNo,
							'mailingAddress' : mailingAddress,

							'details' : [ lineDetails ]
						};
						if (invStatus == '3') {
							nlapiSubmitField(recordType, invInternalId,
									'custbody_tn_inv_statue', 3);
						}
						arr.push(temp);
					} else { /* item with same invoice number */
						arr[index].details.push(lineDetails);
					}

				}

			}
		}
		if (arr.length < 0) {
			var res = {
				'status' : 'success',
				'code' : '5',
				'details' : '无结果'
			};
			response.write(JSON.stringify(res));
			return;
		}
		arr = JSON.stringify(arr);
		response.write(arr);
	} catch (ex) {
		var res = {
			'status' : 'error',
			'code' : '3',
			'details' : '接口异常'
		};
		nlapiLogExecution('debug', 'read invoice' + invInternalId, ex);
		response.write(JSON.stringify(res));
		return;
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

function keyInArr(key, arr) {
	for (var i = 0; i < arr.length; i++) {
		if (key == arr[i].invoiceId) {
			return i;
		}
	}
	return -1;
}