import React, {Component, useEffect, useState} from 'react';
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import request from "./../Request";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {upd_app} from "../../actions/actionCreator";

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

import rest from './../Rest'

const mapDispatchToProps = dispatch => bindActionCreators({
    upd_app
}, dispatch);

let serverDocs = {};

const monthes = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];

const Docs = props => {

    const [buttonListIsOpen, setButtonListIsOpen] = useState({})
    const [currentDocument, setCurrentDocument] = useState(6)
    // const [docs, setDocs] = useState([])
    const [editor, setEditor] = useState({})

    const [providerId, setProviderId] = useState(() => {
        return props.app.providers[0].id
    })
    const [orderId, setOrderId] = useState()
    const [customerId, setCustomerId] = useState()
    const [goodId, setGoodId] = useState()

    // const [providerIds, setProviderIds] = useState([])
    const [orderIds, setOrderIds] = useState([])
    const [customerIds, setCustomerIds] = useState([])
    const [goodIds, setGoodIds] = useState([])


    useEffect(() => {

        if (props.app.stock_id) {

            rest('docs/' + props.app.stock_id)
                .then(data => {

                    // console.log(data)

                })

        }

    }, [props.app.stock_id])

    const handleOrderChange = orderId => {

        rest('orders/' + props.app.stock_id + '/' + orderId)
            .then(data => {

                // console.log(data)

            })
    }

    const handleCustomerChange = e => {

        request({
            action: 'getCustomer',
            stockId: props.app.stock_id,
            customerId: e.target.value,
        }, '/settings', props.auth.jwt)
            .then(data => {

                if (data.result) {
                    let newDocs = props.app.docs;
                    newDocs.currentCustomer = data.currentCustomer;
                    updPropsDocs(newDocs);
                }
            })

    }

    const handleProviderChange = e => {

        request({
            action: 'getProvider',
            stockId: props.app.stock_id,
            providerId: e.target.value,
        }, '/settings', props.auth.jwt)
            .then(data => {

                if (data.result) {
                    let newDocs = props.app.docs;
                    newDocs.currentProvider = data.currentProvider;
                    updPropsDocs(newDocs);
                }
            })
    }

    const handleGoodChange = (e) => {

        request({
            action: 'getGood',
            goodId: e.target.value,
        }, '/settings', props.auth.jwt)
            .then(data => {

                if (data.result) {
                    let newDocs = props.app.docs;
                    newDocs.currentGood = data.currentGood;
                    updPropsDocs(newDocs);
                }
            })

    }

    const inputToA = html => {

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
                    for (let val in props.app.fields.allElements) {
                        props.app.fields.allElements[val].map(v => {
                            if (v.name === name) value = v.value;
                        })
                    }
                    if (value === 'НЕИЗВЕСТНАЯ ПЕРЕМЕННАЯ') console.log(name, value)

                    value = value.charAt(0).toUpperCase() + value.substr(1).toLowerCase();
                    inputs[0].replaceWith(createA(value));
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

    const aToInput = (html, needValues = false) => {

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
            for (let val in props.app.fields.allElements) {
                props.app.fields.allElements[val].map(v => {
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
                let currentStock = props.app.stocks.find(v => props.app.stock_id === +v.id);
                let date = new Date();

                const orderIndexes = ['id', 'visual_defects', 'for_client', 'sum', 'sum2', 'defect', 'password'];
                if (orderIndexes.indexOf(name) !== -1) {
                    value = props.app.docs.currentOrder[name];
                }
                const customerIndexes = ['fio', 'phone_number', 'referalId', 'birthday', 'birthPlace', 'doc_sn', 'doc_date', 'doc_division_name', 'doc_division_code', 'address'];
                if (customerIndexes.indexOf(name) !== -1) {
                    value = props.app.docs.currentCustomer[name];
                }

                const providerIndexes = ['name'];
                if (providerIndexes.indexOf(name) !== -1) {
                    value = props.app.docs.currentProvider[name];
                }

                const configIndexes = ['free_save', 'cost_after_free', 'days_after_finished_notification', 'remont_warranty', 'time_remont'];
                if (configIndexes.indexOf(name) !== -1) {
                    value = props.app.config[name];
                }
                const goodIndexes = ['group', 'model', 'imei', 'cost'];
                if (goodIndexes.indexOf(name) !== -1) {
                    value = props.app.docs.currentGood[name];
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
                            let json = JSON.parse(props.app.docs.currentOrder.json);
                            value = json.payments[0].sum;
                        } catch (e) {
                        }
                        break;
                    case 'equipment' :
                        value = 'equipment';
                        break;
                    // case 'master_id' :
                    //     value = props.app.users.find(v => +v.id === +currentOrder.master_id).name;
                    //     break;

                    case 'remark' :
                        try {
                            value = JSON.parse(props.app.docs.currentOrder.remark)[0]['remark'];
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
                        value = props.app.config.goods_phones_warranty;
                        break;
                    case 'organization_legal_address' :
                        value = props.app.organization.legal_address;
                        break;
                    case 'organization_ogrn' :
                        value = props.app.organization.ogrn;
                        break;
                    case 'organization_inn' :
                        value = props.app.organization.inn;
                        break;
                    case 'organization_kpp' :
                        value = props.app.organization.kpp;
                        break;
                    case 'organization_organization' :
                        value = props.app.organization.organization;
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

    const updProps = (isNeedUpdate, newText = false) => {

        let newDocs = props.app.docs;
        newDocs.isNeedUpdate = isNeedUpdate;
        if (newText !== false) newDocs.docs[currentDocument].doc_text = newText;
        updPropsDocs(newDocs);

    }

    const updPropsDocs = newDocs => {
        const {upd_app} = props;
        upd_app({docs: newDocs});
    }

    const saveDoc = () => {

        let name = props.app.docs.docs[currentDocument].doc_name;
        let textA = editor.getData();
        let text = aToInput(textA);

        if (!text) {
            console.log('U\'re try save blank')
            return false;
        }


        request({
            action: 'saveDoc',
            name,
            text
        }, '/settings', props.auth.jwt)
            .then(data => {

                if (data.result) {

                    serverDocs[currentDocument] = textA;
                    updProps(false, textA);

                }
            })

    }

    const createA = (v, needStr = false) => {

        let a = document.createElement('a');
        let div = document.createElement('div');
        a.innerHTML = v;
        a.href = v;
        div.append(a);
        return needStr ? div.innerHTML : a;

    }

    const insertVariable = (name, value, index) => {

        console.log(name, value, index)

        // let strA = createA(value, true);
        // let editor = editor;
        // let position = editor.model.document.selection.anchor;
        // editor.model.change(writer => writer.insert(strA, position))

    }

    const buttonListToggle = index => {

        setButtonListIsOpen(prev => {

            let newState = {...prev}

            newState[index] = !newState[index]

            return newState
        });

    }

    const renderButtons = () => {

        return Object.entries(props.app.fields.alliases)
            .map(([index, name]) =>

                <List component="nav"
                      key={'listdocsnavliehrv' + index}>
                    <ListItem button onClick={() => buttonListToggle(index)}>
                        <ListItemText primary={name}/>
                        {buttonListIsOpen[index]
                            ? <ExpandMore/>
                            : <ExpandLess/>}
                    </ListItem>

                    <Collapse in={buttonListIsOpen[index]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {Object.values(props.app.fields.allElements)
                                .filter(el => el.index === index)
                                .map(v => v.is_valid
                                    ? <ListItem button className=""
                                                key={'listkeydocskjhrv' + v.value}
                                                onClick={_ => insertVariable(v.name, v.value, index)}
                                    >
                                        <ListItemIcon>
                                            <AddIcon/>
                                        </ListItemIcon>
                                        <ListItemText primary={v.value}/>
                                    </ListItem>
                                    : null
                                )}

                        </List>
                    </Collapse>

                </List>
            )

    }

    if (+props.app.stock_id === 0) return <h3>Выберите точку</h3>;
    if (!props.app.docs.docs) return <h3>Получаем данные...</h3>;

    return (
        <div className="App">

            <FormControl variant="outlined">
                <Select
                    value={currentDocument}
                    onChange={e => setCurrentDocument(e.target.value)}
                    className="m-2 w-100"
                    autoWidth
                >
                    {props.app.docs.docs
                        .map((v, i) => <MenuItem value={i}
                                                 key={"sdocsSelectKey" + v.id}>
                            {v.doc_title}
                        </MenuItem>)}
                </Select>
            </FormControl>

            <Grid container spacing={2}>

                <Grid item xs={9}>

                    <CKEditor
                        editor={ClassicEditor}
                        config={
                            {language: 'ru'}
                        }
                        data={props.app.docs.docs[currentDocument].doc_text}
                        onChange={(event, editor) => {

                            let data = editor.getData();
                            if (!serverDocs[currentDocument]) serverDocs[currentDocument] = data;
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

                            // updProps(serverDocs[currentDocument] !== editor.getData())
                            updProps((serverDocs[currentDocument] !== editor.getData()) || needUpdate, data)

                        }}
                        onInit={editor => {
                            setEditor(editor)
                        }}
                        onBlur={(event, editor) => {

                        }}
                        onFocus={(event, editor) => {

                        }}
                    />

                    <Button variant="contained" color="primary"
                            disabled={!props.app.docs.isNeedUpdate}
                            onClick={() => saveDoc()} className="m-1">
                        Сохранить
                    </Button>

                    <h3>Результат:</h3>

                    <FormControl variant="outlined" className="m-2">
                        <InputLabel>
                            {props.app.fields.alliases.remont}
                        </InputLabel>
                        <Select
                            value={orderId}
                            onChange={e => setOrderId(e.target.value)}
                            className="m-2 w-100"
                            autoWidth
                        >
                            {orderIds.map(v =>
                                <MenuItem value={v} key={"sdocsSelectOrder" + v}>
                                    {v}
                                </MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" className="m-2">
                        <InputLabel>
                            {props.app.fields.alliases.customer}
                        </InputLabel>
                        <Select
                            value={props.app.docs.currentCustomer.id}
                            onChange={handleCustomerChange}
                            className="m-2 w-100"
                            autoWidth
                        >
                            {props.app.docs.customerIds.map(v =>
                                <MenuItem value={v} key={"sdocsSelectOrder" + v}>
                                    {v}
                                </MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" className="m-2">
                        <InputLabel>
                            {props.app.fields.alliases.providers}
                        </InputLabel>
                        <Select
                            value={props.app.docs.currentProvider.id}
                            onChange={handleProviderChange}
                            className="m-2 w-100"
                            autoWidth
                        >
                            {props.app.docs.providerIds.map(v =>
                                <MenuItem value={v} key={"sdocsSelectOrder" + v}>
                                    {v}
                                </MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" className="m-2">
                        <InputLabel>
                            {props.app.fields.alliases.good}
                        </InputLabel>
                        <Select
                            value={props.app.docs.currentGood.id}
                            onChange={handleGoodChange}
                            className="m-2 w-100"
                            autoWidth
                        >
                            {props.app.docs.goodIds.map(v =>
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
                            Object.keys(editor).length === 0
                                ? ''
                                : aToInput(editor.getData(), true)
                        }
                    />

                </Grid>

                <Grid item xs={3}>

                    {renderButtons()}

                </Grid>

            </Grid>

        </div>
    )

}

export default connect(state => state, mapDispatchToProps)(Docs);
