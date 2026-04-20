# 02 Align Payer Auth Callbacks

I aligned `SafepayPayerAuthentication` with the callback names used in `safepay-atoms` while keeping the older React Native callback names in place as deprecated aliases.

## Implemented changes

- Added atoms-compatible callbacks:
  - `onPayerAuthenticationSuccess`
  - `onPayerAuthenticationFailure`
  - `onPayerAuthenticationRequired`
  - `onPayerAuthenticationFrictionless`
  - `onPayerAuthenticationUnavailable`
- Kept the existing callbacks and marked them as deprecated:
  - `onCardinalSuccess`
  - `onCardinalError`
  - `onPayerAuthEnrollmentRequired`
  - `onPayerAuthEnrollmentFrictionless`
  - `onPayerAuthEnrollmentFailure`
  - `onPayerAuthEnrollmentUnavailable`
- Added exported payer-auth callback payload types that mirror the atoms contract:
  - `PayerAuthenticationData`
  - `PayerAuthenticationErrorData`
  - `PayerAuthenticationSuccessData`
- Updated the event mapping so each payer-auth event now emits both:
  - the new atoms-compatible callback
  - the existing deprecated React Native callback

## Payload handling

- `required`, `frictionless`, and `unavailable` now emit a normalized `{ tracker, request_id }` payload for the new callbacks.
- `failure` now emits `{ tracker, request_id, error }` for the new callback.
- `success` now emits `{ tracker, request_id, payment_method, authorization? }` for the new callback.
- The deprecated callbacks still receive the same legacy payloads as before.
