/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    './app_cn_pref_form',
    '../../dao/cn_pref_dao'
    ],
function(form, dao){
    function handleAsPage(){
        form.setUserData(dao.fetchPreference());
        return form.renderAsPage();
    }

return{
    handleAsPage: handleAsPage
}
})