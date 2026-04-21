import React, { useEffect, useRef, useState, useMemo } from "react";
import { connect } from "react-redux";
import {
    Button,
    Checkbox, FormControlLabel,
    IconButton,
    InputAdornment, LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField
} from "@mui/material";
import TableHead from "@mui/material/TableHead";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import rest from "./Rest";
import TwoLineInCell from "./common/TwoLineInCell";
import { toLocalTimeStr } from "./common/Time";
import { groupAlias } from "./common/GroupAliases";
import CategoryHandler from "./common/CategoryHandler";
import CloseIcon from "@mui/icons-material/Close";
import store from "../store";
import { makeGroup } from "../Models/Good";

const oftenUsedButtons = [
    { label: 'Аксессуары', catId: 6 },
    { label: 'Запчасти', catId: 4 },
    { label: 'Техника', catId: 5 },
    { label: 'Расходники', catId: 999 },
]

const Store = props => {
    const appStocks = props.app.stocks || [];
    const appCategories = props.app.categories || [];
    const [goods, setGoods] = useState([]);
    const [catId, setCatId] = useState(0);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [isAllStocks, setIsAllStocks] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [isReject, setIsReject] = useState(false);
    const [showButtons, setShowButtons] = useState(false);

    const limit = useRef(25);
    const isRequest = useRef(false);
    const currentStock = appStocks.find(s => s.id === props.app.current_stock_id);
    const validStocks = useMemo(() => appStocks.filter(s => s.is_valid), [appStocks]);
    const hasMultipleStocks = validStocks.length > 1;

    const goodsView = isGroup ? makeGroup(goods) : goods;

    const transitBarcodes = useMemo(() => (
        props.app.transit ? props.app.transit.map(g => g.barcode.toString()) : []
    ), [props.app.transit]);

    const filteredGoods = useMemo(() => {
        const lowerSearch = search.toLowerCase().split(' ');

        return goodsView
            .filter(g => !isReject || g.wo === 'reject')
            .filter(g => isAllStocks || g.wo === 't' || !currentStock || currentStock.id === g.stock_id)
            .filter(g => {
                if (!search || g.sum == search || g.id == search) return true;

                const model = g.model.toLowerCase();
                const imei = g.imei?.toLowerCase();

                return lowerSearch.every(part =>
                    model.includes(part) || (imei && imei.includes(part))
                );
            });
    }, [goodsView, isReject, isAllStocks, currentStock, search]);

    const sendRequest = () => {
        if (isRequest.current) return;
        isRequest.current = true;

        let url = 'goods?';
        if (catId) url += '&category_id=' + catId;
        if (search) url += '&search=' + search;
        if (!isAllStocks && currentStock) url += '&stock_id=' + currentStock.id;
        if (isPublic) url += '&is_public=1';
        if (isReject) url += '&is_reject=1';
        if (!isGroup && limit.current > 0) url += '&limit=' + limit.current;

        rest(url).then(res => {
            isRequest.current = false;
            if (res.status === 200) {
                setGoods(res.body);
            }
        });
    };

    useEffect(() => sendRequest(), [])

    useEffect(() => {

        if (props.scrollDown) {

            props.setScrollDown(false)
            limit.current += 25
            sendRequest()

        }

    }, [props.scrollDown])

    useEffect(() => {

        if ([4, 5, 6, 999].includes(catId)) sendRequest()

    }, [catId])

    useEffect(() => {

        if (isGroup) sendRequest()

    }, [isGroup])

    useEffect(() => {

        if (isAllStocks) sendRequest()

    }, [isAllStocks])

    useEffect(() => {
        if (!hasMultipleStocks && isAllStocks) setIsAllStocks(false);
    }, [hasMultipleStocks, isAllStocks]);

    useEffect(() => {

        if (props.enterPress) sendRequest()

        if (typeof (props.setEnterPress) === 'function') props.setEnterPress(false)

        // eslint-disable-next-line
    }, [props.enterPress])

    useEffect(() => {
        if (props.app.good) {

            const newGoods = goods.map(g => g.barcode === props.app.good.barcode ? props.app.good : g)
            setGoods(newGoods)

        }
    }, [props.app.good])

    useEffect(() => {
        if (props.app.needDeleteBarcode) {

            store.dispatch({ type: 'DELETE_GOOD' })

            const newGoods = goods.filter(g => g.barcode !== props.app.needDeleteBarcode)
            setGoods(newGoods)

        }
    }, [props.app.needDeleteBarcode])

    useEffect(() => {
        limit.current = 25
    }, [search])

    const setCat = id => {

        id = +id

        setCatId(id)

        if (oftenUsedButtons.length < 8) {

            const cat = appCategories.find(c => c.id === id)

            if (cat && cat.id > 6 && cat.id < 999) {

                const r = oftenUsedButtons.find(b => b.catId === cat.id)

                if (!r) oftenUsedButtons.push({
                    label: cat.name,
                    catId: cat.id
                })

            }

        }


    }

    const searchHandle = v => {

        setError(false)
        limit.current = 25
        setSearch(v)

    }

    const style = {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '.5rem',
        margin: '.5rem',
        opacity: showButtons ? '25%' : '100%'
    }

    const setGood = barcode => rest('goods/' + barcode);

    const renderRow = g => {
        const color = transitBarcodes.includes(g.barcode)
            ? 'green'
            : g.wo === 'reject' ? 'red' : 'black';

        const stock = appStocks.find(s => s.id === g.stock_id);
        const checkTime = Math.max(g.out_unix || 0, g.storage_unix || 0, g.unix || 0);
        const checkTimeStr = toLocalTimeStr(checkTime);

        if (!g.category_id && g.group) {
            Object.entries(groupAlias).forEach(([cat, groupName]) => {
                if (g.group === groupName) g.category_id = +cat;
            });
        }

        const category = g.category_id
            ? appCategories.find(c => c.id === g.category_id)
            : null;

        const storage = g.wo === 't'
            ? TwoLineInCell('Транзит', checkTimeStr)
            : g.wo === 'reject'
                ? TwoLineInCell('брак', checkTimeStr)
                : !stock || g.stock_id === props.app.current_stock_id
                    ? TwoLineInCell(g.storage_place, checkTimeStr)
                    : TwoLineInCell(stock.name, g.storage_place || checkTimeStr);

        let description = category?.name || '';
        if (g.imei) description = description ? description + ', ' + g.imei : g.imei;

        const opacity = g.wo === 't' || props.app.current_stock_id !== g.stock_id ? '50%' : '100%';
        const sumText = isGroup && (g.minSum !== g.maxSum) ? `${g.minSum} - ${g.maxSum}` : g.sum;
        const costText = g.remcost || g.cost;

        return (
            <TableRow
                key={g.barcode}
                style={{ cursor: 'pointer', opacity }}
                onClick={() => isGroup ? null : setGood(g.barcode)}
            >
                {!isGroup && <TableCell style={{ color }}>{g.id}</TableCell>}
                <TableCell style={{ color }}>
                    {TwoLineInCell(g.model, description)}
                </TableCell>
                <TableCell style={{ color }}>
                    {TwoLineInCell(sumText, costText)}
                </TableCell>
                <TableCell style={{ color }}>
                    {isGroup ? g.count : storage}
                </TableCell>
            </TableRow>
        );
    };

    return (
        <>
            <div style={style}>

                <CategoryHandler
                    id={catId}
                    setId={setCat}
                />

            </div>

            <div style={style}>

                {oftenUsedButtons.map(b => < Button
                    key={'button-name-in-store-' + b.catId + b.label}
                    size="small"
                    style={{ margin: '.5rem' }
                    }
                    color={catId === b.catId ? "primary" : "default"}
                    variant={catId === b.catId ? "contained" : "outlined"}
                    onClick={() => setCat(b.catId)}>
                    {b.label}
                </Button>)}

                <IconButton onClick={() => setCat(0)}
                    disabled={!catId}
                >
                    <CloseIcon />
                </IconButton>

            </div >

            {currentStock && <div style={{
                margin: '.5rem',
            }}>

                <IconButton onClick={() => setShowButtons(!showButtons)}>
                    {showButtons ? <RemoveCircleIcon /> : <AddCircleIcon />}
                </IconButton>

                {showButtons && [
                    { label: 'Оприходование', onClick: () => props.history.push('/arrival') },
                    { label: 'Покупка техники', onClick: () => props.history.push('/showcase/buy') },
                    // TODO: вернуть кнопку "Изготовление", когда сценарий снова будет нужен в store-меню.
                    { label: 'На реализацию', onClick: () => props.history.push('/reals/0') },
                ]
                    .map(b => <Button
                        key={'label-in-store-' + b.label}
                        size="small"
                        style={{ margin: '.5rem' }}
                        variant="outlined"
                        onClick={b.onClick}>
                        {b.label}
                    </Button>)}

            </div>
            }

            <div style={style}>

                <TextField
                    fullWidth
                    error={error}
                    autoFocus
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                    value={search}
                    onChange={e => searchHandle(e.target.value)}
                />

                <Button onClick={() => sendRequest()}
                    style={{
                        marginInline: '.3rem'
                    }}
                    disabled={isRequest.current}
                    variant="contained"
                    color="primary"
                    size="small"
                >
                    Найти
                </Button>

            </div>

            <div style={style}>


                <FormControlLabel
                    control={<Checkbox
                        checked={isGroup} onChange={() => setIsGroup(!isGroup)} />}
                    label="Сгруппировать"
                />

                {currentStock && hasMultipleStocks && <FormControlLabel control={

                    <Checkbox checked={isAllStocks} onChange={() => setIsAllStocks(!isAllStocks)} />}
                    label="все точки"
                />}

                <FormControlLabel control={
                    <Checkbox checked={isPublic}
                        disabled={true}
                        onChange={() => setIsPublic(!isPublic)} />}
                    label={"только опубликованные"}

                />

                <FormControlLabel control={
                    <Checkbox checked={isReject} onChange={() => setIsReject(!isReject)} />}
                    label={"только брак"}
                />

            </div>

            {filteredGoods.length ? (
                <Table size="small" style={{ background: 'white' }}>
                    <TableHead>
                        <TableRow>
                            {!isGroup && <TableCell>#</TableCell>}
                            <TableCell>Товар</TableCell>
                            <TableCell>Цена / Себестоимость</TableCell>
                            <TableCell>{isGroup ? 'Кол-во' : 'Хранение'}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredGoods.map(renderRow)}

                        {isRequest.current && (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <LinearProgress />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            ) : (
                'Нет данных'
            )}
        </>
    );
};

export default connect(state => state)(Store);
