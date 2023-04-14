import React from "react";
import {connect} from "react-redux";

import {TextField, Typography} from "@material-ui/core";

import CategoryHandler from "./common/CategoryHandler";


const EnteredGood = props => {

    const needImei = () => {

        let cid = props.category_id

        while (cid > 4) {

            const showcase = [5, 38, 39, 40, 41, 44]

            if (showcase.includes(cid)) return true

            cid = props.app.categories.find(c => c.id === cid).parent_id

        }

        return false

    }

    const tf = (l, v, o) => <TextField size="small"
                                       style={{
                                           width: '100%',
                                           padding: '.3rem'
                                       }}
                                       label={l}
                                       value={v}
                                       onChange={e => o(e.target.value)}
    />


    return <div style={{
        border: '1px solid black',
        borderRadius: '5px',
        margin: '.3rem',
        padding: '.3rem'
    }}>

        <Typography variant="subtitle2">
            Товар:
        </Typography>

        <div style={{
            width: '100%',
            padding: '.3rem'
        }}>

            <CategoryHandler
                id={props.category_id}
                setId={props.setCategory_id}
            />

        </div>

        {tf("Наименование", props.model, props.setModel)}

        {needImei() && tf("imei", props.imei, props.setImei)}

    </div>

}

export default connect(state => state)(EnteredGood)