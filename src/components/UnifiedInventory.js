import React, {useEffect, useState} from 'react';
import {Checkbox, FormControlLabel} from '@mui/material';
import Inventory from './Inventory';
import BarcodeInventoryPage from './BarcodeInventoryPage';

const UnifiedInventory = props => {
    const [scannerEnabled, setScannerEnabled] = useState(false);

    useEffect(() => {
        if (!scannerEnabled && props.newScan) props.setOurBarcode?.();
    }, [props.newScan, props.setOurBarcode, scannerEnabled]);

    return <>
        <FormControlLabel
            control={<Checkbox checked={scannerEnabled} onChange={event => setScannerEnabled(event.target.checked)}/>}
            label={'\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0441\u043a\u0430\u043d\u0435\u0440'}
        />
        {scannerEnabled
            ? <BarcodeInventoryPage {...props}/>
            : <Inventory {...props}/>
        }
    </>;
};

export default UnifiedInventory;
