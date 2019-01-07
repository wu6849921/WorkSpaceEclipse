/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../dao/cn_subsidiary_dao',
    '../../lib/commons',
],

function(subsidiaryDao, commons) {
    function initSubsidiary(field, subsidiaryId) {
        var rs = subsidiaryDao.fetchAllChinaSubsidiaries();
        var selectedSubsidiary = {};
        if (rs == null)
            return selectedSubsidiary;

        for ( var i in rs) {
            var id = rs[i].id;
            if (i === '0') {
                selectedSubsidiary.id = rs[i].id;
                selectedSubsidiary.name = rs[i].name;
            }

            var hasSubId = commons.makesure(subsidiaryId);
            var isSelected = hasSubId
                ? subsidiaryId === id : i === '0';
            if (isSelected) {
                selectedSubsidiary.id = id;
            }
            field.addSelectOption({
                text: rs[i].name,
                value: id,
                isSelected: isSelected
            });
        }
        return selectedSubsidiary;
    }

    return {
        initSubsidiary: initSubsidiary
    };

});
