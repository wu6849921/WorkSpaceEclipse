/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([], function() {

    /**
     * @desc get the browser type.
     * @return {string} - browser type.
     */
    function getBrowserType() {
        var u_agent = window.navigator.userAgent;
        var browserType = 'Failed to identify the browser';
        if (u_agent.indexOf('Firefox') > -1) {
            browserType = 'Firefox';
        } else if (u_agent.indexOf('Chrome') > -1) {
            browserType = 'Chrome';
        } else if (u_agent.indexOf('Trident') > -1 && u_agent.indexOf('rv:11') > -1) {
            browserType = 'IE11';
        } else if (u_agent.indexOf('MSIE') > -1 && u_agent.indexOf('Trident') > -1) {
            browserType = 'IE(8-10)';
        } else if (u_agent.indexOf('MSIE') > -1) {
            browserType = 'IE(6-7)';
        } else if (u_agent.indexOf('Opera') > -1) {
            browserType = 'Opera';
        } else {
            browserType += ',info:' + u_agent;
        }
        return browserType;
    }

    function waitAndExecute(functionToWait, functionToExecute, milliseconds) {
        var timer = window.setInterval(function() {
            if (functionToWait()) {
                window.clearInterval(timer);
                functionToExecute();
            }
        }, milliseconds);
        return timer;
    }

    function clearWindowTimer(timer) {
        window.clearInterval(timer);
    }

    /**
     * Popup a file download dialog on current page.
     * @param {String} fileUrl The file URL normally a value returned by url.resolveScript
     */
    function popupFileDownloadDialog(fileUrl) {
        var downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        document.body.appendChild(downloadLink);

        downloadLink.click();

        document.body.removeChild(downloadLink);
    }

    function writeDocument(newDocument) {
        document.open();
        document.write(newDocument);
        document.close();
    }

    function setLocalStorage(name, value) {
        localStorage.setItem(name, value);
    }

    function getLocalStorage(name) {
        return localStorage.getItem(name);
    }

    return {
        getBrowserType: getBrowserType,
        setLocalStorage: setLocalStorage,
        getLocalStorage: getLocalStorage,
        waitAndExecute: waitAndExecute,
        clearWindowTimer: clearWindowTimer,
        popupFileDownloadDialog: popupFileDownloadDialog,
        writeDocument: writeDocument
    };

});
