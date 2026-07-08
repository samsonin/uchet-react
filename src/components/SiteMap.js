export const siteMap = (isAdmin, userId = 0) => {

    let map = [

        { id: 1, path: "order", text: "\u041d\u043e\u0432\u044b\u0439 \u0437\u0430\u043a\u0430\u0437" },
        { id: 2, path: "orders", text: "\u0412\u0441\u0435 \u0437\u0430\u043a\u0430\u0437\u044b" },
        { id: 3, path: "queue", text: "\u0420\u0430\u0431\u043e\u0447\u0438\u0435 \u043c\u0435\u0441\u0442\u0430" },

        { id: 10, path: "store", text: "\u0421\u043a\u043b\u0430\u0434" },
        { id: 11, path: "arrival", text: "\u041e\u043f\u0440\u0438\u0445\u043e\u0434\u043e\u0432\u0430\u043d\u0438\u0435" },
        { id: 14, path: "transit", text: "\u0422\u0440\u0430\u043d\u0437\u0438\u0442" },
        { id: 15, path: "prepaids", text: "\u041f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0442\u044b" },
        { id: 16, path: "reals", text: "\u0420\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f" },
        { id: 17, path: "pledges", text: "\u0417\u0430\u043b\u043e\u0433\u0438" },

        { id: 21, path: "customers", text: "\u0424\u0438\u0437\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u043b\u0438\u0446\u0430" },
        { id: 22, path: "entities", text: "\u042e\u0440\u0438\u0434\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u043b\u0438\u0446\u0430" },
        { id: 24, path: "call_records", text: "\u0417\u0430\u043f\u0438\u0441\u0438 \u0440\u0430\u0437\u0433\u043e\u0432\u043e\u0440\u043e\u0432" },
        { id: 25, path: "crm/leads", text: "\u0417\u0430\u044f\u0432\u043a\u0438" },

        { id: 31, path: "daily", text: "\u0415\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u044b\u0439 \u043e\u0442\u0447\u0435\u0442" },
        { id: 35, path: "sales", text: "\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u043f\u0440\u043e\u0434\u0430\u0436\u0430\u043c" },

        { id: 40, path: "settings/personal", text: "\u041b\u0438\u0447\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435" },
        { id: 44, path: "settings/app", text: "\u0418\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441" },
        { id: 49, path: "settings/print", text: "\u041f\u0435\u0447\u0430\u0442\u044c" },
        { id: 50, path: "settings/payment-types", text: "\u0421\u043f\u043e\u0441\u043e\u0431\u044b \u043e\u043f\u043b\u0430\u0442\u044b" },

        { id: 53, path: "integration/prices", text: "\u041f\u0440\u0430\u0439\u0441-\u043b\u0438\u0441\u0442\u044b" },

    ]

    if (+userId === 4) {
        map = map.concat([
            { id: 54, path: "integration/cash-video-control", text: "\u0412\u0438\u0434\u0435\u043e-\u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044c \u043a\u0430\u0441\u0441\u044b" },
        ])
    }

    return isAdmin

        ? map.concat([

            { id: 19, path: "inventory", text: "\u0418\u043d\u0432\u0435\u043d\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044f" },

            { id: 32, path: "funds", text: "\u0414\u0432\u0438\u0436\u0435\u043d\u0438\u0435 \u0434\u0435\u043d\u0435\u0433" },
            { id: 33, path: "zp", text: "\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430" },

            { id: 41, path: "settings/organization", text: "\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0446\u0438\u044f" },
            { id: 42, path: "settings/employees", text: "\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438" },
            { id: 43, path: "settings/stocks", text: "\u0422\u043e\u0447\u043a\u0438" },
            { id: 45, path: "settings/invites", text: "\u041f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u044f" },
            { id: 46, path: "settings/config", text: "\u0423\u0441\u043b\u043e\u0432\u0438\u044f" },
            { id: 47, path: "settings/fields", text: "\u041f\u043e\u043b\u044f" },
            { id: 48, path: "settings/docs", text: "\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b" },

            { id: 51, path: "integration/mango", text: "Mango-office.ru" },
            { id: 52, path: "integration/sms_ru", text: "Sms.ru" },

        ])

        : map

}
