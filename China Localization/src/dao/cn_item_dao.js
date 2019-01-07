define([
    '../lib/wrapper/ns_wrapper_search',
    '../lib/wrapper/ns_wrapper_runtime',
    './helper/search_helper',
    '../lib/commons'
],

function(search, runtime, helper, commons) {

    /**
     * @desc fetch items by parameters.
     * @param {object} [params] - parameters.
     * @return item list.
     */

    function getItemsByIds(ids) {
        var itemSearch = search.load({
            id: 'customsearch_cn_item_currency_search'
        });

        itemSearch.filters = filters(ids);

        addPricingCurrencyFieldColumns(itemSearch);

        var items = helper.resultset({
            resultset: itemSearch.run(),
            start: 0,
            end: 10000
        });


        return items;
    }


    /**
     * @desc create filters by parameters.
     * @param {object} [params] - parameters.
     * @return {array} - filters.
     */
    function filters(ids) {
        var filters = [
        //            helper.filter('isinactive').is('F')
        ];
        if (!commons.makesure(ids)) {
            return filters;
        }
        if (commons.makesure(ids)) {
            filters.push(helper.filter('internalid').anyof(ids));
        }


        return filters;
    }

    /**
     * @desc add Amount Foreign field columns for vat search.
     * @param [vatSearch] - vat search.
     * @return column list.
     */
    function addPricingCurrencyFieldColumns(itemSearch) {
        var columns = itemSearch.columns;

        columns.push(helper.column('unitprice').reference('pricing').create());

        if (runtime.isFeatureInEffect('QUANTITYPRICING')) {
            columns.push(helper.column('minimumquantity').reference('pricing').create());
        }

        if (runtime.isFeatureInEffect('MULTPRICE')) {
            columns.push(helper.column('pricelevel').reference('pricing').create());
        }

        return columns;
    }

    return {
        getItemsByIds: getItemsByIds
    };

});
