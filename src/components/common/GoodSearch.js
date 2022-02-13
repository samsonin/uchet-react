import React, {useState} from "react";
import {InputAdornment, List, ListItem, ListItemText} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import TextField from "@material-ui/core/TextField/TextField";
import {useSnackbar} from "notistack";

import rest from "../Rest";
import SearchIcon from "@material-ui/icons/Search";


export const GoodSearch = ({onSelected}) => {

    const [code, setCode] = useState('')
    const [goods, setGoods] = useState([])

    const {enqueueSnackbar} = useSnackbar()

    const searchGood = () => {

        rest('goods?code=' + code)
            .then(res => res.status === 200 && res.body.length
                ? setGoods(res.body)
                : enqueueSnackbar('Не найдено', {variant: 'error'})
            )

    }

    const afterRes = (isOk, error) => {
        if (isOk) {
            setGoods([])
            setCode('')
        } else {
            enqueueSnackbar('ошибка ' + error, {variant: "error"})
        }
    }

    return <div style={{
        weight: '100%',
        margin: '1rem',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
    }}>
        {goods.length
            ? <>
                <List>
                    {goods.map(g => <ListItem key={'listitemkeyinordercost' + g.barcode}
                                               button
                                               onClick={() => onSelected(g, afterRes)}
                        >
                            <ListItemText
                                primary={g.model}
                                secondary={g.remcost || g.cost}
                            />
                        </ListItem>
                    )}
                </List>
                <Button style={{margin: '1rem'}}
                        variant='outlined'
                        onClick={() => setGoods([])}
                        color="primary">
                    <ArrowBackIcon/>
                </Button>
            </>
            : <>
                <TextField
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                    }}
                    label="код или штрихкод"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                />
                <Button variant='outlined'
                        onClick={() => searchGood()}
                        color="primary">
                    Найти
                </Button>
            </>}
    </div>

}