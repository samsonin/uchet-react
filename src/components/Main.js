import React from "react";
import {Link} from 'react-router-dom';
import {MDBBtn} from "mdbreact";

import {siteMap} from "./SiteMap";
import Grid from "@material-ui/core/Grid";
import {connect} from "react-redux";

// выделяем цветом популярные кнопки
const primaryIds = [0, 1, 10, 13, 29];

// расстановка кнопок на главной странице

const Main = ({admin}) => {

    return [
        [4, 7, 8],
        [5, 6],
        [27, 2],
        [11, 12, 14, 15, 16, 17],
        [29, 31, 32],
        [1, 33, 30],
        [24, 23],
        [25, 26, 3],
        [20, 21, 22],
        [18, 17, 27],
        [34, 35],
        [41, 42, 43, 46, 47, 48],
        [51, 52, 53],
    ].map(arr => <Grid container
                       key={arr.toString()}
        >
            {arr.map(id => {

                const smItem = siteMap(admin)
                    .find(sm => sm.id === id)

                return smItem
                    ? <Grid item
                            key={"mdbbtnmainkey" + smItem.id}
                            style={{margin: 5}}
                    >
                        <Link to={"/" + smItem.path}>
                            <MDBBtn className="btn-l btn-block"
                                    color={primaryIds.includes(id)
                                        ? "primary"
                                        : "mdb-color"
                                    }
                            >
                                {smItem.text}
                            </MDBBtn>
                        </Link>
                    </Grid>
                    : ''
            })}
        </Grid>
    )
}

export default connect(state => state.auth)(Main)