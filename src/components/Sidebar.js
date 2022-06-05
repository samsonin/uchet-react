import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import {makeStyles} from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";

import {siteMap} from "./SiteMap";


const useStyles = makeStyles({
    list: {
        width: '15rem',
        marginTop: '1rem',
    },
    button: {
        marginRight: -14,
        width: '100%',
        marginBottom: 10,
        backgroundColor: '#2bbbad',
        color: 'white',
    },
});

const Sidebar = props => {

    const classes = useStyles();

    const nextDivToggle = nextDiv => {

        if (nextDiv) {
            if (nextDiv.classList.contains('hideBlock')) {
                document.querySelectorAll(".List-item")
                    .forEach(item => item.classList.add('hideBlock'));
                nextDiv.classList.remove('hideBlock')
            } else {
                nextDiv.classList.add('hideBlock')
            }
        }

    }

    return <div id="sidebar-wrapper"
                className="bg-light border-right">
        <div className={classes.list}>

            {[
                {name: 'Услуги', arr: [1, 2, 3]},
                {name: 'Склад ТМЦ', arr: [11, 12, 13, 14, 15, 16, 17, 19]},
                {name: 'Контрагенты', arr: [21, 22, 24]},
                {name: 'Аналитика', arr: [31, 32]},
                {name: 'Настройки', arr: [41, 42, 43, 46, 47, 48]},
                {name: 'Интеграции', arr: [51, 52, 53]},
            ].map(v => siteMap(props.admin).find(sm => v.arr.includes(sm.id))
                ? <div key={'sidebararrkey' + v.name}>
                    <Button
                        className={classes.button}
                        size="large"
                        onClick={e => nextDivToggle(e.currentTarget.nextSibling)}>
                        {v.name}
                    </Button>
                    <div className="List-item hideBlock">
                        {v.arr.map(id => {
                                let obj = siteMap(props.admin).find(v => v.id === id)
                                return obj
                                    ? <div className="link_items"
                                           key={"mdblnksdbkey" + id}
                                    >
                                        <Link to={'/' + obj.path}>
                                            {obj.text}
                                        </Link>
                                    </div>
                                    : null
                            }
                        )}
                    </div>
                </div>
                : ''
            )
            }
        </div>
    </div>

}

export default connect((state) => state.auth)(Sidebar);
