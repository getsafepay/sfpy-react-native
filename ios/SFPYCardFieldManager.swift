import Foundation
import React

@objc(SFPYCardField)
class SFPYCardFieldManager: RCTViewManager {
    override func view() -> UIView! {
        return SFPYCardFieldView()
    }

    @objc func focus(_ reactTag: NSNumber) {
        bridge?.uiManager.addUIBlock { _, viewRegistry in
            if let view = viewRegistry?[reactTag] as? SFPYCardFieldView {
                view.focus()
            }
        }
    }

    @objc func blur(_ reactTag: NSNumber) {
        bridge?.uiManager.addUIBlock { _, viewRegistry in
            if let view = viewRegistry?[reactTag] as? SFPYCardFieldView {
                view.blur()
            }
        }
    }

    @objc func clear(_ reactTag: NSNumber) {
        bridge?.uiManager.addUIBlock { _, viewRegistry in
            if let view = viewRegistry?[reactTag] as? SFPYCardFieldView {
                view.clear()
            }
        }
    }

    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
