import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel,
    IconButton, Radio, RadioGroup, Stack, TextField, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PrintIcon from "@mui/icons-material/Print";
import { useSnackbar } from "notistack";

import { getSavedPrintSettings } from "./PrintSettings";
import { PriceTagDraftEditor, PriceTagProductSearch } from "./PriceTagDraft";
import {
    formatPriceTagPrice, getPriceTagLayout, getProductPriceTag, MAX_PRICE_TAG_COPIES,
    mergePriceTags, printPriceTags, renderPriceTags,
} from "./PriceTags";

const PriceTagQueue = createContext(null);

export const usePriceTagQueue = () => useContext(PriceTagQueue);

const readQueue = key => {
    try {
        const items = JSON.parse(localStorage.getItem(key));
        return Array.isArray(items) ? items.filter(item =>
            item && typeof item.id === "string" && typeof item.name === "string"
            && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.copies)
            && item.copies >= 1 && item.copies <= MAX_PRICE_TAG_COPIES
        ) : [];
    } catch {
        return [];
    }
};

function PriceTagPreview({ items, settings, onSheet, seller, page }) {
    const frame = useRef(null);
    useLayoutEffect(() => {
        const previewFrame = frame.current;
        const previewWindow = previewFrame?.contentWindow;
        if (!previewWindow) return;

        renderPriceTags(previewWindow, items, settings, onSheet, { seller, previewPage: page });
        const sheet = previewWindow.document.querySelector(".price-tag-page");
        const sheetWidth = sheet?.offsetWidth;
        if (!sheetWidth) return;

        const fitSheet = () => {
            const availableWidth = previewWindow.document.body.clientWidth - 24;
            if (availableWidth > 0) sheet.style.zoom = Math.min(1, availableWidth / sheetWidth);
        };
        fitSheet();
        if (typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(fitSheet);
        observer.observe(previewFrame);
        return () => observer.disconnect();
    }, [items, settings, onSheet, seller, page]);

    return <iframe
        ref={frame}
        title="Предпросмотр ценников"
        style={{ display: "block", width: "100%", height: "44vh", minHeight: 230, border: 0, background: "#e4e7eb" }}
    />;
}

export function PriceTagQueueProvider({ scope, seller, stockId, children }) {
    const key = `uchet-price-tags-${scope}`;
    const [items, setItems] = useState(() => readQueue(key));
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("sheet");
    const [showPreview, setShowPreview] = useState(false);
    const [previewPage, setPreviewPage] = useState(0);
    const [showSearch, setShowSearch] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const onStorage = event => {
            if (event.key === key || event.key === null) setItems(readQueue(key));
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [key]);

    const updateQueue = async update => {
        const save = () => {
            const next = update(readQueue(key));
            localStorage.setItem(key, JSON.stringify(next));
            setItems(next);
        };

        try {
            // Serialize changes when the same queue is open in several tabs.
            if (navigator.locks) await navigator.locks.request(key, save);
            else save();
            return true;
        } catch {
            enqueueSnackbar("Не удалось сохранить очередь ценников", { variant: "error" });
            return false;
        }
    };

    const openQueue = () => {
        setPreviewPage(0);
        setShowPreview(false);
        setShowSearch(false);
        setOpen(true);
    };

    const addGoods = async (goods, openAfterAdding = false) => {
        const additions = goods.map(getProductPriceTag).filter(Boolean);
        if (!additions.length) return false;

        const saved = await updateQueue(previous => mergePriceTags(previous, additions));
        if (saved) {
            if (openAfterAdding) openQueue();
            else enqueueSnackbar("Товары добавлены в очередь ценников", { variant: "success" });
        }
        return saved;
    };

    const setCopies = (id, value) => {
        const copies = Math.min(MAX_PRICE_TAG_COPIES, Math.max(1, Math.trunc(Number(value) || 1)));
        updateQueue(previous => previous.map(item => item.id === id ? { ...item, copies } : item));
    };

    const saveDraft = async (id, changes) => {
        if (!Object.keys(changes).length || await updateQueue(previous =>
            previous.map(item => item.id === id ? { ...item, ...changes, edited: true } : item)
        )) setEditingItem(null);
    };

    const settings = getSavedPrintSettings("priceTag");
    const layout = getPriceTagLayout(settings);
    const count = items.reduce((total, item) => total + item.copies, 0);
    const onSheet = mode === "sheet" && Boolean(layout?.sheetCapacity);
    const pageCount = Math.ceil(count / (onSheet ? layout.sheetCapacity : 1));
    const page = Math.max(0, Math.min(previewPage, pageCount - 1));
    const print = () => {
        if (!printPriceTags(items, settings, onSheet, { seller })) {
            enqueueSnackbar("Разрешите открытие окна печати для Uchet", { variant: "error" });
        }
    };

    return <PriceTagQueue.Provider value={{ count, addGoods, openQueue }}>
        {children}
        <Dialog open={open} onClose={editingItem ? undefined : () => setOpen(false)} fullWidth maxWidth="md" aria-labelledby="price-tag-queue-title">
            <DialogTitle id="price-tag-queue-title">Ценники</DialogTitle>
            <DialogContent dividers>
                {editingItem ? <PriceTagDraftEditor
                    item={editingItem}
                    onSave={saveDraft}
                    onCancel={() => setEditingItem(null)}
                /> : <Stack spacing={1.5}>
                    {items.length > 0 && (layout ? <>
                        <Typography variant="body2">Размер ценника {layout.width} × {layout.height} мм</Typography>
                        <RadioGroup
                            row
                            aria-label="Раскладка ценников"
                            value={onSheet ? "sheet" : "label"}
                            onChange={event => {
                                setMode(event.target.value);
                                setPreviewPage(0);
                            }}
                        >
                            <FormControlLabel value="sheet" control={<Radio />} label="На листах A4" disabled={!layout.sheetCapacity} />
                            <FormControlLabel value="label" control={<Radio />} label="По одному на страницу" />
                        </RadioGroup>
                    </> : <Alert severity="warning">Проверьте размер и поля в разделе «Настройки → Печать → Ценники».</Alert>)}
                    <Stack direction="row" spacing={1}>
                        <Button onClick={() => setShowPreview(false)} aria-pressed={!showPreview} variant={!showPreview ? "outlined" : "text"}>
                            Черновик
                        </Button>
                        <Button disabled={!items.length} onClick={() => setShowPreview(true)} aria-pressed={showPreview} variant={showPreview ? "outlined" : "text"}>
                            Предпросмотр
                        </Button>
                    </Stack>
                    {showPreview && layout && items.length > 0 && <>
                        {pageCount > 1 && <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <Button disabled={page === 0} onClick={() => setPreviewPage(page - 1)}>Назад</Button>
                            <Typography variant="body2">Лист {page + 1} из {pageCount}</Typography>
                            <Button disabled={page === pageCount - 1} onClick={() => setPreviewPage(page + 1)}>Далее</Button>
                        </Stack>}
                        <PriceTagPreview items={items} settings={settings} onSheet={onSheet} seller={seller} page={page} />
                    </>}
                    {(!showPreview || !items.length) && <>
                        <Button sx={{ alignSelf: "flex-start" }} onClick={() => setShowSearch(value => !value)}
                            aria-expanded={showSearch}>
                            {showSearch ? "Скрыть поиск" : "Добавить товар"}
                        </Button>
                        {showSearch && <PriceTagProductSearch items={items} stockId={stockId} onAdd={addGoods} />}
                        {!items.length && <Typography color="text.secondary">
                            Добавьте товары из поиска, со склада или из карточки товара.
                        </Typography>}
                    </>}
                    {!showPreview && items.map(item => <Stack key={item.id} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <div style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
                            <Typography>{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item.code && `№ ${item.code} · `}{formatPriceTagPrice(item.price)}
                            </Typography>
                        </div>
                        <TextField
                            label="Копии"
                            size="small"
                            type="number"
                            value={item.copies}
                            onChange={event => setCopies(item.id, event.target.value)}
                            slotProps={{ htmlInput: { min: 1, max: MAX_PRICE_TAG_COPIES, step: 1, "aria-label": `Копии — ${item.name}` } }}
                            sx={{ width: 80, flexShrink: 0 }}
                        />
                        <IconButton
                            aria-label={`Редактировать ценник — ${item.name}${item.code ? `, № ${item.code}` : ""}`}
                            onClick={() => setEditingItem(item)}
                        >
                            <EditOutlinedIcon />
                        </IconButton>
                        <IconButton
                            aria-label={`Убрать ценник — ${item.name}`}
                            onClick={() => updateQueue(previous => previous.filter(tag => tag.id !== item.id))}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>)}
                </Stack>}
            </DialogContent>
            {!editingItem && <DialogActions sx={{ flexWrap: "wrap" }}>
                {items.length > 0 && <Button onClick={() => {
                    setShowPreview(false);
                    updateQueue(() => []);
                }} sx={{ marginRight: "auto" }}>
                    Очистить черновик
                </Button>}
                <Button onClick={() => setOpen(false)}>Закрыть</Button>
                <Button onClick={print} disabled={!layout || !count} variant="contained" startIcon={<PrintIcon />}>
                    Печать{count ? ` (${count})` : ""}
                </Button>
            </DialogActions>}
        </Dialog>
    </PriceTagQueue.Provider>;
}
