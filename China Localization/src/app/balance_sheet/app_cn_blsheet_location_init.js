/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../dao/cn_location_dao',
    '../../lib/commons'
],

function(locationDao, commons) {

    /**
     * @desc initialize location.
     * @param {object} [field] - location field.
     * @param {number} [defaultLocationId] - location id.
     * @param {number} [subsidiaryId] - subsidiary id.
     * @param {bool} [isCreate] - initialize location from suitelet or not.
     */
    function initLocation(field, defaultLocationId, subsidiaryId, isCreate) {
        if (!field) {
            return;
        }

        if (!isCreate) {
            removeAllSelectOption(field);
        }
        //init LOVs
        var rs = locationDao.fetchLocationsAsDropDown({
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

        var locationObj = {};

        for ( var i in rs) {
            var internalid = rs[i].value;
            var namenohierarchy = rs[i].text;
            
            var hasLocationId = commons.makesure(defaultLocationId);
            var isSelected = hasLocationId ? parseInt(defaultLocationId) === parseInt(internalid) : false;

            if (isSelected) {
                locationObj.id = internalid;
                locationObj.name = namenohierarchy;
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
        return locationObj;
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
        initLocation: initLocation
    };

});
