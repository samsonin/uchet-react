import React from "react";

export default class {

    focus(e) {
        let div = e.target.closest('div')

        div.querySelector('label').classList.add('active')
        div.querySelector('input').focus()
    }

    blur(e) {
        if (e.target.value === '' && e.target.value.trim() === '') {
            e.target.classList.remove('invalid', 'valid')
            e.target.closest('div').querySelector('label').classList.remove('active')
        }
    }

    getElement(any) {
        return typeof any === 'string'
            ? any.substr(0, 1) === '#'
                ? document.querySelector(any)
                : document.querySelector('#' + any)
            : any.target
    }

    isValid = input_id => {

        let input = this.getElement(input_id);

        let result = input.value === '';

        if (result) {
            input.classList.remove('valid');
            input.classList.add('invalid')
        } else {
            input.classList.remove('invalid');
            input.classList.add('valid')
        }

        return !result;

    };

    validate_email_phone_number(current_input_selector, other_div_selector) {

        const otherDiv = document.querySelector(other_div_selector)

        document.querySelector(current_input_selector).value.trim() === "" ?
            otherDiv.classList.remove('hideBlock') :
            otherDiv.classList.add('hideBlock')

    }

    validate_email = id_selector_elem => {

        let email = this.getElement(id_selector_elem);
        let r = /^\w+@\w+\.\w{2,5}$/i;
        let result = r.test(email.value);

        if (result) {
            email.classList.remove('invalid');
            email.classList.add('valid')
        } else {
            email.classList.remove('valid');
            email.classList.add('invalid')
        }

        return result;

    };

    validate_phone_number = id_selector_elem => {

        let phone_number = this.getElement(id_selector_elem);
        let number = +phone_number.value;

        if (isNaN(number) || number < 999999 || number > 99999999999999) {
            phone_number.classList.remove('valid')
            phone_number.classList.add('invalid')
            return false;
        } else {
            phone_number.classList.remove('invalid')
            phone_number.classList.add('valid')
            return true;
        }

    }

    validate_passwords(password_1_id, password_2_id, isNeedCheckAll) {

        if (isNeedCheckAll) {
            if (this.isValid(password_1_id) && this.isValid(password_2_id)) {
                let password = document.querySelector('#' + password_1_id);
                let password2 = document.querySelector('#' + password_2_id);
                if (password.value !== password2.value) {
                    password.classList.remove('valid');
                    password.classList.add('invalid');
                    password2.classList.remove('valid');
                    password2.classList.add('invalid');
                    return false;
                } else {
                    password.classList.remove('invalid');
                    password.classList.add('valid');
                    password2.classList.remove('invalid');
                    password2.classList.add('valid');
                    return true;
                }
            }
        } else {
            return this.isValid(password_1_id)
        }
        return false;

    }

    renderUserNameDiv(input_id, isReadonly) {
        return <div className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <i className="fas fa-user prefix grey-text"/>
            <input type="text" id={input_id} onBlur={this.blur}
                   onChange={this.isValid}
                   className="form-control validate" readOnly={isReadonly}/>
            <label className="">
                Имя
            </label>
        </div>
    }

    renderEmailDiv(div_id, input_id, onChange, isReadonly) {
        return <div id={div_id} className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <i className="fas fa-envelope prefix grey-text"/>
            <input type="text" id={input_id} onBlur={this.blur}
                   onChange={onChange}
                   className="form-control validate" readOnly={isReadonly}/>
            <label className="">
                Email
            </label>
        </div>
    }

    renderPhoneNumberDiv(div_id, input_id, onChange, isReadonly = false) {
        return <div id={div_id} className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <i className="fas fa-phone prefix grey-text"/>
            <input type="text" id={input_id} onBlur={this.blur}
                   onChange={onChange} className="form-control validate" readOnly={isReadonly}/>
            <label className="">
                Номер телефона
            </label>
        </div>
    }

    renderPasswordDiv(div_id, input_id, onChange, label, isReadOnly = false) {
        return <div id={'div_' + div_id} className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <i className="fas fa-lock prefix grey-text"/>
            <input type="password" id={input_id} onBlur={this.blur} onChange={e => onChange}
                   className="form-control validate" readOnly={isReadOnly}/>
            <label>
                {label}
            </label>
        </div>
    }

    renderConfirmationCodeDiv(input_id, label) {
        return <div className="md-form mb-5" onInput={this.focus} onClick={this.focus}>
            <i className="fas fa-check-circle prefix grey-text"/>
            <input type="text" id={input_id} onBlur={this.blur} onChange={this.isValid}
                   className="form-control validate"/>
            <label className="">{label}</label>
        </div>
    }

}
