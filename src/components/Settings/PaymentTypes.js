import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import rest from "../Rest";

const PAGE_TITLE = '\u0421\u043f\u043e\u0441\u043e\u0431\u044b \u043e\u043f\u043b\u0430\u0442\u044b';
const PAGE_SUBTITLE = '\u0421\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a \u0434\u043b\u044f \u043a\u0430\u0441\u0441\u043e\u0432\u044b\u0445 \u0438 \u0444\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0445 \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u0439';
const ADD_LABEL = '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c';
const EDIT_LABEL = '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c';
const DELETE_LABEL = '\u0423\u0434\u0430\u043b\u0438\u0442\u044c';
const CANCEL_LABEL = '\u041e\u0442\u043c\u0435\u043d\u0430';
const SAVE_LABEL = '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c';
const NAME_LABEL = '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435';
const ACTIVE_LABEL = '\u0410\u043a\u0442\u0438\u0432\u0435\u043d';
const EMPTY_LABEL = '\u0421\u043f\u043e\u0441\u043e\u0431\u044b \u043e\u043f\u043b\u0430\u0442\u044b \u043f\u043e\u043a\u0430 \u043d\u0435 \u0437\u0430\u0434\u0430\u043d\u044b';
const CASH_PAYMENT_NAME = '\u043d\u0430\u043b\u0438\u0447\u043d\u044b\u0435';

const getPaymentTypesFromResponse = body => {
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.payment_types)) return body.payment_types;
    if (Array.isArray(body?.paymentTypes)) return body.paymentTypes;
    if (Array.isArray(body?.data)) return body.data;

    return [];
};

const normalizeName = value => String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .trim();

const isCashPaymentType = item => normalizeName(item?.name) === CASH_PAYMENT_NAME;

const PaymentTypes = props => {
    const [items, setItems] = useState(() => getPaymentTypesFromResponse(props.app.payment_types));
    const [isLoading, setLoading] = useState(false);
    const [dialog, setDialog] = useState(null);
    const [isSaving, setSaving] = useState(false);
    const isAdmin = Boolean(props.auth.admin);

    const sortedItems = useMemo(() => [...items].sort((a, b) => {
        if (isCashPaymentType(a)) return -1;
        if (isCashPaymentType(b)) return 1;

        if (Number(Boolean(b.is_active)) !== Number(Boolean(a.is_active))) {
            return Number(Boolean(b.is_active)) - Number(Boolean(a.is_active));
        }

        return String(a.name || '').localeCompare(String(b.name || ''));
    }), [items]);

    const loadPaymentTypes = () => {
        setLoading(true);

        return rest('payment-types', 'GET', '', false, { showGlobalLoader: false })
            .then(res => {
                if (res?.ok) setItems(getPaymentTypesFromResponse(res.body));
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const fromStore = getPaymentTypesFromResponse(props.app.payment_types);
        if (fromStore.length) setItems(fromStore);
    }, [props.app.payment_types]);

    useEffect(() => {
        loadPaymentTypes();
        // eslint-disable-next-line
    }, []);

    const openDialog = item => setDialog({
        item,
        name: item?.name || '',
        is_active: item ? Boolean(item.is_active) : true,
    });

    const closeDialog = () => {
        if (isSaving) return;
        setDialog(null);
    };

    const saveDialog = () => {
        if (!dialog || !dialog.name.trim()) return;

        const isEdit = Boolean(dialog.item);
        const payload = {
            name: dialog.name.trim(),
            is_active: isEdit ? Boolean(dialog.is_active) : true,
        };

        setSaving(true);

        rest(isEdit ? 'payment-types/' + dialog.item.id : 'payment-types', isEdit ? 'PATCH' : 'POST', payload)
            .then(res => {
                if (!res?.ok) return;

                setDialog(null);
                loadPaymentTypes();
            })
            .finally(() => setSaving(false));
    };

    const deleteItem = item => {
        if (!item) return;

        setSaving(true);

        rest('payment-types/' + item.id, 'DELETE')
            .then(res => {
                if (!res?.ok) return;

                setDialog(null);
                loadPaymentTypes();
            })
            .finally(() => setSaving(false));
    };

    const toggleActive = (event, item) => {
        event.stopPropagation();

        if (!isAdmin || isCashPaymentType(item) || isSaving) return;

        setSaving(true);

        rest('payment-types/' + item.id, 'PATCH', {
            name: item.name,
            is_active: !Boolean(item.is_active),
        })
            .then(res => {
                if (!res?.ok) return;

                loadPaymentTypes();
            })
            .finally(() => setSaving(false));
    };

    const renderDialog = () => dialog && <Dialog
        open
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
    >
        <DialogTitle>{dialog.item ? EDIT_LABEL : ADD_LABEL}</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
                <TextField
                    autoFocus
                    fullWidth
                    label={NAME_LABEL}
                    value={dialog.name}
                    onChange={e => setDialog(prev => ({ ...prev, name: e.target.value }))}
                />
                {dialog.item && <FormControlLabel
                    control={<Checkbox
                        checked={dialog.is_active}
                        onChange={e => setDialog(prev => ({ ...prev, is_active: e.target.checked }))}
                    />}
                    label={ACTIVE_LABEL}
                />}
            </Box>
        </DialogContent>
        <DialogActions>
            {dialog.item && <Button
                color="error"
                onClick={() => deleteItem(dialog.item)}
                disabled={isSaving}
                sx={{ marginRight: 'auto' }}
            >
                {DELETE_LABEL}
            </Button>}
            <Button onClick={closeDialog} disabled={isSaving}>{CANCEL_LABEL}</Button>
            <Button
                variant="contained"
                onClick={saveDialog}
                disabled={isSaving || !dialog.name.trim()}
            >
                {SAVE_LABEL}
            </Button>
        </DialogActions>
    </Dialog>;

    return <Box sx={{ margin: '.5rem' }}>
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            marginBottom: 1.5,
            flexWrap: 'wrap',
        }}>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{PAGE_TITLE}</Typography>
                <Typography variant="body2" color="text.secondary">{PAGE_SUBTITLE}</Typography>
            </Box>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 2,
        }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                            }}>
                                <span>{NAME_LABEL}</span>
                                {isAdmin && <IconButton
                                    size="small"
                                    color="primary"
                                    aria-label={ADD_LABEL}
                                    title={ADD_LABEL}
                                    onClick={() => openDialog(null)}
                                >
                                    <AddIcon />
                                </IconButton>}
                            </Box>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {!isLoading && !sortedItems.length && <TableRow>
                        <TableCell>{EMPTY_LABEL}</TableCell>
                    </TableRow>}
                    {sortedItems.map(item => {
                        const isCash = isCashPaymentType(item);

                        return <TableRow
                            key={'payment-type-' + item.id}
                            hover={!isCash && isAdmin}
                            onClick={() => !isCash && isAdmin && openDialog(item)}
                            sx={{
                                cursor: !isCash && isAdmin ? 'pointer' : 'default',
                            }}
                        >
                            <TableCell>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                }}>
                                    <span>{item.name}</span>
                                    <Checkbox
                                        checked={Boolean(item.is_active)}
                                        disabled={!isAdmin || isCash || isSaving}
                                        onClick={event => event.stopPropagation()}
                                        onChange={event => toggleActive(event, item)}
                                    />
                                </Box>
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        </TableContainer>

        {renderDialog()}
    </Box>;
};

export default connect(state => state)(PaymentTypes);
