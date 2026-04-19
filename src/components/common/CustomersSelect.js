import React, { useEffect, useRef, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import rest from "../Rest";
import { fioHandler, phoneNumberHandler } from "./InputHandlers";

const fields = ["id", "fio", "phone_number"];
const SEARCH_DEBOUNCE_MS = 400;
const hasCustomerValue = value => Boolean(
    value && typeof value === "object" && Object.values(value).some(Boolean)
);

export default function CustomersSelect(props) {

    const request = useRef(false);
    const debounceRef = useRef(null);
    const requestIdRef = useRef(0);
    const [customers, setCustomers] = useState([]);
    const [value, setValue] = useState(null);

    const upd = (name, val) => {
        props.setCustomer(prev => {
            const newState = { ...prev };
            newState[name] = val;
            return newState;
        });
    };

    useEffect(() => {
        setValue(hasCustomerValue(props.customer) ? props.customer : null);
        setCustomers([]);
    }, [props.customer]);

    useEffect(() => () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, []);

    const searchCustomers = val => {
        const requestId = ++requestIdRef.current;
        request.current = true;

        rest("customers?all=" + val)
            .then(res => {
                if (requestId !== requestIdRef.current) return;

                request.current = false;
                if (res.ok) setCustomers(res.body || []);
            })
            .catch(() => {
                if (requestId !== requestIdRef.current) return;
                request.current = false;
                setCustomers([]);
            });
    };

    const handlerInput = (val, reason, name) => {
        if (reason === "clear") {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            requestIdRef.current++;
            request.current = false;
            setCustomers([]);
            upd("phone_number", "");
            upd("fio", "");
            upd("id", 0);
            setValue(null);
            return;
        }

        if (reason !== "input") return;

        if (name === "phone_number") val = phoneNumberHandler(val);
        if (name === "fio") val = fioHandler(val);

        upd(name, val);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (val.length < 6) {
            requestIdRef.current++;
            request.current = false;
            setCustomers([]);
            return;
        }

        debounceRef.current = setTimeout(() => {
            searchCustomers(val);
        }, SEARCH_DEBOUNCE_MS);
    };

    const handler = val => {
        setValue(val || null);
        if (val) fields.map(f => upd(f, val[f]));
        setCustomers([]);
    };

    return <div className="customers-select">
        {!props.onlySearch && <div className="customers-select-status">
            {props.customer.id
                ? "Заказчик из базы"
                : "Новый заказчик"}
        </div>}

        {[
            { name: "phone_number", label: "Телефон" },
            { name: "fio", label: "ФИО" },
        ].map(f => <Autocomplete
            key={"customerselectkeyincustselect" + f.name + f.label}
            disabled={props.disabled}
            className="customers-select-field"
            fullWidth
            value={value}
            options={customers}
            loading={request.current}
            filterSelectedOptions={true}
            filterOptions={options => Array.isArray(options) ? options : []}
            onInputChange={(e, v, r) => handlerInput(v, r, f.name)}
            onChange={(e, v) => handler(v)}
            getOptionLabel={option => option ? option[f.name] || "" : ""}
            isOptionEqualToValue={(option, selectedValue) =>
                Boolean(option && selectedValue && option.id === selectedValue.id)
            }
            renderInput={params => <TextField
                {...params}
                autoComplete="off"
                label={f.label}
                id={"customer-select-key-in-custselect" + f.name + f.label}
                name={"customer-select-key-in-custselect" + f.name + f.label}
            />}
        />)}
    </div>;
}
