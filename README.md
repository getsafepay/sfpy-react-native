# @sfpy/react-native

A React Native library for Safepay integration that provides components, hooks, and types to help you quickly integrate Safepay functionality into your React Native projects.

## Installation

Once the package is published on npm, simply run:

```sh
npm install @sfpy/react-native
# or
yarn add @sfpy/react-native
```

## Usage

In your React Native project, import the components and hooks as named exports:

```javascript
import { SafepayPayerAuthentication, SafepayContext, EnrollmentAuthenticationStatus, Cardinal3dsSuccessData, Cardinal3dsFailureData, AuthorizationResponse, PayerAuthEnrollmentFailureError } from "@sfpy/react-native";
```

## Example usage

Use the SafepayPayerAuthentication in the following way using the SafepayContext.

```typescript
export default function Index() {
    const values = {
        // this can be either a Time Based Token or JWT
        clientSecret: "0wX...A==",
        // this is the payment tracker token
        tracker: "track_c22f4888-dd09-4b99-83ec-e65dd9fc7b88",
        // these are the JWT and URL for Cardinal, provided by the payment API
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

### SafepayPayerAuthentication Callbacks

The component accepts several callbacks that receive response payloads. Below are example responses:

#### onCardinalSuccess
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

#### onCardinalError
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

#### onPayerAuthEnrollmentRequired
Called when payer authentication enrollment is required but receives no response data.

#### onPayerAuthEnrollmentFrictionless
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

#### onPayerAuthEnrollmentUnavailable
Called when payer authentication enrollment fails/unavailable. Example response:

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
**Deprecated.** Use `onPayerAuthEnrollmentUnavailable` instead. This callback still fires for backward compatibility with the same payload.

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
