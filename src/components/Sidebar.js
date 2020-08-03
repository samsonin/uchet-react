import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import {siteMap, permission} from "./SiteMap";
import Button from "@material-ui/core/Button";

const Sidebar = props => {

    const hideAll = () => {
        document.querySelectorAll(".List-item")
            .forEach(item => item.classList.add('hideBlock'));
    }

    const nextDivToggle = e => {
        const nextDiv = e.currentTarget.nextSibling;

        if (nextDiv) {
            if (nextDiv.classList.contains('hideBlock')) {
                hideAll()
                nextDiv.classList.remove('hideBlock')
            } else {
                nextDiv.classList.add('hideBlock')
            }
        }

    };

    return <div className="bg-light border-right d-print-none" id="sidebar-wrapper">
        <div className="list-group mt-2">

            {[
                {name: 'Услуги', arr: [1, 2, 3]},
                {name: 'Склад', arr: [11, 12, 13, 14]},
                {name: 'Контрагенты', arr: [21, 22, 23]},
                // {name: 'Аналитика', arr: [24, 25, 26, 27, 28, 29, 30]},
                {name: 'Настройки', arr: [41, 42, 43, 46, 47, 48]},
                {name: 'Интеграции', arr: [51, 52]},
            ].map(v => <div key={'sidebararrkey' + v.name}>
                    <Button
                        style={{
                            marginRight: -14,
                            width: '100%',
                            marginBottom: 10,
                            backgroundColor: '#2bbbad',
                            color: 'white',
                        }}
                        size="large"
                        onClick={event => nextDivToggle(event)}>
                        {v.name}
                    </Button>
                    <div className="List-item hideBlock">
                        {v.arr.map(id => {
                                let obj = siteMap.find(v => v.id === id);
                                return obj
                                    ? permission(id, props)
                                        ? <div className="link_items">
                                            <Link to={'/' + obj.path}
                                                  key={"mdblnksdbkey" + id}
                                            >
                                                {obj.text}
                                            </Link>
                                        </div>
                                        : null
                                    : null
                            }
                        )}
                    </div>
                </div>
            )
            }
        </div>
    </div>

}

export default connect((state) => state.auth)(Sidebar);
