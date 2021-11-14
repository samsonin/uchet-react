import React, {forwardRef, useState} from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Slide from "@material-ui/core/Slide";
import {useSnackbar} from "notistack";
import {connect} from "react-redux";
import {TextField} from "@material-ui/core";
import doubleRequest from "./doubleRequest";
import rest from "./Rest";
import {bindActionCreators} from "redux";
import {init_user, upd_app} from "../actions/actionCreator";
import License from "./License";
import Privacy from "./Privacy";
import {makeStyles} from "@material-ui/core/styles";


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    title: {
        margin: '1rem',
        alignSelf: 'center',
    },
    span: {
        margin: 10,
        cursor: 'pointer',
        textDecoration: 'underline'
    },
}))

const mapDispatchToProps = dispatch => bindActionCreators({
    init_user,
    upd_app
}, dispatch);

export default connect(state => state, mapDispatchToProps)(props => {

    // signIn, preRestore, restore, preRegister, register, privacy, license
    const [status, setStatus] = useState('signIn')

    const [name, setName] = useState('')
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [code, setCode] = useState('')

    const [requesting, setRequesting] = useState(false)

    const {enqueueSnackbar} = useSnackbar()

    const classes = useStyles()

    const isLoginValid = login => {

        const r = /^\w+@\w+\.\w{2,5}$/i;
        const n = +login;

        return (r.test(login) || !(isNaN(n) || n < 999999 || n > 99999999999999))

    }

    const init = jwt => {

        if (typeof jwt !== 'string') return false;

        let payload = props.parseJwt(jwt);
        if (typeof payload !== 'object') return false;

        props.init_user(jwt, +payload.user_id, +payload.organization_id, payload.admin, payload.exp, payload.position_id);

        return true;
    }

    const keyPress = e => {
        if (e && e.key === 'Enter') {

            const func = eval(status)
            if (typeof func === "function") func()

        }
    }

    const signIn = (isDemo = false) => {

        if (requesting) return
        setRequesting(true)

        doubleRequest({
            login: isDemo ? 'mail@uchet.store' : login,
            password: isDemo ? '1' : password
        }, 'login')
            .then(res => res.text())
            .then(res => {

                setRequesting(false)

                try {
                    init(res)
                } catch (e) {
                    enqueueSnackbar('Неправильный логин или пароль',
                        {variant: 'error'}
                    )
                }
            })

    }

    const pre = nextStatus => isLoginValid(login)
        ? setStatus(nextStatus)
        : enqueueSnackbar('Неправильный номер телефона или email', {
            variant: 'error'
        })

    const sendRestoreCode = () => {

        if (requesting) return
        setRequesting(true)

        doubleRequest({login}, 'codes')
            .then(res => {

                setRequesting(false)

                res.status === 200
                    ? setStatus('restore')
                    : enqueueSnackbar('Неправильный номер телефона или email', {
                        variant: 'error'
                    })
            })

    }

    const sendRegisterCode = () => {

        rest('codes/register', 'POST', {login})
            .then(res => res.status === 200
                ? setStatus('register')
                : enqueueSnackbar('ошибка: ' + res.body.error, {
                    variant: 'error'
                }))

    }

    const confirm = (successText) => {

        if (password !== password2) return enqueueSnackbar('Пароли не совпадают', {
            variant: 'error'
        })

        if (requesting) return
        setRequesting(true)

        doubleRequest({
            name,
            login,
            code,
            password
        }, status)
            .then(res => {

                setRequesting(false)

                if (res.status === 200) {

                    enqueueSnackbar(successText, {
                        variant: 'success'
                    })

                    init(res.text())

                    return setStatus('signIn')

                }

                enqueueSnackbar('ошибка: ' + res, {
                    variant: 'error'
                })

            })

    }

    const renderField = n => {

        if (n === 'privacy') return <DialogContentText
            key={'fieldkeyinloginmodal' + n}
        >
            <br/>
            Нажимая "Запросить код", вы принимаете
            <span
                className={classes.span}
                onClick={() => setStatus('license')}
            >
            Пользовательское соглашение
        </span>
            и даете согласие на
            <span
                className={classes.span}
                onClick={() => setStatus('privacy')}
            >
            обработку персональных данных
        </span>
        </DialogContentText>

        const fields = {
            name: {l: 'Ваше имя', a: e => setName(e.target.value), v: name},
            password: {l: 'Пароль', a: e => setPassword(e.target.value), v: password},
            password2: {l: 'Повторить пароль', a: e => setPassword2(e.target.value), v: password2},
            code: {l: 'Код из сообщения', a: e => setCode(e.target.value), v: code},
        }

        return n === 'login'
            ? <TextField
                key={'fieldkeyinloginmodal' + n}
                id="login"
                autoFocus={true}
                margin="dense"
                label="Номер телефона или email"
                fullWidth
                value={login}
                onChange={e => setLogin(e.target.value)}
                error={!isLoginValid(login)}
                disabled={status !== 'signIn'}
            />
            : <TextField
                key={'fieldkeyinloginmodal' + n}
                id={n}
                type={n.length > 7 ? 'password' : 'text'}
                margin="dense"
                label={fields[n].l}
                fullWidth
                value={fields[n].v}
                onChange={fields[n].a}
            />

    }

    const colors = ['default', 'primary', 'secondary']

    const buttons = {
        signIn: {a: () => signIn(), color: 1, text: 'Вход'},
        back: {a: () => setStatus('signIn'), color: 2, text: 'Назад'},
        preRestore: {a: () => pre('preRestore'), color: 2, text: 'Забыли пароль?'},
        restore: {a: () => sendRestoreCode(), color: 1, text: 'Запросить код восстановления'},
        restoreConfirm: {a: () => confirm('Пароль изменен!'), color: 1, text: 'Подтвердить'},
        preRegister: {a: () => pre('preRegister'), color: 1, text: 'Регистрация'},
        register: {a: () => sendRegisterCode('register'), color: 1, text: 'Запросить код регистрации'},
        registerConfirm: {
            a: () => confirm('Поздравляем, Вы зарегистрированны!'), color: 1,
            text: 'Зарегистрироваться'
        },
        demo: {a: () => signIn(true), color: 0, text: 'Демо'},
    }

    const renderButton = name => <Button onClick={buttons[name].a}
                                         color={colors[buttons[name].color]}
                                         key={'buttonskeyinloginmodal' + name}
                                         disabled={requesting}
    >
        {buttons[name].text}
    </Button>

    const statuses = {
        signIn: {
            fields: ['login', 'password'],
            buttons: ['signIn', 'preRestore', 'preRegister', 'demo'],
        },
        preRestore: {
            fields: ['login'],
            buttons: ['back', 'restore']
        },
        restore: {
            fields: ['login', 'password', 'password2', 'code'],
            buttons: ['back', 'restoreConfirm']
        },
        preRegister: {
            fields: ['name', 'login', 'password', 'password2', 'privacy'],
            buttons: ['back', 'register',]
        },
        register: {
            fields: ['name', 'login', 'code'],
            buttons: ['back', 'registerConfirm']
        },
        privacy: {
            fields: [<Privacy/>],
            buttons: ['back', 'preRegister']
        },
        license: {
            fields: [<License/>],
            buttons: ['back', 'preRegister']
        },
    }

    return <Dialog
        open={props.isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => props.close()}
        onKeyPress={keyPress}
    >

        <div
            className={classes.title}
        >
            <img src="https://uchet.store/src/images/uchet.gif"
                 width="120"
                 alt="Uchet.store"/>
        </div>

        <DialogContent>
            {statuses[status].fields.map(f => typeof f === 'string' ? renderField(f) : f)}
        </DialogContent>

        <DialogActions className="m-2 p-2">
            {statuses[status].buttons.map(b => renderButton(b))}
        </DialogActions>

    </Dialog>
})