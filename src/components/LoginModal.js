import React, {forwardRef, useEffect, useState} from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Slide from "@material-ui/core/Slide";
import {useSnackbar} from "notistack";
import {connect} from "react-redux";
import {TextField} from "@material-ui/core";
import doubleRequest from "./doubleRequest";
import {bindActionCreators} from "redux";
import {init_user, upd_app} from "../actions/actionCreator";
import License from "./License";
import Privacy from "./Privacy";
import {makeStyles} from "@material-ui/core/styles";


const parseJwt = token => {

    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)

}

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

    const {enqueueSnackbar} = useSnackbar()

    const classes = useStyles()

    const isLoginValid = login => {

        const r = /^\w+@\w+\.\w{2,5}$/i;
        const n = +login;

        return (r.test(login) || !(isNaN(n) || n < 999999 || n > 99999999999999))

    }

    const init = jwt => {

        if (typeof jwt !== 'string') return false;

        let payload = parseJwt(jwt);
        if (typeof payload !== 'object') return false;

        props.init_user(jwt, +payload.user_id, +payload.organization_id, payload.admin, payload.exp);

        return true;
    }

    const keyPress = e => {
        if (typeof e === 'undefined') return false;
        if (e.key === 'Enter') signIn()
    }

    const signIn = (isDemo = false) => {

        doubleRequest({
            login: isDemo ? 'mail@uchet.store' : login,
            password: isDemo ? '1' : password
        }, 'login')
            .then(res => res.text())
            .then(res => {
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

    const restore = nextStatus => {

        doubleRequest({login}, 'codes')
            .then(res => res.status === 200
                ? setStatus(nextStatus)
                : enqueueSnackbar('Неправильный номер телефона или email', {
                    variant: 'error'
                }))

    }

    const nameField = () => <TextField
        id="name"
        margin="dense"
        label="Ваше имя"
        fullWidth
        value={name}
        onChange={e => setName(e.target.value)}
    />

    const loginField = () => <TextField
        id="login"
        autoFocus
        margin="dense"
        label="Номер телефона или email"
        fullWidth
        value={login}
        onChange={e => setLogin(e.target.value)}
        error={!isLoginValid(login)}
        disabled={status !== 'signIn'}
    />

    const passField = () => <TextField
        id="password"
        margin="dense"
        label="Пароль"
        type="password"
        fullWidth
        value={password}
        onChange={e => setPassword(e.target.value)}
    />

    const pass2Field = () => <TextField
        id="password2"
        margin="dense"
        label="Повторить пароль"
        type="password"
        fullWidth
        value={password2}
        onChange={e => setPassword2(e.target.value)}
    />

    const codeField = () => <TextField
        margin="dense"
        label="Код из сообщения"
        fullWidth
        value={code}
        onChange={e => setCode(e.target.value)}
    />

    const privacyField = () => <DialogContentText>
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

    const signInButton = () => <Button onClick={() => signIn()} color="primary">
        Вход
    </Button>

    const backButton = () => <Button onClick={() => setStatus('signIn')} color="secondary">
        Назад
    </Button>

    const preRestoreButton = () => <Button onClick={() => pre('preRestore')} color="secondary">
        Забыли пароль?
    </Button>

    const restoreButton = () => <Button onClick={() => restore('restore')} color="primary">
        Запросить код восстановления
    </Button>

    const restoreConfirmButton = () => <Button onClick={() => setStatus('restore')} color="primary">
        Подтвердить
    </Button>

    const preRegisterButton = () => <Button onClick={() => pre('preRegister')} color="primary">
        Регистрация
    </Button>

    const registerButton = () => <Button onClick={() => restore('register')} color="primary">
        Запросить код регистрации
    </Button>

    const registerConfirmButton = () => <Button onClick={() => setStatus('register')} color="primary">
        Зарегистрироваться
    </Button>

    const demoButton = () => <Button onClick={() => signIn(true)}>
        Демо доступ
    </Button>

    const statuses = {
        signIn: {
            fields: [
                loginField(),
                passField()
            ],
            buttons: [
                signInButton(),
                preRestoreButton(),
                preRegisterButton(),
                demoButton()
            ],
        },
        preRestore: {
            fields: [
                loginField(),
            ],
            buttons: [
                backButton(),
                restoreButton()
            ]
        },
        restore: {
            fields: [
                loginField(),
                passField(),
                pass2Field(),
                codeField()
            ],
            buttons: [
                backButton(),
                restoreConfirmButton()
            ]
        },
        preRegister: {
            fields: [
                nameField(),
                loginField(),
                passField(),
                pass2Field(),
                privacyField()
            ],
            buttons: [
                backButton(),
                registerButton(),
            ]
        },
        register: {
            fields: [
                nameField(),
                loginField(),
                codeField()
            ],
            buttons: [
                backButton(),
                registerConfirmButton()
            ]
        },
        privacy: {
            fields: [<Privacy/>],
            buttons: [
                backButton(),
                preRegisterButton()
            ]
        },
        license: {
            fields: [<License/>],
            buttons: [
                backButton(),
                preRegisterButton()
            ]
        },
    }

    return <Dialog
        open={props.isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => props.close()}
        onKeyPress={keyPress}
    >

        {/*<DialogTitle*/}
        {/*>*/}
        <div
            className={classes.title}
        >
            <img src="https://uchet.store/src/images/uchet.gif"
                 width="120"
                 alt="Uchet.store"/>
        </div>
        {/*</DialogTitle>*/}

        <DialogContent
            className=""
        >
            {statuses[status].fields}
        </DialogContent>

        <DialogActions className="m-2 p-2">
            {statuses[status].buttons}
        </DialogActions>

    </Dialog>
})