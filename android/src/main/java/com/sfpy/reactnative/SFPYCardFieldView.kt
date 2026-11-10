package com.sfpy.reactnative

import android.content.Context
import com.android.safepay.network.ui.card.SafepayCardFieldView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

class SFPYCardFieldView(
    context: Context,
    appContext: AppContext,
) : ExpoView(context, appContext) {
    private val onCardChange by EventDispatcher()
    private val onFocusChange by EventDispatcher()

    private val cardFieldView = SafepayCardFieldView(context)

    init {
        addView(
            cardFieldView,
            LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT),
        )

        cardFieldView.setOnCardChangeListener(
            object : SafepayCardFieldView.OnCardChangeListener {
                override fun onCardChange(details: SafepayCardFieldView.CardFieldDetails) {
                    this@SFPYCardFieldView.onCardChange(mapOf("card" to details.toEventMap()))
                }
            },
        )

        cardFieldView.setOnFocusChangeListener(
            object : SafepayCardFieldView.OnFocusChangeListener {
                override fun onFocusChange(focusedField: SafepayCardFieldView.FocusField?) {
                    this@SFPYCardFieldView.onFocusChange(
                        mapOf("focusedField" to (focusedField?.name ?: "")),
                    )
                }
            },
        )
    }

    fun setDisabled(disabled: Boolean) {
        cardFieldView.setDisabled(disabled)
    }

    fun setAutofocus(autofocus: Boolean) {
        if (autofocus) {
            cardFieldView.focus()
        }
    }

    fun focus() {
        cardFieldView.focus()
    }

    fun blur() {
        cardFieldView.blur()
    }

    fun clear() {
        cardFieldView.clear()
    }
}

internal fun SafepayCardFieldView.CardFieldDetails.toEventMap(): Map<String, Any?> =
    mapOf(
        "brand" to brand,
        "last4" to last4,
        "expiryMonth" to expiryMonth,
        "expiryYear" to expiryYear,
        "complete" to complete,
        "validNumber" to validNumber,
        "validCVC" to validCvc,
        "validExpiryDate" to validExpiryDate,
    )
