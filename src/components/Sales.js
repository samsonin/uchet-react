import React, {useState} from "react";
import {connect} from "react-redux";
import StocksCheck from "./common/StocksCheck";
import DateInterval from "./common/DateInterval";
import TextField from "@material-ui/core/TextField";
import {intInputHandler} from "./common/InputHandlers";
import UsersSelect from "./common/UsersSelect";
import {InputAdornment} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import ActionsSelect from "./common/ActionsSelect";


const Sales = props => {

    const [stocks, setStocks] = useState(() => props.app.stocks
        .map(s => s.is_valid ? s.id : null)
        .filter(s => s))
    const [date1, setDate1] = useState()
    const [date2, setDate2] = useState()
    const [action, setAction] = useState()
    const [str, setStr] = useState()
    const [sum, setSum] = useState()
    const [userId, setUserId] = useState()

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

        <ActionsSelect
            action={action}
            setAction={setAction}
        />

        <TextField
            autoFocus
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon/>
                    </InputAdornment>
                ),
            }}
            value={str}
            onChange={e => setStr(e.target.value)}
        />

        <TextField
            value={sum}
            onChange={e => intInputHandler(e.target.value, setSum)}
            label="Сумма"
        />

        <UsersSelect
            user={userId}
            users={props.app.users}
            setUser={setUserId}
            onlyValid
            classes="w-100 p-1 m-1"
            label="Сотрудник"
        />


    </div>

}

export default connect(state => state)(Sales)