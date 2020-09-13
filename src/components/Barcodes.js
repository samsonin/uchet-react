import React from "react";
import {Button} from "@material-ui/core";

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
    {barcodes.map(b => <Barcode
      key={'barcodeskey' + b}
      value={b}
      format={'EAN13'}
      width={1}
      height={50}
    />)}

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
