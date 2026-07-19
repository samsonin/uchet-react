export const unprocessedCrmLeads = leads => (leads || [])
    .filter(lead => lead && lead.status === "new");

export const crmLeadNotificationKey = lead => String(lead?.id || "");

export const crmLeadNotificationText = lead => {
    const contact = lead?.customer_phone
        || lead?.customer_email
        || lead?.customer_name
        || "без контакта";

    const interest = lead?.item_name
        || lead?.item_identifier
        || lead?.comment
        || "заявка";

    return "Новая заявка: " + contact + " - " + interest;
};
