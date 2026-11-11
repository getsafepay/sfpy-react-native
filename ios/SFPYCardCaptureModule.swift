import ExpoModulesCore

public class SFPYCardCaptureModule: Module {
    public func definition() -> ModuleDefinition {
        Name("SFPYCardCapture")

        View(SFPYCardCaptureView.self) {
            Events("onReady", "onCardChange", "onValidated", "onError", "onProceedToAuthentication")

            Prop("environment") { (view: SFPYCardCaptureView, environment: String?) in
                view.environment = environment
            }

            Prop("authToken") { (view: SFPYCardCaptureView, authToken: String?) in
                view.authToken = authToken
            }

            Prop("tracker") { (view: SFPYCardCaptureView, tracker: String?) in
                view.tracker = tracker
            }

            Prop("disabled") { (view: SFPYCardCaptureView, disabled: Bool) in
                view.disabled = disabled
            }

            Prop("autofocus") { (view: SFPYCardCaptureView, autofocus: Bool) in
                view.autofocus = autofocus
            }

            AsyncFunction("submit") { (view: SFPYCardCaptureView) in
                view.submit()
            }

            AsyncFunction("clear") { (view: SFPYCardCaptureView) in
                view.clear()
            }
        }
    }
}
