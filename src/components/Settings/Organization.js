import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {Grid, InputLabel, Paper, TextField} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FilledInput from "@material-ui/core/FilledInput/FilledInput";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import rest from "../Rest";
import {BottomButtons} from "../common/BottomButtons";

const dadataInit = {
    method: "POST",
    mode: "cors",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Token " + process.env.DADATA_TOKEN
    }
}

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

const initialState = props => {

    let newState = {}

    orgFields.map(f => {
        newState[f] = props[f].toString()
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
            if (state[f] !== props[f].toString()) {
                isEqual = false;
                // console.log(f, state[f], props[f])
            }
            return f
        })

        setDisabled(isEqual)

    }, [state, props])

    const dadataRequest = query => {

        setLoading(true)

        fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party',
            {
                ...dadataInit,
                body: JSON.stringify({query})
            })
            .then(response => response.json())
            .then(result => {

                setOptions(result.suggestions.map(v => ({
                    inn: v.data.inn,
                    ogrn: v.data.ogrn,
                    kpp: v.data.kpp || '0',
                    organization: v.value,
                    legal_address: v.data.address.unrestricted_value,
                    okved: v.data.okved,
                })));

            })
            .catch(error => console.log("error", error))
            .finally(() => setLoading(false))

    }

    useEffect(() => {

        if (!innOpen || state.inn.length < 5) {
            setOptions([])
            return undefined;
        }

        dadataRequest(state.inn)

    }, [innOpen, state.inn])

    useEffect(() => {

        if (!ogrnOpen || state.ogrn.length < 5) {
            setOptions([])
            return undefined;
        }

        dadataRequest(state.ogrn)

    }, [ogrnOpen, state.ogrn])

    useEffect(() => {

        fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank',
            {
                ...dadataInit,
                body: JSON.stringify({
                    query: state.bank_code,
                })
            })
            .then(response => response.json())
            .then(result => {

                setState(prev => {

                    let bank_name = typeof result.suggestions[0] === 'undefined'
                        ? 'Банк'
                        : result.suggestions[0].unrestricted_value

                    return {...prev, bank_name}

                })

            })
            .catch(error => console.log("error", error));

    }, [state.bank_code])

    const cancel = () => setState(initialState(props))

    const save = () => {

        rest('organization',
            'PATCH',
            state
        ).then(res => {

            let newState = initialState(res.body.organization);

            newState.bank_name = state.bank_name;

            setState(newState)

        })

    }

    const updateFields = newObject => setState(prev => ({...prev, ...newObject}))

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
                onChange={e => updateFields({[v.fieldName]: e.target.value})}
            />
        </FormControl>
    }

    return <Grid container
                 component={Paper}
                 direction="row"
                 className="m-2 p-3"
    >

        {renderField({label: 'Название', fieldName: 'name'})}

        <Autocomplete
            className="w-100 m-1"
            value={{inn: state.inn}}
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
            getOptionLabel={option => option.inn}
            renderOption={option => option.inn + ' ' + option.organization}
            options={options}
            loading={loading}
            onInputChange={(_, v) => {
                updateFields({inn: v})
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
                            {loading ? <CircularProgress color="inherit" size={20}/> : null}
                            {params.InputProps.endAdornment}
                        </React.Fragment>
                    )
                }}
            />)}
        />

        <Autocomplete
            className="w-100 m-1"
            value={{ogrn: state.ogrn}}
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
            getOptionLabel={option => option.ogrn}
            renderOption={option => option.ogrn + ' ' + option.organization}
            options={options}
            loading={loading}
            onInputChange={(_, v) => {
                updateFields({ogrn: v})
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
                            {loading ? <CircularProgress color="inherit" size={20}/> : null}
                            {params.InputProps.endAdornment}
                        </React.Fragment>
                    )
                }}
            />)}
        />

        {[
            {label: 'КПП', fieldName: 'kpp'},
            {label: 'Юридическое наименование', fieldName: 'organization'},
            {label: 'Юридический адрес', fieldName: 'legal_address'},
            {label: 'ОКВЕД', fieldName: 'okved'},
            {label: 'БИК', fieldName: 'bank_code'},
            {label: 'Банк', fieldName: 'bank_name'},
            {label: 'Расчетный счет', fieldName: 'settlement_number'},
        ].map(v => renderField(v))}

        {BottomButtons(save, cancel, disabled)}

    </Grid>

}

export default connect(state => state.app.organization)(Organization);
