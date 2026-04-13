import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { Grid, InputLabel, Paper, TextField } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FilledInput from "@material-ui/core/FilledInput/FilledInput";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import rest from "../Rest";
import { BottomButtons } from "../common/BottomButtons";

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

const initialState = props => {

    let newState = {}

    orgFields.map(f => {
        newState[f] = toStringValue(props[f])
        return f;
    })

    return newState

}

const Organization = props => {

    const [state, setState] = useState(() => initialState(props))
    const [disabled, setDisabled] = useState(true)

    const [innOpen, setInnOpen] = useState(false)
    const [ogrnOpen, setOgrnOpen] = useState(false)

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    useEffect(() => {

        let isEqual = true;

        orgFields.map(f => {
            if (toStringValue(state[f]) !== toStringValue(props[f])) {
                isEqual = false;
                // console.log(f, state[f], props[f])
            }
            return f
        })

        setDisabled(isEqual)

    }, [state, props])

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

        if (!state.bank_code || toStringValue(state.bank_code).length < 5) {
            setState(prev => prev.bank_name ? { ...prev, bank_name: '' } : prev)
            return undefined
        }

        let cancelled = false

        rest('dadata/bank', 'POST', { query: state.bank_code })
            .then(res => {
                if (cancelled || !res?.ok) return

                setState(prev => {

                    const bank = res.body?.suggestions?.[0]

                    let bank_name = typeof bank === 'undefined'
                        ? 'Банк'
                        : bank.unrestricted_value || bank.name || bank.value || ''

                    return { ...prev, bank_name }

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
        return <FormControl
            key={'formcnrtolrenfderfildinorg' + v.fieldName}
            fullWidth
            variant="filled"
            className="w-100 m-1"
        >
            <InputLabel className="mt-2 font-weight-bold">
                {v.label}
            </InputLabel>
            <FilledInput
                value={state[v.fieldName] || ''}
                onChange={e => updateFields({ [v.fieldName]: e.target.value })}
            />
        </FormControl>
    }

    return <Grid container
        component={Paper}
        direction="row"
        className="m-2 p-3"
    >

        {renderField({ label: 'Название', fieldName: 'name' })}

        <Autocomplete
            className="w-100 m-1"
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
                variant="filled"
                fullWidth
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

        <Autocomplete
            className="w-100 m-1"
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
                variant="filled"
                fullWidth
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

        {[
            { label: 'КПП', fieldName: 'kpp' },
            { label: 'Юридическое наименование', fieldName: 'organization' },
            { label: 'Юридический адрес', fieldName: 'legal_address' },
            { label: 'ОКВЕД', fieldName: 'okved' },
            { label: 'БИК', fieldName: 'bank_code' },
            { label: 'Банк', fieldName: 'bank_name' },
            { label: 'Расчетный счет', fieldName: 'settlement_number' },
        ].map(v => renderField(v))}

        {BottomButtons(save, cancel, disabled)}

    </Grid>

}

export default connect(state => state.app.organization)(Organization);
