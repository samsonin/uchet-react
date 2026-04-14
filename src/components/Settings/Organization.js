import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { Card, CardContent, CardHeader, Grid, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import rest from "../Rest";
import { BottomButtons } from "../common/BottomButtons";

const useStyles = makeStyles({
    root: {
        width: '100%',
        margin: '0.5rem',
    },
    card: {
        marginBottom: 10,
    },
    cardHeader: {
        backgroundColor: '#F7F7F7',
        borderBottom: '1px solid #e9ecef',
    },
    field: {
        width: '100%',
    },
});

const orgFields = [
    'name',
    'inn',
    'ogrn',
    'kpp',
    'organization',
    'legal_address',
    'okved',
    'bank_code',
    'settlement_number',
]

const toStringValue = value => value === null || value === undefined ? '' : value.toString()

const digitsOnly = value => toStringValue(value).replace(/\D/g, '')

const lengthValidation = {
    inn: { label: 'ИНН', lengths: [10, 12], maxLength: 12 },
    ogrn: { label: 'ОГРН', lengths: [13, 15], maxLength: 15 },
    kpp: { label: 'КПП', lengths: [9], validValues: ['0'], maxLength: 9 },
    bank_code: { label: 'БИК', lengths: [9], maxLength: 9 },
    settlement_number: { label: 'Расчетный счет', lengths: [20], maxLength: 20 },
}

const getLengthError = (value, rule) => {
    const digits = digitsOnly(value)

    if (!rule || !digits) return ''
    if (rule.validValues?.includes(digits)) return ''
    if (rule.lengths.includes(digits.length)) return ''

    return `${rule.label}: ${rule.lengths.join(' или ')} цифр`
}

const initialState = props => {

    let newState = {}

    orgFields.map(f => {
        newState[f] = toStringValue(props[f])
        return f;
    })

    return newState

}

const Organization = props => {
    const classes = useStyles()

    const [state, setState] = useState(() => initialState(props))
    const [disabled, setDisabled] = useState(true)

    const [innOpen, setInnOpen] = useState(false)
    const [ogrnOpen, setOgrnOpen] = useState(false)

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const validationErrors = Object.keys(lengthValidation).reduce((acc, fieldName) => ({
        ...acc,
        [fieldName]: getLengthError(state[fieldName], lengthValidation[fieldName]),
    }), {})

    const hasValidationErrors = Object.values(validationErrors).some(Boolean)

    useEffect(() => {

        let isEqual = true;

        orgFields.map(f => {
            if (toStringValue(state[f]) !== toStringValue(props[f])) {
                isEqual = false;
                // console.log(f, state[f], props[f])
            }
            return f
        })

        setDisabled(isEqual || hasValidationErrors)

    }, [state, props, hasValidationErrors])

    const dadataRequest = (query, isCancelled = () => false) => {

        if (!query) {
            setOptions([])
            return Promise.resolve()
        }

        setLoading(true)

        return rest('dadata/party', 'POST', { query })
            .then(res => {
                if (isCancelled()) return

                if (!res?.ok) {
                    setOptions([])
                    return
                }

                setOptions((res.body?.suggestions || []).map(v => ({
                    inn: v.inn || v.data?.inn || '',
                    ogrn: v.ogrn || v.data?.ogrn || '',
                    kpp: v.kpp || v.data?.kpp || '0',
                    organization: v.organization || v.value || '',
                    legal_address: v.legal_address || v.data?.address?.unrestricted_value || '',
                    okved: v.okved || v.data?.okved || '',
                })));

            })
            .catch(error => {
                if (!isCancelled()) console.log("error", error)
            })
            .finally(() => {
                if (!isCancelled()) setLoading(false)
            })

    }

    useEffect(() => {

        if (!innOpen || toStringValue(state.inn).length < 5) {
            setOptions([])
            return undefined;
        }

        let cancelled = false

        dadataRequest(state.inn, () => cancelled)

        return () => {
            cancelled = true
        }

    }, [innOpen, state.inn])

    useEffect(() => {

        if (!ogrnOpen || toStringValue(state.ogrn).length < 5) {
            setOptions([])
            return undefined;
        }

        let cancelled = false

        dadataRequest(state.ogrn, () => cancelled)

        return () => {
            cancelled = true
        }

    }, [ogrnOpen, state.ogrn])

    useEffect(() => {

        const bankCode = toStringValue(state.bank_code).replace(/\D/g, '')

        if (bankCode.length !== 9) {
            setState(prev => prev.bank_name ? { ...prev, bank_name: '' } : prev)
            return undefined
        }

        let cancelled = false

        rest('dadata/bank', 'POST', { query: bankCode })
            .then(res => {
                if (cancelled || !res?.ok) return

                setState(prev => {

                    const suggestions = Array.isArray(res.body?.suggestions)
                        ? res.body.suggestions
                        : []

                    if (suggestions.length > 1) return prev

                    const bank = res.body?.bank || suggestions[0] || res.body
                    const bankData = bank?.data || bank

                    if (!bankData) {
                        return prev.bank_name ? { ...prev, bank_name: '' } : prev
                    }

                    let bank_name = typeof bankData === 'undefined'
                        ? 'Банк'
                        : bankData.bank_name
                        || bankData.bank
                        || bankData.name?.payment
                        || bankData.name?.full
                        || bankData.name?.short
                        || bankData.unrestricted_value
                        || bankData.value
                        || bank?.unrestricted_value
                        || bank?.value
                        || ''

                    if (!bank_name && !bankData.settlement_number) return prev

                    const nextState = {
                        ...prev,
                        bank_code: bankData.bank_code || bankData.bic || bankCode,
                        bank_name,
                    }

                    if (bankData.settlement_number) {
                        nextState.settlement_number = bankData.settlement_number
                    }

                    return nextState

                })

            })
            .catch(error => {
                if (!cancelled) console.log("error", error)
            });

        return () => {
            cancelled = true
        }

    }, [state.bank_code])

    const cancel = () => setState(initialState(props))

    const save = () => {

        rest('organization',
            'PATCH',
            state
        ).then(res => {

            if (!res?.ok || !res?.body?.organization) return

            let newState = initialState(res.body.organization);

            newState.bank_name = state.bank_name;

            setState(newState)

        })

    }

    const updateFields = newObject => setState(prev => ({ ...prev, ...newObject }))

    const renderField = v => {
        const errorText = validationErrors[v.fieldName] || ''
        const rule = lengthValidation[v.fieldName]

        return <Grid
            item
            xs={12}
            sm={v.sm || 6}
            key={'formcnrtolrenfderfildinorg' + v.fieldName}
        >
            <TextField
                label={v.label}
                fullWidth
                size="small"
                variant="outlined"
                className={classes.field}
                value={state[v.fieldName] || ''}
                onChange={e => updateFields({ [v.fieldName]: e.target.value })}
                error={Boolean(errorText)}
                helperText={errorText}
                inputProps={rule?.maxLength ? { maxLength: rule.maxLength } : undefined}
            />
        </Grid>
    }

    return <div className={classes.root}>
        <Card className={classes.card}>
            <CardHeader
                title="Организация"
                className={classes.cardHeader}
                titleTypographyProps={{ variant: "subtitle1" }}
            />
            <CardContent>
                <Grid container spacing={2}>

        {renderField({ label: 'Название', fieldName: 'name' })}

        <Grid item xs={12} sm={6}>
            <Autocomplete
                className={classes.field}
            value={{ inn: state.inn }}
            // open={innOpen}
            onOpen={() => {
                setInnOpen(true);
            }}
            onClose={() => {
                setInnOpen(false);
            }}
            onChange={(e, v, r) => {
                if (r === 'select-option') {
                    updateFields(v)
                }
            }}
            getOptionSelected={(option, value) => {
                return true;
            }}
            getOptionLabel={option => toStringValue(option?.inn)}
            renderOption={option => `${toStringValue(option?.inn)} ${toStringValue(option?.organization)}`}
            options={options}
            loading={loading}
            onInputChange={(_, v) => {
                updateFields({ inn: v })
            }}
            renderInput={params => (<TextField
                {...params}
                label="ИНН"
                variant="outlined"
                size="small"
                fullWidth
                error={Boolean(validationErrors.inn)}
                helperText={validationErrors.inn}
                inputProps={{
                    ...params.inputProps,
                    maxLength: lengthValidation.inn.maxLength,
                }}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <React.Fragment>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                        </React.Fragment>
                    )
                }}
            />)}
            />
        </Grid>

        <Grid item xs={12} sm={6}>
            <Autocomplete
                className={classes.field}
            value={{ ogrn: state.ogrn }}
            // open={innOpen}
            onOpen={() => {
                setOgrnOpen(true);
            }}
            onClose={() => {
                setOgrnOpen(false);
            }}
            onChange={(e, v, r) => {
                if (r === 'select-option') {
                    updateFields(v)
                }
            }}
            getOptionSelected={(option, value) => {
                return true;
            }}
            getOptionLabel={option => toStringValue(option?.ogrn)}
            renderOption={option => `${toStringValue(option?.ogrn)} ${toStringValue(option?.organization)}`}
            options={options}
            loading={loading}
            onInputChange={(_, v) => {
                updateFields({ ogrn: v })
            }}
            renderInput={params => (<TextField
                {...params}
                label="ОГРН"
                variant="outlined"
                size="small"
                fullWidth
                error={Boolean(validationErrors.ogrn)}
                helperText={validationErrors.ogrn}
                inputProps={{
                    ...params.inputProps,
                    maxLength: lengthValidation.ogrn.maxLength,
                }}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <React.Fragment>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                        </React.Fragment>
                    )
                }}
            />)}
            />
        </Grid>

        {[
            { label: 'КПП', fieldName: 'kpp' },
            { label: 'Юридическое наименование', fieldName: 'organization' },
            { label: 'Юридический адрес', fieldName: 'legal_address' },
            { label: 'ОКВЕД', fieldName: 'okved' },
        ].map(v => renderField(v))}

                </Grid>
            </CardContent>
        </Card>

        <Card className={classes.card}>
            <CardHeader
                title="Реквизиты счета"
                className={classes.cardHeader}
                titleTypographyProps={{ variant: "subtitle1" }}
            />
            <CardContent>
                <Grid container spacing={2}>
                    {[
                        { label: 'БИК', fieldName: 'bank_code' },
                        { label: 'Банк', fieldName: 'bank_name' },
                        { label: 'Расчетный счет', fieldName: 'settlement_number', sm: 12 },
                    ].map(v => renderField(v))}
                </Grid>
            </CardContent>
        </Card>

        {BottomButtons(save, cancel, disabled)}

    </div>

}

export default connect(state => state.app.organization)(Organization);
