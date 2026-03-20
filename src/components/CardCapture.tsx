import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  ViewProps,
  StyleProp,
  ViewStyle,
  UIManager,
  findNodeHandle,
  requireNativeComponent,
} from 'react-native';
import type {
  CardCaptureError,
  CardCaptureProceedToAuthenticationData,
  CardFieldDetails,
} from '../types';

export type CardCaptureMethods = {
  submit(): void;
  validate(): boolean;
  fetchValidity(): Promise<boolean>;
  clear(): void;
};

export interface CardCaptureProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  environment: string;
  authToken: string;
  tracker: string;
  validationEvent?: string;
  onValidated?(): void;
  onError?(error: CardCaptureError): void;
  onReady?(): void;
  onCardChange?(card: CardFieldDetails): void;
  onProceedToAuthentication?(data: CardCaptureProceedToAuthenticationData): void;
  imperativeRef: React.MutableRefObject<CardCaptureMethods | null>;
  disabled?: boolean;
  autofocus?: boolean;
}

type NativeCardChangeEvent = {
  card: CardFieldDetails;
};

type NativeErrorEvent = {
  error: CardCaptureError;
};

type NativeProceedEvent = {
  result: CardCaptureProceedToAuthenticationData;
};

type NativeProps = ViewProps & {
  environment: string;
  authToken: string;
  tracker: string;
  disabled?: boolean;
  autofocus?: boolean;
  onReady?: (event: NativeSyntheticEvent<Record<string, never>>) => void;
  onCardChange?: (event: NativeSyntheticEvent<NativeCardChangeEvent>) => void;
  onValidated?: (event: NativeSyntheticEvent<Record<string, never>>) => void;
  onError?: (event: NativeSyntheticEvent<NativeErrorEvent>) => void;
  onProceedToAuthentication?: (
    event: NativeSyntheticEvent<NativeProceedEvent>
  ) => void;
};

const COMPONENT_NAME = 'SFPYCardCapture';
const NativeCardCapture = requireNativeComponent<NativeProps>(COMPONENT_NAME);

const dispatchCommand = (viewRef: React.Component<any> | null, command: string) => {
  const node = viewRef ? findNodeHandle(viewRef) : null;
  if (!node) return;
  const config = UIManager.getViewManagerConfig(COMPONENT_NAME);
  const commandId = config?.Commands?.[command];
  if (commandId == null) return;
  UIManager.dispatchViewManagerCommand(node, commandId, []);
};

export const CardCapture: React.FC<CardCaptureProps> = ({
  environment,
  authToken,
  tracker,
  validationEvent,
  onValidated,
  onError,
  onReady,
  onCardChange,
  onProceedToAuthentication,
  imperativeRef,
  disabled,
  autofocus,
  ...props
}) => {
  void validationEvent;

  const nativeRef = useRef<any>(null);
  const [cardDetails, setCardDetails] = useState<CardFieldDetails | null>(null);

  const validate = useCallback(() => Boolean(cardDetails?.complete), [cardDetails]);

  const submit = useCallback(() => {
    if (!validate()) {
      onError?.({
        code: 'PT-1002',
        message: 'Card details are incomplete or invalid. Please check the entered card details and try again.',
      });
      return;
    }

    dispatchCommand(nativeRef.current, 'submit');
  }, [onError, validate]);

  useImperativeHandle(
    imperativeRef,
    () => ({
      submit,
      validate,
      fetchValidity: async () => validate(),
      clear: () => {
        setCardDetails(null);
        dispatchCommand(nativeRef.current, 'clear');
      },
    }),
    [submit, validate]
  );

  const onCardChangeHandler = useCallback(
    (event: NativeSyntheticEvent<NativeCardChangeEvent>) => {
      const card = event.nativeEvent.card;
      setCardDetails(card);
      onCardChange?.(card);
    },
    [onCardChange]
  );

  const onReadyHandler = useCallback(() => {
    onReady?.();
  }, [onReady]);

  const onValidatedHandler = useCallback(() => {
    onValidated?.();
  }, [onValidated]);

  const onErrorHandler = useCallback(
    (event: NativeSyntheticEvent<NativeErrorEvent>) => {
      onError?.(event.nativeEvent.error);
    },
    [onError]
  );

  const onProceedHandler = useCallback(
    (event: NativeSyntheticEvent<NativeProceedEvent>) => {
      onProceedToAuthentication?.(event.nativeEvent.result);
    },
    [onProceedToAuthentication]
  );

  return (
    <NativeCardCapture
      ref={nativeRef}
      environment={environment}
      authToken={authToken}
      tracker={tracker}
      disabled={disabled ?? false}
      autofocus={autofocus ?? false}
      onReady={onReadyHandler}
      onCardChange={onCardChangeHandler}
      onValidated={onValidatedHandler}
      onError={onErrorHandler}
      onProceedToAuthentication={onProceedHandler}
      {...props}
    />
  );
};
