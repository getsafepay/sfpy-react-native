# @sfpy/react-native

A React Native library for Safepay integration that provides components, hooks, and types to help you quickly integrate Safepay functionality into your React Native projects.

## Contents

- [Installation](#installation)
- [Native setup](#native-setup)
- [Accepting a card payment](#accepting-a-card-payment)
- [CardCapture](#cardcapture)
- [CardField](#cardfield)
- [SafepayPayerAuthentication](#safepaypayerauthentication)

## Installation

```sh
npm install @sfpy/react-native react-native-webview
# or
yarn add @sfpy/react-native react-native-webview
```

The card inputs are native views, so the app needs a native build. **Expo Go is not supported.** With Expo, use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (`npx expo run:ios` / `npx expo run:android`).

The native views are built with the [Expo Modules API](https://docs.expo.dev/modules/overview/), so they work on both the old and the New Architecture. Expo apps already include it. In a bare React Native app, install it first with `npx install-expo-modules@latest`.

## Native setup

The card inputs come from Safepay's native SDKs, which you add to your app's iOS and Android projects.

### iOS

Requires iOS 15.1 or later. Add the Safepay iOS SDK to your `ios/Podfile`:

```ruby
pod 'SafepayiOSSDK', :git => 'https://github.com/getsafepay/safepay-ios-sdk.git', :branch => 'main'
```

Then run `cd ios && pod install`. The `sfpy-react-native` pod itself is autolinked.

### Android

Requires `minSdkVersion` 24 or later and Java 17. The library depends on the `safePayCard` module of the [Safepay Android SDK](https://github.com/getsafepay/safepay-android-sdk), which you include from a checkout of that repository (for example as a git submodule or a sibling folder). Add it to `android/settings.gradle`, adjusting the path to where the checkout lives:

```groovy
include ':safePayCard'
project(':safePayCard').projectDir = new File(rootDir, '../safepay-android-sdk/safePayCard')
```

`safePayCard` doesn't depend on the Cardinal Mobile SDK, so no Cardinal Maven credentials are needed.

### Expo

`expo prebuild --clean` regenerates `ios/` and `android/` and drops the Podfile and `settings.gradle` lines above. Either commit the native folders and stop regenerating them, or re-apply the lines after each prebuild.

## Accepting a card payment

Card details are entered and sent to Safepay entirely in native code. Your JavaScript never sees the card number or CVC, only the brand, last four digits, expiry and validation state; there is no option to read them. This keeps raw card data out of your app.

1. **On your server**, create a payment tracker and a time-based token (TBT) for it, and pass both to the app.
2. **Render `CardCapture`** with the tracker, the TBT as `authToken`, and the environment the tracker was created in.
3. **Call `submit()`** when the customer pays. The native SDK sends the card to Safepay and creates a payment method.
4. **`onProceedToAuthentication`** fires with the payment method and the details needed for 3-D Secure.
5. **Render `SafepayPayerAuthentication`** inside a `SafepayContext` with those details. It runs device data collection and 3-D Secure, and reports the outcome through its callbacks.

```tsx
import { useRef, useState } from "react";
import { Button, Modal } from "react-native";
import {
  CardCapture,
  CardCaptureMethods,
  CardCaptureProceedToAuthenticationData,
  ENVIRONMENT,
  SafepayContext,
  SafepayPayerAuthentication,
} from "@sfpy/react-native";

type Props = {
  tracker: string; // from your server
  tbt: string; // from your server
};

export function Checkout({ tracker, tbt }: Props) {
  const cardCaptureRef = useRef<CardCaptureMethods | null>(null);
  const [complete, setComplete] = useState(false);
  const [setup, setSetup] = useState<CardCaptureProceedToAuthenticationData | null>(null);

  return (
    <>
      <CardCapture
        imperativeRef={cardCaptureRef}
        environment={ENVIRONMENT.SANDBOX}
        authToken={tbt}
        tracker={tracker}
        onCardChange={card => setComplete(card.complete)}
        onError={error => console.warn(error.code, error.message)}
        onProceedToAuthentication={setSetup}
        style={{ height: 120 }}
      />
      <Button title="Pay" disabled={!complete} onPress={() => cardCaptureRef.current?.submit()} />

      <Modal visible={setup !== null} transparent>
        {setup ? (
          <SafepayContext.Provider
            value={{
              clientSecret: tbt,
              tracker,
              deviceDataCollectionJWT: setup.accessToken,
              deviceDataCollectionURL: setup.deviceDataCollectionURL,
              // Billing address
              street_1: "St 12",
              street_2: "",
              city: "Islamabad",
              state: "",
              postal_code: "44000",
              country: "PK",
            }}
          >
            <SafepayPayerAuthentication
              environment={ENVIRONMENT.SANDBOX}
              doCaptureOnAuthorization
              onPayerAuthenticationSuccess={data => console.log("Paid", data)}
              onPayerAuthenticationFrictionless={data => console.log("Paid", data)}
              onPayerAuthenticationFailure={data => console.warn("3DS failed", data)}
              onPayerAuthenticationUnavailable={data => console.warn("3DS unavailable", data)}
              onSafepayError={data => console.warn("Safepay error", data)}
            />
          </SafepayContext.Provider>
        ) : null}
      </Modal>
    </>
  );
}
```

The [example app](https://github.com/getsafepay/safepay-react-native-sdk-example) has a complete, runnable version of this flow.

The environment must match the one the tracker and TBT were created in. A mismatch, or an expired TBT, makes `submit()` fail with an authorization error.

## CardCapture

A native card number, expiry and CVC input that sends the card to Safepay when you call `submit()`.

### Props

| Prop | Type | Description |
|---|---|---|
| `imperativeRef` | `MutableRefObject<CardCaptureMethods \| null>` | **Required.** Receives the methods below. |
| `environment` | `ENVIRONMENT` | **Required.** `DEVELOPMENT`, `SANDBOX` or `PRODUCTION`. `LOCAL` is not supported. |
| `authToken` | `string` | **Required.** The time-based token (TBT) for the tracker. |
| `tracker` | `string` | **Required.** The payment tracker token (`track_…`). |
| `onReady` | `() => void` | Called once `environment`, `authToken` and `tracker` are all set. |
| `onCardChange` | `(card: CardFieldDetails) => void` | Called as the customer types. Contains no card number or CVC. |
| `onValidated` | `() => void` | Called when Safepay accepts the card, just before `onProceedToAuthentication`. |
| `onProceedToAuthentication` | `(data: CardCaptureProceedToAuthenticationData) => void` | Called with the result of `submit()`. |
| `onError` | `(error: CardCaptureError) => void` | Called when `submit()` fails. |
| `disabled` | `boolean` | Disables the inputs. |
| `autofocus` | `boolean` | Focuses the card number input when the view appears. |
| `style` | `ViewStyle` | Give the view a height (about 120). |

### Methods (`imperativeRef.current`)

| Method | Description |
|---|---|
| `submit()` | Sends the card to Safepay. The result arrives through `onProceedToAuthentication` or `onError`. If the card is incomplete, `onError` fires with code `PT-1002` and nothing is sent. |
| `validate()` | Returns `true` if the card details are complete and valid. |
| `fetchValidity()` | Async version of `validate()`. |
| `clear()` | Clears all inputs. |

### Types

```ts
type CardFieldDetails = {
  complete: boolean;
  brand?: string | null; // e.g. "visa", "mastercard"
  last4?: string;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  validNumber?: "Valid" | "Invalid" | "Incomplete" | "Unknown";
  validExpiryDate?: "Valid" | "Invalid" | "Incomplete" | "Unknown";
  validCVC?: "Valid" | "Invalid" | "Incomplete" | "Unknown";
};

type CardCaptureProceedToAuthenticationData = {
  accessToken: string; // pass to SafepayContext as deviceDataCollectionJWT
  deviceDataCollectionURL: string; // pass to SafepayContext as deviceDataCollectionURL
  cardinalJWT?: string | null;
  paymentMethod: {
    token: string;
    expirationMonth: string;
    expirationYear: string;
    cardTypeCode: string;
    cardType: string;
    binNumber: string;
    lastFour: string;
  };
};

type CardCaptureError = {
  code?: string | null;
  message: string;
};
```

## CardField

The card input on its own, without sending the card anywhere. Use `CardCapture` to take payments; `CardField` is for layouts or flows that only need card validation state.

```tsx
import { CardField, CardFieldMethods } from "@sfpy/react-native";

const ref = useRef<CardFieldMethods>(null);

<CardField
  ref={ref}
  onCardChange={card => console.log(card.complete, card.brand, card.last4)}
  onFocus={field => console.log("focused", field)} // "CardNumber" | "ExpiryDate" | "Cvc"
  onBlur={() => console.log("blurred")}
  style={{ height: 120 }}
/>;
```

| Prop | Type | Description |
|---|---|---|
| `onCardChange` | `(card: CardFieldDetails) => void` | Called as the customer types. |
| `onFocus` | `(field: CardFieldFocusField) => void` | Called when an input gains focus. |
| `onBlur` | `() => void` | Called when the field loses focus. |
| `disabled` | `boolean` | Disables the inputs. |
| `autofocus` | `boolean` | Focuses the card number input when the view appears. |

The ref exposes `focus()`, `blur()` and `clear()`.

## SafepayPayerAuthentication

Runs device data collection and 3-D Secure in a web view, using the values in the surrounding `SafepayContext`. When you use `CardCapture`, `deviceDataCollectionJWT` and `deviceDataCollectionURL` come from `onProceedToAuthentication` (see [Accepting a card payment](#accepting-a-card-payment)).

```typescript
export default function Index() {
    const values = {
        // this can be either a Time Based Token or JWT
        clientSecret: "0wX...A==",
        // this is the payment tracker token
        tracker: "track_c22f4888-dd09-4b99-83ec-e65dd9fc7b88",
        // accessToken and deviceDataCollectionURL from CardCapture's onProceedToAuthentication
        deviceDataCollectionJWT: "eys...f84",
        deviceDataCollectionURL: "https://centinelapistag.cardinalcommerce.com/V1/Cruise/Collect",
        // this is the address of the customer (this is optional)
        street_1: "St 12",
        street_2: "",
        city: "Islamabad",
        state: "",
        postal_code: "44000",
        country: "PK"
    } as SafepayContextType;

    return (
        <SafepayContext.Provider value={values}>
            <SafepayPayerAuthentication
                environment={ENVIRONMENT.DEVELOPMENT}
                onPayerAuthenticationSuccess={(data) => console.log("onPayerAuthenticationSuccess", data)}
                onPayerAuthenticationFailure={(data) => console.log("onPayerAuthenticationFailure", data)}
                onPayerAuthenticationRequired={(data) => console.log("onPayerAuthenticationRequired", data)}
                onPayerAuthenticationFrictionless={(data) => console.log("onPayerAuthenticationFrictionless", data)}
                onPayerAuthenticationUnavailable={(data) => console.log("onPayerAuthenticationUnavailable", data)}
                onCardinalSuccess={(data: Cardinal3dsSuccessData) => console.log("onCardinalSuccess", data)}
                onCardinalError={(error: Cardinal3dsFailureData) => console.log("onCardinalError", error)}
                onPayerAuthEnrollmentRequired={() => console.log("onPayerAuthEnrollmentRequired")}
                onPayerAuthEnrollmentFrictionless={(data: AuthorizationResponse) => console.log("onPayerAuthEnrollmentFrictionless", data)}
                onPayerAuthEnrollmentUnavailable={(error: PayerAuthEnrollmentUnavailableError) => console.log("onPayerAuthEnrollmentUnavailable", error)}
                onPayerAuthEnrollmentFailure={(error: PayerAuthEnrollmentFailureError) => console.log("onPayerAuthEnrollmentFailure (deprecated)", error)}
                onSafepayError={(data) => console.log("onSafepayError", data)}
                doCaptureOnAuthorization
                doCardOnFile
            />
        </SafepayContext.Provider>
    );
};
```

### Props

| Property | Type | Description |
|---|---|---|
| environment | `ENVIRONMENT` | `LOCAL`, `DEVELOPMENT`, `SANDBOX` (default) or `PRODUCTION` |
| doCaptureOnAuthorization | boolean | Enables capture during authorization |
| doCardOnFile | boolean | Enables card-on-file during authorization |
| onPayerAuthenticationSuccess | function | Atoms-compatible callback for successful 3DS completion |
| onPayerAuthenticationFailure | function | Atoms-compatible callback for failed 3DS completion |
| onPayerAuthenticationRequired | function | Atoms-compatible callback for enrollment-required events |
| onPayerAuthenticationFrictionless | function | Atoms-compatible callback for frictionless enrollment events |
| onPayerAuthenticationUnavailable | function | Atoms-compatible callback for unavailable enrollment events |
| onSafepayError | function | Callback for Safepay iframe errors |
| onCardinalSuccess | function | Deprecated alias for `onPayerAuthenticationSuccess` |
| onCardinalError | function | Deprecated alias for `onPayerAuthenticationFailure` |
| onPayerAuthEnrollmentRequired | function | Deprecated alias for `onPayerAuthenticationRequired` |
| onPayerAuthEnrollmentFrictionless | function | Deprecated alias for `onPayerAuthenticationFrictionless` |
| onPayerAuthEnrollmentUnavailable | function | Deprecated alias for `onPayerAuthenticationUnavailable` |
| onPayerAuthEnrollmentFailure | function | Deprecated alias for `onPayerAuthenticationUnavailable` |

### Callbacks

The component accepts atoms-compatible callbacks and keeps the older React Native callback names for backward compatibility.

#### Atoms-compatible callbacks

| Callback | Payload | Description |
|---|---|---|
| onPayerAuthenticationSuccess | `{ tracker, request_id, payment_method?, authorization? }` | Fired when Cardinal 3DS succeeds |
| onPayerAuthenticationFailure | `{ tracker, request_id, error }` | Fired when Cardinal 3DS fails |
| onPayerAuthenticationRequired | `{ tracker, request_id? }` | Fired when payer authentication enrollment is required |
| onPayerAuthenticationFrictionless | `{ tracker, request_id? }` | Fired when payer authentication completes frictionlessly |
| onPayerAuthenticationUnavailable | `{ tracker, request_id? }` | Fired when payer authentication enrollment is unavailable |
| onSafepayError | `{ error: SafepayError }` | Fired when Safepay returns an iframe-level error |

#### Deprecated callbacks

| Callback | Status | Notes |
|---|---|---|
| onCardinalSuccess | Deprecated | Use `onPayerAuthenticationSuccess` |
| onCardinalError | Deprecated | Use `onPayerAuthenticationFailure` |
| onPayerAuthEnrollmentRequired | Deprecated | Use `onPayerAuthenticationRequired` |
| onPayerAuthEnrollmentFrictionless | Deprecated | Use `onPayerAuthenticationFrictionless` |
| onPayerAuthEnrollmentUnavailable | Deprecated | Use `onPayerAuthenticationUnavailable` |
| onPayerAuthEnrollmentFailure | Deprecated | Use `onPayerAuthenticationUnavailable` |

Below are example responses:

#### onPayerAuthenticationSuccess / onCardinalSuccess
Called when Cardinal 3DS authentication succeeds. Example response:

```json
{
  "detail": {
    "payment_method": null,
    "request_id": "req_23461744-c342-42ef-9bed-f54f709c40d9",
    "tracker": "track_a098c800-a24b-4eb2-ab62-aa8967a099df"
  },
  "name": "safepay-inframe__cardinal-3ds__success",
  "type": "safepay-inframe-event"
}
```

#### onPayerAuthenticationFailure / onCardinalError
Called when Cardinal 3DS authentication fails. Example response:

```json
{
  "detail": {
    "error": "error performing action 'PAYER_AUTH_ENROLLMENT': Encountered an error while performing payer authentication: payer could not be authenticated. Please try again with a different card or another form of payment.",
    "request_id": null,
    "tracker": "track_03ca9dca-3ee5-40fe-95e3-931554d0ef16"
  },
  "name": "safepay-inframe__cardinal-3ds__failure",
  "type": "safepay-inframe-event"
}
```

#### onPayerAuthenticationRequired / onPayerAuthEnrollmentRequired
Called when payer authentication enrollment is required. The new callback receives normalized payload data; the deprecated callback still fires without arguments for backward compatibility.

Atoms-compatible payload:

```json
{
  "tracker": "track_a098c800-a24b-4eb2-ab62-aa8967a099df"
}
```

#### onPayerAuthenticationFrictionless / onPayerAuthEnrollmentFrictionless
Called when payer authentication enrollment is completed with frictionless authentication. Example response:

```json
{
  "detail": {
    "request_id": "req_b15699bd-415e-4ed3-866b-227bbe69f714",
    "tracker": "track_c6ead7f5-681c-469e-ab9f-4f2cc1f144e8"
  },
  "name": "safepay-inframe__enrollment__frictionless",
  "type": "safepay-inframe-event"
}
```

#### onPayerAuthenticationUnavailable / onPayerAuthEnrollmentUnavailable
Called when payer authentication enrollment fails/unavailable.

Atoms-compatible payload:

```json
{
  "tracker": "track_c6ead7f5-681c-469e-ab9f-4f2cc1f144e8"
}
```

Deprecated callback payload:

```json
{
  "detail": {
    "errorMessage": "error performing action 'PAYER_AUTH_ENROLLMENT': Encountered an error while performing payer authentication: payer could not be authenticated. Please try again with a different card or another form of payment."
  },
  "name": "safepay-inframe__enrollment__failed",
  "type": "safepay-inframe-event"
}
```

#### onPayerAuthEnrollmentFailure (deprecated)
**Deprecated.** Use `onPayerAuthenticationUnavailable` instead. This callback still fires for backward compatibility with the same payload.

#### onSafepayError
Called when an error with Safepay occurs. Example response:

```json
{
    "detail": {
        "error": {
            "status": 400,
            "type": "SafepayAPIError"
        }
    },
    "name": "safepay-error",
    "type": "safepay-inframe-event"
}
```

## Peer Dependencies

This library relies on your project providing React and React Native. Please ensure you have the following versions installed:

- **react**: `>=16.8.0`
- **react-native**: `>=0.60.0`
- **react-native-webview**: `>=13.13.2`

## License

MIT
