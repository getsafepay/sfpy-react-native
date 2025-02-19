import Safepay from "@sfpy/node-core";
import * as _ from 'lodash';
import * as React from 'react';

const URL = "https://dev.api.getsafepay.com";


export const useSafepay = () => new Safepay('', {
    host: URL
});

export const useAuthenticatedSafepay = (accessToken: string) => {

    if (!accessToken) return;

    return new Safepay(accessToken, {
        authType: 'jwt',
        host: URL
    });
};


export const useOnSafepayError = (args?:
    {
        errorCallback?: (error?: Safepay.errors.SafepayError) => void,
        forceErrorMessage?: boolean
    }
) => {

    const {
        errorCallback
    } = args || {};


    const onSafepayError =
        React.useCallback((error: Safepay.errors.SafepayError) => {
            if (!_.isEmpty(error)) {
                console.error(error);
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        }, [errorCallback]);

    return {
        onSafepayError
    };
};
