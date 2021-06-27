import React, {Component, useEffect, useRef, useState} from "react";
import {Route} from "react-router-dom";
import {connect} from "react-redux";
import Context from "./context";

import "./index.css";
import Header from "./components/Header";
import Customers from "./components/Customers";
import {Customer} from "./components/common/Customer";
import Entities from "./components/Entities";
import Entity from "./components/Entity";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Authmodal from "./components/Authmodal";
import Settings from "./components/Settings";
import Subscribe from "./components/Subscribe";
import Queue from "./components/Queue";
import WebSocketAdapter from "./components/WebSocketAdapter";
import Orders from "./components/Orders";
import Arrival from "./components/Arrival";
import Consignments from "./components/Consignments";
import Transit from "./components/Transit";
import FundsFlow from "./components/FundsFlow";
import rest from "./components/Rest";
import GoodModal from "./components/GoodModal";
import {Barcodes} from "./components/Barcodes";
import Config from "./components/Settings/Config";
import Organization from "./components/Settings/Organization";
import Employees from "./components/Settings/Employees";
import Stocks from "./components/Settings/Stocks";
import Stock from "./components/Settings/Stock"
// import Docs from "./components/Settings/Docs";
import Fields from "./components/Settings/Fields";
import IntegrationMango from "./components/IntegrationMango";
import IntegrationSmsRu from "./components/IntegrationSmsRu";
import {Records} from "./components/Records";
import Docs from "./components/Settings/Docs";
import Typography from "@material-ui/core/Typography";
import Daily from "./components/Daily";
import {useSnackbar} from "notistack";

let barcode = ''

const App = props => {

    const [good, setGood] = useState({})
    const [barcodes, setBarcodes] = useState([])

    const {enqueueSnackbar} = useSnackbar()

    useEffect(() => {

        document.addEventListener('keydown', handleKeyPress)

    }, [])


    const handleKeyPress = e => {

        if (e.key === "Enter") {

            if (["112116", "103100"].includes(barcode.substr(0, 6)) ||
                barcode.length === 15) {

                // e.preventDefault();

                if (window.location.pathname === '/transit' && props.app.stock_id) {

                    rest('transit/' + props.app.stock_id + '/' + barcode, 'PATCH')
                        .then(res => {

                            if (res.status === 200) {

                                enqueueSnackbar('ok', {variant: 'success'})

                            }

                        })

                } else {

                    // setBarcodes([barcode])

                    rest("goods/" + barcode)
                        .then(res => {

                            if (res.ok && res.status === 200) {

                                setGood(res.body)

                            }
                        })

                }

            } else if (barcode.substr(0, 1) === "R" && barcode.length === 13) {

                // e.preventDefault();

                // let stock_id = +barcode.substr(1, 3);
                // let rem_id = +barcode.substr(4, 8);

                // console.log('stock_id', stock_id)
                // console.log('rem_id', rem_id)

            } else {

                console.log(barcode)

                enqueueSnackbar(window.location.pathname + ' ' + barcode)

            }

            barcode = ''

        } else {

            let newChar = String.fromCharCode(e.keyCode);

            if (newChar === "R") barcode = 'R'
            else if (e.keyCode > 47 && e.keyCode < 58) barcode = barcode + newChar

        }

    }

    const closeGoodModal = () => setGood({})

    return <>

        {barcodes && <Barcodes barcodes={barcodes}/>}

        <Header className={'d-print-none'}/>
        <div className="d-flex d-print-none" id="wrapper">
            <Sidebar/>
            <div id="sidebaredivider"/>
            {+props.auth.user_id
                ? <div className="m-2 p-2">

                    < Context.Provider
                        value={{
                            barcode
                        }}>
                        <Route exact path="/" component={
                            props.auth.expiration_time > Math.round(new Date().getTime() / 1000.0)
                                ? Main
                                : Subscribe
                        }/>

                        <Route path="/barcodes" component={Barcodes(['123456789012'])}/>
                        <Route exact path="/settings" component={Settings}/>
                        <Route path="/subscribe" component={Subscribe}/>

                        {props.app.stocks[0] && <>
                            <Route path="/daily" component={Daily}/>
                        </>}

                        <Route exact path="/customers" component={Customers}/>
                        <Route exact path="/customers/:id" component={Customer}/>
                        <Route exact path="/entities" component={Entities}/>
                        {props.app.fields.allElements &&
                        <Route exact path="/entities/:id" component={Entity}/>
                        }

                        <Route path="/call_records" component={Records}/>
                        <Route path="/orders" component={Orders}/>
                        {/*<Route path="/order" component={Order}/>*/}
                        <Route path="/queue" component={Queue}/>

                        {!props.app.stock_id || <>
                            <Route path="/arrival" component={Arrival}/>
                            <Route path="/consignments" component={Consignments}/>
                            <Route path="/transit" component={Transit}/>
                        </>}


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

                        <GoodModal
                            good={good}
                            close={closeGoodModal}
                        />

                        <WebSocketAdapter/>

                    </Context.Provider>
                </div>
                : <Authmodal/>
            }
        </div>
    </>

}

export default connect(state => state)(App);