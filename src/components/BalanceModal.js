import React, {useState} from "react";
import {
  MDBModal,
  MDBModalBody,
  MDBModalHeader,
} from "mdbreact";
import {connect} from "react-redux";

import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";

import {BottomButtons} from "./common/BottomButtons";

const BalanceModal = props => {

  const [paymentType, setPaymentType] = useState('AC')
  const [sum, setSum] = useState(300)

  const toggle = () => props.close()

  const sumChange = value => {
    let sum = +value;
    if (sum < 10) sum = 10;
    setSum(sum);
  };

  const paymentFormSubmitter = event => {

    let f = document.createElement("form");
    f.setAttribute('method', "post");
    f.setAttribute('action', "https://money.yandex.ru/quickpay/confirm.xml");

    [
      {name: 'receiver', value: '410012390556672'},
      {name: 'quickpay-form', value: 'shop'},
      {name: 'successURL', value: 'https://uchet.store'},
      {name: 'targets', value: 'Пополнение счета в Uchet.store'},
      {name: 'label', value: props.organization_id},
      {name: 'paymentType', value: paymentType},
      {name: 'sum', value: sum},
    ].map(v => {
      let i = document.createElement("input");
      i.type = 'hidden'
      i.name = v.name;
      i.value = v.value;
      f.appendChild(i)
      return v;
    })

    let body = document.getElementsByTagName('body')[0]

    body.append(f)
    f.submit()

  }

  return <MDBModal isOpen={props.isOpen} toggle={toggle}>
    <MDBModalHeader toggle={toggle} className="font-weight-bold">
      Пополнение счета
    </MDBModalHeader>

    <MDBModalBody>

      <Grid container direction="row" justify="center" alignItems="center">
        <TextField
          label="Сумма платежа, руб."
          value={sum}
          onChange={e => sumChange(e.target.value)}
          type="number"
          // margin="normal"
        />
      </Grid>

      <Grid container direction="row" justify="center" alignItems="center">
        <RadioGroup value={paymentType}
                    onChange={e => setPaymentType(e.target.value)}
        >
          {[
            {value: 'PC', label: 'Яндекс Деньги'},
            {value: 'AC', label: 'Банковская карта'},
            {value: 'MC', label: 'Баланс телефона'},
          ].map(v => <FormControlLabel
            key={'frmkeybalnsmdal' + v.value}
            checked={v.value === paymentType}
            value={v.value}
            control={<Radio color="primary"/>}
            label={v.label}
          />)}
        </RadioGroup>
      </Grid>

    </MDBModalBody>

    {BottomButtons(paymentFormSubmitter, toggle)}

  </MDBModal>

}

export default connect(state => state.auth)(BalanceModal);
