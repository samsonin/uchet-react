import {MDBBtn, MDBContainer, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader} from "mdbreact";
import React, {useState} from "react";
import Tree from "./Tree";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {enqueueSnackbar} from "../actions/actionCreator";

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
}, dispatch);


export default connect(state => (state), mapDispatchToProps)(function ControlledTreeModal(props) {

    const [currentId, setCurrentId] = useState(() => props.initialCategoryId)

    return <MDBContainer>
        <MDBModal isOpen={props.isOpen} toggle={() => props.onClose(0)}>
            <MDBModalHeader toggle={() => props.onClose(0)}>
                Выбор категории</MDBModalHeader>
            <MDBModalBody>
                <Tree
                    initialId={props.initialCategoryId}
                    categories={props.app.categories}
                    onSelected={id => setCurrentId(id)}
                    finished={id => props.onClose(id)}
                />
            </MDBModalBody>
            <MDBModalFooter>
                <MDBBtn color="secondary" onClick={() => props.onClose(0)}>
                    Отмена
                </MDBBtn>
                <MDBBtn color="primary" onClick={() => props.onClose(currentId)}>
                    Сохранить
                </MDBBtn>
            </MDBModalFooter>
        </MDBModal>
    </MDBContainer>

});