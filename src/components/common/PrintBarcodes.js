import React from "react";
import Barcode from 'react-barcode';
import uuid from "uuid";


export function PrintBarcodes(barcodes, afterPrint) {

    const printable = document.getElementsByClassName('printable')

    for (let i = 0; i < printable.length; i++) {
        printable[i].remove()
    }


    const div = document.createElement('div')
    div.className = 'printable'

    const bc = <Barcode
        value={barcodes[0].toString()}
    />

    div.append(bc)

    console.log(typeof bc, bc)

    // div.append(barcodes.map(b => {
    //
    //     console.log(b)
    //
    //     return <div
    //         key={uuid()}
    //     >
    //         <Barcode
    //             value={b.toString()}
    //             // format={'EAN13'}
    //             // displayValue={false}
    //         />
    //     </div>
    // }))

    document.body.append(div)

    if (typeof (afterPrint) === "function") window.onafterprint = () => afterPrint()

    window.print()

    window.onafterprint = null

    // div.remove()

}