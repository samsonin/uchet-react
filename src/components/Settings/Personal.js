import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Typography,
    TextField
} from "@mui/material";
import { makeStyles } from "muiLegacyStyles";
import { useSnackbar } from "notistack";

import rest from "../Rest";
import { SERVER } from "../../constants";
import {
    clearSocialState,
    readSocialState,
    storeSocialState,
} from "../socialAuthState";

const RESEND_TIMEOUT = 60;
const DELETE_CONFIRM_WORD = "удалить";

const socialProviders = [
    { id: "google", label: "Google" },
    { id: "telegram", label: "Telegram" },
    { id: "yandex", label: "Yandex" },
];

const getSocialLinks = user => socialProviders.reduce((result, provider) => ({
    ...result,
    [provider.id]: !!user?.[`${provider.id}_linked`],
}), {});

const socialErrors = {
    GOOGLE_ALREADY_LINKED: "Google уже привязан к другому пользователю",
    APPLE_ALREADY_LINKED: "Apple уже привязан к другому пользователю",
    TELEGRAM_ALREADY_LINKED: "Telegram уже привязан к другому пользователю",
    VK_ALREADY_LINKED: "VK уже привязан к другому пользователю",
    YANDEX_ALREADY_LINKED: "Yandex уже привязан к другому пользователю",
    SBER_ALREADY_LINKED: "Sber уже привязан к другому пользователю",
};

const parseTelegramAuthResult = tgAuthResult => {
    const normalizeObject = value => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return null;
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
        const params = new URLSearchParams(value.replace(/^#/, "").replace(/^\?/, ""));
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
                .replace(/-/g, "+")
                .replace(/_/g, "/");
            const paddedBase64 = normalizedBase64 + "=".repeat((4 - normalizedBase64.length % 4) % 4);
            const binary = window.atob(paddedBase64);
            const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
            const decoded = new TextDecoder("utf-8").decode(bytes);

            return normalizeObject(JSON.parse(decoded));
        } catch (e) {
            return null;
        }
    };

    const normalized = tgAuthResult || "";
    const decoded = tryDecode(normalized);

    return (
        tryJson(normalized) ||
        tryJson(decoded) ||
        tryBase64Json(normalized) ||
        tryBase64Json(decoded) ||
        tryParams(normalized) ||
        tryParams(decoded)
    );
};

const useStyles = makeStyles({
    root: {
        width: "100%",
        maxWidth: 760,
        margin: "0.5rem",
    },
    card: {
        marginBottom: 10,
    },
    cardHeader: {
        backgroundColor: "#F7F7F7",
        borderBottom: "1px solid #e9ecef",
    },
    actions: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 12,
    },
    serviceRow: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    serviceList: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    serviceItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        padding: "10px 0",
        borderBottom: "1px solid #eef1f5",
    },
    dangerHeader: {
        backgroundColor: "#F7F7F7",
        borderBottom: "1px solid #e9ecef",
        color: "#b00020",
    },
});

const Personal = props => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();

    const auth = props.auth;
    const user = (props.app.users || []).find(u => u.id === auth.user_id);
    const history = props.history;
    const locationSearch = props.location?.search || "";
    const locationHash = props.location?.hash || window.location.hash || "";
    const userName = user?.name || "";
    const userEmail = user?.email || "";
    const userPhone = user?.phone_number || "";
    const [linkedProviders, setLinkedProviders] = useState(getSocialLinks(user));
    const hasLinkedProvider = socialProviders.some(provider => !!linkedProviders[provider.id]);
    const hasPassword = user?.has_password;
    const requiresDeletePassword = hasPassword !== undefined
        ? !!hasPassword
        : !hasLinkedProvider;

    const [name, setName] = useState(userName);
    const [savingName, setSavingName] = useState(false);
    const [nameError, setNameError] = useState("");

    const [email, setEmail] = useState(userEmail);
    const [emailCode, setEmailCode] = useState("");
    const [emailStep, setEmailStep] = useState(1);
    const [savingEmail, setSavingEmail] = useState(false);
    const [confirmingEmail, setConfirmingEmail] = useState(false);
    const [emailResendLeft, setEmailResendLeft] = useState(0);
    const [emailError, setEmailError] = useState("");
    const [emailCodeError, setEmailCodeError] = useState("");

    const [phone, setPhone] = useState(userPhone);
    const [phoneCode, setPhoneCode] = useState("");
    const [phoneStep, setPhoneStep] = useState(1);
    const [savingPhone, setSavingPhone] = useState(false);
    const [confirmingPhone, setConfirmingPhone] = useState(false);
    const [phoneResendLeft, setPhoneResendLeft] = useState(0);
    const [phoneError, setPhoneError] = useState("");
    const [phoneCodeError, setPhoneCodeError] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);
    const [currentPasswordError, setCurrentPasswordError] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [repeatPasswordError, setRepeatPasswordError] = useState("");

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleting, setDeleting] = useState(false);
    const deleteConfirmNormalized = (deleteConfirm || "").trim().toLowerCase();
    const isDeleteConfirmationValid = requiresDeletePassword
        ? !!deleteConfirm
        : deleteConfirmNormalized === DELETE_CONFIRM_WORD;

    useEffect(() => {
        setName(userName);
    }, [userName]);

    useEffect(() => {
        setEmail(userEmail);
    }, [userEmail]);

    useEffect(() => {
        setPhone(userPhone);
    }, [userPhone]);

    useEffect(() => {
        setLinkedProviders(getSocialLinks(user));
    }, [user]);

    useEffect(() => {
        rest("users/me")
            .then(res => {
                if (!res.ok || !res.body) return;

                setLinkedProviders(prev => socialProviders.reduce((result, provider) => ({
                    ...result,
                    [provider.id]: res.body[`${provider.id}_linked`] === undefined
                        ? prev[provider.id]
                        : !!res.body[`${provider.id}_linked`],
                }), {}));
            });
    }, []);

    useEffect(() => {
        const search = new URLSearchParams(locationSearch);
        const hashParams = new URLSearchParams(locationHash.replace(/^#/, ""));
        const stateFromQuery = search.get("state") || "";
        const tgAuthResult = hashParams.get("tgAuthResult");
        const telegramHashAuth = (() => {
            const authKeys = ["id", "hash", "auth_date"];
            const hasTelegramPayload = authKeys.every(key => hashParams.get(key));

            if (!hasTelegramPayload) return "";

            return locationHash.replace(/^#/, "");
        })();

        if (stateFromQuery) {
            storeSocialState("telegram", stateFromQuery, "connect");
        }

        let handled = false;

        socialProviders.forEach(provider => {
            const value = search.get(`${provider.id}_connected`);

            if (value === "1") {
                handled = true;
                setLinkedProviders(prev => ({ ...prev, [provider.id]: true }));
                enqueueSnackbar(`${provider.label} успешно привязан`, { variant: "success" });
            }

            if (value === "0") {
                handled = true;
                setLinkedProviders(prev => ({ ...prev, [provider.id]: false }));
                enqueueSnackbar(
                    socialErrors[search.get("error")] || `Ошибка привязки ${provider.label}`,
                    { variant: "error" }
                );
            }
        });

        if (handled) {
            clearSocialState("telegram", "connect");
            history.replace("/settings/personal");
            return;
        }

        const state = stateFromQuery || readSocialState("telegram", "connect");

        if (!state || !(tgAuthResult || telegramHashAuth)) return;

        const authData = parseTelegramAuthResult(tgAuthResult || telegramHashAuth);

        if (!authData) {
            enqueueSnackbar("Не удалось обработать ответ Telegram", { variant: "error" });
            history.replace("/settings/personal");
            return;
        }

        rest("users/me")
            .then(me => {
                const isLinked = !!me.body?.telegram_linked;

                if (isLinked) {
                    setLinkedProviders(prev => ({ ...prev, telegram: true }));
                    enqueueSnackbar("Telegram успешно привязан", { variant: "success" });
                } else {
                    enqueueSnackbar("Привязка Telegram не сохранилась", { variant: "error" });
                }
            })
            .catch(() => {
                enqueueSnackbar("Ошибка привязки Telegram", { variant: "error" });
            })
            .finally(() => {
                clearSocialState("telegram", "connect");
                history.replace("/settings/personal");
            });
    }, [enqueueSnackbar, history, locationHash, locationSearch]);

    useEffect(() => {
        if (emailResendLeft <= 0) return;

        const timer = setTimeout(() => {
            setEmailResendLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [emailResendLeft]);

    useEffect(() => {
        if (phoneResendLeft <= 0) return;

        const timer = setTimeout(() => {
            setPhoneResendLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [phoneResendLeft]);

    const validateEmail = value => {
        const v = (value || "").trim();

        if (!v) return "Email обязателен";

        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(v)) return "Некорректный email";

        return "";
    };

    const validatePhone = value => {
        const v = (value || "").trim();

        if (!v) return "Телефон обязателен";

        const normalized = v.replace(/[\s\-()+]/g, "");
        if (!/^\d{10,15}$/.test(normalized)) {
            return "Некорректный номер телефона";
        }

        return "";
    };

    const validateName = value => {
        const v = (value || "").trim();

        if (!v) return "Имя обязательно";
        if (v.length < 2) return "Имя должно быть не короче 2 символов";

        return "";
    };

    const validatePassword = () => {
        let ok = true;

        if (!currentPassword) {
            setCurrentPasswordError("Введите текущий пароль");
            ok = false;
        } else {
            setCurrentPasswordError("");
        }

        if (!newPassword) {
            setNewPasswordError("Введите новый пароль");
            ok = false;
        } else if (newPassword.length < 6) {
            setNewPasswordError("Новый пароль должен быть не короче 6 символов");
            ok = false;
        } else {
            setNewPasswordError("");
        }

        if (!repeatPassword) {
            setRepeatPasswordError("Повторите новый пароль");
            ok = false;
        } else if (newPassword !== repeatPassword) {
            setRepeatPasswordError("Пароли не совпадают");
            ok = false;
        } else {
            setRepeatPasswordError("");
        }

        return ok;
    };

    const changeName = () => {
        const err = validateName(name);
        setNameError(err);
        if (err) return;

        const nextName = name.trim();

        if (nextName === userName) {
            return;
        }

        setSavingName(true);

        rest("users/me", "PATCH", {
            name: nextName
        })
            .then(res => {
                if (res.ok || res.body?.ok) {
                    setName(nextName);
                    enqueueSnackbar(
                        res.body?.message || "Имя успешно изменено",
                        { variant: "success" }
                    );
                    rest("upd");
                } else {
                    enqueueSnackbar(
                        res.body?.message || "Ошибка изменения имени",
                        { variant: "error" }
                    );
                }
            })
            .catch(() => {
                enqueueSnackbar("Ошибка сети", { variant: "error" });
            })
            .finally(() => {
                setSavingName(false);
            });
    };

    const requestEmailChange = () => {
        const err = validateEmail(email);
        setEmailError(err);
        if (err) return;

        setSavingEmail(true);

        rest("users/me/email/request-change", "POST", {
            email: email.trim()
        })
            .then(res => {

                console.log(res.body, res.body?.ok)

                if (res.body?.ok) {
                    enqueueSnackbar(
                        res.body.message || "Код отправлен на новый email",
                        { variant: "success" }
                    );

                    setEmailStep(2);
                    setEmailCode("");
                    setEmailCodeError("");
                    setEmailResendLeft(res.body.resend_timeout || RESEND_TIMEOUT);
                } else {
                    enqueueSnackbar(
                        res.body?.message || "Ошибка отправки кода",
                        { variant: "error" }
                    );
                }
            })
            // .catch(() => {
            //     enqueueSnackbar("Ошибка сети", { variant: "error" });
            // })
            .finally(() => {
                setSavingEmail(false);
            });
    };

    const confirmEmailChange = () => {
        if (!emailCode.trim()) {
            setEmailCodeError("Введите код подтверждения");
            return;
        }

        setConfirmingEmail(true);

        rest("users/me/email/confirm-change", "POST", {
            email: email.trim(),
            code: emailCode.trim()
        })
            .then(res => {
                if (res.body?.ok) {
                    enqueueSnackbar(
                        res.body.message || "Email успешно изменён",
                        { variant: "success" }
                    );

                    setEmailStep(1);
                    setEmailCode("");
                    setEmailCodeError("");
                    setEmailResendLeft(0);
                } else {
                    enqueueSnackbar(
                        res.body?.message || "Ошибка подтверждения email",
                        { variant: "error" }
                    );
                }
            })
            .catch(() => {
                enqueueSnackbar("Ошибка сети", { variant: "error" });
            })
            .finally(() => {
                setConfirmingEmail(false);
            });
    };

    const requestPhoneChange = () => {
        const err = validatePhone(phone);
        setPhoneError(err);
        if (err) return;

        setSavingPhone(true);

        rest("users/me/phone/request-change", "POST", {
            phone_number: phone.trim()
        })
            .then(res => {
                if (res.body?.ok) {
                    enqueueSnackbar(
                        res.body.message || "Код отправлен на новый номер",
                        { variant: "success" }
                    );

                    setPhoneStep(2);
                    setPhoneCode("");
                    setPhoneCodeError("");
                    setPhoneResendLeft(res.body.resend_timeout || RESEND_TIMEOUT);
                } else {
                    enqueueSnackbar(
                        res.body?.message || "Ошибка отправки кода",
                        { variant: "error" }
                    );
                }
            })
            .catch(() => {
                enqueueSnackbar("Ошибка сети", { variant: "error" });
            })
            .finally(() => {
                setSavingPhone(false);
            });
    };

    const confirmPhoneChange = () => {
        if (!phoneCode.trim()) {
            setPhoneCodeError("Введите код подтверждения");
            return;
        }

        setConfirmingPhone(true);

        rest("users/me/phone/confirm-change", "POST", {
            phone_number: phone.trim(),
            code: phoneCode.trim()
        })
            .then(res => {
                if (res.body?.ok) {
                    enqueueSnackbar(
                        res.body.message || "Телефон успешно изменён",
                        { variant: "success" }
                    );

                    setPhoneStep(1);
                    setPhoneCode("");
                    setPhoneCodeError("");
                    setPhoneResendLeft(0);
                } else {
                    enqueueSnackbar(
                        res.body?.message || "Ошибка подтверждения телефона",
                        { variant: "error" }
                    );
                }
            })
            .catch(() => {
                enqueueSnackbar("Ошибка сети", { variant: "error" });
            })
            .finally(() => {
                setConfirmingPhone(false);
            });
    };

    const changePassword = () => {
        if (!validatePassword()) return;

        setSavingPassword(true);

        rest("users/me/password", "PUT", {
            current_password: currentPassword,
            new_password: newPassword
        })
            .then(res => {
                if (res.body?.ok) {
                    enqueueSnackbar(
                        res.body.message || "Пароль успешно изменён",
                        { variant: "success" }
                    );

                    setCurrentPassword("");
                    setNewPassword("");
                    setRepeatPassword("");
                    setCurrentPasswordError("");
                    setNewPasswordError("");
                    setRepeatPasswordError("");
                } else {
                    enqueueSnackbar(
                        res.body?.message || "Ошибка смены пароля",
                        { variant: "error" }
                    );
                }
            })
            .catch(() => {
                enqueueSnackbar("Ошибка сети", { variant: "error" });
            })
            .finally(() => {
                setSavingPassword(false);
            });
    };

    const getToken = () => {
        let storedAuth = {};

        try {
            storedAuth = JSON.parse(window.localStorage.getItem('auth') || '{}');
        } catch (e) {
            storedAuth = {};
        }

        return auth.jwt || storedAuth.jwt;
    };

    const linkProvider = provider => {
        const token = getToken();

        if (!token) {
            enqueueSnackbar("Ошибка авторизации", { variant: "error" });
            return;
        }

        if (provider.id === "telegram") {
            clearSocialState("telegram", "connect");
            window.location.href = `${SERVER}/auth/social/telegram/connect`;
            return;
        }

        window.location.href = `${SERVER}/auth/social/${provider.id}/connect?token=${encodeURIComponent(token)}`;
    };

    const unlinkProvider = provider => {
        rest(`auth/social/${provider.id}/disconnect`, "POST")
            .then(res => {
                if (res.body?.ok) {
                    setLinkedProviders(prev => ({ ...prev, [provider.id]: false }));
                    enqueueSnackbar(
                        res.body.message || `${provider.label} успешно отвязан`,
                        { variant: "success" }
                    );
                    rest("upd");
                } else {
                    enqueueSnackbar(
                        res.body?.message || `Ошибка отвязки ${provider.label}`,
                        { variant: "error" }
                    );
                }
            })
            .catch(() => {
                enqueueSnackbar("Ошибка сети", { variant: "error" });
            });
    };


    const deleteAccount = () => {
        if (!isDeleteConfirmationValid) return;

        setDeleting(true);

        const payload = requiresDeletePassword && deleteConfirm
            ? { current_password: deleteConfirm }
            : {};

        rest("users/me", "DELETE", payload)
            .then(res => {
                if (res.body?.ok) {
                    enqueueSnackbar(
                        res.body.message || "Аккаунт удалён",
                        { variant: "success" }
                    );
                    window.location.href = "/";
                } else {
                    enqueueSnackbar(
                        res.body?.message || "Ошибка удаления аккаунта",
                        { variant: "error" }
                    );
                }
            })
            .catch(() => {
                enqueueSnackbar("Ошибка сети", { variant: "error" });
            })
            .finally(() => {
                setDeleting(false);
            });
    };

    return (
        <div className={`${classes.root} settings-personal-page`}>
            <Card className={classes.card}>
                <CardHeader
                    title="Личные настройки"
                    subheader={userEmail}
                    className={classes.cardHeader}
                />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Имя"
                                autoComplete="name"
                                fullWidth
                                margin="dense"
                                value={name}
                                error={!!nameError}
                                helperText={nameError}
                                onChange={e => {
                                    setName(e.target.value);
                                    if (nameError) {
                                        setNameError(validateName(e.target.value));
                                    }
                                }}
                            />

                            <div className={classes.actions}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={changeName}
                                    disabled={savingName || name.trim() === userName}
                                >
                                    Сохранить имя
                                </Button>
                            </div>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card className={classes.card}>
                <CardHeader
                    title="Изменение email"
                    className={classes.cardHeader}
                />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>

                <TextField
                    label="Новый email"
                    autoComplete="username"
                    fullWidth
                    margin="dense"
                    value={email}
                    error={!!emailError}
                    helperText={emailError}
                    onChange={e => {
                        setEmail(e.target.value);
                        if (emailError) {
                            setEmailError(validateEmail(e.target.value));
                        }
                    }}
                />

                {emailStep === 2 && (
                    <TextField
                        label="Код подтверждения"
                        autoComplete="one-time-code"
                        fullWidth
                        margin="dense"
                        value={emailCode}
                        error={!!emailCodeError}
                        helperText={emailCodeError || "Код отправлен на новый email"}
                        onChange={e => {
                            setEmailCode(e.target.value);
                            if (emailCodeError) {
                                setEmailCodeError(
                                    e.target.value.trim() ? "" : "Введите код подтверждения"
                                );
                            }
                        }}
                    />
                )}

                <div className={classes.actions}>
                    {emailStep === 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={requestEmailChange}
                            disabled={savingEmail}
                        >
                            Отправить код
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={confirmEmailChange}
                                disabled={confirmingEmail}
                            >
                                Подтвердить email
                            </Button>

                            <Button
                                onClick={requestEmailChange}
                                disabled={savingEmail || emailResendLeft > 0}
                            >
                                {emailResendLeft > 0
                                    ? `Отправить повторно через ${emailResendLeft} сек`
                                    : "Отправить код снова"}
                            </Button>

                            <Button
                                onClick={() => {
                                    setEmailStep(1);
                                    setEmailCode("");
                                    setEmailCodeError("");
                                    setEmailResendLeft(0);
                                }}
                            >
                                Отмена
                            </Button>
                        </>
                    )}
                </div>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card className={classes.card}>
                <CardHeader
                    title="Изменение телефона"
                    className={classes.cardHeader}
                />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>

                <TextField
                    label="Новый телефон"
                    autoComplete="tel"
                    fullWidth
                    margin="dense"
                    value={phone}
                    error={!!phoneError}
                    helperText={phoneError}
                    onChange={e => {
                        setPhone(e.target.value);
                        if (phoneError) {
                            setPhoneError(validatePhone(e.target.value));
                        }
                    }}
                />

                {phoneStep === 2 && (
                    <TextField
                        label="Код подтверждения"
                        autoComplete="one-time-code"
                        fullWidth
                        margin="dense"
                        value={phoneCode}
                        error={!!phoneCodeError}
                        helperText={phoneCodeError || "Код отправлен на новый номер"}
                        onChange={e => {
                            setPhoneCode(e.target.value);
                            if (phoneCodeError) {
                                setPhoneCodeError(
                                    e.target.value.trim() ? "" : "Введите код подтверждения"
                                );
                            }
                        }}
                    />
                )}

                <div className={classes.actions}>
                    {phoneStep === 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={requestPhoneChange}
                            disabled={savingPhone}
                        >
                            Отправить код
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={confirmPhoneChange}
                                disabled={confirmingPhone}
                            >
                                Подтвердить телефон
                            </Button>

                            <Button
                                onClick={requestPhoneChange}
                                disabled={savingPhone || phoneResendLeft > 0}
                            >
                                {phoneResendLeft > 0
                                    ? `Отправить повторно через ${phoneResendLeft} сек`
                                    : "Отправить код снова"}
                            </Button>

                            <Button
                                onClick={() => {
                                    setPhoneStep(1);
                                    setPhoneCode("");
                                    setPhoneCodeError("");
                                    setPhoneResendLeft(0);
                                }}
                            >
                                Отмена
                            </Button>
                        </>
                    )}
                </div>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card className={classes.card}>
                <CardHeader
                    title="Смена пароля"
                    className={classes.cardHeader}
                />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>

                <TextField
                    label="Текущий пароль"
                    type="password"
                    autoComplete="current-password"
                    fullWidth
                    margin="dense"
                    value={currentPassword}
                    error={!!currentPasswordError}
                    helperText={currentPasswordError}
                    onChange={e => {
                        setCurrentPassword(e.target.value);
                        if (currentPasswordError) {
                            setCurrentPasswordError(
                                e.target.value ? "" : "Введите текущий пароль"
                            );
                        }
                    }}
                />

                <TextField
                    label="Новый пароль"
                    type="password"
                    autoComplete="new-password"
                    fullWidth
                    margin="dense"
                    value={newPassword}
                    error={!!newPasswordError}
                    helperText={newPasswordError}
                    onChange={e => {
                        setNewPassword(e.target.value);
                        if (newPasswordError) {
                            if (!e.target.value) {
                                setNewPasswordError("Введите новый пароль");
                            } else if (e.target.value.length < 6) {
                                setNewPasswordError("Новый пароль должен быть не короче 6 символов");
                            } else {
                                setNewPasswordError("");
                            }
                        }
                    }}
                />

                <TextField
                    label="Повторите новый пароль"
                    type="password"
                    autoComplete="new-password"
                    fullWidth
                    margin="dense"
                    value={repeatPassword}
                    error={!!repeatPasswordError}
                    helperText={repeatPasswordError}
                    onChange={e => {
                        setRepeatPassword(e.target.value);
                        if (repeatPasswordError) {
                            if (!e.target.value) {
                                setRepeatPasswordError("Повторите новый пароль");
                            } else if (newPassword !== e.target.value) {
                                setRepeatPasswordError("Пароли не совпадают");
                            } else {
                                setRepeatPasswordError("");
                            }
                        }
                    }}
                />

                <div className={classes.actions}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={changePassword}
                        disabled={savingPassword}
                    >
                        Изменить пароль
                    </Button>
                </div>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card className={classes.card}>
                <CardHeader
                    title="Внешние сервисы"
                    className={classes.cardHeader}
                />
                <CardContent>

                <div className={classes.serviceList}>
                    {socialProviders.map(provider => {
                        const linked = !!linkedProviders[provider.id];

                        return <div
                            className={classes.serviceItem}
                            key={"profile-social-" + provider.id}
                        >
                            <Typography variant="body1">
                                {provider.label}: {linked ? "привязан" : "не привязан"}
                            </Typography>

                            {linked ? (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => unlinkProvider(provider)}
                                >
                                    Отвязать
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={() => linkProvider(provider)}
                                >
                                    Привязать
                                </Button>
                            )}
                        </div>;
                    })}
                </div>
                </CardContent>
            </Card>

            <Card className={classes.card}>
                <CardHeader
                    title="Опасная зона"
                    className={classes.dangerHeader}
                />
                <CardContent>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setDeleteOpen(true)}
                >
                    Удалить аккаунт
                </Button>
                </CardContent>
            </Card>

            <Dialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Удаление аккаунта</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        {requiresDeletePassword
                            ? 'Это действие нельзя отменить. Для подтверждения введите текущий пароль и нажмите "Удалить аккаунт".'
                            : `Это действие нельзя отменить. Пароль для этого аккаунта не требуется. Для подтверждения введите слово "${DELETE_CONFIRM_WORD}" и нажмите "Удалить аккаунт".`}
                    </DialogContentText>

                    <TextField
                        label={requiresDeletePassword ? "Текущий пароль" : `Введите слово "${DELETE_CONFIRM_WORD}"`}
                        fullWidth
                        type={requiresDeletePassword ? "password" : "text"}
                        autoComplete="off"
                        margin="dense"
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                        helperText={requiresDeletePassword ? "" : `Подтверждение: ${DELETE_CONFIRM_WORD}`}
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            setDeleteOpen(false);
                            setDeleteConfirm("");
                        }}
                        disabled={deleting}
                    >
                        Отмена
                    </Button>

                    <Button
                        color="secondary"
                        onClick={deleteAccount}
                        disabled={deleting || !isDeleteConfirmationValid}
                    >
                        Удалить аккаунт
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default connect(state => state)(Personal);
