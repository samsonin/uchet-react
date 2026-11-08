import React, { useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import rest from "../Rest";
import { formatPriceTagPrice, getProductPriceTag } from "./PriceTags";

export function PriceTagDraftEditor({ item, onSave, onCancel }) {
    const [fields, setFields] = useState(() => ({
        name: item.name,
        price: String(item.price),
        code: item.code ?? "",
        arrivalDate: item.arrivalDate ?? "",
        specs: item.specs ?? "",
        country: item.country ?? "",
    }));
    const [saving, setSaving] = useState(false);
    const normalizedPrice = fields.price.replace(/\s/g, "").replace(",", ".");
    const price = Number(normalizedPrice);
    const validPrice = /^\d+(?:\.\d{1,2})?$/.test(normalizedPrice) && Number.isFinite(price);
    const name = fields.name.trim();

    const bind = field => ({
        value: fields[field],
        onChange: event => setFields(previous => ({ ...previous, [field]: event.target.value })),
    });
    const save = async event => {
        event.preventDefault();
        event.stopPropagation();
        if (!name || !validPrice || saving) return;

        const values = {
            ...fields,
            name,
            price,
            code: fields.code.trim(),
            specs: fields.specs.trim(),
            country: fields.country.trim(),
        };
        const changes = Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== (item[key] ?? "")));
        setSaving(true);
        try {
            await onSave(item.id, changes);
        } finally {
            setSaving(false);
        }
    };

    return <Stack component="form" spacing={2} onSubmit={save} onKeyDown={event => {
        if (event.key === "Enter") event.stopPropagation();
    }}>
        <Typography variant="subtitle1">Редактирование ценника</Typography>
        <TextField label="Название" required fullWidth size="small" {...bind("name")} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField label="Цена, ₽" required size="small" {...bind("price")}
                error={!!fields.price && !validPrice}
                slotProps={{ htmlInput: { inputMode: "decimal" } }} />
            <TextField label="Код товара" size="small" {...bind("code")} />
            <TextField label="Дата поступления" type="date" size="small" {...bind("arrivalDate")}
                slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Страна производства" size="small" {...bind("country")} />
        </Box>
        <TextField label="Характеристики" multiline minRows={4} maxRows={12} fullWidth size="small" {...bind("specs")} />
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
            <Button onClick={onCancel} disabled={saving}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={saving || !name || !validPrice}>
                Сохранить в черновик
            </Button>
        </Stack>
    </Stack>;
}

export function PriceTagProductSearch({ items, stockId, onAdd }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [failed, setFailed] = useState(false);
    const queued = new Set(items.map(item => item.id));

    const search = async event => {
        event.preventDefault();
        event.stopPropagation();
        const term = query.trim();
        if (!term || searching) return;

        setSearching(true);
        setFailed(false);
        setResults(null);
        const params = new URLSearchParams({ search: term, limit: "20" });
        if (stockId) params.set("stock_id", stockId);
        try {
            const response = await rest("goods?" + params, "GET", "", false, {
                updateStore: false,
                showGlobalLoader: false,
            });
            if (response.status === 200 && Array.isArray(response.body)) {
                setResults(response.body.filter(getProductPriceTag));
            } else {
                setFailed(true);
            }
        } catch {
            setFailed(true);
        } finally {
            setSearching(false);
        }
    };

    return <Stack spacing={1}>
        <Stack component="form" direction="row" spacing={1} onSubmit={search}>
            <TextField label="Поиск товара на складе" value={query} size="small" fullWidth
                onChange={event => setQuery(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") event.stopPropagation();
                }} />
            <Button type="submit" variant="outlined" disabled={!query.trim() || searching}>
                {searching ? "Поиск…" : "Найти"}
            </Button>
        </Stack>
        {failed && <Typography color="error">Не удалось найти товары. Повторите поиск.</Typography>}
        {results?.length === 0 && <Typography color="text.secondary">Товары для ценников не найдены.</Typography>}
        {results?.map(good => {
            const id = String(good.barcode);
            const alreadyAdded = queued.has(id);
            return <Stack key={id} direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <Typography>{good.model}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        № {good.id} · {formatPriceTagPrice(Number(good.sum))}
                    </Typography>
                </div>
                <Button disabled={alreadyAdded} onClick={() => onAdd([good])}
                    aria-label={alreadyAdded ? undefined : `Добавить товар № ${good.id} в черновик`}>
                    {alreadyAdded ? "В черновике" : "Добавить"}
                </Button>
            </Stack>;
        })}
    </Stack>;
}
