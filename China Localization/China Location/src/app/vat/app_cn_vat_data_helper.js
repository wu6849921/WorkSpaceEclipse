/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    '../../lib/commons',
    '../../lib/wrapper/ns_wrapper_format',
    '../../constant/constant_cn_vat'
],

function(commons, formatter, consts) {

    function getItemsByIdentitiy(identity) {
        if (!commons.makesure(identity)) {
            return [];
        }
        for (var i = 0; i < this.data.invoices.length; i++) {
            var tran = this.data.invoices[i];
            if (id({transaction: tran}) === identity && isValid(tran)) {
                return tran.items;
            }
            if (commons.makesure(tran.children)) {
                for (var j = 0; j < tran.children.length; j++) {
                    var child = tran.children[j];
                    if (id({transaction: child}) === identity && isValid(child)) {
                        return child.items;
                    }
                }
            }
        }
        return [];
    }

    function getItemFieldValuesForSalesByIdentity(identity) {
        if (!commons.makesure(identity)) {
            return;
        }
        for (var i = 0; i < this.data.invoices.length; i++) {
            var tran = this.data.invoices[i];
            if (id({transaction: tran}) === identity && isValid(tran)) {
                var totalTaxExclusiveAmount = calculateTotalTaxExclusiveAmount(tran.items);
                var totalDiscountAmount = calculateTotalDiscountAmount(tran.items);
                return {
                    'itemnameforsales': tran.itemnameforsales,
                    'totalTaxExclusiveAmount': totalTaxExclusiveAmount,
                    'totalDiscountAmount': totalDiscountAmount
                };
            }
            if (commons.makesure(tran.children)) {
                for (var j = 0; j < tran.children.length; j++) {
                    var child = tran.children[j];
                    if (id({transaction: child}) === identity && isValid(child)) {
                        totalTaxExclusiveAmount = calculateTotalTaxExclusiveAmount(child.items);
                        totalDiscountAmount = calculateTotalDiscountAmount(child.items);
                        return {
                            'itemnameforsales': child.itemnameforsales,
                            'totalTaxExclusiveAmount': totalTaxExclusiveAmount,
                            'totalDiscountAmount': totalDiscountAmount
                        };
                    }
                }
            }
        }
    }

    function isSalesListEffective(identity) {
        var itemForsales = this.getItemFieldValuesForSalesByIdentity(identity);
        return commons.makesureall(itemForsales, 'itemnameforsales');
    }

    function calculateTotalTaxExclusiveAmount(items) {
        var totalTaxExclusiveAmount = 0.00;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            totalTaxExclusiveAmount += commons.toNumber(item.taxexclusiveamt);
        }
        return formatter.round(totalTaxExclusiveAmount);
    }

    function calculateTotalDiscountAmount(items) {
        var totalDiscountAmount = 0.00;
        var hasDiscountAmount = false;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (commons.makesure(item.discountamt)) {
                totalDiscountAmount += formatter.round(commons.toNumber(item.discountamt));
                hasDiscountAmount = true;
            }
        }
        if (!hasDiscountAmount) {
            totalDiscountAmount = '';
        }
        return totalDiscountAmount;
    }

    function getItemsFromTransactions(trans) {
        if (!commons.makesure(trans)) {
            return [];
        }
        var items = [];
        for (var i = 0; i < trans.length; i++) {
            items = items.concat(commons.clone(trans[i].items, true));
        }
        return items;
    }

    function groupSameItems(items) {
        var groupedItems = collectGroupedItems(items);
        var theItems = [];
        for (var i = 0; i < groupedItems.length; i++) {
            var sameItems = groupedItems[i];
            var taxExclusiveAmt = 0, quantity = 0, taxAmt = 0, discountTaxAmt = 0, discountAmt = 0;
            for (var j = 0; j < sameItems.length; j++) {
                taxExclusiveAmt += commons.toNormalizedNumber(sameItems[j].taxexclusiveamt);
                quantity += commons.toNormalizedNumber(sameItems[j].quantity);
                taxAmt += commons.toNormalizedNumber(sameItems[j].taxamt);
                discountTaxAmt += commons.toNormalizedNumber(sameItems[j].discounttaxamt);
                discountAmt += commons.toNormalizedNumber(sameItems[j].discountamt);
            }
            if (!commons.ensure(formatter.round(taxExclusiveAmt))) { // filter out which amount is 0
                continue;
            }
            theItems.push({
                rawiteminternalid: sameItems[0].rawiteminternalid,
                itemtype: sameItems[0].itemtype,
                line: sameItems.length,
                name: sameItems[0].name,
                model: sameItems[0].model,
                taxexclusiveamt: formatter.round(taxExclusiveAmt),
                uom: sameItems[0].uom,
                quantity: isShippingHandlingItem(sameItems[0]) ? getShippingHandlingItemQuantity(items) : formatter.roundToFixed(quantity, 6),
                taxrate: sameItems[0].taxrate,
                pricelevel: sameItems[0].pricelevel,
                taxdenom: sameItems[0].taxdenom,
                taxamt: commons.ensure(taxAmt) ? formatter.round(taxAmt) : '',
                discounttaxamt: commons.ensure(discountTaxAmt) ? formatter.round(discountTaxAmt) : '',
                discountrate: sameItems[0].discountrate,
                unitprice: isShippingHandlingItem(sameItems[0]) ? formatter.roundToFixed(taxExclusiveAmt / getShippingHandlingItemQuantity(items), 6) : sameItems[0].unitprice,
                pricemethod: sameItems[0].pricemethod,
                baseprice: isShippingHandlingItem(sameItems[0]) ? formatter.round(taxExclusiveAmt / getShippingHandlingItemQuantity(items)) : sameItems[0].baseprice,
                discountamt: commons.ensure(discountAmt) ? formatter.round(discountAmt) : ''
            });
        }
        return theItems;
    }

    function collectGroupedItems(items) {
        var groupedItems = [];
        for (var i = 0; i < items.length; i++) {
            if (containTheItem(groupedItems, items[i])) {
                continue;
            }
            var sameItems = [items[i]];
            for (var j = i + 1; j < items.length; j++) {
                if (isSameItem(items[i], items[j])) {
                    sameItems.push(items[j]);
                }
            }
            groupedItems.push(sameItems);
        }
        return groupedItems;
    }

    function containTheItem(groupedItems, item) {
        for (var i = 0; i < groupedItems.length; i++) {
            var sameItems = groupedItems[i];
            if (isSameItem(sameItems[0], item)) {
                return true;
            }
        }
        return false;
    }

    function isSameItem(one, another) {
        if (one.itemtype !== another.itemtype) {
            return false;
        }
        if (commons.toNormalizedNumber(one.taxrate) !== commons.toNormalizedNumber(another.taxrate)) {
            return false;
        }
        if (!isShippingHandlingItem(one)) {
            if (id({item: one}) !== id({item: another})) {
                return false;
            }
            if (commons.toNormalizedNumber(one.unitprice) !== commons.toNormalizedNumber(another.unitprice)) {
                return false;
            }
            if (commons.ensure(one.quantity)) {
                var oneUnitDiscount = formatter.round(commons.toNormalizedNumber(one.discountamt) / commons.toNormalizedNumber(one.quantity));
            } else {
                oneUnitDiscount = null; // if quantity is 0
            }
            if (commons.ensure(another.quantity)) {
                var anotherUnitDiscount = formatter.round(commons.toNormalizedNumber(another.discountamt) / commons.toNormalizedNumber(another.quantity));
            } else {
                anotherUnitDiscount = null;
            }
            if (oneUnitDiscount !== anotherUnitDiscount) {
                return false;
            }
        } else if (one.name !== another.name) {
            return false;
        }
        return true;
    }

    function isShippingHandlingItem(item) {
        return item.itemtype === 'ShipItem';
    }

    function getShippingHandlingItemQuantity(items) {
        var negativeCount = 0;
        for (var i = 0; i < items.length; i++) {
            if (commons.makesure(items[i].taxexclusiveamt) && commons.toNumber(items[i].taxexclusiveamt) <= 0) {
                negativeCount ++;
            }
        }
        if (negativeCount === items.length) { // group negative trans
            return consts.SHIPPING_HANDLING_ITEM_QUANTITY.NEGATIVE;
        }
        return consts.SHIPPING_HANDLING_ITEM_QUANTITY.POSITIVE;
    }

    function getTransactionByIdentity(identity) {
        if (!commons.makesure(identity)) {
            return;
        }
        for (var i = 0; i < this.data.invoices.length; i++) {
            var tran = this.data.invoices[i];
            if (id({transaction: tran}) === identity && isValid(tran)) {
                return tran;
            }
            if (commons.makesure(tran.children)) {
                for (var j = 0; j < tran.children.length; j++) {
                    var child = tran.children[j];
                    if (id({transaction: child}) === identity && isValid(child)) {
                        return child;
                    }
                }
            }
        }
    }

    function isValid(tran) {
        return commons.makesure(tran) && tran.rec_status !== 'delete';
    }

    function deleteTransactionByIds(internalids) {
        if (!commons.makesure(internalids)) {
            return [];
        }
        var deleted = [];
        for (var i = 0; i < this.data.invoices.length; i++) {
            var tran = this.data.invoices[i];
            if (commons.contains(internalids, id({transaction: tran}))) {
                deleted.push(tran);
            }
        }
        for (var j = 0; j < deleted.length; j++) {
            commons.remove(this.data.invoices, deleted[j]);
        }
        return deleted;
    }

    function addTransactions(trans) {
        if (!commons.makesure(trans)) {
            return;
        }
        for (var i = 0; i < trans.length; i++) {
            this.data.invoices.push(trans[i]);
        }
    }

    function id(params) {
        if (commons.makesure(params.transaction)) {
            var tran = params.transaction;
            if (commons.makesure(tran.rawtraninternalid)) {
                return tran.rawtraninternalid;
            } else if (commons.makesure(tran.internalid)) {
                return tran.internalid;
            } else {
                return tran.docno;
            }
        } else if (commons.makesure(params.line)) {
            var internalId = params.form.getSublistValue({
                sublistId: 'custpage_header_sublist',
                fieldId: 'custpage_internalid',
                line: params.line
            });
            if (commons.makesure(internalId)) {
                return internalId;
            } else {
                return params.form.getSublistValue({
                    sublistId: 'custpage_header_sublist',
                    fieldId: 'custpage_doc_number',
                    line: params.line
                });
            }
        } else if (commons.makesure(params.item)) {
            var item = params.item;
            if (commons.makesure(item.rawiteminternalid)) {
                return item.rawiteminternalid;
            } else if (commons.makesure(item.internalid)) {
                return item.internalid;
            }
        } else {
            internalId = params.form.getCurrentSublistValue({
                sublistId: 'custpage_header_sublist',
                fieldId: 'custpage_internalid'
            });
            if (commons.makesure(internalId)) {
                return internalId;
            } else {
                return params.form.getCurrentSublistValue({
                    sublistId: 'custpage_header_sublist',
                    fieldId: 'custpage_doc_number'
                });
            }
        }
    }

    function data(data) {
        return {
            data: data,
            isSalesListEffective: isSalesListEffective,
            getItemsByIdentity: getItemsByIdentitiy,
            getItemFieldValuesForSalesByIdentity: getItemFieldValuesForSalesByIdentity,
            getItemsFromTransactions: getItemsFromTransactions,
            getTransactionByIdentity: getTransactionByIdentity,
            deleteTransactionByIds: deleteTransactionByIds,
            addTransactions: addTransactions,
            isSameItem: isSameItem,
            groupSameItems: groupSameItems
        }
    }

    return {
        data: data,
        id: id
    };

});
