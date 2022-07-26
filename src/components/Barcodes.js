import React from "react";
import uuid from "uuid";
import Barcode from "react-barcode";


export const Barcodes = ({barcodes}) => barcodes.map(b => <Barcode
        value={b.toString()}
        format={'EAN13'}
        width={1.5}
        height={70}
        displayValue={false}
        key={uuid()}
    />
)