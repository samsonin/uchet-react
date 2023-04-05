import React, {useRef, useState} from "react";
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

    const isRest = useRef(false)

    const {enqueueSnackbar} = useSnackbar()

    const afterRes = (isOk, error) => {
        if (isOk) {
            setGoods([])
            setCode('')
        } else {
            enqueueSnackbar('ошибка ' + error, {variant: "error"})
        }
    }

    const selectHandler = g => {

        if (isRest.current) return
        isRest.current = true

        onSelected(g, afterRes)

    }

    const searchGood = () => {

        rest('goods?code=' + code)
            .then(res => {

                isRest.current = false

                if (res.status === 200 && res.body.length) {

                        if (res.body.length === 1) selectHandler(res.body[0])
                        else setGoods(res.body)

                    } else {
                        enqueueSnackbar('Не найдено', {variant: 'error'})
                    }
                }
            )

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
                                              onClick={() => selectHandler(g)}
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