import Foundation
import React

@objc(SFPYCardCapture)
class SFPYCardCaptureManager: RCTViewManager {
    override func view() -> UIView! {
        return SFPYCardCaptureView()
    }

    @objc func submit(_ reactTag: NSNumber) {
        bridge?.uiManager.addUIBlock { _, viewRegistry in
            if let view = viewRegistry?[reactTag] as? SFPYCardCaptureView {
                view.submit()
            }
        }
    }

    @objc func clear(_ reactTag: NSNumber) {
        bridge?.uiManager.addUIBlock { _, viewRegistry in
            if let view = viewRegistry?[reactTag] as? SFPYCardCaptureView {
                view.clear()
            }
        }
    }

    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
