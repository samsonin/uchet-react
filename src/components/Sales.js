import React, {useState} from "react";
import {connect} from "react-redux";
import StocksCheck from "./common/StocksCheck";
import DateInterval from "./common/DateInterval";
import TextField from "@material-ui/core/TextField";
import {intInputHandler} from "./common/InputHandlers";
import UsersSelect from "./common/UsersSelect";
import {Button, InputAdornment} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import ActionsSelect from "./common/ActionsSelect";
import {useSnackbar} from "notistack";


const style = {
    width: '100%',
    margin: '.5em',
    padding: '.5em',
}

const Sales = props => {

    const [stocks, setStocks] = useState(() => props.app.stocks
        .map(s => s.is_valid ? s.id : null)
        .filter(s => s))
    const [date1, setDate1] = useState()
    const [date2, setDate2] = useState()
    const [action, setAction] = useState()
    const [str, setStr] = useState()
    const [sum, setSum] = useState(0)
    const [userId, setUserId] = useState()
    const [error, setError] = useState(false)

    const {enqueueSnackbar} = useSnackbar()

    const isEmpty = !(date1 || date2 || action || str || sum)
    const find = () => {

        if (isEmpty) {
            setError(true)
            return enqueueSnackbar('введите параметры поиска', {variant: 'error'})
        }

    }

    return <div
        style={{
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: '.5rem',
            paddingRight: '1rem'
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
            value={sum}
            onChange={e => intInputHandler(e.target.value, setSum)}
            style={style}
            label="Сумма"
        />

        <UsersSelect
            user={userId}
            users={props.app.users}
            setUser={setUserId}
            onlyValid
            classes="w-100"
            label="Сотрудник"
        />

        <TextField
            error={error}
            autoFocus
            style={style}
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

        <Button
            disabled={isEmpty}
            variant="contained"
            color="primary"
            style={style}
            onClick={() => find()}
        >
            Найти
        </Button>

    </div>

}

export default connect(state => state)(Sales)