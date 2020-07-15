import React from "react";

const JsBarcode = require('jsbarcode');

const barcodes = [
    '123456789012',
    '092345676583',
    '257247525754',
]

export default class extends React.Component {

    componentDidMount() {

        barcodes.map((v, i) => {

            JsBarcode("#barcode" + i, v, {
                    format: "EAN13",
                    width: 1,
                    height: 45,
                    displayValue: false
                }
            );

        })

    }

    render() {

        return <div style={{
            width: "32mm",
        }}>
            {barcodes.map((v, i) => <svg id={"barcode" + i}
                     style={{
                         overflow: "hidden",
                         position: "relative",
                         width: "30mm",
                         height: "20mm",
                     }}
                     key={"bcheirun" + i}
                />)}
        </div>
    }
}