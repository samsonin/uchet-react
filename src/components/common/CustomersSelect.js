import React from "react";

import CustomerForm from "../customer/CustomerForm";

export default function CustomersSelect(props) {
    return <CustomerForm
        {...props}
        variant="compact"
        lockExistingCustomer
    />;
}
