export const siteMap = [
  {id: 1, onlyAdmin: false, path: "order", text: "Новый заказ"},
  {id: 2, onlyAdmin: false, path: "orders", text: "Все заказы"},
  {id: 3, onlyAdmin: false, path: "queue", text: "Рабочие места"},
  // {id: 4, onlyAdmin: false, path: "tosale", text: "Давно на забирают"},
  // {id: 5, onlyAdmin: false, path: "buy", text: "Купить технику"},
  // {id: 6, onlyAdmin: false, path: "to_zalog", text: "Принять в залог"},
  // {id: 7, onlyAdmin: false, path: "from_zalog", text: "Выдать из залога"},
  // {id: 8, onlyAdmin: false, path: "to_real", text: "Принять на реализацию"},
  // {id: 9, onlyAdmin: false, path: "real", text: "На реализации"},
  // {id: 10, onlyAdmin: false, path: "goods", text: "Товары"},
  {id: 11, onlyAdmin: false, path: "arrival", text: "Оприходование ТМЦ"},
  // {id: 12, onlyAdmin: false, path: "make_good", text: "Изготовление ТМЦ"},
  {id: 12, onlyAdmin: false, path: "transit", text: "Транзит ТМЦ"},
  // {id: 14, onlyAdmin: false, path: "reject", text: "Брак"},
  // {id: 15, onlyAdmin: false, path: "prepaid", text: "Предоплаты"},
  {id: 21, onlyAdmin: false, path: "customers", text: "Физические лица"},
  {id: 22, onlyAdmin: false, path: "providers", text: "Юридические лица"},
  // {id: 1, onlyAdmin: false, path: "accounting_documents", text: "Документы"},
  {id: 24, onlyAdmin: false, path: "call_records", text: "Записи разговоров"},
  // {id: 1, onlyAdmin: false, path: "messages", text: "Сообщения"},
  // {id: 1, onlyAdmin: false, path: "needcall", text: "Необходимо связаться"},
  // {id: 1, onlyAdmin: false, path: "missed_calls", text: "Пропущенные звонки"},
  // {id: 1, onlyAdmin: false, path: "pr_orders", text: "Заявки с сайта"},
  // {id: 1, onlyAdmin: false, path: "black_list", text: "Черный список"},

  // {id: 1, onlyAdmin: false, path: "daily", text: "Ежедневный отчет"},
  // {id: 1, onlyAdmin: false, path: "allseach", text: "Поиск по наличию"},
  // {id: 1, onlyAdmin: false, path: "salary", text: "Зарплата"},
  // {id: 1, onlyAdmin: true, path: "encashment", text: "Инкассация"},
  // {id: 1, onlyAdmin: false, path: "saleseach", text: "Поиск по продажам"},
  // {id: 1, onlyAdmin: false, path: "inventory", text: "Акты инвенторизации"},
  // {id: 1, onlyAdmin: false, path: "barcodeinventory", text: "Инвенторизация по штрихкодам"},

  {id: 41, onlyAdmin: false, path: "settings/organization", text: "Организация"},
  {id: 42, onlyAdmin: false, path: "settings/employees", text: "Сотрудники"},
  {id: 43, onlyAdmin: false, path: "settings/stocks", text: "Точки"},
  {id: 46, onlyAdmin: false, path: "settings/config", text: "Условия"},
  {id: 47, onlyAdmin: false, path: "settings/fields", text: "Поля"},
  {id: 48, onlyAdmin: false, path: "settings/docs", text: "Документы"},

  {id: 51, onlyAdmin: false, path: "integration/mango", text: "mango-office.ru"},
  {id: 52, onlyAdmin: false, path: "integration/sms_ru", text: "sms.ru"},
];

export const permission = (id, auth) => {
  let obj = siteMap.find(v => v.id === id);

  return obj ?
    !(obj.onlyAdmin && !auth.admin) :
    false;

}
