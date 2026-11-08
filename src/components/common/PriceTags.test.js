import { getDefaultPrintSettings } from "./PrintSettings";
import { getPriceTagLayout, getProductPriceTag, mergePriceTags, printPriceTags } from "./PriceTags";

const settings = getDefaultPrintSettings("priceTag");

afterEach(() => jest.restoreAllMocks());

const mockPrintWindow = () => {
    const popup = {
        document: document.implementation.createHTMLDocument(),
        getComputedStyle: () => ({ fontSize: "10px" }),
        addEventListener: jest.fn(),
        focus: jest.fn(),
        print: jest.fn(),
    };
    jest.spyOn(window, "open").mockReturnValue(popup);
    return popup;
};

it("uses the retail price and refreshes an existing label without changing its copy count", () => {
    const good = { id: 101, barcode: 101, model: "Чехол", sum: "499.50", cost: 120, public_note: "Страна: Китай\nСиликон\nЧёрный" };
    const first = getProductPriceTag(good);

    expect(first).toEqual({ id: "101", name: "Чехол", price: 499.5, copies: 1, code: "101", arrivalDate: "", specs: "Силикон\nЧёрный", country: "Китай" });
    expect(getProductPriceTag({ ...good, sum: "" })).toBeNull();
    expect(getProductPriceTag({ ...good, sum: 0 })).toMatchObject({ price: 0 });
    expect(mergePriceTags([{ ...first, copies: 3 }], [getProductPriceTag({ ...good, sum: 550 })]))
        .toEqual([{ ...first, price: 550, copies: 3 }]);
    const edited = { ...first, price: 475, edited: true };
    expect(mergePriceTags([edited], [getProductPriceTag({ ...good, sum: 550 })])).toEqual([edited]);
});

it("uses the saved orientation and rejects dimensions with no space inside the margins", () => {
    expect(getPriceTagLayout(settings)).toMatchObject({ width: 40, height: 50 });
    expect(getPriceTagLayout({ ...settings, width: 55, height: 25, orientation: "landscape" }))
        .toMatchObject({ width: 25, height: 55 });
    expect(getPriceTagLayout({ ...settings, margin: 20 })).toBeNull();
    expect(getPriceTagLayout({ ...settings, preset: "a4" })).toMatchObject({ sheetCapacity: 0 });
});

it("puts all copies in one print job and starts a new A4 page when the first one fills", () => {
    const popup = mockPrintWindow();
    const { columns, sheetCapacity } = getPriceTagLayout(settings);
    expect(columns).toBe(5);
    const name = 'Кабель <b>USB-C</b>';
    const items = [{ id: "1", name, price: 1299.5, copies: sheetCapacity + 1 }];

    expect(printPriceTags(items, settings, true)).toBe(true);
    const pages = popup.document.querySelectorAll(".price-tag-page");
    expect(pages).toHaveLength(2);
    expect(pages[0].children).toHaveLength(sheetCapacity);
    expect(pages[1].children).toHaveLength(1);
    expect(pages[1].querySelector(".price-tag-name").textContent).toBe(name);
    expect(pages[1].querySelector("b")).toBeNull();
    expect(pages[1].querySelector(".price-tag-rubles").textContent).toBe("1299");
    expect(pages[1].querySelector(".price-tag-cents").textContent).toBe("50");
    expect(pages[1].querySelector(".price-tag-currency").textContent).toBe("руб.");
    expect(popup.document.head.textContent).toContain("size: A4 portrait");
    expect(popup.print).toHaveBeenCalledTimes(1);
});

it("prints individual labels on pages matching the configured label size", () => {
    const popup = mockPrintWindow();
    const items = [{ id: "1", name: "Стекло", price: 100, copies: 2 }];
    expect(printPriceTags(items, { ...settings, width: 55, height: 25, orientation: "landscape" }, false))
        .toBe(true);

    expect(popup.document.querySelectorAll(".price-tag-page")).toHaveLength(2);
    expect(popup.document.head.textContent).toContain("size: 25mm 55mm");
});
