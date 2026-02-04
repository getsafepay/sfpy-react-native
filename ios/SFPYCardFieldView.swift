import Foundation
import React
import SafepayiOSSDK
import UIKit

@objc(SFPYCardFieldView)
class SFPYCardFieldView: UIView {
    @objc var onCardChange: RCTDirectEventBlock?
    @objc var onFocusChange: RCTDirectEventBlock?
    @objc var dangerouslyGetFullCardDetails: Bool = false {
        didSet {
            cardFieldView.dangerouslyGetFullCardDetails = dangerouslyGetFullCardDetails
        }
    }
    @objc var disabled: Bool = false {
        didSet {
            cardFieldView.isUserInteractionEnabled = !disabled
        }
    }
    @objc var autofocus: Bool = false {
        didSet {
            if autofocus {
                cardFieldView.focus()
            }
        }
    }

    private let cardFieldView = SafepayCardFieldView()

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupView()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }

    @objc func focus() {
        cardFieldView.focus()
    }

    @objc func blur() {
        cardFieldView.blur()
    }

    @objc func clear() {
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

        if let number = details.number {
            card["number"] = number
        }
        if let cvc = details.cvc {
            card["cvc"] = cvc
        }

        onCardChange?(["card": card])
    }

    private func emitFocusChange(_ focus: SafepayCardFieldFocusField?) {
        onFocusChange?(["focusedField": focus?.rawValue ?? ""])
    }
}
