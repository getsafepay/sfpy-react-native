import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { CardField } from './CardField';
import type { CardFieldDetails, CardFieldMethods } from '../types';

export type CardCaptureMethods = {
  submit(): void;
  validate(): boolean;
  fetchValidity(): Promise<boolean>;
  clear(): void;
};

export interface CardCaptureProps {
  environment: string;
  authToken: string;
  tracker: string;
  validationEvent?: string;
  onValidated?(): void;
  onError?(error: string): void;
  onReady?(): void;
  onCardChange?(card: CardFieldDetails): void;
  imperativeRef: React.MutableRefObject<CardCaptureMethods | null>;
}

export const CardCapture: React.FC<CardCaptureProps> = ({
  environment,
  authToken,
  tracker,
  validationEvent,
  onValidated,
  onError,
  onReady,
  onCardChange,
  imperativeRef,
}) => {
  void environment;
  void authToken;
  void tracker;
  void validationEvent;

  const cardFieldRef = useRef<CardFieldMethods>(null);
  const [cardDetails, setCardDetails] = useState<CardFieldDetails | null>(null);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const validate = useCallback(() => {
    return Boolean(cardDetails?.complete);
  }, [cardDetails]);

  const submit = useCallback(() => {
    if (validate()) {
      onValidated?.();
    } else {
      onError?.('Card details are incomplete.');
    }
  }, [validate, onValidated, onError]);

  useImperativeHandle(
    imperativeRef,
    () => ({
      submit,
      validate,
      fetchValidity: async () => validate(),
      clear: () => cardFieldRef.current?.clear(),
    }),
    [submit, validate]
  );

  const handleCardChange = useCallback(
    (card: CardFieldDetails) => {
      setCardDetails(card);
      onCardChange?.(card);
    },
    [onCardChange]
  );

  return <CardField ref={cardFieldRef} onCardChange={handleCardChange} />;
};
