# sfpy-react-native

A React Native library for Safepay integration that provides components, hooks, and types to help you quickly integrate Safepay functionality into your React Native projects.

## Installation

Once the package is published on npm, simply run:

```sh
npm install sfpy-react-native
# or
yarn add sfpy-react-native
```

## Usage

In your React Native project, import the components and hooks as named exports:

```javascript
import { SafepayPayerAuthentication, SafepayContext, EnrollmentAuthenticationStatus } from "sfpy-react-native";
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
        // this is the address of the customer
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
                onCardinalSuccess={(data) => console.log("onCardinalSuccess", data)}
                onCardinalError={(error) => console.log("onCardinalError", error)}
                onAuthorizationSuccess={(data) => console.log("onAuthorization", data)}
                onSafepayApiError={(error) => { console.log("onSafepayApiError", error) }}
                onEnrollmentSuccess={(data) => console.log("onEnrollment", data)}
                doCaptureOnAuthorization
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
    "authorization": "auth_feb58926-7b76-4a53-9636-eeccf1cfdb3b",
    "payment_method": null,
    "request_id": "req_9233cd4d-3fb6-4ee7-8fb0-ba7cc9e81647",
    "tracker": "track_218bc59b-96c9-4cd8-b0aa-95670cab0326"
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
    "error": "Your card issuer cannot authenticate this card. Please select another card or form of payment to complete your purchase.",
    "request_id": "req_9233cd4d-3fb6-4ee7-8fb0-ba7cc9e81647",
    "tracker": "track_218bc59b-96c9-4cd8-b0aa-95670cab0326"
  },
  "name": "safepay-inframe__cardinal-3ds__failure",
  "type": "safepay-inframe-event"
}
```

#### onAuthorizationSuccess
Called when payment authorization succeeds. Example response:

```json
{
  "data": {
    "action": {
      "payment_method": {},
      "token": "req_9233cd4d-3fb6-4ee7-8fb0-ba7cc9e81647"
    },
    "tracker": {
      "client": "sec_8970519c-17f8-4dc4-9d85-118a4c31afbf",
      "customer": "cus_150e73e7-8808-403d-ac2d-616bf2d14909",
      "entry_mode": "raw",
      "environment": "development",
      "intent": "CYBERSOURCE",
      "mode": "payment",
      "payment_method_kind": "card",
      "state": "TRACKER_ENDED",
      "token": "track_218bc59b-96c9-4cd8-b0aa-95670cab0326"
    }
  },
  "status": {
    "errors": [],
    "message": "success"
  }
}
```

#### onEnrollmentSuccess
Called when enrollment completes. This callback returns only an EnrollmentAuthenticationStatus which can be imported from the SDK:

```typescript
import { EnrollmentAuthenticationStatus } from 'sfpy-react-native';

// Possible values:
// REQUIRED
// FRICTIONLESS
// ATTEMPTED
// UNAVAILABLE
// FAILED
// REJECTED
// NOT_ELIGIBLE
```

## Peer Dependencies

This library relies on your project providing React and React Native. Please ensure you have the following versions installed:

- **react**: `~18.3.1`
- **react-native**: `~0.76.7`

## License

MIT