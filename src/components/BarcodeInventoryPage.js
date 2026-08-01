import React, {useCallback, useEffect, useRef, useState} from 'react';
import {connect} from 'react-redux';
import {
    Button,
    ButtonGroup,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import rest from './Rest';
import {useSnackbar} from 'notistack';
import {
    applyInventoryScan,
    filterInventoryRows,
    INVENTORY_SCOPES,
    inventoryScopeLabel,
    inventorySourceLabel,
} from './barcodeInventory';

const emptySnapshot = {
    rows: [],
    summary: {
        expected_quantity: 0,
        accounted_quantity: 0,
        missing_quantity: 0,
        missing_cost: 0,
        missing_sum: 0,
    },
};

const formatMoney = value => `${new Intl.NumberFormat('ru-RU').format(+value || 0)} ₽`;

const scanMessage = result => ({
    duplicate: 'Эта позиция уже учтена',
    not_found: 'Штрих-код не найден',
    consumed: 'Позиция уже израсходована',
    other_stock: 'Позиция относится к другой точке',
    out_of_scope: 'Позиция не входит в выбранный охват',
    invalid_scope: 'Выберите корректный охват инвентаризации',
}[result] || 'Не удалось учесть позицию');

const BarcodeInventoryPage = props => {
    const stockId = props.app.current_stock_id;
    const {enqueueSnackbar} = useSnackbar();
    const [scope, setScope] = useState('all');
    const [snapshot, setSnapshot] = useState(emptySnapshot);
    const [search, setSearch] = useState('');
    const [hideReconciled, setHideReconciled] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [isResetOpen, setIsResetOpen] = useState(false);
    const isSubmitting = useRef(false);

    const loadSnapshot = useCallback(() => {
        if (!stockId) {
            setSnapshot(emptySnapshot);
            return;
        }

        rest(`inventory/${stockId}?scope=${scope}`)
            .then(res => {
                if (res.status === 200) setSnapshot(res.body);
                else enqueueSnackbar(res.body?.error || 'Не удалось загрузить инвентаризацию', {variant: 'error'});
            });
    }, [enqueueSnackbar, scope, stockId]);

    useEffect(() => {
        loadSnapshot();
    }, [loadSnapshot]);

    const submitBarcode = useCallback(code => {
        const normalizedBarcode = String(code || '').trim();

        if (!normalizedBarcode || !stockId || isSubmitting.current) return;

        isSubmitting.current = true;

        rest(`inventory/${stockId}/${normalizedBarcode}`, 'POST', {scope})
            .then(res => {
                if (res.status === 200 && res.body?.result === 'accounted') {
                    setSnapshot(prev => applyInventoryScan(prev, res.body));
                    enqueueSnackbar('Позиция учтена', {variant: 'success'});
                } else {
                    enqueueSnackbar(res.body?.error || scanMessage(res.body?.result), {variant: 'warning'});
                }
            })
            .finally(() => {
                isSubmitting.current = false;
                setBarcode('');
                props.setOurBarcode?.();
            });
    }, [enqueueSnackbar, props, scope, stockId]);

    useEffect(() => {
        if (props.newScan) submitBarcode(props.newScan);
    }, [props.newScan, submitBarcode]);

    const resetInventory = () => {
        if (!stockId) return;

        rest(`inventory/${stockId}`, 'DELETE', {scope})
            .then(res => {
                if (res.status === 200) {
                    setSnapshot(res.body);
                    enqueueSnackbar('Результаты инвентаризации сброшены', {variant: 'success'});
                    setIsResetOpen(false);
                } else {
                    enqueueSnackbar(res.body?.error || 'Не удалось сбросить результаты', {variant: 'error'});
                }
            });
    };

    const rows = filterInventoryRows(snapshot.rows, search, hideReconciled);
    const summary = snapshot.summary || emptySnapshot.summary;

    if (!stockId) {
        return <Paper style={{padding: '1rem'}}>Выберите точку для проведения инвентаризации.</Paper>;
    }

    return <>
        <Dialog open={isResetOpen} onClose={() => setIsResetOpen(false)}>
            <DialogTitle>Сбросить результаты?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Будут сброшены только позиции охвата «{inventoryScopeLabel(scope)}» выбранной точки.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsResetOpen(false)}>Отмена</Button>
                <Button color="error" onClick={resetInventory}>Сбросить</Button>
            </DialogActions>
        </Dialog>

        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
            <ButtonGroup size="small" aria-label="Охват инвентаризации">
                {INVENTORY_SCOPES.map(value => <Button
                    key={value}
                    variant={scope === value ? 'contained' : 'outlined'}
                    onClick={() => setScope(value)}
                >
                    {inventoryScopeLabel(value)}
                </Button>)}
            </ButtonGroup>
            <Button color="error" onClick={() => setIsResetOpen(true)}>Сбросить результаты</Button>
        </div>

        <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
            {[
                ['Позиций', summary.expected_quantity],
                ['Учтено', `${summary.accounted_quantity} / ${summary.expected_quantity}`],
                ['Недостача', summary.missing_quantity],
                ['Себестоимость', formatMoney(summary.missing_cost)],
                ['Продажа', formatMoney(summary.missing_sum)],
            ].map(([label, value]) => <Paper key={label} style={{padding: '0.75rem', minWidth: 120}}>
                <div style={{fontSize: '0.8rem'}}>{label}</div>
                <strong>{value}</strong>
            </Paper>)}
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
            <TextField
                label="Штрих-код"
                value={barcode}
                onChange={event => setBarcode(event.target.value)}
                onKeyDown={event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        submitBarcode(barcode);
                    }
                }}
            />
            <Button variant="contained" onClick={() => submitBarcode(barcode)}>Учесть</Button>
            <TextField
                label="Поиск"
                value={search}
                onChange={event => setSearch(event.target.value)}
                slotProps={{input: {startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment>}}}
            />
            <FormControlLabel
                control={<Checkbox checked={hideReconciled} onChange={() => setHideReconciled(value => !value)}/>}
                label="Скрыть сверенные"
            />
        </div>

        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Тип</TableCell>
                        <TableCell>Наименование</TableCell>
                        <TableCell align="right">В базе</TableCell>
                        <TableCell align="right">Учтено</TableCell>
                        <TableCell align="right">Недостача</TableCell>
                        <TableCell align="right">Себестоимость</TableCell>
                        <TableCell align="right">Продажа</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map(row => <TableRow key={`${row.source}-${row.model}`}>
                        <TableCell>{inventorySourceLabel(row.source)}</TableCell>
                        <TableCell>{row.model}</TableCell>
                        <TableCell align="right">{row.expected_quantity}</TableCell>
                        <TableCell align="right">{row.accounted_quantity}</TableCell>
                        <TableCell align="right">{row.missing_quantity}</TableCell>
                        <TableCell align="right">{formatMoney(row.missing_cost)}</TableCell>
                        <TableCell align="right">{formatMoney(row.missing_sum)}</TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>
    </>;
};

export default connect(state => state)(BarcodeInventoryPage);
