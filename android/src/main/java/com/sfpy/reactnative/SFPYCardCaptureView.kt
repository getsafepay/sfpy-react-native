package com.sfpy.reactnative

import android.widget.FrameLayout
import com.android.safepay.network.error.PaymentError
import com.android.safepay.network.ui.card.SafepayCardCaptureConfiguration
import com.android.safepay.network.ui.card.SafepayCardCaptureController
import com.android.safepay.network.ui.card.SafepayCardCaptureEnvironment
import com.android.safepay.network.ui.card.SafepayCardCaptureResult
import com.android.safepay.network.ui.card.SafepayCardFieldView
import com.facebook.react.uimanager.ThemedReactContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SFPYCardCaptureView(
    private val reactContext: ThemedReactContext,
) : FrameLayout(reactContext) {
    interface Listener {
        fun onReady()
        fun onCardChange(details: SafepayCardFieldView.CardFieldDetails)
        fun onValidated()
        fun onError(code: String?, message: String)
        fun onProceedToAuthentication(result: SafepayCardCaptureResult)
    }

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val cardFieldView = SafepayCardFieldView(reactContext)

    private var listener: Listener? = null
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
                    listener?.onCardChange(details)
                }
            },
        )
    }

    fun setListener(listener: Listener?) {
        this.listener = listener
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
            listener?.onError(null, "CardCapture is missing required configuration.")
            return
        }

        scope.launch {
            try {
                val result =
                    withContext(Dispatchers.IO) {
                        controller.submit()
                    }
                listener?.onValidated()
                listener?.onProceedToAuthentication(result)
            } catch (error: PaymentError) {
                listener?.onError(error.code, error.msg)
            } catch (error: Exception) {
                listener?.onError(null, error.localizedMessage ?: "Unknown error")
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
            listener?.onReady()
        }
    }
}
