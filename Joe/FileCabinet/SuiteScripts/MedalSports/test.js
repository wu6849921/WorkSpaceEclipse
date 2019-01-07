// ==UserScript==
// @name NetSuite Floating Headers
// @version 0.2
// @description Float item sublist header on scroll
// @match https://*.netsuite.com/*
// grant none
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function ($, undefined) {
$(function () {
const windowHeight = $(window).height();

$('.uir-machine-table-container')
.filter((index, elem) => $(elem).height() > windowHeight)
.css('height', '70vh')
.bind('scroll', (event) => {
const headerElem = $(event.target).find('.uir-machine-headerrow');
headerElem.css('transform', translate(0, ${event.target.scrollTop}px));
});
});
})(window.jQuery.noConflict(true));