import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {Grid, InputLabel, Paper, TextField} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FilledInput from "@material-ui/core/FilledInput/FilledInput";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import Button from "@material-ui/core/Button";

const dadataInit = {
    method: "POST",
    mode: "cors",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Token " + process.env.REACT_APP_DADATA_TOKEN
    }
}

const Organization = props => {

    // const [inn, setInn] = useState(() => props.inn)
    // const [bankName, setBankName] = useState('Банк')

    const [state, setState] = useState(() => {
        return {...props}
    })
    const [disabled, setDisabled] = useState(true)

    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const loading = open && state.inn.length > 5;

    const handleOrganization = (fieldName, newValue) => {

        console.log('requestSettings')

    }

    useEffect(() => {
        setDisabled(JSON.stringify(state) === JSON.stringify(props))
    }, [state])

    useEffect(() => {

        if (state.inn.length < 5) {
            setOptions([])
            return undefined;
        }

        fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party',
            {
                ...dadataInit,
                body: JSON.stringify({
                    query: state.inn,
                    count: 20,
                })
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
            .catch(error => console.log("error", error));

    }, [state.inn])

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
                    return {...prev, bank_name: result.suggestions[0].unrestricted_value}
                })

            })
            .catch(error => console.log("error", error));

    }, [state.bank_code])

    useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open])

    const updateFields = v => {
        console.log('обновить информацию об организации', v)
    }

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
                onChange={e => handleOrganization(v.fieldName, e.target.value)}
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
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
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
                // setInn(v)
            }}
            renderInput={params => (<TextField
                {...params}
                label="ИНН"
                variant="filled"
                fullWidth
            />)
            }
        />

        {[
            {label: 'ОГРН', fieldName: 'ogrn'},
            {label: 'КПП', fieldName: 'kpp'},
            {label: 'Юридическое наименование', fieldName: 'organization'},
            {label: 'Юридический адрес', fieldName: 'legal_address'},
            {label: 'ОКВЕД', fieldName: 'okved'},
            {label: 'БИК', fieldName: 'bank_code'},
            {label: 'Банк', fieldName: 'bank_name'},
            {label: 'Расчетный счет', fieldName: 'settlement_number'},
        ].map(v => renderField(v))}

        <Grid container
              direction="row"
              justify="space-evenly"
              style={{
                  paddingTop: '1rem',
              }}
        >
            <Button
                variant="contained"
                size="small"
                color="secondary"
                // onClick={() => cancel()}
                disabled={disabled}
            >
                Отмена
            </Button>
            <Button
                variant="contained"
                size="small"
                color="primary"
                // onClick={() => save()}
                disabled={disabled}
            >
                Сохранить
            </Button>
        </Grid>

    </Grid>

}

export default connect(state => state.app.organization)(Organization);
