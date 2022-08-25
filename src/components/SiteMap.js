export const siteMap = isAdmin => {

    let map = [

        {id: 1, path: "order", text: "Новый заказ"},
        {id: 2, path: "orders", text: "Все заказы"},
        {id: 3, path: "queue", text: "Рабочие места"},

        {id: 11, path: "arrival", text: "Оприходование"},
        {id: 14, path: "transit", text: "Транзит"},
        {id: 15, path: "prepaids", text: "Предоплаты"},
        {id: 16, path: "showcase", text: "Техника"},
        {id: 17, path: "pledges", text: "Залоги"},

        {id: 21, path: "customers", text: "Физические лица"},
        {id: 22, path: "entities", text: "Юридические лица"},
        {id: 24, path: "call_records", text: "Записи разговоров"},

        {id: 31, path: "daily", text: "Ежедневный отчет"},

        {id: 53, path: "integration/prices", text: "Прайс-листы"},

    ]

    return isAdmin

        ? map.concat([

            {id: 10, path: "store", text: "Склад"},
            {id: 19, path: "inventory", text: "Инвентаризация"},

            {id: 32, path: "funds", text: "Движение денег"},

            {id: 41, path: "settings/organization", text: "Организация"},
            {id: 42, path: "settings/employees", text: "Сотрудники"},
            {id: 43, path: "settings/stocks", text: "Точки"},
            {id: 46, path: "settings/config", text: "Условия"},
            {id: 47, path: "settings/fields", text: "Поля"},
            {id: 48, path: "settings/docs", text: "Документы"},

            {id: 51, path: "integration/mango", text: "Mango-office.ru"},
            {id: 52, path: "integration/sms_ru", text: "Sms.ru"},

        ])

        : map

}