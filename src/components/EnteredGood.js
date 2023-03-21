import React, {useState} from "react";
import {Button, TextField, Typography} from "@material-ui/core";
import Tree from "./Tree";
import {connect} from "react-redux";


const EnteredGood = props => {

    const [isTreeOpen, setIsTreeOpen] = useState(false)

    const category = props.app.categories.find(c => c.id === props.category_id)


    const handleTree = id => {

        setIsTreeOpen(false)
        props.setCategory_id(+id)

    }

    const style = {
        width: '100%',
        margin: '.5rem',
        padding: '.5rem'
    }

    const tf = (l, v, o) => <TextField variant="outlined"
                                       style={style}
                                       label={l}
                                       value={v}
                                       onChange={e => o(e.target.value)}
    />


    return <div style={{
        border: '1px solid black',
        borderRadius: '5px',
        padding: '.5rem'
    }}>

        <Typography variant="subtitle2">
            Что изготовим:
        </Typography>

        <div style={style}>

            {isTreeOpen
                ? <Tree
                    initialId={props.category_id}
                    categories={props.app.categories}
                    finished={id => handleTree(id)}
                    onSelected={id => {
                        console.log(id)
                    }}
                />
                : <Button size="small"
                          className="w-100"
                          onClick={() => setIsTreeOpen(true)}
                >
                    {category ? category.name : 'Выбрать категорию...'}
                </Button>}

        </div>

        {tf("Наименование", props.model, props.setModel)}

        {tf("imei", props.imei, props.setImei)}

    </div>

}

export default connect(state => state)(EnteredGood)