import React, {useEffect, useRef, useState} from "react";
import {Route} from "react-router-dom";
import {connect} from "react-redux";

import "./index.css";
import Header from "./components/Header";
import Customers from "./components/Customers";
import {Customer} from "./components/common/Customer";
import Entities from "./components/Entities";
import Entity from "./components/Entity";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Settings from "./components/Settings";
import Subscribe from "./components/Subscribe";
import Queue from "./components/Queue";
import WebSocketAdapter from "./components/WebSocketAdapter";
import Orders from "./components/Orders";
import Order from "./components/Order";
import Consignment from "./components/Consignment";
import Consignments from "./components/Consignments";
import Transit from "./components/Transit";
import FundsFlow from "./components/FundsFlow";
import rest from "./components/Rest";
import GoodModal from "./components/Modals/Good";
import {Barcodes} from "./components/Barcodes";
import Config from "./components/Settings/Config";
import Organization from "./components/Settings/Organization";
import Employees from "./components/Settings/Employees";
import Stocks from "./components/Settings/Stocks";
import Stock from "./components/Settings/Stock"
import Fields from "./components/Settings/Fields";
import IntegrationMango from "./components/IntegrationMango";
import IntegrationSmsRu from "./components/IntegrationSmsRu";
import {Records} from "./components/Records";
// import Docs from "./components/Settings/Docs";
import Daily from "./components/Daily";
import LoginModal from "./components/LoginModal";
import Prepaids from "./components/Prepaids";
import {bindActionCreators} from "redux";
import {init_user, upd_app} from "./actions/actionCreator";


const parseJwt = token => {

    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(jsonPayload)
    } catch (e) {
        console.log('parseJwt error', e)
        return false
    }

}

const App = props => {

    const [good, setGood] = useState({})

    const [orderBarcode, setOrderBarcode] = useState()
    const [ourBarcode, setOurBarcode] = useState()
    const [globalBarcode, setGlobalBarcode] = useState()
    const [enterPress, setEnterPress] = useState(false)

    const barcode = useRef('')

    const isBarcodeValid = barcode => {

        const checkInt = +barcode.slice(-1)

        let checkSum = 0

        barcode.split('').reverse().slice(1).map((n, i) => {

            checkSum += i % 2 ? +n : +n * 3

        })

        checkSum = +checkSum.toString().slice(-1)

        return !(checkInt || checkSum) || checkInt === 10 - checkSum

    }

    useEffect(() => {

        document.addEventListener('keydown', handleKeyPress)

        window.location.search
            .replace('?', '')
            .split('&')
            .map(str => {
                const param = str.split('=')
                if (param[0] === 'jwt') {

                    const jwt = param[1]
                    let payload = parseJwt(jwt)
                    if (typeof payload !== 'object') return false

                    props.init_user(jwt, +payload.user_id, +payload.organization_id, payload.admin, payload.exp, payload.position_id)

                    window.location.search = ''
                }
            })


// eslint-disable-next-line
    }, [])

    useEffect(() => {

        if (!ourBarcode) return

        if (!['/transit'].includes(window.location.pathname)) {

            rest("goods/" + ourBarcode)
                .then(res => {

                    if (res.ok && res.status === 200) {

                        setGood(res.body)

                    }
                })

        }

    }, [ourBarcode])

    useEffect(() => {

        if (props.app.version && props.app.version !== 1) {

            console.log('need reload')

            // window.location.reload();

        }

    }, [props.app.version])

    const handleKeyPress = e => {

        if (e.key === "Enter") {

            if (window.location.pathname === '/orders' || !barcode.current) {

                setEnterPress(true)
                setEnterPress(false)

                return

            }

            if (["112116", "103100"].includes(barcode.current.substr(0, 6)) || barcode.current.length === 15) {

                setOurBarcode(barcode.current)
                setOurBarcode()

            } else if (barcode.current.substr(0, 1) === "R" && barcode.current.length === 13) {

                setOrderBarcode(barcode.current)
                setOrderBarcode()

            } else if (isBarcodeValid(barcode.current)) {

                setGlobalBarcode(barcode.current)
                setGlobalBarcode()

            }

            barcode.current = ''

        } else {

            let newChar = String.fromCharCode(e.keyCode);

            // if (newChar === "R") barcode.current = 'R'
            // else

            if (e.keyCode > 47 && e.keyCode < 58) barcode.current = barcode.current + newChar

        }

    }

    const closeGoodModal = () => {
        setGood({})
        setOurBarcode()
    }

    const expire = !(+props.auth.user_id && props.auth.expiration_time > Math.round(new Date().getTime() / 1000.0))

    return <>

        <Header className={'d-print-none'}/>

        <div className="d-flex d-print-none" id="wrapper">
            <Sidebar/>
            <div id="sidebaredivider"/>

            <LoginModal
                isOpen={!+props.auth.user_id}
                close={() => console.log('close')}
                parseJwt={parseJwt}
            />

            <GoodModal
                good={good}
                close={closeGoodModal}
            />

            {!expire && <WebSocketAdapter/>}

            {+props.auth.user_id
                ? expire
                    ? <Subscribe/>
                    : <div className="m-2 p-2">

                        <Route exact path="/" component={Main}/>
                        <Route path="/barcodes" component={Barcodes(['123456789012'])}/>
                        <Route exact path="/settings" component={Settings}/>
                        <Route path="/subscribe" component={Subscribe}/>

                        {props.app.stocks[0] && <>
                            <Route path="/daily"
                                   render={props => <Daily
                                       setOurBarcode={setOurBarcode}
                                       {...props}
                                   />}
                            />
                        </>}

                        <Route exact path="/prepaids" component={Prepaids}/>
                        <Route exact path="/customers" component={Customers}/>
                        <Route exact path="/customers/:id" component={Customer}/>
                        <Route exact path="/entities" component={Entities}/>
                        {props.app.fields.allElements &&
                        <Route exact path="/entities/:id" component={Entity}/>
                        }

                        <Route path="/call_records" component={Records}/>
                        <Route path="/orders" render={props => <Orders
                            enterPress={enterPress}
                            {...props}
                        />}/>
                        {props.app.users[0] && <Route path="/queue" component={Queue}/>}

                        <Route path="/order" component={Order}/>

                        {!props.app.stock_id || <>
                            <Route path="/arrival" render={props => <Consignment
                                newScan={globalBarcode}
                                enterPress={enterPress}
                                {...props}
                            />}/>
                            <Route path="/consignments" component={Consignments}/>
                        </>}

                        <Route path="/transit" render={props => <Transit newScan={ourBarcode} {...props} />}/>

                        {props.auth.admin && <>
                            <Route path="/funds" component={FundsFlow}/>

                            <Route path="/settings/organization" component={Organization}/>
                            <Route path="/settings/employees" component={Employees}/>
                            <Route exact path="/settings/stocks" component={Stocks}/>
                            {props.app.users && props.app.stocks && props.app.stockusers
                                ? <Route exact path="/settings/stocks/:id" component={Stock}/>
                                : null
                            }
                            <Route path="/settings/config" component={Config}/>
                            <Route path="/settings/fields" component={Fields}/>
                            {/*<Route path="/settings/docs" component={Docs}/>*/}
                            <Route path="/integration/mango"
                                   component={() => <IntegrationMango
                                       org_id={props.auth.organization_id}
                                       vpbx_api_key={'секретный ключ'}
                                       vpbx_api_salt={'секретная соль'}
                                       // keyHandle={keyHandle}
                                       // saltHandle={saltHandle}
                                   />}
                            />
                            <Route path="/integration/sms_ru" component={IntegrationSmsRu}/>
                        </>}

                    </div>
                : null
            }

        </div>

    </>

}

const mapDispatchToProps = dispatch => bindActionCreators({
    init_user,
    upd_app
}, dispatch);

export default connect(state => state, mapDispatchToProps)(App);