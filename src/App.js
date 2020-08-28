import React, {Component} from "react";
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
import Authmodal from "./components/Authmodal";
import Settings from "./components/Settings";
import Subscribe from "./components/Subscribe";
import Queue from "./components/Queue";
import WebSocketAdapter from "./components/WebSocketAdapter";
import Arrival from "./components/Arrival";
import rest from "./components/Rest";
import GoodModal from "./components/GoodModal";
import {Barcodes} from "./components/Barcodes";
import Config from "./components/Settings/Config";
import {Organization} from "./components/Settings/Organization";
import Employees from "./components/Settings/Employees";
import Stocks from "./components/Settings/Stocks";
import Docs from "./components/Settings/Docs";
import Fields from "./components/Settings/Fields";
import IntegrationMango from "./components/IntegrationMango";
import IntegrationSmsRu from "./components/IntegrationSmsRu";
import {Records} from "./components/Records";

let barcode = '';

class App extends Component {

  state = {
    good: {},
  }

  componentDidMount() {

    document.addEventListener('keydown', this.handleKeyPress);

  }

  handleKeyPress = e => {

    if (e.key === "Enter") {

      if (["112116", "103100"].includes(barcode.substr(0, 6)) ||
        barcode.length === 15) {

        e.preventDefault();

        rest("goods/" + barcode).then(data => {
          if (data.ok) {

            data.body.barcode = barcode;
            this.setState({
              good: data.body,
            });

          }
        });

      } else if (barcode.substr(0, 1) === "R" &&
        barcode.length === 13) {

        e.preventDefault();

        let stock_id = +barcode.substr(1, 3);
        let rem_id = +barcode.substr(4, 8);

        console.log('stock_id', stock_id)
        console.log('rem_id', rem_id)

      }

      barcode = ''

    } else {

      let newChar = String.fromCharCode(e.keyCode);

      if (newChar === "R") barcode = 'R'
      else if (e.keyCode > 47 && e.keyCode < 58) barcode = barcode + newChar

    }

  }

  closeGoodModal = () => this.setState({good: {}});

  keyHandle = () => {

  }

  saltHandle = () => {

  }

  render() {
    return <>
      <Header/>
      <div className="d-flex" id="wrapper">
        <Sidebar/>
        <div className="d-print-none" id="sidebaredivider"/>
        {
          +this.props.auth.user_id > 0
            ? <div className="m-2 p-2">
              <Route exact path="/" component={
                this.props.auth.expiration_time > Math.round(new Date().getTime() / 1000.0) ?
                  Main : Subscribe
              }/>
              <Route path="/barcodes" component={Barcodes}/>
              <Route exact path="/settings" component={Settings}/>
              <Route path="/subscribe" component={Subscribe}/>
              <Route exact path="/customers" component={Customers}/>
              <Route exact path="/customers/:id" component={Customer}/>
              <Route exact path="/entities" component={Entities}/>
              <Route exact path="/entities/:id" component={Entity}/>
              <Route path="/call_records" component={Records}/>
              {/*<Route path="/orders" component={Orders}/>*/}
              {/*<Route path="/order" component={Order}/>*/}
              <Route path="/queue" component={Queue}/>
              <Route path="/arrival" component={Arrival}/>

              <Route path="/settings/organization" component={Organization}/>
              <Route path="/settings/employees" component={Employees}/>
              <Route path="/settings/stocks" component={Stocks}/>
              <Route path="/settings/config" component={Config}/>
              <Route path="/settings/config" component={Config}/>
              <Route path="/settings/fields" component={Fields}/>
              <Route path="/settings/docs" component={Docs}/>
              <Route path="/integration/mango"
                     component={() => <IntegrationMango
                       org_id={this.props.auth.organization_id}
                       vpbx_api_key={'секретный ключ'}
                       vpbx_api_salt={'секретная соль'}
                       keyHandle={this.keyHandle}
                       saltHandle={this.saltHandle}
                     />}
              />
              <Route path="/integration/sms_ru" component={IntegrationSmsRu}/>

              <GoodModal
                good={this.state.good}
                close={this.closeGoodModal}
              />

              <WebSocketAdapter/>

            </div>
            : <Authmodal/>
        }
      </div>

    </>
  }
}

export default connect((state) => state)(App);
