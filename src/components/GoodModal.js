import React, {useState} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {upd_app} from "../actions/actionCreator";
import {
    MDBBtn,
    MDBIcon,
    MDBInput,
    MDBInputGroup,
    MDBModal,
    MDBModalBody,
    MDBModalHeader
} from "mdbreact";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from '@material-ui/icons/Delete';
import RestoreFromTrashIcon from '@material-ui/icons/RestoreFromTrash';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {useSnackbar} from "notistack";

import rest from './Rest'
import Tree from "./Tree";
import {Barcodes} from './Barcodes'

const mapDispatchToProps = dispatch => bindActionCreators({
    upd_app
}, dispatch);

const woAlliases = {
    stock_id: "Точка",
    remid: "Заказ",
    rem_id: "Заказ",
    sale: "Продан",
    use: "В пользовании",
    loss: "Потерян",
    lost: "Потерян",
    shortrage: "Недостача",
    remself: "Ремонт для продажи",
    reject: "В браке",
    refund: "Вернули поставщику",
    t: "В транзите",
}


const GoodModal = props => {

    const [treeOpen, setTreeOpen] = useState(false)
    const [orderId, setOrderId] = useState()

    const {enqueueSnackbar} = useSnackbar()

    const getStockName = stockId => {
        let stock = props.app.stocks.find(v => +v.id === +stockId);
        return stock
            ? stock.name
            : ''
    }

    const transit = (barcode, isTo) => {

        rest('transit/' + props.app.stock_id + '/' + barcode,
            isTo
                ? 'POST'
                : 'DELETE')
            .then(res => {

                if (res.status === 200) {

                    props.upd_app(res.body)

                    enqueueSnackbar(isTo
                        ? 'Передали в транзит'
                        : 'Приняли из транзита', {
                        variant: 'success',
                    });

                    props.close()

                }

            })

    }

    const toOrder = () => {

        console.log(orderId)

        if (+orderId < 1) {

            enqueueSnackbar('Некорректный номер заказа', {
                variant: 'error',
            })

        }


    }

    const handleTree = category_id => {
        good.category_id = +category_id
        setTreeOpen(false)
    }


    let good = props.good

    if (!(good && good.id)) return '';

    let isBarcodePrinted = props.auth.admin || 12 > Math.round((Date.now() - Date.parse(good.time)) / 360000);

    let wo = {action: 'Израсходован'}

    if (good.wo.substr(0, 4) === 'sale') {
        wo = {
            action: 'Продан',
            stockId: good.wo.substr(4, 1),
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

    let providerObj = props.app.providers.find(v => +v.id === +good.provider_id);
    let provider = providerObj
        ? providerObj.name
        : ''

    let userObj = props.app.users.find(v => v.id === +good.responsible_id)
    let responsibleName = userObj
        ? userObj.name
        : ''

    let time = good.time;

    let isPublic = typeof (good.public) === "boolean" ?
        good.public :
        +good.public > 0;

    let categoryName = good.category_id > 0
        ? props.app.categories.find(v => v.id === good.category_id).name
        : 'Выбрать...'

    return <MDBModal
        isOpen={good.id !== undefined}
        centered
    >
        <MDBModalHeader
            toggle={props.close}
        >
            {'#' + good.id}

            {props.app.stock_id
                ? <span style={{
                    position: "absolute",
                    right: "50px"
                }}>
                    {good.wo === 't'
                        ? <Tooltip title="Из транзита">
                            <IconButton
                                onClick={() => transit(good.barcode, false)}
                            >
                                <i className="fas fa-truck"/>
                            </IconButton>
                        </Tooltip>
                        : good.wo === ''
                            ? <>
                                {isBarcodePrinted
                                    ? <Tooltip title="Штрихкод">
                                        <IconButton
                                            onClick={() => window.print()}
                                        >
                                            <MDBIcon icon="barcode"/>
                                        </IconButton>
                                    </Tooltip>
                                    : ''}
                                <Tooltip title="В транзит">
                                    <IconButton
                                        onClick={() => transit(good.barcode, true)}
                                    >
                                        <i className="fas fa-truck"/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="На возврат">
                                    <IconButton
                                        // onClick={() => goodRequest(good.barcode, 'reject')}
                                    >
                                        <i className="fas fa-redo"/>
                                    </IconButton>
                                </Tooltip>
                            </>
                            : ''}

                    {props.auth.admin ?
                        good.wo === 'use' ?
                            <Tooltip title="Восстановить">
                                <IconButton
                                    // onClick={() => goodRequest(good.barcode, 'restore')}
                                >
                                    <RestoreFromTrashIcon/>
                                </IconButton>
                            </Tooltip> :
                            good.wo === '' ?
                                <Tooltip title="Списать">
                                    <IconButton
                                        // onClick={() => goodRequest(good.barcode, 'deduct')}
                                    >
                                        <DeleteIcon/>
                                    </IconButton>
                                </Tooltip> :
                                '' :
                        ''}
            </span>
                : ''}

        </MDBModalHeader>

        <MDBModalBody>

            <Grid container>

                {treeOpen ?
                    <>
                        <Grid item xs={10} className="pt-1 pr-1">
                            <Tree initialId={good.category_id}
                                  categories={props.app.categories}
                                  onSelected={id => good.category_id = +id}
                                  finished={id => handleTree(id)}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Button size="small" onClick={() => setTreeOpen(false)}
                                    variant="outlined"
                            >
                                Ок
                            </Button>
                        </Grid>
                    </>
                    : <Grid item xs={12}>
                        <Button size="small" className="w-100" onClick={() => setTreeOpen(true)}>
                            {categoryName}
                        </Button>
                    </Grid>
                }

            </Grid>

            <MDBInput label="Наименование" size="lg" valueDefault={good.model}
                      disabled={good.wo !== ''}
            />

            {good.imei
                ? <MDBInput label="imei" valueDefault={good.imei}
                            disabled={good.wo !== ''}
                />
                : ''
            }

            {props.app.stock_id && !good.wo
                ? <>
                    <MDBInputGroup
                        material
                        // onChange={e => setOrderId(e.target.value)}

                        onChange={() => console.log('onChange')}

                        containerClassName="mb-3 mt-0"
                        type="number"
                        hint="Введите номер заказа"

                        append={
                            <MDBBtn className="m-0 px-3 py-2 z-depth-0"
                                    onClick={() => toOrder()}>
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
                </>
                : ''}

            <MDBInputGroup containerClassName="mb-3" prepend="Себестоимость"
                           value={good.remcost}
            />
            <MDBInputGroup containerClassName="mb-3" prepend="Оприходовали"
                           value={time}
            />

            {provider ? <MDBInputGroup containerClassName="mb-3" prepend="Поставщик"
                                       value={provider}
            /> : ''}

            {consignment
                ? <MDBInputGroup
                    containerClassName="mb-3" prepend="Накладная"
                    value={consignment}
                />
                : ''}

            <MDBInput label="Точка" value={getStockName(good.stock_id)} disabled={true}/>

            {good.wo === '' ? <>
                <MDBInput label="Хранение" valueDefault={good.storage_place}
                          onChange={() => console.log('Хранение')}
                />

                {/*{(+good.responsible_id > 0 && typeof (responsibleName) === 'string')*/}
                {/*    ? <MDBInput label="Ответственный" value={responsibleName}/>*/}
                {/*    : <FormControl className="m-2 w-100">*/}
                {/*        <InputLabel>*/}
                {/*            Ответственный*/}
                {/*        </InputLabel>*/}
                {/*        <Select*/}
                {/*            value={+good.responsible_id}*/}
                {/*            onChange={(e) => console.log(e.target.value)}*/}
                {/*        >*/}
                {/*            <MenuItem value={0} key={"goodmodaluserseklerjger" + 0}><br/></MenuItem>*/}
                {/*            {props.app.users.map(v => v.is_valid ?*/}
                {/*                <MenuItem value={v.id} key={"goodmodaluserseklerjger" + v.id}*/}
                {/*                          selected={+good.responsible_id === v.id}*/}
                {/*                >*/}
                {/*                    {v.name}*/}
                {/*                </MenuItem> : ''*/}
                {/*            )}*/}
                {/*        </Select>*/}
                {/*    </FormControl>*/}
                {/*}*/}

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

}

export default connect(state => (state), mapDispatchToProps)(GoodModal)