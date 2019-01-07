/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope Public
 */

define([
    '../../lib/commons'
],

function (commons) {

    function resolve(accountProps, resolver) {
        var name = accountProps.name;
        var number = accountProps.number;
        resolver = makesure(resolver);

        if (!commons.ensure(number) || !commons.ensure(name) || !commons.includes(name, number)) {
            return {number: number, name: resolver(name)};
        }

        name = resolver(name.slice(name.indexOf(number) + number.length + 1).trim());

        return {number: number, name: name};
    }

    function nameNoHierarchy(name) {
        if (!commons.makesure(name)) {
            return name;
        }

        var lastIndex = name.lastIndexOf(':');
        return lastIndex >= 0 ? name.slice(lastIndex + 1).trim() : name;
    }

    function makesure(resolver) {
        if (commons.makesure(resolver)) {
            return resolver;
        } else {
            return function (value) {
                return value;
            }
        }
    }

    return {
        resolve: resolve,
        nameNoHierarchy: nameNoHierarchy
    }
});
