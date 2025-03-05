import Safepay from "@sfpy/node-core";
import React, { useContext, useRef } from 'react';
import { Platform, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { SafepayContext } from '../../contexts/SafepayContext';
import { EnrollmentAuthenticationStatus, ENVIRONMENT } from '../../enums';
import { Address, CardinalMessage, TrackerAuthenticationResponse } from '../../types';


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
    const getBaseUrl = () => {
        switch (environment) {
            case ENVIRONMENT.LOCAL:
                if (Platform.OS === 'android') {
                    return 'http://10.0.2.2:3000';  // Android emulator localhost
                }
                return 'http://localhost:3000';      // iOS localhost
            case ENVIRONMENT.DEVELOPMENT:
                return "https://dev.api.getsafepay.com";
            case ENVIRONMENT.SANDBOX:
                return "https://sandbox.api.getsafepay.com";
            default:
                return "https://dev.api.getsafepay.com";
        }

    };

    const baseUrl = getBaseUrl();
    const deviceUrl = `${baseUrl}/authlink`;

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
            environment: environment.toLowerCase(),
            authToken: clientSecret,
            tracker,
            deviceDataCollectionJWT,
            deviceDataCollectionURL,
            billing: {
                street_1,
                street_2,
                city,
                state,
                postal_code,
                country
            } as Address,
            authorizationOptions: {
                do_capture: doCaptureOnAuthorization === undefined ? false : doCaptureOnAuthorization,
                do_card_on_file: doCardOnFile === undefined ? false : doCardOnFile
            }
        });
    }, [tracker, clientSecret, deviceDataCollectionJWT, deviceDataCollectionURL]);

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

    const onMessage = React.useCallback((event: WebViewMessageEvent) => {
        try {
            const data: CardinalMessage = JSON.parse(event.nativeEvent.data);
            switch (data.name) {
                case "safepay-inframe__ready":
                    sendDeviceSafepayPayerAuthenticationDetails();
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
    }, [sendDeviceSafepayPayerAuthenticationDetails]);

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
                    source={{ uri: deviceUrl }}
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
