import {UPD_APP} from "../constants";
import {EXIT_APP} from "../constants";

let initialState = {
    balance: 0,
    stock_id: 0,
    stocks: [],
    users: [],
    organization: [],
    config: [],
    docs: [],
    fields: [],
    providers: [],
    categories: [],
}

const app = (state = JSON.parse(window.localStorage.getItem('app')) || initialState, action) => {

    if (action.type === UPD_APP) {

        let newState = {...state}

        if (typeof (action.data) === 'object') {

            Object.keys(action.data).map(k => {

                if (k === 'entities') {

                    newState.providers = action.data[k]

                //     newState.providers = newState.providers.map(p => {
                //
                //         return p.id === action.data[k][0].id
                //             ? action.data[k][0]
                //             : p
                //     })

                } else {

                    newState[k] = action.data[k]

                }

                return k;
            });

        }

        window.localStorage.setItem('app', JSON.stringify(newState));
        return newState;

    } else if (action.type === EXIT_APP) {

        window.localStorage.removeItem('app');
        return initialState

    } else {
        return state
    }

};

export default app;
