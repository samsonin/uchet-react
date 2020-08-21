import {
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBInputGroup,
  MDBModal,
  MDBModalBody,
  MDBModalHeader
} from "mdbreact";
import React, {Component} from "react";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from '@material-ui/icons/Delete';
import RestoreFromTrashIcon from '@material-ui/icons/RestoreFromTrash';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {closeSnackbar, enqueueSnackbar, upd_app} from "../actions/actionCreator";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import request from "./Request";
import Tree from "./Tree";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

const mapDispatchToProps = dispatch => bindActionCreators({
  enqueueSnackbar,
  closeSnackbar,
  upd_app
}, dispatch);

let good;

const woAlliases = {
  stock_id: "Точка",
  remid: "Заказ",
  sale: "Продан",
  use: "В пользовании",
  loss: "Потерян",
  shortrage: "Недостача",
  remself: "Ремонт для продажи",
  reject: "В браке",
  refund: "Вернули",
  t: "В транзите",
}


export default connect(state => (state), mapDispatchToProps)(class extends Component {

  state = {
    treeOpen: false,
  }

  // componentWillUpdate(nextProps, nextState) {
  //     console.log('GoodModal nextState', nextState)
  // }

  getStockName = stockId => {
    let stockName = this.props.app.stocks.find(v => +v.id === +stockId);
    return stockName === undefined ?
      '' : stockName.name;
  }

  goodRequest(barcode, action) {

    let rem_id = '';
    if (action === 'toOrder') {
      rem_id = +document.getElementById('goodToOrderInput').value;
      if (rem_id <= 0) {
        this.props.enqueueSnackbar({
          message: 'Некорректный номер заказа',
          options: {
            variant: 'error',
            autoHideDuration: 1000
          }
        })
        return false;
      }
    }

    request({
      action,
      stock_id: this.props.app.stock_id,
      barcode,
      rem_id
    }, '/good', this.props.auth.jwt)
      .then(data => {
        if (data.result) this.props.close()
        else this.props.enqueueSnackbar({
          message: data.error || 'ошибка',
          options: {
            variant: 'error',
            autoHideDuration: 1000
          }
        })
      })

  }

  handleTree = category_id => {
    good.category_id = +category_id
    this.setState({treeOpen: false})
  }

  render() {

    good = this.props.good;

    if (good.id === undefined) return null;

    let isBarcodePrinted = this.props.auth.admin || 12 > Math.round((Date.now() - Date.parse(good.time)) / 360000);

    let wo = {
      action: 'Израсходован'
    };
    if (good.wo.substr(0, 4) === 'sale') {
      wo = {
        action: 'Продан',
        stockId: wo.substr(4, 1),
      }
    } else {
      try {
        wo = JSON.parse(good.wo);
        if (wo.remid !== undefined) {
          wo = {
            action: 'В заказ',
            remId: wo.remid,
            stockId: wo.stock_id,
          }
        }
      } catch (e) {
        wo.action = woAlliases[good.wo] || good.wo;
      }
    }

    let consignment = "0";
    try {
      let wf = JSON.parse(good.wf)
      good.provider_id = wf.provider_id || good.provider_id;
      consignment = wf.consignment_number;
    } catch (e) {

    }

    let provider = this.props.app.providers.find(v => +v.id === +good.provider_id);
    if (provider !== undefined) provider = provider.name || '';

    let responsibleName;
    if (+good.responsible_id > 0) {
      responsibleName = this.props.app.users.find(v => v.id === +good.responsible_id).name;
    }

    let time = good.time;

    let isPublic = typeof (good.public) === "boolean" ?
      good.public :
      +good.public > 0;

    let categoryName = good.category_id > 0 ?
      this.props.app.categories.find(v => v.id === good.category_id).name :
      'Выбрать...';

    return <>
      <MDBModal
        isOpen={good.id !== undefined}
        centered
      >
        <MDBModalHeader
          toggle={this.props.close}
        >
          {'#' + good.id}

          <span style={{
            position: "absolute",
            right: "50px"
          }}>

                    {
                      good.wo === 't' ?
                        <Tooltip title="Из транзита">
                          <IconButton
                            onClick={() => this.goodRequest(good.barcode, 'transit')}
                          >
                            <i className="fas fa-truck"/>
                          </IconButton>
                        </Tooltip> :
                        good.wo === '' ? <>
                          {isBarcodePrinted ? <Tooltip title="Штрихкод">
                            <IconButton
                              onClick={() => console.log(good.barcode)}
                            >
                              <MDBIcon icon="barcode"/>
                            </IconButton>
                          </Tooltip> : ''}
                          <Tooltip title="В транзит">
                            <IconButton
                              onClick={() => this.goodRequest(good.barcode, 'transit')}
                            >
                              <i className="fas fa-truck"/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="На возврат">
                            <IconButton
                              onClick={() => this.goodRequest(good.barcode, 'reject')}
                            >
                              <i className="fas fa-redo"/>
                            </IconButton>
                          </Tooltip>
                        </> : ''}

            {this.props.auth.admin ?
              good.wo === 'use' ?
                <Tooltip title="Восстановить">
                  <IconButton
                    onClick={() => this.goodRequest(good.barcode, 'restore')}
                  >
                    <RestoreFromTrashIcon/>
                  </IconButton>
                </Tooltip> :
                good.wo === '' ?
                  <Tooltip title="Списать">
                    <IconButton
                      onClick={() => this.goodRequest(good.barcode, 'deduct')}
                    >
                      <DeleteIcon/>
                    </IconButton>
                  </Tooltip> :
                  '' :
              ''}

                         </span>
        </MDBModalHeader>
        <MDBModalBody>

          <Grid container>

            {this.state.treeOpen ?
              <>
                <Grid item xs={10} className="pt-1 pr-1">
                  <Tree id={good.category_id} categories={this.props.app.categories}
                        onSelected={this.handleTree}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button size="small" onClick={() => this.setState({treeOpen: false})}
                          variant="outlined"
                  >
                    Ок
                  </Button>
                </Grid>
              </>
              :
              <Grid item xs={12}>
                <Button size="small" className="w-100" onClick={() => this.setState({treeOpen: true})}>
                  {categoryName}
                </Button>
              </Grid>
            }

          </Grid>

          <MDBInput label="Наименование" size="lg" valueDefault={good.model}
                    disabled={good.wo !== ''}
          />

          {good.imei === undefined ? '' :
            <MDBInput label="imei" valueDefault={good.imei}
                      disabled={good.wo !== ''}
            />
          }

          {good.wo === '' ? <>
            <MDBInputGroup
              material
              containerClassName="mb-3 mt-0"
              type="number"
              id="goodToOrderInput"
              hint="Введите номер заказа"
              append={
                <MDBBtn className="m-0 px-3 py-2 z-depth-0"
                        onClick={() => this.goodRequest(good.barcode, 'toOrder')}>
                  Внести в заказ
                </MDBBtn>
              }
            />
            <MDBInputGroup
              material
              containerClassName="mb-3 mt-0"
              type="number"
              valueDefault={good.sum}
              hint="Стоимость"
              append={
                <MDBBtn className="m-0 px-3 py-2 z-depth-0">
                  продать
                </MDBBtn>
              }
            />
          </> : ''}

          <MDBInputGroup containerClassName="mb-3" prepend="Себестоимость"
                         value={good.remcost}
          />
          <MDBInputGroup containerClassName="mb-3" prepend="Оприходовали"
                         value={time}
          />

          {provider ? <MDBInputGroup containerClassName="mb-3" prepend="Поставщик"
                                     value={provider}
          /> : ''}

          {consignment ? <MDBInputGroup
            containerClassName="mb-3" prepend="Накладная"
            value={consignment}
          /> : ''}

          <MDBInput label="Точка" value={this.getStockName(good.stock_id)} disabled={true}/>

          {good.wo === '' ? <>
            <MDBInput label="Хранение" valueDefault={good.storage_place}
                      onChange={() => console.log('Хранение')}
            />

            {(+good.responsible_id > 0 && typeof (responsibleName) === 'string') ?
              <MDBInput label="Ответственный" value={responsibleName}/> :
              <FormControl className="m-2 w-100">
                <InputLabel>
                  Ответственный
                </InputLabel>
                <Select
                  // value={0}
                  onChange={(e) => console.log(e.target.value)}
                >
                  <MenuItem value={0} key={"goodmodaluserseklerjger" + 0}><br/></MenuItem>
                  {this.props.app.users.map(v => v.is_valid ?
                    <MenuItem value={v.id} key={"goodmodaluserseklerjger" + v.id}>
                      {v.name}
                    </MenuItem> : ''
                  )}
                </Select>
              </FormControl>
            }

            <FormControlLabel
              className="m-2 p-2"
              control={
                <Checkbox
                  defaultChecked={isPublic}
                  // checked={isPublic}
                  // onChange={handleChange}
                  // name="checkedB"
                  color="primary"
                />
              }
              label="Опубликовать в интернете"
            />
          </> : <>
            {wo.action ?
              <MDBInput label="Израсходованна" value={wo.action} disabled={true}/> : ''
            }
            {good.outtime ?
              <MDBInput label="Время расхода" value={good.outtime} disabled={true}/> : ''
            }
            {wo.remId ?
              <MDBInput label="Заказ" value={wo.remId} disabled={true}/> : ''
            }
          </>
          }

        </MDBModalBody>
      </MDBModal>
    </>
  }

})
