import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {Platform, View} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {SafepayContext} from '../../contexts/SafepayContext';
import {ENVIRONMENT} from '../../enums';
import {ACK_TIMEOUT_MS, MAX_RETRIES} from '../../constants/messaging';
import {generateUUID} from '../../utils/generateUUID';
import {
  Address,
  AuthorizationResponse,
  Cardinal3dsFailureData,
  Cardinal3dsSuccessData,
  OnSafepayErrorData,
  PayerAuthEnrollmentFailureError,
  PendingMessage,
} from '../../types';

export type SafepayPayerAuthenticationProps = {
  onSafepayError?: (data: OnSafepayErrorData) => void;
  onCardinalSuccess?: (data: Cardinal3dsSuccessData) => void;
  onCardinalError?: (data: Cardinal3dsFailureData) => void;
  onPayerAuthEnrollmentRequired?: () => void;
  onPayerAuthEnrollmentFrictionless?: (data: AuthorizationResponse) => void;
  onPayerAuthEnrollmentFailure?: (
    error: PayerAuthEnrollmentFailureError,
  ) => void;
  environment?: ENVIRONMENT;
  doCaptureOnAuthorization?: boolean;
  doCardOnFile?: boolean;
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
  doCardOnFile,
}: SafepayPayerAuthenticationProps) => {
  const environment = _environment || ENVIRONMENT.SANDBOX;

  const getBaseUrl = () => {
    switch (environment) {
      case ENVIRONMENT.LOCAL:
        if (Platform.OS === 'android') {
          return 'http://10.0.2.2:3000';
        }
        return 'http://localhost:3000';
      case ENVIRONMENT.DEVELOPMENT:
        return 'https://dev.api.getsafepay.com/drops';
      case ENVIRONMENT.SANDBOX:
        return 'https://sandbox.api.getsafepay.com/drops';
      case ENVIRONMENT.PRODUCTION:
        return 'https://getsafepay.com/drops';
      default:
        return 'https://dev.api.getsafepay.com/drops';
    }
  };

  const baseUrl = getBaseUrl();
  const deviceUrl = `${baseUrl}/authlink`;

  const webViewRef = useRef<WebView>(null);
  const isReadyRef = useRef(false);
  const pendingMessagesRef = useRef<PendingMessage[]>([]);
  const inflightAcksRef = useRef<
    Map<string, {timeoutId: ReturnType<typeof setTimeout>; entry: PendingMessage}>
  >(new Map());
  const flushPendingMessagesRef = useRef<() => void>(() => {});

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
    country,
  } = useContext(SafepayContext);

  const properties = useMemo(
    () => ({
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
        country,
      } as Address,
      authorizationOptions: {
        do_capture:
          doCaptureOnAuthorization === undefined
            ? false
            : doCaptureOnAuthorization,
        do_card_on_file: doCardOnFile === undefined ? false : doCardOnFile,
      },
    }),
    [
      environment,
      clientSecret,
      tracker,
      deviceDataCollectionJWT,
      deviceDataCollectionURL,
      street_1,
      street_2,
      city,
      state,
      postal_code,
      country,
      doCaptureOnAuthorization,
      doCardOnFile,
    ],
  );

  const postMessageToWebView = useCallback((payload: any) => {
    if (!webViewRef.current) return;
    const script = `
      if (window.postMessage) {
        window.postMessage(${JSON.stringify(payload)}, "*");
      } else {
        console.error("postMessage is not supported");
      }
      true;
    `;
    webViewRef.current.injectJavaScript(script);
  }, []);

  const dispatchMessage = useCallback(
    (entry: PendingMessage) => {
      if (!webViewRef.current) {
        pendingMessagesRef.current.push(entry);
        return;
      }

      postMessageToWebView(entry.payload);

      if (entry.expectAck && entry.payload.messageId) {
        const timeoutId = setTimeout(() => {
          inflightAcksRef.current.delete(entry.payload.messageId);
          if (entry.retriesLeft > 0) {
            pendingMessagesRef.current.push({
              ...entry,
              retriesLeft: entry.retriesLeft - 1,
            });
            flushPendingMessagesRef.current();
          }
        }, ACK_TIMEOUT_MS);

        inflightAcksRef.current.set(entry.payload.messageId, {
          timeoutId,
          entry,
        });
      }
    },
    [postMessageToWebView],
  );

  const flushPendingMessages = useCallback(() => {
    if (!isReadyRef.current) return;
    const queued = pendingMessagesRef.current;
    pendingMessagesRef.current = [];
    queued.forEach(dispatchMessage);
  }, [dispatchMessage]);

  flushPendingMessagesRef.current = flushPendingMessages;

  const enqueueMessage = useCallback(
    (message: any, expectAck = true) => {
      const payload = expectAck
        ? {...message, messageId: generateUUID()}
        : message;

      pendingMessagesRef.current.push({
        payload,
        expectAck,
        retriesLeft: MAX_RETRIES,
      });

      if (isReadyRef.current) {
        flushPendingMessages();
      }
    },
    [flushPendingMessages],
  );

  useEffect(() => {
    enqueueMessage({type: 'safepay-property-update', properties});
  }, [enqueueMessage, properties]);

  useEffect(
    () => () => {
      inflightAcksRef.current.forEach(({timeoutId}) => clearTimeout(timeoutId));
      inflightAcksRef.current.clear();
      pendingMessagesRef.current = [];
    },
    [],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.name) {
          case 'safepay-inframe__ready':
            isReadyRef.current = true;
            flushPendingMessagesRef.current();
            break;
          case 'safepay-inframe__ack': {
            const {messageId, status, detail: ackDetail} = data.detail || {};
            if (messageId && inflightAcksRef.current.has(messageId)) {
              const inflight = inflightAcksRef.current.get(messageId);
              if (inflight?.timeoutId) {
                clearTimeout(inflight.timeoutId);
              }
              inflightAcksRef.current.delete(messageId);
              if (status === 'error') {
                console.warn(
                  `Safepay iframe reported an error for message ${messageId}: ${
                    ackDetail?.message || 'unknown error'
                  }`,
                );
              }
            }
            break;
          }
          case 'safepay-inframe__cardinal-3ds__success':
            onCardinalSuccess &&
              onCardinalSuccess(data as Cardinal3dsSuccessData);
            break;
          case 'safepay-inframe__cardinal-3ds__failure':
            onCardinalError && onCardinalError(data as Cardinal3dsFailureData);
            break;
          case 'safepay-inframe__enrollment__required':
            onPayerAuthEnrollmentRequired && onPayerAuthEnrollmentRequired();
            break;
          case 'safepay-inframe__enrollment__frictionless':
            onPayerAuthEnrollmentFrictionless &&
              onPayerAuthEnrollmentFrictionless(data as AuthorizationResponse);
            break;
          case 'safepay-inframe__enrollment__failed':
            onPayerAuthEnrollmentFailure &&
              onPayerAuthEnrollmentFailure(
                data as PayerAuthEnrollmentFailureError,
              );
            break;
          case 'safepay-error':
            onSafepayError && onSafepayError(data as OnSafepayErrorData);
            break;
        }
      } catch (e) {
        console.log(e);
      }
    },
    [onCardinalSuccess, onCardinalError, onSafepayError],
  );

  return (
    <View
      style={{
        flex: 1,
      }}>
      <View
        style={{
          flex: 1,
        }}>
        <WebView
          ref={webViewRef}
          source={{uri: deviceUrl}}
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
