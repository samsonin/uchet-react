import React from "react";

import OrderInformation from "./OrderInformation";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";


export default function () {


    return <div
        style={{
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: '1rem'
        }}
    >

        <Typography variant="h6"
                    style={{
                        margin: '.8rem',
                    }}
        >
            Новый заказ
        </Typography>

        <OrderInformation/>

        <Button variant='outlined'
                onClick={() => {}}
                color="primary">
            Внести
        </Button>

    </div>
}