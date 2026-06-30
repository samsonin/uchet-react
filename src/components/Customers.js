import React, {useEffect, useRef, useState} from "react";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import PhoneIcon from "@mui/icons-material/Phone";
import SearchIcon from "@mui/icons-material/Search";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {useSnackbar} from "notistack";
import {Link} from "react-router-dom";

import rest from "./Rest";

const CUSTOMERS_TITLE = "\u0424\u0438\u0437. \u043b\u0438\u0446\u0430";
const CUSTOMER_EMPTY_NAME = "\u0411\u0435\u0437 \u0438\u043c\u0435\u043d\u0438";
const LOADING_LABEL = "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u0434\u0430\u043d\u043d\u044b\u0435...";
const ADD_LABEL = "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c";
const PHONE_LABEL = "\u0422\u0435\u043b\u0435\u0444\u043e\u043d";
const CONTACT_LABEL = "\u041a\u043e\u043d\u0442\u0430\u043a\u0442";

const toLowerSafe = value => String(value || "").toLowerCase();

const customerContactsText = customer => Array.isArray(customer.contacts)
    ? customer.contacts.map(contact => [
        contact?.value,
        contact?.label,
        contact?.type?.code,
        contact?.type?.name,
        contact?.type?.icon,
    ].filter(Boolean).join(" ")).join(" ")
    : "";

const customerSearchText = customer => [
    customer.id,
    customer.fio,
    customer.phone_number,
    customer.birthday,
    customer.birth_place,
    customer.doc_sn,
    customer.doc_date,
    customer.doc_division_name,
    customer.doc_division_code,
    customer.address,
    customer.email,
    customer.note,
    customerContactsText(customer),
].filter(Boolean).join(" ");

const contactKind = contact => {
    const type = contact?.type || {};
    return String(type.code || type.icon || type.name || "").toLowerCase();
};

const contactLabel = contact => contact?.label || contact?.type?.name || CONTACT_LABEL;

const contactHref = contact => {
    const value = String(contact?.value || "").trim();
    const kind = contactKind(contact);

    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    if (kind.includes("telegram")) return "https://t.me/" + value.replace(/^@/, "");
    if (kind.includes("instagram")) return "https://instagram.com/" + value.replace(/^@/, "");
    if (kind.includes("whatsapp")) return "https://wa.me/" + value.replace(/\D/g, "");
    if (kind.includes("phone") || kind.includes("\u0442\u0435\u043b")) return "tel:" + value.replace(/[^\d+]/g, "");
    if (kind.includes("email") || kind.includes("mail") || value.includes("@")) return "mailto:" + value;
    if (kind.includes("site") || kind.includes("web")) return "https://" + value;

    return null;
};

const ContactIcon = ({contact}) => {
    const kind = contactKind(contact);

    if (kind.includes("telegram")) return <AlternateEmailIcon fontSize="small" />;
    if (kind.includes("instagram")) return <InstagramIcon fontSize="small" />;
    if (kind.includes("email") || kind.includes("mail")) return <EmailIcon fontSize="small" />;
    if (kind.includes("phone") || kind.includes("whatsapp") || kind.includes("\u0442\u0435\u043b")) return <PhoneIcon fontSize="small" />;
    if (kind.includes("site") || kind.includes("web")) return <LanguageIcon fontSize="small" />;

    return <ChatBubbleOutlinedIcon fontSize="small" />;
};

const customerAvatar = customer =>
    customer.avatar_url || customer.avatar || customer.photo_url || customer.photo || customer.image_url || customer.image || "";

const customerInitials = customer => {
    const name = String(customer.fio || "").trim();
    if (!name) return "#";

    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase();
};

const customerContactActions = customer => {
    const mainPhone = String(customer.phone_number || "").trim();
    const contacts = Array.isArray(customer.contacts) ? customer.contacts : [];
    const actions = mainPhone
        ? [{id: "main-phone", value: mainPhone, label: PHONE_LABEL, type: {code: "phone", name: PHONE_LABEL}}]
        : [];

    return actions
        .concat(contacts.filter(contact => String(contact?.value || "").trim()))
        .filter((contact, index, all) => {
            const value = String(contact.value || "").trim().toLowerCase();
            return value && all.findIndex(item => String(item.value || "").trim().toLowerCase() === value) === index;
        });
};

export default function Customers(props) {
    const {enqueueSnackbar} = useSnackbar();
    const [search, setSearch] = useState("");
    const [customers, setCustomers] = useState();

    const request = useRef(false);

    useEffect(() => {
        request.current = true;
        rest("customers?details=1&with_contacts=1")
            .then(res => {
                if (res.ok) setCustomers(res.body);
                request.current = false;
            });
    }, []);

    const handleSearch = value => {
        setSearch(value);

        if (!request.current) {
            request.current = true;

            rest("customers?details=1&with_contacts=1&all=" + encodeURIComponent(value))
                .then(res => {
                    if (res.ok) setCustomers(res.body);
                    request.current = false;
                });
        }
    };

    const openContact = async (event, href) => {
        event.preventDefault();
        event.stopPropagation();
        if (!href) return;

        if (href.startsWith("http")) {
            window.open(href, "_blank", "noopener,noreferrer");
            return;
        }

        if (href.startsWith("tel:")) {
            const phone = href.replace(/^tel:/, "");

            try {
                await navigator.clipboard.writeText(phone);
                enqueueSnackbar("Номер скопирован", {variant: "success"});
            } catch (error) {
                enqueueSnackbar(phone, {variant: "info"});
            }
        }
    };

    const visibleCustomers = Array.isArray(customers)
        ? customers.filter(customer => {
            if (!search) return true;

            const searchText = toLowerSafe(customerSearchText(customer));

            return search.toLowerCase()
                .split(" ")
                .filter(Boolean)
                .every(part => searchText.includes(part));
        })
        : null;

    return <Grid container sx={{width: "100%"}}>
        <Grid size={12}>
            <Paper className="customers-list-page">
                <div className="customers-list-header">
                    <Typography variant="h5" className="customers-list-title">
                        {CUSTOMERS_TITLE}
                    </Typography>
                    <div className="customers-list-search">
                        <Input
                            id="searchCustomerString"
                            name="searchCustomerString"
                            onChange={event => handleSearch(event.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                            }
                        />
                        <Tooltip title={ADD_LABEL}>
                            <Link to="/customers/0">
                                <IconButton className="customers-list-add-button">
                                    <AddCircleIcon />
                                </IconButton>
                            </Link>
                        </Tooltip>
                    </div>
                </div>

                <div className="customers-list">
                    {visibleCustomers
                        ? visibleCustomers.map(customer => <div
                            key={`customer-list-item-${customer.id}`}
                            className="customers-list-item"
                            onClick={() => props.history.push("/customers/" + customer.id)}
                        >
                            <div className="customers-list-person">
                                <Avatar
                                    src={customerAvatar(customer)}
                                    className="customers-list-avatar"
                                >
                                    {customerInitials(customer)}
                                </Avatar>
                                <div className="customers-list-name">
                                    {customer.fio || `${CUSTOMER_EMPTY_NAME} #${customer.id}`}
                                </div>
                            </div>

                            <div className="customers-list-actions">
                                {customerContactActions(customer).map((contact, index) => {
                                    const href = contactHref(contact);
                                    const label = contactLabel(contact);

                                    return <Tooltip
                                        key={`customer-contact-action-${customer.id}-${contact.id || index}`}
                                        title={`${label}: ${contact.value}`}
                                    >
                                        <span>
                                            <IconButton
                                                size="small"
                                                className="customers-list-contact-button"
                                                onClick={event => openContact(event, href)}
                                                disabled={!href}
                                            >
                                                <ContactIcon contact={contact} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>;
                                })}
                            </div>
                        </div>)
                        : <div className="customers-list-loading">{LOADING_LABEL}</div>}
                </div>
            </Paper>
        </Grid>
    </Grid>;
}
