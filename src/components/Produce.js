import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {GoodSearch} from "./common/GoodSearch";
import {Table, TableCell, TableRow, Typography} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TwoLineInCell from "./common/TwoLineInCell";
import {toLocalTimeStr} from "./common/Time";
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from "@material-ui/icons/Cancel";
import GoodsTable from "./common/CostsTable";

const Produce = props => {

    const [goods, setGoods] = useState([])

    const onSelected = (good, afterRes) => {

        setGoods(prev => {

            const next = [...prev]
            next.push(good)
            return next

        })

        afterRes(true)

    }

    const delGood = barcode => {

        setGoods(prev => {

            const next = prev.filter(g => g.barcode !== barcode)

            console.log(prev, next)

            return next

        })


    }

    return <div style={{
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: '1rem'
    }}>

        <GoodsTable goods={goods}
                    delGood={delGood}
                    providers={props.app.providers}
        />

        <GoodSearch onSelected={onSelected}/>

        <Typography variant="subtitle1">
            Работа
        </Typography>


    </div>

}

export default connect(state => state)(Produce)