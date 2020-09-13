import React, {useEffect, useState} from "react";

import {Grid, InputLabel, Paper, TextField} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FilledInput from "@material-ui/core/FilledInput/FilledInput";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import {connect} from "react-redux";

const Organization = props => {

  const [inn, setInn] = useState(() => props.inn)
  const [autocomplete, setAutocomplete] = useState([])
  const [bankName, setBankName] = useState('Банк')

  const handleOrganization = (id, index,) => {

    console.log('requestSettings')

  }


  useEffect(() => {

    // if (inn.length > 5) {
    //
    //   fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
    //     headers: {
    //       Authorization: 'Token ' + process.env.REACT_APP_DADATA_TOKEN
    //     }
    //   })
    //     .then(res => res.json())
    //     .then(res => console.log(res))
    //
    // }

    console.log('useEffect')

  }, [inn])

  return <Grid container
               component={Paper}
               direction="row"
               className="m-2 p-3"
  >

    <FormControl fullWidth variant="filled" className="w-75 m-1">
      <InputLabel className="mt-2 font-weight-bold">
        Название:
      </InputLabel>
      <FilledInput
        id="organizationName"
        defaultValue={props.name}
        onBlur={e => handleOrganization('name', e.target.value)}
      />
    </FormControl>

    <Autocomplete
      options={autocomplete}
      value={inn}
      // onInputChange={(e, v) => innHandler(v)}
      onChange={(e, newInn) => {
        setInn(newInn);
      }}
      getOptionLabel={option => (option.string)}
      className="w-75 m-1"
      renderInput={params => <TextField {...params}
                                        label="ИНН"
                                        variant="filled"
                                        fullWidth
      />}
    />

    <FormControl fullWidth variant="filled" className="w-75 m-1">
      <InputLabel className="mt-2 font-weight-bold">КПП:</InputLabel>
      <FilledInput
        id="organizationKpp"
        defaultValue={props.kpp}
        onBlur={e => handleOrganization('kpp', e.target.value)}
      />
    </FormControl>
    <FormControl fullWidth variant="filled" className="w-75 m-1">
      <InputLabel className="mt-2 font-weight-bold">ОГРН:</InputLabel>
      <FilledInput
        id="organizationOgrn"
        defaultValue={props.ogrn}
        onBlur={e => handleOrganization('ogrn', e.target.value)}
      />
    </FormControl>
    <FormControl fullWidth variant="filled" className="w-75 m-1">
      <InputLabel className="mt-2 font-weight-bold">Юридическое наименование:</InputLabel>
      <FilledInput
        id="organizationOrganization"
        defaultValue={props.organization}
        onBlur={e => handleOrganization('organization', e.target.value)}
      />
    </FormControl>
    <FormControl fullWidth variant="filled" className="w-75 m-1">
      <InputLabel className="mt-2 font-weight-bold">Юридический адрес:</InputLabel>
      <FilledInput
        id="organizationLegalAddress"
        defaultValue={props.legal_address}
        onBlur={e => handleOrganization('legal_address', e.target.value)}
      />
    </FormControl>
    <FormControl fullWidth variant="filled" className="w-75 m-1">
      <InputLabel className="mt-2 font-weight-bold">ОКВЕД:</InputLabel>
      <FilledInput
        id="organizationOkved"
        defaultValue={props.okved}
        onBlur={e => handleOrganization('okved', e.target.value)}
      />
    </FormControl>
    <FormControl fullWidth variant="filled" className="w-75 m-1">
      <InputLabel className="mt-2 font-weight-bold">БИК:</InputLabel>
      <FilledInput
        defaultValue={props.bank_code}
        onBlur={e => handleOrganization('bank_code', e.target.value)}
      />
    </FormControl>

    <FormControl fullWidth variant="filled" className="w-75 m-1">
      <FilledInput
        readOnly
        value={bankName}
      />
    </FormControl>
    <FormControl fullWidth variant="filled" className="w-75 m-1">
      <InputLabel className="mt-2 font-weight-bold">Расчетный счет:</InputLabel>
      <FilledInput
        defaultValue={props.settlement_number}
        onBlur={e => handleOrganization('settlement_number', e.target.value)}
      />
    </FormControl>

  </Grid>

}

export default connect(state => state.app.organization)(Organization);
