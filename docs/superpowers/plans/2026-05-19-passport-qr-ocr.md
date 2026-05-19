# Passport QR OCR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-time QR flow that lets an operator start passport OCR from `/pledges`, take the passport photo on a phone, and receive recognized fields on the desktop through the existing WebSocket app-state update flow.

**Architecture:** Keep `CustomerForm` as the owner of customer field state and document OCR UI state. Extract passport OCR normalization and session matching into a small helper module, allow the Redux app reducer to store `passport_ocr_session`, and add a reusable QR dialog plus a phone capture route that talks to backend session endpoints.

**Tech Stack:** React 19, React Router 7, Redux 5, MUI 9, notistack, existing `rest` helper, existing WebSocket adapter. Add `qrcode.react` or an equivalent small QR component dependency if the project does not already have one.

---

## File Structure

- Create `src/components/customer/passportOcr.js`: pure helpers for normalizing OCR payloads, reading session identity, and matching a WebSocket update to the active desktop session.
- Create `src/components/customer/passportOcr.test.js`: focused helper tests that do not need DOM rendering.
- Create `src/components/customer/PassportQrDialog.js`: desktop QR dialog with status text, QR code, short link, fallback upload, and cancel action.
- Create `src/components/customer/PassportCapturePage.js`: unauthenticated phone page opened by one-time token URL.
- Modify `src/components/customer/CustomerForm.js`: replace embedded OCR normalization with helper imports, add phone QR session creation, consume `props.passportOcrSession`, and keep current computer upload path.
- Modify `src/reducers/app.js`: allow `passport_ocr_session` through the shared app state.
- Modify `src/App.js`: add the phone capture route outside the authenticated app shell if route structure allows; otherwise add it before protected routes.
- Modify `src/constants.js`: add `PASSPORT_OCR_SESSION_PATH` with default `ocr/passport/sessions`.
- Modify `src/index.css`: add compact styles for the QR dialog and phone capture page.
- Modify `package.json` and lockfile: add QR rendering dependency if needed.

## Backend Assumptions

The plan assumes backend will expose these endpoints and WS payloads:

```text
POST /ocr/passport/sessions
POST /ocr/passport/sessions/:token/image
```

Desktop session response:

```json
{
  "session_id": "session-id",
  "token": "token",
  "capture_url": "https://uchet.store/passport-capture/token",
  "expires_at": "2026-05-19T09:10:00Z"
}
```

WebSocket app-state update:

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

### Task 1: Extract Passport OCR Helpers

**Files:**
- Create: `src/components/customer/passportOcr.js`
- Create: `src/components/customer/passportOcr.test.js`
- Modify: `src/components/customer/CustomerForm.js`

- [ ] **Step 1: Write helper tests**

Create `src/components/customer/passportOcr.test.js`:

```javascript
import {
    getPassportOcrSessionId,
    isMatchingPassportOcrSession,
    normalizePassportPayload,
} from "./passportOcr";

describe("passport OCR helpers", () => {
    it("normalizes fields from flat backend payload", () => {
        expect(normalizePassportPayload({
            full_name: " Иванов Иван Иванович ",
            birth_date: "1990-01-01",
            birthplace: "г. Владивосток",
            passport_number: "1234 567890",
            issue_date: "2020-01-01",
            issued_by: "ОВМ",
            department_code: "250-001",
            registration_address: "адрес",
        })).toEqual({
            fio: "Иванов Иван Иванович",
            birthday: "1990-01-01",
            birth_place: "г. Владивосток",
            doc_sn: "1234 567890",
            doc_date: "2020-01-01",
            doc_division_name: "ОВМ",
            doc_division_code: "250-001",
            address: "адрес",
        });
    });

    it("normalizes fields from nested backend payload", () => {
        expect(normalizePassportPayload({
            data: {
                fields: {
                    fio: "Петров Петр Петрович",
                    doc_sn: "1111 222222",
                },
            },
        })).toEqual({
            fio: "Петров Петр Петрович",
            doc_sn: "1111 222222",
        });
    });

    it("returns empty object for invalid payloads", () => {
        expect(normalizePassportPayload(null)).toEqual({});
        expect(normalizePassportPayload([])).toEqual({});
        expect(normalizePassportPayload({ fields: [] })).toEqual({});
    });

    it("reads session id from id, session_id, or token", () => {
        expect(getPassportOcrSessionId({ id: "a" })).toBe("a");
        expect(getPassportOcrSessionId({ session_id: "b" })).toBe("b");
        expect(getPassportOcrSessionId({ token: "c" })).toBe("c");
        expect(getPassportOcrSessionId(null)).toBe("");
    });

    it("matches incoming WS session with active desktop session", () => {
        expect(isMatchingPassportOcrSession(
            { id: "session-id" },
            { session_id: "session-id" }
        )).toBe(true);

        expect(isMatchingPassportOcrSession(
            { token: "token-a" },
            { token: "token-b" }
        )).toBe(false);
    });
});
```

- [ ] **Step 2: Run helper tests and verify they fail**

Run:

```bash
npm test -- --watchAll=false src/components/customer/passportOcr.test.js
```

Expected: FAIL because `./passportOcr` does not exist.

- [ ] **Step 3: Implement helper module**

Create `src/components/customer/passportOcr.js`:

```javascript
const passportFieldAliases = {
    fio: ["fio", "full_name", "name"],
    birthday: ["birthday", "birth_date", "date_of_birth"],
    birth_place: ["birth_place", "birthplace", "place_of_birth"],
    doc_sn: ["doc_sn", "passport_number", "series_number", "document_number"],
    doc_date: ["doc_date", "issue_date", "passport_issue_date"],
    doc_division_name: ["doc_division_name", "issued_by", "passport_issued_by"],
    doc_division_code: ["doc_division_code", "department_code", "passport_department_code"],
    address: ["address", "registration_address", "registered_address"],
};

export const normalizePassportPayload = body => {
    const source = body?.fields || body?.data?.fields || body?.data || body?.result || body;
    if (!source || typeof source !== "object" || Array.isArray(source)) return {};

    return Object.entries(passportFieldAliases).reduce((acc, [fieldName, aliases]) => {
        const value = aliases
            .map(alias => source[alias])
            .find(candidate => candidate !== undefined && candidate !== null && String(candidate).trim() !== "");

        if (value !== undefined) acc[fieldName] = String(value).trim();

        return acc;
    }, {});
};

export const getPassportOcrSessionId = session => {
    if (!session || typeof session !== "object") return "";
    return String(session.id || session.session_id || session.token || "");
};

export const isMatchingPassportOcrSession = (incomingSession, activeSession) => {
    const incomingId = getPassportOcrSessionId(incomingSession);
    const activeId = getPassportOcrSessionId(activeSession);

    return Boolean(incomingId && activeId && incomingId === activeId);
};
```

- [ ] **Step 4: Wire `CustomerForm` to helper without behavior change**

In `src/components/customer/CustomerForm.js`, add:

```javascript
import { normalizePassportPayload } from "./passportOcr";
```

Remove the local `passportFieldAliases` constant and local `normalizePassportPayload` function. Keep `handleDocumentPhoto` calling `normalizePassportPayload(res.body)`.

- [ ] **Step 5: Run helper tests and app smoke tests**

Run:

```bash
npm test -- --watchAll=false src/components/customer/passportOcr.test.js
```

Expected: PASS.

Run:

```bash
npm run build
```

Expected: build completes without import errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/customer/passportOcr.js src/components/customer/passportOcr.test.js src/components/customer/CustomerForm.js
git commit -m "Extract passport OCR helpers"
```

---

### Task 2: Store Passport OCR WebSocket Updates

**Files:**
- Modify: `src/reducers/app.js`
- Test: manual reducer check or existing app build

- [ ] **Step 1: Add reducer key**

In `src/reducers/app.js`, add `passport_ocr_session` to `initialState`:

```javascript
let initialState = {
    balance: 0,
    stocks: [],
    users: [],
    invites: [],
    orders: [],
    organization: [],
    config: [],
    docs: [],
    fields: [],
    providers: [],
    categories: [],
    contact_types: [],
    description_tolerance: {},
    payment_types: [],
    quick_texts: {},
    passport_ocr_session: null,
}
```

Add the same key to `probableKeys`:

```javascript
    'passport_ocr_session',
```

- [ ] **Step 2: Verify build**

Run:

```bash
npm run build
```

Expected: build completes.

- [ ] **Step 3: Commit**

```bash
git add src/reducers/app.js
git commit -m "Store passport OCR session updates"
```

---

### Task 3: Add Passport OCR Session Constants

**Files:**
- Modify: `src/constants.js`

- [ ] **Step 1: Add environment override**

In `src/constants.js`, add:

```javascript
const ENV_PASSPORT_OCR_SESSION_PATH = process.env.REACT_APP_PASSPORT_OCR_SESSION_PATH;
```

Then export:

```javascript
    PASSPORT_OCR_SESSION_PATH = ENV_PASSPORT_OCR_SESSION_PATH || 'ocr/passport/sessions',
```

Keep the existing `PASSPORT_OCR_PATH` export unchanged.

- [ ] **Step 2: Verify build**

Run:

```bash
npm run build
```

Expected: build completes.

- [ ] **Step 3: Commit**

```bash
git add src/constants.js
git commit -m "Add passport OCR session endpoint constant"
```

---

### Task 4: Add Desktop QR Dialog

**Files:**
- Create: `src/components/customer/PassportQrDialog.js`
- Modify: `src/index.css`
- Modify: `package.json`
- Modify: lockfile after install

- [ ] **Step 1: Add QR dependency if missing**

Run:

```bash
npm install qrcode.react
```

Expected: `package.json` and `package-lock.json` include `qrcode.react`.

- [ ] **Step 2: Create QR dialog component**

Create `src/components/customer/PassportQrDialog.js`:

```javascript
import React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { QRCodeSVG } from "qrcode.react";

const statusLabels = {
    waiting: "Ожидаем фото",
    uploaded: "Фото загружено",
    recognizing: "Распознаем",
    recognized: "Готово",
    error: "Ошибка",
    expired: "Ссылка истекла",
};

const progressStatuses = new Set(["waiting", "uploaded", "recognizing"]);

export default function PassportQrDialog({
    open,
    session,
    status = "waiting",
    error = "",
    onCancel,
    onComputerUpload,
}) {
    const captureUrl = session?.capture_url || "";
    const statusText = error || statusLabels[status] || statusLabels.waiting;

    return <Dialog open={open} onClose={onCancel} className="passport-qr-dialog">
        <DialogTitle>Фото паспорта с телефона</DialogTitle>
        <DialogContent className="passport-qr-dialog-content">
            {progressStatuses.has(status) && <LinearProgress className="passport-qr-progress" />}

            <div className="passport-qr-code-wrap">
                {captureUrl
                    ? <QRCodeSVG value={captureUrl} size={220} />
                    : <div className="passport-qr-placeholder" />}
            </div>

            <Typography className="passport-qr-status">{statusText}</Typography>

            {captureUrl && <Typography className="passport-qr-link">
                {captureUrl}
            </Typography>}
        </DialogContent>
        <DialogActions>
            <Button onClick={onComputerUpload}>
                Загрузить с компьютера
            </Button>
            <Button onClick={onCancel} color="secondary">
                Отменить
            </Button>
        </DialogActions>
    </Dialog>;
}
```

- [ ] **Step 3: Add dialog styles**

Append to `src/index.css`:

```css
.passport-qr-dialog-content {
    min-width: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.passport-qr-progress {
    width: 100%;
}

.passport-qr-code-wrap {
    width: 240px;
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--surface);
}

.passport-qr-placeholder {
    width: 220px;
    height: 220px;
    background: var(--line);
}

.passport-qr-status {
    text-align: center;
    font-weight: 600;
}

.passport-qr-link {
    max-width: 300px;
    overflow-wrap: anywhere;
    color: var(--text-secondary);
    text-align: center;
    font-size: .85rem;
}
```

- [ ] **Step 4: Verify build**

Run:

```bash
npm run build
```

Expected: build completes and QR import resolves.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/customer/PassportQrDialog.js src/index.css
git commit -m "Add passport QR dialog"
```

---

### Task 5: Connect QR Dialog To CustomerForm

**Files:**
- Modify: `src/components/customer/CustomerForm.js`

- [ ] **Step 1: Add imports**

In `src/components/customer/CustomerForm.js`, change constants/helper imports to:

```javascript
import { PASSPORT_OCR_PATH, PASSPORT_OCR_SESSION_PATH } from "../../constants";
import PassportQrDialog from "./PassportQrDialog";
import {
    isMatchingPassportOcrSession,
    normalizePassportPayload,
} from "./passportOcr";
```

- [ ] **Step 2: Add QR state**

Inside `CustomerForm`, after `isRecognizingDocument` state, add:

```javascript
const [isPassportQrOpen, setIsPassportQrOpen] = useState(false);
const [passportQrSession, setPassportQrSession] = useState(null);
const [passportQrStatus, setPassportQrStatus] = useState("waiting");
const [passportQrError, setPassportQrError] = useState("");
```

- [ ] **Step 3: Add shared apply function**

Before `handleDocumentPhoto`, add:

```javascript
const applyRecognizedPassportFields = recognizedFields => {
    if (!Object.keys(recognizedFields).length) return false;

    setCustomerPatch(recognizedFields);
    setIsDetails(true);
    return true;
};
```

Update the success path in `handleDocumentPhoto`:

```javascript
const recognizedFields = normalizePassportPayload(res.body);

if (!res.ok || !applyRecognizedPassportFields(recognizedFields)) {
    enqueueSnackbar("Не удалось распознать данные. Заполните поля вручную.", {
        variant: "warning",
    });
    return;
}

enqueueSnackbar("Данные документа распознаны.", {
    variant: "success",
});
```

- [ ] **Step 4: Add session creation handler**

Before `handleDocumentPhoto`, add:

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

- [ ] **Step 5: Add WebSocket session consumer**

Add this effect after existing effects:

```javascript
useEffect(() => {
    const incomingSession = props.passportOcrSession;

    if (!isPassportQrOpen || !isMatchingPassportOcrSession(incomingSession, passportQrSession)) return;

    if (incomingSession.status) setPassportQrStatus(incomingSession.status);

    if (incomingSession.status === "recognized") {
        const recognizedFields = normalizePassportPayload(incomingSession.fields || incomingSession);

        if (applyRecognizedPassportFields(recognizedFields)) {
            setPassportQrStatus("recognized");
            setIsPassportQrOpen(false);
            enqueueSnackbar("Данные документа распознаны.", {
                variant: "success",
            });
        } else {
            setPassportQrStatus("error");
            setPassportQrError("Не удалось распознать данные. Заполните поля вручную.");
        }
    }

    if (incomingSession.status === "error" || incomingSession.status === "expired") {
        setPassportQrError(incomingSession.error || "");
    }
}, [props.passportOcrSession, isPassportQrOpen, passportQrSession]);
```

- [ ] **Step 6: Add QR cancel/fallback handlers**

Before `renderCustomerField`, add:

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

- [ ] **Step 7: Change document button to QR entry point**

Change the document button click handler:

```javascript
onClick={openPassportQr}
```

Keep the hidden file input unchanged so `С компьютера` still works.

- [ ] **Step 8: Render QR dialog**

At the end of the returned JSX, before the closing root `</div>`, render:

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

- [ ] **Step 9: Map Redux state prop**

At the bottom of `CustomerForm.js`, update `connect`:

```javascript
export default connect(state => ({
    ...(state.app.fields || {}),
    contactTypes: state.app.contact_types || [],
    passportOcrSession: state.app.passport_ocr_session || null,
}))(CustomerForm);
```

- [ ] **Step 10: Verify build**

Run:

```bash
npm run build
```

Expected: build completes.

- [ ] **Step 11: Commit**

```bash
git add src/components/customer/CustomerForm.js
git commit -m "Connect customer form to passport QR OCR"
```

---

### Task 6: Add Phone Capture Page

**Files:**
- Create: `src/components/customer/PassportCapturePage.js`
- Modify: `src/App.js`
- Modify: `src/index.css`

- [ ] **Step 1: Create phone capture page**

Create `src/components/customer/PassportCapturePage.js`:

```javascript
import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { PASSPORT_OCR_SESSION_PATH } from "../../constants";
import rest from "../Rest";

export default function PassportCapturePage() {
    const { token } = useParams();
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    const uploadPath = useMemo(() => (
        `${PASSPORT_OCR_SESSION_PATH}/${encodeURIComponent(token || "")}/image`
    ), [token]);

    const handlePhoto = async event => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setStatus("uploading");
        setError("");

        const formData = new FormData();
        formData.append("image", file);

        const res = await rest(uploadPath, "POST", formData, false, {
            auth: false,
            bodyType: "formData",
            updateStore: false,
            responseType: "auto",
        });

        if (!res.ok) {
            setStatus("error");
            setError(res.body?.message || "Не удалось загрузить фото. Проверьте ссылку или попробуйте еще раз.");
            return;
        }

        setStatus("done");
    };

    return <main className="passport-capture-page">
        <section className="passport-capture-panel">
            <Typography variant="h5" component="h1">
                Фото паспорта
            </Typography>

            {status === "done"
                ? <Typography className="passport-capture-message">
                    Фото принято. Можно вернуться к компьютеру.
                </Typography>
                : <>
                    <Typography className="passport-capture-message">
                        Сделайте фото паспорта или выберите готовое изображение.
                    </Typography>
                    <Button
                        component="label"
                        variant="contained"
                        startIcon={status === "uploading" ? <CircularProgress size={18} /> : <CameraAltOutlinedIcon />}
                        disabled={status === "uploading" || !token}
                    >
                        {status === "uploading" ? "Загружаем..." : "Сделать фото"}
                        <input
                            hidden
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhoto}
                        />
                    </Button>
                </>}

            {error && <Typography className="passport-capture-error">
                {error}
            </Typography>}
        </section>
    </main>;
}
```

- [ ] **Step 2: Add route**

In `src/App.js`, import:

```javascript
import PassportCapturePage from "./components/customer/PassportCapturePage";
```

Add a route before authenticated app routes if possible:

```jsx
<Route path="/passport-capture/:token" element={<PassportCapturePage />} />
```

If all routes currently sit inside an authenticated wrapper, place this route before that wrapper so it is accessible without login.

- [ ] **Step 3: Add phone page styles**

Append to `src/index.css`:

```css
.passport-capture-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--bg);
    color: var(--text);
}

.passport-capture-panel {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: stretch;
}

.passport-capture-message {
    color: var(--text-secondary);
}

.passport-capture-error {
    color: var(--error);
}
```

- [ ] **Step 4: Verify build**

Run:

```bash
npm run build
```

Expected: build completes.

- [ ] **Step 5: Commit**

```bash
git add src/components/customer/PassportCapturePage.js src/App.js src/index.css
git commit -m "Add passport capture phone page"
```

---

### Task 7: Manual End-To-End Verification

**Files:**
- No planned source edits unless verification finds a bug.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm start
```

Expected: React dev server starts and shows a local URL.

- [ ] **Step 2: Verify desktop fallback still works**

Open `/pledges`, start a new pledge, click `Документ`, choose `Загрузить с компьютера`, and upload a passport image.

Expected: existing OCR endpoint fills customer fields or shows the same warning/error behavior as before.

- [ ] **Step 3: Verify QR session creation**

Click `Документ` and choose/trigger phone flow.

Expected: QR dialog opens and displays the backend `capture_url`.

- [ ] **Step 4: Verify phone page upload**

Open the `capture_url` on a phone or desktop browser, select an image, and submit.

Expected: phone page shows `Фото принято. Можно вернуться к компьютеру.`

- [ ] **Step 5: Verify WebSocket desktop fill**

With backend emitting `passport_ocr_session`, keep the QR dialog open on desktop until recognition completes.

Expected: desktop fills `fio`, `birthday`, `birth_place`, `doc_sn`, `doc_date`, `doc_division_name`, `doc_division_code`, and `address`, closes or marks the QR dialog complete, and lets the operator continue creating the pledge.

- [ ] **Step 6: Verify stale session ignore**

Create one QR session, cancel it, then have backend emit a payload for that canceled session.

Expected: the current customer form is not changed.

- [ ] **Step 7: Final build**

Run:

```bash
npm run build
```

Expected: build completes.

- [ ] **Step 8: Commit verification fixes if any**

If verification required fixes:

```bash
git add src/components/customer src/reducers/app.js src/App.js src/constants.js src/index.css package.json package-lock.json
git commit -m "Fix passport QR OCR verification issues"
```

If no fixes were needed, do not create an empty commit.
