import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";

import {
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardMedia,
    Fade,
    TextField,
} from "@mui/material";
import { makeStyles } from "muiLegacyStyles";
import { useSnackbar } from "notistack";

import { intInputHandler } from "../common/InputHandlers";
import { toLocalTimeStr } from "../common/Time";
import UsersSelect from "../common/UsersSelect";
import IsPublicCheckBox from "../common/IsPublicCheckBox";
import rest from "../Rest";
import { Print } from "../common/Print";
import { groupAlias } from "../common/GroupAliases";
import AddCosts from "../common/AddCosts";
import { line } from "../common/InputHandlers";
import CategoryHandler from "../common/CategoryHandler";
import GoodHistory from "./GoodHistory";
import QuickTextField from "../common/QuickTextField";
import {getQuickTextOptions} from "../common/quickTexts";
import { GOOD_PICTURE_SESSION_PATH } from "../../constants";
import GoodPictureQrDialog from "./GoodPictureQrDialog";
import {
    getGoodPictureFromSession,
    getGoodPictureSessionStatusPath,
    isMatchingGoodPictureSession,
    normalizeGoodPictureSession,
} from "./goodPictureQr";

const GOOD_PICTURE_POLL_INTERVAL_MS = 3000;

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
    const [isPictureQrOpen, setIsPictureQrOpen] = useState(false)
    const [pictureQrSession, setPictureQrSession] = useState(null)
    const [pictureQrStatus, setPictureQrStatus] = useState('waiting')
    const [pictureQrError, setPictureQrError] = useState('')
    const manualPictureInputRef = useRef(null)

    const [reason, setReason] = useState('')
    const [isReasonOpen, setIsReasonOpen] = useState(false)

    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()

    const good = props.app.good
    const quickTextOptions = path => getQuickTextOptions(props.app.quick_texts, path)

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
                    else enqueueSnackbar('продано!', { variant: 'success' })

                } else {

                    enqueueSnackbar('не удалось продать', { variant: 'error' })

                }
            })

    }

    const refund = () => {

        if (good.barcode && reason) {

            rest('sales/' + props.app.current_stock_id + '/' + good.barcode + '/' + reason, 'DELETE')
                .then(res => {

                    if (res.status === 200) {
                        enqueueSnackbar('возврат записан', { variant: 'success' })
                        setReason('')
                        setIsReasonOpen(false)
                        props.close()
                    } else {
                        enqueueSnackbar('не удалось вернуть', { variant: 'error' })
                    }

                })
        }

    }

    const save = () => {

        if (isSame) return enqueueSnackbar('нет изменений', { variant: 'error' })

        const data = {}

        for (const key in aliases) {

            if (eval(key) !== good[aliases[key]]) {
                data[aliases[key]] = eval(key)
            }

        }

        if (data === {}) return enqueueSnackbar('нет изменений', { variant: 'error' })

        rest('goods/' + good.barcode, 'PATCH', data)

    }

    const noteField = (label, value, onChange) => {
        if (!isEditable && !value) return null

        const hasValue = !!(value && value.trim())

        return <div className={`good-note-card ${hasValue ? '' : 'is-empty'}`}>
            <div className="good-note-label">{label}</div>
            <QuickTextField
                multiline
                minRows={hasValue ? 3 : 1}
                className="good-note-textarea"
                value={value || ''}
                onChange={nextValue => onChange({target: {value: nextValue}})}
                disabled={!isEditable}
                options={quickTextOptions(label.includes('сотрудников') ? 'goods.private_notes' : 'goods.public_notes')}
            />
        </div>
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

        if (file.size > 500000) return enqueueSnackbar('файл не должен превышеть 500Kb', { variant: 'error' })

        if (!['image/gif', 'image/jpeg'].includes(file.type)) {
            return enqueueSnackbar('тип файла должен быть jpg или gif', { variant: 'error' })
        }

        rest('goods/picture/' + good.barcode, 'POST', file, true)
            .then(res => {

                if (res.status === 200) {
                    file = null
                    if (res.body.good) {

                        setImage()

                    }
                } else {
                    enqueueSnackbar('ошибка ' + res.status, { variant: 'error' })
                }

            })

    }

    const applyGoodPictureSession = session => {
        if (!session) return

        if (session.status) setPictureQrStatus(session.status)

        const nextPicture = getGoodPictureFromSession(session)
        if (nextPicture) {
            file = null
            setImage()
            setPicture(nextPicture)
            setPictureQrStatus(session.status || 'uploaded')
            setIsPictureQrOpen(false)
            enqueueSnackbar('Фото товара загружено', { variant: 'success' })
        }

        if (session.status === 'error' || session.status === 'expired') {
            setPictureQrError(session.error || '')
        }
    }

    const openGoodPictureQr = async () => {
        setPictureQrError('')
        setPictureQrStatus('waiting')
        setPictureQrSession(null)
        setIsPictureQrOpen(true)

        const res = await rest(GOOD_PICTURE_SESSION_PATH, 'POST', { barcode: good.barcode }, false, {
            updateStore: false,
            responseType: 'auto',
        })

        const session = res.body?.session || res.body

        if (!res.ok || !session?.capture_url) {
            setPictureQrStatus('error')
            setPictureQrError('Не удалось создать QR-ссылку.')
            return
        }

        setPictureQrSession(session)
    }

    useEffect(() => {
        const incomingSession = props.app.good_picture_session

        if (!isPictureQrOpen || !isMatchingGoodPictureSession(incomingSession, pictureQrSession, good.barcode)) return

        applyGoodPictureSession(incomingSession)
    }, [props.app.good_picture_session, isPictureQrOpen, pictureQrSession, good.barcode])

    useEffect(() => {
        if (!isPictureQrOpen || !pictureQrSession) return

        const statusPath = getGoodPictureSessionStatusPath(GOOD_PICTURE_SESSION_PATH, pictureQrSession)
        if (!statusPath) return

        let isCancelled = false

        const pollGoodPictureSession = async () => {
            const res = await rest(statusPath, 'GET', '', false, {
                updateStore: false,
                responseType: 'auto',
                showGlobalLoader: false,
            })

            if (isCancelled || !res.ok) return

            const incomingSession = normalizeGoodPictureSession(res.body)
            if (!isMatchingGoodPictureSession(incomingSession, pictureQrSession, good.barcode)) return

            applyGoodPictureSession(incomingSession)
        }

        pollGoodPictureSession()
        const intervalId = window.setInterval(pollGoodPictureSession, GOOD_PICTURE_POLL_INTERVAL_MS)

        return () => {
            isCancelled = true
            window.clearInterval(intervalId)
        }
    }, [isPictureQrOpen, pictureQrSession, good.barcode])

    const closeGoodPictureQr = () => {
        setIsPictureQrOpen(false)
        setPictureQrSession(null)
        setPictureQrStatus('waiting')
        setPictureQrError('')
    }

    const uploadGoodPictureFromComputer = () => {
        closeGoodPictureQr()
        manualPictureInputRef.current?.click()
    }

    reader.onloadend = () => {
        setImage(reader.result)
    }

    const border = isDrag ? '3px dashed var(--text-muted)' : '3px solid var(--line)'

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

    const textWithButton = (label, value, onChange, onClick, isPrimary, text) => <div style={{ width: '100%' }}>
        <TextField label={label}
            style={{
                margin: '1rem .3rem',
                width: '40%'
            }}
            value={value}
            onChange={onChange}
        />

        <Button onClick={onClick}
            disabled={!value && text != 'Списать'}
            style={{
                margin: '2rem auto 0 auto',
            }}
            color={isPrimary ? "primary" : "secondary"}>
            {text}
        </Button>
    </div>

    const isFullUrl = (url) => {
        try {
            return new URL(url).protocol.startsWith('http');
        } catch {
            return false;
        }
    };

    const pictureRender = () => <img
        src={
            isFullUrl(picture)
                ? picture
                : 'https://uchet.store/uploads/' + picture
        }
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
            ? <GoodHistory good={good} />
            : <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                padding: '0 1rem',
            }} className="good-dialog-content-root">

                {isEditable
                    ? image
                        ? <Card className={classes.card}>
                            <CardActionArea>
                                <CardMedia
                                    component="img"
                                    alt={good.model}
                                    image={image} />
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
                                    backgroundColor: isDrag ? 'var(--surface)' : 'var(--surface-soft)',
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
                                <div className="good-picture-upload-actions">
                                    <Button size="small" color="primary"
                                        onClick={openGoodPictureQr}>
                                        С телефона
                                    </Button>
                                    <input
                                        ref={manualPictureInputRef}
                                        type='file'
                                        onChange={e => onManualSelect(e.target.files[0])}
                                    />
                                </div>
                            </>
                    : picture && pictureRender()}

                {isEditable
                    ? <CategoryHandler
                        id={categoryId}
                        setId={setCategoryId}
                    />
                    : category && line('Категория:', category.name, isEditable)}

                {line('Наименование:', model, isEditable, e => setModel(e.target.value), quickTextOptions('goods.models'))}

                {isShowcase && line('imei, S/N', imei, isEditable, e => setImei(e.target.value))}

                {isEditable && textWithButton('Номер заказа', orderId,
                    e => intInputHandler(e.target.value, setOrderId), () => toOrder(),
                    true, 'Внести в заказ')}

                {isEditable && textWithButton('Цена', sum, e => intInputHandler(e.target.value, setSum),
                    () => toSale(), true, sum > 0 ? 'Продать' : 'Списать')}

                {line("Себестоимость:", good.remcost ?? good.cost ?? 0, isEditable)}


                {good.wo === 't' || line('Точка:', stock ? stock.name : null, isEditable)}

                {!good.wo && line('Хранение', storagePlace, isEditable, e => setStoragePlace(e.target.value), quickTextOptions('goods.storage_places'))}

                {isEditable && (!isPublic || props.auth.admin) && <IsPublicCheckBox
                    value={isPublic}
                    onChange={() => setIsPublic(!isPublic)}
                />}

                {noteField('\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0434\u043b\u044f \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432', privateNote, e => setPrivateNote(e.target.value))}

                {noteField('\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0434\u043b\u044f \u043f\u043e\u043a\u0443\u043f\u0430\u0442\u0435\u043b\u0435\u0439', publicNote, e => setPublicNote(e.target.value))}

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
                    style={{ margin: '1rem 0' }}
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

                <GoodPictureQrDialog
                    open={isPictureQrOpen}
                    session={pictureQrSession}
                    status={pictureQrStatus}
                    error={pictureQrError}
                    onCancel={closeGoodPictureQr}
                    onComputerUpload={uploadGoodPictureFromComputer}
                />

            </div>

}

export default connect(state => state)(GoodContent)
