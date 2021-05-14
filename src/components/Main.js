import React from "react";
import {Link} from 'react-router-dom';
import {MDBBtn} from "mdbreact";

import {siteMap, permission} from "./SiteMap";
import Grid from "@material-ui/core/Grid";

// выделяем цветом популярные кнопки
let primaryIds = [0, 1, 10, 13, 29];

export const Main = props => [ // расстановка кнопок на главной странице
    [4, 7, 8],
    [5, 6],
    [27, 2],
    [11, 12],
    [29, 31, 32],
    [1, 33, 30],
    [24, 23],
    [25, 26, 3],
    [14, 13, 15, 16],
    [20, 21, 22],
    [18, 17, 27],
    [34, 35],
    [51, 52],
].map(arr => <Grid container
                   justify="space-between"
                   key={arr.toString()}
                   style={{margin: 5}}
    >
        {arr.map(id => {

                let obj = siteMap.find(v => v.id === id);

                // скрываем кнопки, если нет прав доступа
                return obj ?
                    permission(id, props) ?
                        <Grid item
                              key={"mdbbtnmainkey" + obj.path}>
                            <Link to={"/" + obj.path}>
                                <MDBBtn className="btn-l btn-block"
                                        color={primaryIds.includes(id) ?
                                            "primary" : "mdb-color"
                                        }
                                >
                                    {obj.text}
                                </MDBBtn>
                            </Link>
                        </Grid> : ''
                    : '';
            }
        )}
    </Grid>
)