import React, { Component } from "react";
import { Route } from "react-router-dom";
import { connect } from "react-redux";

import "./index.css";
import Header from "./components/Header";
import Customers from "./components/Customers";
import Customer from "./components/Customer";
import Providers from "./components/Providers";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Authmodal from "./components/Authmodal";
import Settings from "./components/Settings";
import Subscribe from "./components/Subscribe";
import Queue from "./components/Queue";
import WebSocketAdapter from "./components/WebSocketAdapter";
import Arrival from "./components/Arrival";
import restRequest from "./components/Rest";
import GoodModal from "./components/GoodModal";
import Barcodes from "./components/Barcodes";
import Goods from "./components/Goods";
import {Config} from "./components/Settings/Config";
import {Organization} from "./components/Settings/Organization";
import {Employees} from "./components/Settings/Employees";
import Stocks from "./components/Settings/Stocks";
import Docs from "./components/Settings/Docs";
import Fields from "./components/Settings/Fields";
import IntegrationMango from "./components/IntegrationMango";
import IntegrationSmsRu from "./components/IntegrationSmsRu";

class App extends Component {
  state = {
    barcode: "",
    good: {},
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress);
  }

  closeGoodModal = () => this.setState({ good: {} });

  handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (
        ["112116", "103100"].includes(this.state.barcode.substr(0, 6)) ||
        this.state.barcode.length === 15
      ) {
        e.preventDefault();

        restRequest("goods/" + this.state.barcode).then((data) => {
          if (data.ok) {
            data.body.barcode = this.state.barcode;
            this.setState({
              good: data.body,
            });
          }
        });
      } else if (
        this.state.barcode.substr(0, 1) === "R" &&
        this.state.barcode.length === 13
      ) {
        e.preventDefault();

        let stock_id = +this.state.barcode.substr(1, 3);
        let rem_id = +this.state.barcode.substr(4, 8);

        // console.log('stock_id', stock_id)
        // console.log('rem_id', rem_id)
      }
      this.setState({ barcode: "" });
    } else {
      let newChar = String.fromCharCode(e.keyCode);
      if (newChar === "R") this.setState({ barcode: newChar });
      else if (e.keyCode > 47 && e.keyCode < 58)
        this.setState({ barcode: this.state.barcode + newChar });
    }

    closeGoodModal = () => this.setState({good: {}});

    handleKeyPress = e => {

        if (e.key === 'Enter') {

            if (['112116', '103100'].includes(this.state.barcode.substr(0, 6)) ||
                this.state.barcode.length === 15) {

                e.preventDefault();

                restRequest('goods/' + this.state.barcode)
                    .then(data => {
                        if (data.ok) {
                            data.body.barcode = this.state.barcode;
                            this.setState({
                                good: data.body
                            })
                        }
                    })

            } else if (this.state.barcode.substr(0, 1) === 'R' && this.state.barcode.length === 13) {

                e.preventDefault();

                let stock_id = +this.state.barcode.substr(1, 3);
                let rem_id = +this.state.barcode.substr(4, 8);

                // console.log('stock_id', stock_id)
                // console.log('rem_id', rem_id)

            }
            this.setState({barcode: ''})

        } else {

            let newChar = String.fromCharCode(e.keyCode)
            if (newChar === 'R') this.setState({barcode: newChar})
            else if (e.keyCode > 47 && e.keyCode < 58) this.setState({barcode: this.state.barcode + newChar})

        }

    }

    keyHandle = () => {

    }

    saltHandle = () => {

    }

    render() {
        return (
            <>
                <Header/>
                <div className="d-flex" id="wrapper">
                    <Sidebar/>
                    <div className="d-print-none" id="sidebaredivider"/>
                    <div className="m-2 p-2">
                        <Route exact path="/" component={
                            this.props.auth.expiration_time > Math.round(new Date().getTime() / 1000.0) ?
                                Main : Subscribe
                        }/>
                        <Route path="/barcodes" component={Barcodes}/>
                        <Route exact path="/settings" component={Settings}/>
                        <Route path="/subscribe" component={Subscribe}/>
                        <Route exact path="/customers" component={Customers}/>
                        <Route exact path="/customers/:id" component={Customer}/>
                        <Route path="/providers" component={Providers}/>
                        {/*<Route path="/orders" component={Orders}/>*/}
                        {/*<Route path="/order" component={Order}/>*/}
                        <Route path="/queue" component={Queue}/>
                        <Route path="/arrival" component={Arrival}/>
                        <Route path="/goods" component={Goods}/>
                        <Route path="/settings/organization" component={Organization}/>
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
                        <Route path="/integration/sms_ru" component={IntegrationSmsRu} />
                    </div>
                </div>
                <Authmodal/>
                <GoodModal
                    good={this.state.good}
                    close={this.closeGoodModal}
                />
              )}
            />
            <Route path="/integration/sms_ru" component={IntegrationSmsRu} />
          </div>
        </div>
        <Authmodal />
        <GoodModal good={this.state.good} close={this.closeGoodModal} />
        <WebSocketAdapter />
      </>
    );
  }
}

export default connect((state) => state)(App);
