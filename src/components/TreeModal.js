import React, {useState} from "react";
import {connect} from "react-redux";
import {MDBBtn, MDBContainer, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader} from "mdbreact";

import Tree from "./Tree";


const TreeModal = props => {

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

}

export default connect(state => (state), TreeModal)