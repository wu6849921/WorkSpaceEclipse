/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */

define([
    'N/task'
],
/**
 * @param {task} task
 */
function(task) {

    function create(options) {
        return task.create(options);
    }

    function checkStatus(options) {
        return task.checkStatus(options);
    }

    var wrapper = {
        create: create,
        checkStatus: checkStatus
    };

    Object.defineProperty(wrapper, 'Type', {
        enumerable: true,
        get: function() {
            return task.TaskType;
        }
    });

    Object.defineProperty(wrapper, 'TaskStatus', {
        enumerable: true,
        get: function() {
            return task.TaskStatus;
        }
    });

    return wrapper;
});
