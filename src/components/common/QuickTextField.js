import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

export const QuickTextField = ({
    options = [],
    value,
    onChange,
    label,
    disabled,
    className,
    style,
    fullWidth,
    ...textFieldProps
}) => {
    const normalizedOptions = Array.isArray(options) ? options : [];
    const handleChange = nextValue => {
        if (typeof onChange === "function") onChange(nextValue || "");
    };

    if (!normalizedOptions.length) {
        return <TextField
            {...textFieldProps}
            className={className}
            style={style}
            fullWidth={fullWidth}
            label={label}
            disabled={disabled}
            value={value || ""}
            onChange={event => handleChange(event.target.value)}
        />;
    }

    return <Autocomplete
        freeSolo
        options={normalizedOptions}
        value={value || ""}
        inputValue={value || ""}
        disabled={disabled}
        className={className}
        style={style}
        fullWidth={fullWidth}
        onChange={(event, nextValue) => handleChange(nextValue)}
        onInputChange={(event, nextValue, reason) => {
            if (reason !== "reset") handleChange(nextValue);
        }}
        renderInput={params => <TextField
            {...params}
            {...textFieldProps}
            label={label}
        />}
    />;
};

export default QuickTextField;
