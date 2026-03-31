import React, { forwardRef, useEffect, useState } from "react";
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
    const [type, setType] = useState("email");
    const [value, setValue] = useState("");
    const [positionId, setPositionId] = useState("");

    useEffect(() => {
        if (invite) {
            setType(invite.type || "email");
            setValue(invite.value || "");
            setPositionId(invite.position_id || "");
        } else {
            setType("email");
            setValue("");
            setPositionId(props.app.positions?.[0]?.id || "");
        }
    }, [invite, isOpen, props.app.positions]);

    const save = () => {
        setDisabled(true);

        const data = {
            type,
            value,
            position_id: positionId
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

                <FormControl fullWidth margin="dense" disabled={disabled}>
                    <InputLabel id="invite-type-label">Тип контакта</InputLabel>
                    <Select
                        labelId="invite-type-label"
                        value={type}
                        onChange={e => setType(e.target.value)}
                    >
                        {CONTACT_TYPES.map(item => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Контактные данные"
                    fullWidth
                    margin="dense"
                    disabled={disabled}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                />

                <FormControl fullWidth margin="dense" disabled={disabled}>
                    <InputLabel id="invite-position-label">Должность</InputLabel>
                    <Select
                        labelId="invite-position-label"
                        value={positionId}
                        onChange={e => setPositionId(e.target.value)}
                    >
                        {props.app.positions?.map(position => (
                            <MenuItem key={position.id} value={position.id}>
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
                    disabled={disabled}
                >
                    {invite && invite.id ? "Сохранить" : "Создать"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default connect(state => state)(InviteModal);