# План реализации OCR паспорта через QR

> **Для agentic workers:** ОБЯЗАТЕЛЬНЫЙ ПОДНАВЫК: используйте superpowers:subagent-driven-development (рекомендуется) или superpowers:executing-plans, чтобы выполнять план по задачам. Шаги оформлены чекбоксами (`- [ ]`) для отслеживания прогресса.

**Цель:** добавить одноразовый QR-сценарий, в котором оператор запускает OCR паспорта из `/pledges`, фотографирует паспорт телефоном и получает распознанные поля на компьютере через существующее WebSocket-обновление общего state.

**Архитектура:** `CustomerForm` остается владельцем полей клиента и состояния OCR-интерфейса. Логика нормализации OCR и сопоставления сессий выносится в helper, reducer начинает принимать `passport_ocr_session`, а UI получает отдельный QR-диалог и отдельную телефонную страницу съемки.

**Технологии:** React 19, React Router 7, Redux 5, MUI 9, notistack, существующий `rest` helper, существующий WebSocket adapter. Для QR-кода добавить `qrcode.react`, если в проекте уже нет QR-компонента.

---

## Структура файлов

- Создать `src/components/customer/passportOcr.js`: чистые helper-функции для нормализации OCR payload, чтения идентификатора сессии и сопоставления WebSocket-обновления с активной desktop-сессией.
- Создать `src/components/customer/passportOcr.test.js`: тесты helper-функций без DOM.
- Создать `src/components/customer/PassportQrDialog.js`: desktop-диалог с QR-кодом, ссылкой, статусом, fallback-загрузкой с компьютера и отменой.
- Создать `src/components/customer/PassportCapturePage.js`: неавторизованная телефонная страница по одноразовому token URL.
- Изменить `src/components/customer/CustomerForm.js`: подключить helper, создать QR-сессию, обработать `props.passportOcrSession`, сохранить текущую загрузку файла с компьютера.
- Изменить `src/reducers/app.js`: разрешить ключ `passport_ocr_session` в общем app state.
- Изменить `src/App.js`: добавить маршрут телефонной съемки вне обязательной авторизации.
- Изменить `src/constants.js`: добавить `PASSPORT_OCR_SESSION_PATH` со значением по умолчанию `ocr/passport/sessions`.
- Изменить `src/index.css`: добавить стили QR-диалога и телефонной страницы.
- Изменить `package.json` и `package-lock.json`: добавить зависимость для QR.

## Backend-контракт

План предполагает, что backend предоставляет:

```text
POST /ocr/passport/sessions
POST /ocr/passport/sessions/:token/image
```

Ответ создания desktop-сессии:

```json
{
  "session_id": "session-id",
  "token": "token",
  "capture_url": "https://uchet.store/passport-capture/token",
  "expires_at": "2026-05-19T09:10:00Z"
}
```

WebSocket-обновление общего state:

```json
{
  "passport_ocr_session": {
    "id": "session-id",
    "token": "token",
    "status": "recognized",
    "fields": {
      "fio": "Иванов Иван Иванович",
      "birthday": "1990-01-01",
      "birth_place": "г. Владивосток",
      "doc_sn": "1234 567890",
      "doc_date": "2020-01-01",
      "doc_division_name": "ОВМ ...",
      "doc_division_code": "250-001",
      "address": "..."
    },
    "error": ""
  }
}
```

---

### Задача 1: Вынести helper-функции OCR паспорта

**Файлы:**
- Создать: `src/components/customer/passportOcr.js`
- Создать: `src/components/customer/passportOcr.test.js`
- Изменить: `src/components/customer/CustomerForm.js`

- [ ] **Шаг 1: Написать тесты helper-функций**

Создать `src/components/customer/passportOcr.test.js` с проверками:

- `normalizePassportPayload` берет поля из плоского payload: `full_name`, `birth_date`, `birthplace`, `passport_number`, `issue_date`, `issued_by`, `department_code`, `registration_address`;
- `normalizePassportPayload` берет поля из вложенного payload `data.fields`;
- invalid payload (`null`, массив, `fields: []`) возвращает `{}`;
- `getPassportOcrSessionId` читает `id`, `session_id` или `token`;
- `isMatchingPassportOcrSession` возвращает `true` только для совпадающих активной и входящей сессий.

Минимальная структура теста:

```javascript
import {
    getPassportOcrSessionId,
    isMatchingPassportOcrSession,
    normalizePassportPayload,
} from "./passportOcr";
```

- [ ] **Шаг 2: Запустить тесты и убедиться, что они падают**

```bash
npm test -- --watchAll=false src/components/customer/passportOcr.test.js
```

Ожидаемо: FAIL, потому что `./passportOcr` еще не существует.

- [ ] **Шаг 3: Реализовать `src/components/customer/passportOcr.js`**

Экспортировать:

```javascript
export const normalizePassportPayload = body => {};
export const getPassportOcrSessionId = session => {};
export const isMatchingPassportOcrSession = (incomingSession, activeSession) => {};
```

`normalizePassportPayload` должен сохранить текущие aliases из `CustomerForm`: `fio`, `birthday`, `birth_place`, `doc_sn`, `doc_date`, `doc_division_name`, `doc_division_code`, `address`.

- [ ] **Шаг 4: Подключить helper в `CustomerForm`**

Добавить:

```javascript
import { normalizePassportPayload } from "./passportOcr";
```

Удалить локальные `passportFieldAliases` и `normalizePassportPayload`. В `handleDocumentPhoto` оставить вызов `normalizePassportPayload(res.body)`.

- [ ] **Шаг 5: Проверить тесты и сборку**

```bash
npm test -- --watchAll=false src/components/customer/passportOcr.test.js
npm run build
```

Ожидаемо: тесты PASS, сборка завершается без ошибок.

- [ ] **Шаг 6: Коммит**

```bash
git add src/components/customer/passportOcr.js src/components/customer/passportOcr.test.js src/components/customer/CustomerForm.js
git commit -m "Extract passport OCR helpers"
```

---

### Задача 2: Сохранять WebSocket-обновления OCR паспорта

**Файлы:**
- Изменить: `src/reducers/app.js`

- [ ] **Шаг 1: Добавить ключ reducer**

В `initialState` добавить:

```javascript
passport_ocr_session: null,
```

В `probableKeys` добавить:

```javascript
'passport_ocr_session',
```

- [ ] **Шаг 2: Проверить сборку**

```bash
npm run build
```

Ожидаемо: сборка завершается успешно.

- [ ] **Шаг 3: Коммит**

```bash
git add src/reducers/app.js
git commit -m "Store passport OCR session updates"
```

---

### Задача 3: Добавить константу endpoint OCR-сессий

**Файлы:**
- Изменить: `src/constants.js`

- [ ] **Шаг 1: Добавить переменную окружения и export**

Добавить:

```javascript
const ENV_PASSPORT_OCR_SESSION_PATH = process.env.REACT_APP_PASSPORT_OCR_SESSION_PATH;
```

В общий export добавить:

```javascript
PASSPORT_OCR_SESSION_PATH = ENV_PASSPORT_OCR_SESSION_PATH || 'ocr/passport/sessions',
```

`PASSPORT_OCR_PATH` оставить без изменений.

- [ ] **Шаг 2: Проверить сборку**

```bash
npm run build
```

Ожидаемо: сборка завершается успешно.

- [ ] **Шаг 3: Коммит**

```bash
git add src/constants.js
git commit -m "Add passport OCR session endpoint constant"
```

---

### Задача 4: Добавить desktop QR-диалог

**Файлы:**
- Создать: `src/components/customer/PassportQrDialog.js`
- Изменить: `src/index.css`
- Изменить: `package.json`
- Изменить: `package-lock.json`

- [ ] **Шаг 1: Добавить зависимость QR**

```bash
npm install qrcode.react
```

Ожидаемо: `package.json` и `package-lock.json` содержат `qrcode.react`.

- [ ] **Шаг 2: Создать компонент `PassportQrDialog`**

Компонент принимает:

```javascript
{
    open,
    session,
    status = "waiting",
    error = "",
    onCancel,
    onComputerUpload,
}
```

Статусы:

```javascript
const statusLabels = {
    waiting: "Ожидаем фото",
    uploaded: "Фото загружено",
    recognizing: "Распознаем",
    recognized: "Готово",
    error: "Ошибка",
    expired: "Ссылка истекла",
};
```

UI: `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `LinearProgress`, `QRCodeSVG`, кнопки `Загрузить с компьютера` и `Отменить`.

- [ ] **Шаг 3: Добавить стили диалога**

В `src/index.css` добавить классы:

```css
.passport-qr-dialog-content {}
.passport-qr-progress {}
.passport-qr-code-wrap {}
.passport-qr-placeholder {}
.passport-qr-status {}
.passport-qr-link {}
```

Требования к стилям: QR-код 220-240px, ссылка переносится через `overflow-wrap: anywhere`, кнопки не ломают layout на мобильной ширине.

- [ ] **Шаг 4: Проверить сборку**

```bash
npm run build
```

Ожидаемо: сборка завершается, импорт QR работает.

- [ ] **Шаг 5: Коммит**

```bash
git add package.json package-lock.json src/components/customer/PassportQrDialog.js src/index.css
git commit -m "Add passport QR dialog"
```

---

### Задача 5: Подключить QR-диалог к `CustomerForm`

**Файлы:**
- Изменить: `src/components/customer/CustomerForm.js`

- [ ] **Шаг 1: Добавить импорты**

```javascript
import { PASSPORT_OCR_PATH, PASSPORT_OCR_SESSION_PATH } from "../../constants";
import PassportQrDialog from "./PassportQrDialog";
import {
    isMatchingPassportOcrSession,
    normalizePassportPayload,
} from "./passportOcr";
```

- [ ] **Шаг 2: Добавить состояние QR-сценария**

```javascript
const [isPassportQrOpen, setIsPassportQrOpen] = useState(false);
const [passportQrSession, setPassportQrSession] = useState(null);
const [passportQrStatus, setPassportQrStatus] = useState("waiting");
const [passportQrError, setPassportQrError] = useState("");
```

- [ ] **Шаг 3: Добавить общую функцию применения распознанных полей**

```javascript
const applyRecognizedPassportFields = recognizedFields => {
    if (!Object.keys(recognizedFields).length) return false;

    setCustomerPatch(recognizedFields);
    setIsDetails(true);
    return true;
};
```

В `handleDocumentPhoto` использовать `applyRecognizedPassportFields(recognizedFields)` вместо прямого `setCustomerPatch`.

- [ ] **Шаг 4: Добавить создание QR-сессии**

```javascript
const openPassportQr = async () => {
    setPassportQrError("");
    setPassportQrStatus("waiting");
    setIsPassportQrOpen(true);

    const res = await rest(PASSPORT_OCR_SESSION_PATH, "POST", {}, false, {
        updateStore: false,
        responseType: "auto",
    });

    const session = res.body?.session || res.body;

    if (!res.ok || !session?.capture_url) {
        setPassportQrStatus("error");
        setPassportQrError("Не удалось создать QR-ссылку.");
        return;
    }

    setPassportQrSession(session);
};
```

- [ ] **Шаг 5: Добавить обработку WebSocket-сессии**

`useEffect` должен:

- брать `props.passportOcrSession`;
- проверять `isPassportQrOpen`;
- проверять `isMatchingPassportOcrSession(incomingSession, passportQrSession)`;
- при `recognized` нормализовать `incomingSession.fields || incomingSession`;
- заполнить клиента через `applyRecognizedPassportFields`;
- при `error` или `expired` показать `incomingSession.error`.

- [ ] **Шаг 6: Добавить отмену и fallback**

```javascript
const closePassportQr = () => {
    setIsPassportQrOpen(false);
    setPassportQrSession(null);
    setPassportQrStatus("waiting");
    setPassportQrError("");
};

const uploadPassportFromComputer = () => {
    closePassportQr();
    documentInputRef.current?.click();
};
```

- [ ] **Шаг 7: Изменить кнопку `Документ`**

Поменять обработчик кнопки на:

```javascript
onClick={openPassportQr}
```

Скрытый file input оставить, чтобы fallback `С компьютера` продолжал работать.

- [ ] **Шаг 8: Отрендерить QR-диалог**

```javascript
<PassportQrDialog
    open={isPassportQrOpen}
    session={passportQrSession}
    status={passportQrStatus}
    error={passportQrError}
    onCancel={closePassportQr}
    onComputerUpload={uploadPassportFromComputer}
/>
```

- [ ] **Шаг 9: Передать `passportOcrSession` из Redux**

```javascript
export default connect(state => ({
    ...(state.app.fields || {}),
    contactTypes: state.app.contact_types || [],
    passportOcrSession: state.app.passport_ocr_session || null,
}))(CustomerForm);
```

- [ ] **Шаг 10: Проверить сборку**

```bash
npm run build
```

Ожидаемо: сборка завершается успешно.

- [ ] **Шаг 11: Коммит**

```bash
git add src/components/customer/CustomerForm.js
git commit -m "Connect customer form to passport QR OCR"
```

---

### Задача 6: Добавить телефонную страницу съемки

**Файлы:**
- Создать: `src/components/customer/PassportCapturePage.js`
- Изменить: `src/App.js`
- Изменить: `src/index.css`

- [ ] **Шаг 1: Создать телефонную страницу**

`PassportCapturePage` должна:

- читать `token` через `useParams`;
- хранить `status`: `idle`, `uploading`, `done`, `error`;
- отправлять `FormData` с полем `image`;
- использовать `rest(uploadPath, "POST", formData, false, { auth: false, bodyType: "formData", updateStore: false, responseType: "auto" })`;
- показывать `Фото принято. Можно вернуться к компьютеру.` после успешной загрузки;
- показывать ошибку backend или текст `Не удалось загрузить фото. Проверьте ссылку или попробуйте еще раз.`;
- использовать input `type="file" accept="image/*" capture="environment"`.

- [ ] **Шаг 2: Добавить route**

В `src/App.js` импортировать:

```javascript
import PassportCapturePage from "./components/customer/PassportCapturePage";
```

Добавить route до защищенных маршрутов:

```jsx
<Route path="/passport-capture/:token" element={<PassportCapturePage />} />
```

- [ ] **Шаг 3: Добавить стили телефонной страницы**

В `src/index.css` добавить:

```css
.passport-capture-page {}
.passport-capture-panel {}
.passport-capture-message {}
.passport-capture-error {}
```

Требования: страница на весь экран, контент по центру, максимальная ширина панели 420px, кнопка удобна для нажатия на телефоне.

- [ ] **Шаг 4: Проверить сборку**

```bash
npm run build
```

Ожидаемо: сборка завершается успешно.

- [ ] **Шаг 5: Коммит**

```bash
git add src/components/customer/PassportCapturePage.js src/App.js src/index.css
git commit -m "Add passport capture phone page"
```

---

### Задача 7: Ручная end-to-end проверка

**Файлы:**
- Исходные файлы не менять, если проверка не найдет ошибку.

- [ ] **Шаг 1: Запустить dev server**

```bash
npm start
```

Ожидаемо: React dev server запускается и показывает локальный URL.

- [ ] **Шаг 2: Проверить fallback с компьютера**

Открыть `/pledges`, начать новый залог, нажать `Документ`, выбрать `Загрузить с компьютера` и загрузить изображение паспорта.

Ожидаемо: существующий OCR endpoint заполняет поля клиента или показывает прежнее warning/error-поведение.

- [ ] **Шаг 3: Проверить создание QR-сессии**

Нажать `Документ` и запустить сценарий съемки с телефона.

Ожидаемо: QR-диалог открывается и показывает backend `capture_url`.

- [ ] **Шаг 4: Проверить загрузку на телефонной странице**

Открыть `capture_url` на телефоне или в desktop-браузере, выбрать изображение и отправить.

Ожидаемо: телефонная страница показывает `Фото принято. Можно вернуться к компьютеру.`

- [ ] **Шаг 5: Проверить заполнение desktop через WebSocket**

При открытом QR-диалоге дождаться backend-события `passport_ocr_session`.

Ожидаемо: desktop заполняет `fio`, `birthday`, `birth_place`, `doc_sn`, `doc_date`, `doc_division_name`, `doc_division_code`, `address`, закрывает QR-диалог или отмечает его завершенным и позволяет продолжить создание залога.

- [ ] **Шаг 6: Проверить игнорирование устаревшей сессии**

Создать QR-сессию, отменить ее, затем отправить с backend payload для отмененной сессии.

Ожидаемо: текущая форма клиента не меняется.

- [ ] **Шаг 7: Финальная сборка**

```bash
npm run build
```

Ожидаемо: сборка завершается успешно.

- [ ] **Шаг 8: Коммит исправлений, если проверка их потребовала**

Если проверка потребовала исправления:

```bash
git add src/components/customer src/reducers/app.js src/App.js src/constants.js src/index.css package.json package-lock.json
git commit -m "Fix passport QR OCR verification issues"
```

Если исправлений не было, пустой коммит не создавать.
