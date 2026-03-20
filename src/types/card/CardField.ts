export type CardFieldValidationState =
  | 'Valid'
  | 'Invalid'
  | 'Incomplete'
  | 'Unknown';

export type CardFieldDetails = {
  last4?: string;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  complete: boolean;
  brand?: string | null;
  validExpiryDate?: CardFieldValidationState;
  validNumber?: CardFieldValidationState;
  validCVC?: CardFieldValidationState;
  number?: string;
  cvc?: string;
};

export type CardFieldFocusField = 'CardNumber' | 'ExpiryDate' | 'Cvc';

export type CardFieldMethods = {
  focus(): void;
  blur(): void;
  clear(): void;
};

export type CardCapturePaymentMethod = {
  token: string;
  expirationMonth: string;
  expirationYear: string;
  cardTypeCode: string;
  cardType: string;
  binNumber: string;
  lastFour: string;
};

export type CardCaptureProceedToAuthenticationData = {
  accessToken: string;
  deviceDataCollectionURL: string;
  cardinalJWT?: string | null;
  paymentMethod: CardCapturePaymentMethod;
};

export type CardCaptureError = {
  code?: string | null;
  message: string;
};
