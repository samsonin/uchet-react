import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from "@material-ui/core";
import { useSnackbar } from "notistack";

import rest from "../Rest";

const RESEND_TIMEOUT = 60;

const Personal = props => {
    const { enqueueSnackbar } = useSnackbar();

    const auth = props.auth;
    const user = props.app.users.find(u => u.id === auth.user_id);
    const isGoogleLinked = user?.google_linked;

    const [email, setEmail] = useState(user?.email || "");
    const [emailCode, setEmailCode] = useState("");
    const [emailStep, setEmailStep] = useState(1);
    const [savingEmail, setSavingEmail] = useState(false);
    const [confirmingEmail, setConfirmingEmail] = useState(false);
    const [emailResendLeft, setEmailResendLeft] = useState(0);
    const [emailError, setEmailError] = useState("");
    const [emailCodeError, setEmailCodeError] = useState("");

    const [phone, setPhone] = useState(user?.phone_number || "");
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

    useEffect(() => {
        setEmail(user?.email || "");
    }, [user?.email]);

    useEffect(() => {
        setPhone(user?.phone_number || "");
    }, [user?.phone_number]);

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

    const linkGoogle = () => {
        rest("auth/social/google/connect", "GET")
            .then(res => {
                if (res.body?.ok && res.body?.url) {
                    enqueueSnackbar("Перенаправление в Google...", {
                        variant: "info"
                    });
                    window.location.href = res.body.url;
                } else {
                    enqueueSnackbar(
                        res.body?.message || "Ошибка привязки Google",
                        { variant: "error" }
                    );
                }
            })
            .catch(() => {
                enqueueSnackbar("Ошибка сети", { variant: "error" });
            });
    };

    const unlinkGoogle = () => {
        rest("auth/social/google/disconnect", "POST")
            .then(res => {
                if (res.body?.ok) {
                    enqueueSnackbar(
                        res.body.message || "Google успешно отвязан",
                        { variant: "success" }
                    );
                } else {
                    enqueueSnackbar(
                        res.body?.message || "Ошибка отвязки Google",
                        { variant: "error" }
                    );
                }
            })
            .catch(() => {
                enqueueSnackbar("Ошибка сети", { variant: "error" });
            });
    };


    const deleteAccount = () => {
        if (!deleteConfirm) return;

        setDeleting(true);

        rest("users/me", "DELETE", {
            current_password: deleteConfirm
        })
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
        <div style={{ padding: 20, maxWidth: 720 }}>
            <h1>Личные настройки</h1>

            <h3>Имя: {user?.name}</h3>

            <div style={{ marginTop: 24 }}>
                <h2>Изменение email</h2>

                <TextField
                    label="Новый email"
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

                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
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
            </div>

            <div style={{ marginTop: 32 }}>
                <h2>Изменение телефона</h2>

                <TextField
                    label="Новый телефон"
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

                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
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
            </div>

            <div style={{ marginTop: 32 }}>
                <h2>Смена пароля</h2>

                <TextField
                    label="Текущий пароль"
                    type="password"
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

                <div style={{ marginTop: 12 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={changePassword}
                        disabled={savingPassword}
                    >
                        Изменить пароль
                    </Button>
                </div>
            </div>

            <div style={{ marginTop: 32 }}>
                <h2>Внешние сервисы</h2>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {isGoogleLinked ? (
                        <>
                            <span>Google привязан</span>

                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={unlinkGoogle}
                            >
                                Отвязать
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={linkGoogle}
                        >
                            Привязать Google
                        </Button>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 32 }}>
                <h2 style={{ color: "#b00020" }}>Опасная зона</h2>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setDeleteOpen(true)}
                >
                    Удалить аккаунт
                </Button>
            </div>

            <Dialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Удаление аккаунта</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Это действие нельзя отменить. Для подтверждения введите текущий пароль и нажмите "Удалить аккаунт".
                    </DialogContentText>

                    <TextField
                        label="Текущий пароль"
                        fullWidth
                        type="password"
                        margin="dense"
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
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
                        disabled={deleting || !deleteConfirm}
                    >
                        Удалить аккаунт
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default connect(state => state)(Personal);