import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CachedIcon from "@mui/icons-material/Cached";
import SearchIcon from "@mui/icons-material/Search";
import { useSnackbar } from "notistack";

import { upd_app } from "../actions/actionCreator";
import rest from "./Rest";

const statusLabels = {
    new: "Новая",
    processed: "Обработана",
};

const typeLabels = {
    product: "Товар",
    repair: "Ремонт",
    other: "Другое",
};

const formatDate = value => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("ru-RU");
};

const CrmLeads = props => {
    const organizationId = +props.auth.organization_id;
    const leads = props.app.crm_leads || [];
    const [status, setStatus] = useState("new");
    const [search, setSearch] = useState("");
    const [requesting, setRequesting] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const loadLeads = () => {
        if (!organizationId) return;

        const params = new URLSearchParams();

        if (status) params.set("status", status);
        if (search.trim()) params.set("search", search.trim());

        setRequesting(true);

        rest("crm/" + organizationId + "/leads?" + params.toString(), "GET", "", false, {
            updateStore: false,
        })
            .then(res => {
                if (res.ok) {
                    props.upd_app({ crm_leads: res.body?.items || [] });
                    return;
                }

                enqueueSnackbar(res.body?.error || "Не удалось загрузить заявки", { variant: "error" });
            })
            .finally(() => setRequesting(false));
    };

    useEffect(() => {
        loadLeads();
    }, [organizationId]);

    const canSearch = organizationId === 1;

    return <div style={{ padding: 20 }}>
        <Typography variant="h4" style={{ marginBottom: 16 }}>
            Заявки
        </Typography>

        <div style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 16,
        }}>
            <TextField
                select
                size="small"
                label="Статус"
                value={status}
                style={{ minWidth: 180 }}
                disabled={requesting}
                onChange={e => setStatus(e.target.value)}
            >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="new">Новые</MenuItem>
                <MenuItem value="processed">Обработанные</MenuItem>
            </TextField>

            <TextField
                size="small"
                label="Поиск"
                value={search}
                disabled={requesting || !canSearch}
                helperText={canSearch ? "" : "Поиск пока доступен только для organization_id = 1"}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                    if (e.key === "Enter") loadLeads();
                }}
            />

            <Button
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={requesting || (!!search.trim() && !canSearch)}
                onClick={loadLeads}
            >
                Найти
            </Button>

            <Button
                variant="outlined"
                startIcon={<CachedIcon />}
                disabled={requesting}
                onClick={loadLeads}
            >
                Обновить
            </Button>
        </div>

        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Тип</TableCell>
                        <TableCell>Клиент</TableCell>
                        <TableCell>Контакт</TableCell>
                        <TableCell>Интерес</TableCell>
                        <TableCell>Комментарий</TableCell>
                        <TableCell>Источник</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leads.length ? leads.map(lead => <TableRow key={lead.id} hover>
                        <TableCell>{formatDate(lead.created_at)}</TableCell>
                        <TableCell>{statusLabels[lead.status] || lead.status}</TableCell>
                        <TableCell>{typeLabels[lead.interest_type] || lead.interest_type}</TableCell>
                        <TableCell>{lead.customer_name}</TableCell>
                        <TableCell>{lead.customer_phone || lead.customer_email}</TableCell>
                        <TableCell>{lead.item_name || lead.item_identifier}</TableCell>
                        <TableCell>{lead.comment}</TableCell>
                        <TableCell>{lead.source}</TableCell>
                    </TableRow>) : <TableRow>
                        <TableCell colSpan={8}>Нет данных</TableCell>
                    </TableRow>}
                </TableBody>
            </Table>
        </TableContainer>
    </div>;
};

const mapDispatchToProps = dispatch => bindActionCreators({
    upd_app,
}, dispatch);

export default connect(state => state, mapDispatchToProps)(CrmLeads);
