import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";

import Slide from "@material-ui/core/Slide";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import rest from "../Rest";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const CONTACT_TYPES = ["phone", "email", "telegram"];

const InviteModal = props => {
    const { isOpen, close, invite } = props;

    const [disabled, setDisabled] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("email");
    const [value, setValue] = useState("");
    const [positionName, setPositionName] = useState("");

    const [nameError, setNameError] = useState("");
    const [valueError, setValueError] = useState("");

    useEffect(() => {
        const defaultPositionName = props.app.positions?.[0]?.name || "";

        if (invite) {
            const invitePositionName = invite.position_name
                || props.app.positions?.find(position => position.id === invite.position_id)?.name
                || defaultPositionName;

            setName(invite.name || "");
            setType(invite.type || "email");
            setValue(invite.value || "");
            setPositionName(invitePositionName);
        } else {
            setName("");
            setType("email");
            setValue("");
            setPositionName(defaultPositionName);
        }

        setNameError("");
        setValueError("");
    }, [invite, isOpen, props.app.positions]);

    const validateName = currentName => {
        const trimmed = (currentName || "").trim();

        if (!trimmed) {
            return "Имя обязательно";
        }

        if (trimmed.length < 2) {
            return "Имя должно быть не короче 2 символов";
        }

        return "";
    };

    const validateValue = (currentType, currentValue) => {
        const trimmed = (currentValue || "").trim();

        if (!trimmed) {
            return "Контактные данные обязательны";
        }

        if (currentType === "email") {
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(trimmed)) {
                return "Введите корректный email";
            }
        }

        if (currentType === "phone") {
            const normalized = trimmed.replace(/[\s\-()+]/g, "");
            const phoneRe = /^\d{10,15}$/;
            if (!phoneRe.test(normalized)) {
                return "Введите корректный телефон";
            }
        }

        if (currentType === "telegram") {
            const telegramRe = /^@?[a-zA-Z0-9_]{5,32}$/;
            if (!telegramRe.test(trimmed)) {
                return "Введите корректный Telegram username";
            }
        }

        return "";
    };

    const validateForm = () => {
        const nextNameError = validateName(name);
        const nextValueError = validateValue(type, value);

        setNameError(nextNameError);
        setValueError(nextValueError);

        return !nextNameError && !nextValueError;
    };

    const isFormValid = useMemo(() => {
        return !validateName(name) && !validateValue(type, value);
    }, [name, type, value]);

    const save = () => {
        if (!validateForm()) {
            return;
        }

        setDisabled(true);

        const data = {
            name: name.trim(),
            type,
            value: value.trim(),
            position_name: positionName
        };

        const request = invite && invite.id
            ? rest("invites/" + invite.id, "PUT", data)
            : rest("invites", "POST", data);

        request
            .then(res => {
                if (res.status === 200 || res.status === 201) {
                    close();
                }
            })
            .finally(() => {
                setDisabled(false);
            });
    };

    const keyPress = e => {
        if (e.key === "Enter") {
            save();
        }
    };

    return (
        <Dialog
            open={isOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={close}
            onKeyPress={keyPress}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                {invite && invite.id
                    ? "Редактирование приглашения"
                    : "Создание нового приглашения"}
            </DialogTitle>

            <DialogContent>
                <DialogContentText>
                    Заполните данные приглашения.
                </DialogContentText>

                <TextField
                    label="Имя"
                    fullWidth
                    margin="dense"
                    disabled={disabled}
                    value={name}
                    onChange={e => {
                        setName(e.target.value);
                        if (nameError) {
                            setNameError(validateName(e.target.value));
                        }
                    }}
                    error={!!nameError}
                    helperText={nameError}
                />

                <FormControl fullWidth margin="dense" disabled={disabled}>
                    <InputLabel id="invite-type-label">Тип контакта</InputLabel>
                    <Select
                        labelId="invite-type-label"
                        value={type}
                        onChange={e => {
                            const nextType = e.target.value;
                            setType(nextType);
                            if (valueError || value) {
                                setValueError(validateValue(nextType, value));
                            }
                        }}
                    >
                        {CONTACT_TYPES.map(item => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label={
                        type === "email"
                            ? "Email"
                            : type === "phone"
                                ? "Телефон"
                                : "Telegram"
                    }
                    placeholder={
                        type === "email"
                            ? "example@mail.com"
                            : type === "phone"
                                ? "+79991234567"
                                : "@username"
                    }
                    fullWidth
                    margin="dense"
                    disabled={disabled}
                    value={value}
                    onChange={e => {
                        setValue(e.target.value);
                        if (valueError) {
                            setValueError(validateValue(type, e.target.value));
                        }
                    }}
                    error={!!valueError}
                    helperText={valueError}
                />

                <FormControl fullWidth margin="dense" disabled={disabled}>
                    <InputLabel id="invite-position-label">Должность</InputLabel>
                    <Select
                        labelId="invite-position-label"
                        value={positionName}
                        onChange={e => setPositionName(e.target.value)}
                    >
                        {props.app.positions?.map(position => (
                            <MenuItem key={position.id} value={position.name}>
                                {position.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>

            <DialogActions>
                <Button onClick={close} disabled={disabled}>
                    Отмена
                </Button>

                <Button
                    onClick={save}
                    color="primary"
                    disabled={disabled || !isFormValid}
                >
                    {invite && invite.id ? "Сохранить" : "Создать"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default connect(state => state)(InviteModal);
