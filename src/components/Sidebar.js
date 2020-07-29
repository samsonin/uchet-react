import React, {Component} from "react";
import {MDBBtn, MDBNavLink} from "mdbreact";
import {siteMap, permission} from "./SiteMap";

import {connect} from "react-redux";

class Sidebar extends Component {

    componentDidMount() {
        document.querySelectorAll('.List-item')
            .forEach(item => item.classList.add('hideBlock'))
    }

    nextDivToggle(e) {
        const nextDiv = e.currentTarget.nextSibling;

        if (nextDiv) {
            nextDiv.classList.contains('hideBlock')
                ? nextDiv.classList.remove('hideBlock')
                : nextDiv.classList.add('hideBlock')
        }

    };

    render() {

        return <div className="bg-light border-right d-print-none" id="sidebar-wrapper">
            <div className="list-group list-group-flush mt-1">

                {[
                    {name: 'Услуги', arr: [1, 2, 3]},
                    {name: 'Склад', arr: [11, 12, 13, 14]},
                    {name: 'Контрагенты', arr: [21, 22, 23]},
                    // {name: 'Аналитика', arr: [24, 25, 26, 27, 28, 29, 30]},
                    {name: 'Настройки', arr: [41, 42, 43, 46, 47, 48]},
                    {name: 'Интеграции', arr: [51, 52]},
                ].map(v => <div key={'sidebararrkey' + v.name}>
                        <MDBBtn className="list-group-item list-group-item-action bg-light"
                                onClick={event => this.nextDivToggle(event)}>
                            {v.name}
                        </MDBBtn>
                        <div className="List-item">
                            {v.arr.map(id => {
                                    let obj = siteMap.find(v => v.id === id);
                                    return obj ? permission(id, this.props) ?
                                        <MDBNavLink className="sb-drp" to={'/' + obj.path}
                                                    key={"mdblnksdbkey" + id}>
                                            {obj.text}
                                        </MDBNavLink> : ''
                                        : ''
                                }
                            )}
                        </div>
                    </div>
                )
                }

            </div>
        </div>
    }
}

export default connect(state => (state.auth))(Sidebar);
