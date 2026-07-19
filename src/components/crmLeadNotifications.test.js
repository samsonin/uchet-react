import {
    crmLeadNotificationKey,
    crmLeadNotificationText,
    unprocessedCrmLeads,
} from "./crmLeadNotifications";

describe("crmLeadNotifications", () => {
    test("filters only new CRM leads for snackbar notifications", () => {
        expect(unprocessedCrmLeads([
            { id: 1, status: "new" },
            { id: 2, status: "processed" },
            { id: 3, status: "new" },
        ])).toEqual([
            { id: 1, status: "new" },
            { id: 3, status: "new" },
        ]);
    });

    test("builds stable snackbar key and readable text", () => {
        const lead = {
            id: 15,
            customer_phone: "9510008850",
            item_name: "Redmi A3x",
        };

        expect(crmLeadNotificationKey(lead)).toBe("15");
        expect(crmLeadNotificationText(lead)).toBe("Новая заявка: 9510008850 - Redmi A3x");
    });
});
