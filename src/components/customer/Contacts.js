import React from "react";

import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import EmailIcon from "@mui/icons-material/Email";
import LanguageIcon from "@mui/icons-material/Language";
import PhoneIcon from "@mui/icons-material/Phone";
import StarIcon from "@mui/icons-material/Star";

const CONTACTS_TITLE = "\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b";
const PRIMARY_LABEL = "\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0439";
const DEFAULT_CONTACT_LABEL = "\u041a\u043e\u043d\u0442\u0430\u043a\u0442";

const contactKind = contact => {
    const type = contact?.type || {};
    return String(type.code || type.icon || type.name || "").toLowerCase();
};

const cleanTelegram = value => String(value || "").trim().replace(/^@/, "");

const contactHref = contact => {
    const value = String(contact?.value || "").trim();
    const kind = contactKind(contact);

    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    if (kind.includes("telegram")) return "https://t.me/" + cleanTelegram(value);
    if (kind.includes("whatsapp")) return "https://wa.me/" + value.replace(/\D/g, "");
    if (kind.includes("phone") || kind.includes("\u0442\u0435\u043b")) return "tel:" + value.replace(/[^\d+]/g, "");
    if (kind.includes("email") || kind.includes("mail") || value.includes("@")) return "mailto:" + value;
    if (kind.includes("site") || kind.includes("web")) return "https://" + value;

    return null;
};

const ContactIcon = ({contact}) => {
    const type = contact?.type || {};
    const kind = contactKind(contact);

    if (type.icon_url) {
        return <img src={type.icon_url} alt="" className="customer-contact-icon-img" />;
    }

    if (kind.includes("telegram") || kind.includes("@")) return <AlternateEmailIcon fontSize="small" />;
    if (kind.includes("email") || kind.includes("mail")) return <EmailIcon fontSize="small" />;
    if (kind.includes("phone") || kind.includes("whatsapp") || kind.includes("\u0442\u0435\u043b")) return <PhoneIcon fontSize="small" />;
    if (kind.includes("site") || kind.includes("web")) return <LanguageIcon fontSize="small" />;

    return <ChatBubbleOutlinedIcon fontSize="small" />;
};

const CustomerContacts = ({contacts, dense = false}) => {
    const visibleContacts = Array.isArray(contacts)
        ? contacts.filter(contact => String(contact?.value || "").trim())
        : [];

    if (!visibleContacts.length) return null;

    return <section className={dense ? "customer-contacts is-dense" : "customer-contacts"}>
        <div className="customer-contacts-title">{CONTACTS_TITLE}</div>
        <div className="customer-contacts-list">
            {visibleContacts.map((contact, index) => {
                const type = contact.type || {};
                const href = contactHref(contact);
                const label = contact.label || type.name || DEFAULT_CONTACT_LABEL;
                const value = String(contact.value || "").trim();
                const body = <>
                    <span className="customer-contact-icon">
                        <ContactIcon contact={contact} />
                    </span>
                    <span className="customer-contact-main">
                        <span className="customer-contact-type">{label}</span>
                        <span className="customer-contact-value">{value}</span>
                    </span>
                    {contact.is_primary && <span className="customer-contact-primary">
                        <StarIcon fontSize="inherit" />
                        {PRIMARY_LABEL}
                    </span>}
                </>;

                return href
                    ? <a
                        key={`customer-contact-${contact.id || index}`}
                        className="customer-contact-card"
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                        {body}
                    </a>
                    : <div
                        key={`customer-contact-${contact.id || index}`}
                        className="customer-contact-card"
                    >
                        {body}
                    </div>;
            })}
        </div>
    </section>;
};

export default CustomerContacts;
