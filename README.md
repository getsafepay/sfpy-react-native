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