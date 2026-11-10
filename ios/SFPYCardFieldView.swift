import ExpoModulesCore
import SafepayiOSSDK
import UIKit

class SFPYCardFieldView: ExpoView {
    let onCardChange = EventDispatcher()
    let onFocusChange = EventDispatcher()

    var disabled: Bool = false {
        didSet {
            cardFieldView.isUserInteractionEnabled = !disabled
        }
    }
    var autofocus: Bool = false {
        didSet {
            if autofocus {
                cardFieldView.focus()
            }
        }
    }

    private let cardFieldView = SafepayCardFieldView()

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        setupView()
    }

    func focus() {
        cardFieldView.focus()
    }

    func blur() {
        cardFieldView.blur()
    }

    func clear() {
        cardFieldView.clear()
    }

    private func setupView() {
        cardFieldView.translatesAutoresizingMaskIntoConstraints = false
        addSubview(cardFieldView)

        NSLayoutConstraint.activate([
            cardFieldView.leadingAnchor.constraint(equalTo: leadingAnchor),
            cardFieldView.trailingAnchor.constraint(equalTo: trailingAnchor),
            cardFieldView.topAnchor.constraint(equalTo: topAnchor),
            cardFieldView.bottomAnchor.constraint(equalTo: bottomAnchor),
        ])

        cardFieldView.cardChangeHandler = { [weak self] details in
            self?.emitCardChange(details)
        }
        cardFieldView.focusChangeHandler = { [weak self] focus in
            self?.emitFocusChange(focus)
        }
    }

    private func emitCardChange(_ details: SafepayCardFieldDetails) {
        var card: [String: Any] = [
            "complete": details.complete,
            "validNumber": details.validNumber,
            "validCVC": details.validCVC,
            "validExpiryDate": details.validExpiryDate,
        ]

        card["brand"] = details.brand ?? NSNull()
        card["last4"] = details.last4 ?? ""

        if let expiryMonth = details.expiryMonth {
            card["expiryMonth"] = expiryMonth
        } else {
            card["expiryMonth"] = NSNull()
        }

        if let expiryYear = details.expiryYear {
            card["expiryYear"] = expiryYear
        } else {
            card["expiryYear"] = NSNull()
        }

        onCardChange(["card": card])
    }

    private func emitFocusChange(_ focus: SafepayCardFieldFocusField?) {
        onFocusChange(["focusedField": focus?.rawValue ?? ""])
    }
}
