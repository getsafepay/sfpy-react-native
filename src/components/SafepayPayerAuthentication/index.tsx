import Safepay from "@sfpy/node-core";
import React, { useContext, useRef } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { SafepayContext } from '../../contexts/SafepayContext';
import { EnrollmentAuthenticationStatus, ENVIRONMENT } from '../../enums';
import { useOnSafepayError } from '../../hooks';
import { CardinalMessage, EnrollmentResponse, TrackerAuthenticationResponse } from '../../types';


export type SafepayPayerAuthenticationProps = {
    onAuthorizationSuccess?: (data: TrackerAuthenticationResponse) => void;
    onEnrollmentSuccess?: (status: EnrollmentAuthenticationStatus) => void;
    onEnrollmentFailure?: (status: EnrollmentAuthenticationStatus) => void;
    onSafepayApiError?: (error?: Safepay.errors.SafepayError | undefined) => void;
    onCardinalSuccess?: (data: CardinalMessage) => void;
    onCardinalError?: (data: CardinalMessage) => void;
    environment?: ENVIRONMENT;
    doCaptureOnAuthorization?: boolean,
    doCardOnFile?: boolean
};

export const SafepayPayerAuthentication = ({
    onAuthorizationSuccess,
    onEnrollmentSuccess,
    onEnrollmentFailure,
    onCardinalSuccess,
    onCardinalError,
    onSafepayApiError,
    environment: _environment,
    doCaptureOnAuthorization,
    doCardOnFile
}: SafepayPayerAuthenticationProps) => {

    const environment = _environment || ENVIRONMENT.SANDBOX;

    // TODO: add production URLs
    const host = environment === ENVIRONMENT.DEVELOPMENT ? "https://dev.api.getsafepay.com" : "https://sandbox.api.getsafepay.com";
    const dropsHost = "https://dev.api.getsafepay.com";
    const dropsUrl = `${dropsHost}/drops`;
    const threedsUrl = `${dropsUrl}/threeds`;
    const deviceUrl = `${dropsUrl}/device`;
    const successUrl = `${threedsUrl}/success`;
    const failureUrl = `${threedsUrl}/failure`;

    const webViewRef = useRef<WebView>(null);

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
            deviceDataCollectionURL,
        });
    }, [deviceDataCollectionJWT, deviceDataCollectionURL]);

    // Function to send messages to the iframe
    const sendDeviceSafepayPayerAuthenticationDetails = React.useCallback(() => {
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
        host, // can be configured to our sandbox host for test transactions
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

    const doAuthorization = React.useCallback(() => {
        if (!tracker) return;
        safepay?.order.tracker.action(tracker, {
            use_action_chaining: doCaptureOnAuthorization === undefined ? false : doCaptureOnAuthorization,
            payload: {
                authorization: {
                    do_capture: doCaptureOnAuthorization === undefined ? false : doCaptureOnAuthorization,
                    do_card_on_file: doCardOnFile === undefined ? false : doCardOnFile
                }
            }
        }).then((data: TrackerAuthenticationResponse) => {
            onAuthorizationSuccess && onAuthorizationSuccess(data);
        }).catch((error: Safepay.errors.SafepayError) => {
            onSafepayError(error);
        });
    }, [tracker, doCaptureOnAuthorization, doCardOnFile]);

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
                    do_capture: doCaptureOnAuthorization === undefined ? false : doCaptureOnAuthorization,
                    do_card_on_file: doCardOnFile === undefined ? false : doCardOnFile
                },
                authentication_setup: {
                    success_url: successUrl,
                    failure_url: failureUrl,
                    device_fingerprint_session_id: sessionId
                }
            }
        }).then((data: EnrollmentResponse) => {
            const { authentication_status } = data.data.action.payer_authentication_enrollment;
            onEnrollmentSuccess && onEnrollmentSuccess(authentication_status);
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
                    doAuthorization();
                    break;
                case EnrollmentAuthenticationStatus.UNAVAILABLE:
                case EnrollmentAuthenticationStatus.FAILED:
                case EnrollmentAuthenticationStatus.REJECTED:
                case EnrollmentAuthenticationStatus.NOT_ELIGIBLE:
                    onEnrollmentFailure && onEnrollmentFailure(authentication_status);
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
        doAuthorization,
        doCaptureOnAuthorization,
        doCardOnFile
    ]);

    const onMessage = React.useCallback((event: WebViewMessageEvent) => {
        try {
            const data: CardinalMessage = JSON.parse(event.nativeEvent.data);
            switch (data.name) {
                case "safepay-inframe__ready":
                    sendDeviceSafepayPayerAuthenticationDetails();
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
    }, [sendDeviceSafepayPayerAuthenticationDetails, doEnrollment]);

    return (
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
    );
};
