package com.sfpy.reactnative

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SFPYCardFieldModule : Module() {
    override fun definition() =
        ModuleDefinition {
            Name("SFPYCardField")

            View(SFPYCardFieldView::class) {
                Events("onCardChange", "onFocusChange")

                Prop("disabled") { view: SFPYCardFieldView, disabled: Boolean ->
                    view.setDisabled(disabled)
                }

                Prop("autofocus") { view: SFPYCardFieldView, autofocus: Boolean ->
                    view.setAutofocus(autofocus)
                }

                AsyncFunction("focus") { view: SFPYCardFieldView ->
                    view.focus()
                }

                AsyncFunction("blur") { view: SFPYCardFieldView ->
                    view.blur()
                }

                AsyncFunction("clear") { view: SFPYCardFieldView ->
                    view.clear()
                }
            }
        }
}
