# 01 Harden Payer Auth Bridge Origin

Status: implemented.

## What changed
Updated `src/components/SafepayPayerAuthentication/index.tsx` so the React Native WebView bridge now matches the hardened Drops `postMessage` contract.

The component now:
- derives the exact Drops origin from the selected environment base URL
- loads Drops `/authlink` with an explicit `parentOrigin` query parameter
- posts bridge messages into the WebView with that exact origin instead of `"*"`

## Why this was necessary
Recent Drops changes stopped accepting wildcard or implicit bridge origins. The Drops message manager now expects a trusted parent origin and rejects bridge traffic that does not match it exactly.

`sfpy-react-native` was still:
- loading `/authlink` without a `parentOrigin`
- injecting `window.postMessage(..., "*")`

That left the React Native payer-auth flow out of contract with Drops hardening, especially around 3DS success and failure callbacks.
