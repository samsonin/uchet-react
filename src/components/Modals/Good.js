import React, {forwardRef, useEffect, useState} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {upd_app} from "../../actions/actionCreator";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from '@material-ui/icons/Delete';
import RestoreFromTrashIcon from '@material-ui/icons/RestoreFromTrash';
import {Restore} from "@material-ui/icons";
import LineWeightIcon from '@material-ui/icons/LineWeight';

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {useSnackbar} from "notistack";

import rest from '../Rest'
import Tree from "../Tree";
import {TextField} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import {makeStyles} from "@material-ui/core/styles";
import DialogContent from "@material-ui/core/DialogContent";
// import {Barcodes} from '../Barcodes'

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

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    field: {
        margin: '1rem .3rem',
        width: '100%'
    },
    halfField: {
        margin: '1rem .3rem',
        width: '50%'
    },
    button: {
        margin: '2rem auto 0 auto',
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    }
}));


const Good = props => {

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar()

    const [treeOpen, setTreeOpen] = useState(false)
    const [orderId, setOrderId] = useState()
    const [sum, setSum] = useState(0)
    const [reason, setReason] = useState('')
    const [isReasonOpen, setIsReasonOpen] = useState(false)

    useEffect(() => {

        setSum(props.good.sum)

    }, [props.good.sum])

    useEffect(() => {

        setIsReasonOpen(false)

    }, [props.good])

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

        rest('orders/' + props.app.stock_id + '/' + orderId + '/' + props.good.barcode,
            'POST')
            .then(res => {
                if (res.status === 200) {

                    enqueueSnackbar('В заказе')
                    props.close()

                } else {

                    enqueueSnackbar(res.body.error || 'ошибка', {
                        variant: 'error',
                    })

                }
            })

    }

    const toSale = () => {

        let url = 'sales/' + props.app.stock_id + '/' + good.barcode + '/' + sum

        rest(url, 'POST')
            .then(res => {
                if (res.status === 200) {

                    enqueueSnackbar('продано!', {variant: 'success'})
                    props.upd_app(res.body)
                    props.close()

                } else {

                    enqueueSnackbar('не удалось продать', {variant: 'error'})

                }
            })

    }

    const refund = () => {

        if (good.barcode) {

            if (reason) {

                rest('sales/' + props.app.stock_id + '/' + good.barcode + '/' + reason, 'DELETE')
                    .then(res => {

                        if (res.status === 200) {
                            enqueueSnackbar('возврат записан', {variant: 'success'})
                            setReason('')
                            setIsReasonOpen(false)
                            props.close()
                        } else {
                            enqueueSnackbar('не удалось вернуть', {variant: 'error'})
                        }

                    })
            }

        } else {

            console.error('нет штрихкода')

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

    let consignment;
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

    const editable = !good.wo && good.stock_id === props.app.stock_id

    const renderIcon = (title, onClick, elem) => <Tooltip title={title}>
        <IconButton
            onClick={onClick}
        >
            {elem}
        </IconButton>
    </Tooltip>


    return <Dialog
        open={!!(good ?? good.id)}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => props.close()}
    >

        <DialogTitle>

            {'#' + good.id}

            {props.app.stock_id
                ? <span style={{
                    position: "absolute",
                    right: "50px"
                }}>
                    {good.wo === 't'
                        ? renderIcon('Из транзита',
                            () => transit(good.barcode, false),
                            <i className="fas fa-truck"/>)
                        : editable
                            ? <>
                                {isBarcodePrinted
                                    ? renderIcon('Штрихкод',
                                        () => window.print(),
                                        <LineWeightIcon />)
                                    : ''}
                                {renderIcon('В транзит',
                                    () => transit(good.barcode, true),
                                    <i className="fas fa-truck"/>)}
                                {renderIcon('В брак',
                                    () => console.log('В брак'),
                                    <i className="fas fa-redo"/>)}
                            </>
                            : good.stock_id === props.app.stock_id && good.wo === 'sale'
                                ? renderIcon('Вернуть',
                                () => setIsReasonOpen(!isReasonOpen),
                                <Restore/>)
                                : null}

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

            <IconButton aria-label="close" className={classes.closeButton}
                        onClick={() => props.close()}>
                <CloseIcon/>
            </IconButton>
            {isReasonOpen && <div style={{width: '100%'}}>
                <TextField label="Причина возврата"
                           className={classes.halfField}
                           value={reason}
                           onChange={e => setReason(e.target.value)}
                />

                <Button onClick={() => refund()}
                        disabled={!reason}
                        className={classes.button}
                        color="secondary">
                    Вернуть
                </Button>
            </div>}

        </DialogTitle>

        <DialogContent>

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

            <TextField label="Наименование"
                       className={classes.field}
                       value={good.model}
                       disabled={!editable}
            />

            {good.imei
                ? <TextField label="imei"
                             className={classes.field}
                             value={good.imei}
                             disabled={!editable}
                />
                : ''
            }

            {editable
                ? <>

                    <div style={{width: '100%'}}>
                        <TextField label="Номер заказа"
                                   className={classes.halfField}
                                   type="number"
                                   disabled={!editable}
                                   value={orderId}
                                   onChange={e => setOrderId(+e.target.value)}
                        />

                        <Button onClick={() => toOrder()}
                                className={classes.button}
                                color="primary">
                            Внести в заказ
                        </Button>
                    </div>

                    <div style={{width: '100%'}}>
                        <TextField label="Цена"
                                   className={classes.halfField}
                                   type="number"
                                   disabled={!editable}
                                   value={sum}
                                   onChange={e => setSum(+e.target.value)}
                        />

                        <Button onClick={() => toSale()}
                                className={classes.button}
                                color="primary">
                            Продать
                        </Button>
                    </div>

                </>
                : ''}

            <TextField label="Себестоимость"
                       className={classes.field}
                       value={good.remcost ?? good.cost ?? '0'}
            />
            <TextField label="Оприходовали"
                       className={classes.field}
                       value={time}
            />
            {provider
                ? <TextField label="Поставщик"
                             className={classes.field}
                             value={provider}
                />
                : null}

            {consignment
                ? <TextField
                    className={classes.field}
                    label="Накладная"
                    value={consignment}
                />
                : null}


            <TextField label="Точка"
                       className={classes.field}
                       value={getStockName(good.stock_id)}
            />

            {editable ? <>
                    <TextField label="Хранение"
                               className={classes.field}
                               value={good.storage_place}
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
                </>
                : <>
                    {wo.action
                        ? <TextField label="Израсходованна"
                                     value={wo.action}
                                     className={classes.field}
                        />
                        : null
                    }
                    {wo.remId
                        ? <TextField label="В Заказе"
                                     className={classes.field}
                                     value={wo.remId}
                        />
                        : null
                    }
                    {good.outtime
                        ? <TextField label="Время расхода"
                                     className={classes.field}
                                     value={good.outtime}
                        />
                        : null
                    }
                </>
            }

        </DialogContent>
    </Dialog>

}

export default connect(state => (state), mapDispatchToProps)(Good)