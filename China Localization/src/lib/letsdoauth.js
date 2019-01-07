/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    '../../lib/oauth-1.0a'
],
function (oauth) {

    function oAuth(info, hashFunction) {
        var theOAuth = OAuth({
            consumer: {
                key: info.consumer.key,
                secret: info.consumer.secret
            },
            signature_method: 'HMAC-SHA1',
            hash_function: hashFunction
        });

        var token = {
            key: info.token.id,
            secret: info.token.secret
        };

        var headers = theOAuth.authorize({
            url: info.url,
            method: info.method/*,
            data: {}*/ // it seems not used
        }, token);
        headers.realm = info.account;
        headers = theOAuth.toHeader(headers);
        headers.Authorization = headers.Authorization + ', realm="' + info.account + '"'; // workaround for realm missing

        return headers.Authorization;
    }

    function basicAuth(authInfo) {
        return 'NLAuth nlauth_account=' + authInfo.account + ',nlauth_email=' + authInfo.username + ',nlauth_signature=' + authInfo.password;
    }

    return {
        basicAuth: basicAuth,
        oAuth: oAuth
    };
});
