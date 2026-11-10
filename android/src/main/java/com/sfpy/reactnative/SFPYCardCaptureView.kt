package com.sfpy.reactnative

import android.content.Context
import com.android.safepay.network.error.PaymentError
import com.android.safepay.network.ui.card.SafepayCardCaptureConfiguration
import com.android.safepay.network.ui.card.SafepayCardCaptureController
import com.android.safepay.network.ui.card.SafepayCardCaptureEnvironment
import com.android.safepay.network.ui.card.SafepayCardCaptureResult
import com.android.safepay.network.ui.card.SafepayCardFieldView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SFPYCardCaptureView(
    context: Context,
    appContext: AppContext,
) : ExpoView(context, appContext) {
    private val onReady by EventDispatcher()
    private val onCardChange by EventDispatcher()
    private val onValidated by EventDispatcher()
    private val onError by EventDispatcher()
    private val onProceedToAuthentication by EventDispatcher()

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val cardFieldView = SafepayCardFieldView(context)

    private var controller: SafepayCardCaptureController? = null
    private var environment: String? = null
    private var authToken: String? = null
    private var tracker: String? = null
    private var lastConfigurationKey: String? = null
    private var didEmitReady = false

    init {
        addView(
            cardFieldView,
            LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT),
        )

        cardFieldView.setOnCardChangeListener(
            object : SafepayCardFieldView.OnCardChangeListener {
                override fun onCardChange(details: SafepayCardFieldView.CardFieldDetails) {
                    this@SFPYCardCaptureView.onCardChange(mapOf("card" to details.toEventMap()))
                }
            },
        )
    }

    fun setEnvironment(value: String?) {
        environment = value
        configureControllerIfPossible()
    }

    fun setAuthToken(value: String?) {
        authToken = value
        configureControllerIfPossible()
    }

    fun setTracker(value: String?) {
        tracker = value
        configureControllerIfPossible()
    }

    fun setDisabled(disabled: Boolean) {
        cardFieldView.setDisabled(disabled)
    }

    fun setAutofocus(autofocus: Boolean) {
        if (autofocus) {
            cardFieldView.focus()
        }
    }

    fun submit() {
        val controller = controller
        if (controller == null) {
            emitError(null, "CardCapture is missing required configuration.")
            return
        }

        scope.launch {
            try {
                val result =
                    withContext(Dispatchers.IO) {
                        controller.submit()
                    }
                onValidated(mapOf())
                onProceedToAuthentication(mapOf("result" to result.toEventMap()))
            } catch (error: PaymentError) {
                emitError(error.code, error.msg)
            } catch (error: Exception) {
                emitError(null, error.localizedMessage ?: "Unknown error")
            }
        }
    }

    fun clear() {
        controller?.clear() ?: cardFieldView.clear()
    }

    override fun onDetachedFromWindow() {
        scope.cancel()
        super.onDetachedFromWindow()
    }

    private fun emitError(
        code: String?,
        message: String,
    ) {
        onError(mapOf("error" to mapOf("code" to code, "message" to message)))
    }

    private fun configureControllerIfPossible() {
        val resolvedEnvironment =
            environment
                ?.trim()
                ?.lowercase()
                ?.let {
                    when (it) {
                        "development" -> SafepayCardCaptureEnvironment.DEVELOPMENT
                        "sandbox" -> SafepayCardCaptureEnvironment.SANDBOX
                        "production" -> SafepayCardCaptureEnvironment.PRODUCTION
                        else -> null
                    }
                } ?: return
        val resolvedAuthToken = authToken?.takeIf { it.isNotBlank() } ?: return
        val resolvedTracker = tracker?.takeIf { it.isNotBlank() } ?: return

        val configurationKey = "${resolvedEnvironment.name}|$resolvedAuthToken|$resolvedTracker"
        if (configurationKey == lastConfigurationKey) {
            return
        }

        controller =
            SafepayCardCaptureController(
                configuration =
                    SafepayCardCaptureConfiguration(
                        environment = resolvedEnvironment,
                        authToken = resolvedAuthToken,
                        tracker = resolvedTracker,
                    ),
                cardFieldView = cardFieldView,
            )
        lastConfigurationKey = configurationKey

        if (!didEmitReady) {
            didEmitReady = true
            // Props arrive before the view is mounted; an event sent then is dropped.
            post { onReady(mapOf()) }
        }
    }
}

private fun SafepayCardCaptureResult.toEventMap(): Map<String, Any?> =
    mapOf(
        "accessToken" to accessToken,
        "deviceDataCollectionURL" to deviceDataCollectionURL,
        "cardinalJWT" to cardinalJWT,
        "paymentMethod" to
            mapOf(
                "token" to paymentMethod.token,
                "expirationMonth" to paymentMethod.expirationMonth,
                "expirationYear" to paymentMethod.expirationYear,
                "cardTypeCode" to paymentMethod.cardTypeCode,
                "cardType" to paymentMethod.cardType,
                "binNumber" to paymentMethod.binNumber,
                "lastFour" to paymentMethod.lastFour,
            ),
    )
