import React, { act } from "react";
import { createRoot } from "react-dom/client";
import QrPaymentPage from "./QrPaymentPage";
import { fetchPaymentSession } from "./qrPayment";

jest.mock("./qrPayment", () => ({ ...jest.requireActual("./qrPayment"), fetchPaymentSession: jest.fn() }));
jest.mock("../../constants", () => ({ SERVER: "https://api.example.test" }));
jest.mock("qrcode.react", () => ({ QRCodeCanvas: () => null, QRCodeSVG: () => null }));
jest.mock("@mui/material/Button", () => ({ __esModule: true, default: ({ children, href, onClick }) =>
    require("react").createElement("a", { href, onClick }, children) }));
jest.mock("@mui/material/Typography", () => ({ __esModule: true, default: ({ children }) =>
    require("react").createElement("div", null, children) }));
jest.mock("@mui/material/CircularProgress", () => ({ __esModule: true, default: () => null }));
jest.mock("@mui/icons-material/CheckCircleOutlined", () => ({ __esModule: true, default: () => null }));
jest.mock("@mui/icons-material/ErrorOutlineOutlined", () => ({ __esModule: true, default: () => null }));

const token = "a".repeat(43);
const returnUrl = `https://appblog.ru/pro?lang=ru&paid=1&payment=cp_${"b".repeat(48)}`;
const order = { status: "pending", orderNo: "17", amount: "299.00", currency: "RUB",
    qrPayload: "https://qr.nspk.ru/AD1", expiresAt: "2099-01-01T00:00:00Z" };
const answer = fields => ({ ok: true, status: 200, body: { ...order, ...fields } });
let root, container;
const tick = async () => { await act(async () => { jest.advanceTimersByTime(4000); }); };

beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    jest.useFakeTimers();
    fetchPaymentSession.mockReset();
    window.history.replaceState(null, "", `/#${token}&returnTo=${encodeURIComponent(returnUrl)}`);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
});
afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    jest.useRealTimers();
});

it("recovers from a first-load 503 automatically using the same order", async () => {
    fetchPaymentSession.mockResolvedValueOnce({ ok: false, status: 503 }).mockResolvedValue(answer({}));
    await act(async () => root.render(<QrPaymentPage />));
    expect(container.textContent).toContain("временно недоступен");
    await tick();
    expect(container.textContent).toContain("Код действует");
    expect(fetchPaymentSession).toHaveBeenCalledTimes(2);
    expect(fetchPaymentSession.mock.calls.every(call => call[0] === token)).toBe(true);
});

it("keeps the QR through a temporary error and waits for access before offering the paid key", async () => {
    fetchPaymentSession.mockResolvedValueOnce(answer({}))
        .mockResolvedValueOnce({ ok: false, status: 503 })
        .mockResolvedValueOnce(answer({ status: "paid", fulfilled: false }))
        .mockResolvedValue(answer({ status: "paid", fulfilled: true }));
    await act(async () => root.render(<QrPaymentPage />));
    await tick();
    expect(container.textContent).toContain("Код действует");
    await tick();
    expect(container.textContent).toContain("Ожидаем подтверждение выдачи доступа");
    expect(container.querySelector(`a[href="${returnUrl}"]`)).toBeNull();
    await tick();
    expect(container.textContent).toContain("Вернуться к подключению");
    expect(container.querySelector("a").href).toBe(returnUrl);
    await tick();
    expect(fetchPaymentSession).toHaveBeenCalledTimes(4);
});

it("does not start concurrent status requests when the browser resumes the page", async () => {
    let resolve;
    fetchPaymentSession.mockImplementation(() => new Promise(done => { resolve = done; }));
    await act(async () => root.render(<QrPaymentPage />));
    await act(async () => {
        window.dispatchEvent(new Event("pageshow"));
        window.dispatchEvent(new Event("pageshow"));
    });
    expect(fetchPaymentSession).toHaveBeenCalledTimes(1);
    await act(async () => resolve(answer({})));
});
