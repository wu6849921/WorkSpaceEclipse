/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 31 Mar 2016 Zed
 * 
 */

triggernamespace('trigger');

trigger.common = function() {

	function getTwoDecimalString(str) {
		str = str.toString();
		if (str.length >= 2)
			return str;
		else if (str.length == 1) {
			return '0' + str;
		} else
			return '';
	}

	this.getReturnError = function(errorMsg) {
		var error = {
			'status' : 'error',
			'details' : errorMsg
		};
		return error;
	};

	// 灏嗗�艰浆鎹㈡垚鏁板瓧--convert value to number
	this.convertValToNum = function(val, digit) {
		try {
			if (digit || digit == 0) {
				if (!val)
					return parseFloat(0).toFixed(digit);
				else {
					var r = parseFloat(val).toFixed(digit) == NaN ? 0
							: parseFloat(val).toFixed(digit);
					return typeof (r) == 'string' ? parseFloat(r) : r;
				}
			} else {
				if (!val)
					return 0;
				else {
					var r = parseFloat(val) == NaN ? 0 : parseFloat(val);
					return typeof (r) == 'string' ? parseFloat(r) : r;
				}
			}
		} catch (ex) {
			return this.getReturnError('鏃犳硶杞崲鏁板瓧:' + ex);
		}
	};

	// 灏嗗�艰浆鎹㈡垚瀛楃涓�--convert value to string
	this.convertValToString = function(val) {
		try {
			if (!val || !val.toString().trim())
				return '';
			else {
				if (typeof (val) == 'object')
					return JSON.stringify(val);
				else
					return val.toString();
			}
		} catch (ex) {
			return this.getReturnError('鏃犳硶杞崲瀛楃涓�:' + ex);
		}
	};

	// 鏇挎崲HTML涓殑鐗规畩瀛楃--Replace Special Symbols in HTML
	this.replaceSpecialSymbol = function(val) {
		if (val) {
			var re = /&lt;/g;
			val = val.replace(re, "<");
			re = /&gt;/g;
			val = val.replace(re, ">");
			re = /&amp;/g;
			val = val.replace(re, "&");
			re = /&apos;/g;
			val = val.replace(re, "'");
			re = /&quot;/g;
			val = val.replace(re, "\"");
			re = //g;
			val = val.replace(re, "|");
		}
		return val;
	};

	// 鍙戦�佸紓甯搁偖浠�--Send Email When Exception Throwed
	this.sendErrorEmail = function(receiptEmail, company, scriptname,
			functionname, details) {
		try {
			var subject = 'Script Error';
			var body = '';
			body += 'Company: ';
			body += company;
			body += '\r\n';

			body += 'Script Name: ';
			body += scriptname;
			body += '\r\n';

			body += 'Function name: ';
			body += functionname;
			body += '\r\n';

			body += 'User: ';
			body += nlapiGetContext().getName();
			body += '\r\n';

			body += 'Role: ';
			body += nlapiGetContext().getRoleId();
			body += '\r\n';

			body += 'Record Type: ';
			body += nlapiGetRecordType();
			body += '\r\n';

			body += 'Record Id: ';
			body += nlapiGetRecordId();
			body += '\r\n';

			body += 'Details: ';
			body += details;
			body += '\r\n';
			nlapiSendEmail('-5', receiptEmail, subject, body);
			return {
				'status' : 'success'
			};
		} catch (ex) {
			return this.getReturnError('鍙戦�侀偖浠跺け璐�:' + ex);
		}
	};

	// 缁橲ublist娣诲姞Mark All鍔熻兘--Add Mark All Function to a Sublist
	this.markAll = function(type, name) {
		var count = nlapiGetLineItemCount(type);
		for (var i = 1; i <= count; i++) {
			nlapiSetLineItemValue(type, name, i, 'T');
		}
	};

	// 缁橲ublist娣诲姞UnMark All鍔熻兘--Add UnMark All Function to a Sublist
	this.unmarkAll = function(type, name) {
		var count = nlapiGetLineItemCount(type);
		for (var i = 1; i <= count; i++) {
			nlapiSetLineItemValue(type, name, i, 'F');
		}
	};

	// 灏嗙◣鐜囧瓧绗︿覆杞崲鎴愭暟瀛�--Convert Tax Rate String to Number
	this.convertTaxrateToNum = function(taxRate, digit) {
		if (!taxRate)
			return 0;
		else {
			var str = taxRate.substring(0, taxRate.length - 1);
			var num = this.convertValToNum(str);
			num = num / 100;
			if (digit) {
				return parseFloat(num).toFixed(digit);
			} else {
				return parseFloat(num);
			}
		}
	};

	// 灏嗘暟瀛楄浆鎹㈡垚绋庣巼瀛楃涓�--Convert Number to Tax Rate String
	this.convertNumToTaxRate = function(num) {
		if (!num)
			return '0.00%';
		else {
			num = num * 100;
			var str = parseFloat(num).toFixed(2).toString() + '%';
			return str;
		}
	};

	// 楠岃瘉鏄惁寮�濮嬫棩鏈�<缁撴潫鏃ユ湡--Validate If FromDate<ToDate
	this.fromToDateValidation = function(fromDate, toDate) {
		var _fromDate = nlapiStringToDate(fromDate);
		var _toDate = nlapiStringToDate(toDate);
		if (_fromDate < _toDate)
			return true;
		return false;
	};

	// 閲嶆瀯sublist涓崟閫夊瓧娈电殑鍙�夐」--Reconstruct the Options of a Select Field in
	// Sublist
	this.reConstructSublistSelectOption = function(fieldId, lineNum,
			optionsObj, includeNull) {
		var str = 'inpt_' + fieldId + lineNum.toString();
		str = jQuery('[name="' + str + '"]').attr('id');
		str = str.substring(5);
		var d = dropdowns[str];
		d.deleteAllOptions();
		if (includeNull) {
			d.addOption('', '');
		}
		for ( var k in optionsObj) {
			d.addOption(optionsObj[k], k);
		}
	};

	// 鑾峰彇涓浗褰撳墠鏃堕棿锛屾湇鍔″櫒鏃堕棿鏄編鍥芥椂闂�--Get Chinese Current Date. The Date of
	// Server is USA
	// Date
	this.getCurrentChineseDate = function(day) {
		var dateObj = new Date();
		var utcHours = dateObj.getUTCHours();
		var utcYear = dateObj.getUTCFullYear();
		var utcMonth = dateObj.getUTCMonth();
		var utcDate = dateObj.getUTCDate();
		dateObj.setHours(utcHours + 8);
		dateObj.setDate(utcDate + (day ? day : 0));
		dateObj.setMonth(utcMonth);
		dateObj.setFullYear(utcYear);
		return nlapiDateToString(dateObj);
	};

	// 鎻愬彇URL涓殑閿�煎杞崲鎴恛bj--Get key and value from URL string and convert that
	// into
	// object
	this.convertUrlParasToObj = function(urlParas) {
		var obj = {};
		urlParas = urlParas.substring(urlParas.indexOf('?') + 1);
		var arr = urlParas.split('&');
		for (var i = 0; i < arr.length; i++) {
			var temp = arr[i].split('=');
			var k = temp[0];
			var val = temp[1];
			obj[k] = val;
		}
		return obj;
	};

	// 鍦╞eforeLoad鏃堕殣钘忓瓧娈�--Hide fields when beforeLoad
	this.hideFieldsBeforeLoad = function() {
		for ( var k in arguments) {
			var f = nlapiGetField(arguments[k]);
			if (f) {
				f.setDisplayType('hidden');
			}
		}
	};

	// 鐢熸垚GUID--Generate GUID
	this.generateGUID = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
				function(c) {
					var r = Math.random() * 16 | 0, v = c == 'x' ? r
							: (r & 0x3 | 0x8);
					return v.toString(16);
				});
	};

	// 灏嗙郴缁焏ate瀛楃涓茶浆鎹负鎸囧畾鏍煎紡-Convert system format date to specific format
	// date
	// string

	this.convertDateString = function(datestr, format) {
		var date = nlapiStringToDate(datestr);
		var mm = getTwoDecimalString(date.getMonth() + 1);
		var dd = getTwoDecimalString(date.getDate());
		var yy = date.getFullYear();
		var str = '';
		switch (format) {
		case 'YYYY/MM/DD':
			str = this.stringrender('{0}/{1}/{2}', yy, mm, dd);
			break;
		case 'YYYY.MM.DD':
			str = this.stringrender('{0}.{1}.{2}', yy, mm, dd);
			break;
		case 'MM/DD/YYYY':
			str = this.stringrender('{0}/{1}/{2}', mm, dd, yy);
			break;
		case 'MM.DD.YYYY':
			str = this.stringrender('{0}.{1}.{2}', mm, dd, yy);
			break;
		default:
			str = this.stringrender('{0}/{1}/{2}', mm, dd, yy);
			break;
		}
		return str;
	};

	// 灏嗘暟瀛楅噾棰濊浆鎹负澶у啓鐨勪汉姘戝竵閲戦
	this.atoc = function(numberValue) {
		try {
			numberValue = parseFloat(numberValue).toFixed(2);
			var numberValue = new String(Math.round(numberValue * 100)); // 鏁板瓧閲戦
			var chineseValue = ""; // 杞崲鍚庣殑姹夊瓧閲戦
			var String1 = "闆跺９璐板弫鑲嗕紞闄嗘煉鎹岀帠"; // 姹夊瓧鏁板瓧
			var String2 = "涓囦粺浣版嬀浜夸粺浣版嬀涓囦粺浣版嬀鍏冭鍒�"; // 瀵瑰簲鍗曚綅
			var len = numberValue.length; // numberValue 鐨勫瓧绗︿覆闀垮害
			var Ch1; // 鏁板瓧鐨勬眽璇娉�
			var Ch2; // 鏁板瓧浣嶇殑姹夊瓧璇绘硶
			var nZero = 0; // 鐢ㄦ潵璁＄畻杩炵画鐨勯浂鍊肩殑涓暟
			var String3; // 鎸囧畾浣嶇疆鐨勬暟鍊�
			if (len > 15) {
				alert("瓒呭嚭璁＄畻鑼冨洿");
				return "";
			}
			if (numberValue == 0) {
				chineseValue = "闆跺厓鏁�";
				return chineseValue;
			}

			String2 = String2.substr(String2.length - len, len); // 鍙栧嚭瀵瑰簲浣嶆暟鐨凷TRING2鐨勫��
			for (var i = 0; i < len; i++) {
				String3 = parseInt(numberValue.substr(i, 1), 10); // 鍙栧嚭闇�杞崲鐨勬煇涓�浣嶇殑鍊�
				if (i != (len - 3) && i != (len - 7) && i != (len - 11)
						&& i != (len - 15)) {
					if (String3 == 0) {
						Ch1 = "";
						Ch2 = "";
						nZero = nZero + 1;
					} else if (String3 != 0 && nZero != 0) {
						Ch1 = "闆�" + String1.substr(String3, 1);
						Ch2 = String2.substr(i, 1);
						nZero = 0;
					} else {
						Ch1 = String1.substr(String3, 1);
						Ch2 = String2.substr(i, 1);
						nZero = 0;
					}
				} else { // 璇ヤ綅鏄竾浜匡紝浜匡紝涓囷紝鍏冧綅绛夊叧閿綅
					if (String3 != 0 && nZero != 0) {
						Ch1 = "闆�" + String1.substr(String3, 1);
						Ch2 = String2.substr(i, 1);
						nZero = 0;
					} else if (String3 != 0 && nZero == 0) {
						Ch1 = String1.substr(String3, 1);
						Ch2 = String2.substr(i, 1);
						nZero = 0;
					} else if (String3 == 0 && nZero >= 3) {
						Ch1 = "";
						Ch2 = "";
						nZero = nZero + 1;
					} else {
						Ch1 = "";
						Ch2 = String2.substr(i, 1);
						nZero = nZero + 1;
					}
					if (i == (len - 11) || i == (len - 3)) { // 濡傛灉璇ヤ綅鏄嚎浣嶆垨鍏冧綅锛屽垯蹇呴』鍐欎笂
						Ch2 = String2.substr(i, 1);
					}
				}
				chineseValue = chineseValue + Ch1 + Ch2;
			}

			if (String3 == 0) { // 鏈�鍚庝竴浣嶏紙鍒嗭級涓�0鏃讹紝鍔犱笂鈥滄暣鈥�
				chineseValue = chineseValue + "鏁�";
			}

			return chineseValue;
		} catch (ex) {
			nlapiLogExecution('debug', 'atoc', ex);
		}
	};

	this.ObjectClone = function(obj) {
		if (typeof (obj) != 'object' || obj == null)
			return obj;
		var newObj = new Object();
		for ( var i in obj) {
			newObj[i] = obj[i];
		}
		return newObj;
	};
	this.convertJSONtoTriggerHash = function(j) {
		var hash = new trigger.hashTable();
		for ( var k in j) {
			hash.add(k, j[k]);
		}
		return hash;
	};

	this.stringrender = function() {
		var args = arguments;
		return args[0].replace(/\{(\d+)\}/g, function(m, i) {
			return args[i * 1 + 1];
		});
	};

	this.removeColon = function(str) {
		while (str.indexOf(':') != -1) {
			str = str.substring(str.indexOf(':') + 1);
		}
		while (str.indexOf('锛�') != -1) {
			str = str.substring(str.indexOf('锛�') + 1);
		}
		return str;
	};
};

// 鑷畾涔夌殑HashTable--Customized HashTable
trigger.hashTable = function _hashtable() {
	this.arrayList = [];
	this.hashArr = {};
	this.count = 0;
	this.type = 'tn_hash';

	this.add = function(key, value) {
		if (this.hashArr.hasOwnProperty(key)) {
			return false; // 濡傛灉閿凡缁忓瓨鍦紝涓嶆坊鍔�
		} else {
			this.hashArr[key] = value;
			this.arrayList[this.count] = key;
			this.count++;
			return true;
		}
	}; // add

	this.update = function(key, val) {
		if (this.contains(key)) {
			this.hashArr[key] = val;
		}
	};
	this.contains = function(key) {
		return this.hashArr.hasOwnProperty(key);
	}; // if it's contains

	this.getValue = function(key) {
		if (this.contains(key)) {
			return this.hashArr[key];
		} else {
			// throw Error("Hashtable dont cotains this key: " +
			// String(key));
			// err
			return '';
		}
	}; // Get the value from the key

	this.remove = function(key) {
		if (this.contains(key)) {
			delete this.hashArr[key];
			this.count--;
		}
	}; // Remove

	this.clear = function() {
		this.hashArr = {};
		this.count = 0;
	}; // Clear
};
