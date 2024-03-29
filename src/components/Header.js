import React, {useEffect, useState} from "react";
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {
    MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavItem, MDBNavLink, MDBNavbarToggler, MDBCollapse, MDBDropdown,
    MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBIcon, MDBBtn, MDBCardHeader
} from "mdbreact";
import {init_user, upd_app, exit_app} from "../actions/actionCreator";
import {Button, IconButton} from "@material-ui/core";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import BalanceModal from "./BalanceModal";
import rest from './Rest'
import {toLocalTimeStr} from "./common/Time";


const NavbarPage = props => {

    const [balanceModalOpen, setBalanceModalOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {

        // если больше 12 часов выходим
        if ((Date.now() - props.auth.time) > 43200000) exit()

// eslint-disable-next-line
    }, [])

    const toggleClick = () => {

        const wrapper = document.querySelector('#wrapper');
        const toggle_icon = document.querySelector('#toggle_icon');

        wrapper.classList.toggle('toggled');

        toggle_icon.classList.value = wrapper.classList.value === 'd-flex toggled'
            ? 'fas fa-angle-double-right'
            : 'fas fa-angle-double-left'

    }

    const toggleCollapse = () => setIsOpen(!isOpen)

    const pointChange = e => props.upd_app({current_stock_id: +e.target.value})

    const pointExit = () => props.upd_app({current_stock_id: 0})

    const newDay = () => rest('daily/' + props.app.current_stock_id, 'POST')

    const accessPoints = () => {

        if (!props.app) return '';

        let allowedStocks = []

        if (props.app.stockusers) {
            props.app.stockusers.map(su => {
                if (su.user_id === props.auth.user_id) {
                    allowedStocks.push(su.stock_id)
                }
                return su
            })
        }

        const validStocks = props.app.stocks
            .filter(stock => stock.is_valid && allowedStocks.includes(stock.id))

        const position = props.app.positions
            ? props.app.positions.find(p => p.id === props.auth.position_id)
            : null

        const isSale = position && position.is_sale

        const currentStock = validStocks.find(stock => +stock.id === props.app.current_stock_id)

        return validStocks
            ? props.app.current_stock_id
                ? <>
                    <strong className="white-text">
                        {currentStock ? currentStock.name : ''}
                    </strong>

                    {(props.auth.admin || isSale) && props.app.daily &&
                    !props.app.daily.find(d => d.employees.includes(props.auth.user_id))
                        ? <Button
                            variant="outlined"
                            style={{
                                margin: '1rem',
                                color: '#fff'
                            }}
                            onClick={() => newDay()}
                        >
                            Начать смену
                        </Button>
                        : ''}

                    {props.app.current_stock_id && <IconButton
                        variant="outlined"
                        className="ml-2"
                        style={{
                            color: '#fff'
                        }}
                        onClick={pointExit}
                    >
                        <ExitToAppIcon/>
                    </IconButton>}
                </>
                : <MDBDropdown>
                    <MDBDropdownToggle nav caret>
                        <div className="d-none d-md-inline">Выбрать точку</div>
                    </MDBDropdownToggle>
                    <MDBDropdownMenu className="text-center">
                        {validStocks.map(v => v.is_valid && <MDBDropdownItem
                            onClick={pointChange}
                            value={v.id}
                            key={"mdbdkey" + v.id}
                        >
                            {v.name}
                        </MDBDropdownItem>)}
                    </MDBDropdownMenu>
                </MDBDropdown>
            : ''
    }

    const exit = () => {

        props.init_user('', 0, '', '', '', 0)
        props.exit_app()
        setIsOpen(false)

    }

    const getUserName = () => {

        if (!props.app) return ''

        const user = props.app.users.find(v => +v.id === +props.auth.user_id)
        return user
            ? user.name
            : ''

    }

    const auth_menu = () => props.auth.user_id > 0
        ? <MDBDropdownMenu className="text-center" right>

            <MDBCardHeader className={"font-weight-bold"}>
                {getUserName()}
            </MDBCardHeader>

            <MDBDropdownItem>
                <MDBNavLink to="/settings" className="text-dark">
                    Настройки
                </MDBNavLink>
            </MDBDropdownItem>
            <MDBDropdownItem>
                <MDBNavLink to="/subscribe" className="text-dark">
                    Подписка до: {toLocalTimeStr(props.auth.expiration_time).slice(0, -9)}
                </MDBNavLink>
            </MDBDropdownItem>
            {props.app
                ? <MDBDropdownItem onClick={() => setBalanceModalOpen(true)}>
                    Баланс: {props.app.balance}
                </MDBDropdownItem>
                : ''}
            <MDBBtn className="btn btn-sm mx-4" color="danger" onClick={exit}>
                Выйти
            </MDBBtn>
        </MDBDropdownMenu>
        : ''

    return <MDBNavbar color="default-color" dark expand="md">
        <MDBNavbarBrand>
            <MDBNavLink to="/">
                <strong className="white-text">Uchet.store</strong>
            </MDBNavLink>
        </MDBNavbarBrand>
        <button id="menu-toggle" onClick={toggleClick} className="btn btn-sm mx-2">
            <i id="toggle_icon" className="fas fa-angle-double-left"/>
        </button>
        <MDBNavbarNav left>
            <MDBNavItem className={"mx-3"}>
                {accessPoints()}
            </MDBNavItem>
        </MDBNavbarNav>
        <MDBNavbarToggler onClick={toggleCollapse}/>
        <MDBCollapse id="navbarCollapse3" isOpen={isOpen} navbar className="text-right">
            <MDBNavbarNav right>
                {props.auth.organization_id === 1 && <MDBNavItem>
                    <MDBNavLink className="waves-effect waves-light" to="/zp">
                        <i className="fas fa-coins"/>
                        {props.app.zp || 0}
                    </MDBNavLink>
                </MDBNavItem>}
                {/*<MDBNavItem>*/}
                {/*    <MDBNavLink className="waves-effect waves-light" to="#!">*/}
                {/*        <i className="far fa-envelope"/>*/}
                {/*    </MDBNavLink>*/}
                {/*</MDBNavItem>*/}
                <MDBNavItem>
                    <MDBDropdown>
                        <MDBDropdownToggle nav caret>
                            <MDBIcon icon="user"/>
                        </MDBDropdownToggle>
                        {auth_menu()}
                    </MDBDropdown>
                </MDBNavItem>
            </MDBNavbarNav>
        </MDBCollapse>
        <BalanceModal
            isOpen={balanceModalOpen}
            close={() => setBalanceModalOpen(false)}
        />
    </MDBNavbar>

}

const mapDispatchToProps = dispatch => bindActionCreators({
    init_user,
    upd_app,
    exit_app
}, dispatch);

export default connect(state => state, mapDispatchToProps)(NavbarPage);
