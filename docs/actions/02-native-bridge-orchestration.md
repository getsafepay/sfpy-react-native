# 02 Native Bridge Orchestration

Status: implemented for the legacy RN bridge; Fabric/new-architecture support still remains.

## What changed
Added a dedicated native `SFPYCardCapture` bridge on both platforms.

On iOS:
- added `ios/SFPYCardCaptureView.swift`
- added `ios/SFPYCardCaptureManager.swift`
- added `ios/SFPYCardCaptureManager.m`

On Android:
- added `android/src/main/java/com/sfpy/reactnative/SFPYCardCaptureView.kt`
- added `android/src/main/java/com/sfpy/reactnative/SFPYCardCaptureViewManager.kt`
- registered the new manager in `SfpyReactNativePackage.kt`

## Native responsibilities now covered
The native bridge now:
- hosts the reusable native card input
- creates the native SDK card-capture controller once `environment`, `authToken`, and `tracker` are available
- owns `submit()` and the `PAYER_AUTH_SETUP` network call
- emits `onReady`, `onValidated`, `onError`, and `onProceedToAuthentication`
- keeps raw card submission data native-side
- normalizes optional Swift payload fields into React Native dictionaries before emitting them

## JS responsibilities now covered
The JS `CardCapture` component now:
- wraps the native `SFPYCardCapture` view instead of nesting `CardField`
- keeps sanitized validity state for `validate()` and `fetchValidity()`
- dispatches native `submit` and `clear` commands
- normalizes native event payloads into the public JS callbacks

## Remaining gap
This bridge is still legacy-view-manager based. The Fabric/new-architecture requirement is not satisfied yet, so bridgeless/Fabric support remains a follow-up rather than something completed in this pass.
