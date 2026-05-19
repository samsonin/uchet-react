# Passport QR OCR Design

## Goal

Make passport recognition in `/pledges` convenient when the operator works on a desktop computer. The operator should be able to start passport capture from the desktop, take a photo on a phone through a one-time QR link, and continue filling the pledge form on the desktop after the recognized fields arrive.

## User Flow

1. In the pledge customer block, the operator clicks `Документ`.
2. The desktop opens a dialog with a one-time QR code and a fallback action to upload a file from the computer.
3. The operator scans the QR code on a phone.
4. The phone opens a minimal capture page without account login.
5. The phone camera captures or selects a passport image and uploads it through the one-time token.
6. The backend runs the existing passport OCR.
7. The backend sends the recognized passport fields to the desktop through the existing WebSocket state update channel.
8. The desktop fills the current customer form and shows success or error status.

## Desktop UI

The current `Документ` button remains the entry point. For pledge creation and other editable customer forms, it should offer:

- `С телефона`: opens the QR dialog.
- `С компьютера`: keeps the current local file upload behavior.

The QR dialog should show the QR code, a short URL, expiration status, and recognition state:

- `Ожидаем фото`
- `Фото загружено`
- `Распознаем`
- `Готово`
- `Ошибка`
- `Ссылка истекла`

The dialog should have `Отменить` and `Загрузить с компьютера` actions.

## Phone UI

The phone page is opened by a one-time token URL. It should not require login. It should show only the capture flow:

- capture or select passport photo;
- upload progress;
- final message that the photo was accepted and the operator can return to the computer;
- later, a link to open the native app can be added to the same page.

The phone page should not show recognized passport data unless the backend explicitly needs it for confirmation later.

## Backend Contract

The frontend expects backend support for short-lived one-time sessions:

- `POST /ocr/passport/sessions` creates a session and returns `token`, `capture_url`, `expires_at`, and an optional `session_id`.
- `POST /ocr/passport/sessions/:token/image` accepts the phone image upload.
- The backend runs OCR using the same field shape already supported by the frontend passport parser.
- The backend emits a WebSocket app-state update containing the recognized passport fields and enough session identity for the frontend to apply it only to the matching open QR dialog.

Suggested WebSocket payload shape:

```json
{
  "passport_ocr_session": {
    "id": "session-id",
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

## Frontend Data Flow

`CustomerForm` owns the editable customer fields, so it should also own the QR OCR dialog state. It should:

1. Create an OCR session when the operator chooses phone capture.
2. Store the active session id or token locally.
3. Listen to the shared app state for matching `passport_ocr_session` updates.
4. Normalize the incoming fields with the same logic used by local file OCR.
5. Patch the current customer with recognized fields and expand detailed fields.
6. Ignore WebSocket OCR updates that do not match the active local session.

The existing direct file upload path should stay available and keep using `PASSPORT_OCR_PATH`.

## Security And Limits

- Tokens must be long random values, short-lived, and single-use.
- The capture URL must not contain recognized personal data.
- Uploads should enforce image MIME types and size limits.
- The backend should limit attempts per token.
- Expired or already used tokens should return a clear error for the phone page.
- Desktop should discard stale session updates after cancellation or expiration.

## Testing

Frontend tests should cover:

- local file OCR still patches customer fields;
- QR session creation opens the dialog;
- a matching WebSocket session update patches the customer;
- a non-matching session update is ignored;
- error and expiration statuses are displayed.

Manual verification should cover the full pledge flow: desktop opens QR, phone uploads image, desktop receives recognized fields, and pledge creation can continue without refreshing the page.
