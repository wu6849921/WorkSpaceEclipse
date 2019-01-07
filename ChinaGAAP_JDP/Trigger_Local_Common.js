/**
 * Module Description: utility functionality
 * Version    Date            Author           Remarks
 * 1.00       23 Oct 2014   Winson.Chen
 */

triggernamespace("trigger.local.common");

trigger.local.common = function() {}
trigger.local.common.prototype = {
	GetJrnlDate : function(datefld) {
		var yyyy = datefld.substring(0, 4);
		var mm = datefld.substring(4, 6);
		var dd = datefld.substring(6);
		var jrnldate = new Date();
		jrnldate.setFullYear(yyyy);
		jrnldate.setMonth(mm);
		jrnldate.setDate(dd);
		return nlapiDateToString(jrnldate);
	},
	GetLastDay : function(datefid) {
		var dt = new Date(datefid);
		var year = dt.getFullYear();
		var month = dt.getMonth() + 1;
		return new Date(year, month, 0);
	},


	GetMonthByPeriod : function(period) {
		if (!period) {
			return;
		}
		var month = period.substring(5);
	    return month;
	},
	
	
	GetMonthByPeriodOfEnglish : function(period) {
		if (!period) {
			return;
		}
		var month = period.substring(0, 3);
		var n = 0;
		switch (month) {
		case 'Jan':
			n = 1;
			break;
		case 'Feb':
			n = 2;
			break;
		case 'Mar':
			n = 3;
			break;
		case 'Apr':
			n = 4;
			break;
		case 'May':
			n = 5;
			break;
		case 'Jun':
			n = 6;
			break;
		case 'Jul':
			n = 7;
			break;
		case 'Aug':
			n = 8;
			break;
		case 'Sep':
			n = 9;
			break;
		case 'Oct':
			n = 10;
			break;
		case 'Nov':
			n = 11;
			break;
		case 'Dec':
			n = 12;
			break;
		}
		return n;
	},

	GetCurrentTime : function() {
		var d = new Date();
		var Y = d.getFullYear();
		var M = d.getMonth() + 1;
		var D = d.getDate();
		return Y + '年' + M + '月' + D + '日';
	},

	GetCurrentYear : function _GetCurrentYear() {
		var d = new Date();
		var Y = d.getFullYear();
		return Y + '年';
	},

	GetCurrentYearAndMonth : function(date) {
		var d;
		if (date) {
			d = date;
		} else {
			d = new Date();
		}
		var Y = d.getFullYear();
		var M = d.getMonth() + 1;
		return Y + '年' + M + '月';
	},

	formatCNDate : function(date, format) {
		if (arguments.length < 2 && !date.getTime) {
			format = date;
			date = new Date();
		}
		typeof format != 'string' && (format = 'YYYY年MM月DD日 hh时mm分ss秒');
		var week = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', '日', '一', '二', '三', '四', '五',
				'六' ];
		return format.replace(/YYYY|YY|MM|DD|hh|mm|ss|星期|周|www|week/g, function(a) {
			switch (a) {
			case "YYYY":
				return date.getFullYear();
			case "YY":
				return (date.getFullYear() + "").slice(2);
			case "MM":
				return date.getMonth() + 1;
			case "DD":
				return date.getDate();
			case "hh":
				return date.getHours();
			case "mm":
				return date.getMinutes();
			case "ss":
				return date.getSeconds();
			case "星期":
				return "星期" + week[date.getDay() + 7];
			case "周":
				return "周" + week[date.getDay() + 7];
			case "week":
				return week[date.getDay()];
			case "www":
				return week[date.getDay()].slice(0, 3);
			}
		});
	},
   replaceSpecialSymbol:function(memo)
	{
		if(memo){
			var re = /&lt;/g; 
			memo = memo.replace(re,"<");
			re = /&gt;/g; 
			memo = memo.replace(re,">");
			re =  /&amp;/g; 
			memo = memo.replace(re,"&");
			re =  /&apos;/g; 
			memo = memo.replace(re,"'");
			re =  /&quot;/g; 
			memo = memo.replace(re,"\"");
			re =  //g; 
			memo = memo.replace(re,"|");
		}
	    return memo;
	},
	replaceSpecialSymbolforNumber:function(number)
	{
		if(number){
			var re =  /-/g;
			number = number.replace("-","- ");
			var re =  /\//g;
			number = number.replace(re,"/ ");
		}
	    return number;
	},
	replaceitemwithspace:function(memo){
		if(memo.length<=20){return memo;}
		  var usern = /^[a-zA-Z0-9]{1,}$/;
		  if (!memo.match(usern)) {
			  //var re = /，/g;
			  //memo = memo.replace(re,"， ");
			  //re = /、/g;
			  //memo = memo.replace(re,"、 ");
		      var n = memo.substring(19,1);
		      memo = memo.replace(n,n+' ');
		  }
		  return memo;
	},
	/**
	 * format string
	 * example: var testing = String.format("{0}/{1}/{2}", 10,11,2014);
	 * So testing = "10/11/2014";
	 * @returns
	 */
	Stringformat : function() {
		var args = arguments;
		return args[0].replace(/\{(\d+)\}/g, function(m, i) {
			return args[i * 1 + 1];
		});
	},
	/**
	 * remove space
	 * @param str
	 * @returns
	 */
	StringTrim: function(str) {
		  return str.replace(/(^\s+)|(\s+$)/g, "");
	},
	/**
	 * format currency to 1,000.00
	 * abandon regular expressions.
	 * @param num
	 * @returns {String}
	 */
	formatCurrency: function(n) {
		if(!n){return '0.00'}
		n = parseFloat(n).toFixed(2);
		var re=/(\d{1,3})(?=(\d{3})+(?:$|\D))/g;
		return n.replace(re,"$1,") ;
		
		/*
		n += ""; 
		var arr = n.split("."); 
		var re = /(\d{1,3})(?=(\d{3})+$)/g; 
		return arr[0].replace(re,"$1,") + (arr.length == 2 ? "."+arr[1] : ""); 
		nlapiLogExecution('debug', 'n', n);
		 */
	},
	
	formatStringValuesInXml: function(inputStr) {
		if (!inputStr || !inputStr.toString().trim()) {
			return '';
		} else {
			var str = inputStr;
			str = str.replace("<", "&lt;");
			str = str.replace(">", "&gt;");
			str = str.replace("&", "&amp;");
			str = str.replace("'", "&apos;");
			str = str.replace("\"", "&quot;");
			return str;
		}
	},
	
	isEmpty: function(inputStr) {
		if (!inputStr || !inputStr.toString().trim()) {
			return true;
		} else {			
			return false;
		}
	},

	getReturnError : function(errorMsg) {
		var error = {
			'status' : 'error',
			'details' : errorMsg
		};
		return error;
	},	
	
	convertUrlParasToObj : function(urlParas) {
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
	},
	
	/**
	 *Send Email When Exception Throwed
	 * @param num
	 * @returns {String}
	 */
	sendErrorEmail : function(receiptEmail, company, scriptname, functionname, details) {
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
			this.getReturnError('Exception during Error Email sending:' + ex);
		}
	}
//////end of class
};
//format string
String.format = function () {
  var args = arguments;
  return args[0].replace(/\{(\d+)\}/g, function (m, i) { return args[i * 1 + 1]; });
};