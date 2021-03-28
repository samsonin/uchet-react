import React from "react";
import {Button} from "@material-ui/core";
import './barcodes.css'

const Barcode = require('react-barcode');

const barcodes = [
    '123456789012',
    '092345676583',
    '257247525754',
]

export const Barcodes = () => {

    return <div
        style={{
            width: '30mm',
        }}
    >

        {barcodes.map(b => {
            return <div
                key={'barcodeskey' + b}
                className={'page-break'}
            >
                <Barcode
                    value={b}
                    format={'EAN13'}
                    width={1.4}
                    height={50}
                    margin={0}
                    padding={0}
                    displayValue={false}
                />
                <div
                    style={{
                        height: 5
                    }}
                />
            </div>
        })}

        <Button
            variant="contained"
            color="primary"
            onClick={() => window.print()}
            className={'d-print-none'}
            style={{
                margin: 20,
            }}
        >
            Печать
        </Button>

    </div>

}
