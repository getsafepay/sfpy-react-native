import ExpoModulesCore
import SafepayiOSSDK
import UIKit

class SFPYCardCaptureView: ExpoView {
    let onReady = EventDispatcher()
    let onCardChange = EventDispatcher()
    let onValidated = EventDispatcher()
    let onError = EventDispatcher()
    let onProceedToAuthentication = EventDispatcher()

    var environment: String? {
        didSet {
            configureControllerIfPossible()
        }
    }

    var authToken: String? {
        didSet {
            configureControllerIfPossible()
        }
    }

    var tracker: String? {
        didSet {
            configureControllerIfPossible()
        }
    }

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
    private var controller: SafepayCardCaptureController?
    private var lastConfigurationKey: String?
    private var didEmitReady = false

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        setupView()
    }

    func submit() {
        guard let controller = controller else {
            emitError(code: nil, message: "CardCapture is missing required configuration.")
            return
        }

        Task { [weak self] in
            do {
                let result = try await controller.submit()
                await MainActor.run {
                    self?.onValidated([:])
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

    func clear() {
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
            let environmentValue = environment,
            let environment = parseEnvironment(environmentValue),
            let authTokenValue = authToken,
            !authTokenValue.isEmpty,
            let trackerValue = tracker,
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
            // Props arrive before the view is mounted; an event sent then is dropped.
            DispatchQueue.main.async { [weak self] in
                self?.onReady([:])
            }
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

        onCardChange(["card": card])
    }

    private func emitError(code: String?, message: String) {
        let errorPayload: [String: Any] = [
            "code": code ?? NSNull(),
            "message": message,
        ]

        onError(["error": errorPayload])
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

        onProceedToAuthentication(["result": resultPayload])
    }
}
