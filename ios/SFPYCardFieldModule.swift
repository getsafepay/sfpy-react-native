import ExpoModulesCore

public class SFPYCardFieldModule: Module {
    public func definition() -> ModuleDefinition {
        Name("SFPYCardField")

        View(SFPYCardFieldView.self) {
            Events("onCardChange", "onFocusChange")

            Prop("disabled") { (view: SFPYCardFieldView, disabled: Bool) in
                view.disabled = disabled
            }

            Prop("autofocus") { (view: SFPYCardFieldView, autofocus: Bool) in
                view.autofocus = autofocus
            }

            AsyncFunction("focus") { (view: SFPYCardFieldView) in
                view.focus()
            }

            AsyncFunction("blur") { (view: SFPYCardFieldView) in
                view.blur()
            }

            AsyncFunction("clear") { (view: SFPYCardFieldView) in
                view.clear()
            }
        }
    }
}
