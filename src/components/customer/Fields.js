import React, { useRef, useState } from "react";
import { connect } from "react-redux";

import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import TextField from "@mui/material/TextField";
import { Autocomplete } from "@mui/material";

import rest from "../Rest";
import { fioHandler, phoneNumberHandler } from "../common/InputHandlers";

const types = {
    birthday: "date",
    doc_date: "date",
};

let outCount = 0;
let inCount = 0;

const Fields = props => {
    const request = useRef(false);

    const [isDetails, setIsDetails] = useState(!props.customer.id);
    const [customers, setCustomers] = useState([]);

    const handler = (name, val) => {
        if (name === "phone_number") val = phoneNumberHandler(val);
        if (name === "fio") val = fioHandler(val);

        if (props.customer.id) return;

        const newCustomer = { ...props.customer };
        newCustomer[name] = val;
        props.setCustomer(newCustomer);
    };

    const onInputChangeAutocomplete = (value, reason, name) => {
        if (reason !== "input") return;

        handler(name, value);

        if (value.length < 6) return;

        request.current = true;
        outCount++;

        rest("customers?details=1&all=" + value)
            .then(res => {
                request.current = false;
                inCount++;
                if (res.ok && outCount === inCount) {
                    setCustomers(res.body || []);
                }
            });
    };

    const onChangeAutocomplete = (value, reason) => {
        if (reason === "clear") {
            props.setCustomer({});
        }

        if (reason !== "select-option") return;

        props.setCustomer(value);
    };

    return <div className="customer-fields-card">
        <div className="customer-fields-card-header">
            <span className="customer-fields-card-title">
                {props.customer.id ? "Клиент из базы" : "Новый клиент"}
            </span>

            <Tooltip title={isDetails ? "Короче" : "Подробнее"}>
                <IconButton onClick={() => setIsDetails(!isDetails)}>
                    {isDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Tooltip>
        </div>

        {props.allElements
            .filter(field => field.index === "customer" && field.is_valid)
            .filter(field => isDetails || ["fio", "phone_number"].includes(field.name))
            .map(field => ["fio", "phone_number"].includes(field.name)
                ? <Autocomplete
                    key={"customer-fields-key" + field.name + field.index + field.value}
                    className="customer-fields-input"
                    fullWidth
                    inputValue={props.customer[field.name] ?? ""}
                    options={customers}
                    loading={request.current}
                    onInputChange={(e, v, r) => {
                        onInputChangeAutocomplete(v, r, field.name);
                    }}
                    onChange={(e, v, r) => {
                        onChangeAutocomplete(v, r);
                    }}
                    getOptionLabel={option => option ? option[field.name] : ""}
                    isOptionEqualToValue={(option, selectedValue) =>
                        Boolean(option && selectedValue && option.id === selectedValue.id)
                    }
                    renderInput={params => <TextField
                        {...params}
                        label={field.value}
                    />}
                />
                : <TextField
                    className="customer-fields-input"
                    fullWidth
                    key={"customer-fields-key" + field.name + field.index + field.value}
                    type={types[field.name] || "text"}
                    label={field.value}
                    value={props.customer[field.name] || ""}
                    onChange={e => handler(field.name, e.target.value)}
                />
            )}
    </div>;
};

export default connect(state => state.app.fields)(Fields);
