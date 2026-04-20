import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  NativeSyntheticEvent,
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  ViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import type {
  CardFieldDetails,
  CardFieldFocusField,
  CardFieldMethods,
} from '../types';

type NativeCardChangeEvent = {
  card: CardFieldDetails;
};

type NativeFocusChangeEvent = {
  focusedField: string;
};

export interface CardFieldProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  autofocus?: boolean;
  disabled?: boolean;
  dangerouslyGetFullCardDetails?: boolean;
  onCardChange?(card: CardFieldDetails): void;
  onFocus?(focusedField: CardFieldFocusField): void;
  onBlur?(): void;
}

type NativeProps = ViewProps & {
  autofocus?: boolean;
  disabled?: boolean;
  dangerouslyGetFullCardDetails?: boolean;
  onCardChange?: (event: NativeSyntheticEvent<NativeCardChangeEvent>) => void;
  onFocusChange?: (event: NativeSyntheticEvent<NativeFocusChangeEvent>) => void;
};

const COMPONENT_NAME = 'SFPYCardField';
const NativeCardField = requireNativeComponent<NativeProps>(COMPONENT_NAME);

const dispatchCommand = (viewRef: React.Component<any> | null, command: string) => {
  const node = viewRef ? findNodeHandle(viewRef) : null;
  if (!node) return;
  const config = UIManager.getViewManagerConfig(COMPONENT_NAME);
  const commandId = config?.Commands?.[command];
  if (commandId == null) return;
  UIManager.dispatchViewManagerCommand(node, commandId, []);
};

export const CardField = forwardRef<CardFieldMethods, CardFieldProps>(
  (
    {
      onCardChange,
      onFocus,
      onBlur,
      autofocus,
      disabled,
      dangerouslyGetFullCardDetails,
      ...props
    },
    ref
  ) => {
    const nativeRef = useRef<any>(null);

    const onCardChangeHandler = useCallback(
      (event: NativeSyntheticEvent<NativeCardChangeEvent>) => {
        onCardChange?.(event.nativeEvent.card);
      },
      [onCardChange]
    );

    const onFocusChangeHandler = useCallback(
      (event: NativeSyntheticEvent<NativeFocusChangeEvent>) => {
        const focusedField = event.nativeEvent.focusedField;
        if (focusedField) {
          onFocus?.(focusedField as CardFieldFocusField);
        } else {
          onBlur?.();
        }
      },
      [onFocus, onBlur]
    );

    useImperativeHandle(ref, () => ({
      focus: () => dispatchCommand(nativeRef.current, 'focus'),
      blur: () => dispatchCommand(nativeRef.current, 'blur'),
      clear: () => dispatchCommand(nativeRef.current, 'clear'),
    }));

    return (
      <NativeCardField
        ref={nativeRef}
        onCardChange={onCardChangeHandler}
        onFocusChange={onFocusChangeHandler}
        autofocus={autofocus ?? false}
        disabled={disabled ?? false}
        dangerouslyGetFullCardDetails={dangerouslyGetFullCardDetails ?? false}
        {...props}
      />
    );
  }
);
