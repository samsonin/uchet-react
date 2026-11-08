import { getPrintPageDimensions, getPrintPageStyle } from "./PrintSettings";

export const MAX_PRICE_TAG_COPIES = 999;
const priceFormat = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});
const printPriceFormat = new Intl.NumberFormat("ru-RU", {
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
export const formatPriceTagPrice = price => priceFormat.format(price);

const getArrivalDate = good => {
    if (Number(good.unix) > 0) {
        const date = new Date(Number(good.unix) * 1000);
        if (Number.isFinite(date.getTime())) {
            return [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, "0"),
                String(date.getDate()).padStart(2, "0"),
            ].join("-");
        }
    }
    return /^(?!0000)\d{4}-\d{2}-\d{2}(?=$|[T ])/.exec(good.time ?? "")?.[0] ?? "";
};

export const getProductPriceTag = good => {
    const name = String(good?.model ?? "").trim();
    const rawPrice = good?.sum;
    const price = Number(rawPrice);

    if (!good?.barcode || !name || !["number", "string"].includes(typeof rawPrice)
        || String(rawPrice).trim() === "" || !Number.isFinite(price) || price < 0) {
        return null;
    }

    const note = String(good.public_note ?? "").trim();
    const country = /(?:^|\n)[ \t]*Страна(?: производства)?[ \t]*:[ \t]*([^\r\n]+)/i.exec(note);
    return {
        id: String(good.barcode),
        name,
        price,
        copies: 1,
        code: String(good.id ?? ""),
        arrivalDate: getArrivalDate(good),
        specs: country ? note.replace(country[0], "").trim() : note,
        country: country?.[1].trim() ?? "",
    };
};

export const mergePriceTags = (items, additions) => {
    const byId = new Map(items.map(item => [item.id, item]));

    additions.forEach(item => {
        const previous = byId.get(item.id);
        if (!previous?.edited) {
            byId.set(item.id, { ...item, copies: previous?.copies ?? item.copies });
        }
    });

    return [...byId.values()];
};

const sheetMargin = 5;

export const getPriceTagLayout = settings => {
    const { width, height } = getPrintPageDimensions(settings);
    const { margin } = settings;
    if (![width, height, margin].every(Number.isFinite)
        || margin < 0 || Math.min(width, height) <= 2 * margin) return null;

    const columns = Math.floor((210 - 2 * sheetMargin) / width);
    const rows = Math.floor((297 - 2 * sheetMargin) / height);
    return { width, height, margin, columns, sheetCapacity: columns * rows };
};

const element = (doc, className, value = "") => {
    const node = doc.createElement("div");
    node.className = className;
    node.textContent = value;
    return node;
};

const fitText = (targetWindow, node, minimumSize = 1) => {
    if (!node.clientWidth || !node.clientHeight) return;
    let fontSize = parseFloat(targetWindow.getComputedStyle(node).fontSize);
    while (fontSize > minimumSize
        && (node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight)) {
        fontSize = Math.max(minimumSize, fontSize * 0.9);
        node.style.fontSize = fontSize + "px";
    }
};

export function renderPriceTags(targetWindow, items, settings, onSheet, { seller = "", previewPage } = {}) {
    const layout = getPriceTagLayout(settings);
    if (!items.length || !layout || (onSheet && !layout.sheetCapacity)) return false;

    const { document: doc } = targetWindow;
    doc.title = "Ценники";
    doc.documentElement.lang = "ru";
    const { width, height, margin, columns, sheetCapacity } = layout;
    const perPage = onSheet ? sheetCapacity : 1;
    const isPreview = previewPage !== undefined;
    const pageSettings = onSheet
        ? { preset: "a4", orientation: "portrait", margin: sheetMargin }
        : { ...settings, margin: 0 };
    const contentSize = Math.min(width - 2 * margin, height - 2 * margin);
    const padding = Math.min(1.3, contentSize / 12);

    let style = doc.getElementById("price-tag-styles");
    if (!style) {
        style = doc.createElement("style");
        style.id = "price-tag-styles";
        doc.head.append(style);
    }
    style.textContent = `
        ${getPrintPageStyle(pageSettings)}
        body { margin: 0; color: black; font-family: Arial, sans-serif; }
        .price-tag-preview { background: #e4e7eb; padding: 12px; }
        .price-tag-page {
            display: grid;
            grid-template-columns: repeat(${onSheet ? columns : 1}, ${width}mm);
            grid-auto-rows: ${height}mm;
            align-content: start;
            break-inside: avoid;
        }
        .price-tag-preview .price-tag-page {
            box-sizing: border-box;
            background: white;
            width: ${onSheet ? 210 : width}mm;
            min-height: ${onSheet ? 297 : height}mm;
            padding: ${onSheet ? sheetMargin : 0}mm;
            margin: 0 auto;
        }
        .price-tag-page + .price-tag-page { break-before: page; }
        .price-tag {
            box-sizing: border-box;
            padding: ${margin + padding * 0.65}mm ${margin + padding}mm ${margin + padding * 0.55}mm;
            display: grid;
            grid-template-rows: 6% 7% 23% minmax(0, 1fr);
            line-height: 1.13;
            overflow: hidden;
            outline: 0.15mm solid black;
            outline-offset: -0.15mm;
        }
        .price-tag-meta, .price-tag-seller { font-size: ${contentSize * 0.038}mm; overflow: hidden; }
        .price-tag-meta { display: flex; justify-content: space-between; white-space: nowrap; }
        .price-tag-seller { text-align: center; white-space: nowrap; text-overflow: ellipsis; }
        .price-tag-name {
            display: grid;
            align-content: safe center;
            text-align: center;
            overflow: hidden;
            overflow-wrap: anywhere;
            font-weight: 700;
            font-size: ${contentSize * 0.108}mm;
        }
        .price-tag-body {
            display: grid;
            grid-template-columns: minmax(0, 53fr) minmax(0, 47fr);
            grid-template-rows: minmax(0, 1fr) auto;
            column-gap: ${contentSize * 0.015}mm;
        }
        .price-tag-specs {
            grid-area: 1 / 1;
            align-content: safe end;
            white-space: pre-line;
            overflow-wrap: anywhere;
            overflow: hidden;
            font-size: ${contentSize * 0.068}mm;
        }
        .price-tag-code {
            grid-area: 2 / 1;
            font-size: ${contentSize * 0.074}mm;
            margin-top: ${contentSize * 0.034}mm;
            white-space: nowrap;
            overflow: hidden;
        }
        .price-tag-price {
            grid-area: 1 / 2 / 3 / 3;
            align-self: end;
            display: flex;
            justify-content: safe end;
            align-items: end;
            gap: .06em;
            white-space: nowrap;
            font-size: ${contentSize * 0.224}mm;
            line-height: 1;
            padding-bottom: .07em;
        }
        .price-tag-rubles { font-family: Impact, "Arial Narrow", Arial, sans-serif; }
        .price-tag-fraction { text-align: center; font-size: .32em; }
        .price-tag-cents { padding-bottom: .06em; border-bottom: 0.12mm solid black; }
        .price-tag-currency { font-size: .78em; padding-top: .1em; }
    `;

    const firstCopy = isPreview ? previewPage * perPage : 0;
    const lastCopy = isPreview ? firstCopy + perPage : Infinity;
    const pages = doc.createDocumentFragment();
    const labels = [];
    let page;
    let offset = 0;
    for (const item of items) {
        const from = Math.max(offset, firstCopy);
        const to = Math.min(offset + item.copies, lastCopy);
        offset += item.copies;
        if (from >= lastCopy) break;
        if (from >= to) continue;

        const [rubles, cents] = printPriceFormat.format(item.price).split(",");
        const oldCode = /^(?:103100|112116|115104|116108)(\d{6})$/.exec(item.id)?.[1];
        const code = item.code ?? (oldCode ? String(Number(oldCode)) : "");
        const date = item.arrivalDate?.split("-").reverse().join(".") ?? "";

        for (let copy = from; copy < to; copy++) {
            if (copy % perPage === 0) {
                page = element(doc, "price-tag-page");
                pages.append(page);
            }
            const label = element(doc, "price-tag");
            const name = element(doc, "price-tag-name", item.name);
            const specs = element(doc, "price-tag-specs", item.specs);
            const price = element(doc, "price-tag-price");
            price.setAttribute("aria-label", formatPriceTagPrice(item.price));
            const fraction = element(doc, "price-tag-fraction");
            fraction.append(element(doc, "price-tag-cents", cents), element(doc, "price-tag-currency", "руб."));
            price.append(element(doc, "price-tag-rubles", rubles), fraction);
            const codeLine = element(doc, "price-tag-code", code && "Код: ");
            if (code) {
                const number = doc.createElement("strong");
                number.textContent = code;
                codeLine.append(number);
            }
            const body = element(doc, "price-tag-body");
            body.append(specs, codeLine, price);
            const meta = element(doc, "price-tag-meta");
            meta.append(element(doc, "price-tag-country", item.country), element(doc, "price-tag-date", date));
            label.append(meta, element(doc, "price-tag-seller", seller), name, body);
            page.append(label);
            labels.push({ name, specs, price });
        }
    }
    doc.body.classList.toggle("price-tag-preview", isPreview);
    doc.body.replaceChildren(pages);

    labels.forEach(({ name, specs, price }) => {
        fitText(targetWindow, name);
        fitText(targetWindow, specs, contentSize * 0.15);
        fitText(targetWindow, price);
    });
    return true;
}

export function printPriceTags(items, settings, onSheet, options) {
    const layout = getPriceTagLayout(settings);
    if (!items.length || !layout || (onSheet && !layout.sheetCapacity)) return false;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return false;
    printWindow.opener = null;
    renderPriceTags(printWindow, items, settings, onSheet, options);
    printWindow.addEventListener("afterprint", () => printWindow.close(), { once: true });
    printWindow.focus();
    printWindow.print();
    return true;
}
