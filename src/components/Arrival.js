import React from 'react'
import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";
import {enqueueSnackbar} from "../actions/actionCreator";
import {bindActionCreators} from "redux";
import Grid from "@material-ui/core/Grid";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TextField from "@material-ui/core/TextField/TextField";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import TreeModal from "./TreeModal";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import request from "./Request";
import Autocomplete from "@material-ui/lab/Autocomplete";


class Arrival extends React.Component {

  state = {
    currentTr: false,
    isNewConsignment: true,
    isSending: false,
    consignment: {
      products: [{
        categoryId: 0,
        model: '',
        quantity: 1,
        cost: 0,
        sum: 0,
      }],
      providerId: 0,
      consignmentNumber: '',
      actuallyPaid: 0,
      delivery: 0,
    }
  }

  addConsignment() {

    let consignment = this.state.consignment;
    let error;
    if (this.state.consignment.providerId === 0) error = 'Выберите поставщика';
    if (this.state.consignment.consignmentNumber === '') error = 'Введите номер накладной';
    this.state.consignment.products.map(product => {
      if (product.categoryId === 0) error = 'Выберите категорию';
      if (product.model === '') error = 'Введите наименование';
      if (product.quantity === 0) error = 'Количество должно быть больше 0';
    })
    if (error !== undefined) {
      this.props.enqueueSnackbar({
        message: error,
        options: {
          variant: 'error',
        },
      });
      return;
    }

    this.setState({isSending: true});

    // restRequest('/goods', 'POST', {
    //     stock_id: this.props.app.stock_id,
    //     consignment,
    // })
    request({
      action: 'addConsignment',
      stock_id: this.props.app.stock_id,
      consignment
    }, '/arrival', this.props.auth.jwt)
      .then(data => {

        this.setState({isSending: false});

        if (data.result) {

          this.props.enqueueSnackbar({
            message: 'Внесено ' + data.counter + ' товаров',
            options: {
              variant: 'success',
            },
          });
          this.setState({
            currentTr: false,
            isNewConsignment: true,
            isSending: false,
            consignment: {
              products: [{
                categoryId: 0,
                model: '',
                quantity: 1,
                cost: 0,
                sum: 0,
              }],
              providerId: 0,
              consignmentNumber: '',
              actuallyPaid: 0,
              delivery: 0,
            }
          });

        } else {

          let message = 'Ошибка';
          if (data === 'wrong stock') message = 'Выберите точку';
          if (data === 'consignment exist') message = 'Такая накладная уже существует';
          this.props.enqueueSnackbar({
            message,
            options: {
              variant: 'error',
            },
          });

        }

      })

  }

  handleAdd() {
    let newState = this.state;
    newState.consignment.products.push({
      categoryId: 0,
      model: '',
      quantity: 1,
      cost: 0,
      sum: 0,
    });
    this.setState({newState})
  }

  handleDelete(i) {
    let newState = this.state;
    newState.consignment.products.splice(i, 1);
    this.setState({newState})
  }

  handleCategories = id => {

    let newState = this.state;
    if (id) newState.consignment.products[this.state.currentTr].categoryId = +id;
    newState.currentTr = false;
    this.setState({newState})

  }

  handleTr(i, index, val) {
    let newState = this.state;
    newState.consignment.products[i][index] = index === 'model' ?
      val : +val;
    if (index === 'cost') newState.consignment.products[i].sum = +val * 2;
    newState.currentTr = false;
    newState.consignment.actuallyPaid = this.getConsignmentTotal();
    this.setState({newState})
  }

  handleProvider(v) {
    let id = 0;
    try {
      id = v.id;
    } catch (e) {
    }
    let newState = this.state;
    newState.consignment.providerId = id;
    this.setState({newState})
  }

  handleTotals(index, val) {

    if (val < 0) return;
    let newState = this.state;
    newState.consignment[index] = val;
    this.setState({newState})

  }

  getConsignmentTotal() {
    let consignmentTotal = 0;
    this.state.consignment.products.map(product => {
      consignmentTotal += product.quantity * product.cost;
    })
    return consignmentTotal;
  }

  getTotal() {
    return this.state.consignment.delivery + this.getConsignmentTotal();
  }

  renderTr(i, product) {

    return <TableRow key={'gberbrv' + i}>
      <TableCell component="th" scope="row" className={"p-1"}>
        <Button size="small" className="w-100" variant="outlined"
                onClick={() => this.setState({currentTr: i})}>
          {product.categoryId > 0 ?
            this.props.app.categories.find(v => v.id === product.categoryId).name : "выбрать..."}
        </Button>
      </TableCell>
      <TableCell className={"p-1"}>
        <TextField className={"w-100"}
                   onChange={e => this.handleTr(i, 'model', e.target.value)}
                   value={product.model}
        />
      </TableCell>
      <TableCell align="center" className={"p-1"}>
        <TextField
          onChange={e => this.handleTr(i, 'quantity', e.target.value)}
          type="number"
          value={product.quantity}
        />
      </TableCell>
      <TableCell align="center" className={"p-1"}>
        <TextField
          onChange={e => this.handleTr(i, 'cost', e.target.value)}
          type="number"
          value={product.cost}
        />
      </TableCell>
      <TableCell align="center" className={"p-1"}>
        <TextField
          onChange={e => this.handleTr(i, 'sum', e.target.value)}
          type="number"
          value={product.sum}
        />
      </TableCell>
      <TableCell align="center" className={"p-1"}>
        <Tooltip title="Удалить строку">
          <IconButton className="p-2 m-2" onClick={() => this.handleDelete(i)}>
            <DeleteIcon/>
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  }

  render() {
    if (+this.props.app.stock_id <= 0) return <Typography variant="h5" align="center">Выберите точку</Typography>
    return <>

      <TreeModal isOpen={this.state.currentTr !== false} onClose={this.handleCategories}/>

      <Grid container
            spacing={3} direction="column" justify="space-between" alignContent="center">
        <Grid item>
          <Typography variant="h5" align="center">Новая накладная</Typography>
        </Grid>
        <Grid item>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell colSpan={2} className="pt-3">

                    <Autocomplete
                      options={
                        this.props.app.providers.map(v => ({id: v.id, name: v.name}))
                      }
                      onChange={
                        (e, newValue) => this.handleProvider(newValue)
                      }
                      getOptionLabel={option => option.name}
                      getOptionSelected={option => option.id}
                      renderInput={
                        params => <TextField {...params} label="Поставщик"/>
                      }
                    />
                  </TableCell>
                  <TableCell colSpan={4} className="pt-3">
                    <TextField label="Накладная"
                               value={this.state.consignment.consignmentNumber}
                               onChange={e => this.handleTotals('consignmentNumber', e.target.value)}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center" style={{width: "30%"}}>Категория </TableCell>
                  <TableCell align="center" style={{width: "35%"}}>Наименование</TableCell>
                  <TableCell align="center">Кол-во</TableCell>
                  <TableCell align="center">Себ-ть</TableCell>
                  <TableCell align="center">Цена</TableCell>
                  <TableCell align="center" className={"p-1"}>
                    <Tooltip title="Добавить строку">
                      <IconButton className="p-2 m-2" onClick={() => this.handleAdd()}>
                        <AddCircleIcon/>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.consignment.products.map((product, i) => this.renderTr(i, product))}
                <TableRow>
                  <TableCell align="center" className="pt-3">
                    <TextField label="Итого по накладной"
                               disabled value={this.getConsignmentTotal()}
                    />
                  </TableCell>
                  <TableCell align="center" className="pt-3">
                    <TextField label="Доставка"
                               type="number" min={0}
                               value={this.state.consignment.delivery}
                               onChange={e => this.handleTotals('delivery', +e.target.value)}
                    />
                  </TableCell>
                  <TableCell colSpan="2" align="center" className="pt-3">
                    <TextField label="Итого с доставкой"
                               disabled value={this.getTotal()}
                    />
                  </TableCell>
                  <TableCell colSpan="2" align="center" className="pt-3">
                    <TextField label="Оплатили"
                               type="number"
                               value={this.state.consignment.actuallyPaid}
                               onChange={e => this.handleTotals('actuallyPaid', +e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={this.state.isSending}
            onClick={() => this.addConsignment()}
          >
            Внести
          </Button>
        </Grid>
      </Grid>
    </>
  }

}

const mapDispatchToProps = dispatch => bindActionCreators({
  enqueueSnackbar,
}, dispatch);

export default connect(state => (state), mapDispatchToProps)(Arrival);
