import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  NativeSyntheticEvent,
  ViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';
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
  onCardChange?(card: CardFieldDetails): void;
  onFocus?(focusedField: CardFieldFocusField): void;
  onBlur?(): void;
}

type NativeProps = ViewProps & {
  ref?: React.Ref<NativeCardFieldRef>;
  autofocus?: boolean;
  disabled?: boolean;
  onCardChange?: (event: NativeSyntheticEvent<NativeCardChangeEvent>) => void;
  onFocusChange?: (event: NativeSyntheticEvent<NativeFocusChangeEvent>) => void;
};

type NativeCardFieldRef = {
  focus(): Promise<void>;
  blur(): Promise<void>;
  clear(): Promise<void>;
};

const NativeCardField: React.ComponentType<NativeProps> =
  requireNativeViewManager('SFPYCardField');

const ignore = () => {};

export const CardField = forwardRef<CardFieldMethods, CardFieldProps>(
  (
    {
      onCardChange,
      onFocus,
      onBlur,
      autofocus,
      disabled,
      ...props
    },
    ref
  ) => {
    const nativeRef = useRef<NativeCardFieldRef>(null);

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
      focus: () => {
        nativeRef.current?.focus().catch(ignore);
      },
      blur: () => {
        nativeRef.current?.blur().catch(ignore);
      },
      clear: () => {
        nativeRef.current?.clear().catch(ignore);
      },
    }));

    return (
      <NativeCardField
        ref={nativeRef}
        onCardChange={onCardChangeHandler}
        onFocusChange={onFocusChangeHandler}
        autofocus={autofocus ?? false}
        disabled={disabled ?? false}
        {...props}
      />
    );
  }
);
