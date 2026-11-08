import React, { act } from "react";
import { createRoot } from "react-dom/client";
import GoodActions from "./Good/GoodActions";
import Store from "./Store";
import rest from "./Rest";
import { PriceTagQueueProvider } from "./common/PriceTagQueue";

jest.mock("react-redux", () => ({ connect: () => Component => Component }));
jest.mock("notistack", () => ({ useSnackbar: () => ({ enqueueSnackbar: jest.fn() }) }));
jest.mock("./Rest", () => jest.fn());
jest.mock("../store", () => ({ dispatch: jest.fn() }));
jest.mock("./common/CategoryHandler", () => () => null);

test("showcase phones and laptops print together with their own retail prices", async () => {
    const goods = [
        { id: 101, barcode: "115104000101", category_id: 5, model: "Apple iPhone 13 128 ГБ", sum: 24900, cost: 16000, stock_id: 7 },
        { id: 102, barcode: "115104000102", category_id: 5, model: "Apple iPhone 13 128 ГБ", sum: 27900, cost: 18000, stock_id: 7 },
        { id: 103, barcode: "115104000103", category_id: 38, model: "Lenovo IdeaPad Slim 3", public_note: "Страна: Китай\nRyzen 5\n16 ГБ · SSD 512 ГБ", unix: new Date(2026, 10, 1, 12).getTime() / 1000, sum: 42900, cost: 30000, stock_id: 7 },
    ];
    rest.mockResolvedValue({ status: 200, body: goods });
    const props = {
        app: { current_stock_id: 7, stocks: [{ id: 7, is_valid: true }], docs: [] },
        auth: { admin: false },
    };

    const container = document.body.appendChild(document.createElement("div"));
    const root = createRoot(container);
    const click = element => act(async () => element.click());
    const button = title => [...document.querySelectorAll("button")].find(el => el.textContent === title);
    const field = label => document.getElementById(
        [...document.querySelectorAll("label")].find(el => el.textContent.startsWith(label)).htmlFor
    );
    const fill = (label, value) => act(async () => {
        const input = field(label);
        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), "value").set.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const printWindow = {
        document: document.implementation.createHTMLDocument(),
        getComputedStyle: () => ({ fontSize: "10px" }),
        addEventListener: jest.fn(),
        focus: jest.fn(),
        print: jest.fn(),
    };
    const openWindow = jest.spyOn(window, "open").mockReturnValue(printWindow);
    const previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    try {
        await act(async () => root.render(
            <PriceTagQueueProvider scope="test:flow">
                <GoodActions {...props} app={{ ...props.app, good: goods[0] }} />
                <Store {...props} />
            </PriceTagQueueProvider>
        ));
        await click(document.querySelector('button[aria-label="Ценник"]'));
        await click(button("Предпросмотр"));
        expect(document.querySelector("iframe").contentDocument.querySelector(".price-tag-name").textContent)
            .toBe(goods[0].model);
        await click(button("Закрыть"));
        await click([...container.querySelectorAll("label")].find(el => el.textContent === "Сгруппировать")
            .querySelector("input"));
        await click(container.querySelector(`input[aria-label="Выбрать для ценника — ${goods[0].model}"]`));
        await click(container.querySelector(`input[aria-label="Выбрать для ценника — ${goods[2].model}"]`));
        await click(button("Добавить в ценники (3)"));
        await click(button("Ценники (3)"));

        await click(document.querySelector('button[aria-label="Редактировать ценник — Lenovo IdeaPad Slim 3, № 103"]'));
        expect(field("Дата поступления").value).toBe("2026-11-01");
        expect(field("Код товара").value).toBe("103");
        expect(field("Страна производства").value).toBe("Китай");
        expect(field("Характеристики").value).toBe("Ryzen 5\n16 ГБ · SSD 512 ГБ");
        await fill("Название", "Lenovo IdeaPad");
        await fill("Цена, ₽", "41 900,50");
        await fill("Код товара", "103-В");
        await fill("Дата поступления", "2026-11-02");
        await fill("Страна производства", "Вьетнам");
        await fill("Характеристики", "Ryzen 5\nSSD 512 ГБ");
        await click(button("Сохранить в черновик"));
        await click(button("Предпросмотр"));
        const previewLabels = [...document.querySelector("iframe").contentDocument.querySelectorAll(".price-tag")];
        expect(previewLabels).toHaveLength(3);
        await click(button("Печать (3)"));

        const labels = [...printWindow.document.querySelectorAll(".price-tag")].map(label => [
            label.querySelector(".price-tag-name").textContent,
            label.querySelector(".price-tag-price").getAttribute("aria-label").replace(/\s/g, " "),
        ]);
        expect(printWindow.document.querySelectorAll(".price-tag")[2].outerHTML).toBe(previewLabels[2].outerHTML);
        expect(previewLabels[2].querySelector(".price-tag-code").textContent).toBe("Код: 103-В");
        expect(previewLabels[2].querySelector(".price-tag-specs").textContent).toBe("Ryzen 5\nSSD 512 ГБ");
        expect(previewLabels[2].querySelector(".price-tag-country").textContent).toBe("Вьетнам");
        expect(previewLabels[2].querySelector(".price-tag-date").textContent).toBe("02.11.2026");
        expect(labels).toEqual([
            [goods[0].model, "24 900 ₽"],
            [goods[1].model, "27 900 ₽"],
            ["Lenovo IdeaPad", "41 900,5 ₽"],
        ]);
        expect(printWindow.print).toHaveBeenCalledTimes(1);
    } finally {
        await act(async () => root.unmount());
        container.remove();
        localStorage.removeItem("uchet-price-tags-test:flow");
        openWindow.mockRestore();
        global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
});
