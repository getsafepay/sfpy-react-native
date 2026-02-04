package com.sfpy.reactnative

import com.android.safepay.network.ui.card.SafepayCardFieldView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter

class SFPYCardFieldViewManager : SimpleViewManager<SafepayCardFieldView>() {
    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): SafepayCardFieldView {
        val view = SafepayCardFieldView(reactContext)

        view.setOnCardChangeListener { details ->
            val event = createCardChangeEvent(details)
            reactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(view.id, EVENT_CARD_CHANGE, event)
        }

        view.setOnFocusChangeListener { focus ->
            val event = Arguments.createMap().apply {
                putString("focusedField", focus?.name ?: "")
            }
            reactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(view.id, EVENT_FOCUS_CHANGE, event)
        }

        return view
    }

    @ReactProp(name = "dangerouslyGetFullCardDetails")
    fun setDangerouslyGetFullCardDetails(view: SafepayCardFieldView, value: Boolean) {
        view.dangerouslyGetFullCardDetails = value
    }

    @ReactProp(name = "disabled")
    fun setDisabled(view: SafepayCardFieldView, disabled: Boolean) {
        view.setDisabled(disabled)
    }

    @ReactProp(name = "autofocus")
    fun setAutofocus(view: SafepayCardFieldView, autofocus: Boolean) {
        if (autofocus) {
            view.focus()
        }
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return mutableMapOf(
            EVENT_CARD_CHANGE to mapOf("registrationName" to "onCardChange"),
            EVENT_FOCUS_CHANGE to mapOf("registrationName" to "onFocusChange"),
        )
    }

    override fun getCommandsMap(): MutableMap<String, Int> {
        return mutableMapOf(
            "focus" to COMMAND_FOCUS,
            "blur" to COMMAND_BLUR,
            "clear" to COMMAND_CLEAR,
        )
    }

    override fun receiveCommand(
        root: SafepayCardFieldView,
        commandId: Int,
        args: com.facebook.react.bridge.ReadableArray?,
    ) {
        when (commandId) {
            COMMAND_FOCUS -> root.focus()
            COMMAND_BLUR -> root.blur()
            COMMAND_CLEAR -> root.clear()
        }
    }

    private fun createCardChangeEvent(details: SafepayCardFieldView.CardFieldDetails): WritableMap {
        val card = Arguments.createMap().apply {
            putString("brand", details.brand)
            putString("last4", details.last4)
            details.expiryMonth?.let { putInt("expiryMonth", it) } ?: putNull("expiryMonth")
            details.expiryYear?.let { putInt("expiryYear", it) } ?: putNull("expiryYear")
            putBoolean("complete", details.complete)
            putString("validNumber", details.validNumber)
            putString("validCVC", details.validCvc)
            putString("validExpiryDate", details.validExpiryDate)
            details.number?.let { putString("number", it) }
            details.cvc?.let { putString("cvc", it) }
        }

        return Arguments.createMap().apply {
            putMap("card", card)
        }
    }

    companion object {
        const val REACT_CLASS = "SFPYCardField"
        private const val EVENT_CARD_CHANGE = "topCardChange"
        private const val EVENT_FOCUS_CHANGE = "topFocusChange"
        private const val COMMAND_FOCUS = 1
        private const val COMMAND_BLUR = 2
        private const val COMMAND_CLEAR = 3
    }
}
