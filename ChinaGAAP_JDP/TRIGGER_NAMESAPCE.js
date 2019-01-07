/**
 * Module Description javascript namespace register Version Date Author Remarks
 * 1.00 10 NOV 2014 Winson.Chen
 * 
 * example: triggernamespace("trigger.class.play");
 */

function triggernamespace(ns) {
	if (typeof (ns) != 'string')
		return;
	ns = ns.split(".");
	var o, ni;
	for (var i = 0, len = ns.length; i < len, ni = ns[i]; i++) {
		try {
			o = (o ? (o[ni] = o[ni] || {}) : (eval(ni + '=' + ni + '||{};')));
		} catch (e) {
			o = eval(ni + '={};');
		}
	}
}
