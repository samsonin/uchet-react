import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";

import { Card, CardContent, CardHeader, Grid, TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { makeStyles } from "muiLegacyStyles";
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
    'bank_name',
    'settlement_number',
]

const toStringValue = value => value === null || value === undefined ? '' : value.toString()

const digitsOnly = value => toStringValue(value).replace(/\D/g, '')

const DEBOUNCE_DADATA_MS = 550

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

const normalizePartySuggestion = suggestion => ({
    inn: toStringValue(suggestion?.inn || suggestion?.data?.inn),
    ogrn: toStringValue(suggestion?.ogrn || suggestion?.data?.ogrn),
    kpp: toStringValue(suggestion?.kpp ?? suggestion?.data?.kpp ?? '0'),
    organization: toStringValue(
        suggestion?.organization
        || suggestion?.value
        || suggestion?.unrestricted_value
        || suggestion?.data?.name?.full_with_opf
        || suggestion?.data?.name?.short_with_opf
    ),
    legal_address: toStringValue(suggestion?.legal_address || suggestion?.data?.address?.unrestricted_value),
    okved: toStringValue(suggestion?.okved || suggestion?.data?.okved),
})

const normalizePartyResponse = body => {
    if (Array.isArray(body?.suggestions)) return body.suggestions.map(normalizePartySuggestion)
    if (Array.isArray(body)) return body.map(normalizePartySuggestion)

    const singleSuggestion = body?.suggestion || body?.party || body?.organization

    return singleSuggestion ? [normalizePartySuggestion(singleSuggestion)] : []
}

const Organization = props => {
    const classes = useStyles()
    const organization = props.organization || {}

    const [state, setState] = useState(() => initialState(organization))
    const [disabled, setDisabled] = useState(true)

    const [partyField, setPartyField] = useState(null)

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [bankCodeTouched, setBankCodeTouched] = useState(false);
    const lastAppliedPartyQueryRef = useRef('');
    const partyRequestIdRef = useRef(0);
    const lastRequestedBankCodeRef = useRef('');
    const bankRequestIdRef = useRef(0);
    const bankRequestTimerRef = useRef(null);

    const validationErrors = Object.keys(lengthValidation).reduce((acc, fieldName) => ({
        ...acc,
        [fieldName]: getLengthError(state[fieldName], lengthValidation[fieldName]),
    }), {})

    const hasValidationErrors = Object.values(validationErrors).some(Boolean)

    useEffect(() => {
        setBankCodeTouched(false)
        setState(initialState(organization))
    }, [organization])

    useEffect(() => {

        let isEqual = true;

        orgFields.map(f => {
            if (toStringValue(state[f]) !== toStringValue(organization[f])) {
                isEqual = false;
                // console.log(f, state[f], props[f])
            }
            return f
        })

        setDisabled(isEqual || hasValidationErrors)

    }, [state, organization, hasValidationErrors])

    const applyPartySuggestion = suggestion => {
        if (!suggestion) return

        setState(prev => ({
            ...prev,
            ...suggestion,
            inn: suggestion.inn || prev.inn,
            ogrn: suggestion.ogrn || prev.ogrn,
        }))
    }

    const dadataRequest = (query, isCancelled = () => false, shouldApplyResult = false) => {

        if (!query) {
            setOptions([])
            return Promise.resolve()
        }

        const requestId = partyRequestIdRef.current + 1
        partyRequestIdRef.current = requestId

        const isActiveRequest = () => !isCancelled() && partyRequestIdRef.current === requestId

        setLoading(true)

        return rest('dadata/party', 'POST', { query }, false, { showGlobalLoader: false })
            .then(res => {
                if (!isActiveRequest()) return

                if (!res?.ok) {
                    setOptions([])
                    return
                }

                const nextOptions = normalizePartyResponse(res.body);

                setOptions(nextOptions);

                if (shouldApplyResult && nextOptions.length) {
                    const normalizedQuery = digitsOnly(query)
                    const exactOption = nextOptions.find(option => (
                        digitsOnly(option.inn) === normalizedQuery || digitsOnly(option.ogrn) === normalizedQuery
                    ))
                    const optionToApply = exactOption || nextOptions[0]

                    if (optionToApply && lastAppliedPartyQueryRef.current !== normalizedQuery) {
                        lastAppliedPartyQueryRef.current = normalizedQuery
                        applyPartySuggestion(optionToApply)
                    }
                }

            })
            .catch(error => {
                if (isActiveRequest()) console.log("error", error)
            })
            .finally(() => {
                if (isActiveRequest()) setLoading(false)
            })

    }

    useEffect(() => {

        const query = digitsOnly(state.inn)

        if (partyField !== 'inn' || !lengthValidation.inn.lengths.includes(query.length)) {
            setOptions([])
            setLoading(false)
            return undefined;
        }

        let cancelled = false
        const timer = window.setTimeout(() => {
            dadataRequest(query, () => cancelled, true)
        }, DEBOUNCE_DADATA_MS)

        return () => {
            cancelled = true
            window.clearTimeout(timer)
        }

    }, [partyField, state.inn])

    useEffect(() => {

        const query = digitsOnly(state.ogrn)

        if (partyField !== 'ogrn' || query.length < 5) {
            setOptions([])
            setLoading(false)
            return undefined;
        }

        let cancelled = false
        const shouldApplyResult = lengthValidation.ogrn.lengths.includes(query.length)
        const timer = window.setTimeout(() => {
            dadataRequest(query, () => cancelled, shouldApplyResult)
        }, DEBOUNCE_DADATA_MS)

        return () => {
            cancelled = true
            window.clearTimeout(timer)
        }

    }, [partyField, state.ogrn])

    const loadBankByCode = (bankCode, isCancelled = () => false) => {
        const requestId = bankRequestIdRef.current + 1
        bankRequestIdRef.current = requestId
        lastRequestedBankCodeRef.current = bankCode

        const isActiveRequest = () => !isCancelled() && bankRequestIdRef.current === requestId

        return rest('dadata/bank', 'POST', { query: bankCode }, false, { showGlobalLoader: false })
            .then(res => {
                if (!isActiveRequest() || !res?.ok) return

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
                if (isActiveRequest()) console.log("error", error)
            })
    }

    useEffect(() => () => {
        if (bankRequestTimerRef.current) window.clearTimeout(bankRequestTimerRef.current)
    }, [])

    useEffect(() => {

        const bankCode = digitsOnly(state.bank_code)

        if (bankRequestTimerRef.current) {
            window.clearTimeout(bankRequestTimerRef.current)
            bankRequestTimerRef.current = null
        }

        if (bankCode.length !== 9) {
            lastRequestedBankCodeRef.current = ''
            if (bankCodeTouched) {
                setState(prev => prev.bank_name ? { ...prev, bank_name: '' } : prev)
            }
            return undefined
        }

        if (toStringValue(state.bank_name) || lastRequestedBankCodeRef.current === bankCode) {
            return undefined
        }

        let cancelled = false
        bankRequestTimerRef.current = window.setTimeout(() => {
            loadBankByCode(bankCode, () => cancelled)
            bankRequestTimerRef.current = null
        }, DEBOUNCE_DADATA_MS)

        return () => {
            cancelled = true
            if (bankRequestTimerRef.current) {
                window.clearTimeout(bankRequestTimerRef.current)
                bankRequestTimerRef.current = null
            }
        }

    }, [bankCodeTouched, state.bank_code, state.bank_name])

    const cancel = () => {
        setBankCodeTouched(false)
        setState(initialState(organization))
    }

    const save = () => {

        rest('organization',
            'PATCH',
            state
        ).then(res => {

            if (!res?.ok || !res?.body?.organization) return

            let newState = initialState(res.body.organization);

            setBankCodeTouched(false)
            setState(newState)

        })

    }

    const updateFields = newObject => setState(prev => ({ ...prev, ...newObject }))

    const handlePartySelect = suggestion => {
        if (!suggestion) return

        lastAppliedPartyQueryRef.current = digitsOnly(suggestion.inn || suggestion.ogrn)
        applyPartySuggestion(normalizePartySuggestion(suggestion))
    }

    const renderField = v => {
        const errorText = validationErrors[v.fieldName] || ''
        const rule = lengthValidation[v.fieldName]

        return <Grid
            size={{ xs: 12, sm: v.sm || 6 }}
            key={'formcnrtolrenfderfildinorg' + v.fieldName}
        >
            <TextField
                label={v.label}
                fullWidth
                size="small"
                variant="outlined"
                className={classes.field}
                value={state[v.fieldName] || ''}
                onChange={e => {
                    if (v.fieldName === 'bank_code') setBankCodeTouched(true)

                    updateFields({ [v.fieldName]: e.target.value })
                }}
                error={Boolean(errorText)}
                helperText={errorText}
                slotProps={rule?.maxLength ? { htmlInput: { maxLength: rule.maxLength } } : undefined}
            />
        </Grid>
    }

    return <div className={classes.root}>
        <Card className={classes.card}>
            <CardHeader
                title="Организация"
                className={classes.cardHeader}
                slotProps={{ title: { variant: "subtitle1" } }}
            />
            <CardContent>
                <Grid container spacing={2}>

        {renderField({ label: 'Название', fieldName: 'name' })}

        <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
                className={classes.field}
            value={{ inn: state.inn }}
            inputValue={state.inn || ''}
            freeSolo
            filterOptions={x => x}
            onOpen={() => {
                setPartyField('inn')
            }}
            onChange={(e, v, r) => {
                if (r === 'select-option') {
                    handlePartySelect(v)
                }
            }}
            isOptionEqualToValue={(option, value) =>
                Boolean(option && value && option.inn === value.inn)
            }
            getOptionLabel={option => toStringValue(option?.inn)}
            renderOption={(optionProps, option) => <li {...optionProps}>
                {`${toStringValue(option?.inn)} ${toStringValue(option?.organization)}`}
            </li>}
            options={options}
            loading={loading}
            onInputChange={(_, v, reason) => {
                if (reason !== 'input' && reason !== 'clear') return
                lastAppliedPartyQueryRef.current = ''
                setPartyField('inn')
                updateFields({ inn: v })
            }}
            renderInput={params => {
                const slotProps = params.slotProps || {}
                const htmlInputProps = slotProps.htmlInput || params.inputProps || {}
                const inputProps = slotProps.input || params.InputProps || {}

                return <TextField
                    {...params}
                    label="ИНН"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={Boolean(validationErrors.inn)}
                    helperText={validationErrors.inn}
                    onFocus={() => setPartyField('inn')}
                    slotProps={{
                        ...slotProps,
                        htmlInput: {
                            ...htmlInputProps,
                            maxLength: lengthValidation.inn.maxLength,
                        },
                        input: {
                            ...inputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {inputProps.endAdornment || null}
                                </React.Fragment>
                            )
                        }
                    }}
                />
            }}
            />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
                className={classes.field}
            value={{ ogrn: state.ogrn }}
            inputValue={state.ogrn || ''}
            freeSolo
            filterOptions={x => x}
            onOpen={() => {
                setPartyField('ogrn')
            }}
            onChange={(e, v, r) => {
                if (r === 'select-option') {
                    handlePartySelect(v)
                }
            }}
            isOptionEqualToValue={(option, value) =>
                Boolean(option && value && option.ogrn === value.ogrn)
            }
            getOptionLabel={option => toStringValue(option?.ogrn)}
            renderOption={(optionProps, option) => <li {...optionProps}>
                {`${toStringValue(option?.ogrn)} ${toStringValue(option?.organization)}`}
            </li>}
            options={options}
            loading={loading}
            onInputChange={(_, v, reason) => {
                if (reason !== 'input' && reason !== 'clear') return
                lastAppliedPartyQueryRef.current = ''
                setPartyField('ogrn')
                updateFields({ ogrn: v })
            }}
            renderInput={params => {
                const slotProps = params.slotProps || {}
                const htmlInputProps = slotProps.htmlInput || params.inputProps || {}
                const inputProps = slotProps.input || params.InputProps || {}

                return <TextField
                    {...params}
                    label="ОГРН"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={Boolean(validationErrors.ogrn)}
                    helperText={validationErrors.ogrn}
                    onFocus={() => setPartyField('ogrn')}
                    slotProps={{
                        ...slotProps,
                        htmlInput: {
                            ...htmlInputProps,
                            maxLength: lengthValidation.ogrn.maxLength,
                        },
                        input: {
                            ...inputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {inputProps.endAdornment || null}
                                </React.Fragment>
                            )
                        }
                    }}
                />
            }}
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
                slotProps={{ title: { variant: "subtitle1" } }}
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

export default connect(state => state.app)(Organization);
