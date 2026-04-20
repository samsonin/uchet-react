import React, { forwardRef, useState, useEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";
import { useSnackbar } from "notistack";
import { connect } from "react-redux";
import { TextField } from "@mui/material";
import authRequest from "./authRequest";
import { bindActionCreators } from "redux";
import { init_user } from "../actions/actionCreator";
import License from "./License";
import Privacy from "./Privacy";
import { makeStyles } from "muiLegacyStyles";
import { SERVER } from '../constants';
import { clearSocialState, readSocialState } from "./socialAuthState";
import logo from '../images/logo.png';
import googleIcon from '../images/google.svg';
import telegramIcon from '../images/telegram.svg';
import yandexIcon from '../images/yandex.svg';



const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        borderRadius: 20,
        overflow: 'hidden',
        background: 'var(--surface)',
        color: 'var(--text)',
        boxShadow: 'var(--shadow-soft)',
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
        color: 'var(--text)',
    },
    statusChip: {
        display: 'none',
    },
    title: {
        margin: 0,
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--text)',
    },
    subtitle: {
        display: 'none',
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
        borderTop: '1px solid var(--line-soft)',
        borderBottom: '1px solid var(--line-soft)',
        paddingTop: '14px !important',
        paddingBottom: '14px !important',
        color: 'var(--text)',
        lineHeight: 1.7,
        fontSize: 14,
        whiteSpace: 'pre-wrap',
    },
    field: {
        '& .MuiInputBase-root': {
            borderRadius: 12,
            background: 'var(--surface-soft)',
            color: 'var(--text)',
            transition: 'background 160ms ease, box-shadow 160ms ease',
        },
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--brand)',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--line)',
            transition: 'border-color 160ms ease, box-shadow 160ms ease',
        },
        '& .MuiOutlinedInput-root.Mui-focused': {
            background: 'var(--surface)',
            boxShadow: '0 0 0 3px var(--brand-soft)',
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--brand)',
            borderWidth: 1,
        },
        '& .MuiInputLabel-root': {
            color: 'var(--text-muted)',
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: 'var(--brand)',
        },
        '& .MuiInputBase-input': {
            color: 'var(--text)',
            caretColor: 'var(--text)',
        },
        '& .MuiFormHelperText-root': {
            color: 'var(--text-muted)',
        },
        '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px var(--surface-soft) inset',
            WebkitTextFillColor: 'var(--text)',
            caretColor: 'var(--text)',
            borderRadius: 12,
        },
        '& .MuiOutlinedInput-root.Mui-focused input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px var(--surface) inset',
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
        color: 'var(--text-muted)',
        lineHeight: 1.7,
        fontSize: 14,
    },
    inviteCard: {
        border: '1px solid var(--line)',
        borderRadius: 14,
        padding: 14,
        marginTop: 10,
        background: 'var(--surface-soft)',
    },
    inviteOrg: {
        fontSize: 15,
        fontWeight: 700,
        color: 'var(--text)',
    },
    inviteRole: {
        marginTop: 6,
        color: 'var(--text-muted)',
    },
    inviteDate: {
        marginTop: 6,
        color: 'var(--text-muted)',
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
        background: 'var(--surface)',
        border: '1px solid var(--line)',
    },
    standaloneTitle: {
        fontSize: 15,
        fontWeight: 700,
        color: 'var(--text)',
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
        background: 'var(--ink-blue-soft)',
        color: 'var(--ink-blue)',
        '&:hover': {
            background: 'var(--surface-tint)',
        },
    },
    ghostAction: {
        borderRadius: 12,
        minHeight: 42,
        padding: '9px 16px',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        color: 'var(--text)',
        '&:hover': {
            background: 'var(--surface-soft)',
        },
    },
    socialSection: {
        marginTop: 2,
        paddingTop: 12,
        borderTop: '1px solid var(--line-soft)',
    },
    socialTitle: {
        margin: '0 0 10px',
        color: 'var(--text-muted)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    },
    socialGrid: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        overflowX: 'auto',
        padding: '2px 0 4px',
    },
    socialButton: {
        width: 44,
        minWidth: 44,
        height: 44,
        borderRadius: 14,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--line)',
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-soft) 100%)',
        color: 'var(--text)',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: 13,
        boxShadow: 'var(--shadow-subtle)',
        transition: 'box-shadow 140ms ease, border-color 140ms ease, background 140ms ease',
        '&:hover': {
            background: 'var(--surface)',
            borderColor: 'var(--brand)',
            boxShadow: 'var(--shadow-soft)',
        },
    },
    socialIcon: {
        width: 24,
        height: 24,
        objectFit: 'contain',
        flexShrink: 0,
    },
    helperText: {
        display: 'none',
    },
}))

const mapDispatchToProps = dispatch => bindActionCreators({
    init_user,
}, dispatch);

const socialProviders = [
    { id: 'google', label: 'Google', icon: googleIcon },
    // { id: 'apple', label: 'Apple', icon: appleIcon },
    { id: 'telegram', label: 'Telegram', icon: telegramIcon },
    // { id: 'vk', label: 'VK', icon: vkIcon },
    { id: 'yandex', label: 'Yandex', icon: yandexIcon },
    // { id: 'sber', label: 'Sber', icon: sberIcon },
];

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

    const standaloneAllowed = availableRegistrationModes.includes('standalone') || invites.length === 0;
    const shouldShowStandaloneOnly = status === 'invites' && invites.length === 0 && standaloneAllowed;
    const currentMeta = shouldShowStandaloneOnly
        ? { title: 'Завершение регистрации' }
        : (statusMeta[status] || statusMeta.signIn)
    const isLegalScreen = ['privacy', 'license'].includes(status)
    const isOAuthRegistration = Boolean(oauthState)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const token = params.get("token");
        const state = params.get("state");
        const isTelegramConnectFlow = Boolean(readSocialState("telegram", "connect"));
        const tgAuthResult = hashParams.get("tgAuthResult");
        const telegramHashAuth = (() => {
            const authKeys = ['id', 'hash', 'auth_date'];
            const hasTelegramPayload = authKeys.every(key => hashParams.get(key));

            if (!hasTelegramPayload) return '';

            return window.location.hash.replace(/^#/, '');
        })();

        if (token) {
            init(token);
            window.location.href = "/";
            return;
        }

        if (tgAuthResult || telegramHashAuth) {
            if (isTelegramConnectFlow) {
                const connectState = readSocialState("telegram", "connect");
                const authData = parseTelegramAuthResult(tgAuthResult || telegramHashAuth);

                if (!connectState || !authData) {
                    clearSocialState("telegram", "connect");
                    enqueueSnackbar('Не удалось обработать ответ Telegram', {
                        variant: 'error'
                    });
                    return;
                }

                const form = document.createElement("form");
                form.method = "POST";
                form.action = `${SERVER}/auth/social/telegram/connect/callback`;
                form.style.display = "none";

                const payload = {
                    ...authData,
                    state: connectState,
                };

                Object.entries(payload).forEach(([key, value]) => {
                    if (value === undefined || value === null || value === "") return;
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                clearSocialState("telegram", "connect");
                form.submit();
                return;
            }

            setRequesting(true);
            completeTelegramAuth(tgAuthResult || telegramHashAuth, state)
                .finally(() => setRequesting(false));
            return;
        }

        if (window.location.pathname === '/oauth-register' && state) {
            setOauthState(state);
            setRequesting(true);

            rest(`auth/social/register-data?state=${encodeURIComponent(state)}`, 'GET', '', false, {
                auth: false,
                responseType: 'text',
                updateStore: false,
            })
                .then(async res => {
                    const text = res?.body || '';
                    let data = null;

                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        data = null;
                    }

                    if (!res || (res.status !== 200 && res.status !== 201)) {
                        enqueueSnackbar(data?.message || data?.error || 'Ошибка регистрации через соцсервис', {
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

                    if (
                        data?.mode === 'invites' ||
                        data?.mode === 'choose_registration_mode' ||
                        data?.mode === 'standalone'
                    ) {
                        setAvailableRegistrationModes(data.available_modes || []);
                        setInvites(data.invites || []);
                        setStatus('invites');
                        return;
                    }

                    enqueueSnackbar(data?.message || 'Не удалось продолжить регистрацию через соцсервис', {
                        variant: 'error'
                    });
                })
                .catch(() => enqueueSnackbar('Ошибка сети при регистрации через соцсервис', {
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

    const handleSocialLogin = provider => {
        window.location.href = `${SERVER}/auth/social/${provider}/redirect`;
    };

    const renderSocialIcon = provider => <img
        src={provider.icon}
        alt=""
        className={classes.socialIcon}
    />

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

    const submitCurrent = e => {
        if (e) e.preventDefault();

        const func = eval(status)
        if (typeof func === "function") func()
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

    const parseTelegramAuthResult = tgAuthResult => {
        const normalizeObject = value => {
            if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
            return value.id && value.hash ? value : null;
        };

        const tryJson = value => {
            try {
                return normalizeObject(JSON.parse(value));
            } catch (e) {
                return null;
            }
        };

        const tryParams = value => {
            const params = new URLSearchParams(value.replace(/^#/, '').replace(/^\?/, ''));
            const result = {};

            params.forEach((paramValue, key) => {
                result[key] = paramValue;
            });

            return normalizeObject(result);
        };

        const tryDecode = value => {
            try {
                return decodeURIComponent(value);
            } catch (e) {
                return value;
            }
        };

        const tryBase64Json = value => {
            try {
                const normalizedBase64 = value
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');
                const paddedBase64 = normalizedBase64 + '='.repeat((4 - normalizedBase64.length % 4) % 4);
                const binary = window.atob(paddedBase64);
                const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
                const decoded = new TextDecoder('utf-8').decode(bytes);

                return normalizeObject(JSON.parse(decoded));
            } catch (e) {
                return null;
            }
        };

        const normalized = tgAuthResult || '';
        const decoded = tryDecode(normalized);

        return (
            tryJson(normalized) ||
            tryJson(decoded) ||
            tryBase64Json(normalized) ||
            tryBase64Json(decoded) ||
            tryParams(normalized) ||
            tryParams(decoded)
        );
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

    const completeTelegramAuth = async (tgAuthResult, oauthStateFromCallback = '') => {
        const authData = parseTelegramAuthResult(tgAuthResult);

        if (!authData) {
            enqueueSnackbar('Не удалось обработать ответ Telegram', {
                variant: 'error'
            });
            return false;
        }

        const requestData = oauthStateFromCallback
            ? { ...authData, state: oauthStateFromCallback }
            : authData;

        const res = await authRequest(requestData, 'auth/social/telegram/callback');

        if (res?.ok) {
            const { data, text } = await readAuthResponse(res);
            const authToken = data?.token || text;

            if (authToken && init(authToken)) {
                const cleanUrl = window.location.pathname + window.location.search;
                window.history.replaceState({}, document.title, cleanUrl);
                window.location.href = '/';
                return true;
            }

            if (
                data?.mode === 'invites' ||
                data?.mode === 'choose_registration_mode' ||
                data?.mode === 'standalone'
            ) {
                if (data?.email) setLogin(data.email);
                if (data?.name) setName(data.name);
                if (data?.state) setOauthState(data.state);
                else if (oauthStateFromCallback) setOauthState(oauthStateFromCallback);
                setAvailableRegistrationModes(data.available_modes || []);
                setInvites(data.invites || []);
                setStatus('invites');

                const cleanUrl = window.location.pathname + window.location.search;
                window.history.replaceState({}, document.title, cleanUrl);
                return true;
            }
        }

        enqueueSnackbar('Не удалось завершить вход через Telegram', {
            variant: 'error'
        });

        return false;
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

        if (!trimmedOrganizationName) {
            enqueueSnackbar("Введите название организации", { variant: "error" });
            return;
        }

        if (requesting) return
        setRequesting(true)

        const requestData = isOAuthRegistration
            ? {
                state: oauthState,
                register_mode: 'standalone',
                organization_name: trimmedOrganizationName,
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
                    if (
                        data?.mode === 'invites' ||
                        data?.mode === 'choose_registration_mode' ||
                        data?.mode === 'standalone'
                    ) {
                        setAvailableRegistrationModes(data.available_modes || []);
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

        if (n === 'privacyNotice') return <DialogContentText
            key={'fieldkeyinloginmodal' + n}
            className={classes.legalText}
        >
            Нажимая "Запросить код регистрации", вы принимаете
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

        else if (n === 'invites') return renderInvites()
        else if (n === 'privacy') return <Privacy key="login-modal-privacy" />
        else if (n === 'license') return <License key="login-modal-license" />

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
                autoComplete="username"
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
                autoComplete={
                    n === 'password'
                        ? 'current-password'
                        : n === 'password2'
                            ? 'new-password'
                            : n === 'code'
                                ? 'one-time-code'
                                : 'off'
                }
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


    const renderInvite = invite => (
        <div
            key={invite.id || invite.invite_id}
            className={classes.inviteCard}
        >
            <div className={classes.inviteOrg}>{invite.organization_name}</div>
            <div className={classes.inviteRole}>{invite.position_name || "Без должности"}</div>
            <div className={classes.inviteDate}>Создано: {invite.created_at || "дата не указана"}</div>

            <div className={classes.inviteActions}>
                {false && <Button
                    variant="contained"
                    className={classes.primaryAction}
                    onClick={() => acceptInvite(invite.id || invite.invite_id)}
                >
                    Принять приглашение
                </Button>}
            </div>
        </div>
    );

    const renderInvites = () => (
        <div>
            {invites.length > 0 ? (
                <>
                    <DialogContentText className={classes.legalText}>
                        Мы нашли доступные приглашения. Вы можете присоединиться к существующей организации или зарегистрироваться отдельно.
                    </DialogContentText>
                    {invites.map(renderInvite)}
                </>
            ) : (
                <DialogContentText className={classes.legalText}>
                    Мы не нашли для вас существующий аккаунт или приглашение.
                    Укажите название организации, и мы создадим для вас новую организацию, после чего вы сможете продолжить работу.
                </DialogContentText>
            )}

            {standaloneAllowed && <div className={classes.standaloneCard}>
                <div className={classes.standaloneTitle}>
                    {invites.length > 0 ? 'Зарегистрироваться отдельно' : 'Создание новой организации'}
                </div>

                <TextField
                    label="Как назвать организацию"
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    className={classes.field}
                    disabled={requesting}
                    value={organizationName}
                    onChange={e => setOrganizationName(e.target.value)}
                    helperText={invites.length > 0
                        ? 'Можно указать простое рабочее название.'
                        : 'Можно указать простое рабочее название, которое будет понятно вам и команде.'}
                />

                <DialogContentText className={classes.legalText}>
                    {invites.length > 0
                        ? 'Этот вариант создаст для вас новую отдельную организацию.'
                        : 'После подтверждения мы создадим новую организацию и продолжим регистрацию.'}
                </DialogContentText>

                <Button
                    variant="contained"
                    className={`${classes.primaryAction} ${classes.standaloneButton}`}
                    disabled={requesting || !organizationName.trim()}
                    onClick={registerStandalone}
                >
                    {invites.length > 0
                        ? 'Создать новую организацию'
                        : 'Создать организацию и войти'}
                </Button>
            </div>}
        </div>
    );

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
            fields: ['name', 'login', 'privacyNotice'],
            buttons: ['back', 'register',]
        },
        register: {
            fields: ['name', 'login', 'code', 'password', 'password2'],
            buttons: ['back', 'registerConfirm']
        },
        privacy: {
            fields: ['privacy'],
            buttons: ['back', 'preRegister']
        },
        license: {
            fields: ['license'],
            buttons: ['back', 'preRegister']
        },
        'invites': {
            fields: ['invites'],
            buttons: ['back']
        }
    }

    return <Dialog
        open={props.isOpen}
        slots={{ transition: Transition }}
        keepMounted
        onClose={() => props.close()}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { className: classes.dialogPaper } }}
    >
        <form className={classes.formPane} onSubmit={submitCurrent}>
            <div className={classes.formTop}>
                <div className={classes.brandCompact}>
                    <img
                        src={logo}
                        alt="Uchet.store"
                        className={classes.logoCompact}
                    />
                    <div className={classes.screenTitle}>{currentMeta.title}</div>
                </div>

                {false && <Button
                    onClick={() => props.close()}
                    className={classes.closeButtonHidden}
                >
                    ×
                </Button>}
            </div>

            <DialogContent className={`${classes.content} ${isLegalScreen ? classes.scrollContent : ''}`}>
                {statuses[status].fields.map(f => renderField(f))}
            </DialogContent>

            <div className={classes.actions}>
                <DialogActions className={classes.actionsRow}>
                    {statuses[status].buttons.map(b => renderButton(b))}
                </DialogActions>

                {status !== 'invites' ? <div className={classes.socialSection}>
                    <div className={classes.socialTitle}>Продолжить с</div>
                    <div className={classes.socialGrid}>
                        {socialProviders.map(provider => <Button
                            key={'social-login-' + provider.id}
                            type="button"
                            aria-label={`Продолжить с ${provider.label}`}
                            title={`Продолжить с ${provider.label}`}
                            onClick={() => handleSocialLogin(provider.id)}
                            disabled={requesting}
                            className={classes.socialButton}
                        >
                            {renderSocialIcon(provider)}
                        </Button>)}
                    </div>
                </div> : null}
            </div>
        </form>
    </Dialog>
})
