import React, {useEffect} from "react";
import {MDBModal, MDBModalBody, MDBModalHeader} from "mdbreact";

import rest from "../../components/Rest";


export const SaleModal = props => {

    useEffect(() => {

        if (props.action === 'продажа') {

            rest()

        }

    }, [props.row])

    return <MDBModal
        isOpen={props.isOpen}
        centered
    >
        <MDBModalHeader
            toggle={props.close}
        >
        </MDBModalHeader>

        <MDBModalBody>

            {JSON.stringify(props.row)}

        </MDBModalBody>
    </MDBModal>
}