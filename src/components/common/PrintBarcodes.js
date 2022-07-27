import JsBarcode from 'jsbarcode';

export function PrintBarcodes(barcodes, afterPrint) {

    console.log(barcodes)

    const printable = document.getElementsByClassName('printable')

    for (let i = 0; i < printable.length; i++) {
        printable[i].remove()
    }

    const div = document.createElement('div')
    div.className = 'printable'

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