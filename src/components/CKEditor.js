import React, { Component } from 'react';
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import request from "./Request";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { closeSnackbar, enqueueSnackbar, upd_app } from "../actions/actionCreator";

import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '@ckeditor/ckeditor5-build-classic/build/translations/ru.js';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    upd_app
}, dispatch);

let serverDocs = {};

const monthes = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

export default connect(state => (state), mapDispatchToProps)(class extends Component {

    state = {
        docs: {
            docs: []
        },
        // orderIds: 0,
        // customerIds: 0,
        // goodIds: 0,
        currentDocument: 6,
        editor: {},
        buttonListIsOpen: {
            remont: true,
            customer: true,
            providers: true,
            good: true,
            common: true
        }
    };

    handleChange = (e) => this.setState({currentDocument: e.target.value})

    handleOrderChange = (e) => {

        request({
            action: 'getOrder',
            stockId: this.props.app.stock_id,
            orderId: e.target.value,
        }, '/settings', this.props.auth.jwt)
            .then(data => {
                console.log(data)

                if (data.result) {
                    let newDocs = this.props.app.docs;
                    newDocs.currentOrder = data.currentOrder;
                    this.updPropsDocs(newDocs);
                }
            })
    }

    handleCustomerChange = (e) => {


        request({
            action: 'getCustomer',
            stockId: this.props.app.stock_id,
            customerId: e.target.value,
        }, '/settings', this.props.auth.jwt)
            .then(data => {

                if (data.result) {
                    let newDocs = this.props.app.docs;
                    newDocs.currentCustomer = data.currentCustomer;
                    this.updPropsDocs(newDocs);
                }
            })

    }

    handleProviderChange = (e) => {


        request({
            action: 'getProvider',
            stockId: this.props.app.stock_id,
            providerId: e.target.value,
        }, '/settings', this.props.auth.jwt)
            .then(data => {

                if (data.result) {
                    let newDocs = this.props.app.docs;
                    newDocs.currentProvider = data.currentProvider;
                    this.updPropsDocs(newDocs);
                }
            })

    }

    handleGoodChange = (e) => {


        request({
            action: 'getGood',
            goodId: e.target.value,
        }, '/settings', this.props.auth.jwt)
            .then(data => {

                if (data.result) {
                    let newDocs = this.props.app.docs;
                    newDocs.currentGood = data.currentGood;
                    this.updPropsDocs(newDocs);
                }
            })

    }

    inputToA(html) {

        try {

            let offset = html.indexOf('<input');

            while (offset !== -1) {

                let offset2 = html.indexOf('>', offset);
                let beforeStr = html.slice(0, offset);
                let afterStr = html.slice(offset2 + 1);

                let div = document.createElement('div');
                div.innerHTML = html.slice(offset, offset2 + 1);       //<input type="button" name="date1" value="дата приема">
                let inputs = div.getElementsByTagName('input');

                if (inputs.length === 1) {

                    let name = inputs[0].getAttribute("name");
                    let value = 'НЕИЗВЕСТНАЯ ПЕРЕМЕННАЯ';
                    for (let val in this.props.app.fields.allElements) {
                        this.props.app.fields.allElements[val].map(v => {
                            if (v.name === name) value = v.value;
                        })
                    }
                    if (value === 'НЕИЗВЕСТНАЯ ПЕРЕМЕННАЯ') console.log(name, value)

                    value = value.charAt(0).toUpperCase() + value.substr(1).toLowerCase();
                    inputs[0].replaceWith(this.createA(value));
                } else {
                    console.log(html)
                }
                html = beforeStr + div.innerHTML + afterStr;

                offset = html.indexOf('<input');

            }
        } catch (e) {
        }
        return html;

    }

    aToInput(html, needValues = false) {

        let offset = html.indexOf('<a ');
        while (offset !== -1) {

            let offset2 = html.indexOf('</a>', offset);
            let beforeStr = html.slice(0, offset);
            let afterStr = html.slice(offset2 + 4);

            let div = document.createElement('div');
            div.innerHTML = html.slice(offset, offset2 + 4);       //<input type="button" name="date1" value="дата приема">

            let as = div.getElementsByTagName('a');
            let strongs = as[0].getElementsByTagName('strong');
            let value = strongs.length > 0 ? strongs[0].innerHTML : as[0].innerHTML;
            value = value.toLowerCase().trim();

            let [name, probablyName, probablyValue] = ['', '', ''];
            for (let val in this.props.app.fields.allElements) {
                this.props.app.fields.allElements[val].map(v => {
                    let needValue = v.value.toLowerCase().trim();
                    if (needValue === value) name = v.name;
                    else if (value.indexOf(needValue) !== -1) {
                        console.log('значение с лишней строкой', value);
                        probablyName = v.name;
                        probablyValue = needValue;
                    }
                })
            }
            // console.log(name, value)
            if (name === '') {
                if (probablyName !== '') {
                    [name, value] = [probablyName, probablyValue]
                } else {
                    console.log('value', value)
                    console.log('html', html)
                    return false
                }
            }

            if (needValues) {

                let span = document.createElement('span');
                let value = '';
                let currentStock = this.props.app.stocks.find(v => this.props.app.stock_id === +v.id);
                let date = new Date();

                const orderIndexes = ['id', 'visual_defects', 'for_client', 'sum', 'sum2', 'defect', 'password'];
                if (orderIndexes.indexOf(name) !== -1) {
                    value = this.props.app.docs.currentOrder[name];
                }
                const customerIndexes = ['fio', 'phone_number', 'referalId', 'birthday', 'birthPlace', 'doc_sn', 'doc_date', 'doc_division_name', 'doc_division_code', 'address'];
                if (customerIndexes.indexOf(name) !== -1) {
                    value = this.props.app.docs.currentCustomer[name];
                }

                const providerIndexes = ['name'];
                if (providerIndexes.indexOf(name) !== -1) {
                    value = this.props.app.docs.currentProvider[name];
                }

                const configIndexes = ['free_save', 'cost_after_free', 'days_after_finished_notification', 'remont_warranty', 'time_remont'];
                if (configIndexes.indexOf(name) !== -1) {
                    value = this.props.app.config[name];
                }
                const goodIndexes = ['group', 'model', 'imei', 'cost'];
                if (goodIndexes.indexOf(name) !== -1) {
                    value = this.props.app.docs.currentGood[name];
                }

                switch (name) {
                    case 'today' :
                        value = date.getDate() + ' ' + monthes[date.getMonth()].toLowerCase() + ' ' + date.getFullYear() + 'г.';
                        break;
                    case 'orderTime' :
                        value = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                        break;
                    case 'created_at' :
                        value = date.getDate() + ' ' + monthes[date.getMonth()].toLowerCase() + ' ' + date.getFullYear() + 'г. ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
                        break;
                    case 'key' :
                        value = 'uchet.store/c?298y;54opj;3;';
                        break;
                    case 'sbso' :
                        value = 'sbso';
                        break;
                    case 'prepaid' :
                        value = 0;
                        try {
                            let json = JSON.parse(this.props.app.docs.currentOrder.json);
                            value = json.payments[0].sum;
                        } catch (e) {
                        }
                        break;
                    case 'equipment' :
                        value = 'equipment';
                        break;
                    case 'master_id' :
                        value = this.props.app.users.find(v => +v.id === +this.state.currentOrder.master_id).name;
                        break;

                    case 'remark' :
                        try {
                            value = JSON.parse(this.props.app.docs.currentOrder.remark)[0]['remark'];
                        } catch (e) {
                        }
                        break;

                    // Showcase
                    case 'visualDefect' :
                        value = 'visualDefect';
                        break;
                    case 'ransomdate' :
                        value = '2020-01-31';
                        break;
                    case 'warranty' :
                        value = this.props.app.config.goods_phones_warranty;
                        break;
                    case 'organization_legal_address' :
                        value = this.props.app.organization.legal_address;
                        break;
                    case 'organization_ogrn' :
                        value = this.props.app.organization.ogrn;
                        break;
                    case 'organization_inn' :
                        value = this.props.app.organization.inn;
                        break;
                    case 'organization_kpp' :
                        value = this.props.app.organization.kpp;
                        break;
                    case 'organization_organization' :
                        value = this.props.app.organization.organization;
                        break;
                    case 'access_point_phone_number' :
                        value = currentStock.phone_number;
                        break;
                    case 'access_point_address' :
                        value = currentStock.address;
                        break;
                    case 'all_model' :
                        value = 'all_model';
                        break;
                    case 'name_sale' :
                        value = 'name_sale';
                        break;
                    default:
                        break;
                }

                span.innerHTML = value;
                as[0].replaceWith(span);

            } else {
                let input = document.createElement('input');
                input.setAttribute('type', 'button');
                input.setAttribute('name', name);
                input.setAttribute('value', value);
                as[0].replaceWith(input);
            }

            html = beforeStr + div.innerHTML + afterStr;

            offset = html.indexOf('<a ');

        }

        // console.log(html)
        // console.log('needValues', needValues)

        return html;

    }

    updProps(isNeedUpdate, newText = false) {

        let newDocs = this.props.app.docs;
        newDocs.isNeedUpdate = isNeedUpdate;
        if (newText !== false) newDocs.docs[this.state.currentDocument].doc_text = newText;
        this.updPropsDocs(newDocs);

    }

    updPropsDocs(newDocs) {
        const {upd_app} = this.props;
        upd_app({docs: newDocs});
    }

    saveDoc() {

        let name = this.props.app.docs.docs[this.state.currentDocument].doc_name;
        let textA = this.state.editor.getData();
        let text = this.aToInput(textA);

        if (!text) {
            console.log('U\'re try save blank')
            return false;
        }


        request({
            action: 'saveDoc',
            name,
            text
        }, '/settings', this.props.auth.jwt)
            .then(data => {

                if (data.result) {

                    serverDocs[this.state.currentDocument] = textA;
                    this.updProps(false, textA);

                }
            })

    }

    createA(v, needStr = false) {

        let a = document.createElement('a');
        let div = document.createElement('div');
        a.innerHTML = v;
        a.href = v;
        div.append(a);
        return needStr ? div.innerHTML : a;

    }

    insertVariable(name, value) {

        let strA = this.createA(value, true);
        let editor = this.state.editor;
        let position = editor.model.document.selection.anchor;
        editor.model.change(writer => writer.insert(strA, position))

    }

    buttonListToggle(index) {

        let buttonListIsOpen = this.state.buttonListIsOpen;
        buttonListIsOpen[index] = !buttonListIsOpen[index];
        this.setState({buttonListIsOpen});

    }

    renderButtons() {

        let variables = this.props.app.fields.allElements;
        if (typeof variables !== "object") return '';

        let arr = [];
        for (let i in variables) {

            arr.push(<List component="nav" key={'listdocsnavliehrv' + this.props.app.fields.alliases[i]}>
                <ListItem button onClick={() => this.buttonListToggle(i)}  key={'listdocswetwrbv' + this.props.app.fields.alliases[i]}>
                    <ListItemText primary={this.props.app.fields.alliases[i]}/>
                    {this.state.buttonListIsOpen[i] ? <ExpandMore/> : <ExpandLess/>}
                </ListItem>
                <Collapse in={this.state.buttonListIsOpen[i]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {variables[i].map(v => {
                            if (v.is_valid) {
                                return <ListItem button className=""
                                                 key={'listkeydocskjhrv' + v.value}
                                                 onClick={(e) => this.insertVariable(v.name, v.value)}
                                >
                                    <ListItemIcon>
                                        <AddIcon/>
                                    </ListItemIcon>
                                    <ListItemText primary={v.value}/>
                                </ListItem>
                            }
                        })}
                    </List>
                </Collapse>
            </List>)

        }
        return arr

    }

    render() {

        return '';

        if (this.props.app.stock_id === undefined) return <h3>Выберите точку</h3>;
        if (this.props.app.docs.docs === undefined) return <h3>Получаем данные...</h3>;
        return (
            <div className="App">

                <FormControl variant="outlined">
                    <Select
                        value={this.state.currentDocument}
                        onChange={this.handleChange}
                        className="m-2 w-100"
                        autoWidth
                    >
                        {this.props.app.docs.docs.map((v, i) => <MenuItem value={i}
                                                                          key={"sdocsSelectKey" + v.id}>{v.doc_title}</MenuItem>)}
                    </Select>
                </FormControl>

                <Grid container spacing={2}>

                    <Grid item xs={9}>

                        <CKEditor
                            editor={ClassicEditor}
                            config={
                                {language: 'ru'}
                            }
                            data={this.props.app.docs.docs[this.state.currentDocument].doc_text}
                            onChange={(event, editor) => {

                                let data = editor.getData();
                                if (!serverDocs[this.state.currentDocument]) serverDocs[this.state.currentDocument] = data;
                                let needUpdate = false;

                                let offset0 = data.indexOf('&nbsp;</a>');
                                while (offset0 !== -1) {

                                    // TODO убрать любой символ за ссылку

                                    let beforeStr = data.slice(0, offset0);
                                    let afterStr = data.slice(offset0 + 10);
                                    let middleStr = "</a>&nbsp;";
                                    data = beforeStr + middleStr + afterStr;
                                    offset0 = data.indexOf('&nbsp;</a>');
                                }

                                offset0 = data.indexOf('&lt;');
                                while (offset0 !== -1) {
                                    let offset1 = data.indexOf('&gt;', offset0);
                                    let beforeStr = data.slice(0, offset0);
                                    let middleStr = data.slice(offset0 + 4, offset1);
                                    let afterStr = data.slice(offset1 + 4);
                                    data = beforeStr + "<" + middleStr + ">" + afterStr;
                                    offset0 = data.indexOf('&lt;');
                                    needUpdate = true;
                                }

                                // this.updProps(serverDocs[this.state.currentDocument] !== this.state.editor.getData())
                                this.updProps((serverDocs[this.state.currentDocument] !== this.state.editor.getData()) || needUpdate, data)

                            }}
                            onInit={editor => {
                                this.setState({editor})
                            }}
                            onBlur={(event, editor) => {

                            }}
                            onFocus={(event, editor) => {

                            }}
                        />

                        <Button variant="contained" color="primary"
                                disabled={!this.props.app.docs.isNeedUpdate}
                                onClick={() => this.saveDoc()} className="m-1">
                            Сохранить
                        </Button>

                        <h3>Результат:</h3>

                        <FormControl variant="outlined" className="m-2">
                            <InputLabel>
                                {this.props.app.fields.alliases.remont}
                            </InputLabel>
                            <Select
                                value={this.props.app.docs.currentOrder.id}
                                onChange={this.handleOrderChange}
                                className="m-2 w-100"
                                autoWidth
                            >
                                {this.props.app.docs.orderIds.map((v) =>
                                    <MenuItem value={v} key={"sdocsSelectOrder" + v}>
                                        {v}
                                    </MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" className="m-2">
                            <InputLabel>
                                {this.props.app.fields.alliases.customer}
                            </InputLabel>
                            <Select
                                value={this.props.app.docs.currentCustomer.id}
                                onChange={this.handleCustomerChange}
                                className="m-2 w-100"
                                autoWidth
                            >
                                {this.props.app.docs.customerIds.map((v) =>
                                    <MenuItem value={v} key={"sdocsSelectOrder" + v}>
                                        {v}
                                    </MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" className="m-2">
                            <InputLabel>
                                {this.props.app.fields.alliases.providers}
                            </InputLabel>
                            <Select
                                value={this.props.app.docs.currentProvider.id}
                                onChange={this.handleProviderChange}
                                className="m-2 w-100"
                                autoWidth
                            >
                                {this.props.app.docs.providerIds.map((v) =>
                                    <MenuItem value={v} key={"sdocsSelectOrder" + v}>
                                        {v}
                                    </MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" className="m-2">
                            <InputLabel>
                                {this.props.app.fields.alliases.good}
                            </InputLabel>
                            <Select
                                value={this.props.app.docs.currentGood.id}
                                onChange={this.handleGoodChange}
                                className="m-2 w-100"
                                autoWidth
                            >
                                {this.props.app.docs.goodIds.map((v) =>
                                    <MenuItem value={v} key={"sdocsSelectOrder" + v}>
                                        {v}
                                    </MenuItem>)}
                            </Select>
                        </FormControl>

                        <CKEditor
                            editor={ClassicEditor}
                            disabled={true}
                            config={
                                {
                                    toolbar: [],
                                    removePlugins: ['Heading', 'Link'],
                                    isReadOnly: true,
                                }
                            }
                            data={
                                Object.keys(this.state.editor).length === 0 ?
                                    '' : this.aToInput(this.state.editor.getData(), true)
                            }
                        />

                    </Grid>

                    <Grid item xs={3}>

                        {this.renderButtons()}

                    </Grid>

                </Grid>

            </div>
        );
    }

})