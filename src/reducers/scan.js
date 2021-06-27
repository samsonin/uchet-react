import {SCAN} from "../constants";

const scan = (state = null, action) => {

    if (action.type === SCAN) {

        console.log('in reducers action = ', action)

    }

    return action.type === SCAN
        ? function(barcode) {
            console.log('got it!', barcode)
        }
        : state
}

export default scan;