/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    'N/runtime'
], function(runtime) {

    /**
     * Check if a feature is turned on and in effect
     * @return {boolean}
     */
    function isFeatureInEffect(feature) {
        return runtime.isFeatureInEffect(feature);
    }

    /**
     * Check if account is OW by checking SUBSIDIARIES feature.
     * @return {boolean}
     */
    function isOW() {
        return isFeatureInEffect('SUBSIDIARIES');
    }

    //NSCHINA-2429
    //Added for CFS location/department/class filter
    function isLocationEnabled() {
        return isFeatureInEffect('LOCATIONS');
    }

    function isDepartmentEnabled() {
        return isFeatureInEffect('DEPARTMENTS');
    }

    function isClassesEnabled() {
        return isFeatureInEffect('CLASSES');
    }

    /**
     * Check if account is MULTICURRENCY by checking MULTICURRENCY feature.
     * @return {boolean}
     */
    function isMultiCurrency() {
        return isFeatureInEffect('MULTICURRENCY');
    }

    function isMultipleCalendars() {
        return isFeatureInEffect('MULTIPLECALENDARS');
    }

    function isGLAuditNumbering() {
        return isFeatureInEffect('GLAUDITNUMBERING');
    }

    function getUserLanguage() {
        return runtime.getCurrentUser().getPreference('LANGUAGE');
    }

    function getUserTimezone() {
        return runtime.getCurrentUser().getPreference('TIMEZONE');
    }

    function getUserMaxdropdownsize() {
        return runtime.getCurrentUser().getPreference('MAXDROPDOWNSIZE');
    }

    function getCurrentScript() {
        return runtime.getCurrentScript();
    }

    function getCurrentSession() {
        return runtime.getCurrentSession();
    }

    function getCurrentUser() {
        return runtime.getCurrentUser();
    }

    function getUserSubsidiary() {
        return runtime.getCurrentUser().subsidiary;
    }

    function isLogDebugEnabled() {
        return getCurrentScript().logLevel === 'DEBUG';
    }

    function isLogAuditEnabled() {
        return isLogDebugEnabled() || getCurrentScript().logLevel === 'AUDIT';
    }

    /**
     * This is helper function for performance test. We should use the same log level as performance log level.
     * @returns Current system date
     */
    function clock() {
        if (isLogAuditEnabled()) {
            return new Date();
        }
    }

    var wrapper = {
        isFeatureInEffect: isFeatureInEffect,
        isOW: isOW,
        isMultiCurrency: isMultiCurrency,
        isMultipleCalendars: isMultipleCalendars,
        getUserLanguage: getUserLanguage,
        getUserTimezone: getUserTimezone,
        getUserMaxdropdownsize: getUserMaxdropdownsize,
        getCurrentUser: getCurrentUser,
        getUserSubsidiary: getUserSubsidiary,
        ContextType: runtime.ContextType,
        isGLAuditNumbering: isGLAuditNumbering,
        getCurrentScript: getCurrentScript,
        getCurrentSession: getCurrentSession,
        isLogDebugEnabled: isLogDebugEnabled,
        isLogAuditEnabled: isLogAuditEnabled,
        isLocationEnabled: isLocationEnabled,
        isDepartmentEnabled: isDepartmentEnabled,
        isClassesEnabled: isClassesEnabled,
        clock: clock
    };

    Object.defineProperty(wrapper, 'executionContext', {
        enumerable: true,
        get: function() {
            return runtime.executionContext;
        }
    });

    Object.defineProperty(wrapper, 'accountId', {
        enumerable: true,
        get: function() {
            return runtime.accountId;
        }
    });

    Object.defineProperty(wrapper, 'envType', {
        enumerable: true,
        get: function() {
            return runtime.envType;
        }
    });

    return wrapper;

});
