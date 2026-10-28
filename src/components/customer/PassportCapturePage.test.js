import React, { act } from "react";
import { createRoot } from "react-dom/client";
import PassportCapturePage from "./PassportCapturePage";

jest.mock("react-router-dom", () => ({
    useParams: () => ({ token: "test-token" }),
}), { virtual: true });

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("passport photo capture", () => {
    let container;
    let root;
    let originalFetch;

    beforeEach(() => {
        jest.useFakeTimers();
        originalFetch = global.fetch;
        container = document.createElement("div");
        root = createRoot(container);
        act(() => root.render(<PassportCapturePage />));
    });

    afterEach(() => {
        act(() => root.unmount());
        global.fetch = originalFetch;
        jest.useRealTimers();
    });

    const choosePhoto = async () => {
        const input = container.querySelector('input[type="file"]');
        Object.defineProperty(input, "files", {
            configurable: true,
            value: [new File(["photo"], "passport.jpg", { type: "image/jpeg" })],
        });
        await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
    };

    it("waits for recognition that takes longer than thirty seconds", async () => {
        global.fetch = jest.fn((url, { signal }) => new Promise((resolve, reject) => {
            signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
            setTimeout(() => resolve({
                ok: true,
                status: 200,
                text: async () => JSON.stringify({ ok: true }),
            }), 45000);
        }));

        await choosePhoto();
        await act(async () => jest.advanceTimersByTime(31000));
        expect(container.textContent).toContain("Загружаем...");
        expect(container.textContent).not.toContain("Не удалось загрузить фото");

        await act(async () => jest.advanceTimersByTime(14000));
        expect(container.textContent).toContain("Фото принято");
    });

    it("explains when recognition exceeds the upload timeout", async () => {
        global.fetch = jest.fn((url, { signal }) => new Promise((resolve, reject) => {
            signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        }));

        await choosePhoto();
        await act(async () => jest.advanceTimersByTime(5 * 60 * 1000));

        expect(container.textContent).toContain("Сервер не успел обработать фото");
        expect(container.textContent).not.toContain("Фото принято");
    });

    it("keeps the server explanation for an expired link", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 410,
            text: async () => JSON.stringify({ message: "Сессия истекла" }),
        });

        await choosePhoto();

        expect(container.textContent).toContain("Сессия истекла");
        expect(container.textContent).not.toContain("Фото принято");
    });
});
