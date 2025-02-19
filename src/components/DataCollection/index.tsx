import { SafepayContext } from '../../contexts/SafepayContext';
import { EnrollmentAuthenticationStatus } from '../../enums';
import { useOnSafepayError } from '../../hooks';
import { CardinalMessage, EnrollmentResponse, TrackerAuthenticationResponse } from '../../types';
import Safepay from "@sfpy/node-core";
import React, { useContext, useRef } from 'react';
import { Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';


const DROPS_URL = process.env.DROPS_URL;
const THREEDS_URL = `${DROPS_URL}/threeds`;
const DEVICE_URL = `${DROPS_URL}/device`;
const SUCCESS_URL = `${THREEDS_URL}/success`;
const FAILURE_URL = `${THREEDS_URL}/failure`;

export type DataCollectionProps = {
    onAuthentication?: (data: TrackerAuthenticationResponse) => void;
    onEnrollment?: (status: EnrollmentAuthenticationStatus) => void;
    onSafepayApiError?: (error?: Safepay.errors.SafepayError | undefined) => void;
    onCardinalSuccess?: (data: CardinalMessage) => void;
    onCardinalError?: (data: CardinalMessage) => void;
};

export const DataCollection = ({
    onAuthentication,
    onEnrollment,
    onCardinalSuccess,
    onCardinalError,
    onSafepayApiError
}: DataCollectionProps) => {

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
        console.log("message", message);
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

    const [webViewUri, setWebViewUri] = React.useState<string>(DEVICE_URL);

    const doThreeDs = React.useCallback((stepUpUrl: string, accessToken: string) => {
        console.log("doing 3ds", stepUpUrl, accessToken);
        setProperties({
            threeDSJWT: accessToken,
            threeDSURL: stepUpUrl
        });
        setWebViewUri(THREEDS_URL);
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
        console.log("doing enrollment", tracker, street_1, city, postal_code, country);
        if (!(tracker && street_1 && city && postal_code && country)) return;
        console.log("sessionId", sessionId)
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
                    success_url: SUCCESS_URL,
                    failure_url: FAILURE_URL,
                    device_fingerprint_session_id: sessionId
                }
            }
        }).then((data: EnrollmentResponse) => {
            const { authentication_status } = data.data.action.payer_authentication_enrollment;
            onEnrollment && onEnrollment(authentication_status);
            console.log("enrollment status", authentication_status);
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
            console.log("enrollment error", error);
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
                    console.log("safepay-inframe__ready");
                    sendDeviceDataCollectionDetails();
                    break;
                case "safepay-inframe__cardinal-device-data__complete":
                    console.log("safepay-inframe__cardinal-device-data__complete");
                    doEnrollment(data.detail.sessionId);
                    break;
                case "safepay-inframe__cardinal-3ds__success":
                    onCardinalSuccess && onCardinalSuccess(data);
                    console.log("safepay-inframe__cardinal-3ds__success");
                    break;
                case "safepay-inframe__cardinal-3ds__failure":
                    onCardinalError && onCardinalError(data);
                    console.log("safepay-inframe__cardinal-3ds__failure");
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
