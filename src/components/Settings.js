import React, {Component, Fragment} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import SwipeableViews from 'react-swipeable-views';
// import $ from "jquery";
import CKEditor from "./CKEditor";

import {
    Grid,
    Tab,
    Tabs,
    AppBar,
    Typography,
    Box,
    Fab,
    FormControlLabel,
    Switch,
    TextField,
    styled, InputLabel,
    IconButton,
    Button
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import {MDBBtn} from "mdbreact";

import AuthControl from './AuthControl';
import request from "./Request";
import {closeSnackbar, enqueueSnackbar, upd_app} from "../actions/actionCreator";
import FormControl from "@material-ui/core/FormControl";
import FilledInput from "@material-ui/core/FilledInput";
import Autocomplete from '@material-ui/lab/Autocomplete';

let authControl = new AuthControl();

const defaultState = {
    isUserNamePasswordAsk: false,
    isEmailPasswordAsk: false,
    isEmailConfirm: false,
    isPhoneNumberPasswordAsk: false,
    isPhoneNumberConfirm: false,
    isPasswordPasswordAsk: false,
    tab: 5,
    isAddEmployee: false,
    isCanAddEmployee: false,
    autocomplete: [],
    innValue: "0",
    bankName: "Банк"
};

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    upd_app
}, dispatch);

const MyAppBar = styled(AppBar)({
    flexGrow: 0,
    color: "grey",
    backgroundColor: "white",
    boxShadow: '0 2px 3px 5px rgba(155, 105, 135, .3)',
    width: '95%',
    height: '50px',
    boxSizing: 'border-box',
});

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            <Box p={1}>{children}</Box>
        </Typography>
    );
}

export default connect(state => (state), mapDispatchToProps)(class extends Component {

    state = defaultState;

    componentDidMount() {
        this.setState({innValue: this.props.app.organization.inn})
        this.setState({bankName: this.props.app.organization.bankName})
    }

    request = (password, index, value, confirmation_code = '') => {

        request({
            user_id: this.props.auth.user_id,
            action: 'user_setting_change',
            password,
            index,
            value,
            confirmation_code
        })
            .then(data => {
                try {
                    if (data.result) {
                        if (data.need_confirm) {
                            if (index === 'email') this.setState({isEmailConfirm: true});
                            if (index === 'phone_number') this.setState({isPhoneNumberConfirm: true});
                        } else {
                            this.props.enqueueSnackbar({
                                message: 'Изменения сохранены',
                                options: {
                                    variant: 'success',
                                }
                            });

                            if (index === 'user') {
                                const {upd_app} = this.props;
                                upd_app(this.props.app.balance, this.props.app.stock_id, this.props.app.stocks, this.props.app.users, this.props.app.organization, this.props.app.config, this.props.app.docs, this.props.app.fields, this.props.app.providers, this.props.app.categories);
                            }
                            this.setState(defaultState);
                        }
                    } else {
                        let message = 'Ошибка';
                        if (data.error === 'wrong_format') message = 'Неправильный формат';
                        if (data.error === 'alredy_used') message = 'Уже существует';
                        if (data.error === 'code_not_send') message = 'Ошибка отправки кода';
                        this.props.enqueueSnackbar({
                            message,
                            options: {
                                variant: 'error',
                            }
                        });
                        this.setState(defaultState);
                    }
                } catch (e) {
                    this.props.enqueueSnackbar({
                        message: 'Ошибка сервера',
                        options: {
                            variant: 'warning',
                        }
                    });
                }

            });
    };

    requestSettings = (action, id, index, value) => {

        if ((action === 'changePoint' || action === 'changeEmployee') && value === '') return false;
        if (action === 'changeOrganization') {
            if (this.props.app.organization[index] === value) return false;
        }

        request({
            action,
            id,
            index,
            value
        }, '/settings', this.props.auth.jwt)
            .then(data => {

                if (data.result) {
                    if (action === 'addEmployee') this.setState({
                        isAddEmployee: false,
                        isCanAddEmployee: false
                    });
                    if (action === 'getSuggest') this.setState({autocomplete: data.suggest});
                    const {upd_app} = this.props;
                    let stocks = typeof (data.stocks) === 'object' ?
                        data.stocks : this.props.app.stocks;
                    let users = typeof (data.users) === 'object' ?
                        data.users : this.props.app.users;
                    let organization = typeof (data.organization) === 'object' ?
                        data.organization : this.props.app.organization;
                    let config = typeof (data.config) === 'object' ?
                        data.config : this.props.app.config;
                    let docs = typeof (data.docs) === 'object' ?
                        data.docs : this.props.app.docs;
                    let fields = typeof (data.fields) === 'object' ?
                        data.fields : this.props.app.fields;
                    upd_app(this.props.app.balance, this.props.app.stock_id, stocks, users, organization, config, docs, fields, this.props.app.providers, this.props.app.categories);
                    if (index === 'bank_code') {
                        this.setState({bankName: organization.bankName})
                    }
                    if (action === 'setByInn') {

                        document.getElementById('organizationKpp').value = organization.kpp;
                        document.getElementById('organizationOgrn').value = organization.ogrn;
                        document.getElementById('organizationOkved').value = organization.okved;
                        document.getElementById('organizationLegalAddress').value = organization.legal_address;
                        document.getElementById('organizationOrganization').value = organization.organization;

                    }
                } else {
                    let message = 'ошибка';
                    if (data.error === 'already_used') message = 'Такой пользователь уже зарегистрирован!';
                    if (data.error === 'wrong_format') message = 'Неправильный формат контакта!';
                    this.props.enqueueSnackbar({
                        message,
                        options: {
                            variant: 'warning',
                        }
                    });
                }
            })
    };

    getSuggest = (e, inn) => {

        if (inn === '') return false;
        this.setState({innValue: inn});
        if (inn.length < 5) return true;

        this.requestSettings('getSuggest', '', 'inn', inn);

    };

    setInn = (e, value) => {

        if (value === null) {
            this.setState({innValue: ""});
            return false;
        }
        this.setState({innValue: value.inn});

        this.requestSettings('setByInn', '', 'inn', value.inn);

    };

    deletePoint = id => {
        this.props.enqueueSnackbar({
            message: 'Подтвердите удаление',
            options: {
                variant: 'error',
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                action: <Fragment>
                    <Button onClick={() => {
                        this.requestSettings('deletePoint', id)
                    }}>
                        Удалить
                    </Button>
                </Fragment>
            },
            autoHideDuration: 3000,
        });
    };

    add = () => {

        let action = this.state.tab === 2 ? 'addEmployee' : this.state.tab === 3 ? 'addPoint' : false;

        if (action === 'addPoint') {
            this.props.app.stocks.map(value => {
                if (value.name === '') {
                    this.props.enqueueSnackbar({
                        message: 'Существует точка без названия, создать новую невозможно!',
                        options: {
                            variant: 'warning',
                        }
                    });
                    action = false;
                }
                return value;
            })
        }

        if (action === 'addEmployee') {
            this.setState({isAddEmployee: true});
            return;
        }

        if (action) {


            request({action}, '/settings', this.props.auth.jwt)
                .then(data => {

                    if (data.result) {
                        const {upd_app} = this.props;
                        upd_app(this.props.app.balance, this.props.app.stock_id, data.stocks, this.props.app.users, this.props.app.organization, this.props.app.config, this.props.app.docs, this.props.app.fields, this.props.app.providers, this.props.app.categories);
                    }
                });

        }
    };

    renderFab = () => this.state.tab === 2 || this.state.tab === 3 ?
        <Fab color="primary" aria-label="add" className="addfab" onClick={this.add}>
            {this.state.tab === 3 ?
                <AddIcon/> :
                <i className="fas fa-user-plus"/>}
        </Fab>
        : '';

    renderAddEmployee = () => {
        return (
            <TextField id="add-employee" className="addfab"
                       variant="outlined" label="Контакт сотрудника"
                       onChange={this.validateWait}
            />
        )
    }

    renderAddEmployeeEnter = () => <Fab color="primary"
                                        aria-label="add"
                                        className="addfab2"
                                        onClick={
                                            this.requestSettings('addEmployee', '', '', document.getElementById('add-employee').value)
                                        }>
        <i className="fas fa-plus"/>
    </Fab>

    validateWait = e => {
        if (authControl.isValid("#add-employee")) {
            this.setState({
                isCanAddEmployee: authControl.validate_phone_number("#add-employee")
                    || authControl.validate_email("#add-employee")
            })
        }
    }

    tabChange = (event, newValue) => this.setState({tab: newValue});

    handleChangeIndex = index => this.setState({tab: index});

    userNameHandler = () => {
        if (authControl.isValid('setting_user_name_input_id')) {
            if (this.state.isUserNamePasswordAsk) {
                if (authControl.isValid('userNamePasswordAskInputId')) {
                    let user = document.querySelector('#setting_user_name_input_id');
                    this.request(document.querySelector('#userNamePasswordAskInputId').value, 'user', user.value);
                    user.value = '';
                }
            } else this.setState({isUserNamePasswordAsk: true})
        }
    };

    emailHandler = () => {
        if (authControl.validate_email('setting_email_input_id')) {
            if (this.state.isEmailPasswordAsk) {
                if (authControl.isValid('emailPasswordAskInputId')) {
                    this.request(
                        document.querySelector('#emailPasswordAskInputId').value,
                        'email',
                        document.querySelector('#setting_email_input_id').value,
                        document.querySelector('#setting_email_confirmation_code_input_id').value
                    );
                }
            } else this.setState({isEmailPasswordAsk: true});
        }
    };

    phoneNunberHandler = () => {
        if (authControl.validate_phone_number('setting_phone_number_input_id')) {
            if (this.state.isPhoneNumberPasswordAsk) {
                if (authControl.isValid('phoneNumberPasswordAskInputId')) {
                    this.request(
                        document.querySelector('#phoneNumberPasswordAskInputId').value,
                        'phone_number',
                        document.querySelector('#setting_phone_number_input_id').value,
                        document.querySelector('#setting_phone_number_confirmation_code_input_id').value);
                }
            } else this.setState({isPhoneNumberPasswordAsk: true});
        }
    };

    passwordHandler = () => {
        if (authControl.validate_passwords('setting_password_input_id', 'setting_password2_input_id', true)) {
            if (this.state.isPasswordPasswordAsk) {
                if (authControl.isValid('passwordPasswordAskInputId')) {
                    let pass = document.querySelector('#setting_password_input_id');
                    this.request(document.querySelector('#passwordPasswordAskInputId').value, 'pass', pass.value);
                    pass.value = '';
                    document.querySelector('#setting_password2_input_id').value = '';
                }
            } else this.setState({isPasswordPasswordAsk: true})
        }
    };

    renderConfig() {

        return <form id="form_app_settings">

            <div className="card border-light mb-3">

                <div className="card-header" onClick={(e) => {
                    const nextDiv = e.currentTarget.nextSibling
                    nextDiv.classList.contains('hideBlock')
                        ?  nextDiv.classList.remove('hideBlock')
                        :  nextDiv.classList.add('hideBlock')
                }}>
                    Ремонт
                </div>

                <div className="card-body">

                    <div className="form-row">
                        <div className="form-group col">
                            <label htmlFor="rem_sum">Стоимость ремонта по умолчанию</label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.rem_sum}
                                       onChange={e => this.requestSettings('changeConfig', '', 'rem_sum', e.target.value)}
                                />
                                <div className="input-group-append">
                                    <span className="input-group-text">RUR</span>
                                </div>
                            </div>
                        </div>
                        <div className="form-group col">
                            <label htmlFor="rem_assessed_value">Оценочная стоимость оборудования</label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.rem_assessed_value}
                                       onChange={e => this.requestSettings('changeConfig', '', 'rem_assessed_value', e.target.value)}
                                />
                                <div className="input-group-append">
                                    <span className="input-group-text">RUR</span>
                                </div>
                            </div>
                        </div>
                        <div className="form-group col">
                            <label htmlFor="remont_warranty">Срок гарантии</label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.remont_warranty}
                                       onChange={e => this.requestSettings('changeConfig', '', 'remont_warranty', e.target.value)}
                                />
                                <div className="input-group-append"><span className="input-group-text">дней</span>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col">
                            <label htmlFor="free_save">Срок бесплатного хранения после ремонта</label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.free_save}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'free_save', e.target.value)}
                                />
                                <div className="input-group-append"><span className="input-group-text">дней</span>
                                </div>

                            </div>
                        </div>
                        <div className="form-group col">
                            <label htmlFor="prepayment">Предоплата</label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.prepayment}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'prepayment', e.target.value)}
                                />
                                <div className="input-group-append"><span
                                    className="input-group-text">RUR</span></div>

                            </div>
                        </div>
                        <div className="form-group col">
                            <label htmlFor="time_remont">Срок ремонта</label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.time_remont}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'time_remont', e.target.value)}
                                />
                                <div className="input-group-append"><span className="input-group-text">дней</span>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <div className="card border-light mb-3">

                <div className="card-header" onClick={(e) => {
                    const nextDiv = e.currentTarget.nextSibling
                    nextDiv.classList.contains('hideBlock')
                        ?  nextDiv.classList.remove('hideBlock')
                        :  nextDiv.classList.add('hideBlock')
                }}>
                    Залог
                </div>

                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group col">
                            <label htmlFor="zalog_min_sum">Минимальная переплата за залог</label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zalog_min_sum}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zalog_min_sum', e.target.value)}
                                />
                                <div className="input-group-append"><span
                                    className="input-group-text">RUR</span></div>

                            </div>
                        </div>

                        <div className="form-group col">
                            <label htmlFor="zalog_day_percent">Ежедневный процент за залог</label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zalog_day_percent}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zalog_day_percent', e.target.value)}
                                />
                                <div className="input-group-append"><span className="input-group-text">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="card border-light mb-3">
                <div className="card-header" onClick={(e) => {
                    const nextDiv = e.currentTarget.nextSibling
                    nextDiv.classList.contains('hideBlock')
                        ?  nextDiv.classList.remove('hideBlock')
                        :  nextDiv.classList.add('hideBlock')
                }}>
                    Зарплата
                </div>
                <div className="card-body">

                    <h5 className="card-title roll">За заказы</h5>
                    <div className="form-row">

                        <div className="form-group col-12">
                            <div className="form-group form-check">
                                <input type="checkbox" className="form-check-input"
                                       defaultValue={this.props.app.config.zp_for_take}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_for_take', e.target.checked)}
                                />
                                <label htmlFor="zp_for_take">
                                    Включить зарплату за приемку в себестоимость заказа и считать непосредственно тому
                                    кто принял
                                </label>
                            </div>
                        </div>

                        <div className="form-group col-12">
                            <label htmlFor="zp_take_min_sum">
                                Минимальная сумма с которой считать что заказ выгодный и с него платить за приемку
                            </label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zp_take_min_sum}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_take_min_sum', e.target.value)}
                                />
                                <div className="input-group-append"><span
                                    className="input-group-text">RUR</span></div>

                            </div>
                        </div>

                        <div className="col-12">Cумма за прием заказа (по точкам)</div>

                        <div className="form-group col-12">
                            <label htmlFor="zp_add_part">Сумма за внесение запчастей</label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zp_add_part}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_add_part', e.target.value)}
                                />
                                <div className="input-group-append"><span
                                    className="input-group-text">RUR</span></div>
                            </div>
                        </div>

                        <div className="form-group col-6">
                            <div className="form-group form-check">
                                <input type="checkbox" className="form-check-input"
                                       defaultValue={this.props.app.config.zp_for_checkout}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_for_checkout', e.target.checked)}
                                />
                                <label htmlFor="zp_for_checkout">
                                    Включить зарплату за закрытие в себестоимость заказа и начислить тому кто
                                    непосредственно закрыл
                                </label>
                            </div>
                        </div>

                        <div className="form-group col-6">
                            <label htmlFor="zp_saler_per">
                                Процент за закрытие заказа
                            </label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zp_saler_per}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_saler_per', e.target.value)}
                                />
                                <div className="input-group-append"><span className="input-group-text">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group col-12">
                            <label htmlFor="zp_master_per">
                                Процент мастеру за выполнение заказа
                            </label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zp_master_per}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_master_per', e.target.value)}
                                />
                                <div className="input-group-append"><span className="input-group-text">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group col-12">
                            <label htmlFor="zp_repeat_per">
                                Уменьшение процента мастеру за выполнение заказа при повторном обращении по гарантии
                            </label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zp_repeat_per}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_repeat_per', e.target.value)}
                                />
                                <div className="input-group-append"><span className="input-group-text">%</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <h5 className="card-title roll">За товары</h5>
                    <div className="form-row">
                        <div className="form-group col-auto">
                            <label htmlFor="zp_salary_buy">
                                За покупку техники
                            </label>
                            <div className="input-group input-group-sm">
                                <input type="text" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zp_salary_buy}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_salary_buy', e.target.value)}
                                />
                                <div className="input-group-append"><span
                                    className="input-group-text">RUR</span></div>
                            </div>
                        </div>

                        <div className="form-group col-auto">
                            <label htmlFor="zp_salary_zalog">
                                За залог
                            </label>
                            <div className="input-group input-group-sm">
                                <input type="text" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zp_salary_zalog}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_salary_zalog', e.target.value)}
                                />
                                <div className="input-group-append"><span
                                    className="input-group-text">RUR</span></div>

                            </div>
                        </div>

                        <div className="form-group col-auto">
                            <label htmlFor="zp_salary_sell">За продажу техники</label>
                            <div className="input-group input-group-sm">
                                <input type="text" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zp_salary_sell}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_salary_sell', e.target.value)}
                                />
                                <div className="input-group-append"><span
                                    className="input-group-text">%</span></div>

                            </div>
                        </div>

                        <div className="form-group col-auto">
                            <label htmlFor="zp_salary_goods">За продажу аксессуаров</label>
                            <div className="input-group input-group-sm">
                                <input type="text" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zp_salary_goods}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_salary_goods', e.target.value)}
                                />
                                <div className="input-group-append"><span
                                    className="input-group-text">%</span></div>

                            </div>
                        </div>
                    </div>

                    <h5 className="card-title roll">За выход</h5>
                    <div className="form-row">
                        <div className="form-group col-12">
                            <label htmlFor="zp_daily_min">Минимальная зарплата продавца-приемщика в день</label>
                            <div className="input-group input-group-sm">
                                <input type="text" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.zp_daily_min}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'zp_daily_min', e.target.value)}
                                />
                                <div className="input-group-append"><span
                                    className="input-group-text">RUR</span></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="card border-light mb-3">
                <div className="card-header" onClick={(e) => {
                    const nextDiv = e.currentTarget.nextSibling
                    nextDiv.classList.contains('hideBlock')
                        ?  nextDiv.classList.remove('hideBlock')
                        :  nextDiv.classList.add('hideBlock')
                }}>
                    Локация
                </div>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group col-12">
                            <div className="form-group form-check">
                                <input type="checkbox" className="form-check-input"
                                       defaultValue={this.props.app.config.one_point}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'one_point', e.target.checked)}
                                />
                                <label htmlFor="one_point">Привязать сотрудника к точке</label>
                            </div>
                        </div>
                        <div className="form-group col-12">
                            <div className="form-group form-check">
                                <input type="checkbox" className="form-check-input"
                                       defaultValue={this.props.app.config.location_check}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'location_check', e.target.checked)}
                                />
                                <label htmlFor="location_check">Проверять локацию при авторизации на точке</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-light mb-3">
                <div className="card-header" onClick={(e) => {
                    const nextDiv = e.currentTarget.nextSibling
                    nextDiv.classList.contains('hideBlock')
                        ?  nextDiv.classList.remove('hideBlock')
                        :  nextDiv.classList.add('hideBlock')
                }}>
                    Гарантийные обязательства
                </div>
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group col-auto">
                            <label htmlFor="goods_phones_warranty">Гарантийный срок при продаже техники</label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.goods_phones_warranty}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'goods_phones_warranty', e.target.value)}
                                />
                                <div className="input-group-append"><span className="input-group-text">дней</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group col-auto">
                            <label htmlFor="goods_accessories_warranty">
                                Гарантийный срок при продаже остальных товаров
                            </label>
                            <div className="input-group input-group-sm">
                                <input type="number" className="form-control form-control-sm"
                                       defaultValue={this.props.app.config.goods_accessories_warranty}
                                       onChange={(e) => this.requestSettings('changeConfig', '', 'goods_accessories_warranty', e.target.value)}
                                />
                                <div className="input-group-append"><span className="input-group-text">дней</span>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </form>

    }

    renderDocs() {
        return <CKEditor/>
    }

    renderOwnSettings() {
        return <div>

            {this.props.auth.admin ?
                authControl.renderUserNameDiv(
                    'setting_user_name_input_id',
                    this.state.isUserNamePasswordAsk || !this.props.auth.admin) :
                ''}
            {this.state.isUserNamePasswordAsk ?
                authControl.renderPasswordDiv(
                    '',
                    'userNamePasswordAskInputId',
                    '',
                    'Текущий пароль') :
                ''}
            {this.state.isUserNamePasswordAsk ?
                <MDBBtn color="danger" onClick={() => {
                    this.setState({isUserNamePasswordAsk: false});
                }}>
                    Отмена
                </MDBBtn> :
                ''}
            <MDBBtn color="blue" onClick={this.userNameHandler}>Изменить имя пользователя</MDBBtn>

            {authControl.renderEmailDiv(
                '',
                'setting_email_input_id',
                authControl.validate_email,
                this.state.isEmailPasswordAsk || this.state.isEmailConfirm)
            }
            {this.state.isEmailPasswordAsk ?
                authControl.renderPasswordDiv(
                    '',
                    'emailPasswordAskInputId',
                    '',
                    'Текущий пароль',
                    this.state.isEmailConfirm) : ''
            }
            {this.state.isEmailConfirm ?
                authControl.renderConfirmationCodeDiv(
                    'setting_email_confirmation_code_input_id',
                    'Подтверждение Email') : ''
            }
            {(this.state.isEmailPasswordAsk || this.state.isEmailConfirm) ?
                <MDBBtn color="danger" onClick={() => this.setState({
                    isEmailPasswordAsk: false,
                    isEmailConfirm: false
                })}>Отмена</MDBBtn> : ''}
            <MDBBtn color="blue" onClick={this.emailHandler}>Изменить email</MDBBtn>

            {authControl.renderPhoneNumberDiv(
                '',
                'setting_phone_number_input_id',
                authControl.validate_phone_number,
                this.state.isPhoneNumberPasswordAsk || this.state.isPhoneNumberConfirm)
            }
            {this.state.isPhoneNumberPasswordAsk ?
                authControl.renderPasswordDiv(
                    '',
                    'phoneNumberPasswordAskInputId',
                    '',
                    'Текущий пароль',
                    this.state.isPhoneNumberConfirm) : ''
            }
            {this.state.isPhoneNumberConfirm ?
                authControl.renderConfirmationCodeDiv(
                    'setting_phone_number_confirmation_code_input_id',
                    'Подтверждение номера телефона') : ''
            }
            {(this.state.isPhoneNumberPasswordAsk || this.state.isPhoneNumberConfirm) ?
                <MDBBtn color="danger" onClick={() => this.setState({
                    isPhoneNumberPasswordAsk: false,
                    isPhoneNumberConfirm: false
                })}>Отмена</MDBBtn> : ''}
            <MDBBtn color="blue" onClick={this.phoneNunberHandler}>Изменить номер телефона</MDBBtn>

            {authControl.renderPasswordDiv(
                '',
                'setting_password_input_id',
                '',
                'Новый пароль',
                this.state.isPasswordPasswordAsk)
            }
            {authControl.renderPasswordDiv(
                '',
                'setting_password2_input_id',
                '',
                'Новый пароль еще раз',
                this.state.isPasswordPasswordAsk)
            }
            {this.state.isPasswordPasswordAsk ?
                authControl.renderPasswordDiv(
                    '',
                    'passwordPasswordAskInputId',
                    '',
                    'Текущий пароль') :
                ''}
            {this.state.isPasswordPasswordAsk ?
                <MDBBtn color="danger" onClick={() => {
                    this.setState({isPasswordPasswordAsk: false});
                }}>
                    Отмена
                </MDBBtn> :
                ''}
            <MDBBtn color="blue" onClick={this.passwordHandler}>Изменить пароль</MDBBtn>

        </div>
    }

    renderOrganization() {

        return <Grid container direction="row" className="m-2 p-3">

            <FormControl fullWidth variant="filled" className="w-75 m-1">
                <InputLabel className="mt-2 font-weight-bold">Название:</InputLabel>
                <FilledInput
                    id="organizationName"
                    defaultValue={this.props.app.organization.name}
                    onBlur={(e) => this.requestSettings('changeOrganization', '', 'name', e.target.value)}
                />
            </FormControl>

            <Autocomplete
                options={this.state.autocomplete}
                inputValue={this.state.innValue}
                onInputChange={(e, v) => this.getSuggest(e, v)}
                onChange={(e, v) => this.setInn(e, v)}
                getOptionLabel={option => (option.string)}
                className="w-75 m-1"
                renderInput={params => (
                    <TextField {...params}
                               label="ИНН"
                               variant="filled"
                               fullWidth
                    />
                )}
            />

            <FormControl fullWidth variant="filled" className="w-75 m-1">
                <InputLabel className="mt-2 font-weight-bold">КПП:</InputLabel>
                <FilledInput
                    id="organizationKpp"
                    defaultValue={this.props.app.organization.kpp}
                    onBlur={(e) => this.requestSettings('changeOrganization', '', 'kpp', e.target.value)}
                />
            </FormControl>
            <FormControl fullWidth variant="filled" className="w-75 m-1">
                <InputLabel className="mt-2 font-weight-bold">ОГРН:</InputLabel>
                <FilledInput
                    id="organizationOgrn"
                    defaultValue={this.props.app.organization.ogrn}
                    onBlur={(e) => this.requestSettings('changeOrganization', '', 'ogrn', e.target.value)}
                />
            </FormControl>
            <FormControl fullWidth variant="filled" className="w-75 m-1">
                <InputLabel className="mt-2 font-weight-bold">Юридическое наименование:</InputLabel>
                <FilledInput
                    id="organizationOrganization"
                    defaultValue={this.props.app.organization.organization}
                    onBlur={(e) => this.requestSettings('changeOrganization', '', 'organization', e.target.value)}
                />
            </FormControl>
            <FormControl fullWidth variant="filled" className="w-75 m-1">
                <InputLabel className="mt-2 font-weight-bold">Юридический адрес:</InputLabel>
                <FilledInput
                    id="organizationLegalAddress"
                    defaultValue={this.props.app.organization.legal_address}
                    onBlur={(e) => this.requestSettings('changeOrganization', '', 'legal_address', e.target.value)}
                />
            </FormControl>
            <FormControl fullWidth variant="filled" className="w-75 m-1">
                <InputLabel className="mt-2 font-weight-bold">ОКВЕД:</InputLabel>
                <FilledInput
                    id="organizationOkved"
                    defaultValue={this.props.app.organization.okved}
                    onBlur={(e) => this.requestSettings('changeOrganization', '', 'okved', e.target.value)}
                />
            </FormControl>
            <FormControl fullWidth variant="filled" className="w-75 m-1">
                <InputLabel className="mt-2 font-weight-bold">БИК:</InputLabel>
                <FilledInput
                    defaultValue={this.props.app.organization.bank_code}
                    onBlur={(e) => this.requestSettings('changeOrganization', '', 'bank_code', e.target.value)}
                />
            </FormControl>

            <FormControl fullWidth variant="filled" className="w-75 m-1">
                <FilledInput
                    readOnly
                    value={this.state.bankName ? this.state.bankName : "Банк"}
                />
            </FormControl>
            <FormControl fullWidth variant="filled" className="w-75 m-1">
                <InputLabel className="mt-2 font-weight-bold">Расчетный счет:</InputLabel>
                <FilledInput
                    defaultValue={this.props.app.organization.settlement_number}
                    onBlur={(e) => this.requestSettings('changeOrganization', '', 'settlement_number', e.target.value)}
                />
            </FormControl>

        </Grid>
    }

    renderEmployee() {
        return this.props.app.users.map(v => {
            if (typeof (v.verified_contact) === 'string') return (
                <Grid container direction="row" className="hoverable m-2 p-3" key={"grusKey" + v.id}>
                    <Grid item xs={9}>
                        <InputLabel className="mt-2 font-weight-bold">Ждет подтверждения:</InputLabel>
                    </Grid>
                    <Grid item xs={3}>
                        <IconButton color="secondary"
                                    onClick={() => this.requestSettings('deleteWait', '', '', v.verified_contact)}>
                            <DeleteIcon/>
                        </IconButton>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            defaultValue={v.verified_contact} className="w-75" InputProps={{
                            readOnly: true,
                        }}
                        />
                    </Grid>
                </Grid>
            )
            else return (
                <Grid container direction="row" className="hoverable m-2 p-3" key={"grusKey" + v.id}>
                    <Grid item xs={6}>
                        <Typography variant="h3">
                            <i className="fas fa-user"/>
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControlLabel
                            label={v.is_valid ? 'Работает' : 'Уволен'}
                            control={<Switch checked={v.is_valid}
                                             onChange={(e) => this.requestSettings('changeEmployee', v.id, 'is_valid', e.target.checked)}
                                             color="primary"/>}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel className="mt-2 font-weight-bold">Имя:</InputLabel>
                        <TextField
                            defaultValue={v.name} className="w-75"
                            onBlur={(e) => this.requestSettings('changeEmployee', v.id, 'user', e.target.value)}
                        />
                    </Grid>
                </Grid>
            )
        })
    }

    renderPoints() {
        return this.props.app.stocks.map(v => {
            return (
                <Grid container direction="row" className="hoverable m-2 p-3" key={"grKey" + v.id}>
                    <Grid item xs={9}>
                        <Typography variant="h3">
                            <i className="fas fa-store"/>
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <FormControlLabel
                            label={v.is_valid ? 'Активна' : 'Не активна'}
                            control={<Switch checked={v.is_valid}
                                             onChange={e => this.requestSettings('changePoint', v.id, 'is_valid', e.target.checked)}
                                             color="primary"/>}
                        />
                        {/*{!v.is_valid && v.canDelete ?*/}
                        {/*    <IconButton color="secondary" onClick={() => this.deletePoint(v.id)}>*/}
                        {/*        <DeleteIcon/>*/}
                        {/*    </IconButton> : ''}*/}
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel className="mt-2 font-weight-bold">Название:</InputLabel>
                        <TextField
                            defaultValue={v.name} className="w-75"
                            onBlur={e => this.requestSettings('changePoint', v.id, 'name', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel className="mt-2 font-weight-bold">Адрес:</InputLabel>
                        <TextField
                            defaultValue={v.address} className="w-75"
                            onBlur={(e) => this.requestSettings('changePoint', v.id, 'address', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel className="mt-2 font-weight-bold">Телефон:</InputLabel>
                        <TextField
                            defaultValue={v.phone_number} className="w-75"
                            onBlur={e => this.requestSettings('changePoint', v.id, 'phone_number', e.target.value)}
                        />
                    </Grid>
                </Grid>
            )
        })
    }

    render() {
        return this.props.auth.admin ?
            <Grid container item xs={12} className="m-3">
                <MyAppBar position="static">
                    <Tabs value={this.state.tab}
                          onChange={this.tabChange}
                          variant="scrollable"
                          scrollButtons="on"
                          indicatorColor="primary"
                    >
                        <Tab className="MyAppBar__item" label="Личные"/>
                        <Tab className="MyAppBar__item" label="Организация"/>
                        <Tab className="MyAppBar__item" label="Сотрудники"/>
                        <Tab className="MyAppBar__item" label="Точки"/>
                        <Tab className="MyAppBar__item" label="Программа"/>
                        <Tab className="MyAppBar__item" label="Документы"/>
                    </Tabs>
                </MyAppBar>
                <SwipeableViews enableMouseEvents
                                index={this.state.tab}
                                onChangeIndex={this.handleChangeIndex}
                >
                    <TabPanel value={this.state.tab} index={0}>
                        {this.renderOwnSettings()}
                    </TabPanel>
                    <TabPanel value={this.state.tab} index={1}>
                        {this.renderOrganization()}
                    </TabPanel>
                    <TabPanel value={this.state.tab} index={2}>
                        {this.renderEmployee()}
                    </TabPanel>
                    <TabPanel value={this.state.tab} index={3}>
                        {this.renderPoints()}
                    </TabPanel>
                    <TabPanel value={this.state.tab} index={4}>
                        {this.renderConfig()}
                    </TabPanel>
                    <TabPanel value={this.state.tab} index={5}>
                        {this.renderDocs()}
                    </TabPanel>
                </SwipeableViews>
                {this.state.isAddEmployee && this.state.tab === 2 ?
                    this.renderAddEmployee() : this.renderFab()}
                {this.state.isCanAddEmployee && this.state.tab === 2 ?
                    this.renderAddEmployeeEnter() : ''}
            </Grid> :
            <div className="container-fluid m-4">{this.renderOwnSettings()}</div>;
    }

});
