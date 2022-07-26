import JsBarcode from 'jsbarcode';

export function PrintBarcodes(barcodes, afterPrint) {

    const printable = document.getElementsByClassName('printable')

    for (let i = 0; i < printable.length; i++) {
        printable[i].remove()
    }

    const div = document.createElement('div')
    div.className = 'printable'

    // заглушка
    // barcodes = ['103100123123', '013186398723', '187354915734']

    barcodes.map(b => {

        const svg = document.createElement('svg')
        svg.className = "barcode"
        svg.setAttribute("jsbarcode-value", b)
        div.appendChild(svg)

    })

    document.body.append(div)

    JsBarcode(".barcode").init();

    if (typeof (afterPrint) === "function") window.onafterprint = () => afterPrint()

    window.print()

    window.onafterprint = null

    div.remove()

}