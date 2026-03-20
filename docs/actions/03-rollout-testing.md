# 03 Rollout And Testing

Status: partially verified.

## What was verified
- TypeScript build passed with `npm run build`
- native SDK controller work was already compiled on Android in the SDK repo
- the RN `CardCapture` public surface now returns proceed-to-auth payloads without JS reading PAN/CVV

## What still needs verification
### Functional
- incomplete card surfaces native validation errors correctly on both platforms
- payer-auth setup API failures map cleanly into `onError`
- success path returns `onProceedToAuthentication` on both platforms

### Platform
- iOS example app rebuild against the new native bridge
- Android example app rebuild against the new native bridge
- legacy architecture runtime smoke test
- Fabric/new-architecture runtime test after a Fabric bridge exists

## Known remaining gaps
- tracker reset parity with drops is still not implemented in the native SDKs
- the RN bridge is still legacy-only and does not yet satisfy the Fabric requirement
