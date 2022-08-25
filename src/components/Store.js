import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {Button, IconButton} from "@material-ui/core";
import uuid from "uuid";
import Tree from "./Tree";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

import rest from "../components/Rest";


const oftenUsedButtons = [
    {label: 'Аксессуары', catId: 6},
    {label: 'Запчасти', catId: 4},
    {label: 'Техника', catId: 5},
    {label: 'Расходники', catId: 999},
]

const Store = props => {

    const [categoryFilter, setCategoryFilter] = useState(0)
    const [isExpand, setIsExpand] = useState(false)
    const [count, setCount] = useState(25)

    useEffect(() => {

        rest('goods?category_id=' + categoryFilter)
            .then(res => {

            })

    }, [])


    const setCat = id => {

        id = +id

        setCategoryFilter(id)

        if (oftenUsedButtons.length < 8) {

            const cat = props.app.categories.find(c => c.id === id)

            if (cat && cat.id > 6 && cat.id < 999) {

                setIsExpand(false)

                const r = oftenUsedButtons.find(b => b.catId === cat.id)

                if (!r) oftenUsedButtons.push({
                    label: cat.name,
                    catId: cat.id
                })

            }

        }


    }

    return <div>

        {isExpand
            ? <Tree categories={props.app.categories}
                    onSelected={id => setCat(id)}
                    finished={id => setCat(id)}
            />
            : <IconButton onClick={() => setIsExpand(!isExpand)}>
                <ExpandLessIcon/>
            </IconButton>}

        {oftenUsedButtons.map(b => <Button
            key={uuid()}
            size="small"
            style={{margin: '.5rem'}}
            color={categoryFilter === b.catId ? "primary" : "default"}
            variant={categoryFilter === b.catId ? "contained" : "outlined"}
            onClick={() => setCategoryFilter(b.catId)}>
            {b.label}
        </Button>)}


    </div>

}

export default connect(state => state)(Store)