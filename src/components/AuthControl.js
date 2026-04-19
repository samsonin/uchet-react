import React from "react";

export default class {

    focus(e) {
        const div = e.target.closest("div")

        div.querySelector("label").classList.add("active")
        div.querySelector("input").focus()
    }

    blur(e) {
        if (e.target.value === "" && e.target.value.trim() === "") {
            e.target.classList.remove("invalid", "valid")
            e.target.closest("div").querySelector("label").classList.remove("active")
        }
    }

    getElement(any) {
        return typeof any === "string"
            ? any.substring(0, 1) === "#"
                ? document.querySelector(any)
                : document.querySelector("#" + any)
            : any.target
    }

    isValid = inputId => {
        const input = this.getElement(inputId)
        const result = input.value === ""

        if (result) {
            input.classList.remove("valid")
            input.classList.add("invalid")
        } else {
            input.classList.remove("invalid")
            input.classList.add("valid")
        }

        return !result
    };

    validate_email_phone_number(ref, otherDivSelector) {
        const otherDiv = document.querySelector(otherDivSelector)

        ref.current.value.trim() === ""
            ? otherDiv.classList.remove("hideBlock")
            : otherDiv.classList.add("hideBlock")
    }

    validate_email = ref => {
        const email = ref.current
        const regexp = /^\w+@\w+\.\w{2,5}$/i
        const result = regexp.test(email.value)

        if (result) {
            email.classList.remove("invalid")
            email.classList.add("valid")
        } else {
            email.classList.remove("valid")
            email.classList.add("invalid")
        }

        return result
    };

    validate_phone_number = ref => {
        const phoneNumber = ref.current
        const number = +phoneNumber.value

        if (isNaN(number) || number < 999999 || number > 99999999999999) {
            phoneNumber.classList.remove("valid")
            phoneNumber.classList.add("invalid")
            return false
        }

        phoneNumber.classList.remove("invalid")
        phoneNumber.classList.add("valid")
        return true
    }

    validate_passwords(password1Id, password2Id, isNeedCheckAll) {

        if (isNeedCheckAll) {
            if (this.isValid(password1Id) && this.isValid(password2Id)) {
                const password = document.querySelector("#" + password1Id)
                const password2 = document.querySelector("#" + password2Id)
                if (password.value !== password2.value) {
                    password.classList.remove("valid")
                    password.classList.add("invalid")
                    password2.classList.remove("valid")
                    password2.classList.add("invalid")
                    return false
                }

                password.classList.remove("invalid")
                password.classList.add("valid")
                password2.classList.remove("invalid")
                password2.classList.add("valid")
                return true
            }
        } else {
            return this.isValid(password1Id)
        }

        return false
    }

    renderUserNameDiv(ref, isReadonly) {
        return <div className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <span className="prefix grey-text" aria-hidden="true">👤</span>
            <input
                type="text"
                ref={ref}
                onBlur={this.blur}
                onChange={this.isValid}
                className="form-control validate"
                readOnly={isReadonly}
            />
            <label>Имя</label>
        </div>
    }

    renderEmailDiv(divId, ref, onChange, isReadonly) {
        return <div id={divId} className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <input
                type="text"
                ref={ref}
                onBlur={this.blur}
                onChange={onChange}
                className="form-control validate"
                readOnly={isReadonly}
                autoComplete="email"
            />
            <label>Email</label>
        </div>
    }

    renderPhoneNumberDiv(divId, ref, onChange, isReadonly = false) {
        return <div id={divId} className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <span className="prefix grey-text" aria-hidden="true">☎</span>
            <input
                type="text"
                ref={ref}
                onBlur={this.blur}
                onChange={onChange}
                className="form-control validate"
                readOnly={isReadonly}
                autoComplete="tel"
            />
            <label>Номер телефона</label>
        </div>
    }

    renderPasswordDiv(divId, inputId, onChange, label, isReadOnly = false) {
        const lowerId = String(inputId || "").toLowerCase()
        const lowerLabel = String(label || "").toLowerCase()
        const autoComplete = lowerId.includes("new") || lowerId.includes("repeat") || lowerId.includes("confirm")
        || lowerLabel.includes("нов")
            ? "new-password"
            : "current-password"

        return <div id={"div_" + divId} className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <span className="prefix grey-text" aria-hidden="true">●</span>
            <input
                type="password"
                id={inputId}
                onBlur={this.blur}
                onChange={onChange}
                autoComplete={autoComplete}
                className="form-control validate"
                readOnly={isReadOnly}
            />
            <label>{label}</label>
        </div>
    }

    renderConfirmationCodeDiv(inputId, label) {
        return <div className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <span className="prefix grey-text" aria-hidden="true">✓</span>
            <input
                type="text"
                id={inputId}
                onBlur={this.blur}
                onChange={this.isValid}
                className="form-control validate"
                autoComplete="one-time-code"
            />
            <label>{label}</label>
        </div>
    }

}
