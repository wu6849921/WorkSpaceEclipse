/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    './app_cn_blsheet_subsidiary',
    '../../lib/commons',

],

function(subsidiaryDao, commons) {

    /**
     * @desc initialize subsidiary by provide information.
     * @param {object} [field] - subsidiary field.
     * @param {number} [subsidiaryId] -subsidiary id.
     * @param {number} [bookId] - book id.
     * @param {bool} [isCreate] - initialize subsidiary from suitelet or not.
     * @return {object} - selected subsidiary.
     * 
     */
    function initSubsidiary(field, subsidiaryId, bookId, isCreate) {
        var rs = subsidiaryDao.fetchAllSubsidiaries();
        if (subsidiaryId !== null)
            var subsidiaryId = parseInt(subsidiaryId);
        //it will delete all select option when the book id is changed
        if (!isCreate) {
            for ( var i in rs) {
                var id = rs[i].id;
                field.removeSelectOption({
                    value: id
                });
            }
        }
        var selectedSubsidiary = {};
        if (rs == null)
            return selectedSubsidiary;

        for (var idx = 0; idx < rs.length; idx++) {

            var subId = rs[idx].id;
            var subsidiaryNamenoHierarchy = rs[idx].getValue('namenohierarchy');
            var subsidiaryName = rs[idx].getValue('name');
            var count = subsidiaryName.match(/ : /g) == null
                ? 0 : subsidiaryName.match(/ : /g).length;
            for (var leadingSpaces = '', j = 0; j < count; ++j)
                leadingSpaces += '&nbsp;&nbsp;&nbsp;';

            var hasSubId = commons.makesure(subsidiaryId);
            var isSelected = hasSubId
                ? subsidiaryId === parseInt(subId) : idx === 0;
            if (isSelected) {
                selectedSubsidiary.id = subId;
                selectedSubsidiary.name = subsidiaryNamenoHierarchy;
            }
            if (isCreate) {
                field.addSelectOption({
                    text: leadingSpaces + subsidiaryNamenoHierarchy,
                    value: subId,
                    isSelected: isSelected
                });
            } else {
                field.insertSelectOption({
                    text: leadingSpaces + subsidiaryNamenoHierarchy,
                    value: subId
                });
            }

        }
        return selectedSubsidiary;
    }

    return {
        initSubsidiary: initSubsidiary
    };

});
