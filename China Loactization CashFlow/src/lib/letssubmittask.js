/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */

define([
    './commons',
    '../dao/helper/search_helper',
    './wrapper/ns_wrapper_task',
    './wrapper/ns_wrapper_record',
    './wrapper/ns_wrapper_search',
    '../constant/const_cn_cashflow',
    'N/runtime'
],

function(commons, helper, task, record, search, consts, runtime) {

    function queryDeployment(params) {
        params.type = search.Type.SCRIPT_DEPLOYMENT;
        params.wanted = [
            helper.column('internalid').create()
        ];
        return query(params);
    }

    function queryScheduledInstance(params) {
        params.type = search.Type.SCHEDULED_SCRIPT_INSTANCE;
        params.wanted = [
            helper.column('internalid').reference('scriptDeployment').create()
        ];
        return query(params);
    }

    function query(params) {
        var results = helper.resultset(search.create({
            type: params.type,
            filters: filters(params),
            columns: columns(params)
        }).run());
        log.debug('LetssubmittaskJS: results', results);
        return results;
    }

    function filters(params) {
        var filters = [];
        if (commons.makesure(params.scriptid)) {
            filters.push(helper.filter('scriptid').is(params.scriptid));
        }
        if (commons.makesureall(params.script, 'scriptid')) {
            filters.push(helper.filter('scriptid').reference('script').is(params.script.scriptid));
        }
        if (commons.makesureall(params.scriptDeployment, 'scriptid')) {
            filters.push(helper.filter('scriptid').reference('scriptDeployment').is(params.scriptDeployment.scriptid));
        }
        if (commons.makesure(params.status)) {
            filters.push(helper.filter('status').is(params.status));
        }
        return filters;
    }

    function columns(params) {
        return params.wanted;
    }

    function createDeployment(params) {
        var results = queryDeployment(params);
        if (!commons.makesure(results)) {
            return; // TODO JL should throw error
        }
        var newcopy = record.copy({
            type: record.Type.SCRIPT_DEPLOYMENT,
            id: results[0].id,
            isDynamic: true
        }).save();
        log.debug('LetssubmittaskJS: new deployment created', newcopy);
    }

    function deleteDeplyment(internalid) {
        record.remove({
            type: record.Type.SCRIPT_DEPLOYMENT,
            id: internalid,
        });
    }

    /**
     * @desc Check if there any free deployment. Free means that the script's deployment status appears as Not Scheduled and the deployment is not currently executing.
     * @param {Object} params
     * @return {Boolean} True if there exists at least one free deployment, false otherwise.
     */
    function hasFreeDeployment(params) {
        if (!commons.makesureall(params, 'script', 'scriptid')) {
            return false;
        }

        return queryDeployment(params).length > queryScheduledInstance({
            script: params.script,
            status: [
                task.TaskStatus.PENDING,
                task.TaskStatus.PROCESSING
            ]
        }).length;
    }

    /**
     * @desc Create a new deployment.
     * @param {Object} params
     */
    function createNewDeployment(params) {
        createDeployment(params);
    }

    var attempts = 0;

    /**
     * @desc Attempt to submit a task a maximum of {@link consts.Collect.TASK_RETRIES} + 1 times.
     * @param {task.ScheduledScriptTask} nsTask - A NetSuite task
     */
    function submitTask(nsTask) {
        attempts++;

        if (!hasFreeDeployment({
            script: {
                scriptid: nsTask.scriptId
            }
        })) {
            createDeployment({
                script: {
                    scriptid: nsTask.scriptId
                }
            });
        }
        try {
            nsTask.deploymentId = null;
            nsTask.submit();
        } catch (e) {
            log.audit('LetssubmittaskJS: ERROR', 'Failed to submit task.');
            if (e.name === 'NO_DEPLOYMENTS_AVAILABLE' || e.name === 'FAILED_TO_SUBMIT_JOB_REQUEST_1') {
                if (attempts > consts.Collect.TASK_RETRIES) {
                    throw e;
                }
                submitTask(nsTask);
            } else {
                throw e;
            }
        }

        attempts = 0;
    }

    /**
     * Each scheduled script instance can use a maximum of 10,000 usage units.
     * For additional information on governance and usage units, see SuiteScript
     * Governance.
     *
     * With SuiteScript 2.0 scheduled scripts, you cannot set recovery points and
     * you do not have the ability to yield. There is no SuiteScript 2.0 equivalent
     * to the SuiteScript 1.0 nlapiYieldScript() and nlapiSetRecoveryPoint() APIs.
     * If you need to process a large amount of data or a large number of records,
     * use the SuiteScript 2.0 Map/Reduce Script Type instead. The map/reduce script
     * type has built in yielding and can be submitted for processing in the same ways
     * as scheduled scripts.
     *
     * This function is a simulation of nlapiYieldScript().
     *
     * @param recoveryPoint
     * @returns {*}
     */
    function yieldCurrentTask(recoveryPoint) {
        var ssTask = task.create({
            taskType: task.Type.SCHEDULED_SCRIPT,
            scriptId: runtime.getCurrentScript().id,
            deploymentId: runtime.getCurrentScript().deploymentId,
            params: recoveryPoint
        });
        return ssTask.submit();
    }

    return {
        hasFreeDeployment: hasFreeDeployment,
        createNewDeployment: createNewDeployment,
        deleteDeplyment: deleteDeplyment,
        submitTask: submitTask,
        yieldCurrentTask: yieldCurrentTask
    };

});
