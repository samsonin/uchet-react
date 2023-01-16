import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {
    Grid,
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardMedia,
    Fade,
    TextField,
    List,
    ListSubheader, ListItem, ListItemText
} from "@material-ui/core";

import Tree from "../Tree";
import {intInputHandler} from "../common/InputHandlers";
import {toLocalTimeStr} from "../common/Time";
import UsersSelect from "../common/UsersSelect";
import IsPublicCheckBox from "../common/IsPublicCheckBox";
import rest from "../Rest";
import {makeStyles} from "@material-ui/core/styles";
import {createDate, Print} from "../common/Print";
import {useSnackbar} from "notistack";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import {GoodSearch} from "../common/GoodSearch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";


const groupAlias = {
    5: 'Телефон',
    38: 'Ноутбук',
    41: 'Планшет',
}

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

const aliases = {
    categoryId: 'category_id',
    model: 'model',
    imei: 'imei',
    sum: 'sum',
    responsibleId: 'responsible_id',
    storagePlace: 'storage_place',
    isPublic: 'public'
}

const reader = new FileReader()

const useStyles = makeStyles((theme) => ({
    field: {
        margin: '1rem .3rem',
        width: '100%'
    },
    card: {
        width: '100%',
        // maxWidth: '400px'
    }
}));


const GoodContent = props => {

    const [isDrag, setIsDrag] = useState(false)
    const [image, setImage] = useState()
    const [treeOpen, setTreeOpen] = useState(false)
    const [categoryId, setCategoryId] = useState(0)
    const [model, setModel] = useState('')
    const [imei, setImei] = useState('')
    const [orderId, setOrderId] = useState()
    const [sum, setSum] = useState(0)
    const [storagePlace, setStoragePlace] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [responsibleId, setResponsibleId] = useState(0)

    const [repairSum, setRepairSum] = useState(0)
    const [goodsForRepair, setGoodsForRepair] = useState([])
    const [repairJob, setRepairJob] = useState('')
    const [repairMasterId, setRepairMasterId] = useState(0)
    const [repairCash, setRepairCash] = useState(false)

    const [reason, setReason] = useState('')
    const [isReasonOpen, setIsReasonOpen] = useState(false)

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar()

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
        setResponsibleId(+props.good.responsible_id)
        setStoragePlace(props.good.storage_place)
        setIsPublic(pb)

    }, [props.good])


    const provider = props.app.providers.find(v => +v.id === +props.good.provider_id)
    const category = props.app.categories.find(v => v.id === props.good.category_id)
    const doc = props.app.docs.find(d => d.name === 'sale_showcase')
    const stock = props.app.stocks.find(s => s.id === props.good.stock_id)

    const isEditable = !props.good.wo && props.good.stock_id === props.app.current_stock_id

    const pb = props.good.public || props.good.parts === 'sale'

    const isSame = categoryId === props.good.category_id
        && model === props.good.model
        && imei === props.good.imei
        && sum === props.good.sum
        && responsibleId === +props.good.responsible_id
        && storagePlace === props.good.storage_place
        && isPublic === (pb)

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

        rest('sales/' + props.app.current_stock_id + '/' + props.good.barcode + '/' + sum, 'POST')
            .then(res => {
                if (res.status === 200) {

                    props.close()

                    if (props.good.barcode.toString().substring(0, 6) === '115104') Print(doc, alias)
                    else enqueueSnackbar('продано!', {variant: 'success'})

                } else {

                    enqueueSnackbar('не удалось продать', {variant: 'error'})

                }
            })

    }

    const refund = () => {

        if (props.good.barcode && reason) {

            rest('sales/' + props.app.current_stock_id + '/' + props.good.barcode + '/' + reason, 'DELETE')
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

    const repair = () => {

        const barcode = props.good.barcode

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
                    props.setIsRepair(false)

                    enqueueSnackbar('Работа добавлена!', {variant: 'success'})

                    if (res.body.goods) props.setGood(res.body.goods)

                } else {

                    enqueueSnackbar('ошибка ' + res.status, {variant: 'error'})

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
        props.good.category_id = +category_id
        setTreeOpen(false)
    }

    const onDrag = (e, isLeave) => {

        e.preventDefault()
        setIsDrag(isLeave)

    }

    const onDrop = e => {

        e.preventDefault()

        const file = e.dataTransfer.files[0]

        rest('goods/' + props.good.barcode, 'POST', {file})

        setIsDrag(false)

    }

    const upload = () => {


    }

    const alias = {
        organization_organization: props.app.organization.organization,
        organization_name: props.app.organization.name,
        organization_legal_address: props.app.organization.legal_address,
        organization_inn: props.app.organization.inn,
        access_point_address: stock.address || '',
        access_point_phone_number: stock.phone_number || '',
        today: createDate(props.good.wo ? props.good.outtime : null),
        model: props.good.model,
        imei: props.good.imei,
        sum: sum || props.good.sum,
    }


    reader.onloadend = () => setImage(reader.result)

    const border = isDrag ? '3px dashed black' : '3px black'

    let ui_wo = props.good.ui_wo

    if (!ui_wo && props.good.wo) {

        if (props.good.wo.substring(0, 4) === 'sale') {
            ui_wo = 'Продан'
        } else if (props.good.wo === 'reject') {
            ui_wo = 'В браке'
        } else if (props.good.wo === 't') {
            ui_wo = 'В транзите'
        } else {

            try {

                const wo = JSON.parse(props.good.wo);

                ui_wo = wo.remid
                    ? 'В заказ ' + wo.remid
                    : wo.sale_id
                        ? 'Продан'
                        : wo.action && wo.action === 'remself'
                            ? 'Для витрины'
                            : woAlliases[props.good.wo]

            } catch (e) {

            }

        }

        if (!ui_wo) ui_wo = 'Израсходованна'

    }

    const isSale = wo => {

        if (wo === 'sale') return true

        try {

            const o = JSON.parse(wo)

            return !!o.sale_id

        } catch (e) {

            return false

        }

    }

    const editableLine = (label, value, onChange) => <div style={{
        display: 'flex',
        padding: '.5rem 0',
        // borderBottom: '1px solid lightgray'
    }}>
            <span style={{
                width: '40%',
            }}>
                {label}
            </span>

        <TextField fullWidth
                   value={value}
                   onChange={onChange}
        />

    </div>

    const line = (first, second) => <div style={{
        display: 'flex',
        padding: '1rem 0',
        borderBottom: '1px solid lightgray'
    }}>
            <span style={{
                width: '40%',
            }}>
                {first}
            </span>
        <span style={{
            fontWeight: 'bold'
        }}>
                {second}
            </span>
    </div>

    const textWithButton = (label, value, onChange, onClick, isPrimary, text) => <div style={{width: '100%'}}>
        <TextField label={label}
                   style={{
                       margin: '1rem .3rem',
                       width: '40%'
                   }}
                   value={value}
                   onChange={onChange}
        />

        <Button onClick={onClick}
                disabled={!value}
                style={{
                    margin: '2rem auto 0 auto',
                }}
                color={isPrimary ? "primary" : "secondary"}>
            {text}
        </Button>
    </div>

    const responsible = props.app.users.find(u => u.id === responsibleId)

    return props.isRepair
        ? <>

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

        </>
        : <>

            <Grid container>

                {treeOpen
                    ? <>
                        <Grid item xs={10} className="pt-1 pr-1">
                            <Tree initialId={props.good.category_id}
                                  categories={props.app.categories}
                                  onSelected={id => props.good.category_id = +id}
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
                            alt={props.good.model}
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
                : props.good.picture
                    ? <>
                        <img
                            src={'https://uchet.store/uploads/' + props.good.picture}
                            alt={props.good.model}
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

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                padding: '0 1rem',
                // alignItems: 'center'
            }}>

                <TextField label="Наименование"
                           value={model}
                           disabled={!isEditable}
                           onChange={e => setModel(e.target.value)}
                />

                {props.good.imei
                    ? <TextField label="imei"
                                 value={imei}
                                 disabled={!isEditable}
                                 onChange={e => setImei(e.target.value)}
                    />
                    : ''}

                {editableLine('Наименование', model, e => setImei(e.target.value))}

                {props.good.imei && editableLine('imei', imei, e => setImei(e.target.value))}

                {isEditable && textWithButton('Номер заказа', orderId,
                    e => intInputHandler(e.target.value, setOrderId), () => toOrder(),
                    true, 'Внести в заказ')}

                {isEditable && textWithButton('Цена', sum, e => intInputHandler(e.target.value, setSum),
                    () => toSale(), true, 'Продать')}

                {line("Себестоимость:", props.good.remcost ?? props.good.cost ?? 0)}

                {line("Время оприходования:", props.good.unix
                    ? toLocalTimeStr(props.good.unix)
                    : props.good.time)}

                {provider && line('Поставщик: ' + provider.name,
                    props.good.wf
                    && props.good.wf.consignment_number && 'накладная: ' + props.good.wf.consignment_number)}

                {props.good.wo === 't' || line('Точка:', stock ? stock.name : null)}

                {isEditable
                    ? <UsersSelect
                        users={props.app.users}
                        user={responsibleId}
                        setUser={setResponsibleId}
                        onlyValid={true}
                        disabled={!isEditable}
                        label="ответственный"
                    />
                    : responsible && line('Ответственный:', responsible.name)
                }

                {isEditable && <TextField label="Хранение"
                                          className={classes.field}
                                          value={storagePlace}
                                          onChange={e => setStoragePlace(e.target.value)}
                />}

                {isEditable && <IsPublicCheckBox
                    value={isPublic}
                    onChange={() => setIsPublic(!isPublic)}
                />}

                {props.good.out_unix &&
                    line('Статус:', ui_wo + ', c ' + toLocalTimeStr(props.good.out_unix))}

            </div>

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

            {!isEditable && props.good.stock_id === props.app.current_stock_id && isSale(props.good.wo)
                ? isReasonOpen
                    ? textWithButton('Причина возврата', reason, e => setReason(e.target.value),
                        () => setIsReasonOpen(!isReasonOpen), false, 'Вернуть')
                    : <Button onClick={() => setIsReasonOpen(!isReasonOpen)}
                              variant="outlined"
                              color="secondary">
                        Отмена продажи
                    </Button>
                : null
            }
        </>

}

export default connect(state => state)(GoodContent)