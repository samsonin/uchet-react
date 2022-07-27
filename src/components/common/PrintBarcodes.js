import JsBarcode from 'jsbarcode';

const pStyle = "body {margin: 0, padding: 0} @page { size: 30mm 20mm; margin: 0; padding: 0} svg { overflow: hidden; position: relative; width: 28mm; height: 16mm; margin: 0; padding: 0; page-break-after: always; }"

export function PrintBarcodes(barcodes) {

    const newWin = window.open()
    const style = document.createElement('style')
    style.innerText = pStyle
    newWin.document.head.append(style)

    const div = document.createElement('div')

    barcodes.map(b => {

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