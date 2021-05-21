import React from "react";
import './barcodes.css'

const Barcode = require('react-barcode');

export const Barcodes = ({barcodes}) => {

    return (barcodes && typeof (barcodes) === 'object')
        ? barcodes.map(b => <div
            key={'divinbarcodes' + b.toString()}
                className={'barcodes'}
            >
                <Barcode
                    value={b}
                    format={'EAN13'}
                    width={1.5}
                    height={70}
                    displayValue={false}
                    key={'barcodeskey' + b}
                />
            </div>
        )
        : null

}
