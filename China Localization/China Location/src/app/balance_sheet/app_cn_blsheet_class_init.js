/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../dao/cn_class_dao',
    '../../lib/commons'
],

function(classDao, commons) {

    /**
     * @desc initialize class.
     * @param {object} [field] - class field.
     * @param {number} [defaultClassId] - class id.
     * @param {number} [subsidiaryId] - subsidiary id.
     * @param {bool} [isCreate] - initialize class from suitelet or not.
     */
    function initClass(field, defaultClassId, subsidiaryId, isCreate) {
        if (!field) {
            return;
        }

        if (!isCreate) {
            removeAllSelectOption(field);
        }
        //init LOVs
        var rs = classDao.fetchClassesAsDropDown({
            subsidiary: subsidiaryId
        });
        if (rs === null || rs === undefined || rs.length === 0)
            return null;

        //init a blank field
        if (!isCreate) {
            field.insertSelectOption({
                text: ' ',
                value: -1
            });
        } else {
            field.addSelectOption({
                text: ' ',
                value: -1
            });
        }
        var classesObj = {}
        for ( var i in rs) {
            var internalid = rs[i].value;
            var namenohierarchy = rs[i].text;

            var hasClassId = commons.makesure(defaultClassId);
            var isSelected = hasClassId ? parseInt(defaultClassId) === parseInt(internalid) : false;

            if (isSelected) {
                classesObj.id = internalid;
                classesObj.name = namenohierarchy;
            }
            if (isCreate) {
                field.addSelectOption({
                    text: namenohierarchy,
                    value: internalid,
                    isSelected: isSelected
                });
            } else {
                field.insertSelectOption({
                    text: namenohierarchy,
                    value: internalid
                });
            }
        }
        return classesObj;
    }

    /**
     *@desc remove all select option.
     *@param {object} [field] - select field.
     */
    function removeAllSelectOption(field) {
        field.removeSelectOption({
            value: null
        });
    }

    return {
        initClass: initClass
    };

});
