import React, {forwardRef, useEffect, useState} from "react";
import {connect} from "react-redux";

import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';


import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {useSnackbar} from "notistack";

import rest from '../Rest'
import Tree from "../Tree";
import {
    Card,
    CardActionArea, CardActions,
    CardMedia,
    Fade,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    TextField
} from "@material-ui/core";
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
import TwoLineInCell from "../common/TwoLineInCell";
import {toLocalTimeStr} from "../common/Time";
import GoodsActions from "../Good/GoodActions";

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
    },
    card: {
        width: '100%',
        // maxWidth: '400px'
    }
}));

const reader = new FileReader()

const Good = props => {

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar()

    const [treeOpen, setTreeOpen] = useState(false)

    const [isDrag, setIsDrag] = useState(false)
    const [image, setImage] = useState()
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

    let ui_wo = good.ui_wo

    if (!ui_wo) {

        if (good.wo.substring(0, 4) === 'sale') {
            ui_wo = 'Продан'
        } else if (good.wo === 'reject') {
            ui_wo = 'В браке'
        } else if (good.wo === 't') {
            ui_wo = 'В транзите'
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

        if (!ui_wo) ui_wo = 'Израсходованна'

    }

    const provider = props.app.providers.find(v => +v.id === +good.provider_id);

    const category = props.app.categories.find(v => v.id === good.category_id)

    const isEditable = !good.wo && good.stock_id === props.app.current_stock_id

    reader.onloadend = () => setImage(reader.result)

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

    const upload = () => {


    }

    const onDrag = (e, isLeave) => {

        e.preventDefault()
        setIsDrag(isLeave)

    }

    const onDrop = e => {

        e.preventDefault()

        const file = e.dataTransfer.files[0]

        rest('goods/' + good.barcode, 'POST', {file})

        setIsDrag(false)

    }

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

    const border = isDrag ? '3px dashed black' : '3px black'


    return <Dialog
        open={!!(good ?? good.id)}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => props.close()}
        className='non-printable'
    >

        <DialogTitle>

            {'#' + good.id}

            {<span style={{
                position: "absolute",
                right: "50px"
            }}>

                <GoodsActions
                    good={props.good}
                    setGood={props.setGood}
                />

            </span>}

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
                                {category ? category.name : 'Выбрать...'}
                            </Button>
                        </Grid>
                    }

                </Grid>

                {image && isEditable
                    ? <Card className={classes.card}>
                        <CardActionArea>
                            <CardMedia
                                component="img"
                                alt="Contemplative Reptile"
                                image={image}
                            />
                        </CardActionArea>
                        <CardActions>
                            <Button size="small" color="primary"
                                    onClick={() => setImage()}>
                                Отменить
                            </Button>
                            <Button size="small" color="primary"
                                    onClick={() => upload()}>
                                Загрузить
                            </Button>
                        </CardActions>
                    </Card>
                    : good.picture
                        ? <>
                            <img
                                src={'https://uchet.store/uploads/' + good.picture}
                                alt={good.model}
                                width={'100%'}
                            />
                            {isEditable && <Button onClick={() => console.log('Удалить')}>
                                Удалить
                            </Button>}
                        </>
                        : isEditable && <>
                        <div style={{
                            width: '100%',
                            height: '100px',
                            backgroundColor: 'lightgray',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border
                        }}
                             onDragLeave={e => onDrag(e, false)}
                             onDragOver={e => onDrag(e, true)}
                             onDrop={e => onDrop(e)}
                        >
                            {isDrag
                                ? 'Отпустите фото, чтобы загрузить'
                                : 'Перетащите фото, чтобы загрузить'}
                        </div>
                        <input type='file' onChange={e => reader.readAsDataURL(e.target.files[0])}/>
                    </>
                }

                <TextField label="Наименование"
                           className={classes.field}
                           value={model}
                           disabled={!isEditable}
                           onChange={e => setModel(e.target.value)}
                />

                {good.imei
                    ? <TextField label="imei"
                                 className={classes.field}
                                 value={imei}
                                 disabled={!isEditable}
                                 onChange={e => setImei(e.target.value)}
                    />
                    : ''}

                {isEditable
                    ? <>

                        <div style={{width: '100%'}}>

                            <TextField label="Номер заказа"
                                       className={classes.halfField}
                                       disabled={!isEditable}
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
                                       disabled={!isEditable}
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


                <div className={classes.field}>
                    {TwoLineInCell("Себестоимость", good.remcost ?? good.cost ?? 0)}
                </div>

                <div className={classes.field}>
                    {TwoLineInCell("Время оприходования", good.unix ? toLocalTimeStr(good.unix) : good.time)}
                </div>

                {provider && <div className={classes.field}>
                    {TwoLineInCell('Поставщик: ' + provider.name,
                        good.wf && good.wf.consignment_number && 'накладная: ' + good.wf.consignment_number)}
                </div>}

                {good.wo === 't' || <div className={classes.field}>
                    {TwoLineInCell('Точка:', getStockName(good.stock_id))}
                </div>}

                {isEditable
                    ? <>
                        <UsersSelect
                            classes={classes.field}
                            users={props.app.users}
                            user={responsibleId}
                            setUser={setResponsibleId}
                            onlyValid={true}
                            disabled={!isEditable}
                            label="ответственный"
                        />
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
                        <div className={classes.field}>
                            {TwoLineInCell('Ответственный:', responsibleId)}
                        </div>
                        {good.wo && <div className={classes.field}>
                            {TwoLineInCell('Статус:', ui_wo + ', c ' + toLocalTimeStr(good.out_unix))}
                        </div>}
                    </>
                }

                <Fade
                    in={!isSame && isEditable}
                    timeout={300}
                >
                    <Button onClick={() => save()}
                            variant="outlined"
                            color="secondary">
                        Сохранить
                    </Button>
                </Fade>

                {!isEditable && good.stock_id === props.app.current_stock_id && isSale(good.wo)
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