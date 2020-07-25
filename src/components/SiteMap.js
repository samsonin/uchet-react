export const siteMap = [
    {id: 1, onlyWe: false, onlyAdmin: false, path: "order", text: "Новый заказ"},
    {id: 2, onlyWe: false, onlyAdmin: false, path: "orders", text: "Все заказы"},
    {id: 3, onlyWe: false, onlyAdmin: false, path: "queue", text: "Рабочие места"},
    // {id: 4, onlyWe: false, onlyAdmin: false, path: "tosale", text: "Давно на забирают"},
    // {id: 5, onlyWe: false, onlyAdmin: false, path: "buy", text: "Купить технику"},
    // {id: 6, onlyWe: false, onlyAdmin: false, path: "to_zalog", text: "Принять в залог"},
    // {id: 7, onlyWe: false, onlyAdmin: false, path: "from_zalog", text: "Выдать из залога"},
    // {id: 8, onlyWe: false, onlyAdmin: false, path: "to_real", text: "Принять на реализацию"},
    // {id: 9, onlyWe: false, onlyAdmin: false, path: "real", text: "На реализации"},
    // {id: 10, onlyWe: false, onlyAdmin: false, path: "goods", text: "Товары"},
    {id: 11, onlyWe: false, onlyAdmin: false, path: "arrival", text: "Оприходование ТМЦ"},
    // {id: 12, onlyWe: false, onlyAdmin: false, path: "make_good", text: "Изготовление ТМЦ"},
    {id: 12, onlyWe: false, onlyAdmin: false, path: "transit", text: "Транзит ТМЦ"},
    // {id: 14, onlyWe: false, onlyAdmin: false, path: "reject", text: "Брак"},
    // {id: 15, onlyWe: false, onlyAdmin: false, path: "prepaid", text: "Предоплаты"},
    {id: 21, onlyWe: false, onlyAdmin: false, path: "customers", text: "Физические лица"},
    {id: 22, onlyWe: false, onlyAdmin: false, path: "providers", text: "Юридические лица"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "accounting_documents", text: "Документы"},
    // {id: 1, onlyWe: true, onlyAdmin: false, path: "calls_rec", text: "Записи разговоров"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "messages", text: "Сообщения"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "needcall", text: "Необходимо связаться"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "missed_calls", text: "Пропущенные звонки"},
    // {id: 1, onlyWe: true, onlyAdmin: false, path: "pr_orders", text: "Заявки с сайта"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "black_list", text: "Черный список"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "daily", text: "Ежедневный отчет"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "allseach", text: "Поиск по наличию"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "salary", text: "Зарплата"},
    // {id: 1, onlyWe: false, onlyAdmin: true, path: "encashment", text: "Инкассация"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "saleseach", text: "Поиск по продажам"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "inventory", text: "Акты инвенторизации"},
    // {id: 1, onlyWe: false, onlyAdmin: false, path: "barcodeinventory", text: "Инвенторизация по штрихкодам"},

    {id: 41, onlyWe: false, onlyAdmin: false, path: "settings/organization", text: "Организация"},
    {id: 42, onlyWe: false, onlyAdmin: false, path: "settings/employees", text: "Сотрудники"},
    {id: 43, onlyWe: false, onlyAdmin: false, path: "settings/points", text: "Точки"},
    {id: 46, onlyWe: false, onlyAdmin: false, path: "settings/config", text: "Условия"},
    {id: 47, onlyWe: false, onlyAdmin: false, path: "settings/fields", text: "Поля"},
    {id: 48, onlyWe: false, onlyAdmin: false, path: "settings/docs", text: "Документы"},

    {id: 51, onlyWe: false, onlyAdmin: false, path: "integration/mango", text: "mango-office.ru"},
    {id: 52, onlyWe: false, onlyAdmin: false, path: "integration/sms_ru", text: "sms.ru"},
];

export const permission = (id, auth) => {
    let obj = siteMap.find(v => v.id === id);

    return obj ?
        obj.onlyWe && auth.organization_id > 1 ?
            false : !(obj.onlyAdmin && !auth.admin) :
        false;

}
