import {bindActionCreators} from "redux";
import {closeSnackbar, enqueueSnackbar, upd_app, init_user} from "../actions/actionCreator";
import {connect} from "react-redux";
import {Component} from "react";

export default connect(state => (state), mapDispatchToProps)(class extends Component{

    render() {

        return '';

    }

});

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    closeSnackbar,
    init_user,
    upd_app
}, dispatch);