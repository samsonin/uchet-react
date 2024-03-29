import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardMedia,
    Fade,
    TextField,
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useSnackbar} from "notistack";

import {intInputHandler} from "../common/InputHandlers";
import {toLocalTimeStr} from "../common/Time";
import UsersSelect from "../common/UsersSelect";
import IsPublicCheckBox from "../common/IsPublicCheckBox";
import rest from "../Rest";
import {Print} from "../common/Print";
import {groupAlias} from "../common/GroupAliases";
import AddCosts from "../common/AddCosts";
import {line, note} from "../common/InputHandlers";
import CategoryHandler from "../common/CategoryHandler";
import GoodHistory from "./GoodHistory";

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
    isPublic: 'public',
    privateNote: 'private_note',
    publicNote: 'public_note',
}

const reader = new FileReader()

const useStyles = makeStyles((theme) => ({
    field: {
        margin: '1rem .3rem',
        width: '100%'
    },
    card: {
        width: '100%',
    }
}));

let file

const GoodContent = props => {

    const [isDrag, setIsDrag] = useState(false)

    const [image, setImage] = useState()
    const [picture, setPicture] = useState()
    const [categoryId, setCategoryId] = useState(0)
    const [model, setModel] = useState('')
    const [imei, setImei] = useState('')
    const [orderId, setOrderId] = useState()
    const [sum, setSum] = useState(0)
    const [storagePlace, setStoragePlace] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [responsibleId, setResponsibleId] = useState(0)
    const [privateNote, setPrivateNote] = useState()
    const [publicNote, setPublicNote] = useState()

    const [reason, setReason] = useState('')
    const [isReasonOpen, setIsReasonOpen] = useState(false)

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar()

    const good = props.app.good

    useEffect(() => {

        setIsReasonOpen(false)

        if (good.picture) setPicture(good.picture)

        if (good.category_id) {
            setCategoryId(good.category_id)
        } else if (good.group) {
            Object.entries(groupAlias).map(([cat, groupName]) => {
                if (good.group === groupName) setCategoryId(+cat)
            })
        }

        setModel(good.model)
        if (good.imei) setImei(good.imei)
        setSum(good.sum)
        setStoragePlace(good.storage_place)
        setIsPublic(pb)
        setResponsibleId(+good.responsible_id)
        setPrivateNote(good.private_note)
        setPublicNote(good.public_note)

    }, [good])


    const category = props.app.categories.find(v => v.id === good.category_id)
    const doc = props.app.docs.find(d => d.name === 'sale_showcase')
    const stock = props.app.stocks.find(s => s.id === good.stock_id)
    const responsible = props.app.users.find(u => u.id === responsibleId)

    const pb = !!good.public || good.parts === 'sale'
    const isEditable = !good.wo && good.stock_id === props.app.current_stock_id
    const isShowcase = good.barcode.toString().substring(0, 6) === '115104'

    const isSame = categoryId === good.category_id
        && model === good.model
        && (!isShowcase || imei === good.imei)
        && sum === good.sum
        && responsibleId === +good.responsible_id
        && storagePlace === good.storage_place
        && isPublic === (pb)
        && privateNote === good.private_note
        && publicNote === good.public_note

    const toOrder = () => {

        if (+orderId < 1) return enqueueSnackbar('Некорректный номер заказа', {
            variant: 'error',
        })

        rest('orders/' + props.app.current_stock_id + '/' + orderId + '/' + good.barcode,
            'POST')
            .then(res => {
                if (res.status === 200) {

                    enqueueSnackbar('В заказе')
                    props.close(good.barcode)

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

                    props.close(good.barcode)

                    if (isShowcase) Print(doc, props.alias)
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

            if (eval(key) !== good[aliases[key]]) {
                data[aliases[key]] = eval(key)
            }

        }

        if (data === {}) return enqueueSnackbar('нет изменений', {variant: 'error'})

        rest('goods/' + good.barcode, 'PATCH', data)

    }


    const onDrag = (e, isLeave) => {

        e.preventDefault()
        setIsDrag(isLeave)

    }

    const onDrop = e => {

        e.preventDefault()

        file = e.dataTransfer.files[0]

        reader.readAsDataURL(file)

        setIsDrag(false)

    }

    const upload = () => {

        if (file.size > 500000) return enqueueSnackbar('файл не должен превышеть 500Kb', {variant: 'error'})

        if (!['image/gif', 'image/jpeg'].includes(file.type)) {
            return enqueueSnackbar('тип файла должен быть jpg или gif', {variant: 'error'})
        }

        rest('goods/picture/' + good.barcode, 'POST', file, true)
            .then(res => {

                if (res.status === 200) {
                    file = null
                    if (res.body.good) {

                        setImage()

                    }
                } else {
                    enqueueSnackbar('ошибка ' + res.status, {variant: 'error'})
                }

            })

    }

    reader.onloadend = () => {
        setImage(reader.result)
    }

    const border = isDrag ? '3px dashed black' : '3px black'

    let ui_wo = good.ui_wo

    if (!ui_wo && good.wo) {

        if (good.wo.sale_id || good.wo.substring(0, 4) === 'sale') {
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

    const isSale = wo => {

        if (wo === 'sale') return true

        try {

            return !!wo.sale_id

        } catch (e) {

            return false

        }

    }

    const onManualSelect = f => {
        file = f
        reader.readAsDataURL(f)
    }

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

    const pictureRender = () => <img
        src={'https://uchet.store/uploads/' + good.picture}
        alt={good.model}
        width={'100%'}
        onError={() => setPicture()}
        onChange={() => {
            console.log('onChange')
        }}
    />

    return props.statusId === 1
        ? <AddCosts barcode={good.barcode}
                    done={() => props.setStatusId(0)}
        />
        : props.statusId === 2
            ? <GoodHistory good={good}/>
            : <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                padding: '0 1rem',
            }}>

                {isEditable
                    ? image
                        ? <Card className={classes.card}>
                            <CardActionArea>
                                <CardMedia
                                    component="img"
                                    alt={good.model}
                                    image={image}/>
                            </CardActionArea>
                            <CardActions>
                                <Button size="small" color="primary"
                                        onClick={() => setImage()}>
                                    Удалить
                                </Button>
                                <Button size="small" color="primary"
                                        onClick={() => upload()}>
                                    Загрузить
                                </Button>
                            </CardActions>
                        </Card>
                        : picture
                            ? <>
                                {pictureRender()}
                                <Button size="small" color="primary"
                                        onClick={() => setPicture()}>
                                    Удалить
                                </Button>
                            </>
                            : <>
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
                                <input type='file' onChange={e => onManualSelect(e.target.files[0])}/>
                            </>
                    : picture && pictureRender()}

                {isEditable
                    ? <CategoryHandler
                        id={categoryId}
                        setId={setCategoryId}
                    />
                    : category && line('Категория:', category.name, isEditable)}

                {line('Наименование:', model, isEditable, e => setModel(e.target.value))}

                {isShowcase && line('imei, S/N', imei, isEditable, e => setImei(e.target.value))}

                {isEditable && textWithButton('Номер заказа', orderId,
                    e => intInputHandler(e.target.value, setOrderId), () => toOrder(),
                    true, 'Внести в заказ')}

                {isEditable && textWithButton('Цена', sum, e => intInputHandler(e.target.value, setSum),
                    () => toSale(), true, 'Продать')}

                {line("Себестоимость:", good.remcost ?? good.cost ?? 0, isEditable)}


                {good.wo === 't' || line('Точка:', stock ? stock.name : null, isEditable)}

                {!good.wo && line('Хранение', storagePlace, isEditable, e => setStoragePlace(e.target.value))}

                {isEditable && (!isPublic || props.auth.admin) && <IsPublicCheckBox
                    value={isPublic}
                    onChange={() => setIsPublic(!isPublic)}
                />}

                {note('Информация для сотрудников:', privateNote, isEditable, e => setPrivateNote(e.target.value))}

                {note('Информация для покупателей:', publicNote, isEditable, e => setPublicNote(e.target.value))}

                {isEditable
                    ? <UsersSelect
                        users={props.app.users}
                        user={responsibleId}
                        setUser={setResponsibleId}
                        onlyValid
                        classes='w-100 m-2 p-2'
                        label="Ответственный"
                    />
                    : responsible && line('Ответственный:', responsible.name, isEditable)}

                {good.out_unix && ui_wo &&
                    line('Статус:', ui_wo + ', c ' + toLocalTimeStr(good.out_unix), isEditable)}

                {isEditable && <Fade
                    in={!isSame && isEditable}
                    timeout={300}
                    style={{margin: '1rem 0'}}
                >
                    <Button onClick={() => save()}
                            variant="outlined"
                            color="secondary">
                        Сохранить
                    </Button>
                </Fade>}

                {!isEditable && good.stock_id === props.app.current_stock_id && isSale(good.wo)
                    ? isReasonOpen
                        ? textWithButton('Причина возврата', reason, e => setReason(e.target.value),
                            () => refund(), false, 'Вернуть')
                        : <Button onClick={() => setIsReasonOpen(!isReasonOpen)}
                                  className={"m-2 p-1"}
                                  variant="outlined"
                                  color="secondary">
                            Отмена продажи
                        </Button>
                    : null
                }

            </div>

}

export default connect(state => state)(GoodContent)