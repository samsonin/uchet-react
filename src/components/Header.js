import React, { useEffect, useMemo, useState } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { init_user, upd_app, exit_app } from "../actions/actionCreator";
import { Button, IconButton } from "@mui/material";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import BalanceModal from "./BalanceModal";
import rest from './Rest'
import { toLocalTimeStr } from "./common/Time";
import { UiButton, UiDropdown, UiDropdownItem } from "./common/Ui";


const NavbarPage = props => {

    const [balanceModalOpen, setBalanceModalOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const app = props.app || {}
    const appStocks = app.stocks || []
    const appStockusers = app.stockusers || []
    const appUsers = app.users || []
    const currentStockId = app.current_stock_id
    const updApp = props.upd_app

    const allowedStockIds = useMemo(() => appStockusers
        .filter(su => su.user_id === props.auth.user_id)
        .map(su => su.stock_id), [appStockusers, props.auth.user_id])

    const validStocks = useMemo(() => appStocks
        .filter(stock => stock.is_valid && allowedStockIds.includes(stock.id)),
        [appStocks, allowedStockIds])

    useEffect(() => {

        // если больше 12 часов выходим
        if ((Date.now() - props.auth.time) > 43200000) exit()

        syncSidebarState()
        window.addEventListener('resize', syncSidebarState)

        return () => window.removeEventListener('resize', syncSidebarState)

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (validStocks.length !== 1) return

        const stockId = +validStocks[0].id

        if (+currentStockId !== stockId) {
            updApp({ current_stock_id: stockId })
        }
    }, [currentStockId, updApp, validStocks])

    const isDesktop = () => window.matchMedia('(min-width: 768px)').matches

    const isSidebarVisible = wrapper => wrapper.classList.contains('sidebar-open')
        || (!wrapper.classList.contains('sidebar-hidden') && isDesktop())

    const syncSidebarState = () => {

        const wrapper = document.querySelector('#wrapper');
        if (!wrapper) return

        setSidebarOpen(isSidebarVisible(wrapper))

    }

    const toggleClick = () => {

        const wrapper = document.querySelector('#wrapper');
        if (!wrapper) return

        const shouldHide = isSidebarVisible(wrapper)

        wrapper.classList.remove('sidebar-open', 'sidebar-hidden')
        wrapper.classList.add(shouldHide ? 'sidebar-hidden' : 'sidebar-open')

        setSidebarOpen(!shouldHide)

    }

    const toggleCollapse = () => setIsOpen(!isOpen)

    const pointChange = e => props.upd_app({ current_stock_id: +e.target.value })

    const pointExit = () => props.upd_app({ current_stock_id: 0 })

    const newDay = () => rest('daily/' + props.app.current_stock_id, 'POST')

    const accessPoints = () => {

        if (!props.app) return '';

        const appPositions = props.app.positions || []
        const appDaily = props.app.daily || []
        const position = appPositions.find(p => p.id === props.auth.position_id)

        const isSale = position && position.is_sale

        const currentStock = validStocks.find(stock => +stock.id === props.app.current_stock_id)
        const canSelectStock = validStocks.length > 1

        return validStocks
            ? props.app.current_stock_id
                ? <>
                    <strong className="white-text">
                        {currentStock ? currentStock.name : ''}
                    </strong>

                    {(props.auth.admin || isSale) &&
                        !appDaily.find(d => d.employees.includes(props.auth.user_id))
                        ? <Button
                            variant="outlined"
                            className="header-shift-button"
                            style={{
                                color: '#e6fffb',
                                borderColor: 'rgba(230, 255, 251, 0.42)'
                            }}
                            onClick={() => newDay()}
                        >
                            Начать смену
                        </Button>
                        : ''}

                    {props.app.current_stock_id && canSelectStock && <IconButton
                        variant="outlined"
                        className="header-exit-point"
                        style={{
                            color: '#e6fffb'
                        }}
                        onClick={pointExit}
                    >
                        <ExitToAppIcon />
                    </IconButton>}
                </>
                : canSelectStock
                    ? <UiDropdown
                        label={<span className="header-select-stock">Выбрать точку</span>}
                    >
                        {close => validStocks.map(v => v.is_valid && <UiDropdownItem
                            onClick={e => {
                                pointChange(e)
                                close()
                            }}
                            value={v.id}
                            key={"stock-dropdown-key" + v.id}
                        >
                            {v.name}
                        </UiDropdownItem>)}
                    </UiDropdown>
                    : ''
            : ''
    }

    const exit = () => {

        props.init_user('', 0, '', '', '', 0)
        props.exit_app()
        setIsOpen(false)

    }

    const getUserName = () => {

        if (!props.app) return ''

        const user = appUsers.find(v => +v.id === +props.auth.user_id)
        return user
            ? user.name
            : ''

    }

    const auth_menu = close => props.auth.user_id > 0
        ? <>
            <div className="header-user-name">
                {getUserName()}
            </div>

            <UiDropdownItem to="/settings/personal" onClick={close}>
                Настройки
            </UiDropdownItem>
            <UiDropdownItem to="/subscribe" onClick={close}>
                Подписка до: {toLocalTimeStr(props.auth.expiration_time).slice(0, -9)}
            </UiDropdownItem>
            {props.app
                ? <UiDropdownItem onClick={() => {
                    setBalanceModalOpen(true)
                    close()
                }}>
                    Баланс: {props.app.balance}
                </UiDropdownItem>
                : ''}
            <div style={{ padding: '0.75rem 1rem' }}>
                <UiButton color="danger" size="sm" block onClick={exit}>
                    Выйти
                </UiButton>
            </div>
        </>
        : null

    return <nav className="navbar">
        <div className="header-brand">
            <Link to="/" className="header-brand-link">
                <span className="header-brand-text">Uchet</span>
            </Link>
        </div>
        <button
            id="menu-toggle"
            onClick={toggleClick}
            className={`header-sidebar-toggle ${sidebarOpen ? 'is-active' : ''}`}
            type="button"
            aria-label={sidebarOpen ? "Скрыть боковую панель" : "Показать боковую панель"}
            title={sidebarOpen ? "Скрыть боковую панель" : "Показать боковую панель"}
        >
            <span className="menu-toggle-lines" aria-hidden="true">
                <span />
                <span />
                <span />
            </span>
        </button>
        <div className="header-access">
            {accessPoints()}
        </div>
        <div className="header-spacer" />
        <button
            type="button"
            className="header-collapse-toggle"
            onClick={toggleCollapse}
            aria-label={isOpen ? "Скрыть меню" : "Показать меню"}
        >
            <span className="header-menu-symbol" aria-hidden="true" />
        </button>
        <div className={`header-nav ${isOpen ? 'is-open' : ''}`}>
            {props.auth.organization_id === 1 && <Link
                className="header-nav-link"
                to="/zp"
                onClick={() => setIsOpen(false)}
            >
                <span aria-hidden="true">₽</span>
                {props.app.zp || 0}
            </Link>}
            <UiDropdown
                align="right"
                buttonClassName="header-user-button"
                label={<span aria-hidden="true">👤</span>}
            >
                {auth_menu}
            </UiDropdown>
        </div>
        <BalanceModal
            isOpen={balanceModalOpen}
            close={() => setBalanceModalOpen(false)}
        />
    </nav>

}

const mapDispatchToProps = dispatch => bindActionCreators({
    init_user,
    upd_app,
    exit_app
}, dispatch);

export default connect(state => state, mapDispatchToProps)(NavbarPage);
