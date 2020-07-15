import React from "react";
import {bindActionCreators} from "redux";
import {enqueueSnackbar} from "../actions/actionCreator";
import {connect} from "react-redux";
import rest from "./Rest";

class Goods extends React.Component {

    state = {
        response: {}
    }

    componentDidMount() {

        rest(this.props.auth.jwt, 'goods/112116000000')
            .then(response => this.setState({response}))

    }

    render() {

        return <div>
            {this.state.response.toString()}
        </div>;

    }

}

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
}, dispatch);

export default connect(state => (state), mapDispatchToProps)(Goods);