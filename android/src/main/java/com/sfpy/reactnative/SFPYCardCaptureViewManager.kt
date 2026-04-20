package com.sfpy.reactnative

import com.android.safepay.network.ui.card.SafepayCardCaptureResult
import com.android.safepay.network.ui.card.SafepayCardFieldView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter

class SFPYCardCaptureViewManager : SimpleViewManager<SFPYCardCaptureView>() {
    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): SFPYCardCaptureView {
        val view = SFPYCardCaptureView(reactContext)

        view.setListener(
            object : SFPYCardCaptureView.Listener {
                override fun onReady() {
                    reactContext
                        .getJSModule(RCTEventEmitter::class.java)
                        .receiveEvent(view.id, EVENT_READY, Arguments.createMap())
                }

                override fun onCardChange(details: SafepayCardFieldView.CardFieldDetails) {
                    reactContext
                        .getJSModule(RCTEventEmitter::class.java)
                        .receiveEvent(view.id, EVENT_CARD_CHANGE, createCardChangeEvent(details))
                }

                override fun onValidated() {
                    reactContext
                        .getJSModule(RCTEventEmitter::class.java)
                        .receiveEvent(view.id, EVENT_VALIDATED, Arguments.createMap())
                }

                override fun onError(code: String?, message: String) {
                    val event =
                        Arguments.createMap().apply {
                            putMap(
                                "error",
                                Arguments.createMap().apply {
                                    code?.let { putString("code", it) } ?: putNull("code")
                                    putString("message", message)
                                },
                            )
                        }
                    reactContext
                        .getJSModule(RCTEventEmitter::class.java)
                        .receiveEvent(view.id, EVENT_ERROR, event)
                }

                override fun onProceedToAuthentication(result: SafepayCardCaptureResult) {
                    val event =
                        Arguments.createMap().apply {
                            putMap(
                                "result",
                                Arguments.createMap().apply {
                                    putString("accessToken", result.accessToken)
                                    putString("deviceDataCollectionURL", result.deviceDataCollectionURL)
                                    result.cardinalJWT?.let { putString("cardinalJWT", it) } ?: putNull("cardinalJWT")
                                    putMap(
                                        "paymentMethod",
                                        Arguments.createMap().apply {
                                            putString("token", result.paymentMethod.token)
                                            putString("expirationMonth", result.paymentMethod.expirationMonth)
                                            putString("expirationYear", result.paymentMethod.expirationYear)
                                            putString("cardTypeCode", result.paymentMethod.cardTypeCode)
                                            putString("cardType", result.paymentMethod.cardType)
                                            putString("binNumber", result.paymentMethod.binNumber)
                                            putString("lastFour", result.paymentMethod.lastFour)
                                        },
                                    )
                                },
                            )
                        }
                    reactContext
                        .getJSModule(RCTEventEmitter::class.java)
                        .receiveEvent(view.id, EVENT_PROCEED_TO_AUTHENTICATION, event)
                }
            },
        )

        return view
    }

    @ReactProp(name = "environment")
    fun setEnvironment(view: SFPYCardCaptureView, value: String?) {
        view.setEnvironment(value)
    }

    @ReactProp(name = "authToken")
    fun setAuthToken(view: SFPYCardCaptureView, value: String?) {
        view.setAuthToken(value)
    }

    @ReactProp(name = "tracker")
    fun setTracker(view: SFPYCardCaptureView, value: String?) {
        view.setTracker(value)
    }

    @ReactProp(name = "disabled")
    fun setDisabled(view: SFPYCardCaptureView, disabled: Boolean) {
        view.setDisabled(disabled)
    }

    @ReactProp(name = "autofocus")
    fun setAutofocus(view: SFPYCardCaptureView, autofocus: Boolean) {
        view.setAutofocus(autofocus)
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return mutableMapOf(
            EVENT_READY to mapOf("registrationName" to "onReady"),
            EVENT_CARD_CHANGE to mapOf("registrationName" to "onCardChange"),
            EVENT_VALIDATED to mapOf("registrationName" to "onValidated"),
            EVENT_ERROR to mapOf("registrationName" to "onError"),
            EVENT_PROCEED_TO_AUTHENTICATION to
                mapOf("registrationName" to "onProceedToAuthentication"),
        )
    }

    override fun getCommandsMap(): MutableMap<String, Int> {
        return mutableMapOf(
            "submit" to COMMAND_SUBMIT,
            "clear" to COMMAND_CLEAR,
        )
    }

    override fun receiveCommand(
        root: SFPYCardCaptureView,
        commandId: Int,
        args: com.facebook.react.bridge.ReadableArray?,
    ) {
        when (commandId) {
            COMMAND_SUBMIT -> root.submit()
            COMMAND_CLEAR -> root.clear()
        }
    }

    private fun createCardChangeEvent(details: SafepayCardFieldView.CardFieldDetails): WritableMap {
        val card =
            Arguments.createMap().apply {
                putString("brand", details.brand)
                putString("last4", details.last4)
                details.expiryMonth?.let { putInt("expiryMonth", it) } ?: putNull("expiryMonth")
                details.expiryYear?.let { putInt("expiryYear", it) } ?: putNull("expiryYear")
                putBoolean("complete", details.complete)
                putString("validNumber", details.validNumber)
                putString("validCVC", details.validCvc)
                putString("validExpiryDate", details.validExpiryDate)
            }

        return Arguments.createMap().apply {
            putMap("card", card)
        }
    }

    companion object {
        const val REACT_CLASS = "SFPYCardCapture"
        private const val EVENT_READY = "topReady"
        private const val EVENT_CARD_CHANGE = "topCardChange"
        private const val EVENT_VALIDATED = "topValidated"
        private const val EVENT_ERROR = "topError"
        private const val EVENT_PROCEED_TO_AUTHENTICATION = "topProceedToAuthentication"
        private const val COMMAND_SUBMIT = 1
        private const val COMMAND_CLEAR = 2
    }
}
