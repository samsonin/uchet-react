import React, {Component} from "react";
import {connect} from 'react-redux';
import {
    MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavItem, MDBNavLink, MDBNavbarToggler, MDBCollapse, MDBDropdown,
    MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBIcon, MDBBtn, MDBCardHeader
} from "mdbreact";
import {init_user, upd_app, exit_app, enqueueSnackbar, closeSnackbar} from "../actions/actionCreator";
import BalanceModal from "./BalanceModal";
import {bindActionCreators} from "redux";


// const authMenuContent = [
//     {to: '/settings' , className: '', text: 'Настройки'},
//     {to: '/subscribe' , className: 'text-dark', text: 'Подписка до: ' + unixConverter(this.props.auth.expiration_time)},
//     {onclick: this.ballanceModal, text: 'Баланс: ' + currencyConverter(this.props.app.balance)}
// ]


function unixConverter(unix) {
    let date = new Date(unix * 1000);
    let day = (date.getDate() < 10 ? '0' : '') + date.getDate();
    let month = (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
    let year = date.getFullYear(); //full year in yyyy format
    return (day + '-' + month + '-' + year);
}

function currencyConverter(rub) {
    return rub;
}

class NavbarPage extends Component {

    state = {
        balanceModalCounter: 0,
        balanceModal: false
    };

    toggleClick() {

        let wrapper = document.querySelector('#wrapper');
        let toggle_icon = document.querySelector('#toggle_icon');

        wrapper.classList.toggle('toggled');

        toggle_icon.classList.value = wrapper.classList.value === 'd-flex toggled' ?
            'fas fa-angle-double-right' :
            'fas fa-angle-double-left'

    }

    toggleCollapse = () => this.setState({isOpen: !this.state.isOpen});

    pointChange = (e) => {
        const {upd_app} = this.props;
        upd_app({stock_id: +e.target.value})
    };

    acess_point() {

        let validStocks = this.props.app.stocks.find(v => v.is_valid);

        return (!validStocks || validStocks.length < 2) ?
            '' :
            this.props.app.stock_id ?
                <MDBDropdown>
                    <strong className="white-text">
                        {this.props.app.stocks.find(v => +v.id === this.props.app.stock_id).name}
                    </strong>
                </MDBDropdown>
                :
                <MDBDropdown>
                    <MDBDropdownToggle nav caret>
                        <div className="d-none d-md-inline">Выбрать точку</div>
                    </MDBDropdownToggle>
                    <MDBDropdownMenu className="text-center">
                        {this.props.app.stocks.map(v => {
                            return v.is_valid ?
                                <MDBDropdownItem onClick={this.pointChange}
                                                 value={v.id} key={"mdbdkey" + v.id}>
                                    {v.name}
                                </MDBDropdownItem> : '';
                        })}
                    </MDBDropdownMenu>
                </MDBDropdown>
    }

    // ballanceModal = () => this.setState({balanceModalCounter: this.state.balanceModalCounter + 1});

    exit = () => {
        const {init_user, exit_app} = this.props;
        init_user('', 0, '', '', '');
        exit_app();
        this.setState({isOpen: false});
    };

    getUserName() {

        if (this.props.app.users === []) return '';
        let user = this.props.app.users.find(v => +v.id === +this.props.auth.user_id);
        return user === undefined ? '' : user.name;

    };

    auth_menu() {

        return this.props.auth.user_id > 0 ?
            <MDBDropdownMenu className="text-center" right>
                <MDBCardHeader className={"font-weight-bold"}>
                    {this.getUserName()}
                </MDBCardHeader>

                {/*{authMenuContent.map(i => <MDBDropdownItem onClick={i.onClick}>*/}
                {/*    <MDBNavLink to={i.to} className={i.className}>*/}
                {/*        {i.text}*/}
                {/*    </MDBNavLink>*/}
                {/*</MDBDropdownItem>)}*/}

                <MDBDropdownItem>
                    <MDBNavLink to="/settings" className="text-dark">
                        Настройки
                    </MDBNavLink>
                </MDBDropdownItem>
                <MDBDropdownItem>
                    <MDBNavLink to="/subscribe" className="text-dark">
                        Подписка до: {unixConverter(this.props.auth.expiration_time)}
                    </MDBNavLink>
                </MDBDropdownItem>
                <MDBDropdownItem onClick={this.ballanceModal}>
                    Баланс: {currencyConverter(this.props.app.balance)}
                </MDBDropdownItem>

                <MDBBtn className="btn btn-sm mx-4" color="danger" onClick={this.exit}>
                    Выйти
                </MDBBtn>
            </MDBDropdownMenu> :
            '';

    }

    render() {
        return <MDBNavbar color="default-color" dark expand="md">
            <MDBNavbarBrand>
                <MDBNavLink to="/">
                    <strong className="white-text">Uchet.store</strong>
                </MDBNavLink>
            </MDBNavbarBrand>
            <button id="menu-toggle" onClick={this.toggleClick} className="btn btn-sm mx-2">
                <i id="toggle_icon" className="fas fa-angle-double-left"/>
            </button>
            <MDBNavbarNav left>
                <MDBNavItem className={"mx-3"}>
                    {this.acess_point()}
                </MDBNavItem>
            </MDBNavbarNav>
            <MDBNavbarToggler onClick={this.toggleCollapse}/>
            <MDBCollapse id="navbarCollapse3" isOpen={this.state.isOpen} navbar className="text-right">
                <MDBNavbarNav right>
                    <MDBNavItem>
                        <MDBNavLink className="waves-effect waves-light" to="#!">
                            <i className="fas fa-coins"/>
                        </MDBNavLink>
                    </MDBNavItem>
                    <MDBNavItem>
                        <MDBNavLink className="waves-effect waves-light" to="#!">
                            <i className="far fa-envelope"/>
                        </MDBNavLink>
                    </MDBNavItem>
                    <MDBNavItem>
                        <MDBDropdown>
                            <MDBDropdownToggle nav caret>
                                <MDBIcon icon="user"/>
                            </MDBDropdownToggle>
                            {this.auth_menu()}
                        </MDBDropdown>
                    </MDBNavItem>
                </MDBNavbarNav>
            </MDBCollapse>
            <BalanceModal counter={this.state.balanceModalCounter}/>
        </MDBNavbar>
    }
}

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    init_user,
    upd_app,
    exit_app
}, dispatch);

export default connect(state => (state), mapDispatchToProps)(NavbarPage);
