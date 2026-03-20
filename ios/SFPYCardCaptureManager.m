#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(SFPYCardCapture, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(onReady, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onCardChange, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onValidated, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onError, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onProceedToAuthentication, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(environment, NSString)
RCT_EXPORT_VIEW_PROPERTY(authToken, NSString)
RCT_EXPORT_VIEW_PROPERTY(tracker, NSString)
RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(autofocus, BOOL)
RCT_EXTERN_METHOD(submit:(nonnull NSNumber*) reactTag)
RCT_EXTERN_METHOD(clear:(nonnull NSNumber*) reactTag)
@end
