# 01 Card Capture Public Contract

Status: implemented for the first native-backed pass.

## What changed
Replaced the JS-only `CardCapture` stub with a native-backed React Native component that mirrors the Atoms contract closely enough for the card-capture phase.

The RN component now:
- renders a dedicated native `SFPYCardCapture` view on iOS and Android
- keeps local validity state in JS using non-sensitive card-change events
- delegates `submit()` to native so `PAYER_AUTH_SETUP` happens inside the native SDKs
- returns `accessToken`, `deviceDataCollectionURL`, `paymentMethod`, and `cardinalJWT` through `onProceedToAuthentication`

## Public JS surface
The RN surface now exposes:
- props: `environment`, `authToken`, `tracker`, `validationEvent`, `onReady`, `onValidated`, `onError`, `onProceedToAuthentication`, `imperativeRef`
- imperative methods: `submit()`, `validate()`, `fetchValidity()`, `clear()`

`validate()` and `fetchValidity()` still use the sanitized card validity state already emitted by the native view. `submit()` is the only path that crosses into native orchestration.

## Security constraint
Full PAN/CVV no longer drive backend calls from JS. The JS layer only sees sanitized card state plus the downstream payer-auth setup payload.

## Still out of scope
This work still stops at `CardCapture`. DDC, challenge handling, and post-auth authorization remain downstream in `SafepayPayerAuthentication`.
