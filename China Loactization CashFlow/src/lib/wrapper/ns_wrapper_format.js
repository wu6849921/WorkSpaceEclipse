/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    'N/format',
    '../commons',
    './ns_wrapper_runtime'
],
function(formatter, commons, runtime) {

    /**
	 * See SS2.0 API.
	 */
    function parse(options) {
        return formatter.parse(options);
    }

    /**
	 * E.g. parseDate('5/2/2017') -> Date parseDate('05/02/2017') -> Date
	 * 
	 * @param Date
	 *            as a string to parse.
	 * @returns The parsed value as a Date
	 */
    function parseDate(dateString) {
        return formatter.parse({
            value: dateString,
            type: formatter.Type.DATE
        });
    }

    /**
	 * E.g. parseDate('5/2/2017 8:16:27 pm') -> Date parseDate('05/02/2017
	 * 8:16:27 pm') -> Date
	 * 
	 * @param Date
	 *            as a string to parse.
	 * @returns The parsed value as a Date
	 */
    function parseDateTime(dateString) {
        return formatter.parse({
            value: dateString,
            type: formatter.Type.DATETIME
        });
    }

    /**
	 * E.g. format(options) -> see SS2.0 API format({value: new Date(), pattern:
	 * 'yyyy-MM-dd hh:mm:ss'}) -> '2017-05-03 11:18:27'
	 * 
	 * @param options
	 *            {options.value | required} Date to format. {options.type |
	 *            required/optional} The type to be used to format date, see
	 *            SS2.0 API. {options.pattern | optional/required} The pattern
	 *            to be used to format date.
	 * @returns The formatted value as a string
	 */
    function format(options) {
        // check options and throw exception later.
        if (commons.isDate(options.value)) {
            if (commons.makesure(options.pattern)) {
                return formatDateWithPattern(options);
            }
        }
        return formatter.format(options);
    }

    function formatDateWithPattern(options) {
        var pattern = options.pattern;
        var date = options.value;

        var o = {
            "M+": date.getMonth() + 1, // month
            "d+": date.getDate(), // day
            "h+": date.getHours(), // hour
            "m+": date.getMinutes(), // minute
            "s+": date.getSeconds(), // second
            "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
            "S": date.getMilliseconds()
        // millisecond
        }

        if (/(y+)/.test(pattern)) {
            pattern = pattern.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for ( var k in o) {
            if (new RegExp("(" + k + ")").test(pattern)) {
                pattern = pattern.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }

        return pattern;
    }

    /**
	 * E.g. formatDate(new Date()) -> '5/2/2017'
	 * 
	 * @param Date
	 *            to format.
	 * @returns The formatted value as a string
	 */
    function formatDate(date) {
        return format({
            value: date,
            type: formatter.Type.DATE
        });
    }

    /**
	 * E.g. formatDateTime(new Date()) -> '5/2/2017 8:16:27 pm'
	 * 
	 * @param Date
	 *            to format.
	 * @returns The formatted value as a string
	 */
    function formatDateTime(date) {
        return format({
            value: date,
            type: formatter.Type.DATETIME
        });
    }

    /**
	 * @desc Format currency value. Format depends on user preference settings.
	 * @param {Number}
	 *            currency - Currency to format
	 * @returns {String} Formatted currency value
	 */
    function formatCurrency(currency) {
        if (!commons.makesure(currency)) {
            return currency;
        }
        return format({
            value: currency,
            type: formatter.Type.CURRENCY
        });
    }

    /**
	 * @desc Parse string of currency to number format. This is based on user
	 *       preference. E.g. parseCurrency('12.34') -> 12.34
	 * @param {String}
	 *            currencyString - A string of currency to be parsed
	 * @return {Number} The number value of the given currency.
	 */
    function parseCurrency(currencyString) {
        return formatter.parse({
            value: currencyString,
            type: formatter.Type.CURRENCY
        });
    }

    /**
	 * @desc Returns the value of a number rounded to the nearest number. E.g.
	 *       round(12.345) -> 12.35
	 * @param {Number}
	 *            num - A number to be rounded
	 * @return {Number} The value of the given number rounded to the nearest
	 *         number.
	 */
    function round(num, defaultValue) {
        if (!commons.makesure(num) && (defaultValue !== undefined && defaultValue !== null)) {
            return defaultValue;
        }
        return parseCurrency(formatCurrency(num));
    }

    /**
	 * @desc Rounds a number with a specified number of decimal places.
	 * @param {Number}
	 *            num
	 * @param {Number}
	 *            fixed - specified number of decimal places
	 * @return {Number} Number rounded with the specified decimal places
	 */
    function roundToFixed(num, fixed) {
        num = commons.toNumber(num);
        var sign = num >= 0 ? 1 : -1;
        var factor = Math.pow(10, fixed);
        return commons.toNumber((sign * (Math.round(Math.abs(num) * factor) / factor)).toFixed(fixed));
    }

    /**
	 * The toFixed() method formats a number using fixed-point notation. This
	 * should be equivalent to
	 * 
	 * @function{roundToFixed}.
	 * 
	 * @param {*}
	 *            num - The numeric value to be formatted.
	 * @param {Number}
	 *            digits - Optional. The number of digits to appear after the
	 *            decimal point; this may be a value between 0 and 20,
	 *            inclusive, and implementations may optionally support a larger
	 *            range of values. If this argument is omitted, it is treated as
	 *            0.
	 * @returns {Number} A string representing the given number using
	 *          fixed-point notation.
	 */
    function toFixedNumber(num, digits) {
        num = commons.toNumber(num);
        return commons.toNumber(num.toFixed(digits));
    }

    /**
	 * @desc Returns the value of a number added zero. E.g. addPerZero(.345) ->
	 *       0.35
	 * @param {Number}
	 *            num - A number added per zero
	 * @return {Number} The value of the given added per zero.
	 */
    function normalize(params) {
        if (params.num.substring(0, 1) === ".") {
            return '0' + params.num;
        } else {
            return params.num;
        }
    }

    /**
	 * Generate and return filename with prefix plus timestamp plus suffix.
	 * 
	 * @params params.prefix prefix of filename. params.suffix suffix of
	 *         filename.
	 * @returns filename with prefix plus timestamp plus suffix
	 */
    function formatFileName(params) {
        var prefix = commons.isPrimitive(params) ? params : params.prefix;
        var suffix = commons.isPrimitive(params) ? '' : params.suffix;
        var date = new Date();
        var timezoneDate = getDateWithTimeZone({
            date: date,
            timezone: runtime.getUserTimezone()
        });
        return prefix + format({
            value: timezoneDate,
            pattern: 'yyMMddhhmmss'
        }).replace(/([^a-zA-Z0-9+-]+)/gi, '') + suffix;
    }

    // convert date string, fmt is the expected date format
    function convertDateString(dateString, fmt) {
        if (dateString === null || dateString === '') {
            return '';
        }
        var dateObj = parseDate(dateString);
        return convertDate(dateObj, fmt)

    }

    function getDateWithTimeZone(params) {
        var timezoneList = {
            Asia_Hong_Kong: 'Asia/Hong_Kong'
        };
        var localTime = params.date.getTime();
        var localOffset = params.date.getTimezoneOffset() * 60000;
        var utc = localTime + localOffset;
        // when user set the timezone to Beijing, the timezone will be Hong_Kong
        if (params.timezone === timezoneList.Asia_Hong_Kong) {
            var timezoneDate = new Date(utc + 3600000 * 8);
        } else {
            var timezoneDate = params.date;
        }

        return timezoneDate;

    }

    function convertDate(dateObj, fmt) {

        var dateProp = {
            "M+": dateObj.getMonth() + 1,
            "d+": dateObj.getDate(),
            "h+": dateObj.getHours(),
            "m+": dateObj.getMinutes(),
            "s+": dateObj.getSeconds(),
            "q+": Math.floor((dateObj.getMonth() + 3) / 3),
            "S": dateObj.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (dateObj.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for ( var k in dateProp) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (dateProp[k]) : (("00" + dateProp[k]).substr(("" + dateProp[k]).length)));
            }
        }
        return fmt;
    }


    /**
	 * @deprecated format float data to fixed digit of num.
	 * 
	 * if use original number 1.005, float number is like 1.004999999 then js
	 * 1.005.toFixed(2) result is 1.00 so use tricks +-0.000000001 to deal with
	 * decimal 4/5 round issue of js.
	 * 
	 * @param num
	 *            num to fix
	 * @param digit
	 *            reserve digits
	 * @returns
	 */
    function toFixed(num, digit) {

        if (num < 0)
            return (num + 0.000000001).toFixed(digit);
        else if (num === 0)
            return num.toFixed(digit);
        else
            return (num - 0.000000001).toFixed(digit);
    }

    var wrapper = {
        parse: parse,
        parseDate: parseDate,
        parseDateTime: parseDateTime,
        format: format,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        formatFileName: formatFileName,
        getDateWithTimeZone: getDateWithTimeZone,
        convertDateString: convertDateString,
        convertDate: convertDate,
        formatCurrency: formatCurrency,
        parseCurrency: parseCurrency,
        round: round,
        roundToFixed: roundToFixed,
        toFixedNumber: toFixedNumber,
        toFixed: toFixed,
        normalize: normalize
    };

    Object.defineProperty(wrapper, 'Type', {
        enumerable: true,
        get: function() {
            return formatter.Type;
        }
    });

    Object.defineProperty(wrapper, 'Timezone', {
        enumerable: true,
        get: function() {
            return formatter.Timezone;
        }
    });

    return wrapper;

});
