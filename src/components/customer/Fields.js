import React from "react";

import CustomerForm from "./CustomerForm";

export default function Fields(props) {
    return <CustomerForm
        {...props}
        variant="detailed"
        newLabel="Новый клиент"
        existingLabel="Клиент из базы"
        allowAdditionalContacts
        lockExistingCustomer
    />;
}
