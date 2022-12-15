import React, {forwardRef, useEffect, useState} from "react";
import {connect} from "react-redux";

import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import DeleteIcon from '@material-ui/icons/Delete';
import RestoreFromTrashIcon from '@material-ui/icons/RestoreFromTrash';
import LineWeightIcon from '@material-ui/icons/LineWeight';
import BuildIcon from '@material-ui/icons/Build';
import PrintIcon from '@material-ui/icons/Print';

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {useSnackbar} from "notistack";

import rest from '../Rest'
import Tree from "../Tree";
import {Fade, List, ListItem, ListItemText, ListSubheader, TextField} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import {makeStyles} from "@material-ui/core/styles";
import DialogContent from "@material-ui/core/DialogContent";
import {intInputHandler} from "../common/InputHandlers";
import {GoodSearch} from "../common/GoodSearch";
import UsersSelect from "../common/UsersSelect";
import {createDate, Print} from "../common/Print";
import IsPublicCheckBox from "../common/IsPublicCheckBox";


const woAlliases = {
    use: "В пользовании",
    loss: "Потерян",
    lost: "Потерян",
    shortage: "Недостача",
    remself: "Ремонт для продажи",
    reject: "В браке",
    refund: "Вернули поставщику",
    t: "В транзите",
    prepaid: 'По предоплате'
}

const groupAlias = {
    5: 'Телефон',
    38: 'Ноутбук',
    41: 'Планшет',
}

const aliases = {
    categoryId: 'category_id',
    model: 'model',
    imei: 'imei',
    sum: 'sum',
    responsibleId: 'responsible_id',
    storagePlace: 'storage_place',
    isPublic: 'public'
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

    const [categoryId, setCategoryId] = useState(0)
    const [model, setModel] = useState('')
    const [imei, setImei] = useState('')
    const [orderId, setOrderId] = useState()
    const [sum, setSum] = useState(0)
    const [storagePlace, setStoragePlace] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [responsibleId, setResponsibleId] = useState(0)

    const [reason, setReason] = useState('')
    const [isReasonOpen, setIsReasonOpen] = useState(false)
    const [isRepair, setIsRepair] = useState(false)
    const [repairSum, setRepairSum] = useState(0)
    const [goodsForRepair, setGoodsForRepair] = useState([])
    const [repairJob, setRepairJob] = useState('')
    const [repairMasterId, setRepairMasterId] = useState(0)
    const [repairCash, setRepairCash] = useState(false)

    const pb = props.good.public || props.good.parts === 'sale'

    useEffect(() => {

        setIsReasonOpen(false)

        if (!props.good.category_id && props.good.group) {
            Object.entries(groupAlias).map(([cat, groupName]) => {
                if (props.good.group === groupName) setCategoryId(+cat)
            })
        } else setCategoryId(props.good.category_id)

        setSum(props.good.sum)
        setModel(props.good.model)
        if (props.good.imei) setImei(props.good.imei)
        setResponsibleId(+good.responsible_id)
        setStoragePlace(props.good.storage_place)
        setIsPublic(pb)

    }, [props.good])

    const isSame = categoryId === props.good.category_id
        && model === props.good.model
        && imei === props.good.imei
        && sum === props.good.sum
        && responsibleId === +props.good.responsible_id
        && storagePlace === props.good.storage_place
        && isPublic === (pb)

    const getStockName = stockId => {
        let stock = props.app.stocks.find(v => +v.id === +stockId);
        return stock ? stock.name : ''
    }

    const toOrder = () => {

        if (+orderId < 1) return enqueueSnackbar('Некорректный номер заказа', {
            variant: 'error',
        })

        rest('orders/' + props.app.current_stock_id + '/' + orderId + '/' + props.good.barcode,
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

        rest('sales/' + props.app.current_stock_id + '/' + good.barcode + '/' + sum, 'POST')
            .then(res => {
                if (res.status === 200) {

                    props.close()

                    if (good.barcode.toString().substring(0, 6) === '115104') Print(doc, alias)
                    else enqueueSnackbar('продано!', {variant: 'success'})

                } else {

                    enqueueSnackbar('не удалось продать', {variant: 'error'})

                }
            })

    }

    const refund = () => {

        if (good.barcode && reason) {

            rest('sales/' + props.app.current_stock_id + '/' + good.barcode + '/' + reason, 'DELETE')
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

    }

    const goodRest = (url, method, success) => {

        const barcode = good.barcode || good.imei
        if (!barcode) enqueueSnackbar('нет кода или S/N', {variant: 'error'})

        rest(url + barcode, method)
            .then(res => {

                if (res.status === 200) {

                    if (url.substring(0, 7) === 'transit' && method === 'POST') {
                        if (typeof (props.hide) === "function") props.hide(good.id)
                    }

                    if (props.close) props.close()

                    enqueueSnackbar(success, {variant: 'success'})

                    if (res.body.goods) props.setGood(res.body.goods)

                } else {

                    enqueueSnackbar('ошибка ' + res.status, {variant: 'error'})

                }
            })
    }

    const transit = isTo => goodRest('transit/' + props.app.current_stock_id + '/',
        isTo ? 'POST' : 'DELETE',
        isTo ? 'Передано в транзит' : 'Принято из транзита')

    const use = () => goodRest('goods/', 'DELETE', 'Списано в пользование')

    const restore = () => goodRest('goods/restore/', 'POST', 'Восстановлено')

    const reject = () => goodRest('goods/reject/', 'DELETE', 'Списано в брак')

    const repair = () => {

        const barcode = good.barcode || good.imei

        if (!barcode) enqueueSnackbar('нет кода или S/N', {variant: 'error'})

        const data = {
            sum: repairSum,
            job: repairJob,
        }

        if (repairCash) data.cash = true
        else data.master_id = repairMasterId

        if (goodsForRepair.length) data.barcodes = goodsForRepair.map(g => g.barcode)

        rest('goods/repair/' + barcode, 'PATCH', data)
            .then(res => {

                if (res.status === 200) {

                    setRepairSum(0)
                    setRepairJob('')
                    setRepairMasterId(0)
                    setGoodsForRepair([])
                    setIsRepair(false)

                    enqueueSnackbar('Работа добавлена!', {variant: 'success'})

                    if (res.body.goods) props.setGood(res.body.goods)

                } else {

                    enqueueSnackbar('ошибка ' + res.status, {variant: 'error'})

                }

            })

    }

    const save = () => {

        if (isSame) return enqueueSnackbar('нет изменений', {variant: 'error'})

        const data = {}

        for (const key in aliases) {

            if (eval(key) !== props.good[aliases[key]]) {
                data[aliases[key]] = eval(key)
            }

        }

        if (data === {}) return enqueueSnackbar('нет изменений', {variant: 'error'})

        rest('goods/' + props.good.barcode, 'PATCH', data)
            .then(res => {
                if (res.status === 200) {

                    if (typeof res.body.good === 'object') props.setGood(res.body.good)

                }
            })

    }

    const onSelected = (good, afterRes) => {

        setGoodsForRepair(prev => {

            const next = [...prev]
            next.push(good)
            return next

        })

        afterRes(true)

    }

    const remove = barcode => setGoodsForRepair(prev => prev.filter(g => g.barcode !== barcode))

    const handleTree = category_id => {
        good.category_id = +category_id
        setTreeOpen(false)
    }

    let good = props.good

    if (!(good && good.id)) return '';

    let isBarcodePrinted = props.auth.admin || 12 > Math.round((Date.now() - Date.parse(good.time)) / 360000);

    let ui_wo = good.ui_wo

    if (!ui_wo) {

        if (good.wo.substring(0, 4) === 'sale') {
            ui_wo = 'Продан'
        } else if (good.wo === 'reject') {
            ui_wo = 'В браке'
        } else {

            try {

                const wo = JSON.parse(good.wo);

                ui_wo = wo.remid
                    ? 'В заказ ' + wo.remid
                    : wo.sale_id
                        ? 'Продан'
                        : wo.action && wo.action === 'remself'
                            ? 'Для витрины'
                            : woAlliases[good.wo]

            } catch (e) {

            }

        }

        ui_wo = 'Израсходованна'

    }

    let consignment;
    try {
        let wf = JSON.parse(good.wf)
        good.provider_id = wf.provider_id || good.provider_id;
        consignment = wf.consignment_number;
    } catch (e) {

    }

    const provider = props.app.providers.find(v => +v.id === +good.provider_id);

    let time = good.time;

    let categoryName = good.category_id > 0
        ? props.app.categories.find(v => v.id === good.category_id).name
        : 'Выбрать...'

    const editable = !good.wo && good.stock_id === props.app.current_stock_id

    const renderIcon = (title, onClick, elem) => <Tooltip title={title}>
        <IconButton onClick={onClick}>
            {elem}
        </IconButton>
    </Tooltip>

    const isSale = wo => {

        if (wo === 'sale') return true

        try {

            const o = JSON.parse(wo)

            return !!o.sale_id

        } catch (e) {

            return false

        }

    }

    const doc = props.app.docs.find(d => d.name === 'sale_showcase')

    const stock = props.app.stocks.find(s => s.id === good.stock_id)

    const alias = {
        organization_organization: props.app.organization.organization,
        organization_name: props.app.organization.name,
        organization_legal_address: props.app.organization.legal_address,
        organization_inn: props.app.organization.inn,
        access_point_address: stock.address || '',
        access_point_phone_number: stock.phone_number || '',
        today: createDate(good.wo ? good.outtime : null),
        model: good.model,
        imei: good.imei,
        sum: sum || good.sum,
    }

    return <Dialog
        open={!!(good ?? good.id)}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => props.close()}
        className='non-printable'
    >

        <DialogTitle>

            {'#' + good.id}

            {props.app.current_stock_id
                ? <span style={{
                    position: "absolute",
                    right: "50px"
                }}>
                    {good.wo === 't'
                        ? renderIcon('Из транзита',
                            () => transit(false),
                            <i className="fas fa-truck"/>)
                        : editable
                            ? <>
                                {isBarcodePrinted
                                    ? renderIcon('Штрихкод',
                                        () => window.print(),
                                        <LineWeightIcon/>)
                                    : ''}
                                {renderIcon('В транзит',
                                    () => transit(true),
                                    <i className="fas fa-truck"/>)}
                                {renderIcon('В брак',
                                    () => reject(),
                                    <i className="fas fa-redo"/>)}
                                {renderIcon('Починить',
                                    () => setIsRepair(!isRepair),
                                    <BuildIcon/>)}
                            </>
                            : good.wo.indexOf('sale') > -1 && <IconButton onClick={() => Print(doc, alias)}>
                            <PrintIcon/>
                        </IconButton>}

                    {props.auth.admin
                        ? good.wo
                            ? good.wo === 'use'
                                ? <Tooltip title="Восстановить">
                                    <IconButton
                                        onClick={() => restore()}
                                    >
                                        <RestoreFromTrashIcon/>
                                    </IconButton>
                                </Tooltip>
                                : null
                            : <Tooltip title="Списать">
                                <IconButton
                                    onClick={() => use()}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            </Tooltip>
                        : null}
                        </span>
                : ''}

            <IconButton aria-label="close" className={classes.closeButton}
                        onClick={() => props.close()}>
                <CloseIcon/>
            </IconButton>

        </DialogTitle>

        {isRepair
            ? <DialogContent>

                <TextField label="Общая стоимость работ"
                           className={classes.field}
                           value={repairSum}
                           onChange={e => intInputHandler(e.target.value, setRepairSum)}
                />

                <TextField label="Выполненная работа"
                           className={classes.field}
                           value={repairJob}
                           onChange={e => setRepairJob(e.target.value)}
                />

                {goodsForRepair && goodsForRepair.length
                    ? <List subheader={
                        <ListSubheader component="div" id="nested-list-subheader">
                            Список используемых запчастей
                        </ListSubheader>
                    }>
                        {goodsForRepair.map(g => <ListItem
                            key={'listitemkeyingoodmodalsforrepair' + g.barcode}
                        >
                            <ListItemText primary={g.model} secondary={g.remcost}/>
                            <IconButton
                                onClick={() => remove(g.barcode)}
                            >
                                <DeleteIcon/>
                            </IconButton>
                        </ListItem>)}
                    </List>
                    : null}

                <GoodSearch onSelected={onSelected}/>

                <div style={{
                    width: '100%'
                }}>

                    {repairCash || <UsersSelect
                        classes={classes.field}
                        users={props.app.users}
                        user={repairMasterId}
                        setUser={setRepairMasterId}
                        onlyValid={true}
                    />}

                    {!repairMasterId && <FormControlLabel
                        control={<Checkbox checked={repairCash} onChange={() => setRepairCash(!repairCash)}/>}
                        label="списать с кассы"
                    />}

                </div>

                <Button
                    variant="outlined"
                    onClick={() => repair()}
                >
                    Добавить работу
                </Button>

            </DialogContent>

            : <DialogContent>

                <Grid container>

                    {treeOpen
                        ? <>
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
                           value={model}
                           disabled={!editable}
                           onChange={e => setModel(e.target.value)}
                />

                {good.imei
                    ? <TextField label="imei"
                                 className={classes.field}
                                 value={imei}
                                 disabled={!editable}
                                 onChange={e => setImei(e.target.value)}
                    />
                    : ''}

                {editable
                    ? <>

                        <div style={{width: '100%'}}>

                            <TextField label="Номер заказа"
                                       className={classes.halfField}
                                       disabled={!editable}
                                       value={orderId}
                                       onChange={e => intInputHandler(e.target.value, setOrderId)}
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
                                       disabled={!editable}
                                       value={sum}
                                       onChange={e => intInputHandler(e.target.value, setSum)}
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
                           value={good.remcost ?? good.cost ?? 0}
                />
                <TextField label="Оприходовали"
                           className={classes.field}
                           value={time}
                />

                {provider
                    ? <TextField label="Поставщик"
                                 className={classes.field}
                                 value={provider.name}
                    />
                    : ''}

                {consignment
                    ? <TextField
                        className={classes.field}
                        label="Накладная"
                        value={consignment}
                    />
                    : ''}

                <TextField label="Точка"
                           className={classes.field}
                           value={getStockName(good.stock_id)}
                />

                {editable || responsibleId
                    ? <UsersSelect
                        classes={classes.field}
                        users={props.app.users}
                        user={responsibleId}
                        setUser={setResponsibleId}
                        onlyValid={true}
                        disabled={!editable}
                        label="ответственный"
                    />
                    : null}

                {editable
                    ? <>
                        <TextField label="Хранение"
                                   className={classes.field}
                                   value={storagePlace}
                                   onChange={e => setStoragePlace(e.target.value)}
                        />

                        <IsPublicCheckBox
                            value={isPublic}
                            onChange={() => setIsPublic(!isPublic)}
                        />

                    </>
                    : <>

                        {good.wo
                            ? <TextField label="Израсходованна"
                                         value={ui_wo}
                                         className={classes.field}
                            />
                            : null}

                        {good.outtime
                            ? <TextField label="Время расхода"
                                         className={classes.field}
                                         value={good.outtime}
                            />
                            : null}

                    </>
                }

                <Fade
                    in={!isSame}
                    timeout={300}
                >
                    <Button onClick={() => save()}
                            variant="outlined"
                            color="secondary">
                        Сохранить
                    </Button>
                </Fade>

                {!editable && good.stock_id === props.app.current_stock_id && isSale(good.wo)
                    ? isReasonOpen
                        ? <div style={{width: '100%'}}>
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
                        </div>
                        : <Button onClick={() => setIsReasonOpen(!isReasonOpen)}
                                  variant="outlined"
                                  color="secondary">
                            Отмена продажи
                        </Button>
                    : null
                }

            </DialogContent>}

    </Dialog>

}

export default connect(state => (state))(Good)