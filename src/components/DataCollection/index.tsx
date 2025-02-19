import { SafepayContext } from '../../contexts/SafepayContext';
import { EnrollmentAuthenticationStatus, ENVIRONMENT } from '../../enums';
import { useOnSafepayError } from '../../hooks';
import { CardinalMessage, EnrollmentResponse, TrackerAuthenticationResponse } from '../../types';
import Safepay from "@sfpy/node-core";
import React, { useContext, useRef } from 'react';
import { Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';


export type DataCollectionProps = {
    onAuthentication?: (data: TrackerAuthenticationResponse) => void;
    onEnrollment?: (status: EnrollmentAuthenticationStatus) => void;
    onSafepayApiError?: (error?: Safepay.errors.SafepayError | undefined) => void;
    onCardinalSuccess?: (data: CardinalMessage) => void;
    onCardinalError?: (data: CardinalMessage) => void;
    environment?: ENVIRONMENT;
};

export const DataCollection = ({
    onAuthentication,
    onEnrollment,
    onCardinalSuccess,
    onCardinalError,
    onSafepayApiError,
    environment: _environment
}: DataCollectionProps) => {

    const environment = _environment || ENVIRONMENT.SANDBOX;

    // TODO: add production URLs when deployed
    const dropsUrl = environment === ENVIRONMENT.DEVELOPMENT ? "https://dev.api.getsafepay.com/drops" : "https://sandbox.api.getsafepay.com/drops";
    const threedsUrl = `${dropsUrl}/threeds`;
    const deviceUrl = `${dropsUrl}/device`;
    const successUrl = `${threedsUrl}/success`;
    const failureUrl = `${threedsUrl}/failure`;

    const webViewRef = useRef<WebView>(null);

    const [loading, setLoading] = React.useState<boolean>(false);

    const {
        clientSecret,
        tracker,
        deviceDataCollectionJWT,
        deviceDataCollectionURL,
        street_1,
        street_2,
        city,
        state,
        postal_code,
        country
    } = useContext(SafepayContext);

    const [properties, setProperties] = React.useState<{}>({});

    const generateMessageScript = React.useCallback((message: string) => `
            if (window.postMessage) {
                window.postMessage(${message}, "*");
            } else {
                console.error("postMessage is not supported");
            }
        `, []);

    React.useEffect(() => {
        setProperties({
            deviceDataCollectionJWT,
            deviceDataCollectionURL
        });
    }, [deviceDataCollectionJWT, deviceDataCollectionURL]);

    // Function to send messages to the iframe
    const sendDeviceDataCollectionDetails = React.useCallback(() => {
        if (!webViewRef.current) return;
        // Prepare the message to send to the webpage
        const message = JSON.stringify({
            type: 'safepay-property-update',
            properties,
        });
        // Inject JavaScript to send the message to the webpage
        const script = generateMessageScript(message);
        webViewRef.current.injectJavaScript(script);
    }, [properties]);

    const safepay = new Safepay(clientSecret, {
        authType: "jwt", // either 'jwt' or 'secret' depending on what you provide
        host: "https://dev.api.getsafepay.com", // can be configured to our sandbox host for test transactions
    });

    const { onSafepayError } = useOnSafepayError({
        errorCallback: onSafepayApiError
    });

    const [webViewUri, setWebViewUri] = React.useState<string>(deviceUrl);

    const doThreeDs = React.useCallback((stepUpUrl: string, accessToken: string) => {
        setProperties({
            threeDSJWT: accessToken,
            threeDSURL: stepUpUrl
        });
        setWebViewUri(threedsUrl);
    }, [setWebViewUri])

    const doAuthentication = React.useCallback(() => {
        if (!tracker) return;
        setLoading(true);
        safepay?.order.tracker.action(tracker, {
            payload: {
                authorization: {
                    do_capture: false
                }
            }
        }).then((data: TrackerAuthenticationResponse) => {
            onAuthentication && onAuthentication(data);
            setLoading(false);
        }).catch((error: Safepay.errors.SafepayError) => {
            onSafepayError(error);
            setLoading(false);
        });
    }, [tracker]);

    const doEnrollment = React.useCallback((sessionId: string) => {
        if (!(tracker && street_1 && city && postal_code && country)) return;
        safepay?.order.tracker.action(tracker, {
            payload: {
                billing: {
                    street_1,
                    street_2,
                    city,
                    state,
                    postal_code,
                    country
                },
                authorization: {
                    do_capture: false
                },
                authentication_setup: {
                    success_url: successUrl,
                    failure_url: failureUrl,
                    device_fingerprint_session_id: sessionId
                }
            }
        }).then((data: EnrollmentResponse) => {
            const { authentication_status } = data.data.action.payer_authentication_enrollment;
            onEnrollment && onEnrollment(authentication_status);
            switch (authentication_status) {
                case EnrollmentAuthenticationStatus.REQUIRED:
                    const {
                        step_up_url,
                        access_token
                    } = data.data.action.payer_authentication_enrollment;
                    doThreeDs(step_up_url, access_token);
                    break;
                case EnrollmentAuthenticationStatus.FRICTIONLESS:
                case EnrollmentAuthenticationStatus.ATTEMPTED:
                    doAuthentication();
                    break;
                case EnrollmentAuthenticationStatus.UNAVAILABLE:
                case EnrollmentAuthenticationStatus.FAILED:
                case EnrollmentAuthenticationStatus.REJECTED:
                case EnrollmentAuthenticationStatus.NOT_ELIGIBLE:
                    break;
            }
        }).catch((error: Safepay.errors.SafepayError) => {
            onSafepayError(error);
        });
    }, [
        street_1,
        street_2,
        city,
        state,
        postal_code,
        country,
        doThreeDs,
        doAuthentication
    ]);

    const onMessage = React.useCallback((event: WebViewMessageEvent) => {
        try {
            const data: CardinalMessage = JSON.parse(event.nativeEvent.data);
            switch (data.name) {
                case "safepay-inframe__ready":
                    sendDeviceDataCollectionDetails();
                    break;
                case "safepay-inframe__cardinal-device-data__complete":
                    doEnrollment(data.detail.sessionId);
                    break;
                case "safepay-inframe__cardinal-3ds__success":
                    onCardinalSuccess && onCardinalSuccess(data);
                    break;
                case "safepay-inframe__cardinal-3ds__failure":
                    onCardinalError && onCardinalError(data);
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }, [sendDeviceDataCollectionDetails, doEnrollment]);

    return (
        <View
            style={{
                flex: 1
            }}
        >
            {
                loading ?
                    <View
                        style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}

                    >
                        <Text>Loading...</Text>
                    </View> :
                    <View
                        style={{
                            flex: 1
                        }}
                    >
                        <View
                            style={{
                                flex: 1
                            }}
                        >
                            <WebView
                                ref={webViewRef}
                                source={{ uri: webViewUri }}
                                javaScriptEnabled
                                domStorageEnabled
                                onMessage={onMessage}
                                injectedJavaScript={`
                                        console.log = (function (oldLog) {
                                            return function (...args) {
                                            window.ReactNativeWebView.postMessage(JSON.stringify(args));
                                            oldLog(...args);
                                            };
                                        })(console.log);
                                    `}
                            />
                        </View>
                    </View>
            }
        </View>
    );
};
