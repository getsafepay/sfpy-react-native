import React, { useContext, useRef } from 'react';
import { Platform, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { SafepayContext } from '../../contexts/SafepayContext';
import { ENVIRONMENT } from '../../enums';
import { Address, AuthorizationResponse, Cardinal3dsFailureData, Cardinal3dsSuccessData, OnSafepayErrorData, PayerAuthEnrollmentFailureError } from '../../types';


export type SafepayPayerAuthenticationProps = {
    onSafepayError?: (data: OnSafepayErrorData) => void;
    onCardinalSuccess?: (data: Cardinal3dsSuccessData) => void;
    onCardinalError?: (data: Cardinal3dsFailureData) => void;
    onPayerAuthEnrollmentRequired?: () => void;
    onPayerAuthEnrollmentFrictionless?: (data: AuthorizationResponse) => void;
    onPayerAuthEnrollmentFailure?: (error: PayerAuthEnrollmentFailureError) => void;
    environment?: ENVIRONMENT;
    doCaptureOnAuthorization?: boolean,
    doCardOnFile?: boolean
};

export const SafepayPayerAuthentication = ({
    onSafepayError,
    onCardinalSuccess,
    onCardinalError,
    onPayerAuthEnrollmentRequired,
    onPayerAuthEnrollmentFrictionless,
    onPayerAuthEnrollmentFailure,
    environment: _environment,
    doCaptureOnAuthorization,
    doCardOnFile
}: SafepayPayerAuthenticationProps) => {

    const environment = _environment || ENVIRONMENT.SANDBOX;

    const getBaseUrl = () => {
        switch (environment) {
            case ENVIRONMENT.LOCAL:
                if (Platform.OS === 'android') {
                    return 'http://10.0.2.2:3000'; // Android emulator localhost
                }
                return 'http://localhost:3000'; // iOS localhost
            case ENVIRONMENT.DEVELOPMENT:
                return "https://dev.api.getsafepay.com/drops";
            case ENVIRONMENT.SANDBOX:
                return "https://sandbox.api.getsafepay.com/drops";
            case ENVIRONMENT.PRODUCTION:
                return "https://api.getsafepay.com/drops";
            default:
                return "https://dev.api.getsafepay.com/drops";
        }

    };

    const baseUrl = getBaseUrl();
    const deviceUrl = `${baseUrl}/authlink`;
    console.log(deviceUrl)

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
            const data = JSON.parse(event.nativeEvent.data);
            switch (data.name) {
                case "safepay-inframe__ready":
                    sendDeviceSafepayPayerAuthenticationDetails();
                    break;
                case "safepay-inframe__cardinal-3ds__success":
                    onCardinalSuccess && onCardinalSuccess(data as Cardinal3dsSuccessData);
                    break;
                case "safepay-inframe__cardinal-3ds__failure":
                    onCardinalError && onCardinalError(data as Cardinal3dsFailureData);
                    break;
                case "safepay-inframe__enrollment__required":
                    onPayerAuthEnrollmentRequired && onPayerAuthEnrollmentRequired();
                    break;
                case "safepay-inframe__enrollment__frictionless":
                    onPayerAuthEnrollmentFrictionless && onPayerAuthEnrollmentFrictionless(data as AuthorizationResponse);
                    break;
                case "safepay-inframe__enrollment__failed":
                    onPayerAuthEnrollmentFailure && onPayerAuthEnrollmentFailure(data as PayerAuthEnrollmentFailureError);
                    break;
                case "safepay-error":
                    onSafepayError && onSafepayError(data as OnSafepayErrorData);
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }, [sendDeviceSafepayPayerAuthenticationDetails, onCardinalSuccess, onCardinalError]);

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
