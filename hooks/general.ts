import Safepay from "@sfpy/node-core";
import * as React from 'react';
import * as _ from 'lodash';


export const useSafepay = () => new Safepay('', {
    authType: 'jwt',
    host: process.env.EXPO_PUBLIC_API_URL
});

export const useAuthenticatedSafepay = (accessToken: string) => {

    if (!accessToken) return;

    return new Safepay(accessToken, {
        authType: 'jwt',
        host: process.env.EXPO_PUBLIC_API_URL
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
