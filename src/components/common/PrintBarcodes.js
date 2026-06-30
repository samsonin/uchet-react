import JsBarcode from 'jsbarcode';
import { getPrintPageDimensions, getPrintPageStyle, getSavedPrintSettings } from "./PrintSettings";

const getBarcodeStyle = settings => {
    const dimensions = getPrintPageDimensions(settings)
    const barcodeWidth = Math.max(dimensions.width - 2, 1)
    const barcodeHeight = Math.max(dimensions.height - 4, 1)

    return `
        body {
            margin: 0;
            padding: 0;
        }
        ${getPrintPageStyle(settings)}
        svg {
            height: ${barcodeHeight}mm;
            margin: 0;
            overflow: hidden;
            padding: 0;
            page-break-after: always;
            position: relative;
            width: ${barcodeWidth}mm;
        }
    `
}

export function PrintBarcodes(barcodes) {

    const printSettings = getSavedPrintSettings("barcode")

    const newWin = window.open()

    if (!newWin) return

    const style = document.createElement('style')
    style.innerText = getBarcodeStyle(printSettings)
    newWin.document.head.append(style)

    const div = document.createElement('div')

    barcodes.forEach(b => {

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute("class", "barcode")
        svg.setAttribute("jsbarcode-value", b)
        svg.setAttribute("jsbarcode-format", "EAN13")
        svg.setAttribute("jsbarcode-displayvalue", "false")
        div.appendChild(svg)

    })

    document.body.append(div)

    JsBarcode(".barcode").init()

    newWin.document.body.append(div)
    newWin.onafterprint = newWin.close
    newWin.print()

    div.remove()

}
