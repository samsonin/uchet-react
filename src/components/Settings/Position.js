import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {upd_app} from "../../actions/actionCreator";


const mapDispatchToProps = dispatch => bindActionCreators({upd_app}, dispatch);

const Position = () => {

}

export default connect(state => (state), mapDispatchToProps)(Position)
