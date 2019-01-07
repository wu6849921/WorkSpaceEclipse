/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../lib/commons',
    '../../res/vat/vatresource-client'
],

function(commons, resource) {

    var labels = resource.load(resource.Name.Labels);

    function hideButtonRowAndAddRow() {
        var buttonRow = document.getElementsByClassName("uir-machine-button-row");
        if (buttonRow !== null && buttonRow !== undefined) {
            for (var i = 0; i < buttonRow.length; i++) {
                buttonRow[i].style.display = 'none';
            }
        }

        var addOddRow = document.getElementsByClassName("uir-machine-row uir-machine-row-odd listtextnonedit");
        if (addOddRow !== null && addOddRow !== undefined) {
            for (var i = 0; i < addOddRow.length; i++) {
                addOddRow[i].style.display = 'none';
            }

        }
        var addEvenRow = document.getElementsByClassName("uir-machine-row uir-machine-row-even listtextnonedit");
        if (addEvenRow !== null && addEvenRow !== undefined) {
            for (var i = 0; i < addEvenRow.length; i++) {
                addEvenRow[i].style.display = 'none';
            }
        }
    }

    function reRenderTableHeader() {
        var tableHeader = NS.jQuery('#custpage_header_sublist_headerrow td');
        tableHeader.eq(0).css({
            'width': '3%'
        });
        tableHeader.eq(0).attr("noWrap", true);
        tableHeader.eq(5).css({
            'width': '3%'
        });
        tableHeader.eq(5).attr("noWrap", true);
        tableHeader.eq(3).css({
            'width': '7%'
        });
        tableHeader.eq(3).attr("noWrap", true);
        tableHeader.eq(6).css({
            'width': '4%'
        });
        tableHeader.eq(6).attr("noWrap", true);
    }

    function reRenderLines(params) {
        renderIndentedLines(params.indentedLines);
        renderHiddenLines(params.hiddenLines);
        renderCollapsedLines(params.collapsedLines);
        renderExpandedLines(params.expandedLines);
    }

    function renderIndentedLines(indentedLines) {
        for (var i = 0; i < indentedLines.length; i++) {
            var indentedRow = NS.jQuery(' #custpage_header_sublist_row_' + (indentedLines[i] + 1));
            var cells = indentedRow.children('td');
            cells.eq(0).html('&nbsp;');
            cells.eq(1).html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + cells.eq(1).text().trim());
        }
    }

    function renderHiddenLines(hiddenLines) {
        for (var i = 0; i < hiddenLines.length; i++) {
            NS.jQuery(' #custpage_header_sublist_row_' + (hiddenLines[i] + 1)).hide();
        }
    }

    function renderCollapsedLines(collapsedLines) {
        for (var i = 0; i < collapsedLines.length; i++) {
            var line = collapsedLines[i] + 1;
            var row = NS.jQuery(' #custpage_header_sublist_row_' + line);
            var cells = row.children('td');
            cells.eq(1).html('<img src="/images/forms/plus.svg" />&nbsp;' + cells.eq(1).text());
            renderCheckbox(line, isLineSelected(collapsedLines[i]));
        }
    }

    function renderExpandedLines(expandedLines) {
        for (var i = 0; i < expandedLines.length; i++) {
            var line = expandedLines[i] + 1;
            var row = NS.jQuery(' #custpage_header_sublist_row_' + line);
            var cells = row.children('td');
            cells.eq(1).html('<img src="/images/forms/minus.svg" />&nbsp;' + cells.eq(1).text());
            renderCheckbox(line, isLineSelected(expandedLines[i]));
        }
    }

    function renderCheckboxes(form, selectedLines) {
        var lineCount = form.getLineCount({
            sublistId: 'custpage_header_sublist'
        });
        for (var i = 0; i < lineCount; i++) {
            var checked = commons.makesure(selectedLines) && selectedLines.indexOf(i) >= 0;
            var status = form.getSublistValue({
                sublistId: 'custpage_header_sublist',
                fieldId: 'custpage_status',
                line: i
            });
            var hidden = commons.ensure(status) && status === labels.Split;
            renderCheckbox(i + 1, checked, hidden);
        }
    }

    function renderCheckbox(line, checked, hidden) {
        var row = NS.jQuery(' #custpage_header_sublist_row_' + line);
        var cells = row.children('td');

        if (commons.ensure(hidden)) {
            cells.eq(0).html('&nbsp;');
        } else {
            var checkBoxId = 'custpage_applied_' + line;
            var innerHtml = "<input type='checkbox' id='" + checkBoxId + "' class='checkbox' ";
            innerHtml += checked ? "checked " : "";
            innerHtml += "onchange='NLCheckboxOnChange(this);' onkeypress='NLCheckboxOnKeyPress(event); return true;' onclick='setEventCancelBubble(event);'/> ";
            cells.eq(0).html(innerHtml);
        }
    }

    function renderButtonToCheckbox(elementId, label, isChecked) {
        var innerHtml = "<input type='checkbox' id='" + elementId + "' class='checkbox' ";
        if (commons.ensure(isChecked) || isElementChecked(elementId)) {
            innerHtml += 'checked ';
        }
        innerHtml += "onchange='NLCheckboxOnChange(this);' onkeypress='NLCheckboxOnKeyPress(event); return true;' onclick='setEventCancelBubble(event);'/>" + label;
        NS.jQuery('#tr_' + elementId).removeClass('tabBnt');
        NS.jQuery('#tdbody_' + elementId).html(innerHtml);
    }

    function rewindLines(lineCount) {
        for (var i = 1; i <= lineCount; i++) {
            NS.jQuery(' #custpage_header_sublist_row_' + i).show();
        }
    }

    function isLineSelected(line) {
        return isElementChecked('custpage_applied_' + (line + 1));
    }

    function isElementChecked(elementId) {
        return NS.jQuery('#' + elementId).is(':checked');
    }

    return {
        hideButtonRowAndAddRow: hideButtonRowAndAddRow,
        reRenderTableHeader: reRenderTableHeader,
        reRenderLines: reRenderLines,
        isLineSelected: isLineSelected,
        renderCheckboxes: renderCheckboxes,
        rewindLines: rewindLines,
        renderButtonToCheckbox: renderButtonToCheckbox,
        isElementChecked: isElementChecked
    };

});
