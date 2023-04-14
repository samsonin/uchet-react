import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import {Button, Grid} from "@material-ui/core";

import Tree from "../Tree";
import {intInputHandler} from "./InputHandlers";


//TODO добавить закрытие дерева по команде родителя

const CategoryHandler = props => {

    const [treeOpen, setTreeOpen] = useState(false)

    const category = props.app.categories.find(c => c.id === props.id)

    const handleTree = id => {
        intInputHandler(id, props.setId)
        setTreeOpen(false)
    }

    return treeOpen
        ? <Grid container className="m-1 p-1">
            <Grid item xs={10} className="pt-1 pr-1">
                <Tree initialId={props.id}
                      categories={props.app.categories}
                      onSelected={id => intInputHandler(id, props.setId)}
                      finished={id => handleTree(id)}
                />
            </Grid>
            <Grid item xs={2}>
                <Button size="small" onClick={() => setTreeOpen(false)}
                        variant="outlined"
                >
                    Ок
                </Button>
            </Grid>
        </Grid>
        : <Grid container className="m-1 p-1">
            <Grid item xs={3}>Категория:</Grid>
            <Grid item xs={9}>
                <Button size="small"
                        className="w-100"
                        onClick={() => setTreeOpen(true)}
                >
                    {category ? category.name : 'Выбрать...'}
                </Button>
            </Grid>
        </Grid>

}

export default connect(state => state)(CategoryHandler)