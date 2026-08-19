import React, {useEffect, useState} from 'react';
import {Checkbox, FormControlLabel} from '@mui/material';
import Inventory from './Inventory';
import BarcodeInventoryPage from './BarcodeInventoryPage';

const UnifiedInventory = props => {
    const [onlyEquipment, setOnlyEquipment] = useState(false);

    useEffect(() => {
        if (onlyEquipment && props.newScan) props.setOurBarcode?.();
    }, [onlyEquipment, props.newScan, props.setOurBarcode]);

    return <>
        <FormControlLabel
            control={<Checkbox checked={onlyEquipment} onChange={event => setOnlyEquipment(event.target.checked)}/>}
            label="Только техника"
        />
        {onlyEquipment
            ? <Inventory {...props}/>
            : <BarcodeInventoryPage {...props}/>
        }
    </>;
};

export default UnifiedInventory;
