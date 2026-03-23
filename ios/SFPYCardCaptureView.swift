import Foundation
import React
import SafepayiOSSDK
import UIKit

@objc(SFPYCardCaptureView)
class SFPYCardCaptureView: UIView {
    @objc var onReady: RCTDirectEventBlock?
    @objc var onCardChange: RCTDirectEventBlock?
    @objc var onValidated: RCTDirectEventBlock?
    @objc var onError: RCTDirectEventBlock?
    @objc var onProceedToAuthentication: RCTDirectEventBlock?

    @objc var environment: NSString? {
        didSet {
            configureControllerIfPossible()
        }
    }

    @objc var authToken: NSString? {
        didSet {
            configureControllerIfPossible()
        }
    }

    @objc var tracker: NSString? {
        didSet {
            configureControllerIfPossible()
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
    private var controller: SafepayCardCaptureController?
    private var lastConfigurationKey: String?
    private var didEmitReady = false

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupView()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }

    @objc func submit() {
        guard let controller = controller else {
            emitError(code: nil, message: "CardCapture is missing required configuration.")
            return
        }

        Task { [weak self] in
            do {
                let result = try await controller.submit()
                await MainActor.run {
                    self?.onValidated?([:])
                    self?.emitProceed(result)
                }
            } catch let error as PaymentError {
                await MainActor.run {
                    self?.emitError(code: error.code, message: error.message)
                }
            } catch let error as ErrorResponse {
                await MainActor.run {
                    self?.emitError(code: error.code, message: error.errorMessage)
                }
            } catch {
                await MainActor.run {
                    self?.emitError(code: nil, message: error.localizedDescription)
                }
            }
        }
    }

    @objc func clear() {
        controller?.clear() ?? cardFieldView.clear()
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
    }

    private func configureControllerIfPossible() {
        guard
            let environmentValue = environment as String?,
            let environment = parseEnvironment(environmentValue),
            let authTokenValue = authToken as String?,
            !authTokenValue.isEmpty,
            let trackerValue = tracker as String?,
            !trackerValue.isEmpty
        else {
            return
        }

        let configurationKey = "\(environment.rawValue)|\(authTokenValue)|\(trackerValue)"
        guard configurationKey != lastConfigurationKey else {
            return
        }

        controller = SafepayCardCaptureController(
            configuration: SafepayCardCaptureConfiguration(
                environment: environment,
                authToken: authTokenValue,
                tracker: trackerValue
            ),
            cardFieldView: cardFieldView
        )
        lastConfigurationKey = configurationKey

        if !didEmitReady {
            didEmitReady = true
            onReady?([:])
        }
    }

    private func parseEnvironment(_ value: String) -> SafepayCardCaptureEnvironment? {
        SafepayCardCaptureEnvironment(rawValue: value.lowercased())
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

        onCardChange?(["card": card])
    }

    private func emitError(code: String?, message: String) {
        let errorPayload: [String: Any] = [
            "code": code ?? NSNull(),
            "message": message,
        ]

        onError?(["error": errorPayload])
    }

    private func emitProceed(_ result: SafepayCardCaptureResult) {
        let resultPayload: [String: Any] = [
            "accessToken": result.accessToken,
            "deviceDataCollectionURL": result.deviceDataCollectionURL,
            "cardinalJWT": result.cardinalJWT ?? NSNull(),
            "paymentMethod": [
                "token": result.paymentMethod.token,
                "expirationMonth": result.paymentMethod.expirationMonth,
                "expirationYear": result.paymentMethod.expirationYear,
                "cardTypeCode": result.paymentMethod.cardTypeCode,
                "cardType": result.paymentMethod.cardType,
                "binNumber": result.paymentMethod.binNumber,
                "lastFour": result.paymentMethod.lastFour,
            ],
        ]

        onProceedToAuthentication?(["result": resultPayload])
    }
}
