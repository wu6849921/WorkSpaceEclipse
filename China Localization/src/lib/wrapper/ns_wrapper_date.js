/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    './ns_wrapper_runtime',
    '../commons',
    '../../lib/wrapper/ns_wrapper_format',
    '../../../lib/date-zh-CN',
    'N/error'
],
/**
 * This module is used to cope with JS date and NetSuite configurations.
 *
 * @param {runtime} runtime
 * @param {commons} commons
 * @param {format} format
 * @param {date} date
 * @param {error} error
 */
function(runtime, commons, format, date, error) {

    var timezones = {
        "ETC_GMT_PLUS_12":	{"name": "Etc/GMT+12",	"offset": "-12" },
        "PACIFIC_SAMOA":	{"name": "Pacific/Samoa",	"offset": "-11" },
        "PACIFIC_HONOLULU":	{"name": "Pacific/Honolulu",	"offset": "-10" },
        "AMERICA_ANCHORAGE":	{"name": "America/Anchorage",	"offset": "-9" },
        "AMERICA_LOS_ANGELES":	{"name": "America/Los_Angeles",	"offset": "-8" },
        "AMERICA_TIJUANA":	{"name": "America/Tijuana",	"offset": "-8" },
        "AMERICA_DENVER":	{"name": "America/Denver",	"offset": "-7" },
        "AMERICA_PHOENIX":	{"name": "America/Phoenix",	"offset": "-7" },
        "AMERICA_CHIHUAHUA":	{"name": "America/Chihuahua",	"offset": "-7" },
        "AMERICA_CHICAGO":	{"name": "America/Chicago",	"offset": "-6" },
        "AMERICA_REGINA":	{"name": "America/Regina",	"offset": "-6" },
        "AMERICA_GUATEMALA":	{"name": "America/Guatemala",	"offset": "-6" },
        "AMERICA_MEXICO_CITY":	{"name": "America/Mexico_City",	"offset": "-6" },
        "AMERICA_NEW_YORK":	{"name": "America/New_York",	"offset": "-5" },
        "US_EAST_INDIANA":	{"name": "US/East-Indiana",	"offset": "-5" },
        "AMERICA_BOGOTA":	{"name": "America/Bogota",	"offset": "-5" },
        "AMERICA_CARACAS":	{"name": "America/Caracas",	"offset": "-4.5" },
        "AMERICA_HALIFAX":	{"name": "America/Halifax",	"offset": "-4" },
        "AMERICA_LA_PAZ":	{"name": "America/La_Paz",	"offset": "-4" },
        "AMERICA_MANAUS":	{"name": "America/Manaus",	"offset": "-4" },
        "AMERICA_SANTIAGO":	{"name": "America/Santiago",	"offset": "-4" },
        "AMERICA_ST_JOHNS":	{"name": "America/St_Johns",	"offset": "-3.5" },
        "AMERICA_SAO_PAULO":	{"name": "America/Sao_Paulo",	"offset": "-3" },
        "AMERICA_BUENOS_AIRES":	{"name": "America/Buenos_Aires",	"offset": "-3" },
        "ETC_GMT_PLUS_3":	{"name": "Etc/GMT+3",	"offset": "-3" },
        "AMERICA_GODTHAB":	{"name": "America/Godthab",	"offset": "-3" },
        "AMERICA_MONTEVIDEO":	{"name": "America/Montevideo",	"offset": "-3" },
        "AMERICA_NORONHA":	{"name": "America/Noronha",	"offset": "-2" },
        "ETC_GMT_PLUS_1":	{"name": "Etc/GMT+1",	"offset": "-1" },
        "ATLANTIC_AZORES":	{"name": "Atlantic/Azores",	"offset": "-1" },
        "EUROPE_LONDON":	{"name": "Europe/London",	"offset": "0" },
        "GMT":	{"name": "GMT",	"offset": "0" },
        "ATLANTIC_REYKJAVIK":	{"name": "Atlantic/Reykjavik",	"offset": "0" },
        "EUROPE_WARSAW":	{"name": "Europe/Warsaw",	"offset": "1" },
        "EUROPE_PARIS":	{"name": "Europe/Paris",	"offset": "1" },
        "ETC_GMT_MINUS_1":	{"name": "Etc/GMT-1",	"offset": "1" },
        "EUROPE_AMSTERDAM":	{"name": "Europe/Amsterdam",	"offset": "1" },
        "EUROPE_BUDAPEST":	{"name": "Europe/Budapest",	"offset": "1" },
        "AFRICA_CAIRO":	{"name": "Africa/Cairo",	"offset": "2" },
        "EUROPE_ISTANBUL":	{"name": "Europe/Istanbul",	"offset": "2" },
        "ASIA_JERUSALEM":	{"name": "Asia/Jerusalem",	"offset": "2" },
        "ASIA_AMMAN":	{"name": "Asia/Amman",	"offset": "2" },
        "ASIA_BEIRUT":	{"name": "Asia/Beirut",	"offset": "2" },
        "AFRICA_JOHANNESBURG":	{"name": "Africa/Johannesburg",	"offset": "2" },
        "EUROPE_KIEV":	{"name": "Europe/Kiev",	"offset": "2" },
        "EUROPE_MINSK":	{"name": "Europe/Minsk",	"offset": "2" },
        "AFRICA_WINDHOEK":	{"name": "Africa/Windhoek",	"offset": "2" },
        "ASIA_RIYADH":	{"name": "Asia/Riyadh",	"offset": "3" },
        "EUROPE_MOSCOW":	{"name": "Europe/Moscow",	"offset": "3" },
        "ASIA_BAGHDAD":	{"name": "Asia/Baghdad",	"offset": "3" },
        "AFRICA_NAIROBI":	{"name": "Africa/Nairobi",	"offset": "3" },
        "ASIA_TEHRAN":	{"name": "Asia/Tehran",	"offset": "3.5" },
        "ASIA_MUSCAT":	{"name": "Asia/Muscat",	"offset": "4" },
        "ASIA_BAKU":	{"name": "Asia/Baku",	"offset": "4" },
        "ASIA_YEREVAN":	{"name": "Asia/Yerevan",	"offset": "4" },
        "ETC_GMT_MINUS_3":	{"name": "Etc/GMT-3",	"offset": "4" },
        "ASIA_KABUL":	{"name": "Asia/Kabul",	"offset": "4.5" },
        "ASIA_KARACHI":	{"name": "Asia/Karachi",	"offset": "5" },
        "ASIA_YEKATERINBURG":	{"name": "Asia/Yekaterinburg",	"offset": "5" },
        "ASIA_TASHKENT":	{"name": "Asia/Tashkent",	"offset": "5" },
        "ASIA_CALCUTTA":	{"name": "Asia/Calcutta",	"offset": "5.5" },
        "ASIA_KATMANDU":	{"name": "Asia/Katmandu",	"offset": "5.75" },
        "ASIA_ALMATY":	{"name": "Asia/Almaty",	"offset": "6" },
        "ASIA_DHAKA":	{"name": "Asia/Dhaka",	"offset": "6" },
        "ASIA_RANGOON":	{"name": "Asia/Rangoon",	"offset": "6.5" },
        "ASIA_BANGKOK":	{"name": "Asia/Bangkok",	"offset": "7" },
        "ASIA_KRASNOYARSK":	{"name": "Asia/Krasnoyarsk",	"offset": "7" },
        "ASIA_HONG_KONG":	{"name": "Asia/Hong_Kong",	"offset": "8" },
        "ASIA_KUALA_LUMPUR":	{"name": "Asia/Kuala_Lumpur",	"offset": "8" },
        "ASIA_TAIPEI":	{"name": "Asia/Taipei",	"offset": "8" },
        "AUSTRALIA_PERTH":	{"name": "Australia/Perth",	"offset": "8" },
        "ASIA_IRKUTSK":	{"name": "Asia/Irkutsk",	"offset": "8" },
        "ASIA_MANILA":	{"name": "Asia/Manila",	"offset": "8" },
        "ASIA_SEOUL":	{"name": "Asia/Seoul",	"offset": "9" },
        "ASIA_TOKYO":	{"name": "Asia/Tokyo",	"offset": "9" },
        "ASIA_YAKUTSK":	{"name": "Asia/Yakutsk",	"offset": "9" },
        "AUSTRALIA_DARWIN":	{"name": "Australia/Darwin",	"offset": "9.5" },
        "AUSTRALIA_ADELAIDE":	{"name": "Australia/Adelaide",	"offset": "9.5" },
        "AUSTRALIA_SYDNEY":	{"name": "Australia/Sydney",	"offset": "10" },
        "AUSTRALIA_BRISBANE":	{"name": "Australia/Brisbane",	"offset": "10" },
        "AUSTRALIA_HOBART":	{"name": "Australia/Hobart",	"offset": "10" },
        "PACIFIC_GUAM":	{"name": "Pacific/Guam",	"offset": "10" },
        "ASIA_VLADIVOSTOK":	{"name": "Asia/Vladivostok",	"offset": "10" },
        "ASIA_MAGADAN":	{"name": "Asia/Magadan",	"offset": "11" },
        "PACIFIC_KWAJALEIN":	{"name": "Pacific/Kwajalein",	"offset": "12" },
        "PACIFIC_AUCKLAND":	{"name": "Pacific/Auckland",	"offset": "12" },
        "PACIFIC_TONGATAPU":	{"name": "Pacific/Tongatapu",	"offset": "13" }

    };

    function dateInTZ(params) {
        if (!commons.makesureall(params, 'date')) {
            throw error.create({
                name: 'CustomScriptError',
                message: 'date is undefined',
                notifyOff: true
            });
        }

        var timezoneDate = params.date;
        var utc = timezoneDate.getTime();
        var timezone;

        if(commons.makesure(params.timezone)){
            timezone = params.timezone;
        } else {
            timezone = runtime.getUserTimezone();
        }

        for (var item in timezones) {
            if (timezones[item].name === timezone) {
                timezoneDate = new Date(utc + 3600000 * timezones[item].offset);
                break;
            }
        }

        return timezoneDate;
    }

    function lastDayOfMonth(){
        var lastDay  = dateInTZ({date: Date.now(), timezone: runtime.getUserTimezone()}).moveToLastDayOfMonth();
        return format.formatDate(lastDay);
    }

    function firstDayOfMonth(){
        var firstDay = dateInTZ({date: Date.now(), timezone: runtime.getUserTimezone()}).moveToFirstDayOfMonth();
        return format.formatDate(firstDay);
    }

    var wrapper = {
        dateInTZ : dateInTZ,
        firstDayOfMonth : firstDayOfMonth,
        lastDayOfMonth : lastDayOfMonth
    };

    return wrapper;
});