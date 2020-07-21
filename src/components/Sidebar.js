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

    linkRender(name, arr) {

        return (
            <div>
                <MDBBtn className="list-group-item list-group-item-action bg-light"
                        onClick={event => this.nextDivToggle(event)}>{name}</MDBBtn>
                <div className="List-item">
                    {arr.map(id => {
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

    render() {

        return (
            <div className="bg-light border-right d-print-none" id="sidebar-wrapper">
                <div className="list-group list-group-flush mt-1">

                    {this.linkRender("Услуги", [1, 2, 3])}
                    {this.linkRender("Склад", [11, 12, 13, 14])}
                    {this.linkRender("Клиенты", [21, 22, 23])}
                    {/*{this.linkRender("Аналитика", [24, 25, 26, 27, 28, 29, 30])}*/}
                    {this.linkRender("Настройки", [47])}
                    {this.linkRender("Интеграции", [51, 52])}

                </div>
            </div>
        )
    }
}

export default connect(state => (state.auth))(Sidebar);
