import React, {useState} from 'react';
import {Checkbox, FormControlLabel} from '@mui/material';
import Inventory from './Inventory';
import BarcodeInventoryPage from './BarcodeInventoryPage';

const UnifiedInventory = props => {
    const [scannerEnabled, setScannerEnabled] = useState(false);

    return <>
        <FormControlLabel
            control={<Checkbox checked={scannerEnabled} onChange={event => setScannerEnabled(event.target.checked)}/>}
            label="Включить сканер"
        />
        {scannerEnabled
            ? <BarcodeInventoryPage {...props}/>
            : <Inventory {...props}/>
        }
    </>;
};

export default UnifiedInventory;
