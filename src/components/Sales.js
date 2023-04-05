import React, {useState} from "react";
import {connect} from "react-redux";
import StocksCheck from "./common/StocksCheck";
import DateInterval from "./common/DateInterval";

const Sales = props => {

    const [stocks, setStocks] = useState(() => props.app.stocks
        .map(s => s.is_valid ? s.id : null)
        .filter(s => s))
    const [date1, setDate1] = useState()
    const [date2, setDate2] = useState()

    return <div
        style={{
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: '1rem'
        }}
    >

        <StocksCheck stocks={stocks} setStocks={setStocks}/>

        <DateInterval
            date1={date1}
            date2={date2}
            setDate1={setDate1}
            setDate2={setDate2}
        />


    </div>

}

export default connect(state => state)(Sales)