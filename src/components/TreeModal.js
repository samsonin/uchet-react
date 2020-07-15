import {MDBBtn, MDBContainer, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader} from "mdbreact";
import React from "react";
import Tree from "./Tree";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {enqueueSnackbar} from "../actions/actionCreator";

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
}, dispatch);

let val = 0;

export default connect(state => (state), mapDispatchToProps)(function ControlledTreeModal(props) {

    const getValue = (v) => {
        val = v;
        props.onClose(val)
    }

    return <MDBContainer>
        <MDBModal isOpen={props.isOpen} toggle={() => props.onClose(false)}>
            <MDBModalHeader toggle={() => props.onClose(false)}>
                Выбор категории</MDBModalHeader>
            <MDBModalBody>
                <Tree id={props.id} categories={props.app.categories} onSelected={getValue}/>
            </MDBModalBody>
            <MDBModalFooter>
                <MDBBtn color="secondary" onClick={() => props.onClose(false)}>Отмена</MDBBtn>
                <MDBBtn color="primary" onClick={() => props.onClose(val)}>Сохранить</MDBBtn>
            </MDBModalFooter>
        </MDBModal>
    </MDBContainer>

});