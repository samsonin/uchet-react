import React from "react";
import {connect} from "react-redux";

import AddCosts from "./common/AddCosts";
import {Typography} from "@material-ui/core";

const Produce = props => {

    const done = good => props.setGood(good)

    return <div style={{
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: '1rem'
    }}>

        <Typography variant="h5" >
            Изготовление
        </Typography>

        <AddCosts done={done} button="Изготовить"/>

    </div>

}

export default connect(state => state)(Produce)