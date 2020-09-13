import {Grid, InputLabel, TextField} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FilledInput from "@material-ui/core/FilledInput/FilledInput";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import React from "react";

export const Organization = () => {

    const getSuggest = (e, inn) => {

        if (inn === '') return false;
        this.setState({innValue: inn});
        if (inn.length < 5) return true;

        // this.requestSettings('getSuggest', '', 'inn', inn);

        let url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";
        let query = "7707083893";

        const options = {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Token " + process.env.REACT_APP_DADATA_TOKEN
            },
            body: JSON.stringify({query})
        }

        fetch(url, options)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log("error", error));

    };

    const setInn = (e, value) => {

        if (value === null) {
            this.setState({innValue: ""});
            return false;
        }
        this.setState({innValue: value.inn});

        this.requestSettings('setByInn', '', 'inn', value.inn);

    };

    return <Grid container direction="row" className="m-2 p-3">

        <FormControl fullWidth variant="filled" className="w-75 m-1">
            <InputLabel className="mt-2 font-weight-bold">Название:</InputLabel>
            <FilledInput
                id="organizationName"
                defaultValue={this.props.app.organization.name}
                onBlur={(e) => this.requestSettings('changeOrganization', '', 'name', e.target.value)}
            />
        </FormControl>

        <Autocomplete
            options={this.state.autocomplete}
            inputValue={this.state.innValue}
            onInputChange={(e, v) => getSuggest(e, v)}
            onChange={(e, v) => this.setInn(e, v)}
            getOptionLabel={option => (option.string)}
            className="w-75 m-1"
            renderInput={params => (
                <TextField {...params}
                           label="ИНН"
                           variant="filled"
                           fullWidth
                />
            )}
        />

        <FormControl fullWidth variant="filled" className="w-75 m-1">
            <InputLabel className="mt-2 font-weight-bold">КПП:</InputLabel>
            <FilledInput
                id="organizationKpp"
                defaultValue={this.props.app.organization.kpp}
                onBlur={(e) => this.requestSettings('changeOrganization', '', 'kpp', e.target.value)}
            />
        </FormControl>
        <FormControl fullWidth variant="filled" className="w-75 m-1">
            <InputLabel className="mt-2 font-weight-bold">ОГРН:</InputLabel>
            <FilledInput
                id="organizationOgrn"
                defaultValue={this.props.app.organization.ogrn}
                onBlur={(e) => this.requestSettings('changeOrganization', '', 'ogrn', e.target.value)}
            />
        </FormControl>
        <FormControl fullWidth variant="filled" className="w-75 m-1">
            <InputLabel className="mt-2 font-weight-bold">Юридическое наименование:</InputLabel>
            <FilledInput
                id="organizationOrganization"
                defaultValue={this.props.app.organization.organization}
                onBlur={(e) => this.requestSettings('changeOrganization', '', 'organization', e.target.value)}
            />
        </FormControl>
        <FormControl fullWidth variant="filled" className="w-75 m-1">
            <InputLabel className="mt-2 font-weight-bold">Юридический адрес:</InputLabel>
            <FilledInput
                id="organizationLegalAddress"
                defaultValue={this.props.app.organization.legal_address}
                onBlur={(e) => this.requestSettings('changeOrganization', '', 'legal_address', e.target.value)}
            />
        </FormControl>
        <FormControl fullWidth variant="filled" className="w-75 m-1">
            <InputLabel className="mt-2 font-weight-bold">ОКВЕД:</InputLabel>
            <FilledInput
                id="organizationOkved"
                defaultValue={this.props.app.organization.okved}
                onBlur={(e) => this.requestSettings('changeOrganization', '', 'okved', e.target.value)}
            />
        </FormControl>
        <FormControl fullWidth variant="filled" className="w-75 m-1">
            <InputLabel className="mt-2 font-weight-bold">БИК:</InputLabel>
            <FilledInput
                defaultValue={this.props.app.organization.bank_code}
                onBlur={(e) => this.requestSettings('changeOrganization', '', 'bank_code', e.target.value)}
            />
        </FormControl>

        <FormControl fullWidth variant="filled" className="w-75 m-1">
            <FilledInput
                readOnly
                value={this.state.bankName ? this.state.bankName : "Банк"}
            />
        </FormControl>
        <FormControl fullWidth variant="filled" className="w-75 m-1">
            <InputLabel className="mt-2 font-weight-bold">Расчетный счет:</InputLabel>
            <FilledInput
                defaultValue={this.props.app.organization.settlement_number}
                onBlur={(e) => this.requestSettings('changeOrganization', '', 'settlement_number', e.target.value)}
            />
        </FormControl>

    </Grid>
}
