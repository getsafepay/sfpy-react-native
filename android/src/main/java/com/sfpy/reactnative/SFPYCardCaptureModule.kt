package com.sfpy.reactnative

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SFPYCardCaptureModule : Module() {
    override fun definition() =
        ModuleDefinition {
            Name("SFPYCardCapture")

            View(SFPYCardCaptureView::class) {
                Events("onReady", "onCardChange", "onValidated", "onError", "onProceedToAuthentication")

                Prop("environment") { view: SFPYCardCaptureView, environment: String? ->
                    view.setEnvironment(environment)
                }

                Prop("authToken") { view: SFPYCardCaptureView, authToken: String? ->
                    view.setAuthToken(authToken)
                }

                Prop("tracker") { view: SFPYCardCaptureView, tracker: String? ->
                    view.setTracker(tracker)
                }

                Prop("disabled") { view: SFPYCardCaptureView, disabled: Boolean ->
                    view.setDisabled(disabled)
                }

                Prop("autofocus") { view: SFPYCardCaptureView, autofocus: Boolean ->
                    view.setAutofocus(autofocus)
                }

                AsyncFunction("submit") { view: SFPYCardCaptureView ->
                    view.submit()
                }

                AsyncFunction("clear") { view: SFPYCardCaptureView ->
                    view.clear()
                }
            }
        }
}
