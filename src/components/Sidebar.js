import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";

import { siteMap } from "./SiteMap";


const useStyles = makeStyles({
    list: {
        width: '15rem',
        marginTop: '1rem',
        padding: '0 0.75rem 1rem',
    },
    button: {
        width: '100%',
        minHeight: 42,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#0f9f8f',
        color: '#ffffff',
        boxShadow: '0 10px 20px rgba(15, 159, 143, 0.18)',
        fontWeight: 700,
        '&:hover': {
            backgroundColor: '#087f73',
            boxShadow: '0 12px 24px rgba(15, 159, 143, 0.22)',
        },
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
                { name: 'Услуги', arr: [1, 2, 3] },
                { name: 'ТМЦ', arr: [10, 11, 14, 15, 16, 17, 19] },
                { name: 'Контрагенты', arr: [21, 22, 24] },
                { name: 'Аналитика', arr: [31, 32, 33, 35] },
                { name: 'Настройки', arr: [40, 41, 42, 43, 45, 46, 47, 48] },
                { name: 'Интеграции', arr: [51, 52, 53] },
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
