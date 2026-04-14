import React, { forwardRef, useState, useEffect } from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Slide from "@material-ui/core/Slide";
import { useSnackbar } from "notistack";
import { connect } from "react-redux";
import { TextField } from "@material-ui/core";
import authRequest from "./authRequest";
import { bindActionCreators } from "redux";
import { init_user } from "../actions/actionCreator";
import License from "./License";
import Privacy from "./Privacy";
import { makeStyles } from "@material-ui/core/styles";
import { SERVER } from '../constants';
import logo from '../images/logo.png';



const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        borderRadius: 20,
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: '0 24px 70px rgba(15, 23, 42, 0.2)',
    },
    hero: {
        position: 'relative',
        padding: '40px 32px',
        color: '#fff',
        background: 'radial-gradient(circle at top, rgba(255,255,255,0.22), transparent 32%), linear-gradient(160deg, #0f172a 0%, #1d4ed8 58%, #38bdf8 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 560,
        [theme.breakpoints.down('sm')]: {
            minHeight: 'auto',
            padding: '28px 24px',
        },
    },
    heroGlow: {
        position: 'absolute',
        width: 220,
        height: 220,
        right: -80,
        top: -40,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
        filter: 'blur(10px)',
        pointerEvents: 'none',
    },
    brandRow: {
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    brandMark: {
        width: 52,
        height: 52,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.16)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
    },
    brandImage: {
        width: 34,
        height: 34,
        objectFit: 'contain',
    },
    brandLabel: {
        fontSize: 12,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        opacity: 0.72,
        marginBottom: 4,
    },
    brandTitle: {
        fontSize: 24,
        fontWeight: 700,
        lineHeight: 1.15,
    },
    heroContent: {
        position: 'relative',
        zIndex: 1,
        marginTop: 40,
        maxWidth: 260,
        [theme.breakpoints.down('sm')]: {
            marginTop: 28,
            maxWidth: 'none',
        },
    },
    heroEyebrow: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 12px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.18)',
        fontSize: 12,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 18,
    },
    heroHeading: {
        margin: 0,
        fontSize: 36,
        lineHeight: 1.05,
        fontWeight: 700,
    },
    heroText: {
        marginTop: 16,
        fontSize: 15,
        lineHeight: 1.7,
        color: 'rgba(255,255,255,0.82)',
    },
    heroFooter: {
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gap: 12,
        marginTop: 32,
    },
    metricCard: {
        padding: '14px 16px',
        borderRadius: 18,
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.16)',
        backdropFilter: 'blur(12px)',
    },
    metricTitle: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        opacity: 0.68,
        marginBottom: 6,
    },
    metricText: {
        fontSize: 15,
        lineHeight: 1.5,
    },
    formPane: {
        padding: '28px 30px 24px',
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.down('sm')]: {
            padding: '24px 18px 20px',
        },
    },
    formTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    brandCompact: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
    },
    logoCompact: {
        width: 56,
        height: 56,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: 700,
        color: '#0f172a',
    },
    statusChip: {
        display: 'none',
    },
    title: {
        margin: 0,
        fontSize: 22,
        fontWeight: 700,
        color: '#0f172a',
    },
    subtitle: {
        display: 'none',
    },
    closeButton: {
        minWidth: 'auto',
        padding: 0,
        color: '#94a3b8',
        fontSize: 28,
        lineHeight: 1,
    },
    content: {
        padding: '0 !important',
        display: 'grid',
        gap: 12,
        minHeight: 0,
    },
    scrollContent: {
        maxHeight: 'min(58vh, 520px)',
        overflowY: 'auto',
        paddingRight: '10px !important',
        borderTop: '1px solid #eef2f7',
        borderBottom: '1px solid #eef2f7',
        paddingTop: '14px !important',
        paddingBottom: '14px !important',
        color: '#334155',
        lineHeight: 1.7,
        fontSize: 14,
        whiteSpace: 'pre-wrap',
    },
    field: {
        '& .MuiInputBase-root': {
            borderRadius: 12,
            background: '#fff',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d7deea',
        },
        '& .MuiInputLabel-root': {
            color: '#64748b',
        },
    },
    span: {
        margin: '0 6px',
        cursor: 'pointer',
        textDecoration: 'underline',
        textDecorationColor: 'rgba(29, 78, 216, 0.35)',
        color: '#1d4ed8',
        fontWeight: 600,
    },
    legalText: {
        margin: 0,
        padding: '4px 2px 0',
        color: '#64748b',
        lineHeight: 1.7,
        fontSize: 14,
    },
    inviteCard: {
        border: '1px solid #dbe4f0',
        borderRadius: 14,
        padding: 14,
        marginTop: 10,
        background: '#f8fbff',
    },
    inviteOrg: {
        fontSize: 15,
        fontWeight: 700,
        color: '#0f172a',
    },
    inviteRole: {
        marginTop: 6,
        color: '#64748b',
    },
    inviteDate: {
        marginTop: 6,
        color: '#94a3b8',
        fontSize: 13,
    },
    inviteActions: {
        marginTop: 14,
        display: 'flex',
        gap: 8,
    },
    standaloneCard: {
        marginTop: 14,
        padding: 14,
        borderRadius: 14,
        background: '#ffffff',
        border: '1px solid #dbe4f0',
    },
    standaloneTitle: {
        fontSize: 15,
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: 10,
    },
    standaloneButton: {
        marginTop: 10,
        width: '100%',
    },
    actions: {
        padding: 0,
        marginTop: 18,
        display: 'grid',
        gap: 10,
    },
    actionsRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        padding: 0,
    },
    primaryAction: {
        borderRadius: 12,
        minHeight: 42,
        padding: '9px 16px',
        background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #38bdf8 100%)',
        boxShadow: '0 10px 20px rgba(37, 99, 235, 0.22)',
        color: '#fff',
        '&:hover': {
            background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 55%, #0ea5e9 100%)',
        },
    },
    secondaryAction: {
        borderRadius: 12,
        minHeight: 42,
        padding: '9px 16px',
        background: '#eef4ff',
        color: '#1d4ed8',
        '&:hover': {
            background: '#dceaff',
        },
    },
    ghostAction: {
        borderRadius: 12,
        minHeight: 42,
        padding: '9px 16px',
        background: '#fff',
        border: '1px solid #d7deea',
        color: '#334155',
        '&:hover': {
            background: '#f8fafc',
        },
    },
    googleButton: {
        borderRadius: 12,
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        border: '1px solid #d7deea',
        background: '#fff',
        color: '#0f172a',
        textTransform: 'none',
        fontWeight: 600,
        '&:hover': {
            background: '#f8fafc',
        },
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    helperText: {
        display: 'none',
    },
}))

const mapDispatchToProps = dispatch => bindActionCreators({
    init_user,
}, dispatch);

export default connect(state => state, mapDispatchToProps)(props => {

    // signIn, preRestore, restore, preRegister, register, privacy, license, invites
    const [status, setStatus] = useState('signIn')

    // const [mode, setMode] = useState("register"); // register | invites
    const [invites, setInvites] = useState([]);

    const [name, setName] = useState('')
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [code, setCode] = useState('')
    const [organizationName, setOrganizationName] = useState('')
    const [oauthState, setOauthState] = useState('')
    const [availableRegistrationModes, setAvailableRegistrationModes] = useState([])

    const [requesting, setRequesting] = useState(false)

    const { enqueueSnackbar } = useSnackbar()

    const classes = useStyles()

    const statusMeta = {
        signIn: {
            title: 'Вход',
        },
        preRestore: {
            title: 'Восстановление пароля',
        },
        restore: {
            title: 'Новый пароль',
        },
        preRegister: {
            title: 'Регистрация',
        },
        register: {
            title: 'Подтверждение',
        },
        privacy: {
            title: 'Персональные данные',
        },
        license: {
            title: 'Пользовательское соглашение',
        },
        invites: {
            title: 'Приглашения',
        },
    }

    const currentMeta = statusMeta[status] || statusMeta.signIn
    const isLegalScreen = ['privacy', 'license'].includes(status)
    const isOAuthRegistration = Boolean(oauthState)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const state = params.get("state");

        if (token) {
            init(token);
            window.location.href = "/";
            return;
        }

        if (window.location.pathname === '/oauth-register' && state) {
            setOauthState(state);
            setRequesting(true);

            fetch(`${SERVER}/auth/social/register-data?state=${encodeURIComponent(state)}`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
            })
                .then(async res => {
                    const { data, text } = await readAuthResponse(res);

                    if (!res || (res.status !== 200 && res.status !== 201)) {
                        enqueueSnackbar(data?.message || data?.error || 'Ошибка регистрации через Google', {
                            variant: 'error'
                        });
                        return;
                    }

                    const authToken = data?.token || text;

                    if (authToken && init(authToken)) {
                        window.location.href = '/';
                        return;
                    }

                    if (data?.email) setLogin(data.email);
                    if (data?.name) setName(data.name);

                    if (data?.mode === 'invites' || data?.mode === 'choose_registration_mode') {
                        setAvailableRegistrationModes(data.available_modes || []);
                        setInvites(data.invites || []);
                        setStatus('invites');
                        return;
                    }

                    enqueueSnackbar(data?.message || 'Не удалось продолжить регистрацию через Google', {
                        variant: 'error'
                    });
                })
                .catch(() => enqueueSnackbar('Ошибка сети при регистрации через Google', {
                    variant: 'error'
                }))
                .finally(() => setRequesting(false));

            return;
        }

        // if (inviteId) {
        //     setStatus('invites');
        //     authRequest({}, `invites/${inviteId}`)  
        //         .then(res => res.json())
        //         .then(res => {
        //             if (res.status === 200) {
        //                 setInvites([res.data]);
        //             } else {
        //                 enqueueSnackbar('Ошибка загрузки приглашения', { variant: 'error' });
        //             }
        //         })
        //         .catch(() => {
        //             enqueueSnackbar('Ошибка сети при загрузке приглашения', { variant: 'error' });
        //         }); 
        // }

    }, [])

    const handleGoogleLogin = () => {
        window.location.href = SERVER + '/auth/social/google/redirect';
    };

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

    const signIn = () => {

        if (requesting) return
        setRequesting(true)

        authRequest({
            login,
            password
        }, 'login')
            .then(async res => {
                if (!res) {
                    enqueueSnackbar('Ошибка сети. Сервер временно недоступен', {
                        variant: 'error'
                    });
                    return;
                }

                const text = await res.text();

                if (!res.ok || !init(text)) {
                    enqueueSnackbar('Неправильный логин или пароль',
                        { variant: 'error' }
                    )
                }
            })
            .catch(() => {
                enqueueSnackbar('Ошибка сети. Сервер временно недоступен', {
                    variant: 'error'
                });
            })
            .finally(() => setRequesting(false))

    }

    const pre = nextStatus => isLoginValid(login)
        ? setStatus(nextStatus)
        : enqueueSnackbar('Неправильный номер телефона или email', {
            variant: 'error'
        })


    const sendCode = (type) => {

        if (requesting) return
        setRequesting(true)

        authRequest({ login, type }, 'codes')
            .then(res => {
                setRequesting(false)

                if (res.status === 201) {
                    setStatus(type)
                    enqueueSnackbar('Код успешно отправлен', {
                        variant: 'success'
                    });
                } else {
                    enqueueSnackbar('ошибка: ' + res.body?.error, {
                        variant: 'error'
                    });
                }
            });
    }

    const readAuthResponse = async res => {
        if (!res) return { data: null, text: '' };

        const text = await res.text();

        try {
            return { data: JSON.parse(text), text };
        } catch (e) {
            return { data: null, text };
        }
    }

    const finishAuth = token => {
        if (!init(token)) return false;

        if (isOAuthRegistration) {
            window.location.href = '/';
            return true;
        }

        setStatus('signIn');
        return true;
    }

    const acceptInvite = inviteId => {
        if (requesting) return
        setRequesting(true)

        const requestData = isOAuthRegistration
            ? {
                state: oauthState,
                register_mode: 'invite',
                invite_id: inviteId,
            }
            : {
                invite_id: inviteId,
                register_mode: 'invite',
                name,
                login,
                code,
                password
            };

        authRequest(requestData, isOAuthRegistration ? "auth/social/register" : "register")
            .then(async res => {
                const { data, text } = await readAuthResponse(res);

                if (!res) {
                    enqueueSnackbar("Ошибка принятия приглашения", { variant: "error" });
                    return;
                }

                if (res?.status === 200 || res?.status === 201) {
                    const token = data?.token || text;

                    finishAuth(token);

                    enqueueSnackbar(
                        data?.message || "Вы успешно присоединились к организации",
                        { variant: "success" }
                    );

                    return;
                }

                enqueueSnackbar(
                    data?.message || data?.error || "Ошибка принятия приглашения",
                    { variant: "error" }
                );
            })
            .finally(() => setRequesting(false))

    };

    const registerStandalone = () => {
        const trimmedOrganizationName = organizationName.trim();

        if (!isOAuthRegistration && !trimmedOrganizationName) {
            enqueueSnackbar("Введите название организации", { variant: "error" });
            return;
        }

        if (requesting) return
        setRequesting(true)

        const requestData = isOAuthRegistration
            ? {
                state: oauthState,
                register_mode: 'standalone',
            }
            : {
                register_mode: 'standalone',
                organization_name: trimmedOrganizationName,
                name,
                login,
                code,
                password
            };

        authRequest(requestData, isOAuthRegistration ? "auth/social/register" : "register")
            .then(async res => {
                const { data, text } = await readAuthResponse(res);

                if (!res) {
                    enqueueSnackbar("Ошибка регистрации", { variant: "error" });
                    return;
                }

                if (res?.status === 200 || res?.status === 201) {
                    const token = data?.token || text;

                    finishAuth(token);

                    enqueueSnackbar(
                        data?.message || "Вы успешно зарегистрировались",
                        { variant: "success" }
                    );

                    return;
                }

                enqueueSnackbar(
                    data?.message || data?.error || "Ошибка регистрации",
                    { variant: "error" }
                );
            })
            .finally(() => setRequesting(false))
    };

    const confirm = (successText) => {

        if (password !== password2) return enqueueSnackbar('Пароли не совпадают', {
            variant: 'error'
        })

        if (requesting) return
        setRequesting(true)

        authRequest({
            name,
            login,
            code,
            password
        }, status)
            .then(async res => {
                const { data, text } = await readAuthResponse(res);

                setRequesting(false)

                if (!res) {
                    enqueueSnackbar('Ошибка сети', {
                        variant: 'error'
                    })
                    return;
                }

                if (res.status === 200 || res.status === 201) {
                    if (data?.mode === 'invites' || data?.mode === 'choose_registration_mode') {
                        setInvites(data.invites || []);
                        setStatus('invites');
                        return;
                    }

                    const token = data?.token || text;

                    enqueueSnackbar(successText, {
                        variant: 'success'
                    })

                    init(token)

                    return setStatus('signIn')
                }

                enqueueSnackbar('ошибка: ' + (data?.message || data?.error || res.status), {
                    variant: 'error'
                })

            })

    }

    const renderField = n => {

        if (n === 'privacy') return <DialogContentText
            key={'fieldkeyinloginmodal' + n}
            className={classes.legalText}
        >
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

        else if (n === 'invites') {

            console.log(n)
            return null
        }

        const fields = {
            name: { l: 'Ваше имя', a: e => setName(e.target.value), v: name },
            password: { l: 'Пароль', a: e => setPassword(e.target.value), v: password },
            password2: { l: 'Повторить пароль', a: e => setPassword2(e.target.value), v: password2 },
            code: { l: 'Код из сообщения', a: e => setCode(e.target.value), v: code },
        }

        return n === 'login'
            ? <TextField
                key={'fieldkeyinloginmodal' + n}
                id="login"
                autoFocus={true}
                margin="dense"
                label="Номер телефона или email"
                fullWidth
                variant="outlined"
                className={classes.field}
                value={login}
                onChange={e => setLogin(e.target.value)}
                error={!isLoginValid(login)}
                disabled={!['signIn', 'preRestore', 'preRegister'].includes(status)}
            />
            : <TextField
                key={'fieldkeyinloginmodal' + n}
                id={n}
                type={n.length > 7 ? 'password' : 'text'}
                margin="dense"
                label={fields[n].l}
                fullWidth
                variant="outlined"
                className={classes.field}
                value={fields[n].v}
                onChange={fields[n].a}
            />

    }

    const colors = ['default', 'primary', 'secondary']

    const buttons = {
        signIn: { a: () => signIn(), color: 1, text: 'Вход' },
        back: { a: () => setStatus('signIn'), color: 2, text: 'Назад' },
        preRestore: { a: () => pre('preRestore'), color: 2, text: 'Забыли пароль?' },
        restore: { a: () => sendCode('restore'), color: 1, text: 'Запросить код восстановления' },
        restoreConfirm: { a: () => confirm('Пароль изменен!'), color: 1, text: 'Подтвердить' },
        preRegister: { a: () => pre('preRegister'), color: 1, text: 'Регистрация' },
        register: { a: () => sendCode('register'), color: 1, text: 'Запросить код регистрации' },
        registerConfirm: {
            a: () => confirm('Поздравляем, Вы зарегистрированны!'), color: 1,
            text: 'Зарегистрироваться'
        },
    }

    const renderButton = name => <Button onClick={buttons[name].a}
        color={colors[buttons[name].color]}
        key={'buttonskeyinloginmodal' + name}
        disabled={requesting}
        variant={buttons[name].color === 1 ? 'contained' : 'text'}
        className={
            buttons[name].color === 1
                ? classes.primaryAction
                : name === 'back'
                    ? classes.ghostAction
                    : classes.secondaryAction
        }
    >
        {buttons[name].text}
    </Button>


    const Invite = ({ invite }) => (
        <div
            key={invite.id || invite.invite_id}
            className={classes.inviteCard}
        >
            <div className={classes.inviteOrg}>{invite.organization_name}</div>
            <div className={classes.inviteRole}>{invite.position_name || "Без должности"}</div>
            <div className={classes.inviteDate}>Создано: {invite.created_at || "дата не указана"}</div>

            <div className={classes.inviteActions}>
                <Button
                    variant="contained"
                    className={classes.primaryAction}
                    onClick={() => acceptInvite(invite.id || invite.invite_id)}
                >
                    Принять приглашение
                </Button>
            </div>
        </div>
    )

    const Invites = () => (
        <div>
            {invites.length > 0 ? invites.map(i => <Invite invite={i} />) : <div>Приглашений нет</div>}

            {(!isOAuthRegistration || availableRegistrationModes.includes('standalone')) && <div className={classes.standaloneCard}>
                <div className={classes.standaloneTitle}>Зарегистрироваться отдельно</div>

                {!isOAuthRegistration && <TextField
                    label="Название организации"
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    className={classes.field}
                    disabled={requesting}
                    value={organizationName}
                    onChange={e => setOrganizationName(e.target.value)}
                />}

                <Button
                    variant="contained"
                    className={`${classes.primaryAction} ${classes.standaloneButton}`}
                    disabled={requesting}
                    onClick={registerStandalone}
                >
                    Зарегистрироваться отдельно
                </Button>
            </div>}
        </div>
    )

    const statuses = {
        signIn: {
            fields: ['login', 'password'],
            buttons: ['signIn', 'preRestore', 'preRegister'],
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
            fields: ['name', 'login', 'privacy'],
            buttons: ['back', 'register',]
        },
        register: {
            fields: ['name', 'login', 'code', 'password', 'password2'],
            buttons: ['back', 'registerConfirm']
        },
        privacy: {
            fields: [<Privacy />],
            buttons: ['back', 'preRegister']
        },
        license: {
            fields: [<License />],
            buttons: ['back', 'preRegister']
        },
        'invites': {
            fields: [<Invites />],
            buttons: ['back']
        }
    }

    return <Dialog
        open={props.isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => props.close()}
        onKeyPress={keyPress}
        fullWidth
        maxWidth="xs"
        PaperProps={{ className: classes.dialogPaper }}
    >
        <div className={classes.formPane}>
            <div className={classes.formTop}>
                <div className={classes.brandCompact}>
                    <img
                        src={logo}
                        alt="Uchet.store"
                        className={classes.logoCompact}
                    />
                    <div className={classes.screenTitle}>{currentMeta.title}</div>
                </div>

                <Button
                    onClick={() => props.close()}
                    className={classes.closeButton}
                >
                    ×
                </Button>
            </div>

            <DialogContent className={`${classes.content} ${isLegalScreen ? classes.scrollContent : ''}`}>
                {statuses[status].fields.map(f => typeof f === 'string' ? renderField(f) : f)}
            </DialogContent>

            <div className={classes.actions}>
                <DialogActions className={classes.actionsRow}>
                    {statuses[status].buttons.map(b => renderButton(b))}
                </DialogActions>

                {status !== 'invites' ? <Button
                    onClick={handleGoogleLogin}
                    disabled={requesting}
                    className={classes.googleButton}
                >
                    <img
                        src="https://www.svgrepo.com/show/355037/google.svg"
                        alt="google"
                        className={classes.googleIcon}
                    />
                    Вход через Google
                </Button>
                    : null
                }
            </div>
        </div>
    </Dialog>
})
